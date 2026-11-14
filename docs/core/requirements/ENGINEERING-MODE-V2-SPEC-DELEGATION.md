# Function Spec · M5 委派与 spawn 门

> 当前设计 = `docs/core/design/AGENT-LOOP-SUBAGENT.md`；工程交界 = `BATCH-RECORD.md`、`DESIGN-TOKEN-SETTLEMENT.md`。

## ① 模块目标

不同角色只能收到自己的任务书形态和工具面。工程角色的任务书来自绑定批档：eng-coder 取 §2，eng-designer 读整份记录（§1 是父侧裁决面，§2 是它自己的笔）。非工程角色使用结构化任务书。

## ② 功能点

1. **工程角色**：eng-designer / eng-coder 必须有可读 batchDoc、round；eng-coder 还必须有匹配 designId/designToken。
2. **工程文本禁带**：goal、knownFacts、acceptance、reportFormat、scope、task、context 不作为工程角色任务书参数。
3. **非工程角色**：explore / plan / coder / tester 必须有 goal、knownFacts、acceptance、reportFormat、scope。
4. **角色集合**：普通模式 explore/plan/coder/tester；工程模式 explore/eng-designer/eng-coder/tester。advisor 走独立工具。
5. **files**：文件级预期写入域，供调度冲突检测，不是授权；目录不接受。
6. **dependsOn**：引用有效异步任务 id，依赖与文件冲突由调度器排队。
7. **async**：depth-0 显式传值；子代理内同步。
8. **失败可见**：缺参、越角色、不可读、凭证不匹配和调度错误均明确拒绝。

## ③ 边界

- 不用 files 代替写权。
- 不让模型用自由文本绕过批次任务书。
- 不把 tester 当实现角色。
- 不靠任务大小裁量跳过工程链。

## ④ 验收

| # | 判据 |
|---|---|
| AC-M5-1 | 工程角色缺 batchDoc、round 或凭证时拒绝 |
| AC-M5-2 | 工程/非工程任务书参数按角色收放 |
| AC-M5-3 | 非法角色、目录 files、未知依赖明确拒绝 |
| AC-M5-4 | 同文件任务和依赖按调度器顺序执行 |
| AC-M5-5 | depth 与 async 规则一致 |

## ⑤ 依赖

BATCH、TOKEN、ASYNC-POOL、TOOL 权限与项目归属。
