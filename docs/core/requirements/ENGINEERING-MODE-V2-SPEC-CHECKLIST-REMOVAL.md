# Function Spec · M7 待办面

> 当前权威 = `docs/core/requirements/ENGINEERING-MODE-V2.md`、`docs/core/design/LEDGER.md`。

## ① 模块目标

项目待办统一使用 ledger 六态。独立 checklist 工具、文件、同步脚本、启动注入和路径前缀禁用不是当前产品面。

## ② 功能点

1. 需求池与技术债共用台账，不在另一处复制状态。
2. task 只跟踪当前执行步骤，不替代持久台账。
3. 待办通过 ledger 查询和批次链进入工作，不靠 checklist 启动注入。
4. 普通代码注释或 verify 的 self-review checklist 用词不表示存在另一套待办系统。
5. 子代理只读台账；新发现交给主 agent 入账。

## ③ 边界

- 不恢复旧 checklist 数据或工具。
- 不把历史迁移过程写成当前需求。
- 不把 task 的临时清单当长期需求池。

## ④ 验收

| # | 判据 |
|---|---|
| AC-M7-1 | 工具表无独立 checklist 待办工具 |
| AC-M7-2 | 待办状态由 ledger 六态表达 |
| AC-M7-3 | 启动上下文不注入旧 checklist 文件 |
| AC-M7-4 | task 与 ledger 的职责在提示词和文档中不混淆 |

## ⑤ 依赖

LEDGER、NORMAL-MODE、ENGINEERING-MODE-V2。
