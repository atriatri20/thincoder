/**
 * image-source-routes.mjs — 镜像源面路由（sandbox/SANDBOX.md §3 镜像源族 ∥ gateway/API.md §2.5 镜像源七行；sandbox-image-sources 批——台账 #1274）。
 * 成档缘由（SANDBOX §13）：镜像源 = 独立面（全局面——非按节点；与容器/镜像族同页不同面）。
 *
 * 七端点（§2.5）：列 ∥ 预选（读动作——零审计）∥ 增 ∥ 改 ∥ 删（各一审计行——detail 键集 = `accounts/ACCOUNTS.md` §2.1）∥
 * 目录 ∥ 标签（读类预算 10s——**自含状态形**：成 ⇒ `{ ok: true, kind, repositories ∥ tags, truncated, ms }`；败 ⇒
 * `{ ok: false, error: { kind, message }, ms }`——五分类 = `registry-client.mjs`；沿 `/api/admin/proxy/test` 先例）。
 * 形（§3）：源名/址校验与唯一 = `image-sources.mjs`；`n` ∥ 仓库名 = `registry-client.mjs`（非法 ⇒ 400 **零外呼**）；
 * 读面**与节点零涉**（不查沙盒可用性门——源面与节点无关）；判权 = `requireAdmin`（零新码——400/404）。
 */
import { recordAudit } from "../accounts/audit.mjs"
import { requireAdmin } from "../accounts/session.mjs"
import { readJsonBody } from "../gateway/server.mjs"
import { HttpError, sendJson } from "../gateway/errors.mjs"
import { SOURCE_PRESETS, deleteSource, insertSource, listSources, sourceKind, sourceRowOr404, sourceView, updateSource } from "./image-sources.mjs"
import { REGISTRY_READ_TIMEOUT_MS, RegistryError, normalizeRepoName, parseBoundedN, readCatalogFor, readTagsFor } from "./registry-client.mjs"

/** 模型/形错 ⇒ 400（`HttpError` 原样过——404 等语义保留）。 */
function asHttpError(e) {
  return e instanceof HttpError ? e : new HttpError("invalid_request_error", e.message)
}

/** 读失败 ⇒ 自含形 error 体（`RegistryError` 五分类）；余 ⇒ 原样抛（500——bug 不假装分类）。 */
function readErrorBody(e) {
  if (e instanceof RegistryError) return { kind: e.kind, message: e.message }
  throw e
}

/** 注册镜像源七路由（§2.5）：`fetchImpl` = 远端传输注入口（单元测试档假 registry/hub；缺省 = 全局 fetch——生产行为不变）。 */
export function registerImageSourceRoutes(routes, { db, fetchImpl = fetch, now = Date.now, readTimeoutMs = REGISTRY_READ_TIMEOUT_MS } = {}) {
  if (!db) throw new Error("registerImageSourceRoutes：缺少 db")

  const readOpts = { fetchImpl, timeoutMs: readTimeoutMs }

  // 列（读动作——零审计；`kind` 按地址派生、不入库）
  routes.add("GET", "/api/admin/sandbox/image-sources", (req, res) => {
    requireAdmin(db, req)
    sendJson(res, 200, { sources: listSources(db) })
  })

  // 预选（静态表——server 端单源；零审计；名/址两字段）；注册先于 `:id` 面（同段数首个匹配胜出）
  routes.add("GET", "/api/admin/sandbox/image-sources/presets", (req, res) => {
    requireAdmin(db, req)
    sendJson(res, 200, { presets: SOURCE_PRESETS.map(({ name, address }) => ({ name, address })) })
  })

  // 增（形/唯一 ⇒ 400 库零变；审计 image_source_add——detail 键集 = kind+sourceId+name+address）
  routes.add("POST", "/api/admin/sandbox/image-sources", async (req, res) => {
    const { member: admin } = requireAdmin(db, req)
    const body = await readJsonBody(req)
    let row
    try {
      row = insertSource(db, { name: body?.name, address: body?.address, createdBy: admin.id, now: now() })
    } catch (e) {
      throw asHttpError(e)
    }
    recordAudit(db, {
      type: "sandbox_event",
      actor: admin.name,
      actorId: admin.id,
      target: row.name,
      detail: { kind: "image_source_add", sourceId: row.id, name: row.name, address: row.address },
      ts: now(),
    })
    sendJson(res, 200, { source: sourceView(row) })
  })

  // 改（键级——出现键 = 应用；不存在 ⇒ 404；撞名/撞址 ⇒ 400 库零变；审计 image_source_update）
  routes.add("PATCH", "/api/admin/sandbox/image-sources/:id", async (req, res, ctx) => {
    const { member: admin } = requireAdmin(db, req)
    const body = await readJsonBody(req)
    let row
    try {
      row = updateSource(db, ctx.params.id, body)
    } catch (e) {
      throw asHttpError(e)
    }
    recordAudit(db, {
      type: "sandbox_event",
      actor: admin.name,
      actorId: admin.id,
      target: row.name,
      detail: { kind: "image_source_update", sourceId: row.id, name: row.name, address: row.address },
      ts: now(),
    })
    sendJson(res, 200, { source: sourceView(row) })
  })

  // 删（不存在 ⇒ 404；审计 image_source_delete——detail 键集 = kind+sourceId+name）
  routes.add("DELETE", "/api/admin/sandbox/image-sources/:id", (req, res, ctx) => {
    const { member: admin } = requireAdmin(db, req)
    let row
    try {
      row = deleteSource(db, ctx.params.id)
    } catch (e) {
      throw asHttpError(e)
    }
    recordAudit(db, {
      type: "sandbox_event",
      actor: admin.name,
      actorId: admin.id,
      target: row.name,
      detail: { kind: "image_source_delete", sourceId: row.id, name: row.name },
      ts: now(),
    })
    sendJson(res, 200, { ok: true })
  })

  // 目录（读类 10s；`n` 越界/非数 ⇒ 400 零外呼；成/败皆 200 自含形；零审计）
  routes.add("GET", "/api/admin/sandbox/image-sources/:id/catalog", async (req, res, ctx) => {
    requireAdmin(db, req)
    const row = sourceRowOr404(db, ctx.params.id)
    let n
    try {
      n = parseBoundedN(new URL(req.url, "http://localhost").searchParams.get("n"))
    } catch (e) {
      throw new HttpError("invalid_request_error", e.message)
    }
    const kind = sourceKind(row.address)
    const started = now()
    try {
      const read = await readCatalogFor({ kind, base: row.address, n, ...readOpts })
      sendJson(res, 200, { ok: true, kind, repositories: read.repositories, truncated: read.truncated, ms: now() - started })
    } catch (e) {
      sendJson(res, 200, { ok: false, error: readErrorBody(e), ms: now() - started })
    }
  })

  // 标签（读类 10s；`name` 形非法/`n` 越界 ⇒ 400 零外呼；成/败皆 200 自含形；零审计）
  routes.add("GET", "/api/admin/sandbox/image-sources/:id/tags", async (req, res, ctx) => {
    requireAdmin(db, req)
    const row = sourceRowOr404(db, ctx.params.id)
    const params = new URL(req.url, "http://localhost").searchParams
    let name, n
    try {
      name = normalizeRepoName(params.get("name"))
      n = parseBoundedN(params.get("n"))
    } catch (e) {
      throw new HttpError("invalid_request_error", e.message)
    }
    const kind = sourceKind(row.address)
    const started = now()
    try {
      const read = await readTagsFor({ kind, base: row.address, name, n, ...readOpts })
      sendJson(res, 200, { ok: true, kind, tags: read.tags, truncated: read.truncated, ms: now() - started })
    } catch (e) {
      sendJson(res, 200, { ok: false, error: readErrorBody(e), ms: now() - started })
    }
  })
}
