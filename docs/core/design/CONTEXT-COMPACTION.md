# 上下文压缩与文本预算（CONTEXT-COMPACTION）· 设计

> 需求 = `docs/core/requirements/CONTEXT-COMPACTION.md`。
> 最近先例：`ADVISOR-GUARDS.md` 的可用窗口预算、`SESSION.md` §2 的槽写面与恢复次序、`turn-projection.mjs` 的轮投影（投影 ∥ 折叠 ∥ 恢复三面在 `turn-projection.mjs`，轮事实账本与任务状态组装在 `turn-task-state.mjs`）。对齐 = 同源预算、记录不丢、一个面一处实现；「同源预算」的射程不含 advisor 的评审预算，那是 §2.1 的明确排除。
> 勘察证据：已读触发、切割、降级、context 工具、预算和恢复决策；轮投影三面（验证面成员 `VERIFICATION_TOOLS`、原文通道 `capText`、槽机读副本的 transient 处置与恢复次序 `saveSession` ∥ `restoreMachineFromTurns`）。相关 = 当前 context 工具三动作、轮投影三面。

## 1. 双线与安全点

history 是机读线；_fullHistory/fullHistory 是完整记录。压缩只动机读线。

安全点要求 history 尾为 user/tool 等完整交换边界。assistant(tool_calls) 与其 tool 结果必须成对保留或进入摘要。

### 1.1 轮次机读投影

运行轮使用完整 history。该轮内的 assistant(tool_calls) 与 tool 结果原样进入下一次模型请求，不能在执行中途抽掉。

回合完成后，core 把该轮折叠为：

```text
{ userRequest, finalResponse, taskState }
```

后续请求不再装入该轮的 tool_calls/tool 结果；它们仍留在 _fullHistory/fullHistory 和记录 sidecar。折叠以整组为单位，不产生孤立 tool 消息。

用户请求与最终回复逐字入轮记录，没有长度上限。机读线的容量由「本轮工具过程退出」控制，不靠丢用户与模型的原文；截断过的记录是一条静默不同的轮记录，事后无从分辨是被截断还是原本如此。

§4 的 shrinkOversized 不是这条的例外，两条按对象切开：它只在无中段时生效，改的是机读线里单条超限消息的副本。

`context-degrade.mjs` 按 copy-on-write 重建，人读线与 `_fullHistory` 保留原文；轮记录里的 userRequest ∥ finalResponse 逐字不动——「截断过的轮记录」它产生不出来。

上限只留在摘要面：命令与结果摘要单行折叠到 `SUMMARY_CAP` ∥ `COMMAND_CAP`（`turn-task-state.mjs`）。这是两个面，不是一条「文本预算」——需求 §4 的「机读 history 可摘要、截断或 prune」说的是摘要面，用户与模型的原文不在其中。

taskState 是持久化对象，至少包含：

| 字段 | 来源 |
|---|---|
| objective / status | 当前任务与运行完成状态 |
| changedFiles | 本轮真实文件变更面 |
| changedDocs | 本轮真实改过的设计/需求档（同一落盘面按调用方声明的文档根过滤；只给位置，不摘录理由）。未声明文档根 ⇒ 该字段不出现，不写空数组——空数组与「本轮没改文档」同形，读的人分不出是没改还是没声明根 |
| verification | 实际执行命令（bash、execute）的调用参数与结果摘要；verify 只转述模型自述，不计入 |
| evidence | 测试、批次、日志或其他可回查位置 |
| remaining / blockedBy | 未完成事项与阻塞原因 |

决策指向只指路不摘录：`changedDocs` 记的是路径，不是模型自述的改动理由。理由由模型写进机读线就成了第二个事实源——它会与设计档里的写法分叉，读的人分不清哪份是当轮的判断；要判断为什么改，按路径读档。

verification 面只收真正执行过命令的工具（bash、execute）。
一个把模型自述转述成「结果」的工具不进这个面：下一轮读到的每条验证结果都必须能追到一次真实执行，否则自述与执行事实在机读线上不可分辨。

状态由运行记账和实际工具结果组装，不能让模型凭最终回复反向编造。没有工具活动的简单问答允许 taskState 为空。

保存和恢复槽时保留 taskState 与各轮 userRequest/finalResponse；重新打开会话后按同一投影构造机读 history。需要完整过程时通过 read_history 读取人读线，不把原始工具输出重新常驻注入。

槽里的 `turns` 是机读线的权威源，机读线（contextHistory）是它的派生副本：保存按同一投影产出、恢复按同一投影重建，两个方向同一把尺，不是两份状态。写槽次序、副本里 transient 标记消息的处置和旧槽的回退次序，归 `SESSION.md` §2。

压缩重建整个机读数组后，在途段起点按消息身份重定：压缩前记下 `_turnStartLen` 指向的那条消息对象，重建后在同一数组里找回它的下标；找不回（该条已进摘要）⇒ 起点取注记与占位之后的第一条原文。

找不回不是假想：尾部受 history 段窗口比例预算约束（§4），在途段长过该预算时切点落进它内部，起点那条随之进中段，重建后按身份自然找不回。

原因：旧下标落在新的、更短的数组上是另一条消息，在途段会从轮中间起切或整段漏掉，槽里的机读副本与恢复面随之一起失真。终点在轮循环返回处才采集，压缩先于它发生，不受影响。

折叠在安全点的 no-op 也要留痕：存在待折项、却在机读线上定位不到待折段 ⇒ 不折叠、清掉待折项，并往会话事件日志（`logEvent`）记一行说明原因。

可达场景 = 轮内被压缩过一次：压缩把该轮的消息换成注记之后，轮尾登记的那批消息对象已不在机读线上，下一次安全点的折叠因此定位不到待折段。原因：静默返回与「已经折过」在日志里同形，多留在跨轮线上的那一轮工具过程事后没人查得出来。

## 2. 请求预算

### 2.1 有效窗口

有效窗口 = 本 run 参与预算算式和一切上下文百分比分母的输入窗口。它由模型的真实窗口经工作模式策略收敛得到，是策略值，不是模型事实。

```text
有效窗口 = tiny 档 ? min(模型窗口, 262144) : 模型窗口
```

模型窗口仍只由 providerSpec 回答（五级链见 PROVIDER.md §6.15），本档不改它。tiny 关闭后有效窗口逐位回到模型窗口；normal 与 engineering 不设任何上限；模型自身窗口小于 262144 时取模型窗口。

单点实现 = `thincoder-core/window-policy.mjs` 的 `effectiveWindow(provider, workMode)`：窗口派生的一切读数（threshold ∥ limit ∥ 尾部两式 ∥ 百分比分母）全从它取，端侧不另立算式。

advisor 不在本射程，这是明确排除而不是漏项。

`advisorContextBudget(provider)`（`thincoder-core/advisor/compaction.mjs`）自算 `usableWindow(spec.context, outputReserve(provider, spec))`：它按自身模型的窗口现算评审预算，没有 workMode 这个输入维度，也不看主会话的槽。

把它拉进单源，得先给它一个它没有的档位维度，代价大于收益。代价写在这里供推翻：tiny 会话里跑评审时，advisor 的评审上下文不受 262144 约束。

需求三条是这条策略的来处：`docs/core/requirements/CONTEXT-COMPACTION.md` §2 的「有效窗口 = `min(模型窗口, 262144)`」∥「切换档位即生效与解除」∥「一切以窗口为分母的量同取有效窗口」。本节是它的设计落地，不重述需求原文。

### 2.2 两个预算出口

同一份算式有两个出口，区别只在窗口取哪一边：

- `requestBudget(provider, spec)` 取模型窗口，供 `provider/core.mjs`（OpenAI 兼容面）∥ `provider/anthropic.mjs`（Messages）∥ `provider/google.mjs`（generateContent）∥ `provider/responses-request.mjs`（Responses）四个发送面读 maxTokens——max_tokens 是输出合同，不受输入窗口策略影响。
- `policyBudget(provider, spec, workMode)` 取有效窗口，供压缩阈值、stats、发送前守卫读 window ∥ usable ∥ threshold ∥ limit；maxTokens ∥ maxTokensSource ∥ reserve ∥ windowSource 逐位转交 `requestBudget`，不另算。

```text
reserve = actualMaxTokens ?? spec.maxOutput
usable = usableWindow(window, reserve)
threshold = min(usable, floor(window × 0.6))
limit = window - reserve，退化档按当前 threshold 地板
```

显式 compactThreshold 优先；auto 派生只写运行时 compactThresholdResolved，不回写用户配置。

上述四个发送面使用同一 maxTokens；stats、守卫和压缩使用同一预算对象——window ∥ usable ∥ threshold ∥ limit 同源，不各算一套。

### 2.3 缺参即拒

`workMode` 是必填参数，`effectiveWindow` ∥ `policyBudget` ∥ `resolveCompactThreshold` ∥ `keepTailSize` ∥ `tailBudgetTokens` ∥ `historyReading` ∥ `historyPercent` 一个默认值都没有：值不在 WORK_MODES 里，就在入口拒绝并点名 `workMode`（薄转口 `historyPercent` 由 `historyReading` 那一层抛）。

理由：默认值把「忘传」静默成一条不下上限的窗口，压缩线随之上移，人要等到账单才发现；一个能在入口喊出参数名的拒绝，比一条静默放行的默认便宜。

握有 agent 的面用 `resolveWorkMode(agent.config?.agent)` 自己取模式；只握有 provider 的面把它当参数透传。本仓只握 provider 的透传面有三处：

- `thincoder-vscode/src/specs.mjs` 的 `ctxUsageForHistory` ∥ `ctxPercentForHistory`——宿主只给 history ∥ provider ∥ ratio。
- `thincoder-core/session-lifecycle.mjs` 的打开态读数：`historyPercent(line, provider, sampleRatio(data.estimateSample, provider), workMode)`。
- `thincoder-core/token-window.mjs` 的 `collectStaleToolOutputs(history, provider, workMode)` 向 `keepTailSize` ∥ `tailBudgetTokens` 透传。

## 3. 估算与样本

contextUsage 有实测时使用 `_lastPromptTokens + 增量估算`，否则估算完整 history 加 system/tools。

估算使用当前加权函数。自校准样本带估算器版本与模型键，随会话槽保存和恢复；不匹配时不复用。

校准比有下界，承载者是 `sampleRatio` ∥ `recordTokenSample`（`thincoder-core/token-window.mjs`）：两处同取 `Math.max(1, num / den)`。

样本坏或不在场时回中性值 1。偏差方向已知是估算偏低，所以比降到 1 以下会把该压的格判成不该压。

这是需求 §3「比例不得低于当前安全下界」的落点：下界就是 1，不是一个另配的常数。

压缩、恢复、prune 和结构变化后使实测基线失效。

## 4. 切割与降级

tail 先按当前条数公式得到候选，再受 history 段窗口比例预算约束。两条公式同取有效窗口（§2.1）：窗口被 tiny 压小，尾部跟着变短，不另立一套尾部规则。预算不足时保留当前最近消息保底，配对安全优先。

KEEP_HEAD=0；旧任务进入摘要而非原文锚定。

降级链：

1. LLM 摘要。
2. 连续失败达到当前上限后确定性 fallback。
3. 无中段时 shrinkOversized 截断单条超大内容：改的只是机读线里那条消息的副本，轮记录与人读线保留原文（§1.1）。

失败有可见状态，不阻塞完整记录。

## 5. 触发与越窗

普通阈值触发要求：

```text
usage.total > threshold && post(plan) <= threshold
```

post 使用真实切割计划、注记、tail 和固定开销估算。force 跳过该早退，但不跳过发送前真实预算守卫。

enforceContextFit 在发送前检查 usage.total > limit，可强压一次；仍超则 context_overflow，不发请求。

固定开销（system + tools）单独越过 limit 时压缩无解：history 归零后 total 仍等于固定开销。这一格在强压之前判——`contextUsage` 给出的 `fixedFloor` = 固定开销按当前估算比缩放，与估算支同一把尺。

判中即抛 typed error：`kind` 仍为 `context_overflow`（同一种条件一个 kind，端侧不必多认一类），`reason` = `overhead_exceeds_limit`，报文给固定开销、limit、window 三数，并说明压缩解不了、只能降 max_tokens ∥ 换更大窗的模型 ∥ 减 system 与 tools 声明。

这一格不是假想：本仓自己的固定开销就已越过 128K 窗格模型的请求上限——依据 `test/integration/turn-history-projection.test.mjs`「本仓当前固定开销（system + 工具 schema）已超过 128K 窗格模型的请求上限」，那份夹具正是为此改用大窗格模型。

不能靠压缩兜底的原因：压一次白付一次摘要请求，压完仍抛同一个错；而报文若把方向指到会话内容上，用户会一直 /compact。同一判据也拦强制压缩（`force` 跳过阈值却跳不过这条）：守卫面照上面抛，`/compact` 面按 no-op 回执报同一原因，不再发摘要请求。

会话标题不在这份固定开销里，也不动 `fixedFloor`：`contextUsage` 的 overhead 只有 `system` 与 `tools` 两项（`const system = extras.systemPrompt ? estimateText(extras.systemPrompt) : 0`、`const overhead = system + tools`）。

`assemblePrompt(scenario, mode)` 组 system 时不读会话标题；标题实体是 `agent.title`，落在槽头、会话索引、状态行与通知载荷上（`notify-policy.mjs` 的载荷取 `agent.title`），请求面读不到它。

标题的文本预算是它自己那条生成请求：输入是首条用户消息，输出上限 `MAX_TITLE_TOKENS` = 100 与 `extract(data)?.trim().slice(0, 40)` 的 40 字符截断（`thincoder-core/generate-title.mjs`）。

这是需求 §1「本档只管标题所占的文本预算」的落点：标题怎么来归 `SESSION.md` §8，它占多少文本由一个常量加一次截断回答；与会话请求的固定开销是两把尺，不同量也不同名。

服务端越窗 400 按当前自适应链压缩并重试一次；二次失败显式报错。compress/distill/续写等止血内部请求按当前豁免处理。

## 6. 摘要与恢复

SUMMARIZE_PROMPT 保留当前任务、决策、文件、未决和约束。摘要调用不接 onToken/onReasoning。

长度目标是摘要指令里的一句话，不是一次硬切。

`SUMMARIZE_PROMPT`（`thincoder-core/context.mjs`）要求「Stay under ~1K tokens (≈1000 Chinese chars / 4000 ASCII chars) — a hard target」，并给出超预算时的收紧次序：已完成项压成一行、文件 why 注压成裸路径、进行中散文收紧；设计锚点与未决项不许砍。

同一目标在估算面单源承载 = `SUMMARY_TOKEN_ESTIMATE`（`token-window.mjs`），可达性门的 `post` 用它算注记成本。

这是需求 §4「摘要有当前长度目标，但不靠硬切丢尾部」的落点：目标管摘要自身篇幅，尾部由切割判据保护，两者不是同一条预算。

压缩成果必须能落槽：中段换成摘要注记之后，槽保存的是 `note` 原文 + 它已覆盖的前 `turnsCovered` 条轮记录，恢复按 `SESSION.md` §2 的次序拼成「摘要 + 其后轮次投影 + 在途段」。键形 `compactCheckpoint` = `{ note, turnsCovered }` 与在途段的写面归 `SESSION.md` §2；内存载体是 `agent._compactCheckpoint`（同形，无压缩 ⇒ 不设）与 `agent._turnFoldMarks`（折叠时登记的轮记录消息对象身份——压缩按它判一条消息是否已进中段）。

原因：槽里的机读线由 `turns` 投影重算，压缩成果只活在内存里 ⇒ 重启后摘要消失、被摘要掉的轮记录整条投影回来，压缩白做一次，摘要里的决策与未决点随进程一起没了。

摘要是「此前的机读线被压过」这一个事实，不是第二条事实源：轮记录仍是权威面，被覆盖的轮留在 `turns` 里供人读回查，机读线不再装它们。覆盖以轮记录为单位——该轮登记的全部记录消息都落在切割点之前才算覆盖；一轮被切开 ⇒ 该轮不记为已覆盖，恢复时宁可多装一轮，也不把半轮当整轮。

判据不写固定条数：`turnRecordMessages`（`agent/turn-projection.mjs`）按字段条件 push——`userRequest` ∥ `finalResponse` 非空各一条、`taskState` 非空一条。

无工具的简单问答因此只有两条（§1.1「没有工具活动的简单问答允许 taskState 为空」）。钉成三条会把这种轮永远判成未覆盖：恢复时它整轮重装，摘要已覆盖的轮又回到机读线。

tail 首条 assistant 的回声占位按当前 copy-on-write 规则并入；恢复读取时归并病态相邻 assistant，tool_calls 配对优先。

恢复装线前还要做一次配对收口，两支各有来由：

- 尾部没有工具结果的 `assistant(tool_calls)` 不装。来由是一次普通的 Stop（Ctrl+C）落在工具执行中：本轮的 `assistant(tool_calls)` 已经提交进机读线，工具结果要等工具批返回之后那一步才提交。
  中止先从工具批里抛出，不会变成一条工具错误（`dispatch-run.mjs`「User interrupt (Ctrl+C / Ctrl+I) must propagate, not become a tool error」，落地为 `if (signal?.aborted) throw error`）；补占位结果的那一段排在工具批之后（`turn-loop.mjs` 的 `const results = await executeToolCalls(...)` 之后才是 `if (signal?.reason?.interrupt)`），批里抛出的中止让那一行走不到，占位结果补不上。`interrupt` 标志只决定「批正常返回后补不补占位」，不决定「中止是否以抛出离开批」——Ctrl+C 也带它（`key-handler-ctrlc.mjs`「state.controller.abort({ interrupt: true })」）。
  回合随即异常收尾，CLI 的回合尾保存照旧落盘（`agent-turn.mjs`「Save session after every turn (survives crashes)」），槽里的在途段尾就是这条没有结果的调用。装进去等于让模型看到一条没有回复的调用，首个请求必 400。
- 前面没有对应调用的 `tool` 消息不装。这一支没有写侧来由，按槽数据归一处理：在途段读自盘上的槽，与 `turns` ∥ `compactCheckpoint` 同属不可信输入，同一个归一姿态（`normalizeSlotTurns` ∥ `normalizeCheckpoint`「槽是盘上用户数据，本函数不抛」）。

这两种消息的原文仍在人读线，`read_history` 取得到；丢掉之后机读线尾落回完整交换边界，尾部那一支落在本轮用户请求上，仍是 §1 要的形。

压缩和蒸馏请求复用会话 system、真身中段、同声明 tools、同源 reasoningEffort 和尾部指令，不把记录文本再序列化成全新会话。

## 7. context 工具

准入 = depth-0。装配面是 `thincoder-core/agent/family-tools.mjs` 的 `depthOnly` 段（`const depthOnly = depth === 0 ? [...]`），其中同时挂着 `readHistoryTool` 与 `contextTool`；depth>0 的各角色段不挂这个工具（`agent-tools/context.mjs` 头注「**depth>0 不给**」）。

判据按装配段算，不逐角色算：这三个动作的准入由装配段一处决定，各角色段不会各自再判一次。

为什么不给：需求 §6 给的理由是没有全史回查面——而这三个动作的回执都指向全史（`compact` 给槽文件路径或 cwd 发现面，`prune` 说全文仍在盘上、需要时重跑工具）。没有那个面，回执给不出可取回的位置。

阈值兜底不受准入影响：自动压缩跑在 `runCompactionCheck`（`agent/run-stages.mjs`）的安全点上，不经过工具面——没有 `context` 工具的子代理照旧按阈值被压，只是不能主动触发。

### 7.1 stats

从同一 contextUsage/requestBudget/historyReading 取数。窗口占用、压缩线、请求预算和状态行历史读数分别具名，不混用分母。

### 7.2 prune

collectStaleToolOutputs 选择保护尾外、达到当前最小额度的 tool 消息。原位替换 content 为 stub，不改数组、索引、tool_call_id 或全史。

prune 后基线失效；回执给出释放量、跳过项和全史位置。

### 7.3 compact

工具只写 _pendingCompact={focus,at}。下一安全点消费并清槽，以 force+focus 调 compressIfNeeded。

focus 自动附当前 task/goal。成功不另落重复注记；no-op 与失败有可见回执。

回执包含槽文件 read_history path 或 cwd 发现面。

## 8. 探索蒸馏

summarizeRunExplorations 在 run 最终返回前处理本轮探索突发，把配对结果替换为 Exploration summary。

失败保留原机读线并跳过；全史不动。与自动压缩相互独立。

## 9. 呈现

onCompressStart/onCompress/onCompressFail 是核回调。TUI 面板、VSC 状态行和 Desktop 行组只呈现生命周期，不显示摘要正文。

需求的五态各由一个回调产生，端侧不另造事件：

| 态 | 由什么产生 |
|---|---|
| 开始 | `onCompressStart({ messages })`——摘要请求发出前触发（`context.mjs` 的 `callbacks?.onCompressStart?.({ messages: middle.length })`） |
| 进行中 | 核不发第二个事件：宿主在开始态上按流逝时间渲染（CLI `ensureCompressPanel` 的 elapsed 计时），不新开通道 |
| 成功 | `onCompress(info)` 且 `info.mode !== "fallback"` |
| 降级 | `onCompress(info)` 且 `info.mode === "fallback"`——连续失败达 `COMPRESS_FAILURE_LIMIT` 后 `degradeIfCompressExhausted` 走 `compressFallback`，回执用同一回调、同一载荷位 |
| 失败 | `onCompressFail(error)`，单次失败即发 |

失败与降级不是同一件事：失败可以先来几次，达到上限那一步才降级；两个态各有自己的回调，端侧不必从失败次数反推降级。

headless 没有回调 ⇒ 全链可选链（`callbacks?.onCompressStart?.` ∥ `callbacks?.onCompress?.` ∥ `callbacks?.onCompressFail?.`）⇒ 安全 no-op：压缩、降级与失败计数照常执行，只是没人接收。

## 10. 验证

验证安全点、配对、预算公式、auto 配置、可达性门、强制面、越窗一次重试、估算样本恢复、prune 配对、主动压缩回执、恢复回声、全史不变、压缩检查点的落槽回读、恢复播种后的第二次压缩、压缩后的在途段边界重定、在途段尾端孤立的调用与结果的收口，以及固定开销单独越线的 typed error。
