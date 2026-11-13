# 子代理工具与装配（AGENT-LOOP-SUBAGENT）· 设计

> 需求 = `docs/core/requirements/AGENT-LOOP.md`；工程规格 = `ENGINEERING-MODE-V2-SPEC-DELEGATION.md`。
> 最近先例：`ADVISOR-CONVERGENCE.md` 的实例隔离和 `BATCH-RECORD.md` 的绑定写面。对齐 = 参数门与调度事实分离。
> 勘察证据：已读角色、九动作、spawn 门、files、固块、tester 和文档工具装配。相关 = 当前工具参数。

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

depth-0 spawn/escalate 必须显式 async:true；depth>0 必须 async:false。结果自动送达，无 check 动作。

### 2.2 observe/send

observe 返回摘要、当前工具、turn、touched 和 recent，不灌全历史。

send 写入 entry._injected，子在下一边界当普通用户指令消费。queued/sync/settled/cancelled/unknown 明确拒绝；settle 前未消费时报告 undelivered。

### 2.3 cancel

cancel 必须指定 id。运行条目中止 controller，排队条目出队；取消保留未完成工作的真实状态，不合并为已审交付。

## 3. spawn 任务书

### 3.1 工程角色

batchDoc 与 round 必填。eng-coder 另需匹配 designId/designToken。

任务书唯一来源是绑定批次 §2。goal、knownFacts、scope、acceptance、reportFormat、task、context 等自由文本不作为第二通道。

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

子代理手动档非只写操作经父权限面；eng-coder 的任务域授权只豁免逐写询问，不绕过 plan/token/business 门。

模型选择顺序 = 参数 model → agent.subagentModels[role] → agent.subagentModel → 父 provider。配置和 settings 保持同一合法形态。

## 7. 中止来源

abortInfo 结构包含 trigger、layer、detail。trigger = user/timeout/cancel/stop/unknown；layer = provider/agent/settle。

controller 链保留 reason，报告合成器在原消息后附来源，不用字符串猜测替代结构字段。

## 8. spawn system 固块

### 8.1 载体

buildSpawnChild 收集 spawn 级稳定块到 child._spawnSystemBlock，prepareRun 在角色槽之后、项目指令之前拼接。

任务正文仍由子代理从批次读取，不把易变任务文本冻结进 system。

### 8.2 块

- 批次路径与 §2 指向。
- 工程审计上下文。
- files 写域及“不是授权、只是本任务份额”。
- 文档坐标。

文档坐标从项目 manifest docRoot 的 requirements/design/batches 派生，使用 missingKeys 区分未声明与默认值。manifest 不可读时不推该块，不影响 spawn。

## 9. tester 工具面

基础集 = 只读工具 ∪ execute/bash，减 verify/advisor；再应用通用子代理排除。

tester 不写批次或台账，不修改实现、文档、既有测试或断言。执行工具可创建测试所需临时夹具，报告必须列出实际写入位置。

execute/bash 具有真实文件写入和命令执行能力。「只跑不改」是 tester 的角色纪律，不是文件系统隔离或安全沙盒；工具表不提供机制保证的只读边界。

tester 使用非工程五项任务书，落 other 池。报告是命令与读数，不是 verify 或评审结论。

## 10. 文档工具

全部子代理、consult 和 advisor 获得 doc_check 与只读 doc_graph。depth-0 才有 scan。

docTools 在 family-tools 单点组合；advisorToolsFor 在自己的装配点加入。同名工具不重复挂载。

工具在场不等于评审必须调用它们；语义结论仍来自阅读证据。

## 11. 验证

验证角色集合、任务书参数、async/depth、凭证、同档占用、files/dependsOn、权限、abort 来源、system 稳定、tester 和文档工具变体。
