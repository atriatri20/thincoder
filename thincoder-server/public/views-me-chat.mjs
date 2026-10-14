/**
 * views-me-chat.mjs — 我的·对话（`webui/CHAT.md` §2.2——`#/me/chat`；机制全文 = `agent/MEMBER-AGENT.md`；member-face-chat 批——台账 #1215）：
 * **页四段** = 会话条 sticky 顶 ∥ 消息流文档流 ∥ 状态行 + 输入区 sticky 底——四轴沿 §2.1（同款核件消费 ∥ 同款帧读 ∥ 同款状态行段表 ∥ notice 五值 + `"box_lost"` 第六值；零 `.card` 面）。
 * **成员差异六条**：① 取数面 = `/api/me/chat/*` + `/api/me/sandbox/*`；② 工作区维度（会话条示工作区名 + 盒态 + `agentOnline`；新会话选工作区——一枚 ⇒ 零选择）；③ 盒态动作（就地启动 ∥ 拉仓四态人话；待批不得静默）；
 * ④ 无源钮收窄（五枚 CSS + 主机凭据钮不设）；⑤ notice 六值；⑥ 档位面（核菜单 ⇒ `PATCH …/:id { reasoning }`）。会话源 = 盒内（KD-SV-152）——盒离线 ⇒ 409（就启动引导，非静默）。
 *
 * 取数：列表/详情 = `GET …/sessions[/:id]`（读时读）∥ 发送 = `POST …/:id/messages`（体 = `{ content }`；**流式不走 `ctx.api`**——页面自持 `fetch` 逐行读 NDJSON）∥
 * 中止/换模型/设档 = `POST …/abort` ∥ `PATCH …/:id`；模型候选 = `GET …/models`；工作区 = `GET …/sandbox/workspaces` + 建/启/拉。断连/离页 = 读流中止（回合仍在盒内执行）。直测面 = `renderMeChat` + `pullStateLabel`。
 */
import { mapError, t, langTag } from "./i18n.mjs"
import { field, openModal, showNote } from "./modal.mjs"
import { buildUserMessage, renderBlock } from "/rc/flow/block.mjs"
import { finishToolCard, renderToolCard } from "/rc/flow/tool-card.mjs"
import { createStreamRenderer } from "/rc/flow/stream.mjs"
import { applyPin, createPinWatch, nearBottom } from "/rc/scroll.mjs"
import { setStrings } from "/rc/i18n.mjs"
import { createMeChatComposer } from "./views-me-chat-composer.mjs"
import { boxStateClass, boxStateLabel, pendingHostOf, stopReasonLabel } from "./views-me-sandbox.mjs"
import { ZH_CORE } from "./i18n-zh-core.mjs"
import { EN_CORE } from "./i18n-en-core.mjs"
import { argsText, messageNodes, parseFrame, resultText, splitLines } from "./views-me-chat-messages.mjs"

/** 拉取状态轮询间隔（读时轮询——服务端 = 进程内存读数；窗口短，2s 量级足）∥ 四态文案键（§2.2 差异③「四态人话」——枚举外 ⇒ `null`＝原值兜底）。 */
export const PULL_POLL_MS = 2000
const PULL_STATE_KEYS = { queued: "me.chat.pullQueued", running: "me.chat.pullRunning", done: "me.chat.pullDone", failed: "me.chat.pullFailed" }
/** 拉取状态文案（纯函数）：四值命中 ⇒ 文案 ∥ 枚举外 ⇒ `null`（零假造）。 */
export function pullStateLabel(state) {
  const key = PULL_STATE_KEYS[state]
  return key === undefined ? null : t(key)
}

let renderGeneration = 0 // 重渲代际（重渲 ⇒ 在途读流中止）
let detachScrollFace = null // 滚动面收口（重渲前先撤上一实例监听——核 `createPinWatch.detach` + 页内 scroll 桥；零累积）
const PIN_FLAG = "_meChatFollowPin" // 跟底旗标宿主键（核 `createPinWatch` 读写面——本页私有；缺省 = 跟底）
const coreStrings = () => (langTag() === "en" ? EN_CORE : ZH_CORE) // 核件词面部件（当前语言别持——门面同源档）

/** 我的·对话页（非壳页——`SHELL_PAGES` 五路径不动；先建壳，后异步取数）。 */
export async function renderMeChat(ctx, mount) {
  const { h } = ctx
  const generation = ++renderGeneration
  setStrings(coreStrings()) // 核件词面装订（装配期 ∥ 语言切换重挂本页 ⇒ 重注册——核 i18n 模块级态）
  let workspaces = [] // `GET /api/me/sandbox/workspaces` 行（盒态读数源）
  let sessions = [] // `GET /api/me/chat/sessions` 行（盒内清单——离线盒的会话不列）
  let activeId = null
  let detail = null // 详情回执（读时单源）；当刻会话行 = 列表行优先（`activeRow`）
  let startingId = null // 启动在飞工作区（读数「启动中」+ 钮禁用；落定后刷新读数）
  let wsFailed = false // 工作区读面失败（⇒ 引导块显错态 + 重试——零误造「无工作区」）
  let liveBlock = null // 活流当步块（核 `renderBlock`——一步一块：`turn` 帧开合）∥ 当步文本泡（有文本才建）∥ 当步工具卡指针
  let liveBubble = null
  let liveRaw = ""
  let liveTools = new Map()
  let turnLabeled = false // 一回合一个助手标签（本回合已画 ⇒ 真）
  let reasoningWrite = null // 在飞档位写（单变量串行——发送前 await；选中即改 ⇒ 下回合生效——KD-SV-111 同口径）

  mount.append(h("h2", { text: t("me.chat.title") }))
  // ① 会话条（sticky 顶：工作区读数 + 会话选择器 + 新会话/启动/拉取/重读）
  const wsInfo = h("span", { class: "chat-ws" })
  const selector = h("select", { class: "chat-select", "aria-label": t("me.chat.selectChat") })
  selector.addEventListener("change", () => {
    const picked = String(selector.value)
    if (picked !== "" && picked !== activeId) selectChat(picked)
  })
  const newBtn = h("button", { type: "button", text: t("me.chat.newSession"), onclick: () => openNewSessionModal() })
  const startBtn = h("button", { type: "button", text: t("me.chat.startWorkspace"), onclick: () => { void startWorkspace() } })
  const pullBtn = h("button", { type: "button", class: "tiny", text: t("me.chat.pull"), onclick: () => openPullModal() })
  const rereadBtn = h("button", { type: "button", class: "tiny", text: t("me.chat.reread"), disabled: true, onclick: () => { if (activeId !== null) { composer.resetTurn(); void loadDetail(activeId) } } })
  mount.append(h("div", { class: "chat-bar" }, wsInfo, selector, newBtn, startBtn, pullBtn, rereadBtn))
  // 待批提示（发起方可见——`sandbox/SANDBOX.md` §8；`pending` 在场 ⇒ 一行，裁定/超时 ⇒ 消失——不得静默）
  const pendingLine = h("p", { class: "pending-line", hidden: true })
  mount.append(pendingLine)
  // ② 消息流（文档流平铺——无卡无框；无会话时 = 四相引导块）∥ ③④ 输入区（核件全件消费）
  const threadBox = h("div", { class: "chat-thread" })
  mount.append(threadBox)
  const composer = createMeChatComposer(ctx, {
    root: mount, currentChat, onSend, onAbort, onEcho, onNewChat, onHelp, onSelectModel, onSelectReasoning, onModels: () => ctx.api("/api/me/chat/models"),
  })
  // 滚动（核件单源：`applyPin` 写口 ∥ `createPinWatch` 旗标维护——上滚不夺阅读位；作用元素 = 文档流滚动元素，事件桥同管理面）
  if (detachScrollFace !== null) { detachScrollFace(); detachScrollFace = null } // 重渲（语言切换）⇒ 旧实例监听先撤
  const scrollEl = document.scrollingElement ?? document.documentElement
  scrollEl[PIN_FLAG] = true
  const pinWatch = createPinWatch(scrollEl, { flagKey: PIN_FLAG })
  pinWatch.attach()
  const onScroll = () => { pinWatch.set(nearBottom(scrollEl)) }
  document.addEventListener("scroll", onScroll, { passive: true })
  detachScrollFace = () => { pinWatch.detach(); document.removeEventListener("scroll", onScroll) }
  const followPinned = () => applyPin(scrollEl, scrollEl[PIN_FLAG]) // 跟底写（旗标门——上滚阅读期间零写）
  const pinBottom = () => { scrollEl[PIN_FLAG] = true; applyPin(scrollEl, true) } // 显式回底（选中/重读）
  /** 流式重渲器（核件单源）：`token()` 帧内现取文本泡指针（无泡 ⇒ null）；帧尾 = 旗标门跟底。 */
  const streamRenderer = createStreamRenderer({ token: () => (liveBubble === null ? null : { el: liveBubble, raw: liveRaw }), frameEnd: () => followPinned() })
  // ── 会话条读数与重渲（§2.2 差异②）───────────────────────────────────────────

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
  /** 会话条所示工作区（当刻会话所属 ∥ 缺省首个）∥ 是否需就地形启动（盒未运行 ∥ 未连接——差异③）。 */
  function shownWorkspace() {
    const row = activeRow()
    const id = row !== null && row.workspaceId !== undefined && row.workspaceId !== null ? String(row.workspaceId) : null
    return (id === null ? undefined : workspaces.find((item) => String(item.id) === id)) ?? workspaces[0] ?? null
  }
  function needStart() {
    const ws = shownWorkspace()
    if (ws === null) return false
    return ws.boxState !== "running" || activeRow()?.agentOnline === false
  }

  /** 会话条重渲（工作区读数 ∥ 选择器（工作区名 · 模型 · 摘要 · 时间）∥ 四钮显隐与门 ∥ 待批行）。 */
  function renderBar() {
    const ws = shownWorkspace()
    const row = activeRow()
    const nodes = []
    if (ws !== null) {
      nodes.push(h("span", { text: String(ws.name ?? "—") }))
      if (startingId === ws.id) nodes.push(h("span", { class: "badge warn", text: t("me.chat.stateStarting") }))
      else nodes.push(h("span", { class: boxStateClass(ws.boxState), text: boxStateLabel(ws.boxState) }))
      if (startingId !== ws.id && ws.stopReason !== null && ws.stopReason !== undefined) nodes.push(h("span", { class: "hint", text: stopReasonLabel(ws.stopReason) }))
      if (row !== null && typeof row.agentOnline === "boolean") nodes.push(h("span", { class: row.agentOnline ? "badge ok" : "badge off", text: t(row.agentOnline ? "me.chat.online" : "me.chat.offline") }))
    }
    wsInfo.replaceChildren(...nodes); wsInfo.hidden = nodes.length === 0
    selector.replaceChildren(...(sessions.length === 0
      ? [h("option", { value: "", text: t("me.chat.sessionsEmpty") })]
      : sessions.map((item) => h("option", {
        value: String(item.id),
        text: `${String(item.workspaceName ?? "")} · ${String(item.model ?? "")} · ${String(item.excerpt ?? "") === "" ? "—" : String(item.excerpt)} · ${ctx.fmtTs(item.updatedAt)}`,
      }))))
    if (activeId !== null) selector.value = activeId
    rereadBtn.disabled = activeId === null
    newBtn.hidden = workspaces.length === 0 // 无工作区 ⇒ 建引导承载（钮面无源 ⇒ 不设——收窄口径）
    startBtn.hidden = !needStart(); startBtn.disabled = startingId !== null
    pullBtn.hidden = ws === null
    composer.syncModel() // 当刻会话模型 ⇒ 核模型钮面字（显示面重派生——零槽写）
    const host = ws === null ? null : pendingHostOf(ws)
    pendingLine.hidden = host === null
    if (host !== null) pendingLine.textContent = t("me.sandbox.pending", { host })
  }

  /** 选中会话（选择器随正 + 取详情——读时读；盒离线 ⇒ 就地人话，非静默）。 */
  function selectChat(sessionId) {
    activeId = sessionId; detail = null
    renderBar()
    void loadDetail(sessionId)
  }
  // ── 四相引导（§2.2——无会话时的空态/引导面；有会话 ⇒ 直聊）────────────────────

  /** 引导块（提示句 + 动作行——`.chat-guide` 自持面；零 `.card`）∥ 当刻相判：读面失败 ⇒ 错态；无工作区 ⇒ ①；盒未运行 ⇒ ②（判据 = 盒态——§3.6 四相；「未连接」态的启动动作 = 会话条承载——`needStart`）；卷空 ⇒ ③。 */
  const guide = (textKey, actions, error = false) => h("div", { class: "chat-guide" },
    h("p", { class: error ? "hint error" : "hint", text: t(textKey) }), h("div", { class: "row-form" }, ...actions))
  function guideNode() {
    if (wsFailed) return guide("me.chat.listFailed", [h("button", { type: "button", class: "tiny", text: t("me.chat.retry"), onclick: () => { void reload() } })], true)
    if (workspaces.length === 0) return guide("me.chat.noWorkspace", [h("button", { type: "button", text: t("me.chat.createWorkspace"), onclick: () => openCreateWsModal() })])
    const ws = shownWorkspace()
    if (ws === null || ws.boxState !== "running") return guide("me.chat.wsBoxStopped", [h("button", { type: "button", text: t("me.chat.startWorkspace"), disabled: startingId !== null, onclick: () => { void startWorkspace() } })])
    return guide("me.chat.wsEmptyVolume", [h("button", { type: "button", text: t("me.chat.pull"), onclick: () => openPullModal() }), h("button", { type: "button", class: "tiny", text: t("me.chat.newSession"), onclick: () => openNewSessionModal() })])
  }
  // ── 活流面（核件装配——**块 = 步**（`turn` 帧开合）∥ 块内嵌当步工具卡 ∥ 一回合一个助手标签）──

  /** 活流重置（回合起点 ∥ 重读）∥ 步收束（`turn` 帧到达 ⇒ 尾帧先画——rAF 未及者落地，零丢帧 ⇒ 步指针复位）。 */
  function liveReset() { liveBlock = null; liveBubble = null; liveRaw = ""; liveTools = new Map(); turnLabeled = false }
  function closeStep() { streamRenderer.flush(); liveBlock = null; liveBubble = null; liveRaw = "" }
  /** 步块随首内容建（核 `renderBlock`——`withLabel` = 本回合首个块；一步一块——不跨步 ∥ 不堆块尾）∥ 步内文本泡（**恒为块首子**）。 */
  function ensureBlock() {
    if (liveBlock !== null) return liveBlock
    liveBlock = renderBlock({ withLabel: turnLabeled === false })
    turnLabeled = true
    appendLive(liveBlock)
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
  /** 对话区重渲（读时单源——`end` ⇒ 重读即此；无会话 ⇒ 四相引导）∥ 活流行入列（`end` ⇒ 重读整段替代）。 */
  function renderThread() {
    liveReset()
    if (activeId === null || detail === null) { threadBox.replaceChildren(guideNode()); return }
    const messages = Array.isArray(detail?.messages) ? detail.messages : []
    if (messages.length === 0) { threadBox.replaceChildren(h("p", { class: "hint", text: t("me.chat.threadEmpty") })); return }
    threadBox.replaceChildren(...messageNodes(ctx, messages)); pinBottom() // 重读径照旧：回底（显式动作——核写口）
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
  /** `call` 帧（核件建卡——**嵌当步块内**——不挂顶层 ∥ 不跨步）∥ `result` 帧（核件结算——失败判据单源）。 */
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
    finishToolCard(entry.ref, entry.name, resultText(frame.summary, frame.ok))
    followPinned()
  }
  /** 视图帧分发（`turn` = 步界；`usage`/`end` 归状态行面——`composer.applyFrame` 恒先收全帧）。 */
  function applyFrame(frame) {
    if (frame === null) return
    if (frame.type === "turn") { closeStep(); return }
    if (frame.type === "delta") { appendDelta(frame.text); return }
    if (frame.type === "call") { appendCall(frame); return }
    if (frame.type === "result") { applyResult(frame); return }
  }
  // ── 装配面（composer 回调——输入区 ∥ 队列 ∥ 状态行）──────────────────────────

  /** 本地用户回声块（核 `buildUserMessage`——活流径；`hooks.onUserEcho` 出口）。 */
  function onEcho(text, ts) {
    if (activeId === null) return null
    const node = buildUserMessage(text, ts)
    appendLive(node); return node
  }
  /** 发一条并读流（单 POST + NDJSON 帧流）：返回 `{ accepted, ended }`。成员面体 = `{ content }`（帧面无图片通道——§3.3 `run` 事件体裁；文本档已内联进 `content`）。 */
  async function onSend(text) {
    if (activeId === null) return { accepted: false, ended: false }
    await reasoningWrite // 在飞档位写落地（选中即改 ⇒ 本回合生效——单变量串行；无在飞 ⇒ 直过）
    const sessionId = activeId
    liveReset()
    let response = null
    try {
      response = await fetch(`/api/me/chat/sessions/${sessionId}/messages`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ content: text }) })
    } catch (error) { ctx.fail(error); return { accepted: false, ended: false } }
    if (!response.ok) { // 信封拒（409 盒离线 ∥ 400 在途/空体 ∥ 404）⇒ 就地人话（服务端 message 含指引）+ 草稿还原
      let body = null
      try { body = await response.json() } catch { /* 无 JSON 体 ⇒ 以状态判 */ }
      const error = new Error(body?.error?.message ?? t("app.httpFailed", { status: response.status }))
      error.status = response.status
      error.code = body?.error?.code ?? null
      ctx.fail(error)
      return { accepted: false, ended: false }
    }
    let reader = null
    try { reader = response.body.getReader() } catch { ctx.flash(t("me.chat.streamBroken")); return { accepted: true, ended: false } } // 200 无流体（角落）⇒ 就地人话
    const decoder = new TextDecoder()
    let buffer = ""
    let ended = null
    /** 帧落地：状态行恒收（本流所向——读数面）；视图面加卫（切走 ⇒ 丢帧不串台）。 */
    const land = (line) => {
      const frame = parseFrame(line)
      if (frame === null) return
      composer.applyFrame(frame)
      if (frame.type === "end") ended = frame
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
    if (ended !== null && activeId === sessionId) await loadDetail(sessionId) // `end` ⇒ 重读（读时单源；切走 ⇒ 不抳）
    return { accepted: true, ended: ended !== null }
  }
  /** 请求中止在途回合：`POST …/abort`；终态经流/重读呈现（本行零副作用）。 */
  async function onAbort() {
    if (activeId === null) return
    try { await ctx.api(`/api/me/chat/sessions/${activeId}/abort`, { method: "POST", body: {} }) } catch (error) { ctx.fail(error) }
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
  /** 新会话（斜径 `/new` 同门）∥ `/help` 行集就地打印（核 `formatHelp` 产物——本页只落件，零第二清单）。 */
  function onNewChat() { openNewSessionModal(); return true }
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
  /** 表单弹窗壳（三弹窗共用——`openModal` + `.provider-form.stacked` 既有族）：`onSubmit` 收 `{ note, submitBtn, modal }` 三件；
   *  `opts.submitKey` = 提交钮文案（缺省「创建」）· `opts.onClose` = 关闭回调（拉仓轮询收口）。 */
  function formModal(titleKey, fields, onSubmit, opts = {}) {
    const note = h("p", { class: "hint error", hidden: true })
    const submitBtn = h("button", { type: "submit", text: t(opts.submitKey ?? "me.chat.create") })
    const form = h("form", { class: "provider-form stacked", novalidate: true, onsubmit: (event) => { event.preventDefault(); void onSubmit({ note, submitBtn, modal }) } }, ...fields, note, submitBtn)
    const modal = openModal({ title: t(titleKey), body: h("div", {}, form), onClose: opts.onClose ?? null })
    return { modal, note, submitBtn }
  }
  /** 建工作区弹窗（相①——名称可选；缺省名服务端定；越限 ⇒ 窗内人话（含数字——服务端 message））。 */
  function openCreateWsModal() {
    const name = h("input", { type: "text", placeholder: t("me.chat.wsNamePh") })
    formModal("me.chat.createWorkspace", [field(h, "me.chat.wsNameLabel", name)], async ({ note, submitBtn, modal }) => {
      note.hidden = true
      submitBtn.disabled = true
      const value = name.value.trim()
      try {
        await ctx.api("/api/me/sandbox/workspaces", { method: "POST", body: value === "" ? {} : { name: value } })
        modal.close()
        await loadWorkspaces()
        renderThread()
      } catch (error) { submitBtn.disabled = false; showNote(note, mapError(error)) }
    })
  }
  /** 新会话弹窗（会话起点）：选工作区——一枚 ⇒ 零选择（仅示名）⇒ `POST /api/me/chat/sessions`（模型缺省 = 开放清单首个——服务端定）。 */
  function openNewSessionModal() {
    if (workspaces.length === 0) return // 无工作区 ⇒ 建引导承载（guide ①——零静默）
    let select = null
    const fields = []
    if (workspaces.length === 1) fields.push(h("p", { class: "hint", text: `${t("me.chat.workspaceLabel")}: ${String(workspaces[0]?.name ?? "—")}` })) // 一枚 ⇒ 零选择
    else {
      select = h("select", {}, ...workspaces.map((ws, index) => h("option", { value: String(index), text: String(ws?.name ?? "—") })))
      fields.push(field(h, "me.chat.workspaceLabel", select))
    }
    const picked = select
    formModal("me.chat.newSession", fields, async ({ note, submitBtn, modal }) => {
      note.hidden = true
      submitBtn.disabled = true
      const workspace = picked === null ? workspaces[0] : workspaces[Number(picked.value)]
      if (workspace === undefined) { submitBtn.disabled = false; return }
      try {
        const data = await ctx.api("/api/me/chat/sessions", { method: "POST", body: { workspaceId: workspace.id } })
        modal.close()
        await loadSessions()
        if (data?.session?.id !== undefined && data?.session?.id !== null) selectChat(data.session.id)
      } catch (error) { submitBtn.disabled = false; showNote(note, mapError(error)) } // 盒离线 ⇒ 409 人话（含启动指引——零静默）
    })
  }
  /** 拉仓弹窗（相③）：可见项目清单（`GET /api/projects?q=` 复用——含搜索）⇒ 提交 `POST …/pulls` ⇒ 状态轮询
   *  （queued/running/done/failed 四态人话；失败含目录冲突/出站被拒分类——服务端 `detail` 原文直呈 + 重试 = 复提交）。 */
  function openPullModal() {
    const ws = shownWorkspace()
    if (ws === null) return
    const search = h("input", { type: "search", placeholder: t("me.chat.pullSearchPh") })
    const select = h("select", {}, h("option", { value: "", text: t("common.loading") }))
    const dirInput = h("input", { type: "text", placeholder: t("me.chat.pullDirPh") })
    let projects = []
    let closed = false
    let timer = null
    const { modal, note, submitBtn } = formModal("me.chat.pull", [field(h, "me.chat.pullProject", search, select), field(h, "me.chat.pullDir", dirInput)],
      async () => { await submit() }, { submitKey: "me.chat.pullSubmit", onClose: () => { closed = true; if (timer !== null) clearTimeout(timer) } })
    submitBtn.disabled = true
    /** 项目清单取数（搜索随打随读——窗口小；空清单 ⇒ 提示项 + 提交门）。 */
    async function loadProjects(q) {
      try {
        const data = await ctx.api(`/api/projects?q=${encodeURIComponent(q)}`)
        if (closed) return
        projects = Array.isArray(data?.projects) ? data.projects : []
        select.replaceChildren(...(projects.length === 0
          ? [h("option", { value: "", text: t("me.chat.noProjects") })]
          : projects.map((project, index) => h("option", { value: String(index), text: String(project?.displayName ?? project?.address ?? "—") }))))
        submitBtn.disabled = projects.length === 0
      } catch (error) { if (closed) return; ctx.fail(error); showNote(note, mapError(error)) }
    }
    search.addEventListener("input", () => { void loadProjects(search.value) }); void loadProjects("")
    /** 提交（目标目录缺省 = 仓名——服务端定：留空零字段）∥ 状态轮询（读时——服务端进程内存读数；四态落位）。 */
    async function submit() {
      note.hidden = true
      const target = projects[Number(select.value)]
      if (target === undefined) return
      const dir = dirInput.value.trim()
      submitBtn.disabled = true
      try {
        const data = await ctx.api(`/api/me/sandbox/workspaces/${ws.id}/pulls`, { method: "POST", body: dir === "" ? { projectId: target.id } : { projectId: target.id, dir } })
        if (data?.pullId === undefined || data?.pullId === null) { submitBtn.disabled = false; showNote(note, t("me.chat.pullFailed")); return }
        showNote(note, t("me.chat.pullQueued"), false)
        await loadWorkspaces() // 待批提示随动（出站挂起 ⇒ 一行可见——不得静默）
        void poll(data.pullId)
      } catch (error) { submitBtn.disabled = false; showNote(note, mapError(error)) }
    }
    async function poll(pullId) {
      if (closed) return
      try {
        const data = await ctx.api(`/api/me/sandbox/workspaces/${ws.id}/pulls/${pullId}`)
        if (closed) return
        const state = String(data?.state ?? "")
        const detailText = String(data?.detail ?? "")
        if (state === "done") { modal.close(); ctx.flash(detailText === "" ? t("me.chat.pullDone") : `${t("me.chat.pullDone")}: ${detailText}`); return }
        if (state === "failed") { showNote(note, detailText === "" ? t("me.chat.pullFailed") : `${t("me.chat.pullFailed")}: ${detailText}`); submitBtn.disabled = false; return }
        showNote(note, pullStateLabel(state) ?? (detailText === "" ? state : detailText), false)
        void loadWorkspaces() // 待批窗（≤60s）内一行可见——判定单源 = `sandbox/SANDBOX.md` §8
        timer = setTimeout(() => { timer = null; void poll(pullId) }, PULL_POLL_MS)
      } catch (error) { if (closed) return; ctx.fail(error); showNote(note, mapError(error)); submitBtn.disabled = false }
    }
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
      if (activeId === null && sessions.length > 0) selectChat(sessions[0].id) // 进页即当刻会话（倒序首行 = 最近）
    } catch (error) {
      if (generation !== renderGeneration) return
      sessions = []; ctx.fail(error)
      renderBar()
      threadBox.replaceChildren(failHint("me.chat.listFailed", () => { void reload() }))
    }
  }
  /** 工作区读数（盒态 ∥ 回收原因 ∥ 待批——`GET /api/me/sandbox/workspaces`）∥ 重读全量（「重试」落点）。 */
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
