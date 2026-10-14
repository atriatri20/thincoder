/**
 * member-cred.mjs — 成员 git 凭据行存取（`agent/MEMBER-AGENT.md` §3.6 ∥ KD-SV-204；端点 = `gateway/API.md` §2.11）：
 * 形校验 ∥ 主机归一（小写）∥ 加密 CRUD（AES-256-GCM——复用 `store/credential-crypto.mjs`，键文件与主机/私有仓凭据面同源）∥
 * 按主机取件（盒内 git 凭据助手按次调用——`POST /api/box/credential`）。
 *
 * 口径：键 = `(member_id, host)`（v23 段 `member_git_credentials`——UNIQUE 自携索引）；**密列零回显**（视图/日志/审计零秘密字段）；
 * 时间列两枚（`created_at` ∥ `updated_at`——绑定 = 同拍初值 ∥ 重绑 = 刷新）；**绑定一次复用**（盒内按次取件、用毕即清 = 盒侧纪律）；
 * 审计两 kind（`member_event`：`credential_set` ∥ `credential_revoke`——成事才落，detail 零秘密；单源 = `accounts/ACCOUNTS.md` §2.1）。
 * 键文件缺失/密文不可解 ⇒ 取件抛（调用面 400 人话——不静默回落匿名）。
 */
import { recordAudit } from "../accounts/audit.mjs"
import { HttpError } from "../gateway/errors.mjs"
import { credentialKeyPath, decryptSecret, encryptSecret, loadOrCreateCredentialKey } from "../store/credential-crypto.mjs"

/** 主机上限（形 = `主机[:端口]`——与注册表主机面同量级）。 */
export const MEMBER_GIT_HOST_MAX = 200
/** 用户名上限（trim 后计）。 */
export const MEMBER_GIT_USERNAME_MAX = 100
/** 口令/令牌原文上限（与主机/私有仓凭据面同值）。 */
const SECRET_MAX = 20000

/** git 主机归一（§3.6：小写）：trim ∥ 去尾斜杠 ∥ 拒绝 scheme/路径/空白；形 = `主机[:端口]`。出 = 归一主机。 */
export function normalizeGitHost(raw) {
  const text = typeof raw === "string" ? raw.trim().replace(/\/+$/, "") : ""
  if (text === "") throw new Error("主机不可为空（host——填托管主机名，如 gitee.com）")
  if (/\s/.test(text) || text.includes("/")) throw new Error(`主机不可含 scheme ∥ 路径 ∥ 空白：${text}（形 = 主机[:端口]）`)
  const lower = text.toLowerCase()
  if (lower.length > MEMBER_GIT_HOST_MAX) throw new Error(`主机超长（≤ ${MEMBER_GIT_HOST_MAX} 字符；实长 ${lower.length}）`)
  if (!/^[a-z0-9][a-z0-9.-]*(?::[0-9]{1,5})?$/.test(lower)) throw new Error(`主机形非法：${text}（形 = 主机[:端口]）`)
  const port = /:([0-9]{1,5})$/.exec(lower)
  if (port && (Number(port[1]) < 1 || Number(port[1]) > 65535)) throw new Error(`主机端口非法：${text}（1–65535）`)
  return lower
}

/** 用户名校验（trim 非空；≤ 100 字符）。 */
function normalizeUsername(raw) {
  const username = typeof raw === "string" ? raw.trim() : ""
  if (username === "") throw new Error("用户名不可为空（username）")
  if (username.length > MEMBER_GIT_USERNAME_MAX) throw new Error(`用户名超长（≤ ${MEMBER_GIT_USERNAME_MAX} 字符）`)
  return username
}

/** 口令/令牌校验（原文过：首尾空白不计空；≤ 20000 字符——口令的空白可能有意，不 trim 存）。 */
function normalizeSecret(raw) {
  const secret = typeof raw === "string" ? raw : ""
  if (secret.trim() === "") throw new Error("口令/令牌不可为空（secret）")
  if (secret.length > SECRET_MAX) throw new Error(`口令/令牌超长（≤ ${SECRET_MAX} 字符）`)
  return secret
}

/** 凭据行读数（§2.11 清单行：`{ host, username, updatedAt }`——**零秘密字段**）。 */
export function credentialView(row) {
  return { host: row.host, username: row.username, updatedAt: row.updated_at ?? row.created_at }
}

/** 清单（本人——host 序；零秘密）。 */
export function listMemberCredentials(db, memberId) {
  return db.prepare("SELECT * FROM member_git_credentials WHERE member_id = ? ORDER BY host").all(Number(memberId)).map(credentialView)
}

/** 单行（本人 + host——无 ⇒ null；取件 ∥ 写面共用）。 */
function credentialRowOf(db, memberId, host) {
  return db.prepare("SELECT * FROM member_git_credentials WHERE member_id = ? AND host = ?").get(Number(memberId), host) ?? null
}

/** 审计一行（`member_event`；成事才落——调用侧在写成功后调用）。 */
function auditCredential(db, { member, kind, host, username = null, now }) {
  recordAudit(db, {
    type: "member_event",
    actor: member.name,
    actorId: member.id,
    target: `host:${host}`,
    detail: { kind, host, ...(username === null ? {} : { username }) }, // 零秘密（detail 键集 = `kind`+`host`+`username?`）
    ts: now(),
  })
}

/** 绑定/更新（`PUT /api/me/git-credentials`）：形非法 ⇒ 抛（调用面 400 库零变）；族内 upsert（`(member_id, host)` 唯一）；
 *  成事 ⇒ 审计 `credential_set`（零秘密）⇒ 出 = 行视图（零秘密）。 */
export function setMemberCredential(db, { member, host, username, secret, config = {}, now = Date.now } = {}) {
  const resolvedHost = normalizeGitHost(host)
  const resolvedUsername = normalizeUsername(username)
  const resolvedSecret = normalizeSecret(secret)
  const key = loadOrCreateCredentialKey(credentialKeyPath(config))
  const stamp = new Date(now()).toISOString()
  db.prepare(
    `INSERT INTO member_git_credentials (member_id, host, username, secret_cipher, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)
     ON CONFLICT(member_id, host) DO UPDATE SET username = excluded.username, secret_cipher = excluded.secret_cipher, updated_at = excluded.updated_at`,
  ).run(member.id, resolvedHost, resolvedUsername, encryptSecret(resolvedSecret, key), stamp, stamp)
  const row = credentialRowOf(db, member.id, resolvedHost)
  auditCredential(db, { member, kind: "credential_set", host: resolvedHost, username: resolvedUsername, now })
  return credentialView(row)
}

/** 撤销（`DELETE /api/me/git-credentials/:host`）：无该行 ⇒ 404（库零变）；成事 ⇒ 审计 `credential_revoke` ⇒ 出行视图。 */
export function revokeMemberCredential(db, { member, host, now = Date.now } = {}) {
  const resolvedHost = normalizeGitHost(host)
  const row = credentialRowOf(db, member.id, resolvedHost)
  if (row === null) throw new HttpError("not_found", `该主机未绑定 git 凭据：${resolvedHost}`)
  db.prepare("DELETE FROM member_git_credentials WHERE member_id = ? AND host = ?").run(member.id, resolvedHost)
  auditCredential(db, { member, kind: "credential_revoke", host: resolvedHost, now })
  return credentialView(row)
}

/** 按主机取件（`POST /api/box/credential`——盒内助手按次调用）：出 = `{ username, password }` ∥ `null`（未绑定）；
 *  密文不可解 ⇒ 抛（400 人话——不静默回落匿名；盒侧助手按失败处理）。 */
export function credentialForHost(db, { memberId, host, config = {} } = {}) {
  const resolvedHost = normalizeGitHost(host)
  const row = credentialRowOf(db, memberId, resolvedHost)
  if (row === null) return null
  let secret
  try {
    secret = decryptSecret(row.secret_cipher, loadOrCreateCredentialKey(credentialKeyPath(config)))
  } catch (e) {
    throw new Error(`git 凭据解密失败（${row.host}）：${e?.message ?? String(e)}——在「我的 · 账户」页重新绑定`)
  }
  return { username: row.username, password: secret }
}
