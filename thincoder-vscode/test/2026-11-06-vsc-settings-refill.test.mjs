/**
 * 2026-11-06-vsc-settings-refill.test.mjs — 批 `2026-11-06-vsc-test-face` §2 · A3
 *
 * 判据出处 = `docs/vsc/requirements/WEBVIEW.md` F-W9 行：「面板打开时触发 light/full 推送 ⇒ 控件显示
 * 新值；随后改动任一控件 ⇒ 发回值 = 屏幕新值（旧值回写零发生）」。
 *
 * 驱动面：真 `openSettings()`（建面）→ 真分发器投三拍推送（打开拍 v1 ∥ 推送拍 v2 ∥ 聚焦拍 v3）——
 * **不手工灌 SS**（N-W8 的「掩盖源」禁令）。
 *
 * F-W9 的四处回填面逐处一断（漏一处即该处不成立）：
 *   ① `updateProxySettings` ⇒ 活控件回填（`#px-uri` / `#px-web`）
 *   ② `updateWebsearchSettings` ⇒ 键行同拍重绘（`#status-websearch` 掩码 ⇄ `—`）
 *   ③ `updateShellCandidates` ⇒ 选择器随快照（`#sh-select`）
 *   ④ `updateIndexStatus` ⇒ `#row-embed` 同拍重绘（D-W5 扩面，`#status-embed`）
 * 外加两条纪律：**整卡零重建**（控件节点同一枚）与 **U-S10 跳过聚焦控件**（回填不覆盖用户输入）。
 *
 * 修复前必红取证（完整读数落批次档 §5）：现树零改的前提下用 `module.registerHooks` 的 `load` 覆写，
 * 把本档对应的修复点换回**修复前原文**（`37cb1b34` 的 `updateProxySettings` ∥ `updateShellCandidates`
 * ∥ `updateWebsearchSettings` 三处只存 SS 不回填；`renderIndexStatus` 首行无 `#row-embed` 重绘）后再跑本档 ⇒ 红。
 * 四处回填面逐面各有一条读数：①⇒屏面停在旧 uri；②⇒键行不转 `—`；③⇒选择器不随快照；④⇒行内掩码不转 `—`。
 * 为什么不走「检出修复前提交的隔离工作树」：那个提交与本档夹具的目录形不同（无 `thincoder-core/config-io.mjs`
 * 与 session 测试缝），在那里跑出的是模块解析噪声而非行为红。
 */
import assert from "node:assert/strict"
import { after, test } from "node:test"
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs"
import { registerHooks } from "node:module"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { pathToFileURL } from "node:url"
import { GlobalRegistrator } from "@happy-dom/global-registrator"

// ─── 夹具：临时项目根 + 隔离 config.json / sessions（不摸本机真实配置）──────────────────────
const work = mkdtempSync(join(tmpdir(), "vsc-settings-refill-"))
const proj = join(work, "proj")
const sessions = join(work, "sessions")
mkdirSync(proj, { recursive: true })
mkdirSync(sessions, { recursive: true })
const cfgPath = join(work, "config.json")
writeFileSync(cfgPath, JSON.stringify({ proxy: { uri: "http://127.0.0.1:7890", web: true } }, null, 2))

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

GlobalRegistrator.register()
const pageHtml = readFileSync(new URL("../webview/index.html", import.meta.url), "utf8")
document.body.innerHTML = pageHtml
  .slice(pageHtml.indexOf("<body>") + "<body>".length, pageHtml.indexOf("<script"))
  .replace(/<\/body>[\s\S]*$/, "")

const posted = []
globalThis.acquireVsCodeApi = () => ({ postMessage: (m) => { posted.push(m) }, getState: () => undefined, setState: () => {} })

const { _setConfigPathForTest, _resetConfigPathForTest } = await import("@thincoder/core/config-io.mjs")
_setConfigPathForTest(cfgPath)
const { _setSessionsDirForTest, _resetSessionsDirForTest } = await import("../src/extension/session-io.mjs")
_setSessionsDirForTest(sessions)
const { removeTempDirBestEffort } = await import("../../test/teardown.mjs")

const { setStrings } = await import("../webview/i18n.js")
const zh = JSON.parse(readFileSync(new URL("../locales/zh.json", import.meta.url), "utf8"))
setStrings(zh)
const { initSettings } = await import("../webview/settings.js")
const { initMessageLoop } = await import("../webview/chat-messages.js")

const api = initSettings({ onClose: () => {}, getModels: () => [] })
initMessageLoop({ ...api, dismissLoadingScreenOnce: () => {}, _loadingTimeout: null })

const receive = (data) => window.dispatchEvent(new window.MessageEvent("message", { data }))
const change = (el) => el.dispatchEvent(new window.Event("change", { bubbles: true }))
const el = (id) => document.getElementById(id)
const saveProxyMsgs = () => posted.filter((m) => m.type === "saveProxySettings")

after(() => {
  window.dispatchEvent(new window.Event("unload"))
  _resetConfigPathForTest()
  _resetSessionsDirForTest()
  removeTempDirBestEffort(work)
})

test("A3 推送回填活控件；随后改动任一控件 ⇒ 发回值 = 屏幕新值（旧值零回写）", () => {
  // ── 打开拍 v1：四处快照各就位（建面时渲染）──
  posted.length = 0
  api.openSettings()
  receive({ type: "proxySettings", settings: { uri: "http://old-proxy:1080", web: true } })
  receive({ type: "websearchSettings", settings: { hasKey: true } })
  receive({ type: "shellCandidates", candidates: [{ name: "pwsh", value: "pwsh" }, { name: "bash", value: "bash" }], current: "pwsh" })
  receive({ type: "indexStatus", status: { built: false, files: 0, chunks: 0, hasEmbedder: true } })
  receive({ type: "agentSettings", settings: {} }) // 末位 = 建面触发拍

  assert.equal(el("px-uri").value, "http://old-proxy:1080", "建面渲染代理真值")
  assert.equal(el("status-websearch").textContent, "****", "建面渲染检索 key 掩码")
  assert.equal(el("sh-select").value, "pwsh", "建面渲染 shell 选择")
  assert.equal(el("status-embed").textContent, "****", "建面渲染 embedding 掩码（hasEmbedder:true）")
  const uriNode = el("px-uri")

  // ── 推送拍 v2（light 推送：不重建整卡，只回填活控件）──
  receive({ type: "proxySettings", settings: { uri: "http://new-proxy:8080", web: false } })
  receive({ type: "websearchSettings", settings: { hasKey: false } })
  receive({ type: "shellCandidates", candidates: [{ name: "pwsh", value: "pwsh" }, { name: "bash", value: "bash" }], current: "bash" })
  receive({ type: "indexStatus", status: { built: false, files: 0, chunks: 0, hasEmbedder: false } })

  assert.equal(el("px-uri").value, "http://new-proxy:8080", "① updateProxySettings ⇒ 活控件回填新值")
  assert.equal(el("px-web").checked, false, "① 同拍回填布尔控件")
  assert.equal(el("status-websearch").textContent, "—", "② updateWebsearchSettings ⇒ 键行同拍重绘（未配 ⇒ 非掩码文案）")
  assert.equal(el("sh-select").value, "bash", "③ updateShellCandidates ⇒ 选择器随快照")
  assert.equal(el("status-embed").textContent, "—", "④ updateIndexStatus ⇒ #row-embed 同拍重绘")
  assert.equal(el("px-uri"), uriNode, "整卡零重建：控件节点仍是同一枚（回填不是重建）")

  // ── 改动控件 ⇒ 发回值 = 屏幕新值（旧值零回写）──
  posted.length = 0
  el("px-uri").value = "http://typed-by-user:9999"
  change(el("px-uri"))
  assert.equal(saveProxyMsgs().length, 1, "编辑后 change ⇒ 恰一次发值")
  assert.deepEqual(saveProxyMsgs()[0].settings, { uri: "http://typed-by-user:9999" },
    "发回值 = 屏幕新值（推送前旧值 ∥ 推送值都不得回写）")

  // ── U-S10：聚焦中的控件跳过回填——推送不覆盖用户正在输入的值（未聚焦控件推反值，才分得出「回填」与「也跳了」）──
  el("px-uri").focus()
  receive({ type: "proxySettings", settings: { uri: "http://pushed-while-focused:7777", web: true } })
  assert.equal(el("px-uri").value, "http://typed-by-user:9999", "聚焦中的控件不被推送覆盖（用户输入优先）")
  assert.equal(el("px-web").checked, true, "同拍未聚焦控件照常回填（推送 web:true ⇒ 屏值翻真；跳过是逐控件判，不是整卡跳过）")
  el("px-uri").blur()

  // 聚焦期被跳过 ⇒ 基线冻结在控件现屏值 ⇒ 随后的编辑发的是屏值，不是推送值
  posted.length = 0
  el("px-uri").value = "http://edited-after-blur:8888"
  change(el("px-uri"))
  assert.deepEqual(saveProxyMsgs()[0].settings, { uri: "http://edited-after-blur:8888" }, "旧值（含被跳过的推送值）零回写")
})