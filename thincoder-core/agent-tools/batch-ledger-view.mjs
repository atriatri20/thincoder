/**
 * agent-tools/batch-ledger-view.mjs — 收口两路与 `check` 共用的**台账侧只读视图**（P2-5 拆出，2026-11-11）。
 *
 * 为什么拆：收口分流（§4.18-C）往 `batch-lifecycle.mjs` 里加了「读一致性 → 判补关」这一步，当年该件因此过了 500 行；
 * 设计档 `docs/core/design/LEDGER.md` §11.3 的失败侧点名两条出路，本条取「拆补关分流」。
 * 四件同住本档，因为它们共一条口径：**批档绝对路径 → 项目根 + 项目相对指针**（`cwd` 基单一处），
 * 再交给台账只读面；分住两处则同一条路径换算要写三遍（收口重锚已在 `batch-lifecycle.mjs` 用同一式）。
 *
 * 四件都是**读**或**只读预检**，不写盘、不写账：
 * ① `consistencyOf` —— 回执末尾 `[ledger consistency]` 行的读数（读不出如实点名，不吞成「一致」）；
 * ② `repairDecisionOf` —— 全归档补关的分流判据（§4.18-C：判「正常收口」∥「补关」∥「拒」）；
 * ③ `assertCloseDisposition` —— 收口完成清单 + 本笔证据的只读预检（单源 = `assertLedgerCloseDisposition`）；
 * ④ `archivedStateOf` —— 被取代的收口（§4.18-D D-3）只要的那一问：本批行集是否**全归档**（薄封装，
 *    与 ② 同一份 `batchLedgerConsistency` 读数，不另造归档判定）。
 *
 * 依赖单向（KD-4）：`closeout ← 本档 ← lifecycle`——本档不 import `batch-lifecycle.mjs`（防环）。
 */
import { dirname, relative } from "node:path"

import { repairBlockedError } from "./batch-closeout.mjs"

/** 批档绝对路径 → 台账只读面要的两个坐标（`cwd` = 批档所属项目根 ∥ `batch` = 项目根相对指针）。
 *  收口三处共用这一处换算：`resolveLedgerRoot(dirname(<批档>), boundary)` **不用会话锚**（多根工作区锚
 *  会收到别的项目根 ⇒ 选行零命中 ⇒ 机器写静默失效）；`boundary` = 上溯上界 = 会话锚。 */
async function ledgerCoordsOf(abs, boundary) {
  const { resolveLedgerRoot } = await import("../ledger.mjs") // 动态 import：ledger-db 静态引 node:sqlite（W8 契约②）
  const root = resolveLedgerRoot(dirname(abs), boundary)?.root ?? null
  return { root, batch: root ? relative(root, abs).replace(/\\/g, "/") : abs }
}

/**
 * 批-账半状态读数（设计档 §2.17「暴露面两处」——`batch({action:"check"})` 与回执末尾的
 * `[ledger consistency]` 行读**同一份**）：查询面单源 = `batchLedgerConsistency`，本档只供 `cwd` 基准。
 * 读不出（台账库坏 / 打不开）⇒ 返回 `{ error }`，由回执如实点名——**不吞成「一致」**（那正是半状态面要
 * 消掉的静默）；`check` action 那一路不吞，直接抛。
 */
export async function consistencyOf(abs, boundary) {
  try {
    const { batchLedgerConsistency } = await import("../ledger.mjs")
    const { root, batch } = await ledgerCoordsOf(abs, boundary)
    return batchLedgerConsistency({ cwd: root, batch, boundary })
  } catch (e) {
    return { error: String(e?.message ?? e) }
  }
}

/** 收口分流（§4.18-C · `docs/core/design/LEDGER.md` §11.2）：两路在**链门前**读 `batchLedgerConsistency`，
 * 判「正常收口」∥「全归档补关」。判据 = `record = open` ∧ 行集非空 ∧ 每行均为 `已核销 / 已废弃` ∧
 * `halfStates` 恰为唯一 `open-but-settled`。行集空或含任一非归档行 ⇒ 正常收口（不是补关：工作未结，
 * 缺段必须继续触发 A 门）；全归档但伴随其它半状态 ⇒ 拒（归属错误不得被冻成历史）；`unknown` 由冻结门早拒。
 * 复用 = `batchLedgerConsistency`（不另造归属或归档判定）。
 * @returns {Promise<{repair:boolean, rows:number}>} `rows` = 本批行集行数（= 补关追记行的 <N>）
 */
export async function repairDecisionOf(abs, boundary) {
  let read
  try {
    const { batchLedgerConsistency } = await import("../ledger.mjs")
    const { root, batch } = await ledgerCoordsOf(abs, boundary)
    read = batchLedgerConsistency({ cwd: root, batch, boundary })
  } catch (e) {
    // 读不出就判不了「补关 ∥ 正常收口」⇒ 拒（fail-closed），且仍走 `batch` 语域：工具面拒因必须点名原因与
    // 「什么都没写」，不让核层原文直出。此处从未写盘，故那句是事实不是台词。
    throw new Error(`batch: 收口分流不可判（ledger repair read failed）— ${String(e?.message ?? e)} Nothing was written.`)
  }
  const rows = read.rows.length
  if (read.record !== "open" || rows === 0) return { repair: false, rows }
  if (!read.rows.every((r) => r.status === "已核销" || r.status === "已废弃")) return { repair: false, rows }
  const onlyOpenButSettled = read.halfStates.length === 1 && read.halfStates[0].name === "open-but-settled"
  if (!onlyOpenButSettled) throw new Error(repairBlockedError(read.halfStates))
  return { repair: true, rows }
}

/** 收口完成清单只读预检（单源 = `assertLedgerCloseDisposition`）：在凭证消费和批档写盘之前调用。
 *  `cwd`/`batch` 换算同上；拒因包一层 `batch:` 前缀（工具面语域）后上抛。
 *  `requireAllInFlight` = 完成清单的元判据（**无缺省**，§4.18-D「③ 的实现面」）：正常两路传 `true`，
 *  被取代的收口传 `false`——本档只透传，不另立一套。 */
export async function assertCloseDisposition(abs, boundary, completed, closeEvidence, requireAllInFlight) {
  try {
    const { assertLedgerCloseDisposition } = await import("../ledger.mjs")
    const { root, batch } = await ledgerCoordsOf(abs, boundary)
    return assertLedgerCloseDisposition({ cwd: root, batch, boundary, completed, closeEvidence, requireAllInFlight })
  } catch (e) {
    throw new Error(`batch: close disposition refused — ${String(e?.message ?? e)} Nothing was written.`)
  }
}

/**
 * 归档态读数（§4.18-D D-3——**只回答「行集是否全归档」这一问**）：与 `repairDecisionOf` 同一份
 * `batchLedgerConsistency` 读数、同一 `cwd` 换算，**不另造归属或归档判定**。
 * 为什么不直接复用 `repairDecisionOf`：它的三态分派是补关口径（全归档 + 唯一 `open-but-settled` 才补关，
 * 其余半状态 ⇒ 拒），而 D-3 只要「全归档」这一个判据——薄封装，不新造归档判定。
 * **行集为空也算未全归档**（空集没有可归档的行 ⇒ 被取代仍可用）；全归档 ⇒ 被取代一律拒（那条拒面同时封掉
 * 最大的滥用面：把「活做完了、档冻不了」说成「被取代」）。读不出 ⇒ throw（D-2：判不了归档态就分不清那一条反例
 * ——不降级放行）。
 * @returns {Promise<{record:"open"|"closed"|"unknown", rows:object[], allArchived:boolean}>}
 */
export async function archivedStateOf(abs, boundary) {
  let read
  try {
    const { batchLedgerConsistency } = await import("../ledger.mjs")
    const { root, batch } = await ledgerCoordsOf(abs, boundary)
    read = batchLedgerConsistency({ cwd: root, batch, boundary })
  } catch (e) {
    // 读不出 ⇒ 拒（fail-closed）：判不了归档态就分不清「活做完了」与「活没人做」，宁可拒。
    throw new Error(`batch: 取代前的归档态读不出（ledger supersede read failed）— ${String(e?.message ?? e)} Without that read the all-archived case cannot be told apart from a real supersede. Nothing was written.`)
  }
  const archived = read.rows.filter((r) => r.status === "已核销" || r.status === "已废弃")
  return { record: read.record, rows: read.rows, allArchived: read.rows.length > 0 && archived.length === read.rows.length }
}
