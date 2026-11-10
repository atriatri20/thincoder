/**
 * ledger-close-proof.mjs — 台账核销工作证据门，以及任务书指针的共用谓词。
 *
 * 核销只判断应用本笔补丁后的 `evidence` 是否非空白。批档是否在盘、是否收口、评审状态如何，
 * 都不属于工作证据门；证据文本是否足以证明完成，由调用者与核销审阅者判断。
 * 写核在 UPDATE 前调用本门，因此空证据或空白覆盖不能产生 `已核销` 行。
 *
 * 指针族三件同住本档（同一件事不各写一套剥标记规则）：`filePartOf` 解析 ∥ `isReservedPointer` 谓词 ∥
 * `namesPointer` 指名谓词。权威规格 = `docs/core/design/LEDGER.md` §6.4「解析单源」。
 */

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
