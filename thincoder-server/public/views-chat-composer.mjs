/**
 * views-chat-composer.mjs — 管理·对话页·输入区与状态行（`webui/CHAT.md` §2.1③④；chat-shell-align 批——台账 #1292）：
 * 核件 `thincoder-render-core/composer/panel.mjs` **全件消费**（适配层四面）+ 状态行（本档自持渲染——核无状态行族）+ 斜杠命令表 + 排队面承接。
 *
 * 适配层四面（§2.1③——逐面）：① **容器自建**（控制台建 `#toolbar`——核件不造容器）+ 两样式 `<link>` 幂等注（`data-rc-css`）；
 * ② **变量别名桥** = `:root` 别名块（落 `style.css`——核壳族变量名 ⇒ 控制台既有变量，零新值）；③ **注入口桥** = 本档 `post`/`state`/`hooks` 三件；
 * ④ **无源钮收窄** = 五 id CSS 隐藏（`style.css`——本档零钮面逻辑；`#reasoning-btn` 经 KD-SV-111 解隐藏——档位通道三段补齐，钮字/选中态/下拉全归核件）。
 * 状态行（§2.1④——段表 ⊆ 有源）：`#status-line` = `#toolbar` 首子；段源 = `turn`/`usage`/`call`/`result`/`end` 帧 + 客户端时钟；
 * `statusSegments` 纯函数 = 单元测试档直测面；`✦reasoning` 与模型名段不做（无源——§2.1④ 表）。
 * 排队面（§2.1③）：在途提交 ⇒ 核面板出泡（`markPending`）+ `queuedUserMessage` ⇒ 入队（容量 = 核 `QUEUED_MAX_ITEMS`）；
 * `end` ⇒ 队首发起（新回合）；`interrupt`（Ctrl+I）= 折法（中止当前回合 + 该文本入队首——无注入通道，端差异条③）。
 */
import { t } from "./i18n.mjs"
import { createComposerPanel } from "/rc/composer/panel.mjs"
import { formatHelp } from "/rc/composer/slash.mjs"
import { clearPending, markPending, QUEUED_MAX_ITEMS } from "/rc/flow/queued-mark.mjs"
import { fmtK } from "/rc/lib.mjs"
import { showToast } from "/rc/toast.mjs"
import { deriveModels } from "./views-models.mjs"
import { specForDisplay } from "./model-specs-snapshot.mjs"

/** 核件两静态样式档（`<link>` 注入面——桌面 `mount-composer.mjs` 同式；幂等键 = `data-rc-css`）。 */
export const CORE_CSS = Object.freeze(["/rc/composer/composer.css", "/rc/composer/model-menu.css"])
/** 静默段阈（§2.1④——三端同口径 = `docs/cli/design/TUI.md` §7.7）。 */
export const QUIET_MS = 10000
/** context 段警示阈（§2.1④——≥80% ⇒ 警示色段）。 */
export const CONTEXT_WARN_PCT = 80

/** 核件两样式档注入（幂等——重渲 ∥ 语言切换重挂零重复）。 */
export function injectCoreCss() {
  for (const href of CORE_CSS) {
    if (document.querySelector(`link[data-rc-css="${href}"]`) !== null) continue
    const link = document.createElement("link")
    link.rel = "stylesheet"
    link.href = href
    link.setAttribute("data-rc-css", href)
    document.head.append(link)
  }
}

/** 状态行零态（回合起点——段源读数全归零）；`running`/`model`/时钟由装配面按回合置。 */
export function emptyStatusState() {
  return {
    running: false, model: "", turn: 0, toolName: "",
    prompt: 0, completion: 0, cacheHit: 0, cacheMiss: 0,
    contextPct: null, startedAt: 0, frozenMs: null, lastOutputAt: 0,
  }
}

/** context 段读数（末次 `usage.prompt` ÷ 展示规格上下文——未收录 ∥ 分母零 ⇒ `null` = 零段）。 */
export function contextPctOf(model, prompt) {
  const context = specForDisplay(model)?.context ?? 0
  if (context <= 0 || !(prompt > 0)) return null
  return Math.min(999, Math.round((prompt / context) * 100))
}

/** 状态行段集（纯函数——单元测试档直测）：段序 = §2.1④ 表；`{ text, warn }`；缺源段零输出。 */
export function statusSegments(state, nowMs = Date.now()) {
  const out = []
  const push = (text, warn = false) => out.push({ text, warn })
  if (state.running === true) push(`${t("admin.chat.statusRunning")}…`)
  if (state.toolName !== "") push(`${t("admin.chat.statusTool")}: ${state.toolName}`)
  if (state.prompt > 0 || state.completion > 0) push(`↑${fmtK(state.prompt)} ↓${fmtK(state.completion)}`)
  const cacheTotal = state.cacheHit + state.cacheMiss
  if (cacheTotal > 0) push(`${t("admin.chat.statusCache")}${Math.round((state.cacheHit / cacheTotal) * 100)}%`)
  if (typeof state.contextPct === "number") push(`${t("admin.chat.statusContext")} ${state.contextPct}%`, state.contextPct >= CONTEXT_WARN_PCT)
  if (state.turn > 0) push(t("admin.chat.statusTurn", { n: state.turn }))
  const elapsedMs = state.frozenMs ?? (state.startedAt > 0 ? nowMs - state.startedAt : null)
  if (elapsedMs !== null && elapsedMs > 0) push(t("admin.chat.statusElapsed", { s: Math.floor(elapsedMs / 1000) }))
  if (state.running === true && state.lastOutputAt > 0 && nowMs - state.lastOutputAt >= QUIET_MS) {
    push(t("admin.chat.statusQuiet", { s: Math.floor((nowMs - state.lastOutputAt) / 1000) }))
  }
  return out
}

/** 斜径命令表（**名 ∥ 别名 ⊆ CLI 名集**——`thincoder-cli/src/tui/slash-commands.mjs` 表纪律；组名 ⊆ 核 `HELP_GROUPS`）。
 *  `handlers` = 装配面动作（`/model` 走核 `ctx.actions.openModelMenu` = 同钮同门；`/new` ∥ `/help` 走装配面回调）。 */
export function createSlashCommands(handlers = {}) {
  return [
    { name: "/model", aliases: ["/m"], group: "Agent", descKey: "slash.desc.model", run: (ctx) => ctx.actions.openModelMenu() === true },
    { name: "/new", aliases: ["/n"], group: "Session", descKey: "slash.desc.new", run: () => handlers.newChat?.() === true },
    { name: "/help", aliases: ["/h"], group: "System", descKey: "slash.desc.help", run: () => handlers.help?.() === true },
  ]
}

/**
 * 输入区 + 状态行装配（本档 = 核件全件消费的适配层）。
 * `deps`（装配面六件）：`root` = 挂载根（`#toolbar` 建于此）· `currentChat()` ⇒ `{ id, model, reasoning } | null` · `onProviders()` ⇒ `/api/admin/providers` 载荷 ·
 * `onSend(text, images)` ⇒ `{ accepted, ended }`（整轮——含 `end` 后重读）· `onAbort()` · `onSelectModel(model)` ⇒ 布尔（`PATCH`）·
 * `onSelectReasoning(reasoning)` ⇒ 布尔（`PATCH` 档位写——KD-SV-110）·
 * `onEcho(text, ts)` ⇒ 用户块元素（核 `buildUserMessage` 宿主）· `onNewChat()` ⇒ 布尔（新会话弹窗）· `onHelp(rows)` ⇒ 布尔（行集就地打印）。
 * 返回面：`{ el, panel, statusLine, commands, applyFrame, resetTurn, refreshModels, syncModel, queueCount }`。
 */
export function createChatComposer(ctx, deps = {}) {
  const { root } = deps
  if (!root) throw new Error("createChatComposer: deps.root required (#toolbar mount root)")
  const { h } = ctx

  // ── ① 容器自建 + 两样式档注入（幂等）────────────────────────────────────────
  injectCoreCss()
  const el = h("div", { id: "toolbar" })
  const statusLine = h("div", { id: "status-line" })
  el.append(statusLine)
  root.append(el)

  // ── 状态行（段源 = 帧面 + 客户端时钟；1s 跳秒仅回合在飞）──────────────────────
  let status = emptyStatusState()
  let ticker = null
  function startTicker() {
    if (ticker !== null) return
    ticker = setInterval(() => { if (status.running) paintStatus() }, 1000)
  }
  function stopTicker() {
    if (ticker === null) return
    clearInterval(ticker)
    ticker = null
  }
  /** 段落面（`.status-sep` 分隔 ∥ `status-warn` = 警示段——类名 ∈ STYLE.md §2.1 新面登记）。 */
  function paintStatus() {
    const nodes = []
    for (const seg of statusSegments(status, Date.now())) {
      if (nodes.length > 0) nodes.push(h("span", { class: "status-sep", text: "·" }))
      nodes.push(h("span", { class: seg.warn ? "status-seg status-warn" : "status-seg", text: seg.text }))
    }
    statusLine.replaceChildren(...nodes)
  }

  // ── 队列（容量 = 核 `QUEUED_MAX_ITEMS`；`end` ⇒ 队首发起）─────────────────────
  const queue = []
  let lastEcho = null // 核面板「出泡 → 出站」紧邻序：本条 = 本批出泡元素（待发标清标锚）

  // ── 模型候选（`deriveModels` 同源——核行形补 `label`/`reasoning`）──────────────
  let modelRows = []
  let pushHandler = null
  const coreRowOf = (row) => ({ id: row.id, provider: row.provider, group: row.provider, label: row.id, reasoning: row.reasoning ?? [] })

  /** 推送（核面板 `applyModels` 消费）：携 `rollback: true` = **显示面重派生**（零槽写——本档刷新专用：钮面字随当刻会话模型，免系统回声径回写）。
   *  `prefs.reasoning` = 当刻会话档位（`null` = 未设 ⇒ 核中性面 `—`；KD-SV-111）。 */
  function pushModels() {
    const chat = deps.currentChat?.() ?? null
    const model = String(chat?.model ?? "")
    const row = modelRows.find((item) => item.id === model)
    pushHandler?.({
      type: "models",
      models: modelRows,
      prefs: model === "" ? {} : { model, provider: row?.provider ?? "", reasoning: chat?.reasoning ?? null },
      rollback: true,
    })
  }

  /** 候选取数（进页一次 ∥ 显式刷新）：失败 ⇒ 零候选（核面板 `model.loading` 面在册——零假候选）。 */
  async function refreshModels() {
    try {
      const data = await deps.onProviders?.()
      modelRows = deriveModels(data?.providers ?? []).map(coreRowOf)
    } catch { modelRows = [] }
    pushModels()
  }

  // ── ③ 注入口桥（`post` 动作映射表 ∥ `state` 读面 ∥ `hooks` 三件）──────────────
  const state = {
    turnState: () => (status.running ? "running" : "idle"),
    queue: () => ({ count: queue.length }),
    models: () => modelRows,
    flags: () => ({ autoApprove: false, advisorGuard: false, engineering: false, planMode: false }), // 无源（模式位面无）——核面构造期初值
    workspaceRequired: () => false, // 浏览器面恒有工作区语义（不入会话）
    subscribe: (handler) => { pushHandler = handler },
  }
  const hooks = {
    onUserEcho: (text, ts) => { lastEcho = deps.onEcho?.(text, ts) ?? null; return lastEcho },
    onTurnStart: () => beginTurn(),
    onStatusRefresh: () => paintStatus(),
  }
  const commands = createSlashCommands({ newChat: () => deps.onNewChat?.() === true, help: () => printHelp() })

  /** `/help` 行集就地打印（核 `formatHelp` 单源——本档零第二清单）。 */
  function printHelp() {
    return deps.onHelp?.(formatHelp(commands, t)) === true
  }

  /** 出站映射表（§2.1③ ③——未在册类型零动作：钮/菜单项面已 CSS 收窄，零静默假动作面）。 */
  const post = (type, payload = {}) => {
    if (type === "userMessage") { void runTurn(String(payload?.text ?? ""), payload?.images ?? []); return }
    if (type === "queuedUserMessage") { enqueue(String(payload?.text ?? ""), payload?.images ?? []); return }
    if (type === "interrupt") { interrupt(String(payload?.message ?? "")); return }
    if (type === "abort") { void deps.onAbort?.(); return }
    if (type === "selectModel") { void selectModel(String(payload?.model ?? "")); return }
    if (type === "selectReasoning") { void selectReasoning(String(payload?.reasoning ?? "")); return }
  }

  const panel = createComposerPanel({ root: el, post, state, hooks, slash: { commands } })

  // ── 回合面（起点 ∥ 终态 ∥ 队列）─────────────────────────────────────────────

  /** 回合起点（`hooks.onTurnStart` ∥ 队首发起两径共用）：读数归零 + 在途置位（面板按钮/占位符/状态行同点重派生）。 */
  function beginTurn() {
    const fresh = emptyStatusState()
    fresh.running = true
    fresh.model = String(deps.currentChat?.()?.model ?? "")
    fresh.startedAt = Date.now()
    fresh.lastOutputAt = Date.now()
    status = fresh
    setRunning(true)
  }

  /** 在途置位（面板 `setLoading` 单点——按钮互换 ∥ 占位符 ∥ 状态行刷新皆由核面重派生）。终态 ⇒ 停跳秒 + 耗时冻结兜底。 */
  function setRunning(on) {
    status.running = on
    if (on) startTicker()
    else {
      stopTicker()
      if (status.frozenMs === null && status.startedAt > 0) status.frozenMs = Date.now() - status.startedAt
    }
    panel.setLoading(on)
    paintStatus()
  }

  /** 帧面入状态行（页面把每一帧都转来）：`delta` 只记「最近可见输出」（零重绘——1s 跳秒已足）。 */
  function applyFrame(frame) {
    if (frame === null || typeof frame !== "object") return
    if (frame.type === "delta") { status.lastOutputAt = Date.now(); return }
    if (frame.type === "turn") { status.turn = Number(frame.n) || status.turn; status.toolName = ""; status.lastOutputAt = Date.now(); paintStatus(); return }
    if (frame.type === "usage") {
      const num = (value) => (typeof value === "number" && Number.isFinite(value) ? value : 0)
      status.prompt += num(frame.prompt)
      status.completion += num(frame.completion)
      status.cacheHit += num(frame.cacheHit)
      status.cacheMiss += num(frame.cacheMiss)
      status.contextPct = contextPctOf(status.model, num(frame.prompt)) // 快照件口径（末次调用）
      status.lastOutputAt = Date.now()
      paintStatus()
      return
    }
    if (frame.type === "call") { status.toolName = String(frame.name ?? ""); status.lastOutputAt = Date.now(); paintStatus(); return }
    if (frame.type === "result") { status.toolName = ""; status.lastOutputAt = Date.now(); paintStatus(); return }
    if (frame.type === "end") {
      if (typeof frame.durationMs === "number" && frame.durationMs >= 0) status.frozenMs = frame.durationMs // 耗时段冻结源（缺 ⇒ `setRunning` 兜底）
      paintStatus()
    }
  }

  /** 重读 ⇒ 状态行归零（帧面零落库——读数重算；`耗时` 保留至下一回合 ∥ 手动静默后重读）。 */
  function resetTurn() {
    const running = status.running
    status = emptyStatusState()
    status.running = running
    if (running) status.startedAt = Date.now()
    paintStatus()
  }

  /** 一轮到底（页面面 = 传输）：受理 ⇒ 不还原草稿；`end`（受理且已收口）⇒ 队首发起新回合。
   *  零在途预判（在途分流单点 = 核面板 `busyState`——本档再判会把自己刚置的在途当成忙态而错入队）。 */
  async function runTurn(text, images) {
    if (text.trim() === "") return false
    beginTurn()
    let result = { accepted: false, ended: false }
    try {
      result = (await deps.onSend?.(text, images)) ?? result
    } finally {
      setRunning(false)
    }
    if (result.accepted !== true && panel.inputEl.value === "") panel.inputEl.value = text // 零副作用失败（信封拒）⇒ 草稿还原（零丢失）
    if (result.accepted === true && result.ended === true) await flushQueue() // `end` ⇒ 队首发起（新回合）
    return result.accepted === true
  }

  /** 队列入列（核面板忙态径——出泡与待发标归核面板：`markPending(hooks.onUserEcho(...))`）。 */
  function enqueue(text, images) {
    if (text.trim() === "") return
    queue.push({ text, images, el: lastEcho })
    lastEcho = null
  }

  /** `interrupt`（Ctrl+I）= 折法（端差异条③）：无注入通道 ⇒ 中止当前回合 + 该文本入队首（出泡 + 待发标）。 */
  function interrupt(text) {
    if (text.trim() === "") return
    if (queue.length >= QUEUED_MAX_ITEMS) { showToast(t("input.slotFull")); return }
    const node = deps.onEcho?.(text, Date.now()) ?? null
    markPending(node)
    queue.unshift({ text, images: [], el: node })
    void deps.onAbort?.()
  }

  /** `end` ⇒ 队首发起（新回合——清待发标后走同一发送径，零第二发送面）。 */
  async function flushQueue() {
    if (queue.length === 0 || status.running) return
    const head = queue.shift()
    if (head.el !== null) clearPending(head.el)
    await runTurn(head.text, head.images)
  }

  /** 换模型（核菜单拾取 ⇒ `selectModel` 出站）：`PATCH …/:id`（下回合生效——KD-SV-108）；失败 ⇒ 钮面回当刻会话模型（显示面重派生）。 */
  async function selectModel(model) {
    if (model === "") return
    const ok = await deps.onSelectModel?.(model)
    if (ok !== true) pushModels()
  }

  /** 设档位（核推理菜单拾取 ⇒ `selectReasoning` 出站）：`PATCH …/:id { reasoning }`（值域 = 当刻模型核枚举——KD-SV-110；
   *  下回合生效）；失败 ⇒ 钮面回当刻会话档位（显示面重派生——沿 `selectModel` 同形）。 */
  async function selectReasoning(reasoning) {
    if (reasoning === "") return
    const ok = await deps.onSelectReasoning?.(reasoning)
    if (ok !== true) pushModels()
  }

  pushModels() // 构造期先落一次（当刻会话可能已在手——钮面字零空窗）

  return {
    el,
    panel,
    statusLine,
    commands,
    applyFrame,
    resetTurn,
    refreshModels,
    syncModel: pushModels,
    queueCount: () => queue.length,
  }
}
