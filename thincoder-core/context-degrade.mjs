/**
 * context-degrade.mjs — 确定性降级面（无 LLM 的有损收缩 · 自 `context.mjs` 迁出 · 2026-10-01 core 拆分批 #755 ∥ #786）。
 * 内容 = `pruneStub` ∥ `pruneStaleToolOutputs`（F-CC3 陈旧工具输出清理）∥ `OVERSIZE_CONTENT_LIMIT` ∥
 * `shrinkOversized`（splitHistory 无中间段时的单条超限收缩）——迁出块逐字。
 * 原档 `context.mjs` 经 `export { … } from` 转口保名（消费面 / 单元测试档 import 面零改）；
 * 跨档被引的原私有面（`shrinkOversized`）补 `export` 关键字。
 */
import { collectStaleToolOutputs, contextUsage, estimateTokens, rebaseMeasured, tokenRatioOf } from "./token-window.mjs"
// 保护尾跟着**有效窗口**走（`CONTEXT-COMPACTION.md` §2.1 / §4）：档位自 agent 现取，不靠参数透传。
import { resolveWorkMode } from "./config.mjs"
// 保留窗起点（#2431）：prune 的合格集与压缩同一个切点——保留窗内那几轮的工具输出不被选中（§1.2）。
import { retentionWindowStart } from "./agent/turn-projection.mjs"

/** prune stub 逐字（§6.16.3）：只给「已清理 + 原长度 + 重跑路径」——prune 是**删**不是摘要，不声称可复原。 */
const pruneStub = (chars) => `[pruned: stale tool output dropped (${chars} chars) — re-run the tool if you need it again.]`

/** 本档两处编辑都量到「旧前缀里被改动的那一段」为止：`_usageAtLen` 之后的消息从没被量过，减它们就是减错账。 */
function measuredEndOf(agent, history) {
  return Number.isInteger(agent?._usageAtLen) ? agent._usageAtLen : history.length
}

/**
 * 陈旧工具输出清理（F-CC3 · §6.16.3）：合格集 = `token-window.mjs` 单源（保护尾外 ∧ `role:"tool"` ∧ ≥ 门槛）；
 * 命中项**原位换「内容」**（`history[i] = { ...m, content: stub }`——数组引用 / 长度 / 索引 / `tool_call_id` 全不变
 * ⇒ 配对**结构上不可能被拆**）。记录面零改（copy-on-write：消息对象与人读线共享）。
 * 基线按 §3.1 **重定，不归零**：原位替换 ⇒ `_usageAtLen` 原样，`_lastPromptTokens` 只扣那一截的估算差。
 * `fixedOverhead` ∥ `ratio` 的来处 = §2.3 表（`contextUsage(agent).overhead` · `tokenRatioOf(agent)`）。
 * @returns {{pruned:number, freed:number, candidates:number, tailKept:number, belowMin:number}}
 */
export function pruneStaleToolOutputs(agent) {
  const history = agent.history
  const stale = collectStaleToolOutputs(
    history, agent.provider, resolveWorkMode(agent.config?.agent), retentionWindowStart(agent),
    contextUsage(agent).overhead, tokenRatioOf(agent),
  )
  const counts = {
    pruned: stale.indexes.length,
    freed: stale.tokens,
    candidates: stale.candidates,
    tailKept: stale.tailKept,
    belowMin: stale.belowMin,
  }
  if (counts.pruned === 0) return counts
  const measuredEnd = measuredEndOf(agent, history)
  let estBefore = 0
  let estAfter = 0
  for (const i of stale.indexes) {
    const m = history[i]
    const before = i < measuredEnd ? estimateTokens([m]) : 0
    // 多模态 tool 结果（content 数组）整体替换为 stub ⇒ 图像 part 丢弃（不可再取——prune 是删；回执只给重跑路径）
    const chars = typeof m.content === "string" ? m.content.length : JSON.stringify(m.content ?? "").length
    history[i] = { ...m, content: pruneStub(chars) }
    if (i < measuredEnd) {
      estBefore += before
      estAfter += estimateTokens([history[i]])
    }
  }
  rebaseMeasured(agent, estBefore, estAfter, { inPlace: true })
  return counts
}

/** Hard truncation limit for a single message body: when exceeded and the splitter can't find a middle section, truncate to a stub (prevents one giant message from blocking compaction) */
const OVERSIZE_CONTENT_LIMIT = 8_000

/**
 * Deterministic shrinking: last resort when splitHistory can't find a middle section (history too short) but threshold is exceeded. No LLM call.
 * Truncates user/tool message bodies exceeding OVERSIZE_CONTENT_LIMIT to a stub (keeps head + tail);
 * does not touch reasoning_content (DeepSeek/Kimi echo protocol) or tool_calls pairing structure — no protocol 400
 * risk from this path (this module's echo-safety face is `applyCompression`: the compaction placeholder is never
 * committed as a separate reasoning-less assistant next to another assistant — D-CC18, 2026-09-16 batch).
 * Only called after compressIfNeeded determines threshold is exceeded. Returns whether any message was truncated.
 */
export function shrinkOversized(agent, limit = OVERSIZE_CONTENT_LIMIT) {
  let shrunk = false
  const measuredEnd = measuredEndOf(agent, agent.history)
  let estBefore = 0
  let estAfter = 0
  // Copy-on-write: build a NEW array and replace only truncated entries. pushReal stores the SAME
  // message object in both `agent.history` (machine line) and `agent._fullHistory` (human/persistence
  // line), so in-place `m.content = ...` would ALSO truncate the never-compacted human line and lose
  // the original pasted content on session persist (session.mjs persists _fullHistory). VS Code port
  // already copies (`history.map(m => ({ ...m }))`); this brings CLI to parity.
  const next = agent.history.map((m, i) => {
    if ((m.role !== "user" && m.role !== "tool") || typeof m.content !== "string") return m
    if (m.content.length <= limit) return m
    // Truncate keeping head + tail, insert stub in between; keepHead/keepTail proportional but not exceeding 50%/25% of limit
    const keepHead = Math.min(Math.floor(limit * 0.5), 4000)
    const keepTail = Math.min(Math.floor(limit * 0.25), 2000)
    shrunk = true
    const truncated = {
      ...m,
      content:
        m.content.slice(0, keepHead) +
        `\n[... ${m.content.length - keepHead - keepTail} chars truncated — single message too large for context window ...]\n` +
        m.content.slice(-keepTail),
    }
    if (i < measuredEnd) {
      estBefore += estimateTokens([m])
      estAfter += estimateTokens([truncated])
    }
    return truncated
  })
  if (shrunk) {
    agent.history = next
    // 基线按 §3.1 **重定，不归零**：截断是原位替换（数组长度与下标不变）⇒ `_usageAtLen` 原样。
    rebaseMeasured(agent, estBefore, estAfter, { inPlace: true })
  }
  return shrunk
}
