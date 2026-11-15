/**
 * agent-tools/batch-closeout.mjs — 收口面的四道判据与回执（从 `batch-lifecycle.mjs` 拆出，2026-10-27）。
 *
 * 权威规格 = `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` §2.6（四道门）∥ §2.11（收口前显式处置）；
 * 链门的原文契约 = `docs/core/design/BATCH-RECORD.md` §4.18-A。
 *
 * 本档承载三件（都不碰 fs 写、只读与判）：
 * ① `assertCloseoutGates` —— 收口两路（`close` ∥ `status` 写 `§1 已收口`）共调的判序：
 *    链完整性门（§2/§3/§4/§6 各段须有内容——`不适用` 声明机制已退役）→ **`§3` 状态词臂**（无条件 = `评审通过`）
 *    → 本批批内单测档门（`TESTING.md` §3.5）→ 文档机检门（判据 = `docs/core/design/DOC-CHECK.md` §1–§6；
 *    调用点 = 同档 §7「落点」三处之一「批档写入与收口」）→ **档位臂**
 *    （`batch-tier-gate.mjs` 的 `assertTierPlan`——同一臂两节，一条拒文：本批改动面里在盘的码档，§2 必须有
 *    它的行读数且与批起快照一致（判法 ∥ 拒文 = `docs/core/design/DOC-CHECK.md` §8）；其中实测越了设计时线的
 *    源档，§2 还必须有它的正向形分拆方案。两节判的都是**记录缺件**，不是代码长短；语义单源 =
 *    `docs/core/standards/CODE-TIER.md` §2 ②，位次 = 本档的判序第 ⑤ 臂）。
 * ② `assertSectionFiveGate` —— §5 写入门（段序门）：两条合取——① `§3` 状态行 = `评审通过`；② `§3` 最近一轮
 *    轮次块自己携 pass 裁定行（块 = `lastRoundBlock`；裁定读数 = 骨架档 `verdictGapOf`，`append §3` 写入闸与
 *    签发面读同一个函数）。旧的第一条旁路（`§1` 声明 §3 不适用）已随本批删除：实现只发生在评审之后，没有例外段。
 * ③ `reanchorReceiptLine` —— 收口重锚回执三行（§2.11 逐字）。
 * ④ **全归档补关面**（§4.18-C · `docs/core/design/LEDGER.md` §11.2）：拒文 `repairBlockedError`、档面
 *    追记行 `repairTraceLine` 与回执段 `repairReceiptLine`。补关只跳过收口门的 ①②⑤ 三臂，③④ 与写序、
 *    凭证消费、完成清单预检全部保留——「行全归档」不是「环节全免」；分派判据住 `batch-ledger-view.mjs`。
 *
 * 为什么 §3 内容臂留着（不换成只判状态词）：内容臂守的是「段里真跑过」，状态词臂守的是「跑的结论是
 * pass」——换掉内容臂 = 门被放宽（一段空着但状态词对就过），那正是本批要堵的洞。所以是**加**一条臂。
 *
 * 依赖单向（KD-4）：`skeleton ← closeout ← bind ← reopen ← lifecycle`——本档不 import lifecycle。
 */
import { execFileSync } from "node:child_process"
import { readFileSync } from "node:fs"
import { isAbsolute, relative, resolve } from "node:path"

import { owningProject } from "../manifest.mjs"
import { batchProjectRoot } from "./batch-paths.mjs"
// 取材面的判据一族（比较键 ∥ 显示式 ∥ 三处判据）——依赖单向：本档 import 它，它不 import 本档。
import {
  displayRelOf, neighborListClaims, selfAttributedOf, sessionClaimsOf, surfaceKey,
} from "../agent/batch-changed-surface.mjs"

import {
  countRoundBlocks, inapplicableDeclarationError, lastRoundBlock, malformedInapplicableLine, readSectionStatusWord,
  sectionContentState, STATUS_WORDS, verdictGapOf,
} from "./batch-skeleton.mjs"
// 裁定读数 = 骨架档 `verdictGapOf` 一个函数（设计档 §2.6.1「判据单源」）：`§5` 门判据 2 与签发面判的是同一份
// 回执文本，组合序各写一遍必然一处变一处不变。本档不再 import 两条裁定锚——锚与序都在那个函数里。
import { assertUnitTestFilesCleared } from "./batch-unit-test-gate.mjs"
import { assertTierPlan } from "./batch-tier-gate.mjs"
import { baseShaOf, gateRefusalMessage, runBatchGate } from "./batch-gate.mjs"
// 本批提交 diff 腿（现成的改动面——不另造一套登记）：`committedDocs` 与本档无依赖方向冲突。
import { committedDocs } from "./batch-regions.mjs"

/** 链判段集（§2/§3/§4/§6——§5 段号豁免恒不判；§1 主 agent 自述段不设前置）。 */
const CHAIN_SEGMENTS = [2, 3, 4, 6]

/** §6 空闸拒句（#422①——空 ⇒ 拒 + 提示先写 §6；防「append 被拒 ⇒ close 照常 ⇒ §6 永久为空」复发）。
 *  **§6 为唯一缺段时**拒串取本函数（§4.18-A J2——「非空门」文案逐字零回归）；判据本体 = 单源谓词
 *  `sectionContentState(src, 6)`。 */
function emptySectionSixError() {
  return "batch: §6 收口段为空（non-empty gate）— close refuses: the closeout section (§6) has no content, and closing would freeze the record with that section permanently empty. Write the section first (append §6: the closeout / verification summary), then call close again. Nothing was written."
}

/** 链门拒绝句（§4.18-A J1——缺段非仅 §6 时；`missing` = 点名串，
 *  形如 `§2 / §3 / §4`——按段号升序列出）。不再提声明路：机制已退役，提它就等于又给一条可照抄的路。 */
function closeoutChainError(missing) {
  return "batch: 收口链未跑完（closeout chain gate）— close refuses: the record's closeout chain has not run, and closing would freeze it that way. " +
    `Missing: ${missing}. Each named section must carry its own content — the \`不适用\` declaration is retired (every batch needs its design, its review and its approval). ` +
    "§6 must carry its verification. Nothing was written."
}

/** `§3` 状态词臂拒句（设计档 §2.6 `R-G1` 逐字形）：链门已过、只剩评审结论没到时出这一条。
 *  `value` = 读到的状态词（缺失 ⇒ `（无状态行）`）。本臂无条件——没有「声明不适用」这条旁路。 */
function closeoutS3Error(value) {
  return "batch: 收口链未跑完（closeout chain gate）— close refuses: " +
    `§3 状态行 = ${value}，须 = 评审通过（评审须真跑过并给 pass）。Missing: §3. Nothing was written.`
}

/**
 * 链完整性门（§4.18-A——**收口前置**）：判据 = §2 / §3 / §4 / §6 每段须 `sectionContentState(src, seg) !== "empty"`
 * （有内容）；不满足 ⇒ throw 并点名缺段（J1；§6 为唯一缺段时 = J2 旧串逐字）。门不判内容质量、
 * 不做自动修复、不判 §1 / §5。声明行扫描先行（J3——那类行现在一律拒，不静默当作无声明）。
 * @param {string} src — 档全文（写盘前只读）
 */
export function assertCloseoutChainComplete(src) {
  const badDecl = malformedInapplicableLine(src)
  if (badDecl !== null) throw new Error(inapplicableDeclarationError(badDecl))
  const missing = CHAIN_SEGMENTS.filter((n) => sectionContentState(src, n) === "empty")
  if (missing.length === 0) return
  if (missing.length === 1 && missing[0] === 6) throw new Error(emptySectionSixError()) // J2——零回归
  throw new Error(closeoutChainError(missing.map((n) => `§${n}`).join(" / "))) // J1
}

/**
 * 收口两路共调判序（设计档 §2.4–§2.6 · 2026-10-27 四道门 + 2026-11-11 第 ⑤ 臂）：
 *   ① 链完整性门（§2 / §3 / §4 / §6 各段须有内容）
 *   ② **`§3` 状态词臂**：`§3` 状态行 = `评审通过`（无条件）
 *   ③ 本批批内单测档门（仍在盘 ⇒ 拒——零留存的结构兜底）
 *   ④ 文档机检门（REFUSED ∥ ERROR ⇒ 拒）
 *   ⑤ **档位臂**（`batch-tier-gate.mjs` 的 `assertTierPlan`）：两节一趟判完，一条拒文——
 *      ① 读数支：本批改动面里在盘的码档，§2 机读清单那一行须带行读数且与**批起快照**一致；
 *      ② 越线方案支：其中实测越了设计时线的档，§2 须带它的正向形分拆方案。无在盘码档就两节都不启动
 *      （**§2 缺块不是拒因**）；判的是**记录缺件**，不是代码长短（代码 > 800 仍由 ④ 那条判）。
 *      基线内容由本档交进去（`baseTextReaderOf`——门自己不读 git）。
 * 位次 = 既有拒因之后、写盘之前（任一被拒 ⇒ 档字节不变）。返回 `④` 的门结果供回执拼行（`null` = 未跑）；
 * `mode === "normal"` 时同一笔把 ⑤ 的取材读数挂上 `changedSurface`，回执行从它取「只报不判」的那一半。
 * @param {{abs:string, cwd:string, agent:object, src:string, action:"close"|"status", mode?:"normal"|"repair"|"supersede"}} o
 *   `src` = 调用方已读的写盘前全文（判据与写盘读同一份字节，不二次读盘）。
 *   `mode` = **哪一条收口边在跑**（三值闭集；跳过集由这一处决定）：
 *   `normal` = 正常收口（五臂全跑）∥ `repair` = 全归档补关（§4.18-C）∥ `supersede` = 被取代的收口（§4.18-D）。
 *   `repair` ∥ `supersede` 两条都**只跳过 ①②⑤ 三臂**，③④ 照跑——补关与取代按定义没有可判的 §2，
 *   而单测档门与机检门在那两条边上照旧生效；分派判据不在这里
 *   （补关住 `batch-ledger-view.mjs` 的一致性预读，取代由 `batch-supersede.mjs` 自己持），本档只承接
 *   「已判定走哪条边」之后的判序。
 * @returns {object|null} 文档机检门结果
 */
export function assertCloseoutGates({ abs, cwd, agent, src, action = "close", mode = "normal" }) {
  if (mode === "normal") {
    assertCloseoutChainComplete(src) // ① 链门（§2 / §3 / §4 / §6 各段须有内容）
    // ② §3 状态词臂（无条件）：评审须真跑过并给 pass。旧旁路「§1 声明 §3 不适用」已随声明机制退役删除。
    const s3 = readSectionStatusWord(src, 3)
    if (s3 !== STATUS_WORDS[3].done) throw new Error(closeoutS3Error(s3 ?? "（无状态行）"))
  }
  assertUnitTestFilesCleared(abs, action) // ③
  const gate = runBatchGate({ abs, cwd, agent, scope: "close" }) // ④
  if (gate.state === "refused" || gate.state === "error") throw new Error(gateRefusalMessage(gate, action))
  // ⑤ 档位臂：与 ①② 同属 `mode === "normal"` 组（`repair` ∥ `supersede` 按定义没有可判的 §2）。
  if (mode === "normal") {
    const root = tierRootOf(abs, cwd)
    const surface = changedSurface(abs, root, agent)
    assertTierPlan(src, root, surface.judged, baseTextReaderOf(abs, root))
    // 只报不判的那一半随门结果交回调用面（同一笔取材，不取第二次——两次取才可能各说各的）。
    gate.changedSurface = surface
  }
  return gate
}

/**
 * 本批改动面（**取材 = 现成两面，按批判**；判据单源 = 设计档 §4.18.1）——交绝对路径，供档位臂量长度。
 *
 * 两腿，**判据一在前**：
 *  判据一 = 写时归属（记账面记下的「这笔写服务哪一批」，取自 `agent._batchAttribution`）；
 *  判据二 = 提交 diff，按认领收窄：减去**别的批已认领**的档。认领两源对批档状态的要求不同——观测源
 *    （本会话归属表里别的批档）不看那一批收没收口；计划源（盘上批档的 §2 机读清单）只给可读地未收口的批。
 * 三条合成规则：
 *  - 归属表里属本档 ⇒ **判**（一条直接的写记录不被另一个批的计划推翻）；
 *  - 归属表里没有它、认领成立 ⇒ **不判，只报**（收口回执点名它，请人确认是否本批）；
 *  - 两腿都不说话 ⇒ **判**（认领不成立就当它是本批的，fail-closed）。
 * 触达账条目本就是绝对路径（写工具记账）；提交清单以 **git 仓根**为基，故按 `committedDocs` 回的 `base`
 * 还原成绝对路径——项目根住大仓子目录时也不丢条目。基 sha 未定 ⇒ 只以触达账为准（diff 腿不启动）。
 * @returns {{root:string, judged:string[], reported:string[]}} `judged` = 交给档位臂判读数的档；
 *   `reported` = 认领成立、只进回执行的档（绝对路径）
 */
function changedSurface(abs, root, agent) {
  const touched = Array.isArray(agent?._touchedFiles) ? agent._touchedFiles : []
  const baseSha = baseShaOf(abs)
  const diff = []
  if (baseSha !== null) {
    const committed = committedDocs(root, baseSha)
    for (const f of committed.files ?? []) diff.push(resolve(committed.base, f))
  }
  // 同一档两腿都会给（触达账记过又提交过）：按比较键去重，留首次出现的原形。
  const entries = new Map()
  for (const p of [...touched, ...diff]) {
    if (typeof p !== "string" || p === "") continue
    const key = surfaceKey(p)
    if (!entries.has(key)) entries.set(key, p)
  }
  const mine = selfAttributedOf(agent, abs)
  // 认领只在真有「不属于本档」的条目时才去问（会话归属是内存读，盘上清单那一路每个邻批各两次 git 调用）。
  const claimed = new Set()
  if ([...entries.keys()].some((k) => !mine.has(k))) {
    for (const key of sessionClaimsOf(agent, abs)) claimed.add(key)
    for (const key of neighborListClaims(root, abs).keys()) claimed.add(key)
  }
  const judged = []
  const reported = []
  for (const [key, p] of entries) {
    if (mine.has(key) || !claimed.has(key)) judged.push(p) // 判据一说了算 ∥ 两腿都不说话
    else reported.push(p) // 只报不判
  }
  return { root, judged, reported }
}

/**
 * `[changed surface]` 收口回执段（判据单源 = 设计档 §4.18.1「被别的批认领的档只报不判」）：这些档不判读数，
 * 但**点名它们**，请人确认「是否本批」——判据收窄了，这件事仍然看得见。
 * 认领的来源如实写成两源（本会话归属表 ∥ 盘上在途批的 §2 清单）：观测源不按状态筛，已收口的邻批也能靠它认领，
 * 所以串里不写「在途」那一个限定——回执说的必须是它真做了的那件事。
 * 承载面 = 收口那一笔返回给调用方的回执文本（与 `[doc-check gate]` ∥ `[ledger reanchor]` 同面）；
 * 读者 = 收口这一笔的调用者，他正是决定「这些档算不算本批」的人。不写进批档、不进台账：它不是规范，是一次收口的读数。
 * @param {{root?:string, reported?:string[]}|null} surface — `assertCloseoutGates` 交回的取材读数
 * @returns {string} 以换行起头；没有被认领的档 ⇒ 空串
 */
export function changedSurfaceReceiptLine(surface) {
  const rows = surface?.reported ?? []
  if (rows.length === 0) return ""
  const items = rows.map((p) => `\n  ${displayRelOf(surface.root, p)}`).join("")
  return `\n[changed surface] 只报不判：${rows.length} 档被别的批认领（本会话归属表 ∥ 盘上在途批的 §2 清单），本批没判它们的读数——确认是否本批${items}`
}

/** 仓根（§2 机读清单的第一列是仓根相对路径）——解析式与文档机检门同式
 *  （`batch-gate.mjs` 的 `evaluate`：`owningProject(批档) ?? batchProjectRoot(cwd)`）：
 *  两臂判同一批档、同一套相对路径，根不同就会一处判到档、一处判到空。 */
function tierRootOf(abs, cwd) {
  const base = resolve(cwd)
  return owningProject(resolve(abs), base) ?? batchProjectRoot(base)
}

// ─── 读数支的基线内容（本档读 git 的唯一一处：门自己不读，内容由这里交进去）──────────────────

/** 一次 git 调用（`-C <cwd>`）：失败不抛、返 `null`——分流判据在调用方（对象在不在 ∥ 路径在不在）。 */
function gitRun(cwd, argv) {
  try {
    return execFileSync("git", ["-C", cwd, ...argv], {
      encoding: "utf8", stdio: ["ignore", "pipe", "ignore"], timeout: 8000,
    })
  } catch {
    return null
  }
}

/** 档在 git 树里的路径：快照的树以 **git 仓根**为基，§2 清单以**项目根**为基——项目根住大仓子目录时
 *  两基不同（解析式与 `committedDocs` 的 `base` 同一条）。 */
function gitPathOf(top, root, relPath) {
  const abs = isAbsolute(relPath) ? relPath : resolve(root, relPath)
  const rel = relative(top, abs).replace(/\\/g, "/")
  return rel === "" || rel.startsWith("../") || isAbsolute(rel) ? String(relPath).replace(/\\/g, "/") : rel
}

/**
 * 读数支的基线取值函数（判法单源 = `docs/core/design/DOC-CHECK.md` §8「两个失败怎么分开」）：
 * `git show <sha>:<档>` 对「快照里没这一档」与「对象读不到」报的错同形，照错文分流会把每个有新建档的批整批拒
 * （`新` 正是那条判据的地基）。故按三步问、各问一件：对象在不在 ⇒ 路径在不在 ⇒ 取内容。
 * **拒绝条件只有一条 = 记入行的 sha 指向的对象读不到**（`undefined`）；`refs/thincoder/baseline/<批档名>`
 * 在不在不进判据——ref 只负责让那个对象不被回收，不是取内容的入口。
 * @param {string} abs — 批档绝对路径（记入行 `批起 sha` 的取法单源 = `baseShaOf`）
 * @param {string} root — 项目根（清单第一列的基）
 * @returns {(relPath:string) => string|null|undefined} 串 = 该档在快照里的内容 ∥ `null` = 快照里没有这一档 ∥
 *   `undefined` = 基线不可判（门按整批一条拒）
 */
function baseTextReaderOf(abs, root) {
  const sha = baseShaOf(abs)
  if (sha === null) return () => undefined
  const top = (gitRun(root, ["rev-parse", "--show-toplevel"]) ?? "").trim() || root
  let commitReadable = null // 一次收口只问一遍对象在不在
  return (relPath) => {
    if (commitReadable === null) commitReadable = gitRun(top, ["cat-file", "-e", `${sha}^{commit}`]) !== null
    if (!commitReadable) return undefined
    const gitPath = gitPathOf(top, root, relPath)
    if (gitRun(top, ["cat-file", "-e", `${sha}:${gitPath}`]) === null) return null
    const text = gitRun(top, ["show", `${sha}:${gitPath}`])
    return text === null ? undefined : text // 取不到内容同样按「基线不可判」，不静默读成 `新`
  }
}

/** 读档（本档只读一面——写盘归 lifecycle 与 bind；读错上抛不伪装）。 */
export function readCloseoutSource(abs) { return readFileSync(abs, "utf8") }

// ─── 全归档补关（§4.18-C · `docs/core/design/LEDGER.md` §11.2）────────────────────────────

/** 补关被其它半状态拦住（§4.18-C「其它不一致不放行」）：全归档但还命中 `header-row-missing` 等任一读形 ⇒
 *  拒，**逐项列出全部半状态**并指回 `check` 按各出路先修——归属错误不得被冻成历史。
 *  （无逐字原文；语域照 `batch` 族拒句：点名 + 下一步 + `Nothing was written.`）
 *  @param {{name:string, rows:number[]}[]} halfStates — `batchLedgerConsistency` 的 `halfStates`
 */
export function repairBlockedError(halfStates) {
  const list = halfStates.map((h) => `${h.name}${h.rows?.length ? ` #${h.rows.join(" · #")}` : ""}`).join("；")
  return "batch: 全归档批的补关被拒（ledger repair blocked）— the record's ledger rows are all archived, but the " +
    `consistency read hits more than one half state, so freezing would cement a ledger mismatch as history. Half states: ${list}. ` +
    "Run batch({action:\"check\"}) and follow each exit, then retry close. Nothing was written."
}

/** 补关在档面留的追记行（逐字 = `docs/core/design/LEDGER.md` §11.2；载体 = `appendLineToSection`——只追加
 *  不改写，EOL 取 §1 段头行）。为什么不能只靠瞬时回执：四个段均空、状态行又已收口，不写一行就没有人
 *  看得出这个档为何能冻结。 */
export const repairTraceLine = (date, rows) => `**补关记录**：${date} · 行集全归档（${rows} 行）· §3/§4/§6 未补写 · 操作者 = 主 agent`

/** 补关回执段（§4.13「本档特有面」——补关成功另出 `[ledger repair]`）：把「零行改写」说成事实，
 *  不把零行改写报成新结算。`null`（正常收口）⇒ 无该段。
 *  @param {{rows:number, date:string}|null} result */
export function repairReceiptLine(result) {
  if (!result) return ""
  return `\n[ledger repair] 全归档补关：本批 ${result.rows} 行全归档（已核销 / 已废弃）· 台账行零改写 · §3/§4/§6 未补写 · §1 段尾已追加一行 补关记录（${result.date}）`
}

/**
 * 判据 2 的块内裁定读数（设计档 §2.6「pass 谓词」）：`null` = pass；否则 = 拒文括注里的那一格。
 * 组合序不在本档——一律取骨架档 `verdictGapOf`（判据单源，设计档 §2.6.1）：写面、`§5` 门与签发面三处同读
 * 一个函数，锚与顺序都只有那一份。本函数只留名字：拒文（`R-G2b`）与设计档用的就是这个符号，读者按它对账。
 * 块 = `null`（段内无块）⇒ `verdictGapOf(null)` = 「无裁定行」，与改前同值。
 * @param {string|null} block — `lastRoundBlock(src, 3)` 的返回形
 * @returns {string|null} 拒文括注值 ∥ `null`（块自己说了 pass）
 */
function lastRoundVerdictGap(block) {
  return verdictGapOf(block)
}

/** 判据 2 拒文（设计档 §2.6 `R-G2b` 逐字；`blocks` = 段内轮次块数——无块时取 0）。
 *  `gap` = `lastRoundVerdictGap` 的非空返回形，落进括注的裁定格。 */
function sectionFiveVerdictBlockError(src, gap) {
  const blocks = countRoundBlocks(src, 3)
  return "batch: §5 append refused — the last §3 round block carries no pass verdict " +
    `(§3 最近一轮轮次块 = 第 ${blocks} 轮，块内裁定 = ${gap}). A pass means that block carries a \`VERDICT: pass\` line and no changes-required line — ` +
    "a round that does not state a pass is not a pass: append the verdict line to that block (`VERDICT: pass`)，或按裁定行重跑评审。Nothing was written."
}

/**
 * §5 写入门（段序门 · 设计档 §2.6）：实现发生在评审通过之后，序在这里才判得出真假。
 * 判据 = 两条合取（**没有第一条的旁路**：`§1` 声明 §3 不适用已随声明机制退役——实现只发生在评审之后），
 * 先判状态词、过了再判块（状态词不过时拒文已足以说明，不必再报块）：
 *   ① `§3` 状态行 = `评审通过`（拒文 `R-G2`）；
 *   ② `§3` **最近一轮轮次块自己携 pass 裁定行**（拒文 `R-G2b`）——评审写了一笔 `§3` 却不带任何裁定行时，
 *      上一轮的 `评审通过` 仍是字面字，只判 ① 就会放行。② 只问一个可读的事实「门所依赖的块自己有没有
 *      说结论」，不猜意图（补记 ∥ 隐性打回的处置是同一条）；`§3` 无任何轮次块 ⇒ ② 不成立、照拒——
 *      真跑过的 pass 必落本轮块，无块即无 pass 可依。
 * 修正轮在 §3 已 pass 之后追加 §5，末块携 pass 裁定 ⇒ 两判据当场成立。`status` 单写不再足以开 `§5`（只置状态词、不落一块携 pass 裁定的
 * 轮次块 ⇒ 照拒）。
 * @param {string} src — 写盘前的档全文
 */
export function assertSectionFiveGate(src) {
  const s3 = readSectionStatusWord(src, 3)
  if (s3 !== STATUS_WORDS[3].done) {
    throw new Error("batch: §5 append refused — the implementation section opens only after the design review passed " +
      `(§3 状态行 = ${s3 ?? "（无状态行）"}，须 = 评审通过). Nothing was written.`)
  }
  const gap = lastRoundVerdictGap(lastRoundBlock(src, 3))
  if (gap !== null) throw new Error(sectionFiveVerdictBlockError(src, gap))
}

/** 收口重锚回执段（设计档 §2.17 收口步序 7）——**逐行点名每一枚被结清的行，两种起点各一行**：
 *  `<#id> 在途 → 待核销 → 已核销` 与 `<#id> 待核销 → 已核销`。后者是「已做完、没结账」的行被静默结清，
 *  不点名就平账了（口径同 `docs/core/design/LEDGER.md` §3.3 安全阀）。
 *  台账失败不再走本段：失败 ⇒ 补偿回滚档 + 抛拒（`closeLedgerFailedError` / `closeHalfStateError`），
 *  收口那次调用根本没有回执。`conditioned` = 本批未动行改挂条件的既有段。
 * @param {{settled?:Array, conditioned?:Array}|null} result — `ledgerReanchorBatch` 返回形
 */
export function reanchorReceiptLine(result) {
  if (!result) return ""
  const face = (r) => `#${r.id} 「${r.title}」`
  const lines = (result.settled ?? []).map((r) =>
    `\n[ledger reanchor] ${face(r)} ${r.from === "在途" ? "在途 → 待核销 → 已核销" : "待核销 → 已核销"}`)
  const conditioned = result.conditioned ?? []
  if (conditioned.length) {
    lines.push(`\n[ledger reanchor] 本批未动行 → 条件 ${conditioned.length} 行：${conditioned.map(face).join("；")}` +
      " —— 已落 trigger = 条件 + 复启句，由下一批接手")
  }
  return lines.join("")
}

/** 收口台账失败拒文（设计档 §2.17 收口步序 6 第一条串，逐字）：档已回滚到写前字节 ⇒ 可原样重试。 */
export function closeLedgerFailedError(cause) {
  return `batch: close failed — 台账事务未提交（${cause}）；批档已回滚到写前字节，可原样重试。Ledger: no committed change from this call (it never reached COMMIT).`
}

/** 收口补偿也失败拒文（同节第二条串，逐字——**不得复用第一条**：第一条声称已回滚，此时事实相反）：
 *  批档可能仍为已收口；是否半状态由 `check` 按实际行集判，全归档终态不重试，其余残态先修账再重开。 */
export function closeHalfStateError(abs, cause, rollbackCause) {
  return `batch: close failed — 台账事务未提交（${cause}）；批档回滚也失败（${rollbackCause}）——批档可能仍为已收口。` +
    `Read it with batch({action:"check", path:"${abs}"}); if consistent=false, repair the ledger and reopen before retrying; if consistent=true, the batch is already closed and settled — do not retry.`
}

/** `[ledger consistency]` 行（设计档 §2.17「暴露面两处」第二条）：`close` ∥ `reopen` ∥ `status` 回执末尾
 *  **恒带一行**——一致 ⇒ `一致（本批 N 行）`；不一致 ⇒ 逐项点名 + 出路。查询面单源 =
 *  `batchLedgerConsistency`（本档只格式化，不另判）。 */
export function consistencyReceiptLine(result) {
  if (!result) return ""
  // 读不出（台账库坏 / 打不开）⇒ 如实点名，**不吞成「一致」**：一条说「一致」却根本没读的读数，
  // 比没有这行更坏——它正是本批要消掉的静默。
  if (result.error) return `\n[ledger consistency] 读不出（${result.error}）——半状态面不可用，按批档 §1 与台账行各自的状态自行核对`
  if (result.consistent) return `\n[ledger consistency] 一致（本批 ${result.rows.length} 行）`
  const items = result.halfStates.map((h) =>
    `\n  ${h.name}${h.rows.length ? ` #${h.rows.join(" · #")}` : ""}——出路：${h.exit}`)
  return `\n[ledger consistency] 不一致（本批 ${result.rows.length} 行）：${items.join("")}`
}

/** `batch({action:"check"})` 回执（设计档 §2.17「暴露面两处」第一条）：逐行打印查询面读数——`record`
 *  三态、行集逐行 `{id, status, trigger, title}`、档头号集 `{id, inLedger}`、半状态项与出路、`consistent`。只读动作，零写。 */
export function checkReceipt(result, abs) {
  const lines = [
    `batch: ledger consistency — ${abs}`,
    `  record = ${result.record} · rows = ${result.rows.length} · consistent = ${result.consistent}`,
    ...result.rows.map((r) => `  #${r.id} ${r.status} 「${r.title}」 · trigger = ${r.trigger ?? "—"}`),
    ...(result.headerRows ?? []).map((h) => `  headerRows #${h.id} inLedger = ${h.inLedger}`),
  ]
  return lines.join("\n") + consistencyReceiptLine(result)
}

/** 新事理由的 `evidence` 前缀（单源 = `docs/core/design/LEDGER.md` §6.3「参数面」；写入侧由
 *  `thincoder-core/ledger-write-ops.mjs` 的 `NEW_DEBT_EVIDENCE_PREFIX` 造，本档按同一字面取文）。 */
const NEW_DEBT_PREFIX = "新事理由："
/** `evidence` 追加相接符（追加形 `旧｜新` 零空格——§6.3「取文」）。 */
const EVIDENCE_JOINER = "｜"

/**
 * 取一行新事理由（设计档 §6.3「取文」）：`evidence` 中 `新事理由：` 之后、至首个 `｜`（追加相接符）
 * 或串尾的一段。无该前缀 ∥ 取到空串 ⇒ `null`（负向锁：不是本机制写的行不引）。**只读**——不改入参。
 * @param {string|null} evidence — 行 `evidence` 原值
 * @returns {string|null} 理由原文 ∥ `null`
 */
export function newDebtReasonOf(evidence) {
  const s = String(evidence ?? "")
  const at = s.indexOf(NEW_DEBT_PREFIX)
  if (at < 0) return null
  const rest = s.slice(at + NEW_DEBT_PREFIX.length)
  const cut = rest.indexOf(EVIDENCE_JOINER)
  const value = (cut < 0 ? rest : rest.slice(0, cut)).trim()
  return value === "" ? null : value
}

/**
 * 收口回执的新事理由引文段（逐字 = 设计档 §6.3「理由的读面与时点」：`  新事理由（#<id>）：<理由原文>`）。
 * 读者 = 本批收口那一笔的主 agent · 时点 = 本批收口。**零新清单、只引不写**：纯格式化、零库访问、
 * 不改入参；一条理由一行。取不到本批行 ⇒ 入参无该键 ⇒ 不出该段（收口不被否决）。
 * @param {{newDebtReasons?:{id:number, reason:string}[]}|null} result — `reanchorOnClose` 返回形
 * @returns {string} 以换行起头；无引文 ⇒ 空串
 */
export function newDebtReasonReceiptLine(result) {
  const rows = result?.newDebtReasons ?? []
  return rows.map((r) => `\n  新事理由（#${r.id}）：${r.reason}`).join("")
}
