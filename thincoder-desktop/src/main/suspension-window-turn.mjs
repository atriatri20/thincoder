/**
 * suspension-window-turn.mjs — 挂起窗的**窗内输入与回合面**（自 `suspension-drive.mjs` 拆出 —— 该档
 * `createSuspensionDrive` 越函数硬线，按 `docs/desktop/design/ACTIVITY.md` §2.1 表落形；
 * 批档 = `docs/batches/2026-11-14-suspension-drive-split.md` §2）。
 *
 * **管什么**：窗内输入与回合 —— 取件窗缝 `windowTake`（受理 + 核件唤醒）· 取项缝 `takeQueuedInput` ·
 * 单回合 `driveTurn`（用户 ∥ 消化 ∥ 唤醒三径）· 步边界取批 `stepBoundaryPickup` · 提示面 `turnDone`。
 * **不管什么**：不建窗、不结算出窗；不持闩面与中止代次；窗表只读——`windowTake` ∥ `stepBoundaryPickup`
 * 各一处 `windows.get(key)`，窗表写点仍只有建窗档的置入与出窗档的摘除两点。
 *
 * 零宿主依赖（全部能力经注入缝进来）⇒ 平 node 直测；零文案。
 */
import { backgroundCounts } from "@thincoder/core/agent/suspension.mjs"
import { upstreamAskLabelVars } from "@thincoder/core/agent-tools/parent-channel.mjs"
import { pushReal } from "@thincoder/core/context.mjs"
import { takeQueuedBatchItem } from "@thincoder/core/queued.mjs"
import { cleanupTurn } from "./attachments.mjs"
import { appendRecord } from "./session-io.mjs"
import { guardedDeliver } from "./suspension-guard.mjs"

/** 窗内回合面工厂：`post(channel, payload)` = 出站面 · `notify` = 提示面策略（缺省 `null` ⇒ 零动作）·
 *  `runTurn(key, agent, text, opts)` = 单回合执行面（宿主既有三径结算提取面）· `reloadSlot(key, agent, cwd)` =
 *  每轮起跑前按本窗键重装槽（缺省 `null` ⇒ 零动作）· `hold(key)` = 降级窗占位（缺省 `null` ⇒ 零占位）·
 *  `queue` = 窗队投影面 · `resident` = 驻留面（快照 ∥ 补发 ∥ 自愈扫读）· `windows` = 窗表（只读）。
 *  返回 `{ windowTake, takeQueuedInput, driveTurn, stepBoundaryPickup, turnDone }`。 */
export function createWindowTurn({ post, notify = null, runTurn, reloadSlot = null, hold = null, queue, resident, windows } = {}) {
  for (const [name, seam] of Object.entries({ post, runTurn })) if (typeof seam !== "function") throw new Error(`[suspension-window-turn] ${name} required (injected seam)`)
  for (const [name, seam] of Object.entries({ queue, resident, windows })) if (seam === null || typeof seam !== "object") throw new Error(`[suspension-window-turn] ${name} required (injected seam)`)

  /** **取件窗缝**（MULTI-INSTANCE-COLLAB「取件闩」· 形同 `reloadSlot` 注入缝）：窗在场 ⇒ 取件消息进窗输入队列
   *  （载体数组单一 = `entry.pending`，与用户输入同数组、同受理帧）+ 唤醒核句柄（窗在步边界起轮）；返回是否受理。
   *  窗不在 ⇒ `false`（取件走开轮面）。**不做容量拒**：`QUEUED_MAX_ITEMS` 是用户输入的受理门（人可再按一次 Enter），
   *  而取件消息**已离盘**——拒了就是丢，故与 `pushInput` 分面。 */
  function windowTake(key, text) {
    const entry = windows.get(key)
    if (entry === undefined) return false
    queue.accept(key, entry.pending, text) // 同数组受理（富条目 `{ text, ts }`）+ 受理帧
    entry.handle.wake() // 核件唤醒（新条目已在同数组——零第二写者）
    return true
  }

  /** 提示面档①（用户回合完成 —— `!autoTurn` 且成功径）：调用面两处 = 宿主 `send` 成功径（窗内 ⇒ 本档包装收尾）。
   *  **单一定义点就在这里**：出窗档的残值续发回合收的是本函数对象，不另建一份（重建 = 第二定义）。 */
  function turnDone(key, agent) { return notify?.turnDone?.({ key, agent }) ?? false }

  /** 窗取项缝（核 `ctx.takeInput`——缺省 `shift`）：核件取项（合并批 ∕ 携图退化逐条——与尾径 ∕ 残值同一
   *  取项单源）；返回富条目（`null` ⇒ 本步零动作、条目留队——落核第 2 步）。送达面 ∕ 消费帧由 `driveTurn`
   *  用户回合支完成（零二次取）。 */
  function takeQueuedInput(list) { return takeQueuedBatchItem(list).item }

  /** 窗步边界取批（步边界缝读面窗半——`turn-driver` 组合为「窗优先」）：计划首动作即消费（`slash` 同判——
   *  统一语义）+ 携图批整批让位（同步缝不可降级——与链径同判据）+ `pushReal` + 消费回执帧（消费即帧——快照整置）；
   *  返回是否注入（未入窗 ∕ 空队 ∕ 让位 ⇒ false——零动作零帧）。 */
  function stepBoundaryPickup(key, agent) {
    const entry = windows.get(key)
    if (!entry) return false
    const picked = queue.stepPickup(entry.pending)
    if (picked === null) return false
    pushReal(agent, { role: "user", content: picked.text }) // 下一步生效（非中断通道）
    queue.emitDelivery(key, picked) // 消费回执帧出站（消费即帧——快照整置；单源 = 窗队件 `emitDelivery`）
    return true
  }

  /** 窗内单回合（用户回合 ∥ 消化轮 ∥ 唤醒轮）：每轮起跑前重装本窗键槽（§2.2）；autoTurn 支**起跑**一发边界（`start` 记录同点双动作 —— #719；**归档 = 起跑窗** —— 本批 2026-10-01 复位：起跑支对起跑快照逐条补发 `done` = 主面 ∥ `hooks.reclaim` = 兜底幂等）。收尾 `end` 写点前移入 `turn-face.mjs`。
   *  失败向核件抛回（核 catch 语义：AbortError ⇒ 回合级重入；非 Abort ⇒ 端侧入口 catch）。
   *  用户回合 = 核件取项（`takeInput` 缝——零二次取）后的**送达点**（起窗（`hold` 占位）⇒ 送达面（携图径，判决随 `delivered.degraded`）⇒ 消费帧——`delivered` 单写者）；
   *  窗后占位被摘 ⇒ 零起跑 + 本径落盘件自清 ∧ 不重投（裁定 (i) 同不变量 —— 判据同链径）。 */
  async function driveTurn(entry, item, opts = {}) {
    const { key, agent, cwd, controller } = entry
    const autoTurn = opts.autoTurn === true
    const upstreamTurn = opts.upstreamTurn === true
    const timerTurn = opts.timerTurn === true
    // 边界帧面 = 消化 ∕ 上行两族（`ev:digest`）；timer 轮的可见面 = `ev:timer` 落流（CLI 同判——timer 轮不冒充消化边界）
    const boundary = autoTurn && !timerTurn
    let body = typeof item === "string" ? item : ""
    let attached = null
    if (!autoTurn) { // 用户回合（取项已由 `takeInput` 缝完成——核件取项，零二次取）：送达面 ⇒ 消费帧
      const { stillHeld, consumed } = await guardedDeliver(key, hold, (signal) => queue.consume(key, item, agent, signal))
      if (!stillHeld) { // 窗后零起跑判据：零起跑 ∧ 不重投（条目已摘——不复位；消费帧已出——不追回）
        cleanupTurn(consumed?.attached?.paths ?? []) // 本径落盘件自清（回合尾清理面不达）
        return
      }
      body = consumed.text
      attached = consumed.attached
    }
    if (boundary) {
      const n = backgroundCounts(agent).pending // 起跑数（run 首行注入之前读 —— 与 VSC 起跑 post 同点）
      const ask = upstreamTurn ? upstreamAskLabelVars(agent) : null
      const start = { status: "start", n, ...(upstreamTurn ? { tier: "ask", ...(ask ?? {}) } : {}) } // 记录 ∥ 帧同源形
      post("ev:digest", { key, ...start }) // 边界帧（同点双动作 —— 发帧 ∥ 记录）
      appendRecord(agent, { kind: "digest", ...start }) // 留档记录（#719 —— 人读线半，机器线零触）
      // 起跑窗复位（本批 2026-10-01 裁 A —— **主面**）：起跑刻 pending 快照逐条补发 `done` ⇒ `settled`
      // 待消化块随起跑归档入流（居消费轮行族之后）；`hooks.reclaim` = 兜底幂等。
      resident.reemitDone(key, resident.pendingSnapshot(agent))
      resident.sweepDigestedStuck(key, agent) // 已消化驻留块自愈（2026-10-06——#76 残块事故；三拍之一）
    }
    if (!timerTurn) reloadSlot?.(key, agent, cwd) // 会话钉定：回合落槽面 = 本窗键槽（非现刻 activeSession —— 切会话零影响）；
    // timer 轮零重装（#799）：该轮重装已前移入 `suspension-timers.mjs` `deliver`（先于投递）——二次重装会再吞一行。
    // 收尾边界 `end`（发帧 ∥ 记录）随写点前移入 `turn-face.mjs` 结算序（修复轮 3 —— 先于槽落盘 ⇒
    // 「收束后即时重载末轮痕缺」消解）；失败径同出（抛出直达调用面 —— 本档零 catch 包裹，净简化）。
    await runTurn(key, agent, body, { autoTurn, upstreamTurn, timerTurn, sessionSignal: controller.signal, attached })
    if (!autoTurn) turnDone(key, agent) // 档①：窗内用户回合完成（成功径——与宿主 `send` 径同一判据）
  }

  return { windowTake, takeQueuedInput, driveTurn, stepBoundaryPickup, turnDone }
}
