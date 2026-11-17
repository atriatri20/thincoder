# Function Spec · M2 台账（SQLite）

> 当前设计 = `docs/core/design/LEDGER.md`；团队台账是另一套服务，不与本地台账混用。

## ① 模块目标

提供项目级需求池与技术待办的单一权威源。条目可跨会话持久化，状态、指针、证据、执行者和结算关系可验证。

## ② 功能点

1. **items 单表**：保存 id、kind、status、title、board、req_doc、task_book、evidence、trigger、executor、resume_when 和时间戳。
2. **六态**：待讨论、待设计、在途、待核销、已核销、已废弃；归档是状态值，不物理删除。
3. **迁移表**：待讨论→待设计/在途，待设计→在途，在途→待核销/待讨论，待核销→已核销/在途/待讨论；未归档态可撤回已废弃。
4. **核销唯一来源**：已核销只能从待核销进入，不能从在途跳过。
5. **退回**：在途或待核销退回待讨论必须带本次理由，并解绑 task_book、trigger、executor，保留 created_at。
6. **查询与写入**：query/count 对所有角色只读；add/update/close 仅主 agent 可写。
7. **项目存储**：数据库位于用户数据目录，按规范化项目根键控，不在工作树中。
8. **执行者**：进入活跃态记录当前会话；离开在途或退回时清理；判活只用于展示，不构成写锁。
9. **指针**：在途、待核销和归批行必须携 task_book；本笔新指名时必须可解析且在盘。
10. **证据**：核销需要非空工作证据；evidence 默认追加，evidenceReplace 才覆盖。
11. **条件复启**：trigger=条件时可携 resume_when；日期锚可判到期，事件锚只展示。
12. **读数**：query 提供 aged、overdue、evidenceTooLong、taskBookOnDisk；这些不自动改变写权。
13. **分页**：query 使用 keyset cursor，尾行携带总数、位次和保留过滤条件的下一页命令。
14. **批级操作**：update/close 可用 batch 选择同批条目；逐行迁移，拒绝行进入 skipped。
15. **批次结算**：batch close/status 使用 completed 与 closeEvidence，只完成明确点名的在途行，并结算既有待核销行。
16. **锚批门**：单独核销或放弃活跃行时，当前锚批未收口则拒绝；无指针、档不在盘和 retro-close 按 notices 处理。
17. **预定指针**：允许登记尚待创建批次档的预定指针；同一路径只能有一个预定行。
18. **开批同面**：同 board 有未决行时，开批须接手或说明为何是新债。
19. **迁移与审计**：旧盘符变体库通过显式 dry-run/confirm 迁移；audit 只读，不自动删除。

## ③ 边界

- 不做团队服务端台账；团队功能由 Server 与 team_ledger 承担。
- 不在项目工作树写数据库或 Markdown 镜像。
- 不让子代理写本地台账。
- 不用任务标题相似度推断同一件事。
- 不把读数 aged、overdue、taskBookOnDisk 自动升级为写门。
- 不用历史存量绕过当前状态机。
- 不让批次默认把所有在途行视为完成。

## ④ 验收

| # | 判据 |
|---|---|
| AC-M2-1 | kind、status、trigger 的非法值被 schema 或参数守卫拒绝 |
| AC-M2-3 | count 只统计四个未决状态 |
| AC-M2-4 | 子代理不能调用写动作 |
| AC-M2-5 | 在途/待核销缺 task_book 被拒绝 |
| AC-M2-7 | executor 随进入、离开和重开按当前规则变化 |
| AC-M2-9 | 表外迁移拒绝且行不变 |
| AC-M2-10 | 本笔新指名 task_book 必须有效；旧指针失效不阻止无关字段更新 |
| AC-M2-14 | 核销只从待核销，归档态不能再次归档 |
| AC-M2-15 | 参数类型、枚举、必填、id/batch 互斥和空标题在库动作前拒绝 |
| AC-M2-24 | aged、overdue 等读数可按夹具时间复现 |
| AC-M2-25 | evidence 追加与覆盖行为符合参数契约 |
| AC-M2-30 | 批次只完成 completed 点名的行，漏列在途行会拒绝收口 |
| AC-M2-33 | taskBookOnDisk 是读数，不是额外写门 |
| AC-M2-34 | 锚批未收口时单独核销拒绝；补关按当前条件处理 |
| AC-M2-37 | 同面开批可接手、可说明新债；重复预定被识别 |
| AC-M2-41 | 分页保留过滤，非法游标不会静默回首页 |

## ⑤ 依赖

- `thincoder-core/ledger-db.mjs`：存储、项目根和 schema。
- `thincoder-core/ledger-write-ops.mjs`：逐行状态与写门。
- `thincoder-core/ledger-cmd.mjs`：查询、批级操作与结算。
- `thincoder-core/ledger-tools.mjs`：工具 schema 和参数守卫。
- `thincoder-core/agent-tools/batch-*`：批次结算、重开、补关和一致性读数。
