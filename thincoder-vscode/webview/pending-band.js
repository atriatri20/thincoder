/**
 * pending-band.js — busy 排队「待发送带」（**输入区上沿 · 派生 · 非流内**——queue-band 批 2026-10-20）。
 *
 * 契约单源 = `docs/vsc/design/WEBVIEW-INPUT.md` §1 C-B2-6 ⑦（DOM 形态 / 量面判据 / 消费时刻）；
 * 快照字段 = `WEBVIEW-PROTOCOL.md` §3.2 行 17（`busyQueued { pending, count, items, merged? }`）。
 *
 * 面：
 *  ① 带面 = `items` 的**纯函数重绘**（判据空 ⇒ `hidden` 零高；零块序写入 / 零生命周期簿记）；
 *  ② 落位 = `#pending-band` 插到输入行（`ctx.inputEl.parentElement`）**之前**——`#toolbar` 内贴
 *     输入上沿（短会话不浮起）；不在 `#messages`、不携 `data-block-kind`；
 *  ③ 消费时刻 = 带项退场（按 `items` 重绘）+ 流内**恰一枚** user 块（`merged` 在场 ⇒ `addUser`；
 *     `merged` 只在消费推送携 ⇒ 幂等重推零重复块）；
 *  ④ 子形照桌面 `thincoder-desktop/renderer/views/chat-pending.mjs`：标签两形（单条 ∕ 多条）+
 *     逐条 `.chat-pending-item[data-pending-item][data-raw]` + 正文 `.chat-pending-body`（CSS clamp 3）+
 *     超限尾标记 `[data-pending-more]`（量面 `scrollHeight ÷ lineHeight > 3`）。
 */
import { ctx } from "./state.js"
import { t } from "./i18n.js"
import { addUser } from "./ui.js"

/** 逐条原文上限行数（桌面 `ITEM_MAX_LINES` 同值 = 3——超限 ⇒ 尾标记）。 */
const ITEM_MAX_LINES = 3

/** 带容器（装配期创建一次；幂等——`renderBand` ∕ 快照重绘同用本入口）。 */
function ensureBand(ctx) {
  const existing = document.getElementById("pending-band")
  if (existing) return existing
  const row = ctx.inputEl?.parentElement
  if (!row?.parentElement) throw new Error("pending-band：输入行缺失（composer 未装配）")
  const band = document.createElement("div")
  band.id = "pending-band"
  band.dataset.pendingBand = ""
  band.hidden = true
  row.parentElement.insertBefore(band, row)
  return band
}

// 装配期创建（契约 = C-B2-6 ⑦：带面一次创建、此后按快照重绘；判据空 ⇒ `hidden` 零高）。
ensureBand(ctx)

/** 带面全量重绘（`items` 纯函数——判据空 ⇒ 清空 + `hidden`）。 */
function renderBand(ctx, items) {
  const band = ensureBand(ctx)
  band.replaceChildren()
  if (items.length === 0) {
    band.hidden = true
    return
  }
  const multi = items.length >= 2
  const label = document.createElement("div")
  label.className = "chat-pending-label"
  label.textContent = multi
    ? t("chat.pending.multi", { count: String(items.length) })
    : t("chat.pending.single")
  band.appendChild(label)
  for (const [index, raw] of items.entries()) {
    const item = document.createElement("div")
    item.className = "chat-pending-item"
    item.dataset.pendingItem = ""
    item.dataset.raw = raw
    const body = document.createElement("div")
    body.className = "chat-pending-body"
    body.textContent = multi ? `${index + 1}. ${raw}` : raw // 编号载体 = `.chat-pending-body` 文本前缀
    const more = document.createElement("div")
    more.className = "chat-pending-more"
    more.dataset.pendingMore = ""
    more.hidden = true
    item.append(body, more)
    band.appendChild(item)
  }
  band.hidden = false
  paintPendingOverflow(band)
}

/** 逐条超限尾标记（帧尾量面——桌面 `paintPendingOverflow` 同式）：正文折行行数 > `ITEM_MAX_LINES`
 *  ⇒ 摘 `hidden` ∧ 填行数词；平 node ∕ 零版式（`scrollHeight` 非 number ∨ `lineHeight` 非有限正数）⇒ 早返零写。 */
export function paintPendingOverflow(root) {
  if (typeof root?.querySelectorAll !== "function") return
  for (const body of root.querySelectorAll(".chat-pending-body")) {
    const more = typeof body.parentElement?.querySelector === "function"
      ? body.parentElement.querySelector("[data-pending-more]")
      : null
    if (more === null || more === undefined) continue
    if (typeof body.scrollHeight !== "number" || typeof body.clientHeight !== "number") return
    const style = typeof globalThis.getComputedStyle === "function" ? globalThis.getComputedStyle(body) : null
    const lineHeight = Number.parseFloat(style?.lineHeight ?? "")
    if (!Number.isFinite(lineHeight) || lineHeight <= 0) return
    const rows = Math.max(1, Math.round(body.scrollHeight / lineHeight))
    const over = rows > ITEM_MAX_LINES
    more.hidden = !over
    if (over) more.textContent = t("chat.pending.more", { lines: String(rows) })
  }
}

/**
 * 快照应用（`case "busyQueued"`——受理 / 五个消费点 / 忙分支判决 / 握手重推，全幂等）：
 *  ① 镜像：`S._busyQueuedCount`（二次提交守卫判据源）+ `S._busyQueuedPending`（= count > 0）+
 *     `S._busyQueuedItems`（带面数据源）；
 *  ② 带面：`items` 必携 ⇒ 全量重绘；缺 `items` 的旧载荷 ⇒ 保留原态、零重绘（`count` 照常更新）；
 *  ③ 消费：`merged` 在场 ⇒ 流内追加恰一枚 user 块（单条 = 原文；多条 = 合并文本）。
 */
export function applyBusyQueued(ctx, S, m) {
  const count = typeof m?.count === "number" ? m.count : S._busyQueuedCount
  S._busyQueuedCount = count
  S._busyQueuedPending = count > 0
  if (Array.isArray(m?.items)) {
    const items = m.items.map((s) => String(s))
    S._busyQueuedItems = items
    renderBand(ctx, items)
  }
  if (typeof m?.merged === "string" && m.merged !== "") addUser(ctx, m.merged)
}

/** `clearMessages` ⇒ 带面复位（空带；镜像随握手 / 下一次快照重建——宿主权威，端侧不自持）。 */
export function clearPendingBand() {
  const band = document.getElementById("pending-band")
  if (!band) return
  band.replaceChildren()
  band.hidden = true
}
