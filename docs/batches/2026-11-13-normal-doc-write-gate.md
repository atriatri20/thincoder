# 2026-11-13 · normal-doc-write-gate
> 六段，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（主 agent）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（实施者：主 agent ∥ coder）· §6 验证与收口（父代理）。
> 每段只有一个作者：作者的段可 `append` 加内容、可就地改（`edit`）；非作者一概拒。
> 编制：主 agent · 2026-11-13 · 来源 = 用户 2026-11-13：「文档内容写门普通模式下不要拦截。」并在范围说明后确认。
> 台账 = #2392（core · 归批）。前情 = 无（独立批）。
## §1 讨论（主 agent）
**状态行**：已收口 2026-11-13
批起 sha = 4bbc3d3014dbbd53f6d8d568f58565eebb547725
<§1 模板占位：本批条目 / 关键判据 / 授权口径>

目标 = 普通模式下不拦截文档内容写门；工程模式维持现状。覆盖普通 `.md` 写盘与批档 append/edit 两个入口。

证据 = `writeThroughPath` 对所有 op=write 调 `runDocWriteGate`，`runBatchGate` 对 append/edit 无条件执行 doc gate；两处均无模式判断。

另一路未拦的已知合法来源 = 无项目、非声明文档目录、排除前缀、逐字未变，以及不经写门的 bash/execute 写径。未拿到另一 Agent 的工具与路径，具体那一例不作定论。

## §2 批次任务与设计（主 agent）
**状态行**：设计完成（普通双写径放行、工程对照和 RTM 增量已明确）

<§2 模板占位：本批条目（覆盖） / 设计档落点 / 机制设计 / 受影响文件与测试覆盖 / 验收对照 / 关键决策 / 上抛项>

<§2 模板占位：机读清单 = 标题行「**受影响文件（机读清单）**」+ 围栏内三列表（表头 | 档 | 分拆方案 | 行数 |、分隔行 |---|---|---|、一行一档，只列代码档（源 ∥ 单测））；第二列：越设计时线的档写正向形方案（点名带目录段的档 + 本批落步 `实施轮` ∥ `§5`），未越线写 —；第三列：该档在批起快照上的内容行数（量法 = `countContentLines`），快照里没有这一档写 `新`；示例行 = | thincoder-core/agent-tools/batch-tier-gate.mjs | — | 新 |>

**设计落点** = `docs/core/requirements/DOC-CHECK.md` F6/F10 与 `docs/core/design/DOC-CHECK.md` §9；普通模式边界同步 `docs/core/requirements/NORMAL-MODE.md`。

**最近先例** = `ledgerBindWriteConflict` 以 `agent.config.agent.engineering` 为唯一开关；本批只复用这枚既有配置事实，不读工具参数、不改公共 `judgeText`。

**勘察证据** = 已读普通写门 `writeThroughPath` / `runDocWriteGate`、批档 `runBatchGate`、NORMAL-MODE F6、DOC-CHECK 两个时点及现有 CLI 7 集成夹具；无外部相关源。

**机制**：
- 普通写门：所有内容写点把既有 ctx.agent 放入写元数据；`engineering === false` 时 `writeThroughPath` 不调 `runDocWriteGate`。
- 批档写门：batch-record-write 的 append/edit 在 `engineering === false` 时传 null gate，跳过 `runBatchGate`；其余身份、段写、业务门和 receipt 不变。
- 无 agent 上下文的低层调用保持原行为；工程模式与 doc_check 主动检查、收口检查零改。

**受影响文件（机读清单）**

| 档 | 分拆方案 | 行数 |
|---|---|---|
| thincoder-core/tools/write-path.mjs | — | 125 |
| thincoder-core/tools/edit-batch.mjs | — | 290 |
| thincoder-core/tools/edit-diff.mjs | — | 483 |
| thincoder-core/tools/file.mjs | — | 460 |
| thincoder-core/tools/patch.mjs | — | 388 |
| thincoder-core/agent-tools/batch-record-write.mjs | — | 394 |
| test/integration/doc-write-gate.test.mjs | — | 165 |

**集成增量** = 从 `test/RTM.md` 的 CLI 7 新增 CLI 7-29 与 7-30。前者用真 edit 对同一段 350 字设计档分别跑普通/工程上下文：普通落盘、工程拒且零字节。后者用真 batch append：普通批档长段落落盘、零 gate 行；工程拒绝由既有 CLI 7-21 继续承担。

**验收** = 两条新用例在旧实现的普通侧均红；修后普通放行、工程拒绝。实施轮运行 CLI 7-29 与 7-30 及既有工程对照 7-21；完整集成面只在收口读数报告，不列为每轮硬验收。无真实 Provider 或外部服务依赖。

## §3 设计评审（评审子代理）
**状态行**：评审通过



### 轮次 1（评审子代理）

| # | 严重度 | 状态 | 证据 |
|---|---|---|---|
| 1 | 🔴 | 未解决 | 批档 §2「**验收** = 两条新用例在旧实现的普通侧均红；修后普通放行、工程拒绝；doc_write_gate 与 batch_close_gate 全套回归。」把完整集成面回归写成实施轮验收；实施轮验收应收窄到本批改面的单测档，集成增量在收口行报告。 |
| 2 | 🔵 | 未解决 | 设计档文首「勘察证据：已读需求 F1–F11」未覆盖当前需求 F12 与 AC-19；应更新勘察范围，避免本批核心需求看似未经勘察。 |

VERDICT: changes-required
🔴 1 · 🔵 1 · 🟡 0

### 轮次 2（评审子代理）

| # | 严重度 | 状态 | 证据 |
|---|---|---|---|
| 1 | 🔴 | 已修复 | 批档 §2「**验收**」现为「实施轮运行 CLI 7-29 与 7-30 及既有工程对照 7-21；完整集成面只在收口读数报告，不列为每轮硬验收」，不再把完整集成面回归列为实施轮验收。 |
| 2 | 🔵 | 已修复 | 设计档文首「勘察证据」现为「已读需求 F1–F12」，已覆盖 F12 与 AC-19 所属需求范围。 |

VERDICT: pass
🔴 0 · 🔵 0 · 🟡 0

## §4 用户批准（主 agent）

用户于 2026-11-13 对普通 `.md` 与批档 append/edit 停用内容写门、工程模式保持、双入口对照测试和独立评审的范围明确回复「确认」。

## §5 实施记录（实施者：主 agent ∥ coder）
**状态行**：实施完成（双写径、模式对照和文档同步完成）



实现 = 所有普通 `.md` 内容写点把 ctx.agent 传入 writeThroughPath；engineering === false 时跳过 runDocWriteGate。批档 append/edit 同条件传 null gate，跳过 runBatchGate，其余结构与业务校验不动。

红侧 = CLI 7-29 与 7-30 在旧实现均因 350 字段被拒绝；工程侧对照保持拒绝。

绿侧 = 普通 edit/write 与批档 append/edit 均落盘；工程 append/edit 拒绝且目标逐字不变。doc-write-gate 6/6、batch-close-gate 18/18；相关源码 lint 通过。

## §6 验证与收口（父代理）

验收 = CLI 7-29 与 7-30 普通侧在旧实现均红；修后普通 edit/write、批档 append/edit 放行，工程同笔拒绝且目标逐字不变。doc-write-gate 6/6、batch-close-gate 18/18，lint 与五份受影响文档的 doc_check 均通过。

独立评审 = 设计两项发现修复后第二轮通过；代码首轮补测试覆盖，固定单文件复核通过。

完整回归 = 仓根 node test/run.mjs 仍为既有 10 个失败：11-3、15-1、39-1/2/4、49-1/2/3 和 Docs 三张表；本批新增与相关对照用例均通过，不以完整套件全绿作声明。本批无新债。
