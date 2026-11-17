# 2026-11-13 · turn-history-projection
> 六段，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（主 agent）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（实施者：主 agent ∥ coder）· §6 验证与收口（父代理）。
> 每段只有一个作者：作者的段可 `append` 加内容、可就地改（`edit`）；非作者一概拒。
> 编制：主 agent · 2026-11-13 · 来源 = 用户 2026-11-13 确认机读历史方案并询问「那现在可以开始实施了吗？」；设计与需求已写入 CONTEXT-COMPACTION、SESSION。
> 台账 = #2395（core · 归批）。前情 = 无（独立批）。
## §1 讨论（主 agent）
**状态行**：已收口 2026-11-14
批起 sha = fba63fd8d53f7e990edd6eaa0b66765fc1dceeda
<§1 模板占位：本批条目 / 关键判据 / 授权口径>

目标 = 当前轮完整保留工具调用链；正常轮结束后，后续机读历史只保留用户请求、最终回复和任务状态。人读全史与 read_history 不改。

边界 = Continue/resume 未完成链、中止和异常轮不折叠；并行工具、多模态延迟消息和 Provider 配对不在当前轮受破坏。简单无工具问答允许空任务状态。

机制裁定 = 槽保存结构化轮记录；线上任务状态用标准 role/content 消息，不加 Provider 未知字段。自动/上行/定时轮不伪造用户请求。

## §2 批次任务与设计（主 agent）
**状态行**：设计完成（安全接缝、轮记录和全史边界已明确）

**设计落点** = `docs/core/design/CONTEXT-COMPACTION.md` §1.1 与 `docs/core/design/SESSION.md` §2。本批在两档内补充机制，不另立设计档。

**最近先例** = `thincoder-core/context-push.mjs` 的双线写入、`docs/core/design/CONTEXT-COMPACTION.md` §8 的机读替换、`thincoder-core/session-lifecycle.mjs` 的 `mergeAdjacentAssistantEchoes` 恢复归并；三者均只改机读线，与本批同向。

**勘察证据** = 已读 `pushReal`、`recordToolResults`、`runAgent` 收尾接缝、`beginRun` 与 `applySession/saveSession` 调用链；本仓无公共来源文档描述跨轮投影，外部文档仓不适用。

**既有件** = 无现成轮记录或投影实现（none found）；`printEvent`、`historyReading` 均非同一机制，不可复用。

**机制**：
- `beginRun` 在 `await _pendingDistill` 之后、注入异步结果与新输入之前，先建立或延续活动轮事实账本。
- `runAgent` 捕获真实 `finalResponse`；`finalizeAgentTurn` 成功返回后才登记完成轮，`ContinueError`、`AbortError` 与其它异常不登记，续跑沿用同一账本。
- 投影函数为纯函数：输入全部轮记录与活动轮，输出机读 `history`；`saveSession` 与 `beginRun` 共用同一函数，避免 ACP 轮末保存重新写入完整工具过程。
- 轮记录形 = `{ userRequest, finalResponse, taskState }`；`taskState` 逐字段来源如下：

| 字段 | 运行时来源 |
|---|---|
| objective | `runAgent` 入参 `input`；长期目标取 `agent.goal.objective` |
| status | 本轮正常返回 ∥ 异常抛出 |
| changedFiles | 工具结果中真实落盘的路径归集，含子代理 `mergeChildMutations` 合入项 |
| verification | 本轮 `bash`、`execute`、`verify` 的调用参数与结果摘要 |
| evidence | 槽文件路径、工具结果中的落盘路径、批次档与后台日志位置 |
| remaining | `agent.tasks` 中未完成项与活动 goal |
| blockedBy | `goal.status === "blocked"` 的原因与运行异常原因 |

- 线上用标准 `role/content` 消息表达 `taskState`，不向 Provider 发送未知字段；无工具问答可省略。
- `applySession` 的恢复权威顺序在 `docs/core/design/SESSION.md` §2 单点写明（轮记录优先，`contextHistory` 缺省，老槽回退 `history`），本档不复述。`resetSessionState` 清理账本与轮记录；`sessionReading` 与实际请求同尺。
- VSC 独立载荷保存和恢复轮记录：`agentState` 把 `turns` 随 `onComplete/onDistilled` 载荷带出，`applySlotSessionState` 从槽读回；`panel-session-write.saveLines` 以本轮轮记录覆盖旧值，不只做 `...existing` 保留。CLI、Desktop、Server 走 core。
- `read_history`、`legacyHistory`、sidecar 与 `_fullHistory` 不过滤。
- 分支场景：续跑来自 `test/integration/minimal-mode.test.mjs` 的多段运行；中止与异常来自 `runAgent` 现有 `thrownError` 路径；老槽回退来自现有 v2 槽样本；自动轮由 `_pendingAsyncResults` 注入路径覆盖。
- `await _pendingDistill` 的收益：蒸馏会异步替换 `agent.history`，先等待可保证投影作用于最终数组，不被后到的替换覆盖。

**受影响文件（机读清单）**

| 档 | 分拆方案 | 行数 |
|---|---|---|
| thincoder-core/agent/turn-projection.mjs | — | 新 |
| thincoder-core/agent.mjs | — | 110 |
| thincoder-core/agent/run-start.mjs | — | 171 |
| thincoder-core/agent/record-results.mjs | — | 201 |
| thincoder-core/session.mjs | — | 280 |
| thincoder-core/session-lifecycle.mjs | — | 423 |
| thincoder-core/session-slot-write.mjs | — | 293 |
| thincoder-vscode/src/agent/run-helpers.mjs | — | 92 |
| thincoder-vscode/src/agent/agent-state.mjs | — | 171 |
| thincoder-vscode/src/agent/setup.mjs | — | 326 |
| thincoder-vscode/src/extension/panel-session-write.mjs | — | 156 |
| docs/batches/2026-11-13-turn-history-projection.test.mjs | — | 新 |
| test/integration/turn-history-projection.test.mjs | — | 新 |

逐档越线结论 = 全部 ≤500，无需拆分方案；量法 = 批起快照上统计内容行数。

**集成增量** = `test/rtm/tooling.md`「CLI 1」新增 1-5，先在 RTM 立号再写用例标题：

| 编号 | 组件交互 | 业务可观测结果 | 服务需求 | 进入口 |
|---|---|---|---|---|
| 1-5 | 会话槽 ⟷ `runAgent` ⟷ 下一轮模型请求 | 下一轮请求不再携带上一轮工具过程，但携带用户请求、最终回复与任务状态；恢复后经 `read_history` 仍可取回原始工具结果 | 当前轮机读完整性；跨轮机读瘦身；人读全史可查 | 真 CLI 连续两轮对话 |

既有 1-1/1-2 的配对断言不变；1-3 的恢复后行为改为新跨轮语义，并同步 RTM 通过条件。

**验收** = 实施轮 `node --test docs/batches/2026-11-13-turn-history-projection.test.mjs`：当前轮第二次请求仍含全部工具结果；下一轮无旧工具过程且任务状态存在；保存恢复一致；续跑与异常不折叠；简单问答任务状态为空；事实字段来自运行记账而非最终回复；`read_history` 可回查。收口执行 `test/integration/turn-history-projection.test.mjs` 与相关 Provider、VSC 回归。

设计复核通过（轮次 3，🔴 0），凭证 = 1f1157ef-9604-4147-86d8-f6a95cb4d6ed。

## §3 设计评审（评审子代理）
**状态行**：评审通过



### 轮次 1（评审子代理）

| # | 严重度 | 状态 | 证据 |
|---|---|---|---|
| 1 | 🔴 | 未决 | CONTEXT-COMPACTION §1.1「状态由运行记账和实际工具结果组装」与批次 §2 beginRun 账本字段并列，但 remaining、blockedBy 的事实来源及 changedFiles 归集口径未闭合 |
| 2 | 🔴 | 未决 | SESSION §2「applySession 从 contextHistory 恢复机读线」与批次 §2「applySession 新槽从轮记录恢复」给出不同恢复权威顺序 |
| 3 | 🔴 | 未决 | 批次 §2「ContinueError、AbortError 和异常不登记」及自动轮、简单问答、旧槽回退分支均未附真实观察或可复现路径 |
| 4 | 🔴 | 未决 | 批次 §2「受影响文件（机读清单）」多档仍为「待量」，没有逐档越线结论、检查命令或 300+ 行函数判断 |
| 5 | 🔴 | 未决 | 批次 §2「集成增量」只写 CLI 1-5、1-3 的编号和语义，未给出用例标题、组件交互、服务需求及业务入口 |
| 6 | 🟡 | 未决 | 批次 §2「验收」只有覆盖类别和「实施轮跑批内单测」，未具名 node --test 验收文件及各类别预期断言 |
| 7 | 🟡 | 未决 | 批次 §2「最近先例」有符号名，但缺匹配设计档小节与先例批次坐标，偏差说明不完整 |
| 8 | 🟡 | 未决 | 批次 §2 未记录公共来源文档或独立文档仓调研；设计档首仅列内部勘察 |
| 9 | 🟡 | 未决 | 批次 §2 新增 turn-projection.mjs 等名称，未给 existing、none found 或 existing but unusable 三问结论 |
| 10 | 🟡 | 未决 | SESSION §2「槽同时持久化各轮 userRequest/finalResponse 与 taskState」未命名槽字段、记录数组形态、版本兼容及 VSC 独立载荷映射 |
| 11 | 🟡 | 未决 | 批次 §2 要求 beginRun 先 await _pendingDistill 再投影，而 CONTEXT-COMPACTION §8 的蒸馏替换结果随后会被投影移除，等待收益未说明 |
| 12 | 🔵 | 未决 | 批次 §2 仍保留「§2 模板占位」两行骨架文字 |

VERDICT: changes-required
计数：🔴 5 · 🟡 6 · 🔵 1

### 轮次 2（评审子代理）

| # | 严重度 | 状态 | 证据 |
|---|---|---|---|
| 1 | 🔴 | 未决 | §2「受影响文件（机读清单）」12 档中 9 档仍写「待量」，无逐档越线结论、无检查命令、无 300+ 行单函数判断；实测：`thincoder-core/session.mjs` 280 行、`session-lifecycle.mjs` 423 行、`session-slot-write.mjs` 293 行、`agent/run-start.mjs` 171 行、`agent/record-results.mjs` 201 行、`thincoder-vscode/src/agent/agent-state.mjs` 171 行、`panel-session-write.mjs` 157 行、`run-helpers.mjs` 93 行、`agent.mjs` 110 行——均 ≤500，但「待量」这一格本身即无结论 |
| 2 | 🔴 | 未决 | §2「集成增量」只写「CLI 1 增加 1-5：同轮工具链完整；下一轮无旧工具过程但有任务状态；恢复后经 read_history 取回原始结果」——三句无用例标题、无组件交互、无业务可观测结果、无服务需求；`test/rtm/tooling.md` 的「CLI 1」节现只到 1-4，1-5 未在 RTM 立号 |
| 3 | 🔴 | 未决 | §2「ContinueError、AbortError 和异常不登记，续跑沿用账本」以及「自动轮 userRequest 可缺席」「无工具问答可省略」「老槽无轮记录保持原回退」四支，均未附真实观察或可复现路径（无可复现命令、无日志引用、无用户报告原文） |
| 4 | 🔴 | 未决 | 「beginRun 建立/延续活动轮事实账本，记录本轮输入、工具调用参数与有界结果、变更文件、验证和证据」与设计档 §1.1「状态由运行记账和实际工具结果组装」并列，但 remaining、blockedBy 的事实来源、changedFiles 归集口径（按 `_touchedFiles` ∥ 真实落盘）仍未闭合 |
| 5 | 🔴 | 未决 | 批次 §2「申请新槽从轮记录恢复」与设计档 SESSION §2「applySession 从 contextHistory 恢复机读线，缺省才由 history 播种」给出两条不同恢复权威顺序，同一机制两处描述不一致 |
| 6 | 🟡 | 未决 | §2「验收 = …实施轮跑批内单测，集成在收口执行」未具名 `node --test <file>` 验收文件，各类别无预期断言 |
| 7 | 🟡 | 未决 | §2「最近先例」有符号名（context-push、explore-distill、mergeAdjacentAssistantEchoes），但缺匹配设计档小节坐标与先例批次坐标 |
| 8 | 🟡 | 未决 | §2 未记录公共来源文档 ∥ 独立文档仓调研，以及「相关 ∥ 无关」结论 |
| 9 | 🟡 | 未决 | §2 新增 `turn-projection.mjs` 等名称，三问（existing ∥ none found ∥ existing but unusable）未答 |
| 10 | 🟡 | 未决 | 设计档 SESSION §2「槽同时持久化各轮 userRequest/finalResponse 与 taskState」未命名槽字段、记录数组形态、版本兼容与 VSC 独立载荷映射；同档 §2「version 2 含 history 与 contextHistory」未随本批改口 |
| 11 | 🟡 | 未决 | §2「下一次 beginRun 先 await _pendingDistill，再应用投影」与设计档 §8「summarizeRunExplorations 在 run 最终返回前处理本轮探索突发，把配对结果替换为 Exploration summary」——蒸馏产物为同轮配对结果，投影后能否构成独立收益未说明 |
| 12 | 🔵 | 未决 | §2 保留两行「§2 模板占位」骨架文字 |

VERDICT: changes-required
计数：🔴 5 · 🟡 6 · 🔵 1

### 轮次 3（评审子代理）

| # | 严重度 | 状态 | 证据 |
|---|---|---|---|
| 1 | 🔴 | 已修 | §2「受影响文件（机读清单）」行数列已逐档填数（`thincoder-core/agent.mjs` 110 / `run-start.mjs` 171 / `record-results.mjs` 201 / `session.mjs` 280 / `session-lifecycle.mjs` 423 / `session-slot-write.mjs` 293 / `run-helpers.mjs` 93 / `agent-state.mjs` 171 / `panel-session-write.mjs` 157），末行「逐档越线结论 = 全部 ≤500，无需拆分方案；量法 = 批起快照上统计内容行数。」 |
| 2 | 🔴 | 已修 | §2「集成增量」已立表（编号 ∥ 组件交互 ∥ 业务可观测结果 ∥ 服务需求 ∥ 进入口），1-5 行给「会话槽 ⟷ `runAgent` ⟷ 下一轮模型请求」与三条件；并写明「先在 RTM 立号再写用例标题」 |
| 3 | 🔴 | 已修 | §2「分支场景：续跑来自 `test/integration/minimal-mode.test.mjs` 的多段运行；中止与异常来自 `runAgent` 现有 `thrownError` 路径；老槽回退来自现有 v2 槽样本；自动轮由 `_pendingAsyncResults` 注入路径覆盖。」四支各具来源 |
| 4 | 🔴 | 已修 | §2「taskState 逐字段来源」表闭合 remaining（「`agent.tasks` 中未完成项与活动 goal」）、blockedBy（「`goal.status === "blocked"` 的原因与运行异常原因」）与 changedFiles（「工具结果中真实落盘的路径归集，含子代理 `mergeChildMutations` 合入项」） |
| 5 | 🔴 | 已修 | SESSION §2「applySession 的恢复权威顺序单点定义如下：`turns` 存在时以轮记录重建机读线；否则用 `contextHistory`；两者皆缺时由 `history` 播种。」与批次 §2「本档不复述」一致，同一机制单点 |
| 6 | 🟡 | 已修 | §2「验收 = 实施轮 `node --test docs/batches/2026-11-13-turn-history-projection.test.mjs`」并逐类给断言 |
| 7 | 🟡 | 已修 | §2「最近先例」含设计档小节坐标（`docs/core/design/CONTEXT-COMPACTION.md` §8）与符号坐标，并给「三者均只改机读线，与本批同向」偏差口径 |
| 8 | 🟡 | 已修 | §2「勘察证据 = …；本仓无公共来源文档描述跨轮投影，外部文档仓不适用。」已记录调研与结论 |
| 9 | 🟡 | 已修 | §2「既有件 = 无现成轮记录或投影实现（none found）；`printEvent`、`historyReading` 均非同一机制，不可复用。」三问已答 |
| 10 | 🟡 | 已修 | SESSION §2「槽另存 `turns`：每项形如 `{ userRequest, finalResponse, taskState }`」并给旧 v2 槽可选面兼容；批次 §2 给 VSC 独立载荷映射（`agentState` 带出 `turns`，`applySlotSessionState` 读回） |
| 11 | 🟡 | 已修 | §2「`await _pendingDistill` 的收益：蒸馏会异步替换 `agent.history`，先等待可保证投影作用于最终数组，不被后到的替换覆盖。」收益已写明 |
| 12 | 🔵 | 已修 | §2 节内已无「§2 模板占位」骨架文字；仅 §1 残留 `<§1 模板占位：本批条目 / 关键判据 / 授权口径>` 一行，属 §1（状态行 🔄 进行中）不属本项 |
| N | 🔵 | 新增（不阻塞） | 追踪项：`test/rtm/tooling.md`「CLI 1」节现仍只到 1-4，1-5 尚未立号；§2 已声明「先在 RTM 立号再写用例标题」，属实施轮的执行顺序要求，非设计缺陷 |

VERDICT: pass
计数：🔴 0 · 🟡 0 · 🔵 2（原 12 项全部已修；新增 1 项追踪 🔵，不阻塞）

### 轮次 4（评审子代理）

### 轮次 4（评审子代理 · 代码评审）

对象 = 跳轮机读投影与任务状态落地（批 #2395 实现交付验证）。全档实读：`turn-projection.mjs` 全 417 行 · `agent.mjs` · `run-start.mjs` · `record-results.mjs` · `session.mjs` · `session-lifecycle.mjs` · `session-slot-write.mjs` · VSC 三档 · 批内测试 · CLI 1-5 集成用例 · `CONTEXT-COMPACTION.md` §1.1 · `SESSION.md` §2。

| # | 严重度 | 状态 | 证据（指针） |
|---|---|---|---|
| 1 | 🟡 | 报告不阻塞 | `docs/core/design/SESSION.md` §2「version 2 含 history 与 contextHistory。saveSession 写当前粘性槽并原子替换」——本批后槽另带 `turns` 与每轮 `taskState`，该句未随动；同节下一句「槽另存 `turns`：每项形如 `{ userRequest, finalResponse, taskState }`」已补，属同节内前后句口径未对齐（R7a 文档滞后，只报不改） |
| 2 | 🔵 | 建议 | `thincoder-vscode/src/agent/run-helpers.mjs` `agentState` 的「`turns: Array.isArray(agent._turns) ? [...agent._turns] : []`」在 `_turns` 未被核 `registerCompletedTurn` 惰性建立时返回 `[]`，而 `panel-session-write.mjs` `saveLines` 的「`turns: Array.isArray(extra.turns) ? extra.turns : (Array.isArray(existing.turns) ? existing.turns : [])`」把数组载荷当内存权威覆盖槽值——该组合下会把槽既有 `turns` 抹成空。今日四条落盘点（B1/B2 走 onComplete 捕获态、B3/B4 不携 `turns`）都无此路径，属潜伏项 |
| 3 | 🔵 | 建议 | `thincoder-vscode/src/agent/setup.mjs` `buildTopLevelAgent` 未播 `_turns`/`_turnLedger`/`_turnPending`/`_turnStartLen`/`_turnResponseEnd` 五载体，而核 `createAgent`（`agent.mjs`）播了；端侧靠 `registerCompletedTurn` 的 `if (!Array.isArray(agent._turns)) agent._turns = []` 与 `agentState` 的 `Array.isArray` 守卫工作，两载体形态不对称（批 §2 机读清单未含 `setup.mjs`） |

**已核对的无问题面**：折叠锚点（`findTurnStartIndex` 只在本次 `prepareRun` 推入区间找输入；`turnFoldPlan` 按消息身份定位，切不到即不折）；`applyTurnFold` 就地 splice 保数组身份；`registerCompletedTurn` 在 `finalizeAgentTurn` 成功返回后经 `finally` 登记，异常/续跑不登记且 `noteTurnRunError` 只记账；`activeTurnRaw` 在 `_turnLedger === null` 时返 `[]`（完成轮不双计）；恢复权威序 `turns → contextHistory → history` 与 SESSION §2 单点一致（`applySession` ∥ `sessionReading` 同判据）；`saveSession` 机读线 = `machineLineForSlot(_turns, activeTurnRaw(agent))` 与恢复面同尺；`taskState` 七字段逐一对上 §1.1 表且事实来自记账（`verdictOf` 读结果内 `(exit code N)`，不采信最终回复）；`turns` 随槽保存/恢复（CLI ∥ VSC 双端）；`read_history`/`_fullHistory`/sidecar 未过滤。

**排除项**（按对象声明）：`anthropic-tool-roundtrip` 1-1/1-2/1-3 属环境预先红（固定开销越线），已裁定不改，不据此判定；`onDistilled` 无独立用例已披露——`thincoder-vscode/test/2026-11-06-vsc-turn-save-slots.test.mjs` B2 驱动的 `turnAgentState` 不含 `turns` 键，该披露与测试现状一致。

VERDICT: pass
计数：🔴 0 · 🟡 1（报告不阻塞）· 🔵 2

## §4 用户批准（主 agent）

用户确认“任务状态当然是应该有的”并同意整体方案，随后明确要求落文档并询问可以开始实施；本批按已确认机制实施。

父侧裁定（2026-11-13）：anthropic-tool-roundtrip 1-1/1-2/1-3 在本工作区因夹具固定开销越线而预先红，与本批改动无关；不为通过而改其断言，仅同步 1-3 的文档通过条件。本批行为证据以 CLI 1-5（大窗夹具）为准。该裁决在子代理结算后补记。

## §5 实施记录（实施者：主 agent ∥ coder）
**状态行**：实施完成（机制与两档测试落地；VSC 载荷时序已复核（原披露 2 作废，见复核轮记录）；1-1/1-2/1-3 的红 = 工作区固定开销超窗口（110993 > 96000），另见披露 1/3）



### 实施记录（coder 座 · 2026-11-13）

**机制落点（机读清单 12 档，全部落地）**

- 新增 `thincoder-core/agent/turn-projection.mjs`：账本 / 事实 / 折叠 / 恢复四面同源。
  `createTurnLedger` ∥ `noteTurnToolFacts`（运行记账：验证类工具的调用参数与结果摘要，成败读结果里的真实退出码而非工具调用成败；自动 / 上行 / 定时轮不伪造用户请求）；
  `buildTurnTaskState`（按设计 §1.1 表逐字段组装 objective / status / changedFiles / verification / evidence / remaining / blockedBy；changedFiles 取 `_touchedFiles` 真实落盘归集，含 `mergeChildMutations` 合入项；无工具活动 ⇒ `null`）；
  `turnRecordMessages` ∥ `projectTurns`（轮记录 → 用户请求 ∥ 最终回复 ∥ 任务状态三条标准 `role/content` 消息，任务状态带 `transient`，发送前由 `stripLocalMessageFields` 剥离）；
  `turnFoldPlan` ∥ `applyTurnFold`（按**消息身份**定位本轮原始段，切不到就不折叠——对压缩重建 ∥ 蒸馏换数组 ∥ `repairHistory` 过滤都稳；就地 splice 保数组身份，VSC 保存面持有的引用不落空）；
  `machineLineForSlot` ∥ `activeTurnRaw` ∥ `restoreMachineFromTurns`（保存面与恢复面同一实现）。
- `thincoder-core/agent.mjs`：`runAgent` 捕获真实 `finalResponse`（`runTurnLoop` 返回值）与 `_turnResponseEnd`（本轮模型过程终点）；异常径只 `noteTurnRunError`；`finally` 里 `finalizeAgentTurn` 成功返回后才 `registerCompletedTurn` —— ContinueError / AbortError / 其它异常不登记。`createAgent` 补三个显式载体初值（`_turns` ∥ `_turnLedger` ∥ `_turnPending` 等）。
- `thincoder-core/agent/run-start.mjs`：安全接缝 = `await _pendingDistill` 之后、注入异步结果与本轮输入之前 `applyTurnProjection`；段起点（`_turnStartLen`）= **本轮用户输入消息的下标**（`findTurnStartIndex`，只在本次 `prepareRun` 推入的区间找）——输入之前的运行注入（环境行 / 文档与记忆注入 / 异步结果）留在机读线，不随折叠消失；续跑沿用链起点、账本沿用同一本。
- `thincoder-core/agent/record-results.mjs`：每条工具结果入史的同时 `noteTurnToolFacts`（一条只记一次，先于多模态 / 普通 / 非视觉提醒三条分支）。
- `thincoder-core/session.mjs`：`saveSession` 的 `contextHistory` = `machineLineForSlot(_turns, activeTurnRaw(agent))`（与 `applySession` 重建面同一实现；在途 / 异常段原样陪跑）；`fields.turns = slotTurns(agent._turns)`。
- `thincoder-core/session-lifecycle.mjs`：`applySession` 恢复权威顺序 = `turns` → `contextHistory` → `history`（SESSION §2 单点）；回填 `_turns` 并清活动载体；`sessionReading` 同判据（读数与实际请求同尺）；`resetSessionState` 清轮记录与三载体。
- `thincoder-core/session-slot-write.mjs`：`newSlotData` 补 `turns: []`（全新槽规范结构）。
- `thincoder-vscode/src/agent/run-helpers.mjs`：`agentState` 带出 `turns`（快照拷贝）。
- `thincoder-vscode/src/agent/agent-state.mjs`：`applySlotSessionState` 在 `restore` 支从槽读回 `turns`，活动载体不跨进程播种。
- `thincoder-vscode/src/extension/panel-session-write.mjs`：`saveLines` 的 `turns` 以本回合载荷**覆盖**槽值（键缺席才保留槽值，不只做 `...existing` 保留）。
- `docs/batches/2026-11-13-turn-history-projection.test.mjs`（新，收口删除）与 `test/integration/turn-history-projection.test.mjs`（新，RTM CLI 1-5）。
- `test/rtm/tooling.md`：CLI 1 节注改五态并立 1-5；1-3 的「怎么算通过」改为新跨轮语义。
- 清单外改动（2 档，附理由）：`test/integration/anthropic-tool-roundtrip.test.mjs` 的 1-3 用例——批次 §2「1-3 的恢复后行为改为新跨轮语义」要求同步该用例；`test/rtm/tooling.md` 属清单授权的「CLI 1 增行」面。

**逐条验收对照（`node --test docs/batches/2026-11-13-turn-history-projection.test.mjs` → 6/6 pass）**

| 验收项 | 用例 | 判据落点 |
|---|---|---|
| 当前轮第二次请求仍含完整工具结果 | 投影① | 同一 run 第二次请求里有 `role:"tool"` 结果原文与 assistant `tool_calls` |
| 下一轮无旧工具过程、有请求 / 回复 / 任务状态 | 投影① | 下一轮请求零 tool 消息、零 tool_calls；三条内容都在 |
| 保存恢复同尺 | 投影② | 槽 `contextHistory` 与按 `turns` 重建的机读线逐条同形；槽 history 保留原始工具结果 |
| Continue 续跑 ∥ 异常不折叠 | 投影③ | 撞帽段不登记、账本沿用、整链一条记录；异常轮不登记；下一轮起点只折叠已登记链 |
| 无工具问答任务状态为空 | 投影④ | `turns[0].taskState === null`，线上无任务状态消息 |
| 事实字段来自运行记账 | 投影⑤ | 最终回复声称「什么都没改、测试全过」，记录里 changedFiles 有真实落盘、verification 记 failed |
| `read_history` 可回查 | 投影⑥ | 折叠后与本会话 ∥ 恢复后均取回原始工具结果 |

**命令与结果（本机实跑）**

- `node --test docs/batches/2026-11-13-turn-history-projection.test.mjs` → 6 pass / 0 fail（约 3.6s）。
- `node --test test/integration/turn-history-projection.test.mjs` → 1 pass / 0 fail（真 CLI 两程，约 1.9s）。
- `node --test test/integration/minimal-mode.test.mjs` → 3 pass（50-1 恢复后与 minimal 切换全绿）。
- `node --test test/integration/empty-response-retry.test.mjs test/integration/context-overflow-guard.test.mjs` → 13 pass。
- `node --test test/integration/google-tool-roundtrip.test.mjs` → 1 pass。
- `node --test thincoder-vscode/test/2026-11-06-vsc-turn-save-slots.test.mjs` → 4 pass；`2026-11-13-vsc-work-mode.test.mjs` → 9 pass。
- `node --test test/integration/context-percent-calibrated.test.mjs digest-empty-round.test.mjs turn-cap-progress.test.mjs server-work-mode.test.mjs desktop-work-mode.test.mjs vsc-work-mode.test.mjs` → 11 pass。
- `node --check` 全部维护文件（core 7 档 ∥ VSC 3 档 ∥ 两测试档 ∥ 1-3 用例）通过；`lint` 对 `turn-projection.mjs` 无 issue。

**披露与风险**

1. **`anthropic-tool-roundtrip`（1-1 / 1-2 / 1-3）在本工作区为红，原因不在本批**：空历史、首请求即 `context overflow: prompt ~110504 tokens · max_tokens 32000 · window 128000 (limit 96000)`。用核自己的估算读同一套装配：`contextUsage` 给出 `overhead = 110993`（system 37933 + tools 73060）> `budget.limit = 96000`——**固定开销单独就超过窗口请求线**，与本批改动无关（首请求路径里本批只建了一个账本对象，不改 system / tools / history）。因此 1-3 的语义改动无法在本工作区跑绿，1-5 用大窗模型（`claude-sonnet-5`，1M 窗口）作为夹具前提后跑绿并覆盖同一语义。
2. **「VSC 载荷的 `turns` 落后一轮」作废**（2026-11-13 复核轮更正，父侧裁决 A）：真实时序 = 端壳 `panel-turn-loop.mjs`
   的 `await runAgent(...)` 结算**之前**，核 `runAgent` 的 finally 已跑完 `finalizeAgentTurn` 与 `registerCompletedTurn`
   ⇒ 干净返回处的 `callbacks.onComplete(content, agentState(agent))` 里 `_turns` 已含刚收尾那一轮；`onDistilled` 用的是
   onComplete 捕获的 `lastAgentState`，同不落后。故本处无需生产代码改动，只补一条常驻回归（VSC 槽测试 B5）。三份读数见本节
   「复核轮记录」。
3. **压缩 × 恢复**：`turns` 存在即按轮记录重建（SESSION §2 单点），压缩摘要因此不会进入恢复后的机读线——轮记录比摘要小，但这是与「恢复保留压缩收益」的一处口径差，属设计既定顺序的后果，未擅自改判据。
4. **折叠行锚点 = 本轮用户输入**（不是 `prepareRun` 之前的整段）：输入之前的运行注入留在机读线。理由 = `minimal-mode` 50-1 断言「切换模式不重写历史、不新增文档注入」依赖上一轮注入行仍在；本批目标（工具过程跨轮不入）不受影响。副作用：这些注入行仍按既有行为逐轮累积（本批不改）。
5. 单元测试档按纪律收口删除；集成档 `test/integration/turn-history-projection.test.mjs` 常驻（RTM CLI 1-5 已立号）。

### 复核轮记录（coder 座 · 2026-11-13 · 载荷时序复核 + VSC 常驻回归）

**结论**：上节披露 2「VSC 载荷 `turns` 落后一轮」不成立，本条作废。真实时序：端壳 `panel-turn-loop.mjs` 在
`await runAgent(...)` 的**返回处**调 `onComplete`，而核 `runAgent` 的 finally 在 promise 结算**之前**跑完
`finalizeAgentTurn` → `registerCompletedTurn`（`thincoder-core/agent.mjs`）——`agent._turns` 此刻已含刚收尾那一轮。

**三份实测读数（本轮本机）**

| # | 驱动面 | 读数 |
|---|---|---|
| 1 | 核 `createAgent` + 一轮 `runAgent`，返回处取 `agentState(agent)` | `_turns` 1 条，载荷 `turns` 1 条 |
| 2 | 端壳 `buildTopLevelAgent` 形（删五个轮载体）跑两轮，逐轮在 onComplete 点取载荷 | 1 → 2 条；最新一条 `userRequest` = 本轮输入 |
| 3 | 真 `panel._saveLines(fullHistory, history, { seed, ...agentState })` 落槽 → 核 `applySession` 开同一槽 | 槽 `turns` 1 → 2；CLI 机读线无 tool 过程，最后一轮请求 ∥ 回复 ∥ 任务状态都在 |

**生产代码：零改动**。`thincoder-core/agent.mjs`、`agent/turn-loop.mjs`、`agent/turn-projection.mjs`、
`panel-turn-loop.mjs`、`run-helpers.mjs` 本轮一行未动；B 案（把落槽 `contextHistory` 改成投影行）按父侧裁决不做
——那属新面且会动 CLI 的回退路径。

**回归用例**（常驻）：`thincoder-vscode/test/2026-11-06-vsc-turn-save-slots.test.mjs` 新增 B5——载荷 `turns` 的
最新一条 = 刚收尾这一轮（落后一轮即 0 条）；VSC 存槽后用核 `applySession` 打开的机读线无工具过程、最后一轮的
请求 ∥ 回复 ∥ 任务状态都在；两轮链路各断一次。夹具 = 真核 `runAgent` 打本机假 SSE 端点 + 真 `ChatPanel._saveLines`。

**判别力自检**：把载荷改成「跑之前先取 `agentState`」（模拟落后一轮）⇒ B5 红，报「实得 0 条」；改回即绿。

**命令与结果（本轮实跑）**

- `node test/run.mjs`（cwd = `thincoder-vscode`）→ 48 pass / 0 fail（含 B1–B5）。
- `node --test thincoder-vscode/test/2026-11-06-vsc-turn-save-slots.test.mjs` → 5 pass / 0 fail。
- `node --test docs/batches/2026-11-13-turn-history-projection.test.mjs` → 6 pass / 0 fail。
- `node --test test/integration/turn-history-projection.test.mjs` → 1 pass / 0 fail。

代码评审（f0100a0a）通过，🔴 0；三项非阻塞发现已处理：① SESSION §2 字段清单补 turns；② run-helpers.agentState 在核未惰性建立 `_turns` 时返回 null 而非空数组，避免 saveLines 的「内存即权威」支把槽既有轮记录写空；③ VSC setup.buildTopLevelAgent 补齐 `_turns/_turnLedger/_turnPending/_turnStartLen/_turnResponseEnd` 五载体，与核 createAgent 同形。

## §6 验证与收口（父代理）

验收 = 批内单测 6/6（投影①②③④⑤⑥）；CLI 1-5 集成 1/1；VSC 48/48；minimal-mode 3/3；empty-response-retry ∥ context-overflow-guard 13/13；google-tool-roundtrip 1/1。父侧已复跑批内、集成与 VSC 三组关键读数，与子代理报告一致。

环境预先红 = anthropic-tool-roundtrip 1-1/1-2/1-3 在本工作区空历史首请求即红：固定开销 system 37933 + tools 73060 = 110993 超过该夹具 limit 96000，与本批改动无关。已裁定不改其断言，仅同步 1-3 的文档通过条件；本批行为证据以 CLI 1-5 为准。

风险 = VSC 的 onDistilled 无独立 turns 用例（与 onComplete 共用 lastAgentState，已披露）；B5 用真核 runAgent + 假 SSE 端点夹具，非真 VSC 窗口手跑。

评审 = 设计评审轮次 3 通过（🔴 0）；代码评审通过（🔴 0），三项非阻塞发现已修并复跑。
