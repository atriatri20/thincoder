/**
 * ledger-write-ops.mjs — 台账逐行写核 + 两个批级写点的单源实现（2026-10-27 批拆出）。
 *
 * 为什么拆：`ledger-cmd.mjs` 收尾 455 行，本批要新增 `ledgerBindBatch`（建档 = 建台账行的单事务）与
 * `ledgerReclaimBatch`（重开回收）。两枚都落在 `ledger-cmd` 会把它推过 500 顾问线，而设计档 §3 的
 * 预算是「≈495 行」。本档承接**逐行写核**（迁移表判 → 核销机检 → executor / evidence 语义
 * → 写门 → UPDATE 的那一条链）与两个批级写点；`ledger-cmd.mjs` 反向 import 取用并 re-export，
 * 公共面（`ledger.mjs` 的导出面）逐字不变——先例 = `ledger-close-proof.mjs` / `ledger-tools.mjs`。
 *
 * 依赖单向：`ledger-db` → `ledger-close-proof` → 本档 → `ledger-cmd`（本档不 import 命令面，防环）。
 *
 * 三条硬口径（本档承载，来自设计档 `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md`）：
 * ① **不直写 SQL 的落笔面**（§2.4）：建档事务的行写入走 `applyRowUpdateTx` 同一函数体——迁移表 /
 *    写门 / executor 语义一次都不重做；批级写点自己拼的 UPDATE 只覆盖「机器回收」那一类不查迁移表的写
 *    （同收口重锚口径）。
 * ② **落档先于指针写入**（§2.4）：`ledgerBindBatch` 在写指针之前回调 `writeRecord`——写门两形都判
 *    「解析出的档在盘」，先写指针后落档必被自己的门当场拒。
 * ③ **回收只回 `待核销`**（§2.13）：`已核销` 是终态，重开不回收、回执点名；其余状态一律不动。
 */
import { basename, isAbsolute, resolve } from "node:path"

import { ALLOWED_MIGRATIONS, nowIso, openLedger, PENDING_STATUSES, resolveLedgerRoot } from "./ledger-db.mjs"
import { declaredPublicRoots, resolveDeclaredRef } from "./declaration.mjs"
import { assertCloseOutProof, filePartOf, isReservedPointer, namesPointer } from "./ledger-close-proof.mjs"

/** 解析基准（设计档 §6.1 口径 2 同一子表达式——与台账库键同源）：`resolveLedgerRoot(cwd, boundary)?.root
 *  ?? resolve(cwd ?? ".")`。`boundary` = 会话锚（与 `openLedger` 同一枚上界——同一笔动作的判据不能两界）。 */
export function baseOf(cwd, boundary) {
  return resolveLedgerRoot(cwd, boundary)?.root ?? resolve(cwd ?? ".")
}

/** 路径同一性比较（win32 大小写不敏感——与 `batch-paths.mjs` / `design-slots.mjs` 同口径）。 */
const pathKey = (p) => {
  const s = String(p ?? "").replace(/\\/g, "/")
  return process.platform === "win32" ? s.toLowerCase() : s
}

// ─── 逐行写核（update / close / bind 共用；判序 = 设计档 §13.9 逐字未变）───────────────────────

/** executor 目标值计算。
 *  普通进边 = patch 显式 > 当前会话 > 行现值 > NULL；离开在途与退回待讨论恒为 NULL。
 *  `待核销 → 在途` 恒写当前会话，显式 patch 不覆盖这条机器语义。 */
export function resolveExecutorTarget(row, to, patch, executorSessionId) {
  if (row.status === "待核销" && to === "在途") return executorSessionId ?? null
  if (to === "待讨论") return null
  if ((row.status === "待讨论" && to === "待设计") || (row.status === "待设计" && to === "在途") || (row.status === "待讨论" && to === "在途")) {
    return patch.executor ?? executorSessionId ?? row.executor ?? null
  }
  if (row.status === "在途" && (to === "待核销" || to === "已废弃")) {
    return null // 出边自动语义压 patch——显式传 executor 也不复活
  }
  return patch.executor ?? row.executor ?? null
}

/** `evidence` 值计算（设计档 LEDGER.md §13.9——update / close 两函数同源一处落）：追加缺省（旧值非空 ⇒
 *  `旧 + "｜" + 新`——「｜」两侧零空格直接相接；旧空（`null` ∥ 空串 ∥ 全空白）⇒ 直写，零分隔符残留）；
 *  `evidenceReplace === true` 与值同传 ⇒ 整段替换（旧文零保留）；`evidence` 缺 / `null` ≡ 略去（零变）。
 *  拒面①（旗独传——无新文可算）判于本阶段；核内旗判只认 `=== true`（类型严判在工具层）。两值逐字落行
 *  （不裁 / 不判内容）。 */
export function evidenceValue(fnName, oldValue, evidence, evidenceReplace) {
  if (evidenceReplace === true && evidence == null) throw new Error(`${fnName}：evidenceReplace 须与 evidence 同传（缺新文）`)
  if (evidence == null) return oldValue
  const old = oldValue == null || String(oldValue).trim() === "" ? "" : String(oldValue)
  return evidenceReplace === true || old === "" ? evidence : `${old}｜${evidence}`
}

/** 拒面②（新值全空白——追加 ∥ 覆盖两径同判）判点（§13.9 判序）：update 与 close 两面皆随值计算同拍；
 *  `evidence` 未传（`null` / 略去）⇒ 不判。 */
export function assertEvidenceValue(fnName, evidence) {
  if (evidence != null && String(evidence).trim() === "") throw new Error(`${fnName}：evidence 为空（非空字符串）`)
}

/** 预定指针拒文（逐字 = `docs/core/design/LEDGER.md` §6.4 拒文表两分支）。 */
const reservedNotRelativeError = (value) => `task_book：预定指针须写项目相对路径（不带声明源前缀 / 绝对路径）：${value}`
const reservedOnDiskError = (value) => `task_book：预定指针所指的档已在盘（去掉「（预定）」标记即可）：${value}`

/** 预定指针（§6.4 写门臂② 两支）：两条件全成立才放过——① **项目相对**（不带声明源前缀、不是绝对路径、
 *  不带盘符）：认领以 `batch create` 的目标路径 P 为键（P 恒项目相对），值带声明源前缀 ∥ 绝对路径时认领按 P
 *  解析、走另一个基准 ⇒ 同一行在认领里永远认不到；② **不在盘**（已在盘 ⇒ 标记多余，读数面会撒谎：
 *  `taskBookOnDisk` 报 `false` 而档在盘）。在盘判据与普通指针同一函数（`resolveDeclaredRef`），零二写。 */
function assertReservedPointer(cwd, value, boundary) {
  const base = baseOf(cwd, boundary)
  const part = filePartOf(value)
  if (!part) throw new Error(reservedNotRelativeError(value))
  const segs = part.replace(/\\/g, "/").split("/").filter(Boolean)
  const declared = declaredPublicRoots(base)
  const withPrefix = declared.some((root) => segs[0] === basename(root))
  if (isAbsolute(part) || /^[a-zA-Z]:/.test(part) || withPrefix) throw new Error(reservedNotRelativeError(value))
  if (resolveDeclaredRef(base, part).ok) throw new Error(reservedOnDiskError(value))
}

/** 写门·指针点名（设计档 §6.1 两臂 · AC-M2-10 ∥ AC-M2-29）：判**本笔写入面**——两臂之外零判。
 *  臂①（点名非空）：结果行 `status ∈ {在途, 待核销}` ∨ 结果行 `trigger = 归批` ⇒ `task_book` 非空
 *  （缺 / 空串 / 全空白 ⇒ 拒「必填」）；**不判在盘**（列值事实，不随盘面翻转——DDL 咬合 CHECK 为该半幅防线）。
 *  臂②（本笔新指名）：本笔新写 `task_book`（非空值）∥ 本笔新写 `trigger = 归批` ⇒ 绑定指针非空 ∧ 文件部分
 *  可解析 ∧ 解析出的档**在盘**（判定单源 = `resolveDeclaredRef`，零二写）。
 *  **预定指针一支例外**（§6.4）：值尾带 `（预定）` 标记 ⇒ 臂② 改判两支（项目相对 ∥ 不在盘），
 *  不判在盘——未建档是它的合法态。
 *  **「档此刻在不在盘」不入臂①**：批档可随时整体清理 ⇒ 当结果行判据则合法账务被拒、而出路正是被拒字段
 *  （死锁）；存量指针失效只体现为读数 `taskBookOnDisk = false`（§7.1）。 */
export function assertTaskBookGate(cwd, fnName, face, boundary) {
  const { status, trigger, taskBook, wroteTaskBook, wroteBatchTrigger } = face
  if ((status === "在途" || status === "待核销" || trigger === "归批") && !namesPointer(taskBook)) {
    throw new Error(`${fnName}：task_book 必填（在途 / 待核销 / 归批 须携任务书指针）`)
  }
  if (!wroteTaskBook && !wroteBatchTrigger) return // 臂② 之外零判：旧指针所指档已清不阻任何此类写入
  if (isReservedPointer(taskBook)) return assertReservedPointer(cwd, taskBook, boundary)
  const part = filePartOf(taskBook)
  if (!part) throw new Error(`${fnName}：task_book 不可解析（缺文件部分）：${taskBook}`)
  const base = baseOf(cwd, boundary) // §6.1 口径 2 同一子表达式（单源 = 本档 `baseOf`）
  const { ok, abs } = resolveDeclaredRef(base, part)
  if (!ok) throw new Error(`${fnName}：task_book 指向的档不存在：${taskBook}（解析 = ${abs}）`)
}

/**
 * 单行落笔·update（单行形 ∥ 批量形 ∥ 建档形共函数）：迁移表判 → 本笔退回理由与 evidence 值计算 →
 * 工作证据门 → executor / 指针写门 → UPDATE。`to` = `patch.status ?? 行现态`——批量形纯字段
 * 补丁（不携 `status`）时 `to === row.status` ⇒ 迁移表不判、`status` 零写（§3.3）；归档态显式同态重写仍拒。
 * `resume_when` = 普通可空字段补丁（`patch.resume_when ?? 行值`——§3.4）。
 * **事务归属**：`tx = true` ⇒ 调用方已开事务（本函数不 BEGIN——嵌套 BEGIN 会当场抛）；缺省 ⇒ 自开
 * `BEGIN IMMEDIATE` 包一条 UPDATE（半途抛 ⇒ 行零改）。
 */
export function applyRowUpdateTx(db, cwd, row, patch, executorSessionId, boundary, proof = {}) {
  void proof // 保留既有调用签名；工作证据门不读批档或评审运行态
  const to = patch.status ?? row.status
  const archivedRewrite = patch.status != null && to === row.status && (row.status === "已核销" || row.status === "已废弃")
  if (archivedRewrite) throw new Error(`ledgerUpdate：归档态 ${row.status} 为终态，拒绝再次写入该状态`)
  if (to !== row.status && !(ALLOWED_MIGRATIONS[row.status] ?? []).includes(to)) {
    throw new Error(`ledgerUpdate：迁移 ${row.status} → ${to} 不在允许迁移表`)
  }
  const returning = to === "待讨论" && (row.status === "在途" || row.status === "待核销")
  if (returning && (patch.evidence == null || String(patch.evidence).trim() === "")) {
    throw new Error("ledgerUpdate：退回 待讨论 须携本笔 evidence 理由（非空字符串）")
  }
  const nextEvidence = evidenceValue("ledgerUpdate", row.evidence, patch.evidence, patch.evidenceReplace)
  assertEvidenceValue("ledgerUpdate", patch.evidence)
  if (to === "已核销") assertCloseOutProof("ledgerUpdate", nextEvidence)
  const nextExecutor = resolveExecutorTarget(row, to, patch, executorSessionId)
  const nextTaskBook = returning ? null : patch.task_book ?? row.task_book
  const nextTrigger = returning ? null : patch.trigger ?? row.trigger
  assertTaskBookGate(cwd, "ledgerUpdate", {
    status: to,
    trigger: nextTrigger,
    taskBook: nextTaskBook,
    wroteTaskBook: !returning && namesPointer(patch.task_book),
    wroteBatchTrigger: !returning && patch.trigger === "归批",
  }, boundary) // → 写门 → UPDATE
  const now = nowIso()
  db.prepare(`UPDATE items SET status = ?, title = ?, board = ?, req_doc = ?, task_book = ?, evidence = ?, trigger = ?, resume_when = ?, executor = ?, updated_at = ? WHERE id = ?`)
    .run(to, patch.title ?? row.title, patch.board ?? row.board, patch.req_doc ?? row.req_doc, nextTaskBook, nextEvidence, nextTrigger, patch.resume_when ?? row.resume_when, nextExecutor, now, row.id)
  return { id: Number(row.id), status: to, ...(returning ? { reason: patch.evidence } : {}) }
}

/**
 * 单行落笔·update（外层不持事务的调用面）：`tx` 缺省 ⇒ 自开事务包裹 `applyRowUpdateTx`；
 * `tx = true` ⇒ 直接透传（调用方自己的事务边界说了算——`ledgerUpdateBatch` / `ledgerBindBatch`）。
 */
export function applyRowUpdate(db, cwd, row, patch, executorSessionId, boundary, proof = {}, tx = false) {
  if (tx) return applyRowUpdateTx(db, cwd, row, patch, executorSessionId, boundary, proof)
  db.exec("BEGIN IMMEDIATE")
  try {
    const out = applyRowUpdateTx(db, cwd, row, patch, executorSessionId, boundary, proof)
    db.exec("COMMIT")
    return out
  } catch (e) {
    try { db.exec("ROLLBACK") } catch { /* 事务未开 / 已结 */ }
    throw e
  }
}

/** 核销拒文的出路句（设计档 §3 三行表逐字）：同一件事实（核销只自 `待核销` 出）、出路按现态分支——
 *  对 `在途` 说「先 update 到 在途 认领」是让人重做一步已做过的事。归档态那支不是新分支：改前同一输入
 *  也走首判并拒（旧判据本就不含归档态），行为零改，只把这句兜底话换准。 */
function closeExitSentence(status) {
  if (status === "在途") return "先 update 到 待核销（做完才结账），再 close 勾销"
  if (status === "已核销" || status === "已废弃") return `该行已归档（${status}），不在核销面`
  return "先 update 到 在途 认领，再 update 到 待核销，最后 close 勾销"
}

/** 单行落笔·close（单行形 ∥ 批量形共函数）：核销只有 `待核销 → 已核销` 一条边。
 *  核销门读取应用本笔后的工作证据；撤回只允许未归档态，并清空 executor。
 *  `已核销 / 已废弃` 都是终态，重复撤回与归档态改写均拒绝。调用方恒已开事务。 */
export function applyRowClose(db, row, status, evidence, evidenceReplace, proof = {}) {
  void proof // 保留既有调用签名；工作证据门不读批档或评审运行态
  if (status === "已核销" && row.status !== "待核销") throw new Error(`ledgerClose：核销仅限 待核销（现态 ${row.status}）：${closeExitSentence(row.status)}`)
  if (status === "已废弃" && (row.status === "已核销" || row.status === "已废弃")) {
    throw new Error(`ledgerClose：撤回仅限未归档态（现态 ${row.status}）：该行已归档，不可重复撤回或改写归档态`)
  }
  const nextEvidence = evidenceValue("ledgerClose", row.evidence, evidence, evidenceReplace)
  assertEvidenceValue("ledgerClose", evidence)
  if (status === "已核销") assertCloseOutProof("ledgerClose", nextEvidence)
  const now = nowIso()
  db.prepare("UPDATE items SET status = ?, closed_at = ?, updated_at = ?, executor = ?, evidence = ? WHERE id = ?").run(status, now, now, status === "已废弃" ? null : row.executor, nextEvidence, row.id)
  return { id: Number(row.id), status }
}

// ─── 批级写点（建档绑定 · 重开回收；与收口重锚同形对称）────────────────────────────────

/** `batch` 入参自身门（设计档 §3.3 · fail-closed）：值自身须**可解析**（含非空文件部分）∧ 解析后批档
 *  **在盘** ⇒ 否则拒（零写）。判的是**本笔指名**的那一笔——与 §6.1 臂② 同一律、不同字段。
 *  @returns {string} 批档绝对路径（解析基准 = `base`） */
export function assertBatchArg(fnName, base, batch) {
  const part = filePartOf(batch)
  const hit = part === "" ? { ok: false, abs: "" } : resolveDeclaredRef(base, part)
  if (!hit.ok) throw new Error(`${fnName}：batch 不可解析或不在盘（${batch}）`)
  return hit.abs
}

/** 批 → 行集（选行**单源** · 设计档 §3.3）：`task_book` 文件部分经 `resolveDeclaredRef` 解析为与批档
 *  **同一绝对路径**的行（任意状态、含归档态）。判据 = 解析同址而非串等值（同批档三种指针写法并存——
 *  无后缀 / `§2` / `§1.5（括注）`，串等值会漏行）。 */
export function resolveBatchRows(db, base, abs) {
  return db.prepare("SELECT * FROM items ORDER BY id").all()
    .filter((r) => { const part = filePartOf(r.task_book); return part !== "" && resolveDeclaredRef(base, part).abs === abs })
}

/** 建档绑定拒文（逐字 = 设计档 §2.4；三形各一条）。 */
const bindMissingError = (n) => `batch: ledger entry #${n} does not exist in this project's ledger — pass an existing number, or omit ledger and let create open a new row. Nothing was written.`
const bindArchivedError = (n, status) => `batch: ledger entry #${n} is ${status} — an archived row cannot carry a new batch record (open a new row instead). Nothing was written.`
const bindOwnedError = (n, path) => `batch: ledger entry #${n} is 在途 and its task_book points at ${path} — another batch owns it; a record may take over a row only when its task_book points at this record. Nothing was written.`
const bindSettledError = (n) => `batch: ledger entry #${n} is 待核销 — a row already settled to 待核销 cannot carry a new batch record (reopen the record that owns it with batch status, or open a new row instead). Nothing was written.`

// ─── 开批同面判（设计档 §6.3 · AC-M2-37；判点 = 写形开户之前）──────────────────────────

/** 新事理由的 `evidence` 前缀（单源 = 设计档 §6.3「参数面」；写入侧造前缀、收口侧按同一字面取文——
 *  读面对 = `thincoder-core/agent-tools/batch-closeout.mjs` 的 `newDebtReasonOf`，两处同一字面、
 *  不进公共导出面）。 */
const NEW_DEBT_EVIDENCE_PREFIX = "新事理由："
/** 候选逐行上限（§6.3「上限」——超出改出计数句；一眼读完才叫「见该接哪行」）。 */
const SAME_FACE_LIST_LIMIT = 10

/** 面归一等（§6.3「面 = 本笔 `board`」）：缺省 / 空串 / 全空白 ⇒ `null` = **无板面**（`board IS NULL`）。 */
const faceOf = (board) => {
  const v = board == null ? "" : String(board).trim()
  return v === "" ? null : v
}

/** 同行是否在本面（**等值口径同 §7.1 `board` 过滤——零新口径**）：无板面 = `board IS NULL`（严格 NULL，
 *  不是「空白串也算无板面」）；有板面 = 与行值严格相等（SQL `board = ?` 的同一判等）。 */
const onSameFace = (rowBoard, face) => (face === null ? rowBoard == null : rowBoard === face)

/** 同携拒文（逐字 = 设计档 §6.3 第二段围栏；`newDebt` 与 `ledger` 语义互斥）。 */
const newDebtAndLedgerError = () => `batch: newDebt and ledger are mutually exclusive — take over a debt already in the pool with ledger:"#N"; declare a new debt with newDebt:"<reason>". Both together is ambiguous. Nothing was written.`

/**
 * 同面拒文（逐字 = 设计档 §6.3 第一段围栏）：首行点名面与未决数 + 逐行候选（`id` 升序、至多 10 行）+
 * 截断时的计数句与自取命令 + 收尾 `Nothing was written.`。无板面 ⇒ 面名 `no board`，自取句不带
 * `board` 参数（无板面没有板名可填；不带过滤的查询回全池，余数仍准）。
 * @param {string|null} face — 面（`null` = 无板面）
 * @param {{id:number, status:string, title:string}[]} candidates — 本面未决行（`id` 升序）
 */
function sameFaceRefusal(face, candidates) {
  const shown = candidates.slice(0, SAME_FACE_LIST_LIMIT)
  const rest = candidates.length - shown.length
  const lines = [
    `batch: ${candidates.length} unsettled row(s) already exist on this face — create refuses to open a new ledger row silently (face = ${face ?? "no board"}). Either take one over with ledger:"#<id>", or declare a genuinely new debt with newDebt:"<one line: why it is not one of these>". Candidates:`,
    ...shown.map((r) => `  #${r.id} ${r.status} ${r.title}`),
  ]
  if (rest > 0) {
    lines.push(face === null
      ? `… ${rest} more not listed — read the rest with the ledger tool (action query).`
      : `… ${rest} more not listed — read the rest with the ledger tool (action query, board:"${face}").`)
  }
  lines.push("Nothing was written.")
  return lines.join("\n")
}

/**
 * 同面取集（设计档 §6.3「候选行集与次序」）：`ledgerQuery` 取全行、核内按面与状态筛——零新 SQL、
 * 零新导出。取集走**读形**开户（`ledgerQuery` 内部 `openLedger(readOnly)` ⇒ `create` 缺省假、库档不在
 * 即返空集），故此步不建库档。`ledger-cmd` 反向 import 本档（防环）⇒ 此处动态 import。
 * @returns {Promise<{n:number, m:number, candidates:object[]}>} 本面未决数 ∥ 他面未决数（读数）∥ 候选
 */
async function sameFaceScan({ cwd, boundary, face }) {
  const { ledgerQuery } = await import("./ledger-cmd.mjs")
  const pending = ledgerQuery({ cwd, boundary }).filter((r) => PENDING_STATUSES.includes(r.status))
  const mine = pending.filter((r) => onSameFace(r.board, face))
  // 排序即判据（§6.3）：`id` 升序 = 最老欠条优先（与 §3.7 出口面 `aged` 同轴）——候选表读作「从上往下先看」
  mine.sort((a, b) => Number(a.id) - Number(b.id))
  return { n: mine.length, m: pending.length - mine.length, candidates: mine }
}

/**
 * 建档 = 建台账行（设计档 §2.4——单事务在台账侧，档写在事务窗口内，**落档先于指针写入**）：
 *   `BEGIN IMMEDIATE` → （新建）INSERT 一行 `待讨论`（无指针；`trigger` 不填——`trigger=归批` 与
 *   `task_book` 同在下一步一笔写，否则臂① 会把无指针的行当场拒）→ `writeRecord(#N)` 写批档 →
 *   `applyRowUpdateTx` 迁 `在途` + 写 `task_book`（过写门）→ `COMMIT`。接管路径同一条道理：`#N` 已知 →
 *   `writeRecord` → `applyRowUpdateTx` → `COMMIT`。
 *
 * 崩在窗口内（行已 INSERT ∥ 已改、`COMMIT` 未执行、档已落盘）：SQLite 回滚事务 ⇒ 行回原态；档留在盘上而
 * 台账里没有它的行（写锁只问「这个项目里有没有 `在途` 行」，不读指针——设计档 §2.3）。清理只删**本笔所建**的档（`created` 由调用方按返回值判断——`wx` 撞已有
 * 同名档时抛 EEXIST，无条件 unlink 会删掉别人的档）。
 *
 * **开批同面判**（设计档 §6.3 · AC-M2-37）：省略 `ledger` ∧ 同面（本笔 `board`；未给 ⇒ `board IS NULL`）
 * 存在未决四态行 ⇒ 必须显式声明 `newDebt:"<一句理由>"`，否则**在写形开户之前**拒（逐行列候选）。
 * 因此「零写 = 二件」（无行写入 ∥ 无批档写入）是结构挣来的，不靠判后回滚；判前取集走读形开户，不建库档。
 * 理由落本笔新开行的 `evidence`（前缀 `新事理由：`）；`ledger:"#N"` 在场 ⇒ 本节零判（接手路径零回归）。
 * **认领支**（设计档 `docs/core/design/LEDGER.md` §6.4）：`ledger` 与 `newDebt` 都不给时先探「目标路径 P 上
 * 有没有带 `（预定）` 标记的行」——命中 ⇒ 认领**同一行**（不 INSERT；落笔 = 事务内那笔 `UPDATE`），§6.3 同面判
 * 零判；`≥2` 条 ⇒ 拒并逐行点名。探针 = 纯读（读形开户之前），与同面判同一判点。
 * @param {{cwd:string, ledgerNo:number|null, newDebt:string|null, targetAbs:string, taskBook:string, title:string,
 *   kind:string, board:string|null, boundary?:string, executorSessionId?:string|null, agent?:object}} o
 *   `newDebt` = 非空字符串（为什么这不是候选里那几条）；空串 ∥ 全空白 ⇒ 按未给判；与 `ledger` 同携 ⇒ 拒。
 * @param {(id:number)=>void} writeRecord — 写批档（`wx` 独占创建；真实行号已可得）
 * @returns {Promise<{id:number, created:boolean, claimed?:boolean, tookOver:"new"|"discussed"|"designed"|"live",
 *   sameFace:{face:string|null, n:number, m:number, declared:string|null}|null}>} `claimed` = 本笔认领了预定行
 *   （不开新行）；`sameFace` = 同面判读数（`null` = 接手 ∥ 认领路径——两支都不判同面）；
 *   `n` = 本面未决数 · `m` = 他面未决数（读数，不拦）· `declared` = 声明的新事理由
 */
export async function ledgerBindBatch({ cwd, ledgerNo = null, newDebt = null, targetAbs, taskBook, title, kind = "tech_todo", board = null, boundary, executorSessionId = null, agent = {} }, writeRecord) {
  const face = faceOf(board)
  const newDebtReason = typeof newDebt === "string" && newDebt.trim() !== "" ? newDebt.trim() : null // 空串 ∥ 全空白 ⇒ 按未给判
  if (ledgerNo != null && newDebtReason) throw new Error(newDebtAndLedgerError()) // 语义互斥：`ledger` 在场即接手，不是新事
  const base = baseOf(cwd, boundary)
  // 认领支先判（§6.4「判序」）：`ledger` 未给 ∧ `newDebt` 未给 ⇒ 先问「目标路径 P 上有没有预定行」。
  // 预定行本身就在未决面（`待讨论` / `待设计`），同面判若先判，认领这一笔必被拒 ⇒ 认领永不发生。
  // 命中 ⇒ 走认领、§6.3 同面判零判；未命中 ⇒ 才判同面。三支互斥：`ledger` ⇒ 接手径（两支零判）；
  // `newDebt` ⇒ 声明新事（不认领）。
  const claimRows = ledgerNo == null && !newDebtReason ? reservedClaimProbe({ cwd, base, targetAbs, boundary }) : []
  if (claimRows.length > 1) throw new Error(reservedAmbiguousError(taskBook, claimRows)) // `≥2` 条 ⇒ 拒并逐行点名
  const claim = claimRows[0] ?? null
  // 开批同面判（§6.3）：判点 = 写形开户之前；`ledger` 在场 ∥ 认领命中 ⇒ 本节零判
  const scan = ledgerNo == null && !claim ? await sameFaceScan({ cwd, boundary, face }) : null
  if (scan && scan.n > 0 && !newDebtReason) throw new Error(sameFaceRefusal(face, scan.candidates))
  const sameFace = scan ? { face, n: scan.n, m: scan.m, declared: newDebtReason } : null
  const db = openLedger(cwd, { create: true, boundary })
  try {
    db.exec("BEGIN IMMEDIATE")
    try {
      let row = null
      let id = null
      let created = false
      if (claim) {
        // 认领（§6.4「落笔位次」）：不 INSERT——本笔 UPDATE 就是它替代的那一步（与 INSERT 同位，事务内）。
        // 崩在中间 ⇒ 事务回滚、零残留（本批正是消半状态的批，不能自己造一个）。
        // 事务内复核与探针**同一判据**（标记 ∧ 现态 ∧ 仍解析到 P）：探针到事务之间被改指的行不得认领，
        // 否则落笔会把另一条归批意图静默改写成规范形。
        id = Number(claim.id)
        row = db.prepare("SELECT * FROM items WHERE id = ?").get(id)
        const stillMine = row ? filePartOf(row.task_book) : ""
        if (!row || !isReservedPointer(row.task_book) || (row.status !== "待讨论" && row.status !== "待设计")
          || stillMine === "" || pathKey(resolveDeclaredRef(base, stillMine).abs) !== pathKey(targetAbs)) {
          throw new Error(`batch: the reserved ledger row #${id} changed under this call (probe vs transaction) — retry create; nothing was claimed. Nothing was written.`)
        }
      } else if (ledgerNo == null) {
        // 步 2：先落一行不带指针的 `待讨论`（`在途` 被 DDL 咬合 CHECK 强制非空指针）+ `trigger` 不填；
        // 声明新事者同拍带理由入 `evidence`（步 4 的值计算在 `patch.evidence` 缺省时保留行现值）
        const now = nowIso()
        const r = db.prepare(`INSERT INTO items (kind, status, title, board, evidence, created_at, updated_at) VALUES (?, '待讨论', ?, ?, ?, ?, ?)`)
          .run(kind, title, board, newDebtReason ? `${NEW_DEBT_EVIDENCE_PREFIX}${newDebtReason}` : null, now, now)
        id = Number(r.lastInsertRowid)
        created = true
        row = db.prepare("SELECT * FROM items WHERE id = ?").get(id)
      } else {
        id = Number(ledgerNo)
        row = db.prepare("SELECT * FROM items WHERE id = ?").get(id)
        if (!row) throw new Error(bindMissingError(id))
        if (row.status === "已核销" || row.status === "已废弃") throw new Error(bindArchivedError(id, row.status))
        if (row.status === "待核销") throw new Error(bindSettledError(id))
        if (row.status === "在途") {
          const part = filePartOf(row.task_book)
          const hit = part === "" ? { ok: false, abs: "" } : resolveDeclaredRef(base, part)
          if (!hit.ok || pathKey(hit.abs) !== pathKey(targetAbs)) throw new Error(bindOwnedError(id, row.task_book))
          // 接管（不动状态、零台账写）：档可能已不在盘（残留态）——照写一次 `wx`，撞已有档时由调用方报
          writeRecord(id)
          db.exec("COMMIT")
          return { id, created: false, tookOver: "live", sameFace }
        }
      }
      // 步 3：落档——必须先于步 4（写门两形都判「解析出的档在盘」）
      writeRecord(id)
      // 步 4：行写入走同一函数体（迁移表 → 机检 → executor → 写门 → UPDATE），不直写 SQL。
      // 认领径的 `task_book` 写规范形（`taskBook` 由调用方按 `relative(root, abs)` 给）⇒ 标记剥掉，
      // 该行此后是普通行集成员（`filePartOf` 同址，选行判据零改）。
      applyRowUpdateTx(db, cwd, row, { status: "在途", task_book: taskBook, trigger: "归批" }, executorSessionId, boundary, { base, agent })
      db.exec("COMMIT")
      return { id, created, claimed: !!claim, tookOver: created ? "new" : row.status === "待设计" ? "designed" : "discussed", sameFace }
    } catch (e) {
      try { db.exec("ROLLBACK") } catch { /* 事务未开 / 已结 */ }
      throw e
    }
  } finally { db.close() }
}

/**
 * 预定行认领探针（设计档 §6.4「建档认领」——**位次 = 读形开户之前**，与 §6.3 同面判同一判点）：
 * 只读地问「目标路径 P 上有没有带标记且解析到 P 的行」——纯读、零写、不建库档。
 * 取集口径 = 预定行 ∧ 现态 `待讨论` / `待设计`（预定行本身就在未决面；已离开未决面的行不是可认领对象）。
 * @returns {object[]} 命中行（`id` 升序）
 */
function reservedClaimProbe({ cwd, base, targetAbs, boundary }) {
  const db = openLedger(cwd, { readOnly: true, boundary }) // 读形：库档不在 ⇒ null（零行可认领）
  if (!db) return []
  try {
    return db.prepare("SELECT * FROM items ORDER BY id").all()
      .filter((r) => isReservedPointer(r.task_book) && (r.status === "待讨论" || r.status === "待设计"))
      .filter((r) => {
        const part = filePartOf(r.task_book)
        return part !== "" && pathKey(resolveDeclaredRef(base, part).abs) === pathKey(targetAbs)
      })
  } finally { db.close() }
}

/** `≥2` 条预定行指同一档的拒文（出处 = `docs/core/design/LEDGER.md` §6.4：认领此刻无可择一的判据——
 *  无优先级、无时间戳序，任选一条 = 静默丢掉另一条的归批意图）。设计未给逐字串，本实现按 `batch` 族
 *  拒文语域自拟（英文 + 逐行点名 + `Nothing was written.`）。 */
function reservedAmbiguousError(taskBook, rows) {
  return `batch: ${rows.length} reserved ledger rows point at ${taskBook} — create cannot claim one of them: a reserved pointer carries no priority and no timestamp order, so picking one would silently drop another row's 归批 intent. Clear one first (ledger update — drop the 「（预定）」 marker or point it at another record). Candidates:\n` +
    rows.map((r) => `  #${r.id} ${r.status} ${r.title}`).join("\n") + "\nNothing was written."
}
/** 重开回收回执的三种行（设计档 §2.13）。 */
const reclaimResult = (batch, { reclaimed = [], unreclaimable = [], failed = null } = {}) => ({ batch, reclaimed, unreclaimable, failed })

/**
 * 重开回收（设计档 §2.13——收口的反面）：批档重开（`§1` 从 `已收口` 回 `进行中`）时，本批 `待核销` 行
 * 回到 `在途`（行回工作位，活继续在这一行上——`§2.2` 三合取当场成立）；`已核销` 不动（终态，行上挂着
 * 结账证据），入 `unreclaimable` 由回执点名；其余状态一律不动、不点名。
 *
 * 与 `ledgerReanchorBatch` 同形对称：同一行集 `resolveBatchRows`（行集判据单源）、`BEGIN IMMEDIATE`
 * 单事务、失败 `ROLLBACK` 零行改、**不抛**（返回形 `failed`——由调用方 `ledgerAfterRecordWrite` 转成
 * 「回滚档 + 抛拒」：重开与回收要么一起成、要么一个都不成）。
 * `trigger` / `resume_when` / `evidence` / `updated_at` **零触**（机器回收不是人工推进，行龄读数照旧）；
 * `executor` = 本会话 `sessionId`（行回工作位、干活的就是重开会话——AC-M2-7 在机器径上也成立）。
 * @returns {{batch:string, reclaimed:{id:number,status:string,title:string}[], unreclaimable:{id:number,status:string,title:string}[], failed:string|null}}
 */
export function ledgerReclaimBatch({ cwd, batch, boundary, executorSessionId = null } = {}) {
  const derived = cwd == null ? null : resolveLedgerRoot(cwd, boundary)
  if (!derived) return reclaimResult(batch, { failed: "批档所属项目根不可推导" })
  const base = derived.root
  let db
  try { db = openLedger(base, { boundary }) } catch (e) { return reclaimResult(batch, { failed: String(e?.message ?? e) }) } // 库不可开 ⇒ 零写报因
  if (!db) return reclaimResult(batch) // 库不在 ⇒ 零行可回收
  try {
    let abs
    try { abs = assertBatchArg("ledgerReclaimBatch", base, batch) } catch (e) { return reclaimResult(batch, { failed: String(e?.message ?? e) }) }
    try {
      db.exec("BEGIN IMMEDIATE")
      const reclaimed = [], unreclaimable = []
      for (const row of resolveBatchRows(db, base, abs)) {
        const face = { id: Number(row.id), status: row.status, title: row.title }
        if (row.status === "已核销") { unreclaimable.push(face); continue }
        if (row.status !== "待核销") continue // 其余（条件 / 待讨论 / 待设计 / 已废弃 / 在途）不动、不点名
        db.prepare("UPDATE items SET status = ?, executor = ? WHERE id = ?").run("在途", executorSessionId, row.id)
        reclaimed.push(face)
      }
      db.exec("COMMIT")
      return reclaimResult(batch, { reclaimed, unreclaimable })
    } catch (e) {
      try { db.exec("ROLLBACK") } catch { /* 事务未开 / 已结 */ }
      return reclaimResult(batch, { failed: String(e?.message ?? e) })
    }
  } finally { db.close() }
}
