/**
 * CLI 50 — three work modes and tiny knowledge queries. Real command handlers, core run loop,
 * session slots and a local scripted Anthropic endpoint; no external model or network is used.
 * Run from the repository root: node --test test/integration/tiny-mode.test.mjs
 */
import { test } from "node:test"
import assert from "node:assert/strict"
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { pathToFileURL } from "node:url"
import { removeTempDirBestEffort } from "../teardown.mjs"

import { createAgent, runAgent } from "../../thincoder-core/agent.mjs"
import { applySession, loadSlotFile } from "../../thincoder-core/session.mjs"
import { newSlotData, saveSlotData } from "../../thincoder-core/session-slot-write.mjs"
import { _setSessionsDirForTest, _resetSessionsDirForTest } from "../../thincoder-core/session-slots.mjs"
import { assembleBuiltinTools } from "../../thincoder-core/tools/index.mjs"
import { listKnowledgeTopics, loadKnowledgeTopic } from "../../thincoder-core/prompt-files.mjs"
import { _upsertCodeFile, createMemory, docSync, put } from "../../thincoder-core/memory.mjs"
// 期望值取核的单源算式（`CONTEXT-COMPACTION.md` §2.2 两个预算出口）——本档不手算第二套。
import { policyBudget } from "../../thincoder-core/config.mjs"
import { normalizeOrigin } from "../../thincoder-core/memory/origin.mjs"
import { handleNormalCommand, handleTinyCommand } from "../../thincoder-cli/src/tui/cmd-eng.mjs"
import { buildSpawnChild } from "../../thincoder-core/agent-tools/subagent-spawn.mjs"
import { fakeAnthropic } from "./fixtures/anthropic-endpoint.mjs"

const MODEL = "claude-fake-1"
const QUERY = "quixotictinymarker"

function makeProject(tag) {
  const root = mkdtempSync(join(tmpdir(), `tiny-int-${tag}-`))
  writeFileSync(join(root, "PROJECT-MANIFEST.json"), JSON.stringify({ version: 1, phase: "initial-dev", docRoot: { design: "docs/design", batches: "docs/batches" } }))
  writeFileSync(join(root, "AGENTS.md"), "PROJECT-RULE-MARKER: keep this rule in every mode.\n")
  mkdirSync(join(root, "docs/design"), { recursive: true })
  mkdirSync(join(root, "src"), { recursive: true })
  writeFileSync(join(root, "docs/design/topic.md"), `# Searchable topic\n\n${QUERY} documentation body.\n`)
  writeFileSync(join(root, "src/a.mjs"), "import { b } from './b.mjs'\nexport const a = b\n")
  writeFileSync(join(root, "src/b.mjs"), "export const b = 1\n")
  return root
}

function providerOf(port) {
  return { name: "fake-anthropic", baseURL: `http://127.0.0.1:${port}/v1`, format: "anthropic", apiKey: "test-key", model: MODEL, context: 1000 }
}

async function agentOf(root, port, { mode = "normal", memory = null } = {}) {
  const provider = providerOf(port)
  const tools = await assembleBuiltinTools({ memory, cwd: root, model: MODEL })
  const agent = createAgent({
    provider, tools, memory, cwd: root,
    config: { agent: { mode, engineering: mode === "engineering" }, providersList: [provider], defaultModel: `fake-anthropic:${MODEL}` },
  })
  agent.providers = [provider]
  agent.activeProvider = provider.name
  agent.activeModel = MODEL
  return agent
}

function requestText(body) {
  return JSON.stringify(body?.messages ?? [])
}

function toolNames(body) {
  return (body?.tools ?? []).map((t) => t.name ?? t?.function?.name)
}

function count(haystack, needle) {
  return haystack.split(needle).length - 1
}

test("CLI 50-1 mode command changes the next real request, narrows three injections and survives slot restore", { timeout: 180_000 }, async (t) => {
  const root = makeProject("50-1")
  const endpoint = await fakeAnthropic()
  const store = mkdtempSync(join(tmpdir(), "tiny-int-store-"))
  _setSessionsDirForTest(store)
  const memory = createMemory({ dbPath: join(store, "memory.db") })
  memory.codeOrigin = root
  await put(memory, { type: "knowledge", title: QUERY, content: `${QUERY} previous-session memory.` })
  _upsertCodeFile(memory, normalizeOrigin(root), "src/a.mjs", ["import { b } from './b.mjs'", "export const a = b"], "javascript", Date.now())
  _upsertCodeFile(memory, normalizeOrigin(root), "src/b.mjs", ["export const b = 1"], "javascript", Date.now())
  await docSync(memory, root)
  t.after(async () => {
    memory.db.close()
    _resetSessionsDirForTest()
    await endpoint.close()
    removeTempDirBestEffort(root)
    removeTempDirBestEffort(store)
  })

  const agent = await agentOf(root, endpoint.port, { memory })
  agent._slot = 1
  saveSlotData(root, 1, newSlotData(root))
  await runAgent(agent, QUERY, {}, {})
  const normal = endpoint.requests.at(-1).body
  const normalText = requestText(normal)
  assert.ok(normal.system.includes("## Evidence discipline"), "normal uses the full master")
  assert.ok(normal.system.includes("PROJECT-RULE-MARKER"), "project rules stay present")
  assert.ok(toolNames(normal).includes("knowledge"), "normal also provides the shared knowledge tool")
  assert.ok(!normal.system.includes("PURE_QUERY_ONLY_MARKER"), "normal never inlines pure-query topics")
  assert.ok(normal.system.includes("## Knowledge topics"), "the full master carries the same knowledge query pointer")
  assert.ok(normalText.includes("Relevant documentation"), "normal really injects relevant docs")
  assert.ok(normalText.includes("Relevant memories"), "normal really injects relevant memories")
  assert.ok(normalText.includes("project dependency outline"), "normal really injects the project outline")

  const ctx = { agent, pushLine() {}, pushLabel() {} }
  await handleTinyCommand(ctx)
  assert.equal(loadSlotFile(root, 1).mode, "tiny")
  await runAgent(agent, `${QUERY} next`, {}, {})
  const tiny = endpoint.requests.at(-1).body
  const tinyText = requestText(tiny)
  assert.ok(tiny.system.includes("PROJECT-RULE-MARKER"), "tiny keeps project rules")
  assert.ok(!tiny.system.includes("## Evidence discipline"), "tiny removes detailed topics")
  assert.ok(toolNames(tiny).includes("knowledge"), "tiny provides the same knowledge tool")
  assert.ok(!tiny.system.includes("PURE_QUERY_ONLY_MARKER"), "tiny never inlines pure-query topics")
  assert.ok(tiny.system.includes("## Knowledge topics"), "tiny keeps the knowledge query pointer (requirements §9.2)")
  assert.ok(tiny.system.includes("When the method or a tool convention is unclear, query before acting"), "the pointer tells the model when to query")
  // 判据不拿一条小节标题替全体主题：逐个主题标题与整段正文都断，别的主题正文留着也会撞红。
  const topics = listKnowledgeTopics()
  assert.ok(topics.length > 0, "the bundled topic inventory is non-empty — an empty list must not read as green")
  for (const topic of topics) {
    assert.ok(!tiny.system.includes(topic.title), `tiny carries no topic body: ${topic.id} (${topic.title})`)
    assert.ok(!tiny.system.includes(loadKnowledgeTopic(topic.id).trim()), `tiny carries no topic body: ${topic.id} (full text)`)
  }
  assert.ok(tinyText.includes("mode: tiny"), "the next request sees the new mode")
  assert.equal(count(tinyText, "Relevant documentation"), count(normalText, "Relevant documentation"), "switching does not rewrite history and adds no new doc injection")
  assert.equal(count(tinyText, "Relevant memories"), count(normalText, "Relevant memories"), "no new memory injection")

  const restored = await agentOf(root, endpoint.port, { mode: "normal", memory })
  applySession(restored, loadSlotFile(root, 1))
  assert.equal(restored.config.agent.mode, "tiny")
  await runAgent(restored, QUERY, {}, {})
  const restoredBody = endpoint.requests.at(-1).body
  const restoredText = requestText(restoredBody)
  assert.ok(toolNames(restoredBody).includes("knowledge"))
  assert.ok(!restoredText.includes("Relevant documentation"))
  assert.ok(!restoredText.includes("Relevant memories"))
  assert.ok(!restoredText.includes("project dependency outline"))
  assert.ok(restoredBody.system.includes("PROJECT-RULE-MARKER"))
})

test("CLI 50-2 main and child agents query knowledge through list/search/get with real tool results", { timeout: 180_000 }, async (t) => {
  const root = makeProject("50-2")
  const endpoint = await fakeAnthropic({ calls: [
    { id: "k_list", name: "knowledge", input: { action: "list" } },
    { id: "k_search", name: "knowledge", input: { action: "search", query: "business failure" } },
    { id: "k_get", name: "knowledge", input: { action: "get", topic: "business-gates" } },
  ] })
  t.after(async () => {
    await endpoint.close()
    removeTempDirBestEffort(root)
  })
  const agent = await agentOf(root, endpoint.port, { mode: "tiny" })
  const reply = await runAgent(agent, "Read the business-gates topic", {}, {})
  assert.match(reply, /doc-lookup/)
  assert.match(reply, /business-gates/)
  assert.match(reply, /a business failure must fail/i)
  const first = endpoint.requests[0].body
  const last = endpoint.requests.at(-1).body
  assert.ok(toolNames(first).includes("knowledge"))
  assert.ok(requestText(last).includes("No such") === false, "the real calls returned content rather than a fixture refusal")

  const childEndpoint = await fakeAnthropic({ calls: [
    { id: "child_get", name: "knowledge", input: { action: "get", topic: "doc-lookup" } },
  ] })
  t.after(() => childEndpoint.close())
  const parent = await agentOf(root, childEndpoint.port, { mode: "tiny" })
  parent._subAgentCounter = 0
  const built = buildSpawnChild(parent, { depth: 0, agent: parent, callbacks: {}, onPermissionRequest: async () => true }, {
    role: "explore", goal: "Read the doc lookup topic.", knownFacts: "The topic id is doc-lookup.",
    scope: "Read-only knowledge query; do not edit files.", acceptance: "Return the complete topic reading.",
    reportFormat: "Quote the topic heading.", async: false,
  }, "explore", false, [], [], null)
  const childReply = await runAgent(built.child, built.input, built.childOpts, { ...built.childRunOpts, depth: 1 })
  assert.match(childReply, /Check the docs before you ask or answer/)
  const childBody = childEndpoint.requests[0].body
  assert.ok(childBody.system.includes("Role: read-only scout"))
  assert.ok(!childBody.system.includes("## Evidence discipline"))
  assert.ok(toolNames(childBody).includes("knowledge"), "tiny children receive knowledge too")
})

test("CLI 50-3 startup loads the real TUI module graph without stale session-write imports", async () => {
  // command-interactive 只在 tuiCommand 被调用时才动态 import tui.mjs，测试必须直指真实 TUI 图。
  const entry = join(process.cwd(), "thincoder-cli", "src", "tui.mjs")
  const loaded = await import(pathToFileURL(entry).href)
  assert.equal(typeof loaded.startTUI, "function")
})

/** `context` 工具 stats 回执读回面：stats 文本作为 tool_result 随下一发请求回到端点。 */
function statsTextOf(request) {
  const texts = []
  for (const m of request?.body?.messages ?? []) {
    for (const block of Array.isArray(m?.content) ? m.content : []) {
      if (block?.type === "tool_result") texts.push(String(block.content))
    }
  }
  return texts.filter((t) => t.startsWith("Context ≈")).at(-1) ?? null
}

/** 一发 stats 的窗口读数：首行分母 ∥ 请求预算窗口 ∥ 状态行分母——按 `CONTEXT-COMPACTION.md` §2.5
 *  「显示与判定同基准」，前两处与状态行的**分母**都取 `limit`（用户实际可填的量），窗口只作具名读数。 */
function windowReadings(stats) {
  const missing = stats == null
  return {
    missing,
    occupancy: Number((stats?.match(/of (\d+) fillable limit/) ?? [])[1]),
    budget: Number((stats?.match(/Request budget: window (\d+)/) ?? [])[1]),
    statusLine: Number((stats?.match(/calibrated history estimate \/ (\d+) fillable limit/) ?? [])[1]),
    compactionLine: Number((stats?.match(/compaction line (\d+)/) ?? [])[1]),
  }
}

test("CLI 50-6 tiny 档切进切出，窗口分母随档变化", { timeout: 180_000 }, async (t) => {
  const root = makeProject("50-6")
  // 三发 stats：起会话（normal）· `/tiny` 后 · `/normal` 后——每发工具回合占两次对话请求，故按请求序号派单。
  // 每次调用用**不同**的调用 id：真实上游一次调用一个 id，同 id 重复会让配对面无法区分哪一条结果属于哪次调用
  // （保留窗把上一轮的工具结果留在机读线上之后，同 id 就会把本轮结果挤成占位符）。
  const statsCallAt = (n) => [{ id: `ctx_stats_${n}`, name: "context", input: { action: "stats" } }]
  const endpoint = await fakeAnthropic({ callsAt: { 1: statsCallAt(1), 3: statsCallAt(3), 5: statsCallAt(5) } })
  const store = mkdtempSync(join(tmpdir(), "tiny-int-store-"))
  _setSessionsDirForTest(store)
  t.after(async () => {
    _resetSessionsDirForTest()
    await endpoint.close()
    removeTempDirBestEffort(root)
    removeTempDirBestEffort(store)
  })

  const modelWindow = 1024 * 1000 // provider.context 1000K = 1_024_000（夹具 = 1M 窗模型）
  const agent = await agentOf(root, endpoint.port, { mode: "normal" })
  agent._slot = 1
  saveSlotData(root, 1, newSlotData(root))
  const ctx = { agent, pushLine() {}, pushLabel() {} }
  // 期望值从核的单源算式取（不在此手算第二套）：分母 = `limit`，窗口 = 有效窗口（§2.5 / §2.2）。
  const normalBudget = policyBudget(agent.provider, undefined, "normal")
  const tinyBudget = policyBudget(agent.provider, undefined, "tiny")

  await runAgent(agent, "read the context window", {}, {})
  const before = windowReadings(statsTextOf(endpoint.requests.at(-1)))
  assert.equal(before.missing, false, "起会话那一发要真的拿到 stats 回执")
  assert.equal(normalBudget.window, modelWindow, "夹具前提：normal 档窗口 = 模型窗口")
  assert.deepEqual([before.occupancy, before.budget, before.statusLine], [normalBudget.limit, modelWindow, normalBudget.limit], "normal 档第一/三处读 limit，第二处报窗口")

  await handleTinyCommand(ctx)
  assert.equal(loadSlotFile(root, 1).mode, "tiny")
  await runAgent(agent, "read the context window again", {}, {})
  const tinyRequest = endpoint.requests.at(-1)
  const tiny = windowReadings(statsTextOf(tinyRequest))
  assert.equal(tiny.missing, false)
  assert.equal(tinyBudget.window, 262144, "夹具前提：tiny 档窗口落到上限 262144")
  assert.deepEqual([tiny.occupancy, tiny.budget, tiny.statusLine], [tinyBudget.limit, 262144, tinyBudget.limit], "tiny 档分母与窗口全部落到 262144 那一档派生值")
  assert.ok(tiny.compactionLine > 0 && tiny.compactionLine < tinyBudget.limit, "压缩线跟着有效窗口压下来，且仍是一条可触及的线")

  await handleNormalCommand(ctx)
  assert.equal(loadSlotFile(root, 1).mode, "normal")
  await runAgent(agent, "read the context window once more", {}, {})
  const afterRequest = endpoint.requests.at(-1)
  const back = windowReadings(statsTextOf(afterRequest))
  assert.equal(back.missing, false)
  assert.deepEqual([back.occupancy, back.budget, back.statusLine], [normalBudget.limit, modelWindow, normalBudget.limit], "切出 tiny 后三处读数回到模型窗口那一档，不残留 262144")
  assert.equal(back.compactionLine, before.compactionLine, "切出后压缩线回到同一条")

  // 两档工具面与提示词面不变：切档只动窗口分母，不动工具集与项目规则块。
  assert.deepEqual(toolNames(tinyRequest.body), toolNames(afterRequest.body), "两档工具面一致")
  assert.ok(toolNames(tinyRequest.body).includes("context"))
  assert.ok(tinyRequest.body.system.includes("PROJECT-RULE-MARKER"), "tiny 档项目规则仍在")
  assert.ok(afterRequest.body.system.includes("PROJECT-RULE-MARKER"), "normal 档项目规则仍在")
})
