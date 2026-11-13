# Server 团队台账 · 设计

> 总览 = `docs/server/design/PROJECT.md`；权限 = `../project/PROJECTS.md`；端侧 = `docs/core/design/TEAM-LEDGER.md`。
> 最近先例：core 本机 ledger 六态与 server 项目能力。对齐 = 同状态词，不同存储与代码路径。
> 勘察证据：已读全局表、两面端点、上送、老化与审计。相关 = 当前团队账。

## 1. 数据与权限

team_ledger_items 全局自增编号，repo 为归一 git 地址，含六态、title/detail/owner、创建者和时间。

读需 can.view，写需 can.write，完整角色映射归 `../project/PROJECTS.md` 的同一能力矩阵。新建时未登记仓 400，仓存而不可见 404 不辨，可见无写权 403。项目删除不级联删除账：项目仍在时按现存权限；项目已删时 admin 仍可读写该仓存量账，其他成员不可见，但任何成员都不能给未登记仓新建账。

## 2. 状态与接口

控制台 /api/ledger 用 cookie，端侧 /api/client/ledger 用登录 token，均调 items.mjs。

创建固定待讨论，编辑按下列迁移边；不在表内的跨态迁移 400。已核销/已废弃是终态，任何再写均 400；因此迁移常量中的已核销→已废弃也会被终态门先拒。

| 当前状态 | 允许后继 |
|---|---|
| 待讨论 | 待设计、已废弃 |
| 待设计 | 在途、已废弃 |
| 在途 | 待核销、已废弃 |
| 待核销 | 已核销、已废弃 |
| 已核销 | 无 |
| 已废弃 | 无 |

close 只接受已核销/已废弃；已核销只能来自待核销，已废弃可来自任意未归档态。

aged 的当前来源是 items.mjs 的 `AGING_DAYS=30`：仅待讨论/待设计/在途/待核销可能老化，以 `updated_at ?? created_at` 为锚，行龄严格大于 30 天为 true；时间缺位或不可解析为 false，不归档态为 false。

## 3. 两账与审计

本机账仍以本地目录为键，团队账以 git 源为键，无缓存、自动映射、双向同步或合并。

上送由 agent 显式读本机账再写团队账，不回写、不建链接。create/edit/close/withdraw 写 ledger_event，含 repo/id/surface。

## 4. 验证

验证全局编号、仓归一、权限负例、状态边、老化、断网无缓存、两账独立和审计。
