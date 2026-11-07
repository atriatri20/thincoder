# 2026-11-07 · value-over-speed
> 六段，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 每段只有一个作者：作者的段可 `append` 加内容、可就地改（`edit`）；非作者一概拒。
> 编制：主 agent · 2026-11-07 · 来源 = 用户 2026-11-07 12:23「我的想法是把不要省token和做好&gt;做全&gt;做快的价值取向进提示词系统」+ 12:24「开」。
> 台账 = #2133（PROMPT-SYSTEM · 归批）。前情 = 无（独立批）。
## §1 讨论（主 agent）
**状态行**：已收口 2026-11-07
<§1 模板占位：本批条目 / 关键判据 / 授权口径>

### 需求：把「不省 token」与「做好 > 做全 > 做快」写进公共层

- **已定决定**：价值取向入提示词系统，落 `common.md`（两模式共用），措辞与落点按父侧 12:24 提议原样。 · 用户原话：「我的想法是把不要省token和做好>做全>做快的价值取向进提示词系统。」「开」 · 时间：2026-11-07 12:23 ∥ 12:24

### 现状实读（不是设想）

提示词面**已有半条**，缺三样：

| 已有 | 位置 |
|---|---|
| 「No step is cut for speed: you are faster than the human already, so speed was never the bottleneck」 | `thincoder-core/prompts/common.md` |
| 「Correctness first. Rushing gets paid back in rework, so speed is not the bottleneck.」 | 同档「When choices conflict」段 |

| 缺 | 说明 |
|---|---|
| **「做全」这一层** | 现有只排了「质量 > 速度」，**没有「完整性」的位置** |
| **「不省 token」** | 一个字都没有 |
| **反面清单** | 只有「不许为速度跳步」，**没有「不许拿『省』当理由收窄范围 ∥ 抽样代替全量 ∥ 跳过核验」** |

### 立法理由（必须写进提示词的那一段，不是注释）

**今天一天内，同一个形状出现了四次**，每次的公开理由都是「效率」：

| 做法 | 披着的理由 | 真实代价 |
|---|---|---|
| 收窄射程把三档移出 | 「语义修复不属本批」 | 下一批碰这三档照样撞 |
| 抽样 60–80 处再定切法 | 「先看分布再定」 | 用抽样代替了全量判断 |
| 让实施席「写完就报，不要多轮核验」 | 「父侧收敛指令」 | `#16` ∥ `#24` 的内部审计环被跳过，而评审当场抓出竞态 |
| 不派新的文档面工作 | 「会被拦，纯属浪费」 | 待办原地不动，问题没变少 |

**⇒ 这条不写进去，下一个会话会重演全部四次。**它不是风格问题，是**决策排序问题**。

### 要落什么（两处）

1. **`thincoder-core/prompts/common.md`**：一条价值条目 + 两条推论 + 一条反面清单（**逐字由设计席定稿，父侧给的是草案**）。
   - 核心句：**做好 > 做全 > 做快**——质量第一、完整第二、速度第三。
   - 为什么：你本来就比人快，速度从不是瓶颈；快出来的错要用返工还，比慢更贵；**而做全了做坏，等于把错误铺满整个交付面**。
   - 推论 ①：能做的都做完；做不完的当场说清（哪些没做、为什么、代价是什么）——**不许用「这个不做也行」把范围悄悄缩掉**。
   - 推论 ②：**不许拿「省」当理由**——省 token ∥ 省轮次 ∥ 省一遍核验，都不是省略信息、跳过检查、或用抽样代替全量的理由。
   - 反面：以效率为名收窄射程 · 抽样代替全量 · 跳过核验环 · 把没做的说成「不适用」。
2. **`docs/core/requirements/PROMPT-SYSTEM.md`**：一条功能需求，判据 = 上述两串在提示词面**逐字存在**（父侧笔，本批前落）。

### 为什么落 `common.md` 而不是 `persona-engineering.md`

这是**协作基础**，不是某个角色的职责。**普通模式里同样会为了省而收窄范围**——放进角色层，非工程模式就拿不到。

### 边界（不做）

- **不改已有的两句**（`No step is cut for speed` ∥ `Correctness first`）——它们与新条不冲突，**新条补的是「完整性」与「省」这两层**，不是替换。
- **不新增判据机检**（这是价值取向，不是可机检的行为阈值；判据只到「逐字存在」这一层）。
- **不写进 tool-docs / 子代理人格**（先落公共层，观察一版再说；位置扩散 = 四份副本各自漂）。

## §2 批次任务与设计（eng-designer）
**状态行**：设计完成（条目 1 · 落点 = docs/core/design/PROMPT-SYSTEM.md §6.75 · 判据双形已裁 · 上抛 0 条）
<§2 模板占位：本批条目（覆盖） / 设计档落点 / 机制设计 / 受影响文件与测试覆盖 / 验收对照 / 关键决策 / 上抛项>

### 本批条目（覆盖）

| # | 条目 | 需求档（判据本体） | 设计档（机制 + 逐字块 + 验收） | 台账 |
|---|---|---|---|---|
| 1 | 资源观入公共层：**成本排序（用户的时间 ≫ 返工成本 ≫ token）** · **做好 > 做全 > 做快** | `docs/core/requirements/PROMPT-SYSTEM.md` §2.9（含范围边界与落点） | `docs/core/design/PROMPT-SYSTEM.md` §6.75 | #2133 |

**条目 1 的验收口径不写在这里**——判据本体 = `docs/core/design/PROMPT-SYSTEM.md` §6.75 的 A1–A8 表，本节只指路（D10：批档指针随批档消失，判据要住设计档）。

### 本批不做

- 提示词面其余各档（`thincoder-core/prompts/` 下另 16 档）与 `thincoder-core/tool-docs/**`、子代理人格——需求档 §2.9 范围边界已定「先落公共层观察一版」。
- 不新增机检阈值、不改 `doc_check` 判据（价值取向不可机判；§6.75 K6）。
- 不改既有两句（`No step is cut for speed` ∥ `Correctness first`）——§6.75 A3 判它。
- 不改需求档 §2.9 本体（主 agent 笔域）。

### 实施席的动作（一处落笔）

1. 读 `docs/core/design/PROMPT-SYSTEM.md` §6.75 的「逐字终稿」围栏块，**整行照落** `thincoder-core/prompts/common.md`。
2. 插入位 = §6.75 A2 钉的两个引文锚之间：`## When choices conflict` 节末条之后、`## Instruction precedence — on conflict, in this order, high to low` 之前。
3. 落完之后再跑 §6.75 A1–A7 的读数与 A8 交付门。

顺序为什么是这个方向：门与读数判的是**盘上的档**，先跑读数再落字，读到的就是改前那一版，那一轮等于白跑（§6.74 同轴）。

### 受影响文件与分层结论

| 档 | 面 | 本笔归谁 |
|---|---|---|
| `thincoder-core/prompts/common.md` | 产品代码面（提示词 = 运行时面） | 实施轮 eng-coder 落 |
| `docs/core/design/PROMPT-SYSTEM.md` §6.75 | 文档面（设计） | 本席，已落 |
| `docs/core/requirements/PROMPT-SYSTEM.md` §2.9 | 文档面（需求） | 主 agent，本批前已落，本批零改 |
| 测试档 | — | **0**（零代码面） |

**分层结论 = 无档跨分层**。

### 验收回指

本批验收 = `docs/core/design/PROMPT-SYSTEM.md` §6.75 的 A1–A8。收口加两条核对：① 该档 A3（`git diff` 零删改：新条补「谁贵谁贱」，不替换）；② 需求档 §2.9 ∥ 本节条目 ∥ §6.75 三向同源（一条需求，三处指同一个东西）。

### 关键决策（回指）

`docs/core/design/PROMPT-SYSTEM.md` §6.75 的 K1–K6。与父侧直接相关的两条：

- **K1** 新增 `##` 一节（不是增列进 `## When choices conflict`）——`##` +1、`###` +0，绝对数住 §5。
- **K2** 判据按双形读：中文逐字住需求档 §2.9、英文逐字住提示词面、译文由 §6.75 围栏块锁。承 §6.74 K2（父侧 11:32 裁定）与 §6.30（提示词面散文一律英文）。

### 上抛项

1. 〔已裁 · 已对齐〕需求档 §2.9 的判据句已按**双形判**写定（中文住需求档、英文住提示词面、译文由 `docs/core/design/PROMPT-SYSTEM.md` §6.75 围栏块锁）——判据措辞问题已不在待裁位，评审按 §6.75 A7 逐段指认判。

### 收尾轮：§5 三条判据冲突 + 一条内部评审提示的处置（2026-11-07）

**判据冲突 ①（A6 ∥ A1 不可同真）** ⇒ 裁 A1 赢，父侧裁。`docs/core/design/PROMPT-SYSTEM.md` §6.75 的 A6 删掉「条目之间空行分隔」子句，改为正向陈述：条目连续排布、条目之间零空行、块内唯一空行 = 节标题之后那一行（与 `thincoder-core/prompts/common.md` 既有各节同形）；其余四判不动（五条顶格 ∥ 每条一 `Why:` ∥ 第 5 条四个子条目 ∥ 无复述）。

**判据冲突 ②（A7 机判「每串 ⇒ 1」，实读 2）** ⇒ 根因 = 需求档 §2.3 第 4 行逐字复述了 §2.9 的五串（同一段内容两处逐字，违单源）；父侧已把该行改为不含五串的提要。本轮实跑复核（`node` 逐串计数，判域 = 需求档整档）= 五串各 **1**（`§2.3` 段内 0 ∥ `§2.9` 段内 1）⇒ A7 判据原文不动，不改成 2。

**判据冲突 ③（「计数连带（D3）」写成已完成状态）** ⇒ `docs/core/design/PROMPT-SYSTEM.md` §6.75 该段整段重写：删去「两处都欠账」，改为陈述同步面（需求档 §2.3 的节标题数与大纲表行数）与为什么必须同步；判法 = `thincoder-core/prompts/common.md` 的 `##` 节数 ∥ §2.3 标题写的数 ∥ 大纲表行数，三者相等（本轮读数三者相等）。落点表的需求档行与偏离 ④ 的连带项措辞随同改，不再读作欠账。

**内部评审问（新节第 3 条 `Why:` 与 `No step is cut for speed` 从句逐字重合）** ⇒ 父侧裁保留：两条不是同一件事（一条禁「为速度砍步骤」，一条排「什么贵什么贱」），共享锚是刻意的关键锚点重复（需求档 §4 B10）。裁定与理由落 `docs/core/design/PROMPT-SYSTEM.md` §6.75 对照表「为何不冲突」格，免得下一位当作冗余合并。

**写面**：`docs/core/design/PROMPT-SYSTEM.md` §6.75（本席）∥ 批档 §2（本段）。`thincoder-core/prompts/**`、需求档、§1 ∥ §3 ∥ §5 本轮零改。交付门读数 = `doc_check(mode:"gate", docs:["docs/core/design/PROMPT-SYSTEM.md"])` 首行 `DOC-CHECK GATE: PASS`，结论行「0 段有问题（1 档全清）」。

## §3 设计评审（评审子代理）
**状态行**：评审通过



### 轮次 1（评审子代理）

**评审对象**：`docs/core/design/PROMPT-SYSTEM.md` §6.75 资源观入公共层（成本排序）· 对象状态 待评审

| # | 严重度 | 状态 | 证据 |
|---|---|---|---|
| 1 | 🔴 | 待处置 | 先例行只列 §6.74 ∥ §6.25；未提被偏离的档末形面（§6.25「**移档末**（沿 D-PS30 裁定——§N 零漂移）」∥ D-PS39「被否 = 新增 `##` 节（块计数连带 + 公共层节表受需求档锁定）」）；落点表却写「已落（父侧笔）——本节对本档零改」 |
| 2 | 🟡 | 待处置 | 「立法理由」表四行各注「= 反面清单第 1/2/3/4 条」，K3 写「当天四次实撞分属其中三条」；第 4 行「不派新的文档面工作」与第 4 条形状「把没做的说成「不适用」」不同形 |
| 3 | 🟡 | 待处置 | A8 的 `doc_check` 只判 `docs/core/design/PROMPT-SYSTEM.md`，落地档 `thincoder-core/prompts/common.md` 不在判域（§6.74 A6 三档齐判） |
| 4 | 🟡 | 待处置 | A3「`git diff` 该档只有新增行（无 `-` 行）」= 整档判、无基线 |
| 5 | 🟡 | 待处置 | A2 ∥ 勘察证据行「落点位置实读」的插入位引文以 `…` 截断，不可核 |
| 6 | 🟡 | 待处置 | 「RTM 近面」只写「`test/RTM.md` 已读」，无读数、无点名故事（§6.8「RTM 读数」有段 ∥ 故事 ∥ 表行数） |
| 7 | 🔵 | 待处置 | 用例表 C4「抽样只为定量级」是四条形状里唯一无现场的一条 |
| 8 | 🔵 | 待处置 | 「受影响文件与分层结论」把 `thincoder-core/prompts/common.md` 记作「产品代码面」，未点 `.md` 免档位判定 |

计数：🔴 1 · 🟡 5 · 🔵 2

VERDICT: changes-required

### 轮次 2（评审子代理）

**评审对象**：`docs/core/design/PROMPT-SYSTEM.md` §6.75 资源观入公共层（成本排序）· 待评审 · 轮 2（复验轮 1 八条）

| # | 严重度 | 状态 | 证据 |
|---|---|---|---|
| 1 | 🔴 | 已修 | 偏离 ④「落点形 = 中段插入一个 `##` 节——被明文否决过的形，理由与代价都写在明处」，点名 D-PS22 ∥ D-PS30 ∥ D-PS36 与 D-PS39「被否 = 新增 `##` 节（块计数连带 + 公共层节表受需求档锁定）」；并新立「计数连带（D3）」节 |
| 2 | 🟡 | 已修 | 表第 4 行改注「= 反面清单第 1 条：因「不划算」而少做，同形」；新增「第 4 条形状（把没做的说成「不适用」）当日无实例」；K3 同口径「分属其中三条（第 1 条形状占两撞）」 |
| 3 | 🟡 | 已修 | A8 改「交付门（两档齐判）」，`docs` 含 `thincoder-core/prompts/common.md` |
| 4 | 🟡 | 已修 | A3 改「既有面零改（改动面判 · 不靠 `git diff` 基线）」＋改前副本逐行 `===` |
| 5 | 🟡 | 已修 | A2 与「落点位置实读」均改整行引文（`The user's name belongs only to their own words` 全行） |
| 6 | 🟡 | 已修 | 「RTM 近面」补 5 段 ∥ 35 个业务故事节 ∥ 214 个表行＋点名两条最近面 |
| 7 | 🔵 | 已修 | 用例表 C4 改「错误 · 悄悄缩范围」，抽样豁免行已去 |
| 8 | 🔵 | 已修 | 分层结论补「`.md` 运行期面免档位判定（依据 = 需求档 `docs/core/requirements/PROMPT-SYSTEM.md` §3 N5）」 |
| 9 | 🟡 | 新增 · 观察（不阻塞） | 「计数连带（D3）」仍写「§2.3 的标题写…21 节，其下大纲表 21 行 ⇒ 两处都欠账」，而 `docs/core/requirements/PROMPT-SYSTEM.md` §2.3 现为「`thincoder-core/prompts/common.md` 22 节」且表内已有「资源观（成本排序）」行 ⇒ 该段描述的是已完成状态（R7a 跨档状态滞后） |

计数：🔴 0 · 🟡 1（观察，不阻塞）· 🔵 0

VERDICT: pass

## §4 用户批准（主 agent）

### 用户批准

- **批准形 = 整批令**：用户 2026-11-07 12:24「开」（开批）· 12:33「都自动跑完」——覆盖本批的设计批准与实施启动。
- **需求侧用户两次给定口径**：12:23「我的想法是把不要省token和做好>做全>做快的价值取向进提示词系统」· 12:28「我确实就是要改资源观…把当前省看得太重，结果无数次的返工，造成全局的巨大浪费」（**后一次纠正了我把「资源观」写成「行为禁令」**）。
- **设计评审**：轮 1 `changes-required`（1 🔴 · 5 🟡 · 2 🔵）→ 修正 → **轮 2 `pass`**（2026-11-07 12:40，签发设计凭证）。
- **实施后一次口径收尾（不涉机制）**：`A6` 的「条目之间空行分隔」与 `A1` 的字节相等互斥（块内本无空行）⇒ **A1 赢，删该子句**；`A7` 的「每串 ⇒ 1」因**父侧把 `§2.3` 大纲表写成 `§2.9` 逐字摘要**而读成 2 ⇒ **父侧改提要形，判据不动**；新节第 3 条 `Why` 与既有 `No step is cut for speed` 从句重合 ⇒ **裁保留（B10 关键锚点重复，两条是不同规则）**。

## §5 实施记录（eng-coder）

### 落笔（2026-11-07 · 实施轮）

**任务书** = 批档 §2「实施席的动作」：一处落笔——`docs/core/design/PROMPT-SYSTEM.md` §6.75「逐字终稿」围栏块整行照落 `thincoder-core/prompts/common.md`，不改一字、不调缩进、不重写。

**改前副本（A3 用）**：落笔前已把落地档复制到 `.thincoder/tmp/common.md.before`，落笔后逐行 `===` 比。**本笔未删此副本——如实报为对设计档「用完即弃」的偏离**：该档落笔前的**工作树已带别批未提交改动**（`git show HEAD:` 复不出改前态），删了 A3 就再无复验路径；文件留在 `tmp` 临时目录，收口后可弃。

**插入位（A2 两锚，整行实读，不记行号）**：

- 上锚 = `## When choices conflict` 节末条整行：`- **The user's name belongs only to their own words**: only a literal user quote counts as the user's words; anything derived from them is marked explicitly as an inference — dressing an inference up as a user requirement puts words in the user's mouth.`
- 下锚 = 下一节标题整行：`## Instruction precedence — on conflict, in this order, high to low`
- 本轮实读：两行之间无第三行 ⇒ 新节落两者之间，前后各一空行。

**范围**：只加这一节——既有两句（`No step is cut for speed` ∥ `Correctness first`）零改，其余各节零改，`docs/**` 零改（设计档 ∥ 需求档不是本席的笔）。

### 读数（A1–A8 · 命令 + 输出 · 2026-11-07）

**量法**：一次性 `node` 脚本（经 `execute` 跑），两档文本读入、逐行 `===`、逐行量 `length`；只读，不改任何档。改前副本 = `.thincoder/tmp/common.md.before`（落笔前 `file_ops copy` 生成）。

**A1 落地块逐行相等**

```text
design fence: header 1-based 6826 | fence lines 6828 - 6845 | block lines 16
A1 raw-region equality (exact bytes, no normalization): true
A1 line-by-line: true / 16 lines
快判 scan "Cost order — the user's time first, tokens last" => 1 (expect 1)
```

**A2 位置（两整行锚）**

```text
up anchor found at 1-based 70 | down anchor found at 1-based 89
first "## " line after up anchor => "## Cost order — the user's time first, tokens last" | is it the new section: true
position ok (up < new section < down): true
```

**A3 既有面零改（改动面判 · 改前副本逐行比）**

```text
A3 prefix 71 suffix 386 sum 457 / old 457 | removed 0 | inserted 17
A3 inserted == block + blank: true
scan "No step is cut for speed" => 1 (expect 1)
scan "Correctness first" => 1 (expect 1)
common.md (after)        | CRLF 0 | bare CR 0 | trailing-space lines 0
common.md.before         | CRLF 0 | bare CR 0 | trailing-space lines 0
```

**A4 行宽**

```text
block max line length = 273 | any block line >300: false
whole file lines >300 => 0 []
```

**A5 语言与引用（判域 = 落地块）**

```text
block CJK hits => 0 | ".md" hits => 0 | "§N" hits => 0
```

**A6 五条顶格 · 条条携 why · 无复述**

```text
top-level entries => 5 (expect 5)
  entry 1: why lines = 1 | sub-items = 0
  entry 2: why lines = 1 | sub-items = 0
  entry 3: why lines = 1 | sub-items = 0
  entry 4: why lines = 1 | sub-items = 0
  entry 5: why lines = 1 | sub-items = 4
every entry has exactly one "  Why:" => true
5th entry "  - " sub-items => 4 (expect 4)
title repeated inside any entry line => 0
blank line separates entries => false   ← 见下「判据冲突①」
```

**A7 双形对应**

人核半边（逐条指认，英超条 ↔ 需求档 §2.9 五条）：

| 英超条 | 需求档 §2.9 |
|---|---|
| 1 `What is dear, what is cheap` | 条目 1「成本排序（这一节的核心）」 |
| 2 `A local saving is not a global saving` | 条目 2「局部省 ≠ 全局省」 |
| 3 `Done well > done complete > done fast` | 条目 3「做好 > 做全 > 做快」 |
| 4 `Five things are never done "to save tokens"` | 条目 4「推论（不许为了省 token 做这些）」——五动作一一对上：减少沟通 ∥ 省略信息 ∥ 跳过核验 ∥ 缩小范围 ∥ 先交「够用」版 |
| 5 `Four shapes to recognise…` | 条目 5「反面清单」——四形一一对上 |

机判半边（输出）：

```text
"用户的时间 ≫ 返工成本 ≫ token" => 2
"局部省 ≠ 全局省" => 2
"做好 > 做全 > 做快" => 2
"减少沟通" => 2
"抽样代替全量" => 2
```

**A8 交付门（两档齐判）**：`doc_check(mode:"gate", docs: ["docs/core/design/PROMPT-SYSTEM.md", "thincoder-core/prompts/common.md"])` 首行 = `DOC-CHECK GATE: PASS`；结论行 = `结论：0 段有问题（2 档全清）`。

**计数（D3）**

```text
before: ## = 21 , ### = 6 , lines = 457
after : ## = 22 , ### = 6 , lines = 474
```

**落地块首末三行（逐字）**

```text
## Cost order — the user's time first, tokens last

- **What is dear, what is cheap**: the user's time is worth far more than a rework round, and a rework round far more than the tokens it burns — so a round that leads with a token saving buys the cheapest thing with the dearest.
  Why: the token count is what a round can see and book at once; the user's time a wrong round costs is larger, real, and appears nowhere in that count.
- **A local saving is not a global saving**: a few hundred tokens saved, paid for by one rework round, costs many times the saving — re-read, re-edit, re-verify, and the user's time to find it and put it right.
  …
  - calling what was never done "not applicable"
  Why: each is defensible in the sentence that proposes it, and the loss only shows in the tally of what was cut — so recognise the shape, do not weigh the argument.
```

### 判据冲突（三条 · 不自行裁决，上抛父侧）

判据冲突①：A6 写「条目之间空行分隔」，而 A1 要求整行照落的围栏块本身**条目之间零空行**（块内唯一空行 = 标题后那一行）。
⇒ A1 ∥ A6 的空行子句**不可能同真**。本席取 A1（逐字相等是硬判据，且批档 §2 的动作写「整行照落」）；A6 的空行子句按盘上读数判 `false`，如实记，不改落地档。

判据冲突②：A7 机判半边写每串「⇒ 1」，实际每串读 **2**（各在 §2.3 大纲表「资源观（成本排序）」行与 §2.9 正文各一次）。
⇒ 存在性成立、计数期望不成立；判域是需求档（主 agent 笔域），本席不改。

判据冲突③：`docs/core/design/PROMPT-SYSTEM.md` §6.75「计数连带（D3）」仍把「需求档 §2.3 标题写 `thincoder-core/prompts/common.md` 21 节 ∥ 大纲表 21 行」写成两处欠账；本轮实读 = 标题已是「22 节」、大纲表 22 行且第 4 行即「资源观（成本排序）」、编号 1–22 连续。⇒ 跨档状态滞后，属设计档笔域。

### 审计与评审轮次

- **内部审计（explore · 只读，1 轮）**：`DIVERGENCE: 1 found` —— 唯一偏离 = §5 读数缺失（不涉代码面）；两条判据冲突经其复核成立。该偏离已由本节读数落账。
- **内部评审（advisor · code，1 轮）**：`VERDICT: changes-required`，1 条 must-fix = 同一条 §5 读数缺失（已落账）；另有 2 条非本席笔域提示（设计档计数连带滞后 ∥ 新节 entry 3 的 why 与既有 `No step is cut for speed` 从句逐字重合，是否属需求档 §4 B10「关键锚点重复」由设计席明示）；1 条可追溯性提示（§1 的推论 ① 在 §2.9 ∥ 落地节均无对应物，职责由既有 `Delivery transparency` 条承担）。
- **终端状态 = `clean`**（实施面无待改代码；must-fix 已在本轮落账，其余三条不属本席笔域，随报告上抛）。

### 补充读数（`git diff` 观察 · 与本笔的边界）

对 `thincoder-core/prompts/common.md` 跑 `git diff` ⇒ 本笔落字之外还有**两处非本笔的改动区**在盘上：

```text
@@ -157,6 +174,10 @@  「Document writing discipline」段内多出三行 + 一条 Examples 条目
@@ -361,7 +382,7 @@  一行由 "a batch's `.test.mjs`" 改成 "a batch's own unit-test file"
```

**核过：这两处在落笔前就已在工作树里，不是本笔的笔迹**——逐串实扫，两处特征串在改前副本 `.thincoder/tmp/common.md.before` 中**均已存在**（`The unit that carries it is the entry, not the clause` ⇒ 副本 true ∥ 当前 true；`a batch's own unit-test file` ⇒ 副本 true ∥ 当前 true），而 `git show HEAD:` 版**没有**第一条、且是旧措辞 `a batch's .test.mjs`。

⇒ 该档的 `git diff` **不能当 A3 的判据**（正是设计档 A3 写「同树别处的删行会把整档 `git diff` 压红，所以判改动面、不判整档」的实况）。本笔判据 = 改前副本逐行比：前缀 71 行 ∥ 后缀 386 行逐行相等，三处合计 = 改前全档 457 行 ⇒ **区间外零改、零删**，改动面恰为一段 17 行连续新增。

**本笔的写面**：`thincoder-core/prompts/common.md`（唯一产品面落笔）∥ 批档 §5（本席段）。`docs/core/design/PROMPT-SYSTEM.md` ∥ `docs/core/requirements/PROMPT-SYSTEM.md` 零改（非本席笔域）。

## §6 验证与收口（父代理）

### 验证与收口

**父侧独立复验（不转抄 `§5`）**

| 项 | 量法 | 读数 |
|---|---|---|
| **A1 逐行相等** | 从设计档按内容定位围栏块（含 `## Cost order — the user`），与提示词档该节逐行 `===` | **16 行 ∥ 16 行 · true** |
| A3 既有两句未删 | 全档扫 `No step is cut for speed` ∥ `Correctness first` | **各 1** |
| A4 行宽 | 全档 `>300` 行 | **0** |
| A8 交付门 | `doc_check(mode:"gate", docs:[设计档, 提示词档])` | **`PASS`**（2 档全清） |

**三个判据冲突的处置（都不是实施席的错）**

1. **`A6` 空行子句 vs `A1` 字节相等**：块内条目之间本无空行，而 `thincoder-core/prompts/common.md` 既有各节也零空行 ⇒ **A1 赢，子句删除**。**两判不可能同真，设计时写了互斥的一对。**
2. **`A7` 每串 ⇒ 1 读成 2**：根因是**父侧把需求档 `§2.3` 的大纲行写成 `§2.9` 的逐字摘要**——同一段内容两处逐字，**违的正是本批要立的「单源」**。已改成提要形（「…口径与判据见 §2.9」），五串回落到各 1。**判据未改，改的是被写的档。**
3. **新节第 3 条 `Why` 与既有 `No step is cut for speed` 从句逐字重合**：**裁保留**。两条不是同一件事（一条禁「为速度砍步骤」，一条排「什么贵什么贱」）；删任一条的从句，另一条就失去理由。**已在设计档写明这是刻意并引 B10**，防下一个人当冗余合并。

**一处实施席的偏离，我认**

改前副本 `.thincoder/tmp/common.md.before` **未按「用完即弃」删除**。理由：该档落笔前**工作树已带别批未提交改动**，`git show HEAD:` 复不出改前态，删了 `A3` 就没有复验路径。**⇒ 「用完即弃」在「基线已脏」时应让位给可复验。**收口后可弃。

**未做而必须记明**

- **全量套件未跑**（按父侧指令）。**本批零代码面，改动只有提示词一档的文本**；验证由 A1–A8 与父侧复验承担。
- **内部审计环 1 轮 + 内部代码评审 1 轮**（实施席自跑，非跳过）：`DIVERGENCE: 1 found`（`§5` 读数当时未落，已随读数落账）；代码评审 `changes-required` 1 条（同为读数缺失，同轮落账）。
- **设计档 §6.75 的「计数连带」段曾滞后**（写成「两处都欠账」而实际已落）——**已由 `#61` 重写为现况**，现判法 = `##` 节数 ∥ 标题数 ∥ 大纲表行数，三者相等（22 ∥ 22 节 ∥ 22 行）。

**对账**

- `§2` ↔ 设计档：`§2` 的条目与验收均回指 `§6.75` 的 `A1`–`A8`，读数以设计档为准，无重述数字。
- `§2` ↔ `§5`：`§5` 的 A1–A8 读数与父侧复验逐项一致。
- **前批遗留**：无。
- **暂缓批复核：无。**
- **用户可见面**：**本批改的正是提示词面本身**——`common.md` 新增一节（`## Cost order — the user's time first, tokens last`），**两模式 + 全子代理角色下次装配即生效**；无 UI 面、无配置项。

**收口**

- 台账 `#2133`：**在途 → 待核销 → 已核销**。
- 本批产出：`thincoder-core/prompts/common.md` 新增 16 行一节（字节相等于设计档围栏块）· 需求档 `§2.9` 资源观 + `§2.3` 节表连带（21 → 22 节）· 设计档 `§6.75`（含先例偏离 ④、计数连带、B10 裁定）。
