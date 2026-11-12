/**
 * doc-check/line-refs.mjs — 判据 ②「拿行号做锚」。
 *
 * 判据句单源 = `docs/core/design/DOC-CHECK.md` §1 ②：正文里出现「档名 + 冒号 + 数字」的定位写法 ⇒ 报。
 * 为什么报：上面插一行，它以下所有引用一起漂；照它去翻，翻到的是别人的东西。
 *
 * 扫描面 = 围栏块之外的行（`bodyLines`）；档名形与豁免谓词取 `./doc-tokens.mjs` ∥ `./doc-names.mjs`
 * （与判据 ③ 同一组，本档不持第二份字面）。时刻（`12:30`）不会被认成坐标——本判据要求档名紧贴在冒号前。
 */
import { EXT_PART, NAME_CH, TOKEN_LEFT_GUARD, TOKEN_RIGHT_GUARD, isDocToken } from "./doc-tokens.mjs"
import { docNameExemption } from "./doc-names.mjs"
import { bodyLines } from "./paragraph.mjs"

/** 档名 + `:` + 数字（`name:12` ∥ `name:12-15`）：行号锚的抽取式，全仓一处。
 *  右界同档名一族（数字之后不再接名字字符）；左界同档名一族（不接名字字符 ∥ 路径分隔符）。 */
export const LINE_ANCHOR_RE = new RegExp(
  `${TOKEN_LEFT_GUARD}((?:${NAME_CH}+/)*${NAME_CH}+${EXT_PART}):(\\d+)(?:-\\d+)?${TOKEN_RIGHT_GUARD}`,
  "gu",
)

/**
 * 判据 ②：逐行找「档名 + 冒号 + 数字」。
 * @param {string} text 档全文（调用方读好的，本档不读盘）
 * @returns {{line:number, token:string}[]} `line` = 1-based 行号，`token` = 命中的那一处写法（`a.md:12`）
 */
export function lineRefHits(text) {
  const out = []
  for (const { no, text: l } of bodyLines(text)) {
    const re = new RegExp(LINE_ANCHOR_RE.source, "gu")
    let m
    while ((m = re.exec(l)) !== null) {
      if (!isDocToken(m[1])) continue // 后缀不在档名清单内 ⇒ 不是档名（`1.5:3` 这类）
      if (docNameExemption(m[1]) !== null) continue // 示例名 ∥ 类名不是档名，也就不构成锚
      out.push({ line: no, token: m[0] })
    }
  }
  return out
}
