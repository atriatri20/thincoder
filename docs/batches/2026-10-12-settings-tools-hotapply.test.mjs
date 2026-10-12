#!/usr/bin/env node
/**
 * 2026-10-12 桌面 `settings:tools` 写盘热应用批（方案 A）——`thincoder-desktop/src/main/settings-tools.mjs`。
 *
 * 病灶（用户实测 + 另一 agent 诊断）：桌面面板存 websearch key 只写盘、**不热应用**运行中 agent 的
 * 活配置对象（`agent.config`）⇒ 核 `tools/web.mjs` `fetchTavily` 读 `ctx.agent.config.websearch.apiKey`
 * 恒空 ⇒ **静默掉回 Bing**（盘上有 key，工具仍出 `[bing]` 标签）。核 `agent-tools/settings.mjs` 的 set
 * 是「写盘 + 热应用」两笔，桌面这条通道缺后半 ⇒ 本批补齐（写形与写盘同函数复用 ⇒ 盘 ∕ 内存零分叉）。
 *
 * 用例：① 置 websearch key ⇒ 盘 ∕ 活 agent 双落；② 清键（空串）⇒ 双摘 + 空节点双删；
 *  ③ embedding 置键 ⇒ 盘 ∕ 活 agent 同形（含 baseURL ∕ model 回填）；④ 非法补丁 ⇒ 零写零热应用；
 *  ⑤ 无 listAgents（平 node ∕ 无宿主）⇒ 照常写盘、零抛。
 */
import test from "node:test"
import assert from "node:assert/strict"
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join, resolve } from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"

const ROOT = fileURLToPath(new URL("../../", import.meta.url))
// settings-tools 内部走 `@thincoder/core/*`（裸包名）——测试须取**同一模块实例**的配置缝
// （物化副本 = 桌面运行时同一份；`_setConfigPathForTest` 才作用到它读写的路径）。
const coreConfig = await import(pathToFileURL(resolve(ROOT, "thincoder-desktop/node_modules/@thincoder/core/config.mjs")).href)
const { settingsTools } = await import(pathToFileURL(resolve(ROOT, "thincoder-desktop/src/main/settings-tools.mjs")).href)

function withTempConfig(body = "{}") {
  const dir = mkdtempSync(join(tmpdir(), "settings-tools-"))
  const file = join(dir, "config.json")
  writeFileSync(file, body)
  coreConfig._setConfigPathForTest(file)
  return { file, read: () => JSON.parse(readFileSync(file, "utf8")) }
}

function fakeAgents() {
  return [
    { config: { websearch: { apiKey: "old-key" }, agent: { maxTurns: 5 } } },
    { config: {} },
    null, // 畸形项（防御：跳过不抛）
  ]
}

test("① 置 websearch key ⇒ 盘 ∕ 活 agent 双落（热应用核心用例）", () => {
  const cfg = withTempConfig()
  const agents = fakeAgents()
  const r = settingsTools({ patch: { websearch: { apiKey: "tvly-abc123" } } }, { listAgents: () => agents })
  assert.equal(r.ok, true)
  assert.equal(r.websearch.hasKey, true, "回执 = 写后回读（盘面在场）")
  assert.equal(cfg.read().websearch.apiKey, "tvly-abc123", "盘落")
  assert.equal(agents[0].config.websearch.apiKey, "tvly-abc123", "活 agent 热应用（此前恒空 ⇒ 掉回 Bing 的根因面）")
  assert.equal(agents[1].config.websearch.apiKey, "tvly-abc123", "空 config agent 同落（节点就地建）")
  assert.deepEqual(agents[0].config.agent, { maxTurns: 5 }, "他节零触碰")
  coreConfig._resetConfigPathForTest()
})

test("② 清键（空串）⇒ 盘 ∕ 活 agent 双摘 + 空节点双删", () => {
  const cfg = withTempConfig(JSON.stringify({ websearch: { apiKey: "k" } }))
  const agents = fakeAgents()
  const r = settingsTools({ patch: { websearch: { apiKey: "" } } }, { listAgents: () => agents })
  assert.equal(r.ok, true)
  assert.equal(r.websearch.hasKey, false, "回执 = 清后回读")
  assert.equal("websearch" in cfg.read(), false, "盘：键摘 + 空节点删")
  assert.equal("websearch" in agents[0].config, false, "活 agent：同律（零分叉）")
  coreConfig._resetConfigPathForTest()
})

test("③ embedding 置键 ⇒ 盘 ∕ 活 agent 同形（baseURL ∕ model 回填）", () => {
  const cfg = withTempConfig()
  const agents = fakeAgents()
  const r = settingsTools({ patch: { embedding: { apiKey: "emb-1" } } }, { listAgents: () => agents })
  assert.equal(r.ok, true)
  const disk = cfg.read().embedding
  assert.equal(disk.apiKey, "emb-1")
  assert.equal(typeof disk.baseURL, "string", "缺位回填核 DEFAULTS")
  assert.equal(typeof disk.model, "string")
  assert.deepEqual(agents[0].config.embedding, disk, "盘 ∕ 内存逐键相等（同函数复用）")
  coreConfig._resetConfigPathForTest()
})

test("④ 非法补丁（apiKey 非串）⇒ 零写零热应用", () => {
  const cfg = withTempConfig()
  const agents = fakeAgents()
  const before = cfg.read()
  const r = settingsTools({ patch: { websearch: { apiKey: 123 } } }, { listAgents: () => agents })
  assert.equal(r.ok, false)
  assert.equal(r.reason, "invalid-patch")
  assert.deepEqual(cfg.read(), before, "盘零写")
  assert.equal(agents[0].config.websearch.apiKey, "old-key", "活 agent 零动")
  coreConfig._resetConfigPathForTest()
})

test("⑤ 无 listAgents（平 node ∕ 无宿主）⇒ 照常写盘、零抛", () => {
  const cfg = withTempConfig()
  const r = settingsTools({ patch: { websearch: { apiKey: "k2" } } })
  assert.equal(r.ok, true)
  assert.equal(cfg.read().websearch.apiKey, "k2")
  const r2 = settingsTools({}, { listAgents: () => null })
  assert.equal(r2.ok, true, "读支 ∕ 缺宿主零动作")
  coreConfig._resetConfigPathForTest()
})
