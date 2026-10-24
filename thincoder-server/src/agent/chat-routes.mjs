/**
 * chat-routes.mjs — 管理面 agent 会话面七端点（`gateway/API.md` §2.8 ∥ `agent/ADMIN-AGENT.md` §11；admin-agent-chat 批——台账 #1254；
 * 换模型 ∥ 中止两端点 = chat-shell-align 批——KD-SV-107/108；ask 应答 = admin-approval-cards 批——KD-SV-224）：建会话 ∥ 会话列表（倒序）∥ 会话详情（消息全量）∥ 发一条（NDJSON 帧流）∥ 会话设置面 ∥ 请求中止 ∥ ask 应答。
 *
 * 契约（§2.8）：端点族 = `/api/admin/agent/*`；判权 = `requireAdmin` 全族（`user` ⇒ 403 ∥ 无/过期会话 ⇒ 401）；错误形 = §3 全码沿用（**零新码**）；
 * 在途门（`running` ⇒ 400 人话）∥ 不存在 ⇒ 404 ∥ `content` 空/非字符串 ⇒ 400 ∥ 模型不可用 ⇒ 400 ∥ `images` 三门（非数组 ∥ 非栅格四型 ∥ 单图超阈）∥ 非多模态模型 ⇒ 400（**皆流未起——信封形**）。
 * 换模型（KD-SV-108）= **明选即换、下回合生效**（`PATCH` 更新既有列；在途回合零触——`runChatTurn` 起跑读行）∥ **档位随写清 NULL**（换模型回中性——KD-SV-110 口径②）∥ 零审计行。
 * 会话设置面（KD-SV-110/226——console-reasoning-levels ∥ admin-approval-cards 批）：`PATCH` 为**一次一件**（`{ model }` ∥ `{ reasoning }` ∥ `{ autoApprove }`；
 * 双携 ⇒ 400 人话）；`{ reasoning }` 值域 = 当刻模型核枚举（别名反解上游真名——桥件 `reasoning-levels.mjs`；
 * `null` = 清；表外/非串 ⇒ 400 库零变；缺核 ⇒ 400 人话）；`{ autoApprove }` = 布尔（审批免问旗——下回合生效；KD-SV-226）。
 * 中止（KD-SV-107）= 在途门（非 `running` ⇒ 400「本会话不在执行中」——零副作用）+ 登记表置位 + 在决 ask 同拍拒值（KD-SV-227）；终态经流/详情形呈。
 * 流形：`application/x-ndjson`（每行一帧 `turn`/`delta`/`usage`/`call`/`result`/`end`；`Cache-Control: no-store`）；**流中失败 = `end` 帧**（headers 已发——不再走信封）。
 * 重启恢复（`running` ⇒ `idle` + notice + `chat_stop` 审计）= **装配期执行**（无端点——本注册行内跑；KD-SV-86 如实收尾）。
 * 唤醒器接线（§15.1 三链尾①——server-wake-face 批）：用户回合尾 = `pumpChatWake`（有交付 ⇒ 撤旧闩 + 消化：已到期/留件
 * 不武装 0ms 闩；否则再武装——防自旋/惊群）；唤醒器本体 = `chat-wake.mjs`（结算钩子 = 每回合环境 ctx 段装配）。
 * 审计写（`agent_event`——KD-SV-91）：`chat_start`（会话创建）∥ 重启 `chat_stop` 在本档；逐调用 `chat_call` 与异常/中止 `chat_stop` 在 `chat.mjs`。
 * 审批 ask（KD-SV-224–227）：`POST …/:id/asks/:promptId`（体按 kind——`askAnswerBodyOf` 同源校验）；流断（`res` close）⇒ `closeChatAskStream`
 * （宿主在册 ⇒ 无问面 + 未决全拒；**起跑窗**（宿主未登记）⇒ 按流 token 落集、建宿主时消费——断流后写类零等待）。
 * 注入口径（单元测试档替身）：`deps`（`chat` 假模型出口 ∥ `tools` 假工具面 ∥ `imageGate` 图片门核件替身 ∥ `runtime`/`config`/`env`/`fetchImpl`/`guard` 工具面装配上下 ∥ `budget`）。
 */
import { recordAudit } from "../accounts/audit.mjs"
import { requireAdmin } from "../accounts/session.mjs"
import { HttpError, sendJson } from "../gateway/errors.mjs"
import { listProviderEntries } from "../gateway/providers.mjs"
import { levelsOfRef } from "../gateway/reasoning-levels.mjs"
import { readJsonBody } from "../gateway/server.mjs"
import { assertChatIdle, chatRowOr404, claimChatTurn, createChat, getChatDetail, listChats, requestChatAbort, resumeRunningChats, runChatTurn } from "./chat.mjs"
import { answerChatAsk, closeChatAskStream, setAutoApprove } from "./chat-asks.mjs"
import { pumpChatWake } from "./chat-wake.mjs"
import { providerModelRefs } from "./run.mjs"

/** 模型可用性判（KD-SV-87 同判——建会话 ∥ 发消息 ∥ 换模型三处同门）：不合 ⇒ 抛（调用侧转 400 信封；消息人话）。 */
export function assertChatModelAvailable(db, model) {
  const refs = new Set(providerModelRefs(listProviderEntries(db)))
  if (refs.size === 0) throw new Error("无可用模型（provider 注册表为空）——先在服务模型页配置 provider")
  if (!refs.has(model)) throw new Error(`模型不可用：${model}（不在注册表——先在服务模型页配置）`)
}

/** 图片门核件装载（KD-SV-109——核 `attachments.mjs` **单源**）：动载（同 `loadCoreChat` 先例——部署前提 = 依赖声明）；
 *  本仓开发面经 `deps.imageGate` 注入口替身（生产行为不变）；**只在携图请求上装载**（纯文本轮零核依赖）。 */
export async function loadImageGate(deps = {}) {
  if (deps.imageGate) return deps.imageGate
  const mod = await import("@thincoder/core/attachments.mjs")
  return { parseDataUrl: mod.parseDataUrl, isNonVisionModel: mod.isNonVisionModel }
}

/** 图片校验三门（KD-SV-109——栅格四型 ∥ 单图 ≤15MB = 核 `parseDataUrl` 单判；非数组 = 形拒）+ 视觉门（核 `isNonVisionModel`）。
 *  出 = 原序 dataURL 串列（空 ∥ 缺 ⇒ `[]` = 纯文本轮，零核装载）。不合均抛（→ 400 信封——**流未起**）。 */
export async function assertChatImages(model, images, deps = {}) {
  if (images === undefined || images === null) return []
  if (!Array.isArray(images)) throw new HttpError("invalid_request_error", "images 形不合法：须为 dataURL 字符串数组")
  if (images.length === 0) return []
  const gate = await loadImageGate(deps)
  const bad = images.findIndex((item) => gate.parseDataUrl(item) === null)
  if (bad >= 0) throw new HttpError("invalid_request_error", `图片不合规（第 ${bad + 1} 张）：仅支持 png ∥ jpg ∥ gif ∥ webp，单图 ≤ 15MB`)
  if (gate.isNonVisionModel(model)) throw new HttpError("invalid_request_error", `当前模型不支持图片输入：${model}（规格表未标多模态）`)
  return images.map((item) => String(item))
}

/**
 * 注册会话面四端点（§2.8）：装配期先跑**重启恢复钩**（`running` ⇒ `idle` + notice + 审计——KD-SV-86）。
 * 出 = 无（端点行即注册面）；`deps` 透传 `runChatTurn`（注入面——见档头）。
 */
export function registerChatRoutes(routes, { db, log = null, deps = {}, now = Date.now } = {}) {
  if (!db) throw new Error("registerChatRoutes：缺少 db（openDatabase 产物）")

  // 重启恢复（§11——装配期；无端点；已落库消息零动）
  const recovered = resumeRunningChats(db, { now })
  if (recovered > 0) log?.info("chat_restart_recovered", { chats: recovered })

  routes.add("POST", "/api/admin/agent/chats", async (req, res) => {
    const { member: admin } = requireAdmin(db, req)
    const body = await readJsonBody(req)
    const model = typeof body?.model === "string" ? body.model.trim() : ""
    if (model === "") throw new HttpError("invalid_request_error", "model 必填（建会话时选择——下拉源 = 服务模型页开放清单）")
    try {
      assertChatModelAvailable(db, model)
    } catch (e) {
      throw new HttpError("invalid_request_error", e.message) // 400（KD-SV-87 同判——库零变）
    }
    const row = createChat(db, { model, createdBy: admin.id, now })
    recordAudit(db, {
      type: "agent_event",
      actor: admin.name,
      actorId: admin.id,
      target: `chat:${row.id}`,
      detail: { kind: "chat_start", chatId: row.id },
      ts: now(),
    })
    sendJson(res, 200, { chat: { id: row.id, model: row.model, reasoning: row.reasoning ?? null, autoApprove: row.auto_approve === 1, status: row.status, createdAt: row.created_at, updatedAt: row.updated_at } })
  })

  routes.add("GET", "/api/admin/agent/chats", (req, res) => {
    requireAdmin(db, req)
    sendJson(res, 200, listChats(db)) // 倒序（新在前；行携 excerpt）
  })

  routes.add("GET", "/api/admin/agent/chats/:id", (req, res, ctx) => {
    requireAdmin(db, req)
    const detail = getChatDetail(db, ctx.params.id)
    if (!detail) throw new HttpError("not_found", `会话不存在：${ctx.params.id}`)
    sendJson(res, 200, detail)
  })

  routes.add("POST", "/api/admin/agent/chats/:id/messages", async (req, res, ctx) => {
    const { member: admin } = requireAdmin(db, req) // 发送者 = 凭据主体（谁用谁——2026-10-13 16:39 裁）
    const row = chatRowOr404(db, ctx.params.id) // 不存在 ⇒ 404（信封）
    const body = await readJsonBody(req)
    const content = typeof body?.content === "string" ? body.content : ""
    if (content.trim() === "") throw new HttpError("invalid_request_error", "content 必填（本轮消息文本）")
    assertChatIdle(row) // 在途门只读预检（§2.8 行序：在途先行于模型校——报文与置位同一个）
    try {
      assertChatModelAvailable(db, row.model)
    } catch (e) {
      throw new HttpError("invalid_request_error", e.message) // 模型不可用 ⇒ 400（流未起——信封形）
    }
    // 流出口 + 流断监听必须在**回合装配的任一 await 之前**挂上（KD-SV-227 兜底三径之三；`stream` = 本请求流 token）——`readJsonBody` 之类请求期 await 不在此列（此时尚无回合、无卡可结算）：
    // 携图请求的首个 await（`assertChatImages` 装载核件）期间断流同样要落集——起跑窗与装载窗共用同一判定：
    // 断流后任意时刻的写类调用都不等一张无人应答的卡。正常收尾（`res.end` 后的 close）不登记：回合已尽、无卡可结算
    // （异流残留不生效——建宿主时按 token 对位消费并删）；400 信封路径同理（`sendJson` 已 `end` ⇒ `writableEnded` 为真 ⇒ 零登记）。
    res.on("error", () => {}) // 断连不炸（回合照跑——执行不依赖连接）
    const emit = (frame) => {
      if (res.writableEnded || res.destroyed) return
      res.write(`${JSON.stringify(frame)}\n`)
    }
    res.on("close", () => {
      if (res.writableEnded !== true) closeChatAskStream(row.id, { stream: emit })
    })

    const images = await assertChatImages(row.model, body?.images, deps) // 图片门（KD-SV-109——流未起：信封形）
    claimChatTurn(db, row.id, { now }) // 置在途（同步段——零竞态）

    // 流起（此后 errors 走 `end` 帧——headers 已发）
    res.writeHead(200, {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-store",
    })
    try {
      await runChatTurn({ db, chatId: row.id, content, images, emit, deps, now, log, senderId: admin.id })
    } catch (e) {
      log?.error("chat_turn_failed", { chatId: row.id, message: e?.message ?? String(e) })
      emit({ type: "end", status: "failed", reason: `回合异常：${e?.message ?? e}` })
    } finally {
      // 链尾①（§15.1）：回合尾再武装/消化（异步不阻响应——开轮失败零反噬；唤醒轮无路由无帧面）
      void pumpChatWake({ chatId: row.id, db, deps, now, log, senderId: admin.id }).catch((e) =>
        log?.warn("chat_wake_failed", { chatId: row.id, message: e?.message ?? String(e) }))
      if (!res.writableEnded && !res.destroyed) res.end()
    }
  })

  // 会话设置面（KD-SV-108/110/226——**一次一件**：`{ model }` ∥ `{ reasoning }` ∥ `{ autoApprove }`；双携 ⇒ 400 人话）：
  // `{ model }` = 明选即换、下回合生效（在途回合零触——`runChatTurn` 起跑读行）；**档位随写清 NULL**（换模型回中性——口径②）。
  // `{ reasoning }` = 值域 = 当刻模型核枚举（别名反解上游真名——KD-SV-59；`null` = 清）；表外/非串/缺核 ⇒ 400 库零变。
  // `{ autoApprove }` = 审批免问旗（布尔——下回合生效；KD-SV-226）；库零变 = 模型不在开放清单（同判——KD-SV-87）；**零审计行**（三 kind 面不扩——KD-SV-91）。
  routes.add("PATCH", "/api/admin/agent/chats/:id", async (req, res, ctx) => {
    requireAdmin(db, req)
    const row = chatRowOr404(db, ctx.params.id)
    const body = await readJsonBody(req)
    const present = ["model", "reasoning", "autoApprove"].filter((key) => body?.[key] !== undefined)
    if (present.length > 1) {
      throw new HttpError("invalid_request_error", `一次一件：body 不得同携 ${present.join(" ∥ ")}（会话设置面——换模型/设档位/免问旗分开提交）`)
    }
    const ts = new Date(now()).toISOString()
    const hasModel = present.includes("model")
    const hasReasoning = present.includes("reasoning")
    const hasAutoApprove = present.includes("autoApprove")
    if (hasModel) {
      const model = typeof body.model === "string" ? body.model.trim() : ""
      if (model === "") throw new HttpError("invalid_request_error", "model 必填（会话内换模型——下回合生效）")
      try {
        assertChatModelAvailable(db, model)
      } catch (e) {
        throw new HttpError("invalid_request_error", e.message) // 400（库零变——KD-SV-108）
      }
      db.prepare("UPDATE agent_chats SET model = ?, reasoning = NULL, updated_at = ? WHERE id = ?").run(model, ts, row.id) // 换模型回中性（口径②——同一写）
    } else if (hasReasoning) {
      const reasoning = body.reasoning
      if (reasoning !== null && typeof reasoning !== "string") {
        throw new HttpError("invalid_request_error", "reasoning 须为字符串或 null（null = 清空档位）")
      }
      if (reasoning !== null) {
        let levels
        try {
          levels = await levelsOfRef(db, row.model) // 值域桥件（当刻模型核枚举——别名反解上游真名）
        } catch (e) {
          throw new HttpError("invalid_request_error", `${e.message}——档位面暂不可写（库零变）`) // 缺核 ⇒ 400 人话
        }
        if (!levels.includes(reasoning)) {
          throw new HttpError("invalid_request_error", `思考档位不在当前模型枚举内：${reasoning}（模型 ${row.model}）——库零变`)
        }
      }
      db.prepare("UPDATE agent_chats SET reasoning = ?, updated_at = ? WHERE id = ?").run(reasoning, ts, row.id)
    } else if (hasAutoApprove) {
      if (typeof body.autoApprove !== "boolean") throw new HttpError("invalid_request_error", "autoApprove 须为布尔（true = 写类免问 ∥ false = 恢复弹卡）")
      setAutoApprove(db, row.id, body.autoApprove, { now }) // 免问旗写（KD-SV-226——下回合生效）
    } else {
      throw new HttpError("invalid_request_error", "会话设置面：body 须携 model ∥ reasoning ∥ autoApprove 之一（一次一件）")
    }
    const updated = chatRowOr404(db, row.id)
    sendJson(res, 200, { chat: { id: updated.id, model: updated.model, reasoning: updated.reasoning ?? null, autoApprove: updated.auto_approve === 1, status: updated.status, createdAt: updated.created_at, updatedAt: updated.updated_at } })
  })

  // 请求中止在途回合（KD-SV-107）：在途门（非 `running` ⇒ 400「本会话不在执行中」——零副作用）；置登记表 ⇒ 环内检查点/在途信号任一即刻生效；
  // 终态（notice 行 ∥ `chat_stop` 审计 ∥ `end` 帧）经流/详情形呈——**本行零副作用**。
  routes.add("POST", "/api/admin/agent/chats/:id/abort", (req, res, ctx) => {
    requireAdmin(db, req)
    const row = chatRowOr404(db, ctx.params.id)
    if (row.status !== "running") throw new HttpError("invalid_request_error", "本会话不在执行中（无可中止的回合）")
    requestChatAbort(row.id)
    sendJson(res, 200, { ok: true })
  })

  // ask 应答（`gateway/API.md` §2.8 第七端点——KD-SV-224）：体按 kind（`{ verdict }`——`askAnswerBodyOf` 同源校验）；
  // 命中在途 ⇒ 200 `{ ok: true }`（结算 ⇒ 回合续跑）；未知 ∥ 已了结 ∥ 体不合 ⇒ 400 人话（零副作用）；不存在 ⇒ 404。
  routes.add("POST", "/api/admin/agent/chats/:id/asks/:promptId", async (req, res, ctx) => {
    requireAdmin(db, req)
    const row = chatRowOr404(db, ctx.params.id)
    const body = await readJsonBody(req)
    if (!answerChatAsk(row.id, ctx.params.promptId, body ?? {})) {
      throw new HttpError("invalid_request_error", `ask 应答不可用（未知 ∥ 已了结 ∥ 体与 kind 不符）：${String(ctx.params.promptId)}——零副作用`)
    }
    sendJson(res, 200, { ok: true })
  })
}
