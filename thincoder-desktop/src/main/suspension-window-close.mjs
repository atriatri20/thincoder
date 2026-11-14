/**
 * suspension-window-close.mjs — 挂起窗的**出窗收束面**（自 `suspension-drive.mjs` 拆出 —— 该档
 * `createSuspensionDrive` 越函数硬线，按 `docs/desktop/design/ACTIVITY.md` §2.1 表落形；
 * 批档 = `docs/batches/2026-11-14-suspension-drive-split.md` §2）。
 *
 * **管什么**：出窗收束面 —— `closeWindow` 摘窗与出窗帧、残值续发 `resumeResidual`、会话中止 `abort`、
 * 切项目全停 `abortAll`；出窗帧 `postSuspEnd`（`ev:susp {active:false}`）的**唯一定义点**，经 `closeWindow` 发出。
 * **不管什么**：不建窗（重启经 `onRestart` 回建窗档）；不改核件注入器；不自建提示面（`turnDone` 收的是
 * 回合档交出的那个函数对象）。
 *
 * 零宿主依赖（能力全经注入缝进来）⇒ 平 node 直测；零文案。
 */
import { backgroundCounts } from "@thincoder/core/agent/suspension.mjs"
import { takeQueuedBatchItem } from "@thincoder/core/queued.mjs"
import { cleanupTurn } from "./attachments.mjs"
import { guardedDeliver } from "./suspension-guard.mjs"

/** 出窗面工厂：`post(channel, payload)` = 出站面 · `windows` = 窗表（摘除点之一）· `timers` = 窗内时效面 · `queue` = 窗队投影面 ·
 *  `resident` = 驻留面（冻结快照读面）· `runTurn(key, agent, text, opts)` = 单回合执行面 · `turnDone(key, agent)` = 回合档交出的提示面（同一函数对象，零第二定义）·
 *  `hold(key)` = 降级窗占位（缺省 `null` ⇒ 零占位）· `latches` = 两族闩件（`{ resuming, abortTombstones }`）· `onRestart(key, agent, { cwd })` = 后绑的建窗入口（与 `start` 形参逐字同形，由装配档原样注入）· 返回 `{ closeWindow, resumeResidual, abort, abortAll }`。 */
export function createWindowClose({ post, windows, timers, queue, resident, runTurn, turnDone, hold = null, latches, onRestart } = {}) {
  for (const [name, seam] of Object.entries({ post, runTurn, turnDone, onRestart })) if (typeof seam !== "function") throw new Error(`[suspension-window-close] ${name} required (injected seam)`)
  for (const [name, seam] of Object.entries({ windows, timers, queue, resident, latches })) if (seam === null || typeof seam !== "object") throw new Error(`[suspension-window-close] ${name} required (injected seam)`)
  const { resuming, abortTombstones } = latches

  /** 出窗帧（`ev:susp {active:false}` —— 计数直传同计数帧）：**`interrupted` 键恒在场**（#554①：会话中止事实——判定值 = 会话控制器信号；自然退出 `false` —— 布尔形不伪造）。
   *  对位 VSC `suspension.mjs` `postSuspensionEnd`；消费面 = 渲染面出窗归档注记（`subagent-reduce.mjs` `freezeAllSubBlocks` —— `ev.interrupted === true`）。 */
  const postSuspEnd = (key, agent, interrupted) => post("ev:susp", { key, active: false, interrupted: interrupted === true, ...backgroundCounts(agent) })

  /** 残输入兜底（KD-34 —— 出窗残值非空 ⇒ 以**普通回合**续发，不静默丢；VSC 队列兜底同形）：**按核件取项分批**
   *  （合并批 ∕ 携图退化逐条——同一取项循环）⇒ 送达面 ⇒ 消费帧 ⇒ `runTurn`（宿主既有三径结算提取面——`send` 同源，
   *  零新径）+ 档①（成功径，同 `send` 判据）；续发毕回合尾接管同形（池仍 live ⇒ 新窗——池内残余自愈链的常规入口）。
   *  残值为空 ⇒ 零动作（不接管：池内自愈 = 下一回合尾，同设计失败面）。
   *  **降级窗占位**（`hold`——两调用点同判，守卫序列 `guardedDeliver`）：逐批起窗 ∕ 查位 ∕ `release`；窗后占位被摘 ⇒ 零起跑 + 本径落盘件自清 ∧ 不重投。
   *  **中止检查点**（续发期窗已摘 ⇒ `abort` 经 `resuming` ∕ `abortTombstones` 落位）：每批起跑前 + 接管前查位——命中 ⇒ 停链（余值随会话终止——记错一行，非静默）且**不接管**（会话已亡 ⇒ 零复活窗）。
   *  **弃件链尾帧（#912）**：两弃件出口（墓碑 `return` 前 ∥ `!stillHeld` 断点）各补一次 `queue.emitState` —— 弃余件零帧漏点消（倾出后未消费即弃 ⇒ 镜面亦恒收口；快照整置 · 幂等）；**全消费正常径零增帧**（逐条消费帧已收口）。
   *  **弃余计数（#912）**：`!stillHeld` 分支 = **取批前**余量（含本批已取未达件）；墓碑分支 = 倾出后未被取余量。 */
  async function resumeResidual(entry) {
    const items = queue.drain(entry.pending) // 残值倾出（倾出后按核件取项分批）
    if (items.length === 0) return
    resuming.add(entry.key)
    let dropped = 0
    try {
      for (;;) {
        if (abortTombstones.has(entry.key)) { dropped = items.length; break } // 续发期中止 ⇒ 停链
        const before = items.length // 取批前余量（弃件计数口径 —— 含本批已取未达件）
        const { item } = takeQueuedBatchItem(items) // 核件取项（合并批 ∕ 携图退化逐条——同一取项单源）
        if (item === null) break
        const { stillHeld, consumed } = await guardedDeliver(entry.key, hold, (signal) => queue.consume(entry.key, item, entry.agent, signal))
        if (!stillHeld) { // 窗后零起跑判据：零起跑 ∧ 不重投（条目已摘——不复位；消费帧已出——不追回）
          cleanupTurn(consumed?.attached?.paths ?? []) // 本径落盘件自清（回合尾清理面不达）
          dropped = before // 弃余计数 = 取批前余量（含已取未达批 —— #912 收正）
          queue.emitState(entry.key) // 弃件出口①：链尾状态帧（镜面收口为实况 —— #912）
          break // 停链（占位被摘 ⇒ 零起跑——链径现式）
        }
        try {
          await runTurn(entry.key, entry.agent, consumed.text, { attached: consumed.attached }) // 普通回合（非 autoTurn）
          turnDone(entry.key, entry.agent) // 档①：续发回合完成（成功径）
        } catch (err) {
          console.error(`[suspension-drive] window ${entry.key} residual turn failed: ${err?.message ?? err}`)
        }
      }
    } finally {
      resuming.delete(entry.key)
    }
    if (abortTombstones.delete(entry.key)) { // 续发期中止（含末轮后落位）：停链 + 零接管
      if (dropped > 0) console.error(`[suspension-drive] window ${entry.key} aborted mid-resume — ${dropped} accepted message(s) dropped with the session`)
      queue.emitState(entry.key) // 弃件出口②：链尾状态帧（墓碑径 —— 含末轮后落位；幂等）
      return
    }
    onRestart(entry.key, entry.agent, { cwd: entry.cwd })
  }

  /** 出窗结算（兑现 ∥ 拒绝两径同点）：摘窗 + 载体复位 + 出窗帧（`ev:susp {active:false}`——携 `interrupted`：会话中止事实）⇒ 残输入兜底。
   *  `entry` = 建窗档 `start` 经 `onExit` 传进来的载体；`failure` = `null`（兑现）∥ 错误对象（拒绝）。 */
  function closeWindow(entry, failure) {
    const { key, agent, controller } = entry
    if (failure) console.error(`[suspension-drive] window ${key} failed: ${failure?.message ?? failure}`)
    windows.delete(key)
    if (agent._sessionAbort === controller) { agent._sessionAbort = null; agent._sessionSignal = null }
    postSuspEnd(key, agent, controller.signal.aborted)
    if (controller.signal.aborted) { // 会话中止径（dispose ∕ 切项目级联）：不续发——消息随会话终止
      const dropped = queue.clear(key, entry.pending) // 清队 + 状态帧（窗半归空 ⇒ 带退场——零残留）
      if (dropped > 0) console.error(`[suspension-drive] window ${key} aborted with ${dropped} accepted message(s) — dropped with the session`)
      return
    }
    timers.sync(key, entry.agent) // 出窗结算后（§6.30.11 装配点②）：窗退且仍有在途 ⇒ 重武装
    resumeResidual(entry).catch((err) => console.error(`[suspension-drive] window ${key} residual resume failed: ${err?.message ?? err}`))
  }

  /** 会话中止（`dispose(key)` ∕ 切项目级联）：清池不注入（陈旧结果不回灌）+ 出窗帧；返回是否命中（窗 ∥ 续发链）。
   *  **中止代次先落**（#515③ —— `timers.bump`：先于一切早退；无窗 ∕ 续发期两态同落 ⇒ 已点火回调即失效）；
   *  续发期（`closeWindow` 摘窗之后）窗表无项 ⇒ 落**中止墓碑**（`resumeResidual` 检查点消费——免中止盲区）。 */
  function abort(key) {
    timers.bump(key) // #515③ 陈旧点火闸（先于早退——置位与撤闩同刻）
    timers.disarm(key) // 会话清除面（§6.30.11 装配点③ · D-MI31 撤点之一）：两族闩同撤（timer + 取件；无闩 ⇒ 零动作——返回语义不变：窗 ∥ 续发链）
    const entry = windows.get(key)
    if (!entry) {
      if (!resuming.has(key)) return false
      abortTombstones.add(key)
      return true
    }
    entry.frozen ??= resident.resident(entry.agent) // 冻结快照（清池前取 —— freezeAll 兜底补发用；只取一次：二次 abort 不覆写）
    entry.controller.abort()
    return true
  }

  /** 切项目（`project:open` 成功且 cwd 变更）：旧项目**全键**中止（窗 ∥ 续发链——§2.2 键面 ∕ 取值面双错位防护）；返回中止数。 */
  function abortAll() {
    let n = 0
    for (const key of new Set([...windows.keys(), ...resuming, ...timers.keys()])) if (abort(key)) n += 1 // 闩键同入（#515③：空闲态键不在窗表 ∕ 续发链——代次同落）
    timers.disarmAll() // 切项目级联 ⇒ 两族闩同撤（幂等——逐键 abort 已撤，兜底无闩面；D-MI31 撤点之一）
    return n
  }

  return { closeWindow, resumeResidual, abort, abortAll }
}
