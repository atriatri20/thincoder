/**
 * 2026-11-06-vsc-live-tool-card.test.mjs — 批 `2026-11-06-vsc-test-face` §2 · D1
 *
 * 判据出处 = `docs/vsc/requirements/WEBVIEW.md` F-W4 行（工具调用卡三支接收面）与 N-W5 行
 * （「F-W4 活卡面现无专属用例」——本档即该登记例外的消解件）。
 *
 * 驱动面 = **真分发器**：`webview/chat-messages.js` 的 `initMessageLoop` 是 host → webview 的单表
 * 分发处（`toolCall` ∥ `toolOutput` ∥ `toolResult` 三支逐字在此）。本档不直调 `ui.js` 的
 * `addTool` ∥ `finishTool`——那样测的是渲染件，不是「接收面收到了会怎样」；本档把三支消息投进
 * `window` 的 message 事件，走产品自己的分发表。
 *
 * 断的是**渲染可观察面**（不是实现表达式）：卡元素 / 卡头名字与参数摘要 / 状态词 / 卡体文本 /
 * 卡体展开标志 / 摘要行（`toolResult` 面按 F-W4 判据句「完成 → 状态 + 耗时 + 末行摘要」同断；本批明令
 * 出圈的「摘要 ≤100 字上限」未断）。
 *
 * 宿主 = happy-dom（与同目录 `2026-10-21-vsc-stateword-flicker.test.mjs` 同形）。
 */
import assert from "node:assert/strict"
import { test, after } from "node:test"
import { readFileSync } from "node:fs"
import { GlobalRegistrator } from "@happy-dom/global-registrator"

GlobalRegistrator.register()

// 夹具 DOM = **真 `index.html` 的 body**（去掉那一条 module 脚本行）：`state.js` ∥ `input.js` 在模块
// 顶层按 id 取骨架（`ctx.messagesEl`、`#toolbar` 宿主），缺件即 import 抛错——用真骨架即与运行期同形。
const pageHtml = readFileSync(new URL("../webview/index.html", import.meta.url), "utf8")
const bodyStart = pageHtml.indexOf("<body>") + "<body>".length
document.body.innerHTML = pageHtml
  .slice(bodyStart, pageHtml.indexOf("<script"))
  .replace(/<\/body>[\s\S]*$/, "")
globalThis.acquireVsCodeApi = () => ({ postMessage: () => {}, getState: () => undefined, setState: () => {} })

const { setStrings } = await import("../webview/i18n.js")
const zh = JSON.parse(readFileSync(new URL("../locales/zh.json", import.meta.url), "utf8"))
setStrings(zh)

const { initMessageLoop } = await import("../webview/chat-messages.js")

/** 分发表所需 deps：本档只走工具三支（它们不读 deps，全部经模块内 import 落地）——
 *  其余消费位给空函数，只为满足解构。 */
const noop = () => {}
initMessageLoop({
  renderMcpList: noop, updateMcpTools: noop, updateMcpTestResult: noop, updateIndexStatus: noop,
  updateProviderStatus: noop, updateAgentSettings: noop, notifyAgentSettingsRefreshed: noop,
  updateWebsearchSettings: noop, updateTestProviderResult: noop, updateShellCandidates: noop,
  updateProxySettings: noop, updateProxyTestResult: noop, showSettingsError: noop,
  dismissLoadingScreenOnce: noop, _loadingTimeout: null,
})

/** 投一帧 host → webview 消息（产品自己的接收口 = `window` 的 message 事件）。 */
const receive = (data) => window.dispatchEvent(new window.MessageEvent("message", { data }))

// 收尾：`panels.js` 模块层起一枚 1s 恒启定时器（运行期寿命 = webview 寿命），它的撤点是产品自己的
// `window` "unload" 监听——本档走同一撤点，测试进程才收得住（不是绕开产品，而是产品给的出口）。
after(() => window.dispatchEvent(new window.Event("unload")))

const cards = () => [...document.querySelectorAll("#messages .tool-call")]
const card = (i = 0) => cards()[i]
const header = (c) => c?.querySelector(".tool-call-header")
const body = (c) => c?.querySelector(".tool-call-body")
const statusText = (c) => c?.querySelector(".tool-call-status")?.textContent ?? ""

test("D1 toolCall → 卡（名 + args 前 80 字 + 状态词）；toolOutput → 追加且展开；toolResult → 成功折叠 / 错误展开", () => {
  // ── ① toolCall：建卡。args 超 80 字，断言卡头取前 80（F-W4 判据句「参数摘要」）──
  const args = "command: " + "x".repeat(140)
  receive({ type: "toolCall", name: "read", args, id: "call-1" })
  assert.equal(cards().length, 1, "一条 toolCall ⇒ 恰一张卡")
  const c1 = card(0)
  assert.equal(c1.querySelector(".tool-call-name").textContent, "read", "卡头名字 = 工具名")
  assert.equal(c1.querySelector(".tool-call-args").textContent, args.slice(0, 80), "卡头参数摘要 = args 前 80 字")
  assert.equal(statusText(c1), zh["tool.running"], `执行中状态词 ≈ ${zh["tool.running"]}，实得「${statusText(c1)}」`)
  assert.ok(!body(c1).classList.contains("open"), "新建卡体默认折叠")

  // ── ② toolOutput：正文追加进卡体 + 卡展开（长命令可看）──
  receive({ type: "toolOutput", name: "read", text: "line-1\n", id: "call-1" })
  receive({ type: "toolOutput", name: "read", text: "line-2", id: "call-1" })
  assert.equal(body(c1).textContent, "line-1\nline-2", `两拍输出追加成卡体正文，实得「${body(c1).textContent}」`)
  assert.ok(body(c1).classList.contains("open"), "输出到达 ⇒ 卡体展开")
  assert.equal(header(c1).getAttribute("aria-expanded"), "true", "展开态同步 aria-expanded（可访问面）")

  // ── ③ toolResult 成功：折叠 + 耗时 + 末行摘要（read ⇒ 「N lines」）──
  receive({ type: "toolResult", name: "read", text: "a\nb\nc", id: "call-1" })
  assert.ok(!body(c1).classList.contains("open"), "成功 ⇒ 卡体折叠")
  assert.equal(header(c1).getAttribute("aria-expanded"), "false", "折叠态同步 aria-expanded")
  assert.ok(statusText(c1).startsWith(zh["tool.done"]), `成功状态词以「${zh["tool.done"]}」起，实得「${statusText(c1)}」`)
  assert.match(statusText(c1), /\(\d+ms\)/, `状态词携耗时，实得「${statusText(c1)}」`)
  assert.ok(!statusText(c1).includes(zh["tool.running"]), "完成后不再显执行中状态词")
  const summary = c1.querySelector(".tool-call-summary")?.textContent ?? ""
  // 词面来自核分流件（`render-core/tool-summary.mjs` 的 read 支 `N lines`），不是 i18n 词条——
  // 摘要改措辞 = 用户可见面真变，该红
  assert.ok(summary.includes("3 lines"), `末行摘要 = 读面行数（3 lines），实得「${summary}」`)

  // ── ④ toolResult 失败：保持展开 + 错误状态词（用户不必再点一次才看见失败）──
  receive({ type: "toolCall", name: "bash", args: "node build.mjs", id: "call-2" })
  assert.equal(cards().length, 2, "第二条 toolCall ⇒ 第二张卡")
  const c2 = card(1)
  receive({ type: "toolResult", name: "bash", text: "[stderr]:\nboom\n(exit code 1)", id: "call-2" })
  assert.ok(body(c2).classList.contains("open"), "失败 ⇒ 卡体保持展开")
  assert.equal(header(c2).getAttribute("aria-expanded"), "true", "失败展开态同步 aria-expanded")
  assert.ok(statusText(c2).startsWith(zh["tool.error"]), `失败状态词以「${zh["tool.error"]}」起，实得「${statusText(c2)}」`)
  assert.ok(body(c2).textContent.includes("(exit code 1)"), "失败正文随卡体可见")
})