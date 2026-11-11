/**
 * doc-check/exemptions.mjs — **逐条豁免分类**族：登记表读取、条目形态判定、命中 → 识别键、装配处的分桶。
 *
 * 机制单源 = `docs/core/design/DOC-CHECK.md` §2.7（本档只实现，不重述口径）；分拆落点与验收 = 同档 §2.9.7。
 * **为什么单独立档**：这一族三条判据都跑完之后才上场（`hits` → `hits` ∥ `exempted`），与判据本体零交叉——
 * 它只按登记表认命中，不动抽到哪一条、不动阈值、不动 verdict 词。所以整族搬走不动判法一字。
 */
import { DOC_CLASS } from "./paragraph.mjs"
import { LINE_REF_CLASS } from "./line-refs.mjs"
import { pathKey, rel, rootOf } from "./per-root.mjs"

/** 登记条目的判据类闭集（§2.7 的 `kind` 表）：按类 ∥ 通配 ∥ 路径前缀都不作数——`kind` 是判据类、`text` 是逐处文本。 */
export const EXEMPTION_KINDS = Object.freeze(["锚·档缺", "锚·节缺", "锚·引缺", `段·${DOC_CLASS.para}`, `行·${DOC_CLASS.line}`, LINE_REF_CLASS])

/** 一条登记的形态判据（**在消费点判**，不进 `validateManifest` 的 `errors`——一个写坏的条目不该把整份 manifest 打掉：
 *  manifest 不可用 ⇒ 域表空集 ⇒ 批档面互引不豁免 ⇒ 邻仓批档引用一律 `档缺`）。
 *  @returns {null|string} `null` = 可用；否则 = 报面点名用的那句（五字段缺一 ∥ 非字符串 ∥ 空白，或 `kind` 在闭集外） */
export function exemptionProblem(e) {
  if (e === null || typeof e !== "object" || Array.isArray(e)) return "条目不是对象"
  for (const k of ["file", "kind", "text", "why", "review"]) {
    if (typeof e[k] !== "string" || e[k].trim() === "") return `缺 ${k}`
  }
  if (!EXEMPTION_KINDS.includes(e.kind)) return `kind 不在闭集：${e.kind}`
  return null
}

/** 命中 → 识别键（§2.7「命中怎么被稳定识别」）：`file` + `kind` + `text` 三合一全等，**不用行号**。
 *  `null` = 该类不可登记：`环引` 是仓级命中（无行号、无档内文本）——假环意味着声明的 `index.publicRepos` 本身错了，
 *  那是改声明，不是登记一个假阳。 */
export function exemptionKeyOf(hit) {
  if (hit.clazz === "档缺") return { kind: "锚·档缺", text: hit.token }
  if (hit.clazz === "节缺") return { kind: "锚·节缺", text: `${hit.token}§${hit.section}` }
  if (hit.clazz === "引缺") return { kind: "锚·引缺", text: `${hit.token}「${hit.quote ?? ""}」` }
  if (hit.clazz === DOC_CLASS.para) return { kind: `段·${hit.clazz}`, text: String(hit.text ?? "") }
  if (hit.clazz === DOC_CLASS.line) return { kind: `行·${hit.clazz}`, text: String(hit.text ?? "") }
  if (hit.clazz === LINE_REF_CLASS) return { kind: LINE_REF_CLASS, text: String(hit.text ?? "") }
  return null
}

/** 装配处的豁免分类（§2.7 · **三条判据跑完之后、verdict 之前**）：一档一根地取登记表（与域表同一次读），
 *  已登记的命中进 `exempted`（照列、不阻断），未登记的留 `hits`（拦）。
 *  - **`hits` 只数未登记的那批**：消费面（批档门 ∥ 收口 ∥ 写前门）全读 `hits.total`，留在里面就要每处各学一遍「已裁定的不算」。
 *  - **登记未命中** = 这一轮一条都没对上的有效条目（原文已变 ∥ 该档已不在判集）——登记跟着一条消失的命中活下来，
 *    就是下一轮没人敢删的残骸。
 *  - **无效条目单独点名**：它不生效（命中照拦），但不把整份 manifest 打掉。
 *  @returns {{anchorHits:Array, paragraphHits:Array, lineRefHits:Array, exempted:Array, invalid:Array, stale:number}}
 *   `exempted` 每格 = 原命中 + `kind` + `exemption`（`why` ∥ `review` 从登记条目带出，报面四项一个不少） */
export function classifyExemptions({ anchorHits, paragraphHits, lineRefHits, base, roots, readOf }) {
  const tables = new Map()
  const tableOf = (root) => {
    const key = pathKey(root)
    const hit = tables.get(key)
    if (hit !== undefined) return hit
    const entry = readOf(root)
    const raw = entry.ok ? entry.res.manifest?.index?.docCheckExemptions : []
    const items = (Array.isArray(raw) ? raw : []).map((e, i) => {
      const problem = exemptionProblem(e)
      if (problem !== null) return { problem, index: i }
      return { fileKey: pathKey(String(e.file).trim()), kind: e.kind, text: e.text, why: e.why, review: e.review, used: false }
    })
    const t = { root, items }
    tables.set(key, t)
    return t
  }
  // 参与判定的每个根都读一次（与域表同一次读）：登记未命中要能数出「这一轮一条都没对上」的那批。
  for (const r of roots) tableOf(r)
  const split = (hits) => {
    const kept = []
    const exempted = []
    for (const h of hits) {
      const k = exemptionKeyOf(h)
      if (k === null) { kept.push(h); continue }
      const t = tableOf(rootOf(h.file, base))
      const own = pathKey(rel(t.root, h.file))
      const matched = t.items.find((it) => it.problem === undefined && it.fileKey === own && it.kind === k.kind && it.text === k.text)
      // 同一识别键可能对上多处（同一行两处行号坐标 ∥ 两段同文）：**一处登记免掉这一组**——识别键本身分不开它们，
      // 只认第一处会让第二处「登记了却照拦」，而作者看回执只会以为登记坏了。
      if (matched) { matched.used = true; exempted.push({ ...h, kind: k.kind, exemption: matched }); continue }
      kept.push(h)
    }
    return { kept, exempted }
  }
  const a = split(anchorHits)
  const p = split(paragraphHits)
  const l = split(lineRefHits)
  const invalid = []
  let stale = 0
  for (const t of tables.values()) for (const it of t.items) {
    if (it.problem !== undefined) invalid.push({ root: t.root, index: it.index, problem: it.problem })
    else if (!it.used) stale++
  }
  return {
    anchorHits: a.kept, paragraphHits: p.kept, lineRefHits: l.kept,
    exempted: [...a.exempted, ...p.exempted, ...l.exempted],
    invalid, stale,
  }
}