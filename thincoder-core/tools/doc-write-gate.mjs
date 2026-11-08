/**
 * tools/doc-write-gate.mjs — 写前文档机检门（写盘面 · 条目 Z——本批新增门体）。
 *
 * 权威规格 = `docs/core/design/DOC-DISCIPLINE.md` §3.26 条目 Z（判面四步 / 扩区表 / 判法 / 报面 / 入参缝）
 * 与 §5 `A-DD40`；需求 = `docs/core/requirements/DOC-CHECK.md` F14 ∥ AC-12。本档只实现，不重述口径（D2）。
 *
 * 一句话：文档面 `.md` 的每一笔内容写，在**落盘之前**判「本笔触碰到的那个段落」——命中即 throw、零字节。
 * 挂点唯一 = `./write-path.mjs` 的 `writeThroughPath`（`op === "write"`，含 `apply_patch` 的 stage 段）。
 *
 * 判法四步（§3.26「判面取法」逐条对应）：
 *   ① 新建（目标档不在盘）⇒ 判面 = 整份新内容；
 *   ② 与盘上旧内容逐字相同 ⇒ 判面为空 ⇒ 零判、**不建片段档**；
 *   ③ 其余（既有档，含 `write` 整档重写）⇒ 盘上旧档与本次新内容逐行剥公共前 / 后缀得改动区（行号按改后档计），
 *      再按扩区表扩成片段区：段落整段 ∥ 只动空行（纯删行）时加上紧邻两侧的段落 ∥ 围栏整块（含标记行）；
 *   ④ 每区落**目标档同目录**的 `.docgate-*` 隐藏片段档 ⇒ `runDocCheck(root, {mode:"gate"})` ⇒ 命中即 throw，
 *      `finally` 删片段档。
 *
 * 为什么同目录：锚解析序 ② 是「引用方档所在目录相对」——片段住目标档旁边，判法与落盘后**同源**，
 * 否则同一行指针在片段里判成 `档缺`、落盘后却解析得到（判据自己造出假阳）。
 *
 * 为什么围栏块连标记行一起抄：块内代码行裸抄进片段就成正文，引擎按段长判它（现盘即假阳）——整块入判
 * 才是「读者看到的那一块」。（实测：整块含标记 ⇒ 块内 320 字代码行零命中；裸抄单行 ⇒ 1 条段命中。）
 *
 * 判据本体零副本（D2）：锚 ∥ 段两条判据与报面字面全部来自 `../doc-check/index.mjs` 的导出
 * （`runDocCheck` / `DOC_CLASS` / `PARA_DISPOSE`）；本档只装配判面、拒串骨架与片段档。
 *
 * **本门不计行号坐标那一类**（用户 2026-11-05 16:05「写门可以不挡，但是 doc_check 的时候你还是躲不过」）：
 * 拒写判定读 `hits.anchors + hits.paragraph`，**不读 `hits.total`**——交付门（`doc_check` 的 `gate` 面）才是三判据全计的地方。
 * 两个消费面读同一份 `hits`，各自取用的类不同：写门只看引用完整性 ∥ 段长，行号坐标归交付门。
 * 它也不入拒文：若不计入就不该列，否则写者拿到的是一行自己改不动的命中。
 *
 * 不判面（边界，§3.26 同款）：不判「该不该有这段」；不判依据对不对；不做写入前美化 ∥ 自动重排；
 * 不缓存 manifest 读数；不改判据本体（阈值与两支判据零改）。
 */
import { readFileSync, statSync, unlinkSync, writeFileSync } from "node:fs"
import { dirname, join, parse, relative, resolve } from "node:path"

import { owningProject } from "../manifest.mjs"
import { DOC_CLASS, PARA_DISPOSE, runDocCheck } from "../doc-check/index.mjs"
import { fenceMark, headingMark, isFenceClose, isListItem, isQuoteLine, isTableRow } from "../doc-check/paragraph.mjs"
import { faceDetail } from "../agent/write-face.mjs"

/** 片段档前缀：与批档门（`agent-tools/batch-gate.mjs` 的 `.gate-`）分开——两门各清各的残留，互不误报。 */
export const DOCGATE_PREFIX = ".docgate-"

/** 显示形（正斜杠——跨平台同形，与引擎报面一致）。 */
const relDisplay = (root, abs) => relative(root, abs).replace(/\\/g, "/")

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
 *  **导出面**（本批）：`thincoder-core/agent-tools/batch-gate.mjs` 的触达账腿要按同一张扩区表判改动区——
 *  两门判的是同一件事，各写一张表必然漂移（D2 单源）。行为零改。 */
export function paragraphRuns(lines) {
  const runs = []
  let cur = null
  lines.forEach((l, i) => {
    if (!isBodyLine(l)) {
      if (cur) runs.push(cur)
      cur = null
      return
    }
    if (cur) cur.end = i + 1
    else cur = { start: i + 1, end: i + 1 }
  })
  if (cur) runs.push(cur)
  return runs
}

/** 围栏块区间表（开启标记行 → 闭合标记行；未闭合 ⇒ 到档尾）。导出面同 `paragraphRuns`（行为零改）。 */
export function fenceBlocks(lines) {
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
      blocks.push({ start, end: i + 1 })
      fence = null
    }
  })
  if (fence !== null) blocks.push({ start, end: lines.length })
  return blocks
}

/**
 * 改动区（行号按改后档计）：逐行剥公共前 / 后缀，剩下一段连续区间。
 * `start > end` ⇒ 宽度为零（纯删行——删掉的那些行在改后档里没有行号）。
 */
function changeRegion(oldLines, newLines) {
  const min = Math.min(oldLines.length, newLines.length)
  let head = 0
  while (head < min && oldLines[head] === newLines[head]) head++
  let tail = 0
  while (tail < min - head && oldLines[oldLines.length - 1 - tail] === newLines[newLines.length - 1 - tail]) tail++
  return { start: head + 1, end: newLines.length - tail }
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

/**
 * 片段区（扩区表三行逐条落）：
 *   · 与段落相交 ⇒ 该段整段；
 *   · 改动区只含空行 ∥ 宽度为零 ⇒ 加上紧邻两侧的段落（一段拆两段 ⇒ 两段；两段并一段 ⇒ 并出来的那一段，
 *     因为那两行在改后档里本就是**同一段**，区间取法自然重合）；
 *   · 与围栏块相交 ⇒ 该块从开启标记行到闭合标记行；
 *   · 改动区自身一律入判（表行 ∥ 标题行 ∥ 代码行也在本笔之内——「自己写的那部分」不是只指正文段）。
 */
export function fragmentZones(lines, region) {
  const { start, end } = region
  const paras = paragraphRuns(lines)
  const fences = fenceBlocks(lines)
  const onlyBlank = start > end || lines.slice(start - 1, end).every((l) => String(l).trim() === "")
  if (onlyBlank) {
    const around = (n) => paras.find((r) => r.start <= n && n <= r.end)
    const picked = []
    for (const run of [around(start - 1), around(end + 1)]) if (run && !picked.includes(run)) picked.push(run)
    return mergeZones(picked)
  }
  const picked = [{ start, end }]
  for (const r of paras) if (r.start <= end && start <= r.end) picked.push(r)
  for (const b of fences) if (b.start <= end && start <= b.end) picked.push(b)
  return mergeZones(picked)
}

/** 落片段档（目标档同目录 · 隐藏档 · 每次一随机名：并发两笔不撞名、不互删）。 */
function writeFragment(target, lines, zone, n) {
  const fragAbs = join(dirname(target), `${DOCGATE_PREFIX}${process.pid}-${Math.random().toString(36).slice(2, 10)}-${n}.md`)
  const body = lines.slice(zone.start - 1, zone.end).join("\n")
  writeFileSync(fragAbs, body.endsWith("\n") ? body : `${body}\n`)
  return fragAbs
}

/**
 * 拒串（throw 载荷）：首行照抄引擎 verdict 词（字面单源 = `../doc-check/index.mjs`），随后命中行（已翻译回
 * **目标档**坐标）、判面行（固定串，`A-DD40` ⑨ 判它）、零字节句、处置块（只跟段命中走；字面单源 = `PARA_DISPOSE`）。
 * 命中行回目标是**写者能用**的坐标：片段档名是门的内部实现，写者据「目标档段首行」直接落回自己的档。
 * 命中行与引擎报面行的对位按 `片段档相对路径:行号` **查表**，不按次序——次序一漂（引擎增一类只入报面不入命中集的行）
 * 就会把 A 的报面行贴到 B 的命中上，而那是一个静默的错坐标。
 */
function refusalMessage({ res, zones, frags, target, root, regionCount }) {
  const targetRel = relDisplay(root, target)
  const first = res.report.split("\n")[0]
  const engineLines = res.report.split("\n").filter((l) => l.startsWith("✗ "))
  const hits = [...res.anchorHits, ...res.paragraphHits]
  const zoneOf = (fragAbs) => frags.find((f) => f.abs === fragAbs)?.zone ?? null
  const shown = hits.map((h) => {
    // 仓级命中（`环引`）没有行号——拿引擎那一行的原文（按链对位，链每条唯一）；换坐标会把 `null` 写进写者眼前。
    if (h.clazz === "环引") {
      return engineLines.find((l) => l.includes("锚·环引") && l.includes(h.chain)) ?? `✗ 锚·环引 ${h.chain}`
    }
    const zone = zoneOf(h.file)
    const at = zone ? zone.start + h.line - 1 : h.line
    const fragRel = relDisplay(root, h.file)
    const mark = `${fragRel}:${h.line}`
    const source = engineLines.find((l) => l.includes(mark))
    // 引擎未产该行（理论不可达）⇒ 自造行但保留类名，宁可少一句上下文也不静默丢一条命中
    return source ? source.split(mark).join(`${targetRel}:${at}`) : `✗ ${h.clazz} ${targetRel}:${at}`
  })
  const faces = zones.map((z) => `判面：改动区 ${regionCount} 区 · 片段区 ${zones.length} 区 · 目标档段首行 ${z.start}`)
  const dispose = res.paragraphHits.some((h) => h.clazz === DOC_CLASS.para)
  const out = [first, ...shown, ...faces, "本次写入未落盘——目标档字节逐字不变（零字节）。"]
  if (dispose) out.push("", ...PARA_DISPOSE)
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
 * @returns {{judged:boolean, zones:number, hits:number}} 判面空 ⇒ `judged:false`（零判、零片段档）；
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
  const regionCount = 1 // M ≡ 1：剥公共前 / 后缀恒得一段连续改动区（判面行的 M 不是算出来的数，是结构保的）
  const zones = old === null ? [{ start: 1, end: newLines.length }] : fragmentZones(newLines, changeRegion(old.split("\n"), newLines))
  if (zones.length === 0) return { judged: false, zones: 0, hits: 0 } // 纯删行且两侧无段 ⇒ 判面为空

  const frags = []
  try {
    zones.forEach((zone, i) => frags.push({ zone, abs: writeFragment(target, newLines, zone, i + 1) }))
    const res = runDocCheck(projectRoot, { mode: "gate", docs: frags.map((f) => f.abs) })
    // 判集被**排除面**吃空（`index.docCheckExcludePaths` 命中本笔的片段档——片段住目标档同目录）⇒
    // 本次**一个档都没判**。「没判」不得报成「判干净了」：`judged: true, hits: 0` 的意思是「我判过了，
    // 它是干净的」，而事实是零档入判——与设计 §2.6「被排除与干净不得同形」是同一条，只是换了个面。
    if (res.checkFiles.length === 0) return { judged: false, zones: 0, hits: 0 }
    // 拒写判定只取锚 + 段两类的和（**不读 `hits.total`**）：`hits.total` 含行号坐标那一类，
    // 拿它当拒写输入 = 写门开始拒行号——那是交付门的活，用户明说写门可以不挡。
    if (res.hits.anchors + res.hits.paragraph === 0) return { judged: true, zones: zones.length, hits: 0 }
    throw new Error(refusalMessage({ res, zones, frags, target, root: projectRoot, regionCount }))
  } finally {
    // 清理失败不覆盖判定结果（残留由下一次门在回执里明示的口径属批档门；本门只保证「不因清理失败改判」）。
    for (const f of frags) {
      try {
        unlinkSync(f.abs)
      } catch {
        /* 片段档已被删 ∥ 不可删 —— 判定结果不变 */
      }
    }
  }
}