/**
 * timer-watch.mjs — timer 空闲唤醒端面壳（VSC：交付适配 + 火缝 + 装配）。
 *
 * 机制单源 = `docs/core/design/AGENT-LOOP-ASYNC-POOL.md` §6.30（§6.30.11 VSC 块 = 本档落点；闩 ∕ 派发 ∕ 火策略住核
 * `thincoder-core/agent/timers.mjs`——B3 批改指 = §6.30.16）。本档零自持闩 ∕ 零判据副本；门三件（§6.30.3 沿用 · 开关读面 = 核 `timerWakeEnabled`）：
 * ① 唤醒源 = 核 `_pendingTimers`（只读、不看 history）；② 成本闸 = 到期批合并 + 出列幂等（核 `takeExpiredTimers`）；③ 开关 `agent.timerWake` 默认开——关 ⇒ 核闩零注册。
 * 可见面（协议 §3.2 行 19）：发 `timer { status:"fired", text }`（交付原文逐字——核注入单源）；显示裁（≤3 行 + `…`）= webview 侧（本档零裁切、零文案）。
 *
 * VSC 两处端面事实（交付适配保留——注入目标 ≠ `agent.history` ⇒ 不核包装）：① 顶层 agent 会话级单例但**可销毁
 * 重建**（切槽 / 面板 dispose）⇒ 取件闩**不读它**（D-MI34：闩的就绪判据 = 本档给的 `ready()`，不是 `panel._agent`）；
 * 撤闩只剩 `chat-panel.mjs` `dispose` + view 销毁**两处**（**转空工作区不撤取件闩**——那一支只销毁载体，门交给
 * `ready()` 闸住；它仍撤 timer 闩）；**切槽是撤旧立新（重臂）**，不在撤闩列。② 机读线**按回合自盘重建**
 * （`panel-chat.mjs`）⇒ 空闲路送达必须**落盘**（不落盘 = 下一次 run 读不到 = 静默丢）。
 */
import {
  createTimerWatch,
  fireTimerWake as coreFireTimerWake,
  takeExpiredTimers,
  injectTimerReminders,
} from "@thincoder/core/agent/timers.mjs"
import { createInboxWatch, crossMessageText, inboxTakeLostLine, inboxBlockedLine } from "@thincoder/core/instance-inbox-watch.mjs"
// 就绪判据的可用件（D-MI34 · `docs/vsc/design/PROJECT-SWITCHER.md` §4.1）：**只取判定侧**
// （`hasWorkspaceFolder()`）——判定与「弹提示 + 置去重标志」的守卫形共存于同档，取后者就是每拍一个框。
// leaf 档、只 import `vscode`——无环。
import { hasWorkspaceFolder } from "./workspace-guard.mjs"
import { logEvent, errText } from "@thincoder/core/log.mjs"

/**
 * 到期批送达（两路共用：空闲闩 fire ∥ 挂起窗第三兑现态）——出列（幂等）→ 注入机读线 →
 * （空闲路）落盘 → `timer` 触发落流（协议 §3.2 行 19）。`lines` 给定时 = 会话活线（窗内——注入即在场，
 * 随回合落盘）；缺省 = 活动会话双线（空闲——下一次 run 自盘重建机读线，注入必须落盘）。
 * @param {Function} [opts.now] 注入缝——时钟（默认 `Date.now`；与桌面同形：调用方传**钟**、本档调用取时点 `now()`）
 * @returns {string[]} 送达原文（核注入单源逐字）；零到期 / 无会话载体 ⇒ 空数组（在途不动 = 零静默丢）
 */
export function deliverExpiredTimers(panel, { lines = null, now = Date.now } = {}) {
  const agent = panel?._agent
  if (!agent) return []
  const target = lines ?? (panel._slot != null ? panel._activeLines() : null)
  if (!target) return [] // 空闲路槽未绑定——零动作（在途保持：链尾重同步再试）
  const injected = injectTimerReminders({ history: target.contextHistory ?? target.history }, takeExpiredTimers(agent, now()))
  if (injected.length === 0) return []
  if (!lines) panel._saveLines(target.fullHistory, target.contextHistory)
  // 触发落流（§6.30.11 VSC 可见面 · 协议 §3.2 行 19）：逐条 `{ status:"fired", text }`——`text` = 交付原文逐字
  // （核注入单源）；显示裁（≤3 行 + `…`）= webview 侧（本档零裁切、零文案）。
  for (const text of injected) panel._panel?.webview.postMessage({ type: "timer", status: "fired", text })
  return injected
}

/**
 * 空闲闩触发（§6.30.11 VSC 火面 = 核策略 + 端两缝——B3 改指 §6.30.16）：**非空闲零动作**（无 agent ∥ `turnBusy()` 真——
 * 在飞回合 / 挂起窗由既有路径接管，在途表零触碰，链尾重同步再武装）；空闲 ⇒ 到期批送达（落盘）+ 开 timer 轮
 * （顶层链：`skipSession` 缺省——队列续发 / 挂起入口照常）。@returns {Promise<boolean>} 是否开轮
 */
export async function fireTimerWake(panel, { runChat, now = Date.now } = {}) {
  return coreFireTimerWake({
    busy: !panel?._agent || Boolean(panel.turnBusy?.()),
    deliver: () => deliverExpiredTimers(panel, { now }).length > 0,
    openTurn: async () => {
      const open = runChat ?? (await import("./panel-chat.mjs")).runPanelChat // 动态 import = 零新增静态环
      await open(panel, { text: "", autoTurn: true, timerTurn: true })
    },
  })
}

/** 闩装配 + 同步（单例惰性建 = `panel._timerWatch`；武装点两处共享本函数：回合尾 `finalizeTurn` /
 *  挂起会话退出 `finally`；撤闩 = 面板 `dispose`）。火面异常兜底（CLI `index.mjs` 同形：落账 +
 *  忙态复位 + 重同步）——无人值守的空闲轮报错不得逃逸为 unhandled rejection。 */
export function syncTimerWatch(panel) {
  const watch = panel._timerWatch ?? (panel._timerWatch = createTimerWatch({
    getAgent: () => panel._agent,
    onFire: () => fireTimerWake(panel).catch((e) => {
      logEvent("err:internal", { msg: errText(e, 200), where: "timer-watch" })
      panel._publishTurnState?.("idle")
      panel._refreshStatus?.()
      panel._panel?.webview.postMessage({ type: "error", text: String(e?.message ?? e).split("\n")[0], techInfo: String(e?.stack ?? e) })
      panel._timerWatch?.sync() // 在途仍在 ⇒ 再武装（链尾外兜底）
    }),
  }))
  return watch.sync()
}

/**
 * 跨实例取件闩（MULTI-INSTANCE-COLLAB §5.4 · §5.8 · D-MI28 ∥ D-MI31 ∥ D-MI34）——VSC 端装配面（CLI `index.mjs`
 * `turnCtx.inboxWatch` 对位；核闩 + 核形态全在 `thincoder-core/instance-inbox-watch.mjs`）。
 *
 * **自续闩**（D-MI31）：`syncInboxWatch` 只是幂等补位（会话起点面板创建 · 回合尾
 * `panel-turn-stages.mjs` `finalizeTurn`）——**回合起点不撤**；存活不靠补位点。撤闩面 = **面板销毁两处**
 * （`chat-panel.mjs` `dispose` ∕ view 销毁）——**切槽点不是撤闩点，是撤旧立新（重臂）**；**工作区转空也不撤**
 * （那一支只销毁载体，门交给 `ready()` 闸住）：撤了没任何重臂面，闩就哑在面板里（判据 ⑨）。`panel-session.mjs`
 * 的 `loadSession` 调 `syncInboxWatch(panel)`（撤旧立新——旧闩撤、新闩立）。
 *
 * **就绪判据（D-MI34）= 面板在场 ∧ 工作区在场 ∧ 未销毁——不是 `panel._agent != null`**：`_agent` 只在回合
 * 装配路径上被赋值（`chat-panel.mjs` 五处置空），面板开着、一轮没跑过就恒空 ⇒ 拿它当门就是把「空闲待命」
 * 判成「永不就绪」（用户实测：收到消息不拉起、问它说没收到、会话一结束才收到）。面板在场与未销毁同一个
 * 读数（view 销毁 / `dispose` 都把 `_panel` 置 null）。
 *
 * **判据不取守卫形**（§5.4）：每拍跑一次的谓词只能是**判定**（`workspace-guard.mjs` 的 `hasWorkspaceFolder()`
 * ——与 `runPanelChat` 的无工作区早退同一个谓词，一处判据两处用），**不能**是同一个守卫档里那个会弹 host
 * 提示并置 `_wsGuardNotified` 的守卫形（判据每秒弹一次框，比不报更坏）。机检 = 判据 ⑧ 扫本档取件接线
 * （`hasWorkspaceFolder` ≥1 ∥ `blockOnNoWorkspace` ∥ `notifyNoWorkspace` 零命中）；**射程只到「没走守卫形」**
 * ——探针体里另写的提示 ∥ 埋点不在其射程内，本批不另立判据。
 *
 * **`isBusy` 的定义域 = 「有活干」**（在飞回合 ∥ 挂起窗）：**「还没有载体」不在其列**——面板开着、一轮
 * 都没跑过的实例首拍不算忙（把它折进 `isBusy` ⇒ 永久算忙、首拍即死）。
 *
 * 取件后开**普通用户回合**（`autoTurn` 缺省 false——手动态照常走审批面，**恒不带 `resume`**），输入串 =
 * 消息形态（首行来源标记）；`pushReal` 由核 `prepareRun` 落 —— 端侧不另推历史。`onTake` **只收消息**
 * （D-MI34：载体住本档，`panel` 就在闭包里）；promise 契约（交接：失败单源 = reject）：`_publishTurnState("running")`
 * 在 `runPanelChatImpl` 的首个 `await` 之前 ⇒ `runPanelChat()` 返回时 `_turnState` 已可读；读到 `running`
 * = 已登记为在飞（resolve），其余（无工作区早退 ∕ 面板缺失 ∕ 入口抛）= 开轮没成（reject）⇒ 核记
 * `ev:inbox-watch-take-lost`、本处出逐字丢失行。**拿 `turnBusy()` 的一次读数判死是禁止形**。
 */
export function syncInboxWatch(panel) {
  const watch = panel._inboxWatch ?? (panel._inboxWatch = createInboxWatch({
    ready: () => panel?._panel != null && hasWorkspaceFolder(), // D-MI34：面板在场 ∧ 工作区在场 ∧ 未销毁
    isBusy: () => Boolean(panel?.turnBusy?.()), // 载体缺席不算忙（D-MI31 · P4 消）
    onTake: (messages) => (async () => {
      const open = (await import("./panel-chat.mjs")).runPanelChat // 动态 import = 零新增静态环
      const run = open(panel, { text: crossMessageText(messages) })
      // 回合内错误照旧可见（不是「开轮没成」——`running` 已置 ⇒ 这一轮真的开了）
      void run.catch((e) => { logEvent("err:internal", { msg: errText(e, 200), where: "inbox-watch" }) })
      if (panel._turnState === "running") return
      panel._panel?.webview.postMessage({ type: "inbox", text: inboxTakeLostLine(messages) }) // D-MI32：消息已离盘 ⇒ 只能明说
      throw new Error("inbox-watch: turn did not start")
    })(),
    onBlocked: (ms, pending) => panel._panel?.webview.postMessage({ type: "inbox", text: inboxBlockedLine(ms, pending) }), // D-MI33
  }))
  return watch.sync()
}

/** 撤取件闩（**只两处**：`chat-panel.mjs` 的 `dispose` ∥ view 销毁——与 `panel._timerWatch?.disarm()` 同点）。
 *  **回合起点、切槽点、工作区转空都不在本列**（D-MI31 ∥ D-MI34）：切槽是**撤旧立新**（`panel-session.mjs` 调
 *  `syncInboxWatch`）；转空只销毁载体，门交给 `ready()` 闸住（撤了没有「工作区回来」的重臂面）。 */
export function disarmInboxWatch(panel) {
  panel?._inboxWatch?.disarm()
}
