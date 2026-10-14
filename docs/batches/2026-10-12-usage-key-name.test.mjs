// 2026-10-12-usage-key-name 批 · 批内件（轻通道轮必要测试——设计定形 §2.4②：触及可执行行为面的笔 = 单元测试档随批档存）。
// 覆盖面 = 用户 15:35/15:41 点名的两半：① 「全队用量」key 列显示**名称**（名称优先）；② 「我的用量」**同列**（两页共用表头）。
// 桩：`dom.mjs` 顶层触 `document`（`flashEl` 取件）+ `h()` 触 `createElement`/`createTextNode`/`Node`
// ——沿 `2026-10-08-server-public-structure.test.mjs:32-33`「先桩后 import」先例；本档直调真渲染函数（非桩表）。
// 口径注：key 列值 = 「API Key」家族（用户 2026-10-10 定音「惯例都叫 apikey」——引用于 `webui/WEBUI.md:362`：
//         「同实体不留半清）/页题/秘密标签/用量报表键列」）。

import { test } from "node:test"
import assert from "node:assert/strict"

class FakeNode {
  constructor(tag) { this.tagName = tag; this.children = []; this.textContent = ""; this.className = ""; this.attributes = {} }
  append(...nodes) { for (const node of nodes) this.children.push(node) }
  setAttribute(name, value) { this.attributes[name] = String(value) }
  addEventListener() {}
}

class FakeText {
  constructor(text) { this.textContent = String(text) }
}

globalThis.Node = FakeNode
globalThis.document = {
  getElementById: () => null,
  createElement: (tag) => new FakeNode(tag),
  createTextNode: (text) => new FakeText(text),
}

const DOM = await import("../../thincoder-server/public/dom.mjs")

// ── 走树助手 ────────────────────────────────────────────────────────────────

/** 非空行 ⇒ `div.table-wrap > table`；空行 ⇒ `p.hint`（两种返回都原样带回）。 */
const render = (rows, opts) => DOM.usageTable(rows, opts)
const tableOf = (rows, opts) => {
  const wrap = render(rows, opts)
  assert.equal(wrap.tagName, "div", "非空行 ⇒ table-wrap")
  return wrap.children[0]
}
/** thead 的 th 文本列。 */
const headerTexts = (table) => table.children[0].children[0].children.map((th) => th.textContent)
/** tbody 的 td 文本列（cell = 文本节点 ∥ 子节点——统一取首个子的 textContent）。 */
const bodyTexts = (table) => table.children[1].children.map((tr) => tr.children.map((td) => td.children[0].textContent))

const BASE = { ts: 1700000000000, member: "alice", endpoint: "/v1/chat/completions", model: "m", status: "ok", promptTokens: 1, completionTokens: 2, totalTokens: 3, durationMs: 4 }

// ── 腿：T-UK1（两态表头含 key 列 · 口径值）───────────────────────────────────

test("T-UK1 表头：key 列两态均在（全队 ∥ 我的）；我的无成员列", () => {
  const rows = [{ ...BASE, keyName: "node-a", keyHint: "tc_aaa" }]
  const team = headerTexts(tableOf(rows, { withMember: true }))
  const mine = headerTexts(tableOf(rows, { withMember: false }))
  assert.ok(team.includes("API Key 名称"), "全队表头含 key 名称列")
  assert.ok(mine.includes("API Key 名称"), "我的表头含 key 名称列（两页共用）")
  assert.ok(team.includes("成员"), "全队含成员列")
  assert.ok(!mine.includes("成员"), "我的无成员列")
})

// ── 腿：T-UK2（单元格回退链：名称 ⇒ 提示形 ⇒ —）─────────────────────────────

test("T-UK2 单元格：名称优先 ⇒ 空名回退提示形 ⇒ 两空「—」（全队 ∥ 我的同位）", () => {
  const rows = [
    { ...BASE, keyName: "node-a", keyHint: "tc_aaa" },
    { ...BASE, keyName: "", keyHint: "tc_bbb" },
    { ...BASE, keyName: "", keyHint: "" },
  ]
  const mine = bodyTexts(tableOf(rows, { withMember: false }))
  assert.equal(mine[0][1], "node-a", "有名称 ⇒ 名称")
  assert.equal(mine[1][1], "tc_bbb", "空名 ⇒ 回退提示形")
  assert.equal(mine[2][1], "—", "两空 ⇒ —")
  const team = bodyTexts(tableOf(rows, { withMember: true }))
  assert.equal(team[0][2], "node-a", "全队同位（成员列占位后仍为 key 列）")
  assert.equal(team[2][2], "—", "两空 ⇒ —（同判）")
})

// ── 腿：T-UK3（空集 = hint 段，非空表）──────────────────────────────────────

test("T-UK3 空集：hint 段落（非表）", () => {
  const node = render([], {})
  assert.equal(node.tagName, "p")
  assert.equal(node.className, "hint")
})
