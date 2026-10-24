# 2026-10-16 · 台账批级操作（批级批量迁移与结算 ∥ 按 task_book 反查 ∥ 归批校验 ∥ 超限读数 ∥ 条件字段 ∥ 批档头形）
> 六段 append-only，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 编制：主 agent · 2026-10-16 · 来源 = 用户 2026-10-16 01:06「你评估一下台账治理还有什么问题吗？」→ 01:14「1，P2选A ，批甲+乙都开。」→ 01:47「甲乙都批，先走起来。」；评估证据 = 父侧本会话实操（台账行 #1530 逐条实锤 + 修法）。。
> 台账 = #1530（core · 归批）。前情 = 无（独立批）。
## §1 讨论（主 agent）
**状态行**：🔄 进行中（…）
<§1 模板占位：本批条目 / 关键判据 / 授权口径>
## §2 批次任务与设计（eng-designer）
**状态行**：设计完成
<§2 模板占位：本批条目（覆盖） / 设计档落点 / 机制设计 / 受影响文件与测试覆盖 / 验收对照 / 关键决策 / 上抛项>

**本批条目（覆盖）与设计落点**（六项，均「文件 + 函数/命令名 + 形态」级）：

| # | 条目 | 设计落点（file:line / 符号） | 形态一句话 |
|---|---|---|---|
| P1 | 批级批量迁移与结算 | `docs/core/design/LEDGER.md` §3.3；实现 = `thincoder-core/ledger-cmd.mjs`（新 `resolveBatchRows` / `ledgerUpdateBatch` / `ledgerCloseBatch`，逐行段抽为 `applyRowUpdate` / `applyRowClose` 与单行形共函数）；工具面 = `thincoder-core/ledger-tools.mjs`（`ACTION_SPECS.update/close` 增 `batch`） | 两写命令增可选 `batch`（批档指针）= 选中 `task_book` 文件部分解析同址的全部行；`update` 逐行按迁移表重判，`close` 只销已到 `待核销` 者；跳过行逐行点名 + 一个事务 |
| P6 | `query` / `count` 增 `task_book` 过滤 | `LEDGER.md` §7.1；实现 = `ledger-cmd.mjs` `ledgerQuery`(:33) / `ledgerCount`(:49) | 等值过滤，与 status / kind / board / trigger 并列（query 为第 5 枚）；count 现状零过滤 ⇒ 只增 `task_book` 一枚 |
| P2(a) | `归批` 携在盘批档指针 + 机械校验 | `LEDGER.md` §6.2；实现 = `ledger-cmd.mjs` `assertTaskBookGate`(:69，射程扩) | 判**结果行** `(status, trigger, task_book)`：`status ∈ {在途,待核销}` **或** `trigger=归批` ⇒ `task_book` 必填 ∧ 在盘（缺 / 不可解析 / 档不存在 ⇒ 拒） |
| P2收口报警 | 批档收口时未落行报警 | `BATCH-RECORD.md` §4.13；实现 = `thincoder-core/agent-tools/batch-lifecycle.mjs` close 径 | close 回执附本批未落行列表（`task_book` 指本档 ∧ `status ∉ {已核销,已废弃}`）逐行点名；零写、不阻断冻结（读数非闸门） |
| P4 | evidence 超限读数 | `LEDGER.md` §5 + §7.1；实现 = `ledger-db.mjs` `EVIDENCE_SOFT_LIMIT = 300`；`ledger-cmd.mjs` `ledgerQuery` 逐行 `evidenceOversize` + 新 `ledgerEvidenceOversize` | `query` 逐行携 `evidenceOversize`（形态沿 `aged`）；`count` 回报 `{ count, evidenceOversize }`；**写入不拒** |
| P5 | `resume_when` 可选字段 | `LEDGER.md` §3.4；实现 = `ledger-db.mjs` DDL + 列迁移共件 + `LEDGER_SCHEMA_VERSION` 1⇒2；`ledger-cmd.mjs` `ledgerAdd` / `ledgerUpdate`；`ledger-migrate.mjs` `DATA_COLUMNS` 12⇒13 | items 增**可空列** `resume_when TEXT`（一句话 + 可选锚）；可空 ⇒ 存量零破；不设闸门 |
| P7 | 批档头「台账」行多编号形 | `BATCH-RECORD.md` §4.10 / §4.11；实现 = `agent-tools/batch-skeleton.mjs` `batchSkeleton` + `batch-lifecycle.mjs` `normalizeHeaderParam`；`agent-tools/batch.mjs` schema 描述 | 档头台账行携多枚编号（`#a · #b · …`，单物理行）；骨架与占位字面**零改**；各行 `task_book` 回指本档 = 反向引用 |

**设计档落点**：`docs/core/design/LEDGER.md`（P1 / P2指针面 / P4 / P5 / P6 —— 新增 §3.3 ∥ §3.4 ∥ §6.2，改 §5 ∥ §7.1 ∥ §8 ∥ §9）· `docs/core/design/BATCH-RECORD.md`（P7 + P2收口报警 —— 改 §4.8 ∥ §4.10 ∥ §4.11 ∥ §4.13 ∥ §7 ∥ §8）。两档现读行数（node 实测）：`LEDGER.md` 542 行 · `BATCH-RECORD.md` 500 行。
**无关面**：`TOOLS.md` §6.20 **零改**（占位枚举字面与档头结构行判定域均不动——多编号仍是单行）；`LEDGER-SELF-CONTAINED.md` / 团队台账（`docs/server/design/ledger/LEDGER.md` ∥ `team-ledger.mjs`）**零触**（团队账自持存储与代码，KD-SV-141 只沿状态语汇，无 `task_book` / `evidence` 面）。

**机制设计（要点）**：
- **逐行语义单源**（D2）：单行形与批量形共用 `applyRowUpdate` / `applyRowClose`——批量只加「选行 + 汇总 + 跳过点名」；迁移表判 / 写门 / evidence 门逐行照判，**批量不破任一既有门**。
- **批身份单源**：批的同一性 = `task_book` 的**文件部分经 `resolveDeclaredRef` 解析出的绝对路径**（§6.1 口径 1/4 同源）——不为批量新造身份列（否则 `task_book` 与新列双身份 = 漂移源）。
- **安全阀**：禁静默销账——回执 `skipped: [{ id, from, why }]` 逐行点名；回执形 `{ batch, status, applied, skipped }`。
- **成本（可核）**：N 行批收口 **改前 2N ⇒ 改后 2**（`update --batch --status 待核销` + `close --batch`）；N=14 实测为据（28 次 ⇒ 2 次）。
- **状态机本体零改**：六态与迁移表逐字不动（批量逐行照判同一表）；evidence 门槛不动（批量同样判非空）。

**受影响文件与测试覆盖**（现行行数 = node 实测，非记忆）：

| 文件 | 现行 | 预计增量 | 面 |
|---|---|---|---|
| `thincoder-core/ledger-cmd.mjs` | 179 | +~95 ⇒ ~274 | P1 / P4 / P5 / P6 |
| `thincoder-core/ledger-db.mjs` | 175 | +~18 ⇒ ~193 | P4 / P5（列 + 常量 + 版本） |
| `thincoder-core/ledger-tools.mjs` | 260 | +~30 ⇒ ~290 | P1 / P5 / P6（声明 + 二选一判据 + count 回报） |
| `thincoder-core/ledger.mjs` | 187 | +~2 ⇒ ~189 | re-export 新符号 |
| `thincoder-core/ledger-migrate.mjs` | 301 | +~10 ⇒ ~311 | P5（`DATA_COLUMNS` 13 列 · 容忍集 `{executor, resume_when}`） |
| `thincoder-core/ledger-read.mjs` | 95 | 0 | 直引 `DATA_COLUMNS`——自动随列 |
| `thincoder-core/agent-tools/batch-skeleton.mjs` | 219 | +~12 ⇒ ~231 | P7（多枚归一 + 渲染） |
| `thincoder-core/agent-tools/batch-lifecycle.mjs` | 376 | +~25 ⇒ ~401 | P2收口报警（台账只读查询，动态 import） |
| `thincoder-core/agent-tools/batch.mjs` | 337 | +~4 ⇒ ~341 | P7（schema 描述） |
| `thincoder-core/tool-docs/ledger.md` | 6 | +2 行 | 文本单点（batch 形 / `resume_when` / `task_book` 过滤 / 读数） |
| `thincoder-core/test/ledger-batch-ops.test.mjs` | 新建 | ~150–200 | 用例 T92–T101 |

**拆分计划（贴线档）**：`ledger-cmd.mjs` 增量后 ~274 行（≤300 顾问线 ⇒ 不拆）；**若实施实测 >300 ⇒ 拆点 = 批量面外提 `thincoder-core/ledger-batch.mjs`（`resolveBatchRows` + 两 batch 函数 + 两 `applyRow*`）**，core 档保留调用点（先例 = 2026-09-28 批把守卫族自本档拆出）。`ledger-migrate.mjs` 现已 301 行（**既存越线**，非本批所生）——本批 +10 ⇒ ~311，**不拆**（登记：越线既存 + 本批非实质改动）。

**验收对照（回指需求档 AC——需求档笔归主 agent，下列七行待落）**：
AC-M2-26 批级批量迁移（T92/T94/T96）· AC-M2-27 批级批量结算 + 安全阀（T92/T93/T95）· AC-M2-28 `task_book` 过滤逐档隔离（T97）· AC-M2-29 归批指针门（T98）· AC-M2-30 收口报警（T99）· AC-M2-31 evidence 超限读数（T101）· AC-M2-32 `resume_when` 可空字段 + 存量兼容（T100）。
**三方一致**：本表条目 = 设计档 §8 新增 AC-M2-26…32（7 行）= 需求档待落 7 行（**同源同号**）。

**验收标准（本批派单七条 → 落点）**：①「文件 + 函数/命令名 + 形态」级 → 上表七行；② 成本可核 → §3.3「2N ⇒ 2」（N=14 实测）；③ 安全阀机检用例 → T93（混批只销待核销者 + 逐行点名）/ T92（纯批全销计数对）；④ `task_book` 逐档隔离 → T97（3 批各回各集）；⑤ 归批无在盘档 ⇒ 拒 + 收口报警可复现 → T98 / T99；⑥ 存量兼容逐条见下；⑦ 靶向单跑 + 断言条数 → `cd thincoder/thincoder-core && node --test test/ledger-batch-ops.test.mjs`（用例 10 条 T92–T101；断言 ≥30 条，逐条见设计档 §8 用例表）。

**存量兼容（逐条声明）**：
- `resume_when` 可空列：老行取 NULL（零破）；老库打开幂等 `ALTER`（列在 ⇒ 零动作）；`LEDGER_SCHEMA_VERSION` 1⇒2（旧库未标 = 0，写面开库补标）。
- `migrate` 列集：旧 DDL 库（缺 `executor`）与新缺列 `resume_when` 均按 NULL 映射照迁（容忍集 `{executor, resume_when}`）；缺其余任一数据列 ⇒ 照旧拒。
- `trigger=归批` 门：**写入时点门**——不扫存量、不回改存量行（存量行仅在下一次被写时受判）。
- 单行面（`id` 形）与既有五 action：逐字零回归（`batch` 缺省 = 旧行为）。

**关键决策（含被否项）**：
- KD-BO1 **批量 = 两写命令加 `batch` 参（不新增 action）**；被否 = 新 action `batchUpdate` / `batchClose`（工具面 inflation + 守卫双份）。
- KD-BO2 **批身份 = `task_book` 解析同址**（一套身份）；被否 = 新造 `batch` 身份列（双身份 = 漂移源）。
- KD-BO3 **`close --batch` 只走勾销**，追认核销不入批量面；被否 = 批量统一 `evidence` 做追认（统一文本 ≠ 逐行结账依据 = 造假账）。
- KD-BO4 **归批门 = 判结果行 `(status, trigger)` 组合**（与 §6.1 同体例、同 helper）；被否 = 只判「本次 patch 设 `trigger=归批`」（判据双份 = 漂移）。
- KD-BO5 **evidence 超限 = 读数非闸门**（用户裁定：无限机检反感）；被否 = 300 字写入即拒。
- KD-BO6 **`resume_when` = 可空列**（非新表；非塞 `evidence`）；被否 = 句子 / 锚拆两列（锚无可机检语义，拆列无收益）。
- KD-BO7 **P7 = 单物理行多编号**；被否 = 多物理行台账行（破档头结构行单行契约 + `TOOLS.md` §6.20 判定域）。

**上抛项**（详见交付报告）：
- `[上抛·知会]` 派单前提更正 2 处：count 现状**零过滤参**（派单称四过滤）· 台账工具族住 `thincoder-core/ledger*.mjs`（派单称 `agent-tools/ledger*.mjs`）。
- `[上抛·知会]` 存量既存不一致：需求档 AC-M2-21…25 回指 `设计档 §13.1/§13.2/§13.3/§13.4/§13.6/§13.9`，而 LEDGER.md 标题层止于 §9（§13 系 2026-10-15 历史清除时整块删）——**非本批所生**，前批 `2026-10-16-record-face-correction` 只办了 §13.4 的 docs 面 2 处。
- `[上抛·待裁]` 归批门的存量面冲击：本仓现存 ≈20 行 `trigger=归批` 而无在盘 `task_book` 的行，落盘后其**任何更新**都会被门拒（射程连带，同 §6.1 体例；出路 = 补指针 / 改 trigger）。是否本批内一并迁移，请裁。

**未落项**：本批全部实现（P1–P7 代码 + 单元测试档）= **实施轮**（本批 = 设计轮，零产品码落地）；需求档 AC-M2-26…32 七行 = 主 agent 笔（本席无需求档写权）。

**更正段（fix 轮 · 2026-10-16 · 逐号受理设计评审判据 14 条：改前 → 改后）**

设计评审 §3「轮次 1」（0🔴 ∥ 12🟡 ∥ 2🔵）逐条受理，全部落于设计档正文；原行 append-only 不回改，本段记改前 → 改后（行号 = 落笔当刻实读）。

| # | 落点（file:line） | 改前 → 改后 |
|---|---|---|
| 1 | `LEDGER.md` §3.3 形态表 `:219` ∥ §3.2 `close` `status` 行 `:187` | 批量形 `status` 面未定 → 明定「批量形不携 `status`」（缺省 ⇒ 恒勾销 = `已核销`）；`status` 判据按形条件化（单行形必填 ∈ {已核销,已废弃}；批量形可空 · 值恒 ∈ {已核销}）——与 T92 `:538` / T95 `:541` 调用形对齐 |
| 2 | `LEDGER.md` §3.2 判据表 `:180`/`:186`/`:195`/`:196` ∥ 判据句 `:145` ∥ 机制段 `:155` ∥ 判序 `:157` ∥ 文案模板 `:170` | `id` 两行两判据（必填 ∥ 与 `batch` 二选一）→ 单行单判据「与 `batch` 恰携其一（组判据 P7）」，删重复行 2 条；新增声明面组键 `oneOfRequired: [["id","batch"]]` + 组判据 P7（判序 ④）+ P7 文案行；判据句词汇表补 `oneOfRequired` |
| 3 | `LEDGER.md` §7.1 `:364`/`:365`/`:366` ∥ §3.3 `:214`/`:225` | 两符号面（`batch` 形 ∥ 新导出）→ 单一面：核内单源 = 新导出 `ledgerUpdateBatch` / `ledgerCloseBatch`；`ledgerUpdate` / `ledgerClose` 签名去 `batch`（`{ cwd, id, patch }` ∥ `{ cwd, id, status, evidence, evidenceReplace }`）；§3.3 补「符号面单源」句 |
| 4 | `LEDGER.md` §2.2 步 2 `:89` / 步 3 `:90` / 语义保全 `:98` ∥ AC-M2-12 `:455` ∥ T25 `:490` ∥ T29 `:494` | 12 数据列（仅容忍 `executor`）→ 13 数据列 + 容忍集 `{executor, resume_when}`（逐处收正；T29 补 `resume_when`） |
| 5 | `LEDGER.md` §6.1 `ledgerAdd` 括注 `:304` | 「门在该入口当下恒不触发」（总括）→ 射程限定为 **`status` 半幅**；`trigger=归批` 半幅（§6.2）**照判**——add 携 `trigger=归批` 即入门 |
| 6 | `LEDGER.md` **新增 §3.5** `:251` ∥ `BATCH-RECORD.md` **新增 §4.17** `:331` | 本批无受影响面行数标注 → 两档各补「受影响面（行数 = 现行 · 落笔当刻实读）」+ 贴线判（最高 `declaration.mjs` 379 行 ∥ `batch-lifecycle.mjs` 376 行 ⇒ 零拆分义务） |
| 7 | `LEDGER.md` §3.5 `:253` ∥ `BATCH-RECORD.md` §4.17 `:333` | 先例行只覆盖 P5 → 补 P1 / P2(a) / P4 / P6（LEDGER）+ P7 / P2 收口报警（BATCH），含「无同形先例」「无先例」显式宣告 |
| 8 | `LEDGER.md` §3.5 `:261` ∥ `BATCH-RECORD.md` §4.17 `:336` | 勘察证据行缺失 → 两档各补（查过 = 本仓公共源档 DOC-DISCIPLINE §4.2.2 ∥ LEDGER-SELF-CONTAINED ∥ MEMORY §6.15 ∥ MANIFEST §2.2——相关；声明源 `index.publicRepos` = `[]`（实读 `:189`）⇒ 无仓外声明源相关，照记） |
| 9 | `LEDGER.md` §3.3 **新增「`batch` 入参自身门」** `:223` ∥ T95 `:541` ∥ AC-M2-26 `:463` | T95 语义悬空（§6.2 射程 = 结果行组合，不含 `batch` 入参）→ §3.3 补 `batch` 入参自身门（可解析 ∧ 在盘 ⇒ 否则 fail-closed 拒；无匹配行不拒）；T95 改指 §3.3；AC-M2-26 补该句 |
| 10 | `LEDGER.md` §7.1 `ledgerQuery` 行 `:360` | 「五枚等值过滤」口径未明 → 明写 `task_book` = **原值等值**（列串直比），与 §3.3 选行「文件部分解析同址」两径口径不同、各自单源 |
| 11 | `LEDGER.md` §7.1 `ledgerCount` 行 `:361` ∥ §4 计数单源 `:275` | `count` = 裸数 → 回报 `{ count, evidenceOversize }`；明写消费面 = 收口行 ∥ 显示面读 `.count`（零重算） |
| 12 | `LEDGER.md` §3.5 `:267` ∥ `BATCH-RECORD.md` §4.17 `:344` | 描述面未入受影响面 → 两档补「文档 / 描述面（模型可见文案——换写）」行（`tool-docs/ledger.md` ∥ `tool-docs/batch.md`） |
| 13 | `BATCH-RECORD.md` §4.8 BR-54 `:182` | 分隔符集合两处不一（BR-54 缺「空白分隔串」）→ 归一至 §4.11 `:237`「契约单源」：BR-54 补「空白 分隔串」 |
| 14 | `LEDGER.md` T92 `:538` | 「库内该批计数 = N」易读成与 count 口径矛盾 → 明写读法：**直读库**按 `task_book` 直查；`ledger(count)` 只数未决四态、该批收口后回报 0——两读数口径不同、非矛盾 |

**自洽复查读数（三机检）**：① 引用集 ↔ 标题集——本段引 §3.1–§3.5 / §5 / §6.1 / §6.2 / §7.1 / §8（LEDGER）∥ §4.8 / §4.10 / §4.11 / §4.13 / §4.17（BATCH），逐号在盘命中。② 表行 ↔ 汇总计数——受影响面行数逐档实测（LEDGER 最高 379、BATCH 最高 376），与「零拆分义务」判一致。③ 断言 ↔ 实测——行数 = node 实读（live），非估算。

**本轮不做**：产品码实现（实施轮）· 台账数据迁移（父侧专权）· 其余批的面 · 判据语义实质变更（本段仅消歧 / 补标注 / 收正陈旧句）。

**文案退役（随 #2 的必然后果 · 逐条声明）**：`ledger(update)` / `ledger(close)` 的「`id` 缺失（必填）」文案随二选一面退役（双缺 ⇒ 恰携其一文案 P7）——旧用例档 `thincoder-core/test/ledger-args-guard.test.mjs` 已不在盘（单元测试用毕即删），无在盘断言受影响。

**非本批观察（报告不动作）**：§3.2 `:202`–`:207` / §7.2 `:382` 两个「受影响面」块（评审 #6 所指出）仍引前批已删测试档 `ledger-args-guard.test.mjs`（T37–T44）——死指针、D8 面；不在本批 14 条射程，留待专批。

**上段行号勘误（回读实读）**：非本批观察所指两块实测 = §3.2 受影响面块 `:201`–`:206`（非 `:202`–`:207`）· §7.2 标记范围受影响面 `:384`（非 `:382`）；另 `:506`「用例表（续——工具层参数守卫）」亦引同一已删档 `ledger-args-guard.test.mjs`。

**行号终态复读（末次「拆长行」编辑后 · 终读）**：上表行号为更正段首段落笔读数（as-of，D4）；末次编辑后 §3.2 机制段起全体位移——终态坐标（`LEDGER.md`，另注者除外）：

- 1 → §3.3 形态表 `:220` ∥ §3.2 `close` `status` `:188`
- 2 → §3.2 `update` `id` `:181` ∥ `close` `id` `:187` ∥ `update` `batch` `:196` ∥ `close` `batch` `:197` ∥ 判据句 `:145` ∥ 机制段 `:155`（二选一组续行 `:156`）∥ 判序 `:158` ∥ 文案模板 `:171`
- 3 → §7.1 `:374` / `:375` / `:376` ∥ §3.3 `:215` / `:226`
- 4 → §2.2 `:89` / `:90` / `:98` ∥ AC-M2-12 `:465` ∥ T25 `:500` ∥ T29 `:504`
- 5 → §6.1 `:313`（括注续行 `:314`）
- 6 → §3.5 `:252` ∥ `BATCH-RECORD.md` §4.17 `:331`
- 7 → §3.5 `:254` ∥ `BATCH-RECORD.md` `:333`
- 8 → §3.5 `:262` ∥ `BATCH-RECORD.md` `:336`
- 9 → §3.3 `:224` ∥ T95 `:551` ∥ AC-M2-26 `:473`
- 10 → §7.1 `:370`
- 11 → §7.1 `:371` ∥ §4 `:284`
- 12 → §3.5 `:276` ∥ `BATCH-RECORD.md` `:344`
- 13 → `BATCH-RECORD.md` §4.8 BR-54 `:182`
- 14 → T92 `:548`

**上段勘误行终态**：§3.2 受影响面块 `:202`–`:207` · §7.2 标记范围受影响面 `:394` · 同引已删档另一行 `:516`。

**行宽实读（末读）**：`LEDGER.md` 566 行 / 超 300 字长行 3 条（`:62` / `:79` / `:459`——皆前批既存，非本轮所生；本轮新增长行 0）；`BATCH-RECORD.md` 517 行 / 超 300 字长行 1 条（`:228`——前批既存）。

**行宽实读勘误（终读）**：上段行宽实读为拆行前旧读数——终态实读 = `LEDGER.md` **576 行** / 超 300 字长行 3 条（`:62` / `:79` / **`:469`**）· `BATCH-RECORD.md` **517 行** / 超 300 字长行 1 条（`:228`）——四条皆前批既存（本轮新增长行 0）。

## §3 设计评审（评审子代理）

### 轮次 1（评审子代理）

评审对象（设计评审 · 台账批级操作 P1–P7 · 靶档 = `LEDGER.md` ∥ `BATCH-RECORD.md`）

| # | Category | Severity | Issue | Suggestion |
|---|----------|----------|-------|------------|
| 1 | Clarity | 🟡 | `close --batch` 的参数面未定：守卫表 `LEDGER.md:186` 定 close `status` 必填，而批量形态表 `LEDGER.md:220` ∥ 成本句 `LEDGER.md:232` ∥ T92 `LEDGER.md:514` 的调用形均不携 `status`——同一次调用的入参要求两处不一 | 在 §3.3 形态表 / 回执行补明 batch 形的 `status` 面（须携 ⇒ 值域收为「已核销」单值；免携 ⇒ 守卫声明面按 batch 条件化），并与 T92 调用形对齐 |
| 2 | Doc-state | 🟡 | 字段判据表同一 `(工具, 字段)` 两行两判据：`LEDGER.md:179`（`id` 必填 · 数字）∥ `LEDGER.md:197`（与 `batch` 二选一）；`:186` ∥ `:198` 同形。P3 判序（声明序逐字段）无从判 batch 形下 `id` 缺省是否放行；且「恰携其一」在「声明派生」（required ∥ type ∥ enum，`LEDGER.md:155`）词汇表内无表达面 | 合并为单行（`id`：必填 ∧ 与 `batch` 恰携其一），并在机制段补明二选一的机械落点与声明面 `required` 的条件化写法 |
| 3 | Doc-state | 🟡 | `LEDGER.md:340` ∥ `:341` 把批量行为记在 `ledgerUpdate` / `ledgerClose` 的 `batch` 形上，`LEDGER.md:342` 又新增 `ledgerUpdateBatch` / `ledgerCloseBatch` 为「批级批量两单源」——同一机制两个符号面 | 定为单一面（工具层调新导出 / 或签名内含 batch），另一处改指针；§3.3 的「内部函数」句随之对齐 |
| 4 | Doc-state | 🟡 | `LEDGER.md:89`（12 数据列核对，仅缺 `executor` 照迁）∥ `LEDGER.md:98`（12 数据列逐字复制，枚举无 `resume_when`）与 `LEDGER.md:242`（`DATA_COLUMNS` 12 → 13）∥ `LEDGER.md:445`（容忍集扩为 `{executor, resume_when}` ∥ T29 `LEDGER.md:470`）同机制两写；按 §2.2 逐字实现会把缺 `resume_when` 的正常旧源判拒 | 就地收正 §2.2 两处列集（13 列 + 容忍集 `{executor, resume_when}`）与 T29/AC-M2-12 口径 |
| 5 | Doc-state | 🟡 | `LEDGER.md:280`「`ledgerAdd` 的结果行恒为 `待讨论`…⇒ 门在该入口当下恒不触发」与新 §6.2（`trigger=归批` 的 add 结果行即入门——`LEDGER.md:306` ∥ T98 `LEDGER.md:520`）不一致 | 该句射程限定为 status 半幅（或直引 §6.2），消去「add 入口恒不触门」的总括 |
| 6 | Methodology | 🟡 | 本批（P1–P7）无受影响面行数标注：`LEDGER.md:202`–`:207` ∥ `LEDGER.md:360` 均为**前批**的「受影响面（行数 = 现行）」块；本批触及档（`ledger-cmd.mjs` 选行/落笔/门扩枚 · `ledger.mjs` 新导出 · `ledger-db.mjs` 列 + `LEDGER_SCHEMA_VERSION` + `EVIDENCE_SOFT_LIMIT` · `ledger-tools.mjs` 声明面 · `ledger-migrate.mjs` 列集 · `declaration.mjs` 新导出 · `agent-tools/batch-lifecycle.mjs` close 报警 · `batch.mjs`/`batch-skeleton.mjs` 多枚形 · 新档 `test/ledger-batch-ops.test.mjs`）全无「现行行数 × 增量（≤±N / 结构不变）」与贴线判（`batch-lifecycle.mjs` 在册坐标 ≥ `:173`——`BATCH-RECORD.md:250`/`:251`；尺寸未核） | 按 §7.2 既有形态补一行「受影响面（行数 = 现行）+ 贴线判」；越 500/800 档位者附拆分计划 |
| 7 | Methodology | 🟡 | 最近先例行只覆盖 P5（`LEDGER.md:244`「对齐（最近先例）」）；P1（§3.3）∥ P2a（§6.2）∥ P4（§5 行）∥ P6（§7.1 过滤面）∥ P7（`BATCH-RECORD.md:228` / D-BR28 `:481`）均无先例坐标（实现坐标 ∥ 对应设计档节 ∥ 先例批）+ 对齐 ∥ 偏离理由，亦无「无先例」显式宣告 | 逐项补先例行（含无先例的显式宣告）；形态可沿本档既有条（`LEDGER.md:75`/`:83`/`:91` 先例写法） |
| 8 | Methodology | 🟡 | 勘察证据行缺失：两档均无「查过哪些公共源文档（尤其独立文档仓）∥ 有无相关」行（项目义务面在册——`PROMPT-SYSTEM.md:635` ∥ `ADVISOR-CONVERGENCE.md:423` A-AC16）；缺行 ⇒ 未查或未记 | 补一行勘察证据行（无相关亦照记） |
| 9 | Acceptance | 🟡 | 语义悬空：T95 `LEDGER.md:517`「`batch` 指针不可解析 / 档不存在 ⇒ 拒（写入时门 §6.2）」在规范面无落点——§6.2 的门射程 = 结果行 `(status, trigger, task_book)` 组合（`LEDGER.md:306`），不含 `batch` 入参；AC-M2-26 `LEDGER.md:439` 亦未载 | 在 §3.3 补 `batch` 入参自身门（可解析 ∧ 在盘 ⇒ 否则 fail-closed 拒）或改指其真实落点 |
| 10 | Clarity | 🟡 | 「批 → 行」两径判据不同：`task_book` 等值过滤（`LEDGER.md:336`「五枚等值过滤」）∥ 批量选行的「文件部分解析同址」（`LEDGER.md:222`）——带 `§N` 后缀的行在两处归属不同（过滤按原值 ⇒ 漏；选行按解析 ⇒ 命中），差异未声明 | 明写过滤口径（原值等值 ∥ 文件部分解析等值）并说明与 §3.3 选行的关系 |
| 11 | Clarity | 🟡 | `count` 出参形变化未登记：`LEDGER.md:337` 仍记 `ledgerCount` = `COUNT(*)`，`LEDGER.md:444` AC-M2-31 记「`count` 回报 `{ count, evidenceOversize }`」；消费面（收口行 / 显示面）与模型可见文案（tool-docs）的同步与回归范围未列 | 明写出参形与消费面回归范围（含显示面零重算口径） |
| 12 | Clarity | 🟡 | 工具描述面未入受影响面：新参数（`batch` / `task_book` / `resume_when`）与新出参（`evidenceOversize`、count 对象形）对模型可见文案（`tool-docs/ledger.md` ∥ `LEDGER.md:150` 的声明条目）的同步无登记（项目既有惯例把描述面列为换写面——`BATCH-RECORD.md:320`） | 把描述面列入本批受影响面并注明换写口径 |
| 13 | Clarity | 🔵 | P7 分隔符集合两处不一：`BATCH-RECORD.md:237` 含「空白分隔的串」，BR-54 `BATCH-RECORD.md:182` 只列「` · ` / `,`」 | 归一为单一口径（或明写空白分隔是否成立） |
| 14 | Acceptance | 🔵 | T92 `LEDGER.md:514`「库内该批计数 = N」与 count 口径（未决四态——`LEDGER.md:251`）易读成矛盾（收口后该批 `ledger(count)` 应为 0） | 写明读法（直读库 ∥ `count` 工具） |

计数：🔴 0 · 🟡 12 · 🔵 2。

VERDICT: pass

## §4 用户批准（主 agent）
## §5 实施记录（eng-coder）
## §6 验证与收口（父代理）
