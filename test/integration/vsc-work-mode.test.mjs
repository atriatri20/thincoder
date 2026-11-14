/**
 * vsc-work-mode.test.mjs — VSC 三档工作模式根集成用例（批次 #2393）。
 *
 * 真实入口链：MODE 控件（webview）→ setMode 出站 → host handlePanelMessage →
 * setSlotMode 落槽 → agentSettings 快照恢复回填控件。
 *
 * 夹具复用 thincoder-vscode 包内对拍测试的最小夹具（vscode stub + happy-dom +
 * 真实 webview index.html / i18n / state / settings），只保留一个主场景（三档出站
 * + 槽持久化/恢复）+ 一个非法值零写，不复制包内全套。
 */
import assert from "node:assert/strict"
import { after, test } from "node:test"
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs"
import { registerHooks } from "node:module"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { pathToFileURL } from "node:url"
import { GlobalRegistrator } from "../../thincoder-vscode/node_modules/@happy-dom/global-registrator/lib/index.js"

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
const pageHtml = readFileSync(new URL("../../thincoder-vscode/webview/index.html", import.meta.url), "utf8")
document.body.innerHTML = pageHtml
  .slice(pageHtml.indexOf("<body>") + "<body>".length, pageHtml.indexOf("<script"))
  .replace(/<\/body>[\s\S]*$/, "")
const posted = []
globalThis.acquireVsCodeApi = () => ({ postMessage: (m) => posted.push(m), getState: () => undefined, setState: () => {} })

const { _setConfigPathForTest, _resetConfigPathForTest } = await import("../../thincoder-core/config-io.mjs")
_setConfigPathForTest(cfgPath)
const sessionIo = await import("../../thincoder-vscode/src/extension/session-io.mjs")
sessionIo._setSessionsDirForTest(sessions)
const { ChatPanel } = await import("../../thincoder-vscode/src/extension/chat-panel.mjs")
const { handlePanelMessage } = await import("../../thincoder-vscode/src/extension/panel-messages.mjs")
const { _setShellDetectForTest, agentSettings } = await import("../../thincoder-vscode/src/extension/settings.mjs")
_setShellDetectForTest(async () => [])
const { removeTempDirBestEffort } = await import("../teardown.mjs")

const { setStrings } = await import("../../thincoder-vscode/webview/i18n.js")
const zh = JSON.parse(readFileSync(new URL("../../thincoder-vscode/locales/zh.json", import.meta.url), "utf8"))
setStrings(zh)
const { S } = await import("../../thincoder-vscode/webview/state.js")
const { initSettings } = await import("../../thincoder-vscode/webview/settings.js")
const { initMessageLoop } = await import("../../thincoder-vscode/webview/chat-messages.js")
const settingsApi = initSettings({ onClose: () => {}, getModels: () => [] })
initMessageLoop({ ...settingsApi, dismissLoadingScreenOnce: () => {}, _loadingTimeout: null })

const receive = (data) => window.dispatchEvent(new window.MessageEvent("message", { data }))
const change = (el) => el.dispatchEvent(new window.Event("change", { bubbles: true }))
const modeSelect = () => document.getElementById("mode-select")
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

test("三档 MODE 控件出站 → host setMode 落槽 → agentSettings 快照恢复回填", async () => {
  assert.deepEqual([...modeSelect().options].map((o) => o.value), ["tiny", "normal", "engineering"])
  const { panel, messages } = newPanel(1)
  saveSlot(1, { mode: "normal" })
  for (const mode of ["tiny", "normal", "engineering"]) {
    // ① 控件出站：改选三档 → 真实 webview 控件经 initMessageLoop 发 setMode
    posted.length = 0
    modeSelect().value = mode
    change(modeSelect())
    assert.deepEqual(posted, [{ type: "setMode", value: mode }])
    assert.equal(S._mode, mode)
    // ② host 分发：同一 setMode 载荷走真实 handlePanelMessage → 槽落盘 + agentSettings 快照重推
    await handlePanelMessage(panel, { type: "setMode", value: mode })
    assert.equal(sessionIo.loadSlot(proj, 1).mode, mode, `槽落盘 mode=${mode}`)
    assert.equal(latestAgentMode(messages), mode, "每次合法写后经同一 agentSettings 快照重推")
    // ③ 快照恢复：把快照送回 webview → 控件恢复目标 mode
    receive({ type: "agentSettings", settings: agentSettings({ cwd: proj, slot: 1 }) })
    assert.equal(modeSelect().value, mode, `控件恢复 mode=${mode}`)
  }
})

test("host setMode 非法值零写，槽文件逐字节不变", async () => {
  saveSlot(1, { mode: "normal" })
  const { panel } = newPanel(1)
  for (const value of [null, true, false, "", "ENG", "tiny ", 1, {}, undefined]) {
    const before = readFileSync(sessionIo.slotPath(proj, 1), "utf8")
    await handlePanelMessage(panel, { type: "setMode", value })
    assert.equal(readFileSync(sessionIo.slotPath(proj, 1), "utf8"), before, `非法值 ${JSON.stringify(value)} 零写`)
  }
  assert.equal(sessionIo.loadSlot(proj, 1).mode, "normal", "非法值不改变槽上 mode")
})
