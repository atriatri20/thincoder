/**
 * model-menu-pure.test.mjs — 模型菜单三件纯件（`#1529` 拆缝）的常驻用例：候选三态 ∥ 面板落位。
 * 判据来源 = `docs/render-core/design/RENDER-CORE.md` §5 条 6（空表 ≠ 未到；锚零矩形 ⇒ 视口居中）。
 */
import { test } from "node:test"
import assert from "node:assert/strict"
import { computePlacement } from "../composer/model-menu-place.mjs"
import { menuStateOf } from "../composer/model-menu-state.mjs"

const VIEWPORT = { width: 1200, height: 800 }

test("menuStateOf 态一 · 候选未到（null ∥ undefined）⇒ loading", () => {
  assert.equal(menuStateOf(null), "loading")
  assert.equal(menuStateOf(undefined), "loading")
})

test("menuStateOf 态二 · 已到且空（[]）⇒ empty，不是 loading", () => {
  assert.equal(menuStateOf([]), "empty")
})

test("menuStateOf 态三 · 有候选 ⇒ list", () => {
  assert.equal(menuStateOf([{ id: "deepseek-chat", provider: "deepseek" }]), "list")
})

test("computePlacement 零矩形（锚无 CSS 盒）⇒ 面板视口居中", () => {
  const zero = { left: 0, top: 0, right: 0, bottom: 0, width: 0, height: 0 }
  const pos = computePlacement({ anchorRect: zero, viewport: VIEWPORT, panelHeight: 300, panelWidth: 270 })
  assert.equal(pos.left, 465) // (1200 − 270) / 2
  assert.equal(pos.top, 250) // (800 − 300) / 2
  assert.ok(Math.abs(pos.left + 270 / 2 - VIEWPORT.width / 2) <= 2)
  assert.ok(Math.abs(pos.top + 300 / 2 - VIEWPORT.height / 2) <= 2)
})

test("computePlacement 正常锚 ⇒ 与旧公式逐值相等（下方有位 ⇒ 贴锚下沿）", () => {
  const rect = { left: 700, top: 100, right: 800, bottom: 140, width: 100, height: 40 }
  const pos = computePlacement({ anchorRect: rect, viewport: VIEWPORT, panelHeight: 300, up: false })
  assert.equal(pos.left, Math.max(4, Math.min(rect.left, VIEWPORT.width - 270)))
  assert.equal(pos.top, rect.bottom + 4)
  // 右侧无位 ⇒ 横向夹到视口宽 − 面板宽
  const edge = computePlacement({ anchorRect: { ...rect, left: 1100 }, viewport: VIEWPORT, panelHeight: 300, up: false })
  assert.equal(edge.left, VIEWPORT.width - 270)
})

test("computePlacement up:true ⇒ 翻上；下方无位亦翻上（夹到 ≥ 4）", () => {
  const rect = { left: 300, top: 100, right: 400, bottom: 140, width: 100, height: 40 }
  assert.equal(computePlacement({ anchorRect: rect, viewport: VIEWPORT, panelHeight: 300, up: true }).top, Math.max(4, rect.top - 300 - 4))
  const tight = { left: 300, top: 300, right: 400, bottom: 340, width: 100, height: 40 }
  assert.equal(computePlacement({ anchorRect: tight, viewport: { width: 1200, height: 400 }, panelHeight: 300, up: false }).top, 4)
})
