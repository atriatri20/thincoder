/**
 * admin-routes.mjs — 管理面十端点（project/PROJECTS.md §5/§13/§14 ∥ gateway/API.md §2.9 管理面；
 * team-projects-permissions 批（B2））。
 *
 * 判权 = `requireAdmin`（§3 判据句 8；`user` ⇒ 403 ∥ 无会话 ⇒ 401）。十端点 = 源列/增/改/删 ∥ 立即同步 ∥ PAT 体检 ∥
 * 拉列表 ∥ webhook 密钥生成轮换 ∥ 加仓（两形一件）∥ 项目删除（二次确认 + 级联 + 审计——§14）。
 * 同步/体检/拉列表三读动作 = **自含状态形**（不成统一信封——沿代理测试/镜像源先例）；错误形零新码。
 * 锁与待跑旗 = `sync.mjs` 调度器同一实例（手动 ∥ 定时 ∥ 事件三径共锁——§5/§13）。
 */
import { HttpError, sendJson } from "../gateway/errors.mjs"
import { readJsonBody } from "../gateway/server.mjs"
import { requireAdmin } from "../accounts/session.mjs"
import { recordAudit } from "../accounts/audit.mjs"
import { credentialKeyPath, decryptSecret, loadOrCreateCredentialKey } from "../store/credential-crypto.mjs"
import { createSource, deleteSource, listSources, rotateHookSecret, sourceRowOr404, sourceView, updateSource } from "./git-sources.mjs"
import { createProjects, deleteProject, normalizeAddress, projectView } from "./projects.mjs"
import { PlatformError, asHttpError, failureBody, listRepos } from "./platform-client.mjs"

/** 源 PAT 解密（不可解 ⇒ 归 `auth` 自含形——与同步/体检面同口径；三读动作人话单源）。 */
function sourceTokenOf(row, config) {
  try {
    return decryptSecret(row.token_cipher, loadOrCreateCredentialKey(credentialKeyPath(config)))
  } catch (e) {
    throw new PlatformError("auth", `凭据不可解（键文件变更？）：${e.message}`)
  }
}

/** 凭据键（读面——取不到 ⇒ null：掩码提示降级，读动作不因键面失败）。 */
function tryKey(config) {
  try {
    return loadOrCreateCredentialKey(credentialKeyPath(config))
  } catch {
    return null
  }
}

/** 在册项目地址集（`known` 判据——库内地址已归一）。 */
function knownAddresses(db) {
  return new Set(db.prepare("SELECT address FROM projects").all().map((row) => row.address))
}

/** 读体（无体/非 JSON ⇒ null——缺 `confirm` 与「体非 JSON」同判 400 人话）。 */
async function readJsonBodyOrNull(req) {
  try {
    return await readJsonBody(req)
  } catch (e) {
    if (e instanceof HttpError && e.code === "invalid_request_error") return null
    throw e
  }
}

/** 注册管理面十路由（§2.9）：`scheduler` = 同步引擎实例（**必传**——三径共锁的单例由装配入口注入）。 */
export function registerProjectAdminRoutes(routes, { db, config = {}, log = null, scheduler = null, deps = {}, now = Date.now } = {}) {
  if (!db) throw new Error("registerProjectAdminRoutes：缺少 db")
  if (!scheduler) throw new Error("registerProjectAdminRoutes：缺少 scheduler（三径共锁——单例由装配入口注入；自建实例会让锁与待跑旗静默失效）")
  const sync = scheduler
  const fetchImpl = deps.fetchImpl ?? fetch
  const timeoutMs = deps.timeoutMs ?? null // 缺省 ⇒ 客户端按平台解析（`readTimeoutOf`）；注入面恒胜

  // 源列表（掩码面——`token`/`hookSecret` 恒 `{set,hint}`；零审计——读动作）
  routes.add("GET", "/api/admin/git-sources", (req, res) => {
    requireAdmin(db, req)
    sendJson(res, 200, { sources: listSources(db, { key: tryKey(config) }) })
  })

  // 增源（名 ≤40 ∥ 平台四值 ∥ 自建须基址 ∥ 间隔 5–1440 ∥ PAT 入密；撞名/形错 ⇒ 400 库零变）
  routes.add("POST", "/api/admin/git-sources", async (req, res) => {
    const { member: admin } = requireAdmin(db, req)
    const body = await readJsonBody(req)
    let row
    try {
      row = createSource(db, { input: body, key: loadOrCreateCredentialKey(credentialKeyPath(config)), createdBy: admin.id, now: now() })
    } catch (e) {
      throw asHttpError(e)
    }
    recordAudit(db, {
      type: "project_event",
      actor: admin.name,
      actorId: admin.id,
      target: "",
      detail: { kind: "source_add", sourceId: row.id, name: row.name, platform: row.platform },
      ts: now(),
    })
    sendJson(res, 200, { source: sourceView(row, { key: tryKey(config) }) })
  })

  // 改源（键级——出现键 = 应用；`token` 明填 = 替换 ∥ 留空 = 不动；值零入审计）
  routes.add("PATCH", "/api/admin/git-sources/:id", async (req, res, ctx) => {
    const { member: admin } = requireAdmin(db, req)
    const body = await readJsonBody(req)
    let out
    try {
      out = updateSource(db, { id: ctx.params.id, input: body, key: loadOrCreateCredentialKey(credentialKeyPath(config)), now: now() })
    } catch (e) {
      throw asHttpError(e)
    }
    recordAudit(db, {
      type: "project_event",
      actor: admin.name,
      actorId: admin.id,
      target: "",
      detail: { kind: "source_update", sourceId: out.row.id, keys: out.keys },
      ts: now(),
    })
    sendJson(res, 200, { source: sourceView(out.row, { key: tryKey(config) }) })
  })

  // 删源（还挂项目 ⇒ 400「尚有 N 个项目挂此源」库零变；零挂 ⇒ 删成 + 审计）
  routes.add("DELETE", "/api/admin/git-sources/:id", (req, res, ctx) => {
    const { member: admin } = requireAdmin(db, req)
    let row
    try {
      row = deleteSource(db, { id: ctx.params.id, now: now() })
    } catch (e) {
      throw asHttpError(e)
    }
    recordAudit(db, { type: "project_event", actor: admin.name, actorId: admin.id, target: "", detail: { kind: "source_delete", sourceId: row.id, name: row.name }, ts: now() })
    sendJson(res, 200, { ok: true })
  })

  // 立即同步（手动钮永在——进行中 ⇒ 400「该源正在同步中」；否则自含形 + `last_sync_*` 随写 + 审计 `source_sync`）
  routes.add("POST", "/api/admin/git-sources/:id/sync", async (req, res, ctx) => {
    const { member: admin } = requireAdmin(db, req)
    const body = await sync.syncNow(ctx.params.id, { actor: admin.name, actorId: admin.id })
    sendJson(res, 200, body)
  })

  // PAT 体检（成 ⇒ `token_state='ok'` ∥ 败 ⇒ `auth` ⇒ `invalid`；两类皆写 `token_checked_at` + 审计 `source_check`）
  routes.add("POST", "/api/admin/git-sources/:id/check", async (req, res, ctx) => {
    const { member: admin } = requireAdmin(db, req)
    const body = await sync.checkPat(ctx.params.id, { actor: admin.name, actorId: admin.id })
    sendJson(res, 200, body)
  })

  // 拉列表（读类 = 平台口径（gitee 20s ∥ 余 10s——`readTimeoutOf`）——自含形；`known` = 跨形归一命中在册项目 ⇒ 界面「已添加」标 + 禁提交；零审计）
  routes.add("GET", "/api/admin/git-sources/:id/repos", async (req, res, ctx) => {
    requireAdmin(db, req)
    const row = sourceRowOr404(db, ctx.params.id)
    const started = now()
    try {
      const token = sourceTokenOf(row, config)
      const { repos, truncated } = await listRepos({ platform: row.platform, baseURL: row.base_url, token, scope: row.scope, scopeKind: row.scope_kind ?? null, fetchImpl, timeoutMs })
      const known = knownAddresses(db)
      const rows = repos.map((repo) => {
        let hit = false
        try {
          hit = known.has(normalizeAddress(repo.address))
        } catch {
          hit = false // 地址形不可归一 ⇒ 不算命中（如实标「未添加」）
        }
        return { fullName: repo.fullName, address: repo.address, private: repo.private, known: hit }
      })
      sendJson(res, 200, { ok: true, repos: rows, truncated, ms: now() - started })
    } catch (e) {
      sendJson(res, 200, failureBody(e, started, now()))
    }
  })

  // 生成/轮换 webhook 密钥（一次性明文回显——此后读面恒掩码；轮换 ⇒ 旧密钥即刻失效；审计 `source_update` 含键名、值零入）
  routes.add("POST", "/api/admin/git-sources/:id/hook-secret", (req, res, ctx) => {
    const { member: admin } = requireAdmin(db, req)
    let out
    try {
      out = rotateHookSecret(db, { id: ctx.params.id, key: loadOrCreateCredentialKey(credentialKeyPath(config)), now: now() })
    } catch (e) {
      throw asHttpError(e)
    }
    recordAudit(db, {
      type: "project_event",
      actor: admin.name,
      actorId: admin.id,
      target: "",
      detail: { kind: "source_update", sourceId: out.row.id, keys: ["hookSecret"] },
      ts: now(),
    })
    sendJson(res, 200, { hookSecret: { plain: out.plain } })
  })

  // 加仓（两形一件：批量勾选 ∥ 手输保底；全成或全拒——撞重复 ⇒ 400 列重复项、零落库；每项目一行审计 `project_add`）
  routes.add("POST", "/api/admin/projects", async (req, res) => {
    const { member: admin } = requireAdmin(db, req)
    const body = await readJsonBody(req)
    let out
    try {
      out = createProjects(db, { member: admin, input: body, now: now() })
    } catch (e) {
      throw asHttpError(e)
    }
    for (const audit of out.audits) {
      recordAudit(db, {
        type: "project_event",
        actor: admin.name,
        actorId: admin.id,
        target: `project:${audit.projectId}`,
        detail: { kind: "project_add", projectId: audit.projectId, displayName: audit.displayName, sourceId: audit.sourceId },
        ts: now(),
      })
    }
    sendJson(res, 200, { projects: out.rows.map((row) => projectView(db, row, admin)) })
  })

  // 项目删除（仅 admin——`can.delete`；载荷 `{ confirm: true }` 缺 ⇒ 400 人话；成员表同事务随删 + 审计 `project_delete`）
  routes.add("DELETE", "/api/admin/projects/:id", async (req, res, ctx) => {
    const { member: admin } = requireAdmin(db, req)
    const body = await readJsonBodyOrNull(req)
    if (body === null || body.confirm !== true) {
      throw new HttpError("invalid_request_error", "删除将连同成员表一并移除——确认后重试")
    }
    const row = db.prepare("SELECT * FROM projects WHERE id = ?").get(Number(ctx.params.id))
    if (!row) throw new HttpError("not_found", `项目不存在：${ctx.params.id}`)
    const { memberCount } = deleteProject(db, { project: row })
    recordAudit(db, {
      type: "project_event",
      actor: admin.name,
      actorId: admin.id,
      target: `project:${row.id}`,
      detail: { kind: "project_delete", projectId: row.id, displayName: row.display_name, address: row.address, memberCount },
      ts: now(),
    })
    sendJson(res, 200, { ok: true })
  })
}
