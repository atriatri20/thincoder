/**
 * agent/turn-projection.mjs — 跨轮机读历史投影（设计 = `docs/core/design/CONTEXT-COMPACTION.md` §1.1 ∥
 * `docs/core/design/SESSION.md` §2；批次 = `docs/batches/2026-11-13-turn-history-projection.md`；台账 #2395）。
 *
 * 一轮完成后的机读形态 = 三条消息：用户请求 ∥ 最终回复 ∥ 任务状态。该轮的工具过程
 * （assistant tool_calls 与其 tool 结果）只在**本轮**内存线里原样保留（本轮内第二次请求照旧看得到），
 * 跨轮不再装入。人读线（`_fullHistory` ∥ 记录 sidecar）不动，`read_history` 仍可取回原始工具结果。
 *
 * 三面同尺（这是本档存在的理由——**同一把尺**），账本与事实单列在 `turn-task-state.mjs`：
 *  - 折叠 `turnFoldPlan` ∥ `applyTurnFold` ∥ `registerFoldMarks`：按消息身份定位本轮原始段，替换为三条消息
 *    ——`beginRun`（下一轮起点）就地折叠并登记折叠身份（压缩按那张账判覆盖条数）；
 *  - 投影 `buildTurnRecord` ∥ `turnRecordMessages` ∥ `projectTurns`：一轮 → 三条消息的成形（三面共用）；
 *  - 恢复 `restoreMachineFromTurns` ∥ `machineLineForSlot`：槽带 `turns` 时按同一段拼法重建机读线——
 *    前者是读向（先做配对收口），后者是 `saveSession` 的写向（不改内存线的数组与对象）。
 * 装配接缝 `registerCompletedTurn` ∥ `applyTurnProjection`：轮边界上取用并清空账本、把待折段就地折掉。
 *
 * 为什么账本与事实搬到 `turn-task-state.mjs`：四块同住一档时内容行越过 500 的档位线（标准
 * `docs/core/standards/CODE-TIER.md` §3），而「一轮 → 三条消息」的投影判据只该有一处——拆档只动文件归属，
 * 不动判据；搬走的符号在本档原路径 re-export，调用方零改。
 *
 * 机读线在槽里分三段存（`SESSION.md` §2）：`compactCheckpoint`（摘要注记 + 已覆盖的轮记录条数）∥ `turns` ∥
 * `activeRaw`（没有轮记录可依的在途 ∥ 异常段）。保存与恢复两个方向是同一段拼法（`machineLineForSlot` ∥
 * `restoreMachineFromTurns`）；覆盖条数按折叠身份账算（`coveredTurnCount`），折叠与压缩都按它判「这一轮是不是已在中段」。
 *
 * 纪律：除轮边界上的账本交接（`registerCompletedTurn` 取用调用方给的账本对象、随后清空账本槽）外，
 * 本档纯函数面零 IO、零抛、零全局态；不改写传入的消息对象（`pushReal` 的双线共享对象只读不写——折叠产出新对象）。
 */

// 账本 ∥ 事实 ∥ 状态串 ∥ 成败取形住在 `turn-task-state.mjs`（拆档理由见该档头注）；搬走的符号在下方原路径
// re-export——拆档不动调用方，六处 import 一字不改。本档从它取 `str` ∥ `capText` 与两条状态面函数。
import { buildTurnTaskState, capText, str, taskStateText } from "./turn-task-state.mjs"
export { TASK_STATE_MARK, buildTurnTaskState, createTurnLedger, noteTurnRunError, noteTurnToolFacts, taskStateText } from "./turn-task-state.mjs"
// 可回查位置（`evidence` 面）：会话事件日志按天分档——路径取自核日志单源，本档不自造路径。
// 折叠 no-op 的留痕（CONTEXT-COMPACTION.md §1.1）走同一通道。
import { logEvent, todayLogPath } from "../log.mjs"

// ────────────────────────────── 轮记录与投影 ──────────────────────────────

/** 轮记录成形（`{ userRequest, finalResponse, taskState }`——槽 `turns` 逐项形）。 */
export function buildTurnRecord(ledger, facts = {}) {
  const finalResponse = capText(facts.finalResponse) || null
  return {
    userRequest: ledger?.userRequest ?? null,
    finalResponse,
    taskState: buildTurnTaskState(ledger, facts),
  }
}

/** 一条轮记录的机读消息（用户请求 ∥ 最终回复 ∥ 任务状态——顺序即线上顺序）。 */
export function turnRecordMessages(record) {
  const out = []
  if (str(record?.userRequest)) out.push({ role: "user", content: record.userRequest })
  if (str(record?.finalResponse)) out.push({ role: "assistant", content: record.finalResponse })
  const state = taskStateText(record?.taskState)
  // 任务状态是机器面（人读线已保留原始过程）——`transient` 只影响人读线落盘，发送前被剥离。
  if (state) out.push({ role: "user", content: state, transient: true })
  return out
}

/** 多条轮记录 → 机读消息数组（恢复面按同一投影重建机读线）。 */
export function projectTurns(turns) {
  const out = []
  for (const record of Array.isArray(turns) ? turns : []) out.push(...turnRecordMessages(record))
  return out
}

/**
 * 折叠计划（纯函数）：按**消息身份**找出待折叠轮的原始段，返回 `{ indices, at, folded }`；
 * 无可折叠（消息已被压缩摘要吞掉 / 不是本轮那批对象）⇒ `null`——宁可不折，也不切错位置。
 * 身份判据使本函数对压缩（重建数组）、蒸馏（换新数组）、`repairHistory`（过滤）都稳。
 */
export function turnFoldPlan(history, pending) {
  const msgs = pending?.msgs
  if (!(msgs instanceof Set) || msgs.size === 0) return null
  if (!Array.isArray(history) || history.length === 0) return null
  const indices = []
  for (let i = 0; i < history.length; i++) if (msgs.has(history[i])) indices.push(i)
  if (indices.length === 0) return null
  const folded = turnRecordMessages(pending.record)
  if (folded.length === 0) return null
  return { indices, at: indices[0], folded, record: pending.record }
}

/** 就地折叠（`beginRun` 用）：数组身份不变——持有 `agent.history` 引用的端侧（VSC 保存面）不落空。
 *  `agent` 在场时顺带登记折叠身份（`registerFoldMarks`）——压缩按那张账判覆盖条数。 */
export function applyTurnFold(history, plan, agent = null) {
  if (!plan || !Array.isArray(history)) return history
  for (let k = plan.indices.length - 1; k >= 0; k--) history.splice(plan.indices[k], 1)
  history.splice(Math.min(plan.at, history.length), 0, ...plan.folded)
  registerFoldMarks(agent, plan)
  return history
}

/**
 * 折叠身份登记（`CONTEXT-COMPACTION.md` §6 · `SESSION.md` §2 播种条）：本轮记录的那几条消息对象按轮下标入账
 * （`agent._turnFoldMarks[i]`）。压缩按它们判「这一轮的记录消息是不是都已在中段」，恢复面按恢复出的轮记录
 * 重建同一张账——不重建的话，重启后的第二次压缩只见到重启之后的轮，`turnsCovered` 会被写小。
 * `plan.record` 不在 `_turns` 里（旧槽 ∥ 记账已清）⇒ 不登记，不改线也不抛。
 */
function registerFoldMarks(agent, plan) {
  if (!agent || !plan?.record) return
  const turns = Array.isArray(agent._turns) ? agent._turns : []
  const index = turns.indexOf(plan.record)
  if (index < 0) return
  const marks = Array.isArray(agent._turnFoldMarks) ? agent._turnFoldMarks : (agent._turnFoldMarks = [])
  marks[index] = [...plan.folded]
}

/**
 * 覆盖条数（压缩当刻算；`cut` = 切割点——它之前那一批会被摘要吞掉）：
 *  - 起点 = 旧检查点里的条数：不重算、不缩回（重启后的第二次压缩从槽里那一段继续数）；
 *  - 该轮记录消息**全部**落在切割点之前才算覆盖；一轮被切开不记——恢复时宁可多装一轮，不把半轮当整轮；
 *  - 该轮在机读线上一条登记消息都找不到 ⇒ 停（无法证明已覆盖，宁可多装）。
 */
export function coveredTurnCount(agent, cut) {
  const turns = Array.isArray(agent?._turns) ? agent._turns : []
  const marks = Array.isArray(agent?._turnFoldMarks) ? agent._turnFoldMarks : []
  const history = Array.isArray(agent?.history) ? agent.history : []
  let covered = normalizeCheckpoint(agent?._compactCheckpoint, turns.length)?.turnsCovered ?? 0
  for (let i = covered; i < turns.length; i++) {
    const onLine = (Array.isArray(marks[i]) ? marks[i] : [])
      .map((m) => history.indexOf(m))
      .filter((at) => at >= 0)
    if (onLine.length === 0) break
    if (!onLine.every((at) => at < cut)) break
    covered = i + 1
  }
  return covered
}

/** 非就地投影（`saveSession` 用）：同尺不同副作用——不改内存线的数组与对象。
 *  三段拼法（`SESSION.md` §2）：摘要注记（检查点在场时）+ 检查点之后那些轮记录的投影 + 在途段原文。
 *  恢复面 `restoreMachineFromTurns` 是同一拼法的读向（差别只在装线前的配对收口）。 */
export function machineLineForSlot(turns, { checkpoint = null, activeRaw = [] } = {}) {
  const covered = checkpoint?.turnsCovered ?? 0
  const list = Array.isArray(turns) ? turns : []
  const line = checkpoint ? [{ role: "user", content: checkpoint.note }] : []
  line.push(...projectTurns(list.slice(covered)))
  line.push(...(Array.isArray(activeRaw) ? activeRaw : []))
  return line
}

/**
 * 在途 / 异常段（没有轮记录可依）：本轮输入之后尚未登记的那一段——**原样保留**（不折叠也不丢）。
 * 登记完成的轮已进 `turns`，不会出现在这里。
 */
export function activeTurnRaw(agent) {
  const history = Array.isArray(agent?.history) ? agent.history : []
  const start = agent?._turnStartLen
  if (!agent?._turnLedger || !Number.isInteger(start) || start < 0 || start > history.length) return []
  return history.slice(start)
}

/**
 * 本轮原始段的起点：`prepareRun` 推入的用户输入消息下标（`from` = 调用前的历史长度——
 * 只在本次推入的区间里找，不会误取上一轮的同文请求）。找不到（输入非串 / 形态异常）⇒ `from`。
 * 投影的“行”从这里开始：此前的运行注入（环境行 / 文档与记忆注入 / 异步结果）属于上下文，不随折叠消失
 * ——它们是本轮**输入之前**就位的，不是本轮的模型过程。
 */
export function findTurnStartIndex(history, input, from) {
  if (typeof input !== "string" || !Array.isArray(history)) return from
  for (let i = history.length - 1; i >= from; i--) {
    const m = history[i]
    if (m?.role === "user" && m.content === input) return i
  }
  return from
}

// ────────────────────────────── 恢复 ──────────────────────────────

/** 槽里的 `turns` 归一（旧槽缺键 ⇒ `[]`；非数组项丢弃——盘上是用户数据，不抛）。 */
export function normalizeSlotTurns(turns) {
  if (!Array.isArray(turns)) return []
  const out = []
  for (const t of turns) {
    if (!t || typeof t !== "object") continue
    out.push({
      userRequest: str(t.userRequest) || null,
      finalResponse: str(t.finalResponse) || null,
      taskState: t.taskState && typeof t.taskState === "object" ? t.taskState : null,
    })
  }
  return out
}

/** 落槽形态（逐项新建记录：字符串字段逐字拷贝，`taskState` 按引用透传——落盘前只读，
 *  保存之后再改内存记录不是本函数能拦的形）。 */
export function slotTurns(turns) {
  return normalizeSlotTurns(turns)
}

/**
 * 压缩检查点归一（`{ note, turnsCovered }`——槽是盘上用户数据，本函数不抛）：两字段齐且合法 ⇒ 新对象；
 * 否则 `null`（= 「本会话还没压过」，与键缺同义）。`turnsCovered` 夹在当前轮记录条数内——
 * 盘上被改坏的大数不得让恢复少装轮（少装 = 静默丢掉已登记的轮）。
 */
export function normalizeCheckpoint(value, turnsLen = Number.MAX_SAFE_INTEGER) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null
  const note = str(value.note)
  if (!note) return null
  if (!Number.isInteger(value.turnsCovered) || value.turnsCovered < 0) return null
  return { note, turnsCovered: Math.min(value.turnsCovered, Math.max(0, turnsLen)) }
}

/**
 * 在途段尾端配对收口（`CONTEXT-COMPACTION.md` §6 · `SESSION.md` §2 `activeRaw` 行）：装线前
 * ① 前面没有对应调用的 `tool` 消息不装（孤立的工具结果——首个请求必 400）；
 * ② 尾部没有工具结果的 `assistant(tool_calls)` 不装——来由是一次普通的 Stop（Ctrl+C）落在工具执行中：
 *   `turn-loop.mjs` 先 `pushReal` 这条调用消息、再跑工具批，中止在结果入线前抛出（`dispatch-run.mjs`
 *   「if (signal?.aborted) throw error」——用户停不当成工具错误），回合尾保存照旧落盘
 *   （`agent-turn.mjs`「Save session after every turn (survives crashes)」）⇒ 槽里的在途段尾就是这条没有结果的调用。
 * 两种消息的原文仍在人读线（`read_history` 取得到）；丢掉之后机读线尾落回完整交换边界。
 */
export function harvestActiveRaw(raw) {
  const list = Array.isArray(raw) ? raw : []
  const callIds = new Set()
  const kept = []
  for (const m of list) {
    if (m?.role === "tool") {
      if (!callIds.has(m.tool_call_id)) continue // ① 前面没有对应调用
      kept.push(m)
      continue
    }
    for (const tc of Array.isArray(m?.tool_calls) ? m.tool_calls : []) callIds.add(tc.id)
    kept.push(m)
  }
  while (kept.length > 0) {
    const last = kept[kept.length - 1] // ② 尾部无工具结果
    if (last?.role !== "assistant" || !(Array.isArray(last.tool_calls) && last.tool_calls.length > 0)) break
    kept.pop()
  }
  return kept
}

/**
 * 恢复机读线（`applySession` ∥ `sessionReading` 同一判据）：槽带 `turns` ⇒ 按同一投影重建——
 * 摘要注记（`compactCheckpoint` 在场时）+ 检查点之后那些轮记录的投影 + 在途段（收口后）。
 * 无 `turns`（旧槽）⇒ `null`，由调用方按既有回退（`contextHistory` → `history`）走。
 * `out`（可选出参）拿回 `{ turns, marks }`：归一后的轮记录与逐轮身份账——与装回线上的对象是同一批
 * （`applySession` 播种折叠标记用；不播种，同一会话的第二次压缩会只见到重启之后的轮）。
 */
export function restoreMachineFromTurns(data, out = null) {
  const turns = normalizeSlotTurns(data?.turns)
  if (turns.length === 0) return null
  const checkpoint = normalizeCheckpoint(data?.compactCheckpoint, turns.length)
  const covered = checkpoint?.turnsCovered ?? 0
  const line = checkpoint ? [{ role: "user", content: checkpoint.note }] : []
  const marks = []
  for (let i = 0; i < turns.length; i++) {
    if (i < covered) { marks.push([]); continue } // 已覆盖的轮不装线（仍在 `turns` 里供人读回查）
    const msgs = turnRecordMessages(turns[i])
    line.push(...msgs)
    marks.push(msgs)
  }
  line.push(...harvestActiveRaw(data?.activeRaw))
  if (out) { out.turns = turns; out.marks = marks }
  return line.length > 0 ? line : null
}

// ────────────────────────────── agent 面装配 ──────────────────────────────

function logsPathOrNull() {
  try { return todayLogPath() } catch { return null }
}

/**
 * 登记完成轮（`runAgent` 的 finally：`finalizeAgentTurn` 成功返回之后才调）。
 * 不登记 ⇒ 没有 `_turnPending` ⇒ 下一轮起点不会折叠该轮（ContinueError 续跑 ∥ 中止 ∥ 异常不折叠）。
 *
 * 「本轮原始段」= `history[_turnStartLen, _turnResponseEnd)`：终点在 `runTurnLoop` 返回处采集——
 * 回合收尾注入的异步结果（子代理报告）落在此后，属于下一轮要看见的上下文，不随折叠丢弃。
 */
export function registerCompletedTurn(agent, { finalResponse = null, status = "completed" } = {}) {
  const ledger = agent?._turnLedger
  if (!ledger) return null
  const record = buildTurnRecord(ledger, {
    finalResponse,
    status,
    goal: agent.goal ?? null,
    tasks: Array.isArray(agent.tasks) ? agent.tasks : [],
    touchedFiles: Array.isArray(agent._touchedFiles) ? agent._touchedFiles : [],
    // 设计/需求文档根（调用方注入：`facts.docRoots` 是唯一入口，本档不自读 manifest）——
    // 未注入 ⇒ `changedDocs` 不出现（`changedDocsOf` 的 null 支）。
    docRoots: Array.isArray(agent._docRoots) ? agent._docRoots : [],
    cwd: agent.cwd ?? null,
    // 槽文件（可回查位置）：绑定记录存储时由存储持槽路径；未绑定（模式 F / 测试）不带。
    slotFile: agent._recordStore?.slotFile ?? null,
    batchDoc: agent._batchDoc ?? null,
    logsPath: logsPathOrNull(),
  })
  const history = Array.isArray(agent.history) ? agent.history : []
  const end = Math.min(Number.isInteger(agent._turnResponseEnd) ? agent._turnResponseEnd : history.length, history.length)
  const start = Math.min(Number.isInteger(agent._turnStartLen) ? agent._turnStartLen : 0, end)
  const msgs = new Set(history.slice(start, end))
  if (!Array.isArray(agent._turns)) agent._turns = []
  agent._turns.push(record)
  agent._turnPending = msgs.size > 0 ? { record, msgs } : null
  agent._turnLedger = null
  agent._turnStartLen = null
  agent._turnResponseEnd = null
  return record
}

/** 下一轮起点应用投影（`beginRun` 安全接缝）：有一次未折叠的完成轮 ⇒ 就地折叠并消费它。
 *  待折段在机读线上定位不到（被压缩摘要吞掉 ∥ 对象已换）⇒ 不折叠、清掉待折项，并留一行痕：
 *  静默返回与「已经折过」在日志里同形，多留在跨轮线上的那一轮工具过程事后没人查得出来。 */
export function applyTurnProjection(agent) {
  const pending = agent?._turnPending
  if (!pending) return false
  agent._turnPending = null
  const plan = turnFoldPlan(agent.history, pending)
  if (!plan) {
    logEvent("ev:turn-fold-noop", { reason: "segment-not-on-line", msgs: pending.msgs?.size ?? 0 })
    return false
  }
  applyTurnFold(agent.history, plan, agent)
  return true
}
