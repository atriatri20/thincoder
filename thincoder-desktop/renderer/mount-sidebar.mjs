/**
 * mount-sidebar.mjs — 左侧工作区边栏（Codex 形大改批 · 2026-10-04）：
 * 面 = 品牌行（折叠钮 ∕ 产品名）+ 动作行（新聊天 ∕ 打开目录）+ 项目段（当前项目名 + 会话树 —— `sessionModel`
 * 单源复用）+ 最近项目段（`project.recent` 切片投影，当前 cwd 除外 —— 点项 = 切工作区）+ 底部设置出口。
 * 数据零新通道：`project` ∕ `sessions` 两切片 = `refreshRail` 既有单源（`session-wire.mjs`），本档零第二读路；
 * 出口复用（装配注入 —— 零第二实现）：`onSwitch` = `activateSession` ∕ `onNew` = `createSession` ∕
 * `onOpenProject` = `openDir`（装配面同款链：开项目 + 列表刷新 + 点开即续）∕ `onOpenSettings` = 设置面开口。
 * 折叠态 = body 类（`body.sidebar-collapsed` —— CSS 单源）+ localStorage 持久（fail-soft —— 隐私模式忘却，
 * 会话内仍生效）；展开收窄为图标列（重展钮常在 —— 折叠面不失出口）。
 * 订阅键 `SIDEBAR_KEYS`（project ∕ sessions ∕ tabBadges ∕ locale）⇒ 整树重挂（构树面纯读现态；树小 —— 条目
 * ≤ 最近 10 ∖ 当前项目会话数，零键控差分成本）。纪律：零 `node:` ∕ 零裸包；文案一律经 `t()`；字形面
 * （+ ∕ ⌂ ∕ ⚙ ∕ ☰ ∕ 徽标点）住 `codex.css` `content`（视图档零字形字面 —— 沿 `chrome.css` 纪律）。
 */
import { build, clear, el } from "./dom.mjs"
import { t } from "./i18n.mjs"
import { store } from "./store.mjs"
import { sessionModel } from "./views/session-control.mjs"

/** 边栏挂载槽锚（骨架 = `renderer/index.html` `.app` 首列）。 */
export const SIDEBAR_SLOT = '[data-slot="sidebar"]'

/** 重挂触发切片（project ∕ sessions = `refreshRail` 写面 ∕ tabBadges = 位标 ∕ locale = 词表切换）。 */
const SIDEBAR_KEYS = ["project", "sessions", "tabBadges", "locale"]
const COLLAPSE_KEY = "thincoder.sidebar.collapsed"

/** 折叠态读（localStorage fail-soft）。 */
function collapsedRead() {
  try { return localStorage.getItem(COLLAPSE_KEY) === "1" } catch { return false }
}

/** 折叠态写（fail-soft —— 存不了 ⇒ 会话内仍生效）。 */
function collapsedWrite(value) {
  try { localStorage.setItem(COLLAPSE_KEY, value ? "1" : "0") } catch { /* 隐私模式 ∕ 禁存 —— 忽略 */ }
}

/** cwd 尾段（最近项目行显示名 —— 与 `session-control.mjs` `baseName` 同判，本档私有零导出）。 */
function baseName(cwd) {
  const parts = String(cwd ?? "").split(/[\\/]/).filter((part) => part !== "")
  return parts.length > 0 ? parts[parts.length - 1] : String(cwd ?? "")
}

/** 边栏模型（纯读切片）：当前项目树 = `sessionModel` 复用 + 最近项目（当前 cwd 除外 —— 回执原序 = mtime 降序）。 */
function sidebarModel(state = {}) {
  const model = sessionModel(state)
  const cwd = model.project?.cwd ?? null
  const recent = (Array.isArray(state?.project?.recent) ? state.project.recent : [])
    .map((row) => (typeof row?.cwd === "string" && row.cwd !== "" ? row.cwd : null))
    .filter((rowCwd) => rowCwd !== null && rowCwd !== cwd)
  return { ...model, recent }
}

/** 会话条目行（点击即切 —— 三路开会话同一路 = `activateSession`；**右键 = 会话管理菜单**（重命名 ∕ 删除 ——
 *  出口复用 session-wire 单一实现，见 handlers.onRename ∕ onDelete）。 */
function sessionItemNode(item, handlers) {
  return {
    tag: "button",
    props: {
      class: item.active === true ? "sidebar-item active" : "sidebar-item",
      type: "button",
      "data-action": "sidebar:switch",
      "data-key": item.key,
      title: item.title,
      onClick: () => handlers.onSwitch?.(item.key),
      onContextMenu: (event) => {
        if (typeof handlers.onMenuOpen !== "function") return
        event.preventDefault()
        handlers.onMenuOpen({ key: item.key, title: item.title, x: event.clientX, y: event.clientY })
      },
    },
    children: [
      { tag: "span", props: { class: "sidebar-item-title" }, children: [item.title] },
      item.badge
        ? { tag: "span", props: { class: "sidebar-item-badge" }, children: [item.badge] }
        : null,
    ],
  }
}

/** 最近项目行（点项 = 切工作区 —— `project:open` 同链；全路径住 `title`）。 */
function recentRowNode(cwd, handlers) {
  return {
    tag: "button",
    props: {
      class: "sidebar-item sidebar-recent-item",
      type: "button",
      "data-action": "sidebar:openProject",
      "data-path": cwd,
      title: cwd,
      onClick: () => handlers.onOpenProject?.(cwd),
    },
    children: [{ tag: "span", props: { class: "sidebar-item-title" }, children: [baseName(cwd)] }],
  }
}

/** 边栏树（品牌行 → 动作行 → 滚动区〔项目段 ∕ 最近段〕→ 底行〔设置〕）。字形全住 CSS `content`。 */
function sidebarTree(model, handlers) {
  const projectRow = model.project === null
    ? {
      tag: "div",
      props: { class: "sidebar-project-row empty", "data-project": "" },
      children: [{ tag: "span", props: { class: "sidebar-item-title" }, children: [t("rail.action.openDir")] }],
    }
    : {
      tag: "div",
      props: { class: "sidebar-project-row", "data-project": model.project.cwd, title: model.project.cwd },
      children: [{ tag: "span", props: { class: "sidebar-item-title" }, children: [model.project.name] }],
    }
  return {
    tag: "div",
    props: { class: "sidebar-body" },
    children: [
      { tag: "div", props: { class: "sidebar-head" }, children: [
        { tag: "button", props: { class: "sidebar-toggle", type: "button", "aria-label": t("sidebar.collapse"), title: t("sidebar.collapse"), "data-action": "sidebar:toggle", onClick: handlers.onToggle }, children: [] },
        { tag: "span", props: { class: "sidebar-brand" }, children: ["ThinCoder"] },
      ] },
      { tag: "div", props: { class: "sidebar-actions" }, children: [
        { tag: "button", props: { class: "sidebar-new", type: "button", "data-action": "sidebar:new", "aria-label": t("sidebar.newChat"), title: t("sidebar.newChat"), onClick: handlers.onNew }, children: [
          { tag: "span", props: { class: "sidebar-new-label" }, children: [t("sidebar.newChat")] },
        ] },
        { tag: "button", props: { class: "sidebar-opendir", type: "button", "data-action": "sidebar:openDir", "aria-label": t("rail.action.openDir"), title: t("rail.action.openDir"), onClick: () => handlers.onOpenProject?.() }, children: [] },
      ] },
      { tag: "div", props: { class: "sidebar-scroll" }, children: [
        { tag: "div", props: { class: "sidebar-section-head" }, children: [t("sidebar.projects")] },
        projectRow,
        { tag: "div", props: { class: "sidebar-sessions" }, children: model.items.map((item) => sessionItemNode(item, handlers)) },
        model.recent.length > 0
          ? { tag: "div", props: { class: "sidebar-section-head recent" }, children: [t("sidebar.recent")] }
          : null,
        ...model.recent.map((cwd) => recentRowNode(cwd, handlers)),
      ] },
      { tag: "div", props: { class: "sidebar-foot" }, children: [
        { tag: "button", props: { class: "sidebar-settings", type: "button", "data-action": "sidebar:settings", "aria-label": t("settings.title"), title: t("settings.title"), onClick: handlers.onOpenSettings }, children: [
          { tag: "span", props: { class: "sidebar-settings-label" }, children: [t("settings.title")] },
        ] },
      ] },
    ],
  }
}

/** 整树重挂（纯读现态 —— 容器缺位 ⇒ 空转；树小 ⇒ 零键控差分）。 */
function paintSidebar(handlers) {
  const root = document.querySelector(SIDEBAR_SLOT)
  if (!root || typeof root.append !== "function") return null
  clear(root)
  root.append(build(sidebarTree(sidebarModel(store.get()), handlers)))
  return true
}

// ─── 会话管理（右键菜单 + 行内改名 + 删除确认 —— 2026-10-05；出口复用 session-wire 单一实现）──────

/** 菜单单例（body 直挂 —— 边栏重绘不撕）。 */
let menuEl = null
let outsideBound = false

function closeMenu() {
  menuEl?.remove()
  menuEl = null
}

/** 右键菜单（重命名 ∕ 删除；定位贴光标 + 视口夹取）。 */
function openSessionMenu(pane, handlers, { key, title, x, y }) {
  closeMenu()
  menuEl = document.createElement("div")
  menuEl.className = "sidebar-menu"
  const item = (label, cls, fn) => {
    const button = document.createElement("button")
    button.type = "button"
    button.className = cls
    button.textContent = label
    button.addEventListener("click", () => {
      closeMenu()
      fn()
    })
    return button
  }
  menuEl.append(item(t("sidebar.rename"), "", () => startRename(pane, handlers, { key, title })))
  menuEl.append(item(t("sidebar.delete"), "danger", () => confirmDelete(pane, handlers, { key, title })))
  document.body.append(menuEl)
  const rect = menuEl.getBoundingClientRect()
  menuEl.style.left = `${Math.max(8, Math.min(x, window.innerWidth - rect.width - 8))}px`
  menuEl.style.top = `${Math.max(8, Math.min(y, window.innerHeight - rect.height - 8))}px`
}

/** 点外关 ∕ Esc 关（文档级一枚）。 */
function bindMenuDismiss() {
  if (outsideBound) return
  outsideBound = true
  document.addEventListener("click", (event) => {
    if (menuEl !== null && event.target instanceof Node && !menuEl.contains(event.target)) closeMenu()
  })
  document.addEventListener("keydown", (event) => {
    if (event?.key === "Escape") closeMenu()
  })
}

/** 行内改名形（条目原位换形 —— 沿 session-list 改名形同律）：Enter 提交 ∕ Esc 取消 ∕ 两枚小键；
 *  成功 ⇒ refreshRail（session-wire 内）→ 边栏重绘自收形；失败 ⇒ 形保留（草稿不丢，toast 已由 wire 出）。 */
function startRename(pane, handlers, { key, title }) {
  const host = document.querySelector(SIDEBAR_SLOT)
  const itemButton = host?.querySelector(`.sidebar-item[data-key="${CSS.escape(key)}"]`) ?? null
  if (itemButton === null) return
  itemButton.style.display = "none"
  const form = document.createElement("div")
  form.className = "sidebar-rename"
  const input = document.createElement("input")
  input.className = "sidebar-rename-input"
  input.value = title
  const submit = () => {
    const value = input.value.trim()
    if (value === "" || value === title) {
      form.remove()
      itemButton.style.display = ""
      return
    }
    void Promise.resolve(handlers.onRename?.(key, value)).then((okFlag) => {
      if (okFlag !== true) return
      form.remove()
      itemButton.style.display = ""
    })
  }
  const cancel = () => {
    form.remove()
    itemButton.style.display = ""
  }
  input.addEventListener("keydown", (event) => {
    if (event?.key === "Enter") submit()
    if (event?.key === "Escape") cancel()
  })
  const yes = el("button", { class: "sidebar-rename-yes", type: "button", title: t("settings.save"), onClick: () => { submit() } }, ["✓"])
  const no = el("button", { class: "sidebar-rename-no", type: "button", title: t("settings.cancel"), onClick: () => { cancel() } }, ["✕"])
  form.append(input, yes, no)
  itemButton.after(form)
  input.focus()
  input.select()
}

/** 删除确认 popover（复用 `.auto-confirm` 族样式 —— session 删除确认同款；默认焦点落取消）。 */
function confirmDelete(pane, handlers, { key, title }) {
  const backdrop = el("div", { class: "auto-backdrop", onClick: () => closeConfirm() })
  const popover = el("div", { class: "auto-confirm", role: "alertdialog", "aria-label": t("session.delete") }, [
    el("div", { class: "auto-confirm-text" }, [t("session.deleteConfirm", { title })]),
    el("div", { class: "auto-confirm-actions" }, [
      el("button", {
        type: "button", class: "auto-confirm-yes", "aria-label": t("session.delete"),
        onClick: () => {
          closeConfirm()
          void handlers.onDelete?.(key)
        },
      }, [t("session.delete")]),
      el("button", { type: "button", class: "auto-confirm-no", "aria-label": t("question.cancel"), onClick: () => closeConfirm() }, [t("question.cancel")]),
    ]),
  ])
  let live = true
  function closeConfirm() {
    if (!live) return
    live = false
    backdrop.remove()
    popover.remove()
  }
  document.body.append(backdrop, popover)
  setTimeout(() => popover.querySelector(".auto-confirm-no")?.focus?.(), 50)
}

/**
 * 装配（一次性 —— `renderer/app.mjs` 消费）：折叠态从持久恢复（body 类单写点）+ 首绘 + 订阅重挂。
 * 折叠钮出口 = 本档内聚（body 类 + localStorage —— 零切片）；余出口 = 装配注入（单一实现零副本）。
 * 会话管理出口（onRename ∕ onDelete）= 装配注入（session-wire 单一实现转口）；右键菜单 ∕ 行内改名 ∕
 * 删除确认 = 本档内聚面。
 */
export function attachSidebar(handlers = {}) {
  if (collapsedRead()) document.body.classList.add("sidebar-collapsed")
  const face = {
    ...handlers,
    onToggle: () => {
      const collapsed = !document.body.classList.contains("sidebar-collapsed")
      document.body.classList.toggle("sidebar-collapsed", collapsed)
      collapsedWrite(collapsed)
    },
    onMenuOpen: (payload) => {
      bindMenuDismiss()
      openSessionMenu(document.querySelector(SIDEBAR_SLOT), face, payload)
    },
  }
  const paint = () => paintSidebar(face)
  const detach = store.subscribe((state, changedKeys) => {
    if (Array.isArray(changedKeys) && !changedKeys.some((key) => SIDEBAR_KEYS.includes(key))) return
    paint()
  })
  paint()
  return { paintSidebar: paint, detach }
}
