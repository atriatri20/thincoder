/**
 * thincoder-core/ledger-close.mjs — 台账收口重锚族（从 `ledger-cmd.mjs` 整族搬出，2026-11-11 ·
 * `docs/core/design/BATCH-RECORD.md` §4.18-D「分档结论」①）。
 *
 * 为什么拆：`ledger-cmd.mjs` 改前已越 500（判据单源 = `docs/core/design/DOC-GRAPH.md` §3「行数档位口径」），
 * 而收口重锚族还要在本批加一支（被取代的收口要关掉「每条在途行都须点名」那一臂）；刀法 = 按符号边界
 * 整族搬、零语义改。
 *
 * 族 = 完成清单判据 ∥ 收口分流 ∥ 证据判据 ∥ 证据前缀 ∥ 收口只读预检 ∥ 收口重锚。
 * 出口：`ledger-cmd.mjs` 逐名转出（`ledger.mjs` 的公共面零改 ⇒ 调用方零改）。
 * `localDay` 随族搬入（`closeEvidenceText` 依赖它）：`ledger-cmd.mjs` 反向 import 取用——依赖单向，无环。
 *
 * 判据原文 = `docs/core/design/LEDGER.md` §10.2 ∥ §2.17 收口步序（写序与补偿单源 =
 * `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` §2.17）；本档只实现。
 */
import { openLedger, resolveLedgerRoot } from "./ledger-db.mjs"
import { filePartOf } from "./ledger-close-proof.mjs"
import {
  applyRowClose, applyRowUpdateTx, assertBatchArg, evidenceValue, resolveBatchRows,
} from "./ledger-write-ops.mjs"

/** 本地日界（`YYYY-MM-DD`）——`resume_due` 比较粒度（设计档 §3.7：本地日界，当日锚当日即到期）。 */
export const localDay = (ms) => { const d = new Date(ms); const p = (n) => String(n).padStart(2, "0"); return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}` }

/** 完成清单共用判据：必填数字数组、无重复、每个 id 都属于本批且现态为在途；`requireAllInFlight = true`
 *  时还要求所有在途行都点名。
 *  `认账不排期` 只是非活跃行的重锚政策，不能让在途行绕过完成清单。
 *  **`requireAllInFlight` 无缺省**（`docs/core/design/BATCH-RECORD.md` §4.18-D「③ 的实现面」）：缺省值就等于
 *  替调用方决定「没做完的行算不算完成」——正常两路传 `true`，被取代的收口传 `false`，写成必传。 */
function completedSetForRows(completed, rows, { requireAllInFlight } = {}) {
  if (typeof requireAllInFlight !== "boolean") {
    throw new Error("ledgerCloseDisposition：requireAllInFlight 必传（true ∥ false，无缺省）——缺省值等于替调用方决定「没做完的行算不算完成」；正常收口传 true，被取代的收口传 false")
  }
  if (!Array.isArray(completed)) {
    throw new Error("ledgerCloseDisposition：completed 必填（数字数组）；先退回未完成的在途行，再重试")
  }
  const ids = new Set()
  for (const id of completed) {
    if (typeof id !== "number" || !Number.isInteger(id) || id <= 0) {
      throw new Error(`ledgerCloseDisposition：completed 含非法 id ${JSON.stringify(id)}（须为正整数）；先退回未完成的在途行，再重试`)
    }
    if (ids.has(id)) throw new Error(`ledgerCloseDisposition：completed 含重复 id #${id}；先退回未完成的在途行，再重试`)
    ids.add(id)
  }
  const byId = new Map(rows.map((r) => [Number(r.id), r]))
  for (const id of ids) {
    const row = byId.get(id)
    if (!row || row.status !== "在途") {
      throw new Error(`ledgerCloseDisposition：completed 含非本批在途行 #${id}（须属于本批且现态 在途）；先退回未完成的在途行，再重试`)
    }
  }
  const missing = requireAllInFlight
    ? rows.filter((r) => r.status === "在途" && !ids.has(Number(r.id))).map((r) => `#${r.id}`)
    : []
  if (missing.length) {
    throw new Error(`ledgerCloseDisposition：completed 漏列在途行 ${missing.join(", ")}；先退回未完成的在途行，再重试`)
  }
  return ids
}

function closeDisposition(db, base, abs, completed, { requireAllInFlight }) {
  const rows = resolveBatchRows(db, base, abs)
  return { rows, completedIds: completedSetForRows(completed, rows, { requireAllInFlight }) }
}

/** 收口证据判据（单源 = `docs/core/design/LEDGER.md` §10.2「`closeEvidence` 非空白」）：
 *  缺 / 空串 / 全空白 ⇒ 拒；返回 trim 后的本笔证据。 */
function assertCloseEvidenceValue(closeEvidence) {
  if (closeEvidence == null || String(closeEvidence).trim() === "") {
    throw new Error("ledgerCloseDisposition：closeEvidence 必填（本笔工作证据，非空字符串）—— 收口即核销，证据由本笔给、机器不代写；写一句本批做了什么，再重试")
  }
  return String(closeEvidence).trim()
}

/** 行上落证据的前缀（设计档 §2.17 收口步序 5）：`收口 <YYYY-MM-DD>：<closeEvidence>`——人手证据与收口
 *  证据在行上可分，而写入仍走既有追加规则（`evidenceValue` 的 `旧｜新`）。 */
const closeEvidenceText = (evidence) => `收口 ${localDay(Date.now())}：${evidence}`

/** 收口只读预检：与重锚共用完成清单判据，不开写事务、不改台账。
 *  `closeEvidence` 是预检的一格（设计档 §10.2）：本笔证据由调用方给，机器不代写——代写一句就把核销门
 *  变成摆设。空白（缺 / 空串 / 全空白）⇒ 写档前拒，令牌 ∥ 档 ∥ 账零改。 */
export function assertLedgerCloseDisposition({ cwd, batch, boundary, completed, closeEvidence, requireAllInFlight } = {}) {
  const derived = cwd == null ? null : resolveLedgerRoot(cwd, boundary)
  if (!derived) throw new Error(`assertLedgerCloseDisposition：批档所属项目根不可推导（${cwd ?? "（缺 cwd）"}）`)
  const base = derived.root
  const abs = assertBatchArg("assertLedgerCloseDisposition", base, batch)
  const db = openLedger(base, { readOnly: true, boundary })
  if (!db) {
    completedSetForRows(completed, [], { requireAllInFlight }) // 两道必填的判序：完成清单在前（既有教学面），证据格随后
    assertCloseEvidenceValue(closeEvidence)
    return { batch, completed: [...completed] }
  }
  try {
    closeDisposition(db, base, abs, completed, { requireAllInFlight })
    assertCloseEvidenceValue(closeEvidence)
    return { batch, completed: [...completed] }
  } finally { db.close() }
}

/** 未点名 `在途` 行的去向（§4.18-D「③ 的实现面」——只由 `requireAllInFlight = false` 那一路走到）：
 *  ① 退回边 `在途 → 待讨论`（迁移表判 + 写门逐跳判；出边自动清 `task_book` / `trigger` / `executor`，
 *  `evidence` = 退回理由——退回边要求本笔理由非空，续启句就是那句理由）；
 *  ② 既有的 `conditioned` 改挂：`trigger = 条件` + 续启句（`resume_when` 为空 ⇒ 落 `resume_when`；已在场
 *  ⇒ 保留现值，续启句随 ① 已入 `evidence`）。
 *  **为什么两步而不是一步**：`inFlight` 恒计不看 `trigger`（`batchLedgerConsistency` 的判据一），而行留在
 *  `在途` 就进不了 `conditioned` 支——只挂 `trigger` 的行看着够，读数仍报在途未结。
 *  @returns {"resume_when"|"evidence"} 续启句落在哪一格（同 `conditioned` 支的 `sentenceTo`） */
function retreatInFlightRow(db, base, row, boundary, sentence) {
  applyRowUpdateTx(db, base, row, { status: "待讨论", evidence: sentence }, null, boundary, { base })
  const hopped = db.prepare("SELECT * FROM items WHERE id = ?").get(row.id)
  const kept = hopped.resume_when != null && String(hopped.resume_when).trim() !== ""
  db.prepare("UPDATE items SET trigger = ?, resume_when = ? WHERE id = ?")
    .run("条件", kept ? hopped.resume_when : sentence, hopped.id)
  return kept ? "evidence" : "resume_when"
}

/** 收口重锚（设计档 §6.2 ∥ §2.17 收口步序 5）——**收口即结算**：同一事务内
 *  ① 完成清单点名的 `在途` 行两跳至 `已核销`（`在途 → 待核销 → 已核销`，中间态不出事务）；
 *  ② 本批既有 `待核销` 行一并结清（它们是「已做完、没结账」的行）；
 *  ③ `待讨论` / `待设计` 行仍按既有规则改挂条件；`认账不排期` 的非活跃行与归档态零触；
 *  ④ `requireAllInFlight = false`（被取代的收口）时，未点名的 `在途` 行走 `retreatInFlightRow`
 *  退回 `待讨论` 并改挂条件，产 `retreated`。
 *  两跳逐跳走既有写核（迁移表 ∥ 写门 ∥ 核销门逐跳判），不直写 SQL；每行结清时把 `closeEvidence`
 *  按既有追加规则写入 `evidence`，前置 `收口 <YYYY-MM-DD>：`（人手证据与收口证据在行上可分）。
 *  任一行拒 ⇒ `ROLLBACK`、台账零改、返回形 `failed`；档账跨存储的写序与补偿不在此承诺
 *  （单源 = `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` §2.17）。
 *  @returns {{batch:string, settled:{id:number,title:string,from:"在途"|"待核销"}[], conditioned:object[],
 *    retreated:object[], alreadyAnchored:object[], failed:string|null}} `settled` 逐行点名每一枚被结清的行（含起点——
 *    两种起点的回执各一行）；`conditioned` = 改挂条件的行；`retreated` = 退回边走过的行（仅 `requireAllInFlight = false` 那一路可能非空）。 */
export function ledgerReanchorBatch({ cwd, batch, boundary, completed, closeEvidence, requireAllInFlight } = {}) {
  const failedResult = (why) => ({ batch, settled: [], conditioned: [], retreated: [], alreadyAnchored: [], failed: why })
  const derived = cwd == null ? null : resolveLedgerRoot(cwd, boundary)
  if (!derived) return failedResult("批档所属项目根不可推导")
  const base = derived.root
  let evidenceText
  try { evidenceText = closeEvidenceText(assertCloseEvidenceValue(closeEvidence)) } catch (e) { return failedResult(String(e?.message ?? e)) }
  let db
  try { db = openLedger(base, { boundary }) } catch (e) { return failedResult(String(e?.message ?? e)) }
  if (!db) {
    try { completedSetForRows(completed, [], { requireAllInFlight }) } catch (e) { return failedResult(String(e?.message ?? e)) }
    return { batch, settled: [], conditioned: [], retreated: [], alreadyAnchored: [], failed: null }
  }
  try {
    let abs
    try { abs = assertBatchArg("ledgerReanchorBatch", base, batch) } catch (e) { return failedResult(String(e?.message ?? e)) }
    const sentence = `原批 ${filePartOf(batch)} 已收口，须另起批次接手`
    try {
      db.exec("BEGIN IMMEDIATE")
      const { rows, completedIds } = closeDisposition(db, base, abs, completed, { requireAllInFlight })
      const settled = [], conditioned = [], retreated = [], alreadyAnchored = []
      for (const row of rows) {
        const face = { id: Number(row.id), title: row.title }
        if (row.status === "在途") {
          if (!completedIds.has(Number(row.id))) {
            if (requireAllInFlight) throw new Error(`ledgerReanchorBatch：在途行 #${row.id} 未经完成清单点名`)
            retreated.push({ ...face, status: "待讨论", sentenceTo: retreatInFlightRow(db, base, row, boundary, sentence) })
            continue
          }
          // 跳 1（在途 → 待核销）：迁移表 + 写门逐跳判；出边自动清 executor
          applyRowUpdateTx(db, base, row, { status: "待核销" }, null, boundary, { base })
          // 跳 2（待核销 → 已核销）：核销门判应用本笔后的 evidence，并落 closed_at；锚批门在 §1 已收口后读回 closed
          const hopped = db.prepare("SELECT * FROM items WHERE id = ?").get(row.id)
          applyRowClose(db, hopped, "已核销", evidenceText, false, { base })
          settled.push({ ...face, from: "在途" })
          continue
        }
        if (row.status === "待核销") {
          applyRowClose(db, row, "已核销", evidenceText, false, { base })
          settled.push({ ...face, from: "待核销" })
          continue
        }
        if (row.trigger === "认账不排期") continue
        if (row.status !== "待讨论" && row.status !== "待设计") continue
        if (row.trigger === "条件") { alreadyAnchored.push({ ...face, status: row.status }); continue }
        const kept = row.resume_when != null && String(row.resume_when).trim() !== ""
        const nextEvidence = kept ? evidenceValue("ledgerReanchorBatch", row.evidence, sentence, false) : row.evidence
        db.prepare("UPDATE items SET trigger = ?, resume_when = ?, evidence = ? WHERE id = ?")
          .run("条件", kept ? row.resume_when : sentence, nextEvidence, row.id)
        conditioned.push({ ...face, status: row.status, sentenceTo: kept ? "evidence" : "resume_when" })
      }
      db.exec("COMMIT")
      return { batch, settled, conditioned, retreated, alreadyAnchored, failed: null }
    } catch (e) {
      try { db.exec("ROLLBACK") } catch { /* 事务未开 / 已结 */ }
      return failedResult(String(e?.message ?? e))
    }
  } finally { db.close() }
}
