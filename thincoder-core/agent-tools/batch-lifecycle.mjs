/**
 * agent-tools/batch-lifecycle.mjs — 批次档生命周期 action 面（KD-4 拆分中段；2026-10-27 第二次拆分）。
 *
 * 本档只留 **status / close 两条 action 与在飞批定位**。四条支线住各自的新档（依赖单向：
 * `skeleton ← closeout ← ledger-view ← bind ← reopen ← lifecycle`）：
 *  - 建档 = 建台账行 → `batch-ledger-bind.mjs`（§2.4）；
 *  - 收口判据与重锚回执 → `batch-closeout.mjs`；
 *  - 台账侧只读视图（一致性读数 ¶ 收口预检 ¶ 补关分流）→ `batch-ledger-view.mjs`（P2-5 拆出）；
 *  - 重开写盘 + 台账回收 → `batch-reopen.mjs`（§2.13）。
 *
 * 判定字面全部单源自 batch-skeleton.mjs（SEGMENT_BY_ROLE / STATUS_WORDS /
 * readBatchStatusLine / sectionHasStatusLine / updateSectionStatusLine / batchSkeleton / TEMPLATE_PLACEHOLDERS /
 * findPlaceholderResidue / placeholderResidueError）；路径解析单源（`resolveBatchDocPath` / `batchDocBases` /
 * `resolveBatchCreatePath`——住 `batch-paths.mjs`）与 #84 记账缝住 batch.mjs 主档——本档不回 import 主档（防环）。
 *
 * 身份判据（D-BR17/D-BR18/D-BR21）：主 agent 的工具调用 ctx 带 `depth === 0`（dispatch 装配）；
 * eng 子代理 `ctx.depth > 0`；评审实例 ctx 无 depth 但工具以 `review: true` 绑定。create/close
 * 仅 depth-0 放行（BR-19/BR-24）；status 写域 = 调用者自己段（eng-designer → §2 · 评审 → §3 ·
 * eng-coder → §5 · coder → §5【普通模式分支增表】· 主 agent → 工程 §1 ∥ 普通 §1/§2/§5【取段——§4.16】）。
 *
 * 四道门（2026-10-27 · 设计档 §2.6）：写锁 = `agent/write-gate.mjs`（不在本档）；§5 写入门 =
 * `batch.mjs` append 面；**收口门** = `batch-closeout.mjs`（链门 + §3 状态词臂 + 单测档门 + 机检门）；
 * 核销工作证据门 = `ledger-close-proof.mjs`（只判应用本笔后的 evidence 非空白）。
 *
 * 收口重锚（§6.2 · C · AC-M2-30）：收口有两条通路——`close` ∥ `status` 写 §1「已收口」——两路都冻结档、
 * 都让批「收口了」，故**两路同调**单源 `reanchorOnClose`（本档下方），调点均在状态行写盘之后。
 * 一次收口只出一份 `[ledger reanchor]` 回执段（判据 = 前态未冻结：已冻结档在两路都被冻结门早拒）。
 * **写序与补偿**（设计档 `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` §2.17）：只读预检 → 档写盘 →
 * 台账单事务 →（台账失败 ⇒ 用**写前全文**回滚档 + 抛拒）。两路都过 `ledgerAfterRecordWrite`，失败不静默；
 * 回滚本身也失败时出第二条串（点名半状态与 `batch({action:"check"})`）。
 *
 * **全归档补关**（§4.18-C · `docs/core/design/LEDGER.md` §11.2）：两路在链门前读 `batchLedgerConsistency`——
 * 行集非空、每行均已归档、且 `halfStates` 恰为唯一 `open-but-settled` ⇒ 补关（只跳过链内容门与 §3 pass 臂，
 * 不补写 §3/§4/§6）；补关成功在 §1 段尾追加一行 `**补关记录**`、回执另出 `[ledger repair]`，台账行零改写。
 *
 * 重开回收（§2.13 · E13）：`status` 写 §1 `进行中` 而前态 `closed` ⇒ 重开；写盘后同调 `reclaimOnReopen`
 * （`待核销 → 在途`），失败同样回滚档 + 抛拒（「档已开、行仍 待核销」会让写锁拒每一笔写盘）。
 * **其余 status 用法零台账写**——尤其「§3 写评审通过」不动台账。
 * 两路回执末尾**恒带一行** `[ledger consistency]`（半状态查询面单源 = `batchLedgerConsistency`）；
 * `check` action 是同一读数的完整打印面。
 *
 * 收口自动消费本批设计凭证（DESIGN-TOKEN-SETTLEMENT §10 · 2026-10-26）：同一两路在**写状态行之前**
 * 调 `consumeBatchDesignTokens`（判据 = 槽的批次归属旁列；口径单源见该档 §10）。消费失败 ⇒ 原样上抛、
 * close 被拒、档零字节变——位次与重锚（写盘之后）相反，这是机制本体（KD-BG3）。
 */
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs"
import { dirname, relative, resolve } from "node:path"

import {
  DEPTH0_SEGMENTS, SEGMENT_BY_ROLE, SEGMENT_BY_ROLE_NORMAL, STATUS_WORDS, TEMPLATE_PLACEHOLDERS,
  findPlaceholderResidue, placeholderResidueError, readBatchStatusLine, sectionHasStatusLine,
  updateSectionStatusLine, zoneStatusCount,
} from "./batch-skeleton.mjs"
import { assertCloseoutGates, checkReceipt, closeHalfStateError, closeLedgerFailedError, consistencyReceiptLine, newDebtReasonOf, newDebtReasonReceiptLine, readCloseoutSource, reanchorReceiptLine, repairReceiptLine, repairTraceLine } from "./batch-closeout.mjs"
import { assertCloseDisposition, consistencyOf, repairDecisionOf } from "./batch-ledger-view.mjs"
import { appendLineToSection, assertSingleLineNote, reclaimOnReopen, reopenHalfStateError, reopenLedgerFailedError, reopenReasonError, reopenReceiptLine, rewriteAsReopen, todayLocal } from "./batch-reopen.mjs"
import { gateReceiptLine } from "./batch-gate.mjs"
import { batchPathKey, executeConsumeDesignAction, unionBatches, unionSlots } from "./design-slots.mjs"

/** 可读文件判据（存在且为文件——目录/缺失同判不可读；与主档同名 helper 同型——KD-4 单向依赖下各自持有，
 *  三行谓词不构成第二权威源）。 */
function readableFile(abs) {
  try { return existsSync(abs) && statSync(abs).isFile() } catch { return false }
}

/** depth-0 身份判据。 */
function isDepthZero(ctx) {
  return ctx?.depth === 0
}

/** 段号解析（`§2` / `2` / `§2 批次任务` 均可；无法解析 → null——与主档 append 面同型三行谓词）。 */
function segmentNumber(raw) {
  const m = /^§?\s*(\d+)/.exec(String(raw ?? "").trim())
  return m ? Number(m[1]) : null
}

/** main-agent-only 门（BR-19/BR-24）：close / supersede 仅 depth-0 放行（eng 子代理 / 评审皆拒）。
 *  导出面 = `batch-supersede.mjs`（第三条收口边同一身份门——同一条判据只有这一个函数）。 */
export function assertMainAgentOnly(ctx, action, review) {
  if (review || !isDepthZero(ctx)) {
    throw new Error(`batch: ${action} is main-agent-only — ${action} manages the record lifecycle and is depth-0 only (eng sub-agents and design reviews are refused).`)
  }
}

/** 递归收集目录下全部 `*.md`（#369 · KD-4：显式嵌套路径为合法 create 面 ⇒ 顶层平扫会欠计 ⇒ 复数情形
 *  漏判、默认定位可落非预期档）。只认真目录（symlink 不入，防环）；单目录读错按无候选处理（尽力面）。
 *  **转导出**（read-data-interface 批——`batch/list` 读面文件集同源复用；零行为变）。
 *  **只收批档**（`*.md` 且不以点开头——两条判）：其它扩展名（与批档同目录并存的同名单测档 `<批档名>.test.mjs`）
 *  与隐藏档都不是批档；只有「点开头」一条挡不住那份测档，挡住它的是扩展名那一条（`docs/core/design/DOC-CHECK.md` §2.10.2）。
 *  **不为任何残档设支**：盘上没有片段档这回事——两条判据描述的是「什么算批档」，不是「谁要排掉」。 */
export function collectMarkdownFiles(dir, out = []) {
  let entries = []
  try { entries = readdirSync(dir, { withFileTypes: true }) } catch { return out }
  for (const e of entries) {
    const abs = resolve(dir, e.name)
    if (e.isDirectory()) collectMarkdownFiles(abs, out)
    else if (e.isFile() && e.name.endsWith(".md") && !e.name.startsWith(".")) out.push(abs)
  }
  return out
}

/**
 * depth-0 目标定位（D-BR21）：扫描全部基底根下 `*.md`（**递归**——#369），逐档读 §1 状态行判定 open
 * （readBatchStatusLine === "open"）。0 个 ⇒ throw（无在飞批）；恰 1 个 ⇒ 返回该档绝对路径；
 * ≥2 ⇒ throw（复数在飞批——必传 path，错误消息列出候选）。
 * 多本在飞批并存合法（2026-10-27 用户裁定「当然是允许多个」）——本函数的「≥2 ⇒ 拒」是**默认定位的歧义门**
 * （D-BR21），不是禁止并存：写锁只问「台账里有没有在途行」（设计档决策 7）。
 * @param {string} cwd
 * @param {string[]} bases — 已解析的批次档基底根数组
 * @returns {string} 唯一在飞批绝对路径
 */
export function findInFlightBatch(cwd, bases) {
  void cwd
  const candidates = []
  for (const root of bases ?? []) {
    for (const abs of collectMarkdownFiles(root)) {
      let src
      try { src = readFileSync(abs, "utf8") } catch { continue }
      if (readBatchStatusLine(src) === "open") candidates.push(abs)
    }
  }
  if (candidates.length === 0) {
    throw new Error("batch: no batch record in flight — no *.md under the batch base roots has a §1 status line of 「进行中」. Pass path explicitly, or create a record first (action create).")
  }
  if (candidates.length > 1) {
    throw new Error(`batch: ${candidates.length} batch records are in flight — pass path to pick the target (D-BR21: default resolution requires a unique in-flight record). In flight:\n${candidates.join("\n")}`)
  }
  return candidates[0]
}

/** 冻结门（§4.9——append/status 同门；close 视为写同样过门）：closed/unknown 的错误串与
 *  append 面同字面（「已收口档不回改」/「状态行不可解析或缺失」）。
 *  unknown 串多两句：段级状态行的取值区已收窄到 §1 **段头区**，行落在区外（段体 / 轮次块）就读不成值
 *  ——拒文点名这条终态与唯一出路（把行移进段头区），否则被卡住的人在界面上无路可走（设计档 §5 R26）。 */
export function assertGateOpen(src) {
  const gate = readBatchStatusLine(src)
  if (gate === "closed") {
    throw new Error("batch: 已收口档不回改 — the record's §1 status line contains 「已收口」, so the record is frozen: its body is never written to again (整档冻结；改 = 新批新档). Nothing was written.")
  }
  if (gate === "unknown") {
    throw new Error("batch: 状态行不可解析或缺失 — the record has no §1 `**状态行**：` line inside the section header zone whose value contains 已收口 or 进行中 (fail-closed: the write is refused as if frozen). If the record does carry such a line further down — in a round block or in the section body — move it up under `## §1`: a status line outside the header zone is never read. Nothing was written. Do NOT close the record after a refused append — nothing landed, and closing freezes the missing section for good (失败 ⇒ 勿 close).")
  }
}

/** 全词表去重并集（各段项——value 命中判据与 note 零命判据共用同一口径）。 */
function statusVocabulary() {
  return [...new Set(Object.values(STATUS_WORDS).flatMap((w) => Object.values(w)))]
}

/** 状态行值装饰白名单（F11-A 谓词收紧）：首尾非字母数字符号（emoji / 标点 / 空白）+ 尾部
 *  ISO 日期（YYYY-MM-DD）+ 首尾空白。剥白名单后**余核必须逐字等于**该关键词——余核 ≠ 关键词
 *  （散文内嵌）⇒ 拒（散文说明走独立 `note` 字段落括注）。
 *  读侧（gate）零变：`readBatchStatusLine` / `assertGateOpen` 仍子串包含——冻结门语义不动；
 *  收紧只在写入面 value。 */
const LEAD_DECOR_RE = /^[^\p{L}\p{N}]+/u
const TAIL_DECOR_RE = /[^\p{L}\p{N}]+$/u
const ISO_TAIL_RE = /\d{4}-\d{2}-\d{2}\s*$/
function stripDecorations(value) {
  return value.replace(LEAD_DECOR_RE, "").replace(ISO_TAIL_RE, "").replace(TAIL_DECOR_RE, "")
}

/** status 值域校验（fix 轮 #1 + 词面纪律 + F11-A 谓词收紧）：值在**全词表 union**中必须恰
 *  命中一个关键字（判读序不动：≥2 命中 ⇒ 混词拒在前；0 命中 / 唯一命中不属本段 ⇒ 词表外拒），
 *  且剥装饰白名单后**余核逐字 = 该关键词**（余核 ≠ 关键词 = 散文内嵌 ⇒ 词表外拒同串）。
 *  「进行中…已收口」双词无论写哪段皆拒（最小词面：已收口优先误冻结防线）。
 *  2026-10-27 起 §3 的完成词 = `评审通过`——旧字面 `评审完成` 不在词表 ⇒ 写它即词表外拒（读侧仍等义）。 */
function assertStatusValue(seg, value) {
  const words = Object.values(STATUS_WORDS[seg] ?? {})
  if (!words.length) {
    throw new Error(`batch: §${seg} has no status word list — status is undefined for this section (STATUS_WORDS 分段词表无该项). Nothing was written.`)
  }
  const hits = statusVocabulary().filter((w) => value.includes(w))
  if (hits.length > 1) {
    throw new Error(`batch: status value contains multiple keywords (${hits.join(" + ")}) — one status line carries exactly ONE keyword (词面纪律: mixed values mis-freeze via 已收口-priority). Nothing was written.`)
  }
  if (hits.length === 0 || !words.includes(hits[0]) || stripDecorations(value) !== hits[0]) {
    throw new Error(`batch: status value ${JSON.stringify(value)} is not in the legal keyword set for §${seg} (${words.join(" / ")}) — STATUS_WORDS 分段词表是唯一值域（D-BR19；合法值 = 恰一关键词 + 装饰白名单〔首尾符号 / 尾部 ISO 日期 / 空白〕，散文说明走 note 字段落括注）. Nothing was written.`)
  }
}

/** status `note` 字段校验（F11-A——落盘形态 = 状态行行内括注）：单行 + **全词表零命中**
 *  （括注永不误触冻结门——§1 判定是子串包含；已收口优先误冻结防线的第二道）+ 死占位判据零命中
 *  （括注不得成为骨架占位的新驻留面）。 */
function assertStatusNote(note) {
  assertSingleLineNote(note)
  const hits = statusVocabulary().filter((w) => note.includes(w))
  if (hits.length) {
    throw new Error(`batch: status note must not contain any STATUS_WORDS keyword (${hits.join(" + ")}) — a parenthetical carrying a keyword would be read as gate truth (§1 substring predicate). Put the keyword in value, the prose in note. Nothing was written.`)
  }
  const residues = TEMPLATE_PLACEHOLDERS.filter((ph) => note.includes(ph))
  if (residues.length) {
    throw new Error(`batch: status note must not carry skeleton placeholders (${residues.join(" · ")}) — fill them in the record header instead of parking them in the status line. Nothing was written.`)
  }
}

/** 拒串：目标段段头区内**两条以上**状态行（§4.21.4 写面第二道——让这个歧义状态不再产生）。
 *  修复句按段分两支：非 §1 = 先 `edit` 删多余那条（区内回到 1 ⇒ 可读行重新出现）再 `status` 改写余下那条
 *  （记录全程 open，通道可达）；§1 = 主 agent 普通文档写（`edit` / `status` 在不可解析面上全部 fail-closed，
 *  不许借重开绕）。顺序不能反：歧义时 `status` 拒，而 `edit` 不读该段的词面。 */
function STATUS_LINE_AMBIGUOUS_ERROR(seg, count) {
  const repair = Number(seg) === 1
    ? "The §1 zone cannot be repaired through this tool: edit and status are both fail-closed on an unreadable §1 (reopening is not a way around it) — the main agent repairs it with an ordinary document write, deleting the surplus line so the zone holds exactly one."
    : `Repair order (the record stays open throughout): first batch({action:"edit", segment:"§${seg}"}) on the non-protected line with newText "" — deleting it leaves the zone with one status line, so a readable line exists again — then batch({action:"status", segment:"§${seg}"}) rewrites that remaining (protected) line.`
  return `batch: §${seg} carries ${count} \`**状态行**\` lines in its section header zone — a section's status is read only when the zone holds exactly one, so this one reads as unset (§2/§3/§5 word face = null; §1 = unknown ⇒ fail-closed). Nothing was written. ${repair}`
}

/**
 * status——状态行流转（§4.12，段属主；§4.16 模式感知）。写域 = 调用者自己段内 `**状态行**：`
 * 行（评审 → §3 · eng-designer → §2 · eng-coder / coder → §5 · 主 agent：工程 §1 ∥ 普通
 * §1/§2/§5 取段——缺省 §1）；值域 = STATUS_WORDS 该段项恰一词（余核 = 关键词），散文说明走 `note`
 * 字段（落状态行括注）；冻结真值不变（gate 只读 §1）。
 * path 参数 = 仅 depth-0（D-BR21）——子代理/评审传 path ⇒ 拒。F11-C 挂点 = 写盘前（档头结构行含骨架
 * 死占位 ⇒ 拒；段体引用豁免；close 不拦——收口是主 agent 终态动作）。
 * **段头区歧义拒写**（§4.21.4 写面第二道）：目标段段头区两条以上状态行 ⇒ 拒并给修复句（非 §1 = 先
 * `edit` 删多余那条再 `status`；§1 = 普通文档写）——位次 = 读档之后、重开合取之前（两路都是拒）。
 * **收口第二通路**：值余核 = §1「已收口」时本 action 同样收口（收口门 + 单测档门 + 机检门 + 冻结与
 * close 同序）⇒ 状态行写盘后同调 `reanchorOnClose`，回执携同一 `[ledger reanchor]` 段；`completed` 与
 * `closeEvidence` 与 `close` 同两条必填，台账失败同样回滚档并抛拒。与 close 同门同分派：全归档批走补关
 * （§4.18-C，只绕开内容门与 §3 pass 臂，§1 段尾落一行 `**补关记录**`）。
 * **重开径**（§4.18-B · §2.13）：前态 closed ∧ 值 = 进行中 ∧ note 非空 ⇒ 重开；写盘后同调
 * `reclaimOnReopen`（`待核销 → 在途`），回执携 `[ledger reopen]` 段；回收失败 ⇒ 档回滚到冻结态并抛拒。
 * **其余一切用法零台账写**；本 action 的回执末尾恒带一行 `[ledger consistency]`。
 * @returns {Promise<string>} 成功消息
 */
export async function statusBatchRecord({ args, ctx, review, pickTarget, onWritten }) {
  const depth0 = isDepthZero(ctx)
  // 模式位执行期实读（§4.16——同款先例 = task.mjs execute 门；翻转即时生效——D-BR26）。
  const engineering = !!ctx?.agent?.config?.agent?.engineering
  let seg = review ? 3 : depth0 ? 1 : SEGMENT_BY_ROLE[ctx?.agent?._role] ?? (engineering ? null : SEGMENT_BY_ROLE_NORMAL[ctx?.agent?._role] ?? null)
  if (seg === null) {
    throw new Error("batch: no segment is writable by this caller — status writes the caller's OWN section (eng-designer → §2, design review → §3, eng-coder → §5, main agent → §1).")
  }
  // 段域判据（BR-22「eng-designer 对 §1 调 status ⇒ 段白名单拒」——镜像 append 面）：
  // depth-0 普通面（§4.16）= **取段**——写域集 §1/§2/§5、缺省 §1、越出集合 ⇒ 拒（模式化新串）；
  // depth-0 工程面 ∥ 子代理 ∥ 评审 = **声明段核对**（声明段 ≠ 身份写域段 ⇒ 拒；身份写域段可省略）。
  const declared = args?.segment === undefined || args?.segment === null ? null : segmentNumber(args.segment)
  if (declared === null && args?.segment !== undefined && args?.segment !== null) {
    throw new Error(`batch: unknown segment ${JSON.stringify(args?.segment ?? null)} — pass the section number you write (e.g. "§${seg}"), or omit it. Nothing was written.`)
  }
  if (depth0 && !review && !engineering) {
    const target = declared ?? 1
    if (!DEPTH0_SEGMENTS.status.normal.includes(target)) {
      throw new Error(`batch: §${declared} is not yours to write — in normal mode status writes §1/§2/§5 only (一段一作者: §3 = design review; §4/§6 carry no status word list). Nothing was written.`)
    }
    seg = target
  } else if (declared !== null && declared !== seg) {
    throw new Error(`batch: §${declared} is not yours to write — status writes YOUR OWN section §${seg} only (一段一作者: eng-designer → §2, design review → §3, eng-coder → §5, main agent → §1). Nothing was written.`)
  }
  if (args?.path !== undefined && args?.path !== null && !depth0) {
    throw new Error("batch: path is a depth-0-only parameter (D-BR21) — your target record arrives via the spawn binding / the review instance key. Nothing was written.")
  }
  const value = typeof args?.value === "string" ? args.value.trim() : ""
  if (!value) {
    throw new Error("batch: status requires value — the new status-line value (must contain exactly one legal keyword of your section's STATUS_WORDS entry). Nothing was written.")
  }
  if (/\r?\n/.test(value)) {
    throw new Error("batch: status value must be a single line — a multi-line value would break the one-line status-line form. Nothing was written.")
  }
  // note（可选）：散文说明的承载面——落状态行行内括注（value 内散文不再容忍）；缺省 / 空串 = 无括注。
  // **重开径例外（§4.18-B）**：值关键词 = 进行中 ∧ §1 门态 = closed ⇒ note = 重开理由（J4 缺则拒），
  // 不进状态行括注（落 §1 追记行）；`assertStatusNote` 不取——理由允许携词表关键字。
  const note = typeof args?.note === "string" ? args.note.trim() : ""
  assertStatusValue(seg, value)
  const abs = pickTarget(args?.path)
  const src = readFileSync(abs, "utf8")
  // 段头区状态行歧义（§4.21.4 写面第二道）——位次 = 读档之后、重开合取与冻结门之前（§1 歧义面拿到的
  // 是「修法 = 普通文档写」这一句，比冻结门的「不可解析」更贴现场；两路都是拒）。
  const zoneCount = zoneStatusCount(src, seg)
  if (zoneCount > 1) throw new Error(STATUS_LINE_AMBIGUOUS_ERROR(seg, zoneCount))
  // 重开合取（§4.18-B）：段 = §1 · depth-0（非评审）· 值关键词 = 进行中 · 门态 = closed——
  // 先于冻结拒写判定（门②的唯一例外）；note = 重开理由（J4 缺则拒）。**台账联动只由本合取触发**。
  const reopen = seg === 1 && depth0 && !review && stripDecorations(value) === STATUS_WORDS[1].open && readBatchStatusLine(src) === "closed"
  if (reopen && !note) throw new Error(reopenReasonError()) // J4——重开必须带理由
  if (reopen) assertSingleLineNote(note) // 单行 + 非空（非空已由 J4 判）
  else if (note) assertStatusNote(note)
  const lineValue = note && !reopen ? `${value}（${note}）` : value
  if (!reopen) assertGateOpen(src) // 冻结拒写——重开合取是唯一越过点（§4.9 门②例外；其余逐字零变）
  // F11-C（写盘前）：档头结构行死占位残留 ⇒ 拒（段体引用豁免）
  const residues = findPlaceholderResidue(src)
  if (residues.length) throw new Error(placeholderResidueError(residues))
  if (reopen) {
    // 重开（§4.18-B · §2.13）：一次写盘、两处落笔（状态行改写 + §1 段尾追记行）——不跑收口门
    //（值非「已收口」；写后门态 = open，后续 append/status 恢复放行）。
    writeFileSync(abs, rewriteAsReopen(src, note))
    // 记账口径同 status 径（记「落过盘」，回档不回退）——见 `statusBatchRecord` 写盘处的注释。
    if (ctx?.agent) ctx.agent._batchWrites = (ctx.agent._batchWrites ?? 0) + 1 // §6.6 `wrote` 判据（写盘成功才增）
    onWritten?.(ctx?.agent ?? {}, abs)
    // ② 台账回收（§2.17 重开步序 3–4 · 写序：档先写、台账后写）：失败 ⇒ 用写前全文（冻结态）补偿回滚档，
    // 然后抛拒——「档已开、行仍 待核销」的残态会让写锁拒每一笔写盘且没有任何提示，正是本批要消掉的那一形。
    const reclaim = await ledgerAfterRecordWrite({
      side: "reopen", abs, src, run: () => reclaimOnReopen(abs, ctx?.agent?.cwd),
    })
    return `batch: §1 reopened — status line → 「进行中（重开 ${todayLocal()}）」 + reopen record appended to §1 (reason lands verbatim in the record line). Append/status are writable again (BR-64); the closeout chain gate still applies at the next close.${reopenReceiptLine(reclaim)}${consistencyReceiptLine(await consistencyOf(abs, ctx?.agent?.cwd))}`
  }
  // 收口门（§2.6——链门 + §3 状态词臂 + 单测档门 + 机检门）：本笔把 §1 写成「已收口」⇒ 四道同判。
  // 段号守卫只写这一次（`STATUS_WORDS[1].closed` 只属 §1 项，`assertStatusValue` 亦拒他段该值）。
  const closingValue = seg === 1 && stripDecorations(value) === STATUS_WORDS[1].closed
  if (!closingValue && args?.completed !== undefined) {
    throw new Error("batch: completed is accepted only by close or by status writing §1 已收口. Nothing was written.")
  }
  if (!closingValue && args?.closeEvidence !== undefined) {
    throw new Error("batch: closeEvidence is accepted only by close or by status writing §1 已收口. Nothing was written.")
  }
  // 收口分流（§4.18-C）：链门之前读一致性——全归档批走补关，其余走完整链门。
  const repair = closingValue ? await repairDecisionOf(abs, ctx?.agent?.cwd) : null
  const gate = closingValue ? assertCloseoutGates({ abs, cwd: ctx?.agent?.cwd, agent: ctx?.agent ?? {}, src, action: "status", mode: repair.repair ? "repair" : "normal" }) : null
  // 完成清单预检位于既有收口门之后、凭证消费与批档写盘之前；拒绝时令牌、档、账均不变。
  // `closeEvidence` 与 `completed` 同一格（收口即结算：证据由本笔给，机器不代写）。
  if (closingValue) await assertCloseDisposition(abs, ctx?.agent?.cwd, args?.completed, args?.closeEvidence, true)
  const designTokens = closingValue ? consumeBatchDesignTokens(ctx?.agent ?? {}, abs) : null
  // 补关（§4.18-C）= 冻结之外在 §1 段尾追加一行追记（一次写盘、两处落笔）；正常收口只改状态行。
  // 补关只在 `closingValue` 下成立，而 `closingValue` 蕴含 `seg === 1` ⇒ 追记行恒落 §1。
  const statusWritten = updateSectionStatusLine(src, seg, lineValue)
  const written = repair?.repair ? appendLineToSection(statusWritten, 1, repairTraceLine(todayLocal(), repair.rows)) : statusWritten
  writeFileSync(abs, written)
  // 记账口径（明示，不改行为）：`_batchWrites` 与端侧记账记的是「本笔**落过盘**」，位次 = 写盘成功那一刻；
  // 台账失败由 `ledgerAfterRecordWrite` 把档回档后本计数不回退（档字节净变 = 零，而写盘事实发生过）。
  // 它不进任何判据（§6.6 `wrote` 只问「有没有写过」），故不以回档为准重算。
  if (ctx?.agent) ctx.agent._batchWrites = (ctx.agent._batchWrites ?? 0) + 1 // §6.6 `wrote` 判据（写盘成功才增）
  onWritten?.(ctx?.agent ?? {}, abs)
  // 收口重锚（§6.2 · C · AC-M2-30）：值余核 = §1「已收口」⇒ 本 action 就是收口 ⇒ 同调单源
  // `reanchorOnClose`（不复制 close 径逻辑）；次序位 = 状态行写盘之后（写序单源 = §2.17）。
  // 本笔被任一拒因拒 ⇒ 上面各门早 throw，台账零写（被拒的收口没有收口）。一次收口只出一份清单。
  // 台账失败 ⇒ 用写前全文回滚档并抛拒——冻结与结账要么一起成，要么一个都不成（除非回滚本身也失败，
  // 那时第二条串点名半状态与查询面）。
  const reanchor = closingValue && readBatchStatusLine(src) !== "closed"
    ? await ledgerAfterRecordWrite({ side: "close", abs, src, run: () => reanchorOnClose(abs, ctx?.agent?.cwd, args?.completed, args?.closeEvidence, true) })
    : null
  return `batch: §${seg} status line updated to ${JSON.stringify(lineValue)} — the freeze gate (§1) is a read-only domain for non-§1 writes (frozen truth stays = the §1 line).${gateReceiptLine(gate)}${designTokensReceiptLine(designTokens)}${repairReceiptLine(repair?.repair ? { rows: repair.rows, date: todayLocal() } : null)}${reanchorReceiptLine(reanchor)}${newDebtReasonReceiptLine(reanchor)}${consistencyReceiptLine(await consistencyOf(abs, ctx?.agent?.cwd))}`
}

/**
 * close——收口冻结（§4.13，仅 depth-0）。§1 状态行 →「已收口 <YYYY-MM-DD>」；此后该档 append/status 全拒
 * （冻结判据唯一真值 = §1 行——§4.9 零语义变；唯一例外 = 重开合取 §4.18-B）。对已收口档再 close ⇒ 拒。
 * 不代写 §6 内容、不替代台账核销事务。
 * 前提规则（#422 + §4.18-A + §2.6 四道门）：① 收口门（链门 ∧ §3 状态词臂；§6 唯一缺段时拒串 = 旧 §6 串
 * 逐字零回归）；② 本批批内单测档门；③ 文档机检门；④ 无状态行档 ⇒ 自建机读位（「有行但不可解析」仍
 * fail-closed）。**全归档补关**（§4.18-C）只绕开 ① 的两臂，②③ 与完成清单预检、凭证消费、重锚全保留。
 * @returns {Promise<string>} 成功消息
 */
export async function closeBatchRecord({ args, ctx, review, pickTarget, onWritten }) {
  assertMainAgentOnly(ctx, "close", review)
  const abs = pickTarget(args?.path)
  const src = readCloseoutSource(abs)
  // #422③：§1 无状态行档 ⇒ 自建机读位（下行走 updateSectionStatusLine 缺失即插——同路收口）；
  // 「有行但不可解析」维持 fail-closed（assertGateOpen 拒——防误冻结）。
  if (readBatchStatusLine(src) !== "open" && sectionHasStatusLine(src, 1)) assertGateOpen(src)
  // 收口分流（§4.18-C）：链门之前读一致性——全归档批走补关，其余走完整链门。
  const repair = await repairDecisionOf(abs, ctx?.agent?.cwd)
  // 收口门（§2.6）：链门 → §3 状态词臂 → 单测档门 → 机检门（位次 = 既有拒因之后、写盘之前）；
  // 补关分派 ⇒ 只跳过前两臂（repair.repair）。
  const gate = assertCloseoutGates({ abs, cwd: ctx?.agent?.cwd, agent: ctx?.agent ?? {}, src, action: "close", mode: repair.repair ? "repair" : "normal" })
  // 完成清单预检位于既有收口门之后、凭证消费与批档写盘之前；拒绝时令牌、档、账均不变。
  // `closeEvidence` 与 `completed` 同一格（收口即结算：证据由本笔给，机器不代写——代写一句就把核销门
  // 变成摆设）。
  await assertCloseDisposition(abs, ctx?.agent?.cwd, args?.completed, args?.closeEvidence, true)
  const designTokens = consumeBatchDesignTokens(ctx?.agent ?? {}, abs)
  const date = todayLocal()
  // 补关（§4.18-C）= 冻结之外在 §1 段尾追加一行追记（一次写盘、两处落笔）；正常收口只改状态行。
  const statusWritten = updateSectionStatusLine(src, 1, `已收口 ${date}`)
  const written = repair.repair ? appendLineToSection(statusWritten, 1, repairTraceLine(date, repair.rows)) : statusWritten
  writeFileSync(abs, written)
  // 记账口径同 status 径（记「落过盘」，回档不回退）——见 `statusBatchRecord` 写盘处的注释。
  if (ctx?.agent) ctx.agent._batchWrites = (ctx.agent._batchWrites ?? 0) + 1 // §6.6 `wrote` 判据（写盘成功才增）
  onWritten?.(ctx?.agent ?? {}, abs)
  // 收口重锚（§6.2 · C · AC-M2-30）：顺序位 = 全部拒因通过、§1 状态行写盘**之后**——close 被拒 ⇒ 台账零写。
  // 台账失败 ⇒ 用写前全文回滚档 + 抛拒（§2.17 写序；不可逆的一方排最后）。
  const reanchor = await ledgerAfterRecordWrite({
    side: "close", abs, src, run: () => reanchorOnClose(abs, ctx?.agent?.cwd, args?.completed, args?.closeEvidence, true),
  })
  return `batch: §1 status line → 「已收口 ${date}」 — the record is frozen: append is refused from now on, and status is refused except the reopen conjunction (§1 → 进行中 with a note) (整档冻结；改 = 新批新档; §6 内容与台账核销仍走既有通道).${gateReceiptLine(gate)}${designTokensReceiptLine(designTokens)}${repairReceiptLine(repair.repair ? { rows: repair.rows, date } : null)}${reanchorReceiptLine(reanchor)}${newDebtReasonReceiptLine(reanchor)}${consistencyReceiptLine(await consistencyOf(abs, ctx?.agent?.cwd))}`
}

// ─── 收口自动消费本批设计凭证（DESIGN-TOKEN-SETTLEMENT §10——单源，close ∥ status 两通路同调）──

/** 「留槽无归属」枚数（§10 观测量）：并集视图里在旁列**无归属行**的槽数——含过期项（清点面照列；过期槽
 *  同样撑开写门，正是敞口本身）。只认旁列：注册表反查是显示面兜底、不是消费判据（旧槽不猜归属——KD-BG4）。 */
function unattributedSlotCount(agent, batches) {
  let n = 0
  for (const id of unionSlots(agent).keys()) if (!batches.has(id)) n++
  return n
}

/**
 * 收口自动消费（DESIGN-TOKEN-SETTLEMENT §10——两通路共调本函数，不复制逻辑）。四步：
 * ①非工程模式 ⇒ no-op（普通模式批无设计槽）；②反查 = 内存 Map ∪ 槽文件旁列（**严格读**——旁列读不到即抛
 * ⇒ close 被拒，「没有」= 空集不抛）取该 `abs` 名下的 designId 集；③空集 ⇒ no-op（重开后再 close 走这条）；
 * ④调既有 `executeConsumeDesignAction({ designIds })`——单次落盘 + 内存整体回滚 + 逐枚回执全复用。
 * **失败语义**：④抛 ⇒ **原样上抛**（消费核已把内存槽整体回滚）⇒ 调用方被拒、档零字节变、可重试。
 * `§3` 状态词自 2026-10-27 起 = `评审通过`，本函数**零改**——凭证消费的判据是批次归属，不是评审词面。
 * @param {object} agent — 含 `config.agent.engineering` 与槽状态图
 * @param {string} abs — 本批批档绝对路径（收口目标，`pickTarget` 解析所得）
 * @returns {{consumed: number, unattributed: number}|null} 消费枚数 ∥ 留槽无归属枚数；`null` = no-op（非工程模式）
 */
export function consumeBatchDesignTokens(agent, abs) {
  if (!agent?.config?.agent?.engineering) return null
  const target = batchPathKey(abs)
  const batches = unionBatches(agent, { strict: true })
  const ids = [...batches]
    .filter(([, b]) => typeof b === "string" && batchPathKey(b) === target)
    .map(([id]) => id)
  if (ids.length === 0) return { consumed: 0, unattributed: unattributedSlotCount(agent, batches) }
  const held = unionSlots(agent)
  const consumed = ids.filter((id) => held.has(id)).length
  executeConsumeDesignAction({ designIds: ids }, { agent })
  return { consumed, unattributed: unattributedSlotCount(agent, batches) }
}

/** 收口回执的凭证段（§10 回执形：单列 `[design tokens]` 一行）；`null`（普通模式 no-op）⇒ 无该段。
 *  导出面 = 第三条收口边（`batch-supersede.mjs`）同用：凭证消费是「从未实施」也**不豁免**的环节。
 *  单源在此——两个入口各写一句就会成为两个格式。 */
export function designTokensReceiptLine(result) {
  if (!result) return ""
  return `\n[design tokens] 消费 ${result.consumed} 枚 · 留槽无归属 ${result.unattributed} 枚`
}

/**
 * 写序第 4 步（设计档 §2.17「写序」）：**档先写、台账后写，台账失败即用写前全文补偿回滚档**——
 * 不可逆的一方（核销）排最后。`run()` 返回的那一笔台账写失败（返回形 `failed`）⇒ 覆盖回写前字节并抛拒；
 * **补偿本身也失败** ⇒ 出那一侧的第二条串（不得复用第一条——第一条声称已回滚，此时事实相反），
 * 它是唯一允许半状态成立的时点，且必须喊出来（含 `batch({action:"check"})` 指路）。
 * 两条串的单源：收口侧 = `batch-closeout.mjs`，重开侧 = `batch-reopen.mjs`。
 * 导出面 = 第三条收口边（`batch-supersede.mjs`）同调：写序与失败补偿属「不豁免」的环节（§4.18-D「保留门与写序」）。
 */
export async function ledgerAfterRecordWrite({ side, abs, src, run }) {
  const result = await run()
  if (!result?.failed) return result
  try {
    writeFileSync(abs, src)
  } catch (rollbackErr) {
    const rollbackCause = String(rollbackErr?.message ?? rollbackErr)
    throw new Error(side === "close"
      ? closeHalfStateError(abs, result.failed, rollbackCause)
      : reopenHalfStateError(abs, result.failed, rollbackCause))
  }
  throw new Error(side === "close" ? closeLedgerFailedError(result.failed) : reopenLedgerFailedError(result.failed))
}

/** 收口重锚（设计档 §6.2 · C · §2.7 分流）——收口两条通路共调（同一单源，不复制逻辑）；写入单源 =
 *  `ledgerReanchorBatch`（本档只供 `cwd` 基准与完成清单；工具层零 SQL）。
 *  `cwd` = **批档所属项目根** = `resolveLedgerRoot(dirname(<batchDoc>), boundary)?.root`——**不用会话锚**
 *  （多根工作区锚会收到别的项目根 ⇒ 选行零命中 ⇒ 唯一的机器写静默失效）。
 *  `boundary` = 上溯上界 = **会话锚**（**必传**——缺值即当场失败，回执以 `failed` 点名；不落进程 cwd）。无根 ⇒ 传 `null`（核心不取行、不重锚，`failed` 点名）。
 *  `batch` = 项目根相对路径（复启句的 `<批名>` 即其文件部分）。失败**不抛**（本档的 `failed` 由调用方
 *  `ledgerAfterRecordWrite` 转成「回滚档 + 抛拒」——收口要么一起成、要么一个都不成）。
 *  `requireAllInFlight` = 完成清单那一条元判据（**无缺省**，§4.18-D「③ 的实现面」）：正常两路传 `true`，
 *  被取代的收口传 `false`（未点名的在途行走退回边）。
 *  **返回形** = `ledgerReanchorBatch` 返回形 + `newDebtReasons`（本批行中 `evidence` 带 `新事理由：` 前缀者；
 *  取不到本批行 ⇒ 空集）——**只取不写**，格式化成回执段的是 `newDebtReasonReceiptLine`。 */
export async function reanchorOnClose(abs, boundary, completed, closeEvidence, requireAllInFlight) {
  try {
    const { ledgerBatchRows, ledgerReanchorBatch, resolveLedgerRoot } = await import("../ledger.mjs") // 动态 import：ledger-db 静态引 node:sqlite（W8 契约②）
    const root = resolveLedgerRoot(dirname(abs), boundary)?.root ?? null
    // 句内路径统一正斜杠（与 `task_book` 列值同形——`<批名>` 是给人读的事实句，不是平台路径）
    const batch = root ? relative(root, abs).replace(/\\/g, "/") : abs
    const result = ledgerReanchorBatch({ cwd: root, batch, boundary, completed, closeEvidence, requireAllInFlight })
    // 新事理由读面（设计档 §6.3）：本批行（任意状态）中 `evidence` 带 `新事理由：` 前缀者随返回形带回——
    // **只引不写**（行改写语义零动）；取不到本批行 ⇒ 空集（不出该段、收口不被否决，同 `failed` 降级口径）
    let newDebtReasons = []
    try {
      newDebtReasons = ledgerBatchRows({ cwd: root, batch, boundary })
        .map((r) => ({ id: Number(r.id), reason: newDebtReasonOf(r.evidence) }))
        .filter((r) => r.reason !== null)
    } catch { newDebtReasons = [] }
    return { ...result, newDebtReasons }
  } catch (e) {
    // 非预期异常（模块加载失败 ∥ 根推导内读声明抛）同样不得否决收口——降为同一返回形（台账零写）
    return { batch: abs, settled: [], conditioned: [], alreadyAnchored: [], failed: String(e?.message ?? e), newDebtReasons: [] }
  }
}

/**
 * check——半状态查询（设计档 §2.17「暴露面两处」第一条；**只读动作，depth-0 only**）：回执逐行打印
 * `batchLedgerConsistency` 的读数——`record` 三态 ∥ 本批行集 ∥ 半状态五类与各自出路 ∥ `consistent`。
 * 这就是「明确的半状态查询面」：人不必靠一次失败的写去猜，半状态可查、可照着出路恢复。
 * **零写**：不改行、不改档（半状态自动修复被拒——修复要走人裁的那一步：重开 ∥ 收口 ∥ 改指针）。
 * @returns {Promise<string>} 回执（含 `[ledger consistency]` 行）
 */
export async function checkBatchRecord({ args, ctx, review, pickTarget }) {
  if (review || !isDepthZero(ctx)) {
    throw new Error("batch: check is main-agent-only — the half-state query face is depth-0 only (eng sub-agents and design reviews are refused).")
  }
  const abs = pickTarget(args?.path)
  const { batchLedgerConsistency, resolveLedgerRoot } = await import("../ledger.mjs")
  const root = resolveLedgerRoot(dirname(abs), ctx?.agent?.cwd)?.root ?? null
  const batch = root ? relative(root, abs).replace(/\\/g, "/") : abs
  return checkReceipt(batchLedgerConsistency({ cwd: root, batch, boundary: ctx?.agent?.cwd }), abs)
}
