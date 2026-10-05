/**
 * chrome-words.mjs — 核件控件行静态字面语言补丁（中文模式收正批 · 2026-10-04）：
 * 核 `composer/controls.mjs` ∕ `attach.mjs` 的 title ∕ aria-label ∕ Attach 可见字面 = VSC 逐字英文硬编码
 * （C4 口径 —— 值源照搬），键面不存在 ⇒ 核内取词无门。本档桌面侧**装配后 DOM 回写**（单点 `paintComposerWords`）：
 * 七控件钮 + 附件钮的 title ∕ aria ∕ 可见字面 ← `t()`（键源 = `i18n-composer.mjs` ⑤ `toolbar.*` ∕ `attach.*`
 * —— en 值 = 核字面逐字，zh 补译）。重绘点 = 装配一次 + `locale` 切片订阅（语言切换随动）。
 * 边界在册：核内**动态**题注（plan 禁用态 = `toolbar.planDisabled` 键面取词）仍走核取词，本档零涉；
 * 核重挂（现行装配 = 一次，零重挂径）⇒ 补丁随之失效 —— 在册债，出现重挂径时需同点复涂。
 * 纪律：查询缺席 ⇒ 空转（容错 —— web 平测核件未挂时不掷）；零 `node:` ∕ 零裸包。
 */
import { t } from "./i18n.mjs"
import { store } from "./store.mjs"

/** 补丁表：`[选择器, title 词键, aria 词键]`（title ∕ aria 同值 —— 双键留扩展缝）。 */
const WORDS = Object.freeze([
  ["#model-btn", "toolbar.changeModel", "toolbar.changeModel"],
  ["#reasoning-btn", "toolbar.reasoning", "toolbar.reasoning"],
  ["#auto-btn", "toolbar.autoApprove", "toolbar.autoApproveToggle"],
  ["#advisor-btn", "toolbar.advisor", "toolbar.advisorToggle"],
  ["#eng-btn", "toolbar.engineering", "toolbar.engineeringToggle"],
  ["#plan-btn", "toolbar.plan", "toolbar.planToggle"],
  ["#settings-btn", "toolbar.settings", "toolbar.openSettings"],
])

/** 单点回写（幂等 —— 值变才写不强求，写本身幂等）：钮缺 ⇒ 跳过（核件未挂面）。 */
export function paintComposerWords() {
  for (const [selector, titleKey, ariaKey] of WORDS) {
    const btn = document.querySelector(selector)
    if (btn === null) continue
    btn.title = t(titleKey)
    btn.setAttribute("aria-label", t(ariaKey))
  }
  const attach = document.querySelector("#attach-btn")
  if (attach !== null) {
    attach.title = t("attach.image")
    attach.setAttribute("aria-label", t("attach.image"))
    attach.textContent = t("attach.label")
  }
}

/** 装配（一次性 —— `renderer/app.mjs` 消费，序在 `attachComposer` 之后）：首涂 + 语言切换随涂
 *  + **plan 钮 title 监听**（核 `applyModeButtons` 在模式位推送 ∕ 工程态往返时以**构造期捕获的英文缺省值**
 *  回写 plan title —— 静涂被覆盖的在册边缘；本观察器见字面回英文 ⇒ 复涂，Attribute Observer 自持断开防线）。 */
export function attachChromeWords() {
  paintComposerWords()
  const plan = document.querySelector("#plan-btn")
  if (plan !== null && typeof MutationObserver === "function") {
    const repaint = () => {
      if (plan.title === t("toolbar.plan")) return
      if (plan.disabled !== true && plan.title !== t("toolbar.planDisabled")) plan.title = t("toolbar.plan")
    }
    new MutationObserver(repaint).observe(plan, { attributes: true, attributeFilter: ["title"] })
  }
  return store.subscribe((state, changedKeys) => {
    if (Array.isArray(changedKeys) && !changedKeys.includes("locale")) return
    paintComposerWords()
  })
}
