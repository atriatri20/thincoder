/**
 * agent-tools/batch-reopen.mjs — 重开径（`§1` 已收口 → 进行中）与台账回收调点（从 `batch-lifecycle.mjs`
 * 拆出，2026-10-27）。
 *
 * 权威规格 = `docs/core/design/BATCH-RECORD.md` §4.18-B（重开的档面语义）+ `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md`
 * §2.13（重开回收：收口的反面——批档开 ⇒ 台账行回工作位）。
 *
 * 两件事：
 * ① `rewriteAsReopen` —— 一次写盘、两处落笔：状态行原位改写 + §1 段尾追记行（append-only：行数 +1、
 *    仅状态行原位替换、余行逐字节不变）。
 * ② `reclaimOnReopen` —— 台账写点（`ledgerReclaimBatch`）：`待核销 → 在途`（行回工作位）；`已核销` 不动
 *    （终态）+ 回执点名；其余状态零触。**失败即回滚档并抛拒**（设计档 `UNIFY.md` §2.17 重开步序 4）：
 *   判据 = 「档已开、行仍 `待核销`」会让写锁拒每一笔写盘且没有任何提示——那比「重开做不成」更坏，
 *    所以本档只出**失败返回形**，回滚与两条拒文由 `batch-lifecycle.mjs` 的 `ledgerAfterRecordWrite` 收口。
 *    代价（认下）：台账库长期不可用时重开也做不成，只能等人修库。
 *
 * 触发判据**不在这里**：只由 `batch-lifecycle.mjs` 的 `reopen` 合取触发（`seg === 1 ∧ depth0 ∧ ¬review ∧
 * 值 = 进行中 ∧ 前态 = closed`）——两处各推一次必然漂移，本档只承接「已判定要重开」之后的动作。
 */
import { dirname, relative } from "node:path"

import { STATUS_LINE_RE, sectionHeaderRe, updateSectionStatusLine } from "./batch-skeleton.mjs"

/** 本地今天（YYYY-MM-DD）——重开日期戳（close 侧同一枚，经本档导出复用——日期口径只此一处）。 */
export function todayLocal() {
  const d = new Date()
  const p = (n) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

/** note 单行判据（两径共用——非重开径落状态行括注、重开径落 §1 追记行，两者都是一行；重开径不取
 *  `assertStatusNote` 的另两条判据〔词表零命中 / 死占位〕——理由允许携状态词表关键字，而追记行不是
 *  状态行形态、不参与 gate 判读）。 */
export function assertSingleLineNote(note) {
  if (/\r?\n/.test(note)) {
    throw new Error("batch: status note must be a single line — a multi-line note would break the one-line status-line form. Nothing was written.")
  }
}

/** 重开缺理由拒绝句（§4.18-B J4——触发合取缺 note；逐字文本 = `TOOLS.md` §6.24 J4）。 */
export function reopenReasonError() {
  return "batch: 重开需理由（reopen requires a reason）— reopening a frozen record reverses a recorded decision, so the reason must be stated: pass it as `note` (it lands verbatim in the §1 reopen record). Nothing was written."
}

/** §1 状态行值原文（改写前的读取面——readBatchStatusLine 只给三态，日期字面须自己读）。
 *  **取值区 = §1 段头区**（`## §1` 标题之后、下一 `^#{2,}` 起行之前——与写面同一条定位面）：
 *  回执要的是真段级那一行，段体 / 轮次块里引述的状态行不算。 */
export function readBatchStatusLineRaw(src) {
  const s1 = /^## §1(?=\s|$)/m.exec(src)
  if (!s1) return null
  const zone = src.slice(s1.index + s1[0].length)
  const cut = zone.search(/^#{2,}/m) // 区界判据与写面同一条：任意 `##` / `###` 起行都结束段头区
  const body = cut < 0 ? zone : zone.slice(0, cut)
  return body.split(/\r?\n/).map((line) => STATUS_LINE_RE.exec(line)).find(Boolean)?.[1] ?? null
}

/**
 * §N 段尾追加一行（§4.18-B——重开追记行载体；append-only：只追加，既有行字节零变）。
 * 位置 = 段体尾部（下一 `## §` 段头之前 ∥ 文末）；追加行 EOL = §N 段头行自身行尾
 * （`\r\n` ⇒ CRLF ∥ 其余 ⇒ `\n`——探测窗 = 段头行整体〔含行尾〕）。段标题缺失 ⇒ throw。
 */
export function appendLineToSection(src, seg, line) {
  const hdr = sectionHeaderRe(seg).exec(src)
  if (!hdr) {
    throw new Error(`batch: the batch record has no "## §${seg}" section header — cannot append to its tail (create is the skeleton's only authoritative entry). Nothing was written.`)
  }
  const headerLine = /^## §\d[^\r\n]*\r?\n/m.exec(src.slice(hdr.index))
  const eol = headerLine?.[0].endsWith("\r\n") ? "\r\n" : "\n"
  const nextRe = /^## §\d/gm
  nextRe.lastIndex = hdr.index + hdr[0].length
  const next = nextRe.exec(src)
  const endIdx = next ? next.index : src.length
  let before = src.slice(0, endIdx)
  const after = src.slice(endIdx)
  // 只保证「行自成行」：段尾无换行 ⇒ 补一个段头行行尾；已有换行零补（不插空行——只追加判据 = 行数 +1）
  if (!before.endsWith(eol)) before += eol
  return before + line + eol + after
}

/**
 * 重开写盘全文（§4.18-B——已收口档 status(进行中, note 非空)）：一次写盘、两处落笔——
 * ① §1 状态行 → `进行中（重开 <YYYY-MM-DD>）`；② §1 **段尾追加**追记行
 * `**重开记录**：<日期> · 原收口 <旧日期> · 理由 = <note> · 操作者 = 主 agent`
 * （原收口 = 改写前状态行的收口日期字面，无日期字面 ⇒ `未标日期`）。
 * EOL = §1 段头行自身行尾（CRLF 档 ⇒ CRLF）。
 * @param {string} src — 档全文（closed 态）
 * @param {string} note — 重开理由（调用面已验非空单行）
 * @returns {string} 写盘用新全文
 */
export function rewriteAsReopen(src, note) {
  const prevLine = (readBatchStatusLineRaw(src) ?? "").trim()
  const prevDate = /已收口\s*(\d{4}-\d{2}-\d{2})/.exec(prevLine)?.[1] ?? "未标日期"
  const date = todayLocal()
  const withStatus = updateSectionStatusLine(src, 1, `进行中（重开 ${date}）`)
  return appendLineToSection(withStatus, 1, `**重开记录**：${date} · 原收口 ${prevDate} · 理由 = ${note} · 操作者 = 主 agent`)
}

/**
 * 重开回收调点（设计档 §2.13）：写入单源 = `ledgerReclaimBatch`（本档只供 `cwd` 基准、会话 id 与回执形；
 * 工具层零 SQL）。`cwd` = **批档所属项目根**（`resolveLedgerRoot(dirname(<batchDoc>), boundary)?.root`——
 * 不用会话锚：多根工作区锚会收到别的项目根 ⇒ 选行零命中 ⇒ 唯一的机器写静默失效）；`boundary` = 会话锚。
 * 无根 ⇒ 传 `null`（核心不取行，`failed` 点名——不落兜底基准）。
 * **失败以 `failed` 返回**：调用方 `ledgerAfterRecordWrite` 随即回滚档并抛拒，不把半状态留成成功。
 * @param {string} abs — 本批批档绝对路径
 * @param {string} boundary — 会话锚（上溯上界）
 * @returns {Promise<{batch:string, reclaimed:Array, unreclaimable:Array, failed:string|null}>}
 */
export async function reclaimOnReopen(abs, boundary) {
  try {
    const { ledgerReclaimBatch, resolveLedgerRoot } = await import("../ledger.mjs") // 动态 import：ledger-db 静态引 node:sqlite（W8 契约②）
    const { getSessionId } = await import("../session-slots.mjs") // 同一动态 import 面：executor = 本会话（AC-M2-7）
    const root = resolveLedgerRoot(dirname(abs), boundary)?.root ?? null
    // 句内路径统一正斜杠（与 `task_book` 列值同形——`<批名>` 是给人读的事实句，不是平台路径）
    return ledgerReclaimBatch({
      cwd: root,
      batch: root ? relative(root, abs).replace(/\\/g, "/") : abs,
      boundary,
      executorSessionId: getSessionId(),
    })
  } catch (e) {
    // 模块加载与根推导异常也降为失败返回形；调用方回滚档并抛拒，绝不把它当成重开成功。
    return { batch: abs, reclaimed: [], unreclaimable: [], failed: String(e?.message ?? e) }
  }
}

/**
 * 重开回收回执（设计档 §2.13 逐字；空行不出）。
 * 失败不再走本段：回收失败 ⇒ 补偿回滚档 + 抛拒（`reopenLedgerFailedError` / `reopenHalfStateError`），
 * 重开那次调用根本没有回执——「档已开、行仍 `待核销`」正是本批要消掉的那一形（写锁会拒每一笔写盘
 * 且没有任何提示）。
 * @param {{reclaimed:Array, unreclaimable:Array}|null} result
 */
export function reopenReceiptLine(result) {
  if (!result) return ""
  const face = (r) => `#${r.id} 「${r.title}」`
  const lines = []
  if ((result.reclaimed ?? []).length) lines.push(`\n[ledger reopen] 本批待核销行 → 在途 ${result.reclaimed.length} 行：${result.reclaimed.map(face).join("；")}`)
  if ((result.unreclaimable ?? []).length) {
    lines.push(`\n[ledger reopen] 本批已核销行不可回收 ${result.unreclaimable.length} 行：${result.unreclaimable.map(face).join("；")}——已核销为终态，重开不回收；要继续做须另立新行（新档 §1「前情」指回本档）`)
  }
  return lines.join("")
}

/** 重开台账失败拒文（设计档 §2.17 重开步序 4 第一条串，逐字）：档已回滚（= 仍为已收口）⇒ 可原样重试。 */
export function reopenLedgerFailedError(cause) {
  return `batch: reopen failed — 台账事务未提交（${cause}）；批档仍为已收口（已回滚），可原样重试。Ledger: no committed change from this call (it never reached COMMIT).`
}

/** 重开补偿也失败拒文（同节第二条串，逐字——**不得复用第一条**）：残态 = 档已开、本批行仍 `待核销`，
 *  写锁会拒每一笔写盘；查询面同刻必命中 `open-but-unwritable`，所以拒文点名查询面。 */
export function reopenHalfStateError(abs, cause, rollbackCause) {
  return `batch: reopen failed — 台账事务未提交（${cause}）；批档回滚也失败（${rollbackCause}）——半状态成立：批档已开，本批行仍待核销。` +
    `Read it with batch({action:"check", path:"${abs}"}), then repair the ledger before any further write.`
}
