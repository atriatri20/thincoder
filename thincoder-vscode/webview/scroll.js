/**
 * scroll.js — scroll-follow init and the floating scroll-to-bottom button.
 * Lazy history made scrolling back a long trip — the button returns to the
 * latest message in one click. Positioned just above the toolbar.
 * Imported for its side effects.
 */
import { ctx } from "./state.js"
import { t } from "./i18n.js"
import { scrollDown, initScrollFollow } from "./ui.js"
import { nearBottom } from "../node_modules/@thincoder/render-core/scroll.mjs"

initScrollFollow(ctx)

const scrollBottomBtn = document.createElement("button")
scrollBottomBtn.id = "scroll-bottom-btn"
scrollBottomBtn.className = "scroll-bottom-btn"
scrollBottomBtn.type = "button"
scrollBottomBtn.title = t("msg.scrollBottom")
scrollBottomBtn.textContent = "↓"
scrollBottomBtn.addEventListener("click", () => scrollDown(ctx))
document.getElementById("chat-container").appendChild(scrollBottomBtn)

function positionScrollBottomBtn() {
  const tb = document.getElementById("toolbar")
  scrollBottomBtn.style.bottom = (tb ? tb.offsetHeight : 150) + 10 + "px"
}
positionScrollBottomBtn()
window.addEventListener("resize", positionScrollBottomBtn)

export function updateScrollBottomVisibility() {
  const el = ctx.messagesEl
  // 非近底判据 = 核 `nearBottom`（与 pin 同一把尺——阈按视口比例，算式单源 = 核
  // `nearBottomThreshold`；本端自持的旧像素阈已退场，钮与 pin 不再各持一数）。
  // `scrollable` 判的是「能不能滚」，与「离底多远」是两个量——并进来可滚判定就会随阈值漂。
  const scrollable = el.scrollHeight > el.clientHeight + 40
  scrollBottomBtn.classList.toggle("visible", scrollable && !nearBottom(el))
}
