/**
 * 2026-10-19-product-remainder.test.mjs — 批内单测件（批档 = `docs/batches/2026-10-19-product-remainder.md` §2.7 B7）：
 * `#1519` 删除节点弹窗的「承载工作区清单读败」第三态——判门纯件 `removeRunnerGate` 四态 + 旧三态回归对照。
 *
 * 为什么测纯件而不测渲面：`views-sandbox.mjs` 是浏览器模块，仓内无 DOM 测试环境 ⇒ 渲面只能验书写形；
 * 判门外提成纯件后，四态各一例走真行为。
 *
 * **用毕即删（零留存）**：本档随批档归档、不进任何 `test/` 收集面；§5 留一行读数。
 * 注：本批三舱并行——本档当前只含丙舱（`#1519`）部分；甲 ∥ 乙舱的用例由各自补入，勿整档覆写。
 */
import { test } from "node:test"
import assert from "node:assert/strict"
import { dirname, join } from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..")
const { removeRunnerGate } = await import(pathToFileURL(join(ROOT, "thincoder-server/public/sandbox-remove-gate.mjs")).href)

/** 旧口径（改前 `views-sandbox.mjs:305`）：`confirmBtn.disabled = boundCount > 0 && !boundConfirmed`。 */
const oldGate = (boundCount, boundConfirmed) => boundCount > 0 && !boundConfirmed

test("#1519 态一 · 容器可达 + 无承载 ⇒ 删除钮可点（旧行为逐字不变）", () => {
  const gate = removeRunnerGate({ containerReachable: true, listedCount: 0, workspacesOk: true, boundCount: 0, boundConfirmed: false })
  assert.equal(gate.confirmDisabled, false)
  assert.equal(gate.hintKey, "admin.sandbox.removeRunnerConfirm")
  assert.equal(gate.retry, false)
})

test("#1519 态二 · 有承载未勾 ⇒ 删除钮禁", () => {
  const gate = removeRunnerGate({ containerReachable: true, listedCount: 0, workspacesOk: true, boundCount: 2, boundConfirmed: false })
  assert.equal(gate.confirmDisabled, true)
  assert.equal(gate.hintKey, "admin.sandbox.removeRunnerConfirm")
  assert.equal(gate.retry, false)
})

test("#1519 态三 · 有承载已勾 ⇒ 删除钮启", () => {
  const gate = removeRunnerGate({ containerReachable: true, listedCount: 0, workspacesOk: true, boundCount: 2, boundConfirmed: true })
  assert.equal(gate.confirmDisabled, false)
  assert.equal(gate.retry, false)
})

test("#1519 态四 · 工作区清单读败 ⇒ 禁 + 读败键 + 重试（承载数未知不得放行）", () => {
  const gate = removeRunnerGate({ containerReachable: true, listedCount: 0, workspacesOk: false, boundCount: 0, boundConfirmed: false })
  assert.equal(gate.confirmDisabled, true)
  assert.equal(gate.hintKey, "admin.sandbox.workspacesUnreachable")
  assert.equal(gate.retry, true)
})

test("#1519 并存态 · 容器不可达 ∧ 工作区清单读败 ⇒ 读败键优先（容器句由渲面另渲一行）", () => {
  const gate = removeRunnerGate({ containerReachable: false, listedCount: 0, workspacesOk: false, boundCount: 0, boundConfirmed: false })
  assert.equal(gate.confirmDisabled, true)
  assert.equal(gate.hintKey, "admin.sandbox.workspacesUnreachable")
  assert.equal(gate.retry, true)
})

test("#1519 回归对照 · 容器侧三态（读败不成立时）判门与旧口径逐值相等", () => {
  const cases = [
    { containerReachable: false, listedCount: 0 },
    { containerReachable: true, listedCount: 0 },
    { containerReachable: true, listedCount: 3 },
  ]
  for (const c of cases) {
    for (const boundCount of [0, 1, 4]) {
      for (const boundConfirmed of [false, true]) {
        const gate = removeRunnerGate({ ...c, workspacesOk: true, boundCount, boundConfirmed })
        assert.equal(gate.confirmDisabled, oldGate(boundCount, boundConfirmed), JSON.stringify({ ...c, boundCount, boundConfirmed }))
        assert.equal(gate.retry, false)
      }
    }
  }
  // 容器侧提示键按实况分列（不可达 ∥ 无容器单确认 ∥ 有容器二选一）
  assert.equal(removeRunnerGate({ containerReachable: false, listedCount: 0, workspacesOk: true, boundCount: 0, boundConfirmed: false }).hintKey, "admin.sandbox.runnerUnreachable")
  assert.equal(removeRunnerGate({ containerReachable: true, listedCount: 3, workspacesOk: true, boundCount: 0, boundConfirmed: false }).hintKey, "admin.sandbox.runnerContainers")
})
