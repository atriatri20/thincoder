/** 批档（2026-10-24 · 挂起窗停止面批）：用户实测「停止按键我点没反应」——消化 ∕ timer ∕ 上行轮在
 *  挂起窗内跑（`suspension-drive` 自持 controller），**不占 `flights`** ⇒ `interrupt` 查表落空回 `idle`
 *  ⇒ 停止钮对窗内（卡死在网关 TTFB 的）回合无效。
 *  修 = `interrupt` 无 flight 且窗在场且无携文 ⇒ 窗中止面承接（`suspension.abort(key)`——signal 链达
 *  挂死的模型调用；待消化项留池下回合重新消化）。携文（Ctrl+I）窗内语义未定义 ⇒ 维持 idle（零扩）。
 *  本档三腿：窗在 + 无携文 ⇒ abort 承接 ∕ 窗在 + 携文 ⇒ idle（零扩）∥ 窗不在 + 无 flight ⇒ idle（原语义）。 */
import { test } from "node:test"
import assert from "node:assert/strict"
import { createTurnInput } from "../../thincoder-desktop/src/main/turn-input.mjs"

const makeDeps = (suspension) => ({
  post: () => {}, ensure: async () => { throw new Error("not used") }, flights: new Map(),
  queued: { add: () => ({ ok: false }) }, chain: { postQueue: () => {} },
  suspension, drive: () => {}, projects: { currentCwd: () => null }, denyGates: () => {}, capPending: new Map(),
})

test("① 窗在场 + 无携文（停止钮）⇒ 窗中止面承接", async () => {
  const aborted = []
  const suspension = {
    active: (key) => key === "2",
    abort: (key) => { aborted.push(key); return true },
  }
  const { interrupt } = createTurnInput(makeDeps(suspension))
  const r = interrupt("2", undefined) // 停止钮载荷形
  assert.deepEqual(r, { ok: true })
  assert.deepEqual(aborted, ["2"])
  // 携空串同停止钮语义（渲染面归一）
  const r2 = interrupt("2", "")
  assert.deepEqual(r2, { ok: true })
  assert.deepEqual(aborted, ["2", "2"])
})

test("② 窗在场 + 携文（Ctrl+I）⇒ idle（窗内语义未定义，本批零扩）", async () => {
  const aborted = []
  const suspension = { active: () => true, abort: (key) => { aborted.push(key); return true } }
  const { interrupt } = createTurnInput(makeDeps(suspension))
  assert.deepEqual(interrupt("2", "继续"), { ok: false, reason: "idle" })
  assert.deepEqual(aborted, [], "携文径零中止")
})

test("③ 窗不在 + 无 flight ⇒ idle（原语义保持）∥ 坏键 ⇒ bad-key", async () => {
  const suspension = { active: () => false, abort: () => true }
  const { interrupt } = createTurnInput(makeDeps(suspension))
  assert.deepEqual(interrupt("2", undefined), { ok: false, reason: "idle" })
  assert.deepEqual(interrupt("x", undefined), { ok: false, reason: "bad-key" })
})
