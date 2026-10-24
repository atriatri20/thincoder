# 2026-10-16 · 台账指针判据重锚（判据锚定稳定性收正）
> 六段 append-only，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 编制：主 agent · 2026-10-16 · 来源 = 用户 2026-10-16 原话（逐字）：10:25「但是盘上的批次档不是稳定存在啊！不能把这作为判据啊！」+ 10:27「可以，先这么做试试，ABC都要」——父侧提三件修法（A 判本笔改动字段 ∥ B 「在盘」降为读数 ∥ C 收口自动重锚）获用户接受（**记录 = 用户接受的那句话本身**；A/B/C 展开 = 父侧提议）。。
> 台账 = #1550（core · 归批）。前情 = docs/batches/2026-10-16-ledger-batch-ops.md（台账批级操作；本批 = 其 P2(a)「归批指针门」的判据重锚）。
## §1 讨论（主 agent）
**状态行**：已收口 2026-10-19
<§1 模板占位：本批条目 / 关键判据 / 授权口径>

**用户裁定（2026-10-16 10:41 原话逐字）**：「同意你的判断。」⇒ **父侧所提 ②（收口时对指向本档的未落行「自动重锚」：改 `trigger=条件`，复启句 = 机械可造的事实句，如「原批 X 已收口，须另起批次接手」——不编内容、只陈述事实）获用户接受**（**② 的展开 = 父侧提议**；记录 = 用户接受的那句话本身）。**取舍经过（不缩水地摆过，用户知情后点头）**：设计席 `#119` 原判 C = **零写报警 + 建议处置句**（理由：`认账不排期` = 政策判断、`条件` 的复启句机器编不出 ⇒ 代填 = 造假账；且 `docs/core/design/BATCH-RECORD.md` §8 边界 12「只读只报」）；父侧 10:40 摆出 ①（盘上现状 = 零写报警）/ ②（自动重锚 + 事实句）两案并推荐 ②，用户 10:41 采纳 ②。⇒ **② 的两项代价用户已知情**：**(a)** 须修正 `BATCH-RECORD.md` §8 边界 12（收口径允许写台账行）；**(b)** `归批` 意图会被自动降级（回执照报）。**本轮批范围随之含 `docs/core/design/BATCH-RECORD.md` 一处边界修正**（同一机制链，不另立批）。**父侧另裁（设计席 ④.2 待裁）**：验收「在盘不进任何门判据句」按**语义**落——杀的是「判结果行 / 判存量行」的死锁；判**本笔刚写进去的指针**有效属合理（保 §3.3「同一律」对照）。

**收正轮 `eng-designer#120` 已落**（2026-10-16 10:49）：C 改写为**收口自动重锚**（`LEDGER.md` §6.2：自动改 `trigger=条件` + 复启句落 `evidence`；`认账不排期` 零触）+ 四件齐（幂等 ∥ 单事务失败整集回滚 + 回执照报 ∥ 执行人 = `batch` close 径一次动作、`ledgerReanchorBatch` 单源 ∥ 不自阻塞证明）+ `AC-M2-30` ∥ 用例 ∥ §7.1 新导出 ∥ §9 边界 ∥ `BATCH-RECORD.md` §4.13（选行单源 = 解析同址）∥ **§8 边界 12 放开收径一处**（其余仍只读只报）∥ 术语随改。**父侧当场裁决其 ④ 六项**：**1**（需求面无 AC-M2-26+ 行）= 受理，**父侧本轮已落**——`AC-M2-10` 收正（「在盘」移出结果行判据、锚到本笔写入面）+ **新增 `AC-M2-29` ∥ `AC-M2-30` ∥ `AC-M2-33`**（`requirements/ENGINEERING-MODE-V2-SPEC-LEDGER.md`，回读在位 ✓；**注**：`AC-M2-26…28` 缺号非本批遗漏——设计档该号段未用）；**2**（`resume_when` 在册存疑）= 受理其判「未在册」——句落 `evidence` + 迁移注；**3**（选区排除 `认账不排期`）= **确认**——与用户已接受的 ② 逐字一致（父侧 10:41 记「`认账不排期` 不自动」）；**4**（其独立异议：自动改行把处置权从行主挪给机器）= **在册**（异议不隐藏，判决已由用户下、不因此回改）；**5**（T99 所属前批用例档）= 记：该档若仍在盘即为「零留存」遗留，实施轮核；**6**（顺手折 `BATCH-RECORD.md` §4.10 一处既存超宽 304 字符非表格行）= **受理**（一处小形、零语义、已如实报）。**下一步** = 点火设计评审（对象 = 设计两档 + 需求面；**经用户 10:42「自动跑完」授权由父侧代点**）。

## §2 批次任务与设计（eng-designer）
**状态行**：设计完成
<§2 模板占位：本批条目（覆盖） / 设计档落点 / 机制设计 / 受影响文件与测试覆盖 / 验收对照 / 关键决策 / 上抛项>

**状态行**：设计完成

**本批条目（覆盖）与设计落点**（三件 + 随改；均「文件 + 节 / 符号 + 形态」级）：

| # | 条目 | 设计落点（file / 节） | 形态一句话 |
|---|---|---|---|
| A | 门只判**本笔写入面** | `docs/core/design/LEDGER.md` §6.1（判据句 + 两臂表）∥ §6.2（形态两臂）；实现 = `thincoder-core/ledger-cmd.mjs` `assertTaskBookGate`（入参换「本笔写入面」） | 臂① 结果行存在性（`在途 / 待核销 / 归批` ⇒ `task_book` 非空，**不判在盘**）；臂② 本笔新指名（新写 `task_book` ∥ 新写 `trigger=归批` ⇒ 绑定值非空 ∧ 可解析 ∧ 在盘）；两臂之外**零判** |
| B | 「在盘」由门降**读数** | `LEDGER.md` §7.1（`ledgerQuery` 逐行 `taskBookOnDisk` + 读面导出 `ledgerBatchRows`）∥ §5 读数行 ∥ §2.2 旗转读数 ∥ §6.1 口径 5 | 逐行携计算字段（不入库、不入 `DATA_COLUMNS`）；收口报警读数非门；`migrate` 旗转读数 |
| C | 收口**重锚处置** | `LEDGER.md` §6.2「收口报警」+「不自动改」；实现 = `thincoder-core/agent-tools/batch-lifecycle.mjs` close 径 | 择 **① 零写报警 + 建议处置句**（不自动改行——理由三条见 §6.2） |
| AC | 验收面随改 | `LEDGER.md` §8 | AC-M2-10 / AC-M2-26 / AC-M2-29 / AC-M2-30 改写 + **新增 AC-M2-33**（读数）——逐条可跑形在册 |
| — | 关联面随改 | `LEDGER.md` §2 ∥ §3.2 ∥ §5 ∥ §9 ∥ **新增 §3.6** ∥ 用例 T11–T14 / T32 / T55 / T98 改写 + **T102–T108 新增** | 三条链同源（见下「三方一致」） |

**设计档落点**：`docs/core/design/LEDGER.md`（**唯一落笔档**——现读 **632 行**，node 实读；本批新增 §3.6 + 改写 §2 / §2.2 / §3.2 / §5 / §6.1 / §6.2 / §7.1 / §8 / §9）。
**三方一致**：本表条目 = 设计档 §8（AC-M2-10 ∥ AC-M2-26 ∥ AC-M2-29 ∥ AC-M2-30 ∥ AC-M2-33）= **需求档待落 / 待收正 4 处**（`AC-M2-10` 收正——现载「指向档不存在 ⇒ 拒」；`AC-M2-29 ∥ AC-M2-30` 收正；`AC-M2-33` 新增）——**需求档笔归主 agent**（本席零触 `docs/core/requirements/**`，`git status` 可核）。

**机制设计（要点）**：

- **判据锚点**：门只判**命令对象自身可答**的事实（点名非空 / 本笔新指名）；「档此刻在不在盘」= 会**合法翻转**的事实（批档按设计可随时整体清理——`DOC-DISCIPLINE.md` §4.5.1），当门即死锁（出路正是被拒字段）。
- **同族单源**：臂② 与 §3.3 `batch` 入参自身门同族（**本笔指名一个批档 ⇒ 须在盘**）——判本笔入参自身，出路恒在本笔入参。
- **读数形态**：`taskBookOnDisk` 沿 `aged` / `evidenceOversize` 先例（逐行携、不入库、不入 `DATA_COLUMNS`）；检出面**不依赖批档在盘、不依赖收口时点**（`trigger=归批` 过滤 + 读数 `false`）。
- **迁移旗转读数**：`writeGateFlag` 由「该行后续更新将拒」改判为**读数旗**（不拦任何写入）——写门与迁移旗同源解析单点 `resolveDeclaredRef` 不变。

**关键决策（含被否项）**：

- KD-PG1 **门判「本笔写入面」两臂**；被否 = 继续判「结果行 `(status, trigger, task_book)` 组合」（射程连带 ⇒ 合法账务被拒 + 死锁）。
- KD-PG2 **「在盘」降为读数**（query 逐行 + 收口报警）；被否 = 保留为门（同 KD-PG1）。
- KD-PG3 **[C 择一] 收口重锚 = 零写报警 + 建议处置句**；**被否 = 真自动改行**。理由三条：① 两个候选处置都要**行主人裁定**（`认账不排期` = 把未结工作降级为不排期 = 政策判断；`条件` = 需一句机器无从编造的复启条件句）⇒ 机器代填 = 造假账；② 台账纪律**禁静默改账**（§3.3 安全阀：跳过行逐行点名、绝不平账）；③ 报警侧**只读开库**是既有裁定（`design/BATCH-RECORD.md` §4.13 ∥ §8 边界「只读只报」）。**若父侧要真自动改** ⇒ 须另裁（谁执行 / 幂等 / 撞门 / 失败语义四件齐定义 + 推翻 §8 边界 12 裁定）。
- KD-PG4 **[臂② 射程] 全状态**（含 `待讨论 / 待设计` 行新写 `task_book`）；被否 = 只判 `在途 / 待核销`（A 的语义为本笔新指名有效，与状态无关）。⇒ T14 语义随改（原「待讨论行带任意 task_book 不判」→「本笔新写须在盘」）。
- KD-PG5 **不新增 `count` 面读数 / 不改显示面（L1 / L2 / 端胶水）**；被否 = 扩 warn 聚合（改 AC-M2-18 语义面——超本批范围）。

**受影响面（行数 = 现行 · 落笔当刻 node 实读）**：

| 文件 | 现行 | 预计 | 面 |
|---|---|---|---|
| `thincoder-core/ledger-cmd.mjs` | 179 | +~25 ⇒ ~204 | 门两臂 + 本笔写入面入参 + query 读数键 + `ledgerBatchRows` |
| `thincoder-core/agent-tools/batch-lifecycle.mjs` | 376 | +~20 ⇒ ~396 | close 径报警（只读 + 逐行点名 + 处置建议） |
| `thincoder-core/ledger-migrate.mjs` | 301 | ±5 | `writeGateFlag` 转读数（文案 + 头注） |
| `thincoder-core/ledger.mjs` | 187 | +2 | `ledgerBatchRows` re-export |
| `thincoder-core/ledger-db.mjs` | 175 | 0 | 零改（读数不入库） |
| `thincoder-core/declaration.mjs` | 379 | 0 | 零改（`resolveDeclaredRef` 既有） |
| `thincoder-core/ledger-tools.mjs` | 260 | 0 | 零改（参数声明面） |
| `thincoder-core/tool-docs/ledger.md` | 6 | 换写 | query 读数键 + 归批门句 |
| `thincoder-core/test/<本批件>` | 新建 | ~120–180 | T102–T108 |

**贴线判**：有增量四档增量后最高 ≈396 行（`batch-lifecycle.mjs`）⇒ **零拆分义务**（500 顾问线）；全列最高 = `declaration.mjs` 379 行（零改）。

**存量兼容（逐条声明）**：

- 存量 `在途 / 待核销` 行带**已清档指针** ⇒ 本批后其任意更新**零阻**（改前为门拒 ⇒ 死锁）——**不迁移存量数据**（父侧专权）。
- 存量 `trigger=归批` 无在盘 `task_book` 的行（前批登记 ≈20 行）⇒ 其 `status` / `evidence` / `task_book` 重指**零阻**；仅当**本笔新写** `trigger=归批` ∥ 新写 `task_book` 时受判。
- `ledger(add)` 单行面：**新写 `task_book` 须在盘**（新行为——臂② 全状态射程；旧用例 T14 语义随改）。
- DDL / 迁移表 / 六态 / 守卫声明面：**逐字零改**。

**验收对照（回指验收标准 ①–⑦）**：① `在盘` 逐处读数表 = 交付报告 ③（门类只剩**本笔指名**一义）；② A / B / C 落点 = §6.1 两臂表 ∥ §7.1 `taskBookOnDisk` ∥ §6.2 收口报警（逐件在册）；③ AC-M2-29 / AC-M2-30 随改（+ AC-M2-10 / AC-M2-26 / 新增 AC-M2-33）；④ 先例行 + 勘察证据行 = **§3.6**；⑤ 受影响面表 = 本段（逐档实读 + 增量）；⑥ 行宽 = `checkDocWidths` 读 **0**（非表格行 >300 = 0；5 条长行皆表格行 = 豁免）；⑦ 需求面零触 = `git status` 可核。

**自洽复查读数（三机检）**：① 引用集 ↔ 标题集 = 逐号在盘（§2 / §2.1 / §2.2 / §3.2 / §3.3 / §3.4 / §4 / §5 / §6.1 / §6.2 / §7.1 / §8 / §9 + 新增 §3.6）；② 表行 ↔ 汇总计数 = 「实现 4 档」列 4 行、「用例 T102–T108」列 7 条、AC 新增 1 行——逐项相符；③ 断言 ↔ 实测 = 行数 / 行宽 / `publicRepos` 皆本席 node 实读（非记忆）。

**本轮不做**：产品码实现（实施轮 = eng-coder）· **需求面回指 = 父侧笔（另办）**· 台账存量数据修复 · `BATCH-RECORD.md` 任何落笔（本轮唯一落笔档 = `LEDGER.md`）· `count` 面读数 / 显示面改造 · 其余批的面。

**fix 轮收正（2026-10-16）——C 处置改判：零写报警 ⇒ 收口自动重锚**（本块 = 本批 C 的最新口径；上表 C 行与 KD-PG3 以本块为准）

- **来源** = 用户 2026-10-16 10:41 原话「同意你的判断。」⇒ 采纳**父侧所提 ②**（**② 的展开 = 父侧提议**）；本席原判 C（零写报警 + 建议处置句）被否，理由（用户口径）= 报警仍把行留给人工 ⇒ 行不会自己脱钩。
- **落地（本轮笔域 = 两档设计档）**：`docs/core/design/LEDGER.md` §6.2（收口重锚段 + 只锚 `条件` 段 + 复启句模板 + **四件**：幂等 ∥ 失败语义 ∥ 执行人∥授权面 ∥ 不自阻塞证明）∥ §7.1（新增导出 `ledgerReanchorBatch`；`ledgerBatchRows` 消费面改指重锚）∥ §8 AC-M2-30 ∥ §9 边界 ∥ §3.6 ∥ 用例 T99/T108；`docs/core/design/BATCH-RECORD.md` §4.13 ∥ §8 边界 12 ∥ §7 D-BR29 ∥ §4.17 ∥ BR-56。
- **受影响面（本轮实读 · 口径 = 现档同法 `split("\n").length`）**：`thincoder-core/ledger-cmd.mjs` 179 ⇒ ~219（+ 写面导出 `ledgerReanchorBatch`）· `thincoder-core/agent-tools/batch-lifecycle.mjs` 376 ⇒ ~401（close 径重锚）· `thincoder-core/ledger.mjs` 187 ⇒ ~190。
- **仍上抛（待裁）**：① 需求档 AC-M2-30 的收正 = 主 agent 笔（本席零触 `docs/core/requirements/**`——`git status` 可核）；② `resume_when` 列「在册与否」存疑（§3.4 已设计，而 §2 逐字 DDL 与在盘代码均无该列）⇒ 本轮按**未在册**落 `evidence` + 迁移注；③ 本席在已裁口径内作了一处**判据收窄**：`trigger = 认账不排期` 的行**零触**（否则重锚会抹掉行主人已落的政策判断）——若父侧要「无差别全改 `条件`」，请另裁。

**fix 轮收正 2（2026-10-16）——设计评审 `advisor#122` 13 条逐号点改**（来源 = 本批档 §3 发现表 + 父侧裁决「13 条全受理 · 无驳回无搁置」；执行人 = eng-designer）

笔域 = `docs/core/design/LEDGER.md` + `docs/core/design/BATCH-RECORD.md`（**需求面零触**——`docs/core/requirements/**` 归主 agent；需求侧三处只在 `LEDGER.md` §3.6 落「应对齐到 X」对齐注）。

| 发现号 | 改动 §节 | 处置 |
|---|---|---|
| #1 🔴 | `LEDGER.md` §6.1 口径 3 ∥ §6.1 臂② bullet ∥ §3.2 ∥ §8 AC-M2-10 ∥ 用例 T13 / T105 | 定口径 = **显式空值（`null` / 空串 / 全空白） ≡ 未指名**（臂② 不触；臂① 射程内拒「必填」）；`§2` 类「非空但缺文件部分」⇒ 臂② 拒——四处 + AC + 用例逐处改齐 |
| #2 🟡 | `LEDGER.md` §2.2 步 2 / 步 3 / 语义保全 ∥ §3.4（新增「在册状态」行）∥ §3.5 ∥ §8 AC-M2-12 / AC-M2-33 ∥ 用例 T25 / T29 / T107 | 实读定真值 = **`resume_when` 未落地在册**（`ledger-db.mjs` DDL ∥ `ledger-migrate.mjs` `DATA_COLUMNS` 均无该列 ⇒ 现行 12 数据列）⇒ 全档 13 类表述收正为 12（落地后随增 13）+ 该列落地批登记指针 = 台账 #1530 的 P5 |
| #3 🟡 | `LEDGER.md` §3.6 需求侧对齐注 | 需求档 ② 功能点缺本轮机制条目（需求面）⇒ 设计侧只写「应对齐到」一句 |
| #4 🟡 | `LEDGER.md` §3.6 需求侧对齐注 | 需求 AC「重指照过」与臂② 冲突（需求面）⇒ 设计侧写「照过 = 只就旧档已清不阻该笔；重指到不在盘档仍按臂② 拒」 |
| #5 🟡 | `LEDGER.md` §8 AC-M2-33 | 设计 AC 补「迁移 dry-run 读数旗同为读数 · 不拦任何写入」（§2.2 / §6.1 口径 5；验证由 T32 承载） |
| #6 🟡 | `LEDGER.md` §3.6 实现档注 | 写清 = **行为零改**（实读 `writeGateFlag` = 返旗串 ∥ `null`，只报告不拦截）；本批只收正旗面文案与头注 |
| #7 🟡 | `LEDGER.md` §6.2 ∥ §6.2 次序假设 ∥ §7.1 `ledgerReanchorBatch` ∥ §8 AC-M2-30 ∥ §9 ∥ 用例 T99 ∥ `BATCH-RECORD.md` §4.13 / BR-56 | 取行收窄 = `status ∈ {待讨论, 待设计, 在途}`（`待核销` 属已落只待结账，不取）；写明次序假设（核销与 close 无先后约束）；T99 补 `待核销` 行一拍 |
| #8 🟡 | `LEDGER.md` §3.6 用例档 + §9 用例表头 | 指名档 `thincoder-core/test/ledger-pointer-reanchor.test.mjs` + 规模 ~120–180 行（替掉 `test/<本批件>` 占位）；零留档保留（写明 = 一次性验收 · 随实施轮跑完即删） |
| #9 🟡 | `LEDGER.md` §3.6 文档面 / 零改面 ∥ `BATCH-RECORD.md` §4.17 文档面 | 两表互不认账逐处补齐：`BATCH-RECORD.md` 各节 + 需求档 AC 行入文档面清单、自「零改面」移出；`BATCH-RECORD.md` §4.17 补 §7 / §8 |
| #10 🔵 | `LEDGER.md` §3.2 受影响面 ∥ §3.6 贴线判 | 实读统一：`ledger-tools.mjs` 187 ⇒ **260 行**；`batch-lifecycle.mjs` 增量后 ≈396 ⇒ **≈401 行** |
| #11 🔵 | `LEDGER.md` §3.6 先例行 + 无先例宣告 | 先例补实现坐标（`assertTaskBookGate` / `ledgerQuery` 的 `aged` / `assertToolArgs` / `batch-lifecycle` close 径）+ 批次号（2026-10-07 批 ledger-tool · 2026-09-28 守卫族微修批 · 台账 #473）；「无先例宣告」改写 = **A / B 有同形先例、C 为本仓首次** |
| #12 🔵 | `LEDGER.md` §7.4 不变量 ② | 写面口径补收径代理写（主 agent 写命令 ∥ `ledgerReanchorBatch` 代理写），与 `BATCH-RECORD.md` §8 边界 12 对齐 |
| #13 🔵 | `LEDGER.md` 用例 T108 | 指明失败注入手法（既有手法 = 第二连接持写锁 ∥ 临时目录夹具，与 T27 同族；注入点 = 实施轮定） |

**本轮验收读数（实跑）**：① 两档 >300 字符非表格行 = **0**（`checkDocWidths` 引擎命中 0 + 逐行读数 0；`LEDGER.md` 656 行 ∥ `BATCH-RECORD.md` 520 行，node 实读）；② 空值写入口径四处一致（§6.1 口径 3 ∥ §6.1 臂② bullet ∥ §3.2 ∥ 用例 T13）；
③ `13 数据列` / `13 列零变` 类表述残余 = 0（仅余 AC-M2-32 落地形「12 ⇒ 13」与各处「落地后」限定语）；④ `∉ {已核销, 已废弃}` 残余 = 0（两档）；新增 `∈ {待讨论, 待设计, 在途}` 共 6 处；
⑤ 需求面零触（`git status`——`docs/core/requirements/ENGINEERING-MODE-V2-SPEC-LEDGER.md` 的在册改动 = 父侧先落，非本席）。

**另报（发现 · 非本批射程）**：`LEDGER.md` §3.3 / §3.4 / §3.5 + AC-M2-26…28 / 31 / 32 + 用例 T92–T101 所载「批甲」设计**未落地在册**（实读：`ledger-cmd.mjs` 无 `batch` 选行 ∥ `ledger-tools.mjs` 无 `batch` / `task_book` / `resume_when` 声明 ∥ `ledger-db.mjs` 无 `EVIDENCE_SOFT_LIMIT` ∥ 无 `test/ledger-batch-ops.test.mjs`）。
该段以现行为基线叙述，未逐处标「待落」；本批只按 #2 收正 `resume_when` 一列口径，未扩面。

**本轮不做（清单）**：需求面（`docs/core/requirements/**`）归父侧笔——本席零触，只落「需求侧应对齐到 X」对齐注（#1 / #3 / #4 / #5 四条）· 产品码实现（实施轮 = eng-coder）· 其它档 · 台账存量数据修复 · 不重开全档设计、不顺手扩面、不整仓扫。

**收正轮（2026-10-19）——与批级批量面的收口边界落笔**（来源 = 本笔任务书验收 ③；C 案本身在前轮已落，本轮零改）

- **本轮落笔**：`docs/core/design/LEDGER.md` §6.2 新增「收口三动作边界」块（三条 = 先后 ∥ 幂等 ∥ 冲突裁决）+ §9 新增「收口动作不二造」一条 + AC-M2-30 尾部补共存边界回指；`docs/core/design/BATCH-RECORD.md` §4.13 补「收口时点的其它动作」一句（指向单源，不重述）。
- **核实 = 前轮已落、本轮零改**：C 案 = `LEDGER.md` §6.2 收口重锚段 + AC-M2-30 + `BATCH-RECORD.md` §8 边界 12（收径放开写台账行）+ §4.13 + D-BR29；A 案 = `LEDGER.md` §6.1 两臂 + AC-M2-29 + AC-M2-10。实读代码 = 旧形（`thincoder-core/ledger-cmd.mjs:68-76` `assertTaskBookGate` 旧签名旧判据；`batch-lifecycle.mjs` close 径无重锚）⇒ 设计段「未落地在册」在册属实。
- **口径纠正（报告项）**：任务书写「批 E 的级联 = 收口时的批量结算」；实读批 E §2.1/§2.4 = 批量结算是 `ledger(close)` 携 `batch` 的**显式调用**，close 径上挂的是「重锚（写）+ 出口清单（读）」两件。本轮按实读落边界（结算不在 close 径），否则会种下一条假规则。
- **验收读数**：doc-check gate = `DOC-CHECK GATE: PASS`（显式 2 档全清，0 命中）。
- **不做**：需求档（笔归主 agent）· 产品码实现 · 批 E 的 P1/P4/P5/P6 本体 · 台账存量数据。

**修正轮 3（2026-10-19）——评审 pass 后 10 条逐号点改**（来源 = 本批档 §3「轮次 2」发现表 + 父侧全受理裁定；笔域 = `docs/core/design/LEDGER.md` + `docs/core/design/BATCH-RECORD.md`；需求面零触）

**两条让实施跑偏的钉子（逐字）**：

- **次序句（新增 §6.2 五件之 5）**：「重锚 = close 的**全部拒因通过、§1 状态行改写落盘之后**的一次动作（现形 = `thincoder-core/agent-tools/batch-lifecycle.mjs:498-503`：四道门与状态行写盘同序）；close 被任一拒因拒（身份 ∥ 冻结 ∥ 链完整性门 ∥ 文档机检门）⇒ **台账零写**（不取行、不改行、不落复启句）。理由 = 被拒的 close 没有收口，「原批已收口」在那时是假事实——先跑重锚就把假句写进账。」
- **`cwd` 基准句（新增 §6.2）**：「上两调的 `cwd` = **批档所属项目根** = `resolveLedgerRoot(dirname(<batchDoc>))?.root ?? resolve(dirname(<batchDoc>))`（= §6.1 口径 2 的同一子表达式，入参换成批档目录——close 手上只有档路径）——**不用会话锚**：会话锚为工作区 ∥ 容器时该式按 §2.1 / §3.8 收敛序可能收到**另一个项目的根** ⇒ 选行零命中 ⇒ 唯一的机器写在静默中什么也没做，且零报错。」

**失败上报载体（父侧二选一，本席取「返回形加项」）**：`ledgerReanchorBatch` 返回形 = `{ batch, reanchored, alreadyAnchored, failed }` —— `failed: null` 常态 ∥ 失败因串（此时 `reanchored = []`）；失败**不抛**，close 径把它并入同一回执。理由 = 回执合并一处、可机检断言；catch 串匹配在实施轮是脆的。

**逐号点改**：

| # | 处置 | 落点 |
|---|---|---|
| 🟡1 | 现档已一致，零改（核实读数：`LEDGER.md:304-307` 四件全 → #1550；`:305` 注 #1530 只定形 P2(a)；`:900` / `:916` T99 落 #1550 档） | 无改动 |
| 🟡2 | 补次序句（五件之 5）+ 失败载体（返回形 `failed`）+ AC-M2-30 随改 + 用例 T123/T108 | `LEDGER.md` §6.2 五件、§7.1 `ledgerReanchorBatch` 行、AC-M2-30、T108、新增 T123；`BATCH-RECORD.md` §4.13 |
| 🟡3 | 补 `cwd` 基准句 + §7.1 两行随改 + 用例 T124 | `LEDGER.md` §6.2、§7.1、新增 T124 |
| 🟡4 | 判据单源改指 `BATCH-RECORD.md` §4.18（650 触真值在 §4.18 贴线判；原引 `:450` 直行号亦一并去掉） | `LEDGER.md` §3.5 :338、§3.6 :374、§3.7 :463 |
| 🟡5 | §4.13 收为「调单源 + 本档特有面」，取行谓词只留 §6.2 一份 | `BATCH-RECORD.md` §4.13 两段 |
| 🟡6 | 现档已无「既有语义」判读（§6.2 :654「形态 = §6.1 两臂（单源，本节不重述）」），零改 | 无改动 |
| 🔵7 | 行数统一现读 253 / 275 / 506（node 实读）；§4.17 档位判重算 ≈531 < 650 | `BATCH-RECORD.md` §4.17 :373/:377、§4.18 :442/:450；`LEDGER.md` :237 |
| 🔵8 | `index.publicRepos` 实读坐标 = `PROJECT-MANIFEST.json:61`，四处在册统一 | `LEDGER.md` :320/:449/:517；`BATCH-RECORD.md` :369/:437 |
| 🔵9 | 现档已收为单句（§6.1 :644「缺指针文案单源……不分文案」），T106 逐字断言唯一，零改 | 无改动 |
| 🟡10 | 需求侧 AC-M2-10 / AC-M2-29 对齐 = 父侧笔，本轮只登记 | 上抛 |

**读数（本轮实跑）**：① node 实读 = `LEDGER.md` 973 行 ∥ `BATCH-RECORD.md` 637 行 ∥ `ledger-db` 253 ∥ `ledger-tools` 275 ∥ `batch-lifecycle` 506 ∥ `ledger-cmd` 178 ∥ `ledger.mjs` 156；② doc-check report = 0 命中（锚 0 · 行宽 0）；③ **doc-check gate = ERROR**（`tool-docs/doc_check.md` mtime 晚于本会话启动 ⇒ 旧引擎读数不可作交付判据）——**未获 PASS**，需重启会话复跑；本席不自行豁免。

**本轮不做**：产品码实现 · 需求档（笔归主 agent）· 其它批次档 · 台账存量数据。

**读数更正（回读自检 · 落笔后复读）**：上块「① `LEDGER.md` 973 行」为笔误——改后 node 复读 = **967 行**（`BATCH-RECORD.md` 637 行不变）。以本行为准。

**修正轮 4（2026-10-19）——轮次 3 评审 🟡1 / 🟡2 / 🟡3 逐号点改**（来源 = 本档 §3「轮次 3」发现表 1/2/3 + 父侧全受理裁定；🔵4–🔵9 只做不加面；笔域 = `docs/core/design/LEDGER.md` + `docs/core/design/BATCH-RECORD.md`；需求面零触）

**🟡2 裁定 = (a) 本批即落 `resume_when`，删迁移注**（父侧二择一中的前者）。依据（实读，非推断）：

- 盘面：`thincoder-core/ledger-db.mjs:178` DDL 含 `resume_when TEXT` ∥ `:254` `ensureColumn(db, "resume_when")` ∥ `thincoder-core/ledger-migrate.mjs:20`–`:23` `DATA_COLUMNS` 13 列（`:26` 容忍集含该列）⇒ 该列**已落地在册**，`LEDGER.md` 前载「DDL 无该列」为失效前提。
- 锚文法原文（`LEDGER.md` §3.4）：「对 `resume_when` 串从左到右取首个 `@` 起始 token（`@` 后非空白连续串；句内位置不限；多锚只取首枚）——① token 形合 `^\d{4}-\d{2}-\d{2}$` 且为真日历日 ⇒ 日期锚；② 含 `@` token 而非法日期锚 ⇒ 事件锚；③ 无 `@` token ⇒ `free`」，且「两类皆无 ⇒ 类别 `free`（**可枚举缺席**：机器不判 due，读数面照出「不可机判」）」。
- 复启句实样：`原批 <批名> 已收口，须另起批次接手`（`<批名>` = `batch` 值文件部分，如 `2026-10-16-ledger-pointer-gate-reanchor.md`）——**无 `@` token ⇒ 文法判 `free`**，属合法类别、不产 `resume_due`（零假阳）。⇒ 父侧给的 (b) 前提「若复启句实样过不了该文法」**不成立**，故取 (a)。
- 附带定形（(a) 的必然后果，非新机制）：**不覆盖行主条件句**——该列现值非空（行主已写复启条件）⇒ 原值不动、复启句追加 `evidence`，回执点名该形（否则机器写会抹掉人的条件句）。
- 三处同改已落：`LEDGER.md` §6.2 复启句段（落点 / 锚文法相容 / 不覆盖）· AC-M2-30（`:835`）· §9「收口重锚不做」（`:971`）· `BATCH-RECORD.md:185` BR-56；并随改 §7.1 `ledgerReanchorBatch` 行、用例 T99、§6.2 五件之 1/4。

**🟡1 逐块收正（号 → 改前实读 → 改后实读坐标）**：每块按盘面实读改，未沿用旧读数。

| 位置（改后行号） | 改前（已失效） | 改后 |
|---|---|---|
| `LEDGER.md` §3.3 :245 | 「无批量选行 / 无 `ledgerUpdateBatch` / `ledgerCloseBatch`，`ledger-tools` 无 `batch` ⇒ 未落地」 | 已落地（#1530 P1）；`ledger-cmd.mjs:300` `ledgerUpdateBatch` ∥ `:325` `ledgerCloseBatch` ∥ `:288` `resolveBatchRows` ∥ `ledger-tools.mjs:275` / `:281` 分派（`:152` / `:168` `oneOfRequired`） |
| §3.4 :287 | 「该列未落地在册，现行 12 数据列」 | 已落地（#1530 P5）；`ledger-db.mjs:178` / `:254` ∥ `ledger-migrate.mjs:20`–`:23` 13 列 |
| §3.4 :292 | 「导出面入 `DATA_COLUMNS`（落地后 12 → 13）」 | 「已落 · 13 列」 |
| §3.5 :300 | 「本节增量未落地在册 / 增量本体 = 落地后目标态」 | P1 ∥ P4 ∥ P5 ∥ P6 已落地（#1530）；逐件实装坐标在册 |
| §3.5 :313 | 「本批 #1530 的实施面 = P1 ∥ P4 ∥ P5 ∥ P6」 | 四项均已落地；上表四件（A / 归批门 / B / C）仍只定形、落地批 = #1550 |
| §3.7 :392 | 「未落地：无 `overdueOf` ∥ count 裸数 ∥ `formatDetailLine` 仅（老化）」 | ① 机判单源 ∥ ② 盘点读数**已落**（`:70` / `:101` / `:123` / `ledger.mjs:103` / `:121` / `:140`）；**③ 轮界清单未落地**（`batch-lifecycle.mjs:504` close 回执无该清单） |
| §7.1 :699 | 八行携未落地增量（含 #1530 六项） | 未落地只剩三处：`taskBookOnDisk` 键 ∥ `ledgerBatchRows` ∥ `ledgerReanchorBatch`；#1530 六项移入「已落地」 |
| §8 :802 | AC-M2-26/27/28/31/32/34/35 全列未落地；实读证据含「DDL 无 `resume_when`」 | 已落 = AC-M2-26/27/28/31/32/34；**半落地 = AC-M2-35**（close 回执清单半幅未落）；未落 = AC-M2-29/30/33；实读证据改为现盘面（`:144` 旧形 ∥ 无 `taskBookOnDisk` ∥ 无两导出 ∥ close 径无重锚） |
| AC-M2-12 / AC-M2-32 / AC-M2-33 / T25 / T29 / T107 | 「12 数据列」「12 ⇒ 13」「落地后随增至 13」 | 统一为 13 列（该列已落） |

**🟡3 行数注记（2026-10-19 node 实读 · `split("\n").length`）**：`ledger-cmd` 349 ∥ `ledger-db` 265 ∥ `ledger-tools` 321 ∥ `ledger.mjs` 159 ∥ `ledger-migrate` 305 ∥ `ledger-read` 94 ∥ `declaration` 379 ∥ `batch-lifecycle` 506 ∥ `read-data` 147 ∥ `tool-docs/ledger.md` 9。§3.5 表按此重写（另删去 `ledger-tools` 的重复行、补 `ledger-migrate` 行）；终值 = `ledger-cmd` ≈389 ∥ `batch-lifecycle` ≈546。**档位结论 = 两档都不触发拆分**（546 < 650；389 < 500），该句已在 §3.5 在册。§3.7 表 `read-data` 146 ⇒ 147、`tool-docs` 6 ⇒ 9 随改。

**🔵 顺带（只做不加面）**：① §6.1 在册状态的行号回填 = `ledger-cmd.mjs:144`（判据体 `:145`–`:151`，三条拒因 `:146` / `:148` / `:151`）；② §6.2 `cwd` 回退支改判 = 无根（`resolveLedgerRoot` 返 `null`）⇒ 不取行、不重锚，`failed` = 「批档所属项目根不可推导」+ 回执点名，不落兜底基准（T124 语义随句在册）；③ §6.2 落点句收为「回执单源 = `ledgerReanchorBatch` 返回形」（close 径不另调 `ledgerBatchRows`），§7.1 给 `ledgerBatchRows` 补失败语义（不可解析 ∥ 无根 ⇒ 抛，同 `assertBatchArg` 形）；④ BR-56 取行谓词二写收指 `LEDGER.md` §6.2。

**上抛（待裁 / 知会）**：

- **[上抛·待裁]** AC-M2-35 半落地：`batch close` 回执清单半幅未落（`batch-lifecycle.mjs:504` 回执只有状态行 + 机检行），而 #1530 的 P1/P4/P5/P6 已落 ⇒ 该剩余半幅需父侧定归批（本席按实读写「挂账 = #1530 出口面剩余」，未改批号）。
- **[上抛·知会]** 需求面 AC-M2-10 / AC-M2-29 / AC-M2-30 收正仍为主 agent 笔（轮次 3 #9），本席零触 `docs/core/requirements/**`。
- **[上抛·知会]** 本段前文（2026-10-16 块）引「`ledger-cmd.mjs:68-76` `assertTaskBookGate`」已漂：现实读 `:144`–`:151`。段体 append-only，不改旧行，以本条为准。
- **[上抛·知会]** 批档 §3「轮次 3」发现 7 提到的 `2026-10-16-…:220` 引「§3 :180」漂移属评审段，本席不动（§3 归评审子代理）。

**读数**：doc-check gate = 见下条；代码零改（本席不写 `src/**`），故行数读数与落笔前一致。

**修正轮 5（2026-10-19）——收口两路同源：设计档「只 close 一路」收正**

来源 = 本档 §5 报告项 [上抛·待裁]「设计权威档仍写只 close」+ 父侧本轮任务书。笔域 = `docs/core/design/LEDGER.md` ∥ `docs/core/design/BATCH-RECORD.md`（需求面零触；`thincoder-core/**` 零触）。

**实读核对（落笔当刻，代码为据）**：`batch-lifecycle.mjs` = 555 内容行；收口判据单点 `closingValue:471`（链门 `:472` ∥ 机检门 `:475` 同消费）· `status` 径重锚调点 `:486`（状态行写盘 `:478` 之后）· `close` 径调点 `:520`（写盘 `:515` 之后）· 单源定义 `reanchorOnClose:531` · 回执 `reanchorReceiptLine:545`（`:487` / `:521` 两路共用）。

**逐处收正（改后行号 = 落笔后实测）**

| # | 位置（改后） | 改前 | 改后 |
|---|---|---|---|
| 1 | `LEDGER.md` §6.2 :673–675 触发句 | 批档收口（`batch` close）⇒ 取未落行… | 批档收口 = **两路同一单源**——`batch` close ∥ `status` 写 §1「已收口」；两路共用同一 `reanchorOnClose`、零二写；次序 = 状态行写盘之后；一次收口一份 `[ledger reanchor]` 清单 |
| 2 | :688–689 五件之 3 执行人 ∥ 授权面 | 写 = close 径内一次动作；授权 = close 仅 depth-0 | 写 = **收口两路**各一次动作（调点 `:486` ∥ `:520`，定义 `:531`，零复制）；两路均仅 depth-0 ⇒ 不新增授权面 |
| 3 | :692–694 五件之 5 次序 | 重锚 = close 的全部拒因通过…；close 被拒 ⇒ 台账零写 | 重锚 = **收口那一笔**的全部拒因通过、状态行落盘之后；两路同序位（`:486`/`:478` ∥ `:520`/`:515`）；判据单点 `closingValue:471`；收口那一笔被任一拒因拒 ⇒ 台账零写 |
| 4 | :696–697 落点与选行单源 | 重锚落点 = close 径；close 径不另调选行 | 落点 = **收口两路共调的单源 `reanchorOnClose`**；写入 = 核内 `ledgerReanchorBatch`；两路均不另调 `ledgerBatchRows`、不二造回执 |
| 5 | :845 AC-M2-30 | 批档收口（`batch` close）⇒ …；close 全部拒因；close 被拒；close 回执 | 收口**两路**同调单源、零二写 ⇒ …；次序 = 收口那一笔的全部拒因通过、状态行落盘之后；一次收口一份清单（两路不同拍）；失败经 `failed` + 收口回执点名 |
| 6 | :976 §9 收口重锚不做 | 重锚只随批档收口触发 | 重锚只随批档**收口**触发——收口两路 = `close` ∥ `status` 写 §1「已收口」，同一单源、零二写、次序 = 状态行写盘之后 |
| 7 | `BATCH-RECORD.md` §4.13 :285–286 | close 全部拒因通过、状态行落盘之后调 `ledgerReanchorBatch`；close 被拒 ⇒ 台账零写 | 收口**两路**同调单源、零二写；两路的全部拒因通过、状态行落盘之后调；被拒 ⇒ 台账零写；一次收口一份清单（一次调用只分派一个 action） |

**同源随改（同一缺陷类，逐处列出）**

- `LEDGER.md` :687 失败语义「close 径把它并入同一回执」→「收口回执把它并入同一回执」；:694 `cwd` 基准「close 手上只有档路径」→「收口两路手上都只有档路径」；:695 无根支「close 回执点名」→「收口回执点名」。
- `LEDGER.md` :733 `ledgerBatchRows` 行「close 径不调」→「收口两路均不调」；:734 `ledgerReanchorBatch` 行「消费面 = `batch` close 径」→「消费面 = 收口两路」；:807 不变量 ②「close 径一次动作」→「收口两路各一次动作——同一单源」。
- `LEDGER.md` §3.6：:363 对齐实现坐标（close 径）→ 收口两路共调单源；:364「放开面 = 收径一处」→「收口两路共一处写单源」；:365「本批放开收径一处」→「放开收口写面」；:374 受影响面「close 径重锚」→「收口两路重锚」。
- `LEDGER.md` :977 §9 收口动作不二造「close 径只跑重锚 + 出口清单」→「收口两路都跑重锚（同一单源）；出口清单只挂 `close` 径」。
- `BATCH-RECORD.md` :634 §8 边界 12「收径（close 收口重锚）例外」→「收径（收口重锚——`close` ∥ `status` 两路，同一单源）例外」。
- `BATCH-RECORD.md` :615 D-BR29「close 收口重锚…复启句落 `evidence`」→「收口重锚…复启句落 `resume_when`（现值非空 ⇒ 追加 `evidence`）」——后半段 = 与 §6.2 / BR-56 对齐的终态收正（非本轮新增语义，如实披露）。
- `BATCH-RECORD.md` :185 BR-56 触发形「`close({path})` 且…」→「收口两路（`close({path})` ∥ `status` 写 §1「已收口」）且…」。
- `BATCH-RECORD.md` :374 §4.17 实现行「506 行——`close` 径重锚」→「现行 = `design/LEDGER.md` §3.5——收口两路共用单源 `reanchorOnClose`」（行数单源回指 §3.5，不设第二住处）。

**`batch-lifecycle.mjs` 555 行顾问项登记（§3.5）**：表行 → 现行 **555**（实施后终读）· 剩余 ≈+15（出口清单未落半幅）· 终值 **≈570**；贴线判重算（555 + 15 ⇒ ≈570，超 500 顾问线 55 行）；新增「**顾问项（在册）**」行——**拆分计划 = 无（未到 650）**：判据 = 拆分触发只为「该档过 650 行」（判据单源 = `docs/core/design/BATCH-RECORD.md` §4.18 贴线判），555 < 650 ⇒ 不拆、不预留拆分设计；过 650 时按 §4.18 体例拆。§3.6 贴线判随改（≈570，顾问项登记回指 §3.5）。

**残留「只 close」命中与逐条判定（两档 grep：`close 径` ∥ `close 收口` ∥ `仅 close` ∥ `只在 .{0,6}close` ∥ `close 回执` ∥ `` `batch` close ``）**

| 命中 | 判定 |
|---|---|
| `LEDGER.md:351` ∥ `:661` ∥ `:817`（在册状态 / 实读证据载「`batch-lifecycle.mjs` close 径无重锚」） | **过期状态句，非「只 close」句式**——属 §5 报告项「设计档在册状态仍写未落地」那一独立项；本批已落、该句已失效 ⇒ 需另起一轮做在册状态收口（本轮未改，上抛） |
| `LEDGER.md:396` ∥ `:816`（轮界出口清单半幅未落） | 准确：出口清单确只挂 `close` 径（AC-M2-35 剩余半幅）。保留 |
| `LEDGER.md:452` ∥ `:467`（出口清单触点先例 = close 径回执） | 准确：清单只挂 `close` 径。保留 |
| `LEDGER.md:698`（「同一次 `batch` close 上的共存口径」）∥ `:700`（「close 径内重锚与出口清单无次序依赖」） | 描述 close 侧共存面，未称「重锚只 close」；正文已含两路重锚。保留 |
| `LEDGER.md:916` T99 ∥ `:946` T108（用例经 close 径注入） | 用例锚在 close 径；status 径另有 T125 / T126 覆盖。保留 |
| `BATCH-RECORD.md:288`（收口时点其它动作） | 准确：出口清单挂 close、批量结算显式调用。保留 |
| `BATCH-RECORD.md:487`（生命周期表 L4「close 收口」） | 阶段名，非重锚触发句。保留 |

**结论**：设计两档内**已无「重锚只在 close 触发」句式**；余项均为 close 侧动作 / 阶段 / 状态句，逐条判定在册。

**自检三机检**：① 引用集 ↔ 标题集 = 本轮所引 §3.5 / §3.6 / §6.2 / §7.1 / §8 / §9 / §4.13 / §4.17 / §4.18 / §8 边界 12 逐号在盘；② 表行 ↔ 汇总 = §3.5 受影面表实读 9 行、贴线判 555 + 15 ⇒ 570 逐项相符；③ 断言 ↔ 实测 = 行数（`LEDGER.md` 988 内容行 ∥ `BATCH-RECORD.md` 638 ∥ `batch-lifecycle.mjs` 555）皆 node 实读。

**doc-check 读数**：`doc_check(mode:"gate", docs=[两档])` = **`DOC-CHECK GATE: ERROR（引擎已更新：（`tool-docs/doc_check.md` mtime 2026-10-19T00:44:14.502Z > 进程启动 2026-10-19T00:22:28.499Z）——需重启会话后复跑`**——未获 PASS，本席不自行豁免。report 态复测（同陈旧引擎）= 锚 0 · 行宽 1（`BATCH-RECORD.md:403` 425 字符 = 既有英文拒串行、引擎豁免形），本轮自落超宽行当场拆尽后非表格 >300 = **0**（`LEDGER.md` 0 ∥ `BATCH-RECORD.md` 0，引擎豁免行除外）。

**上抛**

- **[上抛·待裁]** 三处「在册状态 / 实读证据」仍写「未落地在册、close 径无重锚」（`LEDGER.md:351` ∥ `:661` ∥ `:817`）——与已落代码矛盾，且与 §6.2 新写「收口两路」句式互斥；归并口径 = 「整段在册状态收口（A ∥ B ∥ C 三件改已落 + 实装坐标）」，属 §5 报告项 ③，请父侧定轮次。
- **[上抛·知会]** 需求面（`docs/core/requirements/**`）重锚口径如需随改，笔归主 agent（本轮零触）。

**本轮不做**：产品码（`thincoder-core/**` 零触）· 需求档 · 在册状态整段收口（上抛）· 其它批次 / 其它文档。

## §3 设计评审（评审子代理）

### 轮次 1（评审子代理）

### 评审范围与限制
- 目标 = 台账指针判据重锚（A/B/C 三件）：`design/LEDGER.md` §6.1 ∥ §6.2 ∥ §7.1 ∥ §8 AC ∥ §9 ∥ §3.6 ∥ `design/BATCH-RECORD.md` §4.13 ∥ §4.17 ∥ §7 ∥ §8 边界 12 ∥ `requirements/ENGINEERING-MODE-V2-SPEC-LEDGER.md` AC-M2-10 ∥ AC-M2-29 ∥ AC-M2-30 ∥ AC-M2-33。
- 限制：无文档地图、无项目标准档声明 ⇒「文档归属」判据降级（按 Project Guide 与同档体例判）；未核盘上行数（源档不在评审射程）。

| # | Category | Severity | Issue | Suggestion |
|---|----------|----------|-------|------------|
| 1 | Requirements | 🔴 | 新写空值 `task_book` 的判据三处互斥：`LEDGER.md:360` 口径 3「`§2` / 空串 / 全空白（缺文件部分）⇒ **臂② 拒**（不可解析——fail-closed）」∥ `LEDGER.md:349`「本笔新写空值（`null` / 空串 / 全空白）⇒ **不算「指名」**（臂② 不触）」∥ `LEDGER.md:202`「`task_book` 空串 / 全空白由 §6.1 写门承接（…；其余状态 = 未指名，放行）」；需求侧 `SPEC-LEDGER.md:70` 又要求「**本笔新写** `task_book` 或**本笔新写** `trigger = 归批` ⇒ 绑定值非空 ∧ 可解析 ∧ **在盘**」。待讨论/待设计 行本笔新写 `task_book: ""`（不在臂① 射程）⇒ 三种读法给出「拒 / 放行」相反结果；AC-M2-10（`LEDGER.md:517`）与 T105/T106 均未覆盖该形。 | 定一条口径（如「显式空值 ≡ 未指名 ⇒ 臂② 不触，仅臂① 射程内拒」，或反向），删去 口径 3 中与所选口径相斥的半句，并在 AC-M2-10 行 + 用例 T105/T106 补该形（待讨论行本笔新写空值 ⇒ 期望 <拒 ∥ 放行>）。 |
| 2 | Requirements | 🟡 | `resume_when` 列的在册状态两处相反：`LEDGER.md:393` 记「`resume_when` 列**未落地在册**（`thincoder-core/ledger-db.mjs` DDL 无该列 —— 实读）」，但同档 `LEDGER.md:99` 按 13 数据列（含 `resume_when`）迁入、`LEDGER.md:274` 记「`DATA_COLUMNS` 13 列」；同批两条 AC 亦互斥——AC-M2-32（`LEDGER.md:533`）以「导出面入 `DATA_COLUMNS`（12 ⇒ 13）」为待落设计，AC-M2-33（`LEDGER.md:534`）以「13 列零变」为既成事实；需求档 `SPEC-LEDGER.md:75` 则写「（**12 数据列逐字 + id 重发** · 事务内读回核验）」。复启句落点（`evidence` vs `resume_when`）正取决于此。 | 核定该列真实在册状态并在同批内收敛：未落地 ⇒ 把 13 列 / `DATA_COLUMNS` / AC-M2-33 的「13 列零变」改回现行值并给该列落地批一个登记指针；已落地 ⇒ 删去 `LEDGER.md:393` 的「未落地在册」并同步需求档 12 ⇒ 13。 |
| 3 | Requirements | 🟡 | 需求档 ② 功能点（`SPEC-LEDGER.md:9` 起十条）无本轮机制的对应条目——`归批` 指针门 / 收口自动重锚 / `taskBookOnDisk` 读数只出现在 ④ 验收（`SPEC-LEDGER.md:71`–`73`），② 侧无 `trigger=归批` 咬合与收口重锚的位置。AC 有而功能点无 ⇒ 需求侧「现状是什么」面缺项。 | 在 ② 补对应功能点，或登记「需求侧以 AC 承载、② 不另立条目」的口径。 |
| 4 | Requirements | 🟡 | 需求档 AC 的通过面枚举含「重指照过」——`SPEC-LEDGER.md:70`「旧指针所在批档已清 ⇒ 改 `status` / `evidence` / 重指**照过**」、`SPEC-LEDGER.md:71`「批档被清后改 `status` / `evidence` / 重指 ⇒ **照过（零拒）**」；按字面可读成「重指一律不拒」，与设计臂②（`LEDGER.md:345`）判「本笔**新写** `task_book` … 非空 ∧ 文件部分可解析 ∧ 解析出的档**在盘**」冲突（重指到不在盘档应拒）。 | 两处 AC 行把「照过」限定为「旧指针所指档已清不阻该笔写入」，并点名「重指到不在盘档 ⇒ 仍按臂② 拒」。 |
| 5 | Requirements | 🟡 | 需求档 AC-M2-33（`SPEC-LEDGER.md:73`）含「迁移 dry-run 的同名旗为**读数**、不拦任何写入」半幅；设计 AC-M2-33（`LEDGER.md:534`）只落 `query` 读数半幅（该行无 migrate / dry-run 字样）——该半幅无对应设计 AC，本轮用例面（`LEDGER.md:303` T102–T108）亦不含它。 | 在设计 AC-M2-33 行补迁移旗半幅（或另立一行指向 §2.2 / §6.1 口径 5），并指明由既有 T32 承载该半幅验证。 |
| 6 | Clarity | 🟡 | `writeGateFlag` 的变更性质不可判：`LEDGER.md:301` 记「`writeGateFlag` 转读数语义：旗面文案 + 头注随改）⇒ 预计 ±5」，而 `LEDGER.md:80`（§2.2）与 `LEDGER.md:364`（§6.1 口径 5）已把同一机制写成「**读数非门**：该行后续更新零阻」∥「旗为**读数**…**不拦任何写入**…**既有拒绝面零改**」——±5 的改写量只承载文案 / 注释，读者无法判断该旗行为是否由「门」变「读数」，且符号名仍称 gate。 | 明确行为是否变更（措辞收正 ⇒ 改写「措辞收正、行为零改」并给对应实现点；行为变更 ⇒ 补实现点与用例），并给与「读数非门」一致的符号名或登记旧名沿用。 |
| 7 | Clarity | 🟡 | 收口重锚取行口径把「已落待结账」并进「未落行」：取行 = `status ∉ {已核销, 已废弃}`（`LEDGER.md:389` ∥ `BATCH-RECORD.md:260`）⇒ `待核销` 行在收口时被自动改 `trigger=条件` 并追加 `LEDGER.md:393` 的「**复启句（句形模板 · 单源）**：`原批 <批名> 已收口，须另起批次接手`」——对已落（只待结账）的行该句失实，与设计自陈「只陈述已发生的盘面事实、不含政策判断」（`LEDGER.md:391`）相斥；且「台账核销」与 `batch` close 的先后未在设计中约定。T99（`LEDGER.md:610`）未区分 `待核销` 行。 | 收窄取行口径（排除 `待核销`，或按状态分句）∥ 明确核销先于 close 的次序假设；把所取状态集写入 §6.2 与 AC-M2-30 取行句，并给 T99 补 `待核销` 行一拍。 |
| 8 | Clarity / Affected-file annotations | 🟡 | 本批用例档未指名、未给规模、并声明用毕即删：`LEDGER.md:303`「本批件（单元测试档 = 实施轮新建，靶向单跑；用例 T102–T108）——用毕即删（零留档）」，`LEDGER.md:614` 用占位「单元测试档 = 实施轮新建，靶向单跑 `node --test test/<本批件>`」；对照同档先例 `LEDGER.md:277` 给出档名与规模（「档 `thincoder-core/test/ledger-batch-ops.test.mjs`（**新建** ~150–200 行——T92–T101）」）。受影响面表无法对该档作行数 / 增量标注，「零留档」亦使 T102–T108 的验收不可复跑。 | 给出档名与预计行数（同 §3.5 体例）并明确留档 / 删除口径（确为一次性夹具 ⇒ 写明删除后由哪份用例承载该验收回归）。 |
| 9 | Affected-file annotations / Document face | 🟡 | 本批文档面在两张受影响面表里互不认账：`LEDGER.md:305` 把「`docs/core/design/BATCH-RECORD.md`（517 行）· 需求档（笔归主 agent）」列进**零改面**，而本批实际改了 BATCH-RECORD §4.13 ∥ §4.17 ∥ §7（D-BR29，`BATCH-RECORD.md:502`）∥ §8 边界 12（`BATCH-RECORD.md:518`）与需求档 AC 行；`LEDGER.md:304` 的文档面清单（「本档 §2 ∥ §2.2 ∥ §3.2 ∥ §5 ∥ §6.1 ∥ §6.2 ∥ §7.1 ∥ §8 ∥ §9 ∥ 本节」）无 BATCH-RECORD.md；`BATCH-RECORD.md:346` 的文档面清单含 §4.13 但漏 §7 / §8。 | 把本轮改动过的档面写进对应「文档 / 描述面」清单（LEDGER §3.6 补 BATCH-RECORD.md 各节 + 需求档 AC 行；BATCH-RECORD §4.17 补 §7 / §8），并从「零改面」移出。 |
| 10 | Clarity / Annotations | 🔵 | 同一目标的规模数字自相矛盾：`LEDGER.md:300` 记 `batch-lifecycle.mjs`（**376 行**…）「⇒ 预计 +~25 ⇒ ~401」，同节贴线判 `LEDGER.md:307` 却写「有增量四档增量后最高 ≈396 行（`batch-lifecycle.mjs`）」；另 `ledger-tools.mjs` 的「现行」行数两处不同——`LEDGER.md:206`「已落 · 187 行」∥ `LEDGER.md:272` / `LEDGER.md:305` 记 260 行。两者均不改贴线结论（皆 <500），但标注不可信。 | 以落笔当刻实读为准统一同档行数（401 ∥ 396；187 ∥ 260 取一），受影响面表内保持同值。 |
| 11 | Closest-precedent | 🔵 | §3.6 先例行给出设计档节号与符号名，但无实现坐标（file:line）与先例批次号（目标项 9 三轴只剩一轴）；同时 `LEDGER.md:291` 宣告「**无先例宣告**：**无**（本批三项均有本仓在册同形先例，见上）」，而 C 的写回形（工具径自动写台账行）在本仓无同形先例、只在 `LEDGER.md:290` 以「**偏离** = **只读零写** → **收径自动写行**（放开面 = 收径一处）」登记。 | 先例行补实现坐标与先例批次号，或明记「本仓无该轴在册先例」；把 C 的首次性写进「无先例宣告」行（现「均有同形先例」与 C 的首次写回不一致）。 |
| 12 | Document ownership / Doc-state | 🔵 | `LEDGER.md:502` 不变量 ② 仍写「台账档只读（唯一写面 = 主 agent 写命令）」，本轮新增经 `batch` close 径触发的台账写（`BATCH-RECORD.md:518`「**收径（close 收口重锚）例外 = 允许写台账行**」）后该行未随动。 | 在不变量 ② 补写面口径（主 agent 面 · 含 close 径经 `ledgerReanchorBatch` 的代理写），与 BATCH-RECORD §8 边界 12 对齐。 |
| 13 | Acceptance criteria | 🔵 | T108（`LEDGER.md:622`）要求「注入台账写失败 ⇒ 整集 `ROLLBACK`（零行改）+ 回执点名未重锚集」，未给注入点 / 夹具口径（同档 T27 有「第二连接持写锁」既有手法）。 | 在 T108 指明失败注入手法（沿用既有手法或新增缝单源），或记「注入点 = 实施轮定」。 |

**计数**：🔴 1 · 🟡 8 · 🔵 4（合计 13）。

**评审范围外登记（不判级）**：`LEDGER.md:526` AC-M2-19 内嵌未决 TODO「号码待定——T56 已占；下次触碰该面时补」——不属本轮目标面，只登记。

VERDICT: changes-required

### 轮次 2（评审子代理）

### #1550 归批指针门收正（A 案 ∥ C 案 ∥ 收口三动作边界）· 设计评审

审阅对象 = `docs/core/design/LEDGER.md` ∥ `docs/core/design/BATCH-RECORD.md`（全文实读）。A/B/C 三件机制本体（两臂门 / `taskBookOnDisk` 读数 / 收口自动重锚）逐条比对无机制级互斥；先例行、无先例宣告、勘察证据行齐备；AC-M2-29/30/33 与 T102–T108 覆盖正/边/错三面。以下为登记项。

| # | Category | Severity | Issue | Suggestion |
|---|----------|----------|-------|------------|
| 1 | Requirements coverage（可追溯） | 🟡 | 同一增量（`归批` 指针门）的「落地批」两处不一致：`LEDGER.md:290` 与 `:295`（P2 指针面）记 #1530，而 `LEDGER.md:320` ∥ `:584` ∥ `:624` 记 #1550；`LEDGER.md:874` 的 #1530 用例块内又列 T99（收口重锚，`:883`）——同一行为在 #1530 与 #1550 各有一套（各自「一次性 · 零留档」）承载用例 | 二选一收口：①「归批门 = #1530 落、#1550 只收正形态」（则 §6.2 在册状态的「落地批」改双批并注「形态以本节为准」）∥ ②「整枚归 #1550」（则 §3.5 在册状态与 T99 落点改指 #1550）。同一判据不留在两个批次的验收面上 |
| 2 | Clarity（可实施性） | 🟡 | 重锚在 close 径内的**位置与失败回执落点**未钉：`LEDGER.md:648` 只定「台账写失败 ⇒ ROLLBACK、冻结照常」，未定 close 自身拒因（链完整性门 ∥ 文档机检门，`BATCH-RECORD.md:282`）拒跑时重锚是否已执行——若先跑重锚再撞门，账内会留下「原批已收口」的**假事实句**；另 `LEDGER.md:693` 的返回形 `{ batch, reanchored, alreadyAnchored }` 无失败字段，而 `:648` 要求「失败经回执照报」 | 在 §6.2 四件后补一条次序判据：重锚 = close 全部拒因通过、状态行改写落盘**之后**的一次动作；close 被拒 ⇒ 台账零写。并指明失败上报的承载面（close 径 catch 后并入同一回执，或 `ledgerReanchorBatch` 返回形补 `failed` 项） |
| 3 | Clarity / Feasibility | 🟡 | close 径调 `ledgerBatchRows({ cwd, batch })` ∥ `ledgerReanchorBatch({ cwd, batch })`（`LEDGER.md:653`）时 **`cwd` 从何而来未定**：close 手上只有批档 `path`；会话锚为工作区 ∥ 容器时，`§2.1`/`§3.8` 的收敛序按名序取根，可能落到**另一项目**的库 ⇒ 选行零命中 ⇒ 重锚静默不生效（唯一的机器写消失且无报错） | 钉死基准：`cwd` = 批档所属项目根（`owningProject(<batchDoc>)` ∥ `resolveLedgerRoot(dirname(batchDoc))?.root`），并在 §6.2 落点句写明；配套一条「批档在项目 A、会话锚为工作区 ⇒ 重锚落 A 的库」的用例 |
| 4 | Methodology（判据单源可回指） | 🟡 | 拆分触发引用的单源悬空：`LEDGER.md:316` 与 `:351` 记「拆分触发 = 该档过 650 行（判据单源 = `BATCH-RECORD.md` §4.13 贴线判行）」，但 `BATCH-RECORD.md` §4.13（`:279`–`:289`）**无贴线判行**；650 触发实际在 §4.18（`:450`），§4.17（`:377`）只记「零拆分义务」 | 改指 `BATCH-RECORD.md` §4.18 贴线判行（或把 650 触发上移为 §4.13 一行），三处引用同一坐标 |
| 5 | Document ownership | 🟡 | 取行判据被逐字复述两份：`BATCH-RECORD.md:285` 与 `LEDGER.md:639` 同文写「`task_book` 指本档 ∧ `status ∈ {待讨论, 待设计, 在途}` + `认账不排期` 零触 + 回执点名」——虽两处均声明「判据 = `LEDGER.md` §6.2」，日后改取行集仍是同改两处 | §4.13 收为「close ⇒ 调 `ledgerReanchorBatch`（判据 ∥ 取行全集 = `LEDGER.md` §6.2）+ 本档特有面（回执合并、冻结照常）」；取行谓词只留 §6.2 一份 |
| 6 | Clarity（同机制两处描述） | 🟡 | `LEDGER.md:630` 臂① 写「`status ∈ {在途, 待核销}` 半幅同判（**既有语义**，判面收窄至本笔）」——「既有语义」在 `:584` 的旧形里含「可解析 ∧ 在盘」，与 `:593` 臂①「**不判在盘**」相抵；单独读 §6.2 者会把 A 案要消掉的死锁判回门里。（不判 🔴 的理由：`:322` 已声明判据锚点单源 = §6.1，且 `:628` 形态句写明「本笔写入面判」） | 删掉「既有语义」四字，改为「`status ∈ {在途, 待核销}` 半幅 = `§6.1` 臂① 同一判据（不在本节重述）」 |
| 7 | Affected-file size annotations | 🔵 | 行数注记陈旧且跨档滞后：`LEDGER.md:349` 零改面记 `ledger-db.mjs` 175 行 ∥ `ledger-tools.mjs` 260 行，而同档 `:307`/`:308` 与 `:497`/`:499` 实读为 253 ∥ 275（#1588 已落）；`BATCH-RECORD.md:373`/`:377` 记 `batch-lifecycle.mjs` 376 行（增量后 ≈401），而 `LEDGER.md:343` 实读 506、`BATCH-RECORD.md:442` 记 376 → 505 | 统一取当前实读（253 / 275 / 506）；`BATCH-RECORD.md` §4.17 贴线判随 505 重算。**档位判定不受影响**（#1550 增量后最高 ≈531，未过 650 触发）。注：源档不在本轮评审范围，178/506/301/156 未逐档实读复核（deltas 记 `unverified`）；300+ 行单函数面（function tier）同因不在范围而未查 |
| 8 | Doc state | 🔵 | 同一事实两处坐标：`PROJECT-MANIFEST.json` 的 `index.publicRepos = []` 在 `LEDGER.md:301`/`:337` 记「实读 `:54`」，在 `BATCH-RECORD.md:369`/`:437` 记「实读 `:56`」——一为陈旧 | 取一处实读坐标，两档同值 |
| 9 | Acceptance criteria | 🔵 | 一条行可同时属臂① 两半幅（`status=在途` **且** `trigger=归批`）而 `task_book` 空 ⇒ 两句逐字文案同时适用（`LEDGER.md:617` 在途/待核销 形 ∥ `:635` 归批 形），优先级未定，而 T106（`:895`）断言「逐字」 | 补一句优先级（如「归批 句先于 status 句」并说明理由），使逐字断言唯一 |

**计数**：🔴 0 · 🟡 7 · 🔵 3。

**评审限制（如实）**：本轮评审范围 = 上述两档；项目标准档未声明、Document Map 未随上下文提供（ownership 判据按 `AGENTS.md` 指向的 `thincoder/docs/README.md` 地图精神判、未实读该档）；实现档行数与 `writeGateFlag`「行为零改」等码面断言按 `unverified` 记。

VERDICT: pass

[token stripped mechanically]

### 轮次 3（评审子代理）

**复核范围与限制**：对象 = `thincoder/docs/batches/2026-10-16-ledger-pointer-gate-reanchor.md` ∥ `thincoder/docs/core/design/LEDGER.md` ∥ `thincoder/docs/core/design/BATCH-RECORD.md`（全文实读）+ 按 §1 声明 ③ 核对已落形态。限制 = 无 Document Map、无项目标准档声明 ⇒「文档归属」判据按 `AGENTS.md` 指向判；需求档不在射程 ⇒ 需求面对齐未核（`unverified`）；除 `ledger-cmd.mjs` 外各档总行数未取 EOF（仅给下界）。

**本轮三问核实（结论先摆）**：① §4 批准面已按 §1 逐字回填（`2026-10-16-ledger-pointer-gate-reanchor.md:210`–`:216`，10:25 / 10:27 / 10:41 三句逐字在册）；② 轮次 2 十条的处置表在册且落点可逐号对上（同档 `:131`–`:142`；抽查 = `LEDGER.md:304`–`:307` 四件全 → #1550、`:654` 形态句、`:338`/`:374`/`:463` 已改指 §4.18 且 `:450` 直行号残余 0、`BATCH-RECORD.md:285`–`:286` 收为「调单源 + 本档特有面」）；③ 取行口径**真已就位**（`ledger-cmd.mjs:288` `resolveBatchRows(db, base, abs)` 与 §3.3 判据同址），重锚插入点**与批 E 收径不冲突**（批 E 的 `ledgerCloseBatch` 是台账写命令 `ledger(close)+batch`，不在 `closeBatchRecord`（`batch-lifecycle.mjs:486`–`:505`）径上；插点 = `:503` 写盘之后、`:504` 回执之前，与 §6.2 五件之 5 一致）。

| # | Category | Severity | Issue | Suggestion |
|---|----------|----------|-------|------------|
| 1 | Requirements / 状态滞后 | 🟡 | 盘面已落地，#1530 面的「在册状态」整体仍写未落：`LEDGER.md:245` 记「无批量选行 / 无 `ledgerUpdateBatch` / `ledgerCloseBatch`」，实读 `ledger-cmd.mjs:300` / `:325` 两函数在册、`ledger-tools.mjs:275` 已按 `batch` 分派；`LEDGER.md:385` 记「无 `overdueOf` ∥ `ledgerCount` 裸数回报 ∥ `formatDetailLine` 仅（老化 <aged>）」，实读 `ledger-cmd.mjs:70` `overdueOf`、`:123` count 三键形、`ledger.mjs:140` 已含「待处置」位；`LEDGER.md:798` 仍把 AC-M2-26/27/28/31/34/35 列未落地（落地批 #1530） | 实施轮落笔前逐档重读盘面，收正各「在册状态（单源）」块与 §8 清单（#1530 面改「已落地在册 + 实装坐标」），并随改 `LEDGER.md:309`「本批 #1530 的实施面 = P1 ∥ P4 ∥ P5 ∥ P6」；读数取本轮实读、不沿用旧行数 |
| 2 | Requirements / 决策前提 | 🟡 | 复启句落点建立在已失效的事实上：`LEDGER.md:666` 写「`resume_when` 列未落地在册（`thincoder-core/ledger-db.mjs` DDL 无该列 —— 实读）⇒ 该列落地后迁至该列」，而 DDL 已有该列（`ledger-db.mjs:178`）、`ensureColumn(db, "resume_when")` 在册（`:254`）、`ledger-migrate.mjs:22` `DATA_COLUMNS` 13 列；同前提另载 `LEDGER.md:828`（AC-M2-30）、`:960`、`BATCH-RECORD.md:185`（BR-56）。迁移条件已成立而未二择一 ⇒ 实施轮自行裁决 | 在 §6.2 与 AC-M2-30 定一处：本批即落 `resume_when`（删迁移注）或明写「本批仍落 `evidence`，迁移归另批 + 批次指针」；`LEDGER.md:960`、`BATCH-RECORD.md:185` 随改一致 |
| 3 | Affected-file annotations | 🟡 | 现行行数注记滞后：`LEDGER.md:326` 记 `ledger-cmd.mjs` 178，本席读至 EOF = 349（末行 348 / 末尾 349），终值上界「≈318」随错（349 + ~40 ⇒ ≈389）；`ledger-db.mjs` / `ledger-tools.mjs` / `ledger.mjs` 注记亦各差数行（末行 ≥258 / ≥281 / ≥159——未取总行数，`unverified`） | 落笔当刻重读并回填 §3.5 表（单源），§3.6 / §3.7 的「现行 = §3.5」回指随之生效；档位结论不受影响（增量后最高 `batch-lifecycle.mjs` 506+40 ⇒ ≈546 < 650 触发；`ledger-cmd.mjs` ≈389 < 500） |
| 4 | Clarity | 🔵 | 取行与写入两调冗余且 `ledgerBatchRows` 失败语义空白：`LEDGER.md:677` 让 close 径既调 `ledgerBatchRows`（取集）又调 `ledgerReanchorBatch`（若取同集 + 写），而后者返回形已含 `reanchored` / `alreadyAnchored` / `failed`；`LEDGER.md:717` 未定 `batch` 不可解析 / 批档不在盘时该导出的行为，同族落地件 `assertBatchArg`（`ledger-cmd.mjs:281`）是抛 | 回执单源于 `ledgerReanchorBatch` 返回形（不另调选行）；在 §7.1 给 `ledgerBatchRows` 补一句「不可解析 ⇒ <抛 ∥ 空集>」的失败语义 |
| 5 | Methodology（机检门） | 🟡 | 记录内最新 doc-check 读数 = ERROR 且未复跑：`2026-10-16-ledger-pointer-gate-reanchor.md:144` 记「doc-check gate = ERROR … 未获 PASS，需重启会话复跑」，而 `:117` 的 PASS 早于修正轮 3 的两档改动 ⇒ 现档状态无 PASS 读数 | 实施轮开工前对两档复跑 `doc_check(mode:"gate")` 到 `DOC-CHECK GATE: PASS`，读数落 §5/§6 |
| 6 | Clarity / Feasibility | 🔵 | `cwd` 基准句的回退支落在非项目目录：`LEDGER.md:678` 取 `resolveLedgerRoot(dirname(<batchDoc>))?.root ?? resolve(dirname(<batchDoc>))`——祖先链无「已注册」者时基准 = `<项目>/docs/batches`，行 `task_book` 的相对形在该基准下解析零命中 ⇒ 选行空集、唯一的机器写静默不生效（正是该句要防的失败态） | 回退支改取所属项目根（`owningProject(dirname(<batchDoc>))`），或明写「无根 ⇒ 空集 + 回执明示未重锚」；并给 T124 补该态一拍 |
| 7 | Doc state（行号漂移） | 🔵 | 三处直行号已漂：`LEDGER.md:609` 引 `thincoder-core/ledger-cmd.mjs:68`（`assertTaskBookGate` 实读在 `:144`，拒因行 `:70` ⇒ 现 `:146`）；`2026-10-16-ledger-pointer-gate-reanchor.md:115` 引 `:68-76`；同档 `:220` 引「§3 `:180`」而轮次 2 的 VERDICT 在 `:202`。判据本体（旧形、无 `trigger=归批` 臂、无「本笔写入面」入参）实读属实 | 引号段一律回指「§6.1 失败文案 / 该档 §3 轮次 2」等节级坐标，或落笔当刻重取行号 |
| 8 | Document ownership | 🔵 | 取行谓词仍有第二份：`BATCH-RECORD.md:185`（BR-56）逐字复述「`task_book` 指本档 ∧ `status ∈ {待讨论, 待设计, 在途}`」与复启句落点，而 §4.13 已收为「判据 ∥ 取行全集 = `LEDGER.md` §6.2」（`:285`）；用例面复述可辩，但改取行集时仍是同改两处 | BR-56 改指 §6.2（或标「用例面复述、判据单源 = §6.2」，不复写状态集） |
| 9 | Requirements / 三方一致（协调项） | 🟡 | 需求面收正仍未落（父侧笔）：`LEDGER.md:376`–`:381` 只写「应对齐到 X」，`2026-10-16-ledger-pointer-gate-reanchor.md:142` 记 🟡10 上抛 ⇒ §2 条目 = 设计 §8 = 需求档的三方一致在需求档落笔前不成立；需求档不在本轮射程，本席未核（`unverified`） | 实施轮开工前落需求面 AC-M2-10 / AC-M2-29 收正；落完在 §3.6 对齐注上回填坐标 |

**计数**：🔴 0 · 🟡 5 · 🔵 4（合计 9）。

VERDICT: pass

## §4 用户批准（主 agent）

**批准（回填 · 依据 = §1 已录的用户逐字，2026-10-16）**

- **10:25**「但是盘上的批次档不是稳定存在啊！不能把这作为判据啊！」
- **10:27**「可以，先这么做试试，ABC都要」——**A ∥ B ∥ C 三件一并授权**
- **10:41**「同意你的判断。」——采纳父侧**方案 ②**（收口自动重锚：改 `trigger=条件` + 机械可造的事实句落 `evidence`）

**批准范围**：§2 设计的三件（A 判本笔改动字段 ∥ B「在盘」降为读数 ∥ C 收口自动重锚）+ 范围随含的 `BATCH-RECORD.md` §8 边界 12 一处修正（同机制链，不另立批）。

**用户已知情的两项代价**（当时一并说明）：① 须修 `BATCH-RECORD.md` §8 边界 12（放开收径一处写）；② `归批` 意图会被自动降级为 `条件`（回执照报）。

**回填说明**：本节此前为空 = **记录遗漏，不是未获批准**；现按 §1 逐字回填，不新增任何语义。批准时点 = 2026-10-16，回填时点 = 2026-10-19。

**实施前置（2026-10-19 状态）**：设计评审轮次 2 = pass（§3 `:180`）；取行口径的依赖（批 E 的 P1）已于 2026-10-19 落地 ⇒ 实施已无外阻塞；**唯一缺 = 一张有效 designToken（10-16 那张已过期）**，需重走一轮设计评审换发。

## §5 实施记录（eng-coder）

**状态行**：实施完成

**实施摘要（台账 #1550 · A ∥ B ∥ C 三件已落地 · 行数 = 落笔当刻 node 实读）**

| 件 | 落点（文件 + 符号） | 形态 |
|---|---|---|
| A 两臂写门 | `thincoder-core/ledger-cmd.mjs` `assertTaskBookGate`（`:149`；谓词 `namesPointer` `:137`；入参 = 本笔写入面） | 臂① 结果行 `status ∈ {在途, 待核销} ∨ trigger = 归批` ⇒ `task_book` 非空（**不判在盘**）；臂② 本笔新写指针（非空值）∨ 本笔新写 `trigger = 归批` ⇒ 文件部分可解析 ∧ 在盘；两臂之外零判；三句文案逐字 = 设计 §6.1（含「归批」进必填句）；`ledgerAdd` / `applyRowUpdate`（含批量形）同门 |
| B 读数 | `ledgerQuery` 逐行 `taskBookOnDisk`（`:104`；判据本体 `pointerOnDisk` `:67`，与出口态 `dangling` 共用）；新增 `ledgerBatchRows`（`:378`）；`thincoder-core/ledger.mjs:155` re-export | 不入库、不入 `DATA_COLUMNS`（13 列零变）；**无任何判据读它**（档已清照落 = T102/T103） |
| C 收口重锚 | `ledger-cmd.mjs` `ledgerReanchorBatch`（`:397`，单事务 `BEGIN IMMEDIATE` · 幂等 · 返回形含 `failed`）∥ `agent-tools/batch-lifecycle.mjs` `reanchorOnClose`（`:516`）· `reanchorReceiptLine`（`:527`）· close 径调点 `:506` | 取行 = `resolveBatchRows` 单源（零二写）；`status ∈ {待讨论, 待设计, 在途}` ∧ `trigger ≠ 认账不排期` ∧ 现值 ≠ `条件`；改 `trigger=条件` + 复启句落 `resume_when`（现值非空 ⇒ **不覆盖**、追加 `evidence`）；`cwd` = 批档所属项目根（无根 ⇒ `failed` 点名、**不落兜底**）；次序 = §1 状态行写盘之后、回执之前；失败不抛 |
| 旗面收正 | `ledger-migrate.mjs` `writeGateFlag` 头注（`:79`）+ dry-run 行（`:136`）+ 计划行头注（`:125`） | **行为零改**（实读原函数 = 返旗串 ∥ `null`，无写路径分支）；措辞 = 「读数非门，不拦任何写入」 |
| 模型可见文案 | `thincoder-core/tool-docs/ledger.md`（9 行，行数零增） | `query` 行加 `taskBookOnDisk` 读数句；`add` 行加两臂写门句（含「档在不在盘是读数，不是门」） |

**关键实现裁定（设计未载，如实披露）**

- **`updated_at` 零触**：重锚只写 `trigger` / `resume_when` / `evidence` 三列——机器重锚不是人工推进，行龄（`aged` / `unlabeled`）读数照旧。设计 §6.2 与 AC-M2-30 均未载此口径（报告项）。
- **返回形元素** = `{id, status, title}`（+ `sentenceTo: "resume_when"|"evidence"`），非裸 id：回执要逐行点名 `#<id> <status> <title>`，而铁律 3 禁回执层再选行 ⇒ 明细只能来自返回形。
- **复启句 `<批名>`** = 批档的项目根相对路径（`docs/batches/<name>.md`，正斜杠统一）——close 手上只有绝对路径；设计口径「`batch` 值的文件部分」按此传入即成立（§2 例子写裸文件名，属示例非规则）。
- **无根 ∥ 台账忙 ∥ 批档不可解析 ∥ 非预期异常**：一律返回 `failed` 串、不抛（close 不被台账否决）；非预期异常另加外层 try/catch 兜底（`batch-lifecycle.mjs:517`）。

**验收实测（逐条）**

- ① **在盘降读数**：`query` 逐行 `taskBookOnDisk`（T107：在盘 `true` / 删档 `false` / 缺指针 `false`）；「档不在盘 + 格式合法 ⇒ 照落」= T102/T103 实测（在途 → 待核销 → 已核销 三步全过，读数 `false`；只改 evidence ∥ 只改 trigger 同过）。
- ② **三件在册**：两臂门 + 归批门（`ledger-cmd.mjs:149`）∥ `ledgerBatchRows`（`:378`）∥ `ledgerReanchorBatch`（`:397`，经 `ledger.mjs:155` 再导出）。
- ③ **重锚落点实证**（T99，真入口 close 径）：行 `待设计 / 归批 / task_book=docs/batches/T99.md` ⇒ 收口后 `trigger=条件`、`resume_when=原批 docs/batches/T99.md 已收口，须另起批次接手`、`overdue=null`（无 `@` token ⇒ 文法判 `free`）；回执行 = `[ledger reanchor] 本批未落行 → 条件 1 行：#<id> 待设计 「…」→ 条件`。
- ④ **非空不覆盖**（T99 第二行）：`resume_when` 原值 `行主条件句 @2099-01-01` 零变，复启句进 `evidence`，回执点名该形（「resume_when 现值非空——原值保留，复启句追加 evidence」）。
- ⑤ **无根支**（T124 尾段）：批档在未注册目录 ⇒ 回执 `[ledger reanchor] 未重锚：批档所属项目根不可推导——台账零写；记录冻结照常完成`；直接调 `ledgerReanchorBatch({cwd:null})` ⇒ `{reanchored:[], alreadyAnchored:[], failed:"批档所属项目根不可推导"}`；不落兜底基准（同测试前段：会话锚为工作区、邻居库字节等值）。
- ⑥ **用例读数**：`node --test test/ledger-pointer-reanchor.test.mjs` ⇒ **10 passed / 0 failed**（T99 · T102–T108 · T123 · T124）；全包 `npm test`（`node test/run.mjs`）⇒ **29 passed / 0 failed**。行数实读：`ledger-cmd` 431 ∥ `batch-lifecycle` 541 ∥ `ledger.mjs` 159 ∥ `ledger-migrate` 307 ∥ `tool-docs/ledger.md` 9 ∥ 新用例档 328。
- ⑦ **改动面**：6 档（5 改 + 1 新建），全在设计 §3.6 受影响面表内；`docs/**` 零触 · `bench/**` / `prompts/**` / `config.mjs` / `cmd-config.mjs` / `OPS.md` / `PUBLICNET.md` 零触。
- ⑧ 本节 = §5（本段）。

**自检轮次与终态**

- **内部差异审计**（只读子代理，对照设计两档 + 批档逐条）：0 个 🔴；采纳 1 项实施修正——`ledgerBatchRows` 失败语义前置（`batch` 不可解析先于「库不在 ⇒ 空集」抛）。
- **内部代码评审**（advisor · code）：终审 `VERDICT: pass`；采纳 3 项小修——① `reanchorOnClose` 外层 try/catch（非预期异常不得否决收口）② 写门改用单源 `baseOf` ③ `ledger-migrate.mjs` 残留「写门风险旗」头注改「指针读数旗（非门）」。
- **终态 = clean**（无未决实现缺陷；下述报告项均属设计面 / 文档面 / 体量读数，不属实施缺陷）。

**报告项（设计面 ∥ 文档面——笔不归本席，交父侧路由）**

- **[待裁] 收口两条通路只一条重锚**：`batch close`（已重锚）∥ `status` §1 → 已收口（同过链门 `batch-lifecycle.mjs:463` + 机检门 `:469` 并冻结档，**未重锚**）。设计 §6.2 只写 `batch` close ⇒ 本席按设计落 close 径，未越界改 status 径；该路收口的批，其未落行仍留 `归批`（读数 `dangling` 可见）。二选一由父侧定：① status 收口也调同一单源 ② 设计档明写「只在 close action 触发」并让模型可见文案同句告明。
- `tool-docs/batch.md`（模型可见）未述 close 的台账写副作用与 `[ledger reanchor]` 回执段——设计 §3.6 文档面清单只列 `tool-docs/ledger.md`，故本席未改该档。
- 设计档在册状态仍写「未落地在册」五处（§3.6 / §6.1 / §6.2 / §7.1 / §8）——实现已落，须设计席/父侧收口时改「已落地 + 实装坐标」；`LEDGER.md:618` 引的 `ledger-cmd.mjs:144` 旧形行号与判据皆漂。
- 体量读数：`ledger-cmd.mjs` 431 行 > 设计表 ≈389 上界（仍 < 500 顾问线）；`batch-lifecycle.mjs` 541 ≤ 546（表内）；两档都不触发拆分（650，判据单源 = `BATCH-RECORD.md` §4.18）。
- 用例档 328 行 > 设计估计 ~180–240；零留档口径照设计（随本批收口删）——现留盘以便父侧复跑，删点归收口。
- 设计内部张力（本席按后者落）：§6.2 五件之 2 要求「回执点名**未重锚集** + 失败因」，而 §7.1 返回形只给 `failed` 串；按父侧 fix 轮 3 已定的「返回形加项」，失败回执只点名失败因；若要未重锚集，须先在返回形加一项。

**doc-check 读数**：`doc_check(mode:"gate")` = **ERROR（引擎已更新：`tool-docs/doc_check.md` mtime 2026-10-19T00:44:14Z > 本会话进程启动 2026-10-19T00:22:28Z）**——旧引擎读数不可作交付判据，需重启会话复跑。本席不自行豁免；本批零触 `docs/**`。

**读数更正（回读自检 · 落笔后复读）**：上段两处行号为修正前读数——`reanchorReceiptLine` 实读 **`:530`**（原写 `:527`；try/catch 三行后移）· `reanchorOnClose` 的 `try {` 实读 **`:518`**（原写 `:517` = 函数签名行）。其余坐标（`closeBatchRecord:486` · 调点 `:506` · `reanchorOnClose:516` · `assertTaskBookGate:149` · `ledgerBatchRows:378` · `ledgerReanchorBatch:397` · `ledger.mjs:155`）复读一致。另：本节落笔后本席对用例档做过一次编码回环写入（PowerShell `Get-Content`/`Set-Content` 使中文变乱），已用写工具整档重写恢复并复跑全绿（29 passed / 0 failed）——报出以免后来者据乱码档复核。

**修正轮（2026-10-19）——收口第二通路（status 写 §1「已收口」）接入同一重锚单源 + 模型可见档补副作用**

**来源** = 上段「报告项 [待裁] 收口两条通路只一条重锚」的父侧裁定：取 ①「status 收口也调同一单源」。⇒ 上段该 [待裁] 项自此结案（§5 append-only，不改旧行，以本节为准）。

**改动面（3 改 1 档 + 1 用例档）**：

| 件 | 落点（file:line，落笔后实读） | 形态 |
|---|---|---|
| status 收口重锚 | `agent-tools/batch-lifecycle.mjs`：`statusBatchRecord` 改 async（`:404`）；收口判据单点 `closingValue`（`:471`，链门 `:472` ∥ 机检门 `:475` 同消费）；重锚调点 `:486`（状态行写盘 `:478` 之后，与 close 径 `:520` 同序） | 复用同一 `reanchorOnClose`（定义 `:531`），零复制逻辑；回执仍单源 `reanchorReceiptLine`（`:487` / `:521`） |
| 回执不重复 | `batch-lifecycle.mjs:483`–`:486` | 触发 = `closingValue` ∧ 前态未冻结（前态 closed ⇒ `assertGateOpen` 早拒，跑不到写盘）；`batch.mjs:330`–`:341` 一次调用只分派一个 action ⇒ 一拍至多一次重锚、至多一份 `[ledger reanchor]` |
| 模型可见说明 | `tool-docs/batch.md`（同一行长句内，行数零增） | 收口（close ∥ status 写 §1 已收口）自动改台账：本批未落行 `trigger→条件` + 复启句落 `resume_when`（现值非空 ⇒ 不覆盖、追加 `evidence`）；另补 `认账不排期` 零触 / 已 `条件` 幂等跳过 / 失败形（回执点名、不阻断冻结） |
| 用例 | `test/ledger-pointer-reanchor.test.mjs`：+T125（status 径正反两面）· +T126（status 径被链门拒 ⇒ 台账零写；补 §3 后同档收口） | 真入口 `statusBatchRecord`（工程模式 depth-0）+ 真台账库 |

**验收实测（逐条）**：

- ① **status 径重锚**（T125）：`归批` 未落行 + `status` 写「已收口」⇒ 行 `trigger=条件`、`resume_when=原批 docs/batches/T125.md 已收口，须另起批次接手`；`resume_when` 现值非空的行 ⇒ 原值不动、复句追加 `evidence`；非收口值（`进行中`）零 `[ledger reanchor]`、行零改。
- ② **同一单源两调点**：`batch-lifecycle.mjs:486`（status）∥ `:520`（close）→ 同一 `reanchorOnClose`（`:531`）——零二写。
- ④ **回执不重复**：T125 断言 `[ledger reanchor]` 出现次数 = **1**；同档再调 status ∥ close 均在冻结门拒（`已收口档不回改`）且行字节等值 ⇒ 零二锚、零第二份清单。
- ⑥ **次序**（T126）：§3 空的档 `status` 写「已收口」被链门拒（`/收口链未跑完/`）⇒ 行仍 `归批`、`evidence` 零追加、状态行仍「进行中」；补 §3 后同档收口 ⇒ 行 `条件` + 复启句在册。
- ⑤ **测试读数**：`node --test test/ledger-pointer-reanchor.test.mjs` ⇒ **12 passed / 0 failed**；`npm test`（`node test/run.mjs`）⇒ **31 passed / 0 failed**。

**行数（node 实读）**：`batch-lifecycle.mjs` 555 行（> 500 顾问线；650 拆分触发未到——判据单源 = `docs/core/design/BATCH-RECORD.md` §4.18，本轮不拆）· 用例档 389 行 · `tool-docs/batch.md` 1 行（行数零增）。

**自检轮次与终态**：

- **内部差异审计**（只读 explore 子代理，对照任务书 + 设计）：结论 = 偏离 1 条（低）——`tool-docs/batch.md` 新增句漏 `认账不排期` 零触层；**同轮已修**。
- **内部代码评审**（advisor · code）：结论 = changes-required，7 条。处置：🟡2（doc 缺 `认账不排期` / 失败形）= **已修**；🔵5（同一判据三处重复且 `seg === 1` 只守一处）= **已修**（`:471` 单点 `closingValue`，三处共消费）；🔵6（`:486` 前态判不可达）= **保留为 defensive-only 并写明**（注释 `:484`–`:485`）；🟡3（第二通路「被拒 ⇒ 台账零写」无覆盖）= **已补 T126**；🟡4（555 行过 500 顾问线）= 顾问项，拆分触发（650）未到，本轮不拆，父侧可另裁；🟡7（本节旧 [待裁] 行滞后）= 本节即记录（append-only 不改旧行）。
- **终态 = clean**（代码侧无未决缺陷；未决项 = 设计档同步，属设计席/父侧笔）。

**报告项（笔不归本席）**：

- **[上抛·待裁] 设计权威档仍写「只 close 一路」——与已交付代码 / 模型可见档不一致**：`tool-docs/batch.md` 已写「收口两路都写台账」，而设计档仍单路——`docs/core/design/LEDGER.md:672`（触发句「批档收口（`batch` close）」）、`:685`（五件之 3「执行人 = close 径」）、`:691`（落点句）、`:843`（AC-M2-30）、`:975`（§9），以及 `docs/core/design/BATCH-RECORD.md:285`（§4.13）。须由设计席/父侧收正为「收口两路（close ∥ status 写 §1 已收口）同调单源」；否则后来者按设计档读会把 status 径的重锚当越界实现删掉。

**新增句全文（`tool-docs/batch.md`，逐字）**：「Closing a record — the close action, or status writing §1 已收口 — also writes the ledger: this record's unsettled rows (task_book → this record, status 待讨论 / 待设计 / 在途, trigger ≠ 认账不排期 — a policy call leaves its row untouched, and a row already 条件 is skipped with zero writes) get trigger → 条件, with the resume sentence 「原批 <record> 已收口，须另起批次接手」 landing in resume_when (a non-empty resume_when keeps its value — the sentence is appended to evidence instead); each changed / skipped row is named in a `[ledger reanchor]` receipt block (a ledger write failure — busy store / no derivable project root — is named there too and never blocks the freeze).」

**doc-check 读数**：`doc_check(mode:"gate")` = `DOC-CHECK GATE: ERROR（引擎已更新（tool-docs/doc_check.md mtime 2026-10-19T00:44:14.502Z > 进程启动 2026-10-19T00:22:28.499Z），请重启会话后复跑）`——旧引擎读数不可作交付判据；本轮零触 `docs/**`（`tool-docs/` 不在声明域 `scanDirs = ["docs"]`）。本席不自行豁免。

## §6 验证与收口（父代理）

**验证与收口（2026-10-19 · 父代理）**

**① 机检门**：`doc_check(mode:"gate")` = **PASS**（会话重启后；全域 197 档 0 命中）。

**② 实施验证读数**（`node --test test/ledger-pointer-reanchor.test.mjs` = **12/12**；`thincoder-core npm test` = **31/31**）：
- **A 两臂写门**：`assertTaskBookGate` 判「本笔写入面」；臂① 结果行 `status ∈ {在途, 待核销} ∨ trigger = 归批` ⇒ `task_book` 非空、**不判在盘**；臂② 本笔新写指针 ∨ 本笔新写 `trigger = 归批` ⇒ 可解析 ∧ 在盘
- **B「在盘」降为读数**：`query` 逐行 `taskBookOnDisk`（不入库、不入 `DATA_COLUMNS`），**无任何判据读它**；实测：删档后 `待核销 → 已核销` 照常落，`taskBookOnDisk` 翻两面
- **C 收口自动重锚**：`status` 写「已收口」与 `close` **两路同调单源 `reanchorOnClose`**（调点 `:486` ∥ `:520` → 定义 `:531`），零二写；次序 = 状态行写盘之后；**被拒 ⇒ 台账零写**（T126）
- **复启句落 `resume_when`**（锚文法判 `free`，不产 `resume_due`）；**该列现值非空 ⇒ 原值不动、复句追加 `evidence`**（实测 `行主条件句 @2099-01-01` 保留）
- **`cwd` 无根 ⇒ 不取行、不重锚，`failed` 点名**（不落兜底基准；邻居项目库字节等值零改）
- **一次收口只出一份 `[ledger reanchor]` 清单**（T125 计数断言 = 1）

**③ 单元测试零留存**：`ledger-pointer-reanchor.test.mjs`（328 行 / 12 例）**随本批收口删除**；本节读数是唯一凭证。

**④ 集成面**：台账为进程内库操作 ⇒ 无集成用例。

**⑤ 修正轮落地前置**：轮次 3 评审 5🟡/4🔵 + 修正轮 4（`resume_when` 落点二择一 + 在册状态收正 + 无根不落兜底 + 回执单源）+ 修正轮 5（设计档「两路同调单源」收正 6 处 + 11 处同源随改）**均已落**。

**⑥ 搁置清单回核**：无。**⑦ 暂缓批复核：无**。

**⑧ 用户文档面同拍**：`tool-docs/ledger.md`（两臂写门句 + `taskBookOnDisk` 读数句）与 `tool-docs/batch.md`（收口两路的台账写副作用 + `[ledger reanchor]` 回执段）**均已同轮更新**——模型可见面与代码同拍。

**⑨ 本批的特殊之处**：它是 2026-10-16 的旧批，**§4 批准一直空着**——批准在当天就给了（原话在 §1），但没人回填。2026-10-19 由父侧按 §1 逐字补记，并注明「**本节此前为空 = 记录遗漏，不是未获批准**」。**记录的空缺不等于授权的空缺。**

**⑩ 残留**：`LEDGER.md` 三处在册状态句仍写「未落地」——**状态句过期、不改代码判断**，归收口轮整段收口（父侧裁定：**指向错 ⇒ 修；陈述旧 ⇒ 统一收口**）。
