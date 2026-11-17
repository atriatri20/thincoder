# 2026-11-11 · p2-5-ledger-close-record-gate
> 六段，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 每段只有一个作者：作者的段可 `append` 加内容、可就地改（`edit`）；非作者一概拒。
> 编制：主 agent · 2026-11-11 · 来源 = 用户 2026-11-11 01:10：batch close 与 ledger close 未关联，导致 13 份批档 open-but-settled。
> 台账 = #2317（core · 归批）。前情 = docs/batches/2026-11-11-p2-3-gate-anchor-single-source.md §6（已收口 2026-11-11）。
## §1 讨论（主 agent）
**状态行**：已收口 2026-11-11
批起 sha = f3c69ca7d406450b7c184fcae82371d447f45942
<§1 模板占位：本批条目 / 关键判据 / 授权口径>

**本批条目**：一条——`ledger close` 对挂未收口批档的行不得单独结算；拒文指回 `batch close`，由它同笔结算行并冻结档。

**关键判据**：① 行 `task_book` 指向在盘批档且 §1 状态行不含「已收口」⇒ 拒；② 行无 `task_book`、目标档不在盘、或行处待讨论/待设计的 retro-close ⇒ 不拦，避免给无档行造死锁；③ `batch check` 的 open-but-settled 报告与这道门同一判据，不另写一套。

**授权口径**：用户 2026-11-11 01:10 指出「这是个缺口啊！怎么会 batch close 和 ledger close 这两还没关联上呢？」，同轮即开批；今晚 13 份 open-but-settled 记录与 `#2298` 复评返工是现场。

- **已定决定**：`ledger close` 对挂未收口批档的行拒，指回 `batch close`；无 task_book、目标档不在盘、retro-close 三类不拦。 · 用户原话：「这是个缺口啊！怎么会 batch close 和 ledger close 这两还没关联上呢？」 · 时间：2026-11-11 01:10
- 库内 = 已查：批档 open-but-settled 的实测回执与 lane04 复评返工；本席对 `ledger close` 与 `batch close` 的两次实测。
- 库外 = B 类：改动面 = 台账工具实现与设计档；外部断言 = 零。

**验收**：拒/放/不拦三类各有可跑用例；拒文明确指回 `batch close`。

- **已定决定**：双向咬合——`ledger close` 不得单独结算挂未收口批档的行；反向 `batch close` 在关联台账行已全部归档（已核销 ∥ 已废弃）时允许补关，即使 §3/§4/§6 为空。判据 = 看行不看段：仍有在途行 ⇒ 照旧走完整链门；行全归档 ⇒ 允许补关。 · 用户原话：「批档也应该允许补关吧，只要关联的台账是关闭的状态，否则批档就这么挂着也不对啊！」 · 时间：2026-11-11 01:18

**这条裁定的射程**：今晚 13 份 open-but-settled 批档与 2026-10-15~19 那 15 份都在其内——它们的工作事实已由台账核销承认，缺的只是档的冻结。补关不等于补写 §3/§4/§6（那是伪造当时记录）。

## §2 批次任务与设计（eng-designer）
**状态行**：设计完成（修轮：实施漂移三处收正（新档入表 / A2 notice 名 / RTM delta 补 14-11·17-3）+ 评审 #6 落盘）
### 本批条目（覆盖）

1. **结算挂收口**：`ledger close` 与 `ledger update` 两条逐行核（单行 / batch / 建档形）在归档前校验锚批 §1；`已核销` 与 `已废弃` 两个归档目标态同过一门 `assertAnchorBatchSettleable`，在盘且非「已收口」即拒。四类不挂门（非批档指针、无 `task_book`、档不在盘、待讨论/待设计 retro-close）逐笔回执 `notices` 留痕；`unknown` 单独拒文并给修法；放弃边拒文给「先退回 待讨论 再 已废弃」两步出路。设计 = `docs/core/design/LEDGER.md` §11.1–§11.2。
2. **全归档批补关**：`batch close` 与 `status → 已收口` 在关联行集非空且全为 `已核销 / 已废弃`、唯一半状态为 `open-but-settled` 时，允许不补写 §3/§4/§6 而冻结，并在 §1 段尾追加一行 `**补关记录**`；任何非归档行或其它半状态仍走完整链门。设计 = `docs/core/design/BATCH-RECORD.md` §4.18-C。
3. **查询同源**：`batch check` 继续只读报告 `open-but-settled`；它与结算门共用 `readBatchStatusLine` 的 closed / 非 closed 判据，不复制 §1 解析。补关只消费既有 `batchLedgerConsistency`，不另造归属或归档判定。设计 = `docs/core/design/LEDGER.md` §11.2。

### 设计档落点与机制边界

- 主落点 = `docs/core/design/LEDGER.md` §11（门序、回执留痕、边界、验收、RTM delta）；`docs/core/design/BATCH-RECORD.md` §4.13 / §4.18-C（补关与完整链的分流）。
- 正常 `batch close` 仍先写 §1 再重锚，因此重锚内的共用逐行门读到 closed，不自锁。补关不改写行、不补造过程段。
- 本批不迁移或批量修昨晚与十月的存量档；它们由主 agent 逐份调用补关。门只保证新笔不再制造该半状态。

### 受影响文件与测试覆盖

实现 / 描述面 / 测试全表与分层结论 = `docs/core/design/LEDGER.md` §11.3；批档侧增量 = `docs/core/design/BATCH-RECORD.md` §4.18-C「受影响面」。核心落点为 `ledger-close-proof.mjs`、`ledger-write-ops.mjs`、`ledger-cmd.mjs`、`agent-tools/batch-closeout.mjs`、`agent-tools/batch-lifecycle.mjs`；不改 `ledger-db.mjs` 的 schema / 迁移表，也不新增工具参数。

本批单测 = `docs/batches/2026-11-11-p2-5-ledger-close-record-gate.test.mjs`，命令与红绿读数只记 §5。集成面修订 CLI 10-3 / 14-3，并新增已先在 RTM 登记的 CLI 14-13；delta = `docs/core/design/LEDGER.md` §11.9。

### 验收对照

- #2317 拒 / 放 / 四类不拦：`docs/core/design/LEDGER.md` §11.5 P2-5-A1–A4——`ledger close` 与 `ledger update` 同拒同放；不可判态单独拒并给修法；四类豁免均带 notices；batch 形维持逐行 skipped。
- #2317 补关：`docs/core/design/BATCH-RECORD.md` §4.18-C 验收——全归档且 §3/§4/§6 空可补关，且 §1 落一行 `**补关记录**`；仍有在途行或伴随其它半状态即拒，档账令牌不变。
- #2317 查询一致：`docs/core/design/LEDGER.md` §11.5 P2-5-C——同一非 closed 判据下，`batch check` 报 `open-but-settled`，补关后该读形消失；不读 `consistent` 代替 §1 状态。

### 关键决策与上抛项

- 留痕走回执 `notices`，不追加 `evidence`：后者是工作事实，不是技术门旁路日志。
- 补关只豁免 §2/§3/§4/§6 内容门与 §3 pass 臂；单测档门、文档机检门、设计凭证消费、完成清单 / closeEvidence 预检与重锚写序全部保留。
- 需求档旧口径须由主 agent 同批收正：`ENGINEERING-SYSTEM-OPTIMIZATION.md` A2 与 `ENGINEERING-MODE-V2-SPEC-LEDGER.md` F-LX4 / AC-M2-34 现仍允许未收口核销，与本批用户裁定相反；本席不写需求档。
- 其它设计档的同步面列于 `docs/core/design/LEDGER.md` §11.3；不把旧「未收口也可核销」留在现役规则面。

### 修轮：实施漂移三处收正

1. **新档入表**：`thincoder-core/agent-tools/batch-ledger-view.mjs` 已登记进 `docs/core/design/LEDGER.md` §11.3 受影响表（`consistencyOf` / `repairDecisionOf` / `assertCloseDisposition` 三件只读视图）与 `docs/core/design/BATCH-RECORD.md` §4.18-C 受影响面；§11.3 与 §4.18-C 各给贴线判（拆后两档均在 500 软线之下，读数住 §5）。
2. **`P2-5-A2` 括注收正**：退回边清 `task_book`（§3.1 既有语义）⇒ 退回后再放弃的 notice = `no-task-book`；`retro-close` 只属现态 `待讨论 / 待设计` 且指针解析到在盘批档的追结行。`docs/core/design/LEDGER.md` §11.6 同条用例行随改。
3. **`§11.9` delta 补齐**：增 CLI 14-11（改夹具：全归档现场改由「正常收口 → 重开」造）与 CLI 17-3（改夹具：在途行撤回改走「退回 待讨论 → 已废弃」）两行。
4. **评审 🟡 #6 落盘**：`notices` 与四个 `reason` 名的三问写进 `docs/core/design/LEDGER.md` §11.2（住哪 / 叫什么 / 谁用；已查无现成名，`notes` 属文档机检门回执行族）。

## §3 设计评审（评审子代理）
**状态行**：评审通过（第 2 轮：1🔴 + 9🟡 + 1🔵 逐条核，🔴 已闭、无新 🔴；余 🟡 1 条为回执新名既有件三问（提示级，不阻断））



### 轮次 1（评审子代理）

设计评审（P2-5）—— 结论表

| # | 严重度 | 状态 | 证据（指针） |
|---|---|---|---|
| 1 | 🔴 | 待处置 | `docs/core/design/LEDGER.md` §11.4「门放 `applyRowClose`，不放 `ledgerCloseBatch` 外层」+ §10.2「`applyRowClose` 另过 §11 的锚批门」 vs 同档 §3 允许迁移表「待核销 \| 已核销 · 在途 · 待讨论 · 已废弃」+ §3.2 `ledger(update)` `status`「可空 · ∈ 六态」+ §3.1 第 4 条「`待核销 → 已核销` 按 `patch.executor ?? 行现值`」——同一迁移经 `ledger({action:"update"})` 达成而不过门 |
| 2 | 🟡 | 待处置 | `docs/core/design/LEDGER.md` §11.2 拒文「请先 batch close」vs 同表三豁免（`no-task-book` ∥ `record-not-on-disk` ∥ `retro-close`）未含「在途 / 待核销 → 已废弃」；`docs/core/design/BATCH-RECORD.md` §4.18-C「每行均为 `已核销 / 已废弃`」 |
| 3 | 🟡 | 待处置 | `docs/core/design/LEDGER.md` §11.2「`open-but-settled` 条件改为 `record !== "closed"` ∧ 行集非空 ∧ 全归档」+ 拒文「§1 = <open\|unknown>」 vs `docs/core/design/BATCH-RECORD.md` §4.18-C「`record = unknown` 仍由冻结门拒，不能进入补关」 |
| 4 | 🟡 | 待处置 | `docs/core/design/BATCH-RECORD.md` §4.18-C「补关回执增加 `[ledger repair]` 留痕」+ 边界「不自动补写 §3/§4/§6」——档内零留痕；对照同档 §4.18-B 重开径「§1 段尾追加一行」 |
| 5 | 🟡 | 待处置 | `docs/core/design/LEDGER.md` §11.3「**分层结论**……预计无一档跨硬线，无拆分计划」——非读数结论、`lines:[...]` 无档列、无单函数层结论（对照同档 §10.3「**单函数层结论**」） |
| 6 | 🟡 | 待处置 | `docs/core/design/LEDGER.md` §11.2「每项形如 `{id, reason, message}`」+ §11.3 首行（新门无符号名）——新名未走三问、门无稳定符号名 |
| 7 | 🟡 | 待处置 | `docs/core/design/LEDGER.md` §11.2 表头「\| 分支 \| 依据 \| 行为 \|」——补关分支与 `retro-close` 豁免无引文、无复现路径（对照同档 §10.2 表头「\| 分支 \| 观察 / 复现 \| 旧行为 \| 新行为 \|」） |
| 8 | 🟡 | 待处置 | `docs/core/design/LEDGER.md` §11.5「回指」列 = 「§11.2」∥「`BATCH-RECORD.md` §4.18-C」+ §11.9「服务需求」列同为设计节——无需求面回指（对照同档 §10.5「`ENGINEERING-SYSTEM-OPTIMIZATION.md` A1」） |
| 9 | 🟡 | 待处置 | `docs/core/design/LEDGER.md` §3.3「**迁移表判 / 写门 / evidence 门逐行照判**」——逐行门枚举未加新锚批门，而 §11.2 令 batch 形未收口行进 `skipped` |
| 10 | 🟡 | 待处置 | `docs/core/design/LEDGER.md` §11.3「`thincoder-core/ledger-close-proof.mjs` \| 新增锚批读取与豁免判定；复用 `filePartOf`、`resolveDeclaredRef`、`readBatchStatusLine`」——核内档取 `thincoder-core/agent-tools/batch-segment-vocab.mjs` 读器的依赖方向未交代 |
| 11 | 🔵 | 待处置 | `docs/core/design/BATCH-RECORD.md` §4.18-C「全归档表示工作事实已由台账承认」与「每行均为 `已核销 / 已废弃`」并读——`已废弃` 非「工作事实已承认」 |

VERDICT: changes-required

计数：🔴 1 · 🟡 9 · 🔵 1

### 轮次 2（评审子代理）

| # | 严重度 | 状态 | 证据（指针） |
|---|---|---|---|
| 1 | 🔴 | 已修 | docs/core/design/LEDGER.md §11.2「由两处逐行写在迁移表判、源状态门与证据门之后」· §10.2「两个逐行核同过一门（`ledgerClose` ∥ `ledgerUpdate` 都调 `assertAnchorBatchSettleable`）」· §11.6 用例「`ledger(update)` 携 `status:"已核销"` 指向 OPEN 档 ⇒ 同拒」——update 旁路闭合 |
| 2 | 🟡 | 已修 | 同档 §11.2 分支「拒，拒文给真实两路：先退回 `待讨论` 再 `已废弃`，或先 `batch close`」+ 拒文「不得直接放弃活跃行」+ §11.5 A2「退回后同迁移放行（带 `retro-close` notice）」 |
| 3 | 🟡 | 已修 | 同档 §11.2「`unknown` 是待修态，不是补关入口」+ 拒文「先修 §1 状态行（区内须恰一条；缺行或两条以上都读作 unknown——修法 = 主 agent 普通文档写），再重试」 |
| 4 | 🟡 | 已修 | 同档 §11.2「补关在档面留一行追记」+ 逐字形 `**补关记录**` + 载体 `appendLineToSection`；docs/core/design/BATCH-RECORD.md §4.18-C「同时**在档面留一行追记**」 |
| 5 | 🟡 | 已修 | 同档 §11.3「文件层结论 = 判据 + 失败侧」∥「单函数层结论 = 判据 + 失败侧」+ lines 全表命令；余项 = 无「无一档越线」平句（绝对读数按 D12 住批档 §5） |
| 6 | 🟡 | 未决 | 门已有名与三问（`assertAnchorBatchSettleable`）；回执新名仍无既有件三问：同档 §11.2「每项 = `{id, reason, message}`，`reason` 闭集 = `pointer-not-a-record` / `no-task-book` / `record-not-on-disk` / `retro-close`」，而 docs/core/design/BATCH-RECORD.md §4.22 已有同族行族「门回执的附加行族（`notes`，与「触达账存量命中」同族）」 |
| 7 | 🟡 | 已修 | 同档 §11.2 表头「分支 ∥ 观察 / 复现 ∥ 行为」+ 「开批现场：13 份批档停在进行中，行已归档（`ledger(close)` 直接落账）」 |
| 8 | 🟡 | 已修 | 同档 §11.5 回指「`ENGINEERING-SYSTEM-OPTIMIZATION.md` A2 ∥ `ENGINEERING-MODE-V2-SPEC-LEDGER.md` AC-M2-14」· §11.9 服务需求同列 |
| 9 | 🟡 | 已修 | 同档 §3.3「迁移表判 / 写门 / evidence 门 / 锚批门（§11.2）逐行照判」 |
| 10 | 🟡 | 已修 | 同档 §11.1「core → agent-tools 是本仓既有方向，不是本批新开」+ 既有 import 逐字 + 「该档是纯文本读器（零 fs、零 `node:sqlite`）」 |
| 11 | 🔵 | 已修 | docs/core/design/BATCH-RECORD.md §4.18-C「`已废弃` = 已裁定不做。两者都是行的终局裁决」 |

新加豁免 `pointer-not-a-record` 判 = 必要，且不成绕过口：同档 §11.2 该行自带机制读数（`isBatchRecord` 判否 ⇒ 该行不属于任何批 ⇒ 不会产生 `open-but-settled`），故不新增读形；它与既有「档不在盘」豁免同族，其可绕面（先改指再归档）在该豁免下早已存在，非本笔新开。余项（提示级）= 该豁免未带自己的用户裁定出处，而同族 `record-not-on-disk` 带「用户裁定：档不在盘不升格为拒绝」。

VERDICT: pass
计数：🔴 未决 0 · 🟡 未决 1（#6，提示级，不阻断）· 🔵 未决 0；新出 🔴 0。

## §4 用户批准（主 agent）

**批准 = 用户本批的两次指令，逐字留档。**

- **2026-11-11 01:10**：用户指出缺口——`ledger close` 与 `batch close` 未关联，13 份批档停在 open-but-settled。
- **2026-11-11 01:18**：用户追加反向裁定，原话：「**批档也应该允许补关吧，只要关联的台账是关闭的状态，否则批档就这么挂着也不对啊！**」

**批准射程**：本批只做双向咬合，不改状态机迁移表、不改核销证明门本体、不碰批档删除语义。设计经第 1 轮 changes-required（1🔴+9🟡+1🔵）、第 2 轮 pass，实施按批准的设计落地，无越界内容。

## §5 实施记录（eng-coder）
**状态行**：实施完成（双向门（两处逐行核 × 两个归档目标态）+ 四类留痕豁免 + 全归档补关（close/status 两路、§1 追记行、[ledger repair]）+ 查询同源；单测 7/7 绿（改前 7/7 红）；集成面 10-3 / 14-3 / 14-13 与 RTM delta 已落；审计 1 轮 + 代码评审 2 轮，终态 converged；设计漂移 3 条见本节）



### 交付摘要（三条目全覆盖）

1. **结算挂收口**：新门 `assertAnchorBatchSettleable`（`thincoder-core/ledger-close-proof.mjs`）挂在 `applyRowClose` 与 `applyRowUpdateTx` 两个逐行写核上——位次 = 迁移表判 / 源状态门 / 证据门之后、`UPDATE` 之前；`已核销` 与 `已废弃` 两个归档目标态同过一门。三支拒文逐字取 `docs/core/design/LEDGER.md` §11.2 拒文块 ①②③（`<fnName>` = `ledgerClose` ∥ `ledgerUpdate`）；四支豁免（`pointer-not-a-record` / `no-task-book` / `record-not-on-disk` / `retro-close`）放行并回传 `{id, reason, message}`；单行回执带 `notices`，batch 形汇总到顶层 `notices`，未收口行入 `skipped`（`why` = 门拒原文）。`ledgerReanchorBatch` 两处 `applyRowClose` 已补传 `{ base }`。
2. **全归档批补关**：分流判据 = `repairDecisionOf`（`record = open` ∧ 行集非空 ∧ 每行均已归档 ∧ `halfStates` 恰为唯一 `open-but-settled`），`close` 与 `status` 写 §1 已收口两路都在链门前读取；`assertCloseoutGates` 增 `repair` 分派（**只跳过** ① 内容门与 ② §3 pass 臂，③ 单测档门与 ④ 文档机检门照跑），完成清单预检、设计凭证消费、重锚与补偿写序全保留。补关成功 = 冻结 + §1 段尾追加一行 `**补关记录**`（载体 `appendLineToSection`）+ 回执 `[ledger repair]`，台账行零改写；全归档但伴随其它半状态 ⇒ `repairBlockedError` 拒（逐项点名 + 指回 `batch({action:"check"})`）。
3. **查询同源**：`batchLedgerConsistency` 的 `open-but-settled` 改判 `record !== "closed"` ∧ 行集非空 ∧ 全归档；`unknown` 照报；补关入口恒为 `record = open` 且 `halfStates` 恰为唯一本项目。`readBatchStatusLine` 仍是唯一状态判据，未复制解析。

### 变更文件（声明 5 + 清单外 6，逐项给理由）

| 文件 | 变更 |
|---|---|
| `thincoder-core/ledger-close-proof.mjs` | 新增锚批结算门（含四支豁免与三条拒文） |
| `thincoder-core/ledger-write-ops.mjs` | `applyRowClose` / `applyRowUpdateTx` 两处挂门，豁免 notice 回传调用面 |
| `thincoder-core/ledger-cmd.mjs` | `ledgerUpdate` / 两个 batch 形的 notices 透出；重锚两处补 `{ base }`；`open-but-settled` 改判 |
| `thincoder-core/agent-tools/batch-closeout.mjs` | `assertCloseoutGates` 的 `repair` 分派；`repairBlockedError` / `repairTraceLine` / `repairReceiptLine` |
| `thincoder-core/agent-tools/batch-lifecycle.mjs` | 两条收口径接分流；补关一次写盘两处落笔；回执出 `[ledger repair]` |

清单外（每条都因交付所需，非顺手改）：

| 文件 | 理由 |
|---|---|
| `thincoder-core/agent-tools/batch-ledger-view.mjs`（新） | `batch-lifecycle.mjs` 加完补关分流后实测 529 行、越 500 软线，按 `LEDGER.md` §11.3 失败侧「先拆锚批门或补关分流再交付」拆出「台账侧只读视图」三件（`consistencyOf` / `repairDecisionOf` / `assertCloseDisposition`），lifecycle 回 482、本档 81 |
| `thincoder-core/tool-docs/ledger.md` | 设计 §11.3 描述面同步：删掉与新门相反的旧句（原写「不读锚批在盘、收口或评审状态」），补锚批门三支拒文要点、四支 `notices` 与 batch 形 skip 口径 |
| `thincoder-core/tool-docs/batch.md` | 同上：`close` 增补关段（入径、只跳过哪两臂、§1 追记行、`[ledger repair]`、保留门），`status` 收口路与 `check` 的 `open-but-settled` 判据同步 |
| `test/integration/ledger-close-proof.test.mjs` | CLI 10-3 按 §11.9 重写（OPEN 两入口同拒、CLOSED 三形放行、证据负例移 CLOSED 夹具） |
| `test/integration/batch-gates-reanchor.test.mjs` | CLI 14-3 按 §11.9 重写；新增 CLI 14-13；14-11 第二拍③ 夹具改由「正常收口 → 重开」造全归档现场（原「档 open 时结行」已被本门堵死） |
| `test/rtm/batch-ledger.md` | 10-3 / 14-3 判据行改写、14-13 登记（§11.9 delta）、第 14 节节注随 14-13 改「十三态」 |
| `test/integration/advisor-record-gate.test.mjs` | CLI 17-3 夹具：原「`在途 → 已废弃` 撤回」在新门下拒，改走「退回 待讨论（解绑）→ 已废弃」，用例断言的现场（该档零未决行）不变 |

### 读数（绝对读数只住本节——D12）

- 本批单测（红/绿两侧都实测）：`node --test docs/batches/2026-11-11-p2-5-ledger-close-record-gate.test.mjs` ⇒ 改前 `pass 0 · fail 7`（`git stash push -- <五个核心档>` 复跑后 `git stash pop` 复原），改后 `pass 7 · fail 0`。
- B / C 两条的改前读数（单测档在改前先卡在夹具断言上，另跑一次性探针、不入仓）：改前 `READ record = open | rows = 1 | halfStates = ["open-but-settled"]` · `CLOSE REFUSED: batch: 收口链未跑完` · `READ-AFTER record = open`；同一夹具改后 `CLOSE OK` · `READ-AFTER record = closed | halfStates = []`。
- 集成面：`node --test test/integration/ledger-close-proof.test.mjs` ⇒ 2/2 绿；`... batch-gates-reanchor.test.mjs` ⇒ 13/13 绿（含 14-13）；另七档 batch/ledger 集成套（close-gate · ledger-bind · live-batch-lock · status-auto-set · anchor-create · close-token-consume · ledger-read-cross-project）与 `advisor-record-gate.test.mjs`（3/3）全绿。
- 全仓一次：`node test/run.mjs` ⇒ 209 例 203 pass / 6 fail。其中 1 例是本改动（CLI 17-3，已修、单跑 3/3 绿）；余 5 例为环境面（CLI 1-1 / 1-2 / 1-3 = `claude-fake-1` 不在 MODEL_SPECS 且上下文溢出报错；CLI 35-2 / 34-1 = 无可用 Chromium，`DevToolsActivePort not written within 25s`）。后 5 例未在改前树上复跑（unverified），它们不触台账 / 批档写面。
- 行数（`doc_check report` + `lines`，量法 = countContentLines）：`ledger-cmd.mjs` 498 · `batch-lifecycle.mjs` 482 · `ledger-write-ops.mjs` 462 · `batch-closeout.mjs` 265 · `ledger-close-proof.mjs` 113 · `batch-ledger-view.mjs` 81 · 本批单测 339 · `test/integration/ledger-close-proof.test.mjs` 173 · `test/integration/batch-gates-reanchor.test.mjs` 577（越 500 软线：集成用例档，非实现档，阈值射程 = 实现档；未越 800 硬限，无拆分义务，仅提示下一笔无余量）。
- 描述面预算：`node scripts/tool-schema-size.mjs` ⇒ 总量 210,996 字符 · 基线 103,529 · 比值 2.038（目标 ≤ 2.75，未达）；`batch` 22,467（top1）· `ledger` 9,484。两档 tool-docs 换写已计入该读数。
- 文档机检门：`doc_check(mode:"gate")` 判 `tool-docs/ledger.md` ∥ `tool-docs/batch.md` ∥ `test/rtm/batch-ledger.md` ⇒ `DOC-CHECK GATE: PASS`（0 段问题）。

### 决策与偏离披露

- **拆新档**（`batch-ledger-view.mjs`）：不拆则 529 行越 §11.3 的 500 软线；拆是 §11.3 失败侧点名的两条出路之一。代价 = 实现档多一个、设计档受影响表尚未登记（见「设计漂移」第 1 条）。
- **设计未给逐字原文的三处文案自拟**：`repairBlockedError`（补关被其它半状态拦住）、`repairReceiptLine`（`[ledger repair]` 段）、四支豁免的 `message`。§11.2 只定 `{id, reason, message}` 的形与 `**补关记录**` 的逐字，其余按 `batch` / `ledger` 族语域自拟（点名 + 下一步 + `Nothing was written.` / 留痕点名原因与原指针）。
- **豁免判定序**：实现按「指针解析先于读档」，设计表述为「`pointer-not-a-record` → `no-task-book` → `record-not-on-disk`」；三支互斥 ⇒ 任何输入只得一条 notice、序不可观测，代码注释已就地写清（设计档不在本席笔域，未改）。
- **`ledger(update)` 到 `已核销` 不落 `closed_at`**（`applyRowUpdateTx` 的 UPDATE 无该列）：既有行为、本批不改；工具面已写明「a settled row's settled time is the close, not an update」，不把不对称藏着。
- **`proof.base` 缺失即抛**，不给默认值：默认值是替调用者做的决定（内部契约违约就该当场可见）。
- **B/C 补关判据的一次读口径**：`repairDecisionOf` 的读取失败（根不可推导 / 指针不可解析）⇒ `batch: 收口分流不可判（ledger repair read failed）— … Nothing was written.` 拒（fail-closed，不静默落回「正常收口」）。

### 审计与评审轮次（终态 = converged）

- **explore 分歧审计（1 轮）**：4 条发现——tool-docs 两档未同步（高）、新档未登进设计受影响表（中）、out-of-list 一项（中）、§5 空（过程面）。前两条已在同轮处置（tool-docs 已写）或披露（新档 + 本节 + 「设计漂移」）。
- **advisor 代码评审（2 轮，同步）**：
  - 轮 1 = `changes-required`：🔴 1（集成面 CLI 10-3 / 14-3 / 14-13 与 RTM delta 未交付，且现役用例断言的正是新门要拒的那一形）+ 🟡 2 + 🔵 2。
  - 轮 2（核修复）= `pass`：🔴 已修（集成面与 RTM 落地、14-13 新增）；🟡 2 条中「`repairDecisionOf` 直出核层原文」已修、「设计受影响表缺新档」留报告（设计档作者笔域）；🔵 2 条已修；新出 🔵 1 条（RTM 第 14 节节注「十二态」未随 14-13 更新）⇒ 本轮已改「十三态」。
- **修正轮**：2 轮（首轮 5 条 + 次轮 1 条），全部落盘后复跑。

### 设计漂移（交父 / 设计侧，本席不写设计档）

1. `docs/core/design/LEDGER.md` §11.3 的受影响文件表与 `docs/core/design/BATCH-RECORD.md` §4.18-C「受影响面」都未列 `thincoder-core/agent-tools/batch-ledger-view.mjs`；表里 `batch-lifecycle.mjs` 那格的职责描述（一致性预读 + 补关分流）实际已在那份新档。
2. `docs/core/design/LEDGER.md` §11.5 P2-5-A2 的括注「退回后同迁移放行（带 `retro-close` notice）」与现役语义不合：退回边清 `task_book`（既有语义）⇒ 退回后放弃的实际 notice = `no-task-book`；`retro-close` 只属「仍携旧指针的追结行」。本批单测 A2 按实际断 `no-task-book`，`retro-close` 由 A3 的 stale-pointer 行进覆盖。
3. §11.9 的 delta 表只列 10-3 / 14-3 / 14-13，实际另有 2 例因新门 / 补关分流必须改夹具（`batch-gates-reanchor.test.mjs` 14-11 第二拍③、`advisor-record-gate.test.mjs` 17-3）。已按新门改写并跑绿，但 delta 表未登记这两处。

### 笔域外 / 未做

- 需求档旧口径（`ENGINEERING-SYSTEM-OPTIMIZATION.md` A2 ∥ `ENGINEERING-MODE-V2-SPEC-LEDGER.md` F-LX4 / AC-M2-34）仍允许未收口核销：§2 已定由主 agent 同批收正，本席不写需求档。
- 本席读数：**本批新债 0 条**（无可登记项；上述 3 条设计漂移归父 / 设计侧裁定）。
- 本批单测档 `docs/batches/2026-11-11-p2-5-ledger-close-record-gate.test.mjs` 仍在盘，按零留存纪律由父侧收口时删除（收口门会拒）。

## §6 验证与收口（父代理）

**验证（父侧亲跑，读数如下）**

| 项 | 命令 | 结果 |
|---|---|---|
| 本批单测 | `node --test docs/batches/2026-11-11-p2-5-ledger-close-record-gate.test.mjs` | `tests 7 · pass 7 · fail 0` |
| 改前红侧 | 同上（`git stash` 五个核心档后复跑，实施席执行） | `pass 0 · fail 7` |
| 文档机检门 | `doc_check(mode:"gate")`，8 档显式 | `PASS`，0 段有问题 |
| 集成面 | 十个 batch/ledger 相关档 | 全绿（`ledger-close-proof` 2/2 ∥ `batch-gates-reanchor` 13/13 ∥ `advisor-record-gate` 3/3 ∥ 余七档绿） |
| 全仓 | `node test/run.mjs` | 209 例 / 203 pass / 6 fail——1 例属本改动（`17-3`，已修）；余 5 例为环境面（`claude-fake-1` 无规格 ∥ 无可用 Chromium），不触台账写面 |
| 描述面预算 | `node scripts/tool-schema-size.mjs` | 比值 2.038（上限 2.75） |

**收口账**

- 双向咬合落地：`assertAnchorBatchSettleable` 挂 `applyRowClose` 与 `applyRowUpdateTx` 两处；`已核销` ∥ `已废弃` 两个归档目标态同过一门；四支豁免（`pointer-not-a-record` ∥ `no-task-book` ∥ `record-not-on-disk` ∥ `retro-close`）带 `notices`。
- 补关落地：`close` ∥ `status` 两路，`record = open` ∧ 行集非空 ∧ 全归档 ∧ 恰唯一 `open-but-settled` ⇒ 冻结 + §1 段尾 `**补关记录**` 一行 + 回执 `[ledger repair]`，台账行零改写。
- 需求层同轮收正：`ENGINEERING-SYSTEM-OPTIMIZATION.md` A2 改双向咬合（含 13 份 open-but-settled 实测证据）；`ENGINEERING-MODE-V2-SPEC-LEDGER.md` F-LX4 与 AC-M2-34 改「核销须批档已收口」并补四侧验收。
- 设计漂移三处同轮收正：新档 `batch-ledger-view.mjs` 入两张受影响文件表；`P2-5-A2` 括注改 `no-task-book`；§11.9 delta 补 `CLI 14-11` ∥ `CLI 17-3`。
- 范围外未做：13 份既有 open-but-settled 批档**不补写 §3/§4/§6**（用户 2026-11-11 01:02 裁定「已经结算了的就算了」）——补写即伪造验证记录。新机制落地后它们可补关，补关不改段。
- 本批新债 0 条。
