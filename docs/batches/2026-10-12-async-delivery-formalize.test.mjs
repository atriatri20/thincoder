/**
 * 2026-10-12-async-delivery-formalize.test.mjs — 批内件（异步投递定形批 · 台账 #1334 · 实施轮）。
 * 任务书 = `docs/batches/2026-10-12-async-delivery-formalize.md` §2；判据单源 = 设计档 §6.34
 * （`docs/core/design/AGENT-LOOP-ASYNC-POOL.md`）。用例 = §6.34.6 T-AD1–T-AD8。
 * 平 node 直驱（核侧全真件）：投递面 = `beginRun`（run-start）∥ drain 门 = turn-loop ∥ timer 门 =
 * `injectPostTurn`；模型面 = `globalThis.fetch` 桩（SSE 字节）⇒ 零网络 / 零真实等待。
 * 两时点：步边界 = 用户排队消息独占（`consumeQueuedInput`）∥ 主会话空闲面 = 其余全部（交付轮轮首）。
 * 观察面 = `onAgentTurn`（每轮轮首快照——编号为 1-based 帧号 `turnFrame`，§6.2）。
 * 跑法（仓根 `thincoder/`）：node --test docs/batches/2026-10-12-async-delivery-formalize.test.mjs
 * 先红后绿：T-AD1（次步零注子上行）∥ T-AD2（用户回合零投递）∥ T-AD6（在飞期到期零注入）三腿在改前码
 * 上给出红读（读数 = 批档 §5）；T-AD5 ∥ T-AD7 ∥ T-AD8 = 回退 / 竞态负控（改前改后同绿）。
 */
import test from "node:test"
import assert from "node:assert/strict"
import { resolve } from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"

const ROOT = fileURLToPath(new URL("../../", import.meta.url)) // 仓根（thincoder/）
const mod = (rel) => import(pathToFileURL(resolve(ROOT, rel)).href)

const CORE = await mod("thincoder-core/agent.mjs") // runAgent / createAgent
const SUSP = await mod("thincoder-core/agent/suspension.mjs") // startSuspension（挂起窗）
const POST = await mod("thincoder-core/agent/post-turn.mjs") // injectPostTurn（timer 门单点）
const PARENT = await mod("thincoder-core/agent-tools/parent-channel.mjs") // pushChildUpstream
const TIMERS = await mod("thincoder-core/agent/timers.mjs") // fireTimerWake / deliverExpiredTimers / timerWakeEnabled

/* ── 夹具：真 agent / SSE 桩 / 回合直驱 ── */

const mkAgent = (over = {}) => {
  const { tools = [], ...rest } = over
  return Object.assign(
    CORE.createAgent({
      provider: { name: "harness", model: "harness-model", apiKey: "k", baseURL: "http://127.0.0.1:1/v1" },
      tools, config: { agent: {}, traces: { enabled: false } }, cwd: ROOT, memory: null, history: [],
    }),
    { _pendingAsyncResults: [] },
    rest,
  )
}

/** 待消化条目（settle 后形——`report`/`childAgent` 双持：销账时才全释）。 */
const entry = (id, over = {}) => ({ id, role: "subagent", done: true, status: "done", report: `report-${id}`, childAgent: { fake: id }, ...over })

const enc = new TextEncoder()
const sseResponse = (text) => ({
  ok: true, status: 200, headers: new Headers({ "content-type": "text/event-stream" }),
  body: new ReadableStream({ start(c) { c.enqueue(enc.encode(text)); c.close() } }),
  text: async () => "", json: async () => ({}),
})
/** 回合 SSE：`content` 空串 ⇒ 空响应推回支（核内既有 `continue` 臂 ⇒ 同 run 次步——步边界观察点）。 */
const turnSSE = (content) =>
  `data: ${JSON.stringify({ choices: [{ delta: { content } }] })}\n\n` +
  `data: ${JSON.stringify({ choices: [{ delta: {}, finish_reason: "stop" }], usage: { prompt_tokens: 9, completion_tokens: 4, total_tokens: 13 } })}\n\n` +
  `data: [DONE]\n\n`

/** fetch 桩（响应队列——中途耗尽 = 显式炸，不静默空转）。 */
async function withFetch(responses, fn) {
  const real = globalThis.fetch
  const queue = [...responses]
  const calls = []
  globalThis.fetch = async (url) => {
    calls.push(String(url))
    const next = queue.shift()
    if (next === undefined) throw new Error(`fetch stub exhausted (call #${calls.length})`)
    return next
  }
  try { return await fn(calls) } finally { globalThis.fetch = real }
}

/** 回合直驱（`steps` = 内容串 ∥ 原始 SSE 串；`onAgentTurn` 每轮轮首快照 ⇒ 步边界观察面；`callbacks` 携批内钩子）。 */
async function runTurn(agent, { input = "", steps = [""], opts = {}, callbacks = {} } = {}) {
  const rec = { snapshots: [], out: null }
  rec.out = await withFetch(steps.map((c) => sseResponse(String(c).startsWith("data:") ? c : turnSSE(c))), () => CORE.runAgent(agent, input, {
    onAgentTurn: (turn) => { rec.snapshots.push({ turn, lines: agent.history.map((m) => String(m.content)) }); callbacks.onAgentTurn?.(turn, rec) },
  }, opts))
  return rec
}

const countIn = (agent, needle) => agent.history.filter((m) => String(m.content).includes(needle)).length
/** 轮首快照计数（快照缺该轮 ⇒ -1——分母可辨）。 */
const countAt = (rec, turn, needle) => rec.snapshots.find((s) => s.turn === turn)?.lines.filter((c) => c.includes(needle)).length ?? -1
const NOTE = (from) => `[System reminder: in-flight message from your subagent ${from}` // 子上行合并头（逐字前缀）
const ASYNC = (id) => `async subagent #${id} ` // 结算族注入头（逐字前缀）
const TIMER_LINE = (msg) => `[System reminder: ⏰ timer — ${msg}]` // timer 注入逐字形态（单源）
const REQ_PREFIX = "[System reminder: digest accounting"
const USER_MARK = "排队消息·步边界" // 用户排队消息内容标记（`consumeQueuedInput` 注入面）

/** 工具轮夹具（`injectPostTurn` 仅在工具执行轮跑——timer 门观察面）。 */
const toolRoundSSE = (content) =>
  `data: ${JSON.stringify({ choices: [{ delta: { content } }] })}\n\n` +
  `data: ${JSON.stringify({ choices: [{ delta: { tool_calls: [{ index: 0, id: "call_1", type: "function", function: { name: "ad_probe", arguments: "{}" } }] }, finish_reason: "tool_calls" }], usage: { prompt_tokens: 9, completion_tokens: 4, total_tokens: 13 } })}\n\n` +
  `data: [DONE]\n\n`
const PROBE_TOOL = { name: "ad_probe", description: "批内件探针工具（零副作用）", parameters: { type: "object", properties: {} }, execute: async () => "ok" }

/* ── T-AD1 · 对照①·步边界不投子上行（先红后绿）── */
test("T-AD1 · 步边界不投子上行：次步零注入 ∧ 交付轮轮首恰一批 + 队列清零", async () => {
  const agent = mkAgent()
  agent._asyncSubagents = new Map([["901", { id: "901", role: "subagent", status: "running" }]]) // 池 live ⇒ 入窗
  agent._pendingTimers = [{ id: "t9", expiresAt: Date.now() - 1, message: "开轮源·timer" }] // 交付轮开轮源（假钟：窗内到期 ⇒ 即时兑现）
  const queue = [USER_MARK]
  const picked = []
  const rounds = []
  const handle = SUSP.startSuspension({
    carrier: agent,
    inputQueue: ["用户回合·两题"], // 宿主既有队列同数组（核增补 C）——用户回合先跑
    runTurn: async (item, opts = {}) => {
      rounds.push({ autoTurn: opts.autoTurn === true, timerTurn: opts.timerTurn === true })
      if (opts.autoTurn === true) { // 交付轮（timer 轮）：轮首 drain
        const rec = await runTurn(agent, { steps: ["交付轮作答"], opts: { suspDriven: true, ...opts } })
        assert.equal(countIn(agent, NOTE("child#1")), 1, "交付轮轮首恰注入一批")
        assert.equal(agent._childUpstream.length, 0, "轮首 drain ⇒ 队列清零")
        assert.equal(rec.snapshots.length, 1, "交付轮恰一模型步")
        agent._asyncSubagents = new Map() // 池退 ⇒ 窗自然退出
      } else { // 用户回合（≥2 步：步 1 空响应推回臂 ⇒ 同 run 步 2）
        await runTurn(agent, {
          input: String(item),
          steps: ["", "作答"],
          opts: {
            suspDriven: true, autoTurn: false,
            consumeQueuedInput: () => { const t = queue.shift(); if (t !== undefined) { picked.push(t); agent.history.push({ role: "user", content: t }) } },
          },
          callbacks: { onAgentTurn: (turn, rec) => { if (turn === 2) { // 首步后
            PARENT.pushChildUpstream({ parent: agent, from: "child#1", kind: "note", message: "只是知会" })
            assert.equal(agent._childUpstream.length, 1, "次步起跑前：队列仍 1 条")
            assert.equal(countAt(rec, 2, NOTE("child#1")), 0, "次步起跑前：history 零注入")
          } } },
        })
        assert.equal(agent._childUpstream.length, 1, "用户回合结束：note 未 drain（次步零注入——先红后绿）")
        assert.equal(countIn(agent, NOTE("child#1")), 0, "用户回合 history 零子上行注入")
      }
    },
    timerFace: { // 窗内第三兑现态（既有面——§6.30.10）
      deadline: () => TIMERS.pendingTimerDeadline(agent),
      deliver: () => TIMERS.deliverExpiredTimers(agent).length > 0,
    },
    injectResidual: async () => {},
  })
  const res = await handle.done

  assert.equal(res.reason, "idle", "窗自然退出（池退）")
  assert.deepEqual(rounds.map((r) => [r.autoTurn, r.timerTurn]), [[false, false], [true, true]], "先用户回合后交付轮（timer 轮）")
  assert.equal(agent._childUpstream.length, 0, "交付轮轮首 drain ⇒ 队列清零")
  assert.equal(countIn(agent, NOTE("child#1")), 1, "轮首恰注入一批（全 run 计）")
  assert.deepEqual(picked, [USER_MARK], "步边界投递 = 用户排队消息独占（恰一条）")
  assert.equal(countIn(agent, TIMER_LINE("开轮源·timer")), 1, "timer 交付（开轮源）恰一次")
})

/* ── T-AD2 · 对照②·空闲才投结算件（先红后绿）── */
test("T-AD2 · 空闲才投结算件：用户回合零注入/留容器 ⇒ 系统轮恰一次 + `_daDelivered`", async () => {
  const agent = mkAgent({ _daSession: true })
  const e = entry(201)
  agent._pendingAsyncResults = [e]

  const first = await runTurn(agent, { input: "用户回合", steps: ["作答"], opts: { suspDriven: true, autoTurn: false } })
  assert.equal(countAt(first, 1, ASYNC("201")), 0, "用户回合起跑窗零注入（首投门收窄）")
  assert.equal(e._daDelivered, undefined, "投递账未置（留容器待交付轮）")
  assert.equal(agent._pendingAsyncResults.length, 1, "留容器")

  const second = await runTurn(agent, { steps: ["系统轮起跑"], opts: { suspDriven: true, autoTurn: true } })
  assert.equal(countAt(second, 1, ASYNC("201")), 1, "系统轮恰注入一次")
  assert.equal(e._daDelivered, true, "`_daDelivered=true`（投递 ≠ 销账）")
  assert.equal(agent._pendingAsyncResults.length, 1, "留容器（销账归消化轮收尾）")
  assert.equal(e.childAgent, null, "注入后仅释放 `childAgent`（`report` 保留至销账）")
  assert.equal(e.report, "report-201", "`report` 保留")
})

/* ── T-AD3 · 正常·空闲面正径（挂起窗 ⇒ 交付轮）── */
test("T-AD3 · 空闲面正径：挂起窗正径 ⇒ 交付轮轮首注入恰一次", async () => {
  const agent = mkAgent()
  const e = entry(301)
  agent._pendingAsyncResults = [e]
  const rounds = []
  const handle = SUSP.startSuspension({
    carrier: agent,
    runTurn: async (item, opts = {}) => {
      rounds.push({ item: String(item), autoTurn: opts.autoTurn === true, session: agent._daSession === true })
      if (opts.autoTurn === true) { // 交付轮：轮首注入（同 run-start 单点）
        const rec = await runTurn(agent, { steps: ["交付轮作答"], opts: { suspDriven: true, ...opts } })
        assert.equal(countAt(rec, 1, ASYNC("301")), 1, "窗径轮首注入恰一次")
        assert.equal(agent._daSession, true, "窗期会话标记在位")
        assert.equal(e._daDelivered, true, "走会话态支（投递账置位）")
        assert.equal(agent._pendingAsyncResults.length, 1, "留容器（投递 ≠ 销账）")
        agent._pendingAsyncResults = [] // 模拟消化轮收尾销账（窗自然退）
      }
    },
    injectResidual: async () => {},
  })
  const res = await handle.done

  assert.equal(res.reason, "idle", "窗自然退出（交付后 pending 空）")
  assert.equal(rounds.length, 1, "恰开一个交付轮（挂起窗面）")
  assert.equal(rounds[0].autoTurn, true, "交付轮 = 系统轮")
  assert.equal(rounds[0].session, true, "交付轮在窗期（会话态支）")
})

/* ── T-AD4 · 边界·投递后销账关系（§6.31 全保）── */
test("T-AD4 · 投递后销账关系：交付轮投递不销账 ⇒ 消化轮覆盖才离容器", async () => {
  const agent = mkAgent({ _daSession: true })
  const e = entry(401)
  agent._pendingAsyncResults = [e]

  const first = await runTurn(agent, { steps: ["交付轮作答"], opts: { suspDriven: true, autoTurn: true } })
  assert.equal(countAt(first, 1, ASYNC("401")), 1, "交付轮轮首投递")
  assert.equal(countAt(first, 1, REQ_PREFIX), 1, "投递轮账目要求行在（清单 = 本投递条）")
  assert.equal(e._daDelivered, true, "交付轮已投")
  assert.equal(agent._pendingAsyncResults.length, 1, "投递 ≠ 销账（条留容器）")

  const before = countIn(agent, REQ_PREFIX)
  const injected = countIn(agent, ASYNC("401"))
  await runTurn(agent, { steps: ["上行唤醒轮作答"], opts: { suspDriven: true, autoTurn: true, upstreamTurn: true } })
  assert.equal(countIn(agent, ASYNC("401")) - injected, 0, "非消化系统轮零重投（重投仅消化轮）")
  assert.equal(agent._pendingAsyncResults.length, 1, "未覆盖条留容器（零误销账）")

  const digest = await runTurn(agent, { steps: ["[digest-ack #401] digested — 已处理"], opts: { suspDriven: true, autoTurn: true } })
  assert.equal(agent._pendingAsyncResults.length, 0, "覆盖 ⇒ 离容器销账")
  assert.equal(e.report, null, "销账释放 `report`")
  assert.equal(countAt(digest, 1, ASYNC("401")), 2, "未销账条重投（第 2 投——账目回路）")
  assert.equal(countIn(agent, REQ_PREFIX) - before, 1, "消化轮账目要求行恰一条")
  assert.ok(agent.history.some((m) => String(m.content).startsWith(REQ_PREFIX) && String(m.content).includes("#401")), "要求行清单 = 未销账 id")
})

/* ── T-AD5 · 边界·竞态（先到先得——不打断）── */
test("T-AD5 · 竞态：交付轮零中断；用户输入入队恰一条 ⇒ 轮后消费（零重排/零丢）", async () => {
  const agent = mkAgent({ _pendingAsyncResults: [entry(501)] })
  const runs = []
  const handle = SUSP.startSuspension({
    carrier: agent,
    runTurn: async (item, opts = {}) => {
      runs.push({ item: String(item), autoTurn: opts.autoTurn === true })
      if (opts.autoTurn === true) {
        await runTurn(agent, { steps: ["交付轮作答"], opts: { suspDriven: true, ...opts } })
        agent._pendingAsyncResults = [] // 交付轮后 pending 空 ⇒ 下一循环消费用户输入
      } else {
        await runTurn(agent, { input: String(item), steps: ["用户作答"], opts: { suspDriven: true, autoTurn: false } })
      }
    },
    injectResidual: async () => {},
  })
  handle.pushInput("排队甲") // 判定后到达（窗入队——不打断交付轮）
  await handle.done

  assert.deepEqual(runs.map((r) => r.autoTurn), [true, false], "先到先得：交付轮先跑、用户回合轮后消费（不打断）")
  assert.equal(runs[1].item, "排队甲", "零重排（队列序原样）")
  assert.equal(countIn(agent, "排队甲"), 1, "零丢弃（恰一条）")
})

/* ── T-AD6 · 边界·timer 在飞改法（先红后绿）── */
test("T-AD6 · timer 在飞：工具轮收尾零注入/在途不动 ⇒ 链尾空闲交付恰一次 + timer 轮恰一次", async () => {
  const agent = mkAgent({ tools: [PROBE_TOOL], config: { agent: { timerWake: true }, traces: { enabled: false } } })
  agent._pendingTimers = [{ id: "t1", expiresAt: Date.now() - 1, message: "到期件" }]
  assert.equal(TIMERS.timerWakeEnabled(agent), true, "开关开（门件在位）")

  // 单点直驱 + 回合贯通（工具轮——`injectPostTurn` 唯一调用面）：驱动面 ∧ 开关开 ⇒ 收尾门跳过
  POST.injectPostTurn(agent, [], [], {}, 0, { suspDriven: true })
  assert.equal(countIn(agent, TIMER_LINE("到期件")), 0, "单点：零注入")
  assert.equal(agent._pendingTimers.length, 1, "单点：到期件留在途零出列")

  await runTurn(agent, { input: "两题", steps: [toolRoundSSE("取件"), "作答"], opts: { suspDriven: true, autoTurn: false } })
  assert.equal(countIn(agent, TIMER_LINE("到期件")), 0, "回合贯通：工具轮收尾零注入（驱动面 ⇒ 交空闲面）")
  assert.equal(agent._pendingTimers.length, 1, "回合贯通：在途不动")

  let fired = 0
  const delivered = await TIMERS.fireTimerWake({
    busy: false, // 链尾空闲（空闲面判据）
    deliver: () => { fired += 1; return TIMERS.deliverExpiredTimers(agent).length > 0 },
    openTurn: async () => { await runTurn(agent, { steps: ["timer 轮作答"], opts: { suspDriven: true, autoTurn: true, timerTurn: true } }) },
  })

  assert.equal(delivered, true, "空闲 ⇒ 交付真 ⇒ 开轮")
  assert.equal(fired, 1, "交付恰一次")
  assert.equal(countIn(agent, TIMER_LINE("到期件")), 1, "投递恰一次（逐字形态不变）")
  assert.equal(agent._pendingTimers.length, 0, "出列幂等（零重复投递）")
})

/* ── T-AD7 · 边界·timer 回退（开关关 ⇒ 逐字保持）── */
test("T-AD7 · timer 回退：`timerWake:false` ⇒ 工具轮收尾注入逐字保持", async () => {
  const agent = mkAgent({ tools: [PROBE_TOOL], config: { agent: { timerWake: false }, traces: { enabled: false } } })
  agent._pendingTimers = [{ id: "t2", expiresAt: Date.now() - 1, message: "回退件" }]

  POST.injectPostTurn(agent, [], [], {}, 0, { suspDriven: true })
  assert.equal(countIn(agent, TIMER_LINE("回退件")), 1, "单点：开关关 ⇒ 注入保持（逐字）")
  assert.equal(agent._pendingTimers.length, 0, "单点：到期即消费")

  agent._pendingTimers = [{ id: "t2b", expiresAt: Date.now() - 1, message: "回退件·贯通" }]
  await runTurn(agent, { input: "两题", steps: [toolRoundSSE("取件"), "作答"], opts: { suspDriven: true, autoTurn: false } })
  assert.equal(countIn(agent, TIMER_LINE("回退件·贯通")), 1, "回合贯通：回合边界投递保持")
  assert.equal(agent._pendingTimers.length, 0, "到期即消费（出列）")
})

/* ── T-AD8 · 回归·回退面零变（负控）── */
test("T-AD8 · 回退面（`suspDriven:false`）：四条投递点逐条保持", async () => {
  const agent = mkAgent({ tools: [PROBE_TOOL] })
  agent._pendingAsyncResults = [entry(801)] // ① run-start 取尽注入
  agent._pendingTimers = [{ id: "t8", expiresAt: Date.now() - 1, message: "回退 timer" }] // ④ post-turn 注入
  agent._asyncSubagents = new Map([["802", { id: "802", role: "subagent", done: true, status: "done", report: "report-802" }]]) // ② 回合尾 collect

  const rec = await runTurn(agent, {
    input: "回退面两题",
    steps: [toolRoundSSE("取件"), "作答"],
    opts: {}, // suspDriven 缺省 false
    callbacks: { onAgentTurn: (turn) => { if (turn === 1) PARENT.pushChildUpstream({ parent: agent, from: "child#8", kind: "note", message: "回退知会" }) } },
  })

  assert.equal(countAt(rec, 1, ASYNC("801")), 1, "① run-start 取尽注入保持")
  assert.equal(countIn(agent, NOTE("child#8")), 1, "③ 每步 drain 保持（回退面零收窄）")
  assert.equal(countIn(agent, ASYNC("802")), 1, "② 回合尾 `collectSettledAsync` 保持")
  assert.equal(countIn(agent, TIMER_LINE("回退 timer")), 1, "④ 工具轮收尾 timer 注入保持（回退面）")
  assert.equal(agent._pendingTimers.length, 0, "④ 到期即消费（出列）")
  assert.equal(agent._pendingAsyncResults.length, 0, "取尽语义保持（splice 先离容）")
  assert.equal(agent._asyncSubagents.size, 0, "回合尾收集离池")
})
