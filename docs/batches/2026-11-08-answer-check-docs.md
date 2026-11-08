# 2026-11-08 · answer-check-docs
> 六段，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 每段只有一个作者：作者的段可 `append` 加内容、可就地改（`edit`）；非作者一概拒。
> 编制：主 agent · 2026-11-08 · 来源 = 用户 2026-11-08 17:29「你检查一下提示词,看看有没有回答子agent问题时要先查文档的约定?」· 17:31「common.md里要约定,另外工程模式主agent的提示词里也要补,答复子agent上抛问题时要特别强调查文档.」。
> 台账 = #2203（core · 归批）。前情 = docs/batches/2026-11-08-tool-desc-trim.md（进行中）。
## §1 讨论（主 agent）
**状态行**：已收口 2026-11-08
<§1 模板占位：本批条目 / 关键判据 / 授权口径>

### 已定决定

- **已定决定**：`common.md` 要约定「回答之前先查文档」 · 用户原话：「common.md里要约定,另外工程模式主agent的提示词里也要补,答复子agent上抛问题时要特别强调查文档.」 · 时间：2026-11-08 17:31

### 缺口（父侧实读，`thincoder-core/prompts/common.md`）

**现有三条，管不到「回答」这一环：**

| 节 | 逐字 | 它管什么 |
|---|---|---|
| `## Check the docs before you ask` | 「**Before you ask anything**, look for the answer in the docs — `doc_search` ∥ requirement docs ∥ design docs ∥ code ∥ the project map.」 | **提问**（且明写双向：「Applies to both: the main session asking the user, and a subagent asking its parent.」） |
| `## Check the docs before you act` | 「**Before you act, look at how this thing already works**: the interfaces, the conventions, the decisions made earlier.」 | **动手**（接口、惯例、既有决定） |
| `## Upstream channel — subagents and their parent` | 讲 `notify_parent` ∥ 何时可上抛 ∥ 父侧怎么 `send` 回去 | **通道与格式**，一个字没提「回答之前要查」 |

**⇒ 「问」有、「做」有、「答」没有。**裁定恰好夹在中间：既不是提问，也不是通常意义的动手。

### 今天掉进去的那一次（现场，不是假想）

某设计席上抛「描述面语言怎么办」。**我不是在问、也不是在改代码——我是在裁。** 于是我按「用户没说过语言」直接裁了「按原文语言重写」。

而设计档早写着五处成规：

- `docs/core/design/BROWSER-TOOL.md` KD-9：「描述面英文…**用户面语言 = 模型面英文**」
- `docs/core/design/EDIT-HELPERS.md`：「**语言 = 英文**」
- `docs/core/design/DOC-DISCIPLINE.md`：「英文运行面 = 实施轮」
- `docs/core/design/MANIFEST.md`：「落地文本 = 英文同义句」
- `docs/core/design/TOOLS.md`：描述面（英文）

**用户原话：「这个是设计文档里早就定了的,在回答问题之前都不先查文档的吗?」**

### 要落的两处

**① `thincoder-core/prompts/common.md`**：把「问之前先查」扩成「问或答之前先查」。**最小形——改那一节的标题句与首句，不新增节、不新增判据维度。**

**② `thincoder-core/prompts/persona-engineering.md`**（工程模式主 agent）：**回答子代理上抛时要特别强调查文档**——上抛多半是「两条规则打架」「前提被推翻」「找不到落点」，**这类问题的答案十次有九次已经写在需求档或设计档里**；不查就答的代价是**同一条规则在盘上有两个版本**。

### 边界

- **理由一条就够**：**「用户没说过」不等于「没有规定」。**已有的约定被重新裁一次，就是让同一条规则多出一个版本。
- **不加机检、不加新节**：这是纪律句，不是判据。
- **不碰既有三条**：它们各管一环，只是**缺了第四环**。

## §2 批次任务与设计（eng-designer）
**状态行**：设计完成（修正轮 3 已收：§6.86 改前一览表首行改描述形、上抛项 1 去时刻；交付门复跑首行 PASS）
<§2 模板占位：本批条目（覆盖） / 设计档落点 / 机制设计 / 受影响文件与测试覆盖 / 验收对照 / 关键决策 / 上抛项>

### 覆盖条目（本批做）

| # | 条目 | 落点 | 判据 |
|---|---|---|---|
| 1 | 「问之前先查档」扩成「问或答之前先查档」 | `thincoder-core/prompts/common.md` 的 §Check the docs before you ask or answer（节标题 ∥ 首句 ∥ 一句 why） | `A1` · `A2` · `A3` |
| 2 | 工程模式主 agent 答子代理上抛前先查档 | `thincoder-core/prompts/persona-engineering.md` 的 §Dispatch, agent reports, and the zero-write watchdog 节内新增三行 | `A1` · `A2` |

设计单源 = `docs/core/design/PROMPT-SYSTEM.md` 判据表的 D-PS59 行 + 同档 §6.86 验收表的 `A1`–`A4`（本席本轮写入）；本节只引号，不重述读数。`A4` 是交付门，兜上表两行的全部。

### 不在本批

- **需求档的语义面**：`docs/core/requirements/ENGINEERING-MODE-V2.md` 是主 agent 的写面，本席只上抛（见文末上抛项）。该档 §13.16 的需求 4 与验收⑤ 已由主 agent 于 2026-11-08 17:38 落成两向——**本批 = 落地它们**，不是改它；同档另两处旧措辞与一处内部对立陈述见上抛项。
- **不加机检、不加 AC 计数、不新增 `##` 节、不碰既有三节**（问 ∥ 做 ∥ 上行通道），不写「不许 X」清单。
- 不改 `thincoder-core/prompts/advisor-round1.md` ∥ 工具描述面 ∥ 台账机制 ∥ 任何代码。

### 逐字终稿（提示词面 = 产品；本席不落笔，实施席照抄）

**① `thincoder-core/prompts/common.md`** —— 现行节标题 `## Check the docs before you ask` 与现行首句 `**Before you ask anything**, look for the answer in the docs` 所在的那两行整两行换成下列四行，同段其余各句零改：

```text
## Check the docs before you ask or answer
**Before you ask anything or answer anyone**, look for the answer in the docs — `doc_search` ∥ requirement docs ∥ design docs ∥ code ∥ the project map.
**"The user never said" is not "nothing is written down"**: a convention already settled gets ruled on again, and the same rule ends up in two versions on disk.
If the docs already hold the answer, asking again spends the most expensive attention in the chain.
```

四行的来处：节标题 = 改名（问 ∥ 答两向）；新首句 = 首句两向化；`**"The user never said" is not "nothing is written down"**` 那一行 = 理由句（一节一句，不加第二维）；末行 `If the docs already hold the answer, asking again spends the most expensive attention in the chain.` = 原首句的后半句拆出来独立成行，**字面零改**。

**② `thincoder-core/prompts/common.md` 同档 §Document search 子节的跨句**：现句里那处节名随改名同改（同档自引，零语义）：

```text
`Check the docs before you ask or answer` decides when to look; this subsection decides which tool looks.
```

**③ `thincoder-core/prompts/persona-engineering.md`** —— 在 `### Dispatch, agent reports, and the zero-write watchdog` 节内 `Dispatch truthfully` 条之后插下列三行（条与条之间不空行）：

```text
- **An upstream ask is answered from the docs, not from the surface of the question**: a child escalates a rule conflict, a contradicted premise, or a place it could not find.
- **Nine times out of ten the answer is already written** in a requirement or design doc, and the ask carries the coordinates to read it.
- **Why**: "the user never said" is not "nothing written down" — a settled convention re-ruled from memory leaves the same rule in two versions on disk.
```

### 落点为什么在这里（人格档，不是公共层上行通道节）

任务书提议「`§Upstream channel` 那节最贴」。实读：那一节住 `thincoder-core/prompts/common.md`，受众是两模式 + 全子代理；它管通道与格式，子席侧的查档义务已在其中逐字 `Read before escalating — carry the evidence you checked`。

本句是同一条义务的**父侧对句**，而用户点名的是**工程模式主 agent**。落人格档 = 受众恰好一人一模式，公共层加句会把普通模式的父侧也写进一条用户没点的义务。

同族先例：D-PS7 的落法——判据本体在公共层上行通道节，人格档只就近落本地出口句。本条不新增公共层句：问 ∥ 答的判据本体已经由第 1 条的公共层节承载。

### 受影响文件

| 文件 | 改动 | 作者 |
|---|---|---|
| `thincoder-core/prompts/common.md` | 节标题 + 首句换两向 + 一句 why；同档自引一处改名 | eng-coder（提示词 = 产品面，走写门） |
| `thincoder-core/prompts/persona-engineering.md` | 新增三行（规则 ∥ 判据形 ∥ why） | eng-coder |
| `docs/core/design/PROMPT-SYSTEM.md` | 判据表新增 D-PS59 行 + 该档内该节名存量指针按新名对齐 + §6.86 两处陈旧引文按落地现值改正 + 命令 ⑧ 取窗口锚修正 | 本席（设计档写面） |
| `docs/core/requirements/ENGINEERING-MODE-V2.md` | §13.16 需求 4 ∥ 验收⑤ 已由主 agent 落成两向，本批 = 落地它；另两处旧措辞见上抛项 | 主 agent（本席不写） |
| `docs/batches/2026-11-08-answer-check-docs.test.mjs` | 批内单测档（与批档同址同名 ∥ 收口删）；跑法见验收节 | 实施轮 eng-coder |

**档位结论**：无一档跨档。两提示词档只增 1–3 行；设计档与需求档只是在既有行内换一个节名，零结构变动；批内单测档不属产品代码面（与批档同址同名 ∥ 收口删），其体量按 `doc_check` 的 `lines` 读数留在 §5，本节不留数。

### 验收（判据单源 = `docs/core/design/PROMPT-SYSTEM.md` §6.86 的 `A1`–`A4`；本节只引号，不重述读数）

| 编号 | 条目 | 判据单源 | 判法 |
|---|---|---|---|
| AC-1 | 两处终稿在盘，五个目标串各恰一处 ∥ 每行 ≤ 300 | 同节 `A1` | 跑该节验收命令 ⑧，读 `A1_common` ∥ `A1_persona` ∥ `A1_maxLen` |
| AC-2 | 结构零连带（不新增 ∥ 不删节） | 同节 `A2` | 同一命令，读 `A2_common` ∥ `A2_persona` |
| AC-3 | 旧节名清零 | 同节 `A3` | 同一命令，读 `A3_oldName`；机判域与扫过的树见该节判域注 |
| AC-4 | 交付门 | 同节 `A4` | `doc_check(mode:"gate", …)` 首行 `PASS` |

**批内单测档** = `docs/batches/2026-11-08-answer-check-docs.test.mjs`（与批档同址同名；收口删），跑法：

```bash
node --test docs/batches/2026-11-08-answer-check-docs.test.mjs
```

该档断的是「五条目标串在盘且各一次」，与 `A1` 同源，不另立判据。

### 关键决策

| 编号 | 决策 | 判由 | 被否 |
|---|---|---|---|
| K1 | **节标题随内容改名**（`## Check the docs before you ask` → `## Check the docs before you ask or answer`），不保留旧名 | 规则的**名字**是它被引用、被记住的那一处；本批修的正是「答的那一刻没人打开这一节」。名字仍是「问之前」，读者按名字找，答的那一环依旧落空。且该节在本仓有多处引用（设计档存量指针 ∥ 需求档的 FR 昵称 ∥ 同档自引）——名字与内容不符会沿这些引用一路传下去。扫法与判域 = `docs/core/design/PROMPT-SYSTEM.md` §6.86 的验收命令 ⑧ 与 `A3` 判域注（覆盖树：`thincoder-core/prompts/` ∥ `docs/core/design/` ∥ `docs/core/requirements/`；不扫 `docs/batches/**`） | 只改首句、留旧名（零扇出，但名字继续教单向读法） |
| K2 | **第 2 条落工程模式人格档**，不进公共层上行通道节 | 用户点名「工程模式主 agent」；子席侧义务已在公共层，父侧对句落人格档 = 受众恰好一人一模式（同 D-PS7 落法） | 落 `thincoder-core/prompts/common.md` 上行通道节（多写普通模式一条没人点的义务） |
| K3 | **改名同轮扫旧名**（按写面分派，机判域内预期残留 0） | 退役名不扫，下一次读档的人按旧名找不到节，或按旧名理解内容（D14 一次扫完）。扫法与覆盖树见上 K1 | 留旧名做别名（同一条规则两个名字，D2） |
| K4 | **实施面用存在性读数，不写行为断言** | 提示词是文案产品，唯一的可观测就是那几句在不在；写成「模型会不会先查档」不是本批可机判的 | 造行为测试（不可判，且伪绿） |

### 上抛项（主 agent 面，本席不写）

**① 已收口 —— 不再是上抛项**：本批 = **落地 `docs/core/requirements/ENGINEERING-MODE-V2.md` §13.16 的需求 4 与验收⑤**。主 agent 2026-11-08 17:38 已把该档改成两向，本席 17:36 那条上抛被这一笔吸收。验收⑤逐字：

```text
⑤ 查档节标题与首句为两向形（含 `before you ask or answer`），全仓旧单向名零残留；工程模式主 agent 答子席上抛前的三行在场。
```

⇒ 需求档在这一条上不需要再改；`A1` ∥ `A3` 就是这条验收的机器读数。

**② 已落盘 —— 需求档旧措辞只剩方向中性一处**（需求档是主 agent 的笔）：

| 坐标 | 逐字 | 处置 | 由谁 |
|---|---|---|---|
| FR41 验收③ | 现值「与 FR38（查档两向）∥ FR39（已查无：<面>）无矛盾」 | **已落盘**：主 agent 已把括注收成「查档两向」，与同档 §13.16 需求 4 同口径；本批只落地它 | — |
| FR38 验收④ | 「与 `thincoder-core/prompts/common.md`「check the docs first」无矛盾（分界句在场）」 | **保留**：这句不含方向词（没写 before asking），指那条纪律而非节标题，改名后仍成立；改它只增改动 | — |

另：`thincoder-core/prompts/persona-normal.md` 有一处 `check the docs first`（普通模式三条路由那句），同属方向中性，保留。

**③ 已收口 —— 需求档 §8.6 与本批取法同口径**：需求档现值 `docs/core/requirements/ENGINEERING-MODE-V2.md`「**单元测试** = 开发期工具，改动时的反馈回路，**用毕即删**」；本批依它处理批内单测档（与批档同址同名 · 收口删）。同档 §1.1 对单元档同向（用毕即删），无对立陈述。

**修正轮 2 · 交付门两处引缺 + 评审轮次 2 的 N1 ∥ N2（全落 `docs/core/design/PROMPT-SYSTEM.md` §6.86）**

- **引缺①**：勘察证据行把旧首句当引文钉在提示词档上——旧首句正是本节改名换掉的那一句，落地后零命中。改成落地后的现值首句，引文按现值取。
- **引缺②**：单测档归属段引的需求档原句已在盘上不存在（同档 §8.6 现为「用毕即删」）。按现况删掉对立的那半句，「本批依用毕即删」的结论与逐字引文保留。
- **N2**：四处「需求档还剩两处旧措辞 / 一处对立陈述」收成「已落盘 + 剩一处保留」；FR41 验收③ 现值「与 FR38（查档两向）」，不再记成待改，免得下一位照着重改一遍已改好的句。
- **N1**：命令 ⑧ 人格档取窗口的锚补 `- ` 前缀——原锚 `startsWith` 命不中该行（那行以 `- ` 起头），返回 `null` 被 `.filter(v=>v!==null)` 静默丢掉，`A1_maxLen` 只量公共层一侧且不报错。
- **读数**（脚本从 §6.86 命令 ⑧ 原样取出执行）：`A1_common` `1,1,1` · `A1_persona` `1,1` · `A1_maxLen` `175` · `A2_common` `22,28` · `A2_persona` `18,23` · `A3_oldName` `0`；`A4` 交付门 `doc_check(mode:"gate")` 首行 `PASS`（改前同一命令首行 `REFUSED（锚 2 条）`，两处引缺定位在 §6.86 的行内）。
- **边界**：本轮只动 `docs/core/design/PROMPT-SYSTEM.md` 与本节；提示词面两份档零改（`A1`–`A3` 读数与实施轮一致）。

**修正轮 3 · 交付门前两处收尾（全落 `docs/core/design/PROMPT-SYSTEM.md` §6.86）**

- **改前一览表首行**：原格引的是旧单向首句，该句落地后在本仓零命中（命令 ⑧ 的探针域内已不存在）⇒ 换成描述形「改前形 = 单向（只写 `before you ask`）」并指向围栏让读者取现值，列名由「逐字」改「改前文字」。由：引一句不在盘上的话，下一位读者 grep 得 0，会以为整张表是编的。
- **上抛项 1 去时刻**：两处时刻删掉，保留事实「需求档已由主 agent 改成两向，本席原上抛被这一笔吸收」。由：状态档答「现在是什么」，时刻答「什么时候变成的」，后者住 git 与批档。
- **读数**：`A4` 交付门复跑，首行 `PASS`（同一命令、三档：设计档 ∥ 两份提示词档）；本轮提示词面零改，`A1`–`A3` 读数与实施轮一致。

## §3 设计评审（评审子代理）
**状态行**：评审通过



### 轮次 1（评审子代理）

| # | 严重度 | 状态 | 证据（指针） |
|---|---|---|---|
| 1 | 🔴 | 待修 | 设计档 §6.86 上抛项 1「的 FR38 现名「查档先于提问」，提示词面扩成两向后需求档仍只写提问；同一规则两处口径不一」对盘上不符：需求档 §13.16 第 4 条已是「**「查档」是两向的**（同档的查档节）：**问之前**与**答之前**都要查。」，验收⑤已是「查档节标题与首句为两向形（含 `before you ask or answer`），全仓旧单向名零残留；工程模式主 agent 答子席上抛前的三行在场。」，落点已是「设计档 `docs/core/design/PROMPT-SYSTEM.md` 新节（编号随设计）；具体分句由设计定」 |
| 2 | 🟡 | 待修 | 两套验收表不对号：批档 §2 AC-3「改后语义与既有三节不重叠」（散文判法）在设计档 A 表无对应行；设计档 A4「交付门」在 §2 无对应；§2 AC-4 判域含「设计档正文面」而设计档 A3 只判两份提示词档 |
| 3 | 🟡 | 待修 | 批档 §2 逐字终稿 ① 用行号定位「现第 18 行（节标题）与第 19 行（首句）」、「第 4 行 = 原第 19 行的后半句拆出来独立成行」——需求档 §13.16 落点与 D4/§13.27 禁行号，设计档 §6.86 落点表可给逐字锚而未给 |
| 4 | 🟡 | 待修 | 批档 §2 K3「改名同轮扫旧名（16 处按写面分派，预期残留 0）」· K1「该节在被引用 16 处（设计档 14 · 需求档 1 · 同档自引 1）」——无命令、无覆盖树声明，需求档 §7.6「验收 grep 须写明覆盖哪几棵树」 · 「射程不写，读的人以为查过了」 |
| 5 | 🟡 | 待修 | 设计档 §6.86 验收 A1–A4 无「每行 ≤ 300」读数；同族先例 §6.84 的 A1 含「自成一段 ∥ 每行 ≤ 300」与 `A1_maxLen` |
| 6 | 🟡 | 待修 | 设计档 §6.86「分层结论 = 无档跨分层」只述「`.md` 提示词档免档位判定」；批档 §2 声明的批内单测档 `docs/batches/2026-11-08-answer-check-docs.test.mjs` 无自己的档位结论 |
| 7 | 🟡 | 报不改 | 需求档内部两处对立陈述：§1.1「单元档 = 改动时的反馈回路，用毕即删」 vs §8.6「**单元测试** = 开发期工具，改对代码即随批次档留存——**不处置、不删除**」；设计档取「收口删」未点哪条为准 |
| 8 | 🔵 | 知会 | 评审上下文无文档地图 ∥ 无项目标准档；AC-1 红侧读数与 A2 基线（`A2_common`/`A2_persona`）所据的两份提示词档不在本轮评审范围 ⇒ 该等读数 `unverified` |

计数：🔴 1 · 🟡 6 · 🔵 1

VERDICT: changes-required

### 轮次 2（评审子代理）

| # | 严重度 | 状态 | 证据（指针） |
|---|---|---|---|
| 1 | 🔴 → 已清 | 已修 | §6.86 上抛项 1「〔已收口 · 需求档〕本批 = **落地」；批档 §2 上抛项 ①「已收口 —— 不再是上抛项」；需求档 FR38 需求 4「**「查档」是两向的**（同档的查档节）」+ 验收⑤「工程模式主 agent 答子席上抛前的三行在场」；同档 FR41 验收③ 现值「与 FR38（查档两向）」，全档「查档先于提问」零命中 |
| 2 | 🟡 | 已修 | 批档 §2 验收表 AC-1…AC-4 与 §6.86 `A1`–`A4` 一号一号对号并带「判据单源」列；散文判法的 AC 已撤；AC-4 = 交付门 |
| 3 | 🟡 | 已修 | 批档 §2 逐字终稿 ①「现行节标题 `## Check the docs before you ask` 与现行首句」（行号已去）；§6.86「**落点（钉引文，不记行号）**」 |
| 4 | 🟡 | 已修 | 批档 §2 K1「覆盖树：`thincoder-core/prompts/` ∥ `docs/core/design/` ∥ `docs/core/requirements/`；不扫 `docs/batches/**`」，§6.86 `A3` 判域注同；「16 处」这个无尺读数已删 |
| 5 | 🟡 | 已修 | §6.86 `A1`「五条目标串在两份提示词档各恰一处 ∥ 每行 ≤ 300」+ `A1_maxLen` 阈值 300 与红法 |
| 6 | 🟡 | 已修 | §6.86 受影响文件「测试档 · 批内单测档（与批档同址同名 ∥ 收口删）」+ 分层结论点名该档；批档 §2「**档位结论**：无一档跨档」 |
| 7 | 🟡 | 已闭环 | 需求档 §8.6 现值「**单元测试** = 开发期工具，改动时的反馈回路，**用毕即删**」——原对立陈述已不在盘；§6.86「单测档归属（本批取哪条 · 需求档两处对立陈述）」已钉「用毕即删」 |
| 8 | 🔵 | 知会 | 评审上下文仍无文档地图 ∥ 无标准档；`A1` ∥ `A2` 所据两份提示词档不在本轮评审范围 ⇒ 该等读数 `unverified` |
| N1 | 🟡 | 新发现（建议修，非 must-fix） | §6.86 验收命令 ⑧「win(E,'**An upstream ask is answered from the docs',3)」——人格档那行以「- 」起头（见同节围栏「- **An upstream ask is answered from the docs, not from the surface of the question**」），`startsWith` 不命中 ⇒ 取 `null` 被 `.filter(v=>v!==null)` 丢掉：`A1_maxLen` 只量公共层四行，人格档三行既不判红也不印 `null` |
| N2 | 🟡 | 新发现（建议修，非 must-fix） | §6.86 判域注「还剩两处旧措辞，逐处处置见上抛项」与上抛项 2「FR41 验收③ 的「与 FR38（查档先于提问）」是单向昵称」——该处已改完（现值「与 FR38（查档两向）」），实剩一处 FR38 验收④「check the docs first」；批档 §2 上抛项 ② 仍按待裁记 |
| N3 | 🟡 | 新发现（建议修，非 must-fix） | §6.86「单测档归属」引「**单元测试** = 开发期工具，改对代码即随批次档留存——**不处置、不删除**」——该串在需求档零命中（§8.6 现值「用毕即删」），所报对立陈述已不存在；§6.86 上抛项 3 与批档 §2 上抛项 ③ 同 |

计数：🔴 0 未决（原 1 已修）· 🟡 9（已修 6 · 已闭环 1 · 新发现 3，均非 must-fix）· 🔵 1

VERDICT: pass

## §4 用户批准（主 agent）

### 用户批准

**授权原话（17:31）**：「common.md里要约定,另外工程模式主agent的提示词里也要补,答复子agent上抛问题时要特别强调查文档.」

**在此之前用户看到过的**：17:29 我把那一句的补法与理由写在回复里（`Before you ask anything — or settle a question someone else raised — look for the answer in the docs`），并问「要我把这一句落进 `thincoder-core/prompts/common.md` 吗？」——**用户 17:31 的回答是「要」，并加了第二处**（工程模式主 agent 那份）。

**设计评审**：两轮（轮 1 `changes-required` → 轮 2 `pass`，0 红），见 §3。**实施在建档已过评审的设计上进行**。

**一句照实的**：**用户批准的是「这两处要补」这件事与那句补法，没有逐条审阅 §2 的验收表与判据**。设计细节的批准来自评审，不是来自用户；本段不把两者混成一句。

## §5 实施记录（eng-coder）
**状态行**：实施完成（两处落点已落地、A1–A3 与单测全绿；A4 交付门仍红，两处引缺在设计档，待设计席收后复跑）



**交付摘要**：§2 两处落点按围栏逐字落地（未改写、未增删判断），批内单测档按 §2 验收节写；改动只在边界内三档，无第四档。

**落点 1 · `thincoder-core/prompts/common.md`**（提示词 = 产品面，运行期加载）

- 节标题换成新名；首句两向化为「**Before you ask anything or answer anyone**, look for the answer in the docs — …」；新增理由句「**"The user never said" is not "nothing is written down"**: a convention already settled gets ruled on again, and the same rule ends up in two versions on disk.」；原首句后半句 `If the docs already hold the answer, asking again spends the most expensive attention in the chain.` 独立成行、字面零改。同段其余各句零改。
- 同档 §Document search 子节的自引一处随改名同改（零语义）。

**落点 2 · `thincoder-core/prompts/persona-engineering.md`**

- 在 `### Dispatch, agent reports, and the zero-write watchdog` 节内、`Dispatch truthfully` 条之后插三行（规则 ∥ 判据形 ∥ why），条与条之间不空行；位次用该条现有文本定位，未用行号。

**验收读数（同一把尺子 = `docs/core/design/PROMPT-SYSTEM.md` §6.86 的验收命令 ⑧，仓根执行）**

- **改前（红侧，先跑）**：`A1_common` `0,0,0` · `A1_persona` `0,0` · `A1_maxLen` `null` · `A2_common` `22,28` · `A2_persona` `18,23` · `A3_oldName` `2`。
- **改后（绿侧）**：`A1_common` `1,1,1` · `A1_persona` `1,1` · `A1_maxLen` `175` · `A2_common` `22,28` · `A2_persona` `18,23` · `A3_oldName` `0`。
- **锚已修，两侧都量到**：命令 ⑧ 原文取窗口的锚 `win(E,'**An upstream ask is answered from the docs',3)` 命不中人格档那行（该行以 `- ` 起头），返回 `null` 后被 `.filter(v=>v!==null)` 静默丢弃——`A1_maxLen` 只量公共层，人格档三行根本不判。本笔把锚改成 `- **An upstream ask` 后复跑：公共层窗口 160 · 人格档窗口 175，两侧都取到，`A1_maxLen` = 175 ≤ 300。**未修锚前那半边的绿是假的绿。**
- **批内单测档**：`node --test docs/batches/2026-11-08-answer-check-docs.test.mjs` → `tests 5 · pass 5 · fail 0`。五条断言 = 五条目标串在盘且各恰一处（与 `A1` 同源，不另立判据）；未扩成行为断言（`K4` 明令否掉）。收口随批删。

**A4 交付门 = REFUSED（红，不是通过）**

- 命令：`doc_check(mode:"gate", docs:["docs/core/design/PROMPT-SYSTEM.md", "thincoder-core/prompts/common.md", "thincoder-core/prompts/persona-engineering.md"])`；首行 `DOC-CHECK GATE: REFUSED（锚 2 条）`。
- 两处 `引缺` 都住在 `docs/core/design/PROMPT-SYSTEM.md` §6.86，**不在本笔这一面**：
  - ① 勘察证据行把旧首句 `**Before you ask anything**, look for the answer in the docs` 作为引文钉在 `thincoder-core/prompts/common.md` 上——**陈旧由本笔落地触发**（§2 指定的改名换掉了那一句），但引文住在设计档，修复归设计席；
  - ② 单测档归属段引需求档那句 `**单元测试** = 开发期工具，改对代码即随批次档留存——**不处置、不删除**`——该串在需求档已零命中（现值「用毕即删」），与本笔无关。
- 同一门内两份提示词档零命中：段落过长 0 · 行过长 0 · 锚 0。门读数照原文记红，未改写成绿。

**审计 ∥ 修正 ∥ 终态**

- 内部审计（explore 只读对照 §2）= 1 轮，结论 `clean`（四类偏差 none found：七行逐字全中、结构基线不变、旧名清零、落点与条间无空行、单测未扩）。
- 其唯一 `unverified`（「同段其余各句与 HEAD 逐字节相同」——审计席无 git 工具）由本笔自行闭合：`git diff -- thincoder-core/prompts` 显示 `common.md` 只有该节那两行与 §Document search 自引一处共两个 hunk，`persona-engineering.md` 只多出三条新行。
- advisor 代码评审轮 = 0：父侧本轮显式收束为三件（§5 落盘 ∥ A4 记红 ∥ 交报告停），不再开评审轮。
- 修正轮 = 0（无自纠）。**终态 = 实现完成 · A4 待设计席收两处引缺后复跑。**

**边界内外**

- 声明三档以外零改：`docs/core/design/PROMPT-SYSTEM.md` 与 `docs/core/requirements/ENGINEERING-MODE-V2.md` 未动（两处处置归设计席 ∥ 主 agent）。
- **工作树里有一处非本笔改动**（据实披露，不计入本笔）：`thincoder-core/prompts/persona-engineering.md` 的 `## Ledger (requirement pool / tech todos) — batching & lifecycle` 一带带未提交改动（快速通道条目删除 ∥ 条目重编号），本笔未写该节，归属由父侧判。
- 集成套件零改：设计档判 `none`（改动面是提示词文本，无用例读提示词）——未新增 ∥ 未删 ∥ 未改任一用例。
- 体量：落盘七行最长 175 字符（`A1_maxLen` 读数）；批内单测档 26 行（`doc_check` 的 `lines` 读数，`CountContentLines` 量法），不属产品代码面，收口删。

**设计档漂移（上报，本席不改）**

- `docs/core/design/PROMPT-SYSTEM.md` §6.86 的两处引文已失效（即 A4 的两处 `引缺`）；处置已由父侧定：① 引文换成新首句；② 那半句按需求档现况删。落完复跑 A4 即绿。

## §6 验证与收口（父代理）

### 验证与收口

**父侧终验（本轮实跑，命令与首行原文）：**

```
doc_check(mode:"gate", docs=[PROMPT-SYSTEM ∥ ENGINEERING-MODE-V2 ∥ 本批档 ∥ common.md ∥ persona-engineering.md])
  ⇒ DOC-CHECK GATE: PASS   0 段有问题（5 档全清）

node scripts/prompt-refs-check.mjs
  ⇒ OK(prompt-refs): J1/J2/J3 三式零命中（提示词面 71 档 · 代码面 489 档 · 命中 0）

node test/run.mjs（thincoder-core）
  ⇒ "no integration test set — this package has none (requirement N20)"
     该包无集成集，此跑不证明任何事（已知债，见下）
```

**实施读数（设计席与实施席两处独立取过，一致）：**

```
A1_common 1,1,1 ∥ A1_persona 1,1 ∥ A1_maxLen 175（≤300，非 null）
A2_common 22,28 ∥ A2_persona 18,23（结构零连带）
A3_oldName 0（改前 2：节标题 ∥ 同档自引）
单测 5/5（收口已删，读数留 §5）
```

**单测档：已删**（`docs/batches/2026-11-08-answer-check-docs.test.mjs`，26 行，五条断言 = 五条目标串各恰一处）。§5 留读数，无执行件。

**集成测试：本批零改**——`test/RTM.md` 全文扫「描述 ∥ description ∥ tool-docs」零命中，无既有用例断言提示词文本；两条入口（产品真需要的场景 ∥ 生产真出现过的问题）皆不成立。

**四步链**：§1 讨论（缺口实读 + 用户两道令）→ §2 设计（逐字终稿 + 钉引文落点 + A1–A4）→ §3 评审两轮（轮 1 `changes-required` 1 红 6 黄 1 蓝 → 轮 2 `pass`，0 红）→ §4 用户批准（17:31「common.md里要约定,另外工程模式主agent的提示词里也要补」）→ §5 实施（三档）→ §6 本段。

### 收口对账

- **§2 ↔ 设计档**：判据一律引 `docs/core/design/PROMPT-SYSTEM.md` §6.86 的 `A1`–`A4`，§2 不重述读数；两处终稿文本在 §2 与设计档逐字一致（落地后 `A1` 五串各恰一处即为证）。
- **§2 ↔ §5**：§5 记的读数与上面父侧复核一致；无差异需记。
- **前批遗留**：无（本条独立，`前情 = tool-desc-trim（进行中）`，两者的改动面无交集：本批只动两份提示词档与设计档 §6.86/需求档 §13.16）。
- **修正轮落地前置**：三轮修正（#108 七条 ∥ #112 两笔 + 命令坏锚 ∥ #114 两笔）均已落地并验过，门 `PASS` 后才进本段。
- **暂缓批复核**：无。
- **用户面同步**：提示词面行为变化 = 答子席上抛前先查档；无界面，无需同步。

### 本轮暴露的三类根因（写下来，因为它会长回来）

1. **我的笔改了别人正在引的档**：17:38 我改需求档，设计席 17:36 读的盘就过期了。**改动落地必须同轮扫在途批档的引用**——这一条我当天已犯过一次（§3 轮 1 的 🔴）。
2. **状态档里放过程**：时刻、修订史、旧形引文。**引一句已不在盘上的话，下一个读者 grep 得 0，会以为整张表是编的。**
3. **判据的漏量比判据的错更危险**：命令 ⑧ 的锚少一个 `- ` 前缀，人格档恒 `null` 被 `.filter` 丢掉，`160` 与 `175` 都是绿。**假绿不会报错。**

### 声明

**本批未验证**：`A1`/`A2` 所据的两份提示词档在评审轮为范围外（`unverified`），父侧终验已在本轮实跑补齐；`thincoder-core` 无集成集，**交付未获集成测试验证**——本轮唯一的测试把关是上面三条命令。
