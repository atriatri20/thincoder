/**
 * design-review-record.mjs — 设计评审结算的轮次块成形（**纯函数 · 零 import · 零 fs**）。
 *
 * 单源 = `docs/core/design/BATCH-RECORD.md` §4.4「块形三件，按序」：工具戳 `### 轮次 N（评审子代理）`
 * → 结算头一行 `**结算**：<已签发|未签发>（<原因>）· <日期>` → 本轮结论三件，按序：结论表行 → 裁定行
 * → 计数行。评审的推理正文不进块——它留在评审报告里，整份仍随本轮报告回父侧。
 *
 * 为什么单独成叶档：`design-token.mjs` 的成形逻辑再加进去就越 500 软线；而本档零 import
 * 也就零环（它在批次档依赖链之外，结算引它不把任何档拉进 `design-token.mjs` 的静态闭包）。
 *
 * 成形与写盘分开：本档只产文本，写仍归结算的单通道（`design-token.mjs` 的 `recordWriter`）——一条写路，
 * 一次回读，失败一次回退。
 *
 * 缩进四格的两条理由（同 §4.4）：整块成为缩进代码块，文档检查的段长判据不计它；裁定锚允许前导空白，
 * 缩进后照旧命中，故状态行计划与 `§5` 门读的是同一份正文，零新解析。段标题锚 `^## §N` 与轮次块锚
 * `ROUND_HEADING_RE` 只认行首，而块内三类行（表行、裁定行、计数行）都不以 `## §` 或 `### 轮次` 起头
 * ——两枚锚不会命中块内内容。
 */

/** 结算头的两个结局词（§4.4 逐字——机器可 grep）。 */
export const SETTLEMENT_SIGNED = "已签发"
export const SETTLEMENT_UNSIGNED = "未签发"

/** 结算处置四词（§4.4「结算头的原因两个族」逐字）：裁定闸三格 + 回显失败支。宿主不完整族另占同一格，
 *  取该 kind 词（哪一轮的正文可能缺半，处置词读不出可信的结论）。本档另担两件文本：结算头与裁定行——
 *  四个词与它们对应的裁定行同住，块的每一行文本单源在一处。 */
export const DISPOSITION_PASS = "pass"
export const DISPOSITION_CHANGES_REQUIRED = "changes-required"
export const DISPOSITION_NO_PASS_LINE = "no-pass-line"
export const DISPOSITION_NO_ECHO = "no-valid-echo"

const VERDICT_LINES = new Map([
  [DISPOSITION_PASS, "VERDICT: pass"],
  [DISPOSITION_CHANGES_REQUIRED, "VERDICT: changes-required"],
  [DISPOSITION_NO_PASS_LINE, "本轮无裁定行（评审未给出 VERDICT 行）"],
  [DISPOSITION_NO_ECHO, "本轮未回显有效 token（评审回执不完整）"],
])

/**
 * 本轮裁定行（§4.4「裁定行」）：由结算按本轮处置取，**不从评审体里挑**——块内裁定、结算头与凭证结局
 * 三处必须同源；挑出来的裁定会造出「块说 pass、结算头说未签发」的第三态。
 * 后三行是恒定说明行，不命中任何裁定锚：未签发的轮次不许在 `§5` 门那一面读成一个裁定。
 * @param {string} disposition 处置四词之一，或宿主不完整族的 kind 词
 * @returns {string} 单行裁定行
 */
export function verdictLineOf(disposition) {
  const known = VERDICT_LINES.get(disposition)
  if (known) return known
  // 处置四词之外只有一个来源 = 宿主不完整族的 kind 词（§4.4 该族一段）：那一轮没有裁定，行内点名该 kind。
  return `本轮评审不完整（${disposition}），不产生裁定`
}

/** 结论表认不出时的块内恒定标记与计数行（§4.4——逐字，机器可 grep）。 */
export const NO_CONCLUSION_MARK = "本轮无结论表"
export const COUNTS_UNAVAILABLE = "计数：不可得出"

/** 结论表四个列名（§4.4 归一后逐字比对；顺序即规范字面形的顺序）。 */
const CONCLUSION_COLUMNS = ["#", "severity", "status", "evidence"]

/** 严重度三标记（§4.4 计数行；顺序即计数行的输出顺序）。 */
const SEVERITY_MARKS = ["🔴", "🟡", "🔵"]

/**
 * 结算头一行（§4.4 第 2 件）：`**结算**：<已签发|未签发>（<原因>）· <日期>`。
 * 原因取处置四词，或宿主不完整族的 kind 词（评审完整时取前者——那一轮的正文可能缺半，
 * 处置词读不出可信的结论）。
 * 它说的是引擎怎样处置本轮，不是评审的裁定——两者在拒签轮恰好相反，故分成两处写。
 * @param {{signed: boolean, reason: string, date: string}} p
 * @returns {string} 单行结算头
 */
export function settlementHeaderLine({ signed, reason, date }) {
  return `**结算**：${signed ? SETTLEMENT_SIGNED : SETTLEMENT_UNSIGNED}（${reason}）· ${date}`
}

/** 一行是不是表行：行首允许前导空白，首字符 `|`。 */
const isTableLine = (line) => /^[ \t]*\|/.test(line)

/** 一行的切格（去掉行首尾的 `|` 再按 `|` 切）。表行与分隔行同一切法。 */
function cellsOf(line) {
  const t = line.trim()
  const inner = t.startsWith("|") ? t.slice(1) : t
  const body = inner.endsWith("|") ? inner.slice(0, -1) : inner
  return body.split("|")
}

/** 表头归一只做三件（§4.4）：去两侧空白、去两侧反引号、小写化。三条都是格式噪声，不改语义。 */
function normalizeHeaderCell(cell) {
  return cell.replace(/^[\s`]+/, "").replace(/[\s`]+$/, "").toLowerCase()
}

/**
 * 每行是否参与认表（§4.4）：围栏代码块与四空格缩进块里的行不参与——报告里复述块形、举出表头样例
 * 都不构成结论表。围栏按成对开合标记切（``` ∥ ~~~，开合标记同类才算闭合）。
 * @param {string[]} lines
 * @returns {boolean[]}
 */
function tableEligibility(lines) {
  const out = []
  let fence = null
  for (const line of lines) {
    const opener = /^ {0,3}(`{3,}|~{3,})/.exec(line)
    if (fence === null) {
      if (opener) {
        fence = opener[1][0]
        out.push(false)
        continue
      }
      out.push(!/^(?: {4,}|\t)/.test(line))
      continue
    }
    if (opener && opener[1][0] === fence) fence = null
    out.push(false)
  }
  return out
}

/** 一段文本里最先出现的严重度标记（没有 ⇒ `null`）。 */
function firstSeverityMark(text) {
  let best = null
  let at = -1
  for (const mark of SEVERITY_MARKS) {
    const i = text.indexOf(mark)
    if (i < 0) continue
    if (at < 0 || i < at) {
      at = i
      best = mark
    }
  }
  return best
}

/**
 * 结论表行（§4.4「结论表行」一段）：取评审体里**最后一块**连续表行（行首允许前导空白、首字符 `|`，
 * 块内每行同形不中断）；该块首行切格、逐格归一后须逐字等于 `#` ∥ `severity` ∥ `status` ∥ `evidence`
 * 四格，第二行须是分隔行（每格只含 `-`、`:` 与空白）。命中 ⇒ 整块原样返回（一字不改、列不增删）。
 *
 * 为什么取最后一块：契约把结论表放在 findings 之后、裁定行之前，最后一块就是它——取首块会把推理里的
 * 对照表当结论。为什么按四列认表：只按首格认表挡不住报告结尾另起的无关表（核对记录那类），块里看着
 * 有表、内容却是别人的记录，比空着更坏。
 * @param {string} body 评审原文（凭证已剥）
 * @returns {string|null} 结论表整块（表头 + 分隔 + 表体）∥ `null`（认不出）
 */
export function conclusionOf(body) {
  const lines = String(body ?? "").replace(/\r\n?/g, "\n").split("\n")
  const eligible = tableEligibility(lines)
  let end = -1
  for (let i = lines.length - 1; i >= 0; i--) {
    if (eligible[i] && isTableLine(lines[i])) {
      end = i
      break
    }
  }
  if (end < 0) return null
  let start = end
  while (start > 0 && eligible[start - 1] && isTableLine(lines[start - 1])) start--
  const block = lines.slice(start, end + 1)
  if (block.length < 2) return null
  const header = cellsOf(block[0]).map(normalizeHeaderCell)
  if (header.length !== CONCLUSION_COLUMNS.length) return null
  if (!CONCLUSION_COLUMNS.every((name, i) => header[i] === name)) return null
  const separator = cellsOf(block[1])
  if (separator.length !== header.length || !separator.every((cell) => /^[-:\s]+$/.test(cell))) return null
  return block.join("\n")
}

/**
 * 计数行（§4.4「计数行」一段）：由结算按取到的表体算，不取评审自己写的统计句。
 * 表体 = 表头行与分隔行之后的行，这两行不计。逐行一次：先取 `severity` 那一格，格内命中的标记即该行
 * 档位；该格为空才落到行内最先命中的标记；三者皆无记「未标」。
 *
 * 为什么先取 `severity` 一格：那一格就是档位列，证据格里引用的档位标记（引判据、复述上一轮那类）不该
 * 改这一行的计数。格子空着是表没写全，那时才退回扫行。
 * @param {string} table 结论表整块（`conclusionOf` 的返回值）
 * @returns {string} 单行计数行
 */
export function conclusionCounts(table) {
  const lines = table.split("\n")
  const severityAt = CONCLUSION_COLUMNS.indexOf("severity")
  const tally = new Map([...SEVERITY_MARKS.map((m) => [m, 0]), [null, 0]])
  for (const row of lines.slice(2)) {
    const cells = cellsOf(row)
    const raw = cells[severityAt]
    const cell = typeof raw === "string" ? raw.trim() : ""
    // 格里有字 ⇒ 只看这一格（命中不了就是「未标」，不回退扫行）；格空 ∥ 该格缺位 ⇒ 才退回扫行。
    const hit = cell ? firstSeverityMark(cell) : firstSeverityMark(row)
    tally.set(hit, tally.get(hit) + 1)
  }
  const parts = SEVERITY_MARKS.map((m) => `${m} ${tally.get(m)}`)
  parts.push(`未标 ${tally.get(null)}`)
  return `计数：${parts.join(" · ")}`
}

/**
 * 轮次块全文（§4.4 三件，按序）——与 `batch-record-write.mjs` 的 `insertIntoSection` 同形
 * （工具戳 + 空行 + 正文），故两条写路落进 §3 的块读起来一样。
 * 前导空行 = 与上一块 / 段标题分开：段尾本来已有空行时多一行空白，markdown 渲染与判据都无差别。
 * @param {Object} p
 * @param {number} p.roundN 本轮 N（单源 = `nextRoundNumber`，不另立计数）
 * @param {boolean} p.signed 已签发 ∥ 未签发
 * @param {string} p.reason 结算头原因（处置四词之一，或宿主不完整族的 kind 词）
 * @param {string} p.date `YYYY-MM-DD`
 * @param {string} p.body 评审原文（凭证已剥——凭证不落档）：取的是它末尾那张结论表
 * @param {string} p.verdictLine 本轮裁定行（结算按处置写，不从评审体里挑——必填，无默认）
 * @param {string} [p.eol] 目标档的行尾形（`\n` ∥ `\r\n`）——块随档的 EOL 走，不混行尾
 * @returns {string} 块全文（首行与末行都是空行——块自成一段）
 */
export function designReviewBlock({ roundN, signed, reason, date, body, verdictLine, eol = "\n" }) {
  // 参数默认是替调用方做决定：裁定行只能由结算按本轮处置给，缺了就在三层之外现形。
  if (typeof verdictLine !== "string" || !verdictLine.trim()) {
    throw new Error("designReviewBlock: verdictLine is required — the settlement derives it from this round's disposition; it has no default, because a default would decide for the caller which verdict the round carries")
  }
  const conclusion = conclusionOf(body)
  const rows = conclusion
    ? [...conclusion.split("\n"), verdictLine, conclusionCounts(conclusion)]
    : [NO_CONCLUSION_MARK, verdictLine, COUNTS_UNAVAILABLE]
  const head = [
    `### 轮次 ${roundN}（评审子代理）`,
    "",
    settlementHeaderLine({ signed, reason, date }),
    "",
  ]
  // 尾随空行：块自成一段，后面的 `## §N` 段标题不被上一行的缩进内容紧贴（与 `insertIntoSection` 落块后
  // 再补一个空行同形）。前导空行 = 与上一块 / 段标题分开。
  return ["", ...head, ...rows.map((line) => `    ${line}`), ""].join(eol)
}