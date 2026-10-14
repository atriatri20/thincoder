/**
 * views-chat-messages.mjs — 管理·对话页·消息面（`webui/CHAT.md` §2.1②；console-chat-live-step 批——台账 #1325）；
 * 自 `views-chat.mjs` 外拆（拆档缘由 = 该件 500 软线已贴满——增行前必须先外拆）。面内四族：
 * 帧面纯函数（`splitLines`/`parseFrame`/`argsText`——NDJSON 行切分 ∥ 帧解析 ∥ 参数摘要取读）∥
 * notice 行文案映射（`data.reason` 五值）∥ 工具结果文案（**失败判据 = 核 `isToolFailure`** 单源）∥
 * 回读装配（库行 ⇒ 核 `buildUserMessage`/`buildAssistantRestore`/`renderToolHistory`——`messageNodes`）。
 *
 * 活流径（按步开合——步界 = `turn` 帧）留 `views-chat.mjs`；本档只承纯函数面与「读时单源」读侧。
 * `views-chat.mjs` 面 `export … from "./views-chat-messages.mjs"` 兼容重导出（既有测试档**用例级**零改——文件级随正清单在册）。
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

/** 工具参数摘要取读（两形兼容）：流帧 `args` 恒字符串（§11）∥ 存量对象形 ⇒ JSON 串；空 ⇒ 空串。 */
export function argsText(args) {
  if (typeof args === "string") return args
  if (args === null || args === undefined) return ""
  try { return JSON.stringify(args) } catch { return String(args) }
}

/** notice 行文案映射（§2.1「notice 行文案映射」）：`data.reason` **五值**各一键（`restart` ∥ `budget` ∥ `model_error` ∥
 *  `empty_turn` ∥ `aborted`）；枚举外/缺位 ⇒ 服务端原文兜底（`content`——零信息丢）。精确值判定（子串匹配会误吞未来新值）。 */
const NOTICE_KEYS = {
  restart: "admin.chat.noticeInterrupted",
  budget: "admin.chat.noticeBudget",
  model_error: "admin.chat.noticeModelError",
  empty_turn: "admin.chat.noticeEmpty",
  aborted: "admin.chat.noticeAborted",
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
 *  `views-chat.mjs` 活流径（`result` 帧 ⇒ 核 `finishToolCard` 入参）与本档回读装配两处消费，不重导出）。
 *  服务端结构化失败位（`ok:false`——§12「错误 ⇒ `ok:false` + 人话 message」）在文本面无判形（人话 message 不携
 *  `Error:` 头 ∥ 状态位行）⇒ 判据不命中的失败立核判据头（核件红面 ∥ 自动展开的唯一入口；呈现零自持）。 */
export function resultText(summary, ok) {
  const text = String(summary ?? "")
  return ok === false && !isToolFailure(text) ? `Error: ${text}` : text
}

/** 回读装配（§2.1②——库行 ⇒ 块模型 ⇒ 核件节点，序 = `seq` 升序）：`user` 行 ⇒ 用户块（核 `buildUserMessage`）∥
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
      const model = { kind: "assistant", text: String(row.content ?? ""), tools: [], turnStart: labeled === false }
      labeled = true
      models.push(model)
      for (const call of Array.isArray(row.data?.toolCalls) ? row.data.toolCalls : []) byCallId.set(String(call?.id ?? ""), model)
      continue
    }
    if (row?.role === "tool") {
      const model = byCallId.get(String(row.data?.toolCallId ?? ""))
      const text = resultText(row.data?.summary, row.data?.ok)
      if (model === undefined) models.push({ kind: "tool", name: String(row.data?.name ?? "tool"), text })
      else model.tools.push({ id: row.data?.toolCallId, name: String(row.data?.name ?? "tool"), args: argsText(row.data?.args), result: text })
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
