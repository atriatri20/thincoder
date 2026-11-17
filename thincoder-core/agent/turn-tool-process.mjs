/**
 * agent/turn-tool-process.mjs — 工具过程保留族（设计 = `docs/core/design/CONTEXT-COMPACTION.md` §1.1 ∥ §1.2；
 * 批次 = `docs/batches/2026-11-14-tool-output-retention.md`；台账 #2431）。五个常量 ∥ 九个函数：保留窗口与两道
 * 预算、切片与整组移出、折叠提示的记账、窗口裁切的摘除、保留窗起点。
 *
 * 为什么单出一档：这一族与「折叠 ∥ 投影 ∥ 恢复」三面不同，同住 `turn-projection.mjs` 会把那档推过 500 内容行的
 * 档位线（标准 `docs/core/standards/CODE-TIER.md` §2.1）。拆档只动文件归属，不动一条判据——五个常量值、九个函数体、
 * 注释语义逐字照搬。先例 = `turn-task-state.mjs` 拆出时同形。
 *
 * 依赖方向单向：`turn-projection.mjs` → 本档。本档只依赖 `buildDualEndPreview`（`./offload.mjs`）与
 * `estimateTokens`（`../token-window.mjs`），不 import 投影面——否则两档成环，拆了等于没拆。
 *
 * 对外契约：搬走的符号在 `turn-projection.mjs` 原路径 re-export，既有 import 一字不改（三个导入方 =
 * `context.mjs` ∥ `context-degrade.mjs` ∥ `agent-tools/context.mjs`）。
 */

// 工具段的单条缺口：双端预览复用 64K 面那一个构造器（`buildDualEndPreview`，本批给它加了必填 `budget`），
// 不另写一份切法——同一形状两份实现迟早分叉（§1.2）。
import { buildDualEndPreview } from "./offload.mjs"
// 预算与 `folded` 同一把尺：`estimateTokens` 是压缩面的计量尺（§1.2「预算用共享估算器，不另立尺」）。
import { estimateTokens } from "../token-window.mjs"

// ────────────────────── 保留窗与工具段预算（CONTEXT-COMPACTION.md §1.1 ∥ §1.2） ──────────────────────

/** 保留窗口 = 最近 2 轮（§1.1：常量，不是配置项——用户可调的是预算，这是保留边界）。 */
export const TOOL_PROCESS_WINDOW = 2
/** 单条工具内容的字符预算（§1.2）：越限取双端——头 + 省略数注记 + 尾。 */
export const TOOL_PROCESS_MSG_CHARS = 4000
/** 单轮工具段的 token 预算（§1.2）：越限从最旧调用组起整组移出。 */
export const TOOL_PROCESS_TURN_TOKENS = 8000
/** 折叠提示行的噪声门（§1.2）：真的丢掉量低于它，`folded` 整行不出现。 */
export const FOLD_HINT_TOKENS = 1000
/** 段首移出说明的标记（§1.2 载体）：`role: "user"` 不需要配对——`assistant` 文本会被 §6 的相邻归并吃掉，
 *  `tool` 会成为没有调用的孤儿结果、首个请求必 400。这一行给模型读，故不受 `FOLD_HINT_TOKENS` 门。 */
export const TOOL_PROCESS_DROP_MARK = "[Tool process trimmed]"

/** 一条调用组的起点：`assistant(tool_calls)`——整组进出机读线的原子单位（§1.1）。 */
export function isCallGroupStart(m) {
  return m?.role === "assistant" && Array.isArray(m.tool_calls) && m.tool_calls.length > 0
}

/** 单条预算（§1.2）：只量 `tool` 结果内容。`tool_calls.arguments` 不进这一档——截过的参数会让这次调用
 *  看起来是以别的参数发出的，等于造一条伪的执行事实；assistant 文本同不在「工具内容」这一档。
 *  copy-on-write：不碰传入的消息对象（`pushReal` 的双线共享对象只读）。 */
export function clampToolMessage(m) {
  if (m.role !== "tool" || typeof m.content !== "string" || m.content.length <= TOOL_PROCESS_MSG_CHARS) return m
  return { ...m, content: buildDualEndPreview(m.content, TOOL_PROCESS_MSG_CHARS) }
}

/** 本轮工具段切片（§1.1）：「第一次 `assistant(tool_calls)` 起、到最后一个 `tool` 结果止」的连续切片，
 *  含其间的 assistant 文本；`transient` 注入不进机读线副本。这一轮没有调用 ⇒ `null`（记录不带该键）。 */
export function toolSliceOf(segment) {
  let from = -1
  let to = -1
  for (let i = 0; i < segment.length; i++) {
    const m = segment[i]
    if (!m || typeof m !== "object" || m.transient === true) continue
    if (from < 0 && isCallGroupStart(m)) from = i
    if (m.role === "tool") to = i
  }
  if (from < 0 || to < from) return null
  const out = []
  for (let i = from; i <= to; i++) {
    const m = segment[i]
    if (!m || typeof m !== "object" || m.transient === true) continue
    out.push(clampToolMessage(m))
  }
  return out.length > 0 ? out : null
}

/** 整段预算（§1.2）：越 `TOOL_PROCESS_TURN_TOKENS` 就从最旧调用组起整组移出——一条 `assistant(tool_calls)`
 *  与其全部 `tool` 结果同进同出（只动一边留下孤立配对，首个请求必 400）。
 *  终止规则：只剩最新一组仍超限即停手——那一组保留完整、键仍在、段首那行报「已移出其余全部调用组」。
 *  预算量的是**留下的调用组**：段首那行说明（含它报的组数 ∥ 条数 ∥ token）在预算之外，它约几十 token，
 *  是这次移出的说明本身，不拿它去逼掉一整组真实结果。
 *  `lost` = 真的丢掉量（条数 · token · 组数），没移出则为零。 */
export function trimToolProcess(slice) {
  const lost = { groups: 0, results: 0, tokens: 0 }
  let kept = slice
  if (slice.length > 0 && estimateTokens(slice) > TOOL_PROCESS_TURN_TOKENS) {
    const starts = []
    for (let i = 0; i < slice.length; i++) if (isCallGroupStart(slice[i])) starts.push(i)
    let cursor = 0
    for (let g = 0; g + 1 < starts.length; g++) {
      if (estimateTokens(kept) <= TOOL_PROCESS_TURN_TOKENS) break
      const gone = slice.slice(cursor, starts[g + 1])
      lost.groups += 1
      lost.tokens += estimateTokens(gone)
      for (const m of gone) if (m.role === "tool") lost.results += 1
      cursor = starts[g + 1]
      kept = slice.slice(cursor)
    }
  }
  if (lost.groups === 0) return { messages: slice, lost }
  const remaining = kept.filter(isCallGroupStart).length
  const only = remaining <= 1 ? " Only the most recent call group is kept here." : ""
  const content = `${TOOL_PROCESS_DROP_MARK} ${lost.groups} earlier call group(s) with ${lost.results} tool result(s)` +
    ` (~${lost.tokens} tokens) left this context line to stay within the turn budget.${only}`
  return { messages: [{ role: "user", content }, ...kept], lost }
}

/** 本轮工具段（切片 + 两道预算，§1.2）：裁剪在这里做一次，三面读同一份。 */
export function toolProcessOf(segment) {
  const slice = toolSliceOf(segment)
  if (!slice) return { messages: null, lost: { groups: 0, results: 0, tokens: 0 } }
  return trimToolProcess(slice)
}

/** 一段工具过程的「真的丢掉量」（`folded:` 的记账面）：折掉几条 `tool` 结果、估算多少 token、几组调用。 */
export function toolProcessLostOf(record) {
  const lost = { groups: 0, results: 0, tokens: 0 }
  const tp = Array.isArray(record?.toolProcess) ? record.toolProcess : []
  if (tp.length === 0) return lost
  lost.tokens = estimateTokens(tp)
  for (const m of tp) {
    if (m?.role === "tool") lost.results += 1
    else if (isCallGroupStart(m)) lost.groups += 1
  }
  return lost
}

/** 折叠提示行的取形（§1.2）：两个来处相加——本轮工具段被预算裁掉 ∥ 旧轮工具段逾期离开机读线。
 *  低于 `FOLD_HINT_TOKENS` ⇒ `null`（整行不出现：一行常态噪声，读的人第二次起就不看了）。
 *  只报量，不带任何回查位置——落盘的工具结果只留 slim 后的前段，写「全文可取回」是一句兑现不了的话。 */
export function foldHintOf(...sources) {
  const total = { groups: 0, results: 0, tokens: 0, turns: 0 }
  for (const s of sources) {
    if (!s || (s.groups === 0 && s.results === 0)) continue
    total.groups += s.groups
    total.results += s.results
    total.tokens += s.tokens
    total.turns += 1
  }
  return total.tokens < FOLD_HINT_TOKENS ? null : total
}

/** 窗口裁切的上机读线部分（§1.1）：把挤出去那一轮的工具段消息按**身份**摘除——压缩重建数组后下标会漂、
 *  身份不漂。身份账就是那条轮记录自己的 `toolProcess`（折叠时插进机读线的正是这几个对象），不另立账。 */
export function dropToolProcessFromLine(agent, record) {
  const gone = new Set(Array.isArray(record?.toolProcess) ? record.toolProcess : [])
  if (gone.size === 0) return
  const history = Array.isArray(agent?.history) ? agent.history : []
  for (let i = history.length - 1; i >= 0; i--) if (gone.has(history[i])) history.splice(i, 1)
}

/**
 * 保留窗起点（§1.2 结构保护）：`turns` 里带 `toolProcess` 的轮记录，到 `agent._turnFoldMarks`
 * 取它登记的那批消息对象，按身份在当刻的 `history` 上查出下标——与在途段起点同一条重定规则。
 * 取全部保留轮里的**最小编号**：单个锚点被替换（压缩的归并支重写 `tail[0]`、`shrinkOversized`
 * 重建条目）就会漏掉它后面的真起点，一个不留就整个窗都不受保护。
 * 无保留窗（或那批消息已不在线上）⇒ `history.length`，等价于不收紧。
 * 消费面 = `splitHistory` 的第四参：压缩的中段 ∥ prune 的合格集 ∥ 尾部预算三处同源受益。
 */
export function retentionWindowStart(agent) {
  const history = Array.isArray(agent?.history) ? agent.history : []
  const turns = Array.isArray(agent?._turns) ? agent._turns : []
  const marks = Array.isArray(agent?._turnFoldMarks) ? agent._turnFoldMarks : []
  let earliest = -1
  for (let i = 0; i < turns.length; i++) {
    const tp = turns[i]?.toolProcess
    if (!Array.isArray(tp) || tp.length === 0) continue
    for (const m of Array.isArray(marks[i]) ? marks[i] : []) {
      const k = history.indexOf(m)
      if (k >= 0 && (earliest < 0 || k < earliest)) earliest = k
    }
  }
  return earliest >= 0 ? earliest : history.length
}
