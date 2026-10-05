/**
 * theme.mjs — 主题三态面（D33 · 2026-09-30 · 台账 #743）：**chrome 级状态直写**（渲染面 ∥ 零 IPC ∥ 零 `events` 依赖；
 * 机制单源 = `docs/desktop/design/PROJECT.md` §2 KD-61 ∥ `docs/desktop/design/RENDERER.md` §1.4 ∥ `docs/desktop/design/UI.md` §1 本批注）。
 * 状态载体 = `documentElement` 的 `data-theme`（闭集 `system` ∥ `light` ∥ `dark`——缺省 ∥ 存储缺 ∥ 表外值 ⇒ `system`）；
 * 单写者 = 本档（`initTheme` 装配期一次 ∥ `setTheme` 出口径 —— `data-theme` 写径全仓仅此一处；同步直写不经帧）；
 * 「跟随系统」= 状态值一枚（非零态 —— 值面随系统解析，深浅翻转零 JS）。
 * 持久化 = 渲染面 `localStorage`（键 `thincoder.desktop.theme`——三值闭集串；端自有 UI 态类，先例 = `poolWidth`）：
 * 读 = 装配期一次（先于首绘可及面）∥ 写 = 每次点按即刻；读 ∥ 写皆捕获 + `console.error`（零静默）——
 * 读失败 ∥ 存储缺 ∥ 表外值 ⇒ `system`（降级，零写回）；写失败 ⇒ 本次会话内照常生效（fail-soft）。
 * 注入缝 `{ doc, storage }`（缺省 = `document` / `localStorage`）⇒ 平 node 直测；零 `store` ∥ 零 `events` 依赖；
 * 零 `node:` / 零裸包（渲染面静态闭包判据）。
 */

/** 存储键（KD-61 ④ · 三值闭集串）。 */
const KEY = "thincoder.desktop.theme"

/** 三态闭集（**序 = 控件序单源**：跟随系统 ∥ 亮色 ∥ 暗色 —— 缺省态居首；表外值 ⇒ `system`）。 */
export const THEMES = Object.freeze(["system", "light", "dark"])

/** 缺省存储（浏览器 `localStorage`；桌面 `app://` standard+secure ⇒ Web Storage 持久）。
 *  取面缺位 ∥ 访问抛 ⇒ `null`（视同无存储 —— fail-soft，零外写）。 */
function defaultStorage() {
  try {
    return globalThis.localStorage ?? null
  } catch (error) {
    console.error("[theme] localStorage unavailable:", error)
    return null
  }
}

/** 值归一（纯函数）：闭集内 ⇒ 原值；其余（缺 ∥ 非串 ∥ 表外）⇒ `system`。 */
function normalize(raw) {
  return THEMES.includes(raw) ? raw : "system"
}

/** 读存储（捕获 + 零静默）：缺 storage / 读抛 ⇒ `null`（降级 `system`）；表外值 ⇒ `null` + 记错（零静默，零写回）。 */
function readStored(storage) {
  if (!storage || typeof storage.getItem !== "function") return null
  try {
    const raw = storage.getItem(KEY)
    if (raw === null || raw === undefined) return null
    if (!THEMES.includes(raw)) {
      console.error(`[theme] stored value out of range: ${String(raw)}`)
      return null
    }
    return raw
  } catch (error) {
    console.error("[theme] theme read failed:", error)
    return null
  }
}

/** 写存储（捕获 + 零静默 —— fail-soft：写失败仅记错，本次会话内照常生效）。 */
function writeStored(storage, value) {
  if (!storage || typeof storage.setItem !== "function") return
  try {
    storage.setItem(KEY, value)
  } catch (error) {
    console.error("[theme] theme write failed:", error)
  }
}

/** 状态应用（**唯一写径**）：`documentElement` 的 `data-theme` 落地 —— 同步直写（不经帧）。 */
function applyTheme(doc, value) {
  doc.documentElement.dataset.theme = value
}

/** 装配入口（`renderer/app.mjs` 装配期一次）：读存储 ⇒ 归一 ⇒ 写 `data-theme` ⇒ 返落地值（先于首绘可及面）。
 *  读失败 ∥ 存储缺 ∥ 表外值 ⇒ `system`（降级）；**零写回**（未切过 ⇒ 存储零动）。 */
export function initTheme({ doc = globalThis.document, storage = defaultStorage() } = {}) {
  const value = normalize(readStored(storage))
  applyTheme(doc, value)
  return value
}

/** 出口（设置面三态钮 ⇒ 本径）：三值闭集校验 ⇒ 应用 + 落存储 ⇒ 返落地值；表外值 ⇒ `null` + 记错（零写零改）。 */
export function setTheme(value, { doc = globalThis.document, storage = defaultStorage() } = {}) {
  if (!THEMES.includes(value)) {
    console.error(`[theme] setTheme refused out-of-range value: ${String(value)}`)
    return null
  }
  applyTheme(doc, value)
  writeStored(storage, value)
  return value
}

/* ─── 主题色（accent · 2026-10-05 —— 浅 ∕ 深主题的**下级配色**）：预设闭集 ∕ 状态载体 =
 *  `documentElement` 的 `data-accent`（缺省 "blue" —— theme.css `--accent` 即蓝，零覆写）；
 *  单写者 = 本档（`initAccent` 装配期一次 ∕ `setAccent` 出口）；持久化 = `localStorage`
 *  （键 `thincoder.accent`——沿 theme 键同族）；读 ∥ 写皆捕获 + console.error（零静默）。
 *  预设色值（浅 ∕ 深两枚 —— 每预设一对 `light-dark()` 覆写住 codex.css；消费面 = `var(--accent)` 全域联动）。 */
export const ACCENTS = Object.freeze([
  { id: "blue", light: "#2f6feb", dark: "#5b8def" },
  { id: "teal", light: "#0e8a80", dark: "#3ec1b3" },
  { id: "violet", light: "#6e56cf", dark: "#a48bfa" },
  { id: "green", light: "#17855c", dark: "#3dd68c" },
  { id: "orange", light: "#c96a08", dark: "#f0a35c" },
  { id: "rose", light: "#cf3d9c", dark: "#ef85c7" },
])

const ACCENT_KEY = "thincoder.accent"

/** 自定义 hex 闭集（#rgb ∕ #rrggbb —— 与 setCustomAccent 同判）。 */
const HEX_RE = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i

function accentNormalize(raw) {
  return ACCENTS.some((a) => a.id === raw) ? raw : "blue"
}

function accentReadStored(storage) {
  if (!storage || typeof storage.getItem !== "function") return null
  try {
    const raw = storage.getItem(ACCENT_KEY)
    if (raw === null || raw === undefined) return null
    if (!ACCENTS.some((a) => a.id === raw) && !HEX_RE.test(raw)) {
      console.error(`[theme] accent stored value out of range: ${String(raw)}`)
      return null
    }
    return raw
  } catch (error) {
    console.error("[theme] accent read failed:", error)
    return null
  }
}

function accentWriteStored(storage, value) {
  if (!storage || typeof storage.setItem !== "function") return
  try {
    storage.setItem(ACCENT_KEY, value)
  } catch (error) {
    console.error("[theme] accent write failed:", error)
  }
}

function applyAccent(doc, value) {
  doc.documentElement.dataset.accent = value
}

/** 自定义色应用（inline `--accent` —— 特异性高于一切规则，预设切换时须清除）。 */
function applyAccentCustom(doc, hex) {
  doc.documentElement.dataset.accent = "custom"
  doc.documentElement.style.setProperty("--accent", hex)
}

/** 当前落地值（设置面板读面——store 切片缺位兜底）。 */
export function currentAccent() {
  try {
    if (globalThis.document?.documentElement?.dataset?.accent === "custom") {
      const inline = String(globalThis.document.documentElement.style.getPropertyValue("--accent") ?? "").trim()
      return HEX_RE.test(inline) ? inline : "blue"
    }
    return accentNormalize(globalThis.document?.documentElement?.dataset?.accent)
  } catch {
    return "blue"
  }
}

/** 装配入口（`renderer/app.mjs` 装配期一次，先于首绘可及面）：读存储 ⇒ 归一 ⇒ 写 `data-accent` ⇒ 返落地值。 */
export function initAccent({ doc = globalThis.document, storage = defaultStorage() } = {}) {
  const stored = accentReadStored(storage)
  if (stored !== null && stored.startsWith("#")) {
    applyAccentCustom(doc, stored) // 自定义 hex（`setCustomAccent` 落盘形态）回放
    return stored
  }
  const value = accentNormalize(stored)
  applyAccent(doc, value)
  return value
}

/** 出口（设置面色板 ⇒ 本径）：闭集校验 ⇒ 应用 + 落存储 ⇒ 返落地值；表外值 ⇒ `null` + 记错（零写零改）。 */
/** 自定义色出口（取色器 ⇒ 本径）：hex 闭集（#rgb ∕ #rrggbb）校验 ⇒ inline `--accent` 应用 + 落存储
 *  （`data-accent = "custom"` 标记态）；表外值 ⇒ `null` + 记错。深浅两主题同色（v1——不做双值自定义）。 */
export function setCustomAccent(hex, { doc = globalThis.document, storage = defaultStorage() } = {}) {
  const value = String(hex ?? "").trim()
  if (!/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value)) {
    console.error(`[theme] setCustomAccent refused invalid hex: ${value}`)
    return null
  }
  applyAccentCustom(doc, value)
  accentWriteStored(storage, value)
  return value
}

export function setAccent(value, { doc = globalThis.document, storage = defaultStorage() } = {}) {
  if (!ACCENTS.some((a) => a.id === value)) {
    console.error(`[theme] setAccent refused out-of-range value: ${String(value)}`)
    return null
  }
  doc.documentElement.style.removeProperty("--accent") // 清自定义残留（inline 恒胜预设覆写）
  applyAccent(doc, value)
  accentWriteStored(storage, value)
  return value
}
