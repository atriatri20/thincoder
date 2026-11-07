/**
 * 2026-11-06-vsc-settings-empty-no-write.test.mjs — 批 `2026-11-06-vsc-test-face` §2 · A2
 *
 * 判据出处 = `docs/vsc/requirements/WEBVIEW.md` F-W10 行：「① 快照未达时 blur/Enter 任一代理控件
 * ⇒ **零写盘**（`config.json` 逐字不变）；② 显式清空 ⇒ 才删除」。
 *
 * 一条判据的两端，同一条 `test()` 顺次断（§2 关键决策 1 的例外：两半是同一条判据的两端）：
 *   ① **前端半** = `webview/settings-env.js` 的改动门（`_pxBaseline`）——没被用户编辑过的控件不发值；
 *   ② **宿主半** = `src/extension/settings.mjs` 的两条删除径（`saveProxySettingsFromPanel` 空 uri ⇒ 删
 *      `proxy` 整块 · `handleSetProviderProxy` `false` ⇒ 删 `providers[].proxy` 键）。
 * N-W8 明写这两条现零测试命中，故两半都真跑。
 *
 * 驱动面：前端 = 真 `openSettings()` + 真分发器（**不手工灌 SS**——N-W8 的「掩盖源」禁令）；
 * 宿主 = 真 `handleSaveProxySettings` ∥ 真 `handleSetProviderProxy`（`panel-messages-settings.mjs`），
 * config / sessions 两处都指到临时目录（产品测试缝）。
 *
 * 修复前必红取证（完整读数落批次档 §5）：现树零改的前提下用 `module.registerHooks` 的 `load` 覆写，
 * 把本档对应的修复点换回**修复前原文**（`37cb1b34` 的 `bindEnvControls` autoSaveProxy 段：每个控件
 * 的 `change` 整块发值、空 uri 照发）后再跑本档 ⇒ 红。
 * 为什么不走「检出修复前提交的隔离工作树」：那个提交还没有本档夹具依赖的
 * `thincoder-core/config-io.mjs` 与 session/embed 测试缝——在那里跑出的是模块解析噪声而非行为红。
 */
import assert from "node:assert/strict"
import { after, test } from "node:test"
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs"
import { registerHooks } from "node:module"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { pathToFileURL } from "node:url"
import { GlobalRegistrator } from "@happy-dom/global-registrator"

// ─── 夹具：临时项目根 + 隔离 config.json（代理 ∥ provider 行 proxy 都已配 = 「既有配置」）────────
const work = mkdtempSync(join(tmpdir(), "vsc-empty-no-write-"))
const proj = join(work, "proj")
const sessions = join(work, "sessions")
mkdirSync(proj, { recursive: true })
mkdirSync(sessions, { recursive: true })
const cfgPath = join(work, "config.json")
const PROXY_URI = "http://127.0.0.1:7890"
writeFileSync(cfgPath, JSON.stringify({
  proxy: { uri: PROXY_URI, web: true },
  providers: [{ name: "deepseek", apiKey: "sk-fixture", proxy: true }],
}, null, 2))

// ─── `vscode` 宿主模块桩（先例 = 仓根 `test/integration/tester-role.test.mjs`）──────────────
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

// ─── 前端宿主（happy-dom）+ 真 `index.html` 骨架 ─────────────────────────────────────────
GlobalRegistrator.register()
const pageHtml = readFileSync(new URL("../webview/index.html", import.meta.url), "utf8")
document.body.innerHTML = pageHtml
  .slice(pageHtml.indexOf("<body>") + "<body>".length, pageHtml.indexOf("<script"))
  .replace(/<\/body>[\s\S]*$/, "")

const posted = []
globalThis.acquireVsCodeApi = () => ({ postMessage: (m) => { posted.push(m) }, getState: () => undefined, setState: () => {} })

const { _setConfigPathForTest, _resetConfigPathForTest } = await import("../../thincoder-core/config-io.mjs")
_setConfigPathForTest(cfgPath)
const { _setSessionsDirForTest, _resetSessionsDirForTest } = await import("../src/extension/session-io.mjs")
_setSessionsDirForTest(sessions)

const { ChatPanel } = await import("../src/extension/chat-panel.mjs")
const { handleSaveProxySettings, handleSetProviderProxy } = await import("../src/extension/panel-messages-settings.mjs")
const { _setShellDetectForTest } = await import("../src/extension/settings.mjs")
_setShellDetectForTest(async () => [{ name: "pwsh", value: "pwsh" }])
const { removeTempDirBestEffort } = await import("../../test/teardown.mjs")

const { setStrings } = await import("../webview/i18n.js")
setStrings(JSON.parse(readFileSync(new URL("../locales/zh.json", import.meta.url), "utf8")))
const { initSettings } = await import("../webview/settings.js")
const { initMessageLoop } = await import("../webview/chat-messages.js")

const api = initSettings({ onClose: () => {}, getModels: () => [] })
initMessageLoop({ ...api, dismissLoadingScreenOnce: () => {}, _loadingTimeout: null })

const receive = (data) => window.dispatchEvent(new window.MessageEvent("message", { data }))
/** 控件 change（浏览器语义：blur / Enter 提交都落成一次 change）。 */
const change = (el) => el.dispatchEvent(new window.Event("change", { bubbles: true }))
const saveProxyMsgs = () => posted.filter((m) => m.type === "saveProxySettings")
const cfgJson = () => JSON.parse(readFileSync(cfgPath, "utf8"))

after(() => {
  window.dispatchEvent(new window.Event("unload"))
  _resetConfigPathForTest()
  _resetSessionsDirForTest()
  removeTempDirBestEffort(work)
})

test("A2 快照未达时 blur/Enter 代理控件 ⇒ 零发值；显式清空 ⇒ 才发删除", async () => {
  const panel = new ChatPanel({
    subscriptions: [],
    workspaceState: { get: () => undefined, update: async () => {} },
    globalState: { get: () => undefined, update: async () => {} },
    extensionUri: { fsPath: proj },
  })
  panel._slot = 1
  panel._panel = null // 宿主推送面本档不断（A1 断）；这里只断写盘

  // ── ①「快照未达」：只投 agentSettings（打开等待器的建面触发拍），代理快照尚未到 ──
  posted.length = 0
  api.openSettings()
  receive({ type: "agentSettings", settings: {} })
  const uriEl = () => document.getElementById("px-uri")
  const webEl = () => document.getElementById("px-web")
  assert.equal(uriEl().value, "", "快照未达 ⇒ 控件按空值建面（正是事故现场：屏空而盘上有值）")
  assert.equal(cfgJson().proxy.uri, PROXY_URI, "夹具前提：盘上确有代理配置")

  const beforeBytes = readFileSync(cfgPath, "utf8")
  change(uriEl()) // blur / Enter，用户什么都没改
  change(webEl())
  assert.deepEqual(saveProxyMsgs(), [], "未编辑过的控件 ⇒ 零发值（空值不得静默清除既有配置）")
  assert.equal(readFileSync(cfgPath, "utf8"), beforeBytes, "零发值 ⇒ config.json 逐字不变")

  // ── ②「快照已达、控件未被编辑」：回填后同值 change 仍零发值（幂等门）──
  receive({ type: "proxySettings", settings: { uri: PROXY_URI, web: true } })
  assert.equal(uriEl().value, PROXY_URI, "快照到达 ⇒ 控件回填真值")
  change(uriEl())
  change(webEl())
  assert.deepEqual(saveProxyMsgs(), [], "同值 change 不重发（基线判据：屏幕值 = 基线 ⇒ 零发值）")
  assert.equal(readFileSync(cfgPath, "utf8"), beforeBytes, "仍未写盘")

  // ── ③「显式用户动作」：清空 `#px-uri` ⇒ 才发删除，且载荷只含被编辑字段 ──
  uriEl().value = ""
  change(uriEl())
  assert.equal(saveProxyMsgs().length, 1, "显式清空 ⇒ 恰一次发值")
  assert.deepEqual(saveProxyMsgs()[0].settings, { uri: "" }, "载荷只含本次被编辑字段（逐字段载荷）")

  // 宿主半：真 handler ⇒ `saveProxySettingsFromPanel` 空 uri ⇒ 删 `proxy` 整块
  handleSaveProxySettings(panel, saveProxyMsgs()[0])
  assert.equal(cfgJson().proxy, undefined, "显式清空 ⇒ 宿主删 proxy 整块（设计明载语义）")
  assert.equal(cfgJson().providers?.[0]?.name, "deepseek", "只删 proxy——其余配置原样")

  // ── ④ provider 行的 proxy 布尔（同一条「空/false ⇒ 删键」族）：false 删键 ∥ true 写键 ──
  const cfgAfterProxy = readFileSync(cfgPath, "utf8")
  handleSetProviderProxy(panel, { name: "deepseek", proxy: false })
  assert.deepEqual(cfgJson().providers[0], { name: "deepseek", apiKey: "sk-fixture" }, "proxy:false ⇒ 删 providers[].proxy 键")
  assert.notEqual(readFileSync(cfgPath, "utf8"), cfgAfterProxy, "provider 行写盘确实发生（不是静默 no-op）")
  handleSetProviderProxy(panel, { name: "deepseek", proxy: true })
  assert.equal(cfgJson().providers[0].proxy, true, "proxy:true ⇒ 写回布尔 true")
})