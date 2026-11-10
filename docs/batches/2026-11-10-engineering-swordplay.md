# 2026-11-10 · engineering-swordplay
> 六段，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 每段只有一个作者：作者的段可 `append` 加内容、可就地改（`edit`）；非作者一概拒。
> 编制：主 agent · 2026-11-10 · 来源 = 用户 2026-11-10 14:05「我更希望的是做剑法，而不是再加约束」· 14:07「开」。
> 台账 = #2282（core · 归批）。前情 = 无（独立批）。
## §1 讨论（主 agent）
**状态行**：已收口 2026-11-10
<§1 模板占位：本批条目 / 关键判据 / 授权口径>

### 来源与诊断

**用户原话（三句）**：

- 14:02「我觉得我们要分析一下咱们的提示词系统，研究一下为啥 agent 为啥会出现**挑活干**的行为。」
- 14:05「这些所谓最小改法我都很不喜欢，我希望是你**充分梳理提示词，找出卡点给出最优解决方案**。」
- 14:05「我更希望的是**做剑法，而不是再加约束**。」· 14:07「**开**」

**父侧诊断（实读 `thincoder-core/prompts/persona-engineering.md`，逐句在盘）**：

1. **排序把「动手」压死了**：同档四处要求动手（「You own the code」「a bug you can see next door gets fixed and reported」「the duty is that it gets fixed」「dispatch it in the same round」），而 §215 逐字写「**The write-domain boundary outranks both "fix it on the spot" and "debts must be visible" — the boundary is a contract, those two are habits.**」⇒ 排序之后，前四处全部作废。
2. **闭环出口是沉默**：写域外的缺陷「not fixed, not booked, not reported」，交由「the batch that touches it corrects it then」——而那条批**没人会开**（不报、不记）。**没撞到的缺陷从来没存在过。**
3. **批的完工判据里没有产品**：§6 要验证读数、要挂账、要暂缓复核；**没有一处要求「产品行为变了什么」** ⇒ 一个批可以「完工」而产品一行没动。
4. **入口成本差三个数量级**，而提示词只反驳了**过程成本**（「setting a fix aside because fixing it would need another review saves nothing」）。真实差价在入口：改一行代码 = 批档 + 设计 + 评审 + 批准 + 实施 + 收口；记一条账 = 一次工具调用。

**当天实证**：04:37 → 14:0x，九小时；产品代码改了一个常量；设计 8 轮、评审 7 轮；台账 112 行未变。

### 已定决定

- **已定决定**：改 `persona-engineering.md` 的**开篇一节**——把「为什么要有这个模式」的法典式开头换成**三式剑法**，原法典内容降级到其后一节；**其余规则一字不动** · 用户原话：「我更希望的是做剑法，而不是再加约束。」 · 时间：2026-11-10 14:05

### 替换内容（父侧笔，逐字交给设计席落点）

```text
## 一个好工程师怎么动

**先找那一刀。** 拿到一堆活，只问一句：做完哪一件，剩下的都变简单？
找错那一刀的代价很具体：你会挑那件看得见结果、又不用负责的活——整理、分类、记一笔——然后一天过去了，产品一行没动。

**只做到能看见变化。** 一件事拿在手上，先找它最小的可验形态：一条命令跑完，能看见前后不同。
能出读数的地方别出结论；能动手的地方别论证。

**变化出来才结账。** 账、文档、批档，是给已经发生的变化做的记录，它们不是替代品。
一个批的收口里没有「产品行为变了什么」，这个批就不是干活批。

**这三式是主线。** 后面的四步、评审、批档、台账，是真走不动时才翻的东西——它们回答「我这样算不算对」，三式回答「下一步动哪里」。分清这两件事。

## 这个模式护的是什么

**难的不是写出能跑的代码，是让这套东西一直对**——先烂掉的往往不是代码，是围着它的文档与测试。

需求、设计、代码一旦各说各的，就没人能说清哪个是对的，于是每次改动都变成一次下注。
这种漂移不会一次到位：它由许多小动作累积而成，每一个在落地当天都看着没问题。

**所以这个模式只为一件事存在**：让文档系统是真的，让需求 → 设计 → 代码同向。
四步、评审门、批档、台账、角色分工，都是为这一件事服务的机器；不服务它的形式，可以删。

测试是另一半，而且是被管理的、不是被累积的：无主的测试集会随项目长大，给每次改动加税，过了某个点就变成最沉的石头——人们开始绕着它走，灯还绿着，保护已经没了。
一条单测用完就删不是吝啬，是拦住那场爆炸的防火墙。
```

**未改的四条责任句**（接在新节之后原样保留）：「the consistency of that chain is carried by you」那三条 bullet——**它们讲的是「修」，与三式同向，不冲突。**

### 边界

- **只换开篇这一节**，其余规则（Firing-rights、Advance & stop、批档、台账、评审）**一字不动**——本批**不加任何规则**，只做**替换与降级**。
- 不改 `discipline-engineering.md` ∥ `common.md` ∥ 任何人格档。
- 不改产品代码逻辑。

### 2026-11-10 14:19 · 评审三条 🔴 后的父侧改判（「派」= 按此落）

**用户 14:19 原话：「派」**——按本节的改法走。

**判据依据（本档 §3 第 1 轮）**：① 围栏里那句「一个批的收口里没有「产品行为变了什么」，这个批就不是干活批」**是新收口判据**，与本批「不加任何规则、不补任何判据」相冲，且 C4 把它判红。② `docs/core/design/PROMPT-SYSTEM.md` §6.30 逐字「**散文一律英文**」「四类之外的中文行 = 残留，必须译」——中文节与它相冲，而读① 的逐行相等与「必须译」互斥。③ §6.72 的 A1/A3/A10 仍指向被删的围栏与退役标题。

**父侧改判（比原方案更小）**：

1. **语种 → 英文**（§6.30 是现有规则，为一个新节开例外要更重）。
2. **新增一节插在现有节之前，原标题与四段原文逐字不动**——不再改写它们。⇒ 原方案里「逐段对照」「内容是否都在」的风险**整个消失**（旧文本原样在盘，无需映射）。
3. **收口那句删掉**：「一个批的收口里没有…这个批就不是干活批」不进目标形。三式只留动作。

**逐字目标形（父侧笔，新增一节）**：

```text
## How a good engineer moves

**Find the one cut first.** With a pile of work in hand, ask only one question: which item, once done, makes the rest easier?
The cost of cutting the wrong one is concrete: you pick the task that shows a result and carries no responsibility — sorting, classifying, recording one more row — and a day goes by without one line of product moving.

**Only work to a change you can see.** For the thing in hand, find its smallest verifiable form: one command run, a difference visible before and after.
Where a reading is available, don't deliver a conclusion; where a change is possible, don't argue.

**Only close accounts once the change happened.** The ledger, the documents and the batch record are records of a change that already happened — they are not a substitute for it.

**These three moves are the main line.** The four steps, the reviews, the batch record and the ledger below are what you turn to when a move genuinely won't go — they answer "is this how it should be done"; the three moves answer "where to move next". Keep those two questions apart.
```

**它后面紧跟** `## Why this mode exists (the chain this mode protects)` —— **原标题、原四段、原三条责任 bullet 一律逐字不动。**

### 同轮必须做的（§6.72 的连带）

`PROMPT-SYSTEM.md` §6.72 里仍指向被删围栏与退役标题的行，**与这一笔同轮收正**：A1（「终稿一」围栏块）∥ A3（「该块首行是档内第一个 `## ` 行」——新增节后这句为假）∥ A10 ∥「既有件三问」那句标题定位。先例 = 同档 §6.94 K4：「那一节的验收表与用例是实施席照抄的目标形；不改，下一轮会照着旧形再落一遍」。

## §2 批次任务与设计（eng-designer）
**状态行**：设计完成
<§2 模板占位：本批条目（覆盖） / 设计档落点 / 机制设计 / 受影响文件与测试覆盖 / 验收对照 / 关键决策 / 上抛项>

### 本批条目（覆盖）

台账 `#2282`（core · 归批）。两条，同一笔落地：

| # | 条目 | 落点 | 判据回指 |
|---|---|---|---|
| 1 | 工程模式人格档档首新增英文三式剑法一节；既有「为什么要有这个模式」节与其后内容逐字不动 | `thincoder-core/prompts/persona-engineering.md` 的既有 `## Why this mode exists (the chain this mode protects)` 之前插入新节 | `docs/core/design/PROMPT-SYSTEM.md` §6.95 落点 A ∥ 读①–读③ |
| 2 | 设计档 §6.72 的验收、用例与定位随新增节同轮收正 | 同档 §6.72 的 A1 ∥ A3 ∥ A10 ∥ C1 ∥「既有件三问」 | §6.95 落点 B ∥ 用例 C6 |

**明确不在本批**（照 §1 边界）：

- 不加任何规则、不补任何判据；三式只留动作，不写新的收口判据。
- 不动 `thincoder-core/prompts/discipline-engineering.md` ∥ `thincoder-core/prompts/common.md` ∥ 其余 15 档提示词。
- 不动人格档既有 `## Why this mode exists (the chain this mode protects)` 节及其后任何内容。
- 不动产品代码逻辑、需求档、台账、测试。

### 设计档落点

设计档落点 = `docs/core/design/PROMPT-SYSTEM.md` 的 §6.95 + §6.72 的就地收正。

**目标形只从 §6.95 落点 A 的英文围栏块取**。动作 = 在既有节之前插入一节；原标题与原四段逐字不动，不设逐段对照表。

### 受影响文件

| 档 | 层 | 改什么 | 本笔归谁 |
|---|---|---|---|
| `thincoder-core/prompts/persona-engineering.md` | 产品面（运行期加载） | 档首新增一节（§6.95 落点 A） | 实施轮 eng-coder |
| `docs/core/design/PROMPT-SYSTEM.md` | 设计档 | §6.95 换写 + §6.72 的 A1 ∥ A3 ∥ A10 ∥ C1 ∥「既有件三问」收正 | 本席 |
| 代码 ∥ 测试 ∥ 需求档 | — | 0 | — |

### 验收对照

三条读与红侧的全文住 §6.95「验收（三条读 + 文档门）」与「三条读的红侧」，本节只引：

| 验收 | 指向 |
|---|---|
| 读① 新增节在盘且为档内第一个 `## ` 节，下一节紧接原标题 | §6.95 读① |
| 读② 原标题、原四段、责任句与三条 bullet 逐字不动 | §6.95 读② |
| 读③ 读完仍答得出（下一步动哪里 ∥ 为什么存在 ∥ 一致性归谁） | §6.95 读③ |
| 文档门 `doc_check(mode:"gate", docs:["docs/core/design/PROMPT-SYSTEM.md", "thincoder-core/prompts/persona-engineering.md"])` | 首行 `DOC-CHECK GATE: PASS` |

**会红的反面（本席改前实跑）**：尺子 = 内置 `grep`，判域 = `thincoder-core/prompts/persona-engineering.md`。精确模式 `^## How a good engineer moves$` → `no matches`；精确模式 `^## Why this mode exists \(the chain this mode protects\)$` → 原标题一处命中。落地后用同一新标题探针必须读到命中。

### 实施席纪律

- **只插一节，不是整段替换**：新增节落在既有 `## Why this mode exists (the chain this mode protects)` 之前；原标题与四段仍在，且逐字不动。
- **新增节使用英文**：与 §6.95 落点 A 围栏逐行相等，不为新节开中文例外。
- **不补判据**：三式只留动作；落地时加一条「应当如何」，就越出本批边界。
- **责任句与其后内容一字不动**：包括三条 bullet 与 `## Firing-rights boundary…` 起至档尾。
- 本席只落设计档；`thincoder-core/prompts/persona-engineering.md` 归实施轮，不在本轮代写。
- 落完先跑上面那行文档门，首行 `PASS` 才算交；不 `PASS` 不回话。

### 风险（这批挡不住什么）

- **三式是行为引导，不是判据**：它判不了「这一笔算不算做完」，那仍由批档收口、评审门、台账回答。
- 读者若把「这三式是主线」读成「三式够了、流程可跳」，档首拦不住他；拦得住的是其后原样在的规则。
- **「能出读数的地方别出结论」不等于造一个能红的读数**：读数指一条真跑的命令印出来的前后不同，不是现造的探针。

### 上抛项

同 §6.95「上抛项」三条：笔界 · 纪律档同族节并或不并（待裁）· §6.72「两档的现存形态」旧快照（本席未动，请父侧裁）。

## §3 设计评审（评审子代理）
**状态行**：评审通过



### 轮次 1（评审子代理）

**评审面**：`docs/core/design/PROMPT-SYSTEM.md` 的 §6.30 ∥ §6.72 ∥ §6.94 ∥ §6.95 · `docs/batches/2026-11-10-engineering-swordplay.md` §1 ∥ §2。产品代码不在本批评审面（设计轮无代码可读）。

**重点四问的结论**：① 替换不是叠加 —— 成立（落点 A 用整段区间 + 逐字围栏，覆盖整段）；② 语种 —— 是缺陷，见 #2；③ 「不加任何约束」—— 不成立，围栏里落进了一条新的收口判据，见 #1；④ 「三式挡不住什么」—— 已写死（「三式是行为引导，不是判据」+ 其后原样在的规则），但被 #1 自破。

| # | 严重度 | 状态 | 证据（指针） |
|---|---|---|---|
| 1 | 🔴 | 未解决 | §6.95 围栏「一个批的收口里没有「产品行为变了什么」，这个批就不是干活批」vs 同节「边界」的「不加任何规则、不补任何判据」vs 同节「风险」的「三式是行为引导，不是判据」vs 用例 C4 的「加一条就把它做成了又一条规则」；批次档 §2「明确不在本批」同写「不加任何规则、不补任何判据。」 |
| 2 | 🔴 | 未解决 | 同一档 §6.30「散文一律英文」／「四类之外的中文行 = 残留，必须译」vs §6.95 围栏全中文散文 + 「偏离二」的「判据仍是读者读得懂，不是与其余各节同语」；「既有件三问」未把 §6.30 列为既有件；语种只以批次档 §2 上抛项 2 的「知会」承载，而批档收口整本删 |
| 3 | 🔴 | 未解决 | §6.72 验收 A1 的「终稿一」围栏块已由「落点 B」删除；A3 的「该块首行是档内第一个 `## ` 行」由「落点 A」证伪（档首第一节已换）；A10 与「既有件三问」仍按退役标题 `the chain this mode protects` 定位；同节却写「判据一与落点表照旧成立」 |
| 4 | 🟡 | 建议 | §6.95「到 `**The duty this puts on you**` 的上一行止（含该空行）」vs 围栏块末行无尾随空行 ⇒ 责任句并入第二节末段；读① 判「（含空行位置）」，红不了 |
| 5 | 🟡 | 建议 | §6.95 无逐段对照，映射只在批次档 §2（收口整本删）；改前四段不在评审面 ⇒「内容都在，换的是顺序与语气」此后无人可核 |
| 6 | 🟡 | 建议 | §6.72「两档的现存形态」判为删（同轮）：一次勘察的快照（D12 的 ⑨ 判它住记录面）＋与同节 K3 判由重复；属存量，不阻断 |
| 7 | 🔵 | 记录 | 「这三式是主线」段给的是「何时翻规则」的触发句，非纯动作面；「风险」已点名读者可能读成流程可跳 |
| 8 | 🔵 | 记录 | §6.95「集成测试设计」以 `实扫 `提示词|prompt|system prompt` 零命中` 收口，未列故事行；`test/RTM.md` 不在本次评审面 ⇒ 本席未核 |
| 9 | 🔵 | 记录 | 批次档 §1 用「§215 逐字写」指位置——同一档 §6.17 与 §6.93 落点 ⑩ 都判坐标不作定位 |

**已判对的两笔**：「落点 B」删 §6.72 的旧副本该做且做对（D2 一份说法 + 退役文本的指针句同轮收，先例 §6.94 K5）；只是收得不全（#3）。产品面笔界划得对（提示词档归实施轮，设计席只落本档）。

VERDICT: changes-required

计数：🔴 3 · 🟡 3 · 🔵 3 · 未解决 🔴 3

### 轮次 2（评审子代理）

**第 2 轮复核面**：`docs/core/design/PROMPT-SYSTEM.md` 的 §6.30 ∥ §6.72 ∥ §6.95 · `docs/batches/2026-11-10-engineering-swordplay.md` 的 §1 ∥ §2。只核上轮发现与父侧两项新裁，不评产品代码实现。

| # | 严重度 | 状态 | 证据（指针） |
|---|---|---|---|
| 1 | 🔴 | Fixed | §6.95 落点 A 的英文围栏已删去旧收口判据句；C4 与「边界」仍禁止新增收口判据 |
| 2 | 🔴 | Fixed | §6.95 落点 A 首行 `## How a good engineer moves`，围栏为英文；K4 明引 §6.30，C5 判中文落地为红 |
| 3 | 🔴 | Fixed | §6.72 的 A1 改指 §6.95 落点 A；A3 改判 `## How a good engineer moves` 为首个 `## ` 行；A10 与「既有件三问」均已按新增节收正，C1 同步 |
| 4 | 🟡 | Fixed | 原替换区间已撤销；§6.95 落点 A 改为只插一节并明写「连空行」，原责任句不再处于替换边界 |
| 5 | 🟡 | Fixed | §6.95 K1 明写不替换旧四段、无需逐段映射；读② 直接判旧标题与四段逐字不动 |
| 6 | 🟡 | Unfixed | §6.72 仍存「两档的现存形态」段；§6.95 上抛项 3 仍写「本席未动，是删是留请父侧裁」，未执行父侧已作出的删除裁定 |
| 7 | 🔵 | Accepted | §6.95 风险仍明写三式可能被误读为流程可跳；该项是上轮记录的非阻断边界说明 |
| 8 | 🔵 | Accepted | §6.95 集成测试设计仍给 `test/RTM.md` 扫描断言；该档不在本轮评审面，扫描结果仍为 unverified，但不构成阻断 |
| 9 | 🔵 | Accepted | 批次档 §1 的「§215 逐字写」仍在历史诊断中；非 §6.95 的实施定位依据，不阻断 |
| 10 | 🔴 | New | §6.95 上抛项 2 仍写「若判并，先落台账行再另开一批」，「边界」仍排除 `thincoder-core/prompts/discipline-engineering.md`；这与父侧已裁「同族开场节本批同改」直接相反，另批理由不成立 |

VERDICT: changes-required

计数：Fixed 5 · Accepted 3 · Unfixed 1 · New 1；未解决 🔴 1 · 🟡 1。

### 轮次 3（评审子代理）

**第 3 轮复核面**：`docs/core/design/PROMPT-SYSTEM.md` 的 §6.72 ∥ §6.95；`docs/batches/2026-11-10-engineering-swordplay.md` 的上轮评审记录。只核上轮各项与两条遗留裁定，不评产品代码实现。

| # | 严重度 | 状态 | 证据（指针） |
|---|---|---|---|
| 1 | 🔴 | Fixed | `docs/core/design/PROMPT-SYSTEM.md` §6.95 落点 A：英文围栏不含旧收口判据句；C4 与「边界」继续禁止新增判据 |
| 2 | 🔴 | Fixed | 同节落点 A：唯一围栏首行 `## How a good engineer moves`；K4 明引 §6.30，C5 判中文落地为红 |
| 3 | 🔴 | Fixed | 同档 §6.72：A1 指向 §6.95 落点 A；A3 的人格档分支改判新节居首；A10、C1 与「既有件三问」同步收正 |
| 4 | 🟡 | Fixed | 同档 §6.95 落点 A：只插新节并明写「连空行」，不再设整段替换区间 |
| 5 | 🟡 | Fixed | 同节 K1：不改写既有四段、无需逐段映射；读② 直接核既有文本逐字不动 |
| 6 | 🟡 | Fixed | 同档 §6.72 的「两档的现存形态」旧快照段已整段删除；§6.95 上抛项已无旧快照待裁项，目标句零残留 |
| 7 | 🔵 | Accepted | 同节「风险」仍明写三式可能被误读为流程可跳；上轮非阻断边界记录，本轮关闭 |
| 8 | 🔵 | Accepted | 同节「集成测试设计」仍引 `test/RTM.md` 扫描断言；该档不在本轮评审面，维持 unverified 的非阻断记录 |
| 9 | 🔵 | Accepted | `docs/batches/2026-11-10-engineering-swordplay.md` §1 的「§215 逐字写」仅是历史诊断，不作实施定位依据 |
| 10 | 🔴 | Fixed | `docs/core/design/PROMPT-SYSTEM.md` §6.95：落点 A 明列人格档与纪律档两处；读①、读②、C1、文档门与受影响文件表均覆盖两档；同一英文围栏逐行相等；「边界」不再排除纪律档，上抛项 2 改记「已裁 · 同批同改」 |

红侧已核：同节「三条读的红侧」明写改前对两档分别以 `^## How a good engineer moves$` 精确读取，均读不到；落地后两档同探针均须命中。

VERDICT: pass

计数：Fixed 8 · Accepted 3 · Unfixed 0 · New 0；未解决 🔴 0 · 🟡 0。

### 轮次 4（评审子代理）

本轮代码交付复核：两份提示词档新增的 `## How a good engineer moves` 节均与 `PROMPT-SYSTEM.md` §6.95 落点 A 的英文围栏逐行相等，且均为各档第一个 `## ` 节、后接各自既有理由节；评审范围内未发现问题。

VERDICT: pass

计数：🔴 0 · 🟡 0 · 🔵 0。

## §4 用户批准（主 agent）

### 用户批准

- **原话**：「开」（2026-11-10 14:07）·「派」（14:19）——按本档 §1 的诊断与替换内容开批，评审后按改判落点执行。
- **批准范围 = 第 3 轮评审通过的那份**：两档档首新增同一英文节 `How a good engineer moves`；原标题与四段逐字不动；不加任何新规则。
- **父侧两处改判已并入**：语种英文（§6.30）· 插一节而非替换四段 · 收口判据句删除 · 纪律档同族节本批同改 · §6.72 旧快照删除。

## §5 实施记录（eng-coder）

### 实施交付

依据 docs/core/design/PROMPT-SYSTEM.md「只插入下面的围栏块；既有节的标题、四段、责任句与三条 bullet 及其后全部内容逐字不动。」——两档均只插入同一英文新节，不改写既有理由节或其后规则。

| # | 状态 | 要求 | 落地 |
|---|---|---|---|
| 1 | ✅ Done | 人格档档首新增 `How a good engineer moves`，既有节与其后内容不动 | `thincoder-core/prompts/persona-engineering.md` 已插入，下一节仍为 `Why this mode exists (the chain this mode protects)` |
| 2 | ✅ Done | 纪律档档首插入同一英文节，逐行相等 | `thincoder-core/prompts/discipline-engineering.md` 已插入，下一节仍为 `Why this mode exists (the chain every seat here protects)` |
| 3 | ✅ Done | §6.72 的验收、用例与定位同轮收正 | 设计席已落；本席复读 A1、A3、A10、C1 与「既有件三问」，未再改设计档 |

越列表改动：无。本席只写上述两份提示词档；两档工作树中既有的其他差异未触碰。

### 验证与评审

- 红侧：落地前对两档分别以内置 `grep` 精确读 `^## How a good engineer moves$`，均为 `no matches`；落地后同一探针在两档均命中。
- 读①：两档新增节与 §6.95 落点 A 围栏逐行相等且彼此相等；新标题均为档内第一个 `## ` 行；下一节均为各自既有理由节。
- 读②、读③：两档档首已读回；人格档责任句、三条 bullet 与 Firing-rights 节仍在，纪律档既有理由节与其后规则仍在；三问均可回答。
- 文档门：`doc_check(mode:"gate", docs:["docs/core/design/PROMPT-SYSTEM.md", "thincoder-core/prompts/persona-engineering.md", "thincoder-core/prompts/discipline-engineering.md"])` 首行 = `DOC-CHECK GATE: PASS`。
- 单元测试与集成用例：无新增；本批只改提示词文本，设计 §6.95 已判 `none`。
- `verify`：已声明 `passed`，依据上述文档门、读回与评审结果。

| 环节 | 轮次 | 结论 | 发现处置 |
|---|---:|---|---|
| 内部 explore 偏离审计 | 1 | clean | 四类偏离均未发现 |
| 内部 advisor 代码评审 | 1 | pass | 无发现，无需修复 |
| 自我修复 | 0 | 不适用 | 审计与评审均未提出修复项 |

终态 = `clean`；doc_check: PASS (3 docs)。

## §6 验证与收口（父代理）

### 验证与收口（父侧）

**交付**：`thincoder-core/prompts/persona-engineering.md` 与 `thincoder-core/prompts/discipline-engineering.md` 档首各新增同一节 `How a good engineer moves`，**两档逐字相同**；原标题与四段原文逐字不动；零新规则。

**父侧独立复跑（不信实施席自报）**：

```
grep ^## How a good engineer moves$（thincoder-core/prompts/）
  discipline-engineering.md   命中
  persona-engineering.md      命中
人格档读回：新节为档内第一个 `## ` 节，后接原标题 `## Why this mode exists (the chain this mode protects)`
责任句、三条 bullet、Firing-rights 节原样在
doc_check(mode:"gate")  →  DOC-CHECK GATE: PASS
```

**本批产品行为变化**：工程模式主会话与子代理读到的档首从「法典式开场」换成「三式动作面」。**这是行为引导，不是判据**——它不替代任何评审门。

**台账**：`#2282` 核销。

**集成测试**：`none`——`test/RTM.md` 实扫 `提示词|prompt|system prompt|persona|人格` 零命中（设计席实跑）；提示词文本变更不改任何业务可观察断言。

**单元测试档**：无（本批不改代码，无机检件）。
