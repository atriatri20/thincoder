/**
 * vsc-scroll-follow.test.mjs — 集成用例 `VSC 2-1`（RTM 故事「VSC 2 · 流式输出中视口贴底」，属册 `ends`）。
 *
 * 业务入口：VSC 聊天面板消息区，一次流式回合进行中——用户上滚动作为输入。
 * 断言（业务可观测结果 = 需求 `docs/vsc/requirements/WEBVIEW.md` F-W2 ∥ 设计 `docs/vsc/design/WEBVIEW.md` §5.5）：
 * **上滚一下**（不看已滚多远）⇒ 停跟，后续帧不再把视口拉回底部；解钉后 600ms 宽限窗（`PIN_GRACE_MS`）
 * 窗内不读几何（近底也不即时复钉）、窗内再上滚续期；窗过后近底 ⇒ 复钉、下一帧重新贴底，窗过后仍远离底 ⇒ 维持停跟。
 *
 * 交互组件（跨组件，不是单件）：流式帧应用（核 `thincoder-render-core/flow/stream.mjs` 的 `frameEnd` 帧尾）
 * × pin 观察（核 `thincoder-render-core/scroll.mjs` 的 `createPinWatch` 在 `wheel` ∥ `scroll` 两个入口）
 * × 近底判据（核 `nearBottom` 的视口比例阈）× 宽限窗（核 `PIN_GRACE_MS` 定时器）；端侧装配 =
 * `thincoder-vscode/webview/ui.js`（`initScrollFollow` 两处开 `unpinOnUpScroll` ∥ `maybeScrollDown`——
 * 与 `thincoder-vscode/webview/streaming.js` 的 `frameEnd` 同形）。
 *
 * 几何在本层可观测：驱动真 webview 模块 + 自带 `scrollHeight` ∥ `scrollTop` ∥ `clientHeight` 读数的元素即足
 * ——不需真排版（happy-dom 不排版，真元素 `clientHeight` 恒 0，那样断言会全塌成零读数）。
 * 时钟：本层走真定时器（端侧装配不注入 `deps`）⇒ 窗到期用例等 `PIN_GRACE_MS + 50` ms，不等常数手抄。
 */
import { test } from "node:test"
import assert from "node:assert/strict"
import { Window } from "../../thincoder-vscode/node_modules/happy-dom/lib/index.js"

const window = new Window()
globalThis.window = window
globalThis.document = window.document

const { nearBottomThreshold, PIN_GRACE_MS } = await import("../../thincoder-render-core/scroll.mjs")
const { createStreamRenderer, STREAM_RENDER_MIN_MS } = await import("../../thincoder-render-core/flow/stream.mjs")
const { initScrollFollow, maybeScrollDown } = await import("../../thincoder-vscode/webview/ui.js")

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

/** 带三读数的滚动宿主（`scrollTop` 写超值 ⇒ 鉗到底——引擎行为，`applyPin` 依赖它）。
 *  `grow` = 流式输出把内容垫高；`wheelUp` = 用户滚轮上滚（**先**派 `wheel`、再位移落地、再派 `scroll`——
 *  真实顺序：方向在位移之前到）；`dragTo` = 拖条 ∥ 程序写（只产 `scroll`，不带方向）。 */
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
    wheelUp(px) {
      el.dispatchEvent(new window.WheelEvent("wheel", { deltaY: -100 }))
      el.scrollTop = state.top - px
      el.dispatchEvent(new window.Event("scroll"))
    },
    dragTo(top) {
      el.scrollTop = top
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

test("VSC 2-1 上滚一下即解钉（不看已滚多远：300 ∥ 400 ∥ 500 同判），后续帧不再拉底", () => {
  for (const px of [300, 400, 500]) {
    const { host, ctx, turn } = liveTurn()
    assert.equal(nearBottomThreshold(host.el.clientHeight), 400, "视口 800 的阈 = 半视口 400")

    host.wheelUp(px) // 滚轮上滚：方向先到（不待几何）
    assert.equal(ctx._pinBottom, false, `上滚 ${px}px ⇒ 解钉（旧实现：不足半视口仍贴底 = 用户报的症状）`)

    const before = host.top
    turn.frame()
    turn.frame()
    assert.equal(host.top, before, "后续帧零写视口（内容只增高）")
    assert.equal(host.bottomGap, px + 400, "两帧各 200 字 ⇒ 离底随内容增高")
    assert.equal(ctx._pinBottom, false)
  }
})

test("VSC 2-1 上滚后滚回底部：窗内不即时复钉，窗到期近底复钉、下一帧重新贴底", async () => {
  const { host, ctx, turn } = liveTurn()

  host.wheelUp(300)
  assert.equal(ctx._pinBottom, false)

  host.dragTo(host.maxTop) // 用户拖条 / 回底钮滚回底部
  assert.equal(ctx._pinBottom, false, "窗内不读几何、不翻旗标（近底自愈挂起）")

  await sleep(PIN_GRACE_MS + 50) // 窗到期 ⇒ 定时器跑一次判定
  assert.equal(ctx._pinBottom, true, "几何近底 ⇒ 复钉")

  turn.frame()
  assert.equal(host.bottomGap, 0, "下一帧重新贴底")
  assert.equal(host.top, host.maxTop)
})

test("VSC 2-1 上滚超半视口后窗到期仍远离底 ⇒ 维持停跟（帧不再把视口拽回底部）", async () => {
  const { host, ctx, turn } = liveTurn()

  host.wheelUp(500)
  assert.equal(host.bottomGap, 500)
  assert.equal(ctx._pinBottom, false)

  await sleep(PIN_GRACE_MS + 50)
  assert.equal(ctx._pinBottom, false, "远离底 ⇒ 到期判定不复钉")

  const before = host.top
  turn.frame()
  assert.equal(host.top, before, "零写视口")
  assert.equal(host.bottomGap, 700)
})
