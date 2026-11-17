# 2026-11-12 · prompt-line-width
> 六段，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 每段只有一个作者：作者的段可 `append` 加内容、可就地改（`edit`）；非作者一概拒。
> 编制：主 agent · 2026-11-12 · 来源 = 用户 2026-11-12 21:45「提示词同步一下」——上文刚查明：设计档的 `>` 引用行与围栏块不判段长，提示词面却逐行原样量。
> 台账 = #2373（core · 归批）。前情 = 无（独立批）。
## §1 讨论（主 agent）
**状态行**：已收口 2026-11-12
批起 sha = a86b9a19dfd9f0eeb1fccdc76981e46dd06bef9c
<§1 模板占位：本批条目 / 关键判据 / 授权口径>

**现场（本会话实读）**：`thincoder-core/doc-check/paragraph.mjs` 里两支判法不同——设计档遇标题 ∥ 列表 ∥ 引用 ∥ 表格 ∥ 围栏一并 `flush(); return`（不计入段），提示词面 `if (promptFace)` 直接 `split("\n")` 逐行原样量 `[...l].length`，没有任何结构豁免。

**后果**：`#2370` 的实施席照设计档围栏块落盘，`doc_check(mode:"gate")` 首行 `REFUSED`，四行 455 ∥ 359 ∥ 359 ∥ 394 码点；按断行重排才过。**同一句话在设计档里是引用行、不判，落进提示词面就是 455 码点。**

**要做的事**：提示词里现在一个字没写这条落盘约束。补上——写提示词的人（设计席写围栏块、实施席落盘）要知道「提示词面每行自成一界、逐行 ≤300，断行在句或分句边界、词句不改」。一句话，不要展开成体系；判据本体在 `docs/core/design/DOC-CHECK.md` §2，提示词里只需让人知道有这条、别照抄设计档排版。

**用户原话**：「提示词同步一下。」（2026-11-12 21:45）

**库内 = 已查**：

- `thincoder-core/prompts/` 全目录扫 `每行` ∥ `行宽` ∥ `自成一界` → 命中 0：这条落盘约束在该面一处没有。
- 同目录扫 `300` → 6 行命中（`advisor-design.md` ∥ `discipline-engineering.md` 两处 ∥ `discipline-normal.md` ∥ `persona-eng-designer.md` ∥ `persona-engineering.md`），都是零散阈值提法，没有一处自述「逐行判」这件事。
- `docs/core/design/DOC-CHECK.md` §2 有原文：「**提示词面**（`thincoder-core/prompts/`）每行自成一界——那里的换行排的是版式，不是分段。」

**库外 = B 类**：改动面 = 提示词档与设计档；外部断言 = 零。

## §2 批次任务与设计（eng-designer）
**状态行**：设计完成（设计落 §6.103（提示词面每行自成一界）· 落点 = discipline-engineering 既有节内增列 · 修正轮七条全处置（1🔴 5🟡 1🔵））

<§2 模板占位：本批条目（覆盖） / 设计档落点 / 机制设计 / 受影响文件与测试覆盖 / 验收对照 / 关键决策 / 上抛项>

<§2 模板占位：机读清单 = 标题行「**受影响文件（机读清单）**」+ 围栏内三列表（表头 | 档 | 分拆方案 | 行数 |、分隔行 |---|---|---|、一行一档，只列代码档（源 ∥ 单测））；第二列：越设计时线的档写正向形方案（点名带目录段的档 + 本批落步 `实施轮` ∥ `§5`），未越线写 —；第三列：该档在批起快照上的内容行数（量法 = `countContentLines`），快照里没有这一档写 `新`；示例行 = | thincoder-core/agent-tools/batch-tier-gate.mjs | — | 新 |>

### 条目（覆盖 · 每条回指设计 §6.103）

| # | 条目 | 判据 |
|---|---|---|
| E1 | 提示词面写上「每行自成一界、逐行判 300 码点」这条落盘约束 | 设计 §6.103 A1 |
| E2 | 同一条给出断行怎么断：句 ∥ 分句边界断、词一个不改、不抄设计档围栏块版式 | 设计 §6.103 A2 |
| E3 | 落点是既有节内增列（零 `##` 连带）；句子自持，不写规范档指针 | 设计 §6.103 A3 |
| E4 | 落盘文本按该面行宽可判、词句不改 | 设计 §6.103 A4 |

**不在本批**：判据本体零笔（`docs/core/design/DOC-CHECK.md` §2 ∥ `thincoder-core/doc-check/paragraph.mjs`）· 两席人格档不加第二份 · 300 不放宽 · 普通模式提示词零笔 · 设计 §6.102 的断行规则零改。

### 设计档落点

`docs/core/design/PROMPT-SYSTEM.md` §6.103（机制 + 逐字英文块 + 对照表 + 用例表 + 验收 + 决策 + 边界 + RTM delta），同档 §8.2 落点表加一行（正文单源 = `DOC-CHECK.md` §2 判据本体 ∥ 本档 §6.103 提示词面这一句 → `discipline-engineering.md` 的 `### Docs must be human-readable` 节内）。

### 机制设计

一句话三条（判据「每行自成一界、逐行判」+ 断行怎么断 + why），落 `thincoder-core/prompts/discipline-engineering.md` 的 `### Docs must be human-readable` 节内，`**Check**:` 那一行之后、`- **Chinese strings …` 那一条之前。逐字英文见设计 §6.103 的围栏块（实施席照词句落笔，断行自定）。

为什么落这一档：工程模式两席（设计席 ∥ 实施席）的装配面都含该纪律档，一句话覆盖两处；落到两席人格档就是同一句的两个副本（D2）。为什么不落 `common.md`：普通模式也装配，那会把工程模式-only 的落盘约束放到两模式面。

### 受影响文件

| 档 | 改动 |
|---|---|
| `thincoder-core/prompts/discipline-engineering.md` | 该节内增列一条（词句 = 设计围栏块；断行由实施席定，落成几行是读数） |
| `docs/core/design/PROMPT-SYSTEM.md` | 新增 §6.103；§8.2 落点表加一行 |

**受影响文件（机读清单）**

```text
| 档 | 分拆方案 | 行数 |
|---|---|---|
```

空表 = 本批零代码档（两档皆 `.md`，无源档、无单测档）。

**分层结论 = 无档跨分层**：两档均 `.md`，按设计 §6.1「提示词档免档位判定（`.md` 结构尺度）」不适用；无代码档 ⇒ 第三列零行。

### 读数（本席实算 · 尺标在量法列；读数不进设计档）

| 读数 | 值 | 量法 |
|---|---|---|
| 围栏块三行行宽（码点 · 词句不改） | 231 ∥ 219 ∥ 144 | `[...line].length` |
| `discipline-engineering.md` 改前 `##` ∥ `###` | 13 ∥ 7 | node 行扫描（`^## ` ∥ `^### `） |
| 探针 `每行` ∥ `行宽` ∥ `自成一界` 改前 | 0 命中 | 内置 `grep`，域 = `thincoder-core/prompts/` |
| 探针 `300` 改前（校对 §1 的勘察） | 6 行命中 | 内置 `grep`，同上域 |

### 测试覆盖

零单元测试档（纯文本改动、无分支）。机判 = `doc_check(mode:"gate")`（实施席交付前跑，判域 = 本批变更区）+ 判据逐条读。

**§9 integration delta = zero rows**：本批不改任何业务可观察结果，无行可破、无可增。同题眼那一行 = `CLI 7`「收口只判本批改过的档」，它断言 `batch close` ∥ `gate` 的判域，本批零触判定代码——面不同才是理由，见设计 §6.103 集成分节。

### 验收对照

E1–E4 ↔ 设计 §6.103 的 A1–A4，每条都带红侧：A1 的红侧 = 改前跑「可重跑的扫」归不出「这一面按行判、断在哪」的那一行，改后归得出新增这一条 · A2 三条断行串改前 0（该面没有这条）· A3 的 `##`/`###` 计数改前 = 改后，且新增行内 `.md` 档名 ∥ `§` 带号 ∥ 无档名指路句各 0 · A4 `**Check**:` 之后新增各行每行 ≤300、按序拼回与围栏块词句逐字相等（落成几行只作读数）。

### 关键决策

见设计 §6.103 的 K1–K4：落纪律档不落人格档 · 一句不展开 · 句子自持不写指针 · 与「一段 300 字」并置同节。

### 上抛项

- [上抛·知会] §1 的库内勘察记「扫 `300` → 命中 0」，本席实读该面提到 300 的句子在盘（逐行归面见下修正轮读数），只是讲的都是别的题面；`每行` ∥ `行宽` ∥ `自成一界` 确为 0。结论不变：这一面没有一条交代该怎么断行。§1 归主 agent，本席不改，登记见设计 §6.103 上抛项。

### 修正轮（评审 §3 · 1🔴 5🟡 1🔵 · 七条全收）

设计档 = `docs/core/design/PROMPT-SYSTEM.md`（逐条 → 改了哪一句）：

| # | 处置 | 改了哪一句 |
|---|---|---|
| 1 🔴 | 「现象」改结论句 + 补「可重跑的扫」 | 原句（`没有一处写…` + `读数住批档 §2`）换为 `**现象**：这一面提到 300 的几处讲的都是别的事——代码里函数与档的体量（…）、文档里的一段（…）、清账时的过长行（…）。` 与 `这些句子没有一处说这一面按行判，也没有一处告诉写的人该在哪断行。`，其后增 `**可重跑的扫**：…逐行归面——改前归不出「这一面按行判、断在哪」的那一行，改后归得出新增这一条。`；自证式探针（`The prompt face is judged line by line` 改前 0 命中）整句删，A1 的红侧换成同一式扫；「上抛项」三条并一条，读数与未点名的 5 处一并去掉 |
| 2 🟡 | 补勘察证据行 | 依据块之后增 `**勘察证据行（本席本轮实读）**`：插入点上一行逐字 ∥ `该节现文没有一条说这一面按行判` ∥ `公共源勘察`（两声明仓 + 四枚探针 + `已查，无相关`）∥ `数据事实` |
| 3 🟡 | §8.2 与 §6.103 对齐 | §8.2 的「正文单源」由 `docs/core/design/PROMPT-SYSTEM.md` §6.103 改为 `docs/core/design/DOC-CHECK.md` §2（判据本体）· 本档 §6.103（提示词面这一句的来源，不持判据） |
| 4 🟡 | 关键决策表去「被否」列（对齐 F7-2） | 表头 `# / 决策 / 理由 / 被否` 换为 `# / 决策与理由`，K1–K4 各合成一句；被否候选移本段下表 |
| 5 🟡 | 补一问：首行括注算不算面级指路句 | 对照表增 `§6.6` 一行：不算——它不把人送去别处读规则，只说这条规则判哪几档，属 §6.6 判保留面的路径操作数族，故保留；A3 探针由 `DOC-CHECK` ∥ `§` 扩为 `.md` 档名 ∥ `§` 带号 ∥ 无档名指路句三者各 0 |
| 6 🟡 | A4 ∥ C1 不再钉「三行」 | A4 改为「`**Check**:` 那一行**之后新增的各行**每行 ≤300；按序拼回与围栏块词句逐字相等。断在哪、落成几行只作读数」；C1 改为「新增各行每行 ≤300（落成几行属实施席）」 |
| 7 🔵 | C3 ∥ C4 补场景 | C3 场景 = §6.6 清面级指路句那一次；C4 场景 = 本节来源那次的 `REFUSED`；C2 的 `#2370` 括注删（批次坐标不进状态档） |

**被否候选（从关键决策表移出，住本段）**

| # | 被否的形 | 为什么没取 |
|---|---|---|
| K1 | 两席人格档各写一条 | 同一句两个副本，改一处漏一处 |
| K1 | 落 `common.md` | 普通模式也装配，把工程模式-only 的落盘约束放到两模式面 |
| K2 | 把判据全文搬进提示词 | 第二份判据，改一处漏一处 |
| K3 | 写指针「详见 DOC-CHECK §2」 | 判据的字面留在别处，读者按指针去猜 |
| K4 | 新开一节 | `##` 计数连带，读者还要自己发现两节是一对 |

**修正轮读数（本席实算 · 尺标在量法列）**

| 读数 | 值 | 量法 |
|---|---|---|
| 围栏块三行行宽（码点） | 231 ∥ 219 ∥ 144 | `[...line].length` |
| `discipline-engineering.md` 改前 `##` ∥ `###` | 13 ∥ 7 | node 行扫描（`^## ` ∥ `^### `） |
| 「可重跑的扫」改前归面 | 命中 6 行：`advisor-design.md`（函数体量）· `discipline-engineering.md` 两句（段长）· `discipline-normal.md`（函数体量）· `persona-eng-designer.md`（函数体量）· `persona-engineering.md`（清账阈值行）；没有一行在说这一面按行判 | node 逐档扫（`300` ∧ `line` ∥ `行` ∥ `width` ∥ `码点`） |
| 公共源四枚探针 | 两仓 788 档（`*.md` ∥ `*.txt` ∥ `*.json`）各 0 命中 | node 逐档 `includes` |

**边界**：`§9 integration delta = zero rows: no business-observable result changed, so no row can break or be added`

## §3 设计评审（评审子代理）
**状态行**：评审通过



### 轮次 1（评审子代理）

| # | 严重度 | 状态 | 证据 |
|---|---|---|---|
| 1 | 🔴 | 待处置 | §6.103「现象」句 ∥「上抛项」第 2–3 条：`内置 grep 命中 6 处` 与 `探针 The prompt face is judged line by line 改前 0 命中` 并存，5 处未点名 |
| 2 | 🟡 | 待处置 | §6.103 只有「依据（逐字）」块；同档 §6.8 有「勘察证据行（本席实读）」＋公共源勘察 |
| 3 | 🟡 | 待处置 | §8.2 行「正文单源 = `docs/core/design/PROMPT-SYSTEM.md` §6.103」 ∥ §6.103「判据立一处（`docs/core/design/DOC-CHECK.md` §2，本档不复制）」 |
| 4 | 🟡 | 待处置 | §6.103 关键决策表列头「# / 决策 / 理由 / 被否」 ∥ 标准层 F7-2「关键决策记录为「决策 + 一句理由」（不含被否候选列）」 |
| 5 | 🟡 | 待处置 | 落盘首行 `(thincoder-core/prompts/**)` ∥ §6.6「面级指路句 … 存量已裁 = **删**」；A3 探针只判 `DOC-CHECK` ∥ `§` |
| 6 | 🟡 | 待处置 | A4「落盘后读该档新增三行」 ∥ 断行规则「围栏块里的换行是本档排版，不是要落的那一版断行」 |
| 7 | 🔵 | 待处置 | 用例表 C3 ∥ C4 无场景；C2 带「（`#2370` 那一次的形）」 |

VERDICT: changes-required

计数：🔴 1 · 🟡 5 · 🔵 1 · 合计 7

### 轮次 2（评审子代理）

第 2 轮（评审子代理）· 只验第 1 轮 1🔴 5🟡 1🔵 的处置

| # | 严重度 | 状态 | 证据（指针） |
|---|---|---|---|
| 1 | 🔴 | 已处置 | §6.103「现象」已改结论句（「这一面提到 300 的几处讲的都是别的事」）；新增「**可重跑的扫**」逐行归面；上抛项改「本席实读该面提到 300 的句子在盘」 |
| 2 | 🟡 | 已处置 | 新增「**勘察证据行（本席本轮实读）**」＋「公共源勘察：`index.publicRepos` 实读」＋「已查，无相关」 |
| 3 | 🟡 | 已处置 | §8.2 末行正文单源改「`docs/core/design/DOC-CHECK.md` §2（判据本体）· 本档 §6.103（…不持判据）」 |
| 4 | 🟡 | 已处置 | 关键决策表列头改「决策与理由」，四个「被否」候选全删 |
| 5 | 🟡 | 已处置 | 对照表新增「§6.6 的面级指路句裁定」一行；A3 探针扩到「无档名指路句（`→ see` 一类）」 |
| 6 | 🟡 | 已处置 | A4 改「之后新增的各行…断在哪、落成几行只作读数」；C1 改「落成几行属实施席」 |
| 7 | 🔵 | 已处置 | C3 带「场景 = §6.6 清面级指路句那一次」；C4 带「场景 = 本节来源那次的 `REFUSED`」 |
| 8 | 🟡 | 新增（非阻塞·建议） | 对照表首列「a paragraph running past 300 characters」与勘察证据行所引同节句「no paragraph over 300 characters」两处引文不一致，未标为两行 |

VERDICT: pass

计数：🔴 0 · 🟡 1（建议项，未标 must-fix）· 🔵 0；已处置 7 项，新增 1 项。

### 轮次 3（评审子代理）

第 3 轮（评审子代理）· 代码评审（实施交付前）· 对象 = `thincoder-core/prompts/discipline-engineering.md` 的 `The prompt face is judged line by line` 新条（设计 §6.103 落点）

| # | 严重度 | 状态 | 证据 |
|---|---|---|---|
| 1 | 🔵 | 知会（非本笔缺陷） | 同档在盘另有 §6.104 落点 ③ 的 `What it carries:` 两行形（设计 §6.104「落点 ②–⑥」③ 的替换目标态）；归属本轮未核 = `unverified`（无 git 读数） |

落点 ∥ 词句 ∥ 行宽 ∥ 标题计数 ∥ A3 探针五项实读全过：`**Check**:` 行之后、`Chinese strings in an AC` 条之前；四段逐字与 §6.103 围栏块相等；`doc_check(mode:"report")` 整档 `PASS`；`##` 13 ∥ `###` 7。

VERDICT: pass

计数：🔴 0 · 🟡 0 · 🔵 1 · 合计 1

## §4 用户批准（主 agent）

**用户批准**：2026-11-12 21:45「提示词同步一下。」——批级授权覆盖设计 ∥ 评审 ∥ 实施 ∥ 收口。

**评审链**：第 1 轮 `changes-required`（1🔴 5🟡 1🔵）→ 修正 → 第 2 轮 `pass`（新增 1 条建议性 🟡）→ 实施。

**第 1 轮那条 🔴 值得记**：设计原本用「新句自己的首分句」当探针证明「这条规则一处没有」——改前必然 0 命中，无论该面有没有措辞不同的同规则。修正后换成**能失败的扫**（面内同时命中 `300` 与 `line ∥ 行 ∥ width ∥ 码点` 的行，逐行归面）。

## §5 实施记录（eng-coder）

**实施（eng-coder · 2026-11-12）**

改一份档（§2 受影响文件表里实施席那一笔）：`thincoder-core/prompts/discipline-engineering.md` 的 `### Docs must be human-readable` 节内新增一条，落在 `**Check**: verify per the project's own doc conventions …` 那一行之后、`- **Chinese strings in an AC or a verification command …` 那一条之前。

**改了哪一句（逐字 · 落盘即此形）**

```text
- **The prompt face is judged line by line** (`thincoder-core/prompts/**`): each line there is its own paragraph,
  so the gate measures every line on its own and one past 300 characters is a hit however short the block around it is.
  Break those lines where a sentence or a clause ends,
  change not one word, and do not copy the wrapping of a design document's fenced block — that wrapping is laid out for a page, and the face it lands on counts lines.
  Why: the gate refuses the byte, not the paragraph, so a block written the doc way costs a re-break round after the words are already approved.
```

**断行（实施席定）**：落成 5 行，码点数（量法 `[...line].length`）= 113 ∥ 119 ∥ 54 ∥ 166 ∥ 144。断点两处，皆在分句边界——`its own paragraph,` 之后、`a clause ends,` 之后；词一个未改、未增、未删。没有照抄设计档围栏块的三行折行：设计 §6.103「断行规则」明说「围栏块里的换行是本档排版，不是要落的那一版断行」，且新条正文自己写着 `do not copy the wrapping of a design document's fenced block`。

**拼回**：去掉首行 `- `、续行两空格缩进后按单空格拼回，与设计 §6.103「逐字英文文本」围栏块逐字相等（node 比对 = true）。

**验收读数（本席实跑 · 尺标在量法列）**

| 判据 | 读数 | 量法 |
|---|---|---|
| A1 判据在位 | `The prompt face is judged line by line` 1 处 ∥ `each line there is its own paragraph` 1 处 | 内置 `grep` |
| A1 红侧 | 改前 6 行命中、无一行说这一面按行判；改后 7 行，第 7 行 = 新条第一句的第二行（`so the gate measures every line on its own and one past 300 characters …`） | node 逐档扫：档内含 `300` 且含 `line`∥`行`∥`width`∥`码点` ⇒ 取该档所有含 `300` 的行（与 §2 同一把尺，改前 6 行对得上） |
| A2 断行三条在位 | 三条各 1 处 | 内置 `grep` |
| A2 探针（新增各行内） | `.md` 档名 0 ∥ `§` 带号 0 ∥ 无档名指路句 0 | node 正则 + 内置 `grep` |
| A3 零标题连带 | `##` 13 ∥ `###` 7，改前 = 改后 | node 行扫描（`^## ` ∥ `^### `） |
| A4 行宽 | 113 ∥ 119 ∥ 54 ∥ 166 ∥ 144，最大 166 ≤ 300 | `[...line].length` |
| A4 拼回 | 与围栏块逐字相等 | node `dedent + join(" ")` 比对 = true |
| 交付门 | 首行 `DOC-CHECK GATE: PASS` | `doc_check(mode:"gate")`，判域 = 本批变更区（该档） |
| 面参考锁 | 全仓 12 处命中，`discipline-engineering.md` 0 处 | `node scripts/prompt-refs-check.mjs`——同一次运行里对别的档报红 ⇒ 本档的零是真零，不是一把量不出东西的尺 |

**决策披露表**

| # | 状态 | 条目 |
|---|---|---|
| E1 | ✅ Done | 提示词面写上「每行自成一界、逐行判 300 码点」：`each line there is its own paragraph, so the gate measures every line on its own and one past 300 characters is a hit however short the block around it is.` |
| E2 | ✅ Done | 断行怎么断三条在：`Break those lines where a sentence or a clause ends` ∥ `change not one word` ∥ `do not copy the wrapping of a design document's fenced block` |
| E3 | ✅ Done | 既有节内增列（`##` 13 ∥ `###` 7 零变）；句子自持——无 `.md` 档名、无 `§` 带号、无指路句 |
| E4 | ✅ Done | 5 行皆 ≤300 码点；按序拼回与围栏块逐字相等；词句未改 |

**审查轮次与终态**

- 内部发散审计（explore · 只读）：`terminal: clean`。其自陈一处局限：该装配无 shell，码点数改用「严格子串长度上界 + 三行读数算术对账（113+1+119−2=231 ∥ 54+1+166−2=219 ∥ 144=144）」，与实施席 5 行读数逐项对上。
- 内部代码评审（advisor · `type=code`）：`VERDICT: pass`，🔴 0 ∥ 🟡 0 ∥ 🔵 1（知会项：同档在盘内容另含 §6.104 落点 ③ 的 `What it carries:` 两行形，非本笔；归属未核 = `unverified`）。见 §3 轮次 3。
- 终态：**clean**（零 must-fix，未进修正轮）。

**出清单变更**：无——本笔只动 §2 声明的那一份档。两件须记明：

① 该档 `git diff` 里另有两处 hunk 不是本笔写的（设计步 `What it carries:` 两行形 = §6.104 落点 ③；RTM 用例号三句）。它们在本席开工前已在盘上，属另一批；本席未改、未评审其内容，也不把它们记在本批账上。
② 本席按纪律对该档跑了 `git add`（只这一档，没有 `git add -A`）；路径级入库必然把那两处 hunk 一并带进索引——索引里除本笔之外的一切都不是本席的笔。

**不落笔的两处，说明理由**：设计档 / 需求档 / 标准层 / 别的提示词档 / 代码 —— 按任务书零笔，本席一笔未动。

**落地核对：无**（新条落盘后，设计档 §6.103 的每句仍成立：落点、断行规则、A1–A4、§8.2 落点表行。）

## §6 验证与收口（父代理）

**验证（父侧，本会话实跑）**

| 检查 | 读数 |
|---|---|
| 新条在位 | `thincoder-core/prompts/discipline-engineering.md` 第 452 行起 5 行，起句 `- **The prompt face is judged line by line**` |
| 逐行行宽 | 113 ∥ 119 ∥ 54 ∥ 166 ∥ 144（量法 = 该行字符数），最大 166，全部 ≤300 |
| 拼回 | 实施席 node 比对 `true`（去首行 `- `、续行缩进归并后与 §6.103 围栏块逐字相等） |
| 文档门 | `doc_check(mode:"gate")` 首行 `DOC-CHECK GATE: PASS` |

**该档另有 2 行超 300 码点，均在本批变更区之外**——按用户裁定「存量不判、不提」，本批不动、不记。

**单测**：本批零代码档，无单测档；提示词面无既有用例可跑。

**集成集**：不破任何既有用例——可观察面是提示词文本，RTM delta = 破 0 ∥ 冗余 0 ∥ 新增 0。

**落地核对：无**——新条落盘后 §6.103 与 §8.2 落点行的每一句仍成立。

**派单笔误（记一笔，防止复抄）**：我把 §6.104 设计席人格档围栏块里的 `Check the ledger before you start` 那条写进了本批派单，§6.103 的围栏块里没有那一条；实施席按 §6.103 只落三条词句，处理正确。

**本批无新债。**
