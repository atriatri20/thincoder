// thincoder-core/test/subagent-design-token-gate.test.mjs — design-token 门四态常驻回归套
// 权威目标形 = docs/core/design/TOOLS.md §6.25 ③（四条拒句逐字）· ④（gateDesignToken 形态）
// · ⑥（T1–T9）。夹具：fake parent `{ _engDesignTokens: new Map([[id, token]]) }`；
// 过期串 = `${randomUUID()}:${Date.now() - 1000}`；畸形槽值 = "not-a-token"。
import test from "node:test"
import assert from "node:assert/strict"
import { randomUUID } from "node:crypto"
import { gateDesignToken } from "../agent-tools/subagent-spawn.mjs"

// 四条拒句逐字期望（与 TOOLS.md §6.25 ③ 逐字相等——改文案即红，属有意锁定）。
const MISSING = "designToken missing — the eng-coder spawn is refused: no usable token for an approved design slot came with this spawn. Pass the designToken parameter with the exact value from the subagent action:'design-slots' row (the text after designToken=), copied verbatim; if that list is empty, no design review has been approved in this session yet — run advisor with type='design' first. No token value is echoed here."
const MISMATCH = "designToken mismatch — the eng-coder spawn is refused: the value passed does not equal the token held for this design slot. Re-read the subagent action:'design-slots' row and pass the value after designToken= verbatim, unchanged. No token value is echoed here."
const EXPIRED = "designToken expired — the eng-coder spawn is refused: the token matches this design slot but is past its TTL. The expired slot has been removed; run advisor with type='design' again on the current design and pass the newly issued token — an expired authorization cannot be retried. No token value is echoed here."
const INVALID = "designToken invalid — the eng-coder spawn is refused: the value passed equals this design slot's stored token, but that stored value is not a well-formed token, so no expiry can be judged and the slot was left in place. Run advisor with type='design' to issue a fresh token for this design; a malformed record never passes the gate. No token value is echoed here."

const future = () => `${randomUUID()}:${Date.now() + 7 * 24 * 3600 * 1000}`
const past = () => `${randomUUID()}:${Date.now() - 1000}`
/** 活槽夹具：返回 { id, token, parent }。 */
function liveParent() {
  const id = randomUUID()
  const token = future()
  return { id, token, parent: { _engDesignTokens: new Map([[id, token]]) } }
}
/** 跑一次门调用并取回抛出的错误；未抛 ⇒ 断言失败。 */
function refusal(run) {
  try {
    run()
  } catch (e) {
    return e
  }
  assert.fail("expected the gate to refuse, but it returned normally")
}

test("T1 · missing（参数缺）：missing 逐字、点名 designToken/design-slots、零回显、槽未删", () => {
  const { id, token, parent } = liveParent()
  const err = refusal(() => gateDesignToken(parent, {}))
  assert.equal(err.message, MISSING)
  assert.ok(err.message.includes("designToken"))
  assert.ok(err.message.includes("design-slots"))
  assert.ok(!err.message.includes(token))
  assert.equal(parent._engDesignTokens.get(id), token)
})

test("T2 · missing（无槽）：与 T1 同句 missing", () => {
  const parent = { _engDesignTokens: new Map() }
  const err = refusal(() => gateDesignToken(parent, { designToken: future() }))
  assert.equal(err.message, MISSING)
})

test("T3 · mismatch：mismatch 逐字 + designId、双 token 零回显、活槽不删", () => {
  const { id, token, parent } = liveParent()
  const wrong = future()
  const err = refusal(() => gateDesignToken(parent, { designId: id, designToken: wrong }))
  assert.equal(err.message, MISMATCH + ` (designId: ${id})`)
  assert.ok(err.message.includes("design-slots"))
  assert.ok(!err.message.includes(token))
  assert.ok(!err.message.includes(wrong))
  assert.equal(parent._engDesignTokens.get(id), token)
})

test("T4 · expired：expired 逐字（含 expired/TTL/removed）、槽已删", () => {
  const id = randomUUID()
  const token = past()
  const parent = { _engDesignTokens: new Map([[id, token]]) }
  const err = refusal(() => gateDesignToken(parent, { designId: id, designToken: token }))
  assert.equal(err.message, EXPIRED)
  assert.ok(err.message.includes("expired"))
  assert.ok(err.message.includes("TTL"))
  assert.ok(err.message.includes("removed"))
  assert.ok(!err.message.includes(token))
  assert.equal(parent._engDesignTokens.has(id), false)
})

test("T5 · 正常放行：返回槽内令牌、槽保留", () => {
  const { id, token, parent } = liveParent()
  assert.equal(gateDesignToken(parent, { designId: id, designToken: token }), token)
  assert.equal(parent._engDesignTokens.get(id), token)
})

test("T6 · 四条拒句两两互异（取自 T1/T3/T4/T8 场景）", () => {
  const live = liveParent()
  const missing = refusal(() => gateDesignToken(live.parent, {})).message
  const mismatch = refusal(() => gateDesignToken(live.parent, { designId: live.id, designToken: future() })).message
  const expId = randomUUID()
  const expToken = past()
  const expired = refusal(() => gateDesignToken({ _engDesignTokens: new Map([[expId, expToken]]) }, { designId: expId, designToken: expToken })).message
  const badId = randomUUID()
  const invalid = refusal(() => gateDesignToken({ _engDesignTokens: new Map([[badId, "not-a-token"]]) }, { designId: badId, designToken: "not-a-token" })).message
  assert.equal(new Set([missing, mismatch, expired, invalid]).size, 4)
})

test("T7 · 既有两条 designId 诊断零改（不属四态）：全句逐字", () => {
  const { id, token, parent } = liveParent()
  const unknown = refusal(() => gateDesignToken(parent, { designId: "no-such-design", designToken: token }))
  assert.equal(unknown.message, `designId not found — no approved design review holds this id. Run advisor with type='design' again and pass the designId echoed with the token. (session holds 1 approved design slot(s); held design ids: ${id})`)
  const id2 = randomUUID()
  const two = { _engDesignTokens: new Map([[id, token], [id2, future()]]) }
  const multi = refusal(() => gateDesignToken(two, { designToken: token }))
  assert.equal(multi.message, `Multiple approved designs in this session (2) — pass the designId parameter (echoed with each token) to choose which design this eng-coder spawn belongs to. Held design ids: ${id}, ${id2}`)
})

test("T8 · invalid（格式非法但值相等）：invalid 逐字、不称 TTL/删槽、槽不删", () => {
  const id = randomUUID()
  const token = "not-a-token"
  const parent = { _engDesignTokens: new Map([[id, token]]) }
  const err = refusal(() => gateDesignToken(parent, { designId: id, designToken: token }))
  assert.equal(err.message, INVALID)
  assert.ok(err.message.includes("invalid"))
  assert.ok(!err.message.includes("expired"))
  assert.ok(!err.message.includes("TTL"))
  assert.ok(!err.message.includes("removed"))
  assert.ok(!err.message.includes(token))
  assert.equal(parent._engDesignTokens.get(id), token)
})

test("T9 · 非字符串 ⇒ missing（本意）、槽未删", () => {
  const { id, token, parent } = liveParent()
  for (const bad of [123, null]) {
    const err = refusal(() => gateDesignToken(parent, { designId: id, designToken: bad }))
    assert.equal(err.message, MISSING)
  }
  assert.equal(parent._engDesignTokens.get(id), token)
})
