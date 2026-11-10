# 2026-11-10 · p0-1-ledger-state-machine
> 六段，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 每段只有一个作者：作者的段可 `append` 加内容、可就地改（`edit`）；非作者一概拒。
> 编制：主 agent · 2026-11-10 · 来源 = 用户 2026-11-10 16:11「我看了，挺好，这些工作我认为都要做，从P0-P2，都需要做，你开工吧，依次做完，自动执行」；范围与判据 = `docs/core/requirements/ENGINEERING-SYSTEM-OPTIMIZATION.md` A1–A7。
> 台账 = #2284（core · 归批）。前情 = 无（独立批）。
## §1 讨论（主 agent）
**状态行**：已收口 2026-11-10
批起 sha = 4fafb49c002e12d935989fd9a7eeb72d0d0d2c6b
<§1 模板占位：本批条目 / 关键判据 / 授权口径>

## 讨论（P0-1 状态机诚实化）

**来源**：`docs/core/requirements/ENGINEERING-SYSTEM-OPTIMIZATION.md` A1–A6（A7 归 P0-2）。
**目标**：让每条状态都说真话——没做完的行能退回等待态，已完成的行能凭证据核销，批档与台账不再互相绑架。

### 已定决定（父侧）

- **D1 加退回边**：`在途 → 待讨论`、`待核销 → 待讨论`，**理由必填**，`executor` 清空、`task_book` 解绑。理由：状态机必须能表达「没做完/认错领」，否则只能借待核销或已废弃撒谎。
- **D2 核销解耦**：核销证明 = 「工作完成的证据」，不再要求锚批已收口。批暂缓/撤销时，已完成行仍可核销；未完成行走 D1 退回。
- **D3 收口逐行处置**：`batch close` 不再默认把全部在途行推到待核销。调用方须给出完成清单；未列入的在途行必须先退回待讨论，否则收口拒绝。
- **D4 归档即终态**：禁止 `已核销 → 已废弃`（当前 `ALLOWED_MIGRATIONS` 允许），错核销不通过改历史修复；同时保持批档重开不回收已核销。若评审认为需要可撤销归档，改为「重开可回收已核销」并给理由，两选一。
- **D5 撤回 guard**：`close(已废弃)` 加源态判断，已废弃不可重复撤回。
- **D6 executor 统一**：手工 `待核销 → 在途` 与批档重开走同一 executor 规则（写当前 session）。

### 库内勘察

`库内 = 已查：台账状态机与核销/收口实现 → thincoder-core/ledger-db.mjs（ALLOWED_MIGRATIONS）、ledger-write-ops.mjs（applyRowUpdateTx/applyRowClose）、ledger-close-proof.mjs（assertCloseOutProof）、batch-lifecycle.mjs（closeBatchRecord）、batch-ledger-bind.mjs、batch-reopen.mjs`
`库外 = B 类：改动面 = 本仓状态机与批档代码；外部断言 = 零`

### 既有件三问

- `existing: thincoder-core/ledger-db.mjs · name: "ALLOWED_MIGRATIONS" · consumers: ledger-write-ops.mjs 的 applyRowUpdateTx`（迁移唯一定义处，改它而不是别处另立规则）
- `existing: thincoder-core/ledger-close-proof.mjs · name: "assertCloseOutProof" · consumers: applyRowClose / applyRowUpdateTx`
- `existing: thincoder-core/agent-tools/batch-lifecycle.mjs · name: "closeBatchRecord" · consumers: batch close`

### 边界

不改提示词、不改文档判据、不动其他批档。

## §2 批次任务与设计（eng-designer）
**状态行**：设计完成（D1–D6 已落 LEDGER §10；需求层旧核销门判据上抛主 agent）
### 本批条目

| 覆盖 | 内容 | 设计与验收落点 |
|---|---|---|
| A1 / D1 | 增加 `在途 → 待讨论`、`待核销 → 待讨论`；本笔理由必填，解绑并清执行者 | `docs/core/design/LEDGER.md` §10.2、§10.5 |
| A2 / D2 | 核销只凭工作完成证据，不读锚批收口与评审状态 | 同档 §10.2、§10.5 |
| A3 / D3 | 两条收口通路都要求 `completed`；只推进点名行，漏列在途行使收口在写档前拒绝 | 同档 §10.2、§10.5 |
| A5 / D4 | 已核销与已废弃均为终态，重开不回收已核销 | 同档 §10.2、§10.4 |
| A6 / D5 | 归档源态门拒绝已核销再撤回与重复撤回 | 同档 §10.2、§10.6 |
| A6 / D6 | 手工回退与批档重开统一写当前会话 executor | 同档 §10.2、§10.5 |

A7 属后续批次，本批不覆盖。机制、接口形、负例、关键决策与边界均以 `docs/core/design/LEDGER.md` §10 为单源，本节不复制判据值。

### 受影响文件与测试覆盖

| 文件 | 处置 |
|---|---|
| `thincoder-core/ledger-db.mjs` | 迁移表 |
| `thincoder-core/ledger-write-ops.mjs` | 退回、核销、归档 guard、executor 与回执 |
| `thincoder-core/ledger-close-proof.mjs` | 工作证据门 |
| `thincoder-core/ledger-cmd.mjs` | 收口预检、完成清单重锚、退回回执 |
| `thincoder-core/ledger.mjs` | 预检再导出 |
| `thincoder-core/ledger-tools.mjs` | 工具接线与描述 |
| `thincoder-core/agent-tools/batch-lifecycle.mjs` | 两条收口通路 |
| `thincoder-core/agent-tools/batch.mjs` | `completed` schema |
| `thincoder-core/agent-tools/batch-closeout.mjs` | 回执 |
| `thincoder-core/tool-docs/ledger.md`、`thincoder-core/tool-docs/batch.md` | 模型可见契约 |
| `docs/batches/<批档同名>.test.mjs` | 本批单测，用毕即删 |
| `test/integration/ledger-close-proof.test.mjs`、`test/integration/batch-gates-reanchor.test.mjs` | 修订既有集成用例 |
| `test/RTM.md`、`test/rtm/batch-ledger.md` | 登记设计 §10.9 的 delta |

`thincoder-core/agent-tools/batch-reopen.mjs` 已传当前 `getSessionId()`，核对后无改动。文件层级结论由交付前 `doc_check` 的 `lines` 读数给出；本批不预写行数或增量。

### 验收与测试

逐条判据回指 `docs/core/design/LEDGER.md` §10.5；正常、边界、错误输入见同档 §10.6。批级命令 = `node --test docs/batches/2026-11-10-p0-1-ledger-state-machine.test.mjs`，须先以缺理由、漏列完成清单、无有效证据、重复撤回等输入证明负例会红，再以实现后的同命令证明转绿。

集成 delta 见同档 §10.9；本批不新增业务故事，只重写受影响行并新增 CLI 14-9。父侧收口时运行对应集成档，批内不以全套集成测试替代变更面单测。

### 上抛项

- 需求档 `docs/core/requirements/ENGINEERING-SYSTEM-OPTIMIZATION.md` A1–A6 与本设计同源；主 agent 需在同轮收正 `docs/core/requirements/ENGINEERING-MODE-V2-SPEC-LEDGER.md` 中仍要求锚批收口/评审的旧核销判据，设计席不写需求档。
- `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` 的收口兜底与核销门段落需随本设计同步为当前态；不在本批另立第二套规则。

### 设计面收正（本批收尾轮）

实施完成后，两份旧口径档收到 `docs/core/design/LEDGER.md` §10 的现行语义：

- `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md`：认领即承诺改为三种去处（勾销 / 已废弃 / 退回待讨论）；§2.7 与 §2.11 的 `在途` 行改为漏列即拒、回执删「由重锚默认推进」汇总行；迁移边枚举补两条退回边并删归档态出边；核销门段落改为只判工作证据（核销门③ · R6 · R13 · R18 · R21 · R24 · 决策 31 · 用例表 · §9 的 10-3 / 10-5）；§2.13 的 `已核销` 改为「无出边」；R5 / R7 / R17 与 14-4 / 14-5 按新口径改写；§9 补本轮 RTM delta。
- `docs/core/design/LEDGER.md` §3.1 第 6 条：删掉重复编号的旧「接手 = 软语义」条，留新条并写明 D6 回退边除外。
- 状态机语义一律回指 `docs/core/design/LEDGER.md` §10，本档不复述判据值。

清单外文件：无（本轮只改上述两档）。

### 第 5 轮评审收正（4🔴 + 3🟡 + 1🔵）

- 🔴1 核销门只判工作证据：`BATCH-LEDGER-REVIEW-UNIFY.md` §2.6 的「核销门为什么能去运行态」整段改写为「核销门判什么」；同节「存量出路」「不对称」两条删去核销门读 `§3` 的说法；拒文块 ③ 换成 `R-L3` 的证据空白拒文（`<调用方>：核销须携有效工作证据（应用本笔补丁后的 evidence 非空白）`，不再点名 `§3 状态行`）。连带面同笔收正：§2.5 取值区表删核销门那一行（10 处 → 9 处、门面 6 → 5）、§2.5 存量表 §3 行的读面、§4 决策 1 与决策 28、§2.15 的「另有两道门守」与验收第 2 条。
- 🔴2 撤回两形：§2.4 的「唯一允许撤回的场合 = 重复登记」改为「撤回（`已废弃`）有两形」（判定「不用做」/ 重复登记），§4 决策 23 同步；§2.4 判据第 2 步的括注改为「重复登记那一形」。
- 🔴3 迁移表当前态：R21 尾句改为「本批按 `docs/core/design/LEDGER.md` §10.3 增两条退回边、删 `已核销` 出边，描述面与之逐边相等」；§2.13 不再复述 `ALLOWED_MIGRATIONS` 数组、改指 `§2.8` 的逐边枚举；§2.8 首段的旧数组引值与「本批工具零改」同笔收正。
- 🔴4 用例表拆两半：§6 的收口行拆成正常（点名 → `待核销`、`待讨论` → `条件`、`待核销` 零触）与错误（漏列 → 写档前拒、在途行零改）两行，与 §2.7 ∥ §2.11 的分流表同口径。
- 🟡5 `docs/core/design/LEDGER.md` §10.3 补层级结论：文件层「无一档跨档位」+ 单函数层「无一函数超 300 行」，绝对读数仍只记 §5（D12）。
- 🟡6 同档 §10.1 补既有件三问两答：`assertLedgerCloseDisposition` 取 `existing but unusable`（`ledgerReanchorBatch` 在事务内写、`ledgerBatchRows` 无完成清单判据），`completed` 取 `none found`（两条收口通路入参面无完成清单）。
- 🟡7 取代声明退场：§1 的「两侧写法不同时以本档为准 / 取代项逐条列在 `§2.7`」改为「两侧同源，不设取代声明」，同节承接判据同步；档归属条把 `§2.7` 分流与 `§2.13` 回收的语义单源归 `docs/core/design/LEDGER.md` §6.2 ∥ §10.2，与同节下段的归属句一致。
- 🔵8 §2.13 的「其余」行按状态分述（未开工/挂起、`已废弃`、`在途` 各一行理由），不再用「都不是本批的活跃工作行」一句盖三种状态。

清单外文件：无（本轮只改上述两档）。交付门 `doc_check(mode:"gate")` = PASS（显式 2 档，0 段命中）。

### 第 6 轮评审收正（2🔴 + 1🟡）

只改 `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` 一档；未改代码、需求档与批档外文件。

- 🔴1 `§7` 边界的迁移表句改为「既有六条边零改；另增两条退回边、删 `已核销` 出边（逐边枚举 = `§2.8`）」，不再自行总结一遍边表。
- 🔴2 `§6` 用例表删掉「收口含 1 行 `在途` + 1 行 `待讨论` ⇒ 回执建议各贴其行，汇总行只点名」一行——同一夹具已由「正常（点名 → 待核销 / 待讨论 → 条件 / 待核销 零触）」与「错误（漏列 → 写档前拒）」两行覆盖，该行输入未点名 `在途` 行却给出回执，与 `§2.7` / `§2.11` 相反。
- 🟡3 `§4` 决策 23 的「认领行的两处去处之一」改为「三处去处之一（另两处 = 勾销、退回 `待讨论`）」，与 `§2.4`「认领行有三种去处」及 R18 同数。

残句扫描：以上三类旧写法（`其余六条零改` / `迁移表只删核销那一条边` / `两处去处` / `汇总行只点名` / `回执建议各贴其行`）在本档零命中。交付门 `doc_check(mode:"gate")` = PASS（显式 1 档，0 段命中）。

## §3 设计评审（评审子代理）
**状态行**：评审通过



### 轮次 1（评审子代理）

| # | 严重度 | 状态 | 证据 |
|---|---|---|---|
| 1 | 🔴 | 未解决 | 核销唯一来源与旧追认验收冲突：docs/core/design/LEDGER.md §10.6「仍拒绝，核销唯一来源不变」，而 docs/core/requirements/ENGINEERING-MODE-V2-SPEC-LEDGER.md AC-M2-14「待讨论 / 待设计 → 已核销」及 AC-M2-21「一跳核销（行 = 待讨论 / 待设计 追认）」仍要求直通；同档「核销机检（F-LX4）」仍写「批档已收口」与「凭证在册」。 |
| 2 | 🔴 | 未解决 | 新核销门本身仍有两种判据：docs/core/design/LEDGER.md §10.2「不读批档在盘、§1 或 §3 状态」及 §10.4「核销门只机械判断证据非空」，但 docs/core/requirements/ENGINEERING-MODE-V2-SPEC-LEDGER.md AC-M2-34 仍含「task_book 指针若存在则其档在盘」与「evidence 含验证读数或交付坐标」。 |
| 3 | 🔴 | 未解决 | 收口失败语义互斥：docs/core/requirements/ENGINEERING-MODE-V2-SPEC-LEDGER.md AC-M2-30「失败不得留下档已冻结而行未处置的半状态」，docs/core/design/LEDGER.md §10.2 却明示「不处理档账跨存储原子性」，并保留写档后重锚失败而冻结照常的语义。 |
| 4 | 🔴 | 未解决 | 归档终态与旧状态机冲突：docs/core/design/LEDGER.md §10.1「归档两态均为终态」，docs/core/requirements/ENGINEERING-MODE-V2-SPEC-LEDGER.md「六态状态机」仍写「任意态 → 已废弃（撤回 / 批次废弃）」。 |
| 5 | 🔴 | 未解决 | 分支来源未达可核场景：docs/core/design/LEDGER.md §10.2 的「场景依据」列仅回引规范性需求句，未给实际观察、用户故障报告或可复现命令；退回、解耦、收口预检与归档 guard 均无可走查的失败现场。 |
| 6 | 🟡 | 建议 | docs/core/design/LEDGER.md §10.2 明确「批档两条收口通路」，但 §10.9 对 CLI 14-4 / 14-5 只写「batch close 与 completed 预检、重锚交互」，未明示 status → 已收口 通路的集成断言。 |
| 7 | 🟡 | 建议 | docs/core/design/LEDGER.md §10.3 只有「doc_check 的 lines 读数判定」结论，未给复查命令，也未说明单函数层级如何判定；本次评审范围不含实现档，无法独立抽测其实际层级。 |

VERDICT: changes-required
计数：🔴 5 · 🟡 2 · 🔵 0。

### 轮次 2（评审子代理）

| # | Orig# | 严重度 | 状态 | 证据 |
|---|---|---|---|---|
| 1 | 1 | 🔴 | Unfixed | AC-M2-14 与 AC-M2-21 的直通已删除，但 docs/core/requirements/ENGINEERING-MODE-V2-SPEC-LEDGER.md 的 AC-M2-23 仍写「核销两源零触碰」，与 docs/core/design/LEDGER.md §10.6「仍拒绝，核销唯一来源不变」冲突。 |
| 2 | 2 | 🔴 | Fixed | docs/core/requirements/ENGINEERING-MODE-V2-SPEC-LEDGER.md 的 F-LX4 与 AC-M2-34 现均为「只机械判断本行 evidence 非空白」，且明示不读批档在盘、§1/§3 与 design token 槽，和 docs/core/design/LEDGER.md §10.2、§10.4 一致。 |
| 3 | 3 | 🔴 | Fixed | docs/core/requirements/ENGINEERING-MODE-V2-SPEC-LEDGER.md 的 AC-M2-30 已将「档账跨存储原子性归 P0-2」，并明示本批不承诺消灭半状态，与 docs/core/design/LEDGER.md §10.2、§10.7 一致；同条另一残留冲突见 #8。 |
| 4 | 4 | 🔴 | Unfixed | 六态状态机虽已改为未归档态才可撤回，docs/core/requirements/ENGINEERING-MODE-V2-SPEC-LEDGER.md ②.1 的 executor 字段仍写「撤回（任意态 → 已废弃）时清空」，与同档②.2及 docs/core/design/LEDGER.md §10.1 的归档终态冲突。 |
| 5 | 5 | 🔴 | Fixed | docs/core/design/LEDGER.md §10.2 的「观察 / 复现」列已给出 #1913 核销拒绝、暂缓批行数、ledgerReanchorBatch 默认推进、applyRowClose 缺归档 guard、ledgerReclaimBatch 与 resolveExecutorTarget 差异等实读现场，不再只是规范句。 |
| 6 | 6 | 🟡 | Fixed | docs/core/design/LEDGER.md §10.9 的 CLI 14-4 / 14-5 已分别覆盖 batch close 与 batch status 写 §1 已收口，并断言两路漏列均在写档前拒绝且令牌、批档、台账不变。 |
| 7 | 7 | 🟡 | Fixed | docs/core/design/LEDGER.md §10.3 已给出可复跑的 doc_check report + lines 调用形，并规定按 docs/core/design/DOC-CHECK.md §2.9.7 逐函数复核、单函数 >300 行才触发拆分。 |
| 8 | (new) | 🔴 | New | docs/core/requirements/ENGINEERING-MODE-V2-SPEC-LEDGER.md 的 AC-M2-30 仍无限定地写「trigger = 认账不排期 的行零触」，docs/core/design/LEDGER.md §6.2 却写「认账不排期 的非活跃行零触；活跃行仍受完成清单门约束」，活跃行处置仍有两种说法。 |

VERDICT: changes-required
计数：Fixed 5 · Unfixed 2 · New 1；未解决 🔴 3 · 🟡 0 · 🔵 0。

### 轮次 3（评审子代理）

| # | Orig# | 严重度 | 状态 | 证据 |
|---|---|---|---|---|
| 1 | 1 | 🔴 | Unfixed | docs/core/requirements/ENGINEERING-MODE-V2-SPEC-LEDGER.md 的 AC-M2-23 已改为「勾销零触碰」；但同档②.1 executor 字段仍写「核销路径（勾销 / 追认）零触碰」，与同档②.2「不再有待讨论 / 待设计直通已核销的追认路径」及 docs/core/design/LEDGER.md §10.6「仍拒绝，核销唯一来源不变」冲突。建议将该字段的核销路径同步为勾销单径。 |
| 2 | 4 | 🔴 | Fixed | docs/core/requirements/ENGINEERING-MODE-V2-SPEC-LEDGER.md ②.1 已写「撤回（未归档态 → 已废弃）时清空」，与同档②.2及 docs/core/design/LEDGER.md §10.1、§10.2 的归档终态一致。 |
| 3 | 8 | 🔴 | Fixed | docs/core/requirements/ENGINEERING-MODE-V2-SPEC-LEDGER.md 的 AC-M2-30 已写「认账不排期」的「非活跃行」零触且「活跃行仍受完成清单门约束」，与 docs/core/design/LEDGER.md §6.2、§10.4 一致；跨存储原子性仍归 P0-2，未引入新冲突。 |

VERDICT: changes-required
计数：Fixed 2 · Unfixed 1；未解决 🔴 1 · 🟡 0 · 🔵 0。

### 轮次 4（评审子代理）

| # | Orig# | 严重度 | 状态 | 证据 |
|---|---|---|---|---|
| 1 | 1 | 🔴 | Fixed | docs/core/requirements/ENGINEERING-MODE-V2-SPEC-LEDGER.md ②.1 executor 字段现为「核销路径（勾销）零触碰」；同档 AC-M2-23 为「勾销零触碰」、AC-M2-25 为「勾销证据门判照旧」、AC-M2-14 为「核销单一来源」，与 docs/core/design/LEDGER.md §3 的核销单边及 §10.6「仍拒绝，核销唯一来源不变」一致；需求档内「追认 / 任意态 / 两源」零命中。 |
| 2 | 4 | 🔴 | Fixed | docs/core/requirements/ENGINEERING-MODE-V2-SPEC-LEDGER.md ②.1 现为「撤回（未归档态 → 已废弃）时清空」，与同档②.2「已核销与已废弃均为终态」及 docs/core/design/LEDGER.md §10.1、§10.2 一致。 |
| 3 | 8 | 🔴 | Fixed | docs/core/requirements/ENGINEERING-MODE-V2-SPEC-LEDGER.md AC-M2-30 现为「非活跃行」零触且「活跃行仍受完成清单门约束」，与 docs/core/design/LEDGER.md §6.2、§10.4 一致。 |

VERDICT: pass
计数：Fixed 3 · Unfixed 0；未解决 🔴 0 · 🟡 0 · 🔵 0。

### 轮次 5（评审子代理）

> 状态行重置：第 5 轮打回（changes-required）· 上一轮状态行 = 评审通过 → 进行中 · 2026-11-10

| # | 严重度 | 状态 | 证据 |
|---|---|---|---|
| 1 | 🔴 | 未闭环 | `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` §2.6 残留三处仍写「核销门③ 判状态词」：段内「收口门与核销门③ 仍只判判据 1（状态词）」·「**核销门为什么能去运行态**」整段 · 拒文块首句「③ 批档 §3 未通过评审（§3 状态行 = <value>，须 = 评审通过）」——与同节表行「核销门③ 应用本笔补丁后的 `evidence` 非空白（不读 token 槽归属、不读批档在盘 / 收口 / `§3`）」及 R6「三条各一拍 ⇒ 都通过」相反 |
| 2 | 🔴 | 未闭环 | 同档 §2.4「**唯一允许撤回的场合 = 重复登记**」与 §4 决策 23「撤回只许用于重复登记」vs 同节「判定「不用做」（前提不成立 / 已有它法）⇒ `已废弃` + `evidence` 写判据」· §2.11 收口前父侧三步 · R13 ∥ R18 的三种去处——同一条处置枚举两套说法 |
| 3 | 🔴 | 未闭环 | 同档 R21 尾句「`ALLOWED_MIGRATIONS` 本体零改」与 §2.13「`ALLOWED_MIGRATIONS["待核销"]` 含 `在途`（`thincoder-core/ledger-db.mjs` 实读：`["已核销", "在途", "已废弃"]`）」都把迁移表写成改前形；`docs/core/design/LEDGER.md` §10.3 的 `thincoder-core/ledger-db.mjs` 行逐字「迁移表增加两条退回边，删除 `已核销` 出边」 |
| 4 | 🔴 | 未闭环 | 同档 §6 用例表「收口含 1 `在途` + 1 `待讨论` + 1 已处置 `待核销`」的期望逐字「前两行重锚并点名，第三行零触」——`在途` 行按 §2.7 ∥ §2.11 ∥ R7 ∥ R13 是写档前拒、零重锚 |
| 5 | 🟡 | 待修 | `docs/core/design/LEDGER.md` §10.3 只给量法（`doc_check` 的 `lines` 调用）与「需拆档时在本节补拆分计划」，未给结论行；本轮抽查九档源档，最大 = `thincoder-core/agent-tools/batch-lifecycle.mjs` 408 行，无一越 500 软线 |
| 6 | 🟡 | 待修 | `docs/core/design/LEDGER.md` §10 未给新名 `assertLedgerCloseDisposition` 与收口新参 `completed` 的三问答案（`existing:` / `none found:` / `existing but unusable:` 三形一条未出） |
| 7 | 🟡 | 待修 | `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` §1 逐字「取代项逐条列在 `§2.7`」与 §2.7 逐字「本节不设取代声明」相反；§1 内 `§2.7` ∥ `§2.13` 的归属同时记作本档拥有与归 `docs/core/design/LEDGER.md` §6.2 |
| 8 | 🔵 | 登记 | 同档 §2.13「其余（`条件` / `待讨论` / `待设计` / `已废弃` / `在途`）⇒ 不动、不点名」的理由句「都不是本批的活跃工作行」对 `在途` 不成立；行为本身与归档终态一致 |

六处核对：① 三去处已成（§2.4 三条 + §2.7 认领行处置）但与 461 ∥ 决策 23 相反（第 2 行）；② 「漏列即拒」已成、汇总行已删，但 §6 用例表留一条默认推进（第 4 行）；③ 迁移表两处改前形（第 3 行）；④ 未全覆盖，§2.6 残留（第 1 行）；⑤ 与归档终态一致（第 8 行仅理由句）；⑥ R5 ∥ R7 ∥ R13 ∥ R17 ∥ R18 ∥ 14-4 ∥ 14-5 已按新口径改写，R21 未（第 3 行）。`docs/core/design/LEDGER.md` §3.1 重复条目：现盘每条规则只出现一次，旧形已删、新形在册。

VERDICT: changes-required

计数：🔴 4 · 🟡 3 · 🔵 1；未闭环 4（阻断）· 待修 3 · 登记 1。

### 轮次 6（评审子代理）

| # | 严重度 | 状态 | 证据 |
|---|---|---|---|
| 1 | 🔴 | 已闭环 | `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` §2.6「核销门判什么」逐字「本笔应用后的 `evidence` 非空白——就这一条」与「它不读 token 槽归属，也不读批档在盘 / 收口 / `§3`」，核销门拒文块 ③ 已改「核销须携有效工作证据（应用本笔补丁后的 evidence 非空白）」；R6 / R24 ③ / 决策 31 / `docs/core/design/LEDGER.md` §10.2 同口径，`§2.6` 档内无相反写法残留 |
| 2 | 🔴 | 已闭环 | 同档 §2.4 逐字「**撤回（`已废弃`）有两形**：① 判定「不用做」（前提不成立 / 已有它法）…② 重复登记」；§4 决策 23 逐字「可用两形：判定「不用做」…与重复登记」——「唯一允许撤回」已删，与 `docs/core/design/LEDGER.md` §10.2 的 `在途 → 已废弃` 一致 |
| 3 | 🔴 | 未闭环 | 同档 §7 边界逐字「迁移表只删核销那一条边（`待讨论 / 待设计 → 已核销`），其余六条零改」——与同档 §2.8 的逐边枚举「`在途 → 待核销 / 待讨论 / 已废弃`」·「`已核销` 无出边」、R21「本批按 … 在迁移表上增两条退回边、删 `已核销` 出边」以及 `docs/core/design/LEDGER.md` §10.3「迁移表增加两条退回边，删除 `已核销` 出边」相反（R21 尾句与 §2.13 引值两处已收正，第三处未收） |
| 4 | 🔴 | 未闭环 | 同档 §6 用例表逐字「回执建议各贴其行，汇总行只点名」——与同档 §2.11「**汇总行已删**」及 R18「收口含 1 行已点名的 `在途`」相反：该行输入未点名 `在途` 行，按 §2.7 / §2.11 是写档前拒、无回执（同表 1690 / 1691 两行已按新口径拆对，此行为旧副本） |
| 5 | 🟡 | 已闭环 | `docs/core/design/LEDGER.md` §10.3 逐字「**文件层结论 = 无一档跨档位**」与「**单函数层结论**」两行在册，另带「**绝对读数不写进本设计**（D12）」 |
| 6 | 🟡 | 已闭环 | 同档 §10.1 逐字「**既有件三问（两件新面）**」，`existing but unusable`（重锚）与 `none found`（`completed` 参数）各一条答案 |
| 7 | 🟡 | 已闭环 | 同档 §1 逐字「无相反写法，也不设取代声明」，取代项指针已删；`§2.7` / `§2.13` 两处归属同指 `docs/core/design/LEDGER.md` |
| 8 | 🔵 | 已闭环 | 同档 §2.13 表已按状态分行（`已废弃` 一行「终态，已在归档面」、`在途` 一行「已在工作位」），不再并进「其余」一句 |
| N | 🟡 | 新增 | 同档 §4 决策 23 逐字「撤回（`已废弃`）是认领行的两处去处之一（另一处 = 退回 `待讨论`）」——与同档 §2.4 的三处去处、R18「三种去处（勾销 / 已废弃 / 退回待讨论）」不符：计数据少一处 |

VERDICT: changes-required
计数：上轮八条 —— 已闭环 6（🔴 2 · 🟡 3 · 🔵 1）；未闭环 2（🔴 2）；新增 1（🟡 1）。

### 轮次 7（评审子代理）

| # | 严重度 | 状态 | 证据 |
|---|---|---|---|
| 1（原 3） | 🔴 | 已闭环 | `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` §7 边界逐字「既有六条边零改；另增两条退回边、删 `已核销` 出边（逐边枚举 = `§2.8`）」——与同档 §2.8 逐边枚举「`在途 → 待核销 / 待讨论 / 已废弃`」·「`已核销` 无出边」、R21「在迁移表上增两条退回边、删 `已核销` 出边」、`docs/core/design/LEDGER.md` §10.3「迁移表增加两条退回边，删除 `已核销` 出边」三面同数，指针解得到枚举本体 |
| 2（原 4） | 🔴 | 已闭环 | 同档 §6 用例表那一行已删：`汇总行只点名` 全档零命中；该情形现只由「收口含 1 `在途`（点进 `completed`）+ 1 `待讨论` + 1 已处置 `待核销`」的正常行与「把那条 `在途` 行移出 `completed`」的错误行两半覆盖；`汇总行` 残余仅 §2.11「**汇总行已删**」与 R18「无「由重锚默认推进」汇总行」——删行后无孤立引用，§6 无行数声明，无计数失衡 |
| 3（新增 N） | 🟡 | 已闭环 | 同档 §4 决策 23 逐字「撤回（`已废弃`）是认领行的三处去处之一（另两处 = 勾销、退回 `待讨论`）」，与 §2.4「收口时认领行有三种去处」、§2.7「只有三种去处」、R18「三种去处（勾销 / 已废弃 / 退回待讨论）」同数 |

上轮其余 6 条（原 1 · 2 · 5 · 6 · 7 · 8）上轮已闭环，本轮不重开、结论不变。

VERDICT: pass

计数：上轮待办 3 条（🔴 2 · 🟡 1）⇒ 全数闭环；新增 0；未闭环 0。

## §4 用户批准（主 agent）

### 用户批准

- **原话**：「我看了，挺好，这些工作我认为都要做，从P0-P2，都需要做，你开工吧，依次做完，自动执行」（2026-11-10 16:11）。
- **批准范围 = 第 7 轮评审通过的 §10**：D1–D6 六条裁定（两条退回边 ∥ 核销=工作证据 ∥ 收口 `completed` 清单 ∥ 归档双终态 ∥ 撤回 guard ∥ executor 统一）。
- **父侧中途裁定**：写域内不动代码、只由设计席收正两份旧口径档；跨存储原子性归 P0-2（本批不承诺）。

## §5 实施记录（eng-coder）
**状态行**：实施完成（13/13 批级单测通过；分歧审计 clean；独立代码评审第 3 轮 pass；doc_check gate PASS 2 档）



### 实施摘要

接手时本批核心实现已存在于未提交工作树。本席以批起 `HEAD` 反证旧行为，再修复审计发现的归档同态重写、收口拒文与验收覆盖缺口；未改写设计档。

依据 docs/core/design/LEDGER.md「`assertCloseOutProof` 保留为核销门单源，签名改收本笔应用后的证据值。`applyRowUpdateTx` 与 `applyRowClose` 都先计算 `nextEvidence`，再以它调用该门；因此旧证据可支持核销，空白覆盖不能制造已核销行。」

依据 docs/core/design/LEDGER.md「预检位于既有收口门之后、设计凭证消费与批档写盘之前。预检拒绝时令牌、批档和台账均不变。」

| 裁定 | 状态 | 交付 |
|---|---|---|
| D1 | ✅ | 两条退回边均要求本笔理由，解绑并清执行者，保留 `created_at`，回执携 `reason` |
| D2 | ✅ | 核销只读应用本笔后的 `evidence`；`ledger update` 与 `ledger close` 均覆盖正反例 |
| D3 | ✅ | 两条收口通路共用写前预检；只推进点名行；非法清单、空清单、幂等与失败注入均有用例 |
| D4 / D5 | ✅ | 两种归档态均终态；显式同态重写与重复撤回均拒且整行不变；重开不回收已核销 |
| D6 | ✅ | 手工回退与批档重开均写当前会话，显式旧 executor 不覆盖 |

`batch-reopen.mjs` 只读核对：`reclaimOnReopen` 已把 `getSessionId()` 传给 `ledgerReclaimBatch`，无需改动。

### 本席实际落笔与清单外披露

- `thincoder-core/ledger-write-ops.mjs`：归档态显式同态重写前置拒绝。
- `docs/batches/2026-11-10-p0-1-ledger-state-machine.test.mjs`：补齐 D1–D6、两条收口通路、幂等、回滚、失败回执与公开工具入口用例。
- **清单外** `thincoder-core/ledger-cmd.mjs`：按 §10.8 给非法 `completed` 拒文统一补「先退回未完成的在途行，再重试」；同步一处已失效的核销注释。
- **清单外** `test/integration/batch-gates-reanchor.test.mjs`：按 §10.9 CLI 14-6 补公开工具手工回退、当前会话断言及不带号写文件零改断言。
- **清单外** `test/rtm/batch-ledger.md`：登记同一 CLI 14-6 的手工回退与执行顺序，消除 RTM 与可执行用例漂移。

### 验证读数

失败侧先在批起 `HEAD` 的临时 worktree 执行，随后删除该 worktree：

```text
node --test D:\teamcode\thincoder\.p01-ledger-baseline\docs\batches\2026-11-10-p0-1-ledger-state-machine.test.mjs
结果：tests 11 · pass 1 · fail 10（旧退回边、旧核销门、旧 executor 与缺 completed 门均可分辨）
```

新增归档同态与拒文断言在修复前也先执行：同一批级命令得到 `pass 9 · fail 2`，分别命中同态重写未拒与重复 id 拒文缺出路。

最终实现后的批级命令：

```text
node --test D:\teamcode\thincoder\docs\batches\2026-11-10-p0-1-ledger-state-machine.test.mjs
结果：tests 13 · suites 0 · pass 13 · fail 0 · cancelled 0 · skipped 0 · todo 0
```

`lint(full:true)` 对 `ledger-write-ops.mjs`、`ledger-cmd.mjs`、本批单测与 `batch-gates-reanchor.test.mjs` 均返回 `Syntax OK`。

同一 `doc_check(mode:"report", lines:[...])` 量法在实施前（批起 `HEAD` 的临时 worktree，量毕已删）与实施后各跑一次；量法 = `countContentLines`，两次均越硬限 0、越软线 0：

| 文件 | 实施前 | 实施后 |
|---|---:|---:|
| `thincoder-core/ledger-db.mjs` | 272 | 298 |
| `thincoder-core/ledger-write-ops.mjs` | 373 | 379 |
| `thincoder-core/ledger-close-proof.mjs` | 62 | 25 |
| `thincoder-core/ledger-cmd.mjs` | 330 | 367 |
| `thincoder-core/ledger.mjs` | 160 | 160 |
| `thincoder-core/ledger-tools.mjs` | 357 | 357 |
| `thincoder-core/agent-tools/batch-lifecycle.mjs` | 391 | 408 |
| `thincoder-core/agent-tools/batch.mjs` | 202 | 211 |
| `thincoder-core/agent-tools/batch-closeout.mjs` | 206 | 195 |
| `test/integration/ledger-close-proof.test.mjs` | 220 | 161 |
| `test/integration/batch-gates-reanchor.test.mjs` | 232 | 280 |

逐函数词法行扫描按代码、字符串、行/块注释、模板原文与 `${}` 表达式、正则字面量分态配对花括号。行数超过 300 的四档逐函数复核均未发现单函数 >300 行：`statusBatchRecord` 86 · `ledgerReanchorBatch` 44 · `ledgerBindBatch` 53 · `makeLedgerTool` 77，无需函数拆分。

集成测试不在本席运行；父侧收口执行是唯一集成测试运行。本批单测为一次性档，收口时删除。

### 审计与代码评审

- 分歧审计共 4 轮，修正归档同态写、拒文出路、CLI 14-6 执行/登记、幂等与失败注入后，终态 = **clean**。
- 独立代码评审第 1 轮 = **changes-required**：必须补 §5 证据记录；另补两条公开收口非法清单端到端覆盖与 `ledger update` 核销正反例。三项均已落地。
- 独立代码评审第 2 轮确认两项测试覆盖为 Fixed，并指出 §5 仍缺实施前文件读数；已按批起 `HEAD` 补测并登记。
- 独立代码评审第 3 轮确认实施前后 11 档读数齐全、实施后复测一致，结论 = **pass**；代码评审终态 = **clean**。

已读 `BATCH-LEDGER-REVIEW-UNIFY.md` 与 `LEDGER.md` §3.1 的旧口径，按父侧裁定以 §10 为准；该两处待设计席收正。

## §6 验证与收口（父代理）

### 验证与收口（父侧）

**交付**：状态机诚实化六条落地——两条退回边（理由必填、解绑、清 executor、保留 `created_at`）∥ 核销只判本笔应用后的 `evidence` ∥ 收口 `completed` 清单、漏列写档前拒 ∥ 归档双终态、重复撤回拒 ∥ 手工回退与重开 executor 统一。设计面同步收正 `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` 与 `docs/core/design/LEDGER.md` 的旧口径。

**父侧独立复跑（不信实施席自报）**：

```
node --test docs/batches/2026-11-10-p0-1-ledger-state-machine.test.mjs
  tests 13 · pass 13 · fail 0

node --test test/integration/{batch-close-gate, batch-gates-reanchor,
  ledger-close-proof, batch-ledger-bind, batch-close-token-consume}.test.mjs
  tests 30 · pass 30 · fail 0
```

**红侧**：实施席在批起 `HEAD` 上跑同一批单测 = 1 通过 / 10 失败，确认旧行为能被分辨。

**本批产品行为变化**：没做完的行可以退回 `待讨论`（带理由）而不是假装做完；核销不再被批档状态绑架；收口必须逐行交代。

**夹具**：全部临时目录造、跑完清；**仓内零常驻样本档**；单测档收口时删。

**集成测试增量**：改写 `7-3` ∥ `7-16` 中半 ∥ `37-3`，新增 `7-17` ∥ `7-18` ∥ `7-19` ∥ `44-2` ∥ `45-2`（设计 §10.9）。

**未解决**：跨存储原子性（批档已冻结、台账重锚失败）归 P0-2；本批不承诺消灭半状态，设计 §10.5 已写。
