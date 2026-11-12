# 2026-11-12 · restate-before-spawn
> 六段，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 每段只有一个作者：作者的段可 `append` 加内容、可就地改（`edit`）；非作者一概拒。
> 编制：主 agent · 2026-11-12 · 来源 = 用户 2026-11-12 14:48「你在帮我改一下工程模式的提示词：spawn 设计器前要先复述你对用户的理解，收到用户的明确开工指令，才能开工，不是你觉得的隐含意思」；14:41「你就不能问清楚了，复述一下你的理解，让我确认了再开工吗？要等我明确给开工命令」。。
> 台账 = #2356（core · 归批）。前情 = 无（独立批）。
## §1 讨论（主 agent）
**状态行**：🔄 进行中（…）
批起 sha = a3daddd838ea13544261c873a8851ca1585bbb20
<§1 模板占位：本批条目 / 关键判据 / 授权口径>

**要解决的问题**

现有条文只说「设计评审与实施开工由用户点火」，没说**点火之前要先对齐理解**。于是「他说了需求」被读成「他让我开工」，理解错也照开——本会话一小时内三次：

- 把「必须报改前读数」读成「读数与结构二选一」，开工后返工；
- 把用户没说完的话当说完，开工，被迫取消子代理；
- 验收标准里钉「表里有七行」这种会随本批增长的量，开工后才发现。

**要的工序**：派设计席之前，先把「我理解你要什么」复述给用户——要做什么、落在哪、判据是什么——**等用户明确说开工，才 spawn**。「他大概是这个意思」不构成开工。

**为什么**：复述一次的成本是一句话，理解错直接开工的成本是一整轮返工加一次取消。

- **已定决定**：派设计席前先复述理解、等用户明确开工再 spawn，不许拿隐含意思当开工 · 用户原话：「spawn设计器前要先复述你对用户的理解，收到用户的明确开工指令，才能开工，不是你觉得的隐含意思」 · 时间：2026-11-12 14:48

**库内 = 已查**：查询「spawn 设计席前 复述 开工」→ 命中 `thincoder-core/prompts/persona-engineering.md`（Call chain：batch-discussion closure → spawn eng-designer）· 同档「Advance & stop」段（由用户点火）· `thincoder-core/prompts/discipline-engineering.md`（四步工序）。三处都讲「谁点火」，无一处讲「点火前对齐理解」。

**库外 = B 类**：改动面 = `thincoder-core/prompts/persona-engineering.md`；外部断言 = 零（提示词文本）。

- **已定决定**：开工判据 = 固定词表，词表不许自己加，遇到含义不清的停下来问 · 用户原话：「c，开工和几个常见的开工含义的词。」「词表不允许加，否则太乱，碰到含义不明确的，停下来确认。」 · 时间：2026-11-12 14:52–14:53
- **已定词表**：开工 · 开批 · 开始 · 动手 · 干吧 · 就按这个来 · 批准（七个，固定）

**为什么用词表而不是「明确」**：同一个「明确」，说的人和读的人不是一回事。判据落到词上，读的人照字面认，不用猜语气。
**为什么词表不许加**：能加就退回「我觉得他是在开工」，判据又变主观。碰到不在表里的、或像又不像的，停下来问一句——问一句比猜错一轮便宜。

## §2 批次任务与设计（eng-designer）
**状态行**：设计完成


**本批条目（覆盖）**

| # | 条目 | 判据依据（回指） |
|---|---|---|
| E1 | 派设计席前先复述理解，等七个开工词之一再 spawn | design §6.99 落点② |
| E2 | 词表外的回复不算开工；像又不像的先问一句 | design §6.99 落点②第二行 |
| E3 | 触发序：讨论收口不再直接派席，链条里插出复述与等待 | design §6.99 落点① |
| E4 | 词表封闭七个，不加词、不自行扩展 | design §6.99 落点② · K5 |
| E5 | 修轮重派照走复述与开工词；唯一例外 = 用户已给自动推进（该状态记在批档 §1 一行，不读对话） | design §6.99 K6 ∥ K7 ∥ B5 ∥ A7 |
| E6 | 笼统授权（`你看着办` ∥ `你安排` ∥ `随你`）不是整批令：不豁免复述、不 spawn | design §6.99 落点② 第 7 ∥ 8 行 · B6 · K8 · A8 |

**本批不做（明确不在本批）**

- 不改 `The user's next explicit instruction resumes advancement` 那一行本身（词表是它的收窄，见 design §6.99 K2）。
- 不动 FR32 的「批准即实施启动」（eng-coder 侧的门）。
- 不改 `## Firing-rights boundary` 的枚举、不加新节、不加禁令清单。
- 不改标准层 F7-2（`docs/core/standards/METHODOLOGY.md`）——只引不改，裁定权在用户（台账 `#2346`）。
- 不新增机检门、探针脚本、常驻单测档。

**设计档落点**：`docs/core/design/PROMPT-SYSTEM.md` §6.99（已落，本轮）。

**受影响文件（机读清单）**

```text
| 档 | 分拆方案 |
|---|---|
| thincoder-core/prompts/persona-engineering.md | — |
```

**改前读数（逐档现量 · 量法 = node 行扫描 `readFileSync(...).split('\n').length`，本节写作前量）**

- `thincoder-core/prompts/persona-engineering.md` = 500 → 未越 500 线（等于 500，规则判「超过 500」），无需分拆方案。
- `docs/core/design/PROMPT-SYSTEM.md` = 10379（写作前）→ 设计档，不属源 / 测试档的 500 / 800 / 300 三条线；按既有 §6.NN 追加节生长（先例 §6.98）。

**分层结论**：零档越线，本批无分拆方案。

**变更面（两处 · 改前 → 改后）**

| # | 位置 | 改前 | 改后 |
|---|---|---|---|
| ① | `## Call chain` 首行 | `Batch-discussion closure → **spawn eng-designer** (…)` 一行 | 拆两行：先 `restate your understanding to the user and wait for a start word`，再 `spawn eng-designer` |
| ② | `## Advance & stop` | 该节无设计席的开工条件 | 增十行 `>`：七个开工词 + 词表外不算 + 收窄既有接受词 + 修轮照走 + 自动推进例外 + 例外读盘 + 笼统授权不是整批令 + 按范围判 + why 两行（逐字块见 design §6.99） |

**验收读数（回指 design §6.99 A1–A8 · §2 不抄判据）**

- A1 触发序在位 · A2 词表在位 · A3 非开工面在位 · A4 词表封闭 · A5 零禁令且零新节 · A6 文档门 PASS · A7 修轮照走复述、自动推进为例外 · A8 笼统授权不算整批令（按范围判）。
- 读法 = 打开对应节逐字读；`##` 计数由实施席以同一条 node 行扫描报改前后两次数。

**关键决策**：见 design §6.99 K1–K8（K1 两处落点 · K2 收窄不改原行 · K3 开工词 = 对复述的答复 · K4 复述三件 · K5 中文原字面 · K6 修轮照走、自动推进为例外 · K7 自动推进记在 §1 一行 · K8 笼统授权按范围排除）。

**边界**：只改 `thincoder-core/prompts/persona-engineering.md` 两处；其余档零笔；本设计轮提示词零笔，实施轮由 eng-coder 依 design §6.99 围栏块落笔。

**上抛项**：一条 —— 关键决策表「被否」列与标准层 F7-2 正面相反（F7-2 住 `docs/core/standards/METHODOLOGY.md`，判定句「不含被否候选列」；冲突已入账台账 `#2346`，待讨论）；谁裁 = 用户，条件 = 用户裁禁该列即删列，到期 = 台账 `#2346` 结案时一并销。

**对 §1 的一行依赖（作者 = 主 agent）**

§1 记入 `- **自动推进**：<范围> · 起于 <时间> · 用户原话：「<逐字>」`。无这一行 ⇒ 视为未给自动推进，照走复述与开工词。

形与读点单源 = design §6.99「自动推进态住在哪」；本节不写 §1。

**修正轮（用户三条裁定 · 2026-11-12）**

裁定来源 = 实施席落地时读出三条措辞问题，用户裁「全部要改」。改面 = design §6.99；提示词档本席零笔，由实施席后续落笔。

| # | 裁定 | 改在哪 | 改前 → 改后 |
|---|---|---|---|
| R1 | 收窄句少算第三句 | 围栏块 第 3 行 → 第 3 ∥ 4 ∥ 5 段 | `two sentences` → `three sentences`，并逐字列入 `What counts as approval is intent, not wording`（`"approved", "ok, go with it", "yes, do it"`） |
| R2 | 收窄句漏引尾半句 | 同上 | `("ok / continue / start")` → `("ok / continue / start" or a specific next-step order)`，并写明它同样不是七词之一 ⇒ 照走一句反问 |
| R3 | 谓词漂 | 围栏块 第 8 行 → 第 10 段 | `naming every step of this batch as done` → `covering the firing of every step in this batch`（与 `## Firing-rights boundary` 的定义同谓词） |

**连带改的行（同轮）**

- 对照表 4 行：`resumes advancement` 行（补尾半句及其处置）· `What counts as approval` 行（由「两个门两个时点」改为「本门一并收窄」并给出不收窄的后果）· 整批令定义行（谓词统一）· `Restate before you write` 行（段号改 3 ∥ 4 ∥ 5）。
- 验收 3 行：A3（补三句逐字 ∥ `a specific next-step order` 的处置）· A8（补「同谓词」这一判物）· A6（行宽判对象收成「提示词档全档 ∥ 围栏块」——新 A3 ∥ A8 表行超过 300，而表格行本不成段落，原判物「本节逐行」自始判不了）。
- 决策表 2 行：K2（由「收窄一行」改为「收窄三句、逐字零改」并记第三句为何最该收）· K8 理由（谓词统一）。
- 段号重编：第 3 行变三段 ⇒ 原第 4–8 行整段后移两位；重复性判断 ∥ 对照表 2 行 ∥ 用例 C6 ∥ 验收 A7 ∥ A8 共七处段号按新序改。

**读数（量法 = node 行扫描 · 改后现量）**

- design §6.99 围栏块 = 12 行（改前 10 行；第 3 行拆三段 +2，第 8 行换字 0 行）。
- 围栏块逐行码点数 = 297 ∥ 204 ∥ 234 ∥ 142 ∥ 204 ∥ 242 ∥ 238 ∥ 250 ∥ 253 ∥ 299 ∥ 194 ∥ 199，最大 299（≤300）。
- 禁令词（`never` ∥ `must not` ∥ `do not` ∥ `forbidden` ∥ `禁止` ∥ `不得`）对改动行 = 0 命中。
- 七个中文开工词在围栏块内只出现在第 1 段，别段 0 命中。
- 围栏块引的八处既有句逐字在盘，命中 8/8 —— `thincoder-core/prompts/persona-engineering.md` 的 `## Firing-rights boundary` 节（`What counts as approval is intent, not wording` 与其举词）· `## Confirmation & approval gate` 节（`Restate before you write` 的接词式）· `## Advance & stop` 节（`resumes advancement` 整行含尾半句 · 整批令定义句）。
- `doc_check(mode:"gate")` 对 `docs/core/design/PROMPT-SYSTEM.md` 首行 = `DOC-CHECK GATE: PASS`。
- design 档改后 = 10564 行（本节追加前）。

**对实施席的一处后果**（不是本席的笔）：围栏块 10 → 12 行 ⇒ 提示词落笔后 `persona-engineering.md` 应为 513 行（500 + 1 箭头链拆行 + 12 围栏块）；§5 记的 511 行与「逐字节相等 10/10」都是上一版围栏块的读数，须对新围栏块重跑。

## §3 设计评审（评审子代理）
**状态行**：评审通过



### 轮次 1（评审子代理）

| # | 严重度 | 状态 | 证据（指针） |
|---|---|---|---|
| 1 | 🔴 | open | design §6.99 落点② 首行「before you spawn eng-designer, restate what you understand the work to be」无条件；K6「修轮重派不重走复述」· B5 · 用例 C4 在两块逐字文本与 A1–A6 里都没有对应句 / 验收行；批档 §2 条目 E5 =「全面令先于复述不算开工词；修轮重派不重走复述」· 依据 = design §6.99 K3 ∥ B5 |
| 2 | 🟡 | open | design §6.99 无「既有件三问」；`thincoder-core/prompts/persona-engineering.md` 的 `## Firing-rights boundary` 句「An agent that self-judges "discussion is settled" and fires review/development on its own is not engineering mode.」未进对照表 |
| 3 | 🟡 | open | design §6.99 B2 出处 =「用户本轮「遇到像又不像的，停下来问一句」」；批档 §1 原话 =「碰到含义不明确的，停下来确认。」，§1 正文 =「碰到不在表里的、或像又不像的，停下来问一句」⇒ 「」内非逐字 |
| 4 | 🟡 | open | 同档 `## Confirmation & approval gate` 的「Restate before you write」（`"OK / sure / continue" type`）与 design §6.99 落点②「A reply outside those seven is not the start — `行` / `可以` / …」并存；§6.99 对照表该行只谈读者与复述要点，未处理接受词面 |
| 5 | 🟡 | open | design §6.99 A4 后半「别处读不到第八个开工词 ∥ 可自行扩展的措辞」与 A5「两处新增内读不到禁令词」无判定物；A4 前半「七个词只在落点②出现一次」本轮实测成立（全档七词零命中） |
| 6 | 🟡 | open | design §6.99 关键决策表带「被否」列，与需求档 F7-2「关键决策记录为「决策 + 一句理由」（**不含被否候选列**）」相左；同档 §6.96.13 ∥ §6.98 同形在先（R1 记报不改） |
| 7 | 🔵 | open | design §6.99 落点② 尾锚「`> **Without a batch-wide go-ahead**` 那一行」全档 3 处（`## Firing-rights boundary` ∥ `## Advance & stop`），仅因已点名节才可解析 |

已核 · 未成条（四条）：

- `test/RTM.md` 的 `CLI 20` 恰一处，与 §6.99 集成测试设计的读数一致。
- `thincoder-core/prompts/persona-engineering.md` 实读 500 行，与批档 §2 改前读数及「未越 500 线」一致（且 `.md` 免档位判定）。
- §6.99 引的七处既有句逐条在盘：`Batch-discussion closure → **spawn eng-designer**` ∥ `The user's next explicit instruction resumes advancement` ∥ `Stop-and-check is intent, not a word list` ∥ `What counts as approval is intent, not wording` ∥ `design reviews and implementation starts are both fired by the user, not by you.` ∥ `the user replying with a new question/requirement means no approval` ∥ `Restate before you write`。
- K5 的中文字面依据成立：§6.30 的 K4 类 = 「用户会说的中文别名（`会诊` · `飞刀`）」。

VERDICT: changes-required
计数：🔴 1 · 🟡 5 · 🔵 1

### 轮次 2（评审子代理）

**轮次 2 · 先核上轮七条处置**

| # | 严重度 | 状态 | 证据（指针） |
|---|---|---|---|
| 上轮 1 | 🔴 | 已闭 | §6.99 落点② 第 4∥5∥6 行「A fix round is not an exception」∥「The one state that lifts the gate is that go-ahead」∥「That state is read off the disk, not from memory」+ 验收 A7 + 用例 C4∥C4b + 分支 B5 + 决策 K6 |
| 上轮 2 | 🟡 | 已闭 | §6.99「既有件三问（`start word` ∥ 七个开工词 ∥ 复述这一步 · 读者 = spawn 设计席的主 agent）」三条齐；对照表新增「An agent that self-judges」行 |
| 上轮 3 | 🟡 | 已闭 | B2 出处「碰到含义不明确的，停下来确认。」与批档 §1 原话逐字同 |
| 上轮 4 | 🟡 | 已闭 | 落点② 第 3 行「This list narrows two sentences in this file」+ 对照表「Restate before you write」行 |
| 上轮 5 | 🟡 | 已闭 | A4「判「有没有第八个词」的物 = 命中行数」∥「判「可自行扩展的措辞」的物 = 落点② 首两行逐字读」 |
| 上轮 6 | 🟡 | 未闭 · 本轮 #2 | 关键决策表仍带「被否」列；上抛项 + 台账 `#2346` |
| 上轮 7 | 🔵 | 未闭 · 本轮 #1 | 落点②「两行整行都只在 `## Advance & stop` 内出现一次，锚不靠节名也解得开」无读数（上轮实测尾锚前缀全档 3 处） |
| F7-2 收正 | 🟡 | 已闭 | 「与它正面相反的一条住在标准层，逐字：」+ 依据 `docs/core/standards/METHODOLOGY.md`「| F7-2 |…」逐字与标准层同（本席复核） |

**本轮发现**

| # | 严重度 | 状态 | 证据（指针） |
|---|---|---|---|
| 1 | 🟡 | open | §6.99「两行整行都只在 `## Advance & stop` 内出现一次，锚不靠节名也解得开」— 断言无读数，与 §3 轮次 1 第 7 条的读数（3 处）不符 |
| 2 | 🟡 | open | 关键决策表第四列「被否」（如 K8 「把 `你看着办` 从非开工示例里删掉」）vs F7-2 判定句「（**不含被否候选列**）」；已上抛 + 台账 `#2346` |
| 3 | 🟡 | open | 「既有件三问」只覆盖 `start word` ∥ 七个开工词 ∥ 复述这一步；落点② 第 7 行新建的 `A blanket "you decide"` 无三问 |
| 4 | 🟡 | open | 重复性判断「新行给出排除项」只对第 7 行成立；第 8 行「a batch-wide go-ahead earns its exemption by naming every step of this batch as done」把受令范围换词又写一遍（既有条为「covering the firing of every step in that batch」） |
| 5 | 🟡 | open | §6.99「自动推进态住在哪」定批档 §1 行的形，而批档面归 `docs/core/design/BATCH-RECORD.md`（文档地图登记）；该档未登记此行 |
| 6 | 🔵 | open | 落点② 首行与第 8 行本席估算 ≈295 字，逼近 A6 的 300；A6 无实测读数 |
| 7 | 🔵 | open | `docs/core/standards/METHODOLOGY.md` 档头「# 方法论（METHODOLOGY）· 需求」与 §6.99「住在标准层」并存（上轮假事实的来源面） |

VERDICT: pass

计数：🔴 0 · 🟡 5 · 🔵 2

### 轮次 3（评审子代理）

**复评（围栏块 10→12 行 · 段号全表重编 · 第三句与 `a specific next-step order` 处置 · 谓词回到点火）**

| # | 严重度 | 状态 | 证据（指针） |
|---|---|---|---|
| 1 | 🟡 | open | §6.99 落点② 段3「the advancement line just above」——块整段落在那行之后，段3 正上方是段2「A reply outside those seven is not the start」，指错一格 |
| 2 | 🟡 | open | 验收 A1–A8 只读到段1–10（A3 = 3∥4∥5、A7 = 6∥7∥8、A8 = 9∥10）；段11∥12「**Why the list, not the tone**」那一对无验收行、无用例，删掉全绿 |
| 3 | 🟡 | open | 「自动推进态住在哪」定批档 §1 行形 → 边界「本节只定这一行的形与读点，不写 §1」；未点名 `docs/core/design/BATCH-RECORD.md` 对账 |
| 4 | 🔵 | open | 验收表「回指本批条目」＋ `E1`–`E6` 标签：本档无一处枚举，也未写它们在哪个容器（§6.96.11 就地枚举过 C1–C9） |
| 5 | 🔵 | open | 缺 `Interface contract` 行；其点名的两处先例（§6.97 ∥ §6.98）都有一行「不适用」 |
| 6 | 🔵 | open | A6 判据含「本节围栏块」≤300 码点；实测段1 ∥ 段10 落在 295–299（探针 `^> .{293,}$` 命中、`^> \*\*The design seat is the one spawn.{264,}$` ∥ `^> \*\*The criterion is scope.{274,}$` 不命中），余量 1–5 |
| 7 | 🔵 | open | 已核不重开：段号重编七处（A3 ∥ A7 ∥ A8 ∥ C6 ∥ 对照表 3 行 ∥ 对照表 5 行 ∥ 重复性判断）与 12 行块逐一对得上；「增列十二行」与围栏块行数相等；F7-2 被否列冲突已由上抛项 + 台账 `#2346` 承载 |

VERDICT: pass

计数：🔴 0 · 🟡 3 · 🔵 4（合计 7）

### 轮次 4（评审子代理）

### 代码评审 · 实施面（12 行围栏块 ∥ 箭头链拆行）

| # | 严重度 | 状态 | 证据（指针） |
|---|---|---|---|
| 1 | 🟡 | open | 落点② 段7「the seat spawns with neither restatement nor wait」无「本批首个开工词已落」这一界；与 `## Firing-rights boundary` 的「the authority to fire **every step** in that batch」并读 ⇒ 批起即给整批令时可零复述 spawn，与批档 §1 已定决定「spawn设计器前要先复述你对用户的理解」相反；design §6.99 K3 半句「全面令先于复述时不算」无对应句。归设计席 |
| 2 | 🟡 | open | 落点② 段3「the advancement line just above」——该行在围栏块之外，段3 正上方是段2「A reply outside those seven is not the start」；同 §3 轮次 3 第 1 条（设计面）同族。归设计席 |
| 3 | 🟡 | open | 落点② 段8「the batch record §1 line **自动推进**」；`docs/core/design/BATCH-RECORD.md` 登记「§1 段体允许**一类**标记行」+ 形 `- **已定决定**：`，该档 `自动推进` 零命中 ⇒ 读点指向一条无归属登记的行；同 §3 轮次 2 第 5 ∥ 轮次 3 第 3 条同族 |
| 4 | 🔵 | open | 落点② 段3「This list narrows three sentences in this file」不带作用域；「For this seat」只在段5 ⇒ 单独读段3 可把写盘门（`("OK / sure / continue" type)`）一并读窄 |
| 5 | 🔵 | open | `你看着办` 在段2 与段9 各一遍（分类一致：两次都不是开工词、都不是整批令），两处读点可合一 |

已核（不改）：12 行与 design §6.99 围栏块按同时读出的两段文本逐行同文 · 落点① 两行同文 · 档 513 行 · `## ` 标题 17 · 七个开工词全档只命中落点② 首行 · 禁令词集对块内 12 行零命中 · `naming every step` 零命中、`covering the firing of every step` 与 `## Firing-rights boundary` 同谓词 · `doc_check` 对整档 `DOC-CHECK GATE: PASS`。

VERDICT: pass

计数：🔴 0 · 🟡 3 · 🔵 2

## §4 用户批准（主 agent）
## §5 实施记录（eng-coder）
**状态行**：实施完成 · 2026-11-12（围栏块重落 12 行 · 与设计档逐字节相等 12/12 · 档 513 行 · A1–A8 逐条读得到 · 审计 1 轮 clean + 代码评审 1 轮 pass（去 §3 轮次 4）· must-fix 0 · 终态 clean）



> 本段作者 = eng-coder（实施席）· 批次 `2026-11-12-restate-before-spawn` · 台账 `#2356`。

### 一、落笔（两处 · 逐字照 design §6.99 的围栏块，未改一字）

| # | 落点 | 改前 | 改后 |
|---|---|---|---|
| ① | `thincoder-core/prompts/persona-engineering.md` 的 `## Call chain` 首行 | `Batch-discussion closure → **spawn eng-designer** (\`subagent(role="eng-designer", …)\`)` | 拆两行：`Batch-discussion closure → **restate your understanding to the user and wait for a start word**` ∥ `→ **spawn eng-designer** (\`subagent(role="eng-designer", batchDoc=<this batch's record path>, files=[...], round="initial")\`)` |
| ② | 同档 `## Advance & stop` | 该节无设计席开工条件 | 在 `> **The user's next explicit instruction resumes advancement** …` 之后、`> **Without a batch-wide go-ahead, once the review has passed, the approval is that word** …` 之前，增列十二行 `>`：七个开工词 / 词表外不算 / 收窄三句（写盘门 ∥ 恢复推进 ∥ 批准门，逐字各列一段）/ 点名第三句 `What counts as approval is intent, not wording` / `a specific next-step order` 照走一句反问 / 修轮照走 / 自动推进为例外 / 例外读 §1 那一行 / 笼统授权不豁免 / 按范围判且与整批令定义同谓词 / why 两行 |

**逐字校核**：改后十二行与 design §6.99 围栏块的十二行**逐字节相等**（`JSON.stringify` 逐行比对，12/12 true）；落点① 两行与设计档落点① 两行亦相等（2/2 true）。量法 = `node` 读两档、按行取串比较。

**未动的**（design §6.99 边界逐条）：`The user's next explicit instruction resumes advancement` 那行本身、`## Firing-rights boundary` 全节、`## Confirmation & approval gate` 全节、FR32 的「批准即实施启动」、`common.md` ∥ `discipline-engineering.md` ∥ `persona-eng-designer.md` ∥ `persona-eng-coder.md` ∥ 标准层 —— 零笔。

### 二、读数（改前 ∥ 改后 · 同一条 node 行扫描）

| 读数 | 改前 | 改后 | 判 |
|---|---|---|---|
| 行数（`readFileSync(...).split('\n').length`） | 500（本批改前）∥ 511（重落前） | 513 | 本批 +13 = 拆行 +1 ∥ 增列 +12；重落这一轮 +2（第 3 段拆三段、谓词换字 0 行） |
| `## ` 标题数（`/^## /` 逐行） | 17 | 17 | A5「零新节」成立 |
| 七个开工词命中行（`开工`∥`开批`∥`开始`∥`动手`∥`干吧`∥`就按这个来`∥`批准`，逐词 `includes`） | 各 0 行 | **各恰 1 行，同一个行号**，该行落在 `## Advance & stop` 节内 | A2 ∥ A4 前半成立（无第八个词面） |
| 禁令词命中（`never`∥`must not`∥`do not`∥`forbidden`∥`禁止`∥`不得`，对新增的 12 行逐行） | — | 各 0 | A5「零禁令」成立 |
| 两处锚行在档内出现次数 | — | `…resumes advancement` 整行 1 次 ∥ `Without a batch-wide go-ahead, once the review has passed…` 整行 1 次 | design §6.99「两行整行只在 `## Advance & stop` 内出现一次」按**整行**读成立（§3 轮次 1 第 7 条的 3 处，是那两行的**前缀**命中，不是整行） |
| 行最长者（码点计） | — | 全档 300（L181，非本笔新增，本批前后同值）；本笔新增的 12 行最长 299 | A6「逐行 ≤300」成立；`doc_check` 判「超过 300」故不报 |
| `doc_check(mode:"gate")` 对提示词档 | — | 首行 `DOC-CHECK GATE: PASS` | A6 前半成立 |

**行数越 500 与分拆义务**：改后 513 行，但 `.md` 不在行数判据的判定对象内 —— 依据 `docs/core/standards/CODE-TIER.md`「对象 = 源文件 ∥ 测试文件。文档面（设计 ∥ 需求 ∥ 批次 ∥ 台账）不受行数限制」+「读到一份 `.md` 的行数，那是读数，不是判据的触发物——不因它启动任何拆分讨论」。

实现面同判 = `thincoder-core/agent-tools/batch-tier-gate.mjs` 的 `const CODE_EXTS = Object.freeze([".mjs", ".cjs", ".js"])`（`.md` 无后缀入列 ⇒ `isCodePath` 为假、不量）。

故 §2「零档越线、无分拆方案」的结论成立；这里记的是**改后读数**，不改 §2 的改前读数。

### 三、验收逐条（回指 design §6.99 A1–A8 · 读法 = 打开对应节逐字读 + 上表读数）

| # | 条目 | 判 | 读到的物 |
|---|---|---|---|
| A1 | 触发序在位（E3） | ✅ | `## Call chain` 首行是 `restate your understanding to the user and wait for a start word`，`→ **spawn eng-designer**` 在其下一行 ⇒ 复述在 spawn 之前 |
| A2 | 词表在位（E1） | ✅ | `## Advance & stop` 内读到 `before you spawn eng-designer, restate what you understand the work to be` 与七个词逐个 |
| A3 | 非开工面在位（E2） | ✅ | 同节读到 `A reply outside those seven is not the start` 与 `gets a single question back`；第 3 ∥ 4 ∥ 5 段把被收窄的三句逐字列出（`"OK / sure / continue" type` ∥ `"ok / continue / start"` 带 `a specific next-step order` ∥ `What counts as approval is intent, not wording`），并写明 `a specific next-step order` 同样照走一句反问 |
| A4 | 词表封闭（E4） | ✅ | 命中行数 = 1（读数在上表）；`one of seven start words:` 起、`批准`.` 收；首两行读不到 `such as` ∥ `etc` ∥ `or similar` |
| A5 | 零禁令 · 零新节 | ✅ | 禁令词 0 命中；`## ` 计数 17 → 17 |
| A6 | 文档门 | ✅ | `DOC-CHECK GATE: PASS`；提示词档逐行 ≤300 |
| A7 | 修轮照走 · 自动推进为例外（E5） | ✅ | 第 6 ∥ 7 ∥ 8 段三句齐：`A fix round is not an exception` ∥ `restate again and wait again` ∥ `with neither restatement nor wait`；例外口径读 `the batch record §1 line **自动推进**`，不读对话 |
| A8 | 笼统授权 ≠ 整批令（E6） | ✅ | 第 9 ∥ 10 段：`A blanket "you decide" is not that state` ∥ `你看着办` ∥ `你安排` ∥ `随你` ∥ `The criterion is scope, not warmth` 逐一读得到；第 10 段豁免口径 = `covering the firing of every step in this batch`，与 `## Firing-rights boundary` 同谓词（旧谓词 `naming every step … as done` 已 0 命中） |

### 四、决策披露（逐条 · 含不在我笔内的观察）

| # | 事项 | 处置 ∥ 披露 |
|---|---|---|
| 1 | 本档在改动前已有他人未提交的工作树改动（`doc_check` 档名解析六行、`Landing check` 三行，属前几批的活） | 非本笔。`git diff` 该档共三个 hunk，前两个是本笔落点①②，第三个是这批存量。本笔一字未碰第三个 hunk，也未为它签字；未提交的 hunk 记不得作者，故归属 = `unverified` |
| 2 | §3 轮次 2 遗留的开放项（🟡1–5 · 🔵1–2，VERDICT 已 `pass`） | 均在**设计档 ∥ 评审面**，不在提示词面，本席笔外（设计档归 eng-designer）。本笔只按围栏块逐字落；其中第 1 条我已在本段「二、读数」给出该断言的整行读数，供父侧 ∥ 评审直接引用 |
| 3 | 第 3 段写的「the advancement line just above」 | 该段正上方是第 2 段（`A reply outside those seven is not the start`），所指的 `resumes advancement` 实际在其上两行。本笔一字未改（逐字落笔，改字 = 设计变更 + 复审）；这一格偏差已在 §3 轮次 3 第 1 条的设计面记着，处置权在设计席 |
| 4 | 落点② 第 6 行引用批档 §1 一行 `**自动推进**` 的形 | 该行的形归 §1 作者（主 agent）；本笔只落提示词面的读点，§1 未写 —— 属 §2「对 §1 的一行依赖」，非本笔缺件 |
| 5 | 本批无新增文件、无删档、无单测档 | 改动面 = 一档 `.md` 的文本；无可执行面，故无单测档、无 `node --check` 对象 |

**落地核对：无**。本笔未使 design 任何一句变假：§6.99 关于「围栏块 12 行」「七词只在落点② 首行出现一次」「零禁令零新节」「修轮照走」「整批令按范围判且与既有定义同谓词」的断言，逐条按上表读数成立。

### 五、内部两轮（上一版 10 行围栏块那一次 · 读数已作废，现态见六）

**① 内部偏离审计（explore · 只读）· 1 轮** — 结论行 `DIVERGENCE VERDICT: findings(1)`；四类偏差（部分实现 ∥ 静默简化 ∥ 文档漂移 ∥ 越界改动）对两处落点**均为无**。

| # | 处置 | 内容 |
|---|---|---|
| 1 | 已修 | 审计报「§5 当时为空、实施读数不在盘」。修法 = 本段已落（一、落笔 ∥ 二、读数 ∥ 三、验收 ∥ 四、披露 + 落地核对行） |
| 附注 | 采纳不记偏差 | 审计另报「本档第三个 hunk 属前批存量、作者不可考」，与本段披露第 1 条同口径 |

**② 内部代码评审（advisor · code）· 1 轮** — `VERDICT: pass`；计数 🔴 0 · 🟡 4（其中 1 条是父侧协调项）· 🔵 3；四条 🟡 均**未**标 must-fix。

**处置口径**：七条里没有一条要求本笔改字 —— 落点是 design §6.99 围栏块的逐字搬运，字面自由不在本席（改字 = 设计变更 + 复审）。

故 🟡1–3 与 🔵5–7 归设计席，🟡4 归父侧（§4 正文）；逐条原文与证据住本席交付报告，此处只记去向。

其中 🟡1 ∥ 🟡2 ∥ 🟡3 都指向「收窄面 ∥ 整批令口径」的措辞面，与 §3 轮次 2 的开放 🟡1 ∥ 🟡4 同族；🟡4 = 本批批档 §4 无正文，按同档 `## Batch-record lifecycle` 第 3 条，收口会拒。

**终态（那一版）**：`clean`（审计 1 轮收敛 · 评审 1 轮通过 · 自修轮 = 1（补写本段）· 无遗留 must-fix）。这一段记的是 10 行那版的关；12 行这版的关与终态见「六」。

### 六、重落这一轮的两道内部关（自包含交付协议）

**① 内部偏离审计（explore · 只读）· 1 轮** — `DIVERGENCE VERDICT: clean`；四类偏差（部分实现 ∥ 静默简化 ∥ 文档漂移 ∥ 越界改动）**均无**。

独立复核的方式 = 逐行 SHA256（`read hashes:true`）比对：提示词档 L103–L114 与 `docs/core/design/PROMPT-SYSTEM.md` L10402–L10413 同序同哈希 12/12；落点① L87 ∥ L88 与设计档 10389 ∥ 10390 同哈希 2/2。

落点位置它也自取读：L102 锚 ↓ 12 行 ↓ L115 锚，两锚都是 `git diff` 的上下文行、未被碰。`git diff` 三个 hunk 的归属亦重查：第 3 个 hunk = 前批存量，本段披露第 1 条已记。

§5 读数它逐条对现盘：513 行 ∥ `## ` 17 ∥ 七词只命中落点② 首行 ∥ 禁令词 0 ∥ `doc_check` PASS ∥ 首两行无开口措辞；A1–A8 引的句子逐条在盘。它的行宽读数标 `unverified`（只读装配无执行工具），那一条由本段上表的码点读数承担。

审计另提一件**非本笔**的事：`§2` 的变更面 ② 行仍写「增列十行 `>`」，被 §2 自己的修正轮块（「围栏块 = 12 行」∥「应为 513 行」）推翻 —— 属 §2 作者（eng-designer）的笔，本席未动，与「对 §1 的一行依赖」同性质，记在此供父侧 ∥ 设计席对账。

**② 内部代码评审（advisor · code）· 1 轮** — `VERDICT: pass`；计数 🔴 0 · 🟡 3 · 🔵 2；**无 must-fix 项**。这一轮的逐条原文落在同档 §3「轮次 4（评审子代理）」，此处只记去向与本席复核。

| # | 严重度 | 去向 | 本席复核 |
|---|---|---|---|
| 1 | 🟡 | 设计席 ∥ 用户裁定 | 落点② 段7 的自动推进豁免没有「本批首个开工词已落」这一界。评审说「design §6.99 K3 半句『全面令先于复述时不算』无对应句」；我读 K3 原文，它带括注「（除非该全面令本身就是批内自动推进）」，即设计档已把这一情形划进豁免。真问题不是漏句，是这条豁免该不该覆盖批起，与用户原话相权。本席不能改字 |
| 2 | 🟡 | 设计席 | 段3「the advancement line just above」指错一格（正上方是段2）。同 §3 轮次 3 第 1 条；读者仍可解（全档唯一含 `advances advancement` 的那行在块外两行处），本席按逐字落，未改 |
| 3 | 🟡 | 设计席 | 段8 读的 §1 行 `**自动推进**` 无归属登记。已在源档复核：`docs/core/design/BATCH-RECORD.md` 逐字「§1 段体**允许一类标记行**——形 = `- **已定决定**：<决定> · 用户原话：「<逐字>」 · 时间：<YYYY-MM-DD HH:MM>`」，该档 `自动推进` 零命中。同 §3 轮次 2 第 5 ∥ 轮次 3 第 3 条 |
| 4 | 🔵 | 设计席 | 段3「narrows three sentences」缺作用域，作用域在段5「For this seat」才出现 |
| 5 | 🔵 | 设计席 | `你看着办` 在段2 ∥ 段9 各一遍（分类一致），两处读点可合一 |

**处置口径**：五条里没有一条要求本席改字 —— 落点是 design §6.99 围栏块的逐字搬运，字面自由不在本席（改字 = 设计变更 + 复审）。故五条全归设计席，其中 🟡1 另需用户裁一句。

**终态**：`clean`（审计 1 轮 · clean；评审 1 轮 · pass；must-fix = 0；自修轮 = 0）。改动面 = 一档 `.md` 的 12 行文本，无新增档、无删档、无单测档 —— 无执行面故无 `node --check` 对象。

## §6 验证与收口（父代理）
