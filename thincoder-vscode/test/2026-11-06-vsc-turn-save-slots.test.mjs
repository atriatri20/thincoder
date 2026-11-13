/**
 * 2026-11-06-vsc-turn-save-slots.test.mjs — 批 `2026-11-06-vsc-test-face` §2 · B1 ∥ B2 ∥ B3 ∥ B4
 *
 * 判据出处 = `docs/vsc/requirements/WEBVIEW.md` F-W14 行（「回合中改模型须落盘（不得静默覆盖）」）——
 * 回合尾落盘**四处**，逐处一条 `test()`：
 *   B1 `panel-callbacks.mjs` `buildPanelCallbacks` 的 `onComplete` → `_saveLines(… , { seed, ...agentState }, turnSlot)`
 *   B2 同档 `onDistilled` → `_saveLines(… , { seed, ...lastAgentState }, distillSlot)`（前置槽守卫 + 捕获态）
 *   B3 `panel-turn-loop.mjs` `runTurnLoop` 的错误/中止落盘点 → `_saveLines(… , { seed }, turnSlot)`
 *   B4 `panel-turn-stages.mjs` `finalizeTurn` → `_saveLines(… , title ? { seed, title } : { seed }, turnSlot)`（两形）
 *   B5（2026-11-13 追补 · 台账 #2395 · 判据出处 = `docs/core/design/SESSION.md` §2 ∥
 *      `docs/core/design/CONTEXT-COMPACTION.md` §1.1）完成载荷 `turns` 带出**刚收尾那一轮**，且跨端
 *      （VSC 存、核 `applySession` 开）机读线无工具过程、最后一轮的请求 ∥ 回复 ∥ 任务状态都在
 *
 * **判据 = 落盘点的可观察结果**（不是载荷表达式）：B1–B4 驱动到落盘点后，会话槽文件里的复合
 * `activeProvider:activeModel` **仍是回合内显式选定值**——回合起点的 `slotStamp` 不夺权。
 * 「回合内显式选定」的写面 = `panel-messages.mjs` 的 `selectModel` 径（立即写槽），本档用**同一个
 * `saveLines`** 以同一载荷形落一次，作为夹具前提。B5（2026-11-13 追补）另有自己的判据，见其用例头注。
 *
 * 驱动面：真 `ChatPanel`（真 `_saveLines` → 真 `saveLines`）+ 三个真驱动入口（`buildPanelCallbacks`
 * 的回调闭包 ∥ `runTurnLoop` ∥ `finalizeTurn`）+ B5 的真核 `runAgent` 打本机假 SSE 端点；`config.json`
 * 与 sessions 目录都指到临时目录（核 `_setConfigPathForTest` ∥ 端壳 `_setSessionsDirForTest`），不摸本机。
 *
 * 静态对账不算覆盖：设计档 `docs/vsc/design/WEBVIEW.md` §4.2 明写静态扫只数调用点、判不出哪处让
 * `slotStamp` 夺权——故 B1–B4 四条逐路驱动到落盘点。
 */
import assert from "node:assert/strict"
import { after, test } from "node:test"
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs"
import { createServer } from "node:http"
import { registerHooks } from "node:module"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { pathToFileURL } from "node:url"

// ─── 夹具：临时项目根 + 隔离 config.json / sessions ────────────────────────────────────────
const work = mkdtempSync(join(tmpdir(), "vsc-turn-save-"))
const proj = join(work, "proj")
const sessions = join(work, "sessions")
mkdirSync(proj, { recursive: true })
mkdirSync(sessions, { recursive: true })
const cfgPath = join(work, "config.json")
writeFileSync(cfgPath, JSON.stringify({ providers: [] }, null, 2))

const stubPath = join(work, "vscode-stub.mjs")
writeFileSync(stubPath, `export const window = { showInformationMessage: async () => undefined, showErrorMessage: () => undefined, showWarningMessage: async () => undefined, onDidChangeActiveTextEditor: () => ({ dispose() {} }), createOutputChannel: () => ({ appendLine() {}, dispose() {}, show() {} }), createStatusBarItem: () => ({ show() {}, hide() {}, dispose() {} }) }
export const workspace = { workspaceFolders: [{ uri: { fsPath: ${JSON.stringify(proj)} }, name: "proj", index: 0 }], getConfiguration: () => ({ get: (_k, d) => d, update: async () => {} }), onDidChangeConfiguration: () => ({ dispose() {} }), onDidChangeWorkspaceFolders: () => ({ dispose() {} }), getWorkspaceFolder: () => null, findFiles: async () => [], fs: {} }
export const commands = { registerCommand: () => ({ dispose() {} }), executeCommand: async () => undefined }
export const env = { clipboard: { readText: async () => "" } }
export const languages = { getDiagnostics: () => [] }
export const extensions = { all: [], getExtension: () => undefined }
export const Uri = { file: (p) => ({ fsPath: p, toString: () => String(p) }), parse: (p) => ({ fsPath: p, toString: () => p }), joinPath: (...a) => ({ fsPath: a.join("/"), toString: () => a.join("/") }) }
export const EventEmitter = class { constructor() { this.event = () => ({ dispose() {} }) } fire() {} dispose() {} }
export const Disposable = class { constructor(f) { this.dispose = f ?? (() => {}) } static from() { return { dispose() {} } } }
export const Position = class { constructor(l, c) { this.line = l; this.character = c } }
export const Range = class { constructor(a, b) { this.start = a; this.end = b } }
export const ThemeIcon = class { constructor(id) { this.id = id } }
export const ViewColumn = { One: 1, Two: 2, Active: -1, Beside: -2 }
export const ConfigurationTarget = { Global: 1, Workspace: 2 }
export const ProgressLocation = { Notification: 15 }
export const StatusBarAlignment = { Left: 1, Right: 2 }
export const TreeItemCollapsibleState = { None: 0 }
export const CancellationTokenSource = class { constructor() { this.token = { isCancellationRequested: false, onCancellationRequested: () => ({ dispose() {} }) } } cancel() {} dispose() {} }
`)
const stubUrl = pathToFileURL(stubPath).href
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier === "vscode") return { url: stubUrl, shortCircuit: true }
    return nextResolve(specifier, context)
  },
})

const { _setConfigPathForTest, _resetConfigPathForTest } = await import("../../thincoder-core/config-io.mjs")
_setConfigPathForTest(cfgPath)
const { loadSlot, _setSessionsDirForTest, _resetSessionsDirForTest } = await import("../src/extension/session-io.mjs")
_setSessionsDirForTest(sessions)
const { _setShellDetectForTest } = await import("../src/extension/settings.mjs")
_setShellDetectForTest(async () => [])
const { removeTempDirBestEffort } = await import("../../test/teardown.mjs")
// B5（2026-11-13 追补 · 台账 #2395）：跨端场景要真跑一轮模型（核 `runAgent`）并让核 `applySession` 读回同一槽——
// 核 agent 链 ∥ 会话恢复面 ∥ 轮记录标记 ∥ 核日志目录（轮记录 evidence 面不写本机真实日志目录）按需动态取
// （与上列同式；核 agent 链静态达 node:sqlite，端侧不为它加静态边）。
const { createAgent, runAgent } = await import("../../thincoder-core/agent.mjs")
const { applySession } = await import("../../thincoder-core/session.mjs")
const { TASK_STATE_MARK } = await import("../../thincoder-core/agent/turn-projection.mjs")
const { _setLogsDirForTest, _resetLogsDirForTest } = await import("../../thincoder-core/log.mjs")
const { agentState } = await import("../src/agent/run-helpers.mjs")
const logs = join(work, "logs")
mkdirSync(logs, { recursive: true })
_setLogsDirForTest(logs)

const { ChatPanel } = await import("../src/extension/chat-panel.mjs")
const { buildPanelCallbacks } = await import("../src/extension/panel-callbacks.mjs")
const { finalizeTurn } = await import("../src/extension/panel-turn-stages.mjs")
const { runTurnLoop } = await import("../src/extension/panel-turn-loop.mjs")

/** 回合号（落盘槽位）。 */
const SLOT = 1
/** 回合**起点**的复合印章（修复前它会夺权——本档断它不夺权）。 */
const SEED = { activeProvider: "seed-prov", activeModel: "seed-model" }
/** 回合**内**用户显式选定的复合（`selectModel` 径立即写槽的值）。 */
const PICKED = { activeProvider: "picked-prov", activeModel: "picked-model" }
const USER_MSG = { role: "user", content: "hello from the fixture turn" }

after(() => {
  _resetConfigPathForTest()
  _resetSessionsDirForTest()
  _resetLogsDirForTest()
  removeTempDirBestEffort(work)
})

/** 新面板（真 `ChatPanel`；`_panel` 置空 = 宿主推送面不在本档射程内）。 */
function newPanel() {
  const panel = new ChatPanel({
    subscriptions: [],
    workspaceState: { get: () => undefined, update: async () => {} },
    globalState: { get: () => undefined, update: async () => {} },
    extensionUri: { fsPath: proj },
  })
  panel._slot = SLOT
  panel._panel = null
  return panel
}

const disk = () => loadSlot(proj, SLOT) ?? {}
const composite = (d) => `${d.activeProvider}:${d.activeModel}`

/** 夹具前提 = 回合内显式选定——载荷形与 `panel-messages.mjs` `selectModel` 径逐字同（`panel._saveLines(data.history ?? [], data.contextHistory ?? [], { activeProvider: msg.provider, activeModel: msg.model }, slot)`）：只带双键、立即写槽。
 * 边界（写给下一个读者）：四条证明的是「**落盘点不夺权**」，不覆盖「selectModel 消息 → 写槽」那一径本身。 */
function pickDuringTurn(panel) {
  panel._saveLines([], [], { ...PICKED }, SLOT)
  const d = disk()
  assert.equal(composite(d), `${PICKED.activeProvider}:${PICKED.activeModel}`, "夹具前提：回合内显式选定已落槽")
  return d
}

/** 一个「干净完成回合」的 tip agentState（形 = `src/agent/run-helpers.mjs` 的 `agentState(agent)`）。 */
const turnAgentState = (mode) => ({
  mode, advisorGuard: false, engDesignTokens: null,
  tasks: [], goal: null, pendingReminders: [], estimateSample: null,
})

/** 四路共用的 buildPanelCallbacks 依赖面。 */
const callbackDeps = (fullHistory, history) => ({
  cwd: proj,
  p: { name: "picked-prov", baseURL: "http://127.0.0.1:9/v1", format: "openai", apiKey: "k", model: "deepseek-flash" },
  fullHistory, history, providerName: "picked-prov",
  turnSlot: SLOT, distillSlot: SLOT, autoTurn: true,
  askInPanel: async () => null, slotStamp: SEED,
})

test("B1 panel-callbacks.mjs 的 _saveLines·turnSlot（携 ...agentState）", () => {
  const panel = newPanel()
  pickDuringTurn(panel)
  const fullHistory = [USER_MSG]
  const history = [{ role: "user", content: USER_MSG.content }]
  const callbacks = buildPanelCallbacks(panel, callbackDeps(fullHistory, history))

  callbacks.onComplete("done", turnAgentState("engineering"))

  const d = disk()
  assert.equal(composite(d), `${PICKED.activeProvider}:${PICKED.activeModel}`,
    `回合尾落盘后槽复合 = 回合内显式选定值（起跑印章不得夺权），实得 ${composite(d)}`)
  assert.equal(d.mode, "engineering", "落盘点确实走的是 onComplete 的载荷（agentState 的 mode 落盘）")
  assert.equal(d.history.length, 1, "本回合内容落盘（不是空写）")
})

test("B2 panel-callbacks.mjs 同函数·distillSlot（携 ...lastAgentState + 前置槽守卫）", () => {
  const panel = newPanel()
  pickDuringTurn(panel)
  const fullHistory = [USER_MSG]
  const history = [{ role: "user", content: USER_MSG.content }]
  const callbacks = buildPanelCallbacks(panel, callbackDeps(fullHistory, history))

  // 完成拍先落（`lastAgentState` 在 onComplete 写、onDistilled 读——闭包携带）
  callbacks.onComplete("done", turnAgentState("engineering"))
  // 把槽上的 engineering 改成 false（= 完成拍之后盘面被别处改写），用于辨认 distill 落盘确实用的是捕获态
  panel._saveLines([USER_MSG], history, { mode: "normal", ...PICKED }, SLOT)
  assert.equal(disk().mode, "normal", "夹具前提：盘面 mode 已改 normal")

  callbacks.onDistilled()

  const d = disk()
  assert.equal(composite(d), `${PICKED.activeProvider}:${PICKED.activeModel}`,
    `distill 落盘后槽复合 = 回合内显式选定值，实得 ${composite(d)}`)
  assert.equal(d.mode, "engineering", "distill 落盘携的是 onComplete 捕获的 lastAgentState（不是当前盘面）")

  // 前置槽守卫：会话已切走（panel._slot ≠ distillSlot）⇒ 零写（压缩属于旧会话，绝不写进新槽）
  panel._saveLines([USER_MSG], history, { mode: "normal", ...PICKED }, SLOT)
  panel._slot = 2
  callbacks.onDistilled()
  assert.equal(disk().mode, "normal", "槽守卫：panel._slot ≠ distillSlot ⇒ onDistilled 零写")
  assert.equal(composite(disk()), `${PICKED.activeProvider}:${PICKED.activeModel}`, "零写 ⇒ 复合原样（未被动过）")
})

test("B3 panel-turn-loop.mjs 的 _saveLines·turnSlot（载荷只 seed）", async () => {
  const panel = newPanel()
  const before = pickDuringTurn(panel)
  assert.equal(before.history.length, 0, "夹具前提：槽上还没有本回合内容")
  // 回合起点即中止（Stop 在装配前到达）⇒ 回合循环走「中止/错误落盘」支——真驱动，不伪造载荷
  const controller = new AbortController()
  controller.abort()
  panel._abortController = controller

  await runTurnLoop(panel, {
    text: "hello",
    cwd: proj,
    p: { name: "picked-prov", baseURL: "http://127.0.0.1:9/v1", format: "openai", apiKey: "k", model: "deepseek-flash" },
    callbacks: {},
    images: undefined,
    history: [],
    fullHistory: [USER_MSG],
    autoTurn: false,
    upstreamTurn: false,
    susp: null,
    timerTurn: false,
    turnSlot: SLOT,
    tLog: {},
    askInPanel: async () => "Stop",
    slotStamp: SEED,
  })

  const d = disk()
  assert.equal(composite(d), `${PICKED.activeProvider}:${PICKED.activeModel}`,
    `中止落盘后槽复合 = 回合内显式选定值（seed 只播种，不夺权），实得 ${composite(d)}`)
  // 落盘点真到达的判据 = 本回合的用户输入进了槽（中止支的 history 条数随核追加的收尾行而变，不比条数）
  assert.ok(d.history.some((m) => String(m.content ?? "").includes(USER_MSG.content)),
    `中止支确实把本回合的用户输入落了盘（落盘点真到达）：${JSON.stringify(d.history.map((m) => m.role))}`)
})

test("B4 panel-turn-stages.mjs 的 _saveLines·turnSlot（title 两形同断言）", async () => {
  // 形一：本回合生成了标题（`{ seed, title }`）
  {
    const panel = newPanel()
    pickDuringTurn(panel)
    panel._generateTitle = async () => "fixture turn title"
    await finalizeTurn(panel, {
      history: [{ role: "user", content: USER_MSG.content }],
      fullHistory: [USER_MSG], slotStamp: SEED, turnSlot: SLOT, susp: null, skipSession: true,
    })
    const d = disk()
    assert.equal(composite(d), `${PICKED.activeProvider}:${PICKED.activeModel}`,
      `形一（携 title）落盘后槽复合 = 回合内显式选定值，实得 ${composite(d)}`)
    assert.equal(d.title, "fixture turn title", "形一：标题随整档 save 单写落盘")
    assert.equal(d.history.length, 1, "形一：本回合内容落盘")
  }

  // 形二：本回合无标题（`{ seed }`——槽上既有标题不得被抹）
  {
    const panel = newPanel()
    panel._saveLines([], [], { ...PICKED, title: "existing title" }, SLOT)
    panel._generateTitle = async () => null
    await finalizeTurn(panel, {
      history: [{ role: "user", content: USER_MSG.content }],
      fullHistory: [USER_MSG], slotStamp: SEED, turnSlot: SLOT, susp: null, skipSession: true,
    })
    const d = disk()
    assert.equal(composite(d), `${PICKED.activeProvider}:${PICKED.activeModel}`,
      `形二（不携 title）落盘后槽复合 = 回合内显式选定值，实得 ${composite(d)}`)
    assert.equal(d.title, "existing title", "形二：既有标题保留（无第二写、不抹标题）")
    assert.equal(d.history.length, 1, "形二：本回合内容落盘")
  }
})

// ─────────── B5：完成载荷的 turns 含刚收尾那一轮；VSC 存 → 核 applySession 开 ───────────

const FIRST_TURN = "first fixture request"
const SECOND_TURN = "second fixture request"

/** 夹具工具：`write` 真落盘（驱动轮记录的 changedFiles 面）。 */
function writeProbeTool(root) {
  return {
    name: "write",
    description: "fixture writer (turn-record probe)",
    parameters: { type: "object", properties: { path: { type: "string" }, content: { type: "string" } }, required: ["path"] },
    readonly: false,
    async execute(args) {
      writeFileSync(join(root, String(args.path)), String(args.content ?? ""))
      return `RESULT-WROTE ${args.path}`
    },
  }
}

/** 一个 SSE 回复：`{ calls }` = 工具回合（assistant tool_calls）；`{ text }` = 正文回合（收束本 run）。 */
function sseChunks(reply) {
  if (Array.isArray(reply.calls) && reply.calls.length > 0) {
    const toolCalls = reply.calls.map((call, i) => ({
      index: i,
      id: call.id ?? `call_${i}`,
      type: "function",
      function: { name: call.name, arguments: JSON.stringify(call.args ?? {}) },
    }))
    return [
      { choices: [{ delta: { tool_calls: toolCalls }, finish_reason: null }] },
      { choices: [{ delta: {}, finish_reason: "tool_calls" }] },
    ]
  }
  return [
    { choices: [{ delta: { content: reply.text ?? "" }, finish_reason: null }] },
    { choices: [{ delta: {}, finish_reason: "stop" }] },
  ]
}

/** 脚本化假 OpenAI SSE 端点（零外网、零付费端点；先例 = `docs/batches/2026-11-13-turn-history-projection.test.mjs`）：
 *  第 N 个请求（0 起）按 `handler(N)` 回放；请求体不参与断言，直接抽干。 */
function providerStub(handler) {
  let served = 0
  const server = createServer((req, res) => {
    req.resume()
    req.on("end", () => {
      const reply = handler(served++)
      res.writeHead(200, { "content-type": "text/event-stream", "cache-control": "no-cache", connection: "keep-alive" })
      for (const chunk of sseChunks(reply)) res.write(`data: ${JSON.stringify(chunk)}\n\n`)
      res.write("data: [DONE]\n\n")
      res.end()
    })
  })
  return new Promise((done) => server.listen(0, "127.0.0.1", () => done({
    port: server.address().port,
    close: () => new Promise((finish) => { server.closeAllConnections?.(); server.close(() => finish()) }),
  })))
}

/**
 * 判据（台账 #2395 追补）：完成载荷的 `turns` 里**最新那一条 = 刚收尾这一轮**（落后一轮即 0 条）；
 * 落槽后由核 `applySession`（= CLI 打开路径）读回，机读线无工具过程，最后一轮的请求 ∥ 回复 ∥ 任务状态都在。
 *
 * 驱动面：真核 `createAgent` ∥ `runAgent`（真模型调用打到本机假端点）+ 真 `ChatPanel._saveLines`——载荷逐字 =
 * `panel-callbacks.mjs` 的 onComplete：`{ seed, ...agentState(agent) }`（`panel-turn-loop.mjs` 就在
 * `await runAgent` 返回处调用它）。agent 取 VSC 载体形：`buildTopLevelAgent` 不播种五个轮载体（`_turns` 等），
 * 故先删掉——否则夹具会自带一张不属于本场景的账。
 */
test("B5 完成载荷 turns 含刚收尾那一轮；VSC 存槽 → 核 applySession 开：机读线无工具过程、最后一轮在", { timeout: 120_000 }, async (t) => {
  const panel = newPanel()
  const stub = await providerStub((index) => (index % 2 === 0
    ? { calls: [{ name: "write", args: { path: `turn-${index / 2}.txt`, content: "T" } }] }
    : { text: `answer ${Math.floor(index / 2)}` }))
  t.after(() => stub.close())

  const history = []
  const fullHistory = []
  const agent = createAgent({
    provider: { model: "deepseek-flash", baseURL: `http://127.0.0.1:${stub.port}`, apiKey: "sk-test" },
    tools: [writeProbeTool(proj)],
    config: { agent: { maxTurns: 12 }, traces: { enabled: false } },
    cwd: proj,
    autoApprove: true,
  })
  agent.activeProvider = "fixture"
  agent.activeModel = "deepseek-flash"
  agent.history = history
  agent._fullHistory = fullHistory
  for (const carrier of ["_turns", "_turnLedger", "_turnPending", "_turnStartLen", "_turnResponseEnd"]) delete agent[carrier]

  /** 一个用户回合 + 落槽（载荷形逐字 = onComplete）。 */
  const runTurn = async (input) => {
    await runAgent(agent, input)
    panel._saveLines(fullHistory, history, { seed: SEED, ...agentState(agent) }, SLOT)
    return disk()
  }
  /** 跨端打开 = CLI 面核 `applySession` 读同一槽。 */
  const openInCli = (data) => {
    const opened = createAgent({
      provider: { model: "deepseek-flash", baseURL: "http://127.0.0.1:9", apiKey: "k" },
      tools: [], config: { agent: { maxTurns: 12 }, traces: { enabled: false } }, cwd: proj,
    })
    applySession(opened, data)
    return opened
  }
  const slotTurns = (d) => (Array.isArray(d.turns) ? d.turns : [])
  const wire = (msgs) => JSON.stringify(msgs ?? [])
  const hasToolProcess = (msgs) => (msgs ?? []).some((m) => m?.role === "tool" || Array.isArray(m?.tool_calls))

  // ── 第一轮 ──
  const first = await runTurn(FIRST_TURN)
  assert.equal(slotTurns(first).length, 1, `完成载荷应带出刚收尾那一轮（落后一轮即 0 条），实得 ${slotTurns(first).length} 条`)
  assert.equal(slotTurns(first)[0].userRequest, FIRST_TURN, "轮记录的请求 = 本轮输入")
  assert.equal(slotTurns(first)[0].finalResponse, "answer 0", "轮记录的回复 = 本轮最终回复")
  assert.ok(slotTurns(first)[0].taskState, "有工具活动 ⇒ 任务状态在场")

  const cli1 = openInCli(first)
  assert.equal(hasToolProcess(cli1.history), false, `跨端打开后机读线不得装工具过程：${wire(cli1.history).slice(0, 1200)}`)
  assert.ok(wire(cli1.history).includes(FIRST_TURN), `机读线带本轮的请求：${wire(cli1.history).slice(0, 1200)}`)
  assert.ok(wire(cli1.history).includes("answer 0"), "机读线带本轮的回复")
  assert.ok(wire(cli1.history).includes(TASK_STATE_MARK), "机读线带任务状态")
  assert.equal(cli1._turns.length, 1, "轮记录随槽恢复")

  // ── 第二轮：载荷里最新的仍是刚收尾那一轮（不是倒数第二轮）──
  const second = await runTurn(SECOND_TURN)
  assert.equal(slotTurns(second).length, 2, `两轮后应 2 条轮记录，实得 ${slotTurns(second).length} 条`)
  assert.equal(slotTurns(second).at(-1).userRequest, SECOND_TURN, "载荷里最新那一条 = 刚收尾这一轮")
  assert.equal(slotTurns(second).at(-1).finalResponse, "answer 1", "最新那一条的回复 = 本轮最终回复")

  const cli2 = openInCli(second)
  assert.equal(hasToolProcess(cli2.history), false, `两轮之后机读线仍无工具过程：${wire(cli2.history).slice(0, 1200)}`)
  assert.ok(wire(cli2.history).includes(FIRST_TURN) && wire(cli2.history).includes(SECOND_TURN), "两轮的请求都在机读线")
  assert.ok(wire(cli2.history).includes("answer 0") && wire(cli2.history).includes("answer 1"), "两轮的回复都在机读线")
  assert.equal(cli2._turns.length, 2, "两轮记录随槽恢复")
})