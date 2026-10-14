/**
 * 2026-10-14-model-test-tool.test.mjs — thincoder-server 批内单测件（`model-test-tool` 批 · 模型测试工具 `models.test`；
 * 名随批档 · 住 `docs/batches/` · 随批留存 · **不入任何门**）。
 * 运行（自 `thincoder/` 仓根）：`node --test docs/batches/2026-10-14-model-test-tool.test.mjs`
 *
 * 射程（判据源 = 批档 `docs/batches/2026-10-14-model-test-tool.md` §2 ∥ `docs/server/design/agent/ADMIN-AGENT.md`
 * §12.1（机制五面）∥ §7 本批行 ①–⑥ ∥ §8 N84 ∥ B80 ∥ E62）：
 *   腿① N84 正常：真回合 + 假自环出口（假 fetch ∥ 注入钟）⇒ 五读数**逐值** ＋ `call`/`result` 帧逐值 ＋ `chat_call` 审计（subject = 外标）；
 *        续：别名 ∥ provider 按 id 点名（外标 = 别名——请求体 `model` 与读数 `model` 同值）。
 *   腿② B80①–⑤ 边界：① 流首空壳块不计 ttfb ∥ ② 流末无 usage ⇒ `tps:null`（不估）∥ ③ 空答 ⇒ `status:"ok"` ＋ `ttfbMs:null` ∥
 *        ④ `timeoutS` 小值 ⇒ 首字节前超时（`phase:"before_first_byte"`）∥ ⑤ 首内容增量前流中断 ⇒ `broken_stream`（零部分读数）；
 *        附（§7④ 五支补全）：`bad_response`（2xx 非 SSE 形）∥ 生成中超时（`phase:"generating"`）∥ 内容后中断（携部分读数）∥
 *        `error` 帽 500 字逾限截断加注（总长含注记 ≤ 帽——§12.1③）∥ 逾读帽（8 KiB）早退 `bad_response`（有界读）。
 *   腿③ E62①–⑥ 错误分类：① 未配/草稿值 ∥ ④ sk 缺位/自环基址缺位 ∥ ⑤ 未接线（缺缝）∥ ⑥ 入参校验（`prompt` 逾 2000 字 ∥
 *        `timeoutS` 非正/非数/越界）⇒ 工具级错误人话（**零外呼** ∥ 库零变）；② 网关 404 ∥ ③ 上游 502 透视 ⇒ 读数面 `http_error`
 *        （HTTP 码 ＋ 原文**原样**——回合不停）；各落 `chat_call` 行；另：**回合中止**（非超时）⇒ 探针即断 ＋ 工具级错误（`ctx.signal` 透传）。
 *   腿④ 真链（§7② ∥ N78 同形）：真网关链 + 假上游 + 真装配（真 `fetch`）⇒ `usage` 行在场（member = 发送者 ∥ key = `admin-agent`）
 *        ＋ `chat_call` 逐调用一行。
 *   腿⑤ 结构（AC-55⑥）：零新端点 ∥ 零迁移 ∥ 能力段零触 ∥ 成员面零涉 ∥ 工具名集八件不变 ∥ 三 kind 不扩。
 * 载体 = `node --test`（假模型出口 ∥ 假自环出口 ∥ 内存真 db ∥ **真装配路径**——`createChatTools`/`runChatTurn`/`chatProviderOf`）。
 */
import test from "node:test"
import assert from "node:assert/strict"
import { existsSync, readFileSync } from "node:fs"
import { createServer as createHttpServer } from "node:http"
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
const CHAT_TOOLS = await load("thincoder-server/src/agent/chat-tools.mjs")
const CHAT_ENV = await load("thincoder-server/src/agent/chat-env.mjs")
const MODEL_TEST = await load("thincoder-server/src/agent/model-test.mjs")

const PASSWORD = "password-123"
const PROVIDER = "fake"
const MODEL = "fake-model"
const EXTERNAL = `${PROVIDER}/${MODEL}`

// ── 夹具与假件 ────────────────────────────────────────────────────────────────

function seedProviderRow(db, { name = PROVIDER, baseURL = "http://127.0.0.1:9/v1", models = [MODEL] } = {}) {
  const ts = new Date().toISOString()
  db.prepare("INSERT INTO providers (name, base_url, api_key, models_json, created_at, updated_at) VALUES (?,?,?,?,?,?)")
    .run(name, baseURL, "sk-upstream-test", JSON.stringify(models), ts, ts)
}

/** 夹具：内存真 db（admin 成员 ∥ provider 行 ∥ `admin-agent` sk）+ 会话。 */
async function fixture({ withKey = true, models = [MODEL] } = {}) {
  const db = DB.openDatabase(":memory:")
  const { member } = await MEMBERS.createMember(db, { username: "admin", role: "admin", password: PASSWORD })
  seedProviderRow(db, { models })
  if (withKey) KEYS.ensureAgentKey(db, member.id)
  const chat = CHAT.createChat(db, { model: EXTERNAL, createdBy: member.id })
  return { db, member, chat }
}

/** 假模型：脚本回合（`{ content?, toolCalls? }`；用尽 ⇒ 恒末回合）。 */
function scriptedChat(turns = []) {
  const state = { i: 0, turns: turns.length > 0 ? turns : [{ content: "（假模型）收到" }] }
  const calls = []
  const chat = async ({ messages }) => {
    calls.push(JSON.parse(JSON.stringify(messages)))
    const index = Math.min(state.i, state.turns.length - 1)
    const spec = state.turns[index]
    state.i += 1
    return { content: spec?.content ?? "", toolCalls: spec?.toolCalls ?? [] }
  }
  return { chat, calls }
}

const toolTurn = (calls) => ({
  content: "",
  toolCalls: calls.map((call, index) => ({ id: `call-${index}-${call.name}`, name: call.name, arguments: JSON.stringify(call.args) })),
})

const encoder = new TextEncoder()
const sse = (payload) => `data: ${typeof payload === "string" ? payload : JSON.stringify(payload)}\n\n`
const shellFrame = sse({ id: "c1", choices: [{ delta: { role: "assistant", content: "" } }] }) // 流首空壳块
const emptyDeltaFrame = sse({ id: "c1", choices: [{ delta: {} }] })
const contentFrame = (text) => sse({ id: "c1", choices: [{ delta: { content: text } }] })
const usageFrame = (prompt, completion) => sse({ choices: [], usage: { prompt_tokens: prompt, completion_tokens: completion, total_tokens: prompt + completion } })
const DONE_FRAME = sse("[DONE]")

/** 假自环出口（假 `fetch`——**按注入钟**逐 `pull` 吐帧；steps 逐项：`{ t（钟进 ms）∥ chunk（帧文）∥ error（置错）∥ stall（阻塞至中止）∥ close }`）。
 *  请求形捕获（`onRequest`）：URL ∥ init（method/headers/body/signal）。 */
function fakeLoopback({ clock, steps = [], status = 200, headers = { "content-type": "text/event-stream" }, body = null, onRequest = null } = {}) {
  const queue = [...steps]
  return async (url, init) => {
    onRequest?.({ url, init })
    if (body !== null) return new Response(body, { status, headers })
    const stream = new ReadableStream({
      pull(controller) {
        const step = queue.shift() ?? { close: true }
        if (step.t) clock.t += step.t
        if (step.stall === true) {
          return new Promise((resolve, reject) => {
            const onAbort = () => reject(init.signal?.reason ?? new Error("aborted"))
            if (init.signal?.aborted) onAbort()
            else init.signal?.addEventListener("abort", onAbort, { once: true })
          })
        }
        if (step.error !== undefined) {
          controller.error(new Error(step.error))
          return
        }
        if (step.chunk !== undefined) controller.enqueue(encoder.encode(step.chunk))
        else controller.close()
        return undefined
      },
    }, { highWaterMark: 0 }) // 零预取（1 read ⇔ 1 pull——注入钟与消费面逐帧对齐）
    return new Response(stream, { status, headers })
  }
}

/** 真装配的 `models` 工具面（`loopbackFor` = 真 `chatProviderOf`——假只假在探针传输）。 */
function toolsOf(f, { fetchImpl = null, now = Date.now, selfBase = { address: "127.0.0.1", port: 18799 }, loopbackFor = null } = {}) {
  return CHAT_TOOLS.createChatTools({
    db: f.db,
    log: null,
    now,
    loopbackFor: loopbackFor ?? ((ref) => CHAT.chatProviderOf({ db: f.db, ref, env: {}, log: null, senderId: f.member.id, selfBaseUrl: () => selfBase })),
    ...(fetchImpl ? { modelTestFetch: fetchImpl } : {}),
  })
}

const testCall = (tools, args) => tools.invoke("models", { op: "test", ...args }, {})

/** 工具结果 ⇒ 读数面（剔 `summary`/`subject` 两包装键——五读数逐值断言用）。 */
const readingsOf = (result) => { const { summary, subject, ...readings } = result; return readings }

const rowsOf = (db, chatId) => db.prepare("SELECT * FROM agent_chat_messages WHERE chat_id = ? ORDER BY seq").all(chatId)
const toolRows = (db, chatId, name) => rowsOf(db, chatId).filter((row) => row.role === "tool" && JSON.parse(row.data_json ?? "{}").name === name)
const agentEvents = (db, kind) => db.prepare("SELECT * FROM audit_events WHERE type = 'agent_event' ORDER BY id").all()
  .filter((row) => JSON.parse(row.detail ?? "{}").kind === kind).map((row) => ({ ...row, parsed: JSON.parse(row.detail ?? "{}") }))
const tableCounts = (db) => Object.fromEntries(["usage", "audit_events", "providers", "api_keys"].map((table) => [table, db.prepare(`SELECT COUNT(*) AS n FROM ${table}`).get().n]))

// ── 腿①：N84 正常（五读数逐值 ＋ 帧逐值 ＋ 审计）──────────────────────────────

test("腿① N84：真回合 + 假自环出口（假 fetch ∥ 注入钟）⇒ 请求形 ∥ call/result 帧 ∥ 五读数逐值 ∥ chat_call 审计", async () => {
  const f = await fixture()
  const clock = { t: 1_000_000 }
  const now = () => clock.t
  const sk = KEYS.agentKeyOf(f.db, f.member.id)
  const requests = []
  const fetchImpl = fakeLoopback({
    clock,
    onRequest: (request) => requests.push(request),
    steps: [
      { t: 10, chunk: shellFrame }, // ① 空壳块（role 声明——ttfb 不计它）
      { t: 90, chunk: contentFrame("你") }, // 首个非空内容增量 ⇒ ttfb = 100
      { t: 100, chunk: contentFrame("好") },
      { t: 0, chunk: contentFrame("！") }, // 输出 3 字
      { t: 0, chunk: usageFrame(11, 6) },
      { t: 50, chunk: DONE_FRAME }, // 流终结 ⇒ totalMs = 250；生成窗 = 150 ⇒ tps = 40
      { close: true },
    ],
  })
  const model = scriptedChat([toolTurn([{ name: "models", args: { op: "test", provider: PROVIDER, model: MODEL } }]), { content: "测好了" }])
  CHAT.claimChatTurn(f.db, f.chat.id, { now })
  const frames = []
  const result = await CHAT.runChatTurn({
    db: f.db,
    chatId: f.chat.id,
    content: "测一下 fake-model",
    emit: (frame) => frames.push(frame),
    now,
    deps: { chat: model.chat, selfBaseUrl: () => ({ address: "127.0.0.1", port: 18999 }), modelTestFetch: fetchImpl },
  })
  assert.equal(result.status, "succeeded", `回合应成功：${result.reason ?? ""}`)

  // 请求形（§7②/N84）：`POST <selfBase>/v1/chat/completions` ∥ stream:true ∥ sk 明文 Authorization
  assert.equal(requests.length, 1, "单请求（一次测试 ≠ 多请求）")
  assert.equal(requests[0].url, "http://127.0.0.1:18999/v1/chat/completions", "自环基址 + 网关端点")
  assert.equal(requests[0].init.method, "POST")
  assert.equal(requests[0].init.headers.authorization, `Bearer ${sk.plain}`, "Authorization = 管理面 sk 明文（净 v19 列）")
  assert.equal(requests[0].init.headers["content-type"], "application/json")
  assert.deepEqual(JSON.parse(requests[0].init.body), { model: EXTERNAL, messages: [{ role: "user", content: MODEL_TEST.MODEL_TEST_PROBE_TEXT }], stream: true }, "请求体 = 外标 + 探针句（缺省 ping）+ stream:true")

  // 帧逐值（N84）：`call`（args = 掩蔽 JSON 串）∥ `result`（ok + summary）
  const callFrame = frames.find((frame) => frame.type === "call")
  assert.equal(callFrame.name, "models")
  assert.deepEqual(JSON.parse(callFrame.args), { op: "test", provider: PROVIDER, model: MODEL })
  assert.equal(typeof callFrame.args, "string", "`call` 帧 args 恒为字符串")
  const resultFrame = frames.find((frame) => frame.type === "result")
  assert.equal(resultFrame.ok, true)
  assert.match(resultFrame.summary, /^模型 fake\/fake-model：正常（总 250ms ∥ 首字节 100ms ∥ 40 tok\/s ∥ 输出 3 字）$/, "人话一行（读数逐值）")

  // 五读数逐值（§12.1③ 键在场形——`error` 缺席 = deepEqual 逐键）
  const toolResult = JSON.parse(toolRows(f.db, f.chat.id, "models").at(-1).content)
  assert.equal(toolResult.subject, EXTERNAL, "subject = 对外标识（审计消费）")
  assert.equal(toolResult.summary, resultFrame.summary, "结果 summary = `result` 帧 summary（同源）")
  assert.deepEqual(readingsOf(toolResult), {
    ok: true,
    status: "ok",
    model: EXTERNAL,
    totalMs: 250,
    ttfbMs: 100,
    tps: 40,
    tokens: { promptTokens: 11, completionTokens: 6, totalTokens: 17 },
    outputChars: 3,
  })

  // 审计（§12.1④）：`chat_call` 逐调用一行 ∥ subject = 对外标识
  const call = agentEvents(f.db, "chat_call").find((row) => row.parsed.tool === "models")
  assert.ok(call, "逐调用一行")
  assert.equal(call.parsed.subject, EXTERNAL, "subject = 对外标识")
  assert.equal(call.parsed.resultCode, 0)
  assert.match(call.parsed.call, /"op":"test"/)
  assert.equal(f.db.prepare("SELECT COUNT(*) AS n FROM usage").get().n, 0, "假出口腿不经网关链 ⇒ usage 零行（真链腿另证）")
})

test("腿① 续：别名 ∥ provider 按 id 点名（外标 = 别名——请求体 model 与读数 model 同值）", async () => {
  const f = await fixture({ models: [{ name: MODEL, alias: "fast" }] })
  const clock = { t: 5_000 }
  const requests = []
  const mkFetch = () => fakeLoopback({
    clock,
    onRequest: (request) => requests.push(request),
    steps: [{ t: 5, chunk: contentFrame("好") }, { t: 5, chunk: DONE_FRAME }, { close: true }],
  })
  const byAlias = await testCall(toolsOf(f, { fetchImpl: mkFetch(), now: () => clock.t }), { provider: PROVIDER, model: "fast" })
  assert.equal(byAlias.ok, true)
  assert.equal(byAlias.model, "fast", "别名 = 对外标识（读数 model）")
  assert.equal(byAlias.subject, "fast", "审计 subject 同值")
  assert.equal(JSON.parse(requests[0].init.body).model, "fast", "请求体 model = 外标（网关链派发口径）")
  const byId = await testCall(toolsOf(f, { fetchImpl: mkFetch(), now: () => clock.t }), { provider: String(f.db.prepare("SELECT id FROM providers").get().id), model: MODEL })
  assert.equal(byId.model, "fast", "上游名点名 ⇒ 解析仍归一到外标（别名）")
  assert.equal(byId.status, "ok")
})

// ── 腿②：B80①–⑤ 边界（＋ 五支补全）──────────────────────────────────────────

test("腿② B80：① 空壳块不计 ∥ ② usage 缺 ⇒ tps:null ∥ ③ 空答 ⇒ ttfbMs:null ∥ ④ 首字节前超时 ∥ ⑤ 首内容前中断", async () => {
  const f = await fixture()
  const clockOf = (t) => { const clock = { t }; return { clock, now: () => clock.t } }

  // ① 流首空壳块 + 零内容块（`delta:{}`）不计 ttfb
  const one = clockOf(10_000)
  const t1 = toolsOf(f, { now: one.now, fetchImpl: fakeLoopback({ clock: one.clock, steps: [
    { t: 10, chunk: shellFrame }, { t: 20, chunk: emptyDeltaFrame }, { t: 70, chunk: contentFrame("好") },
    { t: 0, chunk: usageFrame(5, 6) }, { t: 40, chunk: DONE_FRAME }, { close: true },
  ] }) })
  const r1 = await testCall(t1, { provider: PROVIDER, model: MODEL })
  assert.deepEqual(readingsOf(r1), {
    ok: true, status: "ok", model: EXTERNAL, totalMs: 140, ttfbMs: 100, tps: 150, tokens: { promptTokens: 5, completionTokens: 6, totalTokens: 11 }, outputChars: 1,
  }, "① 空壳块/零内容块不计——ttfb = 首个非空内容增量（100）；tps = 6 ÷ 0.4s")
  assert.equal(r1.subject, EXTERNAL)

  // ② 流末无 usage 帧 ⇒ tps/tokens null（不估）
  const two = clockOf(20_000)
  const t2 = toolsOf(f, { now: two.now, fetchImpl: fakeLoopback({ clock: two.clock, steps: [
    { t: 50, chunk: contentFrame("你好") }, { t: 50, chunk: DONE_FRAME }, { close: true },
  ] }) })
  const r2 = await testCall(t2, { provider: PROVIDER, model: MODEL })
  assert.deepEqual(readingsOf(r2), { ok: true, status: "ok", model: EXTERNAL, totalMs: 100, ttfbMs: 50, tps: null, tokens: null, outputChars: 2 }, "② usage 缺 ⇒ tps:null（不估）")

  // ③ 空答（零内容增量）⇒ status ok + ttfbMs null
  const three = clockOf(30_000)
  const t3 = toolsOf(f, { now: three.now, fetchImpl: fakeLoopback({ clock: three.clock, steps: [
    { t: 10, chunk: shellFrame }, { t: 10, chunk: usageFrame(4, 0) }, { t: 10, chunk: DONE_FRAME }, { close: true },
  ] }) })
  const r3 = await testCall(t3, { provider: PROVIDER, model: MODEL })
  assert.deepEqual(readingsOf(r3), { ok: true, status: "ok", model: EXTERNAL, totalMs: 30, ttfbMs: null, tps: null, tokens: { promptTokens: 4, completionTokens: 0, totalTokens: 4 }, outputChars: 0 }, "③ 零内容增量亦归 ok ⇒ ttfbMs:null")

  // ④ timeoutS 小值 ⇒ 首字节前超时（phase = before_first_byte；读数零编造）
  const four = clockOf(40_000)
  const t4 = toolsOf(f, { now: four.now, fetchImpl: fakeLoopback({ clock: four.clock, steps: [{ t: 50, stall: true }] }) })
  const r4 = await testCall(t4, { provider: PROVIDER, model: MODEL, timeoutS: 0.02 })
  assert.deepEqual(readingsOf(r4), { ok: true, status: "timeout", model: EXTERNAL, totalMs: 50, ttfbMs: null, tps: null, tokens: null, outputChars: 0, phase: "before_first_byte" }, "④ 预算耗尽 ⇒ timeout（携 phase）")

  // ⑤ 首内容增量前流中断 ⇒ broken_stream（零部分读数）
  const five = clockOf(50_000)
  const t5 = toolsOf(f, { now: five.now, fetchImpl: fakeLoopback({ clock: five.clock, steps: [{ t: 30, error: "假件：连通中断" }] }) })
  const r5 = await testCall(t5, { provider: PROVIDER, model: MODEL })
  assert.deepEqual(readingsOf(r5), { ok: true, status: "broken_stream", model: EXTERNAL, totalMs: 30, ttfbMs: null, tps: null, tokens: null, outputChars: 0 }, "⑤ 首内容前中断 = broken_stream（零部分读数）")
})

test("腿② 续（§7④ 五支补全）：bad_response ∥ 生成中超时 ∥ 内容后中断（携部分读数）", async () => {
  const f = await fixture()
  const clockOf = (t) => { const clock = { t }; return { clock, now: () => clock.t } }

  // 2xx 非 SSE 形 ⇒ bad_response（原文摘录）
  const one = clockOf(60_000)
  const t1 = toolsOf(f, { now: one.now, fetchImpl: fakeLoopback({ clock: one.clock, body: '{"error":"not an sse stream"}', headers: { "content-type": "application/json" } }) })
  const r1 = await testCall(t1, { provider: PROVIDER, model: MODEL })
  assert.deepEqual(readingsOf(r1), { ok: true, status: "bad_response", model: EXTERNAL, totalMs: 0, ttfbMs: null, tps: null, tokens: null, outputChars: 0, error: '{"error":"not an sse stream"}' }, "非 SSE 形 ⇒ bad_response（error = 原文原样）")

  // 生成中超时 ⇒ phase = generating（ttfb 已得）
  const two = clockOf(70_000)
  const t2 = toolsOf(f, { now: two.now, fetchImpl: fakeLoopback({ clock: two.clock, steps: [{ t: 80, chunk: contentFrame("你好") }, { t: 20, stall: true }] }) })
  const r2 = await testCall(t2, { provider: PROVIDER, model: MODEL, timeoutS: 0.02 })
  assert.deepEqual(readingsOf(r2), { ok: true, status: "timeout", model: EXTERNAL, totalMs: 100, ttfbMs: 80, tps: null, tokens: null, outputChars: 2, phase: "generating" }, "生成中预算耗尽 ⇒ phase:generating（部分读数在场）")

  // 内容后中断 ⇒ broken_stream 携部分读数
  const three = clockOf(80_000)
  const t3 = toolsOf(f, { now: three.now, fetchImpl: fakeLoopback({ clock: three.clock, steps: [{ t: 60, chunk: contentFrame("半截") }, { t: 40, error: "假件：传输中断" }] }) })
  const r3 = await testCall(t3, { provider: PROVIDER, model: MODEL })
  assert.deepEqual(readingsOf(r3), { ok: true, status: "broken_stream", model: EXTERNAL, totalMs: 100, ttfbMs: 60, tps: null, tokens: null, outputChars: 2 }, "内容后中断 ⇒ 携部分读数（ttfb/输出在场）")
})

test("腿② 续二：`error` 帽 500 字——逾限截断加注（总长含注记 ≤ 帽）∥ 未逾限 = 原文原样零加注", async () => {
  const f = await fixture()
  const long = "x".repeat(1200)
  const short = `{"error":"${"y".repeat(300)}"}` // ≤ 500 未逾限
  const clockOf = (t) => { const clock = { t }; return { clock, now: () => clock.t } }

  // `bad_response` 径（2xx 非 SSE 形）＋ 逾限
  const one = clockOf(90_000)
  const t1 = toolsOf(f, { now: one.now, fetchImpl: fakeLoopback({ clock: one.clock, body: long, headers: { "content-type": "application/json" } }) })
  const r1 = await testCall(t1, { provider: PROVIDER, model: MODEL })
  assert.equal(r1.status, "bad_response")
  assert.equal(r1.error.length, MODEL_TEST.MODEL_TEST_ERROR_MAX, "总长含注记 ≤ 帽（恰 = 帽）")
  assert.ok(r1.error.endsWith("…（截断）"), "逾限 ⇒ 截断加注")
  assert.ok(r1.error.startsWith("xxx"), "原文首段保留（原样不重写）")

  // `http_error` 径 ＋ 逾限（共享件有界读）
  const two = clockOf(91_000)
  const t2 = toolsOf(f, { now: two.now, fetchImpl: fakeLoopback({ clock: two.clock, body: long, status: 502, headers: { "content-type": "application/json" } }) })
  const r2 = await testCall(t2, { provider: PROVIDER, model: MODEL })
  assert.equal(r2.status, "http_error")
  assert.equal(r2.error.length, MODEL_TEST.MODEL_TEST_ERROR_MAX)
  assert.ok(r2.error.endsWith("…（截断）"))

  // 未逾限 ⇒ 原文原样（零加注）
  const three = clockOf(92_000)
  const t3 = toolsOf(f, { now: three.now, fetchImpl: fakeLoopback({ clock: three.clock, body: short, status: 404, headers: { "content-type": "application/json" } }) })
  const r3 = await testCall(t3, { provider: PROVIDER, model: MODEL })
  assert.equal(r3.error, short, "未逾限 = 原文原样（trim 后逐字）")

  // SSE 累积径（2xx 流内零事件零终结 ⇒ `bad_response`；原文 = 累积文本）＋ 逾限
  const four = clockOf(93_000)
  const t4 = toolsOf(f, { now: four.now, fetchImpl: fakeLoopback({ clock: four.clock, steps: [{ t: 10, chunk: long }] }) })
  const r4 = await testCall(t4, { provider: PROVIDER, model: MODEL })
  assert.equal(r4.status, "bad_response")
  assert.equal(r4.error.length, MODEL_TEST.MODEL_TEST_ERROR_MAX)
  assert.ok(r4.error.endsWith("…（截断）"))
  // 有界读：逾读帽（>8 KiB 字节）零事件零终结 ⇒ 早退 `bad_response`（不整段缓冲——错误摘录仍 ≤ 帽）
  const five = clockOf(94_000)
  const t5 = toolsOf(f, { now: five.now, fetchImpl: fakeLoopback({ clock: five.clock, body: "z".repeat(12_000), headers: { "content-type": "application/json" } }) })
  const r5 = await testCall(t5, { provider: PROVIDER, model: MODEL })
  assert.equal(r5.status, "bad_response", "逾读帽 ⇒ 不可用（有界读——不整段缓冲）")
  assert.equal(r5.error.length, MODEL_TEST.MODEL_TEST_ERROR_MAX)
  assert.ok(r5.error.endsWith("…（截断）"))
})

// ── 腿③：E62①–⑥ 错误分类 ────────────────────────────────────────────────────

test("腿③ E62①⑥：未配/草稿值 ∥ 入参校验 ⇒ 工具级错误人话（零外呼 ∥ 库零变 ∥ 回合不停 ∥ 各落 chat_call 行）", async () => {
  const f = await fixture()
  let outbound = 0
  const fetchImpl = async () => { outbound += 1; throw new Error("不应外呼（校验腿）") }
  const model = scriptedChat([
    toolTurn([
      { name: "models", args: { op: "test", provider: PROVIDER, model: "draft-model" } }, // ① 草稿值（不在开放清单）
      { name: "models", args: { op: "test", provider: "no-such", model: MODEL } }, // ① 未配渠道
      { name: "models", args: { op: "test", provider: PROVIDER, model: MODEL, prompt: "x".repeat(MODEL_TEST.MODEL_TEST_PROMPT_MAX + 1) } }, // ⑥ prompt 逾帽
      { name: "models", args: { op: "test", provider: PROVIDER, model: MODEL, timeoutS: 0 } }, // ⑥ 非正
      { name: "models", args: { op: "test", provider: PROVIDER, model: MODEL, timeoutS: "60" } }, // ⑥ 非数
      { name: "models", args: { op: "test", provider: PROVIDER, model: MODEL, timeoutS: MODEL_TEST.MODEL_TEST_TIMEOUT_S_MAX + 1 } }, // ⑥ 越界
    ]),
    { content: "几条都拒了" },
  ])
  const before = tableCounts(f.db)
  CHAT.claimChatTurn(f.db, f.chat.id, { now: Date.now })
  const result = await CHAT.runChatTurn({
    db: f.db, chatId: f.chat.id, content: "试几个不合形", emit: null, now: Date.now,
    deps: { chat: model.chat, selfBaseUrl: () => ({ address: "127.0.0.1", port: 18999 }), modelTestFetch: fetchImpl },
  })
  assert.equal(result.status, "succeeded", "工具级错误 ⇒ 回合不停（回灌模型自纠）")
  const failures = toolRows(f.db, f.chat.id, "models").map((row) => JSON.parse(row.content))
  assert.equal(failures.length, 6)
  assert.deepEqual(failures.map((row) => row.ok), [false, false, false, false, false, false])
  assert.match(failures[0].message, /不在该 provider 的开放清单/, "① 未在开放清单 ⇒ 工具级错误")
  assert.match(failures[0].message, /Provider 页「测试连接」/, "① 划界句（草稿值不走本工具——AC-18 面）")
  assert.match(failures[1].message, /provider 不存在/)
  assert.match(failures[2].message, /prompt 超长（≤ 2000 字/)
  assert.match(failures[3].message, /timeoutS 非法/)
  assert.match(failures[4].message, /timeoutS 非法：60/, "⑥ 非数（不 Number 收编——数字串亦拒）")
  assert.match(failures[5].message, /超时上限 600 秒/)
  assert.equal(outbound, 0, "⑥ 零外呼（校验先于探针）")
  assert.equal(f.db.prepare("SELECT COUNT(*) AS n FROM usage").get().n, 0, "库零变（零用量行）")
  assert.deepEqual({ providers: tableCounts(f.db).providers, api_keys: tableCounts(f.db).api_keys }, { providers: before.providers, api_keys: before.api_keys })
  const calls = agentEvents(f.db, "chat_call").filter((row) => row.parsed.tool === "models")
  assert.equal(calls.length, 6, "各落 chat_call 行（逐调用一行）")
  assert.deepEqual([...new Set(calls.map((row) => row.parsed.resultCode))], [-1], "人话错误 ⇒ resultCode -1")
})

test("腿③ E62②③：网关 404（禁用/未配）∥ 上游 502 透视 ⇒ 读数面 http_error（HTTP 码 ＋ 原文原样）", async () => {
  const f = await fixture()
  const notFound = '{"error":{"code":"model_not_found","message":"模型 fake/fake-model 未在开放清单"}}'
  const unreachable = '{"error":{"code":"upstream_error","message":"上游不可达：connect ECONNREFUSED 127.0.0.1:9"}}'

  // ② 网关 404 —— 经回合（断言回合不停）
  const fetch404 = fakeLoopback({ body: notFound, status: 404, headers: { "content-type": "application/json" } })
  const model = scriptedChat([toolTurn([{ name: "models", args: { op: "test", provider: PROVIDER, model: MODEL } }]), { content: "看到了" }])
  CHAT.claimChatTurn(f.db, f.chat.id, { now: Date.now })
  const result = await CHAT.runChatTurn({
    db: f.db, chatId: f.chat.id, content: "测一个坏渠道", emit: null, now: Date.now,
    deps: { chat: model.chat, selfBaseUrl: () => ({ address: "127.0.0.1", port: 18999 }), modelTestFetch: fetch404 },
  })
  assert.equal(result.status, "succeeded", "② 读数面错误 ⇒ 回合不停")
  const r404 = JSON.parse(toolRows(f.db, f.chat.id, "models").at(-1).content)
  assert.deepEqual(readingsOf(r404), { ok: true, status: "http_error", model: EXTERNAL, totalMs: r404.totalMs, ttfbMs: null, tps: null, tokens: null, outputChars: 0, httpStatus: 404, error: notFound }, "② http_error：携 HTTP 码 ＋ 原文原样")
  assert.equal(r404.subject, EXTERNAL)
  assert.equal(typeof r404.totalMs, "number")
  assert.equal(agentEvents(f.db, "chat_call").filter((row) => row.parsed.tool === "models").length, 1, "② 各落 chat_call 行")
  assert.equal(f.db.prepare("SELECT COUNT(*) AS n FROM usage").get().n, 0, "假出口腿零用量行（真链腿另证）")

  // ③ 上游不可达（502 透视）—— 直接装配
  const t = toolsOf(f, { fetchImpl: fakeLoopback({ body: unreachable, status: 502, headers: { "content-type": "application/json" } }) })
  const r502 = await testCall(t, { provider: PROVIDER, model: MODEL })
  assert.equal(r502.status, "http_error")
  assert.equal(r502.httpStatus, 502)
  assert.equal(r502.error, unreachable, "原文原样（trim 后逐字一致）")
  assert.equal("phase" in r502, false, "phase 仅 timeout")
})

test("腿③ E62④⑤：sk 缺位 ∥ 自环基址缺位 ∥ 未接线（缺缝）⇒ 工具级错误人话（零外呼）", async () => {
  const noKey = await fixture({ withKey: false })
  const t1 = toolsOf(noKey)
  const r1 = await testCall(t1, { provider: PROVIDER, model: MODEL })
  assert.equal(r1.ok, false)
  assert.match(r1.message, /重新登录控制台/, "④ sk 缺位 ⇒ 人话指向重新登录")

  const f = await fixture()
  const t2 = toolsOf(f, { selfBase: null })
  const r2 = await testCall(t2, { provider: PROVIDER, model: MODEL })
  assert.equal(r2.ok, false)
  assert.match(r2.message, /自环基址缺位/, "④ 自环基址缺位（server 监听地址未就绪）")

  const t3 = CHAT_TOOLS.createChatTools({ db: f.db }) // ⑤ 未接线（缺出口装配缝）
  const r3 = await testCall(t3, { provider: PROVIDER, model: MODEL })
  assert.equal(r3.ok, false)
  assert.match(r3.message, /未接线（缺出口装配缝）/, "⑤ 缺缝 ⇒ 工具级错误人话")

  // 三形皆零外呼 + 库零变
  assert.equal(f.db.prepare("SELECT COUNT(*) AS n FROM usage").get().n, 0)
  assert.equal(tableCounts(noKey.db).usage, 0)
})

test("腿③ 续：回合中止（非超时）⇒ 探针即断 ＋ 工具级错误人话（回合随后收口 aborted）", async () => {
  const f = await fixture()
  const clock = { t: 200_000 }
  const fetchImpl = fakeLoopback({ clock, steps: [{ stall: true }] }) // 探针阻塞至中止（卡在首字节前）
  const model = scriptedChat([toolTurn([{ name: "models", args: { op: "test", provider: PROVIDER, model: MODEL } }]), { content: "不应走到这里" }])
  CHAT.claimChatTurn(f.db, f.chat.id, { now: Date.now })
  const timer = setTimeout(() => CHAT.requestChatAbort(f.chat.id), 30)
  try {
    const result = await CHAT.runChatTurn({
      db: f.db, chatId: f.chat.id, content: "测到一半中止", emit: null, now: Date.now,
      deps: { chat: model.chat, selfBaseUrl: () => ({ address: "127.0.0.1", port: 18999 }), modelTestFetch: fetchImpl },
    })
    assert.equal(result.status, "failed", "中止 ⇒ 异常收尾（既有形——KD-SV-107 第五终态）")
    assert.equal(result.reason, "已手动中止——本轮已停", "notice/end 帧人话同源")
  } finally {
    clearTimeout(timer)
  }
  const row = JSON.parse(toolRows(f.db, f.chat.id, "models").at(-1).content)
  assert.equal(row.ok, false, "工具级错误（回合不停——回灌面）")
  assert.match(row.message, /模型测试已中止（回合中止——探针已断开）/, "人话：中止即断开探针（§12.1②——`ctx.signal` 透传）")
  assert.equal(model.calls.length, 1, "中止后零第二次模型调用（检查点①即收尾）")
  const notice = rowsOf(f.db, f.chat.id).find((item) => item.role === "notice")
  assert.equal(JSON.parse(notice.data_json).reason, "aborted", "五终态之一（aborted）")
  assert.equal(CHAT.isChatAbortRequested(f.chat.id), false, "finally 清登记（零残留）")
  assert.equal(f.db.prepare("SELECT COUNT(*) AS n FROM usage").get().n, 0, "假出口腿零用量行（中止即断——未走真链）")
})

// ── 腿④：真链（真网关链 + 假上游 + 真装配）────────────────────────────────────

async function startApp({ db, config }) {
  const routes = SERVER.createRouteTable()
  GATEWAY_ROUTES.registerGatewayRoutes(routes, { db, config })
  ACCOUNT_ROUTES.registerAccountRoutes(routes, { db })
  const server = SERVER.createGatewayServer({ config, routes })
  await new Promise((resolve, reject) => { server.once("error", reject); server.listen(0, "127.0.0.1", resolve) })
  return {
    address: () => server.address(),
    async close() { server.closeAllConnections?.(); await new Promise((resolve) => server.close(resolve)) },
  }
}

const configWith = (baseURL, models = ["mock-chat"]) =>
  CONFIG.validateConfig({ host: "127.0.0.1", providers: [{ name: "mock", baseURL, apiKey: "sk-upstream", models }], embedding: { baseURL, model: "bge-m3" } })

test("腿④ 真链（§7②）：真网关链 + 假上游 + 真装配 ⇒ usage 行在场（member=发送者 ∥ key=admin-agent） ∥ chat_call 逐调用一行", async () => {
  const upstream = createHttpServer((req, res) => {
    req.on("data", () => {})
    req.on("end", () => {
      res.writeHead(200, { "content-type": "text/event-stream" })
      res.write(sse({ id: "c1", choices: [{ delta: { role: "assistant", content: "" } }] }))
      res.write(sse({ id: "c1", choices: [{ delta: { content: "probe-ok" } }] }))
      res.write(sse({ choices: [], usage: { prompt_tokens: 7, completion_tokens: 4, total_tokens: 11 } }))
      res.write(sse("[DONE]"))
      res.end()
    })
  })
  await new Promise((resolve, reject) => { upstream.once("error", reject); upstream.listen(0, "127.0.0.1", resolve) })
  const upstreamBase = `http://127.0.0.1:${upstream.address().port}/v1`

  const db = DB.openDatabase(":memory:")
  const { member } = await MEMBERS.createMember(db, { username: "admin", role: "admin", password: PASSWORD })
  seedProviderRow(db, { name: "mock", baseURL: upstreamBase, models: ["mock-chat"] })
  KEYS.ensureAgentKey(db, member.id)
  const app = await startApp({ db, config: configWith(upstreamBase) })
  const chat = CHAT.createChat(db, { model: "mock/mock-chat", createdBy: member.id })
  const model = scriptedChat([toolTurn([{ name: "models", args: { op: "test", provider: "mock", model: "mock-chat" } }]), { content: "测过了" }])
  try {
    CHAT.claimChatTurn(db, chat.id, { now: Date.now })
    const frames = []
    const result = await CHAT.runChatTurn({
      db, chatId: chat.id, content: "走一趟真链", emit: (frame) => frames.push(frame), now: Date.now,
      deps: { chat: model.chat, selfBaseUrl: () => app.address() }, // 探针走真 fetch（生产形）
    })
    assert.equal(result.status, "succeeded", `回合应成功：${result.reason ?? ""}`)
    const readings = JSON.parse(toolRows(db, chat.id, "models").at(-1).content)
    assert.equal(readings.ok, true)
    assert.equal(readings.status, "ok")
    assert.equal(readings.model, "mock/mock-chat", "读数 model = 对外标识")
    assert.deepEqual(readings.tokens, { promptTokens: 7, completionTokens: 4, totalTokens: 11 }, "tokens = 上游 usage 三值原值（链侧 include_usage 注入）")
    assert.equal(readings.outputChars, 8)
    assert.equal(Number.isFinite(readings.totalMs) && Number.isFinite(readings.ttfbMs), true, "真实钟读数在场（总耗时 ∥ 首字节）")
    assert.equal(readings.tps === null || Number.isFinite(readings.tps), true, "tps = 数 ∥ null（本地假上游亚毫秒完成 ⇒ 生成窗非正 ⇒ null——不估）")
    assert.equal("error" in readings, false)

    const usage = db.prepare("SELECT u.*, k.name AS key_name FROM usage u JOIN api_keys k ON k.id = u.key_id ORDER BY u.id DESC LIMIT 1").get()
    assert.ok(usage, "真链 ⇒ usage 行在场（走链自动记账）")
    assert.equal(usage.member_id, member.id, "归因 = 本回合发送者")
    assert.equal(usage.key_name, KEYS.AGENT_KEY_NAME, "归因 = admin-agent")
    assert.equal(usage.endpoint, "chat")
    assert.equal(usage.model, "mock-chat", "记账 model = 上游真名（网关链口径）")
    assert.equal(usage.status, "ok")
    assert.equal(usage.total_tokens, 11)

    const call = agentEvents(db, "chat_call").find((row) => row.parsed.tool === "models")
    assert.ok(call, "逐调用一行（读数面）")
    assert.equal(call.parsed.subject, "mock/mock-chat")
    assert.equal(call.parsed.resultCode, 0)
  } finally {
    await app.close()
    upstream.closeAllConnections?.()
    await new Promise((resolve) => upstream.close(resolve))
  }
})

// ── 腿⑤：结构（AC-55⑥）────────────────────────────────────────────────────────

test("腿⑤ 结构（AC-55⑥）：零新端点 ∥ 零迁移 ∥ 能力段零触 ∥ 成员面零涉 ∥ 名集八件 ∥ 三 kind 不扩", () => {
  const source = (rel) => readFileSync(join(ROOT, rel), "utf8")
  const routes = source("thincoder-server/src/agent/chat-routes.mjs")
  const chat = source("thincoder-server/src/agent/chat.mjs")
  const tools = source("thincoder-server/src/agent/chat-tools.mjs")
  const modelTest = source("thincoder-server/src/agent/model-test.mjs")

  assert.equal((routes.match(/routes\.add\(/g) ?? []).length, 6, "会话面六端点（零新端点——`models.test` 复用 `/v1/chat/completions`）")
  assert.ok(DB.SCHEMA_VERSION >= 20, `结构版本按当刻盘面（本批零迁移段——v19 key_plain 已在册为下界；现读 ${DB.SCHEMA_VERSION}）`)
  const usageColumns = DB.openDatabase(":memory:").prepare("PRAGMA table_info('usage')").all().map((column) => column.name)
  assert.ok(!usageColumns.some((name) => /ttfb|tps|latency/i.test(name)), "零迁移：usage 表零 TTFB/吞吐列（读数不落库）")
  assert.ok(!/model_test|ttfb|_tps/.test(source("thincoder-server/src/store/migrations.mjs")), "零迁移：迁移源零本批段")
  assert.deepEqual([...CHAT_TOOLS.CHAT_TOOL_NAMES], ["members", "providers", "models", "usage", "audit", "runners", "docker", "exec"], "工具名集八件不变")
  assert.deepEqual([...CHAT_TOOLS.CHAT_TOOL_OPS.models], ["list", "enable", "disable", "settings", "alias", "test"], "`models` 动词 +1（`test`）")

  const kinds = new Set([...`${chat}\n${routes}`.matchAll(/kind: "(chat_[a-z_]+)"/g)].map((match) => match[1]))
  assert.deepEqual([...kinds].sort(), ["chat_call", "chat_start", "chat_stop"], "三 kind 不扩（零新审计 kind）")
  assert.ok(!modelTest.includes("recordAudit"), "零新审计型（执行器不写审计——KD-SV-91 面不扩）")
  assert.ok(!/member-(routes|cred|pull|relay|face)/.test(`${modelTest}\n${tools}`), "成员面零涉（零壳件引用）")

  // 能力段零触（`chat-env.mjs` 本批零改——对位断言：注册工具名逐件在场；能力段不含对位要求外的改动）
  const tokens = new Set(CHAT_ENV.CHAT_LIMITS_BLOCK.split(/[^\w]+/).filter((token) => token !== ""))
  for (const name of CHAT_TOOLS.CHAT_TOOL_NAMES) assert.ok(tokens.has(name), `能力段应列工具名：${name}`)
  assert.ok(CHAT_ENV.CHAT_LIMITS_BLOCK.includes("models ∥"), "管理族句含 models（零触——既有字面）")
  const envSource = source("thincoder-server/src/agent/chat-env.mjs")
  assert.ok(!envSource.includes("models.test"), "能力段未添模型测试专句（§6 本批块：能力段零触）")

  // 执行器常量与读数面（§12.1①③——值源单点）
  assert.deepEqual([...MODEL_TEST.MODEL_TEST_STATUSES], ["ok", "timeout", "http_error", "bad_response", "broken_stream"])
  assert.equal(MODEL_TEST.MODEL_TEST_PROBE_TEXT, "ping", "内置探针句（沿向量探针同字面）")
  assert.equal(MODEL_TEST.MODEL_TEST_TIMEOUT_S, 60)
  assert.equal(MODEL_TEST.MODEL_TEST_TIMEOUT_S_MAX, 600)
  assert.equal(MODEL_TEST.MODEL_TEST_PROMPT_MAX, 2000)
  assert.ok(modelTest.includes("readBodyExcerpt"), "摘录共用件 = `gateway/forward.mjs` 共享件（两调用点单源）")
  const forward = source("thincoder-server/src/gateway/forward.mjs")
  assert.ok(forward.includes("export async function readBodyExcerpt"), "共享件导出在位")
  assert.ok(source("thincoder-server/src/gateway/embedding-admin.mjs").includes("readBodyExcerpt("), "向量探活改引共享件（本档 `textExcerpt` 删）")
  assert.ok(!source("thincoder-server/src/gateway/embedding-admin.mjs").includes("async function textExcerpt"), "本档副本删净")
})
