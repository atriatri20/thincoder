# 子代理工具与装配（AGENT-LOOP-SUBAGENT）· 设计

> 需求 = `docs/core/requirements/AGENT-LOOP.md`；工程规格 = `ENGINEERING-MODE-V2-SPEC-DELEGATION.md`。
> 最近先例：`ADVISOR-CONVERGENCE.md` §4.2 的 fresh session（每轮重建会话、旧 read 输出不进新会话）与 `BATCH-RECORD.md` §4.2 的档绑定（装配点 = `subagent-spawn.mjs` 的 `batchBound` / `child._batchDoc`）。对齐 = 参数门与调度事实分离：门只判参数形态，装配读绑定后的调度事实。
> 勘察证据：已读本仓参考系 `thincoder-core/agent-tools/subagent-spawn.mjs`（`buildSpawnChild` 的 `spawnBlocks` 收集序）∥ `subagent.mjs`（async 参数形与拒文）∥ `spawn-gates.mjs`（`ENGINEERING_ROLES`、任务书参数门）∥ `audit-block.mjs`（`buildAuditBlock`）∥ `subagent-async.mjs`（`ASYNC_POOL_LIMITS`、`poolDomainOf`）∥ `batch-skeleton.mjs`（段界正则）。外部源码档 = 已查，无相关：本档机制全在本仓代码内。

## 1. 角色

| 角色 | 能力 | 模式 |
|---|---|---|
| explore | 只读探索 | 两模式 |
| plan | 只读规划 | 普通 |
| coder | 实现与验证 | 普通 |
| eng-designer | 设计与批次 §2 | 工程 |
| eng-coder | 凭证实现与批次 §5 | 工程 |
| tester | execute/bash + 只读，运行并报告 | 两模式 |

角色由 schema 与运行门双重检查。子代理内的 eng-coder/eng-designer 只能按当前规则派同步只读 explore。

## 2. 九动作

| action | 语义 |
|---|---|
| spawn | 创建子代理 |
| status | 池、pending 与升级账概览/单查 |
| observe | 运行子代理近期活动 |
| send | 向运行中异步子代理注入指令 |
| escalate | 委派更强模型实现 |
| cancel | 定向取消子代理或评审 |
| panel | 查看或回收宿主面板 |
| consume-design | 消费设计凭证 |
| design-slots | 只读清点设计凭证 |

除 spawn 外，池管理动作只在 depth-0。consume/design-slots 还限工程父侧。

### 2.1 async

depth-0 `spawn` 必须显式传 `async`：`true`（异步，结果自动送达）或 `false`（阻塞，本 turn 等结果）；省略即拒。depth>0 必须 `async:false`（escalate 只在 depth-0，故该句只及 spawn）。依据 `thincoder-core/agent-tools/subagent.mjs`「subagent: async is required — pass true for an async spawn or false for a blocking flight」：depth-0 传 `false` 合法。

`action:'escalate'` 自带形态——省略仍指异步飞行，`false` 才要阻塞（同档工具描述「action:'escalate' keeps its own form: omission there still means the async flight, and `false` asks for the blocking one」）。

### 2.2 observe/send

observe 返回摘要、当前工具、turn、touched 和 recent，不灌全历史。

send 写入 entry._injected，子在下一边界当普通用户指令消费。queued/sync/settled/cancelled/unknown 明确拒绝；settle 前未消费时报告 undelivered。

### 2.3 cancel

cancel 必须指定 id。运行条目中止 controller，排队条目出队；取消保留未完成工作的真实状态，不合并为已审交付。

## 3. spawn 任务书

### 3.1 工程角色

batchDoc 与 round 必填。eng-coder 另需匹配 designId/designToken。

工程角色的任务书 = 绑定批档，不带自由文本参数；禁带名目以需求 `ENGINEERING-MODE-V2-SPEC-DELEGATION.md` ② 第 2 条为准，本档不重抄——重抄会与需求档各存一份、漂成两份活本。

- eng-coder 读 §2：实施与验收的唯一来源，作者是 eng-designer。
- eng-designer 读整份批档（§1 + §2 另随固块冻结，§3–§6 自读磁盘）：§1 承载父侧裁决且具约束力，§2 是它自己的笔；需求层只作核对面，不改写。
  §2 的笔在设计席，主 agent 不得写；方向若不从 §1 到设计席，initial 轮就没有被授权的通道。

任务书正文随 system 固块下发（§8.1），切片与上列同源：eng-coder = §2、eng-designer = §1 + §2。首条 user 消息只留指向句：批档路径 ＋ 其余段自读（§8.2）。

「唯一」措辞只对 eng-coder 的那一段成立：它的任务书就是 §2。eng-designer 侧不出现「唯一通道」措辞——它的通道是整份批档，§1 的裁决对它具约束力。

### 3.2 非工程角色

goal、knownFacts、scope、acceptance、reportFormat 必填且为非空白字符串。task/context 只是可选补充。

### 3.3 门序

角色与模式 → batchDoc 可读与同档占用 → 任务书参数 → round → token → files/dependsOn → 调度。

门只检查形式、路径、状态和凭证，不用正则判断 §2 的语义质量。

## 4. 文件域调度

files 归一为文件级绝对路径。目录拒绝。dependsOn 引用有效异步 id。

running 与 queued 的有效文件域 = 声明域加运行条目已触碰文件。冲突和依赖决定 queued/running。

同文件串行只让 running 或先入者阻断，避免 queued 互等。依赖失败/取消时按当前 AUTO 与父侧处置规则处理。

补位不启动 done/cancelled 条目。未知依赖和成环拒绝。

files 只用于调度和子侧可见性，不是授权边界；清单外必要改动必须报告。

## 5. 批次占用与写门

batchDocInFlight 检查当前子代理池内 running/queued 的同档条目。命中即拒，不排队；done 后顺序交接允许。

绑定子代理通过文件写工具只能写自己的批次档和当前合法伴随件，不能写其他批次档。batch 工具另按段身份控制。

file_ops、bash、execute 等不在该文件路径门的宣称范围内。

## 6. 权限与模型

手动档 = 父会话未开 autoApprove；此时子代理的工具调用不直接放行，逐次经父权限面 `onPermissionRequest` 询问（依据 `thincoder-core/agent-tools/subagent-spawn.mjs`「} else if (parent.autoApprove) {" 之后的 else 分支）。eng-coder 的任务域授权只豁免逐写询问，不绕过 plan/token/business 门。

模型选择顺序 = 参数 model → agent.subagentModels[role] → agent.subagentModel → 父 provider。配置和 settings 保持同一合法形态。

## 7. 中止来源

abortInfo 结构包含 trigger、layer、detail。trigger = user/timeout/cancel/stop/unknown；layer = provider/agent/settle。

controller 链保留 reason，报告合成器在原消息后附来源，不用字符串猜测替代结构字段。

## 8. spawn system 固块

### 8.1 载体

buildSpawnChild 收集 spawn 级稳定块到 child._spawnSystemBlock，prepareRun 在角色槽之后、项目指令之前拼接。

工程角色的任务书正文进 system 固块，按角色切片：eng-coder = §2、eng-designer = §1 + §2。

为什么进固块而不随首条 user 消息：一个 spawn 一份任务书，正文在整个 spawn 周期内不变，落在 `history` 里却被折叠与压缩吞掉——跑过十几轮，子代理手上只剩自己的记忆。system 段不被压缩，同一理由已用在该面另外两类指令上：依据 `thincoder-core/agent-tools/subagent-spawn.mjs`「**spawn 级固定机制性指令改走 system 固块**」。

切片按 `^## §\d` 段头机械切，不解析标题文字：批档骨架本身产 `## §2 批次任务与设计（<设计席>）`，段界正则已是单源——`thincoder-core/agent-tools/batch-skeleton.mjs`「const nextRe = /^## §\d/gm」。该标记是机制所有物、不是人手标题：`batch` 工具拒收正文里新起的 `## §N` 段头，故两个段头之间的文本就是该段正文。

快照语义：正文在 buildSpawnChild 当刻读一次并冻结，此后批档改动不回流——授权的就是那一刻的文本。冻结按段分：eng-coder 冻结 §2，eng-designer 冻结 §1 + §2；§3–§6 不进固块，由该角色按需从磁盘读，改动随时可见。块首自带一行说明：本副本是 spawn 时刻的快照，改写或引述某段之前重读磁盘；`batch` 工具的 `edit` 锚点也只取磁盘现行文本。

失效即拒：该角色的段切不出来（文件不可读、或没有对应段头）⇒ 拒发 spawn 并点名路径与缺失段。退回只发指向句会让本节承诺落空而无人知道。

不设长度上限、不截断：截断后的副本仍自称任务书原文，比不给更坏。

### 8.2 块

收集序 = 任务书正文 → 批档路径 → 工程审计上下文 → files 写域 → 文档坐标。

- 任务书正文：按角色切片的原文（§8.1）。仅工程角色携带。
- 批档路径：一行绝对路径，块内自指用——既有形态不变。逐角色的任务书指向句不在此块，随首条 user 消息下发（§3.1）。
- 工程审计上下文：只由审计 spawn 携带——依据 `thincoder-core/agent-tools/subagent-spawn.mjs`「if (engAuditAttempt !== null) spawnBlocks.push(buildAuditBlock(ctx))」。
  装的是被审 eng-coder 的范围证据与审计模板：`_touchedFiles` 快照 ∥ 批档路径 ∥ 审计指令、预算、报告格式三段模板（构造器 = `thincoder-core/agent-tools/audit-block.mjs` 的 `buildAuditBlock`）。
  来源 = 父侧条目的 `ctx.agent._touchedFiles` 与 `ctx.agent._batchDoc`，不读 eng-coder 自述；两项缺失时各落占位 `- (none yet)` 与 `(unavailable)`（依据同档「|| "- (none yet)"」「"(unavailable)"」），不拒 spawn；非审计 spawn 整块不推。
- files 写域及“不是授权、只是本任务份额”。
- 文档坐标。

文档坐标从项目 manifest docRoot 的 requirements/design/batches 派生，使用 missingKeys 区分未声明与默认值。manifest 不可读时不推该块，不影响 spawn。

## 9. tester 工具面

基础集 = 只读工具 ∪ execute/bash，减 verify/advisor；再应用通用子代理排除。

tester 不写批次或台账，不修改实现、文档、既有测试或断言。执行工具可创建测试所需临时夹具，报告必须列出实际写入位置。

execute/bash 具有真实文件写入和命令执行能力。「只跑不改」是 tester 的角色纪律，不是文件系统隔离或安全沙盒；工具表不提供机制保证的只读边界。

tester 使用非工程五项任务书，落 other 池。other 池 = 异步池两个分域之一（`subagent-async.mjs` 的 `ASYNC_POOL_LIMITS = { engCoder: 4, other: 4 }`，判据 `poolDomainOf(role)`：eng-coder 进 engCoder 域，其余角色一律进 other 域）。报告是命令与读数，不是 verify 或评审结论。

## 10. 文档工具

全部子代理、consult 和 advisor 获得 doc_check 与只读 doc_graph。depth-0 才有 scan。

docTools 在 family-tools 单点组合；advisorToolsFor 在自己的装配点加入。同名工具不重复挂载。

工具在场不等于评审必须调用它们；语义结论仍来自阅读证据。

## 11. 验证

验证角色集合、任务书参数、async/depth、凭证、同档占用、files/dependsOn、权限、abort 来源、system 稳定、tester 和文档工具变体。

### 11.1 system 稳定

判据 = 同一 child 的 systemPrompt 在任一 run（首发 / resume / 追问重跑）逐字节相同：固块只在 buildSpawnChild 构造一次，`prepareRun` 只拼接、不重算。批档在 spawn 之后被改，system 面不变（§8.1 快照语义）。

破坏形 = 在 turn 边界重读批档、按当前内容重算固块，或把本轮才有的东西（当前轮次、本轮新产生的工具输出）写进块里。spawn 当刻的 §2 快照是该块的规定内容（§8.1），不是破坏形。判读 = 同一 child 连跑两次 `prepareRun`、期间改一次批档，两次 systemPrompt 字符串相等。
