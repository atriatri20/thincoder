# 2026-11-12 · designer-doc-structure
> 六段，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 每段只有一个作者：作者的段可 `append` 加内容、可就地改（`edit`）；非作者一概拒。
> 编制：主 agent · 2026-11-12 · 来源 = 用户 2026-11-12 22:03「开，设计席位的人格档需要整体重构一下」——上文查实：九条模板里四条整个是过程、两条是过程的附着物、一条要拆。
> 台账 = #2375（core · 归批）。前情 = 无（独立批）。
## §1 讨论（主 agent）
**状态行**：已收口 2026-11-12
批起 sha = 80379edf6f632f1d2f5571cfc00a59d75f3388a6
<§1 模板占位：本批条目 / 关键判据 / 授权口径>

**要治的事**：`thincoder-core/prompts/persona-eng-designer.md` 自相矛盾，且九条模板把过程推进状态档。

**矛盾（同一份档，隔三十行）**：
- 第 140–141 行：「The batch task: … affected files / acceptance criteria → **batch record §2**」「**Not written into the design doc**: one-shot content mixed into a long-term doc would be overwritten by the next batch.」
- 第 187 ∥ 199 行：又把这些列成设计档九条之二（`Affected-file list` ∥ `Acceptance criteria pointing back`）。

**后果（今晚实测）**：`docs/core/design/PROMPT-SYSTEM.md` 长到 11239 行、100 个 `§6.NN` 节。按节量：带齐模板六样的节占 93%（10308/11132 行）；按模板方块量占 33%。真正是规则的不到一成。

**九条逐条判**（状态 = 现在成立什么；过程 = 这一批怎么做的）：

| 条目 | 性质 | 该住哪 |
|---|---|---|
| 1 Approach & rationale | 状态 | 设计档 |
| 1a closest-precedent line | 过程（这一批查了哪些先例） | 批档 §2 |
| 1b survey-evidence line | 过程（这一批查了哪些公共源） | 批档 §2 |
| 1c Every branch carries its basis | 状态的旁证 | 设计档 |
| 2 Interface contract | 状态 | 设计档 |
| 3 Affected-file list | 过程 | 批档 §2（第 141 行已这么说） |
| 4 Key decision record | 拆：决策+一句理由留；被否候选走 | 两处 |
| 5 Acceptance criteria | 过程（这一批怎么算做完） | 批档 §2（第 141 行已这么说） |
| 6 Case table | 过程 | 批档 §2 |
| 7 Boundary | 状态 | 设计档 |
| 8 UI/interaction decisions | 状态 | 设计档 |
| 9 Integration test design（RTM delta） | 过程 | 批档 §2 |

**另一处逼着写过程**：第 168 行「for an omitted item, **write one line in the design doc saying why it does not apply**」——九条就逼出九行「本条不适用」，写进的是状态档。

**要落的目标态**：设计档只写「这条规则是什么 · 怎么定 · 边界 · 接口」；上表里判为过程的全进批档 §2，删掉的条目不写「为何不适用」。`## Doc structure` 的「9 items」标题随实改口。

**配套同批改**：`advisor-design.md` 现在按九条核（缺项即判），设计档短了会被判缺项——两份档必须同批改，否则改完就红。

**存量不动**：已有 100 节不回溯清。

**用户原话**：「开，设计席位的人格档需要整体重构一下。」（2026-11-12 22:03）

**库内 = 已查**：`persona-eng-designer.md` 第 139–219 行整段实读；`advisor-design.md` 判据条目待设计席核；`thincoder-core/prompts/` 其余档未发现第二份九条模板。

**库外 = B 类**：改动面 = 提示词档与设计档；外部断言 = 零。

**范围更正（用户 2026-11-12 22:06 指出，我派单时擅自缩窄）**

我在派单里写了「落点别扩：只治过程混进状态档这件事，别顺手改别的纪律」——那是把「整体重构」砍成「修一个毛病」，已撤回。

**本批范围 = `persona-eng-designer.md` 全档重构**，不是单点修补。判定标准一条：读这份档的人，能照着它写出「只含最终状态」的设计档与批档 §2，不需要再猜别处的规矩。

要一并处理的：前后矛盾全清（`## Two deliverables` 与 `### Doc structure` 合成一条线）· 篇幅（论证堆叠删到「规则 + 一句理由」）· 重复（「当前状态」两处、「读数住批档」四处）· 结构（改按读的人要做的动作组织：写什么 → 写在哪 → 怎么自检 → 什么时候停）。

边界只有一条：不改「设计席产出两种档」这个事实，不改与其他席位分工。写法、结构、篇幅都归设计席。

## §2 批次任务与设计（eng-designer）
**状态行**：设计完成（收正轮 10 处 + 连带 2 处已落，三档改毕；标准层三处交出改；等评审重开）

<§2 模板占位：本批条目（覆盖） / 设计档落点 / 机制设计 / 受影响文件与测试覆盖 / 验收对照 / 关键决策 / 上抛项>

<§2 模板占位：机读清单 = 标题行「**受影响文件（机读清单）**」+ 围栏内三列表（表头 | 档 | 分拆方案 | 行数 |、分隔行 |---|---|---|、一行一档，只列代码档（源 ∥ 单测））；第二列：越设计时线的档写正向形方案（点名带目录段的档 + 本批落步 `实施轮` ∥ `§5`），未越线写 —；第三列：该档在批起快照上的内容行数（量法 = `countContentLines`），快照里没有这一档写 `新`；示例行 = | thincoder-core/agent-tools/batch-tier-gate.mjs | — | 新 |>

### 设计要点与落点（设计档 = `docs/core/design/PROMPT-SYSTEM.md` §6.104）

**规则本体（一处）**：一句话决定内容归哪份载体——「这句话在这一批收口之后还成立吗」。成立 ⇒ 设计档（现在是什么：规则与理由 ∥ 接口契约 ∥ 边界 ∥ UI 与交互决策，四条）；不成立 ⇒ 批档 §2（这一批自己的账）。派生两条判法：「决策 + 一句理由」不单列第五条；`依据 <path>「<逐字>」` 是附则不是条目。

**状态面先例（本批不改，只对齐）**：`docs/core/design/ADVISOR-CONVERGENCE.md` §9 已写「**设计档不设「受影响文件」表**：那张表答的是「这一批改了哪些档」，是一次性执行记录，住状态档就是一份没人回来更新的过期账」，A-AC11 已按此验收 ⇒ 提示词面与评审面是落后的一侧。

**影响面（五处同批改，缺一则两面打架）**：

| # | 载体 | 改动 | 落笔者 |
|---|---|---|---|
| ① | `thincoder-core/prompts/persona-eng-designer.md` | 整档换写（目标态全文 = 设计档 §6.104 落点 ① 围栏块） | eng-coder |
| ② | `thincoder-core/prompts/advisor-design.md` | 第 4 ∥ 5 ∥ 8 ∥ 9 ∥ 10 ∥ 12 条核查对象 → 批档 §2；增第 14 条（设计档装本批的账 ⇒ 🟡） | eng-coder |
| ③ | `thincoder-core/prompts/discipline-engineering.md` | 设计步 `What it carries:` 那一行 | eng-coder |
| ④ | `thincoder-core/prompts/persona-eng-coder.md` | 微型批末句 `Do not invent a §9 delta` → 去 `§9` | eng-coder |
| ⑤ | `docs/core/design/ADVISOR-CONVERGENCE.md` §14 ∥ §15 ∥ §17 与 A-AC15 ∥ A-AC16 ∥ A-AC18 | 核查对象 → 批档 §2 | 本席（已落） |
| ⑥ | `docs/core/design/PROMPT-SYSTEM.md` §6.96.6 | 删「九项编号、名称与顺序不动」一句（与 §6.104 正面相反） | 本席（已落） |

**明说不做**：不改批档骨架（`batch-skeleton.mjs` 的 §2 占位行）；不改 `doc_check` ∥ 档位闸判法；不改 D2 ∥ D10 ∥ §6.102 的读数判据（与重构后的结构不冲突）；不回溯清本档存量 100 节；不改设计席「产出两种档」的事实与席位分工。

### 受影响文件（机读清单）

| 档 | 分拆方案 | 行数 |
|---|---|---|

**零代码档、零单测档**：本批六个载体全为 `.md`（四份提示词 + 两份设计档），按提示词档免档位判定，无拆分计划需求，第三列零行。

**批起行数读数**（量法 = node 行扫描，`split('\n')` 去末端空行；读数取自本席本轮实跑）：`persona-eng-designer.md` 227 · `advisor-design.md` 174 · `discipline-engineering.md` 470 · `persona-eng-coder.md` 92 · `ADVISOR-CONVERGENCE.md` 601。六档全为 `.md`，按提示词档免档位判定，第三列零行。

### 验收对照（回指设计档 §6.104）

| # | 判据（读者面） | 红侧（改前 / 反例） |
|---|---|---|
| A1 · 四条目在位 | 读 `persona-eng-designer.md`：`The design doc — what is true now` 在位一处，其下恰四条；全档读不到 `Design doc 9 items`、`9 output items`、`for an omitted item, write one line` | 改前实读（内置 `grep` 逐字串）：`9 items` 2 处（`### Doc structure` 节标题与 `**Design doc 9 items**` 清单标题）· `9 output items` 2 处（第 4 步与第 2 条）· `why it does not apply` 1 处 · 全批合计 5 处，改后应为 0 |
| A2 · 两套说法合一 | 读 `## Identity` → `## Step 3`：归属判据只在 Step 3 节首出现一次；全档读不到 `Not written into the design doc` | 改前该串 1 处，与九条目正面相反 |
| A3 · 按读者动作排 | 节序读作：Identity → 收到什么/何时上抛 → Step 1 探索 → Step 2 核需求 → Step 3 写 → Step 4 自检 → Step 5 停 → Finding discipline → Doc names；读不到 `Five-step workflow` | 改前：无 Step 节序，`Five-step workflow` 1 处 |
| A4 · 规则零丢失 | 拿本记录「结构对照」表逐行读：旧档的每条规则在新档找得到归处；任一条找不到 ⇒ 判红 | 反例 = 九条目 3 ∥ 5 ∥ 6 ∥ 9 若直接删而不入 §2 一节，即为丢规则 |
| A5 · 三面改口 | 读 `advisor-design.md` 第 14 条在位、第 8 条读得到 `batch record §2's affected-files table`；读 `discipline-engineering.md` 设计步读得到 `live in the batch record §2`；读 `persona-eng-coder.md` 读不到 `§9 delta` | 改前：三处均为旧形 |
| A6 · 文档门 | `doc_check(mode:"gate")` 首行 `PASS` | —— |
| A7 · 反例演示（红侧范例） | 本节 §6.102 按新规读：保留「规则本体 + 一句理由 + 边界」，其普查表 ∥ 用例表 ∥ 验收表 ∥ 读数行全部移入 §2；形态从 200 余行的落地记录收成规则，读的人从「照抄一遍」变成「照做」 | 现盘 §6.102 正是反例：规则不到十行，其余是本批的账 |

### 关键决策（含被否）

| # | 决策 | 一句理由 | 被否（长期理由） |
|---|---|---|---|
| K1 | 设计档四条，不设第五条 | 「决策 + 一句理由」是条目 1 的定义，另立即一个决策写两处 | 单列 `Key decision record`：同一决策两处详述，读者要自己对齐 |
| K2 | `依据` 引文作附则 | 四条都要带引号依据，立成条目会让其余条目豁免 | 立成第五条：条目 1/3/4 的引文失去出处 |
| K3 | 全档重写而非逐句打补丁 | 矛盾在结构层（先给结论、三十行后给相反清单），补丁只能补掉一处 | 逐条打补丁：读的人仍按后一份清单行事 |
| K4 | 批档骨架不改 | 移出的六样在 §2 既有位置各有归处，机读清单本来就在 §2 | 同批改 `batch-skeleton.mjs`：代码改动，无对应收益 |
| K5 | 评审面加 🟡 不升 🔴 | 措辞与载体问题不该拦下一批；🟡 让判据留在评审手里 | 升 🔴：一个形态问题停整批 |

### 上抛项

- [上抛·知会] 用户本轮撤回了「落点别扩」那句，范围从「修矛盾」扩为「全档重构」；本设计按后者落，前者的产物（§6.104 初版）已被同轮换写，未留残留。
- [上抛·待裁] `docs/core/design/ADVISOR-CONVERGENCE.md` §14 ∥ §15 ∥ §17 属另一批的落地记载（A-AC15/16/18 标注「已落笔」）；本席按「承载同一规则就得同批改」处理了核查对象一句，若父侧认为该并入那几节原批，请在评审前指出，本席改回。

### 修正轮（评审第 1 轮 = changes-required · 4🔴 4🟡 3🔵）

父侧本轮另办了一件：`docs/core/standards/METHODOLOGY.md` 的 F2-4 ∥ F2-6 ∥ F7-1 判定句已按用户 2026-11-12 裁定收正（本批的验收 ∥ 用例表 ∥ 集成差量 ∥ 先例行 ∥ 勘察行住批档 §2）。故第 1 ∥ 4 条不再论证方向，本节只在 §6.104「与既有纪律冲突核对」里引该判定句。

| # | 严重度 | 处置 | 改了哪一句（档 · 逐字） |
|---|---|---|---|
| 1 | 🔴 | 落 · 引标准层判定句 | `PROMPT-SYSTEM.md` §6.104 冲突表第 1 行：`判定句改为「本批的验收标准 ∥ 条目 ∥ 受影响文件清单住批档 §2」，依据标 = 用户 2026-11-12 裁定「状态档只写最终状态，过程进批档」` |
| 2 | 🔴 | 落 · 二者都改 | ① 目标态两处写域限定逐字保留，第二处不再是无条件句：`inside your write domain you fix on the spot` ∥ `**Revision-style expressions are deleted, never revised** — inside your write domain`；② §6.8 A3 条名改 `Revision-style expressions are deleted, never revised`，A7 加 `条名以 §6.104 落点 ① 目标态为准`，K5 加 `§6.104 整档重写后第二条改名为 …，限定逐字保留`；③ §6.102 A2·E2 ∥ 落点 ⑦-1 换锚 `Batch record §2 一节`；④ §6.104 边界改口为 `但 §6.102 与 §6.8 在这份人格档上按名判的锚随整档换写一起换——冲突是真的` |
| 3 | 🔴 | 落 · 改块 | `ADVISOR-CONVERGENCE.md` §17【提示词逐字建议】块：`12. **Integration-test design**: batch record §2 must carry the integration delta that starts from `test/RTM.md`` ∥ `**A record missing that delta ⇒ 🔴 (design incomplete)**` ∥ `a record that never names those scenarios` |
| 4 | 🔴 | 落 · 引标准层判定句 | §6.104 冲突表第 2 行（F2-6 同类先例）＋「既有件三问」四条：设计档不携先例行 ∥ 勘察行是正形（该两行归批档 §2）；§6.104 自身的三问落在「既有件三问」段 |
| 5 | 🟡 | 落 · 换锚两处 | §8.2 落点行：`persona-eng-designer.md` 的 `Batch record §2` 一节（集成差量 ∥ 用例号两条）；§6.102 落点 ⑦-1：`Batch record §2` 一节内（原「设计档条目 9」已退） |
| 6 | 🟡 | 落 · 引在册、不另裁 | §6.104 冲突表第 8 行：`同一条冲突早已入账（台账 `#2346`，待讨论）；本节按 `State (keep)` 取「设计层被否备选 + 其持久理由属状态」，裁定权在用户`（`§6.96.8` 的 `design-level rejected alternatives and their lasting reasons` 逐字为据） |
| 7 | 🟡 | 落 · 按 §16 ∥ §17 的形补齐 | `ADVISOR-CONVERGENCE.md` 新增 `## 19. 一次性内容核查（设计评审维度）`（权威链引块 + 核查条目 + 同类先例 + 勘察证据 + 提示词逐字建议）；§12 表新增 `A-AC20`，回指 §19 |
| 8 | 🟡 | 落 · 补段 | §6.104 新增 `**既有件三问（答的是落点，不是新名）**` 四条：`## Two deliverables` ∥ `### Doc structure` · 四条目名字（`Approach & rationale` ∥ `Interface contract` ∥ `Boundary` ∥ `UI/interaction decisions`）· 载体名 `batch record §2` · `none found` |
| 9 | 🔵 | 已逐字 · 零改 | 本席实读 `PROMPT-SYSTEM.md` §6.104 的「依据」行现文即 `，是一次性执行记录，住状态档就是一份没人回来更新的过期账`，与 `ADVISOR-CONVERGENCE.md` §9 逐字相等（探针 = 内置 `grep` `一次性执行记录`）——评审第 9 条读到的旧形不在盘 |
| 10 | 🔵 | 落 · 补行 | §6.104 新增 `**分层结论 = 无档跨分层**：本节改动的档全为 `.md`（四份提示词 + 两份设计档）…无代码档、无单测档，第三列零行` |
| 11 | 🔵 | 落 · 两类各补 | ① 落点 ③ 补现文：`What it carries: **the target state** (how it will be built), approach & rationale, full affected-file list, verifiable acceptance criteria (each pointing back to a user story).`；② 结构对照表补两行出处：`**Exploration budget ≤6 explore spawns / batch**` → `Survey budget: 6 exploration spawns per batch`；`**first version ≤15 turns / per-doc fix ≤10 turns**` → `a first version lands inside 15 turns, a per-document fix inside 10` |

**修正轮的连带（同一缺陷的兄弟处，本轮一并改）**：整档换写会掉别的节按名判的探针，评审只点到两处，实扫另有三处同类，一并在同轮补：

- 目标态补回三条被压掉的规则：`A full-suite acceptance is not a batch criterion`（全量套跑归父侧收口门）、`the integration delta names its cases` + `A case's number is fixed in the RTM before its case title is written`（§6.102 A2·E2 ∥ A7 的探针）、`design §N.M` / `requirements §N.M` 引用形。
- 按名判九项的两张 A 表换锚（`Design doc 9 items` → 四条目；`9. **Integration test design**` → `The integration delta names its cases`），§6.102 A1 ∥ §6.104 落点 ⑦-1 换锚，`§6.98` 族 `existing` 行改指四条目。

**受影响文件（修正轮增量）**：零代码档、零单测档；本席本轮只改两份 `.md`（`docs/core/design/PROMPT-SYSTEM.md` §6.104 ∥ 六处按名判的锚，`docs/core/design/ADVISOR-CONVERGENCE.md` §17 ∥ §12 ∥ §19），第三列零行，机读清单仍为空表。

**上抛项（修正轮新增）**

- [上抛·知会] 第 4 条的处置把 F7-2（被否决的备选不进设计档）留在原样：它与 §6.96.8 的 `State (keep)` 仍在盘上正面相反，裁定权在用户，台账 `#2346` 在册；本批按 `State (keep)` 落，未自行改 F7-2。
- [上抛·知会] 存量未清：`PROMPT-SYSTEM.md` 里按旧九项记的落地行（含 `#2355` 那行的 `第 3 项 ∥ 第 5 项`）不回溯——本批边界「不回溯清本档存量 100 节」所定，属在册残留，交下一批触达即清。

### 收正轮（交付后 · 设计档侧 · 2026-11-12）

父侧已复跑核对：`inside your write domain` = 2 · `9 items` = 0 · 第 6 条 `Scope` 在位 · 用例号句两档各 1。本笔只改设计档面（`PROMPT-SYSTEM.md` ∥ `ADVISOR-GUARDS.md` ∥ `ADVISOR-CONVERGENCE.md`），提示词本体零笔，标准层交出改。

**逐条处置**

| # | 条目 | 处置 | 改了哪一句（档 · 逐字） | 依据 |
|---|---|---|---|---|
| 一 | 落点表欠一句（实施席上抛，成立） | 落 · §6.104 落点 ② 行末补实况 | `PROMPT-SYSTEM.md` §6.104 落点 ② 行：`各条其余判法文字一字不动` 之前插入 `**第 8 ∥ 12 条的宾语也一并改，不只首句**：8 条第二句 … ⇒ … one line in batch record §2 naming which files cross a tier、8 条第三句 Any file over 500 lines before the change must carry a split plan in the design. ⇒ … in batch record §2.、12 条制裁句 A design missing that section ⇒ 🔴 (design incomplete) ⇒ A record missing that delta ⇒ 🔴 (design incomplete)——只换首句，评审面便继续要设计档装档位结论与拆分方案，与本节落点 ① 当场相反`；末句改为 `各条其余判法文字一字不动（500 ∥ 800 的阈值与量法零改）` | 本批目标态 `The affected-file list, its tier conclusion and the reading that justifies each tier are in §2` ∥ 标准层 F-R24a「批档 §2 列文件名 + 每档一个原始行数 + 一句表级尺寸档位结论」∥ CODE-TIER §2①「方案写在批档 §2 的受影响文件清单里」 |
| 二.1 | A-AC13-2 计数 13 | 落 · 改数 | `ADVISOR-GUARDS.md` AC13-2：`内 ^[0-9]+\. \*\* 计数 = **13**` ⇒ 计数 = **14** | 实读 `advisor-design.md` 的 `## Review Criteria` 节切（至下一个 `^## `）内含 `^[0-9]+\. \*\*` 的条目 = 14（1–14；另 `6b.` 1 条） |
| 二.2 | 勘察证据行「止于 12.」 | 落 · 改数 | 同档：`落点档形：… 节内条目编号止于 12.` ⇒ `止于 14.` | 同上一次实读 |
| 二.3 | §8.2 的 `Two deliverables` 指针 | 核后不改 §8.2 · 真悬空在 §6.96.7，同轮改 | 实读 §8.2 表内该行现文已是 `` `persona-eng-designer.md` 的 `Batch record §2` 一节（集成差量 ∥ 用例号两条）``，该段 `Two deliverables` 命中 **0** ⇒ 实施席报的悬空不在 §8.2。真该改的一处在 §6.96.7：`与 persona-eng-designer.md 的 Two deliverables；两处现有规则保留` ⇒ `与 persona-eng-designer.md 的 The design doc — what is true now ∥ Batch record §2 — this batch's account 两节（§6.104 整档重写后的形）；两处现有规则保留` | 内置 `grep` `Two deliverables`：§8.2 段 = 0；实读该档 `Two deliverables` ∥ `Doc structure` 各 0 命中（整档已换写） |
| 二.4 | §6 的 A4「改后与改前同数」 | 落 · 改关系式（不写死数） | `PROMPT-SYSTEM.md` A4：`节内整数编号加粗项的计数改后与改前同数（…读数住实施记录）` ⇒ `节内整数编号条目的名字与顺序不因本笔而变——本笔只在既有条内换文字，不增删条目（`6b.` 不占整数编号；判域 = 该节范围；条数是读数，住实施记录与批档）` | 计数是读数（D12）；本条判的是「本笔不动编号」，写死死数则下一笔一增条即转红 |
| 三.1 | §6.98 A2 按「九项第 5 项」判 | 落 · 换锚 | `读同档九项第 5 项：…` ⇒ `读同档的 Batch record §2 一节（§6.104 整档重写后，原九项第 5 项的内容落在此）：…` | §6.104 落点 ① 目标态；该句实读在该节一处 |
| 三.2 | §6.98 A5 按「九项仍 `1.`–`9.` 齐」判 | 落 · 换实况读数 | `结构面读现盘同一档：九项仍 1.–9. 齐、## 9 处、### 1 处，且新增三行以七个空格起…` ⇒ `结构面读现盘同一档：## 9 处、### 2 处；该条落在 Batch record §2 一节内…项内增列、无新节 ∥ 新项` | node 行扫描实读：135 行 · `##` 9 · `###` 2 |
| 三.3 | §6.96.8 按「九项第 4 项 Key decision record」判 | 落 · 换锚 | `persona-eng-designer.md 九项第 4 项 Key decision record (rejected alternatives included) 保留，不恢复候选穷举义务` ⇒ `persona-eng-designer.md 的 The design doc — what is true now 条目 1（The rule and why it is this way；§6.104 整档重写后原九项第 4 项的落处）保留被否备选的持久理由，不恢复候选穷举义务` | 同上 |
| 三.4 | `METHODOLOGY.md` 三处 | **未改 · 交出「应为」逐字**（标准层不归本席，父侧明令） | 见下「交父侧改标准层」 | 同上 |
| 四 | `index.publicRepos` 两个读数 | 落 · 实读改正 | `ADVISOR-CONVERGENCE.md` §17：`= [] （…）⇒ 零仓外声明源（无相关也照记）` ⇒ `= ["../.thincoder","../thincoder.com"]（PROJECT-MANIFEST.json 清单项实读 2026-11-12，与 §19 同一读数）…本节成形所据的公共源全在树内 =`；连带 `ADVISOR-GUARDS.md` §3.1 同键同伪结论：`⇒ 无仓外声明源可查（已查无）` ⇒ `⇒ 两个仓外声明源在册；本节成形所据的公共源全在树内，未引仓外源` | `manifest read` 实读 `"publicRepos":["../.thincoder","../thincoder.com"]` |

**连带（同一缺陷的兄弟处，本轮一并改）**

- `ADVISOR-GUARDS.md` A-AG28 判据行：`节内整数编号 = 13 ∧ 第 13 条在 ## Output Format 之前` ⇒ `节内整数编号 = 14 ∧ …`——与 AC13-2 同一条数，两处必须同数。
- `PROMPT-SYSTEM.md` §6.96.7 的 `Two deliverables`（见二.3）——②-④ 之外唯一一处活指针悬空。

**交父侧改标准层（`docs/core/standards/METHODOLOGY.md` · 本席一字未动）**

| 处 | 现文（逐字） | 应为（逐字） | 为什么 |
|---|---|---|---|
| F2-4 需求格 | `**设计步骤**：方案 / 架构 / 怎么实现落设计文档——问题陈述、方案与理由、可验证验收标准（每条回指用户故事）` | `**设计步骤**：方案 / 架构 / 怎么实现落设计文档——问题陈述、方案与理由（本批的验收标准 ∥ 条目 ∥ 受影响文件清单住批档 §2）` | 同条判定句已改口为「住批档 §2」，需求格留着「可验证验收标准（每条回指用户故事）」= 同一行内两句话正面相反 |
| F7-1 需求格（测试层那半句） | `→ 测试层（**本批的用例表 ∥ 验收标准逐条回指 ∥ 集成差量住批档 §2**；设计档只留「怎么验」的判据）` | `→ 测试层（**本批的用例表 ∥ 验收标准逐条回指 ∥ 集成差量住批档 §2**；设计档不设测试层）` | §6.104 四条目（规则与理由 ∥ 接口契约 ∥ 边界 ∥ UI 与交互决策）无验证条目 ⇒「设计档只留怎么验的判据」在盘上无落处 |
| F7-2 范围边界格 | `现形 = 设计档 9 项之①（`thincoder-core/prompts/persona-eng-designer.md`）` | `现形 = 设计档四条目之条目 1（`The rule and why it is this way`，`thincoder-core/prompts/persona-eng-designer.md` 的 `The design doc — what is true now` 一节）` | 九项已退；实读该档 `Design doc 9 items` 0 命中 |
| F7-1 范围边界格（三处之外，本席按 F7-1 自身改口的连带读出，可裁可舍） | `设计档文档地图注册 + 结构机检（三节在场）` | `设计档文档地图注册 + 结构机检（需求层 ∥ 设计层两节在场；测试层归批档 §2）` | 设计档侧去掉测试层后只剩两节，「三节在场」判不出来 |

**读数（量法：`node` 行扫描 `split('\n')` 去末端空行；读数只在批档与命令输出里）**

- `persona-eng-designer.md`：135 行 · `##` 9 · `###` 2；`The design doc — what is true now` ∥ `Batch record §2 — this batch's account` 各 1 · `states what must hold, not what the count happens to be` 1 · `Two deliverables` 0 · `Doc structure` 0 · `Design doc 9 items` 0。
- `advisor-design.md`：`## Review Criteria` 节切内 `^[0-9]+\. \*\*` = 14 条（编号 1–14），`6b.` 1 条。
- `PROJECT-MANIFEST.json`：`"publicRepos":["../.thincoder","../thincoder.com"]`。

**边界（本笔不做）**：提示词本体零笔 · 需求档零笔 · 标准层零笔（只给「应为」）· 代码零笔 · 别的批档零笔；`PROMPT-SYSTEM.md` 存量 100 节的旧九项落地行不回溯（本批既有边界）。

**上抛项**

- [上抛·知会] §6.104 的「结构对照」表与「既有件三问」仍按 `## Two deliverables` ∥ `### Doc structure` 的旧名叙述——两处是本批的落地记录（一次性内容），按本批已定的新规则它们该住批档 §2 而不该住设计档；本笔不动（超出本轮收正面），交父侧决定是否下一笔搬。

**连带（第二遍实扫新增 · 同一根因）**

- `PROMPT-SYSTEM.md` §6.98 A3：与 A2 ∥ A5 同表同根因——探针按「九项第 3 项」的旧措辞判，实读该档命中 **0**（`a source or test file over 500 lines before the change ⇒` ∥ `the design carries a split plan that lands inside this batch;` ∥ `**Current state only**: a design/requirement doc states what is true now.` 三条各 0）⇒ 换成现措辞：`A source or test file over 500 lines before the change carries a split plan that lands inside this batch` ∥ `**Current state only**: the document says what is true now.`（各实测 1）；D17 那半句逐字未动。

**Leads（本批边界外的存量，只报不改）**

- `ADVISOR-GUARDS.md` 第 45 ∥ 261 ∥ 384 ∥ 837 行四句：`index.publicRepos` = `["../.thincoder","../thincoder.com"]`（值对）⇒ 后半句仍写「无公开源档可查（已查无）」。值与非空清单相抵。四处不在本轮触及区，按本批边界「不回溯清存量」未动；要不要改由父侧定（口径与本轮 482 行那处同一次修正即够）。

## §3 设计评审（评审子代理）
**状态行**：评审通过



### 轮次 1（评审子代理）

| # | 严重度 | 状态 | 证据（指针） |
|---|---|---|---|
| 1 | 🔴 | 未决 | §6.104「its acceptance lines, its case table, its integration delta against `test/RTM.md`」 vs METHODOLOGY F7-1「→ 测试层（用例表 + 验收标准逐条回指需求、每条可机器验证）」· F2-4「设计档含问题陈述 / 方案理由 / 验收标准逐条回指」· 同档 §6.96.8 `State (keep)`「current acceptance criterion」 |
| 2 | 🔴 | 未决 | §6.8 验收 A3「`inside your write domain` 在位两处（`Consistency surface` ∥ `Revision-style-expression check` 各一处）」· §6.102 A2·E2「读 `persona-eng-designer.md` item 9」 vs 落点 ① 目标态全文（该两串零命中）；§6.104 边界「§6.102 … 不与之冲突」 |
| 3 | 🔴 | 未决 | ADVISOR-CONVERGENCE §17 逐字建议块「the design document must contain an integration-test design section」 vs 同节正文「批档 §2 是否携集成差量」· A-AC18；落点 ⑤「其余权威链与判法不动」 |
| 4 | 🔴 | 未决 | §6.104 无先例行 ∥ 勘察证据行，落点 ①「its precedent or survey lines」禁止设计档携带 vs METHODOLOGY F2-6「设计档含「同类先例」一行（先例坐标 + 对齐 ∥ 偏离理由）」 |
| 5 | 🟡 | 未决 | §8.2「`persona-eng-designer.md` 设计档条目 9 与收尾自检第 2 条」· §6.102 落点 ⑦-1「`persona-eng-designer.md` 设计档条目 9 内」 |
| 6 | 🟡 | 未决 | 落点 ① 条目 1「a rejected alternative … keeps its lasting reason here」 vs F7-2「**被否决的备选不进设计档**（那是选型过程，住批次档）」 |
| 7 | 🟡 | 未决 | 新增第 14 条无 ADVISOR-CONVERGENCE 对应节体与验收行——A-AC10 ∥ A-AC11 ∥ A-AC15 ∥ A-AC16 ∥ A-AC17 ∥ A-AC18 均一节一行 |
| 8 | 🟡 | 未决 | §6.104 边界「不改 `advisor-design.md` 第 11 条（既有件三问）：答案本就是设计内容，四条目下落在条目 1」而本节无三问答 |
| 9 | 🔵 | 未决 | §6.104 依据块「，一次性执行记录」 vs ADVISOR-CONVERGENCE §9「，是一次性执行记录」 |
| 10 | 🔵 | 未决 | §6.104 无「分层结论」行（§6.103 有「分层结论 = 无档跨分层」）；改动面全 `.md` ⇒ 免判 |
| 11 | 🔵 | 未决 | 落点 ③ 只给 `What it carries:` 标签、不给现文（④ 给现文）；目标态「Survey budget: 6 exploration spawns per batch」无依据行 |

VERDICT: changes-required

计数：🔴 4 · 🟡 4 · 🔵 3（共 11 条）

### 轮次 2（评审子代理）

| # | 原# | 严重度 | 状态 | 证据（指针） |
|---|---|---|---|---|
| 1 | 1 | 🔴 | Fixed | METHODOLOGY F2-4 判定句「**本批的验收标准 ∥ 条目 ∥ 受影响文件清单住批档 §2**（F-R24a；依据 = 用户 2026-11-12 裁定…）」· F7-1 测试层「集成差量住批档 §2」· §6.104 冲突表 #1 ∥ #2 |
| 2 | 2 | 🔴 | Fixed | §6.8 A3「`Revision-style expressions are deleted, never revised` 各一处」· K5「§6.104 整档重写后第二条改名…限定逐字保留」· 落点 ① 围栏块两处 `inside your write domain` · §6.102 A2·E2「的 `Batch record §2` 一节…（§6.104 整档重写后原 item 9 的内容落在此）」· 边界「冲突是真的」 |
| 3 | 3 | 🔴 | Fixed | ADVISOR-CONVERGENCE §17 逐字块「batch record §2 must carry the integration delta that starts from `test/RTM.md`」 |
| 4 | 4 | 🔴 | Fixed | METHODOLOGY F2-6「批档 §2 含「同类先例」一行（先例坐标 + 对齐 ∥ 偏离理由）」· §6.104 冲突表 #2 |
| 5 | 5 | 🟡 | Fixed | §8.2 行「`Batch record §2` 一节（集成差量 ∥ 用例号两条）」· §6.102 ⑦-1「§6.104 整档重写后原「设计档条目 9」已退」 |
| 6 | 6 | 🟡 | Accepted | §6.104 冲突表 #8「引在册、不另裁：同一条冲突早已入账（台账 `#2346`，待讨论）」——有据不修，裁定权在用户 |
| 7 | 7 | 🟡 | Fixed | 本档 `## 19. 一次性内容核查（设计评审维度）` + §12「A-AC20」+ 逐字建议块 |
| 8 | 8 | 🟡 | Fixed | §6.104「**既有件三问（答的是落点，不是新名）**」三条 `existing` + 一条 `none found` |
| 9 | 9 | 🔵 | Fixed | §6.104 依据行与 ADVISOR-CONVERGENCE §9 逐字相等（「，是一次性执行记录，住状态档就是一份没人回来更新的过期账」） |
| 10 | 10 | 🔵 | Fixed | §6.104「**分层结论 = 无档跨分层**」 |
| 11 | 11 | 🔵 | Fixed | 落点 ③「现文（本席实读）= …」· 结构对照「出处就是旧档那一行：数值与射程零改」 |
| 12 | (new) | 🟡 | New | METHODOLOGY F2-4 需求格仍写「可验证验收标准（每条回指用户故事）」落设计文档，与其已改判定句相反 |
| 13 | (new) | 🟡 | New | METHODOLOGY F7-2 范围边界「现形 = 设计档 9 项之①（`thincoder-core/prompts/persona-eng-designer.md`）」——九项已退 |
| 14 | (new) | 🟡 | New | F7-1「设计档只留「怎么验」的判据」仍给设计档一个测试层，而 §6.104 四条目无验证条目 |
| 15 | (new) | 🟡 | New | §6.98 A5「九项仍 `1.`–`9.` 齐、`##` 9 处、`###` 1 处」· A2「读同档九项第 5 项」· §6.96.8「`persona-eng-designer.md` 九项第 4 项…保留」 |
| 16 | (new) | 🟡 | New | ADVISOR-CONVERGENCE §17「`index.publicRepos` = `[]`」vs §19「= `["../.thincoder","../thincoder.com"]`（…实读）」——同一键两读数 |
| 17 | (new) | 🟡 | New | §6.96.8 `State (keep)`「current acceptance criterion」与 §6.104「its acceptance lines」未对齐（冲突表 #8 只处置了被否备选那半） |

计数：第 1 轮 🔴 4 → 全部 Fixed（4/4）；🟡 4 → Fixed 3 ∥ Accepted 1；🔵 3 → 全部 Fixed。本轮新增 🟡 5、🔵 0、🔴 0。

VERDICT: pass

### 轮次 3（评审子代理）

> 状态行重置：第 3 轮打回（changes-required）· 上一轮状态行 = 评审通过 → 进行中 · 2026-11-12

| # | 严重度 | 状态 | 证据（指针） |
|---|---|---|---|
| 1 | 🔴 | 未决 | `advisor-design.md` 第 8 条「**Neither the size nor an expected delta goes into the design document**: the conclusion does」·「**Any file over 500 lines before the change must carry a split plan in the design.**」 vs 同批目标态 `persona-eng-designer.md` Step 4 ②「The affected-file list, its tier conclusion and the reading that justifies each tier are in §2」· METHODOLOGY F-R24a「批档 §2 列文件名 + 每档一个原始行数 + 一句表级尺寸档位结论」· CODE-TIER §2①「方案写在批档 §2 的受影响文件清单里」 |
| 2 | 🟡 | 未决 | `advisor-design.md` 第 12 条「**A design missing that section ⇒ 🔴 (design incomplete)**」 vs ADVISOR-CONVERGENCE §17 逐字块「**A record missing that delta ⇒ 🔴 (design incomplete)**」 |
| 3 | 🟡 | 未决 | 批档 `## §4 用户批准（主 agent）` 与 `## §5 实施记录（eng-coder）` 两节无内容——「已实现」状态无记录面证据（coordination item） |
| 4 | 🔵 | 未决 | `advisor-design.md` 第 14 条枚举「entries, affected-file list, acceptance lines, case table or integration delta」 vs `persona-eng-designer.md` Step 3「its precedent or survey lines」 |
| 5 | 🔵 | 未决 | `advisor-design.md` 第 4 条类别名 `**Clarity**` 之下现只有受影响文件核查一句 |
| 6 | 🔵 | 未决 | 目标态围栏块与落盘档仅差一处断行（`Check the ledger before you start, and hand back what you find` 条折成两行），依据 = PROMPT-SYSTEM §8.2「提示词面每行自成一界（逐行 ≤300 码点；断行在句 ∥ 分句边界、词句不改）」；§5 空 → 无记录 |
| 7 | 🔵 | 未决 | 批档 A4「拿本记录「结构对照」表逐行读」——该表住 §6.104「**结构对照（旧 → 新：同一件事只留一处）**」；且盘上无改前 227 行副本（`.wt-head-probe` 那份是 `### 设计档 8 项（design doc — 8 items, one missing = incomplete）` 的旧形），A4 基线 unverified |
| 8 | 🔵 | 未决 | `discipline-engineering.md` 设计步「What it carries」与「The affected-file list, the acceptance criteria and the case table」两行缩进 5 格，同项下一行 `**⚠️ The problem statement does NOT go here**` 为 4 格 |

VERDICT: changes-required

计数：🔴 1 · 🟡 2 · 🔵 5（共 8 条）

### 轮次 4（评审子代理）

| # | 严重度 | 状态 | 证据（指针） |
|---|---|---|---|
| 1 | 🔴 | Fixed | `advisor-design.md` 第 8 条三句全改口：`no number goes into the design document` / `the conclusion does — one line in batch record §2 naming which files cross a tier, each with its split plan` / `must carry a split plan in batch record §2`；与 `persona-eng-designer.md` Step 4 ②「are in §2」、F-R24a「批档 §2 列文件名 + 每档一个原始行数 + 一句表级尺寸档位结论」同向 |
| 2 | 🟡 | Fixed | `advisor-design.md` 第 12 条制裁句 = `A record missing that delta ⇒ 🔴 (design incomplete)`，与 `ADVISOR-CONVERGENCE.md` §17 逐字块同句相等（主语 ∥ 制裁词均对齐） |
| 3 | 🟡 | New（不拦） | `PROMPT-SYSTEM.md` §6.104 落点 ② 行仍是「8 条 `the design's affected-files table` ⇒ `batch record §2's affected-files table`…各条其余判法文字一字不动」∥「12 条 … 换成」首句——设计 of record 未跟上本轮授权的三句改口（第 8 条第二 ∥ 三句、第 12 条制裁句），下一读者按落点表核会判落盘档「改多了」 |

轮次 2 计数：旧 🔴 1 → Fixed 1/1；旧 🟡 1 → Fixed 1/1；本轮新增 🟡 1（coordination，不拦）、🔵 0、🔴 0。上一轮第 3–8 条按本轮复核声明排除、未复判。

VERDICT: pass

## §4 用户批准（主 agent）

**用户批准**：2026-11-12 22:03「开，设计席位的人格档需要整体重构一下」；22:06 纠正我擅自缩窄范围（「你他妈加的那第4件事不是明着造反吗」）——范围 = 全档重构，不是修一个毛病。

**评审链**：第 1 轮 `changes-required`（4🔴 4🟡 3🔵）→ 修正 → 第 2 轮 `pass`（5 条新 🟡，均非拦截）→ 实施 → 交付后收正（设计席 `#36`）。

**用户在一次上抛里确认了边界**：实施席发现 `advisor-design.md` 第 8 ∥ 12 条留着「档位结论与拆分方案进设计档」，超出设计授权面——我裁定「最小一致性修正 + 如实记档」，用户未反对，按此落。

## §5 实施记录（eng-coder）
**状态行**：实施完成（四落点全落；评审 2 轮，终态 clean；设计档落点表待补三句现文（父侧已认领入台账））



**实施范围**：四个落点（§6.104 落点 ①–④），四份 `.md` 提示词档。零代码档、零单测档 ⇒ 单测面 `none`（本批不产生可断言的业务可观察结果，无新增用例面；集成集差量 = 无）。

### 落点 ① · `thincoder-core/prompts/persona-eng-designer.md` 整档换写

- **词句来源** = `docs/core/design/PROMPT-SYSTEM.md` §6.104「落点 ① 目标态全文」围栏块（134 行），逐字搬入；`<!-- slot:[1] consumers:[eng-designer subagent] -->` 首行原样保留。
- **断行**（实施席定，整档只折一处）：围栏块里 `- **Check the ledger before you start, and hand back what you find**: … is not yours to dispose of: send it up naming the row and the section it touches, and keep working on the unaffected parts.` 一行 302 码点，按 PROMPT-SYSTEM §8.2 的 `提示词面每行自成一界（逐行 ≤300 码点；断行在句 ∥ 分句边界、词句不改）` 在冒号处断成两行。**拼回**（两行按序接一串）与该围栏行逐字相等，其余 133 行逐行逐字相等。
- **读数**（量法 = node 行扫描 `split('\n')` 去末端空行；行宽 = `[...line].length`）：227 行 → **135 行**；最长行 **300**；`## ` 9 → **9**；`### ` 1 → **2**（新增两条皆围栏块自带的 `### The design doc — what is true now` ∥ `### Batch record §2 — this batch's account`）；超 300 码点行 **0**。
- **探针**（内置 `grep` 逐字串，改后）：`inside your write domain` **2**（`**Consistency surface** — … — inside your write domain you fix on the spot` ∥ `**Revision-style expressions are deleted, never revised** — inside your write domain: strikethrough` 各一处）；下列各 **0**：`**Revision-style-expression check**: a consistency-surface item` · `9 items` · `9 output items` · `Design doc 9 items` · `for an omitted item, write one line` · `Not written into the design doc` · `Five-step workflow` · `which rows this change breaks`；下列各 **1**：`the case this change rewrites, the case it deletes, the case it adds` · `A case's number is fixed in the RTM` · `The integration delta names its cases` · `Every branch carries its basis` · `Names in the prose ↔ names in the table` · `carries one number per code file` · `in the third column of batch record §2's affected-files table`。
- `why it does not apply` 现存 **2** 处，两处皆目标态自带、非旧形残留：`… an item it does not have is left out entirely, with no line saying why it does not apply.`（否定句）与修复轮上报行 `… or why it does not apply.`。旧形 `for an omitted item, write one line` 已 **0**。

### 落点 ② · `thincoder-core/prompts/advisor-design.md`

| 条 | 改后逐字（本席实读） |
|---|---|
| 4 | `4. **Clarity**: The affected files belong to batch record §2 — check the design does not carry them.` |
| 5 | `5. **Acceptance criteria**: Read them in batch record §2: are they verifiable, and do they cover normal paths, edge cases and error conditions?` |
| 8 | `8. **Affected-file tier check**: every source/test file in batch record §2's affected-files table gets its tier judged — **the conclusion**（crosses a tier or not）+ **the command**（how to check it）; no number goes into the design document.`（另见下「超出授权跨度的修正」） |
| 9 | `9. **Closest-precedent check**: check whether batch record §2 carries a closest-precedent line — …` |
| 10 | `10. **Survey-evidence check**: check whether batch record §2 carries a survey-evidence line — …` |
| 12 | `12. **Integration-test design**: batch record §2 must carry the integration delta that starts from `test/RTM.md` — the RTM: one section per business story, one row per integration case.`（另见下） |
| 14（新） | `14. **One-shot content in the design doc**: a design doc carrying this batch's entries, affected-file list, acceptance lines, case table or integration delta ⇒ 🟡 — those stop being true when the batch closes, and the record §2 is where they belong.` ＋ 次行 `**Why**: the design doc outlives the batch, so a table frozen at the copying moment is read as current by everyone after it.`（位置 = 第 13 条末行之后、`## Output Format` 之前） |

- **第 6 条 `**Scope**` 未动**：派单里的「第 6 条整条删去」当轮由父侧撤回（笔误，与 §6.104 落点 ② 及 §2 影响面表相反），第 6 条与 `6b` 及其分工记载原样在盘。
- **读数**：174 行 → **176 行**；`## ` 7 → **7**；`### ` 0 → **0**；`## Review Criteria` 节内整数编号加粗项 **13 → 14**，字母后缀条目 **1**（`6b.`）不变；最长行 **293**；超 300 码点行 **0**。

### 落点 ③ · `thincoder-core/prompts/discipline-engineering.md` 设计步

- 原一行（`What it carries: **the target state** (how it will be built), approach & rationale, full affected-file list, verifiable acceptance criteria (each pointing back to a user story).`）换成两行：`What it carries: **the target state** (how it will be built), approach & rationale, the interface contract where there is one, and the boundary.` 与 `The affected-file list, the acceptance criteria and the case table are this batch's own account and live in the batch record §2.`
- **其下一行 `**⚠️ The problem statement does NOT go here**` 一字未动。**
- **读数**：470 行 → **471 行**；`## ` 13 → **13**；`### ` 7 → **7**；最长行 **297**；超 300 码点行 **0**。

### 落点 ④ · `thincoder-core/prompts/persona-eng-coder.md` 微型批末句

- `Do not invent a §9 delta: by criterion ① there is none.` → `Do not invent an integration delta the batch record does not carry: by criterion ① there is none.`
- **读数**：92 行 → **92 行**；`## ` 6 → **6**；`### ` 0 → **0**；全档 `§9 delta` **0**；最长行 **283**；超 300 码点行 **0**。

### 设计残留（超出授权跨度）· 逐句明细 · 父侧已裁定落最小一致性修正

根因：§6.104 落点 ② 只换各条的一个短语，末句写 `各条其余判法文字一字不动`，而 `advisor-design.md` 第 8 ∥ 12 条的**其余句子仍把本批的账指向设计档**。父侧 2026-11-12 裁定：这不是新语义，是本批要治的病留在评审面，按最小一致性修正落（只动宾语，判法 ∥ 阈值 ∥ 量法一字不动）。

| 条 | 改前（改前盘上逐字） | 改后（现盘逐字） | 为什么必须改 |
|---|---|---|---|
| 8 | `the conclusion does — one line naming which files cross a tier, each with its split plan, or stating that none crosses.` | `the conclusion does — one line in batch record §2 naming which files cross a tier, each with its split plan, or stating that none crosses.` | 半句没写家 ⇒ 读者按前文 `goes into the design document` 读，结论行落回设计档 |
| 8 | `**Any file over 500 lines before the change must carry a split plan in the design.**` | `**Any file over 500 lines before the change must carry a split plan in batch record §2.**`（500 ∥ 800 的阈值与量法一字未动） | 拆分方案的履行位置 = 批档 §2 的受影响文件清单（CODE-TIER §2① `方案写在批档 §2 的受影响文件清单里`；F-R24a `批档 §2 列文件名 + 每档一个原始行数 + 一句表级尺寸档位结论`） |
| 12 | `**A design missing that section ⇒ 🔴 (design incomplete)**` | `**A record missing that delta ⇒ 🔴 (design incomplete)**` | 本条首句已把差量的家换成批档 §2，制裁句主语留在设计档即自相矛盾；兄弟处 `ADVISOR-CONVERGENCE.md` §17 逐字块同轮已是 `A record missing that delta` |

**设计档仍需补的一句（供收口时并进设计档，父侧已声明会记台账）**：`PROMPT-SYSTEM.md` §6.104 落点 ② 行现仍写 `8 条 `the design's affected-files table` ⇒ `batch record §2's affected-files table``，并断言 `各条其余判法文字一字不动`——上表三句的现文未入该行。**核盘的人按落点表读，会判落盘档「改多了」。** 建议由设计席在本节或落点 ② 行同轮补三句现文（形同 `修正轮` 对落点 ⑤ ∥ ⑥ 的处理）。

### 验收自跑（对照本记录 §2 A1–A7）

| # | 判据 | 读数 |
|---|---|---|
| A1 | 四条目在位 ∥ 旧九项探针归零 | `The design doc — what is true now` 1 处，其下恰四条；`Design doc 9 items` 0 · `9 output items` 0 · `for an omitted item, write one line` 0 ✔ |
| A2 | 两套说法合一 | 归属判据只在 Step 3 节首一处（`**Ask of every sentence: does it still hold once this batch closes?**`）；`Not written into the design doc` 0 ✔ |
| A3 | 按读者动作排 | 节序 = Identity → What you receive → Step 1–5 → Finding discipline → Doc names；`Five-step workflow` 0 ✔ |
| A4 | 规则零丢失 | 按 §6.104「结构对照（旧 → 新）」12 行逐行核，目标态 12 行皆有归处 ✔；**按改前 227 行原文逐条核 = 未做**（盘上无改前副本，见「落地核对」末条 ⇒ unverified） |
| A5 | 三面改口 | 第 14 条在位 · 第 8 条读得到 `batch record §2's affected-files table` · 设计步读得到 `live in the batch record §2` · `persona-eng-coder.md` 全档 `§9 delta` 0 ✔ |
| A6 | 文档门 | `doc_check(mode:"gate")` 首行 `DOC-CHECK GATE: PASS`（四档同一次调用；修完第 8 ∥ 12 条后复跑仍 PASS）✔ |
| A7 | 反例演示 | §6.102 未触（本批边界），其反例读法不属本批验收面 —— 未判 |

### 决策披露（本席自决项）

| # | 决定 | 理由 |
|---|---|---|
| D1 | 第 4 条旧两句一并换掉（旧第二句 `Are the affected files identified?` 删） | 新首句 `check the design does not carry them` 与「设计档里有没有受影响文件」正面相反；留着 = 同一条款内自相矛盾。设计落点 ② 写的是「首句 ⇒ …」，而旧第二句问的正是新句否掉的那件事 |
| D2 | `why it does not apply` 保留 2 处 | 目标态逐字含这两句；父侧当轮已确认其探针写法有误，以 A1 探针 `for an omitted item, write one line` 为准（已 0） |
| D3 | 整档换写用「逐字复制围栏块 + 一处折行」，不手抄 | 手抄的漂移风险高于复制；随后以「拼回逐字相等」逐行核过，不靠目视 |
| D4 | `git add` 四个整档 | 文件级暂存无法只挑本批行。连带入库的是已收口批次 `2026-11-12-no-line-numbers-in-prompts`（§1 状态行 `已收口 2026-11-12`）在盘未提交的落盘行；本批一行未改那些行，据实登记 |

### 落地核对（本批落盘使哪些设计档句子不再成立）

- `docs/core/design/ADVISOR-GUARDS.md` 的 A-AC13-2 行：「节切（`## Review Criteria` 至下一个 `^## `）内 `^[0-9]+\. \*\*` 计数 = **13**（`6b.` 不占整数编号）；第 13 条在 `## Output Format` 之前」——本批新增第 14 条后计数为 14，该句不成立。
- 同档「勘察证据行（本席实读 · 2026-11-04）」：「落点档形：`thincoder-core/prompts/advisor-design.md` 的 `## Review Criteria` 节内条目编号止于 `12.`，另有 `6b.` 一条字母后缀条目；节后即时 `## Output Format`。」——本批后编号止于 `14.`，该句不成立。
- `docs/core/design/PROMPT-SYSTEM.md` §8.2 表内一行：「与 `persona-eng-designer.md` 的 `Two deliverables`；两处现有规则保留。」——该节已随整档换写消失，指针悬空。
- 同档 §6「A4 编号引用零破坏」行：「`## Review Criteria` 节内整数编号加粗项的计数改后与改前同数」——本批 13 → 14，该读法不再成立。
- 同档按旧九项记的存量落地行（`**Design doc 9 items**` 与 `九项` 族：§6.92 读① ∥ 落点 ③ ∥ §6.98 A5 ∥ §6.96.8 等）——属本批边界「不回溯清本档存量 100 节」与本记录 §2 上抛「存量未清」所定，未动。

### 审计与评审轮次 ∥ 终态

- **内部差异审计（只读子代理）1 轮**：报 3 条 divergence，**全部驳回**，基线取错 —— 它以 `git show HEAD:` 为改前态，而 HEAD（`f542197b`）早于已收口批 `2026-11-12-no-line-numbers-in-prompts` 的未提交落盘（该批 §5 记 `which rows this change breaks` 改后 0，probe 在本批改前的盘上已是 0）。真差异 0。附带：该审计无 node 工具，行宽用 `grep '^.{301,}'` 估，以本席 `[...line].length` 实测为准。
- **内部代码评审（advisor `type:"code"`）2 轮**：轮 3 = 🔴 1 · 🟡 2 · 🔵 5，`changes-required`（结论入本记录 §3「轮次 3」）；父侧裁定 → 落最小一致性修正 → 轮 4 = 旧 🔴 1 ∥ 🟡 1 全部 `Fixed`，新增 🟡 1（设计残留未入 §6.104 落点表，非拦截），`VERDICT: pass`（本记录 §3「轮次 4」）。
- **终态：`clean`** —— 无未解 🔴；余项：§3 轮次 3 的 🔵 4 条（第 14 条枚举窄 ∥ 第 4 条类别名 ∥ 断行偏离未记 ∥ A4 指针悬空 ∥ 缩进）与轮次 4 新增 🟡 1（设计档落点表待补三句现文），均已逐条摆在报告里，交父侧裁定与分派。本段不自行扩改：设计档不在本席笔域。

## §6 验证与收口（父代理）

**验证（父侧，本会话实跑，探针 = 内置 `grep` 逐字串，域 = `thincoder-core/prompts/`）**

| 检查 | 读数 |
|---|---|
| 写域限定在位 | `inside your write domain` = 2（`Consistency surface` ∥ `Revision expressions are deleted, never revised` 各一） |
| 九项结构清零 | `9 items` = 0 · `Design doc 9 items` = 0 · `for an omitted item, write one line` = 0 |
| 新结构在位 | `the case this change rewrites` = 2（设计席 ∥ 评审席）· `A case's number is fixed in the RTM` = 2 |
| 第 6 条保住 | `Scope**: Is the scope appropriate` = 1（我派单误写「整条删去」，实施席拦下并上抛，按设计保留） |
| 行数 | `persona-eng-designer.md` 227 → 135 · `advisor-design.md` 174 → 176（新增第 14 条） |

**单测**：本批零代码档，无单测档；提示词面无既有用例可跑。

**集成集**：不破任何既有用例——可观察面是提示词文本，RTM delta = 破 0 ∥ 冗余 0 ∥ 新增 0。

**落地核对**：实施顶掉四处设计档描述（`ADVISOR-GUARDS.md` 的「计数 = 13」与「条目编号止于 12.」· `PROMPT-SYSTEM.md` §6.96.7 的 `Two deliverables` 指针 · §6 A4 的「改后与改前同数」），已由设计席在交付后收正；另修 `§6.98` 两处按九项判的锚与 `§6.96.8` 的旧指针。

**标准层（本批由主 agent 落）**：`METHODOLOGY.md` 的 F2-4 ∥ F2-6 ∥ F7-1 ∥ F7-2 四处按「设计档只写最终状态、过程进批档 §2」改口，依据 = 用户 2026-11-12 裁定。

**本批新债 1 条 + `#2376`。**
