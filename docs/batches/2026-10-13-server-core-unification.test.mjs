/**
 * 2026-10-13-server-core-unification.test.mjs — thincoder-server 批内单测件（`server-core-unification` 批 · 台账 #1239；
 * 与核取核形 = A1 工具轮回灌形 ∥ A2 历史修复 ∥ A3 上下文压缩 ∥ 缺核降级 ∥ 核面零改；名随批档 · 住 `docs/batches/` · 随批留存 · 不入任何门）。
 * 运行（自 `thincoder/` 仓根）：`node --test docs/batches/2026-10-13-server-core-unification.test.mjs`
 *
 * 射程（判据源 = 批档 §2 ∥ `docs/server/design/agent/ADMIN-AGENT.md` §17 ∥ §7 判据行「与核取核形」）：
 *   腿① 件清单在场（§17.2：在盘 15 件 ↔ 服务面消费坐标 ∥ 本批新增 3 面落点——源级逐件）
 *   腿② A1 回灌形（chat 面 ∥ run 面）：回声族携 `reasoning_content`（缺值 ⇒ `""`）∥ 非回声族零字段 ∥
 *        `extra_content` 在场才带 ∥ 落库 ⇔ 回放逐值（`data.reasoning` ∥ `data.toolCalls[].extraContent`）
 *   腿③ A2 历史修复：断链 `tool_calls` ⇒ 合成结果补齐（核件原文）∥ 孤儿 `tool` ⇒ 剔除 ∥ 常态零改（同序零增行）
 *   腿④ A3 压缩：真网关链 + 假上游 ⇒ 标记行落库（`data.kind/covers`）＋ 摘要调用出账（`usage` 可归因）＋ 上下文缩 ＋
 *        回放以标记代覆盖段；阈值以下零动作；3 连败 ⇒ 降级 `compressFallback`（同落标记行）
 *   腿⑤ 缺核降级：三面缺核（本仓真缺核环境——`@thincoder/core` 未装）⇒ 回合照跑 ∥ 零标记 ∥ 自建形回落
 *   腿⑥ 核面复用面在场：三面取件导出 ＋ `COMPRESS_FAILURE_LIMIT = 3` ∥ 阈值镜像常量（核侧零改——git 面判见批档 §5）
 * 载体 = `node --test`（内存真 db ∥ 假工具面 ∥ **真核件**——`thincoder-core/*` 仓内直引经注入口；压缩腿 = 真网关链 + 假上游）。
 */
import test from "node:test"
import assert from "node:assert/strict"
import { existsSync, mkdtempSync, readFileSync } from "node:fs"
import { createServer as createHttpServer } from "node:http"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { pathToFileURL } from "node:url"

const ROOT = process.cwd()
if (!existsSync(join(ROOT, "thincoder-server"))) throw new Error(`须从仓库根（thincoder/）运行——cwd = ${ROOT}`)
const load = (rel) => import(pathToFileURL(join(ROOT, rel)).href)

const DB = await load("thincoder-server/src/store/db.mjs")
const MEMBERS = await load("thincoder-server/src/accounts/members.mjs")
const KEYS = await load("thincoder-server/src/accounts/keys.mjs")
const ACCOUNT_ROUTES = await load("thincoder-server/src/accounts/routes.mjs")
const SERVER = await load("thincoder-server/src/gateway/server.mjs")
const GATEWAY_ROUTES = await load("thincoder-server/src/gateway/routes.mjs")
const CONFIG = await load("thincoder-server/src/ops/config.mjs")
const CHAT = await load("thincoder-server/src/agent/chat.mjs")
const CHAT_STORE = await load("thincoder-server/src/agent/chat-store.mjs")
const CHAT_COMPACT = await load("thincoder-server/src/agent/chat-compact.mjs")
const CHAT_ENV_TOOLS = await load("thincoder-server/src/agent/chat-env-tools.mjs")
const RUN = await load("thincoder-server/src/agent/run.mjs")

// 核真件注入口（§17.2/§17.3——仓内直引；生产面 = 动载 `@thincoder/core/*`）
const CORE_SPECS = await load("thincoder-core/model-specs.mjs")
const CORE_HELPERS = await load("thincoder-core/agent/helpers.mjs")
const CORE_COMPACT = await load("thincoder-core/context.mjs")
const CORE_CHAT = (await load("thincoder-core/provider/index.mjs")).chat

const PASSWORD = "password-123"
const tempRoot = mkdtempSync(join(tmpdir(), "tc-scu-"))
const SOURCE = (rel) => readFileSync(join(ROOT, rel), "utf8")

/** 假工具面（注入口盾形——逐调用可断言；`terminal` 缺 ⇒ run 面终态 = 结果 ok）。 */
const fakeTools = (calls = []) => ({
  schemas: [],
  async invoke(name, args) {
    calls.push({ name, args })
    return { ok: true, message: `工具完成：${name}` }
  },
})

/** 假模型（脚本回合；函数形 ⇒ 逐回合算）。`{ content?, reasoning?, toolCalls?, usage? }` ⇒ 核 `chat` 返回形。 */
function scriptedChat(turns = []) {
  const state = { i: 0 }
  const calls = []
  const chat = async ({ messages }) => {
    calls.push(JSON.parse(JSON.stringify(messages)))
    const index = Math.min(state.i, Math.max(0, turns.length - 1))
    state.i += 1
    const spec = typeof turns[index] === "function" ? await turns[index]() : turns[index]
    return { content: spec?.content ?? "", reasoning: spec?.reasoning, toolCalls: spec?.toolCalls ?? [], usage: spec?.usage }
  }
  return { chat, calls }
}

function seedProviderRow(db, { name = "fake", baseURL = "http://127.0.0.1:9/v1", models = ["fake-model"] } = {}) {
  const ts = new Date().toISOString()
  db.prepare("INSERT INTO providers (name, base_url, api_key, models_json, created_at, updated_at) VALUES (?,?,?,?,?,?)")
    .run(name, baseURL, "sk-upstream-test", JSON.stringify(models), ts, ts)
}

/** 夹具：内存真 db（admin ∥ provider 行 ∥ `admin-agent` sk）+ 会话 + 假模型 + 假工具面（真核面经注入口）。
 *  垫片按会话 id 键（模块级）⇒ 每夹具先占位（同 `server-wake-face` 夹具先例——垫片跨夹具不复用）。 */
let fixtureSeq = 0
async function chatFixture({ model = "fake/fake-model", providers = null, seedKey = true, turns = [] } = {}) {
  const db = DB.openDatabase(":memory:")
  const { member } = await MEMBERS.createMember(db, { username: "admin", role: "admin", password: PASSWORD })
  for (const row of providers ?? [{ name: "fake", models: ["fake-model"] }]) seedProviderRow(db, row)
  if (seedKey) KEYS.ensureAgentKey(db, member.id)
  fixtureSeq += 1
  for (let i = 1; i < fixtureSeq; i++) CHAT.createChat(db, { model, createdBy: member.id }) // 占位会话（垫片隔离）
  const chat = CHAT.createChat(db, { model, createdBy: member.id })
  const cwd = mkdtempSync(join(tempRoot, "cwd-"))
  const model_ = scriptedChat(turns)
  const toolCalls = []
  const pad = CHAT_ENV_TOOLS.timerPadOf(chat.id)
  pad.history = []
  pad._pendingTimers = []
  delete pad._compressFailures // 失败链计数面（本夹具自持）
  const deps = { chat: model_.chat, tools: fakeTools(toolCalls), cwd, log: null, config: { traces: { enabled: false } } }
  return {
    db, member, chat, pad, model: model_, deps, toolCalls,
    rows: () => db.prepare("SELECT * FROM agent_chat_messages WHERE chat_id = ? ORDER BY seq").all(chat.id),
    markerRows: () => db.prepare("SELECT * FROM agent_chat_messages WHERE chat_id = ? ORDER BY seq").all(chat.id)
      .filter((row) => JSON.parse(row.data_json ?? "{}").kind === "compaction"),
    run: async (content, { turns: t = null, deps: extra = {} } = {}) => {
      if (t !== null) model_.turns = t
      CHAT.claimChatTurn(db, chat.id, { now: Date.now })
      const result = await CHAT.runChatTurn({ db, chatId: chat.id, content, emit: null, now: Date.now, deps: { ...deps, ...extra } })
      return { result }
    },
  }
}

/** 长历史（阈值 100_000 tokens；ASCII/4 ⇒ 20_000 字 ≈ 5_000 tokens/行；24 行 ⇒ ≈120k tokens ⇒ 阈值触发）。 */
const BIG = "x".repeat(20_000)
const seedLongHistory = (db, chatId, rows = 24) => {
  for (let i = 0; i < rows; i++) {
    CHAT_STORE.appendMessage(db, chatId, { role: i % 2 === 0 ? "user" : "assistant", content: `段${i} ${BIG}`, now: Date.now })
  }
}

// ── 腿① 件清单在场（§17.2）────────────────────────────────────────────────────

test("腿① 件清单在场（§17.2）：在盘 15 件 × 服务面消费坐标 ∥ 本批新增 3 面落点（源级逐件）", () => {
  const IN_PLACE = [
    ["@thincoder/core/provider/index.mjs", "thincoder-server/src/agent/run.mjs"],
    ["@thincoder/core/model-specs.mjs", "thincoder-server/src/gateway/reasoning-levels.mjs"],
    ["@thincoder/core/agent/timers.mjs", "thincoder-server/src/agent/chat-env-tools.mjs"],
    ["@thincoder/core/agent/timers.mjs", "thincoder-server/src/agent/chat-wake.mjs"],
    ["@thincoder/core/agent-tools/timer.mjs", "thincoder-server/src/agent/chat-env-tools.mjs"],
    ["@thincoder/core/agent-tools/bash-async.mjs", "thincoder-server/src/agent/chat-env-tools.mjs"],
    ["@thincoder/core/agent-tools/async-settle.mjs", "thincoder-server/src/agent/chat-env-tools.mjs"],
    ["@thincoder/core/agent-tools/async-discard.mjs", "thincoder-server/src/agent/chat-env-tools.mjs"],
    ["@thincoder/core/agent-tools/read-history.mjs", "thincoder-server/src/agent/chat-env-tools.mjs"],
    ["@thincoder/core/tools/ops.mjs", "thincoder-server/src/agent/chat-env-tools.mjs"],
    ["@thincoder/core/tools/search.mjs", "thincoder-server/src/agent/chat-env-tools.mjs"],
    ["@thincoder/core/tools/file.mjs", "thincoder-server/src/agent/chat-env-tools.mjs"],
    ["@thincoder/core/tools/bash.mjs", "thincoder-server/src/agent/chat-env-tools.mjs"],
    ["@thincoder/core/tools/shared.mjs", "thincoder-server/src/agent/chat-env-tools.mjs"],
    ["@thincoder/core/agent/helpers.mjs", "thincoder-server/src/agent/chat-env-tools.mjs"],
    ["@thincoder/core/attachments.mjs", "thincoder-server/src/agent/chat-routes.mjs"],
  ]
  for (const [specifier, consumer] of IN_PLACE) {
    assert.ok(existsSync(join(ROOT, consumer)), `${consumer} 应在盘`)
    assert.ok(SOURCE(consumer).includes(`import("${specifier}")`), `${consumer} 应以动态 import 取 ${specifier}（注释同串不算）`)
  }
  const compact = SOURCE("thincoder-server/src/agent/chat-compact.mjs")
  for (const specifier of ["@thincoder/core/model-specs.mjs", "@thincoder/core/agent/helpers.mjs", "@thincoder/core/context.mjs"]) {
    assert.ok(compact.includes(`import("${specifier}")`), `chat-compact.mjs 应以动态 import 取 ${specifier}（§17.3 新增 3 面）`)
  }
  assert.ok(SOURCE("thincoder-server/src/agent/chat.mjs").includes("./chat-compact.mjs"), "chat.mjs 接新档")
  assert.ok(SOURCE("thincoder-server/src/agent/run.mjs").includes("./chat-compact.mjs"), "run.mjs 接新档（A1 两面共用）")
  assert.ok(SOURCE("thincoder-server/src/agent/chat-store.mjs").includes("export function replayEntriesOf"), "回放面（含标记解析）归 chat-store")
})

// ── 腿② A1 工具轮回灌形 ───────────────────────────────────────────────────────

test("腿② A1 回声族（chat 面）：`reasoning_content` + 签名 `extra_content` ∥ 落库 ⇔ 回放逐值", async () => {
  const SIG = { thoughtSignature: "sig-abc-1" }
  const fx = await chatFixture({
    model: "fake/deepseek-flash",
    providers: [{ name: "fake", models: ["deepseek-flash"] }],
    turns: [
      { content: "", reasoning: "思考A", toolCalls: [{ id: "call-1", name: "echo", arguments: '{"x":1}', extra_content: SIG }] },
      { content: "好了" },
    ],
  })
  const core = { coreSpecs: CORE_SPECS, coreHelpers: CORE_HELPERS }
  const first = await fx.run("第一轮", { deps: core })
  assert.equal(first.result.status, "succeeded")
  // 落库面（① 回声道 + ② 签名——§17.3 A1）
  const row = fx.rows().find((item) => item.role === "assistant")
  const data = JSON.parse(row.data_json)
  assert.equal(data.reasoning, "思考A", "`data.reasoning` = 回声道落库")
  assert.deepEqual(data.toolCalls[0].extraContent, SIG, "`data.toolCalls[].extraContent` = 签名落库")
  assert.equal(data.toolCalls[0].args, '{"x":1}', "args = 模型可见形（摘要串）")
  // 消息面 = 核件构造（回声 + 签名 + 空文本 ⇒ content null）
  const live = fx.model.calls[1].find((item) => item.role === "assistant" && item.tool_calls)
  assert.equal(live.reasoning_content, "思考A", "回声族 ⇒ 核件携 `reasoning_content`")
  assert.equal(live.content, null, "空文本 ⇒ `content: null`（核件同式）")
  assert.equal(live.tool_calls[0].id, "call-1")
  assert.equal(live.tool_calls[0].type, "function")
  assert.deepEqual(live.tool_calls[0].extra_content, SIG, "`extra_content` 在场才带")
  // 回放逐值（第二轮：库行 ⇒ 消息数组重建）
  await fx.run("第二轮")
  const replayed = fx.model.calls[2].find((item) => item.role === "assistant" && item.tool_calls)
  assert.deepEqual(replayed, live, "回放逐值 = 回合消息面（回声 ∥ 签名 ∥ 调用形）")
  assert.ok(fx.model.calls[1].some((item) => item.role === "tool" && item.tool_call_id === "call-1"), "工具结果回灌")
})

test("腿② A1 非回声族 ∥ 缺值回声 ⇒ `\"\"`（核件判据逐条）", async () => {
  const fx = await chatFixture({
    model: "fake/qwen3.7-flash",
    providers: [{ name: "fake", models: ["qwen3.7-flash"] }],
    turns: [
      { content: "", reasoning: "族外思考", toolCalls: [{ id: "call-1", name: "echo", arguments: "{}" }] },
      { content: "好" },
    ],
  })
  await fx.run("非回声族", { deps: { coreSpecs: CORE_SPECS, coreHelpers: CORE_HELPERS } })
  const live = fx.model.calls[1].find((item) => item.role === "assistant" && item.tool_calls)
  assert.equal("reasoning_content" in live, false, "非回声族 ⇒ 零字段")
  assert.equal("reasoning_content" in JSON.parse(fx.rows().find((item) => item.role === "assistant").data_json), false, "落库面零 `reasoning` 键")

  const fx2 = await chatFixture({
    model: "fake/deepseek-flash",
    providers: [{ name: "fake", models: ["deepseek-flash"] }],
    turns: [{ content: "", toolCalls: [{ id: "call-1", name: "echo", arguments: "{}" }] }, { content: "好" }],
  })
  await fx2.run("缺值回声", { deps: { coreSpecs: CORE_SPECS, coreHelpers: CORE_HELPERS } })
  const live2 = fx2.model.calls[1].find((item) => item.role === "assistant" && item.tool_calls)
  assert.equal(live2.reasoning_content, "", "回声族缺值 ⇒ `\"\"`（核件判据）")
  assert.equal(JSON.parse(fx2.rows().find((item) => item.role === "assistant").data_json).reasoning, "", "落库同值（`\"\"` 亦在场）")
})

test("腿② A1 任务面（run.mjs）：出口携规格 ⇒ 核件构造；缺规格 ⇒ 零字段回落", async () => {
  const SIG = { thoughtSignature: "sig-run-2" }
  const seen = []
  const sig = { i: 0 }
  const exit = async ({ messages }) => {
    seen.push(JSON.parse(JSON.stringify(messages)))
    sig.i += 1
    return sig.i === 1
      ? { content: "", reasoning: "任务思考", toolCalls: [{ id: "c1", name: "echo", arguments: "{}", extra_content: SIG }] }
      : { content: "", reasoning: "任务思考2", toolCalls: [{ id: "c2", name: "report", arguments: "{}" }] }
  }
  exit.spec = CORE_SPECS.specForModel("deepseek-flash")
  const target = { schemas: [], async invoke() { return { ok: true } }, terminal: () => ({ ok: true, summary: "完成", step: null, readings: null }) }
  const result = await RUN.runAgentTask({ brief: "简报", userMessage: "任务", tools: target, chat: exit, coreSpecs: CORE_SPECS })
  assert.equal(result.status, "succeeded")
  const live = seen[1].find((item) => item.role === "assistant" && item.tool_calls)
  assert.equal(live.reasoning_content, "任务思考")
  assert.deepEqual(live.tool_calls[0].extra_content, SIG, "任务面同携签名")
  assert.equal(live.content, null)
  assert.equal(RUN.buildModelExit !== undefined, true, "出口装配在场（`exit.spec` 挂携面）")

  const sig2 = { i: 0 }
  const exit2 = async ({ messages }) => {
    seen.push(JSON.parse(JSON.stringify(messages)))
    sig2.i += 1
    return sig2.i === 1
      ? { content: "", reasoning: "任务思考", toolCalls: [{ id: "c1", name: "echo", arguments: "{}" }] }
      : { content: "", toolCalls: [{ id: "c2", name: "report", arguments: "{}" }] }
  }
  exit2.spec = null // 缺规格（缺核 ∥ 域外模型）
  await RUN.runAgentTask({ brief: "简报", userMessage: "任务", tools: target, chat: exit2, coreSpecs: CORE_SPECS })
  const live2 = seen[3].find((item) => item.role === "assistant" && item.tool_calls)
  assert.equal("reasoning_content" in live2, false, "缺规格 ⇒ 零回声（核件判据）")
})

// ── 腿③ A2 历史修复 ───────────────────────────────────────────────────────────

test("腿③ A2 修复：断链补合成结果 ∥ 孤儿 tool 剔除 ∥ 常态零改（同序零增行）", async () => {
  // 断链：assistant 声明 `call-x` 而结果行缺席（中止/重启窗病态形）
  const broken = await chatFixture({ turns: [{ content: "收到" }] })
  CHAT_STORE.appendMessage(broken.db, broken.chat.id, { role: "user", content: "早前", now: Date.now })
  CHAT_STORE.appendMessage(broken.db, broken.chat.id, { role: "assistant", content: "先查", data: { toolCalls: [{ id: "call-x", name: "read", args: "{}" }] }, now: Date.now })
  CHAT_STORE.appendMessage(broken.db, broken.chat.id, { role: "user", content: "继续", now: Date.now })
  await broken.run("走一轮", { deps: { coreHelpers: CORE_HELPERS } })
  const repaired = broken.model.calls[0].find((item) => item.role === "tool")
  assert.ok(repaired, "断链 pair ⇒ 合成结果补齐")
  assert.equal(repaired.tool_call_id, "call-x")
  assert.equal(repaired.content, "[Tool execution was interrupted: session ended before the result was recorded]", "核件原文逐字")

  // 孤儿 tool：无声明者 ⇒ 剔除
  const orphan = await chatFixture({ turns: [{ content: "收到" }] })
  CHAT_STORE.appendMessage(orphan.db, orphan.chat.id, { role: "tool", content: "无主结果", data: { toolCallId: "call-none", name: "read" }, now: Date.now })
  await orphan.run("再走", { deps: { coreHelpers: CORE_HELPERS } })
  assert.equal(orphan.model.calls[0].some((item) => item.role === "tool"), false, "孤儿 tool ⇒ 剔除")

  // 常态零改：干净历史 ⇒ 同序零增行（系统简报 + 行 + 环境块三行）
  const clean = await chatFixture({ turns: [{ content: "收到" }] })
  CHAT_STORE.appendMessage(clean.db, clean.chat.id, { role: "user", content: "甲", now: Date.now })
  CHAT_STORE.appendMessage(clean.db, clean.chat.id, { role: "assistant", content: "乙", now: Date.now })
  await clean.run("丙", { deps: { coreHelpers: CORE_HELPERS } })
  const seen = clean.model.calls[0]
  assert.deepEqual(seen.slice(0, 4).map((item) => item.role), ["system", "user", "assistant", "user"], "常态零改（序不变）")
  assert.equal(seen.length, 4 + 3, "零增行（尾三行 = 环境块瞬态）")
})

// ── 腿④ A3 上下文压缩 ─────────────────────────────────────────────────────────

async function startApp({ db, config }) {
  const routes = SERVER.createRouteTable()
  GATEWAY_ROUTES.registerGatewayRoutes(routes, { db, config })
  ACCOUNT_ROUTES.registerAccountRoutes(routes, { db })
  const server = SERVER.createGatewayServer({ config, routes })
  await new Promise((resolve, reject) => { server.once("error", reject); server.listen(0, "127.0.0.1", resolve) })
  return {
    base: `http://127.0.0.1:${server.address().port}`,
    address: () => server.address(),
    async close() { server.closeAllConnections?.(); await new Promise((resolve) => server.close(resolve)) },
  }
}

const configWith = (baseURL, models = ["mock-chat"]) =>
  CONFIG.validateConfig({ host: "127.0.0.1", providers: [{ name: "mock", baseURL, apiKey: "sk-upstream", models }], embedding: { baseURL, model: "bge-m3" } })

/** 假上游（SSE——真网关链的对端；摘要请求判据 = 消息面含 `summarize it into a compact summary`）。 */
async function startFakeUpstream() {
  const bodies = []
  const upstream = createHttpServer((req, res) => {
    let body = ""
    req.on("data", (chunk) => { body += chunk })
    req.on("end", () => {
      const parsed = JSON.parse(body || "{}")
      bodies.push(parsed)
      const isSummary = JSON.stringify(parsed.messages ?? []).includes("summarize it into a compact summary")
      const text = isSummary ? "压缩摘要：早期工作已归档。" : "收到"
      res.writeHead(200, { "content-type": "text/event-stream" })
      res.write(`data: ${JSON.stringify({ id: "c1", choices: [{ delta: { content: text } }] })}\n\n`)
      res.write(`data: ${JSON.stringify({ id: "c1", choices: [{ delta: {}, finish_reason: "stop" }] })}\n\n`)
      res.write(`data: ${JSON.stringify({ choices: [], usage: { prompt_tokens: 111, completion_tokens: 22, total_tokens: 133 } })}\n\n`)
      res.write("data: [DONE]\n\n")
      res.end()
    })
  })
  await new Promise((resolve, reject) => { upstream.once("error", reject); upstream.listen(0, "127.0.0.1", resolve) })
  return {
    base: `http://127.0.0.1:${upstream.address().port}/v1`,
    bodies,
    async close() { upstream.closeAllConnections?.(); await new Promise((resolve) => upstream.close(resolve)) },
  }
}

test("腿④ A3 压缩（真网关链 + 假上游）：标记行落库 ∥ 摘要调用出账 ∥ 上下文缩 ∥ 回放以标记代覆盖段", async () => {
  const up = await startFakeUpstream()
  const upstreamBase = up.base
  const bodies = up.bodies

  const db = DB.openDatabase(":memory:")
  const { member } = await MEMBERS.createMember(db, { username: "admin", role: "admin", password: PASSWORD })
  seedProviderRow(db, { name: "mock", baseURL: upstreamBase, models: ["mock-chat"] })
  KEYS.ensureAgentKey(db, member.id)
  const app = await startApp({ db, config: configWith(upstreamBase) })
  const chat = CHAT.createChat(db, { model: "mock/mock-chat", createdBy: member.id })
  seedLongHistory(db, chat.id, 24) // 24 行 ⇒ ≈120k tokens > 阈值 100k
  const deps = {
    tools: fakeTools([]), coreSpecs: CORE_SPECS, coreHelpers: CORE_HELPERS, coreCompact: CORE_COMPACT,
    cwd: tempRoot, selfBaseUrl: () => app.address(), chatImpl: CORE_CHAT, config: { traces: { enabled: false } },
  }
  try {
    CHAT.claimChatTurn(db, chat.id, { now: Date.now })
    const result = await CHAT.runChatTurn({ db, chatId: chat.id, content: "长上下文回合", emit: null, now: Date.now, deps })
    assert.equal(result.status, "succeeded", `压缩回合应成功：${result.reason ?? ""}`)

    // ① 标记行落库（落库单源 = `user` 行 + `data.kind/covers`；内容 = 压缩产物）
    const markers = db.prepare("SELECT * FROM agent_chat_messages WHERE chat_id = ? ORDER BY seq").all(chat.id)
      .filter((row) => JSON.parse(row.data_json ?? "{}").kind === "compaction")
    assert.equal(markers.length, 1, "阈值触发 ⇒ 恰一条标记行")
    const marker = markers[0]
    assert.equal(marker.role, "user")
    assert.equal(marker.content.startsWith("[Context was automatically compacted. Below is a summary of earlier work."), true, "内容 = 核件注记 + 摘要")
    assert.ok(marker.content.includes("压缩摘要：早期工作已归档。"), "摘要正文在场")
    assert.deepEqual(JSON.parse(marker.data_json).covers, [1, 15], "覆盖区间 = 差分求（首段；尾段 verbatim）")

    // ② 摘要调用经出口（同一网关链——`usage` 行可归因）＋ 上下文缩
    const summaryReq = bodies.find((item) => JSON.stringify(item.messages ?? []).includes("summarize it into a compact summary"))
    assert.ok(summaryReq, "摘要调用应达上游（真网关链）")
    assert.equal(summaryReq.messages[0].role, "system", "摘要调用复用系统简报（v2/v3 形）")
    assert.ok(JSON.stringify(summaryReq.messages).includes("段0"), "摘要请求携中段原文")
    assert.equal(JSON.stringify(summaryReq.messages).includes("段23"), false, "摘要请求不含尾段（tail verbatim）")
    const turnReq = bodies.findLast((item) => JSON.stringify(item.messages ?? []).includes("长上下文回合"))
    assert.ok(turnReq, "回合调用应达上游")
    assert.ok(turnReq.messages.length < 20, `压缩后上下文应缩（实读 ${turnReq.messages.length} 条）`)
    assert.ok(JSON.stringify(turnReq.messages).includes("压缩摘要：早期工作已归档。"), "回合上下文 = 压缩后形（注记在场）")
    assert.equal(JSON.stringify(turnReq.messages).includes("段0"), false, "覆盖段不入回合上下文")
    assert.ok(JSON.stringify(turnReq.messages).includes("段23"), "尾段 verbatim 保留")
    const usage = db.prepare("SELECT u.*, k.name AS key_name FROM usage u JOIN api_keys k ON k.id = u.key_id ORDER BY u.id").all()
    assert.ok(usage.length >= 2, `摘要 + 回合两调用 ⇒ ≥2 条 usage（实读 ${usage.length}）`)
    for (const row of usage) {
      assert.equal(row.member_id, member.id, "归因 = 发送者（本用例发送者缺省回落 = 会话 owner——2026-10-13 收正）")
      assert.equal(row.key_name, KEYS.AGENT_KEY_NAME, "归因 = admin-agent sk（摘要调用同链）")
      assert.equal(row.endpoint, "chat")
    }

    // ③ 回放以标记代覆盖段（次回合：库行 ⇒ 消息数组——覆盖行进不了上下文）
    CHAT.claimChatTurn(db, chat.id, { now: Date.now })
    const second = await CHAT.runChatTurn({ db, chatId: chat.id, content: "第二条", emit: null, now: Date.now, deps })
    assert.equal(second.status, "succeeded")
    const replayed = bodies.at(-1)
    assert.ok(JSON.stringify(replayed.messages).includes("压缩摘要：早期工作已归档。"), "回放 ⇒ 标记行内容入上下文")
    assert.equal(JSON.stringify(replayed.messages).includes("段0"), false, "回放 ⇒ 覆盖段跳过")
    assert.ok(JSON.stringify(replayed.messages).includes("段23"), "回放 ⇒ 尾段在场")
    assert.equal(JSON.stringify(replayed.messages).includes("段14 "), false, "回放 ⇒ 覆盖段末行（seq 15）跳过")
  } finally {
    await app.close()
    await up.close()
  }
})

test("腿④ A3 并入支（尾首助手空内容）：覆盖区间不含并入副本所在行 ∥ 尾首工具行不成孤儿", async () => {
  const up = await startFakeUpstream()
  const db = DB.openDatabase(":memory:")
  const { member } = await MEMBERS.createMember(db, { username: "admin", role: "admin", password: PASSWORD })
  seedProviderRow(db, { name: "mock", baseURL: up.base, models: ["mock-chat"] })
  KEYS.ensureAgentKey(db, member.id)
  const app = await startApp({ db, config: configWith(up.base) })
  const chat = CHAT.createChat(db, { model: "mock/mock-chat", createdBy: member.id })
  // 中段 15 行（≈75k tokens）∥ 尾首 = 空内容助手（携 tool_calls——核并入支产物 = 占位符单独成形）＋ 其 tool 行 ∥ 尾余 8 行
  for (let i = 0; i < 15; i++) CHAT_STORE.appendMessage(db, chat.id, { role: i % 2 === 0 ? "user" : "assistant", content: `段${i} ${BIG}`, now: Date.now })
  CHAT_STORE.appendMessage(db, chat.id, { role: "assistant", content: "", data: { toolCalls: [{ id: "tail-call", name: "echo", args: "{}" }] }, now: Date.now })
  CHAT_STORE.appendMessage(db, chat.id, { role: "tool", content: "尾首调用结果", data: { toolCallId: "tail-call", name: "echo" }, now: Date.now })
  for (let i = 15; i < 23; i++) CHAT_STORE.appendMessage(db, chat.id, { role: i % 2 === 0 ? "user" : "assistant", content: `段${i} ${BIG}`, now: Date.now })
  const deps = {
    tools: fakeTools([]), coreSpecs: CORE_SPECS, coreHelpers: CORE_HELPERS, coreCompact: CORE_COMPACT,
    cwd: tempRoot, selfBaseUrl: () => app.address(), chatImpl: CORE_CHAT, config: { traces: { enabled: false } },
  }
  try {
    CHAT.claimChatTurn(db, chat.id, { now: Date.now })
    const result = await CHAT.runChatTurn({ db, chatId: chat.id, content: "并入支回合", emit: null, now: Date.now, deps })
    assert.equal(result.status, "succeeded", `压缩回合应成功：${result.reason ?? ""}`)
    const markers = db.prepare("SELECT * FROM agent_chat_messages WHERE chat_id = ? ORDER BY seq").all(chat.id)
      .filter((row) => JSON.parse(row.data_json ?? "{}").kind === "compaction")
    assert.equal(markers.length, 1, "阈值触发 ⇒ 恰一条标记行")
    assert.deepEqual(JSON.parse(markers[0].data_json).covers, [1, 15], "覆盖 = 中段（并入副本所在行（seq 16）不入覆盖）")
    const turnReq = up.bodies.findLast((item) => JSON.stringify(item.messages ?? []).includes("并入支回合"))
    assert.ok(turnReq, "回合调用应达上游")
    assert.ok(JSON.stringify(turnReq.messages).includes("尾首调用结果"), "并入尾首的 tool 行保留（不成孤儿被剔）")
    assert.equal(JSON.stringify(turnReq.messages).includes("段14 "), false, "中段跳过（覆盖段）")
    assert.ok(JSON.stringify(turnReq.messages).includes("段22"), "尾余 verbatim 保留")
  } finally {
    await app.close()
    await up.close()
  }
})

test("腿④ A3 失败链：3 连败 ⇒ 降级 `compressFallback`（同落标记行）∥ 阈值以下零动作", async () => {
  const provider = { baseURL: "http://127.0.0.1:9/v1", apiKey: "sk-dummy", model: "mock/mock-chat", name: "mock" }
  const throwing = { ...CORE_COMPACT, compressIfNeeded: async () => { throw new Error("压缩假失败") } }
  const fx = await chatFixture({ turns: [{ content: "收到" }] })
  seedLongHistory(fx.db, fx.chat.id, 24)
  const deps = { compactProvider: provider, coreCompact: throwing, coreHelpers: CORE_HELPERS, coreSpecs: CORE_SPECS }
  await fx.run("第一", { deps })
  assert.equal(fx.pad._compressFailures, 1, "失败 ⇒ ＋1（进程内计数）")
  assert.equal(fx.markerRows().length, 0, "未达限 ⇒ 零标记（零静默改写）")
  await fx.run("第二", { deps })
  assert.equal(fx.pad._compressFailures, 2)
  await fx.run("第三", { deps })
  assert.equal(fx.pad._compressFailures, 0, "达限 ⇒ 降级并复位计数")
  const markers = fx.markerRows()
  assert.equal(markers.length, 1, "降级 ⇒ 同落标记行")
  assert.equal(markers[0].content.startsWith("[Context was truncated after repeated summarization failures."), true, "内容 = 核件降级注记逐字")
  assert.equal(JSON.parse(markers[0].data_json).kind, "compaction")
  assert.equal(Array.isArray(JSON.parse(markers[0].data_json).covers), true, "降级同出覆盖面")

  const short = await chatFixture({ turns: [{ content: "收到" }] })
  await short.run("短历史", { deps: { compactProvider: provider, coreCompact: CORE_COMPACT, coreSpecs: CORE_SPECS } })
  assert.equal(short.markerRows().length, 0, "阈值以下 ⇒ 零动作")
  assert.equal(short.pad._compressFailures, 0, "阈值以下 ⇒ 零计数")
})

// ── 腿⑤ 缺核降级不阻断 ───────────────────────────────────────────────────────

test("腿⑤ 缺核降级：三面缺核（本仓真缺核）⇒ 回合照跑 ∥ 零标记 ∥ 自建形回落", async () => {
  const fx = await chatFixture({
    turns: [
      { content: "", reasoning: "思考", toolCalls: [{ id: "c1", name: "echo", arguments: "{}", extra_content: { thoughtSignature: "s" } }] },
      { content: "完成" },
    ],
  })
  const { result } = await fx.run("走一轮") // 零 core* 注入（`@thincoder/core` 未装 ⇒ 动载失败 ⇒ 三面退中性）
  assert.equal(result.status, "succeeded", `缺核不得阻断回合：${result.reason ?? ""}`)
  const live = fx.model.calls[1].find((item) => item.role === "assistant" && item.tool_calls)
  assert.equal("reasoning_content" in live, false, "缺核 ⇒ 自建形（零回声）")
  assert.equal(live.content, null, "自建形同式（空文本 ⇒ null）")
  assert.equal(fx.markerRows().length, 0, "缺核 ⇒ 零标记")
  // 计数面：真缺核 ⇒ 压缩面未触（undefined）；核在场环境（如依赖已装）⇒ 阈值以下正常落 0——两境皆无失败积累
  assert.ok(fx.pad._compressFailures === undefined || fx.pad._compressFailures === 0, `缺核 ∥ 阈值以下 ⇒ 零失败积累（实读 ${fx.pad._compressFailures}）`)
})

// ── 腿⑥ 核面复用面在场（核侧零改）────────────────────────────────────────────

test("腿⑥ 核面复用面在场：三面取件导出 ＋ 常量取值（核侧零改——git 面判见批档 §5）", () => {
  assert.equal(typeof CORE_SPECS.assistantToolCallMessage, "function", "A1 核件")
  assert.equal(typeof CORE_SPECS.specForModel, "function", "A1 规格解析")
  assert.equal(typeof CORE_HELPERS.repairHistory, "function", "A2 核件")
  assert.equal(typeof CORE_COMPACT.compressIfNeeded, "function", "A3 压缩")
  assert.equal(typeof CORE_COMPACT.compressFallback, "function", "A3 降级")
  assert.equal(CORE_COMPACT.COMPRESS_FAILURE_LIMIT, 3, "失败限 = 核常量（取件 = `@thincoder/core/context.mjs`）")
  assert.equal(CHAT_COMPACT.DEFAULT_COMPACT_THRESHOLD, 100_000, "阈值 = 核缺省镜像常量")
  assert.equal(CHAT_COMPACT.COMPACTION_KIND, "compaction", "标记行判别值单源")
  const message = CORE_SPECS.assistantToolCallMessage({ content: "文", toolCalls: [{ id: "i", name: "n", arguments: "{}" }] }, CORE_SPECS.specForModel("deepseek-flash"))
  assert.equal(message.reasoning_content, "", "核件原文复用（缺值回声 ⇒ `\"\"`）")
})
