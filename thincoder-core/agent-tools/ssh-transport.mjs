/**
 * ssh-transport.mjs — SSH 传输面单点（askpass 链 ∥ 子进程 ∥ 沉降 ∥ 遮蔽 ∥ 输出帽）。
 * 设计 = `docs/core/design/TOOLS.md` §6.22（D-TO17/D-TO18 · 台账 #1436）。
 *
 * 拆档由 = 机制档触 500 顾问线（§6.22 落点表「触 500 顾问线 ⇒ 实施轮先审拆分」）——本档收**运行面**
 * （与会话语义无关的传输原语），`ssh-session.mjs` 收**会话面**（池 / 生命周期 / 动作）。条目形
 * （entry）由 `ssh-session.mjs` 定义并持有；本档只经其字段工作（`buf` / `mask` / `_waiters` /
 * `promptRe` / `state` / `child` / `logStream` / `_notify` / `lastDataAt` / `bytes`）。
 *
 * - askpass 链：包装档（Win `.cmd` ∥ POSIX `.sh` 0700）→ `tools/ssh-askpass.mjs` → stdout；秘密只经
 *   ssh 子进程环境 `TC_SSH_SECRET`（零入参 / 零落盘 / 零回显；环境经 `nodeChildEnv` 单点补 Electron 旗标）。
 * - 沉降：静默窗 800 ms ∥ 会话提示符正则命中 ⇒ 就绪；硬超时 10 s ⇒ 部分输出 + 可读句（不静默挂起）。
 * - 遮蔽：写入的秘密对**捕获面与日志面**做字面移除（跨 chunk 切分：保留 `len-1` 尾缓冲）。
 * - 失败分类族（auth ∥ unreachable ∥ hostkey）照服务端 `src/sandbox/ssh.mjs` 同源判据。
 * 模块图：→ config.mjs（configDir 缺省）· tools/shared.mjs（解码 ∥ 清洗）· tools/node-child.mjs
 * （nodeChildEnv）——叶子向、无环（本档不 import `ssh-session.mjs`）。
 */
import { chmodSync, mkdirSync, unlinkSync, writeFileSync } from "node:fs"
import { spawn } from "node:child_process"
import { homedir } from "node:os"
import { fileURLToPath } from "node:url"
import { configDir } from "../config.mjs"
import { makeDecoder, sanitizeOutput } from "../tools/shared.mjs"
import { nodeChildEnv } from "../tools/node-child.mjs"

/** 静默窗（§6.22 ③）：到点无新输出 ⇒ 判定就绪。 */
export const SSH_SETTLE_MS = 800
/** 硬超时（§6.22 ③/⑥）：到点返回部分输出 + 可读句。 */
export const SSH_TIMEOUT_MS = 10_000
/** 单次返回帽（§6.22 ⑥）：保尾 + 截断注记；全量恒在 log。 */
export const SSH_RETURN_CAP = 8000
/** 保活缺省（§6.22 ④：`ServerAliveInterval=30`；测试态时间缝按 ms 传入后换算）。 */
export const SSH_KEEPALIVE_MS = 30_000
/** 秘密环境变量名（§6.22 ②「秘密传递」行）。 */
export const SECRET_ENV = "TC_SSH_SECRET"
/** 内存缓冲保留量（仅覆盖返回帽；全量恒在 log）。 */
export const BUF_KEEP_CHARS = 64 * 1024

/** 测试缝（单元测试沙箱——生产从不调用；`_setBgTaskLogDirForTest` 同式：一缝管三落点
 *  （log 目录 ∥ askpass 包装目录 ∥ 预填档）。`prefixArgs` = 夹具替身用（`<node> <夹具脚本> <ssh 参数…>`）。 */
let _sshBinary = null
let _sshArgPrefix = []
let _sshConfigDir = null
export function _setSshBinaryForTest(cmd, prefixArgs = []) {
  _sshBinary = cmd
  _sshArgPrefix = Array.isArray(prefixArgs) ? prefixArgs : []
}
export function _setSshConfigDirForTest(dir) { _sshConfigDir = dir }
export const sshBinary = () => _sshBinary ?? "ssh"
export const sshArgPrefix = () => _sshArgPrefix
export const sshConfigDir = () => _sshConfigDir ?? configDir

// ─── askpass 链（包装档 ∥ 环境 ∥ 命令形）────────────────────────────────────

/** 包装档运行期写入（内容零秘密——仅路径；Win `.cmd` ∥ POSIX `.sh` 0700）。 */
export function writeAskpassWrapper(id) {
  const dir = `${sshConfigDir()}/ssh-askpass`
  mkdirSync(dir, { recursive: true, mode: 0o700 })
  const helper = fileURLToPath(new URL("../tools/ssh-askpass.mjs", import.meta.url))
  const node = process.execPath
  const win = process.platform === "win32"
  const file = `${dir}/askpass-${process.pid}-${id}.${win ? "cmd" : "sh"}`
  // `.cmd` 首行 `@echo off`：cmd 中介默认回显命令行——回显会占掉 ssh 读回的**首行**
  // （`readpass.c` 只取首行 ⇒ 口令错位为空串）；POSIX `.sh` 无此面。
  writeFileSync(file, win ? `@echo off\r\n"${node}" "${helper}" %*\r\n` : `#!/bin/sh\nexec "${node}" "${helper}" "$@"\n`, { mode: 0o700 })
  try { chmodSync(file, 0o700) } catch { /* win32 无 POSIX mode——尽力面 */ }
  return file
}

/** 包装档清理（关闭 / 终结时尽力面——内容零秘密，残留无实害）。 */
export function unlinkAskpass(entry) {
  try { if (entry.askpassFile) unlinkSync(entry.askpassFile) } catch { /* 尽力面 */ }
  entry.askpassFile = null
}

/** ssh 子进程环境：askpass 链 + 秘密（无秘密时**显式清除**——防父进程残留变量误喂）。 */
export function buildSshEnv({ wrapper, secret }) {
  const env = { ...process.env, SSH_ASKPASS: wrapper, SSH_ASKPASS_REQUIRE: "force" }
  // 占位 DISPLAY：OpenSSH < 8.4 无 `SSH_ASKPASS_REQUIRE`（RHEL 8 / CentOS 8 代）——无 DISPLAY 时
  // askpass 不被放行（`readpass.c` allow_askpass 判据）；占位后新旧两代同走 askpass（§6.22 NS1 注）。
  if (!env.DISPLAY) env.DISPLAY = ":0"
  if (secret != null) env[SECRET_ENV] = secret
  else delete env[SECRET_ENV]
  return nodeChildEnv(env)
}

/** `~` 展开（`identityFile` 记录 / 参数——`~/.ssh/id_ed25519` 同式；非 `~` 开头原样）。 */
function expandHome(file) {
  const raw = String(file ?? "")
  if (!/^~(?=$|[\\/])/.test(raw)) return raw
  return `${homedir()}${raw.slice(1)}`
}

/** 会话命令形（§6.22 ⑤）：`-tt` 强制远端 PTY + 保活三件 + 单提示；`port`/`user` 未给 ⇒ 不下发。
 *  `identityFile` 显式给出 / 记录有值 ⇒ `-i <路径>`（追加候选身份，不夺本机配置与 agent 的既有尝试序列）。
 *  预探 = `NumberOfPasswordPrompts=0`（password ∥ keyboard-interactive 两径同被短路——
 *  `sshconnect2.c` `userauth_passwd` / `userauth_kbdint` 两处同判 `attempt++ >= n`；私钥口令提示
 *  亦被短路：`load_identity_file` 循环 `i <= number_of_password_prompts`）；带密 = 1（单提示）。 */
export function buildSshArgs({ host, user, port, probe, identityFile = null, keepAliveMs = SSH_KEEPALIVE_MS }) {
  const keepAliveS = Math.max(1, Math.round((Number(keepAliveMs) || SSH_KEEPALIVE_MS) / 1000))
  return [
    "-tt",
    "-o", "ConnectTimeout=10",
    "-o", `ServerAliveInterval=${keepAliveS}`,
    "-o", "ServerAliveCountMax=4",
    "-o", `NumberOfPasswordPrompts=${probe ? 0 : 1}`,
    ...(port ? ["-p", String(port)] : []),
    ...(identityFile ? ["-i", expandHome(identityFile)] : []),
    user ? `${user}@${host}` : host,
  ]
}

// ─── 遮蔽（§6.22 ⑦）────────────────────────────────────────────────────────

/** 秘密遮蔽过滤器：字面移除 + `len-1` 尾缓冲（跨 chunk 切分不泄；尾至沉降冲涮）。 */
export function createMask() {
  const secrets = []
  let tail = ""
  let keep = 0
  return {
    add(secret) {
      const s = String(secret ?? "")
      if (!s || secrets.includes(s)) return
      secrets.push(s)
      keep = Math.max(keep, s.length - 1)
    },
    push(text) {
      let out = tail + String(text ?? "")
      for (const s of secrets) out = out.split(s).join("")
      if (out.length <= keep) { tail = out; return "" }
      const emit = out.slice(0, out.length - keep)
      tail = out.slice(out.length - keep)
      return emit
    },
    /** 沉降时冲涮尾缓冲：**只放行非秘密前缀段**（尾内最长可疑后缀一律扣下——整尾 ∥ 移位前缀
     *  都不出返回面；扣下的至多 `秘密长-1` 字符，代价 < 前缀外泄）。 */
    flush() {
      const t = tail
      tail = ""
      if (!t) return ""
      let cut = 0
      for (const s of secrets) {
        const max = Math.min(t.length, s.length - 1)
        for (let L = 1; L <= max; L++) if (t.endsWith(s.slice(0, L))) cut = Math.max(cut, L)
      }
      return cut ? t.slice(0, t.length - cut) : t
    },
  }
}

// ─── 子进程（起跑 ∥ 双流汇入 ∥ 退出）────────────────────────────────────────

/** 悬挂 chunk 双流汇入（遮蔽 → log ∥ 缓冲 ∥ 面板 → 唤醒沉降等待者）。 */
function handleChunk(entry, text) {
  if (!text) return
  entry.bytes += text.length
  try { entry.logStream?.write(text) } catch { /* log 写失败不进语义——尽力面 */ }
  entry.buf += text
  if (entry.buf.length > BUF_KEEP_CHARS) {
    entry.buf = entry.buf.slice(entry.buf.length - BUF_KEEP_CHARS)
    entry.bufDropped = true
  }
  entry._notify?.(text)
  entry.lastDataAt = Date.now()
  for (const w of [...entry._waiters]) w("data")
}

/** 子进程挂载（双流解码 ∥ 退出 ∥ spawn 错误——探连与会话同径）。 */
export function attachChild(entry, child) {
  entry.child = child
  const outDecoder = makeDecoder()
  const errDecoder = makeDecoder()
  const feed = (d) => handleChunk(entry, entry.mask.push(sanitizeOutput(d)))
  const flush = () => {
    const rest = sanitizeOutput(outDecoder(Buffer.alloc(0), true)) + sanitizeOutput(errDecoder(Buffer.alloc(0), true))
    if (rest) feed(Buffer.from(rest, "utf8"))
  }
  child.stdout.on("data", (d) => feed(outDecoder(d)))
  child.stderr.on("data", (d) => feed(errDecoder(d)))
  // stdin 无 error 监听 ⇒ 对端刚死时写入的异步 EPIPE 会以未处理 'error' 事件逸出（uncaughtException）。
  // 同族先例：CLI `tui/clipboard.mjs` ∥ `mcp/transport-stdio.mjs` 同式吞 EPIPE。
  child.stdin?.on("error", () => { /* 写失败由 send ∥ secret_input 的调用面回读；此处仅防未处理事件 */ })
  child.on("error", (error) => {
    if (entry.child !== child) return // 旧进程（已被重起替换）——判定面不采
    entry.spawnError = error?.message ?? String(error)
    for (const w of [...entry._waiters]) w("exit")
  })
  child.on("exit", (code, exitSignal) => {
    if (entry.child !== child) return // 旧进程（探连 → 带密会话的重起面）——事件不污染新连接判定
    entry.exitInfo = { code, signal: exitSignal }
    flush()
    // 已就绪（会话态）⇒ 远端断开：终态 + 墓碑（E5）；探连期的退出由 connect 判定径处置（不在此收尾）。
    if (entry.state === "ready" && entry.closing !== true) entry.onRemoteExit?.(entry)
    for (const w of [...entry._waiters]) w("exit")
  })
}

/** 起跑一条 ssh（探连 ∥ 带密会话同径）。重起（探连 → 带密会话）⇒ 判定面复位：exitInfo ∥
 *  spawnError 属**上一次**进程（残留会让新连接的成功判定被误读成「已退出」）。 */
export function spawnSession(entry, { user, port, secret, identityFile = null, keepAliveMs = SSH_KEEPALIVE_MS }) {
  entry.exitInfo = null
  entry.spawnError = null
  const child = spawn(sshBinary(), [...sshArgPrefix(), ...buildSshArgs({ host: entry.host, user, port, probe: secret == null, identityFile, keepAliveMs })], {
    stdio: ["pipe", "pipe", "pipe"],
    windowsHide: true,
    detached: process.platform !== "win32",
    env: buildSshEnv({ wrapper: entry.askpassFile, secret }),
  })
  attachChild(entry, child)
  return child
}

// ─── 沉降（§6.22 ③）────────────────────────────────────────────────────────

function promptHit(entry) {
  return Boolean(entry.promptRe && entry.promptRe.test(entry.buf))
}

/** 等到「就绪判据」成立：提示符命中 ∥ 静默窗到点 ∥ 硬超时 ∥ 退出 ∥ 中止（返回 reason）。 */
export function waitSettled(entry, { timeoutMs = SSH_TIMEOUT_MS, signal = null } = {}) {
  return new Promise((resolve) => {
    let done = false
    let quietTimer = null
    const deadline = Date.now() + Math.max(1, Number(timeoutMs) || SSH_TIMEOUT_MS)
    const finish = (reason) => {
      if (done) return
      done = true
      clearTimeout(quietTimer)
      clearTimeout(deadlineTimer)
      signal?.removeEventListener("abort", onAbort)
      entry._waiters.delete(onEvent)
      resolve(reason)
    }
    const arm = () => {
      clearTimeout(quietTimer)
      quietTimer = setTimeout(() => finish(promptHit(entry) ? "prompt" : "silence"), SSH_SETTLE_MS)
    }
    const onEvent = (kind) => {
      if (kind === "exit") return finish("exited")
      if (promptHit(entry)) return finish("prompt")
      arm()
    }
    const onAbort = () => finish("aborted")
    const deadlineTimer = setTimeout(() => finish("timeout"), Math.max(0, deadline - Date.now()))
    if (entry.state === "dead" || entry.state === "closed") return finish("exited")
    if (signal?.aborted) return finish("aborted")
    signal?.addEventListener("abort", onAbort, { once: true })
    entry._waiters.add(onEvent)
    onEvent("data") // 起点：先查提示符，否则起静默窗（「send 后 800 ms 无新输出」从本刻起算）
  })
}

/** 就绪结论注记（§6.22 ③：静默 ∥ 提示符 ∥ 超时——超时带 id / host / 已等时长，不静默挂起）。 */
export function settleNote(entry, reason, waitedMs) {
  if (reason === "prompt") return "settled (prompt matched)"
  if (reason === "silence") return "settled (silence window)"
  if (reason === "timeout") return `not settled after ${Math.round(waitedMs / 100) / 10}s (${idLabel(entry)} @ ${entry.host}) — partial output above (silence window or promptPattern never hit)`
  if (reason === "aborted") return `(interrupted — partial output above; the session stays open: ${idLabel(entry)} @ ${entry.host})`
  if (reason === "exited") return `${idLabel(entry)} @ ${entry.host} ${entry.state === "ready" ? "ended (the remote closed the connection)" : "has stopped"}`
  return String(reason)
}

// ─── 输出面（缓冲 ∥ 帽 ∥ 状态行）────────────────────────────────────────────

export const idLabel = (entry) => `ssh#${entry.id}`

/** 取出未读输出（遮蔽尾缓冲先冲涮）。 */
export function drain(entry) {
  const flushed = entry.mask.flush()
  if (flushed) entry.buf += flushed
  const text = entry.buf
  entry.buf = ""
  const dropped = entry.bufDropped === true
  entry.bufDropped = false
  return { text, dropped }
}

/** 返回帽（保尾 + 截断注记——§6.22 ⑥）。 */
export function capText(text, max = SSH_RETURN_CAP, entry = null) {
  if (text.length <= max) return text
  const omitted = text.length - max
  const where = entry?.logPath ? ` — full output in the log: ${entry.logPath}` : ""
  return `[... first ${omitted} chars omitted (return cap ${max})${where}]\n${text.slice(text.length - max)}`
}

/** 状态行冠形（§6.22 动作表末行）：每返回首行。 */
export function statusLine(entry) {
  const idle = Math.max(0, Math.round((Date.now() - entry.lastActivityAt) / 1000))
  return `[ssh (${idLabel(entry)}) ${entry.host} — ${entry.state} · idle ${idle}s]`
}

/** 体形（空 ⇒ `(no output)`；非空转义——`bash-async.mjs renderDigest` 同式）。 */
export function bodyText(text) {
  return text.trim() ? escapeXmlLite(text.replace(/\s+$/u, "")) : "(no output)"
}

/** XML 转义（`agent/helpers.mjs escapeXml` 同式；本档为零依赖注入面自持小实现，避免
 *  transport → agent 反向依赖）。 */
function escapeXmlLite(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;")
}

// ─── 失败分类（照服务端分类族：auth ∥ unreachable ∥ fingerprint_changed）─────

export function classifyFailure(stderr) {
  const text = String(stderr ?? "")
  if (/REMOTE HOST IDENTIFICATION HAS CHANGED|Host key verification failed|host key .* revoked|requested strict checking/i.test(text)) {
    return { kind: "hostkey", message: "host key verification failed — the key changed or your local ssh config requires strict checking; known_hosts is never rewritten by this tool" }
  }
  if (/Permission denied|Too many authentication failures|Authentication failed/i.test(text)) {
    return { kind: "auth", message: "authentication rejected" }
  }
  if (/Connection timed out|Connection refused|No route to host|Could not resolve hostname|Connection closed by|Network is unreachable|connect to host .* failure/i.test(text)) {
    return { kind: "unreachable", message: "host unreachable or timed out" }
  }
  return null
}

/** 失败句（含 id ∥ host；尾附探测现场末段——诊断面）。 */
export function failureText(entry, cls, extra = "") {
  const at = `(${idLabel(entry)} @ ${entry.host})`
  const tail = entry.buf.trim() ? `\n${escapeXmlLite(entry.buf.trim().slice(-600))}` : ""
  return `Error: ssh ${cls ? cls.message : "connection failed"} ${at}${extra}${tail}`
}
