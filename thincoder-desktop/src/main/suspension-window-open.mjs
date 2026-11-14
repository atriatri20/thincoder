/**
 * suspension-window-open.mjs — 挂起窗的**建窗面**（自 `suspension-drive.mjs` 拆出 —— 该档
 * `createSuspensionDrive` 越函数硬线，按 `docs/desktop/design/ACTIVITY.md` §2.1 表落形；
 * 批档 = `docs/batches/2026-11-14-suspension-drive-split.md` §2）。
 *
 * **管什么**：建窗入口 `start` —— 同键判重、池判真、装核件手柄与 hooks、挂会话控制器、登记出窗结算；
 * 计数帧 `postSusp`（`ev:susp {active:true}`）的**唯一定义点**，经 `onCounts` 钩子发出。
 * **不管什么**：不做出窗结算本身（`onExit` 交 close 档）；不续发残值；不改核件注入器；不碰闩体
 * （`timers` 只按既有的面调 `sync` ∥ `disarmTimer` ∥ `faceOf`）。
 *
 * 零宿主依赖（能力全经注入缝与核件进来）⇒ 平 node 直测；零文案。
 */
import { backgroundCounts, poolLive, startSuspension } from "@thincoder/core/agent/suspension.mjs"

/** 建窗面工厂：`post(channel, payload)` = 出站面 · `windows` = 窗表（置入点之一）· `timers` = 窗内时效面 ·
 *  `queue` = 窗队投影面（本档体内零读点——`queue.clear` 住出窗档；按 §2.1 表保留该缝，装配档照传）· `resident` = 驻留面 ·
 *  `turn` = 窗内回合面（`driveTurn` ∥ `takeQueuedInput`）· `onExit(entry, failure)` = 后绑的出窗结算（由装配档在建齐四档后一次绑死；
 *  `entry` = 窗表里那个载体，`failure` = `null`（兑现）∥ 错误对象（拒绝））。
 *  返回 `{ start }`。 */
export function createWindowOpen({ post, windows, timers, queue, resident, turn, onExit } = {}) {
  for (const [name, seam] of Object.entries({ post, onExit })) if (typeof seam !== "function") throw new Error(`[suspension-window-open] ${name} required (injected seam)`)
  for (const [name, seam] of Object.entries({ windows, timers, queue, resident, turn })) if (seam === null || typeof seam !== "object") throw new Error(`[suspension-window-open] ${name} required (injected seam)`)

  /** 计数帧（`ev:susp` —— 核 `backgroundCounts` 直传：`{ key, active, running, queued, pending, done }`）。 */
  const postSusp = (key, agent, active, counts = null) => post("ev:susp", { key, active, ...(counts ?? backgroundCounts(agent)) })

  /** 入口（回合尾结算后 —— 终局事件已出 · 在飞表已释）：`poolLive(agent)` 判真 ⇒ 进挂起会话（核件直消费）。
   *  返回是否入窗（同键已有窗 ∥ 池空 ⇒ false——零动作）。 */
  function start(key, agent, { cwd = null } = {}) {
    if (windows.has(key)) return false // 同键已有窗 ⇒ 零动作（窗内 deadline 由 `timerFace` 单持——不另武装）
    if (!poolLive(agent)) { timers.sync(key, agent); return false } // 未入窗 ⇒ 武装空闲闩（§6.30.11 装配点①）
    timers.disarmTimer(key) // 入窗 ⇒ 只撤空闲闩（窗内同一 deadline 由 timerFace 单持——零双注册）；取件闩不撤（D-MI31）
    const controller = new AbortController()
    const entry = { key, agent, cwd, controller, frozen: null, handle: null, pending: [] }
    windows.set(key, entry)
    agent._sessionAbort = controller // 会话控制器（窗内 spawn 的 children 链 `_sessionSignal` —— 回合级中止不孤儿化）
    agent._sessionSignal = controller.signal
    const handle = startSuspension({
      carrier: agent,
      inputQueue: entry.pending, // 载体数组单一（受理 ∕ 消费 ∕ 残值 ∕ 清队同数组——零第二写者）
      abortSignal: controller.signal,
      runTurn: (text, opts) => turn.driveTurn(entry, text, opts),
      takeInput: (list) => turn.takeQueuedInput(list), // 取项缝（核件取项——合并批 ∕ 携图退化逐条）
      injectResidual: (item) => resident.injectResidual(agent, item),
      timerFace: timers.faceOf(key, agent, cwd), // opt-in timer 面（§6.30.10）：窗内到期 ⇒ 兑现开 timer 轮（不等池空；#799：`deliver` 内先重装后投递）
      // 核件 `hooks.onDigest` 为**备用面**（非 Abort 失败径不出 `end` ⇒ 不可作主取点）：**本档不注册该钩 —— 零双帧**
      // （边界帧 ∥ 留档的单点 = 回合档 `driveTurn`；在此补注册一枚就是第三处发帧）。
      hooks: {
        onCounts: (counts) => { postSusp(key, agent, true, counts); resident.sweepDigestedStuck(key, agent) }, // 计数 ⇒ `ev:susp`（核单点直传）+ 自愈扫拍
        reclaim: (consumed) => { resident.reemitDone(key, consumed); resident.sweepDigestedStuck(key, agent) }, // 回收 ⇒ 兜底幂等（起跑窗漏口 ∥ 迟结算面——本批 2026-10-01）+ 自愈扫拍
        freezeAll: () => { // 冻结 ⇒ 退出兜底同型（残项逐条补发；abort 径用中止前快照）
          const frozen = entry.frozen ?? resident.resident(agent)
          entry.frozen = null
          resident.reemitDone(key, frozen)
        },
      },
    })
    entry.handle = handle
    /** 出窗结算登记（兑现 ∥ 拒绝两径同点 —— 结算体住 close 档，本档只登记调用）：先于 `return` 挂链尾。 */
    handle.done.then(() => onExit(entry, null), (err) => onExit(entry, err))
      .catch((err) => console.error(`[suspension-drive] window ${key} exit chain failed: ${err?.message ?? err}`)) // 出窗链自吞错（帧发射抛不升为未处理拒绝）
    return true
  }

  return { start }
}
