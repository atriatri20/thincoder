/**
 * chat-wake.mjs — 会话空闲唤醒器（`agent/ADMIN-AGENT.md` §15.1 ∥ KD-SV-125；server-wake-face 批——2026-10-12 · 台账 #1319）：
 * **一器两源**（① 闩到点 ∥ ② 池结算钩子 `pad._asyncWaiters`）＋ 核策略复用（`fireTimerWake`：非空闲 ⇒ 零动作 ∥ 零交付零开轮）
 * ＋ **再武装三链尾**（用户回合尾 ∥ 唤醒回合尾 ∥ 结算钩子）。**零轮询**（源零 `setInterval`／零秒级 tick）；
 * 已到期不武装 0ms 闩（防自旋/惊群——交链尾/钩子消化）。
 *
 * 键面（一会话一闩 = 会话键面表形——同桌面 `suspension-timers.mjs`）：闩 = 核 `createTimerWatch`（`getAgent` 活读垫片、
 * `unref`——进程不因闩保活）；空闲判定 = **会话行 `status` 单源**（与在途门/`claimChatTurn` 同判——不设进程内忙旗）。
 * 判据面（§15.1）：`deliver` = **纯判据**（到期 timer ∨ `_pendingAsyncResults` 非空 ∨ 汇面留件——零消费）；开轮 =
 * `chat.mjs` `runChatWakeTurn`（惰性 import——零静态环）。缺核 ∥ 会话行读败 ⇒ 零动作（不炸进程——E56）。
 *
 * 注入口径（§11 测试注入缝先例）：`deps.coreTimers` = 核 `agent/timers.mjs` 面（缺省动载）；`deps.wakeTimer` / `deps.wakeClear`
 * = 闩计时器（缺省平台全局）；`deps` 其余字段（`chat` ∥ `tools` ∥ `coreTools` ∥ `cwd` ∥ …）透传唤醒轮。
 */
import { chatRowOr404 } from "./chat-store.mjs"
import { timerPadOf } from "./chat-env-tools.mjs"

let coreTimersCache = null // 动载缓存（仅成功态；装载失败不落缓存 ⇒ 下次调用重试）

/** 核 `agent/timers.mjs` 面（动载——沿 `loadCoreEnvTools` 先例；`deps.coreTimers` = 注入口）。 */
export async function loadCoreTimers(deps = {}) {
  if (deps?.coreTimers) return deps.coreTimers
  coreTimersCache ??= await import("@thincoder/core/agent/timers.mjs")
  return coreTimersCache
}

/** 会话键面闩表（一会话一闩；`getAgent` 活读——不捕获对象）。 */
const watches = new Map()
/** 各会话最近一次装配上下文（闩到点回调的取数面——每次装配刷新）。 */
const contexts = new Map()

/** 闩计时器注入面（缺省 = 平台全局——核闩契约：句柄可 `unref`）。 */
const timerOf = (deps) => (typeof deps?.wakeTimer === "function" ? deps.wakeTimer : setTimeout)
const clearOf = (deps) => (typeof deps?.wakeClear === "function" ? deps.wakeClear : clearTimeout)

/** 会话闩（惰性建——同会话多链尾共用单例）。 */
function watchOf(chatId, ctx) {
  const key = Number(chatId)
  let watch = watches.get(key)
  if (!watch) {
    watch = ctx.core.createTimerWatch({
      getAgent: () => timerPadOf(key),
      onFire: () => {
        const latest = contexts.get(key)
        if (!latest) return
        void fireChatWake({ chatId: key, ...latest }).catch((e) =>
          latest.log?.warn?.("chat_wake_failed", { chatId: key, message: e?.message ?? String(e) }))
      },
      timer: ctx.wakeTimer,
      clear: ctx.wakeClear,
      now: () => ctx.now(),
    })
    watches.set(key, watch)
  }
  contexts.set(key, ctx)
  return watch
}

/** 装配上下文（闩回调与链尾共取）。 */
const contextOf = ({ db, deps = {}, now = Date.now, log = null, core, senderId = null }) =>
  ({ db, deps, now, log, core, senderId, wakeTimer: timerOf(deps), wakeClear: clearOf(deps) })

/** 交付判据（**纯**——零消费、零副作用）：到期 timer ∨ 池在途结算 ∨ 汇面留件（零交付零开轮的钱货）。 */
export function hasPendingDelivery(pad, { now = Date.now, core = null } = {}) {
  if (typeof core?.pendingTimerDeadline !== "function") {
    throw new Error("交付判据缺件：pendingTimerDeadline（核 timers 面未注入）")
  }
  if (Array.isArray(pad?.history) && pad.history.length > 0) return true
  if (Array.isArray(pad?._pendingAsyncResults) && pad._pendingAsyncResults.length > 0) return true
  const deadline = core.pendingTimerDeadline(pad)
  return deadline !== null && deadline <= now()
}

/** 空闲判定（§15.1——会话行 `status` 单源；读败/行缺 ⇒ 视忙 = 零动作——E56）。 */
function isBusy(db, chatId) {
  try {
    return chatRowOr404(db, chatId).status === "running"
  } catch {
    return true
  }
}

/** 唤醒源（§15.1——域文本单源 = 核常量）：到期 timer ⇒ `"timer"`；余（后台任务结算）⇒ `"settle"`。 */
function sourceOf(pad, { now, core }) {
  const deadline = core.pendingTimerDeadline(pad)
  return deadline !== null && deadline <= now() ? "timer" : "settle"
}

/** 火（评估——核 `fireTimerWake` 策略复用）：非空闲 ⇒ 零动作；零交付 ⇒ 零开轮；真 ⇒ 开唤醒轮（`runChatWakeTurn`）。 */
export async function fireChatWake({ chatId, db, deps = {}, now = Date.now, log = null, core = null, senderId = null } = {}) {
  const timers = core ?? (await loadCoreTimers(deps))
  const key = Number(chatId)
  return timers.fireTimerWake({
    busy: isBusy(db, key),
    deliver: () => hasPendingDelivery(timerPadOf(key), { now, core: timers }),
    openTurn: async () => {
      const { runChatWakeTurn } = await import("./chat.mjs") // 惰性（零静态环——环体单源 = chat.mjs）
      await runChatWakeTurn({ db, chatId: key, source: sourceOf(timerPadOf(key), { now, core: timers }), deps, now, log, senderId })
    },
  })
}

/** 再武装（链尾共用——纯武装）：零在途/开关关 ⇒ 撤旧零注册；已到期 ⇒ 撤旧不武装 0ms 闩（交链尾/钩子消化）。
 *  出 = 武装延迟（毫秒）或 `null`（未武装）。 */
export async function armChatWake({ chatId, db, deps = {}, now = Date.now, log = null, senderId = null } = {}) {
  const core = await loadCoreTimers(deps)
  const key = Number(chatId)
  const watch = watchOf(key, contextOf({ db, deps, now, log, core, senderId }))
  const deadline = core.pendingTimerDeadline(timerPadOf(key))
  if (deadline !== null && deadline <= now()) {
    watch.disarm()
    return null
  }
  return watch.sync()
}

/** 链尾消化（用户回合尾 ∥ 结算钩子）：有交付 ⇒ 撤旧闩 + 火一次（已到期/留件——不武装 0ms 闩）；否则纯再武装。
 *  出 = 链尾是否已动作：有交付 ⇒ `true`（开火已发起；撞忙/零件由 `fireChatWake` 自行零动作、不在出参）——零交付 ⇒ 武装成功 `true` ∥ 已到期不武装 `false`。 */
export async function pumpChatWake({ chatId, db, deps = {}, now = Date.now, log = null, senderId = null } = {}) {
  const core = await loadCoreTimers(deps)
  const key = Number(chatId)
  if (hasPendingDelivery(timerPadOf(key), { now, core })) {
    watchOf(key, contextOf({ db, deps, now, log, core, senderId })).disarm()
    await fireChatWake({ chatId: key, db, deps, now, log, core, senderId })
    return true
  }
  return (await armChatWake({ chatId: key, db, deps, now, log, senderId })) !== null // 无交付再武装——随发送者（#45 上抛 1：漏透传 ⇒ 闩上下文刷 null ⇒ 唤醒轮回落主人）
}

/** 结算钩子（§15.1 ②——池结算尾唤醒面 `_asyncWaiters`）：核 `wakeAsyncWaiters` splice **一次性消费** ⇒
 *  钩子「**先自再武装、再评估**」。装配点 = `chat.mjs` 环境工具面 ctx 段（幂等同形覆写——单钩子）。 */
export function installSettleHook({ chatId, db, deps = {}, now = Date.now, log = null, senderId = null } = {}) {
  const key = Number(chatId)
  const pad = timerPadOf(key)
  pad._asyncWaiters = [() => {
    installSettleHook({ chatId: key, db, deps, now, log, senderId }) // 先自再武装（本钩子已被 splice 消费）
    void pumpChatWake({ chatId: key, db, deps, now, log, senderId }).catch((e) =>
      log?.warn?.("chat_wake_failed", { chatId: key, message: e?.message ?? String(e) })) // 再评估（异步不阻结算尾）
  }]
  return pad._asyncWaiters
}
