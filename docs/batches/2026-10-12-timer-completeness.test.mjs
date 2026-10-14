/**
 * 2026-10-12-timer-completeness.test.mjs — 批内件（timer 能力完备化批 · 台账 #1321 · 实施轮 ·
 * 用例 T-TW40–T-TW49）。
 * 名随批次档 · 不进仓套件；跑法（仓根 `thincoder/`）：
 *   node --test docs/batches/2026-10-12-timer-completeness.test.mjs
 * 用例面 = `docs/core/design/AGENT-LOOP-ASYNC-POOL.md` §6.30.18 用例表：
 *   T-TW40/41 = 绝对时刻（未来 ∥ 已过即时）；T-TW42 = 固定间隔（AC-45 实走形：两投后取消）；
 *   T-TW43 = 错过跳拍；T-TW44 = 日历式（含跨日 ∥ 过刻）；T-TW45 = 一次性零变回归；
 *   T-TW46 = 校验矩阵（含核守卫防御面）；T-TW47 = 帽（占坑）；T-TW48 = 重启即失；
 *   T-TW49 = 可见面（模型 `list` ∥ CLI `/timers` handler 直驱）。
 * **T-TW50（服务面审计主语 `subjectOf`）不在本件**——靶 = `thincoder-server/src/agent/chat-env-tools.mjs`
 * （本实施轮显式排除：同片串行，排兄弟批 server-wake-face 后随其落地；见批档 §5「本未做」）。
 * 时钟缝 = 工具面 `ctx.now`（缺省 `Date.now()` 回落——生产零变）∥ `takeExpiredTimers` / `nextFireAt` 的
 * `now` 参数沿既有缝；**恒假钟 ∥ 直驱 · 零真实等待**（仅 `/timers` handler 一臂读墙钟——断言取整秒倍数，
 * 亚秒漂移不碍）。回归腿 = `docs/batches/2026-10-01-timer-wake-delivery.test.mjs`（另一跑，本件不复跑）。
 */
import test from "node:test"
import assert from "node:assert/strict"
import { existsSync } from "node:fs"
import { join, resolve } from "node:path"
import { pathToFileURL } from "node:url"

const ROOT = process.cwd()
if (!existsSync(join(ROOT, "thincoder-core"))) throw new Error(`须从仓库根（thincoder/）运行——cwd = ${ROOT}`)
const mod = (rel) => import(pathToFileURL(resolve(ROOT, rel)).href)

const { timerTool } = await mod("thincoder-core/agent-tools/timer.mjs")
const { takeExpiredTimers, injectTimerReminders, pendingTimerDeadline, nextFireAt, TIMER_MIN_EVERY_MS } = await mod("thincoder-core/agent/timers.mjs")
const { handleTimersCommand } = await mod("thincoder-cli/src/tui/cmd-timers.mjs")

/** 宿主本地刻（`at`/`daily` 皆本地语义；月 1 起——`new Date(y, mo - 1, …)`）。 */
const L = (y, mo, d, h = 0, mi = 0, s = 0) => new Date(y, mo - 1, d, h, mi, s, 0).getTime()
/** 默认 `message` 槽（§6.30.18 默认表——槽尾逐字）。 */
const DEF = (slot) => `⏰ Time's up (${slot}). Have you tried running the code, adding a console.log, or checking the output? Thinking more without data is guessing.`
/** 本地 `YYYY-MM-DD HH:MM`（显示断言用——与实现同形）。 */
const stamp = (ms) => {
  const d = new Date(ms)
  const p = (n) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`
}
/** 代理夹具（核唯一读面 = `_pendingTimers`；`cwd` = 重启臂复装语义用）。 */
const makeAgent = (cwd = "C:/proj") => ({ cwd, history: [], _pendingTimers: [] })
const ctxOf = (agent, now) => ({ agent, now })

/* ── T-TW40：绝对时刻（未来） ── */
test("T-TW40 · 正常·绝对时刻（未来）：expiresAt = 解析刻 ∥ 到点出列恰一条 ∥ 在途清空（不重排）∥ 缺省 message = at 形", () => {
  const S = L(2026, 10, 12, 8, 0)
  const agent = makeAgent()
  const out = timerTool.execute({ at: "2026-10-12T10:00" }, ctxOf(agent, S))
  assert.equal(out, `Timer set (id ${S}) for 2026-10-12 10:00 local. Stop it with cancel id ${S}.`)
  assert.deepEqual(
    agent._pendingTimers,
    [{ id: S, expiresAt: L(2026, 10, 12, 10, 0), message: DEF("at 2026-10-12 10:00"), at: true }],
    "条目 = {id, expiresAt, message} ＋ at 来源标记位",
  )
  const due = takeExpiredTimers(agent, L(2026, 10, 12, 10, 0))
  assert.equal(due.length, 1, "到点出列恰一条")
  assert.equal(agent._pendingTimers.length, 0, "在途清空（不重排）")
  assert.equal(takeExpiredTimers(agent, L(2026, 10, 12, 10, 1)).length, 0, "出列幂等")
})

/* ── T-TW41：绝对时刻（已过） ── */
test("T-TW41 · 正常·绝对时刻（已过）：expiresAt = 所给刻（delay ≤ 0）∥ 首取即交付 ∥ 在途清空 ∥ 缺省 message = at 形", () => {
  const S = L(2026, 10, 12, 9, 30)
  const agent = makeAgent()
  const out = timerTool.execute({ at: "2026-10-12T09:20" }, ctxOf(agent, S))
  assert.equal(out, `Timer set (id ${S}) for 2026-10-12 09:20 local — that time has passed, so the reminder appears immediately.`)
  assert.equal(agent._pendingTimers[0].expiresAt, L(2026, 10, 12, 9, 20), "expiresAt = 所给刻（即时投递口径）")
  assert.equal(agent._pendingTimers[0].message, DEF("at 2026-10-12 09:20"))
  assert.equal(takeExpiredTimers(agent, S).length, 1, "首取即交付")
  assert.equal(agent._pendingTimers.length, 0)
})

/* ── T-TW42：固定间隔（AC-45 实走形） ── */
test("T-TW42 · 正常·固定间隔（AC 实走形）：首投 = 设时 + 60s ∥ 同 id 续投 ∥ 两投后 cancel ⇒ 零再投", () => {
  const S = L(2026, 10, 12, 15, 0)
  const agent = makeAgent()
  const out = timerTool.execute({ every: 60, message: "x" }, ctxOf(agent, S))
  assert.equal(out, `Repeating timer set (id ${S}): first reminder in 60 seconds, then every 60 seconds. Stop it with cancel id ${S}.`)
  assert.deepEqual(agent._pendingTimers, [{ id: S, expiresAt: S + 60_000, message: "x", everyMs: 60_000 }], "首投 = 设时 + 60s（ctx.now 假钟——精确断言）")
  assert.equal(takeExpiredTimers(agent, S + 60_000).length, 1, "一投")
  assert.equal(agent._pendingTimers.length, 1, "出列后条目仍在（同 id 重排）")
  assert.equal(agent._pendingTimers[0].id, S, "同 id")
  assert.equal(agent._pendingTimers[0].expiresAt, S + 120_000, "重排 = 设时 + 120s")
  assert.equal(takeExpiredTimers(agent, S + 120_000).length, 1, "二投")
  assert.equal(agent._pendingTimers[0].expiresAt, S + 180_000)
  assert.equal(timerTool.execute({ cancel: String(S) }, ctxOf(agent, S + 120_001)), `Timer cancelled (id ${S}).`, "cancel（String 宽松比对）")
  assert.equal(agent._pendingTimers.length, 0, "cancel 释放坑")
  assert.equal(takeExpiredTimers(agent, S + 180_000).length, 0, "取消后出列零返（零再投）")
})

/* ── T-TW43：错过跳拍 ── */
test("T-TW43 · 边界·错过跳拍：出列恰一投 ∥ 重排 = base + 4 × everyMs（严格 > now）∥ 零补投 ∥ 缺省 message = every 形", () => {
  const S = L(2026, 10, 12, 8, 0)
  const agent = makeAgent()
  timerTool.execute({ every: 600 }, ctxOf(agent, S))
  assert.equal(agent._pendingTimers[0].message, DEF("every 600 seconds"))
  assert.equal(agent._pendingTimers[0].expiresAt, S + 600_000)
  const now = S + 3.5 * 600_000 // 假钟跳 3.5 拍（自首设刻）
  const due = takeExpiredTimers(agent, now)
  assert.equal(due.length, 1, "出列恰一投（错过拍跳过不补投）")
  const rest = agent._pendingTimers[0]
  assert.equal(rest.expiresAt, S + 4 * 600_000, "重排 = base + 4 × everyMs")
  assert.ok(rest.expiresAt > now, "严格 > now")
  assert.equal(takeExpiredTimers(agent, now).length, 0, "同刻二次出列零返")
})

/* ── T-TW44：日历式（含跨日 ∥ 过刻） ── */
test("T-TW44 · 正常·日历式：今日 09:00 ∕ 明日 09:00 ∕ 明日 00:01（跨日）∥ 投后重排 = 次日同刻 ∥ 缺省 message = daily 形", () => {
  // ① 08:59 设 09:00 ⇒ 今日 09:00 ＋ 投后重排 = 次日同刻
  const a1 = makeAgent()
  const s1 = L(2026, 10, 12, 8, 59)
  const out1 = timerTool.execute({ daily: "09:00" }, ctxOf(a1, s1))
  assert.equal(out1, `Daily timer set (id ${s1}): next reminder 2026-10-12 09:00 local, then every day at 09:00. Stop it with cancel id ${s1}.`)
  assert.deepEqual(a1._pendingTimers, [{ id: s1, expiresAt: L(2026, 10, 12, 9, 0), message: DEF("daily at 09:00"), daily: "09:00" }])
  assert.equal(takeExpiredTimers(a1, L(2026, 10, 12, 9, 0)).length, 1, "今日该刻投递")
  assert.equal(a1._pendingTimers[0].expiresAt, L(2026, 10, 13, 9, 0), "投后重排 = 次日同刻")
  assert.equal(a1._pendingTimers[0].daily, "09:00", "重排保留日历字段")
  // ② 09:01 设 09:00 ⇒ 明日 09:00（过刻）
  const a2 = makeAgent()
  timerTool.execute({ daily: "09:00" }, ctxOf(a2, L(2026, 10, 12, 9, 1)))
  assert.equal(a2._pendingTimers[0].expiresAt, L(2026, 10, 13, 9, 0), "过刻 ⇒ 明日（非即时）")
  // ③ 23:59 设 00:01 ⇒ 明日 00:01（跨日 = Date 日历运算承载）
  const a3 = makeAgent()
  timerTool.execute({ daily: "00:01" }, ctxOf(a3, L(2026, 10, 12, 23, 59)))
  assert.equal(a3._pendingTimers[0].expiresAt, L(2026, 10, 13, 0, 1))
})

/* ── T-TW45：一次性零变回归 ── */
test("T-TW45 · 回归·一次性零变：条目形 {id, expiresAt, message} 逐字 ∥ 返回文案逐字 ∥ 交付行逐字 ∥ 出列幂等", () => {
  const S = L(2026, 10, 12, 8, 0)
  const agent = makeAgent()
  const out = timerTool.execute({ seconds: 5, message: "旧" }, ctxOf(agent, S))
  assert.equal(out, "Timer set for 5 seconds. A reminder will appear when time is up.", "返回文案逐字零变（不携 id）")
  assert.deepEqual(agent._pendingTimers, [{ id: S, expiresAt: S + 5_000, message: "旧" }], "条目形逐字零变（零新字段）")
  const due = takeExpiredTimers(agent, S + 5_000)
  assert.deepEqual(injectTimerReminders(agent, due), ["[System reminder: ⏰ timer — 旧]"], "交付行逐字")
  assert.deepEqual(agent.history, [{ role: "user", content: "[System reminder: ⏰ timer — 旧]" }])
  assert.equal(agent._pendingTimers.length, 0, "出列 ⇒ 在途清空（无重排）")
  assert.equal(takeExpiredTimers(agent, S + 9_999).length, 0, "出列幂等")
  // 缺省文案 ∥ 缺省 180s（不传 message/seconds）
  const a2 = makeAgent()
  timerTool.execute({}, ctxOf(a2, S))
  assert.equal(a2._pendingTimers[0].message, DEF("180s"))
  assert.equal(a2._pendingTimers[0].expiresAt, S + 180_000)
})

/* ── T-TW46：校验矩阵（含核守卫防御面） ── */
test("T-TW46 · 错误·校验矩阵：互斥违例 ∥ 逐条显式抛错 ∥ 在途表零变动 ∥ 核守卫防御面", () => {
  const S = L(2026, 10, 12, 8, 0)
  assert.equal(TIMER_MIN_EVERY_MS, 60_000, "下限常量（D-TW16）")
  const cases = [
    [{ seconds: 60, every: 60 }, /at most one action/],
    [{ at: "2026-10-12T10:00", daily: "09:00" }, /at most one action/],
    [{ every: 60, cancel: 1 }, /at most one action/],
    [{ list: true, seconds: 60 }, /at most one action/],
    [{ cancel: 1, list: true }, /at most one action/],
    [{ every: 30 }, /≥ 60/],
    [{ every: 59.999 }, /≥ 60/],
    [{ every: 0 }, /≥ 60/],
    [{ every: "abc" }, /≥ 60/],
    [{ at: "2026-02-30T10:00" }, /at must be a local clock time/],
    [{ at: "2026-10-12 10:00" }, /at must be a local clock time/],
    [{ at: "2026-10-12T25:00" }, /at must be a local clock time/],
    [{ at: 123 }, /at must be a local clock time/],
    [{ daily: "9:00" }, /daily must be a local "HH:MM"/],
    [{ daily: "24:00" }, /daily must be a local "HH:MM"/],
    [{ daily: "09:60" }, /daily must be a local "HH:MM"/],
    [{ seconds: 0 }, /seconds must be a positive number/],
    [{ seconds: "x" }, /seconds must be a positive number/],
    [{ cancel: "nope" }, /no pending timer with id nope/],
  ]
  for (const [args, re] of cases) {
    const agent = makeAgent()
    assert.throws(() => timerTool.execute(args, ctxOf(agent, S)), re, JSON.stringify(args))
    assert.equal(agent._pendingTimers.length, 0, `在途表零变动：${JSON.stringify(args)}`)
  }
  // 合法式枚举在场（互斥文案列合法式——§6.30.18 校验条）
  assert.throws(() => timerTool.execute({ seconds: 60, list: true }, ctxOf(makeAgent(), S)), /Forms: \{ seconds \}/)
  // 核守卫（防御面——照消费，不重排）
  assert.equal(nextFireAt({ id: 1, expiresAt: S, message: "x" }, S), null, "一次性 ∥ 绝对时刻 ⇒ null")
  assert.equal(nextFireAt({ everyMs: 0 }, S), null, "everyMs 非正 ⇒ null")
  assert.equal(nextFireAt({ everyMs: "60" }, S), null, "everyMs 非数 ⇒ null")
  assert.equal(nextFireAt({ daily: "9:00" }, S), null, "daily 形不合 ⇒ null")
})

/* ── T-TW47：帽（占坑） ── */
test("T-TW47 · 边界·帽（占坑）：在途 8（含周期 1）⇒ 第 9 拒 ∥ 拒点零变动 ∥ 重排净零 ∥ cancel 释放坑", () => {
  const S = L(2026, 10, 12, 8, 0)
  const agent = makeAgent()
  for (let i = 0; i < 7; i++) timerTool.execute({ seconds: 600 + i }, ctxOf(agent, S))
  const setOut = timerTool.execute({ every: 60 }, ctxOf(agent, S))
  assert.ok(setOut.startsWith("Repeating timer set (id "), setOut)
  assert.equal(agent._pendingTimers.length, 8, "周期项同占坑（1 条 1 坑）")
  assert.equal(new Set(agent._pendingTimers.map((t) => String(t.id))).size, 8, "同毫秒八设 ⇒ id 撞号 +1 递增（唯一）")
  assert.throws(() => timerTool.execute({ seconds: 5 }, ctxOf(agent, S)), /max 8/, "第 9 条 ⇒ 显式拒")
  assert.equal(agent._pendingTimers.length, 8, "拒点零变动")
  const period = agent._pendingTimers.find((t) => t.everyMs)
  assert.equal(takeExpiredTimers(agent, period.expiresAt).length, 1, "周期到点一投")
  assert.equal(agent._pendingTimers.length, 8, "重排净零（回插不触帽）")
  assert.equal(agent._pendingTimers.filter((t) => t.everyMs).length, 1, "同 id 回插（1 条 1 坑）")
  assert.equal(timerTool.execute({ cancel: String(period.id) }, ctxOf(agent, S + 70_000)), `Timer cancelled (id ${period.id}).`)
  assert.equal(agent._pendingTimers.length, 7, "cancel 释放坑")
  assert.equal(
    timerTool.execute({ seconds: 5 }, ctxOf(agent, S + 70_000)),
    "Timer set for 5 seconds. A reminder will appear when time is up.",
    "复设成功",
  )
  assert.equal(agent._pendingTimers.length, 8)
})

/* ── T-TW48：重启即失 ── */
test("T-TW48 · 边界·重启即失：同 cwd 二次装配（新 agent 对象）⇒ 在途表空（进程内语义——与一次性同命）", () => {
  const S = L(2026, 10, 12, 8, 0)
  const a1 = makeAgent("C:/proj")
  timerTool.execute({ every: 60 }, ctxOf(a1, S))
  assert.equal(a1._pendingTimers.length, 1, "进程内载体（本次装配在途 1）")
  const a2 = makeAgent("C:/proj") // 同 cwd 二次装配（新 agent 对象）
  assert.deepEqual(a2._pendingTimers, [], "在途表空（零持久化——周期项随进程消失）")
  assert.equal(pendingTimerDeadline(a2), null, "零在途 ⇒ 零 deadline（零唤醒闩）")
  assert.equal(takeExpiredTimers(a2, S + 10 ** 9).length, 0)
  assert.equal(pendingTimerDeadline(a1), S + 60_000, "首次装配不受影响（进程内各自载体）")
})

/* ── T-TW49：可见面（模型 `list` ∥ CLI `/timers`） ── */
test("T-TW49 · 正常·可见面：模型 list（三类 ＋ 到期未投 · 长时长 ⇒ <h:mm:ss>）∥ /timers kind 段 ＋ 一次性行逐字零变", async () => {
  const S = L(2026, 10, 12, 8, 0)
  const agent = makeAgent()
  timerTool.execute({ at: "2026-10-12T12:00", message: "at-msg" }, ctxOf(agent, S)) // 4h ⇒ 长时长臂
  timerTool.execute({ every: 90, message: "ev-msg" }, ctxOf(agent, S)) // 非整分
  timerTool.execute({ daily: "09:00", message: "d-msg\n第二行" }, ctxOf(agent, S)) // 1h ⇒ 长时长臂
  timerTool.execute({ at: "2026-10-12T07:00", message: "due-msg" }, ctxOf(agent, S)) // 已过 ⇒ 到期未投
  const [t0, t1, t2, t3] = agent._pendingTimers
  const rows = timerTool.execute({ list: true }, ctxOf(agent, S)).split("\n")
  assert.equal(rows.length, 4, "四条在途 ⇒ 四行")
  assert.equal(rows[0], `${t0.id} · at 2026-10-12 12:00 · next 4:00:00 · at-msg`, "at 类 ⇒ at <刻>；长时长 ⇒ <h:mm:ss>")
  assert.equal(rows[1], `${t1.id} · every 90s · next 01:30 · ev-msg`)
  assert.equal(rows[2], `${t2.id} · daily 09:00 · next 1:00:00 · d-msg`, "message 首行（多行 ⇒ 首行）")
  assert.equal(rows[3], `${t3.id} · at 2026-10-12 07:00 · due now · due-msg`, "到期未投 ⇒ due now 照出")
  assert.equal(agent._pendingTimers.length, 4, "list 只读（在途表零变动）")
  assert.equal(timerTool.execute({ list: true }, ctxOf(makeAgent(), S)), "No pending timers.")

  // ── CLI `/timers` handler 直驱（墙钟——断言取整秒倍数，亚秒漂移不碍） ──
  const wall = Date.now()
  const cliAgent = {
    _pendingTimers: [
      { id: 1, expiresAt: wall + 30 * 60_000, message: "one-shot-msg" }, // 一次性（三标识皆不在场）
      { id: 2, expiresAt: wall + 90_000, message: "ev", everyMs: 90_000 }, // 非整分 ⇒ 秒形
      { id: 3, expiresAt: wall + 26 * 3600_000, message: "at", at: true }, // 于 <...> ＋ 长时长
      { id: 4, expiresAt: wall + 2 * 60_000, message: "d", daily: "09:00" }, // 每天
    ],
  }
  const lines = []
  await handleTimersCommand({ agent: cliAgent, pushLine: (text) => lines.push(text) })
  assert.equal(lines.length, 4)
  assert.equal(lines[0], "⏰1 · 剩余 30:00 · one-shot-msg", "一次性行逐字零变（零 kind 段）")
  assert.equal(lines[1], "⏰2 · 每 90s · 剩余 01:30 · ev", "非整分 ⇒ 每 <N>s")
  assert.equal(lines[2], `⏰3 · 于 ${stamp(cliAgent._pendingTimers[2].expiresAt)} · 剩余 26:00:00 · at`, "at 类 ⇒ 于 <YYYY-MM-DD HH:MM>")
  assert.equal(lines[3], "⏰4 · 每天 09:00 · 剩余 02:00 · d")
  const empty = []
  await handleTimersCommand({ agent: makeAgent(), pushLine: (text) => empty.push(text) })
  assert.deepEqual(empty, ["无在途 timer"], "零在途 ⇒ 空态行零变")
})
