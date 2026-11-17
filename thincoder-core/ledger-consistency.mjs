/**
 * thincoder-core/ledger-consistency.mjs — 台账批-账一致性读数族（从 `ledger-cmd.mjs` 整族搬出，
 * 2026-11-11 · `docs/core/design/BATCH-RECORD.md` §4.18-D「分档结论」②）。
 *
 * 为什么拆：`ledger-cmd.mjs` 改前已越 500（判据单源 = `docs/core/design/DOC-GRAPH.md` §3「行数档位口径」），
 * 而收口重锚族还要在本批加一支；刀法 = 按符号边界整族搬、零语义改。
 *
 * 族 = 半状态出路表 ∥ `unknown` 出口句 ∥ 半状态项构造 ∥ 批-账一致性读数。
 * 本档**只读、零写**——一致性读数是报告，不是写门（写门在 `ledger-write-ops.mjs`）。
 * 出口：`ledger-cmd.mjs` 逐名转出（`ledger.mjs` 的公共面零改 ⇒ 调用方零改）。
 *
 * 判据原文 = `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` §2.17 半状态表 + `docs/core/design/LEDGER.md`
 * §11.2；本档只实现，不另立口径（D2）。
 */
import { readFileSync } from "node:fs"

import { openLedger, resolveLedgerRoot } from "./ledger-db.mjs"
import { resolveDeclaredRef } from "./declaration.mjs"
import { filePartOf, isReservedPointer, namesPointer } from "./ledger-close-proof.mjs"
// 批档 `§1` 状态行三态的唯一判据（`readBatchStatusLine`）——查询面读它与收口门/写锁读同一个函数，
// 两处各推一次必然漂移。依赖单向：`batch-skeleton` 只 import 纯常量档（`batch-segment-vocab`），
// 不反向 import 台账链 ⇒ 无环。
import { readBatchStatusLine, readLedgerHeaderNumbers } from "./agent-tools/batch-skeleton.mjs"
import { assertBatchArg, resolveBatchRows } from "./ledger-write-ops.mjs"

// ── 半状态查询面（设计档 §2.17「半状态查询面」· AC-M2-40——**读，零写**）────────────────────────

/** 半状态六类的出路句（单源 = `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` §2.17 半状态表「出路」列）。 */
const HALF_STATE_EXITS = {
  "closed-but-open-rows": "重开（batch status §1 进行中 + note）后重试收口",
  "closed-but-settling": "同上，或 ledger 批量结算单笔补齐",
  "open-but-unwritable": "收口一次把它结清；或把它退到 在途 继续做",
  "open-but-settled": "直接收口（活已做完、档未冻结）；要继续做须先另立新行认领",
  "pointer-stale": "改指针，或把该行退回 待讨论 交还",
  "header-row-missing": "主路径 = 把该号从档头 台账 行删掉（普通文档写，零台账写、无前置条件）；改完 check 转一致。次路 = 重跑 attach：省略 ledger 开新行受同面判约束；同面还有未决行时须带显式 ledger:\"#N\" 或改用主路径。",
}

/** `record = unknown`（§1 状态行缺行 ∥ 不可解析）时 `open-but-settled` 的出路句：不印「直接收口」——补关入口
 *  恒为 `record = open`（`docs/core/design/BATCH-RECORD.md` §4.18-C），读不出就先修 §1。类名不动（类集合单源 = 设计档 §2.17 表）。 */
const UNKNOWN_RECORD_EXIT = "状态行读不出（§1 无状态行 ∥ 不可解析）——先修 §1 状态行，修好前不按「直接收口」办"

/** 半状态项（`id` = 首个命中行的编号，`rows` = 命中行编号集；`exit` = 出路句——缺省取上表，`unknown` 那格另给）。 */
const halfStateOf = (name, rows, exit) => ({
  name, id: rows.length ? Number(rows[0].id) : null, rows: rows.map((r) => Number(r.id)), exit: exit ?? HALF_STATE_EXITS[name],
})

/**
 * 批-账一致性读数（设计档 §2.17 · AC-M2-40——**只读、零写**：「明确的半状态查询面」，人不必靠一次失败的
 * 写去猜）。判据即定义，六类半状态逐条照同一节的表；`record` 三态判据单源 = `readBatchStatusLine`。
 * **预定行不计入 `pointer-stale`**：档未建是它的合法态（单源 = `docs/core/design/LEDGER.md` §6.4）。
 * `open-but-unwritable` 的三合取（`record = open` ∧ 本批**无** `在途` 行 ∧ 存在 `待核销` 行）缺一不可——
 * 只按前两条判，会把每个「一行先做完、其余还在做」的合法在途批报成不一致，而恒报不一致的读数等于没有
 * 读数；加上第三条，它判的仍是同一件真事：该批此刻没有一条在途行，所以一个字也写不进去。
 * **`open-but-settled` 是预期读形**（重开一份非空全归档批的必然结果——`已核销` 不回收），不是缺陷；空行集不命中。
 * 判据 = `record !== "closed"` ∧ 行集非空 ∧ 全归档（`docs/core/design/LEDGER.md` §11.2）：`unknown` 照报
 * （不可判必须可见，不许静默当作已收口），但出路句换成「先修 §1」、不印「直接收口」——补关入口恒为
 * `record = open` 且 `halfStates` 恰为唯一本项目。
 * `closed-but-open-rows` 同读 `status` 与 `trigger`：在途恒算；等待态只在 trigger 非条件且非认账不排期时算。
 * `header-row-missing` 只判档头号在 items 无同号行；行存在但已解绑不计入。
 * @param {{cwd?:string, batch?:string, boundary?:string}} o — `cwd` = 批档所属项目根；`boundary` = 会话锚
 * @returns {{batch:string, record:"open"|"closed"|"unknown", rows:{id:number,status:string,trigger:string|null,title:string}[],
 *   headerRows:{id:number,inLedger:boolean}[], halfStates:{name:string,id:number|null,rows:number[],exit:string}[], consistent:boolean}}
 */
export function batchLedgerConsistency({ cwd, batch, boundary } = {}) {
  const derived = cwd == null ? null : resolveLedgerRoot(cwd, boundary)
  if (!derived) throw new Error(`batchLedgerConsistency：批档所属项目根不可推导（${cwd ?? "（缺 cwd）"}）`)
  const base = derived.root
  const abs = assertBatchArg("batchLedgerConsistency", base, batch)
  let src = ""
  try { src = readFileSync(abs, "utf8") } catch { src = "" } // 不可读 ⇒ 三态里的 `unknown`（fail-closed 同语义）
  const record = readBatchStatusLine(src)
  const db = openLedger(base, { readOnly: true, boundary })
  let rows = []
  let headerRows = readLedgerHeaderNumbers(src).map((id) => ({ id, inLedger: false }))
  if (db) {
    try {
      rows = resolveBatchRows(db, base, abs)
      const exists = db.prepare("SELECT 1 FROM items WHERE id = ?")
      headerRows = headerRows.map((h) => ({ ...h, inLedger: exists.get(h.id) !== undefined }))
    } finally { db.close() }
  }
  const inFlight = rows.filter((r) => r.status === "在途")
  const waitingUnreanchored = rows.filter((r) =>
    (r.status === "待讨论" || r.status === "待设计") && r.trigger !== "条件" && r.trigger !== "认账不排期")
  const openRows = [...inFlight, ...waitingUnreanchored]
  const settling = rows.filter((r) => r.status === "待核销")
  const archived = rows.filter((r) => r.status === "已核销" || r.status === "已废弃")
  const missingHeaderRows = headerRows.filter((h) => !h.inLedger)
  const stale = rows.filter((r) => {
    if (isReservedPointer(r.task_book)) return false // 预定行（值尾带标记）不计入：档未建是它的合法态
    const part = filePartOf(r.task_book)
    return part === "" ? namesPointer(r.task_book) : !resolveDeclaredRef(base, part).ok
  })
  const halfStates = []
  if (record === "closed" && openRows.length) halfStates.push(halfStateOf("closed-but-open-rows", openRows))
  if (record === "closed" && settling.length) halfStates.push(halfStateOf("closed-but-settling", settling))
  if (record === "open" && inFlight.length === 0 && settling.length) halfStates.push(halfStateOf("open-but-unwritable", settling))
  if (record !== "closed" && rows.length > 0 && archived.length === rows.length) {
    halfStates.push(record === "open"
      ? halfStateOf("open-but-settled", rows)
      : halfStateOf("open-but-settled", rows, UNKNOWN_RECORD_EXIT))
  }
  if (stale.length) halfStates.push(halfStateOf("pointer-stale", stale))
  if (missingHeaderRows.length) halfStates.push(halfStateOf("header-row-missing", missingHeaderRows))
  return {
    batch,
    record,
    rows: rows.map((r) => ({ id: Number(r.id), status: r.status, trigger: r.trigger ?? null, title: r.title })),
    headerRows,
    halfStates,
    consistent: halfStates.length === 0,
  }
}
