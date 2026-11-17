/**
 * suspension-drive.mjs — 桌面挂起驱动的**装配骨干**（消费核件 `startSuspension` —— `docs/desktop/design/PROJECT.md` §2 KD-34）。
 * 零宿主依赖 ⇒ 平 node 直测；零文案。
 *
 * 本档只做装配：持有五件状态（窗表 `windows` ∥ 窗队件 `queue` ∥ 续发期键集 `resuming` ∥ 中止墓碑
 * `abortTombstones` ∥ 闩面件 `timers`）、把注入缝分给四块语义档、交出对外面。语义住在四档里，档与档之间不互持状态
 * （分工表与零第二写者 = `docs/desktop/design/ACTIVITY.md` §2.1 ∥ §2.2）：
 *   ① `suspension-resident.mjs` — 驻留条目的读面与四个出口（起跑快照 ∥ 补发 `done` ∥ 自愈扫读 ∥ 退出残余注入）。
 *   ② `suspension-window-turn.mjs` — 窗内输入与回合（取件窗缝 ∥ 取项缝 ∥ 单回合 ∥ 步边界取批 ∥ 提示面）。
 *   ③ `suspension-window-open.mjs` — 建窗入口与计数帧 `postSusp`。
 *   ④ `suspension-window-close.mjs` — 出窗收束（摘窗 ∥ 出窗帧 ∥ 残值续发 ∥ 会话中止 ∥ 切项目全停）。
 * 对外面（11 键）住本档 `return` 块：`start` ∥ `turnDone` ∥ `stepBoundaryPickup` ∥ `pushInput` ∥ `active` ∥
 * `inputSnapshot` ∥ `abort` ∥ `abortAll` ∥ `armInbox` ∥ `size` ∥ `timerLatches` —— 逐字不动。
 */
import { QUEUED_MAX_ITEMS } from "@thincoder/core/queued.mjs"
import { createResidentFace } from "./suspension-resident.mjs"
import { createSuspensionTimers } from "./suspension-timers.mjs"
import { createWindowClose } from "./suspension-window-close.mjs"
import { createWindowOpen } from "./suspension-window-open.mjs"
import { createWindowTurn } from "./suspension-window-turn.mjs"
import { createWindowQueue } from "./window-queue.mjs"

/** 挂起驱动工厂（注入面）：`post(channel, payload)` = 出站面 · `runTurn(key, agent, text, opts)` = 单回合执行面（宿主既有三径结算提取
 *  —— `send` ∕ 驱动同源）· `reloadSlot(key, agent, cwd)` = 每轮起跑前按本窗键重装槽（§2.2 会话钉定；缺省 = 零动作）· `notify` = 提示面策略（缺省 = 零动作）·
 *  `busyOf(key)` ∕ `takeOver(key, agent)` = 空闲火面两注入面（在飞判据 ∕ 回合尾接管；缺省 ⇒ 恒假 ∕ 回落闩重同步）· `postQueue` ∕ `prepare` ∥ `degrade` = 窗队列三转口
 *  （缺省 ⇒ 零出站 ∕ 无附件径）· `hold(key)` = 降级窗占位（`suspension-guard.mjs`；缺省 ⇒ 零占位）· `timer` ∕ `clear` ∥ `now` = 闩时钟三扇注入缝。 */
export function createSuspensionDrive({ post, runTurn, reloadSlot = null, notify = null, busyOf = () => false, takeOver = null, postQueue = null, prepare = null, degrade = null, hold = null, timer = setTimeout, clear = clearTimeout, now = Date.now } = {}) {
  if (typeof post !== "function") throw new Error("[suspension-drive] post required (out-bound channel)")
  if (typeof runTurn !== "function") throw new Error("[suspension-drive] runTurn required (single-turn face)")
  /** 窗表：key → entry（`entry` = `{ key, agent, cwd, controller, frozen, handle, pending }`；`pending` = 残输入投影（富条目 `{ text, ts, images? }`——与忙态队同形））。 */
  const windows = new Map()
  /** 窗队投影 ∕ 帧构造面（出档 `window-queue.mjs` —— 受理 ∕ 步边界取批 ∥ 残倾出 ∥ 清队 + 六帧定点出站）。 */
  const queue = createWindowQueue({ postQueue, prepare, degrade })
  /** 续发期键集（窗已摘、残值续发链在跑——`abort` 的第二落点，免「中止窗口期」盲区）。 */
  const resuming = new Set()
  /** 续发期中止墓碑（键集）：链每轮起跑前 + 接管前查位——命中 ⇒ 停链，余值随会话终止（记错一行）。 */
  const abortTombstones = new Set()
  /** 后绑缝（open ↔ close 互指）：两闭包只在装配完成后被调（`handle.done` 回调 ∥ 残值链尾），故四档建齐后一次绑死，零行为差。 */
  const late = { exit: null, restart: null }
  const resident = createResidentFace({ post })
  const turn = createWindowTurn({ post, notify, runTurn, reloadSlot, hold, queue, resident, windows })
  /** 窗内时效面（出档 `suspension-timers.mjs`）：宿主供读缝（`inWindow` = 窗表判据 ∥ `busyOf` ∥ `takeOver`）+ 槽重装缝
   *  + 取件窗缝（回合档交出的同一函数对象）+ 时钟三扇；闩面接线住 `start` ∕ `closeWindow` ∥ `abort`（后两者在出窗档）。 */
  const timers = createSuspensionTimers({ post, runTurn, busyOf, inWindow: (key) => windows.has(key), takeOver, reloadSlot, windowTake: turn.windowTake, timer, clear, now })
  const close = createWindowClose({ post, windows, timers, queue, resident, runTurn, turnDone: turn.turnDone, hold, latches: { resuming, abortTombstones }, onRestart: (key, agent, opts) => late.restart(key, agent, opts) })
  const open = createWindowOpen({ post, windows, timers, queue, resident, turn, onExit: (entry, failure) => late.exit(entry, failure) })
  late.exit = close.closeWindow // 出窗档交出的结算体 —— `open` 的 `onExit` 转发件读这一绑定
  late.restart = open.start // 建窗档交出的入口 —— `close` 的 `onRestart` 转发件读这一绑定（实参形与 `start` 逐字同形，零适配）

  return {
    start: open.start,
    turnDone: turn.turnDone,
    stepBoundaryPickup: turn.stepBoundaryPickup, // 步边界取批（窗面——`turn-driver` 组合线「窗优先」消费）
    /** 窗内输入路由：窗在场 ⇒ 核件入槽 + 唤醒（用户输入优先序沿核件）；返回受理三态——`true` = 受理 ∕ `"full"`
     *  = 容量拒（#625：满判先行——零受理 ∕ 零投影 ∕ 零帧 ∕ 零唤醒）∕ `false` = 未入窗（调用方回落既有径）。
     *  载体同数组受理（`entry.pending`——核输入队列；消费点 = 核件取项缝 ∕ 步边界窗面）⇒ **受理帧**；
     *  **载具层携图**：`images`（渲染面 `toImages` 投影原样）随条目——核件输入面 = 文本单形不变。 */
    pushInput(key, text, images) {
      const entry = windows.get(key)
      if (!entry) return false
      if (entry.pending.length >= QUEUED_MAX_ITEMS) return "full" // 容量判满（对齐 VSC ≥MAX 拒——核零改）
      const msg = String(text)
      queue.accept(key, entry.pending, msg, images) // 受理（富条目——与核输入队列同数组）+ 受理帧
      entry.handle.wake() // 核件唤醒（新条目已在同数组——零第二写者）
      return true
    },
    /** 窗在场判据（`msg:send` 路由分岔点 —— 键面路由 = `docs/desktop/design/PROJECT.md` §2.2）。 */
    active(key) { return windows.has(key) },
    /** 窗输入队投影读面（并源读面窗半 —— 宿主 `queueView` 懒取；未入窗 ∕ 空队 ⇒ `[]`；图不入快照）。 */
    inputSnapshot(key) { return queue.snapshot(windows.get(key)?.pending) },
    abort: close.abort,
    /** 切项目（`project:open` 成功且 cwd 变更）：旧项目**全键**中止（窗 ∥ 续发链——§2.2 键面 ∕ 取值面双错位防护）；返回中止数。 */
    abortAll: close.abortAll,
    /** 会话起点武装点（会话键槽创建 = `turn-driver.mjs` 的 `ensure` 包装处）：只装取件闩（timer 闩由回合尾判据决定）。
     *  **回合起点无对应撤闩面**（D-MI31 自续闩）。`suspension-timers.mjs` 的 `armInbox` 转口—— 调用面
     *  `turn-driver.mjs` 一直在叫这个键：本档漏了这个出口就是「桌面取件面从不武装」（会话起点即抛、消息无人取）。 */
    armInbox: (key, agent) => timers.armInbox(key, agent),
    /** 窗数读数（诊断 ∕ 测试）。 */
    size() { return windows.size },
    /** 闩数读数（诊断 ∕ 测试 —— 撤闩清点断言；闩表为档内私有面）。 */
    timerLatches() { return timers.size() },
  }
}
