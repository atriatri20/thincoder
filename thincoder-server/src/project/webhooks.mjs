/**
 * webhooks.mjs — 事件接收端（project/PROJECTS.md §13 ∥ gateway/API.md §2.9 接收面；team-projects-permissions 批（B2）——
 * R63 乙裁 / KD-SV-127）。
 *
 * 端点 = `POST /api/hooks/git-sources/:id`（**公开面**——无会话）。门 = `X-Hub-Signature-256` HMAC-SHA256
 * （**raw body** ∥ 该源 `hook_secret_cipher` 解密值；`timingSafeEqual` 定长比较——长度不等先拒）；
 * 缺签名 ∥ 不符 ∥ 密钥未生成 ⇒ **401**（零细节）+ `log.warn`（**不入审计**——公网噪声）；未知源 id ⇒ 404（统一信封）。
 * 分派：`X-GitHub-Event: member` ⇒ 异步触发该源一次全量对账（`trigger='event'` ∥ actor=`webhook`；载荷不解析）+
 * **先回 200 受理**；忽略面（非 `member` 事件 ∥ 源停用 ∥ `sync_mode='poll'`）⇒ 200 `{ ok:true, ignored:true }`。
 * 锁/待跑旗 = `sync.mjs` 调度器同一实例（撞锁 ⇒ 合并为一次——§13）。
 */
import { createHmac, timingSafeEqual } from "node:crypto"

import { HttpError, sendJson } from "../gateway/errors.mjs"
import { MAX_BODY_BYTES, readStreamBody } from "../gateway/server.mjs"
import { credentialKeyPath, decryptSecret, loadOrCreateCredentialKey } from "../store/credential-crypto.mjs"

/** 原始体（HMAC 输入——不解析载荷；超限 ⇒ 413 沿 gateway 口径）。 */
async function readRawBody(req) {
  const chunks = []
  await readStreamBody(req, { limit: MAX_BODY_BYTES, onChunk: (chunk) => chunks.push(chunk) })
  return Buffer.concat(chunks)
}

/** 验签判据（§13）：`sha256=<hex>` = HMAC-SHA256（raw body ∥ 密钥）；密钥缺 ∥ 头缺/形不合 ∥ 不符 ⇒ false。 */
export function signatureMatches(raw, header, secret) {
  if (typeof secret !== "string" || secret === "") return false
  if (typeof header !== "string" || !/^sha256=[0-9a-f]{64}$/i.test(header.trim())) return false
  const expected = createHmac("sha256", secret).update(raw).digest()
  const given = Buffer.from(header.trim().slice("sha256=".length), "hex")
  return expected.length === given.length && timingSafeEqual(expected, given)
}

/** 注册接收端一路由（§13）：`scheduler` = 同步引擎实例（**必传**——与装配面/管理面共锁）。 */
export function registerProjectWebhookRoutes(routes, { db, config = {}, log = null, scheduler = null, deps = {}, now = Date.now } = {}) {
  if (!db) throw new Error("registerProjectWebhookRoutes：缺少 db")
  if (!scheduler) throw new Error("registerProjectWebhookRoutes：缺少 scheduler（三径共锁——单例由装配入口注入；自建实例会让锁与待跑旗静默失效）")
  const sync = scheduler

  routes.add("POST", "/api/hooks/git-sources/:id", async (req, res, ctx) => {
    const row = db.prepare("SELECT * FROM git_sources WHERE id = ?").get(Number(ctx.params.id))
    if (!row) throw new HttpError("not_found", `git 源不存在：${ctx.params.id}`) // 未知源 ⇒ 404（统一信封）
    const raw = await readRawBody(req)
    let secret = null
    try {
      secret = decryptSecret(row.hook_secret_cipher, loadOrCreateCredentialKey(credentialKeyPath(config)))
    } catch {
      secret = null // 未生成 ∥ 不可解 ⇒ 与验签败同判 401（零细节）
    }
    if (!signatureMatches(raw, req.headers["x-hub-signature-256"], secret)) {
      log?.warn("project_hook_rejected", { sourceId: row.id, event: String(req.headers["x-github-event"] ?? "") })
      throw new HttpError("unauthorized", "签名校验失败")
    }
    const event = String(req.headers["x-github-event"] ?? "")
    if (event !== "member" || !(row.enabled === 1 || row.enabled === true) || row.sync_mode !== "event") {
      sendJson(res, 200, { ok: true, ignored: true })
      return
    }
    sync.triggerEvent(row.id) // 异步受理（投递预算 10s 与同步链长不匹配）
    sendJson(res, 200, { ok: true, triggered: true })
  })
}
