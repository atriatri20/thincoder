/**
 * views-me-chat-composer.mjs — 我的·对话页·输入区与状态行（`webui/CHAT.md` §2.2——四轴沿 §2.1③④；member-face-chat 批——台账 #1215）：
 * 核件 `thincoder-render-core/composer/panel.mjs` **全件消费**（适配层四面）+ 状态行（本档自持渲染——核无状态行族）+ 斜杠命令表 + 排队面承接。
 * 与管理面同族构件**自持同构**（§2.2「公共适配层抽取 = 登记不做」——形基准 = `views-chat-composer.mjs`；两页单源 = 核件）。
 *
 * 适配层四面（§2.1③——逐面）：① **容器自建**（控制台建 `#toolbar`——核件不造容器）+ 两样式 `<link>` 幂等注（`data-rc-css`）；
 * ② **变量别名桥** = `:root` 别名块（落 `style.css`——核壳族变量名 ⇒ 控制台既有变量，零新值）；③ **注入口桥** = 本档 `post`/`state`/`hooks` 三件；
 * ④ **钮可见性 = 适配层开关**（member-face-parity 批 KD-SV-218）：容器挂 `data-flags="live"`（本档建 `#toolbar` 之点）+ `style.css`
 * 作用域覆写 `#toolbar[data-flags="live"]` 下四模式钮 + 设置钮 `display: inline-flex` —— 全局收窄五 id 规则零动（管理面五枚仍隐、AC-19 canon 不破）。
 * `workspaceRequired` ⇒ `false`（§2.2 差异④——工作区 = 会话级已绑，非逐消息概念）。
 *
 * 三端对齐面（member-face-parity 批——机制 = `agent/MEMBER-AGENT.md` §3.11）：**四旗**读面 = `deps.flagsOf()`（当刻会话行 `flags` 槽四字段——
 * 恒假改真读；写 = 核件钮 ⇒ `post("setAutoApprove"…)` ⇒ 本档 `deps.onSelectFlag(name, value)`（页面 `PATCH …/:id` 一次一件）⇒ 回读重派生）；
 * **状态行段表 19 段**（§3.11(4)——段集 ⊆ 表 ∥ 缺源 ⇒ 零段；页内读数经 `deps.readings()` 现取：审批在决 ∥ 挂起池 ∥ 计划旗 ∥ 标题）；
 * **图片通道** = `payload.images` 放行入 `onSend(text, images)`（§3.11(6)——零静默丢：服务端视觉门 400 ⇒ 就地人话 + 草稿保留）；
 * **`@` 文件引用** = `post("atComplete")` ⇒ `deps.onAtComplete(payload)`（页面取 `GET /api/me/chat/files` ⇒ `atResults` 回推）。
 * 状态行段源（§2.1④ 表 + §3.11(4) 19 段）：`turn`/`usage`（含 `reasoning`/`timers` 扩字段）/`call`/`result`/`end` 帧 + `tasks`/`compress`/`wait` 帧 + 客户端时钟 + 页内读数。
 * 排队面（§2.1③承）：在途提交 ⇒ 核面板出泡（`markPending`）+ `queuedUserMessage` ⇒ 入队（容量 = 核 `QUEUED_MAX_ITEMS`；图列随队条目同携）；
 * `end` ⇒ 队首发起（新回合）；`interrupt`（Ctrl+I）= 折法（中止当前回合 + 该文本入队首——无注入通道，端差异条③）。
 * 模型/档位面（§2.2 差异⑥）：候选源 = `GET /api/me/chat/models`（`{ models: [{ id, reasoning }] }`——零 provider 内部细节）；
 * 拾取 ⇒ 装配面 `PATCH /api/me/chat/sessions/:id`（下回合生效——KD-SV-111 同口径会话级）。
 */
import { t } from "./i18n.mjs"
import { EN_CORE } from "./i18n-en-core.mjs"
import { coreText } from "./views-me-chat-messages.mjs"
import { createComposerPanel } from "/rc/composer/panel.mjs"
import { formatHelp } from "/rc/composer/slash.mjs"
import { clearPending, markPending, QUEUED_MAX_ITEMS } from "/rc/flow/queued-mark.mjs"
import { fmtK } from "/rc/lib.mjs"
import { showToast } from "/rc/toast.mjs"
import { specForDisplay } from "./model-specs-snapshot.mjs"

/** 核件样式档（`<link>` 注入面——桌面 `mount-composer.mjs` 同式；幂等键 = `data-rc-css`）∥ 会话内搜索样式档（核件单源）。 */
export const CORE_CSS = Object.freeze(["/rc/composer/composer.css", "/rc/composer/model-menu.css"])
export const SEARCH_CSS = "/rc/search.css"
/** 静默段阈（§2.1④——三端同口径 = `docs/cli/design/TUI.md` §7.7）。 */
export const QUIET_MS = 10000
/** context 段警示阈（§2.1④——≥80% ⇒ 警示色段）。 */
export const CONTEXT_WARN_PCT = 80
/** 四模式旗键（核槽四字段——KD-SV-218；写径 = `PATCH` 一次一件）。 */
export const FLAG_KEYS = Object.freeze(["autoApprove", "advisorGuard", "engineering", "planMode"])

/** 单档样式注入（幂等——重渲 ∥ 语言切换重挂零重复）。 */
export function injectStylesheet(href) {
  if (document.querySelector(`link[data-rc-css="${href}"]`) !== null) return
  const link = document.createElement("link")
  link.rel = "stylesheet"
  link.href = href
  link.setAttribute("data-rc-css", href)
  document.head.append(link)
}

/** 核件两样式档注入（幂等）。 */
export function injectCoreCss() {
  for (const href of CORE_CSS) injectStylesheet(href)
}

/** 状态行零态（回合起点——段源读数全归零）；`running`/`model`/时钟由装配面按回合置。 */
export function emptyStatusState() {
  return {
    running: false, model: "", turn: 0, toolName: "",
    prompt: 0, completion: 0, reasoning: 0, cacheHit: 0, cacheMiss: 0,
    contextPct: null, startedAt: 0, frozenMs: null, lastOutputAt: 0,
    // 三端对齐面段源（§3.11(4) 段 10–18——页内读数经 `deps.readings()` 现取合并）
    planMode: false, approvalCount: 0, suspRunning: 0, suspSettled: 0,
    tasksDone: 0, tasksTotal: 0, timersCount: 0, timersExpired: 0,
    compress: null, wait: null, title: "", queueCount: 0,
  }
}

/** context 段读数（末次 `usage.prompt` ÷ 展示规格上下文——未收录 ∥ 分母零 ⇒ `null` = 零段）。 */
export function contextPctOf(model, prompt) {
  const context = specForDisplay(model)?.context ?? 0
  if (context <= 0 || !(prompt > 0)) return null
  return Math.min(999, Math.round((prompt / context) * 100))
}

/** 段 15 文案（`compress` 帧——`start`/`done`/`fallback`/`failed`；缺源 ∥ 表外 ⇒ `null` = 零段）。
 *  `start`/`done`/`failed` 取核词键（词面单源）；`fallback`（成功降级——非失败）取本面键。 */
export function compressTextOf(compress) {
  if (compress === null || compress === undefined || typeof compress !== "object") return null
  const status = compress.status
  if (status === "start") return coreText("compress.starting")
  if (status === "done") {
    const tokens = Number.isFinite(compress.tokensFreed) ? fmtK(compress.tokensFreed) : "?"
    const seconds = Number.isFinite(compress.elapsedMs) ? Math.round(compress.elapsedMs / 100) / 10 : "?"
    return coreText("compress.done", { tokens, seconds })
  }
  if (status === "fallback") return t("me.chat.statusCompressFallback")
  if (status === "failed") return coreText("compress.failed", { error: String(compress.error ?? "") })
  return null
}

/** 段 16 文案（`wait` 帧 `info`）：两形兼容——**设计本形** = 核映射产物 `{ kind, seconds|message }` ∪ **盒壳实际形** = `onWait` 载荷原样 `{ phase, seconds?, message? }`
 *  （`deploy/sandbox/member-shell/protocol.mjs` `waitFrame` 原样透传；相位词单源 = 核 `provider/wait-status.mjs`——页面零自持映射，仅反查该单源产物的键）；四 kind 取核词键；`warn` ∥ 未知相位 ∥ 载荷缺 ⇒ `null` = 零段（禁假造——同核 `waitStatusOf` 判据）。 */
const WAIT_PHASE_KINDS = Object.freeze({ gate: "rateWait", retry: "rateLimited", overloaded: "overloaded", quota: "quota" })
/** 发射面回显前缀（核 `provider/wait-status.mjs` 同式派生——核以**缺省 locale（en）**取 `status.quota` 去占位符即得；
 *  发射侧恒为 en 字面（`provider/retry.mjs`），故剥前缀不随页面 locale 变——zh 面取值会得失配前缀）。 */
const QUOTA_ECHO_PREFIX = String(EN_CORE["status.quota"] ?? "").replace("${msg}", "")
const WAIT_KEYS = Object.freeze({ rateWait: "status.rateWait", rateLimited: "status.rateLimited", overloaded: "status.overloaded", quota: "status.quota" })
export function waitTextOf(info) {
  if (info === null || info === undefined || typeof info !== "object") return null
  const kind = typeof info.kind === "string" ? info.kind : WAIT_PHASE_KINDS[String(info.phase ?? "")]
  const key = WAIT_KEYS[kind]
  if (key === undefined) return null
  if (kind === "quota") {
    const raw = String(info.message ?? "")
    const message = QUOTA_ECHO_PREFIX !== "" && raw.startsWith(QUOTA_ECHO_PREFIX) ? raw.slice(QUOTA_ECHO_PREFIX.length) : raw
    return message.trim() === "" ? null : coreText(key, { msg: message })
  }
  return Number.isFinite(info.seconds) ? coreText(key, { s: String(info.seconds) }) : null
}

/** 状态行段集（纯函数——单元测试档直测）：**段序 = §3.11(4) 19 段表**（1–18 落地段；19 = 判定项两枚在册不造）；
 *  `{ text, warn }`；缺源段零输出。 */
export function statusSegments(state, nowMs = Date.now()) {
  const out = []
  const push = (text, warn = false) => out.push({ text, warn })
  if (state.running === true) push(`${t("me.chat.statusRunning")}…`)                                        // 1 运行中…
  if (state.toolName !== "") push(`${t("me.chat.statusTool")}: ${state.toolName}`)                          // 2 工具: <名>
  if (state.prompt > 0 || state.completion > 0) push(`↑${fmtK(state.prompt)} ↓${fmtK(state.completion)}`)   // 3 ↑N ↓N
  if (state.reasoning > 0) push(`✦${fmtK(state.reasoning)}`)                                                // 4 ✦N（`usage.reasoning`）
  const cacheTotal = state.cacheHit + state.cacheMiss
  if (cacheTotal > 0) push(`${t("me.chat.statusCache")}${Math.round((state.cacheHit / cacheTotal) * 100)}%`) // 5 hit N%
  if (typeof state.contextPct === "number") push(`${t("me.chat.statusContext")} ${state.contextPct}%`, state.contextPct >= CONTEXT_WARN_PCT) // 6 context N%
  if (state.turn > 0) push(t("me.chat.statusTurn", { n: state.turn }))                                      // 7 轮次 n
  const elapsedMs = state.frozenMs ?? (state.startedAt > 0 ? nowMs - state.startedAt : null)
  if (elapsedMs !== null && elapsedMs > 0) push(t("me.chat.statusElapsed", { s: Math.floor(elapsedMs / 1000) })) // 8 耗时 Ns
  if (state.running === true && state.lastOutputAt > 0 && nowMs - state.lastOutputAt >= QUIET_MS) {
    push(t("me.chat.statusQuiet", { s: Math.floor((nowMs - state.lastOutputAt) / 1000) }))                  // 9 已静默 Ns
  }
  if (state.planMode === true) push(t("me.chat.statusPlan"))                                                // 10 计划模式（会话行 `flags.planMode`）
  if (state.approvalCount > 0) push(t("me.chat.statusApproval"), true)                                      // 11 等待审批（在决 ask 表）
  if (state.suspRunning > 0 || state.suspSettled > 0) push(t("me.chat.statusSusp", { n: state.suspRunning, m: state.suspSettled })) // 12 挂起 N/M
  if (state.tasksTotal > 0) push(t("me.chat.statusTasks", { done: state.tasksDone, total: state.tasksTotal })) // 13 任务 N/M（`tasks` 帧）
  if (state.timersCount > 0) push(`⏰${state.timersCount}`, state.timersExpired > 0)                        // 14 ⏰N（`usage.timers`）
  const compressText = compressTextOf(state.compress)                                                       // 15 压缩中… ∥ 已压缩
  if (compressText !== null) push(compressText)
  const waitText = waitTextOf(state.wait)                                                                   // 16 状态文本（限流/过载/配额）
  if (waitText !== null) push(waitText)
  const title = typeof state.title === "string" ? state.title.trim() : ""
  if (title !== "") push(title)                                                                             // 17 会话标题（行 `title` ∥ excerpt）
  if (state.queueCount > 0) push(t("me.chat.statusQueue", { n: state.queueCount }))                          // 18 队列 N（页内队列）
  return out                                                                                                // 19 判定项（台账/团队）在册不造
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
 * 输入区 + 状态行装配（本档 = 核件全件消费的适配层——成员面）。
 * `deps`（装配面七件）：`root` = 挂载根（`#toolbar` 建于此）· `currentChat()` ⇒ `{ id, model, reasoning } | null` ·
 * `onModels()` ⇒ `/api/me/chat/models` 载荷 · `onSend(text, images)` ⇒ `{ accepted, ended }`（整轮——含 `end` 后重读）· `onAbort()` ·
 * `onSelectModel(model)` ⇒ 布尔（`PATCH`）· `onSelectReasoning(reasoning)` ⇒ 布尔（`PATCH` 档位写）·
 * `onEcho(text, ts)` ⇒ 用户块元素 · `onNewChat()` ⇒ 布尔 · `onHelp(rows)` ⇒ 布尔 · 三端对齐面四件：`flagsOf()` ⇒ 当刻会话行 `flags` ∥
 * `onSelectFlag(name, value)` ⇒ 布尔（`PATCH` 一次一件）∥ `onAtComplete(payload)`（`@` 桥——页面取候选后经 `atResults` 回推）∥
 * `onOpenSettings()`（⚙ ⇒ 账户页路由）· `readings()` ⇒ 页内段读（审批/挂起/计划旗/标题）。
 * 返回面：`{ el, panel, statusLine, commands, applyFrame, resetTurn, refreshModels, syncModel, syncFlags, refreshStatus, queueCount, inputEl }`。
 */
export function createMeChatComposer(ctx, deps = {}) {
  const { root } = deps
  if (!root) throw new Error("createMeChatComposer: deps.root required (#toolbar mount root)")
  const { h } = ctx

  // ── ① 容器自建 + 两样式档注入（幂等）∥ ④ 钮可见性适配层开关（`data-flags="live"`——style.css 作用域覆写）──
  injectCoreCss()
  const el = h("div", { id: "toolbar" })
  el.setAttribute("data-flags", "live")
  const statusLine = h("div", { id: "status-line" })
  el.append(statusLine)
  root.append(el)

  // ── 状态行（段源 = 帧面 + 客户端时钟 + 页内读数；1s 跳秒仅回合在飞）──────────────────────
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
    const view = { ...status, queueCount: queue.length, ...(deps.readings?.() ?? {}) }
    const nodes = []
    for (const seg of statusSegments(view, Date.now())) {
      if (nodes.length > 0) nodes.push(h("span", { class: "status-sep", text: "·" }))
      nodes.push(h("span", { class: seg.warn ? "status-seg status-warn" : "status-seg", text: seg.text }))
    }
    statusLine.replaceChildren(...nodes)
  }

  // ── 队列（容量 = 核 `QUEUED_MAX_ITEMS`；`end` ⇒ 队首发起）─────────────────────
  const queue = []
  let lastEcho = null // 核面板「出泡 → 出站」紧邻序：本条 = 本批出泡元素（待发标清标锚）

  // ── 模型候选（源 = `GET /api/me/chat/models`；核行形补 `label`/`reasoning`）──────
  let modelRows = []
  let pushHandler = null
  const providerOf = (id) => { const s = String(id ?? ""); const i = s.indexOf("/"); return i > 0 ? s.slice(0, i) : s } // 归属名 = id 首段（首斜杠口径——server 面约定）；无斜杠 ⇒ 全串（分组行免空题——走查轮笔 2）
  const coreRowOf = (row) => ({ id: row.id, provider: providerOf(row.id), group: providerOf(row.id), label: row.id, reasoning: row.reasoning ?? [] })

  /** 推送（核面板 `applyModels` 消费）：携 `rollback: true` = **显示面重派生**（零槽写——本档刷新专用：钮面字随当刻会话模型，免系统回声径回写）。
   *  `prefs.reasoning` = 当刻会话档位（`null` = 未设 ⇒ 核中性面 `—`——KD-SV-111）。 */
  function pushModels() {
    const chat = deps.currentChat?.() ?? null
    const model = String(chat?.model ?? "")
    pushHandler?.({
      type: "models",
      models: modelRows,
      prefs: model === "" ? {} : { model, provider: providerOf(model), reasoning: chat?.reasoning ?? null },
      rollback: true,
    })
  }

  /** 候选取数（进页一次 ∥ 显式刷新）：失败 ⇒ 零候选（核面板 `model.loading` 面在册——零假候选）。 */
  async function refreshModels() {
    try {
      const data = await deps.onModels?.()
      modelRows = (Array.isArray(data?.models) ? data.models : []).map(coreRowOf)
    } catch { modelRows = [] }
    pushModels()
  }

  // ── ③ 注入口桥（`post` 动作映射表 ∥ `state` 读面 ∥ `hooks` 三件）──────────────
  const state = {
    turnState: () => (status.running ? "running" : "idle"),
    queue: () => ({ count: queue.length }),
    models: () => modelRows,
    // 四旗读面（§3.11(3)——恒假改真读：当刻会话行 `flags` 槽四字段；缺行 ⇒ 全假）
    flags: () => {
      const flags = deps.flagsOf?.() ?? null
      return {
        autoApprove: flags?.autoApprove === true,
        advisorGuard: flags?.advisorGuard === true,
        engineering: flags?.engineering === true,
        planMode: flags?.planMode === true,
      }
    },
    workspaceRequired: () => false, // 工作区 = 会话级已绑（§2.2 差异④——非逐消息概念）
    subscribe: (handler) => { pushHandler = handler },
  }
  const hooks = {
    onUserEcho: (text, ts) => { lastEcho = deps.onEcho?.(text, ts) ?? null; return lastEcho },
    onTurnStart: () => beginTurn(),
    onStatusRefresh: () => paintStatus(),
    openSettings: () => deps.onOpenSettings?.(), // 控件行第 7 钮 ⇒ 账户页路由（§3.11(6) ⚙ 判定）
  }
  const commands = createSlashCommands({ newChat: () => deps.onNewChat?.() === true, help: () => printHelp() })

  /** `/help` 行集就地打印（核 `formatHelp` 单源——本档零第二清单）。 */
  function printHelp() {
    return deps.onHelp?.(formatHelp(commands, t)) === true
  }

  /** 出站映射表（§2.1③ ③——未在册类型零动作：钮/菜单项面已 CSS 收窄，零静默假动作面）。
   *  成员面消息链 = `content` + `images`（§3.11(6) 图片通道——`payload.images` 放行；文本档内联 `withAttachedFiles` 照常）；
   *  四模式旗 = `setAutoApprove`/`setAdvisorGuard`/`setEngineeringEnabled`/`setPlanMode` ⇒ 页面 `PATCH` 一次一件；
   *  `atComplete` = `@` 桥出站（页面取候选 ⇒ `atResults` 回推核件面板）。 */
  const post = (type, payload = {}) => {
    if (type === "userMessage") { void runTurn(String(payload?.text ?? ""), imagesOf(payload)); return }
    if (type === "queuedUserMessage") { enqueue(String(payload?.text ?? ""), imagesOf(payload)); return }
    if (type === "interrupt") { interrupt(String(payload?.message ?? "")); return }
    if (type === "abort") { void deps.onAbort?.(); return }
    if (type === "selectModel") { void selectModel(String(payload?.model ?? "")); return }
    if (type === "selectReasoning") { void selectReasoning(String(payload?.reasoning ?? "")); return }
    if (type === "atComplete") { deps.onAtComplete?.(payload ?? {}); return }
    if (type === "setAutoApprove") { void writeFlag("autoApprove", payload?.value === true); return }
    if (type === "setAdvisorGuard") { void writeFlag("advisorGuard", payload?.value === true); return }
    if (type === "setEngineeringEnabled") { void writeFlag("engineering", payload?.value === true); return }
    if (type === "setPlanMode") { void writeFlag("planMode", payload?.value === true); return }
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

  /** 帧面入状态行（页面把每一帧都转来）：`delta` 只记「最近可见输出」（零重绘——1s 跳秒已足）；
   *  本批三帧（`tasks`/`compress`/`wait`）+ `usage` 两扩字段（`reasoning`/`timers`）同点收（§3.11(4) 段 4 ∥ 13 ∥ 14 ∥ 15 ∥ 16）。 */
  function applyFrame(frame) {
    if (frame === null || typeof frame !== "object") return
    const num = (value) => (typeof value === "number" && Number.isFinite(value) ? value : 0)
    if (frame.type === "delta") { status.lastOutputAt = Date.now(); return }
    if (frame.type === "turn") { status.turn = Number(frame.n) || status.turn; status.toolName = ""; status.lastOutputAt = Date.now(); paintStatus(); return }
    if (frame.type === "usage") {
      status.prompt += num(frame.prompt)
      status.completion += num(frame.completion)
      status.reasoning += num(frame.reasoning)
      status.cacheHit += num(frame.cacheHit)
      status.cacheMiss += num(frame.cacheMiss)
      if (frame.timers !== null && typeof frame.timers === "object") { status.timersCount = num(frame.timers.count); status.timersExpired = num(frame.timers.expired) }
      status.contextPct = contextPctOf(status.model, num(frame.prompt)) // 快照件口径（末次调用）
      status.lastOutputAt = Date.now()
      paintStatus()
      return
    }
    if (frame.type === "call") { status.toolName = String(frame.name ?? ""); status.lastOutputAt = Date.now(); paintStatus(); return }
    if (frame.type === "result") { status.toolName = ""; status.lastOutputAt = Date.now(); paintStatus(); return }
    if (frame.type === "tasks") {
      status.tasksDone = num(frame.done)
      status.tasksTotal = num(frame.total)
      paintStatus()
      return
    }
    if (frame.type === "compress") {
      status.compress = { status: String(frame.status ?? ""), tokensFreed: frame.tokensFreed, elapsedMs: frame.elapsedMs, error: frame.error }
      paintStatus()
      return
    }
    if (frame.type === "wait") { status.wait = frame.info ?? null; paintStatus(); return }
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

  /** 一轮到底（页面面 = 传输）：受理 ⇒ 不还原草稿；`end`（受理且已收口）⇒ 队首发起新回合；`images` = 图列（dataURL——同入站）。
   *  零在途预判（在途分流单点 = 核面板 `busyState`——本档再判会把自己刚置的在途当成忙态而错入队）。 */
  async function runTurn(text, images = []) {
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

  /** 队列入列（核面板忙态径——出泡与待发标归核面板：`markPending(hooks.onUserEcho(...))`；图列随条目）。 */
  function enqueue(text, images = []) {
    if (text.trim() === "") return
    queue.push({ text, images, el: lastEcho })
    lastEcho = null
    paintStatus()
  }

  /** `interrupt`（Ctrl+I）= 折法（端差异条③）：无注入通道 ⇒ 中止当前回合 + 该文本入队首（出泡 + 待发标）。 */
  function interrupt(text) {
    if (text.trim() === "") return
    if (queue.length >= QUEUED_MAX_ITEMS) { showToast(t("input.slotFull")); return }
    const node = deps.onEcho?.(text, Date.now()) ?? null
    markPending(node)
    queue.unshift({ text, images: [], el: node })
    paintStatus()
    void deps.onAbort?.()
  }

  /** `end` ⇒ 队首发起（新回合——清待发标后走同一发送径，零第二发送面）。 */
  async function flushQueue() {
    if (queue.length === 0 || status.running) return
    const head = queue.shift()
    if (head.el !== null) clearPending(head.el)
    paintStatus()
    await runTurn(head.text, head.images)
  }

  /** 换模型（核菜单拾取 ⇒ `selectModel` 出站）：`PATCH …/:id`（下回合生效——KD-SV-108 同口径）；失败 ⇒ 钮面回当刻会话模型（显示面重派生）。 */
  async function selectModel(model) {
    if (model === "") return
    const ok = await deps.onSelectModel?.(model)
    if (ok !== true) pushModels()
  }

  /** 设档位（核推理菜单拾取 ⇒ `selectReasoning` 出站）：`PATCH …/:id { reasoning }`（值域 = 当刻模型核枚举——KD-SV-111；
   *  下回合生效）；失败 ⇒ 钮面回当刻会话档位（显示面重派生——沿 `selectModel` 同形）。 */
  async function selectReasoning(reasoning) {
    if (reasoning === "") return
    const ok = await deps.onSelectReasoning?.(reasoning)
    if (ok !== true) pushModels()
  }

  /** 四旗写（核件钮/`/auto`/`/plan`/`/eng` 同门出站 ⇒ 页面 `PATCH` 一次一件）：回执后回读当刻行值重派生
   *  （成功 ⇒ 新值；失败 ⇒ 旧值回弹——核控件面镜像与行槽零分离）。 */
  async function writeFlag(name, value) {
    const ok = await deps.onSelectFlag?.(name, value)
    syncFlags()
    return ok === true
  }

  /** 四旗镜像重派生（核控件行三 handler：`autoApprove`/`agentSettings`/`planMode`——当刻行 `flags` 为真源）：
   *  会话切换 ∥ PATCH 回执 ∥ 回读失败三处调用。 */
  function syncFlags() {
    const flags = state.flags()
    pushHandler?.({ type: "autoApprove", value: flags.autoApprove })
    pushHandler?.({ type: "agentSettings", settings: { advisor: { guard: flags.advisorGuard }, engineering: flags.engineering } })
    pushHandler?.({ type: "planMode", active: flags.planMode })
  }

  /** 图列取读（`payload.images` = dataURL 串列——非串/空串逐项滤除，零静默假值）。 */
  const imagesOf = (payload) => (Array.isArray(payload?.images) ? payload.images.filter((item) => typeof item === "string" && item !== "") : [])

  pushModels() // 构造期先落一次（当刻会话可能已在手——钮面字零空窗）
  syncFlags() // 构造期四旗初绘（行 `flags` 真值——`state.flags()` 读面）

  return {
    el,
    panel,
    inputEl: panel.inputEl,
    statusLine,
    commands,
    applyFrame,
    resetTurn,
    refreshModels,
    syncModel: pushModels,
    syncFlags,
    refreshStatus: paintStatus,
    pushMessage: (message) => pushHandler?.(message), // 核面板推送面（`atResults` 等页取回推类型——单点）
    queueCount: () => queue.length,
  }
}
