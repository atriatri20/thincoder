/**
 * mount-sidebar.mjs — 左侧工作区边栏（Codex 形大改批 · 2026-10-04）：
 * 面 = 品牌行（折叠钮 ∕ 产品名）+ 动作行（新聊天 ∕ 打开目录）+ 项目段（当前项目名 + 会话树 —— `sessionModel`
 * 单源复用）+ 最近项目段（`project.recent` 切片投影，当前 cwd 除外 —— 点项 = 切工作区）+ 底部设置出口。
 * 数据零新通道：`project` ∕ `sessions` 两切片 = `refreshRail` 既有单源（`session-wire.mjs`），本档零第二读路；
 * 出口复用（装配注入 —— 零第二实现）：`onSwitch` = `activateSession` ∕ `onNew` = `createSession` ∕
 * `onOpenProject` = `openDir`（装配面同款链：开项目 + 列表刷新 + 点开即续）∕ `onOpenSettings` = 设置面开口。
 * 折叠态 = body 类（`body.sidebar-collapsed` —— CSS 单源）+ localStorage 持久（fail-soft —— 隐私模式忘却，
 * 会话内仍生效）；展开收窄为图标列（重展钮常在 —— 折叠面不失出口）。
 * 订阅键 `SIDEBAR_KEYS`（project ∕ sessions ∕ catalog ∕ tabBadges ∕ locale）⇒ 整树重挂（构树面纯读现态；树小 —— 条目
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
const SIDEBAR_KEYS = ["project", "sessions", "catalog", "tabBadges", "locale"]
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

/** 边栏模型（纯读切片）：当前项目树 = `sessionModel` 复用（补 ts 供日期分组）+ 最近项目（当前 cwd 除外）。
 *  搜索过滤文案住本档模块态（`filterText` —— 输入域局部态，不入 store）。 */
let filterText = ""

function sidebarModel(state = {}) {
  const model = sessionModel(state)
  const cwd = model.project?.cwd ?? null
  const raw = Array.isArray(state?.sessions) ? state.sessions : []
  const tsBySlot = new Map(raw.map((row) => [String(row?.slot), row?.updatedAt]))
  const items = model.items.map((item) => ({ ...item, ts: tsBySlot.get(item.key) }))
  const recent = (Array.isArray(state?.project?.recent) ? state.project.recent : [])
    .map((row) => (typeof row?.cwd === "string" && row.cwd !== "" ? row.cwd : null))
    .filter((rowCwd) => rowCwd !== null && rowCwd !== cwd)
  // 项目目录（sessions:catalog · 2026-10-05）：排序由 projectsOf 统一（固定字母序）；displayTitle 兜底链（title → firstMessage）与
  // sessionModel `displayTitleOf` 同判（零第二判据——此处独立实现因跨档不可导入）。
  const catalogProjects = (Array.isArray(state?.catalog) ? state.catalog : []).map((project) => ({
    cwd: project?.cwd ?? null,
    isCurrent: project?.cwd === cwd,
    sessions: (Array.isArray(project?.sessions) ? project.sessions : [])
      .map((s) => ({
        slot: String(s?.slot ?? ""),
        title: typeof s?.title === "string" && s.title !== "" ? s.title : "",
        firstMessage: typeof s?.firstMessage === "string" ? s.firstMessage.replace(/\s+/gu, " ").trim() : "",
        updatedAt: Number.isFinite(s?.updatedAt) ? s.updatedAt : 0,
        isActive: s?.isActive === true,
      }))
      .sort((a, b) => b.updatedAt - a.updatedAt),
  }))
  return { ...model, items, recent, catalogProjects, badges: state?.tabBadges ?? null }
}

/** 显示标题兜底（与 `session-control.mjs` `displayTitleOf` 同判——title 空 ⇒ 首条消息单行截 60）。 */
/** 相对时间（ZCode 侧栏同款口径：<1 分「刚刚」< 1 小时「N 分」< 24 小时「N 小时」其余「N 天」）。 */
function fmtRelative(ms) {
  if (!Number.isFinite(ms) || ms <= 0) return ""
  const minutes = Math.floor((Date.now() - ms) / 60000)
  if (minutes < 1) return t("time.justNow")
  if (minutes < 60) return t("time.min", { n: minutes })
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return t("time.hour", { n: hours })
  return t("time.day", { n: Math.floor(hours / 24) })
}

/** 相对时间 span（会话行右侧 · 弱化）。 */
function timeSpanOf(ms) {
  const text = fmtRelative(ms)
  return text === "" ? null : { tag: "span", props: { class: "sidebar-item-time" }, children: [text] }
}

function displayTitleOfSession(session) {
  if (typeof session?.title === "string" && session.title !== "") return session.title
  const first = typeof session?.firstMessage === "string" ? session.firstMessage.trim() : ""
  if (first !== "") return first.length > 60 ? `${first.slice(0, 60)}…` : first
  return t("rail.session.untitled")
}

/** 日期分组键（ZCode 同口径：今天 ∕ 最近 7 天 ∕ 更早；无 ts ⇒ 更早）。 */
function groupKeyOf(ts) {
  if (!Number.isFinite(ts)) return "earlier"
  const now = new Date()
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  if (ts >= startToday) return "today"
  if (ts >= startToday - 6 * 86400000) return "week"
  return "earlier"
}

/** 会话条目行（**容器 = div**（⋯ 按钮需内嵌——button 嵌 button 非法）：点击 ∕ Enter ∕ Space 即切；
 *  当前项目：**右键 ∕ hover ⋯ = 管理菜单**；其他项目条目（项目组预览 · 2026-10-05）：点击 = 切项目
 *  （`onOpenProject(cwd)` 接续该项目活跃会话）——右键 ∕ ⋯ 仅当前项目条目提供（rename ∕ delete 通道
 *  cwd 取主进程当前项目）。`opts.cwd` = 所属项目路径；`opts.isCurrentProject` 缺省 = 当前项目。 */
function sessionItemNode(item, handlers, opts = {}) {
  const isCurrentProject = opts.isCurrentProject !== false
  const openMenuAt = (x, y) => handlers.onMenuOpen?.({ key: item.key, title: item.title, x, y })
  const activate = () => (isCurrentProject ? handlers.onSwitch?.(item.key) : handlers.onOpenProject?.(opts.cwd))
  return {
    tag: "div",
    props: {
      class: item.active === true ? "sidebar-item active" : "sidebar-item",
      role: "button",
      tabindex: "0",
      "data-action": "sidebar:switch",
      "data-key": item.key,
      title: item.title,
      onClick: activate,
      onKeydown: (event) => {
        if (event?.key === "Enter" || event?.key === " ") {
          event.preventDefault()
          activate()
        }
      },
      onContextMenu: (event) => {
        if (!isCurrentProject || typeof handlers.onMenuOpen !== "function") return
        event.preventDefault()
        openMenuAt(event.clientX, event.clientY)
      },
    },
    children: [
      { tag: "span", props: { class: "sidebar-item-title" }, children: [item.title] },
      item.badge
        ? { tag: "span", props: { class: "sidebar-item-badge" }, children: [item.badge] }
        : null,
      item.time
        ? { tag: "span", props: { class: "sidebar-item-time" }, children: [item.time] }
        : null,
      isCurrentProject && typeof handlers.onMenuOpen === "function"
        ? {
          tag: "button",
          props: {
            class: "sidebar-item-more",
            type: "button",
            "aria-label": t("sidebar.menu"),
            title: t("sidebar.menu"),
            onClick: (event) => {
              event.stopPropagation()
              const rect = event.currentTarget.getBoundingClientRect()
              openMenuAt(rect.right, rect.top)
            },
          },
          children: [],
        }
        : null,
    ],
  }
}

/** 项目组数据（**catalog 驱动** · 按项目新建时间降序——新的在前；catalog 未到 ⇒ 当前项目由 model.items 兜底合成）：
 *  每项目 { cwd, isCurrent, sessions: [{ slot, item(title 兜底链 ∕ badge), updatedAt }] }。 */
function projectsOf(model) {
  const cwd = model.project?.cwd ?? null
  const list = []
  const seen = new Set()
  const add = (cwdKey, isCurrent, sessions) => {
    if (typeof cwdKey !== "string" || cwdKey === "" || seen.has(cwdKey)) return
    seen.add(cwdKey)
    list.push({ cwd: cwdKey, isCurrent, sessions })
  }
  for (const project of model.catalogProjects) {
    add(
      project.cwd,
      project.isCurrent,
      project.sessions.map((s) => ({
        slot: s.slot,
        title: displayTitleOfSession(s),
        badge: null,
        updatedAt: s.updatedAt,
        isActive: s.isActive,
      })),
    )
  }
  if (cwd !== null && !seen.has(cwd)) {
    add(
      cwd,
      true,
      model.items.map((item) => ({ slot: item.key, title: item.title, badge: item.badge, updatedAt: item.ts ?? 0, isActive: item.active })),
    )
  }
  // 顺序（用户反馈 2026-10-05 三轮收敛 —— ZCode `SortableWorkspaceSidebar` 同义）：**手动拖拽序优先**
  // （`projectOrder` 在册 cwds 按册序）；未入册（新开）项目按首次启用时间排尾部——「新建时间」= 项目最早会话
  // 的 updatedAt（manifest 无 createdAt ⇒ 首次启用时点为最稳代理）；无册 ⇒ 全按首次启用时间降序。
  // 渲染期**零写册**（catalog 迟到的 partial list 不得清洗册子——清洗只发生在拖放时点）。
  // 会话在组内仍按最近活动降序。
  const startedAtOf = (project) => project.sessions.reduce(
    (min, s) => (Number.isFinite(s.updatedAt) && s.updatedAt > 0 && (min === 0 || s.updatedAt < min) ? s.updatedAt : min),
    0,
  )
  const rest = list
    .filter((project) => !projectOrder.includes(project.cwd))
    .sort((a, b) => {
      const ta = bornOf(projectBorn, PROJECT_BORN_KEY, a.cwd, startedAtOf(a)) // 冻结出生时间——项目活动零漂移
      const tb = bornOf(projectBorn, PROJECT_BORN_KEY, b.cwd, startedAtOf(b))
      if (ta !== tb) return tb - ta
      return a.cwd < b.cwd ? -1 : 1
    })
  const known = projectOrder
    .map((cwdKey) => list.find((project) => project.cwd === cwdKey))
    .filter((project) => project !== undefined)
  return [...known, ...rest]
}

/** 展开态（cwd 集合 · localStorage 持久 —— ZCode `expandedWorkspacePaths` 同义）：当前项目恒展开。 */

/** 项目行（ZCode 形：**文件夹图标 + 名称** 纯文本；点击 = 收起 ∕ 展开其下会话）。 */
/** 项目组折叠集合（cwd 键 · 模块态——不持久，重开应用回默认展开）：
 *  **不挂 project 对象**——projectsOf 每次重绘重建项目对象，挂其上随重绘即丢（真机实测失效根因）。 */
const collapsedProjects = new Set()

/** 手动排序册子（用户需求 2026-10-05 —— ZCode `SortableWorkspaceSidebar` 同义）：项目组顺序 = 用户拖拽决定 +
 *  localStorage 持久（键 `thincoder.projectOrder`——cwd 数组；读写皆捕获，写失败 fail-soft 本会话内照常生效）。
 *  未入册项目（新开）按首次启用时间排**尾部**（ZCode「新 tab 追加末尾」同律）；册子在拖放时点才清洗（渲染期零写——
 *  catalog 迟到时 partial list 不得污染册子）。 */
const PROJECT_ORDER_KEY = "thincoder.projectOrder"
let projectOrder = (() => {
  try {
    const raw = globalThis.localStorage?.getItem(PROJECT_ORDER_KEY)
    const parsed = raw === null || raw === undefined ? [] : JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter((cwd) => typeof cwd === "string" && cwd !== "") : []
  } catch { return [] }
})()
function persistProjectOrder() {
  try { globalThis.localStorage?.setItem(PROJECT_ORDER_KEY, JSON.stringify(projectOrder)) } catch { /* fail-soft */ }
}

/** 出生册（用户反馈 2026-10-05 —— 「置顶动作」根因修复）：此前项目序键 = 最早会话 updatedAt——该会话
 *  一被使用其 updatedAt 即变新 ⇒ 项目排序键跳前（= 项目置顶）；会话组内按 updatedAt 排——每发言即跳顶
 *  （= 会话置顶）。同病根 = 排序键随活动漂移。治法 = **首见播种 ∕ 永冻**：键（项目 cwd ∕ 会话 cwd::slot）
 *  第一次入册记当下时间，此后恒读册值——无论后续怎么用，序零漂移；真正新建（键首见）记 now ⇒ 新的在前只发生一次。
 *  两册写面 = 只增未见键（幂等）⇒ 渲染期写安全（partial list 无污染面——与 projectOrder 的整列重写不同）。
 *  播种回退值：项目 = 最早会话 updatedAt（存量最稳代理）；会话 = 当下 updatedAt；均无 ⇒ now。 */
function loadBornMap(key) {
  try {
    const raw = globalThis.localStorage?.getItem(key)
    const parsed = raw === null || raw === undefined ? {} : JSON.parse(raw)
    return parsed !== null && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {}
  } catch { return {} }
}
const PROJECT_BORN_KEY = "thincoder.projectBorn"
const SLOT_BORN_KEY = "thincoder.slotBorn"
let projectBorn = loadBornMap(PROJECT_BORN_KEY)
let slotBorn = loadBornMap(SLOT_BORN_KEY)
function persistBornMap(key, map) {
  try { globalThis.localStorage?.setItem(key, JSON.stringify(map)) } catch { /* fail-soft */ }
}
function bornOf(map, persistKey, id, fallbackMs) {
  const known = map[id]
  if (Number.isFinite(known) && known > 0) return known
  const born = Number.isFinite(fallbackMs) && fallbackMs > 0 ? fallbackMs : Date.now()
  map[id] = born
  persistBornMap(persistKey, map)
  return born
}

function projectRowNode(project) {
  const collapsed = collapsedProjects.has(project.cwd)
  return {
    tag: "button",
    props: {
      class: "sidebar-project-row" + (project.isCurrent ? " current" : ""),
      type: "button",
      "data-project": project.cwd,
      title: project.cwd,
      "aria-expanded": String(!collapsed),
      draggable: true, // 项目组拖拽排序（册子 = projectOrder——ZCode SortableWorkspaceSidebar 同义）
      onClick: () => {
        if (collapsedProjects.has(project.cwd)) collapsedProjects.delete(project.cwd)
        else collapsedProjects.add(project.cwd)
        paintSidebarFace() // 模块态不进 store —— 无订阅径，就地刷
      },
      onDragstart: (event) => {
        try { event?.dataTransfer?.setData("text/plain", project.cwd) } catch { /* 拖态容错 */ }
        if (event?.dataTransfer != null) event.dataTransfer.effectAllowed = "move"
        event?.currentTarget?.classList?.add("dragging")
      },
      onDragend: (event) => event?.currentTarget?.classList?.remove("dragging"),
      onDragover: (event) => {
        event.preventDefault() // 允许落点（仅项目行接拖——会话行 ∕ 余白零 preventDefault ⇒ 落无效）
        const rect = event.currentTarget.getBoundingClientRect()
        const above = event.clientY < rect.top + rect.height / 2
        event.currentTarget.classList.toggle("drag-over-above", above)
        event.currentTarget.classList.toggle("drag-over-below", !above)
      },
      onDragleave: (event) => event.currentTarget.classList.remove("drag-over-above", "drag-over-below"),
      onDrop: (event) => {
        event.preventDefault()
        event.currentTarget.classList.remove("drag-over-above", "drag-over-below")
        const fromCwd = typeof event?.dataTransfer?.getData === "function" ? event.dataTransfer.getData("text/plain") : ""
        const rect = event.currentTarget.getBoundingClientRect()
        const above = event.clientY < rect.top + rect.height / 2
        // 可见序 = 当下渲染序（DOM 直读——与 projectsOf 产出同源，零陈旧）；册子整列重写 + 持久 + 就地刷
        const rows = [...document.querySelectorAll('.sidebar-project-row[data-project]')]
          .map((el) => el.dataset.project)
          .filter((cwdKey) => typeof cwdKey === "string" && cwdKey !== "")
        const fromIdx = rows.indexOf(fromCwd)
        const toIdx = rows.indexOf(project.cwd)
        if (fromIdx === -1 || toIdx === -1 || fromCwd === project.cwd) return
        rows.splice(toIdx + (above ? 0 : 1), 0, rows.splice(fromIdx, 1)[0])
        projectOrder = rows
        persistProjectOrder()
        paintSidebarFace()
      },
    },
    children: [{ tag: "span", props: { class: "sidebar-item-title" }, children: [baseName(project.cwd)] }],
  }
}

/** 会话区树（滚动区全量内容 · 2026-10-05 重构 = **ZCode 项目组形**）：
 *  每项目 = 文件夹行 + 其会话列表（缩进 ∕ 行尾相对时间，降序）；点击项目行收起 ∕ 展开该组
 *  （`project.collapsed` 模块态——挂对象上随重绘保持）；搜索词 ⇒ 跨项目平铺匹配；无匹配 ⇒ 空态词。 */
function sessionsTree(model, handlers) {
  const filter = filterText.trim().toLowerCase()
  const matched = (text) => filter === "" || String(text ?? "").toLowerCase().includes(filter)
  const projects = projectsOf(model)
  const parts = [{ tag: "div", props: { class: "sidebar-section-head" }, children: [t("sidebar.projects")] }]
  if (projects.length === 0) {
    parts.push({
      tag: "div",
      props: { class: "sidebar-project-row empty", "data-project": "" },
      children: [{ tag: "span", props: { class: "sidebar-item-title" }, children: [t("rail.action.openDir")] }],
    })
    return parts
  }
  let any = false
  for (const project of projects) {
    const sessions = project.sessions
      .map((s) => ({ ...s, display: displayTitleOfSession(s), time: timeSpanOf(s.updatedAt) }))
      .filter((s) => matched(s.display) || matched(project.cwd))
      .map((s) => ({ ...s, born: bornOf(slotBorn, SLOT_BORN_KEY, `${project.cwd}::${s.slot}`, s.updatedAt) }))
      .sort((a, b) => b.born - a.born)
    if (filter !== "" && sessions.length === 0) continue
    any = true
    const collapsed = collapsedProjects.has(project.cwd)
    parts.push(projectRowNode(project, collapsed, sessions.length))
    if (collapsed) continue
    parts.push(...sessions.map((s) => sessionItemNode({ key: s.slot, title: s.display, badge: null, time: s.time }, handlers, { cwd: project.cwd, isCurrentProject: project.isCurrent })))
  }
  if (!any) parts.push({ tag: "div", props: { class: "sidebar-empty-filter" }, children: [t("sidebar.empty")] })
  return parts
}

/** 边栏树（品牌行 → 动作行 → 搜索框 → 滚动区〔项目 ∕ 会话分组 ∕ 最近〕→ 底行〔设置〕）。字形全住 CSS `content`。 */
function sidebarTree(model, handlers) {
  return {
    tag: "div",
    props: { class: "sidebar-body" },
    children: [
      { tag: "div", props: { class: "sidebar-head" }, children: [
        { tag: "button", props: { class: "sidebar-toggle", type: "button", "aria-label": t("sidebar.collapse"), title: t("sidebar.collapse"), "data-action": "sidebar:toggle", onClick: handlers.onToggle }, children: [] },
        { tag: "span", props: { class: "sidebar-brand" }, children: ["ThinCoder"] },
      ] },
      { tag: "div", props: { class: "sidebar-actions" }, children: [
        // 打开项目（用户 2026-10-05——「打开文件夹新建项目 = 重点功能」：升级为与新聊天同款文字胶囊钮，居前；
        // 原 ⌂ 图标钮吸收退场——出口同链 onOpenProject = openDir 装配单源）。
        { tag: "button", props: { class: "sidebar-new sidebar-open", type: "button", "data-action": "sidebar:openDir", "aria-label": t("rail.action.openDir"), title: t("rail.action.openDir"), onClick: () => handlers.onOpenProject?.() }, children: [
          { tag: "span", props: { class: "sidebar-new-label" }, children: [t("rail.action.openDir")] },
        ] },
        { tag: "button", props: { class: "sidebar-new", type: "button", "data-action": "sidebar:new", "aria-label": t("sidebar.newChat"), title: t("sidebar.newChat"), onClick: handlers.onNew }, children: [
          { tag: "span", props: { class: "sidebar-new-label" }, children: [t("sidebar.newChat")] },
        ] },
      ] },
      { tag: "div", props: { class: "sidebar-search" }, children: [
        { tag: "input", props: {
          class: "sidebar-search-input", type: "search",
          placeholder: t("sidebar.search"), "aria-label": t("sidebar.search"),
          value: filterText,
          onInput: (event) => {
            filterText = String(event?.target?.value ?? "")
            paintSidebarFace()
            const input = document.querySelector(".sidebar-search-input")
            input?.focus()
            input?.setSelectionRange(filterText.length, filterText.length)
          },
        }, children: [] },
      ] },
      { tag: "div", props: { class: "sidebar-scroll" }, children: sessionsTree(model, handlers) },
      { tag: "div", props: { class: "sidebar-foot" }, children: [
        { tag: "button", props: { class: "sidebar-settings", type: "button", "data-action": "sidebar:settings", "aria-label": t("settings.title"), title: t("settings.title"), onClick: handlers.onOpenSettings }, children: [
          { tag: "span", props: { class: "sidebar-settings-label" }, children: [t("settings.title")] },
        ] },
      ] },
    ],
  }
}

/** 整树重挂（纯读现态 —— 容器缺位 ⇒ 空转；树小 ⇒ 零键控差分）。前向引用（搜索框 onInput 消费）。 */
let paintSidebarFace = () => {}

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
  paintSidebarFace = paint
  const detach = store.subscribe((state, changedKeys) => {
    if (Array.isArray(changedKeys) && !changedKeys.some((key) => SIDEBAR_KEYS.includes(key))) return
    paint()
  })
  paint()
  return { paintSidebar: paint, detach }
}
