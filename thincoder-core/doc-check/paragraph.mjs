/**
 * doc-check/paragraph.mjs — 判据 ①「一段太长」+ 全仓共用的结构谓词族。
 *
 * 判据句单源 = `docs/core/design/DOC-CHECK.md` §2：一段 = 相邻的非空正文行合起来的那一片文字；
 * 标题 ∥ 表格 ∥ 列表 ∥ 引用 ∥ 围栏块 ∥ 缩进代码块各自成界（它们断开段，自己也不算进段）；超过 300 字 ⇒ 报。
 * 提示词面（`thincoder-core/prompts/`）每行自成一界——那里的换行排的是版式，不是分段。
 * 阈值 300 是常量：判据不读项目配置，要改就改代码、走评审（§2 末行）。
 *
 * 结构谓词族（围栏 ∥ 标题 ∥ 列表 ∥ 引用 ∥ 表格 ∥ 码段）住本档**一处**，消费面只有两个：
 * 本档的段判据，与 `thincoder-core/doc-graph/anchors.mjs` 的指针扫描。各写一份必然漂。
 */

/** 一段的字数上限（判据参数 · 常量）：超过即命中。 */
export const PARAGRAPH_MAX = 300

/** 表格行谓词（markdown 表格行结构性不可折行——不计入段，且断段）。 */
export const isTableRow = (l) => /^\s*\|.*\|\s*$/.test(String(l))

/** 围栏标记（行首可选空白 + 三反引号 ∥ 三波浪号 ⇒ `{ ch, len }`；非围栏行 ⇒ null）。
 *  闭合语义带长度：同字符 ∧ 长度 ≥ 开启长度（CommonMark）——只比字符会让四反引号围栏包住的三反引号块提前闭合，
 *  块内代码行落进正文并被并成段。 */
export function fenceMark(l) {
  const m = /^\s*(`{3,}|~{3,})/.exec(String(l))
  return m ? { ch: m[1][0], len: m[1].length } : null
}

/** 围栏闭合谓词（单源 = 上面的长度语义）。 */
export const isFenceClose = (mark, fence) => mark.ch === fence.ch && mark.len >= fence.len

/** 引文块行谓词（行首可选空白 + `>`）——引文整块不计入段（逐字连续、不可折）。 */
export const isQuoteLine = (l) => /^\s*>/.test(String(l))

/** 列表项谓词（无序 `-` ∥ `*` ∥ `+` · 有序 `数字 + . ∥ ） ∥ 、` · 中文标记 `·` ∥ `•`；圈号 `①`–`⑳` 另起一式）。 */
export const isListItem = (l) => /^\s*(?:[-*+]|\d+[.)、]|[·•])\s/.test(String(l)) || /^\s*[①-⑳]/.test(String(l))

/** 缩进代码行：四格空格或 Tab 起头；是否成块还要看前一行是否为空或也是代码。 */
const isIndentedCodeLine = (l) => /^(?: {4}|\t)/.test(String(l))

/** 表格单元：只把未转义且在码段外的竖线当分隔符；外侧竖线形成的空单元再剥掉。 */
function tableCells(l) {
  const s = String(l).trim()
  if (!s.includes("|")) return null
  const cells = []
  let start = 0
  let codeTicks = 0
  let i = 0
  while (i < s.length) {
    if (s[i] === "\\" && s[i + 1] === "|" && codeTicks === 0) { i += 2; continue }
    if (s[i] === "`") {
      let end = i + 1
      while (s[end] === "`") end += 1
      const ticks = end - i
      if (codeTicks === 0) codeTicks = ticks
      else if (codeTicks === ticks) codeTicks = 0
      i = end
      continue
    }
    if (s[i] === "|" && codeTicks === 0) {
      cells.push(s.slice(start, i))
      start = i + 1
    }
    i += 1
  }
  cells.push(s.slice(start))
  if (s.startsWith("|") && cells[0].trim() === "") cells.shift()
  if (s.endsWith("|") && cells.at(-1).trim() === "") cells.pop()
  return cells.map((cell) => cell.trim())
}

/** 无首尾竖线的表头只能由下一行的分隔行确认；列数必须一致，避免把普通竖线文本误判成表。 */
function startsTable(lines, i) {
  const header = tableCells(lines[i])
  const delimiter = i + 1 < lines.length ? tableCells(lines[i + 1]) : null
  return header !== null && delimiter !== null && header.length === delimiter.length && delimiter.every((cell) => /^:?-{3,}:?$/.test(cell))
}

/** 空行之后仍是缩进内容或下一列表项 ⇒ 这是疏松列表的内部空行，不是列表结束。 */
function listContinuesAfterBlank(lines, i) {
  for (let j = i + 1; j < lines.length; j += 1) {
    if (lines[j].trim() === "") continue
    return isListItem(lines[j]) || /^\s{2,}\S/.test(lines[j])
  }
  return false
}

/** 表格块、列表块与缩进代码块的整行排除表；围栏截断表格，但缩进围栏不截断它所属的列表。
 *  列表项之后的普通行是 Markdown 的懒惰续行，同样属于列表；表格体延续到第一个无竖线的非空行。 */
function structuralExclusionLines(lines) {
  const excluded = new Array(lines.length).fill(false)
  let fence = null
  let inList = false
  let inTable = false
  let inIndentedCode = false
  lines.forEach((l, i) => {
    const mark = fenceMark(l)
    if (mark !== null) {
      const nestedInList = inList && /^\s{2,}\S/.test(l)
      if (fence === null) fence = mark
      else if (isFenceClose(mark, fence)) fence = null
      if (!nestedInList) inList = false
      inTable = false
      inIndentedCode = false
      return
    }
    if (fence !== null) return
    const previous = i === 0 ? "" : lines[i - 1]
    const codeBoundary = i === 0 || previous.trim() === "" || inIndentedCode
    inIndentedCode = isIndentedCodeLine(l) && codeBoundary
    if (inIndentedCode) {
      excluded[i] = true
      inTable = false
      return
    }
    if (startsTable(lines, i)) {
      inTable = true
      inList = false
    }
    if (isTableRow(l) || (inTable && tableCells(l) !== null)) {
      excluded[i] = true
      inList = false
      return
    }
    inTable = false
    if (headingMark(l)) inList = false
    else if (isListItem(l)) inList = true
    else if (inList && l.trim() === "") inList = listContinuesAfterBlank(lines, i)
    if (inList) excluded[i] = true
  })
  return excluded
}

/** 提示词面谓词（`thincoder-core/prompts/**`）：模型读原始文本，一行就是一个块 ⇒ 该面逐行判。 */
export const isPromptFace = (abs) => /(?:^|\/)thincoder-core\/prompts\//i.test(String(abs).replace(/\\/g, "/"))

/** 码段切分（行内反引号按出现序配对）：`{ start, end, text }[]`——开启反引号之后一位到闭合反引号所在位。
 *  消费面是图侧指针扫描（它跳过命令形码段）；段判据不吃它（段 = 读者所见，码段渲染后仍在段内）。 */
export function codeSpans(line) {
  const l = String(line)
  const ticks = []
  for (let i = 0; i < l.length; i++) if (l[i] === "`") ticks.push(i)
  const spans = []
  for (let k = 0; k + 1 < ticks.length; k += 2) {
    spans.push({ start: ticks[k] + 1, end: ticks[k + 1], text: l.slice(ticks[k] + 1, ticks[k + 1]) })
  }
  return spans
}

/** 单个码段的可执行谓词（命令 / 搜索模式串）：判域只是这一段的文本，不连同同一行的其他码段。 */
export function isExecutableSpan(span) {
  const t = typeof span === "string" ? span : String(span?.text ?? "")
  return t.includes("&&") ||
    /\b(?:cd|node|npm|npx|grep|rg|git)\s/.test(t) ||
    /(?:\[\^|\\\.|\(\?<|\(\?:|\{\d)/.test(t)
}

/** 行内可执行坐标（任一码段满足 `isExecutableSpan`）。 */
export function isExecutableLine(line) {
  return codeSpans(line).some(isExecutableSpan)
}

/** 行内位置是否在反引号码段内（与 `isExecutableLine` 同取一份配对规则）。 */
export function inCodeSpan(line, idx) {
  return codeSpans(line).some((s) => idx >= s.start && idx <= s.end)
}

/** 标题谓词：行首 1–6 个 `#` 后接空白 ⇒ `{ level, text }`；非标题行 ⇒ null。
 *  不锚行尾（`$` 会让 CRLF 的标题行漏认），也不要求标题后还有正文。 */
export function headingMark(l) {
  const s = String(l)
  const m = /^(#{1,6})\s+/.exec(s)
  return m ? { level: m[1].length, text: s.slice(m[0].length) } : null
}

/** 围栏块**之外**的行（`{ no, text }`，`no` = 1-based 行号）：判据 ② ∥ ③ 的扫描面。
 *  围栏里是逐字证据与举例，不是指路——判它只会让每一份「改前 / 改后」对照块都来一条假命中。 */
export function bodyLines(text) {
  const out = []
  let fence = null
  String(text ?? "").split("\n").forEach((l, i) => {
    const mark = fenceMark(l)
    if (mark !== null) {
      if (fence === null) fence = mark
      else if (isFenceClose(mark, fence)) fence = null
      return
    }
    if (fence === null) out.push({ no: i + 1, text: l })
  })
  return out
}

/**
 * 判据 ①：一段超过 `PARAGRAPH_MAX` 字 ⇒ 一条命中 `{ line, len }`（`line` = 段首行，1-based）。
 *
 * **区间归属就落在这里，因为「一段跨哪几行」只有本函数知道**：命中只带段首行与字数，跨行从命中里读不出来
 * （判据句单源 = `docs/core/design/DOC-CHECK.md` §6「区间只在段这一级扩」）。
 * @param {string} text 档全文（调用方读好的，本档不读盘）
 * @param {{promptFace?:boolean, region?:{rows:number[],gaps:number[]}|null}} o
 *   `promptFace` = 该档在提示词面 ⇒ 逐行判（每行自成一段）；
 *   `region` = 本批变更区（`null` = 判整份）：段内含变更行 ⇒ 整段量；整段无变更行 ⇒ 不判。
 *   纯删的零宽区间（`gaps`）落在缝上 ⇒ 取**缝上现占位的那一段**——缝前那一行属于它，或缝后那一行是它的首行。
 * @returns {{line:number, len:number}[]}
 */
export function paragraphHits(text, { promptFace = false, region = null } = {}) {
  const src = String(text ?? "")
  const lines = src.split("\n")
  const excluded = structuralExclusionLines(lines)
  // 段的归属：变更行在段内，或纯删的缝贴在段首之前 ∥ 落在段内；**缝落在档头（`g = 0`）则取第一段**。
  // 第一段只有把段收齐之后才指得出来，所以本函数先收段、再按 `i` 判第一段。
  const owned = (s, e, i) => {
    if (region === null || region === undefined) return true
    for (const r of region.rows ?? []) if (r >= s && r <= e) return true
    for (const g of region.gaps ?? []) {
      if (g === 0) return i === 0
      if (g >= s - 1 && g <= e) return true
    }
    return false
  }
  if (promptFace) {
    const spans = []
    lines.forEach((l, i) => {
      if (!excluded[i]) spans.push({ line: i + 1, end: i + 1, len: [...l].length })
    })
    return spans.filter((s, i) => s.len > PARAGRAPH_MAX && owned(s.line, s.end, i)).map(({ line, len }) => ({ line, len }))
  }
  const spans = []
  let fence = null
  let cur = null
  const flush = () => {
    if (cur !== null) spans.push(cur)
    cur = null
  }
  lines.forEach((l, i) => {
    const mark = fenceMark(l)
    if (mark !== null) {
      if (fence === null) fence = mark
      else if (isFenceClose(mark, fence)) fence = null
      flush()
      return
    }
    if (fence !== null) { flush(); return } // 围栏块内整行断段（未闭合 ⇒ 至档尾免）
    if (excluded[i] || headingMark(l) || l.trim() === "" || isQuoteLine(l)) { flush(); return }
    if (cur === null) cur = { line: i + 1, end: i + 1, len: 0 }
    cur.end = i + 1
    cur.len += [...l].length
  })
  flush()
  return spans.filter((s, i) => s.len > PARAGRAPH_MAX && owned(s.line, s.end, i)).map(({ line, len }) => ({ line, len }))
}
