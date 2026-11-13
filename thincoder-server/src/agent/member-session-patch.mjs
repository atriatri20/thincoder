/**
 * member-session-patch.mjs — 成员面会话设置面端点（`gateway/API.md` §2.11 ∥ `agent/MEMBER-AGENT.md` §3.4；
 * member-face-parity 批——自 `member-routes.mjs` 拆出（越 500 行拆案），端点形与错误门逐字沿族）。
 *
 * 一端点：
 *  `PATCH /api/me/chat/sessions/:id`——会话设置面（一次一件：`SESSION_SETTING_KEYS` 词表单源——model ∥
 *  reasoning ∥ title ∥ mode ∥ autoApprove/planMode/advisorGuard 三布尔）；`session.update`/`session.rename` 指令
 *  ⇒ 核侧写槽（服务器零会话落库）。
 *
 * 判权/错误形 = 沿族（本人过滤 ⇒ 404 不辨 ∥ 盒离线 ⇒ 409 `workspace_offline` ∥ 400 人话零副作用；
 * reasoning 值域 = 当刻模型核枚举——server 先校验，`levelsOfRef` 桥）。
 * **零 import 环**：族内公共助手（`requireMember`/`parseSessionId`/`workspaceOr404`/`offlineMessage`/
 * `sessionRowOf`/`valueOf`）与词表（`SESSION_SETTING_KEYS`/`WORK_MODES`）由注册侧经 `helpers` 传入
 * （`member-routes.mjs`——拆档零第二实现）。
 */
import { HttpError, sendJson } from "../gateway/errors.mjs"
import { listProviderEntries } from "../gateway/providers.mjs"
import { levelsOfRef, noteDegraded } from "../gateway/reasoning-levels.mjs"
import { readJsonBody } from "../gateway/server.mjs"
import { providerModelRefs } from "./run.mjs"

/** 注册会话设置面端点（`member-routes.mjs` 调；`helpers` = 族内公共助手束 + 词表）。 */
export function registerMemberSessionPatchRoutes(routes, { db, relay, log = null, helpers } = {}) {
  if (!db) throw new Error("registerMemberSessionPatchRoutes：缺少 db")
  if (!relay) throw new Error("registerMemberSessionPatchRoutes：缺少 relay（createMemberRelay 产物）")
  const { requireMember, parseSessionId, workspaceOr404, offlineMessage, valueOf, sessionRowOf, SESSION_SETTING_KEYS, WORK_MODES } = helpers ?? {}
  if (
    typeof requireMember !== "function" || typeof parseSessionId !== "function" ||
    typeof workspaceOr404 !== "function" || typeof offlineMessage !== "function" ||
    typeof valueOf !== "function" || typeof sessionRowOf !== "function"
  ) {
    throw new Error("registerMemberSessionPatchRoutes：缺少 helpers（requireMember/parseSessionId/workspaceOr404/offlineMessage/valueOf/sessionRowOf/SESSION_SETTING_KEYS/WORK_MODES）")
  }

  // ── 会话设置面（一次一件——换模型 ∥ 设档 ∥ 布尔开关 ∥ mode ∥ 标题；盒离线 ⇒ 409）─
  routes.add("PATCH", "/api/me/chat/sessions/:id", async (req, res, ctx) => {
    const member = requireMember(db, req)
    const parsed = parseSessionId(ctx.params.id)
    if (parsed === null) throw new HttpError("not_found", `会话不存在：${ctx.params.id}`)
    const workspace = workspaceOr404(db, member, parsed.workspaceId)
    if (!relay.online(workspace.id)) throw new HttpError("workspace_offline", offlineMessage(workspace))
    const body = await readJsonBody(req)
    const present = SESSION_SETTING_KEYS.filter((key) => body?.[key] !== undefined)
    if (present.length !== 1) {
      throw new HttpError("invalid_request_error", `一次一件：body 须恰携一件（${SESSION_SETTING_KEYS.join(" ∥ ")}——实携 ${present.length} 件）`)
    }
    const field = present[0]
    let command = "session.update"
    let args
    if (field === "model") {
      const model = typeof body.model === "string" ? body.model.trim() : ""
      if (model === "") throw new HttpError("invalid_request_error", "model 必填（会话内换模型——下回合生效）")
      if (!providerModelRefs(listProviderEntries(db)).includes(model)) {
        throw new HttpError("invalid_request_error", `模型不可用：${model}（不在开放清单——库零变）`)
      }
      args = { slot: parsed.slot, model, reasoning: null } // 换模型 ⇒ 档位清（§3.4）
    } else if (field === "reasoning") {
      const reasoning = body.reasoning
      if (reasoning !== null && typeof reasoning !== "string") {
        throw new HttpError("invalid_request_error", "reasoning 须为字符串或 null（null = 清空档位）")
      }
      if (reasoning !== null) {
        const current = valueOf(await relay.runCommand(workspace.id, "session.read", { slot: parsed.slot }), { notFoundMessage: `会话不存在：${ctx.params.id}` }) ?? {}
        const currentModel = sessionRowOf(workspace, current.session ?? { slot: parsed.slot }).model
        let levels = []
        try {
          levels = await levelsOfRef(db, currentModel) // 值域 = 当刻模型核枚举（§3.4——server 先校验）
        } catch (e) {
          noteDegraded(log, "member-chat-patch", e)
          throw new HttpError("invalid_request_error", `${e.message}——档位面暂不可写（库零变）`)
        }
        if (!levels.includes(reasoning)) {
          throw new HttpError("invalid_request_error", `思考档位不在当前模型枚举内：${reasoning}（模型 ${currentModel}）——库零变`)
        }
      }
      args = { slot: parsed.slot, reasoning }
    } else if (field === "title") {
      // 重命名（KD-SV-203——行内输入 ⇒ 核 `renameSlot`；空串 = 清标题）
      if (typeof body.title !== "string") throw new HttpError("invalid_request_error", "title 须为字符串（空串 = 清标题）")
      command = "session.rename"
      args = { slot: parsed.slot, title: body.title }
    } else if (field === "mode") {
      if (!WORK_MODES.includes(body.mode)) {
        throw new HttpError("invalid_request_error", `mode 须为 ${WORK_MODES.join(" ∥ ")} 之一（非法值零写）`)
      }
      args = { slot: parsed.slot, mode: body.mode }
    } else {
      // 布尔开关；engineering 不在可写字段集，旧槽仅经读面迁移。
      if (typeof body[field] !== "boolean") throw new HttpError("invalid_request_error", `${field} 须为布尔`)
      args = { slot: parsed.slot, [field]: body[field] }
    }
    const detail = valueOf(await relay.runCommand(workspace.id, command, args), { notFoundMessage: `会话不存在：${ctx.params.id}` }) ?? {}
    const raw = detail.session ?? (detail !== null && typeof detail === "object" ? detail : {})
    sendJson(res, 200, { session: sessionRowOf(workspace, { slot: parsed.slot, ...raw }, { awaitingApproval: relay.pendingAskOf(workspace.id, parsed.slot) }) })
  })
}
