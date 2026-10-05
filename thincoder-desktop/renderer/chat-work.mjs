/**
 * chat-work.mjs — 工作过程折叠（**ZCode `ConversationTurnGroup` 语义移植** · 2026-10-05；
 * 源参照 = zai-org/ZCode `packages/ui/src/v4/`（Apache-2.0）：`conversationWorkDuration.ts`（时长格式：
 * max(1, round) ∕ 天时分秒取最多两段 ∕ zh 单位带空格）∥ `conversationTurnWorkSegments.ts`（完成态时长 =
 * `endedAt − startedAt`，**绝不吃当前时钟**——否则历史「已工作」随时间增长；状态三态 running ∕
 * interrupted ∕ completed）∥ `ConversationTurnGroup.tsx:573-585`（折叠头三态词：workingFor ∕
 * workedFor ∕ worked；最终正文留折叠区外展开））。
 * 面 = 逐轮一组：用户块开启一轮；轮内工具 ∕ 思考 ∕ 旁白 ∕ 台账行等收进折叠区（默认收起），**轮尾最终
 * 正文**（最后一块若为 assistant 型）留区外展开；折叠头 = 「已工作 ${d}」∕ 无时长「已工作」。
 * 本档 = **DOM 后处理**（沿 `chrome-words.mjs` ∕ `reasoning-times.mjs` 先例）——块树 ∕ 帧差分 ∕ 窗限
 * 三机制零涉：块保持平铺，折叠 = `work-hidden` 类（display:none），工作头 = 非块节点（digest 行先例）。
 * 忙态源 = `busyOf`（store `tabBadges.running` —— 与输入区同式）：末轮忙 ⇒ **不分组**（活流全展开——
 * ZCode running 段不折叠）；闲 ⇒ 末轮也分组。展开态 = 会话内 Map（按用户块 id），默认收起。
 * 纪律：刻度持 id 不持元素引用；只做幂等增删（自观察不震荡）；零 `node:` ∕ 零裸包。
 */
import { locale, t } from "./i18n.mjs"
import { store } from "./store.mjs"
import { busyOf } from "./views/chrome.mjs"

/** 折叠收编的非块行族（轮内状态行 —— 非交互；审批 ∕ 提问 ∕ 计划 ∕ 目标卡与药丸 ∕ 摘要不收）。 */
const FOLD_ROW_SEL = ".chat-digest, .chat-ledger, .chat-help, .chat-timer, .chat-stopped, .compress-status"

/** 展开态（用户手动展开 ⇒ 本会话内保持；按用户块 id 键）。 */
const openMap = new Map()

/** 时长格式（ZCode `formatConversationWorkDuration` 逐条移植）：max(1, round) ∕ 天时分秒 ∕ 最多两段 ∕ zh 带空格。 */
function formatDuration(ms) {
  const total = Math.max(1, Math.round(ms / 1000))
  const d = Math.floor(total / 86400)
  const h = Math.floor((total % 86400) / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  const zh = locale() === "zh"
  const unit = (v, zhUnit, enUnit) => `${v}${zh ? " " : ""}${zh ? zhUnit : enUnit}`
  const parts = []
  if (d > 0) parts.push(unit(d, "天", "d"))
  if (h > 0) parts.push(unit(h, "小时", "h"))
  if (m > 0) parts.push(unit(m, "分", "m"))
  if (s > 0 || parts.length === 0) parts.push(unit(s, "秒", "s"))
  return parts.slice(0, 2).join(" ")
}

const num = (value) => {
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

const isBlockEl = (el) => typeof el.hasAttribute === "function" && el.hasAttribute("data-block-kind")
const isFoldRow = (el) => typeof el.matches === "function" && el.matches(FOLD_ROW_SEL)

/** 单 span 落形：工作头在场对位 ∕ 折叠类应用 ∕ 时长词刷新（全幂等——值变才写）。
 *  `turnKey` = 用户块 id ∥ `head-<首块 id>`（头段——用户块已被窗限摘出）。 */
function applySpan(flow, span, turnKey, busy) {
  if (turnKey === "") return
  const blocks = span.els.filter(isBlockEl)
  const last = blocks[blocks.length - 1] ?? null
  const final = last !== null && last.getAttribute("data-block-kind") === "assistant" ? last : null
  const work = span.els.filter((el) => el !== final)
  // 无实际工作块（工具 ∕ 思考 ∕ 归档）的轮次不出折叠头——纯问答 ∕ 仅尾台账行的轮次保持原样
  // （状态行是收尾注记不是「工作」；折叠头挂在最终正文之后 = 孤头，真机实测）。
  const workBlocks = work.filter(isBlockEl)
  const headKey = `chat-workhead-${CSS.escape(turnKey)}`
  let head = flow.querySelector(`#${CSS.escape(headKey)}`)

  if (workBlocks.length === 0 || busy) {
    // 无工作行（纯问答）∥ 末轮忙态（活流）⇒ 整组退场 + 全展开。
    if (head !== null) head.remove()
    for (const el of span.els) el.classList.remove("work-hidden")
    return
  }

  const open = openMap.get(turnKey) === true
  // 折叠操作面锚：work els 携 `data-turn`（点击径现查——重建换节点后闭包引用失效）；最终正文标 `data-work-final`。
  if (final !== null) final.dataset.workFinal = "1"
  for (const el of work) el.dataset.turn = turnKey
  if (head === null) {
    head = document.createElement("div")
    head.id = headKey
    head.className = "chat-workhead"
    head.dataset.turn = turnKey
    const button = document.createElement("button")
    button.type = "button"
    button.setAttribute("aria-expanded", "false")
    button.addEventListener("click", () => {
      // 现查现翻（**不持元素引用** —— 帧重建换节点，闭包引用 = detach 节点，minimap 同坑）。
      const next = !(openMap.get(turnKey) === true)
      openMap.set(turnKey, next)
      for (const el of flow.querySelectorAll(`[data-turn="${CSS.escape(turnKey)}"]`)) {
        if (el === head) continue
        if (el.dataset.workFinal === "1") continue // 最终正文恒展开
        el.classList.toggle("work-hidden", !next)
      }
      head.dataset.open = String(next)
      button.setAttribute("aria-expanded", String(next))
      button.title = next ? t("chat.work.collapse") : t("chat.work.expand")
    })
    head.append(button)
    work[0].before(head)
  }
  const button = head.firstElementChild
  head.dataset.open = String(open)
  button.setAttribute("aria-expanded", String(open))
  button.title = open ? t("chat.work.collapse") : t("chat.work.expand")

  // 时长（ZCode 口径：start = 用户 ts ∥ 首工作块 ts ∕ startedAt；end = 最终正文 startedAt ∥ ts；
  // **完成态零当前时钟**）。端点缺失 ⇒ 无时长词（「已工作」）。
  const start = num(span.user?.dataset?.ts) ?? num(work[0].dataset?.ts) ?? num(work[0].dataset?.started)
  const end = num(final?.dataset?.started) ?? num(final?.dataset?.ts)
  const durationMs = start !== null && end !== null && end > start ? end - start : null
  const label = durationMs === null ? t("chat.work.worked") : t("chat.work.workedFor", { d: formatDuration(durationMs) })
  if (button.textContent !== label) button.textContent = label

  for (const el of span.els) {
    if (el === final) continue
    el.classList.toggle("work-hidden", !open)
  }
  final?.classList.remove("work-hidden")
}

/** 全流重涂（幂等）：span 划分 → 逐 span 落形 → 陈旧工作头清理。
 *  **头段**（首用户块已被窗限摘出 DOM 的孤儿块——flow 首子直接是工作块）同样成组（键 = `head-<首块id>`；
 *  无用户 ts ⇒ 时长退化为块端点 ∕ 无时长词）。 */
function paint(flow) {
  const state = store.get()
  const busy = busyOf(state, state.activeSession)
  const spans = []
  let current = { user: null, els: [] }
  for (const el of flow.children) {
    if (el.classList?.contains("chat-workhead")) continue // 自产节点透明
    if (el.getAttribute?.("data-block-kind") === "user") {
      if (current.user !== null || current.els.length > 0) spans.push(current)
      current = { user: el, els: [] }
      continue
    }
    if (isBlockEl(el) || isFoldRow(el)) current.els.push(el)
    // 其余（审批 ∕ 提问 ∕ 计划 ∕ 目标卡 ∕ 药丸 ∕ 摘要 ∕ 引导）= 透明，不打断 span 亦不收编
  }
  if (current.user !== null || current.els.length > 0) spans.push(current)
  const seen = new Set()
  spans.forEach((span, index) => {
    const headBlockId = span.user?.getAttribute("data-block-id") ?? `head-${span.els[0]?.getAttribute("data-block-id") ?? ""}`
    if (headBlockId !== "") seen.add(headBlockId)
    const isLast = index === spans.length - 1
    applySpan(flow, span, headBlockId, busy && isLast)
  })
  for (const head of flow.querySelectorAll(".chat-workhead")) {
    if (!seen.has(head.dataset.turn)) head.remove()
  }
}

/** 装配（一次性 —— `renderer/app.mjs` 消费）：流观察（childList ∕ flow data-state）+ store 订阅（busy 翻转）
 *  ⇒ 去抖重涂。返回 `{ repaint }`。 */
export function attachChatWork() {
  const flow = document.querySelector('[data-slot="flow"]')
  if (flow === null) return { repaint: () => {} }
  let timer = 0
  const schedule = () => {
    if (timer !== 0) return
    timer = setTimeout(() => {
      timer = 0
      paint(flow)
    }, 200)
  }
  new MutationObserver(schedule).observe(flow, { childList: true, subtree: true, attributes: true, attributeFilter: ["data-state", "data-started", "data-ts", "data-done"] })
  const detach = store.subscribe(schedule)
  paint(flow)
  return { repaint: () => paint(flow), detach }
}
