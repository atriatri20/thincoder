/**
 * CLI 50-4 — 三档工具描述：极简档只发常驻面，展开面经 `knowledge get` 取回，完整档等于改造前全文。
 * 进入口 = 真 CLI 命令（`/minimal` ∥ `/normal` 的命令处理函数）+ 本地脚本化 Anthropic 端点；
 * 档位由命令落槽再掀下一轮，不由测试直接写 config。无外网、无付费端点。
 * 跑法（仓根）：node --test test/integration/tool-description-tiers.test.mjs
 *
 * 对照基准 = 批起快照 `e82e704` 上的工具描述（设计 PROMPT-SYSTEM §2「对照基准写死」）：
 * 「改造前」一侧一律 `git show e82e704:thincoder-core/tool-docs/<档>.md`，不取工作树当前文。
 */
import { test } from "node:test"
import assert from "node:assert/strict"
import { execFileSync } from "node:child_process"
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { removeTempDirBestEffort } from "../teardown.mjs"

import { createAgent, runAgent } from "../../thincoder-core/agent.mjs"
import { assembleBuiltinTools } from "../../thincoder-core/tools/index.mjs"
import { expandToolDescription } from "../../thincoder-core/tools/shared.mjs"
import { loadKnowledgeTopic, loadToolDoc } from "../../thincoder-core/prompt-files.mjs"
import { _setSessionsDirForTest, _resetSessionsDirForTest } from "../../thincoder-core/session-slots.mjs"
import { newSlotData, saveSlotData } from "../../thincoder-core/session-slot-write.mjs"
import { handleMinimalCommand, handleNormalCommand } from "../../thincoder-cli/src/tui/cmd-eng.mjs"
import { fakeAnthropic } from "./fixtures/anthropic-endpoint.mjs"

const MODEL = "claude-fake-1"
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..")
const CONSULT_MARK = "independent expert consultants"
/** 极简会话里的 consult 工具面自有一套（无 bash）；取它真带、且本批被拆过的那一档来比。 */
const CONSULT_TOOL = "doc_check"

function makeProject(tag) {
  const root = mkdtempSync(join(tmpdir(), `tool-desc-${tag}-`))
  writeFileSync(join(root, "PROJECT-MANIFEST.json"), JSON.stringify({ version: 1, phase: "initial-dev", docRoot: { design: "docs/design", batches: "docs/batches" } }))
  mkdirSync(join(root, "docs/design"), { recursive: true })
  return root
}

function providerOf(port) {
  return { name: "fake-anthropic", baseURL: `http://127.0.0.1:${port}/v1`, format: "anthropic", apiKey: "test-key", model: MODEL, context: 1000 }
}

async function agentOf(root, port, { mode = "normal", consultModels = [] } = {}) {
  const provider = providerOf(port)
  const tools = await assembleBuiltinTools({ memory: null, cwd: root, model: MODEL })
  const agent = createAgent({
    provider, tools, memory: null, cwd: root,
    config: { agent: { mode, engineering: mode === "engineering", consultModels }, providersList: [provider], defaultModel: `fake-anthropic:${MODEL}` },
  })
  agent.providers = [provider]
  agent.activeProvider = provider.name
  agent.activeModel = MODEL
  return agent
}

/** The tool list a request actually carried (Anthropic Messages shape). */
function toolsOf(body) {
  return body?.tools ?? []
}

function descriptionOf(body, name) {
  const found = toolsOf(body).find((t) => t.name === name)
  assert.ok(found, `请求体里必须有 ${name} 这一档工具`)
  return found.description
}

/** Every tool_result text a request's history carried — what the model really received. */
function toolResultsOf(body) {
  return (body?.messages ?? []).flatMap((m) => (Array.isArray(m?.content) ? m.content : []))
    .filter((block) => block?.type === "tool_result")
    .map((block) => String(block.content))
}

/** 改造前全文（批起快照）。快照不在本地对象库里时点名原因，不涸成裸 git 抛错。 */
function snapshotOf(name) {
  try {
    return execFileSync("git", ["show", `e82e704:thincoder-core/tool-docs/${name}.md`], { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] })
  } catch (error) {
    assert.fail(`baseline e82e704:thincoder-core/tool-docs/${name}.md is not in the local object store (shallow clone / exported tree?) — the batch-start snapshot is the mandated comparison basis: ${String(error.message).slice(0, 200)}`)
  }
}

async function waitFor(predicate, { timeoutMs = 30_000, stepMs = 50 } = {}) {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    const hit = predicate()
    if (hit) return hit
    await new Promise((resolve) => setTimeout(resolve, stepMs))
  }
  throw new Error("waitFor: condition not met before the deadline")
}

test("CLI 50-4 极简档看不到展开面、get 取回同一份正文、完整档等于改造前全文、极简会话里的 consult 取完整档", { timeout: 180_000 }, async (t) => {
  const root = makeProject("50-4")
  const store = mkdtempSync(join(tmpdir(), "tool-desc-store-"))
  _setSessionsDirForTest(store)
  // 真 CLI 命令要落会话槽：槽存在，`/minimal` 才切换得动（第 1 发的先例同法）。
  const endpoint = await fakeAnthropic({ callsAt: { 2: [{ id: "k_get", name: "knowledge", input: { action: "get", topic: "tool-bash" } }] } })
  t.after(async () => {
    _resetSessionsDirForTest()
    await endpoint.close()
    removeTempDirBestEffort(root)
    removeTempDirBestEffort(store)
  })

  const before = snapshotOf("bash")
  const expandedBody = loadKnowledgeTopic("tool-bash", { promptOnly: true })
  const minimalBash = expandToolDescription(loadToolDoc("bash"), "minimal")

  // ── ① 完整会话（起始档）：工具描述等于改造前全文 ──────────────────────────────
  const agent = await agentOf(root, endpoint.port, { mode: "normal" })
  agent._slot = 1
  saveSlotData(root, 1, newSlotData(root))
  const ctx = { agent, pushLine() {}, pushLabel() {} }
  // 每次跑只采本次新发的请求（不按下标取位）：多发一发重试也不会把断言打到别的请求体上。
  const runAndCollect = async (input, callbacks = {}) => {
    const from = endpoint.requests.length
    await runAgent(agent, input, callbacks, {})
    const fresh = endpoint.requests.slice(from).map((r) => r.body)
    assert.ok(fresh.length > 0, "每次 runAgent 至少发一发请求")
    return fresh
  }
  const firstRun = await runAndCollect("What does the bash tool do?")
  assert.equal(descriptionOf(firstRun.at(-1), "bash"), before, "起始完整档的 bash 描述逐字等于批起快照全文")
  assert.equal(descriptionOf(firstRun.at(-1), "bash"), expandToolDescription(loadToolDoc("bash"), "normal"), "完整档装配 = normal 档")
  const fullToolCount = toolsOf(firstRun.at(-1)).length

  // ── ② 真 CLI 命令切到极简档：下一轮只发常驻面 ─────────────────────────────────
  await handleMinimalCommand(ctx)
  assert.equal(agent.config.agent.mode, "minimal", "命令把会话档位落到 minimal")
  const minimalRun = await runAndCollect("And in minimal mode?")
  const minimalBody = minimalRun[0]
  assert.equal(descriptionOf(minimalBody, "bash"), minimalBash, "极简档 = 母版去锚后的目标文本")
  assert.ok(!descriptionOf(minimalBody, "bash").includes("Output format:"), "极简档里看不到展开面正文（输出块）")
  assert.ok(!descriptionOf(minimalBody, "bash").includes("There is NO TTY"), "极简档里看不到展开面正文（TTY 背景）")
  assert.ok(!JSON.stringify(toolsOf(minimalBody)).includes("{{knowledge:"), "工具面里不得残留锚字面")
  assert.ok(descriptionOf(minimalBody, "bash").includes("**Route to a dedicated tool instead of bash:**"), "常驻面（路由）仍在——不是把描述删空")
  assert.equal(toolsOf(minimalBody).length, fullToolCount, "切档不裁工具：两档工具数量相同")
  const keySets = (body) => toolsOf(body).map((tool) => `${tool.name}:${Object.keys(tool.input_schema?.properties ?? {}).sort().join(",")}`)
  assert.deepEqual(keySets(minimalBody), keySets(firstRun.at(-1)), "schema 键集不因档位缩水")
  assert.ok(toolsOf(minimalBody).some((tool) => tool.name === "knowledge"), "极简档仍提供 knowledge 入口")

  // ── ③ 同一份正文经 knowledge get 取回，逐字与展开面相等 ───────────────────────
  const received = await waitFor(() => {
    const hit = endpoint.requests.map((r) => toolResultsOf(r.body)).find((texts) => texts.includes(expandedBody))
    return hit ?? null
  })
  assert.ok(received.includes(expandedBody), "`knowledge get tool-bash` 返回的正文 = 展开面原文（逐字）")
  assert.ok(expandedBody.includes("Output format:"), "取回的正文就是极简档删掉的那一段")
  assert.ok(!expandedBody.includes("{{knowledge:"), "展开面正文自身不含锚")

  // ── ④ 命令切回完整档：下一轮又是改造前全文 ───────────────────────────────────
  await handleNormalCommand(ctx)
  assert.equal(agent.config.agent.mode, "normal", "命令把会话档位切回 normal")
  const backRun = await runAndCollect("Back to normal?")
  assert.equal(descriptionOf(backRun.at(-1), "bash"), before, "换档后的下一轮用新档，逐字回到改造前全文")

  // ── ⑤ 极简会话内起一次 consult 子代理：它的工具描述取完整档 ─────────────────────
  const consultEndpoint = await fakeAnthropic({ calls: [{ id: "consult", name: "consult_start", input: { problem: "Does the consult base carry full tool descriptions?" } }] })
  t.after(() => consultEndpoint.close())
  const parent = await agentOf(root, consultEndpoint.port, { mode: "minimal", consultModels: [{ provider: "fake-anthropic", model: MODEL }] })
  // `consult_start` 是副作用工具，走审批门：这里给的是真端侧那条通道（测试里恒许）。
  await runAgent(parent, "Consult a second opinion about tool descriptions.", { onPermissionRequest: async () => true }, {})
  const consultBody = await waitFor(() => consultEndpoint.requests.map((r) => r.body).find((body) => String(body?.system ?? "").includes(CONSULT_MARK)) ?? null)
  const consultDoc = descriptionOf(consultBody, CONSULT_TOOL)
  assert.equal(consultDoc, snapshotOf(CONSULT_TOOL), "极简会话里的 consult 取完整档，不随会话档位变化")
  assert.ok(consultDoc.includes("A batch record is out of the judged set"), "consult 拿得到展开面")
  const parentDoc = descriptionOf(consultEndpoint.requests[0].body, CONSULT_TOOL)
  assert.equal(parentDoc, expandToolDescription(loadToolDoc(CONSULT_TOOL), "minimal"), "同一会话的主链仍是极简档——两处不同档才成立")
  assert.ok(!parentDoc.includes("A batch record is out of the judged set"), "主链看不到展开面")
  assert.ok(toolsOf(consultBody).length > 0, "consult 的工具面非空（只换描述档，不裁工具）")
})
