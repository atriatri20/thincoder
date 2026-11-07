/**
 * vsc-scroll-follow.test.mjs — 集成用例 `VSC 2-1`（RTM 故事「VSC 2 · 流式输出中视口贴底」，属册 `ends`）。
 *
 * 业务入口：VSC 聊天面板消息区，一次流式回合进行中——用户上滚动作为输入。
 * 断言（业务可观测结果，`docs/vsc/design/WEBVIEW.md` §5.5 集成面行）：离底**不足**半视口 ⇒ 下一帧输出后
 * 视口仍贴底；离底**达到 ∥ 超过**半视口 ⇒ 解钉，后续帧不再把视口拉回底部。
 *
 * 交互组件（跨组件，不是单件）：流式帧应用（核 `thincoder-render-core/flow/stream.mjs` 的 `frameEnd` 帧尾）
 * × pin 观察（核 `thincoder-render-core/scroll.mjs` 的 `createPinWatch` 在 `scroll` 事件的更新点）
 * × 近底判据（核 `nearBottom` 的视口比例阈）；端侧装配 = `thincoder-vscode/webview/ui.js`（`initScrollFollow`
 * ∥ `maybeScrollDown`——与 `thincoder-vscode/webview/streaming.js` 的 `frameEnd` 同形）。
 *
 * 几何在本层可观测：驱动真 webview 模块 + 自带 `scrollHeight` ∥ `scrollTop` ∥ `clientHeight` 读数的元素即足
 * ——不需真排版（happy-dom 不排版，真元素 `clientHeight` 恒 0，那样断言会全塌成零读数）。
 * 回指需求 = `docs/vsc/requirements/WEBVIEW.md` F-W2（流式跟随与滚动）。
 */
import { test } from "node:test"
import assert from "node:assert/strict"
import { Window } from "../../thincoder-vscode/node_modules/happy-dom/lib/index.js"

const window = new Window()
globalThis.window = window
globalThis.document = window.document

const { nearBottomThreshold } = await import("../../thincoder-render-core/scroll.mjs")
const { createStreamRenderer, STREAM_RENDER_MIN_MS } = await import("../../thincoder-render-core/flow/stream.mjs")
const { initScrollFollow, maybeScrollDown } = await import("../../thincoder-vscode/webview/ui.js")

/** 带三读数的滚动宿主（`scrollTop` 写超值 ⇒ 鉗到底——引擎行为，`applyPin` 依赖它）。
 *  `grow` = 流式输出把内容垫高；`scrollUp` = 用户上滚并派发真 `scroll` 事件（pin 观察的更新点）。 */
function scrollHost({ clientHeight = 800, scrollHeight = 2400 } = {}) {
  const el = document.createElement("div")
  const state = { clientHeight, scrollHeight, top: scrollHeight - clientHeight }
  const maxTop = () => Math.max(0, state.scrollHeight - state.clientHeight)
  Object.defineProperty(el, "clientHeight", { get: () => state.clientHeight, configurable: true })
  Object.defineProperty(el, "scrollHeight", { get: () => state.scrollHeight, configurable: true })
  Object.defineProperty(el, "scrollTop", {
    get: () => state.top,
    set: (value) => { state.top = Math.max(0, Math.min(Number(value) || 0, maxTop())) },
    configurable: true,
  })
  return {
    el,
    grow(by) { state.scrollHeight += by },
    scrollUp(px) {
      el.scrollTop = state.top - px
      el.dispatchEvent(new window.Event("scroll"))
    },
    get top() { return state.top },
    get maxTop() { return maxTop() },
    get bottomGap() { return state.scrollHeight - state.top - state.clientHeight },
  }
}

/** 一回合的帧驱动：帧尾与 VSC `streaming.js` 同形（`frameEnd` ⇒ `maybeScrollDown`）。
 *  `raf` / `now` 注入 ⇒ 帧确定可复现，不依赖真实动画帧。 */
function streamTurn(host, ctx) {
  const frames = []
  let clock = 0
  const renderer = createStreamRenderer({
    token: () => null,
    reasoning: () => null,
    raf: (cb) => frames.push(cb),
    now: () => clock,
    frameEnd: () => maybeScrollDown(ctx),
  })
  return {
    /** 一帧：正文增高 ⇒ 脏位 ⇒ 帧尾滚动作落。 */
    frame(chars = 200) {
      host.grow(chars)
      renderer.markToken()
      clock += STREAM_RENDER_MIN_MS + 1 // 越过核降频墙（随 `STREAM_RENDER_MIN_MS` 自动跟随，不手抄常数）
      for (let i = 0; i < 5 && frames.length > 0; i++) frames.shift()()
      frames.length = 0
    },
  }
}

/** 一个"活回合"：钉底起步（末尾 = 滚到底），pin 观察已接线。 */
function liveTurn() {
  const host = scrollHost()
  const ctx = { messagesEl: host.el }
  initScrollFollow(ctx)
  return { host, ctx, turn: streamTurn(host, ctx) }
}

test("VSC 2-1 离底不足半视口（800 视口 · 上滚 300）⇒ 下一帧输出后视口仍贴底", () => {
  const { host, ctx, turn } = liveTurn()
  assert.equal(nearBottomThreshold(host.el.clientHeight), 400, "视口 800 的阈 = 半视口 400")

  host.scrollUp(300) // 用户在流式回合中上滚 300px —— 不足半视口
  assert.equal(host.bottomGap, 300)
  assert.equal(ctx._pinBottom, true, "阈内的上滚不解钉（旧阈 24px 下这条会翻假——就是用户报的症状）")

  turn.frame()
  assert.equal(ctx._pinBottom, true)
  assert.equal(host.bottomGap, 0, "下一帧输出后视口仍贴底")
  assert.equal(host.top, host.maxTop)
})

test("VSC 2-1 离底超过半视口（800 视口 · 上滚 500）⇒ 解钉，后续帧不再拉底", () => {
  const { host, ctx, turn } = liveTurn()

  host.scrollUp(500)
  assert.equal(host.bottomGap, 500)
  assert.equal(ctx._pinBottom, false, "越过半视口 ⇒ 解钉")

  const before = host.top
  turn.frame()
  turn.frame()
  assert.equal(host.top, before, "后续帧零写视口（内容只增高）")
  assert.equal(host.bottomGap, 900, "两帧各 200 字 ⇒ 离底 500 + 400")
  assert.equal(ctx._pinBottom, false)
})

test("VSC 2-1 离底恰为半视口（800 视口 · 上滚 400）⇒ 解钉（严格小于：恰等阈不判近底）", () => {
  const { host, ctx, turn } = liveTurn()

  host.scrollUp(400)
  assert.equal(host.bottomGap, 400, "恰等阈")
  assert.equal(ctx._pinBottom, false, "达到半视口即解钉")

  const before = host.top
  turn.frame()
  assert.equal(host.top, before, "解钉后帧尾零写")
})

test("VSC 2-1 解钉后回到近底 ⇒ 复钉，下一帧重新贴底", () => {
  const { host, ctx, turn } = liveTurn()

  host.scrollUp(500)
  assert.equal(ctx._pinBottom, false)

  host.el.scrollTop = host.maxTop // 用户滚回底部（回底钮 / 拖条同径）
  host.el.dispatchEvent(new window.Event("scroll"))
  assert.equal(ctx._pinBottom, true, "回底 ⇒ 复钉")

  turn.frame()
  assert.equal(host.bottomGap, 0)
})