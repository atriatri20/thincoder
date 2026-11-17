/**
 * tool-role-fitting.test.mjs — 集成用例 49-1 ∥ 49-2 ∥ 49-3（RTM CLI 端故事 49「子代理只拿得到角色允许的
 * 工具动作」）。判据原文 = `test/rtm/tooling.md` 故事 49 三行；机制单源 = `docs/core/design/TOOLS.md`
 * §6.29（B3–B8）；批次回指 = `docs/batches/2026-11-10-p1-1-tool-role-fitting.md` §2。
 *
 * **进入口 = 父侧工具面**：49-1 经真 `subagent` 派单（`executeToolCalls` 的真门 + 真装配，本地脚本化假
 * Anthropic 端点派工具调用，子代理真跑并回报告）；49-3 的勘察预算经**设计席自己的** `subagent` 变体
 * 逐次派单（同一个门）。断言只落业务可观察结果：子代理实际收到的 schema、工具回执、拒句原文、
 * 以及「原 execute 一次都没跑」。
 *
 * 本档证不了什么：模型面对描述文字的「读起来像不像」由评审人工判；本档只钉
 * ① 子代理请求体里的 schema ② 直接 execute 的拒句与零副作用 ③ 计数与窗口的边界读数。
 *
 * 复跑（cwd = 仓根）：`node --test test/integration/tool-role-fitting.test.mjs`
 */
import { test, after } from "node:test"
import assert from "node:assert/strict"
import { execFileSync } from "node:child_process"
import { existsSync, mkdirSync, mkdtempSync, writeFileSync } from "node:fs"
import { join, resolve } from "node:path"
import { dirname } from "node:path"
import { fileURLToPath } from "node:url"
import { removeTempDirBestEffort } from "../teardown.mjs"

import { createAgent } from "../../thincoder-core/agent.mjs"
import { executeToolCalls } from "../../thincoder-core/agent/dispatch.mjs"
import { subagentTool } from "../../thincoder-core/agent-tools/subagent.mjs"
import { batchTool } from "../../thincoder-core/agent-tools/batch.mjs"
import { assembleBuiltinTools } from "../../thincoder-core/tools/index.mjs"
import { assembleFamilyTools } from "../../thincoder-core/agent/family-tools.mjs"
import { buildSpawnChild } from "../../thincoder-core/agent-tools/subagent-spawn.mjs"
import { READONLY_VARIANT_DOCS, deriveReadonlyTools, makeReadonlyToolVariant, readonlyToolNames } from "../../thincoder-core/agent/helpers.mjs"
import { readonlyActionTest } from "../../thincoder-core/agent/dispatch-gates.mjs"
import { docGraphReadTool, docGraphTool } from "../../thincoder-core/agent-tools/doc-graph.mjs"
import { fakeAnthropic } from "./fixtures/anthropic-endpoint.mjs"

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..")
const SCRATCH = join(ROOT, ".thincoder/tmp")
mkdirSync(SCRATCH, { recursive: true })
const { _setLedgerDirForTest, _resetLedgerDirForTest, ledgerKey } = await import("../../thincoder-core/ledger.mjs")
const ledgerDir = mkdtempSync(join(SCRATCH, "49-ledger-"))
_setLedgerDirForTest(ledgerDir)
const fixtures = []
after(() => {
  _resetLedgerDirForTest()
  for (const p of fixtures) removeTempDirBestEffort(p)
  removeTempDirBestEffort(ledgerDir)
})

const MODEL = "claude-fake-1"
const PERSONA_EXPLORE = "Role: read-only scout"

/** 夹具项目：manifest + 批档目录 + 一个真 git 仓（一条提交，供 `git log` 有真读数）。 */
function makeProject(tag) {
  const root = mkdtempSync(join(SCRATCH, `trf-${tag}-`))
  fixtures.push(root)
  mkdirSync(join(root, "docs/batches"), { recursive: true })
  writeFileSync(join(root, "PROJECT-MANIFEST.json"), JSON.stringify({ version: 1, docRoot: { batches: "docs/batches" } }, null, 2))
  const git = (...args) => execFileSync("git", args, { cwd: root, stdio: "pipe" })
  git("init")
  git("config", "user.email", "rtm@example.test")
  git("config", "user.name", "rtm fixture")
  git("config", "commit.gpgsign", "false")
  writeFileSync(join(root, "README.md"), "fixture\n")
  git("add", "README.md")
  git("commit", "-m", "fixture commit 49")
  return root
}

const providerOf = (port) => ({ name: "fake-anthropic", baseURL: `http://127.0.0.1:${port}/v1`, format: "anthropic", apiKey: "test-key", model: MODEL })

async function parentOf(root, port) {
  const tools = await assembleBuiltinTools({ memory: null, cwd: root, model: MODEL })
  const provider = providerOf(port)
  const parent = createAgent({
    provider, tools,
    config: { agent: { engineering: true }, providersList: [provider], defaultModel: `fake-anthropic:${MODEL}` },
    cwd: root, memory: null, role: null, autoApprove: true,
  })
  parent._subAgentCounter = 0
  return parent
}

const exploreBrief = () => ({
  role: "explore",
  goal: "Read the state and report it.",
  knownFacts: "Nothing yet.",
  scope: "Read-only: do not change any file.",
  acceptance: "The report carries each tool's own output.",
  reportFormat: "One line per tool.",
  async: false,
})

/** 真派单一发，返回 { endpoint, res, report }。 */
async function spawnExplore({ root, calls, batchDoc = null }) {
  const endpoint = await fakeAnthropic({ calls })
  const parent = await parentOf(root, endpoint.port)
  const ctx = { depth: 0, agent: parent, callbacks: {}, signal: null, onPermissionRequest: async () => true }
  const args = { ...exploreBrief() }
  if (batchDoc) args.batchDoc = batchDoc
  const [res] = await executeToolCalls(parent, new Map([["subagent", subagentTool]]), [{ name: "subagent", id: "call_1", arguments: JSON.stringify(args) }], ctx, 0)
  const body = endpoint.requests.find((r) => String(r.body?.system ?? "").includes(PERSONA_EXPLORE))?.body
  return { endpoint, res, report: String(res.result ?? ""), body }
}

const schemaOf = (body, name) => {
  const tool = (body?.tools ?? []).find((t) => (t.name ?? t?.function?.name) === name)
  return tool?.input_schema ?? tool?.function?.parameters ?? null
}

test("CLI 49-1 只读角色的四个族拿到只读动作（真跑成功）、写动作与写参数不在面内、直接 execute 仍拒且原 execute 零运行；tester 不顺扩", { timeout: 180_000 }, async (t) => {
  const root = makeProject("49-1")
  const run = await spawnExplore({
    root,
    calls: [
      { id: "tu_git", name: "git", input: { action: "log", count: 1, oneline: true } },
      { id: "tu_settings", name: "settings", input: { action: "list" } },
      { id: "tu_process", name: "process", input: {} },
    ],
  })
  t.after(() => run.endpoint.close())
  assert.equal(run.res.ok, true, `派 explore 必须受理，实得：${run.report.slice(0, 400)}`)
  assert.ok(run.body, "没抓到子代理请求体——取不到它实际拿到的工具表")

  // ① 只读动作真的可用：报告里是三个工具自己的读数
  assert.ok(run.report.includes("fixture commit 49"), `git log 须返回真提交（只读 git 能力回来了）：${run.report.slice(0, 400)}`)
  assert.ok(run.report.includes("agent.engineering"), `settings list 须返回读数：${run.report.slice(0, 500)}`)
  assert.ok(run.report.includes("PID"), `process list 须返回读数（缺省 action = list）：${run.report.slice(0, 400)}`)

  // ② schema 面：只读动作在、写动作与写参数不在
  const git = schemaOf(run.body, "git")
  const memory = schemaOf(run.body, "memory")
  const settings = schemaOf(run.body, "settings")
  const process = schemaOf(run.body, "process")
  for (const [label, schema] of [["git", git], ["memory", memory], ["settings", settings], ["process", process]]) {
    assert.ok(schema, `子代理工具表须含 ${label}`)
  }
  assert.deepEqual(memory.properties.action.enum, ["search", "list"], "memory 只读面只剩两个读动作")
  assert.deepEqual(settings.properties.action.enum, ["list", "get"], "settings 只读面只剩两个读动作")
  assert.deepEqual(process.properties.action.enum, ["list"], "process 只读面只剩 list")
  assert.ok(git.properties.action.enum.includes("log") && git.properties.action.enum.includes("show") && git.properties.action.enum.includes("diff"), `git 只读面须含 log/show/diff：${JSON.stringify(git.properties.action.enum)}`)
  for (const write of ["commit", "push", "reset", "add"]) assert.ok(!git.properties.action.enum.includes(write), `git 只读面不得含 ${write}`)
  const gitProps = Object.keys(git.properties)
  for (const writeOnly of ["message", "name", "tags", "mode", "dest", "remoteUrl"]) assert.ok(!gitProps.includes(writeOnly), `git 只读面不得带写专用参数 ${writeOnly}：${gitProps.join(",")}`)
  for (const writeOnly of ["title", "content", "id", "confirm"]) assert.ok(!Object.keys(memory.properties).includes(writeOnly), `memory 只读面不得带写专用参数 ${writeOnly}`)
  for (const writeOnly of ["pid", "id"]) assert.ok(!Object.keys(process.properties).includes(writeOnly), `process 只读面不得带写专用参数 ${writeOnly}`)

  // ③ 直接 execute 写动作：在原 execute 之前拒，且原 execute 一次都没跑（零副作用）
  const builtins = await assembleBuiltinTools({ memory: null, cwd: root, model: MODEL })
  const ran = []
  const spyVariant = (name) => {
    const original = builtins.find((x) => x.name === name)
    const spied = { ...original, execute: (...a) => { ran.push(name); return original.execute(...a) } }
    const reg = READONLY_VARIANT_DOCS[name]
    return makeReadonlyToolVariant(spied, { docName: reg.doc, writeOnly: reg.writeOnly, isReadonly: readonlyActionTest })
  }
  const cases = [
    ["git", { action: "commit", message: "should never run" }],
    ["memory", { action: "put", title: "x", content: "y" }],
    ["settings", { action: "set", key: "agent.maxTurns", value: 1 }],
    ["process", { action: "kill", pid: 999999 }],
  ]
  for (const [name, args] of cases) {
    const variant = spyVariant(name)
    await assert.rejects(() => variant.execute(args, { agent: { cwd: root, config: { agent: {} } } }), (e) => {
      assert.ok(e.message.includes(JSON.stringify(args.action)), `${name}：拒句须点名动作，实得 ${e.message}`)
      assert.ok(/read-only role/.test(e.message), `${name}：拒句须说清是只读面，实得 ${e.message}`)
      return true
    })
  }
  assert.deepEqual(ran, [], `写动作一次都不得进原 execute（零文件 / 零台账 / 零网络写），实得：${ran.join(",")}`)
  // git 的零副作用另有独立读数：仓里仍只有那一条提交
  assert.equal(execFileSync("git", ["rev-list", "--count", "HEAD"], { cwd: root, encoding: "utf8" }).trim(), "1")

  // ④ tester 不顺扩：整把只读集里没有 git，只读变体里才有
  assert.ok(!readonlyToolNames(builtins).has("git"), "整把只读集不含 git（tester 面维持原状）")
  assert.ok(deriveReadonlyTools(builtins, readonlyActionTest).some((x) => x.name === "git"), "只读变体面含 git（explore/plan/consult 面）")
})

test("CLI 49-2 未建图仓的只读查询返回可区分空态、不要求父代；scan 与写参数不在只读面；读取失败不伪装空图", { timeout: 180_000 }, async (t) => {
  const root = makeProject("49-2")
  // 只读面：三个查询动作、无 scope
  assert.deepEqual(docGraphReadTool.parameters.properties.action.enum, ["forward", "reverse", "chain"])
  assert.ok(!Object.hasOwn(docGraphReadTool.parameters.properties, "scope"), "只读面不出现只有 scan 消费的 scope")
  assert.deepEqual(docGraphTool.parameters.properties.action.enum, ["scan", "forward", "reverse", "chain"], "depth-0 面仍四动作（含 scan）")
  for (const text of [docGraphReadTool.description, docGraphReadTool.parameters.properties.action.description]) {
    assert.ok(!text.includes("ask the parent"), "只读面不得把父代往返写进描述")
    assert.ok(!text.includes("collects the edges into the ledger database"), "只读面不得描述 scan 这个动作用什么用")
  }

  // ⑧ 子代理真拿到的面与上面同一份（经真派单读请求体）
  const run = await spawnExplore({ root, calls: [{ id: "tu_graph", name: "doc_graph", input: { action: "forward", target: root, node: "req:F16" } }] })
  t.after(() => run.endpoint.close())
  assert.equal(run.res.ok, true, `派 explore 必须受理：${run.report.slice(0, 300)}`)
  const graph = schemaOf(run.body, "doc_graph")
  assert.deepEqual(graph.properties.action.enum, ["forward", "reverse", "chain"], "子代理面只三值")
  assert.ok(!Object.hasOwn(graph.properties, "scope"), "子代理面不带 scope")
  // ① 未建图 ⇒ 可区分空态，且子代理不必上抛（报告里就是那句空态）
  const EMPTY = "doc_graph: graph not built yet (read-only empty state) — no edges are asserted because this repository has not been scanned. Retry after the existing scan entry updates the graph."
  assert.ok(run.report.includes(EMPTY), `未建图须回可区分空态：${run.report.slice(0, 600)}`)
  // ④ 直接 scan 仍拒（动作不在面内），拒句点名取值集
  await assert.rejects(() => docGraphReadTool.execute({ action: "scan", target: root }, { agent: { cwd: root } }), (e) => {
    assert.ok(e.message.includes("forward, reverse, chain"), `拒句须给出可用取值集：${e.message}`)
    return true
  })
  // ⑤ 读取失败不变成空图：库文件坏档 ⇒ 读失败原样抛
  const dbPath = join(ledgerDir, `${ledgerKey(root)}.db`)
  writeFileSync(dbPath, "not a sqlite database at all")
  await assert.rejects(() => docGraphReadTool.execute({ action: "forward", target: root, node: "req:F16" }, { agent: { cwd: root } }), (e) => {
    assert.ok(!e.message.includes("graph not built yet"), `读失败不得伪装未建图：${e.message}`)
    assert.match(e.message, /读不到/)
    return true
  })
})

test("CLI 49-3 设计席第七次勘察拒且跨 fix 累计；eng 两角色的父历史只读本批窗口、limit 必传有上限、无 path；未绑定角色无历史工具", { timeout: 240_000 }, async (t) => {
  const root = makeProject("49-3")
  const endpoint = await fakeAnthropic({ calls: [] })
  t.after(() => endpoint.close())
  const parent = await parentOf(root, endpoint.port)
  const ctx = { depth: 0, agent: parent, callbacks: {}, signal: null, onPermissionRequest: async () => true }

  // 建批走真入口（B8：窗口起点在建批成功时记录）
  const batchDoc = join(root, "docs/batches/49-3.md")
  const created = await batchTool(null).execute({ action: "create", path: batchDoc, topic: "49-3", source: "集成夹具" }, { depth: 0, agent: parent })
  assert.match(String(created), /created /, `建批须成功：${created}`)
  const start = parent._batchHistoryStart?.get(process.platform === "win32" ? batchDoc.toLowerCase() : batchDoc)
  assert.equal(typeof start, "number", "建批成功须在 depth-0 根 agent 上记下本批起点")

  // 父会话：起点之前一条、之后一条（窗口必须只放后一条）
  parent._fullHistory = [
    { role: "user", content: "before the batch — outside the window", ts: start - 60_000 },
    { role: "user", content: "after the batch — inside the window", ts: Date.now() },
  ]

  // 设计席一发（真装配：batchDoc 门 / 工具面 / extraTools）
  const built = buildSpawnChild(parent, ctx, { role: "eng-designer", async: false, batchDoc, round: "initial" }, "eng-designer", false, [], [], null)
  const designer = built.child

  // B8 ①：设计师拿到的是受限父历史（limit 必传、上限 50、无 path），且只读本批窗口
  const history = (built.childRunOpts.extraTools ?? []).find((x) => x.name === "read_history")
  assert.ok(history, "eng-designer 须挂受限 read_history")
  assert.deepEqual(history.parameters.required, ["limit"], "limit 必传（无默认）")
  assert.ok(!Object.hasOwn(history.parameters.properties, "path"), "受限面不出现 path")
  const window = await history.execute({ limit: 10 }, { agent: designer })
  assert.ok(String(window).includes("after the batch — inside the window"), `窗口内的父消息须读得到：${String(window).slice(0, 300)}`)
  assert.ok(!String(window).includes("before the batch — outside the window"), "起点之前的父消息不得进窗口")
  await assert.rejects(async () => history.execute({ keyword: "x" }, { agent: designer }), /limit is required/)
  await assert.rejects(async () => history.execute({ limit: 51 }, { agent: designer }), /exceeds the cap of 50/)
  await assert.rejects(async () => history.execute({ limit: 5, path: "all" }, { agent: designer }), /`path` is not available/)

  // B8 ②：未绑定角色没有历史工具（explore 的 extraTools 为空、工具表里也没有）——由**根**派 explore，
  // 不占设计席预算（预算只计设计席自己发起的勘察）
  const exploreSpawn = buildSpawnChild(parent, ctx, exploreBrief(), "explore", false, [], [], null)
  assert.ok(!(exploreSpawn.childRunOpts.extraTools ?? []).some((x) => x.name === "read_history"), "explore 不得挂父历史")
  const exploreFamily = await assembleFamilyTools({ depth: 1, role: "explore", engineering: true, consultModels: [], batchDoc: null })
  assert.ok(!exploreFamily.some((x) => x.name === "read_history"), "explore 家族段不得出现 read_history")

  // B7：设计席自己的 subagent 变体逐次派单——六次通过、第七次拒
  const designerSubagent = (await assembleFamilyTools({ depth: 1, role: "eng-designer", engineering: true, consultModels: [], batchDoc })).find((x) => x.name === "subagent")
  assert.ok(designerSubagent, "设计席须有受限 subagent 通道")
  const dctx = { depth: 1, agent: designer, callbacks: {}, signal: null, onPermissionRequest: async () => true }
  for (let i = 1; i <= 6; i++) {
    const out = await designerSubagent.execute({ action: "spawn", ...exploreBrief() }, dctx)
    assert.equal(typeof out, "string", `第 ${i} 次勘察须受理，实得：${String(out).slice(0, 200)}`)
  }
  await assert.rejects(() => designerSubagent.execute({ action: "spawn", ...exploreBrief() }, dctx), (e) => {
    assert.match(e.message, /survey budget exhausted/)
    assert.match(e.message, /6 explore spawns per batch record/)
    return true
  }, "第七次勘察必须被拒")
  // 跨修正轮：换一个 designer child（fix 重派）继续派 ⇒ 预算不归零
  const fixRound = buildSpawnChild(parent, ctx, { role: "eng-designer", async: false, batchDoc, round: "fix" }, "eng-designer", false, [], [], null)
  const fixSubagent = (await assembleFamilyTools({ depth: 1, role: "eng-designer", engineering: true, consultModels: [], batchDoc })).find((x) => x.name === "subagent")
  await assert.rejects(
    () => fixSubagent.execute({ action: "spawn", ...exploreBrief() }, { ...dctx, agent: fixRound.child }),
    /survey budget exhausted/,
    "fix 重派不归零（计数挂在 depth-0 根 agent 上）",
  )
})