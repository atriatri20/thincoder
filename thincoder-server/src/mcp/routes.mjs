/**
 * routes.mjs — MCP 管理面五端点（`gateway/API.md` §2.13 ∥ `mcp/MCP.md` §3.2；server-mcp 批——台账 #1379）：
 * 清单 `GET` ∥ 新增 `POST` ∥ 改 `PATCH` ∥ 删 `DELETE` ∥ 探活 `POST /probe`（零副作用——自含状态）。
 * 判权 = `requireAdmin`（`user` ⇒ 403 ∥ 无/过期会话 ⇒ 401）；错误形 = §3 全码沿用（**零新码**）。
 * 审计（`mcp_event` 三 kind——**成事才落**；detail 零秘密）：`server_add`（键集 = kind+id+name+transport）∥
 * `server_update`（+ `keys`——变更键名，值永不入）∥ `server_remove`（键集 = kind+id+name）。
 * 生命周期：删行/停用 ⇒ `closeMcpServer`（核 `removeMcpTools`——靶在 `face.mjs`）；探活成功 ⇒ 清冷却（§2.2）。
 * 探活体归 `store.mjs` `resolveProbeConfig`（`id` 在场 ⇒ 缺席字段回落库内行）；注入缝 = `deps.mcpProbeImpl`（缺省 = 核真件；缺核 ⇒ `{ ok:false, error }` 自含）。
 */
import { recordAudit } from "../accounts/audit.mjs"
import { requireAdmin } from "../accounts/session.mjs"
import { HttpError, sendJson } from "../gateway/errors.mjs"
import { readJsonBody } from "../gateway/server.mjs"
import { clearMcpCooldown, closeMcpServer, loadCoreMcp } from "./face.mjs"
import { insertMcpServer, listMcpServers, removeMcpServer, resolveProbeConfig, updateMcpServer } from "./store.mjs"

/** 形错 ⇒ 400（`HttpError` 原样过——404 等语义保留；沿 `registry-cred-routes.mjs` 先例）。 */
function asHttpError(e) {
  return e instanceof HttpError ? e : new HttpError("invalid_request_error", e.message)
}

/** 注册 MCP 管理面五路由（§2.13）：`config` = 密文列解密键文件落点（`credential-crypto` 单源）；`now` 注入供单元测试；
 *  `deps.mcpProbeImpl` = 探活替身（缺省 = 核真件——缺核 ⇒ 200 自含 `ok:false`）∥ `deps.mcpRemoveImpl` = 单服务器关闭替身（缺省 = 核真件）。 */
export function registerMcpRoutes(routes, { db, config = {}, log = null, now = Date.now, deps = {} } = {}) {
  if (!db) throw new Error("registerMcpRoutes：缺少 db（openDatabase 产物）")

  // 清单（库序——零秘密：`target` = 非秘密寻址形 ∥ 唯一凭据信号 = `hasSecrets` 布尔）
  routes.add("GET", "/api/admin/mcp", (req, res) => {
    requireAdmin(db, req)
    sendJson(res, 200, { servers: listMcpServers(db) })
  })

  // 新增（形非法/重名 ⇒ 400 库零变；成 ⇒ 200 `{ id }` + 审计 `server_add`）
  routes.add("POST", "/api/admin/mcp", async (req, res) => {
    const { member: admin } = requireAdmin(db, req)
    const body = await readJsonBody(req)
    let row
    try {
      row = insertMcpServer(db, { ...(body ?? {}), now, config })
    } catch (e) {
      throw asHttpError(e)
    }
    recordAudit(db, {
      type: "mcp_event",
      actor: admin.name,
      actorId: admin.id,
      detail: { kind: "server_add", id: row.id, name: row.name, transport: row.transport },
      ts: now(),
    })
    sendJson(res, 200, { id: row.id })
  })

  // 改（字段缺席 = 不变 ∥ `null` = 清；形非法 ⇒ 400 库零变；不存在 ⇒ 404；成 ⇒ 200 `{ ok: true }` + 审计 `server_update`）
  routes.add("PATCH", "/api/admin/mcp/:id", async (req, res, ctx) => {
    const { member: admin } = requireAdmin(db, req)
    const body = await readJsonBody(req)
    let result
    try {
      result = updateMcpServer(db, ctx.params.id, body, { now, config })
    } catch (e) {
      throw asHttpError(e)
    }
    if (result.keys.includes("enabled") && result.row.enabled === 0) await closeMcpServer(result.row.name, { deps, log }) // 停用 ⇒ 关闭该服务器会话（§2.2 生命周期）
    recordAudit(db, {
      type: "mcp_event",
      actor: admin.name,
      actorId: admin.id,
      detail: { kind: "server_update", id: result.row.id, name: result.row.name, keys: result.keys },
      ts: now(),
    })
    sendJson(res, 200, { ok: true })
  })

  // 删（硬删 + 关闭该服务器会话；不存在 ⇒ 404；成 ⇒ 200 `{ ok: true }` + 审计 `server_remove`）
  routes.add("DELETE", "/api/admin/mcp/:id", async (req, res, ctx) => {
    const { member: admin } = requireAdmin(db, req)
    let row
    try {
      row = removeMcpServer(db, ctx.params.id)
    } catch (e) {
      throw asHttpError(e)
    }
    await closeMcpServer(row.name, { deps, log })
    recordAudit(db, {
      type: "mcp_event",
      actor: admin.name,
      actorId: admin.id,
      detail: { kind: "server_remove", id: row.id, name: row.name },
      ts: now(),
    })
    sendJson(res, 200, { ok: true })
  })

  // 探活（零副作用——不进会话 ∥ 不动库 ∥ 不落审计；自含状态——`ok:false` 仍 200；成 ⇒ 清冷却）
  routes.add("POST", "/api/admin/mcp/probe", async (req, res) => {
    requireAdmin(db, req)
    const body = await readJsonBody(req)
    let probeConfig
    try {
      probeConfig = resolveProbeConfig(db, body ?? {}, { config })
    } catch (e) {
      throw asHttpError(e)
    }
    let impl = deps.mcpProbeImpl ?? null
    if (impl === null) {
      try {
        impl = (await loadCoreMcp()).probeMcpServer
      } catch (e) {
        log?.warn?.("mcp_probe_core_missing", { message: e?.message ?? String(e) })
        impl = null
      }
    }
    if (impl === null) {
      sendJson(res, 200, { ok: false, error: "MCP 探活不可用：@thincoder/core 未装载（核件缺失——生产镜像内核为声明依赖）" })
      return
    }
    let outcome
    try {
      outcome = await impl(probeConfig)
    } catch (e) {
      outcome = { ok: false, error: e?.message ?? String(e) } // 替身/意外抛错 ⇒ 自含状态（200）
    }
    const result = outcome !== null && typeof outcome === "object" ? outcome : {}
    if (result.ok === true) {
      if (typeof probeConfig.name === "string") clearMcpCooldown(probeConfig.name) // 探活成功 ⇒ 清冷却（§2.2；无名单次草稿零冷却可清）
      sendJson(res, 200, {
        ok: true,
        toolCount: Number.isInteger(result.toolCount) ? result.toolCount : 0,
        tools: Array.isArray(result.tools) ? result.tools.filter((n) => typeof n === "string" && n !== "") : [],
        latencyMs: Number.isFinite(result.latencyMs) ? result.latencyMs : 0,
      })
      return
    }
    sendJson(res, 200, { ok: false, error: typeof result.error === "string" && result.error !== "" ? result.error : String(result.error ?? "探活失败") })
  })
}
