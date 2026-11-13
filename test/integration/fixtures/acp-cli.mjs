/** 真 CLI ACP 客户端夹具：供各原生 Provider 的工具回放集成场景共用。 */
import assert from "node:assert/strict"
import { spawn } from "node:child_process"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const HERE = dirname(fileURLToPath(import.meta.url))
const CLI_ENTRY = join(HERE, "..", "..", "..", "thincoder-cli", "bin", "thincoder.mjs")
const TURN_TIMEOUT_MS = 90_000

/** 关掉 CLI 进程并等它真的退出；不退出则在宽限后强杀。 */
const stopProcess = (child) => new Promise((resolve) => {
  if (child.exitCode !== null || child.signalCode !== null) return resolve()
  const force = setTimeout(() => child.kill("SIGKILL"), 5_000)
  force.unref?.()
  child.once("close", () => { clearTimeout(force); resolve() })
  child.kill()
})

/** 起真 CLI 子进程；HOME/USERPROFILE 指向调用方给的隔离家目录。 */
export function startCli({ home, cwd }) {
  const child = spawn(process.execPath, [CLI_ENTRY, "acp"], {
    cwd,
    env: { ...process.env, HOME: home, USERPROFILE: home },
    stdio: ["pipe", "pipe", "pipe"],
  })
  const messages = []
  const pending = new Map()
  let buffer = ""
  let stderr = ""
  let nextId = 1
  let exited = false

  const send = (obj) => child.stdin.write(JSON.stringify(obj) + "\n")
  child.stdin.on("error", () => {})

  child.on("close", () => {
    exited = true
    for (const waiter of pending.values()) waiter({ error: { message: "CLI process exited before responding" } })
    pending.clear()
  })
  child.stderr.setEncoding("utf8")
  child.stderr.on("data", (chunk) => { stderr += chunk })
  child.stdout.setEncoding("utf8")
  child.stdout.on("data", (chunk) => {
    buffer += chunk
    for (let nl = buffer.indexOf("\n"); nl >= 0; nl = buffer.indexOf("\n")) {
      const line = buffer.slice(0, nl).trim()
      buffer = buffer.slice(nl + 1)
      if (!line) continue
      let msg
      try {
        msg = JSON.parse(line)
      } catch {
        continue
      }
      messages.push(msg)
      if (msg.method !== undefined && msg.id !== undefined) {
        const result = msg.method === "session/request_permission"
          ? { outcome: { outcome: "selected", optionId: "approve_once" } }
          : {}
        send({ jsonrpc: "2.0", id: msg.id, result })
        continue
      }
      if (msg.id !== undefined && pending.has(msg.id)) {
        const waiter = pending.get(msg.id)
        pending.delete(msg.id)
        waiter(msg)
      }
    }
  })

  const request = (method, params, timeoutMs = 120_000) => new Promise((resolve, reject) => {
    if (exited) return reject(new Error(`CLI 已退出，无法发送 ${method}｜stderr: ${stderr.slice(-1500)}`))
    const id = nextId++
    const timer = setTimeout(() => {
      pending.delete(id)
      reject(new Error(`ACP ${method} 超时 ${timeoutMs}ms｜stderr: ${stderr.slice(-1500)}`))
    }, timeoutMs)
    pending.set(id, (msg) => {
      clearTimeout(timer)
      resolve(msg)
    })
    send({ jsonrpc: "2.0", id, method, params })
  })

  const updates = () => messages
    .filter((m) => m.method === "session/update")
    .map((m) => m.params?.update)
    .filter(Boolean)

  return {
    child,
    request,
    updates,
    get stderr() { return stderr },
    textSince: (from) => updates().slice(from)
      .filter((u) => u.sessionUpdate === "agent_message_chunk" && u.content?.type === "text")
      .map((u) => String(u.content.text))
      .join(""),
    stop: () => stopProcess(child),
  }
}

/** initialize → session/new，返回槽号串。 */
export async function openSession(cli, cwd) {
  const init = await cli.request("initialize", { protocolVersion: 1, clientCapabilities: {} })
  assert.equal(init.error, undefined, `initialize 被拒：${JSON.stringify(init.error)}`)
  const created = await cli.request("session/new", { cwd, mcpServers: [] })
  assert.equal(created.error, undefined, `session/new 被拒：${JSON.stringify(created.error)}｜stderr: ${cli.stderr.slice(-1500)}`)
  assert.ok(created.result?.sessionId, `session/new 未给会话号：${JSON.stringify(created)}`)
  return String(created.result.sessionId)
}

/** 发一句话并等待回合结束，返回本回合的助手文本。 */
export async function say(cli, sessionId, text) {
  const from = cli.updates().length
  const res = await cli.request("session/prompt", { sessionId, prompt: [{ type: "text", text }] }, TURN_TIMEOUT_MS)
  assert.equal(res.error, undefined, `对话被拒：${JSON.stringify(res.error)}｜stderr: ${cli.stderr.slice(-2000)}`)
  assert.equal(res.result?.stopReason, "end_turn", `回合未正常收尾：${JSON.stringify(res.result)}`)
  return cli.textSince(from)
}
