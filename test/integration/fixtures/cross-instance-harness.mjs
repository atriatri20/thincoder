/**
 * 夹具：一个「跨实例消息」实例壳（集成用例 CLI 46-1 专用）。
 *
 * 真件 = 核三档（`instance-registry.mjs` 名册 ∥ `instance-inbox.mjs` 收件箱 ∥ `instance-inbox-watch.mjs`
 * 取件闩）+ 核消息形态（`crossMessageText`）+ 核两条可见行拼串（`inboxTakeLostLine` ∥ `inboxBlockedLine`）。
 * **被替掉的只有回合面与宿主定时器**：真 CLI TUI 要 TTY、要真 provider；本夹具用 stdin 逐行 JSON 命令驱动一个
 * 假回合面（`tick` = 闩的一拍）与一口假钟（`advance` = 时钟推进）。所以本夹具证明得了「名册 × inbox ×
 * 取件闩 × 消息形态 × 跨进程投递」这条链，证不了「真 TUI 把这条消息渲染成什么、真模型读不读它」。
 *
 * **一拍怎么跑**（与真宿主同形）：取夹具队里的定时器回调 → 删条目 → 调用 → 等 `onTake` 落定。
 * 这样「闩还在不在」是**跑出来的读数**（`armed`），不是读代码判的——旧形态（在飞一拍不重臂）在这里读 0。
 *
 * 命令（stdin 逐行 JSON）→ 回执（stdout 逐行 JSON）：
 * - `{op:"init", cwd}` ⇒ `{ok, sessionId, pid, armed}`（登记名册 + 装取件闩）
 * - `{op:"busy", v}` ⇒ `{ok, busy}`（在飞回合开关）
 * - `{op:"ready", v}` ⇒ `{ok, ready}`（端壳就绪探针开关——D-MI34：`ready()` 假 = 这一端此刻开不了一轮）
 * - `{op:"failTake", v}` ⇒ `{ok}`（开轮面下一步 reject —— 失败单源的那条路）
 * - `{op:"advance", ms}` ⇒ `{ok, now}`（假钟推进；受阻跨阈用，不靠真实等待）
 * - `{op:"tick"}` ⇒ `{ok, ran, armed, turns, took, lines}`（跑一拍：闩自续 ⇒ `armed` 仍 1）
 * - `{op:"send", target, text, re?}` ⇒ `{ok, receipt}` ∥ `{ok:false, error:{code, message}}`
 * - `{op:"state"}` ⇒ `{ok, sessionId, turns, history, lines}`
 * - `{op:"exit"}` ⇒ `{ok}`（删名册条目并退出）
 */
import { mkdirSync } from "node:fs"
import { join } from "node:path"
import { createInterface } from "node:readline"

import { _setInstanceDirForTest, registerInstance, unregisterInstance } from "../../../thincoder-core/instance-registry.mjs"
import { _setInboxDirForTest, sendMessage } from "../../../thincoder-core/instance-inbox.mjs"
import {
  createInboxWatch, crossMessageText, inboxTakeLostLine, inboxBlockedLine, _setPeerMessageTestImpl,
} from "../../../thincoder-core/instance-inbox-watch.mjs"
import { getSessionId } from "../../../thincoder-core/session-slots.mjs"
import { _setLogsDirForTest } from "../../../thincoder-core/log.mjs"

const root = process.argv[2]
if (!root) { process.stdout.write(JSON.stringify({ ok: false, error: { code: "no-root", message: "harness needs a shared root dir" } }) + "\n"); process.exit(2) }
mkdirSync(join(root, "instances"), { recursive: true })
mkdirSync(join(root, "inbox"), { recursive: true })
_setInstanceDirForTest(join(root, "instances"))
_setInboxDirForTest(join(root, "inbox"))
_setLogsDirForTest(join(root, "logs")) // 日志面同样缝到共享根：用例可读 `ev:inbox-watch-blocked` 的 `reason`

// 假钟 + 假定时器（注入面 = 核 `_setPeerMessageTestImpl`）：时钟定值 ⇒ `{ms}` 可逐字断言；定时器入队
// ⇒ **没有真实 1 s 拍子**（真拍会自己取件，用例就不确定了），一拍由 `tick` 显式跑。
let fakeNow = 1_700_000_000_000
const timers = new Map()
let timerSeq = 0
_setPeerMessageTestImpl({
  nowFn: () => fakeNow,
  timer: (fn) => { const id = ++timerSeq; timers.set(id, fn); return id },
  clear: (id) => { timers.delete(id) },
})

/** 假载体：一条 user 线（真 CLI 是 `agent.history` + `_fullHistory`——本夹具只要机器线）。 */
const agent = { history: [] }
let busy = false
let ready = true // 端壳就绪探针（D-MI34）：本夹具的「端壳」自己回答——与真端同形，核闩不读 agent 对象
let failTake = false
let turns = 0
let lastTaken = []
let lines = [] // 本拍产出的可见行（假端壳的 pushLine 面——核拼串，逐字）

const watch = createInboxWatch({
  ready: () => ready, // 就绪判据住端壳（D-MI34）：本夹具就是那个端壳
  isBusy: () => busy,
  onTake: (messages) => {
    // 真端：以普通用户回合开轮（`autoTurn:false`），输入串 = 消息形态（核 `prepareRun` 的 pushReal 落成
    // 一条 role:"user" 消息）。本夹具落法同形——一条 user 消息一行；**返 promise**（交接契约：
    // resolve = 已登记为在飞 / reject = 开轮没成）。`failTake` 模拟「开轮面没开成」。
    if (failTake) {
      lines.push(inboxTakeLostLine(messages)) // D-MI32：端壳逐字丢失行（核另记 ev:inbox-watch-take-lost）
      return Promise.reject(new Error("harness: turn opener failed"))
    }
    turns += 1
    lastTaken = messages
    agent.history.push({ role: "user", content: crossMessageText(messages), crossInstance: true })
    return Promise.resolve()
  },
  onBlocked: (ms, pending) => lines.push(inboxBlockedLine(ms, pending)), // D-MI33：端壳逐字受阻行
})

function reply(obj) { process.stdout.write(JSON.stringify(obj) + "\n") }
const settle = (ms = 30) => new Promise((r) => setTimeout(r, ms))

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
        watch.sync()
        reply({ ok: true, sessionId: entry.sessionId, pid: entry.pid, armed: timers.size })
        return
      }
      case "busy": {
        busy = cmd.v === true
        reply({ ok: true, busy })
        return
      }
      case "ready": {
        ready = cmd.v === true
        reply({ ok: true, ready })
        return
      }
      case "failTake": {
        failTake = cmd.v === true
        reply({ ok: true, failTake })
        return
      }
      case "advance": {
        fakeNow += Number.isFinite(cmd.ms) ? cmd.ms : 0
        reply({ ok: true, now: fakeNow })
        return
      }
      case "tick": {
        lastTaken = []
        lines = []
        const entry = [...timers.entries()].at(-1)
        if (!entry) { reply({ ok: true, ran: false, armed: timers.size, turns, took: [], lines }); return }
        timers.delete(entry[0])
        entry[1]() // 真宿主同形：定时器回调 = `fire()`（闩在拍内自续）
        await settle()
        reply({ ok: true, ran: true, armed: timers.size, turns, took: lastTaken, lines })
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
        reply({ ok: true, sessionId: getSessionId(), turns, history: agent.history, lines })
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
