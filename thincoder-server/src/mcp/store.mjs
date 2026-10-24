/**
 * store.mjs — MCP 服务器清单存储（`mcp/MCP.md` §3.1 ∥ `store/STORE.md` §2 v24 段；server-mcp 批——台账 #1379）：
 * 行读写（增/删/改/查——库单源）∥ 形校验（名/传输三择/必填/类型）∥ 密文列读写（`store/credential-crypto.mjs`——
 * AES-256-GCM，`{ token?, headers?, env? }` 合一）∥ 核 config 形映射（`toCoreConfig`——核 `connectMcpServer`/`probeMcpServer` 单源入参）。
 *
 * 口径（§3.1/KD-SV-197/198）：`name` 唯一（工具前缀源）；`transport` 三值（stdio/http/ws）；**三传输列互斥 = 应用层校验**
 * （非本传输列置 NULL——`command`/`args_json` ∥ `url` ∥ `ws_url`）；敏感类 = `token` ∥ `headers` 值 ∥ `env` 值（入密文列——**零回显**，
 * 读面只出 `hasSecrets` 布尔）；`${env:VAR}` 引用值原样入密文列（核 `env-ref.mjs` 建连期解析）；编辑「字段缺席 = 不变 ∥ `null` = 清」
 * （敏感三键：空串/空对象 = **不变**——编辑窗「留空 = 不变」语义〔`webui/MCP.md` §2.2 ∥ §8 N4〕，清空唯一入口 = 显式 `null`；
 *  providers `apiKey: ""` = 清先例**不沿用于本面**——防控制台空串提交静默清凭据）；明文列（`command`/`args`）可含秘密 = 用户自担（披露项）。
 * 端点面 = `routes.mjs`；工具面 = `face.mjs`（本档纯函数面与加密 CRUD = 单元测试档直测）。
 */
import { HttpError } from "../gateway/errors.mjs"
import { credentialKeyPath, decryptSecret, encryptSecret, loadOrCreateCredentialKey } from "../store/credential-crypto.mjs"

/** 传输三值（v24 DDL CHECK 同集——`store/STORE.md` §2 v24 段）。 */
export const MCP_TRANSPORTS = Object.freeze(["stdio", "http", "ws"])

/** 服务器名上界（工具前缀源——与工具名量级同档；逾限 ⇒ 400）。 */
export const MCP_NAME_MAX = 100

/** 密文列 JSON 形（`{ token?, headers?, env? }`——三敏感面合一）。 */
const SECRET_KEYS = Object.freeze(["token", "headers", "env"])

/** 服务器名校验（trim 非空 ∥ 类型 ∥ 上界）。 */
function normalizeName(raw) {
  const name = typeof raw === "string" ? raw.trim() : ""
  if (name === "") throw new Error("服务器名不可为空（name）")
  if (name.length > MCP_NAME_MAX) throw new Error(`服务器名超长（≤ ${MCP_NAME_MAX} 字符；实长 ${name.length}）`)
  return name
}

/** 传输校验（三择）。 */
function normalizeTransport(raw) {
  if (typeof raw !== "string" || !MCP_TRANSPORTS.includes(raw)) {
    throw new Error(`传输方式非法：${JSON.stringify(raw ?? null)}（三择：${MCP_TRANSPORTS.join(" ∥ ")}）`)
  }
  return raw
}

/** 寻址字段校验（trim 非空 ∥ 类型——command ∥ url ∥ wsUrl 同法）。 */
function normalizeAddress(raw, field) {
  const text = typeof raw === "string" ? raw.trim() : ""
  if (text === "") throw new Error(`${field} 必填（${field === "command" ? "stdio：可执行命令" : "端点地址"}）`)
  return text
}

/** 参数数组校验（string[]；缺省 ∥ 空数组 ⇒ null）。 */
function normalizeArgs(raw) {
  if (raw === undefined || raw === null) return null
  if (!Array.isArray(raw)) throw new Error("args 须为字符串数组（stdio 参数）")
  if (raw.some((item) => typeof item !== "string")) throw new Error("args 须为字符串数组（含非字符串元素）")
  return raw.length === 0 ? null : [...raw]
}

/** 键值对象校验（`headers`/`env`——plain object，值须字符串；空对象 ⇒ null）。 */
function normalizeBag(raw, field) {
  if (raw === undefined || raw === null) return null
  if (typeof raw !== "object" || Array.isArray(raw)) throw new Error(`${field} 须为对象（键值对——值为字符串）`)
  const entries = Object.entries(raw)
  if (entries.some(([, value]) => typeof value !== "string")) throw new Error(`${field} 值须为字符串（键值对）`)
  return entries.length === 0 ? null : Object.fromEntries(entries)
}

/** 令牌校验（字符串；空串 ⇒ `null`——写入面意义：新增态 = 无秘密 ∥ 编辑态 = 「不变」判据（清空唯一入口 = 显式 `null`））。 */
function normalizeToken(raw) {
  if (raw === undefined || raw === null) return null
  if (typeof raw !== "string") throw new Error("token 须为字符串（Bearer 令牌）")
  return raw === "" ? null : raw
}

/** 启用位校验（布尔；缺省 true——`enabled` 缺省 = 启用，§3.2）。 */
function normalizeEnabled(raw, fallback) {
  if (raw === undefined) return fallback
  if (typeof raw !== "boolean") throw new Error("enabled 须为布尔（true/false）")
  return raw
}

/** 参数数组读面（`args_json` 文本 → string[] ∥ null——畸形行零抛，防御面）。 */
export function parseArgsJson(text) {
  if (typeof text !== "string" || text.trim() === "") return null
  try {
    const value = JSON.parse(text)
    return Array.isArray(value) && value.every((item) => typeof item === "string") ? value : null
  } catch {
    return null
  }
}

/** 密文列编码（空袋 ⇒ NULL；键序固定——幂等可复读）。 */
function encodeSecrets(secrets, { config = {} } = {}) {
  const bag = {}
  for (const key of SECRET_KEYS) {
    const value = secrets?.[key]
    if (value === undefined || value === null) continue
    if (key === "token") {
      if (typeof value === "string" && value !== "") bag.token = value
      continue
    }
    if (typeof value === "object" && !Array.isArray(value) && Object.keys(value).length > 0) bag[key] = value
  }
  if (Object.keys(bag).length === 0) return null
  const key = loadOrCreateCredentialKey(credentialKeyPath(config))
  return encryptSecret(JSON.stringify(bag), key)
}

/** 密文列解码（NULL ⇒ `{}`；形不合/篡改 ⇒ 抛——调用面人话，不静默回落）。 */
export function decodeSecrets(row, { config = {} } = {}) {
  if (row?.secret_cipher === null || row?.secret_cipher === undefined) return {}
  let bag
  try {
    const key = loadOrCreateCredentialKey(credentialKeyPath(config))
    bag = JSON.parse(decryptSecret(row.secret_cipher, key))
  } catch (e) {
    throw new Error(`MCP 凭据解密失败（${row?.name ?? row?.id}）：${e?.message ?? e}——请在「MCP」页重新录入凭据`)
  }
  if (bag === null || typeof bag !== "object" || Array.isArray(bag)) throw new Error(`MCP 凭据形非法（${row?.name ?? row?.id}）——请重新录入`)
  return bag
}

/** 核 config 形映射（§4 建连参形——`{ name, command, args, env }` ∥ `{ name, url, headers, token }` ∥ `{ name, wsUrl, headers, token }`；
 *  缺省项零字段——指纹口径逐值）。 */
export function coreConfigOf({ name, transport, command = null, args = null, url = null, wsUrl = null, headers = null, token = null, env = null } = {}) {
  if (transport === "stdio") return { name, command, ...(args ? { args } : {}), ...(env ? { env } : {}) }
  if (transport === "http") return { name, url, ...(headers ? { headers } : {}), ...(token ? { token } : {}) }
  return { name, wsUrl, ...(headers ? { headers } : {}), ...(token ? { token } : {}) }
}

/** 行 → 核 config 形（密文列解出后传入——§4）。 */
export function toCoreConfig(row, { config = {} } = {}) {
  const secrets = decodeSecrets(row, { config })
  return coreConfigOf({
    name: row.name,
    transport: row.transport,
    command: row.command,
    args: parseArgsJson(row.args_json),
    url: row.url,
    wsUrl: row.ws_url,
    headers: secrets.headers ?? null,
    token: secrets.token ?? null,
    env: secrets.env ?? null,
  })
}

/** 清单行读数（§3.2 GET 行形——`target` = 非秘密寻址形；`args` = stdio 明文参数（http/ws 行 `args_json` 为 NULL ⇒ null，零涉）；
 *  凭据零下发，唯一信号 = `hasSecrets` 布尔）。 */
export function mcpServerView(row) {
  const target = row.transport === "stdio" ? row.command : row.transport === "http" ? row.url : row.ws_url
  return {
    id: row.id,
    name: row.name,
    transport: row.transport,
    target: target ?? null,
    args: parseArgsJson(row.args_json),
    enabled: row.enabled === 1,
    hasSecrets: row.secret_cipher !== null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

/** 清单（库序——id 升序）。 */
export function listMcpServers(db) {
  return db.prepare("SELECT * FROM mcp_servers ORDER BY id").all().map(mcpServerView)
}

/** 启用行（工具面读源——逐回合读时读，§2.2）。 */
export function listEnabledMcpServers(db) {
  return db.prepare("SELECT * FROM mcp_servers WHERE enabled = 1 ORDER BY id").all()
}

/** 行 or 404（`not_found`）。 */
export function mcpServerRowOr404(db, id) {
  const row = db.prepare("SELECT * FROM mcp_servers WHERE id = ?").get(Number(id))
  if (!row) throw new HttpError("not_found", `MCP 服务器不存在：${id}`)
  return row
}

/** 撞名 ⇒ 人话（`name` 唯一）；余 ⇒ 原样抛。 */
function uniqueOrRethrow(e, name) {
  if (/UNIQUE constraint failed: mcp_servers\.name/.test(String(e?.message ?? ""))) {
    throw new Error(`该服务器名已存在：${name}（名唯一——工具前缀源）`)
  }
  throw e
}

/** 候选行形校验（三传输列互斥 + 本传输必填——§3.1 圈界）：出 = 落库列取值。 */
function candidateOf({ name, transport, command, args, url, wsUrl, enabled }) {
  const resolved = { name: normalizeName(name), transport: normalizeTransport(transport) }
  if (resolved.transport === "stdio") {
    resolved.command = normalizeAddress(command, "command")
    resolved.args = normalizeArgs(args)
    resolved.url = null
    resolved.wsUrl = null
  } else if (resolved.transport === "http") {
    resolved.url = normalizeAddress(url, "url")
    resolved.command = null
    resolved.args = null
    resolved.wsUrl = null
  } else {
    resolved.wsUrl = normalizeAddress(wsUrl, "wsUrl")
    resolved.command = null
    resolved.args = null
    resolved.url = null
  }
  resolved.enabled = normalizeEnabled(enabled, true)
  return resolved
}

/** 新增（形非法/撞名 ⇒ 抛——调用面 400 库零变；成 ⇒ 行）。`args`/`headers`/`token`/`env` 可缺省；`enabled` 缺省 = 启用。 */
export function insertMcpServer(db, { name, transport, command, args, url, wsUrl, headers, token, env, enabled, now = Date.now, config = {} } = {}) {
  const row = candidateOf({ name, transport, command, args, url, wsUrl, enabled })
  const secrets = {
    token: normalizeToken(token),
    headers: normalizeBag(headers, "headers"),
    env: normalizeBag(env, "env"),
  }
  const cipher = encodeSecrets(secrets, { config })
  const stamp = new Date(now()).toISOString()
  try {
    const info = db
      .prepare("INSERT INTO mcp_servers (name, transport, command, args_json, url, ws_url, secret_cipher, enabled, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
      .run(row.name, row.transport, row.command, row.args === null ? null : JSON.stringify(row.args), row.url, row.wsUrl, cipher, row.enabled ? 1 : 0, stamp, stamp)
    return db.prepare("SELECT * FROM mcp_servers WHERE id = ?").get(Number(info.lastInsertRowid))
  } catch (e) {
    uniqueOrRethrow(e, row.name)
  }
}

/** 改（字段缺席 = 不变 ∥ `null` = 清；传输切换 = 本传输必填 + 连带清列）；出 = `{ row, keys }`
 *  （`keys` = 变更键名——新旧行值比对，值永不入审计；成 ⇒ `updated_at` 刷新）。 */
export function updateMcpServer(db, id, patch = {}, { now = Date.now, config = {} } = {}) {
  const current = mcpServerRowOr404(db, id)
  const body = patch !== null && typeof patch === "object" && !Array.isArray(patch) ? patch : {}
  const fields = ["name", "transport", "command", "args", "url", "wsUrl", "headers", "token", "env", "enabled"]
  if (!fields.some((key) => Object.hasOwn(body, key))) throw new Error("改 MCP 服务器须携至少一键（字段缺席 = 不变）")
  const pick = (key, fallback) => (Object.hasOwn(body, key) ? body[key] : fallback)
  const beforeSecrets = decodeSecrets(current, { config })
  const before = {
    name: current.name,
    transport: current.transport,
    command: current.command,
    args: parseArgsJson(current.args_json),
    url: current.url,
    wsUrl: current.ws_url,
    enabled: current.enabled === 1,
    ...beforeSecrets,
  }
  // 敏感字段三键：缺席 = 不变 ∥ 显式 `null` = 清 ∥ **空串/空对象 = 不变**（编辑窗「留空」语义；
  //  清空唯一入口 = 显式 `null`——providers「空串 = 清」先例不沿用，防控制台空串提交静默清凭据）
  const secrets = { ...beforeSecrets }
  for (const key of SECRET_KEYS) {
    if (!Object.hasOwn(body, key)) continue
    const raw = body[key]
    if (raw === null) {
      secrets[key] = null // 显式清空
      continue
    }
    if (key === "token") {
      const text = normalizeToken(raw)
      if (text !== null) secrets.token = text
      continue
    }
    const bag = normalizeBag(raw, key)
    if (bag !== null) secrets[key] = bag
  }
  const next = candidateOf({
    name: pick("name", current.name),
    transport: pick("transport", current.transport),
    command: pick("command", current.command),
    args: pick("args", parseArgsJson(current.args_json)),
    url: pick("url", current.url),
    wsUrl: pick("wsUrl", current.ws_url),
    enabled: pick("enabled", current.enabled === 1),
  })
  // 传输切换：非本传输列连带清（候选已清）；同传输下显式 `null` 清列归 `normalizeAddress` 拒（必填不可清）
  // 密文列：袋值未变 ⇒ 原密文直取（AES-256-GCM iv 随机——重加密必改密文；N4 判据「库内密文逐值」）
  const cipher = JSON.stringify(secrets) === JSON.stringify(beforeSecrets) ? current.secret_cipher : encodeSecrets(secrets, { config })
  const after = { ...next, ...secrets }
  const keys = fields.filter((key) => JSON.stringify(before[key] ?? null) !== JSON.stringify(after[key] ?? null))
  try {
    db.prepare("UPDATE mcp_servers SET name = ?, transport = ?, command = ?, args_json = ?, url = ?, ws_url = ?, secret_cipher = ?, enabled = ?, updated_at = ? WHERE id = ?")
      .run(next.name, next.transport, next.command, next.args === null ? null : JSON.stringify(next.args), next.url, next.wsUrl, cipher, next.enabled ? 1 : 0, new Date(now()).toISOString(), current.id)
  } catch (e) {
    uniqueOrRethrow(e, next.name)
  }
  return { row: db.prepare("SELECT * FROM mcp_servers WHERE id = ?").get(current.id), keys }
}

/** 删（硬删——providers 先例；不存在 ⇒ 404）；出 = 被删行（审计取 `name`）。 */
export function removeMcpServer(db, id) {
  const row = mcpServerRowOr404(db, id)
  db.prepare("DELETE FROM mcp_servers WHERE id = ?").run(row.id)
  return row
}

/** 探活体解析（§3.2——`id` 在场 ⇒ 缺席/空字段一律回落库内行（含非秘密）；`transport` 仅无 `id` 草稿态必填；
 *  全量草稿（新建窗）亦可）；出 = 核 config 形（`coreConfigOf` 产物）。形不可解 ⇒ 抛（调用面 400）；行缺 ⇒ 404。 */
export function resolveProbeConfig(db, body = {}, { config = {} } = {}) {
  const src = body !== null && typeof body === "object" && !Array.isArray(body) ? body : {}
  const hasId = src.id !== undefined && src.id !== null && src.id !== ""
  const value = (key) => (src[key] === undefined || src[key] === null || src[key] === "" ? null : src[key])
  if (hasId) {
    const row = mcpServerRowOr404(db, src.id)
    const stored = decodeSecrets(row, { config })
    const args = value("args")
    const headers = value("headers")
    const env = value("env")
    const transport = value("transport") === null ? row.transport : normalizeTransport(src.transport)
    const command = value("command") === null ? row.command : normalizeAddress(src.command, "command")
    const url = value("url") === null ? row.url : normalizeAddress(src.url, "url")
    const wsUrl = value("wsUrl") === null ? row.ws_url : normalizeAddress(src.wsUrl, "wsUrl")
    if (transport === "stdio" && (typeof command !== "string" || command.trim() === "")) throw new Error("command 必填（stdio——库内行与提交合并后缺位）")
    if (transport === "http" && (typeof url !== "string" || url.trim() === "")) throw new Error("url 必填（http——库内行与提交合并后缺位）")
    if (transport === "ws" && (typeof wsUrl !== "string" || wsUrl.trim() === "")) throw new Error("wsUrl 必填（ws——库内行与提交合并后缺位）")
    return coreConfigOf({
      name: value("name") === null ? row.name : normalizeName(src.name),
      transport: normalizeTransport(transport),
      command,
      args: args === null ? parseArgsJson(row.args_json) : normalizeArgs(args),
      url,
      wsUrl,
      headers: headers === null ? stored.headers ?? null : normalizeBag(headers, "headers"),
      token: value("token") === null ? stored.token ?? null : normalizeToken(src.token),
      env: env === null ? stored.env ?? null : normalizeBag(env, "env"),
    })
  }
  const transport = normalizeTransport(src.transport)
  return coreConfigOf({
    name: value("name") === null ? undefined : normalizeName(src.name),
    transport,
    command: transport === "stdio" ? normalizeAddress(src.command, "command") : null,
    args: transport === "stdio" ? normalizeArgs(src.args) : null,
    url: transport === "http" ? normalizeAddress(src.url, "url") : null,
    wsUrl: transport === "ws" ? normalizeAddress(src.wsUrl, "wsUrl") : null,
    headers: normalizeBag(src.headers, "headers"),
    token: normalizeToken(src.token),
    env: normalizeBag(src.env, "env"),
  })
}
