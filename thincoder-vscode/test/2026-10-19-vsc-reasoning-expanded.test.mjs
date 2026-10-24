/**
 * 2026-10-19-vsc-reasoning-expanded.test.mjs — 推理块默认展开（批档 2026-10-19-vsc-reasoning-expanded · 台账 #1704）：
 * 判据 C15（`docs/render-core/design/RENDER-CORE.md` §7）——
 *   ① live 径：`renderReasoning` 造的 `details.reasoning-block` ⇒ `open === true`；
 *   ② 恢复径：`buildAssistantRestore` 渲出的 `.reasoning-block` 元素 ⇒ `open === true`（与 live 径同拍）；
 *   ③ 负控：宿主本身解析 `open` 属性集——无 `open` 的 `<details>` ⇒ `.open === false`
 *      （证明断言读的是 DOM 属性，不是串匹配——串匹配桩在此必红）。
 * 宿主 = happy-dom（`@happy-dom/global-registrator`，VSC devDep）——恢复径以 innerHTML 构 DOM，
 * 无解析器的桩只能串匹配，正是本判据要排除的形态。
 */
import assert from "node:assert/strict"
import { test } from "node:test"
import { GlobalRegistrator } from "@happy-dom/global-registrator"

GlobalRegistrator.register()
const { renderReasoning } = await import("@thincoder/render-core/flow/reasoning.mjs")
const { buildAssistantRestore } = await import("@thincoder/render-core/flow/block.mjs")

test("C15 ① live 径：renderReasoning 默认展开", () => {
  const { el } = renderReasoning({})
  assert.equal(el.open, true, "live 流式径的推理块应默认展开（details.open === true）")
})

test("C15 ② 恢复径：buildAssistantRestore 的 reasoning-block 默认展开", () => {
  const node = buildAssistantRestore({ reasoning: "x" })
  const block = node.querySelector("details.reasoning-block")
  assert.ok(block, "恢复帧应含 details.reasoning-block")
  assert.equal(block.open, true, "恢复帧的推理块应与 live 径同拍（open === true）")
})

test("C15 ③ 负控：宿主本身解析 open 属性集（无 open ⇒ false）", () => {
  const d = document.createElement("div")
  d.innerHTML = '<details class="reasoning-block"></details>'
  assert.equal(
    d.querySelector(".reasoning-block").open,
    false,
    "无 open 属性的 details 解析后 open 应为 false——证明宿主真解析属性集（串匹配桩在此必红）",
  )
})
