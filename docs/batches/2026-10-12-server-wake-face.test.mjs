/**
 * 2026-10-12-server-wake-face.test.mjs — thincoder-server 批内单测件（`server-wake-face` 批 · 唤醒与投递面 ∥ `read_history` ∥
 * 模型出口改道；名随批档 · 住 `docs/batches/` · 随批留存 · 不入任何门）。
 * 运行（自 `thincoder/` 仓根）：`node --test docs/batches/2026-10-12-server-wake-face.test.mjs`
 *
 * 射程（判据源 = 批档 §2.9 ∥ `docs/server/design/agent/ADMIN-AGENT.md` §15.4 四腿 ＋ §16.4 五腿 ∥ §8 N74–N78 ∥ B72–B75 ∥ E56–E58）：
 *   腿① 唤醒链：到期 ⇒ 送达行**落库**（`user` + `data.kind="reminder"`）＋ 自动开一轮（域文本 = 核常量逐字）∥ 出列幂等 ∥
 *         未到期零行零轮 ∥ 撞忙零动作 ∥ E56 会话行读败视忙 ∥ 闩到点（假闩注入——同源核 `createTimerWatch`）
 *   腿② 异步链：`bash.async` 回执逐字（核件原文）∥ 结算 ⇒ 摘要行落库（核件原文前缀）＋ 结算钩子自持再武装 ∥ 帽 4 ∥ `process kill id` 两态
 *   腿③ 中止面：非 interrupt 中止 ⇒ 杀树 + 丢弃提醒入汇 + 墓碑 ⇒ 零摘要投递（次条起跑投递该提醒行）
 *   腿④ 结构面：六端点计数不变 ∥ 三 kind 不扩 ∥ `chat-wake.mjs` 源零 `setInterval` ∥ 导入面（核 `timers.mjs` 三件同源 ＋ 导入指断言）
 *   腿⑤ 出口链（修订轮）：登录发面（N77）∥ 出口入参（`selfBase` + sk 明文 + 外标——不携 provider 凭据）∥ 全链出账（N78）∥ E58 失败面
 *   腿⑥ 历史面（N76 ∥ B75）：逐过滤形 ∥ `ts` = `created_at` 毫秒 ∥ `path` 拒 ∥ 审计 `subject` = 过滤摘要
 *   腿⑦ 结构续（§16.4⑤）：核件 `read-history.mjs` 零改 ∥ 八件（六族）∥ 能力段对位 ∥ v19 列在册
 * 载体 = `node --test`（假模型出口 ∥ 内存真 db ∥ **真核件**——`thincoder-core/*` 仓内直引经注入口；动载不可用面 = 注入口替身）。
 */
import test from "node:test"
import assert from "node:assert/strict"
import { existsSync, mkdirSync, mkdtempSync, readFileSync } from "node:fs"
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
const CHAT_WAKE = await load("thincoder-server/src/agent/chat-wake.mjs")
const CHAT_ENV = await load("thincoder-server/src/agent/chat-env.mjs")
const CHAT_ENV_TOOLS = await load("thincoder-server/src/agent/chat-env-tools.mjs")

// 核真件注入口（§14.2——仓内直引）
const CORE_OPS = await load("thincoder-core/tools/ops.mjs")
const CORE_TIMER = await load("thincoder-core/agent-tools/timer.mjs")
const CORE_SEARCH = await load("thincoder-core/tools/search.mjs")
const CORE_FILE = await load("thincoder-core/tools/file.mjs")
const CORE_BASH = await load("thincoder-core/tools/bash.mjs")
const CORE_SHARED = await load("thincoder-core/tools/shared.mjs")
const CORE_TIMERS = await load("thincoder-core/agent/timers.mjs")
const CORE_READ_HISTORY = await load("thincoder-core/agent-tools/read-history.mjs")
const CORE_BASH_ASYNC = await load("thincoder-core/agent-tools/bash-async.mjs")
const CORE_SETTLE = await load("thincoder-core/agent-tools/async-settle.mjs")
const CORE_DISCARD = await load("thincoder-core/agent-tools/async-discard.mjs")
const CORE_HELPERS = await load("thincoder-core/agent/helpers.mjs")
const CORE_CHAT = (await load("thincoder-core/provider/index.mjs")).chat

const CORE_TOOLS = Object.freeze({
  getCurrentTimeTool: CORE_OPS.getCurrentTimeTool,
  processTool: CORE_OPS.processTool,
  timerTool: CORE_TIMER.timerTool,
  lsTool: CORE_SEARCH.lsTool,
  readTool: CORE_FILE.readTool,
  grepTool: CORE_SEARCH.grepTool,
  bashTool: CORE_BASH.bashTool,
  readHistoryTool: CORE_READ_HISTORY.readHistoryTool,
  toOpenAISchema: CORE_SHARED.toOpenAISchema,
  deliverExpiredTimers: CORE_TIMERS.deliverExpiredTimers,
  injectBgResult: CORE_BASH_ASYNC.injectBgResult,
  writeTombstone: CORE_SETTLE.writeTombstone,
  discardAbortedBgTasks: CORE_DISCARD.discardAbortedBgTasks,
})
const CORE_DOMAINS = Object.freeze({ TIMER_TURN_DOMAIN: CORE_HELPERS.TIMER_TURN_DOMAIN, AUTO_TURN_DIGEST_DOMAIN: CORE_HELPERS.AUTO_TURN_DIGEST_DOMAIN })

const PASSWORD = "password-123"
const MODEL = "fake/fake-model"
const tempRoot = mkdtempSync(join(tmpdir(), "tc-wake-"))
const BG_LOG_DIR = join(tempRoot, "tool-results")
mkdirSync(BG_LOG_DIR, { recursive: true })
CORE_BASH_ASYNC._setBgTaskLogDirForTest(BG_LOG_DIR) // 后台任务日志落临时目录（生产 = 核数据目录）

// ── 假件与夹具 ────────────────────────────────────────────────────────────────

/** 假模型：脚本回合（`{ content?, toolCalls?, deltas? }`；用尽 ⇒ 恒末回合；函数形 ⇒ 逐回合算）。 */
function scriptedChat(turns = []) {
  const state = { i: 0, turns: turns.length > 0 ? turns : [{ content: "（假模型）收到" }] }
  const calls = []
  const chat = async ({ messages, onToken }) => {
    calls.push(JSON.parse(JSON.stringify(messages)))
    const index = Math.min(state.i, state.turns.length - 1)
    const spec = typeof state.turns[index] === "function" ? await state.turns[index]() : state.turns[index]
    state.i += 1
    if (spec?.deltas) for (const piece of spec.deltas) onToken?.(piece)
    return { content: spec?.content ?? "", toolCalls: spec?.toolCalls ?? [] }
  }
  return { chat, calls, setTurns: (next) => { state.turns = next; state.i = 0 } }
}

const toolTurn = (calls) => ({
  content: "",
  toolCalls: calls.map((call, index) => ({ id: `call-${index}-${call.name}`, name: call.name, arguments: JSON.stringify(call.args) })),
})

/** 假闩（核 `createTimerWatch` 的 `timer`/`clear` 注入缝）：捕获武装、可手工到点（假钟——免墙钟 flake）。 */
function fakeLatch() {
  const handles = []
  return {
    handles,
    timer: (fn, ms) => { const handle = { fn, ms, cleared: false, unref() {} }; handles.push(handle); return handle },
    clear: (handle) => { if (handle) handle.cleared = true },
    armed: () => handles.filter((h) => !h.cleared).at(-1) ?? null,
  }
}

function seedProviderRow(db, { name = "fake", baseURL = "http://127.0.0.1:9/v1", models = ["fake-model"] } = {}) {
  const ts = new Date().toISOString()
  db.prepare("INSERT INTO providers (name, base_url, api_key, models_json, created_at, updated_at) VALUES (?,?,?,?,?,?)")
    .run(name, baseURL, "sk-upstream-test", JSON.stringify(models), ts, ts)
}

/** 唤醒面夹具：内存真 db（admin 成员 ∥ provider 行 ∥ `admin-agent` sk）+ 会话 + 假模型 + 真核工具面 + 假闩。
 *  垫片表与闩表均按会话 id 键（模块级）：内存库的 id 每库重起 1 ⇒ 每夹具先占位（`fixtureSeq-1` 条占位会话）
 *  令真会话 id 全文件唯一——垫片与闩不再跨夹具复用（各夹具建后仍**先清零**——兜底 id 复用面）。 */
let fixtureSeq = 0
async function wakeFixture({ seedKey = true } = {}) {
  const db = DB.openDatabase(":memory:")
  const { member } = await MEMBERS.createMember(db, { username: "admin", role: "admin", password: PASSWORD })
  seedProviderRow(db)
  if (seedKey) KEYS.ensureAgentKey(db, member.id)
  fixtureSeq += 1
  for (let i = 1; i < fixtureSeq; i++) CHAT.createChat(db, { model: MODEL, createdBy: member.id }) // 占位会话（垫片与闩隔离——见上）
  const chat = CHAT.createChat(db, { model: MODEL, createdBy: member.id })
  const cwd = mkdtempSync(join(tempRoot, "cwd-"))
  const latch = fakeLatch()
  const model = scriptedChat()
  const pad = CHAT_ENV_TOOLS.timerPadOf(chat.id)
  pad._pendingTimers = []
  pad.history = []
  pad._bgTasks = new Map()
  pad._pendingAsyncResults = []
  pad._asyncWaiters = []
  pad._asyncTombstones = new Map()
  pad._recordStore = null
  const deps = { chat: model.chat, coreTools: CORE_TOOLS, coreTimers: CORE_TIMERS, coreDomains: CORE_DOMAINS, cwd, config: {}, wakeTimer: latch.timer, wakeClear: latch.clear, log: null }
  return {
    db, member, chat, cwd, latch, model, deps, pad,
    rows: () => db.prepare("SELECT * FROM agent_chat_messages WHERE chat_id = ? ORDER BY seq").all(chat.id),
    agentEvent: (kind) => db.prepare("SELECT * FROM audit_events WHERE type = 'agent_event' ORDER BY id").all()
      .filter((row) => JSON.parse(row.detail ?? "{}").kind === kind).map((row) => ({ ...row, parsed: JSON.parse(row.detail ?? "{}") })),
    run: async (content, { turns = null, emit = null, deps: extra = {} } = {}) => {
      if (turns !== null) model.setTurns(turns)
      const frames = []
      CHAT.claimChatTurn(db, chat.id, { now: Date.now })
      const result = await CHAT.runChatTurn({
        db, chatId: chat.id, content, emit: (frame) => { frames.push(frame); emit?.(frame) }, now: Date.now,
        deps: { ...deps, ...extra },
      })
      return { result, frames }
    },
  }
}

async function waitFor(predicate, { timeoutMs = 15000, intervalMs = 20, what = "条件" } = {}) {
  const deadline = Date.now() + timeoutMs
  for (;;) {
    const value = await predicate()
    if (value) return value
    if (Date.now() > deadline) throw new Error(`waitFor 超时：${what}`)
    await new Promise((resolve) => setTimeout(resolve, intervalMs))
  }
}

const reminderRows = (fx) => fx.rows().filter((row) => String(row.content).startsWith("[System reminder:"))
const toolRows = (fx, name) => fx.rows().filter((row) => row.role === "tool" && JSON.parse(row.data_json ?? "{}").name === name)

// ── 腿①：唤醒链（N74 ∥ B72 ∥ E56）─────────────────────────────────────────────

test("腿① 唤醒链（N74）：到期 ⇒ 送达行落库（user+kind）∥ 自唤醒一轮（域文本逐字）∥ 出列幂等 ∥ 未到期零行零轮", async () => {
  const fx = await wakeFixture()
  await fx.run("设个 1 秒提醒", { turns: [toolTurn([{ name: "timer", args: { seconds: 1, message: "看日志" } }]), { content: "定了" }] })
  assert.equal(CHAT_ENV_TOOLS.pendingTimerCount(fx.chat.id), 1, "在途 timer 应挂会话垫片")
  assert.equal(reminderRows(fx).length, 0, "设的当回合不出送达行")

  // 未到期 ⇒ 链尾只武装（零行零轮）
  const armed = await CHAT_WAKE.pumpChatWake({ chatId: fx.chat.id, db: fx.db, deps: fx.deps, now: Date.now, log: null })
  assert.equal(armed, true, "未到期 ⇒ 链尾武装（非开火）")
  const handle = fx.latch.armed()
  assert.ok(handle !== null && handle.ms > 0 && handle.ms <= 1000, `闩延迟 = 最近截止（实读 ${handle?.ms}）`)
  assert.equal(toolRows(fx, "timer").length, 1, "未到期零轮（无新回合）")

  // 到期 ⇒ 闩到点（假闩手工触发：假模型 + 真闩件 + 真核判据）
  fx.pad._pendingTimers[0].expiresAt = Date.now() - 1
  const before = fx.rows().length
  const assistantBefore = fx.rows().filter((row) => row.role === "assistant").length
  handle.fn()
  await waitFor(() => fx.rows().length > before + 1, { what: "唤醒轮落库" })

  const reminders = reminderRows(fx)
  assert.equal(reminders.length, 1, "到期 ⇒ 送达行落库（只投一次）")
  assert.equal(reminders[0].role, "user")
  assert.equal(JSON.parse(reminders[0].data_json).kind, "reminder", "送达行 data.kind = reminder（§15.1）")
  assert.equal(reminders[0].content, "[System reminder: ⏰ timer — 看日志]", "行文 = 核件注入单源逐字")
  assert.equal(CHAT_ENV_TOOLS.pendingTimerCount(fx.chat.id), 0, "出列 ⇒ 垫片清空")

  assert.equal(fx.rows().filter((row) => row.role === "assistant").length, assistantBefore + 1, "唤醒轮 ⇒ 助手回复落库（+1 行）")
  const wakeMessages = fx.model.calls.at(-1)
  assert.ok(wakeMessages.some((row) => row.content === CORE_HELPERS.TIMER_TURN_DOMAIN), "唤醒轮应携 TIMER_TURN_DOMAIN 逐字")
  assert.ok(!fx.rows().some((row) => String(row.content).includes(CORE_HELPERS.TIMER_TURN_DOMAIN)), "域文本 = 瞬态尾插（不落库为消息行）")
  assert.equal(fx.db.prepare("SELECT status FROM agent_chats WHERE id = ?").get(fx.chat.id).status, "idle", "唤醒轮收尾 ⇒ idle")

  const fired = await CHAT_WAKE.fireChatWake({ chatId: fx.chat.id, db: fx.db, deps: fx.deps, now: Date.now, log: null, core: CORE_TIMERS })
  assert.equal(fired, false, "再评估 ⇒ 零交付零轮")
  assert.equal(reminderRows(fx).length, 1, "不二投")
})

test("腿① 边界（B72 ∥ E56）：撞忙零动作 ∥ 会话行读败视忙 ∥ 已到期不武装 0ms 闩", async () => {
  const fx = await wakeFixture()
  CHAT.claimChatTurn(fx.db, fx.chat.id, { now: Date.now }) // 置 running（撞忙态）
  const fired = await CHAT_WAKE.fireChatWake({ chatId: fx.chat.id, db: fx.db, deps: fx.deps, now: Date.now, log: null, core: CORE_TIMERS })
  assert.equal(fired, false, "在途回合 ⇒ 零动作（零投递零开轮）")
  assert.equal(fx.pad.history.length, 0, "在途 ⇒ 零注入")
  CHAT.settleChatIdle(fx.db, fx.chat.id)
  assert.equal(
    await CHAT_WAKE.fireChatWake({ chatId: 99999, db: fx.db, deps: fx.deps, now: Date.now, log: null, core: CORE_TIMERS }),
    false, "E56 会话行读败 ⇒ 视忙零动作（不炸进程）",
  )

  const fx2 = await wakeFixture()
  await fx2.run("设个 1 秒提醒", { turns: [toolTurn([{ name: "timer", args: { seconds: 1, message: "到点" } }]), { content: "好" }] })
  fx2.pad._pendingTimers[0].expiresAt = Date.now() - 5
  const armed = await CHAT_WAKE.armChatWake({ chatId: fx2.chat.id, db: fx2.db, deps: fx2.deps, now: Date.now, log: null })
  assert.equal(armed, null, "已到期不武装 0ms 闩（防自旋/惊群——交链尾消化）")
  assert.equal(fx2.latch.armed(), null, "零注册")
})

// ── 腿②：异步链（N75 ∥ B73）────────────────────────────────────────────────────

test("腿② 异步链（N75）：回执逐字 ∥ 结算钩子 ⇒ 摘要行落库 + 自持再武装 ∥ 池空 ∥ 墓碑 consumed", async () => {
  const fx = await wakeFixture()
  const CMD = 'node -e "console.log(String.fromCharCode(97,115,121,110,99,45,111,107))"'
  await fx.run("后台跑一条", { turns: [toolTurn([{ name: "bash", args: { command: CMD, async: true } }]), { content: "起了" }] })

  const ack = toolRows(fx, "bash")[0]
  assert.match(ack.content, /^bash#\d+ started \(running\) — log: .+/, "回执 = 核件原文逐字（受理形）")
  assert.equal(JSON.parse(ack.data_json).ok, true)
  const id = Number(/^bash#(\d+)/.exec(ack.content)[1])
  const logPath = ack.content.split("— log: ")[1]

  await waitFor(() => fx.pad._bgTasks?.size === 0, { what: "后台任务结算出池" })
  assert.ok(existsSync(logPath), `后台任务日志应在盘（${logPath}）`)
  // 结算到手两态：空闲 ⇒ 钩子自动消化（真 N75 径）；撞忙 ⇒ 件停靠 pending（交链尾——本测试显式补链尾）
  await waitFor(() => reminderRows(fx).length > 0 || fx.pad._pendingAsyncResults?.length === 1, { what: "结算（自动消化 ∥ 停靠待投）" })
  if (reminderRows(fx).length === 0) {
    const hook = fx.pad._asyncWaiters?.[0]
    assert.equal(typeof hook, "function", "结算钩子应已装配（每回合环境 ctx 段）")
    hook()
    await waitFor(() => reminderRows(fx).length > 0, { what: "链尾投递（结算源）" })
  }
  assert.equal(typeof fx.pad._asyncWaiters?.[0], "function", "钩子自持再武装（splice 一次性消费 ⇒ 先自再武装）")

  const digest = reminderRows(fx).find((row) => String(row.content).startsWith(`[System reminder: background bash#${id} finished`))
  assert.ok(digest, `摘要行应落库（核件原文前缀）：${reminderRows(fx).map((r) => r.content.slice(0, 60)).join(" ∥ ")}`)
  assert.equal(JSON.parse(digest.data_json).kind, "reminder")
  assert.match(digest.content, /\(exit code 0, \d+(\.\d+)?s\) — full log: /, "结算状态 = 核件原文")
  assert.ok(digest.content.includes("async-ok"), "尾截正文应含命令输出")
  assert.ok(fx.model.calls.at(-1).some((row) => row.content === CORE_HELPERS.AUTO_TURN_DIGEST_DOMAIN), "结算源域文本 = AUTO_TURN_DIGEST_DOMAIN 逐字")
  assert.equal(fx.pad._pendingAsyncResults.length, 0, "消费即出 pending")
  assert.equal(CORE_SETTLE.tombstoneOf(fx.pad, id)?.status, "consumed", "核件消费即墓碑")
  assert.equal(fx.pad._bgTasks.size, 0, "池出清")
})

test("腿② 帽 4 ∥ kill 两态（B73）", async () => {
  const fx = await wakeFixture()
  const env = await CHAT_ENV_TOOLS.createEnvTools({ coreTools: CORE_TOOLS })
  const LONG = 'node -e "setTimeout(function(){}, 60000)"'
  const launched = []
  for (let i = 0; i < 4; i++) {
    const out = await env.invoke("bash", { command: LONG, async: true }, { agent: fx.pad, cwd: fx.cwd })
    assert.equal(out.ok, true, `第 ${i + 1} 件应受理：${out.output ?? out.message}`)
    launched.push(Number(/^bash#(\d+)/.exec(out.output)[1]))
  }
  const fifth = await env.invoke("bash", { command: LONG, async: true }, { agent: fx.pad, cwd: fx.cwd })
  assert.match(fifth.output, /background task cap reached \(4\/4 running/, "帽 4：第 5 件 ⇒ 核件人话（零起跑）")
  assert.equal(fx.pad._bgTasks.size, 4, "在途仍 4")

  const killed = await env.invoke("process", { action: "kill", id: launched[0] }, { agent: fx.pad, cwd: fx.cwd })
  assert.match(killed.output, new RegExp(`killed background bash#${launched[0]} — its process tree was terminated; no digest will arrive`), "在途 ⇒ 杀树 + 确认句")
  assert.equal(CORE_SETTLE.tombstoneOf(fx.pad, launched[0])?.status, "cancelled", "杀点墓碑 = cancelled")
  const unknown = await env.invoke("process", { action: "kill", id: 424242 }, { agent: fx.pad, cwd: fx.cwd })
  assert.match(unknown.output, /Error: unknown background task id: 424242 — it has finished, was killed, or was never started/, "未知/已完成 ⇒ 人话错误")
  for (const id of fx.pad._bgTasks.keys()) CORE_BASH_ASYNC.killBgTask(fx.pad, id) // 在途清尾（零遛留进程）
  assert.equal(fx.pad._bgTasks.size, 0, "收尾杀清")
})

// ── 腿③：中止面（E57）─────────────────────────────────────────────────────────

test("腿③ 中止面（E57）：非 interrupt 中止 ⇒ 杀树 + 丢弃提醒入汇 + 墓碑 ⇒ 零摘要投递（次条起跑投递该提醒行）", async () => {
  const fx = await wakeFixture()
  const LONG = 'node -e "setTimeout(function(){}, 60000)"'
  const turns = [
    toolTurn([{ name: "bash", args: { command: LONG, async: true } }]),
    () => { CHAT.requestChatAbort(fx.chat.id); throw new Error("stop") }, // 在途模型调用当即中断（服务面唯一中止径）
  ]
  const { result, frames } = await fx.run("起个长的再中止", { turns })
  assert.equal(result.status, "failed", "中止 ⇒ 异常收尾")
  assert.equal(result.reason, "已手动中止——本轮已停", "end 帧/notice 人话同源")
  assert.ok(frames.some((frame) => frame.type === "end" && frame.reason === "已手动中止——本轮已停"), "end 帧人话 = 已手动中止")
  const notice = fx.rows().find((row) => row.role === "notice")
  assert.equal(JSON.parse(notice.data_json).reason, "aborted", "五终态之一（aborted）")
  assert.equal(CHAT.isChatAbortRequested(fx.chat.id), false, "finally 清登记（零残留）")

  assert.equal(fx.pad._bgTasks.size, 0, "杀树 + 出池")
  const discards = fx.pad.history.filter((row) => String(row.content).includes("were killed by the user's Stop"))
  assert.equal(discards.length, 1, "丢弃提醒入汇（核件原文）")
  assert.match(discards[0].content, /1 background bash task\(s\) were killed by the user's Stop — their processes are gone and no digest will arrive: bash#\d+/, "提醒行文 = 核件单源")
  assert.equal(fx.pad._pendingAsyncResults?.length ?? 0, 0, "零摘要投递（丢弃件不入 pending）")
  assert.ok(!reminderRows(fx).some((row) => String(row.content).startsWith("[System reminder: background bash#")), "零摘要投递（落库面）")

  const rowsBefore = fx.rows().length
  await fx.run("再来一条", { turns: [{ content: "好" }] })
  assert.ok(fx.rows().length > rowsBefore)
  const delivered = reminderRows(fx).find((row) => String(row.content).includes("were killed by the user's Stop"))
  assert.ok(delivered, "次条起跑 ⇒ 提醒行落库（user 行 + kind=reminder）")
  assert.equal(JSON.parse(delivered.data_json).kind, "reminder")
  assert.equal(fx.pad.history.length, 0, "汇面出清（无重复）")
})

// ── 腿④：结构面（§15.4④）─────────────────────────────────────────────────────

test("腿④ 结构面：六端点计数不变 ∥ 三 kind 不扩 ∥ 唤醒器零 `setInterval` ∥ 导入口四件同源", () => {
  const source = (rel) => readFileSync(join(ROOT, rel), "utf8")
  const routes = source("thincoder-server/src/agent/chat-routes.mjs")
  const chat = source("thincoder-server/src/agent/chat.mjs")
  assert.equal((routes.match(/routes\.add\(/g) ?? []).length, 6, "会话面六端点（零新端点——§15.1/§16.2）")
  const kinds = new Set([...`${chat}\n${routes}`.matchAll(/kind: "(chat_[a-z_]+)"/g)].map((match) => match[1]))
  assert.deepEqual([...kinds].sort(), ["chat_call", "chat_start", "chat_stop"], "三 kind 不扩（零第四 kind）")
  assert.ok(chat.includes('type: "agent_event"') && routes.includes('type: "agent_event"'), "审计写面 = agent_event 行（三 kind 共用）")

  const wake = source("thincoder-server/src/agent/chat-wake.mjs")
  const wakeCode = wake.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "") // 去注释——只断代码面
  assert.ok(!wakeCode.includes("setInterval"), "唤醒器零轮询（无 setInterval 调用）")
  assert.ok(!routes.replace(/^\s*\/\/.*$/gm, "").includes("setInterval"), "路由面零轮询")
  for (const face of ["createTimerWatch", "fireTimerWake", "pendingTimerDeadline"]) assert.ok(wake.includes(face), `唤醒器应复用核件：${face}`)
  assert.ok(wake.includes("@thincoder/core/agent/timers.mjs"), "唤醒器导入指 = 核 timers.mjs（同源——§15.4）")
  const envTools = source("thincoder-server/src/agent/chat-env-tools.mjs")
  assert.ok(envTools.includes("deliverExpiredTimers"), "投递汇应复用核件：deliverExpiredTimers")
  for (const stray of ["injectTimerReminders", "takeExpiredTimers("]) {
    assert.ok(!envTools.includes(stray), `零第二份语义（不应再自持：${stray}）`)
  }
})

// ── 腿⑤：出口链（N77 ∥ §16.4② ∥ N78 ∥ E58）───────────────────────────────────

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

const login = async (base, username, password) => {
  const res = await fetch(`${base}/api/login`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ username, password }) })
  return { status: res.status, json: await res.json().catch(() => null) }
}
const configWith = (baseURL, models = ["mock-chat"]) =>
  CONFIG.validateConfig({ host: "127.0.0.1", providers: [{ name: "mock", baseURL, apiKey: "sk-upstream", models }], embedding: { baseURL, model: "bge-m3" } })

test("腿⑤ 登录发面（N77）：admin 首发 `admin-agent`（明文 + `key_issue` surface）∥ 幂等零重签 ∥ `user` 零行", async () => {
  const db = DB.openDatabase(":memory:")
  const { member: admin } = await MEMBERS.createMember(db, { username: "admin", role: "admin", password: PASSWORD })
  const { member: bob } = await MEMBERS.createMember(db, { username: "bob", role: "user", password: PASSWORD })
  const app = await startApp({ db, config: configWith("http://127.0.0.1:9/v1") })
  try {
    assert.equal((await login(app.base, "admin", PASSWORD)).status, 200)
    const rows = () => db.prepare("SELECT * FROM api_keys WHERE name = ?").all(KEYS.AGENT_KEY_NAME)
    assert.equal(rows().length, 1, "admin 登录 ⇒ 一条 admin-agent")
    assert.equal(rows()[0].status, "active")
    assert.ok(typeof rows()[0].key_plain === "string" && rows()[0].key_plain.startsWith(KEYS.KEY_PREFIX), "明文落 v19 列")
    const issues = db.prepare("SELECT * FROM audit_events WHERE type = 'key_issue' ORDER BY id").all()
    assert.equal(issues.length, 1, "首发一条 key_issue")
    assert.equal(JSON.parse(issues[0].detail).surface, "admin_agent", "surface 取值域扩（ACCOUNTS §2.1）")
    assert.equal(JSON.parse(issues[0].detail).keyHint, rows()[0].key_hint)
    assert.deepEqual(KEYS.agentKeyOf(db, admin.id).plain, rows()[0].key_plain, "读面 = 明文单源")

    assert.equal((await login(app.base, "admin", PASSWORD)).status, 200)
    assert.equal(rows().length, 1, "重复登录 ⇒ 同行（幂等）")
    assert.equal(db.prepare("SELECT COUNT(*) AS n FROM audit_events WHERE type = 'key_issue'").get().n, 1, "复用 ⇒ 零审计行")

    assert.equal((await login(app.base, "bob", PASSWORD)).status, 200)
    assert.equal(rows().length, 1, "user 登录 ⇒ 零新行")
    assert.equal(KEYS.agentKeyOf(db, bob.id), null, "user 名下无 sk")
  } finally {
    await app.close()
  }
})

test("腿⑤ 出口入参（§16.4②）：`selfBase/v1` + sk 明文 + 外标 ∥ 不携 provider 凭据 ∥ `selfBaseOf` 换算", async () => {
  const fx = await wakeFixture()
  const captured = []
  await fx.run("你好", { deps: { chat: null, selfBaseUrl: () => ({ address: "0.0.0.0", family: "IPv4", port: 8787 }), chatImpl: async (provider) => { captured.push(provider); return { content: "好", toolCalls: [] } } } })
  assert.equal(captured.length, 1, "出口装配走真件（假核 chat 注入口）")
  const sk = KEYS.agentKeyOf(fx.db, fx.member.id)
  assert.deepEqual(
    { baseURL: captured[0].baseURL, apiKey: captured[0].apiKey, model: captured[0].model, name: captured[0].name },
    { baseURL: "http://127.0.0.1:8787/v1", apiKey: sk.plain, model: MODEL, name: "fake" },
    "出口配置 = 自环基址 + 管理面 sk 明文 + 外标",
  )
  assert.notEqual(captured[0].apiKey, "sk-upstream-test", "不携 provider apiKey（库内凭据不出本档）")

  assert.equal(CHAT.selfBaseOf({ address: "0.0.0.0", family: "IPv4", port: 80 }), "http://127.0.0.1:80", "通配 ⇒ 拨环回")
  assert.equal(CHAT.selfBaseOf({ address: "::", family: "IPv6", port: 8787 }), "http://[::1]:8787", "IPv6 通配 ⇒ ::1 + 方括号")
  assert.equal(CHAT.selfBaseOf({ address: "10.0.0.5", port: 9 }), "http://10.0.0.5:9", "具名地址原样")
  assert.equal(CHAT.selfBaseOf("http://127.0.0.1:1234/"), "http://127.0.0.1:1234", "串形注入口（尾斜杠归一）")
  assert.equal(CHAT.selfBaseOf(null), null, "缺位 ⇒ null（调用侧 model_error）")
  assert.equal(CHAT.selfBaseOf({ address: "0.0.0.0" }), null, "端口缺 ⇒ null")
})

test("腿⑤ 全链出账（N78）：真网关链 + 假上游 + 自环 ⇒ 帧序零变 + `usage` 行在场且可归因", async () => {
  const upstream = createHttpServer((req, res) => {
    req.on("data", () => {})
    req.on("end", () => {
      res.writeHead(200, { "content-type": "text/event-stream" })
      res.write(`data: ${JSON.stringify({ id: "c1", choices: [{ delta: { content: "网关" } }] })}\n\n`)
      res.write(`data: ${JSON.stringify({ id: "c1", choices: [{ delta: { content: "已记账" }, finish_reason: "stop" }] })}\n\n`)
      res.write(`data: ${JSON.stringify({ choices: [], usage: { prompt_tokens: 11, completion_tokens: 5, total_tokens: 16 } })}\n\n`)
      res.write("data: [DONE]\n\n")
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
  const frames = []
  try {
    CHAT.claimChatTurn(db, chat.id, { now: Date.now })
    const result = await CHAT.runChatTurn({
      db, chatId: chat.id, content: "走一趟网关", emit: (frame) => frames.push(frame), now: Date.now,
      deps: { coreTools: CORE_TOOLS, coreTimers: CORE_TIMERS, coreDomains: CORE_DOMAINS, cwd: tempRoot, selfBaseUrl: () => app.address(), chatImpl: CORE_CHAT },
    })
    assert.equal(result.status, "succeeded", `全链应成功：${result.reason ?? ""}`)
    assert.equal(frames.filter((frame) => frame.type === "turn").length, 1, "turn 帧在场（帧序零变）")
    assert.ok(frames.some((frame) => frame.type === "delta" && frame.text === "网关"), "delta 帧在场（模型增量直透）")
    const usageFrame = frames.find((frame) => frame.type === "usage")
    assert.deepEqual(usageFrame && { prompt: usageFrame.prompt, completion: usageFrame.completion }, { prompt: 11, completion: 5 }, "usage 帧 = 假上游读数")
    assert.equal(frames.at(-1).type, "end")
    assert.equal(frames.at(-1).status, "succeeded")
    assert.equal(db.prepare("SELECT content FROM agent_chat_messages WHERE chat_id = ? AND role = 'assistant'").get(chat.id).content, "网关已记账", "助手文本落库 = 上游文本")

    const usage = db.prepare("SELECT u.*, k.name AS key_name FROM usage u JOIN api_keys k ON k.id = u.key_id ORDER BY u.id DESC LIMIT 1").get()
    assert.ok(usage, "usage 行在场（网关链记账）")
    assert.equal(usage.member_id, member.id, "归因 = 发送者（本用例发送者缺省回落 = 会话 owner——2026-10-13 收正）")
    assert.equal(usage.key_name, KEYS.AGENT_KEY_NAME, "归因 = admin-agent")
    assert.equal(usage.endpoint, "chat")
    assert.equal(usage.model, "mock-chat", "记账 model = 上游真名（网关链口径）")
    assert.equal(usage.status, "ok")
    assert.equal(usage.total_tokens, 16)
  } finally {
    await app.close()
    upstream.closeAllConnections?.()
    await new Promise((resolve) => upstream.close(resolve))
  }
})

test("腿⑤ 失败面（E58）：sk 未在册 ∥ 已吊销 ⇒ `model_error` 人话（含「重新登录」）∥ 零模型调用", async () => {
  const missing = await wakeFixture({ seedKey: false })
  const first = await missing.run("没 sk", { turns: [{ content: "不应到此" }], deps: { chat: null } })
  assert.equal(first.result.status, "failed")
  assert.match(first.result.reason, /重新登录控制台/, `人话应含重新登录：${first.result.reason}`)
  assert.equal(missing.model.calls.length, 0, "零模型调用（出口装配即抛）")
  assert.equal(missing.agentEvent("chat_stop").at(-1).parsed.reason, "model_error", "五终态之一（model_error）")
  assert.equal(missing.rows().find((row) => row.role === "notice") !== undefined, true, "notice 行人话")

  const revoked = await wakeFixture()
  KEYS.revokeKey(revoked.db, KEYS.agentKeyOf(revoked.db, revoked.member.id).id)
  const second = await revoked.run("已吊销", { turns: [{ content: "不应到此" }], deps: { chat: null } })
  assert.equal(second.result.status, "failed")
  assert.match(second.result.reason, /重新登录控制台/)
  assert.equal(revoked.model.calls.length, 0)
})

// ── 腿⑥：历史面（N76 ∥ B75）──────────────────────────────────────────────────

test("腿⑥ 历史面（N76）：本会话逐过滤形 ∥ `ts` = `created_at` 毫秒 ∥ 审计 subject = 过滤摘要", async () => {
  const fx = await wakeFixture()
  const T = (seconds) => Date.parse(`2026-10-12T10:00:${String(seconds).padStart(2, "0")}.000Z`)
  CHAT_STORE.appendMessage(fx.db, fx.chat.id, { role: "user", content: "你好，先看容器", now: () => T(1) })
  CHAT_STORE.appendMessage(fx.db, fx.chat.id, { role: "assistant", content: "", data: { toolCalls: [{ id: "call-1", name: "docker", args: '{"op":"ps"}' }] }, now: () => T(2) })
  CHAT_STORE.appendMessage(fx.db, fx.chat.id, { role: "tool", content: '{"ok":true}', data: { toolCallId: "call-1", name: "docker", ok: true, summary: "ps" }, now: () => T(3) })
  CHAT_STORE.appendMessage(fx.db, fx.chat.id, { role: "notice", content: "已手动中止——本轮已停", data: { reason: "aborted" }, now: () => T(4) })
  CHAT_STORE.appendMessage(fx.db, fx.chat.id, { role: "user", content: "第二条", now: () => T(5) })

  const env = await CHAT_ENV_TOOLS.createEnvTools({ coreTools: CORE_TOOLS })
  const pad = CHAT_ENV_TOOLS.timerPadOf(fx.chat.id)
  pad._recordStore = CHAT_STORE.recordStoreOf(fx.db, fx.chat.id)
  const read = async (args) => JSON.parse((await env.invoke("read_history", args, { agent: pad, cwd: fx.cwd })).output)

  const all = await read({})
  assert.deepEqual(all.map((entry) => entry.role), ["user", "assistant", "tool", "notice", "user"], "全量按时间序出（notice 在列——核件不校验 role）")
  assert.equal(all[0].ts, T(1), "ts = created_at 毫秒")
  assert.deepEqual(all[1].tool_calls, [{ name: "docker", arguments: '{"op":"ps"}' }], "assistant 记录形 ⇒ 核件 tool_calls 出形")
  assert.equal(all[2].name, "docker", "tool 行携 name")
  assert.equal(all[2].tool_call_id, "call-1", "tool 行携 tool_call_id")

  assert.deepEqual((await read({ role: "tool" })).map((entry) => entry.role), ["tool"], "role 过滤")
  assert.deepEqual((await read({ tool: "docker" })).map((entry) => entry.role), ["assistant", "tool"], "tool 过滤（含声明行）")
  assert.deepEqual((await read({ keyword: "容器" })).map((entry) => entry.content), ["你好，先看容器"], "keyword 过滤")
  assert.deepEqual((await read({ since: T(2), until: T(4) })).map((entry) => entry.ts), [T(2), T(3), T(4)], "时间窗（含两端）")
  assert.deepEqual((await read({ limit: 2 })).map((entry) => entry.role), ["notice", "user"], "limit 自尾取（newest——输出恒时间序）")
  assert.deepEqual((await read({ limit: 2, direction: "oldest" })).map((entry) => entry.content), ["你好，先看容器", ""], "direction=oldest 自首取")
  assert.equal((await read({ limit: 999 })).length, 5, "limit 越界 ⇒ 核件钳制（不炸）")

  // 审计 subject = 过滤摘要（经回合调用面）
  await fx.run("查一下", { turns: [toolTurn([{ name: "read_history", args: { role: "user", keyword: "容器" } }]), { content: "看到" }] })
  const call = fx.agentEvent("chat_call").find((row) => row.parsed.tool === "read_history")
  assert.ok(call, "read_history 落 chat_call 行")
  assert.equal(call.parsed.subject, "role=user keyword=容器", "subject = 过滤摘要（逐项、缺项不列）")
  const outRow = toolRows(fx, "read_history").at(-1)
  assert.deepEqual(JSON.parse(outRow.content).map((entry) => entry.content), ["你好，先看容器"], "本会话作用域结果（逐字落 tool 行）")
})

test("腿⑥ 边界（B75）：`path` 传参 ⇒ 工具级错误人话 ∥ 空会话 ⇒ `[]` ∥ 缺记录面 ⇒ `[]`", async () => {
  const fx = await wakeFixture()
  const env = await CHAT_ENV_TOOLS.createEnvTools({ coreTools: CORE_TOOLS })
  const pad = CHAT_ENV_TOOLS.timerPadOf(fx.chat.id)
  for (const path of ["all", "cwd:.", "some/session.json"]) {
    const refused = await env.invoke("read_history", { path }, { agent: pad, cwd: fx.cwd })
    assert.equal(refused.ok, false, `path=${path} ⇒ 工具级错误`)
    assert.match(refused.message, /path 不可用/, "人话（本会话作用域——零 schema 收窄）")
  }
  const empty = await env.invoke("read_history", {}, { agent: { _recordStore: CHAT_STORE.recordStoreOf(fx.db, fx.chat.id) }, cwd: fx.cwd })
  assert.equal(empty.output, "[]", "空会话 ⇒ 空数组")
  const unbound = await env.invoke("read_history", {}, { agent: {}, cwd: fx.cwd })
  assert.equal(unbound.output, "[]", "缺记录面 ⇒ 零件（不炸）")
})

// ── 腿⑦：结构续（§16.4⑤）────────────────────────────────────────────────────

test("腿⑦ 结构续：核件 `read-history.mjs` 零改 ∥ 八件（六族）∥ 能力段对位 ∥ v19 列在册", async () => {
  const envTools = readFileSync(join(ROOT, "thincoder-server/src/agent/chat-env-tools.mjs"), "utf8")
  assert.ok(envTools.includes("@thincoder/core/agent-tools/read-history.mjs"), "read_history = 核件原文（导入即用）")
  assert.ok(!envTools.includes('name: "read_history"'), "零第二份实现（不自持工具定义）")
  const core = readFileSync(join(ROOT, "thincoder-core/agent-tools/read-history.mjs"), "utf8")
  assert.ok(core.includes("agent?._recordStore") && core.includes("store.iterate(direction)"), "核件自持注入缝 `_recordStore`（本批零改核件）")

  assert.deepEqual([...CHAT_ENV_TOOLS.ENV_TOOL_NAMES], ["get_current_time", "process", "timer", "ls", "read", "grep", "bash", "read_history"], "八件（第六族「会话」）")
  assert.equal(CHAT_ENV_TOOLS.ENV_TOOL_FAMILIES.length, 6, "六族")
  assert.deepEqual(
    CHAT_ENV_TOOLS.ENV_TOOL_FAMILIES.flatMap((family) => family.tools).sort(),
    [...CHAT_ENV_TOOLS.ENV_TOOL_NAMES].sort(),
    "六族恰好覆盖八件（无重无漏）",
  )
  const tools = await CHAT_ENV_TOOLS.createEnvTools({ coreTools: CORE_TOOLS })
  assert.equal(tools.names.length, 8)
  assert.equal(tools.schemas.length, 8)
  const tokens = new Set(CHAT_ENV.CHAT_LIMITS_BLOCK.split(/[^\w]+/).filter((token) => token !== ""))
  for (const name of tools.names) assert.ok(tokens.has(name), `能力段应列注册工具名：${name}`)

  const db = DB.openDatabase(":memory:")
  assert.equal(DB.SCHEMA_VERSION, 20, "结构版本 v20（team-ledger 批 v20 后——2026-10-13）")
  assert.ok(db.prepare("PRAGMA table_info('api_keys')").all().some((column) => column.name === "key_plain"), "v19 列在册（尾插）")
})
