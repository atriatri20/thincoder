/**
 * window.mjs — 窗口装配（单窗 · 隔离三件套）+ 原生菜单 + 系统主题 + 冒烟读回（判据②③读数面）
 * + 窗口自身导航钩点（#389③：`will-navigate` ⇒ 外部 URL 拒——判据单源 `protocol.mjs` `isAppNavigation`）
 * + 会话维护动作宿主面（R1 · 桌面功能对位批：菜单「Maintenance」两项 + 确认 ∕ 结果两枚原生对话框——
 * 处理体（核数据面）住 `session-maintenance.mjs`，本档只做 electron 落子；**词面出档 `menu-words.mjs`**
 * ——#533：`menuLabels(locale)` 消费——zh = 语义直译值（#533 裁定）；en 表 = 回归基线现值）
 * + 右键编辑菜单落子（复制面对齐批 · D27 ∕ KD-43：`webContents.on("context-menu")` ⇒ 按 `params` 构模板 ⇒
 * `Menu.popup`；条目集 ∕ 空选零菜单 ∕ 文案四键 = `context-menu.mjs` 两纯函数 + `loadConfig().locale` 现读）。
 * + 更新面宿主落子（桌面发布·阶段二批 · KD-71 ∥ `docs/desktop/design/PACKAGING.md` §2.8.1：`onNative("update")` ⇒
 * 策略面 `update.mjs`（`setUpdateFace` 转口注入 —— 沿 `setMenuTheme` 先例）；更新对话框族（确认 ∥ 结果两态）；
 * 帮助组项 label 读面 = `updateFace.currentState()`——本档只做 electron 落子）。
 * 主题 = 渲染面 `data-theme` 状态消费（D33 · 台账 #743——用户值覆写系统缺省，单写者 `renderer/theme.mjs`）；`resolveTheme()` 只作画布色 ∥ 原生面系统事实对照（批档 §2.6 D-8）。
 * 探针用 `net.fetch`（官方档 `net`：「differs from Node's fetch(), which uses Node.js's HTTP stack」+
 * 「requests made with net.fetch can be made to custom protocols」）——Node 全局 `fetch` 对自定义 scheme 无保证。
 */
import { resolve } from "node:path"
import { BrowserWindow, Menu, app, dialog, nativeTheme, net, shell } from "electron"
import { loadConfig } from "@thincoder/core/config.mjs"
import { HOST, SCHEME, isAppNavigation, protocolStats } from "./protocol.mjs"
// 右键编辑菜单（复制面对齐批 · D27 ∕ KD-43）：模板两纯函数出档 `context-menu.mjs` —— 本档只做宿主面落子。
import { contextMenuLabels, contextMenuTemplate } from "./context-menu.mjs"
// 会话维护线（R1 · 桌面功能对位批）：两枚处理体出档（本档只做宿主面 —— 确认 ∕ 结果两枚原生对话框）；
// 维护面词表出档 `menu-words.mjs`（#533 —— 词表单源；本档只做词面消费落子）。
import { gcSummaryText, indexSummaryText, runSessionGcMaintenance, runSessionIndexMaintenance } from "./session-maintenance.mjs"
import { menuLabels, settingsSectionLabels } from "./menu-words.mjs"
// 菜单结构出档（D36 · 菜单体系批）：模板纯函数 `menuTemplate` + 主题三值 `THEME_VALUES`（报告校验面共用 × 零第二份）。
import { THEME_VALUES, menuTemplate } from "./app-menu.mjs"
// 最近项目读取（构建时读 —— 数据面只读复用 `recentDirs`，零改；D36 重建点五处）。
import { recentDirs } from "./projects.mjs"

/** 预载绝对路径（隔离面唯一入口；`ipc.mjs` 亦引本常量读取白名单）。 */
export const PRELOAD_PATH = resolve(import.meta.dirname, "../preload/preload.cjs")

/** 窗口尺寸（实施选择——设计档未定形：五档与批档 §2.4 窗口面均未定尺寸，随修正轮落锚）：1200×800 · 下限 800×600。 */
const WINDOW = Object.freeze({ WIDTH: 1200, HEIGHT: 800, MIN_WIDTH: 800, MIN_HEIGHT: 600 })

/** 画布色镜像（非通道面）：与 `theme.css` 主题变量（`--bg` 两态）同值，防首帧白闪；单源在 `theme.css` ⇒ 改色须两处同步（待修正轮定形）。 */
const THEME_COLORS = Object.freeze({ dark: "#15171c", light: "#f7f8fa" })



/** 菜单勾选态回读缓存（D36 —— `theme:state` 到达置位；报告未达窗 ⇒ `null` ⇒ 主题▸全零勾，fail-open 零误勾）。 */
let menuTheme = null
/** 当前窗口（菜单重建面持有 —— `createWindow` 登记；`refreshMenu` 经其幂等重建）。 */
let activeWin = null
/** 更新面句柄（桌面发布·阶段二批 · KD-71——`setUpdateFace` 转口登记；菜单 label 读面 + `onNative("update")` 落子）。 */
let updateFace = null

/** 探针（批档 §2.11 收正⑧ 5 枚 + R1 双根 3 枚 + R9 门①正读数 1 枚）：正 3 + 负 6；各负探针命中的门见 stderr 归属行。 */
const PROBES = Object.freeze([
  { id: "html", path: "index.html", expect: 200, mime: "text/html" },
  // R9 改锚：单源 `styles.css` 随会话模型轮 R13 四拆退场 ⇒ 正探针落现盘主题档（`.css` MIME 路径读数不变）
  { id: "css", path: "theme.css", expect: 200, mime: "text/css" },
  { id: "rcMd", path: "rc/md.mjs", expect: 200, mime: "text/javascript" }, // R1 双根：`/rc/` 实供给（核包 md.mjs）
  { id: "escape", path: "../package.json", expect: 404 },
  { id: "escapePct", path: "%2e%2e/package.json", expect: 404 },
  { id: "ext", path: "probe.json", expect: 404 },
  // R1 双根：逃逸负探针（`%2F` 解码 ⇒ `..` 真逃出 `/rc/` 根；判据 = 404 + `blocked++`，门①归属见 stderr）。判别力注（两态）：
  // dev-link 态（smoke 态）落点 = 源树 `thincoder-core/i18n.mjs` 在盘 ⇒ 破门即 200；物化态落点退化为缺失 ⇒ 该态由 `blocked` 计数双证兜底。
  { id: "rcEscape", path: "rc/..%2Fthincoder-core%2Fi18n.mjs", expect: 404 },
  // R1 双根：逃逸门“两向”补齐——渲染面根同理（逃向主进程源码；门①的运行期覆盖）
  { id: "escapeSrc", path: "..%2Fsrc%2Fmain%2Fprotocol.mjs", expect: 404 },
  // R9 · #389①：门①**正读数**探针（「白名单扩展名 + 逃逸路径」形态——设计记 `../styles.css` 形态，按届盘重勘：
  // 落点 = 现盘渲染面样式档）。`%2F` 编码逃出 `/rc/` 根；`.css` ⇒ 门②不拦 ⇒ 归属行 = 门①（stderr 读数差分）；
  // 两门（门① ∕ ①′）皆破 ⇒ 直落 200 `text/css`（判别力在盘）。
  { id: "escapeCss", path: "rc/..%2Fthincoder-desktop%2Frenderer%2Fcore.css", expect: 404 },
])

/** 负探针枚数（**派生自探针表**——#471⑥：`main.mjs` 的 `blocked` 阈值不再手抄）；`blocked` 计数与逐探针读数双证。 */
export const NEGATIVE_PROBE_COUNT = PROBES.filter((probe) => probe.expect === 404).length

/** 引导位读回表达式（主进程侧读法 = `executeJavaScript`；值域 `ok | error | none`）。 */
const BOOT_READBACK = "document.documentElement.dataset.boot ?? \"none\""
const BOOT_WAIT_MS = 5000
const BOOT_POLL_MS = 50

/** 系统主题（系统事实唯一持有者 = `nativeTheme`；渲染面主题三态自持其面（D33——用户值覆写系统缺省），本函数只供画布色 ∥ 原生面系统事实——零通道）。 */
export function resolveTheme() {
  return nativeTheme.shouldUseDarkColors ? "dark" : "light"
}

/** 原生菜单（D36 · 菜单体系批 ∥ 设置菜单升级批 · #817 —— 决策单源 = `docs/desktop/design/PROJECT.md` §2 **KD-65**
 *  ∥ **KD-67**）：五组双语（文件 ∥ 编辑 ∥ 视图 ∥ **设置** ∥ 帮助）—— 模板纯函数 = `app-menu.mjs`（`menuTemplate`
 *  —— 零 electron ⇒ 平 node 直测）；词面单源 = `menu-words.mjs` `menuLabels`（`locale` 现读 `loadConfig()`；读失败
 *  ⇒ 回落 en + 记错，零静默 —— 沿右键菜单 locale 现读同形）；编辑四值经 `contextMenuLabels(locale)`（两菜单同词面
 *  —— 零第二份）；设置六组段名经 `settingsSectionLabels(locale)`（HOST_DICT `settings.section.*` 投影注入 —— 零第二份）。
 *  动作面两缝：`onAction` = **六动作**通道闭集（+`openSettings` —— `sendMenuAction` ⇒ `ev:menu` 下行；旧「零 IPC
 *  依赖项」口径随 D36 退场）；`onNative` = 宿主自办四项（维护两项 ⇒ `runMaintenance` —— 与 `session:gc` ∥
 *  `session:index` 两通道同处理体；关于 ⇒ 原生面板；**更新 ⇒ `updateFace.menuClick()`**——桌面发布·阶段二批）；
 *  勾选态 = `menuTheme` 回读缓存（报告未达 ⇒ 全零勾 —— fail-open 零误勾）；更新项 label 读 `updateFace` 状态（缺 ⇒ 回 idle）。 */
function buildMenu() {
  let words
  let edit
  let sections
  try {
    const locale = loadConfig()?.locale
    words = menuLabels(locale)
    edit = contextMenuLabels(locale)
    sections = settingsSectionLabels(locale)
  } catch (error) {
    console.error("[window] menu locale readback failed:", error)
    words = menuLabels("en")
    edit = contextMenuLabels("en")
    sections = settingsSectionLabels("en")
  }
  return Menu.buildFromTemplate(menuTemplate({
    words, edit, sections, recent: recentDirs(), theme: menuTheme,
    update: updateFace === null ? null : { state: updateFace.currentState() }, // 更新面状态 ⇒ label ∥ enabled（KD-71）
    onAction: sendMenuAction, onNative: runNativeAction,
  }))
}

/** 菜单重建（幂等 —— 六重建点同引：① 启动建窗 ∥ ② `project:open` 成功径（`ipc.mjs`）∥ ③ 语言写径
 *  （`config:write` 成功径 —— `ipc-relays.mjs`）∥ ④ 主题态报告径（`setMenuTheme`）∥ ⑤ 窗口 `focus`
 *  ∥ ⑥ 更新面状态迁移（桌面发布·阶段二批——`update.mjs` `menuRefresh()` 注入 ⇒ 本函数））。
 *  窗口缺 ∕ 已毁 ⇒ 零动作（fail-open）。 */
export function refreshMenu() {
  if (activeWin === null || activeWin.isDestroyed()) return
  // 统一 Header（fork 2026-10-06）：菜单转应用级 + 窗口菜单栏**隐藏**（HTML Header 取代可见条）。
  // ⚠ 加速键宿主（2026-10-12 修 —— 原实现用 `activeWin.setMenu(null)` 摘条，注释误记「加速键恒活」）：
  // Windows/Linux 上应用菜单**就是窗口菜单**，`setMenu(null)` 把窗口菜单整只摘掉 ⇒ 全部菜单加速键
  // （Ctrl+N ∕ Ctrl+O ∕ Ctrl+R ∕ 缩放 ∕ 全屏等）随之失效——真机实测：真实按键 Ctrl+N 不建会话、
  // Ctrl+R 不重载（页面标记存活），而渲染端自绑的 Ctrl+F 照常 ⇒ 判别式确证。
  // 正解 = **保留菜单、只藏条**：`setMenuBarVisibility(false)`（且不开 `autoHideMenuBar`——否则按 Alt
  // 会弹出原生条压住 HTML Header）；加速键随菜单在位而恒活（六重建点各重设一次，幂等）。
  Menu.setApplicationMenu(buildMenu())
  activeWin.setMenuBarVisibility(false)
}

/** Header 菜单弹出（`menu:popup` 处理体 —— fork 2026-10-06）：`name` = 五顶层项 id 尾段
 *  （file ∕ edit ∕ view ∕ settings ∕ help）；`(x, y)` = 触发钮**内容坐标**（client → menu.popup 窗口相对）。
 *  现建现弹（recent ∕ 主题勾 ∕ 更新态 = 每次现读——`refreshMenu` 同源模板）；表外 name ∕ 项缺 ⇒ 零弹。 */
export function popupAppMenu(name, x, y) {
  if (activeWin === null || activeWin.isDestroyed()) return { ok: false, reason: "no-window" }
  const menu = buildMenu()
  const item = menu.getMenuItemById(`app-menu-${String(name ?? "")}`)
  if (item?.submenu === undefined) return { ok: false, reason: "unknown-menu" }
  const pos = Number.isFinite(x) && Number.isFinite(y) ? { x: Math.round(x), y: Math.round(y) } : {}
  item.submenu.popup({ window: activeWin, ...pos })
  return { ok: true, reason: null }
}

/** 勾选态回读收面（`theme:state` 处理体转口 —— 渲染→主单向；D36 ∥ KD-65 ②）：三值闭集校验（`THEME_VALUES`
 *  单源）⇒ 缓存 + 重建；表外值 ⇒ 零变更 + 记错 + `{ ok:false, reason:"invalid-theme" }`（防御档 —— 零静默）。 */
export function setMenuTheme(theme) {
  if (!THEME_VALUES.includes(theme)) {
    console.error(`[window] theme:state refused out-of-range theme: ${String(theme)}`)
    return { ok: false, reason: "invalid-theme" }
  }
  menuTheme = theme
  refreshMenu()
  return { ok: true }
}

/** 窗口控制出口（统一 Header 自绘三钮 · fork 2026-10-06 —— `window:control` 处理体）：
 *  闭集 `minimize` ∕ `maximize`（toggle—— maximize ∕ unmaximize 按现态）∕ `close`；终态经
 *  `ev:win-max` 推送（渲染面切图标 ❐∕▣——toggle 后系统事件异步，UI 态以推送为准）。 */
export function winControl(action, ctx = {}) {
  // 目标窗路由（会话窗批 · 2026-10-13）：窗口族动作作用于**发起窗**——会话窗的 ─ ❐ ✕ 曾恒落主窗
  // （原实现 = `activeWin.close()` ⇒ 会话窗点 ✕ 关掉主窗——用户实测）；主窗发起 = `activeWin`
  // （既有语义零变）。`senderWindow` 已毁 ∕ 缺 ⇒ 回落 `activeWin`（fail-open 沿既有口径）。
  const candidate = ctx?.senderWindow ?? null
  const win = candidate !== null && !candidate.isDestroyed() ? candidate : activeWin
  if (win === null || win === undefined || win.isDestroyed()) return { ok: false, reason: "no-window" }
  if (action === "minimize") win.minimize()
  else if (action === "maximize") win.isMaximized() ? win.unmaximize() : win.maximize()
  else if (action === "close") win.close()
  else if (action === "pin") {
    // 窗口置顶（用户对照 WorkBuddy 图钉）：toggle `alwaysOnTop`；回执携态（渲染面切钮亮）。
    const next = !win.isAlwaysOnTop()
    win.setAlwaysOnTop(next)
    return { ok: true, reason: null, pinned: next }
  }
  else return { ok: false, reason: "unknown-action" }
  return { ok: true, reason: null }
}

/** 最大化态推送（建窗 ∕ `ev:win-max` 源——渲染面图标随态）：幂等两事件各挂一次。 */
function bindWindowStatePush(win) {
  const push = () => { if (!win.isDestroyed()) win.webContents.send("ev:win-max", win.isMaximized()) }
  win.on("maximize", push)
  win.on("unmaximize", push)
}

/** 更新面转口（桌面发布·阶段二批 · KD-71——`main.mjs` 装配登记，沿 `setMenuTheme` 先例）：句柄两出口校验
 *  （`currentState` ∥ `menuClick`）⇒ 登记 + 重建；表外 ⇒ 记错 + `{ ok:false, reason:"invalid-face" }`（零静默）。 */
export function setUpdateFace(face) {
  if (face === null || typeof face?.currentState !== "function" || typeof face?.menuClick !== "function") {
    console.error(`[window] update face refused: ${String(face)}`)
    return { ok: false, reason: "invalid-face" }
  }
  updateFace = face
  refreshMenu()
  return { ok: true }
}

/** 命令下行（`ev:menu` 主→渲染单向）：载荷 `{ action, path?, value? }`（`path` 仅最近项 ⇒ `openProject` 携；
 *  `value` 携主二（`theme` 三值 ∥ `openSettings` 组名六值——缺 ⇒ 开设置面）；不携 `key` —— 非会话面）；
 *  `isDestroyed` 守卫（已毁 ⇒ 零发送）。 */
function sendMenuAction(action, path, value) {
  if (activeWin === null || activeWin.isDestroyed()) return
  const payload = { action }
  if (typeof path === "string" && path !== "") payload.path = path
  if (typeof value === "string" && value !== "") payload.value = value
  activeWin.webContents.send("ev:menu", payload)
}

/** 宿主自办项（`onNative` 缝 —— 不经通道）：维护两项 ⇒ 既有 `runMaintenance`；关于 ⇒ 原生面板；更新 ⇒ 更新面
 *  `menuClick()`（桌面发布·阶段二批——句柄内部不抛，fail-soft）；表外 ⇒ 记错零动作。 */
function runNativeAction(action) {
  if (action === "gc" || action === "index") {
    void runMaintenance(action)
    return
  }
  if (action === "about") {
    app.showAboutPanel()
    return
  }
  if (action === "update") {
    if (updateFace === null) {
      console.error("[window] native menu action refused: update face not registered")
      return
    }
    void updateFace.menuClick()
    return
  }
  console.error(`[window] native menu action refused: ${String(action)}`)
}

/** 回收确认（**原生模态** —— 菜单与 `session:gc` 通道同源）：默认 ∕ 取消键 = 「Cancel」⇒ 驳回 ∕ Esc ⇒
 *  `false`（**零删除** —— 核删除面一步不进；先例 VSC `showWarningMessage(..., { modal: true }, "Delete")`）。 */
export async function confirmRecycle({ count } = {}) {
  const { response } = await dialog.showMessageBox({
    type: "warning", buttons: ["Recycle", "Cancel"], defaultId: 1, cancelId: 1,
    message: `ThinCoder: recycle session data for ${count} cold project(s)?`,
    detail: "The files are moved to the sessions-trash recycle bin (recoverable for 7 days).",
  })
  return response === 0
}

/** 更新对话框族（桌面发布·阶段二批 · KD-71 ∥ §2.8.1——策略面经 `dialog` 注入缝调用；本档只做 electron 落子）：
 *  ① 确认框（`ready` 态菜单点按径——句面值源 = `menu-words.mjs`，装配面注入）：默认 ∥ 取消键 = 「取消」⇒ 驳回 ∥
 *  Esc ⇒ `false`（**零安装动作**——沿 `confirmRecycle` 同形）；
 *  ② 结果框两态（`kind` = `up-to-date` ⇒ info ∥ `failed` ⇒ error + 一行原因 `detail`；手动检查三果之二）。 */
export async function updateConfirmDialog({ title, message, ok, cancel } = {}) {
  const { response } = await dialog.showMessageBox({
    type: "question", title, message, buttons: [ok ?? "OK", cancel ?? "Cancel"], defaultId: 1, cancelId: 1,
  })
  return response === 0
}

export async function updateResultDialog({ kind, title, message, detail } = {}) {
  await dialog.showMessageBox({
    type: kind === "failed" ? "error" : "info", title, message,
    ...(typeof detail === "string" && detail !== "" ? { detail } : {}),
    buttons: ["OK"],
  })
}

/** 菜单维护出口（R1 · 会话维护线）：处理体（核数据面）住 `session-maintenance.mjs`（零 electron）——
 *  本档只做宿主面两枚对话框（确认 + 结果）；结果句单源 = 同档两枚 formatter。
 *  **结果面三径同 VSC 先例**（VSC `runSessionGcCommand`）：无候选 ⇒ 一句「nothing to clean」；
 *  真回收 ⇒ 汇总句；**用户驳回 ⇒ 零弹框**（沿先例驳回径静默返回同形——回执面（`session:gc` 通道）不受影响）。
 *  异常 ⇒ stderr 一行（不吞、不假成功 —— 菜单回调无 invoke 拒绝面兜底）。 */
async function runMaintenance(action) {
  try {
    const summary = action === "gc"
      ? await runSessionGcMaintenance({ confirm: confirmRecycle })
      : await runSessionIndexMaintenance()
    if (action === "gc" && summary.confirmed === false && summary.candidates > 0) return // 驳回径：静默（VSC 同形）
    await dialog.showMessageBox({
      type: summary.ok === false ? "error" : "info", buttons: ["OK"],
      message: action === "gc" ? gcSummaryText(summary) : indexSummaryText(summary),
    })
  } catch (error) {
    console.error(`[window] session maintenance (${action}) failed:`, error)
  }
}

/** 单窗装配：隔离三件套 + 预载绝对路径；加载 `app://` 首页（供给与防护 = protocol.mjs）。 */
export function createWindow(onError) {
  const win = new BrowserWindow({
    width: WINDOW.WIDTH, height: WINDOW.HEIGHT, minWidth: WINDOW.MIN_WIDTH, minHeight: WINDOW.MIN_HEIGHT,
    backgroundColor: THEME_COLORS[resolveTheme()],
    // 统一 Header（fork 2026-10-06）：原生标题栏隐藏（HTML 层单行 Header 承担品牌 ∕ 菜单 ∕ 拖拽）。
    // 窗口控制钮 = **HTML 自绘**（用户反馈「没和 Header 集成在一起」——系统 overlay 独立绘制层，
    // 遮 Header 分隔线 ∕ hover 系统样式不可控；自绘 = 边框 ∕ hover ∕ 主题全归 CSS）⇒ 零 overlay。
    titleBarStyle: process.platform === "darwin" ? "hiddenInset" : "hidden",
    show: false,
    // #787 后台不节流：窗口后台（遮挡/隐藏）期照常出帧与交换——消「停摆—复显」相变（RENDERER.md §1.5）。
    webPreferences: { contextIsolation: true, sandbox: true, nodeIntegration: false, preload: PRELOAD_PATH,
      backgroundThrottling: false },
  })
  // D31 窗口重启最大化（#745·台账）：隐建（show:false）⇒ 先 maximize 后 show——maximize 官方语义「顺带 show 不聚焦」
  // ⇒ 首帧即最大化态（防默认尺寸可见闪帧）；show 补聚焦。「永远」语义 = 每次启动恒最大化：零窗口态读写（无记忆）。
  win.maximize()
  win.show()
  activeWin = win // 菜单重建面持有（D36）——启动建窗 = 重建点①（`refreshMenu` 幂等）
  bindWindowStatePush(win) // 自绘三钮图标随态（`ev:win-max`）
  // 关于面（D36 ∥ KD-65 ⑥ —— 建窗时一次）：应用名 ∥ 版本（`app.getVersion()` 动态）∥ 版权行（源 = D32 签名主体）。
  app.setAboutPanelOptions({ applicationName: "ThinCoder", applicationVersion: app.getVersion(), copyright: "© 2026 Shanghai Xinbo Technology Co., Ltd." })
  refreshMenu()
  /** 右键编辑菜单（复制面对齐批 · D27 ∕ KD-43）：Electron 无默认右键菜单 ⇒ 本档按 `context-menu` 事件落子；
   *  条目集（可编辑四件 ∕ 选中两件 ∕ 空选零菜单）与文案四键 = `context-menu.mjs` 两纯函数；`locale` 右键时刻
   *  现读（语言切换即时随动）；读失败 ⇒ 回落 en + 记错（零静默）；空模板 ⇒ 不 popup（非编辑空选 = 零菜单）。 */
  win.webContents.on("context-menu", (_event, params) => {
    let labels
    try {
      labels = contextMenuLabels(loadConfig()?.locale)
    } catch (error) {
      console.error("[window] context menu locale readback failed:", error)
      labels = contextMenuLabels("en")
    }
    const template = contextMenuTemplate(params, labels)
    if (template.length === 0) return
    Menu.buildFromTemplate(template).popup({ window: win })
  })
  /** 菜单重建点⑤（D36）：窗口 `focus` —— 外部盘面漂移兜底（最近项目 ∥ 语言面；主题勾随报告面即时重建）。 */
  win.on("focus", () => refreshMenu())
  /** 加固（设计档未定形）：窗口内不开新窗，外链交系统浏览器；**窗口自身导航**（#389③）只许应用源 ——
   *  外部 URL ⇒ 拒（判据单源 = `protocol.mjs` `isAppNavigation`；refused 记 stderr——零静默）。 */
  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: "deny" }
  })
  win.webContents.on("will-navigate", (event, url) => {
    if (isAppNavigation(url)) return
    event.preventDefault()
    console.error(`[window] navigation refused: ${url}`)
  })
  win.loadURL(`${SCHEME}://${HOST}/index.html`)
  return win
}

/** 会话窗（在独立窗口打开 · 2026-10-13）：同渲染端 ∕ 同预载的**小窗**——`?swin=<slot>` 由渲染端 boot
 *  消费（本地激活目标会话，**不动持久指针**——主窗会话零扰）；`body.session-window` 由渲染端落（CSS 隐藏
 *  侧栏 ∕ 会话选择 ∕ 新建 ∕ Header 菜单钮）。**不占 `activeWin`**（主窗保持菜单 ∕ `refreshMenu` 焦点目标；
 *  应用级菜单加速键对全窗生效）；事件出站广播化（main.mjs `emit` ⇒ 全窗口）⇒ 本窗照收本会话流
 *  （渲染端按 activeSession 自滤）。关窗不杀回合（agent 宿主按会话键存活——主窗列表照常）。 */
export function createSessionWindow(slot, title, cwd = null) {
  const win = new BrowserWindow({
    width: 1080, height: 720, minWidth: 640, minHeight: 480,
    backgroundColor: THEME_COLORS[resolveTheme()],
    titleBarStyle: process.platform === "darwin" ? "hiddenInset" : "hidden",
    title: (title || "ThinCoder").slice(0, 80),
    show: false,
    webPreferences: { contextIsolation: true, sandbox: true, nodeIntegration: false, preload: PRELOAD_PATH,
      backgroundThrottling: false },
  })
  // cwd 钉扎（会话窗 cwd 钉扎批 · 2026-10-17）：窗域会话动作（prefs ∕ flags ∕ send ∕ history ∕ @ 补全）的
  // cwd = 开窗时点项目——主窗单指针（`projects.currentCwd()`）随主窗切项目漂移，窗域动作按指针解析会跨项目
  // 读写（同号槽 = 静默写错会话；无槽 = `slot-missing`——用户实测「切模型不生效」）。IPC 边界按发窗取 `_swinCwd`。
  win._swinCwd = typeof cwd === "string" && cwd !== "" ? cwd : null
  bindWindowStatePush(win) // 自绘三钮图标随态（会话窗同款 Header——窗口控制钮在本窗自绘）
  win.webContents.on("context-menu", (_event, params) => {
    let labels
    try {
      labels = contextMenuLabels(loadConfig()?.locale)
    } catch (error) {
      labels = contextMenuLabels("en")
    }
    const template = contextMenuTemplate(params, labels)
    if (template.length === 0) return
    Menu.buildFromTemplate(template).popup({ window: win })
  })
  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: "deny" }
  })
  win.webContents.on("will-navigate", (event, url) => {
    if (isAppNavigation(url)) return
    event.preventDefault()
    console.error(`[window] navigation refused: ${url}`)
  })
  win.loadURL(`${SCHEME}://${HOST}/index.html?swin=${encodeURIComponent(String(slot))}`)
  win.once("ready-to-show", () => win.show())
  return win
}

/** 冒烟读回：等首载（`loaded`）→ 探针表逐项 → 引导位读回；返回 `{ loaded, protocol, boot }`。 */
export async function runSmoke(win, onError) {
  const loaded = await firstLoad(win, onError)
  const probes = []
  for (const probe of PROBES) probes.push(await runProbe(probe, onError))
  const protocol = { served: protocolStats.served, blocked: protocolStats.blocked, probes }
  return { loaded, protocol, boot: await readBoot(win, onError) }
}

/** 首载结束判定（`did-finish-load` ∨ `did-fail-load`）；失败记错不抛——总超时由 main.mjs 兜底。 */
function firstLoad(win, onError) {
  return new Promise((done) => {
    win.webContents.once("did-finish-load", () => done(true))
    win.webContents.once("did-fail-load", (_event, code, description) => {
      onError(`window load failed: ${code} ${description}`)
      done(false)
    })
  })
}

/** 单探针读数（`net.fetch` 直取 `app://`）：正探针 `{ id, status, mime }` / 负探针 `{ id, status }`（探针契约 —— 负探针无 `mime` 键）；取不到 ⇒ status 0 + 记错。 */
async function runProbe(probe, onError) {
  try {
    const response = await net.fetch(`${SCHEME}://${HOST}/${probe.path}`)
    const got = { id: probe.id, status: response.status }
    if (probe.mime !== undefined) {
      const contentType = response.headers.get("content-type")
      if (contentType) got.mime = contentType.split(";")[0].trim()
    }
    return got
  } catch (error) {
    onError(`probe ${probe.id} failed: ${error?.message ?? error}`)
    return { id: probe.id, status: 0 }
  }
}

/** 探针期望表判定（`ok` 条件之一；与 `blocked >= NEGATIVE_PROBE_COUNT` 双证——负探针真命中门才算数）。 */
export function probesSatisfied(probes) {
  if (!Array.isArray(probes) || probes.length !== PROBES.length) return false
  return PROBES.every((probe, index) => {
    const got = probes[index]
    return got?.id === probe.id && got.status === probe.expect && (probe.mime === undefined || got.mime === probe.mime)
  })
}

/** 引导位读回：轮询至置位或 `BOOT_WAIT_MS`（装配是异步往返，`did-finish-load` 时未必已置位）。 */
async function readBoot(win, onError) {
  const deadline = Date.now() + BOOT_WAIT_MS
  while (Date.now() < deadline) {
    try {
      const value = await win.webContents.executeJavaScript(BOOT_READBACK)
      if (value === "ok" || value === "error") return value
    } catch (error) {
      onError(`boot readback failed: ${error?.message ?? error}`)
      return "none"
    }
    await new Promise((done) => setTimeout(done, BOOT_POLL_MS))
  }
  return "none"
}
