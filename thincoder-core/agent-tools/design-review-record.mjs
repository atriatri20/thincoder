/**
 * design-review-record.mjs — 设计评审结算的轮次块成形（**纯函数 · 零 import · 零 fs**）。
 *
 * 单源 = `docs/core/design/BATCH-RECORD.md` §4.4「块形三件，按序」：工具戳 `### 轮次 N（评审子代理）`
 * → 结算头一行 `**结算**：<已签发|未签发>（<原因>）· <日期>` → 评审原文整段、逐行缩进四格。
 *
 * 为什么单独成叶档：`design-token.mjs` 批起 459 内容行，成形逻辑再加进去就越 500 软线；而本档零 import
 * 也就零环（它在批次档依赖链之外，结算引它不把任何档拉进 `design-token.mjs` 的静态闭包）。
 *
 * 成形与写盘分开：本档只产文本，写仍归结算的单通道（`design-token.mjs` 的 `recordWriter`）——一条写路，
 * 一次回读，失败一次回退。
 *
 * 缩进四格的三个作用（同 §4.4）：段标题锚 `^## §N` 与轮次块锚 `ROUND_HEADING_RE` 只认行首，缩进后
 * 评审原文里的同类行破坏不了段定位与块计数；整块成为缩进代码块，文档检查的段长判据不计它；
 * 裁定锚允许前导空白，缩进后照旧命中——状态行计划与 `§5` 门读的是同一份正文，零新解析。
 */

/** 结算头的两个结局词（§4.4 逐字——机器可 grep）。 */
export const SETTLEMENT_SIGNED = "已签发"
export const SETTLEMENT_UNSIGNED = "未签发"

/**
 * 结算头一行（§4.4 第 2 件）：`**结算**：<已签发|未签发>（<原因>）· <日期>`。
 * 原因四词由结算按处置给：`pass` ∥ `changes-required` ∥ `no-pass-line` ∥ `no-valid-echo`。
 * 它说的是引擎怎样处置本轮，不是评审的裁定——两者在拒签轮恰好相反，故分成两处写。
 * @param {{signed: boolean, reason: string, date: string}} p
 * @returns {string} 单行结算头
 */
export function settlementHeaderLine({ signed, reason, date }) {
  return `**结算**：${signed ? SETTLEMENT_SIGNED : SETTLEMENT_UNSIGNED}（${reason}）· ${date}`
}

/**
 * 轮次块全文（§4.4 三件，按序）——与 `batch-record-write.mjs` 的 `insertIntoSection` 同形
 * （工具戳 + 空行 + 正文），故两条写路落进 §3 的块读起来一样。
 * 前导空行 = 与上一块 / 段标题分开：段尾本来已有空行时多一行空白，markdown 渲染与判据都无差别。
 * @param {Object} p
 * @param {number} p.roundN 本轮 N（单源 = `nextRoundNumber`，不另立计数）
 * @param {boolean} p.signed 已签发 ∥ 未签发
 * @param {string} p.reason 结算头原因词（四词之一）
 * @param {string} p.date `YYYY-MM-DD`
 * @param {string} p.body 评审原文（凭证已剥——凭证不落档）
 * @param {string} [p.eol] 目标档的行尾形（`\n` ∥ `\r\n`）——块随档的 EOL 走，不混行尾
 * @returns {string} 块全文（首行与末行都是空行——块自成一段）
 */
export function designReviewBlock({ roundN, signed, reason, date, body, eol = "\n" }) {
  const head = [
    `### 轮次 ${roundN}（评审子代理）`,
    "",
    settlementHeaderLine({ signed, reason, date }),
    "",
  ]
  const indented = String(body ?? "")
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((line) => (line.trim() ? `    ${line}` : ""))
  // 尾随空行：块自成一段，后面的 `## §N` 段标题不被上一行的缩进内容紧贴（与 `insertIntoSection` 落块后
  // 再补一个空行同形）。前导空行 = 与上一块 / 段标题分开。
  return ["", ...head, ...indented, ""].join(eol)
}
