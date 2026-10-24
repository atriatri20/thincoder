/**
 * queued-mark.mjs — busy 排队「待发送」标记原语（核化 VSC `webview/queued-mark.js` 的标记口径）。
 *
 * 保留面（各有活消费者）：`paintLabel`（桌面说话人标签落笔 `thincoder-desktop/renderer/views/chat-text.mjs`）·
 * `markPending` ∕ `clearPending`（服务端两档 `public/views-chat-composer.mjs` ∕ `views-me-chat-composer.mjs`）·
 * `QUEUED_MAX_ITEMS`（队列容量值——核 composer ∕ 桌面 `renderer/queue.mjs`）。
 * VSC 待发送面自 2026-10-20（queue-band 批）改为输入区上沿派生带 ⇒ 快照推演 `planBusyQueued`
 * 零消费者，已退役；契约单源 = `docs/vsc/design/WEBVIEW-INPUT.md` §1 C-B2-6 ⑦。
 */
import { t } from "../i18n.mjs"
import { fmtTime } from "../lib.mjs"

/** 队容量（webview 面副本——值同 `src/extension/queued-merge.mjs` 与 CLI `queued-merge.mjs`；
 *  浏览器面不 import 扩展模块 ⇒ 双写登记）。 */
export const QUEUED_MAX_ITEMS = 8

/** 标签行常态重建（`❯ <user>:` + ts——"无 ts 不显示"纪律：无 `data-ts` ⇒ 零 ts 段）。 */
export function paintLabel(el) {
  const label = el.querySelector(".msg-label")
  if (!label) return
  const ts = el.dataset.ts ? fmtTime(new Date(Number(el.dataset.ts))) : ""
  label.innerHTML = `❯ ${t("msg.user")}:${ts ? ` <span class="msg-time">${ts}</span>` : ""}`
}

/** 标记（幂等）：类 `pending` + 标签行换 `⏳ <queued.pending>`（原文照常显示——时间缺席）。 */
export function markPending(el) {
  if (!el || el.classList.contains("pending")) return
  el.classList.add("pending")
  const label = el.querySelector(".msg-label")
  if (label) label.innerHTML = `⏳ ${t("queued.pending")}`
}

/** 清标（幂等）：类去除 + 标签行回常态（气泡不删——回声面）。 */
export function clearPending(el) {
  if (!el) return
  el.classList.remove("pending")
  paintLabel(el)
}
