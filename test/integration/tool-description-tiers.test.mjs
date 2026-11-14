/**
 * CLI 50-4 — 三档工具描述：极简档只发常驻面，展开面经 `knowledge get` 取回，完整档由常驻面与展开面在锚处拼成。
 * CLI 50-5 — 写门参数面：两键仍在、`required` 不变、说明只剩身份句、完整口径只在工程纪律段出现一处。
 * 进入口 = 真 CLI 命令（`/tiny` ∥ `/normal` ∥ `/eng` 的命令处理函数）+ 本地脚本化 Anthropic 端点；
 * 档位由命令落槽再掀下一轮，不由测试直接写 config。无外网、无付费端点。
 * 跑法（仓根）：node --test test/integration/tool-description-tiers.test.mjs
 *
 * 对照基准 = 文件本身（设计 PROMPT-SYSTEM §2）：完整档判「常驻面与展开面在锚处拼合、展开面正文逐字等于主题全文」，
 * 不与批起快照的旧文比对——常驻面已按一句用途重写，完整档与拆分前语义等价即可。
 */
import { test } from "node:test"
import assert from "node:assert/strict"
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { removeTempDirBestEffort } from "../teardown.mjs"

import { createAgent, runAgent } from "../../thincoder-core/agent.mjs"
import { assembleBuiltinTools } from "../../thincoder-core/tools/index.mjs"
import { expandToolDescription } from "../../thincoder-core/tools/shared.mjs"
import { LEDGER_PARAM_DESC, PROJECT_PARAM_DESC } from "../../thincoder-core/tools/write-gate-params.mjs"
import { loadKnowledgeTopic, loadToolDoc } from "../../thincoder-core/prompt-files.mjs"
import { _setSessionsDirForTest, _resetSessionsDirForTest } from "../../thincoder-core/session-slots.mjs"
import { newSlotData, saveSlotData } from "../../thincoder-core/session-slot-write.mjs"
import { handleEngCommand, handleTinyCommand, handleNormalCommand } from "../../thincoder-cli/src/tui/cmd-eng.mjs"
import { fakeAnthropic } from "./fixtures/anthropic-endpoint.mjs"

const MODEL = "claude-fake-1"
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..")
const CONSULT_MARK = "independent expert consultants"
/** 极简会话里的 consult 工具面自有一套（无 bash）；取它真带、且本批被拆过的那一档来比。 */
const CONSULT_TOOL = "doc_check"
/** 写门十一把入口工具（`thincoder-core/agent/write-gate-ledger.mjs` 的 `LEDGER_ENTRY_TOOLS`）与其 `required` 现文。 */
const WRITE_GATE_TOOLS = {
  write: ["path", "content"],
  edit: [],
  insert_after: ["path", "content"],
  apply_patch: ["patch"],
  delete: ["path"],
  hashline_edit: ["path", "old_hashes", "new_content"],
  file_ops: ["action", "source", "dest"],
  bash: ["command"],
  execute: [],
  memory: ["action"],
  ssh: ["action"],
}
/** `ssh` 的写门只按 action 判（只有 `get` 落盘）⇒ 它不带 `project` 键：十一把都带 `ledger`，带本地定位参数的十把带 `project`。 */
const PROJECT_KEY_TOOLS = Object.keys(WRITE_GATE_TOOLS).filter((name) => name !== "ssh")
const WRITE_GATE_SECTION = "## Write-gate parameters (`ledger` ∥ `project`)"
const WRITE_GATE_REFUSAL = "a missing key is refused, never defaulted"

function makeProject(tag) {
  const root = mkdtempSync(join(tmpdir(), `tool-desc-${tag}-`))
  writeFileSync(join(root, "PROJECT-MANIFEST.json"), JSON.stringify({ version: 1, phase: "initial-dev", docRoot: { design: "docs/design", batches: "docs/batches" } }))
  mkdirSync(join(root, "docs/design"), { recursive: true })
  mkdirSync(join(root, "docs/batches"), { recursive: true })
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

function schemaOf(body, name) {
  const found = toolsOf(body).find((t) => t.name === name)
  assert.ok(found, `请求体里必须有 ${name} 这一档工具`)
  return found.input_schema
}

/** Every tool_result text a request's history carried — what the model really received. */
function toolResultsOf(body) {
  return (body?.messages ?? []).flatMap((m) => (Array.isArray(m?.content) ? m.content : []))
    .filter((block) => block?.type === "tool_result")
    .map((block) => String(block.content))
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

/** 每次跑只采本次新发的请求（不按下标取位）：多发一发重试也不会把断言打到别的请求体上。 */
function collector(endpoint) {
  return async (agent, input, callbacks = {}) => {
    const from = endpoint.requests.length
    await runAgent(agent, input, callbacks, {})
    const fresh = endpoint.requests.slice(from).map((r) => r.body)
    assert.ok(fresh.length > 0, "每次 runAgent 至少发一发请求")
    return fresh
  }
}

test("CLI 50-4 极简档看不到展开面、get 取回同一份正文、完整档由常驻面与展开面拼成、极简会话里的 consult 取完整档", { timeout: 180_000 }, async (t) => {
  const root = makeProject("50-4")
  const store = mkdtempSync(join(tmpdir(), "tool-desc-store-"))
  _setSessionsDirForTest(store)
  // 真 CLI 命令要落会话槽：槽存在，`/tiny` 才切换得动（第 1 发的先例同法）。
  const endpoint = await fakeAnthropic({ callsAt: { 2: [{ id: "k_get", name: "knowledge", input: { action: "get", topic: "tool-bash" } }] } })
  t.after(async () => {
    _resetSessionsDirForTest()
    await endpoint.close()
    removeTempDirBestEffort(root)
    removeTempDirBestEffort(store)
  })

  const master = loadToolDoc("bash")
  const expandedBody = loadKnowledgeTopic("tool-bash", { promptOnly: true })
  const tinyBash = expandToolDescription(master, "tiny")
  const fullBash = expandToolDescription(master, "normal")

  // ── 判据 ③ 的结构面（文件本身）：锚处拼合，展开面逐字等于主题全文 ─────────────────
  // 展开面正文里带 `$\`` 一类的 `$` 序列：替接一律走函数形，否则 String.replace 会把它当替换模式展成原文（假的拼合）。
  assert.equal(fullBash, master.replace("{{knowledge:tool-bash}}", () => expandedBody), "完整档 = 母版在锚处填入展开面正文")
  assert.ok(expandedBody.includes("Output format:"), "展开面正文带输出块（常驻面删掉的正是这一段）")
  assert.ok(expandedBody.includes("There is NO TTY"), "展开面正文带 TTY 背景")
  assert.ok(!expandedBody.includes("{{knowledge:"), "展开面正文自身不含锚")

  // ── ① 完整会话（起始档）：描述由常驻面与展开面拼成 ────────────────────────────
  const agent = await agentOf(root, endpoint.port, { mode: "normal" })
  agent._slot = 1
  saveSlotData(root, 1, newSlotData(root))
  const ctx = { agent, pushLine() {}, pushLabel() {} }
  const runAndCollect = collector(endpoint)

  const firstRun = await runAndCollect(agent, "What does the bash tool do?")
  const fullBody = firstRun.at(-1)
  assert.equal(descriptionOf(fullBody, "bash"), fullBash, "完整档的 bash 描述 = 常驻面与展开面在锚处拼成的整份描述")
  const fullToolCount = toolsOf(fullBody).length

  // ── ② 真 CLI 命令切到极简档：下一轮只发常驻面 ─────────────────────────────────
  await handleTinyCommand(ctx)
  assert.equal(agent.config.agent.mode, "tiny", "命令把会话档位落到 tiny")
  const tinyRun = await runAndCollect(agent, "And in tiny mode?")
  const tinyBody = tinyRun[0]
  assert.equal(descriptionOf(tinyBody, "bash"), tinyBash, "极简档 = 母版去锚后的目标文本")
  assert.ok(descriptionOf(tinyBody, "bash").includes("Execute a shell command and return stdout+stderr."), "常驻面（一句用途）仍在——不是把描述删空")
  assert.ok(!descriptionOf(tinyBody, "bash").includes("Output format:"), "极简档里看不到展开面正文（输出块）")
  assert.ok(!descriptionOf(tinyBody, "bash").includes("There is NO TTY"), "极简档里看不到展开面正文（TTY 背景）")
  assert.ok(!JSON.stringify(toolsOf(tinyBody)).includes("{{knowledge:"), "工具面里不得残留锚字面")
  assert.equal(toolsOf(tinyBody).length, fullToolCount, "切档不裁工具：两档工具数量相同")
  const keySets = (body) => toolsOf(body).map((tool) => `${tool.name}:${Object.keys(tool.input_schema?.properties ?? {}).sort().join(",")}`)
  assert.deepEqual(keySets(tinyBody), keySets(fullBody), "schema 键集不因档位缩水")
  assert.ok(toolsOf(tinyBody).some((tool) => tool.name === "knowledge"), "极简档仍提供 knowledge 入口")

  // ── 判据 ⑥：两档每份工具的 input_schema 逐字相等（含 `action` 枚举取值）────────────
  const fullSchemas = new Map(toolsOf(fullBody).map((tool) => [tool.name, tool.input_schema]))
  for (const tool of toolsOf(tinyBody)) {
    assert.deepEqual(tool.input_schema, fullSchemas.get(tool.name), `${tool.name} 的 input_schema 两档逐字相等（能力面不因档位回退）`)
  }

  // ── ③ 同一份正文经 knowledge get 取回，逐字与展开面相等 ───────────────────────
  const received = await waitFor(() => {
    const hit = endpoint.requests.map((r) => toolResultsOf(r.body)).find((texts) => texts.includes(expandedBody))
    return hit ?? null
  })
  assert.ok(received.includes(expandedBody), "`knowledge get tool-bash` 返回的正文 = 展开面原文（逐字）")

  // ── ④ 命令切回完整档：下一轮又是常驻面与展开面的拼合 ───────────────────────────
  await handleNormalCommand(ctx)
  assert.equal(agent.config.agent.mode, "normal", "命令把会话档位切回 normal")
  const backRun = await runAndCollect(agent, "Back to normal?")
  assert.equal(descriptionOf(backRun.at(-1), "bash"), fullBash, "换档后的下一轮用新档，回到完整档拼合")

  // ── ⑤ 极简会话内起一次 consult 子代理：它的工具描述取完整档 ─────────────────────
  const consultEndpoint = await fakeAnthropic({ calls: [{ id: "consult", name: "consult_start", input: { problem: "Does the consult base carry full tool descriptions?" } }] })
  t.after(() => consultEndpoint.close())
  const parent = await agentOf(root, consultEndpoint.port, { mode: "tiny", consultModels: [{ provider: "fake-anthropic", model: MODEL }] })
  // `consult_start` 是副作用工具，走审批门：这里给的是真端侧那条通道（测试里恒许）。
  await runAgent(parent, "Consult a second opinion about tool descriptions.", { onPermissionRequest: async () => true }, {})
  const consultBody = await waitFor(() => consultEndpoint.requests.map((r) => r.body).find((body) => String(body?.system ?? "").includes(CONSULT_MARK)) ?? null)
  const consultDoc = descriptionOf(consultBody, CONSULT_TOOL)
  assert.equal(consultDoc, expandToolDescription(loadToolDoc(CONSULT_TOOL), "normal"), "极简会话里的 consult 取完整档，不随会话档位变化")
  assert.ok(consultDoc.includes("A batch record is out of the judged set"), "consult 拿得到展开面")
  const parentDoc = descriptionOf(consultEndpoint.requests[0].body, CONSULT_TOOL)
  assert.equal(parentDoc, expandToolDescription(loadToolDoc(CONSULT_TOOL), "tiny"), "同一会话的主链仍是极简档——两处不同档才成立")
  assert.ok(!parentDoc.includes("A batch record is out of the judged set"), "主链看不到展开面")
  assert.ok(toolsOf(consultBody).length > 0, "consult 的工具面非空（只换描述档，不裁工具）")
})

test("CLI 50-5 写门参数面：两键仍在、说明只剩一行身份句、完整口径只在工程纪律段出现一处", { timeout: 120_000 }, async (t) => {
  const root = makeProject("50-5")
  const store = mkdtempSync(join(tmpdir(), "tool-desc-store-"))
  _setSessionsDirForTest(store)
  const endpoint = await fakeAnthropic()
  t.after(async () => {
    _resetSessionsDirForTest()
    await endpoint.close()
    removeTempDirBestEffort(root)
    removeTempDirBestEffort(store)
  })

  const runAndCollect = collector(endpoint)
  const agent = await agentOf(root, endpoint.port, { mode: "normal" })
  agent._slot = 1
  saveSlotData(root, 1, newSlotData(root))
  const ctx = { agent, pushLine() {}, pushLabel() {} }

  // 真 CLI 命令落槽：`/eng` 从 normal 进工程档（进入门 = 项目可解析，makeProject 已备 manifest）。
  await handleEngCommand(ctx)
  assert.equal(agent.config.agent.mode, "engineering", "命令把会话档位落到 engineering")
  const body = (await runAndCollect(agent, "Which keys does the write gate need?"))[0]

  // ── 两键仍在、`required` 逐字不变 ──────────────────────────────────────────────
  for (const [name, required] of Object.entries(WRITE_GATE_TOOLS)) {
    const schema = schemaOf(body, name)
    const props = schema?.properties ?? {}
    assert.ok("ledger" in props, `${name} 仍带 ledger 键`)
    assert.deepEqual(schema.required, required, `${name} 的 required 逐字不变`)
    assert.equal(props.ledger.description === LEDGER_PARAM_DESC || props.ledger.description.startsWith(LEDGER_PARAM_DESC + "；"), true,
      `${name} 的 ledger 说明 = 身份句（+ 本工具差异一句）`)
  }
  for (const name of PROJECT_KEY_TOOLS) {
    assert.ok("project" in schemaOf(body, name).properties, `${name} 仍带 project 键`)
    assert.equal(schemaOf(body, name).properties.project.description, PROJECT_PARAM_DESC, `${name} 的 project 说明 = 身份句`)
  }
  // `ssh` 只对 `get` 要号，schema 里不带 `project`——它不是缺键，是写门按 action 判（设计 TOOLS §1.2）。
  assert.equal("project" in schemaOf(body, "ssh").properties, false, "ssh 不带 project 键（写门只按 get 判）")

  // ── 身份句里不再带口径：完整口径（哪档生效 ∥ 哪些工具必带 ∥ 缺什么被拒）只在工程纪律段 ──────
  for (const name of Object.keys(WRITE_GATE_TOOLS)) {
    const props = schemaOf(body, name).properties
    for (const key of ["ledger", "project"]) {
      const description = props[key]?.description ?? ""
      assert.ok(!description.includes("eleven entry tools"), `${name}.${key} 不重述入口工具集`)
      assert.ok(!description.includes(WRITE_GATE_REFUSAL), `${name}.${key} 不重述被拒口径`)
    }
  }
  const system = String(body?.system ?? "")
  const occurrences = (haystack, needle) => haystack.split(needle).length - 1
  assert.equal(occurrences(system, WRITE_GATE_SECTION), 1, "工程纪律段里写门参数一节只出现一处")
  assert.ok(system.includes("eleven entry tools"), "工程纪律段讲十一把入口工具")
  assert.ok(system.includes(WRITE_GATE_REFUSAL), "工程纪律段讲缺什么怎么被拒")
  for (const name of Object.keys(WRITE_GATE_TOOLS)) {
    assert.ok(!descriptionOf(body, name).includes(WRITE_GATE_REFUSAL), `${name} 的工具描述不重述写门口径`)
  }

  // ── 写门十一把的 schema 不因档位或模式改写：normal 与 engineering 两档请求体里逐字相等 ──────
  //    只判写门入口集——`subagent` 的 role 枚举本来就按模式 advertise（工程档挂 eng-coder /
  //    eng-designer），那是另一条既有设计面，不是「档位改 schema」。
  await handleNormalCommand(ctx)
  assert.equal(agent.config.agent.mode, "normal", "命令把会话档位切回 normal")
  const normalBody = (await runAndCollect(agent, "And in normal mode?"))[0]
  for (const name of Object.keys(WRITE_GATE_TOOLS)) {
    const normalSchema = schemaOf(normalBody, name)
    const engineeringSchema = schemaOf(body, name)
    assert.deepEqual(normalSchema, engineeringSchema, `${name} 的 input_schema 不因档位改写`)
  }
})
