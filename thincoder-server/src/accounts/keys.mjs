/**
 * keys.mjs — 团队 key 面（accounts/ACCOUNTS.md §1）：签发 ∥ 校验 ∥ 吊销 ∥ 轮转（页面与 CLI 共用）。
 *
 * 形：`sk-tc-` + 32 字节随机（base64url——43 字符）；存储 = `sha256(明文)` hex（单列唯一——库内无明文）；
 * 明文仅签发时回显一次（此后只留提示形 `sk-tc-ab12cd…wxyz`）。
 * 命名（§1.1——me-keys 批）：签发可携名（各创建路径共用默认名助手——trim 后空 ⇒ `key-N` 落库 ∥ ≤40 字符）；
 * 自助面 active 上限 = `MAX_ACTIVE_KEYS`（计数函数归本档；判归路由——轮转 ∥ CLI 不受限）。
 * 校验 = 逐请求查库（KD-SV-11——无缓存；吊销下一次请求即判）；成员行携 `modelQuotas`（分模型覆盖）
 * 与 `modelDisables`（模型禁用集）——均随鉴权行零查询（KD-SV-38 ∥ KD-SV-42）。
 * 管理面 sk（§1 管理面 sk 条 ∥ `agent/ADMIN-AGENT.md` §16.3）：名常量 `AGENT_KEY_NAME` ∥ `ensureAgentKey`（登录 ensure 幂等——
 * 非 admin 零动作）∥ `agentKeyOf`（管理会话出口凭据读数）∥ `issueKey({ keepPlain: true })`（v19 `key_plain` 唯一写面——
 * 服务端即消费方；落面语义 = `store/STORE.md` §2 v19 段）。
 */
import { createHash, randomBytes } from "node:crypto"

import { HttpError } from "../gateway/errors.mjs"
import { parseModelDisables, parseModelQuotas } from "./members.mjs"

export const KEY_PREFIX = "sk-tc-"

/** 自助面 active 上限（§1.1——第 21 把签发 ⇒ 400；轮转 ∥ CLI 不受限）。 */
export const MAX_ACTIVE_KEYS = 20

/** 管理面 sk 名（§1 管理面 sk 条 ∥ `agent/ADMIN-AGENT.md` §16.3——常量单源：登录 ensure 的寻址名；
 *  经网关链回环的管理会话出口凭据 = 该行 `key_plain`）。 */
export const AGENT_KEY_NAME = "admin-agent"

/** key 名称上限（§1.1——trim 后；超长 ∥ 非字符串 ⇒ 400）。 */
const MAX_KEY_NAME_LENGTH = 40

/** 签发：新明文（调用方负责一次性回显）。 */
export function generateApiKey() {
  return KEY_PREFIX + randomBytes(32).toString("base64url")
}

/** 提示形（列表/清单用——无明文）。 */
export function keyHint(plain) {
  return `${plain.slice(0, 12)}…${plain.slice(-4)}`
}

/** 存储形：sha256(明文) hex。 */
export function hashKey(plain) {
  return createHash("sha256").update(plain).digest("hex")
}

/** 校验（KD-SV-11）：active 命中 ⇒ `{ keyId, memberId, member }`（成员行携 `modelQuotas` ∥ `modelDisables`——随行）；
 *  未知 ∥ 吊销一律 null（不区分——防信息泄露）。 */
export function verifyKey(db, plain) {
  if (typeof plain !== "string" || !plain.startsWith(KEY_PREFIX)) return null
  const row = db
    .prepare(
      `SELECT k.id AS key_id, k.member_id, m.username, m.name, m.role, m.model_quotas_json, m.model_disabled_json
       FROM api_keys k JOIN members m ON m.id = k.member_id
       WHERE k.key_hash = ? AND k.status = 'active'`,
    )
    .get(hashKey(plain))
  if (!row) return null
  return {
    keyId: row.key_id,
    memberId: row.member_id,
    member: {
      id: row.member_id,
      username: row.username,
      name: row.name,
      role: row.role,
      modelQuotas: parseModelQuotas(row.model_quotas_json),
      modelDisables: parseModelDisables(row.model_disabled_json),
    },
  }
}

/** 名称校验/归一（各创建路径共用）：空缺省 ⇒ null（落默认名）∥ 非字符串 ⇒ 400 ∥ trim 后空 ⇒ null（默认名）∥
 *  trim 后 >40 字符 ⇒ 400（§1.1）。 */
export function normalizeKeyName(name) {
  if (name === null || name === undefined) return null
  if (typeof name !== "string") throw new HttpError("invalid_request_error", `名称须为字符串：${JSON.stringify(name)}`)
  const trimmed = name.trim()
  if (trimmed === "") return null
  if (trimmed.length > MAX_KEY_NAME_LENGTH) {
    throw new HttpError("invalid_request_error", `名称超长（≤ ${MAX_KEY_NAME_LENGTH} 字符；实长 ${trimmed.length}）`)
  }
  return trimmed
}

/** 默认名助手（各创建路径共用——§1.1「命名落位」）：`key-N`——N = 该成员签发序号（含吊销行——单调不复用）。 */
function nextDefaultKeyName(db, memberId) {
  const n = Number(db.prepare("SELECT COUNT(*) AS n FROM api_keys WHERE member_id = ?").get(memberId).n)
  return `key-${n + 1}`
}

/** 签发一行（新行——轮转不复用旧行）：`{ id, plain, hint, name }`；携名（§1.1——trim 后空 ⇒ 默认名 `key-N` 落库）。
 *  `keepPlain`（§1 管理面 sk 条——v19 列）：**唯一明文落库写面**（NULL = 常规 key——服务端不留明文）。 */
export function issueKey(db, memberId, { name = null, keepPlain = false, now = Date.now() } = {}) {
  const plain = generateApiKey()
  const hint = keyHint(plain)
  const resolved = normalizeKeyName(name) ?? nextDefaultKeyName(db, memberId)
  const ts = new Date(now).toISOString()
  const info = keepPlain
    ? db
      .prepare("INSERT INTO api_keys (member_id, key_hash, key_hint, name, key_plain, status, created_at) VALUES (?, ?, ?, ?, ?, 'active', ?)")
      .run(memberId, hashKey(plain), hint, resolved, plain, ts)
    : db
      .prepare("INSERT INTO api_keys (member_id, key_hash, key_hint, name, status, created_at) VALUES (?, ?, ?, ?, 'active', ?)")
      .run(memberId, hashKey(plain), hint, resolved, ts)
  return { id: Number(info.lastInsertRowid), plain, hint, name: resolved }
}

/** 管理面 sk 读数（§1 管理面 sk 条 ∥ §16.3——管理会话出口的凭据单源）：该成员 active 的 `admin-agent` 行；
 *  `key_plain` 缺（NULL/空 —— 非常规路径产物）⇒ null（调用侧按「凭据缺位」人话收尾）；出 = `{ id, name, hint, plain }`。 */
export function agentKeyOf(db, memberId) {
  if (memberId === null || memberId === undefined) return null
  const row = db
    .prepare("SELECT * FROM api_keys WHERE member_id = ? AND name = ? AND status = 'active' ORDER BY id DESC LIMIT 1")
    .get(Number(memberId), AGENT_KEY_NAME)
  if (!row || typeof row.key_plain !== "string" || row.key_plain === "") return null
  return { id: row.id, name: row.name, hint: row.key_hint, plain: row.key_plain }
}

/** 登录 ensure（§16.3 ∥ KD-SV-130——幂等）：在册（active ∧ 明文在场）⇒ 复用零重签；缺 ⇒ 签一枚
 *  `admin-agent`（`keepPlain: true`——明文落 v19 列）；**不判 20 上限**（服务端签发面沿客户端/CLI 先例）。
 *  出 = `{ key, created }`（`created` = 本次是否新签——调用侧据此落首发审计行）。 */
export function ensureAgentKey(db, memberId, { now = Date.now() } = {}) {
  const existing = agentKeyOf(db, memberId)
  if (existing !== null) return { key: existing, created: false }
  const issued = issueKey(db, memberId, { name: AGENT_KEY_NAME, keepPlain: true, now })
  return { key: { id: issued.id, name: issued.name, hint: issued.hint, plain: issued.plain }, created: true }
}

/** 该成员 active key 计数（§1.1 上限判据——签发前计数；与 INSERT 同同步段调用）。 */
export function countActiveKeys(db, memberId) {
  return Number(db.prepare("SELECT COUNT(*) AS n FROM api_keys WHERE member_id = ? AND status = 'active'").get(memberId).n)
}

/** 单 key 读数（含吊销行；无 ⇒ null）。 */
export function getKeyById(db, keyId) {
  if (!Number.isInteger(keyId)) return null
  return db.prepare("SELECT * FROM api_keys WHERE id = ?").get(keyId) ?? null
}

/** 按提示形寻址（CLI `key revoke <hint>`——不唯一 ⇒ 返回多行，由调用方拒）。 */
export function findKeysByHint(db, hint) {
  return db.prepare("SELECT * FROM api_keys WHERE key_hint = ? ORDER BY id").all(hint)
}

/** 成员未吊销 key 清单（名称 + 提示形 + id + 签发时间——管理列表 ∥ `/api/me` 数据源；KD-SV-16 ∥ §1.1）。 */
export function activeKeysOf(db, memberId) {
  return db.prepare("SELECT id, name, key_hint, created_at FROM api_keys WHERE member_id = ? AND status = 'active' ORDER BY id").all(memberId)
}

/** key 清单（CLI `key list`——含吊销行 + 成员名）。 */
export function listKeys(db, { memberId = null } = {}) {
  const where = memberId === null ? "" : "WHERE k.member_id = ?"
  const args = memberId === null ? [] : [memberId]
  return db
    .prepare(
      `SELECT k.id, k.key_hint, k.status, k.created_at, k.revoked_at, m.name AS member_name
       FROM api_keys k JOIN members m ON m.id = k.member_id ${where} ORDER BY k.id`,
    )
    .all(...args)
}

/** 吊销（软删——行保留）：已吊销 ∥ 不存在 ⇒ 无变更；返回是否本次变更（调用方按需幂等）。 */
export function revokeKey(db, keyId, { now = Date.now() } = {}) {
  const info = db
    .prepare("UPDATE api_keys SET status = 'revoked', revoked_at = ? WHERE id = ? AND status = 'active'")
    .run(new Date(now).toISOString(), keyId)
  return Number(info.changes) > 0
}

/** 轮转（§1）：吊销该成员全部 active key + 新签一枚（无旧 ⇒ 等同首签）。
 *  **管理面 sk 披露**（§16.3——已知摩擦）：全换连带吊销 sk ⇒ 管理会话转 `model_error`，下次登录补发。 */
export function rotateKey(db, memberId, { now = Date.now() } = {}) {
  db.prepare("UPDATE api_keys SET status = 'revoked', revoked_at = ? WHERE member_id = ? AND status = 'active'").run(
    new Date(now).toISOString(),
    memberId,
  )
  return issueKey(db, memberId, { now })
}
