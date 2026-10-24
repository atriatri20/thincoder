/**
 * ssh-vault.mjs — SSH 保存凭据单点（保存件读写 ∥ 系统级加密后端 ∥ 清单 / 删除 ∥ 可用性判定 ∥ 凭据窗获取链）。
 * 设计 = `docs/core/design/TOOLS.md` §6.22 ⑪（D-TO19 · 用户裁定 A+B）；台账 #1602。
 *
 * 档：`configDir/ssh-credentials.json`（**私档**——用户域，仓库零落点；与 ⑨ 非密档 `ssh-hosts.json`
 * 分档）。形 = `{ version: 1, entries: { "<host[:port]>": { user, scheme, blob, savedAt, lastUsedAt? } } }`
 * ——值只以**密文 blob** 落盘（明文零落盘，NS6）。
 *
 * 加密 = Windows DPAPI（经系统 PowerShell 宿主）：加密 `ConvertTo-SecureString -AsPlainText -Force`
 * → `ConvertFrom-SecureString`（无 `-Key` ⇒ DPAPI；Microsoft 文档逐字）；解密反之，Marshal 取明文。
 * 通道纪律（§6.22 ⑦）：脚本 = 常量字面（**值不入命令行**）；值以 base64 封包经子进程 **stdin**，
 * 密文 ∥ 解出明文经 **stdout**（hex ∥ base64——交换面全 ASCII）；子进程 env 删 `TC_SSH_SECRET`；
 * 超时有界（到点杀子进程 ⇒ 按解密失败走 fail-soft）。
 *
 * fail-soft（§6.22 ⑪，逐形分判）：档缺失 ⇒ 视同无（静默）；结构损坏（JSON 不可解析）⇒ 视同无 +
 * **原档原位不动**（下次成功保存整体覆盖重建）；不可解密 / 后端抛 ⇒ 条目保留（可能是暂时态）。
 * 删除面只涉本档（⑨ 非密记录不随删）。
 *
 * 观测缝（A 面四格判据落形——S1/S6/N6/B7）：模块级读次计数 = **读盘入口调用数**；
 * `_vaultReadsForTest()` / `_resetVaultReadsForTest()`——缺省生产行为不变，用例 `finally` 复位
 * （同族先例 = §6.14 测试态缝）。
 * 模块图：→ ssh-transport.mjs（`sshConfigDir` 测试缝单点）· ../i18n.mjs（窗词面单源）·
 * node:child_process / node:fs——叶子向、无环。
 */
import { spawn } from "node:child_process"
import { chmodSync, mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { t } from "../i18n.mjs"
import { sshConfigDir } from "./ssh-transport.mjs"

/** 保存件档名（与 ⑨ `ssh-hosts.json` 分档）。 */
export const VAULT_FILE = "ssh-credentials.json"
/** 档形版本（结构损坏判据之一）。 */
export const VAULT_VERSION = 1
/** 后端子进程超时（到点杀子进程 ⇒ 按解密失败走 fail-soft）。 */
export const VAULT_TIMEOUT_MS = 15_000

/** 加密脚本（常量字面——值经 stdin；`ConvertFrom-SecureString` 无 `-Key` ⇒ DPAPI）。 */
const PS_ENCRYPT = [
  "$ErrorActionPreference = 'Stop'",
  "$b64 = [Console]::In.ReadToEnd().Trim()",
  "$plain = [Text.Encoding]::UTF8.GetString([Convert]::FromBase64String($b64))",
  "$sec = ConvertTo-SecureString -String $plain -AsPlainText -Force",
  "[Console]::Out.Write((ConvertFrom-SecureString -SecureString $sec))",
].join("\n")
/** 解密脚本（常量字面——hex 经 stdin；解出明文 base64 经 stdout）。 */
const PS_DECRYPT = [
  "$ErrorActionPreference = 'Stop'",
  "$hex = [Console]::In.ReadToEnd().Trim()",
  "$sec = ConvertTo-SecureString -String $hex",
  "$bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($sec)",
  "try { $plain = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr) } finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr) }",
  "[Console]::Out.Write([Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($plain)))",
].join("\n")

// ─── 观测缝（读次 = 读盘入口调用数）──────────────────────────────────────────

let _reads = 0
export function _vaultReadsForTest() { return _reads }
export function _resetVaultReadsForTest() { _reads = 0 }

// ─── 后端（DPAPI 经系统 PowerShell；测试缝只换命令，生产缺省不变）────────────

let _backendCommand = null
let _backendPrefix = []
export function _setVaultBackendForTest(command, prefixArgs = []) {
  _backendCommand = command
  _backendPrefix = Array.isArray(prefixArgs) ? prefixArgs : []
}
export function _resetVaultBackendForTest() {
  _backendCommand = null
  _backendPrefix = []
}

const backendCommand = () => _backendCommand ?? "powershell.exe"
/** 可用性单点（§6.22 裁决 ④：本批仅 Windows DPAPI；缺席 ⇒ 保存不可用，连接照常）。 */
export const vaultAvailable = () => _backendCommand !== null || process.platform === "win32"

/** 后端往返（脚本常量 + 输入 stdin → stdout；超时杀进程）。 */
function runBackend(script, input) {
  return new Promise((resolve, reject) => {
    const env = { ...process.env }
    delete env.TC_SSH_SECRET // 防残留（新增链路零 env；§6.22 ⑦）
    const child = spawn(backendCommand(), [..._backendPrefix, "-NoProfile", "-NonInteractive", "-ExecutionPolicy", "Bypass", "-Command", script], {
      stdio: ["pipe", "pipe", "pipe"], windowsHide: true, env,
    })
    let out = ""
    let err = ""
    let done = false
    const finish = (fn, value) => { if (done) return; done = true; clearTimeout(timer); fn(value) }
    const timer = setTimeout(() => {
      try { child.kill() } catch { /* 尽力面 */ }
      finish(reject, new Error("vault backend timed out"))
    }, VAULT_TIMEOUT_MS)
    timer.unref?.()
    child.stdout.on("data", (d) => { out += d })
    child.stderr.on("data", (d) => { err += d })
    child.on("error", (e) => finish(reject, new Error(`vault backend unavailable: ${e?.message ?? String(e)}`)))
    child.on("exit", (code) => {
      if (code !== 0) return finish(reject, new Error(`vault backend failed (${code}): ${err.trim().slice(0, 200)}`))
      finish(resolve, out.trim())
    })
    child.stdin.on("error", () => { /* 退出竞态——判定面 = exit code */ })
    child.stdin.end(input)
  })
}

/** 加密：值 → hex 密文（值只经 stdin）。 */
async function encryptValue(value) {
  const b64 = Buffer.from(String(value), "utf8").toString("base64")
  const hex = await runBackend(PS_ENCRYPT, b64)
  if (!/^[0-9a-f]+$/i.test(hex)) throw new Error("vault backend returned an unexpected ciphertext")
  return hex
}

/** 解密：hex 密文 → 明文（坏密文 / 后端抛 ⇒ reject——调用面走 fail-soft）。 */
async function decryptBlob(blob) {
  const b64 = await runBackend(PS_DECRYPT, String(blob ?? "").trim())
  return Buffer.from(b64, "base64").toString("utf8")
}

// ─── 档（读 / 写 / 结构判定）────────────────────────────────────────────────

const vaultFile = () => join(sshConfigDir(), VAULT_FILE)
/** 读键单源（`host[:port]`，缺省 22；⑨ 记录面同引用）。 */
export const hostKey = (host, port) => (port && Number(port) !== 22 ? `${host}:${port}` : String(host))

/** 读盘入口（**唯一读次计数点**）。三态 = ok ∥ missing（静默视同无）∥ damaged（视同无，原档不动）。 */
function readVaultFile() {
  _reads += 1
  let raw
  try { raw = readFileSync(vaultFile(), "utf8") } catch (e) {
    return e?.code === "ENOENT" ? { state: "missing" } : { state: "damaged", unreadable: true }
  }
  try {
    const parsed = JSON.parse(raw)
    const entries = parsed?.entries
    if (parsed?.version !== VAULT_VERSION || !entries || typeof entries !== "object" || Array.isArray(entries)) {
      return { state: "damaged" }
    }
    return { state: "ok", entries }
  } catch { return { state: "damaged" } }
}

/** 写盘单点（结构损坏的重建 = 调用面给空表整体覆盖——原档在此之前不动）。 */
function writeVaultFile(entries) {
  mkdirSync(sshConfigDir(), { recursive: true })
  const body = JSON.stringify({ version: VAULT_VERSION, entries }, null, 2)
  writeFileSync(vaultFile(), body, { encoding: "utf8", mode: 0o600 })
  try { chmodSync(vaultFile(), 0o600) } catch { /* win32 无 POSIX mode——尽力面 */ }
}

/**
 * 查条目（单次读盘）：条目 `user` 与「本次有效 `user`」不符 ⇒ 视同无（⑪）。
 * @returns {{ state: "ok", key: string, entry: object } | { state: "missing"|"damaged"|"unreadable" }}
 */
export function getEntry(host, port, user) {
  const read = readVaultFile()
  if (read.state !== "ok") return { state: read.state }
  const key = hostKey(host, port)
  const entry = read.entries[key]
  if (!entry || typeof entry !== "object") return { state: "missing" }
  if (!user || entry.user !== user) return { state: "missing" }
  return { state: "ok", key, entry }
}

/**
 * 复用终段：读条目 → 解密。失败形分判（调用面各自回落窗 / 可读句）：
 * `missing`（静默）· `damaged`（可读句）· `unavailable`（后端缺席）· `undecryptable`（条目保留）。
 * @returns {Promise<{ state: "ok", key: string, value: string } | { state: string }>}
 */
export async function resolveSecret(host, port, user) {
  const got = getEntry(host, port, user)
  if (got.state !== "ok") return { state: got.state }
  if (!vaultAvailable()) return { state: "unavailable" }
  try {
    const value = await decryptBlob(got.entry.blob)
    if (!value.length) return { state: "undecryptable" } // 解出空值 = 不可用（不当空口令提交）
    return { state: "ok", key: got.key, value }
  } catch { return { state: "undecryptable" } }
}

/**
 * 保存（窗内勾选且认证成功后调用）：加密 → 整体写档（结构损坏的旧档在此被覆盖重建）。
 * @returns {Promise<{ ok: true, key: string } | { ok: false, reason: string }>}
 */
export async function saveEntry(host, port, { user, value } = {}) {
  if (!vaultAvailable()) return { ok: false, reason: "unavailable" }
  if (!String(value ?? "").length) return { ok: false, reason: "empty" }
  let blob
  try { blob = await encryptValue(value) } catch { return { ok: false, reason: "backend" } }
  try {
    const read = readVaultFile()
    const entries = read.state === "ok" ? { ...read.entries } : {}
    const key = hostKey(host, port)
    entries[key] = { user: user ?? null, scheme: "dpapi", blob, savedAt: new Date().toISOString() }
    writeVaultFile(entries)
    return { ok: true, key }
  } catch { return { ok: false, reason: "write" } }
}

/** 删除（`forget`）：条目不存在 ⇒ 幂等（existed:false）；结构损坏 ⇒ 原档不动（可读句）。 */
export function deleteEntry(host, port) {
  const key = hostKey(host, port)
  const read = readVaultFile()
  if (read.state === "missing") return { ok: true, existed: false }
  if (read.state !== "ok") return { ok: false, reason: "damaged" }
  if (!Object.hasOwn(read.entries, key)) return { ok: true, existed: false }
  const entries = { ...read.entries }
  delete entries[key]
  try { writeVaultFile(entries) } catch { return { ok: false, reason: "write" } }
  return { ok: true, existed: true }
}

/** `lastUsedAt` = 复用成功时更新；写失败 = 增益面静默（⑪）。 */
export function touchEntry(host, port) {
  const read = readVaultFile()
  if (read.state !== "ok") return
  const key = hostKey(host, port)
  const entry = read.entries[key]
  if (!entry || typeof entry !== "object") return
  try { writeVaultFile({ ...read.entries, [key]: { ...entry, lastUsedAt: new Date().toISOString() } }) } catch { /* 增益面静默 */ }
}

// ─── 凭据获取链（§6.22 ⑧：`ctx.onSecretInput` 窗）────────────────────────────

/** 凭据窗（§6.22 ⑧）：无 UI ⇒ 可读错（不挂起、不静默——`question.mjs` 无 UI 抛例同旨）；词面 = i18n 键。
 *  端侧回调自身拒绝（CLI `refuseSecretInput()` 形：抛可读句）⇒ 同族直出（`noUi` 标记 = 失败句不另加前缀）。
 *  `offerSave` ⇒ `fields` += `save`（`checkbox: true`——缺省不勾（opt-in）；提交值 = 布尔；核侧严格判 `=== true`）。
 *  拆档由 = 会话面超 500 顾问线（拆前 ≈513 行；设计 490 再拆线 ⇒ 按落点表候选拆分「凭据获取链迁入 `ssh-vault.mjs`」）。 */
export async function askCredential(ctx, { host, user, port, sessionId, offerSave = false }) {
  if (typeof ctx?.onSecretInput !== "function") {
    const err = new Error(t("ssh.no_ui"))
    err.noUi = true // 可读句直出（catch 面不另加前缀——失败句单源 = 核字典）
    throw err
  }
  const fields = [
    { name: "user", masked: false, required: false, prefill: user ?? "" },
    { name: "password", masked: true, required: true, prefill: "" },
  ]
  if (offerSave) fields.push({ name: "save", masked: false, required: false, prefill: false, checkbox: true })
  let res
  try {
    res = await ctx.onSecretInput({
      kind: "ssh-credential",
      sessionId: sessionId != null ? `ssh#${sessionId}` : null,
      host, user: user ?? null, port: port ?? null,
      fields,
      keys: { title: "ssh.credentialTitle", prompt: "ssh.credentialPrompt" },
    })
  } catch (e) {
    // 端侧拒绝（无交互面 / 载荷成形外）⇒ 同族可读句直出（不裹「connect failed」前缀）。
    const err = new Error(e?.message ?? String(e))
    err.noUi = true
    throw err
  }
  if (!res || typeof res !== "object") return null
  return res
}

// ─── 保存凭据管理面（§6.22 ⑫：`credentials` 只读 ∥ `forget` 写——核单点，三端同源）────────────

/** `credentials`（只读免审）：host / user / 保存时间 / 最近使用——**值零出现**（清单不含 blob）。 */
export function credentialsSsh() {
  const read = readVaultFile()
  if (read.state === "missing") return { text: "(no saved ssh credentials)" }
  if (read.state !== "ok") return { text: "saved ssh credentials: the store is damaged — the file was left untouched; delete it manually to reset the store" }
  const rows = Object.entries(read.entries)
    .map(([key, e]) => ({ key, user: e?.user ?? null, savedAt: e?.savedAt ?? null, lastUsedAt: e?.lastUsedAt ?? null }))
    .sort((a, b) => a.key.localeCompare(b.key))
  if (rows.length === 0) return { text: "(no saved ssh credentials)" }
  const head = vaultAvailable()
    ? "saved ssh credentials (encrypted with this Windows user account):"
    : "saved ssh credentials (the credential store is not available on this platform):"
  const lines = rows.map((r) => {
    const saved = r.savedAt ? ` \u00b7 saved ${r.savedAt}` : ""
    const used = r.lastUsedAt ? ` \u00b7 last used ${r.lastUsedAt}` : ""
    return `[${r.key}]${r.user ? ` user ${r.user}` : ""}${saved}${used}`
  })
  return { text: `${head}\n${lines.join("\n")}` }
}

/** `forget`（写动作——过既有审批门）：按 `host` + 可选 `port` 删条目；幂等；值零出现。
 *  删除 ⇒ 下次连接回落凭据窗（S8）；只涉保存档（⑨ 非密记录不随删）。 */
export function forgetSsh({ host, port } = {}) {
  const key = hostKey(host, port)
  const res = deleteEntry(host, port)
  if (!res.ok) return { error: `could not update the saved-credential store (${res.reason}) — the file was left untouched` }
  if (!res.existed) return { text: `no saved credential for ${key} — nothing to forget (the call is idempotent)` }
  return { text: `saved credential for ${key} deleted — the next connect asks in the credential window` }
}
