/**
 * member-asks.mjs — 成员面 ask 应答 / 会话删除 / `@` 候选三端点（`gateway/API.md` §2.11 ∥ `agent/MEMBER-AGENT.md`
 * §3.11(2)/(6)；member-face-parity 批——自 `member-routes.mjs` 拆出（越 500 软线拆案），端点形与错误门逐字沿族）。
 *
 * 三端点：
 *  ① `POST /api/me/chat/sessions/:id/asks/:promptId`——ask 应答（体按 kind 一件；relay 在途表对位 ⇒ 下行 `answer`）；
 *  ② `POST /api/me/chat/sessions/:id/delete`——会话删除（确认门 + `session.delete` 指令 ⇒ 核 `deleteSlot`）；
 *  ③ `GET /api/me/chat/files?workspaceId=&q=`——`@` 候选（`files.list` 指令 ⇒ 工作区根遍历 ≤50 行）。
 *
 * 判权/错误形 = 沿族（本人过滤 ⇒ 404 不辨 ∥ 盒离线 ⇒ 409 `workspace_offline` ∥ 400 人话零副作用）。
 * **零 import 环**：族内公共助手（`requireMember`/`parseSessionId`/`workspaceOr404`/`offlineMessage`/
 * `sessionRowOf`/`valueOf`）由注册侧经 `helpers` 传入（`member-routes.mjs`——拆档零第二实现）。
 */
import { HttpError, sendJson } from "../gateway/errors.mjs"
import { readJsonBody } from "../gateway/server.mjs"

/** `@` 候选上限（§3.11(6)——盒侧同值主判；服务端再收口 ≤50 行，零静默超发）。 */
export const FILE_LIST_LIMIT = 50

/** 注册三端点（`member-routes.mjs` 调；`helpers` = 族内公共助手束）。 */
export function registerMemberAskRoutes(routes, { db, relay, helpers } = {}) {
  if (!db) throw new Error("registerMemberAskRoutes：缺少 db")
  if (!relay) throw new Error("registerMemberAskRoutes：缺少 relay（createMemberRelay 产物）")
  const { requireMember, parseSessionId, workspaceOr404, offlineMessage, valueOf } = helpers ?? {}
  if (typeof requireMember !== "function" || typeof parseSessionId !== "function" || typeof workspaceOr404 !== "function") {
    throw new Error("registerMemberAskRoutes：缺少 helpers（requireMember/parseSessionId/workspaceOr404/offlineMessage/valueOf）")
  }

  // ── ask 应答（体按 kind 一件——服务端词表校验（体与 kind 不符 ⇒ 400 零副作用）；在途表零改）──────────
  routes.add("POST", "/api/me/chat/sessions/:id/asks/:promptId", async (req, res, ctx) => {
    const member = requireMember(db, req)
    const parsed = parseSessionId(ctx.params.id)
    if (parsed === null) throw new HttpError("not_found", `会话不存在：${ctx.params.id}`)
    const workspace = workspaceOr404(db, member, parsed.workspaceId)
    if (!relay.online(workspace.id)) throw new HttpError("workspace_offline", offlineMessage(workspace))
    const body = await readJsonBody(req)
    const accepted = relay.answerAsk(workspace.id, parsed.slot, ctx.params.promptId, body ?? {})
    if (!accepted) {
      throw new HttpError("invalid_request_error", "该 ask 不在决（未知 ∥ 已了结 ∥ 体与 kind 不符）——零副作用")
    }
    sendJson(res, 200, { ok: true })
  })

  // ── 会话删除（确认门——`confirm` 缺 ⇒ 400；`session.delete` 指令 ⇒ 核 `deleteSlot`）───────────────
  routes.add("POST", "/api/me/chat/sessions/:id/delete", async (req, res, ctx) => {
    const member = requireMember(db, req)
    const parsed = parseSessionId(ctx.params.id)
    if (parsed === null) throw new HttpError("not_found", `会话不存在：${ctx.params.id}`)
    const workspace = workspaceOr404(db, member, parsed.workspaceId)
    if (!relay.online(workspace.id)) throw new HttpError("workspace_offline", offlineMessage(workspace))
    const body = await readJsonBody(req)
    if (body?.confirm !== true) {
      throw new HttpError("invalid_request_error", "删除不可逆（会话文件随删）——确认请携 confirm: true")
    }
    valueOf(await relay.runCommand(workspace.id, "session.delete", { slot: parsed.slot }), { notFoundMessage: `会话不存在：${ctx.params.id}` })
    sendJson(res, 200, { ok: true })
  })

  // ── `@` 候选（`files.list` 指令——工作区根遍历，忽略 `node_modules`/`.git`；盒离线 ⇒ 409）───────────
  routes.add("GET", "/api/me/chat/files", async (req, res) => {
    const member = requireMember(db, req)
    const params = new URL(req.url, "http://localhost").searchParams
    const workspace = workspaceOr404(db, member, params.get("workspaceId"))
    if (!relay.online(workspace.id)) throw new HttpError("workspace_offline", offlineMessage(workspace))
    const detail = valueOf(await relay.runCommand(workspace.id, "files.list", { q: String(params.get("q") ?? "") })) ?? {}
    const files = Array.isArray(detail.files) ? detail.files.slice(0, FILE_LIST_LIMIT) : []
    sendJson(res, 200, { files })
  })
}
