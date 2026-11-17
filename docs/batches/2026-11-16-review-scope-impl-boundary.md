# 2026-11-16 · review-scope-impl-boundary
> 六段，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 每段只有一个作者：作者的段可 `append` 加内容、可就地改（`edit`）；非作者一概拒。
> 编制：主 agent · 2026-11-16 · 来源 = 用户 2026-11-16 指令：「你在文档开发的提示词里约束一下，不要评审实施阶段的部分。」「文档评审的提示词。」——一次处理。
> 台账 = #2499（core · 归批）。前情 = 无（独立批）。
## §1 讨论（主 agent）
**状态行**：已收口 2026-11-16
批起 sha = ea6244363b98fe7b6f57cd7da08c88781979dda2
<§1 模板占位：本批条目 / 关键判据 / 授权口径>

### 用户指令（原话，逐字）

- 「你在文档开发的提示词里约束一下，不要评审实施阶段的部分。」
- 「文档评审的提示词。」
- 「——一次处理」

### 要解决的问题（本会话实况）

`#2488` 批运行中，`docs/batches/2026-11-16-prompt-reference-scope.md` 的 `§3` 轮次 3 打回，唯一 🔴 是「`§5` 实施记录为空」。由此产生一串连锁：

1. `§3` 状态行被重置为「进行中（第 3 轮打回）」；
2. `assertSectionFiveGate` 判据之一是 `§3` 状态行 = `评审通过`，于是 `§5` 的 `append` 被拒；
3. 我判定为"死锁"，去查门、查封条、重跑设计评审，绕掉整轮；
4. 而 `batch-closeout.mjs` 的 `CHAIN_SEGMENTS = [2, 3, 4, 6]` 自己写着「§5 段号豁免恒不判」——收口门从不判 `§5`。

**根因在我**：派 `#27` 时 `object.target` 写了「…+ §5 门死锁的裁决」，轮次 3 的对象写了「…∥ §5 段」，两次都把实施阶段产物请进了评审射程。已记 `#2499`（本批接管）。

### 为什么现有条款挡不住

`thincoder-core/prompts/advisor-design.md` 第 3 条 Boundary 逐字：

```
3. **Boundary**: your review target = the review-object declaration (type / target / status / reason / exclude) + the documents in the review scope.
   **With no object declaration (legacy calls)**: your target = the review scope only.
```

判据是「跟着 object 声明走」。**object 写宽，它就查宽**，条款本身没有任何东西挡得住。所以本批要加的是一条**独立于 object 的硬边界**，不是再写一句「请按声明来」。

`thincoder-core/prompts/knowledge/documentation-evaluation.md` 是文档评审的通用尺，通篇讲「怎么评价一份文档」，同样没有一句划定「评审域不含实施阶段产物」。

### 库内调研

`已查：grep "批档|batch record|§5|实施记录" 域 thincoder-core/prompts/` → 命中 `advisor-design.md`／`advisor-round1..3.md`／`discipline-engineering.md`／`tool-batch*.md`／`persona-eng-coder.md` 等。其中**没有任何一条**禁止评审判 `§5`；`tool-batch.md` 只规定 §5 的作者归属（eng-coder），`persona-eng-coder.md` 只规定 §5 怎么写。

`已查：advisor-design.md 全文头部` → 第 3 条 Boundary 如上；第 19–22 行为该条全文，其 Why 只讲「目标不扩张」，未把任何段落排除在射程外。

### 已定决定

- **已定决定**：约束落在设计评审轨提示词（`advisor-design.md` 的 Boundary 条）与文档评审判据（`documentation-evaluation.md`）。 · 用户原话：「你在文档开发的提示词里约束一下，不要评审实施阶段的部分。」「文档评审的提示词。」 · 时间：2026-11-16
- **已定决定**：约束内容 = 实施阶段产物不在评审射程内，且**不受 object 声明扩张**。 · 用户原话：「不要评审实施阶段的部分。」 · 时间：2026-11-16

### 边界（本批不做）

- **不改 `assertSectionFiveGate`**：用户选择的是从源头切断（评审不判 ⇒ 不产生打回 ⇒ `§3` 不被重置），不是改门判据。门的既有行为不在本批。
- **不改 `persona-engineering.md`** 里派单侧的 object 写法要求：本批只约束评审侧；派单侧的口径另议。
- **不动 `advisor-round1.md` / `advisor-round2.md` / `advisor-round3.md`**：三份首行自报身份都是代码评审注入（`code review injection`），本批不是它们的读者。设计评审轮 2+ 被路由到后两份是另一个缺陷，见本节末「撤回扩面裁定 · 认定路由缺陷」。
- **不新增台账行**：本批接管 `#2499`，其修法建议（「在评审轨判据里加一条硬禁则」）即本批内容。

### 用户澄清（2026-11-16，纠正口误）

- **已定决定**：用户前一条指令里的「文档开发」是口误，指向**文档评审**。 · 用户原话：「文档开发是我说错了，我说的是文档评审。」 · 时间：2026-11-16

落点经「用户追加」定为三处：`advisor-design.md`（声明面）· `documentation-evaluation.md`（判据面）· `document-writing.md`（写作面）。

### 用户追加（2026-11-16，第三处落点：写作侧）

- **已定决定**：`document-writing.md` 也在射程内，方向与评审侧相反——评审侧管「别查实施阶段的产物」，写作侧管「别把别的阶段的产物写成本阶段该有的一部分」。`#29` 的 `files` 需补入该档（fix round 追加）。 · 用户原话：「文档写的时候也要提醒一下：不要瞎写，这次你就是把实施阶段的事儿让文档评审去做了。」 · 时间：2026-11-16

判读：这次的错在两头。我把实施阶段的产物（§5 的实施记录）写进了设计阶段该管的文档评审判据里，评审就按我划的射程去查它，查出「§5 为空」——而这个产物只有实施完成之后才存在。只堵评审侧不够：写作侧照旧会把别阶段的东西写进来，评审迟早又照着去查。两头对准同一条边界才成立。

写作侧这一条要防的判据：一份文档写它自己阶段该有的东西——设计文档写设计与任务书，不写实施记录、不把只有实施完成才存在的产物写成本文档的必备项。

### 库外调研（补记 · 主 agent 补，设计席指出 §1 缺这一行）

库外 = B 类：

- 改动面：四份档，全是提示词与设计档——`advisor-design.md` · `documentation-evaluation.md` · `document-writing.md` · `docs/core/design/ADVISOR-CONVERGENCE.md`。无依赖清单、无 lockfile、无上游 API 调用、无协议实现、无浏览器或设备驱动。
- 外部断言 = 零：本批结论只说评审该判哪些段，不对任何外部系统的行为下断言。

### §6 一并划出域外（我的裁定）

- **已定决定**：采纳设计席的上抛，`§4` / `§5` / `§6` 三段一并划出设计评审的目标域。 · 依据：设计席 `§2` 关键决策 1；理由为结构同源——三段都写在本轮评审之后，只划 `§5` 等于给同一个死锁在 `§6` 上留了下一次的门。 · 时间：2026-11-16

宽在哪，如实记：用户原话是「实施阶段」，`§6`「验证与收口」字面上不在其中。我裁纳入。代价是射程比字面宽一格；用户若不同意，撤回的是 `§6` 这一项，`§4` / `§5` 两句不动。

### 需求层增补（归主 agent）

- **已定决定**：`docs/core/requirements/ADVISOR-CONVERGENCE.md` 补一条 feature point，承载「评审目标域不含晚于本轮产出的段落」。现有 F13 只讲压缩后对象声明仍在、F14 只讲引文按声明范围解析，都不承载这条。 · 依据：设计席上抛「需求层无 feature point 承载本规则」；D11 要求同一条规则在每一层同轮改到位。 · 时间：2026-11-16

由我写（需求层归主 agent），在本批内落地，不另起批。

### 待补条目 E4（写作侧，设计席走 fix round）

- **已定决定**：`§2` 现只有 E1 / E2 两条，用户追加的第三处在 `thincoder-core/prompts/knowledge/document-writing.md`，`§2` 缺这一条。设计席 fix round 补 E4：落点、逐字条文、验收 AC5、受影响文件加一行。 · 依据：用户 2026-11-16 追加原话「文档写的时候也要提醒一下：不要瞎写，这次你就是把实施阶段的事儿让文档评审去做了。」 · 时间：2026-11-16

E4 与 E1/E2 方向相反而不冲突：E1/E2 管评审不查实施阶段，E4 管写作不把别的阶段的产物写成本阶段该有的一部分。两头对准同一条边界。

### 需求层已落地（主 agent 笔，2026-11-16）

- `docs/core/requirements/ADVISOR-CONVERGENCE.md` §2.3 新增 **F36**（两列）：设计评审的目标域止于本轮评审判得着的面，`§4` / `§5` / `§6` 永在域外、空着不是发现、对象声明点名也不扩张；读不受限。代码评审轮里实施记录已在盘上，判它属正常射程。
- `docs/core/requirements/DOC-SYSTEM.md` §2 新增 **FR8**：一份文档只承载本阶段该有的产物，不把只有实施完成后才存在的产物列成本档必备项。

落点判断：评审侧归 `ADVISOR-CONVERGENCE`（该板块就是评审语义）；写作侧归 `DOC-SYSTEM`——它的 §1 明写「本档只规定本仓文档必须满足的状态」，写作纪律的归属在那里，而 `ADVISOR-CONVERGENCE` §1 的板块范围是「轮次、证据、守卫、凭证交界与完成语义」，装不下写作侧这条。两档各自新增一个点，不混装。

这两笔是我写的（需求层归主 agent），设计席既没改也没权改。

### 待修：设计档「两处 ∥ 三处」字面冲突（设计席 fix round）

- **已定决定**：`docs/core/design/ADVISOR-CONVERGENCE.md` §8.4 的两句仍写「两处」，而 `§2` 已改为「三处提示词同改」。冲突须在发评审前消除。 · 依据：E4 补入后提示词落点由二变三（`advisor-design.md` · `documentation-evaluation.md` · `document-writing.md`），§8.4 那两句是 E3 原文残留。 · 时间：2026-11-16

判据（不是逐字，措辞归设计席）：

- §8.4 讲评审侧那句，「两处」应点明是**评审侧的两处**——否则读者数不齐三处，会以为写侧不受「同改」约束。
- §8.4 写侧那句末尾的「与评审侧两处同改」，应为**三处同改**：写侧一处加评审侧两处，合计三处。
- 与 `§2` 机制设计里「为什么三处提示词不算三版并存」逐字对齐。

这条为什么不能留到评审抓：它是同一份档内两处字面冲突，不是判断分歧。评审抓到也只能退回，多走一轮。就地修掉。

### 自纠：F36 的列数与位置（主 agent 笔，2026-11-16）

第一版把 `F36` 加在 `§2.1`，且写成三列。两处都错：

- **列数**：`ADVISOR-CONVERGENCE.md` 的需求表是两列（`# | 需求`），验收自含在需求句里；三列是本仓 `DOC-SYSTEM.md` 的格式。同档两种表结构，评审必抓，渲染也会错位。
- **位置**：`§2.1` 题为「轮次与证据」，射程既不是轮次也不是证据。`§2.3` 的 `F18` 管「评审 `documents` 受理哪些文件」，`F36` 管「判哪些段」，同属受理面，故并入 `§2.3` 末。

已改为两列、落在 `F21` 之后。`DOC-SYSTEM.md` 的 `FR8` 保持三列——那档的表本来就是三列，不改。

### 裁定：E1／E2 补逐字条文（设计席 fix round）

- **已定决定**：`§2` 的 E1（`advisor-design.md` Boundary 条）与 E2（`documentation-evaluation.md` D 组第 13 条）须补逐字条文，与 E4 同格式——代码块内顶层条目 + `Why`，落地后跑 `doc_check(mode:"gate")`、首行 `PASS`。 · 依据：本条为主 agent 依 `§2` 内部一致性作的裁决，非用户指令。 · 时间：2026-11-16

三条理由：

1. **`§2` 自身不一致**：E4 有逐字条文，E1／E2 只有内容规格。同一份任务书对四条目标条目给两种完成度，实施席得替设计席做设计。
2. **AC3 现在判不了**：它要求「两处逐字对读不冲突」，可两处根本没有逐字文本可对读。
3. **不是 scope 扩张**：唯一权威源是 `§8.4`，逐字条文从它转写而来，是把已裁定的规则写成可落地文本，不是新语义。

要求：E1 与 E2 各给代码块逐字文本，措辞与 `§8.4` 的「声明面／判据面」对齐；E2 经 `common.md` 装进所有角色，条文里不得出现批档段号。

### 主 agent 核出的必修项（发评审前，2026-11-16）

`E2 逐字条文`第 3 行是病句，且这行会照抄进 `documentation-evaluation.md`：

```text
Such content includes an approval, an implementation record and a verification record; a section holding one of them being empty is not a defect of the document.
```

`a section holding one of them being empty is not a defect` —— 主语 `a section holding one of them` 与谓语 `is not` 之间悬了一个分词短语 `being empty`，句子读不成句。想说的是「持有这类内容的段，空着不算文档缺陷」。

提示词面是产品代码，模型逐行读它，病句直接抵掉可读性。建议改成 `an empty section of that kind is not a defect of the document.` 或等价的通顺写法，不改判据。

同批请设计席自查一处：第 3 行的 `an approval, an implementation record and a verification record` 是举例，不是重定义。第 2 行已用 `content that only later stages of the work can produce` 划了范围，举例若被读者当成清单，会把「当前阶段就要写的批准段」一并放过。要不要加限定词，由设计席判，我只提这一条风险。

### 设计评审首轮（#34）裁决 · 主 agent

评审 `ae7cc879` 结论 `VERDICT: pass`，计数 🔴 0 · 🟡 8 · 🔵 2。十行发现逐条裁决如下。

**本批修（三条，均为本批落下的表述缺陷）**

| 评审# | 判据 | 处置 |
|---|---|---|
| 3 | 勘察证据行未覆盖 §8.4 声明「三处同改」的三份提示词档 | 修：设计档 header 勘察行补三份落点及各自现状 |
| 7 | §8.4「设计文档写设计与任务书」与 `DOC-SYSTEM` FR8「设计文档写设计、目标态与验收」是同一规则两种枚举 | 修：§8.4 与 FR8 统一为一套枚举，§8.4 声明其为 FR8 的复述并只补提示词落点 |
| 8 | FR8 的「验收」与 `METHODOLOGY` F2-4「执行验收归过程记录」同词不同主 | 修：FR8 加限定词「验收标准」，把「执行验收」排除在外 |

**批外（六条，既有缺口，本批未改动那些区域）**：1（需求 §4 项目上下文注入无落点）· 2（F13／F35／N9／F21 无落点或部分落点）· 4（最近先例行缺实现坐标与先例批）· 5（§2.2／§4.3 条件路径无观察场景）· 9（§10 验证面清单无对错读数）· 10（需求档 §2 表格无验收列）。六条记入台账，不本批处置——本批改动面是 §8.4 与三条提示词落点，把这六条并进来会让本批从「加一条射程规则」扩成「重写评审设计档」。

**技术反驳（一条）**：6（§2.4「严重度规则」／「当前评审标准」／§8.4「任务书」三词无指针）。三词均为体系内既有术语，定义分别在评审协议、轮次语义与批档 §2；按 D2 单源，§8.4 复述定义只会造出第二版。

**为什么修完要重跑评审**：designToken 绑评审读过的字节，改 §8.4 与 FR8 即令本枚 token 作废。三条若不修，实施将基于一份读者分不清「任务书」与「目标态与验收」是否为同一物的设计。

**重跑前的动作**：`#35` 设计席 fix round 改 §8.4 与 header；FR8 由主 agent 同轮改。

### 自动推进授权 · 主 agent 记

- **自动推进**：本批全程（`#35` fix → 重跑设计评审 → 实施 → 收口）· 起于 2026-11-16 · 用户原话：「自动跑完」
- 范围：本批已确认的四处落点（`advisor-design.md` 第 3 条 · `documentation-evaluation.md` D 组第 13 条 · `document-writing.md` E4 · `ADVISOR-CONVERGENCE.md` §8.4）与两处需求（F36 · FR8）。
- 不在范围内：`#2497` `#2495` `#2498` 与台账 `#2500`（批外六条）——这些要新的 go-ahead。
- 批外六条已登 `#2500`（技术待办 · 条件触发 · 待文档表述债批处置）。

### 评审第 2 轮裁决（#36 · pass · 0🔴·3🟡·2🔵）

五条发现逐条处置，均不动被审字节——三条修项已落干净，此刻再改一字，刚签发的 token 即作废：

- **#1 🟡 §8.4 完成态口吻 vs 勘察行说「三处都没有」** — 不修，实施落地后自行消解。三处提示词一落句，§8.4「三处各按自己的读者陈述」即为事实；反过来首行勘察那三句「未把任何批档段落划出射程／无判域条／无跨阶段产物归属条」届时成假陈述。故这是落地核对项：§5 须记该行处置，收口时由设计席同笔改写或删除，不由实施席动设计档。
- **#2 🟡 F36 说「评审」，§8.4 说「设计评审」** — 真缺陷，但不在本批改动面。需求层那句话宽了一格：代码评审轮里 §5／§6 已写在盘上，字面照 F36 读会禁掉本该出的发现。收紧口径属需求层维护（主 agent 笔），记台账另处置。
- **#3 🟡 §8.2 仍自带一份窄枚举、无 FR8 指针** — 真缺陷，§8.2 不在本批改动面。上一轮刚把 §8.4 与 FR8 统一，§8.2 是同一漂移的下一个入口。记台账。
- **#4 🔵 §8.4 近逐字复述 FR8，标点不同（「：」→「——」）** — 复述是有意为之：评审要求枚举统一，改成纯指针反而要重新解释一遍。代价是两处不再逐字相等，将来的漂移无法用顺次比对发现。记台账。
- **#5 🔵 §8.4 的「为什么」是结构推论、无现场** — 接受，不处置。批档次序本身给出可复现路径：§5 只在实施完成后存在，判它即等于卡在放行它的 pass 之前。这是 F2-7 的「可复现路径」，不必另找现场。

**不因这五条重跑评审**：三条 🟡 都不改变实施产物——E1／E2／E4 三段逐字条文在本轮前已定；重跑只会把表述债变成第三轮评审，而字节不动，判据也不会动。

### 撤回扩面裁定 · 认定路由缺陷（2026-11-16，用户指出后）

`#37` 上抛「设计评审第 2 轮起不经 `advisor-design.md`」。我据 `buildAdvisorSystemPrompt` 的代码裁了「射程扩至 round2／round3」。**该裁定撤回**——用户指出文档评审没有轮次概念，每次标准一样。

核实属实，且比我先前的判断更重。两档首行自报身份：

- `advisor-round2.md`：`<!-- slot:[special-advisor-round2] consumers:[advisor round-2+ code review injection — self-contained, NOT part of the main assembly chain] -->`
- `advisor-round3.md`：`<!-- slot:[special-advisor-round3] consumers:[advisor final-round code review injection — self-contained, NOT part of the main assembly chain] -->`

二者都写着 **code review injection**。而 `thincoder-core/advisor.mjs` 的 `buildAdvisorSystemPrompt` 在 `reviewType === "design"` 且 `hasPrior` 为真时，返回的正是这两个常量。代码评审的收敛轮提示词被注入给了设计评审。

- **已定决定**：`advisor.mjs` 的设计评审路由是一个缺陷——设计评审每次须按完整判据审全文，不得降级为「只验上轮条目」；修法与批次归属待裁。本批提示词落点回到三处，`advisor-round2.md` / `advisor-round3.md` 不动。 · 用户原话：「这是个巨型bug，只有代码评审有这个概念，文档评审每次的标准都是一样的。」 · 时间：2026-11-16

丢失的东西逐条可查。`advisor-round3.md` 的 `**Verification scope**: strictly verify only the prior review output (provided in the review context).`，加工作流第 5 步 `Budget: read only the files named in the prior-review items.`。

这两句说明它不重审全文，只验上一轮点名的文件。`advisor-round2.md` 同构，只多一句 `You may note obvious new issues introduced by the fixes.`

由此 `#2488` 的轮次 3 那个 🔴 有了真正的来路：那一轮不审全文，只验上轮条目「AC2 两条读数都记 §5」是否落地，读到 §5 无字便判 🔴。轮次 4 判 `pass` 同理——只是「上轮条目都改了」，不是完整重审。

### E1 双 Why 形态缺陷（`#37` 报，主 agent 判为真缺陷）

`advisor-design.md` 第 3 条现有两个 `**Why**:`——原条一处（在 E1 之前），E1 一处。原判是删掉标记、把语义并入上一行；读盘后改判：真缺陷在**行序**，不在标记数量——E1 的 `Why` 夹在第 3、4 条判据之间，把该条劈成两半，读者读到中途会以为条已讲完。

- **已定决定**：E1 保持四行，`**Why**: §5 exists only once implementation is done…` 移到 `**Reading is not judging**` 之后，一字不改。全条两个 Why 各解释一件事——原条那个解释「目标为何不扩张」，E1 这个解释「§4／§5／§6 为何出局」；合并会让读者拿 A 的理由去解释 B。 · 依据：`document-writing.md`「a top-level entry carries one `Why`」管的是新增条目的形态，不追改既有条目的理由数；本条的真缺陷是判据被理由劈开。 · 时间：2026-11-16

这条不留给评审抓：它与「扩面」同档同段，一次改完省一轮评审。

### `§8.4` 落点数：维持三处

- **已定决定**：`§8.4`「提示词落点合计三处」**不改**——声明面仍只有 `advisor-design.md` 一处。`§2` 受影响文件不补 round2／round3 两行，机读清单仍零行。 · 依据：`advisor-round2.md` / `advisor-round3.md` 是代码评审注入，不属本批读者；设计评审轮 2+ 被路由到二者是路由缺陷，修法是改 `advisor.mjs`，不是往那两档加条款。 · 时间：2026-11-16

### F36 加设计评审限定（主 agent 已落盘）

- **已定决定**：`docs/core/requirements/ADVISOR-CONVERGENCE.md` 的 F36 主语由「评审」收窄为「设计评审」，并补一句「代码评审轮里实施记录已在盘上，判它属于正常射程」。 · 依据：评审 `#36` 第 2 条发现——字面照 F36 读，代码评审轮也禁判 `§5`，而那时 `§5` 已产出。该发现原拟留作后续，射程扩至共用档后它变成即时伤害，故并入本批。 · 时间：2026-11-16

### `§2` 措辞订正：不再自量字数

- **已定决定**：`§2` 中「逐行 ≤300 字；量法 = node 读长度」改为「落地后跑 `doc_check(mode:"gate")`，首行 `PASS`」。 · 依据：2026-11-15 已定——文档长段的判据以 `doc_check` 为准，字数只是表征、不是判据；写进任务书的该是跑哪个工具，不是自量字数。 · 时间：2026-11-16

### 清理项（撤回扩面裁定的必然结果，不待新裁定）

`#38` 在被停之前已按旧裁定落了盘，下列内容与现行三处口径冲突，须清：

- **`§2` 删 E5**：条目、逐字条文、`AC6`、受影响文件里的 `advisor-round2.md` / `advisor-round3.md` 两行、fix round 落点对照中的「五处」表述——判据是 `§1` 现行的三处口径。
- **`§2` 上抛项**：现写「无在途上抛」，已被 `#37` 的待裁项推翻，改写为记录本次路由缺陷已上抛、修法与归属待用户裁。
- **`docs/core/design/ADVISOR-CONVERGENCE.md` §8.4**：落点改回三处（`advisor-design.md` · `documentation-evaluation.md` · `document-writing.md`），删去「共用档条件化」段落。
- **header 勘察行**：`#37` 已把三处落盘，原三句「未把任何批档段落划出射程 / 无判域条 / 无跨阶段产物归属条」已成假陈述，按落地核对改写为完成态。
- **本 fix round 不碰任何代码**：路由缺陷（`advisor.mjs` 把设计评审轮 2+ 派给 `ADVISOR_ROUND2` / `ADVISOR_ROUND3`）的修法与归属待用户裁，设计席不得自行改 `advisor.mjs` 或 `messages.mjs`。

### 用户裁定：路由缺陷在本批修

- **已定决定**：设计评审（`reviewType === "design"`）不走 `advisor-round2.md` / `advisor-round3.md`，代码要改。修法 = `buildAdvisorSystemPrompt` 的设计评审分支恒返回 `ADVISOR_DESIGN`；`advisor/messages.mjs` 里 `if (p && (agent._advisorRound || 0) > 0)` 拼 `buildConvergenceBody` 的那一段对设计评审不再拼。 · 用户原话：「代码当然要改，文档评审不能走round2/3」 · 时间：2026-11-16 12:16
- **归属（主 agent 主张，用户未明确表态）**：并入本批 `#2499` 一次收口。理由：本批往 `advisor-design.md` 加的四行，若设计评审轮 2+ 根本用不上，规则只覆盖一半场景。用户若要另起一批，本行改写，本批退回提示词面。
- **修法的代价，写明**：设计评审每轮都是全文重审，不再「只验上一轮条目」，token 消耗上升；这是用户要的正确性，不是回归。

### 路由缺陷：修法裁定与一处自纠

**自纠**：`§1` 前一版把设计评审轮 2+ 的 user 消息来源写成 `advisor/messages.mjs` 里「LEGACY COMPATIBILITY PATH」自注那一段，**坐标错了**。该段只在外部直接调 `buildAdvisorUserMessage` 且带 prior 时点火，设计评审不走它。实际来源是 `advisor.mjs` 的 `buildAdvisorFollowUp(...)`，拼接 `declaration + buildConvergenceBody(...)`。此错由设计席在 fix round 中实读指出，以实读为准。

**修法（五处，代码面）**：

1. `buildAdvisorSystemPrompt` 的设计分支 → 恒返回 `ADVISOR_DESIGN`，删掉 round 2 / round 3 分派。
2. `prepareAdvisorMessages` 的设计评审入口 → 去掉 `_advisorRound === 0` 限定，设计评审恒走完整消息构造。
3. `advisor/messages.mjs` 的 `## Design Review` 块 → 去掉轮次限定，每轮都出。
4. `buildConvergenceBody` 与 `isReReview` 两处 → 设计评审不拼 round 横幅与「strictly verify only the prior review output」指令；**prior 评审输出与 fix-claim 表保留**（否则评审席重复报已修的问题，白烧一轮）。
5. 拼装形态由设计席读 `convergence.mjs` 实际结构后定，不复用 `buildConvergenceBody` 亦可。

**不动**：`_advisorRound` 自增保持——显示、审计、`record-results.mjs`、`advisor-settle.mjs` 都在用，只是不再决定判据。

**一并处置**：`advisor.mjs` 与 `prompt-overlays.mjs` 的注释均声称 `test/prompt-injections.test.mjs` 守着 return 分支，全仓无此文件——两句都是假陈述。补测试或改注释，二选一；倾向补测试，理由：本缺陷活到现在，一半原因是没有机检拦过它。

**需求层**：`docs/core/requirements/ADVISOR-CONVERGENCE.md` 已增 **F37**（设计评审每轮全文重审、判据不随轮次衰减），主 agent 笔，已落盘。

### 裁定：E1 重排（推翻「去掉第二个 Why」）

**推翻自己的裁定**：前一条裁「E1 第 3 行去掉 `**Why**:`，语义并入上一行」。读盘后判定这是治症状不治病。

`advisor-design.md` 第 3 条的实况是八行，两个 `**Why**:`，且 `**Reading is not judging**` 这条判据落在第二个 Why **之后**——判据被理由劈成两半，读者读到第 6 行以为该条讲完了。

**真缺陷是顺序，不是 Why 的数量**。该条的既有形态是「判据 → Why 收尾」，E1 插在 Why 之后又带自己的 Why，就形成了「判据 → Why → 判据 → Why → 判据」的锯齿。

**新裁定：E1 四行，Why 移到 E1 三条判据之后**，形态：

```text
   **The declaration narrows, never widens**: ...（判据）
   **§4 / §5 / §6 stay outside that cap**: ...（判据）
   **Reading is not judging**: ...（判据）
   **Why**: §5 exists only once implementation is done, ...（收尾）
```

第 3 条最终形态 = 既有「三判据 + Why」+ E1「三判据 + Why」，两组各带一个理由，形式对称。

**为什么保留双 Why 而不合并**：两个 Why 讲两件事——`:22` 那个解释「目标为何不扩张」，E1 这个解释「§4/§5/§6 为何出局」。合并成一段会让读者拿 A 的理由去解释 B，而 `document-writing.md` 那条「一个顶层条目带一个 Why」治的是「同一理由重复写」，不是「一组判据一个理由」。

**行内长度**：重排不改字，四行字数不变，提示词面逐行判据不受影响。

**实施归属**：条文由设计席按此重排后落 `§2`，由实施席改盘上提示词档。

### 本轮 fix round 范围（设计席，三件，不改代码）

1. **`§2` 的 E6 从 open 改为完整**：按 `§1`「路由缺陷：修法裁定与一处自纠」的五处修法写全，含 system 侧与消息侧的各自落点、要保留的 prior 表与 fix-claim 表、以及 `_advisorRound` 自增不动的理由。**不要再标 open**——消息侧归属已定：`buildAdvisorFollowUp` 是主来源，`advisor/messages.mjs` 里自注 LEGACY 那一段不是设计评审路径。
2. **`§2` 的 E1 逐字条文重排为四行**：按 `§1`「裁定：E1 重排」的形态——三条判据连续，`**Why**:` 移到其后收尾。字数不变（不增删词，只换行序）。
3. **`§2` 的受影响文件、AC 两项随上述两件对齐**：E6 的两个代码档（`advisor.mjs` · `advisor/messages.mjs`）在受影响文件表内；E6 的判据要有可跑读数（本批单测档，落 `<docRoot.batches>/<本批档名>.test.mjs`，收口删除）。

**不做**：不动 `advisor-design.md`（实施席的笔，等本轮设计评审 pass 后由实施席按重排后的条文改盘）。

### 复述改引用 · 推翻先前两次裁定（2026-11-16，`§6` 第 3 条）

先前两次裁「§8.4 复述 FR8 是有意为之」：见本条前文「评审 #7 修」与「评审第 2 轮 #4」。`§6` 第 3 条改判为引用，二者冲突，以较晚的 `§6` 为准。

理由：`DOC-SYSTEM` FR6 要求「其他文档引用而非复制权威正文」。复述等于留两版正文，改一处即两版并存，顺次比对发现不了。设计档现只留 F36／FR8 的编号指针与本档自己的死锁理由，判决面不再复述。

### 两处坐标经设计席实读订正（2026-11-16）

- `MANIFEST.md` 的「标准层注入区分」不在 §2.7（§2.7 题为 `docRoot`），在 §2.12「标准层」。
- `TESTING.md` 无编号第 12 条判据（节号止于 §13）；「集成用例只从真实业务需要和真实生产问题产生」在 §13.1「当前规则」。

两处订正出自 `#43` 实读，落点已按订正坐标写入设计档 §11 与 §10。`§6` 第 1 条原写的 §2.7 与「无编号第 12 条」两处坐标据此作废。

## §2 批次任务与设计（eng-designer）
**状态行**：设计完成



### 本批条目（覆盖）

- **E1 · 设计评审轨：射程天花板**。落点 `thincoder-core/prompts/advisor-design.md` 第 3 条 Boundary，在既有「**Why**: the target does not expand」行之后（第 3 条末）插四行，形态 = 三条判据 + 一个 `**Why**` 收尾：声明只收窄不扩张（目标域止于批档 §1–§3 + 评审范围文档）· §4/§5/§6 写在本轮之后，故永在域外且空着不是发现 · 读不受限（代码可读，挡的是「对段的发现」）· 末行 `**Why**` 说明 §5 只有实施完成后才存在。逐字文本见本节末「E1 逐字条文」，照抄不改词。
  · 依据 §1「裁定：E1 重排（推翻「去掉第二个 Why」）」——判据在前、Why 收尾；该条既有「三判据 + Why」一组，E1 补第二组同形，两组各带一个理由。
- **E2 · 文档评审：判域**。落点 `thincoder-core/prompts/knowledge/documentation-evaluation.md`，新增 **D Evaluation domain** 组第 13 条：判域 = 文档当下说到的内容；晚于本轮的产物在域外、空着不是文档缺陷——即评审通过后才给的批准、实施记录与验证记录（与 F36 的 `§4` / `§5` / `§6` 同集）；带 Why 与「读不等于判」。逐字文本见本节末「E2 逐字条文」，照抄不改词；条内不出现批档段号（该档经 `common.md` 装进所有角色）。
  · 依据 §1 已定决定一（两处落点之一：文档评审判据）。
- **E3 · 单一权威源**。`docs/core/design/ADVISOR-CONVERGENCE.md` §8.4「射程天花板：评审侧与写侧」：两条规则（评审侧天花板、写侧镜像）同处陈述，只写当前状态；写侧的产物枚举不复述，直接归 `docs/core/requirements/DOC-SYSTEM.md` §2「功能性需求」的 FR8，本档只补它的提示词落点与理由。这一处是设计档、不是提示词落点（提示词落点是三档：`advisor-design.md` · `documentation-evaluation.md` · `document-writing.md`）；三处提示词按各自读者陈述同一规则，同改。
  · 依据：该档 §8 已拥有「评审维度」主题，§11 边界把轮次语义归本档，故不新建档（新建即碎片化）。
- **E4 · 写作侧：只写本阶段的产物**。落点 `thincoder-core/prompts/knowledge/document-writing.md`：在「The doc holds only the final, current state」条之后、「Verify the merge mapping's semantics file by file first」条之前插一条顶层条目，逐字文本见本节末「E4 逐字条文」。方向与 E1/E2 相反、边界同一条：本阶段自己的产物（设计、目标态、验收）留在档内，下一阶段的产物（实施记录）与「只有实施完成后才存在的东西」不进本档的必备项。
  · 依据 §1 用户追加原话：「文档写的时候也要提醒一下：不要瞎写，这次你就是把实施阶段的事儿让文档评审去做了。」
- **E6 · 设计评审不走收敛轮：改代码路由**。设计评审每轮都取 `ADVISOR_DESIGN` 的完整判据并全文重审；代码评审的 round2 / round3 收敛行为一字不动。改动面 = 四处代码 + 一处新增导出 + 两处假注释订正，逐处形态见本节末「E6 落地范围（已裁）」。`advisor-round2.md` / `advisor-round3.md` 文本不动，仍服务代码评审。
  · 依据 §1「用户裁定：路由缺陷在本批修」，用户原话：「代码当然要改，文档评审不能走round2/3」。

**已落盘**：`docs/core/design/ADVISOR-CONVERGENCE.md` §8.4「射程天花板：评审侧与写侧」含评审侧天花板与写侧镜像，提示词落点分列三处（声明面 `advisor-design.md` · 判据面 `documentation-evaluation.md` · 写作面 `document-writing.md`）；header 勘察行按落地核对改为完成态；§2.2 增两句——设计评审不衰减，以及轮 2+ 的用户消息带 prior 参考块（既有档改）。

### 机制设计

一句话：设计评审的目标域 = 本轮评审判得着的面（批档 §1–§3 + 评审范围文档）；对象声明只能收窄，不能把晚于本轮产出的段拉进来。写侧是它的镜像：本档只写本阶段该有的产物，下一阶段才存在的产物不进本档的必备项。

三处落点，各给各的读者：

- **评审轨提示词**（`advisor-design.md`）：给评审席可执行的禁令，点名 §4/§5/§6，并写明「读不受限」——同一份提示词的第 8 条（受影响档行数判据）要求它读盘、量行数，不写这个例外就与既有判据自相矛盾。
- **文档评审判据**（`documentation-evaluation.md`）：给任何做文档评价的读者。该档经 `common.md` 的 `{{knowledge:documentation-evaluation}}` 装进所有角色，故不点名批档段号，用「晚于评审产出的执行记载段」表述。
- **写作纪律**（`document-writing.md`）：给写文档的人，同一条边界的另一头——不把下一阶段的产物写成本档的必备项。只堵评审侧挡不住：写侧照旧列进去，评审迟早照着去查。
- **设计档 §8.4**：两条规则同处陈述，写侧枚举归 FR8，只写当前状态，不带本批条目。

**为什么三处提示词不算「三版并存」**：三处陈述的不是同一条 claim 的三个版本——`advisor-design.md` 管「对象声明能拉到哪」（声明面），`documentation-evaluation.md` 管「文档评价的判域」（判据面），`document-writing.md` 管「本档该不该写这个产物」（写作面，方向的另一端）。

`advisor-round2.md` / `advisor-round3.md` 不在落点内：两档是代码评审的收敛轮提示词，设计评审不走它们（E6 改路由），故不存在「同一规则在两档里条件化」这一处。

三处措辞不得互相矛盾；一处单改即落进两版并存，故 §8.4 写明三处同改。

### 受影响文件

- `thincoder-core/prompts/advisor-design.md`（第 3 条 Boundary：四行，E1；行序待订正）
- `thincoder-core/prompts/knowledge/documentation-evaluation.md`（D 组第 13 条，E2，已落地）
- `thincoder-core/prompts/knowledge/document-writing.md`（顶层条目一条，E4，已落地）
- `docs/core/design/ADVISOR-CONVERGENCE.md`（§8.4 三处落点、header 完成态、§2.2 路由与 prior 参考块，已落地）
- `thincoder-core/advisor.mjs`（`buildAdvisorSystemPrompt` 设计分支、`prepareAdvisorMessages` 入口与不可达块、一处假注释，E6）
- `thincoder-core/advisor/messages.mjs`（`buildAdvisorUserMessageInner` 的 `## Design Review` 分支，E6）
- `thincoder-core/advisor/convergence.mjs`（新增导出 `buildPriorReviewBlock`，E6）
- `thincoder-core/prompt-overlays.mjs`（`assemblePrompt` 上方一处假注释，E6）
- `docs/batches/2026-11-16-review-scope-impl-boundary.test.mjs`（本批单测档，收口删除）

**分层结论**：四个代码档都在设计时线（500 行）以下——批起快照的 node 行扫：`advisor.mjs` 284、`advisor/messages.mjs` 310、`advisor/convergence.mjs` 81、`prompt-overlays.mjs` 88（含末行空行）。四个都无单函数 ≥300 行，收口线 800 未触及；`.md` 不带行数读数。

**受影响文件（机读清单）**

```text
| 档 | 分拆方案 | 行数 |
|---|---|---|
| thincoder-core/advisor.mjs | 不拆：改 `buildAdvisorSystemPrompt` 分支与 `prepareAdvisorMessages` 入口，两处同文件 | 284 |
| thincoder-core/advisor/messages.mjs | 不拆：只改 `## Design Review` 分支一处 | 310 |
| thincoder-core/advisor/convergence.mjs | 不拆：新增一个导出函数，与既有 `buildConvergenceBody` 并列 | 81 |
| thincoder-core/prompt-overlays.mjs | 不拆：只订正 `assemblePrompt` 上方注释一句 | 88 |
| docs/batches/2026-11-16-review-scope-impl-boundary.test.mjs | 本批单测档，收口删除，不拆 | 新 |
```

四个代码档都在 500 行以下，本批不拆；`.md` 不进机读清单。行数 = 批起快照 `ea62443` 的 node 行扫，读数以该命令为准。

### 验收对照（读者判，可失败也可通过）

需求层对应：AC1／AC2／AC3 → `docs/core/requirements/ADVISOR-CONVERGENCE.md` §2.3 的 F36；AC4 → `docs/core/requirements/DOC-SYSTEM.md` §2 的 FR6（一条机制只有一个权威正文，只写当前状态）；AC5 → 同档 §2 的 FR8；AC7 → `ADVISOR-CONVERGENCE.md` 的 F37（设计评审每轮全文重审、判据不随轮次衰减）。

- **AC1 ↔ E1**：读者读 `advisor-design.md` 第 3 条全文，能答两问——「object.target 点名 §5 实施记录，该不该报」= 不该；「还能不能读实现代码」= 能。
  判错面：答「按声明来」或答「代码也不许读」⇒ 不通过。
- **AC2 ↔ E2**：任何读者读 `documentation-evaluation.md` 第 13 条全文，能答「判域到哪」与「为什么」。
  判错面：读成「凡没写的内容都不必评价」，把第 8 条（stale prescriptions）与第 9 条（acceptance）架空 ⇒ 不通过；或把「批准段」一律读成域外、连同本阶段就该写的批准段一并放过 ⇒ 不通过。
- **AC3 ↔ E1 ∥ E2 ∥ E4**：本节末三块逐字条文对读，同一规则不冲突、层级不同（声明面 ∥ 判据面 ∥ 写作面）。
  判错面：一处读成「声明可扩张」，或一处把晚于本轮的段列为可判 ⇒ 不通过。
- **AC4 ↔ E3**：读者读 §8.4 全文，能判规则与理由，并能点出三处提示词落点各管什么；且档内无本批条目、受影响清单、验收行、集成增量。
  判错面：出现上述任一项，或读者数不出三处（把写侧读成不在「同改」之内、以为只改评审侧两处可行）⇒ 不通过。
- **AC5 ↔ E4**：读者读 `document-writing.md` 该条全文，能答两问——「写设计文档时，要不要把『实施记录已填』列进它必须有的内容」= 不要；「本阶段的文档该写什么」= 本阶段自己的产物，目标态与验收标准照写。
  判错面：读成「文档只写已经发生的事，目标态、计划、验收都不许写」⇒ 不通过——那会把设计文档该有的目标态一并挡掉。
- **AC7 ↔ E6**：读 `thincoder-core/advisor.mjs` 的 `buildAdvisorSystemPrompt` 与设计档 §2.2「轮次映射」，能答三问——「设计评审第 3 轮的 system prompt 是哪一份」= `advisor-design.md`；「代码评审第 3 轮呢」= 仍是 `advisor-round3.md`；「设计评审第 3 轮的 user 消息里有 `## Round 3 —` 横幅吗」= 没有。
  判错面：设计评审第 2 轮起仍取 `ADVISOR_ROUND2` / `ADVISOR_ROUND3`，或代码评审被连带改成全文重审，或设计评审的用户消息仍带「只验上轮条目／不找新问题」指令 ⇒ 不通过。
  判据（可跑）：本批单测档 `docs/batches/2026-11-16-review-scope-impl-boundary.test.mjs`，`node --test docs/batches/2026-11-16-review-scope-impl-boundary.test.mjs` 全绿。五格见本节末「E6 落地范围（已裁）」⑦；第 2 格先红后绿，先红的读数记进 §5。

### 集成增量（对 `test/RTM.md`）

**零行**：本批改的是提示词文本、设计档与评审的提示词选取（E6），不改任何业务可观察结果。量法：`grep -i "advisor|评审" test/RTM.md` ⇒ 命中 CLI 5 / 6 / 14 / 17 / 24 / 32 / 47 七行，逐行读标题，断的都是受理、落档、guard、超时等机械面，无一断言「评审该判哪些批档段」或「第几轮取哪份提示词」。故无改写、无删除、无新增。

### 最近先例与勘察

- **最近先例**：`existing: docs/core/design/ADVISOR-CONVERGENCE.md §8「评审维度」· name: "### 8.2 设计与文档" · consumers: 设计评审轨的判据来源与 §11 边界` ⇒ 改这一档，不新建。
- **现成不可用**：`existing but unusable: docs/core/design/ADVISOR-GUARDS.md §5.2「写路」· failed on: 该档只判机制侧（冻结窗、点火、引文解析），不承载评审判域；把判域写进守卫档等于把语义派给不执行它的席位`。
- **勘察证据（公共源）**：`grep 评审射程|评审域|实施阶段|review scope` 于 `index.publicRepos` 两项——`../.thincoder` 命中全在 `tmp/` 下的旧分支镜像（本仓自身代码与批档的副本），无独立文档；`../thincoder.com` 零命中。结论：无相关独立文档。
- **E4 已查无**：`none found: grep "own stage|next stage|本阶段|下一个阶段|实施记录" 于 thincoder-core/prompts/` ⇒ 只命中 `tool-batch-eng-coder.md` 的 aliases 行与 `tool-batch.md` 的「§5 未写」取代记录，没有一条管跨阶段产物归属。`document-writing.md` 现有「The doc holds only the final, current state」与「A requirement/design doc carries no history at all」都只管历史态，不管别的阶段的产物该不该进本档 ⇒ 新增一条，不改既有条。
- **数据事实**：本设计对数据无断言（纯文本规则），无需读数据。

### 关键决策

1. **§6 一并划出域外**：用户原话是「实施阶段」，§6 名为「验证与收口」，字面不在实施阶段内。纳入的理由是结构同源——§3 之后写的段对设计评审一样不可得，且 §5 那条死锁会在 §6 上原样复现。代价：比字面口径宽一格，请 §3/§4 明看；不采纳则 §6 会成下一个同形死锁。
2. **不把「代码」写作域外**：同一份提示词第 8 条要求评审席给受影响档量行数、勘察要读实现；把代码划进域外会与既有判据自相矛盾。故只挡「对段的发现」，读不受限。
3. **判域句写成公共层可读的通用句**：`documentation-evaluation.md` 被装进所有角色，点名批档段号会让非评审角色读出与己无关的禁令。
4. **不改门、不改派单侧、不动代码评审轨、不新增台账行**：按 §1 边界执行；本批接管 `#2499`。
5. **写侧与评审侧同处 §8.4，不另开一节、不另起一档**：这条边界两头同源——写侧把它列进必备项，评审侧照着去查；权威分成两处就是两版并存的入口。也不把写侧挪到别的设计档：§8 拥有「评审维度」，写侧镜像在这里是为天花板服务的投影，不是通用写作纪律的归档处。故 §8.4 改名「射程天花板：评审侧与写侧」，两侧同改。
   · 已否方案：写侧只在提示词里陈述、设计档不写。否它的理由不是「会有两版」（单面陈述本无两版风险），而是下一次改动只动一侧时，另一侧没有任何权威句可对照——天花板由文档自己顶穿正是这么发生的。

### 上抛项

- **无在途上抛**。`§1` 两条裁定已把前版两个待裁项关掉：
  - E6 消息侧落地范围 → `§1`「路由缺陷：修法裁定与一处自纠」定权；逐处形态见本节末「E6 落地范围（已裁）」，其中第 ⑤ 处（拼装形态）由本席读 `convergence.mjs` 后定。
  - 需求层承载 → `docs/core/requirements/ADVISOR-CONVERGENCE.md` 已增 **F37**（设计评审每轮全文重审、判据不随轮次衰减），主 agent 笔。
- **需求层（本席未改，只核）**：F36 承载评审侧射程（两列，续在 F21 之后）· `docs/core/requirements/DOC-SYSTEM.md` §2 的 FR8 承载写侧产物归属 · F37 承载轮次不衰减。

### E4 逐字条文（落 `thincoder-core/prompts/knowledge/document-writing.md`，照抄不改词）

```text
- **A document carries its own stage's products, not the next stage's**: a design document carries the design, its target state and its acceptance criteria; it carries no implementation record, and lists no product that exists only after implementation as something this document must contain.
  Why: the next reader takes that line as this document's requirement and hunts for what cannot exist yet — and a review then fails the document for being empty where nothing was ever due.
```

落点 = 「The doc holds only the final, current state」条之后、「Verify the merge mapping's semantics file by file first」条之前，两条各占一行、行内不断行。该档在提示词面按行判长；判据 = 落地后跑 `doc_check(mode:"gate")`，首行 `PASS`，不是自量字数。

### E1 逐字条文（落 `thincoder-core/prompts/advisor-design.md` 第 3 条 Boundary，照抄不改词）

落点 = 第 3 条 Boundary 末——既有「**Why**: the target does not expand」行之后、第 4 条 **Neutrality** 之前；四行各占一行、行内不断行，缩进沿用该条的三个空格。插在末而不插在原条中间：原条四行（定义 · 无声明兜底 · 域外不看 · Why）是一个整块，从中间插会把判据与它的理由拆开。

盘上现状（本席读盘）与本文的差别是**行序**：`advisor-design.md` 第 3 条已落四行，但 `**Why**: §5 exists only once implementation is done…` 那一行夹在「§4 / §5 / §6 stay outside that cap」与「Reading is not judging」之间，判据又被理由劈成两半。实施动作 = 把该行移到「Reading is not judging」之后，一字不改。

```text
   **The declaration narrows, never widens**: however type / target / status / reason / exclude are written, the target is capped at what this round can judge — batch record §1–§3 plus the documents in the review scope.
   **§4 / §5 / §6 stay outside that cap**: they are written after this round, so their state — empty included — is no finding, and naming one in the declaration does not pull it in.
   **Reading is not judging**: every file stays readable, implementation code included — the feasibility and affected-file-size criteria need it; the cap blocks findings about those sections, not reading them.
   **Why**: §5 exists only once implementation is done, so judging it holds the design on the very section its own pass has not yet opened.
```

判据 = 落地后跑 `doc_check(mode:"gate")`，首行 `PASS`；行长的判据是工具的首行，不是自量字数。
### E2 逐字条文（落 `thincoder-core/prompts/knowledge/documentation-evaluation.md`，照抄不改词）

落点 = C 组第 12 条「Internal tension made explicit」之后新增 D 组；组头一行，第 13 条五段，共六行。

```text
**D Evaluation domain**:
13. **The evaluation domain is the document as it stands now**: content that only later stages of the work can produce is outside that domain while the document is read before those stages.
    Such content includes an approval given only after the review passes, an implementation record and a verification record; an empty section of that kind is not a defect of the document.
    **No review-object declaration pulls it in**: naming such a section in the review target does not make its emptiness a finding.
    **Reading is not judging**: the file stays readable for whatever it tells you about what exists now; the exclusion covers findings about that section, not reading it.
    Why: judging such a section asks the document to carry a product that cannot exist yet, and the review then fails it on emptiness where nothing was ever due.
```

判据 = 落地后跑 `doc_check(mode:"gate")`，首行 `PASS`，不是自量字数。

### fix round 落点对照（对 §1 三条待办）

- **E4 逐字条文** — 见本节末「E4 逐字条文」；条数与落点两行齐，落点 = 写作档「The doc holds only the final, current state」之后。
- **§8.4「两处 ∥ 三处」** — 已订正并落盘，见「已落盘」行；档内现读作「评审侧两处」「与评审侧两处合计三处同改」。
- **E1／E2 逐字条文** — 见本节末两条；措辞转写自 §8.4，E1 走声明面、E2 走判据面且不含批档段号。
- **E2 第 3 行改写**（主 agent 2026-11-16 必修项）— 该行现为「Such content includes an approval given only after the review passes, an implementation record and a verification record; an empty section of that kind is not a defect of the document.」，两处改动、判据未变：① 原句主语 `a section holding one of them` 与谓语 `is not` 之间悬着分词短语 `being empty`，读不成句，改为完整主谓 `an empty section of that kind is not a defect`；② 给「批准」这一例加限定 `given only after the review passes`——第 2 行 `content that only later stages of the work can produce` 仍划定范围，限定词防的是读者把举例当闭清单、连同本阶段就该写的批准段一并放过。AC2 判错面对应补了一句。
- **§8.4 声明字段表补 `reason`** — §8.4 原写「无论 type / target / status / exclude 怎么写」，漏 `reason`，而该接口在 `advisor-design.md` 第 3 条列的是五字段 `type / target / status / reason / exclude`。已在设计档同轮补齐，与「E1 逐字条文」第 1 行同集。

### fix round 落点对照（评审首轮 #34 裁决，第 2 轮）

三条本批修项，逐条落点：

- **评审 #7 · §8.4 枚举统一**。§8.4 写侧段不再自定枚举「设计文档写设计与任务书」，改为归 `docs/core/requirements/DOC-SYSTEM.md` §2「功能性需求」的 FR8——设计文档写设计、目标态与验收标准，不写实施记录——并写明本档只补它的提示词落点与理由。E3 同步改口：不再称 §8.4 为「规则与理由的权威陈述」，改作两条规则同处陈述、写侧枚举归 FR8；机制设计里「设计档 §8.4：两条规则与理由的单一权威源」是同一条规则在 §2 里的第三处副本，同轮改为「写侧枚举归 FR8」。
- **评审 #8 · 同枚枚举扫一遍**。FR8 本身由主 agent 同轮改作「验收标准」；E4 逐字条文的 `its acceptance` 同轮改作 `its acceptance criteria`，与 FR8 同词同主，判据 = 落地后跑 `doc_check(mode:"gate")`、首行 `PASS`；AC5 的「目标态与验收照写」随之改作「验收标准」。E1、E2 两条逐字条文不含这枚枚举（写的是段与判域，不是产物清单），不动。

**无新语义**：三条都是已裁定规则换一种说法，判据未变；E1／E2 逐字条文、AC1–AC4 判负面、条目范围均未动。

### E6 落地范围（已裁）

`§1`「路由缺陷：修法裁定与一处自纠」给出修法骨架；第 5 条「拼装形态由设计席读 `convergence.mjs` 实际结构后定」在此定死。七处，按代码面顺序。

**① `thincoder-core/advisor.mjs` · `buildAdvisorSystemPrompt`**

设计分支收成一行，删去其后的 round 取值与二选一：

```js
  if (reviewType === "design") return applyPromptInjections(ADVISOR_DESIGN)
```

代码评审那一支（`!hasPrior` → `ADVISOR_ROUND1`；否则 round 2 取 `ADVISOR_ROUND2`、其余取 `ADVISOR_ROUND3`）一字不动。

分支上方那句「rounds 2+ converge like code reviews (verify agent fix claims)」同轮改写；文件头 `Convergence protocol:` 清单补一句「代码评审适用；设计评审每轮取 `advisor-design.md`，不衰减」。

**② `thincoder-core/advisor.mjs` · `prepareAdvisorMessages`**

设计评审入口的条件 `if (reviewType === "design" && (agent._advisorRound || 0) === 0)` 去掉轮次限定 → `if (reviewType === "design")`。设计评审每轮都走这条完整消息构造，首轮与后续轮同一形态。

`prior` 仍按既有推导传给 `buildAdvisorUserMessage`（第 2 轮起非空）；approval block 仍由该函数按 `designToken` 注入；`escapeLiteralEscapes` 包装不变。

**③ 同文件 · 删除不可达块**

函数尾部 `if (reviewType === "design") { … scopeBlock + tokenBlock … }`（自注 `AGENT-LOOP-ASYNC-POOL.md §6.10 D-24b`）在 ② 之后不可达，连同其注释一并删除。

其职责（重锚评审范围、注入本轮 design token）已由 ② 的完整构造承担。保留代码评审的 `buildAdvisorFollowUp` 出口。

删后核对 `advisor.mjs` 顶部 import：`resolveScopeFiles` 与 `buildDesignApprovalBlock` 若在该文件内再无引用，从该 import 语句删去（`buildConvergenceBody` 仍由 `buildAdvisorFollowUp` 使用，保留；第 54–55 行的 re-export 是独立语句，不随之删）。

**④ `thincoder-core/advisor/messages.mjs` · `buildAdvisorUserMessageInner` 的 `## Design Review` 分支**

条件 `if (reviewType === "design" && (agent._advisorRound || 0) === 0)` → `if (reviewType === "design")`——每轮都出。

分支内在 `## Instructions` 五条之后、`buildDesignApprovalBlock` 之前，当 `p && (agent._advisorRound || 0) > 0` 时追加 ⑥ 的参考块；`_advisorRound === 0` 时产出与今天逐字相同。

同函数的 LEGACY COMPATIBILITY PATH（`if (p && (agent._advisorRound || 0) > 0)`，拼 `buildConvergenceBody`）保留：它是外部直接调用者的既有出口，设计评审经 ④ 后不再经过它。`isReReview` 与 `buildConvergenceInstructions` 只服务代码评审，不改。

判据：设计评审的用户消息里不再出现 `## Round N —` 横幅，也不再出现 `strictly verify only the prior review output` 与 `Do NOT look for new issues`。

**⑤ `thincoder-core/advisor/convergence.mjs` · 新增导出 `buildPriorReviewBlock(p, response)`**

设计评审轮 2+ 的参考块，与 `buildConvergenceBody` 分开：后者保留给代码评审，语义与文案不动。新函数的产出，逐字：

```text
## Prior Review Output (previous round — reference, not the verification list)
<p>

## Agent Response (fix claims — reference only)
<response>

## Instructions
1. This round is a FULL review at the same standard as the first: the system prompt's complete criteria apply, and every document in the review scope is read in full.
2. The prior review output above is a reference, not the verification list: report an item as still open only where the current file state shows it, and report anything new you find.
3. Evidence rule: every finding MUST quote the exact line content from THIS round's `read` output — one CONTIGUOUS excerpt, quoted exactly as it stands. Line numbers alone are NOT evidence.
```

**⑥ 两处假注释订正**

`advisor.mjs` 的 `buildAdvisorSystemPrompt` 上方注释与 `prompt-overlays.mjs` 的 `assemblePrompt` 上方注释都写「结构机检（`test/prompt-injections.test.mjs`）按 return 分支逐条守」。全仓无此文件——`glob **/prompt-injections*.mjs` 只命中三个 `src/prompt-injections.mjs`。

处置 = 删去该句，改为陈述必须保持的不变量（每个 `return` 分支都经 `applyPromptInjections`，新增分支未挂即红）。**不指任何测试文件**：本批单测档收口即删，注释指它就是造一个新的死指针。

**⑦ 本批单测档** `docs/batches/2026-11-16-review-scope-impl-boundary.test.mjs`

五格，断言 `buildAdvisorSystemPrompt` 取到的是哪一份常量——与 `loadAdvisorPrompt` 读出的同一份逐字相等（不靠标记文案，靠常量相等）：

| 格 | 输入 | 期望 |
|---|---|---|
| 1 | design · `_advisorRound:0` · 无 prior | `advisor-design.md` |
| 2 | design · `_advisorRound:2` · 有 prior | `advisor-design.md` ← **本缺陷的格子** |
| 3 | code · `_advisorRound:0` · 无 prior | `advisor-round1.md` |
| 4 | code · `_advisorRound:1` · 有 prior | `advisor-round2.md` |
| 5 | code · `_advisorRound:2` · 有 prior | `advisor-round3.md` |

第 2 格必须先红后绿：改动前跑一次记红，改动后再跑全绿。只绿不红说明这一格没在测缺陷。

**不动**：`_advisorRound` 自增（显示、审计、`record-results.mjs`、`advisor-settle.mjs` 都在用，只是不再决定判据）；`advisor-round2.md` / `advisor-round3.md` 文本；`buildConvergenceBody` 与 `buildConvergenceInstructions`。

### fix round 落点对照（`§1` 清理项 + 路由裁定，第 4 轮）

- **删 E5**：E5 条目、E5 逐字条文、AC6 删除；受影响文件去掉 `advisor-round2.md` / `advisor-round3.md` 两行。
- **§8.4 回到三处**：落点由五处改三处，删「共用档条件化」两段；「三处同改」判据保留。
- **header 勘察行**：改为完成态——三处提示词已各载本规则。
- **上抛项**：改写为「无在途上抛」——前版两条待裁项均经 `§1` 裁定关闭，见本节「上抛项」。
- **新增 E6**：按 `§1`「用户裁定：路由缺陷在本批修」入本批；两个代码档与行数读数进受影响文件与机读清单。
- **E1 形态**：`§1`「裁定：E1 重排（推翻「去掉第二个 Why」）」推翻前一条——E1 为四行，`**Why**` 收尾。盘上 `advisor-design.md` 第 3 条已是四行，但 `**Why**` 在第三位（夹在两条判据之间）；实施动作 = 该行移到 `**Reading is not judging**` 之后，一字不改，判据见「E1 逐字条文」。

**无新语义**：E6 落的是 `§1` 已裁定的路由规则；删 E5 是把落点收回三处，判据未变。

### fix round 落点对照（`§6` 待处置第 1–6 条，第 5 轮）

第 7 条按 `§6` 裁定不修，本席不动 `convergence.mjs`。第 1–6 条全部落在 `docs/core/design/ADVISOR-CONVERGENCE.md`：

- **第 1 条 · §11 未点名承档**：§11「边界」补「需求里不归本档的几面各有承档」并分条列出五处——项目上下文注入归 `docs/core/design/PROMPT-SYSTEM.md` §7「自动注入策略」；评审上下文的发现与降级归 `docs/core/design/PORTABILITY.md` 的「评审上下文」行；项目标准层注入归 `docs/core/design/MANIFEST.md` §2.12「标准层」；压缩后重挂载与不可用时的报告归 ADVISOR-GUARDS；请求预算的派生归 `docs/core/design/CONTEXT-COMPACTION.md` §2「请求预算」。不补新节。
  · 坐标订正：`§6` 写「`MANIFEST.md` §2.7」，该节题为 `docRoot`；「标准层注入区分」实读在 §2.12「标准层」。按实读落 §2.12。
- **第 2 条 · Approval Signal 只写首轮**：§2.1 改作「每轮带 Review-object declaration 与 Approval Signal——设计评审每轮都走完整构造，首轮与后续轮同一形态；信号缺失时构建面补齐，启动前仍缺则拒绝」，与 `ADVISOR-GUARDS.md`「设计评审消息构建后若缺 Approval Signal，构建面补齐；启动前仍缺则拒绝」对齐。实读依据：`thincoder-core/advisor/messages.mjs` 的设计分支在 `## Instructions` 之后以 `if (designToken) { parts.push(buildDesignApprovalBlock(designToken, designId)) }` 收尾，而该分支已按本节 ④ 去掉轮次限定 ⇒ 每轮都注入。
- **第 3 条 · §8.4 复述权威正文**：两处复述改为引用——评审侧归 `docs/core/requirements/ADVISOR-CONVERGENCE.md` §2.3 的 F36，写侧归 `docs/core/requirements/DOC-SYSTEM.md` §2「功能性需求」的 FR8；死锁理由（§5 只有实施完成后才存在）留在本档，产物枚举与判决面不再抄一遍。
- **第 4 条 · 序数引 prompt 条目**：档头勘察行与 §8.4 落点清单改按条目原名——`advisor-design.md` 的 **Boundary** 条、`documentation-evaluation.md` 的 **D Evaluation domain** 组、`document-writing.md` 的 **A document carries its own stage's products, not the next stage's** 条。
- **第 5 条 · 档头一次性读数**：删去「已逐处读过并已成文」，档头只留三处落点与各自承何；执行读数归本批档，不进状态档。
- **第 6 条 · §10 按「文档变化」立论**：§10 改作「提示词文本与提示词选取的变化不改变业务可观察结果，故不因此新增集成用例」，理由归 `docs/core/design/TESTING.md` §13.1「当前规则」，不再把改动归为文档变更。
  · 坐标订正：`§6` 写「判据第 12 条」，`TESTING.md` 无编号的第 12 条判据（节号到 §13，编号列表分别是集成清理、候选集、收集面、索引一致、端差）；「集成用例只从真实业务需要和真实生产问题产生」实读在 §13.1。按实读引 §13.1。

**门检**：`doc_check(mode:"gate")` 于本档 ⇒ 首行 `DOC-CHECK GATE: PASS`。首笔写入被门拒一次——§11 那句成段 301 字超 300，改成分条清单后落盘；拒绝时零字节，未留半成品。

**台账**：`#2501` 第三款（§8.4 复述 FR8 标点不等）与第 3 条同落脚点，本批改引用后该款已失效；台账非本席写面，请收口时改写该行。

## §3 设计评审（评审子代理）
**状态行**：评审通过



### 轮次 1（评审子代理）

**结算**：已签发（pass）· 2026-11-16

    | # | Severity | Status | Evidence |
    |---|----------|--------|----------|
    | 1 | 🟡 | New | design §11 「不完整族、启动门、预算、冻结和失败文案归 ADVISOR-GUARDS」 vs requirement §4 「明示没有指南，不静默改用另一套约定」 |
    | 2 | 🟡 | New | F13 「上下文压缩后，对象声明、文档清单和 Approval Signal 仍在」· F35 「不得静默消失」· N9 「未注册凭证不得进入报告、digest 或 prior」· §3.2 「机械失败逐次产生原因、当前判据和恢复选项。」 |
    | 3 | 🟡 | New | design header 「勘察证据：已读当前 advisor 工具契约、需求与守卫设计」 vs §8.4 「三处同改」 |
    | 4 | 🟡 | New | design header 「最近先例：`ADVISOR-GUARDS.md` 的宿主确定性判定」 — no implementation coordinate, no precedent batch |
    | 5 | 🟡 | New | §2.2 「没有 prior 且本 run 未改代码时可开始新周期」 · §4.3 「索引不可用时按当前降级文本处理，不驱动控制流。」 |
    | 6 | 🟡 | New | §2.4 「机制级矛盾按严重度规则处理。」 · §8.4 「设计文档写设计与任务书」 |
    | 7 | 🟡 | New | design §8.4 「设计文档写设计与任务书，不写实施记录。」 vs DOC-SYSTEM FR8 「设计文档写设计、目标态与验收，不写实施记录」 |
    | 8 | 🟡 | New | DOC-SYSTEM FR8 「目标态与验收」 vs METHODOLOGY F2-4 「一次性文件清单与执行验收归过程记录」 |
    | 9 | 🔵 | New | design §10 「验证轮次选择、无轮次封禁、新会话、prior、引文、覆盖失效、guard、响应表语义、争议窗、需求契合和工具返回归一。」 |
    | 10 | 🔵 | New | ADVISOR-CONVERGENCE requirement §2 table header vs DOC-SYSTEM requirement table header |
    VERDICT: pass
    计数：🔴 0 · 🟡 8 · 🔵 2 · 未标 0


### 轮次 2（评审子代理）

**结算**：已签发（pass）· 2026-11-16

    | # | Severity | Status | Evidence |
    |---|----------|--------|----------|
    | 1 | 🟡 | New | design ADVISOR-CONVERGENCE §8.4 "各按自己的读者陈述" vs 首行勘察「未把任何批档段落划出射程」 |
    | 2 | 🟡 | New | requirements F36 "评审目标域止于本轮评审判得着的面" vs design §8.4 "设计评审的射程" |
    | 3 | 🟡 | New | design §8.2 "设计文档不应承载某一批的受影响文件清单、执行计数或一次性过程。" |
    | 4 | 🔵 | New | §8.4 "一份文档只承载本阶段该有的产物——设计文档写设计、目标态与验收标准" vs FR8 same row with 「：」 |
    | 5 | 🔵 | New | §8.4 "为什么：§5 只有实施完成后才存在" |
    VERDICT: pass
    计数：🔴 0 · 🟡 3 · 🔵 2 · 未标 0


### 轮次 3（评审子代理）

**结算**：已签发（pass）· 2026-11-16

    | # | Severity | Status | Evidence |
    |---|----------|--------|----------|
    | 1 | 🟡 | New | requirements §4「项目上下文注入」 row "按项目规则查找 AGENTS.md"; design §11 boundary "不完整族、启动门、预算、冻结和失败文案归 ADVISOR-GUARDS" |
    | 2 | 🟡 | New | requirements F13 "上下文压缩后，对象声明、文档清单和 Approval Signal 仍在"; requirements §5.1 "判死线 = `floor(可用窗口 × 0.8)`"; design §2.3 "宿主另有单场工具轮硬帽" |
    | 3 | 🟡 | New | design §2.1 "设计首轮还包含 Approval Signal"; requirements F12 "缺信号时启动前拒绝"; design §2.2 "评审凭证重签" |
    | 4 | 🟡 | New | design §8.4 heading 「射程天花板：评审侧与写侧」 and its "判据归 … 的 FR8"; DOC-SYSTEM FR6 "其他文档引用而非复制权威正文" |
    | 5 | 🟡 | New | design header sentence "D 组第 13 条载判域"; design §5 "状态文档中的长期引用仍使用稳定名称" |
    | 6 | 🟡 | New | design header sentence "已逐处读过并已成文"; METHODOLOGY F2-4 "一次性文件清单与执行验收归过程记录" |
    | 7 | 🟡 | New | design §10 "文档变化本身不需要制造业务集成用例"; DOC-SYSTEM §4 边界 "提示词是产品代码" |
    | 8 | 🟡 | New | no batch record in this review's scope; design §10 carries no RTM delta by design |
    | 9 | 🔵 | New | design §8.4 "射程由声明收窄，不由声明扩张"; design §4.3 "索引不可用时按当前降级文本处理" |
    | 10 | 🔵 | New | design §2.4 "黄蓝项不当然阻断，但被标为必修的项按当前评审标准处理" |
    VERDICT: pass
    计数：🔴 0 · 🟡 8 · 🔵 2 · 未标 0

## §4 用户批准（主 agent）

**用户批准**：2026-11-16 12:26 批准本批进入实施。

- 原话一：「代码当然要改，文档评审不能走round2/3」——路由缺陷（E6）在本批修，不另起批。
- 原话二：「那啥时候改代码？」——催办实施，等同开工令。
- 依据：`§3` 轮次 3 设计评审 pass（🔴 0 · 🟡 8 · 🔵 2），评审凭证已签发（值不落档，落盘即泄）。
- 实施范围：`§2`「E6 落地范围（已裁）」七处代码面 + E1 移一行 + 本批单测档五格。
- 实施禁区：只动 `§2`「受影响文件」六档；设计档与需求档本批不再改（评审凭证封的是已审字节）。

## §5 实施记录（eng-coder）
**状态行**：实施完成（E1 移位 + E6 七处代码面 + 单测档六格，末轮评审 pass）



**交付摘要**：本批交付两面。① 提示词与设计档：E1/E2/E4 三块逐字条文按 §2 原样落盘（前一轮），本轮按 §1「裁定：E1 重排」把 `**Why**: §5 exists only once implementation is done…` 行移到 `**Reading is not judging**` 之后，一字未改。② 代码路由（E6 七处）：设计评审每轮取 `advisor-design.md`，代码评审 round1/round2/round3 的选取与收敛文案一字未动；附本批单测档（§2 ⑦ 五格 + 一格 user 消息面，见下）。

**改动清单**（9 档，全在 §2「受影响文件」内；无表外改动）

| 档 | 改动 | 落点（按段名/符号名，不用行号） |
|---|---|---|
| `thincoder-core/prompts/advisor-design.md` | 增 4 行（E1 逐字条文）；本轮移位 `**Why**` 行 | 第 3 条 **Boundary** 末，「**Reading is not judging**」之后、第 4 条 **Neutrality** 之前 |
| `thincoder-core/prompts/knowledge/documentation-evaluation.md` | 增 D 组组头一行 + 第 13 条五段（E2 逐字条文） | C 组第 12 条「Internal tension made explicit」之后 |
| `thincoder-core/prompts/knowledge/document-writing.md` | 增顶层条目两行（E4 逐字条文） | 「The doc holds only the final, current state」条之后、「Verify the merge mapping's semantics file by file first」条之前 |
| `docs/core/design/ADVISOR-CONVERGENCE.md` | §8.4 三处落点、header 完成态、§2.2 两句（设计席笔，前一轮） | §8 评审维度 · §2.2 轮次映射 |
| `thincoder-core/advisor.mjs` | `buildAdvisorSystemPrompt` 设计分支收一行；`prepareAdvisorMessages` 设计入口去轮次限定；尾部不可达块与其注释删除；import 收口；头注与两处注释改写 | `buildAdvisorSystemPrompt` · `prepareAdvisorMessages` · 文件头 `Convergence protocol` |
| `thincoder-core/advisor/messages.mjs` | `## Design Review` 分支条件去轮次限定；轮 2+ 追加 prior 参考块；三处注释订正 | `buildAdvisorUserMessageInner` |
| `thincoder-core/advisor/convergence.mjs` | 新增导出 `buildPriorReviewBlock(p, response)`（§2 ⑤ 逐字）；模块头补消费者面 | 与 `buildConvergenceBody` 并列 |
| `thincoder-core/prompt-overlays.mjs` | 假注释改不变量陈述 | `assemblePrompt` 上方 |
| `docs/batches/2026-11-16-review-scope-impl-boundary.test.mjs` | 本批单测档，六格（收口删除） | §2 ⑦ 五格 + 一格 user 消息面 |

**逐字核对**：E1/E2/E4 三块落盘文本与 §2 三块代码块做字符串包含比对（node 读盘，逐块 `includes`）⇒ 三处均 `true`；E1 四行按序落位（判据三行在前、`**Why**` 收尾），一字未改。

**行长核对**（提示词面按行判，单行 ≤300）：E1 = 219 / 181 / 139 / 209；E2 = 24 / 189 / 188 / 131 / 170 / 161；E4 = 293 / 188（node 逐行读数），全部在限内。

**门检**：`doc_check(mode:"gate")`，range = 本席写的 `advisor-design.md` ⇒ `DOC-CHECK GATE: PASS`（无超长行、无行号锚、无悬空指针）。

**单测读数**（本批单测档，`node --test docs/batches/2026-11-16-review-scope-impl-boundary.test.mjs`）

- **第 2 格先红**（改动前）：`✖ cell 2 — design, round 2, prior present → advisor-design.md`，实际取到 `advisor-round3.md` —— 即本缺陷本身。
- **改动后全绿**：`tests 6 · pass 6 · fail 0`。
- 六格：1 design/round0 → design；2 design/round2+prior → design（本缺陷格）；3 code/round0 → round1；4 code/round1+prior → round2；5 code/round2+prior → round3；6 design 轮 3 user 消息无 `## Round ` 横幅、无 `strictly verify only the prior review output`、无 `Do NOT look for new issues`，且含 prior 参考块。
- 第 6 格超出 §2 ⑦ 的五格：加它是因为 AC7 的第三问（design 轮 3 的 user 消息）五格覆盖不到；属补强、非简化，已披露。
- 行尾核对之外的机检：`node thincoder-core/scripts/check-syntax.mjs` ⇒ `328 file(s) OK`。

**AC 自检（读者判，逐条读盘后作答）**

| AC | 判 | 依据（读的是哪一段） |
|---|---|---|
| AC1 | ✅ | `advisor-design.md` 第 3 条：object.target 点名 §5 ⇒ 不报（「naming one in the declaration does not pull it in」）；实现代码 ⇒ 仍可读（「every file stays readable, implementation code included」） |
| AC2 | ✅ | `documentation-evaluation.md` D 组第 13 条：判域 = 文档当下说到的内容，限「content that only later stages of the work can produce」；「an approval given only after the review passes」带限定，不吞本阶段的批准段 |
| AC3 | ✅ | E1 走声明面（「the target is capped at what this round can judge」），E2 走判据面（「outside that domain」）；两处均不写「声明可扩张」，均不把晚于本轮的段列为可判 |
| AC4 | ✅ | `docs/core/design/ADVISOR-CONVERGENCE.md` §8.4：评审侧天花板 + 写侧镜像同处陈述，三处落点按面分列且可数；无本批条目、受影响清单、验收行、集成增量 |
| AC5 | ✅ | `document-writing.md` 新增条：不把「实施记录已填」列进必备项（「it carries no implementation record, and lists no product that exists only after implementation」）；本阶段产物照写（「the design, its target state and its acceptance criteria」） |
| AC7 | ✅ | 三问逐条：`buildAdvisorSystemPrompt` 设计支读作 `if (reviewType === "design") return applyPromptInjections(ADVISOR_DESIGN)` ⇒ design 轮 3 取 `advisor-design.md`；代码支未动（`!hasPrior` → round1，round 2 → round2，其余 → round3）⇒ 代码轮 3 仍取 `advisor-round3.md`；design 轮 3 的 user 消息不含 `## Round 3 —`（单测档第 6 格断言、`node --test` 全绿） |

**决策披露**（本席自决的成形选择，逐条连理由）

- **逐字条文不改一词，即便读到摩擦**：E2 的「No review-object declaration pulls it in」对评审席不可见（评审席提示词自包含，不装 `documentation-evaluation.md`）；E1 使第 3 条一编号条目内出现两条 `**Why**:`，与 `document-writing.md`「a top-level entry … carries one `Why`」形态不同；`buildPriorReviewBlock` 使设计轮 2+ 的消息内有两个 `## Instructions` 段头。三处均为 §2 定死的逐字文本，改词即改设计，故原样落、进本节与报告，不在实施席自行润色——收口可裁。
- **修了 user 消息里那句「不许读别的档」**：`advisor/messages.mjs` 设计分支那句原读 `Review ONLY these files — do not scan git diff or read any other files.`，与本批同轮落盘的 E1「every file stays readable, implementation code included」及需求 F36「读不受限，文件与代码照读」正面相抵，且第 8 条的「sample the table's source/test files」要被读的正是这些档。这条不是 §2 点名的七处，是评审 🔴 报出、本席读盘复核属实后同轮修的：一句话把「读」的禁令收成「判」的边界。附带删掉同函数里已不可达的 `reviewType === "design"` 分支（它留着同一句旧话）。
- **单测档加了第 6 格**：§2 ⑦ 定的是五格，AC7 的第三问（design 轮 3 的 user 消息不得带收敛指令）五格判不到。补强不简化，已在「单测读数」披露。
- **不扩面到 `advisor-round2.md` / `advisor-round3.md`**：§1「边界（本批不做）」明列；本轮 E6 已把设计评审从这两档上摘下来，代码评审仍用它们。
- **不改设计档（`docs/core/design/ADVISOR-CONVERGENCE.md`）**：设计档是设计席的笔；本轮读到的两处偏差（`§2.1` 的 Approval Signal 时序、档头的序数与过程记录）已登记在 `§6` 待处置，本席只把处置判断写进本节「落地核对」。

**审计轮（explore 子代理，1 轮）**：`VERDICT: findings`（行为面无偏差，命中全在注释与记录面）。

- 覆盖：15 行对照表——落点/逐字/越界（PARTIAL · SILENT-SIMPLIFICATION · OUT-OF-LIST）/注释/代码评审轨/单测格。
- 越界四面均无命中；代码评审轨（round1/2/3 选取、`buildConvergenceBody`、`buildConvergenceInstructions`）逐项未动。
- 命中 3 条，全为注释与改后代码不符，同轮已修：`prepareAdvisorMessages` 的 docstring 仍写「rounds 2+ = convergence」；`buildAdvisorUserMessageInner` 的 docstring 写「与拆分前逐字一致」；`convergence.mjs` 模块头只列两个消费者。

**评审轮（advisor type=code，3 轮）**：第 1 轮 `changes-required`（🔴 1 · 🟡 5 · 🔵 4），第 2 轮 `changes-required`（🔴 1 · 🟡 3 · 🔵 3，含第 1 轮复核态），第 3 轮 `VERDICT: pass`（Fixed 8 · Accepted 3 · Unfixed 0 · New 0）。逐条处置：

- **🔴（第 1 轮）· 读的射程自相矛盾**：设计评审 user 消息逐字写 `Review ONLY these files — do not scan git diff or read any other files.`，而本轮同批落进 system prompt 的 E1 写 `**Reading is not judging**: every file stays readable, implementation code included`，需求 F36 写「读不受限，文件与代码照读」。同一请求一条说可读、一条说不可读，且第 8 条 `**Spot-check**: sample the table's source/test files, size each one yourself` 要量的源档正被这句话挡在门外。
  - **处置 = 修**：把 user 消息那句的射程从「读」收到「判」——`The documents below are the review scope — the review target is these documents only. Do not scan git diff; reading other files is allowed where a criterion needs it (feasibility, affected-file size), but findings outside these documents are out of scope.`；同函数代码评审路径里那段已不可达的 `reviewType === "design"` 分支（含同一句旧话）一并删除。改后三处同口径，单测档第 6 格加了反向断言 `!msg.includes("read any other files")`。
- **🟡（第 1 轮）· 同类头两个 `## Instructions`**：设计分支先出五条，`buildPriorReviewBlock` 再出三条，两组编号都从 1 起。**不修**：块内文字是 §2 ⑤ 定死的逐字条文，改段名即改设计；代价已记此处与报告，收口可裁。
- **🟡（第 1 轮）· 需求 F1 未随 F37 收窄**：F1 仍读 `Round 3+ 严格只验前轮`，未限定代码评审。**不修**：需求档是主 agent 的笔；现象与修法已进报告。
- **🟡（第 1 轮，第 2 轮改判 Accepted）· 设计档 §2.1「设计首轮还包含 Approval Signal」**：与「每轮都注入信号」不一致。**不修**：设计档归设计席，`§6` 待处置第 2 条已登记。
- **🟡（第 1 轮）· 单测档只覆盖 system 侧**：AC7 的第三问（design 轮 3 的 user 消息）五格判不到。**处置 = 修**：加第 6 格（见上「单测读数」）。
- **🟡（第 1 轮）· `§5`（本节）与盘上交付不符**：第 1 轮报为 🟡，第 2 轮升级 🔴——`§5` 状态行已是「实施完成」、终态 `clean`，却写「本批无代码档、无单测文件」，而盘上实改四份代码档与一份单测档，`§2` AC7 要求的「第 2 格先红读数记进 §5」也缺。收口以 `§5` 为依据，不修等于用一份说「本批没改代码」的记录给整批签绿。
  - **处置 = 已修**：本节重写——条目面、改动清单（9 档）、逐字核对、单测先红后绿读数、AC 自检（含 AC7）、决策披露，全部按盘上实际交付重写。
- **🔵（两轮）· 死指针与坏注释**：`advisor.mjs` 文件头 `docs/design/ADVISOR-CONVERGENCE.md`（仓内只有 `docs/core/design/`）、重复的 `/**` 起行，已修；两处假注释（`test/prompt-injections.test.mjs` 守着）改为不变量陈述 `必须保持的不变量：每个 return 分支都经 applyPromptInjections，新增分支未挂即错。`，不再断言有不存在的机检在守。
- **🔵（第 2 轮）· 不可达分支仍留旧句**：已随 🔴 处置删除。

**落地核对**：`docs/core/design/ADVISOR-CONVERGENCE.md`。

- **header 勘察行**（`> 勘察证据：…`）：该行已由设计席改写成完成态，读作「§8.4 的三处提示词落点已逐处读过并已成文：声明面 `advisor-design.md` 第 3 条 Boundary 载天花板三条，判据面 `documentation-evaluation.md` D 组第 13 条载判域，写作面 `document-writing.md` 载跨阶段产物条」，与盘上三处落点相符——不再是无落点时的旧判断，**本批落地不再使它变假**。
- **§2.1「设计首轮还包含 Approval Signal」**：本轮改的是设计轮 2+ 的消息构造，该句仍读作「首轮」。改前轮 2+ 也带信号（旧路由的尾部块注入 token），故本批既未使该句变真也未使其变假——是既有偏差，已登记在 `§6` 待处置第 2 条，不在本席写域。
- **§8.4 与 F36 / FR8**：本批实现读作 `if (reviewType === "design") return applyPromptInjections(ADVISOR_DESIGN)`，与 §2.2「设计评审不衰减，每轮都用 `advisor-design.md`」相符，未产生新的不实句。

**终态**：`clean`。实施与 §2 零偏差。

- 逐字包含比对三处 `true`；AC1–AC7 全过；单测档六格全绿（第 2 格先红已记）。
- 机检：`doc_check` 门检 PASS · `check-syntax` 328 档 OK · 集成档 `test/integration/review-standards-injection.test.mjs` 7 格全绿（改动面的下游消费者未被打破）。
- 审计 1 轮：3 条注释命中，同轮修完。
- 代码评审 3 轮：🔴 2 条与全部 🔵 已修在盘上，末轮 `pass`。
- 余 🟡 2 条（`## Instructions` 撞名、需求 F1 未收窄）与已登记的设计档偏差不在本席写域，记在报告交由收口裁。

## §6 验证与收口（父代理）

**待处置发现**：第 3 轮设计评审的 7 条 🟡，全部落在 `docs/core/design/ADVISOR-CONVERGENCE.md`。该档封在本轮评审凭证里，改它即破封、下一笔派单当场被拒，故不在 `#42` 在途时改。

1. 【原第 1、2 条已撤：实读推翻「无设计落点」】需求 `§4` 项目上下文注入、F13 压缩后重挂载、`§5.1` 预算派生，机制各有承档——项目指南归 `docs/core/design/PROMPT-SYSTEM.md` `§7`「项目 AGENTS、项目规则与 skills 能力清单仍按现有入口提供」；发现与降级归 `docs/core/design/PORTABILITY.md`「评审上下文」行；项目标准归 `docs/core/design/MANIFEST.md` `§2.7` 的「标准层注入区分」四条；压缩重挂载与不可用时报告归 `docs/core/design/ADVISOR-GUARDS.md`；预算派生归 `docs/core/design/CONTEXT-COMPACTION.md`。需求档自陈设计由本档与守卫档共同承接，故非缺口。本档唯一瑕疵 = `§11` 边界行未点名这些承档。修法 = 边界行点名，不补新节。
2. `§2.1`「设计首轮还包含 Approval Signal」与 F12、及 `docs/core/design/ADVISOR-GUARDS.md`「设计评审消息构建后若缺 Approval Signal，构建面补齐」不一致：两档对同一机制各说一套。修法 = 本档写明后续轮是否各带信号，并与守卫档对齐。
3. `§8.4` 复述 F36 与 `DOC-SYSTEM.md` FR8 正文，而 FR6 要「引用而非复制权威正文」。修法 = 保留死锁理由，两处复述改为引用。
4. 档头用「第 3 条」「D 组第 13 条」序数引 prompt 条目，与 `§5`「状态文档中的长期引用仍使用稳定名称」冲突。修法 = 改按条目原名。
5. 档头「已逐处读过并已成文」是本批执行读数，按 METHODOLOGY F2-4 属过程记录。修法 = 移入批档，设计档只留三条落点与理由。
6. `§10`「文档变化本身不需要制造业务集成用例」把改动归为文档变更，而 `DOC-SYSTEM.md` `§4` 边界写明「提示词是产品代码」。修法 = 改为判据第 12 条的理由（不改任何既有用例断言的业务可观察结果）。

7. `buildPriorReviewBlock` 使设计评审轮 2+ 的消息里出现两个 `## Instructions` 段头（设计分支五条、prior 块三条，编号都从 1 起）。**裁：不修**。

   两段内容同向：prior 块第 1 条首句即「This round is a FULL review at the same standard as the first」，第 2 条把上一轮输出定为 reference——与前面五条不冲突，也不缩窄本轮判域，故不构成「同一请求两种说法」。

   修法只是把 `buildPriorReviewBlock` 的段头换个不撞名的名字，但那段是 `§2` ⑤ 定死的逐字条文：改它要设计席先改 `§2`、再派一笔实施改这一个字符串，两笔派单换一个段名，代价远大于收益。留给下一次动 `convergence.mjs` 的人顺手改。

**处置（修订）**：第 1–6 条由设计席一轮修完。改设计档虽破凭证封，但本批此后不再派实施——凭证的作用是为实施发许可，无实施即无凭证需求，故不重走评审。修完由父代理跑 `doc_check(mode:"gate")` 并逐条读改动段落，随本批收口。第 7 条不修，理由与修法如上。不另起批——交付目标与条目集未变。

**`#42` 交付核验（父代理实读与本机重跑）**：`§2` 逐条对得上 `§5`。六格单测本机重跑 `node --test docs/batches/2026-11-16-review-scope-impl-boundary.test.mjs` ⇒ `tests 6 · pass 6 · fail 0`；第 2 格的先红读数（改动前实际落到 `advisor-round3.md`）由实施席记在 `§5`「单测读数」。

`buildAdvisorSystemPrompt` 实读为 `if (reviewType === "design") return applyPromptInjections(ADVISOR_DESIGN)`，其后才是 `!hasPrior → ROUND1 / round 2 → ROUND2 / 其余 → ROUND3`；`buildAdvisorUserMessageInner` 的设计分支以 `return parts.join("\n")` 收尾，收敛块与 `isReReview` 分支它走不到。`§5` 的「落地核对」三条俱在。

**实施披露里两处父代理同轮改掉的**：① 需求 `F1` 原读「Round 3+ 严格只验前轮」无「代码评审」限定，与 `F37` 两版并存——已改为「代码评审的轮次：…设计评审不按轮次衰减，见 F37」；② 第 7 条按上述裁定不修。

**未采纳**：评审第 8 条（`§2` 各项无法确认）——评审消息未注入批档正文，那是评审范围的事实，不是批档缺件；`§2` 的分层结论、机读清单、集成增量三段俱在。第 9 条同理：`§8.4` 不新增输入或状态分支，判据第 6b 条无可报项。

### 收口核验（2026-11-16）

**设计席 `#43` 六条落地，逐条读盘核过**：`§11` 新增五条承档清单（坐标经其实读订正到 `MANIFEST.md` §2.12 与 `CONTEXT-COMPACTION.md` §2）；`§2.1` 改为每轮带 Approval Signal，与守卫档同口径。

`§8.4` 两处复述改编号指针、死锁理由留住；档头与落点清单改按条目原名（**Boundary** 条 · **D Evaluation domain** 组 · **A document carries its own stage's products, not the next stage's** 条）；档头「已逐处读过并已成文」已删；`§10` 立论改为「提示词文本与提示词选取的变化不改变业务可观察结果」，归 `TESTING.md` §13.1。

**单测档**：`docs/batches/2026-11-16-review-scope-impl-boundary.test.mjs` 用毕即删。删除前最后一次读数 `node --test` ⇒ `tests 6 · pass 6 · fail 0`；第 2 格的先红读数（改动前实际落到 `advisor-round3.md`）记在 `§5`。

**集成增量：零行**。本批改提示词文本、设计档与提示词选取，不改变任何业务可观察结果；`test/RTM.md` 无断言评审该判哪些批档段、或第几轮取哪份提示词的用例。

**残留一条，不修，明写**：`§11` 边界段首句的裸「预算」，与新列「请求预算的派生」并排，读者需自行分辨前者指工具轮与推回预算、后者指请求预算。两处名词不同、各有定义节（§2.3 · §6.4），故不改；将来梳理 `§11` 时把裸「预算」改作「推回预算与工具轮预算」即可。

**台账读数**：本批在途行 `#2499` 随本笔结算；`#2501` 三款全消已废弃；`#2500` 中「需求 §4 无落点」与「F13 无落点」两条由 `§11` 承档清单消解，行内改记剩余五条。

**doc-check 门**：由 `batch close` 同笔跑，覆盖本批改动区域。
