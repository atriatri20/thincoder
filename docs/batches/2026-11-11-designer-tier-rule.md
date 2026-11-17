# 2026-11-11 · designer-tier-rule
> 六段，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 每段只有一个作者：作者的段可 `append` 加内容、可就地改（`edit`）；非作者一概拒。
> 编制：主 agent · 2026-11-11 · 来源 = 来源 = 用户 2026-11-11 17:15「提示词里不是已经说了让他当批定吗？」→ 父侧实查 `thincoder-core/prompts/`，该判据只在 `advisor-design.md` 有（设计评审判据第 8 条），`persona-eng-designer.md` 零命中。17:17 用户：「你他妈不会开新批吗」——单开一批落它。。
> 台账 = #2340（core · 归批）。前情 = 无（独立批）。
## §1 讨论（主 agent）
**状态行**：🔄 进行中（…）
批起 sha = 48482678ab9c708d3eaf63d5d49f520d2041ae34
<§1 模板占位：本批条目 / 关键判据 / 授权口径>

### 需求（主 agent 拟，供 §2 引用）

**目标**：把文件档位判据从「只有评审判得到」补到「设计席也读得到」。

**现场**（父侧实读 `thincoder-core/prompts/`）：

```
advisor-design.md:45   >500 lines → the design must give a split plan (no discretion),
                       and the split lands inside this batch (no deferral to another batch);
                       >800 lines → must split
persona-eng-designer.md   该串零命中
```

**今天实发的后果**：设计席把没越线的 `thincoder-core/agent-tools/batch-gate.mjs`（352 行）写成「过 500」、把真越 800 的 `thincoder-core/doc-check/index.mjs`（1076 行）写成「拆分放另一批」；评审判红两条，整批多返工一轮。

**落点**：`thincoder-core/prompts/persona-eng-designer.md` 预评审清单第 ② 项的现文

```
② Full affected-file list + its tier conclusion (no counts or deltas)?
```

要改成把判据写进去：`>500` 给分拆方案、`>800` 必须拆且拆在本批、拆完判决逐字不变。**措辞照 `advisor-design.md` 那两句，不另造。**

**验收**：`grep "split lands inside this batch"` 与 `grep "800"` 在该档各 ≥1；改后该档 `doc_check` gate PASS。

**边界**：只动这一个提示词档；`advisor-design.md` 是源，不改。

### 台账 #2341 并入本批（父侧记）

`docs/core/design/PROMPT-SYSTEM.md` 三处事实收正已落（设计席 `#4`），内容不在 §2 的档位判据范围内，故 §2 不扩；本行是它在账上的落点。三处原句与改句如下（围栏内为原文引用）：

```text
① 边界条
改前  **不写不删 `.thincoder/advisor.md`**（K1：workspace 级档实存，写它即整档取代内建）
改后  **不写不删 `.thincoder/advisor.md`**（K1：该路径是运行期操作数，工作区级与仓级两级都不存在；写它才整档取代内建）

② K1 决策 ②
改前  该档在本仓 cwd 实读不存在；共存事实：工作区根 …… 实存 ⇒ 会话 cwd 落在工作区根时 loadAdvisorMd 命中该档
改后  该路径是运行期操作数，两级都不存在；写它才整档取代内建

③ 勘察证据
改前  …… 实存（workspace 级档）∥ 本仓 `.thincoder/` 实读无 advisor.md
改后  = 运行期操作数（ADVISOR_MD_PATH），两级（工作区根 ∥ 本仓 cwd）实测均不存在；写它才整档取代内建
```

**读数**（父侧复跑）：`workspace 级档实存` 0 命中 · `实读无` 0 命中 · `运行期操作数` 3 处。

**豁免**：`index.docCheckExemptions` 登记一条（`kind` = `锚·档缺`），只对 `docs/core/design/PROMPT-SYSTEM.md` 生效，覆盖该串 8 处——**它是运行期操作数，不是文档指针**；改写法等于让检查替记录改口。

**边界**：K1 的裁定（不写不删）与 `loadAdvisorMd` 的行为描述一字未动。

### 父侧更正：开批前提是假的，射程缩到两件

**更正**：开批时我写「`persona-eng-designer.md` 该串零命中」。**这是错的**——我用中文词（「当批拆分」∥「拆到本批」）搜，而原文是英文 `lands inside this batch`。该规则一直在：

```text
persona-eng-designer.md 九项交付物第 3 项（受影响文件清单）
3. **Affected-file list** — source/test files + one tier-conclusion line
   (which files cross a tier, each with a **split plan** that lands inside this batch,
   or that none crosses); no line counts or expected deltas in the doc
```

**所以设计席不缺这条规则，它违反了自己手上就有的规则**——它写「拆分放另一批」时，同一份提示词的九项交付物第 3 项正在禁止那样写。

**射程因此缩到两件**：

```
真   先量读数再下结论 —— 这句提示词里确实没有（今天把 352 行写成「过 500」的根因）
真   一份批档 = 一张任务书 —— 那句要重写（用户 17:21 裁）
假   把档位判据搬进设计席 —— 本来就在九项交付物第 3 项，再写一遍就是两份详述（D2）
```

**判据随之改**：不新增档位判据；只加「先取读数」一句，并重写「一份批档 = 一张任务书」那句。

### 用户裁定：三件都做（2026-11-11 17:58）

**用户原话**：「1/2/3都要做」。

起因：档位规则在 `persona-eng-designer.md` 九项交付物第 3 项一直存在（「each with a split plan that lands inside this batch」），设计席仍然写成「拆分放另一批」；评审每次都拦，拦完下一轮照犯。**规则写在提示词里只能管“记得”，管不住“顺手”**——所以要三个不同层面的兜底。

```
① 量做成必交件（文档面）
   设计席交付时必须贴出 doc_check 的 lines 那一行输出；没有这一行 ⇒ 交付不算完成。
   病根：现文本只说「its tier conclusion」，给一句话就算过，于是随手写成「另一批」。

② 收口门兜底（代码面）
   batch close 时按 §2 的文件清单逐档量：越 500 行而 §2 里没有对应分拆方案 ⇒ 拒绝收口。
   这条是真正管住「顺手」的那一层：门在两处各判一次。

③ 判据只留一处（文档面）
   档位语义单源 = docs/core/design/DOC-GRAPH.md §3；
   advisor-design.md 与 persona-eng-designer.md 只留指针，不重述阈值。
   病根：三处各说一遍，哪一处先漂都没人知道。
```

**判据**：①③ 是文档改动，② 要设计 + 实施（落在批档门的 close 面）。三件的验收各自独立，互不替代。

## §2 批次任务与设计（eng-designer）
**状态行**：设计完成（设计面 C1∥C2∥C3∥C1c 已落盘；落点 B 判据改判（触发物 = 改动面实测越线，非 §2 清单在不在）后本席同轮回写：§2 落点 B（3）判据三行表＋红侧八例 · 验收 B1–B9 · DOC-GRAPH §3 ② ∥ DOC-DISCIPLINE §3.20 ⑤ 臂登记句——三处旧句已删）
**本批范围**：三个落点各管一层——A 文档面（必交件）· B 代码面（收口门）· C 文档面（单源）。目标与现场见 §1。

| # | 层 | 落点 | 谁落 |
|---|---|---|---|
| A | 文档面 | `persona-eng-designer.md` 预评审第 ② 项：补「先取读数」 | eng-coder（产品面） |
| B | 代码面 | 收口门新增档位臂：`batch-tier-gate.mjs`（新档）+ `batch-closeout.mjs` 判序 + `batch-skeleton.mjs` §2 模板 | eng-coder（产品面） |
| C | 文档面 | 单源：`DOC-GRAPH.md` §3 ∥ `DOC-DISCIPLINE.md` §3.20 ∥ `BATCH-RECORD.md` 收口门判序行（本席本轮落）· `advisor-design.md` 第 8 条 ∥ `persona-eng-designer.md` 受影响文件清单（eng-coder） | 分列 |

落点 B 的新档落位：

```text
thincoder-core/agent-tools/batch-tier-gate.mjs
```

### 1 · 落点 A（文档面）：预评审 ② 要先取读数

现文（逐字）：

```text
     - ② Full affected-file list + its tier conclusion (no counts or deltas)?
```

改后文（逐字，两项；首行 5 空格 + `- `，续行 7 空格）：

```text
     - ② Full affected-file list + its tier conclusion (no counts or deltas)? **A tier conclusion is not a conclusion without its reading**: take the lengths first with `doc_check` (`mode:"report"`, `lines:` over this batch's source/test files) and paste its reading line into batch record §2; the design document carries the conclusion only — the "(no counts or deltas)" in this item binds the **design document**, not the record: the record is the one-off carrier a reading may live in, and it leaves with the batch.
       **No reading line in §2 ⇒ the delivery is not complete** — a reader who cannot see the lengths cannot tell a judged file from a guessed one.
```

- 该项其余文字不动；不加任何阈值数字（阈值不在执行面，见落点 C）。
- **为什么**：现文只要求「一句档位结论」，给一句话就算过——随手写「拆分放另一批」也过。要求贴出读数，「量过没有」就从读者的猜测变成可看的一行。

### 2 · 落点 B（代码面）：收口门兜底

**三件要决的**（用户 17:58 裁 ②）：量在哪一步跑 · 「分拆方案」怎么被机器认出来 · 判不出时拒还是放。

**(1) 机器可读的输入端 = §2 里一张固定形的表**

块形（原样落进 §2；围栏此处只当示例）：

```text
**受影响文件（机读清单）**

| 档 | 分拆方案 |
|---|---|
| <仓根相对路径> | <方案一句；未越线写 —> |
```

- 一行一档，只列**源档**；`.md` 不列（零行数义务，尺子也不给它们档位标记）；**本批自己的单测档也不列**——设计时它未上盘（无读数可判），收口前它必已删除（同门的单测档门就把这条当拒因），两个判定时点都量不到它；本臂量的是改动面、不是清单，列不列都不改变它的判定。它的档位结论仍逐档写在本记录的受影响面与分层结论里（§4 已逐档给）。
- 第二列在越线时必填，判法是**正向形**，不是词表：须同时点名①目标（至少一个带目录段的档 token）∥ ②本批哪一步落成（`实施轮` ∥ `§5`，闭集声明在门档内）。缺一即视同未填——「另起一批」「留到下批」「下批拆」都不点名目标，全不命中；点名了目标却把落地推给下一批的，不命中落步词，同样不命中。正向形挡的是没进词表的下一种说法，子串黑名单挡不住它。
- **形单源** = `batch-skeleton.mjs` 的 §2 模板占位（写手一打开批档就看见该填什么）；**语义单源** = `DOC-GRAPH.md` §3。

**(2) 量在哪跑：收口判序里新开一臂，不另设判定时点**

- 新档 `batch-tier-gate.mjs` 导出 `assertTierPlan(src, root, changed)`：触发 = `changed`（本批改动面 = 触达账 ∪ 提交 diff，调用方交的现成两面）里源 ∥ 单测档的 `countContentLines` 实测；无越线档 ⇒ 直接 return（不解析 §2）；有越线档 ⇒ 才去 §2 找它的正向形方案；缺 ⇒ 拒，点名「哪档 / 多少行 / 缺什么 / 要写什么」。
- **形状照 `batch-unit-test-gate.mjs`**：单源叶档、判据可被单测直取（一段 §2 文本 + 仓根 + 一份改动面，零装配）；依赖 = `doc-check/line-reads.mjs` 的 `countContentLines`（量法单源）∥ `doc-check/paragraph.mjs` 的 `DOC_CHECK_BUILTINS.fileSoftMax`（阈值单源），不 import 判序档。
- `batch-closeout.mjs` 的 `assertCloseoutGates` 末尾、`④ 文档机检门` 之后加一臂调用它，**位置与叫法同一个数：第 ⑤ 臂**。该臂自带 `mode === "normal"` 判式（不动已成组的 ①② 两臂）；`repair` ∥ `supersede` 两路跳过它——这两条收口边按定义没有可判的 §2。
- **依据改判后的读数，档头注与 jsdoc 的跳过集同轮改成「只跳过 ①②⑤，③④ 照跑」**：改判前 ⑤ 臂以「§2 缺块」启动、`repair` ∥ `supersede` 两路跳过它；改判后 ⑤ 臂只被「改动面实测越线」触发——两路收口边本就没有源 ∥ 单测档改动面，仍跳过它，判式与跳过集一字未动，登记句照旧成立。
- **读数尺 = `countContentLines`**：收口面自己重量一次，不采信 §2 里抄来的数。

依据 `thincoder-core/doc-check/index.mjs`「量法的家 = `./line-reads.mjs` 的 `countContentLines`（全仓唯一实现，本档再导出）」

**(3) 判据三行，出处 = 红侧实跑，全 fail-closed**

**为什么改判**（父侧 2026-11-11 裁）：旧门判「§2 有没有那块清单」——判格式在不在，实测后果三条：在飞批档收不了口 ∥ 测试夹具 12 例红 10 ∥ 本批自己也收不了口。新判据判「越线了却没方案」——触发物是改动面的实测长度，不是格式在不在。

| 情形 | 判 | 出处 |
|---|---|---|
| 触发 = 本批改动面里的源 ∥ 单测档，`countContentLines` 实测 > `fileSoftMax`；无越线档 | 过（不解析 §2，连 §2 都不看） | 红侧 ①②（§5 实跑绿） |
| 有越线档、§2「受影响文件（机读清单）」有其正向形方案 | 过（「门可过」的读数——没有它，门可能只会拒） | 红侧 ③（§5 实跑绿） |
| 有越线档、§2 无其方案行 ∥ 方案只有 `—` ∥ 逃生口词 ∥ 缺本批落步 | 拒，点名「哪档 ∥ 多少行 ∥ 要写什么」 | 红侧 ④-1–④-4（§5 实跑绿） |
| 本批删掉 ∥ 搬走的源档（不在盘） | 不拒——盘上没有长度可量，跳过 | 红侧 ⑤（§5 实跑绿） |

- **「缺块 ∥ 行不成两列 ∥ 档不在盘」三条全部不再是拒因**：「§2 缺块」不启动本臂；读不成两列的行跳过，该档落进「无方案」那一支照判；不在盘的档没有长度可量，跳过。
- **方案查找只认块头后第一张表**：同块头下的第二张表不进判——写在第二张表里的方案视同没写 ⇒ 拒（fail-closed；拒文准确，把行挪进第一张表即可）。

**为什么拒而不是放**：收口是这条规则的最后一道；放过一次，规则就退化成提示词里那句只能管「记得」的话。

**红侧（必交，八例 · 以实跑为准）**：夹具 = 一段 §2 文本 + 仓根 + 一份改动面，直接喂 `assertTierPlan(src, root, changed)`，不造真批档。八例：

- ① 只改文档、无越线档 ⇒ 过（§2 里连块都没有也照过）
- ② 改源码但都不越线 ⇒ 过
- ③ 越线 + 方案点名目标 + 本批落步 ⇒ **过**（「门可过」的读数）
- ④-1 越线、§2 清单里没有这一档 ⇒ 拒，点名「哪档 ∥ 多少行 ∥ 要写什么」
- ④-2 越线、该行方案只有 `—` ⇒ 拒（视同未填）
- ④-3 越线、方案 = 逃生口词（「另起一批拆」）⇒ 拒（点名不了目标）
- ④-4 越线、方案点名了目标却把落地推给下一批 ⇒ 拒（缺本批落步）
- ⑤ 本批删掉的源档（不在盘）⇒ 不拒——盘上没有长度可量

③ 与 ④-1–④-4 配对：一对读「门真的会放」，四支读「门真的会拒」。实跑读数住本记录 §5（八例全绿）。

**(4) 与「判定时点只有两个」的关系（关键决策 KD-B1）**

本臂判的**不是代码长短**，是「越线档该有的方案在不在」；触发线用 500，因为它正是设计时那条线的同一把尺。代码越 800 照旧由机检引擎那一条判，本臂不碰。判定时点仍是两个，收口面多了**记录缺件**这一判，不是多一个长度判定点。

被本决策改述的原文，依据 `docs/core/design/DOC-GRAPH.md`「**未过 800（≤ 800）⇒ 不因代码长短要求拆分**」（改述前那一句说的是「不管、不提拆分要求」；C2 落盘后收口面在长度上只判这一条，另判的那一件是记录缺件）。

### 3 · 落点 C（文档面）：判据只留一处

**单源 = `docs/core/design/DOC-GRAPH.md` §3「行数档位口径」**（阈值、判定时点、过线判什么）。其余面只留**执行句 + 指针**，不重述阈值。

| # | 档 | 改法 | 谁落 |
|---|---|---|---|
| C1 | `DOC-GRAPH.md` §3 | 「同口径共六处 … 任一处改动须同轮改其余五处」退役，连同为目标形服务的两句计数与「逐字一致」三条：语义单源 = 本节，两处提示词只留执行句 + 指针 | 本席（实施轮同批落） |
| C2 | `DOC-GRAPH.md` §3 收口条 | 按 KD-B1 改述：收口面判两件——代码越 800 则拆；§2 里越 500 的档必须带方案（判记录缺件） | 本席（实施轮同批落） |
| C3 | `DOC-DISCIPLINE.md` §3.20 | 收口判序登记第 ⑤ 臂（档位臂）——臂号与 §2 落点 B 的臂号同一个数 | 本席（实施轮同批落） |
| C4 | `advisor-design.md` 第 8 条 | 三行换一行：阈值与「判两点」的数值 → 一句指针 | eng-coder |
| C5 | `persona-eng-designer.md` 受影响文件清单一项 | **不删**执行句，其后加一句指针 | eng-coder |

**C1 改后文（逐字，已落盘；替换「同口径的其余各档 … 任一处改动，须同轮改其余五处」整块，即含目标形引文块、「逐字一致」三条与「同口径共六处」那一行；排他句按 §9 收窄后落盘，下列即盘上原文）**：

```text
**语义单源 = 本节**：判据口径的娘家在本节——阈值是多少、两个判定时点各判什么、过线判什么，以本节为准。执行面留两句——`thincoder-core/prompts/advisor-design.md` 第 8 条判据的指针句、`thincoder-core/prompts/persona-eng-designer.md` 受影响文件清单的指针句——只指本节，不另立判定时点。

**为什么把「六处同轮改」退役**：那条附带的是「多处重述 + 靠人同步」的维护法，而它治的病是重述本身。判据只在一处，就没有第二处要走样，也不需要谁记着同轮改几处。
```

**C2 改后文（逐字，两处）**：

```text
**② 收口时判一次 = 800（收口检查判代码长短；另外判一条记录缺件）**

- **过 800（> 800）⇒ 先拆再落**：拆分是落地的前置条件，不与落地并行。
- **未过 800（≤ 800）⇒ 不因代码长短要求拆分**：收口面在长度上只判这一条。它另判的那一件不是长度——本批改动面里实测越了设计时线的档，§2 必须带其分拆方案（判的是**记录缺件**，实现 = 收口判序第 ⑤ 臂；没有越线档 ⇒ 该判不启动，连 §2 都不看）。
```

**C3 改后文（逐字，加进 §3.20 的收口门序列那一段，接在「④ 文档机检门」之后）**：

```text
⑤ 档位臂（`batch-tier-gate.mjs` 的 `assertTierPlan`）：触发 = 本批改动面里实测越设计时线的源 ∥ 单测档；有越线档而 §2 无其正向形分拆方案 ⇒ 拒，点名「哪档 ∥ 多少行 ∥ 要写什么」；没有越线档 ⇒ 过（连 §2 都不看）。与 ①② 同属 `mode === "normal"` 组（`repair` ∥ `supersede` 跳过），③④ 两臂照跑。判据语义单源 = `DOC-GRAPH.md` §3「行数档位口径」。
```

**C4 现文（逐字，三行）**：

```text
   **Any file crossing a file tier must carry a split plan in the design** — the tier is judged on the length **before** the code change.
    >500 lines → the design must give a split plan (no discretion), and the split lands inside this batch (no deferral to another batch); >800 lines → must split, and the split lands before the change (hard cap, no exemption channel).
   **Judged at two points, nowhere else**: the design round judges the 500 line, the closeout check judges the 800 line — the implementation, code review and every other step in between judge nothing at all (not the 800 line either).
```

**C4 改后文（逐字，三行换一行）**：

```text
   **Any file over the design-time line must carry a split plan in the design.** Which line, which point judges it, and the basis (the length **before** the code change) have one home: `docs/core/design/DOC-GRAPH.md` §3「行数档位口径」. This criterion restates none of it and adds no judgment point of its own.
```

**C5 改后文（该项原句一字不动，其后加一句，续行 7 空格）**：

```text
       The tier's semantics — where the line sits, which point judges it, what crosses it — have one home: `docs/core/design/DOC-GRAPH.md` §3「行数档位口径」; this item restates none of it.
```

**C 的边界（用户裁）**：受影响文件清单那条不删——它是执行面唯一一句；本落点删的是重述，不是执行句。

依据 `thincoder-core/prompts/persona-eng-designer.md`「each with a **split plan** that lands inside this batch」（执行句留在盘上）

依据 `docs/core/design/DOC-GRAPH.md`「**语义单源 = 本节**：判据口径的娘家在本节」（C1 落盘后，「六处同轮改」与「同口径共六处」那个计数已从该节退役）

### 4 · 变更面

| 面 | 档 | 谁改 | 改什么 |
|---|---|---|---|
| 产品面 | `thincoder-core/prompts/persona-eng-designer.md` | eng-coder | 落点 A 两句 + C5 一句指针 |
| 产品面 | `thincoder-core/prompts/advisor-design.md` | eng-coder | C4：三行换一行 |
| 产品面 | `thincoder-core/agent-tools/batch-closeout.mjs` | eng-coder | 收口判序加第 ⑤ 臂 + 档头跳过集那句改成「只跳过 ①②⑤，③④ 照跑」 |
| 产品面 | `thincoder-core/agent-tools/batch-skeleton.mjs` | eng-coder | §2 模板占位补该块的形 |
| 产品面 | 新档 `batch-tier-gate.mjs` | eng-coder | `assertTierPlan(src, root, changed)`（形状照 `batch-unit-test-gate.mjs`；触发物 = 改动面实测长度） |
| 设计面 | `docs/core/design/DOC-GRAPH.md` | 本席（实施轮同批落） | C1 ∥ C2 |
| 设计面 | `docs/core/design/DOC-DISCIPLINE.md` | 本席（实施轮同批落） | C3（第 ⑤ 臂登记） |
| 设计面 | `docs/core/design/BATCH-RECORD.md` | 本席（实施轮同批落） | 收口门判序那行（① 链门 → ② §3 状态词臂 → ③ 本门 → ④ 机检门）接上 ⑤，臂号与同轮各处一致 |
| 单测 | `docs/batches/2026-11-11-designer-tier-rule.test.mjs` | eng-coder | 落点 B 的红侧五支（收口删除） |
| 集成面 | 无 | — | 见固定行 |

`BATCH-RECORD.md` 那一行是本轮从评审第 4 条（臂号打架）直接推出来的：同一串臂序在该档盘上还有一份，新臂落地而它不改，下一轮读到的就是一个四臂的判序。这一处不在用户裁定 ③ 点名的三处里——父侧不认就删这一行，其余不受影响。

**分层结论（逐档，四档）**：

- 两档源档已在盘、未越设计时线（读数见下），不提分拆方案。
- 新档 `batch-tier-gate.mjs` 设计时未上盘 ⇒ 无「改前」读数；依据 `docs/core/design/DOC-GRAPH.md`「判它落盘时的长度——它是本批写出来的那一档」，它的长度落盘后由 §5 取，设计时不写数。
- 单测档 `docs/batches/2026-11-11-designer-tier-rule.test.mjs` 同样未上盘（实施轮建立），且收口前必删——两个判定时点都量不到它，故无分拆方案、也不进机读清单；这是一条已知残量，写在这里，不留给发现。
- `.md` 各档零行数义务（依据 `thincoder-core/prompts/advisor-design.md`「**Pure `.md` documents are exempt** from that tier judgment.」）——本轮改到的五份 `.md` 全在这一档里。

**受影响文件（机读清单）**

表放围栏内，是因为它按定义要列**本批新建、此刻尚未上盘**的档：裸写在正文里，文档机检门会把「档缺」判在本记录头上（本轮实测撞了一次）。门解析这一块时读围栏内文本。

```text
| 档 | 分拆方案 |
|---|---|
| thincoder-core/agent-tools/batch-closeout.mjs | — |
| thincoder-core/agent-tools/batch-skeleton.mjs | — |
| thincoder-core/agent-tools/batch-tier-gate.mjs | — |
```

读数（`doc_check` 的 `lines` 面，本轮实取；新档落盘后由 §5 复取）：

```text
  268  thincoder-core/agent-tools/batch-closeout.mjs
  401  thincoder-core/agent-tools/batch-skeleton.mjs
```

### 5 · 验收（三条落点分开判；「红侧」= 该判据的失败面怎么才算失败）

| # | 判据 | 量法 | 红侧 ∥ 改前读数 |
|---|---|---|---|
| A1 | 预评审 ② 项含 `A tier conclusion is not a conclusion without its reading` | `grep`（`literal: true`）⇒ ≥1 | 改前 0 命中 |
| A2 | 读者读 ② 项：先取读数 · 读数落 §2 · 无读数行 ⇒ 交付不算完成 · 括号那句只约束设计档——四件齐 ⇒ 过；缺一 ⇒ 不过 | 读者判 | 改前该项只有一句问句，且括号那句与读数要求读起来自相抵 |
| A3 | ② 项内不出现阈值数字（500 ∥ 800） | 读者读 ② 项 ⇒ 不出现 ⇒ 过 | 改前无 |
| B1 | 触发 = 改动面实测：① 只改文档、无越线档 ⇒ 过（§2 里连块都没有也照过） | `node --test docs/batches/2026-11-11-designer-tier-rule.test.mjs` ⇒ 八例全绿（红侧实跑读数住本记录 §5 实施记录第 3 节） | 改前该函数不存在（无门） |
| B2 | ② 改源码但都不越线 ⇒ 过（不解析 §2） | 同上 | 同上 |
| B3 | ③ 越线 + 方案点名目标 + 本批落步 ⇒ 过（门可过） | 同上 | 同上 |
| B4 | 收口两路（`close` ∥ `status` 写已收口）都过该臂 | 读者读 `assertCloseoutGates`：新臂自带 `mode === "normal"` 判式、位置在 ④ 之后，两路收口都经它 ⇒ 过 | 改前无该臂 |
| B5 | ④-1 越线、§2 清单里没有这一档的方案行 ⇒ 拒，点名「哪档 ∥ 多少行 ∥ 要写什么」 | 同 B1 那条命令 ⇒ 全绿 | 改前无该函数 |
| B6 | ④-2 越线、该行方案只有 `—` ⇒ 拒（视同未填） | 同上 | 同上 |
| B7 | ④-3 越线、方案 = 逃生口词「另起一批拆」⇒ 拒（点名不了目标） | 同上 | 同上 |
| B8 | ④-4 越线、方案点名了目标却把落地推给下一批（无 `实施轮` ∥ `§5`）⇒ 拒（缺本批落步） | 同上 | 同上 |
| B9 | ⑤ 本批删掉的源档（不在盘）⇒ 不拒——盘上没有长度可量 | 同上 | 同上 |
| C1 | `DOC-GRAPH.md` `同口径共六处` 零命中，`§3` 内「语义单源」≥1 | `grep`（`literal: true`） | 改前 1 命中 |
| C1b | 同档 `五处同轮落齐` ∥ `落齐条件：六处` ∥ `「逐字一致」是目标状态` 三串各零命中（计数与它们服务的维护法同轮退役） | 同上 | 改前各 1 命中 |
| C1c | `BATCH-RECORD.md` 收口门判序行含 `⑤`，且与 `batch-closeout.mjs` 臂数一致 | 读者读那行：五臂齐且编号同序 ⇒ 过 | 改前四臂 |
| C2 | `DOC-GRAPH.md` `500 不是收口面的判据` 零命中 | 同上 | 改前 1 命中 |
| C3 | `DOC-DISCIPLINE.md` §3.20 门序含第 ⑤ 臂 | 读者读该节门序表：五臂齐 ⇒ 过 | 改前四臂 |
| C4 | `advisor-design.md` `>500 lines →` 零命中，且含指向 `DOC-GRAPH.md` §3 的一句 ≥1 | `grep`（`literal: true`） | 改前 1 命中 |
| C5 | `persona-eng-designer.md` 执行句 `each with a **split plan** that lands inside this batch` ≥1，且指针句 ≥1 | `grep`（`literal: true`） | 执行句在、指针 0 |
| G | 本席本轮所写档 `doc_check(mode:"gate")` 首行 PASS | gate | 改后取 |

### 6 · 边界

- 不改 `doc-check` 的常量与量法（`fileSoftMax` ∥ `fileHardMax` 在 `DOC_CHECK_BUILTINS`；`countContentLines` 的实现单源 = `line-reads.mjs`，`index.mjs` 只再导出）——一字不动。
- 收口面**不判「清单有没有漏列」**：清单是设计自己写的，漏列由 §3 评审抽检（`advisor-design.md` 第 8 条的 Spot-check）；门不重算全仓代码。这条缺口写在这里，不留给发现。
- **不改两档 `AGENTS`**（工作区根 ∥ `thincoder-cli/AGENTS.md`）：它们那句说的是「拆分在本批内落」，本臂判的是「§2 的记录缺件」——**判的物件不同，不是同一机制的两处描述**，所以它们不在本批变更面里，也不欠一次对账。同理 `docs/core/standards/METHODOLOGY.md` 的 F3-1 写着「文件长度**只判两次**（设计时判**改代码前** 500：>500 必给分拆方案 ∥ 收口时判 800：>800 先拆再落；**中间一概不判**）」——它管的是**长度**判几次，本臂不判长度，故不改、也不冲突。
- 不设第三个判定时点。
- 不含 `persona-engineering.md`。

**固定行**：`§9 integration delta = zero rows: no business-observable result changed, so no row can break or be added`

依据：落点 B 的引用面 = 收口门族（`batch-closeout.mjs` 两路共调 `assertCloseoutGates`），无一处断言提示词措辞；`test/RTM.md` 无读这两档措辞的行。

### 7 · 线索与上抛（不进本批判据）

- **[上抛·待裁]** 两档 `AGENTS` 是否补一句「收口面另判 §2 记录缺件」——裁定人 = 父侧；条件 = 落点 C 落齐后对账；到期 = §3 评审开评前无裁定 ⇒ 按现边界不改。
- **[线索]** `persona-eng-designer.md` 预评审第 ③ 项行首多一格（其余四项 5 空格）：产品面，不在本席笔域，本批不动。
- **[线索]** §1 未单列「依赖」一项：本席读到的依赖 = `doc_check` 的 `lines` 面 ∥ 收口门族 ∥ 提示词装载面（`prompt-overlays.mjs` 两行登记）；不影响设计，供评审核对。



### 8 · 依据面（同类先例 ∥ 勘察证据 ∥ 三问 ∥ 集成面引文）

**同类先例**：

- **坐标**：`thincoder-core/agent-tools/batch-unit-test-gate.mjs`（收口前置门 · 单源叶档）。
- **对齐**：一个门判据一档、只 import `node:*`、不 import 判序档，判据可被单测直取，调用点只一处。`batch-tier-gate.mjs` 照这一形落。
- **偏离**：它吃 `abs`（批档绝对路径、自己读目录），本档吃 `(src, root, changed)`——判的是**已读进内存的 §2 文本**（收口面拿到的 `src` 就是写盘前全文），改动面由调用方交现成两面、不二次读盘。理由是红侧要零装配直取，与它「叶档可直取」的理由同一条，不是新理由。
- **另两条坐标**：`docs/core/design/DOC-GRAPH.md` §3 的「数值与语义各一个家」与「最近先例」条——本落点沿同一分家法（数值随 `DOC_CHECK_BUILTINS`、语义只在本节），不另立口径。

**勘察证据**（逐处：查了什么 ∥ 相关与否）：

- `docs/core/design/DOC-GRAPH.md` §3「行数档位口径」——**相关**，判据单源，C1 ∥ C2 改的就是它。
- `docs/core/design/DOC-DISCIPLINE.md` §3.20 行数读数块 ∥ §3.26 条目 Z——**相关**：收口门与写前门的分工在这里。
- `docs/core/standards/METHODOLOGY.md` F2-7 ∥ F3-1——**相关**：分支须有出处 · 长度只判两次。
- `thincoder-core/prompts/advisor-design.md` 第 8 条 ∥ `persona-eng-designer.md` 的预评审清单与受影响文件清单——**相关**，本批要改的两处。
- `test/RTM.md` 与 `test/rtm/*.md`——**相关**，判法见本段末条。
- 代码面：`batch-closeout.mjs` ∥ `batch-unit-test-gate.mjs` ∥ `doc-check/line-reads.mjs` ∥ `doc-check/paragraph.mjs`——**相关**。
- **库外**：依据 `docs/core/design/DOC-GRAPH.md`「行数阈值是本仓的工程内部约定，公开源里没有与之对应的规范可引。」本轮不新增外部断言。

**三问（新档名 ∥ `assertTierPlan`）**：

- `none found: thincoder-core/**`——`assertTierPlan` 全仓零命中；`agent-tools/` 下无 tier 门族（目录实读：现有门族 = `batch-gate.mjs` ∥ `batch-gate-hit.mjs` ∥ `batch-gate-judge.mjs` ∥ `batch-unit-test-gate.mjs`）。
- `existing but unusable: thincoder-core/agent-tools/batch-closeout.mjs · name: "assertCloseoutGates" · failed on: 入参契约`——它要 `{abs, cwd, agent, src, action, mode}`，判序里牵着台账与机检门的依赖；红侧要的是「一段 §2 文本 + 仓根 + 一份改动面」三级入参、零装配直取。
- 承运面照旧：判序仍由 `assertCloseoutGates` 一处调用，新档不自己找挂点。

**集成面引文（评审第 12 条）**：依据 `test/RTM.md`「一行 = 一个集成用例（5 列，列定义 = docs/core/design/TESTING.md §11.3）；单元测试档不进本表（内部回路、用毕即删），本表只登记仓根 `test/integration/**` 的集成用例。」

- 查过的形态：`test/RTM.md` 只有故事索引表（故事号 ∥ 标题 ∥ 属册 ∥ 三端覆盖），用例行住分册 `test/rtm/<族>.md`。
- `grep`（`literal`，域 = `test/rtm/*.md`）两档名零命中；`提示词` 唯一命中 = `tooling.md` 的装配节注，读的是工具表装配、不是这两档的措辞。
- 结论：没有一行断言这两档的措辞 ⇒ 本批三项落点都不改任何集成用例断言的结果，固定行成立。

### 9 · 设计面落盘（C1 ∥ C2 ∥ C3 ∥ C1c · 本席本轮）

四处照本节「落点 C」的逐字块落盘；C1 的排他句按 §3 第 7 条收窄，理由见下。

| # | 档 | 落点（改后首句） |
|---|---|---|
| C1 | `docs/core/design/DOC-GRAPH.md` §3 | 「**语义单源 = 本节**：判据口径的娘家在本节——阈值是多少、两个判定时点各判什么、过线判什么，以本节为准。」＋共存一段「**为什么把「六处同轮改」退役**」 |
| C2 | 同档 §3「②」 | 「**② 收口时判一次 = 800（收口检查判代码长短；另外判一条记录缺件）**」；未过线那条改述为「不因代码长短要求拆分」，并点名第 ⑤ 臂判记录缺件 |
| C3 | `docs/core/design/DOC-DISCIPLINE.md` §3.20 | 结构兜底段两条新 bullet：「收口判序的第五臂（档位臂）」∥「跳过集」（与 ①② 同组，③④ 照跑） |
| C1c | `docs/core/design/BATCH-RECORD.md` 门清单末行 | 判序接上「→ ⑤ 档位臂」；两处「保留门与写序」句的跳过集同轮加「档位臂」（§4.18-C 补关 ∥ §4.18-D supersede） |

**C1 排他句为何收窄**：原拟句「阈值、判定时点、过线判什么，只在本节写」与 `docs/core/standards/METHODOLOGY.md` F3-1 相抵——F3-1 判的是「文件长度**只判两次**（设计时判**改代码前** 500：>500 必给分拆方案 ∥ 收口时判 800：>800 先拆再落；**中间一概不判**）」（该档 F3-1 行本轮实读在位），而 F3-1 不在本批变更面（§6 边界：它管长度判几次，第 ⑤ 臂不判长度）。盘上并存「只在本节写」与 F3-1 的 500 ∥ 800，读者对不上会当其中一份过期，故改成断言娘家（以本节为准）而不排他。

**同轮扫除（落完 C1 后按同一条规则复查，两处）**：

- 同档 §3 勘察证据第三条原写「**已按本节目标形落齐**」并逐字引「>500 lines → …」，末句还指「同节「逐字一致」是目标状态…的唯一口径处」——所指的两样本轮退役，整条改成「执行句在那一档，判据口径以本节为准」。
- `docs/core/design/DOC-DISCIPLINE.md` §3.20 剥除面依据行原引 `anchors.mjs`「const OPERAND_STRIP_RES = CANON_OPERANDS.map((name) => new RegExp(」——该实现已不在该档，基线 gate 因此判 `引缺` 一条（改动前实测）；改成指向 `thincoder-core/doc-check/doc-names.mjs` 并引实存那句「for (const re of OPERAND_STRIP_RES) out = out.replace(re, "")」。

**读数（本轮实取 · 量法 = `node` 行扫描 `includes`）**：

```text
DOC-GRAPH.md       同口径共六处=0 · 五处同轮落齐=0 · 落齐条件=0 · 「逐字一致」是目标状态=0
                   500 不是收口面的判据=0 · 语义单源=1 · 判据口径的娘家在本节=1
BATCH-RECORD.md    ⑤ 档位臂=1
DOC-DISCIPLINE.md  收口判序的第五臂（档位臂）=1
doc_check(mode:"gate", docs:[三档])  首行 = DOC-CHECK GATE: PASS
```

**[已裁 · 改引不删节] 跨档残句一处（父侧 2026-11-11 裁定：改引，不删节）**：`docs/core/design/DOC-GRAPH.md` §3「域含英文面」的面例原引 `advisor-design.md` 第 8 条那一句；C4 落盘后该句不再报数，例随之落空。按裁定换成 `thincoder-cli/AGENTS.md` 的「File size (source and unit-test files only)」条——英文面、两个数都在、本批不动它；节标题与结论一字未动，换的只是举证。

改前（三 bullet）∥ 改后（两 bullet）：

```text
- 面例 = `thincoder-core/prompts/advisor-design.md` 第 8 条判据「Affected-file tier check」的那一句。
- 该句以「Judged at two points, nowhere else」起头，接着写「the design round judges the 500 line, the closeout check judges the 800 line」——报的是两个数。
- 腿一按名抓不到它（英文面上一个中文别名也没有），这一句只有腿二看见。
                                  ↓
- 面例（英文面、两个数都在）= `thincoder-cli/AGENTS.md` 的「File size (source and unit-test files only)」条：「above 500 lines ⇒ the design must carry a split plan and the split lands inside this batch (no deferral to another batch)」∥「the check judges 800 lines: above ⇒ split before landing」。
- 腿一按名抓不到这种句子（一个中文别名也没有）：射程内报了数的英文面档位句，只有腿二看得见。`AGENTS` 两档不在射程内（射程 = 下条「已查档」），故这里拿它当形例，不当候选。
```

**引文在盘核实**（`node` 子串扫描，域 = `thincoder-cli/AGENTS.md`）：两句各 `IN-DISK`、各 1 处；条目标题「**File size (source and unit-test files only)**: judged exactly twice, nowhere else.」在该档命中 1 处（另两档 `AGENTS` 命中 0）。工作区根那一份与本档该条逐字相同（`node` 整行 `===` 比较 = true，两行各 942 字符）。

**超出裁定的两处增写（在此点名，供父侧核）**：

- 原第三条「这一句只有腿二看见」对该例不成立——`AGENTS` 不在两条腿的射程内（检索域 = `docs/` ∥ `thincoder-core/prompts/` ∥ `thincoder-core/tool-docs/`），故改写成「射程内报了数的英文面档位句，只有腿二看得见」，并加一句点明该例是形例、不是候选。不改这一句，盘上就多一处假话。
- 引的是仓内那一档，不是工作区根那份 AGENTS 档：后者在本仓之外、未经 `index.publicRepos` 声明，指针会被判 `档缺`；两份原句逐字相同（本轮 `node` 逐行比对一致），引仓内那份不损内容。

- **[已修 · 2026-11-11 本席同轮]** 落点 A（3）四支表在实施轮改判后已按三参新判据回写为「判据三行，出处 = 红侧实跑」＋红侧八例（见 §2 落点 B (3) 现文）；`assertTierPlan(src, root)` 两参签名在 §2 两处（落点 B (2) · 变更面）同轮换 `assertTierPlan(src, root, changed)`。

**[线索 · 不属本批]** `AGENTS` 两档写着档位判据、却不在 §3 两条腿的射程内——要不要把 `AGENTS.md` 纳入射程是语义改动，本席不动，交父侧裁。

## §3 设计评审（评审子代理）
**状态行**：评审通过



### 轮次 1（评审子代理）

### 评审读数（射程 = 批档 §1/§2 + `persona-eng-designer.md` + `advisor-design.md`；引用面实读盘面）

| # | 严重度 | 状态 | 依据 |
|---|---|---|---|
| 1 | 🔴 | 未处置 | §2 落点 B（3）判据四支表无「依据」列；「清单里的档不在盘」与「§2 无该块 ∥ 行不成两列」两支既无观测亦无复现路径（对照另两支有出处者 = §1「拆分放另一批」·「写成「过 500」」） |
| 2 | 🟡 | 未处置 | §2 落点 B 红侧三支 B1/B2/B3 只覆前两支；「档不在盘」「无该块 ∥ 行不成两列」无用例 |
| 3 | 🟡 | 未处置 | §2「受影响文件（机读清单）」两行 vs §4 变更面三源档 + 一单测档；`batch-tier-gate.mjs` ∥ `...test.mjs` 无档位结论（`persona-eng-designer.md`「source/test files + one tier-conclusion line」） |
| 4 | 🟡 | 未处置 | §2 落点 B（2）「`§3` 状态词臂之后加一臂」 vs C3 与验收 C3「第 ⑤ 臂」；`batch-closeout.mjs` 头注序 = ① 链门 → ② §3 状态词臂 → ③ 批内单测档门 → ④ 文档机检门 |
| 5 | 🟡 | 未处置 | §2 落点 B（2）「`repair` ∥ `supersede` 两路跳过」 vs `batch-closeout.mjs`「`repair` ∥ `supersede` 两条都只跳过 ① 内容门与 ② §3 pass 臂，③④ 照跑」——跳集不变式未进变更面 |
| 6 | 🟡 | 未处置 | §2 落点 B（1）逃生口词「`no split` ∥「另起一批」∥「另批」」为子串黑名单；「留到下批」·「下批拆」不命中 |
| 7 | 🟡 | 未处置 | §2 C1「两档 `AGENTS` 按本节对账」 vs §6「不改两档 `AGENTS`」；两档 AGENTS 与 `METHODOLOGY.md` F2 节「文件长度只判两次」均不在变更面 |
| 8 | 🟡 | 未处置 | §2 落点 A 改后文（读数行进 §2） vs 同项原文「(no counts or deltas)」 vs F-R24a「行数与预计增量不写进任何状态档」——数字承载面未指名 |
| 9 | 🟡 | 未处置 | §2 无「同类先例」行（F2-6）；新档族与单测落点 `docs/batches/*.test.mjs` 无先例坐标（该目录现无 `.mjs`） |
| 10 | 🟡 | 未处置 | §2 无「勘察证据」行（查过哪些公开源档 ∥ 有无相关） |
| 11 | 🟡 | 未处置 | §2 对 `batch-tier-gate.mjs` ∥ `assertTierPlan` 无 existing ∥ none found ∥ existing but unusable 三问回答（`assertCloseoutGates` 已是收口门族载体） |
| 12 | 🟡 | 未处置 | §2「固定行」依据「`test/RTM.md` 无读这两档措辞的行」无逐字引文，读者无法核 |
| 13 | 🟡 | 未处置 | §1「（第 45–46 行）」·「`persona-eng-designer.md` 第 175 行」——落点 A 在该行上方插两行，该坐标当批即失效 |
| 14 | 🟡 | 未处置 | §2 C1/C2/C3 无逐字改后文（A / C4 / C5 有）；C4 · C5 两行被「为什么这三处不在设计轮落」段落截在表外 |
| 15 | 🔵 | 未处置 | §2 C4「三行换两行」 vs 其改后文块仅一行 |

已核为真（不构成 finding）：`doc_check` `lines` 读数 268 ∥ 401 与 §2 分毫不差；`docs/core/design/DOC-GRAPH.md` 节「行数档位口径」在盘且两处逐字依据命中；`test/RTM.md` 在盘；`assertCloseoutGates` 与 `mode` 三值闭集在盘。

VERDICT: changes-required
计数：🔴 1 · 🟡 13 · 🔵 1

### 轮次 2（评审子代理）

| # | 原# | 严重度 | 状态 | 依据 |
|---|---|---|---|---|
| 1 | 1 | — | 已修 | §2 落点 B（3）表已带「出处（观测 ∥ 可复现的命令）」列，四格全填：第 3 行「依据 `docs/core/design/DOC-DISCIPLINE.md`「删了拒收口，不删也拒收口。」」（本轮回原文核对在盘）∥ 第 4 行「复现：把一段无该块的 §2 文本喂 `assertTierPlan` ⇒ 抛」 |
| 2 | 2 | — | 已修 | §2「**红侧（必交，五支）**」①–⑤ 四支拒 ∥ 一支过；§5 B1–B7 逐支各一量法 |
| 3 | 3 | — | 已修 | §2「**受影响文件（机读清单）**」三行，含新档 `batch-tier-gate.mjs`；「**分层结论（逐档，四档）**」第 3 条给单测档结论并写明不进清单的理由 |
| 4 | 4 | — | 已修 | §2 落点 B（2）「末尾、`④ 文档机检门` 之后加一臂调用它…**第 ⑤ 臂**」；C3 改后文「接在「④ 文档机检门」之后」 |
| 5 | 5 | — | 已修 | §2「**跳过集随之从 {①②} 变成 {①②⑤}**」；§4 变更面「档头跳过集那句改成「只跳过 ①②⑤，③④ 照跑」」 |
| 6 | 6 | — | 已修 | §2 落点 B（1）「判法是**正向形**，不是词表」+ 闭集「`实施轮` ∥ `§5`」 |
| 7 | 7 | 🟡 | 未修（臂∥两点之冲突已接受；C1 排他句未处置） | C1 改后文「**语义单源 = 本节**：阈值、判定时点、过线判什么，只在本节写」 vs §6 边界自引 F3-1「文件长度**只判两次**（设计时判**改代码前** 500：>500 必给分拆方案 ∥ 收口时判 800：>800 先拆再落；**中间一概不判**）」——后者仍写阈值与判定时点，又被声明不进变更面 |
| 8 | 8 | — | 已修 | §2 落点 A 改后文「the record is the one-off carrier a reading may live in, and it leaves with the batch」 |
| 9 | 9 | — | 已修 | §2 §8「**同类先例**」= 坐标 ∥ 对齐 ∥ 偏离 +「**另两条坐标**」 |
| 10 | 10 | — | 已修 | §2 §8「**勘察证据**（逐处：查了什么 ∥ 相关与否）」+「**库外**」 |
| 11 | 11 | — | 已修 | §2 §8「**三问（新档名 ∥ `assertTierPlan`）**」= `none found` ∥ `existing but unusable … failed on: 入参契约`；本轮 grep 复核 `assertTierPlan` 零命中 |
| 12 | 12 | — | 已修 | §2 §8「**集成面引文**」；`test/RTM.md` 逐字「一行 = 一个集成用例（5 列，列定义 = docs/core/design/TESTING.md §11.3）」本轮在盘命中 |
| 13 | 13 | 🟡 | 未修（部分） | §1 散文已改指条目名（「设计评审判据第 8 条」·「九项交付物第 3 项」），但现场围栏首行仍以「该档名 + 冒号 + 行号」的坐标形式引同一句「>500 lines → the design must give a split plan (no discretion),」——本批 C4 即改写该三行，坐标当批失效 |
| 14 | 14 | — | 已修 | C1 ∥ C2 ∥ C3 各有「改为后文（逐字）」块；C1–C5 五行连续成表，截断段已去 |
| 15 | 15 | 🔵 | 未修 | C4 标题「**C4 改后文（逐字，两行）**」 vs §4 变更面「C4：三行换一行」 |
| N1 | (新) | 🟡 | 新 | §2 落点 B（3）第 2 行出处「§1 逐字记着「另起一批拆」」——§1 无此串（§1 记的是「拆分放另一批」；「另起一批」的出处是 `docs/core/design/DOC-GRAPH.md` 的逃生口清单） |
| N2 | (新) | 🟡 | 新 | §2 状态行「修正轮落完 §3 全部 15 条」 vs 第 13 ∥ 15 条未落（第 13 条住 §1，非设计席笔域） |
| N3 | (新) | 🔵 | 新 | §2 机读清单「—（新建档；落盘长度由 §5 取，未越设计时线则照写 —）」既非 `—` 亦非正向形，四支判据未定义该格 |

已核为真（不构成 finding）：`doc_check` lines 读数 268 ∥ 401 与 §2 分毫不差；`DOC-GRAPH.md` §3 逐字依据「判它落盘时的长度——它是本批写出来的那一档」在盘；`doc-check/index.mjs` 逐字依据「量法的家 = `./line-reads.mjs` 的 `countContentLines`」在盘；`agent-tools/` 门族实读与 §8 三问所列一致，新档尚未上盘（与设计所述一致）。

计数：🔴 0 · 🟡 4 · 🔵 2
VERDICT: pass

### 轮次 3（评审子代理）

> 状态行重置：第 3 轮打回（changes-required）· 上一轮状态行 = 评审通过 → 进行中 · 2026-11-11

射程 = 实施面（`batch-tier-gate.mjs` ∥ `batch-closeout.mjs` ∥ `batch-skeleton.mjs` ∥ 两档提示词 ∥ 本批单测档），逐条复核 §5 A1–A3 · B1–B7 · C4 · C5 与代码正确性。

| # | 严重度 | 状态 | 依据 |
|---|---|---|---|
| 1 | 🔴 | 新 | `batchSkeleton` 把整块机读清单写进模板 §2（`"**受影响文件（机读清单）**"` ∥ `| thincoder-core/agent-tools/batch-tier-gate.mjs | — |`）；同档 `EXCLUDED_LINE_RE` = `^#{1,6}\s|^\s*\*\*状态行\*\*[：:]|^<§\d+ 模板占位[：:]|^>\s*不适用` 不覆盖该块任何一行 ⇒ 模板原样档 `sectionContentState(src, 2)` 判 `"content"`（① 链门失效）；示例行在盘且 209 < `fileSoftMax` ⇒ `assertTierPlan` 判无缺件，红侧第 ⑤ 支「§2 无该块」（B7）对工具建出的档不可达 |
| 2 | 🟡 | 新 | 门不判后缀：`contentLinesOf` 对清单任一行取长度判档，与依据 `advisor-design.md`「documents are exempt** from that tier judgment」及 `line-reads.mjs`「SIZE_TIER_EXTS = Object.freeze([".mjs", ".cjs", ".js"])」相抵 |
| 3 | 🟡 | 新 | `firstTableAfter` 注释「取它**之后的第一张表**」= 同块头下第二张表的行静默丢弃；反向，块头后引用夹带真路径的示例表会被当记录判。设计四支未定义「多表 ∥ 引用表」 |
| 4 | 🟡 | 新 | 记录 §2「本轮实取；新档落盘后由 §5 复取」的读数 268 ∥ 401 与交付态不符（复量 = 288 ∥ 415），§5 仍空 ⇒ 读者按记录核不到「按交付态判过」 |
| 5 | 🟡 | 新 | `advisor-design.md` 第 8 条新句「This criterion restates none of it and adds no judgment point of its own.」与同条「a file ≤500 lines containing a 300+ line single function is still non-compliant」并存；C4 验收已过，不阻断 |
| 6 | 🟡 | 新 | 协调项：`docs/batches/2026-11-05-node-floor-22-13.md` 状态行「🔄 进行中（…）」且全文无该块 ⇒ ⑤ 臂届时拒其收口；§2 未写回填口径 |
| 7 | 🔵 | 新 | `const abs = resolve(root, rel)` 未限 root 内：第一列写成绝对路径 ∥ 带 `..` 可量到仓外档，而拒因集只覆盖「量不到」 |

已核为真（不构成 finding），逐条：

- A1 ∥ A3 ∥ C4 ∥ C5 四条字面读数全中：`A tier conclusion is not a conclusion without its reading` 在档 · ② 项无 500/800 · `>500 lines →` 0 命中 · 执行句 + 指针句各 1。
- 第 ⑤ 臂位次在 ④ 之后，自带 `mode === "normal"` 判式；`tierRootOf` 与 `batch-gate.mjs` 的 `owningProject(selfAbs, base) ?? batchProjectRoot(base)` 同式。
- 三档源档读数 288 ∥ 415 ∥ 209 全在设计时线内。
- 红侧六例（B1 ∥ B2 ∥ B3 ∥ B5 ∥ B6 ∥ B7）逐支对应代码路径，B3 的「门可过」成立。

VERDICT: changes-required
计数：🔴 1 · 🟡 5 · 🔵 1

### 轮次 4（评审子代理）

射程 = 实施面（`batch-tier-gate.mjs` ∥ `batch-closeout.mjs` ∥ `batch-skeleton.mjs` ∥ `batch-gate.mjs` ∥ 两档提示词 ∥ 本批单测档）。本轮实测：档位臂已按 18:4x 改判重写（触发物 = 改动面实测长度，`(src, root, changed)`），故前轮 2 ∥ 6 ∥ 7 三支随触发面更替而消解；前轮 1 的第二半（⑤ 臂靠 §2 块启动）同消解，第一半（§2 判空）仍存。

| # | 严重度 | 状态 | 依据 |
|---|---|---|---|
| 1 | 🔴 | 未修（部分） | `batchSkeleton` 仍写 `"**受影响文件（机读清单）**"` 与表行；同档 `EXCLUDED_LINE_RE` = `^#{1,6}\s\|^\s*\*\*状态行\*\*[：:]\|^<§\d+ 模板占位[：:]\|^>\s*不适用` 不覆盖它；`sectionContentState` 的 `return lines.some(...) ? "content" : "empty"` ⇒ 模板原样档 §2 判 `content`，`assertCloseoutChainComplete` 的 §2 一支对工具建出的档恒失效 |
| 2 | 🟡 | 已修 | 触发面先过 `isCodePath`（`const CODE_EXTS = Object.freeze([".mjs", ".cjs", ".js"])`）⇒ `.md` 不再被量、不再被索分拆方案 |
| 3 | 🟡 | 已修 | 读不懂的行不再静默放行：`if (cells.length !== 2) return` 的落点是 `const gap = row === null ? "§2 清单里没有这一档的方案行" : planGapOf(row.plan)` ⇒ 方向已翻成 fail-closed（残余 = 同块头第二张表被假拒，拒文准确、可改） |
| 4 | 🟡 | 未修 | 记录 §2「本轮实取；新档落盘后由 §5 复取」记 `268  thincoder-core/agent-tools/batch-closeout.mjs` ∥ `401  thincoder-core/agent-tools/batch-skeleton.mjs`；本轮 lines 面复量 = 307 ∥ 415（新档 242），且 `## §5 实施记录（eng-coder）` 下无一行 ⇒ 复取无落点 |
| 5 | 🟡 | 未修 | `advisor-design.md` 第 8 条「This criterion restates none of it and adds no judgment point of its own.」与同条「a file ≤500 lines containing a 300+ line single function is still non-compliant」并存 |
| 6 | 🟡 | 已修 | 触发面改判后不再按块启动：`if (over.length === 0) return` ⇒ 无该块的旧在飞档不会因缺块被拒，协调项消失 |
| 7 | 🔵 | 已修 | `for (const p of changed)` 的条目只来自触达账 ∥ 提交 diff；§2 第一列只经 `normPath` 参与尾巴匹配（从不落盘解析）⇒ 写手文本不再能指到仓外 |
| N1 | 🟡 | 新 | `contentLinesOf` 的 `} catch {` 与 `if (!statSync(abs).isFile()) return null` 同支：读错误（无权限 / 占用）被读成「没有这一档」⇒ 跳过 ⇒ 放行，与 ④ 门「在盘但读不到 ⇒ ERROR」口径不一 |
| N2 | 🟡 | 新 | 记录 §2 落点 B（2）/变更面仍写 `assertTierPlan(src, root)`（解析 §2 清单逐档量），交付实现为 `export function assertTierPlan(src, root, changed)`（触发物 = 改动面）——改判未回写 |

VERDICT: changes-required
计数：🔴 1 · 🟡 5 · 🔵 1

### 轮次 5（评审子代理）

| # | Orig# | 严重度 | 状态 | 证据（指针） |
|---|-------|--------|------|--------------|
| 1 | 1 | 🔴 | Fixed | `batch-skeleton.mjs` §2 模板：整块收进一条占位行 —— 「示例行 = \| thincoder-core/agent-tools/batch-tier-gate.mjs \| — \|」落在 `<§2 模板占位：机读清单 = …>` 行内，而 `EXCLUDED_LINE_RE` 含 `^<§\d+ 模板占位[：:]` ⇒ `sectionContentState` 的 `return lines.some(...) ? "content" : "empty"` 对新建档 §2 判 `empty`（① 链门 §2 一支复原）；`tierRowsOf` 的 `BLOCK_HEAD_RE` 行首锚 + `TABLE_ROW_RE` 首竖线锚都不命中该行 ⇒ 越线档落进「§2 清单里没有这一档的方案行」照拒（⑤ 臂不再被模板家具喂绿） |
| 2 | 2 | 🟡 | Fixed | `CODE_EXTS` + `if (!isCodePath(p)) continue` |
| 3 | 3 | 🟡 | Fixed | `if (cells.length !== 2) return` + `const gap = row === null ? "§2 清单里没有这一档的方案行" : planGapOf(row.plan)`（失败方向翻成 fail-closed） |
| 4 | 4 | 🟡 | Unfixed | 记录 §2 仍「本轮实取；新档落盘后由 §5 复取」并记 `268  thincoder-core/agent-tools/batch-closeout.mjs` ∥ `401  thincoder-core/agent-tools/batch-skeleton.mjs`；`## §5 实施记录（eng-coder）` 下无一行 |
| 5 | 5 | 🟡 | Unfixed | `advisor-design.md`「This criterion restates none of it and adds no judgment point of its own.」与「a file ≤500 lines containing a 300+ line single function is still non-compliant」并存 |
| 6 | 6 | 🟡 | Fixed | `if (over.length === 0) return` |
| 7 | 7 | 🔵 | Fixed | `for (const p of changed) {` —— 落盘解析只取机器面，§2 第一列仅经 `normPath` 参与尾巴匹配 |

VERDICT: pass

计数：🔴 0 · 🟡 2（未修，非阻断）· 🔵 0；已修 5（#1 ∥ #2 ∥ #3 ∥ #6 ∥ #7）。

### 轮次 6（评审子代理）

| # | 严重度 | 状态 | 证据 |
|---|--------|------|------|
| 1 | — | Fixed（前轮遗留项） | AC-2 符号族（`STOCK_LINE` ∥ `stockHits`）：本轮对 thincoder-core 全域 grep 零命中——扫净已落地 |
| 2 | — | Fixed（前轮遗留项） | 「缺机读清单」∥「无该块」两串：全域 grep 仅 agent/setup.mjs 注释巧合子串「子代理可有可无该块：四块里一个都没推 ⇒ 同样不进。」（spawn 块语境，非门判据）；`batch-tier-gate.mjs` 头注「**「§2 缺块」不是拒因**：块可以照写（模板要用），但门不靠它启动」与 `assertTierPlan` 的「② 没有越线档 ⇒ 过：不解析 §2，也不看有没有那块。」——触发物 = 实测长度，判据按此落地；`batch-skeleton.mjs` 模板占位行注释「**只在确有越线档时才读这一块**，缺它不算拒因」同口径 |
| 3 | — | 声明面外·本轮未重验 | 前轮其余未决观察（doc-check `sectionOnDisk` 注释/行为 🟡、`domainTables` 双排序 🔵、doc-names 占位豁免 🔵、`diffHunksOf` 🔵、batch-gate zoneTablesOf/环引两问）不在本轮声明面（batch-tier-gate / batch-closeout / batch-skeleton / persona-eng-designer / advisor-design）内——按边界规则未重验、不计入 verdict，随表移交父席 |

计数：🔴 0 · 🟡 0（声明面内）· 🔵 0。

VERDICT: pass

## §4 用户批准（主 agent）
## §5 实施记录（eng-coder）

### 1 · 交付面（六档 + 一处出清单改动）

| 档 | 改什么 |
|---|---|
| `thincoder-core/agent-tools/batch-tier-gate.mjs`（新档） | `assertTierPlan(src, root, changed)`：触发物 = 改动面里实测越 `fileSoftMax` 的源/单测档；无越线档直接 return（不解析 §2）；有越线档才去 §2 找它的正向形方案；缺 ⇒ 拒，点名「哪档 / 多少行 / 缺什么 / 要写什么」 |
| `thincoder-core/agent-tools/batch-closeout.mjs` | 收口判序第 ⑤ 臂（在 ④ 文档机检门之后，自带 `mode === "normal"` 判式，`repair` ∥ `supersede` 跳过）；`changedSurface` = 触达账 ∪ 提交 diff（绝对路径）；档头注与 jsdoc 的跳过集同轮改成「只跳过 ①②⑤，③④ 照跑」 |
| `thincoder-core/agent-tools/batch-skeleton.mjs` | §2 模板补机读清单的**形**（收进一条 `<§2 模板占位：…>` 行，不落成真表；示例档为在盘的真档 `thincoder-core/agent-tools/batch-tier-gate.mjs`） |
| `thincoder-core/prompts/persona-eng-designer.md` | 预评审 ② 项补「先取读数」（落点 A 逐字块）+ 九项交付物第 3 项后加指针句（C5） |
| `thincoder-core/prompts/advisor-design.md` | 第 8 条三行换一行：阈值与「判两点」的数值全撤，只留指针（C4） |
| `docs/batches/2026-11-11-designer-tier-rule.test.mjs` | 红侧八例（收口删除） |

交付态读数（`doc_check` 的 `lines` 面，本轮实取）：

```text
  242  thincoder-core/agent-tools/batch-tier-gate.mjs
  307  thincoder-core/agent-tools/batch-closeout.mjs
  408  thincoder-core/agent-tools/batch-skeleton.mjs
  323  thincoder-core/agent-tools/batch-gate.mjs
  202  thincoder-core/prompts/persona-eng-designer.md
  170  thincoder-core/prompts/advisor-design.md
   97  docs/batches/2026-11-11-designer-tier-rule.test.mjs
```

### 2 · 判据（父侧 2026-11-11 18:39 / 18:4x 两度改判后的最终形）

```text
触发 = 本批改动面里的源码/单测档，用 countContentLines 实测 > fileSoftMax(500)
  ├ 没有越线档              ⇒ 过（不判，不解析 §2）
  ├ 有越线档、§2 有它的方案   ⇒ 过
  └ 有越线档、§2 没有它的方案 ⇒ 拒，点名档 + 行数 + 要写什么
```

「§2 缺块」不是拒因；「方案」仍按正向形认（点名带目录段的档 + 本批落步 `实施轮` ∥ `§5`），只在确实越线之后才查。

### 3 · 红侧实跑（四支 + 逃生口两支 + 删档一支）

`node --test docs/batches/2026-11-11-designer-tier-rule.test.mjs`（仓库根）：

```text
✔ ① 只改文档、无越线档 ⇒ 过（§2 里连块都没有也照过）
✔ ② 改源码但都不越线 ⇒ 过
✔ ③ 越线 + 方案点名目标 + 本批落步 ⇒ 过（门会放行）
✔ ④-1 越线、§2 清单里没有这一档 ⇒ 拒，点名「哪档 / 多少行 / 要写什么」
✔ ④-2 越线、该行方案只有 — ⇒ 拒（视同未填）
✔ ④-3 越线、方案 = 「另起一批拆」⇒ 拒（点名不了目标）
✔ ④-4 越线、方案点名了目标却把落地推给下一批 ⇒ 拒（缺本批落步）
✔ ⑤ 本批删掉的源档（不在盘）⇒ 不拒——盘上没有长度可量
ℹ tests 8 · pass 8 · fail 0
```

本批真档 × 真改动面（八档，全部 < 500）走势：`assertTierPlan` 早退放行；`node scripts/check-syntax.mjs` = `126 file(s) OK`；`doc_check(mode:"gate", docs:[两档提示词])` 首行 `DOC-CHECK GATE: PASS`。

### 4 · 出清单改动（一处，报明理由）

`thincoder-core/agent-tools/batch-gate.mjs`：`function baseShaOf` 改成 `export function baseShaOf`。理由 = 「批起 sha」的取法（§1 记入行 + `sectionHeaderRe(1)`）单源就在那一句，收口面要算提交 diff 就必须取它；复制一份解析就是第二份必漂的字面。判定行为一字未动。

### 5 · 轮次与终态

| 轮 | 面 | 读数 | 处置 |
|---|---|---|---|
| 内审 1 | explore 审计（交付面 vs §2） | DIVERGENCE 3：新档 import 面超出「只 import `node:*`」· 模板重述阈值 · ⑤ 多一支零数据行 | ① 报明（§2 自相张紧：既要求 `countContentLines` 又要求只 import `node:*`）；② 同轮改掉（模板不再写 `500`）；③ 归入改判后消失的支 |
| 代码评审 1 | advisor（code，实施面全量） | 🔴1 · 🟡5 · 🔵1 | 2 条随改判消解，其余进待办；🔴 保留 |
| 代码评审 2 | advisor（code，改判后复核） | 🔴1 · 🟡4 | 🔴 = 模板落成真表使 §2 建档即判「有内容」，① 链门对工具建的档失效 |
| 修正轮 | 本席 | — | 模板改「形写进占位行、不落真表」⇒ §2 判 `empty` 复原、⑤ 臂不再被模板家具喂绿；同轮补「删档不拒」用例 |
| 代码评审 3 | advisor（code，只核修复主张） | 🔴0 | 上一轮 🔴 逐条验为 Fixed；#4 ∥ #5 为可选 🟡，已申报 |

**终态：clean**（🔴 0；余项见第 6 节，均非阻断）。

### 6 · 未落 / 待路由（不在本席笔域）

- **已回写（#18）**：`DOC-DISCIPLINE.md` §3.20 ∥ `DOC-GRAPH.md` §3 ② 现文已是 A 案口径，tier §2 落点带「已修」注。
- **可选未修（评审列明、非阻断）**：`advisor-design.md` 第 8 条仍留着 `a file ≤500 lines …`（与同条「restates none of it」并置）；`contentLinesOf` 把「读不到」与「不在盘」并成同一支（在盘但读不到的越线档会被读成「没有这一档」）。
- **线索**：`AGENTS` 两档写着档位判据、不在 `DOC-GRAPH.md` §3 两条腿的射程内（前轮已报，本批不动）。

## §6 验证与收口（父代理）
