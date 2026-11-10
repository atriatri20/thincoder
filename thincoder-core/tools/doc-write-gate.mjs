/**
 * tools/doc-write-gate.mjs — 写前文档机检门（写盘面 · 条目 Z——本批新增门体）。
 *
 * 权威规格 = `docs/core/design/DOC-DISCIPLINE.md` §3.26 条目 Z（判面四步 / 扩区表 / 判法 / 报面 / 入参缝）
 * 与 §5 `A-DD40`；需求 = `docs/core/requirements/DOC-CHECK.md` F14 ∥ AC-12。机制单源 = `docs/core/design/DOC-CHECK.md`
 * §2.10（一个判定、三处调用、两个入参）——本档只实现，不重述口径（D2）。
 *
 * 一句话：文档面 `.md` 的每一笔内容写，在**落盘之前**判「本笔触碰到的那些段落」——命中即 throw、零字节。
 * 挂点唯一 = `./write-path.mjs` 的 `writeThroughPath`（`op === "write"`，含 `apply_patch` 的 stage 段）。
 *
 * 判法四步（§3.26「判面取法」逐条对应）：
 *   ① 新建（目标档不在盘）⇒ 判面 = 整份新内容；
 *   ② 与盘上旧内容逐字相同 ⇒ 判面为空 ⇒ 零判；
 *   ③ 其余（既有档，含 `write` 整档重写）⇒ 盘上旧档与本次新内容剥公共前 / 后缀，中段再剥内部公共段得**区间表**
 *      （各 hunk，行号按改后档计）；各 hunk 两侧各取 2 行上下文、相邻者并区，再按扩区表扩成**判定区**；
 *   ④ **不切片**——把「改后整份内容」与「判定区」两个入参交引擎（`runDocCheck` 的 `texts` ∥ `zones`），
 *      判定区只决定哪些命中归本笔。身份 = 目标档：
 *      每条命中的 `file` / `root` / 豁免识别键 / 报面坐标全部是目标档的，没有临时档要译回来。
 *
 * 为什么判据本体零副本（D2）：锚 ∥ 段两条判据、报面字面与存量读数句全部来自 `../doc-check/index.mjs` 的导出
 * （`runDocCheck` / `DOC_CLASS` / `PARA_DISPOSE` / `STOCK_LINE`）；本档只装配判面与拒串骨架。
 *
 * **本门不计行号坐标那一类**（用户 2026-11-05 16:05「写门可以不挡，但是 doc_check 的时候你还是躲不过」）：
 * 拒写判定读 `hits.anchors + hits.paragraph`，**不读 `hits.total`**——交付门（`doc_check` 的 `gate` 面）才是三判据全计的地方。
 * 两个消费面读同一份 `hits`，各自取用的类不同：写门只看引用完整性 ∥ 段长，行号坐标归交付门。
 * 它也不入拒文：若不计入就不该列，否则写者拿到的是一行自己改不动的命中。
 *
 * 不判面（边界，§3.26 同款）：不判「该不该有这段」；不判依据对不对；不做写入前美化 ∥ 自动重排；
 * 不缓存 manifest 读数；不改判据本体（阈值与两支判据零改）。
 */
import { readFileSync, statSync } from "node:fs"
import { parse, resolve } from "node:path"

import { owningProject } from "../manifest.mjs"
import { DOC_CLASS, PARA_DISPOSE, STOCK_LINE, runDocCheck } from "../doc-check/index.mjs"
import { fenceMark, headingMark, isFenceClose, isListItem, isQuoteLine, isTableRow } from "../doc-check/paragraph.mjs"
import { faceDetail } from "../agent/write-face.mjs"

/** 正文行谓词（「什么叫一段」的边界——谓词族 **只借不立**，单源 = `../doc-check/paragraph.mjs`）。 */
const isBodyLine = (l) => {
  const line = String(l)
  return (
    line.trim() !== "" &&
    !isTableRow(line) &&
    !isListItem(line) &&
    !isQuoteLine(line) &&
    fenceMark(line) === null &&
    headingMark(line) === null
  )
}

/** 段落区间表（1-based 闭区间；非正文行断段——与引擎的段合并口径同源）。
 *  **导出面**：扩区表本体（本档的 `judgeZones`）与批档门的纯删映射按同一张表判「一段」。
 *  扫描带围栏状态，块内正文形行不自成段。 */
export function paragraphRuns(lines) {
  const runs = []
  let cur = null
  let fence = null
  const flush = () => {
    if (cur) runs.push(cur)
    cur = null
  }
  lines.forEach((l, i) => {
    const mark = fenceMark(l)
    if (mark !== null) {
      flush()
      if (fence === null) fence = mark
      else if (isFenceClose(mark, fence)) fence = null
      return
    }
    if (fence !== null || !isBodyLine(l)) {
      flush()
      return
    }
    if (cur) cur.end = i + 1
    else cur = { start: i + 1, end: i + 1 }
  })
  flush()
  return runs
}

/** 相邻 ∥ 重叠的区并成一个（并后判一次，读者看到的本就是连着一整块）。导出面同 `paragraphRuns`（行为零改）。 */
export function mergeZones(zones) {
  const out = []
  for (const z of [...zones].sort((a, b) => a.start - b.start || a.end - b.end)) {
    const last = out[out.length - 1]
    if (last && z.start <= last.end + 1) last.end = Math.max(last.end, z.end)
    else out.push({ start: z.start, end: z.end })
  }
  return out
}

/** 上下文行数（§2.10.4「上下文两行在 hunk 之上加」）：一笔插入若落在两段之间，邻接段的**段落长度**可能因这一笔变，
 *  两行是判定「这笔有没有把邻段推过线」的最小窗口。方向从严（多认两条存量），不制造新的放宽面。 */
const CONTEXT_LINES = 2

/** 行级最长公共子序列的匹配对（DP，返回 `[旧中段下标, 新中段下标]` 列表，升序）。
 *  **超上限 ⇒ `null`**：调用方退回「中段一区」（= 改前的首末包络）。方向保守（多认存量、不少报本次），
 *  代价如实写在 `changeRegions` 的头注里。上限 4M 格：本门只跑人写文档，几十万格是常态。 */
const LCS_CELL_CAP = 4_000_000
function lcsPairs(a, b) {
  const n = a.length
  const m = b.length
  if (n === 0 || m === 0) return []
  if (n * m > LCS_CELL_CAP) return null
  const w = m + 1
  const dp = new Uint32Array((n + 1) * w)
  for (let i = n - 1; i >= 0; i--) {
    const row = i * w
    const next = row + w
    for (let j = m - 1; j >= 0; j--) {
      dp[row + j] = a[i] === b[j] ? dp[next + j + 1] + 1 : Math.max(dp[next + j], dp[row + j + 1])
    }
  }
  const pairs = []
  let i = 0
  let j = 0
  while (i < n && j < m) {
    if (a[i] === b[j]) {
      pairs.push([i, j])
      i++
      j++
    } else if (dp[i * w + w + j] >= dp[i * w + j + 1]) i++
    else j++
  }
  return pairs
}

/**
 * 改动区（**hunk 并集，不是首末包络** · 判据句单源 = `docs/core/design/DOC-CHECK.md` §2.10.4）：
 * 剥公共前 / 后缀之后，对剩下的中段再剥**内部公共段**——逐段找出改后文本与旧文本相同的极大行段，
 * 它们把中段切成若干 hunk。行号按**改后档**计（1-based 闭区间）；宽度为零的 hunk（纯删行）保留为定位点（`start > end`）。
 *
 * **为什么不能再返一段连续区间**：一份档改 20 处、每处都干净，只要首末两处之间夹着一处存量锚，整笔就死——
 * 而调用方手里本来就有每处替换的确切行区间。首末包络是「判什么区间」被写成「从第一处到最后一处」的那一形。
 *
 * **超上限时退回包络**（`lcsPairs` 返 `null`）：那是一份档被整篇重写的极端形，退回去只会**多认**存量、
 * 不会少报本次（阻断集只增不减），所以它是保守的一侧，不是放宽。
 */
function changeRegions(oldLines, newLines) {
  const min = Math.min(oldLines.length, newLines.length)
  let head = 0
  while (head < min && oldLines[head] === newLines[head]) head++
  let tail = 0
  while (tail < min - head && oldLines[oldLines.length - 1 - tail] === newLines[newLines.length - 1 - tail]) tail++
  const oldMid = oldLines.slice(head, oldLines.length - tail)
  const newMid = newLines.slice(head, newLines.length - tail)
  const regions = []
  // newMid 的 [from, to) 半开区间 → 改后档 1-based 闭区间（`from === to` ⇒ 零宽定位点）
  const push = (from, to) => regions.push({ start: head + from + 1, end: head + to })
  const pairs = lcsPairs(oldMid, newMid)
  if (pairs === null) {
    if (newMid.length > 0 || oldMid.length > 0) push(0, newMid.length)
    return regions
  }
  let oldAt = 0
  let newAt = 0
  for (const [pi, pj] of pairs) {
    if (pi > oldAt || pj > newAt) push(newAt, pj)
    oldAt = pi + 1
    newAt = pj + 1
  }
  if (oldAt < oldMid.length || newAt < newMid.length) push(newAt, newMid.length)
  return regions
}

/** 各 hunk 两侧各取 `CONTEXT_LINES` 行（再并区的活交给 `judgeZones`）。 */
function withContext(regions, lineCount) {
  return regions.map(({ start, end }) => ({
    start: Math.max(1, start - CONTEXT_LINES),
    end: Math.min(lineCount, end + CONTEXT_LINES),
  }))
}

/**
 * 扩区表本体（三行逐条落 · 口径单源 = `docs/core/design/DOC-DISCIPLINE.md` §3.26 的扩区三式表）：
 *   · 与段落相交 ⇒ 该段整段（段首行 → 段末行）；
 *   · 区间只含空行 ∥ 宽度为零（纯删行）⇒ 加上紧邻两侧的段落（一段拆两段 ⇒ 两段；两段并一段 ⇒ 并出来的那一段）；
 *   · 与围栏块相交 ⇒ 该块从开启标记行到闭合标记行；未闭合 ⇒ 至档尾。
 *  **入参是区间表，不是单区间**（§2.10.4）：一笔写入可能有多处替换，逐处各自扩、扩完再并区。
 *  `regions` = `{start,end}` 的数组（1-based 闭区间；`start > end` = 宽度为零）。
 *
 * 围栏那一式为什么还要块边界：**围栏状态由整份文本决定**之后，块内命中本就一条也不会产生（三条判据整块跳过），
 * 所以这一式在今天只在一个方向上起作用——改的是未闭合块里的行时，块尾之后的正文也会被这一笔连带重判。
 * 少了它，那一截新变成正文的行上的段长命中会落进存量读数而不阻断。方向从严，故留着。
 *
 * 并区之后**不再对围栏块做二次对齐**：对齐的原理由是「片段不能起于块内」（片段档时代的装配前提），
 * 判整份文本后区起于块内是合法的（作者就在块里改了一行），前提消失（§2.10.2）。
 * **「宽度为零」两支的射程如实写**：调用方若先给区间加了上下文（写前门的 ±2 行），`start > end` 已经被抬成
 * `start-2 … end+2`，下面那两个子条件就只剩「含空行」一形在生效——两支的真射程是**不加上下文的那一面**
 * （收口的 diff 区间表）；写前门那条路靠 ±2 行自己盖住邻行。
 *
 * @returns {{start:number,end:number}[]} 并区后的判定区（升序、互不相邻）
 */
export function judgeZones(lines, regions) {
  const paras = paragraphRuns(lines)
  const fences = fenceSpans(lines)
  const picked = []
  for (const region of regions) {
    const { start, end } = region
    const onlyBlank = start > end || lines.slice(start - 1, end).every((l) => String(l).trim() === "")
    if (onlyBlank) {
      const around = (n) => paras.find((r) => r.start <= n && n <= r.end)
      for (const run of [around(start - 1), around(end + 1)]) if (run && !picked.includes(run)) picked.push(run)
      for (const b of fences) {
        const intersects = b.start <= end && start <= b.end
        const deletesUnclosedTail = start > end && start === b.end + 1 && b.closed === false
        if (intersects || deletesUnclosedTail) picked.push(b)
      }
      // 零宽定位点自身不产生命中（没有行号可落），但它的邻段已按上一行扩进来——不另记一格。
      continue
    }
    picked.push({ start, end })
    for (const r of paras) if (r.start <= end && start <= r.end) picked.push(r)
    for (const b of fences) if (b.start <= end && start <= b.end) picked.push(b)
  }
  return mergeZones(picked)
}

/** 围栏块区间（开启标记行 → 闭合标记行；未闭合 ⇒ 到档尾）——`judgeZones` 的扩区第三式用。
 *  它与「片段档时代的围栏块区间表」不是一件事：那张表是导出面、喂围栏对齐；这里只回答扩区要问的
 *  「这个区落在哪个块里」，没有任何消费者在切片。 */
function fenceSpans(lines) {
  const blocks = []
  let fence = null
  let start = 0
  lines.forEach((l, i) => {
    const mark = fenceMark(l)
    if (mark === null) return
    if (fence === null) {
      fence = mark
      start = i + 1
      return
    }
    if (isFenceClose(mark, fence)) {
      blocks.push({ start, end: i + 1, closed: true })
      fence = null
    }
  })
  if (fence !== null) blocks.push({ start, end: lines.length, closed: false })
  return blocks
}

/**
 * 拒串（throw 载荷）：首行照抄引擎 verdict 词（字面单源 = `../doc-check/index.mjs`），随后命中行、判面行（固定串，
 * `A-DD40` ⑨ 判它）、区外存量读数行、零字节句、处置块（只跟段命中走；字面单源 = `PARA_DISPOSE`）。
 * 命中行直接用引擎那一行：身份 = 目标档 ⇒ 坐标本就是目标档行号，没有片段档要译回来（§2.10.2）。
 * 判面行 `判面：改动区 M 区 · 判定区 N 区`——M = 本笔 hunk 数、N = 扩区并区后的判定区数，两个都是按本笔实算的读数。
 */
function refusalMessage({ res, regionCount, zoneCount }) {
  const lines = res.report.split("\n")
  const first = lines[0]
  const shown = lines.filter((l) => l.startsWith("✗ "))
  const out = [first, ...shown, `判面：改动区 ${regionCount} 区 · 判定区 ${zoneCount} 区`]
  // 区外命中只出读数（不属本笔），与引擎门面同一句形（字面单源 = 引擎的 `STOCK_LINE`）：不阻断，但不能看不见。
  if (res.stockHits.length) out.push(STOCK_LINE(res.stockHits.length))
  out.push("本次写入未落盘——目标档字节逐字不变（零字节）。")
  if (res.paragraphHits.some((h) => h.clazz === DOC_CLASS.para)) out.push("", ...PARA_DISPOSE)
  return out.join("\n")
}

/**
 * 写前门（挂点唯一的入口）。
 *
 * @param {{abs:string, content:string, root?:string}} o
 *   `abs` = 目标绝对路径（挂点传的是 `writeThroughPath` 的 `abs`）；
 *   `content` = **改后整份内容**（`file.mjs` ∥ `edit-diff.mjs` ∥ `edit-batch.mjs` ∥ `patch.mjs` 实读同形 ⇒
 *   门不必自己合并改动）；`root` = 文档机检的解析基准，**显式参数**，缺省回落 =
 *   `owningProject(abs, <目标所在盘根>)`（与批档门取项目根同源，不另立项目根发现逻辑）。
 *   界的取法 = 文档化的「取根面」：**目标本身**决定它归哪个项目，与面判定（`faceDetail` 上溯无界）同界；
 *   拿会话 cwd 当界会把「写项目外的档」静默变成零判——同一个目标面判成 `doc-root`、根却取不到 = 门自己
 *   把自己关掉，而这跳过的样子和「不该判」一模一样。
 * @returns {{judged:boolean, zones:number, hits:number}} 判面空 ⇒ `judged:false`（零判）；
 *   判集被 manifest 排除面吃空 ⇒ 也 `judged:false`（**零档入判，不得读作判过**）；
 *   放行 ⇒ `hits:0`。命中 ⇒ **throw**（拒串见 `refusalMessage`），目标档字节不变。
 */
export async function runDocWriteGate({ abs, content, root } = {}) {
  const target = resolve(String(abs ?? ""))
  if (typeof content !== "string") return { judged: false, zones: 0, hits: 0 }
  // 面窄化：只判文档面的 `.md`（产品面 ∥ 出辖 ⇒ 零判；面判定单源 = `agent/write-face.mjs`）。
  if (!target.toLowerCase().endsWith(".md")) return { judged: false, zones: 0, hits: 0 }
  const projectRoot = root ? resolve(root) : owningProject(target, parse(target).root)
  if (!projectRoot) return { judged: false, zones: 0, hits: 0 }
  if (faceDetail(target).reason !== "doc-root") return { judged: false, zones: 0, hits: 0 }

  // ① ∥ ③ 的分界是「档在不在盘」，不是 op：既有档整档重写与 edit 同判（本笔写了哪些字由前后缀剥出）。
  let old = null
  try {
    if (statSync(target).isFile()) old = readFileSync(target, "utf8")
  } catch {
    old = null // 读不到（含不在盘）⇒ 按新建判：判面 = 整份新内容（更严的一侧，不静默放行）
  }
  if (old !== null && old === content) return { judged: false, zones: 0, hits: 0 } // ② 判面为空
  const newLines = content.split("\n")
  const regions = old === null ? [{ start: 1, end: newLines.length }] : changeRegions(old.split("\n"), newLines)
  const zones = regions.length === 0 ? [] : judgeZones(newLines, withContext(regions, newLines.length))
  if (zones.length === 0) return { judged: false, zones: 0, hits: 0 } // 纯删行且两侧无段 ⇒ 判面为空

  const res = runDocCheck(projectRoot, {
    mode: "gate",
    docs: [target],
    texts: new Map([[target, content]]),
    zones: new Map([[target, zones]]),
  })
  // 判集被**排除面**吃空（`index.docCheckExcludePaths` 命中目标档）⇒ 本次**一个档都没判**。
  // 「没判」不得报成「判干净了」：`judged: true, hits: 0` 的意思是「我判过了，它是干净的」，
  // 而事实是零档入判——与设计 §2.6「被排除与干净不得同形」是同一条，只是换了个面。
  if (res.checkFiles.length === 0) return { judged: false, zones: 0, hits: 0 }
  // 拒写判定只取锚 + 段两类的和（**不读 `hits.total`**）：`hits.total` 含行号坐标那一类，
  // 拿它当拒写输入 = 写门开始拒行号——那是交付门的活，用户明说写门可以不挡。
  if (res.hits.anchors + res.hits.paragraph === 0) return { judged: true, zones: zones.length, hits: 0 }
  throw new Error(refusalMessage({ res, regionCount: regions.length, zoneCount: zones.length }))
}
