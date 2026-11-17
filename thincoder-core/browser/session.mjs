/**
 * browser/session.mjs — 会话单例：惰性开启 ∥ 串行队列 ∥ 生命周期 ∥ 页原语 ∥ 安全助手 ∥ 分发表 ∥ 会话句柄。
 * 设计权威 = `docs/core/design/BROWSER-TOOL.md` §2.4（会话模型）∥ §2.5（数据流）∥ §2.9–§2.10（动作预算 /
 * 会话健康）∥ §3（安全面）∥ §5（拆分决定）。
 *
 * 单会话/进程（KD-5）：同进程所有 agent 共一份浏览器；动作串行（同一队列——批并行调用天然排队）。
 * **跨进程共享**：全机一个共享浏览器、第一个实例拉起、最后一个关（用者计数）——判定与生命周期全在
 * `pool.mjs`（机制单源 = `docs/core/design/BROWSER-TOOL.md` §12），本档只留接线（开启 ∥ 关闭 ∥ 空闲 ∥ 退出钩子）。
 * 硬超时（§2.9）：每动作入队即记预算 deadline（队列等待计入——有意），到点由 `queue.mjs` 动作控制器中止
 * （错误句携卡点步名）；一切 CDP 命令经本档 `cdpCall` 单点接线（步名 = 方法名 ∥ 中止守卫 ∥ abort 后快速失败）。
 * 会话健康（§2.10）：进程事件 ∥ 连接事件 ∥ 入口探针三源；外部关闭 ⇒ `failSession` 单点（拒在飞 ⇒ 态复位
 * ⇒ 摘自己的用者登记 ⇒ 置重开注记）；不动 `session.lock`、不杀共享浏览器（§12）。下一次动作自愈重开
 * （首回执尾行注记——置位一次，发出即清）。
 * `headless` = **共享浏览器的首开属性**（§12「模式」条）：池内已在跑 ⇒ 沿用生效值并在回执尾行告知，不报错；
 * 模式注记与重开注记同写一位（`sealNote`），两条同时待发时分两行发出。空闲 15 分钟 = 摘自己（KD-8）
 * ——仍有活条目则浏览器留着，末个用者才关。
 * 动作实施层 = `actions.mjs`（基线八）+ `input-actions.mjs`（新七）+ `clipboard.mjs` + `session-state.mjs`
 * （会话态六形）——经会话句柄取能力，不 import 本档（DAG 单向：`session → {actions, input-actions, clipboard,
 * session-state} → {input, snapshot, cdp}`；`session → queue`，§5）。
 *
 * 注入缝（N-BT6）：`_deps.openBrowser` ∥ `_deps.killBrowser` ∥ `_deps.saveShot`——缺省 null ⇒
 * 回落真实现（`??`）；用例注入后 `finally` 还原。共享池的注入缝在 `pool.mjs`。
 */
import { mkdirSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { ACTIONS } from "./actions.mjs"
import { CLIPBOARD_ACTIONS } from "./clipboard.mjs"
import { INPUT_ACTIONS } from "./input-actions.mjs"
import { SESSION_STATE_ACTIONS } from "./session-state.mjs"
import { DEFAULT_CALL_TIMEOUT_MS, connectCdp } from "./cdp.mjs"
import { browserPaths, killBrowser } from "./launch.mjs"
import { attachOrLaunch, modeNote, releaseUser, releaseUserSync } from "./pool.mjs"
import { createActionQueue } from "./queue.mjs"
import {
  COMPACT_ROWS, createPagePrimitives, pageError,
} from "./snapshot.mjs"

export const IDLE_MS = 15 * 60 * 1000
const GRACEFUL_CLOSE_MS = 3_000
const CLOSE_CALL_MS = 3_000 // `Browser.close` 显式帽（§2.9 层二）
const ENABLE_CALL_MS = 10_000 // `Page/Runtime/Network.enable` 显式帽（§2.9 层二）
const PROBE_TIMEOUT_MS = 2_000 // 健康探针心跳帽（§2.9 层二 / §2.10 源③）
const PROBE_FRESH_MS = 5_000 // 距上次成功 CDP 活动 >5s 才做心跳（§2.10 源③）
const CALL_CAP_SLACK_MS = 1_000 // 动作内调用兜底帽对剩余预算的余量（预算先行：控制器先于兜底帽裁决）
const REOPEN_NOTE = "[note: the previous browser session was closed externally — a fresh session was opened (page state lost; profile/login kept)]"

/** 测试替身缝（缺省 null ⇒ 回落真实现）。 */
export const _deps = { openBrowser: null, killBrowser: null, saveShot: null }

/** 在飞动作的控制器（§2.9——单动作单控制器；串行队列 ⇒ 同刻至多一个）。 */
let currentController = null

const queue = createActionQueue()

const sleep = (ms) => (currentController ? currentController.sleep(ms) : new Promise((r) => setTimeout(r, ms)))

/** 控制器接线（无控制器 ⇒ 直通）：步名帧 + 中止守卫（§2.9）。 */
function runFrame(name, work) {
  return currentController ? currentController.run(name, work) : work()
}

const state = {
  cdp: null,
  child: null,
  tabId: null,
  starterPid: null,
  headless: null,
  lastUrl: null,
  lastTitle: null,
  lastActivityAt: 0,
  idleTimer: null,
  notes: [],
  net: { inflight: new Set(), lastEventAt: 0 },
}

/** 待发注记（尾行——重开注记在前、模式注记在后；发出即清）。 */
function pushNote(text) {
  if (text) state.notes.push(text)
}

// ── 生命周期 ────────────────────────────────────────────────────────────────

/** 真实现：共享池接入 ∥ 首开（`attachOrLaunch`——§12）→ WebSocket → 三域 enable（§2.4 开启序）。
 *  开启段中途中止 ⇒ 连接复位 + 摘自己的用者登记；**不动 `session.lock`、不杀共享浏览器**（§2.9 ∥ §2.10：
 *  它是全机共享物，生命周期只由末关 ∥ 下一位持有者的孤儿回收决定）。置重开注记在 ensureSession。 */
async function openBrowserReal({ headless }) {
  const paths = browserPaths()
  try {
    const joined = await runFrame("launch browser", () => attachOrLaunch({ paths, wantedHeadless: headless }))
    let conn = null
    try {
      conn = await runFrame("connect CDP", () => connectCdp(joined.wsUrl))
      for (const domain of ["Page.enable", "Runtime.enable", "Network.enable"]) {
        await runFrame(domain, () => conn.call(domain, {}, { timeoutMs: ENABLE_CALL_MS }))
      }
    } catch (e) {
      try { conn?.close() } catch { /* 已断 */ }
      throw e
    }
    return {
      cdp: conn,
      child: joined.child ?? null,
      tabId: joined.tabId ?? null,
      starterPid: joined.starterPid ?? null,
      headless: joined.headless ?? null,
      note: joined.note ?? null,
    }
  } catch (e) {
    releaseUserSync({ paths }) // 摘自己的登记（未登记则无事；锁与共享浏览器不动）
    throw e
  }
}

/** 会话态复位（关闭 ∥ 外部关闭共用单点）。**不碰 `notes`**——待发注记跨复位生（重开注记在复位后置位）。 */
function resetState() {
  disarmIdle()
  state.cdp = null
  state.child = null
  state.tabId = null
  state.starterPid = null
  state.headless = null
  state.lastUrl = null
  state.lastTitle = null
  state.lastActivityAt = 0
  pages.reset()
  state.net = { inflight: new Set(), lastEventAt: 0 }
}

function armIdle() {
  if (state.idleTimer) clearTimeout(state.idleTimer)
  state.idleTimer = setTimeout(() => {
    // 走串行队列：空闲关不与在途动作交错（下一动作排在关后——同 profile 不会双开）
    queue.chain(() => closeSession()).catch(() => { /* 空闲关失败不逸出 */ })
  }, IDLE_MS)
  state.idleTimer.unref?.() // 不为一台浏览器吊住宿主进程
}

function disarmIdle() {
  if (state.idleTimer) { clearTimeout(state.idleTimer); state.idleTimer = null }
}

let exitHooked = false
function registerExitHook() {
  if (exitHooked) return
  exitHooked = true
  // 退出钩子里不能等异步面（§12「退出与崩溃的诚实边界」）：同步摘自己的登记；
  // 无活用者 ∧ 自己持子进程 ⇒ 杀树（pid 来源只有拉起者自己的 `state.child`）；其余留待下一任持有者回收。
  process.once("exit", () => {
    const left = releaseUserSync({ paths: browserPaths() }).others
    if (left === 0 && state.child) (_deps.killBrowser ?? killBrowser)(state.child)
  })
}

function headlessOf(args) {
  return typeof args?.headless === "boolean" ? args.headless : undefined
}

// ── 会话健康（§2.10——外部关闭可感知 + 自愈）────────────────────────────────

/** 外部关闭显式失败句（§2.10）：在飞动作与入口探针同一句式。 */
function externalCloseError(cause) {
  const error = new Error(`the browser session was closed externally (${cause}) — run the action again to reopen a fresh session`)
  error.sessionLost = true
  return error
}

/** 处置单点（§2.10）：拒在飞（同一因由实例）⇒ 态复位 ⇒ 摘自己的用者登记 ⇒ 置重开注记。
 *  **不动 `session.lock`、不杀共享浏览器**（§12：它是全机共享物）。不调 `Browser.close`、不等自退（连接 / 进程已死）。 */
function failSession(cause) {
  const error = externalCloseError(cause)
  currentController?.abort("session-lost", error)
  const { cdp } = state
  resetState()
  if (cdp) { try { cdp.close() } catch { /* 已断 */ } }
  releaseUserSync({ paths: browserPaths() })
  pushNote(REOPEN_NOTE)
  return error
}

/** 健康接线（§2.10 源①②）：子进程 exit/error ∥ WS 断连 ⇒ 即时失败化。 */
function attachSessionHealth(cdp) {
  const child = state.child
  if (child && typeof child.on === "function") {
    const gone = () => { if (state.child === child) failSession("the browser process exited") }
    child.on("exit", gone)
    child.on("error", gone)
  }
  cdp.onDisconnect?.(() => { if (state.cdp === cdp) failSession("the connection to the browser dropped") })
}

/** 入口探针（§2.10 源③）：子进程存活 ∧ 连接未关（恒检——零成本）；距上次成功活动 >5s ⇒ 心跳 `Browser.getVersion`（2s 帽）。 */
async function probeSession() {
  const child = state.child
  // 非真实子进程（无事件面的替身）⇒ 存活不可判——跳过该检（真实现恒有 ChildProcess 事件面）
  if (child && typeof child.on === "function" && (child.exitCode !== null || child.signalCode != null)) {
    throw failSession("the browser process exited")
  }
  if (state.cdp?.closed) throw failSession("the connection to the browser dropped")
  if (Date.now() - state.lastActivityAt < PROBE_FRESH_MS) return
  try {
    await cdpCall("Browser.getVersion", {}, { timeoutMs: PROBE_TIMEOUT_MS })
  } catch (e) {
    if (e?.browserAbort || e?.sessionLost) throw e // 预算中止 / 会话已失 ⇒ 原样上报（fresh 判据已由它裁决）
    throw failSession("the browser is not responding")
  }
}

/** 会话开启（惰性 + 模式沿用注记 + 入口探针）；开启段中止 ⇒ 置重开注记（半开态已由
 *  `openBrowserReal` 复位）——下一次动作干净重开，不中毒（§2.9 开启段中止）。
 *  模式不再报错（§12「模式」条）：池内已在跑时请求值异 ⇒ **沿用生效值**并在回执尾行注记（不得静默）。 */
async function ensureSession(wanted) {
  if (state.cdp) {
    if (wanted !== undefined && typeof state.headless === "boolean" && wanted !== state.headless) {
      pushNote(modeNote({ wanted, actual: state.headless, starterPid: state.starterPid }))
    }
    await probeSession()
    return
  }
  let opened
  const ctl = currentController
  ctl?.pauseBudget() // 冷启段不占动作预算（§2.4 冷启预算 / KD-26）：自启窗口内预算钟暂停（自启段自身由启动窗帽 + 三域 enable 帽界定）
  try {
    opened = await runFrame("launch browser", () => (_deps.openBrowser ?? openBrowserReal)({ headless: wanted === undefined ? true : wanted }))
  } catch (e) {
    if (e?.browserAbort) pushNote(REOPEN_NOTE)
    ctl?.resumeBudget() // 失败腿同样恢复（自启失败的裁决归启动窗帽与错误本体）
    throw e
  }
  ctl?.resumeBudget() // 动作时钟自会话就绪后起算（自启用时不计入动作预算；排队期照旧计入）
  state.cdp = opened.cdp
  state.child = opened.child ?? null
  state.tabId = opened.tabId ?? null
  state.starterPid = opened.starterPid ?? null
  state.headless = opened.headless ?? null
  pushNote(opened.note)
  pages.reset()
  state.net = { inflight: new Set(), lastEventAt: Date.now() }
  state.lastActivityAt = Date.now()
  const net = state.net
  opened.cdp.on("Network.requestWillBeSent", (p) => { net.inflight.add(p.requestId); net.lastEventAt = Date.now() })
  opened.cdp.on("Network.loadingFinished", (p) => { net.inflight.delete(p.requestId); net.lastEventAt = Date.now() })
  opened.cdp.on("Network.loadingFailed", (p) => { net.inflight.delete(p.requestId); net.lastEventAt = Date.now() })
  attachSessionHealth(opened.cdp)
  registerExitHook()
  armIdle()
}

/** 等子进程自退（优雅关后）。 */
async function waitForExit(child, maxMs) {
  const deadline = Date.now() + maxMs
  while (child.exitCode == null && Date.now() < deadline) await sleep(100)
}

/** 关闭会话（幂等）：**摘自己**（删自己的登记）→ 重扫 → 无活条目才关浏览器（末关）→ 关自己的标签页 → 删锁；
 *  仍有活条目 ⇒ 浏览器留着、只关自己的标签页，回执明说还有几家在用（§12「用者登记与末关」）。
 *  次序的理由：标签页一关就撕掉本进程的 CDP 连接，而末关的 `Browser.close` 正走那条连接——先关标签页，
 *  非拉起者的末关就发不出关闭命令（回执说 `closed` 而浏览器还在跑）。
 *  末关先 `Browser.close` 优雅关（浏览器自行落盘 profile——Cookie/localStorage 持久化是 F-BT6 的落盘前提；
 *  实测：直杀树不落盘 ⇒ 二段会话拿不到 Cookie）；杀树兜底的 pid 来源**只有拉起者**（`state.child`）。
 *  中止（预算 / 取消）⇒ 跳过优雅等待、直接杀树兜底，清理完成后以中止因由上报（§2.9 abort 语义）。
 * @returns {Promise<{hadSession: boolean, others: number, lastUser: boolean, browserClosed: boolean}>} */
export async function closeSession() {
  const { cdp, child, tabId } = state
  const hadSession = Boolean(cdp || tabId)
  resetState()
  let aborted = null
  const closeBrowser = async () => {
    let closeError = null
    if (cdp) {
      try { await runFrame("Browser.close", () => cdp.call("Browser.close", {}, { timeoutMs: CLOSE_CALL_MS })) }
      catch (e) { closeError = e; if (e?.browserAbort) aborted = e /* 已断 ∥ 不支持 ∥ 中止 ⇒ 转杀树兜底 */ }
    }
    if (child) {
      if (!aborted) {
        try { await runFrame("Browser.close", () => waitForExit(child, GRACEFUL_CLOSE_MS)) }
        catch (e) { if (e?.browserAbort) aborted = e }
      }
      if (aborted || child.exitCode == null) {
        try { (_deps.killBrowser ?? killBrowser)(child) } catch { /* 已退出 */ }
      }
    } else {
      await sleep(GRACEFUL_CLOSE_MS) // 非拉起者无 pid 可杀：只等 3 s 自退（§12「杀树兜底的 pid 来源只有拉起者」）
    }
    // 末关的自证面：拉起者有杀树兜底（杀完即消失）；非拉起者只剩「`Browser.close` 被接受」这一读数——
    // 它失败了就不能声称已关（§2.2 两形回执不可互换 · AC-M3 的量法 = 进程消失）
    if (closeError && !child) throw closeError
    if (aborted) throw aborted
  }
  // 无会话（空闲定时器空跳）⇒ 不碰登记与锁：另一实例可能正在首开中
  const outcome = hadSession
    ? await releaseUser({ paths: browserPaths(), tabId, closeBrowser })
    : { others: 0, lastUser: false, browserClosed: false }
  if (cdp) { try { cdp.close() } catch { /* 已断 */ } }
  if (aborted) throw aborted
  return { hadSession, ...outcome }
}

/** 审批请示面用的「最近页 URL」（§3.1 文案；无会话 ⇒ null）。 */
export function lastPageUrl() {
  return state.lastUrl
}

// ── 页原语 ──────────────────────────────────────────────────────────────────

/** 一切 CDP 命令的单点（§2.9 层一）：步名帧（方法名）∥ 中止守卫 ∥ abort 后快速失败；成功 ⇒ 记活动时刻。
 *  缺省帽（层三 15s）在动作预算内让位于控制器（预算先行——层一优先：兜底帽 = 剩余预算 + 1s 余量）；
 *  动作外路径按缺省帽兜底。 */
function cdpCall(method, params = {}, { timeoutMs } = {}) {
  const cdp = state.cdp
  if (!cdp) throw new Error("no browser session — run navigate first")
  const ctl = currentController
  ctl?.failIfAborted()
  const cap = timeoutMs ?? (ctl ? Math.max(DEFAULT_CALL_TIMEOUT_MS, ctl.remaining() + CALL_CAP_SLACK_MS) : DEFAULT_CALL_TIMEOUT_MS)
  const work = ctl ? ctl.run(method, () => cdp.call(method, params, { timeoutMs: cap })) : cdp.call(method, params, { timeoutMs: cap })
  return Promise.resolve(work).then(
    (result) => { state.lastActivityAt = Date.now(); return result },
    (e) => { if (ctl?.aborted) throw ctl.error; throw e },
  )
}

async function evalRaw(expression) {
  // CDP 形：`call()` 解到命令的 result（`{result: RemoteObject}`）——页面值在 `result.result.value`
  const r = await cdpCall("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true })
  if (r?.exceptionDetails) throw pageError(exceptionText(r.exceptionDetails)) // 页面侧异常 ⇒ 同失败回执面（带页摘）
  return r?.result?.value
}

function exceptionText(details) {
  const raw = details?.exception?.description ?? details?.text ?? "unknown page exception"
  return String(raw).split("\n")[0]
}

/** 页原语（页与引用表——实现单源 = `snapshot.mjs` 的 `createPagePrimitives`；§12 尺寸拆分）。 */
const pages = createPagePrimitives({
  evalRaw,
  step: (name, work) => runFrame(name, work),
  sleep: (ms) => sleep(ms),
  onPage: ({ url, title }) => { state.lastUrl = url; state.lastTitle = title },
})

// ── 安全面 ──────────────────────────────────────────────────────────────────

/** 域允许清单匹配（§3.2）：全等（大小写不敏感）∥ `*.` 前缀 = 子域通配。 */
export function hostAllowed(host, list) {
  const h = String(host).toLowerCase()
  return list.some((entry) => {
    const pattern = String(entry ?? "").trim().toLowerCase()
    if (!pattern) return false
    if (pattern.startsWith("*.")) return h.endsWith(`.${pattern.slice(2)}`)
    return h === pattern
  })
}

function allowDomainsOf(ctx) {
  const list = ctx?.agent?.config?.browser?.allowDomains
  return Array.isArray(list) ? list : []
}

/** 域强检（navigate 目标 ∥ click/evaluate/type 当前页——§3.2 两点）。 */
function assertHostAllowed(url, ctx) {
  const list = allowDomainsOf(ctx)
  if (list.length === 0) return
  let host = ""
  try { host = new URL(url).hostname } catch { return }
  if (!hostAllowed(host, list)) {
    throw new Error(`blocked by browser.allowDomains — host "${host}" not allowed`)
  }
}

/** 失败回执（§2.2）：`Error: <因由>` + 页摘 + 紧凑清单（≤30 行——页不可读时仅错误行）。 */
async function failureReceipt(message) {
  const parts = [`Error: ${message}`]
  if (state.cdp) {
    try { parts.push((await pages.takeSnapshot({ max: COMPACT_ROWS })).text) } catch { /* 页不可读 ⇒ 仅错误行 */ }
  }
  return parts.join("\n")
}

/** 真落盘（screenshot 缝的缺省实现）：`~/.thincoder/browser/shots/shot-<ISO>.png`。 */
async function saveShotToDisk(buffer) {
  const dir = browserPaths().shots
  mkdirSync(dir, { recursive: true })
  const path = join(dir, `shot-${new Date().toISOString().replace(/[:.]/g, "-")}-${process.pid}.png`)
  writeFileSync(path, buffer)
  return { path, bytes: buffer.length }
}

// ── 会话句柄（动作模块的能力面——§5：动作模块不 import 本档）──────────────────

/** 等一条 CDP 事件（一次性；超时 / 中止 ⇒ 拒——html5 拖拽拦截链用）。 */
function once(method, timeoutMs = 10_000) {
  const ctl = currentController
  ctl?.failIfAborted()
  return new Promise((resolve, reject) => {
    if (!state.cdp) { reject(new Error("no browser session")); return }
    let timer = null
    let off = null
    let offAbort = null
    let done = false
    const finish = (fn, value) => {
      if (done) return
      done = true
      if (timer) clearTimeout(timer)
      off?.()
      offAbort?.()
      fn(value)
    }
    off = state.cdp.on(method, (params) => finish(resolve, params))
    offAbort = ctl?.onAbort(() => finish(reject, ctl.error))
    timer = setTimeout(() => finish(reject, new Error(`timed out waiting for ${method}`)), timeoutMs)
    timer.unref?.()
  })
}

const sessionHandle = {
  ensureSession: (args) => ensureSession(headlessOf(args)),
  closeSession,
  connection: () => state.cdp,
  call: (method, params) => cdpCall(method, params),
  once: (method, timeoutMs) => runFrame(method, () => once(method, timeoutMs)),
  evalRaw,
  pageInfo: (opts) => pages.pageInfo(opts),
  waitForReady: (maxMs) => pages.waitForReady(maxMs),
  waitForUrlChange: (before, maxMs) => pages.waitForUrlChange(before, maxMs),
  takeSnapshot: (opts) => pages.takeSnapshot(opts),
  resolveRef: (ref) => pages.resolveRef(ref),
  focusRef: (ref) => pages.focusRef(ref),
  assertHostAllowed,
  failureReceipt,
  pageError,
  step: (name, fn) => runFrame(name, fn),
  sleep,
  saveShot: (buffer) => (_deps.saveShot ?? saveShotToDisk)(buffer),
  networkState: () => state.net,
}

// ── 分发表 ∥ 入口 ────────────────────────────────────────────────────────────

const ACTION_TABLE = { ...ACTIONS, ...INPUT_ACTIONS, ...CLIPBOARD_ACTIONS, ...SESSION_STATE_ACTIONS }

async function dispatchAction(action, args, ctx) {
  const handler = ACTION_TABLE[action]
  if (typeof handler !== "function") throw new Error(`unknown browser action "${action}"`)
  return handler(args, ctx, sessionHandle)
}

/** 尾行注记（§2.10 ∥ §12「模式」）：置位一次，发出即清；多条待发时重开注记在前、模式注记在后。 */
function sealNote(receipt) {
  if (!state.notes.length || !state.cdp) return receipt
  const notes = state.notes.join("\n")
  state.notes = []
  return `${receipt}\n${notes}`
}

async function runSerial(action, args, ctx, ctl) {
  ctl.failIfAborted() // 排队期已到点 ⇒ 动作从未起执行（无展开）
  try {
    return sealNote(await dispatchAction(action, args, ctx))
  } catch (e) {
    if (e?.pageReceipt) return sealNote(await failureReceipt(e.message))
    throw e
  } finally {
    if (state.cdp) armIdle() // 任何动作重置空闲计时（KD-8）
  }
}

/** 动作入口：串行队列 + 单时钟动作预算（§2.9——deadline 自入队起算；批并行调用按调用序排队）。
 *  `opts.signal`（批 browser-async-fix 最小增补——后台任务取消柄）：abort ⇒ 控制器 `cancel()`（queued 丢队 ∥ running 展开）；缺省 null 旧径零变。 */
export function runAction(action, args, ctx, { signal = null } = {}) {
  return queue.enqueue(action, args, (ctl) => {
    currentController = ctl
    return runSerial(action, args, ctx, ctl).finally(() => { currentController = null })
  }, signal)
}
