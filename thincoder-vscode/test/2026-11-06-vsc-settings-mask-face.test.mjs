/**
 * 2026-11-06-vsc-settings-mask-face.test.mjs — 批 `2026-11-06-vsc-test-face` §2 · C1 ∥ C2 ∥ C3
 *
 * 判据出处 = `docs/vsc/requirements/WEBVIEW.md` F-W17 行的**掩码面判据句**（「判据前提本身也是判据」）：
 * 「上述三处渲染位逐处成立——已配置 ⇒ 该位呈 `****`；未配置 ⇒ 非掩码文案（`settings-tools.js` 两处 =
 * `—`；`settings-providers.js` = 「未配置」词条）」。
 * 位次与设计档 §2.10 的三落点逐处对齐：**逐位一条 `test()`**（漏一处即该处不成立——不做「任一位置出现
 * `****`」的合并断言）。
 *
 * 驱动面：三条都走真分发器（`initMessageLoop`）投真载荷（`websearchSettings` ∥ `indexStatus` ∥
 * `providerStatus`）⇒ 断**渲染文本**（不是实现表达式）。C3 的驱动入口 = `window._editKey(name)`
 * → 编辑器取消 ⇒ `restoreKeyRow` 就地复原（不直调档内私有函数）。
 *
 * 修复前必红的读数：本条不是 N-W8 的三条（那三条 = A1–A3），本档无回退取证要求；三处掩码位在产品侧
 * 现均已在位，本档是**补测**（N-W5 登记例外的同族缺口：F-W17 掩码面此前零专属用例）。
 *
 * C3 的夹具名三态：`deepseek`（已配置 + 宿主下发掩码值）∥ `glm`（已配置但 `masked` 空串）∥ `openai`（未配置）。
 * `glm` **是夹具造态，不是现网可到的态**：宿主侧 `providerStatus()` 对已配置行恒下发 `MASKED`
 * （核 `agent-tools/settings.mjs` 的 `export const MASKED = "？？？？（masked）"`）。它存在的理由 = 把 F-W17
 * 明写的第三落点判据形 `s0.masked || "****"` 的兑底支跑到（取消复原径）；不为它去断建面径——
 * 那一态现网不可达，为它加一条断言就是给没人走的路造路。
 */
import assert from "node:assert/strict"
import { after, test } from "node:test"
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs"
import { registerHooks } from "node:module"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { pathToFileURL } from "node:url"
import { GlobalRegistrator } from "@happy-dom/global-registrator"

// ─── 夹具：临时项目根 + 隔离 config.json / sessions ────────────────────────────────────────
const work = mkdtempSync(join(tmpdir(), "vsc-mask-face-"))
const proj = join(work, "proj")
const sessions = join(work, "sessions")
mkdirSync(proj, { recursive: true })
mkdirSync(sessions, { recursive: true })
const cfgPath = join(work, "config.json")
writeFileSync(cfgPath, JSON.stringify({}, null, 2))

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

globalThis.acquireVsCodeApi = () => ({ postMessage: () => {}, getState: () => undefined, setState: () => {} })

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
const el = (id) => document.getElementById(id)
const MASKED = "sk-…1234"

/** 三处掩码位所在的行面是否已在盘（建面一次；`test()` 之间共享这一块面板）。 */
let built = false
function ensurePanel() {
  if (built) return
  built = true
  api.openSettings()
  receive({ type: "proxySettings", settings: null })
  receive({ type: "websearchSettings", settings: { hasKey: true } })
  receive({ type: "indexStatus", status: { built: false, files: 0, chunks: 0, hasEmbedder: true } })
  receive({ type: "shellCandidates", candidates: [], current: null })
  // providers：一枚已配置且带掩码值 ∥ 一枚已配置但无掩码值（走 `masked || "****"` 支）∥ 一枚未配置
  receive({
    type: "providerStatus",
    status: {
      providers: {
        deepseek: { configured: true, masked: MASKED, baseURL: "https://api.deepseek.com", isActive: true },
        glm: { configured: true, masked: "", baseURL: "https://open.bigmodel.cn/api/paas/v4", isActive: false },
        openai: { configured: false, masked: "", baseURL: "", isActive: false },
      },
      labels: {}, custom: null, presets: [], activeProvider: "deepseek", providerState: null,
    },
  })
  receive({ type: "agentSettings", settings: {} })
}

after(() => {
  window.dispatchEvent(new window.Event("unload"))
  _resetConfigPathForTest()
  _resetSessionsDirForTest()
  removeTempDirBestEffort(work)
})

test("C1 #status-websearch：已配置 ⇒ ****；未配置 ⇒ —", () => {
  ensurePanel()
  assert.equal(el("status-websearch").textContent, "****", "① 检索 key 位（已配置）⇒ 掩码 ****")

  // 同一位置推「未配置」快照 ⇒ 该位转非掩码文案（—）
  receive({ type: "websearchSettings", settings: { hasKey: false } })
  assert.equal(el("status-websearch").textContent, "—", "① 检索 key 位（未配置）⇒ 非掩码文案「—」")

  // 复位到已配置（后续用例 ∥ 人读都要看到同一初始态）
  receive({ type: "websearchSettings", settings: { hasKey: true } })
  assert.equal(el("status-websearch").textContent, "****", "① 再推已配置 ⇒ 回到掩码（两态可逆）")
})

test("C2 #status-embed：同形（已配置 ⇒ ****；未配置 ⇒ —）", () => {
  ensurePanel()
  assert.equal(el("status-embed").textContent, "****", "② embedding 位（hasEmbedder:true）⇒ 掩码 ****")

  receive({ type: "indexStatus", status: { built: false, files: 0, chunks: 0, hasEmbedder: false } })
  assert.equal(el("status-embed").textContent, "—", "② embedding 位（未配置）⇒ 非掩码文案「—」")

  receive({ type: "indexStatus", status: { built: false, files: 0, chunks: 0, hasEmbedder: true } })
  assert.equal(el("status-embed").textContent, "****", "② 再推已配置 ⇒ 回到掩码（两态可逆）")
})

test("C3 #rowline-<name> 内 .key-status：已配置 ⇒ ****（有掩码值则显该值）；未配置 ⇒ 未配置词条", () => {
  ensurePanel()
  const statusOf = (name) => el("rowline-" + name)?.querySelector(".key-status")?.textContent ?? ""
  /** 编辑 → 取消（编辑器取消 = 行内「取消」钮；取消径 ⇒ `restoreKeyRow` 就地复原）。 */
  const editThenCancel = (name) => {
    window._editKey(name)
    const row = el("rowline-" + name)
    assert.ok(row?.querySelector("input[type=password]"), `${name}：编辑入口打开行内编辑器（可驱动面）`)
    const cancel = [...row.querySelectorAll("button")].find((b) => b.textContent === zh["settings.cancel"])
    assert.ok(cancel, `${name}：编辑器带「${zh["settings.cancel"]}」钮`)
    cancel.click()
  }

  // 建面态：已配置行显宿主下发的掩码值；未配置行显词条
  assert.equal(statusOf("deepseek"), MASKED, "③ 已配置行（有掩码值）⇒ 显该掩码值")
  assert.equal(statusOf("openai"), zh["settings.notConfigured"], "③ 未配置行 ⇒ 「未配置」词条")

  // 取消复原后逐态再断一次（复原径 = 本位的判据面）
  editThenCancel("deepseek")
  assert.equal(statusOf("deepseek"), MASKED, "③ 取消复原 ⇒ 已配置行回到掩码值（就地复原，不重建面板）")

  editThenCancel("glm")
  assert.equal(statusOf("glm"), "****", "③ 已配置但无掩码值 ⇒ 落 **** 字面（`masked || \"****\"` 支）")

  editThenCancel("openai")
  assert.equal(statusOf("openai"), zh["settings.notConfigured"], "③ 取消复原 ⇒ 未配置行回到「未配置」词条")
})