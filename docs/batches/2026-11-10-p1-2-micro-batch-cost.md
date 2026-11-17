# 2026-11-10 · p1-2-micro-batch-cost
> 六段，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 每段只有一个作者：作者的段可 `append` 加内容、可就地改（`edit`）；非作者一概拒。
> 编制：主 agent · 2026-11-10 · 来源 = 用户 2026-11-10 16:11 批准 P0–P2 全部并自动执行；范围 = `docs/core/requirements/ENGINEERING-SYSTEM-OPTIMIZATION.md` D1 ∥ D2 ∥ D3；依赖 P0-1 ∥ P0-3 均已收口。
> 台账 = #2291（core · 归批）。前情 = 无（独立批）。
## §1 讨论（主 agent）
**状态行**：已收口 2026-11-10
批起 sha = 4fafb49c002e12d935989fd9a7eeb72d0d0d2c6b
<§1 模板占位：本批条目 / 关键判据 / 授权口径>

## 讨论（微批与评审成本）

**来源**：`docs/core/requirements/ENGINEERING-SYSTEM-OPTIMIZATION.md` D1 ∥ D2 ∥ D3。
**目标**：小改动的固定成本降下来，同时不把「判据」和「账」一起降掉。

### 三条要设计

**D1 记录义务与产品工作成本不对称** —— 多处「same round / immediately / same day」的记录义务；而产品实现要走设计 → 评审 → 令牌 → 批档。

**处置要求**：把散落的即时强制收成「随批一次结清」，**但「决定当轮落盘」与「小形项当轮就地修」这两条不许降级**——它们防的是「决定只活在对话里，下次压缩就没了」。

**D2 小改动没有低成本通道** —— 今天有实证：为两处措辞（`PROMPT-SYSTEM.md` 的 E 组余数与两个判法格），开了批、写了 §2 七件套、评审判 🔴 缺集成测试设计、再补一轮。

**处置要求**：设计一条**便宜的通道**，判据必须写死「什么算小形」——否则这条通道会被拿来运机制变更。至少要能回答：谁判它是小形、越界了怎么退回、走这条通道的改动事后怎么被看见。

**D3 评审轮次与冻结窗造成等待** —— 设计多轮评审期间文档冻结，修轮与评审互相等。

**处置要求**：要么让冻结窗只锁被审段（而不是整档），要么给出「评审在跑时允许改什么」的明确判据。**不能靠「记得别改」**。

### 已定边界

- 不降低**判据强度**：`completed` 清单、核销判据、状态迁移表都不在本批范围（P0-1 已定）。
- 不改令牌门与评审签字的必要性——本批降的是**往返次数与等待**，不是把关。

### 库内勘察起点

- `thincoder-core/prompts/persona-engineering.md` ∥ `discipline-engineering.md`（记录义务的散落处）
- `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md`（批档流程与冻结窗）
- `docs/core/design/PROMPT-SYSTEM.md`（规则面与实现面的分层）

`库外 = B 类：改动面 = 提示词与流程设计档；外部断言 = 零`

## §2 批次任务与设计（eng-designer）
**状态行**：设计完成（修轮 6：D5 按 batch 段写与 write/edit 文件写分两路，四层目标字面与代码对齐；旧全称句复扫零命中，新提示词 290 字符，doc_check PASS）
<§2 模板占位：本批条目（覆盖） / 设计档落点 / 机制设计 / 受影响文件与测试覆盖 / 验收对照 / 关键决策 / 上抛项>

**微批与评审成本** — 覆盖 D1 ∥ D2 ∥ D3（来源 = `docs/core/requirements/ENGINEERING-SYSTEM-OPTIMIZATION.md` 同名三条；台账 #2291）。

### 覆盖条目

| 条目 | 处置 | 设计落点 | 验收 |
|---|---|---|---|
| D1 记录义务与产品工作成本不对称 | 记录义务分两档：**当轮**（需求决定落盘 / 写域内小形项就地修 / 状态声明与越界上抛）∥ **随批结清**（新债挂号 / 收口对账清扫 / 范围外线索单列） | `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` §2.18 | R41 |
| D2 小改动没有低成本通道 | 微批通道：四项判据合取（零业务可观察结果变化 ∥ 改动面 ≤ 2 档 ∥ 每处一条会红的读数 ∥ 无语义面）；省 §2 厚度、评审轮次、集成 delta 三项；账与关零改 | 同档 §2.19 | R42 |
| D3 评审轮次与冻结窗造成等待 | 冻结面按写面分路：`batch` 段写不在扫面内，§1 ∥ §2 纪律守、§3–§6 照写；批档路径的 `write` / `edit` 整档拒（含 §3–§6），设计档同判；机制零改 | 同档 §2.20（机制权威 = `docs/core/design/ADVISOR-GUARDS.md` §5） | R43 |

**本批自身不是微批**：改动面 9 档（设计档 4 + 提示词 5，逐档见下节与设计 `§3.1`）、含规则语义（判据 ② ∥ ④ 不成立），走全链。

### 设计档落点

- `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md`：§2.18 ∥ §2.19 ∥ §2.20；§3.1 受影响文件；§5 的 R41–R43；§6 用例表块；§7 边界块；§9 末块。
- `docs/core/design/PROMPT-SYSTEM.md`：§8.2 落点登记（三条规则 → 机制档节 + 提示词档），规则本体不复制（D2）。

### 机制要点（一节一句）

- **D1**：结清不是「以后」——收口那一笔点名「本批新债 N 条 + 行号」或「本批无新债」，缺句即收口不合格；批暂缓 ∥ 撤销 ⇒ 退回那一刻结清。当轮三项零降级。
- **D2**：四项任一不真即全链；主 agent 宣告 + 取证，评审是唯一否决面（一次评审、一行裁定）；越界第二入口 = §5 实改文件 ⊄ §2 点名清单，收口扫出、记 §6「越界」、不得以微批收口。
- **D3**：`batch` 段写不在冻结扫面内，§1 ∥ §2 靠纪律守、§3–§6 照写；`write` / `edit` 打在批档路径上则由 `freezeWindowConflict` 的 `entry.batchDoc ?? entry.run?.batchDoc` 分支整档拒，不分段。两支都是现状，本批只收正描述。

### 受影响文件与测试覆盖

- **设计面（本笔已落）**：`docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` ∥ `docs/core/design/PROMPT-SYSTEM.md`。
- **设计面（同一规则的另两层，本笔已落）**：`docs/core/design/ADVISOR-GUARDS.md` §5（射程表（a2）+（d）实现要点 + 回执冻结句 + A-AG7 + §11）∥ `docs/core/design/DOC-DISCIPLINE.md` D5 行与细则（指针 + 两路写面摘要，不复述判据——D2）。
- **产品面（实施轮，eng-coder）**：`thincoder-core/prompts/` 五档（`discipline-engineering.md` ∥ `persona-engineering.md` ∥ `discipline-normal.md` ∥ `persona-eng-designer.md` ∥ `persona-eng-coder.md`），**无 `.mjs`**。
  - **三个 `.mjs` 不在本批改动面**：`thincoder-core/agent-tools/advisor-settle.mjs` ∥ `thincoder-core/agent/write-gate.mjs` ∥ `thincoder-core/agent/dispatch.mjs`。`batch` 段写不进扫面与批档路径 `write` / `edit` 整档拒都是既有行为，三档都没有要改的实体。设计档 §3.1 记同一条，两处同口径。
  - **其中的 D3 提示词层**：`thincoder-core/prompts/discipline-engineering.md` 的 D5 行须照抄设计档 §2.20 的新逐字块；提示词面 = 产品代码，实施席落，本席不改。
- **测试**：单测档 = `docs/batches/2026-11-10-p1-2-micro-batch-cost.test.mjs`（随批收口删除），跑法 = `node --test docs/batches/2026-11-10-p1-2-micro-batch-cost.test.mjs`；机检覆盖 R41 ①∥④、R43 ①–④（② 由 `freeze-window-reading` 取证）。R41 ②③ 由收口读者判、R42 由评审判，不制造机检探针。全量套件不在本批验收面（父侧收口跑一次）。
- **集成面 = 零行**：`batch` 段写照写与批档路径 `write` / `edit` 整档拒都是现状，本批无业务可观察结果被改；按 RTM 三问作答 = 破 0 / 冗余 0 / 缺 0（逐行理由住设计 §9 末块）。
- **档级结论**：跨面（设计面 `.md` + 产品面提示词同批）；改动面无 `.mjs` ⇒ 500 行软线不触发、无拆分义务。落笔顺序 = 设计面先落 → 评审 → 产品面同批落地（同设计 §3.1）。

### 验收对照

判据住设计档 §5 的 R41 ∥ R42 ∥ R43（本节不复制读数）。需求侧一一对应：D1 → R41、D2 → R42、D3 → R43。

### 关键决策（含被拒）

1. **微批判据写成四项合取，不取「文件数 ≤ N」的单一阈值**（设计 §2.19）：单靠文件数，一份单档的行为改动（改一个阈值、加一条拒文）照样过——那正是要防的「借微批躲设计」。
   被拒：① 只按文件数；② 按「改了多少行」——行数不是语义，一行的判据改动比十行的措辞贵。
2. **记录义务分两档，不取「全部收口」**（设计 §2.18）：决定与当轮修延后即失真（压缩吃掉决定、第二版本并立）。被拒：全部收口。
   也不取「全部当轮」：那会把产品工作挤到记录之后（R6 的实测结论）。
3. **冻结面收窄到「被审内容」，不取「按节冻结设计档」**（设计 §2.20）：设计评审读设计档全文，没有哪一节可省——按节冻等于放一条改动被审内容的臂。被拒：设计档按节放行。
4. **批档整档 `write` 仍冻**（设计 §2.20）：门读不出它动哪一段。被拒：放宽成「大概没动 §2」的探测式放行——那是每轮赌一次被审对象没变。

### 上抛项

1. **[已裁 2026-11-10 · 三层同批改]** 同一条规则的三层必须同批改（D11）。落笔分工：设计面两档**本笔已落**（`docs/core/design/ADVISOR-GUARDS.md` §5 ∥ `docs/core/design/DOC-DISCIPLINE.md` D5 行与细则），提示词面 `thincoder-core/prompts/discipline-engineering.md` 的 D5 行随产品面由实施席同批落。
2. **[已裁 2026-11-10 · 主 agent 落笔]** D3 的第四层（需求档）已同口径改：`docs/core/requirements/ENGINEERING-MODE-V2.md` §13.1 的 D5 行读「评审在途不改**被审内容**（设计档整档 ∥ 批次档 §1 ∥ §2；批档 §3–§6 的段面写照写。改了被审内容 = 评审对象已变 → stale，token 不签发）」。四层（需求档 ∥ `docs/core/design/ADVISOR-GUARDS.md` §5 ∥ `docs/core/design/DOC-DISCIPLINE.md` D5 ∥ 提示词 D5 行）同口径；提示词面那层随产品面由实施席落。
3. **[上抛·知会]** 本批不新增机检门：微批四项由评审读，`test/RTM.md` 的检索只是判据 ① 的取证动作。若日后要机检（例如扫 §1 ∥ §2 的 `微批` 标记），另立批。
4. **[上抛·知会]** §1 记的 `库外 = B 类` 与本批实测一致：改动面全是仓内提示词与设计档，无外部断言。

### 修轮（2026-11-10 · 存量锚清理 + §2.20 收口）

门读数：`doc_check({mode:"gate", docs:[三档]})` ⇒ 首行 `DOC-CHECK GATE: PASS`，锚 ∥ 段两类各 0 条（修前 = 锚 9 条）。

九条存量锚的处置（逐条 = 判据 → 改法，都在本轮声明面内就地修）：

1. `docs/core/design/ADVISOR-GUARDS.md` 的「当批单测」句：宿主档写成具体批内单测档名（收口已删）⇒ 删指针留事实，「该批档同目录同名的改面单元测试档，随批收口删除，故此处不写死路径」。
2. 同档注入面那句：原路径形（相对 `cwd`、带目录段，仓内无该档）⇒ 占位形 `<cwd>/.thincoder/advisor.md`（运行期读的档，仓内不存在，写成实路径必判悬空）。
3. `docs/core/design/DOC-DISCIPLINE.md` 的 `## 1. 文档更新纪律` 节里那条依据句（引 `codeSpans(scan).filter(isExecutableSpan)`，反证 = §3.28 的 DD-206）：引文按 `thincoder-core/doc-check/anchors.mjs` 现行代码逐字取，定位词 = 节标题 + 所引符号，不用行号。
4. 同档 DD-71 行：两点名已退役探针档 ⇒ 改为「已退役的锚 / 行宽探针档」。
5. `docs/core/design/DOC-DISCIPLINE.md` §3.23 条目 W 的依据句：引文按 `thincoder-core/agent-tools/batch-gate.mjs` 现行代码逐字取「const aligned = drift === 0」（同档 `drift = Math.abs(lines.length - hits.length)`，断言语义不变）；定位词 = 节标题 + 符号，不用行号。
6. 同档零落仓判据句：运行期探针档名（已删）⇒ 改为「全仓零运行期探针档残留」。
7. 同档 `status` 门文案回归锁：`subagent-panel.mjs` 同名两处 ⇒ 写盘上既有区分形全路径 `thincoder-core/agent-tools/subagent-panel.mjs`。
8. 同档 ③ 族零 diff 判据：`docs/TODO.md` 与其已删的归档件并列 ⇒ 只留 `docs/TODO.md` 一行（归档件不在盘，判据对它恒空）。
9. 同档 A-DD40 零误伤清单与可跑形：批内单测档名（收口已删）两处 ⇒ 改为「本批改面单元测试档（名随批次档，收口已删）」。

§2.20 判据副本收成一行指针（单源 = `docs/core/design/ADVISOR-GUARDS.md` §5 的（d）），判据句不复制。

### 修轮 2（评审第 1 轮 · 13 条逐条处置）

**D3 的现行口径**（住设计 §2.20 ∥ `docs/core/design/ADVISOR-GUARDS.md` §5）：批档面的写不在冻结扫面内（现状，非本批新增，依据 = 上节「机制要点」D3 那条）；设计档整档那一半仍拦、判据零改；批档 §1 ∥ §2 是**纪律**不是门。

**逐条处置**

| # | 处置 | 落点（改了什么） |
|---|---|---|
| 🔴1 | 已改 | 设计 §3.1 补 `thincoder-core/agent-tools/advisor-settle.mjs`（改造 + 档位结论）；`thincoder-core/agent/write-gate.mjs` 行改为只加一格入参；量法与拆分方案补全 |
| 🔴2 | 已改 | 设计 §9 末补「破 0 / 冗余 0 / 缺 0」块，逐行点名 27-1 ∥ 14-1 ∥ 14-2 ∥ 14-8 的断言与不破理由 |
| 🟡3 | 已改 | 设计 §2.19：① 的判法按面分两支、写明「必要条件不是充分条件」；④ 的取证 = 逐条两行原文 |
| 🟡4 | 已改 | 设计 §2.18 ∥ §2.19 ∥ §2.20 各补「最相近先例」行；§2.20 的先例批编号如实记为不可考 |
| 🟡5 | 已改 | 四节各补「公开源核查」句（§2.18 ∥ §2.19 ∥ §2.20 ∥ `docs/core/design/ADVISOR-GUARDS.md` §5） |
| 🟡6 | 已改 | 设计 §3.1 逐档档位结论 + 量法 + 拆分方案分两半 |
| 🟡7 | 已消解 | 段面不进变更记账（`noteMutations` 只记序号与路径）⇒ 陈旧侧不需段面判定；写进设计 §2.20，并收正 `docs/core/design/ADVISOR-GUARDS.md` §11 边界句 |
| 🟡8 | 已改 | 修轮 1 两处依据句改成「节标题 + 所引符号」定位（`docs/core/design/DOC-DISCIPLINE.md` 的 `## 1. 文档更新纪律` 节 ∥ §3.23 条目 W），行号不再作定位词 |
| 🟡9 | 已消解 | 现行口径下没有分支场景；`docs/core/design/ADVISOR-GUARDS.md` §5（d）与设计 §2.20 记的是现状陈述 |
| 🟡10 | 已改 | 「受影响文件与测试覆盖」的测试一条给出运行命令形 `node --test docs/batches/2026-11-10-p1-2-micro-batch-cost.test.mjs` |
| 🟡11 | 已改 | 射程表单源定为 `docs/core/design/ADVISOR-GUARDS.md` §5（a2）；该节不再指向 §2.20 取表形，`docs/core/design/DOC-DISCIPLINE.md` D5 只留指针 |
| 🔵12 | 已改 | 「历史 delta 块不追改」移到设计 §9 段首，覆盖本节全部历史块 |
| 🔵13 | 已改 | 设计 §2.19 补固定句：§2 第四项必写「集成 delta = 零行——判据 ① 的推论，不是豁免」 |

**集成面**：破 0 ∥ 冗余 0 ∥ 缺 0，逐行理由住设计 §9 末块。本批不改任何业务可观察结果——`batch` 不在冻结扫面内是现状，设计档那一半零改。

### 修轮 3（评审第 2 轮 · 6 条逐条处置）

| # | 处置 | 落点（改了什么） |
|---|---|---|
| 🔴1 | 已改 | 设计 §3.1 三行 `.mjs` 改为「不在本批改动面」并给理由；§2「受影响文件」删掉「`freezeWindowConflict` 加一格入参」那半句 |
| 🟡2 | 已改 | 两张清单收成一份：设计 §3.1 = 4 档设计档 + 5 档提示词；§2 = 同 4 + 同 5，逐档同名同数 |
| 🟡3 | 已改 | 射程表单源归 `docs/core/design/ADVISOR-GUARDS.md` §5（a2）；设计 §2.20 的四列表降为一行射程摘要 + 指针，不再复述表 |
| 🔵4 | 已改 | 设计 §2.19 判据 ④：每对两行原文必带定位（档 + 节标题或符号名），缺定位同判不成立 |
| 🔵5 | 已改 | 实读 `index.publicRepos` = `["../.thincoder","../thincoder.com"]`，`docs/core/design/ADVISOR-GUARDS.md` 五处 `= []` 换成现值 |
| 🔵6 | 上抛 | 净效果句落设计 §2.20 末块；§6 收口行由父侧落（本席无 §6 笔权），成句见下第 5 条 |

**🔴1 的复核读数（§9 的「破 0」前提改完还站不站得住）**：站得住，且从「据称零改」变成「盘上零改」——三档 `.mjs` 一删，破 0 不再依赖任何行为断言。三条实读：

- `thincoder-core/agent/helpers.mjs` 的 `FILE_MUTATORS` = `["write","edit","insert_after","apply_patch","delete","hashline_edit"]`，无 `batch`。
- `thincoder-core/agent/dispatch.mjs` 的冻结分支 = `if (FILE_MUTATORS.has(toolCall.name) || toolCall.name === "file_ops")`，其内调用形 `freezeWindowConflict(agent, absPaths)`（两参）。
- `thincoder-core/agent-tools/advisor-settle.mjs` 的 `noteMutations` 记 `log.push({ seq: agent._mutationSeq, paths: [...new Set(list)] })`——无段面字段。

**🔵5 的对齐读数**：`manifest` 实读 `index.publicRepos` = `["../.thincoder","../thincoder.com"]`；两处声明源（`.thincoder` 931 份 `.md` ∥ `thincoder.com` 9 份 `.md`）按 `冻结窗口` ∥ `freeze window` ∥ `D5 freeze` ∥ `微批` 检索 = 0 命中 ⇒「已查无」的结论不变，变的只是取值。

**上抛项（第 3 轮起）**

5. **[上抛·知会]** §6 收口行建议落这一句（🔵6）：「D3 净效果 = 四层口径写定 + 两处如实记录；设计档整档拦面零改、批档面本不在冻结扫面内 ⇒ 本批未改任何一道门的射程」。§6 是父侧段。
6. **[上抛·知会]** 本批仍不新增机检门（承上抛项 3）：微批四项由评审读，`test/RTM.md` 的检索只是判据 ① 的取证动作。

### 修轮 4（评审第 3 轮 · 5 条逐条处置）

| # | 处置 | 落点（改了什么） |
|---|---|---|
| 🔴1 | 已改 | 设计 §3.1「拆分方案」后半只留 `thincoder-core/prompts/**`（5 档，逐档 = 同节表格那五行）；三档 `.mjs` 从后半删除；「`*.mjs` 三档均在软线内，不新增拆单义务」整句删掉，换成「改动面无 `.mjs` ⇒ 两半都无拆分义务」（判的档都在改动面上）。同节自检：表格「不在本批改动面」三行 + 「改动面无 `.mjs`」+ 「零代码行」三者同值，只剩一套说法 |
| 🟡2 | 已改 | 本节「本批自身不是微批」句：`5 档` → `9 档（设计档 4 + 提示词 5）`，与两张清单同数（设计面 4 ∥ 产品面 5） |
| 🟡3 | 已改 | 设计 §6 末块那格：删掉「`write` 整档到批档路径」半句（批档不在 `docAbs` ⇒ 这格写不出「拒」），只留设计档那一半，并点明判据 = `write` ∥ `edit` 命中 `docAbs`（单源 = `docs/core/design/ADVISOR-GUARDS.md` §5（d））；批档那一格明写「不进本行，由上一行记（纪律，不是门）」 |
| 🔵4 | 已改 | `docs/core/design/ADVISOR-GUARDS.md` §2 第 7 条公开源核查行末：删掉后一枚「（实读）」，留「（实读 2026-11-10）」 |
| 🔵5 | 已改 | 见下第 7 条上抛项：值本身本轮由设计席 `manifest` 复读（同值），但设计面那行对评审仍是 unverified ⇒ 实施轮复读并落读数 |

**🔴1 的复核读数**（同节是否只剩一套说法）：`docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` §3.1 现三处同值——表格三行「不在本批改动面」∥「改动面无 `.mjs` ⇒ 500 行软线（只判 `.mjs`）不触发」∥「所以 D3 的交付 = …**零代码行**」；「拆分方案」两半 = 4 档设计档 + 5 档提示词，与表格九行逐档同名同数。本节「落笔顺序 = 设计面先落 → 评审 → 产品面同批落地（同设计 §3.1）」一句由此与 §3.1 同指一份清单。

**上抛项（第 4 轮起）**

7. **[上抛·知会]** `index.publicRepos` 的现值 = `["../.thincoder","../thincoder.com"]`：设计席本轮以 `manifest` 复读（2026-11-10）得同值，故盘上各「公开源核查」行的取值站得住；但 `PROJECT-MANIFEST.json` 不在评审面 ⇒ 那几行对评审是 unverified。请实施轮以 `manifest` 复读一次、把读数（值 + 实读日期）落 §5，让行末的「（实读 <日期>）」成为可复跑的读数而不是一句自述。

### 修轮 5（父侧点名三件 · 死指针 + 提示词字面 + 上抛改记）

- **🔴1 死指针已改**：`docs/core/design/DOC-DISCIPLINE.md` D5 细则「不属本条射程的」那条，原指「`docs/core/design/ADVISOR-GUARDS.md` §5 的段面放行臂」——那条臂不存在（（d）现文逐字「无放行臂可开」）。
- **改成什么**：「批档 §3–§6 的写（被审内容之外——**没有判据，也没有放行臂**：批档面不在冻结扫面内，冻结只在 `FILE_MUTATORS` 与 `file_ops` 上组装，`batch` 不在集内 ⇒ 那几段是纪律面，不是「有臂在放行」。依据 = `docs/core/design/ADVISOR-GUARDS.md` §5（d）。）」
- **为什么这么写**：批档那一格从来是纪律不是门。写成「有判据」让读者以为背后有人拦，而实际拦不住——这正是本轮要清的那类残留。
- **🟡2 提示词字面已定死**：住设计档 `§2.20` 新增块「提示词面那一层的目标字面（逐字——实施席照抄，不自拟）」，句在围栏内逐字给出。
- **句里三件齐**：设计档整档机制拦 ∥ 批档 §1 ∥ §2 纪律守（批档不在冻结扫面内）∥ 批档 §3–§6 在途期照写。
- **整行长度**：252 字符（读数 = `node` 量该句；阈值 300 = 提示词面逐行判，留 48 字符余量）。
- **`§3.1` 同步**：提示词那一行改成「D5 行照抄 `§2.20` 的「提示词面那一层的目标字面」块（逐字，不自拟）」——实施轮不再自拟英文句。
- **🟡3 需求层父侧已改，本席不改**：`§3.1` 新增「第四层之一（父侧笔，不在本席改动面）」一行；需求档本席零 diff。
- **上抛项记账**：「需求档 §13.1 的 D5 行缺『机制拦 ∥ 纪律守』半句」一条 = **父侧已改（2026-11-10）**；四层现三层同形（需求档 ∥ `docs/core/design/ADVISOR-GUARDS.md` §5 ∥ `docs/core/design/DOC-DISCIPLINE.md` D5），剩提示词层随实施落。

**四层逐层 grep（`放行臂 ∥ 段面 ∥ 被审内容`）**

量法 = 四档各跑一次内置 `grep`（模式 = 三串取并）；判定分三类：本条规则的现行陈述 ∥ 别的机制同名 ∥ 残留。

| 层 | 命中 | 判定 |
|---|---|---|
| 设计档 `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` | 18 | 属本条 14 处（`§2.20` 全节 · `§3.1` 两处 · `§5` R43 · `§7` 边界）+ 同名不同义 4 处；**残留 0** |
| 机制权威 `docs/core/design/ADVISOR-GUARDS.md` | 18 | 全为现行陈述（（a1）–（d）· A-AG7 · `§11`）；其中（d）「无放行臂可开」= 死指针的源头；**残留 0** |
| 纪律层 `docs/core/design/DOC-DISCIPLINE.md` | 18 | 属本条 6 处（D5 行 + 细则五条）；另 12 处的「段面」= 写段面 ∥ 阶段面（文档机检门的判面族）+ 一处 `subagent-freeze.mjs` 代码坐标；**残留 0** |
| 提示词 `thincoder-core/prompts/discipline-engineering.md` | 2 | 1 处别义（`read as a freeze`）；1 处 = 现行 D5 旧句，待实施轮按 `§2.20` 字面替换 ⇒ **死指针残留 0**，待改 1 处属实施面 |

**门读数**：`doc_check({mode:"gate", docs:[两档]})` ⇒ 首行 `DOC-CHECK GATE: PASS`，段判 0 条；另报「登记未命中 7 条」（manifest 的假阳登记对不上现文，未影响 verdict）。

### 修轮 6（用户裁定 · D5 两条写面与代码对齐）

| 层 | 改动 | 现在的判据 |
|---|---|---|
| 主设计 `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` | §2.20 全节重写；§3.1、R43、§6、§7、§9 同拍 | 三行写面表分开：设计档 `write` / `edit` 整档拒；批档 `batch` 段写只受纪律；批档路径 `write` / `edit` 整档拒 |
| 机制权威 `docs/core/design/ADVISOR-GUARDS.md` | §5 机制复核、（a2）、（b）、（c）、（d）与 A-AG7、§11 同拍 | 设计档走 `docAbs`；批档走 `entry.batchDoc ?? entry.run?.batchDoc`；机制只看路径，不看段 |
| 纪律层 `docs/core/design/DOC-DISCIPLINE.md` | D5 行与细则同拍 | 「没有段级机制判据、只有纪律」只用于 `batch` 工具；新增文件写反例，§3–§6 也照拒 |
| 提示词目标字面 | §2.20 围栏块重写 | `batch` 段写与 `write` / `edit` 文件写分别成句；目标行 290 字符，量法 = `node` 取 `.length`，阈值 300 |

**同类扫尾**：`docs/core/design/PROMPT-SYSTEM.md` §8.2 的「冻结面 = 被审内容（非整档）」也把段面纪律写成了全称，本轮一并改成「冻结面按写面分路」，指针归 `docs/core/design/ADVISOR-GUARDS.md` §5（a2）∥（d）。这是本轮声明清单外的第五份设计档，改动理由 = 同一规则的落点登记不能继续教旧口径（D11）。

**逐处复扫**：内置 `grep` 以 `批档面的写不在|批档面不在|批档不在冻结扫面|批次档不在冻结扫面|拦不到批档|没有机制拦截|批档那一格本来就没有门|没有判据，也没有放行臂|无放行臂` 扫三份主设计／机制／纪律档，均零命中。再以 `冻结扫面|不在扫面|没有门|没有判据|放行臂|纪律不是门|不是一道门|非整档` 扫四份设计档：剩余相关命中只住 `§2.20`、ADVISOR §5／A-AG7、DOC-DISCIPLINE D5 与 §9 的 RTM 说明，且每处都明示 `batch` 工具路；其余命中属写门、工作区窄口等别义，未改。

**上抛项**

8. **[上抛·知会] 需求档由父侧落**：`docs/core/requirements/ENGINEERING-MODE-V2.md` §13.1 的 D5 行仍有全称句「批档面的写不在冻结扫面内」。建议两句逐字：「设计档与批档路径的 `write` / `edit` 在评审在途期都按整档路径机制拦，不分段。`batch` 段写不在冻结扫面内：批档 §1 ∥ §2 由纪律守，§3–§6 照写。」本席未改需求档。
9. **[上抛·知会] 实施席后续两件**：把 §2.20 的新英文块逐字落到 `thincoder-core/prompts/discipline-engineering.md`；单测注释与用例名按 R43 的新序号对齐——① = `batch` 段写、② = 批档路径文件写、③ = 设计档文件写、④ = 四层口径。本席未改提示词或测试。

## §3 设计评审（评审子代理）
**状态行**：评审通过



### 轮次 1（评审子代理）

| # | 严重度 | 状态 | 证据（指针） |
|---|---|---|---|
| 1 | 🔴 | 未处置 | `docs/core/design/ADVISOR-GUARDS.md` §5（d）「冻结窗判据 `inflightDesignReviewConflict`（`thincoder-core/agent-tools/advisor-settle.mjs`）现只看路径」 vs `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` §3.1 行「冻结窗判据按 `toolName = "batch"` + `args.action` ∥ `args.segment` 细分」——同一笔细分点名两个宿主档；`thincoder-core/agent-tools/advisor-settle.mjs` 不在受影响文件表内，也未过档位判定 |
| 2 | 🔴 | 未处置 | `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` §9 无 D1–D3 的 delta 块；`docs/batches/2026-11-10-p1-2-micro-batch-cost.md` §2 集成面「本批无任何业务可观察结果被改（工具行为只多一条放行臂」与本档 §5 R43 ①「`batch append §3` ⇒ 写入、本轮不判陈旧、pass 照发 token」相反；破行 ∥ 缺行未逐行给读数（「已由既有 27-1 ∥ 14-x 组覆盖其相邻面」未列断言） |
| 3 | 🟡 | 未处置 | `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` §2.19 判据 ① 判法「命中任何一行的断言 ⇒ ① 不成立」只朝一个方向成立；提示词/文档面在 RTM 无行（`docs/core/design/ADVISOR-GUARDS.md` §3.1 勘察「近面涉否：`test/` 下无档引用 `advisor-design` 的判据条数」）⇒ ① 对 D2 要防的改义恒绿，把关只剩无读数的 ④ |
| 4 | 🟡 | 未处置 | `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` §2.18 ∥ §2.19 全节无「最相近先例」行；§2.20 只有半句（引 `docs/core/design/BATCH-RECORD.md` 的先例句 + 偏差），无先例坐标与先例批——对照同档 §1.1 ∥ §2 第 6 条 ∥ §3.1 ∥ §12 各有一行完整形态 |
| 5 | 🟡 | 未处置 | `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` §2.18 ∥ §2.19 ∥ §2.20 与 `docs/core/design/ADVISOR-GUARDS.md` §5 全节无「公开源核查」句，而同档 §1.1 ∥ §2 第 6 条 ∥ §2 第 7 条 ∥ §12 各有一句 |
| 6 | 🟡 | 未处置 | `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` §3.1 只有「**档级结论**：本批跨级——设计面与产品面同批」这条面级结论，逐档无档位结论与量法；同档 §3 已记「**已越 500 软线、未到 650 拆分触发线**」于 `thincoder-core/agent/write-gate.mjs` |
| 7 | 🟡 | 未处置 | 陈旧侧输入未定义：同档 §2.20「陈旧判定同源：陈旧只看被审内容有没有被改」+ `docs/core/design/ADVISOR-GUARDS.md` §10 A-AG7「拦截判据与陈旧判定同源」均未说变更记账一条记录携不携段面，而 §11 又写「不改陈旧判定 / 变更记账 / 结算语义本体」；记账数据形 = unverified（本次只读文档） |
| 8 | 🟡 | 未处置 | `docs/batches/2026-11-10-p1-2-micro-batch-cost.md` §2 修轮以行号定位被改对象：「`docs/core/design/DOC-DISCIPLINE.md` 第 233 行依据句」∥「同档第 2193 行依据句」 |
| 9 | 🟡 | 未处置 | `docs/core/design/ADVISOR-GUARDS.md` §5（d）新增放行臂「目标段 ∈ {§3, §4, §5, §6} 且 `edit` 的锚落在该段之内 ⇒ 放行」无真实读数也无复现路径；同批 D2 有逐字实证（「今天有实证：为两处措辞（`PROMPT-SYSTEM.md` 的 E 组余数与两个判法格）」） |
| 10 | 🟡 | 未处置 | `docs/batches/2026-11-10-p1-2-micro-batch-cost.md` §2 只写「单测档 = 本批档同目录同名 `.test.mjs`（收口删除）」，未给 `node --test <档>` 命令形；设计面自身验收只住修轮一句 gate 读数 |
| 11 | 🟡 | 未处置 | 「射程表」两个自称住所：`docs/core/design/DOC-DISCIPLINE.md` D5 行「**射程表 + 「在途」下界定义 + 在途写入拦截**见 `docs/core/design/ADVISOR-GUARDS.md` §5」 vs 该档 §5（a2）「表形与代价段 = `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` §2.20」 |
| 12 | 🔵 | 未处置 | 「历史 delta 块不追改」作为不动声明成立（现状以 `test/RTM.md` 为准），但该句坐 `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` §9 中段，「上方各轮」不覆盖其后的历史块 |
| 13 | 🔵 | 未处置 | 同档 §2.19 把集成测试设计整项从微批省掉（「**零行**——不是豁免，是判据 ① 的推论」）；理由在 ① 取证里，但批档 §2 四项不含一句零-delta 陈述，读档者看不到「为什么没有这一节」 |

VERDICT: changes-required
计数 = 🔴 2 · 🟡 9 · 🔵 2（合计 13 条）

### 轮次 2（评审子代理）

| # | 严重度 | 状态 | 证据（指针） |
|---|---|---|---|
| 1 | 🔴 | 未处置 | `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` §3.1 三行仍写被删机制的实体：「`noteMutations` 的记录加一格 `segments`（现记 `{seq, paths}`）；`reviewIsStale` 的 design 分支跳过「批档路径 ∧ 段 ∈ §3–§6」」∥「本批只加一格入参」∥「Phase 1 把 `toolName` ∥ `args` 传给 `freezeWindowConflict`」，`docs/batches/2026-11-10-p1-2-micro-batch-cost.md` §2 受影响文件并列「（`freezeWindowConflict` 加一格入参）」——与同档 §2.20「记录里没有段面，陈旧侧也就不需要段面判定」·`docs/core/design/ADVISOR-GUARDS.md` §5（d）「无放行臂可开」·§5（d）「自然无段面判定」·§10 A-AG7·§11「无段面字段」·同档 §5 R43 ① 两版并立；批档 §2 状态行却称「D8 残句删净（放行臂口径盘上零留）」 |
| 2 | 🟡 | 未处置 | 改动面两张清单：批档 §2 产品面 = 五档 prompts + 一个 `.mjs`；设计 §3.1 = 三个 `.mjs` + 四类 `.md` |
| 3 | 🟡 | 未处置 | `docs/core/design/ADVISOR-GUARDS.md` §5（a2）「射程表单源 = 本节（a2）」vs `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` §2.20「被审内容（判据的锚）」四列表——射程面两写（同口径、非矛盾） |
| 4 | 🔵 | 未处置 | `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` §2.19 判据 ④「逐条列两行原文：改前这一句说什么 ∥ 改后说什么（一处一对）」——一对不带定位词，评审无法把一对钉回改动处 |
| 5 | 🔵 | 未处置 | 公开源读数分歧：`docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` §1「`index.publicRepos` = `["../.thincoder","../thincoder.com"]`」vs `docs/core/design/ADVISOR-GUARDS.md` §1.1「`index.publicRepos` = `[]`」（现值 unverified——manifest 不在评审面） |
| 6 | 🔵 | 未处置 | D3 的净效果 = 四层口径写定；批档面本不在冻结扫面内、设计档整档冻零改（收口宜写明这一句） |

已核通过的处置（逐条）：

- 🔴2：§9 末块破 0，逐行点名 27-1 ∥ 14-1 ∥ 14-2 ∥ 14-8。
- 🟡3：判据 ① 已写成必要条件。
- 🟡4：三节先例行在位；§2.20 先例批如实记不可考。
- 🟡5：四节公开源核查句在位。
- 🟡6：逐档档位结论 + 量法；`thincoder-core/agent/write-gate.mjs` 已改判软线内；`thincoder-core/agent/write-gate-ledger.mjs` 越软线那行仍在 §3 表。
- 🟡8：行号定位改「节标题 + 所引符号」。
- 🟡10：给出 `node --test <档>` 命令形。
- 🟡11：射程表单源声明在位。
- 🔵12：§9 段首覆盖「下面每一块」。
- 🔵13：§2.19 零-delta 固定句在位。
- 四处同口径：§2.20 ∥ §5 ∥ A-AG7 ∥ D5 成立，唯一的第二版是 §3.1 那三行（第 1 条）。

VERDICT: changes-required

计数 = 🔴 1 · 🟡 2 · 🔵 3（合计 6 条）

### 轮次 3（评审子代理）

| # | 严重度 | 状态 | 证据（指针） |
|---|---|---|---|
| 1 | 🔴 | 未处置 | `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` §3.1「拆分方案」：**后半** = `thincoder-core/prompts/**` ∥ `thincoder-core/agent-tools/advisor-settle.mjs` ∥ `thincoder-core/agent/write-gate.mjs` ∥ `thincoder-core/agent/dispatch.mjs`，并写「`*.mjs` 三档均在软线内，不新增拆单义务」——与同节上文「**不在本批改动面的三个 `.mjs`**」「三档都不改」「零代码行」「改动面无 `.mjs` ⇒ …无档位结论可给、无拆分义务」两版并立；`docs/batches/2026-11-10-p1-2-micro-batch-cost.md` §2「落笔顺序 = 设计面先落 → 评审 → 产品面同批落地（同设计 §3.1）」把该版继承进来 |
| 2 | 🟡 | 未处置 | `docs/batches/2026-11-10-p1-2-micro-batch-cost.md` §2「**本批自身不是微批**：改动面 5 档」vs 同段两张清单 = 设计面 4 档 + 产品面 5 档（逐档点名）——同一个改动面两个数 |
| 3 | 🟡 | 未处置 | `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` §6 用例表「评审在途，`write` 整档到批档路径 … ⇒ 拒（冻结句逐字）」vs 同档 §2.20「**批档面的写不在冻结扫面内**」「批档那一格是**一条纪律，不是一道门**」∥ `docs/core/design/ADVISOR-GUARDS.md` §5（d）「**判据 = 设计档那一支，零改**：`write` ∥ `edit` 命中 `docAbs` ⇒ 拒」——该格的前置（批档在不在 `docAbs` 里）未写 |
| 4 | 🔵 | 已核（正当） | `docs/core/design/ADVISOR-GUARDS.md` 各「公开源核查」行现全为 `index.publicRepos` = `["../.thincoder","../thincoder.com"]`、`= []` 零命中；该改已在 `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` §3.1 的 ADVISOR-GUARDS 行「公开源读数收正」申报，且消掉的正是同档 §1.1 与设计 §1 的取值相反（同一事实两个值）⇒ 越出声明面正当；读值本身 unverified（`PROJECT-MANIFEST.json` 不在本轮评审面） |
| 5 | 🔵 | 未处置 | `docs/core/design/ADVISOR-GUARDS.md` §2 第 7 条「公开源核查」行「（实读 2026-11-10）（实读）」——同句两枚「实读」 |

其余五处已到位：射程表单源归 `docs/core/design/ADVISOR-GUARDS.md` §5（a2），§2.20 留「射程摘要（细节回（a2））+ 指针」；§2.19 判据 ④ 逐字要求「每对带定位 = 档 + 节标题或符号名」且缺定位同判不成立；两张改动清单两处同数同名；§2.20 末「净效果（交付的是什么）」在盘，§6 由父侧落。§9 破 0 与 R43 口径 = 「现状陈述，非本批新增」，证明形为 `FILE_MUTATORS` 无 `batch` ⇒ 与「零代码行」一致。

VERDICT: changes-required

计数 = 🔴 1 · 🟡 2 · 🔵 2（合计 5 条）

### 轮次 4（评审子代理）

**第 4 轮复核（上轮 1🔴 + 2🟡 + 2🔵 + 父侧补提 3 条）**

| # | 严重度 | 状态 | 证据（指针） |
|---|---|---|---|
| 🔴1 | 🔴 | 已消 | `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` §3.1 现文「**不在本批改动面的三个 `.mjs`**」+「改动面无 `.mjs` ⇒ 500 行软线（只判 `.mjs`）不触发」，表九行已无 `.mjs`；`docs/batches/2026-11-10-p1-2-micro-batch-cost.md` §2「**无 `.mjs`**」与「**三个 `.mjs` 不在本批改动面**」同口径；全档复扫「段面 ∥ 放行臂」只剩现状陈述（§2.20「记录里没有段面，陈旧侧也就不需要段面判定」·`docs/core/design/ADVISOR-GUARDS.md` §5（d）「无放行臂可开」·§11「无段面字段」），第三版 = 0 |
| 🟡2 | 🟡 | 已消 | 两张清单同数：`docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` §3.1 表九行（设计档 4 + 提示词 5）= `docs/batches/2026-11-10-p1-2-micro-batch-cost.md` §2「改动面 9 档（设计档 4 + 提示词 5）」；同节「拆分方案」两半 = 同 4 + 同 5 |
| 🟡3 | 🟡 | 已消 | §2.20「本节不复述射程表」+「射程摘要（细节回（a2））」；`docs/core/design/ADVISOR-GUARDS.md` §5（a2）「射程表单源 = 本节（a2）」 |
| 🔵4 | 🔵 | 已消 | §2.19 判据 ④「**每对带定位 = 档 + 节标题或符号名**」+「一对缺定位 ⇒ 同判不成立」 |
| 🔵5 | 🔵 | 已消 | `docs/core/design/ADVISOR-GUARDS.md` 五处「`index.publicRepos` = `["../.thincoder","../thincoder.com"]`（实读 2026-11-10）」，`= []` 零留 |
| 🔵6 | 🔵 | 已消（§6 句仍父侧） | §2.20「**净效果（交付的是什么）**」+「**不是「冻结窗变窄」**」；收口句 = 同轮上抛项 5 |
| 新增1 | 🔵 | 未处置 | `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` §5 R43 ③「另三层同批同口径」后列四件（`docs/core/design/ADVISOR-GUARDS.md` §5 ∥ `docs/core/design/DOC-DISCIPLINE.md` D5 行 ∥ `docs/core/requirements/ENGINEERING-MODE-V2.md` §13.1 与提示词 D5 行）——计数与列名差一（🔵，不阻断） |

VERDICT: pass
计数 = 🔴 0 · 🟡 0 · 🔵 1（阻塞 0）

### 轮次 5（评审子代理）

### 实施轮内部代码评审（advisor · code review）

对象 = 批内单测档 `docs/batches/2026-11-10-p1-2-micro-batch-cost.test.mjs` ∥ `thincoder-core/prompts/persona-eng-designer.md` 的修轮收尾条（父侧裁定：D5 行不落 · D1/D2 字面待父侧补）。

| # | 严重度 | 状态 | 证据（指针） |
|---|---|---|---|
| 1 | 🟡 | 未处置 | §2「覆盖 R41 ②∥③∥④、R42 四项负例与正例、R43 四格」 vs 单测档档头「NOT COVERED AT ALL — no machine face exists, and none is manufactured」（R41②③）与档内 R42 零用例；设计 §7「微批不多立机检门」支持不立探针 ⇒ 需改的是 §2 那句 |
| 2 | 🟡 | 未处置 | §2 上抛项 1「的 D5 行随产品面由实施席同批落」 vs `discipline-engineering.md` 现文「a doc under review is closed to edits」+ 单测 `43-3` 的 todo reason「blocked — the ruling suspends the D5 line until the design doc's wording is corrected」；父侧裁定在批档无落点（§1 无此行、§5 空） |
| 3 | 🟡 | 未处置 | 单测 `41-4` ∥ `43-3` 以 `todo` 吞两条现行必红读：`booked the same day` 仍存 `discipline-engineering.md` 与 `persona-engineering.md` 各一处、D5 行仍旧句 ⇒ `node --test` 退 0；档随收口删除 ⇒ 收口时这两条读数无存，须 §5 §6 点名 |
| 4 | 🔵 | 未处置 | `sweep-block` 对三行只比前缀（`expected` 逐行 `startsWith`）+ 只断言下一行为空 ⇒ 题名「verbatim」强于所证 |
| 5 | 🔵 | 未处置 | `persona-eng-designer.md`「Report the sweep as a reading」 vs 同档「a reading is that run's output, and it is not transcribed into any text」∥`persona-engineering.md`「The sweep is a check, not a reading」——同一词两义；字面 = 用户逐字令，改属父侧 |
| 6 | 🔵 | 未处置 | §2「R43 四格」 vs 设计 §5 R43 三格（①②③） |
| 7 | 🔵 | 未处置 | `sweep-block` 无设计 §5 判据对应（§5 只载 R41–R43）⇒ 本轮新落的修轮收尾条唯一证明住一个收口即删的档 |

已核通过（实读）：`FILE_MUTATORS` 无 `batch`；`dispatch.mjs` 冻结分支只在 `FILE_MUTATORS` ∥ `file_ops` 上组装；`freezeWindowConflict` 读 `entry.batchDoc ?? entry.run?.batchDoc`（单测夹具形 = 现行实现）；`thincoder-core/prompts/` 无子目录 ⇒ `promptHits` 覆盖面完整；单测档 197 行（软线不触发）；收尾条为该小节最后一条子弹、行宽 ≤ 300。

VERDICT: pass
计数 = 🔴 0 · 🟡 3 · 🔵 4

### 轮次 6（评审子代理）

> 状态行重置：第 6 轮打回（changes-required）· 上一轮状态行 = 评审通过 → 进行中 · 2026-11-10

### 实施轮代码评审 · D1 四处字面 + R41 ④ 活用例（advisor · code review）

| # | 严重度 | 状态 | 证据（指针） |
|---|---|---|---|
| 1 | 🔴 | 未处置 | 三档提示词的挂号句仍把「记一行」留在当轮：`discipline-engineering.md`「a debt found at any point … is recorded as a ledger row」+「in the round it is found and **settled at this batch's closeout**」·`persona-engineering.md`「in the round it is found and settle it at this batch's closeout」·`discipline-normal.md`「record it as a row in the round it is found」 vs 设计 `§2.18` 分档表「随批结清 · 本批新发现的债（实现 ∥ 评审 ∥ 勘察三面）挂号 · **收口前挂完**」与批档 `§2`「随批结清（新债挂号 …）」——D1 要改的时点没改，退役的只是一个词；R41 ④ 照绿 |
| 2 | 🔴 | 未处置 | `persona-engineering.md`「**Debts go on the list**」的「immediately landed as ledger rows, one per item」逐字仍在盘；设计 `§2.18` 把该句与「the rest get booked the same day」并列为「同形的即时强制」⇒ 同一义务在提示词面两个时点并立 |
| 3 | 🟡 | 未处置 | 单测 `41-4` 负半只扫「booked the same day」；设计 `§2.18` 点名的另两句不在扫描面 ⇒ 该格对第 1、2 条恒绿（扫描面窄于判据对象） |
| 4 | 🟡 | 未处置 | 批档 `§5` 状态行「单测 exit 0（pass 6 · todo 2）」∥ 读数表「单测 `41-4`（todo）」 vs 单测档 `41-4` 已无 todo、四处字面已落盘 ⇒ 读数须按 D12 重取（协调项） |
| 5 | 🔵 | 未处置 | `41-4` 正半断言 `promptHits("The closeout names the count")` 恰为两档 —— 措辞一律化即红，与规则无关 |
| 6 | 🔵 | 未处置 | `discipline-normal.md` 新句丢了原句「book it (tech todo)」的池属；同块新增「**The closeout names the count**」是否越设计 `§7`「普通模式只改挂号时点一行」= unverified（§5 只引首行） |
| 7 | 🔵 | 未处置 | ②③④ 三处「逐字」对父侧字面 = unverified（本轮上下文只到 ① 前两行）；`node --test` 无读数面（本轮只读工具） |

**已核通过（实读）**

| 判据 | 读数 |
|---|---|
| `doc_check(report, 三档提示词)` | 命中 0（行太长 0 · 段落 0 · 锚 0） |
| R41 ① 两条零改条目 | 逐字在盘：「A decision lands in the round it is made」·「Decisions land the same day」 |
| R41 ④ 词面 | 「booked the same day」全提示词面 0 命中 |
| `discipline-engineering.md` 新块 | 「**Four things do not wait for the closeout**」四项俱在 |
| 单测档 | 207 行（软线不触发）；`41-4` 已去 `todo` 且带正半 |

VERDICT: changes-required
计数 = 🔴 2 · 🟡 2 · 🔵 3（合计 7 条）

### 轮次 7（评审子代理）

**第 7 轮（复审：上轮 7 条逐条核）** —— 对象 = 四处挂号点改绑收口 · `Debts go on the list` 退役形 · 三档 D2 微批块 · 单测 `41-4` 加宽。

| # | 严重度 | 状态 | 证据（指针） |
|---|--------|------|--------------|
| 1 | 🔴 | 已修 | 四个挂号点均改绑收口：`discipline-engineering.md`「**before this batch's closeout**, and settled there」· `persona-engineering.md`「landed as ledger rows **before this batch's closeout**, one per item.」∥「**before this batch's closeout** and settle it there, naming the batch that takes it.」∥「rest are recorded **before this batch's closeout** and settled there」· `discipline-normal.md`「record it as a row **before the closeout of the batch that carries it**,」——「挂号属当轮」的残留写法已零命中 |
| 2 | 🔴 | 已修 | `persona-engineering.md`「**Debts go on the list**: undispatched / unfinished items of your own ⇒ landed as ledger rows **before this batch's closeout**, one per item.」；提示词面全文检索 `immediately landed` = 0 命中 |
| 3 | 🟡 | 已修 | 单测 `41-4`「for (const retired of ["booked the same day", "book it the same day", "immediately landed as ledger rows"])」+「assert.deepEqual(promptHits(retired), [])」 |
| 4 | 🟡 | 未处置（协调项，非缺陷） | 批档 `§5` 状态行「D5 行按裁定不落 · D1/D2 字面待父侧补 · 单测 exit 0（pass 6 · todo 2）」∥读数表「单测 `41-4`（todo）」+「**未达成**」vs 单测档 `41-4` 已无 todo、四处字面已落盘 ⇒ 交付报告须按 D8 删除该行并重取读数 |
| 5 | 🔵 | 已修 | `41-4` 正半改逐档 `includes` +「promptHits("before this batch's closeout").length >= 4」，不再钉死命中文件集 |
| 6 | 🔵 | 未处置 | `discipline-normal.md`「record it as a row **before the closeout of the batch that carries it**,」原句的池属「(tech todo)」未恢复（建议，非缺陷）；`§7` 边界比对因设计档可读面限定，本轮未取 |
| 7 | 🔵 | 未处置（unverified） | ②③④ 三处对父侧字面的「逐字」仍无读数面；`node --test` 本轮无执行面（只读工具），绿仍为 §5 自述 |

已核通过（本轮实读）：

- 单测档 `sweep-block` 三行逐字在盘、其后空行在盘 —— `persona-eng-designer.md`「The sweep after the fix (fix rounds, before you return)」块未被本轮插入打断。
- 三档 D2 微批块互不矛盾：设计席 ∥ 编码席均「four items」+「§9 integration delta = zero rows」，指针式未复述判据。
- `discipline-engineering.md`「**Four things do not wait for the closeout**」四项与「四」一对一；`discipline-normal.md`「`trigger` is one of three values」三项与「三」一对一。
- `same day` 残留仅 `persona-eng-designer.md`「Decisions land the same day」= R41 ① 零改项，单测 `41-1` 覆盖。
- 「before this batch's closeout」命中 4 处 = 单测断言值。

计数 = 🔴 0 未处置 · 🟡 1（协调项）· 🔵 2（建议/unverified）

结论：通过

### 轮次 8（评审子代理）

对象 = 用户点名的三处提示词定点修正（不含此前批次发现、D5 措辞及其他段落）。

| # | 严重度 | 状态 | 证据（指针） |
|---|---|---|---|
| 1 | — | 通过 | `thincoder-core/prompts/persona-eng-designer.md`「Two deliverables」：`Unassigned work belongs to another round` 精确检索 0 命中，指定整条已删除 |
| 2 | — | 通过 | 同档「Two deliverables」：`- **A micro-batch's §2 is four items, nothing else**: the entries (with the ①–④ evidence per change), the change face, the acceptance readings,` 位于编号 2「The design doc」之后、「Doc structure」之前，三行块完整 |
| 3 | — | 通过 | `thincoder-core/prompts/discipline-normal.md`「Book a debt」：`record it as a row **(tech todo)** **before the closeout of the batch that carries it**,`，归属词位置与顺序正确 |

补充读数：两档 `doc_check(mode:"gate")` 首行 `DOC-CHECK GATE: PASS`，0 段有问题。未发现问题。

VERDICT: pass
计数 = 🔴 0 · 🟡 0 · 🔵 0（合计 0 条）

### 轮次 9（评审子代理）

| # | 严重度 | 状态 | 证据 |
|---|---|---|---|
| 1 | 🔵 | 通过（无问题） | docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md §2.20 写明「机制按**路径整档**拦截，不按段放行」，并将「批档路径上的 `write` / `edit`」列为整档拒；docs/core/design/ADVISOR-GUARDS.md §5（a2）与 docs/core/requirements/ENGINEERING-MODE-V2.md §13.1 的 D5 行同口径，未见「批档面的写不在冻结扫面内」的全称误述 |
| 2 | 🔵 | 通过（无问题） | docs/core/design/DOC-DISCIPLINE.md §1 的 D5 行写「设计档与批档路径的 `write` / `edit` 都按整档拦截，不分段」；docs/core/design/ADVISOR-GUARDS.md §5 的（d）写「批档分支 = `entry.batchDoc ?? entry.run?.batchDoc`」，机制未误写成分段拦 |
| 3 | 🔵 | 通过（无问题） | docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md §2.20 提示词围栏块含「`batch` segment writes are discipline-only」与「`write` / `edit` to the record path are whole-file blocked, with no segment exception」，两条写路一致；该行逐字实数 290 字符，≤300 |
| 4 | 🔵 | 通过（无问题） | docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md §5 的 R43 四格依次为 `batch` 段写、批档路径 `write` / `edit`、设计档拦、四层同口径，与 §2.20 的写面表及 §6 三条对应用例一致 |
| 5 | 🔵 | 范围说明 | docs/core/design/PROMPT-SYSTEM.md §8.2 不在本次 documents 清单内，未纳入评审面、未作同步性判断 |

VERDICT: pass

计数：🔴 0 · 🟡 0 · 🔵 5（四项核查通过 + 一项范围说明）。

### 轮次 10（评审子代理）

| # | 严重度 | 状态 | 证据（指针） |
|---|---|---|---|

VERDICT: pass
计数 = 🔴 0 · 🟡 0 · 🔵 0（合计 0 条）

## §4 用户批准（主 agent）

## 用户批准

- **批准形态 = 整批授权**：用户 2026-11-10 16:11 指令「P0–P2 全部批次自动跑完，碰到问题现场修」，覆盖本批的评审点火与实施启动。
- **过程中两次用户直令已落地**：① 修轮收尾要再查同类并当场修（写入 `thincoder-core/prompts/persona-eng-designer.md`）；② 删掉自加的「Unassigned work belongs to another round」条（用户原话「我没说过『相似的活都别碰』」）。
- **两次前提更正已获用户知情**：「段面放行臂」不存在（需求档 D3 已更正）；「批档面不在冻结扫面内」只对 `batch` 工具成立（四层已按代码收正）。

## §5 实施记录（eng-coder）
**状态行**：实施完成（D5 行逐字落地 · 原 todo 转活并改名 43-4 · 单测 8 pass / 0 todo · doc_check PASS）



### 实施记录（eng-coder · 2026-11-10）

**交付面（本席实改档）**

| 档 | 改了什么 |
|---|---|
| `thincoder-core/prompts/persona-eng-designer.md` | 「Order-taking discipline (fix rounds)」小节末尾新增「The sweep after the fix」条（用户本轮逐字令，字面照抄；换行处置见下「字面照抄 ∥ 换行」） |
| `docs/batches/2026-11-10-p1-2-micro-batch-cost.test.mjs` | 新建：批内单测档（随批收口删除） |
| `docs/batches/2026-11-10-p1-2-micro-batch-cost.md` | 本段 §5 |

**零改档（§2 点名的其余四档提示词）**：`thincoder-core/prompts/discipline-engineering.md` ∥ `persona-engineering.md` ∥ `discipline-normal.md` ∥ `persona-eng-coder.md`。两条理由分列下两节，互不代替。

**裁定项一 · D5 行不落（父侧 2026-11-10 裁定）**

`discipline-engineering.md` 的 D5 行保持旧句，未替换成设计 §2.20 的逐字块。父侧裁定原文：「D5 那一行先不落（逐字句的先决条件还没成立）」。该档现逐字：

```text
5. **D5 freeze window** — a doc under review is closed to edits (editing it = the review object changed → stale, no token issued); gather the changes and enter them in one pass.
```

**裁定项二 · D1 ∥ D2 的字面属父侧之笔（本席不自拟）**

设计档给了「改什么」，没给「改成什么字」（唯一给了逐字块的两处 = §2.20 的 D5 句、`persona-engineering.md` 生命周期第 1 条——前者按裁定一暂停，后者早已在盘、本批零改）。父侧令「不要自拟」，故下列各处**原样未动**，逐条列名待父侧补字面。

| 档 | 条 | 现逐字（全文见下方围栏） | 要表达哪几条纪律 |
|---|---|---|---|
| `discipline-engineering.md` | 「Booking form (engineering mode)」 | 甲 | D1 全部四条 |
| `persona-engineering.md` | 「A new debt is work behind a precondition with a named event」 | 乙 | D1 全部四条 |
| `persona-engineering.md` | 「Escalated item」 | 丙 | D1 的 ①③④ |
| `discipline-normal.md` | 「Book a debt」 | 丁 | D1 的 ①③（普通模式只改挂号时点一行） |
| `persona-engineering.md` | 微批段（新写：宣告动作 ∥ 越界退回 ∥ 收口结清点名句） | 尚不存在 | D2 的 ①②③④⑤ |
| `persona-eng-designer.md` | 段写规则（新写：§2 四项形 ∥ 一次评审） | 尚不存在 | D2 的 ②③④ |
| `persona-eng-coder.md` | 段写规则（新写：§2 四项形 ∥ 一次评审） | 尚不存在 | D2 的 ②③④ |

现逐字（甲 ∥ 乙 ∥ 丙 ∥ 丁，各一整行）：

```text
甲  discipline-engineering.md · 4. **Booking form (engineering mode)**: a debt found at any point (implementation / review / exploration alike) within scope is **booked the same day** as a ledger row (`trigger` bare enum: `归批` / `条件` / `认账不排期` — batch name / condition sentence into `evidence`) or escalated to the parent.
乙  persona-engineering.md · 4. **A new debt is work behind a precondition with a named event** (in-scope review findings / stop-and-report output / doc drift) ⇒ book it the same day, naming the batch that takes it.
丙  persona-engineering.md · 5. **Escalated item** (from a subagent / review / stop-and-report — in-scope items) ⇒ rule on the spot: correctable items get fixed in the same round; the rest get booked the same day (`trigger` + an expiry condition → `evidence`).
丁  discipline-normal.md · - **Book a debt** — work turns up a new defect / debt / doc drift **within scope** ⇒ book it (tech todo) **the same day**; **out-of-scope items are not booked** (scope test: inside this task book's scope ⇒ booked; beyond it ⇒ a suspicion, not a fact).
```

要表达的纪律（父侧补字面时的清单，单源 = 设计 §2.18 ∥ §2.19）：

- **D1 ①** 本批新债的挂号时点改「收口结清」：收口前挂完，不是当日。
- **D1 ②** 收口那一笔必须点名「本批新债 N 条 + 各自行号」或「本批无新债」；缺这句 ⇒ 收口不合格。
- **D1 ③** 批暂缓 ∥ 撤销 ⇒ 结清时点 = 退回那一刻，退回动作自带这句。
- **D1 ④** 当轮三项零降级，必须与「随批结清」并列写清：需求决定当轮落盘 ∥ 写域内小形项就地修 ∥ 状态声明与越界上抛同轮。
- **D1 ⑤** 范围外不挂号、`trigger` 三值、去重与家属行等既有句零改（普通模式只动时点一行）。
- **D2 ①** 微批标记由主 agent 在 §1 与 §2 首行宣告，并给 ①–④ 各一句取证（取证不是断言）。
- **D2 ②** 四项合取：零业务可观察结果变化 ∥ 改动面 ≤ 2 档 ∥ 每处一条会红的读数 ∥ 无语义面；任一不真即全链。
- **D2 ③** 评审是唯一否决面：一次评审、一行裁定；打回且属越界 ⇒ 摘标记、§2 补全，同一 diff 走全链（不重做）。
- **D2 ④** §2 只写四项（条目含 ①–④ 取证 ∥ 改动面逐档 ∥ 验收读数 ∥ 边界），且第四项必带「§9 集成 delta = 零行」那句。
- **D2 ⑤** 后验入口：§5 实改文件 ⊆ §2 点名清单，超出 ⇒ 收口记 §6「越界」，该批不得以微批收口。

**字面照抄 ∥ 换行处置（一处，须父侧知晓）**

用户给的块首行 318 字符，超提示词面「逐行 ≤ 300」的判据。`doc_check` 报告态实测命中 1 条「行太长」（该档第 62 行，判据机读），说明 318 字符的一行落下去过不了门。处置 = **措辞一字不改**，只在该句的自然断点（「—」之后）折行，块由 2 行变 3 行。折后逐行 = 198 ∥ 123 ∥ 254 字符。

两者不能都要：要一字不动的一行形，就得同时改「逐行 ≤ 300」这条判据；本席按「`doc_check` PASS 为准」取折行，把选择摆在这里。断点在句中，`sweep-block` 断言三行各自全等，故「折行」不是「改了措辞」的挡箭牌——原文每个字符都在盘上。

**Drift 四条（父侧点名，一条不省）**

1. 设计 `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` §2.20 的「它拦不到批档的写」，与 `docs/core/design/ADVISOR-GUARDS.md` §5（a2）的「批档不在冻结扫面内」——**只对 `batch` 工具成立，对 `write` / `edit` 不成立**。
2. 取证 = 两支代码 + 头注，逐字如下（并附一条可复跑读数）。
3. **D5 行按裁定未落**，等设计档改字（父侧转设计席）；本段「裁定项一」是这条裁定在批档上的落点。
4. 旧英文 `a doc under review is closed to edits` 眼下更接近事实——**那是巧合，不是依据**；不得记成「该行已正确」。

取证围栏：

```text
thincoder-core/agent/write-gate.mjs
  头注：批次档分支 = 同池条目 `run.batchDoc`（评审绑定批档在途时写批档 同样致 stale——被审文件集合流点）。
  代码：const batchDoc = entry.batchDoc ?? entry.run?.batchDoc
  代码：if (wantedSet.has(batchAbs)) return { id: String(entry.id), path: batchAbs }
```

可复跑读数 = 单测 `freeze-window-reading`：造一条 `{reviewType:"design", status:"running", batchDoc:<本批档绝对路径>}`，直调 `freezeWindowConflict` 打该批档路径 ⇒ 返回冲突对象（非 null）。同一文件另一条 `43-1a` 断 `FILE_MUTATORS` 无 `batch`、`batch*.mjs` 不调冻结判据 ⇒ 两支事实并存，不是一个错了。

**读数（命令 + 结果）**

| 判据 | 命令 | 结果 |
|---|---|---|
| R41 ① | 单测 `41-1` | pass —— 两条零改条逐字在盘 |
| R41 ④ | 单测 `41-4`（todo） | **未达成**（那是上一轮的状态；下一块已落，三串读数各 0）：`booked the same day` 当时 2 处（甲 ∥ 丙所在两档），待父侧 D1 字面 |
| R43 ③ | 单测 `43-3`（todo） | **未达成**：提示词 D5 行 ≠ 设计 §2.20 块（按裁定一暂停） |
| R43 ① | 单测 `43-1a` ∥ `43-1b` | pass |
| R43 ② | 单测 `43-2` | pass（先断反侧：无在途评审 ⇒ null；再断有在途评审 ⇒ 拒） |
| 修轮收尾条 | 单测 `sweep-block` | pass —— 三行全等 + 逐行 ≤ 300 + 撤回句不在盘 |
| 全档 | `node --test docs/batches/2026-11-10-p1-2-micro-batch-cost.test.mjs` | exit 0 · pass 6 · fail 0 · todo 2 |
| 文档机检 | `doc_check(mode:"gate")` | 首行 `DOC-CHECK GATE: PASS` |

**红侧读数（改前该失败的那条真失败）**

- `41-4`：改前 = 2 处命中，改后未变。本条就是「未做」的证据，不是绿。
- `43-3`：改前 D5 行 177 字符 ≠ 设计块 252 字符；本批未改 ⇒ 仍不等。
- `sweep-block`：改前该条不存在，锚点下一行是空行、再下一行是 `## Five-step workflow` 标题 ⇒ 断言必红。
- `43-2`：同一夹具先断言无在途评审 ⇒ null，再断言有在途评审 ⇒ 拒。只断「拒」的一条，在恒拒的实现里也绿——两面同绿才有意义。

**审计与评审轮次（终态 clean）**

- **内部背离审计**（explore，只读）：1 轮，判词 DEVIATIONS——🟡 3 · 🔴 0。三条 = §5 零行（本段补）∥ 五档提示词零落且批档未及对账（= 本段「零改档」与「未落清单」）∥ §2 测试覆盖声明与交付不符（§2 是父侧/设计席之笔，列入上抛）。审计席无执行面，取不到 `node --test` 读数，由本席补跑（上表）。
- **内部 advisor 代码评审**（`type="code"`）：1 轮，`pass`，7 条（🟡3 · 🔵4）。逐条处置：

| # | 判 | 处置 |
|---|---|---|
| 🟡1 | §2 覆盖声明 vs 实际交付 | 父侧/设计席之笔，列入上抛 |
| 🟡2 | §2 上抛项 1 仍命令落 D5 行，裁定在批档无落点 | 本段「裁定项一」即落点 |
| 🟡3 | 两条必红读被 `todo` 吞成绿，档随收口删除 | 上表逐条点名两个未达成读数；收口不得读成通过 |
| 🔵4 | `sweep-block` 只比前缀 | 已改逐行全等 + 撤回句缺席断言 |
| 🔵5 | 「reading」一词在同一角色面两义 | 用户本轮删掉那句，冲突随之消失 |
| 🔵6 | §2「R43 四格」vs 设计 §5 三格 | 父侧之笔，列入上抛 |
| 🔵7 | 修轮收尾条在设计 §5 无验收格 | 父侧二选一，列入上抛 |

- **修轮**：3 轮（同一条落字面三次 + 一次换行处置），每轮重跑单测与机检。
- **终态**：`clean` —— 单测绿、机检 PASS、本席可改项零未处置；四条父侧笔之项见上抛。

**决策披露表**

| # | 决定 | 依据 | 被拒的替代 |
|---|---|---|---|
| 1 | D5 行不落 | 父侧裁定 + 上「Drift」的代码取证 | 逐字落 ⇒ 把一句机制上不成立的 reason 写进提示词 |
| 2 | D1 ∥ D2 只出清单、不自拟英文 | 父侧硬规矩：自拟规范性提示词 = 替父侧把规则定了 | 自拟 ⇒ 规则由实施席单方定，无人批 |
| 3 | 换行不换字 | 提示词面逐行 300 判据（机检实测 1 条命中） | 一行 318 字符 ⇒ 门 REFUSED，与「PASS 为准」冲突 |
| 4 | 两条未达成判据用 `todo` 留形，不删不改绿 | 判据对象未落、读数要留 | 删两格 ⇒ 未达成被藏；改绿 ⇒ 假绿 |

**上抛**

- [上抛·知会] §2 两处笔（父侧/设计席）：① 「覆盖 R41 ②∥③∥④、R42 四项负例与正例、R43 四格」与实际交付不符（R41 ②③ 与 R42 无机检面，设计 §7 逐字「微批不多立机检门」）；② 「R43 四格」与设计 §5 的三格差一。
- [上抛·知会] 修轮收尾条在设计 §5 无验收格：要么设计 §5 补一格，要么 §6 收口行点名以 `sweep-block` 一次读数为证。
- [上抛·待裁] 设计 §2.20 与 `docs/core/design/ADVISOR-GUARDS.md` §5（a2）的那句待设计席收窄成两句（`batch` 工具 ∥ `write`-`edit` 路线）；D5 行随其后落。

### 实施轮 2（eng-coder · 2026-11-10 · D1 四处 + D2 三处字面落地）

**这一轮落的是四笔**，两笔是父侧本轮的判决、两批是父侧给的字面。

| # | 笔 | 内容 |
|---|---|---|
| 1 | D1 四处字面（父侧字面 ①②③④） | 三档提示词的挂号条整块换掉 |
| 2 | 裁决 ①：**设计侧不动、改我这边** | 四处「in the round it is found」改绑「before this batch's closeout」，原因 = 设计 §2.18 分档表写「收口前挂完」，字面把挂号提前到当轮 ⇒ 比设计更强，等于改了规则 |
| 3 | 裁决 ②：该条必须跟着改 | `persona-engineering.md`「Debts go on the list」的 `immediately landed as ledger rows` 整条替换 |
| 4 | D2 三处字面（A ∥ B ∥ C） | 微批判据（宣告 ∥ 四项 ∥ 越界退回）落 `persona-engineering.md`；§2 四项形落 `persona-eng-designer.md` ∥ `persona-eng-coder.md` |

**实改档（六档）**

| 档 | 改了什么 |
|---|---|
| `thincoder-core/prompts/discipline-engineering.md` | 「Booking form (engineering mode)」整块：2 行 → 9 行；本轮再按裁决 ① 把挂号那半句改绑收口 |
| `thincoder-core/prompts/persona-engineering.md` | 第 4 条「A new debt…」+ 第 5 条「Escalated item」+「Debts go on the list」三条按裁决改；新增微批块（6 行，在押批段末尾） |
| `thincoder-core/prompts/discipline-normal.md` | 「Book a debt」条 3 行 → 2 行（挂号改绑「before the closeout of the batch that carries it」） |
| `thincoder-core/prompts/persona-eng-designer.md` | 新增「A micro-batch's §2 is four items, nothing else」3 行（在「Two deliverables」第 1 条之后） |
| `thincoder-core/prompts/persona-eng-coder.md` | 新增同一条的读侧形 2 行（在「Boundary」段末） |
| `docs/batches/2026-11-10-p1-2-micro-batch-cost.test.mjs` | R41 ④ 由 `todo` 转活；负半按设计点名的三串加宽；正半改逐档断言 + 收口绑定计数 |

**哪些行照抄、哪些是本轮补的**

- ①②③④ 与「Debts go on the list」与 A ∥ B ∥ C：**全部照抄父侧给的字面**，一个字没改；唯一的动作是按 300 字符线在同一断点折行（见下「换行处置」）。
- 「改绑收口」那半句 = 父侧裁决 ① 给的短语（`**before this batch's closeout**` ∥ `**before the closeout of the batch that carries it**`），本席只负责把它放进原句位置，没有自拟任何新措辞。
- 本席只写了一处非父侧字面：单测档的注释与 R41 ④ 用例本体。判据字面 = 设计 §5 的 R41 ④，未自拟。

**落盘后的关键句（逐字摘引，完整块看档；单一权威 = 各自提示词档）**

```text
discipline-engineering.md 「Booking form (engineering mode)」
  …**within scope** is recorded as a ledger row
  **before this batch's closeout**, and settled there…

persona-engineering.md 「Debts go on the list」
  - **Debts go on the list**: undispatched / unfinished items of your own ⇒ landed as ledger rows **before this batch's closeout**, one per item.

persona-engineering.md 「A new debt…」∥「Escalated item」
  …record it as a row / **before this batch's closeout** and settle it there, naming the batch that takes it.
  …the rest are recorded **before this batch's closeout** and settled there (`trigger` + an expiry condition → `evidence`)…

discipline-normal.md 「Book a debt」
  …→ record it as a row **before the closeout of the batch that carries it**,
  and settle it there…
```

**读数（命令 + 结果）**

| 判据 | 命令 ∥ 量法 | 结果 |
|---|---|---|
| R41 ④ 绿侧 | `node` 字面扫 `thincoder-core/prompts/*.md`，串 = `booked the same day` ∥ `book it the same day` ∥ `immediately landed as ledger rows` | 三串各 0 命中 |
| R41 ④ 红侧 | 同一函数、同一三串，喂改前原文（三处旧句逐字取自本轮读档） | 各 1 档命中 ⇒ 三条断言都会红 |
| R41 ④ 正半 | 同一扫描 `The closeout names the count` ∥ `before this batch's closeout` | 2 档 ∥ 4 处（`discipline-engineering.md` 1 + `persona-engineering.md` 3），与断言值相符 |
| R41 ① | 单测 `41-1` | pass（「A decision lands in the round it is made」∥「Decisions land the same day」逐字在盘） |
| R43 ③ | 单测 `43-3`（todo） | **仍未达成**——D5 行按裁定不落；`todo` 诊断打出两侧逐行原文 |
| 全档 | `node --test docs/batches/2026-11-10-p1-2-micro-batch-cost.test.mjs` | exit 0 · tests 8 · pass 7 · fail 0 · todo 1 |
| 行宽 | `node` 逐行量五个落盘块 | 最长 275 字符（阈值 300，提示词面逐行判） |
| 文档机检 | `doc_check({mode:"gate", docs:[五档提示词]})` | 首行 `DOC-CHECK GATE: PASS` · 0 段有问题 |

**换行处置（措辞一字未改）**

父侧几块的首行超过提示词面「逐行 ≤ 300」的判据线，落盘时只在自然断点折行：`persona-eng-designer.md` 的微批条折一次、`persona-eng-coder.md` 的折一次、`persona-engineering.md` 的微批 ①④ 两条本身在 300 内未折。折后最长 275 字符。断点在句中，原文每个字符都在盘上。

**未落项（逐条点名）**

- **D5 行（D3 提示词层）**：按父侧裁定不落，等设计席改字（`#31` 那一轮评审）。现文仍是旧句；设计 §2.20 的目标块已在盘，两侧原文见单测 `43-3` 的 todo 诊断。
- **R41 ②③ ∥ R42**：无机检面——R41 ②③ 是收口与退回面的句子（父侧在 §6 写），R42 的四项由评审读（设计 §7「微批不多立机检门」）。本席不为它们制造探针。

**审计与评审轮次（终态 clean）**

- **内部背离审计**（explore，只读）：1 轮，判词 DEVIATIONS（3 blocking / 3 non-blocking）。处置：#1（`persona-engineering.md` 的 `immediately landed…` 残留）∥ #2（四处字面保留当轮挂号，与设计 §2.18 相反）= 同一件事的两面，本席按「措辞是父侧的笔」上抛而未自改 ⇒ 父侧本轮已两判并给字面，落地后清零；#4（§5 未写）由本块补；#3 ∥ #5 ∥ #6 为记述性提示。
- **内部代码评审第 1 轮**（`advisor` `type="code"`）：changes-required，7 条（🔴2 · 🟡2 · 🔵3）。两条 🔴 与审计同源（挂号时点 ∥ 残留句），🟡3（R41 ④ 负半只扫一串）∥ 🔵5（正半钉死命中集）当轮可改 ⇒ 已改；🟡4（§5 读数陈旧）= 本块补。
- **内部代码评审第 2 轮**（收敛轮，只核修项）：pass，0 阻断。剩 🟡4（§5 读数）由本块落；🔵6 ∥ 🔵7 为建议与核验面限制。
- **修轮**：3 轮（首轮按字面落 → 父侧裁决 → 改绑 + 补 D2 三处 → 评审收敛）。
- **终态**：`clean`——单测绿、机检 PASS、本席可改项零未处置；父侧笔项只有 D5 一行。

**决策披露表**

| # | 决定 | 依据 | 被拒的替代 |
|---|---|---|---|
| 1 | 四处照字面落，不自拟英文 | 提示词面 pen 规则：`discipline-engineering.md` 的 D1 派发表「Prompt content comes from the main agent, and eng-coder lands it as product code」 | 自拟 ⇒ 规则由实施席单方定，无人批 |
| 2 | D2 三处等到父侧给字面才落 | 同上；上一轮就此上抛过，本轮字面到齐才动笔 | 上一轮先写一版 ⇒ 后续按真字面重写，前一轮白费且盘上多一个中间版本 |
| 3 | 父侧裁决 ① 只改半句、不改整块 | 父侧给的是短语（`**before this batch's closeout**`）；冲突在挂号时点，不在其余字句 | 重写整块 ⇒ 把没争议的四条也动一遍，制造新 diff |
| 4 | 超 300 的行在同一断点折行 | 提示词面逐行 300 判据（机检实测） | 一行超长 ⇒ 门 REFUSED，与「PASS 为准」冲突 |
| 5 | 单测负半加宽到三串、正半加逐档断言 | 只断「旧串消失」的检查在整行被删时也绿；三串 = 设计 §2.18 点名的全部退役形 | 只扫 `booked the same day` ⇒ 另两句复发时恒绿（本轮就是实例） |
| 6 | `43-3` 仍留 `todo`，不改绿 | D5 行按裁定未落、判据对象未到 | 删 `/` 改绿 ⇒ 未达成被藏成假绿 |

**上抛**

- [上抛·知会] §2 的测试覆盖句（「覆盖 R41 ②∥③∥④、R42 四项负例与正例、R43 四格」）与实际交付仍不符：R41 ②③ 与 R42 无机检面，R43 是四格（①∥②∥③ + 本批新增的一格读数），§2 是设计席之笔。
- [上抛·知会] `discipline-normal.md` 的挂号条本轮不再带原句的池属「(tech todo)」——父侧字面如此，非本席删；同一档另一句「the pool takes only **user requirement points** — tech todos still go to the project tech-todo area」仍可反推。若要补，属父侧笔。
- [上抛·知会] 审计只记不列的观察：`persona-engineering.md` 的「its row lands in the round it settled」与「Frozen-record residue scan … book them on the spot」两处比新规则更早，但不矛盾（新句给的是截止点，允许更早）。若 D1 的本意是「取消当轮成本」，这两句下一步该一起收。

### 实施轮 3（eng-coder · 2026-11-10 · 三处定点修正）

本轮只改用户点名的两档、三笔，其余不动；D5 行仍未落。

1. **删除一条**：`thincoder-core/prompts/persona-eng-designer.md` 的「Two deliverables」段删除整条 `- **Unassigned work belongs to another round**…`，不补替代句。用户原话：「我没说过『相似的活都别碰』，这种话都是以前他自己加的。」
2. **挪动一条**：同段「A micro-batch's §2 is four items, nothing else」从编号 1 与编号 2 之间移到段末，三条文字逐字未改。
3. **补回归属词**：`thincoder-core/prompts/discipline-normal.md` 的「Book a debt」在 `record it as a row` 后紧跟 `**(tech todo)**`，位置按用户随后的纠正落地，其余不动。

**验证**：

- `node --test --test-name-pattern=sweep-block docs/batches/2026-11-10-p1-2-micro-batch-cost.test.mjs` → exit 0，pass 1、fail 0；`sweep-block` 仍绿。
- `doc_check({mode:"gate", docs:[上述两档提示词]})` → 首行 `DOC-CHECK GATE: PASS`，0 段有问题。
- 两档均已读回：删除、移位与归属词位置符合本轮指令。

**本轮审计与评审**：内部背离审计 1 轮 = PASS；内部 advisor 代码评审 1 轮 = pass，0 条未处置；终态 `clean`。

### 实施轮 4（eng-coder · 2026-11-10 · D5 行与 R43 新序号）

**本轮实改两档，均在声明面内**：`thincoder-core/prompts/discipline-engineering.md` 与 `docs/batches/2026-11-10-p1-2-micro-batch-cost.test.mjs`；另由本席写本段 §5。无声明外代码或文档改动。

- D5 行已按设计 §2.20 的围栏块整行逐字替换，未折行：

```text
5. **D5 freeze window** — in flight, design docs are whole-file blocked. `batch` segment writes are discipline-only: keep §1 ∥ §2 unchanged; §3–§6 stay writable. `write` / `edit` to the record path are whole-file blocked, with no segment exception: a write now would settle stale, no token.
```

- 原 todo 的 `43-3` 已转活，并按 R43 新序号改名为 `43-4`；断言保持为提示词 D5 行与设计 §2.20 目标块逐字相等，另断言两侧各仅一条目标行且行长不超过 300。
- 单测档头注释与用例名已同步：① `43-1a` ∥ `43-1b` = `batch` 段写；② `43-2` = 批档路径文件写；③ `43-3` = 设计档文件写；④ `43-4` = 四层口径中的提示词层逐字相等。
- 公开源声明复读：`manifest({action:"read", target:"D:\\teamcode\\thincoder"})` 于 2026-11-10 返回 `index.publicRepos = ["../.thincoder","../thincoder.com"]`。

**验证读数**

| 检查 | 命令 ∥ 工具 | 结果 |
|---|---|---|
| 全档单测 | `node --test docs/batches/2026-11-10-p1-2-micro-batch-cost.test.mjs` | exit 0；tests 8 · pass 8 · fail 0 · skipped 0 · todo 0 |
| D5 逐字相等 | 单测 `43-4` | pass |
| R43 ② 批档路径文件写 | 单测 `43-2` | pass |
| R43 ③ 设计档文件写及无窗口反侧 | 单测 `43-3` | pass |
| 语法检查 | `lint(full:true)` 对批内单测档 | Syntax OK |
| 文档机检 | `doc_check({mode:"gate", docs:["thincoder-core/prompts/discipline-engineering.md"]})` | 首行 `DOC-CHECK GATE: PASS`；0 段有问题 |

**内部审计与代码评审**

- 背离审计（explore，只读）1 轮：静态范围无偏差；审计席无命令执行入口，未签运行 PASS，本席已用上述实际运行读数补足。实改文件机械清单仅两档，均在声明面。
- 内部代码评审（advisor，type=code）1 轮：VERDICT pass；🔴 0 · 🟡 0 · 🔵 0。
- 修轮 0；终态 `clean`。

## §6 验证与收口（父代理）

## 验证与收口

- **交付面**：D1（记录义务时点：收口前挂完 + 收口点名条数 + 暂缓/撤销那一刻结清 + 当轮三项零降级）· D2（微批四判据合取 + 一次评审 + 越界退回）· D3（冻结面按写面分路）。落点 = 五档提示词（`thincoder-core/prompts/discipline-engineering.md` ∥ `persona-engineering.md` ∥ `discipline-normal.md` ∥ `persona-eng-designer.md` ∥ `persona-eng-coder.md`）+ 四层设计/需求档。**零 `.mjs` 改动。**
- **父侧读数**：`node --test docs/batches/2026-11-10-p1-2-micro-batch-cost.test.mjs` ⇒ tests 8 · pass 8 · fail 0 · **todo 0**；`thincoder-core/prompts/discipline-engineering.md` 的 D5 行逐字 = 设计 §2.20 的围栏块（290 字符，≤300）。
- **doc-check 门**：`DOC-CHECK GATE: PASS`。
- **D3 净效果（按设计 §2.20 末块）**：四层口径写定 + 两处如实记录；**本批未改任何一道门的射程**——`batch` 段写本来就不在冻结扫面内，批档路径的 `write` / `edit` 本来就整档拦。
- **本批无新债**。
- **暂缓批复核**：无。
- **用户文档面**：无涉（提示词与流程档是内部面）。
- **单测档**：`docs/batches/2026-11-10-p1-2-micro-batch-cost.test.mjs` 随收口删除（8 例的读数见上）。
