# agent 主循环（AGENT-LOOP）· 设计

> 需求 = `docs/core/requirements/AGENT-LOOP.md`。
> 最近先例：`PORTABILITY.md` 的会话锚与 `ADVISOR-CONVERGENCE.md` 的确定性状态。对齐 = core 单源、宿主注入。
> 勘察证据：已读主循环、异步、子代理、上行分面及当前工具契约。相关 = 调度、写序、投递与权限。

## 1. 归属

本档负责 runAgent、装配、工具调度、完成守卫、Stop、会话锚和共享资源。其他三档负责子代理、异步池和上行细节。

## 2. 模块地图

| 模块 | 职责 |
|---|---|
| agent.mjs | runAgent 编排与状态工厂 |
| agent/run-start.mjs | beginRun、resume 状态与起跑注入 |
| agent/turn-loop.mjs | 模型轮、循环头投递、工具批与撞帽 |
| agent/chat-call.mjs | 单次模型调用与流式规则 |
| agent/assemble.mjs | 配置、provider、memory、工具与依赖装配 |
| agent/setup.mjs | prepareRun、system prompt 与上下文 |
| agent/family-tools.mjs | depth/role/mode 工具面 |
| agent/dispatch*.mjs | 预审、权限、执行、hooks 与结果 |
| agent/completion.mjs | 零工具回合守卫 |
| agent/run-stages.mjs | finally 收尾、Stop 与 guard 继承 |
| agent/post-turn.mjs | 停滞、goal 与到期后处理 |
| agent/suspension.mjs | 挂起驱动核 |

## 3. runAgent

签名保持当前调用契约。骨架：

```text
beginRun → prepareRun → runTurnLoop → finalizeAgentTurn
```

每轮先检查中止与安全点压缩，再消费当前允许的输入，调用模型，执行工具或进入完成守卫。

resume 保留写序、 touched、verify、advisor、空响应和必要提醒状态；新 run 才重置。autoTurn 不添加普通用户输入。

撞帽使用 ContinueError。用户 signal.aborted 优先，不开启新模型轮。子代理撞帽按 TURN-CAP-CONTINUE 挂起并等父处置。

## 4. 装配与上下文

### 4.1 system 稳定面

system 包含角色槽、spawn 级固块、项目指令和技能清单。相邻请求的相同 agent 前缀保持稳定。

逐轮变化的 git、记忆、文档、当前时间和宿主状态走 user 上下文，不放进稳定 system。

### 4.2 注入面

- git 与目录快照只在 depth-0。
- 项目指令按不可信内容包裹。
- 记忆召回只在 depth-0 非 resume。
- 文档检索本仓与 index.publicRepos 声明源分别取当前配额。
- repomap、用户输入和图像按能力装配。
- 子代理零 git 快照，文档坐标由 spawn 固块提供。

### 4.3 会话锚

assembleAgent 必须接收 cwd。agent.cwd 是该会话项目身份的单一来源，不以宿主 process.cwd 作通用兜底。

各端在 adapter 决定 cwd：CLI 取启动目录，Desktop 取当前项目，ACP/VSC/Server 取会话请求或项目声明。

## 5. 工具调度

### 5.1 预审

依次处理参数与工具存在性、planMode、工程写门、批次绑定、冻结窗、权限与 PreToolUse。

具体写权由 PORTABILITY、CROSS-REPO-WRITE、ADVISOR-GUARDS 和 TOKEN 文档定义。

### 5.2 执行

只读和明确可并行的工具可并行；副作用工具打断批次并保序。执行前按 undo 规则快照。

权限询问先收齐同批符合项，支持整体或逐项。没有 handler 时按当前 fail-closed 规则处理。

### 5.3 结果

工具结果按 TOOL-OUTPUT-LIMITS 截断或落盘。console 捕获有界，截断有标记，并纳入最终 offload 计算。

action 级分类覆盖 subagent、batch 等单工具多动作面。只读、控制和副作用不能共用一个模糊标记。

### 5.4 reasoning echo

assistantToolCallMessage 统一构造工具轮 assistant 消息。reasoningEcho=required 时恒带 reasoning_content，空推理为空串；其他族不带。

## 6. 完成守卫

1. 空响应：isSubstantiveResponse 统一判空与复位。正文或 toolCalls 任一存在即实质；连续空响应达到当前上限后失败。
2. pending task：按池状态和当前推回预算提醒。
3. verify guard：普通模式 opt-in，工程模式由流程链承担。
4. advisor guard：普通模式 opt-in，不完整或 stale 不算覆盖。
5. 通过后提交 assistant 正文并结束。

guard 到顶时必须诚实披露未验证或未评审，不静默宣称完成。

## 7. 回合后处理

停滞检测比较工具与参数签名；goal 注入当前目标和预算；设计角色与零产出提醒按各自分面。

designer 的轮次提醒使用链内累计轮号，不以续跑段内编号代替。

## 8. Stop 钩子

finalizeAgentTurn 在 depth-0、非用户中止时触发 Stop。reason 为 done/maxTurns/error，turn 取链内累计值。

Stop 位于收尾前段并 fire-and-forget。PreToolUse 可阻断；PostToolUse/Failure 不阻断。

## 9. digest 与内存

digest-budget.mjs 统一各族的轮累计预算、超限记账和完整报告落盘。

子代理历史复用主窗口；_capturedOutput 使用有界头尾截断。注入完成后释放 childAgent；会话态 report 保留到销账或升级。

## 10. 普通模式审计

主 agent 对照用户指令、负责设计档和实际文件验证 coder 交付，不增加另一次 LLM 审计。实现偏差先修正，真实设计漂移或超范围交给用户。

## 11. 关键决策

| # | 决策 | 理由 |
|---|---|---|
| D-AL1 | guard 用提醒与 continue | 给模型修正机会，预算到顶诚实退出 |
| D-AL2 | 探索与评审零 git | 当前文件比历史快照可靠 |
| D-AL3 | 顶层异步 | 防止阻塞主会话 |
| D-AL8 | 挂起在交互驱动层 | runAgent 保持单次执行不变式 |
| D-AL20 | digest 预算共享 | 防止各族规则漂移 |
| D-AL28 | 实质响应复位连续空计数 | 计数语义与实现一致 |
| D-AL29 | 复位在取得响应后 | 覆盖正文与工具两条路径 |

## 12. 验证

验证主循环的中止、续跑、空响应、工具权限、结果预算、Stop、system 稳定性、cwd 和各端装配。具体异步与子代理用例由分面负责。
