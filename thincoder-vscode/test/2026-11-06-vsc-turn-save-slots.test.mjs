/**
 * 2026-11-06-vsc-turn-save-slots.test.mjs — 批 `2026-11-06-vsc-test-face` §2 · B1 ∥ B2 ∥ B3 ∥ B4
 *
 * 判据出处 = `docs/vsc/requirements/WEBVIEW.md` F-W14 行（「回合中改模型须落盘（不得静默覆盖）」）——
 * 回合尾落盘**四处**，逐处一条 `test()`：
 *   B1 `panel-callbacks.mjs` `buildPanelCallbacks` 的 `onComplete` → `_saveLines(… , { seed, ...agentState }, turnSlot)`
 *   B2 同档 `onDistilled` → `_saveLines(… , { seed, ...lastAgentState }, distillSlot)`（前置槽守卫 + 捕获态）
 *   B3 `panel-turn-loop.mjs` `runTurnLoop` 的错误/中止落盘点 → `_saveLines(… , { seed }, turnSlot)`
 *   B4 `panel-turn-stages.mjs` `finalizeTurn` → `_saveLines(… , title ? { seed, title } : { seed }, turnSlot)`（两形）
 *
 * **判据 = 落盘点的可观察结果**（不是载荷表达式）：驱动到落盘点后，会话槽文件里的复合
 * `activeProvider:activeModel` **仍是回合内显式选定值**——回合起点的 `slotStamp` 不夺权。
 * 「回合内显式选定」的写面 = `panel-messages.mjs` 的 `selectModel` 径（立即写槽），本档用**同一个
 * `saveLines`** 以同一载荷形落一次，作为夹具前提。
 *
 * 驱动面：真 `ChatPanel`（真 `_saveLines` → 真 `saveLines`）+ 三个真驱动入口（`buildPanelCallbacks`
 * 的回调闭包 ∥ `runTurnLoop` ∥ `finalizeTurn`）；`config.json` 与 sessions 目录都指到临时目录
 * （核 `_setConfigPathForTest` ∥ 端壳 `_setSessionsDirForTest`），不摸本机。
 *
 * 静态对账不算覆盖：设计档 `docs/vsc/design/WEBVIEW.md` §4.2 明写静态扫只数调用点、判不出哪处让
 * `slotStamp` 夺权——故四条逐路驱动到落盘点。
 */
import assert from "node:assert/strict"
import { after, test } from "node:test"
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs"
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
const turnAgentState = (engineering) => ({
  engineering, advisorGuard: false, engDesignTokens: null,
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

  callbacks.onComplete("done", turnAgentState(true))

  const d = disk()
  assert.equal(composite(d), `${PICKED.activeProvider}:${PICKED.activeModel}`,
    `回合尾落盘后槽复合 = 回合内显式选定值（起跑印章不得夺权），实得 ${composite(d)}`)
  assert.equal(d.engineering, true, "落盘点确实走的是 onComplete 的载荷（agentState 的 engineering 落盘）")
  assert.equal(d.history.length, 1, "本回合内容落盘（不是空写）")
})

test("B2 panel-callbacks.mjs 同函数·distillSlot（携 ...lastAgentState + 前置槽守卫）", () => {
  const panel = newPanel()
  pickDuringTurn(panel)
  const fullHistory = [USER_MSG]
  const history = [{ role: "user", content: USER_MSG.content }]
  const callbacks = buildPanelCallbacks(panel, callbackDeps(fullHistory, history))

  // 完成拍先落（`lastAgentState` 在 onComplete 写、onDistilled 读——闭包携带）
  callbacks.onComplete("done", turnAgentState(true))
  // 把槽上的 engineering 改成 false（= 完成拍之后盘面被别处改写），用于辨认 distill 落盘确实用的是捕获态
  panel._saveLines([USER_MSG], history, { engineering: false, ...PICKED }, SLOT)
  assert.equal(disk().engineering, false, "夹具前提：盘面 engineering 已改 false")

  callbacks.onDistilled()

  const d = disk()
  assert.equal(composite(d), `${PICKED.activeProvider}:${PICKED.activeModel}`,
    `distill 落盘后槽复合 = 回合内显式选定值，实得 ${composite(d)}`)
  assert.equal(d.engineering, true, "distill 落盘携的是 onComplete 捕获的 lastAgentState（不是当前盘面）")

  // 前置槽守卫：会话已切走（panel._slot ≠ distillSlot）⇒ 零写（压缩属于旧会话，绝不写进新槽）
  panel._saveLines([USER_MSG], history, { engineering: false, ...PICKED }, SLOT)
  panel._slot = 2
  callbacks.onDistilled()
  assert.equal(disk().engineering, false, "槽守卫：panel._slot ≠ distillSlot ⇒ onDistilled 零写")
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