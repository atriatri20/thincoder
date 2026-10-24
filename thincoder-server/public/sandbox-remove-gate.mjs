/**
 * sandbox-remove-gate.mjs — 删除节点弹窗的「删除钮门」纯件（判据面单源：四态 = 不可达 ∥ 无承载 ∥ 有承载未勾 ∥ **工作区清单读败**）。
 *
 * 为什么外提为纯件：`views-sandbox.mjs` 是浏览器模块，仓内无 DOM 测试环境（无 `happy-dom` / `jsdom`）——判门逻辑留在闭包里，
 * 测试就只能对源码做静态断言，验的是书写形而非行为。判门入纯件后四态各成一例，`node --test` 直测。
 *
 * 读败态为什么必须禁删除：旧形把工作区清单失败径写成 `[]`，与「无承载」同值 ⇒ 承载数未知（而不是零）时删除钮照常可点，
 * 用户以为节点不承载工作区，一确认就把仍在跑的工作区解绑重放。读败 ≠ 无承载：未知一律先禁、明示、可重试。
 *
 * 入参：`containerReachable`（容器清单取数成否——`false` = 不可达）· `listedCount`（容器清单条数）·
 *       `workspacesOk`（承载工作区清单取数成否——`false` = 读败）· `boundCount`（本节点承载工作区数）·
 *       `boundConfirmed`（「确认丢弃」勾选态）。
 * 返形：`confirmDisabled`（删除钮禁用）· `hintKey`（本态主提示键；读败态 = 读败键）· `retry`（是否渲重试钮）。
 *
 * 并存态（容器不可达 ∧ 工作区清单读败）：`hintKey` 取读败键、`confirmDisabled = true`、`retry = true`；
 * 容器侧「不可达」句由渲面按容器实况另渲一行——两行并存，不互相取代。
 */
export function removeRunnerGate({ containerReachable, listedCount, workspacesOk, boundCount, boundConfirmed }) {
  const boundGate = Number(boundCount) > 0 && boundConfirmed !== true // 有承载未勾 ⇒ 禁（既有口径，三态不变）
  if (workspacesOk === false) {
    return { confirmDisabled: true, hintKey: "admin.sandbox.workspacesUnreachable", retry: true }
  }
  if (containerReachable === false) {
    return { confirmDisabled: boundGate, hintKey: "admin.sandbox.runnerUnreachable", retry: false }
  }
  if (Number(listedCount) > 0) {
    return { confirmDisabled: boundGate, hintKey: "admin.sandbox.runnerContainers", retry: false }
  }
  return { confirmDisabled: boundGate, hintKey: "admin.sandbox.removeRunnerConfirm", retry: false }
}
