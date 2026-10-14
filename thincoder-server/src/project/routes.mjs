/**
 * routes.mjs — 成员面六端点（project/PROJECTS.md §3/§6 ∥ gateway/API.md §2.9 成员面；
 * team-projects-permissions 批（B2））。
 *
 * 判权 = 会话 + 能力矩阵（§3 判定函数——`user` 可达「我的·项目」面）：列表恒过滤（非成员零出现）∥ 直取 404 不辨
 * （KD-SV-120）∥ 写动作按能力矩阵 403（判据句 2/4/5/6）。错误形零新码（400/403/404 沿用——§6）。
 * 审计 = `project_event`（`project_update` ∥ `member_add` ∥ `member_update` ∥ `member_remove`——detail 键集 = `accounts/ACCOUNTS.md` §2.1）。
 */
import { sendJson } from "../gateway/errors.mjs"
import { readJsonBody } from "../gateway/server.mjs"
import { requireSession } from "../accounts/session.mjs"
import { recordAudit } from "../accounts/audit.mjs"
import { addMember, detailOf, listVisibleProjects, memberView, projectOr404, projectView, removeMember, requireCapability, setMemberLevel, updateProject } from "./projects.mjs"
import { asHttpError } from "./platform-client.mjs"

/** 项目类审计行（target = `project:<id>` 可读形；actor = 会话成员名快照）。 */
function auditProject(db, { member, projectId, detail }) {
  recordAudit(db, { type: "project_event", actor: member.name, actorId: member.id, target: `project:${projectId}`, detail })
}

/** 注册成员面六路由（§2.9）：列表（?q=）∥ 详情 ∥ 项目改 ∥ 成员增/改档/移除。 */
export function registerProjectRoutes(routes, { db } = {}) {
  if (!db) throw new Error("registerProjectRoutes：缺少 db")

  // 列表（可见集恒过滤——admin ⇒ 全量；`q` = 显示名/地址子串）
  routes.add("GET", "/api/projects", (req, res) => {
    const { member } = requireSession(db, req)
    const q = new URL(req.url, "http://localhost").searchParams.get("q")
    sendJson(res, 200, { projects: listVisibleProjects(db, member, { q }) })
  })

  // 详情（非成员 ⇒ 404 不辨——两态不辨；`my` 六键 + `admin` 布尔 = 控制台渲法源）
  routes.add("GET", "/api/projects/:id", (req, res, ctx) => {
    const { member } = requireSession(db, req)
    const { row } = projectOr404(db, member, ctx.params.id)
    sendJson(res, 200, detailOf(db, row, member))
  })

  // 项目改（一次一件：displayName ∥ address ∥ owner——权限逐件判）
  routes.add("PATCH", "/api/projects/:id", async (req, res, ctx) => {
    const { member } = requireSession(db, req)
    const { row, caps } = projectOr404(db, member, ctx.params.id)
    const body = await readJsonBody(req)
    let out
    try {
      out = updateProject(db, { capability: caps, project: row, input: body })
    } catch (e) {
      throw asHttpError(e)
    }
    auditProject(db, { member, projectId: row.id, detail: { kind: "project_update", projectId: row.id, keys: out.keys, values: out.values } })
    sendJson(res, 200, { project: projectView(db, out.row, member) })
  })

  // 加成员（负责人 ∥ 档位 manage ∥ admin；同名已在 ⇒ 400）
  routes.add("POST", "/api/projects/:id/members", async (req, res, ctx) => {
    const { member } = requireSession(db, req)
    const { row, caps } = projectOr404(db, member, ctx.params.id)
    requireCapability(caps, "manageMembers", "加/减成员需负责人或管理档")
    const body = await readJsonBody(req)
    let created
    try {
      created = addMember(db, { project: row, input: body })
    } catch (e) {
      throw asHttpError(e)
    }
    auditProject(db, { member, projectId: row.id, detail: { kind: "member_add", projectId: row.id, username: created.username, level: created.level } })
    sendJson(res, 200, { member: memberView(created) })
  })

  // 改档（同权 + 负责人保护——目标 = 负责人 ∧ 非 admin ⇒ 403）
  routes.add("PATCH", "/api/projects/:id/members/:username", async (req, res, ctx) => {
    const { member } = requireSession(db, req)
    const { row, caps } = projectOr404(db, member, ctx.params.id)
    requireCapability(caps, "manageMembers", "加/减成员需负责人或管理档")
    const body = await readJsonBody(req)
    let updated
    try {
      updated = setMemberLevel(db, { project: row, member, input: { ...(body ?? {}), username: ctx.params.username } })
    } catch (e) {
      throw asHttpError(e)
    }
    auditProject(db, { member, projectId: row.id, detail: { kind: "member_update", projectId: row.id, username: updated.username, level: updated.level } })
    sendJson(res, 200, { member: memberView(updated) })
  })

  // 移除成员（同权 + 负责人保护）
  routes.add("DELETE", "/api/projects/:id/members/:username", (req, res, ctx) => {
    const { member } = requireSession(db, req)
    const { row, caps } = projectOr404(db, member, ctx.params.id)
    requireCapability(caps, "manageMembers", "加/减成员需负责人或管理档")
    let removed
    try {
      removed = removeMember(db, { project: row, member, username: ctx.params.username })
    } catch (e) {
      throw asHttpError(e)
    }
    auditProject(db, { member, projectId: row.id, detail: { kind: "member_remove", projectId: row.id, username: removed.username, level: removed.level } })
    sendJson(res, 200, { ok: true })
  })
}
