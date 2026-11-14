# 2026-11-14 · design-review-self-record
> 六段，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 每段只有一个作者：作者的段可 `append` 加内容、可就地改（`edit`）；非作者一概拒。
> 编制：主 agent · 2026-11-14 · 来源 = 用户 2026-11-14 16:25 裁定：让工具自己把评审结论写进 §3，删掉「评审席漏写即拒签」这道检查；随后原话「可以，这个逻辑可以试试。」。
> 台账 = #2426（core · 归批）。前情 = 无（独立批）。
## §1 讨论（主 agent）
**状态行**：已收口 2026-11-14
批起 sha = 343976fbb9458f637dce0132d60b73fc38eabfe4
<§1 模板占位：本批条目 / 关键判据 / 授权口径>

### 本批做什么

设计评审结算时，由工具自己把本轮结论写进批档 §3 的一个轮次块。评审席不再承担「记得写 §3、记得改状态行」这件事。

「本轮没写 §3」那道拒签检查随之删掉——没有可漏的东西，检查也就没有对象。

### 为什么

同一件事现在有三道防线：评审席要写 §3、结算要数块数、结算要读回状态行。三道防的是同一个疏漏，而漏一次就把一轮评审的结论留在 digest 里——我这边上下文一压缩就没了。

唯一能做的补救是重新点火、重跑一遍模型。本会话因这一条各多跑过至少一轮（`2026-11-14-inbox-pickup-window` 与 `2026-11-14-knowledge-tokenize-punctuation`），两次都发生在评审内容本身已经通过的情况下。

也就是说：少写一段记录，被定价成一整轮评审。

### 已定决定

- **已定决定**：让工具自己写 §3，而不是放开 §3 落地门。用户原话：「可以，这个逻辑可以试试。」· 时间：2026-11-14 16:26
- **已定决定**：形态要简明直白，不加新工具入口、不加新触发器、不加守卫。用户原话：「我希望有个更加简明直白的方式。」· 时间：2026-11-14 16:26

放开那条门我不取，理由是：门一放开，令牌能签发，但 §3 可以永远空着，而评审发现了什么就只活在 digest 里。工具代写有同样的宽松度，记录却不会丢。

### 现状机制（主 agent 实读）

结算点的三道判据按序：基线不可读 ⇒ `batch-unreadable`；轮次块数不大于点火基线 ⇒ `no-section3-block`；段级状态行不是「评审通过」⇒ `status-not-passed`。

第三道由结算自己签字再回读，不依赖评审席。第一道只依赖点火时批档可读。**第二道是唯一依赖评审席配合的一道**——本批动的就是它。

写入面已有现成的盖戳与切块机制：写入档的 `insertIntoSection` 盖 `### 轮次 N（评审子代理）`，轮次号取自骨架档的 `nextRoundNumber`，两份正则单源。结算点要做的是复用这套，不是另写一套。

裁定行解析已有 `verdictGateFailure`，本批不动。

### 边界（本批不做）

不改凭证判据：评审通过才发凭证，这条一个字不动。

不动 `batch-unreadable` 与 `status-not-passed` 两道。

不新增工具 action、不新增配置开关、不新增重评入口。

不改 §5 写入门、不改收口门、不改 `advisor` 工具面。

### 上抛（由设计裁）

**落进 §3 的正文形态**：整段照落评审原文，还是落结构化摘要。

我倾整段照落——记录的价值是「当时到底说了什么」，而解析自由文本抽摘要会引入它自己的脆弱。代价是段落可能很长，与写入面的 300 字段落门冲突，这个冲突怎么处置要设计给答案。

结构化摘要格式齐整，但会丢掉发现明细，而明细正是我事后裁决的依据。

### 勘察

库内 = 已查：`design-token.mjs` 的三道拒因常量与结算点判据序、`batch-record-write.mjs` 的段落插入与盖戳、`batch-skeleton.mjs` 的轮次块正则与计数。三处都读过，机制写在上一节。

库外 = B 类：改动面 = 本仓 `thincoder-core/agent-tools` 下的评审结算与批档写入两处；外部断言 = 零。不引入新依赖、不改协议、不改任何对外载荷。

### 覆盖账

覆盖账 = #2426

### 设计评审前置 · 父侧裁决（2026-11-14）

设计席 #7 交付后，两条上抛与一条知会的处置。

- **上抛 1（§3 笔只在工程模式收回，普通模式保留）**：**采纳**。普通模式没有设计凭证、`settleDesignReview` 不进场，评审自写 §3 是那条路上唯一的写法，通道与 `dropStamp`、两个状态行计划一并保留。
- **附带要求（设计席未写，我加）**：工程模式下 `append §3` 必须被拒——闸按模式分岔。不这样一个评审若照旧习惯写一次，就与结算写的块并存，同一轮出两个轮次块，`countRoundBlocks` 会把它们当成两轮。
- **上抛 2（提示词面措辞）**：由我供。`thincoder-core/prompts/persona-engineering.md` 第 278 行那一行（以 `The reviewer thereby gets the ` 开头）整行替换为下面这段逐字文本，由实施席落笔：

```text
The round block in §3 is written by the settlement, not by the reviewer: in engineering mode the tool writes the round heading, a settlement header line, and the review's report verbatim, in the same stroke that decides the token. The reviewer reports and stops there — its §3 write channel is closed in engineering mode, so there is nothing for it to remember. In normal mode no settlement runs, so the reviewer writes §3 itself: the round's conclusion table + the VERDICT line + the counts, each evidence cell holding a pointer (a section number / a symbol name / the exact words of the line), and the report's own paragraphs stay in the report.
```

紧随其后那行 `- Adjudication table:` 不动。理由：那段讲的是我拿到评审后怎么回处置表，与本批无关。

- **知会（注释指错节）**：设计席报告多处代码注释把「§3 落地门」指到 `ADVISOR-GUARDS.md` §1.1（该节是单谓词，门在 §1.2）。设计席称已写进 §2 交实施轮 re-point。评审若在 §2 看不到这些档，按缺项报。

### 与 `#2418`/`#2423` 的关系

无关。那两批已于 `6a3e9488` 收口提交，工作树现只剩本批四档。上一轮勘察曾说「`#2418` 的 §6 还空着」——过期读数，已核不成立。

### 设计评审第 1 轮 · 父侧裁决（2026-11-14）

评审判 `changes-required`：🔴 2 · 🟡 9 · 🔵 2。**13 项全部采纳**，无一驳回。

| # | Action | Detail |
|---|--------|--------|
| 1 | Dispatched | 🔴 §3 写面三说并存（条目 3 退役 ∥ 机制（六）保留 ∥ A2 全拒），与 §2 边界「普通模式的评审 `§3` 写面一字不动」及三份设计档的保留口径冲突。统一为**按模式分岔**：工程模式 `append`/`edit` 打 §3 一律拒；普通模式评审照旧写 §3。三处（条目 3、机制（六）、A2）改成同一个说法 |
| 2 | Dispatched | 🔴 机制（六）一边删 `SEGMENT_BY_ROLE` 的 review→§3，一边称普通模式评审照旧写 §3，没给授权面。写明普通模式那条路的授权来自哪里（映射项按模式保留，还是另设判据），读者要能指出哪一个检查放行 |
| 3 | Dispatched | 🟡 `BATCH-RECORD.md` §4.1 段写权表缺「普通模式评审席」行，同节正文却写它写 §3。补行（可写段 = `§3`），或在表题注明该行在 §4.2 绑定表 |
| 4 | Dispatched | 🟡 §4.4 把 `no-valid-echo` 说成「既有词表」，仓里只有消息常量 `NO_VALID_ECHO_MARK`。要么点名它由 `settleDesignReview` 的回显失败支派生，要么登记为新词并给 `none found:` 三问答案 |
| 5 | Dispatched | 🟡 §2 缺最近先例行。补一行，点名 `batch-record-write.mjs` 的 `insertIntoSection` 与两个状态行计划为对照，写对齐或偏离 |
| 6 | Dispatched | 🟡 §2 缺勘察证据行（勘察只在 §1）。补进 §2，含库外「无相关」那句 |
| 7 | Dispatched | 🟡 验收缺三条：封印算不出 ∥ 陈旧 ⇒ 不落块（KD5 ∥ §1.2 ∥ §8.2 三处都写了规则却无判据）；`no-pass-line` ∥ `no-valid-echo` 的落块与未签发头；普通模式 §3 追加仍成功 |
| 8 | Dispatched | 🟡 A1–A7 的读者写「批单测」，而机读清单三档全是 `test/integration/*`。把批单测档写进机读清单与读者格，让验收指得到能跑的东西 |
| 9 | Dispatched | 🟡 RTM 增量只点用例行，漏了两处被本批证伪的陈述：`CLI 27` 节题「评审写一笔 §3 就够」与 `CLI 17` 节注「机制单源 = ADVISOR-GUARDS.md「§3 落地门」」。补节题改写或退役，并给被改写用例补交互 ∥ 需求 ∥ 进入口 |
| 10 | Dispatched | 🟡 §4.4 让结算绕过 `append` 的文档机检门，却没给场景，且同段的缩进理据已覆盖大半。要么给可复现路径（评审原文引一个 `file:line` 形指针），要么删掉豁免只留缩进理据 |
| 11 | Dispatched | 🟡 提示词面：`advisor-design.md` 与三份 `advisor-round*.md` 仍以「拿到批档写通道、把结论写进 §3」为前提。内容由我供，见下 |
| 12 | Dispatched | 🔵 `ADVISOR-GUARDS.md` §2.3 把缺 `batchDoc` 当启动前拒绝，§1.2 称其为程序不变量违反的 throw。各管哪一面写清一句 |
| 13 | Dispatched | 🔵 §2 无函数档位结论。补一行：本批放大的函数、无一到 300、`designReviewBlock` 的提取就是 100–300 带内的处置 |

### 提示词面 · 主供措辞（第 11 项）

`advisor-design.md` 与 `advisor-round*.md` 里凡以「你拿到一份绑定的批档写通道 ∥ 把结论表与 VERDICT 写进 §3」为前提的句子，语义替换为下面这句，位置与裁句由设计席定：

```text
Your findings are recorded by the settlement: in engineering mode the round block lands in the batch record's §3 automatically, and the batch tool is not mounted for you. Report your findings and stop there. In normal mode you write §3 yourself.
```

`persona-engineering.md` 那一行沿用本文件前段已给的逐字文本，两处口径必须一致。

### 追加项 · 状态行被动写（2026-11-14 · 用户裁定「1」）

**已定决定**：状态行滞后这件事并入本批做，不另开台账。
用户原话：「1」——即上一条给出的选项 1「并进 `#2426`，和『工具自写 §3』同一批做掉」。
时间：2026-11-14 16:43。

**为什么并进来**：两者改的是同一个文件 `thincoder-core/agent-tools/batch-record-write.mjs`。`§3` 那条是把「谁写结论」从评审席挪到结算；这一条是把「谁写状态行」从段属主的手动调用挪到写正文那一笔。分两批做会在同一处改两次、评审两次，而第二次的判据几乎就是第一次的翻版。

**现状（主 agent 实读，供设计席定位）**

- 写盘通道本来就是工具：`batch.mjs` 头注写「六段各自只有一个作者……状态行只有一个写者（`status`）」，`append` 拒一切行首形态的状态行，`edit` 触碰状态行也拒。
- 但「谁想起来调用 `status`」没有机制。全仓唯一被动写是 `§3`：`statusPassPlan(src, seg, body, date)` 的守卫是 `if (Number(seg) !== 3) return null`，即只认 `§3`。工具在评审 append 带裁定行的正文时顺手把 `§3` 置成「评审通过」，打回则反向重置。
- `§1`／`§2`／`§5` 没有这条路。建批骨架给的是 `§1` 的「进行中（…）」与 `§2` 的「（eng-designer 写入时更新）」，之后靠段属主自己调 `status`。
- 实证两处：`2026-11-14-suspension-drive-split.md` 的 `§1` 停在「设计评审 2 轮 changes-required」而 `§3` 已三轮且第三轮 pass；`2026-11-14-knowledge-tokenize-punctuation.md` 的 `§1` 停在「待设计评审」而实际已通过。两处都是主 agent 没回头改，不是工具失职。

**本追加项要落的三件**

1. `§2` 写正文且非空 ⇒ 同笔置「设计完成」（现成词表里就有这一态，无新词）。
2. `§5` 写正文且非空 ⇒ 同笔置「实施完成」（同上）。
3. `§1` 按甲案：建批骨架不再写 `（…）` 这个不会被自动清掉的假占位，改为纯「进行中」；`§1` 的括注仍由主 agent 人工写，不做机械覆盖。

**边界**

- 不动 `§3` 现有那条被动写，本批前面那三条条目照原样做。
- 不加新状态词、不改任何段的状态词表。
- `§1` 只改骨架的字面，不改 `§1` 的写入权限与判据。

**给设计席的两条口径**

- 第 3 件里「假占位」的判断标准是「骨架写过、而没有机制会清掉它」。`§2`／`§5` 那两句占位在被动写落地后会被覆盖，可以留下；`§1` 那句不会，所以要去掉。
- 三件都要给判据，且判据要能红：不给 `status` 调用时，写正文那一笔之后状态行应当已经变了；改动前的形态下它不变。

### 设计评审第 2 轮 · 父侧裁决（2026-11-14）

结论：changes-required（🔴 1 · 🟡 7），未签发。第 1 轮 13 项与追加项前两件已落地，本轮只剩下表 8 条。

**我这侧已改**：需求档是主 agent 的笔，`docs/core/requirements/ENGINEERING-MODE-V2-SPEC-BATCH-SEGMENT.md` ② 功能点 5 改成与设计档 §4.12 同一句机制——「状态行只由工具改值——生命周期动作（status ∥ close ∥ supersede ∥ 重开），或正文写入同笔（`§2` ∥ `§5` 写非空正文即置该段完成词、`§3` 随裁定行置位）；作者不自写状态行。」

同一档 ④ 验收补 `AC-M3-11`：`§2` ∥ `§5` 写非空正文后状态行同笔置完成词；正文只含占位行或写被拒时状态行不动。

| # | 严重度 | 处置 | 本轮要落的（设计席） |
|---|---|---|---|
| 1 | 🔴 | Fixed（我这侧）+ Dispatched（你这侧） | §2「文档面」补 `docs/core/requirements/ENGINEERING-MODE-V2-SPEC-BATCH-SEGMENT.md`，写明本批已把 ② 功能点 5 与 AC-M3-11 改到工具写值口径；§4.12 的被动写与新需求句一致 |
| 2 | 🟡 | Dispatched | 验收补一格：create 一笔后 `§1` 段头区状态行 = 「进行中」且无括注；能红侧 = 改前形态读到 `进行中（…）`；读者指名 |
| 3 | 🟡 | Dispatched | A4 的读者去掉「§3 现文」——本档轮次 1 块为评审席手写、无 `**结算**：` 行；改指批单测（块存在 + 结算头文本） |
| 4 | 🟡 | Dispatched | RTM 增量加 `CLI 27` 的「目的」与节注「三态」两行：目的改被动写口径，三态改 27-2 ∥ 27-4 并写 27-4 的交互 |
| 5 | 🟡 | Dispatched | RTM 增量加 `10-4`：夹具前提同 `10-1` 改为由结算写块，断言不变 |
| 6 | 🟡 | Dispatched | 四条被改写 ∥ 新增用例各补交互 ∥ 需求 ∥ 进入口（或写「节注已载」并同步改节注）；`27-2` 写明工程模式夹具，普通模式一侧归 A2 |
| 7 | 🟡 | Dispatched | `BATCH-RECORD.md` §7 D-BR41 措辞与 §4.7 ∥ §4.12 对齐（写者唯一 = 工具，两条路同一笔、同一词表、同一段头区） |
| 8 | 🟡 | Dispatched | §4.4 或 §4.22 补一句工程模式代码轨评审的记录落点（哪一面承载、收口读什么），让 RTM `27-2` 的故事与这句一致 |

范围：只改三份设计档与 §2，不动代码。改完送第 3 轮评审，只核这 8 条。

### 设计评审第 3 轮 · 父侧裁决（2026-11-14）

设计席 #9 交稿，带一条上抛：`§3` 写面按「模式」分岔，还是按「模式 × 评审轨」分岔。它按后者落了设计，理由在报告里。

**父侧裁定：采纳「模式 × 评审轨」。**

按字面「工程模式内一切身份都拒」，工程模式的代码轨评审就失去唯一记录面。工具面批没有设计档、不签设计凭证、结算不进场，`§3` 只能由评审写。

而 `test/rtm/batch-ledger.md` 的 `14-2` 断言「`§3` 非 pass 时 `batch close` 拒」，`§3` 的状态行又只由带裁定行的 `append` 被动置位。两处一合：这类批从此收不了口。

需求原意是「设计评审的结论由结算落笔」，而结算只在工程模式的设计轨进场。按轨分岔与这条原意同源，不是放宽。

本批要防的也正是设计轨那一路：评审若照旧写一次，就与结算写的块并存，`countRoundBlocks` 会当成两轮。按轨分岔守住了这一点。

这处越出「只核 8 条」的改动面，父侧确认在批内——它由第 1 轮裁决 #1 的「闸按模式分岔」引发，收窄成按轨是同一句的正确读法。

范围：第 3 轮只核第 2 轮那 8 条与本节这条裁定，不展开新面。

**第 3 轮评审结论**：changes-required（🔴 1 · 🟡 5 · 🔵 3），未签发。第 2 轮那 8 条我逐条核过，7 条已真落地；`27-2` 那条也落地（夹具写工程模式代码轨、异常格写工程设计轨）。

**我这侧已改**：需求档 ② 功能点 2 与 9。功能点 2 补上轨道限定——设计轨评审不在本档写任何段、代码轨评审写 `§3`。功能点 9 改成块形口径：工具盖戳 + 一行结算头 + 评审原文，没有裁定行的轮也照样落块。

| # | 严重度 | 处置 | 本轮要落的（设计席） |
|---|---|---|---|
| 1 | 🔴 | Dispatched | `BATCH-RECORD.md` §4.2 档绑定表「advisor（仅普通模式）」与 §4.3 ∥ §4.22 ∥ `ADVISOR-GUARDS.md` §1.2 互斥。给代码轨评审一行（或去掉该行的模式限定），让四处读成一条规则 |
| 2 | 🟡 | Fixed（我这侧） | 需求档功能点 2 ∥ 9 已改，见上 |
| 3 | 🟡 | Dispatched | §4.3 的挂载判据与 §2 机制（六）的白名单拒是两层守卫，未说哪层为准；工具不挂载时白名单那支不可达，而 A2 的「工程设计轨拒」格依赖它。写明各管什么，并给白名单那支一个可达的路径或既有观测 |
| 4 | 🟡 | Dispatched | §2 条目 1「评审席不再写它」无限定，条目 3 又给代码轨与普通模式留通道。把条目 1 后半句限定到工程设计轨 |
| 5 | 🟡 | Dispatched | §4.1 动作与段写权表五行缺「工程模式代码轨评审席」，同节正文与 §4.4 ∥ §4.22 都给它 `§3` |
| 6 | 🟡 | Dispatched | §4.3「本批让判据真正消费评审轨这一维」是批内施工语，收口后「本批」无指代。改成现在时规则 |
| 7 | 🔵 | Dispatched | A12 读者带了「`CLI 27-4` 的 create 前置」，而 27-4 断的是 `§2` ∥ `§5` 被动写，不读 `§1` 段头区。读者只留批单测那一格，或把该断言写进 27-4 的夹具说明 |
| 8 | 🔵 | Dispatched | RTM 增量 `27-2` 的「需求」指两节设计档。改指 `ENGINEERING-MODE-V2-SPEC-BATCH-SEGMENT.md` ② 功能点 9，设计档留作机制指针 |
| 9 | 🔵 | Dispatched | §4.21 枚举状态行写路时漏 `§3` 随裁定行置位那一条，而 §4.12 仍称它被动写。补进枚举 |

范围：只改三份设计档与 §2，不动代码。第 4 轮只核这 8 条与所列改动，不展开新面。

### 设计评审第 4 轮 · 父侧裁决（2026-11-14）

判决 = **pass**（🔴 0 · 🟡 2 · 🔵 2），凭证已签发。第 3 轮 9 条全部核实落地；§4.1 ∥ §4.2 ∥ §4.3 ∥ §4.22 与 `ADVISOR-GUARDS.md` §1.2 现读成一条规则。

| # | Action | Detail |
|---|---|---|
| 1 | Deferred | 🟡 A1 示例缺 `· <日期>` —— 本节在批档 §2，是设计席的笔；实施期 §2 不再改，收口后由设计席一轮收正。同时把口径写进实施任务：块文断言以 `BATCH-RECORD.md` §4.4 的块形为准（含日期），不按 A1 的缩写形 |
| 2 | Deferred | 🟡 `CLI 17-1` 题名仍点名已删的失败侧 —— 同属 §2 的笔；新题名逐字给实施席（见下），RTM 落档时按新题名写，§2 的题名由设计席收口后同轮改 |
| 3 | Deferred | 🔵 §4.12 指到未导出的 `EXCLUDED_LINE_RE` —— 设计档已封印，改动会让实施席拿不到凭证；实施期用导出面 `sectionContentState` 判空，收口后设计席改指针 |
| 4 | Deferred | 🔵 A4 脚注的「现有两块」是写作时读数，§3 已有三轮 —— §2 的笔，随第 1、2 条同轮收正；实施不受影响 |

给实施席的逐字口径（因上述四条在实施期不动文档）：① 块文断言按 §4.4 块形，结算头含 `· <日期>`；② `CLI 17-1` 新题名 = `CLI 17-1 错误 · 块写不进 ⇒ 拒签且零字节`；③ 判空复用 `sectionContentState`；④ A4 那条脚注不求改，实施忽略其计数。

### 实施交付 · 父侧核对与裁决（2026-11-14）

**父侧独立复跑**：批内单测 `16/16`、四集成档 `11/11`（`advisor-record-gate` · `batch-status-auto-set` · `batch-close-token-consume` · `batch-edit-spec-section`），与交付报告逐项相符。

**两条上抛的裁决**：

1. **结算要不要受整档冻结门约束** —— 判「本批不做，挂台账」。理由：落同一道门需要新拒因值，而 `ADVISOR-GUARDS.md` §1.2 的值域只有两词；加词是设计变更，本批已过四轮设计评审，再开一轮的代价大于该边界情形的风险（结算只在批档进行中进场，冻结档上的结算属异常序列）。
2. **`statusResetPlan` 的 `traceLine` 留不留** —— 判「留，零改」。它归 `statusResetPlan` 自身的契约，代码轨与普通模式那条路上仍由它落行；结算面只用 `statusValue` 不等于该字段无用。

**四条落地核对项的处置**：1 ∥ 2 ∥ 3 判「目标移动」，4 判「判域收窄」——四项都由设计席本批收正，不推到下一批。

**§2 机检清单补三行**（设计席笔）：`thincoder-core/agent-tools/batch-lifecycle.mjs`、`test/integration/batch-gates-fixture.mjs`、`test/integration/batch-edit-spec-section.test.mjs`。本席已核三档变更性质为「零行为变 ∥ 夹具补 `reviewType` ∥ 断言与被动写同口径」，无隐藏语义。

### 收口前置门拒因与处置（2026-11-14）

`batch close` 拒：改动面里 11 档在 §2 机检清单里没有行。查清了机制——门的改动面取「本会话写盘触达账 ∪ 提交 diff」，而本会话跨三批（`#2416`、`#2418`、`#2423`、本批），子代理的写计入父会话触达账，所以前几批已收口的代码档仍留在面内。改 `批起 sha` 不解决（`suspension-drive.mjs` 对批起快照零 diff 却仍在名单，即证）。

**处置**：按门的要求由设计席补 11 行，第三列写该档在批起快照上的内容行数（门已给出读数，直接采用）。**这不是把别人的代码算进本批**——行只作改动面记账，§6 另记一条说明它们属已收口的前序批次。

待补 11 行（第三列 = 门给出的基线读数）：

| 档 | 行数 |
|---|---|
| `thincoder-core/tools/knowledge.mjs` | 143 |
| `test/integration/knowledge-search-bounded.test.mjs` | 138 |
| `thincoder-desktop/src/main/suspension-drive.mjs` | 83 |
| `thincoder-desktop/src/main/suspension-resident.mjs` | 93 |
| `thincoder-desktop/src/main/suspension-window-close.mjs` | 117 |
| `thincoder-desktop/src/main/suspension-window-open.mjs` | 66 |
| `thincoder-desktop/src/main/suspension-window-turn.mjs` | 106 |
| `thincoder-desktop/src/main/window-queue.mjs` | 117 |
| `thincoder-desktop/src/main/turn-face.mjs` | 209 |
| `thincoder-desktop/src/main/agent-host.mjs` | 344 |
| `thincoder-desktop/renderer/subagent-reduce.mjs` | 264 |

## §2 批次任务与设计（eng-designer）
**状态行**：设计完成

<§2 模板占位：本批条目（覆盖） / 设计档落点 / 机制设计 / 受影响文件与测试覆盖 / 验收对照 / 关键决策 / 上抛项>

<§2 模板占位：机读清单 = 标题行「**受影响文件（机读清单）**」+ 围栏内三列表（表头 | 档 | 分拆方案 | 行数 |、分隔行 |---|---|---|、一行一档，只列代码档（源 ∥ 单测））；第二列：越设计时线的档写正向形方案（点名带目录段的档 + 本批落步 `实施轮` ∥ `§5`），未越线写 —；第三列：该档在批起快照上的内容行数（量法 = `countContentLines`），快照里没有这一档写 `新`；示例行 = | thincoder-core/agent-tools/batch-tier-gate.mjs | — | 新 |>

**本批条目（覆盖）**

- 条目 1（#2426）：设计评审结算自己把本轮轮次块写进批档 §3；工程模式**设计轨**的评审席不再写它、不再改 §3 状态行——代码轨与普通模式的评审席照旧写并触发置位（条目 3）。
- 条目 2（#2426）：「本轮没写 §3」那道拒签判据失去对象，随本批删除；点火基线族同批扫净。
- 条目 3（#2426）：评审席的 §3 写通道按「模式 × 评审轨」分岔——工程模式的**设计轨**收回，`§3` 对那一路的一切身份只读；工程模式的**代码轨**与普通模式保留，绑定评审照旧写 `§3`。守那条通道的写入闸（`R-G3`）、伪戳丢弃（`dropStamp`）与两个状态行计划在那两条路上继续存在。
- 条目 4（#2426）：状态行被动同笔写——`§2`/`§5` 写正文那一笔顺带置完成词；`§1` 骨架的 `（…）` 假占位去掉，改纯「进行中」。

**设计档落点**

- 判据与顺序 = `docs/core/design/ADVISOR-GUARDS.md` §1.2 ∥ §1.3。
- 块形、席位表、挂载、不变量、评审绑定与签字一笔 = `docs/core/design/BATCH-RECORD.md` §4.4 ∥ §4.1 ∥ §4.3 ∥ §4.7 ∥ §4.22 ∥ §4.23。
- 封印拒签时「不落块」的排序 = `docs/core/design/DESIGN-TOKEN-SETTLEMENT.md` §8.2。
- 状态行主动/被动两条路 = `docs/core/design/BATCH-RECORD.md` §4.12 ∥ §4.21 ∥ §4.10。

**最近先例**：`thincoder-core/agent-tools/batch-record-write.mjs` 的 `insertIntoSection`（盖 `### 轮次 N（评审子代理）` + 段内切块，轮次号取骨架档 `nextRoundNumber`）与它消费的两个状态行计划 `statusPassPlan` ∥ `statusResetPlan`。

对齐 = 块成形、盖戳、状态行置位全部复用这三件现成件，不另写切块或计数。

偏离 = 那三件今日的消费方在 `append` 面（模型驱动），本批把消费方挪到结算面（引擎驱动）；成形函数出叶档 `design-review-record.mjs` 逐字复用同一块形，其余不动。

**勘察证据**：库内 = 已读 `design-token.mjs`（`NO_VALID_ECHO_MARK` ∥ `verdictGateFailure` 的两个拒因词 ∥ 结算判据序）。

同批已读 `batch-record-write.mjs` 的 `allowedSegment`（`if (review) return 3`）∥ `sanitizeText` 的 `dropStamp` ∥ `R-G3` 闸 ∥ 两个状态行计划的消费点。

已读 `batch-segment-vocab.mjs`（`SEGMENT_BY_ROLE` = `{ "eng-designer": 2, "eng-coder": 5 }`，无 review 项）∥ `batch.mjs`（`PROFILE_SEGMENTS` 的 `review: 3`）。

已读 `batch-skeleton.mjs`（骨架 `§1` 状态行 `进行中（…）` ∥ `EXCLUDED_LINE_RE` 的判空排除类）与 `test/rtm/batch-ledger.md` 的 CLI 17 ∥ CLI 27 节题与节注。

公共源档 = 工作目录内无独立公共源档仓，相关来源全在本仓 `docs/`。库外 = B 类：改动面无外部接口面、外部断言零，相关外部源零。

**机制设计**

（一）结算先把处置算完：回显、裁定、封印、不稳定尾。处置值域 = `pass` ∥ `changes-required` ∥ `no-pass-line` ∥ `no-valid-echo`；封印算不出与陈旧评审不进写面。

（二）一次写：块与状态行进同一个字符串，经现有 `recordWriter` 单通道一次写、一次回读。回读不符 ⇒ `status-not-passed` 拒签并回写 `before`；写通道只有一条，单测可对两笔同时注入失败。

（三）块形 = 工具戳 + 结算头 + 原文缩进四格。`N` 取 `nextRoundNumber`，不另立计数。缩进让段标题锚与轮次块锚都不命中，裁定锚允许前导空白照旧命中——三件事一并解决，零新解析。

（四）状态行按处置写：`pass` 走 `statusPassPlan`（幂等：已是完成词则零写），`changes-required` 走 `statusResetPlan`，其余处置不动它。两个计划函数仍是单源，消费面两处并存：结算面（工程模式设计轨）与 `append` 面（工程模式代码轨 ∥ 普通模式）。

（五）判据 ①（块数 > 点火基线）删除，基线族一并退役：`section3BlocksBaseline`（`advisor.mjs`）、`run.section3BlocksAtStart` 的逐笔快照与写回（`advisor-async.mjs` ∥ `advisor-settle.mjs`）、拒因常量 `no-section3-block`（`design-token.mjs`）。

（六）评审席笔按「模式 × 评审轨」分岔，两层守卫各答一个问题。

挂载面（`advisorToolsFor`）判「这个评审实例拿不拿得到 batch 工具」——工程设计轨不挂载，那一路的 `§3` 拒由它承担，写函数根本不被调用。

段白名单（`allowedSegment`）判「拿到工具的调用方能不能碰这一段」，判据与挂载面同源（同一对输入：模式 × 评审轨），不是两套规则。工程设计轨上那支不可达，可达观测 = 批单测直调 `appendBatchRecord` 传评审 profile 打 `§3`，或评审实例越段打 `§2`。

授权面在 `allowedSegment`：`batch-record-write.mjs` 今日的 `if (review) return 3` 就是评审实例写 §3 的那道授权，`batch.mjs` 的 `PROFILE_SEGMENTS` 里 `review: 3` 是同一件事的工具 profile 面。

本批给这两处加判据：工程模式**设计轨**的 review 实例打 §3 一律拒（`append` ∥ `edit` ∥ `status` 三面同拒）；工程模式**代码轨**与普通模式照旧放行。

分岔必须带评审轨这一维：代码轨没有结算可代写块，而收口门读的是 `§3` 段级状态行（`test/rtm/batch-ledger.md` `14-2` =「`§3` 非 pass 时 `batch close` ⇒ 拒，拒文含 `§3 状态行 = …，须 = 评审通过`」）——按模式一律拒，工具面批的收口门就再也到不了。

已查无：`SEGMENT_BY_ROLE` 今日没有 review 项（`{ "eng-designer": 2, "eng-coder": 5 }`），评审段权不在这张表里——先前写法指错了面。

普通模式的结算整段跳过、不写 §3（写面按模式分岔；设计凭证不分模式铸造，故不以凭证为判），评审席位照旧写 §3 ⇒ `append` 的 §3 写入闸（`R-G3`）、`sanitizeText` 的 `dropStamp`、两个状态行计划在 `append` 面的消费点，在普通模式分支保留，为那条路服务；工程模式代码轨走同一条保留路（同一份理由：没有结算可代写）。

（七）块文成形独立成叶档 `design-review-record.mjs`：`design-token.mjs` 批起 459 内容行，再加四十余行会越过 500 软线；叶档只 import `node:*`，纯函数、零 fs，写仍归结算的单通道。

（八）状态行被动同笔写（条目 4）：`append`/`edit` 往 `§2`/`§5` 写入非空正文时，同一笔把该段状态行置成它的完成词——`§2` ⇒ `设计完成`，`§5` ⇒ `实施完成`。

零新词（两态本就在 `STATUS_WORDS`），已是完成词则零写，写被拒则状态行不动；判空复用 `EXCLUDED_LINE_RE` 那套排除类（空行 / 标题 / 状态行 / 模板占位 / 「不适用」）。

`§1` 骨架的状态行改纯「进行中」——`batch-skeleton.mjs` 里 `**状态行**：🔄 进行中（…）` 那一处去掉括注；`§2`/`§5` 的占位句留着，由被动写覆盖。

被动写不按模式分岔：两种模式下 `§2`/`§5` 都是同一台写面。`§3` 那条现有被动写不动。

**受影响文件（机读清单）**

```text
| 档 | 分拆方案 | 行数 |
|---|---|---|
| thincoder-core/agent-tools/design-token.mjs | — | 459 |
| thincoder-core/agent-tools/design-review-record.mjs | — | 新 |
| thincoder-core/agent-tools/advisor.mjs | — | 386 |
| thincoder-core/agent-tools/advisor-async.mjs | — | 364 |
| thincoder-core/agent-tools/advisor-settle.mjs | — | 265 |
| thincoder-core/agent-tools/batch-record-write.mjs | — | 394 |
| thincoder-core/agent-tools/batch-lifecycle.mjs | — | 488 |
| thincoder-core/agent-tools/batch-segment-vocab.mjs | — | 333 |
| thincoder-core/agent-tools/batch-skeleton.mjs | — | 417 |
| thincoder-core/agent-tools/batch.mjs | — | 276 |
| thincoder-core/agent-tools/design-slots.mjs | — | 305 |
| thincoder-core/advisor/loop.mjs | — | 320 |
| test/integration/advisor-record-gate.test.mjs | — | 220 |
| test/integration/batch-status-auto-set.test.mjs | — | 239 |
| test/integration/batch-close-token-consume.test.mjs | — | 184 |
| test/integration/batch-gates-fixture.mjs | — | 81 |
| test/integration/batch-edit-spec-section.test.mjs | — | 98 |
| docs/batches/2026-11-14-design-review-self-record.test.mjs | — | 新 |
| thincoder-core/tools/knowledge.mjs | — | 143 |
| test/integration/knowledge-search-bounded.test.mjs | — | 138 |
| thincoder-desktop/src/main/suspension-drive.mjs | — | 83 |
| thincoder-desktop/src/main/suspension-resident.mjs | — | 93 |
| thincoder-desktop/src/main/suspension-window-close.mjs | — | 117 |
| thincoder-desktop/src/main/suspension-window-open.mjs | — | 66 |
| thincoder-desktop/src/main/suspension-window-turn.mjs | — | 106 |
| thincoder-desktop/src/main/window-queue.mjs | — | 117 |
| thincoder-desktop/src/main/turn-face.mjs | — | 209 |
| thincoder-desktop/src/main/agent-host.mjs | — | 344 |
| thincoder-desktop/renderer/subagent-reduce.mjs | — | 264 |
```

末 11 行属已收口的前序批次（`#2416` ∥ `#2418` ∥ `#2423`）的改动面记账，不是本批改动的档：收口门的改动面取「本会话写盘触达账 ∪ 提交 diff」，子代理的写计入父会话触达账，故这些档仍在面内；第三列沿用门给出的基线读数。

读数取法 = `countContentLines`（`thincoder-core/agent-tools/batch-tier-gate.mjs`），对象 = 批起快照 `343976fb` 上该档全文（`git show <sha>:<档>`）；清单里无一档越 500，故分拆方案列全 `—`；`design-review-record.mjs` 与批单测档在快照上都没有 ⇒ `新`。

函数档位：本批增长的两处是 `settleDesignReview`（`design-token.mjs`，加处置计算与一次写调用）与 `appendBatchRecord`（`batch-record-write.mjs`，加被动写那一笔），都在 100–300 带内；`designReviewBlock` 在叶档新建，体量小于 100。无一函数到 300 行。

**文档面（不带行数读数）**

- `ADVISOR-GUARDS.md` ∥ `BATCH-RECORD.md` ∥ `DESIGN-TOKEN-SETTLEMENT.md` 三份设计档。
- `test/rtm/batch-ledger.md` 与 `test/RTM.md` 的用例行，随下方 RTM 增量改写。
- `docs/core/requirements/ENGINEERING-MODE-V2-SPEC-BATCH-SEGMENT.md`：**主 agent 的笔，本席只核不改**。本批已把 ② 功能点 5 改成「状态行只由工具改值——生命周期动作（status ∥ close ∥ supersede ∥ 重开），或正文写入同笔（`§2` ∥ `§5` 写非空正文即置该段完成词、`§3` 随裁定行置位）；作者不自写状态行。」、④ 补 `AC-M3-11`。核对结论 = `BATCH-RECORD.md` §4.12 的被动写与该两句同口径（词表零扩、已是完成词则零写、写被拒则不动），无第二说。

同档 ② 功能点 2 与 9 也已由主 agent 改：2 = 按轨分岔（设计轨评审不在本档写任何段、代码轨评审写 `§3`），9 = 块形（工具盖戳 + 一行结算头 + 评审原文，无裁定行的轮照样落块）。

核对结论 = 功能点 2 与 `BATCH-RECORD.md` §4.1 ∥ §4.3 ∥ §4.4 ∥ §4.22 及 `ADVISOR-GUARDS.md` §1.2 同口径；功能点 9 与 `BATCH-RECORD.md` §4.4 的块形三件同口径。

**提示词面（内容由主 agent 供、eng-coder 落，全部逐字）**

- `persona-engineering.md`：§1「提示词面 · 主供措辞（第 11 项）」给的整行文本替换以 `The reviewer thereby gets the ` 开头那一行；紧随的 `- Adjudication table:` 不动。
- `advisor-design.md` 与三份 `advisor-round*.md`：凡以「拿到绑定的批档写通道 ∥ 把结论表与 VERDICT 写进 §3」为前提的句子，语义替换为 §1 同节给的逐字文本；位置与裁句由实施轮按句意定。
- 两处口径必须一致（同一机制两个面不许各说一套）。`knowledge/tool-batch-review.md` 保留：它服务普通模式的评审面。

**验收对照**

批单测 = `docs/batches/2026-11-14-design-review-self-record.test.mjs`（与批档同目录同批名，收口删除）；集成档 = `test/integration/*`。

- A1 结算自写块：一次 pass 的设计评审结算后，§3 新增一块——块首工具戳、次行 `**结算**：已签发（pass）· <日期>`、其下为评审原文逐行缩进四格（块形三件的单源 = `BATCH-RECORD.md` §4.4，含日期）。读者 = 批单测 A1 三格断言块文三件；本设计评审席按本节核。
- A2 §3 写面按「模式 × 评审轨」分岔：工程模式设计轨的任何身份（含评审实例）`append`/`edit`/`status` 打 `§3` 均被拒；工程模式代码轨与普通模式的绑定评审 `append §3` 仍成功。读者 = 批单测 A2 三格（工程设计轨拒 ∥ 工程代码轨放行 ∥ 普通模式放行）。
- A3 写不进不签发：批档不可写 ⇒ 结算拒签、档字节回到写前、槽零写。读者 = 批单测的注入失败侧。
- A4 非签发路径落块：`changes-required` 轮落块且结算头为未签发，状态行按处置重置或不动。读者 = 批单测 A4 两格（块存在 + 结算头文本 = `**结算**：未签发（changes-required）· <日期>`）；本档 §3 不作读者——本批 §3 现有各轮块是评审席手写的存量形态，没有 `**结算**：` 行。
- A5 回退一笔：凭证持久化失败 ⇒ 块与状态行一同回写 `before`。读者 = `settleAdvisorRun` 的回退路 + 批单测。
- A6 基线族零残留：`section3BlocksAtStart` ∥ `section3BlocksBaseline` ∥ `no-section3-block` 三串在代码面（`thincoder-core/` ∥ `test/`）零命中（内置 `grep` 读数入 §5；`docs/batches/` 下的旧批遗留串不属本批判域）。
- A7 原文不与结构打架：评审原文含 `## §5` 与 `### 轮次 9（评审子代理）` 两类行时，段定位与轮次计数不变。读者 = 批单测。
- A8 文档面互不矛盾：改后读 `BATCH-RECORD.md` §4.1 ∥ §4.2 ∥ §4.3 ∥ §4.4 ∥ §4.7 ∥ §4.10 ∥ §4.12 ∥ §4.21 ∥ §4.22 ∥ §4.23 ∥ §7 D-BR41 ∥ D-BR43 与 `ADVISOR-GUARDS.md` §1.2 ∥ §1.3 ∥ §2.3，判据、块形、席位、状态行四项互相说得通；矛盾即拒。
- A9 不落块两支：封印算不出（被审档在结算前改了）与评审陈旧（封印 hash 不符）⇒ 不落块、槽零写、§3 状态行不动。读者 = 批单测 A9 两格。
- A10 另两个处置：`no-pass-line`（无裁定行）与 `no-valid-echo`（无有效回显）同样落块，结算头写「未签发（<那两个字>）」，状态行不动。读者 = 批单测 A10 两格。
- A11 状态行被动写：不调 `status`，`append` 一笔非空正文到 `§2` ⇒ 该段状态行即 `设计完成`，到 `§5` ⇒ 即 `实施完成`；正文只有占位 ∥ 标题行 ⇒ 不动。判据能红：改前形态下同一笔写完后状态行不变。读者 = 批单测 A11 三格 + 集成 `CLI 27-4`。
- A12 `§1` 骨架状态行：`batch create` 一笔之后，`§1` 段头区状态行逐字 = `进行中`，括注为空（`§1` 段内无 `（…）`）。能红侧 = 改前形态同一笔之后读到 `进行中（…）`。读者 = 批单测 A12 一格（读 `§1` 段头区字面）。

**关键决策**

- KD1 正文形态 = 原文引用，不取结构化摘要（§1 上抛项的处置）：摘要要解析自由文本，比原文更容易漂；评审报告没有第二份持久副本，原文落档不构成重复。代价 = 块长，由缩进成代码块使段长判据不计它。
- KD2 缩进四格而非裸落或块引用：裸落会被原文里的 `## §N` 破坏段定位；`> ` 块引用会让裁定锚失配（锚的前导只允许空白），状态行计划与 `§5` 门就读不到裁定。
- KD3 记录不拿凭证结果当过滤条件：拒签轮同样落块，凭证结局写进结算头。理由 = 本批要消的正是「一轮的结论只活在 digest 里」，而拒签轮恰恰最容易丢。
- KD4 评审席笔收回：一个写者。留两个写者就有两块一轮、块数翻倍，而记录里没人分得清哪块是本轮的。
- KD5 封印算不出与陈旧评审不落块：它判的那份状态已不在，落了会把作废结论写成结论。
- KD6 块文成形出叶档：见机制设计（七）。

**RTM 增量（对 `test/RTM.md`，用例按题名点名）**

- 改写 `CLI 17-1 错误 · 块写不进 ⇒ 拒签且零字节`（原题「评审回 pass 但 §3 未写 ⇒ 无 token、spawn 被机械拒；补写 §3 后重评 ⇒ 签发」的那条失败侧已随机制（五）消失）：正常格 = 结算自写块后签发；失败侧 = 块写不进 ⇒ 拒签且档字节零变。交互 = `settleDesignReview` ↔ 批档 §3 写通道 ↔ 凭证槽；需求 = `ENGINEERING-MODE-V2-SPEC-BATCH-SEGMENT.md` ② 功能点 9「评审记录」；进入口 = 父侧发设计评审（工程模式 depth-0，`batchDoc` 绑定）→ 读回执 → 派 eng-coder。
- 删除 `27-1`（设计评审 `append §3` 携 pass ⇒ 工具随写置位状态行）：那条通道已不在（工程模式设计轨）。
- 删除 `27-3`（设计评审只用 `edit §3` 写结论 ⇒ 结算补签）：`edit` 打 `§3` 已拒。
- 改写 `27-2`（工具面批的评审工具表含 `batch`）：夹具写明 = **工程模式代码轨**；断言不变（工具表含 `batch`、评审 `append §3` 后段级状态行 = `评审通过`、收口门放行），异常格补一格 = 工程模式**设计轨**的同一夹具 ⇒ 工具表不含 `batch`、`§3` 写不进（fail-closed）。交互 = 挂载面 `advisorToolsFor` ↔ 段白名单 `allowedSegment` ↔ §3 段级状态行；需求 = `ENGINEERING-MODE-V2-SPEC-BATCH-SEGMENT.md` ② 功能点 9（评审记录）· 机制指针 = `ADVISOR-GUARDS.md` §1.2（设计轨）∥ `BATCH-RECORD.md` §4.4（代码轨记录落点）；进入口 = 父侧对工具面批 fire 一轮代码轨评审（`batchDoc` + `documents` 同档）。
- 改写 `10-1`：夹具原先要先替评审写 §3 才达得到签发；改为由结算写（`§3` 落块 + 段级状态行 = `评审通过`），断言（close 回收令牌）不变。交互 ∥ 需求 ∥ 进入口 = 节注已载（`DESIGN-TOKEN-SETTLEMENT.md` F-D7 ∥ F-D8；进入口 = 父侧 `batch close`），节注零改。
- 改写 `10-4`：其「夹具同上：该评审须把 §3 写进批档」的前提在工程模式设计轨已不可达，改为「夹具前提同 `10-1`：`§3` 由结算落块并置位」；断言（槽行 `batch=<批档 basename>`、其余列零变）不变。交互 ∥ 需求 ∥ 进入口 = 节注已载（同 `10-1` 那一条节注），节注零改。
- 改写 `CLI 27` 节题：「评审写一笔 §3 就够：状态行由工具置位」→「状态行由工具置位，不另调 `status`」——27-1 ∥ 27-3 删除后，节题上半句与机制相反；`test/RTM.md` 故事索引表该行标题同步改成同一句（两处必须逐字相同）。
- 改写 `CLI 27` 目的：「`append §3` 那一笔随裁定行置位，`edit §3` 写块的那一笔由结算当场补签」→ 设计轨由结算写块并同笔置位、代码轨由评审写块而置位仍由工具同笔；「评审不必记得再签一次 `status`，漏签不再白跑一轮评审」保留。
- 改写 `CLI 27` 节注三态：「三态（行序）= 27-1 正常 · 27-2 正常（工具面批走代码轨）· 27-3 正常」→「两态（行序）= 27-2 正常（工程模式代码轨 · 异常格 = 工程设计轨）· 27-4 正常 ∥ 边界（正文只有占位行 ⇒ 状态行不动）」；27-4 的交互组件与进入口随新行补齐。
- 改写 `CLI 17` 节注：「机制单源 = `docs/core/design/ADVISOR-GUARDS.md`「§3 落地门」」→ §1.2「§3 记录与结算判据」——原节名已不在盘。
- 新增 `CLI 27-4 状态行被动写：`§2`/`§5` 写正文那一笔即置完成词`：夹具写一笔非空正文、全程不调 `status`，断言 `§2` 段内状态行 = `设计完成`、`§5` = `实施完成`；异常格 = 正文只有占位行 ⇒ 状态行不动。交互 = `batch append`/`edit` 写正文那一笔 ↔ 段头区状态行（现成词表 + `EXCLUDED_LINE_RE` 判空）；需求 = `ENGINEERING-MODE-V2-SPEC-BATCH-SEGMENT.md` ② 功能点 5 ∥ `AC-M3-11`；进入口 = eng-designer / eng-coder 经 `batch append` 写自己段；用例档 = `test/integration/batch-status-auto-set.test.mjs`（27 节现有档）。
- 新增 = 其余零：其余记录面变化由批单测覆盖、收口删除。

**上抛项（交主 agent）**

- 已处置：提示词面内容由 §1「提示词面 · 主供措辞（第 11 项）」供出，两处逐字文本；本设计只定语义与落点（见「提示词面」节）。
- 已处置（父侧第 3 轮裁定，见本档 §1「设计评审第 3 轮 · 父侧裁决」）：分岔维取「模式 × 评审轨」。理由与本设计同源（防与结算块同轮并存），并保住工程模式代码轨评审的唯一记录面与 `test/rtm/batch-ledger.md` `14-2` 的收口门读数。落点 = `BATCH-RECORD.md` §4.1 ∥ §4.3 ∥ §4.4 ∥ §4.22 与 `ADVISOR-GUARDS.md` §1.2 ∥ §1.3。

**边界（本批不做）**

- 不改凭证判据：评审通过才发凭证，一个字不动。
- 不动 `batch-unreadable` 的拒因值——只把它「基线缺失」那一半随基线族删掉。
- 不新增工具 action、不新增配置开关、不新增重评入口。
- 不改 §5 写入门、收口门与 `advisor` 工具面的 action 集合。
- 普通模式与工程模式代码轨的评审 `§3` 写面一字不动（含 `R-G3` 闸、`dropStamp`、两个状态行计划的消费点）。
- 不动 `§3` 那条现有被动写（`statusPassPlan` 的 `Number(seg) !== 3` 守卫）；不加新状态词；不改 `§1` 的写入权限与判据。
- 不给结算笔设长度门：块长随评审原文，不截断——截断会把结论切掉，而没有场景要求它。

**本席随批发现（已实读，供实施轮处置）**

- 注释把「§3 落地门」指到 `ADVISOR-GUARDS.md` §1.1，而 §1.1 是「单谓词」、门在 §1.2：`design-token.mjs` 三处、`advisor-record-gate.test.mjs` 档头、`batch-close-token-consume.test.mjs` 档头、`advisor-settle.mjs` 一处、`design-slots.mjs` 一处。本批既改名又搬判据，这些注释同批 re-point 到 §1.2。
- `advisor/loop.mjs` 档头「评审是独立基底，不随会话 mode 变化」说的是工具描述取完整档；本次加的 mode 判据是挂载面另一句。实施时分开写，别把 mode 判据塞进描述口径那句。

## §3 设计评审（评审子代理）
**状态行**：评审通过



### 轮次 1（评审子代理）

| # | 严重度 | 状态 | 证据 |
|---|---|---|---|
| 1 | 🔴 | 未解 | 三说并存：§2「条目 3」=「守那条通道的写入闸与伪戳丢弃同批退役」；§2「机制设计（六）」=「`R-G3`）、`sanitizeText` 的 `dropStamp`、两个状态行计划消费点在 `append` 面**保留**」；A2=「任何身份 `append`/`edit` 打 `§3` 均被段域拒」。而 §2「边界」写「普通模式的评审 `§3` 写面一字不动」，BATCH-RECORD §4.1 ∥ §4.22 与 ADVISOR-GUARDS §1.2 均写普通模式评审席照旧写 §3 |
| 2 | 🔴 | 未解 | §2「机制设计（六）」内两句互斥：「`SEGMENT_BY_ROLE` 删 review→§3 项」与同句「评审席位照旧写 §3」；§2 未说该映射按模式分岔，也未给 `R-G3` 之外的授权面 |
| 3 | 🟡 | 未解 | BATCH-RECORD §4.1「动作与段写权」表四行（主 agent ∥ eng-designer ∥ eng-coder ∥ 普通 coder，已绑定）无普通模式评审席行，而同节正文写「普通模式的评审席位仍写 `§3`」 |
| 4 | 🟡 | 未解 | BATCH-RECORD §4.4「原因取既有词表（`pass` ∥ `changes-required` ∥ `no-pass-line` ∥ `no-valid-echo`）」—— 仓内只有消息常量 `NO_VALID_ECHO_MARK`（`design-token.mjs`），`no-valid-echo` 无既有拒因词 |
| 5 | 🟡 | 未解 | §2 无最近先例行（先例坐标 + 对齐 ∥ 偏离理由）；§1「勘察」只有库内档名，不构成先例对齐裁断 |
| 6 | 🟡 | 未解 | §2 无勘察证据行（公共源档查了哪些 ∥ 有无相关）；同批勘察在 §1「库内 = 已查」一节，未进 §2 |
| 7 | 🟡 | 未解 | 验收 A1–A8 缺「封印算不出 ∥ 陈旧评审 ⇒ 不落块」（KD5 ∥ ADVISOR-GUARDS §1.2 ∥ DESIGN-TOKEN-SETTLEMENT §8.2）与 `no-pass-line` ∥ `no-valid-echo` 落块两条；A4 只覆盖 `changes-required` |
| 8 | 🟡 | 未解 | A1–A7 的读者一律写「批单测」，而「受影响文件（机读清单）」三档测试全为 `test/integration/*`，无批单测档；验收面没有指名可跑的档 |
| 9 | 🟡 | 未解 | 「RTM 增量」只点用例行；`CLI 27. 评审写一笔 §3 就够：状态行由工具置位` 节题在其 27-1 ∥ 27-3 删除后与机制相反，CLI 17 节注「机制单源 = `docs/core/design/ADVISOR-GUARDS.md`「§3 落地门」」指向已删判据 —— 两者均未进增量 |
| 10 | 🟡 | 未解 | BATCH-RECORD §4.4「该笔不走 `append` 的文档机检门」未给场景：无实读拒文、无可复现路径；同节另称缩进已使段长判据不计整块，两条理由互相覆盖 |
| 11 | 🟡 | 未解 | §2「提示词面」自陈 `advisor-design.md` 与三份 `advisor-round*.md` 的 §3 节前提「工程模式下该前提为假」仍留，内容待供（上抛项）；落档后设计档与评审提示词对同一机制各说一套 |
| 12 | 🔵 | 记录 | ADVISOR-GUARDS §2.3 点火顺序「design 的 batchDoc 非空」为拒绝启动，§1.2 同一条件称「程序不变量违反」throw、不得作业务拒因 |
| 13 | 🔵 | 记录 | §2 档位结论只判文件（十四档无一越 500，读数经抽核成立）；函数档位无结论，`design-token.mjs` 的 `settleDesignReview` 为本批增长的函数，处 100–300 带 |

VERDICT: changes-required

计数：🔴 2 · 🟡 9 · 🔵 2。抽核：`design-token.mjs` ∥ `batch-record-write.mjs` ∥ `advisor/loop.mjs` 内容行数与清单一致；`design-review-record.mjs` 盘上无档（合「新」）。

### 轮次 2（评审子代理）

核项结论（第 2 轮）：第 1 轮条目 1–8、10–13 与追加项第 1／2 件已落地；条目 9 部分落地（见 4–6）；追加项第 3 件机制已落（`BATCH-RECORD.md` §4.10）、判据未落（见 2）。

| # | 严重度 | 状态 | 证据 |
|---|---|---|---|
| 1 | 🔴 | 未解 | 追加项「`append`/`edit` 往 `§2` 或 `§5` 写入非空正文，同一笔把该段状态行置成它的完成词」（`BATCH-RECORD.md` §4.12）与需求档 `ENGINEERING-MODE-V2-SPEC-BATCH-SEGMENT.md` ② 功能点 5「状态行只由 status/close 等生命周期动作改值」互相否定；§2「文档面」只列三份设计档 + RTM，未含该需求档 |
| 2 | 🟡 | 未解 | 追加项第 3 件无判据：验收对照 A1–A11 中只有 A11 覆盖 `§2`／`§5`，无一格断言新建批档的 `§1` 状态行为纯「进行中」 |
| 3 | 🟡 | 未解 | A4 读者 =「批单测 + §3 现文」：本档 §3 轮次 1 块为评审席手写、无 `**结算**：` 行，验不到 A4 的「落块 + 未签发头」两件 |
| 4 | 🟡 | 未解 | RTM 增量未含 `CLI 27` 目的「`append §3` 那一笔随裁定行置位，`edit §3` 写块的那一笔由结算当场补签」与节注「三态（行序）= 27-1 正常 · 27-2 正常 · 27-3 正常」——27-1／27-3 删除后两处均与机制相反 |
| 5 | 🟡 | 未解 | RTM 增量漏 `10-4`：其「怎么做」仍写「夹具同上：该评审须把 §3 写进批档」，本批后该前提在工程模式不可达 |
| 6 | 🟡 | 未解 | 被改写／新增用例未各自给交互 ∥ 需求 ∥ 进入口（条目 9 后半）；`27-2` 翻向后未写哪一模式使「评审工具表不含 `batch`」成立，而 `BATCH-RECORD.md` §4.3 写「普通模式仍获得 `§3` 通道」 |
| 7 | 🟡 | 未解 | `BATCH-RECORD.md` §7 的 D-BR41「状态行值只有一个写者」与 §4.7「主动 status 与被动同笔写同一词表」及 §4.12 两条写路并存，读者判不出被动写是否违反该决策行 |
| 8 | 🟡 | 未解 | 工程模式代码轨评审的记录落点未写：§4.1「工程模式下 `§3` 没有席位写者」＋§4.3「绑定评审在工程模式不获得批档写通道」＋A2 全身份拒；RTM `27-2` 原文「它把 §3 写进绑定档」被翻掉而无替代面 |

抽核（尺寸）：`design-token.mjs` 止于 459（合清单 459）、`batch-record-write.mjs` 止于 394（合 394）、`batch-skeleton.mjs` 417 行（合 417）。

抽核（符号）：`allowedSegment` 的 `if (review) return 3`、`statusPassPlan` 的 `if (Number(seg) !== 3) return null`、`ROUND_HEADING_RE`、`_V_PRE`、`SEGMENT_BY_ROLE`（`{ "eng-designer": 2, "eng-coder": 5 }`）、`PROFILE_SEGMENTS` 的 `review: 3` 均在盘，与 §2 勘察证据一致。

VERDICT: changes-required

计数：🔴 1 · 🟡 7 · 🔵 0。

### 轮次 3（评审子代理）

核项结论（第 3 轮）：第 2 轮 8 条中 1、2、3、4、5、7、8 已落地；第 6 条落地（`27-2` 夹具＝工程模式代码轨、异常格＝工程设计轨、交互 ∥ 需求 ∥ 进入口已补，`10-1` ∥ `10-4` 写「节注已载」并声明节注零改）。§1 第 3 轮裁定「模式 × 评审轨」已进 `BATCH-RECORD.md` §4.1 ∥ §4.3 ∥ §4.4 ∥ §4.22 与 `ADVISOR-GUARDS.md` §1.2 ∥ §1.3、`DESIGN-TOKEN-SETTLEMENT.md` §8.2、§2 条目 3 与机制（六）——口径一致，唯 §4.2 未跟上（见 1）。

| # | 严重度 | 状态 | 证据 |
|---|---|---|---|
| 1 | 🔴 | 未解 | `BATCH-RECORD.md` §4.2 档绑定表「advisor（仅普通模式） | 当前评审实例 batchDoc」与同档 §4.3「**代码轨**与普通模式仍获得 `§3` 通道」、§4.22「工程模式的代码轨评审与普通模式评审仍写 `§3`」、`ADVISOR-GUARDS.md` §1.2「`§3` 仍由绑定评审席位写」互斥；同档 §2「评审的 batchDoc 通过评审实例键传递」亦不按模式限。同一机制（工程模式代码轨评审有无批档绑定）两处相反 |
| 2 | 🟡 | 未解 | 需求档 ② 功能点 2「工程模式由主 agent、eng-designer、advisor、eng-coder 分写」∥ 功能点 9「§3 每轮写结论表、VERDICT 和计数」未随本轮块形（戳 + 结算头 + 原文）与按轨分岔更新；§2「文档面」只核了功能点 5 与 `AC-M3-11` |
| 3 | 🟡 | 未解 | 工程设计轨 `§3` 守卫两层并存且未说哪层为准：§4.3「绑定且非「工程模式 ∧ 设计轨」才追加该工具」与 §2 机制设计（六）「`append` ∥ `edit` ∥ `status` 三面同拒」；工具不挂载时 `allowedSegment` 那一支不可达，未给可达路径或观测，而 A2「工程设计轨拒」一格依赖它 |
| 4 | 🟡 | 未解 | §2 条目 1「评审席不再写它、不再改 §3 状态行」无限定，条目 3 又为代码轨与普通模式保留该通道与两个状态行计划 |
| 5 | 🟡 | 未解 | `BATCH-RECORD.md` §4.1「动作与段写权」表五行无「工程模式代码轨评审席」行，而同节正文与 §4.4 ∥ §4.22 都给它 `§3` |
| 6 | 🟡 | 未解 | `BATCH-RECORD.md` §4.3「本批让判据真正消费评审轨这一维」——批内施工语留在状态档规范面，收口后「本批」无指代 |
| 7 | 🔵 | 记录 | A12 读者写「批单测 A12 一格 + `CLI 27-4` 的 create 前置」，而 27-4 断言 `§2` ∥ `§5` 被动写，不读 `§1` 段头区 |
| 8 | 🔵 | 记录 | RTM 增量 `27-2` 的「需求 = `ADVISOR-GUARDS.md` §1.2 ∥ `BATCH-RECORD.md` §4.4」指设计档，未给需求档 |
| 9 | 🔵 | 记录 | `BATCH-RECORD.md` §4.21 枚举状态行写路为「status/close/reopen 等生命周期动作，以及 append/edit 对 `§2`/`§5` 的被动同笔写」，漏 `§3` 随裁定行置位那条（§4.12 仍称其为被动写） |

VERDICT: changes-required

计数：🔴 1 · 🟡 5 · 🔵 3。抽核（尺寸）：`design-token.mjs` 末内容行 459、`batch-record-write.mjs` 末内容行 394，与机读清单一致；`design-review-record.mjs` 与批单测档盘上无档（合「新」）。抽核（引用形态）：三份设计档内 `第 N 行` 与 `file:NNN` 零命中，`落地门` 零命中（第 1 轮条目 9 的改名已落）。

### 轮次 4（评审子代理）

核项结论（第 4 轮）：第 3 轮 9 条全部落地，逐条证据见下表。

| 第 3 轮条目 | 落地证据（指针） |
|---|---|
| 1 | `BATCH-RECORD.md` §4.2 行「advisor（绑定评审：设计轨 ∥ 代码轨 ∥ 普通模式）」 |
| 2 | 需求档 ② 功能点 2 ∥ 9 已在盘（主 agent 笔）；§2「文档面」有同口径核对句 |
| 3 | §4.3「两层守卫各管一个问题」段，并给白名单支可达路径（批单测直调 `appendBatchRecord`） |
| 4 | §2 条目 1「工程模式**设计轨**的评审席不再写它」 |
| 5 | §4.1 六行表含「工程模式代码轨评审席」∥「普通模式评审席」 |
| 6 | §4.3「两处判据同源——同一对输入（模式 × 评审轨）」；「本批」只剩非施工语两处 |
| 7 | A12「读者 = 批单测 A12 一格」 |
| 8 | 27-2 行「需求 = `ENGINEERING-MODE-V2-SPEC-BATCH-SEGMENT.md` ② 功能点 9」 |
| 9 | §4.21 三路枚举含「`§3` 随带裁定行的追加同笔置位或重置」 |

口径核对：§4.1 ∥ §4.2 ∥ §4.3 ∥ §4.22 与 `ADVISOR-GUARDS.md` §1.2 对「设计轨不写 `§3`、代码轨与普通模式写 `§3`」读成一条规则，无第二说。

| # | 严重度 | 状态 | 证据 |
|---|---|---|---|
| 1 | 🟡 | 未解 | 同一行结算头两形：`BATCH-RECORD.md` §4.4 块形「结算头一行：`**结算**：<已签发\|未签发>（<原因>）· <日期>`」，而 §2 A1 读者格写「次行 `**结算**：已签发（pass）`」——无 `· <日期>`；A4 同一格却是「结算头文本 = `**结算**：未签发（changes-required）· <日期>`」。照 A1 字面写断言即与块形不符 |
| 2 | 🟡 | 未解 | §2 RTM 增量「改写 `CLI 17-1 错误 · 评审回 pass 但 §3 未写 ⇒ 无 token、spawn 被机械拒`」——题名逐字保留，而该题失败侧已随机制（五）「判据 ①（块数 > 点火基线）删除」消失；同轮已给 `CLI 27` 节题改写，17-1 自身题名未给新形 |
| 3 | 🔵 | 记录 | `BATCH-RECORD.md` §4.12 判空判据指向 `batch-skeleton.mjs` 的 `EXCLUDED_LINE_RE`，而它是该档未导出的 `const`；导出面是 `export function sectionContentState(src, seg)`，其实现用同一个正则 |
| 4 | 🔵 | 记录 | §2 A4 脚注「本批 §3 现有两块是评审席手写的存量形态」：§3 盘上已有轮次 1 ∥ 2 ∥ 3 三块，本轮为第 4 块；该计数是写作时读数，论证本身不依赖它 |

VERDICT: pass

计数：🔴 0 · 🟡 2 · 🔵 2。

抽核（尺寸）：`design-token.mjs` 全文止于 459 行，合机读清单 459（≤500）；`thincoder-core/agent-tools/design-review-record.mjs` 盘上无档（合「新」）。

抽核（符号）：`NO_VALID_ECHO_MARK` ∥ `statusResetPlan` ∥ `statusPassPlan` ∥ `verdictGateFailure` ∥ `nextRoundNumber` ∥ `dropStamp` ∥ `sectionContentState` 均在盘。

抽核（引用形态）：三份设计档内「落地门」∥「第 N 行」∥ `file:NNN` 零命中。

## §4 用户批准（主 agent）

**批准面** = 需求档 `docs/core/requirements/ENGINEERING-MODE-V2-SPEC-BATCH-SEGMENT.md` ② 功能点 2 ∥ 3 ∥ 5 ∥ 9 与 `AC-M3-11`、设计档 `docs/core/design/BATCH-RECORD.md` §4.1 ∥ §4.2 ∥ §4.3 ∥ §4.4 ∥ §4.7 ∥ §4.12 ∥ §4.21 ∥ §4.22 ∥ §7 与 `ADVISOR-GUARDS.md` §1.2 ∥ §1.3 ∥ §2.3、任务书 §2。

**用户原话**（逐字）：

- 「可以，这个逻辑可以试试。」—— 2026-11-14，对「让工具自己写 §3，评审席不再负责这件事」的方案表态。
- 「开工」—— 2026-11-14 17:0x，本批开工令。
- 「1」—— 2026-11-14，对状态行被动写三个选项选第 1 项：并入本批，不另开台账。
- 「自动给跑完。」—— 2026-11-14，全链授权：设计与实施之间的各步不再回问。

**授权范围**：设计 → 设计评审 → 逐轮裁决与修面 → 实施 → 验证 → 收口，全链一次跑完；中途只在四种情形回问——评审 🔴 修不了 ∥ 实施须偏离设计 ∥ 用户叫停 ∥ 冒出本批之外的新范围。

## §5 实施记录（eng-coder）
**状态行**：实施完成



### 实施摘要

- **条目 1（结算自写块）**：`design-token.mjs` 的 `settleDesignReview` 先算处置（回显 → 裁定，值域四词），再判批档可读、算封印，然后**块与状态行同一个字符串、经 `recordWriter` 一条通道一次写、一次回读**；回读不符 ⇒ `status-not-passed` 且写回写前原文。块形出叶档 `design-review-record.mjs` 的 `designReviewBlock`（工具戳 + 结算头 + 原文缩进四格，N 取 `nextRoundNumber`）。
- **条目 2（基线族退役）**：删 `RECORD_NO_BLOCK`、`run.section3BlocksAtStart` 的两支判据（`design-token.mjs`）、`section3BlocksBaseline`（`advisor.mjs`）与逐笔快照/写回（`advisor-async.mjs` ∥ `advisor-settle.mjs`）。读数见下「A6 读数」。
- **条目 3（§3 写面按模式 × 评审轨）**：挂载面 `advisor/loop.mjs` 的 `advisorToolsFor` 判「绑定 ∧ ¬（工程 ∧ 设计轨）」；段白名单 `batch-record-write.mjs` 的 `allowedSegment` 收 `reviewTrack` 并调 `reviewWritableSegment`（工程非代码轨 ⇒ null），`append` ∥ `edit` ∥ `status` 三面同拒，拒文 `sectionThreeDesignTrackError`。工程代码轨与普通模式取到 §3，原路不动。
- **条目 3 的「收回」形态**：设计轨上 `R-G3`、`dropStamp`、两个状态行计划**在段白名单那一句就出局**——`allowedSegment` 返 null 即抛，写在读档与任何门之前，故那三件在那条路上不可达；代码轨与普通模式上三件照旧消费（`append` 面未改）。
- **条目 4（状态行被动同笔写）**：`batch-skeleton.mjs` 新增 `statusDonePlan`（`§2` ⇒ 设计完成 · `§5` ⇒ 实施完成；已是完成词 || 段判空 || 段头区两条状态行 ⇒ 零写）；`appendBatchRecord` ∥ `editBatchRecord` 在写正文那一笔里调它，仍只一次 `writeFileSync`。`batchSkeleton` 的 `§1` 状态行改为纯「进行中」（去 `🔄` 与 `（…）`）。
- **结算的模式边界（评审轮 🔴 修）**：结算写 §3 只在工程模式（`BATCH-RECORD.md` §4.4 头句）。普通模式整段跳过、`sign: null`，连批档都不读——那一路的 §3 由绑定评审席位写，留两个写者就有两块一轮。

### 读数表

| 命令 | 读数 |
|---|---|
| `node --test docs/batches/2026-11-14-design-review-self-record.test.mjs` | tests 16 · pass 16 · fail 0 |
| `node --test test/integration/{advisor-record-gate,batch-status-auto-set,batch-close-token-consume,batch-edit-spec-section}.test.mjs` | tests 11 · pass 11 · fail 0 |
| `node --test test/integration/*.test.mjs`（收尾前全档一次） | tests 216 · pass 213 · fail 3 |
| `node scripts/check-syntax.mjs`（`thincoder-core`） | 324 file(s) OK |

全档那 3 格不与本批相关，逐格点名：

- `doc-anchor-graph` 43-1 ∥ 43-2：断言要 `doc:docs/core/design/EDIT.md <--cites-req-- req:F16`，而该档内 `F16` 零命中（内置 grep 实读）——本批未碰该档，属既存失效。
- `browser-shared-pool` 34-1：`browser failed to start: DevToolsActivePort not written within 25s`，环境面（同一用例在另一次全档跑里是绿的）。

### 红侧（改前形态下同一断言读到什么）

- `A12`：`git diff` 显示改前骨架那一行是 `` `**状态行**：🔄 ${STATUS_WORDS[1].open}（…）` `` ⇒ 同一 `deepEqual` 读到 `["**状态行**：🔄 进行中（…）"]`，与断言的 `["**状态行**：进行中"]` 不等 ⇒ 红。
- `A11`：改前 `batch-record-write.mjs` 内 `statusDonePlan` 零命中（实读 diff 面）⇒ 往 `§2` 写正文后状态行仍是骨架占位句 `（eng-designer 写入时更新）`，`readSectionStatusWord` 读到 `null` ⇒ 红。
- `A2`（工程设计轨拒）：改前 `batch-segment-vocab.mjs` 内 `reviewWritableSegment` 零命中 ⇒ 同一次 `append §3` 写入成功、块数 +1 ⇒ 红。
- `A2 结算面`（普通模式不进写面）：改前 `design-token.mjs` 无 `designReviewBlock` / `appendLineToSection`（零命中）⇒ 普通模式同样落一块，`countRoundBlocks(§3)` 读到 1 ⇒ 红。

### 清单外改动（逐档点名）

三档在 §2 机读清单里没有行。逐档写「为哪条、改了什么、是否零行为变」。

1. **`thincoder-core/agent-tools/batch-lifecycle.mjs`** —— 为 A2 第三格（`status` 打 §3 也须拒）。
   改：`statusBatchRecord` 收 `reviewTrack`；段域改成 `review ? reviewWritableSegment(engineering, reviewTrack) : …`；被拒时抛 `sectionThreeDesignTrackError("batch")`；档头与函数头各补一句注释。
   零行为变：`review` 为假时 `seg` 表达式与非评审身份的判据逐字未变；`review` 为真且代码轨/普通模式时取到 3，与改前同值。
   注：本档在本 spawn 的文件清单里有、在 §2 机读清单里没有。§2 由设计席补，本席不改。

2. **`test/integration/batch-gates-fixture.mjs`** —— 为 14-1 ∥ 14-8 仍写得了 §3。
   改：夹具的 `review` 工具建实例时补 `reviewType: "code"`（配一行说明）。
   零行为变：夹具仍走工程模式、仍写 §3、仍断言 `R-G3` 与置位；只是把「哪条轨」写明——不写就在工程模式落到设计轨、整套夹具失效。

3. **`test/integration/batch-edit-spec-section.test.mjs`**（7-10）—— 为本批被动写改断言。
   改：断言「只有目标行变」改为「恰两行变」，并逐行点名：§2 段头区状态占位句 → `**状态行**：设计完成`，作废判据行 → 新判据。回执、门行、锚不唯一三格未动。
   零行为变（对业务）：7-10 的业务结论不变——作废判据整行退场、其余行逐字节不变；变的是「其余行」的边界多了被动写那一行。

### A6 读数（三串：`section3BlocksAtStart` ∥ `section3BlocksBaseline` ∥ `no-section3-block`）

- 内置 `grep`（literal，三串一轮）对 `thincoder-core/` 跑：no matches；对 `test/` 跑：no matches。
- 全仓仍有命中，全在过程档：`docs/batches/2026-11-11-review-pass-signs-itself.test.mjs`（旧批单测未删，且是 `.mjs`）、`docs/batches/2026-11-07-tool-face-review-route.md`、`docs/batches/2026-11-14-tool-docs-master-split.md`。
- 结论：**代码面零命中**（本批判据的实指面）；A6 字面「全仓零命中」不成立，处置见落地核对第 4 条。

### 落地核对（设计档里被本批落地改写成不成立的说法）

1. `docs/core/design/BATCH-RECORD.md` §4.4 —— 原句「**代码轨**与**普通模式**没有设计结算（无设计凭证 ⇒ 结算不进场），绑定评审席位照旧写 `§3`」。
   前半句已由代码落实（普通模式不进写面）；后半句的前提「无设计凭证」与代码不符：`generateDesignToken` 对设计评审不分模式铸造。
   处置 = **目标移动**（句子该改，不改代码）：代码侧已按结论落地，句子由设计席收正。
2. `docs/core/design/ADVISOR-GUARDS.md` §1.2 —— 原句「这条只在工程模式的**设计轨**成立——代码轨与普通模式都没有设计凭证，结算不进场，`§3` 仍由绑定评审席位写」。
   同上一条同一处前提错，同一处置。
3. 批档 §2 机制（四）末句 —— 原句「两个计划函数仍是单源，消费方从 append 面挪到结算面。」
   实际 = 两个消费面并存（结算面 + 第 3 轮裁定保留的 append 面）。处置 = 目标移动，设计席收口同轮改写。
4. 批档 §2 A6 —— 原句「三串全仓零命中」。实际 = 代码面零命中、过程档仍有历史串。处置 = 目标移动，判域收窄到代码面。
5. `docs/core/design/BATCH-RECORD.md` §4.9「已收口档冻结」与结算面 —— 不是被改写，是本批暴露的缺口：`append`/`edit`/`status` 三条写路都过冻结判据，结算这一笔不过。处置见「待裁」。

### 待裁（本席不落，交父侧转设计席）

- **结算要不要受整档冻结门约束**。落法需要给一个拒因值，而 §1.2 的拒因值域只有两词（`batch-unreadable` ∥ `status-not-passed`），加词是设计变更。
  谁裁 = 设计席经父侧；条件 = 下一轮设计评审；到期 = 本批收口前给答复，未答则按现状收口并登记台账。
- **`statusResetPlan` 的 `traceLine` 在结算面留不留**。本席只用它的 `statusValue`：§4.4 的块形是「三件，按序」，没有第四件的位置，打回痕迹由结算头 + 上一块本身承载。
  谁裁 = 设计席经父侧；条件 = 同上；到期 = 同上。

### 验收对照（逐条）

| 判据 | 结论 | 落点 |
|---|---|---|
| A1 结算自写块 | ✅ | 批单测 A1（戳 ∥ 结算头含日期 ∥ 原文四格 ∥ 块数 +1 ∥ 凭证不落档） |
| A2 §3 写面按模式 × 评审轨 | ✅ | 批单测 A2 四格（设计轨三面拒 ∥ 代码轨放行 ∥ 普通模式放行 ∥ 结算面普通模式不进写面） |
| A3 写不进不签发 | ✅ | 批单测 A3 两格（通道抛错 ∥ 半截写 + 回写） |
| A4 非签发路径落块 | ✅ | 批单测 A4 |
| A5 回退一笔 | ✅ | 批单测 A5（`sign.before` ∥ `rollback()`）+ `settleAdvisorRun` 的落盘失败支 |
| A6 基线族零残留 | ⚠️ | 代码面零命中；字面「全仓」不成立（落地核对 4） |
| A7 原文不与结构打架 | ✅ | 批单测 A7 |
| A8 文档面互不矛盾 | ✅ | 三份设计档与代码在判据 ∥ 块形 ∥ 席位 ∥ 状态行四项对得上（内置 grep + 实读） |
| A9 不落块两支 | ✅ | 批单测 A9 两格（封印算不出 ∥ 陈旧，后者含不陈旧对照格） |
| A10 另两个处置 | ✅ | 批单测 A10 两格 |
| A11 状态行被动写 | ✅ | 批单测 A11（占位行不动 ∥ §2 ∥ §5 ∥ 幂等）+ 集成 27-4 |
| A12 §1 骨架状态行 | ✅ | 批单测 A12 |

### 审计与评审轮次 · 终态

- **内部 divergence 审计**（只读 explore，1 轮）：交 9 条（🟡 5 · 🔵 4，无 🔴）。已修 4 条：A9 陈旧格补 `reviewType` + 不陈旧对照（判据原本红不了）、A3 补半截写格（回写那一笔原本无红侧）、`allowedSegment` 自己承载评审轨判据（§4.3 点名的符号）、块后空行对齐 `insertIntoSection`（叶档注释那句「读起来一样」原本不成立）；另删掉 A12 一格与 §1 判据无关的空断言。转落地核对 2 条（A6 字面、机制（四）末句）、转清单外 1 条、转待裁 1 条（`traceLine`）。
- **内部代码评审**（`advisor` type=code，1 轮）：判 `changes-required` —— 🔴 1 · 🟡 2 · 🔵 2。🔴 已修：普通模式结算原本也写 §3，与 §4.4 头句相反、且普通模式的 §3 写通道按本批设计保留 ⇒ 同一轮两个写者；修法 = 结算写面按模式分岔，并补一格判据。🔵 2 已修（被动写传本笔段号；段头区两条状态行时零写，与 `status` 同结论）。🟡 2 转落地核对/待裁（冻结门缺口、A6 字面）。
- **终态**：`converged`（自评）。两轮共 14 条，全部有归宿：已修 8 · 文档面 4（落地核对 2 + 待裁 2）· 清单外披露 1 · 不成立 1（A6 字面，随文档面）。
- **改后复跑**：批单测 16/16、集成四档 11/11 全绿（上表读数即改后那一遍）。

### 交付面一览（文件）

- 源：`design-review-record.mjs`（新）· `design-token.mjs` · `batch-record-write.mjs` · `batch-skeleton.mjs` · `batch-segment-vocab.mjs` · `batch-lifecycle.mjs` · `batch.mjs` · `advisor.mjs` · `advisor-async.mjs` · `advisor-settle.mjs` · `design-slots.mjs` · `advisor/loop.mjs`。
- 测：`docs/batches/2026-11-14-design-review-self-record.test.mjs`（批单测，收口删）· `advisor-record-gate.test.mjs` · `batch-status-auto-set.test.mjs` · `batch-close-token-consume.test.mjs` · `batch-gates-fixture.mjs` · `batch-edit-spec-section.test.mjs`。

### 一处会话事实（供读档人）

本节四笔 `append` 走的是**本进程启动时**载入的批工具（改前代码），故 §5 没有随正文被动置状态行——本席随后用一次显式 `status` 把它置成「实施完成」。改后的被动写在批单测 A11 与集成 27-4 里实测（新进程加载新码），两条都绿。

## §6 验证与收口（父代理）

### 验证读数（父侧独立复跑，非转述）

| 命令 | 读数 |
|---|---|
| `node --test --test-reporter=tap docs/batches/2026-11-14-design-review-self-record.test.mjs` | `tests 16 · pass 16 · fail 0` |
| `node --test --test-reporter=tap test/integration/{advisor-record-gate,batch-status-auto-set,batch-close-token-consume,batch-edit-spec-section}.test.mjs` | `tests 11 · pass 11 · fail 0` |
| `node test/run.mjs`（全量） | `tests 216 · pass 214 · fail 2` |
| `node scripts/check-syntax.mjs`（`thincoder-core`） | `324 file(s) OK` |

**两红的归因**：`test/integration/doc-anchor-graph.test.mjs` 的 `CLI 43-1` ∥ `CLI 43-2`，归台账 `#2404`（`DOC-GRAPH.md` 重写遗留），本批对符号命中零处。上一批出现过的浏览器三条（`CLI 34-1` ∥ `34-2` ∥ `35-3`）本轮全绿，印证「并发争用」而非行为缺陷。

**用例总数从 217 降到 216** 的原因：`CLI 27-1` ∥ `27-3` 退役（−2）、`CLI 27-4` 新增（+1），净 −1。

### 行为读数（本批交付的机制，逐条实读）

| 项 | 读数 |
|---|---|
| 结算自写 §3 块 | 块 = 工具戳 + `**结算**：<已签发\|未签发>（<原因>）· <日期>` + 评审原文逐行缩进四格；块与状态行同一笔一次写、一次回读 |
| 「本轮没写 §3」判据退役 | `section3BlocksAtStart` ∥ `section3BlocksBaseline` ∥ `no-section3-block` 在 `thincoder-core/` 与 `test/` 代码面零命中 |
| §3 写面分岔 | 工程设计轨：挂载面不追加 `batch`、`allowedSegment` 收回，`append` ∥ `edit` ∥ `status` 三面同拒；代码轨与普通模式原路不动 |
| `§2`／`§5` 被动同笔写 | `statusDonePlan`：占位行 ∥ 已置位 ∥ 段头区两条状态行三种态均判零写，幂等 |
| `§1` 骨架 | 由 `进行中（…）` 改为纯 `进行中`，无括注占位 |

**红侧证过**（改前形态同一断言读到什么，`#11` 已逐条落 §5）：A12 读到 `进行中（…）`；A11 读到 `null`（改前无 `statusDonePlan`）；A2 设计轨读到「写入成功、块数 +1」。

### 落地核对

- 设计档三处「无设计凭证 ⇒ 结算不进场」的前提与代码不符（设计 token 不分模式铸造）——判**目标移动**，由设计席本批收正 `BATCH-RECORD.md` §4.4 ∥ `ADVISOR-GUARDS.md` §1.2。
- 批档 §2 机制（四）「消费方从 append 面挪到结算面」实为两个消费面并存——判**目标移动**，设计席同轮改。
- 批档 §2 A6「三串全仓零命中」实为**代码面**零命中、过程档仍有历史串——判**判域收窄**，设计席同轮改。

### 新债

**`#2428`** 结算写 §3 不受整档冻结门约束。本批不做，条件触发（下次动 `design-token.mjs` 结算面）。理由：落同一道门需新拒因值，而 `ADVISOR-GUARDS.md` §1.2 值域只有两词，加词属设计变更。

本批无其他新债。
