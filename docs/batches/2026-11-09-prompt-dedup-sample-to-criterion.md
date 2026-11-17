# 2026-11-09 · prompt-dedup-sample-to-criterion
> 六段，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 每段只有一个作者：作者的段可 `append` 加内容、可就地改（`edit`）；非作者一概拒。
> 编制：主 agent · 2026-11-09 · 来源 = 用户 2026-11-09 00:55：「1，同意。 2. 样本不是好的方式，应该换种形式。」＋「先按照这么改。」。
> 台账 = #2219（PROMPT-SYSTEM · 归批）。前情 = docs/batches/2026-11-08-small-machinery-purge.md（已收口 2026-11-08）。
## §1 讨论（主 agent）
**状态行**：已收口 2026-11-09
<§1 模板占位：本批条目 / 关键判据 / 授权口径>

### 用户要什么

**背景**：用户问「评估一下工程模式提示词的有效性」。评估结论点出两处结构缺陷：同一档内同一条规则说多遍；把事故写成判决（样本 + 时间锚）。用户逐项处置。

**原话（2026-11-09 00:47）**：「这两个问题要先处理掉。」

**原话（00:55）**：「1，同意。 2. 样本不是好的方式，应该换种形式。」

**原话（00:55）**：「先按照这么改。」

**⇒ 第 1 项按父侧口径去重；第 2 项不是删样本了事，是换形式：样本换判据形。**

### 第 1 项：同一档内同一条规则说多遍

**判据**：设计档 `docs/core/design/PROMPT-SYSTEM.md` §6.53 立过 V3 —— 同档同一条规则只一处；跨层重复允许（三档各自独立可读、提示词面禁档引用），同档内不许。

**读数（本批开批前，`grep` 两个探针）**：

- `attention and token`（该规则的 why）在 `thincoder-core/prompts/persona-engineering.md` 命中 2 处：「Review firing rights」节标题块 ∥ 「Advance & stop」节的并行段。
- `fired by the user`（规则本身）命中 2 处：「Review firing rights」节正文 ∥ 「Review convergence」节前提句。
- 另有两处以从属句出现：「调用链」第 3 步的括注、「Threshold reminder」段。

**先例的读数形**：`docs/batches/2026-11-08-citation-form-inline.md` 对 why 立过 `前七档 1`（why 已在盘、只出现一次）。按同一量法，本档现在是 2。

**处置（按节名定位，不写行号）**：

| # | 位置 | 现文 | 改后 |
|---|---|---|---|
| 1 | 「调用链」第 3 步 | `→ remind the user to fire the design review (firing rights are the user's)` | 删括注；「提醒用户点火」这个动作保留 |
| 2 | 「Review convergence」节前提句 | `Firing rights: design reviews can only be fired by the user — you prepare and remind, the user fires;` | 删这半句；保留后半（交付代码评审 = 自动流程节点 ∥ 父侧顾问 = 可选第二意见），那半句是另一轴 |
| 3 | 「Advance & stop」的并行段 | `… parallel work is no reason to self-fire, since self-firing spends the user's attention and token before they chose to spend it.` | 删 `since` 起的 why；「并行不是自己点火的理由」这句情形保留 |

**判了不动**：「Review firing rights」节（canonical，一字不动）；「Threshold reminder」与「会话开场自检」两处只是顺带点名该规则，不是重述。

### 第 2 项：样本换成判据形

**为什么样本是坏形式**（三条，不靠叙事）：

1. 提示词自己写过 `a rule given without its reasoning is only as wide as its examples` —— 样本把规则裁到例子上。读到「四个消费方、三端、五条错验收行」的模型学到的是上次那批的样子，不是这次该数哪些东西。
2. 样本自带时点与批次。`thincoder-core/prompts/common.md` 自己把 `as of …` ∥ `currently / for now` 列为污染形态；样本读第二遍就是历史。
3. 样本的覆盖面由作者当时的遭遇决定。读者遇到没被写进例子的情形时，判据不在。

**换成的形式**：形态（这类事长什么样）+ 出错入口（在哪一步失效）+ 判据（该数哪些东西），不带具体数字与批次号。

**改后文本（用户已确认的形，逐字）**：

```text
4. **What you can see is the edit; what decides the outcome is what it touches**: the consumers, the places that state the rule, the ends that render it.

A change small enough to be called "one constant" is where this judgement fails most often — not because the edit is large, but because the words make it sound closed.

The touch surface is never the diff. It is every caller of the changed symbol, every re-export, every place that states the same threshold, every acceptance line that reads it, every end that renders it. None of it was created by the change — all of it was already there, unread.
```

```text
A parameter default fires silently when an argument is absent, and the function then runs with a value nobody passed.

The shape of the failure: every step succeeds, so nothing reports; the wrong value travels until it meets the place that reads it, and the trace back starts from the empty result, never from the declaration. The error is not fixed — it is renamed and relocated.
```

**`thincoder-core/prompts/common.md` 三处（只删时间锚，形状与因果保留）**：

| # | 现文（片段） | 改后 |
|---|---|---|
| 4 | `Four shapes they take, all met in one day of our own work:` | `Four shapes they take:` |
| 5 | `Why: twice, scripted merges/moves of documents were rejected by the user on the spot` | `Why: a splice drops what the splicer did not read, and the loss is invisible to every later reader — the document keeps looking complete.` |
| 6 | `the exact failure mode seen today` | `the exact failure mode retrieval cannot distinguish from current guidance` |
| 7 | `a "write-gate" design was once wrongly merged into the "write tool semantics" doc` | 改写为形状句：表面相似不是议题同一，两份档可以同名而回答不同的问题 |

**判了不动**：`common.md` 假绿四形的本体（设计档 A6 对九串各数 1、A4 数四串各 1，只去外面那句「有一天」）；`discipline-engineering.md` 第 4、5 条其余 why 行。

### 同拍面（D11）

改这两档的段落 ⇒ `docs/core/design/PROMPT-SYSTEM.md` 里逐字复制的那几个围栏块必须同批改，否则两层立刻漂。

设计档「删词检验表」里有一条写着「样本必须具体（四载体 ∥ 那处阈值 ∥ 五条算错的验收行），否则读成修辞」——**用户本轮指令推翻它**，同批改写为「形态必须可判；故事不算判据」。

### 边界

只动上述两档提示词 + 设计档对应块。不动 `thincoder-core/prompt-overlays.mjs` 装配、不动工具描述面、不动其他批档。

本批不新立判据面，不引入新机制。

### 验收（两条读 · 2026-11-09 01:55 收正）

本小节早先立的是七枚删面控制串 + 留面读数 + `doc_check` 四档 PASS。**那三条已作废**——用户 01:02 裁定本批不用探针串、不做串计数；01:15 再裁「文档不需要机检验收」。现行验收只有两条读，全文见本节「验收（两条读）」小节：

- 读①：落地档与 `design §6.89` 的逐字终稿块逐行相等；
- 读②：三处原址人读，读下来各自只承载它那一环，规则本体仍只在 canonical 一节。

`doc_check` 照旧在收口链上跑，**它不是本批的验收项**。

### 覆盖账

本批自开行 #2219（PROMPT-SYSTEM · 归批）。同面另四行不属于本笔：#1760 ∥ #1817 在途且已指向 `docs/batches/2026-11-08-ledger-disposal.md`；#1897 ∥ #1898 待讨论，是另外两个对象。

### 父侧草测（设计草稿核读 · 2026-11-09 01:00）

**上抛 1（K3 措辞微调）采纳**：改后句 `…as if it were current guidance, and the reader cannot tell it apart from the live rule.` 优于 §1 第 6 行的直译——直译会使同一句出现两次 `current guidance`。

**以设计档为准**，本节「改后」栏这一处作废。

**上抛 2（K5 条内续行、不空行）采纳**：`discipline-engineering.md` 条内一律续行；「逐字」指措辞，不指空白形态。

### 草测发现 1 处 → 修正轮 1

`Advance & stop` 并行段的改后句现在是：

> `Firing rights unchanged: design reviews are still only fired when the user asks — parallel work is no reason to self-fire.`

前半把规则本体第二次写进本档，正是这批要收掉的东西（V3 同档一处）。

情形句留后半即可。改后整句 = `- Parallel work is no reason to self-fire.`，`Firing rights unchanged` 起的对照随之不需要。

### 核读通过的

§6.89 逐字终稿与 §1 四条处置一致；canonical 节未动；样本块 9→8 ∥ 10→6 与行数读数成对；A1–A6 每枚带红法（七枚删面串改前各 ≥1、五枚新串改前各 0）。

### 修正轮 1 的三条边界

① 只改第 1 号那一条：§6.89 的逐字终稿与 A1 ∥ A2 的探针串随之对齐。

② 报告按编号写「1 → 改了什么，哪个档、哪句逐字」。

③ 本轮不做：不重排 §6.89 结构、不动 K1–K5 其余决策、不碰三份提示词档（那是实施轮）、不新开验收项。

### 已定决定

- **已定决定**：本批不用探针串 / 串计数做验收，也不新增任何机检门 · 用户原话：「不要这样做，不要用这些东西！」 · 时间：2026-11-09 01:02

### 为什么撤

探针串把文档措辞钉死：以后正当改一句，先得去改判据，判据反而比它看的东西活得久。

而且它证明不了这批要的东西。它只能答「那几个字还在不在」，答不了「这条规则现在只在一处」——后者是读出来的。

这批治的是重述，重述的判断靠人读三处原址，不靠数串。

### 换成什么

验收三条，全部是读：

① 落地档与设计档 §6.89 的逐字终稿块逐行相等——这是「照设计的文本落地」比对，不是措辞判据。

② 三处原址人读：`## Firing-rights boundary` 节仍是唯一陈述处；「调用链」第 3 步、「Review convergence」前提句、「Advance & stop」并行段读起来不再重述该规则。

**文档不设机检验收**（用户 2026-11-09 01:15）。前稿的 ③ `doc_check` 四档 PASS 作废——它是机制在收口时自动跑的门，不是本批的验收项。本批的验收就是上列两条读。

### 连带撤销

§6.89 的 A1–A5 五条与两条 `node -e` 命令块整块撤；「改前读数」「红在什么读数上」两列撤；第八枚控制串（`design reviews are still only fired when the user asks`）的加装撤销。

第 1 号修正项（并行段删到 `- Parallel work is no reason to self-fire.`）不变。

### 修正轮 2：撤探针（逐条列清）

上一轮的转向没送达（subagent 先落地），探针被加装而非撤除。为避免第二次歧义，逐条列出本轮要撤的：

**§6.89 要撤**：A1 ∥ A2 ∥ A3 ∥ A4 ∥ A5 五条整条撤，含本轮新加的第八枚删面串与第二枚留面读数。

**§6.89 要撤**：命令 ① ∥ 命令 ② 两个 `node -e` 块整块撤；判据表的「跑什么 / 期望什么」与「红在什么读数上」两列随之不保留。

**§6.89 保留**：A6 改名「交付门」（`doc_check(mode:"gate")` 四档 PASS），作为唯一一条机判——它是既有常设门，不是本批新造。

**§2 要改**：改前读数表里与探针相关的行撤；验收对照段改成三条读（落地逐行相等 ∥ 三处原址人读 ∥ 交付门）。

**上抛两条随探针一并失效**：① `Review convergence` 前提句前半没有控制串；② A5 写「17 档」而命令 ① 只读三档。两条都是探针方案的覆盖缺口，方案撤了，缺口不存在，不再处置。

### 父侧核读（修正轮 2 落地后 · 2026-11-09 01:08）

**核过的**：§6.89 的验收节现在只有三条读与一句「本批不设探针串」的正面说明；A1–A5 五行与两个 `node -e` 块已不在；`Advance & stop` 那一句在逐字终稿里是 `- Parallel work is no reason to self-fire.`，前半与 `since` 起的 why 都已消失。

**退回一处（修正轮 3）**：§6.89 有三处引批档段号——K3 ∥ K4 的「判由」格、上抛 1 的尾句。设计档引批档段号，批档一删指针即死（`D10`）。

理由本身不必动：K3 的「同句会两次出现 current guidance」∥ K4 的「用户要换的是样本这个形式，不是把两条改短」都已自足，删指针后照样读得通。

**核读未通过的其余部分**：无。

### 修正轮 4：§6.89 里还留着「唯一机判 = 既有交付门」（2026-11-09 01:30）

**用户 01:15 逐字**：「首先文档不需要机检验收！」

本节验收栏我早先已改成两条读，但 **§6.89 自己的正文还写着机判门**，两处：

- 验收节标题：`**验收（三条读 · 唯一机判 = 既有交付门）**`
- 边界段：`不新增机检门（本批验收不含探针串，唯一机判 = 既有交付门 doc_check）`

**要改成**：标题去掉「唯一机判」；边界那句只说「不新增机检门、不设探针串」，不再把 `doc_check` 写成验收依据。`doc_check` 判的是文件事实，不进验收表——它照旧存在于收口链上，但那不是本批的验收。

**本轮不做**：不动 §6.89 的判据句、逐字终稿、用例表、三处落点；不动 §6.90 ∥ §6.91 ∥ §6.92（另两批）。

### 设计评审第 1 轮（2026-11-09 01:34 · changes-required）

**评审 ID** = `33e325af`，结论已落 §3。**2 🔴 · 5 🟡 · 2 🔵。**

**裁定：九条全收，无一条判「不是问题」。**

| # | 级别 | 是什么 | 处置 |
|---|---|---|---|
| 1 | 🔴 | `§6.76` A4 要求围栏块禁词零命中，而本次新写入的 `The touch surface is never the diff.` 自带 `never`；`§6.77` A3 同形（`never from the declaration`） | 修 |
| 2 | 🔴 | `§6.76` A3 要求 `small` 零命中，而逐字终稿保留 `A change small enough to be called "one constant"` | 修 |
| 3 | 🟡 | `§6.77` 命令② 判窗仍 10，A3 判窗 6，两个数并存 | 随 1 ∥ 2 清 |
| 4 | 🟡 | `§6.89` 勘察证据行把改前串记作「在盘」 | 修 |
| 5 | 🟡 | `§6.89` 缺「上抛项」 | 修 |
| 6 | 🟡 | `§6.79` 块② 与 `§6.92` 落点 E 撞面 | 进上抛，交 #2222 |
| 7 | 🟡 | `§6.89` 集成测试设计未点名读过的索引行 | 修 |
| 8 | 🔵 | 「其余五行逐字留」实为六行 | 修 |
| 9 | 🔵 | `§6.76` 验收表表头四列、A1 行五格 | 修 |

**修法口径（1 ∥ 2 ∥ 3）**：这三条是同一个病——判据是代理，代理与一句真话打架时让路的是代理。

- 那两行机器判据（`§6.76` A3 ∥ A4、`§6.77` A3）**撤掉词表那一半**，改判它们本来想判的事：新文用因果形、不用禁令语气，由读的人判。
- 命令块与「本席已跑」的旧读数一并撤——那是改前块上取的数，块已变，读数不再成立。
- **围栏块与逐字终稿一个字不改**。文字是对的，是判据过时了。反过来为了判据去改文字，就是让代理指挥真话。

**修法口径（4 ∥ 5 ∥ 6 ∥ 7 ∥ 8 ∥ 9）**：逐条小修。第 6 条写进 `§6.89` 新增的「上抛项」，并指定由 #2222 接手 `§6.79` 的落点与 A1 ∥ A3 ∥ A6 三行。

**本轮不做**：不动 `§6.89` 的判据句 ∥ 逐字终稿 ∥ 用例表 ∥ 三条落点；不动 `§6.90` ∥ `§6.91` ∥ `§6.92`。

### 第 10 条：「判了不动」的理由要重取（2026-11-09 01:38 · 用户点出）

**用户问**：「刚才你因为怕探针红而做得决定收回了吗？」

**答：没有，还立着。**本节早先那行「判了不动」的原话是：

> **判了不动**：`common.md` 假绿四形的本体（设计档 A6 对九串各数 1、A4 数四串各 1，只去外面那句「有一天」）

那是**怕探针红**才留下的理由，不是内容理由。探针已经作废，这条理由就空了。

**要改成**：四形本体不动，是因为**它们就是判断内容本身**——判据的实体，不是它的载体；删了就没有判据了。与任何计数变不变红无关。

**同一口径扫一遍**：凡「射程表 ∥ 判了不动 ∥ 不撤的」里以「改了会破 A* 判据」「计数会变」「会破逐字判据」为理由的行，一律换成人读理由。换不出来的，报到「上抛项」——那说明那条其实该动，由父侧裁，不要自己拍。

**不改处置结论**（动还是不动），只改理由。

### 评审第 2 轮：pass（2026-11-09 01:42）

**结论**：第 1 轮九条**逐条核实为已修**（无一条判「未修」）；新增两条不阻断项（`#10` 🟡 ∥ `#11` 🔵）。**VERDICT: pass，token 已签发。**

**两条新增的裁定：都修，当轮修完再落笔。**

- `#10`：`§6.89` 的受影响行写「三个围栏块同批改」，而上抛 1 末句写「本批不动 `§6.79`」。事实是 `§6.79` 块① 已被本批改过。→ 把上抛 1 的末句收进它的主语范围：只说不接手块② 与那三行。
- `#11`：`§6.76` 落点行「现盘 15 行 → 新形 8 行」与 `§6.89`「9→8」并存，两处都带「现盘 / 改前」语气。→ `§6.76` 那处标成它自己那批的落地读数，或只留「新形 8 行」。

**为什么不搁到批末**：小形项搁着就会变成「已登记、另批处理」，而这两条恰好落在**交接面**上——`#2222` 要照 `§6.89` 的上抛接手 `§6.79`，读错一句就会重复改或漏改。

**修完立即有一段实施轮**：三份提示词档的落笔归 eng-coder。

### 实施轮上抛的裁定（2026-11-09 01:55）

**原话总结（eng-coder `#19`）**：落地九处、读①读②均绿、审计 clean、内部代码评审 pass、修正 0 轮；抛三件不在它笔内的事。

**① `§6.89` 勘察证据行 4 条 `引缺` = 改。** 那 4 行引的是「改前那句话」，落地后字符已不在盘，机检判悬空。设计档只留现值，历史归 git 与本批批档。由设计席改写为不带机器形引用的叙述。

**② `## Advance & stop` 首末两条 = 不动。** 它们讲的是**停走语义**——下一步何时可以走、`once the review has passed, the approval is that word` 是「批准即启动」这条规则；canonical 节讲的是**谁有权点火**。两条规则不同，前者必然要点名「谁的话放行」。读② 的「唯一陈述处」按「点火权」这一条规则读，不按「出现过 `the user's word`」读。

**③ 并行段的节名标错 = 改。** `§6.89` 与 §1 把它记作「`Advance & stop` 并行段」，实际住在 `## Parallel dispatch & multi-task`。按验收读的人会去错节找。

**④ §1 验收小节仍立着已撤的探针判据**——那是我的笔，本轮就地收正（见下一条）。

## §2 批次任务与设计（eng-designer）
**状态行**：设计完成
<§2 模板占位：本批条目（覆盖） / 设计档落点 / 机制设计 / 受影响文件与测试覆盖 / 验收对照 / 关键决策 / 上抛项>

**设计档落点**：`docs/core/design/PROMPT-SYSTEM.md` §6.89（本节新增，本轮已落）。三个逐字围栏块同批改：§6.76 第 4 条块 ∥ §6.77 块 ① ∥ §6.79 块 ① 一行；另加 §6.76 删词检验表一行改写与两处块行数。提示词三档由实施轮 eng-coder 落笔，逐字文本在 §6.89 的三处「逐字终稿」围栏。

### 本批条目（覆盖）

| # | 条目 | 设计落点 | 验收对照 |
|---|---|---|---|
| E1 | `persona-engineering.md` 三处重述收掉；canonical 一节一字不动（V3 同档单处） | design §6.89「逐字终稿 — persona 三处」＋「判了不动」 | 读② |
| E2 | `discipline-engineering.md` 第 4 条：样本换判据形（块 9 行 → 8 行） | design §6.76 第 4 条围栏块（已同批改）· §6.89 K2 ∥ K4 | 读① |
| E3 | 同档第 5 条：样本换判据形（块 10 行 → 6 行） | design §6.77 块 ① 围栏块（已同批改） | 读① |
| E4 | `common.md` 四处去时点（假绿四形外层句 ∥ 脚本拼合的 why ∥ RAG 污染的 why ∥ 合并映射的判据句） | design §6.89「逐字终稿 — common 四处」；§6.79 块 ① 一行同批改 | 读① |
| E5 | 设计档同拍面：三个围栏块 + 删词检验表一行 + 两处块行数 | design §6.89 落点表第 4 行 ∥ §6.76 ∥ §6.77 ∥ §6.79 | 读① |

**明确不在本批**：§6.89「边界」块四条——其余 14 档提示词 ∥ `thincoder-core/prompt-overlays.mjs` 装配 ∥ 工具描述面 ∥ 任何代码 ∥ 需求档。

### 机制设计（改后形态）

- **同档单处**：规则本体 + why 住 `## Firing-rights boundary: you prepare and remind — self-firing spends the user's attention and token.` 一节；调用链、`Review convergence`、`## Parallel dispatch & multi-task` 末条三处各自保留它那一环的动作或情形，不再带 why。
- **判据形**：每条只写三件——这类事长什么样、在哪一步失效、该数哪些东西；不带数字、批号、日期、故事。`None of it was created by the change` 与 `The error is not fixed — it is renamed and relocated.` 两句承重句保留。
- **同文两层同批改**（`D11`）：提示词文本与设计档围栏块是同文两处，一个批次内一起换；只改一层，下一轮读到哪层就做哪层的旧事。

### 受影响文件与测试覆盖

| 档 | 层 | 改什么 | 归谁 |
|---|---|---|---|
| `thincoder-core/prompts/persona-engineering.md` | 产品面（运行期加载） | 三处删重 | 实施轮 |
| `thincoder-core/prompts/discipline-engineering.md` | 产品面（运行期加载） | 第 4 ∥ 5 条块换形 | 实施轮 |
| `thincoder-core/prompts/common.md` | 产品面（运行期加载） | 四处去时点 | 实施轮 |
| `docs/core/design/PROMPT-SYSTEM.md` | 设计档 | §6.89 新增 + 三块同批改 | 本席，已落 |
| 测试档 | — | 0（零代码面；本批验收集 = 两条读） | — |

**分层结论 = 无档跨分层**：档位线只量代码面；`.md` 提示词档免档位判定，运行期代码零改。

### 验收对照（两条读，全部是人读 · `D12`）

本批不设探针串、不做串计数、不新增机检门——用户 2026-11-09 01:02 裁定。判据全文住 design §6.89「验收」，本段只回指，不重述。`doc_check` 不进验收表——它判文件事实（指针解不解得出 ∥ 段长 ∥ 行号坐标），照旧在收口链上跑，那不是本批的验收：

| 读 | 内容 | 谁读 |
|---|---|---|
| 读① | 落地档与 design §6.89 三组逐字终稿块逐行相等（`persona` 三处 ∥ `discipline` 第 4 ∥ 5 条块 ∥ `common` 四处）——比的是落地照不照设计，不是措辞判据 | 实施轮自读，父侧收口复读 |
| 读② | 三处原址人读：`## Firing-rights boundary` 节仍是该规则在本档唯一陈述处；「调用链」第 3 步、`Review convergence` 前提句、`## Parallel dispatch & multi-task` 末条读下来不再重述该规则。`## Advance & stop` 首末两条讲停走语义（下一步何时可走 ∥ 评审过后批准即启动），不在读② 判域——「唯一陈述处」按点火权这条规则读，不按「出现过 `the user's word`」读 | 父侧收口 |


**为什么不用探针串**：串把文档措辞钉死——以后正当改一句先得去改判据，判据反而比它看的东西活得久；且它只答「那几个字还在不在」，答不了「这条规则现在只在一处」，后者只有人读原址能答。
**行数读数（本席本轮，量法 = `doc_check` 的 `lines`）**：`persona-engineering.md` 506 ∥ `discipline-engineering.md` 419 ∥ `common.md` 492；实施轮落地后再取一次落 §5。行数不作验收判据——`discipline` 两条块的 9→8 ∥ 10→6 是设计定稿的形，不是读数目标。

**交付前过门读数（不是本批验收项，2026-11-09）**：`doc_check(mode:"gate")` 四档齐判（设计档 + 三份提示词档），首行 `DOC-CHECK GATE: PASS`；同轮行数复读 506 ∥ 419 ∥ 492，与上句一致。

**设计档回读（`D10` · 本席本轮）**：design §6.89 全文扫批档段号指针 = 0；K3 ∥ K4 的「判由」格不带指针，理由句自足；§6.89 原有两条已裁的上抛项随之删除（决定本体住 K3 ∥ K5，不在别处重述）。设计档内与批档相关的两处只写「读数记入批档」，不指段号。

### 关键决策

见 design §6.89「关键决策」K1–K5（不重述）。其中两条对实施轮有约束力：

- **K4**：第 4 ∥ 5 条只换样本承载的那几行，其余行逐字留——`Set against that, the full process costs a round.` ∥ `So the user is not the one to ask what this change touches` ∥ `The moment to notice` ∥ `Write it the other way instead` ∥ `Internal helper parameters are no exception` 五行在位。
- **K5**：条内不空行，措辞逐字——批档 §1 给的两段文字带空行，落盘时按该档既有形写成续行。

### 上抛项（两条已裁 · 一条知会）

1. 〔已裁 · 措辞〕`common.md` 污染那句的尾巴按 design §6.89 K3 写成 `the reader cannot tell it apart from the live rule`——父侧已采纳，以设计档为准（理由见 K3 判由）。
2. 〔已裁 · 形式〕两条换形块按 `discipline-engineering.md` 既有形写成条内续行（design §6.89 K5）——父侧已采纳：「逐字」指措辞，不指空白形态。
3. 〔知会 · 需求档未动〕本批两处改动是提示词面形式的收正，量的是同档单处与判据形；需求档（主 agent 笔）本席零触。

### 修正轮（评审第 1 轮九条 · 逐条处置）

**口径**（父侧裁 · 见 §1）：第 1 ∥ 2 ∥ 3 条是同一个病——判据是代理，代理与一句真话打架时让路的是代理。那两行机器判据撤掉词表那一半，改判它们本来想判的事。**围栏块与逐字终稿一个字不改**——文字是对的，是判据过时了。其余六条逐条小修。

| # | 处置 | 落在哪 |
|---|---|---|
| 1 🔴 | `§6.76` A4 ∥ `§6.77` A3 撤掉词表那一半，改判「读下来是因果链、不是禁令语气」，由读的人判；带 `本席（已跑）` 的两处旧读数一并撤 | design §6.76 A4 ∥ §6.77 A3 |
| 2 🔴 | `§6.76` A3 撤掉 `size` ∥ `small` 各 0 那一半，改判「该块 8 行，且读不到按大小分级这一形」——`A change small enough…` 是形态句，不据此判红 | design §6.76 A3 |
| 3 🟡 | 两处 `node -e` 命令块整块撤：它承载禁词扫描与 `判窗 10 ∥ 判窗 6` 两个数，同一个块两个窗 | design §6.76 命令 ② ∥ §6.77 命令 ② |
| 4 🟡 | 勘察证据行改标「样本五串**改前形**」（原写「四处在盘」，而那五串正是本节要改掉的串） | design §6.89 勘察证据行 |
| 5 🟡 | `§6.89` 补「上抛项」两条：撞面一条交 `#2222`，`doc_check` 一条知会 | design §6.89 上抛项 |
| 6 🟡 | `§6.79` 块② 与 `§6.92` 落点 E 撞面 ⇒ 进上抛、交 `#2222`；本批只改块① 那一行，块② 与三条验收行不接手（design §6.89 上抛项 1） | design §6.89 上抛项 1 |
| 7 🟡 | 集成测试设计点名读过哪些索引行：索引表全部故事行（`CLI 1` · `CLI 3`–`CLI 40` · `VSC 1`–`VSC 2`），最贴近的两行 = `CLI 12` ∥ `CLI 20`；分册未开及其理由写明 | design §6.89 集成测试设计 |
| 8 🔵 | 「其余五行逐字留」→ 六行（8 行块 = 两行新形态句 + 六行留：首句 + 五条续行） | design §6.89 第 4 条块小注 |
| 9 🔵 | `§6.76` A1 行五格并成四格，与表头对齐 | design §6.76 A1 |

**同批收正的两处连带**（同属 1 ∥ 2 那个病，一节内自相矛盾）：`§6.76` K10 与「偏离 ②」、`§6.77`「偏离 ②」原写着「A4 ∥ A3 = 机判半边 ∥ 禁词零命中」，与本轮改后的判据句对不上 ⇒ 同句改齐。

**本轮不做**：不动 `§6.89` 的判据句 ∥ 逐字终稿 ∥ 用例表 ∥ 三条落点；不动 `§6.90` ∥ `§6.91` ∥ `§6.92`；不动三份提示词档（实施轮）；不新开验收项、不新增机检门、不设探针串。

### 上抛项（本轮新增一条，接在上表三条之后）

4. 〔待裁 · 撞面，交 `#2222`〕`§6.79` 块② 的逐字终稿正是 `§6.92` 落点 E 点名要删的那一条（`A criterion earns its place by being able to fail`）；落点 E 一落，`§6.79` 的 A1 ∥ A3 ∥ A6 三行失去对象。`§6.79` 块② 的落点与这三行由 `#2222` 接手；块①（`Four shapes they take:` 那行）已随本批改过，块② 与三行不接手（design §6.89 上抛项 1）。

**交付前过门读数（不是本批验收项，本席本轮复跑）**：`doc_check(mode:"gate")` 四档齐判首行 `DOC-CHECK GATE: PASS`；行数复读 `persona-engineering.md` 506 ∥ `discipline-engineering.md` 419 ∥ `common.md` 492，与上段读数一致（三档本轮零改）。

### 修正轮（第 10 条 · 理由换口径：留面按内容说）

**口径**（父侧裁 · 见 §1 第 10 条）：处置结论（动 ∥ 不动）一字不变，只换理由——凡以「改了会破某条 A 判据 ∥ 计数会变 ∥ 会破逐字判据」为由的，一律换成人读的内容理由；换不出内容理由的，说明那条其实该动，报上抛项，不自己拍。

| # | 位置 | 改前的理由 | 改后（内容理由） |
|---|---|---|---|
| 10 | design §6.89 第二条「判了不动」（`common.md` 假绿四形本体 ∥ `discipline-engineering.md` 第 4 ∥ 5 条其余 why 行） | 留是因为「A6 对九串各数 1、A4 数四串各 1」——即改了计数会变红 | 四形的形状句本身就是这条判据的内容（假绿长哪几副样子，就写在它们里），删了判据就没了；三条 why 行分别承着这条规则驳的直觉 ∥ 缺参那一刻的动作 ∥ 规则的边界，删任一行只剩结论 |

**扫过、无处置的四处**：① `§6.76` 的 K10 ∥ ② 同节「偏离 ②」∥ ③ `§6.77`「偏离 ②」——评审第 1 轮已改按读的人判，理由为内容（判据是代理，代理与一句真话打架时让路的是代理）；④ `§6.89` 第一条「判了不动」（canonical 整节 ∥ 两处顺带点名）——理由本来就是内容：删本体 = 删规则，顺带点名不是重述。

**换不出内容理由的 = 0**（读法：本批射程三节的 K 表 ∥ 偏离段 ∥ 判了不动段逐段读，凡「留 ∥ 不动」的判定句都问一句「删了它，判据还剩下什么」——答得出内容的留，答不出的报上抛；本批没有答不出的）⇒ §6.89「上抛项」不增。`§6.79` 那几行探针判据属 `#2222`，不在本批射程，未扫、未动。

### 修正轮（评审第 2 轮两条 · `#10` ∥ `#11` 当轮修完）

**口径**（父侧裁 · 见 §1）：两条都落在交接面上——`#2222` 要照 `§6.89` 的上抛接手 `§6.79`，读错一句就会重复改或漏改；留到批末就变成「已登记、另批处理」。

| # | 处置 | 在哪 |
|---|---|---|
| 10 🟡 | `§6.89` 上抛 1 末句主语收窄：`#2222` 接手的是块② 与三条验收行；本批改过的只是块① 里 `Four shapes they take:` 那一行。与同节受影响行「三个围栏块同批改」不再两说 | design §6.89 上抛项 1 |
| 11 🔵 | `§6.76` 的「现盘 15 行 → 新形 8 行」去掉改前那一半，只留设计定的新形 8 行——改前读数不再冒充现盘 | design §6.76 落点表 ∥ 偏离 ① |

**`#11` 的第二处**：评审点的是落点行；偏离 ① 是同一句的第二遍（同一节里「现盘 15 行」出现两次），一并去掉——只改一处，同一节里仍是两个说法。

**本轮不做**：不动 `§6.89` 的判据句 ∥ 逐字终稿 ∥ 用例表 ∥ 三条落点；不动 `§6.90` ∥ `§6.91` ∥ `§6.92`；不动三份提示词档（归实施轮）。

### 修正轮（实施轮上抛四条 · 父侧 2026-11-09 01:55 裁定）

**口径**：① ∥ ③ 落在本席笔内（设计档）；② 是「不动」的裁定，写进设计档「判了不动」；④ 是 §1 自己的笔，父侧本轮已就地收正。

| # | 父侧裁定 | 本席处置 | 落在哪 |
|---|---|---|---|
| ① | `§6.89` 勘察证据行那 4 条机器形引用 = 改 | 先实测再动笔：本节 4 条 `依据 …「…」` 逐条做引文子串比对，4/4 引文仍在所指档内；`doc_check` 整档读数为命中 0 条（锚 0）⇒ §5 报的「4 条引缺」在现盘不复现，正确的引用不据此改写。改的是同一个病的真实例——正文两处引着本批已删掉的那半句（`Firing rights unchanged` 起），现值改写为不带删句的形 | design §6.89 落点表第 1 行 ∥ persona 第 3 块题注 |
| ② | `## Advance & stop` 首末两条 = 不动 | 落成设计档「判了不动」第 3 项，并写清读② 的「唯一陈述处」按点火权这条规则读、不按「出现过 `the user's word`」读——否则下一位读者会把停走那条当成第二种写法再删一遍 | design §6.89 判了不动 |
| ③ | 并行段的节名标错 = 改 | 三处按真实节名写：`## Parallel dispatch & multi-task` 末条（落点表 ∥ 块题注 ∥ 读②）。本档其余 `§Advance & stop` 引用讲的是停走语义，不在本笔，未动 | design §6.89 三处 ∥ 本段机制设计与读② 两行 |
| ④ | §1 验收小节仍立着已撤的探针判据 | §1 是父侧笔，本席零触（父侧本轮已就地收正） | — |

**读数（本席本轮实跑，不入验收表）**：`doc_check` 报告态整档命中 0 条；4 条 `依据` 引文子串比对 4/4 `FOUND`。

**本轮不动**：§6.89 的判据句 ∥ 逐字终稿三组 ∥ 用例表 ∥ 两条验收读；§6.90 ∥ §6.91 ∥ §6.92；三份提示词档（已由实施轮落笔，本席零触）。

## §3 设计评审（评审子代理）
**状态行**：评审通过



### 轮次 1（评审子代理）

| # | 严重度 | 状态 | 证据（指针） |
|---|---|---|---|
| 1 | 🔴 | 未解决 | §6.76 A4「射程 = 本节围栏块那 8 行」要求禁词命中 0，而围栏块含 `The touch surface is never the diff.`；同型 §6.77 A3「各 **0**」× 块① `never from the declaration`；两行的跑者栏仍是改前取的「本席（已跑）」 |
| 2 | 🔴 | 未解决 | §6.76 A3「扫 `size` ∥ `small` ⇒ 各 0」× 同一节逐字终稿 `A change small enough to be called "one constant"`（照落必含 `small`）；括号内 15 ∥ 8 ∥ 4 混了三个批前状态 |
| 3 | 🟡 | 未解决 | §6.77 A3「块①（6 行）」× 命令 ② 题注「判窗按块 = 10 ∥ 4」与代码 n=10，判窗两个数 |
| 4 | 🟡 | 未解决 | §6.89「样本四处在盘」（`Four shapes they take, all met in one day of our own work` 等）正是同节逐字终稿改掉的串，未标「改前」 |
| 5 | 🟡 | 未解决 | §6.89 缺「上抛项」，而跨批未结题存在（§6.79 块② 归属、三行 `doc_check` 与本节「`doc_check` 不进验收表」并存） |
| 6 | 🟡 | 未解决 | §6.79 块② 逐字落 `A criterion earns its place by being able to fail`，§6.92 落点 E 点名删该条 ⇒ §6.79 的 A1 ∥ A3 ∥ A6 失去对象（§6.92 不在本次范围，只报 §6.79 一侧） |
| 7 | 🟡 | 未解决 | §6.89 集成测试设计只给「62 行、49 行表」与探针零命中，未点名读过的故事/分册，破行 0 不可复核（对照 §6.77「`CLI 1` ∥ `CLI 12`」） |
| 8 | 🔵 | 未解决 | §6.89「其余五行逐字留」——该块换两行后实留 6 行 |
| 9 | 🔵 | 未解决 | §6.76 验收表头四列，A1 行给五格 |

VERDICT: changes-required

计数：🔴 2 · 🟡 5 · 🔵 2（合计 9）

### 轮次 2（评审子代理）

| # | 严重度 | 状态 | 证据（指针） |
|---|---|---|---|
| 1 | 🔴 | 已修 | §6.76 A4「删词检验 · 因果形那一半」判法（一句）＋「禁词表不作判据」；§6.77 A3 同形（「块① 正当写着 `never from the declaration`」） |
| 2 | 🔴 | 已修 | §6.76 A3「该块读下来是 **8 行**」＋「`A change small enough to be called "one constant"` 那句是形态句…不据此判红」 |
| 3 | 🟡 | 已修 | §6.77 A3「判窗 = 两块围栏本身，按块取 6 ∥ 4 行」；「判窗按块 = 10 ∥ 4」题注与 n=10 命令已撤（本节命令只剩 ① ∥ ③） |
| 4 | 🟡 | 已修 | §6.89 勘察证据行「样本五串**改前形**（本席本轮实读；落地后这五串不再在盘）」 |
| 5 | 🟡 | 已修 | §6.89「**上抛项（一条待裁 · 一条知会）**」 |
| 6 | 🟡 | 已修（已登记） | §6.89 上抛 1「〔待裁 · 撞面，交 `#2222`〕`§6.79` 块② 的逐字终稿正是 `§6.92` 落点 E 点名要删的那一条」 |
| 7 | 🟡 | 已修 | §6.89 集成测试设计「全部故事行（`CLI 1` · `CLI 3`–`CLI 40` · `VSC 1`–`VSC 2`）」＋「最贴近提示词面的两行 = `CLI 12`…∥ `CLI 20`…」 |
| 8 | 🔵 | 已修 | §6.89「其余六行逐字留——首句 + 五条续行」 |
| 9 | 🔵 | 已修 | §6.76 验收表表头「| # | 验收 | 跑什么 / 期望什么 | 跑者 |」与 A1 行四格同宽 |
| 10 | 🟡 | 新（不阻断） | §6.89 受影响行「§6.76/§6.77/§6.79 三个围栏块同批改」× 上抛 1「本批不动 `§6.79`」——同一节两说 |
| 11 | 🔵 | 新（不阻断） | §6.76 落点「（现盘 15 行 → 新形 8 行）」× §6.89「第 4 ∥ 5 条块换形（9→8 ∥ 10→6 行）」 |

计数：🔴 未结 0（2 已修）· 🟡 6（5 已修、1 新增不阻断）· 🔵 3（2 已修、1 新增不阻断）

VERDICT: pass

## §4 用户批准（主 agent）

### 用户批准（2026-11-09 01:44）

**用户 2026-11-09 01:28 逐字**：「那剩下那些都开动起来吧。」

**口径**：批次级放行——本批的评审点火、修正、实施启动都在授权范围内，不再逐步回问。规则保留的两处停点照旧有效（评审 🔴 需改语义 ∥ 实施需偏离已批准设计）。

**批准对象**（以此为准）：

- 设计档 `docs/core/design/PROMPT-SYSTEM.md` §6.89 与 §6.76 ∥ §6.77 ∥ §6.79 的同拍改动（评审两轮，轮 2 = pass，token 已签发）；
- 实施范围 = 三份提示词档按 §6.89 的逐字终稿落笔：`thincoder-core/prompts/persona-engineering.md` 三处删重 ∥ `thincoder-core/prompts/discipline-engineering.md` 第 4、5 条样本换判据形 ∥ `thincoder-core/prompts/common.md` 四处去时间锚。

**不在批准范围**：`§6.90` ∥ `§6.91` ∥ `§6.92` 与另两批（`#2221` ∥ `#2222`）；`§6.79` 的落点与 A 表（交 `#2222`）。

## §5 实施记录（eng-coder）

### 落笔（九处 · 对照 §6.89 / §6.76 / §6.77 的逐字终稿）

| # | 档 · 位置 | 落成什么 | 读① |
|---|---|---|---|
| 1 | `persona-engineering.md` · `## Call chain` 第 3 步 | 删 `(firing rights are the user's)`；`remind the user to fire the design review` 这个动作留着 | 与 §6.89 块逐行相等 |
| 2 | 同档 · `## Review convergence` 前提句 | 删前半规则半句，只留 `- Delivery code review = an automatic flow node (subagent-internal protocol) — parent-side advisor = optional second opinion.` | 同第 1 行 |
| 3 | 同档 · `## Parallel dispatch & multi-task` 末条 | 整句只剩 `- Parallel work is no reason to self-fire.`（`Firing rights unchanged` 起的前半与 `since` 起的 why 同删） | 同第 1 行 |
| 4 | `discipline-engineering.md` · 第 4 条块（8 行） | 原样本三行换两行形态句；首句 + 五条续行逐字留 | 与 §6.76 围栏块**逐字节相等**（含缩进） |
| 5 | 同档 · 第 5 条块（6 行） | 样本四行 + 独立的 `The error is not fixed; it is renamed and relocated.` 一行，换一行形态句（该句并入形态句尾） | 与 §6.77 块① **逐字节相等**（含缩进） |
| 6 | `common.md` · 假绿四形外层句 | `Four shapes they take:` —— `all met in one day of our own work` 去掉，四形本体与后续两行续行一字不动 | 与 §6.89 块逐行相等 |
| 7 | 同档 · 脚本拼合 why | `Why: a splice drops what the splicer did not read, and the loss is invisible to every later reader — the document keeps looking complete.` | 同上 |
| 8 | 同档 · RAG 污染 why | `Why: invalidated statements are a RAG pollution source — retrieval surfaces a deleted wrong statement as if it were current guidance, and the reader cannot tell it apart from the live rule.`（K3 尾句形） | 同上 |
| 9 | 同档 · 合并映射判据句 | `… surface resemblance is not topic identity; two documents can carry the same name and answer different questions.` | 同上 |

三处插入位置未变、条目编号与相邻行零动；`## Firing-rights boundary: you prepare and remind — self-firing spends the user's attention and token.` 整节一字未动。

### 读数（`D12`：命令与输出在记录面，规范面只留判据）

**读① 落地照设计**：`execute` 取设计档三组围栏块与落地行逐行比对，13 项（九处落点 + 两条块行数 + 块后空行）全部 `EQUAL`、`differ 0`；两处纪律块另做**逐字节**比较（含行首缩进），`item4 block byte-equal: true` ∥ `item5 block byte-equal: true`。块行数：第 4 条 `8`、第 5 条 `6`（与设计定的 9→8 ∥ 10→6 一致）。

**读② 三处原址人读**：这三处现在读下来各自只承载它那一环——调用链第 3 步是链上的一步动作；`Review convergence` 首条是交付代码评审那条轴；并行段末条是「并行不是自己点火的理由」这个情形。规则本体仍只在 `## Firing-rights boundary` 一节里陈述。读数（`grep` 顺带复核、不作判据）：`attention and token` 在本档 = 1（canonical 节标题）、`fired by the user` = 1（canonical 节正文 `**Who fires**` 行）。

**行数读数**（量法 = `doc_check` 的 `lines`，落地后实跑）：`persona-engineering.md` 505 ∥ `discipline-engineering.md` 414 ∥ `common.md` 492。§2 记的改前为 506 ∥ 419 ∥ 492 ⇒ 差 = −1 ∥ −5 ∥ 0，恰为设计定的删量（第 2 项两行并一行 = −1；第 4 条 −1、第 5 条 −4）。

**交付门（不是本批验收项）**：`doc_check(mode:"gate", docs=[三份提示词档])` 首行 `DOC-CHECK GATE: PASS`，0 段有问题。

**退面串复核（顺带读数，不作判据）**：七枚退面串（`A measured sample, from our own work` ∥ `all met in one day of our own work` ∥ `twice, scripted merges` ∥ `seen today` ∥ `was once wrongly merged` ∥ `firing rights are the user's` ∥ `since self-firing spends the user's attention and token`）在三档各 0；三档无一行 >300 字符。

### 内部探索审计（第 1 轮 · 只读）

`subagent(role=explore)` 对九处落点逐点取两侧原文比对：9/9 `OK / EVEN`，块行数 8 ∥ 6 与设计一致，读② 三处原址各自成立，退面串在 `thincoder-core/prompts/` 无残留 ⇒ `audit: clean`，无需修正轮。审计另报两处不在本笔射程的现象，见「上抛项」。

### 内部代码评审（第 1 轮 · `advisor type=code`）

`VERDICT: pass`。三条 🟡 均为「验收口径 / 记录面 / 协调」项，三条 🔵 为文档卫生项；无一条要求改三档提示词的一个字。逐条处置：

| # | 级别 | 是什么 | 处置 |
|---|---|---|---|
| 1 | 🟡 | §6.89 落点表第 1 行与读② 把并行段写作「`Advance & stop` 并行段」，而该句实在 `## Parallel dispatch & multi-task` | 认：落地文本没错，错的是验收指向的节名；设计档归 eng-designer，报上抛 |
| 2 | 🟡 | 读② 首句「该规则在本档唯一陈述处」与 `## Advance & stop` 的 `> **Each step completes → present → enter the next step**: review firing / implementation starts wait for the user's word …` 互咬 | 认：该行不在设计授权的三处之内，未动；父侧裁是否并入本批，报上抛 |
| 3 | 🟡 | §5 无正文 | 本段即修（本席本轮落笔） |
| 4 | 🔵 | 断言 §6.77 块① 续行缩进 4 空格、落地为 3 空格，读① 的「逐行相等」会因此红 | **不成立**：本轮实读逐行缩进 —— 设计 `[0,3,3,3,3,3]` ∥ 落地 `[0,3,3,3,3,3]`，两处纪律块整体 `byte-equal: true`。无处置 |
| 5 | 🔵 | §1「验收」小节仍立着已撤的探针判据 | 认：§1 是父侧笔，未动，报上抛 |
| 6 | 🔵 | §6.89 勘察证据行 4 处 `依据 …「…」` 已 `引缺` | 认（本席落地前即已发现并量过）；设计档归 eng-designer，报上抛 |

**修正轮 = 0**（无一条属于本笔落地的偏离需要回改）；**终态 = `clean`**。评审第 4 条按「判据是代理，与读数打架时让路的是读数」处理：实测缩进两侧相同，故不据此改任何文本。

### 上抛项

1. 〔待裁 · 射程〕`persona-engineering.md` 的 `## Advance & stop` 首条与末条（`> **Each step completes → present → enter the next step**: review firing / implementation starts wait for the user's word …` ∥ `> **Without a batch-wide go-ahead, once the review has passed, the approval is that word** …`）读下来是该规则的第二种写法，而它们不在设计授权的三处之内、也不在设计「判了不动」点名的两处之内。本席未动。并或不并，由父侧裁。
2. 〔知会 · 收口门〕本席落地后，§6.89「勘察证据行」那 4 行 `依据 <提示词档>「<改前串>」` 的引文已不在盘（`doc_check` 报 4 条 `引缺`）。收口门若按四档齐判（设计档 + 三档），设计档一侧会 `REFUSED`，需设计席改写该块形式（改前形改写成叙述、不带机器形引用）。
3. 〔知会 · 坐标名〕§6.89 与 §1 把并行段记作「`Advance & stop` 并行段」，实际住在 `## Parallel dispatch & multi-task`；后续读验收的人会去错节找。
4. 〔知会 · §1 记录〕§1「验收」小节（删面控制串 ∥ 留面读数 ∥ `doc_check` 四档 PASS）与同节后文「已定决定：本批不用探针串 ∥ 串计数」并存；批次档是过程档，本席未动，仅报。

## §6 验证与收口（父代理）

### 验证与收口（2026-11-09 01:58 · 父侧实读）

**一 · 落地残留（父侧自己跑，不采信子代理读数）**

命令：`grep` 五枚退面串于 `thincoder-core/prompts/*.md`，正则 = `firing rights are the user's|Firing rights unchanged|all met in one day of our own work|the exact failure mode seen today|A measured sample, from our own work: a change judged to be`。读数 = **零命中**。

**二 · 文档纪律门**

`doc_check(mode:"gate", docs=[设计档, 本批档, 三份提示词档])` → 首行 `DOC-CHECK GATE: PASS` · 0 段有问题（5 档全清）。

**三 · 一处被推翻的子代理读数（记下来，免得下次照抄）**

`#19` 报「`§6.89` 勘察证据行 4 条 `引缺`，收口门会 REFUSED」；`#23` 实读**不复现**（4/4 `FOUND`，锚 0 条）。原因：`#19` 的读数取在 `#21` 删掉那两组失效引文**之前**，两席并发。**以现盘为准 = 引缺 0**，父侧上表已独立复核。

**四 · 集成测试**

`none`。改动面 = 三份提示词档的文字与设计档对应块；不改变任何业务可观察结果，`test/RTM.md` 无相关故事行。**本批的验证就是上文两条读 + 父侧那两条实跑读数。**

**五 · 三处落点复核**

- `persona-engineering.md` 调用链第 3 步：`remind the user to fire the design review` 动作在、括注没了；
- 同档 `Review convergence` 前提句：只剩交付代码评审那条轴；
- 同档 `## Parallel dispatch & multi-task` 末条：只剩情形句，规则本体重述已去（节名已由 `#23` 收正）；
- `discipline-engineering.md` 第 4 ∥ 5 条块：8 行 ∥ 6 行，其余逐字留；
- `common.md` 四处：四形外层句 ∥ 脚本拼合 why ∥ RAG 污染 why ∥ 合并映射判据句。

**六 · 账单**

台账 `#2219` `在途 → 待核销 → 已核销`。**结算依据**：§5（实施记录，九处逐字）＋ §6 本段（父侧实读：零残留 ∥ 门 PASS ∥ 行数差合于设计删量）。
