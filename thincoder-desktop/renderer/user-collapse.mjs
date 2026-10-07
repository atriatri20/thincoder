/**
 * user-collapse.mjs — 用户消息长文折叠（fork 2026-10-06 —— ZCode `ConversationUserInputBody`
 * 语义移植）：用户气泡内容 scrollHeight > 121px（120 + 1 容差——ZCode 同值）⇒ 折叠：
 * `max-height: 120px` + `overflow: hidden` + 底部 30% 渐隐遮罩（CSS `[data-collapsed]`）+
 * 居中圆形箭头钮（浮于渐隐区上——点击展开到实际内容高 300ms 过渡，再点收回）。
 * chrome 级后处理（同 `chat-work.mjs` 形）：MutationObserver 扫新块接线；**折叠判定 = 进视口才评**
 * （`.block` content-visibility auto ⇒ 屏外块 scrollHeight = intrinsic 估计 ≠ 实高——挂载时盲评会
 * 误判短文折叠；IntersectionObserver 见真渲染再判 ∕ 离开视口复评未展开元素 ∕ resize 复评）；
 * 展开态 = 用户意图，复评零触碰。装配 = `app.mjs` 一次。零 `node:` ∕ 零裸包；词面经 `t()`。
 */
import { t } from "./i18n.mjs"

/** 折叠阈值（ZCode 同值）：120px + 1 容差（防取整抖动）。 */
const MAX_HEIGHT_PX = 120
const TOLERANCE_PX = 1
/** 已接线元素（WeakSet —— 块亡随 GC；按钮一生一挂）。 */
const wired = new WeakSet()

function overflowing(el) {
  return el.scrollHeight > MAX_HEIGHT_PX + TOLERANCE_PX
}

/** 态评估：未展开元素按现 scrollHeight 翻 ∕ 撤折叠态（进视口 ∕ resize 复评共用）。 */
function evaluate(el) {
  if (el.hasAttribute("data-expanded")) return
  el.toggleAttribute("data-collapsed", overflowing(el))
}

/** 单例观察器（模块级——sweep 只挂元素不建观察器）：块进视口（开始真实渲染）⇒ 评折叠态。 */
const io = new IntersectionObserver((entries) => {
  for (const entry of entries) if (entry.isIntersecting) evaluate(entry.target)
}, { rootMargin: "200px" })

function sweep(root) {
  for (const text of root.querySelectorAll(".block-user > .block-text")) {
    if (wired.has(text)) continue
    wired.add(text)
    io.observe(text)
    const btn = document.createElement("button")
    btn.type = "button"
    btn.className = "msg-collapse-btn"
    btn.setAttribute("aria-label", t("chat.msg.expand"))
    btn.addEventListener("click", (event) => {
      event.stopPropagation()
      const collapsed = text.hasAttribute("data-collapsed")
      if (collapsed) {
        text.removeAttribute("data-collapsed")
        text.setAttribute("data-expanded", "")
        text.style.maxHeight = `${text.scrollHeight}px` // 实际内容高 ⇒ 300ms 过渡有终点
        btn.setAttribute("aria-label", t("chat.msg.collapse"))
      } else {
        text.removeAttribute("data-expanded")
        text.style.maxHeight = "" // 回落 CSS 120px
        evaluate(text) // **补折叠态**（点击不触 MutationObserver——不能等 sweep 补课）
        btn.setAttribute("aria-label", t("chat.msg.expand"))
      }
    })
    text.append(btn)
  }
}

/** 装配（`app.mjs` 一次）：首扫全文档 + 流内 MutationObserver 扫增量 + resize 复评。返停表（形对称）。 */
export function attachUserCollapse() {
  sweep(document)
  const flow = document.querySelector(".flow")
  let timer = null
  const schedule = () => {
    if (timer !== null) return
    timer = setTimeout(() => {
      timer = null
      sweep(flow ?? document)
    }, 150)
  }
  const observer = new MutationObserver(schedule)
  if (flow !== null) observer.observe(flow, { childList: true, subtree: true })
  window.addEventListener("resize", () => {
    for (const text of document.querySelectorAll(".block-user > .block-text")) evaluate(text)
  })
  return () => {
    observer.disconnect()
    io.disconnect()
    window.removeEventListener("resize", schedule)
    if (timer !== null) clearTimeout(timer)
  }
}
