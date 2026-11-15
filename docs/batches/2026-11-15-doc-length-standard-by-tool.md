# 2026-11-15 · 文档长段判据改挂工具面
> 六段，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 每段只有一个作者：作者的段可 `append` 加内容、可就地改（`edit`）；非作者一概拒。
> 编制：主 agent · 2026-11-15 · 来源 = 用户 2026-11-15 原话：不再在提示词里用 300 字作为标准，改用 doc_check 作为标准；不说「拆段」，说「一段文字太长，请重新组织语言，用多个短一些的句子表达」。
> 台账 = #2472（core · 归批）。前情 = 无（独立批）。
## §1 讨论（主 agent）
**状态行**：已收口 2026-11-15
批起 sha = 5d3a351306e4f8b89494d9de35f8d9625f5f0406
<§1 模板占位：本批条目 / 关键判据 / 授权口径>

### 一、这批要改的是什么

提示词面把「一段不超过 300 字」当写作标准写给模型。模型据此自己造量长度的工具，量出一堆不该拆的段落，再用插空行、断段去凑数。那不是修可读性，是绕门。

用户的裁定把标准换个挂点：标准从提示词里的数字，改成 `doc_check` 这个工具。处置语言也跟着换：不是「拆段」，是「这段文字太长，重新组织语言，用多个短一些的句子」。

### 二、已定决定

- **已定决定**：提示词面不再以 300 字作为写作标准，改用 `doc_check` 的判定作为标准 · 用户原话：「我们现在的提示词里一直在强调300字的段长，结果模型自己去造量长度的工具，测出来一堆不该拆的，我的想法是不再在提示词里用300字作为标准，而改用doc_check作为标准」 · 时间：2026-11-15 22:29
- **已定决定**：处置表达不用「拆段」，说清是「一段文字太长，请重新组织语言，用多个短一些的句子表达」 · 用户原话：「也不要简单的用拆段表达，要说清楚是一段文字太长，请重新组织语言，用多个短一些的句子表达」 · 时间：2026-11-15 22:29
- **已定决定**：工具说明书（`knowledge/tool-doc-check.md` ∥ `knowledge/tool-batch.md`）保留阈值数字，但同句写明「阈值在工具里，跑工具、别自己算」 · 用户原话：「可以」 · 时间：2026-11-15 22:29
- **已定决定**：台账 `evidence` 的 300（`persona-engineering.md` 的 `Threshold 300 characters`）不动——判的是台账行，不是文档段落，另一个机制 · 用户原话：「可以」 · 时间：2026-11-15 22:29
- **已定决定**：`doc_check` 回执文案不改（属产品面，自带集成用例） · 用户原话：「可以」 · 时间：2026-11-15 22:29

### 三、研究（开批前）

- **库内 = 已查**：`grep "300"`（域 `thincoder-core/prompts`）→ 命中三类：写作标准类（`discipline-engineering.md` 该节）· 工具规格类（`knowledge/tool-doc-check.md` ∥ `knowledge/tool-batch.md`）· 别的机制（函数行数档 ∥ 工具取值与样例串 ∥ 台账 evidence 阈值）。逐处清单与绝对数在 §5 二；本行只记关系
- **库内 = 已查**：`grep "paragraph|human-readable|unreadable|over-long|拆段"`（域 `thincoder-core/prompts`）→ 另有 `discipline-engineering.md` 478–482 的提示词面逐行判段与折行句；`discipline-normal.md` 零命中（normal 模式没有这一节）
- **库内 = 已查**：`grep "300"`（域 `docs/core`）→ 规范档 6 处全是工具规格本身：需求档 F1 ∥ AC-11 ∥ AC-14 ∥ AC-17 ∥ AC-18，设计档 §2 判据表与「阈值 300 是产品常量」句
- **库内 = 已查**：`grep "doc_check|human-readable|paragraph"`（域 `discipline-normal.md`）→ 无匹配，确无第二份写作标准
- **库外 = B 类**：改动面 = 提示词三档（`discipline-engineering.md` ∥ `knowledge/tool-doc-check.md` ∥ `knowledge/tool-batch.md`）；外部断言 = 零

### 四、已核实的两个事实（本轮实读，不是转述）

- 回执真的印数字：`thincoder-core/doc-check/index.mjs` 的 `第 ${h.line} 段 ${h.len} 字，超过 ${PARAGRAPH_MAX}` —— 此前我没读过实现，只读过说明书样例，这轮补上
- 先例在册：`persona-engineering.md` 的 `**Rewrite means reorganize the wording**: folding a line, splitting a paragraph or trimming is not a rewrite` —— 已写明「拆段不算重写」，新规则挂靠它，不另造说法

### 五、边界

- 不动 `PARAGRAPH_MAX` 常量、不动 `paragraphHits` 判法、不动 `doc_check` 回执
- 不动需求档 F1 ∥ AC-11 ∥ AC-14 ∥ AC-17 ∥ AC-18 与设计档 §2——那是工具规格，数字留在原处
- 不动 `CODE-TIER.md` 的函数 300 行档（另一条规则）
- 不给 `discipline-normal.md` 新加一节（normal 模式今天没有这条纪律，属新面，不在本批）

### 六、为什么是「挪挂点」而不是「改数字」

字数只是表征，根本问题是**太长的文字难读**。这是用户在 2026-11-15 反复讲的第 5 条：

> 「doc_check 判的时候也不会跟你说是超过 300 字，因为字数并不是问题的根本，根本问题是太长的文字难于阅读」

推论三条，写规则时要照它落笔：

- 长但结构清晰的（表格行、列表项、代码块、①②③ 枚举）不难读，合法
- 长且要逐字读的散文难读，要改
- 把注意力放在字数上，就已经抓错对象——模型自造量尺正是这么来的

所以新规则的动作对象是**文字本身**，不是字数。写「把这段重写成几个短句」，不写「压到多少字以内」。

### 七、最容易被写错的一处

提示词面（`thincoder-core/prompts/**`）按**行**判段，那里换行就是分段。所以「重新组织句子」在那面表现为「一句或一个分句一行」，不是插空行凑。

两条规则必须分开写，否则模型会把「不许拆段」套到提示词面，那里就没法排版了。反过来也成立：代码档、文档档里换行不产生新段，那里靠插空行不算改。

### 八、判据（设计席须给出可判形式）

- 正侧：提示词面「以 300 字作为写作标准」的句子零命中；新处置句在册
- 反侧：`doc_check` 对一段真的超长散文仍然报——标准换了挂点，判据没被取消
- 反侧二：把一段长散文只插空行、逐字不改，`doc_check` 报零命中但这条仍不合规——设计席须给出能抓住它的判据形式，或在 §2 明说这一条本批不机检、靠人读

最后那条是本批的难点：**工具换挂点之后，「插空行冒充重写」反而更查不出来了。** 设计席要给处置。

### 九、修面裁定（设计轮 · 进评审前）

派设计席 fix 轮，改两处。两处都是「设计面自身不成立」，未进评审即修——评审该判的是「设计对不对」，不是替本席抓错引与不可达的验收线。

**① 🔴 引文漏一个否定词，语义反转（D20）**

§2 第十节引：

`依据 thincoder-core/doc-check/paragraph.mjs「if (excluded[i]) spans.push({ line: i + 1, end: i + 1, len: [...l].length })」`

实文（`paragraph.mjs` 提示词面分支）：

`if (!excluded[i]) spans.push({ line: i + 1, end: i + 1, len: [...l].length })`

漏的是 `!`。带 `!` = 「未排除的行才计入段」，不带 = 「被排除的行才计入」——**语义相反**。而整条「提示词面引用块不对称」的论证正压在这一行上：按错引的版本，提示词面只数被排除的行，结论会完全反过来。

本席核法（本轮实测，非转述）：用 `execute` 直连 node，把 §2 里 7 条 `依据` 逐条与 `paragraph.mjs` 原文比对 —— 6 条成立，1 条不成立，就是这一条。

**② 🔴 AC-1 无法达成**

现文：「剩下的 `300` 都在工具判法描述或回执样例里」。

改完后 `thincoder-core/prompts` 域内剩下的 `300` 有 5 处：`tool-doc-check.md` 三处（判法描述 ∥ 批档豁免判法 ∥ 回执样例）、`tool-batch.md` 一处（判法描述）、`persona-engineering.md` 第 491 行一处——**最后这处是台账 `evidence` 行的阈值，既不是工具判法描述、也不是回执样例**，而 §2 一·「明确不做」已声明这一条不动。

按现文收口，AC-1 必然红，且红在一个本批明令不碰的行上。这是「一条完成的工作也达不到的验收线」。

处置二选一，由你定并在 §2 写死：

- 把第三类「台账 evidence 阈值」写进 AC-1 的分类，标明不动及理由；
- 或把 AC-1 的域收窄到「文档段落写作标准」，台账阈值点名排除。

**边界**：只改 §2 的两处（第十节引文 ∥ 第七节 AC-1）。设计档 D21 本轮不动；三档提示词、单测档、`thincoder-core/doc-check/**` 一律不碰。

**本轮不做**：不发起评审（材料齐了由本席发）；不补提示词面 D 族清单（已立 `#2474`）；不动引用块不对称的代码（已立 `#2473`）。

### 十、评审 #3 裁定（主 agent · 逐条）

评审判 `changes-required`：🔴 1 · 🟡 6 · 🔵 4。十一条全部成立，无驳回。另加一条本席自查（用户指出），合计十二条，本轮一次改净。

| # | 严重度 | 裁定 | 改法 |
|---|---|---|---|
| 1 | 🔴 | 接受 | D21 的「只插空行、只换行不改字」标出**文档面**；同节并列写出提示词面自己的判词，两面各归各的判者 |
| 2 | 🟡 | 接受 | §2 七 增一条 AC：整节读一遍，点明必须已不在的句子（四① 的两处删除 ∥ 旧「one past 300 characters」措辞） |
| 3 | 🟡 | 接受 | §2 增最近先例行：先例坐标 + 对齐 ∥ 偏离及其理由 |
| 4 | 🟡 | 接受 | §2 增调研证据行：查了哪些公开源、各自有无相关 |
| 5 | 🟡 | 接受 | §2 九 点名 RTM 节与用例标题，零增量才可复核 |
| 6 | 🟡 | 接受 | 四① 的「五行」与实际七行对齐（D3） |
| 7 | 🟡 | 接受 | D21 点名取判定的工具面；写明无批档绑定的 `gate` 印裸 `PASS`、什么都没判 |
| 8 | 🔵 | 接受 | AC-4 写出执行命令与目标档 |
| 9 | 🔵 | 接受 | 新单测档补三问答案（`existing:` ∥ `none found:`） |
| 10 | 🔵 | 接受 | 冒充形态引一条观察证据；无观察则明写「仅由用例 2 的盲区支撑」 |
| 11 | 🔵 | 接受 | 需求层锚点点名，或写明本规则唯一落点在设计层 |
| 12 | 🔴 | 本席自查 | 见下节；`决策 5` 的措辞作废 |

**第 12 条（用户指出，本席原文有错）**

本席在进度汇报里写「规则的家在状态档，提示词只承载操作性句子」。这句话对提示词面是错的：提示词是模型唯一读到的规则文本，它必须自足，不能靠读者去别处找权威。

本席核过 §2 四① 的实际落文：三档提示词拿到的是完整英文原句（判据句 ∥ 长而合法清单 ∥ 重写句），没有一处指向设计档。**错的是 `决策 5` 这个标题措辞**，不是实施任务。

改法与边界：

- `决策 5` 改成「提示词面自足承载规则；设计档另记理由与后果」——规则在两面都成立，设计档多出来的是 why，不是权威位置。
- 提示词面三档的落文**逐字不动**（已自足，无可改）。
- D21 与提示词不是主从关系：D21 写两面各自的判词，提示词写自己那一面的操作性句子。

- **已定决定**：提示词面自足承载规则，不设指向设计档的引用 · 用户原话：「你开啥玩笑？！提示词怎么能用指针！」 · 时间：2026-11-15（该轮未取时钟；位置在评审 #3 交付之前）

**本轮边界**：只改 §2（记录面）与 `docs/core/design/DOC-DISCIPLINE.md` D21（含节标题里的面域标注）。三档提示词、单测档、`thincoder-core/doc-check/**`、需求档一律不碰。

**本轮不做**：不发起评审（由本席发）；不补提示词面 D 族清单（已立 `#2474`）；不动引用块不对称的代码（已立 `#2473`）。

**回报格式**：按条号 1–12 逐条报「号 → 改了什么 · 档路径 · 逐字落文」，一条一行；没改的条目写明为什么没改。正文改动一律给出改后的整句原文，供本席逐字比对，不接受转述。

### 十一、实施轮上抛的待裁项 · 本席裁定

**上抛项**（`#6` eng-coder）：`thincoder-core/prompts/discipline-engineering.md` 该节第 481 行没有面别限定。

那行写「A paragraph that cleared a hit with not one word changed is still non-compliant; …」。

同节第 484 行写「a line break where a sentence or a clause ends is layout there, not a way around the gate」。

提示词面按行判段，句读处断行正是「命中消掉、一个字没改」。两行对同一动作给出相反判词。

**本席裁定：成立。** 这是评审轮次 2 第 1 条（🔴）的同一缺陷的另一份副本。

那一条修的是 D21 里两份判词并列，而 §2 四① 交给提示词的逐字文本没跟着改。缺陷因此随实施落到模型真正读到的那一节。

`#6` 判它是改设计、拒绝自改，判断正确——实施未越界。

**派设计席 fix 轮，范围只有一处**：§2 四① 第三组那条子行加面别限定（文档面），并按需补一行写提示词面的对应判词。约束：

- 不加数字，句子自足，英文，与同节其余各行同体例。
- 不得与 §2 四① 既有的提示词面那行相矛盾——两句必须能同时成立。
- 与 D21 现行两面判词同义，不得引入第三套说法。
- 只动 §2 四①；三档提示词由随后的 eng-coder fix 轮落文，设计席不碰。

**由此产生的两笔**：① 设计席落 §2 后，派 eng-coder fix 轮把改后的行应用到 `discipline-engineering.md`，同一 designToken，链未终态。

② §1 三 的「6 处 3 档」与 §5 的「12 处 9 档」是两个取法：前者只数写作标准类，后者数全部 `300`。本席把 §1 三 的读数改成关系表述，数字留在 §5。

**读数时差已裁**：本席复跑 `grep "300"`（域 `thincoder-core/prompts`）→ 12 行 9 档，与 §5 二 一致。§1 三 原文的「6 处 3 档」是少计，它还列了 7 个行号。以 §5 为准。

## §2 批次任务与设计（eng-designer）
**状态行**：设计完成

<§2 模板占位：本批条目（覆盖） / 设计档落点 / 机制设计 / 受影响文件与测试覆盖 / 验收对照 / 关键决策 / 上抛项>

<§2 模板占位：机读清单 = 标题行「**受影响文件（机读清单）**」+ 围栏内三列表（表头 | 档 | 分拆方案 | 行数 |、分隔行 |---|---|---|、一行一档，只列代码档（源 ∥ 单测））；示例行 = | thincoder-core/agent-tools/batch-tier-gate.mjs | — | <该档在批起快照上的内容行数> |>

<§2 模板占位：第二列两件事——越设计时线的档写处置（分拆方案，或写明不拆的理由）；越过收口线的档写正向形方案（点名带目录段的档 + 本批落步 `实施轮` ∥ `§5`）；两条线都不越写 —。第三列：该档在批起快照上的内容行数（量法 = `countContentLines`），快照里没有这一档写 `新`>

### 一、本批条目（覆盖）

| # | 条目 | 来源 | 处置 |
|---|---|---|---|
| 1 | 提示词面不再以「一段不超过 300 字」作写作标准，标准改挂 `doc_check` 判定 | §1 决定 1 | 覆盖：`discipline-engineering.md` 该节改写 |
| 2 | 处置语言 = 「一段文字太长，请重新组织语言，用多个短一些的句子表达」 | §1 决定 2 | 覆盖：同节新处置句 |
| 3 | 两份工具说明书保留阈值数字，同句写「阈值在工具里，跑工具、别自己算」 | §1 决定 3 | 覆盖：两档各补一句 |
| 4 | 「只插空行冒充重写」要有处置 | §1 八·反侧二 | 覆盖：判为不合规，判定交人读（本批不机检） |
| 5 | 规则要说出「长而合法」长什么样，否则表格与枚举会被当太长改掉 | 用户本轮补充材料 + 主 agent 要求 | 覆盖：设计档 D21 与提示词同列清单 |
| 6 | 规则活过本批，须住状态档 | 本席判断（D2 ∥ D17） | 覆盖：`docs/core/design/DOC-DISCIPLINE.md` 新增 D21（本席已落盘） |
| 7 | 提示词面自足承载规则，不设指向设计档的引用 | §1 十·第 12 条 | 覆盖：三档拿完整原句，设计档只记 why 与两面判词（决策 5） |
| 8 | 冒充形态按面分开写：文档面不合规、提示词面断行合法 | 评审 #1（🔴） | 覆盖：D21 两面各一段，各归各的判者 |

**明确不做**：台账 evidence 的 300（决定 4）· `doc_check` 回执文案（决定 5）· `PARAGRAPH_MAX` ∥ `paragraphHits`（边界 1） · 需求档 F1 ∥ AC-11 ∥ AC-14 ∥ AC-17 ∥ AC-18 与 `docs/core/design/DOC-CHECK.md` §2（边界 2） · `CODE-TIER.md` 的函数 300 行（边界 3） · 给 `discipline-normal.md` 加节（边界 4）。

### 二、设计档落点

规则落两处，同批同拍：提示词三档（操作性句子，自足，不指向别处）与 `docs/core/design/DOC-DISCIPLINE.md` §1「D21 文字太长，标准挂在工具面」（要什么 · 为什么 · 两面各自的判词）。

D21 写五块，末尾写 `为什么`：要求（标准挂工具面）· 取判定跑诊断面 · 长而合法的形态清单 · 要重写的只有一种 · 两面各自的冒充判词与人读读者（文档面交评审与收口人，提示词面交写那一面的人与评审）。

判据与阈值仍住 `docs/core/design/DOC-CHECK.md`，那一档一字不动；D21 只写「哪些形态长也合法」，不自带一套数法。

需求层锚点 = `docs/core/requirements/DOC-CHECK.md` 的 F1「**一段文字太长要报**」：它管判据在不在、报不报，不管写作标准挂在哪。

反过来也一样：本规则不新增需求点，判据没被取消由 AC-4 单列——两边各管一边，本批不动需求档。

所以本规则的唯一落点在设计层与提示词面：设计层 = `docs/core/design/DOC-DISCIPLINE.md` 的 D21（要什么 · 为什么 · 两面各自的判词），提示词面 = 三档提示词自己的操作性句子。

### 三、机制设计

**规则的四个面，缺一不可**：

1. **标准挂点**：什么算「太长」由 `doc_check` 判定，阈值住在工具里；模型不再自带量尺（D15：一把尺子量一种读数）。
2. **处置对象是文字本身**：命中意味着「这段文字太长读不动」，动作是重组——拆成几个短句、把可枚举的转成列表或表格、删掉不承载东西的句子。
3. **长而合法的形态要正面写出**：只写禁止面，模型不会知道手上那条长表其实合规，于是又去改不该改的（用户原话：「测出来一堆不该拆的」）。
4. **冒充形态点明**：只插空行、只换行不改字，不是重写；文档面插空行只是把命中藏起来。

**长而合法的形态（依据 = 判据面代码，逐条实读）**：

```text
依据 thincoder-core/doc-check/paragraph.mjs「export const isTableRow = (l) => /^\s*\|.*\|\s*$/.test(String(l))」
依据 thincoder-core/doc-check/paragraph.mjs「export const isListItem = (l) => /^\s*(?:[-*+]|\d+[.)、]|[·•])\s/.test(String(l)) || /^\s*[①-⑳]/.test(String(l))」
依据 thincoder-core/doc-check/paragraph.mjs「export function fenceMark(l) {」
依据 thincoder-core/doc-check/paragraph.mjs「if (inList) excluded[i] = true」
依据 thincoder-core/doc-check/paragraph.mjs「if (excluded[i] || headingMark(l) || l.trim() === "" || isQuoteLine(l)) { flush(); return }」
```

- 表格行整行不判；无首尾竖线的表头由分隔行确认，表体延续到第一个无竖线的非空行
- 列表项与其懒惰续行；空行后接非列表行则列表结束
- 围栏代码块（三反引号 ∥ 三波浪号）与缩进代码块
- 标题行；引用块（文档面断段且不判）
- 唯一要重写的是「长且要逐字读的散文」

**两个面必须分开写（§1 七）**：

- 文档面：空行真的断段 ⇒ 插空行能消命中而不改一个字 ⇒ 需要第 4 条把冒充判为不合规。
- 提示词面：按行判段、换行是版式 ⇒ 在句读处断行、一个字不改，那里**合法**，判它是写那一面的人与评审；把文档面那条照搬过去，提示词面就没法排版。

**冒充形态的合规判定 = 人读，不在本批机检**：工具只看长度、不看词，判不出「改没改字」。

本批不为此新增机检：§1 五·边界 1 禁止动 `doc_check` 判法，且「字没改」没有稳定判据，造一个只读长度的新判据只会给假绿灯。

读者 = 设计评审（§3）与收口人（§6）：读被改动的那一段，问「词有没有被重组，还是只被重新断开」。§6 须写明这一条非机检。

**观察证据**：本席本轮没有复现过「插空行冒充重写」的现场。唯一来源是本批 §1 一的记录——「模型据此自己造量长度的工具，量出一堆不该拆的段落，再用插空行、断段去凑数」，那是主 agent 按用户陈述落笔，不是实测。

所以这一条的证据只到用例 2 的盲区：同一串字只插空行 ⇒ `doc_check` 零命中。**仅由用例 2 的盲区支撑**，合规判定交人读，本批没有更硬的观察可引。

### 四、实施任务（eng-coder 逐档逐句）

**① `thincoder-core/prompts/discipline-engineering.md`「### Docs must be human-readable」节**：删掉以 `**A whole section/table/rule compressed into one over-long block makes it unreadable**` 开头的一行，删掉以 `**Check**: verify per the project's own doc conventions` 开头的一行；改成下面八行，插在 `Docs are read by humans` 那行之前——

```text
**The standard is the tool, not a number**: what counts as too long is `doc_check`'s verdict, and the threshold behind it lives inside the tool — run the tool, never measure a paragraph by hand.
  A hand-made ruler measures something nobody agreed on, and the measuring itself is work the tool exists to do.
**Long and well-structured is not too long — do not touch it**: a fence or an indented code block, a table row, a list item and its lazy continuation, a heading, and a quote block are read as structure, not as a wall of prose.
  A verbatim quotation stays whole: never re-break it, and on the prompt face put a long one inside a fence, the same way an example goes there.
**The one form to rewrite is prose read word by word** — one chain of sentences a reader cannot finish: reorganize it into several shorter sentences, turn what it enumerates into a list or a table, delete what carries nothing.
  Inserting blank lines, or breaking a line, is not that reorganization — the same word chain re-broken still reads as one long sentence, and on the doc face a blank line only hides the hit from the gate.
  On the doc face a paragraph that cleared a hit with not one word changed is still non-compliant; the one who judges that is the reviewer and the closeout seat, reading the changed paragraph, not the tool's verdict.
  On the prompt face a line broken where a sentence or a clause ends is layout, not a way around the gate; the one who judges it is whoever writes that face and the reviewer, asking whether the line can be read in one go, not whether a blank line went in.
```

并把该节提示词面小节的第二行原文 `so the gate measures every line on its own and one past 300 characters is a hit however short the block around it is.` 改成——

```text
  so the gate measures every line on its own, and a line break where a sentence or a clause ends is layout there, not a way around the gate.
```

该节其余各行（含 `Why: the gate refuses the byte…` 与中文 D15 那一条）一字不动。

该块第三组的最后两行是两面各一条判词，两句同时成立：文档面一行（命中消掉、一个字没改仍不合规，读者 = 评审与收口人）、提示词面一行（句读处断行是版式，读者 = 写那一面的人与评审）。落文时两句都落，不得据其中一句删另一句。

**② `thincoder-core/prompts/knowledge/tool-doc-check.md`**：在「A paragraph too long」条的末句 `300 is a constant: no project setting changes it, and changing it is a code change.` 之后同句接上——

```text
— the number sits in the tool, so run `doc_check` for the verdict instead of measuring a paragraph yourself.
```

该档其余各行不动（`300` 在判法描述与回执样例里保留）。

**③ `thincoder-core/prompts/knowledge/tool-batch.md`**：在「It judges the same three things `doc_check` judges — … and nothing else.」这一行末尾接上一句——

```text
The number lives in the tool: run the check, do not measure a paragraph by hand.
```

**④ 单测档 `docs/batches/2026-11-15-doc-length-standard-by-tool.test.mjs`（新建，收口即删）**：两条用例，断言工具行为，不读提示词原文。

- 用例 1（判据没被取消）：临时目录带最小 `PROJECT-MANIFEST.json`，一份含 400 字连续散文段的 `.md` ⇒ `report` 面报出该段一条命中
- 用例 2（工具的盲区，也是「人读」的理由）：同一串字之间只插空行、一个字不改 ⇒ 零命中。这条记录事实，不是合规断言

**最近先例三问**（建这一档之前问过）：

- `existing:` `docs/batches` 下三份批档同名单测档（`2026-11-11-designer-tier-rule.test.mjs` ∥ `2026-11-11-review-pass-signs-itself.test.mjs` ∥ `2026-11-12-ledger-query-default-limit.test.mjs`）· name: `<批档名>.test.mjs` · consumers: 实施者跑一次，收口删除，集成侧不消费
- `none found:` 没有一份现成单测直接判 `runDocCheck` 的段判据（查过 `docs/batches/*.test.mjs` 全量三档，判的都是别的机制；`test/integration/batch-close-gate.test.mjs` 判段行为，但那是集成档，不是本批该建的形）

**⑤ 不许做**：不新建机检判据；不改 `thincoder-core/doc-check/**`；不把提示词原句写进单测断言（断言挂行为，不挂文字）。

### 五、受影响文件（机读清单）

```text
| 档 | 分拆方案 | 行数 |
|---|---|---|
| docs/batches/2026-11-15-doc-length-standard-by-tool.test.mjs | — | 新 |
```

### 六、受影响文件与档位结论

| 档 | 改 | 说明 | 批起行数 |
|---|---|---|---|
| `thincoder-core/prompts/discipline-engineering.md` | 改 | 写作标准节改写；`.md` 不计行数档 | — |
| `thincoder-core/prompts/knowledge/tool-doc-check.md` | 改 | 补「跑工具、别自己算」一句 | — |
| `thincoder-core/prompts/knowledge/tool-batch.md` | 改 | 同上 | — |
| `docs/core/design/DOC-DISCIPLINE.md` | 改 | 新增 D21、节标题改 D1–D21（本席已落盘） | — |
| `docs/batches/2026-11-15-doc-length-standard-by-tool.test.mjs` | 新 | 单测两条，收口删除 | 新 |

**档位结论**：本批不改源码档，判据面与工具面零 diff ⇒ 无 500 行设计时线、无 800 行收口线问题；唯一代码档是新建单测，收口即删，不累积。

### 七、验收对照

| AC | 判据（读活面） | 判法 ∥ 读者 |
|---|---|---|
| AC-1 | 提示词面不再有「以字数作段落写作标准」的句子（写作纪律面；`discipline-normal.md` 没有这一节，不在域内）。判法 = 域内每处 `300` 回答一个问题「这个数字是不是在告诉写作者一段可以多长」：答「是」的只剩工具规格——`doc_check` 的判法描述与回执样例，且陈述阈值的那两条（`knowledge/tool-doc-check.md` 的「A paragraph too long」条 ∥ `knowledge/tool-batch.md` 的判据行）同句带「跑工具、别自己算」；答「否」的两类本批不动——台账 `evidence` 行阈值（`persona-engineering.md` 的 `Threshold 300 characters`，判的是台账行）与别的机制的数字（函数行数档判代码档、`30000` ∥ `localhost:3000` ∥ 字符上限是工具取值与样例串） | 内置 `grep`（域 `thincoder-core/prompts`，串 `300`）逐处人读归类，并读那两条确认处置句在册；读数进 §5 |
| AC-2 | 处置句在册：一段文字太长 ⇒ 重新组织语言，用多个短一些的句子；该节不出现「拆段」形处置 | 读该节；读者 = 设计评审 |
| AC-3 | 长而合法的清单在册：表格 ∥ 列表及续行 ∥ 代码块 ∥ 标题 ∥ 引用块 | 读该节与 D21；读者 = 设计评审。写法不合规时，模型无据可依 |
| AC-4 | 判据没被取消：一段真的超长散文仍被 `doc_check` 报 | 命令 = `node --test docs/batches/2026-11-15-doc-length-standard-by-tool.test.mjs`；目标档 = 该单测档用例 1（临时夹具 `PROJECT-MANIFEST.json` + 400 字散文 `.md`），断言 `report` 面出一条命中；绿即过 |
| AC-5 | 「只插空行不改字」在文档面写明不合规，判定读者被点名 | 读该节与 D21；读者 = 设计评审 ∥ 收口人。**本批不机检**（证据只到用例 2 的盲区） |
| AC-6 | 本批改动的 `.md` 过交付门 | `doc_check` `gate` 面首行 `PASS`（有批档绑定，取本批变更区；无绑定时的裸 `PASS` 不算数） |
| AC-7 | 该节改后整节读一遍，三样必须已不在：① 以 `**A whole section/table/rule compressed into one over-long block makes it unreadable**` 开头的那一行；② 以 `**Check**: verify per the project's own doc conventions` 开头的那一行；③ `one past 300 characters` 这串措辞。且新八行与改写后的提示词面那一行在册 | 内置 `grep`（域 `thincoder-core/prompts/discipline-engineering.md`，三串各一次 ⇒ 零命中）＋读该节；读者 = 设计评审 ∥ 收口人；读数进 §5 |

### 八、关键决策

- **决策 1：挪挂点，不删判据**。用户裁定「字数不是问题的根本，太长的文字难读」⇒ 判据留着（工具照报），写作标准换到工具面。AC-1 与 AC-4 必须同时成立，缺一则只是把判据砍了。
- **决策 2：长而合法的形态正面写、与「散文要重写」并列**。只写禁止面，模型会把表格和枚举也当太长去改——这正是用户抱怨的那一堆「不该拆的」。清单的依据是判据面代码的谓词，不是我读后的转述。
- **决策 3：冒充形态交人读，不新造机检**。长度面上「词变了」与「词没变」不可分，造一个新判据只会给假绿灯（模型自造量尺正是这类假判据的产物）；备选 = 单测比对改动前后词序，否决：单测随批删除，管不住日常写作。
- **决策 4：保住提示词面「句读处断行」的合法出路**。该面按行判段、换行是版式（`docs/core/design/DOC-CHECK.md`「提示词面每行自成一界」）；照搬文档面那条，那面没法排版。
- **决策 5：提示词面自足承载规则；设计档另记理由与后果**。提示词是模型唯一读到的规则文本，必须自足：三档拿到的是完整英文原句（判据句 ∥ 长而合法清单 ∥ 重写句），没有一处指向设计档。D21 多出来的是 why 与两面各自的判词，不是权威位置——两面不是主从关系。

**最近先例**（对齐 ∥ 偏离及理由）：`thincoder-core/prompts/persona-engineering.md` 的「**Rewrite means reorganize the wording**: folding a line, splitting a paragraph or trimming is not a rewrite」。

对齐：拆段 ∥ 折行 ∥ 删字都不算重写，处置说的是重组语言——本规则沿用这条，不另造说法。

偏离一处：那条只说「哪些动作不算重写」，不说「什么时候该改写」。取值因此搬到 `doc_check` 的 `report` 面。偏离的能力面理由 = 先例句里没有取值对象，照它写不出「何时该改」，而手造量尺正是本批要停的行为。

**调研证据**：查了两个公开源（`PROJECT-MANIFEST.json` 的 `index.publicRepos`）。`../.thincoder` —— 命中只在 `tmp/` 的历史副本与 `checklist-done.md`，是旧形态快照、不是权威面 ⇒ 无相关。

`../thincoder.com` —— 只有 `www/changelog.html` 一行提到 `doc_check` 工具上线，不涉写作标准 ⇒ 无相关。结论：本规则没有可对齐的外部先例，先例只在仓内。

### 九、集成 delta（对 `test/RTM.md`）

**zero rows**。理由两条：

- 本批不改业务可观测结果：`doc_check` 判法 ∥ 回执 ∥ `PARAGRAPH_MAX` 零改动，改的是三档提示词文本与一档设计纪律。
- 相关故事 = `test/RTM.md` 的 `CLI 7`「收口只判本批改过的档」（guard 册）；段长相关用例逐条读过，全在 `test/integration/batch-close-gate.test.mjs`。

逐例：`CLI 7-5 围栏与缩进代码块不入段判据：收口放行，普通正文对照照拒` ∥ `CLI 7-13 列表块与表格块整体免段长、普通正文对照照拒` ∥ `CLI 7-21 同一份批档上写 350 字正文段` ∥ `CLI 7-22 同一份设计档：report 判整份` ∥ `CLI 7-25 区外 400 字放行 ∥ 区内含变更行、整段超 300 拒`。

这五例里的提示词档是**自建夹具**（该集成档自己写 `thincoder-core/prompts/code.md` ∥ `list.md` 的内容），不读本仓真实提示词 ⇒ 无改写、无删除、无新增。

所以本批 RTM 增量 = 零行；零行可复核，因为它点名了节与用例，不是一句「没影响」。

### 十、上抛项与未决

**[上抛·裁] 提示词面对引用块的不对称（本批不处置，请主 agent 立行）**

文档面的收集行把 `isQuoteLine` 一起过滤掉——`if (excluded[i] || headingMark(l) || l.trim() === "" || isQuoteLine(l)) { flush(); return }`；提示词面分支只跳过 `excluded[i]`，而 `structuralExclusionLines` 不标记引用块行：

```text
依据 thincoder-core/doc-check/paragraph.mjs「if (!excluded[i]) spans.push({ line: i + 1, end: i + 1, len: [...l].length })」
依据 thincoder-core/doc-check/paragraph.mjs「export const isQuoteLine = (l) => /^\s*>/.test(String(l))」
```

复现：在 `thincoder-core/prompts/` 下任一 `.md` 里写一行 `> ` 起头、超过 300 字的逐字引文 ⇒ 提示词面报段长命中。

我的判读：这是漏，不是有意。谓词注释自己写「引文整块不计入段（逐字连续、不可折）」，而逐字引文在任何面上都不许折行——按长度判它，唯一的修法是改动引文，违反 D20。

本批不动它：§1 五·边界 1 明令不动 `paragraphHits` 判法。规则文本我按「长引文进围栏块」处置（D16 同一路数），不承诺提示词面豁免引文。

**[上抛·知会] 编号族漂移（lead）**：提示词面 `discipline-engineering.md` 列 D1–D17，设计档列到 D21。本批只改自己的落点；是否补齐提示词面，交主 agent 决定。

**[上抛·知会] 非机检项**：AC-5 靠人读，交付时不会有绿灯；读者已点名，§6 须读一次再写结论。

## §3 设计评审（评审子代理）
**状态行**：评审通过



### 轮次 1（评审子代理）

**结算**：未签发（no-valid-echo）· 2026-11-15

    | # | Severity | Status | Evidence |
    |---|----------|--------|----------|
    | 1 | 🔴 | New | D21「**只插空行、只换行不改字，不算重写**」 vs §2 三「在句读处断行、一个字不改，那里**合法**」 |
    | 2 | 🟡 | New | AC-1…AC-6 vs §2 四①「删掉以 `**A whole section/table/rule compressed into one over-long block makes it unreadable**` 开头的一行」 |
    | 3 | 🟡 | New | §2 八 关键决策 — no precedent line; nearest precedent quoted only outside §2 (`Rewrite means reorganize the wording`) |
    | 4 | 🟡 | New | §2 — no survey-evidence line (research sits in §1 三) |
    | 5 | 🟡 | New | §2 九「**zero rows**。理由两条：」 / 「（`batch-close-gate.test.mjs`）」 — no RTM section, no case title |
    | 6 | 🟡 | New | §2 四①「改成下面五行，插在 `Docs are read by humans` 那行之前」 vs seven fenced lines |
    | 7 | 🟡 | New | D21「跑工具取判定，不自己量。」 — tool face unnamed; `gate` with no batch bound prints bare `PASS` |
    | 8 | 🔵 | New | §2 七 AC-4「单测用例 1 绿」 — no invocation |
    | 9 | 🔵 | New | §2 五「| docs/batches/2026-11-15-doc-length-standard-by-tool.test.mjs | — | 新 |」 |
    | 10 | 🔵 | New | §2 四④ 用例 2「同一串字之间只插空行、一个字不改 ⇒ 零命中」 |
    | 11 | 🔵 | New | §2 二「需求层不动：F1 要的是「一段太长要报」，与「写作标准挂在哪」是两件事」 |
    本轮未回显有效 token（评审回执不完整）
    计数：🔴 1 · 🟡 6 · 🔵 4 · 未标 0


### 轮次 2（评审子代理）

**结算**：已签发（pass）· 2026-11-15

    | # | Severity | Status | Evidence |
    |---|----------|--------|----------|
    | 1 | 🔴 | Fixed | D21「**提示词面：句读处断行是合法排版，不是冒充**」 |
    | 2 | 🟡 | Fixed | §2 七 AC-7「三样必须已不在」 |
    | 3 | 🟡 | Fixed | §2 八「**最近先例**（对齐 ∥ 偏离及理由）」 |
    | 4 | 🟡 | Fixed | §2 八「**调研证据**」 |
    | 5 | 🟡 | Fixed | §2 九「相关故事 = `test/RTM.md` 的 `CLI 7`」 |
    | 6 | 🟡 | Fixed | §2 四①「改成下面七行」 |
    | 7 | 🟡 | Fixed | D21「**取判定跑诊断面**」 |
    | 8 | 🔵 | Fixed | §2 七 AC-4「命令 = `node --test docs/batches/2026-11-15-doc-length-standard-by-tool.test.mjs`」 |
    | 9 | 🔵 | Fixed | §2 四④「**最近先例三问**（建这一档之前问过）」 |
    | 10 | 🔵 | Fixed | §2 三「**仅由用例 2 的盲区支撑**」 |
    | 11 | 🔵 | Fixed | §2 二「需求层锚点 = `docs/core/requirements/DOC-CHECK.md` 的 F1「**一段文字太长要报**」」 |
    | 12 | 🔴 | Fixed | §2 八「**决策 5：提示词面自足承载规则；设计档另记理由与后果**」 |
    | N | 🔵 | New | D21 依据 quoting `thincoder-core/agent-tools/doc-check.mjs`「没有绑定 ⇒ 没有「本批」可指」 (a `//` comment) |
    VERDICT: pass
    计数：🔴 2 · 🟡 6 · 🔵 5 · 未标 0

### 轮次 3（评审子代理）

| # | Severity | Status | Evidence |
|---|----------|--------|----------|
| 1 | 🟡 | New | 「A paragraph that cleared a hit with not one word changed is still non-compliant」 vs 「a line break where a sentence or a clause ends is layout there, not a way around the gate」 |
| 2 | 🟡 | New | §5 实施记录（eng-coder）— no content line before §6; AC-1 ∥ AC-7 「读数进 §5」 |
| 3 | 🔵 | New | batch-unit-test-gate.mjs「this batch's own unit test file(s) still on disk」 |
VERDICT: pass
计数：🔴 0 · 🟡 2 · 🔵 1

### 轮次 4（评审子代理）

| # | Severity | Status | Evidence |
|---|----------|--------|----------|
| 1 | 🟡 | New | `tool-doc-check.md`「A paragraph too long」— "changing it is a code change. — the number sits in the tool, so run `doc_check` for the verdict instead of measuring a paragraph yourself."（§2 四② 写「同句接上」，落文是句号 + 悬空破折号） |
| 2 | 🟡 | New | §5 一「删两行、插七行、换一行（见下）」 vs §2 四①「改成下面八行」与盘上八行 |
| 3 | 🟡 | New | §5 五「**[上抛·待裁] 提示词面「冒充」判词缺面别限定（评审轮 3 · #1，🟡 非必改）**」 vs 盘上「On the doc face a paragraph that cleared a hit with not one word changed is still non-compliant」已带面别 |
| 4 | 🔵 | New | `discipline-engineering.md`「On the prompt face a line broken where a sentence or a clause ends is layout」 vs「`- **The prompt face is judged line by line**`」同句重述 |
| 5 | 🔵 | New | `discipline-engineering.md`「Inserting blank lines, or breaking a line, is not that reorganization」无面别限定，与同节「Break those lines where a sentence or a clause ends, change not one word」并读 |
VERDICT: pass
计数：🔴 0 · 🟡 3 · 🔵 2 · 未标 0

## §4 用户批准（主 agent）

**批准依据 = 用户对本批的批次级放行（原话「那自动跑完吧」），不是一次单独的「开始实施」回合。**

- **授权范围**：本批自设计、评审、修面到实施、验收、收口一次跑完；只在两种情形停下回报——出现修不动的 🔴，或实施必须偏离已批准的设计。
- **批准时点**：落在设计评审第二轮通过（§3 轮次 2，`VERDICT: pass`）之后。此前用户已答三条边界的「可以」、以「开批」给出起点确认，四条已定决定记在 §1 二。
- **本批不含**（均在批准时已声明）：需求档不动（§2 二）；`paragraphHits` 判法不动（§1 五·边界 1）；提示词面对引用块的判段不对称、提示词面 D 族编号漂移只立行不修（`#2473` ∥ `#2474`）。
- **两条规则同时成立，互不覆盖**：提示词面自足承载规则（不设指向设计档的引用，§1 二第 5 条）；设计档 D21 记 why 与两面各自的判词，不主张对提示词面的权威位置（§2 八 决策 5）。

## §5 实施记录（eng-coder）
**状态行**：实施完成



### 一、交付摘要

四档全部落盘，逐档依据 = §2 四①–④。本席未改任何档位清单之外的档。

| 档 | 改 | 落文 |
|---|---|---|
| `thincoder-core/prompts/discipline-engineering.md` | 改 | 「### Docs must be human-readable」：删两行、插八行、换一行（见下；八行 = 修面轮后的最终态，见本节七） |
| `thincoder-core/prompts/knowledge/tool-doc-check.md` | 改 | 「A paragraph too long」条末句后同句接上处置句 |
| `thincoder-core/prompts/knowledge/tool-batch.md` | 改 | 判据行末同句接上处置句 |
| `docs/batches/2026-11-15-doc-length-standard-by-tool.test.mjs` | 新 | 两条用例；读数已入本节，跑毕即删（收口不留可执行档） |

`discipline-engineering.md` 该节的四处改动：

- **删**：以 `**A whole section/table/rule compressed into one over-long block makes it unreadable**` 开头的那一行
- **删**：以 `**Check**: verify per the project's own doc conventions` 开头的那一行
- **插**：§2 四① 的八行（首轮落七行，修面轮拆出提示词面一行后为八行），插在 `Docs are read by humans` 那行之前
- **换**：提示词面小节第二行 → `so the gate measures every line on its own, and a line break where a sentence or a clause ends is layout there, not a way around the gate.`

该节其余各行（含 `Why: the gate refuses the byte…` 与中文 D15 那一条）一字未动。

两档 `knowledge/` 的处置句逐字：

- `tool-doc-check.md`：「…and changing it is a code change. — the number sits in the tool, so run `doc_check` for the verdict instead of measuring a paragraph yourself.」
- `tool-batch.md`：「…a dangling pointer — and nothing else. The number lives in the tool: run the check, do not measure a paragraph by hand.」

### 二、验收读数（本轮跑出来的，一条一命令）

- **AC-4**：`node --test docs/batches/2026-11-15-doc-length-standard-by-tool.test.mjs` → `pass 2 · fail 0`。
  用例 1 = 530 字连续散文段（夹具自带 `> 400` 断言），`report` 面 `REFUSED`，一条段命中 `line=3 · len=530`。
  用例 2 = 同一串字按词边界插空行切成 `197 ∥ 200 ∥ 131` 三片、一个字不改 ⇒ `PASS`、零段命中。
- **AC-6**：`doc_check` `mode=gate`（`target` = 仓根，`docs` = 本批三档 `.md`）→ 首行 `DOC-CHECK GATE: PASS`。
  **不是裸 PASS**：同参数复算得基线 sha `5d3a3513…`、判域 3 档全在 `checkFiles`、变更区 `8 ∥ 1 ∥ 1` 行、命中 0、未判 0。
- **AC-7**：`grep`（域 `thincoder-core/prompts/discipline-engineering.md`）三串 → 零命中：`A whole section/table/rule compressed` ∥ `verify per the project's own doc conventions` ∥ `one past 300 characters`。
- **AC-1**：`grep`（域 `thincoder-core/prompts`，串 `300`）→ 12 处 9 档，逐处回答「这个数字是不是在告诉写作者一段可以多长」：
  - 答「是」的 **0 处**——`discipline-engineering.md` 零命中（改前 3 处，见 §1 三）
  - 归工具规格 **4 处**：`tool-doc-check.md` 的「A paragraph too long」条（带处置句）∥ 它「A batch record, whole」条（判法描述）∥ 它回执样例的 `超过 300`；`tool-batch.md` 的判据行（带处置句）
  - 归别的机制 **8 处**，本批不动：`advisor-design.md` ∥ `normal-coding-workflow.md` ∥ `persona-eng-designer.md` 的函数行数档；`persona-engineering.md` 的台账行阈值（§1 决定 4）；`tool-browser.md` 的 `30000` ∥ `localhost:3000`；`tool-wait-for.md` 的默认值；`tool-read-history.md` 的字符上限
- **AC-2 ∥ AC-3 ∥ AC-5**：非机检项，读者 = 设计评审（§3 轮次 3）与收口人（§6 须读一次再写结论）。
  AC-5 的证据面 = 用例 2 的盲区：同一串字只插空行 ⇒ `doc_check` 零命中，工具只看长度不看词，判不出「改没改字」。
- **工具有没有假绿**：本轮另做一次反向探针——同一串 530 字散文，包进围栏块 ⇒ `PASS` 零命中；逐字成段 ⇒ `REFUSED` 一条。
  同一个输入面两种判词，说明用例 1 的断言不是恒红。

**读数时差（lead）**：§1 三记的是 6 处 3 档，本节是 12 处 9 档。域相同、档数多出，两读数的取法不同源；本席未复查哪个准，交父代理判是否要回填 §1。

### 三、决策披露（一条目一行）

| # | §2 一 条目 | 状态 | 披露 |
|---|---|---|---|
| 1 | 写作标准改挂 `doc_check` | ✅ Done | 该节首行即 `The standard is the tool, not a number`，旧的两行字数标准已删 |
| 2 | 处置语言 = 重组语言、多个短句 | ✅ Done | `reorganize it into several shorter sentences, turn what it enumerates into a list or a table, delete what carries nothing`；该节无「拆段」形处置 |
| 3 | 两份工具说明书保留阈值 + 处置句 | ✅ Done | 两档各一句，逐字见上 |
| 4 | 「只插空行冒充重写」要有处置 | ✅ Done | 判为不合规，判定读者点名 = 评审与收口人；本批不机检（AC-5） |
| 5 | 「长而合法」的形态要正面写出 | ✅ Done | 八行里的第二组：围栏块 ∥ 缩进码块 ∥ 表格行 ∥ 列表项与懒惰续行 ∥ 标题 ∥ 引用块 |
| 6 | 规则活过本批，住状态档 | ✅ Done（非本席笔） | `docs/core/design/DOC-DISCIPLINE.md` D21 已由 eng-designer 落盘，本席一字未动 |
| 7 | 提示词面自足承载规则 | ✅ Done | 三档拿到的都是完整原句，没有一处指向设计档 |
| 8 | 冒充形态按面分开写 | ✅ Done | 文档面：空行只把命中藏起来，仍不合规；提示词面：句读处断行是版式，合法 |

### 四、自查与评审轮次

- **内部冒烟自查（explore · 只读）**：1 轮。判 `VERDICT: diverged (1 · 🔵)`——单测夹具的自述与代码不符：注释写「≈148 字」而实为 131，写「400 字以上」而实为 397。
- **修面（1 轮，已收敛）**：夹具改成同一句重复四遍（530 字），两处自述改成不带手数、能自证的说法，用例 1 补 `> 400` 断言。复跑仍 `pass 2 · fail 0`。
- **独立评审（advisor · code）**：1 轮，落 §3 轮次 3，`VERDICT: pass`，计数 `🔴 0 · 🟡 2 · 🔵 1`。
  两条 🟡 都不是必改项：一条是设计文本面的措辞（见五），一条是本节当时还空着（本节即其处置）。
- **终态**：`clean`（自查 1 轮 + 修面 1 轮 + 评审 1 轮，无未收敛项）。

### 五、上抛与未决

**[已裁定·本次落文] 提示词面「冒充」判词缺面别限定（评审轮 3 · #1 → §1 十一 裁定成立 → 落文见本节七）**

该节的第三条判词写「A paragraph that cleared a hit with not one word changed is still non-compliant…」，没有面别限定。

而同节的提示词面小节写「a line break where a sentence or a clause ends is layout there, not a way around the gate」，还要人「Break those lines where a sentence or a clause ends, change not one word」。

提示词面按行判段，那句断行**正是**「命中消掉、一个字没改」。同一节里两句对同一个动作给出相反判词，而模型读到的只有提示词。

我的判读：该句是 §2 四① 的逐字原文，改它 = 改设计，本席不改。

建议由设计席给这句加「文档面」限定，或把「限定在文档面」写进 §2 四①；D21 已有面别分段，提示词面这一句是唯一还缺口径的地方。

**[上抛·知会] 非机检项**：AC-2 ∥ AC-3 ∥ AC-5 没有绿灯；读者已点名，§6 须读一次再写结论。

**[上抛·知会] 台账**：本席未新立行。评审 #1 属设计文本面，是否立行交父代理。

### 六、落地核对

**落地核对：无**——本批落文与 `docs/core/design/DOC-DISCIPLINE.md` D21 的每句仍成立：两面各一段、长而合法清单、标准挂工具面、诊断面取判定，没有一句被本次落地写反。

### 七、修面轮（§1 十一 裁定 → 本次落文）

**起因**：§1 十一 裁定成立「§2 四① 交给提示词的逐字文本没跟着设计面改」——评审轮次 2 第 1 条修的是 D21 里两面判词并列，提示词那一面仍是单条无面别限定。本席按 §1 十一 派单范围落文，只动该节那条判词。

**落文（一处，拆一行为两行）**：原第「A paragraph that cleared a hit with not one word changed is still non-compliant; …」一行，改后为两行，逐字与 §2 四① 现文一致：

- 文档面：`  On the doc face a paragraph that cleared a hit with not one word changed is still non-compliant; the one who judges that is the reviewer and the closeout seat, reading the changed paragraph, not the tool's verdict.`
- 提示词面：`  On the prompt face a line broken where a sentence or a clause ends is layout, not a way around the gate; the one who judges it is whoever writes that face and the reviewer, asking whether the line can be read in one go, not whether a blank line went in.`

两句同时成立，未据一句删另一句（§2 四① 末段的要求）。该节其余各行、以及另外两档 `knowledge/` 一字未动。

**§2 副本与盘上现文的一处差**：本席 spawn 时拿到的 §2 四① 副本写 `a line break where a sentence or a clause ends is layout`，盘上 §2 现文写 `a line broken where a sentence or a clause ends is layout`。按「读盘上记录为准」落成 `broken`；两处指同一判词，措辞差一词，请 §6 判是否需要对齐。

**验收读数（本轮实跑，一条一命令）**

- **逐字核对**：`node` 脚本取 §2 四① 围栏块八行与盘上该节八行比对 → 八行全同；提示词面替换行与 §2 现文全同。
- **AC-6**：`doc_check` `mode=gate`（`target` = 仓根，`docs` = 本批三档 `.md`）→ 首行 `DOC-CHECK GATE: PASS`。判据不空跑：`git diff --stat` 对批起 sha `5d3a3513…` → 三档均有差异行，变更区非空。
- **AC-7**：三串在 `thincoder-core/prompts/discipline-engineering.md` 零命中：`A whole section/table/rule compressed` ∥ `verify per the project's own doc conventions` ∥ `one past 300 characters`。
- **AC-4（判据没被取消）**：单测夹具按 §5 二 已随上轮删，本轮改用 `paragraphHits` 直跑判据，同一个 581 字散文段：逐字成段 ⇒ 一条命中 `{"line":1,"len":581}`；提示词面单行 ⇒ 一条命中；句读处断行 ⇒ 零命中。判据面行为未变。
- **AC-5 的盲区复现**：同一 581 字按分句插入空行（字一个未改，四片 78 ∥ 192 ∥ 192 ∥ 113 字）⇒ `paragraphHits` 零命中。工具只看长度、不看词，这条仍只能人读。

**轮次与终态**

- 内部分歧自查（explore · 只读）：1 轮，`VERDICT: clean`（PARTIAL 0 · SILENT-SIMPLIFICATION 0 · DOC-DRIFT 0 · OUT-OF-LIST 0）。
- 独立评审（advisor · code）：1 轮，落 §3 轮次 4，`VERDICT: pass`，计数 `🔴 0 · 🟡 3 · 🔵 2`。
  三条 🟡 / 两条 🔵 全非必改：两条 🟡 是本段（§5 一 的七行 → 八行、§5 五 的待裁已落文），本节已改；另一条 🟡 与两条 🔵 落在设计文本面（`tool-doc-check.md` 处置句「句号 + 悬空破折号」；新插入行与既有提示词面条的近重复；`Inserting blank lines, or breaking a line…` 半句缺面别），本席按逐字落文不动，交父代理裁定。
- **终态**：`clean`（实施轮 1 + 修面轮 1 + 自查/评审各 1 轮，无未收敛项）。

**落地核对：无**——D21 两面判词、长而合法清单、标准挂工具面、诊断面取判定，没有一句被本次落文写反。

## §6 验证与收口（父代理）

**状态行**：已收口 2026-11-15

### 一、本席独立跑的读数（不采用 §5 转述）

| 项 | 命令 ∥ 判法 | 读数 |
|---|---|---|
| 旧措辞零残留（AC-7） | 内置 `grep`，域 `thincoder-core/prompts/discipline-engineering.md`，四串 | 无匹配 |
| 写作标准类清零（AC-1 首句） | 内置 `grep`，域 `thincoder-core/prompts`，串 `300` | 12 行 9 档，`discipline-engineering.md` 零命中 |
| 文档闸 | `doc_check` `mode=report`，四档（`DOC-DISCIPLINE.md` ∥ `discipline-engineering.md` ∥ `tool-doc-check.md` ∥ `tool-batch.md`） | `DOC-CHECK GATE: PASS`，整档判 |

`report` 面判整档，不是裸 `PASS`。本批没有可绑定的变更区（批档不入判域），所以不用 `gate` 面的裸 `PASS` 冒充通过。

### 二、非机检三项（AC-2 ∥ AC-3 ∥ AC-5）——本席实读 `discipline-engineering.md` 473–492

- **AC-2 处置语言**：479 行给出三个处置——重组为多个短句、枚举转列表或表格、删去不承载内容的。全节无「拆成几段」式处置。**成立**。
- **AC-3 长而合法清单**：477–478 行，六类形态齐全（围栏块 ∥ 缩进码块 ∥ 表格行 ∥ 列表项与懒惰续行 ∥ 标题 ∥ 引用块），与判据面排除同源。**成立**。
- **AC-5 冒充形态**：工具判不出（同一串字插空行 ⇒ 零命中），本批无绿灯，读者点名在 481 行。**判词成立，非机检是设计已披露的事实**。

### 三、两面判词是否互斥

481 行判文档面「命中消掉而一个字未改仍不合规」，482 行判提示词面「句读处断行是版式、不是绕门」，各点各的判者。与 D21 两面判词同义。**评审轮次 3 第 1 条到此闭合**。

**一处近重复，本席裁为保留**：482 与 485 都含「…is layout, not a way around the gate」。删掉 482 那半句会让该组只剩文档面判词，违反提示词面必须自足的要求。记录在案，不作缺陷。

### 四、落地核对

`§5 六` 与 `§5 七` 均记「落地核对：无」。本席复核 D21 四句（两面判词 ∥ 长而合法清单 ∥ 标准挂工具面 ∥ 诊断面取判定）无一被写反。**接受**。

### 五、验收对照（§2 七 AC-1…AC-7）

| AC | 结论 | 依据 |
|---|---|---|
| AC-1 | 成立 | 见一：写作标准类 0 处 |
| AC-2 | 成立 | 见二 |
| AC-3 | 成立 | 见二 |
| AC-4 | 读数为真，命令不可复跑 | `pass 2 · fail 0` 见 §5 二；夹具按协议收口即删，`§5 七` 改直跑判据函数复核 |
| AC-5 | 成立（非机检） | 见二 |
| AC-6 | 成立 | 见一：文档闸 |
| AC-7 | 成立 | 见一：零残留 |

### 六、新债与未决

**本批新债 3 条**：`#2473`（提示词面对引用块判段不对称）∥ `#2474`（提示词面 D 族清单停在 D1–D17）∥ `#2475`（D21 依据引的是代码注释）。三条都不在本批写域，已立行。

**另立 1 条**：`#2476`——`tool-doc-check.md` 处置句落成「…is a code change. — the number sits in the tool…」，句号后接悬空破折号。属措辞瑕，不改语义；本批不再开轮，归入该行。

**AC-4 的命令形态**并入 `#2476`：`§2 七` 写成一条可跑命令，而夹具收口即删，两相抵触。下一批动该节时改成「跑后删除」。

### 七、收口

本批交付四档：`docs/core/design/DOC-DISCIPLINE.md`（D21）· `thincoder-core/prompts/discipline-engineering.md` · `knowledge/tool-doc-check.md` · `knowledge/tool-batch.md`。单测夹具已删，零留存。

台账 `#2472` 随本批结算。文档闸 `PASS`。**收口。**

