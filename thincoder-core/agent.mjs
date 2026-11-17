/**
 * agent.mjs — Agent main loop
 * LLM ↔ tool-call loop, until the task is done.
 */
// PROMPT-SYSTEM 施工② G1（2026-09-10）：六件槽位常量装载收口 prompt-overlays.mjs
// （与子代理角色常量同源——单一权威锚 D1）；旧三件文件读取随本批退役。
// 槽位常量通过下方 re-export 面（mod: rel — re-export 保 import 面）；本文件自身零直接消费。
// 主循环阶段函数（压缩检查/注入组/回合收尾）2026-09-05 实践轮迁 agent/run-stages.mjs
// 2026-09-29 P2 三拆（#579）：起跑前段 ∕ 回合环 ∕ 模型调用逐字迁 agent/run-start.mjs ∕
// agent/turn-loop.mjs ∕ agent/chat-call.mjs——本档残留 = 编排 + 状态工厂 + 面（re-export 保面）。
import { beginRun } from "./agent/run-start.mjs"
import { runTurnLoop } from "./agent/turn-loop.mjs"
import { finalizeAgentTurn } from "./agent/run-stages.mjs"
// 跨轮机读投影（CONTEXT-COMPACTION §1.1 ∥ SESSION §2 · 台账 #2395）：完成轮登记点住本档——
// 只有 `finalizeAgentTurn` 成功返回之后才登记，ContinueError / AbortError / 其它异常不登记。
import { registerCompletedTurn, noteTurnRunError } from "./agent/turn-projection.mjs"
import {
  escapeXml, listWorkDir,
  readonlyToolNames, collectGitContext, loadProjectInstructions,
  ContinueError,
  DEFAULT_MAX_TURNS, DEFAULT_SUBAGENT_TURNS,
  MIN_REPORT_CHARS, REPORT_CONTINUATION,
  SUBAGENT_TOOL_EXCLUSIONS, excludeSubagentTools, // TOOLS.md §6.16：子代面按面排除（helpers 单源）
} from "./agent/helpers.mjs"
// ENG 提醒族 + auto-turn domain 2026-09-05 迁 agent/helpers.mjs（agent.mjs 530 > 500 硬限）
// PROMPT-SYSTEM 施工② G1（2026-09-10）：六件槽位常量装载收口 prompt-overlays.mjs
// （与子代理角色常量同源——单一权威锚 D1）；本文件 re-export 保 import 面。
export {
  PERSONA_ENGINEERING, PERSONA_NORMAL, COMMON,
  DISCIPLINE_ENGINEERING, DISCIPLINE_NORMAL,
  CONSULT_BASE,
} from "./prompt-overlays.mjs"
export { ENG_ON_REMINDER, ENG_OFF_REMINDER } from "./agent/helpers.mjs"

// Role → persona slot mapping note（施工② G3）: 子代理人格由 assemblePrompt 场景表按
// role 承载（persona-explore/coder/plan/eng-coder.md——D1 表 = 蓝图 §3.2 1:1）；
// spawn 侧 overlay 概念已退役（prompt-overlays.mjs 不再导出 OVERLAY 别名常量）。

// exported for consumption by agent-tools.mjs
export {
  ContinueError,
  listWorkDir, loadProjectInstructions,
  readonlyToolNames, collectGitContext, escapeXml,
  MIN_REPORT_CHARS, REPORT_CONTINUATION, DEFAULT_SUBAGENT_TURNS,
  SUBAGENT_TOOL_EXCLUSIONS, excludeSubagentTools, // TOOLS.md §6.16（子代装配点从本档取用）
}


// Re-exported for API compatibility (single source of truth: advisor/repos.mjs)
export { hasCodeMutations } from "./advisor/repos.mjs"
// 流式输出门（§2.5 #78）2026-09-29 P2 三拆随 agent/chat-call.mjs 迁出——re-export 保 import 面
export { streamOutputAllowed } from "./agent/chat-call.mjs"

/** Create a new agent state object with all fields initialized to defaults */
export function createAgent({
  provider, tools, config, cwd, memory, overlay, role,
  tasks = [], history = [],
  planMode = false, autoApprove = false,
  goal = null, sessionStart = null,
}) {
  return {
    provider, tools, config, cwd, memory, _role: role,
    overlay, tasks, history,
    planMode, autoApprove, goal,
    _mutatedThisRun: false, _verifiedThisRun: false, _verifyPassed: undefined, _calledAdvisorThisRun: false,
    _engDesignReviewed: false, // eng-coder: design review gate passed (hard gate in dispatch.mjs)
    // DESIGN-TOKEN-SETTLEMENT D3 (2026-09-08): single-value `_engDesignToken` mirror retired
    // (AC3 零写) — no field initializer; the multi-slot Map `_engDesignTokens` is the
    // authoritative ledger (hydrated by restoreEngTokens / written by settle).
    _touchedFiles: [], _verifyRetries: 0, _advisorRound: 0, _advisorSession: null,
    _advisorRuns: new Map(), // AGENT-LOOP-ASYNC-POOL.md §6.10 D-24b: per-review convergence instances (rounds/prior/designId)
    _mutationSeq: 0, _mutLog: [], // AGENT-LOOP-ASYNC-POOL.md §6.10 D-24b: mutation log (in-flight review staleness scan)
    _lastAdvisorOutput: null, // full review output from the most recent advisor call (convergence rounds inject it verbatim)
    _lastEngState: false,
    _pendingReminders: [],
    _pendingTimers: [],
    _sessionStart: sessionStart,
    _lastPromptTokens: null, _usageAtLen: null,
    _tok: null, _tokRatio: 1, // §6.17 估算自校准池化比（{key,num,den}；采样 = turn-loop，清空 = /new）
    _compressFailures: 0,
    _emptyRetries: 0, // empty-response retry budget (per-run; reset on a fresh user turn)
    // §6.6 `wrote` 判据与注入帽的载体（AGENT-LOOP.md §6.6 · §6.2 resume 保留集）：
    // `_batchWrites` = `batch` 工具成功写盘的累计数（`onWritten` 各汇聚点自增）；`_designTurnNotices` = 本链已注入的设计轮提醒条数。
    _batchWrites: 0, _designTurnNotices: 0,
    _runStartHistoryLen: 0, // machine-line length at the start of the current run — end-of-run exploration distillation slices from here
    _pendingDistill: null, // in-flight end-of-run exploration distillation (SEND-STALL-DISTILL §2.1) — awaited at next run start / TUI exit flush
    _currentTurn: 0, _maxTurns: DEFAULT_MAX_TURNS, // turn counter for status bar display
    // 跨轮机读投影（CONTEXT-COMPACTION §1.1 ∥ SESSION §2 · 台账 #2395）：轮记录 ∥ 活动轮账本 ∥
    // 待折叠的完成轮。三件只在轮边界改写（`agent/turn-projection.mjs`），新 agent 从空账起。
    _turns: [], _turnLedger: null, _turnPending: null, _turnStartLen: null, _turnResponseEnd: null,
  }
}

/** Run the agent loop: LLM ↔ tool-call cycle until task completion or turn limit. Returns final text content. */
export async function runAgent(agent, input, callbacks = {}, { depth = 0, signal, maxTurns: overrideTurns, resume = false, autoTurn = false, upstreamTurn = false, timerTurn = false, suspDriven = false, consumeInjected = null, consumeQueuedInput = null, streamOutput = false, extraTools = null, injections = null, turnDomainText = null, distillSignal = null, toolDecorate = undefined } = {}) {
  const { maxTurns, threshold, toolSchemas, toolByName, systemPrompt } = await beginRun(agent, input, callbacks, {
    depth, signal, overrideTurns, resume, autoTurn, upstreamTurn, timerTurn, extraTools, injections, turnDomainText, toolDecorate,
  })

  let thrownError = null
  let finalResponse = null
  try {
    finalResponse = await runTurnLoop(agent, {
      maxTurns, threshold, toolSchemas, toolByName, systemPrompt,
      depth, signal, autoTurn, suspDriven, streamOutput, consumeInjected, consumeQueuedInput, callbacks, distillSignal,
    })
    // 本轮原始机读段的终点（折叠边界）：此后回合收尾注入的异步结果不属于本轮的模型过程，
    // 折叠时保留（下一个模型请求仍看得见它们）。
    agent._turnResponseEnd = agent.history.length
    return finalResponse
  } catch (e) {
    thrownError = e
    // 异常面只记账不登记（异常轮不折叠）：原因留给同一账本（续跑沿用）。
    noteTurnRunError(agent._turnLedger, e)
    throw e
  } finally {
    // 2026-09-05 实践轮：回合收尾（consult 清理/async 池分流/guard 继承——原 425-462
    // 段 + collectSettledAsync 466-494 整体迁 agent/run-stages.mjs finalizeAgentTurn——
    // CLI 对位 VS run-stages——finally 只剩一行调用 + 骨架注释）。
    await finalizeAgentTurn(agent, { signal, autoTurn, upstreamTurn, timerTurn, suspDriven, thrownError, depth })
    // 正常返回 ∧ 收尾成功 ⇒ 登记完成轮（设计 §2：ContinueError / AbortError / 其它异常不登记，
    // 续跑沿用同一账本）。登记只置事实与折叠计划——机读线在下一轮起点（`beginRun`）才折叠。
    if (!thrownError) registerCompletedTurn(agent, { finalResponse })
  }
}
