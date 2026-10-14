/**
 * git-sources.mjs — git 源存储与校验（project/PROJECTS.md §5「源生命周期」∥ gateway/API.md §2.9 管理面源五行；
 * team-projects-permissions 批（B2）——台账 #1216）。
 *
 * 语义（§5/§13）：一行一源（名字 ∥ 平台 ∥ PAT 密文 ∥ 启停 ∥ 同步方式 ∥ 上次同步时间+结果 ∥ webhook 密钥密文）；
 * PAT/密钥**永不回显原文**（读面掩码 = `…` + 末 4——本件 `sourceView`）；名唯一（库 UNIQUE + 人话报错）；
 * 平台四值枚举；自建须基址；间隔 5–1440；`sync_mode='event'` **平台门 = 仅 github**（KD-SV-118——其余平台无成员事件）；
 * **gitee 范围三态**（`scope_kind` = `personal` ∥ `org` ∥ `enterprise`——建源必携 ∥ 个人范围必空 ∥ 组织/企业范围必填；
 * 非 gitee 携非空 ⇒ 400；KD-SV-151——gitee-namespace-kinds 批 · 台账 #1365）。
 * 密钥材料 = `store/credential-crypto.mjs` 单源（KD-SV-119）；删源防护（还挂项目 ⇒ 拒）阅读 = 本件。
 * 端点面 = `admin-routes.mjs`；本档为纯存储/形面（单元测试档直测）。
 */
import { randomBytes } from "node:crypto"

import { HttpError } from "../gateway/errors.mjs"
import { decryptSecret, encryptSecret } from "../store/credential-crypto.mjs"

/** 平台四值（§4 能力矩阵——四平台各 PAT 各源）。 */
export const PLATFORMS = Object.freeze(["gitee", "github", "gitlab", "selfhosted"])

/** 源名上限（§2.9 形：≤40——trim 后计）。 */
export const SOURCE_NAME_MAX = 40

/** 定时拉取间隔（分钟——§2.9 形：5–1440；缺省 60）。 */
export const INTERVAL_MIN_MINUTES = 5
export const INTERVAL_MAX_MINUTES = 1440
export const DEFAULT_INTERVAL_MINUTES = 60

/** 同步方式两值（§5 触发三径：`poll` = 定时拉取 ∥ `event` = 事件触发 + 定时对账）。 */
export const SYNC_MODES = Object.freeze(["poll", "event"])

/** gitee 范围三态（§4/KD-SV-151——`personal` ∥ `org` ∥ `enterprise`；非 gitee 恒 NULL）。 */
export const SCOPE_KINDS = Object.freeze(["personal", "org", "enterprise"])

/** 事件进路平台门（KD-SV-118——接收端 v1 = github；其余平台选中即拒）。 */
export const EVENT_PLATFORM = "github"

/** webhook 密钥字节数（§13 密钥面：32 字节随机 ⇒ hex）。 */
export const HOOK_SECRET_BYTES = 32

/** 掩码形（§2.9：`…` + 末 4——永不回显原文）。 */
export function maskHint(plain) {
  const text = typeof plain === "string" ? plain : ""
  if (text === "") return null
  return `…${text.slice(-4)}`
}

/** 源名归一（§2.9 形：trim 非空 ∥ ≤40）；不合 ⇒ 抛（调用面 400）。 */
export function normalizeSourceName(raw) {
  const name = typeof raw === "string" ? raw.trim() : ""
  if (name === "") throw new Error("源名不可为空")
  if (name.length > SOURCE_NAME_MAX) throw new Error(`源名超长（≤ ${SOURCE_NAME_MAX} 字符；实长 ${name.length}）`)
  return name
}

/** 平台归一（四值枚举；非串/表外 ⇒ 抛）。 */
export function normalizePlatform(raw) {
  const platform = typeof raw === "string" ? raw.trim() : ""
  if (!PLATFORMS.includes(platform)) {
    throw new Error(`平台非法：${JSON.stringify(raw ?? null)}（合法值：${PLATFORMS.join(" ∥ ")}）`)
  }
  return platform
}

/** 基址归一（自建平台必填；http(s) 形）；缺/空 ⇒ null（非自建 ⇒ 客户端用固定基址）。 */
export function normalizeBaseURL(raw) {
  if (raw === undefined || raw === null || String(raw).trim() === "") return null
  const text = String(raw).trim()
  let url
  try {
    url = new URL(text)
  } catch {
    throw new Error(`基址形非法：${text}（形 = http(s)://主机[:端口]）`)
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") throw new Error(`基址仅收 http(s)：${text}`)
  return `${url.protocol}//${url.host}${url.pathname.replace(/\/+$/, "")}`
}

/** scope 归一（组织/组标识——可空）。 */
export function normalizeScope(raw) {
  if (raw === undefined || raw === null) return null
  const text = String(raw).trim()
  return text === "" ? null : text
}

/** gitee 范围类型归一（三值；缺/空 ⇒ null（清空形——改源「切非 gitee」径）；表外 ⇒ 抛）。 */
export function normalizeScopeKind(raw) {
  if (raw === undefined || raw === null || String(raw).trim() === "") return null
  const kind = String(raw).trim()
  if (!SCOPE_KINDS.includes(kind)) throw new Error(`范围类型非法：${JSON.stringify(raw)}（合法值：${SCOPE_KINDS.join(" ∥ ")}）`)
  return kind
}

/** gitee 三态组合门（§4——建/改同判）：类型必选 ∧ 个人 ⇒ 范围必空 ∥ 组织/企业 ⇒ 范围必填。 */
function checkGiteeScope(kind, scope) {
  if (kind === null) throw new Error(`gitee 平台须选范围类型（${SCOPE_KINDS.join(" ∥ ")}）`)
  if (kind === "personal") {
    if (scope !== null) throw new Error("个人范围不带范围名——范围留空（或改选组织/企业）")
  } else if (scope === null) {
    throw new Error("组织/企业范围须填范围名（scope）")
  }
  return kind
}

/** 间隔归一（整数 5–1440；缺省 60）。 */
export function normalizeInterval(raw) {
  if (raw === undefined || raw === null || raw === "") return DEFAULT_INTERVAL_MINUTES
  const value = Number(raw)
  if (!Number.isInteger(value) || value < INTERVAL_MIN_MINUTES || value > INTERVAL_MAX_MINUTES) {
    throw new Error(`间隔非法：${JSON.stringify(raw)}（须为 ${INTERVAL_MIN_MINUTES}–${INTERVAL_MAX_MINUTES} 分钟的整数）`)
  }
  return value
}

/** 同步方式归一 + 平台门（§13——`event` 仅 github 可选）；不合 ⇒ 抛。 */
export function normalizeSyncMode(raw, platform) {
  const mode = raw === undefined || raw === null || raw === "" ? "poll" : String(raw).trim()
  if (!SYNC_MODES.includes(mode)) throw new Error(`同步方式非法：${JSON.stringify(raw)}（合法值：${SYNC_MODES.join(" ∥ ")}）`)
  if (mode === "event" && platform !== EVENT_PLATFORM) {
    throw new Error(`该平台无成员事件——同步方式仅「定时拉取」（事件接收端 = 仅 ${EVENT_PLATFORM}）`)
  }
  return mode
}

/** 启用旗归一（布尔 ∥ 0/1——界面行内切换形）；缺省 true。 */
export function normalizeEnabled(raw) {
  if (raw === undefined || raw === null) return true
  if (typeof raw === "boolean") return raw
  if (raw === 0 || raw === 1) return raw === 1
  throw new Error(`启用旗非法：${JSON.stringify(raw)}（布尔 true ∥ false）`)
}

/** PAT 归一（trim 非空——密文入库；明文只此一见）。 */
export function normalizeToken(raw) {
  const token = typeof raw === "string" ? raw.trim() : ""
  if (token === "") throw new Error("PAT 不可为空")
  return token
}

/** 密文 → 掩码提示（解不出 ⇒ null——键文件轮换/丢失时读面不崩）。 */
export function hintOf(cipher, key) {
  if (!cipher || !key) return null
  try {
    return maskHint(decryptSecret(cipher, key))
  } catch {
    return null
  }
}

/** 源读数行（§2.9 列形）：`{ id, name, platform, baseURL, scope, scopeKind, token{set,hint}, hookSecret{set,hint}, enabled, syncMode, intervalMinutes, lastSyncAt, lastSyncResult, tokenState, tokenCheckedAt, createdAt }`。 */
export function sourceView(row, { key = null } = {}) {
  let lastSyncResult = {}
  try {
    const parsed = JSON.parse(row.last_sync_result_json ?? "{}")
    lastSyncResult = parsed !== null && typeof parsed === "object" ? parsed : {}
  } catch {
    lastSyncResult = {}
  }
  return {
    id: row.id,
    name: row.name,
    platform: row.platform,
    baseURL: row.base_url,
    scope: row.scope,
    scopeKind: row.scope_kind ?? null,
    token: { set: Boolean(row.token_cipher), hint: hintOf(row.token_cipher, key) },
    hookSecret: { set: Boolean(row.hook_secret_cipher), hint: hintOf(row.hook_secret_cipher, key) },
    enabled: row.enabled === 1 || row.enabled === true,
    syncMode: row.sync_mode,
    intervalMinutes: row.interval_minutes,
    lastSyncAt: row.last_sync_at,
    lastSyncResult,
    tokenState: row.token_state,
    tokenCheckedAt: row.token_checked_at,
    createdAt: row.created_at,
  }
}

/** 源表行（id 序——管理面列表）。 */
export function listSources(db, { key = null } = {}) {
  return db.prepare("SELECT * FROM git_sources ORDER BY id").all().map((row) => sourceView(row, { key }))
}

/** 源行 or 404（`not_found`——统一信封）。 */
export function sourceRowOr404(db, id) {
  const row = db.prepare("SELECT * FROM git_sources WHERE id = ?").get(Number(id))
  if (!row) throw new HttpError("not_found", `git 源不存在：${id}`)
  return row
}

/** 唯一约束冲突 ⇒ 人话（源名唯一）；余 ⇒ 原样抛。 */
function uniqueOrRethrow(e, name) {
  if (/UNIQUE constraint failed: git_sources\.name/.test(String(e?.message ?? ""))) {
    throw new Error(`源名已存在：${name}（换一个名字）`)
  }
  throw e
}

/** 增源（形/唯一 ⇒ 抛——调用面 400 库零变；成 ⇒ 行）。`key` = 凭据键（PAT 入密）。 */
export function createSource(db, { input = {}, key, createdBy = null, now = Date.now() } = {}) {
  const name = normalizeSourceName(input.name)
  const platform = normalizePlatform(input.platform)
  const baseURL = normalizeBaseURL(input.baseURL)
  if (platform === "selfhosted" && baseURL === null) throw new Error("自建平台须填基址（形 = http(s)://主机[:端口]）")
  const scope = normalizeScope(input.scope)
  const scopeKind = normalizeScopeKind(input.scopeKind)
  if (platform === "gitee") checkGiteeScope(scopeKind, scope)
  else if (scopeKind !== null) throw new Error("范围类型仅 gitee 适用")
  const token = normalizeToken(input.token)
  const enabled = normalizeEnabled(input.enabled)
  const syncMode = normalizeSyncMode(input.syncMode, platform)
  const intervalMinutes = normalizeInterval(input.intervalMinutes)
  try {
    const info = db
      .prepare(
        `INSERT INTO git_sources (name, platform, base_url, scope, scope_kind, token_cipher, enabled, sync_mode, interval_minutes, created_by, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(name, platform, platform === "selfhosted" ? baseURL : null, scope, scopeKind, encryptSecret(token, key), enabled ? 1 : 0, syncMode, intervalMinutes, createdBy, new Date(now).toISOString())
    return db.prepare("SELECT * FROM git_sources WHERE id = ?").get(Number(info.lastInsertRowid))
  } catch (e) {
    uniqueOrRethrow(e, name)
  }
}

/** 改源（键级——出现键 = 应用；`token` 明填 = 替换 ∥ 缺省 = 不动）；出 = `{ row, keys }`（keys = 变更键名——审计面）。 */
export function updateSource(db, { id, input = {}, key, now = Date.now() } = {}) {
  const row = sourceRowOr404(db, id)
  const body = input !== null && typeof input === "object" ? input : {}
  const next = {
    name: Object.hasOwn(body, "name") ? normalizeSourceName(body.name) : row.name,
    platform: Object.hasOwn(body, "platform") ? normalizePlatform(body.platform) : row.platform,
    baseURL: Object.hasOwn(body, "baseURL") ? normalizeBaseURL(body.baseURL) : row.base_url,
    scope: Object.hasOwn(body, "scope") ? normalizeScope(body.scope) : row.scope,
    scopeKind: Object.hasOwn(body, "scopeKind") ? normalizeScopeKind(body.scopeKind) : row.scope_kind ?? null,
    enabled: Object.hasOwn(body, "enabled") ? normalizeEnabled(body.enabled) : row.enabled === 1,
    intervalMinutes: Object.hasOwn(body, "intervalMinutes") ? normalizeInterval(body.intervalMinutes) : row.interval_minutes,
  }
  if (next.platform === "gitee") {
    checkGiteeScope(next.scopeKind, next.scope) // 不携 ⇒ 沿行值；行值空 ⇒ 400（迁移后不可达的防御句）
  } else {
    if (Object.hasOwn(body, "scopeKind") && next.scopeKind !== null) throw new Error("范围类型仅 gitee 适用")
    next.scopeKind = null // 平台（携值 ∥ 行值）非 gitee ⇒ 旧值随清（「非 gitee 恒 NULL」）
  }
  if (Object.hasOwn(body, "syncMode")) next.syncMode = normalizeSyncMode(body.syncMode, next.platform)
  else if (next.platform !== row.platform) next.syncMode = normalizeSyncMode(row.sync_mode, next.platform) // 换平台 ⇒ 原方式过平台门复核
  else next.syncMode = row.sync_mode
  if (next.platform === "selfhosted" && next.baseURL === null) throw new Error("自建平台须填基址（形 = http(s)://主机[:端口]）")
  const keys = Object.keys(body).filter((k) => ["name", "platform", "baseURL", "scope", "scopeKind", "enabled", "syncMode", "intervalMinutes"].includes(k))
  const replacesToken = Object.hasOwn(body, "token") && body.token !== undefined && body.token !== null && String(body.token).trim() !== ""
  if (replacesToken) keys.push("token") // 掩码三态：留空 = 不携（审计只记真正替换的键）
  const tokenCipher = replacesToken ? encryptSecret(normalizeToken(body.token), key) : row.token_cipher
  if (keys.length === 0) throw new Error("改源须携至少一键（键级——出现键 = 应用）")
  try {
    db.prepare(
      `UPDATE git_sources SET name = ?, platform = ?, base_url = ?, scope = ?, scope_kind = ?, token_cipher = ?, enabled = ?, sync_mode = ?, interval_minutes = ? WHERE id = ?`,
    ).run(next.name, next.platform, next.platform === "selfhosted" ? next.baseURL : null, next.scope, next.scopeKind, tokenCipher, next.enabled ? 1 : 0, next.syncMode, next.intervalMinutes, row.id)
  } catch (e) {
    uniqueOrRethrow(e, next.name)
  }
  return { row: db.prepare("SELECT * FROM git_sources WHERE id = ?").get(row.id), keys }
}

/** 删源（不存在 ⇒ 404；**还挂项目 ⇒ 抛**——删源防护「尚有 N 个项目挂此源」，库零变；成 ⇒ 被删行）。 */
export function deleteSource(db, { id, now = Date.now() } = {}) {
  const row = sourceRowOr404(db, id)
  const attached = Number(db.prepare("SELECT COUNT(*) AS n FROM projects WHERE source_id = ?").get(row.id).n)
  if (attached > 0) throw new Error(`尚有 ${attached} 个项目挂此源（先删项目再删源）`)
  db.prepare("DELETE FROM git_sources WHERE id = ?").run(row.id)
  return row
}

/** 生成/轮换 webhook 密钥（§13：32 字节随机 ⇒ hex；出 = `{ row, plain }`——明文一次性，读面恒掩码）。 */
export function rotateHookSecret(db, { id, key, now = Date.now() } = {}) {
  const row = sourceRowOr404(db, id)
  const plain = randomBytes(HOOK_SECRET_BYTES).toString("hex")
  db.prepare("UPDATE git_sources SET hook_secret_cipher = ? WHERE id = ?").run(encryptSecret(plain, key), row.id)
  return { row: db.prepare("SELECT * FROM git_sources WHERE id = ?").get(row.id), plain }
}

/** 状态列随写（同步/体检面——`last_sync_at` = 尝试时刻（成敗同记）；`result` 形 = §5 算法 4）。 */
export function recordSyncResult(db, { id, at, result, tokenState = null }) {
  db.prepare("UPDATE git_sources SET last_sync_at = ?, last_sync_result_json = ?, token_state = COALESCE(?, token_state) WHERE id = ?").run(
    at,
    JSON.stringify(result ?? {}),
    tokenState,
    Number(id),
  )
  return db.prepare("SELECT * FROM git_sources WHERE id = ?").get(Number(id))
}

/** PAT 体检结果随写（§5 体检：`token_checked_at` + `token_state`——成 ok ∥ 败 auth ⇒ invalid；非 auth 败 ⇒ 状态列不动）。 */
export function recordCheckResult(db, { id, at, tokenState = null }) {
  db.prepare("UPDATE git_sources SET token_checked_at = ?, token_state = COALESCE(?, token_state) WHERE id = ?").run(
    new Date(at).toISOString(),
    tokenState,
    Number(id),
  )
  return db.prepare("SELECT * FROM git_sources WHERE id = ?").get(Number(id))
}
