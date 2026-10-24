/**
 * 2026-10-20-vsc-queue-band.test.mjs — 忙态排队面 = 输入区上方待发送带（批档 2026-10-20-vsc-queue-band ·
 * 台账 #1718 · 需求 F-W22）。契约单源 = `docs/vsc/design/WEBVIEW-INPUT.md` §1 C-B2-6 ⑦。
 *
 * 八用例（驱动真 webview 模块——`pending-band.js` + `input.js` 核件提交路径；宿主快照由本档按
 * `WEBVIEW-PROTOCOL.md` §3.2 行 17 载荷形手工推送）：
 *   ① 单条：忙态提交 ⇒ 流内零块 + 带 1 条；消费 ⇒ 带空 + 恰一枚 `a`
 *   ② 多条：忙态两次提交 ⇒ 带 2 条（`i. ` 编号）；消费 ⇒ 恰一枚合并文本
 *   ③ 合并批 + 残项：快照 `{items:["c"], merged}` ⇒ 带剩 `c` + 流内恰一枚合并文本
 *   ④ 装载① 迁移：快照无 `merged` ⇒ 带原样 + 流内零新增
 *   ⑤ 满队（第 9 条）：`count = 8` 再提交 ⇒ 零出泡 + toast + 文本保留 + 带仍 8
 *   ⑥ 冷启重推：握手快照（无 `merged`）⇒ 带按 `items` 重建 + 流内零新增
 *   ⑦ 会话中止：`{count:0, items:[]}` ⇒ 带 `hidden` + 零块
 *   ⑧ idle 直发：非忙发送 ⇒ 气泡照旧 +1（零回归）
 * 宿主 = happy-dom（`@happy-dom/global-registrator`，VSC devDep）——真 DOM 属性读（band 落位 /
 * `data-raw` / `hidden` 均为元素属性，串匹配桩在此必红）。
 */
import assert from "node:assert/strict"
import { test } from "node:test"
import { readFileSync } from "node:fs"
import { GlobalRegistrator } from "@happy-dom/global-registrator"

GlobalRegistrator.register()

// ─── 环境（宿主桥 + 静态骨架；`state.js` 载入前必须就位）────────────────────────

const posted = []
globalThis.acquireVsCodeApi = () => ({
  postMessage: (m) => { posted.push(m) },
  getState: () => undefined,
  setState: () => {},
})

document.body.innerHTML = `
  <div id="chat-container">
    <div id="session-bar"><span id="session-title">Session 1</span></div>
    <div id="messages" role="log"></div>
    <div id="subagent-activity"></div>
    <div id="toolbar"><div id="status-line"></div></div>
  </div>`

const { ctx, S } = await import("../webview/state.js")
await import("../webview/input.js") // 装配面副作用：核件输入行创建 + `composerHooks` 绑定（`send()` 路径 = 忙态提交面）
const { applyBusyQueued, clearPendingBand, paintPendingOverflow } = await import("../webview/pending-band.js")
const { setStrings } = await import("../webview/i18n.js")

const zh = JSON.parse(readFileSync(new URL("../locales/zh.json", import.meta.url), "utf8"))
setStrings(zh)

// ─── 夹具 ───────────────────────────────────────────────────────────────────

const sent = (type) => posted.filter((m) => m.type === type)

const band = () => document.getElementById("pending-band")
const bandItems = () => [...(band()?.querySelectorAll("[data-pending-item]") ?? [])]
const userBubbles = () => [...ctx.messagesEl.querySelectorAll(".message.user")]
const toastEl = () => document.getElementById("paste-toast")

/** 宿主侧队列镜像（快照推送 = 真载荷形；受理 / 消费由本档按 host 语义推进）。 */
let hostQueue = []

function reset() {
  ctx.messagesEl.replaceChildren()
  ctx.inputEl.value = ""
  S._turnState = "idle"
  S._busyQueuedCount = 0
  S._busyQueuedPending = false
  S._busyQueuedItems = []
  hostQueue = []
  posted.length = 0
  clearPendingBand()
}

function type(text) { ctx.inputEl.value = text }
function clickSend() { document.getElementById("send-btn").click() }

/** host 快照推送（`busyQueued { pending, count, items, merged? }`——协议 §3.2 行 17）。 */
function snapshot(extra = {}) {
  applyBusyQueued(ctx, S, {
    type: "busyQueued",
    pending: hostQueue.length > 0,
    count: hostQueue.length,
    items: hostQueue.map((q) => q.text),
    ...extra,
  })
}

/** 忙态提交一条（核件 `send()` 忙分支 ⇒ `queuedUserMessage` 上行）⇒ host 受理 + 快照。 */
function busySubmit(text) {
  type(text)
  clickSend()
  const msg = sent("queuedUserMessage").at(-1)
  hostQueue.push({ text })
  snapshot()
  return msg
}

/** 消费一批（driver / 步边界语义：队首取批 ⇒ `merged` 随快照）。 */
function consume(n, merged) {
  hostQueue.splice(0, n)
  snapshot({ merged })
}

// ─── ① 单条 ─────────────────────────────────────────────────────────────────

test("① 单条：忙态提交流内零块 ⇒ 带 1 条（贴输入上沿）⇒ 消费恰一枚", () => {
  reset()
  S._turnState = "running"
  const before = userBubbles().length
  const msg = busySubmit("a")
  assert.equal(msg?.text, "a", "忙态提交走上行 `queuedUserMessage`（文本 = 提交原文）")
  assert.equal(userBubbles().length, before, "消费前流内零块（忙态提交不出泡）")
  assert.equal(bandItems().length, 1, "带面条数 = 队列条数（1）")
  assert.equal(bandItems()[0].dataset.raw, "a", "逐条 `data-raw` = 原文")
  assert.equal(band().hidden, false, "判据非空 ⇒ 带面可见")
  assert.equal(band().parentElement, document.getElementById("toolbar"), "带面住 `#toolbar`（非流内）")
  assert.equal(band().nextElementSibling, ctx.inputEl.parentElement, "带面贴输入行上沿（输入行紧邻下一兄弟）")
  assert.equal(ctx.messagesEl.contains(band()), false, "带面不在 `#messages` 内")
  // 量面：正文折行高 ÷ 行高 > 3 ⇒ 尾标记摘 hidden + 行数词（契约 = 量面判据）
  const body = bandItems()[0].querySelector(".chat-pending-body")
  const more = bandItems()[0].querySelector("[data-pending-more]")
  assert.equal(more.hidden, true, "尾标记初置 hidden")
  body.style.lineHeight = "20px"
  Object.defineProperty(body, "scrollHeight", { configurable: true, value: 100 })
  Object.defineProperty(body, "clientHeight", { configurable: true, value: 60 })
  paintPendingOverflow(band())
  assert.equal(more.hidden, false, "5 行 > 3 ⇒ 尾标记摘 hidden")
  assert.equal(more.textContent, zh["chat.pending.more"].replace("${lines}", "5"), "尾标记填行数词")
  const css = readFileSync(new URL("../webview/chat.css", import.meta.url), "utf8")
  assert.ok(/-webkit-line-clamp:\s*3/.test(css), "正文视觉裁 = CSS `-webkit-line-clamp: 3`")
  consume(1, "a")
  assert.equal(bandItems().length, 0, "消费 ⇒ 带项退场")
  assert.equal(band().hidden, true, "带面判据空 ⇒ hidden")
  assert.equal(userBubbles().length, before + 1, "消费 ⇒ 流内恰一枚 user 块")
  assert.equal(userBubbles().at(-1).dataset.raw, "a", "单条批 = 原文")
})

// ─── ② 多条 ─────────────────────────────────────────────────────────────────

test("② 多条：带 2 条（`i. ` 编号）⇒ 消费恰一枚合并文本", () => {
  reset()
  S._turnState = "running"
  busySubmit("a")
  busySubmit("b")
  assert.equal(bandItems().length, 2, "两次受理 ⇒ 带 2 条")
  const bodies = bandItems().map((el) => el.querySelector(".chat-pending-body").textContent)
  assert.deepEqual(bodies, ["1. a", "2. b"], "多条编号载体 = `.chat-pending-body` 文本前缀 `${i}. `")
  assert.equal(
    band().querySelector(".chat-pending-label").textContent,
    zh["chat.pending.multi"].replace("${count}", "2"),
    "多条标签形 = `chat.pending.multi {count}`",
  )
  consume(2, "1. a\n2. b")
  assert.equal(bandItems().length, 0, "整批消费 ⇒ 带项归零")
  assert.equal(userBubbles().length, 1, "流内恰一枚")
  assert.equal(userBubbles()[0].dataset.raw, "1. a\n2. b", "多条批 = 合并文本")
})

// ─── ③ 合并批 + 残项 ────────────────────────────────────────────────────────

test("③ 合并批 + 残项：带剩 `c`，流内恰一枚合并文本", () => {
  reset()
  S._turnState = "running"
  hostQueue = [{ text: "a" }, { text: "b" }, { text: "c" }]
  snapshot()
  assert.equal(bandItems().length, 3, "受理后带 3 条")
  consume(2, "1. a\n2. b")
  assert.equal(bandItems().length, 1, "本批项退场、残项留守")
  assert.equal(bandItems()[0].dataset.raw, "c", "残项原文 = `c`")
  assert.equal(userBubbles().length, 1, "流内恰一枚 user 块")
  assert.equal(userBubbles()[0].dataset.raw, "1. a\n2. b", "块文本 = 本批合并文本")
})

// ─── ④ 装载① 载体迁移 ──────────────────────────────────────────────────────

test("④ 装载① 迁移：快照无 `merged` ⇒ 带原样、流内零出块", () => {
  reset()
  S._turnState = "running"
  hostQueue = [{ text: "a" }, { text: "b" }]
  snapshot()
  assert.equal(bandItems().length, 2, "迁移快照按 `items` 重绘")
  assert.equal(userBubbles().length, 0, "载体迁移不属消费送达 ⇒ 零出块")
})

// ─── ⑤ 满队（第 9 条）──────────────────────────────────────────────────────

test("⑤ 满队：第 9 条零出泡 + toast + 文本保留 + 带仍 8", () => {
  reset()
  S._turnState = "running"
  hostQueue = Array.from({ length: 8 }, (_, i) => ({ text: `q${i + 1}` }))
  snapshot()
  assert.equal(bandItems().length, 8, "带面 8 条")
  const before = ctx.messagesEl.querySelectorAll(".message").length
  type("overflow")
  clickSend()
  assert.equal(sent("queuedUserMessage").length, 0, "满队 ⇒ 零上行（不出泡、不入队）")
  assert.equal(ctx.inputEl.value, "overflow", "文本保留（不清框）")
  assert.equal(ctx.messagesEl.querySelectorAll(".message").length, before, "流内零新增")
  assert.equal(bandItems().length, 8, "带仍 8 条")
  assert.equal(toastEl()?.textContent, zh["input.slotFull"], "满队提示 = `input.slotFull` toast")
  assert.equal(toastEl()?.classList.contains("visible"), true, "toast 在场")
})

// ─── ⑥ 冷启重推 ────────────────────────────────────────────────────────────

test("⑥ 冷启重推：握手快照（无 `merged`）按 `items` 重建、流内零新增", () => {
  reset()
  hostQueue = [{ text: "x" }, { text: "y" }]
  snapshot() // webviewReady 握手重推形（载荷同受理快照——无 merged）
  assert.equal(bandItems().length, 2, "Reload 冷启按 `items` 重建带面")
  assert.deepEqual(bandItems().map((el) => el.dataset.raw), ["x", "y"], "条目按队列序重建")
  assert.equal(userBubbles().length, 0, "握手重推不带 `merged` ⇒ 零重块")
  clearPendingBand() // clearMessages 径：带面复位
  assert.equal(bandItems().length, 0, "清屏 ⇒ 带面复位")
  assert.equal(band().hidden, true, "清屏 ⇒ 带面 hidden")
})

// ─── ⑦ 会话中止 ────────────────────────────────────────────────────────────

test("⑦ 会话中止：`{count:0, items:[]}` ⇒ 带 hidden、零块", () => {
  reset()
  S._turnState = "running"
  busySubmit("a")
  assert.equal(bandItems().length, 1, "中止前带 1 条")
  const before = userBubbles().length
  hostQueue = []
  snapshot()
  assert.equal(bandItems().length, 0, "中止快照 ⇒ 带项归零")
  assert.equal(band().hidden, true, "带面 hidden")
  assert.equal(userBubbles().length, before, "中止快照无 `merged` ⇒ 零出块")
})

// ─── ⑧ idle 直发 ───────────────────────────────────────────────────────────

test("⑧ idle 直发：本地球照旧 +1（零回归）", () => {
  reset()
  S._turnState = "idle"
  type("hello")
  clickSend()
  assert.equal(userBubbles().length, 1, "idle 直发 ⇒ 本地气泡照旧 +1")
  assert.equal(userBubbles()[0].dataset.raw, "hello", "气泡原文 = 提交文本")
  assert.equal(sent("userMessage").at(-1)?.text, "hello", "idle 直发走上行 `userMessage`")
  assert.equal(sent("queuedUserMessage").length, 0, "idle 直发不入队")
  assert.equal(bandItems().length, 0, "idle 直发零带项")
})
