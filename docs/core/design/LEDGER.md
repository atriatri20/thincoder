# 台账机制（LEDGER）· 设计

> 需求 = `docs/core/requirements/ENGINEERING-MODE-V2-SPEC-LEDGER.md`。
> 最近先例：`docs/core/design/MANIFEST.md` 的项目归属和 `BATCH-RECORD.md` 的批次生命周期。对齐 = 同一项目根、同一批次指针；偏离 = 本档负责 SQLite 状态与工作项证据。
> 勘察证据：已读当前 LEDGER 需求、设计和 ledger 工具契约。相关 = 六态、指针、证据、批级结算和查询读数。

## 1. 机制目标与范围

本地台账回答“这个项目还有哪些事、谁在做、做到了哪一步”。它不保存长正文，正文归需求、设计或过程文档。

范围包括 schema、状态机、参数守卫、项目根与库键、执行者、指针、证据、查询、分页、显示、批级操作和批次结算。

### 1.1 发现入账范围

只有当前任务范围内的已验证问题才入账。发现必须带可复现路径或实际读数。

范围外观察不进入报告或台账；若它阻断当前任务，则按当前任务受阻上报。

## 2. 存储与 schema

主要实现：

| 文件 | 职责 |
|---|---|
| `ledger-db.mjs` | DDL、项目根、库键、开库与迁移 |
| `ledger-write-ops.mjs` | 逐行更新、关闭和写门 |
| `ledger-cmd.mjs` | 查询、批级操作和结算 |
| `ledger-tools.mjs` | 工具 schema、参数守卫和动作分派 |
| `ledger.mjs` | 共享导出、扫描与展示 helper |
| `ledger-surface.mjs` | 共享展示机制 |

items 保存以下持久字段：id、kind、status、title、board、req_doc、task_book、evidence、trigger、executor、resume_when、created_at、updated_at、closed_at。

数据库约束覆盖 kind、status、trigger 和活跃行 task_book 非空。工具层另负责指针在本笔写入时的解析与存在性。

老库通过幂等 ALTER 添加后加列。迁移与审计使用显式命令，不随普通打开改写业务行。

### 2.1 库键与项目根

库键由 `ledgerKey(root)` 统一生成：

```text
sha1(normalizeCwd(root)).slice(0, 16)
```

项目根由 `resolveLedgerRoot` 使用 `owningProject` 推导：从动作目标沿祖先链取最近带 manifest 的目录，不向下选择子项目。库文件存在不构成项目标记。

工具面以上下文规定的会话锚为边界；其他读导出可使用自己的目标边界。多项目工作区无根时报告候选，不猜。

### 2.2 变体迁移与审计

`thincoder ledger migrate --dry-run` 只读报告。`--confirm` 先备份，再在事务中迁移、读回核验，并将源库移入回收目录。

`thincoder ledger audit` 只读分类，不删除残档。数据列以当前 DATA_COLUMNS 为准；id 可重发，映射写入报告。缺列、WAL 伴生、不可读和占用必须按当前 fail-closed 规则处理。

## 3. 状态机

| 当前状态 | 允许目标 |
|---|---|
| 待讨论 | 待设计、在途、已废弃 |
| 待设计 | 在途、已废弃 |
| 在途 | 待核销、待讨论、已废弃 |
| 待核销 | 已核销、在途、待讨论、已废弃 |
| 已核销 | 终态 |
| 已废弃 | 终态 |

待讨论/待设计不能直接进入待核销或已核销。核销唯一来源是待核销。退回待讨论需本次 evidence 理由，并清 task_book、trigger、executor。

### 3.1 executor

进入待设计或在途时，executor 使用显式值、当前会话或既有值的当前优先规则。待核销→在途始终写当前会话。

离开在途、退回待讨论和撤回时清 executor。核销不因此改写。executor 是可见归属，不是锁；判活失败不得误报死亡。

### 3.2 参数守卫

add/update/close/query/count 使用各自 schema 声明进行校验。校验先于数据库动作。

守卫覆盖：对象形态、未知键、必填、类型、枚举、空标题、id/batch 恰一、close 的动作形态和 cursor 形态。字段级 null 按当前“省略或清除”语义处理。

### 3.3 批级操作

update/close 可携带 batch。通过 task_book 文件部分解析同一批次的行。

- update 逐行重判迁移表，拒绝项进入 skipped。
- close --batch 只结算待核销行，其他状态跳过并说明。
- 单行与批量共用逐行写核。
- 事务级失败回滚，不能把部分成功伪装为全部成功。

### 3.4 resume_when

resume_when 是可空自由文本。空串或全空白拒绝。

日期锚可参与 resume_due；事件锚不由机器判断发生。退回或重锚保留既有非空条件句，并按当前收口规则追加过程证据。

## 4. 核心接口

| 接口 | 用途 |
|---|---|
| `ledgerAdd` | 新建待讨论行 |
| `ledgerUpdate` | 单行迁移或字段补丁 |
| `ledgerClose` | 单行核销或撤回 |
| `ledgerUpdateBatch` / `ledgerCloseBatch` | 批级处理 |
| `ledgerQuery` / `ledgerCount` | 读与计数 |
| `ledgerBatchRows` | 选同批行 |
| `ledgerReanchorBatch` | 批次收口重锚与结算 |
| `assertLedgerCloseDisposition` | 收口完成清单只读预检 |

所有写入口共用迁移、证据、指针、锚批和 executor 规则。

## 5. 查询读数

| 读数 | 含义 |
|---|---|
| `aged` | 未决行且行龄超过当前常量 |
| `overdue` | resume_due、dangling、unlabeled、aged 的首中结果 |
| `evidenceTooLong` | evidence 超过可读性读数阈值 |
| `taskBookOnDisk` | 当前 task_book 文件部分可解析且在盘 |

这些是计算字段，不写入 items，也不进入 DATA_COLUMNS。它们不自动阻止更新或关闭。

## 6. 指针与批次门

### 6.1 task_book 写门

结果行处于在途、待核销或 trigger=归批时，task_book 必填。

本笔新写 task_book 或新写 trigger=归批时，指针必须非空、文件部分可解析且目标在盘。只改其他字段时，旧指针目标已清理不形成额外阻塞；重新指到不存在目标仍拒绝。

### 6.2 批次收口

batch close 与 status→已收口共用：

- `completed`：本批完成的在途行 id 数组。
- `closeEvidence`：本批实际工作证据。

未点名的在途行阻止收口。已完成行在同一事务中从在途经待核销到已核销；既有待核销行一并结算。closeEvidence 追加到各行 evidence。

待讨论/待设计等待行按当前规则重锚为条件或保持认账不排期。失败不得被写成成功。

### 6.3 开批同面

同 board 有未决行时，batch create 需：

- 用 ledger 接手一条；或
- 用 newDebt 说明这是不同工作。

预定指针的合法认领路径优先于同面新债判定。ledger 与 newDebt 不同时使用。

### 6.4 预定指针

预定值以当前预定标记结尾，文件部分必须是项目相对的批次路径。批次尚不存在时 taskBookOnDisk=false，但不当作 stale。

batch create 遇到同一路径唯一预定行时认领它，并将指针改为普通形式。多个预定行指向同一路径时拒绝。

## 7. 查询与展示

### 7.1 查询字段与过滤

query/count 支持 status、kind、board、trigger、task_book 等当前等值过滤。query 返回当前持久字段与计算读数。

count 返回未决数量、overdue 和 evidenceTooLong 等当前汇总。归档行不进入未决计数。

### 7.2 分页

query 使用固定页大小和 `<updated_at>|<id>` keyset 游标。游标非法时拒绝，不回首页。

尾行给出总数、本页位次和下一页调用。下一页命令必须保留本页过滤条件。分页不承诺跨写操作快照一致。

### 7.3 可见面

状态标记按当前项目或工作区范围汇总需求与技术待办。显示老化、待处置和执行者信息时复用同一读数。

没有可动作项时不增加噪音。项目或数据库不可读时明确降级，不把未知显示成零。

## 8. 验收

验收覆盖：

- schema 与六态迁移。
- 参数失败零数据库副作用。
- 指针新写、旧指针和预定指针。
- evidence 追加、覆盖、退回理由和核销证据。
- 单行、批级、批次结算和锚批门。
- executor 与判活三态。
- 查询过滤、分页、读数和工作区展示。
- 迁移备份、事务核验、回收和只读审计。

## 9. 边界

不做团队服务端台账、项目内镜像、子代理写权、标题相似度匹配、自动接手、心跳写库或读数自动升级写门。

不为历史批档执行全库自动修复。清理由明确维护动作执行。

## 10. 状态诚实化

状态只表达工作事实：

- 未完成活跃行可退回待讨论。
- 已核销与已废弃是终态。
- 核销需要工作证据。
- 批次不替行主人猜完成。
- 锚批未收口时，不允许活跃行绕过 batch close 单独归档。
- 档不在盘、无指针和 retro-close 通过 notices 说明，不制造永久死锁。

## 11. 批档与台账双向收口

### 11.1 同向原则

活跃行与未冻结批档不能长期互相矛盾。正常路径由 batch close 同笔结算并冻结。

### 11.2 锚批门

核销与放弃都检查锚批状态。档 open 或状态不可判时，活跃行不能单独归档。

无 task_book、非批档、档不在盘和 retro-close 按当前 notices 放行或留痕。notice 不是工作证据。

### 11.3 补关

当批次行集已全部归档，且唯一一致性读数为 open-but-settled 时，可以补关批次。补关只冻结并记录原因，不补造评审、批准或验证段。

伴随其他不一致、仍有在途行或状态 unknown 时不能补关。

### 11.4 取代与重开

被取代批次按当前 supersede 规则结算已完成行、退回未完成行。重开只回收允许回收的行，归档终态不因此复活。
