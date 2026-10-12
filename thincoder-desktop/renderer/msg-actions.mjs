/**
 * msg-actions.mjs — 消息操作行**点击委托**（复制 · ZCode `MessageActions` 对位 · 2026-10-12）。
 *
 * 形面住构树档（`views/chat-tree.mjs` `msgActionsNode` —— 用户 ∕ 助手两族挂图标钮；hover ∕ focus 显现
 * 归 CSS），本档只做**行为**：全局委托 `[data-action="msg:copy"]` 点击 ⇒ 取所在块文本面 `[data-raw]`
 * 原始串（`textFace` 落笔单源——用户块已是**剥除指引行**后的显示文，与所见一致）⇒ 写剪贴板 ⇒
 * 成功态打勾 1200ms（`data-copied` + 词面切 `msg.copied`）后自复位。
 * 语义对照（ZCode `CopyRowAction`）：`navigator.clipboard.writeText` · 空文本不发（`disabled` 同义）·
 * 1200ms 打勾 · 词面由调用面给（本档取既有词键 `msg.copy` ∕ `msg.copied`——核件代码块复制钮同键，
 * 零新键）。失败（无剪贴板 ∕ 写拒绝）⇒ 诊断一行、零成功态（诚实面——不打假勾）。
 * 纪律：零 `node:` ∕ 零裸包；剪贴板 ∕ 计时器走注入缝（平 node 直测）。
 */

import { t } from "./i18n.mjs"

const REVERT_MS = 1200

/** 在飞复位计时器（按钮 → timer id——连点复用同枚钮时清旧防串态）。 */
const timers = new Map()

/** 取按钮所在块的原始文本（`[data-raw]` = 文本面落笔单源；块 ∕ 文本面缺位 ⇒ 空串 ⇒ 零动作）。 */
export function copyTargetText(btn) {
  const block = typeof btn?.closest === "function" ? btn.closest(".block") : null
  const raw = block !== null && typeof block.querySelector === "function" ? block.querySelector("[data-raw]") : null
  const value = raw !== null && typeof raw.getAttribute === "function" ? raw.getAttribute("data-raw") : null
  return typeof value === "string" ? value : ""
}

/** 写剪贴板 + 成功态（ZCode 同律：打勾 1200ms 自复位）。返回是否已发起写入（空文本 ∕ 无剪贴板 ⇒ false）。 */
export function copyWithFeedback(btn, text, { clipboard = globalThis.navigator?.clipboard ?? null, timer = globalThis.setTimeout, clear = globalThis.clearTimeout } = {}) {
  if (btn === null || btn === undefined || typeof text !== "string" || text === "") return false
  if (clipboard === null || typeof clipboard.writeText !== "function") {
    console.error("[msg-actions] clipboard unavailable — copy skipped")
    return false
  }
  const done = () => {
    btn.setAttribute("data-copied", "")
    btn.title = t("msg.copied")
    btn.setAttribute("aria-label", t("msg.copied"))
    const prev = timers.get(btn)
    if (prev !== undefined) clear(prev)
    timers.set(btn, timer(() => {
      btn.removeAttribute("data-copied")
      btn.title = t("msg.copy")
      btn.setAttribute("aria-label", t("msg.copy"))
      timers.delete(btn)
    }, REVERT_MS))
  }
  Promise.resolve(clipboard.writeText(text)).then(done).catch((err) => {
    console.error(`[msg-actions] clipboard write failed: ${err?.message ?? err}`)
  })
  return true
}

/** 装配（一次性——`renderer/app.mjs` 消费；`wireImagePreview` 同款全局委托接线）。 */
export function wireMsgActions() {
  if (typeof document === "undefined" || typeof document.addEventListener !== "function") return
  document.addEventListener("click", (e) => {
    const target = e.target instanceof Element ? e.target : null
    const btn = target === null ? null : target.closest('[data-action="msg:copy"]')
    if (btn === null) return
    copyWithFeedback(btn, copyTargetText(btn))
  })
}
