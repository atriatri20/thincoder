#!/usr/bin/env node
/**
 * 2026-10-12 消息复制钮批（ZCode `MessageActions` ∕ `CopyRowAction` 对位）——形面 `views/chat-tree.mjs`
 * `msgActionsNode` + 行为面 `renderer/msg-actions.mjs`。
 *
 * ZCode 语义（`v4/ConversationRowView.tsx` `CopyRowAction`）：行下操作行（hover ∕ focus 显现）内一枚
 * 图标钮 → `navigator.clipboard.writeText(text)` → 成功态打勾 1200ms 自复位；空文本 `disabled`；
 * 词面由调用面给（禁硬编码语言）。本仓对位：形住构树档（用户 ∕ 助手两族；按钮只落静态形 + `data-action`
 * ⇒ 重建零接线）、行为住委托档（取块内 `[data-raw]` 原始串——用户块已是剥除指引行的显示文）；词面复用
 * 既有 `msg.copy` ∕ `msg.copied`（核件代码块复制钮同键——零新键）。
 *
 * 用例：① 形面——user ∕ assistant 两族有钮、tool ∕ reasoning ∕ error 无；
 *  ② 行为——写剪贴板 + 打勾 + 1200ms 复位（注入缝）；③ 空文本 ∕ 无剪贴板零动作（不打假勾）；
 *  ④ `copyTargetText` 取 `[data-raw]`（含用户块剥指引行后的显示文）。
 */
import test from "node:test"
import assert from "node:assert/strict"
import { resolve } from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"

import "../../thincoder-desktop/test/rc-resolve.mjs" // `/rc/` 解析钩子（须先于任何 /rc/ 取件注册）

const ROOT = fileURLToPath(new URL("../../", import.meta.url))
const mod = (rel) => import(pathToFileURL(resolve(ROOT, rel)).href)

const { blockNode } = await mod("thincoder-desktop/renderer/views/chat-tree.mjs")
const { copyWithFeedback, copyTargetText } = await mod("thincoder-desktop/renderer/msg-actions.mjs")

/** 递归找复制钮（钮住 `.msg-actions` 容器内 —— 块直接子级是容器不是钮）。 */
const findCopy = (node) => {
  if (node?.props?.["data-action"] === "msg:copy") return node
  for (const child of node?.children ?? []) {
    const hit = findCopy(child)
    if (hit !== undefined) return hit
  }
  return undefined
}

test("① 形面：user ∕ assistant 挂复制钮；tool ∕ reasoning ∕ error 不挂", () => {
  const user = blockNode({ kind: "user", text: "你好", id: "u1" }, 0, 0, {}, undefined, false)
  const asst = blockNode({ kind: "assistant", text: "回复", id: "a1" }, 1, 0, {}, { kind: "user" }, false)
  assert.ok(findCopy(user), "用户块有钮")
  assert.ok(findCopy(asst), "助手块有钮")
  assert.equal(findCopy(user).props.class.includes("msg-copy-btn"), true, "钮面 class 判据（CSS 字形消费）")
  assert.equal(typeof findCopy(user).props.title, "string", "title 在场（词面——tooltip 系统消费）")
  const tool = blockNode({ kind: "tool", text: "x", id: "t1" }, 2, 0, {}, undefined, false)
  const reasoning = blockNode({ kind: "reasoning", text: "r", id: "r1" }, 3, 0, {}, undefined, false)
  const error = blockNode({ kind: "error", text: "e", id: "e1" }, 4, 0, {}, undefined, false)
  for (const [name, node] of [["tool", tool], ["reasoning", reasoning], ["error", error]]) {
    assert.equal(findCopy(node), undefined, `${name} 块不挂（零误伤）`)
  }
})

function fakeBtn() {
  const attrs = new Map()
  return {
    attrs,
    title: "复制",
    setAttribute: (k, v) => attrs.set(k, v),
    removeAttribute: (k) => attrs.delete(k),
    has: (k) => attrs.has(k),
  }
}

test("② 行为：写剪贴板 + 打勾 + 1200ms 复位（注入缝）", async () => {
  const btn = fakeBtn()
  const written = []
  let revert = null
  const ok = copyWithFeedback(btn, "要复制的文本", {
    clipboard: { writeText: (text) => { written.push(text); return Promise.resolve() } },
    timer: (fn, ms) => { revert = { fn, ms }; return 1 },
    clear: () => {},
  })
  assert.equal(ok, true)
  assert.deepEqual(written, ["要复制的文本"], "剪贴板写入原文")
  await Promise.resolve()
  await Promise.resolve()
  assert.equal(btn.has("data-copied"), true, "成功态打勾属性落位")
  assert.equal(revert.ms, 1200, "ZCode 同值 1200ms")
  revert.fn()
  assert.equal(btn.has("data-copied"), false, "复位摘态")
})

test("③ 空文本 ∕ 无剪贴板：零动作零假勾", () => {
  const btn = fakeBtn()
  assert.equal(copyWithFeedback(btn, "", { clipboard: { writeText: () => Promise.resolve() } }), false)
  assert.equal(btn.has("data-copied"), false)
  assert.equal(copyWithFeedback(btn, "x", { clipboard: null }), false, "无剪贴板 ⇒ 不发（诚实面）")
  assert.equal(copyWithFeedback(null, "x"), false, "无钮 ⇒ 零动作")
})

test("④ copyTargetText：取块内 [data-raw]（用户块 = 剥指引行后的显示文）", () => {
  const raw = { getAttribute: (k) => (k === "data-raw" ? "显示文（已剥指引行）" : null) }
  const block = { querySelector: (sel) => (sel === "[data-raw]" ? raw : null) }
  const btn = { closest: (sel) => (sel === ".block" ? block : null) }
  assert.equal(copyTargetText(btn), "显示文（已剥指引行）")
  assert.equal(copyTargetText({ closest: () => null }), "", "块缺位 ⇒ 空串（零动作）")
  assert.equal(copyTargetText({}), "", "畸形钮 ⇒ 空串")
})
