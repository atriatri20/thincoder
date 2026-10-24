/**
 * views-me-chat-messages.mjs — 我的·对话页·消息面（`webui/CHAT.md` §2.2；member-face-chat 批——台账 #1215）：
 * 与管理面同族构件**自持同构**（§2.2「公共适配层抽取 = 登记不做」——两页单源 = 核件；形基准 = `views-chat-messages.mjs`）。面内四族：
 * 帧面纯函数（`splitLines`/`parseFrame`/`argsText`——NDJSON 行切分 ∥ 帧解析 ∥ 参数摘要取读）∥
 * notice 行文案映射（`data.reason` **六值** = 管理面五值 + `"box_lost"`——`agent/MEMBER-AGENT.md` §3.4 收尾三径②）∥
 * 工具结果文案（**失败判据 = 核 `isToolFailure`** 单源）∥ 工具结果全文取读（`data.content` ⇒ 全文——§3.11(6) 工具结果全文面）∥
 * 回读装配（盒内槽文件投射行 ⇒ 核 `buildUserMessage`/`buildAssistantRestore`/`renderToolHistory`——`messageNodes`）∥
 * 推理块回读（行携 `data.reasoning` 串 ⇒ 核 `buildAssistantRestore` `msg.reasoning` 面——默认展开；缺 ⇒ 零块）。
 *
 * 活流径（按步开合——步界 = `turn` 帧）留 `views-me-chat.mjs`；本档只承纯函数面与「读时单源」读侧。
 */
import { t } from "./i18n.mjs"
import { buildAssistantRestore, buildUserMessage } from "/rc/flow/block.mjs"
import { renderToolHistory } from "/rc/flow/tool-card.mjs"
import { isToolFailure } from "/rc/lib.mjs"

/** NDJSON 行切分（流式读取帧切面）：`buffer + chunk` ⇒ 完整行 + 残行（不足一行留待下一块——末帧无换行由调用方再切一次）。 */
export function splitLines(buffer, chunk) {
  const parts = `${buffer}${chunk}`.split("\n")
  const rest = parts.pop() ?? ""
  return { lines: parts.filter((line) => line.trim() !== ""), rest }
}

/** 帧解析（坏行/非对象 ⇒ `null`——调用方跳过：零未押异常）。 */
export function parseFrame(line) {
  let frame = null
  try { frame = JSON.parse(String(line)) } catch { return null }
  return frame !== null && typeof frame === "object" && typeof frame.type === "string" ? frame : null
}

/** 核件参数方言渲染（`${x}`——核 `t()` 同式，`thincoder-render-core/i18n.mjs`）——**页面自渲核词键**时用：
 *  核件词面值 = VSC locales 逐字（寄 `${x}` 占位——批 `2026-10-11-chat-shell-align-ui` 词面腿 ③ 断言逐字相等），
 *  而控制台门面 `t()` 只填 `{x}`（寄 `${x}` 会残 `$`）；故核方言替位在本档收口，页面零遗 `$` 残字。 */
export function coreText(key, params = {}) {
  let text = t(key)
  for (const [name, value] of Object.entries(params)) text = text.replace("${" + name + "}", String(value))
  return text
}

/** 工具参数摘要取读（两形兼容）：流帧 `args` 恒字符串（§11 帧词表）∥ 存量对象形 ⇒ JSON 串；空 ⇒ 空串。 */
export function argsText(args) {
  if (typeof args === "string") return args
  if (args === null || args === undefined) return ""
  try { return JSON.stringify(args) } catch { return String(args) }
}

/** notice 行文案映射（§2.2 差异⑤）：`data.reason` **六值** = 管理面五值（`restart` ∥ `budget` ∥ `model_error` ∥ `empty_turn` ∥
 *  `aborted`）＋ `"box_lost"`（工作区断开——本面新增第六值）；枚举外/缺位 ⇒ 服务端原文兜底（`content`——零信息丢）。
 *  精确值判定（子串匹配会误吞未来新值）。 */
const NOTICE_KEYS = {
  restart: "me.chat.noticeInterrupted",
  budget: "me.chat.noticeBudget",
  model_error: "me.chat.noticeModelError",
  empty_turn: "me.chat.noticeEmpty",
  aborted: "me.chat.noticeAborted",
  box_lost: "me.chat.noticeBoxLost",
}

/** notice 行文案（纯函数——单元测试档直测）。 */
export function noticeText(message) {
  const reason = typeof message?.data?.reason === "string" ? message.data.reason : ""
  const key = NOTICE_KEYS[reason]
  if (key !== undefined) return t(key)
  const content = String(message?.content ?? "")
  return content === "" ? "—" : content
}

/** 工具结果文案（核件入参单点——**失败判据 = 核 `isToolFailure`** 单源：本页零自持判据；件间内部件——
 *  `views-me-chat.mjs` 活流径（`result` 帧 ⇒ 核 `finishToolCard` 入参）与本档回读装配两处消费，不重导出）。
 *  服务端结构化失败位（`ok:false`）在文本面无判形（人话 message 不携 `Error:` 头 ∥ 状态位行）⇒ 判据不命中的失败立核判据头
 *  （核件红面 ∥ 自动展开的唯一入口；呈现零自持）。 */
export function resultText(summary, ok) {
  const text = String(summary ?? "")
  return ok === false && !isToolFailure(text) ? `Error: ${text}` : text
}

/** 回读径工具结果文本（§3.11(6) 工具结果全文面）：`data.content` 在场 ⇒ 全文（服务端已按核 `capText` 64 KiB 口径切片）；
 *  缺 ⇒ 摘要（`resultText`——失败判据同堂；两径同字面，活流径以 `result.content` 同口径）。 */
export function toolTextOf(row) {
  const content = typeof row?.data?.content === "string" && row.data.content !== "" ? row.data.content : null
  return content ?? resultText(row?.data?.summary, row?.data?.ok)
}

/** 回读装配（§2.2「四轴沿 §2.1」——盒内槽文件投射行 ⇒ 块模型 ⇒ 核件节点，序 = `seq` 升序）：`user` 行 ⇒ 用户块（核 `buildUserMessage`）∥
 *  `assistant` 行 + 其 `data.toolCalls` 对应 `tool` 行 ⇒ 助手块（`turnStart` = **本回合首个 assistant 行**——一回合一个助手标签）
 *  + 嵌套工具卡（核 `buildFinishedToolCard`）∥ `notice` 行 ⇒ 控制台 notice 行（自持灰条——VSC 无对应件）。
 *  悬空 `tool` 行（无主）⇒ 顶层历史卡兜底（防御——服务端消息序不产此行）。 */
export function messageNodes(ctx, messages = []) {
  const { h } = ctx
  const models = []
  const byCallId = new Map()
  let labeled = true // 「本回合标签已用」——user 行复位为假；assistant 行取用后置真（首行即 assistant 时不出标签——无 user 前导仅防御支）
  for (const row of messages) {
    if (row?.role === "user") {
      labeled = false
      models.push({ kind: "user", text: String(row.content ?? ""), ts: row.createdAt })
      continue
    }
    if (row?.role === "assistant") {
      const reasoning = typeof row.data?.reasoning === "string" && row.data.reasoning !== "" ? row.data.reasoning : undefined
      const model = { kind: "assistant", text: String(row.content ?? ""), tools: [], turnStart: labeled === false, reasoning }
      labeled = true
      models.push(model)
      for (const call of Array.isArray(row.data?.toolCalls) ? row.data.toolCalls : []) byCallId.set(String(call?.id ?? ""), model)
      continue
    }
    if (row?.role === "tool") {
      const model = byCallId.get(String(row.data?.toolCallId ?? ""))
      const text = toolTextOf(row)
      if (model === undefined) models.push({ kind: "tool", name: String(row.data?.name ?? "tool"), text })
      else model.tools.push({ id: row.data?.toolCallId, name: String(row.data?.name ?? "tool"), args: argsText(row.data?.args), result: text, resultTruncated: row.data?.resultTruncated === true })
      continue
    }
    if (row?.role === "notice") models.push({ kind: "notice", text: noticeText(row) })
  }
  const nodes = []
  for (const model of models) {
    if (model.kind === "user") nodes.push(buildUserMessage(model.text, model.ts))
    else if (model.kind === "assistant") nodes.push(buildAssistantRestore(model))
    else if (model.kind === "tool") nodes.push(renderToolHistory(model.name, model.text))
    else nodes.push(h("div", { class: "message notice", text: model.text }))
  }
  return nodes
}
