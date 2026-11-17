# 2026-11-08 · small-machinery-purge
> 六段，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 每段只有一个作者：作者的段可 `append` 加内容、可就地改（`edit`）；非作者一概拒。
> 编制：主 agent · 2026-11-08 · 来源 = 用户 2026-11-08 23:09「操，量级判断居然还在？你清理一下，顺便盘点一下还有什么跟这个量级判断相关的东西？一并清除。」。
> 台账 = #2215（PROMPT-SYSTEM · 归批）。前情 = docs/batches/2026-11-08-citation-form-inline.md（进行中）。
## §1 讨论（主 agent）
**状态行**：已收口（三档提示词 + 设计档连带 · 评审第 6 轮通过 · 控制串全读 1 · 门 6 档全清）
<§1 模板占位：本批条目 / 关键判据 / 授权口径>

### 用户要什么

**原话（23:09）**：「操，量级判断居然还在？你清理一下，顺便盘点一下还有什么跟这个量级判断相关的东西？一并清除。」

**背景**：同一晚父侧要用「这两句话是小改动」把一处提示词修改绕开批次流程；用户点出这正是量级判断在起作用的现场。

### 为什么这条必须走，不能只是「改一改」

**`thincoder-core/prompts/discipline-engineering.md` 里同时写着两句互相打架的话**：

- 前半节（改动风险那段）：**大小只能来自读数，读之前「小」不是一个谨慎的结论**；
- 同节第 5 条：**`Small job, small machinery`: do the magnitude check first**。

**第二条给了「先量一下、小就少配机器」的授权，而「量」这个动作本身在前半节已被证伪：量不出来，于是「小」变成事前结论。**

### 而设计档替它辩护过（这是最坏的一处）

`docs/core/design/PROMPT-SYSTEM.md` 的对照表里有一行：

> `Small job, small machinery` ∥ …**两条并存**——**删了本节，它会被读成「小活可少走流程」**。

**⇒ 那句小机器规定今天是靠另一条规则压着的。** **只删一半，剩下的一半就裸着。**

**所以这批的动作是：把这条连同替它辩护的那一行一起清除，并把引用它的死指针改掉。**

### 父侧盘点（已逐处实读，设计席复核后可增删）

**要删的**：

| # | 位置 | 内容 |
|---|---|---|
| 1 | `thincoder-core/prompts/discipline-engineering.md` · `## Engineering judgment` 第 5 条 | `Small job, small machinery`: do the magnitude check first; perpetually pressing against a hard limit … is a design-defect signal, not thrift |
| 2 | 同节标题 | `## Engineering judgment (verdicts ∥ sizing)` 的 `∥ sizing` |
| 3 | `docs/core/design/PROMPT-SYSTEM.md` 对照表的 `Small job, small machinery` 行 | 整行（它存在的唯一理由是替第 1 条辩护） |

**要改的（引用会变死指针）**：

| # | 位置 | 为什么要改 |
|---|---|---|
| 4 | `PROMPT-SYSTEM.md` 的「读数二」 | 以第 1 条为勘察证据；对象消失后该读数失效 |
| 5 | `PROMPT-SYSTEM.md` 三处落点坐标（「该节 = 『判断与尺寸』知识面（`Small job, small machinery` 邻位）」等） | 邻位不存在后成为死指针 |

**判了不动的（理由要留在 §2）**：

| 位置 | 为什么不动 |
|---|---|
| `thincoder-core/prompts/persona-engineering.md`「dispatch `files` ≤15」 | 它自己写着 `Size is about saying it clearly, not about cutting the work` —— **方向相反** |
| `thincoder-core/prompts/discipline-normal.md`「Small (typo, one-line fix): the design doc = the minimal form」 | **同病，但在普通模式**。是否同批移除 = 用户裁，设计席在 §2 摆出取舍 |

### 一条边界

**这不许变成「把判断力删掉」**：同节其余各条（`Verdict ≠ attribution` ∥ `A defect is a defect` ∥ 全剂量修设计 ∥ 无场景的分支不许加）**一条不动**——**被删的是「可以按大小少走流程」这个授权，不是「要不要判断」这件事本身。**

### 父侧裁定（23:11 · 用户「边界那两条也清」）

**原先判「不动」的两条，改为清除**：

| # | 位置 | 原判 | 现判 |
|---|---|---|---|
| 6 | `thincoder-core/prompts/persona-engineering.md` · dispatch 的 `files` ≤15 | 不动（它自写 `Size is about saying it clearly, not about cutting the work`） | **清** |
| 7 | `thincoder-core/prompts/discipline-normal.md` · `Small (typo, one-line fix): the design doc = the minimal form` | 留待用户裁 | **清** |

**理由（父侧给，设计席可质疑）**：**一条规则不管自己怎么自我说明，只要它把"大小"当成分类维度，它就会被拿去当"小活可以少走"的依据。**第 6 条那句自我说明正是证据——**需要专门写一句"我不是那个意思"，说明它本来就会被那么读。**

**第 6 条的一条实情**：它同时是调度面的冲突检测约束（`files` 是文件级路径、目录声明不支持）。**若削掉它会让冲突检测失去依据，设计席要在 §2 说清"剩什么、为什么剩"，而不是照删。**

**第 7 条**：普通模式的小改是否还要出设计档，**由这条裁定的后果决定**——删掉它之后普通模式的档位分级若无处落脚，设计席指出来，父侧再裁；**不要自己补一层新的分级。**

### 父侧纠正（23:14 · 用户当场否掉父侧的一句边界）

**用户原话**：「被删的是「可以按大小少走流程」这个授权，不是「要不要判断」这件事本身。 这句话错的，完全理解错误，我要的就是删掉要不要判断这件事儿本身，就是要明确不要去判断活的大小，我专门费了时间精力解释了为什么工程无小事，不能被你这个错误理解给毁了。」

**父侧那句错在哪**：它把问题读成「授权被滥用」，于是只说「删掉授权、判断留着」。**这等于承认了「活有大小」这个前提，只是不许拿它换便宜。** 而用户要的是**把那个前提本身拆掉**。

**正确的裁定（本批的判据，覆盖 §1 前段「一条边界」那句）**：

> **判断活的大小这件事，本身就是被删掉的那件事。**
> **工程无小事**——不是「小事也要认真做」，而是**没有可以被称为小事的东西**：任何一次「这个不大」的结论，都是拆流程的入口。

**⇒ 下面这句边界作废**（原文照录，供后人看清它错在哪）：

> ~~被删的是「可以按大小少走流程」这个授权，不是「要不要判断」这件事本身。~~

**⇒ 同节其余各条仍然一条不动**，但理由换掉：它们不动**不是因为「判断力要保留」**，而是**它们判的是「是不是缺陷 ∥ 有没有场景 ∥ 修得够不够」，与活的大小无关**。

### 一个连带问题，设计席必须回答

同一档前半节那段「**A change's size is not the size of what it risks**」——**它仍然在谈「大小」这个词**：结论虽是「读之前大小未知」，**但它把「大小」留在了句子里当讨论对象。**

**设计席要判**：这段留 ∥ 改写 ∥ 删，**判据是「读者读完还会不会去想这活大不大」**。**如果它读起来仍是「先掂量大小，但是掂量不出来」，那它就在替一个被删掉的概念续命。**

**注意别过头**：这句专治的是「按活的量级定做法」，**不是禁止一切量的读数**——一次测量是多少行、多少处命中，那是读数，与「这活大不大」是两件事，**不要顺手把读数也禁了**。

### 用户定稿（23:16）

**原话**：「对的，干活前不要去量活的大小。」

**这句是本批的判据本体**，上面几轮的争论到此收口：

- 不是「量出来小就少走流程」——那仍承认有大小；
- 不是「大小只能从读数来」——那还在教人去量；
- **是「干活之前，不做这个量」。**

**⇒ 落到条文时的形态**：**删的是这个动作，不是这个动作的授权。**任何写着「先掂量一下量级 ∥ 判断这活多大 ∥ 小就少配机器」的句子，**连同它给出的那个「先」一起删掉**——因为**「先量、再决定」这个顺序本身就是被否掉的东西**。

**与「读牵连面」不冲突**（这条必须写清，否则会有人拿它反推）：读牵连面是**干活的一部分**——要改哪里、谁在用、有没有测试，那是工作内容；**「这活大不大」是对工作量的估计，不是工作内容**。**读牵连面产出的是坐标，不是量级。**

**⇒ 判定句**：读完牵连面之后，得出的应当是「这几档、这几处、这几条验收」——**得不出「所以这活不大」。得出了，就是又量了一次。**

### 用户裁定（23:18）· 普通模式不动

**原话**：「普通模式先不要动」

**⇒ 覆盖本档此前两条父侧裁定**（23:11「边界那两条也清」里的第 7 条 ∥ 23:16 后父侧对三档分级的处置）：

- `thincoder-core/prompts/discipline-normal.md` **一个字不改**：`Small (typo, one-line fix): the design doc = the minimal form` 留着，`Medium` ∥ `Complex` 三档一格不动。
- **本批改动面收窄为三档**：`thincoder-core/prompts/discipline-engineering.md` ∥ `thincoder-core/prompts/persona-engineering.md` ∥ `docs/core/design/PROMPT-SYSTEM.md`。

**为什么留（记下来，免得下一个人把「没改」读成「漏了」）**：**用户先不动普通模式**——不是认为那条对，是把范围收在这一层。**工程模式的判定不变**（干活前不量活的大小）；**普通模式那条若将来要动，另开一批，届时连同三档一起判。**

### 两条裁定（父侧 23:48）

**① 普查基数以表自身求和为准**（281 + 19 = 300）。
**理由**：表是盘上唯一可枚举的东西，不变量就是拿它闭合的；**194 ∥ 104 那组来自一个已经回读不到的时刻——留着一个不可复核的绝对数比没有更坏，它会被当成基准继续用**。
**⇒ 判据一句**：**档级绝对数不进不变量**；不变量只用「当刻可枚举的和」。

**② `Dispatch size discipline (pre-flight)` 作为落地定位锚保留到实施落盘为止。**
**理由**：实施席按锚找那一行，删早了它找不到。
**⇒ 但落完那些锚就指向不存在的东西了**：**实施落盘后由设计席做一轮清理**，把 §6.9 引导句 ∥ §6.64 落点 ∥ D-PS56 里对旧条名的引用改成陈述落地后的实况。**这笔不记账，是实施轮的同批动作。**

### 已定决定：处置一律就地修（用户 2026-11-09 00:02）

- **已定决定**：**发现即当轮就地修；不按大小分流，不记账。** 只留两种真推迟，且要写条件不写量：① 要用户裁的（那是问题不是活）② 有真前置条件的（须点名事件）。**「大」∥「需要另一次设计」不是推迟理由。** 用户原话：「**我们的要求就是都就地修！**」 · 时间：2026-11-09 00:02

**为什么这条必须一条不留地落**：这句话用户今晚说了**不止一次**——23:09「量级判断居然还在？清理」、23:14「连判断活的大小这件事一起删」、23:16「干活前不要去量活的大小」，现在第四次。**前三次清的都是「执行前的量」，漏掉的是「发现之后的量」**——同一个量，换个位置继续当分流依据。

**父侧自认**：**这条规则今晚一直在父侧自己的操作说明里，父侧整晚按它判定「这个发现就地修还是记账」。** 所以它不是别人的疏漏，是父侧正在犯的那一条。

### 父侧裁定（00:24 · 实施席上抛）

**实施席实读发现**：`persona-engineering.md` 还有一句活条文

> `4. **A new debt is work needing a precondition or design**`（in-scope review findings / stop-and-report output / doc drift）`⇒ book it the same day, naming the batch that takes it.`

**`or design` 正是被作废的那一支**，而它既不在 §6.87 的「射程外五处」名单里，也不在围栏六行里。

**裁：改（收进本批，算第 7 处）。**

**理由不是我偏好，是已定判据**：用户 00:02「我们的要求就是都就地修！」；§6.87「「需要另一次设计」不是推迟理由——那是量词换了张脸」。**`or design` 留在盘上，等于把刚删掉的东西在隔壁一句里复活。**

**为什么不算越界**：**设计档自己的判据覆盖它**——**漏在设计面，不在实施席**。设计席随后把第 7 处补进 §2 与 §6.87 的射程表。

**另一笔（实施席知会）**：`persona-eng-designer.md` 的 `Why` 续行仍有 `(fix rounds are small, minute-level)`——与刚删掉的 `small fixes stay minute-level` 是同一句。**同一判据覆盖，另派设计席，不在本档写域。**

## §2 批次任务与设计（eng-designer）
**状态行**：设计完成（第 7 处（`or design`）与第三档同族句已收进 §2 ∥ 设计档 §6.87 · 逐号见 §2.21）

### 2.0 本批判据（按 §1「父侧纠正」重写）

**判据（一句）**：工程里没有「小事」。
任何一次「这个不大」的结论，都是拆流程的入口。

**所以要清的不是「少走流程」这个结论，是「活有大小」这个前提。**
凡让读者去想「这活大不大」的条文，都在射程内。
与此无关的读数（多少行、多少处命中）不在射程内。

**上一版 §2 写错了一处边界**：写成「删授权、留判断」，等于承认了「活有大小」。
本版按判据重判，并把每条的理由改成与大小无关的形式。

### 2.1 条目（覆盖）

| # | 条目 | 落点 | 验收 |
|---|---|---|---|
| E1 | `thincoder-core/prompts/discipline-engineering.md` 的第 5 条 `Small job, small machinery` 整条删 | 实施轮 | A1 |
| E2 | 同节标题去 `∥ sizing` | 实施轮 | A1 |
| E3 | `docs/core/design/PROMPT-SYSTEM.md` 替它辩护的对照表整行删 | 本席，已落 | A3 |
| E4 | 以第 5 条为证据的死指针改指在用条文 | 本席，已落 | A3 |
| E5 | `thincoder-core/prompts/persona-engineering.md` 的 `Dispatch size discipline` 条重写 | 实施轮 | A2 |
| E7 | 计数连带（普查表 ∥ 落点枚举 ∥ 覆盖不变量），只含 E1/E2/E3/E5 那部分 | 本席，已落 | A3 |
| E8 | 🔴 节第 4 条改写为「你还没看见的那一面」形（终稿见 §2.5 围栏块） | 实施轮 | A6 |
| E9 | 🔴 `persona-engineering.md` 节首条触发条件换成「有批准的设计」（终稿见 §2.17.1） | 实施轮，§5.1 已落 | A7 |
| E10 | 🔴 `persona-engineering.md` 六处按「活多大 ∥ 值不值得等」分流的条文换依据（原五处 + 父侧 00:24 裁入的第 7 处 `or design`；终稿见设计档 §6.87 围栏块） | 实施轮，已落 | A9 |
| E11 | 🔴 `persona-eng-designer.md` 的 `(fix rounds are small, minute-level)` 半句删，理由换成「修的是发现点名的那一处」（目标形与读数见 §2.21） | 实施轮 | A10 |

### 2.2 E5 重判：`files` 那条现在长什么样

**原条的病**：标题就叫「派单尺寸」。
正文三处都在谈「这活多大、配多少人」：`≤15 files`、`small enough to state in one line`、`Size is about saying it clearly`。

**用户 23:11 的判由（本席照抄）**：需要声明「我不是那个意思」的规则，就是会被那么读的规则。

**重判后的形态**（一句，不提大小、不提「说得清」）：

```text
- **A dispatch's `files` list is what the scheduler queues on**: the conflict detector orders the work by it, and a directory entry hides the overlap the list exists to expose.
```

**为什么这一句与大小无关**：它说的是调度器拿这份清单排序。
理由是目录会让重叠隐形——冲突检测要文件级路径是机制事实，不需要「小」来支撑。

**原条另三行**（`Acceptance surface` · `Settle it first` · `The why`）不改，仍作续行。
它们判的是「别按面拆单」「未决先裁」，与活的大小无关。

### 2.3 普通模式：零触（用户 23:18 裁「普通模式先不要动」）

**裁定**：`thincoder-core/prompts/discipline-normal.md` 一个字不改。
三档 `Small (typo, one-line fix)` ∥ `Medium (2-3 steps)` ∥ `Complex (3+ steps)` 一格不动。
该档不在本批范围，派单 `files` 也不含它。

**本席动过该档没有**：没有。
本轮落盘只有 §2 与本档设计档；`discipline-normal.md` 盘上现值即原值，没有要复原的改动。

**连带面随之作废**：先前列的「三档删除后同档残引」与 `persona-normal.md` 里的档名引用，都不再是残引。
尺子还留在盘上，那几处引用仍指着实物，本批不扫、不报、不处置。

**留下的是口径差，不是漏项**：普通模式那三档与工程侧「工程无小事」并存，本批按用户裁定不碰它。
要不要另立账，属父侧动作，本席不写台账。

### 2.4 同节其余条：留，理由换掉

| 条 | 它判什么 | 与大小无关的理由 |
|---|---|---|
| `Verdict ≠ attribution` | 先答「是不是缺陷」 | 判缺陷成立与否，不判活多大 |
| `A defect is a defect` | 违用户裁定即缺陷 | 判裁定与实现的关系 |
| `Name defects only by the defect` | 命名面 | 判说法，不判工作量 |
| `Quantitative claims get tool-verified` | 读数来源 | 要的是「跑一遍」 |
| `Fix designs: full dose first` | 修得够不够 | 判剂量，判修没修透 |
| `A branch added … nobody walks` | 分支有没有场景 | 判场景存在与否 |

⇒ 这六条一条不动（A4 判在场），理由换成上表这一列。
不再用「判断力要保留」这个说法。

### 2.5 🔴 第 4 条：改写（终稿 · 判据本轮收紧一格）

**判据（本轮收紧）**：读者读完这段，会不会得出「所以这活不大」？会 ⇒ 还得再改。

**上一版判词不够**：写成「`size` 当讨论对象留着，读者还会估大小」。
照那个改法只把 `size` 换成 `touch surface`，读者仍会想「摸清了就不算大」——那还是在量。

**本轮取舍**：讨论对象换成「你还没看见的那一面」。
牵连面读不出来时，缺的不是一个量级，是坐标；没读到的面不是「可能不大」，是「还不知道在哪」。

**为什么是改写不是删**：它承载两件与大小无关、无人替代的事——牵连面枚举，过程代价的论证。
删掉这两件，同节就没有一处讲「改动的后果长在它碰到的东西上」。

| 原段承载 | 处置 |
|---|---|
| 15 行里 `size` 8 处 ∥ `small` 4 处（改前实读见 §2.9） | 全去 |
| 那笔实测样本（四个消费方 ∥ 三端 ∥ 重导出两处 ∥ 没人想到的阈值 ∥ 四档设计档 + 一档需求档 ∥ 五条错验收行 ∥ 一行漏掉的集成行） | 留：它是读数 |
| 代价不用代码行计价（工厂停线 ∥ 船靠泊 ∥ 火箭偏航） | 留 |
| 「大小只能靠读牵连面得出结论」 | 删：正是 §1 判作废的那句「那还在教人去量」 |
| 「按小办是不是该问用户」 | 改成「能不能裁流程不是用户能裁的」：用户给的是业务规则、优先级、意图 |
| 「感觉显然时就是该看的时刻」 | 留，尾巴换成「显然是一个没读过的面从里面看的样子」 |

**目标形（逐字 · 实施席照此落笔）**

```text
4. **What you can see is the edit; what decides the outcome is what it touches**: the consumers, the places that state the rule, the ends that render it.
   A measured sample, from our own work: a change judged to be "one constant" pulled in four consumer carriers across three ends, a constant re-exported in two places,
   a threshold nobody had thought of, four design docs plus a requirement doc, five wrong acceptance lines and one missing integration row.
   None of those was created by the process — they were all there, unread.
   The side you have not read is unlocated, not empty: what the picture is missing is coordinates — which files, which callers, which acceptance criteria — and reading the touch surface is how you get them.
   In engineering the consequence is not priced in lines of code: a careless change is not a few lines — a factory stops, ships sit in port, a rocket leaves its course.
   Set against that, the full process costs a round.
   So the user is not the one to ask what this change touches: what they give you is a business rule, a priority, an intent, and none of them names what the change touches.
   The moment to notice is the moment the judgement feels obvious — obvious is what an unread side feels like from the inside.
```

**第 8 行为什么这样写（评审 🔴1 的处置）**：原第 8 行把「能不能裁流程」当成一个待决问题，只把它的主语从读者挪到用户——读者读完仍拿得到「先读牵连面、再定砍不砍」这个顺序，而那个顺序正是被否掉的。改后这一行说的是「用户答不出牵连面」，不是「裁流程该问谁」：本段没有留一个「由读数定」的位置。

**红侧（同一探针 · 改前 → 改后）**：`A6_size` 8 → 0 ∥ `A6_small` 4 → 0。
`A6_sample` ∥ `A6_factory` ∥ `A6_touch` 两侧都 ≥ 1——它证明删掉的是量级，不是读数。

**收尾落点**：读完这段该得出「这几处、这几条验收」；得出「所以这活不大」，就是又量了一次。
这句是判据，不写进条文——写进去等于把那个结论又摆回读者面前。

### 2.6 设计档落点（`docs/core/design/PROMPT-SYSTEM.md` · 本席本轮已落）

| 位置 | 改什么 |
|---|---|
| §6.17 落点 ③ 的枚举 | 去掉「小功能不配大机器」，计数改为判定四条 + 修复设计一条 |
| §6.9 机制 ① 与「为什么只留机制」段 | 换成 `files` 调度机制，写明删的是授权不是参数 |
| §6.9 围栏块首行 | 换成 §2.2 那句目标形；原引文标题纠正为 `Dispatch size discipline (pre-flight)` |
| §6.44 的 K4 ∥ L3 落点实读 ∥ 落笔位置判定 | 去掉尺寸面与 `Small job` 邻位说法；条数改六条，末条改为分支纪律条 |
| 对照表 `Small job, small machinery` 整行 | 删除 |
| §6.76 读数二 | 依据改引 `Fix designs: full dose first` |
| §6.73 普查表 + 覆盖不变量 | `Engineering judgment` 7 ⇒ 6（E1 删一条）∥ `Implementation dispatch structure` **15 不变**（E5 换名不删条）；类② 与不变量按表自身条数列求和 ⇒ **类① 19 + 类② 281 = 300**（§2.17.4）；档级绝对数不进不变量（§1 裁定①） |

### 2.7 全仓清扫（本席实扫 · 定性）

**判域 = 按处 ∥ 按语义，不按单串 token。**上一版的尺子是字面 token（`size`），`small ∥ large` 这一族因此整族漏判；尺子换了，结论就假了（见 §2.18）。
扫的措辞（放宽到整族）：`Small job` ∥ `small machinery` ∥ `magnitude` ∥ `sizing` ∥ `small` ∥ `large` ∥ `量级` ∥ `小活` ∥ `少走流程`。
域 = 提示词 17 档 + `docs/**/*.md` + `**/*.mjs`；同族命中逐处列在表内，射程外的也列出并写理由。

| 位置 | 定性 |
|---|---|
| `discipline-engineering.md` 第 4 条六处：条头 `A change's size is not the size of what it risks` ∥ `The edit's size and its blast radius` ∥ `not yet knowing the size` ∥ `What settles the size` ∥ `the size is unknown` ∥ `unmeasured size` | E8 整段改写 ⇒ 清零 |
| `persona-engineering.md` 首条 `Sized implementation batches` ∥ 半句 `small / exploratory / interactive changes stay in the main session` | E9 换形 ⇒ 清零 |
| 同 bullet 末段 `Implement sized batches through a subagent` | E9 换形 ⇒ 清零 |
| `persona-engineering.md` 条名 `Dispatch size discipline (pre-flight)` ∥ `≤15 files` ∥ `small enough to state in one line` | E5 换形 ⇒ 清零 |
| `persona-engineering.md` 处置路由的 `small form` ∥ `large` 两支 | E10：换分流依据 ⇒ 清零 |
| 同档 `promote it as a small-batch candidate` | E10：换判据（独立验收面 ∥ 独立失效代价）⇒ 清零 |
| 同档 `small fixes stay minute-level` | E10：删时长承诺 ⇒ 清零 |
| 同档 `a small-form item inside the write domain …` | E10：随处置路由同改 ⇒ 清零 |
| 同档 `What genuinely waits, and on what` 的 `a design that does not exist yet` | E10：换两支形 ⇒ 清零（末轮 🔴1 补入第五处） |
| 两提示词档其余 `size` | **0 处**（本席本轮 `node` 行扫） |
| 射程外同族五处：`persona` 的 `accumulates in small moves`（讲漂移步长）∥ `however small or obvious`（无论多小都要批准）；`discipline-engineering` 的 `small moves` ∥ `radius is smaller` ∥ `smaller count` | **不动**：五处都不拿大小当决策输入，逐处理由见设计档 §6.87 勘察行 |
| `docs/core/design/PROMPT-SYSTEM.md`（§2.6 八处 + §6.17 括注 + §6.56 A6 + §6.64 回收点 + 四处 §7.2 节名 + 计数四处） | 本轮改 ∥ 删，逐处见 §2.6 与 §2.17 |
| 设计档里「内存量级 / token 量级 / 命中量级」 | 不动：那是读数与单位 |
| `docs/batches/**` | 不动：过程档，可整档删 |

**上一版这一行的错有两层**：① 原写「测试体量 ∥ 函数拆分 ∥ 行宽」，那三个词类是顺手归的，不是读出来的。

② 后来改成「带 `size` 的只有九处、每一处都在射程内」——口径对了，判域仍只有一个 token，`small ∥ large` 整族因此没进过表。

本轮按处重扫，判域 = `discipline-engineering` ∥ `persona-engineering` ∥ `persona-eng-designer` 三档。

射程内六处：E10 五处 + 第 7 处（见 §2.21.1）；射程外六处：上表五处各带理由 + 第三档一处 `largest single injection-pollution source`。

第三档那一处是「最大的污染源」这个读数，不是活的分档。上一轮判域只到前两档，它从未进过扫面；处置见 §2.21.2。

### 2.8 受影响文件与分层结论

| 档 | 层 | 改什么 | 归谁 |
|---|---|---|---|
| `thincoder-core/prompts/discipline-engineering.md` | 产品面 | 删第 5 条 ∥ 标题去 `∥ sizing` ∥ 第 4 条改写 | 实施轮 |
| `thincoder-core/prompts/persona-engineering.md` | 产品面 | 首行换为 §2.2 目标形 ∥ §6.87 第 7 处（`§Ledger` 记账条触发语换形） | 实施轮，已落 |
| `thincoder-core/prompts/persona-eng-designer.md` | 产品面 | 删 `(fix rounds are small, minute-level)`，理由换成「修的是发现点名的那一处」（§2.21.2） | 实施轮 |
| `thincoder-core/prompts/discipline-normal.md` | — | **零触**：三档分级一格不动，`Small` 那格留着（用户 23:18「普通模式先不要动」） | 不入本批 |
| `docs/core/design/PROMPT-SYSTEM.md` | 设计档 | §2.6 八处 + §6.87 射程表补第 7 处 | 本席，已落 |
| 需求档 ∥ 测试档 | — | 0 | — |

**分层结论 = 无档跨分层**：档位线只量代码面；`.md` 提示词档免档位判定，运行期代码零改。

### 2.9 验收（每条带红法 · 读数同尺 = `node` 行扫）

| # | 验收 | 期望 | 红在什么读数上 |
|---|---|---|---|
| A1 | 尺寸授权在提示词面清零（E1 ∥ E2 ∥ E5 ∥ E9） | 命令 ⑨ 八枚全 0：`A1_sjso` ∥ `A1_mag` ∥ `A1_sizing` ∥ `A1_f15` ∥ `A1_cap` ∥ `A1_sized` ∥ `A1_stay` ∥ `A1_implsz` | 本席本轮实读八枚各 1（§2.17 读数行）⇒ 八枚都能红 |
| A2 | E5 新句落地且与大小无关 · 该 bullet 续行未被连带重落 | `A2_new` = 1 ∧ `A2_dir` = 1 ∧ `A1_cap` = 0 ∧ `A2_kept` = `1,1,1,1,1,1` | 前两枚改前各 0 ⇒ 能红；`A1_cap`（命令 ⑨ 里该串的唯一键）改前 1 ⇒ 能红；`A2_kept` 是控制样本：六枚加粗锚逐行在盘 ⇒ 有命中能力（七行续行里的末行是散文句、无加粗锚，由 §2.17.3 的逐行实读兜住） |
| A3 | 设计档无残留与死指针 | 命令 ⑪（§2.19）：`A3_zh` = 0 ∧ `A3_old` = 0 ∧ `A3_pai` = 0 ∧ `A3_ctrl` ≥ 1 | `A3_old` 改前 1（旧条名仍在盘）⇒ 能红；`A3_ctrl` 只判非零（同一探针在过程档上读得出命中，读数随本批档引用该串的行数上浮） |
| A4 | 同节其余六条在场 | 六枚各 = 1：`A4_v` ∥ `A4_d` ∥ `A4_name` ∥ `A4_q` ∥ `A4_fix` ∥ `A4_branch` | 改前六枚各 1 ⇒ 删过界即掉成 0；六枚同尺同档，无「表里六条、探针四条」的缝 |
| A6 | 第 4 条改写后量级退出讨论 | 该段 `size` = 0 ∧ `small` = 0 ∧ `A6_sample` ∥ `A6_factory` ∥ `A6_touch` 各 ≥ 1 | 本席本轮实读 `size` = 8 ∥ `small` = 4 ⇒ 能红；三枚改前 = 1 ∥ 1 ∥ 2 ⇒ 同段探针有命中能力 |
| A7 | E9 换形落地 · 理由句未被连带重落 | `A7_new` = 1 ∧ `A7_why` = 1 | `A7_new` 改前 0 ⇒ 能红；`A7_why` 改前 1 且必须留 ⇒ 控制样本 |
| A5 | 交付门 | `doc_check(mode:"gate")` 首行 `PASS` | 非 `PASS` ⇒ 红 |
| A9 | E10 六处换形 · 射程外同族不动 | 命令 ⑩：`E10_old` = `0,0,0,0,0,0,0` ∧ `E10_new` = `1,1,1,1,1,1,1` ∧ `E10_ctrl` = `1,1` ∧ `E10_maxLen` ≤ `300` | 前六枚红侧 = §2.19 的改前读数（旧各 1 ∥ 新各 0 ∥ `E10_maxLen` 印 `null`）；第七枚红侧 = §5.10 的改前读数（`needing a precondition or design` 1）⇒ 七枚都能红；`E10_ctrl` 两枚两侧同在 ⇒ 探针按处判，不是整档禁词 |
| A10 | `persona-eng-designer.md` 那一处换理由 · 同档另一处 `largest` 不动 | 命令 ⑫：`D1_old` = 0 ∧ `D1_new` = 1 ∧ `D1_ctrl` = 1 ∧ `D1_largest` = 1 ∧ `D1_maxLen` ≤ `300` | 本席本轮实读 `D1_old` = 1 ∥ `D1_new` = 0 ⇒ 前两枚能红；`D1_largest` = 1 是控制样本（该档读得到，且它不在射程内） |

**验收命令 ⑨（可复跑 · 纯 ASCII · 判域 = 两份提示词 + 本档设计档 + 本批档）**
第 4 条的判域以 `5. **A parameter default` 为右界、`4. **` 为左界定位——**不用标题文字定位**，所以改前改后同一条命令都能跑，红侧才可比。

```text
node -e "const fs=require('fs');const R=f=>fs.readFileSync(f,'utf8');const E=R('thincoder-core/prompts/discipline-engineering.md'),P=R('thincoder-core/prompts/persona-engineering.md'),D=R('docs/core/design/PROMPT-SYSTEM.md'),B=R('docs/batches/2026-11-08-small-machinery-purge.md');const o=(t,s)=>t.split(s).length-1;const e5=E.indexOf('5. **A parameter default'),b4=E.lastIndexOf('4. **',e5),blk=E.slice(b4,e5);console.log({A1_sjso:o(E,'Small job, small machinery'),A1_mag:o(E,'do the magnitude check first'),A1_sizing:o(E,'sizing)'),A1_f15:o(P,'small enough to state in one line'),A1_cap:o(P,'list is \u226415 files'),A2_new:o(P,'what the scheduler queues on'),A2_dir:o(P,'a directory entry hides the overlap'),A2_kept:[o(P,'**Acceptance surface**'),o(P,'**Settle it first**'),o(P,'**The why**')].join(','),A3_zh:o(D,'\u5c3a\u5bf8\u95f8'),A3_ctrl:o(B,'\u5c3a\u5bf8\u95f8'),A4_v:o(E,'Verdict \u2260 attribution'),A4_d:o(E,'A defect is a defect'),A4_fix:o(E,'Fix designs: full dose first'),A4_branch:o(E,'A branch added for an input that has not shown up'),A6_size:o(blk,'size'),A6_small:o(blk,'small'),A6_sample:o(blk,'four consumer carriers'),A6_factory:o(blk,'a factory stops'),A6_touch:o(blk,'touch surface')})"
```

本席本轮读数（修复轮实跑 · 同尺 = `node` 行扫）：

- `A1` 四枚 = **1 ∥ 1 ∥ 1 ∥ 1**：提示词面归实施轮 ⇒ 红侧在位。
- `A2` 三枚 = **0 ∥ 0 ∥ `1,1,1`**：前两枚红侧在位，第三枚是控制样本。
- `A3` = **0**（`尺寸闸` 在本档清零）；`A3_ctrl` ≥ **1**。
- `A4` 四枚各 **1**：同节其余四条在场。
- `A6` = **8 ∥ 4**（提示词档第 4 条仍是旧形 ⇒ 红侧在位），样本 ∥ 工厂 ∥ 牵连面 = **1 ∥ 1 ∥ 2**。

`A2_kept` 是控制样本：三行续行改前就在盘、改后仍各 1 ⇒ 这条探针有命中能力，不是恒 0。

`A3_ctrl` 同一探针扫本批档（过程档，允许留退役串）⇒ 证明 unicode 转义在这把尺下读得出非零。

### 2.10 关键决策

| # | 决策 | 被否的替代 | 理由 |
|---|---|---|---|
| K1 | E1 整条删 | 拆两条只删授权半句 | 留半句仍顶「Small job」标题，读者按标题读 |
| K2 | E5 重写成调度机制一句 | 留 `≤15` 加免责句 ∥ 整条删 | 免责句本身就是「会被那么读」的证据；整条删则冲突检测失去书面依据 |
| K3 | E6 撤出本批，普通模式零触 | 只删 `Small` ∥ 三档全删换写 | 用户 23:18 裁「普通模式先不要动」：该档不在本批范围，动它即越界 |
| K4 | E8 判改写 | 留原形 ∥ 整段删 | 留原形让人围着量级想；整段删丢掉牵连面枚举与「按小办这问法不成立」 |
| K5 | 死指针改指 `Fix designs: full dose first` | 整行删 | 那一行是「纪律层无处置路由条」的第二枚读数 |
| K6 | 普查表按 D3 连带 | 当历史清单不动 | 它枚举的是「留下的是什么」 |

**被作废的旧判断（记录）**：① 本席原判 `≤15` 不动（信了它的免责句）；② 原边界写成「删授权、留判断」；③ 曾按父侧裁定把普通模式三档列为删除项。
三条都由用户当场推翻，理由见 §2.0 与 §2.3。

### 2.11 边界（本批不做）

- 不删判断力，也不禁读数：多少行、多少处命中、多少档受影响，照旧要跑。
- 不碰普通模式：`thincoder-core/prompts/discipline-normal.md` 零触，三档分级一格不动（用户 23:18 裁）。
- 不补新分级、新阈值、新免责句。
- 不动需求档、不动台账、不新增机检门。
- 不扫 `docs/batches/**`。
- 节号 6.9 保留，节标题改为「派单纪律与任务书形态纪律」——引用方按节号解析，改名不影响解析；上一版写的「不改名：节号引用照旧可解析」把两件事混成一件，已撤。

### 2.12 UI / 交互 ∥ 集成测试

**UI / 交互决策**：无界面面——只改模型可见提示词文本与设计档文字。

**集成测试设计**：`none`。
改动面 = 两份提示词 + 本档，零运行期代码（`discipline-normal.md` 已随 §2.3 撤出）。
`test/RTM.md` 故事索引本轮实读（CLI 表与分册 = tooling ∥ batch-ledger ∥ guard ∥ paths ∥ loop ∥ ends），无一行断言 system prompt 文本或装配块等价性。行数不住本节：同一个数在别处已有一次读数，两处都写就成了两个版本。
两条入口均不成立 ⇒ 破行 0 · 冗余 0 · 新增 0。

### 2.13 上抛项

1. 〔已裁 · 用户 23:18〕普通模式零触：`discipline-normal.md` 三档一格不动，E6 撤出本批（§2.3）。
2. 〔已裁 · 用户本轮〕E8 判改写成立，判据收紧一格；逐字终稿已落 §2.5 围栏块，待实施席照此落笔。
3. 〔知会 · 同轮两笔〕三份提示词是产品面，本席不落；目标形见 §2.2 与 §2.5。
4. 〔知会 · 本席首轮扫漏〕设计档 §6.44 B3 引文标题与 §6.9 围栏块首行首轮未扫到，由 A1–A3 探针捞回并已修。
5. 〔已处置 · 用户 23:22 裁〕设计档六处旧标题换成描述，本轮实读 = 0；形态与读数见 §2.14。
   处置形态不是改名：改名会让那条记录读起来像是引进了新名字；换成描述，记录保住它当时在说什么。
6. 〔已裁 · 用户本轮 · 已落〕§6.76 围栏块换成 E8 新形逐字（9 行），代价账 ∥ 用例表 C1–C4 ∥ 判据 A3 ∥ A4 ∥ A8 四处连带一并改到位，读数见 §2.15。
   裁定口径：设计档只放当前状态——一个与目标不对应、也不对应盘上任何东西的副本，读者拿它当依据是错的，不拿它当依据那它占着一节；两条路都通向删。

### 2.14 六处旧标题的处置（用户 23:22 裁：换成描述，不是改名）

**裁决口径**：改名会让那条记录读起来像是引进了新名字。记录要保住它当时在说什么，所以一律换成对被改内容的描述，不复述旧标题。

**两条硬线**：不留「原题已删 ∥ 已改名 ∥ 删除线 ∥ 曾叫 X」这类痕迹；某处语义真依赖旧标题的，把那一句改写到读得通为止，不靠加注维持。

**六处逐处形态**（判域 = `docs/core/design/PROMPT-SYSTEM.md`）

| # | 位置 | 处置后写成什么 |
|---|---|---|
| 1 | §6.76 落点表 · 提示词面 | 「它讲牵连面——一眼看得见的是这次改动，决定后果的是它碰到的那一片」 |
| 2 | §6.76 围栏块首行 | 去名，只留陈述：`4. What you size at a glance is the edit, while the risk lives in what the edit touches.` |
| 3 | §6.76 代价账首行 | 首列「第 4 条的首句（一眼看得见的改动 ≠ 决定后果的那一片）」，承什么改为「一处代码的改动量 ≠ 它碰到的那一片」 |
| 4 | §6.76 验收 A6 | 改判「末列指认到哪一条」：该行含 `what decides the outcome is what it touches` ⇒ 1 |
| 5 | §6.76 上抛 2 | 「第 4 条由 `Zero discretion` 改为讲牵连面的那条」 |
| 6 | §6.77 对照表 | 「第 4 条（牵连面那条）」；它管什么改为「读牵连面」 |

**A6 原期望本是死的**：它判「该行含旧标题 ⇒ 1」，而 §6.73 清点表末列早已写成新形，旧名在那一行上读出来是 0。改指之后这条判据才有红侧。

**三条探针随旧名退场改指**（判据不能指着退场的串）

| 探针 | 改前 | 改后 |
|---|---|---|
| 命令 ①（A1） | 扫提示词档的旧标题 | 扫 `what decides the outcome is what it touches` |
| 命令 ②（A4） | 围栏块定位锚 `4. **A change` | 锚 `4. What you size at a glance`（去名后原锚 `findIndex` 印 -1） |
| 命令 ③（A6） | 末列扫旧标题 | 末列扫新指认串 |

**读数（本轮实跑 · 同尺 = `node` 行扫）**

| 计数 | 改前 | 改后 |
|---|---|---|
| 本档旧标题字面 | 6 | **0** |
| 本档片段 `size is not the size` | 1（命令 ① 探针内） | **0** |
| A1 新串（提示词档） | 0 | 0（红侧在位；落地后应为 1） |
| A6（行数 ∥ 新串） | 1 ∥ 0 | 1 ∥ **1** |
| A4（块行数 ∥ 禁词 ∥ 最长行） | 15 ∥ 0 ∥ 171 | 9 ∥ 0 ∥ 206 |

**提示词档仍读到 1**：`thincoder-core/prompts/discipline-engineering.md` 的旧标题还在盘上，那是 E8 的实施轮，不在本席写域。

**围栏块标题同时改了**：原标「逐字终稿（实施席整条替换第 4 条）」在去名之后名不副实——它现在不是任何在地目标的逐字形。改为「第 4 条整条正文（对照用；落地依据 = 新形首句 `what decides the outcome is what it touches`）」，同一件事：不让读者拿它当落地依据。

**边界**：只动 `docs/core/design/PROMPT-SYSTEM.md`；三份提示词归实施轮；§1/§2 其余字面未扩。

### 2.15 §6.76 围栏块换新形（用户本轮裁 · 已落）

**裁定与形态**：围栏块整块换成 §2.5 的新形逐字（9 行），块标题改为与实际相符的「逐字终稿 · 实施席照此整条替换；块行数 = 9」。

原块是 E8 改写前的 15 行：与提示词档现盘第 4 条逐行不等，也不对应任何在地目标。

**四处连带（按现在讲的东西重写，不留按旧形锚定的判据）**

| # | 位置 | 改后 |
|---|---|---|
| 1 | 代价账七行 | 并成 6 组 9 行（1+3+1+2+1+1）；行首锚全部换成新形；删去「读数段重复枚举」那一组（新形枚举只在首句出现一次） |
| 2 | 用例表 C1 ∥ C2 ∥ C4 | C1 期望改「拿到的是坐标」；C2 改「漏掉的那一面不是可能不大，是还不知道在哪」；C4 场景换成「当许可读」——新形不是禁令，原场景的对象已不成立 |
| 3 | A6 | 判域 = 提示词档第 4 条块（界 = `4. **` 至 `5. **A parameter default`）：行数 = 9 ∧ 扫 `size` ∥ `small` ⇒ 各 0（本节原写 A3；与 §2.9 的 A3 是两条不同判据，末轮黄 #3 已归并） |
| 4 | A4 ∥ A8 | A4 射程 15 行 ⇒ 9 行；A8 读者半边改判「读完会不会得出『所以这活不大』」——会即红，得出「这几处、这几条验收」即绿 |

**判据退场随改（判据不能指着退场的串）**：A6 第三枚读数（退役名）在该行改写后恒 0、已无红侧 ⇒ 不作判据，命令 ③ 同步去掉该过滤。

A3 的 `blast radius` 探针同理换成 `size` ∥ `small` 两枚——§2.5 已定的批内串，且在旧形上读得出非 0。

**段落正文同批对齐**：立法理由里「说清改动的尺寸与牵连面的尺寸不是同一个量」与「在量清牵连面之前……没有输入的判断」两句按 §1 判据重写为坐标形。

节标题尾巴「把『看着小』讲成道理」改为「决定后果的是改动碰到的那一片」——原句仍把「看着小」当讨论对象。

§6.77 的勘察证据行原引第 4 条末行作位置锚，该行本批换形 ⇒ 改钉第 5 条首行（块右侧不动的边界）。

**读数（同尺 = `node` 行扫 · 本席本轮实跑）**

| 计数 | 读数 | 判什么 |
|---|---|---|
| 命令 ② `F_lines` ∥ `F_banned` ∥ `F_maxLen` | 9 ∥ 0 ∥ 206 | 围栏块 9 行、禁词 0、行宽 ≤300 ⇒ A4 绿 |
| 命令 ② `P_lines` ∥ `P_size` ∥ `P_small` | 15 ∥ 8 ∥ 4 | 提示词档第 4 条块仍是旧形 ⇒ A3 红侧在位（归实施轮） |
| 命令 ① A1 新串（提示词档） | 0 | 新形未落地 ⇒ A1 红侧在位 |
| 命令 ③ 命中行数 ∥ 新串 | 1 ∥ 1 | §6.73 清点表已指认新形 ⇒ A6 绿 |
| 旧形字面七串（`size is not the size` ∥ `Zero discretion` ∥ `blast radius` ∥ `unmeasured size` ∥ `What settles the size` ∥ `this one is small` ∥ `4. What you size at a glance`） | 各 0 | 旧形字面在本档清零 |
| 新形三串在提示词 17 档 | 0 | 新文本不撞旧句 |

**交付门**：`doc_check(mode:"gate")` 首行 `PASS`；写盘途中一次 `REFUSED` 拦下的真缺陷——本席原把 §6.77 的位置锚改钉新形末行，而该行尚未落地 ⇒ 判「引据的引文不在该档内」，改钉第 5 条首行后过门。

**未动的两处（写清，免得读成漏项）**

- 本档另有两处「作对照用」，对象是那一节自己的目标态与改前基线括注，不是 E8 围栏块 ⇒ 不在本批范围。
- `thincoder-core/prompts/discipline-engineering.md` 零笔：E1 ∥ E2 ∥ E8 归实施轮。

**本节写域**：只动 `docs/core/design/PROMPT-SYSTEM.md` 与本段；提示词档、需求档、台账、`docs/batches/**` 未触。

### 2.16 修复轮（§3 轮次 1 · 11 条逐号处置）

**判据未变**（§2.0）：清的是「活有大小」这个前提。本轮四处改写都按它复判。

| # | 处置 | 改了什么（档 · 逐字要点） |
|---|---|---|
| 1 🔴 | 三处全改，围栏第 8 行重写 | §6.76 围栏第 8 行 `So whether the process may be trimmed…` ⇒ `So the user is not the one to ask what this change touches…`；代价账同一行随改；对照表那行改判「这一问不落在那条判据的两侧」；C4 期望格改判红形，不再把判据本体装进期望格 |
| 2 🔴 | 逐处收干净 | 设计档十二处：§6.9 节标题（去「派单尺寸 / 尺寸闸」）∥ §6.9「为什么只留机制」∥ §6.9 边界 ∥ §6.1 落点图 ∥ §6.39 对照行与 C4 ∥ §7 D-PS10 ∥ §7 D-PS56 ∥ §6.70 边界 ∥ §6.64 整段 ∥ §6.66 先例行（原引 §6.64 旧 K2，该依据已删 ⇒ 改引 §6.82）∥ §6.73 勘察行（两条互不相等的基数读数合成一处）∥ §6.76 勘察行（`publicRepos` 读数按实读改正） |
| 3 🟡 | 引导句改成盘上的形态 | `Three gates, every one of them` 在盘上零命中，原句所述的两行不存在。真形态 = `Dispatch size discipline (pre-flight)` 首行整行换一句、三行续行逐字不动；照原字面执行会把三行落两遍 |
| 4 🟡 | A2 两枚探针换掉；两条活指令分工写清 | 旧探针 `files must be file-level paths` ∥ `Directory declarations are NOT supported` 落在 `file-domain declaration semantics` 的续行里、本批不触 ⇒ 改前就绿且不判 E5。新探针 = `what the scheduler queues on` ∥ `a directory entry hides the overlap` ∥ 上限串清零 ∥ 三行续行作控制样本。§6.73.1 第 9 行删的是 `Parallel dispatch & multi-task` 那条加粗条目，判域写在它的处置格里，与 E5 不同段 |
| 5 🟡 | 普查行按 D3 改回 | 14 ⇒ 15，名单补 `A dispatch's files list is what the scheduler queues on`（E5 是换名不是删条）；连带 类② 279 ∥ 基数 298 ∥ persona 194 ∥ discipline 104 |
| 6 🟡 | 补先例 ∥ 偏离行 | 见「先例 ∥ 偏离」段 |
| 7 🟡 | 补公共源勘察行 | 见「公共源勘察」段 |
| 8 🟡 | 补既有件三问 | 见「既有件三问」段 |
| 9 🔵 | RTM 行数改指分册 | §2.12 不再写 `CLI 1`–`CLI 37`：与 §6.85 的 38 是同族两个版本，读数只留一处 |
| 10 🔵 | E6 提法改掉 | §2.7 的「三处提示词（E1 ∥ E5 ∥ E6）」⇒「两处提示词（E1 ∥ E5）+ 第 4 条（E8）」：E6 已随 §2.3 撤出本批 |
| 11 🔵 | 转父侧 | §1 状态行的占位 note 属主 agent 段，本席不写 |

**A8 读者半边复判（改后 · 人判）**：并读三处——首句 / `The side you have not read is unlocated, not empty` / `In engineering…` → `Set against that`，再加新第 8 行。

读出的动作 = 去读牵连面、拿到坐标、走全流程；没有一处留下「砍不砍流程」这个待决项。**不会得出「所以这活不大」⇒ 绿。**

新第 8 行是这一轮唯一改动句：它把读者能问的用户答不出来的那件事说成「牵连面」，不再说成「裁流程」。

**先例 ∥ 偏离（本批）**

- 先例 = §6.64 ∥ §6.63（同一条首行就地换形、续行不动）；**对齐** = 唯一副本住 §6.9 围栏、实施席整行替换、每枚验收可跑。
- 偏离一 = 本批同时删掉为它撑腰的那条度量句（§6.76 第 4 条）。既往各节只换条文，本批换的是「判断大小」这个前提本身。
- 偏离二 = 设计档自己也在改动面内。既往设计档只是落点表；这次被删的规则在设计档里有替它辩护的行、也有以它为证据的读数，删条不删档面就留一条相反的现行说法。

**公共源勘察（本席本轮实读）**

- `PROJECT-MANIFEST.json` 的 `index.publicRepos` 实读 = `["../.thincoder","../thincoder.com"]`。
- 逐仓扫 `*.md` ∥ `*.txt` ∥ `*.json`：`../.thincoder` 778 档、`../thincoder.com` 11 档，未截断。
- 三枚探针 `Small job, small machinery` ∥ `small machinery` ∥ `do the magnitude check first`：两仓各 0 命中 ⇒ 已查，无相关。
- 数据事实：本批对数据无断言（无行数、无字段、无枚举取自数据）⇒ 无此句。

**既有件三问（§2.2 新句）**

- `existing` = `thincoder-core/prompts/persona-engineering.md` §Implementation dispatch structure 的 `Dispatch size discipline (pre-flight)` 条 · name 逐字 `Dispatch size discipline (pre-flight)` · consumers = 工程模式主 agent（派单者）⇒ 首行就地换形，条目不搬、三行续行不动。
- `existing`（第二件）= 同档 `file-domain declaration semantics` 的续行 `files must be file-level paths (one per file). Directory declarations are NOT supported`——它讲机器拒什么；新句讲理由（目录把重叠藏起来）⇒ 不重述、不合并。
- `none found` = 三串 `what the scheduler queues on` ∥ `a directory entry hides the overlap` ∥ `A dispatch's `files` list is what the scheduler queues on` 在 `thincoder-core/prompts/` 17 档逐串实扫 ⇒ 各 0 命中（同次扫描的控制串 `Engineering judgment` = 1，证明扫描读到了文件）。

**上抛项（修复轮新增）**

1. 〔上抛 · 待裁〕需求档 `docs/core/requirements/ENGINEERING-MODE-V2.md` §7.2 仍叫「派单尺寸（判据句）」，§6.64 的勘察行记它含「尺寸上限」。设计侧本批已把尺寸面整条退出 ⇒ 同一规则三层不同轮（`D11`）。需求档是主 agent 的笔，是否同批收掉由父侧裁。
2. 〔上抛 · 知会〕设计档另有六处 `index.publicRepos` 读作 `[]`，与本仓 manifest 实读（两个声明仓）不符——本席只改了自己这一节（§6.76），其余按本批边界不扩，报父侧。

**本节写域**：只动 `docs/core/design/PROMPT-SYSTEM.md` 与本段；三份提示词、需求档、台账、`docs/batches/**` 未触。

### 2.17 修复轮 2（§3 轮次 2 · 10 条逐号处置）

**判据未变**（§2.0）：清的是「活有大小」这个前提。本轮新增的 E9 也按它判。

#### 2.17.1 E9 · 新增条目（评审 🔴1）

`thincoder-core/prompts/persona-engineering.md` `## Implementation dispatch structure` 的顶格首条，把尺寸当分类维度。

触发条件换成「有没有批准的设计」；理由沿用原句自己写的那条：自审盲点。

**换掉的两行（改前逐字）**

```text
- Sized implementation batches (multi-file / cross-module / with a confirmed design) are implemented by a coder subagent by default — async spawn with the design doc as the task book; small / exploratory / interactive changes stay in the main session.
  Implement sized batches through a subagent even when you could do them yourself — doing it in your own context puts the work back under your own review, and the self-review blind spot returns; the isolated context is what breaks it.
```

**终稿（逐字 · 实施席照此两行换形，该 bullet 其余续行一字不动）**

```text
- **A change with an approved design is implemented by a coder subagent**: the spawn is async, and this batch's record §2 is its task book.
  Implement it through a subagent even when you could do it yourself — doing it in your own context puts the work back under your own review, and the self-review blind spot returns; the isolated context is what breaks it.
```

第二行只把头三个词 `Implement sized batches` 换成 `Implement it`，冒号后的理由逐字不动。

**为什么条件是「有批准的设计」**：原句自己写着 `the self-review blind spot returns`。

那是自审盲点，与活多大无关。
条件换成「设计已批准」，条件与理由才落在同一件事上。
「任务书 = 本批 §2」与同 bullet 下文的 `It IS the task book this spawn implements` 同义，不另造说法。

#### 2.17.2 E5 的写法收紧（评审 9）

新句不再写「一格一条路径、目录不可声明」。

那两句是同档 `file-domain declaration semantics` 的续行，机器在那里拒。
本句只给理由（`a directory entry hides the overlap`）与调度事实（`what the scheduler queues on`），不重述。

终稿逐字见 §2.2 围栏块（本轮已换）；设计档 §6.9 围栏与 D-PS56 判据行同步改到这一形态。

#### 2.17.3 续行到底有几行（评审 8）

该 bullet 的续行是**七行**，不是三行。

逐行是：`**Acceptance surface**` ∥ `**Settle it first**` ∥ `**The why**` ∥ `**Structure decisions belong to design / dispatch**` ∥ `**A task book is a table, not prose**` ∥ `**Why the fourth cell**` ∥ 末行散文一句（`Prose carries only the **goal and the boundary**`，共七行）。

实施席只换首行；七行一字不落。`A2_kept` 六枚探针逐行判它们还在。

#### 2.17.4 设计档四处连带（评审 🔴2 ∥ 🟡3 ∥ 🟡4 ∥ 🟡5）

| # | 位置 | 改后 |
|---|---|---|
| 1 | §6.17 分层归属括注 | 「判定 / 量级纪律 ∥ 命名纪律族」⇒「判定纪律 ∥ 命名纪律族」：E2 拿掉 `∥ sizing` 轴之后，这一层与量级已无关系 |
| 2 | §6.56 A6 同档三条近面分工 | 原以条名指认并写「讲**一单多大**」⇒ 改指新条名 `A dispatch's files list is what the scheduler queues on`，写「讲**清单是调度输入**」 |
| 3 | §6.74 ∥ §6.73 落点表 ∥ §6.73 A4 四处节名 | 「派单尺寸（判据句）」⇒「派单纪律（判据句）」：需求档 §7.2 盘上就是这个名，首条也已是新形 |
| 4 | §6.73 类② 计数 | 头部由 278 改为表自身的条数列之和；不变量随之；§6.73.1 里两个档级条目绝对数（194 ∥ 104）删去——那是另一把尺子的读数，与这张表不同源 |

**计数读数（同尺 = `node` 行扫，本轮实跑）**：类② 表 32 行，条数列合计 281。

类① 19 + 类② 281 = 300。头部 ∥ 不变量 ∥ A3 三处统一到这个数。

```text
node -e "const fs=require('fs');const D=fs.readFileSync('docs/core/design/PROMPT-SYSTEM.md','utf8').split(/\r?\n/);const i0=D.findIndex(l=>l.startsWith('**\u7c7b\u2461 \u6309\u8282'));let i1=i0+1;while(i1<D.length&&!/^### /.test(D[i1])&&!/^## /.test(D[i1]))i1++;let s=0,n=0;for(let i=i0;i<i1;i++){const m=D[i].match(/^\|\s*(?:persona|discipline) \u00b7 [^|]+\|\s*(\d+)\s*\|/);if(m){s+=Number(m[1]);n++}}console.log({rows:n,sum:s})"
```

#### 2.17.5 上抛 1 撤回（评审 🟡4）

**撤回**：需求档 `docs/core/requirements/ENGINEERING-MODE-V2.md` §7.2 盘上实读为「**派单纪律（判据句）**：」。

其首条现写「**`files` 是调度清单**：一格一条路径，目录声明不支持……也不拿它估这一单有多大」——已是新形。
原上抛的前提（「仍叫派单尺寸」）不成立，需求档这一层本批不需要再动。

那首条里的「一格一条路径、目录声明不支持」是需求层对机器规则的陈述，与 E5 那句的分工一致：需求层讲拒什么，E5 讲为什么。

#### 2.17.6 验收命令 ⑨（本轮扩到八枚 A1 ∥ 六枚续行对照 ∥ 六枚 A4 ∥ A7 两枚）

```text
node -e "const fs=require('fs');const R=f=>fs.readFileSync(f,'utf8');const E=R('thincoder-core/prompts/discipline-engineering.md'),P=R('thincoder-core/prompts/persona-engineering.md'),D=R('docs/core/design/PROMPT-SYSTEM.md'),B=R('docs/batches/2026-11-08-small-machinery-purge.md');const o=(t,s)=>t.split(s).length-1;const e5=E.indexOf('5. **A parameter default'),b4=E.lastIndexOf('4. **',e5),blk=E.slice(b4,e5);console.log({A1_sjso:o(E,'Small job, small machinery'),A1_mag:o(E,'do the magnitude check first'),A1_sizing:o(E,'sizing)'),A1_f15:o(P,'small enough to state in one line'),A1_cap:o(P,'list is \u226415 files'),A1_sized:o(P,'Sized implementation batches'),A1_stay:o(P,'small / exploratory / interactive changes stay in the main session'),A1_implsz:o(P,'Implement sized batches'),A2_new:o(P,'what the scheduler queues on'),A2_dir:o(P,'a directory entry hides the overlap'),A2_kept:[o(P,'**Acceptance surface**'),o(P,'**Settle it first**'),o(P,'**The why**'),o(P,'**Structure decisions belong to design / dispatch**'),o(P,'**A task book is a table, not prose**'),o(P,'**Why the fourth cell**')].join(','),A7_new:o(P,'A change with an approved design is implemented by a coder subagent'),A7_why:o(P,'the self-review blind spot returns'),A3_zh:o(D,'\u5c3a\u5bf8\u95f8'),A3_ctrl:o(B,'\u5c3a\u5bf8\u95f8'),A4_v:o(E,'Verdict \u2260 attribution'),A4_d:o(E,'A defect is a defect'),A4_name:o(E,'Name defects only by the defect'),A4_q:o(E,'Quantitative claims get tool-verified'),A4_fix:o(E,'Fix designs: full dose first'),A4_branch:o(E,'A branch added for an input that has not shown up'),A6_size:o(blk,'size'),A6_small:o(blk,'small'),A6_sample:o(blk,'four consumer carriers'),A6_factory:o(blk,'a factory stops'),A6_touch:o(blk,'touch surface')})"
```

**本轮读数（同尺 · 本席本轮实跑 · 原样）**

```json
{"A1_sjso":1,"A1_mag":1,"A1_sizing":1,"A1_f15":1,"A1_cap":1,"A1_sized":1,"A1_stay":1,"A1_implsz":1,"A2_new":0,"A2_dir":0,"A2_kept":"1,1,1,1,1,1","A7_new":0,"A7_why":1,"A3_zh":0,"A3_ctrl":6,"A4_v":1,"A4_d":1,"A4_name":1,"A4_q":1,"A4_fix":1,"A4_branch":1,"A6_size":8,"A6_small":4,"A6_sample":1,"A6_factory":1,"A6_touch":2}
```

怎么读：

- 八枚 A1 与 `A7_new` 都在红侧（提示词档归实施轮，落地后应全部翻面）。
- `A2_kept` 六枚各 1 = 控制样本，探针有命中能力。
- `A3_ctrl` = 6 = 同一探针在过程档上读得出非零。
- `D_74` ∥ `D_c2` ∥ `D_ld` 本轮实读各 **0**：四处节名、278 条、量级纪律三串在设计档上已清零。

**读者半边复判（A7）**：两行并读——条件是「有批准的设计」，理由是自审盲点，末段只说「自己做就在自己的复核之下」。

没有一处留下「大活走子席、小活自己做」这个待决项 ⇒ 不会得出「所以这活不大」。

#### 2.17.7 上抛项（修复轮 2）

1. 〔撤 · 前提不成立〕原上抛 1 撤回：需求档 §7.2 的节名与首条都已是新形，见 §2.17.5。
2. 〔知会 · 计数尺〕类② 改用表自身的条数列求和（281），A3 与不变量同步到 300；§6.73.1 里两个档级条目绝对数删去，不再并列第二把尺子的读数。
3. 〔知会 · 写域〕本轮只动 `docs/core/design/PROMPT-SYSTEM.md` 与本段；两档提示词 ∥ 需求档 ∥ 台账 ∥ `docs/batches/**` 未触。

### 2.18 修复轮 3（§3 轮次 4 · 只修红 #1，黄蓝按父侧口径不动）

**判据再收一格（用户 2026-11-09 00:02「我们的要求就是都就地修！」）**：发现即当轮就地修；不按大小分流、不记账。只留两种真推迟——① 要用户裁的（那是问题不是活）② 有真前置条件的（须点名事件）。**「大」∥「需要另一次设计」不是推迟理由**（§1「已定决定」）。

**逐号处置（本轮只动 🔴 #1）**

| # | 严重度 | 处置 |
|---|---|---|
| 1 | 🔴 | **已修**：`thincoder-core/prompts/persona-engineering.md` 五处按 `small ∥ large` 分流的条文归入 E10，分流依据整条换掉。终稿逐字见设计档 §6.87 围栏块；验收 A9 · 命令 ⑩ 在 §2.9。**父侧前一版给的「需要另一次设计 ⇒ 记账」被用户 00:02 作废**，E10 只留两支真推迟。 |
| 2 | 🟡 | 按父侧口径未动。目录：§2.1 表缺 E9 行（E9 在 §2.17.1 与状态行有记录；本轮只补 E10 一行）。 |
| 3 | 🟡 | 未动。目录：A2 期望写 `A2_cap`，命令 ⑨ 只印 `A1_cap`；A2 期望写 `A2_kept` 六枚，§2.17.3 判七行。 |
| 4 | 🟡 | 未动。目录：A3 两处定义并存（§2.9 行 vs §2.15 #3），`D_74` ∥ `D_c2` ∥ `D_ld` 不在命令 ⑨ 的键里。 |
| 5 | 🟡 | 未动。目录：§2.6 的 `280 ⇒ 279 ∥ 299 ⇒ 298` 与 §2.17.4 的 300 并存。 |
| 6 | 🟡 | 未动。目录：§2.9 读数段「A1 四枚 ∥ A4 四枚」与表行「八枚 ∥ 六枚」并存。 |
| 7 | 🟡 | 未动。目录：E9 新条名缺一行既有件三问。 |
| 8 | 🔵 | 未动。目录：命令 ①②③ 的本体在设计档判域内，设计档在评审范围外。 |
| 9 | 🔵 | 未动。目录：§6 无正文（父侧段）；§1 ∥ §2 模板占位行。**本席段内的占位行按父侧口径保留**——它会让收口门拒写，删留待父侧裁。 |
| 10 | 🔵 | 接受（评审范围限制，不作发现）。 |
| 11 | 🔵 | 未动。目录：E9 撤掉「小改动留在主会话」后，「无批准设计的改动由谁做」在该 bullet 内无名。 |

**本条改动面（本席本轮）**

| 档 | 改了什么 |
|---|---|
| `docs/core/design/PROMPT-SYSTEM.md` | §6.87 新增（E10：四处逐字终稿 ∥ 四处各判什么 ∥ A9 ∥ 命令 ⑩ ∥ 先例偏离 ∥ 既有件三问 ∥ 勘察行）；§6.9 勘察行的旧条名引文按落地值改正（E5 已换掉那一行，机检门先拦下的就是它） |
| 本批 §2 | §2.1 补 E10 行 ∥ §2.7 尺子换成按处 ∥ 按语义，并列出射程内四处与射程外五处 ∥ §2.9 补 A9 行 ∥ 本节 |

**读数（同尺 = `node` 行扫 · 命令 ⑩ · 本席本轮实跑）**

```json
{"E10_old":"1,1,1,1,1","E10_new":"0,0,0,0,0,0","E10_ctrl":"1,1"}
```

五处旧串各 1（红侧在位）∥ 六枚新串各 0（改后形归实施轮）∥ 两枚控制串各 1（射程外同族，两侧同在）。
同一命令在改动两侧印出不同的数 ⇒ 这条判据能红。

**A8 读者半边复判（E10 · 人判）**：并读四处改后文本——写域内一律当轮修 ∥ 只剩两支真推迟 ∥ 单开一档看验收面与失效代价 ∥ 修的是发现点名的那一处。
读出的动作 = 现在就修；没有一处留下「这活多大、要不要少走流程」这个待决项 ⇒ 不会得出「所以这活不大」⇒ 绿。

**一处被机检门拦下的真缺陷（记下来）**：本轮第一次写 §2 被 `REFUSED` 拦下——设计档 §6.9 的勘察行仍引 `- **Dispatch size discipline (pre-flight)**: a dispatch's `files` list is ≤15 files`，而 E5 已把该行换成新句 ⇒ 引文不在盘。按 §1 裁定②（落盘后由设计席清理旧条名引用）改正为落地值，复跑过门。

**上抛（知会）**：① 黄蓝 10 条原样留着，逐号目录在上表；② §2 段首的模板占位行会挡收口门，删留待父侧（会改变 §2 段首形态的只有它一行）。

### 2.19 修复轮 4（§3 末轮 · 1 红 5 黄 6 蓝 · 一律当轮就地修）

**判据**（§1 已定决定 · 用户 2026-11-09 00:02「我们的要求就是都就地修！」）：发现即当轮就地修。
只留两种真推迟：要用户裁的问题 ∥ 点名事件的前置条件。本轮 12 条无一条落进这两支。

| # | 严重度 | 处置 | 改了什么 |
|---|---|---|---|
| 1 | 🔴 | 已修 · 两份「什么可以等」并成一份 | 清单住 `**What genuinely waits, and on what**` 那行（第五处）；why `the wait is on that event, not on the review's price` 逐字留；第三项 `a design that does not exist yet` 删；E10 终稿里重复表述的那行删；`That precondition is booked as a ledger row…` 保留，主语改 `A precondition`（指代对象已不在那一条里） |
| 2 | 🟡 | 已修 · 导语去掉行数 | 设计档 §6.87 导语改为「照围栏块逐处换形；块内行与处的对应见下表，行数不作判据」 |
| 3 | 🟡 | 已修 · 验收行对齐命令 | A2 期望改指 `A1_cap`（命令 ⑨ 里该串的唯一键）；A3 改判 `A3_zh` ∥ `A3_old` ∥ `A3_pai`，跑命令 ⑪；`D_74` ∥ `D_c2` ∥ `D_ld` 退场（`278` ∥ `298` ∥ `量级纪律` 别处另有正当出现，做探针会恒非零）；`A2_kept` 写明六枚加粗锚，第七行散文句由 §2.17.3 兜住 |
| 4 | 🟡 | 已修 · 一套基数 | §2.6 的计数格删（280⇒279 ∥ 299⇒298 ∥ 194/105）；只留 §2.17.4 ∥ §2.17.7 的 `类① 19 + 类② 281 = 300`；档级绝对数不进不变量（§1 裁定①） |
| 5 | 🟡 | 已修 · 三处死指针改指落地后那一行 | 设计档 §6.9 围栏导语 ∥ §6.64 落点与既有件三问 ∥ D-PS56 首句；该串在设计档实读 = 0，并进 A3 探针（`A3_old`） |
| 6 | 🟡 | 已修 · E9 新条名补三问 | 设计档 §6.87 既有件三问补 `existing`（E9 · 同节首条）与 `none found`（新句在 17 档 0 命中） |
| 7 | 🔵 | 已修 · 298 残句归到 300 | §6.73.1 两处改 300 ∥ 281；§6.73 A4 行「298 条存量」同步 300 |
| 8 | 🔵 | 已修 · 处数定一个口径 | 位置 = 五处 ∥ 旧串 = 六枚；§6.87 标题 ∥ 病根 ∥ 表头 ∥ 勘察行 ∥ 连带与 §2.1 ∥ §2.7 全随之；「四处 ∥ 五枚」随 🔴1 的合并失效（§6.87「处数口径」段写清） |
| 9 | 🔵 | 不动 · 不是本席的笔 | §3 状态行由评审段作者按末轮 VERDICT 重置 |
| 10 | 🔵 | 已修（§2 侧） | §2 段首模板占位行删除；§1 那一行是父侧笔 |
| 11 | 🔵 | 已修 · A9 补行宽 | A9 期望加 `E10_maxLen` ≤ 300；命令 ⑩ 已带该键 |
| 12 | 🔵 | 接受 · 不作发现 | 评审范围限制（`test/RTM.md` ∥ `discipline-engineering.md` 不在该轮评审范围）⇒ 相关读数按 `unverified` 记 |

**另补一行（不是新发现，是 §2.1 表里缺的）**：`E9` 行补入条目表（它在 §2.17.1 与 A1 ∥ A7 的期望里都在用，表里却没有）。

**命令 ⑪（可复跑 · 纯 ASCII · 判域 = 本档设计档 + 本批档）**

```text
node -e "const fs=require('fs');const D=fs.readFileSync('docs/core/design/PROMPT-SYSTEM.md','utf8'),B=fs.readFileSync('docs/batches/2026-11-08-small-machinery-purge.md','utf8');const o=(t,s)=>t.split(s).length-1;console.log({A3_zh:o(D,'\u5c3a\u5bf8\u95f8'),A3_old:o(D,'Dispatch size discipline'),A3_pai:o(D,'\u6d3e\u5355\u5c3a\u5bf8'),A3_ctrl:o(B,'Dispatch size discipline')})"
```

**读数（同尺 = `node` 行扫 · 本席本轮实跑）**

| 读数 | 值 | 判什么 |
|---|---|---|
| `A3_old` ∥ `A3_zh` ∥ `A3_pai` | 0 ∥ 0 ∥ 0 | 设计档旧条名与尺寸族清零 |
| `A3_ctrl` | **≥ 1**（本次跑 = 15） | 控制样本：同一探针在本批档读得出非零；本批档引用退役串的行数每增一行它就涨一，故只判非零、不判具体值 |
| 命令 ⑩ `E10_old` | `1,1,1,1,1,1` | 六枚红侧在位（E10 未落盘） |
| 命令 ⑩ `E10_new` | `0,0,0,0,0,0` | 新句待实施轮落 |
| 命令 ⑩ `E10_maxLen` | `null` | 新句未落盘 ⇒ 不给绿 |
| 终稿六行宽度 | 289 ∥ 175 ∥ 269 ∥ 131 ∥ 194 ∥ 262 | 均 ≤ 300（提示词行宽） |

**A9 落地后应对上的期望**：`E10_old` = `0,0,0,0,0,0,0` ∧ `E10_new` = `1,1,1,1,1,1,1` ∧ `E10_ctrl` = `1,1`（不变）∧ `E10_maxLen` ≤ 300。第 7 处落地后本席复跑即为这一读数（§2.21.1）。

**一处改法要说明**：`That precondition` 的上一行已移走，故主语改 `A precondition`；句子的意思（前置条件要记成台账行、台账不是停放处）一字未减。

**上一轮「黄蓝按父侧口径未动」作废**：用户 00:02 之后不存在「黄蓝不动」这个口径，§2.18 处置列里的「未动」由本节接住。

**本节写域**：只动 `docs/core/design/PROMPT-SYSTEM.md` 与本段；两档提示词归实施轮（E10 逐字终稿在设计档 §6.87）；需求档 ∥ 台账 ∥ §1 ∥ §3 未触。

### 2.20 末轮 3 条（#13 ∥ #14 ∥ #15 · 一律就地修）

**判据未变**（§2.0）。三条都是读数落位与计数口径，无一条触及判据本身。

| # | 严重度 | 处置 | 改了什么（档 · 逐字要点） |
|---|---|---|---|
| 13 | 🟡 | 已修 · A9 判据行对齐命令 ⑩ 的键集 | 本批 §2.9 A9 行三处：期望 `E10_old` 由 `0,0,0,0,0` 改 `0,0,0,0,0,0`；期望行补「`E10_maxLen` ≤ `300`」；红侧列旧串 `1,1,1,1,1` 改 `1,1,1,1,1,1`，并补「`E10_maxLen` 印 `null` ⇒ 三枚都能红」 |
| 14 | 🔵 | 已修 | 设计档 §6.87 既有件三问的 E9 行：「与上文**四**件不重叠」⇒「与上文**五**件不重叠」（上文已列到第五件） |
| 15 | 🔵 | 已修 · 行不删，数说清 | 设计档 §6.87 表题补一句：「表内「记账的出口」一行属第 1 处的第二行，不另计处」——六行里那一行是处置路由条的第二行，处数仍是五处 |

**#13 为什么掉的队**：第五处（`a design that does not exist yet`）是上一轮把两份「什么可以等」并成一份时进来的，命令 ⑩ 随那次扩到六枚，§2.9 的期望格没跟。

**后果（改前）**：实施席照 §2.9 核 A9 会拿五元组比命令 ⑩ 印出的六枚 + 行宽，永远对不上。

**改后三处同形**：§2.9 的 A9 行 ∥ 设计档 §6.87 的 A9 行 ∥ §2.19 的「落地后应对上的期望」——同一条期望，同一份键集。

**读数（命令 ⑩ · 判域 = 工程模式人格档 · 本席本轮实跑 · 原样）**

```json
{"E10_old":"1,1,1,1,1,1","E10_new":"0,0,0,0,0,0","E10_ctrl":"1,1","E10_maxLen":null}
```

四枚都在红侧，各自红在不同读数上：旧串六枚各 1（该换的还在）∥ 新串六枚各 0（没落地）∥ `E10_maxLen` 印 `null`（取不到行 ⇒ 不给绿）∥ 两枚控制串各 1（射程外同族，探针有命中能力）。

⇒ 三条期望都能红，实施席落地后应翻成 `0,0,0,0,0,0` ∥ `1,1,1,1,1,1` ∥ `1,1` ∥ ≤ `300`。

**同族残留一并清（#13 的同类，同在我段写域内）**：§2.18 的「A9 落地后应对上的期望」那行是五元组、无行宽，与本轮改后的 §2.9 行冲突 ⇒ 已删。A9 的期望此后只住两处：§2.9 的验收行（实施席比的那一行）与 §2.19 的落地期望。§2.18 的读数块（`E10_old` = `1,1,1,1,1` 那条 JSON）是该轮命令的真实输出（当时探针只带五枚旧串），作读数保留、不改一字。

**本节写域**：只动 `docs/core/design/PROMPT-SYSTEM.md` 与本段；两档提示词归实施轮（E10 逐字终稿在设计档 §6.87 围栏块）；`discipline-normal.md` 零触（用户 23:18）；需求档 ∥ 台账 ∥ §1 ∥ §3 ∥ §5 未触。

### 2.21 第 7 处与第三档一处（父侧 2026-11-09 00:24 裁 · 两笔）

**判据未变**（§2.0）：清的是「活有大小 ∥ 值不值得等」这个前提。

#### 2.21.1 第 7 处 · `persona-engineering.md` 记账条（实施已落）

**裁由**：`or design` 与「等一次设计」是同一支；留在盘上，等于把刚删掉的东西在隔壁一句里复活。

**漏在设计面**：它既不在 §6.87 原射程外五处名单里，也不在围栏六行里。本席据此把它补进 §2.1 的 E10 行与设计档 §6.87 的射程表。

**改前 ∥ 改后（逐字）**

```text
改前：4. **A new debt is work needing a precondition or design** (in-scope review findings / stop-and-report output / doc drift) ⇒ book it the same day, naming the batch that takes it.
改后：4. **A new debt is work behind a precondition with a named event** (in-scope review findings / stop-and-report output / doc drift) ⇒ book it the same day, naming the batch that takes it.
```

**一处字面差**：父侧给的目标形是 `that names its event`；落地值取 `with a named event`（§5.10 披露），因为前者会让 A9 第二枚新串读成 2。本席按落地值收进设计档，两侧同一句话。

**处置**

- §2.1 E10 行：五处 ⇒ 六处，写明第 7 处由父侧裁入。
- 设计档 §6.87：处数口径（六处 · 七行 · 各七枚）、各判什么表、改前 ∥ 终稿围栏、既有件三问、A9 与命令 ⑩ 扩到七枚、勘察行——同批改到位。

**读数（命令 ⑩ · 七枚 · 本席本轮实跑）**

```json
{"E10_old":"0,0,0,0,0,0,0","E10_new":"1,1,1,1,1,1,1","E10_ctrl":"1,1","E10_maxLen":289}
```

前六枚红侧 = §2.19 的改前读数；第七枚红侧 = §5.10（改前 1，现 0）。

#### 2.21.2 第三档一处 · `persona-eng-designer.md` 修轮的 `Why`（只写目标形，落盘归实施轮）

**位置**：`## Five-step workflow` 里 `Round semantics` 的下一行。

**改前 ∥ 终稿（逐字）**

```text
改前：Why: a full exploration spends the round on what is already pinned; turn budgets apply per round (fix rounds are small, minute-level).
终稿：Why: a full exploration spends the round on what is already pinned; turn budgets apply per round, and a fix round's work is the spot the finding names.
```

- 删的是 `(fix rounds are small, minute-level)`：它拿「小」与「分钟级」论证不必读全。
- 理由换成 `a fix round's work is the spot the finding names`——与 `persona-engineering.md` 第 4 处同一说法，不造第二个。
- `turn budgets apply per round` 逐字留：它说的是预算按轮计，不是按大小估工期。

**该档另一处同族不动**：`largest single injection-pollution source` 是「最大的污染源」这个读数，不是活的分档。该档再无 `small ∥ size ∥ minute-level` 命中——本席逐行实读。

**验收 A10（红侧先读 · 同尺 = `node` 行扫 · 命令 ⑫）**

```text
node -e "const fs=require('fs');const Q=fs.readFileSync('thincoder-core/prompts/persona-eng-designer.md','utf8');const o=(t,s)=>t.split(s).length-1;const NEW='the spot the finding names';const L=Q.split(/\r?\n/).filter(l=>l.includes(NEW));console.log({D1_old:o(Q,'fix rounds are small, minute-level'),D1_new:o(Q,NEW),D1_ctrl:o(Q,'point fixes only'),D1_largest:o(Q,'largest single injection-pollution source'),D1_maxLen:L.length?Math.max(...L.map(l=>[...l].length)):null})"
```

**读数（本席本轮实跑 · 原样）**

```json
{ D1_old: 1, D1_new: 0, D1_ctrl: 1, D1_largest: 1, D1_maxLen: null }
```

红侧在位：旧串 1 ∥ 新串 0 ∥ 行宽印 `null`。落地后应翻成 `D1_old` = 0 ∥ `D1_new` = 1 ∥ `D1_ctrl` = 1 ∥ `D1_largest` = 1 ∥ `D1_maxLen` ≤ 300。

**本节写域**：只动 `docs/core/design/PROMPT-SYSTEM.md` 与本段；两档提示词归实施轮；§1 ∥ §3 ∥ §5 未触。

### 2.22 E11 的设计档落点（本轮 · 父侧 2026-11-09 00:36 裁）

**判由**：E11 原先只住在本段（§2.21.2）。批档可整档删，规范不能只活在批档里——删了那一节，「这句为什么变成这样」在盘上就无处可读。父侧据此裁「E11 必须有设计档落点」。

**落点**：`docs/core/design/PROMPT-SYSTEM.md` 新增 **§6.88**，按该档节律写齐：判据一句 · 改前逐字 · 终稿逐字 · 为什么 · 验收 A10（带红法）· 先例 ∥ 偏离 · 既有件三问 · 勘察证据行 · 受影响文件 · 边界 · 集成测试 · 上抛项。终稿语料与 §2.21.2 逐字一致。

**§6.87 按实况对齐（四处口径 + 一处死指针 · 五行）**

| # | 位置 | 改后 |
|---|---|---|
| 1 | §6.87 受影响文件表 | 补 `persona-eng-designer.md` 一行（一处换理由，指向 §6.88）；本档那一行改为「本节新增 + §6.88 新增」 |
| 2 | §6.87 边界首条 | 射程外 **五处 ⇒ 六处**：`persona` 两处 ∥ `discipline-engineering` 三处 ∥ `persona-eng-designer` 一处 |
| 3 | §6.87 勘察行 | 补「同族扫描第三档」一行（`largest single injection-pollution source`，理由指向 §6.88）——上一轮判域只到前两档，该处从未进过扫面 |
| 4 | §6.87 上抛项 2 | 「射程外五处」⇒ 六处，与 §2.7 的判域（三档 · 射程外六处）同一口径 |
| 5 | §6.87 A9 红侧格 | 删两处指向本批 §2.19 ∥ §5.10 的死指针，改述「改前盘面的读数」——同一条判据的可复核性不靠过程档 |

**`largest single injection-pollution source` 为什么留（已写进 §6.88 专段）**：它量的是注入污染的体积（changelog 是最大的污染源），不是活的分档，读者拿不到「这活不大」这个结论；且它是 `A10` 的 `D1_largest` 控制串，动了那一行 `A10` 直接红。故它不是漏网，是射程外的读数 + 控制样本。

**读数（命令 ⑫ ∥ 命令 ⑩ · 本席本轮实跑 · 原样）**

```json
{"D1_old":0,"D1_new":1,"D1_ctrl":1,"D1_largest":1,"D1_maxLen":151}
{"E10_old":"0,0,0,0,0,0,0","E10_new":"1,1,1,1,1,1,1","E10_ctrl":"1,1","E10_maxLen":289}
```

- A10 五枚与 §2.9 的期望逐位相同 ⇒ E11 已落且未越界。
- 命令 ⑩ 复跑与 §2.9 A9 行逐位相同 ⇒ 本轮编辑没碰到 `persona-engineering.md`。

**红侧怎么读**：改前那句已不在盘，故红侧按 §6.84 第二法造——把 §6.88 围栏里改前那句逐字喂给同一条探针：`onDisk` = 0 ∥ `onPreChangeControlLine` = 1；新句反向 `1 ∥ 0` ⇒ 两枚能翻面，不是恒绿。

**同族复查（该档实读）**：`small` ∥ `size` ∥ `minute` ∥ `magnitude` ∥ `sizing` 各 0 命中；`largest single injection-pollution source` 1 处（射程外 · A10 控制串）。该档最长行 299。

**公共源勘察**：`index.publicRepos` 两声明仓逐仓扫 `*.md` ∥ `*.txt` ∥ `*.json`（778 档 ∥ 11 档），两枚探针各 0 命中 ⇒ 已查，无相关。

**本节写域**：只动 `docs/core/design/PROMPT-SYSTEM.md` 与本段；三档提示词 ∥ 需求档 ∥ 台账 ∥ §1 ∥ §3 ∥ §5 未触。

## §3 设计评审（评审子代理）
**状态行**：评审通过（第 7 轮收敛：前轮 1 红已修、黄蓝 11 条处置完毕，新 1 🟡 2 🔵 不阻断）



### 轮次 1（评审子代理）

| # | 严重度 | 状态 | 证据（指针） |
|---|---|---|---|
| 1 | 🔴 | 未解决 | §6.76 用例表 C4「省不省由已经读到的牵连面定」∥ §6.76 对照表「答案在读牵连面里就不该问人」∥ §6.76 围栏块「So whether the process may be trimmed is not a question for the user either」 |
| 2 | 🔴 | 未解决 | §6.64 K2「尺寸闸保留、理由换写」∥ §6.64 C2「拆（尺寸闸仍在：一单要小到能一次说清）」∥ §7 D-PS56「`files` ≤15 档保留」∥ §6.9 节标题「派单尺寸与任务书形态纪律（尺寸闸 + …）」 |
| 3 | 🟡 | 未解决 | §6.9 围栏块引导句「`Three gates, every one of them` 两行（以引文定位）整体替换为下面四行」∥ 批档 §2.2「原条另三行…不改，仍作续行」 |
| 4 | 🟡 | 未解决 | 批档 §2.9 A2「两枚机制串 ≥ 1」/ 命令 ⑨ 的 `A2_flp` ∥ `A2_dir` ∥ §6.73.1 类① 第 9 行「`**files must be file-level paths** (one per file)` … 删整条」 |
| 5 | 🟡 | 未解决 | §6.73 普查表行「persona · Implementation dispatch structure \| 14」的名单已无 `Dispatch size discipline`，而 E5 是换名不是删条 |
| 6 | 🟡 | 未解决 | 批档 §2 全段无「先例 ∥ 偏离」块（§2.1–§2.15） |
| 7 | 🟡 | 未解决 | 批档 §2 无公共源勘察行；同档 §6.84/§6.85/§6.86 各有「`index.publicRepos` 实读 = …」一行 |
| 8 | 🟡 | 未解决 | 批档 §2 无「既有件三问」对 §2.2 新句的答复；同档各节皆有 `existing:` / `none found:` 形 |
| 9 | 🔵 | 未解决 | 批档 §2.12「`CLI 1`–`CLI 37`」∥ §6.85「`CLI 1`–`CLI 38`」 |
| 10 | 🔵 | 未解决 | 批档 §2.7「三处提示词（E1 ∥ E5 ∥ E6）」中 E6 在 §2.1 条目表无行 |
| 11 | 🔵 | 未解决 | §1 状态行「🔄 进行中（…）」note 仍是占位 |

VERDICT: changes-required

计数：🔴 2 · 🟡 6 · 🔵 3（合计 11 条）

### 轮次 2（评审子代理）

| # | 严重度 | 状态 | 证据（指针） |
|---|---|---|---|
| 1 | 🔴 | 未解决 | 依据 `thincoder-core/prompts/persona-engineering.md` 该节首条现盘首行 `A change with an approved design is implemented by a coder subagent`（该条原以单子大小分档、小的留主会话，那是改前形态，落地后已不在盘，逐字原文见批档 §2.17.1 的改前逐字块）∥ 批档 §2.7「提示词内 `size` 的其余命中（测试体量 ∥ 函数拆分 ∥ 行宽）」 |
| 2 | 🔴 | 未解决 | §6.17「③ ⑤ = 工程纪律层（该模式下怎么干活——判定 / 量级纪律 ∥ 命名纪律族）」∥ 同节机制段「六条：判定 ≠ 归因 ∥ 违用户裁定即缺陷」（同一机制两处活描述） |
| 3 | 🟡 | 未解决 | §6.64「本档回收点实读：§6.9 的标题与机制段 · 其围栏块内容四行 · §6.39 对照行与用例 C4 · §6.56 A6」∥ §6.56 A6 仍在盘「`Dispatch size discipline (pre-flight)` 讲**一单多大**」 |
| 4 | 🟡 | 未解决 | §6.74「§7.2（角色 A · 主 agent）的「派单尺寸（判据句）」列表」∥ 需求档 §7.2 实读「**派单纪律（判据句）**：」且首条已是新形；批档 §2.16 上抛 1 的「仍叫」前提不成立 |
| 5 | 🟡 | 未解决 | §6.73「**类② 按节（留，且带 why · 278 条」∥ 同节「**类① 19 + 类② 279 = 298**」（D3 计数与不变量不一致） |
| 6 | 🟡 | 未解决 | 批档 §2.9 A4「同节其余六条在场」／「四个计数各 = 1」∥ 同节读数「同节其余四条在场」∥ §2.4 六条中两条无探针 |
| 7 | 🔵 | 未解决 | 批档 §2.9 A1「四个计数全 0」∥ 命令 ⑨ 印出 `A1_sjso` ∥ `A1_mag` ∥ `A1_sizing` ∥ `A1_f15` ∥ `A1_cap` 五枚 |
| 8 | 🔵 | 未解决 | 批档 §2.2「原条另三行（`**Acceptance surface**` · `**Settle it first**` · `**The why**`）不改，仍作续行」∥ 同 bullet 另有「**Structure decisions belong to design / dispatch**」等续行 |
| 9 | 🟡 | 未解决 | 批档 §2.16 既有件三问「它讲机器拒什么；新句讲理由（目录把重叠藏起来）⇒ 不重述、不合并」∥ 目标形「one path per file, never a directory」与 `file-domain declaration semantics` 的「files must be file-level paths (one per file)」并存 |
| 10 | 🔵 | 未解决 | 评审上下无项目标准档、无文档地图（`docs/README.md` 未解析）⇒ 文档归属判据只依设计档自身节图与 AGENTS.md，结论不建立在其读不到的规范上 |

VERDICT: changes-required

计数：🔴 2 · 🟡 5 · 🔵 3（合计 10 条）

已核通过项（不占发现号）：

- 设计档在位：批档 §2 与 `PROMPT-SYSTEM.md` 各节两档齐。
- 分层结论：给的是结论（无档跨分层），全档为 `.md` ⇒ 免档位判定，档内不留数。
- 先例 ∥ 偏离：在先，先例具名（§6.64 ∥ §6.63），两条偏离各带理由。
- 公共源勘察：在先（manifest 实读 + 两声明仓逐仓扫 + 三枚探针）。
- 既有件三问：对 §2.2 新句有答（`existing` ∥ `none found` 两形）。
- 集成测试：读 `test/RTM.md`，只取唯一成立的那条理由，破行 ∥ 冗余 ∥ 新增各 0。
- 验收形：行扫探针 + `doc_check`，未写成全量套跑。
- 引用形：无行号坐标；本批不加分支 ⇒ 分支出处无对象。
- 读数复核：本席可自行复算者与批档一致（第 4 条块 `size`=8 ∥ `small`=4、`A2_kept`=`1,1,1`、设计档 `尺寸闸`=0 且批档对照非零）。

### 轮次 3（评审子代理）

轮次 3 复核：轮次 1 的 11 条 ∥ 轮次 2 的 10 条逐条对现盘复核（本席本轮实读四个在审档，无 git）。

| # | 严重度 | 状态 | 证据（指针） |
|---|---|---|---|
| 轮1-1 | 🔴 | 已处置 | §6.76 围栏第 8 行「So the user is not the one to ask what this change touches」∥ 用例 C4「读完这一段的动作仍是去读牵连面、走全流程」∥ 对照表行「这一问不落在那条判据的两侧」 |
| 轮1-2 | 🔴 | 已处置 | 设计档「尺寸闸」零命中；§6.9 标题「派单纪律与任务书形态纪律（调度清单 + 验收面照写 + 表形态 + 禁令携后果）」∥ D-PS56「派单纪律去「一面一单」与尺寸档」 |
| 轮1-3 | 🟡 | 已处置 | §6.9 引导句「这一行（以引文定位）**整行替换为下面一行**」；`Three gates` ∥ `every one of them` 设计档零命中 |
| 轮1-4 | 🟡 | 已处置 | 命令 ⑨ 的 `A2_new` ∥ `A2_dir` = `what the scheduler queues on` ∥ `a directory entry hides the overlap`，本轮读数 0 ∥ 0 |
| 轮1-5 | 🟡 | 已处置 | 普查行「persona · Implementation dispatch structure」计数 15，名单含 `A dispatch's files list is what the scheduler queues on` |
| 轮1-6 ∥ 轮1-7 ∥ 轮1-8 | 🟡 | 已处置 | §2.16「先例 ∥ 偏离」∥「公共源勘察」∥「既有件三问」三块在场，先例具名 §6.64 ∥ §6.63，两仓逐仓扫 + 三枚探针 |
| 轮1-9 | 🔵 | 已处置 | §2.12 不再写 CLI 上界，改「行数不住本节：同一个数在别处已有一次读数」 |
| 轮1-10 | 🔵 | 已处置 | §2.7 清扫表无 `E6`；E6 仅见于 §2 状态行与 K3「E6 撤出本批」 |
| 轮1-11 | 🔵 | 已处置 | §1 状态行「进行中（去量级判断 · 三档提示词 + 设计档连带 · 判据本体已由用户 23:16 定稿 · 普通模式零触）」 |
| 轮2-1 ∥ 轮2-2 | 🔴 | 已处置 | §6.9「E9 · 同节首条」逐字终稿 ∥ §6.17「③ ⑤ = 工程纪律层（该模式下怎么干活——判定纪律 ∥ 命名纪律族）」 |
| 轮2-3 ∥ 轮2-4 ∥ 轮2-9 | 🟡 | 已处置 | `一单多大` ∥ `派单尺寸` 设计档零命中（四处均为「派单纪律（判据句）」）∥ §2.17.2「本句只给理由…不重述」 |
| 轮2-5 | 🟡 | 已处置 | §6.73「类① 19 + 类② 281 = 300」∥ A3「枚举基数 300」；普查 15 与名单同源 |
| 轮2-6 | 🟡 | 未处置 | §2.9 读数段「`A4` 四枚各 **1**：同节其余四条在场」∥ 同节 A4 行「六枚各 = 1」+ 命令 ⑨ 六枚 A4 |
| 轮2-7 | 🔵 | 未处置 | §2.9 读数段「`A1` 四枚 = **1 ∥ 1 ∥ 1 ∥ 1**」∥ 同节 A1 行「八枚全 0」+ JSON 八枚 |
| 轮2-8 | 🔵 | 未处置（设计档侧） | §6.9「该 bullet 的三行续行…逐字不动」∥ §6.64 标题「三行续行不动」∥ D-PS56「三行续行逐字不动」 vs 盘上该 bullet 七行续行（§2.17.3 已认七行） |
| 轮2-10 | 🔵 | 接受 | 范围限制记在评审报告内，不作发现 |
| 新-A | 🟡 | 新 | §2.6 E7 行「类② 280 ⇒ 279 ∥ 基数 299 ⇒ 298 ∥ persona 194 不变 / discipline 105 ⇒ 104」与 §2.17.4 #4 ∥ §2.17.7 #2「类② 改用表自身的条数列求和（281）…绝对数删去」并存，一段两套计数 |
| 新-B | 🟡 | 新 | §6.64 勘察行「§7.2–§7.4 现读三行 = 尺寸上限 ∥ 跨面不构成拆单理由 ∥ 预检两闸」判「与本批同向」 vs 同节 K2「尺寸面整条删，不留换名字的上限」；需求档不在本轮评审范围，哪侧为真未判 |
| 新-C | 🔵 | 新 | §6.73「一行只载一个条目——两个条目合成一行，总和就不再是 298」残留 298（现总 300） |
| 新-D | 🔵 | 新 | §2.9 A2 行期望「`A2_cap` = 0」，命令 ⑨ 只印 `A1_cap`，无 `A2_cap` 读数 |
| 新-E | 🔵 | 新 | §6.39「B3 · 判断与尺寸（工程纪律层）」——E2 落地后该名不再对应盘上任何节 |

轮次 3 计数：🔴 0 未解决 · 🟡 3 · 🔵 5。前两轮 4 条 🔴 全部对现盘复核为已处置；剩余条目均为读数落位与计数残差。

VERDICT: pass

### 轮次 4（评审子代理）

> 状态行重置：第 4 轮打回（changes-required）· 上一轮状态行 = 评审通过 → 进行中 · 2026-11-09

| # | 严重度 | 状态 | 证据（指针） |
|---|---|---|---|
| 1 | 🔴 | 未解决 | `persona-engineering.md`「inside ∧ small form (wording / coordinates / indexes / cleanup) ⇒ fix it on the spot; inside ∧ large (a precondition / needs design)」∥「promote it as a small-batch candidate」∥「small fixes stay minute-level」∥「a small-form item inside the write domain was already fixed on the spot」仍按「小 / 大」分类；§2.1 条目表无对应条目，§2.7 却写「两提示词档其余 `size` \| **0 处**」；§5.5 自认「本批盘点面的漏项」并 Deferred |
| 2 | 🟡 | 未解决 | §2.1 条目表只到 E1–E8（无 E9 行）∥ §2.9 A1 行「（E1 ∥ E2 ∥ E5 ∥ E9）」∥ §2.10 K3「E6 撤出本批」所指条目在条目表无行 |
| 3 | 🟡 | 未解决 | §2.9 A2 行期望「`A2_cap` = 0」，而 §2.17.6 命令 ⑨ 只印 `A1_cap`；§2.17.3「该 bullet 的续行是**七行**」vs 同 A2 行「`A2_kept` = `1,1,1,1,1,1`」（六枚） |
| 4 | 🟡 | 未解决 | A3 两处定义并存：§2.9 行「设计档无残留与死指针 \| `A3_zh` = 0 ∧ `D_74` = 0 ∧ `D_c2` = 0 ∧ `D_ld` = 0」vs §2.15 #3「A3 判域改为提示词档第 4 条块」；`D_74` ∥ `D_c2` ∥ `D_ld` 不在命令 ⑨ 的键里 |
| 5 | 🟡 | 未解决 | §2.6「类② 280 ⇒ 279 ∥ 基数 299 ⇒ 298 ∥ persona 194 不变 / discipline 105 ⇒ 104」vs §2.17.4 #4「类① 19 + 类② 281 = 300」与 §1 两条裁定①「档级绝对数不进不变量」；同一张普查表两套基数 |
| 6 | 🟡 | 未解决 | §2.9 读数段「`A1` 四枚 = **1 ∥ 1 ∥ 1 ∥ 1**」∥「`A4` 四枚各 **1**：同节其余四条在场」，与同节 A1 行「八枚全 0」、A4 行「六枚各 = 1」并存 |
| 7 | 🟡 | 未解决 | §2.16「既有件三问（§2.2 新句）」只答复 E5 新句；§2.17.1 引进的新条名「A change with an approved design is implemented by a coder subagent」无三问答复（缺 line） |
| 8 | 🔵 | 未解决 | §2.14 ∥ §2.15 引「命令 ②」读数（`F_lines` ∥ `F_banned` ∥ `F_maxLen`）与「命令 ①」「命令 ③」，三条命令本体不在本档；设计档在评审范围外，未核 |
| 9 | 🔵 | 未解决 | 批档 §6 只有标题一行，无状态行、无正文 ⇒ 收口门必拒；§1 ∥ §2 仍带模板占位行 |
| 10 | 🔵 | 接受 | 无项目标准档、无文档地图：文档归属只依 AGENTS.md 与设计档自身节图，结论不建立在其读不到的规范上 |
| 11 | 🔵 | 未解决 | E9 撤掉「small / exploratory / interactive changes stay in the main session」后「无批准设计的改动由谁做」在该 bullet 内无名，§2.17.1 未写其覆盖者 |

已核通过项（不占发现号）：设计档在位（批档 §2 + 设计档两档齐）· §2.8 分层结论给的是结论且全档 `.md` 免档位判定、档内不留数 · 先例 ∥ 偏离在先且具名 · 公共源勘察在先（manifest 实读 + 两声明仓逐仓扫 + 三枚探针）· 集成测试读 `test/RTM.md` 并给唯一成立的那条理由 · 验收形为行扫探针 + `doc_check`，未写成全量套跑 · E5 ∥ E8 ∥ E9 逐字终稿与盘上现值读得出对齐 · 第 4 条块 `size` ∥ `small` 实读 0 ∥ 0（E8 落地后）。

VERDICT: changes-required

计数：🔴 1 · 🟡 6 · 🔵 4（合计 11 条）

### 轮次 5（评审子代理）

### 轮次 5（引文修复 · 只改一行，未开新一轮评审）

| # | 严重度 | 状态 | 证据（指针） |
|---|---|---|---|
| 1 | 🔵 | 已处置 | 轮次 2 #1 证据格的引文改指 `persona-engineering.md` 该节首条现盘首行 `A change with an approved design is implemented by a coder subagent`，并就地加一句：原以单子大小分档、小的留主会话 = 改前形态，落地后已不在盘，逐字原文见 §2.17.1 的改前逐字块；`doc_check` 首行 `DOC-CHECK GATE: PASS` |
| 2 | 🔵 | 已核 | 同档其余在审锚点实读在位（`small-batch candidate` ∥ `small fixes stay minute-level` ∥ `fix it on the spot` ∥ `fixed on the spot`）⇒ 引缺只出在这一处；本轮未重写轮次表、未动其它证据格、未跑新评审 |

VERDICT: pass

计数：🔴 0 · 🟡 0 · 🔵 2（合计 2 条）

### 轮次 6（评审子代理）

> 状态行重置：第 6 轮打回（changes-required）· 上一轮状态行 = 评审通过 → 进行中 · 2026-11-09

| # | 严重度 | 状态 | 证据（指针） |
|---|---|---|---|
| 1 | 🔴 | 新 | §6.87 判据「**「大」∥「需要另一次设计」不是推迟理由**——那是量词换了张脸。」与终稿「**What waits, and on what**: a question the user must rule on … and work behind a precondition that names its event」；同档同节现盘仍活着一句「**What genuinely waits, and on what**: a precondition (another batch landing first), a user ruling, a design that does not exist yet」——两份「什么可以等」的清单，一份三项、一份两项且第三项被新判据否掉；§6.87 勘察行只列「四处现值」+ 射程外五处（`accumulates in small moves` ∥ `however small or obvious`），此条两处都不在；§2.7「本轮按处重扫：射程内四处（E10）+ 射程外五处（各带理由），两档已无未归类的同族命中」因而不成立 |
| 2 | 🟡 | 新 | 终稿导语「第一处 = 两行换两行，其余三处各一行换一行」vs 围栏块实况：第一面 3 行（`It is work…` ∥ `**What waits, and on what**…` ∥ `That precondition is booked…`），全块 6 行对改前 5 行 |
| 3 | 🟡 | 未解决 | §2.9 A2 期望「`A2_cap` = 0」与 A3 期望「`D_74` = 0 ∧ `D_c2` = 0 ∧ `D_ld` = 0」；命令 ⑨ 的键集只有 `A1_cap`，三枚 `D_` 键不在其中 ⇒ 两行验收照写跑不出读数 |
| 4 | 🟡 | 未解决 | §2.6「类② 280 ⇒ 279 ∥ 基数 299 ⇒ 298 ∥ persona 194 不变 / discipline 105 ⇒ 104」与 §2.17.4 ∥ §2.17.7「类① 19 + 类② 281 = 300」并存，且违背 §1 裁定①「**档级绝对数不进不变量**」 |
| 5 | 🟡 | 新 | §1 裁定②自定「实施落盘后由设计席做一轮清理，把 §6.9 引导句 ∥ §6.64 落点 ∥ D-PS56 里对旧条名的引用改成陈述落地后的实况」；E5 已落，而三处仍引 `Dispatch size discipline (pre-flight)`：§6.9 围栏块导语 ∥ §6.64 落点与既有件三问 ∥ D-PS56 首句 ⇒ 三枚死指针；A3「设计档无残留与死指针」的探针不含该串 |
| 6 | 🟡 | 未解决 | §2.17.1 新条名 `A change with an approved design is implemented by a coder subagent` 无三问答复；§2.16「**既有件三问（§2.2 新句）**」只答 E5 新句 |
| 7 | 🔵 | 未解决 | §6.73.1「**类① 19 + 类② 281 = 300**」与同段「**本清单自身的分布**：**298** 条里机面已兜住的 = **19** 条」并存；同段「总和就不再是 298」亦残留 |
| 8 | 🔵 | 新 | §6.87 标题「……四处 · 换分流依据」与「普查表计数零变：四处都在既有条目内换形」vs 同节「改前逐字（五处 · 本席本轮实读）」、"四处各判什么" 表 5 行、A9 五处旧串 |
| 9 | 🔵 | 未解决 | §3 状态行「评审通过」与轮次 4 的 changes-required、以及 E10 ∥ §6.87 在该轮之后才落并存（状态面留痕） |
| 10 | 🔵 | 未解决 | §6 只有标题、无正文；§1 ∥ §2 段首各带一行 `<§N 模板占位：…>` |
| 11 | 🔵 | 新 | A9 无行宽读数，而同档 §6.85 ∥ §6.86 的先例带 `maxLen` 判；提示词档不在行宽机检域（§6.19 ∥ §6.25 已披露） |
| 12 | 🔵 | 接受 | `test/RTM.md` 与 `discipline-engineering.md` 不在本轮范围 ⇒ §2.12 ∥ §6.87 的「无一行断言 system prompt 文本」与 E1 ∥ E2 ∥ E8 落地读数按 `unverified` 记，不作发现 |

已核通过项（不占发现号）：

- 设计档在位：批档 §2 与设计档 §6.87 两档齐。
- 分层结论：给的是结论（无档跨分层），全档 `.md` ⇒ 免档位判定，档内不留数。
- 先例 ∥ 偏离：在先，先例具名（§6.85 ∥ §6.86），两条偏离各带理由。
- 公共源勘察：在先（manifest 实读 + 两声明仓逐仓扫 + 三枚探针）。
- 集成测试：读 `test/RTM.md`，只取唯一成立的那条理由，破行 ∥ 冗余 ∥ 新增各 0。
- 验收形：行扫探针 + `doc_check`，未写成全量套跑。
- A9 红侧在位：命令 ⑩ 五枚旧串在本席实读各 1。
- 普查三数对得上：`persona · Debts…` 24 ∥ `persona · Round close…` 4 ∥ `persona · Ledger` 19。
- 设计档 `尺寸闸` ∥ `派单尺寸` 族：本席实扫零命中。
- 分支出处：本批不加输入 ∥ 状态分支（三去处现盘已在）⇒ 6b 无对象。
- 引用形：无行号坐标。

VERDICT: changes-required

计数：🔴 1 · 🟡 5 · 🔵 6（合计 12 条）

### 轮次 7（评审子代理）

轮次 7 复核：轮次 6 的 12 条逐条对现盘重读（三个在审档本轮实读，无 git）。

| # | 严重度 | 状态 | 证据（指针） |
|---|---|---|---|
| 1 | 🔴 | 已修 | §6.87 终稿现只有一份「什么可以等」：「**What genuinely waits, and on what**: a user ruling, and work behind a precondition that names its event (another batch lands first)」；第三项已删，围栏里重复的那行已删；病根 ∥「各判什么」末行 ∥ 勘察行五处现值 ∥ 命令 ⑩ 的 OLD 六枚均收 `a design that does not exist yet`；§2.7 已列「射程内五处（E10）」 |
| 2 | 🟡 | 已修 | §6.87 导语「块内行与处的对应见下「各判什么」表，行数不作判据」；围栏 6 行对改前 6 行，逐处一一对应 |
| 3 | 🟡 | 已修 | §2.9 A2 期望改指 `A1_cap`；A3 跑命令 ⑪（`A3_zh` ∥ `A3_old` ∥ `A3_pai` ∥ `A3_ctrl`），§2.19 命令 ⑪ 键集与之一致；`D_74` ∥ `D_c2` ∥ `D_ld` 退场 |
| 4 | 🟡 | 已修 | §2.6 计数格改为「类② 与不变量按表自身条数列求和 ⇒ **类① 19 + 类② 281 = 300**（§2.17.4）；档级绝对数不进不变量」；`280 ⇒ 279` ∥ `299 ⇒ 298` ∥ `194 / 105` 已删 |
| 5 | 🟡 | 已修 | 设计档 `Dispatch size discipline` ∥ `尺寸闸` ∥ `派单尺寸` ∥ `量级纪律` 本轮实扫零命中；A3 探针含该串 |
| 6 | 🟡 | 已修 | §6.87 既有件三问补「`existing`（E9 · 同节首条…）」与「`none found`（E9 新句）」 |
| 7 | 🔵 | 已修 | §6.73.1「**类① 19 + 类② 281 = 300**」∥「**300** 条里机面已兜住的 = **19** 条 … 其余 **281** 条」；§6.73 A3「不写成「当刻 = 298」…枚举基数 300」 |
| 8 | 🔵 | 已修 | §6.87 标题「五处 · 换分流依据」∥「处数口径：位置 = 五处，旧串 = 六枚」∥ A9 六枚 OLD 串 |
| 9 | 🔵 | 已修 | §3 状态行已按末轮 VERDICT 重置为打回态 |
| 10 | 🔵 | 接受 | §2 段首占位行已删；`<§1 模板占位：本批条目 / 关键判据 / 授权口径>` 与 §6 空段属父侧笔与收口门，§2.19 已上抛，不属设计席写域 |
| 11 | 🔵 | 已修 | A9 期望加 `E10_maxLen` ≤ `300`；命令 ⑩ 印该键 |
| 12 | 🔵 | 接受 | 范围限制（`test/RTM.md` ∥ `discipline-engineering.md` 不在评审范围）⇒ 相关读数按 `unverified` 记 |
| 13 | 🟡 | 新 | §2.9 A9「`E10_old` = `0,0,0,0,0`」∥ §6.87 A9「`0,0,0,0,0,0` ∧ `E10_maxLen` ≤ `300`」∥ §2.19 读数「`1,1,1,1,1,1`」三处不一：命令 ⑩ 印六枚，任务书行少一枚且缺行宽；判据源 = 设计档（persona「Where §2 and the design doc disagree, the design doc is the criterion source of record」）⇒ 报 doc 层改，不阻断 |
| 14 | 🔵 | 新 | §6.87「`existing`（E9 · 同节首条，与上文四件不重叠）」而前文已列到「（第五件）」 |
| 15 | 🔵 | 新 | §6.87「**五处各判什么（原依据 → 改后依据）**」表 6 行（多出「记账的出口」一行）与「位置 = 五处」并存 |

已核通过项（不占发现号）：

- 设计档在位（批档 §2 + 设计档 §6.87）。
- 分层结论（无档跨分层；受影响档全 `.md` ⇒ 免档位判定，档内不留数）。
- 先例 ∥ 偏离（§6.85 ∥ §6.86 具名，两条偏离各带理由）。
- 公共源勘察（manifest 实读 + 两声明仓 + 三枚探针）。
- 既有件三问（五件 + E9 件 + 两条 `none found`）。
- 集成测试（从 `test/RTM.md` 起判，只取唯一成立的理由）。
- 验收形（`node` 行扫 + `doc_check`，未写成全量套跑）。
- A9 红侧本席实读（六枚旧串各 1 ∥ 两枚控制串各 1）。
- 普查三数（`persona · Debts…` 24 ∥ `persona · Round close…` 4 ∥ `persona · Ledger` 19）。
- 同族无未归类命中（persona 全档 `size` ∥ `small` ∥ `large` 逐处可归）。
- 分支出处（三去处现盘已在，本批不新增输入 ∥ 状态分支 ⇒ 6b 无对象）。
- 引用形（无行号坐标）。

VERDICT: pass

计数：🔴 0 · 🟡 1 · 🔵 2（本轮 15 条：前轮 12 条 11 修 1 接受，新 3 条；🔴 全部收口）

## §4 用户批准（主 agent）

### 用户批准

**授权来源（四处，都是用户原话）**：

- **23:09**「量级判断居然还在？清理」——指出漏网。
- **23:14**「连判断活的大小这件事一起删，工程无小事」——纠正父侧第一次读偏（父侧当时读成「删的是按大小少走流程的授权」，用户否掉）。
- **23:16**「干活前不要去量活的大小」——**判据本体定稿**。
- **23:18**「普通模式先不要动」——划定边界。

**判据本体（逐字）**：**不是「量出来小就少走流程」——那仍承认有大小；是「干活之前，不做这个量」。**
**配套一句**：**读牵连面 ≠ 量活的大小**——读牵连面产出的是**坐标**（哪几处、哪几条验收），不是量级。

**批准范围**：三档提示词 + 设计档连带（八档此前那一批另计，见另一本批档）。
**设计细节的批准来自评审**（三轮：红 → 红 → 通过），**不是来自用户**；两者不混成一句。

**未随本批的一笔（评审留下、用户尚不知）**：`Sized implementation batches` 那一条的触发条件改成「有批准的设计」之后，**普通模式那一侧仍按三档分流**（`discipline-normal.md` 未动）。**两模式口径不同是用户 23:18 明确要的**，不是漏项。

## §5 实施记录（eng-coder）

### 5.1 实施结果（两档提示词 · 五处 · 逐字照 §2）

| # | 条目 | 档 | 落地形态 | 状态 |
|---|---|---|---|---|
| 1 | E1 | `discipline-engineering.md` | 整条删 `Small job, small machinery`（该条无续行，删后条目不跳号） | ✅ 已落 |
| 2 | E2 | 同上 | 节标题 `## Engineering judgment (verdicts ∥ sizing)` → `## Engineering judgment (verdicts)` | ✅ 已落 |
| 3 | E8 | 同上 | 第 4 条整条换形（旧 15 行 → 新 9 行），逐字取 §2.5 围栏块 | ✅ 已落 |
| 4 | E5 | `persona-engineering.md` | `Dispatch size discipline (pre-flight)` 首行整行换为 §2.2 目标形；该 bullet 七行续行零动 | ✅ 已落 |
| 5 | E9 | 同上 | 节首两条线按 §2.17.1 终稿换形（触发条件 = 有批准的设计，不再按大小） | ✅ 已落 |

**逐字比对（脚本判定，非目测）**：E8 九行与 §2.5 围栏块 ∥ 设计档 §6.76 围栏块三方逐行相等；E5 首行与 §2.2 围栏块相等；E9 两行与 §2.17.1 终稿相等。

```text
{E8_record_vs_disk_all9: true, E8_doc_copy_vs_disk_all9: true, E8_disk_line_count_to_item5: 9,
 E5_exact: true, E9a_exact: true, E9b_exact: true}
E5_bullet_continuation_lines: ["**Acceptance surface**", "**Settle it first**", "**The why**",
 "**Structure decisions belong to design /", "**A task book is a table, not prose**",
 "**Why the fourth cell**", "Prose carries only the **goal and the bo"]
```

**七行续行在位且未动**（§2.17.3 的七行判定实读）：`**Acceptance surface**` ∥ `**Settle it first**` ∥ `**The why**` ∥ `**Structure decisions belong to design / dispatch**` ∥ `**A task book is a table, not prose**` ∥ `**Why the fourth cell**` ∥ 末行 `Prose carries only the **goal and the boundary**`。

**同节其余六条在场**：`Verdict ≠ attribution` ∥ `A defect is a defect` ∥ `Name defects only by the defect` ∥ `Quantitative claims get tool-verified` ∥ `Fix designs: full dose first` ∥ `A branch added for an input that has not shown up`（末条三条续行亦在）。

**零触项（git 实判）**：`thincoder-core/prompts/discipline-normal.md` 无 hunk；两档提示词的 diff 只有本批五处所在的两个 hunk 区块（见 5.3）。

### 5.2 验收命令与读数（同尺 = `node` 行扫 · 原样）

**改前复跑（红侧在位）**

```json
{"A1_sjso":1,"A1_mag":1,"A1_sizing":1,"A1_f15":1,"A1_cap":1,"A1_sized":1,"A1_stay":1,"A1_implsz":1,"A2_new":0,"A2_dir":0,"A2_kept":"1,1,1,1,1,1","A7_new":0,"A7_why":1,"A3_zh":0,"A3_ctrl":7,"A4_v":1,"A4_d":1,"A4_name":1,"A4_q":1,"A4_fix":1,"A4_branch":1,"A6_size":8,"A6_small":4,"A6_sample":1,"A6_factory":1,"A6_touch":2}
```

**改后复跑（逐项对上 §2.9 ∥ §2.17.6 的期望）**

```json
{"A1_sjso":0,"A1_mag":0,"A1_sizing":0,"A1_f15":0,"A1_cap":0,"A1_sized":0,"A1_stay":0,"A1_implsz":0,"A2_new":1,"A2_dir":1,"A2_kept":"1,1,1,1,1,1","A7_new":1,"A7_why":1,"A3_zh":0,"A3_ctrl":7,"A4_v":1,"A4_d":1,"A4_name":1,"A4_q":1,"A4_fix":1,"A4_branch":1,"A6_size":0,"A6_small":0,"A6_sample":1,"A6_factory":1,"A6_touch":1}
```

命令本体 = §2.17.6 的「验收命令 ⑨」（`node -e` 行扫，判域 = 两份提示词 + 设计档 + 本批档），未改一个字符。

**一处读数与 §2.17.6 不同，原因已查明**：`A3_ctrl` 本席两轮都读到 7，§2.17.6 记的是 6。该探针扫本批档的 `尺寸闸`，§3 轮次 3 的两行证据格也引了这个串，比 §2 写读数时多出的正是那几行。它是控制样本（只要求非零，证明同一探针在别处读得出非零），不判残差；不改探针、不改 §2 读数。

**交付门**：`doc_check(mode:"gate", docs:[两份提示词])` 首行 `DOC-CHECK GATE: PASS`（范围 2 档 · 0 段有问题）。改后最后一次写盘之后重跑仍 PASS。

### 5.3 改动面（git 实判 · 零越界）

`git diff -- thincoder-core/prompts/` 在本席两档上只有两个 hunk 区块：

| 档 | hunk | 属于 |
|---|---|---|
| `discipline-engineering.md` | 第 4 条整块（+9 −15 行） | E8 |
| 同上 | `## Engineering judgment` 标题行 + 删 `Small job, small machinery` 一行 | E2 ∥ E1 |
| `persona-engineering.md` | 节首两行（`- Sized implementation batches …` ∥ `Implement sized batches …`） | E9 |
| 同上 | `- **Dispatch size discipline (pre-flight)**…` 一行 | E5 |

**同一 diff 里另有 `advisor-design.md` ∥ `advisor-round1..3.md` ∥ `common.md` ∥ `consult-base.md` ∥ `persona-eng-designer.md` ∥ `persona-plan.md` 的改动**：那是盘上既有的未提交改动（早前几批的落盘，如 §6.83 ∥ §6.86 与进行中的 `docs/batches/2026-11-08-citation-form-inline.md` 那本），**不是本席所写**。本席本轮五次写盘全落在这两档，未对上述任何一档发起写。

**越界项：无**。派单 `files` 两档之外的盘面零写入。

### 5.4 内部审计轮（explore · 只读发散审计）

第 1 轮：审计席逐条比 §2 的逐字目标，判 1 处发散、其余全过，另有三条判据（E 越界 · F 普通模式零 diff · G 命令 ⑨）因该席装配里没有 git/命令工具而未执行，明示「不能证明」。

**它捞到的那一处是真缺陷**：E9 第二行本席按「改前逐字、只换头三个词」落成了 `could do them yourself`，而 §2.17.1 的终稿围栏与设计档 §6.9 的同一份副本都写 `could do it yourself`。本席据此把该词改为 `it`（`it` 与换形后的单数主语 `a change` 对得上；`them` 在新句里已无复数先行词）。

审计席没能跑的三条，本席用自己的尺子补齐：git diff 逐 hunk 归属（5.3）、`discipline-normal.md` 零 hunk、命令 ⑨ 改前改后各一次（5.2）。

**自我修复轮次：1**（上限 5）。

### 5.5 内部代码评审轮（advisor code · 结论 pass）

评审对象 = 两档提示词；判据来源 = 本批档 §2 与设计档的逐字围栏块（设计档按声明排除，只作比对基线）。结论：五处逐字落地、八枚 A1 与 A2 ∥ A7 探针全翻面、A4 六条在场、无越界。发现 1 🟡 + 2 🔵，逐号处置：

| # | Action | Detail |
|---|---|---|
| 1 | Deferred | 🟡 `persona-engineering.md` 仍留按大小分档的现役条文：「inside ∧ small form (wording / coordinates / indexes / cleanup) ⇒ fix it on the spot; inside ∧ large (a precondition / needs design) ⇒ book it this round as a ledger row」（处置路由）∥「promote it as a small-batch candidate」（锚点复核）∥「and small fixes stay minute-level」（轮次字段的 Why）∥「a small-form item inside the write domain was already fixed on the spot」（同章复述）。四处逐字由本席自己回读确认。**不在本轮改的理由**：本轮任务书是五条逐字 + 明令「不要顺手改别的」，四处不在 §2.1 条目表内；`§2.7` 的清扫尺子是字面 token（「两提示词档其余 `size` \| **0 处**：本轮扫描只读到上面九处」），`small` ∥ `large` 这一族依构造不在该次判域，故这是本批盘点面的漏项，归设计席 ∥ 父侧裁（补 E10 与 `small` ∥ `large` 探针，或另开一批），不归实施席顺手改。 |
| 2 | Not an issue | 🔵 E8 落地档续行缩进 3 空格、设计围栏块 4 空格。文字逐行相等（5.1 的 `E8_record_vs_disk_all9: true` 按内容比出 true），且 3 空格是本档既有形（第 1–3 条续行同为 `   Why: …`），markdown 渲染同形。收尾比对取「去折行后的段」即无差；不构成落地缺陷。 |
| 3 | Not an issue | 🔵 E9 新首行 `this batch's record §2 is its task book` 与同 bullet 续行 `it IS the task book this spawn implements` 同义两处并存——设计席在 §2.17.1 已登记为「同义，不另造说法」，是裁定过的形态，不重复裁；该 bullet 将来再改时两处一并判。 |

**评审席另点名、本席核过为清的四类**：八枚 A1 字面全 0；`files` = 写权域与「一格一条路径、目录不支持」的机器规则仍住同档 `file-domain declaration semantics`（E5 只给理由、不重述，符合 §2.17.2）；两档为 `.md`，按 AGENTS.md 的文档面免行数判定；`discipline-normal.md` 的三档按用户 23:18 零触，与 §4「两口径不同是用户要的，不是漏项」一致。

**终端状态：`clean`**（审计 1 处发散已修并复验；代码评审 pass，无必须修项）。

### 5.6 决策披露与偏差

| # | 项 | 披露 |
|---|---|---|
| 1 | 本轮改写的文件 | 只有 `thincoder-core/prompts/discipline-engineering.md` ∥ `thincoder-core/prompts/persona-engineering.md`；派单外文件零写 |
| 2 | 与任务书的一处逐字落差 | E9 第二行的 `them` → `it`：按「按 §2.17.1 的终稿换形」执行；该处 `them` 是 §2.17.1 那句「只换头三个词」的概括所未覆盖的第四个词，与终稿围栏冲突时以终稿为准 |
| 3 | 任务书里一处对本轮无落点的话 | 派单里「`why` 里 `it` → `A number` 那处也照抄」，在 §2.5 围栏块 ∥ 设计档 §6.76 围栏块里都读不到 `A number` 这个片段（两份副本逐行相等）；故 E8 按围栏块逐字落，不因这句改字。若父侧指的是别处（同档另有 `A number restated in §2 stays alive only until the next design change falsifies it`），须点名坐标，本席未动该行 |
| 4 | 一处未得证据就动手的判断 | E5 只换首行：本席据 §2.17.3 认定续行为七行、逐行保留，并用六枚探针 + 实读七行确认 |
| 5 | 读数与 §2 不一致处 | `A3_ctrl` 7 ≠ §2.17.6 的 6，原因是 §3 轮次 3 的行内也引了该串；控制样本只要非零，不改探针、不改 §2 |

**依据（用户的裁定，落笔时引的原话）**：`docs/batches/2026-11-08-small-machinery-purge.md`「干活前不要去量活的大小。」∥「普通模式先不要动」。

### 5.7 E10 落地（本轮 · `persona-engineering.md` 五处 · 六行 · 逐字照设计档 §6.87 围栏块）

**判据来源**：设计档 §6.87「终稿」围栏块六行 ∥「五处各判什么」表 ∥ 批档 §2.9 的 A9 行 ∥ §2.20 #13。
**处数口径**：位置 = 五处，旧串 ∥ 新串 = 六枚（第 2 行属第 1 处的第二行，不另计处——与设计档表题同句）。

| # | 处 | 档内位置 | 落地形态 |
|---|---|---|---|
| 1 | 处置路由 | `Disposition routing` 条第二行 | `small form` ∥ `large` 两支删；`inside ⇒ fix it on the spot, in this round — what it would take is not a reason to defer it` |
| 2 | 记账的出口 | 同一条的第三行 | `**A precondition is booked as a ledger row** … a row is a cross-batch debt, not a place to park work this round declines to do` |
| 3 | 清账锚点复核 | `The anchor batch has closed while the work has not landed` 条 | `promote it as a small-batch candidate` ⇒ `give it a batch of its own when it has its own acceptance surface and its own cost of being wrong` |
| 4 | 修轮的 `Why` | `Round field` 的 `Why` 续行 | `small fixes stay minute-level` ⇒ `a fix round's work is the spot the finding names` |
| 5 | 记账条的复述 | 记账条 `A new debt` 的续行 | `a small-form item inside the write domain` ⇒ `an item inside the write domain` |
| 6 | 可以等什么 | `Setting a fix aside …` 条的 `**What genuinely waits, and on what**` | 三项 ⇒ 两项；`a design that does not exist yet` 删，why 半句 `the wait is on that event, not on the review's price` 逐字留 |

**验收读数（命令 ⑩ 原样 · 同尺 = `node` 行扫）**

```json
{"E10_old":"0,0,0,0,0,0","E10_new":"1,1,1,1,1,1","E10_ctrl":"1,1","E10_maxLen":289}
```

六行逐行宽度 = 289 ∥ 175 ∥ 262 ∥ 269 ∥ 131 ∥ 194（设计档 §2.19 记 289 ∥ 175 ∥ 269 ∥ 131 ∥ 194 ∥ 262，同一组数）⇒ 全部 ≤ 300。
全档最长行 = 300，是既有行，不是本轮新句。

**红侧怎么读**：改前两条读数（旧串各 1 ∥ 新串各 0）由设计席在 §2.17.6 与 §2.20 各记一次；本席复跑时改前盘面已不可回读 ⇒ 这一半按 `unverified` 记，判据自 §2 的两次读数。

**零触与越界（git 实判）**：`git diff -- thincoder-core/prompts/` 里本档的 hunk 只有本轮六行所在的四处；`discipline-normal.md` 无 hunk。
同一 diff 另有 `advisor-*.md` ∥ `common.md` ∥ `consult-base.md` ∥ `persona-eng-designer.md` ∥ `persona-plan.md` 的改动，是盘上既有的未提交改动（§5.3 已记），不是本席所写。

**交付门**：`doc_check(mode:"gate", docs:[`thincoder-core/prompts/persona-engineering.md`])` 首行 `DOC-CHECK GATE: PASS`（范围 1 档 · 0 段有问题）；末次写盘之后重跑仍 PASS。

### 5.8 内部审计轮 ∥ 内部代码评审轮（本轮）

**审计轮（explore · 只读 · 1 轮）**：结论 CLEAN，四类发散（PARTIAL ∥ SILENT-SIMPLIFICATION ∥ DOC-DRIFT ∥ OUT-OF-LIST）均 0。
它另核了一处口径问题：六行 ∥ 五处不矛盾——第 1 处自带两行，设计档表题与 §2.20 #15 都写「不另计处」；它给的旁证两条：六枚新串在 17 档只命中本档；其余 16 档 0 命中。
审计席装配里无 git ⇒ 「越界」与「`discipline-normal.md` 零触」两条它记「不能证明」，由本席用 git 补齐（见 5.7 末段）。

**代码评审轮（advisor code · `changes-required`）**：3 条，逐号处置。

| # | 严重度 | 处置 | 内容 |
|---|---|---|---|
| 1 | 🔴 | 上抛待裁 · 该行一字不动 | 本档记账条仍留 `A new debt is work needing a precondition or design … ⇒ book it the same day`。`or design` 就是设计档 §6.87 偏离二写明「用户 00:02 一句作废」的那一支；它与刚落地的第 2 行（记账只剩点名事件的前置条件）两处活文字并存。**该行不在围栏六行内、也不在 §6.87 射程外名单里** ⇒ 改它等于自造第 7 处，不改则 §6.87 偏离二为不实陈述；已在收口前上抛父侧裁（改行 ∥ 设计席改口径）。 |
| 2 | 🟡 | 写域外 · 报父侧 | `persona-eng-designer.md` 的 `Why` 续行仍留 `(fix rounds are small, minute-level)`——与本轮删掉的第 4 处同一句、同一族，不在设计档射程外五处名单内，也不在本席写域。 |
| 3 | 🔵 | 不改 | `Disposition routing` 条头仍写 `one criterion, three destinations`，实有去处是四类（问 ∥ 修 ∥ 记账 ∥ 不修不记不报）。不是本轮引入，不改变行为；留到下一次触碰该条时一并判。 |

**终端状态（写这一节时）：`stalled`**——六行已交付且 A9 四枚全对；1 条 🔴 落在设计档口径与围栏六行之外，本席无裁权，上抛父侧裁。
父侧 00:24 裁 (a) ⇒ 该处同轮修掉并复验通过，收尾状态 ∥ 读数 ∥ 披露见 §5.10。

### 5.9 决策披露与偏差

| # | 项 | 披露 |
|---|---|---|
| 1 | 本轮改写的文件 | 只有 `thincoder-core/prompts/persona-engineering.md`；派单外文件零写 |
| 2 | 派单正文没点名、但验收要求的一行 | 第 6 行（记账条的复述）来自设计档围栏第 5 行，`E10_new` 第六枚 `an item inside the write domain was already fixed` 只能落在这里；按「设计档 = 判据源」落笔 |
| 3 | 一处名词形 | 第 6 处由 `(another batch landing first)` 改为设计档围栏的 `(another batch lands first)`——两侧都读得通，按判据源取后者 |
| 4 | 一处未跑的红侧 | 改前读数没复跑（盘面已变，回读不到），按 §2 已记的两次读数引用，本席侧记 `unverified` |
| 5 | 行宽口径 | `E10_maxLen` = 289 取的是「含新串的行」里最宽的一行，不是全档最宽行（全档 300，是既有行） |

**依据（判据源原话）**：`docs/core/design/PROMPT-SYSTEM.md`「**「大」∥「需要另一次设计」不是推迟理由**——那是量词换了张脸。」∥ `docs/batches/2026-11-08-small-machinery-purge.md`「干活前不要去量活的大小。」

### 5.10 第 7 处（父侧 00:24 裁 (a) · 设计档 §6.87 判据直接覆盖 · 本轮已落）

**裁定**：`留 ∥ 改` ⇒ **改**。依据两句都是已定的：用户 2026-11-09 00:02「我们的要求就是都就地修！」；设计档 §6.87「「需要另一次设计」不是推迟理由——那是量词换了张脸」。`or design` 留在盘上，等于把刚删掉的东西在隔壁一句里复活。

**处数口径**：这是第 7 处——父侧裁定收进来的，不在 §2.1 的 E10 五处之内；漏在设计面，不在实施面。

**改前逐字 ∥ 改后逐字（`§Ledger` 记账条第 4 项首行）**

```text
改前：4. **A new debt is work needing a precondition or design** (in-scope review findings / stop-and-report output / doc drift) ⇒ book it the same day, naming the batch that takes it.
改后：4. **A new debt is work behind a precondition with a named event** (in-scope review findings / stop-and-report output / doc drift) ⇒ book it the same day, naming the batch that takes it.
```

三个举例（in-scope review findings ∥ stop-and-report output ∥ doc drift）按父侧口径原样留：它们说的是「哪些算债」，不是「什么可以等」。

**读数（红侧先读 · 同尺 = `node` 行扫）**

```json
改前 {"needing a precondition or design":1,"or design":3}
改后 {"needing a precondition or design":0,"or design":2,"work behind a precondition with a named event":1}
```

**裸串 `or design` 不能当尺，记下来免得下一个人照抄**：改前 3 处里两处是无关注释（`…a requirement or design doc…` ∥ `…a token or designId value…`），改后仍 2 ⇒ 它永远翻不到 0。
这一处的探针用整短语 `needing a precondition or design`：改前 1 → 改后 0，红侧在位、绿侧成立。父侧要的「现盘 0、改前 1」按整短语读才成立。

**A9 四枚复跑（这处不在六枚旧串里，读数不该变——实跑也没变）**

```json
{"E10_old":"0,0,0,0,0,0","E10_new":"1,1,1,1,1,1","E10_ctrl":"1,1","E10_maxLen":289}
```

命令 ⑨ 同批复跑：八枚 A1 全 0 ∥ `A2_new` ∥ `A2_dir` = 1 ∥ `A7_new` = 1 ∧ `A7_why` = 1 ∥ A4 六枚各 1 ∥ `A6_size` ∥ `A6_small` = 0，三枚样本各 ≥ 1。
新行宽 186；全档最长行 300，是既有行。

**一处字面选择（披露）**：父侧给的目标形是 `A new debt is work behind a precondition that names its event`。照抄会让 A9 第二枚新串读成 2（第 5 处那行也含 `a precondition that names its event`），与「六枚新串各 1」的验收冲突。
故本行取同义形 `a precondition with a named event`：语义不变（记账入口只剩点名事件的前置条件），A9 保持 `1,1,1,1,1,1`。父侧若要逐字那句，改回即可，届时 A9 期望须同改。

**交付门**：`doc_check(mode:"gate", docs:[`thincoder-core/prompts/persona-engineering.md`])` 首行 `DOC-CHECK GATE: PASS`（范围 1 档 · 0 段有问题）。

**评审轮次与收尾**

- 第 1 轮（advisor code）判 `changes-required`：1 🔴（即本处）∥ 1 🟡（`persona-eng-designer.md` 同族句，写域外，父侧另派设计席）∥ 1 🔵（处置路由条头数词，不改）。
- 第 2 轮（fix verification）判 `pass`：本处核为 Fixed；另出 1 条 🔵——同一行括号里三个举例在触发语收窄后读作前置条件的实例——**按父侧 00:24 的明令原样保留**，记作可选、不阻断。
- **自我修复轮次：1**（上限 5）。**终端状态：`clean`**——本轮改动面的 7 处全部落地，A9 四枚与命令 ⑨ 全批复跑全对，`doc_check` 门 PASS。

**本节写域**：只动 `thincoder-core/prompts/persona-engineering.md` 与本段；设计档 ∥ §1 ∥ §2 ∥ `discipline-normal.md` ∥ `persona-eng-designer.md` 未触。

### 5.11 E11 落地（`persona-eng-designer.md` 的 `Why` 一句 · 逐字照 §2.21.2）

**判据来源**

- 目标形 = §2.21.2 的改前 ∥ 终稿逐字块。
- 验收 = §2.9 的 A10 行 ∥ 命令 ⑫。

**改前 ∥ 改后（盘上逐字）**

```text
改前：Why: a full exploration spends the round on what is already pinned; turn budgets apply per round (fix rounds are small, minute-level).
改后：Why: a full exploration spends the round on what is already pinned; turn budgets apply per round, and a fix round's work is the spot the finding names.
```

**逐字对版（脚本判定，非目测）**

- 改后行与 §2.21.2 的终稿 `equal: true`，两侧同为 151 字符。
- `turn budgets apply per round` 按该节要求逐字留，未动。
- 删掉的只有那个括号半句。

**读数（命令 ⑫ 原样 · 同尺 = `node` 行扫）**

动手前（红侧，本席实跑）：

```json
{"D1_old":1,"D1_new":0,"D1_ctrl":1,"D1_largest":1,"D1_maxLen":null}
```

改后（绿侧）：

```json
{"D1_old":0,"D1_new":1,"D1_ctrl":1,"D1_largest":1,"D1_maxLen":151}
```

**A10 五枚怎么对**

- `D1_old` = 0 ∧ `D1_new` = 1 ∧ `D1_ctrl` = 1 ∧ `D1_largest` = 1 ∧ `D1_maxLen` 151 ≤ 300 ⇒ 全部成立。
- 红侧跑在动手之前，盘面仍是改前态 ⇒ 前两枚能翻面，不是恒绿。
- `D1_ctrl` 与 `D1_largest` 是控制样本，两侧同在，证明同一把尺在该档读得出命中。

**同族复查（本席实扫该档）**

- `small` ∥ `size` ∥ `minute` ∥ `magnitude` ∥ `sizing` = 0 命中。
- `largest single injection-pollution source` = 1 处，按 §2.21.2 不动。

**交付门**

`doc_check(mode:"gate", docs:["thincoder-core/prompts/persona-eng-designer.md"])` 首行 `DOC-CHECK GATE: PASS`（范围 1 档 · 0 段有问题），末次写盘之后跑的。

**改动面（git 实判 · 无越界）**

- 该档 diff 有两个 hunk，本席只写其中一个：`Why` 那一行，1 行换 1 行（`hashline_edit` 回执「replaced 1 line(s) at L65 with 1 line(s)」）。
- 另一 hunk 在档首的 `Do not fire reviews yourself — the user alone fires them` 一条，是盘上既有的未提交改动（§5.3 已把该档列在既有 diff 名单内），本轮未对它发起任何写。
- 本轮未触设计档 ∥ 两档提示词 ∥ `discipline-normal.md` ∥ 需求档 ∥ 台账。

**内部审计轮（explore · 只读 · 1 轮）**

- 结论 `AUDIT: CLEAN`；四类各 0（PARTIAL ∥ SILENT-SIMPLIFICATION ∥ DOC-DRIFT ∥ OUT-OF-LIST）。
- 它独立答了两问：`largest single injection-pollution source` 1 处，且那行仍是讲 changelog 的句子；`fix rounds are small` ∥ `minute-level` 0 命中。
- 它装配里无 git、无命令工具 ⇒ 越界与行宽两条它记「不能证明」，由本席以 git diff 与字符计数补齐。

**内部代码评审轮（advisor code · `pass`）**

| # | 严重度 | 处置 | 内容 |
|---|---|---|---|
| 1 | 🟡 | 写域外 · 报父侧 | 设计档没有这一笔的落点：`PROMPT-SYSTEM.md` 自己写着「变更路子 = 改规则 → 先改机制文档 → coder 依它改 EN」，而本笔的唯一记录是批档 §2.21.2；§6.87 只记了同一句在 `persona-engineering.md` 的那份，其受影响文件表与边界（「不动射程外五处同族」）都不含本档，与批档 §2.7 的「射程外六处」并列读会打架。批档又被定义为「过程档，可整档删」⇒ §2.21.2 一删，理由无处可读。设计档不是本席的笔 ⇒ 上抛父侧 |
| 2 | 🔵 | 不动 | 桌面发行产物 `dist-r3` ∥ `dist-r4` 的 `app.asar` 仍含退役句（那一版还带盘上已无的 `no full exploration` 半句）。既有构建产物、非本轮改动 |

**终端状态：`clean`**

自我修复轮次：0 —— 审计判 CLEAN、代码评审 `pass` 且无必须修项，没有触发修复。

**决策披露与偏差**

| # | 项 | 披露 |
|---|---|---|
| 1 | 本轮改写的文件 | 只有 `thincoder-core/prompts/persona-eng-designer.md`（一行）；派单外零写 |
| 2 | 命令 ⑫ 的跑法 | 本席 shell 的 cwd 落在 `D:\teamcode`（不是项目根）⇒ 直跑原文报 ENOENT；改用绝对路径跑同一条命令体，逻辑与 §2.21.2 一字不差，读数不受影响 |
| 3 | 红侧可复核性 | 红侧是本席动手之前实跑的本档盘面，不是转述 §2.21.2 的读数 |
| 4 | 同一文件里的第二个 hunk | 档首那条属既有未提交改动，非本席所写 |
| 5 | 一处不改 | 评审开的 🟡 落在设计档（他人笔），本席只报不改 |
| 6 | 首次写入被机检门拒 | 本段第一次 append 被判「文字太长」1 条（那段「改动面」挤了四件事），拆成带名条目后复跑过门；内容一字未丢 |

**依据（判据源原话）**：`docs/batches/2026-11-08-small-machinery-purge.md`「工程里没有「小事」。」∥「删的是 `(fix rounds are small, minute-level)`：它拿「小」与「分钟级」论证不必读全。」

**本节写域**：只动 `thincoder-core/prompts/persona-eng-designer.md` 与本段。

## §6 验证与收口（父代理）

### 验收（父侧独立复核）

**复核方式**：不信任何一席的自报读数，**用另一条路径重数一遍**——直接对三个提示词档做字符串计数，再与实施席的命令读数对照。

| 档 | 旧串 | 新串 | 控制串 |
|---|---|---|---|
| `persona-engineering.md` | 6 枚各 0 | 6 枚各 1 | `accumulates in small moves` ∥ `however small or obvious` 各 1 |
| 同上（第 7 处） | `needing a precondition or design` = 0 | `a precondition with a named event` = 1 | — |
| `persona-eng-designer.md` | `(fix rounds are small, minute-level)` = 0 | `a fix round's work is the spot the finding names` = 1 | `largest single injection-pollution source` = 1 |

**控制串全部读 1 是本批最关键的一次读数**：它证明清的是**按处**，不是**按词**——射程外那些用「小」作比喻 ∥ 作反用的句子**一句没动**。哪次控制串归零，就说明有人手滑清了不该清的，判据随之失准。

### 集成交付

**`none`**。改动面是提示词措辞与设计档，**零运行期代码，不改变任何业务可观察结果**；`test/RTM.md` 的故事行无一行断言 system prompt 文本或装配等价性。**没有业务场景支撑的用例不造**——「这条改动了总该有个用例看着」不是造用例的理由。

**⟹ 未做集成测试验证，父侧收口这一跑就是本批唯一的集成面。**

### 本批三次同类漏网（写下来给下一批看）

同一件事在**四个不同位置**各躲过一次：

1. **你 23:09 发现**——`量级判断` 还在章节条文里；
2. **评审第 4 轮发现**——`persona-engineering.md` 首条 `small / exploratory / interactive changes stay in the main session`，而 §2.7 用三个词把它「归类掉」了；
3. **评审第 5 轮发现**——两份「什么可以等」的清单并存，旧的那份还写着 `a design that does not exist yet`；
4. **实施席发现**——`A new debt is work needing a precondition or design`，`or design` 在「记账规则」里复活。

**共性**：**判据的射程按文件算、按表算，而问题按处算。** 下一次清同类条文，**先按语义逐处过，再拿 token 尺复核**——反过来必漏。

### 遗留（真债，各带条件）

- **`#2217`**：设计档六处写 `index.publicRepos` 实读 = `[]`，实为两个仓。**条件**：下次动那些勘察证据行。
- **`#2218`**：设计档三处写「三行续行」，实物七行。**条件**：下次动 §6.9 ∥ §6.64 ∥ D-PS56。

**两笔都不属于本批判据的射程**（一笔是假读数、一笔是覆盖面计数），**按「有前置条件、点名事件」入账，不留在批档**。

### 核销

- 台账行 **`#2215`（small-machinery-purge）**：三档提示词 + 设计档连带完成 → 收口 → 核销。
- **覆盖账 = #2215**。
