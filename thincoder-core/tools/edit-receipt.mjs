/**
 * edit-receipt.mjs — 批级回执文案**单源**（两个具名构造器各领各的）。
 *
 * 契约 = `docs/core/design/EDIT.md` §5「守卫与文案单源」∥ §8 D-16；骨架单源 =
 * `docs/core/design/EDIT-HELPERS.md` §7.6「跨工具失败回执骨架」· 决策 = `docs/core/design/APPLY-PATCH.md` §7 D-P4。
 *
 * 两个构造器：
 * - 逐条 / 逐档失败行 ← `editEntryFailureLine(label, reason)`——`<定位> — failed: <原因原文>`，
 *   `— failed: ` 这一段逐字同形；定位由各工具填自己的天然坐标（`edits[<i>]` ∥ `<path>` / `<path> hunk <n>`），
 *   所以入参是**定位串**而不是下标：两个工具共用同一个字面量，改一处就同时改到另一处。
 * - 汇总行与其 `<K> file(s) written` 计数 ← `editBatchSummary({ tool, applied, total, unit, filesWritten })`。
 *
 * **末段存废由「报单位是不是档」定**（`FILE_UNIT`）：`edit` 批面报条目、写档（`K ≤ M` ⇒ 末段带信息）；
 * `apply_patch` 报档、写档（两个数恒相等 ⇒ 末段只把同一个数印两遍，省）。第三个写入工具接入时
 * 自己回答「我的单位是不是档」，不照抄一段多余的话。
 *
 * 为什么住在自己这一档而不进 `thincoder-core/tools/edit-diff.mjs`：后者已贴近 500 行硬线，
 * 本批为它零增长（`docs/core/design/EDIT.md` §6「档位结论」）。
 */

/** 报单位 = 档时的单位词——末段 ` — <K> file(s) written` 的存在与否由 `unit` 与它是否相等决定。 */
export const FILE_UNIT = "file(s)"

/**
 * 失败行（逐条 ∥ 逐档）：`<定位> — failed: <原因原文>`。
 * `reason` = 抛出的错误文本逐字（可以跨多行——不提炼、不改写）。
 */
export const editEntryFailureLine = (label, reason) => `${label} — failed: ${reason}`

/**
 * 末行汇总：`<tool>: <k>/<M> <unit> applied, <M−k> failed`，`unit` ≠ 档时再接 ` — <K> file(s) written`；
 * `filesWritten` 非空（`K ≥ 1`）时后接 `: ` + 路径清单（调用方已按各自的序排好、以 `, ` 分隔）。
 */
export function editBatchSummary({ tool, applied, total, unit, filesWritten = [] }) {
  const head = `${tool}: ${applied}/${total} ${unit} applied, ${total - applied} failed`
  const tail = unit === FILE_UNIT ? "" : ` — ${filesWritten.length} file(s) written`
  const list = filesWritten.length >= 1 ? `: ${filesWritten.join(", ")}` : ""
  return head + tail + list
}