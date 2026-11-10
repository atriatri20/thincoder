/**
 * agent-tools/batch-gate.mjs — 文档机检门（`batch` 工具两机械点的**单源门**）。
 *
 * 权威规格 = `docs/core/design/DOC-DISCIPLINE.md` §3.20「结构兜底」（判据 / 范围 / 适用面 /
 * ERROR 消费分野 / 门自身异常 / 不检面）——本档只实现，**不重述口径**（D2）。需求 = `DOC-CHECK.md` F9 / AC-7。
 *
 * 调用面（`scope` 语义 = 规范「调用面开关，无第三值」）：
 *   ① `batch.mjs` append——**全部 append 同挂**（§1–§6，含 depth-0 与评审写 §3）⇒ `scope: "writer"`；
 *      强制集 = 本次写入文本命中 ∪ 写者触达账**改动区**命中（判面单源 = `docs/core/design/DOC-DISCIPLINE.md`
 *      §3.20「触达账腿的判面 = 本次改动区」）；`REFUSED` ⇒ 调用面 throw；`ERROR` / 门自身异常 ⇒
 *      放行 + 回执明示（子代理无法重启会话，卡死写账 = 无账之笔；② 会拒收口 ⇒ 轮次不会被当成已通过）。
 *   ② `batch-lifecycle.mjs` close ∥ status 值余核「已收口」⇒ `scope: "close"`——范围 = 本批笔域集
 *      （父侧触达账 ∪ 本批提交 diff = `git diff --name-only <批起 sha> HEAD` 内的 `.md` ∪ 批档自身）；
 *      `REFUSED`（K ≥ 1）∥ `ERROR` ⇒ 调用面 throw（fail-closed）。
 *      **单集**：范围内不设第二集——工作树里范围外的档不入判、不入报面（用户 2026-10-25 裁定「只判指定文件」）。
 *
 * **批档自身恒在判域（两 scope 同）**，阻断集仍只跟本次改动走：
 *   · ① 面 `append` 的已落段命中只入回执；本次追加文与触达账改动区命中当场拒。
 *     `edit` 携改写后的整档视图：`texts` = 视图、`zones` = `newText` 所在区间经扩区表后的区 —— 命中行本就是批档本体坐标，
 *     区外命中只出存量读数（§2.10.1 ∥ §2.10.2）。
 *   · ② 面按批起 sha 求每档的本批改动区（`zones`），区内命中即 K；区外与纯删邻段的存量只出 `STOCK_LINE`。
 *     区未定则整档阻断。批档内强制命中逐条带 `§N（作者：<角色>）`，取不到作者就只出段号。
 *
 * 判据零变：本档不新增判据——只决定「判谁」与「何时强制」；判据与裁定串由产品引擎
 * `doc-check/index.mjs` 产出（判据源唯一）。
 *
 * **证据格 = 判据面的一列收窄（不是新判据）**：证据格里只失败存在性的 `档缺` 降为读数、不进强制集；
 * 口径单源 = `docs/core/design/BATCH-RECORD.md` §4.22——本档只实现「哪些命中阻写」，引擎的命中、分类与
 * verdict 一字不动。拒文四件的显示行同样照该节组装（引擎 `✗` 行齐四件的才直接用，其余按命中类补齐）。
 *
 * **触达账腿判改动区（① 面·单源 = 设计档 §3.20「触达账腿的判面 = 本次改动区」）**：写者本 run 写进
 * 那一档的那些字才进强制集，整档累积的存量债归收口面。改动区取自 git 基线（写工具不提交 ⇒ 本 run 的
 * 笔迹在工作树里），四态判定 = 先问「在不在 git 仓」、再问「该档在不在跟踪面」（问序反了就把「非 git 仓」
 * 那一态吃掉——仓里所有档都「不在跟踪面」，会被判成整档，而那正是本批要治的病）：
 *   · ① 在仓 ∧ 在跟踪面 ∧ 基线可解析 ⇒ `git diff -U0 <基线> -- <该档>` 的区间表，按扩区表扩成判定区；
 *   · ② 在仓 ∧ **不在**跟踪面 ⇒ 整档（未跟踪的 `.md` 只可能是本轮新建的档，整本即本轮的笔）；
 *   · ③ 在跟踪面 ∧ 基线不可解析 ∥ ④ 非 git 仓 ⇒ **未定**：本次零强制 + 回执明示（降级方向 = 不阻写）。
 * 区外命中只出一行 `STOCK_LINE`、不逐条列；收口面也按本批改动区阻断，区未定才整档判。
 *
 * 两条边界（设计与实测同口径）：
 * ① **`append` 本次写入文本的判法** = 落批档同目录的隐藏片段档（`.gate-<pid>-<rand>.md`）——锚解析序 ② 是
 *    「引用方档所在目录相对」，同目录 ⇒ 判法与批档本体逐字同源；一次 `runDocCheck` 判两档，按命中
 *    所在档切强制集 / 明示集，回执把片段档显示成「本次写入文本」。片段档 `finally` 删；同目录的
 *    `.gate-*` 残留**只明示、不代删**（并发进程的活片段是别人正在判的档）。
 *    **`edit` 不走这一形**：整档视图走 `texts`、替换区走 `zones`（§2.10.1）——身份是批档本体，不造临时档。
 * ② **提交 diff 腿的基 sha 只读批档 §1 的记入行**（`批起 sha = <sha>`——取行内首个 40 位十六进制串）；
 *    取不到（无该行 ∥ 形态不合 ∥ git 跑不出该 diff）⇒ 只认触达账 + 回执明示「基 sha 未定」（不静默）。
 */
import { readFileSync, readdirSync, unlinkSync, writeFileSync } from "node:fs"
import { dirname, join, relative, resolve } from "node:path"

import { owningProject, readManifest } from "../manifest.mjs"
import { runDocCheck, PARA_DISPOSE, DOC_CLASS, STOCK_LINE, CYCLE_READ_LINE } from "../doc-check/index.mjs"
// 扩区表单源（D2）：两门判的是同一件事（本笔触碰的那几段），各写一张表必然漂移 ⇒ 只调用、不复制。
import { committedDocs, FRAGMENT_PREFIX, fragmentPathOf, pureDeleteStockEntries, touchedRegions } from "./batch-regions.mjs"
// 扩区表本体与区间合并同住写前门（§3.26「扩区表的第二消费面」句）：本档只调用。
import { judgeZones } from "../tools/doc-write-gate.mjs"
export { FRAGMENT_PREFIX } from "./batch-regions.mjs"
import { sectionHeaderRe } from "./batch-skeleton.mjs"
import { batchProjectRoot } from "./batch-paths.mjs"

/** 平台路径键（win32 大小写不敏感——只作集比对，非判据面）。 */
const pathKey = (p) => (process.platform === "win32" ? p.toLowerCase() : p)

/** 文档档谓词 + 绝对化（触达账 / 提交 diff 同形；非 `.md` 不进范围）。 */
const isDocPath = (p) => typeof p === "string" && p.trim() !== "" && p.toLowerCase().endsWith(".md")
function docPaths(list, base) {
  const out = []
  for (const p of Array.isArray(list) ? list : []) if (isDocPath(p)) out.push(resolve(base, p))
  return out
}

/** 锚类命中（引擎大类中的锚面；其余 clazz = 段判据命中 —— 另加引擎的第三类 `行号坐标`（按**处**计，不是按「条」）。类名由引擎产出，本档只作切分。
 *  四属同计「锚 N 条」：`档缺` / `节缺` / `引缺`（引文不在所指档内——同属锚判据，不是段类）/ `环引`
 *  （声明出边走回本根——仓级事实，与 `档缺` 同计锚、不新增判决词）。 */
const ANCHOR_CLASSES = new Set(["档缺", "节缺", "引缺", "环引"])

/** 证据格识别器的**字面闭集**（判据单源 = `docs/core/design/BATCH-RECORD.md` §4.22「证据格怎么认」）：
 *  只有这两个字面。`依据` ∥ `一行依据` ∥ `判据落点` 等一律**不是**证据格 ⇒ 照旧阻写（失败方向 = 拒，fail-closed）。 */
const EVIDENCE_HEADERS = new Set(["证据", "evidence"])

/** 表格分隔行（`|---|:--:|`）：表头 = 它上面那一行——本档不带表格状态机，只借这一行认出表头在哪。 */
const DELIM_ROW_RE = /^\s*\|(?:\s*:?-+:?\s*\|)+\s*$/

/** 一行的**末格跨度**（`{start, end}`，0 基；不以 `|` 收尾 ⇒ `null`）。
 *  末格 = 倒数第二个 `|` 之后、收尾 `|` 之前；本档只认这一格的文字与范围。 */
function lastCellSpan(line) {
  const t = String(line).replace(/\s+$/, "")
  if (!t.endsWith("|")) return null
  const close = t.length - 1
  const open = t.lastIndexOf("|", close - 1)
  return open < 0 ? null : { start: open + 1, end: close }
}

/** 格内文字（判据 = 去首尾空白、去包裹反引号后**全等**）：`证据` ∥ `` `证据` `` ∥ `` `evidence` `` 都认，别的都不认。 */
const cellLabel = (raw) => String(raw).trim().replace(/^`+/, "").replace(/`+$/, "").trim()

/**
 * 证据格识别器：同一张 markdown 表内，表头行**最后一个单元格**落在闭集里 ⇒ 该表**表体所在的行区集合**。
 * @param {string} src 一份文本（本次写入文本 ∥ 批档整档 ∥ 收口面各档——三条腿各喂自己那份视图）
 * @returns {Map<number, number>} 1 基行号 → 该行**末格起点列**（0 基）
 *   **为什么连列起点一起返回**：命中的粒度是「一行」，判据的粒度是「一格」——同一行别的列照旧阻写（§4.22
 *   「正文与其他列一字不放」），于是调用面还要知道末格从第几个字符起。行不在表体 ⇒ 不在 Map 里（照判）。
 *   **不按段号豁免**：按段号会把 §3 的正文一起放宽（结论表与裁定行同在一段）——理由单源 = 该节「同类先例 · 偏离」。
 */
export function pointerCells(src) {
  const out = new Map()
  const lines = String(src ?? "").split("\n")
  let active = false
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const span = lastCellSpan(line)
    if (DELIM_ROW_RE.test(line)) {
      // 分隔行：上面那一行即表头——末格落进闭集才认这张表的表体。
      const head = i > 0 ? lastCellSpan(lines[i - 1]) : null
      active = head !== null && EVIDENCE_HEADERS.has(cellLabel(lines[i - 1].slice(head.start, head.end)))
      continue
    }
    // 表体行 = 以 `|` 起、以 `|` 收（与段判据的表格行谓词同一形）；其余行一律断表。
    if (span === null || !/^\s*\|/.test(line)) { active = false; continue }
    if (active) out.set(i + 1, span.start)
  }
  return out
}

/** 这条命中是不是落在**证据格**里（§4.22：证据格里只判「判得了的」）：
 *  ① 命中类必须是 `档缺`（`节缺` ∥ `引缺` 的前提是目标档在盘——判得出来就照判）；
 *  ② 该行必须在证据格表体内；
 *  ③ 被拒的 token 必须真的落在**末格**里（同一行别的列照旧阻写）。
 *  `环引` 没有行号（仓级事实）⇒ 恒不在证据格；读不到那一行 ⇒ 不在（照判，不往宽里掉）。 */
function inEvidenceCell(h, rowsOf, srcOf) {
  if (h.clazz !== "档缺" || typeof h.line !== "number") return false
  const start = rowsOf(h.file).get(h.line)
  if (start === undefined) return false
  const token = String(h.token ?? "")
  if (token === "") return false
  const line = String(srcOf(h.file) ?? "").split("\n")[h.line - 1] ?? ""
  return line.indexOf(token, start) >= start
}

/** 多行原文压成一行（段类的内容格是整段原文，段内换行在本行里显形——`⏎` 不是省略号，字一个没少）。 */
const oneLine = (s) => String(s ?? "").replace(/\s*\n\s*/g, " ⏎ ")

/**
 * 拒文四件的**显示行**（判据单源 = §4.22「拒文四件」）：档 + 位置 + 被拒的内容 + 解析根，按命中类取值、一格不空。
 * **引擎 `✗` 行齐四件的才直接用**：`环引` 那一行本就有根（`（<root>）`）与仓链，照用。
 * 不齐的按命中类补齐——引擎行不齐不是它的错：`paragraphHitLine` 只出档与行号（无原文、无根）；`lineRefHitLine`
 * 只出形别与前 40 字；锚行的根只在声明仓提示里出现。
 * `engineLine` 为 `null`（`aligned` 假、配不上对）⇒ 按命中对象现造，四件仍齐。
 */
function displayLineOf(h, engineLine, shown, root) {
  const at = h.root ?? root
  if (h.clazz === "环引") {
    return engineLine ?? `✗ 锚·环引 ${shown(h.file)}（${at}）publicRepos 成环：${h.chain ?? ""}`
  }
  if (ANCHOR_CLASSES.has(h.clazz)) {
    const base = engineLine ?? `✗ 锚·${h.clazz} ${shown(h.file)}:${h.line} \`${h.token ?? ""}\``
    return String(base).includes(String(at)) ? base : `${base}（根：${at}）`
  }
  const base = engineLine ?? `✗ ${h.clazz} ${shown(h.file)}:${h.line}${h.snippet === undefined ? "" : ` ${h.form ?? ""} ${h.snippet}`}`
  const content = oneLine(h.token)
  // 行号坐标的引擎行已带整行原文（片段 = 全长时）⇒ 内容格不重复；否则补原文。
  const hasContent = h.snippet !== undefined && h.snippet === content
  const tail = [hasContent ? "" : `原文：${content}`, `根：${at}`].filter(Boolean).join(" —— ")
  return `${base} —— ${tail}`
}


/** 收口腿的区间表（§2.10.1 的表）：只交「改动区已定」的那些档（`kind:"region"`）。
 *  整档（本轮新建的笔）∥ 未定（无基线）⇒ 不交该档 ⇒ 引擎按整档判（fail-closed）。写段面的「未定 ⇒ 零强制」
 *  走另一条路：那条路由本档的 `blocks` 判，不经引擎——两面倒向本来就不同（§2.9.4）。
 *  一档都交不出 ⇒ `undefined`（与「没给 `zones`」同形：整档判）。 */
function closeZoneTables(regions, docs) {
  const out = new Map()
  for (const p of docs) {
    const r = regions.get(pathKey(p))
    if (r && r.kind === "region" && r.zones.length > 0) out.set(p, r.zones)
  }
  return out.size > 0 ? out : undefined
}

/** 同目录 `.gate-*` 残留（进程在写片段后、清理前被杀）：**只扫不删**——并发进程的活片段是别人正在判的档。 */
function strayFragmentsOf(dir, ownAbs) {
  let names
  try { names = readdirSync(dir) } catch { return [] }
  const skip = ownAbs ? pathKey(ownAbs) : null
  return names.filter((n) => n.startsWith(FRAGMENT_PREFIX) && n.endsWith(".md") && pathKey(join(dir, n)) !== skip)
}

/** 读档（读不到 ⇒ 空串：归属标注取不到就只出 `§N`，不猜）。 */
function safeRead(abs) {
  try { return readFileSync(abs, "utf8") } catch { return "" }
}

/** 命中所在文本的**读取器**（证据格判据要读原文：表头与末格范围都在文本里，不在命中对象里）：
 *  本次写入文本 ⇒ `pendingBody`；`edit` 面的改写后整档视图 ⇒ `viewBody`（键 = 批档本体，身份即目标档）；其余 ⇒ 盘上读。
 *  按路径记一次——一笔里多命中同档时不重复读盘。读不到 ⇒ 空串（于是 `inEvidenceCell` 判「不在证据格」，照判不往宽里掉）。 */
function srcOfOf({ selfAbs, viewBody, fragAbs, pendingBody }) {
  const memo = new Map()
  return (abs) => {
    const key = pathKey(abs)
    let src = memo.get(key)
    if (src === undefined) {
      src = viewBody !== null && selfAbs !== null && key === pathKey(selfAbs) ? String(viewBody ?? "")
        : fragAbs !== null && key === pathKey(fragAbs) ? String(pendingBody ?? "")
          : safeRead(abs)
      memo.set(key, src)
    }
    return src
  }
}

/** 批档档头骨架行的「一段一作者」映射（`batch` create 落骨架时写入）——取不到 ⇒ 空表。 */
function authorMapOf(src) {
  const map = new Map()
  for (const line of String(src ?? "").split("\n")) {
    if (!line.includes("一段一作者")) continue
    for (const m of line.matchAll(/§\s*(\d+)\s*[^（(]*[（(]([^）)]+)[）)]/g)) {
      const n = Number(m[1])
      if (!map.has(n)) map.set(n, m[2].trim())
    }
  }
  return map
}

/** 行号 → 所属段号（`## §N` 段头分段；首个段头之前 ⇒ null）。 */
function sectionOfLine(src, line) {
  const lines = String(src ?? "").split("\n")
  const end = Math.min(line, lines.length)
  let cur = null
  for (let i = 0; i < end; i++) {
    const m = /^## §(\d+)(?=\s|$)/.exec(lines[i])
    if (m) cur = Number(m[1])
  }
  return cur
}

/** 命中行落在批档内时的归属标注：` §N（作者：<角色>）`；作者取不到 ⇒ 只出 ` §N`（不猜）。 */
function attributionOf(src, line, authors) {
  const seg = sectionOfLine(src, line)
  if (seg === null) return ""
  const who = authors.get(seg)
  return who ? ` §${seg}（作者：${who}）` : ` §${seg}`
}

/** 明示集的单条摘要（`§N 第 M 行（作者：<角色>）`）。 */
function landedSummary(src, entry, authors) {
  const seg = sectionOfLine(src, entry.line)
  const at = seg === null ? `第 ${entry.line} 行` : `§${seg} 第 ${entry.line} 行`
  const who = seg === null ? null : authors.get(seg)
  return who ? `${at}（作者：${who}）` : at
}

/** 命中集按类分列（`锚 A 条 · P 处<类名>`）——引擎报面行形不动，只在这里做计数。 */
function classifyCounts(entries) {
  const parts = []
  const anchor = entries.filter((e) => ANCHOR_CLASSES.has(e.clazz)).length
  if (anchor) parts.push(`锚 ${anchor} 条`)
  const byClass = new Map()
  for (const e of entries) if (!ANCHOR_CLASSES.has(e.clazz)) byClass.set(e.clazz, (byClass.get(e.clazz) ?? 0) + 1)
  for (const [clazz, n] of byClass) parts.push(`${n} 处${clazz}`)
  return parts.join(" · ")
}

/**
 * `<批起 sha>` 的取法（唯一）= 批档 §1 的记入行 `批起 sha = <sha>`：段界消费 `sectionHeaderRe(1)`
 * （段头形态单源——`## §10` 不误命中 `§1`），取段内该行行内首个 40 位十六进制串。
 * 无该行 ∥ 形态不合 ∥ 读不到 ⇒ `null`——调用面按「基 sha 未定」明示，不静默；段界外提到该行形不算数
 * （记入行只认 §1：取法与写入义务单源 = 规范「② 的范围」）。
 */
function baseShaOf(abs) {
  let src
  try { src = readFileSync(abs, "utf8") } catch { return null }
  const hdr = sectionHeaderRe(1).exec(src)
  if (!hdr) return null
  const nextRe = /^## §\d/gm
  nextRe.lastIndex = hdr.index + hdr[0].length
  const next = nextRe.exec(src)
  const body = src.slice(hdr.index + hdr[0].length, next ? next.index : src.length)
  for (const line of body.split(/\r?\n/)) {
    if (!line.includes("批起 sha")) continue
    const sha = /[0-9a-f]{40}/i.exec(line)?.[0]
    if (sha) return sha
  }
  return null
}

/** `edit` 的替换区：改后整档视图里 `newText` 所占的行区间；纯删为零宽。 */
function replacementRegionOf(oldBody, newBody) {
  const oldLines = String(oldBody ?? "").split("\n")
  const newLines = String(newBody ?? "").split("\n")
  const min = Math.min(oldLines.length, newLines.length)
  let head = 0
  while (head < min && oldLines[head] === newLines[head]) head++
  let tail = 0
  while (tail < min - head && oldLines[oldLines.length - 1 - tail] === newLines[newLines.length - 1 - tail]) tail++
  return { start: head + 1, end: newLines.length - tail }
}




/** 命中 → `{ aligned, drift, entries }`：`file` / `line` / `clazz` / `token` / `root` = 判定用（引擎给绝对路径，两格载荷 = 引擎补的）；
 *  显示行 = **拒文四件**（单源 = `docs/core/design/BATCH-RECORD.md` §4.22「拒文四件」）：档 + 位置 + 被拒的内容 + 解析根，
 *  按命中类取值、一格不空；`pointerRead` = 这一条落在证据格里且只失败存在性（只列读数、不阻写）。
 *  `aligned`（引擎 `✗` 行数与命中数是否同序）**降为读数**：不同序时引擎行不可逐条配对 ⇒ 显示行按命中对象现造，
 *  判定仍按命中对象（那句读数由调用面出固定一行）。 */
function hitEntries(res, root, translate, srcOf) {
  const lines = res.report.split("\n").filter((l) => l.startsWith("✗ "))
  // 三条判据的命中按**报面行序**串起（锚 ∥ 段 ∥ 行号坐标）——引擎的命中数组顺序即报面行序，
  // 少串一类就会让 `aligned` 永为 false（显示行全走自造形）。
  const hits = [...res.anchorHits, ...res.paragraphHits, ...(res.lineRefHits ?? [])]
  const drift = Math.abs(lines.length - hits.length)
  const aligned = drift === 0
  const shown = (f) => relative(root, f).replace(/\\/g, "/")
  // 证据格表体（一行一次 `pointerCells`）：同一笔里多命中同档时不重扫。
  const rowsMemo = new Map()
  const rowsOf = (file) => {
    const key = pathKey(file)
    let rows = rowsMemo.get(key)
    if (rows === undefined) { rows = pointerCells(srcOf(file)); rowsMemo.set(key, rows) }
    return rows
  }
  const entries = hits.map((h, i) => ({
    file: h.file,
    line: h.line,
    clazz: h.clazz,
    token: h.token,
    where: translate(`${shown(h.file)}:${h.line}`),
    pointerRead: inEvidenceCell(h, rowsOf, srcOf),
    text: translate(displayLineOf(h, aligned ? lines[i] : null, shown, root)),
  }))
  return { aligned, drift, entries }
}

/** 报面组装：首行 verdict + 强制集命中行 + 明示集命中行 + 附注行 + 处置块（只跟段命中走——仅锚 ∥ 仅行命中不得叫人对段落动手；
 *  字面单源 = 引擎导出的 `PARA_DISPOSE`，本档零字面副本）。明示集标题按面取形（`append` = 已落段命中；
 *  `edit` = 档内段长类命中——段长类判集是本次写入文本，两件事在回执里不得叫同一个名字）。 */
function composeReport({ first, forcedLines, disclosedLines, disclosedHeader, notes, disposePara }) {
  const out = [first, ...forcedLines]
  if (disclosedLines.length) {
    out.push(disclosedHeader ?? "—— 批档已落段命中（只明示、不阻本次写；收口按本批改动区判）：", ...disclosedLines)
  }
  out.push(...notes)
  if (disposePara) out.push(...PARA_DISPOSE)
  return out.join("\n")
}

/** 空范围返回形（`range` 恒在场——回执要读 `范围 N 档`）。 */
const emptyRange = (basis) => ({ count: 0, k: 0, basis })
const errorState = (first, range = emptyRange("none")) => ({ state: "error", first, report: first, hitLines: [], noteLines: [], disposePara: false, range })

/**
 * 跑一次门（**非抛错**：两因之外的门自身异常收为 `error` 态，由调用面按 `scope` 消费）。
 * @param {{abs:string, cwd?:string, agent?:object, scope?:'writer'|'close', pending?:{section?:number, body?:string, recordView?:string}|null}} o
 *   `abs` = 目标批次档绝对路径（根解析用；**同时恒是判域一员**）；`agent._touchedFiles` = 触达记账；
 *   `pending` = 本次写入的段号与文本（`writer` 面强制集；缺省 ⇒ 无本次文本腿，`close` 面恒缺省）：
 *   `body` = 本次写进来的文本（`append` = 追加文，落片段档判；`edit` = `newText`，只用来报「已判几行」）；
 *   `recordView` = **改写后的整档全文**（仅 `edit` 面传：判定输入换成它，`§2.10.1` 的 `texts`）。
 * @returns {{state:'pass'|'refused'|'error'|'not-applicable', first:string|null, report:string,
 *   hitLines:string[], noteLines:string[], disposePara:boolean, range:{count:number, k:number, basis:string}}}
 *   `first` = 唯一机判串（首行 `DOC-CHECK GATE:`）；`not-applicable` ⇒ `first = null` + 固定回执行；
 *   `disposePara` = 判域内存在「文字太长，难于阅读」类命中（拒串据此选「空行 + 五行块」还是照旧一句处置）。
 */
export function runBatchGate({ abs, cwd, agent = {}, scope = "writer", pending = null } = {}) {
  // `scope` 两取值、无第三值（设计「`scope` 语义」）——未知值不静默降级（降级即 ② 变 fail-open）
  if (scope !== "writer" && scope !== "close") {
    return errorState(`DOC-CHECK GATE: ERROR（未知 scope：${JSON.stringify(scope)}——取值只有 "writer" ∥ "close"）`)
  }
  try {
    return evaluate({ abs, cwd, agent, scope, pending })
  } catch (e) {
    const first = `DOC-CHECK GATE: ERROR（门自身异常：${e?.message ?? String(e)}）`
    return errorState(first)
  }
}

/** 门体（正常路径——异常由上抛给 `runBatchGate` 收口）。 */
function evaluate({ abs, cwd, agent, scope, pending }) {
  const base = resolve(cwd)
  const selfAbs = resolve(abs)
  const root = owningProject(selfAbs, base) ?? batchProjectRoot(base)
  const close = scope === "close"

  let read
  try { read = readManifest(root) } catch (e) {
    return errorState(`DOC-CHECK GATE: ERROR（manifest 不可读 —— ${e?.message ?? String(e)}）`)
  }
  // 适用面（声明面驱动）：无 manifest ⇒ 不适用 + 回执明示；**不是豁免清单**——判据参数 = 引擎内置常量。
  if (!read.ok && read.reason === "missing") {
    return { state: "not-applicable", first: null, report: "[doc-check gate] 未跑（本项目无声明面）", hitLines: [], noteLines: [], disposePara: false, range: emptyRange("none") }
  }

  // 范围（判谁）：writer = 写者触达账 ∪ 本次写入文本 ∪ 批档自身；
  //                   close = 本批笔域集 = 触达账 ∪ 本批提交 diff ∪ 批档自身（**单集**——范围外的档不入判、不入报面）。
  const touched = docPaths(agent?._touchedFiles, base)
  const baseSha = close ? baseShaOf(selfAbs) : null
  const diff = baseSha ? committedDocs(root, baseSha) : { ok: false, base: root, files: [] }
  const diffDocs = docPaths(diff.ok ? diff.files : [], diff.base)

  const strays = strayFragmentsOf(dirname(selfAbs), null)
  const pendingBody = !close && pending && typeof pending.body === "string" && pending.body.trim() ? pending.body : null
  // 改写后的整档视图（`edit` 面）：它走 `texts` 交引擎（身份 = 批档本体），不再落一份整档副本临时档。
  const viewBody = !close && pending && typeof pending.recordView === "string" ? pending.recordView : null
  const editRegion = viewBody === null ? null : replacementRegionOf(safeRead(selfAbs), viewBody)
  // `edit` 的本次写入文本不落片段档：整档视图走 `texts`、替换区走 `zones`（§2.10.1 ∥ §2.10.2）。
  // `append` 的候选文本仍是片段档（§2.10.8 的边界：那一面的身份另定，本批不碰）。
  const fragAbs = viewBody === null && pendingBody ? fragmentPathOf(selfAbs) : null
  // 判域内「哪一档是批档本体」：身份就是它（有视图时判定输入换成视图文本，`file` 仍是它）。
  const selfKey = pathKey(selfAbs)
  const closeDocs = [...touched, ...diffDocs, selfAbs]
  // 收口也按批起 sha 求本批改动区；没有基线时每档都是 unknown，由 blocks 向严整档阻断。
  const regions = close
    ? (baseSha
      ? touchedRegions(closeDocs, baseSha)
      : new Map(closeDocs.map((p) => [pathKey(p), { kind: "unknown", why: "§1 无有效批起 sha 记入行" }])))
    : touchedRegions(touched.filter((p) => pathKey(p) !== pathKey(selfAbs)), baseShaOf(selfAbs) ?? "HEAD")

  try {
    // 片段档写在 try 内：写失败也走同一条 finally（不存在就 unlink 失败无害）
    if (fragAbs) writeFileSync(fragAbs, pendingBody.endsWith("\n") ? pendingBody : `${pendingBody}\n`)
    // 三处调用各只说自己要判哪份档、哪些区间（§2.10.1 的表）：
    //   交付面（不在这里）—— 两个入参都不交；
    //   写段面 `append` —— 候选文本落片段档（第四条腿，身份另定）；批档自身整档入判；
    //   写段面 `edit` —— `texts` = 改后整档视图、`zones` = 本次替换区经扩区表后的区；
    //   收口门 —— `zones` = 逐档 `git diff -U0` 的 `+` 侧区间经扩区表后的区（已落盘，不交 `texts`）。
    const docs = close ? closeDocs : [...touched, selfAbs, ...(fragAbs ? [fragAbs] : [])]
    const texts = viewBody === null ? undefined : new Map([[selfAbs, viewBody]])
    const zones = viewBody === null ? closeZoneTables(regions, closeDocs) : new Map([[selfAbs, judgeZones(viewBody.split("\n"), [editRegion])]])
    const res = runDocCheck(root, { mode: "gate", docs, docsSource: close ? "explicit" : "session", texts, zones })
    const basis = !close
      ? (pendingBody ? "pending+touched" : "touched")
      : diff.ok ? "touched+diff" : "touched（基 sha 未定）"

    // 批档自身（或它的改写后视图）恒在判域（在盘即入）⇒ 判域恒非空，「0 档」这一形不可达。不成立 = 构造异常 ⇒ fail-closed，不产 PASS。
    if (!res.checkFiles.some((p) => pathKey(p) === selfKey)) {
      return errorState("DOC-CHECK GATE: ERROR（判域为空——批档自身应恒在判域）", { count: res.checkFiles.length, k: 0, basis })
    }

    const selfRel = relative(root, selfAbs).replace(/\\/g, "/")
    // 读面（读不到 ≠ 干净）：判域里有在盘但读不到的档 ⇒ 这一轮**判不出**，给 `ERROR` 而不给 `PASS`。
    // 不并入 `hits`（它不是命中，是一个没做完的判定）；两 scope 按既有 ERROR 语义消费：`close` fail-closed 拒收口，
    // `writer` 放行 + 回执明示（子代理无法重启会话，卡死写账 = 无账之笔）。口径 = §3.20「读面」块 ∥ K6。
    if (Array.isArray(res.unreadable) && res.unreadable.length) {
      const first = `DOC-CHECK GATE: ERROR（读不到 ${res.unreadable.length} 档）`
      const named = res.unreadable.map((p) => relative(root, p).replace(/\\/g, "/")).join(" ∥ ")
      return { ...errorState(first, { count: res.checkFiles.length, k: 0, basis }), report: `${first}\n未判（在盘但读不到）：${named}` }
    }
    const fragRel = fragAbs ? relative(root, fragAbs).replace(/\\/g, "/") : null
    // 只剩片段档要译名（`append` 的候选文本）：`edit` 的身份已是批档本体，命中行本就是读者能用的坐标。
    const translate = (text) => (fragRel ? text.split(fragRel).join("本次写入文本") : text)
    const rawHits = hitEntries(res, root, translate, srcOfOf({ selfAbs, viewBody, fragAbs, pendingBody }))
    const { aligned, drift } = rawHits
    const entries = rawHits.entries

    const selfSrc = viewBody ?? safeRead(selfAbs)
    const authors = authorMapOf(selfSrc)
    // 证据格只改「哪些命中阻写」，不改「是不是命中」（单源 = `BATCH-RECORD.md` §4.22）：
    // 这批命中不强制、不明示，只入指针读数桶 `pointerReads`——与「触达账存量命中」同族（不进 `hits`、不动 verdict）。
    const pointerReads = entries.filter((e) => e.pointerRead)
    const judged = entries.filter((e) => !e.pointerRead)
    const labeled = judged.map((e) => {
      const inSelf = pathKey(e.file) === selfKey
      return { ...e, inSelf, text: inSelf ? `${e.text}${attributionOf(selfSrc, e.line, authors)}` : e.text }
    })
    // ① 面（**三层腿分开判**——批档自身腿的判集单源 = `BATCH-RECORD.md` §4.9 门 ④ 判集两句）：
    //   · 本次写入文本（`append` 的片段档）⇒ 当场拒；
    //   · 批档自身：`append`（无视图）⇒ 已落段命中只明示、不阻写（追加不碰既有行，拒一个改不动的人 = 无账之笔）；
    //     `edit`（有视图）⇒ 引擎已按判定区切过（`zones`，§2.10.1），进来的就是本次——锚类与段类都拒；
    //   · 触达账 ⇒ **改动区内**的命中当场拒（与本次文本同权）；区外存量只入回执计数；改动区未定 ⇒ 零强制 + 明示。
    // ② 面：本批改动区内命中即 K（引擎已按 `zones` 切过）；纯删扩进来的存活旧命中须先过基线映射。
    const pureDeleteStock = close ? pureDeleteStockEntries(labeled, root, regions) : new Set()
    const blocks = (e) => {
      if (close) {
        const region = regions.get(pathKey(e.file))
        if (!region || region.kind !== "region") return true
        const inZone = region.zones.some((z) => e.line >= z.start && e.line <= z.end)
        return inZone && !pureDeleteStock.has(e)
      }
      if (e.inSelf) return viewBody !== null
      const region = regions.get(pathKey(e.file))
      if (!region) return true // 判域内既非批档自身也非触达账 ⇒ 只可能是本次写入文本（片段档）——整段强制
      if (region.kind === "whole") return true // ② 未跟踪档 ⇒ 整档即本轮的笔
      if (region.kind === "unknown") return false // 写段面未定 ⇒ 零强制；收口面独立按批起基线判定
      return region.zones.some((z) => e.line >= z.start && e.line <= z.end)
    }
    const disclosed = labeled.filter((e) => !blocks(e))
    const forced = labeled.filter(blocks)
    const k = forced.length
    const forcedLines = forced.map((e) => e.text)
    // 明示集一分为二：批档自身的已落段命中**逐条列**（作者改得动、收口人看得懂）；触达账区外存量**只出计数**
    // （137 条逐条列正是本批消掉的现场——它们本就不该在这一轮被要求修）。
    const selfDisclosed = disclosed.filter((e) => !close && e.inSelf && viewBody === null)
    const outsideHits = disclosed.filter((e) => !e.inSelf)
    // 存量读数 = 本档重分类掉的那批（纯删基线映射 ∥ 写段面区外）**加上**引擎交出的区外命中（§2.10.1 的 `stockHits`）——
    // 两边各是一批，相加才是这一轮真正「不属本次」的条数，不重复（引擎那批根本没有进 entries）。
    const stockCount = (close || viewBody !== null ? disclosed : outsideHits).length + (res.stockHits?.length ?? 0)
    const disclosedLines = selfDisclosed.map((e) => e.text)

    const inFrag = (e) => !!fragAbs && pathKey(e.file) === pathKey(fragAbs)
    const textHits = forced.filter(inFrag)
    const recordHits = forced.filter((e) => e.inSelf) // 仅 edit 面可达：本次替换区的锚类命中
    const touchHits = forced.filter((e) => !inFrag(e) && !e.inSelf)
    let first = "DOC-CHECK GATE: PASS"
    if (k >= 1) {
      if (close) {
        first = `DOC-CHECK GATE: REFUSED（命中 ${k} 条）`
      } else {
        const parts = []
        if (textHits.length) parts.push(`本次写入文本（${classifyCounts(textHits)}）`)
        if (recordHits.length) parts.push(`批档替换区（${classifyCounts(recordHits)}）`)
        if (touchHits.length) parts.push(`触达账改动区（${classifyCounts(touchHits)}）`)
        first = `DOC-CHECK GATE: REFUSED（命中 ${k} 条——${parts.join(" · ")}）`
      }
    }

    // 附加行（不静默面）：命中行与引擎报面不同序 / 指针读数 / 收口面取不到基 / 拒后零字节 / 本次文本已判行数 /
    // 已落段命中（谁该改、为什么不阻本次写）/ 同目录片段档残留（只明示、不代删）。
    const notes = []
    // 读数行（设计单源 = `BATCH-RECORD.md` §4.22「`aligned` 降为读数、不删」）：不同序时出固定一行——
    // 它是显示面与引擎报面漂移的**唯一可见信号**（`aligned` 曾长期恒假、整个门的显示面静默退化过）。
    if (!aligned) notes.push(`命中行与引擎报面不同序（${drift} 处）——四件仍由命中对象拼齐，此行只作闸自身的一致性读数`)
    // 指针读数桶（与「触达账存量命中」同族：不进 `hits`、不动 verdict）：证据格里解不到的指针**不阻写**，
    // 但必须看得见——一颗真悬空的指针沉进绿里，收口人就得自己再找一遍。
    if (pointerReads.length) {
      const list = pointerReads.map((e) => `${e.where} \`${e.token}\``).join(" ∥ ")
      notes.push(`指针读数 ${pointerReads.length} 处（证据格里解不到的指针——不阻断交付；正文与其他列照判）：${list}`)
    }
    if ((res.cycleReads ?? []).length) notes.push(CYCLE_READ_LINE(res.cycleReads.length))
    if (close) {
      const undetermined = [...new Map(closeDocs.map((p) => [pathKey(p), p])).values()]
        .map((p) => [p, regions.get(pathKey(p))])
        .filter(([, r]) => !r || r.kind === "unknown")
      if (undetermined.length) {
        const named = undetermined.map(([p, r]) => `${relative(root, p).replace(/\\/g, "/")}（${r?.why ?? "改动区缺失"}）`).join(" · ")
        notes.push(`收口改动区未定——整档判（${named}）`)
      }
    }
    if (close && !diff.ok) notes.push("基 sha 未定——本批笔域集只认触达账")
    if (!close && k >= 1) {
      notes.push("本次写入文本尚未落盘——一个字没写（档字节逐字不变：append 面另有段号不前进、轮次 N 不推进；edit 面另有目标区间以外逐字不变）")
    }
    if (!close && k === 0 && pendingBody) {
      const segLabel = Number.isInteger(pending?.section) ? `§${pending.section}` : "本段"
      const lineCount = pendingBody.split("\n").length
      notes.push(viewBody !== null
        ? `本次写入文本（${segLabel}）${lineCount} 行已判——段长类只判这一段；锚类只判本次替换区（区外命中出存量读数）`
        : `本次写入文本（${segLabel}）${lineCount} 行已判——强制集只有这一段（别人的段字面改不动，不进你的拒面）`)
    }
    if (selfDisclosed.length) {
      const list = selfDisclosed.map((e) => landedSummary(selfSrc, e, authors)).join(" · ")
      notes.push(`已落段命中 ${selfDisclosed.length} 条：${list}—— 不属本次笔面，不阻本次写；区外存量收口只出读数`)
    }
    // 存量读数句（字面单源 = 引擎的 `STOCK_LINE`）：引擎交出的区外命中 + 本档重分类掉的那批（纯删基线映射 ∥ 写段面区外）。
    if (stockCount) notes.push(STOCK_LINE(stockCount))
    const undetermined = touched
      .filter((p) => pathKey(p) !== pathKey(selfAbs))
      .map((p) => [p, regions.get(pathKey(p))])
      .filter(([, r]) => r && r.kind === "unknown")
    if (undetermined.length) {
      // 点名到档、点名原因（「未定」与「那儿真的干净」否则读起来一样）；句首固定字面单源 = 设计档 §3.20「未定的处置」。
      const named = undetermined.map(([p, r]) => `${relative(root, p).replace(/\\/g, "/")}（${r.why}）`).join(" · ")
      notes.push(`触达账改动区未定——只明示、不阻本次写；收口面按批起基线独立判定（${named}）`)
    }
    if (strays.length) {
      notes.push(`\`.gate-*\` 残留 ${strays.length} 档（异常退出的片段档）—— 手工删除后再提交`)
    }
    // 声明面坏而门照判：manifest 非法 JSON 时判据参数 = 引擎内置常量、不读声明面 ⇒ 行为本身正确
    // （比短路成「未跑」强——一份坏档不该把整个门关掉）。但那一支过去**不点名**，收口人看不出
    // 声明面已坏；与 `missing` 支「未跑（本项目无声明面）」的明示不对称 ⇒ 两种坏法一种明示一种沉默。
    if (!read.ok && read.reason === "invalid") {
      notes.push("声明面不可解析（`PROJECT-MANIFEST.json` 非法 JSON）—— 判据参数为引擎内置常量，本轮仍已判")
    }

    // 处置块只看**段**类命中——设计口径是「只要存在该类命中就出」，没按「谁写的」切；
    // 仅锚 ∥ 仅行命中不得叫人对段落动手（叫错方向比不给方向贵）——类名单源 = 引擎的 `DOC_CLASS`。
    // edit 面只看**强制集**，append 面另看批档自身的明示集（逐条列的才叫得出名字）；触达账区外存量不在此列——
    // 它们一个都没摆进拒面，叫写者对一段没露出过的文字动手 = 指错方向。
    const disposePara = [...forced, ...(viewBody !== null ? [] : selfDisclosed)].some((e) => e.clazz === DOC_CLASS.para)
    return {
      state: k >= 1 ? "refused" : "pass",
      first,
      report: composeReport({
        first, forcedLines, disclosedLines, notes, disposePara,
        disclosedHeader: viewBody !== null ? "—— 档内段长类命中（只明示、不阻本次写；段长类判集 = 本次写入文本）：" : undefined,
      }),
      hitLines: forcedLines,
      noteLines: notes,
      // 处置面分形用（拒串读它：段命中 ⇒ 五行块 ∥ 仅锚·仅行 ⇒ 照旧一句处置）
      disposePara,
      range: { count: res.checkFiles.length, k, basis },
    }
  } finally {
    if (fragAbs) { try { unlinkSync(fragAbs) } catch { /* 清理失败不覆盖判定结果——残留由下一次门明示 */ } }
  }
}

/** 成功回执行（append / close / status 三面同形；`null` 门 ⇒ 零改——非挂门路径回执逐字旧形）。
 *  两件 = verdict + `范围 N 档` 事实行；附注行（「基 sha 未定」∥ 命中行与引擎报面不同序 ∥ 指针读数 ∥ 已落段命中 ∥ 片段档残留）紧随其后
 *  **逐字**列出——不静默吞掉可见性。 */
export function gateReceiptLine(gate) {
  if (!gate) return ""
  if (gate.state === "not-applicable") return "\n[doc-check gate] 未跑（本项目无声明面）"
  const head = `\n[doc-check gate] ${gate.first} · 范围 ${gate.range?.count ?? 0} 档`
  return [head, ...(gate.noteLines ?? []).map((l) => `\n${l}`)].join("")
}

/**
 * 拒绝串（throw 载荷；两机械点同源措辞）：`batch:` 前缀 + verdict 首行 + 逐条 `✗` 行 + 附注行 + 处置面。
 * **处置面按命中类分形**（本批裁定）：
 *   · 段命中 ⇒ **空行 + 五行处置块**（字面单源 = 引擎的 `PARA_DISPOSE`）。块末行逐字就是「同轮修正后复跑；不转台账」，
 *     故旧尾句那一截删去——留着就是两句「处置：」+ 一句重复；收尾的裁决指引与「Nothing was written」两句不重复，随原因面照出。
 *   · 仅锚 ∥ 仅行命中 ⇒ **照旧一句**（那五条出路是给「段」的，对错误的面对动手比不给方向更贵）。
 * ① 写盘面两路（`append` 段尾 ∥ `edit` 段内区间）同路既有句「失败 ⇒ 勿 close」（字面同 append 既有拒因，不新造措辞）。
 */
export function gateRefusalMessage(gate, action = "append") {
  const writeFace = action === "append" || action === "edit" // 写盘面两路：段尾追加 ∥ 段内区间改写
  const lead = action === "edit"
    ? "batch: 文档机检门拒写（doc-check gate · 结构兜底 ①）—— 本次段内就地改未落盘，档字节不变。"
    : writeFace
      ? "batch: 文档机检门拒写（doc-check gate · 结构兜底 ①）—— 本次段写入未落盘，档字节不变。"
      : `batch: 文档机检门拒收口（doc-check gate · 结构兜底 ②）—— ${action === "close" ? "close" : "status → 已收口"} 被拒绝，§1 状态行字节不变。`
  const detail = gate.state === "error" ? String(gate.report ?? "").split("\n").slice(1) : gate.hitLines
  const routing = "拿不准 ⇒ 上抛主 agent 裁决（主 agent 拿不准 ⇒ 转呈用户）。"
  // 尾句按动作取形：`edit` 拒后段里本就有内容，劝「勿 close」把两件事说成一件（那句防的是收口冻结一个空段）。
  const noBytes = writeFace
    ? action === "edit"
      ? "Nothing was written — the target range and every other byte of the record are unchanged."
      : "Nothing was written. Do NOT close the record after a refused append — nothing landed, and closing freezes the missing section for good (失败 ⇒ 勿 close)."
    : "Nothing was written."
  const head = [lead, gate.first, ...(detail ?? []), ...(gate.noteLines ?? [])]
  // 段命中：原因面 + 空行 + 五行块（处置面 = 块，不再另起一句「处置：同轮修正后复跑…」）
  if (gate.disposePara) return [...head, `${routing}${noBytes}`, "", ...PARA_DISPOSE].join("\n")
  return [...head, `处置：同轮修正后复跑（改文档 ∥ 修引擎）；不转台账；${routing}${noBytes}`].join("\n")
}
