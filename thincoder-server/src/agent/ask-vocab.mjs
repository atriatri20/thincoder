/**
 * ask-vocab.mjs — ask 应答词表单源叶子档（`agent/MEMBER-AGENT.md` §3.11(2)；台账 #1615）：
 * `ASK_KINDS`（kind 四值）∥ `ITEM_VERDICTS` ∥ `BATCH_VERDICTS`（裁决词表）∥ `askAnswerBodyOf`（应答体校验）。
 * 零 import 叶子——`member-relay.mjs`（成员面 relay）与 `chat-asks.mjs`（管理面 ask 宿主）同源引用；
 * 词表下沉在此解 `chat.mjs → chat-asks → member-relay → chat.mjs` 环（只搬词表，不搬文本词表——K1）。
 */
/** ask kind 四值（§3.11(2) 表——注册与应答校验面）。 */
export const ASK_KINDS = Object.freeze(["permission", "batch", "question", "secret"])
/** 裁决词表（请求体校验——逐值同桌面 `thincoder-desktop/src/main/suspensions.mjs` 的 `ITEM_VERDICTS`/`BATCH_VERDICTS`；盒壳映射单点 =
 *  `deploy/sandbox/member-shell/protocol.mjs` `answerSettlementOf`）。 */
export const ITEM_VERDICTS = Object.freeze(["once", "always", "reject"])
export const BATCH_VERDICTS = Object.freeze(["approveAll", "deny", "oneByOne"])

/** 应答体校验（体与 kind 相符 ⇒ 下行载荷；不合 ⇒ null——调用侧 400 零副作用）：
 *  单件 `verdict ∈ ITEM_VERDICTS` ∥ 批门 `verdict ∈ BATCH_VERDICTS` ∥ 问询 `answer` 键在场（串 ∥ null）∥
 *  秘密 `values` 键在场（对象 ∥ null）。 */
export function askAnswerBodyOf(kind, payload = {}) {
  if (kind === "permission" || kind === "batch") {
    const verdict = payload?.verdict
    const table = kind === "permission" ? ITEM_VERDICTS : BATCH_VERDICTS
    if (typeof verdict !== "string" || !table.includes(verdict)) return null
    return { verdict }
  }
  if (kind === "question") {
    if (!Object.hasOwn(payload ?? {}, "answer")) return null
    const answer = payload.answer
    if (answer !== null && typeof answer !== "string") return null
    return { answer }
  }
  if (kind === "secret") {
    if (!Object.hasOwn(payload ?? {}, "values")) return null
    const values = payload.values
    if (values !== null && (typeof values !== "object" || Array.isArray(values))) return null
    return { values }
  }
  return null
}
