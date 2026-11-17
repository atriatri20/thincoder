# Function Spec · M5 委派与 spawn 门

> 当前设计 = `docs/core/design/AGENT-LOOP-SUBAGENT.md`；工程交界 = `BATCH-RECORD.md`、`DESIGN-TOKEN-SETTLEMENT.md`。

## ① 模块目标

不同角色只能收到自己的任务书形态和工具面。工程角色的任务书来自绑定批档：eng-coder 取 §2，eng-designer 读整份记录（§1 是父侧裁决面，§2 是它自己的笔）。非工程角色使用结构化任务书。

工程角色的任务书正文另在 spawn 当刻随系统提示词固块下发（`eng-coder` = §2、`eng-designer` = §1 + §2），使全程不变的输入不随历史折叠与压缩丢失；固块在 spawn 当刻冻结，其余段由该角色按需从磁盘读。

## ② 功能点

1. **工程角色**：eng-designer / eng-coder 必须有可读 batchDoc、round；eng-coder 还必须有匹配 designId/designToken。
2. **工程文本禁带**：goal、knownFacts、acceptance、reportFormat、scope、task、context 不作为工程角色任务书参数。
3. **非工程角色**：explore / plan / coder / tester 必须有 goal、knownFacts、acceptance、reportFormat、scope。
4. **角色集合**：普通模式 explore/plan/coder/tester；工程模式 explore/eng-designer/eng-coder/tester。advisor 走独立工具。
5. **files**：文件级预期写入域，供调度冲突检测，不是授权；目录不接受。
6. **dependsOn**：引用有效异步任务 id，依赖与文件冲突由调度器排队。
7. **async**：depth-0 的 `spawn` 必须显式传 `async`——`true` 异步（结果自动送达）、`false` 阻塞（本 turn 等结果），省略即拒；`escalate` 自带形态，省略仍指异步飞行，`false` 才要阻塞。depth>0 一律 `async:false`，子代理内不跑异步 spawn。
8. **失败可见**：缺参、越角色、不可读、凭证不匹配和调度错误均明确拒绝。

## ③ 边界

- 不用 files 代替写权。
- 不让模型用自由文本绕过批次任务书。
- 不把 tester 当实现角色。
- 不靠任务大小裁量跳过工程链。

## ④ 非功能约束

- 门序判定是本地检查：读批档、比对凭证、查同档占用，不发起模型调用、不写盘。
- 任务书固块在单个 child 生命周期内逐字节不变；判据见设计 `AGENT-LOOP-SUBAGENT.md` §11.1 的破坏形与判读式。
- 子代理之间无共享可变状态，共享面只有批档本身；同档占用按 `task_book` 指针判定。
- 失败可见：拒绝必须携带可读原因（缺哪个参数、哪个角色越界、哪个路径不可读），不静默降级。
  拒绝面指门与所请求的动作本身；与之并列的**可缺省项**（如随附的文档坐标块）不可得时不构成拒绝理由，按缺省处理且在结果里标明缺了什么——两类处置不共用一条判据，也不许把可缺省项写成静默消失。

## ⑤ 验收

| # | 判据 |
|---|---|
| AC-M5-1 | 工程角色缺 batchDoc、round 或凭证时拒绝 |
| AC-M5-2 | 工程/非工程任务书参数按角色收放 |
| AC-M5-3 | 非法角色、目录 files、未知依赖明确拒绝 |
| AC-M5-4 | 同文件任务和依赖按调度器顺序执行 |
| AC-M5-5 | depth 与 async 规则一致：depth-0 的 `spawn` 省略 `async` 即拒，`true` 走异步、`false` 走阻塞；`escalate` 省略合法（异步飞行），只有传 `false` 才走阻塞；depth>0 传 `true` 即拒 |
| AC-M5-6 | 工程角色的系统提示词含其切片的任务书原文，同一 child 生命周期内逐字节不变 |

## ⑥ 依赖

BATCH、TOKEN、ASYNC-POOL、TOOL 权限与项目归属。
