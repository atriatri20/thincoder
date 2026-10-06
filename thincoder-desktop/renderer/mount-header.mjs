/**
 * mount-header.mjs — 统一 Header 挂载（fork 2026-10-06 —— 双层 Top Bar 合并批）：
 * 原生标题栏隐藏（`titleBarStyle: hidden` + 系统 overlay 窗口控制钮）+ 窗口菜单栏摘除
 * （`Menu.setApplicationMenu` 保加速键 ∕ `win.setMenu(null)` 摘可见条）后，本档把**全局菜单**
 * 五钮（文件 ∕ 编辑 ∕ 视图 ∕ 设置 ∕ 帮助）渲染进 HTML Header：点击 ⇒ `menu:popup` IPC
 * （钮内容坐标 ⇒ `menu.popup` 窗口相对弹出——主侧现建现弹，recent ∕ 主题勾 ∕ 更新态每次现读）。
 * 词面 = `i18n-views.mjs` `header.menu.*`（值 = `menu-words.mjs` 同文——五名 UI 词，主侧菜单条已退场
 * ⇒ 双语各一份字面可容忍）；`locale` 切片订阅 ⇒ 词随动。web 平测（quickcheck）⇒ host 缺 ⇒ 零动作
 * （按钮在，点击静默——可及面诚实）。拖拽面 = CSS `-webkit-app-region`（codex.css）。
 * 纪律：零 `node:` ∕ 零裸包；文案一律经 `t()`。
 */
import { build, clear } from "./dom.mjs"
import { t } from "./i18n.mjs"
import { store } from "./store.mjs"

const HEADER_SLOT = '[data-slot="app-header"]'
const MENUS_SLOT = '[data-slot="header-menus"]'

/** 五顶层项（序 = `app-menu.mjs` 模板序；id 尾段 = 主侧 `app-menu-*` 前缀配对）。 */
const MENUS = Object.freeze([
  ["file", "header.menu.file"],
  ["edit", "header.menu.edit"],
  ["view", "header.menu.view"],
  ["settings", "header.menu.settings"],
  ["help", "header.menu.help"],
])

function paint() {
  const nav = document.querySelector(MENUS_SLOT)
  if (nav === null) return
  clear(nav)
  for (const [name, wordKey] of MENUS) {
    nav.append(build({
      tag: "button",
      props: {
        class: "header-menu-btn",
        type: "button",
        "data-action": "app:menu",
        "data-menu": name,
        "aria-label": t(wordKey),
        onClick: (event) => {
          const host = globalThis.window?.thincoder
          if (host?.invoke === undefined) return // web 平测——无窗口面
          const rect = event?.currentTarget?.getBoundingClientRect()
          void Promise.resolve(host.invoke("menu:popup", {
            name,
            x: Number.isFinite(rect?.left) ? Math.round(rect.left) : undefined,
            y: Number.isFinite(rect?.bottom) ? Math.round(rect.bottom) : undefined,
          })).catch((error) => console.error("[header] menu:popup failed:", error))
        },
      },
      children: [t(wordKey)],
    }))
  }
  const toggle = document.querySelector(`${HEADER_SLOT} .header-toggle`)
  if (toggle !== null) {
    toggle.setAttribute("aria-label", t("sidebar.collapse"))
    toggle.setAttribute("title", t("sidebar.collapse"))
  }
  const winWords = { minimize: "header.win.min", maximize: "header.win.max", close: "header.win.close" }
  for (const btn of document.querySelectorAll(".header-win-controls .win-btn")) {
    const word = winWords[btn.getAttribute("data-win")]
    if (word === undefined) continue
    btn.setAttribute("aria-label", t(word))
    btn.setAttribute("title", t(word))
  }
}

/** 自绘窗口控制钮接线（fork 2026-10-06——「和 Header 集成在一起」）：三钮 → `window:control`
 *  （minimize ∕ maximize toggle ∕ close）；`ev:win-max` 推送切最大化图标（❐ ∕ ▣）。
 *  词面 = 系统钮无字面（aria 双语键沿最小面——复用 `settings.close` ∕ `sidebar.collapse` 族外另立三键）。 */
function wireWinControls() {
  const host = globalThis.window?.thincoder
  for (const btn of document.querySelectorAll(".header-win-controls .win-btn")) {
    btn.addEventListener("click", () => {
      const action = btn.getAttribute("data-win")
      if (host?.invoke === undefined) return // web 平测
      void Promise.resolve(host.invoke("window:control", { action })).catch((error) => console.error("[header] window:control failed:", error))
    })
  }
  if (host?.on === undefined) return
  host.on("ev:win-max", (ev) => {
    const maximized = ev?.maximized === true
    document.querySelector('.header-win-controls .win-max')?.toggleAttribute("data-maxed", maximized)
  })
}

/** 装配（`app.mjs` 装配期一次）：首涂 + `locale` 随涂。返回句柄面（退订——现状零消费面，形对称）。 */
export function attachHeader() {
  paint()
  wireWinControls()
  return store.subscribe((_state, changedKeys) => {
    if (Array.isArray(changedKeys) && !changedKeys.includes("locale")) return
    paint()
  })
}
