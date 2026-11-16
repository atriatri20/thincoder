/**
 * 三档工作模式：真实 webview 控件、host 路由、会话槽与配置写盘的对拍测试。
 * 覆盖固定选项、setMode 出站、恢复/切槽/reload、旧 engineering 读取、非法值零写、
 * 工具驱动重推、全局默认与当前会话分离、engineering×PLAN 互斥。
 */
import assert from "node:assert/strict"
import { after, test } from "node:test"
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs"
import { registerHooks } from "node:module"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { pathToFileURL } from "node:url"
import { GlobalRegistrator } from "@happy-dom/global-registrator"

const work = mkdtempSync(join(tmpdir(), "vsc-work-mode-"))
const proj = join(work, "proj")
const sessions = join(work, "sessions")
mkdirSync(proj, { recursive: true })
mkdirSync(sessions, { recursive: true })
const cfgPath = join(work, "config.json")
writeFileSync(cfgPath, JSON.stringify({ providers: [], agent: { mode: "normal" } }, null, 2))

const stubPath = join(work, "vscode-stub.mjs")
writeFileSync(stubPath, `export const window = { showInformationMessage: async () => undefined, showErrorMessage: () => undefined, showWarningMessage: async () => undefined, showInputBox: async () => undefined, onDidChangeActiveTextEditor: () => ({ dispose() {} }), createOutputChannel: () => ({ appendLine() {}, dispose() {}, show() {} }), createStatusBarItem: () => ({ show() {}, hide() {}, dispose() {} }) }
export const workspace = { workspaceFolders: [{ uri: { fsPath: ${JSON.stringify(proj)} }, name: "proj", index: 0 }], getConfiguration: () => ({ get: (_k, d) => d, update: async () => {} }), onDidChangeConfiguration: () => ({ dispose() {} }), onDidChangeWorkspaceFolders: () => ({ dispose() {} }), getWorkspaceFolder: () => null, findFiles: async () => [], fs: {} }
export const commands = { registerCommand: () => ({ dispose() {} }), executeCommand: async () => undefined }
export const env = { language: "zh-CN", clipboard: { readText: async () => "" } }
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
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier === "vscode") return { url: pathToFileURL(stubPath).href, shortCircuit: true }
    return nextResolve(specifier, context)
  },
})

GlobalRegistrator.register()
const pageHtml = readFileSync(new URL("../webview/index.html", import.meta.url), "utf8")
document.body.innerHTML = pageHtml
  .slice(pageHtml.indexOf("<body>") + "<body>".length, pageHtml.indexOf("<script"))
  .replace(/<\/body>[\s\S]*$/, "")
const posted = []
globalThis.acquireVsCodeApi = () => ({ postMessage: (m) => posted.push(m), getState: () => undefined, setState: () => {} })

const { _setConfigPathForTest, _resetConfigPathForTest } = await import("@thincoder/core/config-io.mjs")
_setConfigPathForTest(cfgPath)
const sessionIo = await import("../src/extension/session-io.mjs")
sessionIo._setSessionsDirForTest(sessions)
const { ChatPanel } = await import("../src/extension/chat-panel.mjs")
const { handlePanelMessage, stopLiveHeartbeat } = await import("../src/extension/panel-messages.mjs")
const { _setShellDetectForTest, agentSettings, saveAgentSettingsFromPanel } = await import("../src/extension/settings.mjs")
_setShellDetectForTest(async () => [])
const { applySlotSessionState, syncToolDrivenDisplayState } = await import("../src/agent/agent-state.mjs")
const { removeTempDirBestEffort } = await import("../../test/teardown.mjs")

const { setStrings } = await import("../webview/i18n.js")
const zh = JSON.parse(readFileSync(new URL("../locales/zh.json", import.meta.url), "utf8"))
setStrings(zh)
const { S } = await import("../webview/state.js")
const { initSettings } = await import("../webview/settings.js")
const { initMessageLoop } = await import("../webview/chat-messages.js")
const settingsApi = initSettings({ onClose: () => {}, getModels: () => [] })
initMessageLoop({ ...settingsApi, dismissLoadingScreenOnce: () => {}, _loadingTimeout: null })

const receive = (data) => window.dispatchEvent(new window.MessageEvent("message", { data }))
const change = (el) => el.dispatchEvent(new window.Event("change", { bubbles: true }))
const modeSelect = () => document.getElementById("mode-select")
const planBtn = () => document.getElementById("plan-btn")
const inputRow = () => document.getElementById("input-row")
const latestAgentMode = (messages) => messages.filter((m) => m.type === "agentSettings").at(-1)?.settings?.mode
const saveSlot = (slot, fields) => sessionIo.saveSessionToSlot(proj, slot, {
  version: 2, cwd: proj, title: "", history: [], contextHistory: [], tasks: [],
  planMode: false, goal: null, autoApprove: false, advisor: null, ...fields,
})
const newPanel = (slot = 1) => {
  const messages = []
  const panel = new ChatPanel({
    subscriptions: [],
    workspaceState: { get: () => undefined, update: async () => {} },
    globalState: { get: () => undefined, update: async () => {} },
    extensionUri: { fsPath: proj },
  })
  panel._slot = slot
  panel._panel = { webview: { postMessage: (m) => messages.push(m) } }
  return { panel, messages }
}

after(() => {
  window.dispatchEvent(new window.Event("unload"))
  _resetConfigPathForTest()
  sessionIo._resetSessionsDirForTest()
  removeTempDirBestEffort(work)
})

test("共享 MODE 固定三选项，三值均经 setMode 出站并同步单一 S._mode", () => {
  assert.deepEqual([...modeSelect().options].map((o) => o.value), ["tiny", "normal", "engineering"])
  for (const mode of ["tiny", "normal", "engineering"]) {
    posted.length = 0
    modeSelect().value = mode
    change(modeSelect())
    assert.deepEqual(posted, [{ type: "setMode", value: mode }])
    assert.equal(S._mode, mode)
    assert.equal(modeSelect().value, mode)
  }
  assert.equal(S._engOn, undefined, "webview 不再持有第二枚 ENG 布尔状态")
})

test("agentSettings 恢复三档与旧布尔；engineering×PLAN 在控件和入站两侧都互斥", () => {
  receive({ type: "agentSettings", settings: { mode: "normal" } })
  receive({ type: "planMode", active: true })
  assert.equal(planBtn().classList.contains("active"), true)
  assert.equal(inputRow().classList.contains("plan-active"), true)

  modeSelect().value = "engineering"
  change(modeSelect())
  assert.equal(planBtn().disabled, true)
  assert.equal(S._planActive, false)
  assert.equal(inputRow().classList.contains("plan-active"), false)
  const planPosts = posted.filter((m) => m.type === "setPlanMode").length
  planBtn().click()
  assert.equal(posted.filter((m) => m.type === "setPlanMode").length, planPosts, "工程档 PLAN 点击零出站")
  receive({ type: "planMode", active: true })
  assert.equal(S._planActive, false, "即使收到矛盾推送也不复活半状态")

  receive({ type: "agentSettings", settings: { mode: "tiny" } })
  assert.equal(modeSelect().value, "tiny")
  assert.equal(planBtn().disabled, false)
  planBtn().click()
  assert.equal(posted.at(-1).type, "setPlanMode")
  assert.equal(posted.at(-1).value, true)

  receive({ type: "agentSettings", settings: { engineering: true } })
  assert.equal(modeSelect().value, "engineering", "旧 host 的 engineering=true 只读迁移为工程档")
  receive({ type: "agentSettings", settings: { engineering: false } })
  assert.equal(modeSelect().value, "normal", "旧 false 迁移为普通档")
})

test("host setMode 三值写当前槽；非法值零写；PLAN 互斥作用于真实槽", async () => {
  saveSlot(1, { mode: "normal", planMode: true })
  const { panel, messages } = newPanel()
  const legacyBefore = readFileSync(sessionIo.slotPath(proj, 1), "utf8")
  await handlePanelMessage(panel, { type: "setEngineeringEnabled", value: true })
  assert.equal(readFileSync(sessionIo.slotPath(proj, 1), "utf8"), legacyBefore, "旧 ENG 写消息不再提供第二个可写状态")
  for (const value of [null, true, false, "", "ENG", "tiny ", 1, {}, undefined]) {
    const before = readFileSync(sessionIo.slotPath(proj, 1), "utf8")
    await handlePanelMessage(panel, { type: "setMode", value })
    assert.equal(readFileSync(sessionIo.slotPath(proj, 1), "utf8"), before, `非法值 ${JSON.stringify(value)} 零写`)
  }
  for (const mode of ["tiny", "normal", "engineering"]) {
    await handlePanelMessage(panel, { type: "setMode", value: mode })
    assert.equal(sessionIo.loadSlot(proj, 1).mode, mode)
    assert.equal(latestAgentMode(messages), mode, "每次合法写后经同一 agentSettings 快照重推")
  }
  assert.equal(sessionIo.loadSlot(proj, 1).planMode, false, "进入 engineering 先清 PLAN")
  assert.equal(messages.some((m) => m.type === "planMode" && m.active === false), true)

  await handlePanelMessage(panel, { type: "setPlanMode", value: true })
  assert.equal(sessionIo.loadSlot(proj, 1).planMode, false, "工程档开启 PLAN 被 host 拒绝")
  await handlePanelMessage(panel, { type: "setMode", value: "normal" })
  await handlePanelMessage(panel, { type: "setPlanMode", value: true })
  assert.equal(sessionIo.loadSlot(proj, 1).planMode, true, "普通档仍可开启 PLAN")
})

test("切槽与 reload 都从目标槽重推并回填 MODE", async () => {
  saveSlot(1, { mode: "normal" })
  saveSlot(2, { mode: "tiny" })
  const { panel, messages } = newPanel(1)
  await handlePanelMessage(panel, { type: "switchSession", slot: 2 })
  assert.equal(panel._slot, 2)
  assert.equal(latestAgentMode(messages), "tiny")
  receive({ type: "agentSettings", settings: agentSettings({ cwd: proj, slot: panel._slot }) })
  assert.equal(modeSelect().value, "tiny")

  const reloaded = newPanel(2)
  await handlePanelMessage(reloaded.panel, { type: "webviewReady" })
  stopLiveHeartbeat(reloaded.panel)
  assert.equal(latestAgentMode(reloaded.messages), "tiny", "reload 在槽绑定后重推目标槽 mode")
  for (const m of reloaded.messages.filter((m) => m.type === "agentSettings")) receive(m)
  assert.equal(modeSelect().value, "tiny")
})

test("旧槽 engineering 仅作读取迁移；合法槽 mode 优先", async () => {
  saveSlot(3, { engineering: true })
  assert.equal(agentSettings({ cwd: proj, slot: 3 }).mode, "engineering")
  saveSlot(3, { engineering: false })
  assert.equal(agentSettings({ cwd: proj, slot: 3 }).mode, "normal")
  saveSlot(3, { mode: "minimal", engineering: true })
  assert.equal(agentSettings({ cwd: proj, slot: 3 }).mode, "tiny", "旧槽 mode 读到即归一为 tiny")
  const writer = newPanel(3).panel
  writer._saveLines([], [], {}, 3)
  assert.equal(sessionIo.loadSlot(proj, 3).engineering, undefined, "合法 mode 保存后旧布尔退役")
  saveSlot(3, { mode: "invalid", engineering: true })
  writer._saveLines([], [], {}, 3)
  assert.equal(sessionIo.loadSlot(proj, 3).engineering, true, "无合法 mode 时不得丢掉唯一旧迁移来源")

  const agent = { _engDesignTokens: null }
  const cfg = { mode: "normal", engineering: false, agentFields: {}, advisor: {} }
  const applied = applySlotSessionState(agent, { slot: { mode: "tiny", planMode: true } }, { cfg })
  assert.equal(applied.mode, "tiny")
  assert.equal(agent.config.agent.mode, "tiny")
  assert.equal(agent.config.agent.engineering, false, "engineering 只是 mode 的派生兼容值")
  assert.equal(agent._planMode, true, "tiny 不触发 PLAN 互斥")

  const legacy = { _engDesignTokens: null }
  applySlotSessionState(legacy, { slot: null }, { cfg: { mode: undefined, engineering: true, agentFields: {}, advisor: {} } })
  assert.equal(legacy.config.agent.mode, "engineering", "旧配置在 mode 缺席时迁移为 engineering")
  const mirror = { _engDesignTokens: null }
  applySlotSessionState(mirror, { slot: null, engState: { enabled: true } }, { cfg })
  assert.equal(mirror.config.agent.mode, "engineering", "旧子代理镜像 enabled 也只作读取迁移")
})

test("配置 mode:null 是在场非法值，hydrateRun 与设置快照都回 normal", async () => {
  writeFileSync(cfgPath, JSON.stringify({ providers: [], agent: { mode: null, engineering: true } }, null, 2))
  assert.equal(agentSettings(null).mode, "normal", "核解析器对在场的 null 不读取旧布尔")
  const { buildTopLevelAgent, hydrateRun } = await import("../src/agent/setup.mjs")
  const agent = buildTopLevelAgent()
  await hydrateRun(agent, {
    provider: { name: "fixture", model: "fixture-model" }, cwd: proj, input: "", opts: {},
    depth: 1, role: "explore", getAuto: () => false,
  })
  assert.equal(agent.config.agent.mode, "normal", "VSC 装配必须与核一样把 null 判为非法在场值")
  assert.equal(agent.config.agent.engineering, false)
})

test("工具把 mode 改为 tiny 也触发统一设置重推，不只比较 engineering", () => {
  const pushed = []
  const agent = { _modeShown: "normal", config: { agent: { mode: "tiny", engineering: false } } }
  const result = syncToolDrivenDisplayState(agent, { onEngMode: (mode) => pushed.push(mode) })
  assert.deepEqual(pushed, ["tiny"])
  assert.equal(result.eng, true)
  assert.equal(agent._modeShown, "tiny")
  syncToolDrivenDisplayState(agent, { onEngMode: (mode) => pushed.push(mode) })
  assert.deepEqual(pushed, ["tiny"], "相同快照幂等，不重复推送")
})

test("ENG 工具镜像携带完整 mode 并写同一槽", async () => {
  saveSlot(5, { mode: "normal" })
  const { wireAgentToolSeams } = await import("../src/agent/setup-tooltable.mjs")
  await wireAgentToolSeams()
  const { engTool } = await import("@thincoder/core/agent-tools/eng.mjs")
  const agent = {
    config: { agent: { mode: "normal", engineering: false } }, cwd: proj,
    _engPersist: { cwd: proj, slot: 5 }, _pendingReminders: [], _engDesignTokens: new Map(),
    _touchedFiles: [], _advisorRuns: new Map(),
  }
  await engTool.execute({ action: "enter" }, { agent, cwd: proj })
  assert.equal(agent.config.agent.mode, "engineering")
  assert.equal(sessionIo.loadSlot(proj, 5).mode, "engineering", "enter 镜像写 engineering，不是布尔")
  await engTool.execute({ action: "exit" }, { agent, cwd: proj })
  assert.equal(agent.config.agent.mode, "normal")
  assert.equal(sessionIo.loadSlot(proj, 5).mode, "normal", "exit 镜像写 normal，不是布尔")
})

test("全局默认模式三档原子写、非法零写，且不改变当前会话槽", () => {
  saveSlot(4, { mode: "engineering" })
  writeFileSync(cfgPath, JSON.stringify({ providers: [], agent: { mode: "normal", engineering: true } }, null, 2))
  const snapshot = agentSettings({ cwd: proj, slot: 4 })
  assert.equal(snapshot.defaultMode, "normal")
  assert.equal(snapshot.mode, "engineering")
  assert.equal(Object.hasOwn(snapshot, "engineering"), false, "设置快照不提供第二个可写 ENG 状态")

  settingsApi.openSettings()
  receive({ type: "agentSettings", settings: snapshot })
  assert.equal(modeSelect().value, "engineering", "会话控件读槽 mode")
  assert.equal(document.getElementById("ag-mode").value, "normal", "设置控件读全局 defaultMode")

  posted.length = 0
  const defaultSelect = document.getElementById("ag-mode")
  defaultSelect.value = "tiny"
  change(defaultSelect)
  assert.deepEqual(posted, [{ type: "saveAgentSettings", settings: { mode: "tiny" } }])
  let raw = null
  for (const mode of ["tiny", "normal", "engineering"]) {
    assert.equal(saveAgentSettingsFromPanel({ mode }), null)
    raw = JSON.parse(readFileSync(cfgPath, "utf8"))
    assert.equal(raw.agent.mode, mode)
    assert.equal(raw.agent.engineering, undefined, "全局写 mode 时退役旧布尔")
  }
  assert.equal(sessionIo.loadSlot(proj, 4).mode, "engineering", "全局默认不得覆盖既有会话")
  assert.equal(saveAgentSettingsFromPanel({ mode: "tiny", maxTurns: 201 }), null)
  raw = JSON.parse(readFileSync(cfgPath, "utf8"))
  assert.deepEqual({ mode: raw.agent.mode, maxTurns: raw.agent.maxTurns }, { mode: "tiny", maxTurns: 201 }, "mode 与其他 agent 字段同一原子写载荷")

  const before = readFileSync(cfgPath, "utf8")
  for (const mode of ["", "normal ", true, null, 1, {}]) {
    assert.notEqual(saveAgentSettingsFromPanel({ mode, maxTurns: 201 }), null)
    assert.equal(readFileSync(cfgPath, "utf8"), before, `非法全局 mode ${JSON.stringify(mode)} 整载荷零写`)
  }
  raw = JSON.parse(before)
  assert.equal(raw.agent.maxTurns, 201, "非法 mode 同行的其他字段也未写入")
})
