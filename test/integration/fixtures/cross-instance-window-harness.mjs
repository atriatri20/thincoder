/**
 * 夹具：一个「跨实例消息」**CLI 端壳**（集成用例 CLI 46-2 专用——挂起窗取件）。
 *
 * 真件 = **生产取件谓词与开轮面**（`thincoder-cli/src/tui/timer-watch.mjs` 的 `createInboxWatch` ∥
 * `createInboxTake`）+ 核三档（`instance-registry.mjs` 名册 ∥ `instance-inbox.mjs` 收件箱 ∥
 * `instance-inbox-watch.mjs` 取件闩）+ 核消息形态（`crossMessageText`）。
 *
 * **被替掉的只有宿主**（真 TUI 要 TTY、要真 provider、要真子代理）：本夹具用两个状态位模拟宿主——
 * `state.processing`（有没有回合在飞）与 `state.suspended`（有没有活挂起窗），外加 `state.pendingInput`
 * 与 `state._suspWake`（真 CLI 的窗输入队列与唤醒面）。**夹具不替端壳答「忙」**：忙与不忙是生产谓词自己从
 * 这两个状态位读出来的，46-1 那种「把 busy 当入参喂闩」在本题面上不成立。
 *
 * 窗的步边界（真 CLI 由核 `startSuspension` 第 1 步承担）在这里是一个可关的模型：`window` 命令的
 * `consume` 位关掉时，窗只是「在场且不消费」——用来制造「窗先退出、消息还在队列里」那一态。
 *
 * 命令（stdin 逐行 JSON）→ 回执（stdout 逐行 JSON）：
 * - `{op:"init", cwd}` ⇒ `{ok, sessionId, pid, armed}`（登记名册 + 武装取件闩）
 * - `{op:"turn", v}` ⇒ `{ok, processing}`（宿主回合在飞开关）
 * - `{op:"window", v, consume?}` ⇒ `{ok, suspended, consume, residual}`（挂起窗在场开关；`v:false` = 窗退出并经
 *   残项回填把队列里剩下的以普通回合续发——返回续发条数）
 * - `{op:"tick"}` ⇒ `{ok, ran, armed, turns, directTurns, resumeTurns, took, queue, wakes, lines, processing}`
 * - `{op:"state"}` ⇒ `{ok, sessionId, turns, directTurns, resumeTurns, history, queue, wakes, processing, suspended}`
 * - `{op:"send", target, text, re?}` ⇒ `{ok, receipt}` ∥ `{ok:false, error:{code,message}}`
 * - `{op:"exit"}` ⇒ `{ok}`（删名册条目并退出）
 */
import { mkdirSync } from "node:fs"
import { join } from "node:path"
import { createInterface } from "node:readline"

import { _setInstanceDirForTest, registerInstance, unregisterInstance } from "../../../thincoder-core/instance-registry.mjs"
import { _setInboxDirForTest, sendMessage } from "../../../thincoder-core/instance-inbox.mjs"
import { _setPeerMessageTestImpl } from "../../../thincoder-core/instance-inbox-watch.mjs"
import { getSessionId } from "../../../thincoder-core/session-slots.mjs"
import { _setLogsDirForTest } from "../../../thincoder-core/log.mjs"
import { createInboxWatch, createInboxTake } from "../../../thincoder-cli/src/tui/timer-watch.mjs"

const root = process.argv[2]
if (!root) { process.stdout.write(JSON.stringify({ ok: false, error: { code: "no-root", message: "harness needs a shared root dir" } }) + "\n"); process.exit(2) }
mkdirSync(join(root, "instances"), { recursive: true })
mkdirSync(join(root, "inbox"), { recursive: true })
_setInstanceDirForTest(join(root, "instances"))
_setInboxDirForTest(join(root, "inbox"))
_setLogsDirForTest(join(root, "logs"))

// 假钟 + 假定时器（核注入面）：一拍由 `tick` 显式跑（真 1 s 拍子会自己取件，用例就不确定了）。
let fakeNow = 1_700_000_000_000
const timers = new Map()
let timerSeq = 0
_setPeerMessageTestImpl({
  nowFn: () => fakeNow,
  timer: (fn) => { const id = ++timerSeq; timers.set(id, fn); return id },
  clear: (id) => { timers.delete(id) },
})

/** 宿主状态位（真 CLI 的 `state` 子集——生产谓词只读这几项）。 */
const state = { processing: false, suspended: false, pendingInput: [], _suspWake: null }
const agent = { history: [] }
let turns = 0 // 窗口起的轮（窗步边界消费）
let directTurns = 0 // 无窗时宿主 `turn` 直接起的轮
let resumeTurns = 0 // 窗退出后残项续发
let windowConsume = true
let wakes = 0
let lastTaken = []
let lines = []

const reply = (obj) => process.stdout.write(JSON.stringify(obj) + "\n")
const settle = (ms = 30) => new Promise((r) => setTimeout(r, ms))

/** 窗步边界（真 CLI = 核 `startSuspension` 第 1 步「用户输入优先」）：无回合在飞 ⇒ 取队列起一轮。 */
function windowStep() {
  if (!state.suspended || !windowConsume) return
  if (state.processing || state.pendingInput.length === 0) return
  const text = state.pendingInput.splice(0).join("\n\n")
  turns += 1
  lastTaken.push({ text })
  agent.history.push({ role: "user", content: text, window: true })
  state.processing = true // 「已登记为在飞」——由 `turn` op 复位
}

/** 宿主 `turn` 面（真 CLI = `createTurnFace().turn`）：同步置在飞位 ⇒ 开轮面返回时已可读。 */
function hostTurn(text) {
  directTurns += 1
  lastTaken.push({ text, direct: true })
  agent.history.push({ role: "user", content: text, direct: true })
  state.processing = true
  return Promise.resolve()
}

const inboxWatch = createInboxWatch({
  state,
  onTake: createInboxTake({ state, turn: hostTurn, pushLine: (line) => lines.push(line) }),
  onBlocked: (ms, pending) => lines.push(`[cross-instance message · pickup blocked ${ms}ms: ${pending} pending]`),
  timer: (fn) => { const id = ++timerSeq; timers.set(id, fn); return id },
  clear: (id) => { timers.delete(id) },
})

const rl = createInterface({ input: process.stdin })
rl.on("line", (line) => {
  const text = line.trim()
  if (!text) return
  let cmd
  try { cmd = JSON.parse(text) } catch { reply({ ok: false, error: { code: "bad-command", message: text } }); return }
  void (async () => {
    switch (cmd.op) {
      case "init": {
        const entry = registerInstance({ cwd: typeof cmd.cwd === "string" ? cmd.cwd : "" })
        inboxWatch.sync()
        reply({ ok: true, sessionId: entry.sessionId, pid: entry.pid, armed: timers.size })
        return
      }
      case "turn": {
        state.processing = cmd.v === true
        reply({ ok: true, processing: state.processing })
        return
      }
      case "window": {
        const open = cmd.v === true
        if (open) {
          windowConsume = cmd.consume !== false
          state.suspended = true
          state._suspWake = () => { wakes += 1; setTimeout(windowStep, 0) } // 窗在步边界醒来取批
          reply({ ok: true, suspended: true, consume: windowConsume, residual: 0 })
          return
        }
        // 窗退出（非中止径 —— 真 CLI = `suspensionSession` 的 idle 分支）：残项回填宿主队列 ⇒ 逐条以普通回合续发
        state.suspended = false
        state._suspWake = null
        const residual = state.pendingInput.splice(0)
        for (const item of residual) {
          resumeTurns += 1
          lastTaken.push({ text: item, resumed: true })
          agent.history.push({ role: "user", content: item, resumed: true })
        }
        await settle()
        reply({ ok: true, suspended: false, consume: windowConsume, residual: residual.length })
        return
      }
      case "tick": {
        lastTaken = []
        lines = []
        const entry = [...timers.entries()].at(-1)
        if (!entry) { reply({ ok: true, ran: false, armed: timers.size, turns, directTurns, resumeTurns, took: [], queue: state.pendingInput.length, wakes, lines, processing: state.processing }); return }
        timers.delete(entry[0])
        entry[1]() // 真宿主同形：定时器回调 = `fire()`（闩在拍内自续）
        await settle()
        reply({
          ok: true, ran: true, armed: timers.size, turns, directTurns, resumeTurns,
          took: lastTaken, queue: state.pendingInput.length, wakes, lines, processing: state.processing,
        })
        return
      }
      case "send": {
        try {
          const receipt = await sendMessage(
            { sessionId: cmd.target, text: cmd.text, re: cmd.re },
            { cwd: typeof cmd.cwd === "string" ? cmd.cwd : "" },
          )
          reply({ ok: true, receipt })
        } catch (e) {
          reply({ ok: false, error: { code: e?.code ?? "error", message: e?.message ?? String(e) } })
        }
        return
      }
      case "state": {
        reply({
          ok: true, sessionId: getSessionId(), turns, directTurns, resumeTurns,
          history: agent.history, queue: state.pendingInput.length, wakes,
          processing: state.processing, suspended: state.suspended,
        })
        return
      }
      case "exit": {
        unregisterInstance()
        reply({ ok: true })
        process.exit(0)
        return
      }
      default:
        reply({ ok: false, error: { code: "unknown-op", message: String(cmd.op) } })
    }
  })().catch((e) => reply({ ok: false, error: { code: "harness-error", message: e?.message ?? String(e) } }))
})
