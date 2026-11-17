/**
 * CLI 53-1 — knowledge 检索有界：宽词查询不吞窗口，0 命中指路，标点查询去标点命中。
 * 进入口 = 真 CLI 起 tiny 档会话（`handleTinyCommand` 落槽后掀下一轮），本地脚本化 Anthropic 端点在
 * 首回合派四次真 `knowledge` 调用；读第二回合请求体里回到模型的那四条工具结果。无外网、无付费端点。
 * 跑法（仓根）：node --test test/integration/knowledge-search-bounded.test.mjs
 *
 * 业务面 = 宽词查询的结果字符数不越过窗口预算的一小截（≤ 6,000）且外层报 matched ∥ shown ∥ truncated；
 * 全虚词查询显式失败并点名 query（批次红侧读数：同一次调用 59,530 字符、80 份主题）；0 命中回执点名
 * 两条下一步；带首尾标点的查询剥掉标点后按同一个词检索，回执是一份 matched > 0 的紧凑 JSON 而不是零
 * 命中回执。回指需求 `docs/core/requirements/PROMPT-SYSTEM.md` §6 与 §9.2。
 */
import { test } from "node:test"
import assert from "node:assert/strict"
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { removeTempDirBestEffort } from "../teardown.mjs"

import { createAgent, runAgent } from "../../thincoder-core/agent.mjs"
import { assembleBuiltinTools } from "../../thincoder-core/tools/index.mjs"
import { SEARCH_MAX_CHARS, SEARCH_MAX_TOPICS } from "../../thincoder-core/tools/knowledge.mjs"
import { _setSessionsDirForTest, _resetSessionsDirForTest } from "../../thincoder-core/session-slots.mjs"
import { loadSlotFile } from "../../thincoder-core/session.mjs"
import { newSlotData, saveSlotData } from "../../thincoder-core/session-slot-write.mjs"
import { handleTinyCommand } from "../../thincoder-cli/src/tui/cmd-eng.mjs"
import { fakeAnthropic } from "./fixtures/anthropic-endpoint.mjs"

const MODEL = "claude-fake-1"
const NO_MATCH_QUERY = "zzqxno_such_topic_marker"

function makeProject(tag) {
  const root = mkdtempSync(join(tmpdir(), `knowledge-bounded-${tag}-`))
  writeFileSync(join(root, "PROJECT-MANIFEST.json"), JSON.stringify({ version: 1, phase: "initial-dev", docRoot: { design: "docs/design", batches: "docs/batches" } }))
  writeFileSync(join(root, "AGENTS.md"), "PROJECT-RULE-MARKER: keep this rule in every mode.\n")
  mkdirSync(join(root, "docs/design"), { recursive: true })
  return root
}

function providerOf(port) {
  return { name: "fake-anthropic", baseURL: `http://127.0.0.1:${port}/v1`, format: "anthropic", apiKey: "test-key", model: MODEL, context: 1000 }
}

async function agentOf(root, port) {
  const provider = providerOf(port)
  const tools = await assembleBuiltinTools({ memory: null, cwd: root, model: MODEL })
  const agent = createAgent({
    provider, tools, memory: null, cwd: root,
    config: { agent: { mode: "normal", engineering: false }, providersList: [provider], defaultModel: `fake-anthropic:${MODEL}` },
  })
  agent.providers = [provider]
  agent.activeProvider = provider.name
  agent.activeModel = MODEL
  return agent
}

function toolNames(body) {
  return (body?.tools ?? []).map((tool) => tool.name ?? tool?.function?.name)
}

/** 一回请求体里回到模型的工具结果，按 tool_use id 索引。 */
function toolResultsById(body) {
  const results = new Map()
  for (const message of body?.messages ?? []) {
    for (const block of Array.isArray(message?.content) ? message.content : []) {
      if (block?.type === "tool_result") results.set(block.tool_use_id, String(block.content))
    }
  }
  return results
}

test("CLI 53-1 knowledge 检索有界：宽词查询不吞窗口，0 命中指路，标点查询去标点命中", { timeout: 180_000 }, async (t) => {
  const root = makeProject("53-1")
  const store = mkdtempSync(join(tmpdir(), "knowledge-bounded-store-"))
  _setSessionsDirForTest(store)
  // 首回合一次派四条真调用：全虚词 ∥ 含虚词的宽词 ∥ 必然 0 命中 ∥ 带首尾标点。
  const endpoint = await fakeAnthropic({ calls: [
    { id: "k_stopwords", name: "knowledge", input: { action: "search", query: "the" } },
    { id: "k_wide", name: "knowledge", input: { action: "search", query: "the evidence" } },
    { id: "k_none", name: "knowledge", input: { action: "search", query: NO_MATCH_QUERY } },
    { id: "k_punct", name: "knowledge", input: { action: "search", query: "doc?" } },
  ] })
  t.after(async () => {
    _resetSessionsDirForTest()
    await endpoint.close()
    removeTempDirBestEffort(root)
    removeTempDirBestEffort(store)
  })

  const agent = await agentOf(root, endpoint.port)
  agent._slot = 1
  saveSlotData(root, 1, newSlotData(root))
  const ctx = { agent, pushLine() {}, pushLabel() {} }
  await handleTinyCommand(ctx)
  assert.equal(loadSlotFile(root, 1).mode, "tiny", "命令落槽进 tiny 档")

  await runAgent(agent, "这个工具怎么用？查一下检索面", {}, {})
  const first = endpoint.requests[0].body
  assert.equal(loadSlotFile(root, 1).mode, "tiny", "本轮请求确在 tiny 档下发")
  assert.ok(toolNames(first).includes("knowledge"), "tiny 档工具面里有 knowledge")

  const second = endpoint.requests.find((request, index) => index > 0 && toolResultsById(request.body).size >= 4)
  assert.ok(second, "第二回合请求体带回四条工具结果")
  const byId = toolResultsById(second.body)
  const stopwords = byId.get("k_stopwords")
  const wide = byId.get("k_wide")
  const none = byId.get("k_none")
  const punct = byId.get("k_punct")
  assert.ok(stopwords?.length > 0 && wide?.length > 0 && none?.length > 0 && punct?.length > 0, "四条结果都回到了模型")

  // ① 全虚词查询：在工具的门口显式失败，报文点名 query 并给下一步，不回一段主题片段
  assert.match(stopwords, /^Error: /, "全虚词查询是显式失败，不是一段结果")
  assert.match(stopwords, /query/, "失败报文点名 query")
  assert.match(stopwords, /list/, "失败报文给下一步")
  assert.ok(!stopwords.includes('"matches"'), "失败回执里零个主题片段")

  // ② 宽词查询：体积有界 + 截断如实披露
  assert.ok(wide.length <= SEARCH_MAX_CHARS, `宽词结果 ${wide.length} 字符越 ${SEARCH_MAX_CHARS} 上限`)
  const envelope = JSON.parse(wide)
  assert.ok(Array.isArray(envelope.results))
  assert.ok(envelope.results.length <= SEARCH_MAX_TOPICS, `返回主题数 ${envelope.results.length} 越上限`)
  assert.equal(envelope.shown, envelope.results.length)
  assert.ok(envelope.matched > envelope.shown, `matched ${envelope.matched} 应大于 shown ${envelope.shown}`)
  assert.equal(envelope.truncated, true, "被截断必须如实报 true")

  // ③ 0 命中：回执点名两条下一步，且不伪造主题
  assert.match(none, /No knowledge topics matched/)
  assert.match(none, /English keyword/, "下一步其一：换单个英文关键词")
  assert.match(none, /list/, "下一步其二：先 list 看全部主题标识")
  assert.ok(!none.includes('"matches"'), "0 命中回执里零个主题片段")

  // ④ 标点查询：首尾标点剥掉后按 `doc` 检索——回执是一份有命中的紧凑 JSON，不是零命中回执
  assert.ok(punct.startsWith("{"), `标点查询回执不是一份 JSON 结果：${punct.slice(0, 120)}`)
  const punctEnvelope = JSON.parse(punct)
  assert.ok(punctEnvelope.matched > 0, `标点查询 matched ${punctEnvelope.matched} 应大于 0`)
  for (const key of ["matched", "shown", "truncated"]) {
    assert.ok(Object.hasOwn(punctEnvelope, key), `标点查询回执外层缺 ${key}`)
  }
})
