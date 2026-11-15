# 上下文压缩与文本预算（CONTEXT-COMPACTION）· 设计

> 需求 = `docs/core/requirements/CONTEXT-COMPACTION.md`。
> 最近先例：`ADVISOR-GUARDS.md` 的可用窗口预算、`SESSION.md` §2 的槽写面与恢复次序、`turn-projection.mjs` 的轮投影（投影 ∥ 折叠 ∥ 恢复三面在 `turn-projection.mjs`，轮事实账本与任务状态组装在 `turn-task-state.mjs`）。对齐 = 同源预算、记录不丢、一个面一处实现；「同源预算」的射程不含 advisor 的评审预算，那是 §2.1 的明确排除。
> 勘察证据：已读触发、切割、降级、context 工具、预算和恢复决策；轮投影三面（验证面成员 `VERIFICATION_TOOLS`、原文通道 `capText`、槽机读副本的 transient 处置与恢复次序 `saveSession` ∥ `restoreMachineFromTurns`）。相关 = 当前 context 工具三动作、轮投影三面。

## 1. 双线与安全点

`agent.history`（内存里的消息数组）是机读线；`_fullHistory`/`fullHistory` 是完整记录，压缩只动机读线。

槽 JSON 里另有一个同名的 `history` 键，那是人读线、按 slim 存（射程与尺寸见 `SESSION.md` §5）。两个 `history` 不是一份东西：前者逐字，后者只留前段。

安全点要求 history 尾为 user/tool 等完整交换边界。assistant(tool_calls) 与其 tool 结果必须成对保留或进入摘要。

### 1.1 轮次机读投影

运行轮使用完整 history。该轮内的 assistant(tool_calls) 与 tool 结果原样进入下一次模型请求，不能在执行中途抽掉。

回合完成后，core 把该轮折叠成一条轮记录：

```text
{ userRequest, finalResponse, taskState, toolProcess? }
```

最近两轮（大小 = `TOOL_PROCESS_WINDOW`；每轮 = 一次用户指令到执行完成，其间多次模型↔工具往返属于同一轮）的工具过程留在机读线上，更早的折掉。`turn-projection.mjs` 的 `turns` 只作数组名指轮记录数组，轮内往返一律写「模型↔工具往返」，不借用它。

| 轮的位置 | 机读线上的形 |
|---|---|
| 最近 2 轮 | 用户请求 + 该轮工具段（首次调用至最后一个结果，含其间 assistant 文本）原文 + 最终回复 + 任务状态 |
| 第 3 轮及更早 | 用户请求 + 最终回复 + 任务状态 |

`toolProcess` 就是「最近 2 轮」那一行的工具段：该轮原始段里「第一次 `assistant(tool_calls)` 起、到最后一个 `tool` 结果止」的连续切片，按下标顺序，含其间的 assistant 文本消息。整段越预算时首项是那行移出说明（§1.2），其后是从未移出的调用组。

只挑 `role === "tool"` 会留下没有调用的孤儿结果，首个请求必 400（`harvestActiveRaw` 的①支判的正是这一格）。整轮的原始消息一条不少：首条用户指令与最终回复由轮记录自己的字段承载，切口不在切片里重复一份。

只出现在最近 2 轮的轮记录上；逾期即从轮记录上删掉该键，机读线上对应的那几条消息按身份一并摘除。键缺 = 这一轮的工具过程不在机读线上，与「已折叠」同义。窗口大小 = `TOOL_PROCESS_WINDOW`（`thincoder-core/agent/turn-tool-process.mjs`）= 2，是常量不是配置项。

工具段挂在轮记录上，不另存一份：槽里的机读线由 `turns` 投影重算（`SESSION.md` §2），另存一份就是第二个事实源；挂在轮记录上，投影 ∥ 保存 ∥ 恢复三面自动同一把尺，「重启后仍保留」不需要第四条通道。工具段也不落进 `SESSION.md` §2 的 `activeRaw`——那一段是「没有轮记录可依」的在途段，工具段有自己的记录可依。

带 `toolProcess` 的两轮，投影发三到四类消息：用户请求 · 工具段切片 · 最终回复，`taskState` 非空时再加任务状态一条（为空即三类，§6）。工具段切片按消息逐条展开——切片里有几条原始消息就发几条，不是一条。用户请求与最终回复仍各只一份，任务状态是投影现拼的 transient 消息，段里没有它。重启后同一段原文在机读线上只出现一次，多一条就是又开了一个源；`turns` 里那几个字段一个不少地留着，人读回查与压缩覆盖账都读它。

为什么是 2 轮：模型只看得见上一轮的结论、看不见自己跑过什么命令、拿到什么结果，重跑一遍就比回忆已经知道的东西更省事——用户观察到的现象正是「完全不保留工具输出，它调用工具过于频繁」。保留最近 2 轮把循环断在「上一轮刚做过的事」上，同时不让更早的工具过程常驻请求。

折叠以整组为单位，不产生孤立 tool 消息：一条 `assistant(tool_calls)` 与它的全部 `tool` 结果一起进出机读线，只动一边就留下孤立配对，首个请求必 400。

移出机读线不是丢失证据：当轮原文仍在内存的 `_fullHistory` 里。槽里两条线不是一回事，射程与尺寸的单源 = `SESSION.md` §5；保留窗内外的分界见 §1.2 末段（窗内两轮的工具过程逐字在槽里，窗外只剩人读线的 slim 前段）。

逐字是这条保留的全部意义：slim 之后重启读回的工具结果是残片。标记确实说明了它是残片——`thincoder-core/session-segments.mjs` 的 `slimForDisplay` 对 tool 内容截到前 500 字符后拼 `"\n… (truncated for storage)"`，`thincoder-core/session-lifecycle.mjs` 的注记写明被截断的 `arguments` 以 U+2026 结尾，标记按角色分支。但残片就是残片：回查面认得出「被砍过」，认不出被砍掉的是什么。

用户请求与最终回复逐字入轮记录，没有长度上限。截断过的记录是一条静默不同的轮记录，事后无从分辨是被截断还是原本如此——所以工具段的截断与移出各自带标记（§1.2），不靠沉默。

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
| folded | 本回合离开机读线的工具过程：折掉的工具结果条数与估算 token（轮数 · 调用组数作附注）；低于阈值不出现（§1.2） |

决策指向只指路不摘录：`changedDocs` 记的是路径，不是模型自述的改动理由。理由由模型写进机读线就成了第二个事实源——它会与设计档里的写法分叉，读的人分不清哪份是当轮的判断；要判断为什么改，按路径读档。

verification 面只收真正执行过命令的工具（bash、execute）。
一个把模型自述转述成「结果」的工具不进这个面：下一轮读到的每条验证结果都必须能追到一次真实执行，否则自述与执行事实在机读线上不可分辨。

状态由运行记账和实际工具结果组装，不能让模型凭最终回复反向编造。没有工具活动的简单问答允许 taskState 为空。

保存和恢复槽时保留 taskState、各轮 userRequest/finalResponse 与最近 2 轮的工具段；重新打开会话后按同一投影构造机读 history。更早轮次的工具过程通过 read_history 读人读线（`SESSION.md` §5），不常驻注入。

槽里的 `turns` 是机读线的权威源，机读线（contextHistory）是它的派生副本：保存按同一投影产出、恢复按同一投影重建，两个方向同一把尺，不是两份状态。写槽次序、副本里 transient 标记消息的处置和旧槽的回退次序，归 `SESSION.md` §2。

压缩重建整个机读数组后，在途段起点按消息身份重定：压缩前记下 `_turnStartLen` 指向的那条消息对象，重建后在同一数组里找回它的下标；找不回（该条已进摘要）⇒ 起点取注记与占位之后的第一条原文。

找不回不是假想：尾部受 history 段窗口比例预算约束（§4），在途段长过该预算时切点落进它内部，起点那条随之进中段，重建后按身份自然找不回。

原因：旧下标落在新的、更短的数组上是另一条消息，在途段会从轮中间起切或整段漏掉，槽里的机读副本与恢复面随之一起失真。终点在轮循环返回处才采集，压缩先于它发生，不受影响。

折叠在安全点的 no-op 也要留痕：存在待折项、却在机读线上定位不到待折段 ⇒ 不折叠、清掉待折项，并往会话事件日志（`logEvent`）记一行说明原因。

可达场景 = 轮内被压缩过一次：压缩把该轮的消息换成注记之后，轮尾登记的那批消息对象已不在机读线上，下一次安全点的折叠因此定位不到待折段。原因：静默返回与「已经折过」在日志里同形，多留在跨轮线上的那一轮工具过程事后没人查得出来。

### 1.2 工具段的预算与折叠提示

一轮的工具段不是无界的：保留窗（定义见 §1.1，大小 = `TOOL_PROCESS_WINDOW`）× 无上限的工具输出会把请求和槽一起撑大。两道上限，度量尺与预算面同一套——单条按字符，整段按 `estimateTokens`：

| 道 | 常量 | 越限时 |
|---|---|---|
| 单条工具内容 | `TOOL_PROCESS_MSG_CHARS` = 4000 字符 | 头 + 省略数注记 + 尾，总长不超过预算（尾取余量），消息与配对保留 |
| 单轮工具段 | `TOOL_PROCESS_TURN_TOKENS` = 8000 | 从最旧的调用组起整组移出机读线，段首留一行说明移出了几组（时点、载体与终止规则见下） |

截断与移出都自己带标记：模型必须分得清「这次结果是被截断的」与「这次结果本来就这么长」，否则它把截断过的输出当成真实输出的全部，下一次决策就建在一个不存在的读数上。

单条越限取双端，不取纯头：工具结果的结论住在尾部——测试输出末尾是 pass/fail、grep 末尾是计数、构建末尾是错误。纯头截断留下的是命令行回显与前半截噪音，把结论切掉，正好与本保留窗要解决的「认得自己已经拿到过这个结果」相反。

依据 `docs/core/design/TOOL-OUTPUT-LIMITS.md` §2「预览由头部、实际省略数注记和尾部组成；总长度不超过预算。tail 取预算余量，不硬编码固定值。」本仓唯一的截断形状就是这一个，保留窗按同一形状排，不另立一种截法。

实现落在既有构造器上，不另写一份：`buildDualEndPreview(text, budget)`（`agent/offload.mjs`）收总预算，头取 `floor(budget / 4)`、注记报实际省略数、尾取预算余量；两个切点走 `thincoder-core/text-budget.mjs` 导出的 `safeSliceUTF16` ∥ `safeSliceUTF16Tail`——`TOOL-OUTPUT-LIMITS.md` §2 点名的是导出面那两个，一份本地副本就是同一规则的第二个实现。

构造器的契约：`buildDualEndPreview(text, budget)` 的 `budget` 必填、无默认值，非法值即抛并点名该参数——默认值等于替调用方决定这一档裁多少，与「三面同一把尺」相反。

两处调用点都在同一档内：`thincoder-core/agent/offload.mjs` 的 `offloadToolResult`，各自传 `TOOL_RESULT_PREVIEW`（64K，即 `TOOL_RESULT_OFFLOAD_LIMIT` 越限那一支与写盘失败那一支）。拿 4000 去调它得到 4000 的预览，不是 64K。

64K 面逐位不变：`floor(65536 / 4)` = 16384，与现头值相同；尾本就是预算余量。

母版承载同一契约：`docs/core/design/TOOL-OUTPUT-LIMITS.md` §2 写的就是带 `budget` 的构造器、`budget` 必填无默认、两个调用点传 `TOOL_RESULT_PREVIEW`，以及「切点只用导出面这两个」；本档与母版同口径，不各写一套。

本档条目用到的常量与函数名，按三问逐个回答：

- `TOOL_PROCESS_WINDOW` = 2 · `none found:` 查过 `thincoder-core/token-window.mjs`（`TAIL_FLOOR_MESSAGES` = 10 是尾部消息条数地板，`SUMMARY_TOKEN_ESTIMATE` 是摘要篇幅目标，`PRUNE_MIN_TOKENS` = 200 是 prune 的逐条门槛——都不按「轮」计数）∥ `thincoder-core/agent/turn-projection.mjs`（`turns` 只作数组名，无保留轮数常量）。没有既有的「保留几轮」这一维。大小为什么是 2，理由在 §1.1「为什么是 2 轮」；本条只答有没有现成的。
- `TOOL_PROCESS_MSG_CHARS` = 4000 · `existing but unusable:` `thincoder-core/agent/offload.mjs` 的 `TOOL_RESULT_PREVIEW` 与 `TOOL_RESULT_OFFLOAD_LIMIT`（都是 64×1024 字符，前者是单条结果在当轮机读线上的预览总预算）∥ `slimForDisplay` 的 500 字符（人读线存储尺寸）。两个 64K 是保留窗单条上限的十六倍，一条就吃掉单轮 8000 token 预算的大半；500 是人读线的存储尺寸，拿它当机读线上限等于把机读线降成人读面的残片。4000 字符 ≈ 1000 token，占单轮预算八分之一，一轮装得下八条满额结果。
- `TOOL_PROCESS_TURN_TOKENS` = 8000 · `none found:` 查过 `thincoder-core/token-window.mjs`（尾部两式与 `PRUNE_MIN_TOKENS`，无逐轮工具段预算）∥ `docs/core/design/TOOL-OUTPUT-LIMITS.md`（只有单条面）∥ `turn-task-state.mjs`（摘要面单行上限）。无既有量可复用，按单条上限乘八条估出。
- `FOLD_HINT_TOKENS` = 1000 · `none found:` `PRUNE_MIN_TOKENS` = 200 是 prune 的逐条门槛、`SUMMARY_TOKEN_ESTIMATE` = 1000 是摘要篇幅目标（一次成本），两者都不是「一行提示的噪声门」。它是一个独立含义的阈值，故另立。
- `retentionWindowStart` · `none found:` 查过 `thincoder-core/token-window.mjs`（尾部两式与 `collectStaleToolOutputs`）∥ `thincoder-core/agent/turn-projection.mjs`（折叠与投影面）——无既有「保留窗起点」函数；取起点面只有这一个。
- `thincoder-core/agent/turn-tool-process.mjs` · `existing but unusable:` 现成归属是 `turn-projection.mjs`（该类事实已越过单档承载），拆出只搬不改——五个常量 ∥ 九个函数，原档 re-export 保住导入面，先例 = `turn-task-state.mjs` 拆出时同形。
- `protectFrom` · `none found:` 查过 `splitHistory` 现三参（`history` ∥ `keepTail` ∥ `budgetTokens`）∥ `collectStaleToolOutputs` 现三参——无既有「保护下界」维。不复用 `budgetTokens`：两者方向相反，预算收紧切点、保护放宽切点。
- `agent._turnFoldMarks` · `existing:` `thincoder-core/agent/turn-projection.mjs` 的折叠身份登记（`registerFoldMarks`），§6 已用它判「一条消息是否已进中段」；保留窗起点按同一本账取身份。
- `RETAIN_CAP_TOKENS` = 262144 · `none found:` 查过 `thincoder-core/window-policy.mjs`（`TINY_WINDOW_CAP` 封的是窗口、`INJECT_HEADROOM_TOKENS` 是减法项，两个都不封压缩线）∥ `docs/core/requirements/CONTEXT-COMPACTION.md` 的压缩线条目（只有一条派生式，没有上限项）——无既有量可复用。它是用户现场观测落的独立常量（大上下文注意力衰减），算式与理由在 §2.2。
- `requestBudget` ∥ `policyBudget` · `existing:` `thincoder-core/window-policy.mjs` 的两个出口（前者取模型窗口、后者取有效窗口，同一算式 `budgetOf`）——本档改的是共用算式，签名与名字沿用。
- `preflightWindowFit` · `none found:` 查过 `thincoder-core/agent/run-stages.mjs`（`runCompactionCheck` 在回合后、`enforceContextFit` 在发送前）∥ `thincoder-core/session-lifecycle.mjs` 的 `applySession`（只按 `switched` 判模型变更）——装配后、首回合前这一格没有现成函数。

两条预算分支各自的来处：

- 单条 4000 字符不是假想的输入。本仓已为更大的量级造过面：`agent/offload.mjs` 的 `const TOOL_RESULT_OFFLOAD_LIMIT = 64 * 1024 // 65536 chars — offload only above 64K` 与 `const TOOL_RESULT_PREVIEW = 64 * 1024`——越过 64K 才落盘、才做双端预览。4000 比那条线低一个量级以上，触发它的输入落在日常工具输出里。
- 单轮 8000 token 是设计取舍，不是观测来的分支。它守的是「保留窗必须有界」这条构造要求：触发条件定量（token 数），任何一轮只要调用组够多就越过，没有「某个特定现场才发生」可言。所以这里写的是取舍——数值可调，那条要求不可调。

裁剪与移出都做一次，三面读同一份：单条裁剪与整段移出都在轮记录写入 `toolProcess` 的那一刻做完，投影 ∥ 保存 ∥ 恢复读的都是裁过的记录。三面各裁一次只会得到三份互不相同的副本，而「重启后只出现一次」的判据会当场变红。

整段移出的载体是切片自己的首项：移出发生时，把「移出了几组」那行作为一条 `user` 消息写进 `toolProcess` 的首项、随记录落槽，不是投影时现拼。

角色取 `user` 是因为它不需要配对——`assistant` 文本会被投影面的相邻 `assistant` 归并（§6）吃掉，`tool` 会成为没有调用的孤儿结果、首个请求必 400。同一形态在压缩面已有先例：`context.mjs` 把摘要注记以 `{ role: "user", content: note, ts: now }` 注入机读线。

相邻 `user` 因此不是这条线的新形状：压缩面早已把 `user` 注记注进同一条线，四张发送面拿到的一直是这条数组。

它也叩不开形状约束——机读线上的约束只有一条：`tool_calls` 与其全部 `tool` 结果成对（§6 两支配对收口的判据都只判这一件）。

§6 的相邻归并只管 `assistant`（回声占位那一支），不并 `user`：说明行并进相邻用户请求就是改写逐字的执行事实（§1.1）。

身份稳定 = 它就是落盘记录里的那一项，恢复读回的仍是这一条，再投影不会再添一行：切片 = 原切片去掉已移出的调用组，再加首项这一行。

终止规则：调用组是原子单位，从最旧一组起整组移出；移到最后只剩最新一组仍超 `TOOL_PROCESS_TURN_TOKENS` 就停手——最新一组保留完整，键仍在，首项那行报「已移出其余全部调用组」。不删键、不退成空段：键缺 = 这一轮的工具过程不在机读线上（§1.1），只剩一组时删键就是一句不实的话。

`tool_calls.arguments` 不进单条预算。单条预算量的是 `tool` 结果内容，参数不是结果：它是结果的上下文，截过的参数会让这次调用看起来是以别的参数发出的，等于造一条伪的执行事实；而它的自然尺寸是路径与命令行，本身就是小量。病态的巨量参数计入整段 token 预算，随它那一组一起被移出。残留写明：最新一组整组保留、不另加标记，落在这组里的巨量参数因此直达请求，整段可越过 `TOOL_PROCESS_TURN_TOKENS`——这是已声明的上界，不是漏项。

槽里到底有什么，按射程说：**保留窗内那两轮的工具过程在槽里逐字**——它挂在轮记录上、经 `turns` 投影落槽，只受本节两条预算约束（越限时是这里的双端截断并自带注记，不是 slim 残片）；**窗口之外的工具过程只剩人读线的 slim 前段**，尺寸与射程单源 = `SESSION.md` §5。

折叠真的丢掉量的时候要说出来：一轮的工具段逾期离开机读线、或工具段被上述预算裁掉，任务状态里留一行 `folded:`，只报量——折掉几条工具结果、估算多少 token（几轮、几组调用作附注）。这一行不指向任何回查位置：被折掉的那一段已离开保留窗，槽里只剩它的 slim 前段（射程见 `SESSION.md` §5），写「全文可取回」是一句读的人验不了、也兑现不了的话。低于 `FOLD_HINT_TOKENS` = 1000 token 时整行不出现——一行常态化的噪声，读的人第二次起就不看了。

这一行落在**触发它的那一轮**的任务状态上（刚过去的那轮把旧轮的段挤出了窗口），不回头改写已被折叠的轮记录：改一条已在机读线上的消息，槽里那份仍是旧的，恢复面按它投影的结果跟着分叉。

两处交代的分工：切片首项那行是给模型的——它说明这次工具段少了几组，模型据此知道自己缺的是哪一段，所以不受 `FOLD_HINT_TOKENS` 门；`folded:` 那行是给人读与统计的，报的是这一回合真的丢了多少量，所以受阈值门。不合并：合并后要么模型在量很小时失去「少了组」这个事实，要么人读面被常态噪声刷屏。

保留窗与 prune 的保护尾是同一个尾，而这条关系由结构保证，不由算术保证：`splitHistory`（`thincoder-core/token-window.mjs`）的 `tailStart` 取 `min(tailStart, 保留窗起点)`，收紧之后仍走一遍配对修复。

起点 = `retentionWindowStart(agent)`（`thincoder-core/agent/turn-tool-process.mjs`）：遍历**全部**带 `toolProcess` 的轮记录，到 `agent._turnFoldMarks`（§6）取它登记的那批消息对象，按身份当刻查出下标，取其中**最小**的一个。

取全部而不只取最旧那一条：锚点那条消息被替换时，单锚点会把保护整个降到「不收紧」；多算几个候选，返回值只会更小、不会更晚。

与在途段起点同一条重定规则（§1.1）：压缩重建数组后下标会漂、身份不漂。无保留窗时传 `history.length`，等价于不收紧。

`splitHistory` 是三方共用的同一个切点：压缩的中段与摘要面、prune 的合格集（`collectStaleToolOutputs` 要求「在保护尾之外」）、尾部预算的收紧，都从它取值。切点一处收紧，三面同源受益——保留窗因此始终完整落在保护尾里，与模型窗口大小、档位、调用组数都无关。

新增的 `protectFrom` 是必填参数，没有默认值：默认值等于替调用方决定这一档的保护量，正是这条钳法要消灭的那种静默取舍。传非法值即抛，报文点名该参数并说明该传什么。

**已知边界：保留窗是硬地板，压缩可能因此无事可做。** 保留窗加上最近两轮的逐字请求与回复一起把 `post` 顶到阈值之上时，`compressIfNeeded` 的可达性门（§5）恒为假，压缩成了静默的 no-op，最后由 `enforceContextFit` 按 `context_overflow` 抛出。

这不是新的故障类——尾部地板本来就能钉住同一批消息——但保留窗把这条边界撑宽了。

常见路径上它先被另一格拦住：本仓固定开销已越过 128K 窗格模型的请求上限（§5），固定开销那一格先于这条边界判出，小窗模型本就跑不起来。

还有一条来路排除不掉：保留窗内的**一条特大用户请求**本身。用户请求逐字入轮记录、没有长度上限（§1.1），一条几十万 token 的粘贴请求就能把保留窗顶到阈值之上，压缩随之无事可做。处置是如实报错、不给用户请求另设上限：剪掉用户请求就是改写执行事实，而 `enforceContextFit` 的 `context_overflow` 报文带着三个实数（total ∥ limit ∥ window），用户看得见是哪一格装不下。给用户请求单设一道上限是另一个决定，要改就连 §1.1「不截断用户请求、截断必须带标记」那条一起改，不在本档。

取舍写在这里：宁可压缩压不动、让越窗守卫如实报错，也不剪掉已经承诺保留的工具过程去换一次压得动。

两条预算关系只是「为什么通常装得下」的理由，不承担正确性：`TOOL_PROCESS_TURN_TOKENS × 2 < tailBudgetTokens`，且保留窗的消息条数通常落在 `keepTailSize` 以内。两条都读 `token-window.mjs`，这里写关系不写当前数字。

小窗格配置上它们本来就不成立（尾部预算按 §4 的减法链由压缩线扣掉固定开销得出，窗口小到装不下两个满额单轮预算），承重的因此是上面那条结构关系，不是这两条。第三条腿仍在：无中段 ⇒ `tailStart` 归 0。

## 2. 请求预算

### 2.1 有效窗口

有效窗口 = 本 run 参与预算算式和一切上下文百分比分母的输入窗口。它由模型的真实窗口经工作模式策略收敛得到，是策略值，不是模型事实。

```text
有效窗口 = tiny 档 ? min(模型窗口, TINY_WINDOW_CAP) : 模型窗口
TINY_WINDOW_CAP = 262144
```

模型窗口仍只由 providerSpec 回答（五级链见 PROVIDER.md §6.15），本档不改它。tiny 关闭后有效窗口逐位回到模型窗口；normal 与 engineering 不设任何上限；模型自身窗口小于 262144 时取模型窗口。

`TINY_WINDOW_CAP` 是 `thincoder-core/window-policy.mjs` 的导出常量，`effectiveWindow` 与 `policyBudget` 同调 `capWindow` 时取它。

单点实现 = `thincoder-core/window-policy.mjs` 的 `effectiveWindow(provider, workMode)`：窗口派生的一切读数（threshold ∥ limit ∥ 尾部两式 ∥ 百分比分母）全从它取，端侧不另立算式。

有效窗口是**读数时现推的推导值**：它由 `provider` 与 `workMode` 在每次读数上算出，不写进槽、不进 `provider` ∥ `config` 对象、不跨会话带走。档位是槽里的事实，有效窗口是从它推出来的——两者不可互代：把有效窗口落盘，就等于把「此刻的档位」冻成一个跨会话生效的窗口，切出 tiny 也不再解除。

advisor 不在本射程，这是明确排除而不是漏项。

`advisorContextBudget(provider)`（`thincoder-core/advisor/compaction.mjs`）自算 `usableWindow(spec.context, outputReserve(provider, spec))`：它按自身模型的窗口现算评审预算，没有 workMode 这个输入维度，也不看主会话的槽。

把它拉进单源，得先给它一个它没有的档位维度，代价大于收益。代价写在这里供推翻：tiny 会话里跑评审时，advisor 的评审上下文不受 262144 约束。

需求三条是这条策略的来处：`docs/core/requirements/CONTEXT-COMPACTION.md` §2 的「有效窗口 = `min(模型窗口, 262144)`」∥「切换档位即生效与解除」∥「一切以窗口为分母的量同取有效窗口」。本节是它的设计落地，不重述需求原文。

### 2.2 两个预算出口

同一份算式有两个出口，区别只在窗口取哪一边：

- `requestBudget(provider, spec)` 取模型窗口，供 `provider/core.mjs`（OpenAI 兼容面）∥ `provider/anthropic.mjs`（Messages）∥ `provider/google.mjs`（generateContent）∥ `provider/responses-request.mjs`（Responses）四个发送面读 maxTokens——max_tokens 是输出合同，不受输入窗口策略影响。
- `policyBudget(provider, spec, workMode)` 取有效窗口，供压缩阈值、stats、发送前守卫读 window ∥ limit ∥ threshold；maxTokens ∥ maxTokensSource ∥ windowSource 逐位转交 `requestBudget`，不另算。

`reserve` 不在转交之列：它按同一算式现算（§2.2.1），与窗口无关，两个出口因此在数值上相同——需要转交的只有窗口那一边。

```text
reserve   = outputReserve(provider, spec)
outputReserve = explicit > 0 ? explicit
              : format === "anthropic" ? spec.maxOutput
              : min(spec.maxOutput, defaultOutput)
defaultOutput = reasoningEffort === "max" ? 131072 : (spec.thinking ? 65536 : 8192)
limit     = window - reserve
threshold = min(limit - INJECT_HEADROOM_TOKENS, RETAIN_CAP_TOKENS)
```

派生链单向：`window` 是唯一输入。`reserve` 不随窗口变；`limit = window − reserve` 是服务端接受的输入量（prompt + 预留输出 ≤ 窗口）；`threshold = min(limit − INJECT_HEADROOM_TOKENS, RETAIN_CAP_TOKENS)` 是压缩线。

`limit` 对窗口的斜率是 1，`reserve` 是 0，所以 `limit − INJECT_HEADROOM_TOKENS` 的斜率仍是 1；这一支取上界 `RETAIN_CAP_TOKENS` 之后，封顶段上的斜率转 0。两个臂都不随窗口减小，`min` 的结果因此也不减小——窗口增大时 `limit` 与 `threshold` 都不得减小，封顶段上是「恒定」，恒定不算减小。

封顶只夹压缩线，不夹 `limit`：`limit` 是物理线（窗口减预留），把守卫线压到它之下会在真实越窗之前就报错，制造本来不存在的溢出。封顶段上 `limit` 继续随窗口长、`threshold` 不动，两线间距只增不减——压缩线永远在前，硬上限永远在它之后。

与窗口无关的常量进入算式有两种形态：减法项与 `min` 的上界。减法项（`INJECT_HEADROOM_TOKENS`）把曲线整条平移，斜率仍是 1；上界（`RETAIN_CAP_TOKENS`）把斜率截成 0。两者都不反转方向，压不回曲线。任何一个窗口坐标上 `limit` 或 `threshold` 低于更小窗口处的取值，都说明有常量以第三种形态参与了算式。

`INJECT_HEADROOM_TOKENS` = 50000 是压缩线上方留给注入上下文的余量。目录树、git 上下文、提纲、项目指令、memory ∥ doc 检索这些量按会话注入，**不随窗口缩放**——1M 窗口上与 320K 窗口上它们占同样多的条目。

绝对量才是这条余量的正确刻度。

依据 `thincoder-core/window-policy.mjs`「Headroom above the line absorbs injected」——该注记列出这条余量吸收的五类注入，体量记作 `30–50K`。

取上界 50000 的理由不对称：估小一档的后果是注入把 prompt 顶过硬上限而压缩线帮不上（守卫报 `context_overflow`），估大一档只多付一次早压。

`RETAIN_CAP_TOKENS` = 262144 是压缩线的绝对上限，与 `INJECT_HEADROOM_TOKENS` 同住 `thincoder-core/window-policy.mjs`。它封的是**压缩线**：上下文越长，部分模型的注意力越衰减，用户对 1M 窗口的模型也只要求用到 256K。理由是用户的现场观测事实，不是估算，也不是设计推断。

封顶的生效面在压缩线本身越过上限的那一段：`limit > RETAIN_CAP_TOKENS + INJECT_HEADROOM_TOKENS`，即 `limit > 312,144`。换成窗口还要加上当档的 `reserve`，而 `reserve` 按档不同——absent 档思考模型是 65,536，因此 `window > 377,680` 起封顶生效。门槛因此写在这两个量上，不写成某一个窗口数。

封顶段上压缩线与窗口脱钩，`limit` 照旧随窗口增长：大窗口换来的余量不进上下文，硬上限仍跟着窗口走，两个数不会重合。

两个 262144 不是一回事：本常量封的是**压缩线**，`TINY_WINDOW_CAP`（§2.1）封的是**窗口**。同值不同物——tiny 档把窗口压到 262144，压缩线再从那个窗口派生出更小的数；本常量不动窗口，只削压缩线。改一个不动另一个。

`threshold ≤ 0` 不是可运行状态而是配置矛盾：窗口扣掉输出预留之后连注入余量都装不下，压缩线不存在。判据与处置见 §2.4。

`usable` 不是预算对象的一个字段：它与 `limit` 是同一个数（`limit = window − reserve`），两个名字描述一个量就是第二个事实源。

### 2.2.1 absent 档的预留取服务端默认输出

`outputReserve` 的第三段只作用在 absent 档（transport 不发 `max_tokens`）。

那一档的 `reserve` 不是我们的策略取值，是**服务端收到请求后自己会生成多少**：`max_tokens` 不发，服务端按它自己的默认值预留输出。

`spec.maxOutput` 是模型**最多能**输出多少，不是一次请求实际会输出多少。两个数不是一回事：`deepseek-flash` 的 `maxOutput` 是 384,000，而不发 `max_tokens` 时服务端只按 64K 预留。拿一个不会被发出的值做预留，任何窗口下的读数都是虚假的——1M 下也虚假，只是没触发故障。

依据 `https://api-docs.deepseek.com/zh-cn/api/create-chat-completion` 的 `max_tokens` 段「限制一次请求中模型生成 completion 的最大 token 数。取值范围为 1 到 384K（393216）。未设置时，非思考模式默认 8K，思考模式默认 64K（`reasoning_effort` 为 `max` 时为 128K）。输入 token 和输出 token 的总长度受模型的上下文长度的限制。」

三个数的出处就是这一句：思考模型 65,536、非思考模型 8,192、`reasoning_effort = "max"` 时 131,072。

覆盖范围按 `provider.format` 判，与渠道名单无关：`format === "anthropic"` 恒发 `max_tokens`、走 spec 档；其余格式（OpenAI 兼容 ∥ google ∥ responses）且未设 `provider.maxTokens` 的，都是 absent 档，全按这三个数取较小者。

已核过默认值的族只有 DeepSeek（依据同上那一句）。其余渠道的默认输出未文档化，按同一组数预留——这是假设，方向与代价写明：真实默认更大时 `limit` 高于物理线，代价是一次 400 加 §5 的越窗自愈链强压一次；真实默认更小时多压一次。要按渠道分档，先要有该渠道的文档事实，不能凭空取数。

explicit 档与 spec 档（anthropic 恒发 `max_tokens`）不取服务端默认输出的较小者：那两档的 `reserve` 就是实发输出预算，拿默认输出压它等于把真实输出挤进输入里。

依据 `thincoder-core/window-policy.mjs`「NOT capped: the old 25% cap reopened a residual band between the counted reservation and the real output budget」（同注记记着 2026-10-18 那次 `budget counted 250_000, 393_216 actually sent`）。

分支只有一处：`outputReserve` 自己按 `provider.maxTokens` 与 `provider.format` 判档；`budgetOf`（`window-policy.mjs` 的私有算式，两个出口共用）照它的返回值取数，不另判一次。`reserve` 与窗口无关，因此不需要传窗口，两个出口（§2.2）拿到同一个数。

`usableWindow` 接的是「占掉输出的预留」，喂进那个位置的是每次请求的真实预留——`explicit` 档的实发 `maxTokens`，或 absent 档的服务端默认输出，不是模型能力上限。`reserve ≥ window` 时它拒绝并点三个数（§2.4）。

三处调用喂的窗口不同，点名字如下（预留的算式同一，变的只是窗口那一边）：

| 调用点 | 喂的窗口 | 窗口从哪来 |
|---|---|---|
| `budgetOf` ← `requestBudget` | 模型窗口 | `providerSpec` 的左值，不经策略 |
| `budgetOf` ← `policyBudget` | 有效窗口 | `capWindow(spec.context, workMode)`——`effectiveWindow` 用的同一条算式 |
| `advisorContextBudget` | 它自己模型的窗口 | 不参与 workMode（§2.1 的明确排除） |

tiny 档的判据随 `effectiveWindow` 走：`capWindow` 是 `effectiveWindow` 与 `policyBudget` 共用的唯一实现，tiny 在读数那一刻由 `workMode` 现推。装载期的判据（§2.4）调 `usableWindow` 时喂的是 `policyBudget` 那一边的有效窗口——用户开 tiny 时的可用窗口就是他要用的那个窗。

为什么不是「第二个魔数」：**它是服务端的事实，不是我们的旋钮**。三个数由 provider 文档规定，要改先改文档事实；而一个自选的固定预留（「absent 档一律留 32K」）是我们替服务端决定它生成多少，没有出处，也不随模型走。

同一个函数还服务 `advisorContextBudget`（`thincoder-core/advisor/compaction.mjs`），它传自己的模型窗口，absent 档按服务端默认输出取较小者这一支在那儿一并生效。

§2.1 排出单源射程的是**有效窗口**这一维，不是预留的算式——预留只有一个算式、两个消费面。

四条推论：

- 两条线的间距在未封顶的窗口段上是常数 `INJECT_HEADROOM_TOKENS`；封顶段上 `threshold` 不动而 `limit` 继续长，间距只增不减，两线不重合。为什么压缩线不由比例式定，理由在下「被否掉的候选」第一条。
- 压缩线随窗口一次抬升到封顶为止：窗口在门槛以下时它由 `limit` 派生，「用户设了多大窗口就用到多大」；越过后压在 `RETAIN_CAP_TOKENS` 上，窗口再增大也不动。
- `limit` 取到的就是物理上限：prompt + 服务端默认输出 ≤ 窗口。absent 档不再有被虚假预留吃掉的余带。
- 硬上限变窄只剩一条来路：`reasoning_effort = "max"` 时服务端预留 128K，320K 窗口下 `limit = 196,608`、`threshold = 146,608`——间距仍是 50,000，变窄的是 `limit` 本身。那是「服务端要占 128K 输出」在 320K 窗口上的后果；要放宽只能改 `max_tokens` 发送值（本档不碰）或换更大窗口。

被否掉的候选三条：

- 保留比例项作第二支上限（`min(limit − 余量, floor(window × COMPACT_RATIO))`）：它与绝对余量算的是同一件事——压缩线上方要留多少注入空间——而两者刻度不同。比例项唯一能生效的地方是大窗口，它在那里把线压回 `0.6 × window`，用户设的 1M 窗口因此只用得到 629K；小窗口上比例数比绝对量小，余量由绝对量决定。一个量两套刻度，其中一套必然在某个窗口上与另一套打架。
- absent 档按 `floor(window × (1 − COMPACT_RATIO))` 封顶 `reserve`：它修的是报错，不是「预留拿错了变量」——封顶值仍是我们的旋钮，而 absent 档实际发出的是服务端默认值。`reserve` 随窗口变化又让 §2.2 的单向派生断掉。
- absent 档按自选固定预留：那是替服务端决定它生成多少，没有出处（见上）。

`limit ≤ 0` 与 `threshold ≤ 0` 都在装载期拒绝（§2.4）。守卫面因此永远拿到一个正数 `limit`；absent 档的 `limit` 就是 `window − reserve` 本身，没有第二个算式。

显式 compactThreshold 优先；auto 派生只写运行时 compactThresholdResolved，不回写用户配置。

上述四个发送面使用同一 maxTokens；stats、守卫和压缩使用同一预算对象——window ∥ limit ∥ threshold 同源，不各算一套。

压缩线里没有比例项，尾预算里没有窗口比例：`COMPACT_RATIO` 与 `TAIL_BUDGET_FRACTION` 因此不在本档的算式里——算式只有上面那个块。

### 2.3 缺参即拒

同一条纪律覆盖尾部预算的四个新增参数：`tailBudgetTokens(provider, workMode, fixedOverhead, ratio)` 与 `collectStaleToolOutputs(history, provider, workMode, protectFrom, fixedOverhead, ratio)` 的 `fixedOverhead` ∥ `ratio` ∥ `protectFrom` 都没有缺省。**这两个签名就是全部，不另立简版**：`collectStaleToolOutputs` 的每个调用点都传满六个实参。

`fixedOverhead` 缺省等于把「这份 run 的固定开销」静默定成 0，压后的尾会按一个装不下的量去切；`ratio` 缺省等于把校准后的阈值和未校准的估算放进同一次减法。

理由：默认值把「忘传」静默成一条不下上限的窗口，压缩线随之上移，人要等到账单才发现；一个能在入口喊出参数名的拒绝，比一条静默放行的默认便宜。

握有 agent 的面用 `resolveWorkMode(agent.config?.agent)` 自己取模式；只握有 provider 的面把它当参数透传。本仓只握 provider 的透传面有两处：

- `thincoder-vscode/src/specs.mjs` 的 `ctxUsageForHistory` ∥ `ctxPercentForHistory`——宿主只给 history ∥ provider ∥ ratio。
- `thincoder-core/session-lifecycle.mjs` 的打开态读数：`historyPercent(line, provider, sampleRatio(data.estimateSample, provider), workMode)`。

`protectFrom` 只有握有 `agent` 的一面算得出来——`retentionWindowStart(agent)`（`thincoder-core/agent/turn-tool-process.mjs`）。所以四个消费点各自算好再传。

四个消费点 = `thincoder-core/context.mjs` 的 `compressIfNeeded` ∥ `compressFallback`、`thincoder-core/context-degrade.mjs` 的 `pruneStaleToolOutputs`、`thincoder-core/agent-tools/context.mjs` 的 stats prunable 读数。四个都握有 `agent`，三个新参数因此在每个点上同源取：

| 消费点 | `fixedOverhead` | `ratio` | `protectFrom` |
|---|---|---|---|
| `compressIfNeeded` | 第 ② 步固定开销门已算过的同一个 `contextUsage(agent, extras).overhead` | `tokenRatioOf(agent)` | `retentionWindowStart(agent)` |
| `compressFallback` | `contextUsage(agent).overhead` | `tokenRatioOf(agent)` | `retentionWindowStart(agent)` |
| `pruneStaleToolOutputs` | `contextUsage(agent).overhead` | `tokenRatioOf(agent)` | `retentionWindowStart(agent)` |
| stats 的 prunable 读数 | `contextUsage(agent).overhead` | `tokenRatioOf(agent)` | `retentionWindowStart(agent)` |

三点各算一次同一批值不构成第二个事实源：三个量都是当场读出的推导值，没有一处落盘。

### 2.4 派生不成立即拒

`reserve ≥ window` 时派生链没有解：没有任何输入装得下，`limit ≤ 0`、`threshold < 0`。

这一格不静默兜底：配置不成立就在装载期抛。留到发送期才报的后果是报文说 `context_overflow`、指向会话内容，而真实原因是配置矛盾。

判据单点 = `usableWindow(context, reserve)`（`thincoder-core/window-policy.mjs`）：减法结果 ≤ 0 即抛，报文点三个数（window ∥ reserve ∥ 差值）与三条出路（调大窗口 ∥ 调小 `maxTokens` ∥ 换掉 `maxOutput` 与窗口相等的模型配置）。

落进这一格的是 `reserve` 不小于窗口的配置：显式把 `maxTokens` 设到窗口或窗口以上的（`maxTokens: 256000` 配 256,000 窗，`reserve = 256,000`，`usable = 0`）。

规格上的输出能力与窗口相等不算。`doubao-seed-2-1-turbo-260628` 就是这一格：依据 `thincoder-core/model-specs.mjs`「["doubao-seed-2-1-turbo-260628", { context: 256_000,   maxOutput: 256_000, thinking: true」——窗口与 `maxOutput` 都是 256,000。

它走 absent 档，`reserve = min(256000, 65536) = 65,536`，跑在 `limit` 190,464 上，不被拒。

装载期的判据点 = run 装配（`thincoder-core/agent/setup.mjs`）在 provider 落定之后调一次 `usableWindow`，用户在与该模型的第一条读数之前就听到矛盾。

`budgetOf` 与 `advisorContextBudget` 走同一个函数，运行期任何读数路径也拒绝同一种配置。

`threshold ≤ 0` 同一处置，报文给 `window` ∥ `reserve` ∥ `INJECT_HEADROOM_TOKENS` 三个数。

它是**构造判据，不是观测来的分支**：`threshold = min(limit − INJECT_HEADROOM_TOKENS, RETAIN_CAP_TOKENS)` 是减法链的一环。`RETAIN_CAP_TOKENS` 是正数，所以它非正只能来自第一个臂：`limit` 为正而 `limit − 注入余量` 非正，来路只有一个——窗口刚好压过 `reserve`，却没给注入留出余量。

它与 `reserve ≥ window` 不是同一句：这里的窗口装得下输出，装不下的是那 50K 注入余量。报文因此点注入那一项，读的人才知道缺的是余量而不是全部窗口。

### 2.5 显示与判定同基准

状态行百分比的分母 = 用户实际可填的量 = `limit`。`window` 含输出预留，拿它当分母时 100% 永远到不了，读数只说明「窗口有多大」，不说明「还能填多少」。

单点实现仍是 `historyReading`：返回 `{ tokens, pct, window, limit, threshold }`，`pct = round(tokens / limit × 100)`。

五个读取面照旧只渲染、端侧零自算式：端侧三面 = CLI 状态行（`thincoder-cli/src/tui/render-loop.mjs` 的 `ctxCacheOf` → `status-line.mjs`）、VSC（`thincoder-vscode/src/specs.mjs` 的 `ctxUsageForHistory`）、Desktop（`thincoder-desktop/src/main/agent-host.mjs` 的回合尾 `ev:usage` 载荷）。

核内两面 = stats 第 6 行（`thincoder-core/agent-tools/context.mjs`）与打开态读数（`session-lifecycle.mjs` 走 `historyPercent`）。五个面读的 `pct` 都出自 `historyReading`。

压缩线与硬上限在界面上可分辨：状态行告警不再用魔数 `ctxPct >= 80`，改为 `tokens >= threshold`（同一次读数带出的 `threshold`）。

越过压缩线标示「下一次安全点会压缩」，100% 标示「已到硬上限」。判定与显示读同一个数，端侧不各发明一档阈值。

## 3. 估算与样本

contextUsage 有实测时使用 `_lastPromptTokens + 增量估算`，否则估算完整 history 加 system/tools。

估算使用当前加权函数。自校准样本带估算器版本与模型键，随会话槽保存和恢复；不匹配时不复用。

校准比只有一个读取面 = `tokenRatioOf(agent)`（`thincoder-core/token-window.mjs`）：`contextUsage` ∥ `historyReading` ∥ 尾部预算的调用方全从它取，不各自换算。它内部按会话样本经 `sampleRatio(sample, provider)` 折算，`recordTokenSample` 只写样本、不产出比值。

下界落在这个读取面上：`sampleRatio` ∥ `recordTokenSample` 同取 `Math.max(1, num / den)`，样本坏或不在场时回中性值 1。偏差方向已知是估算偏低，所以比降到 1 以下会把该压的格判成不该压。

这是需求 §3「比例不得低于当前安全下界」的落点：下界就是 1，不是一个另配的常数。

### 3.1 结构编辑后的实测基线

`_lastPromptTokens` 是服务端真值，`_usageAtLen` 是它覆盖到的那个下标：实测支 = `_lastPromptTokens + estimateTokens(history.slice(_usageAtLen)) × ratio`。

两个字段合起来说的是同一件事——前缀这一段是量的，其后是估的。

prune ∥ shrink ∥ 压缩 ∥ 蒸馏都只改动机读线的一部分，前缀因此对不上旧真值。**不能沿用，也不必归零**：改掉那一段的估算差就是它在实测尺上的差。

```text
_lastPromptTokens' = _lastPromptTokens − round((estBefore − estAfter) × ratio)
_usageAtLen'       = 剪切后仍属于旧前缀的那些消息之后的第一个下标（就地替换 ⇒ 不变）
```

`estBefore` / `estAfter` = 旧前缀里被改动的那一段、与它在编辑后对应的那一段，各取 `estimateTokens`。

乘 `ratio` 与实测支对后缀的换算同一把尺：整条读数 = 「前缀的实测值」+「后缀的估算值 × ratio」，前缀的差因此也乘 `ratio`。

四个性质：

- **误差** = 只有被改那一段的估算误差，方向不预判。`ratio` 已知偏低，所以重定后的基线可能偏低；偏低的方向是「该压没压」，由 §5 的可达性门与守卫面接着兜，不会静默越窗。
- **自纠** = 下一次服务端响应整体覆写两个字段（`agent/turn-loop.mjs` 的 `agent._lastPromptTokens = response.usage.prompt_tokens`），漂移活不过这一回合的其余读数。
- **边界** = 同回合内多次结构编辑的差累加，误差上界是各段估算误差之和；减到非正 ⇒ 基线不再描述任何东西，退回 `null`（与归零同形，但只在算不出来时走）。
- **形态** = 三种编辑都是「替换非删除」：prune 把 content 换成 stub、shrink 截成头尾、压缩把中段换成注记。折叠量本身就是 `estBefore − estAfter`，不需要第二套记账，也不需要一条新的真值通道。

归零为什么不行：归零之后 `contextUsage` 回落纯估算，而压缩、prune、shrink 之后恰恰是最需要准确读数的时刻，且此时没有真值可纠——下一次真值要等一整次往返。

两处置零不是本条的例外：新会话（`thincoder-core/session-lifecycle.mjs`）与 run 装配起点（`agent/setup.mjs`）没有「被改动的历史」，它们是还没有历史。

## 4. 切割与降级

尾的宽度由可用容量倒推，不由窗口比例决定：

```text
tailBudgetTokens(provider, workMode, fixedOverhead, ratio)
  = max(0, floor(threshold / ratio) − fixedOverhead − SUMMARY_TOKEN_ESTIMATE − 注记与占位估算)
```

`threshold` 取 §2.2 封顶后的压缩线；`fixedOverhead` = system + tools 的估算（`contextUsage` 的 `overhead`）；`ratio` = 校准比（`tokenRatioOf`）。

注记与占位估算 = `NOTE_ESTIMATE` 减 `SUMMARY_TOKEN_ESTIMATE`，因为 `NOTE_ESTIMATE` 本身含它：`thincoder-core/token-window.mjs` 的 `export const NOTE_ESTIMATE = SUMMARY_TOKEN_ESTIMATE + estimateTokens([...])`。算式里已减过一次摘要目标，再减整额就重复计一次。

两个常量都住 `token-window.mjs`。减法链在那里，而 `context.mjs` 已经 import `token-window.mjs`——`NOTE_ESTIMATE` 若留在 `context.mjs`，就得让 `token-window.mjs` 反向 import，成环。

减法链把「压完之后落在 `threshold` 以下」写成构造而不是事后检查：压后的量是 `(tail + 注记 + 固定开销) × ratio`，尾按上式取，它就落在 `threshold` 以内。

乘 `ratio` 是必需的：`threshold` 是校准后的量，尾的估算要换到同一把尺上才可比。

封顶直接落到尾预算上：尾的宽度由封顶后的压缩线倒推，封顶段上它不随窗口增长。1M 窗口上封顶后是 `262,144 − 固定开销 − 注记估算`，不封顶是 `933,040 − 固定开销 − 注记估算`（`NOTE_ESTIMATE` = 1112）。

两者之差 = `window − reserve − 312,144`，与固定开销无关，与当档的 `reserve` 有关。

按 `deepseek-flash`（`reserve` 65,536、窗 1,048,576）算，差是 670,896；按固定开销 4.5 万、`ratio` 取 1 计，两个尾预算分别是 216,032 与 886,928。

这是本条的目的，不是副作用：拿大窗口的余量换注意力质量。窗口再大，逐字保留量也不再跟着涨；要把上下文放长，改的是 `RETAIN_CAP_TOKENS`，不是一个更大的窗口。

`keepTailSize(provider, historyLen, workMode)` 是**条数上限**，不是预算：一条消息的体量跨三个数量级，按条数推算容量必然错。

它的算式（`min(max(10, floor(有效窗口 / 100000 × 30)), floor(historyLen × 0.4))`）就是上界与地板，不是容量。

尾的实际宽度 = 在不破 `TAIL_FLOOR_MESSAGES`（10 条）地板、不超过 `keepTailSize` 上界的前提下，能装进 `tailBudgetTokens` 的最大配对安全后缀；切分仍由 `splitHistory` 一处给出。

收紧之后还有一条腿，方向相反：切点退到不晚于保留窗起点（`splitHistory` 的第四参 `protectFrom`，§1.2）——保护优先于预算，保留窗内的工具过程不因尾部预算小而落进中段。

这条腿能把保护尾撑到 `tailBudgetTokens` 之上，那时压缩能压的只剩保留窗之前那一段。

两条公式同取有效窗口（§2.1）：窗口被 tiny 压小，尾部跟着变短，不另立一套尾部规则。预算不足时保留当前最近消息保底，配对安全优先。

KEEP_HEAD=0；旧任务进入摘要而非原文锚定。

降级链：

1. LLM 摘要。
2. 连续失败达到当前上限后确定性 fallback。
3. 无中段时 shrinkOversized（`thincoder-core/context-degrade.mjs`）截断单条超大内容：改的只是机读线里那条消息的副本，轮记录与人读线保留原文（§1.1）。

   它自己带标记，与 §1.2 的「截断带标记」是同一条规则：门槛 `OVERSIZE_CONTENT_LIMIT` = 8000 字符，越限留头 4000 + 一条实际省略数注记 + 尾 2000——这条降级链上没有静默变短的读数。

   保留窗内的工具结果也到不了它：那一段已先被 §1.2 的单条预算裁到 4000 字符以内并带注记，低于 8000 这道门槛。

失败有可见状态，不阻塞完整记录。

## 5. 触发与越窗

普通阈值触发要求：

```text
usage.total > threshold && post(plan) <= threshold
```

post 使用真实切割计划、注记、tail 和固定开销估算。force 跳过该早退，但不跳过发送前真实预算守卫。

### 5.1 压缩链的前置裁剪

越线不等于要付一次摘要请求：越线之后先做一次零成本、确定性的 prune（§7.2 的 `pruneStaleToolOutputs`），再重测。

裁 → 摘要 → 丢弃，三步串联，每步之后重测，够则停：

```text
① 阈值早退（total ≤ threshold，force 跳过）
② 固定开销越线门（force 跳不过）
③ prune 一次 → 重定基线（§3.1）→ 重测 contextUsage
④ 未 force 且重测后 total ≤ threshold ⇒ 停（零摘要请求）
⑤ splitHistory（尾预算 = §4 的减法链）→ 可达性门 → 摘要请求 → 重测
⑥ 摘要失败，或压后 total 仍 > threshold ⇒ compressFallback（丢弃，零网络）→ 重测
⑦ 压后 total 仍 > limit ⇒ 守卫抛三实数
```

`force` 面也 prune，但不因 prune 就早退，也不因 `④` 就停：`/compact` 与越窗自愈要的是一次真实的压缩动作，prune 只让中段变小、摘要请求更省。

第 ③ 步的射程：合格集非空的只有 §7.2 列的那两类状态（尚无一条轮记录带 `toolProcess` ∥ 由 `history` 播种的旧槽）。其余状态下 `tool` 消息全在保留窗内、因而全在保护尾里，prune 返回 0 条——③ 是一步 no-op，常见路径的成本落在 ⑤。

第 ⑥ 步的作用：摘要失败一次就走到丢弃，不等连续失败——「一次网络抖动换一个死会话」正是这条链要避开的结局。丢弃零成本、确定性（`compressFallback` 只丢中段、不调模型），换到的是一段能继续工作的上下文。

丢弃要报量：`compressFallback` 落 `agent._lastCompressInfo = { mode: "fallback", discardedMessages, discardedTurns, tailMessages }`。

`discardedMessages` = 被丢弃的消息条数（`split.tailStart − split.headEnd`）；`discardedTurns` = 其中全部记录消息都落在该区间的轮次数（判据与 §6 的覆盖账同一本：`turnRecordMessages` 逐条判）；`tailMessages` = 留下的尾部条数。只报留下的条数，读的人推不出丢了什么。

所以它排在摘要失败之后立刻执行，不等连续三次失败。代价写明：端点持续不可用时，每个安全点白付一次失败的摘要请求；换来的是任务不因摘要面故障而中止。

失败计数与面板的失败态照旧每次失败发一次（`onCompressFail`），降级态（`onCompress` 且 `mode === "fallback"`）在丢弃真的发生时发——需求 §8 的两个态各由一个回调产生这一条不变。

可达性门跟着重测：`post` 的输入是 prune 之后的 `usage` 与 prune 之后的 `middle`（同一次 `splitHistory` 产出），判据零改。

先后与耦合：prune 先改历史，重测依赖 §3.1 的基线重定。prune 若仍把基线置零，重测就落到纯估算——「先裁剪」换来一个不比自己更准的读数。两条同批落，不各修一半。

幂等由门槛保证：已替换的 stub 只有一行说明文字，估算低于 `PRUNE_MIN_TOKENS`，不会被第二次选中，因此同一条链上再走一次 prune 是 no-op。

呈现决定：链上的 prune 不发新的宿主事件。模型面看到的是 stub 自己那行说明（含原长度与重跑路径），人读面看的是 stats 的下降；为它新开一个回调要给 CLI ∥ VSC ∥ Desktop 三端各加一个态、headless 再走一次可选链，而需求没有这一态。

### 5.2 模型与参数变更的预判

存量历史可能超过新窗口：用户从 1M 模型切到 256K 模型，或把 `providers[].context` 调小，或改 `reasoningEffort`（`max` 档把 `reserve` 抬到 131,072）——这几种变更都让 `limit` 变小，而 `agent.history` 一条没少。

不预判的话，这种局面要等下一次请求撞上守卫才发现：报文说的是 `context_overflow`，用户读到的是「上下文太大」，真实原因（刚换的配置装不下已有历史）被报文挡在后面。

处置点 = run 装配之后、第一个回合之前：`agent/run-stages.mjs` 新增 `preflightWindowFit(agent, ctx)`，比一次 `contextUsage(agent, overhead).total` 与 `policyBudget(...).limit`。

超了就直接跑 §5.1 的同一处置链（`force` 面：prune → 摘要 → 丢弃），不另立第二条路径。

「变更那一刻」= 下一次 run 的装配点：参数按 run 现算（`effectiveWindow` 每次读档位，`reserve` 每次读 provider），会话打开时的模型合并（`session-lifecycle.mjs` 的 `applySession` 已按 `switched` 判出模型变更）只改运行态取值，真正生效就在下一次装配。

放在装配点因此覆盖模型切换、`context` 调小与 `reasoningEffort` 变更三条来路，不需要为每一条各立一个钩子。

判据用实测优先的 `contextUsage`：切换前的最后一次响应给过真值，它比估算更接近服务端会看到的量。处置链跑完仍超 `limit` ⇒ 守卫照 §5 抛三实数，报文点明「切换后的模型装不下存量历史」。

enforceContextFit 在发送前检查 usage.total > limit，可强压一次；仍超则 context_overflow，不发请求。

固定开销（system + tools）单独越过 limit 时压缩无解：history 归零后 total 仍等于固定开销。这一格在强压之前判——`contextUsage` 给出的 `fixedFloor` = 固定开销按当前估算比缩放，与估算支同一把尺。

判中即抛 typed error：`kind` 仍为 `context_overflow`（同一种条件一个 kind，端侧不必多认一类），`reason` = `overhead_exceeds_limit`，报文给固定开销、limit、window 三数，并说明压缩解不了、只能降 max_tokens ∥ 换更大窗的模型 ∥ 减 system 与 tools 声明。

这一格不是假想：本仓自己的固定开销就已越过 128K 窗格模型的请求上限——依据 `test/integration/turn-history-projection.test.mjs`「本仓当前固定开销（system + 工具 schema）已超过 128K 窗格模型的请求上限」，那份夹具正是为此改用大窗格模型。

不能靠压缩兜底的原因：压一次白付一次摘要请求，压完仍抛同一个错；而报文若把方向指到会话内容上，用户会一直 /compact。同一判据也拦强制压缩（`force` 跳过阈值却跳不过这条）：守卫面照上面抛，`/compact` 面按 no-op 回执报同一原因，不再发摘要请求。

会话标题不在这份固定开销里，也不动 `fixedFloor`：`contextUsage` 的 overhead 只有 `system` 与 `tools` 两项（`const system = extras.systemPrompt ? estimateText(extras.systemPrompt) : 0`、`const overhead = system + tools`）。

`assemblePrompt(scenario, mode)` 组 system 时不读会话标题；标题实体是 `agent.title`，落在槽头、会话索引、状态行与通知载荷上（`notify-policy.mjs` 的载荷取 `agent.title`），请求面读不到它。

标题的文本预算是它自己那条生成请求：输入是首条用户消息，输出上限 `MAX_TITLE_TOKENS` = 100 与 `extract(data)?.trim().slice(0, 40)` 的 40 字符截断（`thincoder-core/generate-title.mjs`）。

这是需求 §1「本档只管标题所占的文本预算」的落点：标题怎么来归 `SESSION.md` §8，它占多少文本由一个常量加一次截断回答；与会话请求的固定开销是两把尺，不同量也不同名。

服务端越窗 400 走同一条自愈链：`agent._overflowRetried`（run 级一次，`thincoder-core/agent/setup.mjs` 每次 run 复位）为假 ⇒ `turn-loop.mjs` 的 `callTurn` catch 调 `enforceContextFit(agent, ctx, { forceCompact: true })`（`thincoder-core/agent/run-stages.mjs`）强压一次，再重试同一回合一次；已用过的原 typed 错误透传。

compress ∥ distill ∥ 续写等止血内部请求各自直调 `chat`，不进这层 catch ⇒ 零重放。

## 6. 摘要与恢复

SUMMARIZE_PROMPT 保留当前任务、决策、文件、未决和约束。摘要调用不接 onToken/onReasoning。

长度目标是摘要指令里的一句话，不是一次硬切。

`SUMMARIZE_PROMPT`（`thincoder-core/context.mjs`）要求「Stay under ~1K tokens (≈1000 Chinese chars / 4000 ASCII chars) — a hard target」，并给出超预算时的收紧次序：已完成项压成一行、文件 why 注压成裸路径、进行中散文收紧；设计锚点与未决项不许砍。

同一目标在估算面单源承载 = `SUMMARY_TOKEN_ESTIMATE`（`token-window.mjs`），可达性门的 `post` 用它算注记成本。

这是需求 §4「摘要有当前长度目标，但不靠硬切丢尾部」的落点：目标管摘要自身篇幅，尾部由切割判据保护，两者不是同一条预算。

压缩成果必须能落槽：中段换成摘要注记之后，槽保存的是 `note` 原文 + 它已覆盖的前 `turnsCovered` 条轮记录，恢复按 `SESSION.md` §2 的次序拼成「摘要 + 其后轮次投影 + 在途段」。键形 `compactCheckpoint` = `{ note, turnsCovered }` 与在途段的写面归 `SESSION.md` §2；内存载体是 `agent._compactCheckpoint`（同形，无压缩 ⇒ 不设）与 `agent._turnFoldMarks`（折叠时登记的轮记录消息对象身份——压缩按它判一条消息是否已进中段）。

原因：槽里的机读线由 `turns` 投影重算，压缩成果只活在内存里 ⇒ 重启后摘要消失、被摘要掉的轮记录整条投影回来，压缩白做一次，摘要里的决策与未决点随进程一起没了。

摘要是「此前的机读线被压过」这一个事实，不是第二条事实源：轮记录仍是权威面，被覆盖的轮留在 `turns` 里供人读回查，机读线不再装它们。覆盖以轮记录为单位——该轮登记的全部记录消息都落在切割点之前才算覆盖；一轮被切开 ⇒ 该轮不记为已覆盖，恢复时宁可多装一轮，也不把半轮当整轮。

判据不写固定条数：`turnRecordMessages`（`agent/turn-projection.mjs`）按字段条件 push——`userRequest` ∥ `finalResponse` 非空各一条、`taskState` 非空一条；带 `toolProcess` 的轮另按切片逐条 push 工具段消息，条数随切片变（§1.1）。

无工具的简单问答因此只有两条（§1.1「没有工具活动的简单问答允许 taskState 为空」）。钉成三条会把这种轮永远判成未覆盖：恢复时它整轮重装，摘要已覆盖的轮又回到机读线。

tail 首条 assistant 的回声占位按当前 copy-on-write 规则并入；恢复读取时归并病态相邻 assistant，tool_calls 配对优先。

恢复装线前还要做一次配对收口，两支各有来由：

- 尾部没有工具结果的 `assistant(tool_calls)` 不装。来由是一次普通的 Stop（Ctrl+C）落在工具执行中：本轮的 `assistant(tool_calls)` 已经提交进机读线，工具结果要等工具批返回之后那一步才提交。
  中止先从工具批里抛出，不会变成一条工具错误（`dispatch-run.mjs`「User interrupt (Ctrl+C / Ctrl+I) must propagate, not become a tool error」，落地为 `if (signal?.aborted) throw error`）；补占位结果的那一段排在工具批之后（`turn-loop.mjs` 的 `const results = await executeToolCalls(...)` 之后才是 `if (signal?.reason?.interrupt)`），批里抛出的中止让那一行走不到，占位结果补不上。`interrupt` 标志只决定「批正常返回后补不补占位」，不决定「中止是否以抛出离开批」——Ctrl+C 也带它（`key-handler-ctrlc.mjs`「state.controller.abort({ interrupt: true })」）。
  回合随即异常收尾，CLI 的回合尾保存照旧落盘（`agent-turn.mjs`「Save session after every turn (survives crashes)」），槽里的在途段尾就是这条没有结果的调用。装进去等于让模型看到一条没有回复的调用，首个请求必 400。
- 前面没有对应调用的 `tool` 消息不装。来由是崩在记录追加中途留下的半行：槽里的 `history` 由段行逐条拼接，`saveProjectedSlot` 对损坏行逐行容错——坏行跳过、后续合法行照拼（`thincoder-core/session-store.mjs`「半行容忍（§6.14——读路径逐行容错）：崩溃在 append 中途留下的末尾半行/损坏行」）。
  被跳过的那行若正是一条 `assistant(tool_calls)`，它的 `tool` 结果就成了没有调用方的孤儿，随 `history` 落槽；无 `turns` 的旧槽与 `turns` 缺键的槽按 `history` 播种（`SESSION.md` §2 恢复第 3 步），这一支在那里生效。
  同一归一姿态：槽是盘上用户数据，与 `turns` ∥ `compactCheckpoint` 同属不可信输入（`normalizeSlotTurns` ∥ `normalizeCheckpoint`「槽是盘上用户数据，本函数不抛」）。

这两种消息在人读线上留的是 slim 之后的形态（`SESSION.md` §5：`tool` 内容前 500 字符、`tool_calls.arguments` 前 300 字符），`read_history` 取得到的就是这一段；长于它的部分只在内存的 `_fullHistory` 里，重启之后没有第二条通道。

不装它们不是丢证据，是把一条首个请求必 400 的线换成一条装得下的线：丢掉之后机读线尾落回完整交换边界，尾部那一支落在本轮用户请求上，仍是 §1 要的形。

压缩和蒸馏请求复用会话 system、真身中段、同声明 tools、同源 reasoningEffort 和尾部指令，不把记录文本再序列化成全新会话。

## 7. context 工具

准入 = depth-0。装配面是 `thincoder-core/agent/family-tools.mjs` 的 `depthOnly` 段（`const depthOnly = depth === 0 ? [...]`），其中同时挂着 `readHistoryTool` 与 `contextTool`；depth>0 的各角色段不挂这个工具（`agent-tools/context.mjs` 头注「**depth>0 不给**」）。

判据按装配段算，不逐角色算：这三个动作的准入由装配段一处决定，各角色段不会各自再判一次。

为什么不给：需求 §6 给的理由是没有全史回查面，而三个动作里只有 `compact` 借着这个面成立——它的回执要给模型一条取回的路（槽文件路径或 cwd 发现面），没有那个面就给不出可取回的位置。

`prune` 与 `stats` 不借此成立：`prune` 的回执只报释放量与跳过项、并请模型需要时重跑工具（§7.2），`stats` 只报六项读数（§7.1），两者都不指向任何回查位置，没有这个面也照旧给得出。三个动作同挂 `contextTool`、准入按装配段一处决定，`compact` 撑起的准入因此对另两个一并生效。

阈值兜底不受准入影响：自动压缩跑在 `runCompactionCheck`（`agent/run-stages.mjs`）的安全点上，不经过工具面——没有 `context` 工具的子代理照旧按阈值被压，只是不能主动触发。

### 7.1 stats

从同一 `contextUsage` ∥ `policyBudget` ∥ `historyReading` 取数，六项读数各自具名，不混用分母。首行的百分比分母 = `limit`（§2.5），与状态行同一个数。

六项 = 总量（首行 `Context ≈`）· 窗口与压缩线 · 请求预算（`policyBudget` 的 window ∥ max_tokens ∥ 两个来源名）· 分段（`Segments ≈` 行的 system ∥ tools ∥ history）· 缓存（`Cache:` 行的命中 ∥ 未命中 ∥ 响应数，取 `agent._cacheHitTokens` ∥ `_cacheMissTokens` ∥ `_usageTurns`）· 状态行历史读数。

`Segments ≈` 的 history 是未乘校准比的裸估算，与状态行的 `calibrated history estimate` 是两个量，名字已分开——不要把两者当同一个数。

### 7.2 prune

`collectStaleToolOutputs(history, provider, workMode, protectFrom, fixedOverhead, ratio)`（`thincoder-core/token-window.mjs`）选择保护尾外、且估算达到 `PRUNE_MIN_TOKENS`（200 token）的 tool 消息。四个新增实参的来处见 §2.3。

保护尾与压缩面是同一个尾：它按 `splitHistory` 取回的 `tailStart` 判「尾内」，第四参 `protectFrom` 由调用方给保留窗起点（§1.2、§2.3）。保留窗内那几轮的工具输出因此永远不在合格集里。

保留窗起点取得出来时，合格集已空：机读线上的 `tool` 消息只剩保留窗那几轮，而它们全在保护尾内。

残留的场景按**因**写，不按某一个槽的形状写：起点取不到时，`retentionWindowStart` 返回 `history.length`（§1.2「无保留窗时传 `history.length`，等价于不收紧」），尾只按 `keepTailSize` 与 `tailBudgetTokens` 收，早于尾的工具结果才可能进合格集。

取不到起点有两类状态：尚无一条轮记录带 `toolProcess`（新会话首轮即如此——这一轮进行中它还没有登记，身份账是空的）∥ 没有可用 `turns`、由 `history` 播种的旧槽（`SESSION.md` §2 恢复第 3 步，那条线上还留着折叠之前装进来的工具结果）。

原位替换 content 为 stub，不改数组、索引、tool_call_id 或全史。

prune 后基线按 §3.1 重定（不归零）；回执给出释放量与跳过项，并请模型需要时重跑工具。不指向任何回查位置——被 prune 的都是保留窗之外的工具结果，槽里只剩它们的 slim 前段（射程见 `SESSION.md` §5）；内存里的全史随进程走，重启之后没有第二条通道。

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
| 降级 | `onCompress(info)` 且 `info.mode === "fallback"`——摘要失败当次即走 `compressFallback`（§5.1 第 ⑥ 步），回执用同一回调、同一载荷位；载荷带 `discardedMessages` ∥ `discardedTurns` ∥ `tailMessages`（§5.1） |
| 失败 | `onCompressFail(error)`，单次失败即发 |

失败与降级不是同一件事：失败可以先来几次，达到上限那一步才降级；两个态各有自己的回调，端侧不必从失败次数反推降级。

headless 没有回调 ⇒ 全链可选链（`callbacks?.onCompressStart?.` ∥ `callbacks?.onCompress?.` ∥ `callbacks?.onCompressFail?.`）⇒ 安全 no-op：压缩、降级与失败计数照常执行，只是没人接收。

## 10. 验证

验证安全点、配对、预算公式、auto 配置、可达性门、强制面、越窗一次重试、估算样本恢复、prune 配对、主动压缩回执、恢复回声、全史不变、压缩检查点的落槽回读、恢复播种后的第二次压缩。

也验证：压缩后的在途段边界重定、在途段尾端孤立的调用与结果的收口、工具段双端截断后尾部结论仍在、保留窗在最小受支持窗口下仍完整落在保护尾里、固定开销单独越线的 typed error。

验证常态：absent 档预留取服务端默认输出（未封顶的窗口段上两条线间距恒为注入余量）、派生链单调（窗口增大时 `limit` 与 `threshold` 都不减小）、压缩线在封顶处饱和（窗口再大也不超过 `RETAIN_CAP_TOKENS`，`limit` 仍随窗口增长）、派生不成立在装载期报错并点三个数。

也验证：尾预算按减法链随窗口与固定开销移动、结构编辑后基线重定且下一次响应即自纠、压缩链先 prune 再重测（prune 够则不发摘要请求）、摘要失败一次即降级丢弃并报出丢弃条数。

以及：模型与参数变更后在首个回合之前处置存量历史、状态行百分比与压缩线同取 `limit` 为分母。
