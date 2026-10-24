/**
 * views-me-chat.mjs — 我的·对话（`webui/CHAT.md` §2.2——`#/me/chat`；机制全文 = `agent/MEMBER-AGENT.md`；member-face-parity 批——台账 #1215）——**页四段** = 会话条 sticky 顶 ∥ 消息流文档流 ∥ 状态行 + 输入区 sticky 底（四轴沿 §2.1；零 `.card` 面）。
 * **成员差异六条**：① 取数面 = `/api/me/chat/*` + `/api/me/sandbox/*`；② 工作区维度（会话条示工作区名 + 盒态 + `agentOnline`；新会话选工作区——一枚 ⇒ 零选择）；③ 盒态动作（就地启动 ∥ 拉仓四态人话）；④ 无源钮收窄（五枚 CSS + 主机凭据钮不设；
 * 本批四模式钮经适配层开关解隐藏——`data-flags="live"`，§2.2 差异④）；⑤ notice 六值；⑥ 档位面（核菜单 ⇒ `PATCH …/:id { reasoning }`）。会话源 = 盒内（KD-SV-152）——盒离线 ⇒ 409（就启动引导，非静默）。
 * 取数：列表/详情 = `GET …/sessions[/:id]`（读时读）∥ 发送 = `POST …/:id/messages`（体 = `{ content, images? }`——图列 dataURL 直通，服务端视觉门拒 ⇒ 400 人话 + 草稿保留）∥ 中止 = `POST …/abort`（携 `{ key? }`——停单件）。
 * 换模型/设档/四旗/标题 = `PATCH …/:id`（一次一件）∥ 删除 = `POST …/:id/delete { confirm: true }` ∥ ask 应答 = `POST …/asks/:promptId`；模型候选 = `GET …/models`；`@` 候选 = `GET …/chat/files`；工作区 = `GET …/sandbox/workspaces` + 建/启/拉。
 * 断连/离页 = 读流中止（回合仍在盒内执行）。直测面 = `renderMeChat`。
 * 外拆（member-pull-inline-cred 批 ∥ member-face-parity 批 KD-SV-221——本件外拆至 500 软线内）：拉取弹窗与凭据就地绑 = `views-me-chat-pull.mjs`（KD-SV-215）∥ 会话条与会话起点弹窗 = `views-me-chat-sessions.mjs` ∥ ask 卡族四件 = `views-me-chat-cards.mjs` ∥ 子代理面 = `views-me-chat-subs.mjs`——本档 `export … from` 兼容重导出拉取两纯件（旧测试面零改）。
 */
import { t, langTag } from "./i18n.mjs"
import { buildUserMessage, renderBlock } from "/rc/flow/block.mjs"
import { renderReasoning } from "/rc/flow/reasoning.mjs"
import { finishToolCard, renderToolCard } from "/rc/flow/tool-card.mjs"
import { appendToolOutput, attachCopyButtons, createStreamRenderer } from "/rc/flow/stream.mjs"
import { createSearch } from "/rc/search.mjs"
import { applyPin, createPinWatch, nearBottom } from "/rc/scroll.mjs"
import { setStrings } from "/rc/i18n.mjs"
import { showToast } from "/rc/toast.mjs"
import { createMeChatComposer, FLAG_KEYS, SEARCH_CSS, injectStylesheet } from "./views-me-chat-composer.mjs"
import { createAskCards } from "./views-me-chat-cards.mjs"
import { createSessionBar, createSessionDialogs } from "./views-me-chat-sessions.mjs"
import { createSubAgentFace } from "./views-me-chat-subs.mjs"
import { openPullModal } from "./views-me-chat-pull.mjs"
import { ZH_CORE } from "./i18n-zh-core.mjs"
import { EN_CORE } from "./i18n-en-core.mjs"
import { argsText, messageNodes, parseFrame, resultText, splitLines } from "./views-me-chat-messages.mjs"

/** 拉取面两纯件（单源 = `views-me-chat-pull.mjs`——本档兼容重导出：旧测试面零改；member-pull-inline-cred 批外拆）。 */
export { PULL_POLL_MS, pullDetailText, pullStateLabel } from "./views-me-chat-pull.mjs"

let renderGeneration = 0 // 重渲代际（重渲 ⇒ 在途读流中止）
let detachScrollFace = null // 滚动面收口（重渲前先撤上一实例监听——核 `createPinWatch.detach` + 页内 scroll 桥；零累积）
let detachBarFace = null // 会话条收口（点外关闭监听——同上口径）
const PIN_FLAG = "_meChatFollowPin" // 跟底旗标宿主键（核 `createPinWatch` 读写面——本页私有；缺省 = 跟底）
let liveSearch = null // 当刻代搜索面 `{ mount, search }`（跨代静音闸单例读点——本页离场 ⇒ `mount.isConnected` 假 ⇒ 闸零动作）
const coreStrings = () => (langTag() === "en" ? EN_CORE : ZH_CORE) // 核件词面部件（当前语言别持——门面同源档）

/** 跨代静音闸（**模块级单例——零累积**）：核 `createSearch` 无 dispose（Ctrl+F 监注册不可撤）⇒ 旧代实例会在 Ctrl+F 时抢当刻 `#search-bar`（跨实例共用单条 id——首开者持输入面闭包）。
 *  **收窄两层**：① 只认 Ctrl+F 一键（其余键位全放行——不得压全档键盘：Enter 发送 ∥ 各页键面）；② 只在本页在场时动作（离场后他页 Ctrl+F 不受扰）；拦后由**当刻代**显式开面（核监听连同旧代一并被停——同拍结果）。 */
document.addEventListener("keydown", (event) => {
  if (event.key !== "f" || !event.ctrlKey || event.altKey || event.metaKey || event.shiftKey) return
  if (liveSearch === null || liveSearch.mount.isConnected !== true) return
  event.preventDefault(); event.stopPropagation()
  liveSearch.search.openSearch()
}, true)

/** 我的·对话页（非壳页——`SHELL_PAGES` 五路径不动；先建壳，后异步取数）。 */
export async function renderMeChat(ctx, mount) {
  const { h } = ctx
  const generation = ++renderGeneration; setStrings(coreStrings()) // 核件词面装订（装配期 ∥ 语言切换重挂本页 ⇒ 重注册——核 i18n 模块级态）
  let workspaces = [] // `GET /api/me/sandbox/workspaces` 行（盒态读数源）
  let sessions = [] // `GET /api/me/chat/sessions` 行（盒内清单——离线盒的会话不列）
  let activeId = null
  let detail = null // 详情回执（读时单源）；当刻会话行 = 列表行优先（`activeRow`）
  let startingId = null // 启动在飞工作区（读数「启动中」+ 钮禁用；落定后刷新读数）
  let wsFailed = false // 工作区读面失败（⇒ 引导块显错态 + 重试——零误造「无工作区」）
  let pickedWsId = null // 📁 显式选定的工作区（列表范围 + 新会话预选；缺省 = 当刻会话所属 ∥ 首个）
  let liveBlock = null // 活流当步块（核 `renderBlock`——一步一块：`turn` 帧开合）∥ 当步文本泡（有文本才建）∥ 当步推理块 ∥ 当步工具卡指针
  let liveBubble = null
  let liveRaw = ""
  let liveReasoning = null // 当步推理内容区（核 `renderReasoning` 返回 `content`——重渲目标）
  let liveReasoningRaw = ""
  let liveTools = new Map()
  let turnLabeled = false // 一回合一个助手标签（本回合已画 ⇒ 真）
  let reasoningWrite = null // 在飞档位写（单变量串行——发送前 await；选中即改 ⇒ 下回合生效——KD-SV-111 同口径）

  mount.append(h("h2", { text: t("me.chat.title") }))
  // ① 会话条（sticky 顶：工作区读数 + 自绘会话下拉 + 新会话/启动/拉取/重读/📁——外拆件 `sessions.mjs`）
  if (detachBarFace !== null) { detachBarFace(); detachBarFace = null } // 重渲（语言切换）⇒ 旧实例监听先撤
  const bar = createSessionBar(ctx, {
    onSelect: (id) => selectChat(id),
    onNewSession: () => dialogs.openNewSession(),
    onStartWorkspace: () => { void startWorkspace() },
    onPull: () => openPull(),
    onReread: () => { if (activeId !== null) { composer.resetTurn(); void loadDetail(activeId) } },
    onRename: (id, title) => renameSession(id, title),
    onDelete: (id) => deleteSession(id),
    onPickWorkspace: (id) => pickWorkspace(id),
  })
  detachBarFace = bar.detach
  mount.append(bar.el)
  // 会话起点面（建工作区 ∥ 新会话（预选 = 当刻工作区）∥ 四相引导——同档第二工厂；拆档缘由同会话条）
  const dialogs = createSessionDialogs(ctx, {
    workspaces: () => workspaces, shownWorkspace, wsFailed: () => wsFailed, scopedCount: () => scopedSessions().length, startingId: () => startingId,
    reload, onWorkspaceCreated: async () => { await loadWorkspaces(); renderThread() }, onSessionListChanged: loadSessions,
    onSessionCreated: (id) => selectChat(String(id)), onStart: () => { void startWorkspace() }, onPull: () => openPull(),
  })
  // ② 消息流（文档流平铺——无卡无框；无会话时 = 四相引导块）∥ 子代理活动区（区尾出生；归档入流尾追）∥ ③④ 输入区（核件全件消费）
  const threadBox = h("div", { class: "chat-thread" })
  const subs = createSubAgentFace(ctx, {
    thread: () => threadBox, onAbortKey: (key) => abortSub(key), onChanged: () => composer.refreshStatus(), onFail: (error) => ctx.fail(error),
  })
  const cards = createAskCards(ctx, {
    thread: () => threadBox, sessionId: () => activeId, respond: (path, body) => ctx.api(path, { method: "POST", body }),
    onAnswered: (frame) => { if (typeof frame?.owner === "string" && frame.owner !== "") subs.approvalHead(frame.owner, null) }, // 应答 ⇒ 块头清态
    onFail: (error) => ctx.fail(error), onChanged: () => composer.refreshStatus(), focusInput: () => composer.inputEl.focus(),
  })
  mount.append(threadBox, subs.activity)
  const composer = createMeChatComposer(ctx, {
    root: mount, currentChat, onSend, onAbort, onEcho, onNewChat, onHelp, onSelectModel, onSelectReasoning, onSelectFlag,
    onModels: () => ctx.api("/api/me/chat/models"), onAtComplete, onOpenSettings: () => ctx.navigate("/me/account"),
    flagsOf: () => activeRow()?.flags ?? null, readings: pageReadings,
  })
  // 会话内搜索（核 `createSearch` 单源——Ctrl+F 随工厂注册；样式 = 核 `search.css`）
  injectStylesheet(SEARCH_CSS)
  liveSearch = { mount, search: createSearch({ root: threadBox }) } // 当刻代读点（跨代静音闸单例读此——见模块级闸）
  // 复制钮降级形（条件 = TLS）：核件挂钮（`attachCopyButtons`）+ 本页捕获阶段拦截——无 `navigator.clipboard`（http 无安全上下文）⇒ toast + 阻断（核 catch 面零反馈 ⇒ 页补）；TLS 后拦截自动失效（零改）
  const clipboardReady = () => typeof navigator !== "undefined" && navigator.clipboard !== null && navigator.clipboard !== undefined && typeof navigator.clipboard.writeText === "function"
  threadBox.addEventListener("click", (event) => {
    if (clipboardReady()) return
    const btn = typeof event.target?.closest === "function" ? event.target.closest(".code-copy-btn") : null
    if (btn === null) return
    event.preventDefault(); event.stopPropagation()
    showToast(t("me.chat.copyUnavailable")) // 降级形单源 = 核 toast（§3.11(6)）——零闪条（设计单源 = `agent/MEMBER-AGENT.md` §3.11(6)）
  }, true)
  // 滚动（核件单源：`applyPin` 写口 ∥ `createPinWatch` 旗标维护——上滚不夺阅读位；作用元素 = 文档流滚动元素，事件桥同管理面）
  if (detachScrollFace !== null) { detachScrollFace(); detachScrollFace = null } // 重渲（语言切换）⇒ 旧实例监听先撤
  const scrollEl = document.scrollingElement ?? document.documentElement; scrollEl[PIN_FLAG] = true
  const pinWatch = createPinWatch(scrollEl, { flagKey: PIN_FLAG }); pinWatch.attach()
  const onScroll = () => { pinWatch.set(nearBottom(scrollEl)) }
  document.addEventListener("scroll", onScroll, { passive: true }); detachScrollFace = () => { pinWatch.detach(); document.removeEventListener("scroll", onScroll) }
  const followPinned = () => applyPin(scrollEl, scrollEl[PIN_FLAG]) // 跟底写（旗标门——上滚阅读期间零写）
  const pinBottom = () => { scrollEl[PIN_FLAG] = true; applyPin(scrollEl, true) } // 显式回底（选中/重读）
  /** 流式重渲器（核件单源）：`token()`/`reasoning()` 帧内现取指针（缺 ⇒ null）；`subScroll` 逐块跟滚；帧尾 = 旗标门跟底。 */
  const streamRenderer = createStreamRenderer({
    token: () => (liveBubble === null ? null : { el: liveBubble, raw: liveRaw }),
    reasoning: () => (liveReasoning === null ? null : { el: liveReasoning, raw: liveReasoningRaw }),
    subScroll: (blocks) => { for (const block of blocks) subs.followBlock(block) },
    frameEnd: () => followPinned(),
  })
  // ── 会话条读数与重渲（§2.2 差异②⑨）─────────────────────────────────────────
  /** 当刻会话行（列表行优先——PATCH/列表回执；缺 ⇒ 详情回执）∥ 当前会话（composer 面）。 */
  function activeRow() {
    if (activeId === null) return null
    const row = sessions.find((item) => String(item.id) === activeId)
    return row !== undefined ? row : detail?.session ?? null
  }
  function currentChat() {
    const row = activeRow()
    return row === null ? null : { id: row.id, model: row.model, reasoning: row.reasoning ?? null }
  }
  /** 会话条所示工作区（📁 显式选定 ∥ 当刻会话所属 ∥ 缺省首个）∥ 是否需就地形启动（盒未运行 ∥ 未连接——差异③）。 */
  function shownWorkspace() {
    const picked = pickedWsId === null ? undefined : workspaces.find((item) => String(item.id) === String(pickedWsId))
    if (picked !== undefined) return picked
    const row = activeRow()
    const id = row !== null && row.workspaceId !== undefined && row.workspaceId !== null ? String(row.workspaceId) : null
    return (id === null ? undefined : workspaces.find((item) => String(item.id) === id)) ?? workspaces[0] ?? null
  }
  function needStart() {
    const ws = shownWorkspace() // 是否需就地形启动：盒未运行 ∥ 未连接（差异③）
    return ws === null ? false : (ws.boxState !== "running" || activeRow()?.agentOnline === false)
  }
  /** 选择器范围（📁 选定后 = 该工作区会话；缺省 = 全部——「切换 ⇒ 列表范围随」）。 */
  function scopedSessions() {
    const id = pickedWsId; if (id === null) return sessions
    return sessions.filter((row) => String(row.workspaceId ?? "") === String(id))
  }
  /** 页内段读（状态行段 10–12 ∥ 17——逐帧现取；缺源 ⇒ 零段）：计划旗 ∥ 在决 ask 数 ∥ 挂起池 ∥ 标题（`title` 非空顶行、缺 ⇒ `excerpt`）。 */
  function pageReadings() {
    const pool = subs.pool(); const row = activeRow()
    const title = row === null ? "" : (String(row.title ?? "").trim() !== "" ? String(row.title).trim() : String(row.excerpt ?? "").trim())
    return { planMode: row?.flags?.planMode === true, approvalCount: cards.pendingCount(), suspRunning: pool.running, suspSettled: pool.settled, title }
  }

  /** 会话条重渲（读数 ∥ 下拉行集 ∥ 钮显隐与门）⇒ 输入区钮面随正（模型字 ∥ 四旗镜像 ∥ 状态行）。 */
  function renderBar() {
    bar.render({ workspaces, sessions: scopedSessions(), activeId, startingId, ws: shownWorkspace(), row: activeRow(), needStart: needStart() })
    composer.syncModel() // 当刻会话模型 ⇒ 核模型钮面字； composer.syncFlags() // 四旗镜像重派生（行 `flags` 真源）； composer.refreshStatus()
  }
  /** 选中会话（选择器随正 + 取详情——读时读；盒离线 ⇒ 就地人话，非静默）∥ 子代理面随会话复位（跨会话零残留）。 */
  function selectChat(sessionId) {
    activeId = sessionId; detail = null; subs.reset(); cards.clear()
    renderBar(); void loadDetail(sessionId)
  }
  /** 📁 工作区切换（§3.11(6) 第 21 项）：范围随 + 新会话预选 + **零残留选择**（当刻会话出界 ⇒ 清选并落区间首行）。 */
  function pickWorkspace(workspaceId) {
    pickedWsId = String(workspaceId)
    const scoped = scopedSessions()
    if (activeId !== null && scoped.every((row) => String(row.id) !== activeId)) { activeId = null; detail = null; subs.reset(); cards.clear() }
    renderBar(); renderThread()
    if (activeId === null && scoped.length > 0) selectChat(String(scoped[0].id))
  }
  /** 行内重命名（✎ ⇒ `PATCH …/:id { title }` ⇒ `session.rename`；失败 ⇒ 人话零改——回执无条件并入列表行）。 */
  async function renameSession(sessionId, title) {
    try {
      const data = await ctx.api(`/api/me/chat/sessions/${sessionId}`, { method: "PATCH", body: { title } })
      applyReceipt(data?.session); await loadSessions()
      return true
    } catch (error) { ctx.fail(error); return false }
  }
  /** 删除（✕ ⇒ 确认弹层 ⇒ `POST …/:id/delete { confirm: true }`；失败 ⇒ 弹层内人话——`confirmModal` 收口）。 */
  async function deleteSession(sessionId) {
    await ctx.api(`/api/me/chat/sessions/${sessionId}/delete`, { method: "POST", body: { confirm: true } })
    if (activeId === sessionId) { activeId = null; detail = null; subs.reset(); cards.clear() }
    await loadSessions(); renderThread(); return true
  }
  // ── 活流面（核件装配——**块 = 步**（`turn` 帧开合）∥ 块内嵌当步推理块与工具卡 ∥ 一回合一个助手标签）──

  /** 活流重置（回合起点 ∥ 重读）∥ 步收束（`turn` 帧到达 ⇒ 尾帧先画——rAF 未及者落地，零丢帧 ⇒ 步指针复位）。 */
  function liveReset() { liveBlock = null; liveBubble = null; liveRaw = ""; liveReasoning = null; liveReasoningRaw = ""; liveTools = new Map(); turnLabeled = false }
  function closeStep() { streamRenderer.flush(); liveBlock = null; liveBubble = null; liveRaw = ""; liveReasoning = null; liveReasoningRaw = "" }
  /** 步块随首内容建（核 `renderBlock`——`withLabel` = 本回合首个块；一步一块——不跨步 ∥ 不堆块尾）∥ 步内文本泡（**恒为块首子**）。 */
  function ensureBlock() {
    if (liveBlock !== null) return liveBlock
    liveBlock = renderBlock({ withLabel: turnLabeled === false })
    turnLabeled = true; appendLive(liveBlock)
    return liveBlock
  }
  function ensureBubble() {
    if (liveBubble !== null) return liveBubble
    liveBubble = h("div", { class: "bubble content" })
    const head = liveBlock.firstChild
    if (head !== null && head.classList?.contains("msg-label") === true) liveBlock.insertBefore(liveBubble, head.nextSibling)
    else liveBlock.prepend(liveBubble)
    return liveBubble
  }
  /** 对话区重渲（读时单源——`end` ⇒ 重读即此；无会话 ⇒ 四相引导）∥ 活流行入列（`end` ⇒ 重读整段替代）。
   *  复制钮随重读挂（核 `attachCopyButtons`——已挂者跳过；降级形 = 上方捕获拦截）。 */
  function renderThread() {
    liveReset()
    if (activeId === null || detail === null) { threadBox.replaceChildren(dialogs.guideNode()); return }
    const messages = Array.isArray(detail?.messages) ? detail.messages : []
    if (messages.length === 0) { threadBox.replaceChildren(h("p", { class: "hint", text: t("me.chat.threadEmpty") })); return }
    threadBox.replaceChildren(...messageNodes(ctx, messages)); attachCopyButtons(threadBox); pinBottom() // 重读径照旧：回底（显式动作——核写口）
    cards.remount() // 在决卡重挂区尾（表不变——防卡随回读装配被摘后失答；段 11 读数随）
  }
  function appendLive(node) {
    if (node === null || node === undefined) return
    threadBox.append(node); followPinned()
  }
  /** `delta` 帧（核流式画件——增量重渲 + 帧尾跟底；步块 ∥ 文本泡**同门**随首段非空白文本建）。 */
  function appendDelta(text) {
    liveRaw += String(text ?? "")
    if (liveRaw.trim() === "") return
    ensureBlock(); if (liveBubble === null) ensureBubble(); streamRenderer.markToken()
  }
  /** `reasoning` 帧（§3.11(1)——核 `renderReasoning` 块（默认展开）+ 核重渲器 `markReasoning`；无推理 ⇒ 零块）。 */
  function appendReasoning(text) {
    const chunk = String(text ?? "")
    if (chunk === "") return
    ensureBlock()
    if (liveReasoning === null) {
      const { el, content } = renderReasoning({})
      liveBlock.append(el)
      liveReasoning = content
      liveReasoningRaw = ""
    }
    liveReasoningRaw += chunk
    streamRenderer.markReasoning()
  }
  /** `call` 帧（核件建卡——**嵌当步块内**——不挂顶层 ∥ 不跨步）∥ `result` 帧（全文入卡：`content` ∥ 摘要——核件结算，失败判据单源）。 */
  function appendCall(frame) {
    ensureBlock()
    const name = String(frame.name ?? "")
    const { el: card, ref } = renderToolCard({ name, args: argsText(frame.args), id: String(frame.id ?? "") })
    liveTools.set(String(frame.id ?? ""), { ref, name })
    liveBlock.append(card)
    followPinned()
  }
  function applyResult(frame) {
    const entry = liveTools.get(String(frame.id ?? ""))
    if (entry === undefined) return
    const content = typeof frame.content === "string" && frame.content !== "" ? frame.content : null
    finishToolCard(entry.ref, entry.name, content ?? resultText(frame.summary, frame.ok))
    followPinned()
  }
  /** `toolOutput` 帧（§3.11(1)——核 `appendToolOutput` 就地尾追：首 chunk 清占位 ∥ O(1) 追加 ∥ 超 64K 截断停收）。 */
  function applyToolOutput(frame) {
    const entry = liveTools.get(String(frame.id ?? ""))
    if (entry === undefined) return
    appendToolOutput(entry.ref.b, String(frame.text ?? ""), { initial: t("tool.initial") })
    followPinned()
  }
  /** 视图帧分发（`turn` = 步界；`usage`/`end`/`tasks`/`compress`/`wait`/`ask`/`sub` 归状态行与两面件——`composer.applyFrame` 恒先收全帧）。 */
  function applyFrame(frame) {
    if (frame === null) return
    if (frame.type === "turn") { closeStep(); return }
    if (frame.type === "delta") { appendDelta(frame.text); return }
    if (frame.type === "reasoning") { appendReasoning(frame.text); return }
    if (frame.type === "call") { appendCall(frame); return }
    if (frame.type === "result") { applyResult(frame); return }
    if (frame.type === "toolOutput") { applyToolOutput(frame); return }
    if (frame.type === "ask") {
      if (typeof frame.owner === "string" && frame.owner !== "") subs.approvalHead(frame.owner, frame.tool ?? "") // 子代理门（块头审批态）
      cards.append(frame); return
    }
    if (frame.type === "sub") { subs.handle(frame); return }
  }
  // ── 装配面（composer 回调——输入区 ∥ 队列 ∥ 状态行）──────────────────────────

  /** 本地用户回声块（核 `buildUserMessage`——活流径；`hooks.onUserEcho` 出口）。 */
  function onEcho(text, ts) {
    if (activeId === null) return null
    const node = buildUserMessage(text, ts)
    appendLive(node); return node
  }
  /** 发一条并读流（单 POST + NDJSON 帧流）：返回 `{ accepted, ended }`。成员面体 = `{ content, images? }`（图列 dataURL 直通——视觉门拒 ⇒ 400 人话 + 草稿保留）。
   *  回合收尾（`end`）⇒ 摘残留卡（§3.11(2) 兜底结算）；ask 应答径 = `cards` 面。 */
  async function onSend(text, images = []) {
    if (activeId === null) { // 无会话发送 = 非静默引导（走查轮笔 3——原为静默丢弃）
      if (threadBox.querySelector(".need-session") === null) threadBox.append(h("p", { class: "hint error need-session", text: t("me.chat.needSession") }))
      return { accepted: false, ended: false }
    }
    await reasoningWrite // 在飞档位写落地（选中即改 ⇒ 本回合生效——单变量串行；无在飞 ⇒ 直过）
    const sessionId = activeId
    liveReset()
    let response = null
    const body = images.length === 0 ? { content: text } : { content: text, images }
    try {
      response = await fetch(`/api/me/chat/sessions/${sessionId}/messages`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) })
    } catch (error) { ctx.fail(error); return { accepted: false, ended: false } }
    if (!response.ok) { // 信封拒（409 盒离线 ∥ 400 在途/空体/非视觉模型 ∥ 404）⇒ 就地人话（服务端 message 含指引）+ 草稿还原
      let envelope = null
      try { envelope = await response.json() } catch { /* 无 JSON 体 ⇒ 以状态判 */ }
      const error = new Error(envelope?.error?.message ?? t("app.httpFailed", { status: response.status }))
      error.status = response.status
      error.code = envelope?.error?.code ?? null
      ctx.fail(error)
      return { accepted: false, ended: false }
    }
    let reader = null
    try { reader = response.body.getReader() } catch { ctx.flash(t("me.chat.streamBroken")); return { accepted: true, ended: false } } // 200 无流体（角落）⇒ 就地人话
    const decoder = new TextDecoder()
    let buffer = ""
    let ended = null
    /** 帧落地：状态行恒收（本流所向——读数面）；视图面加卫（切走 ⇒ 丢帧不串台）；收尾帧 ⇒ 清残留卡（本流面）。 */
    const land = (line) => {
      const frame = parseFrame(line)
      if (frame === null) return
      composer.applyFrame(frame)
      if (frame.type === "end") { ended = frame; if (activeId === sessionId) cards.clear() } // 他会话收尾不得摘当刻卡（同下行视图分发的会话卫）
      else if (activeId === sessionId) applyFrame(frame)
    }
    try {
      for (;;) {
        if (generation !== renderGeneration || mount.isConnected === false) { // 重渲/离页 ⇒ 读流中止（回合仍在盒内执行）
          try { await reader.cancel() } catch { /* 已关 */ }
          return { accepted: true, ended: false }
        }
        const { value, done } = await reader.read()
        if (done) break
        const split = splitLines(buffer, decoder.decode(value, { stream: true }))
        buffer = split.rest
        for (const line of split.lines) land(line)
      }
      for (const line of splitLines(buffer, "").lines) land(line) // 末帧无换行收尾
    } catch {
      streamRenderer.flush() // 断连：已到文本落地（尾帧兜底——已画者零重复）
      ctx.flash(t("me.chat.streamBroken"))
      return { accepted: true, ended: false }
    }
    streamRenderer.flush() // 回合尾同步尾帧（rAF 未及——重读置换前必须画出）
    attachCopyButtons(threadBox) // 复制钮随新内容挂（核件单源；已挂者跳过）
    if (ended !== null && activeId === sessionId) await loadDetail(sessionId) // `end` ⇒ 重读（读时单源；切走 ⇒ 不抳）
    return { accepted: true, ended: ended !== null }
  }
  /** 请求中止在途回合：`POST …/abort`（`key` 缺 = 整回合——停单件径见 `abortSub`）；终态经流/重读呈现（本行零副作用）。 */
  async function onAbort() {
    if (activeId === null) return
    try { await ctx.api(`/api/me/chat/sessions/${activeId}/abort`, { method: "POST", body: {} }) } catch (error) { ctx.fail(error) }
  }
  /** 停单个子代理（块 ⏹ ⇒ `POST …/abort { key }`——§3.11(5)；key = `<role>#<id>`）。 */
  async function abortSub(key) {
    if (activeId === null || key === "") return
    try { await ctx.api(`/api/me/chat/sessions/${activeId}/abort`, { method: "POST", body: { key } }) } catch (error) { ctx.fail(error) }
  }
  /** PATCH 回执并入读数面（列表行优先——`activeRow` 判据；行形 = 列表行同源）⇒ 钮面字/选择器行随新值（零回退）。 */
  function applyReceipt(session) {
    if (session === null || session === undefined) return
    const id = String(session.id)
    sessions = sessions.map((item) => (String(item.id) === id ? { ...item, ...session } : item)) // 列表行（`activeRow` 优先面）
    if (String(detail?.session?.id) === id) detail.session = { ...detail.session, ...session } // 详情回执随正
    renderBar()
  }

  /** 换模型（明选即换、下回合生效）：`PATCH …/:id` 一条 ⇒ 回执落读数面；失败 ⇒ 就地人话 + 钮面回退（`composer` 面重派生）。 */
  async function onSelectModel(model) {
    if (activeId === null || model === "") return false
    try {
      const data = await ctx.api(`/api/me/chat/sessions/${activeId}`, { method: "PATCH", body: { model } })
      applyReceipt(data?.session)
      return true
    } catch (error) { ctx.fail(error); return false }
  }
  /** 设档位（会话级归属）：`PATCH …/:id { reasoning }` 一次一件；连写按序串行（单变量链——`onSend` 发送前 await 尾）。 */
  function onSelectReasoning(reasoning, sessionId = activeId) { // 会话 id 随拾取捕获（链式调用晚于拾取——不可迟读 `activeId`）
    if (sessionId === null || reasoning === "") return false
    const write = (reasoningWrite ?? Promise.resolve()).then(() => ctx.api(`/api/me/chat/sessions/${sessionId}`, { method: "PATCH", body: { reasoning } }))
    reasoningWrite = write.then(() => {}, () => {}) // 尾链吞错（不阻断后续 ∥ 发送前 await 不炸）
    return write.then((data) => { applyReceipt(data?.session); return true }, (error) => { ctx.fail(error); return false }) // 回执无条件并入列表行（按 id 自筛）——切走后回切亦不示旧值；详情写自带 id 卫
  }
  /** 四旗写（§3.11(3)）：`PATCH …/:id { <旗> }` **一次一件**（核槽写面四件在盒内）；回执并入行 ⇒ 显示面重派生（失败 ⇒ 旧值回弹——`composer.syncFlags()` 回读行值）。 */
  async function onSelectFlag(name, value) {
    if (activeId === null || FLAG_KEYS.includes(name) === false) return false
    try {
      const data = await ctx.api(`/api/me/chat/sessions/${activeId}`, { method: "PATCH", body: { [name]: value === true } })
      applyReceipt(data?.session)
      return true
    } catch (error) { ctx.fail(error); return false }
  }
  /** `@` 文件引用桥（§3.11(6)）：取候选（`GET …/chat/files`——盒 `cmd files.list`）⇒ `atResults` 回推核件面板（两列）。 */
  async function onAtComplete(payload) {
    const ws = shownWorkspace()
    const raw = String(payload?.query ?? "")
    const query = raw.startsWith("@") ? raw.slice(1) : raw
    if (ws === null) { composer.pushMessage({ type: "atResults", matches: [] }); return }
    try {
      const data = await ctx.api(`/api/me/chat/files?workspaceId=${encodeURIComponent(String(ws.id))}&q=${encodeURIComponent(query)}`)
      composer.pushMessage({ type: "atResults", matches: Array.isArray(data?.files) ? data.files : [] })
    } catch (error) { ctx.fail(error); composer.pushMessage({ type: "atResults", matches: [] }) }
  }
  /** 新会话（斜径 `/new` 同门）∥ `/help` 行集就地打印（核 `formatHelp` 产物——本页只落件，零第二清单）。 */
  function onNewChat() { dialogs.openNewSession(); return true }
  function onHelp(rows) {
    const lines = (Array.isArray(rows) ? rows : []).map((row) => String(row?.text ?? "")).filter((text) => text !== "")
    if (lines.length === 0) return false
    appendLive(h("div", { class: "message notice", text: lines.join("\n") })); return true
  }
  // ── 工作区动作（§2.2 差异③——建 ∥ 启动 ∥ 拉仓）─────────────────────────────

  /** 启动工作区（就地形动作）：`POST …/workspaces/:id/start` ⇒ 读数刷新（盒态 + 连接态分离——重建窗口可见）。 */
  async function startWorkspace() {
    const ws = shownWorkspace()
    if (ws === null || startingId !== null) return
    startingId = ws.id
    renderBar()
    try { await ctx.api(`/api/me/sandbox/workspaces/${ws.id}/start`, { method: "POST", body: {} }) }
    catch (error) { ctx.fail(error) }
    startingId = null
    await loadWorkspaces(); await loadSessions() // 在线态随动（壳连接挂上后 `agentOnline` 转真——两读数分离）
    renderThread()
  }
  /** 拉取弹窗（外拆件 `views-me-chat-pull.mjs` 面——拉取 + 凭据就地绑 KD-SV-215）：当刻工作区点选时解析（零闭包捕获）。 */
  const openPull = () => {
    const ws = shownWorkspace()
    if (ws === null) return
    openPullModal(ctx, { wsId: ws.id })
  }
  // ── 取数 ───────────────────────────────────────────────────────────────────

  /** 错态行（提示句 + 重试钮——详情/列表/引导三处同形，零第二形）。 */
  const failHint = (textKey, action) => h("p", { class: "hint error" }, t(textKey), " ",
    h("button", { type: "button", class: "tiny", text: t("me.chat.retry"), onclick: action }))
  /** 会话详情（读时读——`detail` 单源：消息流 ∥ 工具卡 ∥ notice 皆自此渲染）∥ 会话列表（盒内清单——离线盒的会话不列）。 */
  async function loadDetail(sessionId) {
    threadBox.replaceChildren(h("p", { class: "hint", text: t("common.loading") }))
    try {
      const data = await ctx.api(`/api/me/chat/sessions/${sessionId}`)
      if (generation !== renderGeneration) return
      detail = data
      renderThread()
      renderBar()
    } catch (error) {
      if (generation !== renderGeneration) return
      detail = null; ctx.fail(error)
      threadBox.replaceChildren(failHint("me.chat.detailFailed", () => { void loadDetail(sessionId) }))
    }
  }
  async function loadSessions() {
    try {
      const data = await ctx.api("/api/me/chat/sessions")
      if (generation !== renderGeneration) return
      sessions = Array.isArray(data?.sessions) ? data.sessions : []
      renderBar()
      renderThread()
      if (activeId === null) { // 进页即当刻会话（倒序首行 = 最近——范围 = 当刻工作区）
        const first = scopedSessions()[0]
        if (first !== undefined) selectChat(String(first.id))
      }
    } catch (error) {
      if (generation !== renderGeneration) return
      sessions = []; ctx.fail(error)
      renderBar()
      threadBox.replaceChildren(failHint("me.chat.listFailed", () => { void reload() }))
    }
  }
  /** 工作区读数（盒态 ∥ 回收原因——`GET /api/me/sandbox/workspaces`）∥ 重读全量（「重试」落点）。 */
  async function loadWorkspaces() {
    try {
      const data = await ctx.api("/api/me/sandbox/workspaces")
      if (generation !== renderGeneration) return
      workspaces = Array.isArray(data?.workspaces) ? data.workspaces : []
      wsFailed = false
    } catch (error) {
      if (generation !== renderGeneration) return
      workspaces = []; wsFailed = true
      ctx.fail(error)
    }
    renderBar()
  }
  async function reload() {
    await loadWorkspaces(); await loadSessions(); renderThread()
  }

  renderBar()
  await reload()
  void composer.refreshModels() // 模型候选取数（核菜单源——失败零候选，面板留「加载模型…」面）
}
