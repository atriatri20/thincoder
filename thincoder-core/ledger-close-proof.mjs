/**
 * ledger-close-proof.mjs — 台账两道逐行门（归档证据门 ∥ 锚批结算门），以及任务书指针的共用谓词。
 *
 * **两道门同住本档、同一调用位**（两个逐行写核在 `UPDATE` 之前各调一次）：
 * ① `assertCloseOutProof` —— 工作证据门：核销只判断应用本笔补丁后的 `evidence` 是否非空白。证据文本是否
 *    足以证明完成，由调用者与核销审阅者判断。
 * ② `assertAnchorBatchSettleable` —— 锚批结算门：归档（`已核销` ∥ `已废弃`）前读 `task_book` 所指批档的
 *    `§1` 状态行，挂未收口档的行不得单独归档。四支豁免（非批档指针 / 无指针 / 档不在盘 / 追结旧行）放行并
 *    留一个回执 notice；权威规格 = `docs/core/design/LEDGER.md` §11.2。
 * 两门互不替代：证据门只问「有没有工作事实」，锚批门只问「档收口没有」。写核在 UPDATE 前调用，因此空证据、
 * 空白覆盖、或绕过 `batch close` 的单笔归档都不能产生归档行。
 *
 * 指针族三件同住本档（同一件事不各写一套剥标记规则）：`filePartOf` 解析 ∥ `isReservedPointer` 谓词 ∥
 * `namesPointer` 指名谓词。权威规格 = `docs/core/design/LEDGER.md` §6.4「解析单源」。
 */
import { readFileSync } from "node:fs"

import { isBatchRecord, readBatchStatusLine } from "./agent-tools/batch-skeleton.mjs"
import { resolveDeclaredRef } from "./declaration.mjs"

/** 预定批指针的值尾标记（单源 = `docs/core/design/LEDGER.md` §6.4）：登记「将来归这一批」的意图，
 *  所指档此刻不必在盘。全角括号形与既有括注（`…md§1.5（括注）`）同语域，不新造符号位。 */
export const RESERVED_POINTER_MARKER = "（预定）"

/**
 * 谓词：该指针是否带未建档标记。
 * **不能**由「`filePartOf` 剥完的结果与原文不等」倒推——`§` 段号也会造成不等，那样每个带段号的
 * 普通指针都会被读成预定行（判据单源 = `docs/core/design/LEDGER.md` §6.4「最近先例」的偏离项）。
 * @param {unknown} v — `task_book` 原值
 * @returns {boolean} 值尾带标记
 */
export const isReservedPointer = (v) => v != null && String(v).trim().endsWith(RESERVED_POINTER_MARKER)

/** 指针 ∥ 批档值 → 文件部分（**先剥值尾标记、再切首个 `§` 前子串**，trim；`task_book` 与 `batch` 同口径）：
 *  预定行因此与建档后的行解析到同一个文件部分 ⇒ `resolveBatchRows` 把两者选进同一行集（选行判据零改）。 */
export const filePartOf = (v) => {
  if (v == null) return ""
  const s = String(v).trim()
  const bare = isReservedPointer(s) ? s.slice(0, -RESERVED_POINTER_MARKER.length).trim() : s
  return bare.split("§")[0].trim()
}

/** 本笔指名谓词：显式空值（`null` / 空串 / 全空白） ≡ 未指名。 */
export const namesPointer = (v) => v != null && String(v).trim() !== ""

/**
 * 核销工作证据门。
 * @param {string} fnName — 调用方面名，用于可读拒因
 * @param {unknown} evidence — 应用本笔补丁后的证据值
 * @throws {Error} 证据缺失或全空白；调用方的事务保证行不变
 */
export function assertCloseOutProof(fnName, evidence) {
  if (evidence == null || String(evidence).trim() === "") {
    throw new Error(`${fnName}：核销须携有效工作证据（应用本笔补丁后的 evidence 非空白）`)
  }
}

// ─── 锚批结算门（P2-5 · 权威规格 = `docs/core/design/LEDGER.md` §11.2）──────────────────────────

/** 豁免 notice 的正文（`{id, reason, message}` 的 `message` 格：逐行点名原因与原指针）。
 *  技术门旁路不是工作完成证据 ⇒ 只走回执 `notices`，不追加 `evidence`。 */
function anchorExemptNotice(reason, { taskBook, abs, from }) {
  const pointer = namesPointer(taskBook) ? String(taskBook).trim() : "（未给）"
  const where = abs ? `（解析 = ${abs}）` : ""
  if (reason === "pointer-not-a-record") {
    return { reason, message: `task_book 指向的档不是批次档（无 ## §1 段头）：${pointer}${where}——该行不属于任何批，不挂锚批结算门` }
  }
  if (reason === "no-task-book") {
    return { reason, message: `task_book 无文件部分（无可关的档）：${pointer}——不挂锚批结算门` }
  }
  if (reason === "record-not-on-disk") {
    return { reason, message: `task_book 指向的档不在盘：${pointer}${where}——档可整体清理，不升格为拒绝` }
  }
  return { reason, message: `追结旧行（现态 ${from}）：${pointer}——不挂锚批结算门，既有目标态与迁移门照旧` }
}

/** 三个拒绝串（逐字 = `docs/core/design/LEDGER.md` §11.2 拒文块 ①②③）。`<fnName>` = 调用面
 *  `ledgerClose` ∥ `ledgerUpdate`（与 §3 核销拒文同形）；`<原值>` = 行的 `task_book` 原值。 */
const anchorOpenSettleError = (fnName, taskBook) =>
  `${fnName}：批档未收口（task_book = ${taskBook}；§1 = open），不得单独结算；请先 batch close（同笔结算并冻结档）`
const anchorOpenAbandonError = (fnName, taskBook) =>
  `${fnName}：批档未收口（task_book = ${taskBook}；§1 = open），不得直接放弃活跃行；先退回 待讨论（携理由）再 已废弃，或先 batch close`
const anchorUnknownError = (fnName, taskBook) =>
  `${fnName}：批档状态不可判（task_book = ${taskBook}），不得单独结算或放弃；先修 §1 状态行（区内须恰一条；缺行或两条以上都读作 unknown——修法 = 主 agent 普通文档写），再重试`

/**
 * 锚批结算门：`to` ∈ {`已核销`, `已废弃`} 时，判 `task_book` 所指批档能不能让这一行单独归档。
 * **四支豁免**（命中即放行，只出一个 notice）：① `pointer-not-a-record`——档在盘但不是批档（`isBatchRecord`
 * 判否，该行不属于任何批）；② `no-task-book`——指针无文件部分（纯技术债没有可关的档）；③
 * `record-not-on-disk`——指针不可解析或档不在盘（批档可整体清理，旧锚不形成永久死锁）；④ `retro-close`——
 * 现态 `待讨论` / `待设计` 的追结旧行（行可能领着旧指针）。判定序 = 先指针形态三支、再现态；三支里 ②③
 * 靠解析、① 靠读档，故代码上解析先于读档（三支互斥，任何输入只得一条 notice——序不可观测）。
 * 其余照判三态：`closed` 放行；`open` 按目标态分两支拒（结算指回 `batch close`，放弃给两步出路）；
 * `unknown` 单独拒并给修法——**不把不可判当已收口**。
 * @param {string} fnName — 调用面名（拒文前缀）
 * @param {{taskBook: unknown, base: string, to: string, from: string}} o — `base` = 指针解析基准
 *   （必传；缺省即内部契约违约 ⇒ 抛，不给默认值——默认值是替调用者做的决定）
 * @returns {{reason: string, message: string}|null} 豁免 notice（无豁免 ⇒ `null`）
 * @throws {Error} `base` 缺失；档 `open` / `unknown` 而目标是归档态
 */
export function assertAnchorBatchSettleable(fnName, { taskBook, base, to, from }) {
  if (!base) throw new Error(`${fnName}：锚批结算门缺解析基准（调用方须传 proof.base —— 权威规格 = docs/core/design/LEDGER.md §11.2）`)
  const part = filePartOf(taskBook)
  const hit = part === "" ? { ok: false, abs: "" } : resolveDeclaredRef(base, part)
  if (!hit.ok) return anchorExemptNotice(part === "" ? "no-task-book" : "record-not-on-disk", { taskBook, abs: hit.abs, from })
  const src = readFileSync(hit.abs, "utf8") // 解析已证在盘；读不动就是环境故障，照实抛（不静默当作「不是批档」放弃门）
  if (!isBatchRecord(src)) return anchorExemptNotice("pointer-not-a-record", { taskBook, abs: hit.abs, from })
  if (from === "待讨论" || from === "待设计") return anchorExemptNotice("retro-close", { taskBook, abs: hit.abs, from })
  const record = readBatchStatusLine(src)
  if (record === "closed") return null
  if (record === "unknown") throw new Error(anchorUnknownError(fnName, taskBook))
  throw new Error(to === "已核销" ? anchorOpenSettleError(fnName, taskBook) : anchorOpenAbandonError(fnName, taskBook))
}
