/**
 * ledger-cmd.mjs — 台账核心函数档（查询 = 只读全角色 / 写 = 仅主 agent 装配）。
 * 工具定义 + 工具层参数守卫 = 拆分件 `thincoder-core/ledger-tools.mjs`（2026-09-28 守卫族微修批 ·
 * 台账 #473——纯搬移、语义零变）；逐行写核 + 两个批级写点 = 拆分件 `thincoder-core/ledger-write-ops.mjs`
 * （2026-10-27 三链统一批——本档收尾 455 行，新增两枚批级写点会越 500 顾问线，故外提；本档反向 import
 * 取用并 re-export，公共面逐字不变）。核函数（`ledgerQuery` / `ledgerCount` / `ledgerAdd` /
 * `ledgerUpdate` / `ledgerClose` + 批级批量 `ledgerUpdateBatch` / `ledgerCloseBatch` + 重锚单源
 * `ledgerReanchorBatch`）留本档，工具档消费之；`ledgerBindBatch` / `ledgerReclaimBatch` 由本档
 * re-export（设计档 §2.4 / §2.13 的公共面落点不变）。
 *
 * 读数面（逐行携、不入库、不入 `DATA_COLUMNS`——先例 = `aged`）：`evidenceTooLong`（§5 P4 文字太长）∥
 * `overdue`（§3.7 出口态——机判单源 `overdueOf`）∥ `taskBookOnDisk`（§7.1 B——指针在盘读数）。
 * 三枚皆**读数非闸门**（不拒任何写入）。
 * 指针判据重锚面（§6.1 两臂写门 ∥ §6.2 收口重锚 · 台账 #1550）：写门判**本笔写入面**、只判本笔新指名；
 * 「档此刻在不在盘」降为读数——读面导出 `ledgerBatchRows`、收口重锚单源 `ledgerReanchorBatch`。
 * 批量面（§3.3 P1）：选行单源 `resolveBatchRows` + 逐行落笔 `applyRowUpdate` / `applyRowClose`
 * （与单行形共函数——迁移表判 / 写门 / evidence 门逐行照判）。
 * 核销工作证据门：两处逐行写核先算应用本笔后的 evidence，再由 `ledger-close-proof.mjs`
 * 判其非空白；批档在盘、收口与评审状态不进入核销判据。
 *
 * 接线（设计档 §2.2 命令面接线）：族出口 = `ledger.mjs`（re-export 两源——KD-M2-3）；查询命令 ←
 * tools/index.mjs（assembleBuiltinTools 全角色面）；写命令 ← agent/family-tools.mjs（assembleFamilyTools
 * 的 depthOnly 分支）——一律**动态 import** 本模块链（ledger-db.mjs 静态 import node:sqlite ⇒
 * 消费侧静态 import 会破 W8 契约②）。
 */
import { readFileSync } from "node:fs"

import { AGING_DAYS, EVIDENCE_TOO_LONG_MAX, PENDING_STATUSES, nowIso, openLedger, resolveLedgerRoot } from "./ledger-db.mjs"
import { resolveDeclaredRef } from "./declaration.mjs"
import { filePartOf, isReservedPointer, namesPointer } from "./ledger-close-proof.mjs"
// 批档 `§1` 状态行三态的唯一判据（`readBatchStatusLine`）——查询面读它与收口门/写锁读同一个函数，
// 两处各推一次必然漂移。依赖单向：`batch-skeleton` 只 import 纯常量档（`batch-segment-vocab`），
// 不反向 import 台账链 ⇒ 无环。
import { readBatchStatusLine, readLedgerHeaderNumbers } from "./agent-tools/batch-skeleton.mjs"
import {
  applyRowClose, applyRowUpdate, applyRowUpdateTx, assertBatchArg, assertTaskBookGate, baseOf, evidenceValue, resolveBatchRows,
} from "./ledger-write-ops.mjs"

export { ledgerBindBatch, ledgerReclaimBatch } from "./ledger-write-ops.mjs"

/** 逐行老化判真（LEDGER.md §13.4 · 2026-10-07 批 ledger-tool）：未决四态（`PENDING_STATUSES`）∧
 *  行龄 > `AGING_DAYS` 天；行龄源 = `updated_at ?? created_at`（§5 同源）；时间戳缺 / 不可解析
 *  ⇒ `false`（零假阳降级——与 `buildScan` 行龄口径同源）。 */
function isRowAged(row, now) {
  if (!PENDING_STATUSES.includes(row.status)) return false
  const t = row.updated_at ?? row.created_at
  if (t == null) return false
  const ms = Date.parse(String(t))
  return Number.isFinite(ms) && (now - ms) / 86400000 > AGING_DAYS
}

/** `evidence` 文字太长读数（设计档 §5 P4——**读数非闸门**）：缺 / 空 ⇒ false；`query` 逐行携（含归档
 *  行——行值事实）；`count` 的统计集 = 未决四态（§7.1）。 */
const isEvidenceTooLong = (row) => row?.evidence != null && String(row.evidence).length > EVIDENCE_TOO_LONG_MAX

/** 本地日界（`YYYY-MM-DD`）——`resume_due` 比较粒度（设计档 §3.7：本地日界，当日锚当日即到期）。 */
const localDay = (ms) => { const d = new Date(ms); const p = (n) => String(n).padStart(2, "0"); return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}` }

/** 复启锚判定（设计档 §3.4「锚判定文法」单源）：从左到右取首个 `@` 起始 token——
 *  ① 形合 `^\d{4}-\d{2}-\d{2}$` ∧ 真日历日（回写一致）⇒ 日期锚；② 含 `@` 而非日期锚 ⇒ 事件锚
 *  （fail-safe：机器不判 due，零假阳）；③ 无 `@` token ⇒ `free`。 */
function resumeAnchor(text) {
  const m = /@(\S+)/.exec(String(text ?? "")) // token = 「`@` 后非空白连续串」（零长 `@` 不算 token ⇒ free）
  if (!m) return { kind: "free", day: null }
  const tok = m[1]
  if (/^\d{4}-\d{2}-\d{2}$/.test(tok)) {
    const ms = Date.parse(`${tok}T00:00:00`)
    if (Number.isFinite(ms) && localDay(ms) === tok) return { kind: "date", day: tok }
  }
  return { kind: "event", day: null }
}

/** 指针在盘判（设计档 §7.1 B 判定本体）：`query` 逐行读数键 `taskBookOnDisk` 与出口态 `dangling`
 *  **共用同一判据**——解析成立（= 档在盘）⇒ true；缺指针 / 不可解析 / 档不在盘 ⇒ false。**读数非闸门**。 */
const pointerOnDisk = (row, base) => { const part = filePartOf(row?.task_book); return part !== "" && resolveDeclaredRef(base, part).ok }

/** 出口面机判单源（设计档 §3.7 ①——只由行数据 + 盘面事实判；射程 = 未决四态，归档态恒 `null`）：
 *  四类出口态**首中优先**（序 = `resume_due` → `dangling` → `unlabeled` → `aged`）；返回出口态字串
 *  ∥ `null`。`unlabeled`（`trigger IS NULL` ∧ 超龄）⊆ `aged` ⇒ 必先于 `aged` 判（否则永不返回）。
 *  `resume_due` 比较粒度 = 本地日界（锚日 ≤ 当地日 ⇒ 到期；不按时刻比）。 */
export function overdueOf(row, { now = Date.now(), base } = {}) {
  if (!PENDING_STATUSES.includes(row?.status)) return null
  if (row.trigger === "条件") {
    const anchor = resumeAnchor(row.resume_when)
    if (anchor.day !== null && anchor.day <= localDay(now)) return "resume_due"
  }
  if (row.trigger === "归批" && !pointerOnDisk(row, base)) return "dangling"
  if (row.trigger == null && isRowAged(row, now)) return "unlabeled"
  if (isRowAged(row, now)) return "aged"
  return null
}

/** 查询（只读，全角色）：SELECT 行集（status / kind / board / trigger / task_book 等值过滤并取，缺省 =
 *  全部行；id 升序）。库不在 = 空账。只读开库（readOnly 句柄 + 零 DDL/ALTER——read-data-interface 批
 *  FR2③）；库档非台账库 ⇒ 空账。逐行携计算字段（均不入库、不入导出白名单 `DATA_COLUMNS`）：
 *  `aged`（§13.4）∥ `evidenceTooLong`（§5 P4 文字太长读数）∥ `taskBookOnDisk`（§7.1 B 在盘读数）∥ `overdue`
 *  （§3.7 出口态字串 ∥ null——机判单源 `overdueOf`）；`task_book` = 第 5 枚等值过滤（**原值等值**——列串直比，与 §3.3 选行的
 *  「文件部分解析同址」两径口径不同、各自单源）；`trigger` 过滤仅三枚举等值（`NULL` 不过滤）；
 *  `now` = 注入缝（确定性用例）。 */
export function ledgerQuery({ cwd, boundary, status = null, kind = null, board = null, trigger = null, task_book = null, now = Date.now() } = {}) {
  const db = openLedger(cwd, { readOnly: true, boundary })
  if (!db) return []
  try {
    const where = [], args = []
    if (status) { where.push("status = ?"); args.push(status) }
    if (kind) { where.push("kind = ?"); args.push(kind) }
    if (board) { where.push("board = ?"); args.push(board) }
    if (trigger) { where.push("trigger = ?"); args.push(trigger) }
    if (task_book) { where.push("task_book = ?"); args.push(task_book) }
    const rows = db.prepare(`SELECT * FROM items${where.length ? ` WHERE ${where.join(" AND ")}` : ""} ORDER BY id`).all(...args)
    const base = baseOf(cwd, boundary)
    return rows.map((r) => ({ ...r, aged: isRowAged(r, now), evidenceTooLong: isEvidenceTooLong(r), taskBookOnDisk: pointerOnDisk(r, base), overdue: overdueOf(r, { now, base }) }))
  } finally { db.close() }
}

/** 计数单源（只读，全角色）：回报 `{ count, overdue, evidenceTooLong }`（设计档 §7.1——原裸数出参
 *  改对象形，消费面同批改）。`count` = 未决四态行数；`overdue` = 其中命中出口态的行数（`overdueOf`
 *  机判单源）；`evidenceTooLong` = 其中 `evidence` 文字太长的行数（§5）。**一次 SELECT + 逐行判**——
 *  `evidenceTooLong` 与 `overdue` 同一次遍历（零额外 IO；成本模型 = §7.2）；不设缓存（读数须反映
 *  即时盘面）。库不在 = 三零。 */
export function ledgerCount({ cwd, boundary, task_book = null } = {}) {
  const db = openLedger(cwd, { readOnly: true, boundary })
  if (!db) return { count: 0, overdue: 0, evidenceTooLong: 0 }
  try {
    const where = [`status IN (${PENDING_STATUSES.map(() => "?").join(",")})`], args = [...PENDING_STATUSES]
    if (task_book) { where.push("task_book = ?"); args.push(task_book) }
    const rows = db.prepare(`SELECT * FROM items WHERE ${where.join(" AND ")}`).all(...args)
    const now = Date.now(), base = baseOf(cwd, boundary)
    let overdue = 0, tooLong = 0
    for (const r of rows) {
      if (overdueOf(r, { now, base }) !== null) overdue++
      if (isEvidenceTooLong(r)) tooLong++
    }
    return { count: rows.length, overdue, evidenceTooLong: tooLong }
  } finally { db.close() }
}

/** `evidence` 文字太长的行数（设计档 §7.1 导出面——`count` 回报读数**同一单源**：本函数为其薄委托，
 *  不另立第二判定面）。 */
export function ledgerEvidenceTooLong({ cwd, boundary, task_book = null } = {}) {
  return ledgerCount({ cwd, boundary, task_book }).evidenceTooLong
}

/** 新增（写命令，仅主 agent）：INSERT——入待讨论（六态状态机入口）。`row.resume_when` 可空（§3.4）。 */
export function ledgerAdd({ cwd, row, boundary }) {
  const db = openLedger(cwd, { create: true, boundary })
  try {
    // 结果行状态 = INSERT 硬编码「待讨论」⇒ 臂① 的 `status` 半幅当下不触；`trigger=归批` 半幅与臂② 照判
    assertTaskBookGate(cwd, "ledgerAdd", {
      status: "待讨论",
      trigger: row.trigger ?? null,
      taskBook: row.task_book ?? null,
      wroteTaskBook: namesPointer(row.task_book),
      wroteBatchTrigger: row.trigger === "归批",
    }, boundary)
    const now = nowIso()
    const r = db.prepare(`INSERT INTO items (kind, status, title, board, req_doc, task_book, evidence, trigger, resume_when, created_at, updated_at) VALUES (?, '待讨论', ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .run(row.kind, row.title, row.board ?? null, row.req_doc ?? null, row.task_book ?? null, row.evidence ?? null, row.trigger ?? null, row.resume_when ?? null, now, now)
    return Number(r.lastInsertRowid)
  } finally { db.close() }
}

/** 更新（写命令，仅主 agent）：UPDATE——状态迁移前判允许迁移表（不在表内 → 拒，行不变）。
 *  executor 目标值随同一 UPDATE 落列（LEDGER.md §3.1）；executorSessionId = 调用会话（函数参数注入——K-LX1
 *  纯函数可测；工具层动态 import getSessionId() 供值，零新静态边）。
 *  `evidence` 传值 = 追加缺省、`patch.evidenceReplace` = 布尔覆盖旗（§13.9——值计算 / 两拒面 = `evidenceValue`
 *  / `assertEvidenceValue`；判位 = 本语义段，随 executor 目标值同拍）。**单行形**（`id`）——逐行落笔 =
 *  `applyRowUpdate`（自开事务：半途抛 ⇒ 行零改）。 */
export function ledgerUpdate({ cwd, id, patch, executorSessionId, boundary, agent }) {
  const db = openLedger(cwd, { create: true, boundary })
  try {
    const row = db.prepare("SELECT * FROM items WHERE id = ?").get(id)
    if (!row) throw new Error(`ledgerUpdate：行 ${id} 不存在`)
    const out = applyRowUpdate(db, cwd, row, patch, executorSessionId, boundary, { agent, base: baseOf(cwd, boundary) })
    return out.reason === undefined ? { id: out.id } : { id: out.id, reason: out.reason }
  } finally { db.close() }
}

/** 收口（写命令，仅主 agent）：核销只有 `待核销 → 已核销` 一条边；撤回只允许未归档态。
 *  证据先按本笔补丁计算，再判核销工作证据非空白；两种归档态都拒绝后续归档写入。
 *  事务包裹，逐行落笔 = `applyRowClose`。 */
export function ledgerClose({ cwd, id, status, evidence, evidenceReplace, boundary, agent }) {
  if (status !== "已核销" && status !== "已废弃") throw new Error(`ledgerClose：目标态 ${status} ∉ {已核销, 已废弃}`)
  const db = openLedger(cwd, { create: true, boundary })
  try {
    db.exec("BEGIN")
    try {
      const row = db.prepare("SELECT * FROM items WHERE id = ?").get(id)
      if (!row) throw new Error(`ledgerClose：行 ${id} 不存在`)
      const out = applyRowClose(db, row, status, evidence, evidenceReplace, { agent, base: baseOf(cwd, boundary) })
      db.exec("COMMIT")
      return out
    } catch (e) { db.exec("ROLLBACK"); throw e }
  } finally { db.close() }
}

// ── 批级批量迁移与结算（设计档 §3.3 · P1 · AC-M2-26 ∥ AC-M2-27）────────────────

/** 批级批量迁移（设计档 §3.3）：`patch.status` 在场 ⇒ 逐行按既有迁移表重判；不在场 ⇒ **纯字段补丁**
 *  （`status` 零写、迁移表不判、`executor` 普通补丁语义——回执 `status` 键 = `null`）。
 *  **门拒 ≠ 事务失败**：逐行门（迁移表 / §6.1 写门 / evidence 门）抛错 ⇒ 本行捕获计入 `skipped`
 *  （`why` = 该门拒因文案原文），其余行照落；**事务级失败**（取写锁 / `COMMIT` 层）⇒ 整批 `ROLLBACK`
 *  并抛（零行改）——故「部分落地」只由逐行门拒产生，「中途失败」不留半批。
 *  `BEGIN IMMEDIATE`：写锁一次先把（逐行不升级锁 ⇒ 事务级失败在首行之前即失败）。
 *  核销只读应用本笔后的工作证据，本径不预读批档或令牌归属。
 *  @returns {{batch: string, status: string|null, applied: number[], skipped: {id: number, from: string, why: string}[]}} */
export function ledgerUpdateBatch({ cwd, batch, patch = {}, executorSessionId, boundary, agent }) {
  const db = openLedger(cwd, { create: true, boundary })
  try {
    const base = baseOf(cwd, boundary)
    const abs = assertBatchArg("ledgerUpdate", base, batch)
    const proof = { agent, base }
    db.exec("BEGIN IMMEDIATE")
    try {
      const applied = [], skipped = []
      for (const row of resolveBatchRows(db, base, abs)) {
        try { applied.push(applyRowUpdate(db, cwd, row, patch, executorSessionId, boundary, proof, true).id) }
        catch (e) { skipped.push({ id: Number(row.id), from: row.status, why: String(e?.message ?? e) }) }
      }
      db.exec("COMMIT")
      return { batch, status: patch.status ?? null, applied, skipped, ...(patch.status === "待讨论" && patch.evidence != null ? { reason: patch.evidence } : {}) }
    } catch (e) { db.exec("ROLLBACK"); throw e }
  } finally { db.close() }
}

/** 批级批量结算（设计档 §3.3）：**只销已到 `待核销` 的行**（勾销径）；`待讨论` / `待设计` ⇒ `skipped`
 *  逐行点名（**须先 `update` 到 `在途` 认领**——无核销边可走，统一文本会造假账），`在途` ⇒
 *  `skipped` 逐行点名（不可跳）。**归档态（`已核销` / `已废弃`）行 ⇒ 静默不计**（不入 `applied`、
 *  不入 `skipped`——归档行本非结算对象，点名会让每批重跑刷屏）。`evidence` 逐行追加同一文本
 *  （`evidenceValue` 同源）。回执 `status` 恒 `已核销`（批量形缺省 = 勾销单值；携则守卫已收窄为
 *  `{已核销}`——§3.2 `whenPresent`）。事务语义同 `ledgerUpdateBatch`。
 *  @returns {{batch: string, status: string, applied: number[], skipped: {id: number, from: string, why: string}[]}} */
export function ledgerCloseBatch({ cwd, batch, evidence, evidenceReplace, boundary, agent }) {
  const status = "已核销"
  const db = openLedger(cwd, { create: true, boundary })
  try {
    const base = baseOf(cwd, boundary)
    const abs = assertBatchArg("ledgerClose", base, batch)
    const proof = { agent, base } // 保留既有调用签名；核销工作证据门不读批档或评审运行态
    db.exec("BEGIN IMMEDIATE")
    try {
      const applied = [], skipped = []
      for (const row of resolveBatchRows(db, base, abs)) {
        if (row.status === "已核销" || row.status === "已废弃") continue // 归档态静默不计
        if (row.status !== "待核销") {
          const why = row.status === "在途" ? "ledgerClose：在途不可跳（须先 待核销）" : "ledgerClose：待认领不可核销（须先 update 到 在途）"
          skipped.push({ id: Number(row.id), from: row.status, why })
          continue
        }
        try { applied.push(applyRowClose(db, row, status, evidence, evidenceReplace, proof).id) }
        catch (e) { skipped.push({ id: Number(row.id), from: row.status, why: String(e?.message ?? e) }) }
      }
      db.exec("COMMIT")
      return { batch, status, applied, skipped }
    } catch (e) { db.exec("ROLLBACK"); throw e }
  } finally { db.close() }
}

// ── 指针判据重锚面（设计档 §7.1 · B 读数 ∥ C 收口重锚 · 台账 #1550）────────────────

/** 本批行集（只读，任意状态——设计档 §7.1）：批身份单源 = `resolveBatchRows` 解析同址（零二写）；
 *  逐行携读数 `taskBookOnDisk`（不入库、不入 `DATA_COLUMNS`）。`batch` 不可解析 ∥ 无根 ⇒ 抛（同族
 *  `assertBatchArg` 形）；库不在 ⇒ 空集。`cwd` 口径 = 批档所属项目根（§6.2 `cwd` 基准——不用会话锚）；
 *  `boundary` = 上溯上界（会话锚——与工具面同一枚界；缺省 = 进程 cwd）。 */
export function ledgerBatchRows({ cwd, batch, boundary } = {}) {
  const derived = cwd == null ? null : resolveLedgerRoot(cwd, boundary)
  if (!derived) throw new Error(`ledgerBatchRows：批档所属项目根不可推导（${cwd ?? "（缺 cwd）"}）`)
  const base = derived.root
  const abs = assertBatchArg("ledgerBatchRows", base, batch) // 失败语义先于「库不在 ⇒ 空集」（不可解析就是不可解析）
  const db = openLedger(base, { readOnly: true, boundary })
  if (!db) return []
  try {
    return resolveBatchRows(db, base, abs).map((r) => ({ ...r, taskBookOnDisk: pointerOnDisk(r, base) }))
  } finally { db.close() }
}

/** 完成清单共用判据：必填数字数组、无重复、每个 id 都属于本批且现态为在途；所有在途行都必须点名。
 *  `认账不排期` 只是非活跃行的重锚政策，不能让在途行绕过完成清单。 */
function completedSetForRows(completed, rows) {
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
  const missing = rows.filter((r) => r.status === "在途" && !ids.has(Number(r.id))).map((r) => `#${r.id}`)
  if (missing.length) {
    throw new Error(`ledgerCloseDisposition：completed 漏列在途行 ${missing.join(", ")}；先退回未完成的在途行，再重试`)
  }
  return ids
}

function closeDisposition(db, base, abs, completed) {
  const rows = resolveBatchRows(db, base, abs)
  return { rows, completedIds: completedSetForRows(completed, rows) }
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
export function assertLedgerCloseDisposition({ cwd, batch, boundary, completed, closeEvidence } = {}) {
  const derived = cwd == null ? null : resolveLedgerRoot(cwd, boundary)
  if (!derived) throw new Error(`assertLedgerCloseDisposition：批档所属项目根不可推导（${cwd ?? "（缺 cwd）"}）`)
  const base = derived.root
  const abs = assertBatchArg("assertLedgerCloseDisposition", base, batch)
  const db = openLedger(base, { readOnly: true, boundary })
  if (!db) {
    completedSetForRows(completed, []) // 两道必填的判序：完成清单在前（既有教学面），证据格随后
    assertCloseEvidenceValue(closeEvidence)
    return { batch, completed: [...completed] }
  }
  try {
    closeDisposition(db, base, abs, completed)
    assertCloseEvidenceValue(closeEvidence)
    return { batch, completed: [...completed] }
  } finally { db.close() }
}

/** 收口重锚（设计档 §6.2 ∥ §2.17 收口步序 5）——**收口即结算**：同一事务内
 *  ① 完成清单点名的 `在途` 行两跳至 `已核销`（`在途 → 待核销 → 已核销`，中间态不出事务）；
 *  ② 本批既有 `待核销` 行一并结清（它们是「已做完、没结账」的行）；
 *  ③ `待讨论` / `待设计` 行仍按既有规则改挂条件；`认账不排期` 的非活跃行与归档态零触。
 *  两跳逐跳走既有写核（迁移表 ∥ 写门 ∥ 核销门逐跳判），不直写 SQL；每行结清时把 `closeEvidence`
 *  按既有追加规则写入 `evidence`，前置 `收口 <YYYY-MM-DD>：`（人手证据与收口证据在行上可分）。
 *  任一行拒 ⇒ `ROLLBACK`、台账零改、返回形 `failed`；档账跨存储的写序与补偿不在此承诺
 *  （单源 = `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` §2.17）。
 *  @returns {{batch:string, settled:{id:number,title:string,from:"在途"|"待核销"}[], conditioned:object[],
 *    alreadyAnchored:object[], failed:string|null}} `settled` 逐行点名每一枚被结清的行（含起点——
 *    两种起点的回执各一行）；`conditioned` = 改挂条件的行。 */
export function ledgerReanchorBatch({ cwd, batch, boundary, completed, closeEvidence } = {}) {
  const failedResult = (why) => ({ batch, settled: [], conditioned: [], alreadyAnchored: [], failed: why })
  const derived = cwd == null ? null : resolveLedgerRoot(cwd, boundary)
  if (!derived) return failedResult("批档所属项目根不可推导")
  const base = derived.root
  let evidenceText
  try { evidenceText = closeEvidenceText(assertCloseEvidenceValue(closeEvidence)) } catch (e) { return failedResult(String(e?.message ?? e)) }
  let db
  try { db = openLedger(base, { boundary }) } catch (e) { return failedResult(String(e?.message ?? e)) }
  if (!db) {
    try { completedSetForRows(completed, []) } catch (e) { return failedResult(String(e?.message ?? e)) }
    return { batch, settled: [], conditioned: [], alreadyAnchored: [], failed: null }
  }
  try {
    let abs
    try { abs = assertBatchArg("ledgerReanchorBatch", base, batch) } catch (e) { return failedResult(String(e?.message ?? e)) }
    const sentence = `原批 ${filePartOf(batch)} 已收口，须另起批次接手`
    try {
      db.exec("BEGIN IMMEDIATE")
      const { rows, completedIds } = closeDisposition(db, base, abs, completed)
      const settled = [], conditioned = [], alreadyAnchored = []
      for (const row of rows) {
        const face = { id: Number(row.id), title: row.title }
        if (row.status === "在途") {
          if (!completedIds.has(Number(row.id))) throw new Error(`ledgerReanchorBatch：在途行 #${row.id} 未经完成清单点名`)
          // 跳 1（在途 → 待核销）：迁移表 + 写门逐跳判；出边自动清 executor
          applyRowUpdateTx(db, base, row, { status: "待核销" }, null, boundary, { base })
          // 跳 2（待核销 → 已核销）：核销门判应用本笔后的 evidence，并落 closed_at
          const hopped = db.prepare("SELECT * FROM items WHERE id = ?").get(row.id)
          applyRowClose(db, hopped, "已核销", evidenceText, false)
          settled.push({ ...face, from: "在途" })
          continue
        }
        if (row.status === "待核销") {
          applyRowClose(db, row, "已核销", evidenceText, false)
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
      return { batch, settled, conditioned, alreadyAnchored, failed: null }
    } catch (e) {
      try { db.exec("ROLLBACK") } catch { /* 事务未开 / 已结 */ }
      return failedResult(String(e?.message ?? e))
    }
  } finally { db.close() }
}

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

/** 半状态项（`id` = 首个命中行的编号，`rows` = 命中行编号集；`exit` = 出路句）。 */
const halfStateOf = (name, rows) => ({
  name, id: rows.length ? Number(rows[0].id) : null, rows: rows.map((r) => Number(r.id)), exit: HALF_STATE_EXITS[name],
})

/**
 * 批-账一致性读数（设计档 §2.17 · AC-M2-40——**只读、零写**：「明确的半状态查询面」，人不必靠一次失败的
 * 写去猜）。判据即定义，六类半状态逐条照同一节的表；`record` 三态判据单源 = `readBatchStatusLine`。
 * **预定行不计入 `pointer-stale`**：档未建是它的合法态（单源 = `docs/core/design/LEDGER.md` §6.4）。
 * `open-but-unwritable` 的三合取（`record = open` ∧ 本批**无** `在途` 行 ∧ 存在 `待核销` 行）缺一不可——
 * 只按前两条判，会把每个「一行先做完、其余还在做」的合法在途批报成不一致，而恒报不一致的读数等于没有
 * 读数；加上第三条，它判的仍是同一件真事：该批此刻没有一条在途行，所以一个字也写不进去。
 * **`open-but-settled` 是预期读形**（重开一份非空全归档批的必然结果——`已核销` 不回收），不是缺陷；空行集不命中。
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
  if (record === "open" && rows.length > 0 && archived.length === rows.length) halfStates.push(halfStateOf("open-but-settled", rows))
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
