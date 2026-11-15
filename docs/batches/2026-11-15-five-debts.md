# 2026-11-15 · five-debts
> 六段，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 每段只有一个作者：作者的段可 `append` 加内容、可就地改（`edit`）；非作者一概拒。
> 编制：主 agent · 2026-11-15 · 来源 = 来源 = 用户 2026-11-15 原话：「这五条债也都处理掉吧」——覆盖面 #2473 ∥ #2474 ∥ #2475 ∥ #2476 ∥ #2477。
> 台账 = #2473（— · 归批）。前情 = 无（独立批）。
## §1 讨论（主 agent）
**状态行**：已收口 2026-11-15
批起 sha = 96d99dd08d8e8c50a39c888214178136b54c067c
<§1 模板占位：本批条目 / 关键判据 / 授权口径>

## 覆盖与授权

本批覆盖五行，一次清掉：`#2473` ∥ `#2474` ∥ `#2475` ∥ `#2476` ∥ `#2477`。五行都是 2026-11-15 三个批次留下的自检债，同一句话点名。

- **已定决定**：五行遗留债一次清完，走完整链路（设计 → 评审 → 实施 → 收口） · 用户原话：「这五条债也都处理掉吧」 · 时间：2026-11-15 23:25
- **已定决定**：提示词面必须自足，不许出现指向设计档的指针 · 用户原话：「你开啥玩笑？！提示词怎么能用指针！」 · 时间：2026-11-15 22:38
- **自动推进**：本批全程自动（设计 → 评审 → 修面 → 实施 → 验收 → 收口 → 提交），只在评审出修不动的 🔴、或实施需偏离已批准设计时停下 · 用户原话：「这五条债也都处理掉吧」 · 时间：2026-11-15 23:25

## 库内研究（逐条已查）

- 已查：grep「paragraphHits|isPromptFace|promptFace」域 `thincoder-core/doc-check` → 三处：`index.mjs` 第 243 行一处调用、`paragraph.mjs` 的定义与说明串
- 已查：读全 `thincoder-core/doc-check/paragraph.mjs` → 提示词面分支只滤 `excluded[i]`（第 221 行）；文档面另有 `headingMark` ∥ `isQuoteLine` ∥ 空行三条断段（第 241 行）
- 已查：`structuralExclusionLines` 只标记表格 ∥ 列表 ∥ 缩进码块，且**未导出**；`anchors.mjs` 只从本档取六个谓词，不取它
- 已查：grep「D1–D17|D17|D16」域 `thincoder-core/prompts/discipline-engineering.md` → 第 379 行节标题「### Doc update discipline (D1–D17)」、第 466 行末条 D17
- 已查：读 `docs/core/design/DOC-DISCIPLINE.md` 第 111–148 行 → D18 ∥ D19 ∥ D20 ∥ D21 在册；D21 第 140 行写「提示词面要放一段长引文就放进围栏块」
- 已查：grep「没有绑定|本批|一档也不判」域 `thincoder-core/agent-tools/doc-check.mjs` → 命中第 79 行的 `//` 注释；真正的判定在 80–81 行的 `bound` ∥ `sha` 与第 86 行的 `regions`
- 已查：读 `thincoder-core/prompts/knowledge/tool-doc-check.md` 第 26 行 → 句末 `. —`；同行写「A file under `thincoder-core/prompts/` is judged line by line … table, list and code blocks remain excluded」

## 库外研究

**B 类**，两个问题都答了。改动面 = `thincoder-core/doc-check/paragraph.mjs`（本仓自有判据实现，不读外部依赖、无外部 API 调用；其围栏闭合语义注释引 CommonMark，本批不动那一段）。外部断言 = 零——本批全部结论都是本仓工具自身行为的读数，已用 `execute` 实测，不涉任何第三方系统。

## 实测读数（`execute` 直连判据函数，不经 shell）

同一份文本，`promptFace` 取真取假各跑一遍，400 字长行七种形态：

| 形态 | promptFace | docFace |
|---|---|---|
| 普通散文行 | `[{line:1,len:400}]` | `[{line:1,len:400}]` |
| 围栏块内一行 | `[{line:2,len:400}]` | `[]` |
| 引用块行 | `[{line:1,len:402}]` | `[]` |
| 标题行 | `[{line:1,len:404}]` | `[]` |
| 表格行 | `[]` | `[]` |
| 列表项 | `[]` | `[]` |
| 缩进代码行 | `[]` | `[]` |

## 缺陷一：提示词面的豁免面比文档面窄，且窄的那一面正被两处规约承诺为「豁免」

台账 `#2473` 记的是引用块一类，实测是**四类**：围栏块（含围栏行本身）∥ 引用块 ∥ 标题行，提示词面全部计入并照报；只有表格 ∥ 列表 ∥ 缩进码块两面一致。

两处独立的规约都断言围栏块在该面豁免，而代码是反的。`DOC-DISCIPLINE.md` D21 第 140 行：「引文逐字连续，不许折行；文档面不计入段，提示词面要放一段长引文就放进围栏块」。`tool-doc-check.md` 第 26 行：「table, list and code blocks remain excluded」。

**裁定：错在代码这一侧，不在两处规约。** 用户已裁「引文不许折行」，那么提示词面若把围栏里的逐字引文照报，唯一的修法就是改引文，直接违 D20。本批要让代码兑现这两处承诺。

## 缺陷二至五（各自的目标已定，逐字文本归设计席）

- `#2474`：提示词面的 D 族清单停在 D1–D17，设计档已到 D21。**不许改成指针**——用户裁定提示词面自足。方向是补齐 D18–D21 四条进那一节，并让设计档记下两份的分工（提示词面 = 可执行的一句话规则；设计档 = 要求 + 为什么），使后来的人知道同轮要一起改。
- `#2475`：D21 的「依据」引的是 `doc-check.mjs` 第 79 行的 `//` 注释，不是判定分支。改引第 80–81 行与第 86 行那句真正的判定，逐字，不改写。
- `#2476`：`tool-doc-check.md` 第 26 行句号后接悬空破折号。同一行两笔：删句号 + 提示词面排除族补齐六族（上抛二裁定，见本节末；否决「只删句号」）。
- `#2477`：`discipline-engineering.md` 第 480 行「Inserting blank lines, or breaking a line, is not that reorganization」前半句未限面别，而第 485 行命提示词面在句读处断行。只给这半句加文档面限定，既有的提示词面两条不动。

## 边界

- 改动面限四档：`thincoder-core/doc-check/paragraph.mjs` ∥ `docs/core/design/DOC-DISCIPLINE.md` ∥ `thincoder-core/prompts/discipline-engineering.md` ∥ `thincoder-core/prompts/knowledge/tool-doc-check.md`。
- 判据面 `docs/core/design/DOC-CHECK.md` 只改 §2 第三条那一句（4c）：排除族补到与第一条同族。第一条 ∥ 第二条 ∥ `PARAGRAPH_MAX` 一字不动；需求档不动。
- 为什么松这一格：那条的三个名字修前恰好等于代码在两面的排除集，当时说的是真话；`#2473` 落地后围栏 ∥ 引用 ∥ 标题在提示词面也排除，句子不动就成了不完整描述。本批正在杀的就是「代码与文档各说一句」，同一批里不能新造一条同形的病。
- 阈值常量 `PARAGRAPH_MAX` 不动。
- **不新增集成用例**：`test/RTM.md` 无 doc-check 族，本批无业务场景、无生产问题可引；判据由本批单测档覆盖，收口即删。设计席可举证反驳。

## 验收线（主 agent 定，设计席细化成 §2 的 AC）

- 反侧：上表七行里，围栏块 ∥ 引用块 ∥ 标题行三行当前是命中，修后必须变 `[]`——**这条先跑红再跑绿**。
- 正侧：普通散文行仍报；表格 ∥ 列表 ∥ 缩进代码三行仍 `[]`；文档面一列七行修前修后**一字不变**。
- 现有提示词面全部档 `doc_check` `report` 跑一遍，修前修后命中集合不得新增（收窄豁免只应减少命中）。
- 文档闸 `report` 对四档 PASS。

## 评审前的设计验证（主 agent，内容级）

§2 全 189 行已读；四处逐字更换、AC-1～AC-10、机读清单、边界、关键决策逐项核过。结论三条。

### 上抛一裁定：判据面改一句

依据 `docs/core/design/DOC-CHECK.md` §2 第一条：「一段 = 相邻的非空正文行。标题、表格、列表、引用、围栏代码块和缩进代码块各自成界，不计入正文段落。」六族在此，不按面别分写。

同节第三条：「提示词面每行自成一界，因为提示词中的换行是版式，不是段落组织；表格块、列表块和代码块仍整体排除。」那三个名字修前恰好等于代码在两面的排除集，句子当时说的是真话。

`#2473` 落地后围栏 ∥ 引用 ∥ 标题在提示词面也排除，第三条不动就从真话变成不完整描述：读者照它读，会以为那三族在提示词面照数。

裁定改判：判据面改这一句（4c），排除族补到与第一条同族；第一条 ∥ 第二条 ∥ `PARAGRAPH_MAX` 一字不动。理由同边界那条——同一批里不能一边杀「代码与文档各说一句」，一边新造一条同形的病。

### 机读清单第三列已复核

`countContentLines` 跑批起快照 `git show 96d99dd:thincoder-core/doc-check/paragraph.mjs` = 248，工作树同值 248。`96d99dd` 提交题为「batch-start snapshot」。第三列写 248 成立。

### 内容级验证新发现：D21 条目与同档「Docs must be human-readable」节重复

§2 2b 拟落进提示词面的 D21 三条，前两条与该档第 475、476、479 行几乎同句：重写形态一句、判据挂工具一句、Why 一句。

同一份档里同一条规则两份活本，正是本批要杀的病（D2）。派设计席 fix：D21 条目只承载那一节**没有**的内容。

### 一处我自己的派单错

本批 spawn 的 `files` 写的是 `D:\teamcode\docs\...`（少一层 `thincoder`），设计席按正确路径落盘并如实上抛。后续 spawn 一律用绝对路径。

### 上抛二裁定：`tool-doc-check.md` 那句同样补齐六族

设计席上抛：`thincoder-core/prompts/knowledge/tool-doc-check.md` 第 26 行「table, list and code blocks remain excluded」——修后仍为真，但已是不完整枚举，与上抛一同形。裁定：一并补，本批做。

- 那一档已在本批写域内（`#2476` 要删同句末的悬空破折号），不是新增改动面。
- 让那句变成不完整描述的是本批自己的修复：提示词面修后排除围栏 ∥ 引用 ∥ 标题，而它只说三族。
- 提示词面是模型唯一读到的那一面。判据面同形的那句已经改（4c），这一面留着，等于把刚杀的病换个地方养。

写法：把这半句的排除族换成与正文段落一条同族——标题行、表格、列表、引用块、围栏代码块、缩进代码块，整体排除、不逐行计；其余一字不动，句末悬空破折号按 `#2476` 删。

`AC-7` 若断言该串原样留，随之改。§2 请把它记作第五处逐字更换（4d），逐字给改前 ∥ 改后两行。

设计档不需要改：`DOC-DISCIPLINE.md` 的 D21 已写「判据面 = `docs/core/design/DOC-CHECK.md`；本节只列形态，不复述怎么数」。

### 设计评审裁定（2026-11-15 · 主 agent）

评审 `VERDICT: changes-required` · 🔴 1 · 🟡 6 · 🔵 2。逐条裁定如下；除第 8 条判「不是问题」外，其余本批修。

| # | 级别 | 裁定 | 处置方向 |
|---|---|---|---|
| 1 | 🔴 | 成立 | D 族两面在第 16 条分叉：设计档 `### D16 示例进围栏`，提示词面 `16.` 是「推断须标来源」；且设计档全档无「推断」这一条。方向 = 设计面是内容之家，编号也由设计面定（用户 2026-11-15 23:46 裁：「改一个模型每轮都在读的号并没有什么成本」——不存在「改模型在读的号成本更高」这回事）：设计档 D16 保持「示例进围栏」，另补 D22 = 推断（该条今天只在提示词面）；提示词面按新序重排，16 换成「示例进围栏」、推断那条移到 22。两面 22 条一一对应，条数句两处同改。 |
| 2 | 🟡 | 成立 | `DOC-CHECK.md` §8.5 先写「本档不另写一份数」，又写「over 800 半句」。改成按名字指那一分句，不重述数值。 |
| 3 | 🟡 | 成立 | §4.1 末句「这些是待修技术债」落在 D17 两种处置之外的第三态。改成 D17 第一种（代码写错了），删掉状态词。 |
| 4 | 🟡 | 成立 | §8.1 的 `依据` 引批档路径，撞 D10「交付物不引批档路径」。不改 D10；把依据改成不依赖一次性记录的形态。 |
| 5 | 🟡 | 成立 | D21 自称「本节只列形态，不复述怎么数」，随后又复述。二者去一：删掉自称，或把计数细节移进 `docs/core/design/DOC-CHECK.md` §2。 |
| 6 | 🟡 | 成立 | §7 实现落点缺两行：`thincoder-core/agent-tools/batch-tier-gate.mjs` ∥ `thincoder-core/agent-tools/batch-segment-vocab.mjs`。 |
| 7 | 🟡 | 成立 | §8.1「小标题是历史批档里最常见的一种写法」是没量过的最高级。改成点出实例。 |
| 8 | 🔵 | 不是问题 | 该档首行已写明「需求层 = `docs/core/requirements/ENGINEERING-MODE-V2.md` §13.1」；标题里的「要求」说的是内容类型，不是层归属。沿任一路径走都落到同一份。 |
| 9 | 🔵 | 知会 | 本批 RTM 增量住批档 §2，本次评审未绑定批档，故未验。记在此处，收口时按 §2 判。 |

**修面轮口径（设计席）**：按上表编号 1–7 逐条修，报告写「n → 改了什么，档 + 逐字原句」。`Suggestion` 列是评审建议，执行人是设计席，裁定已由主 agent 做完。

**本轮不做**：不写产品代码；不改提示词档（`thincoder-core/prompts/**` 归实施席，本轮只把目标文本写进 §2）；不动 `PARAGRAPH_MAX` 与判据阈值；不新增集成用例；不动 `#2473` 已定的六族豁免表设计。

### 十二 · 第二轮设计评审裁定（2026-11-15）

评审 `#6` 结论 `pass`：🔴 0 · 🟡 2（均标非阻断）· 🔵 3。上一轮唯一 🔴 已在设计面闭合——`D1–D22` 连号，`D16` = 示例进围栏、`D22` = 推断须标来源。

| # | 处置 | 依据 |
|---|---|---|
| 1 🔴 | 已修 | 两条规则各居一个号，节标题与条数同拍 |
| 2–7 🟡 | 已修 | 六处逐字落点见 §2 第五小节；`§8.1` 新依据落需求层 F5 定义段、`§7` 两行符号均在盘，我抽验成立 |
| 8 🔵 | 不修 | 标题「· 要求」是内容类型自述，首行已写明需求层指针，沿任一路径走都落到同一份 |
| 9 🔵 | 不修 | RTM 增量归 §2 判；本批零增量，收口时按 §2 复核 |
| 10 🟡 | 本批做 | 提示词面按新序重排正是 §2 实施内容（2a ∥ 2b ∥ 2c），不是设计缺陷 |
| 11 🟡 | 另立台账行 | `§8.5` 的「（待改）」缺处置，与 `§4.1` 已给的「处置 = 修代码」不对称；属设计面笔，冻结窗内不动 |
| 12 🔵 | 另立台账行 | §2 未载表体延续判据，而 D21 声明判据面是 §2；判据面指针缺一句 |

十条裁定全部接受。设计评审通过，实施按 §2 派 eng-coder。

## §2 批次任务与设计（eng-designer）
**状态行**：设计完成

### 本批条目（覆盖）

| 条目 | 改动面 | 落点档 |
|---|---|---|
| `#2473` | 判据代码 + 判据面一句 | `thincoder-core/doc-check/paragraph.mjs` ∥ `docs/core/design/DOC-CHECK.md` |
| `#2474` | 提示词面 + 设计档 | `thincoder-core/prompts/discipline-engineering.md` ∥ `docs/core/design/DOC-DISCIPLINE.md` |
| `#2475` | 设计档 | `docs/core/design/DOC-DISCIPLINE.md` |
| `#2476` | 提示词面（工具说明：标点 + 排除族） | `thincoder-core/prompts/knowledge/tool-doc-check.md` |
| `#2477` | 提示词面 | `thincoder-core/prompts/discipline-engineering.md` |

### 设计档落点

- `#2473`：设计档改一句（已落地 · 设计席）——D21「长而结构清晰的形态」那条里，标题行与引用块的说明原按面别分写，改成两面都不计入段。其余不动：豁免面该是什么 D21 已经写着，落后的只有代码。
- `#2473` 配套：判据面 `docs/core/design/DOC-CHECK.md` §2 第三条补全排除族（4c · 已落地 · 设计席）。
- `#2474`：`DOC-DISCIPLINE.md` 的 **D11** 补一句 D 族两份载体的分工。
- `#2475`：`DOC-DISCIPLINE.md` 的 **D21**「取判定跑诊断面」段换「依据」引文。
- `#2476` ∥ `#2477`：设计档无对应条文，只改提示词面。
- 评审修面（2026-11-15）：设计档补 D22 = 推断、D21 删自称；判据面 §8.5 ∥ §4.1 ∥ §7 ∥ §8.1 各一笔——逐字见 5-1～5-6。

### 机制设计：一张豁免表，两面共用

**现状**：`structuralExclusionLines` 只给表格 ∥ 列表 ∥ 缩进代码块打排除标；围栏行、围栏内行、引用行、标题行走早退，不打标。文档面的段循环另外自己认围栏、标题、引用三样；提示词面分支只读排除标，所以那三族在提示词面没有豁免。

**目标形**：`structuralExclusionLines` 把六族一起打标——围栏开启／闭合行与围栏内行、引用行、标题行，加上原有的表格 ∥ 列表 ∥ 缩进代码块。文档面段循环收缩成一句「排除行或空行 ⇒ 断段」，它自持的围栏状态机与标题 ∥ 引用判据删掉；提示词面分支一字不改，变的只是它读的那张表。

**为什么合成一张**：判据句的单源是 `docs/core/design/DOC-CHECK.md` §2 的第一条。两面差别只在「谁和谁并成一段」，不在「哪些行不算正文段落」；一张表加两条消费路径，正是这个差别的形状，两张表迟早各改各的。

**提示词面的族表不封口**：`DOC-CHECK.md` §2 那条提示词面判据只列三族，而正文段落一条列的是六族；「仍整体排除」说的是**整块**排除（与逐行判相对），没有把排除族封口到那三类。提示词面因此取六族。

**判据面补一句**：那三个名字在修前恰好等于代码在两面的排除集，句子当时说的是真话；代码补上围栏 ∥ 引用 ∥ 标题三族之后，句子不动就成了不完整描述。所以判据面改这**一句**，把排除族补到与正文段落一条同族（4c）；第一条 ∥ 第二条 ∥ 阈值 300 一字不动。

### 逐字更换（实施席照抄；点名符号，不点名行号）

#### 1. `thincoder-core/doc-check/paragraph.mjs`（`#2473`）

按符号落，三笔：

- `structuralExclusionLines`：围栏开启／闭合行、围栏内行、引用行、标题行一律置 `excluded[i] = true`；`inList` ∥ `inTable` ∥ `inIndentedCode` 的状态转移原样不动，早退分支只多打一个标。
- `paragraphHits` 的文档面段循环：判据收缩成 `if (excluded[i] || l.trim() === "") { flush(); return }`，删掉该循环内的 `fenceMark` ∥ `isFenceClose` ∥ `headingMark` ∥ `isQuoteLine` 直接引用——它们已由排除表承载。该循环的围栏状态变量一并删掉。
- 提示词面分支、`bodyLines`、`codeSpans` 一族：一律不动。

档头注释同步改：说明该表是两面共用的排除表，六族点名。注释里的「消费面只有两个」仍成立。

#### 2. `thincoder-core/prompts/discipline-engineering.md`（`#2474` ∥ `#2477`）

**2a 节标题与条数句**（三件同数，D3）：

```text
### Doc update discipline (D1–D17)          ⇒  ### Doc update discipline (D1–D22)
Each doc category has one landing route, and the doc system is maintained by discipline. Seventeen doc-update disciplines:
                                            ⇒  ...maintained by discipline. Twenty-two doc-update disciplines:
```

**2b 第 16 条换位**（评审 1 · 用户 2026-11-15 23:46 裁定）：提示词面按设计面新序重排——16 位换成「示例进围栏」，原 16 位那条（推断）移到末位 22。设计档 D16 保持「示例进围栏」不动，另补 D22 = 推断（逐字见 5-1）。

```text
16. **D16 a cell filled by inference says so** — a row, a coordinate or a count derived from a pattern — a title match, a neighbouring line, the shape of a row — is an inference, and it is written `inferred from …`, never as a reading.
    Why: a section number guessed off a title is how a dispatch sends readers to a section that held something else — the inference lands looking exactly like a reading taken that day.
⇒
16. **D16 an example goes in a fence** — a block example goes inside a fenced code block; an inline assumed name takes the angle-bracket placeholder form (e.g. `<area>/<name>.md`).
    Why: a fake path written in the body is a dangling pointer — the reader and the gate both treat it as real.
```

**2c 末条 D17 之后补五条**（18–21 顺次落；22 = 上面换下来的推断那条，逐字搬号。插在 D17 条目末尾与 `### Docs must be human-readable` 之间，形式照现有条目）：

```text
18. **D18 a document carries no line count** — a document never states how many lines it has, nor a size tier; line and size thresholds bind source and unit-test files only.
    Why: a line count is stale the moment anything above it changes, and a stale number costs the reader a judgement before they can trust it.
19. **D19 never point by line number** — to point at a place in a document, write that section's heading or quote the words; no line numbers, no "the third paragraph above".
    Why: a line number points at a position, not at the content, so one line inserted above sends the reader to another sentence.
20. **D20 a basis quotes its source verbatim** — when you write `依据 X`, what follows must be contiguous verbatim text from X: no paraphrase, no elision, no splicing. Without such a quote, write no `依据`.
    Why: a second-hand quotation reads perfectly reasonable — one hung a clause that did not exist on a document's name, one took a code comment for the contract.
21. **D21 the too-long verdict is taken from the diagnostic face** — judge a document's length with `doc_check` run in `mode` = `report`, which judges each named document whole.
    Why: the `gate` face judges only this batch's changed region, and with no batch record bound it prints a bare `PASS` and judges nothing — a writing standard taken off it measures nothing.
22. **D22 a cell filled by inference says so** — a row, a coordinate or a count derived from a pattern — a title match, a neighbouring line, the shape of a row — is an inference, and it is written `inferred from …`, never as a reading.
    Why: a section number guessed off a title is how a dispatch sends readers to a section that held something else — the inference lands looking exactly like a reading taken that day.
```

五条都写可执行的一句话规则，不带任何指向设计档的指针（用户 2026-11-15 22:38 原话：提示词面必须自足）。

`D21` 只承载提示词面「Docs must be human-readable」节没有的那一条——判「太长」取 `report` 面的判定。重写形态、判据挂工具、手造量尺三句该节已逐句在册，D 条不再复述（D2：同一份档里同一条规则不留两份活本）。`D18` ∥ `D19` ∥ `D20` 经核对在该节与 D1–D17 里都没有对应条，原样落。`D22` = 换下来的原 16 位那条，逐字搬号；设计面落点 = `docs/core/design/DOC-DISCIPLINE.md` 的 D22（见 5-1）。

**2d 面别限定**（`#2477`，只动这一句）：

```text
   Inserting blank lines, or breaking a line, is not that reorganization — the same word chain re-broken still reads as one long sentence, and on the doc face a blank line only hides the hit from the gate.
⇒
   On the doc face, inserting blank lines, or breaking a line, is not that reorganization — the same word chain re-broken still reads as one long sentence, and a blank line there only hides the hit from the gate.
```

末句的「on the doc face」改 `there` 是本笔唯一超出「加限定」的改动：同一句两次点名同一个面读起来是错的，改后语义不变。下面两条（文档面一条 ∥ 提示词面一条）一字不动。

#### 3. `thincoder-core/prompts/knowledge/tool-doc-check.md`（`#2476` · 上抛二裁定 · §1 记作 4d）

同一行两笔：句末悬空破折号前的句号删掉，提示词面的排除族补齐六族。排除族在那句中段，所以改前 ∥ 改后各给整句。

```text
A file under `thincoder-core/prompts/` is judged line by line instead, because there a newline is layout, not a paragraph break; table, list and code blocks remain excluded. 300 is a constant: no project setting changes it, and changing it is a code change. — the number sits in the tool, so run `doc_check` for the verdict instead of measuring a paragraph yourself.
⇒
A file under `thincoder-core/prompts/` is judged line by line instead, because there a newline is layout, not a paragraph break; headings, tables, lists, quote lines, fenced code blocks and indented code blocks remain excluded as whole blocks, not line by line. 300 is a constant: no project setting changes it, and changing it is a code change — the number sits in the tool, so run `doc_check` for the verdict instead of measuring a paragraph yourself.
```

族名沿用本行既有叫法（`headings` ∥ `quote lines`），新点出来的是 `fenced code blocks` ∥ `indented code blocks` 两个名。改后六族在提示词面整体排除、不逐行计——这正是 `#2473` 修成的行为，所以这句完整且为真；只删句号会留下一句真而不完整的话。

#### 4. `docs/core/design/DOC-DISCIPLINE.md`（`#2474` ∥ `#2475`）

**4a D11 补一句**（已落地 · 设计席，位置 = D11「要求」段与「为什么」段之间）：

```text
**D 族两份载体**：提示词面 `thincoder-core/prompts/discipline-engineering.md` 的 D 清单写可执行的一句话规则，且不指回本档——提示词面必须自足；本档写要求 + 为什么。同一条 D 在两处各有一份，改一条就同轮改两处。
```

**4b D21「取判定跑诊断面」段换「依据」**（已落地 · 设计席）：删掉原引的 `//` 注释，改引真正做判定的三行。落地形 = 一句话带「依据」+ 三条列表项（每段引文一条；列表项不计入段，整段因此不过 300 字）：

```text
依据 `thincoder-core/agent-tools/doc-check.mjs` 里真正做判定的三行，每段引文逐字连续，中间不删字、不改写：

- 「const bound = typeof ctx?.agent?._batchDoc === "string" && ctx.agent._batchDoc.trim() !== "" ? ctx.agent._batchDoc : null」
- 「const sha = bound ? baseShaOf(bound) : null」
- 「const regions = sha ? changedRegionsOf(root, sha, absDocs).regions : new Map()」

没有绑定就没有基线，`regions` 是空表，逐档没有条目。
```

三段引文各自逐字连续，中间不删字、不改写；结论句「没有绑定批档时它印一行裸 `PASS`、一档也没判」原样保留。

**4c `docs/core/design/DOC-CHECK.md` §2 第三条**（`#2473` 配套 · 已落地 · 设计席）：只补全排除族，其余一字不动。

```text
- 提示词面每行自成一界，因为提示词中的换行是版式，不是段落组织；表格块、列表块和代码块仍整体排除。
⇒
- 提示词面每行自成一界，因为提示词中的换行是版式，不是段落组织；标题行、表格块、列表块、引用块、围栏代码块和缩进代码块整体排除，不逐行计。
```

为什么改：修前那句的三个名字恰好等于代码在两面的排除集，所以它当时说的是真话；`#2473` 落地后围栏 ∥ 引用 ∥ 标题在提示词面也排除，那句不动就成了不完整描述，读者照它读会以为那三族照数。判据面与代码各说一句，正是本批要杀的病。

写法按 D17：只写目标态，不写「本批将」。第一条 ∥ 第二条 ∥ `PARAGRAPH_MAX` 一字不动。

#### 5. 评审修面的逐字落点（§1 裁定 1–7）

**5-1 评审 1（两面 22 条 1:1）** — `docs/core/design/DOC-DISCIPLINE.md` 新增一条，插在 D21 之后、`## 2. 边界（本档不写）` 之前；D16 保持「示例进围栏」不动：

```text
### D22 推断须标来源

**要求**：按形推出来的格子——顺着标题、邻行或行的形状补的值——是推断，写成 `inferred from …`，不写成读数。

**为什么**：靠标题猜出来的节号，会把一次派单送到写着别的内容的那一节；推断落到纸上，与当天真取到的那条读数一模一样。
```

同档节标题 `## 1. 文档更新纪律（D1–D21）` ⇒ `## 1. 文档更新纪律（D1–D22）`。提示词面 16 位换成「示例进围栏」、推断那条搬到 22，见 2b。

**5-2 评审 5（D21 自称删）** — 同档 D21 两笔：

```text
**长而结构清晰的形态不算太长，一个字都不要改**（判据面 = `docs/core/design/DOC-CHECK.md`；本节只列形态，不复述怎么数）：
⇒
**长而结构清晰的形态不算太长，一个字都不要改**（判据面 = `docs/core/design/DOC-CHECK.md`）：

- 表格行；无首尾竖线的表头由下一行的分隔行确认，表体延续到第一个无竖线的非空行
⇒
- 表格行——表体延续到第一个无竖线的非空行
```

去一取「删自称」：「表头由分隔行确认」判据面 §2 第一条已写着（D2），本节删掉重复的那句，留下 §2 没有的「表体延续到第一个无竖线的非空行」。§2 第一条本批一字不动（§1 边界），所以计数细节不搬过去。

**5-3 评审 2（§8.5 不重述数值）** — `docs/core/design/DOC-CHECK.md`：

```text
条里的 over 800 半句，改数值时看那一处。
⇒
条里那个讲收口线数值的分句，改数值时看那一处。
```

**5-4 评审 3（§4.1 第三态）** — 同档：

```text
这两项是待修技术债，不能按目标契约视为当前行为。
⇒
两项都是代码写错了，处置 = 修代码；§3 ∥ §4 的目标契约不改。
```

**5-5 评审 6（§7 落点补两行）** — 同档 §7 表，在 `batch-regions.mjs` 那行之后加两行：

```text
| `thincoder-core/agent-tools/batch-tier-gate.mjs` | 码档行数门：读数比对、越线方案判定与拒文（`assertTierPlan` ∥ `countContentLines` ∥ `FILE_CLOSE_MAX`） |
| `thincoder-core/agent-tools/batch-segment-vocab.mjs` | 机读清单解析：块头形 `machineListHeadOf` 与表行 `machineListRowsOf` |
```

**5-6 评审 7（§8.1 未量过的最高级）** — 同档：

```text
理由：小标题是历史批档里最常见的一种写法，只认粗体会让整块静默读成零行，下游再把零行说成「漏写了行」。
⇒
理由：需求层已定两形都认（`docs/core/requirements/DOC-CHECK.md` 给「机读清单」下定义的那一段）；只认粗体会让整块静默读成零行，下游再把零行说成「漏写了行」。
```

用需求层的定义段做依据，不点实例：实例只住在批档里，点它的路径撞 D10（与评审 4 同一条）。

### 测试覆盖（单元档，收口即删）

`docs/batches/2026-11-15-five-debts.test.mjs`，四个用例：

- **两面七形**：同一份七形文本，`promptFace` 取真取假各跑 `paragraphHits`，断言命中行号表。
- **正侧仍在**：400 字散文行两面都报；表格 ∥ 列表 ∥ 缩进代码两面都 `[]`。
- **变更区不跟着放宽**：传 `region` 时散文行仍报——豁免扩族不得把本批变更区的判据一并改掉。
- **文档面等价**：文档面七行读数 = 只有散文行一条（AC-3 的断言源）。

### 验收对照

| # | 判据 | 谁来判 | 怎么判 |
|---|---|---|---|
| AC-1（`#2473` 反侧） | 提示词面：围栏行 ∥ 围栏内行 ∥ 引用行 ∥ 标题行，修复后都是 `[]`；修复前有命中 | 实施席 ∥ 评审 ∥ 收口人 | 单元档跑两次：修复前红、修复后绿，两次读数进 §5 |
| AC-2（正侧） | 400 字散文行两面照报；表格 ∥ 列表 ∥ 缩进代码两面 `[]` | 评审 | 单元档 |
| AC-3（文档面不动） | 同一份七形文本的文档面读数，修复前后逐项相同 | 评审 | 单元档断言 |
| AC-4（提示词面全量） | `thincoder-core/prompts/` 下每份 `.md` 跑 `doc_check` `mode:report`，修复后的命中集合不含修复前没有的项 | 实施席 ∥ 收口人 | 修复前后各跑一遍，两份读数进 §5 |
| AC-5（D 族同数） | 节标题 `(D1–D22)` ∥ 条数句 `Twenty-two doc-update disciplines:` ∥ 末条编号 `22.` 三处同数；设计档节标题 `（D1–D22）` 同数 | 评审 | 读该节与设计档 §1 标题 |
| AC-6（`#2475`） | D21 的三段引文逐字存在于 `thincoder-core/agent-tools/doc-check.mjs`；`//` 注释那句不再作「依据」 | 评审 | 逐段在源码里搜一次 |
| AC-7（`#2476` · 4d） | 该行破折号前没有句号；提示词面那半句的排除族是六族并写明整块排除、不逐行计；`table, list and code blocks remain excluded` 已不在 | 评审 | 读该行，对照第 3 条的改后行 |
| AC-8（`#2477`） | 该半句带文档面限定；它下面两条面别规则一字不动 | 评审 | 读那一组 |
| AC-9（文档闸） | 四份文档 `doc_check` `mode:report` PASS：`docs/core/design/DOC-DISCIPLINE.md` ∥ `docs/core/design/DOC-CHECK.md` ∥ `thincoder-core/prompts/discipline-engineering.md` ∥ `thincoder-core/prompts/knowledge/tool-doc-check.md` | 实施席 ∥ 收口人 | 跑 `report` |
| AC-10（设计档与代码同拍） | `DOC-DISCIPLINE.md` 的 D21 形态条里，标题行与引用块的说明与代码行为一致（两面都不计入段） | 评审 | 读该条，对照 AC-1 |
| AC-11（判据面一句 · `#2473` 配套） | `DOC-CHECK.md` §2 里再没有「只列三族」的提示词面排除句：那一句的排除族与正文段落一条同族，六类整体排除 | 评审 ∥ 收口人 | 读那一句，并全档搜 `提示词面` 与三族名 |
| AC-12（评审 1 · 两面 1:1） | 两面 22 条逐号同题：16 = 示例进围栏、17 = 载体边界、22 = 推断；设计档 D16 仍是「示例进围栏」 | 评审 | 逐号读两档条目名 |
| AC-13（评审 2 · §8.5） | 「本档不另写一份数」之后那一句不含收口线数值；改数值靠条名与分句名定位 | 评审 | 读 §8.5 那条 |
| AC-14（评审 3 · §4.1） | 末句是「代码写错了，处置 = 修代码」，无「待修技术债」这类第三态 | 评审 | 读 §4.1 末句 |
| AC-15（评审 4 · §8.1） | `DOC-CHECK.md` 全档无 `docs/batches/` 命中 | 评审 ∥ 收口人 | grep 该串，命中数为零 |
| AC-16（评审 6 · §7） | §7 表含 `batch-tier-gate.mjs` ∥ `batch-segment-vocab.mjs` 两行 | 评审 | 读 §7 |
| AC-17（评审 5 · D21） | D21 无「本节只列形态，不复述怎么数」；表格那一项不再复述 §2 的表头判据 | 评审 | 读 D21 |
| AC-18（评审 7 · §8.1） | 表格形理由不含「最常见」这类未量的最高级，改指需求层定义段 | 评审 | 读 §8.1 块头段 |

### 受影响文件（机读清单）

```text
| 档 | 分拆方案 | 行数 |
|---|---|---|
| thincoder-core/doc-check/paragraph.mjs | — | 248 |
| docs/batches/2026-11-15-five-debts.test.mjs | — | 新 |
```

两档都不过设计时线，也不过收口线，第二列写 `—`。第三列 = 批起快照上该档的内容行数，量法 `countContentLines`，取数 `git show 96d99dd:thincoder-core/doc-check/paragraph.mjs`；单元档快照里没有，写 `新`。

### 集成面 delta（对 `test/RTM.md`）

**零行**：本批改写零个用例、删除零个用例、新增零个用例。理由两条——`test/RTM.md` 全档搜 `doc-check` ∥ `doc_check` ∥ `文档门` 零命中，没有一条用例断言本工具的行为，因此没有用例会被破坏；且本批五条都是自检债，既无业务场景可引，也不是生产问题。

### 关键决策

- **豁免表一张、两面共用**（否决：给提示词面分支另加三条判据）——同一条规则两张表，迟早各改各的。
- **提示词面保留「每行自成一段」只扩豁免族**（否决：让提示词面改用文档面并段判法）——那会改掉 D21 与 `DOC-CHECK.md` §2 的现成结论。
- **`#2476` 同一行两笔：删句号 + 排除族补齐六族**（否决：只删句号）——只删句号留下一句真而不完整的话，而让它不完整的是本批自己的修复；提示词面是模型唯一读到的那一面，留着等于把刚杀的病换个地方养。
- **D18–D22 不带指针**——用户 2026-11-15 22:38 已裁提示词面自足；写成可执行的一句话规则。
- **设计档补 D22 = 推断，D16 不动**（否决：把设计档 D16 改成推断、示例进围栏搬到 D22）——用户 2026-11-15 23:46 裁定：编号由设计面定，已在读的号不重排；提示词面按设计面新序重排，两面 22 条 1:1。

### 本批不做（边界）

- 不动 `PARAGRAPH_MAX` 与需求档；`docs/core/design/DOC-CHECK.md` 改 §2 第三条那一句（4c）与 §8.5 ∥ §4.1 ∥ §7 ∥ §8.1 各一笔（5-3～5-6）——第一条 ∥ 第二条 ∥ 阈值 300 一字不动。
- 不动 `thincoder-core/doc-graph/anchors.mjs` 与 `bodyLines` 的判域。
- 不新增集成用例；不把 D 族改成指针。

### 上抛项

- `[上抛·知会]` `DOC-CHECK.md` §2 那条提示词面判据的读法：已裁——「仍整体排除」= **整块**排除，没把排除族封口到那三类；判据面因此只改那一句（4c），边界随之松一格。
- `[上抛·知会]` `docs/core/design/PROMPT-SYSTEM.md` 已无 D 族计数句（搜 `D-PS16` ∥ `提示词清单` ∥ `D1–D` 零命中），本批不动它；`#2474` 的计数面只有提示词档自身三处。
- `[上抛·知会]` 评审 1 的方向改过一次：先按「设计档 D16 = 推断、示例进围栏移到 D22」落过一版，用户 2026-11-15 23:46 裁定「编号由设计面定」后已翻回——设计档 D16 不动、补 D22 = 推断，提示词面按新序重排。两处设计档的现行形以 5-1 ∥ 2b 为准。

### 修前基线（设计席实测，供 §5 对照）

`execute` 直连 `paragraphHits`，同一份七形文本两面各跑一遍（每形 400 字；量法 = 该函数返回值）：

| 形态 | `promptFace: true` | `promptFace: false` |
|---|---|---|
| 散文行 | 命中 400 | 命中 400 |
| 围栏块（块内那行） | 命中 400 | `[]` |
| 引用行 | 命中 402 | `[]` |
| 标题行 | 命中 403 | `[]` |
| 表格行 ∥ 列表项 ∥ 缩进代码行 | `[]` | `[]` |

AC-1 的红侧在修前成立：三族在提示词面照报。修复后那三行必须变 `[]`，其余四行一字不变。

另：本批四档里的两份提示词档，修前 `doc_check` `mode:report` 已经 PASS，直连 `promptFace: true` 也是 `[]`——它们的超 300 字行全是列表项与懒惰续行，本就在豁免里。AC-4 的「命中集合不得新增」因此从空集起算，收口时照旧要跑全区。

## §3 设计评审（评审子代理）
**状态行**：评审通过



### 轮次 1（评审子代理）

**结算**：未签发（no-valid-echo）· 2026-11-15

    | # | Severity | Status | Evidence |
    |---|----------|--------|----------|
    | 1 | 🔴 | New | `DOC-DISCIPLINE.md` "### D16 示例进围栏" + "同一条 D 在两处各有一份" vs `discipline-engineering.md` "16. **D16 a cell filled by inference says so**" |
    | 2 | 🟡 | New | `DOC-CHECK.md` §8.5 "本档不另写一份数" vs "over 800 半句" |
    | 3 | 🟡 | New | `DOC-CHECK.md` §4.1 "这两项是待修技术债" vs `DOC-DISCIPLINE.md` D17 "没有第三种" |
    | 4 | 🟡 | New | `DOC-CHECK.md` §8.1 "依据 docs/batches/2026-11-12-ledger-query-default-limit.md" vs D10 "不引批档路径" |
    | 5 | 🟡 | New | `DOC-DISCIPLINE.md` D21 "本节只列形态，不复述怎么数" vs "表体延续到第一个无竖线的非空行" |
    | 6 | 🟡 | New | `DOC-CHECK.md` §7 table missing `batch-tier-gate.mjs` / `batch-segment-vocab.mjs` |
    | 7 | 🟡 | New | `DOC-CHECK.md` §8.1 "小标题是历史批档里最常见的一种写法" |
    | 8 | 🔵 | New | `DOC-DISCIPLINE.md` "本档只写**要求**" vs document map row "文档纪律 | — | `core/design/DOC-DISCIPLINE.md`" |
    | 9 | 🔵 | New | `DOC-CHECK.md` §11 "它们当前批次的施工账，写在批档 §2" — unverified |
    本轮未回显有效 token（评审回执不完整）
    计数：🔴 1 · 🟡 6 · 🔵 2 · 未标 0


### 轮次 2（评审子代理）

**结算**：已签发（pass）· 2026-11-15

    | # | Severity | Status | Evidence |
    |---|----------|--------|----------|
    | 1 | 🔴 | Fixed | `DOC-DISCIPLINE.md` "### D16 示例进围栏" + "### D22 推断须标来源" under "## 1. 文档更新纪律（D1–D22）" |
    | 2 | 🟡 | Fixed | §8.5 "那个讲收口线数值的分句" + "原文归提示词档自己，本档不转录。" |
    | 3 | 🟡 | Fixed | §4.1 "两项都是代码写错了，处置 = 修代码" |
    | 4 | 🟡 | Fixed | §8.1 "需求层已定两形都认（`docs/core/requirements/DOC-CHECK.md` 给「机读清单」下定义的那一段）" |
    | 5 | 🟡 | Fixed | D21 "表格行——表体延续到第一个无竖线的非空行"（自称句已删）；§2 "无首尾竖线的表格由表头与分隔行共同确认" |
    | 6 | 🟡 | Fixed | §7 "`thincoder-core/agent-tools/batch-tier-gate.mjs`" / "`batch-segment-vocab.mjs`" rows |
    | 7 | 🟡 | Fixed | §8.1 "理由：需求层已定两形都认" |
    | 8 | 🔵 | Unfixed | "文档纪律（DOC-DISCIPLINE）· 要求" / "本档只写**要求**" |
    | 9 | 🔵 | Unfixed | §11 "它们是当前批次的施工账，写在批档 §2。" — unverified |
    | 10 | 🟡 | New | `discipline-engineering.md` "### Doc update discipline (D1–D17)" / "16. **D16 a cell filled by inference says so**" |
    | 11 | 🟡 | New | §8.5 "**满足形的实现缺口（待改）**：`planGapOf` 今天只校验第二列非空" |
    | 12 | 🔵 | New | D21 "表体延续到第一个无竖线的非空行" vs §2 (no such rule) |
    VERDICT: pass
    计数：🔴 1 · 🟡 8 · 🔵 3 · 未标 0

## §4 用户批准（主 agent）

**批准依据 = 用户 2026-11-15 的批级授权，不是一次单独的「开始实施」回合。**

- **已定决定**：五条债一并处理，本批自动推进到收口，中途不再逐步请批 · 用户原话：「这五条债也都处理掉吧」 · 时间：2026-11-15 23:25
- **已定决定**：D 族编号由设计面定，改模型每轮都在读的号不算成本 · 用户原话：「改一个模型每轮都在读的号并没有什么成本！」 · 时间：2026-11-15 23:46
- **已定决定**：判据面只改 §2 第三条那一句，其余与阈值不动 · 用户原话：「可以」（针对我提的三处岔口与边界） · 时间：2026-11-15 22:41

设计评审 `#6` 通过（🔴 0），实施按 §2 派 eng-coder，designId 与 token 取自该轮评审签发。

## §5 实施记录（eng-coder）
**状态行**：实施完成



### 实施摘要

本席写域四档全部落地。§2「逐字更换」1–3 照抄落盘；「4」与「5」（设计档 `DOC-DISCIPLINE.md` ∥ 判据面 `DOC-CHECK.md` 的 4a ∥ 4b ∥ 4c ∥ 5-1～5-6）由设计席早前落盘，本席只读核对、未改一笔。

- `thincoder-core/doc-check/paragraph.mjs`：`structuralExclusionLines` 扩成两面共用的六族整行排除表——围栏开启∥闭合行、围栏内行、引用行、标题行一律置 `excluded[i] = true`，`inList` ∥ `inTable` ∥ `inIndentedCode` 的状态转移原样未动；`paragraphHits` 的文档面段循环收缩为 `if (excluded[i] || l.trim() === "") { flush(); return }`，环内对 `fenceMark` ∥ `isFenceClose` ∥ `headingMark` ∥ `isQuoteLine` 的直接引用与围栏状态变量 `fence` 一并删除；提示词面分支、`bodyLines`、`codeSpans` 一族零改；档头注释补「整行排除表由两面共用（六族点名）」一段，原「消费面只有两个」保留。
- `thincoder-core/prompts/discipline-engineering.md`：节标题 `### Doc update discipline (D1–D22)` ∥ 条数句 `Twenty-two doc-update disciplines:` ∥ 末条 `22.` 三件同数；16 位换成 D16「示例进围栏」，原推断那条搬到 22；D18–D21 四条逐字落位（D17 条目末尾与 `### Docs must be human-readable` 之间）；`#2477` 那半句改成 `On the doc face, inserting blank lines, …`、末句 `on the doc face` 改 `there`，其下两条面别规则一字未动。
- `thincoder-core/prompts/knowledge/tool-doc-check.md`：同一行两笔——破折号前的句号删除；提示词面排除族补到六族并写明 `as whole blocks, not line by line`。
- `docs/batches/2026-11-15-five-debts.test.mjs`（新建 · 收口即删）：四用例照 §2「测试覆盖」；第二例内含本席追加的一笔（见「清单外交付」）。

### 验收读数

命令 ∥ 量法 ∥ 结论；绝对值留在本段与命令输出（D12）。

| # | 判据 | 命令 / 量法 | 读数 |
|---|---|---|---|
| AC-1 红侧 | `node --test docs/batches/2026-11-15-five-debts.test.mjs`，改代码**之前**跑 | `pass 2 / fail 2`；提示词面命中行 = 3（围栏开启行，403 字）∥ 4（围栏内行，400）∥ 7（引用行，402）∥ 9（标题行，402） |
| AC-1 绿侧 | 同上，改代码**之后**跑 | `pass 4 / fail 0`；提示词面只剩 `[{line:1,len:400}]` |
| AC-2 正侧 | 单元档第二例 | 400 字散文两面照报；表格 ∥ 列表 ∥ 缩进代码两面 `[]`；追加的两行 200+200 并段：文档面报 400、提示词面 `[]` |
| AC-3 文档面不动 | 旧模块（`git show 96d99dd:thincoder-core/doc-check/paragraph.mjs`，经 `data:` URL 载入，不落盘）对新模块，逐份比对全仓 `.md` 的 `paragraphHits(..., {promptFace:false})` | 比对 851 份，`diffs = 0` |
| AC-4 提示词面全量 | `doc_check` `mode:report`，`thincoder-core/prompts/**` 全 99 份 `.md`，修前 ∥ 修后各一遍 | 修前 `DOC-CHECK GATE: PASS`（命中集合空）；修后 `DOC-CHECK GATE: PASS`（命中集合空）⇒ 无新增项 |
| AC-4 旁证 | 同批 99 份直连 `paragraphHits(..., {promptFace:true})`，新旧模块各跑一次 | 旧 0 条 ∥ 新 0 条，`changedFiles = []` |
| AC-5 同数 | 读该节与 `DOC-DISCIPLINE.md` §1 标题 | `(D1–D22)` ∥ `Twenty-two doc-update disciplines:` ∥ `22.` ∥ 设计档 `（D1–D22）`，四处同数 |
| AC-7 / AC-8 | 读 `tool-doc-check.md` 该行与 `discipline-engineering.md` 那一组 | 破折号前无句号；六族整块排除句在位；限定句带 `On the doc face`，其下两条面别规则原文未动 |
| AC-9 文档闸 | `doc_check` `mode:report`，四档（两设计档 + 两提示词档） | `DOC-CHECK GATE: PASS` |
| AC-10 / AC-11 / AC-15 | 读 D21 形态条与 `DOC-CHECK.md` §2 第三条；`grep docs/batches/` 于该档 | D21「两面都不计入段」与代码同拍；§2 第三条六族整块排除在位；`docs/batches/` 零命中 |
| 代码面回归旁证 | `doc_check` `mode:report` 另外六份大档（`DOC-CHECK.md` ∥ `DOC-DISCIPLINE.md` ∥ `docs/README.md` ∥ `AGENTS.md` ∥ `METHODOLOGY.md` ∥ `CODE-TIER.md`） | 全 `PASS`：文档面未因本批新增命中 |

AC-6 ∥ AC-12 ∥ AC-13 ∥ AC-14 ∥ AC-16 ∥ AC-17 ∥ AC-18 落在设计档，本席只读核对：5-1～5-6 六处与 D22 条目均在位，`//` 注释不再作「依据」。

### 审计、评审轮次与终态

- **内部分歧审计（explore 子代理，1 轮）**：结论 `CLEAN`；13 项逐条判「落」，超清单改动 0、偏离 0。它自报工具集无 `execute`，单元档未亲跑，按代码路径推演与本段读数一致。
- **代码评审（advisor `type:"code"`，1 轮）**：`VERDICT: pass` · 🔴 0 · 🟡 1 · 🔵 3。
- **修轮 1（评审后自修）**：
  - 🟡（批档 §5 一个字都没有，AC-1 ∥ AC-4 点名的读数无处可查）⇒ 本段即落地，三组读数已入上表。
  - 🔵「判据收缩后剩下的唯一状态逻辑（`cur.len` 累加）无覆盖」⇒ 第二例内补两行 200+200 并段断言，重跑 `pass 4 / fail 0`。
  - 🔵「第四例与第一例的文档面断言逐字重复」⇒ **不改**：§2「测试覆盖」点名四用例且第四例写明「AC-3 的断言源」，删掉或改形都是对已批准设计的偏离；AC-3 的「修前 = 修后」由本席用旧模块逐份比对 851 份 `.md` 取证（`diffs = 0`），不靠单测自证。
  - 🔵「`so the gate measures every line on its own` 与本批扩族有张力」⇒ **不改**，转上抛（见下）。
- **终态**：`clean`。

### 清单外交付（逐条原因）

1. `docs/batches/2026-11-15-five-debts.test.mjs` 第二例内追加两行并段断言——评审 🔵 指出判据收缩后唯一剩下的状态逻辑无覆盖；补的是断言，用例数仍是四。
2. `paragraph.mjs` 文档面循环上方一行就地说明注释（「排除行与空行都断段……」）——§2 只要求档头注释同步改，这行与档头同义，供读循环的人一眼看到判据去处。
3. **未动**：`discipline-engineering.md` 的 `so the gate measures every line on its own`——该句在本批之前就已不精确（旧描述同样声明表格 ∥ 列表 ∥ 代码块在该面豁免），更正句就在同节上方；改一句不在 §2 逐字清单内的规范句属设计面笔，转上抛。

### 落地核对

**落地核对：无**

### 上抛与线索

- `[上抛·知会]` 评审 🔵 4 未修：`thincoder-core/prompts/discipline-engineering.md` 的 `so the gate measures every line on its own` 与本批扩族后的事实有轻微张力（该面六族整行不计），建议随下次改那一节时加限定（如 `every prose line`）。
- `[上抛·知会]` §2「4」∥「5」的设计档落点（`docs/core/design/DOC-DISCIPLINE.md` ∥ `docs/core/design/DOC-CHECK.md`）由设计席落盘，本席只读核对在位，未改一笔。
- 本席侧未发现需另立台账行的新债；集成面按 §2 为零行（本批无业务场景、无生产问题可引）。

## §6 验证与收口（父代理）

### 父代理独立复跑（不采信实施席读数，全部自己跑一遍）

| 判据 | 我的命令 / 量法 | 读数 |
|---|---|---|
| 单测红绿 | `node --test docs/batches/2026-11-15-five-debts.test.mjs` | `pass 4 / fail 0` |
| 红侧真红 | 用批起快照的旧模块（`git show 96d99dd:thincoder-core/doc-check/paragraph.mjs` 取出后直连）与工作树新模块跑同一组七形探针 | 旧：围栏内行 ∥ 引用行 ∥ 标题行在提示词面各报一条；新：三条全 `[]`；散文两面照报 400 |
| 文档面等价 | 逐份比对全仓 606 份 `.md` 的 `paragraphHits(..., {promptFace: false})`，新旧模块 | `diffs = 0` |
| 提示词面无新增 | 同 606 份跑 `promptFace: true`，新旧对比 | 30 份命中数下降，0 份上升 |
| 文档闸 | `doc_check` `mode:report` 四档（两设计档 + 两提示词档） | `DOC-CHECK GATE: PASS` |
| 同数（D3） | 读该节标题、条数句、末条编号、设计档节标题 | `(D1–D22)` ∥ `Twenty-two doc-update disciplines:` ∥ `22.` ∥ `（D1–D22）`，四处同 |
| 排除族句 | 读 `tool-doc-check.md` 的段落判据条 | 悬空句号已除；六族 `as whole blocks, not line by line` 在位 |

红侧是用**真旧模块**取的，不是叙述：同一组探针换模块即翻面，说明变的是判据本身，不是用例口径。

### 上抛裁定

实施席转上抛的那句 `so the gate measures every line on its own`——**不是缺陷，不改**。

那句说的是判段单位（一行，不是一段），不是「每一行都会被报」；同一组四条之前已明写「长而结构清晰不算太长——围栏、表格行、列表项、标题、引用块按结构读」。整节连读即完整。它没有自行改动规范句、而是转上抛，处置正确。

### 落地核对

**落地核对：无**——§5 已记，我核对设计档六处（4a ∥ 4b ∥ 4c ∥ 5-1～5-6）与 D22 条目均在位，本批落地未让任何设计档句子失真。

### 文档闸

`doc_check` `mode:report` 四档 `PASS`（见上表）。本批无 `mode:gate` 变更区可绑定（批档不入判域），未拿裸 `PASS` 充作通过。

### 集成面

RTM 增量为零：本批改的是文档判据的排除面与提示词规则文本，无业务场景、无生产问题可引作集成用例。`test/RTM.md` 无 doc-check 族断言，既有套件不受影响。未做集成验证——父代理侧收口跑是唯一一次集成跑。

### 新债

本批新债 2 条 + #2478 [#2479]，均来自设计评审第二轮（`§8.5` 缺口无处置 ∥ §2 缺表体延续判据），两条都是「条件」型，条件句在各自 `resume_when`。

### 收口动作

单测档 `2026-11-15-five-debts.test.mjs` 收口即删（零留存），台账 #2473 ∥ #2474 ∥ #2475 ∥ #2476 ∥ #2477 随本批一笔结算。
