/**
 * instance-inbox-watch.mjs — 跨实例投递面**取件闩 + 注入面**（MULTI-INSTANCE-COLLAB「取件闩」）。
 *
 * 取件口径（一句话）：**只在目标没有在飞一轮时取件**。闩形同 `createTimerWatch` 的一次性 deadline 形态——
 * `INBOX_POLL_MS = 1000`、`unref`；差别 = **自续**（D-MI31）：一拍 = **先重臂、再试取件**，闩的在位不靠任何
 * 别的代码路径叫醒。撤闩只有「退出 / 面板销毁」一路。
 *
 * **就绪判据归端壳（D-MI34）**：核闩**不读 `agent` 对象**——`ready()` 回答「这一端此刻能不能开一轮」，由端壳给
 * （**必填、无缺省**：缺了装配即抛）。「有没有 agent 对象」是 VSC 一家的实现形态（`_agent` 只在回合装配路径上
 * 赋值，而它的 `onTake` 把核递来的 agent 一下划线就丢），把它当成三端规则就是本批的病根。`onTake(messages)`
 * 只收消息，**载体由端壳自持**。
 *
 * **重臂是无条件不变式**：`fire()` 第一行就是 `sync()`，落在 `ready()` / `isBusy()` / 取件 / `onTake` 这些
 * 可抛调用之前，且**不进 `try`**（进了 `try` 就降级成「本拍没抛，闩才在」——两个不同的承诺）。取件段抛出
 * ⇒ 本拍记一条 `ev:inbox-watch-err`，下一拍照常在位。
 *
 * **取出之后的交接契约：失败只有一个真源 = `onTake` reject**（「取件闩」）。`onTake(messages)` 返回 promise，
 * 只在「这一轮已登记为在飞」时 resolve（口径 = 该端自己的判忙谓词自这一刻读到真、直到回合结束）；**没开成轮
 * 的任何原因都 reject**（入口抛 / 入口返回后没起轮 / 取件路径拿到 `resume=true` / 端侧前置条件不满足）。
 * 闩**不拿 `isBusy()` 的一次读数判断失败**——短轮（一拍内起完）与审批悬挂（`autoTurn:false` 走审批面）都是
 * 合法状态，拿一次未翻真判死会把它们报成丢失。`resolve` ⇒ 下一拍 `isBusy()` 为真、本拍零取件；`reject` ⇒
 * 走 D-MI32 出口（`ev:inbox-watch-take-lost` + 端壳逐字丢失行，**消息已离盘、不重投**），闩照常走下一拍。
 *
 * **受限计数 + 出声**（D-MI33 ∥ D-MI35）：**取不上件有两因**——在飞（`isBusy()` 真）∥ 不就绪（`ready()` 假，
 * 含「没有 `onTake`」那一支：没人能开轮 ⇒ 取了就是静默丢）。任一因连续成立每跨过一个 `INBOX_BLOCKED_MS` 做
 * **一次** inbox 目录 stat；待取非空 ⇒ `ev:inbox-watch-blocked`（带 `reason` = `"busy"` ∥ `"carrier"`）+
 * `onBlocked(ms, pending)`——**两因共用同一条逐字行**（人要的是「有人在等你、取不上」；「为什么取不上」是诊断，
 * 住 `reason` 与日志）。空 ⇒ 只记 `ev:inbox-watch-blocked-empty`。`ms` = **连续取不上件的总时长**（理由中途
 * 换了不重算），两因皆消即计数归零。**探针住拍内** ⇒ 只覆盖「在拍但不取件」；「没有拍」由上面的无条件重臂
 * 变成不可达态，本计数器不兜它（覆盖边界写入设计「取件闩」，不冒充全覆盖）。
 *
 * **待取条数常驻面（`onPending`）**：每拍把待取条数交给端壳（取尽后报 0），端壳据此在状态栏显示 ∕ 摘除等待期
 * 提示。它与 `onBlocked(ms, pending)` 的第二参不是一件事——那个只在跨阈那一次出声行里印一次。可选形参：不传 ⇒
 * 本端不显示条数、也不花那次目录 stat；传了就得接住。一拍最多一次 stat：受阻跨格与报数共用本拍读数。
 *
 * **不叫 stall**：本仓 `stall` 已指 advisor 零产出看门狗 / 静默轻显形 / 子代理环路三件事 ⇒ 本面用
 * `blocked`（`onBlocked` / `ev:inbox-watch-blocked` / `INBOX_BLOCKED_MS`）。
 *
 * **不另造第二套排队**：跨实例消息**不另开排队通道**（不挂 `consumeQueuedInput`、不进「一步一取」的循环头）——
 * 既有排队通道是「一步一取」，本面要的是「一轮一取」（整轮跑完才起新一轮）。借用的只是**落法**：无窗时走普通回合的
 * 输入串（`pushReal` 落一条 `role:"user"` 消息）；挂起窗在场（含打开在即的释放窗口）时入宿主既有输入队列（CLI
 * `state.pendingInput` ∥ Desktop 窗队 `entry.pending`）并唤醒窗口，由窗口在步边界起轮。
 *
 * 注入形态 = 真 user 消息：首行逐字来源标记（人读线可见——`[system reminder:` 族不适用），空行，之后是
 * `text`。带 `re` = 回程（对账靠 `re`，其余形态一字不差）。
 *
 * **落法 = 走端壳开轮面的输入串**（`crossMessageContent` 组合 → 普通用户回合的 `text`），不另推一条历史——
 * 核 `prepareRun` 在 `!resume` 时无条件 `pushReal(agent, { role:"user", content: input })`，先推后以空串开轮
 * 会多出一条 **空 `role:"user"` 消息**（直达 provider 的空 content 块）。走输入串 ⇒ 恰好一条真 user 消息，
 * 形态与逐字锚不变。**取件开轮恒为 `resume=false`**：走 resume 时那一串不落成 user 消息，而消息在取件时
 * 已离盘 ⇒ 静默丢。端壳在取件路径上拿到 `resume=true` 的情形一律走「开轮没成」出口。
 *
 * 注入缝（「取件闩」）：`_setPeerMessageTestImpl({ nowFn, aliveFn, timer, clear })`——三档共用一份注入面，
 * 注入态住 `instance-registry.mjs`（本档为三档中最上一层，回引成环由「注入态住叶档」消解；本档只导出写入口）。
 */
import { readdirSync } from "node:fs"
import { getSessionId } from "./session-slots.mjs"
import { logEvent } from "./log.mjs"
import { peerMessageSeams, setPeerMessageSeams, sweepInstances } from "./instance-registry.mjs"
import { takeInbox, sweepInbox, inboxDir } from "./instance-inbox.mjs"

/** 取件拍（毫秒）：空闲且闩在位 ⇒ ≤ 此值取件（「取件闩」延迟上界）。成本 = 空闲期每拍一次 inbox 目录 stat；
 *  在飞期一拍 = 一次判据 + 一次待取条数 stat（后者仅在传了 `onPending` 时发生）。 */
export const INBOX_POLL_MS = 1000

/** 受阻阈值（毫秒 · D-MI33）：`isBusy()` 连续为真每跨过一个阈值做一次目录 stat，待取非空即出声。 */
export const INBOX_BLOCKED_MS = 5 * 60 * 1000

/** 三档共用注入面（「取件闩」· 写入口住本档）：四个槽 `{ nowFn, aliveFn, timer, clear }`；
 *  未传的槽置 null = 生产实现。本面零命令行探测（不判身份族）。
 *  返回前值便于测试保存恢复。 */
export function _setPeerMessageTestImpl({ nowFn, aliveFn, timer, clear } = {}) {
  const prev = { ...peerMessageSeams() }
  setPeerMessageSeams({ nowFn, aliveFn, timer, clear })
  return prev
}

export function _resetPeerMessageTestImpl() {
  setPeerMessageSeams({})
}

/** 组成一条跨实例消息的**逐字形态**（「消息落法」锚）：首行来源标记 + 空行 + 正文。端壳把它作为普通用户回合的
 *  `text`（核 `prepareRun` 的 `pushReal` 落 `role:"user"`——人读线 + 机器线同源双写，零第二落法）。
 *  标记里的 `pid` 取自来源会话 id 的前缀（`{pid}-{ts}-{rand}`——与 `groupSlotSessions` 同解；
 *  inbox 条目 `from` 不带 pid 字段）。`msg.from` 缺字段 ⇒ `unknown`（标记行形态不变——不因缺字段少一段
 *  而让人读线分不出两类消息）。 */
export function crossMessageContent(msg) {
  const from = msg?.from ?? {}
  const end = typeof from.end === "string" && from.end !== "" ? from.end : "unknown"
  const sessionId = typeof from.sessionId === "string" && from.sessionId !== "" ? from.sessionId : "unknown"
  const fromPid = Number.parseInt(sessionId.split("-")[0], 10)
  // pid 不可解析 ⇒ `unknown`（与 end / sessionId / cwd 同一口径；回退到本进程 pid 会让人读线宣称
  // 一个并非发送方的 pid——标记行是「它自称从哪来」，不是认证，但也不该自造）
  const pid = Number.isInteger(fromPid) ? String(fromPid) : "unknown"
  const cwd = typeof from.cwd === "string" && from.cwd !== "" ? from.cwd : "unknown"
  const re = typeof msg?.re === "string" && msg.re !== "" ? ` · re=${msg.re}` : ""
  return `[cross-instance message · from ${end} pid=${pid} session=${sessionId} cwd=${cwd}${re}]\n\n${msg?.text ?? ""}`
}

/** 一批取件消息 → 一轮的输入串（多条各占一段，同一轮里逐条可见；一轮一取 ⇒ 同批同轮）。 */
export function crossMessageText(messages) {
  return (messages ?? []).map((m) => crossMessageContent(m)).join("\n\n")
}

/** 消息 id 列表（丢失行的 `{msgIds}` 与日志同一份列表；缺 id ⇒ `unknown`，与标记行同口径）。 */
function msgIdsOf(messages) {
  return (messages ?? []).map((m) => (typeof m?.msgId === "string" && m.msgId !== "" ? m.msgId : "unknown"))
}

/** D-MI32 丢失行（逐字锚 · 三端同形 · 「消息落法」）：`{n}` 由列表长度现算 ⇒ 两个数不会互相打脸。 */
export function inboxTakeLostLine(messages) {
  const ids = msgIdsOf(messages)
  return `[cross-instance message · turn failed: ${ids.length} lost (${ids.join(",")})]`
}

/** D-MI33 受阻行（逐字锚 · 三端同形 · 「取件闩」）：`{ms}` = 已受阻毫秒、`{pending}` = 待取条数。 */
export function inboxBlockedLine(ms, pending) {
  return `[cross-instance message · pickup blocked ${ms}ms: ${pending} pending]`
}

/** 待取条数（`.json` = 未取件；`.taken` = 取件删除失败留下的残片，不算待取）。目录未生 / 读失败 ⇒ 0。 */
function pendingCount(sessionId) {
  try {
    return readdirSync(inboxDir(sessionId)).filter((n) => n.endsWith(".json")).length
  } catch { return 0 }
}

/**
 * 取件闩：`sync()` = （重）武装一拍；`disarm()` = 撤闩清点；`fire()` = 一拍（导出供测试直驱）。
 *
 * @param {object} p
 * @param {Function} p.ready **必填 · 无缺省**（D-MI34）：端壳答「这一端此刻能不能开一轮」。**纯判定、零副作用**
 *   ——它每拍跑一次，所以取的必须是端壳开轮面早退的那个**判定**（VSC = `hasWorkspaceFolder()`），不是会弹
 *   提示的守卫形。核闩不从端壳对象上推，也不许替端壳猜一个（`!== true` 一律当不就绪）。
 * @param {Function} [p.isBusy] 在飞回合判据（**真值即忙**——非真值才算不忙；真 ⇒ 本拍零取件，只报待取条数
 *   （传了 `onPending` 才有那一次目录 stat）；「还没有载体」不在其列）
 * @param {Function} [p.onTake] 取件后开轮面 `(messages) => Promise<void>`：**resolve = 这一轮已登记为
 *   在飞；其余一切「没开成轮」都 reject**（失败单源）。开轮 = 普通用户回合（`autoTurn:false`），
 *   输入串 = `crossMessageText(messages)`；载体由端壳自持（本闩不收 agent）
 * @param {Function} [p.onBlocked] 受阻跨阈可读面 `(ms, pending) => void`（端壳在可见行通道上出一行）
 * @param {Function} [p.onPending] 待取条数常驻面 `(n) => void`：每拍一次（取尽后报 0），端壳据此显示 ∥ 摘除
 *   等待期提示；不传 ⇒ 本端不显示条数、也不花那次目录 stat（与 `onBlocked` 的第二参不是一件事）
 * @param {string} [p.sessionId] 取件会话 id（缺省 = 本进程会话）
 * @param {Function} [p.timer] / @param {Function} [p.clear] 注入缝（缺省 = 注入面 / 平台定时器）
 * @returns {{ sync: Function, disarm: Function, fire: Function }}
 */
export function createInboxWatch({ ready, isBusy = null, onTake = null, onBlocked = null, onPending = null, sessionId = null, timer = null, clear = null } = {}) {
  // `ready` 必填、无缺省（「取件闩」· D-MI34）：缺了就是「端壳没答这个判据」，核闩不许替它猜一个——猜真 = 空转
  // 取件，猜假 = 永不取件，两个都不报错。装配即抛，点名缺的参数。
  if (typeof ready !== "function") {
    throw new TypeError("createInboxWatch: missing required parameter `ready` — the end shell must answer whether this end can open a turn right now")
  }
  const seams = peerMessageSeams()
  const timerFn = timer ?? seams.timer ?? setTimeout
  const clearFn = clear ?? seams.clear ?? clearTimeout
  const now = () => (peerMessageSeams().nowFn ?? Date.now)()
  const sid = () => sessionId ?? getSessionId()
  let handle = null
  let inFlight = false // 上一拍还没落定（`onTake` 未 resolve / 未 reject）⇒ 本拍零动作
  let blockedSince = null // 取不上件（两因）连续成立的起点（毫秒）；两因皆消即清
  let blockedTier = 0 // 已报过的阈值格（每格一次，不刷屏）
  let pendingThisTick = null // 本拍已 stat 过的待取条数（一拍最多一次目录 stat；每拍开头清）

  /** 本拍待取条数（读缓存 —— 受阻跨格出声与交待取条数共用本拍那一次 stat）。 */
  const pendingOfTick = () => (pendingThisTick ??= pendingCount(sid()))

  /** 交待取条数（`onPending`）：不传 ⇒ 零动作零 stat；`n` 显式给（取件后已知的 0）⇒ 用该值。 */
  function reportPending(n = null) {
    if (typeof onPending !== "function") return
    onPending(n === null ? pendingOfTick() : n)
  }

  const disarm = () => {
    const h = handle
    handle = null
    if (h !== null) { try { clearFn(h) } catch { /* 已触发 / 不可清——尽力面 */ } }
  }

  /** 本刻取不上件的因（D-MI35）：`"busy"` = 在飞一轮 ∥ `"carrier"` = 端壳此刻开不了一轮；`null` = 门开着。
   *  **两个谓词的答法不同、方向都朝安全侧**：`ready()` 非 `true` 一律当不就绪（猜真空转、猜假永不取件，两个都静默）；
   *  `isBusy()` 反之——**任何真值都当在飞**（猜「不忙」= 把消息注入一个在飞的回合，正是 F-MI10「不打断」禁止的
   *  形态，且全程无痕）。两者都不替端壳拆解返回值。
   *  `ready()` 排在 `isBusy()` 之后 ⇒ 在飞期不跑就绪判据（「取件闩」成本口径：在飞一拍 = 一次内存判据，
   *  目录 stat 只在受阻跨格或交待取条数时才发生）。 */
  function blockedReason() {
    if (isBusy?.()) return "busy" // 真值即忙（猜「不忙」是危险方向——见上）
    if (ready() !== true) return "carrier" // 端壳答「开不了」（含答不上来——不许替它猜真）
    if (typeof onTake !== "function") return "carrier" // 没人能开轮 ⇒ 取了就是静默丢（与返假同义）
    return null
  }

  /** D-MI33 ∥ D-MI35：这一拍取不上件——只维护计数器，跨格才做一次目录 stat。
   *  `reason` = 本刻那一支（两因换因不重算 `ms`：人读线问的是「等了多久」）。 */
  function noteBlocked(reason) {
    const at = now()
    if (blockedSince === null) { blockedSince = at; blockedTier = 0; return }
    const elapsed = at - blockedSince
    const tier = Math.floor(elapsed / INBOX_BLOCKED_MS)
    if (tier <= blockedTier) return
    blockedTier = tier
    const pending = pendingOfTick()
    if (pending === 0) { logEvent("ev:inbox-watch-blocked-empty", { ms: elapsed }); return }
    logEvent("ev:inbox-watch-blocked", { ms: elapsed, pending, reason })
    onBlocked?.(elapsed, pending)
  }

  /** 试取件段（重臂已完成——本段抛错不影响下一拍）。 */
  async function attempt() {
    const reason = blockedReason()
    if (reason !== null) { noteBlocked(reason); reportPending(); return false } // 取不上件（两因）⇒ 零取件、计数 + 跨格出声
    blockedSince = null // 门开了 ⇒ 受阻计数归零（再受阻从零重新报）
    blockedTier = 0
    const messages = takeInbox(sid())
    if (messages.length === 0) { reportPending(0); return false } // 空闲常态：保持一拍一查
    try {
      await onTake(messages)
      reportPending(0) // 一次取尽（`takeInbox` 整目录）⇒ 取后待取恒为 0，端壳即刻摘除提示
      return true // 已登记为在飞：本拍零重臂之外无动作，下一拍由 isBusy 早退
    } catch (e) {
      // D-MI32：消息已离盘（一次性口径）⇒ 不重投，只能明说。日志带 msgId 列表，端壳出逐字丢失行。
      // msgIds 落成串（`logEvent` 只收串 ∥ 数 ∥ 布尔——数组会被整字段丢掉；上限 120 字符）。
      logEvent("ev:inbox-watch-take-lost", {
        msgIds: msgIdsOf(messages).join(","),
        msg: String(e?.message ?? e).slice(0, 200),
      })
      reportPending(0) // 消息已离盘 ⇒ 待取归 0（丢失面归丢失行，不留在待取提示里）
      return false
    }
  }

  /**
   * 一拍。**第一行 = 无条件重臂**（D-MI31 不变式：在一切可抛调用之前、不进 `try`）——把「门还能不能开」
   * 与「哪段代码跑到没跑到」解耦：本拍怎么抛，下一拍都在。
   */
  async function fire() {
    sync()
    if (inFlight) return false // 上一拍还没落定 ⇒ 本拍跳过（零 stat），定时器照常走下一拍
    inFlight = true
    pendingThisTick = null // 本拍重新计（一拍最多一次 stat）
    try {
      return await attempt()
    } catch (e) {
      logEvent("ev:inbox-watch-err", { msg: String(e?.message ?? e).slice(0, 200) })
      return false
    } finally {
      inFlight = false
    }
  }

  /** （重）武装一拍。**无条件在位**（D-MI31）：门开不开由 `ready()` 闸住，与「载体有没有就位」无关——
   *  不装 ⇒ 载体就位后无人来取，名册却已登记，发送方拿到「已送达」而消息永远躺在 inbox（D-MI28 要防的
   *  正是这条）。撤闩只有端壳的「退出 / 销毁」两路。幂等：补位点（回合尾 / 模态关闭）可任意次调用——撤旧装新。 */
  const sync = () => {
    disarm()
    handle = timerFn(() => {
      handle = null
      // 火面异常不得逃逸成 unhandledRejection（端壳宿主会连同整个进程/扩展宿主一起带走），
      // 也不得静默（「取件闩」失败可见）：记一笔——重臂已在 `fire()` 首行完成，本处**不再**重臂。
      void fire().catch((e) => {
        logEvent("ev:inbox-watch-err", { msg: String(e?.message ?? e).slice(0, 200) })
      })
    }, INBOX_POLL_MS)
    try { handle?.unref?.() } catch { /* unref 失败不阻断（一次性闩自然退出） */ }
    return INBOX_POLL_MS
  }

  // 会话起点一次（不每秒扫根）：① 残留消息清扫（「发送」）② 名册死条目清扫（「名册」——写面住本进程，
  // 让只读的 `instance_list` 保持真只读）；两者都失败静默（清理面不阻断取件面）。
  void sweepInbox().catch(() => {})
  void sweepInstances().catch(() => {})
  return { sync, disarm, fire }
}
