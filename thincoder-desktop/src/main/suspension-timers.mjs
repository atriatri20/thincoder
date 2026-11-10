/**
 * suspension-timers.mjs — 窗内时效面出档（自 `suspension-drive.mjs` 拆分 —— 消化面留档批 · #719 实施轮；
 * 拆分单源 = `docs/desktop/design/PROJECT.md` §4.1 越层段 ∥ §2 KD-34 ∕ 核 `AGENT-LOOP-ASYNC-POOL.md` §6.30.11 桌面块）。
 * 四件 + 一代次面：① 空闲 deadline 闩装配（`timer-watch.mjs` 键面 —— 与窗内 `timerFace` 是同一 deadline 的两载体，
 * 出窗交接由宿主调用面触发）② 窗内 `timerFace` 注入（核件 opt-in，§6.30.10 —— `deadline` 现算 + `deliver` 交付）
 * ③ 空闲火面（`fireTimerWake` 触发 + 轮后链尾接管）；**中止代次**（#515③ 陈旧点火闸）同持：武装刻代次 ↔ 现状比对，
 * `bump` 由宿主 `abort` ∕ `abortAll` 落位 ⇒ 「已点火（回调在队）恰逢中止」零交付 ∥ 零开轮。
 * ④ **取件面两行出站**（行痕族第四员 · 2026-11-10）—— `onTake` reject ⇒ `ev:inbox` `kind:"lost"`；`onBlocked` ⇒
 * `kind:"blocked"`（一类一槽、上屏与清点归渲染面）；行文 = 核拼串**逐字**（`inboxTakeLostLine` ∥ `inboxBlockedLine`
 * ——端侧零构造）；单源 = `docs/desktop/design/IPC.md` §2「取件行注」。
 * 宿主供五枚读缝（`post` 出站 ∥ `runTurn` 单回合 ∥ `busyOf` 在飞判据 ∥ `inWindow` 窗表判据 ∥ `takeOver` 回合尾接管）
 * + 时钟三扇（`timer` ∕ `clear` ∥ `now`）——零宿主依赖 ⇒ 平 node 直测；零文案。
 * **槽重装缝**（`reloadSlot` —— #799 修复轮）：窗内 `deliver` 内**重装先于投递**（整换 `agent.history` ⇒ 序反吞行——明细 = 核 `AGENT-LOOP-ASYNC-POOL.md` §6.30.17）。
 */
import { pendingTimerDeadline } from "@thincoder/core/agent/timers.mjs"
import { crossMessageText, inboxBlockedLine, inboxTakeLostLine } from "@thincoder/core/instance-inbox-watch.mjs"
import { unregisterInstance } from "@thincoder/core/instance-registry.mjs"
import { createTimerWatch, deliverExpiredTimers, fireTimerWake, timerWakeEnabled, createInboxWatch } from "./timer-watch.mjs"

/** 时效面工厂：`post(channel, payload)` = 出站面 · `runTurn(key, agent, text, opts)` = 单回合执行面 ·
 *  `busyOf(key)` = 在飞回合判据（缺省 ⇒ 恒假）· `inWindow(key)` = 窗在场判据（缺省 ⇒ 恒假）·
 *  `takeOver(key, agent)` = 回合尾接管面（缺省 ⇒ 回落闩重同步）· `reloadSlot(key, agent, cwd)` = 本窗键槽重装（同源缝 = `createSuspensionDrive` 转口；先于投递调用——**须同步**；缺省 `null` ⇒ 零动作）·
 *  `timer` ∕ `clear` ∕ `now` = 闩时钟三扇注入缝。
 *  返回 `{ faceOf, bump, sync, disarm, disarmTimer, disarmAll, armInbox, size, keys, inboxLatches }`
 *  （键面 = 闩表武装 ∕ **撤清两族** ∕ 读数——撤闩编排归宿主；**撤点分族**（D-MI31）：入窗只撤 timer 闩
 *  （`disarmTimer` —— 窗内同一 deadline 由 `timerFace` 单持），取件闩只许三撤点撤（会话清除 ∥ 项目级联 ∥
 *  面板销毁 —— 走 `disarm` ∥ `disarmAll` 两径）；`armInbox` = 会话起点一处——**回合起点不撤**，
 *  D-MI31 自续闩：撤闩 = 「要靠别人再把你叫醒」，而那个「别人」正是会漏叫醒的地方）。 */
export function createSuspensionTimers({ post, runTurn, busyOf = () => false, inWindow = () => false, takeOver = null, reloadSlot = null, timer = setTimeout, clear = clearTimeout, now = Date.now } = {}) {
  /** 中止代次（每键 —— #515③）：`bump` 由宿主中止面调用；到点回调携**武装刻代次**与现值比对 ⇒ 陈旧点火丢弃。 */
  const gens = new Map()
  const genOf = (key) => gens.get(key) ?? 0
  /** 空闲 deadline 闩（§6.30.11 桌面块 —— 与窗内 `timerFace` 是同一 deadline 的两载体，出窗交接即宿主生命周期内 ⇒
   *  单点持有；宿主只供读缝（`busyOf` ∕ `inWindow` ∕ `takeOver`））。 */
  const watch = createTimerWatch({
    onFire: (key, agent, gen) => {
      if (gen !== genOf(key)) return // 武装后被中止 ⇒ 陈旧点火丢弃（#515③ 中止后交付闸）
      void fireIdle(key, agent).catch((err) => console.error(`[suspension-drive] idle timer wake ${key} failed: ${err?.message ?? err}`))
    },
    rev: genOf,
    timer, clear, now,
  })

  /** 跨实例取件闩（MULTI-INSTANCE-COLLAB §5.4 / §5.8 · D-MI28 ∥ D-MI31 ∥ D-MI34 —— 桌面键面与 timer 闩同档）：
   *  到点取件 ⇒ 以**普通用户回合**开轮（`autoTurn` 缺省 false——手动态照常走审批面；输入串 = 消息形态），
   *  轮后链尾接管与 timer 轮同判（`takeOver` 在场 ⇒ 交接管面 ∥ 缺省 ⇒ 本档重臂）。
   *  `onTake(key, messages)` **不收 agent**（D-MI34：载体由端壳自持，本处经 `inbox.agentOf(key)` 从闩槽取）。
   *  `onTake` 的 promise 契约（交接：失败单源 = reject）：`runTurn` = `executeTurn`，其**同步前缀**（首个
   *  `await` 之前）已 `flights.set(key, …)` ⇒ 返回时 `busyOf(key)` 已可读；读到真 = 已登记为在飞，
   *  ＊否则（入口抛 ∕ 没起来）= 开轮没成 ⇒ reject（核记 `ev:inbox-watch-take-lost`，机器面可见）。
   *  **两条可见行（行痕族第四员 · 2026-11-10）**：渲染面既有行组 `[data-inbox]` —— 本端两面各出一帧
   *  `ev:inbox`（`{ key, kind, text }`）：① `onTake` reject 径（本函数 throw 前同笔）⇒ `kind:"lost"`；
   *  ② `onBlocked` 径（闩受阻跨阈）⇒ `kind:"blocked"`。行文 = 核拼串**逐字**（`inboxTakeLostLine` ∥
   *  `inboxBlockedLine`——端侧零构造），单源 = `docs/desktop/design/IPC.md` §2「取件行注」项 7。
   *  只 post 已登记通道（未登记 = 零显示，等于写了个谎）——`ev:inbox` 在桥面白名单内（二十六条）。
   *  两径均接（端侧行组 `[data-inbox]` 上屏）：`onTake` reject ⇒ `kind:"lost"` ∥ `onBlocked` ⇒ `kind:"blocked"`。 */
  const inbox = createInboxWatch({
    busyOf: (key) => busyOf(key) === true || inWindow(key),
    onTake: (key, messages) => {
      // 载体从闩槽取（D-MI34：核闩不再把 agent 递回给 `onTake`——载体由端壳自持）；`ready()` 已门住无载体
      // 的那一拍（零取件、只出受阻行）⇒ 走到本处的槽恒有载体。
      const agent = inbox.agentOf(key)
      const settle = () => { if (takeOver) takeOver(key, agent); else inbox.sync(key, agent) }
      const pending = runTurn(key, agent, crossMessageText(messages), {}) // 取件开轮恒为普通用户回合（不传 resume）
      void Promise.resolve(pending).then(settle, settle)
      if (busyOf(key) === true) return Promise.resolve() // 已登记为在飞
      // 开轮没成（失败单源 = 本条 reject）—— 同笔出丢失行：消息已离盘、不重投，人读面是它唯一的痕
      post("ev:inbox", { key, kind: "lost", text: inboxTakeLostLine(messages) })
      throw new Error("inbox-watch: turn did not start") // 开轮没成——失败单源
    },
    // 受阻跨阈（待取非空且持续在飞）⇒ 受阻行；每跨一阈一条——同类新行替换本类旧行（`ms` 增长即其本义）
    onBlocked: (key, ms, pending) => post("ev:inbox", { key, kind: "blocked", text: inboxBlockedLine(ms, pending) }),
    timer, clear,
  })

  /** 窗内 timer 面（核件 opt-in 三注入项之一 —— §6.30.10 ∥ #799 修复轮）：`deadline()` 每轮现算（开关关 ⇒ `null` ⇒ 零注册）；
   *  `deliver()` = 到期批交付（**严格布尔**——交付真 ⇒ 核件开 timer 轮；交付面同点落 `ev:timer`）：**零在途早退**
   *  （`pendingTimerDeadline === null` ⇒ 直接返 `false`——零重装 ∥ 零投递）；否则**先**重装本窗键槽**再**投递（投递行落重装后机读线 = 该轮将读数组；序反 = 整换吞行）。 */
  function faceOf(key, agent, cwd) {
    return {
      deadline: () => (timerWakeEnabled(agent) ? pendingTimerDeadline(agent) : null),
      deliver: () => {
        if (pendingTimerDeadline(agent) === null) return false // 零在途早退（零重装 ∥ 零投递）
        reloadSlot?.(key, agent, cwd) // 同步缝（本面契约同 `deliver`）——重装先于投递
        return deliverExpiredTimers(agent, key, { post, now }) > 0
      },
    }
  }

  /** 取件面归零 ⇒ 删名册条目（D-MI28 「正常退出删除」的桌面落点：本进程已无任何键在取件）。
   *  名册条目按进程级 sessionId 一枚，删了不影响仍在跑的键——下次投递按「无此会话」被拒，
   *  而不是消息静静躺在 inbox 里等一个不会再来的取件面。 */
  const forgetIfIdle = () => { if (inbox.size() === 0) { try { unregisterInstance() } catch { /* 尽力面 */ } } }

  /** **只撤 timer 闩**（入窗面 —— 窗内同一 deadline 由 `timerFace` 单持 ⇒ 撤空闲闩零双注册）。
   *  **取件闩不在此面**（D-MI31）：入窗不是会话死亡。撤它、再指望出窗结算 `sync` 重臂 = 把「门还能不能开」
   *  挂在另一段代码跑到没跑到上，而入窗恰是取件面最需要守着的时段——待取非空跨阈时，受阻行靠这一拍才有那一帧。
   *  取件闩只许三撤点撤（`disarm` ∥ `disarmAll`）。 */
  const disarmTimer = (key) => watch.disarm(key)

  /** 空闲闩触发（§6.30.11 火面）：非空闲零动作（在飞 ∕ 窗内交既有路径）；**轮后链尾接管**（§6.30.11 装配点①
   *  的回合尾面 —— timer 轮亦为回合：池活 ⇒ 入窗消化 ∥ 池空 ⇒ 闩重武装；与 `send` 径两径同接管同判）；交付未
   *  发生（在飞 ∕ 零到期）⇒ 零动作（免「已到期未出列」0ms 重注册）；轮内抛错同走接管（`finally`）。 */
  async function fireIdle(key, agent) {
    let ran = false
    try {
      return await fireTimerWake(key, {
        agent, post, busy: busyOf(key) === true, inWindow: inWindow(key), now,
        runTurn: (k, a, text, opts) => { ran = true; return runTurn(k, a, text, opts) },
      })
    } finally {
      if (ran) { if (takeOver) takeOver(key, agent); else watch.sync(key, agent) } // 接管面缺省 ⇒ 回落闩重同步（用例）
    }
  }

  return {
    faceOf,
    /** 中止代次落位（#515③ 先于一切早退 —— 无窗 ∕ 续发期两态同落 ⇒ 已点火回调即失效）。 */
    bump: (key) => { gens.set(key, genOf(key) + 1) },
    /** 闩面三武装点（§6.30.11）：回合尾接管未入窗 ⇒ `sync` 武装 ∕ 出窗结算后 ⇒ 重武装 ∕ 会话清除面 ⇒ `disarm` 清点。
     *  **跨实例取件闩同点同判**（MULTI-INSTANCE-COLLAB §5.4 · D-MI28）：两处武装点一一对应——三端同形；
     *  **入窗不是第三个撤点**：它只走 `disarmTimer`（取件闩留着——D-MI31）。 */
    sync: (key, agent) => { const d = watch.sync(key, agent); inbox.sync(key, agent); return d },
    disarmTimer, // 只撤 timer 闩（入窗面——见上「撤点分族」；取件闩不在此面）
    /** **全族撤闩清点**（单键径 —— 三撤点里的**会话清除** ∥ **面板销毁**两路都走这里）：timer 闩 + 取件闩一并；
     *  取件闩归零 ⇒ 名册条目同点删（D-MI28）。 */
    disarm: (key) => { const had = disarmTimer(key); inbox.disarm(key); forgetIfIdle(); return had },
    /** 全键撤闩清点（`abortAll` = 切项目级联面 —— 三撤点之一；幂等：逐键已撤者零动作）。 */
    disarmAll: () => { watch.disarmAll(); inbox.disarmAll(); forgetIfIdle() },
    /** 会话起点武装点（键槽创建 = `turn-driver.mjs` 的 `ensure` 包装处）：只装取件闩（timer 闩由回合尾判据决定）。
     *  **回合起点无对应撤闩面**（D-MI31 自续闩）——该入口已随本批撤除。 */
    armInbox: (key, agent) => inbox.sync(key, agent),
    size: () => watch.size(),
    keys: () => watch.keys(),
    /** 取件闩读数（诊断 ∕ 用例 —— 与 `size()` 同形，另一面）。 */
    inboxLatches: () => inbox.keys(),
  }
}
