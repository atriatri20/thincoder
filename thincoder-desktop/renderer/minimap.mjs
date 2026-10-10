/**
 * minimap.mjs — 会话轮导航栏（Codex ∕ ZCode 形 · 2026-10-04；**实现参照 zai-org/ZCode
 * `packages/ui/src/v4/ConversationTurnNavigator.tsx` + `conversationTurnNavigatorHelpers.ts`** —— 用户点单
 * 「拿 ZCode 当参考，不用自己造轮子」；第五轮的比例小地图形废除——用户「散开的」）：
 * 面 = 会话列左缘 Rail：**每条用户提问一根刻度，等距 10px 纵列**（轨可滚 —— 轮多自滚），与文档比例无关；
 * 视觉 = ZCode 同款「山峰」：活动刻度 scaleX 2.6 ∕ opacity 1，距离 1 → 1.7 ∕ 0.86，2 → 1.25 ∕ 0.72，
 * 余 1 ∕ 0.58（`barVisual` 同表）；活动轮 = 视口顶所在轮（滚动随动 ∕ 轨自滚保活动可见）；
 * 悬浮卡 = 用户预览（≤220 字 ∕ ≤2 段）+ 助手预览（同限）—— ZCode HoverCard 同构；点击跳对应提问
 * （**instant** —— unfollow 树重建会取消 smooth，第五轮实测）。轮 < 2 ∕ 不可滚 ⇒ 整体退场。
 * 数据面零新通道：轮组 = `.flow` DOM 直读（用户块开轮 —— 沿原判据；无头组零条目 = ZCode realUser 口径）。
 * 更新径 = 流 MutationObserver（150ms 去抖）+ flow ResizeObserver + scroll（活动态随动）。
 * 纪律：刻度持 `data-block-id`（不持元素引用 —— 重渲染换节点，detach 引用 scrollIntoView 无操作 —— 真机实测）；
 * 查询缺席 ⇒ 空转；零 `node:` ∕ 零裸包。
 */
import { t } from "./i18n.mjs"

/** 预览规整（ZCode `normalizePreviewParagraphs` ∕ `truncatePreview` 同口径）：≤2 段 ∕ ≤220 字。 */
function normalizePreview(text, { maxChars = 220, maxParagraphs = 2 } = {}) {
  const paragraphs = String(text ?? "")
    .trim()
    .split(/\n\s*\n/u)
    .map((paragraph) => paragraph.replace(/\s+/gu, " ").trim())
    .filter(Boolean)
    .slice(0, Math.max(1, maxParagraphs))
  const joined = paragraphs.join("\n")
  if (joined.length <= maxChars) return joined
  return `${joined.slice(0, Math.max(8, maxChars) - 3).trimEnd()}...`
}

/** 块摘句原料（预览取材）：文本 = `[data-raw]` ∕ 工具 = 头行 ∕ 推理 = 摘要。 */
function rawTextOf(block) {
  const raw = block.querySelector?.("[data-raw]")?.getAttribute("data-raw")
  if (typeof raw === "string" && raw !== "") return raw
  return String(block.querySelector?.(".tool-head")?.textContent ?? "").trim()
}

/** 轮组（用户块开新轮；首块非用户 ⇒ 首组无头 = 零条目 —— ZCode realUser 口径）。 */
function turnGroups(flow) {
  const blocks = [...flow.querySelectorAll("[data-block-id]")]
  const flowRect = flow.getBoundingClientRect()
  const total = flow.scrollHeight
  const groups = []
  let current = null
  for (const block of blocks) {
    const kind = block.getAttribute("data-block-kind")
    if (kind === "user" || current === null) {
      current = { head: kind === "user" ? block : null, body: [], error: false }
      groups.push(current)
    }
    current.body.push(block)
    if (kind === "error") current.error = true
  }
  return groups.filter((group) => group.head !== null)
}

/** 条目构建（ZCode `buildConversationTurnNavigatorItems` 同构）：逐用户提问一条 —— 用户预览 + 助手预览 + 起止比例。 */
function buildItems(flow) {
  const total = flow.scrollHeight
  const flowRect = flow.getBoundingClientRect()
  const pctOf = (block) => (block.getBoundingClientRect().top - flowRect.top + flow.scrollTop) / total
  return turnGroups(flow).map((group, index, groups) => {
    const end = index + 1 < groups.length ? pctOf(groups[index + 1].head) : 1
    const bodyBlocks = group.body.slice(1)
    const assistantTexts = bodyBlocks
      .filter((block) => block.getAttribute("data-block-kind") === "assistant")
      .map((block) => rawTextOf(block))
      .filter(Boolean)
    const assistantPreview = assistantTexts.length > 0
      ? normalizePreview(assistantTexts.join("\n\n"))
      : normalizePreview(bodyBlocks.map((block) => rawTextOf(block)).find(Boolean) ?? "")
    return {
      id: group.head.getAttribute("data-block-id"),
      userPreview: normalizePreview(rawTextOf(group.head)),
      assistantPreview,
      startPct: pctOf(group.head),
      endPct: Math.max(end, pctOf(group.head)),
      error: group.error,
    }
  })
}

/** 活动条目解析（ZCode `resolveActiveUnitIndex` 简化口径）：视口顶落在哪轮的 [start, end) ⇒ 该轮；缺 ⇒ 末轮。 */
function resolveActiveIndex(items, flow) {
  if (items.length === 0) return -1
  const viewportTop = flow.scrollTop
  let active = -1
  for (let index = 0; index < items.length; index += 1) {
    if (items[index].startPct * flow.scrollHeight <= viewportTop + 80) active = index
  }
  return active === -1 ? 0 : active
}

/** 山峰视觉（ZCode `resolveBarVisualState` 同表）：距离 0 → 2.6 ∕ 1；1 → 1.7 ∕ 0.86；2 → 1.25 ∕ 0.72；余 1 ∕ 0.58。 */
function barVisual(itemIndex, focusIndex) {
  if (focusIndex < 0) return { scale: 1, opacity: 0.58, focus: false }
  const distance = Math.abs(itemIndex - focusIndex)
  if (distance === 0) return { scale: 2.6, opacity: 1, focus: true }
  if (distance === 1) return { scale: 1.7, opacity: 0.86, focus: false }
  if (distance === 2) return { scale: 1.25, opacity: 0.72, focus: false }
  return { scale: 1, opacity: 0.58, focus: false }
}

const SLOT_PX = 10

/** 单帧重涂：条目数或签名变 ⇒ 全量重建；否则仅刷活动态 ∕ 轨随动（悬浮期零重建 —— 卡不闪）。 */
function paint(strip, list, tip, flow, state) {
  const items = buildItems(flow)
  const scrollable = flow.scrollHeight > flow.clientHeight * 1.15
  strip.toggleAttribute("data-empty", items.length < 2 || !scrollable)
  if (items.length < 2 || !scrollable) {
    state.items = items
    state.signature = ""
    return
  }
  const signature = items.map((item) => item.id).join("|")
  if (signature !== state.signature) {
    list.textContent = ""
    items.forEach((item, index) => {
      const button = document.createElement("button")
      button.type = "button"
      button.className = "minimap-item"
      button.style.transform = `translateY(${index * SLOT_PX}px)`
      button.dataset.index = String(index)
      button.dataset.userPreview = item.userPreview
      button.dataset.assistantPreview = item.assistantPreview
      if (item.error) button.dataset.error = ""
      button.setAttribute("aria-label", t("minimap.jump", { n: index + 1 }))
      const bar = document.createElement("span")
      bar.className = "minimap-bar"
      if (item.error) bar.classList.add("error")
      button.append(bar)
      button.addEventListener("click", () => {
        const target = flow.querySelector(`[data-block-id="${CSS.escape(item.id)}"]`)
        target?.scrollIntoView({ block: "start", behavior: "instant" })
      })
      button.addEventListener("mouseenter", () => {
        state.focus = Number(button.dataset.index)
        applyVisual(list, state.focus)
        tip.textContent = ""
        const user = document.createElement("p")
        user.className = "minimap-tip-user"
        user.textContent = button.dataset.userPreview
        const assistant = document.createElement("p")
        assistant.className = "minimap-tip-assistant"
        assistant.textContent = button.dataset.assistantPreview
        assistant.toggleAttribute("data-empty", button.dataset.assistantPreview === "")
        tip.append(user, assistant)
        // 定位 = 按钮视口 rect 相对会话列 + **边界夹取**（原 offsetTop 径未算轨滚动 ∕ 居中偏移 ⇒ 卡飞到顶部 —— 真机实测）。
        tip.setAttribute("data-visible", "")
        const columnRect = state.column.getBoundingClientRect()
        const buttonRect = button.getBoundingClientRect()
        const half = tip.offsetHeight / 2 + 12
        const center = buttonRect.top - columnRect.top + buttonRect.height / 2
        tip.style.top = `${Math.min(Math.max(center, half), Math.max(half, columnRect.height - half))}px`
      })
      button.addEventListener("mouseleave", () => {
        state.focus = -1
        applyVisual(list, state.focus)
        tip.removeAttribute("data-visible")
      })
      list.append(button)
    })
    list.style.height = `${items.length * SLOT_PX}px`
    state.signature = signature
  }
  state.items = items
  applyActive(list, flow, state)
}

/** 视觉态应用（山峰表 ⇒ 内联样式 → CSS 过渡）。 */
function applyVisual(list, focusIndex) {
  for (const button of list.children) {
    const visual = barVisual(Number(button.dataset.index), focusIndex)
    const bar = button.firstElementChild
    bar.style.transform = `scaleX(${visual.scale})`
    bar.style.opacity = String(visual.opacity)
    bar.classList.toggle("focus", visual.focus)
  }
}

/** 活动态解析 + 轨随动（活动条目出轨 ⇒ 轨滚到其居中位）。 */
function applyActive(list, flow, state) {
  const active = resolveActiveIndex(state.items, flow)
  if (active === state.active) return
  state.active = active
  for (const button of list.children) {
    const index = Number(button.dataset.index)
    button.setAttribute("data-active", index === active ? "true" : "false")
  }
  const rail = list.parentElement
  const slotTop = active * SLOT_PX
  if (slotTop < rail.scrollTop || slotTop > rail.scrollTop + rail.clientHeight - SLOT_PX * 2) {
    rail.scrollTop = Math.max(0, slotTop - rail.clientHeight / 2)
  }
}

/** 装配（一次性 —— `renderer/app.mjs` 消费）：容器缺位 ⇒ 空转；返回 `{ repaint }`。
 *  **定位面 = `.flow-area`（只包对话流），非 `.session`**（2026-10-10 修：后者还含会话控制条与输入区
 *  ⇒ `.minimap { inset-block: 0 }` 把刻度一路铺到输入框下方 —— 用户真机圈红「最低刻度落在输入区」。
 *  同 ZCode：导航栏挂 `@container/conversation`（对话区容器，与输入区兄弟）上、`inset-y-0` 只覆盖对话区）。
 *  `has-minimap` 仍落 `.session`（让位公式锚 = `.session.has-minimap .flow` —— 选择器零改）。 */
export function attachMinimap() {
  const session = document.querySelector(".session")
  const flow = document.querySelector('[data-slot="flow"]')
  const area = document.querySelector(".flow-area") ?? session // 兜底：旧骨架（无 flow-area）退原径
  if (area === null || flow === null) return { repaint: () => {} }
  session?.classList.add("has-minimap")

  const strip = document.createElement("div")
  strip.className = "minimap"
  const rail = document.createElement("div")
  rail.className = "minimap-rail"
  const list = document.createElement("div")
  list.className = "minimap-list"
  rail.append(list)
  const tip = document.createElement("div")
  tip.className = "minimap-tip"
  strip.append(rail)
  area.append(strip, tip)

  // `column` 名沿旧（= 提示卡 ∕ 刻度条的定位面）——值与 `tip` 的 offsetParent 同源，rect 数学才自洽。
  const state = { signature: "", items: [], active: -1, focus: -1, column: area }
  let timer = 0
  const schedule = () => {
    if (timer !== 0) return
    timer = setTimeout(() => {
      timer = 0
      paint(strip, list, tip, flow, state)
    }, 150)
  }
  new MutationObserver(schedule).observe(flow, { childList: true, subtree: true })
  if (typeof ResizeObserver === "function") new ResizeObserver(schedule).observe(flow)
  flow.addEventListener("scroll", () => applyActive(list, flow, state), { passive: true })
  rail.addEventListener("scroll", () => { state.focus = -1; applyVisual(list, state.focus) })

  paint(strip, list, tip, flow, state)
  return { repaint: () => paint(strip, list, tip, flow, state) }
}
