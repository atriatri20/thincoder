/**
 * taskbook-block.mjs — 工程角色的任务书正文块构造器（`AGENT-LOOP-SUBAGENT.md` §8.1 载体 ∥ 切片 ∥ 快照）。
 *
 * 为什么另立一档（同 `audit-block.mjs` 的 D23-3 外提先例）：块构造是纯函数 ⇒ 判据可直测，
 * 而装配点 `subagent-spawn.mjs` 已接近设计时行数线，不因新增逻辑逼近它。
 *
 * 三件事都在本档定：
 *  - **切片**：按角色取段（§8.1）——eng-coder 取 §2，eng-designer 取 §1 + §2。切法 = 段头之间的文本，
 *    段界判据消费批次档段解析的既有实现（`batch-segment-vocab.mjs` 的 `sectionHeaderRe` ∥ `sectionBodyLines`
 *    ——段头形态与「下一个 `## §N`」两处判据的唯一住所；`batch-skeleton.mjs` 只再导出其中 `sectionHeaderRe`，
 *    故本档直接消费叶档）；不解析标题文字，也不在本档另写一份段界正则。
 *  - **快照**：正文由装配点在 spawn 当刻读一次后传进来，此后批档改动不回流——本档零 fs，只做切与拼。
 *  - **失效即拒**：该角色的段切不出来（没有对应段头）⇒ 抛错并点名路径与缺失段，不退回「只发指向句」
 *    （退回会让 §8.1 的承诺落空而无人知道）。
 *
 * 不截断：截断后的副本仍自称任务书原文，比不给更坏（§8.1）。
 */

import { sectionHeaderRe, sectionBodyLines } from "./batch-segment-vocab.mjs"

/** 角色 → 进 system 固块的段号（§8.1）。eng-designer 取 §1 + §2：§1 是约束它的裁决、§2 是它自己的笔；
 *  §3–§6 不进固块，由该角色按需从磁盘读（改动随时可见）。非工程角色不在此表 ⇒ 不携任务书块。 */
export const TASK_BOOK_SEGMENTS = Object.freeze({
  "eng-coder": Object.freeze([2]),
  "eng-designer": Object.freeze([1, 2]),
})

/** 块首说明行（§8.1）：让子代理知道手里这份是快照，改写/引述之前要回读磁盘。 */
const SNAPSHOT_NOTE =
  "[Task book — the text below is the batch record verbatim as it stood at spawn time; later edits to the record do not flow into this copy. " +
  "Re-read the record on disk before rewriting or quoting any segment — the batch tool's `edit` anchors only on the current on-disk text.]"

/** 段体首尾空行不计（段头之间的空行属版式，不属于该段内容）。 */
function withoutBlankEdges(lines) {
  let start = 0
  let end = lines.length
  while (start < end && lines[start].trim() === "") start++
  while (end > start && lines[end - 1].trim() === "") end--
  return lines.slice(start, end)
}

/**
 * 任务书正文块（§8.1 / §8.2 收集序首块）：纯函数——零 fs、零副作用。
 * @param {{ role: string, record: { path: string, text: string } }} input
 *   `role` = 本次 spawn 的角色；`record.path` = 批档绝对路径（拒文点名用）；
 *   `record.text` = **spawn 当刻**读到的批档全文（快照本体）。
 * @returns {string} 块文本（段之间 `\n\n`；与其它块之间的分隔由装配侧 `join("\n\n")` 施加）
 */
export function buildTaskBookBlock({ role, record }) {
  const segs = TASK_BOOK_SEGMENTS[role]
  if (!segs) {
    throw new Error(`buildTaskBookBlock: role '${role}' takes no task-book block — only the engineering roles (${Object.keys(TASK_BOOK_SEGMENTS).join(" / ")}) carry one; every other role gets its task book from the structured parameters`)
  }
  const path = record?.path
  const text = record?.text
  if (typeof path !== "string" || path.trim() === "") {
    throw new Error("buildTaskBookBlock: record.path is required (the batch record's absolute path) — the refusal text must name the record it could not cut a segment out of")
  }
  if (typeof text !== "string") {
    throw new Error(`buildTaskBookBlock: record.text is required for ${path} (the batch record's full text as read at spawn time)`)
  }
  const parts = [SNAPSHOT_NOTE]
  for (const seg of segs) {
    const hdr = sectionHeaderRe(seg).exec(text)
    if (!hdr) {
      throw new Error(`Task book unavailable — spawn refused: the batch record at ${path} has no "## §${seg}" section header, so the ${role} task book (§${segs.join(" + §")}) cannot be cut from it. Restore that segment header (create is the batch record skeleton's only authoritative entry), or point batchDoc at the record that carries it.`)
    }
    const nl = text.indexOf("\n", hdr.index)
    const headerLine = (nl < 0 ? text.slice(hdr.index) : text.slice(hdr.index, nl)).replace(/\r$/, "")
    const body = withoutBlankEdges(sectionBodyLines(text, seg) ?? [])
    parts.push([headerLine, ...body].join("\n"))
  }
  return parts.join("\n\n")
}

/**
 * 首条 user 消息的任务书指向句（§3.1「首条 user 消息只留指向句：批档路径 ＋ 其余段自读」）。
 *
 * 两句都不带「only」/「唯一」措辞：「唯一任务通道」只对 eng-coder 的那一段成立，eng-designer 的通道是
 * 整份批档（§1 的裁决对它具约束力），对它声称唯一通道即与 §3.1 互斥。
 * @param {string} role — 本次 spawn 的角色（只有 TASK_BOOK_SEGMENTS 里的角色有指向句）
 * @param {string} recordPath — 批档绝对路径（装配点已解析）
 * @returns {string} 一行机械任务书行
 */
export function taskBookPointerLine(role, recordPath) {
  const segs = TASK_BOOK_SEGMENTS[role]
  if (!segs) {
    throw new Error(`taskBookPointerLine: role '${role}' has no task-book pointer line — only the engineering roles (${Object.keys(TASK_BOOK_SEGMENTS).join(" / ")}) carry one`)
  }
  if (role === "eng-coder") {
    return `Task book: §2 of the batch record at ${recordPath} — reproduced verbatim in your system prompt as it stood at spawn time. Read the record itself for any other segment; §5 of that record is where you record the implementation.`
  }
  return `Task book: the batch record at ${recordPath} — §1 (the rulings that bind you) and §2 (your own pen) are reproduced verbatim in your system prompt as they stood at spawn time. Read the record itself for §3–§6, and re-read the current §2 text before you edit it.`
}
