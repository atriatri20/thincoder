/**
 * 2026-10-13-member-face-chat-box-core.test.mjs — member-face-chat 批 · **盒壳腿（二）**：核接口面 + 凭据助手 + 镜像面
 * （随批档归档；不入任何门——单测纪律：改动实施者写并跑本档）。
 *
 * 覆盖 = 核接口面（`core-run.mjs`——env 桥 ∥ 会话公读行形 ∥ 回合驱动四终态 ∥ 换机零本地态）
 * ∥ git 凭据助手（KD-SV-204——形/取件/端到端 ∥ **符号链接调用形**）
 * ∥ 镜像面（Dockerfile 语法可构建性「栈内检查，不实建」∥ 壳零 agent 循环 import 面断言
 * ∥ 入口判据 #1114 字面锁）。姊妹档 = `…-box.test.mjs`（协议码 ∥ 壳连挂 ∥ 拉仓执行面）。
 * 两档合计即原一档（超 800 行硬限拆档——member-face-chat 批 fix round 2）。
 *
 * 跑法（仓内）：`cd thincoder && node --test docs/batches/2026-10-13-member-face-chat-box-core.test.mjs`
 */
import test from "node:test"
import assert from "node:assert/strict"
import { mkdtempSync, readFileSync, rmSync, symlinkSync } from "node:fs"
import { createServer } from "node:http"
import { spawn } from "node:child_process"
import { tmpdir } from "node:os"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

import { BOX_PROVIDER, ShellError, createCoreRun, isToolFailureText, slotOf, withBoxProvider } from "../../thincoder-server/deploy/sandbox/member-shell/core-run.mjs"
import { fetchCredential, formatCredentialOutput, normalizeCredentialHost, parseCredentialInput } from "../../thincoder-server/deploy/sandbox/member-shell/git-cred.mjs"

const HERE = dirname(fileURLToPath(import.meta.url))
const SHELL_DIR = join(HERE, "..", "..", "thincoder-server", "deploy", "sandbox", "member-shell")
const DOCKERFILE = join(HERE, "..", "..", "thincoder-server", "deploy", "sandbox", "Dockerfile")
const DOCKERIGNORE = join(HERE, "..", "..", ".dockerignore")

// ========== 工具 ==========

/** 假核面束（core-run 测试——`@thincoder/core` 替身）。 */
function fakeCore(overrides = {}) {
  const calls = { assemble: [], apply: [], save: 0, run: [], prefs: [], newSession: 0 }
  const core = {
    loadConfig: () => ({ provider: {}, providers: [], providersList: [] }),
    assembleAgent: async (opts) => {
      calls.assemble.push(opts)
      return { config: {}, providers: [], _providerInvalid: false }
    },
    validateProvider: (agent) => agent,
    applySession: (agent, data, opts) => calls.apply.push({ slot: opts?.slot, data }),
    saveSession: () => { calls.save += 1 },
    loadSlotFile: () => ({ history: [], activeModel: "m1", effort: null, updatedAt: 111 }),
    listSlots: () => [],
    newSession: async () => { calls.newSession += 1; return 3 },
    loadManifest: () => ({ slots: {} }),
    slotPath: (cwd, slot) => join(cwd, `fake-slot-${slot}.json`),
    setSlotPrefs: (cwd, slot, patch) => { calls.prefs.push({ cwd, slot, patch }); return true },
    parseRelayPath: (text) => null,
    // 形态判据镜像核单源 `subagent-event.mjs`（`⟦ev⟧<小写名>` + RS 同现）
    parseSubagentEvent: (payload) => (/^⟦ev⟧[a-z]+\x1e/.test(String(payload)) ? { name: "turn" } : null),
    ...overrides,
  }
  return { core, calls }
}

const ENV = { OPENAI_BASE_URL: "http://server.test/v1/", OPENAI_API_KEY: "wk-1", TC_SERVER_URL: "http://server.test" }

// ========== B. core-run：读指令族 ∥ 回合驱动 ∥ 核接口假设 ==========

test("B1 withBoxProvider：env 桥（单渠道 server ∥ 默认模型面零设）", () => {
  const config = withBoxProvider({ provider: {}, providers: [{ name: "x" }], providersList: [], defaultModel: "x:y" }, ENV)
  assert.deepEqual(config.providers, [{ name: BOX_PROVIDER, baseURL: "http://server.test/v1", apiKey: "wk-1" }])
  assert.equal(config.providersList, config.providers)
  assert.equal(config.provider.name, "server")
  assert.equal(config.defaultModel, null)
  assert.equal(config.providerState, "ok")
})

test("B2 slotOf：复合 id / 裸号 / 脏值", () => {
  assert.equal(slotOf(7), 7)
  assert.equal(slotOf("7"), 7)
  assert.equal(slotOf("ws-12:7"), 7)
  assert.equal(slotOf("ws-12:0"), null)
  assert.equal(slotOf("abc"), null)
  assert.equal(slotOf(undefined), null)
})

test("B3 runTurn：帧序（delta/call/result/turn/usage）+ 落槽 + 核装配", async () => {
  const { core, calls } = fakeCore({
    assembleAgent: async (opts) => {
      calls.assemble.push(opts)
      return { config: {}, providers: [], _providerInvalid: false }
    },
    runAgent: async (agent, input, callbacks) => {
      calls.run.push({ input })
      callbacks.onToken("你好")
      callbacks.onToken("⟦ev⟧turn\x1e1\x1e3\x1ellm\x1e") // 事件 token ⇒ 剥离
      callbacks.onToken("[model]kimi") // 元数据 token ⇒ 剥离
      callbacks.onToolCall("read", { path: "a.md" }, "t1")
      callbacks.onToolResult("read", "OK: 内容", "t1")
      callbacks.onAgentTurn(1, 9)
      callbacks.onUsage({ prompt_tokens: 3, completion_tokens: 4, prompt_cache_hit_tokens: 0, prompt_cache_miss_tokens: 3 })
      return "done"
    },
  })
  const coreRun = createCoreRun({ env: ENV, cwd: "/workspace", core })
  const frames = []
  const end = await coreRun.runTurn({ sessionId: "ws:5", content: "提问", onFrame: (f) => frames.push(f) })
  assert.deepEqual(frames.map((f) => f.type), ["delta", "call", "result", "turn", "usage"])
  assert.equal(frames[0].text, "你好")
  assert.deepEqual(frames[1], { type: "call", id: "t1", name: "read", args: '{"path":"a.md"}' })
  assert.equal(frames[2].ok, true)
  assert.equal(calls.run[0].input, "提问")
  assert.deepEqual(calls.apply, [{ slot: 5, data: { history: [], activeModel: "m1", effort: null, updatedAt: 111 } }])
  assert.equal(calls.save, 1)
  assert.equal(end.status, "succeeded")
  assert.equal(end.calls, 1)
  // 盒 env 桥经装配注入（loadConfig deps）
  assert.equal(calls.assemble[0].deps.loadConfig().provider.name, "server")
  assert.equal(calls.assemble[0].cwd, "/workspace")
})

test("B4 runTurn：中止 ⇒ failed/aborted（且仍落槽）；预算/异常 ⇒ budget / model_error", async () => {
  // 中止：signal 已 aborted 且 runAgent 抛（核中止同形）
  const abortCore = fakeCore({
    runAgent: async (agent, input, callbacks, opts) => {
      assert.equal(opts.signal.aborted, true)
      throw Object.assign(new Error("The operation was aborted"), { name: "AbortError" })
    },
  })
  const controller = new AbortController()
  controller.abort()
  const abortRun = createCoreRun({ env: ENV, cwd: "/workspace", core: abortCore.core })
  const end1 = await abortRun.runTurn({ sessionId: 1, content: "x", signal: controller.signal, onFrame: () => {} })
  assert.equal(end1.status, "failed")
  assert.equal(end1.reason, "aborted")
  assert.equal(abortCore.calls.save, 1)

  // 预算：核 ContinueError（按 name 判）
  const budgetCore = fakeCore({ runAgent: async () => { const e = new Error("too many turns"); e.name = "ContinueError"; throw e } })
  const end2 = await createCoreRun({ env: ENV, cwd: "/workspace", core: budgetCore.core }).runTurn({ sessionId: 1, content: "x", onFrame: () => {} })
  assert.equal(end2.reason, "budget")

  // 模型错误：原文进 message
  const errCore = fakeCore({ runAgent: async () => { throw new Error("上游 502") } })
  const end3 = await createCoreRun({ env: ENV, cwd: "/workspace", core: errCore.core }).runTurn({ sessionId: 1, content: "x", onFrame: () => {} })
  assert.equal(end3.reason, "model_error")
  assert.equal(end3.message, "上游 502")

  // 模型未就绪（槽无模型 ∥ 渠道无效）⇒ 上抛 ShellError kind=model_error（人话进 message）
  const invalidCore = fakeCore({ validateProvider: (agent) => { agent._providerInvalid = true; agent._providerInvalidReason = "无可用模型" } })
  await assert.rejects(
    () => createCoreRun({ env: ENV, cwd: "/workspace", core: invalidCore.core }).runTurn({ sessionId: 1, content: "x", onFrame: () => {} }),
    (e) => e instanceof ShellError && e.kind === "model_error" && /模型未就绪/.test(e.message),
  )

  // 落槽失败 ⇒ 如实失败（不静默）
  const saveFailCore = fakeCore({ runAgent: async () => "done", saveSession: () => { throw new Error("disk full") } })
  const end4 = await createCoreRun({ env: ENV, cwd: "/workspace", core: saveFailCore.core }).runTurn({ sessionId: 1, content: "x", onFrame: () => {} })
  assert.equal(end4.status, "failed")
  assert.equal(end4.reason, "save_failed")
})

test("B5 runTurn：会话不存在 ⇒ ShellError not_found（零装配）", async () => {
  const { core, calls } = fakeCore({ loadSlotFile: () => null, loadManifest: () => ({ slots: {} }) })
  const coreRun = createCoreRun({ env: ENV, cwd: "/workspace", core })
  await assert.rejects(() => coreRun.runTurn({ sessionId: "ws:9", content: "x", onFrame: () => {} }), (e) => e instanceof ShellError && e.kind === "not_found")
  assert.equal(calls.assemble.length, 0)
})

test("B6 读指令族：list/read 行形与消息投射（§2.8 同形）", () => {
  const slotData = {
    history: [
      { role: "user", content: "你好", ts: 11 },
      { role: "assistant", content: "看文件", tool_calls: [{ id: "t1", type: "function", function: { name: "read", arguments: '{"path":"a.md"}' } }], ts: 12 },
      { role: "tool", tool_call_id: "t1", name: "read", content: "Error: 不存在", ts: 13 },
      { role: "assistant", content: "完成", ts: 14 },
      { role: "system", content: "（系统行——不入展示行）", ts: 15 },
    ],
    activeModel: "kimi-k3",
    effort: "high",
    updatedAt: 99,
  }
  const { core } = fakeCore({
    loadSlotFile: (_cwd, slot) => (slot === 4 ? slotData : null),
    listSlots: () => [{ slot: 4, firstMessage: "长".repeat(50), updatedAt: 99 }],
  })
  const coreRun = createCoreRun({ env: ENV, cwd: "/workspace", core })
  const rows = coreRun.listSessions({ runningSlot: 4 })
  assert.equal(rows.length, 1)
  assert.deepEqual(Object.keys(rows[0]).sort(), ["excerpt", "id", "model", "reasoning", "status", "updatedAt"])
  assert.equal(rows[0].id, 4)
  assert.equal(rows[0].model, "kimi-k3")
  assert.equal(rows[0].reasoning, "high")
  assert.equal(rows[0].status, "running")
  assert.equal(rows[0].excerpt.length, 40)

  const read = coreRun.readSession("ws:4")
  assert.equal(read.session.id, 4)
  assert.equal(read.session.excerpt, "你好")
  assert.deepEqual(read.messages.map((m) => [m.seq, m.role]), [[1, "user"], [2, "assistant"], [3, "tool"], [4, "assistant"]])
  assert.deepEqual(read.messages[1].data.toolCalls, [{ id: "t1", name: "read", args: '{"path":"a.md"}' }])
  assert.equal(read.messages[2].data.toolCallId, "t1")
  assert.equal(read.messages[2].data.ok, false) // 失败判据 = 渲染核 isToolFailure 同判
  assert.equal(read.messages[0].createdAt, 11)
  assert.equal(read.messages[3].data, null)
  // 槽不存在 ⇒ null
  assert.equal(coreRun.readSession("ws:77"), null)
})

test("B7 读指令族：create/update（换模型 ⇒ 档位清；设档；不存在 ⇒ null）", async () => {
  const { core, calls } = fakeCore({ loadManifest: () => ({ slots: { 3: { sessionId: "ws:3" } } }) })
  const coreRun = createCoreRun({ env: ENV, cwd: "/workspace", core })
  const created = await coreRun.createSession({ model: "glm-5.3" })
  assert.deepEqual(created, { id: 3 })
  assert.equal(calls.newSession, 1)
  assert.deepEqual(calls.prefs[0], { cwd: "/workspace", slot: 3, patch: { provider: "server", model: "glm-5.3" } })

  const updated = coreRun.updateSession({ sessionId: 3, model: "kimi-k3" })
  assert.equal(updated.session.id, 3)
  assert.deepEqual(calls.prefs[1].patch, { provider: "server", model: "kimi-k3", effort: null })

  coreRun.updateSession({ sessionId: 3, reasoning: "high" })
  assert.deepEqual(calls.prefs[2].patch, { effort: "high" })
  coreRun.updateSession({ sessionId: 3, reasoning: null })
  assert.deepEqual(calls.prefs[3].patch, { effort: null })

  // 服务器下行形（`slot`）同认（`member-routes.mjs` 实形）
  coreRun.updateSession({ slot: 3, model: "m3" })
  assert.deepEqual(calls.prefs[4].patch, { provider: "server", model: "m3", effort: null })

  const missing = fakeCore({ slotPath: () => "/nonexistent/slot.json", loadSlotFile: () => null, loadManifest: () => ({ slots: {} }) })
  const coreRun2 = createCoreRun({ env: ENV, cwd: "/workspace", core: missing.core })
  assert.equal(coreRun2.updateSession({ sessionId: 9, model: "m" }), null)

  // 空 patch / 写失败 ⇒ 如实失败（不静默降级）
  const badCore = fakeCore({ loadManifest: () => ({ slots: { 3: {} } }), setSlotPrefs: () => false })
  const coreRun3 = createCoreRun({ env: ENV, cwd: "/workspace", core: badCore.core })
  assert.throws(() => coreRun3.updateSession({ sessionId: 3 }), (e) => e instanceof ShellError && e.kind === "invalid_request")
  assert.throws(() => coreRun3.updateSession({ sessionId: 3, model: "m" }), (e) => e instanceof ShellError && e.kind === "write_failed")
})

test("B8 B72 盒内部分：零本地态（读面每次直取核件——卷回即回）", () => {
  let rows = [{ slot: 1, firstMessage: "a", updatedAt: 1 }]
  const { core } = fakeCore({ listSlots: () => rows })
  const coreRun = createCoreRun({ env: ENV, cwd: "/workspace", core })
  assert.equal(coreRun.listSessions()[0].id, 1)
  rows = [{ slot: 1, firstMessage: "a", updatedAt: 1 }, { slot: 2, firstMessage: "b", updatedAt: 2 }] // 模拟卷恢复/新会话落盘
  assert.equal(coreRun.listSessions().length, 2)
})

test("B9 读面：`[System reminder:` 行不算首条用户消息（excerpt 同核单源判）", () => {
  const { core } = fakeCore({
    loadSlotFile: () => ({
      history: [{ role: "user", content: "[System reminder: 时间 12:00]" }, { role: "user", content: "真问题" }],
      activeModel: "m1",
      effort: null,
      updatedAt: 5,
    }),
  })
  const coreRun = createCoreRun({ env: ENV, cwd: "/workspace", core })
  assert.equal(coreRun.readSession(2).session.excerpt, "真问题")
})

// ========== E. git 凭据助手（KD-SV-204）==========

test("E1 凭据输入/输出形（纯函数）", () => {
  const input = parseCredentialInput("protocol=https\nhost=gitee.com\n\n")
  assert.deepEqual(input, { protocol: "https", host: "gitee.com" })
  assert.equal(formatCredentialOutput({ username: "u", password: "p" }), "username=u\npassword=p\n\n")
  assert.equal(formatCredentialOutput({}), "")
  assert.equal(normalizeCredentialHost(" Gitee.COM "), "gitee.com")
})

test("E2 fetchCredential：取件形 / 404 零输出 / env 缺零调用", async () => {
  const seen = []
  const fetchImpl = async (url, init) => {
    seen.push({ url, init })
    return { ok: true, status: 200, json: async () => ({ username: "u", password: "p" }) }
  }
  const cred = await fetchCredential({ host: "gitee.com", baseUrl: "http://server.test/", apiKey: "wk-1", fetchImpl })
  assert.deepEqual(cred, { username: "u", password: "p" })
  assert.equal(seen[0].url, "http://server.test/api/box/credential")
  assert.equal(seen[0].init.headers.authorization, "Bearer wk-1")
  assert.deepEqual(JSON.parse(seen[0].init.body), { host: "gitee.com" })

  const notFound = await fetchCredential({ host: "gitee.com", baseUrl: "http://server.test", apiKey: "k", fetchImpl: async () => ({ ok: false, status: 404 }) })
  assert.equal(notFound, null)
  const noEnv = await fetchCredential({ host: "gitee.com", baseUrl: "", apiKey: "k", fetchImpl: async () => { throw new Error("不该被调用") } })
  assert.equal(noEnv, null)
})

test("E3 助手端到端：get 取件（本地假 server）∥ store 空操作", async () => {
  const requests = []
  const server = createServer((req, res) => {
    let body = ""
    req.on("data", (c) => { body += c })
    req.on("end", () => {
      requests.push({ method: req.method, url: req.url, authorization: req.headers.authorization, body })
      res.setHeader("content-type", "application/json")
      res.end(JSON.stringify({ username: "member-u", password: "tok-1" }))
    })
  })
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve))
  const { port } = server.address()
  const helper = join(SHELL_DIR, "git-cred.mjs")
  const runHelper = (action, stdin) =>
    new Promise((resolve) => {
      const child = spawn(process.execPath, [helper, action], {
        env: { ...process.env, TC_SERVER_URL: `http://127.0.0.1:${port}`, OPENAI_API_KEY: "wk-1" },
        stdio: ["pipe", "pipe", "ignore"],
      })
      let out = ""
      child.stdout.on("data", (c) => { out += c })
      child.on("close", (code) => resolve({ code, out }))
      child.stdin.end(stdin)
    })
  try {
    const got = await runHelper("get", "protocol=https\nhost=gitee.com\n\n")
    assert.equal(got.code, 0)
    assert.equal(got.out, "username=member-u\npassword=tok-1\n\n")
    assert.equal(requests.length, 1)
    assert.equal(requests[0].url, "/api/box/credential")
    assert.equal(requests[0].authorization, "Bearer wk-1")
    assert.deepEqual(JSON.parse(requests[0].body), { host: "gitee.com" })
    // 非 get ⇒ 空操作（零请求零输出——凭据零落盘）
    const stored = await runHelper("store", "protocol=https\nhost=gitee.com\nusername=u\npassword=p\n\n")
    assert.deepEqual(stored, { code: 0, out: "" })
    assert.equal(requests.length, 1)
  } finally {
    await new Promise((resolve) => server.close(resolve))
  }
})

test("E4 镜像内调用形：助手经符号链接跑 ≡ 直跑（KD-SV-53 / #1114 L7b 同判）", async (t) => {
  const tmp = mkdtempSync(join(tmpdir(), "box-cred-link-"))
  const link = join(tmp, "git-credential-thincoder")
  const requests = []
  const server = createServer((req, res) => {
    let body = ""
    req.on("data", (c) => { body += c })
    req.on("end", () => {
      requests.push({ url: req.url, body })
      res.setHeader("content-type", "application/json")
      res.end(JSON.stringify({ username: "member-u", password: "tok-1" }))
    })
  })
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve))
  const { port } = server.address()
  try {
    try {
      symlinkSync(join(SHELL_DIR, "git-cred.mjs"), link, "file")
    } catch (e) {
      // 平台无符号链接权（Windows 未开开发者模式）——静态判据由 F4 覆盖，此处不假绿
      t.skip?.(`符号链接不可用（${e?.code ?? e?.message}）`)
      console.log(`[读数] E4：符号链接不可用（${e?.code ?? e?.message}）——镜像内形态的静态锁见 F4`)
      return
    }
    const run = (path) =>
      new Promise((resolve) => {
        const child = spawn(process.execPath, [path, "get"], {
          env: { ...process.env, TC_SERVER_URL: `http://127.0.0.1:${port}`, OPENAI_API_KEY: "wk-1" },
          stdio: ["pipe", "pipe", "ignore"],
        })
        let out = ""
        child.stdout.on("data", (c) => { out += c })
        child.on("close", (code) => resolve({ code, out }))
        child.stdin.end("protocol=https\nhost=gitee.com\n\n")
      })
    const viaLink = await run(link)
    const viaDirect = await run(join(SHELL_DIR, "git-cred.mjs"))
    assert.deepEqual(viaLink, viaDirect) // 符号链接形 ≡ 直跑形（stdout ∥ 退码同形）
    assert.equal(viaLink.out, "username=member-u\npassword=tok-1\n\n")
    assert.equal(requests.length, 2)
    console.log("[读数] E4：符号链接调用 ≡ 直跑（取件输出同形——两请求入 server）")
  } finally {
    await new Promise((resolve) => server.close(resolve))
    rmSync(tmp, { recursive: true, force: true })
  }
})

// ========== F. Dockerfile 语法可构建性（栈内检查——不实建）+ 壳源断言 ==========

const KNOWN_INSTRUCTIONS = new Set(["FROM", "RUN", "CMD", "COPY", "ADD", "ENV", "ARG", "WORKDIR", "USER", "ENTRYPOINT", "EXPOSE", "VOLUME", "LABEL", "HEALTHCHECK", "SHELL", "STOPSIGNAL", "ONBUILD"])

/** Dockerfile 行解析（注释剥离 + 续行合并 ⇒ 指令序列）。 */
function parseDockerfile(text) {
  const logical = []
  let current = null
  for (const raw of String(text).split(/\r?\n/)) {
    const line = raw.trim()
    if (current === null && (line === "" || line.startsWith("#"))) continue
    if (current !== null) {
      current += `\n${line}`
      if (!line.endsWith("\\")) {
        logical.push(current)
        current = null
      }
      continue
    }
    if (line.endsWith("\\")) {
      current = line
      continue
    }
    logical.push(line)
  }
  if (current !== null) logical.push(current)
  return logical.map((entry) => {
    const firstLine = entry.split("\n")[0]
    const [verb] = firstLine.split(/\s+/)
    return { verb: verb.toUpperCase(), text: entry }
  })
}

test("F1 Dockerfile：指令集合法 + 契约行逐值（件位/核装/壳 COPY/助手/CMD）", () => {
  const text = readFileSync(DOCKERFILE, "utf8")
  const instructions = parseDockerfile(text)
  assert.ok(instructions.length > 0)
  for (const { verb } of instructions) assert.ok(KNOWN_INSTRUCTIONS.has(verb), `未知指令：${verb}`)
  assert.equal(instructions.filter((i) => i.verb === "FROM").length, 1)
  assert.match(text, /^FROM node:24-slim$/m)
  // 核装（构建期本地安装 ⇒ /opt/thincoder/app/node_modules/@thincoder/core——零 registry 依赖）
  assert.match(text, /COPY thincoder-core \/tmp\/build\/thincoder-core/)
  assert.match(text, /npm pack/)
  assert.match(text, /npm i --prefix \/opt\/thincoder\/app .*thincoder-core-\*\.tgz/)
  // 壳 COPY（件位契约 = /opt/thincoder/app/shell）
  assert.match(text, /COPY thincoder-server\/deploy\/sandbox\/member-shell \/opt\/thincoder\/app\/shell/)
  // 助手登记（PATH 名 + credential.helper）
  assert.match(text, /ln -sf \/opt\/thincoder\/app\/shell\/git-cred\.mjs \/usr\/local\/bin\/git-credential-thincoder/)
  assert.match(text, /git config --system credential\.helper thincoder/)
  // 运行面
  assert.match(text, /^WORKDIR \/workspace$/m)
  assert.match(text, /^USER 1000:1000$/m)
  const cmd = instructions[instructions.length - 1]
  assert.equal(cmd.verb, "CMD")
  assert.deepEqual(JSON.parse(cmd.text.slice("CMD ".length)), ["node", "/opt/thincoder/app/shell/index.mjs"])
})

test("F2 Dockerfile 文本：核取件与壳件同落件位（派生取件契约 §8）", () => {
  const text = readFileSync(DOCKERFILE, "utf8")
  // 上下文约定（构建命令 = 仓根；两处 COPY 源路径全限定）
  assert.match(text, /docker build -f thincoder-server\/deploy\/sandbox\/Dockerfile -t thincoder-sandbox:1 \./)
  // 上下文白名单须含核件（否则构建期 COPY 失败）
  const ignore = readFileSync(DOCKERIGNORE, "utf8")
  const lines = ignore.split(/\r?\n/).map((l) => l.trim())
  assert.ok(lines.includes("!thincoder-core"), ".dockerignore 须放行 thincoder-core")
  assert.ok(lines.includes("!thincoder-core/**"), ".dockerignore 须放行 thincoder-core/**")
  assert.ok(lines.indexOf("!thincoder-core") > lines.indexOf("!thincoder-server/**"))
})

test("F3 壳源：零 agent 循环自实现（import 面断言——AC-50④ 盒内部分）", () => {
  const files = ["index.mjs", "protocol.mjs", "core-run.mjs", "pull.mjs", "git-cred.mjs"]
  for (const file of files) {
    const text = readFileSync(join(SHELL_DIR, file), "utf8")
    // ① 顶层零核静态 import（核面只在 loadCore 动态取——镜像内才可解析）
    assert.doesNotMatch(text, /^import[^\n]*@thincoder\/core/m, `${file} 顶层出现核静态 import`)
    // ② 壳零自调模型（chat/completions 只应出现在核内）
    assert.doesNotMatch(text, /chat\/completions/, `${file} 出现自持模型调用`)
  }
  const coreRun = readFileSync(join(SHELL_DIR, "core-run.mjs"), "utf8")
  assert.match(coreRun, /import\("@thincoder\/core\/agent\.mjs"\)/) // 回合循环 = 核件
  assert.match(coreRun, /import\("@thincoder\/core\/agent\/assemble\.mjs"\)/) // 装配序 = 核件
  assert.match(coreRun, /import\("@thincoder\/core\/session\.mjs"\)/) // 会话读写 = 核件
  // 工具失败判据与渲染核同判（镜像内无渲染核 ⇒ 镜像式；本断言锁判据形态）
  assert.equal(isToolFailureText("Error: x"), true)
  assert.equal(isToolFailureText("(exit code 1)"), true)
  assert.equal(isToolFailureText("(killed: user interrupted)"), true)
  assert.equal(isToolFailureText("正文提到 (exit code 1) 不算"), false)
  assert.equal(isToolFailureText("(stopped)"), false)
})

test("F4 入口判据：realpathSync 解析形在案 ∥ 未解析变体零残留（#1114 字面锁——本舱两档）", () => {
  for (const file of ["git-cred.mjs", "index.mjs"]) {
    const text = readFileSync(join(SHELL_DIR, file), "utf8")
    assert.ok(text.includes("realpathSync(process.argv[1])"), `${file}：判据含 realpathSync(process.argv[1])`)
    assert.equal(/pathToFileURL\(\s*(?:resolve\()?process\.argv\[1\]/.test(text), false, `${file}：未解析变体零残留`)
  }
  console.log("[读数] F4：#1114 两档 realpathSync 判据在案 ∥ 未解析变体 0 残留")
})
