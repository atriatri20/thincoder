/**
 * chat-asks.mjs — 管理面审批 ask 宿主（`agent/ADMIN-AGENT.md` §11.5 ∥ KD-SV-224–227；admin-approval-cards 批）：
 * 写类门挡（判类单源 = 工具面 `readonlyOf`——KD-SV-225）∥ `ask` 帧构造（`permission` ∥ `batch`——帧形全文 = 机制档 §11.3）∥
 * 应答 ⇒ 结算续跑（裁决词表/体校验自 `ask-vocab.mjs` **导入复用——零第二份**：`askAnswerBodyOf`）∥
 * 兜底三径（回合收尾 ∥ 中止 ∥ 流断 ⇒ 未决卡全量拒值；无流唤醒轮 ⇒ 写类即时拒——KD-SV-227）∥ 置库（`auto_approve`——KD-SV-226）。
 *
 * 宿主生命周期（每回合一枚）：`chat.mjs` 回合环装配面 `createChatAskHost`（登记在途宿主表）→ 每模型调用批次
 * `preflight(pending)`（判类 + 弹卡/批卡 + 等应答）→ 逐调用 `admit(call)`（放行 ∥ 拒；`oneByOne` 批在此逐件弹卡）→
 * `finally` ⇒ `close()`（未决全拒 + 出表）。应答路由 = `POST /api/admin/agent/chats/:id/asks/:promptId`
 * （`chat-routes.mjs`——`answerChatAsk`）；中止 = `requestChatAbort` 同拍结算。
 * 流断 = 路由 `res` close ⇒ `closeChatAskStream`：宿主在册 ⇒ 落「无问面」态 + 结算未决；**宿主尚未登记**（起跑窗——回合装配段
 * 内有 MCP 建连/压缩等 await）⇒ 按流 token（本请求 `emit`）落 `closedStreams`，宿主建成时对位消费 ⇒ 生为无问面（写类零卡即时拒）
 * ——事件不丢，断流后任意时刻的写类调用都不等无人应答的卡。弹卡口（`askPermission`/`askBatch`）对无问面同拍零卡拒（逐件径同门）。
 * 条目消费即删（每会话至多一枚；异流残留不生效——防跨回合泄漏）；正常收尾的 close 不登记（路由判 `res.writableEnded`）。
 * 拒执行面（单文单源）：`ASK_REJECTED_MESSAGE`（用户拒 ∥ 兜底三径）∥ `ASK_NO_STREAM_MESSAGE`（唤醒轮无问面）——
 * 工具行/`result` 帧/`chat_call`（resultCode −1）三面同值（`chat.mjs` 逐调用落行）。
 * 免问轨：回合起跑读行 `auto_approve`（`chat.mjs` 传入）∥ `always` 当回合即时置真（`setAutoApprove`）——写类不过门直执行；
 * `PATCH …/:id { autoApprove }` = 唯一人工清径（下回合生效——路由面）。
 * 收窄（本面边界）：唯二 kind（`permission`/`batch`——`question`/`secret` 管理面无源，§11.5 收窄条）；应答词表仍四 kind 全集
 * （校验单源不缩——收窄只在弹出侧）。
 */

import { appendMessage } from "./chat-store.mjs"
import { askAnswerBodyOf } from "./ask-vocab.mjs"

/** 拒执行报文（用户拒 ∥ 兜底三径——工具行/结果帧/审计三面同值）。 */
export const ASK_REJECTED_MESSAGE = "用户拒绝——未执行"
/** 无问面报文（唤醒轮——无流；KD-SV-227「写类即时拒」）。 */
export const ASK_NO_STREAM_MESSAGE = "无问面（无人值守轮）——未执行"

let askSeq = 0 // promptId 序（单进程自增——形 `ask-<n>`；会话间不重复）

/** 在途宿主表（chatId ⇒ host——应答路由对位；回合收尾出表）。 */
const hosts = new Map()

/** 起跑窗流断登记（chatId ⇒ 断流时的流 token = 该请求的 `emit`）：宿主登记前 `res` close 落此（事件不丢——起跑窗竞态），
 *  建宿主时按 token 对位消费并删（每会话至多一枚；异流残留不生效——防跨回合/跨库 id 复用误判）。 */
const closedStreams = new Map()

/** 行 `auto_approve` 写（`always` ∥ `PATCH …/:id { autoApprove }` 两写径单源——KD-SV-226）。 */
export function setAutoApprove(db, chatId, value, { now = Date.now } = {}) {
  const ts = new Date(now()).toISOString()
  db.prepare("UPDATE agent_chats SET auto_approve = ?, updated_at = ? WHERE id = ?").run(value === true ? 1 : 0, ts, Number(chatId))
  return value === true
}

/** ask 应答（路由面单点）：命中在途 ask ∧ 体与 kind 相符 ⇒ 结算（真）；未知 ∥ 已了结 ∥ 体不合 ⇒ 假（调用侧 400 零副作用）。 */
export function answerChatAsk(chatId, promptId, payload = {}) {
  const host = hosts.get(Number(chatId))
  return host ? host.answer(promptId, payload) : false
}

/** 未决 ask 全量拒值（中止 ∥ 回合收尾——KD-SV-227 兜底三径）：出 = 结算条数。 */
export function settleChatAsks(chatId, { message = ASK_REJECTED_MESSAGE } = {}) {
  const host = hosts.get(Number(chatId))
  return host ? host.settleAll(message) : 0
}

/** 流断（`res` close——兜底三径之三）：宿主在册 ⇒ 先落「无问面」态（后续写类即时拒——防永无应答者吊死回合），再结算未决；
 *  宿主尚未登记（起跑窗——内有 MCP 建连/压缩等 await）⇒ 按流 token 落集，建宿主时消费（事件不丢——防首个写类调用等一张无人应答的卡）。 */
export function closeChatAskStream(chatId, { message = ASK_REJECTED_MESSAGE, stream = null } = {}) {
  const id = Number(chatId)
  const host = hosts.get(id)
  if (host) return host.markStreamClosed(message)
  closedStreams.set(id, stream) // 起跑窗：宿主未被消费前宿主不存在 ⇒ 落集（建宿主时对位消费并删）
  return 0
}

/**
 * 开宿主（每回合一枚——`chat.mjs` 回合环装配面调；`finally` 必调 `close()`）。
 * 入参：`db` = openDatabase 产物（`auto_approve` 置真面）∥ `chatId` ∥ `emit` = 帧出口（ask 帧——同回合 `call`/`result` 帧出口）
 * ∥ `hasStream` = 本回合有活体流（唤醒轮 `false` ⇒ 写类即时拒）∥ `autoApprove` = 回合起跑行值（`auto_approve === 1`）
 * ∥ `stream` = 本回合流 token（路由 `res` close 携带的同值——起跑窗断流对位；无流唤醒轮 `null`）
 * ∥ `tools` = 当回合工具面（`readonlyOf` 判类单源；缺席 ⇒ 读类——既有消费零破）∥ `parseArgs`（入参解析——非对象不弹卡）
 * ∥ `argsOf`（掩蔽截断串 ≤500——与 `call` 帧同链）∥ `isAborted`（中止登记读函数——在建即零卡）∥ `auditCall`（`chat_call` 写面——中止径拒行）∥ `textNames`（文本面名集——拒行 content 形）∥ `now` ∥ `log`。
 * 出 = `{ preflight(calls), admit(call), rejectRest(calls), close(), answer(promptId, payload), settleAll(message), markStreamClosed(message) }`。
 */
export function createChatAskHost({ db = null, chatId, emit = null, stream = null, hasStream = false, autoApprove = false, tools = null, parseArgs = null, argsOf = null, isAborted = null, auditCall = null, textNames = null, now = Date.now, log = null } = {}) {
  const id = Number(chatId)
  const pending = new Map() // promptId ⇒ { kind, resolve }
  const decisions = new Map() // call 对象 ⇒ { allow:false, message } ∥ { item:true }（逐调用裁决——同批次对象同一性）
  const preClosed = closedStreams.get(id) // 起跑窗断流对位（= 本回合流 token ⇒ 生为无问面；异流残留 = 上一回合正常收尾的 close）
  closedStreams.delete(id) // 消费即删（每会话至多一枚——防泄漏）
  // 流存活面（活体建宿主；断线后由 `markStreamClosed` 降为无问面）：起跑窗断流且 token 同流 ⇒ 生为无问面
  let streamAlive = hasStream === true && (preClosed === undefined || preClosed !== stream)
  let waived = autoApprove === true // 免问轨（回合起跑行值 ∥ `always` 当回合即时置真）
  let closed = false

  function emitFrame(frame) {
    try {
      emit?.(frame)
    } catch (e) {
      log?.warn("chat_ask_emit_failed", { chatId: id, message: e?.message ?? String(e) }) // 断连不反噬（回合照跑——落库单源）
    }
  }

  /** ask 帧 `args`（掩蔽截断串 ≤500——掩蔽链同 `call` 帧；`argsOf` 缺位 ⇒ 原串截断兜底）。 */
  function argsTextOf(call) {
    const raw = String(call?.arguments ?? "")
    return typeof argsOf === "function" ? argsOf(raw) : raw.slice(0, 500)
  }

  /** 判类（KD-SV-225）：入参非 JSON 对象 ⇒ 不弹（走既有工具级错误）∥ `readonlyOf` 缺席面 ⇒ 读类 ∥ 免问轨 ⇒ 直执行。 */
  function isGated(call) {
    if (waived) return false
    if (tools === null || typeof tools.readonlyOf !== "function") return false
    const args = typeof parseArgs === "function" ? parseArgs(String(call?.arguments ?? "")) : null
    if (args === null) return false
    return tools.readonlyOf(String(call?.name ?? ""), args) !== true
  }

  /** 单件卡（`permission`——`{ promptId, tool, args }`）。出 = Promise<{ verdict, message? }>。
   *  流已断（兜底三径之三已落）⇒ 零卡即时拒——断流后任意时刻的写类调用都不等无人应答的卡（`admit` 逐件径同受此门）。 */
  function askPermission(call) {
    if (streamAlive !== true) return Promise.resolve({ verdict: "reject", message: ASK_NO_STREAM_MESSAGE })
    const promptId = `ask-${++askSeq}`
    return new Promise((resolve) => {
      pending.set(promptId, { kind: "permission", resolve })
      emitFrame({ type: "ask", kind: "permission", promptId, tool: String(call?.name ?? ""), args: argsTextOf(call) })
    })
  }

  /** 批卡（`batch`——`{ promptId, count, tools }`；同批次 >1 写类 ⇒ 恰一卡）。出 = Promise<{ verdict, message? }>。 */
  function askBatch(calls) {
    if (streamAlive !== true) return Promise.resolve({ verdict: "reject", message: ASK_NO_STREAM_MESSAGE })
    const promptId = `ask-${++askSeq}`
    return new Promise((resolve) => {
      pending.set(promptId, { kind: "batch", resolve })
      emitFrame({ type: "ask", kind: "batch", promptId, count: calls.length, tools: calls.map((call) => String(call?.name ?? "")) })
    })
  }

  /** 单件裁决落表：`once`/`always` ⇒ 放行（`always` 的置真在 `answer` 同拍完成）∥ `reject`（含兜底）⇒ 拒。 */
  function settleItem(call, settled) {
    const verdict = settled?.verdict ?? "reject"
    if (verdict === "once" || verdict === "always") return
    decisions.set(call, { allow: false, message: settled?.message ?? ASK_REJECTED_MESSAGE })
  }

  /** 批次前门（KD-SV-224 形同成员面）：中止在建 ⇒ 已过门调用记拒（行/审计随中止径落——B83）；判类 ⇒ 无写类零卡 ∥ 无流即时拒 ∥ 免问直过 ∥ 单件卡 ∥ 批卡（同批次 >1 写类）。 */
  async function preflight(calls) {
    decisions.clear()
    if (closed) return
    const gated = (Array.isArray(calls) ? calls : []).filter((call) => isGated(call))
    if (gated.length === 0) return
    if (isAborted?.() === true) {
      for (const call of gated) decisions.set(call, { allow: false, message: ASK_REJECTED_MESSAGE }) // 中止已登记 ⇒ 零卡（回合环下一检查点收尾）
      return
    }
    if (streamAlive !== true) {
      for (const call of gated) decisions.set(call, { allow: false, message: ASK_NO_STREAM_MESSAGE }) // 无问面（唤醒轮）——写类即时拒
      return
    }
    if (gated.length === 1) {
      settleItem(gated[0], await askPermission(gated[0]))
      return
    }
    const settled = await askBatch(gated)
    const verdict = settled?.verdict ?? "reject"
    if (verdict === "approveAll") return // 批级放行（非持久——同核语义）
    if (verdict !== "oneByOne") {
      for (const call of gated) decisions.set(call, { allow: false, message: ASK_REJECTED_MESSAGE }) // deny ∥ 兜底 ⇒ 整批拒
      return
    }
    for (const call of gated) decisions.set(call, { item: true }) // oneByOne ⇒ admit 时依序逐件弹卡
  }

  /** 逐调用放行判（`chat.mjs` 环内调；已结算裁判在表）：出 = `{ allow:true }` ∥ `{ allow:false, message }`。 */
  async function admit(call) {
    const decided = decisions.get(call)
    if (decided === undefined) {
      if (closed) return { allow: false, message: ASK_REJECTED_MESSAGE }
      return { allow: true } // 未过门 ∥ 批级放行 ∥ `once`/`always` 已放行
    }
    if (decided.item !== true) return decided
    if (waived) return { allow: true } // 前一件 `always` ⇒ 当回合即时免问
    if (closed) return { allow: false, message: ASK_REJECTED_MESSAGE }
    settleItem(call, await askPermission(call))
    return decisions.get(call) ?? { allow: true }
  }

  /** ask 应答（体与 kind 相符才结算——`askAnswerBodyOf` 单源）：出 = 布尔（假 ⇒ 路由 400 零副作用）。 */
  function answer(promptId, payload) {
    const entry = pending.get(String(promptId))
    if (closed || !entry) return false
    const body = askAnswerBodyOf(entry.kind, payload)
    if (body === null) return false
    pending.delete(String(promptId))
    if (body.verdict === "always") {
      waived = true // 当回合即时免问
      if (db) setAutoApprove(db, id, true, { now })
    }
    entry.resolve({ verdict: body.verdict })
    return true
  }

  /** 中止径拒值落行（B83②——工具行/审计同 B82；只盖已过门调用）：逐件工具行 + `chat_call`（−1）+ `call`/`result` 帧。 */
  function rejectRest(calls) {
    for (const call of Array.isArray(calls) ? calls : []) {
      const decided = decisions.get(call)
      if (decided === undefined) continue // 读类未被问 ⇒ 零行（回合已停——非「用户拒」）
      const message = typeof decided.message === "string" ? decided.message : ASK_REJECTED_MESSAGE
      const name = String(call?.name ?? "")
      const callArgs = argsTextOf(call)
      const isText = textNames?.has?.(name) === true
      emitFrame({ type: "call", id: call.id, name, args: callArgs })
      if (db) appendMessage(db, id, { role: "tool", content: isText ? message : JSON.stringify({ ok: false, message }), data: { toolCallId: call.id, name, ok: false, summary: message }, now })
      emitFrame({ type: "result", id: call.id, ok: false, summary: message })
      auditCall?.({ tool: name, call: callArgs, subject: isText ? "" : null, resultCode: -1, truncated: false, summary: message })
    }
  }

  /** 未决全量拒值（兜底三径）：出 = 结算条数。 */
  function settleAll(message = ASK_REJECTED_MESSAGE) {
    let count = 0
    for (const entry of pending.values()) {
      entry.resolve({ verdict: "reject", message })
      count += 1
    }
    pending.clear()
    return count
  }

  /** 流断（兜底三径之三）：降为无问面（后续写类即时拒）＋ 未决结算。 */
  function markStreamClosed(message = ASK_REJECTED_MESSAGE) {
    streamAlive = false
    return settleAll(message)
  }

  /** 回合收尾（`finally` 单点）：未决全拒 + 出表（幂等）。 */
  function close() {
    if (closed) return 0
    const count = settleAll(ASK_REJECTED_MESSAGE)
    closed = true
    if (hosts.get(id) === host) hosts.delete(id)
    return count
  }

  const host = { preflight, admit, rejectRest, answer, settleAll, markStreamClosed, close }
  hosts.set(id, host)
  return host
}
