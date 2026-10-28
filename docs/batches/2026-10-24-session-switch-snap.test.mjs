/** 批档（2026-10-24 · 会话切换快照回放批）：用户实测「切别会话回来又要重新加载一遍，还在跑的内容没了」——
 *  根因两条：① 流面写者键门（`forActive`）把非活动会话的流面事件**直接弃写**（单 blocks 表架构）；
 *  ② 切回 `openPage` 无条件 page-0 重拉 + `applyPage` 整置 = 磁盘态打回（在飞尾不在盘）。
 *  修 = 离场快照（blocks ∕ 游标）+ 积压队列（离场期流面事件保尾 4000）+ 切回回放（写者语义零改）。
 *  本档四腿：积压入队 ∕ 切回快照还原 + 回放 ∕ 帽 4000 保尾 ∕ 首屏整置清快照。 */
import { registerHooks } from "node:module"
import { pathToFileURL } from "node:url"
import { join, dirname } from "node:path"
import { fileURLToPath } from "node:url"

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = join(HERE, "..", "..")
const url = (rel) => pathToFileURL(join(ROOT, rel)).href
registerHooks({
  resolve(spec, context, next) {
    if (spec.startsWith("/rc/")) return { url: url(`thincoder-render-core/${spec.slice(4)}`), shortCircuit: true, format: "module" }
    if (spec.startsWith("@thincoder/core/")) return { url: url(`thincoder-core/${spec.slice("@thincoder/core/".length)}`), shortCircuit: true, format: "module" }
    return next(spec, context)
  },
})

import { test } from "node:test"
import assert from "node:assert/strict"

let reduce, openSession, applyPage
const baseState = () => ({
  activeSession: "1",
  blocks: [{ kind: "user", text: "会话一的问句" }],
  history: { hasOlder: false, inFlight: false, page: null },
  tabBadges: {}, subBlocks: {}, turns: {}, turnStarts: {}, lastOutputAt: {},
})

test("① 积压入队：非活动键的流面事件入 pendingEvents（非流面通道照旧直写）", async () => {
  ;({ reduce, openSession } = await import(url("thincoder-desktop/renderer/events.mjs")))
  ;({ applyPage } = await import(url("thincoder-desktop/renderer/page-read.mjs")))
  let s = baseState()
  s = openSession(s, "2") // 切到 2（无快照 → 走页读路径；1 的 blocks 进快照）
  assert.equal(s.activeSession, "2")
  assert.ok(s.flowSnaps?.["1"] !== undefined, "离场快照落位")
  assert.equal(s.snapRestored, null)
  // 在飞：会话 1 的 token ∕ tool-call 事件（键门原语义 = 弃写；本批 = 入队）
  s = reduce(s, { channel: "ev:token", key: "1", text: "正在输出" })
  s = reduce(s, { channel: "ev:tool-call", key: "1", id: "t1", tool: "bash" })
  assert.equal(s.pendingEvents?.["1"]?.length, 2, "两条流面事件积压")
  // 非流面通道（usage 键面）不积压
  s = reduce(s, { channel: "ev:usage", key: "1", ctxPct: 5 })
  assert.equal(s.pendingEvents?.["1"]?.length, 2, "usage 照旧直写不积压")
})

test("② 切回：快照还原 + 积压回放（在飞内容续显）+ snapRestored 旗标", async () => {
  let s = baseState()
  s = openSession(s, "2")
  s = reduce(s, { channel: "ev:token", key: "1", text: "甲" })
  s = reduce(s, { channel: "ev:token", key: "1", text: "乙" })
  s = openSession(s, "1") // 切回 1
  assert.equal(s.activeSession, "1")
  assert.equal(s.snapRestored, "1", "还原旗标在场（openPage 据此免重拉）")
  assert.ok(s.flowSnaps?.["2"] !== undefined, "离场（2）快照同拍落位")
  const tokens = s.blocks.filter((b) => b.kind === "assistant")
  assert.ok(tokens.length >= 1 && String(tokens.at(-1)?.text ?? "").includes("甲"), "积压 token 回放进块面（在飞内容续显）")
  assert.equal(s.pendingEvents?.["1"] ?? undefined, undefined, "回放后队列清")
})

test("③ 帽 4000 保尾 ∕ 同键重开幂等", async () => {
  let s = baseState()
  s = openSession(s, "2")
  for (let i = 0; i < 4010; i += 1) s = reduce(s, { channel: "ev:token", key: "1", text: `t${i}` })
  assert.equal(s.pendingEvents?.["1"]?.length, 4000, "帽内保尾")
  assert.equal(s.pendingEvents["1"][0].text, "t10", "最旧被裁")
  const before = s
  assert.equal(openSession(before, "2"), before, "同键重开（零变化）⇒ 原引用")
})

test("④ 首屏整置清快照（权威刷新后**被刷新键**的陈旧快照作废；他键快照保留）", async () => {
  let s = baseState()
  s = openSession(s, "2") // 快照 1
  s = openSession(s, "1") // 切回 1（还原 + 快照 2）
  assert.ok(s.flowSnaps?.["2"] !== undefined, "2 的快照在场")
  const receipt = {
    ok: true, hasOlder: false, next: null,
    messages: [{ kind: "user", text: "一号的问句", timestamp: Date.now() }, { kind: "assistant", text: "一号答", timestamp: Date.now() }],
    meta: { provider: "p", model: "m" }, flags: {}, queue: [],
  }
  s = applyPage(s, receipt, { key: "1", before: null }) // 用户在 1 号内显式刷新
  assert.equal(s.flowSnaps?.["1"] ?? undefined, undefined, "被刷新键（1）快照作废")
  assert.ok(s.flowSnaps?.["2"] !== undefined, "他键（2）快照保留")
  assert.equal(s.blocks.length, 2, "整置生效")
})
