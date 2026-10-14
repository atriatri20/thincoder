#!/usr/bin/env node
/**
 * git-cred.mjs — 盒内 git 凭据助手（git credential helper——KD-SV-204 · member-face-chat 批·盒壳）
 *
 * 登记 = 镜像构建期（`deploy/sandbox/Dockerfile`）：`/usr/local/bin/git-credential-thincoder` → 本档，
 * `git config --system credential.helper thincoder` —— git 按名解析（拉取/推送共用单形，§3.6）。
 *
 * git 调用形：`git-credential-thincoder <get|store|erase>`；stdin = `key=value` 行（空行终止）。
 *   `get`   ⇒ 向 server 取件 `POST /api/box/credential { host }`（工作区 key 判权——`OPENAI_API_KEY`；
 *             服务器基址 = `TC_SERVER_URL`）⇒ stdout `username=…` / `password=…`
 *   `store` ⇒ 空操作（**凭据零落盘**——「用毕即清」：本档从不写任何持久面）
 *   `erase` ⇒ 空操作
 * 取件失败（未绑定 404 ∥ 网络失败 ∥ env 缺）⇒ **零输出、退出码 0**（git 走下一助手/干净失败；
 * 非交互由调用侧 `GIT_TERMINAL_PROMPT=0` 保证——见 `pull.mjs`）。
 * 密值纪律：凭据只驻本进程内存（stdout 一次写出）；**零日志**（本档不写 stdout/stderr 之外的任何面，
 * 错误不携值）。
 */
import { readFileSync, realpathSync } from "node:fs"
import { pathToFileURL } from "node:url"

/** stdin 形解析：`key=value` 行 ⇒ 对象（坏行跳过——容错）。 */
export function parseCredentialInput(text) {
  const out = {}
  for (const line of String(text ?? "").split(/\r?\n/)) {
    const i = line.indexOf("=")
    if (i <= 0) continue
    out[line.slice(0, i).trim()] = line.slice(i + 1)
  }
  return out
}

/** 输出形：git helper 协议 = `key=value` 行集合；两值皆空 ⇒ 空串（零输出）。 */
export function formatCredentialOutput({ username, password } = {}) {
  const lines = []
  if (typeof username === "string" && username !== "") lines.push(`username=${username}`)
  if (typeof password === "string" && password !== "") lines.push(`password=${password}`)
  return lines.length === 0 ? "" : `${lines.join("\n")}\n\n`
}

/** host 归一（取小写；`host:port` 保留端口——与 server 侧 host 键同形）。 */
export function normalizeCredentialHost(raw) {
  const host = String(raw ?? "").trim().toLowerCase()
  return host
}

/** 取件（依赖注入面 = fetchImpl —— 测试假件；缺省 = 全局 fetch）。 */
export async function fetchCredential({ host, baseUrl, apiKey, fetchImpl = globalThis.fetch, timeoutMs = 15000 }) {
  const base = String(baseUrl ?? "").replace(/\/+$/, "")
  if (!host || !base || !apiKey) return null
  try {
    const res = await fetchImpl(`${base}/api/box/credential`, {
      method: "POST",
      headers: { authorization: `Bearer ${apiKey}`, "content-type": "application/json" },
      body: JSON.stringify({ host }),
      signal: AbortSignal.timeout(timeoutMs),
    })
    if (!res.ok) return null // 未绑定（404）∥ 判权败（401）⇒ 零输出
    const data = await res.json()
    return data && typeof data === "object" ? data : null
  } catch {
    return null // 网络失败 ⇒ 零输出（不阻断 git 的失败分类）
  }
}

async function main() {
  const action = process.argv[2] ?? ""
  if (action !== "get") return // store ∥ erase ∥ 未知 ⇒ 空操作（凭据零落盘）
  let input = {}
  try {
    input = parseCredentialInput(readFileSync(0, "utf8"))
  } catch {
    return // stdin 不可读 ⇒ 零输出
  }
  const host = normalizeCredentialHost(input.host)
  const cred = await fetchCredential({ host, baseUrl: process.env.TC_SERVER_URL, apiKey: process.env.OPENAI_API_KEY })
  if (!cred) return
  const out = formatCredentialOutput(cred)
  if (out) process.stdout.write(out)
}

// 入口判据：`argv[1]` 先经 realpath 解析再比（KD-SV-53 / #1114 已锁形式）——镜像内本档恒经
// `/usr/local/bin/git-credential-thincoder` 符号链接调用（Dockerfile 登记）：argv[1] 为符号链接路径
// 而 `import.meta.url` 为真身路径，不解析 ⇒ 判据恒假 ⇒ 静默退出 0（取件链死）；不可解析 ⇒ 抛（显式，不静默）。
if (process.argv[1] && import.meta.url === pathToFileURL(realpathSync(process.argv[1])).href) {
  await main()
}
