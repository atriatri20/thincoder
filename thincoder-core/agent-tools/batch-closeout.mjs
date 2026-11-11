/**
 * agent-tools/batch-closeout.mjs — 收口面的四道判据与回执（从 `batch-lifecycle.mjs` 拆出，2026-10-27）。
 *
 * 权威规格 = `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` §2.6（四道门）∥ §2.11（收口前显式处置）；
 * 链门的原文契约 = `docs/core/design/BATCH-RECORD.md` §4.18-A。
 *
 * 本档承载三件（都不碰 fs 写、只读与判）：
 * ① `assertCloseoutGates` —— 收口两路（`close` ∥ `status` 写 `§1 已收口`）共调的判序：
 *    链完整性门（§2/§3/§4/§6 各段须有内容——`不适用` 声明机制已退役）→ **`§3` 状态词臂**（无条件 = `评审通过`）
 *    → 本批批内单测档门（`TESTING.md` §3.5）→ 文档机检门（`DOC-DISCIPLINE.md` §3.20）。
 * ② `assertSectionFiveGate` —— §5 写入门（段序门）：两条合取——① `§3` 状态行 = `评审通过`；② `§3` 最近一轮
 *    轮次块自己携 pass 裁定行（块 = `lastRoundBlock`；裁定读数 = 骨架档 `verdictGapOf`，`append §3` 写入闸与
 *    签发面读同一个函数）。旧的第一条旁路（`§1` 声明 §3 不适用）已随本批删除：实现只发生在评审之后，没有例外段。
 * ③ `reanchorReceiptLine` —— 收口重锚回执三行（§2.11 逐字）。
 * ④ **全归档补关面**（§4.18-C · `docs/core/design/LEDGER.md` §11.2）：拒文 `repairBlockedError`、档面
 *    追记行 `repairTraceLine` 与回执段 `repairReceiptLine`。补关只跳过收口门的 ①② 两臂，③④ 与写序、
 *    凭证消费、完成清单预检全部保留——「行全归档」不是「环节全免」；分派判据住 `batch-ledger-view.mjs`。
 *
 * 为什么 §3 内容臂留着（不换成只判状态词）：内容臂守的是「段里真跑过」，状态词臂守的是「跑的结论是
 * pass」——换掉内容臂 = 门被放宽（一段空着但状态词对就过），那正是本批要堵的洞。所以是**加**一条臂。
 *
 * 依赖单向（KD-4）：`skeleton ← closeout ← bind ← reopen ← lifecycle`——本档不 import lifecycle。
 */
import { readFileSync } from "node:fs"

import {
  countRoundBlocks, inapplicableDeclarationError, lastRoundBlock, malformedInapplicableLine, readSectionStatusWord,
  sectionContentState, STATUS_WORDS, verdictGapOf,
} from "./batch-skeleton.mjs"
// 裁定读数 = 骨架档 `verdictGapOf` 一个函数（设计档 §2.6.1「判据单源」）：`§5` 门判据 2 与签发面判的是同一份
// 回执文本，组合序各写一遍必然一处变一处不变。本档不再 import 两条裁定锚——锚与序都在那个函数里。
import { assertUnitTestFilesCleared } from "./batch-unit-test-gate.mjs"
import { gateRefusalMessage, runBatchGate } from "./batch-gate.mjs"

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
 * 收口两路共调判序（设计档 §2.4–§2.6 · 2026-10-27 四道门）：
 *   ① 链完整性门（§2 / §3 / §4 / §6 各段须有内容）
 *   ② **`§3` 状态词臂**：`§3` 状态行 = `评审通过`（无条件）
 *   ③ 本批批内单测档门（仍在盘 ⇒ 拒——零留存的结构兜底）
 *   ④ 文档机检门（REFUSED ∥ ERROR ⇒ 拒）
 * 位次 = 既有拒因之后、写盘之前（任一被拒 ⇒ 档字节不变）。返回 `④` 的门结果供回执拼行（`null` = 未跑）。
 * @param {{abs:string, cwd:string, agent:object, src:string, action:"close"|"status", mode?:"normal"|"repair"|"supersede"}} o
 *   `src` = 调用方已读的写盘前全文（判据与写盘读同一份字节，不二次读盘）。
 *   `mode` = **哪一条收口边在跑**（三值闭集；两臂跳过由这一处决定）：
 *   `normal` = 正常收口（两臂全跑）∥ `repair` = 全归档补关（§4.18-C）∥ `supersede` = 被取代的收口（§4.18-D）。
 *   `repair` ∥ `supersede` 两条都**只跳过 ① 内容门与 ② §3 pass 臂**，③④ 照跑；分派判据不在这里
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
  return gate
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
