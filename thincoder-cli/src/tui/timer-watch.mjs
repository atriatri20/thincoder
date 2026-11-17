/**
 * timer-watch.mjs — timer 空闲唤醒端面壳（CLI：判据族 + 显示裁 + 核转口）。
 *
 * 机制单源 = `docs/core/design/AGENT-LOOP-ASYNC-POOL.md` §6.30（闩 ∕ 派发 ∕ 火策略住核
 * `thincoder-core/agent/timers.mjs`——B3 批改指 = §6.30.16；显示形态 = `docs/cli/design/TUI.md` §7.6）。
 * 本档零自持闩 ∕ 零判据副本：`createTimerWatch` ∕ `deliverExpiredTimers` ∕ `fireTimerWake` = 核转口
 * （签名与返回零变——存量批测冻结面）· `timerWakeEnabled` = 核 re-export；注入缝：`timer` / `clear` / `now`（可测性 · 零真实等待）。
 */
import {
  createTimerWatch as coreCreateTimerWatch,
  deliverExpiredTimers as coreDeliverExpiredTimers,
  fireTimerWake as coreFireTimerWake,
  timerWakeEnabled,
} from "@thincoder/core/agent/timers.mjs"
// 跨实例投递面（MULTI-INSTANCE-COLLAB「取件闩」「消息落法」）：取件闩 + 消息形态 + 名册——核转口（本档零自持闩）。
import { createInboxWatch as coreCreateInboxWatch, crossMessageText, inboxTakeLostLine, inboxBlockedLine } from "@thincoder/core/instance-inbox-watch.mjs"
import { registerInstance, unregisterInstance } from "@thincoder/core/instance-registry.mjs"
import { C } from "./ansi.mjs"
import { REMINDER_CAP } from "./tool-display.mjs"

export { timerWakeEnabled } // 判据单源转口（§6.30.3 门三件③ D-TW5）：默认开——只有显式 `false` 才关（键 `agent.timerWake`）
export { registerInstance, unregisterInstance, crossMessageText, inboxTakeLostLine, inboxBlockedLine }

/** 「唤醒会武装」判据（`docs/cli/design/TUI.md` §7.1 awaiting 行除外 / §7.2 置位谓词）：主 agent 在途 timer
 *  非空 ∧ 开关开 ⇒ 自动续跑在途（不计 attention / 闩会在回合链尾武装）。 */
export function timerWakeArmed(agent) {
  return timerWakeEnabled(agent) && (agent?._pendingTimers?.length ?? 0) > 0
}

/** 触发落流形态（TUI.md §7.6）：逐字 = 系统提醒原文；三行 + 省略号上限同既有提醒镜像口径
 *  （`tool-events.mjs`，`REMINDER_CAP` 单源）。 */
export function reminderDisplay(text) {
  const lines = String(text).split("\n")
  return lines.length > REMINDER_CAP ? lines.slice(0, REMINDER_CAP).join("\n") + "\n…" : text
}

/** 到期批送达（两路共用：空闲闩 fire ∥ 挂起窗第三兑现态）：核派发（出列幂等 → 注入历史）+ `onLine` 落流（显示裁 `reminderDisplay`）；返回送达条数（0 = 无到期项——零注入零行）。 */
export function deliverExpiredTimers(ctx, now = Date.now()) {
  const { agent, pushLine } = ctx
  return coreDeliverExpiredTimers(agent, { now, onLine: (line) => pushLine(reminderDisplay(line), C.warn) }).length
}

/** 一次性 deadline 闩转口（KD-B3-1 · 签名零变）：`agent` 缝 ⇒ 核 `{getAgent: () => agent}` **冻结捕获**（与改前
 *  逐字同判——`turnCtx.agent` 实读零写点）；闩体全责 = 核 `createTimerWatch`（武装 ∕ 到点自撤 ∕ 重臂撤旧 ∕ 开关关零注册）。 */
export function createTimerWatch({ agent, onFire, timer = setTimeout, clear = clearTimeout, now = Date.now } = {}) {
  return coreCreateTimerWatch({ getAgent: () => agent, onFire, timer, clear, now })
}

/** 用户自发模态判据（#448① · KD-6——单源：火面抑制 ∥「关闭后补评估」两处同谓词）：picker ∕ wizard ∕
 *  团队问句面（登录面补全批——模态族第三支 `state.teamAsk`）在场即真（工具权限 ∕ 提问面板属**在飞回合**
 *  面——由 `state.processing` 门承担，不入本判据）。 */
export function modalOpen(state) {
  return state?.picker != null || state?.wizard != null || state?.teamAsk != null
}

/** 跨实例取件闩（MULTI-INSTANCE-COLLAB「取件闩」· D-MI28 ∥ D-MI31 ∥ D-MI34）：核 `createInboxWatch` 转口。
 *
 *  **两个谓词各答一件事**：
 *  ① `isBusy` = **已有一轮在飞**，只认 `state.processing`。挂起窗（`state.suspended` ∥ `state._suspPending`）不算——
 *    窗口在跑不等于回合在跑，把窗口算忙就是「有子代理在跑就永远收不到消息」。窗口在场时取件走 `onTake` 的入窗
 *    一支（见 `createInboxTake`），不在这里拦。
 *  ② `ready` = 这一端此刻能不能开一轮 = **无用户自发模态在场**（`modalOpen` 为假）。面板在场不是「忙」，是
 *    「此刻别插一轮」——混成一个就分不出该等什么。受阻因由因此从 `busy` 变 `carrier`（受阻行文案不变）。
 *    载体（回合面）与会话同建同毁 ⇒ 除面板外无假侧（设计「取件闩」的两端落点：CLI 的 ready 只由 `modalOpen` 闸住，
 *    「CLI 恒真」指的是载体恒有，不是 ready 恒真）。
 *
 *  `onTake` = 取件后开轮面（普通用户回合：`autoTurn` 缺省 false——手动态照常走审批面），**返回 promise**
 *  （resolve = 有着落；reject = 开轮没成——失败单源，见核档交接契约）；**不收 agent**——载体住本档闭包捕获
 *  （D-MI34：核闩不从端壳对象上推载体）。体 = `createInboxTake`（两条去路）。
 *  `onBlocked(ms, pending)` = 受阻跨阈可见行 ∥ `onPending(n)` = 待取条数常驻面（接线 = `index.mjs`）。 */
export function createInboxWatch({ state, onTake, onBlocked = null, onPending = null, timer = setTimeout, clear = clearTimeout } = {}) {
  return coreCreateInboxWatch({
    ready: () => !modalOpen(state), // 面板在场 = 此刻别插一轮（不是「忙」）
    isBusy: () => Boolean(state?.processing), // 只认在飞回合：挂起窗不算忙
    onTake,
    onBlocked,
    onPending,
    timer,
    clear,
  })
}

/** 取件后开轮面（`onTake` 的体 · CLI 落点）：两条去路——**有活挂起窗 ⇒ 入窗队列 + 唤醒**（窗在步边界起轮，
 *  宿主 `turn` 零调用），否则开**普通用户回合**（`autoTurn` 缺省 false——手动态照常走审批面）。
 *  返回 promise：resolve = 消息有着落（这一轮已登记为在飞 ∥ 已进活窗口的输入队列——窗口先退出则残项由挂起会话
 *  出窗回填 `state.pendingInput`，宿主队列本就由回合尾兜底与步边界取批消费）；reject = 没有去路（开轮没成）。
 *  **恒不带 `resume`**：走 resume 时那一串不落成 user 消息，而消息取件时已离盘 ⇒ 静默丢。
 *  @param {{ state: object, turn: Function, pushLine: Function }} p */
export function createInboxTake({ state, turn, pushLine }) {
  return (messages) => {
    const text = crossMessageText(messages)
    // ① 已开的挂起窗 ∥ 打开在即的释放窗口（与 `key-handler-busy.mjs` ∥ `key-handler-edit.mjs` 的入队判据同形）：
    // 进窗输入队列 + 唤醒核句柄（与 Enter 入队同数组、同唤醒面）。`_suspPending` = 上一轮尾部仍在跑
    // （标题生成 ∥ 蒸馏 flush ∥ 落盘）、挂起会话尚未启动的窗口——那一拍若开顶层回合，就是两个 runAgent 循环同时写
    // 同一份 history（`_suspPending` 本就是为挡这个而设的）。此时 `_suspWake` 可能仍为 null（会话未起）⇒ 可选调用；
    // 消息留在队列，会话启动后按输入优先消费（兜底径同在：池空时回合尾直接取）。
    if (state?.suspended === true || state?._suspPending === true) {
      state.pendingInput ??= []
      state.pendingInput.push(text)
      state._suspWake?.()
      return Promise.resolve()
    }
    // ② 无窗：开普通用户回合（`turn()` 的同步前缀已置 `state.processing` ⇒ 返回时即可读）
    const run = turn(text, {})
    // 回合内错误照旧可见（不是「开轮没成」——processing 已置 ⇒ 这一轮真的开了）
    void run.catch((e) => pushLine(`[error] ${e?.message ?? e}`, C.error))
    if (state.processing === true) return Promise.resolve()
    pushLine(inboxTakeLostLine(messages), C.warn) // D-MI32：消息已离盘 ⇒ 只能当场明说
    return Promise.reject(new Error("inbox-watch: turn did not start"))
  }
}

/**
 * 空闲闩触发（§6.30.3 开轮两处① = 核策略 + 端两缝——B3 改指 §6.30.16）：**非空闲零动作**（processing ∥
 * suspended ∥ `_suspPending` ∥ `modalOpen`——在途表零触碰，链尾重同步再武装）；**模态期抑制**（#448① KD-6）：
 * 模态在场 ⇒ 零送达零开轮（兑现交**关闭后补评估**——装配 = `index.mjs` `onModalClose`）；空闲 ⇒ 到期批送达 +
 * 开 timer 轮（顶层链：`skipSession` 缺省）。@returns {Promise<boolean>} 是否开轮
 */
export async function fireTimerWake(ctx, { runTurn, now = Date.now } = {}) {
  const { state } = ctx
  return coreFireTimerWake({
    busy: state.processing || state.suspended || state._suspPending || modalOpen(state),
    deliver: () => deliverExpiredTimers(ctx, now()) > 0,
    openTurn: () => (runTurn ?? ctx.runTurn)("", { autoTurn: true, timerTurn: true }),
  })
}
