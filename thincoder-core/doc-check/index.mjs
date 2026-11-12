/**
 * doc-check/index.mjs — 文档机检引擎：判三件事，出一份回执。
 *
 * 判据句单源 = `docs/core/design/DOC-CHECK.md`：① 一段太长（`./paragraph.mjs`）∥ ② 拿行号做锚（`./line-refs.mjs`）
 * ∥ ③ 悬空指针（`./existence.mjs`）。**这三件之外不判**——节号、引文、行数、跨仓都不在射程（§1 ∥ §4）。
 * 面别只决定判据 ③：批档面（`docRoot.batches` 之下的档）整份不判悬空（§3）——它的读者不照着 §1–§6 去找档。
 *
 * 判域 = 交给门的那几档里的**本批变更区**（§6）：收口那一刻区内照判三件、区外一个字都不出；判整份的只有
 * 诊断面（`doc_check` 的 `report` mode）与写时点（写门交 `null`）。区间由调用方算好交进来——引擎不读 git。
 *
 * 报面（§5）：首行是机器判的，后面每行一句人话；没有命中 ⇒ `PASS` 一行，不再添任何一行。
 * 两个调用点共用这套句子，差别只在拿不拿它挡这一笔写：写盘前 / 批档写入与收口 / `doc_check` 工具面。
 *
 * **判域带时点**（§9）：批档只在「写」的那一刻判。写时点 = `batch` 的 `append` ∥ `edit`，加 `.md` 落盘前那道门；
 * 收口时点 = `batch close`，加 `doc_check` 工具面。判域谓词 = 本档的 `judgedDomainDocs`（**一条，三面共用**）：
 * 写时点原样交回，收口时点把批档面整份移出判域。判据本体 `judgeText` 不带时点——它对批档面的悬空豁免
 * 正是**写时点**那条规则，两件事各有自己的单源。
 *
 * **判域上挂着两道滤**（「哪些档进来」的加减只在本档这一处发生）：第一道认批档面（§9，按**时点**），
 * 第二道认**排除面**（§10，两个时点都认）——项目在 manifest 的 `index.docCheckExcludePaths` 里声明的
 * 路径前缀之下，档一律不进判域。判据仍是三件，排除面只决定「哪些档进来」。
 *
 * 「没判」照实说：不在盘、读不到的那几档各出一行，不当命中也不当干净——删掉它，一个什么都没判的 `PASS`
 * 会被读成「都判过了、都干净」，那是假绿。
 */
import { existsSync, readFileSync } from "node:fs"
import { join, relative, resolve } from "node:path"

import { readManifest } from "../manifest.mjs"
import { normalizePathList } from "../declaration.mjs" // 归一的同一把尺（与 `index.excludePaths` 同款）
import { PARAGRAPH_MAX, isPromptFace, paragraphHits } from "./paragraph.mjs"
import { lineRefHits } from "./line-refs.mjs"
import { existenceHits, isBatchFace, pathIndexOf, plannedPathsOf } from "./existence.mjs"

/** 命中的类名（报面句子按类各一句；消费面按类取用时也认这三个字面）。 */
export const HIT_KIND = Object.freeze({ missing: "missing", paragraph: "paragraph", lineRef: "lineRef" })

/** 时点两值（闭集）：`writer` = 手上正在写的那段文本 ∥ `close` = 已在盘的记录（§9 那张表）。
 *  字面与 `runBatchGate` 的 `scope` 同一对——一件事一个名字，不另起一套词。 */
export const MOMENT = Object.freeze({ writer: "writer", close: "close" })

/** 项目根：沿这份档往上最近的带 `PROJECT-MANIFEST.json` 的目录；找不到 ⇒ 调用方给的基根。 */
function projectRootOf(abs, fallback) {
  let dir = resolve(abs, "..")
  for (;;) {
    if (existsSync(join(dir, "PROJECT-MANIFEST.json"))) return dir
    const up = resolve(dir, "..")
    if (up === dir) return fallback
    dir = up
  }
}

/** 相对路径显示形（正斜杠；仓外照原值——不猜）。 */
export function displayPath(root, abs) {
  const r = relative(root, resolve(abs)).replace(/\\/g, "/")
  return r === "" || r.startsWith("../") ? resolve(abs).replace(/\\/g, "/") : r
}

/**
 * 该档所属项目声明的排除前缀（`index.docCheckExcludePaths`，归一 = `../declaration.mjs` 的 `normalizePathList`）。
 * **读不到 manifest ∥ 键写成非数组 ⇒ 空表 ⇒ 照判**（放行必须有声明，不替项目放行）：
 * `readManifest` 对盘上没有的 manifest 返 `{ ok: false, reason: "missing" }`，读数方拿到的默认值就是 schema 里那个空数组。
 * `memo` = 本次调用内按项目根记忆——一次判多档时同一根只读一次盘。
 */
function exclusionPrefixesOf(root, memo) {
  if (memo.has(root)) return memo.get(root)
  let prefixes = []
  try {
    const read = readManifest(root)
    if (read?.ok) prefixes = normalizePathList(read.manifest?.index?.docCheckExcludePaths)
  } catch { prefixes = [] } // 读面抛错也走「照判」那一侧：宁多判一份档，不替项目放行
  memo.set(root, prefixes)
  return prefixes
}

/** 该档是否落在排除面上：**项目根相对路径**恰好等于某前缀，或以「前缀 + `/`」起头。
 *  裸前缀不比——声明 `docs/_arch` 不吞 `docs/_archive-x` 之下的档（那不是声明的意思）。
 *  比对按**字面**取（与 `normalizePathList` 同一把尺，不折大小写）：声明写什么就比什么。
 *  大小写不敏感是 `batch-paths.mjs` 的 `baseContaining` 那一族的判据（它比的是盘上同一个根），不是这一条。 */
function isExcludedDoc(abs, root, memo) {
  const rel = relative(root, abs).replace(/\\/g, "/")
  return exclusionPrefixesOf(root, memo).some((p) => rel === p || rel.startsWith(`${p}/`))
}

/**
 * 判域谓词（**一条，三个调用面共用**）：批档面这道滤只在收口时点生效（写时点原样交回）；排除面那道两个时点都认。
 * 判据句单源 = `docs/core/design/DOC-CHECK.md` §9——写的那一刻量的是手上正在产生的文本，量得出缺陷；
 * 收口那一刻量的是几小时前的记录、现态已经变了，量得出的是时间差。
 *
 * 面别判据不新造：批档面 = `existence.mjs` 的 `isBatchFace`（与 §3 第二条例外同一个谓词）。
 * 时点按**谁在调**判，不按批档 §1 状态行判——状态行是记录自己的属性，时点是调用者的位置。
 *
 * **第二道滤 = 排除面**（§10）：按每份档自己的项目根读声明，两个时点都认——一个档要么在门里、要么不在，
 * 不按调用面分家。判据仍是三件，排除面只决定「哪些档进来」。
 *
 * @param {string[]} docs 候选档清单（绝对路径，或相对 `root` 的路径；交回的条目保持原形，不改写成绝对路径）：
 *   非数组一律抛——不许读成「空判域」，那会印出一个什么都没判过的 `PASS`
 * @param {{moment:'writer'|'close', root?:string}} o `moment` = 这一刻谁在调（**必填**：它决定批档判不判，
 *   缺省值等于替调用者决定一件事）；`root` = 项目根（`isBatchFace` 与排除面读声明的基准；缺省按每份档自己往上找）
 * @returns {string[]} 判域内的档（原顺序）
 */
export function judgedDomainDocs(docs, { moment, root } = {}) {
  if (!Array.isArray(docs)) {
    throw new Error(`doc_check: \`docs\` must be an array of paths (got ${typeof docs}) — a non-array is refused rather than read as an empty domain, which would print a PASS over nothing judged.`)
  }
  if (moment !== MOMENT.writer && moment !== MOMENT.close) {
    throw new Error(`doc_check: unknown moment ${JSON.stringify(moment)} — take "${MOMENT.writer}" (text still being written) or "${MOMENT.close}" (a record already on disk). Which moment it is decides whether batch records are judged, so it is never defaulted.`)
  }
  const base = typeof root === "string" && root.trim() !== "" ? resolve(root) : null
  const prefixesByRoot = new Map()
  return docs.filter((d) => {
    const abs = base === null ? resolve(String(d)) : resolve(base, String(d))
    const docRoot = projectRootOf(abs, base ?? resolve(abs, ".."))
    // 两道滤的顺序跟本节的说法走（先批档面、再排除面）；两条谓词互不相干，顺序不影响结果。
    if (moment === MOMENT.close && isBatchFace(abs, docRoot)) return false
    return !isExcludedDoc(abs, docRoot, prefixesByRoot)
  })
}

/**
 * 判一份文本的三件事（**判据的唯一入口**：读盘的、还没落盘的，都从这里过）。
 * @param {string} text 档全文
 * @param {{file:string, root:string, planned?:Set<string>, indexPath?:Set<string>|null,
 *   region:{rows:number[],gaps:number[]}|null}} o `file` = 绝对路径（报面坐标与命中身份的来源）；
 *   `root` = 项目根（判据 ③ 找一次的基准）；`planned` = 在途批档 §2 清单并集（判据 ③ 的「在建不报」）；
 *   `region` = 本批变更区（**必填，不收缺省值**）：`null` = 判整份，区间表 = 只判这几行——两件事由调用方明说。
 * @returns {{file:string, line:number|null, kind:string, token?:string, len?:number}[]}
 */
export function judgeText(text, { file, root, planned = new Set(), indexPath = null, region } = {}) {
  if (region === undefined) {
    throw new Error("doc_check: `region` must be given on every call — null (judge the whole document) or the changed-region entry for this document (judge only those lines). It is never defaulted: the default would decide the domain on the caller's behalf.")
  }
  const abs = resolve(file)
  const rows = region === null ? null : new Set(region.rows ?? [])
  // 行级判据（② ∥ ③）只认**变更行**；纯删的零宽区间在改后文本里没有可指的行 ⇒ 不产生命中（§6）。
  const inRegion = (line) => rows === null || rows.has(line)
  const hits = []
  for (const h of paragraphHits(text, { promptFace: isPromptFace(abs), region })) {
    hits.push({ file: abs, line: h.line, kind: HIT_KIND.paragraph, len: h.len })
  }
  for (const h of lineRefHits(text)) if (inRegion(h.line)) hits.push({ file: abs, line: h.line, kind: HIT_KIND.lineRef, token: h.token })
  // 批档面整份不判悬空（§3）：批档是可整份删掉的执行记录，不是导航——记录里出现一个不存在的档名
  // 是这一轮的**发现**，判它等于把发现本身拦在门外。**这条豁免本身就是写时点的规则**：写的那一刻
  // 段长 ∥ 行号锚对批档照旧生效；收口时点批档整份不进判域，那一半由 `judgedDomainDocs` 管（§9）。
  if (!isBatchFace(abs, root)) {
    for (const h of existenceHits(text, { root, planned, indexPath })) {
      if (inRegion(h.line)) hits.push({ file: abs, line: h.line, kind: HIT_KIND.missing, token: h.token })
    }
  }
  return hits
}

/**
 * 一条命中的人话（报面行形的单一出处：三个调用点都不拼字面）。
 * 字面 = `docs/core/design/DOC-CHECK.md` §5 的三句。
 */
export function hitLine(root, h) {
  const at = displayPath(root, h.file)
  if (h.kind === HIT_KIND.missing) return `${at} ${h.token} 这个档不存在`
  if (h.kind === HIT_KIND.paragraph) return `${at} 第 ${h.line} 段 ${h.len} 字，超过 ${PARAGRAPH_MAX}`
  return `${at} 第 ${h.line} 行的 ${h.token} 用行号做锚，行号会漂`
}

/**
 * 跑一次文档机检。
 * @param {string} root 基根（相对 `docs` 条目按它解析；某档不在任何项目内时也落它）
 * @param {{docs:string[], moment:'writer'|'close',
 *   regions:Map<string,{rows:number[],gaps:number[]}>|null}} o `docs` = 被判档清单（相对 `root` 或绝对）——**必填**：
 *   缺省 ∥ 非数组 ∥ 空清单 ⇒ 抛（什么都没有的清单一律不许读成「判过且干净」）。
 *   `moment` = 这一刻谁在调（**必填**，判法单源 = `judgedDomainDocs`）：收口时点落进批档面的那些档整份不进判域
 *   ⇒ 它们连「不在盘，未判」都不出一行（那一句留给判域内读不到的档）；调用方交进来的清单因此可能判完 0 档。
 *   `regions` = 本批变更区（**必填，不收缺省值**，判据句单源 = `docs/core/design/DOC-CHECK.md` §6）：
 *   `null` = 判整份（写时点 ∥ 诊断面）；表 = 只判表里那几行，键 = `resolve(<档>)`。
 *   **没有要判的行 ⇒ 这一档一行也不出**（不在表里 ∥ 表里没它的条目）：不点名、不解释，也不计入 `checkFiles`。
 * @returns {{report:string, verdict:'PASS'|'REFUSED', hits:Array, checkFiles:string[],
 *   missing:string[], unreadable:string[]}}
 *   `hits` = 三判据的命中（每条携 `file` ∥ `line` ∥ `kind`），`missing` ∥ `unreadable` = 没判成的档；
 *   `checkFiles` = **真判过的档**（判域外的档不在其中——回执与 `范围 N 档` 数的是同一件事）。
 */
export function runDocCheck(root, { docs, moment, regions } = {}) {
  const base = resolve(String(root ?? "."))
  if (regions === undefined) {
    throw new Error("doc_check: `regions` must be given on every call — null (judge each document whole: the diagnostic face and the writer) or the changed-region table keyed by `resolve(<doc>)` (judge only those lines). It is never defaulted: the default would decide the domain on the caller's behalf.")
  }
  if (!Array.isArray(docs)) {
    throw new Error(`doc_check: \`docs\` must be an array of paths (got ${typeof docs}) — a bare string is refused rather than read as a whole-domain request; pass ["<path>"].`)
  }
  if (docs.length === 0 || docs.some((d) => typeof d !== "string" || d.trim() === "")) {
    throw new Error("doc_check: `docs` names no document — pass the explicit list of documents to judge. There is no default range: nothing is scanned unless you name it.")
  }
  // 判域 = 交进来的清单 ∩ 这一刻要判的档（§9）。空清单的护栏在上面、按**交进来的**清单判：
  // 「一张清单都没给」与「给的都在判域外」是两件事——后者是这一批确实没有别的档可判。
  const domain = judgedDomainDocs(docs, { moment, root: base })
  const plannedByRoot = new Map()
  const plannedOf = (r) => {
    if (!plannedByRoot.has(r)) plannedByRoot.set(r, plannedPathsOf(r))
    return plannedByRoot.get(r)
  }
  const indexByRoot = new Map()
  const indexOf = (r) => {
    if (!indexByRoot.has(r)) indexByRoot.set(r, pathIndexOf(r))
    return indexByRoot.get(r)
  }
  const checkFiles = []
  const hits = []
  const missing = []
  const unreadable = []
  for (const d of domain) {
    const abs = resolve(base, d)
    // 本批变更区（§6）：表里没它的条目 ⇒ 这一档没有要判的行 ⇒ 一行也不出（不点名、不计数）。
    const region = regions === null ? null : regions.get(abs)
    if (regions !== null && region === undefined) continue
    let text
    try { text = readFileSync(abs, "utf8") } catch (e) {
      // 区间面、区内只有纯删的缝（`rows` 空）、且盘上真没了（ENOENT）= 这一档在建档之后被删掉整份
      // ⇒ 没有文本可判 ⇒ 一行也不出（§6）。两个条件缺一条就不是那个情形：还在地盘上却读不到，
      // 那一句「读不到，未判」仍然是留给它的（§9）。
      if (regions !== null && (region.rows ?? []).length === 0 && e?.code === "ENOENT") continue
      if (e?.code === "ENOENT") missing.push(abs)
      else unreadable.push(abs)
      continue
    }
    checkFiles.push(abs)
    const docRoot = projectRootOf(abs, base)
    hits.push(...judgeText(text, { file: abs, root: docRoot, planned: plannedOf(docRoot), indexPath: indexOf(docRoot), region }))
  }
  const out = [`DOC-CHECK GATE: ${hits.length ? "REFUSED" : "PASS"}`]
  for (const h of hits) out.push(hitLine(base, h))
  for (const p of missing) out.push(`${displayPath(base, p)} 不在盘，未判`)
  for (const p of unreadable) out.push(`${displayPath(base, p)} 读不到，未判`)
  return { report: out.join("\n"), verdict: hits.length ? "REFUSED" : "PASS", hits, checkFiles, missing, unreadable }
}
