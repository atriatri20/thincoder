/**
 * registry-cred-routes.mjs — 私有仓凭据四端点（gateway/API.md §2.5 凭据四行；底座可换增补 · sandbox-exec-rebuild 批——KD-SV-188）：
 * 列（读动作——零审计）∥ 增 ∥ 改（键级——出现键 = 应用）∥ 删——**响应零秘密字段**（视图单源 = `registry-creds.mjs` `credentialView`）。
 * 审计两 kind（`accounts/ACCOUNTS.md` §2.1——`sandbox_event` 非枚举，CHECK 零动）：`registry_credential_set`（增/改各一行——
 * detail = kind+host+username，零秘密）∥ `registry_credential_revoke`（删——detail = kind+host）；判权 = `requireAdmin`；零新码（400/404）。
 */
import { recordAudit } from "../accounts/audit.mjs"
import { requireAdmin } from "../accounts/session.mjs"
import { readJsonBody } from "../gateway/server.mjs"
import { HttpError, sendJson } from "../gateway/errors.mjs"
import {
  credentialView,
  insertRegistryCredential,
  listRegistryCredentials,
  revokeRegistryCredential,
  updateRegistryCredential,
} from "./registry-creds.mjs"

/** 形错 ⇒ 400（`HttpError` 原样过——404 等语义保留）。 */
function asHttpError(e) {
  return e instanceof HttpError ? e : new HttpError("invalid_request_error", e.message)
}

/** 注册凭据四路由（§2.5）：`config` = 密钥文件落点所需（`credential-crypto` 单源——与库同数据目录）；`now` 注入供单元测试。 */
export function registerRegistryCredRoutes(routes, { db, config = {}, now = Date.now } = {}) {
  if (!db) throw new Error("registerRegistryCredRoutes：缺少 db")

  // 列（读动作——零审计；响应零秘密字段）
  routes.add("GET", "/api/admin/sandbox/registry-credentials", (req, res) => {
    requireAdmin(db, req)
    sendJson(res, 200, { credentials: listRegistryCredentials(db) })
  })

  // 增（形/撞主机 ⇒ 400 库零变；审计 registry_credential_set——detail = kind+host+username）
  routes.add("POST", "/api/admin/sandbox/registry-credentials", async (req, res) => {
    const { member: admin } = requireAdmin(db, req)
    const body = await readJsonBody(req)
    let row
    try {
      row = insertRegistryCredential(db, { host: body?.host, username: body?.username, secret: body?.secret, createdBy: admin.id, now, config })
    } catch (e) {
      throw asHttpError(e)
    }
    recordAudit(db, {
      type: "sandbox_event",
      actor: admin.name,
      actorId: admin.id,
      target: row.host,
      detail: { kind: "registry_credential_set", host: row.host, username: row.username },
      ts: now(),
    })
    sendJson(res, 200, { credential: credentialView(row) })
  })

  // 改（键级——出现键 = 应用；至少一键；不存在 ⇒ 404；撞主机 ⇒ 400 库零变；审计 registry_credential_set）
  routes.add("PATCH", "/api/admin/sandbox/registry-credentials/:id", async (req, res, ctx) => {
    const { member: admin } = requireAdmin(db, req)
    const body = await readJsonBody(req)
    let row
    try {
      row = updateRegistryCredential(db, ctx.params.id, body, { now, config })
    } catch (e) {
      throw asHttpError(e)
    }
    recordAudit(db, {
      type: "sandbox_event",
      actor: admin.name,
      actorId: admin.id,
      target: row.host,
      detail: { kind: "registry_credential_set", host: row.host, username: row.username },
      ts: now(),
    })
    sendJson(res, 200, { credential: credentialView(row) })
  })

  // 删（只删 server 侧存留——已拉镜像不受影响；不存在 ⇒ 404；审计 registry_credential_revoke——detail = kind+host）
  routes.add("DELETE", "/api/admin/sandbox/registry-credentials/:id", (req, res, ctx) => {
    const { member: admin } = requireAdmin(db, req)
    let row
    try {
      row = revokeRegistryCredential(db, ctx.params.id)
    } catch (e) {
      throw asHttpError(e)
    }
    recordAudit(db, {
      type: "sandbox_event",
      actor: admin.name,
      actorId: admin.id,
      target: row.host,
      detail: { kind: "registry_credential_revoke", host: row.host },
      ts: now(),
    })
    sendJson(res, 200, { ok: true })
  })
}
