/**
 * doc-check/graph-tokens.mjs — 文档锚点图的**取形纯函数**（三支 token 家族 + RTM 行配对）。
 *
 * 这是需求 F2「同一份文档只有一套解析器」的另一半：本档只**取形**（吃一行原文，吐候选 token 与区间），
 * **不读盘、不解析**——解析仍走 `./anchors.mjs` 的同一次遍历与同一个解析会话（`resolveToken`）。
 * 两个消费面：
 *  · `./anchors.mjs` 的同一个逐行循环体——三支 token 家族（需求编号 ∥ 用例编号 ∥ 反引号符号名）；
 *  · `../doc-graph.mjs` 的 RTM 面对——行配对（用例号 + 族号 + 行末档），产 `case-file` 边。
 *
 * 字符类与边界**取 `./anchors.mjs` 那三件**（`NAME_CH` ∥ `TOKEN_LEFT_GUARD` ∥ `TOKEN_RIGHT_GUARD`），
 * 不另造一份：同一形两处各写一份，一处改另一处静默不同步。
 *
 * **为什么正则惰性建**：本档与 `./anchors.mjs` 互为 import（那边取本档的三个家族函数、本档取那三件常量）。
 * 模块求值期读对方的 `const` 会撞 TDZ（`NAME_CH` 尚未初始化）；正则建在首次调用时，那时两档都已求值完毕。
 */

import { NAME_CH, TOKEN_LEFT_GUARD, TOKEN_RIGHT_GUARD, isDocToken } from "./anchors.mjs"
import { codeSpans } from "./paragraph.mjs"

/** RTM 用例行首格：`41-1`（可带族名——盘上分册写作纯号、索引写作 `CLI 41`）。 */
const RTM_ROW_RE_BODY = "^\\s*\\|\\s*`?((?:[A-Z]{2,6}\\s+)?\\d+-\\d+)`?\\s*\\|"
/** RTM 分册节标题：`## CLI 41. 批量改多档…` ⇒ 族号 `CLI 41`（`§` 号在族名后、故事名在 `.` 之后）。 */
const RTM_HEAD_RE_BODY = "^#{1,6}\\s+([A-Z]{2,6})\\s+(\\d+)(?:[.、]|\\s)"

let reqRe = null
let caseRe = null
let symbolShapeRe = null
let rtmRowRe = null
let rtmHeadRe = null
let cellTokenRe = null

// 取形式的**整串**也在首次调用时才拼：`TOKEN_LEFT_GUARD` 一类常量住 `./anchors.mjs`，而两档互为 import——
// 模块求值期拼它们同样是 TDZ。故这里只有惰性 getter，没有引用那些常量的模块级常量。
/** 需求编号形：`F` + 数字 ∥ `AC-` + 数字（`F16` ∥ `AC-14`）。两界取锚面那一对——
 *  同号的两份需求档并进同一节点是已知限度（设计 §2.1），不是本支要治的事。 */
const REQ_RE = () => (reqRe ??= new RegExp(`${TOKEN_LEFT_GUARD}(?:AC-\\d+|F\\d+)${TOKEN_RIGHT_GUARD}`, "gu"))
/** 用例编号形：族名 + 空格 + `数字-数字`（`CLI 41-1`）。族名只认大写字母 2–6 位——
 *  盘上三族（`CLI` ∥ `VSC` ∥ 端名）都是这个形；小写词与「第 41-1 页」这类散文不抽。 */
const CASE_RE = () => (caseRe ??= new RegExp(`${TOKEN_LEFT_GUARD}([A-Z]{2,6})\\s+(\\d+-\\d+)${TOKEN_RIGHT_GUARD}`, "gu"))
/** 反引号内标识符的形：全是 `NAME_CH` 字符（字母 / 数字 / `_` / `.` / `-`）。 */
const SYMBOL_SHAPE_RE = () => (symbolShapeRe ??= new RegExp(`^${NAME_CH}+$`, "u"))
const RTM_ROW_RE = () => (rtmRowRe ??= new RegExp(RTM_ROW_RE_BODY, "u"))
const RTM_HEAD_RE = () => (rtmHeadRe ??= new RegExp(RTM_HEAD_RE_BODY, "u"))
/** 行末格里的档 token（形与锚面同族：目录段 + 名 + 扩展名）。 */
const CELL_TOKEN_RE = () => (cellTokenRe ??= new RegExp(`(?:${NAME_CH}+\\/)*${NAME_CH}+\\.[A-Za-z][A-Za-z0-9]{0,9}`, "gu"))

/** 逐 token 扫一行的共用骨架：只回 `{token, start, end}`，不回命中语义（本档不判、不解析）。
 *  三支取形式都保证非空匹配，故不需要「零长匹配 ⇒ 手动前进」那一支（走不到的路不写守卫）。 */
function allMatches(re, line, pick) {
  const out = []
  const s = String(line ?? "")
  re.lastIndex = 0
  let m
  while ((m = re.exec(s)) !== null) out.push(pick(m))
  return out
}

/**
 * 需求编号（`cites-req` 的取形面）。
 * @param {string} line 一行原文
 * @returns {{token:string, start:number, end:number}[]} `token` = 写出来的编号原文（`F16` ∥ `AC-14`）
 */
export function reqRefsOf(line) {
  return allMatches(REQ_RE(), line, (m) => ({ token: m[0], start: m.index, end: m.index + m[0].length }))
}

/**
 * 用例编号（`mentions-case` 的取形面）。盘上三种写法一个节点：分册行首格 `41-1`、散文 `CLI 41-1`、
 * 节标题 `## CLI 41.`——本支只认**写全了族号**的那一种；另两种由 `rtmRowOf` / `rtmFamilyOf` 在 RTM 面配对。
 * @param {string} line 一行原文
 * @returns {{token:string, start:number, end:number}[]} `token` = `族名 + 单空格 + 编号`（`CLI 41-1`）
 */
export function caseRefsOf(line) {
  return allMatches(CASE_RE(), line, (m) => {
    const token = `${m[1]} ${m[2]}`
    return { token, start: m.index, end: m.index + m[0].length }
  })
}

/**
 * 反引号内的标识符（`cites-symbol` 的取形面）。今天的码段扫描只**跳**不取（`codeSpans` 只用来占区间），
 * 本支把那段区间读成候选。
 *
 * **不抽的形**（每一条都有盘上理由）：含 `/` 或空白（那不是标识符）· 形不成 `NAME_CH` 全字符
 * （`node:sqlite` 的 `:` 不在类内 ⇒ 整段不抽，不作两个名字）· 一个字母都没有（纯数字 / 纯标点）·
 * 以 `.` 或 `-` 起头（`...rest` ∥ `-` 分隔的片段）· 是档 token（`EDIT.md` 已由锚面管，不重抽）· 长于 80 字。
 * **不判它是不是真有这个符号**：`state` 一律「判不了存在性」（设计 §2.2 三态表），不冒充 `ok`。
 * @param {string} line 一行原文
 * @returns {{token:string, start:number, end:number}[]} `token` = 码段原文（首尾去空白）
 */
export function symbolRefsOf(line) {
  const out = []
  for (const span of codeSpans(line)) {
    const token = String(span.text ?? "").trim()
    if (token.length < 2 || token.length > 80) continue
    if (token.includes("/") || /\s/.test(token)) continue
    if (!SYMBOL_SHAPE_RE().test(token)) continue
    if (!/\p{L}/u.test(token)) continue
    if (/^[.\-]/.test(token)) continue
    // 档 token 归锚面（不重复成符号边）。**形分档之后**：裸写的代码族名不再算档 token（`docs/core/design/DOC-CHECK.md`
    // §2.10.3）⇒ `` `file.mjs` `` 这类散文提及会落到本支成为 `cites-symbol` 候选。它只动图的边、不入 verdict
    // （本支产出的 `state` 一律「判不了存在性」），但设计 §2.10.3 的「四条分支」漏计了这一面——已随交付报告上抛。
    if (isDocToken(token)) continue
    out.push({ token, start: span.start, end: span.end })
  }
  return out
}

/**
 * RTM 分册节标题 → 族号（`## CLI 41. 批量改多档…` ⇒ `CLI 41`）。
 * 用例身份 = `族号 + 单空格 + 行首格编号`（设计 §2.1 的「三种写法一个节点」）。
 * @param {string} line 一行原文
 * @returns {string|null} 族号原文 / 非节标题或族号形不合 ⇒ null
 */
export function rtmFamilyOf(line) {
  const m = RTM_HEAD_RE().exec(String(line ?? ""))
  return m ? `${m[1]} ${m[2]}` : null
}

/**
 * RTM 用例行 → 行首格编号 + 行末格档 token（`case-file` 边的原料，KD-9：照登记处连，不猜档名）。
 * 行形（盘上实读）：`| 41-1 | 怎么做 | 怎么算通过 | 异常 | test/integration/x.test.mjs |`——
 * 首格是用例号、末格是用例档，中间三列是散文（可能含别的 token，故末格只取**最后一个**形如档 token 的格子内容）。
 * @param {string} line 一行原文
 * @returns {{num:string, fileToken:string|null}|null} 不是用例行 ⇒ null；`fileToken` 缺席 ⇒ null
 */
export function rtmRowOf(line) {
  const s = String(line ?? "")
  const head = RTM_ROW_RE().exec(s)
  if (!head) return null
  const cells = s.split("|").map((c) => c.trim()).filter((c) => c !== "")
  // `| a | b |` 切成 ["", "a", "b", ""]：去掉分隔符留下的空段后，末格 = 最后一段
  // （行末有没有那一竖都读得对——不靠「倒数第二段」这种依赖尾分隔符的下标）。
  const last = cells.length > 0 ? cells[cells.length - 1] : ""
  const re = CELL_TOKEN_RE()
  let pick = null
  re.lastIndex = 0
  let m
  // 末格的档 token 判定同样吃形分档（§2.10.3）：末格若写成**裸代码族名**，本支不再产 `case-file` 边——
  // 实体用例行末格写的是带目录段的用例档路径，两条腿都过，行为零变；此句只为把代价写清楚。
  while ((m = re.exec(last)) !== null) if (isDocToken(m[0])) pick = m[0]
  return { num: head[1].replace(/\s+/g, " "), fileToken: pick }
}

/**
 * 族号 + 行首格编号 → 用例身份编号（与 `caseRefsOf` 同一个形：`族名 + 单空格 + 数字-数字`）。
 *
 * 节标题带的是**族号** `CLI 41`（字母 + 故事号），而行首格已经写着 `41-1`（故事号 + 行号）。把族号整段拼上去
 * 会得到 `CLI 41 41-1`——与散文里的 `CLI 41-1` 裂成两个节点，F6「同一件事一个节点」当场就破了，
 * `case:` 的出边（`case-file`）也会挂在没人引用的那个身份上。故身份只取族号里的**字母段**。
 * @param {string} family `rtmFamilyOf` 的返回（`CLI 41`）
 * @param {string} num `rtmRowOf` 的 `num`（`41-1`；行首格已写全时为 `CLI 41-1`）
 * @returns {string} 用例编号（`CLI 41-1`）
 */
export function caseNumberOf(family, num) {
  const n = String(num ?? "").trim()
  if (n.includes(" ")) return n // 行首格已写全族名 ⇒ 原样
  const letters = String(family ?? "").trim().split(/\s+/)[0]
  return letters ? `${letters} ${n}` : n
}