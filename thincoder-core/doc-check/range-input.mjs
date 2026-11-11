/**
 * doc-check/range-input.mjs — **范围与判定输入**族：清单形状、可判性、`texts` ∥ `zones` 归一。
 *
 * 机制单源 = `docs/core/design/DOC-CHECK.md` §2.10.1（`texts` ∥ `zones` 的语义）与 §2.4（清单形态）；
 * 分拆落点与验收 = 同档 §2.9.7。**为什么单独立档**：这一族只把调用方交的东西归一成三张表
 * （判哪些档 ∥ 每档判哪份文本 ∥ 每档判哪些区间），三条判据与报面都读它的产物——它不动任何判法。
 *
 * 两处 fail-closed 是这一族的判据，不是兜底：形态错 ⇒ **抛**，整次零判定。
 */
import { statSync } from "node:fs"
import { resolve } from "node:path"
import { pathKey } from "./per-root.mjs"

/** 不可判档的两因（闭集 · 判序 = 存在性 → 类型）：不在盘 ∥ 非 markdown 档（目录归后因）。 */
export function undecidableReason(abs) {
  let st
  try { st = statSync(abs) } catch { return "not on disk" }
  if (!st.isFile() || !abs.toLowerCase().endsWith(".md")) return "not a markdown document"
  return null
}

/** 清单条目的形状（闭集：非字符串 ∥ 空白）= 调用方错误，两种问法同拒——静默丢掉一条就是不静默地收窄范围。
 *  它判的是**清单本身**，与声明根无关 ⇒ 排在定根之前（根缺不缺都有这一拒，报错时说的仍是清单的毛病）。 */
export function assertEntryShapes(docs) {
  const bad = []
  docs.forEach((d, i) => { if (typeof d !== "string" || d.trim() === "") bad.push(i) })
  if (bad.length) {
    throw new Error(`doc_check: \`docs\` entries ${bad.map((i) => `[${i}]`).join(", ")} are not paths — every entry must be a non-empty string; no document was judged.`)
  }
}

/** 清单 → 可判集（去重保序）+ 不可判档两类（`missing` ∥ `notMarkdown`）。条目的形状由 `assertEntryShapes` 先拒。
 *  **给了 `texts` 的那一档不看盘面**（§2.10.1）：判定输入就是那份文本，新建档（还没落盘）因此同样可判；
 *  形态不变形：非 `.md` 仍归 `notMarkdown`（判据面只看 markdown 档，这条与读盘与否无关）。 */
export function resolveRange(base, docs, textOf) {
  const seen = new Set()
  const check = []
  const undecidable = []
  const missing = []
  const notMarkdown = []
  docs.forEach((d) => {
    const abs = resolve(base, d)
    const key = pathKey(abs)
    if (textOf(abs) !== undefined) {
      if (!abs.toLowerCase().endsWith(".md")) { undecidable.push({ abs, reason: "not a markdown document" }); notMarkdown.push(abs) }
      else if (!seen.has(key)) { seen.add(key); check.push(abs) }
      return
    }
    const reason = undecidableReason(abs)
    if (reason === null) { if (!seen.has(key)) { seen.add(key); check.push(abs) } return }
    undecidable.push({ abs, reason })
    if (reason === "not on disk") missing.push(abs)
    else notMarkdown.push(abs)
  })
  return { check: check.sort(), undecidable, missing, notMarkdown }
}

/** `texts` 归一一处（§2.10.1）：调用方交的是「档 → 该档本次完整新内容」，键按 `docs` 同一条解析（相对声明根或绝对）。
 *  没给 ⇒ 一个恒 `undefined` 的查表（那一路与改前逐字相同：一律读盘）。
 *  形态错（非 Map/对象、键不是路径、值不是字符串）⇒ **抛**：静默忽略会让「判定输入替换」落空，
 *  而落空的样子与「判过了」一模一样（业务门纪律：该失败就失败）。 */
export function textLookupOf(base, texts) {
  if (texts === undefined) return () => undefined
  const raw = texts instanceof Map
    ? [...texts.entries()]
    : (texts !== null && typeof texts === "object" && !Array.isArray(texts) ? Object.entries(texts) : null)
  if (raw === null) {
    throw new Error('doc_check: `texts` must be a Map or a plain object keyed by document path, value = that document\'s full new text — nothing was judged.')
  }
  const table = new Map()
  for (const [k, v] of raw) {
    if (typeof k !== "string" || k.trim() === "") {
      throw new Error('doc_check: every `texts` key must be a document path — an empty or non-string key names no document; nothing was judged.')
    }
    if (typeof v !== "string") {
      throw new Error(`doc_check: \`texts\` value for ${k} is not a string — the judged input must be that document's full text; nothing was judged.`)
    }
    table.set(pathKey(resolve(base, k)), v)
  }
  return (abs) => table.get(pathKey(abs))
}

/** `zones` 归一一处（§2.10.1）：调用方交的是「档 → 区间表」，区间按**改后档**行号、闭区间；`start > end` = 宽度为零。
 *  没给 ⇒ `null`（阻断集不按区间切分，与改前逐字相同）。
 *  形态错（非 Map/对象、值不是数组、区间不是整数行号）⇒ **抛**：一个写坏的区间表会把阻断集静默算成空集。 */
export function zoneTableOf(base, zones) {
  if (zones === undefined) return null
  const raw = zones instanceof Map
    ? [...zones.entries()]
    : (zones !== null && typeof zones === "object" && !Array.isArray(zones) ? Object.entries(zones) : null)
  if (raw === null) {
    throw new Error('doc_check: `zones` must be a Map or a plain object keyed by document path, value = an array of { start, end } — nothing was judged.')
  }
  const table = new Map()
  for (const [k, v] of raw) {
    if (!Array.isArray(v)) {
      throw new Error(`doc_check: \`zones\` value for ${k} is not an array of zones — pass [{ start, end }]; nothing was judged.`)
    }
    const list = []
    for (const z of v) {
      const start = Number(z?.start)
      const end = Number(z?.end)
      if (!Number.isInteger(start) || !Number.isInteger(end) || start < 1 || end < 0) {
        throw new Error(`doc_check: a \`zones\` entry for ${k} is not a line range — every zone is { start, end } with 1-based integers (start > end = zero width); nothing was judged.`)
      }
      list.push({ start, end })
    }
    table.set(pathKey(resolve(base, k)), list)
  }
  return table
}