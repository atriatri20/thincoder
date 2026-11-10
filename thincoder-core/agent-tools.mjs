/**
 * agent-tools.mjs — self-discipline tool index
 * Loaded from agent.mjs via dynamic import to avoid ESM circular dependencies.
 * Each tool implementation lives in the agent-tools/ subdirectory.
 */
export { planTool } from "./agent-tools/plan.mjs"
export { subagentTool } from "./agent-tools/subagent.mjs"
export { taskTool } from "./agent-tools/task.mjs"
export { skillTool } from "./agent-tools/skill.mjs"
export { goalTool } from "./agent-tools/goal.mjs"
export { verifyTool } from "./agent-tools/verify.mjs"
export { recentChangesTool } from "./agent-tools/recent-changes.mjs"
export { timerTool } from "./agent-tools/timer.mjs"
export { advisorTool } from "./agent-tools/advisor.mjs"
export { engTool } from "./agent-tools/eng.mjs"
export { manifestTool, manifestReadTool } from "./agent-tools/manifest.mjs"
export { readHistoryTool } from "./agent-tools/read-history.mjs"
// 模型主动整理上下文（CONTEXT-COMPACTION.md §6.16 · F-CC5）：单工具三操作 stats / prune / compact
// ——depth-0 段挂载（子代理面裁见 §6.16.6 `family-tools.mjs` `depthOnly`）。
export { contextTool } from "./agent-tools/context.mjs"
export { batchTool } from "./agent-tools/batch.mjs"
// 批次档生命周期工具（BATCH-RECORD §4.3 挂载表——主名 `batch` 单工具**六 action**（create / attach / append /
// edit / status / close）：depth-0 主 agent 全量六动作（create/attach/close + append/edit/status 域随模式——
// 工程面 = append §1/§4/§6 ∥ status §1；普通面 = append §1/§2/§4/§5/§6 ∥ status §1/§2/§5）（轮 2 裁定②：§4/§6
// 状态面走普通文档写）（D-BR18）；eng 子代理 / 评审实例按身份 profile 只挂 append/edit/status（TOOLS.md §6.29 ②）。
// CORE-UNIFICATION TOOLS #83（统一登记册——VSC `agent-tools/index.mjs` 含 consult 家族；
// CLI 原把 consult 另挂 `agent/setup.mjs` 的家族段装配 ⇒ 归位：登记册即单一来源，装配方只读本档）。
export { consultStartTool, consultStopTool } from "./agent-tools/consult.mjs"
// SUBAGENT-UPSTREAM-CHANNEL（AGENT-LOOP-UPSTREAM.md §6.27.4 装配接线）：子代理上行通道工具
// （depth>0 段装配——`agent/family-tools.mjs`；depth-0 / consult 不装配）。
export { parentChannelTool } from "./agent-tools/parent-channel.mjs"
export { docCheckTool } from "./agent-tools/doc-check.mjs" // 文档纪律机检（DOC-DISCIPLINE.md §3.20 条目 S——产品内建 · 报告态 · 非门禁）
// 文档锚点图（DOC-GRAPH.md §2.5——扫描 ∥ 正向 ∥ 反向 ∥ 链路；边表与台账同库）。两变体互斥装配：全量四动作挂
// depth-0 ∥ 只读三动作（无 `scan`）挂全部 depth>0 角色段与 advisor 面（AGENT-LOOP-SUBAGENT.md §6.60.2）。
export { docGraphTool, docGraphReadTool } from "./agent-tools/doc-graph.mjs"
