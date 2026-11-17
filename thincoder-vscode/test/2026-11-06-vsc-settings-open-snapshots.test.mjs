/**
 * 2026-11-06-vsc-settings-open-snapshots.test.mjs — 批 `2026-11-06-vsc-test-face` §2 · A1
 *
 * 判据出处 = `docs/vsc/requirements/WEBVIEW.md` F-W8 行：「新窗口 / Reload 后**直接**打开设置页
 * ⇒ 三个快照到达且渲染真值（已配置项不回显为空 / 不假阴性）」。
 *
 * **两半都驱动**（F-W8 的缺陷面在宿主回批，渲染面在 webview——只测一头都证明不了这条判据）：
 *   ① **宿主半** = 真 `handleGetAgentSettings`（`panel-messages-settings.mjs`）走真 ChatPanel 的
 *      `_pushIndexStatus` ∥ `_pushSettingsLight`，收下打开拍实际发出的消息批；断三快照在批内、
 *      `agentSettings` 居末位（打开等待器唯一触发拍）。
 *   ② **前端半** = 把该批消息按序投进真分发器（`initMessageLoop`），断渲染真值。
 * 打开动作本身 = 真 `openSettings()`（`webview/settings.js`）——**不手工灌 SS**：
 * N-W8 明写「`test/smoke-settings.mjs` 在 `openSettings()` 前手工灌 SS 的手法 = 掩盖源，不得沿用」。
 *
 * 隔离：`config.json` 与 sessions 目录都指到临时目录（核 `_setConfigPathForTest` ∥ 端壳
 * `_setSessionsDirForTest` 两条产品测试缝），shell 探测走核 `_setShellDetectForTest`——不摸本机
 * 真实配置、不起子进程。
 *
 * 修复前必红取证（完整读数落批次档 §5）：现树零改的前提下用 `module.registerHooks` 的 `load` 覆写，
 * 把本档对应的修复点换回**修复前原文**（`37cb1b34` 的 `panel-messages.mjs` case "getAgentSettings"）
 * 后再跑本档 ⇒ 红。
 * 为什么不走「检出修复前提交的隔离工作树」：那个提交还没有本档夹具依赖的
 * `thincoder-core/config-io.mjs` ∥ `shell-candidates.mjs` 与 embed/memory 测试缝——在那里跑出的是
 * 模块解析噪声而非行为红；§1 的判据① 明禁「红来自断言写错 ∕ 夹具搭错」。
 */
import assert from "node:assert/strict"
import { after, test } from "node:test"
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs"
import { registerHooks } from "node:module"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { pathToFileURL } from "node:url"
import { GlobalRegistrator } from "@happy-dom/global-registrator"

// ─── 夹具：临时项目根 + 隔离 config.json（代理已配 ∥ 检索 key 已配 = 「已配置项」）────────────
const work = mkdtempSync(join(tmpdir(), "vsc-open-snapshots-"))
const proj = join(work, "proj")
const sessions = join(work, "sessions")
mkdirSync(proj, { recursive: true })
mkdirSync(sessions, { recursive: true })
const cfgPath = join(work, "config.json")
const PROXY_URI = "http://127.0.0.1:7890"
writeFileSync(cfgPath, JSON.stringify({
  proxy: { uri: PROXY_URI, web: true },
  websearch: { apiKey: "tvly-fixture-key" },
  shell: "pwsh",
}, null, 2))

// ─── `vscode` 宿主模块桩（先例 = 仓根 `test/integration/tester-role.test.mjs`；只桩这一个说明符）──
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

// ─── 前端半的宿主（happy-dom）+ 真 `index.html` 骨架（`state.js` ∥ `input.js` 顶层按 id 取件）──
GlobalRegistrator.register()
const pageHtml = readFileSync(new URL("../webview/index.html", import.meta.url), "utf8")
document.body.innerHTML = pageHtml
  .slice(pageHtml.indexOf("<body>") + "<body>".length, pageHtml.indexOf("<script"))
  .replace(/<\/body>[\s\S]*$/, "")

/** webview → host 发值记录（`openSettings` 的拉取请求在此可断）。 */
const posted = []
globalThis.acquireVsCodeApi = () => ({ postMessage: (m) => { posted.push(m) }, getState: () => undefined, setState: () => {} })

// ─── 隔离缝（两条产品测试缝；不摸本机真实配置与真实会话目录）──────────────────────────────
const { _setConfigPathForTest, _resetConfigPathForTest } = await import("@thincoder/core/config-io.mjs")
_setConfigPathForTest(cfgPath)
const { _setSessionsDirForTest, _resetSessionsDirForTest } = await import("../src/extension/session-io.mjs")
_setSessionsDirForTest(sessions)

// ─── 宿主模块（`vscode` 已桩）──────────────────────────────────────────────────────────
const { ChatPanel } = await import("../src/extension/chat-panel.mjs")
const { handleGetAgentSettings } = await import("../src/extension/panel-messages-settings.mjs")
const { _setShellDetectForTest } = await import("../src/extension/settings.mjs")
// shell 候选探测 = 子进程探真机；本档与 F-W8 无关，走核测试缝给固定候选（不起进程、不读本机）
_setShellDetectForTest(async () => [{ name: "pwsh", value: "pwsh" }, { name: "bash", value: "bash" }])
// 记忆面（索引状态快照的来源）：库路径随隔离后的 config 目录派生（临时目录），不留本机痕迹
const { setMemoryFaceGate, ensureMemoryHandle, getMemoryHandle, _resetMemoryHandleForTest } = await import("../src/embed-config.mjs")
setMemoryFaceGate(() => true)
// 收尾尽力面单源（`docs/core/design/TESTING.md` §4.6）：清理失败不判红整档，但要可见
const { removeTempDirBestEffort } = await import("../../test/teardown.mjs")

// ─── 前端模块（必须在 DOM 就位之后 import）──────────────────────────────────────────────
const { setStrings } = await import("../webview/i18n.js")
const zh = JSON.parse(readFileSync(new URL("../locales/zh.json", import.meta.url), "utf8"))
setStrings(zh)
const { initSettings } = await import("../webview/settings.js")
const { initMessageLoop } = await import("../webview/chat-messages.js")

// ─── 按 webview 真实接线装面板：`initSettings` 的返回面 = 分发器的 settings 依赖面（`chat.js` 同式）──
const api = initSettings({ onClose: () => {}, getModels: () => [] })
initMessageLoop({ ...api, dismissLoadingScreenOnce: () => {}, _loadingTimeout: null })

/** host → webview 投帧（产品自己的接收口 = `window` 的 message 事件）。 */
const receive = (data) => window.dispatchEvent(new window.MessageEvent("message", { data }))

// 收尾：`panels.js` 模块层起一枚 1s 恒启定时器，撤点 = 产品自己的 `window` "unload" 监听；
// 记忆库句柄先关（Windows 上不关则临时目录留着 EPERM），再撤销两条隔离缝与临时目录。
after(() => {
  window.dispatchEvent(new window.Event("unload"))
  try { getMemoryHandle()?.db?.close() } catch { /* 已关 / 从未建 */ }
  _resetMemoryHandleForTest()
  setMemoryFaceGate(null) // 门回 fail-closed（`embed-config.mjs` 的缺省：未接线 ⇒ 不起记忆面）
  _resetConfigPathForTest()
  _resetSessionsDirForTest()
  removeTempDirBestEffort(work)
})

test("A1 打开设置页一拍内 proxySettings / websearchSettings / indexStatus 三快照到达且渲真值", async () => {
  // ── ① 打开动作 = 真 `openSettings()`：发拉取请求（不手工灌 SS）──
  posted.length = 0
  api.openSettings()
  assert.equal(posted.filter((m) => m.type === "getAgentSettings").length, 1, "打开拍发一次 getAgentSettings（唯一拉取入口）")
  const bodyEl = document.getElementById("settings-body")
  assert.equal(bodyEl.innerHTML, "", "打开当刻尚未建面（面等推送到达——F-W8 的「一拍内」语义）")
  assert.equal(document.getElementById("px-uri"), null, "打开当刻代理控件不在位（未建面 ⇒ 没有可被误写的空控件）")

  // ── ② 宿主半：这一拍的回复批（真 ChatPanel 的两条推送方法）──
  const hostMsgs = []
  const panel = new ChatPanel({
    subscriptions: [],
    workspaceState: { get: () => undefined, update: async () => {} },
    globalState: { get: () => undefined, update: async () => {} },
    extensionUri: { fsPath: proj },
  })
  panel._slot = 1
  panel._panel = { webview: { postMessage: (m) => hostMsgs.push(m) } }
  assert.ok(await ensureMemoryHandle(), "夹具前提：记忆面可用（索引状态快照才有真值可渲）")
  await handleGetAgentSettings(panel)

  const types = hostMsgs.map((m) => m.type)
  for (const need of ["indexStatus", "proxySettings", "websearchSettings"]) {
    assert.ok(types.includes(need), `打开拍回批须含 ${need}（缺一项 = 该项等到保存 ∥ 改配置才补），实得 [${types.join(", ")}]`)
  }
  assert.equal(types[types.length - 1], "agentSettings", "agentSettings 居末位（打开等待器唯一触发拍）")

  // ── ③ 前端半：把这一批按到达序投进真分发器，断渲染真值 ──
  for (const m of hostMsgs) receive(m)

  assert.notEqual(bodyEl.innerHTML, "", "快照批到达 ⇒ 面板建面（打开当刻它是空的）")
  assert.equal(document.getElementById("px-uri").value, PROXY_URI, "已配置的代理 URI 回显真值（不得为空）")
  assert.equal(document.getElementById("px-web").checked, true, "proxySettings.web 回显真值")
  assert.equal(document.getElementById("status-websearch").textContent, "****", "已配置的检索 key ⇒ 掩码位呈 ****（不假阴性）")
  assert.equal(document.getElementById("sh-select").value, "pwsh", "shell 候选快照回填活控件")
  const indexLine = document.getElementById("index-status").textContent
  // 夹具无 embedder ⇒ 快照 = `{built:false, …}` ⇒ 要显「未构建」而**不是**占位「—」
  assert.equal(indexLine, zh["settings.indexNotBuilt"], `索引状态渲染自快照本身（不得停在占位「—」），实得「${indexLine}」`)
})