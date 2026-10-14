/**
 * agent/timers.mjs — timer 到期件（载体①：在途 timer 的单一权威读面）+ 空闲唤醒机制（闩 ∕ 派发 ∕ 火策略）。
 *
 * 机制单源 = `docs/core/design/AGENT-LOOP-ASYNC-POOL.md` §6.30.2（载体定形 D-TW1）：
 * 读面纯函数住本档——最近到期时点 / 到期出列（幂等 · 含周期重排）/ 历史注入单点 / 下一到期时点
 * （`nextFireAt`——§6.30.18）。消费面三处共用
 * 同一读点（零第二份过滤语义）：① 回合边界轮询（`agent/post-turn.mjs`——行为零变）；
 * ② 空闲闩 deadline；③ 挂起窗 deadline；显示面（状态行标记 / `/timers`）同读源。
 *
 * 载体仍在 agent 字段 `_pendingTimers`（条目形 `{ id, expiresAt, message }` ＋ 可选 `everyMs` ∥ `daily`——§6.30.18；
 * 绝对时刻条目另携 `at` 来源标记位（非载重——父侧裁定 2026-10-12）；一次性条目形逐字零变）；写点两处 = timer 工具 `thincoder-core/agent-tools/timer.mjs`
 * （设 ∕ 取消）＋ 本档 `takeExpiredTimers` 内**到点重排**（出列＋重排原子——§6.30.18 D-TW10）；
 * 跨 run 存活 = 规范语义（D-TW3，无 per-run 复位）。
 *
 * 空闲唤醒族（2026-09-28 流程批 R4 **上提核件** · 纯搬 + 转口 · 零语义改；上提源 = VSC
 * `thincoder-vscode/src/extension/timer-watch.mjs:46` ∕ `:73` ∕ `:94`——as-of 2026-09-28 R4 读数；两端现址（B3 收编后，实读 2026-09-29）=
 * VSC `:63`（闩 ∕ 装配）· `:29`（派发）· `:48`（火）∥ CLI `:41`（闩转口）· `:34`（派发转口）· `:57`（火））：`createTimerWatch` = 一次性最近截止闩
 * （起 ∕ 停 ∕ 重臂 ∕ `unref`）· `deliverExpiredTimers` = 到期批派发（出列幂等 ⇒ 注入单点 ⇒ 落流缝）·
 * `fireTimerWake` = 火策略（非空闲零动作 ∕ 零交付零开轮）。端面表壳留端（桌面键面 ∕ `ev:timer` 出词；
 * VSC ∕ CLI 自持副本已随 B3 迁移轮退场（2026-09-29——双写窗口收口），本档 = 单源）。
 */

/** 在途条数帽（§6.30.3 门三件②成本闸）：超限 ⇒ timer 工具**显式拒**（不静默丢 / 不静默清；
 *  形态先例 = 队满「拒 + 提示 + 保留」）。与 CLI 排队容量 `QUEUED_MAX_ITEMS`（8）同值同形。 */
export const TIMER_MAX_PENDING = 8

/** `every` 间隔下限（毫秒——§6.30.18 D-TW16）：工具面**硬拒**低于此值（不静默钳制）；
 *  核重排面不设界（防御 = 非有限正数 ⇒ `nextFireAt` 返 `null` 照消费——下限校验在工具面）。 */
export const TIMER_MIN_EVERY_MS = 60_000

/** 日历式 `HH:MM` 形判据（防御面——工具面为唯一生产者，两处同形）。 */
const DAILY_RE = /^(?:[01]\d|2[0-3]):[0-5]\d$/

/** 最近到期时点（毫秒）或 `null`（空在途）——端闩 / 挂起窗 deadline / 显示面共用同源（每帧活读）。 */
export function pendingTimerDeadline(agent) {
  const timers = agent?._pendingTimers ?? []
  let min = null
  for (const t of timers) {
    const at = t?.expiresAt
    if (typeof at !== "number" || !Number.isFinite(at)) continue
    if (min === null || at < min) min = at
  }
  return min
}

/** 下一到期时点（毫秒）或 `null`（无重排）——§6.30.18「载体扩展 ∥ 重排」单源：
 *  ① 固定间隔（`everyMs`）：基准 = `entry.expiresAt`（首设刻）；`k = max(1, floor((now − base) / everyMs) + 1)`；
 *     返 `base + k × everyMs`——**零漂移** ∥ 错过任意拍直落下一格（**跳过不补投**——一次出列对一条至多一投）；
 *  ② 日历式（`daily` = `HH:MM`）：宿主本地**严格 `> now`** 的下一 occurrence（今日该刻未过 ⇒ 今日，已过 ⇒
 *     明日；秒位归零——DST 按宿主日历规则走，不作特例）；
 *  ③ 一次性 ∥ 绝对时刻（无两字段）⇒ `null`；守卫：`everyMs` 非有限正数 ∥ 基准非有限 ∥ `daily` 形不合
 *     ⇒ `null`（照消费——防御面；下限校验在工具面）。
 *  首设换算同函数：`every` ⇒ `nextFireAt({ everyMs, expiresAt: now }, now)`（= 设时 + N）∥ `daily` ⇒
 *  `nextFireAt({ daily }, now)`；`at` ⇒ 直解算（不经本函数）。 */
export function nextFireAt(entry, now) {
  const everyMs = entry?.everyMs
  if (everyMs !== undefined && everyMs !== null) {
    const base = entry.expiresAt
    if (typeof everyMs !== "number" || !Number.isFinite(everyMs) || everyMs <= 0) return null
    if (typeof base !== "number" || !Number.isFinite(base)) return null
    const k = Math.max(1, Math.floor((now - base) / everyMs) + 1)
    return base + k * everyMs
  }
  const daily = entry?.daily
  if (daily !== undefined && daily !== null) {
    if (typeof daily !== "string" || !DAILY_RE.test(daily)) return null
    const [hh, mm] = daily.split(":").map(Number)
    const at = new Date(now)
    at.setHours(hh, mm, 0, 0) // 秒位归零（该刻整分投递）
    if (at.getTime() <= now) {
      at.setDate(at.getDate() + 1) // 已过 ⇒ 明日（跨日 = `Date` 日历运算承载——零特例代码）
      at.setHours(hh, mm, 0, 0) // 跨日归一后再归零（DST 走宿主日历规则）
    }
    return at.getTime()
  }
  return null
}

/** 到期出列（**幂等**）：取走 `expiresAt <= now` 的条目并返回（在途表内移除）——二次调用零返
 *  （§6.30.3 成本闸②「到期即消费」——绝不重复投递）。未到期项原序保留。
 *  携 `everyMs`/`daily` 的到期项**同 id 克隆回插**（新 `expiresAt = nextFireAt(t, now)`，严格 `> now`——
 *  §6.30.18 重排：出列＋重排原子 ∥ 净零不触帽；重排先于交付 ⇒「到点即重排」与「交付幂等」互不依赖）；
 *  一次性 ∥ 绝对时刻照旧被消费（无重排）。 */
export function takeExpiredTimers(agent, now = Date.now()) {
  const timers = agent?._pendingTimers ?? []
  const expired = timers.filter((t) => t.expiresAt <= now)
  if (expired.length === 0) return []
  const rest = timers.filter((t) => t.expiresAt > now)
  for (const t of expired) {
    const next = nextFireAt(t, now)
    if (next !== null) rest.push({ ...t, expiresAt: next })
  }
  agent._pendingTimers = rest
  return expired
}

/** 历史注入单点（逐字形态 = 既有注入单源）：逐条 `[System reminder: ⏰ timer — <message>]` 落历史，
 *  返回注入的原文（显示面复用同一串——零第二份字面）。 */
export function injectTimerReminders(agent, entries) {
  const lines = []
  for (const t of entries ?? []) {
    const line = `[System reminder: ⏰ timer — ${t.message}]`
    agent.history.push({ role: "user", content: line })
    lines.push(line)
  }
  return lines
}

/** 开关判据（§6.30.3 门三件③ D-TW5 · 上提源 = VSC `timer-watch.mjs:33`——as-of 2026-09-28 R4 读数，B3 收编后该端副本退场）
 *  （现转口 = CLI `timer-watch.mjs:18`）：默认开——只有显式 `false` 才关
 *  （键 `agent.timerWake`；与 CLI 同口径 `!== false`）。关 ⇒ 闩零注册 ⇒ 回仅回合边界投递（既有语义）。 */
export function timerWakeEnabled(agent) {
  return agent?.config?.agent?.timerWake !== false
}

/** 到期批派发（**两路共用**：空闲闩 fire ∥ 挂起窗 `timerFace.deliver` · 上提源 = VSC `timer-watch.mjs:73`
 *  核心体——as-of 2026-09-28 R4 读数；现址 = VSC `:29` · CLI `:34`）：出列（幂等——绝不重复投递）→ 注入单点 → 逐条落流缝（`onLine`——端侧 `ev:timer` ∕ webview ∕
 *  TUI 行）。返回交付原文（核注入单源逐字；零到期 ∕ 无载体 ⇒ 空数组——在途不动 = 零静默丢）。
 *  `now` = 时点值（默认现刻；与 `takeExpiredTimers` 同形——调用方传钟、本档取时点）。 */
export function deliverExpiredTimers(agent, { now = Date.now(), onLine = null } = {}) {
  const lines = injectTimerReminders(agent, takeExpiredTimers(agent, now))
  for (const line of lines) onLine?.(line)
  return lines
}

/** 一次性最近截止闩（单槽 · 上提源 = VSC `timer-watch.mjs:46` 逐字——as-of 2026-09-28 R4 读数；现址 = VSC `:63`（闩 ∕ 装配）· CLI `:41`（闩转口））：`sync()` = 按当前在途最近到期时点
 *  （重）武装——无在途 ∕ 开关关 ∕ 无载体 ⇒ 撤旧零注册；`disarm()` = 撤闩清点。到点自撤 · `unref()`（尽力面）。
 *  `getAgent` / `onFire` 缺省宽容沿用源（未接线 = 惰性零注册）；`timer` ∕ `clear` ∕ `now` = 注入缝（默认平台全局）。
 *  @returns {{ sync: Function, disarm: Function }}——`sync()` ⇒ 武装延迟（毫秒）或 `null`（未武装） */
export function createTimerWatch({ getAgent, onFire, timer = setTimeout, clear = clearTimeout, now = Date.now } = {}) {
  let handle = null
  const disarm = () => {
    const h = handle
    handle = null
    if (h !== null) { try { clear(h) } catch { /* 已触发 / 不可清——尽力面 */ } }
  }
  const sync = () => {
    const agent = getAgent?.()
    const deadline = timerWakeEnabled(agent) ? pendingTimerDeadline(agent) : null
    if (deadline == null) { disarm(); return null } // 无在途 / 开关关 / 无载体——撤旧，零注册
    disarm() // 单槽：重复武装 = 撤旧立新（延迟按最近到期重算）
    const delay = Math.max(0, deadline - now())
    handle = timer(() => { handle = null; onFire?.() }, delay)
    try { handle?.unref?.() } catch { /* unref 失败不阻断（一次性闩自然退出） */ }
    return delay
  }
  return { sync, disarm }
}

/** 空闲唤醒火策略（上提源 = VSC `timer-watch.mjs:94`——as-of 2026-09-28 R4 读数；现址 = VSC `:48` · CLI `:57`；桌面同形）：
 *  **非空闲零动作**——回合在飞 ∕ 挂起窗
 *  由各自既有路径接管，在途表零触碰（链尾重同步再武装）；空闲 ⇒ 派发；交付真 ⇒ 开 timer 轮（开轮面 =
 *  `openTurn` 缝，承担 `{ autoTurn: true, timerTurn: true }` 语义）。`deliver` 契约 = 同步 · 严格布尔
 *  （判定 `=== true`——同 §6.30.10 `timerFace.deliver`）；缝缺 ⇒ 抛（fail-loud——未接线不得静默零开轮）。
 *  `busy` = 非空闲判据（宿主现算：在飞回合 ∕ 窗内 ⇒ true）；返回是否开轮。 */
export async function fireTimerWake({ busy = false, deliver, openTurn } = {}) {
  if (typeof deliver !== "function" || typeof openTurn !== "function") {
    throw new Error("[timers] fireTimerWake requires deliver/openTurn seams (unwired seams must not pass silently)")
  }
  if (busy) return false
  if (deliver() !== true) return false
  await openTurn()
  return true
}
