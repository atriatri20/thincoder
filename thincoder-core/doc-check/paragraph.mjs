/**
 * doc-check/paragraph.mjs — 文档纪律机检的产品档位（段判据谓词族 + 段判据——实现单源）。
 *
 * 口径单源 = `docs/core/design/DOC-DISCIPLINE.md` §3.18 条目 Q（单位是段 / 面谓词 / 阈值 / 不分域）；
 * 产品内建裁定 = 同档 §3.20 条目 S——谓词单源随迁：本仓 `scripts/doc-check-paragraph.mjs` 改述为
 * **再出口缝**（薄档 · 零逻辑 · 逐名再出口），盘上不留第二份谓词实现。
 * 两面切块：文档面量段（相邻非空正文行合并成一段，量段长）· 提示词面（`isPromptFace`）量行
 * （逐行裸判，无结构豁免）——判据不分适用面，工具描述面同样按段判（口径 = §3.18 条 7）。度量 = `[...line].length`（CJK 计 1——不引显示宽度 / 字体）；
 * 阈值 = 调用方的内置常量（`DOC_CHECK_BUILTINS.paragraphMax` / `lineMax`）——不读声明面，也不扫目录：
 * **判定集 = 调用方传入的文件清单**。
 * 不计入段的行类（同时把段断开）= 空行 ∥ 表格行 ∥ 标题 ∥ 列表项 ∥ 引用行 ∥ 围栏（标记行与块内整行）
 * ∥ 区带内：只认结构谓词，无行级白名单（按行号 / 注释声明的豁免不入判）；可执行行在段判据里**不豁免**
 * （段 = 读者所见，码段渲染后仍在段内——§3.18 关键决策 ①）。
 * 边界：本档零门禁 / 零退出码 / 零阻断——报告态由 `agent-tools/doc-check.mjs` 呈现。
 */
import { readFileSync } from "node:fs"

/** 段判据类名单源（报面与统计同取此名——改报面忘改过滤的字面漂移，2026-10-26 实发过一次）。 */
export const DOC_CLASS = Object.freeze({ para: "文字太长，难于阅读", line: "行太长" })

/** 表格行谓词（markdown 表格行结构性不可折行——不计入段，与锚检查同源）。 */
export const isTableRow = (l) => /^\s*\|.*\|\s*$/.test(String(l))

/** 围栏标记（行首可选空白 + 三反引号 ∥ 三波浪号 ⇒ `{ ch, len }`；非围栏行 ⇒ null）——**单源**：
 *  `isFenceLine` 与两处块扫描（本节段判据 ∥ `./anchors.mjs` 锚抽取）同取此式，使「同形围栏行止」只此一解
 *  （同一模块内同符两义 = 单源可漂的结构口子）。
 *  **长度带出**：闭合 = 同字符 ∧ 长度 ≥ 开启长度（CommonMark 围栏语义）——只比字符会让
 *  `` ```` `` 包 `` ``` `` 的嵌套围栏在外层开启行处提前闭合，内层代码行落入正文并被并成段。 */
export function fenceMark(l) {
  const m = /^\s*(`{3,}|~{3,})/.exec(String(l))
  return m ? { ch: m[1][0], len: m[1].length } : null
}

/** 围栏闭合谓词（单源 = 上面的长度语义）：两个 `{ ch, len }` 判闭合。 */
export const isFenceClose = (mark, fence) => mark.ch === fence.ch && mark.len >= fence.len

/** 围栏行谓词（单源 = `fenceMark`）——围栏行自身与块内整行均不计入段。 */
export const isFenceLine = (l) => fenceMark(l) !== null

/** 引文块行谓词（行首可选空白 + `>`）——连续 `>` 行整块不计入段（引证须逐字连续、不可折，同表行理据）。 */
export const isQuoteLine = (l) => /^\s*>/.test(String(l))

/** 列表项谓词（无序 `-` ∥ `*` ∥ `+` · 有序 `数字 + . ∥ ） ∥ 、` · 中文标记 `·` ∥ `•`——三族要求标记后有空白；圈号 `①`–`⑳` 另起一式、不要求）——列表项不计入段且断段。 */
export const isListItem = (l) => /^\s*(?:[-*+]|\d+[.)、]|[·•])\s/.test(String(l)) || /^\s*[①-⑳]/.test(String(l))

/** 提示词面谓词（`thincoder-core/prompts/**`——形态对齐 `./anchors.mjs` 的 `OPERAND_FACE`，单源住本档）：
 *  模型读原始文本，一行就是一个块（FR46 同源理由）⇒ 该面逐行裸判，无结构豁免。 */
export const isPromptFace = (abs) => /(?:^|\/)thincoder-core\/prompts\//i.test(String(abs).replace(/\\/g, "/"))

/** 区带头谓词（§3.15 谓词面）：标题文本去首部编号（`^\d+(?:\.\d+)*[.、]?\s*`）后——等于区带名 ∨ 以
 *  「区带名 + （∕(」起（容括注后缀，如 `变更记录（续）`）；闭集外一律不纳（fail-closed）。 */
export function isZoneHead(headingText, zones = []) {
  const text = String(headingText).replace(/^\d+(?:\.\d+)*[.、]?\s*/, "")
  return zones.some((z) => typeof z === "string" && z !== "" && (text === z || text.startsWith(z + "（") || text.startsWith(z + "(")))
}

/** 码段切分谓词（判面边界**只此一式**）：行内反引号**按出现序配对**——第 1、3、5… 枚开启、第 2、4… 枚闭合，
 *  奇数枚落单的末枚不成段 ⇒ `{ start, end, text }[]`：`start` = 开启反引号之后的一位、`end` = 闭合反引号所在位，
 *  内容 = `line.slice(start, end)`。两枚之间的**空档不参与判定**（它不是码段）。
 *  依据：旧三支正则都以「裸反引号起止」认码段（`` `[^`\n]*…` ``），于是任意两枚反引号之间的文本都被当码段——
 *  一行两个已配对码段、空档里出现 `cd` 时整行被判可执行行 ⇒ 该行的悬空指针一条不报（实读：整行 0 条命中；
 *  去掉码段后同一句 1 条 `档缺`）。漏报方向，故判面改为「码段之内」。 */
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
  return t.includes("&&") || // 命令链（cd … && …）
    /\b(?:cd|node|npm|npx|grep|rg|git)\s/.test(t) || // 码段内命令词
    /(?:\[\^|\\\.|\(\?<|\(\?:|\{\d)/.test(t) // 码段内搜索模式串片段
}

/** 行内可执行坐标（命令 / 搜索模式串码段）——锚判据**只跳满足段谓词的码段区间**用；
 *  段判据不豁免（段 = 读者所见）。行谓词保留既有语义 = 任一码段满足 `isExecutableSpan`。 */
export function isExecutableLine(line) {
  return codeSpans(line).some(isExecutableSpan)
}

/** 行内位置是否在反引号码段内（引述面不判）——与 `isExecutableLine` 同取 `codeSpans` 的配对（一处配对规则、两处消费）。
 *  在段内 = 位于开启反引号之后、闭合反引号（含）之前。
 *  **与旧「奇偶反引号计数」的差**：只在**反引号数为奇数**的行上——旧式把落单末枚当开启、其后整行算在段内；
 *  本式按配对规则不认落单枚（判据句 = 设计 §3.18「一处配对规则」）。偶数枚的行上两式逐位同判。 */
export function inCodeSpan(line, idx) {
  return codeSpans(line).some((s) => idx >= s.start && idx <= s.end)
}

/** 标题谓词（**单源** = 本档 · 判据句 = §3.18「标题谓词只此一式」）：行首 1–6 个 `#` 后接空白 ⇒ `{ level, text }`
 *  （形对齐 `fenceMark` 的「谓词返回判据物」）；非标题行 ⇒ `null`。段判据的标题栈、写前门的正文行谓词、
 *  锚判的节号读取（`headingNumber`）同消费本谓词——三处各留一份「什么算标题」的正则就是三处会漂。
 *  **判据句原文就是「行首 1–6 个 `#` 后接空白」**：所以本式不要求 `#` 后那一行还有正文，也不锚行尾
 *  （`$` 会让 `\r` 行尾的标题行漏认——CRLF 档里「什么叫标题」两式不同，写前门会把标题行当正文行）。 */
export function headingMark(l) {
  const s = String(l)
  const m = /^(#{1,6})\s+/.exec(s)
  return m ? { level: m[1].length, text: s.slice(m[0].length) } : null
}

/** 段判据（阈值 = 调用方内置常量 `paragraphMax` ∥ `lineMax`；口径逐字 = §3.18 条目 Q）：
 *  · 文档面：相邻非空正文行合并成一段，段长 = 组成行 `[...line].length` 之和 > `paragraphMax` ⇔ 命中
 *    （`clazz: "文字太长，难于阅读"`，定位 = 段首行号；`text` = 该段整段原文、首尾去空白）；正文行 = 非空 ∧ 非表格行 ∧ 非标题 ∧ 非列表项 ∧ 非引用行
 *    ∧ 非围栏（标记行与块内整行）∧ 非区带内；其余行类不计入、且把段断开。
 *  · 提示词面（`isPromptFace`）：逐行裸判——`[...line].length` > `lineMax` ⇔ 命中（`clazz: "行太长"`，
 *    无结构豁免；`text` = 该行整行原文、首尾去空白）。
 *  单遍扫描携标题栈（`headingMark` 命中行入栈——同级 ∥ 更高级出栈）：行所属标题链任一为区带头 ⇒ 区带内
 *  （不计入段且断段）。围栏未闭合 ⇒ 至档尾整块免（fail-open 方向——§3.18 残余登记 ①）；
 *  `exemptZones` 缺省 ∥ 空集 ⇒ 零豁免。`files`（必填）= **判定集**（调用方传入的档清单——本档不遍历
 *  任何目录；空集 ⇒ 零命中）。
 *
 *  入参形态（判据句 = §3.20「入参形态」）：**三格必填 + 一格可省**——`paragraphMax` ∥ `lineMax` ∥ `files` 必填，
 *  `exemptZones` 可省（缺省 `[]`，省略它不抛）。必填格缺一格 ∥ 位置传错（第二实参不是对象 ∥ 形参表外多给位置实参）
 *  ∥ 类型不对 ⇒ **抛**：静默失效的方向是**假绿**，而假绿没人会去查。
 *
 *  读面（读不到 ≠ 干净）：档在盘但读不到 ⇒ **不静默当零命中**，记入返回值的 `unreadable` 清单（口径 = §3.20「读面」块）。
 *  返回形仍是命中数组（既有消费面 `for` ∥ `.filter` ∥ `.length` 零改）；清单随属性带出——`hits.unreadable`。
 *
 *  `textOf`（可选）= **判定输入替换**（`docs/core/design/DOC-CHECK.md` §2.10.1）：给这一档返回文本就不读盘，返回
 *  `undefined` 走既有读盘路。它只换「读哪份字节」，阈值 ∥ 段划法 ∥ 命中类一字不改。 */
export function checkParagraphs({ paragraphMax, lineMax, exemptZones = [], files, textOf } = {}, ...rest) {
  // 配置缺失 = 硬错，不是静默不命中。
  // `para.len > undefined` 恒 false ⇒ **永不命中 = 假绿**；而误报会被人发现，假绿不会。
  // 实测来源（本档原注记）：围栏批（2026-10-27）调试时把配置当第二参数传，一度以为修复无效——
  // 两个阈值都是 undefined，门一路绿灯。
  if (rest.length > 0) {
    throw new Error(`checkParagraphs: 只收一个对象实参（收到 ${rest.length + 1} 个位置实参）。` +
      "正确形：checkParagraphs({ paragraphMax, lineMax, exemptZones?, files })——配置与判定集必须同在一个对象里；" +
      "多给的位置实参一律不读，判定集因此静默落空，读起来就是「全部过关」。")
  }
  if (!Number.isFinite(paragraphMax) || !Number.isFinite(lineMax)) {
    throw new Error(`checkParagraphs: paragraphMax ∥ lineMax 必须是有限数字（收到 ${paragraphMax} / ${lineMax}）。` +
      "配置全在第一个参数：{ paragraphMax, lineMax, exemptZones, files }。阈值缺失时永不命中，读起来就是「全部过关」。")
  }
  if (!Array.isArray(files)) {
    throw new Error(`checkParagraphs: files 必须是数组（判定集——收到 ${files === undefined ? "undefined（缺这一格）" : typeof files}）。` +
      "正确形：{ paragraphMax, lineMax, exemptZones?, files: [<档绝对路径>] }。判定集缺失 ∥ 传成字串时判 0 档，" +
      "读起来就是「全部过关」；`files: []` 才是合法的「判 0 档」。")
  }
  const zones = (Array.isArray(exemptZones) ? exemptZones : []).filter((z) => typeof z === "string" && z !== "")
  const hits = []
  const unreadable = [] // 读面：档在盘但读不到 ⇒ 入此清单（与静默跳过分开：跳过读起来就是「这档干净」）
  for (const f of files) {
    let text = ""
    // 判定输入替换（`docs/core/design/DOC-CHECK.md` §2.10.1）：给了这一档的文本就不读盘。
    // 「读哪份字节」换掉，判据本体一字不改；没给 ⇒ 既有读盘路。
    const given = typeof textOf === "function" ? textOf(f) : undefined
    if (given !== undefined) text = given
    else try { text = readFileSync(f, "utf8") } catch { unreadable.push(f); continue }
    if (isPromptFace(f)) {
      text.split("\n").forEach((l, i) => {
        const len = [...l].length
        // `text` = 该行整行原文（首尾去空白）——豁免登记的识别键取它（§2.7「`text` 取什么」）：
        // 只给行号不给文本，登记就只能靠行号匹配，插一行整片失效。
        // `token` = 该行整行原文（载荷格，见 `./index.mjs` 的 `root` 载荷条）：拒文四件的「内容」那一格读它。
        if (len > lineMax) hits.push({ file: f, line: i + 1, len, clazz: DOC_CLASS.line, text: l.trim(), token: l.trim() })
      })
      continue
    }
    const stack = [] // 标题栈 —— { level, exempt }；exempt = 自身 ∥ 祖先命中区带
    let fence = null // 围栏标记（` ∥ ~）；null = 不在块内
    let para = null // 在写的段 —— { start, len, text: [] }；非正文行 ⇒ 断开
    const lines = text.split("\n")
    const flush = () => {
      // `text` = 该段整段原文（首尾去空白、内部逐字）——豁免登记的识别键取它（§2.7「`text` 取什么」）。
      // 段文本就是本循环已经在数的那些行，不另读一次档、不另拆一次段。
      // `token` = 该段整段原文（载荷格 · 与上一条同源）；`text` 同时是豁免登记的识别键，两格不合并。
      if (para !== null && para.len > paragraphMax) {
        const body = para.text.join("\n").trim()
        hits.push({ file: f, line: para.start, len: para.len, clazz: DOC_CLASS.para, text: body, token: body })
      }
      para = null
    }
    lines.forEach((l, i) => {
      const mark = fenceMark(l)
      if (mark !== null) {
        if (fence === null) fence = mark
        else if (isFenceClose(mark, fence)) fence = null
        flush()
        return // 围栏标记行自身断段
      }
      if (fence !== null) { flush(); return } // 块内整行断段（未闭合 ⇒ 至档尾免）
      const hm = headingMark(l) // 标题谓词单源（本档导出面）——段判据不再自持正则
      if (hm) {
        while (stack.length && stack[stack.length - 1].level >= hm.level) stack.pop()
        const self = isZoneHead(hm.text.trim(), zones)
        stack.push({ level: hm.level, exempt: self || (stack[stack.length - 1]?.exempt ?? false) })
        flush()
        return // 标题断段
      }
      const inZone = stack[stack.length - 1]?.exempt === true
      if (inZone || l.trim() === "" || isTableRow(l) || isListItem(l) || isQuoteLine(l)) { flush(); return }
      if (para === null) para = { start: i + 1, len: 0, text: [] }
      para.len += [...l].length
      para.text.push(l)
    })
    flush()
  }
  hits.unreadable = unreadable // 读不到清单：返回形保持命中数组（消费面零改），清单随属性带出
  return hits
}
