/**
 * registry-creds.mjs — 私有仓凭据面（sandbox/SANDBOX.md §3 底座可换块 ∥ gateway/API.md §2.5 凭据四行；
 * 底座可换增补 · sandbox-exec-rebuild 批——KD-SV-188）：形校验 ∥ 注册表主机归一（小写；Hub 别名归 `docker.io`）∥
 * 加密 CRUD（AES-256-GCM——复用 `store/credential-crypto.mjs`，键文件与主机凭据面同源）∥ `X-Registry-Auth` 组装。
 *
 * 口径（§8）：键 = 注册表主机（Docker 按注册表主机寻址同口径）；**密列零回显**（响应/日志/审计零秘密字段）；
 * 时间列两枚（`created_at` ∥ `updated_at`——v22 七列；STORE.md §2 v22 段语义：创建 = 创建时刻 ∥ 编辑刷新；写面维护 = 本档两径）；
 * 注入点 = 拉取（底座预拉 ∥ 手动拉取——未命中 ⇒ 匿名，现状零改）；**构建零网络不携**（底座/标准镜像皆本地）；
 * 源目录/标签读取仍匿名（边界外——如实登记）。键文件缺失/密文不可解 ⇒ 抛（调用面 400 人话——不静默回落匿名）。
 * 端点面 = `registry-cred-routes.mjs`；本档纯函数面（归一 ∥ 判据 ∥ 组装）与加密 CRUD = 单元测试档直测。
 */
import { credentialKeyPath, decryptSecret, encryptSecret, loadOrCreateCredentialKey } from "../store/credential-crypto.mjs"
import { HttpError } from "../gateway/errors.mjs"

/** 注册表主机上限（形 = `主机[:端口]`——≤ 200 字符，与镜像引用上界同量级）。 */
export const REGISTRY_HOST_MAX = 200

/** 用户名上限（trim 后计——沿主机凭据面同量级）。 */
export const REGISTRY_USERNAME_MAX = 100

/** 口令/令牌原文上限（与主机凭据面同值——私钥原文/口令各 ≤ 20000 字符）。 */
const SECRET_MAX = 20000

/** Hub 统一主机（归一目标——§8：Hub 别名归 `docker.io`）。 */
export const HUB_HOST = "docker.io"

/** Hub 四别名（登记输入任一 ⇒ 归 `docker.io`；与镜像源面 `HUB_HOSTS` 同集——主机面单一口径）。 */
export const HUB_ALIASES = Object.freeze(["docker.io", "index.docker.io", "registry-1.docker.io", "hub.docker.com"])

/** Hub 特例 `serveraddress`（§8：`X-Registry-Auth` 组装——Docker 官方客户端同值）。 */
export const HUB_SERVER_ADDRESS = "https://index.docker.io/v1/"

/** 注册表主机归一（§8 形：`主机[:端口]`——小写；Hub 别名归 `docker.io`；含 scheme/路径/空白 ⇒ 抛）。出 = 归一主机。 */
export function normalizeRegistryHost(raw) {
  const text = typeof raw === "string" ? raw.trim() : ""
  if (text === "") throw new Error("注册表主机不可为空（形 = 主机[:端口]——填注册表主机，非站点地址）")
  if (/\s/.test(text) || text.includes("/")) throw new Error(`注册表主机不可含 scheme ∥ 路径 ∥ 空白：${text}`)
  const lower = text.toLowerCase()
  if (lower.length > REGISTRY_HOST_MAX) throw new Error(`注册表主机超长（≤ ${REGISTRY_HOST_MAX} 字符；实长 ${lower.length}）`)
  if (!/^[a-z0-9][a-z0-9.-]*(?::[0-9]{1,5})?$/.test(lower)) throw new Error(`注册表主机形非法：${text}（形 = 主机[:端口]）`)
  const port = /:([0-9]{1,5})$/.exec(lower)
  if (port && (Number(port[1]) < 1 || Number(port[1]) > 65535)) throw new Error(`注册表主机端口非法：${text}（1–65535）`)
  return HUB_ALIASES.includes(lower) ? HUB_HOST : lower
}

/** 镜像引用 → 注册表主机（引擎同口径：**先剥标签**（末个 `/` 之后的末个 `:` 起——`parseImageRef` 同判）⇒ 首段含 `.` ∥ 含 `:` ∥ = `localhost` ⇒ 主机段；否则 Hub）。出 = 归一主机。 */
export function registryHostOfImage(imageRef) {
  const text = typeof imageRef === "string" ? imageRef.trim() : ""
  const slash = text.lastIndexOf("/")
  const colon = text.lastIndexOf(":")
  const name = colon > slash ? text.slice(0, colon) : text // 剥标签（含端口主机段的冒号在 `/` 前——不受影响）
  const first = name.split("/")[0] ?? ""
  const isHost = first === "localhost" || first.includes(".") || first.includes(":")
  if (!isHost) return HUB_HOST
  return normalizeRegistryHost(first)
}

/** `X-Registry-Auth` 组装（§8 ∥ `gateway/API.md` §2.5：**base64url**(JSON `{ username, password, serveraddress }`)——Docker 官方客户端同表；Hub ⇒ `https://index.docker.io/v1/` 特例，余 = 主机逐值）。 */
export function registryAuthHeader({ username, secret, host }) {
  const serveraddress = host === HUB_HOST ? HUB_SERVER_ADDRESS : host
  return Buffer.from(JSON.stringify({ username, password: secret, serveraddress }), "utf8").toString("base64url")
}

/** 凭据行读数（§2.5 列形：`{ id, host, username, createdAt, updatedAt }`——**零秘密字段**；`updated_at` 缺值回落 `created_at`——存量异形行护栏）。 */
export function credentialView(row) {
  return { id: row.id, host: row.host, username: row.username, createdAt: row.created_at, updatedAt: row.updated_at ?? row.created_at }
}

/** 凭据表行（id 序——列表面；零秘密——视图即 `credentialView`）。 */
export function listRegistryCredentials(db) {
  return db.prepare("SELECT * FROM registry_credentials ORDER BY id").all().map(credentialView)
}

/** 凭据行 or 404（`not_found`）。 */
export function registryCredentialRowOr404(db, id) {
  const row = db.prepare("SELECT * FROM registry_credentials WHERE id = ?").get(Number(id))
  if (!row) throw new HttpError("not_found", `私有仓凭据不存在：${id}`)
  return row
}

/** 用户名校验（trim 非空；≤ 100 字符）。 */
function normalizeUsername(raw) {
  const username = typeof raw === "string" ? raw.trim() : ""
  if (username === "") throw new Error("用户名不可为空（username）")
  if (username.length > REGISTRY_USERNAME_MAX) throw new Error(`用户名超长（≤ ${REGISTRY_USERNAME_MAX} 字符）`)
  return username
}

/** 口令/令牌校验（原文过：首尾空白不计空；≤ 20000 字符——口令的空白可能有意，不 trim 存）。 */
function normalizeSecret(raw) {
  const secret = typeof raw === "string" ? raw : ""
  if (secret.trim() === "") throw new Error("口令/令牌不可为空（secret）")
  if (secret.length > SECRET_MAX) throw new Error(`口令/令牌超长（≤ ${SECRET_MAX} 字符）`)
  return secret
}

/** 撞主机 ⇒ 人话（`host` 唯一——一主机一枚）；余 ⇒ 原样抛。 */
function uniqueOrRethrow(e, host) {
  if (/UNIQUE constraint failed: registry_credentials\.host/.test(String(e?.message ?? ""))) {
    throw new Error(`该注册表主机已有凭据：${host}（一主机一枚——改现有行，或先删再录）`)
  }
  throw e
}

/** 增凭据（形/撞主机 ⇒ 抛——调用面 400 库零变；成 ⇒ 行）。密文 = AES-256-GCM（键文件同源）；`updated_at` 随 `created_at` 同拍初值。 */
export function insertRegistryCredential(db, { host, username, secret, createdBy = null, now = Date.now, config = {} } = {}) {
  const resolvedHost = normalizeRegistryHost(host)
  const resolvedUsername = normalizeUsername(username)
  const resolvedSecret = normalizeSecret(secret)
  const key = loadOrCreateCredentialKey(credentialKeyPath(config))
  const stamp = new Date(now()).toISOString()
  try {
    const info = db
      .prepare("INSERT INTO registry_credentials (host, username, secret_cipher, created_at, updated_at, created_by) VALUES (?, ?, ?, ?, ?, ?)")
      .run(resolvedHost, resolvedUsername, encryptSecret(resolvedSecret, key), stamp, stamp, createdBy)
    return db.prepare("SELECT * FROM registry_credentials WHERE id = ?").get(Number(info.lastInsertRowid))
  } catch (e) {
    uniqueOrRethrow(e, resolvedHost)
  }
}

/** 改凭据（键级——出现键 = 应用；至少一键（空提交 ⇒ 抛）；不存在 ⇒ 404；撞主机 ⇒ 抛；`secret` 重设 ⇒ 密文重写；成 ⇒ `updated_at` 刷新）。 */
export function updateRegistryCredential(db, id, patch = {}, { now = Date.now, config = {} } = {}) {
  const row = registryCredentialRowOr404(db, id)
  const body = patch !== null && typeof patch === "object" && !Array.isArray(patch) ? patch : {}
  const hasHost = Object.hasOwn(body, "host")
  const hasUsername = Object.hasOwn(body, "username")
  const hasSecret = Object.hasOwn(body, "secret")
  if (!hasHost && !hasUsername && !hasSecret) throw new Error("改凭据须携 host ∥ username ∥ secret 至少一键（键级——出现键 = 应用）")
  const nextHost = hasHost ? normalizeRegistryHost(body.host) : row.host
  const nextUsername = hasUsername ? normalizeUsername(body.username) : row.username
  let nextCipher = row.secret_cipher
  if (hasSecret) {
    const key = loadOrCreateCredentialKey(credentialKeyPath(config))
    nextCipher = encryptSecret(normalizeSecret(body.secret), key)
  }
  try {
    db.prepare("UPDATE registry_credentials SET host = ?, username = ?, secret_cipher = ?, updated_at = ? WHERE id = ?")
      .run(nextHost, nextUsername, nextCipher, new Date(now()).toISOString(), row.id)
  } catch (e) {
    uniqueOrRethrow(e, nextHost)
  }
  return db.prepare("SELECT * FROM registry_credentials WHERE id = ?").get(row.id)
}

/** 删凭据（只删 server 侧存留——已拉镜像不受影响；不存在 ⇒ 404；成 ⇒ 被删行——审计 detail 取 `host`）。 */
export function revokeRegistryCredential(db, id) {
  const row = registryCredentialRowOr404(db, id)
  db.prepare("DELETE FROM registry_credentials WHERE id = ?").run(row.id)
  return row
}

/**
 * 镜像引用命中的凭据（拉取注入——§8）：出 = `{ host, auth }`（`auth` = `X-Registry-Auth` 头值）∥ `null`（未命中 ⇒ 匿名）。
 * 引用主机段形异常 ⇒ `null`（引用本身归引擎裁决——不因查找面挡拉取）；密文不可解 ⇒ 抛（注册面坏了 ⇒ 人话，非匿名兜底）。
 */
export function authForImageRef(db, imageRef, { config = {} } = {}) {
  let host
  try {
    host = registryHostOfImage(imageRef)
  } catch {
    return null
  }
  const row = db.prepare("SELECT * FROM registry_credentials WHERE host = ?").get(host)
  if (!row) return null
  let secret
  try {
    const key = loadOrCreateCredentialKey(credentialKeyPath(config))
    secret = decryptSecret(row.secret_cipher, key)
  } catch (e) {
    throw new Error(`注册表凭据解密失败（${row.host}）：${e?.message ?? String(e)}——在「私有仓凭据」卡重新录入`)
  }
  return { host, auth: registryAuthHeader({ username: row.username, secret, host }) }
}
