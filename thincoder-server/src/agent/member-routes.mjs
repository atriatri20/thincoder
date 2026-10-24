/**
 * member-routes.mjs — 成员面对话面 + 工作区写面 + git 凭据（`gateway/API.md` §2.11 ∥ `agent/MEMBER-AGENT.md` §3.2–§3.8；
 * member-face-chat 批 · KD-SV-152–157/203/204；member-face-parity 批扩——在途门会话级 ∥ 四旗/标题写面 ∥
 * 工作区 key 第三门 ∥ 图片通道 ∥ 行扩四键）：会话读/建/改 = **盒指令转发**（`cmd`——会话真源在盒内，服务器零会话落库；
 * 盒离线 ⇒ 409 `workspace_offline`）∥ 工作区写面四端点（建/启停销毁/拉仓——本人资源自管 + `memberWorkspaceLimit` 上限）∥
 * git 凭据三端点（`member-cred.mjs`）；ask 应答/会话删除/`@` 候选三端点住 `member-asks.mjs`（拆档——越 500 软线）。
 *
 * 判权 = **双鉴权同判权**（控制台 cookie ∥ 登录 token `Authorization: Bearer`——KD-SV-157）+ **恒本人**
 * （他人资源 ⇒ 列表零出现 ∥ 直取 404 不辨）+ **工作区 key 第三门**（`/api/me/sandbox/*` 写面——盒内工具面：
 * 键 → 工作区 → 负责人；作用域 = 本工作区，`self` 自指）；错误形 = §3 全码沿用 + 两新码（409 `workspace_offline` ∥ 400 `workspace_limit_reached`）。
 * 在途门 = **会话级**（同会话二回合 ⇒ 400 人话——KD-SV-223；跨会话并行放开）；发消息 = NDJSON 帧流（帧词表 = 管理面同源 +
 * 本批增补七型；纯转发零落库）。盒指令结果形（box → server）：`{ state, detail }`——列表/读史 = `detail.sessions[行]`/`{ session, messages }` ∥
 * 新建 = `detail.id`（槽号）∥ 改 = `detail.session`；`state:"failed"` ⇒ `detail.notFound` 判 404 不辨、余 400 人话。
 * 审计（`member_event`——单源 = `accounts/ACCOUNTS.md` §2.1）：`chat_start`（本档）∥ `chat_call`/`chat_stop`（`member-relay.mjs`）∥
 * `pull`（`member-pull.mjs`）∥ `credential_*`（`member-cred.mjs`）；工作区动作 = `sandbox_event` 行（kind 沿既有枚举，detail 携 `by:"member"`）。
 */
import { findMemberById } from "../accounts/members.mjs"
import { recordAudit } from "../accounts/audit.mjs"
import { verifyKey } from "../accounts/keys.mjs"
import { resolveSession } from "../accounts/session.mjs"
import { HttpError, sendJson } from "../gateway/errors.mjs"
import { listProviderEntries } from "../gateway/providers.mjs"
import { levelsOfRef, noteDegraded } from "../gateway/reasoning-levels.mjs"
import { readJsonBody } from "../gateway/server.mjs"
import { issueWorkspaceKey, revokeWorkspaceKey } from "../sandbox/credentials.mjs"
import { createWorkspaceBox, destroyWorkspaceBox, readBoxStatesOf, startWorkspaceBox, stopWorkspaceBox } from "../sandbox/box.mjs"
import { WORKSPACE_NAME_MAX, getSettings, placeWorkspace, requireRunnerAvailable, requireSandboxAvailable, runnerRowOr404 } from "../sandbox/registry.mjs"
import { workspaceView } from "../sandbox/workspace-routes.mjs"
import { registerBoxRoutes } from "./box-routes.mjs"
import { assertChatImages } from "./chat-routes.mjs"
import { registerMemberAskRoutes } from "./member-asks.mjs"
import { listMemberCredentials, revokeMemberCredential, setMemberCredential } from "./member-cred.mjs"
import { createPullRegistry, pullProjectOf } from "./member-pull.mjs"
import { SESSION_BUSY_MESSAGE, createMemberRelay } from "./member-relay.mjs"
import { providerModelRefs } from "./run.mjs"

/** 成员面工作区动作集（§3.7——本人资源自管四件；轮换/快照恢复 = 管理面）。 */
export const MEMBER_WORKSPACE_ACTIONS = Object.freeze(["start", "stop", "destroy"])

/** 会话设置面字段集（PATCH 一次一件——换模型 ∥ 设档 ∥ 四旗 ∥ 标题；§2.11）。 */
export const SESSION_SETTING_KEYS = Object.freeze(["model", "reasoning", "title", "autoApprove", "planMode", "engineering", "advisorGuard"])

/** 子代理键形（`<role>#<id>`——核 `agent/relay-prefix.mjs` 文法同形；`abort { key }` 形门）。 */
const SUBAGENT_KEY_RE = /^[A-Za-z_][\w.-]*#\d+$/

/** 双鉴权（KD-SV-157——cookie ∥ Bearer 成员 key；双门同判权）+ **工作区 key 第三门**（KD-SV-154 射程扩——盒内工具面：
 *  键 → 工作区 → 负责人；作用域 = 本工作区）：出 = `{ member, scopeWorkspaceId }`（`scopeWorkspaceId` 非空 ⇒ 请求面只达该工作区）。
 *  非工作区 key 的成员 key ⇒ 第三门不适用（`scopeWorkspaceId = null`——沿双鉴权面）。 */
export function requireMemberScope(db, req) {
  const session = resolveSession(db, req)
  if (session) return { member: session.member, scopeWorkspaceId: null }
  const match = /^Bearer\s+(.+)$/i.exec(String(req.headers.authorization ?? ""))
  if (match) {
    const auth = verifyKey(db, match[1].trim())
    if (!auth) throw new HttpError("invalid_api_key", "无效的成员 key（Authorization: Bearer <成员 key>）")
    const workspace = db.prepare("SELECT * FROM sandbox_workspaces WHERE key_id = ?").get(Number(auth.keyId))
    if (workspace) {
      return {
        member: findMemberById(db, workspace.owner_member_id) ?? auth.member,
        scopeWorkspaceId: Number(workspace.id),
      }
    }
    return { member: findMemberById(db, auth.memberId) ?? auth.member, scopeWorkspaceId: null }
  }
  throw new HttpError("unauthorized", "会话无效或已过期（请重新登录）")
}

/** 双鉴权（族内常用面——出 = 成员行；第三门判据见 `requireMemberScope`）。 */
export function requireMember(db, req) {
  return requireMemberScope(db, req).member
}

/** 会话 id 解析（复合形 `<workspaceId>:<槽号>`——§3.2）：形不合 ⇒ null（调用侧 404 不辨）。 */
export function parseSessionId(raw) {
  const text = String(raw ?? "")
  const cut = text.indexOf(":")
  if (cut <= 0) return null
  const workspaceId = Number(text.slice(0, cut))
  const slot = text.slice(cut + 1)
  if (!Number.isInteger(workspaceId) || workspaceId <= 0 || slot === "") return null
  return { workspaceId, slot }
}

/** 会话行形（§2.11——建/列表/详情/PATCH 四处同源；盒行键两形兼容：核形 `activeModel`/`effort`/`timestamp`）。
 *  member-face-parity 批扩四键：`title`（槽标题）∥ `count`（槽 history 长）∥ `flags`（槽四旗——KD-SV-218）∥
 *  `awaitingApproval`（在决 ask 读数——relay 内存，需调用侧注入（缺省假））。 */
export function sessionRowOf(workspace, raw = {}, { awaitingApproval = false } = {}) {
  const slot = raw.slot ?? raw.id ?? ""
  return {
    id: `${workspace.id}:${slot}`,
    workspaceId: workspace.id,
    workspaceName: workspace.name,
    model: String(raw.model ?? raw.activeModel ?? raw.activeProvider ?? ""),
    reasoning: raw.reasoning ?? raw.effort ?? null,
    title: String(raw.title ?? ""),
    count: Number.isInteger(raw.count) ? raw.count : 0,
    flags: {
      autoApprove: raw.flags?.autoApprove === true,
      planMode: raw.flags?.planMode === true,
      engineering: raw.flags?.engineering === true,
      advisorGuard: raw.flags?.advisorGuard === true,
    },
    status: String(raw.status ?? "idle"),
    excerpt: String(raw.excerpt ?? raw.firstMessage ?? raw.title ?? ""),
    agentOnline: true, // 盒连接存续读数（本行只在在线盒扇出面出现——§2.12 在线判据）
    awaitingApproval: awaitingApproval === true,
    updatedAt: raw.updatedAt ?? raw.timestamp ?? null,
  }
}

/** 盒指令结果 ⇒ 值 ∥ 抛（`state:"failed"` ⇒ `notFound` 判 404 不辨 ∥ 余 400 人话）。 */
function valueOf(result, { notFoundMessage = null } = {}) {
  if (result?.state === "failed" || result?.state === "error") {
    const detail = result.detail ?? {}
    const message = typeof detail?.message === "string" && detail.message !== "" ? detail.message : "盒侧指令失败"
    if (detail?.notFound === true || detail?.not_found === true) throw new HttpError("not_found", notFoundMessage ?? message)
    throw new HttpError("invalid_request_error", message)
  }
  return result?.detail ?? null
}

/** 更新时间读数（排序键——ISO 串 ∥ 毫秒两形同判；不可解析 ⇒ 0）。 */
function updatedValue(value) {
  if (typeof value === "number" && Number.isFinite(value)) return value
  const parsed = Date.parse(String(value ?? ""))
  return Number.isFinite(parsed) ? parsed : 0
}

/** 盒离线报文（409——人话含启动指引；§3.4/§3.6②）。 */
function offlineMessage(workspace) {
  return `工作区「${workspace.name}」未运行或未连接——请先启动工作区（页面「启动工作区」，或 POST /api/me/sandbox/workspaces/${workspace.id}/start）`
}

/** 工作区行 or 404（本人过滤——他人 ∥ 不存在同判，零存在性泄露）。`scopeWorkspaceId` 非空（工作区 key 第三门）
 *  ⇒ 请求面只达该工作区：`self` 自指解析 + 他区 id 一律 404 不辨（KD-SV-154 射程扩）。 */
function workspaceOr404(db, member, id, scopeWorkspaceId = null) {
  const raw = String(id ?? "")
  const wanted = raw === "self" && scopeWorkspaceId !== null ? scopeWorkspaceId : Number(raw)
  if (!Number.isInteger(wanted) || wanted <= 0) throw new HttpError("not_found", `工作区不存在：${id}`)
  if (scopeWorkspaceId !== null && wanted !== Number(scopeWorkspaceId)) throw new HttpError("not_found", `工作区不存在：${id}`)
  const row = db.prepare("SELECT * FROM sandbox_workspaces WHERE id = ? AND owner_member_id = ?").get(wanted, member.id)
  if (!row) throw new HttpError("not_found", `工作区不存在：${id}`)
  return row
}

/** 工作区名校验（成员面——名称可选：缺省「工作区 N」；N = 本人现存行数 + 1，撞名递增）。 */
function normalizeMemberWorkspaceName(raw, { db, member }) {
  const fallback = () => {
    let n = Number(db.prepare("SELECT COUNT(*) AS n FROM sandbox_workspaces WHERE owner_member_id = ?").get(member.id).n) + 1
    while (db.prepare("SELECT id FROM sandbox_workspaces WHERE name = ?").get(`工作区 ${n}`)) n += 1
    return `工作区 ${n}`
  }
  if (raw === undefined || raw === null) return fallback()
  const name = typeof raw === "string" ? raw.trim() : ""
  if (name === "") return fallback()
  if (name.length > WORKSPACE_NAME_MAX) throw new Error(`工作区名超长（≤ ${WORKSPACE_NAME_MAX} 字符；实长 ${name.length}）`)
  return name
}

/** 成员写面动作行（`sandbox_event`——kind 沿既有枚举，detail 携 `by:"member"`；ACCOUNTS §2.1）。 */
function auditMemberAction(db, { member, workspace, kind, now }) {
  recordAudit(db, {
    type: "sandbox_event",
    actor: member.name,
    actorId: member.id,
    target: workspace.name,
    detail: { kind, workspaceId: workspace.id, by: "member" },
    ts: now(),
  })
}

function checkpointCount(db, workspaceId) {
  return Number(db.prepare("SELECT COUNT(*) AS n FROM sandbox_checkpoints WHERE workspace_id = ?").get(Number(workspaceId)).n)
}

/** 注册成员面对话面 + 工作区写面 + git 凭据（§2.11；14 端点）。注入口径 = `deps`（单元测试档替身——箱面/节点面）。 */
export function registerMemberRoutes(routes, { db, config = {}, log = null, relay, now = Date.now, fetchImpl = fetch, requestImpl = null, deps = {} } = {}) {
  if (!db) throw new Error("registerMemberRoutes：缺少 db")
  if (!relay) throw new Error("registerMemberRoutes：缺少 relay（createMemberRelay 产物）")
  const pulls = createPullRegistry({ relay, db, log, now })
  const boxDeps = { db, config, log, now, fetchImpl, requestImpl, ...deps }

  // ── ① 模型清单（开放清单 + 档位桥同源——§2.11；零 provider 内部细节）──────────────────
  routes.add("GET", "/api/me/chat/models", async (req, res) => {
    requireMember(db, req)
    const models = []
    for (const ref of providerModelRefs(listProviderEntries(db))) {
      let reasoning = []
      try {
        reasoning = await levelsOfRef(db, ref)
      } catch (e) {
        noteDegraded(log, "member-chat-models", e)
        reasoning = [] // 缺核 ⇒ 档位面退中性（零档——回合不阻断）
      }
      models.push({ id: ref, reasoning })
    }
    sendJson(res, 200, { models })
  })

  // ── ② 会话列表（按本人工作区扇出——逐在线盒 `cmd sessions.list` 合并；离线盒的会话不列）─────
  routes.add("GET", "/api/me/chat/sessions", async (req, res) => {
    const member = requireMember(db, req)
    const workspaces = db.prepare("SELECT * FROM sandbox_workspaces WHERE owner_member_id = ? ORDER BY id").all(member.id)
    const sessions = []
    for (const workspace of workspaces) {
      if (!relay.online(workspace.id)) continue
      try {
        const result = await relay.runCommand(workspace.id, "sessions.list", {})
        const rows = Array.isArray(result?.detail?.sessions) ? result.detail.sessions : []
        for (const raw of rows) {
          // 在决 ask 读数（KD-SV-217——relay 内存，列表合并时注入；§2.11 行形 `awaitingApproval`）
          sessions.push(sessionRowOf(workspace, raw, { awaitingApproval: relay.pendingAskOf(workspace.id, raw?.slot ?? raw?.id ?? "") }))
        }
      } catch (e) {
        log?.warn("member_sessions_list_failed", { workspaceId: workspace.id, message: e?.message ?? String(e) }) // 单盒失败不拖垮列表
      }
    }
    sessions.sort((a, b) => updatedValue(b.updatedAt) - updatedValue(a.updatedAt)) // 倒序（新在前）
    sendJson(res, 200, { sessions })
  })

  // ── ③ 建会话（`session.create` 指令——缺省模型 = 开放清单首个；盒离线 ⇒ 409）─────────────
  routes.add("POST", "/api/me/chat/sessions", async (req, res) => {
    const member = requireMember(db, req)
    const body = await readJsonBody(req)
    const workspace = workspaceOr404(db, member, body?.workspaceId)
    const refs = providerModelRefs(listProviderEntries(db))
    let model = typeof body?.model === "string" ? body.model.trim() : ""
    if (model === "") {
      if (refs.length === 0) throw new HttpError("invalid_request_error", "无可用模型（provider 注册表为空）——请联系管理员在「服务模型」页配置")
      model = refs[0]
    } else if (!refs.includes(model)) {
      throw new HttpError("invalid_request_error", `模型不可用：${model}（不在开放清单——先在「服务模型」页配置）`)
    }
    if (!relay.online(workspace.id)) throw new HttpError("workspace_offline", offlineMessage(workspace))
    const detail = valueOf(await relay.runCommand(workspace.id, "session.create", { model })) ?? {}
    const slot = detail.id ?? detail.slot ?? ""
    recordAudit(db, {
      type: "member_event",
      actor: member.name,
      actorId: member.id,
      target: `session:${slot}`, // 盒内槽号可读形
      detail: { kind: "chat_start", sessionId: `${workspace.id}:${slot}` },
      ts: now(),
    })
    sendJson(res, 200, { session: sessionRowOf(workspace, { slot, model }) })
  })

  // ── ④ 会话详情（`session.read` 指令——盒离线 ⇒ 409）───────────────────────────────
  routes.add("GET", "/api/me/chat/sessions/:id", async (req, res, ctx) => {
    const member = requireMember(db, req)
    const parsed = parseSessionId(ctx.params.id)
    if (parsed === null) throw new HttpError("not_found", `会话不存在：${ctx.params.id}`)
    const workspace = workspaceOr404(db, member, parsed.workspaceId)
    if (!relay.online(workspace.id)) throw new HttpError("workspace_offline", offlineMessage(workspace))
    const detail = valueOf(await relay.runCommand(workspace.id, "session.read", { slot: parsed.slot }), { notFoundMessage: `会话不存在：${ctx.params.id}` }) ?? {}
    sendJson(res, 200, {
      session: sessionRowOf(workspace, detail.session ?? { slot: parsed.slot }, { awaitingApproval: relay.pendingAskOf(workspace.id, parsed.slot) }),
      messages: Array.isArray(detail.messages) ? detail.messages : [],
    })
  })

  // ── ⑤ 会话设置面（一次一件——`session.update` ∥ `session.rename` 指令：换模型 ∥ 设档 ∥ 四旗 ∥ 标题；盒离线 ⇒ 409）─
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
    } else {
      // 四模式旗（KD-SV-218——槽四字段；下回合装配生效；ENG⇒PLAN 互斥随核）
      if (typeof body[field] !== "boolean") throw new HttpError("invalid_request_error", `${field} 须为布尔（四模式旗）`)
      args = { slot: parsed.slot, [field]: body[field] }
    }
    const detail = valueOf(await relay.runCommand(workspace.id, command, args), { notFoundMessage: `会话不存在：${ctx.params.id}` }) ?? {}
    const raw = detail.session ?? (detail !== null && typeof detail === "object" ? detail : {})
    sendJson(res, 200, { session: sessionRowOf(workspace, { slot: parsed.slot, ...raw }, { awaitingApproval: relay.pendingAskOf(workspace.id, parsed.slot) }) })
  })

  // ── ⑥ 发消息（NDJSON 帧流——流前门四则；帧 = 转发即弃，零落库）──────────────────────────
  routes.add("POST", "/api/me/chat/sessions/:id/messages", async (req, res, ctx) => {
    const member = requireMember(db, req)
    const parsed = parseSessionId(ctx.params.id)
    if (parsed === null) throw new HttpError("not_found", `会话不存在：${ctx.params.id}`)
    const workspace = workspaceOr404(db, member, parsed.workspaceId)
    if (!relay.online(workspace.id)) throw new HttpError("workspace_offline", offlineMessage(workspace)) // 流前门①
    if (relay.busy(workspace.id, parsed.slot)) throw new HttpError("invalid_request_error", SESSION_BUSY_MESSAGE) // 流前门②（会话级在途门——KD-SV-223）
    const body = await readJsonBody(req)
    const content = typeof body?.content === "string" ? body.content : ""
    if (content.trim() === "") throw new HttpError("invalid_request_error", "content 必填（本轮消息文本）") // 流前门③
    // 流前门④：图片通道（§3.11(6)——携图才取模型 + 核件三门/视觉门 ⇒ 400 人话；零静默丢）
    let images = []
    if (body?.images !== undefined && body?.images !== null) {
      const detail = valueOf(await relay.runCommand(workspace.id, "session.read", { slot: parsed.slot }), { notFoundMessage: `会话不存在：${ctx.params.id}` }) ?? {}
      const model = typeof detail?.session?.model === "string" ? detail.session.model : ""
      images = await assertChatImages(model, body.images, deps)
    }

    res.writeHead(200, { "Content-Type": "application/x-ndjson; charset=utf-8", "Cache-Control": "no-store" })
    res.on("error", () => { /* 断连不炸（回合照跑——执行不依赖连接） */ })
    const emit = (frame) => {
      if (res.writableEnded || res.destroyed) return
      res.write(`${JSON.stringify(frame)}\n`)
    }
    const turn = relay.startTurn({ workspace, sessionId: parsed.slot, content, images, emit })
    await turn.done // 收尾三径（`end` 帧 ∥ 掉线补帧）——终态一律经流内帧呈现
    if (!res.writableEnded && !res.destroyed) res.end()
  })

  // ── ⑦ 中止（`abort` 下行——体扩 `{ key? }`：缺 = 终回合 ∥ 在场 = 停单件；非在跑 ⇒ 400 零副作用）─────────
  routes.add("POST", "/api/me/chat/sessions/:id/abort", async (req, res, ctx) => {
    const member = requireMember(db, req)
    const parsed = parseSessionId(ctx.params.id)
    if (parsed === null) throw new HttpError("not_found", `会话不存在：${ctx.params.id}`)
    const workspace = workspaceOr404(db, member, parsed.workspaceId)
    const body = await readJsonBody(req).catch(() => ({}))
    const key = body?.key === undefined || body?.key === null ? null : String(body.key)
    if (key !== null && !SUBAGENT_KEY_RE.test(key)) {
      throw new HttpError("invalid_request_error", `key 形不合法：${key}（子代理键 = <role>#<id>）`)
    }
    if (!relay.abortTurn(workspace.id, parsed.slot, { key })) {
      throw new HttpError("invalid_request_error", key === null
        ? "本会话不在执行中（无可中止的回合）"
        : `该子代理不在跑：${key}（无可中止的件）`)
    }
    sendJson(res, 200, { ok: true })
  })

  // ── ⑧ 拉仓发起（`pull` 下行——凭据不随命令；盒离线 ⇒ 409）────────────────────────────
  //    注：本路由须先于 :action 注册（同段数——`pulls` 是固定段，先匹配者胜）。
  routes.add("POST", "/api/me/sandbox/workspaces/:id/pulls", async (req, res, ctx) => {
    const { member, scopeWorkspaceId } = requireMemberScope(db, req)
    const workspace = workspaceOr404(db, member, ctx.params.id, scopeWorkspaceId)
    const body = await readJsonBody(req)
    const project = pullProjectOf(db, member, body?.projectId) // 项目 ∈ 本人可见 ⇒ 否则 404 不辨（门序先于盒态——零泄露）
    if (!relay.online(workspace.id)) throw new HttpError("workspace_offline", offlineMessage(workspace))
    let started
    try {
      started = pulls.start({ member, workspace, project, dir: body?.dir })
    } catch (e) {
      if (e instanceof HttpError) throw e
      throw new HttpError("invalid_request_error", e?.message ?? String(e)) // 目录形非法等（库零变）
    }
    sendJson(res, 200, { pullId: started.pullId })
  })

  // ── ⑨ 拉取状态（进程内存读数；服务端重启 ⇒ 未知 ⇒ 「结果未知——重试」）────────────────────
  routes.add("GET", "/api/me/sandbox/workspaces/:id/pulls/:pullId", (req, res, ctx) => {
    const { member, scopeWorkspaceId } = requireMemberScope(db, req)
    const workspace = workspaceOr404(db, member, ctx.params.id, scopeWorkspaceId)
    sendJson(res, 200, pulls.stateOf(ctx.params.pullId, { workspaceId: workspace.id })) // 归属判（工作区不符 ⇒ 不辨）
  })

  // ── ⑩ 建工作区（上限校验 ⇒ 400 `workspace_limit_reached`；放置 + key 签发 + 建盒）────────
  routes.add("POST", "/api/me/sandbox/workspaces", async (req, res) => {
    const member = requireMember(db, req)
    const limit = Number(getSettings(db).memberWorkspaceLimit ?? 3)
    const owned = Number(db.prepare("SELECT COUNT(*) AS n FROM sandbox_workspaces WHERE owner_member_id = ?").get(member.id).n)
    if (owned >= limit) {
      throw new HttpError("workspace_limit_reached", `工作区数量已达上限（${limit} 个）——先销毁不再用的工作区，或请管理员调整上限（memberWorkspaceLimit）`)
    }
    await requireSandboxAvailable(db, { detail: "创建工作区需要节点", fetchImpl, config, requestImpl }) // 写门（实时探活）
    const body = await readJsonBody(req)
    let name
    try {
      name = normalizeMemberWorkspaceName(body?.name, { db, member })
    } catch (e) {
      throw new HttpError("invalid_request_error", e.message)
    }
    if (db.prepare("SELECT id FROM sandbox_workspaces WHERE name = ?").get(name)) {
      throw new HttpError("invalid_request_error", `工作区名已存在：${name}`)
    }
    const key = issueWorkspaceKey(db, { ownerMemberId: member.id, workspaceName: name, now: now() })
    const info = db
      .prepare(`INSERT INTO sandbox_workspaces (name, owner_member_id, key_id, key_plain, runner_id, limits_json, stop_reason, base_image, created_at)
        VALUES (?, ?, ?, ?, NULL, '{}', NULL, NULL, ?)`)
      .run(name, member.id, key.id, key.plain, new Date(now()).toISOString())
    let workspace = db.prepare("SELECT * FROM sandbox_workspaces WHERE id = ?").get(Number(info.lastInsertRowid))
    const runner = await placeWorkspace(db, { fetchImpl, config, requestImpl })
    if (runner !== null) {
      db.prepare("UPDATE sandbox_workspaces SET runner_id = ? WHERE id = ?").run(runner.id, workspace.id)
      workspace = db.prepare("SELECT * FROM sandbox_workspaces WHERE id = ?").get(workspace.id)
      try {
        await createWorkspaceBox(db, workspace, runner, { ...boxDeps, actor: { name: member.name, id: member.id } })
      } catch (e) {
        throw new HttpError("upstream_error", `建盒链失败（行留——重试续链，幂等）：${e?.message ?? e}`)
      }
    }
    auditMemberAction(db, { member, workspace, kind: "workspace_create", now })
    sendJson(res, 200, { workspace: workspaceView(db, workspace, null, { now: now() }) })
  })

  // ── ⑪ 工作区动作（start ∥ stop ∥ destroy——确认门；链错误 ⇒ 502 行留幂等续链）────────────
  routes.add("POST", "/api/me/sandbox/workspaces/:id/:action", async (req, res, ctx) => {
    const { member, scopeWorkspaceId } = requireMemberScope(db, req)
    const action = String(ctx.params.action)
    if (!MEMBER_WORKSPACE_ACTIONS.includes(action)) {
      throw new HttpError("invalid_request_error", `未知动作：${action}（可选：${MEMBER_WORKSPACE_ACTIONS.join(" ∥ ")}）`)
    }
    const workspace = workspaceOr404(db, member, ctx.params.id, scopeWorkspaceId)
    if (workspace.runner_id === null) {
      const candidate = await placeWorkspace(db, { fetchImpl, config, requestImpl })
      throw new HttpError(
        "sandbox_unavailable",
        candidate === null
          ? `工作区「${workspace.name}」待人放（先放置再走链——节点均满员 ∥ 无在线 active）`
          : `工作区「${workspace.name}」尚无绑定节点——先放置（有候选节点，补放置后重试）`,
      )
    }
    const runner = runnerRowOr404(db, workspace.runner_id)
    await requireRunnerAvailable(runner, { detail: `工作区「${workspace.name}」动作「${action}」需要绑定节点在线`, fetchImpl, config, requestImpl })
    const body = await readJsonBody(req).catch(() => ({}))
    const actor = { actor: { name: member.name, id: member.id } }
    /** 链错误 ⇒ 502（`upstream_error` + 人话——机/主机侧失败，行留重试续链）；`HttpError` 原样。 */
    const chain = async (fn) => {
      try {
        return await fn()
      } catch (e) {
        if (e instanceof HttpError) throw e
        throw new HttpError("upstream_error", e?.message ?? String(e))
      }
    }
    if (action === "start") {
      const result = await chain(() => startWorkspaceBox(db, workspace, runner, { ...boxDeps, ...actor }))
      auditMemberAction(db, { member, workspace, kind: "box_start", now })
      sendJson(res, 200, { ok: true, action, ...result })
      return
    }
    if (action === "stop") {
      const result = await chain(() => stopWorkspaceBox(db, workspace, runner, { ...boxDeps, ...actor }, { reason: "manual" }))
      auditMemberAction(db, { member, workspace, kind: "box_stop", now })
      sendJson(res, 200, { ok: true, action, ...result })
      return
    }
    // destroy（确认门 + 读数先行——含卷目录与快照；沿管理面动作面）
    const boxes = await readBoxStatesOf(db, [workspace], boxDeps).catch(() => new Map())
    const box = boxes.get(workspace.id)
    const snapshots = checkpointCount(db, workspace.id)
    if (body?.confirm !== true) {
      throw new HttpError(
        "invalid_request_error",
        `销毁不可逆（含卷目录与快照）：boxState=${box?.boxState ?? "stopped"} ∥ 快照 ${snapshots} 份——确认请携 confirm: true`,
      )
    }
    revokeWorkspaceKey(db, workspace, { now: now() }) // 销毁即吊销工作区 key
    recordAudit(db, {
      type: "key_revoke",
      actor: member.name,
      actorId: member.id,
      target: workspace.name,
      detail: { keyHint: keyHintOf(db, workspace.key_id), workspaceId: workspace.id },
      ts: now(),
    })
    const result = await chain(() => destroyWorkspaceBox(db, workspace, runner, { ...boxDeps, ...actor }, { deleteVolume: body?.deleteVolume !== false }))
    auditMemberAction(db, { member, workspace, kind: "workspace_destroy", now })
    sendJson(res, 200, { ok: true, action, ...result })
  })

  // ── ⑫ git 凭据三端点（§3.6 ∥ KD-SV-204——加密零回显；审计 member-cred）──────────────────
  routes.add("GET", "/api/me/git-credentials", (req, res) => {
    const member = requireMember(db, req)
    sendJson(res, 200, { credentials: listMemberCredentials(db, member.id) })
  })

  routes.add("PUT", "/api/me/git-credentials", async (req, res) => {
    const member = requireMember(db, req)
    const body = await readJsonBody(req)
    let credential
    try {
      credential = setMemberCredential(db, { member, host: body?.host, username: body?.username, secret: body?.secret, config, now })
    } catch (e) {
      throw new HttpError("invalid_request_error", e.message) // 形非法 ⇒ 400 库零变
    }
    sendJson(res, 200, { credential })
  })

  routes.add("DELETE", "/api/me/git-credentials/:host", (req, res, ctx) => {
    const member = requireMember(db, req)
    let view
    try {
      view = revokeMemberCredential(db, { member, host: ctx.params.host, now })
    } catch (e) {
      if (e instanceof HttpError) throw e
      throw new HttpError("invalid_request_error", e.message)
    }
    void view
    sendJson(res, 200, { ok: true })
  })

  // ── ⑬ ask 应答 / 会话删除 / `@` 候选三端点（拆档 `member-asks.mjs`——族内助手经 `helpers` 注入）───
  registerMemberAskRoutes(routes, {
    db,
    relay,
    helpers: { requireMember, parseSessionId, workspaceOr404, offlineMessage, valueOf },
  })
}

/** key 提示形（审计 detail——零秘密）。 */
function keyHintOf(db, keyId) {
  const row = db.prepare("SELECT key_hint FROM api_keys WHERE id = ?").get(Number(keyId))
  return row?.key_hint ?? null
}

/** 装配一行（`bin` 用）：自持 relay 实例 + 注册成员面与盒面两杆（§3.1 两杆相接）。 */
export function registerMemberFaceRoutes(routes, { db, config = {}, log = null, now = Date.now, fetchImpl = fetch, requestImpl = null, deps = {} } = {}) {
  const relay = deps.relay ?? createMemberRelay({
    db,
    log,
    now,
    ...(deps.pingIntervalMs === undefined ? {} : { pingIntervalMs: deps.pingIntervalMs }),
    ...(deps.pongWindowMs === undefined ? {} : { pongWindowMs: deps.pongWindowMs }),
    ...(deps.cmdTimeoutMs === undefined ? {} : { cmdTimeoutMs: deps.cmdTimeoutMs }),
  })
  registerMemberRoutes(routes, { db, config, log, relay, now, fetchImpl, requestImpl, deps })
  registerBoxRoutes(routes, { db, config, log, relay, now, deps })
  return { relay }
}
