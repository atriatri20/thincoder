/**
 * agent-tools/batch-gate.mjs — 文档机检门（`batch` 工具两机械点的**单源门**）。
 *
 * 权威规格 = `docs/core/design/DOC-DISCIPLINE.md` §3.20「结构兜底」（判据 / 范围 / 适用面 /
 * ERROR 消费分野 / 门自身异常 / 不检面）——本门只实现，**不重述口径**（D2）。需求 = `DOC-CHECK.md` F9 / AC-7。
 *
 * 调用面（`scope` 语义 = 规范「调用面开关，无第三值」）：
 *   ① `batch.mjs` append——**全部 append 同挂**（§1–§6，含 depth-0 与评审写 §3）⇒ `scope: "writer"`；
 *      强制集 = 候选文本命中 ∪ 写者触达账**改动区**命中（判面单源 = `docs/core/design/DOC-DISCIPLINE.md`
 *      §3.20「触达账腿的判面 = 本次改动区」）；`REFUSED` ⇒ 调用面 throw；`ERROR` / 门自身异常 ⇒
 *      放行 + 回执明示（子代理无法重启会话，卡死写账 = 无账之笔；② 会拒收口 ⇒ 轮次不会被当成已通过）。
 *   ② `batch-lifecycle.mjs` close ∥ status 值余核「已收口」⇒ `scope: "close"`——范围 = 本批笔域集
 *      （父侧触达账 ∪ 本批提交 diff = `git diff --name-only <批起 sha> HEAD` 内的 `.md` ∪ 批档自身）；
 *      `REFUSED`（K ≥ 1）∥ `ERROR` ⇒ 调用面 throw（fail-closed）。
 *      **单集**：范围内不设第二集——工作树里范围外的档不入判、不入报面（用户 2026-10-25 裁定「只判指定文件」）。
 *
 * **批档自身恒在判域（两 scope 同）**，阻断集仍只跟本次改动走：
 *   · ① 面 `append` 的判定输入 = 候选全文（`texts`，身份 = 批档本体）：命中就是这一段候选，当场拒；
 *     批档已落段不再入判 ⇒ 那一面不出存量读数（KD-P6；可见性归 `edit` ∥ 收口两面）。
 *     `edit` 携改写后的整档视图：`texts` = 视图、`zones` = `newText` 所在区间经扩区表后的区 ∪ 触达账各档改动区
 *     —— 命中行本就是批档本体坐标，区外命中只出存量读数（§2.10.1 ∥ §2.10.2）。
 *   · ② 面按批起 sha 求每档的本批改动区（`zones`），区内命中即 K；区外与纯删邻段的存量只出 `STOCK_LINE`。
 *     区未定则整档阻断。批档内强制命中逐条带 `§N（作者：<角色>）`，取不到作者就只出段号。
 *
 * 判据零变：本门不新增判据——只决定「判谁」与「何时强制」；判据与裁定串由产品引擎
 * `doc-check/index.mjs` 产出（判据源唯一）。
 *
 * **证据格 = 判据面的一列收窄（不是新判据）**：证据格里只失败存在性的 `档缺` 降为读数、不进强制集；
 * 口径单源 = `docs/core/design/BATCH-RECORD.md` §4.22——本门只实现「哪些命中阻写」，引擎的命中、分类与
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
 * ① **`append` 候选文本的判法** = 候选全文直接当 `texts`（键 = 批档本体）——锚解析序 ② 是「引用方档所在目录相对」，
 *    身份 = 批档本体 ⇒ 判法与批档本体逐字同源；命中行号因此是**候选文本里的行号**，回执渲染成
 *    「候选文本第 N 行」，不译成批档坐标、不落临时档、不留映射表（`texts` 单源 = `docs/core/design/DOC-CHECK.md` §2.10.1）。
 *    **`edit` 同一形**：整档视图走 `texts`、区表走 `zones`（替换区 ∪ 触达账各档的改动区，§2.10.1）——同样零临时档。
 * ② **提交 diff 腿的基 sha 只读批档 §1 的记入行**（`批起 sha = <sha>`——取行内首个 40 位十六进制串）；
 *    取不到（无该行 ∥ 形态不合 ∥ git 跑不出该 diff）⇒ 只认触达账 + 回执明示「基 sha 未定」（不静默）。
 *
 * **三族落点（分拆后本档只余编排与范围解析）**：命中行组装 = `thincoder-core/agent-tools/batch-gate-hit.mjs` ∥
 * 判集分腿 = `thincoder-core/agent-tools/batch-gate-judge.mjs` ∥ 报面组装 = `thincoder-core/agent-tools/batch-gate-report.mjs`。
 * 本档留 `runBatchGate` 入口、`evaluate` 编排与范围解析——它们是「判谁」的事，不属上面任何一族。
 * **共享小件不在本档自持**：`pathKey` 取 `thincoder-core/doc-check/per-root.mjs` 的既有导出、`safeRead` 取
 * `thincoder-core/agent-tools/batch-regions.mjs` 的既有实现（改为导出后两族共用）——族档反向 import 编排档
 * 会成环，且是层次倒挂（单测一个族档要连整个编排档与引擎一起拖进来）。
 */
import { readFileSync } from "node:fs"
import { relative, resolve } from "node:path"

import { owningProject, readManifest } from "../manifest.mjs"
import { runDocCheck, DOC_CLASS, STOCK_LINE, CYCLE_READ_LINE } from "../doc-check/index.mjs"
// 路径键单源（判域族 `thincoder-core/doc-check/per-root.mjs` 的既有导出）：族档与编排档共用一份，各写一份必然漂。
import { pathKey } from "../doc-check/per-root.mjs"
// 扩区表单源（D2）：两门判的是同一件事（本笔触碰的那几段），各写一张表必然漂移 ⇒ 只调用、不复制。
// 读档小件 `safeRead` 同住 `batch-regions.mjs`（它本就 import 了 `node:fs`）：同一句读法两处各写一份必然漂移，只留那一份。
import { committedDocs, pureDeleteStockEntries, safeRead, touchedRegions } from "./batch-regions.mjs"
// 扩区表本体与区间合并同住写前门（§3.26「扩区表的第二消费面」句）：本档只调用。
import { judgeZones } from "../tools/doc-write-gate.mjs"
import { sectionHeaderRe } from "./batch-skeleton.mjs"
import { batchProjectRoot } from "./batch-paths.mjs"
// 三族各一档（`docs/core/design/BATCH-RECORD.md` §4.22「档层结论」）：本档只编排，族的判定体各住各档。
import { hitEntries, srcOfOf } from "./batch-gate-hit.mjs"
import { blocks, zoneTablesOf } from "./batch-gate-judge.mjs"
import { composeReport, classifyCounts, attributionOf, authorMapOf, emptyRange, errorState } from "./batch-gate-report.mjs"
// 再出口（对外导出面零改：四个消费档 `batch-closeout.mjs` ∥ `batch-lifecycle.mjs` ∥ `batch-record-write.mjs`
// ∥ `batch-supersede.mjs` 照旧 import 本档，一个 import 行都不用改）：实现在三族各档，导出位仍在本档。
export { pointerCells } from "./batch-gate-hit.mjs"
export { gateReceiptLine, gateRefusalMessage } from "./batch-gate-report.mjs"

/** 文档档谓词 + 绝对化（触达账 / 提交 diff 同形；非 `.md` 不进范围）。 */
const isDocPath = (p) => typeof p === "string" && p.trim() !== "" && p.toLowerCase().endsWith(".md")
function docPaths(list, base) {
  const out = []
  for (const p of Array.isArray(list) ? list : []) if (isDocPath(p)) out.push(resolve(base, p))
  return out
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

/**
 * 跑一次门（**非抛错**：两因之外的门自身异常收为 `error` 态，由调用面按 `scope` 消费）。
 * @param {{abs:string, cwd?:string, agent?:object, scope?:'writer'|'close', pending?:{section?:number, body?:string, recordView?:string}|null}} o
 *   `abs` = 目标批次档绝对路径（根解析用；**同时恒是判域一员**）；`agent._touchedFiles` = 触达记账；
 *   `pending` = 本次写入的段号与文本（`writer` 面强制集；缺省 ⇒ 无本次写入腿，`close` 面恒缺省）：
 *   `body` = 本次写进来的文本（`append` = 候选全文，直接作 `texts`；`edit` = `newText`，只用来报「已判几行」）；
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

  // 范围（判谁）：writer = 写者触达账 ∪ 本次写入（`append` 候选全文 ∥ `edit` 改后整档）∪ 批档自身；
  //                   close = 本批笔域集 = 触达账 ∪ 本批提交 diff ∪ 批档自身（**单集**——范围外的档不入判、不入报面）。
  const touched = docPaths(agent?._touchedFiles, base)
  const baseSha = close ? baseShaOf(selfAbs) : null
  const diff = baseSha ? committedDocs(root, baseSha) : { ok: false, base: root, files: [] }
  const diffDocs = docPaths(diff.ok ? diff.files : [], diff.base)

  const pendingBody = !close && pending && typeof pending.body === "string" && pending.body.trim() ? pending.body : null
  // 改写后的整档视图（`edit` 面）：它走 `texts` 交引擎（身份 = 批档本体），不落任何临时档。
  const viewBody = !close && pending && typeof pending.recordView === "string" ? pending.recordView : null
  const editRegion = viewBody === null ? null : replacementRegionOf(safeRead(selfAbs), viewBody)
  // 写段面两条腿的判定输入（§2.10.1 ∥ §2.10.2）——都走 `texts`、零临时档：
  //   `edit` —— 改后整档视图；
  //   `append` —— 候选全文（键 = 批档本体：身份 ∥ 豁免登记按它取，行号就是候选文本行号）。
  const candidate = pendingBody !== null && viewBody === null
  const inputBody = viewBody ?? (candidate ? pendingBody : null)
  // 判域内「哪一档是批档本体」：身份就是它（有判定输入时 `file` 仍是它）。
  const selfKey = pathKey(selfAbs)
  const closeDocs = [...touched, ...diffDocs, selfAbs]
  // 收口也按批起 sha 求本批改动区；没有基线时每档都是 unknown，由 blocks 向严整档阻断。
  const regions = close
    ? (baseSha
      ? touchedRegions(closeDocs, baseSha)
      : new Map(closeDocs.map((p) => [pathKey(p), { kind: "unknown", why: "§1 无有效批起 sha 记入行" }])))
    : touchedRegions(touched.filter((p) => pathKey(p) !== pathKey(selfAbs)), baseShaOf(selfAbs) ?? "HEAD")

  {
    // 三处调用各只说自己要判哪份档、哪些区间（§2.10.1 的表）：
    //   交付面（不在这里）—— 两个入参都不交；
    //   写段面 `append` —— `texts` = 候选全文（键 = 批档本体）、`zones` = 触达账各档的改动区（批档本体的键**不进**）；
    //   写段面 `edit` —— `texts` = 改后整档视图、`zones` = 本次替换区经扩区表后的区 ∪ 触达账各档的改动区（与 `append` 同一张表）；
    //   收口门 —— `zones` = 逐档 `git diff -U0` 的 `+` 侧区间经扩区表后的区（已落盘，不交 `texts`）。
    const docs = close ? closeDocs : [...touched, selfAbs]
    const texts = inputBody === null ? undefined : new Map([[selfAbs, inputBody]])
    // `edit` 与 `append` 交**同一张扩区表**（差别只在批档本体那一键：`edit` 另交替换区）。区表缺键在引擎侧的含义是
    // 「该档整档即本次」（§2.10.1 逐档语义），而 `edit` 改得动批档的既有行、改不动触达账各档的存量债 ⇒
    // 触达账各档必须有自己的区，否则一档与本笔无关的存量死锚就以逐条 `✗` 进明示面（DD-217 要求只出计数）。
    // 触达账各档的区先铺、批档本体那一键**最后落**：自档的键因此永不被别处的表覆盖（今天的 `regions` 已滤掉自档，
    // 这一次序让「自档判替换区」这条不变式就在这一行上成立，不靠上游那行 filter 记着）。
    const zones = close
      ? zoneTablesOf(regions, closeDocs)
      : viewBody !== null
        ? new Map([...(zoneTablesOf(regions, touched) ?? []), [selfAbs, judgeZones(viewBody.split("\n"), [editRegion])]])
        : zoneTablesOf(regions, touched)
    const res = runDocCheck(root, { mode: "gate", docs, docsSource: close ? "explicit" : "session", texts, zones })
    const basis = !close
      ? (pendingBody ? "pending+touched" : "touched")
      : diff.ok ? "touched+diff" : "touched（基 sha 未定）"

    // 批档自身（或它的改写后视图）恒在判域（在盘即入）⇒ 判域恒非空，「0 档」这一形不可达。不成立 = 构造异常 ⇒ fail-closed，不产 PASS。
    if (!res.checkFiles.some((p) => pathKey(p) === selfKey)) {
      return errorState("DOC-CHECK GATE: ERROR（判域为空——批档自身应恒在判域）", { count: res.checkFiles.length, k: 0, basis })
    }

    // 读面（读不到 ≠ 干净）：判域里有在盘但读不到的档 ⇒ 这一轮**判不出**，给 `ERROR` 而不给 `PASS`。
    // 不并入 `hits`（它不是命中，是一个没做完的判定）；两 scope 按既有 ERROR 语义消费：`close` fail-closed 拒收口，
    // `writer` 放行 + 回执明示（子代理无法重启会话，卡死写账 = 无账之笔）。口径 = §3.20「读面」块 ∥ K6。
    if (Array.isArray(res.unreadable) && res.unreadable.length) {
      const first = `DOC-CHECK GATE: ERROR（读不到 ${res.unreadable.length} 档）`
      const named = res.unreadable.map((p) => relative(root, p).replace(/\\/g, "/")).join(" ∥ ")
      return { ...errorState(first, { count: res.checkFiles.length, k: 0, basis }), report: `${first}\n未判（在盘但读不到）：${named}` }
    }
    // 命中位置的显示形（identity = 批档本体，`§2.10.2`）：
    //   `edit` ∥ 收口面 —— 命中行本就是该档的行号（`<档>:<行>`）；
    //   `append` 面 —— 判定输入是候选文本，行号是**候选文本里的行号**，不译成批档坐标，
    //   渲染成「<档> 候选文本第 N 行」（行号只有一个用途：让作者定位到自己手上那份文本）。
    const atOf = (h) => {
      const shown = relative(root, h.file).replace(/\\/g, "/")
      return candidate && typeof h.line === "number" && pathKey(h.file) === selfKey
        ? `${shown} 候选文本第 ${h.line} 行`
        : `${shown}:${h.line}`
    }
    const rawHits = hitEntries(res, root, atOf, srcOfOf({ selfAbs, inputBody }))
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
      // 候选文本的行号不是批档坐标 ⇒ 不给它标段号与作者（那就是一次没人要的行号换算）。
      const attr = inSelf && !candidate ? attributionOf(selfSrc, e.line, authors) : ""
      return { ...e, inSelf, text: attr ? `${e.text}${attr}` : e.text }
    })
    // ① 面（**三层腿分开判**——批档自身腿的判集单源 = `BATCH-RECORD.md` §4.9 门 ④ 判集两句）：
    //   · 批档自身：`append`（有候选文本）⇒ 引擎判的就是候选全文，进来的就是本次——照拒；
    //     `edit`（有视图）⇒ 引擎已按判定区切过（`zones`，§2.10.1），进来的就是本次——锚类与段类都拒；
    //   · 触达账 ⇒ **改动区内**的命中当场拒（与本次候选同权）；区外存量只入回执计数；改动区未定 ⇒ 零强制 + 明示。
    // ② 面：本批改动区内命中即 K（引擎已按 `zones` 切过）；纯删扩进来的存活旧命中须先过基线映射。
    const pureDeleteStock = close ? pureDeleteStockEntries(labeled, root, regions) : new Set()
    const isBlocked = blocks({ regions, close, pureDeleteStock, viewBody, candidate })
    const disclosed = labeled.filter((e) => !isBlocked(e))
    const forced = labeled.filter(isBlocked)
    const k = forced.length
    const forcedLines = forced.map((e) => e.text)
    // 存量读数 = 本门重分类掉的那批（收口面纯删基线映射 ∥ 写段面区外）**加上**引擎交出的区外命中（§2.10.1 的 `stockHits`）——
    // 两边各是一批，相加才是这一轮真正「不属本次」的条数，不重复（引擎那批根本没有进 entries）。
    const stockCount = disclosed.length + (res.stockHits?.length ?? 0)
    const disclosedLines = disclosed.map((e) => e.text)

    // 强制集按腿分列（首行括号里那几段）：批档本体那一路按面取标签——
    //   `append` = 候选文本（引擎判的就是整份候选）；`edit` = 本次替换区。两件事不得叫同一个名字。
    const candidateHits = forced.filter((e) => e.inSelf && candidate)
    const recordHits = forced.filter((e) => e.inSelf && viewBody !== null)
    const touchHits = forced.filter((e) => !e.inSelf)
    let first = "DOC-CHECK GATE: PASS"
    if (k >= 1) {
      if (close) {
        first = `DOC-CHECK GATE: REFUSED（命中 ${k} 条）`
      } else {
        const parts = []
        if (candidateHits.length) parts.push(`候选文本（${classifyCounts(candidateHits)}）`)
        if (recordHits.length) parts.push(`批档替换区（${classifyCounts(recordHits)}）`)
        if (touchHits.length) parts.push(`触达账改动区（${classifyCounts(touchHits)}）`)
        first = `DOC-CHECK GATE: REFUSED（命中 ${k} 条——${parts.join(" · ")}）`
      }
    }

    // 附加行（不静默面）：命中行与引擎报面不同序 / 指针读数 / 收口面取不到基 / 拒后零字节 / 本次文本已判行数。
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
      notes.push(viewBody !== null
        ? "本次写入文本尚未落盘——一个字没写（档字节逐字不变：目标区间以外逐字不变）"
        : "候选文本尚未落盘——一个字没写（档字节逐字不变：段号不前进、轮次 N 不推进；先改掉命中再写同一笔）")
    }
    if (!close && k === 0 && pendingBody) {
      const segLabel = Number.isInteger(pending?.section) ? `§${pending.section}` : "本段"
      const lineCount = pendingBody.split("\n").length
      notes.push(viewBody !== null
        ? `批档替换区（${segLabel}）${lineCount} 行已判——段长类只判这一段；锚类只判本次区表（替换区 ∪ 触达账各档改动区；区外命中出存量读数）`
        : `候选文本（${segLabel}）${lineCount} 行已判——强制集只有这一段（别人的段字面改不动，不进你的拒面）`)
    }
    // 存量读数句（字面单源 = 引擎的 `STOCK_LINE`）：引擎交出的区外命中 + 本门重分类掉的那批（纯删基线映射 ∥ 写段面区外）。
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
    // 声明面坏而门照判：manifest 非法 JSON 时判据参数 = 引擎内置常量、不读声明面 ⇒ 行为本身正确
    // （比短路成「未跑」强——一份坏档不该把整个门关掉）。但那一支过去**不点名**，收口人看不出
    // 声明面已坏；与 `missing` 支「未跑（本项目无声明面）」的明示不对称 ⇒ 两种坏法一种明示一种沉默。
    if (!read.ok && read.reason === "invalid") {
      notes.push("声明面不可解析（`PROJECT-MANIFEST.json` 非法 JSON）—— 判据参数为引擎内置常量，本轮仍已判")
    }

    // 处置块只看**段**类命中——设计口径是「只要存在该类命中就出」，没按「谁写的」切；
    // 仅锚 ∥ 仅行命中不得叫人对段落动手（叫错方向比不给方向贵）——类名单源 = 引擎的 `DOC_CLASS`。
    // 只看**强制集**：区外存量一条也没摆进拒面，叫写者对一段没露出过的文字动手 = 指错方向。
    const disposePara = forced.some((e) => e.clazz === DOC_CLASS.para)
    return {
      state: k >= 1 ? "refused" : "pass",
      first,
      report: composeReport({ first, forcedLines, disclosedLines, notes, disposePara }),
      hitLines: forcedLines,
      noteLines: notes,
      // 处置面分形用（拒串读它：段命中 ⇒ 五行块 ∥ 仅锚·仅行 ⇒ 照旧一句处置）
      disposePara,
      range: { count: res.checkFiles.length, k, basis },
    }
  }
}
