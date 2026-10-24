/**
 * views-chat.mjs — 管理·对话（`webui/CHAT.md` §2.1——`#/admin/chat`；机制全文 = `agent/ADMIN-AGENT.md` §11）：
 * **页四段**（会话条 sticky 顶 ∥ 消息流文档流 ∥ 状态行 + 输入区 sticky 底）——原三卡（会话卡/对话卡/输入卡）去卡片化（本页零 `.card` 面）。
 * 会话条（选择器 + 「新会话」 + 「主机凭据」（admin-chat-creds-merge 批——弹窗件 = `host-credential.mjs`，与沙盒页节点行动作**同件**） + 「重读」）∥ 消息装配（核 `flow/block.mjs`——回读归 `views-chat-messages.mjs` ∥ 活流本档）∥ NDJSON 帧分发
 * （`delta`/`call`/`result`/`turn`/`usage`/`end`）∥ 队列（待发泡/队首发起——承接归 `views-chat-composer.mjs`）∥ 新会话弹窗 ∥ 取数。
 * **活流按步交错**（console-chat-live-step 批——KD-SV-132/§2.1②）：**块 = 步**（`turn` 帧到达 ⇒ 上一步收束、新步起）；
 * 一步 = 该步文本泡（有文本才建）+ 该步工具卡组（随到随嵌——不堆块尾 ∥ 不跨步）；泡恒为块首子（结构插入——与到达序无关）。
 * 输入区与状态行 = `views-chat-composer.mjs`（核 `composer/panel.mjs` **全件消费**适配层——§2.1③④）。
 *
 * 呈现面单源（§2.1②——本页零自持渲染）：文本/块 = 核 `buildUserMessage`/`buildAssistantRestore`/`renderBlock`（md 归核）；
 * 工具卡 = 核 `renderToolCard`/`finishToolCard`（活）∥ `buildFinishedToolCard`（回读——嵌助手块内）；流式 = 核 `createStreamRenderer`；
 * 滚动 = 核 `applyPin`/`createPinWatch`（**作用元素 = `document.scrollingElement`**——文档流；`scroll` 事件投 `document` 而非元素
 * ⇒ 事件桥见下，判定与写口仍走核件）；核件词面 = `setStrings` 装订。
 *
 * 取数：列表/详情 = `GET /api/admin/agent/chats` ∥ `.../:id`（读时读）；发送 = `POST .../:id/messages`（体 = `{ content, images? }`）
 * ——**流式读取不走 `ctx.api`**（页面自持 `fetch` + `ReadableStream` 逐行读 NDJSON：`turn` ⇒ 步界 ∥ `delta` 追加当步泡 ∥
 * `call`/`result` 工具卡嵌当步块 ∥ `end` ⇒ 重读详情〔读时单源——重读与活流同形 ⇒ 置换零位差〕）；
 * 中止 = `POST .../:id/abort`；换模型 ∥ 设档位 = `PATCH .../:id`（明选即改、下回合生效——KD-SV-108/110）。
 * 断连/离页 = 读流中止（回合照跑——落库单源；回来「重读」即全量）；发送失败/流前错误 = 就地人话（`ctx.fail`——`mapError` 口径）。
 * 单元测试档直测面 = `renderChat` + 纯函数（`splitLines`/`parseFrame`/`argsText`/`noticeText`/`messageNodes`——外拆件本档**兼容重导出**，既有测试档零改）。
 */
import { mapError, t, langTag } from "./i18n.mjs"
import { openModal, showNote } from "./modal.mjs"
import { openHostCredentialPicker } from "./host-credential.mjs"
import { deriveModels } from "./views-models.mjs"
import { buildUserMessage, renderBlock } from "/rc/flow/block.mjs"
import { finishToolCard, renderToolCard } from "/rc/flow/tool-card.mjs"
import { createStreamRenderer } from "/rc/flow/stream.mjs"
import { applyPin, createPinWatch, nearBottom } from "/rc/scroll.mjs"
import { setStrings } from "/rc/i18n.mjs"
import { createChatComposer } from "./views-chat-composer.mjs"
import { createAskCards } from "./views-chat-cards.mjs"
import { ZH_CORE } from "./i18n-zh-core.mjs"
import { EN_CORE } from "./i18n-en-core.mjs"
import { argsText, messageNodes, noticeText, parseFrame, resultText, splitLines } from "./views-chat-messages.mjs"

// ── 消息面兼容重导出（外拆件 `views-chat-messages.mjs`——既有测试档**用例级**零改〔文件级随正清单在册〕；`resultText` = 件间内部件，不重导出）──
export { argsText, messageNodes, noticeText, parseFrame, splitLines }

/** 重渲代际（重渲 ⇒ 在途读流中止）+ 挂载点卫（离页 ＝ 路由卸载——`mount.isConnected === false`）——零全局清理钩子；
 *  沿 `views-sandbox.mjs` 先例（回合照跑——落库单源）。 */
let renderGeneration = 0

/** 跟底旗标宿主键（核 `createPinWatch` 读写面——本页私有；缺省 = 跟底）。 */
const PIN_FLAG = "_chatFollowPin"

/** 核件词面部件（当前语言别持——门面同源档；`langTag()` ⇒ `zh-CN` ∥ `en`）。 */
const coreStrings = () => (langTag() === "en" ? EN_CORE : ZH_CORE)

// ── 消息面（外拆件 `views-chat-messages.mjs`——帧面纯函数 ∥ notice/结果文案 ∥ 回读装配；兼容重导出见上）──

/** 新会话弹窗（模型下拉 = `deriveModels` 同源；缺省 = 最近一条会话所用模型——KD-SV-87「最近一次成功所用」的**列表面读法**
 *  （会话行无逐轮成功位：取倒序首行〔最近〕所用模型为近似，实施当刻数据面无更近读源；未在列表 ⇒ 空选）∥ 无模型/未选 ⇒ 提交门）；
 *  提交 ⇒ 建会话 ⇒ 选中新会话；败 ⇒ 窗内人话。 */
function openNewChatModal(ctx, { chats, created }) {
  const { h } = ctx
  const select = h("select", {}, h("option", { value: "", text: t("admin.chat.modelPick") }))
  const note = h("p", { class: "hint error", hidden: true })
  const submitBtn = h("button", { type: "submit", text: t("admin.chat.create") })
  const modal = openModal({
    title: t("admin.chat.newChat"),
    body: h("div", {},
      h("form", { class: "provider-form stacked", novalidate: true, onsubmit: submit },
        h("label", {}, h("span", { text: t("admin.chat.modelLabel") }), select),
        note, submitBtn)),
  })
  // 模型下拉源（provider 注册表展平——零新端点）；空/失败 ⇒ 提示项 + 提交门（前端先行）
  ctx.api("/api/admin/providers").then((data) => {
    const models = deriveModels(data?.providers ?? [])
    select.replaceChildren(...(models.length === 0
      ? [h("option", { value: "", text: t("admin.chat.noModels") })]
      : [h("option", { value: "", text: t("admin.chat.modelPick") }), ...models.map((row) => h("option", { value: row.id, text: row.id }))]))
    const preferred = String(chats?.[0]?.model ?? "")
    if (preferred !== "" && models.some((row) => row.id === preferred)) select.value = preferred
  }).catch(() => select.replaceChildren(h("option", { value: "", text: t("admin.chat.noModels") })))

  async function submit(event) {
    event.preventDefault()
    note.hidden = true
    const model = select.value
    if (model === "") return showNote(note, t("admin.chat.modelRequired")) // 提交门（空选不提交）
    submitBtn.disabled = true
    try {
      const data = await ctx.api("/api/admin/agent/chats", { method: "POST", body: { model } })
      modal.close()
      await created(data?.chat)
    } catch (error) {
      submitBtn.disabled = false
      showNote(note, mapError(error))
    }
  }
}

// ── 页面 ────────────────────────────────────────────────────────────────────

/** 管理·对话页（非壳页——§2.1①；沿视图档先例：先建壳，后异步取数）。 */
export async function renderChat(ctx, mount) {
  const { h } = ctx
  const generation = ++renderGeneration
  setStrings(coreStrings()) // 核件词面装订（装配期 ∥ 语言切换重挂本页 ⇒ 重注册——核 i18n 模块级态）
  let chats = []
  let activeId = null
  let detail = null
  let liveBlock = null // 活流当步块（核 `renderBlock`——一步一块：`turn` 帧开合）
  let liveBubble = null // 活流当步文本泡（核 `paintLiveMd` 目标——有文本才建）
  let liveRaw = ""
  let liveTools = new Map()
  let turnLabeled = false // 一回合一个助手标签（本回合已画 ⇒ 真）
  let reasoningWrite = null // 在飞档位写（单变量串行——发送前 await；选中即改 ⇒ 下回合生效——KD-SV-110）
  let liveReader = null // 在途读流（切会话 ⇒ cancel——服务端 res close 同拍结算在决 ask，KD-SV-227）

  mount.append(h("h2", { text: t("admin.chat.title") }))

  // ── ① 会话条（sticky 顶：会话选择器 + 新会话 + 重读）─────────────────────────
  const selector = h("select", { class: "chat-select", "aria-label": t("admin.chat.selectChat") })
  selector.addEventListener("change", () => {
    const picked = Number(selector.value)
    if (Number.isFinite(picked) && picked !== activeId) selectChat(picked)
  })
  const newChatBtn = h("button", { type: "button", text: t("admin.chat.newChat"), onclick: () => openNewChatModal(ctx, { chats, created }) })
  const hostCredBtn = h("button", { type: "button", class: "tiny", text: t("admin.chat.hostCred"), onclick: () => openHostCredentialPicker(ctx) }) // 主机凭据（弹窗件与沙盒页同件——KD-SV-134）
  const rereadBtn = h("button", { type: "button", class: "tiny", text: t("admin.chat.reread"), disabled: true, onclick: () => { if (activeId !== null) { composer.resetTurn(); loadDetail(activeId) } } })
  mount.append(h("div", { class: "chat-bar" }, selector, newChatBtn, hostCredBtn, rereadBtn))

  // ── ② 消息流（文档流平铺——无卡无框）────────────────────────────────────────
  const threadBox = h("div", { class: "chat-thread" }, h("p", { class: "hint", text: t("admin.chat.noChatSelected") }))
  mount.append(threadBox)

  // 审批卡族（§2.1 审批卡面条——`ask` 帧 ⇒ 页卡 ∥ 应答 = `POST …/asks/:promptId`；卡挂消息流尾）
  const askCards = createAskCards(ctx, {
    thread: () => threadBox,
    sessionId: () => activeId,
    respond: (path, body) => ctx.api(path, { method: "POST", body }),
    onFail: (error) => ctx.fail(error),
    onAnswered: () => composer.panel.inputEl?.focus?.(), // 应答成功 ⇒ 回焦输入区（核面板 inputEl——惰性引用，构造序在后）
  })

  // ── ③④ 状态行 + 输入区（核件全件消费——`views-chat-composer.mjs`；`#toolbar` 随建随挂）──
  const composer = createChatComposer(ctx, {
    root: mount,
    currentChat,
    onProviders: () => ctx.api("/api/admin/providers"),
    onSend,
    onAbort,
    onSelectModel,
    onSelectReasoning,
    onEcho,
    onNewChat,
    onHelp,
  })

  // ── 滚动（核件单源：`applyPin` 写口 ∥ `createPinWatch` 旗标维护——上滚不夺阅读位）──
  // 作用元素 = 文档流滚动元素（§2.1①）；`scroll` 事件在文档滚动时投于 `document`（**不投元素**——浏览器实测：
  // 元素监听零命中）⇒ 补一条事件桥：判定（核 `nearBottom`）与写口（核 handle `set`）仍走核件——单源不破。
  const scrollEl = document.scrollingElement ?? document.documentElement
  scrollEl[PIN_FLAG] = true // 缺省跟底（直写模式——对话流现行语义）
  const pinWatch = createPinWatch(scrollEl, { flagKey: PIN_FLAG })
  pinWatch.attach() // 近底 ⇒ 翻真（自愈）；上滚 ⇒ 翻假（本页零滚动自持实现）
  document.addEventListener("scroll", () => { pinWatch.set(nearBottom(scrollEl)) }, { passive: true })

  /** 跟底写（旗标门——上滚阅读期间零写；核写口）。 */
  function followPinned() { applyPin(scrollEl, scrollEl[PIN_FLAG]) }

  /** 显式回底（选中会话 ∥ 重读——重 pin；核写口）。 */
  function pinBottom() { scrollEl[PIN_FLAG] = true; applyPin(scrollEl, true) }

  /** 流式重渲器（核 `createStreamRenderer` 单源）：`token()` 帧内现取文本泡指针（无泡 ⇒ null）；
   *  帧尾 = 旗标门跟底。本页零自持重渲（禁每帧全量 `md`/整面 `innerHTML`）。 */
  const streamRenderer = createStreamRenderer({
    token: () => (liveBubble === null ? null : { el: liveBubble, raw: liveRaw }),
    frameEnd: () => followPinned(),
  })

  // ── 会话条重渲（选择器行 = 模型 ∥ `excerpt` ∥ 时间；当刻项高亮 = 原生选中态）────────
  function currentChat() {
    if (activeId === null) return null
    return detail?.chat ?? chats.find((row) => row.id === activeId) ?? null
  }

  function renderSelector() {
    selector.replaceChildren(...(chats.length === 0
      ? [h("option", { value: "", text: t("admin.chat.chatsEmpty") })]
      : chats.map((row) => h("option", {
        value: String(row.id),
        text: `${String(row.model ?? "")} · ${String(row.excerpt ?? "") === "" ? "—" : String(row.excerpt)} · ${ctx.fmtTs(row.updatedAt)}`,
      }))))
    if (activeId !== null) selector.value = String(activeId)
    rereadBtn.disabled = activeId === null
    composer.syncModel() // 当刻会话模型 ⇒ 核模型钮面字（显示面重派生——零槽写）
  }

  /** 选中会话（选择器随正 + 取详情——读时读；残留卡全摘 + 读流中止 ⇒ 服务端在决 ask 同拍拒值）。 */
  function selectChat(chatId) {
    activeId = chatId
    detail = null
    askCards.clear() // 切会话 ⇒ 残留卡全摘（CHAT.md §2.1 审批卡面条）
    void liveReader?.cancel?.().catch(() => {})
    liveReader = null // 先清引用（主动取消不弹「流中断」）
    renderSelector()
    loadDetail(chatId)
  }

  // ── 活流面（核件装配——**块 = 步**（`turn` 帧开合）∥ 块内嵌当步工具卡 ∥ 一回合一个助手标签）──

  /** 活流重置（每回合起点 ∥ 重读）：块/泡/工具指针归零 + 标签旗标复位。 */
  function liveReset() {
    liveBlock = null
    liveBubble = null
    liveRaw = ""
    liveTools = new Map()
    turnLabeled = false
  }

  /** 步收束（`turn` 帧到达 ⇒ 上一步收束、新步起——§2.1②）：尾帧先画（rAF 未及者落地——零丢帧）⇒ 步指针复位。
   *  `turnLabeled` 不随步复位（一回合首块恰一枚标签——块数 = 步数 ≠ 标签数）。 */
  function closeStep() {
    streamRenderer.flush()
    liveBlock = null
    liveBubble = null
    liveRaw = ""
  }

  /** 步块随首内容建（核 `renderBlock`——`withLabel` = 本回合首个块；一步一块——不跨步 ∥ 不堆块尾）。 */
  function ensureBlock() {
    if (liveBlock !== null) return liveBlock
    liveBlock = renderBlock({ withLabel: turnLabeled === false })
    turnLabeled = true
    appendLive(liveBlock)
    return liveBlock
  }

  /** 步内文本泡（**恒为块首子**——结构插入，与到达序无关：同一步 `call` 先于 `delta`，泡仍落卡前；§2.1②）。
   *  有文本才建（`trim` 判——与回读装配「文本空不建泡」同形；零文本步 ⇒ 零泡 —— 零空块）。 */
  function ensureBubble() {
    if (liveBubble !== null) return liveBubble
    liveBubble = h("div", { class: "bubble content" })
    const head = liveBlock.firstChild
    if (head !== null && head.classList?.contains("msg-label") === true) liveBlock.insertBefore(liveBubble, head.nextSibling)
    else liveBlock.prepend(liveBubble)
    return liveBubble
  }

  /** 对话区重渲（读时单源——`end` ⇒ 重读即此；流式视图随重读丢弃）。 */
  function renderThread() {
    liveReset()
    const messages = Array.isArray(detail?.messages) ? detail.messages : []
    if (messages.length === 0) {
      threadBox.replaceChildren(h("p", { class: "hint", text: t(activeId === null ? "admin.chat.noChatSelected" : "admin.chat.threadEmpty") }))
      return
    }
    threadBox.replaceChildren(...messageNodes(ctx, messages))
    pinBottom() // 重读径照旧：回底（显式动作——核写口）
  }

  /** 活流行入列（`end` ⇒ 重读整段替代——读时单源）。 */
  function appendLive(node) {
    if (node === null || node === undefined) return
    threadBox.append(node)
    followPinned()
  }

  /** `delta` 帧（核流式画件——增量重渲 + 帧尾跟底；步块 ∥ 文本泡**同门**随首段非空白文本建——空白 token 零块零泡）。 */
  function appendDelta(text) {
    liveRaw += String(text ?? "")
    if (liveRaw.trim() === "") return // 空白 token：零块零泡（`turn` 后零内容 ⇒ 零空块——KD-SV-132①）
    ensureBlock()
    if (liveBubble === null) ensureBubble()
    streamRenderer.markToken()
  }

  /** `call` 帧（核件建卡——名 + 参数摘要，结果位「执行中…」；**嵌当步块内**——不挂顶层 ∥ 不跨步——§2.1②）。 */
  function appendCall(frame) {
    ensureBlock()
    const name = String(frame.name ?? "")
    const { el: card, ref } = renderToolCard({ name, args: argsText(frame.args), id: String(frame.id ?? "") })
    liveTools.set(String(frame.id ?? ""), { ref, name })
    liveBlock.append(card)
    followPinned()
  }

  /** `result` 帧（核件结算——结果摘要 + 失败判据单源）。 */
  function applyResult(frame) {
    const entry = liveTools.get(String(frame.id ?? ""))
    if (entry === undefined) return
    finishToolCard(entry.ref, entry.name, resultText(frame.summary, frame.ok))
    followPinned()
  }

  /** 视图帧分发（`turn` = 步界〔上步收束、新步起〕；`usage`/`end` 归状态行面——`composer.applyFrame` 恒先收全帧）。 */
  function applyFrame(frame) {
    if (frame === null) return
    if (frame.type === "turn") { closeStep(); return }
    if (frame.type === "delta") { appendDelta(frame.text); return }
    if (frame.type === "call") { appendCall(frame); return }
    if (frame.type === "result") { applyResult(frame); return }
    if (frame.type === "ask") { askCards.append(frame); return } // 审批卡（§11.5——挂消息流尾）
  }

  // ── 装配面（composer 回调——输入区 ∥ 队列 ∥ 状态行）──────────────────────────

  /** 本地用户回声块（核 `buildUserMessage`——活流径；`hooks.onUserEcho` 出口）。 */
  function onEcho(text, ts) {
    if (activeId === null) return null
    const node = buildUserMessage(text, ts)
    appendLive(node)
    return node
  }

  /** 发一条并读流（单 POST + NDJSON 帧流——§11）：页面的传输面（`composer` 只给文本与图列）。
   *  返回 `{ accepted, ended }`：`accepted` = 落库已起（调用方不还原草稿）∥ `ended` = 收到 `end`（队首发起前提）。 */
  async function onSend(text, images = []) {
    if (activeId === null) return { accepted: false, ended: false }
    await reasoningWrite // 在飞档位写落地（选中即改 ⇒ 本回合生效——单变量串行；无在飞 ⇒ 直过）
    const chatId = activeId
    liveReset()
    const payload = Array.isArray(images) && images.length > 0 ? { content: text, images } : { content: text }
    let response = null
    try {
      response = await fetch(`/api/admin/agent/chats/${chatId}/messages`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      })
    } catch (error) { ctx.fail(error); return { accepted: false, ended: false } }
    if (!response.ok) {
      let body = null
      try { body = await response.json() } catch { /* 无 JSON 体 ⇒ 以状态判 */ }
      const error = new Error(body?.error?.message ?? t("app.httpFailed", { status: response.status }))
      error.status = response.status
      error.code = body?.error?.code ?? null
      ctx.fail(error)
      return { accepted: false, ended: false }
    }
    let reader = null
    try { reader = response.body.getReader() } catch { ctx.flash(t("admin.chat.streamBroken")); return { accepted: true, ended: false } } // 200 无流体（角落）⇒ 就地人话
    liveReader = reader // 在途读流（切会话主动取消 —— 服务端 res close 同拍结算在决 ask）
    const decoder = new TextDecoder()
    let buffer = ""
    let ended = null
    /** 帧落地：状态行恒收（本流所向——读数面）；视图面加卫（切走 ⇒ 丢帧不串台）。 */
    const land = (line) => {
      const frame = parseFrame(line)
      if (frame === null) return
      composer.applyFrame(frame)
      if (frame.type === "end") { ended = frame; askCards.clear(); return } // 回合收尾 ⇒ 残留卡全摘（服务端同拍拒值）
      if (activeId === chatId) applyFrame(frame)
    }
    try {
      for (;;) {
        if (generation !== renderGeneration || mount.isConnected === false) { // 重渲/离页 ⇒ 读流中止（回合照跑）
          liveReader = null
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
      if (liveReader !== null) ctx.flash(t("admin.chat.streamBroken")) // 断连——读流中止（切会话的主动取消静默）
      return { accepted: true, ended: false }
    }
    liveReader = null
    streamRenderer.flush() // 回合尾同步尾帧（rAF 未及——重读置换前必须画出）
    if (ended !== null && activeId === chatId) await loadDetail(chatId) // `end` ⇒ 重读（读时单源；切走 ⇒ 不抳——避免把视图换成另一会话）
    return { accepted: true, ended: ended !== null }
  }

  /** 请求中止在途回合（KD-SV-107）：`POST …/abort`；终态经流/重读呈现（本行零副作用）。 */
  async function onAbort() {
    if (activeId === null) return
    try { await ctx.api(`/api/admin/agent/chats/${activeId}/abort`, { method: "POST", body: {} }) }
    catch (error) { ctx.fail(error) }
  }

  /** 换模型（KD-SV-108——明选即换、下回合生效）：`PATCH …/:id`；失败 ⇒ 就地人话 + 钮面回退（`composer` 面重派生）。
   *  回执会话卫（B70 同款一行式）：会话 id 随拾取捕获；在飞期切走 ⇒ 回执零写他会话。 */
  async function onSelectModel(model) {
    if (activeId === null || model === "") return false
    const chatId = activeId // 会话 id 随拾取捕获（链式调用晚于拾取——不可迟读 `activeId`）
    try {
      const data = await ctx.api(`/api/admin/agent/chats/${chatId}`, { method: "PATCH", body: { model } })
      if (activeId === chatId && detail !== null && data?.chat) { detail.chat = data.chat; renderSelector() }
      return true
    } catch (error) { ctx.fail(error); return false }
  }

  /** 设档位（KD-SV-110——会话级归属）：`PATCH …/:id { reasoning }` 一次一件；连写按序串行（单变量链——`onSend` 发送前 await 尾）；失败 ⇒ 就地人话 + 假。 */
  function onSelectReasoning(reasoning, chatId = activeId) { // 会话 id 随拾取捕获（链式调用晚于拾取——不可迟读 `activeId`）
    if (chatId === null || reasoning === "") return false
    const write = (reasoningWrite ?? Promise.resolve()).then(() => ctx.api(`/api/admin/agent/chats/${chatId}`, { method: "PATCH", body: { reasoning } }))
    reasoningWrite = write.then(() => {}, () => {}) // 尾链吞错（不阻断后续 ∥ 发送前 await 不炸）
    return write.then((data) => { if (activeId === chatId && detail !== null && data?.chat) { detail.chat = data.chat; renderSelector() } return true }, (error) => { ctx.fail(error); return false })
  }

  /** 新会话弹窗（斜径 `/new` 同门——`run` 返真 = 已受理）。 */
  function onNewChat() {
    openNewChatModal(ctx, { chats, created })
    return true
  }

  /** `/help` 行集就地打印（核 `formatHelp` 产物——本页只落件，零第二清单）。 */
  function onHelp(rows) {
    const lines = (Array.isArray(rows) ? rows : []).map((row) => String(row?.text ?? "")).filter((text) => text !== "")
    if (lines.length === 0) return false
    appendLive(h("div", { class: "message notice", text: lines.join("\n") }))
    return true
  }

  // ── 取数 ───────────────────────────────────────────────────────────────────

  /** 会话详情（读时读——`detail` 单源：消息流 ∥ 工具卡 ∥ notice 皆自此渲染）。 */
  async function loadDetail(chatId) {
    threadBox.replaceChildren(h("p", { class: "hint", text: t("common.loading") }))
    try {
      const data = await ctx.api(`/api/admin/agent/chats/${chatId}`)
      if (generation !== renderGeneration) return
      detail = data
      renderThread()
      askCards.remount() // 重读装配不动在决卡表：置换摘走卡体 ⇒ 重挂区尾（旧卡不失答）
      renderSelector()
    } catch (error) {
      if (generation !== renderGeneration) return
      ctx.fail(error)
      threadBox.replaceChildren(h("p", { class: "hint error" }, t("admin.chat.detailFailed"), " ",
        h("button", { type: "button", class: "tiny", text: t("admin.chat.retry"), onclick: () => loadDetail(chatId) })))
    }
  }

  /** 会话列表（读时读——进页一次 ∥ 新会话后刷新；倒序由服务端定）。 */
  async function loadChats() {
    try {
      const data = await ctx.api("/api/admin/agent/chats")
      if (generation !== renderGeneration) return
      chats = Array.isArray(data?.chats) ? data.chats : []
      renderSelector()
    } catch (error) {
      if (generation !== renderGeneration) return
      ctx.fail(error)
      threadBox.replaceChildren(h("p", { class: "hint error" }, t("admin.chat.listFailed"), " ",
        h("button", { type: "button", class: "tiny", text: t("admin.chat.retry"), onclick: () => loadChats() })))
    }
  }

  /** 新会话落地（列表刷新 + 选中——`POST` 回执的 `chat`）。 */
  async function created(chat) {
    await loadChats()
    if (chat?.id !== undefined && chat?.id !== null) selectChat(chat.id)
  }

  renderSelector()
  await loadChats()
  void composer.refreshModels() // 模型候选取数（核菜单源——失败零候选，面板留「加载模型…」面）
  if (activeId === null && chats.length > 0) selectChat(chats[0].id) // 进页即当刻会话（倒序首行 = 最近）
}
