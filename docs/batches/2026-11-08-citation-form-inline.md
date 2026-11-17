# 2026-11-08 · citation-form-inline
> 六段，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 每段只有一个作者：作者的段可 `append` 加内容、可就地改（`edit`）；非作者一概拒。
> 编制：主 agent · 2026-11-08 · 来源 = 用户 2026-11-08 23:03「A line number is never the citation 这句话后面有没有直接告诉你们正确的形态？」→ 23:06「能不能更紧密点，直接把正确型接在…后面，然后整体一起说 why，别让这两句分开？」→ 23:07「甲」。
> 台账 = #2214（PROMPT-SYSTEM · 归批）。前情 = docs/batches/2026-11-08-provider-entry-sanitize.md（已收口 2026-11-08）。
## §1 讨论（主 agent）
**状态行**：已收口（八档十一处 · 评审三轮后通过 · 父侧复核 11=11 · 门 PASS）
<§1 模板占位：本批条目 / 关键判据 / 授权口径>

### 缺口（用户实读，父侧逐字复核）

**`thincoder-core/prompts/common.md` 第 106–107 行逐字**：

```
**A line number is never the citation**: it records a position, not a fact about the text. 
Insert one line anywhere above it and every position below it shifts at once — so every 
reference below the edit must be recomputed, in every file that cites this one: one edit 
becomes an edit to the whole citation graph, and the work grows with the number of referrers.
```

**后面跟的全是 why 与代价，没有一句说「那该写成什么」。**

**正确形态散在三处**（父侧逐条核过）：

| 位置 | 覆盖了什么 |
|---|---|
| `common.md` 的 D11 | `cite as doc:section` —— **只覆盖「引规则」** |
| `discipline-engineering.md` 的 D4 | 代码坐标 ⇒ **符号名**（函数 ∥ 常量 ∥ 导出名） |
| `discipline-engineering.md` 的 D10 | `What to write instead`: the rule&apos;s own sentence, or the section / symbol it lives in |

**⇒ 设计档那一层是全的**（`docs/core/design/DOC-DISCIPLINE.md` 写着「指某条规则 ⇒ 节名 + 逐字引文；指代码里的东西 ⇒ 符号名」）。**缺的是提示词层——摘录时只留下「不许」，把「该写什么」漏在原地。**

**而模型只读提示词。**

### 用户要的形

**正确形态紧跟在那句话后面，why 整体跟在后面，两句不许分家。**用户原话（23:06）：「能不能更紧密点，直接把正确型接在 A line number is never the citation 后面，然后整体一起说 why，别让这两句分开？」

**父侧拟的替换文本（设计席可精修，三件必须都在）**：

```
**A line number is never the citation — cite the item by its own name**: a document section 
with its exact words, or a symbol (function / constant / export). A number records a position, 
not a fact: insert one line anywhere above it and every position below it shifts at once, so 
every reference below the edit must be recomputed, in every file that cites this one — one 
edit becomes an edit to the whole citation graph, and the work grows with the number of 
referrers. Reading the line and then citing it is not a way out: the number still dies the 
moment anything is inserted above it, while the name survives.
```

**三件**：① 正确形态进主句本身（破折号后就是替代品）；② why 紧跟同段，中间无断点；③ 末句封住「核过了就可以照引」这条歧义路径。

### 为什么③必须写

**今天父侧就走了这条路径**：核过行号、确认内容对，然后照样按行号写引用。**当时没有条文可依，于是自己发明了一个中间态。** 没有条文的岔路口，人一定会自己造一条。

### 边界

**本批覆盖八档**（原定三档；23:24 用户裁「甲」后扩到八档——下表三档的明细见本小节，另五档见本档末「### 范围扩大（用户 23:24 裁「甲」）」）：

| 档 | 为什么在本批 |
|---|---|
| `thincoder-core/prompts/common.md` | 用户点的那一句 |
| `thincoder-core/prompts/consult-base.md` | **承载禁令的那一项自身不带替代品**——读者只读该项时拿不到正向写法 |
| `thincoder-core/prompts/persona-plan.md` | 同上。**该档缺得轻一半**（上一项已有路径 ∥ 逐字引文 ∥ 符号名），但禁令项本身仍只有「不许」 |

**立论修正（评审 #4 第 2 条指出父侧原写法不成立）**：父侧原写「整档没有三形」——**盘面反证**：`consult-base.md` 禁令的上一句就写着 `what you read (the file path plus the exact words, quoted as they stand)`；`persona-plan.md` 的上一项三形齐备。**⇒ 立论改为「禁令项自身必须带替代品」，不再说「整档没有」。**

**不在本批**：四份 `advisor-*.md` —— **按上面这条新立论，它们同样缺「禁令项自身带替代品」**；不在本批是**范围决定（留待用户另裁）**，不是它们满足判据。**这一句必须留着，否则下一个人会以为四档合规。** **不改 `discipline-engineering.md`**（D4 / D10 是详述面，单源在那）；**不改 `docs/core/design/DOC-DISCIPLINE.md`**（三形在盘，且「强制 · 无例外」已封掉「核过再照引」）。

### 范围扩大（用户 23:24 裁「甲」）

**父侧扫过提示词面 17 档、78 处禁令句，又找出两类「只禁不给形」**，用户裁定**并进本批**，不另开：

| 档 | 现句（父侧实读） | 正确形态在哪 |
|---|---|---|
| `thincoder-core/prompts/advisor-design.md` | `**Never cite a line number** — it records a position, so one line inserted above **shifts every position below it**` | **同档条目 13 已是同句连写**：`a citation into code or docs identifies its target by a stable name, never by a line number` |
| `advisor-round1.md` ∥ `advisor-round2.md` ∥ `advisor-round3.md` | 同上，一字不差 | 同档 `The evidence cell is a pointer, not a copy: a section number, a symbol name, or the exact words of the line` |
| `thincoder-core/prompts/persona-eng-designer.md` | `**Do not fire reviews yourself**: a self-fired review spends the main agent's / user's attention and token before they chose to spend it.` —— **只有禁 + why，没有「那该怎么办」** | **隔壁档 `persona-engineering.md`**：`Firing rights: design reviews can only be fired by the user — you prepare and remind` |

**为什么并进而不另开**：**四份 advisor 档与刚改的三档是同一句话**，判据与验收可以共用一份；`persona-eng-designer` 那处是同一病（禁 + why、缺形），补的是同一句已知形态。**另开一批等于把同一处判断再走一遍四步。**

**与前面「四档零触」的关系**：**那条作废**——它当时的理由是「同档另处已载三形」，而**判据已改成「承载禁令的那一项自身必须带替代品」**，按新判据它们同样缺。**本批改动面 = 八档**（原三档 + 新五档）。

**一条要求**：`advisor-design.md` 与三份 `advisor-round*.md` 是**四份同文**——**四档必须改成同一个形态**，不一致就是新的漂移。

### 范围再补一处（实施席上抛 · 父侧 23:38 裁「①」）

**实施席实读发现**：`thincoder-core/prompts/advisor-design.md` 的 `## Citation Discipline` 一节里还有一句

> `**A line number is not a citation**: it records a position, so one line inserted above **shifts every position below it** — every citing file must be recomputed, and the reader has no way to notice.`

**只有禁 + why，没有替代品。**它与本批已改的 `## Your role` 证据纪律那一处**同档不同节**，是两处。

**父侧裁定 = ① 收进本批**，理由：**同一句话、同一个文件、同一条判据**；记台账另开等于把同一处判断再走一遍四步。

**⇒ 本批改动面 = 八档九处**（八档 + `advisor-design.md` 里的第二处；**父侧先前写作「九档」是计数错误，实施席 #15 当场纠正**）。
**注意这处的 why 与另四档不是同一句**（结尾是 `and the reader has no way to notice`）——**保留它，只动代词**；**统一的是题眼与封口句，不是 why。**

### 一句要设计席收正的话（§2 的笔）

**§2 写「不再有留在批外的禁令句」——与在盘事实不符**（上面那一处就是）。**设计席随后把它改成实情**，并把这第二处补进 §2 的受影响表与验收。

### 裁定：收口验收基线取 11 处读数，不取 §2 的九处表（父侧 23:52）

**实施席 #17 发现的洞**：**§2 的 `C6` 取段起点 = 含题眼的那一行 ⇒ 每档只取得到第一处**。本批有两档是**一档两处**（`advisor-design.md`、`advisor-round2.md` / `advisor-round3.md` 各一处），**只复跑 §2 的 A1–A12，会在漏掉这两处的情况下读绿。**

**裁**：**§6 的验收基线 = §5「② 探针 · 绿侧」的 11 点读数**（键含 `advisor-round2#2` ∥ `advisor-round3#2`），不取 §2 那张九处表。

**理由一句**：**一条判据读得到的地方，就是它管得到的地方。**九处表读不到的第十、十一处，不能拿它的绿当覆盖。

**这是本批第三次同类**（前两次 = 用户发现漏网、评审发现盘点表分类掉一个命中）。**共性写在这**：**判据的射程按文件算、按表算，而问题按处算。**

## §2 批次任务与设计（eng-designer）
**状态行**：设计完成
<§2 模板占位：本批条目（覆盖） / 设计档落点 / 机制设计 / 受影响文件与测试覆盖 / 验收对照 / 关键决策 / 上抛项>

### 本批条目（覆盖）

- **条目 1 · 正确形态进主句**：`thincoder-core/prompts/common.md` 的 `A line number is never the citation` 句，破折号后**直接给出替代品**（节 + 逐字引文 ∥ 符号名），不是另起一句补充。
- **条目 2 · 封口句**：同段末句堵死「核过内容 ⇒ 照行号引用」这条路径（今天父侧实走过，§1 有据）。
- **条目 3 · why 不动**：why 两句留在原位、紧跟正确形态之后，中间零断点、零空行（用户 23:06 要的「不许分开」）；**理由本体逐字保留，只动代词**。
  - **`common.md`：why 首句起头的 `it` → `A number`**。原 `it` 指代题眼里的 `a line number`；题眼破折号后换成替代品，先行词随之换位，不改则指代悬空。理由本体三样（位置会漂 ∥ 每个引用文件要重算 ∥ 工作量随引用数增长）逐字未动。
  - 另两档同形，逐档处置见「受影响文件与测试覆盖」表。
- **条目 4 · `consult-base.md` 同缺同补**：该档 `## Your role` 第 1 条证据纪律里承载禁令的那一句，按条目 1–3 同一形改写（正确形态进主句 + why 逐字 + 封口句）。
- **条目 5 · `persona-plan.md` 同缺同补**：该档 `## Reporting duty` 的 `**Never a line number**` 项，按同一形改写。
- **条目 6 · 四份 advisor 档同缺同补，四档同一字面**：`advisor-design.md` ∥ `advisor-round1.md` ∥ `advisor-round2.md` ∥ `advisor-round3.md` 的 `**Never cite a line number**` 句（四份现句一字不差），破折号后补替代品；**措辞对齐同档条目 13**，即「稳定名」。逐档目标态见「目标态 · 条目 6」。
  - **为什么对齐条目 13、不另造一句**：`advisor-design.md` 的条目 13 已把同一规则写成「稳定名」，另给一句措辞不同的替代品，同一档里就有两种说法，下一位读者要自己判断哪句算数。用户 23:24 的原话：「同档条目 13 已经是对的，别把它改成另一种（要么对齐它，要么把两者并成一处并说清为什么）」。
  - **三份 `advisor-round*.md` 没有条目 13**（`grep` 在 `thincoder-core/prompts` 只命中 `advisor-design.md` 一处）⇒ 替代品只能落在证据纪律那一句里；四档取同一字面，正是用户要的一致。
- **条目 7 · `persona-eng-designer.md` 补形态**：`**Do not fire reviews yourself**` 句只有禁 + why，没有「那该怎么办」；破折号后补「谁有权发、这一席做什么」，形态取自 `persona-engineering.md` 的 `Firing rights`。**被删的理由一句不丢**。
- **不在本批**：`discipline-engineering.md` 的 D4 / D10（详述面，单源在那）· `docs/core/design/DOC-DISCIPLINE.md`（行号规则本体与三形已在位，零触）· `persona-engineering.md`（`Firing rights` 的正确形态源，零触）· `advisor-design.md` 的条目 13（已是对的，本批对齐它、不改它）。

### 设计档落点

- **机制单源 = 设计档已在位**：`docs/core/design/DOC-DISCIPLINE.md` 的「行号一律不作引用形态（强制 · 无例外）」。
- **该档已载三形**，依据其原话：「指某条规则 / 判据 / 约束 ⇒ 写**节名 + 逐字引文**」·「指代码里的某个东西 ⇒ 写**符号名**」（函数 / 常量 / 导出名）。
- **核对结论：不缺，设计档不动。**本批补的是提示词面**同一条规则**的「写什么」半句——摘录时只留下了「不许」。
- **提示词详述面 = `discipline-engineering.md` 的 D4 / D10**（`What to write instead`：the rule's own sentence, or the section / symbol it lives in）。单源保持，本批零触。

### 最近先例与调研证据

- **先例 · 设计档节**：`docs/core/design/DOC-DISCIPLINE.md` 的「**行号一律不作引用形态（强制 · 无例外）**」。**对齐**：禁的那一半一字不改，本批补的是同一句缺的另一半——同一机制的两种说法不在两个档里各写一遍。逐字依据 `docs/core/design/DOC-DISCIPLINE.md`「指某条规则 / 判据 / 约束 ⇒ 写**节名 + 逐字引文**」。
- **先例 · 实现坐标**：`thincoder-core/prompts/persona-eng-designer.md` 的 `**§2 cites rather than transcribes**` 那一句——同一条规则在提示词面已按「禁令 + 三形列举」同句给出。**对齐**：三形措辞照它，逐字依据 `thincoder-core/prompts/persona-eng-designer.md`「a section number, a symbol name, or the exact words of the line」。
  **偏离**：先例把替代形态放在冒号后的第二个分句，本批把 `cite the item itself` 提到**题眼里、破折号后**。偏离理由 = 用户 23:06 的形（正确形态紧跟题眼、与 why 不分家）；题眼是模型扫读时必读的一行，第二个分句不是——先例的形在扫读下要读到句尾才拿到替代品。
- **先例 · advisor 四档**：`thincoder-core/prompts/advisor-design.md` 条目 13 —— 同一条禁令在**同一档**里已经是「禁 + 替代品」连写。逐字依据 `thincoder-core/prompts/advisor-design.md`「a citation into code or docs identifies its target by a stable name, never by a line number」。
  **对齐**：四档的替代品就用条目 13 的「稳定名」，`Name the symbol (function / constant / field / message / section heading)` 一并照它，以免同一档两套话。
  **偏离**：条目 13 的替代品在判据里（评审查设计档时用），不在证据纪律里（评审自己写证据时用）。本批把同一措辞搬进证据纪律那一句，因为读者在写证据时读的是那一句，判据那一条他未必在看。另一个偏离：三份 `advisor-round*.md` 没有条目 13，替代品只有证据纪律处这一个落点。
- **先例 · persona-eng-designer 的发评审权**：`thincoder-core/prompts/persona-engineering.md` 的 `Firing rights` 行已写出正确形态。逐字依据 `thincoder-core/prompts/persona-engineering.md`「design reviews can only be fired by the user — you prepare and remind, the user fires」。
  **对齐**：措辞照它（谁能发、这一席负责准备与提醒），why 逐字保留。
  **偏离**：主 agent 席的 `Firing rights` 行是正面陈述（谁有权），本席这一句是禁令句（别自己发）⇒ 本批把正面陈述接在禁令句破折号后，保持禁令的语气不变。
- **先例批次**：无。以字面 `cite the item itself` 扫 `docs/batches` 只命中本档 ⇒ 同一改动的先例批不存在，先例只到上面三层（设计档节 + 实现坐标 + advisor 条目 13）。
- **调研证据行**：查过 `docs/core/design/DOC-DISCIPLINE.md`（行号规则本体 + 「换形怎么落」五形表）∥ `docs/core/design/ADVISOR-GUARDS.md` §3.1（设计评审第 13 条的参照形态判据）∥ `docs/README.md`（文档地图：提示词常住面 = `thincoder-core/prompts/`）∥ `test/RTM.md`（集成面）∥ 声明公共源 `../.thincoder` ∥ `../thincoder.com`。
  **相关** = 前三档。其中 `ADVISOR-GUARDS.md` §3.1 另记一条同轴差（它判**被审文档**里的引用形态，不管评审席自己怎么写）⇒ 与本批不冲突，不构成第二处形态源。
  **声明公共源两处无相关**：`.thincoder` 下只有本仓提示词的旧快照副本（`tmp/core-before/prompts/` 等）与 `advisor.md`，不是另一份规则源；`thincoder.com` 按目录面查得 `docs/` ∥ `www/` ∥ `scripts/`，是产品站文档面，无提示词档 ⇒ 两处都不住这条规则。
- **文档地图面**：评审上下文报「No document map found」——地图在位 = `docs/README.md`，本席按它判归属：提示词 = 产品代码面，`thincoder-core/prompts/` 是唯一副本，设计档不承载提示词文本。
- **面外引文本轮读回**：`docs/core/design/DOC-DISCIPLINE.md` 的「行号一律不作引用形态」与其下表 · `thincoder-core/prompts/advisor-round1.md` 的「The evidence cell is a pointer, not a copy: a section number, a symbol name, or the exact words of the line」——两句本轮 `grep` 读得；**所据两档在评审面之外**，评审席无法自行核对，故这两条记的是本席自查。

### 机制设计

**接口面 = 无。**改动是八份提示词档里承载禁令的字面文本（`common.md` 的 `## Evidence discipline` 一段 + 其余七档各一行），无函数 / 参数 / 数据流 / 状态机，故无接口契约可写。

### 目标态 · 条目 1–3（`common.md`）

**逐字；实施席按此替换该段首句所在的两条源行**：

```text
**A line number is never the citation — cite the item itself**: the document section together with its exact words,
or a symbol (function / constant / export name). A number records a position, not a fact about the text. Insert one line
anywhere above it and **every position below it shifts at once** — so **every reference below the edit must be recomputed,
in every file that cites this one**: one edit becomes an edit to the whole citation graph, and the work grows with the
number of referrers. Reading the line and then citing it is not a way out: the number dies the moment anything is inserted
above it, while what you cited — the section, its words, the symbol — stays findable.
```

**三件逐条对上**（§1 用户要的形）：

- **① 正确形态在主句**：题眼破折号后就是替代品 `cite the item itself`，冒号后立刻给两种对象各自的写法——模型扫题眼即得「禁止 + 替代」两半，不必再去找别的档。
- **② why 紧跟不断**：`A number records a position, not a fact about the text.` 起即为 why，原两句逐字留在原位，同一自然段。
- **③ 末句封口**：`Reading the line and then citing it is not a way out` —— 核过再照引仍是错，并给出代价对比（号会死 ∥ 你指的东西可再被找到）。

**与同节上文对齐**：同节上文已写 `cite the file path plus the exact words`，本句只补「节」与「符号」两形，措辞随它（`exact words`）。依据 `thincoder-core/prompts/common.md`「cite the file path plus the exact words」。

### 目标态 · 条目 4 / 5（两档同补同一形）

**本批边界**：「承载禁令的那一项自身不带替代品」按这条判据共八档，全部在本批（条目 4 / 5 / 6 / 7）。依据 `thincoder-core/prompts/advisor-round1.md`「a section number, a symbol name, or the exact words of the line」。

**两档共一形**：题眼破折号后直接给替代品；why 逐字留在原位；段末封口句堵「核过再照引」。每档只换承载禁令的那一行，上下行一字不动。

#### 条目 4 · `thincoder-core/prompts/consult-base.md`

**现句逐字**（在盘，`## Your role` 第 1 条证据纪律内）：

```text
   **Never cite a line number** — it records a position, so one line inserted above **shifts every position below it**: every file citing this one must be recomputed, and the work grows with the number of referrers.
```

**接在哪句后面**：紧接 `**An assertion has two sources only**` 那一句（该句以 `what you read (the file path plus the exact words, quoted as they stand)` 起、以 `or an explicit` 收尾）之后。

**为什么那里是断点**：上一句给的是「证据从哪来」（路径 + 逐字），下一行起的 `Why:` 归的是那两条证据义务（「Known behavior…」「I'm confident…」靠记忆），与行号这一条无关。禁令句夹在两块之间、自成一句 ⇒ 断点就在这一行本身：整行替换，上一句与 `Why:` 行零触（判据 = A11）。

**目标态（逐字）**：

```text
   **Never cite a line number — cite the item itself**: the document section together with its exact words, or a
   symbol (function / constant / export name). A number records a position, so one line inserted above **shifts every
   position below it**: every file citing this one must be recomputed, and the work grows with the number of referrers.
   Reading the line and then citing it is not a way out: the number dies the moment anything is inserted above it,
   while what you cited — the section, its words, the symbol — stays findable.
```

**why 只动一个词**：原句用 `it` 指代题眼里的 `a line number`；题眼破折号后换成替代品，`it` 没了先行词 ⇒ 写成 `A number`。理由本体（位置会漂 · 每个引用文件要重算 · 工作量随引用数增长）逐字未动。

#### 条目 5 · `thincoder-core/prompts/persona-plan.md`

**现句逐字**（在盘，`## Reporting duty` 清单内）：

```text
- **Never a line number**: one line inserted above **shifts every position below it** — every citing file must be recomputed, and the implementer follows it onto the wrong thing without knowing.
```

**接在哪句后面**：紧接以 `Ground the plan in reality: cite real file paths and the exact words you read there, name actual functions and modules` 开头的那一项（该项以 `an invented architecture sends the implementer to build something that does not exist.` 收尾）之后。

**为什么那里是断点**：上一项给「怎么落笔」（真路径 + 逐字 + 真函数 / 模块名），下一项 `Make steps concrete and verifiable` 起转去讲步骤粒度。禁令项夹在两者之间、自成一项 ⇒ 断点在这一项本身：整项首行替换，上下两项零触（判据 = A11）。

**这一档的缺轻一半**：上一项已有正向写法，但禁令项自身只有「不许」与代价——只读这一项的读者拿不到替代品。本批把替代品搬进禁令项的主句。

**目标态（逐字）**：

```text
- **Never a line number — cite the item itself**: the document section together with its exact words, or a symbol
(function / constant / export name). One line inserted above **shifts every position below it** — every citing file must
be recomputed, and the implementer follows it onto the wrong thing without knowing. Reading the line and then citing it
is not a way out: the number dies the moment anything is inserted above it, while what you cited — the section, its
words, the symbol — stays findable.
```

**why 只动一个字母**：原句以 `one line inserted above` 起，接在题眼冒号后须大写 ⇒ `One`。理由逐字未动。

### 目标态 · 条目 6 / 7（四份同字面 ∥ 一档补形态）

#### 条目 6 · 四份 advisor 档（逐字，四档同一）

**缩进随各档现有续行**（四档现句都是 3 空格续行；替换时保持该缩进，其余不动）：

```text
   **Never cite a line number — identify the target by a stable name**: a symbol (function / constant / field / message / section heading); when no symbol exists, the file together with the section heading that owns it. A number records a position, so one line inserted above **shifts every position below it**: every file citing this one must be recomputed, and the work grows with the number of referrers. Reading the line and then citing it is not a way out: the number dies the moment anything is inserted above it, while the name stays findable.
```

**三件逐条对上**：

- **① 正确形态在主句**：破折号后是 `identify the target by a stable name`，冒号后随即给出两句操作——有符号就写符号名，没有就退到「文件 + 拥有它的节名」。两句与条目 13 同义同词。
- **② why 紧跟不断**：`A number records a position` 起即 why，原一句逐字留在原位，仅起头 `it` → `A number`（与条目 4 同一处置：题眼破折号后换了先行词，不改则指代悬空）。
- **③ 末句封口**：`Reading the line and then citing it is not a way out` —— 核过内容再照行号引用仍是错。

**末句为什么用 `the name stays findable`，不与另三档同文**：这一族的替代品只有一个说法（条目 13 的「稳定名」）。再把「节 + 逐字 + 符号」三形抄进来，等于把两种说法并回同一句，正是对齐条目 13 要消掉的东西。三形本身不缺——证据纪律上一项已写 `the file path plus the exact words, quoted as they stand`。

#### 条目 7 · `persona-eng-designer.md`（逐字）

```text
**Do not fire reviews yourself — the user alone fires them**: you prepare the review and remind; the user fires it, and you wait. A self-fired review spends the main agent's / user's attention and token before they chose to spend it. Having the material ready is not a way out: readiness is what makes the fire cheap for the user, never what makes it yours.
```

**三件逐条对上**：

- **① 正确形态在主句**：破折号后是 `the user alone fires them`，冒号后写这一席做什么——准备、提醒、等。措辞取自 `Firing rights`。
- **② why 逐字保留**：原句 `a self-fired review spends … before they chose to spend it` 只把句首 `a` → `A`（它现在起一个新句子），一个词都没换。
- **③ 末句封口**：堵「材料我备齐了，顺手发掉」这条路径——`readiness is what makes the fire cheap for the user, never what makes it yours`。

### 受影响文件与测试覆盖

| 文件 | 改动 | 层级结论 |
|---|---|---|
| `thincoder-core/prompts/common.md` | `## Evidence discipline` 该段首句改写 + 段末加封口句；why 逐字保留（**仅其首句起头 `it` → `A number`**，理由见条目 3） | **无跨层**：提示词文本面，单档单段，无签名 / 无接口 / 无枚举计数变化 |
| `thincoder-core/prompts/consult-base.md` | `## Your role` 第 1 条证据纪律的禁令句整行替换（正确形态进主句 + 封口句）；原 why 逐字保留（仅 `it` → `A number`） | **无跨层**：同上，单行字面替换，无签名 / 无接口 / 无计数变化 |
| `thincoder-core/prompts/persona-plan.md` | `## Reporting duty` 的 `**Never a line number**` 项首行整行替换；原 why 逐字保留（仅句首 `one` → `One`） | **无跨层**：同上 |
| `thincoder-core/prompts/advisor-design.md` | 证据纪律第 2 条里 `**Never cite a line number**` 那一行整行替换为条目 6 的字面；**同档条目 13 零触** | **无跨层**：单行字面替换，无接口 / 无计数 |
| `thincoder-core/prompts/advisor-round1.md` | 同上（同一字面，一字不差） | **无跨层**：同上 |
| `thincoder-core/prompts/advisor-round2.md` | 同上 | **无跨层**：同上 |
| `thincoder-core/prompts/advisor-round3.md` | 同上 | **无跨层**：同上 |
| `thincoder-core/prompts/persona-eng-designer.md` | Identity 面 `**Do not fire reviews yourself**` 那一行整行替换（禁令 + 谁有权发 + why 逐字 + 封口句） | **无跨层**：persona 层单行字面替换，无接口 / 无计数 |

### 集成测试设计（起点 = `test/RTM.md` 索引）

**起点**：`test/RTM.md`（索引档；用例行住分册 `test/rtm/<族>.md`，一行 = 一个集成用例）。按 delta 逐条答三个问题：

- **破不破既有行**：不破。索引表的每一行断言的都是 CLI / VSC 端的**用户可观察行为**（工具结果回模型 · 网页抓取故障不外溢 · 浏览器等待窗口可调 · 批次与台账流程 · 路径解析 …），没有一行断言提示词的措辞或装配结果。依据 `test/RTM.md`「一行 = 一个集成用例（5 列，列定义 = docs/core/design/TESTING.md §11.3）」。
- **有没有冗余行**：无。本批没有让任何既有用例失去它所断言的那个业务结果。
- **缺不缺行**：不加。新增一行的入口只有两个——产品真需要的业务场景 ∥ 生产真发生过的问题；本批两个都不成立（改的是八份提示词档的文字，用户侧零观察面，也没有哪次生产故障追到这几句上）。

**⇒ 豁免结论（具名，写在此段）**：本批**不改任何业务可观察结果**，且**不新增产品真需要的场景** ⇒ 集成用例不新增、不修订，`test/integration/**` 与 `test/rtm/**` 零触，`test/RTM.md` 零改。

**验证面（零代码面 ⇒ 无单元测试档）**：两件——读句探针（下一节，八档一次跑）+ 实施席 §5 写入回执的 doc-check 门行（判 A9）。

**读句探针（八档一次跑）**：判据本体，用 `execute` 以 node 跑，工作目录 = 仓根（`thincoder-core/prompts/` 是相对仓根的路径）。纯 ASCII 串，无中文串解码面。

```js
import fs from 'node:fs';
const D = 'thincoder-core/prompts/';
const flat = s => s.replace(/\s+/g, ' ').trim();
const LN = '**Never cite a line number — identify the target by a stable name**: a symbol (function / constant / field / message / section heading); when no symbol exists, the file together with the section heading that owns it. A number records a position, so one line inserted above **shifts every position below it**: every file citing this one must be recomputed, and the work grows with the number of referrers. Reading the line and then citing it is not a way out: the number dies the moment anything is inserted above it, while the name stays findable.';
const T = {
  'common.md': { mark: 'cite the item itself', start: 'A line number is never the citation', end: 'stays findable',
    why: 'every reference below the edit must be recomputed, in every file that cites this one',
    target: '**A line number is never the citation — cite the item itself**: the document section together with its exact words, or a symbol (function / constant / export name). A number records a position, not a fact about the text. Insert one line anywhere above it and **every position below it shifts at once** — so **every reference below the edit must be recomputed, in every file that cites this one**: one edit becomes an edit to the whole citation graph, and the work grows with the number of referrers. Reading the line and then citing it is not a way out: the number dies the moment anything is inserted above it, while what you cited — the section, its words, the symbol — stays findable.' },
  'consult-base.md': { mark: 'cite the item itself', start: 'Never cite a line number', end: 'stays findable',
    why: 'every file citing this one must be recomputed, and the work grows with the number of referrers',
    target: '**Never cite a line number — cite the item itself**: the document section together with its exact words, or a symbol (function / constant / export name). A number records a position, so one line inserted above **shifts every position below it**: every file citing this one must be recomputed, and the work grows with the number of referrers. Reading the line and then citing it is not a way out: the number dies the moment anything is inserted above it, while what you cited — the section, its words, the symbol — stays findable.' },
  'persona-plan.md': { mark: 'cite the item itself', start: 'Never a line number', end: 'stays findable',
    why: 'every citing file must be recomputed, and the implementer follows it onto the wrong thing without knowing',
    target: '- **Never a line number — cite the item itself**: the document section together with its exact words, or a symbol (function / constant / export name). One line inserted above **shifts every position below it** — every citing file must be recomputed, and the implementer follows it onto the wrong thing without knowing. Reading the line and then citing it is not a way out: the number dies the moment anything is inserted above it, while what you cited — the section, its words, the symbol — stays findable.' },
  'persona-eng-designer.md': { mark: 'the user alone fires them', start: 'Do not fire reviews yourself', end: 'never what makes it yours',
    why: "A self-fired review spends the main agent's / user's attention and token before they chose to spend it",
    target: "**Do not fire reviews yourself — the user alone fires them**: you prepare the review and remind; the user fires it, and you wait. A self-fired review spends the main agent's / user's attention and token before they chose to spend it. Having the material ready is not a way out: readiness is what makes the fire cheap for the user, never what makes it yours." },
};
for (const f of ['advisor-design.md', 'advisor-round1.md', 'advisor-round2.md', 'advisor-round3.md'])
  T[f] = { mark: 'identify the target by a stable name', start: 'Never cite a line number', end: 'stays findable',
           why: 'every file citing this one must be recomputed, and the work grows with the number of referrers', target: LN };
const XREF = /discipline-engineering|DOC-DISCIPLINE|advisor-design|advisor-round|persona-engineering|persona-plan|consult-base|common\.md/;
function probeStr(name, s) {
  const t = T[name], L = s.split(/\r?\n/);
  const i = L.findIndex(l => l.includes(t.start));
  let j = -1;
  if (i >= 0) for (let k = i; k < L.length; k++) if (L[k].includes(t.end)) { j = k; break; }
  const region = i >= 0 && j >= 0 ? L.slice(i, j + 1).join('\n') : null;
  return { C1: i >= 0 && L[i].includes(t.mark), C2: !!region && region.split('\n').every(l => l.trim()),
           C3: flat(s).split(t.why).length - 1, C4: !!region && !XREF.test(region),
           C6: !!region && flat(region) === flat(t.target), region };
}
const out = {};
for (const n of Object.keys(T)) out[n] = probeStr(n, fs.readFileSync(D + n, 'utf8'));
for (const n of Object.keys(out)) delete out[n].region;
console.log(JSON.stringify(out));
const adv = ['advisor-design.md', 'advisor-round1.md', 'advisor-round2.md', 'advisor-round3.md'];
const R = adv.map(n => flat(probeStr(n, fs.readFileSync(D + n, 'utf8')).region ?? ''));
console.log('C7 four-advisor-identical:', new Set(R).size === 1 && R[0] !== '');
```

**C5 · 邻居行未动**——每档被声明零触的相邻两行各取一个逐字锚，并跑一份控制样本，证明这条判据会读红：

```js
import fs from 'node:fs';
const D = 'thincoder-core/prompts/';
const nav = {
  'common.md': ['An assertion has two sources only: what you read (the file path plus the exact words, quoted as they stand)', 'rest on memory'],
  'consult-base.md': ['**An assertion has two sources only**: what you read (the file path plus the exact words, quoted as they stand)', 'rest on memory'],
  'persona-plan.md': ['Ground the plan in reality: cite real file paths and the exact words you read there, name actual functions and modules', '- Make steps concrete and verifiable'],
  'persona-eng-designer.md': ['**Do not edit prompts**: the English runtime prompt is product code', '- **Practice deposit**'],
  'advisor-design.md': ['**An assertion has two sources only**: what you read (the file path plus the exact words, quoted as they stand)', '**Where the source is readable**, a behavioral question is an EVIDENCE question'],
  'advisor-round1.md': ['**An assertion has two sources only**: what you read (the file path plus the exact words, quoted as they stand)', '**Where the source is readable**, a behavioral question is an EVIDENCE question'],
  'advisor-round2.md': ['**An assertion has two sources only**: what you read (the file path plus the exact words, quoted as they stand)', '**Where the source is readable**, a behavioral question is an EVIDENCE question'],
  'advisor-round3.md': ['**An assertion has two sources only**: what you read (the file path plus the exact words, quoted as they stand)', '**Where the source is readable**, a behavioral question is an EVIDENCE question'],
};
const out = {};
for (const [f, a] of Object.entries(nav)) {
  const s = fs.readFileSync(D + f, 'utf8');
  out[f] = { C5: a.every(x => s.includes(x)), C5control: a.every(x => s.replace(a[0], '__X__').includes(x)) };
}
console.log(JSON.stringify(out));
```

**红侧读数（改动前实跑，八档一次跑）**：

- **C1 ∥ C2 ∥ C4 ∥ C6**：八档齐 `false`。`C2` / `C4` / `C6` 同红的原因 = 封口句收尾锚（`stays findable` ∥ `never what makes it yours`）在改动前还不存在，被替换段取不出来。
- **C3**：前七档 `1`（why 已在盘、只出现一次）；`persona-eng-designer` `0`（现句以小写 `a self-fired review` 起头，目标态改成句首大写）。
- **C5 ∥ C5control**：`C5` 八档齐 `true`，控制样本八档齐 `false`。
- **C7**：`false`（四档的段尚未存在）。

**控制样本（同一命令、同一代码路径，判据两个方向都读）**：把目标态文本就地注入内存中的档内容，再跑同一 `probeStr`。

- **注入即全绿**：八档 `C1 ∥ C2 ∥ C4 ∥ C6` 全 `true`、`C3 = 1`、`C7 = true` ⇒ 探针不是恒红，目标态确实读得绿。
- **删掉 why 那句**（把 `A number records a position, not a fact about the text.` 从目标态抹去）⇒ `C1 / C2 / C4` 仍 `true`、**只有 `C6` 转 `false`**。这正是 §3 第 12 行指出的洞：逐锚判据钉住一半，整段等价才抓得住。
- **段中插一个空行** ⇒ `C2` 转 `false`（封口句与题眼分家）。
- **段内塞一句 `See discipline-engineering.md D4.`** ⇒ `C4` 与 `C6` 同转 `false`（跨档引用）。

**四个控制样本的读数（本席本轮实跑，同一 §2 脚本、同一 `probeStr`）**：

```text
clean       {"C1":true,"C2":true,"C3":1,"C4":true,"C6":true}
why-deleted {"C1":true,"C2":true,"C3":1,"C4":true,"C6":false}
blank-line  {"C1":true,"C2":false,"C3":1,"C4":true,"C6":true}
xref        {"C1":true,"C2":true,"C3":1,"C4":false,"C6":false}
```

`why-deleted` 那一行就是 A12 的全部内容：目标态整段注入后再抹掉 why 那一句，`C1 / C2 / C3 / C4` 全绿，**只有 `C6` 转红**。

**判据形态说明**：

- **`C6` = 被替换段按空白归一后与本节目标态整段比对**（起点 = 含题眼的行，收尾 = 含封口句收尾词的行）。一条覆盖「题眼替代品 ∥ why 逐字 ∥ 封口句」三样，不再出现「钉一半」。
- **空白归一**：目标态是换行过的文本，逐字比对行断点会把正确实施读成缺句（上一轮 A3 的正则锚跨行、改动后会读 0）。归一后判文字内容，不判换行位置。
- **`C3` 数的是整档出现次数**，`1` = why 既在、也没被复制到别处。
- **`C4` 的段内 token 清单含本批另几档的档名**：任何一档里写进另一档的档名都是跨档指针，提示词面禁止这种形态。

### 验收对照（回指本批条目）

| # | 判据（机器可验） | 覆盖条目 |
|---|---|---|
| A1 | 探针输出 `common.md` 项 `C6 = true`：`common.md` 被替换段整段等于本节目标态（含题眼替代品 ∥ `A number records a position, not a fact about the text.` ∥ 封口句） | 条目 1–3 |
| A2 | 探针输出 `consult-base.md` 项 `C6 = true` | 条目 4 |
| A3 | 探针输出 `persona-plan.md` 项 `C6 = true` | 条目 5 |
| A4 | 探针输出四份 advisor 档（`advisor-design.md` ∥ `advisor-round1.md` ∥ `advisor-round2.md` ∥ `advisor-round3.md`）各项 `C6 = true`，且 `C7 = true`（四档段在盘逐字相同） | 条目 6 |
| A5 | 探针输出 `persona-eng-designer.md` 项 `C6 = true` | 条目 7 |
| A6 | 探针八档 `C1 = true`：题眼行含替代品（三档 `cite the item itself` ∥ advisor 四档 `identify the target by a stable name` ∥ `persona-eng-designer` `the user alone fires them`） | 条目 1 · 4 · 5 · 6 · 7 |
| A7 | 探针八档 `C2 = true` ∧ `C3 = 1`：封口句与题眼同段（段内无空行）∧ 原 why 逐字仍在、只出现一次 | 条目 2 · 3 · 6 · 7 |
| A8 | 探针八档 `C4 = true`：段内零跨档引用 token（不复制详述面、不指路） | 边界 |
| A9 | 实施席 §5 回执的 doc-check 门行首 = `[doc-check gate] DOC-CHECK GATE: PASS`；回执无该行 ⇒ `doc_check` 加 `mode:"gate"`、`docs` = 八档、`target` = 仓根补跑，判据 = 首行 `DOC-CHECK GATE: PASS` | 全段可交付 |
| A10 | `git status --short` 中本批改动 = 上述八档；`discipline-engineering.md` ∥ `DOC-DISCIPLINE.md` ∥ `persona-engineering.md` 零改；`advisor-design.md` 条目 13 逐字未动（锚 `name the file together with the section heading that owns it` 在盘） | 边界 |
| A11 | 探针 `C5 = true` 八档齐（每档相邻两行各一个逐字锚，见 C5 脚本）；同一命令的控制样本 `C5control = false` | 边界 |
| A12 | 控制样本可复现：目标态删去 `A number records a position, not a fact about the text.` 后 `C6 = false` 而 `C1–C4` 仍全绿 ⇒ 整段等价是唯一抓得住删句的判据 | 条目 3 |

### 关键决策（含落选方案）

1. **改题眼、不插句。**
   - 落选：在现有两句之间插入新句。
   - 理由：现有首句以破折号悬接下一行的 why，中间**没有可插的句间空位**；插进去会让 why 从句中另起。
   - 更硬的理由：插进去题眼仍是纯禁止，而用户抱怨的恰是题眼。改题眼后，模型扫第一行就拿到两半。
2. **D11（`Citation form — cite as doc:section`）零触、零指针。**
   - 它管的是跨档指针的形态与方向（含批档引用方向与若干细则），不是「行号 vs 名字」这一机制。
   - 并进主句会把指针方向那套机件搬进证据节，还得重述详述面（违 D2）。
   - 提示词面禁跨档引用，写一句「见 D4」本身即是该面禁止的形态 ⇒ 目标句自足成文，不指路。
3. **why 逐字保留、不压缩。**用户要的是「补缺 + 收口」，不是重写理由。
   - 逐字保留让 diff 只含新语义，评审一眼看出「新加的只有两处」。
4. **长度取此。**整段由约两条源宽增至约六条源宽。
   - 新增只有两样：正确形态（题眼从句 + 冒号列举）与封口句。
   - 前者是这一批的全部理由，后者对应今天实走过的路径 ⇒ 两样都不可省，**不再加第三样东西**。
5. **`DOC-DISCIPLINE.md` 零触。**核对结论 = 该档「行号一律不作引用形态（强制 · 无例外）」已载三形，缺的只在提示词面；「强制 · 无例外」本身就封掉了「核过内容再照引」这条路径，故设计档无需补句。
6. **判据 = 承载禁令的那一项自身必须带替代品（不是「整档有没有三形」）。**
   - 「整档没有三形」这个说法被盘面反证：`consult-base.md` 禁令的上一句就写着 `what you read (the file path plus the exact words, quoted as they stand)`；`persona-plan.md` 的上一项三形齐备。依据 `thincoder-core/prompts/consult-base.md`「**An assertion has two sources only**: what you read (the file path plus the exact words, quoted as they stand) or an explicit `unverified`.」。
   - 判据就这一句：**只读那一项、不读邻项的读者，拿不拿得到正向写法**。拿不到 = 缺——八档按此判缺，故补。
   - **落选**：只补 `common.md`（其余七档的禁令项自身仍只禁不给，同一条规则在提示词面还剩七处只写「不许」）· 六档全补（那条范围决定已被用户 23:24 的裁定推翻）。
7. **探针的空白归一（上一轮改的判据形态）。**
   - 上一轮 C3 拿整串正则匹配、锚串在目标态里跨行 ⇒ **正确实施会把 A3 读成 0**，判据与目标态互相矛盾。
   - 改法：比对前把空白归一，判文字内容、不判行断点；整段等价（`C6`）同用。
8. **同一句落八档不违 D2（单源）——装配隔离。**
   - 八档是八条独立的装配单元，各自单独注入：`consult-base.md` 与四份 `advisor-*.md` 档头均写明 `self-contained`、不在主装配链里；`persona-plan.md` 只给 `plan subagent` 用；`persona-eng-designer.md` 只给设计席；`common.md` 是主装配链的公共层。依据 `thincoder-core/prompts/consult-base.md`「self-contained base, NOT part of the main assembly chain」。
   - ⇒ 读者手里只会有其中一份，别处那份到不了他眼前；「写一处、别处指过去」在这里等于让该读者拿不到禁令（跨档指针在提示词面本来也被禁）。
   - 详述面仍单源：`discipline-engineering.md` 的 D4 / D10 零触，本批落的是同一句的**题眼字面**，不是第九份解释。
9. **八档各改一处、不整段重写。**A11 就是为这条设的：被声明零触的邻行各有一个逐字锚兜着，整段重写立刻读红。
10. **四份 advisor 档对齐条目 13 的措辞，不另造一句。**
    - 落选：把另三档的「节 + 逐字 + 符号」三形抄进 advisor 四档。
    - 理由：`advisor-design.md` 条目 13 已把同一规则写成「稳定名」；抄三形进去，同一档里就有两种说法，读者要自己判断哪句算数。用户 23:24 的边界把这条钉死了。
    - 代价：这一族的替代品措辞与另三档不同（`the name stays findable` ∥ `the section, its words, the symbol`）。这是**同一规则在两组读者前的两种措辞**，不是两条规则：三形在这四档不缺（证据纪律上一项写着 `the file path plus the exact words`），缺的是禁令项自己那一句。
11. **验收加整段等价（`C6`），撤掉逐锚拼凑。**（§3 第 12 行的裁。）
    - 落选：继续只钉 why 里的一小句（原 A3）。
    - 理由：控制样本实读——整段删掉 `A number records a position, not a fact about the text.` 后，逐锚判据 `C1–C4` 仍全绿。判据钉一半，等于给「why 不动」这条用户当场要的要求开了口子。
12. **`persona-eng-designer` 那处补「谁有权发」，不搬整段 `Firing rights`。**
    - 落选：把 `persona-engineering.md` 的 `Firing rights` 整行搬过来。
    - 理由：那一行是主 agent 席的正面陈述（跨档引用在提示词面被禁，搬过来还得改主语）；本席要的是禁令句后面接替代品，一句 `you prepare the review and remind; the user fires it` 就够。

### 上抛项

- **在途上抛：无。**上一轮两条已裁：原两档并入本批（条目 4 / 5）；四份 advisor 档与 `persona-eng-designer` 由用户 23:24「甲」并入（条目 6 / 7）。
- **本批遗留面：无。**上一轮记的「四档仅靠同档另处三形兜底」已随条目 6 收进本批，不再有留在批外的禁令句。



## §3 设计评审（评审子代理）
**状态行**：评审通过



### 轮次 1（评审子代理）

| # | 严重度 | 状态 | 证据（指针） |
|---|---|---|---|
| 1 | 🔴 | 未解决 | §2「受影响文件与测试覆盖」：「零代码面 ⇒ 无单元测试档。验证 = 一次读句探针 + 一次 `doc_check(mode:"gate")`。」—— 无 test/RTM.md 起点的集成测试设计段，无「不改任何业务可观察结果」的具名豁免 |
| 2 | 🟡 | 未解决 | §1 边界表「整档没有三形（节名 ∥ 符号名 ∥ 逐字引文）」vs consult-base.md「the file path plus the exact words」；persona-plan.md「cite real file paths and the exact words you read there, name actual functions and modules」；§2 关键决策 6「三形零载的只有 `consult-base.md` ∥ `persona-plan.md`」 |
| 3 | 🟡 | 未解决 | 条目 3「why 不动」/「原 why 两句逐字保留」vs §2 目标态「A number records a position, not a fact about the text.」—— common.md 的 `it` → `A number` 未在受影响表该行披露（另两档披露了） |
| 4 | 🟡 | 未解决 | 条目 4「上一句与 `Why:` 行零触」· 条目 5「上下行一字不动」—— A1–A10 无一条判邻居行未动（C3 只数一句 why，C4 只扫段内 token） |
| 5 | 🟡 | 未解决 | 无最近先例行：只有「### 关键决策（含落选方案）」，无先例坐标（实现坐标 ∥ 设计档节 ∥ 先例批次）+ 对齐 ∥ 偏离理由 |
| 6 | 🟡 | 未解决 | 无调研证据行：全篇只引仓内档，无「查了哪些公开源档 ∥ 有无相关」的记录（含「无相关」也须记录） |
| 7 | 🟡 | 未解决 | A9「`doc_check(mode:"gate")` 判三档，首行 `DOC-CHECK GATE: PASS`」—— 该命令在实施轮工具面中的可用性无据（unverified），是探针之外唯一的机械闸 |
| 8 | 🔵 | 未解决 | §1「**`thincoder-core/prompts/common.md` 第 106–107 行逐字**」—— 本批主题即禁行号，且该范围被本批改动本身作废（逐字引文已给，抄件仍可解） |
| 9 | 🔵 | 未解决 | 同一段约五行文本落三档，未说明为何不违「Single source of truth」；consult-base.md 档头「self-contained base, NOT part of the main assembly chain」即理由，未记录 |
| 10 | 🔵 | 未解决 | 零触结论的依据（DOC-DISCIPLINE.md「指某条规则 ⇒ 节名 + 逐字引文」、advisor-round1.md「a section number, a symbol name, or the exact words of the line」）在本轮评审面外，未核（unverified） |
| 11 | 🔵 | 未解决 | 文档地图面降级：评审上下文报「No document map found」，而 AGENTS.md 指明 docs 目录下那份权威文档地图为唯一入口；ownership 仅按 AGENTS.md 的 docs/core/design 归属判断 |

VERDICT: changes-required

计数：🔴 1 · 🟡 6 · 🔵 4（合计 11 行）

### 轮次 2（评审子代理）

**轮次 2 核对（本轮，评审子代理）**

| # | 严重度 | 状态 | 证据（指针） |
|---|---|---|---|
| 1 | 🔴 | 已修 | 「### 集成测试设计（起点 = `test/RTM.md` 索引）」三问答齐 +「**⇒ 豁免结论（具名，写在此段）**」；`test/RTM.md` 在位（glob）。档内「索引表的每一行断言的都是 CLI / VSC 端的」为面外事实，本轮未核 |
| 2 | 🟡 | 已修 | §1「立论修正（评审 #4 第 2 条指出父侧原写法不成立）」；判据改为「判据就这一句：**只读那一项、不读邻项的读者，拿不拿得到正向写法**」 |
| 3 | 🟡 | 已修 | 条目 3「why 首句起头的 `it` → `A number`」+ 受影响表「**仅其首句起头 `it` → `A number`**」+ A3 改口径 |
| 4 | 🟡 | 已修 | 「**C5 · 邻居行未动（A11）**」；三档锚点逐字在盘，控制样本 `C5control` 读红 |
| 5 | 🟡 | 已修 | 「### 最近先例与调研证据」含设计档节 / 实现坐标 /「**偏离**」/「**先例批次**：无」 |
| 6 | 🟡 | 已修 | 「**调研证据行**：查过」+「**声明公共源两处无相关**」 |
| 7 | 🟡 | 已修 | A9 改锚到「实施席 §5 写入回执的 doc-check 门行首」+ `doc_check` 补跑兜底；`PROJECT-MANIFEST.json` 在仓根（glob） |
| 8 | 🔵 | 未解决（零理由） | §1「第 106–107 行逐字」仍在 |
| 9 | 🔵 | 已修 | 关键决策 8「同一句落三档不违 D2（单源）——装配隔离」 |
| 10 | 🔵 | 已接受 | 「面外引文本轮读回」——理由在评审面外，本轮 unverified |
| 11 | 🔵 | 已接受 | 「**文档地图面**」段按地图判归属 |
| 12 | 🟡（新） | 未解决 | A3 只钉一句 why；「A number records a position, not a fact about the text.」与「every position below it shifts at once」无判据 ⇒ 整段删句仍读绿；建议加一条归一后的整段等价判据 |
| 13 | 🟡（新） | 未解决 | §1「不是「它们不满足判据」」与 §2「**不是它们满足判据**」极性相反 |
| 14 | 🔵（新） | 未解决 | 「两句本轮 `grep` 读得，不在评审面外。」——两句所据两档确在评审面外，措辞反了 |

计数：本轮 🔴 0 · 🟡 2（均非 must-fix）· 🔵 2（第 8 · 14 行）；第 1–7 · 9–11 已修 / 已接受。

VERDICT: pass

### 轮次 3（评审子代理）

| # | 严重度 | 状态 | 证据（指针） |
|---|---|---|---|
| 1 | 🟡 | 待裁 | §1「**不在本批**：四份 `advisor-*.md`」vs §1「**本批改动面 = 八档**（原三档 + 新五档）」—— 同一记录两处活口径，且「**那条作废**」只标注未删除 |
| 2 | 🟡 | 待裁 | 决策 8「读者手里只会有其中一份，别处那份到不了他眼前」vs `common.md` 档头「always assembled second, right after the persona slot」+ `persona-plan.md` 档头 `slot:[1]` —— 该对同装配 |
| 3 | 🟡 | 待裁 | 目标态「the document section together with its exact words」vs 同节在盘「the file path plus the exact words」—— 三档里两形并列，未说路径是否仍需 |
| 4 | 🟡 | 待裁 | 条目 7「句只有禁 + why，没有「那该怎么办」」vs `persona-eng-designer.md`「the review is the user's to fire, and a self-fired one spends their attention and token before they chose to spend it」 |
| 5 | 🟡 | 待裁 | §1「第 106–107 行逐字」· §2「§3 第 12 行指出的洞」—— 本批主题即禁行号 |
| 6 | 🔵 | 待裁 | A10「`git status --short` 中本批改动 = 上述八档」+ 评审上下文「No git repository detected」—— 无 git 侧读数未定 |
| 7 | 🔵 | 待裁 | 条目 2「同段末句」vs 目标态封口句之后仍接「Known behavior…」与 `Why:` 行 |
| 8 | 🔵 | 待裁 | 面外依据本轮不可核：`advisor-round1.md`「a section number, a symbol name, or the exact words of the line」· `DOC-DISCIPLINE.md` · `persona-engineering.md` · `test/RTM.md` |

计数：🔴 0 · 🟡 5 · 🔵 3（合计 8 行）

VERDICT: pass

## §4 用户批准（主 agent）

### 用户批准

**授权来源（四处，都是用户原话）**：

- **23:03**「A line number is never the citation 这句话后面有没有直接告诉你们正确的形态？」——挑出缺口。
- **23:06**「能不能更紧密点，直接把正确型接在 A line number is never the citation 后面，然后整体一起说 why，别让这两句分开？」——定形态。
- **23:07**「甲」——选开口批次走完整流程（乙 = 直接派实施、不评审，被否）。
- **23:24**「甲」——把盘出来的另五档并进本批，不另开。

**批准范围**：八档提示词的引用形态（题眼带替代品 + why 不分离 + 封口句）。
**设计细节的批准来自评审**（第 1 轮 `changes-required` → 第 3 轮 `pass`），**不是来自用户**；两者不混成一句。

**用户尚不知道的一条**（评审第 2 轮就把这条列为非阻塞）：**四份 `advisor-*.md` 与 `persona-plan.md` 在同一次装配里会各带一份近似字面**——`common.md` 档头写着 `always assembled second, right after the persona slot`，`persona-plan.md` 档头是 `slot:[1]`。**这批不改这个结构**（改了就是另一件事），但下一个人读两处措辞时会问为什么不一样，答案在这里。

## §5 实施记录（eng-coder）
**状态行**：实施完成



### 实施摘要

| 项 | 内容 |
|---|---|
| 改动面 | **8 档 9 处**。没有第 9 个文件——第 9 处是 `thincoder-core/prompts/advisor-design.md` 的第二处 |
| 档（八份） | `thincoder-core/prompts/common.md` ∥ `thincoder-core/prompts/consult-base.md` ∥ `thincoder-core/prompts/persona-plan.md` ∥ `thincoder-core/prompts/advisor-design.md` ∥ `thincoder-core/prompts/advisor-round1.md` ∥ `thincoder-core/prompts/advisor-round2.md` ∥ `thincoder-core/prompts/advisor-round3.md` ∥ `thincoder-core/prompts/persona-eng-designer.md` |
| 第 9 处的时间 | 2026-11-08 本轮；实施席上抛后，用户当场裁「① 收进本批」 |
| 第 9 处的理由 | 同句、同档、同判据（承载禁令的那一项自身必须带替代品）；另开批次等于把同一处判断再走一遍四步 |
| 落笔形态 | 逐字照 §2 目标态，未改一个字符；仅按项目行宽折行（全仓提示词档最长行 300 字符，无一行超 300） |
| 折行不算偏离的依据 | §2 关键决策 7 自定「归一后判文字内容，不判换行位置」 |
| why 为何不统一 | why 是各档自己的，逐字保留、只动代词；统一的是题眼替代品与封口句 |
| 第 9 处的 why | 它自己的 why 逐字保留（结尾 `and the reader has no way to notice`），只把 `it` 改成 `A number` |

### 改动清单（逐档对照 §2 目标态）

| 档 | 处 | 题眼替代品 | why 处置 | 封口句 |
|---|---|---|---|---|
| `thincoder-core/prompts/common.md` | 1 | `cite the item itself`，冒号后给「节 + 逐字」与「符号」两形 | 逐字，`it` → `A number` | `while what you cited — the section, its words, the symbol — stays findable` |
| `thincoder-core/prompts/consult-base.md` | 1 | 同上 | 逐字，`it` → `A number` | 同上 |
| `thincoder-core/prompts/persona-plan.md` | 1 | 同上 | 逐字，句首 `one` → `One` | 同上 |
| `thincoder-core/prompts/advisor-design.md` | 1 | `identify the target by a stable name`，符号名；无符号则「文件 + 拥有它的节名」 | 逐字，`it` → `A number` | `while the name stays findable` |
| `thincoder-core/prompts/advisor-design.md` | 2（第 9 处） | 与上一行同一字面 | 它自己的 why 逐字，`it` → `A number` | 与上一行同文 |
| `thincoder-core/prompts/advisor-round1.md` | 1 | 同第 4 行字面 | 逐字，`it` → `A number` | 同 |
| `thincoder-core/prompts/advisor-round2.md` | 1 | 同 | 同 | 同 |
| `thincoder-core/prompts/advisor-round3.md` | 1 | 同 | 同 | 同 |
| `thincoder-core/prompts/persona-eng-designer.md` | 1 | `the user alone fires them`，冒号后写「你准备并提醒、用户来发、你等」 | 逐字，句首 `a` → `A` | `never what makes it yours` |

### A11 · 邻居行未动（上下行各一锚）

| 处 | 上一行锚 | 下一行锚 |
|---|---|---|
| `thincoder-core/prompts/common.md` | `**An assertion has two sources only**…` 行 | `"Known behavior…"` 起头的 why 行 |
| `thincoder-core/prompts/consult-base.md` | `**An assertion has two sources only**…` 行 | `Why: "Known behavior…"` 行 |
| `thincoder-core/prompts/persona-plan.md` | `Ground the plan in reality…` 项 | `- Make steps concrete and verifiable` 项 |
| `thincoder-core/prompts/advisor-design.md` 第 1 处 | `**An assertion has two sources only**…` 行 | `**Where the source is readable**…` 行 |
| `thincoder-core/prompts/advisor-design.md` 第 2 处 | `**Cite with the file path plus the exact words**…` 行 | `**A citation you did not read/verify is marked unverified**…` 行 |
| `thincoder-core/prompts/advisor-round1.md` ∥ `advisor-round2.md` ∥ `advisor-round3.md` | 同 advisor-design 第 1 处的上下两锚 | 同左 |
| `thincoder-core/prompts/persona-eng-designer.md` | `**Do not edit prompts**…` 行 | `- **Practice deposit**` 项 |

条目 13 零触：锚 `name the file together with the section heading that owns it` 在盘。

### 验证：命令与输出（原样）

**① §2 探针 · 红侧（落笔前，八档一次跑）**

```text
{"common.md":{"C1":false,"C2":false,"C3":1,"C4":false,"C6":false},"consult-base.md":{"C1":false,"C2":false,"C3":1,"C4":false,"C6":false},"persona-plan.md":{"C1":false,"C2":false,"C3":1,"C4":false,"C6":false},"persona-eng-designer.md":{"C1":false,"C2":false,"C3":0,"C4":false,"C6":false},"advisor-design.md":{"C1":false,"C2":false,"C3":1,"C4":false,"C6":false},"advisor-round1.md":{"C1":false,"C2":false,"C3":1,"C4":false,"C6":false},"advisor-round2.md":{"C1":false,"C2":false,"C3":1,"C4":false,"C6":false},"advisor-round3.md":{"C1":false,"C2":false,"C3":1,"C4":false,"C6":false}}
C7 four-advisor-identical: false
```

**② §2 探针 · 绿侧（第 9 处落笔后；八处落笔后读数与此相同）**

```text
{"common.md":{"C1":true,"C2":true,"C3":1,"C4":true,"C6":true},"consult-base.md":{"C1":true,"C2":true,"C3":1,"C4":true,"C6":true},"persona-plan.md":{"C1":true,"C2":true,"C3":1,"C4":true,"C6":true},"persona-eng-designer.md":{"C1":true,"C2":true,"C3":1,"C4":true,"C6":true},"advisor-design.md":{"C1":true,"C2":true,"C3":1,"C4":true,"C6":true},"advisor-round1.md":{"C1":true,"C2":true,"C3":1,"C4":true,"C6":true},"advisor-round2.md":{"C1":true,"C2":true,"C3":1,"C4":true,"C6":true},"advisor-round3.md":{"C1":true,"C2":true,"C3":1,"C4":true,"C6":true}}
C7 four-advisor-identical: true
```

**③ A11 · C5 邻居锚**

```text
{"common.md":{"C5":true,"C5control":false},"consult-base.md":{"C5":true,"C5control":false},"persona-plan.md":{"C5":true,"C5control":false},"persona-eng-designer.md":{"C5":true,"C5control":false},"advisor-design.md":{"C5":true,"C5control":false},"advisor-round1.md":{"C5":true,"C5control":false},"advisor-round2.md":{"C5":true,"C5control":false},"advisor-round3.md":{"C5":true,"C5control":false}}
```

**④ A12 与另三个控制样本**

```text
clean        {"C1":true,"C2":true,"C3":1,"C4":true,"C6":true}
why-deleted  {"C1":true,"C2":true,"C3":1,"C4":true,"C6":false}
blank-line   {"C1":true,"C2":false,"C3":1,"C4":true,"C6":true}
xref         {"C1":true,"C2":true,"C3":1,"C4":false,"C6":false}
```

**⑤ 第 9 处自查（用户裁定的三条）+ 三个读红控制**

```text
SELF-CHECK: {"head1":true,"head2":true,"head1_mark":true,"head2_mark":true,"replacement_in_both":true,"closing_in_both":true,"closing_count_file":2,"ownwhy_kept":true,"old_pronoun_gone":true,"entry6why_count":1,"reader_no_notice_count":1}
CONTROL ownwhy (expect false): false
CONTROL old_pronoun_gone (expect false): false
CONTROL closing_in_both (expect false): false
```

三条控制各自把目标文本改坏一处后读红，故这三条判据不是恒绿。`closing_count_file = 2` 即两处封口句同文。

**⑥ doc_check 交付门（显式 docs = 八档，整档入判）**

```text
DOC-CHECK GATE: PASS
范围：显式 docs 8 档
判据：逐段检查——文字太长，难于阅读
结论：0 段有问题（8 档全清）
```

**⑦ 改动面与零触面**

```text
thincoder-core/prompts/advisor-design.md       | 12 ++++++++++--
 thincoder-core/prompts/advisor-round1.md       |  6 +++++-
 thincoder-core/prompts/advisor-round2.md       |  6 +++++-
 thincoder-core/prompts/advisor-round3.md       |  6 +++++-
 thincoder-core/prompts/common.md               |  8 ++++++--
 thincoder-core/prompts/consult-base.md         |  6 +++++-
 thincoder-core/prompts/persona-eng-designer.md |  4 +++-
 thincoder-core/prompts/persona-plan.md         |  6 +++++-
 8 files changed, 44 insertions(+), 10 deletions(-)
--- zero-touch ---
(empty = zero change)
```

零触三档，逐档零 diff：

- `thincoder-core/prompts/discipline-engineering.md`（D4 / D10 详述面）
- `docs/core/design/DOC-DISCIPLINE.md`
- `thincoder-core/prompts/persona-engineering.md`

### 越界与遗留

- **越界改动：无。**改动文件全部落在 spawn 声明的写域内；除本节（§5）外未写任何文件。
- **本轮未处置（不属用户裁定范围）**：`thincoder-core/prompts/advisor-round2.md` 与 `thincoder-core/prompts/advisor-round3.md` 各另有一句同类「只禁不给形」的禁令（round2 的 `Line numbers alone are NOT evidence` 项、round3 的 `a line number is not evidence` 项）。裁定只点 advisor-design 那一处，故未动；已作为评审 🟡 报出，等设计席 / 父侧处置。
- **§2 的笔不在本席**：§2 写「不再有留在批外的禁令句」与在盘事实不符这一笔，父侧已记 §1、设计席收正 §2；本席未改 §2。

### 协议轮次与终态

- **内部偏离审计**（explore，read-only）**1 轮**：结论「无偏离」；另抛两条知会，其一是第 9 处的发现，其二是「§5 尚空」。
- **内部代码评审**（advisor，code 轨）**1 轮**：pass——🔴 0 · 🟡 5 · 🔵 3。第 1 条（advisor-design 的 `## Citation Discipline` 残留）经用户裁定后于本轮落笔，已闭合；第 5 条（§5 为空）由本节写入闭合；第 2 · 3 · 4 条留待设计席 / 父侧裁；第 6 · 7 条为非阻塞知会。
- **自修轮次 0**：审计与评审都未产出「实施偏离设计」的条目；第 9 处是按用户裁定做的范围扩笔，不是修缺。
- **终态：clean。**

### 续轮 · 第 10 / 11 处（父侧裁定 ① 「收进本批，同一形改」）

**裁定来源**：父侧本轮口径「收进本批，同一形改」。两处 = `thincoder-core/prompts/advisor-round2.md` 的 `Line numbers alone are NOT evidence` 那一项、`thincoder-core/prompts/advisor-round3.md` 的 `a line number is not evidence` 那一项。

**判据同前**：**承载禁令的那一项自身必须带替代品**——与上一轮第 9 处同一判据、同一族。

**⇒ 改动面由「8 档 9 处」变为「8 档 11 处」；文件数不变（仍是 8 档）。**

#### 改动（逐处对照）

| 档 | 处 | 题眼替代品 | why 处置 | 封口句 |
|---|---|---|---|---|
| `advisor-round2.md` | 2（第 10 处） | `identify the target by a stable name`，符号（函数 / 常量 / 字段 / 消息 / 节标题）；无符号则「文件 + 拥有它的节名」 | 逐字，句首 `one` → `One` | `while the name stays findable` |
| `advisor-round3.md` | 2（第 11 处） | 与上一行同一字面 | 逐字，句首 `one` → `One` | 同上 |

**两处都是整行替换**：原一行 ⇒ 目标五行，仅按行宽折行（两档最长行 296 字符，无一行超 300）。

**两处的落点不同**：

- round2 的那一项是 `Rules:` 下的独立列表项。
- round3 的禁令句住在该项的 `**Why**:` 行里，同项上一行已给出正向写法 `quote the exact line content`。
- **共同点**：只换承载禁令的那一行，上下行零触。

#### why 各留各的（父侧点名别做过的一步）

两处 why 原句一字不差，都是 `one line inserted above shifts every position below it: every citing file must be recomputed, and the work grows with the number of referrers`。

但**收尾后续各异**：

- round2 续 `; findings without a fresh quoted line are treated as unverified and will not be accepted.`
- round3 就此收句。

⇒ 按口径两处各保各的，**只把句首 `one` 提成 `One`**（替代品移到题眼破折号后，why 从句中另起）。若统一成一份，两档就各丢一句自己的话。

#### 三条自查（父侧指定）

| # | 判据 | 读数 |
|---|---|---|
| ① | 两档题眼都带替代品 | 探针两档 `C1 = true`（题眼行含 `identify the target by a stable name`） |
| ② | 两档封口句与另四档同文 | 两档段内逐字含同一封口句；advisor 系列 7 处（另四档 5 处 + 本次 2 处）逐处比读 = 全同 |
| ③ | 原有 why 除代词外一字未变 | 两档均 `why identical except initial pronoun case: true` |

#### 上抛② 的裁定（父侧口径，记在此处给下一位读者）

**「节 + 逐字」与「路径 + 逐字」并列不是缺陷，不改字。**理由：**路径定位文件，节定位文件里的那一条**；两句并读得到的是「路径 + 节 + 逐字引文」，不是两个互斥选项。

**上一句给来源坐标，这一句给引用形态，本就该同时在场**：`common.md` 段内 `the file path plus the exact words` 与 `the document section together with its exact words` 并存，本批零改。

#### 验证：命令与输出（原样）

**① 探针 · 红侧（落笔前，8 档 11 处一次跑）**

```text
{"common#1":{"C1":true,"C2":true,"C3":1,"C4":true,"C6":true},"consult-base#1":{"C1":true,"C2":true,"C3":1,"C4":true,"C6":true},"persona-plan#1":{"C1":true,"C2":true,"C3":1,"C4":true,"C6":true},"persona-eng-designer#1":{"C1":true,"C2":true,"C3":1,"C4":true,"C6":true},"advisor-design#1":{"C1":true,"C2":true,"C3":1,"C4":true,"C6":true},"advisor-design#2":{"C1":true,"C2":true,"C3":1,"C4":true,"C6":true},"advisor-round1#1":{"C1":true,"C2":true,"C3":1,"C4":true,"C6":true},"advisor-round2#1":{"C1":true,"C2":true,"C3":1,"C4":true,"C6":true},"advisor-round2#2":{"C1":false,"C2":false,"C3":1,"C4":false,"C6":false},"advisor-round3#1":{"C1":true,"C2":true,"C3":1,"C4":true,"C6":true},"advisor-round3#2":{"C1":false,"C2":false,"C3":1,"C4":false,"C6":false}}
```

两处新点四判据齐红的原因 = 封口句收尾锚 `stays findable` 在改动前不存在，被替换段取不出来；`C3 = 1` 说明 why 改动前已在盘、只出现一次。

**② 探针 · 绿侧（两处落笔后，同一命令）**

```text
{"common#1":{"C1":true,"C2":true,"C3":1,"C4":true,"C6":true},"consult-base#1":{"C1":true,"C2":true,"C3":1,"C4":true,"C6":true},"persona-plan#1":{"C1":true,"C2":true,"C3":1,"C4":true,"C6":true},"persona-eng-designer#1":{"C1":true,"C2":true,"C3":1,"C4":true,"C6":true},"advisor-design#1":{"C1":true,"C2":true,"C3":1,"C4":true,"C6":true},"advisor-design#2":{"C1":true,"C2":true,"C3":1,"C4":true,"C6":true},"advisor-round1#1":{"C1":true,"C2":true,"C3":1,"C4":true,"C6":true},"advisor-round2#1":{"C1":true,"C2":true,"C3":1,"C4":true,"C6":true},"advisor-round2#2":{"C1":true,"C2":true,"C3":1,"C4":true,"C6":true},"advisor-round3#1":{"C1":true,"C2":true,"C3":1,"C4":true,"C6":true},"advisor-round3#2":{"C1":true,"C2":true,"C3":1,"C4":true,"C6":true}}
C7 four-advisor-identical: true
{"spots":11,"files":8,"A1_common":true,"A2_consult":true,"A3_plan":true,"A4_advisor4":true,"A5_designer":true,"A6_C1_all":true,"A7":true,"A8_C4_all":true,"C6_all":true,"C6_failing":[]}
```

**③ 封口句同文（advisor 系列 7 处，逐处比读）**

```text
closing-same-in-advisor-spots: [true, true, true, true, true, true, true]
```

**④ A11 · C5 邻居锚（十处：原八档 + 本次两处的上下行）**

```text
{"common.md":{"C5":true,"C5control":false},"consult-base.md":{"C5":true,"C5control":false},"persona-plan.md":{"C5":true,"C5control":false},"persona-eng-designer.md":{"C5":true,"C5control":false},"advisor-design.md":{"C5":true,"C5control":false},"advisor-round1.md":{"C5":true,"C5control":false},"advisor-round2.md":{"C5":true,"C5control":false},"advisor-round3.md":{"C5":true,"C5control":false},"advisor-round2.md#2":{"C5":true,"C5control":false},"advisor-round3.md#2":{"C5":true,"C5control":false}}
C5 all true: true | C5control all false: true
```

本次两处新增的锚，上下各一条：

- round2 上一行 = `- **Every "Unfixed" or "New" entry MUST quote the exact line content from THIS round's` `` `read` `` `output**`
- round2 下一行 = `- **Host verification**: your citations are mechanically checked against the CURRENT file state`
- round3 上一行 = `**Findings without a fresh quoted line** are treated as unverified and will not be accepted.`
- round3 下一行 = 同 round2

**⑤ 控制样本（段内就地改坏，判据三个方向都读红）**

先记一次失败，因为它本身是读数：

- **首版控制的三个改坏样本没读到红。**
- `why-word-changed` 命中的是 round2 段 A 的同字串（`replace` 无 `/g`，先命中前一处）。
- `xref-injected` 的模式在盘面根本不存在（段落里没有 `(section heading)` 这个带括号的形式）。

⇒ **改成「只在被替换段内改坏」再跑**：

```text
=== advisor-round2.md  (Line numbers alone are NOT evidence)
  clean                  changed: false {"C1":true,"C2":true,"C3":1,"C4":true,"C6":true}
  why-word-changed       changed: true  {"C1":true,"C2":true,"C3":0,"C4":true,"C6":false}
  why-pronoun-reverted   changed: true  {"C1":true,"C2":true,"C3":1,"C4":true,"C6":false}
  closing-deleted        changed: true  {"C1":true,"C2":false,"C3":1,"C4":false,"C6":false}
  blank-line             changed: true  {"C1":true,"C2":false,"C3":1,"C4":true,"C6":true}
  xref-injected          changed: true  {"C1":true,"C2":true,"C3":1,"C4":false,"C6":false}
=== advisor-round3.md  (**Why**: a line number is not evidence)
  clean                  changed: false {"C1":true,"C2":true,"C3":1,"C4":true,"C6":true}
  why-word-changed       changed: true  {"C1":true,"C2":true,"C3":0,"C4":true,"C6":false}
  why-pronoun-reverted   changed: true  {"C1":true,"C2":true,"C3":1,"C4":true,"C6":false}
  closing-deleted        changed: true  {"C1":true,"C2":false,"C3":1,"C4":false,"C6":false}
  blank-line             changed: true  {"C1":true,"C2":false,"C3":1,"C4":true,"C6":true}
  xref-injected          changed: true  {"C1":true,"C2":true,"C3":1,"C4":false,"C6":false}
```

`why-word-changed` 那行是本次的 A12 等价读数：**why 被改一个词，`C1 / C2 / C4` 仍全绿、只有 `C6` 转红**——整段等价仍是唯一抓得住改 why 的判据。

**⑥ A12 复跑（`common.md`，同一命令同一判据）**

```text
A12 mutation actually applied: true
A12 clean       {"C1":true,"C2":true,"C3":1,"C4":true,"C6":true}
A12 why-deleted {"C1":true,"C2":true,"C3":1,"C4":true,"C6":false}
```

**⑦ 三条自查的读数（父侧 ③ 的机械面）**

```text
advisor-round2.md why identical except initial pronoun case: true
  max line length: 296 | lines >300: 0
  closing sentence present verbatim: true
advisor-round3.md why identical except initial pronoun case: true
  max line length: 296 | lines >300: 0
  closing sentence present verbatim: true
```

**⑧ doc_check 交付门（显式 docs = 八档，整档入判）**

```text
DOC-CHECK GATE: PASS
范围：显式 docs 8 档
判据：逐段检查——文字太长，难于阅读
结论：0 段有问题（8 档全清）
```

**⑨ 改动面与零触面**

```text
thincoder-core/prompts/advisor-design.md       | 12 ++++++++++--
 thincoder-core/prompts/advisor-round1.md       |  6 +++++-
 thincoder-core/prompts/advisor-round2.md       | 12 ++++++++++--
 thincoder-core/prompts/advisor-round3.md       | 12 ++++++++++--
 thincoder-core/prompts/common.md               |  8 ++++++--
 thincoder-core/prompts/consult-base.md         |  6 +++++-
 thincoder-core/prompts/persona-eng-designer.md |  4 +++-
 thincoder-core/prompts/persona-plan.md         |  6 +++++-
 8 files changed, 54 insertions(+), 12 deletions(-)
--- zero-touch ---
(empty = zero change)
```

零触三档逐档零 diff：`discipline-engineering.md` · `docs/core/design/DOC-DISCIPLINE.md` · `persona-engineering.md`。条目 13 零触：锚 `name the file together with the section heading that owns it` 在盘。

#### 越界与遗留（续轮）

- **越界改动：无。**本轮只动 spawn 声明的两档 + 本节（§5）。
- **范围由 9 处扩到 11 处是父侧裁定，不是自扩。**
- **与 §2 的关系**：§2 的验收表 A1–A12 钉的是九处；**第 10 / 11 处不在 §2 的验收表内**，其验收由父侧本轮口径给出（三条自查 + A1–A12 复跑 + doc_check）。§2 不是本席的笔，未改。
- **本席未处置**：无新发现。

### 续轮 · 改前 / 改后逐字对照（闭合内部评审第 3 条）

**为什么补这一块**：内部代码评审指出，自查 ③ 的读数 `why identical except initial pronoun case: true` **基线已不在盘**——改动前的快照不在树内，下一位读者无法独立复核。

⇒ 把两处改前 / 改后整行贴在此处，让 ③ 变成可复核读数。

**改前（本轮落笔前 `read` 读得，各一行）**：

```text
- **Line numbers alone are NOT evidence** — one line inserted above shifts every position below it: every citing file must be recomputed, and the work grows with the number of referrers; findings without a fresh quoted line are treated as unverified and will not be accepted.
```

```text
  **Why**: a line number is not evidence — one line inserted above shifts every position below it: every citing file must be recomputed, and the work grows with the number of referrers.
```

**改后（在盘，空白归一后）**：

```text
- **Line numbers alone are NOT evidence — identify the target by a stable name**: a symbol (function / constant / field / message / section heading); when no symbol exists, the file together with the section heading that owns it. One line inserted above shifts every position below it: every citing file must be recomputed, and the work grows with the number of referrers; findings without a fresh quoted line are treated as unverified and will not be accepted. Reading the line and then citing it is not a way out: the number dies the moment anything is inserted above it, while the name stays findable.
```

```text
  **Why**: a line number is not evidence — identify the target by a stable name: a symbol (function / constant / field / message / section heading); when no symbol exists, the file together with the section heading that owns it. One line inserted above shifts every position below it: every citing file must be recomputed, and the work grows with the number of referrers. Reading the line and then citing it is not a way out: the number dies the moment anything is inserted above it, while the name stays findable.
```

**③ 怎么复核**：把改前那句的 `one line inserted above` 与改后同位置比读——差一个字符（`o` → `O`）；why 其余部分逐字未动，round2 的尾巴 `; findings without a fresh quoted line are treated as unverified and will not be accepted.` 仍在原位。

**三处新增的只有两样**：题眼破折号后的替代品（含冒号后两句写法）与段末封口句——与上一轮九处同一形，未加第三样东西。

### 续轮 · 协议轮次与终态

- **内部偏离审计（explore，read-only）1 轮**：`DIVERGENCE: none`，五条轴全过（两处都改到位 ∥ 各自 why 保留 ∥ 邻居行未动 ∥ 域外零改 ∥ 9→11 扩面在 §5 有据）。
- **内部代码评审（advisor，code 轨）1 轮**：`VERDICT: pass`——🔴 0 · 🟡 2（均标 optional，非 must-fix）· 🔵 1。
- **自修轮次 1**：只修记录面（评审 🔵 第 3 条）——即上一节的改前 / 改后对照。
- **终态：clean。**

#### 评审两条 🟡 的处置

**第 1 条（§2 验收表仍是九处口径）→ 上抛，不在本席的笔。**

§2 是设计席的段，本席不改。**风险要说清**：

- §2 的 A4 按档判 `C6 = true`，而 `C6` 的取段起点是含题眼的那一行 ⇒ **每档只取得到第一处**。
- §6 若只复跑 §2 的 A1–A12，会在**漏掉本次两处**的判据上读绿。
- **§6 的验收基线应取本节「② 探针 · 绿侧」的 11 点读数**（键含 `advisor-round2#2` ∥ `advisor-round3#2`）。

**第 2 条（round3 的替代品未加粗）→ 接受不改，理由具名。**

- 该句住在 `**Why**:` 行内，round3 全档的 `Why:` 行都是纯文本（同档其余 `Why:` 行同样无加粗）。
- round2 那处是列表项题眼，该档题眼本就加粗 ⇒ **两处各自随本档局部排印，不是同一档内的漂移**。
- 父侧三条自查不含强调面；①「题眼带替代品」在纯文字面已成立。

## §6 验证与收口（父代理）

### 验收（父侧独立复核，不看实施席读数）

**复核方式**：不信它自己的绿，用另一把尺子数一遍——按「题眼出现次数 ∥ 封口句出现次数」逐档数，与它报的 11 处对照。

```
题眼  封口句  档
  1      1    common.md
  1      1    consult-base.md
  1      1    persona-plan.md
  2      2    advisor-design.md
  1      1    advisor-round1.md
  2      2    advisor-round2.md
  2      2    advisor-round3.md
  1      1    persona-eng-designer.md
────────────────────────────
  11     11
```

**读法**：**题眼 11 = 封口句 11 ⇒ 每一处禁令都配了一句封口，一处不多一处不少。** 若某处只落禁令未落封口，两个数就会不等。

**验收基线**：**取 §5「② 探针 · 绿侧」的 11 点读数**（含 `advisor-round2#2` ∥ `advisor-round3#2`），不取 §2 那张九处表——理由见 §1「判据的射程按文件算、按表算，而问题按处算」。

### 集成交付

**`none`**——本批改的是提示词文本，不动任何运行期代码，不改变任何业务可观察结果；`test/RTM.md` 的故事行无一行断言 system prompt 文本或其装配等价性。
**⟹ 未做集成测试验证，父侧收口这一跑就是本批唯一的集成面。**

### 遗留（评审留的 8 条黄蓝，本批不阻塞、已登记去向）

- **§2 九处表与 11 处实际的差额** ⇒ 已在本节「验收基线」处理（基线改取 11 点）。
- **§2.9 读数段的陈旧计数（A1 四枚 / A4 四枚）** ⇒ 与本条同源，基线改取 §5 后不再作判据，**随批档冻结**。
- **A2 的 `A2_cap` 探针名与命令不符** ⇒ 同上，随批档冻结；**判据实体由 `A1_cap` 承载，未失覆盖**。
- **设计档侧的三行续行计数（§6.9 ∥ §6.64 ∥ D-PS56 写「三行」而实物七行）** ⇒ **真债，另记台账 `#2218`**（写偏了四处，改一次即可，但属设计档笔域）。
- **§6.73 的 `298` 残留与 §2.6 的旧计数尺** ⇒ 属另一批（`small-machinery-purge`）的收正范围，**不在本批**。

### 核销

- 台账行 **`#2214`（citation-form-inline）**：实施完成 → 收口 → 核销。
- **覆盖账 = #2214**。
