import { TIMER_MAX_PENDING, TIMER_MIN_EVERY_MS, nextFireAt } from "../agent/timers.mjs"
import { DESC } from "../tools/shared.mjs"

/**
 * timer tool: set a time budget for thinking before the agent insists on action.
 * 描述面 = `tool-docs/timer.md`（DESC() 加载；机制 = AGENT-LOOP-ASYNC-POOL.md §6.30.3 D-TW8 ∥ §6.30.18
 * 四式 ＋ `cancel`/`list`）。取时单点 = 时钟缝 `ctx.now ?? Date.now()`（§6.30.18——生产 `toolCtx`
 * （`agent/dispatch-run.mjs`）不携 `now` ⇒ 缺省回落 = 现行为零变；单元测试档以假 ctx 直驱）。
 */

/** `at` = 本地刻 `YYYY-MM-DDTHH:MM[:SS]`（严格正则＋日历回读校验——如 `2026-02-30` 拒）。 */
const AT_RE = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/
/** `daily` = 本地 `HH:MM`（与核 `DAILY_RE` 同形——工具面 = 唯一生产者，核守卫为防御面）。 */
const DAILY_RE = /^([01]\d|2[0-3]):([0-5]\d)$/

/** 默认 `message` 槽尾（逐式槽 = §6.30.18 默认表；一次性槽逐字零变）。 */
const DEFAULT_TAIL = ". Have you tried running the code, adding a console.log, or checking the output? Thinking more without data is guessing."

/** 本地刻 `YYYY-MM-DD HH:MM`（宿主本地时区——回执 ∥ 默认文案槽共用）。 */
function localText(ms) {
  const d = new Date(ms)
  const p = (n) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`
}

/** `at` 解算（宿主本地时区）：形不合 ∥ 日历回读不符（`2026-02-30` ∥ 时位越界等）⇒ `null`。 */
function atEpochMs(raw) {
  const m = AT_RE.exec(raw)
  if (m === null) return null
  const [y, mo, d, hh, mi, ss] = [Number(m[1]), Number(m[2]), Number(m[3]), Number(m[4]), Number(m[5]), Number(m[6] ?? 0)]
  const date = new Date(y, mo - 1, d, hh, mi, ss, 0)
  const back = date.getFullYear() === y && date.getMonth() === mo - 1 && date.getDate() === d
    && date.getHours() === hh && date.getMinutes() === mi && date.getSeconds() === ss
  return back ? date.getTime() : null
}

/** 时长形（§6.30.18）：`<mm:ss>`（< 1h）∥ `<h:mm:ss>`（≥ 1h——h 不补零；与 `/timers` 行同判）。 */
function durText(ms) {
  const sec = Math.max(0, Math.ceil(ms / 1000))
  const h = Math.floor(sec / 3600)
  const mm = String(Math.floor((sec % 3600) / 60)).padStart(2, "0")
  const ss = String(sec % 60).padStart(2, "0")
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`
}

/** kind（`list` 行——§6.30.18）：`every <N>s` ∕ `daily <HH:MM>` ∕ `at <刻>`（`at: true` 来源标记位——
 *  父侧裁定 2026-10-12）；余（一次性）⇒ `one-shot`。 */
function kindText(t) {
  const everyMs = t?.everyMs
  if (typeof everyMs === "number" && Number.isFinite(everyMs) && everyMs > 0) return `every ${everyMs / 1000}s`
  const daily = t?.daily
  if (typeof daily === "string" && DAILY_RE.test(daily)) return `daily ${daily}`
  if (t?.at === true && Number.isFinite(t.expiresAt)) return `at ${localText(t.expiresAt)}`
  return "one-shot"
}

/** `list` 行第三槽：到期未投 ⇒ `due now`；否则 `next <dur>`（剩余现算）。 */
function nextText(t, now) {
  const at = Number(t?.expiresAt)
  return Number.isFinite(at) && at > now ? `next ${durText(at - now)}` : "due now"
}

/** `message` 首行（`list` 行第四槽——逐字原样，不截断）。 */
function firstLine(message) {
  const text = String(message ?? "")
  const i = text.indexOf("\n")
  return i < 0 ? text : text.slice(0, i)
}

/** `cancel`（§6.30.18）：按 id 移除（`String` 宽松比对）；零匹配 ⇒ 显式抛错（文案含 `list` 指引）。 */
function cancelAction(agent, wanted) {
  const pending = agent?._pendingTimers ?? []
  const idx = pending.findIndex((t) => String(t?.id) === String(wanted))
  if (idx < 0) {
    throw new Error(`timer cancel: no pending timer with id ${String(wanted)} — use list: true to see pending timers`)
  }
  const [hit] = pending.splice(idx, 1)
  return `Timer cancelled (id ${String(hit.id)}).`
}

/** `list`（只读枚举——剩余现算；到期未投 ⇒ `due now` 态照出）。 */
function listAction(agent, now) {
  const pending = agent?._pendingTimers ?? []
  if (pending.length === 0) return "No pending timers."
  return pending.map((t) => `${String(t.id)} · ${kindText(t)} · ${nextText(t, now)} · ${firstLine(t.message)}`).join("\n")
}

export const timerTool = {
  name: "timer",
  description: DESC("timer"),
  parameters: {
    type: "object",
    properties: {
      seconds: {
        type: "number",
        description: "Thinking budget in seconds (default 180). Longer for complex reasoning, shorter for simple tasks.",
      },
      at: {
        type: "string",
        description: 'Fire once at a local clock time, e.g. "2026-10-13T09:00" (YYYY-MM-DDTHH:MM[:SS]). A time already past fires immediately.',
      },
      every: {
        type: "number",
        description: "Fixed interval in seconds (minimum 60): the first reminder comes N seconds after setting, then every N seconds until cancelled.",
      },
      daily: {
        type: "string",
        description: 'Local "HH:MM" — repeats every day at that time (a time already past today fires tomorrow), until cancelled.',
      },
      cancel: {
        type: "string",
        description: "Id of a pending timer to stop (from the set confirmation; see also list).",
      },
      list: {
        type: "boolean",
        description: "List pending timers with their next due time (read-only).",
      },
      message: {
        type: "string",
        description: "Custom reminder message to show when time is up. Default: a suggestion to add debug logs or run the code.",
      },
    },
    required: [],
  },
  readonly: true,
  sideEffectExempt: true,
  execute(args, ctx) {
    const now = ctx.now ?? Date.now() // 时钟缝单点（§6.30.18）：at 过时判定 ∥ every/daily 首投换算 ∥ id 撞号基准
    const agent = ctx.agent

    // 动作解析 + 互斥（至多一式；cancel ∥ list 与一切设置式互斥、与彼此互斥）——违例显式拒。
    const hasSeconds = args.seconds !== undefined && args.seconds !== null
    const hasAt = args.at !== undefined && args.at !== null
    const hasEvery = args.every !== undefined && args.every !== null
    const hasDaily = args.daily !== undefined && args.daily !== null
    const hasCancel = args.cancel !== undefined && args.cancel !== null
    const wantsList = args.list === true
    // `list` 键在场须恰为 `true`——否则显式拒（防 `{list:false}` 静默落缺省 180s：无义键触发真实副作用）。
    if (args.list !== undefined && args.list !== null && args.list !== true) {
      throw new Error(
        `timer: list accepts only true (got: ${String(args.list)}) — omit list to set a timer; pass { list: true } to list pending timers`,
      )
    }
    const forms = [hasSeconds && "seconds", hasAt && "at", hasEvery && "every", hasDaily && "daily"].filter((v) => v !== false)
    if (forms.length > 1 || (forms.length > 0 && (hasCancel || wantsList)) || (hasCancel && wantsList)) {
      const given = [...forms, hasCancel && "cancel", wantsList && "list"].filter((v) => v !== false).join(" / ")
      throw new Error(
        `timer: pass at most one action per call — got ${given}. Forms: { seconds } one-shot ∥ { at: "YYYY-MM-DDTHH:MM[:SS]" } absolute ∥ { every: <seconds ≥ 60> } interval ∥ { daily: "HH:MM" } daily ∥ { cancel: <id> } stop ∥ { list: true } list`,
      )
    }
    if (hasCancel) return cancelAction(agent, args.cancel)
    if (wantsList) return listAction(agent, now)

    // 逐式解算（校验逐条显式抛错——不静默钳制；拒点时在途表零变动）
    let form = "seconds"
    let expiresAt = null
    let message = null
    let everySec = null
    let everyMs = null
    let oneShotSec = null
    if (hasAt) {
      form = "at"
      const raw = args.at
      const ts = typeof raw === "string" ? atEpochMs(raw) : null
      if (ts === null) {
        throw new Error(`timer at must be a local clock time "YYYY-MM-DDTHH:MM[:SS]" (e.g. "2026-10-13T09:00"), got: ${String(raw)}`)
      }
      expiresAt = ts // 过时点 ⇒ 所给刻（delay ≤ 0 ⇒ 即时投递——AC-45① 口径；不重排）
      message = `⏰ Time's up (at ${localText(ts)})${DEFAULT_TAIL}`
    } else if (hasEvery) {
      form = "every"
      everySec = Number(args.every)
      if (!Number.isFinite(everySec) || everySec * 1000 < TIMER_MIN_EVERY_MS) {
        throw new Error(`timer every must be a number of seconds ≥ ${TIMER_MIN_EVERY_MS / 1000} (got: ${String(args.every)})`)
      }
      everyMs = everySec * 1000
      expiresAt = nextFireAt({ everyMs, expiresAt: now }, now) // 首投 = 设时 + N（非立即——防「设置即投」双投感）
      message = `⏰ Time's up (every ${everySec} seconds)${DEFAULT_TAIL}`
    } else if (hasDaily) {
      form = "daily"
      if (typeof args.daily !== "string" || !DAILY_RE.test(args.daily)) {
        throw new Error(`timer daily must be a local "HH:MM" time (24-hour, e.g. "09:00"), got: ${String(args.daily)}`)
      }
      expiresAt = nextFireAt({ daily: args.daily }, now) // 今日该刻未过 ⇒ 今日；已过 ⇒ 明日（非即时）
      message = `⏰ Time's up (daily at ${args.daily})${DEFAULT_TAIL}`
    } else {
      // D15.3#1：默认 180；非法值（非数字/非正数）显式报错——静默 NaN 定时器永不触发的坑
      const seconds = Number(args.seconds ?? 180)
      if (!Number.isFinite(seconds) || seconds <= 0) {
        throw new Error(`timer seconds must be a positive number, got: ${args.seconds}`)
      }
      expiresAt = now + seconds * 1000
      message = `⏰ Time's up (${seconds}s)${DEFAULT_TAIL}`
      oneShotSec = seconds
    }

    // §6.30.3 门三件②（D-TW6）：在途帽 8——超限显式拒（不静默丢 / 不静默清；形态先例 = 队满
    // 「拒 + 提示 + 保留」）。周期项同占坑（1 条 1 坑——§6.30.18 D-TW15；重排净零不触帽）。
    const pending = (agent._pendingTimers = agent._pendingTimers ?? [])
    if (pending.length >= TIMER_MAX_PENDING) {
      throw new Error(`timer: ${pending.length} timers already pending (max ${TIMER_MAX_PENDING}) — wait for one to fire before setting another`)
    }
    // id 唯一化（取消可寻址·§6.30.18）：基准读时钟缝单点，与在途撞号 ⇒ `+1` 递增至空闲（零新载体字段）。
    let id = now
    while (pending.some((t) => String(t?.id) === String(id))) id += 1
    const entry = { id, expiresAt, message: args.message || message }
    if (everyMs !== null) entry.everyMs = everyMs
    if (form === "daily") entry.daily = args.daily
    if (form === "at") entry.at = true // 来源标记位（非载重——时刻单源 = `expiresAt`；父侧裁定 2026-10-12）
    pending.push(entry)

    if (form === "at") {
      const when = localText(expiresAt)
      return expiresAt > now
        ? `Timer set (id ${id}) for ${when} local. Stop it with cancel id ${id}.`
        : `Timer set (id ${id}) for ${when} local — that time has passed, so the reminder appears immediately.`
    }
    if (form === "every") {
      return `Repeating timer set (id ${id}): first reminder in ${everySec} seconds, then every ${everySec} seconds. Stop it with cancel id ${id}.`
    }
    if (form === "daily") {
      return `Daily timer set (id ${id}): next reminder ${localText(expiresAt)} local, then every day at ${args.daily}. Stop it with cancel id ${id}.`
    }
    return `Timer set for ${oneShotSec} seconds. A reminder will appear when time is up.`
  },
}
