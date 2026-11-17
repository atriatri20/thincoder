# 2026-11-08 · 判据自喂
> 六段，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 每段只有一个作者：作者的段可 `append` 加内容、可就地改（`edit`）；非作者一概拒。
> 编制：主 agent · 2026-11-08 · 来源 = 用户 2026-11-08 08:19 裁「B」——「我写要判什么，不写读数怎么取」。承接 `2026-11-08-ledger-sweep` 批四轮评审里连出四种判据自喂形态（改前读数=改后值 ∥ 基线不在盘 ∥ grep 命中判据自己 ∥ 一个数两条互斥指令）。。
> 台账 = #2169（PROMPT-SYSTEM · 归批）。前情 = 无（独立批）。
## §1 讨论（主 agent）
**状态行**：已收口 2026-11-08
<§1 模板占位：本批条目 / 关键判据 / 授权口径>
## §2 批次任务与设计（eng-designer）
**状态行**：设计完成（修正轮已落：七条判据各带红侧（`AC-3` 改前读数为命令真印的 `null`、红侧由反向控制与样本两枚证明；`AC-4` 在本节表上真跑，改前 4 行 ∥ 修后 0 行；落点单立 `AC-7`）· 三处落点按 `F2` 顺序 · 弃用一条证不出红侧的候选判据，见 §4 末）


**本节约定**：`§2.N` = 本节第 N 个小节；本节内不带前缀的 `§N` 一律指 `§2.N`。`记录 §N` 指本档六段。设计档的机制小节一律直写标题形（`### 6.84`），不带 `§`——它本轮还没落盘，写成 `§N` 就是一枚指不到的死指针。

### 1 本批条目（覆盖）与射程

**批次目标（一句话）**：让设计席在交付前自己发现「这条判据从没红过」——每条判据带一个它自己跑出来的红侧读数，与判据放在同一处。

| # | 条目 | 覆盖 | 落点 |
|---|---|---|---|
| 1 | 设计席每条判据交付前自证会红；证明办法由设计席选，红侧读数记在批档 §2 的判据旁 | ✅ 覆盖 | 三处，按 `F2` 顺序见 §2；终稿四行逐字见 §3 围栏甲 |

**不覆盖（明列，父侧裁「别扩大」）**：

- 不治「判据写得长」、不治「评审轮次多」——本批只治「判据从没红过」。
- 不动 `thincoder-core/prompts/common.md`、不动需求档、不动任何台账行、不动本档别段。

**来源**：`docs/batches/2026-11-08-ledger-sweep.md` 的 `§2` 与 `§3` 四轮评审——同一病四轮换形：改前读数写成改后值 ∥ 基线写「见某表」而该表无那一列 ∥ `grep` 不锚定、判据自己命中 ∥ 一个数被写成两条互斥指令。

### 2 三处落点与落地顺序（机制记录并进本批）

**父侧裁决（2026-11-08）**：本批原只落提示词四行，机制记录上抛另批。父侧改裁**并进本批**——理由是窗口期：「分两批做会留一个窗口——条款已落、机制记录未落，而下一个人从提示词里看到这条规矩、在机制档里找不到它为什么在那。」

**三处落点（`F2` 顺序 · 一件不拆）**

| 顺 | 档 | 落什么 | 谁落 | 何时 |
|---|---|---|---|---|
| ① | `docs/core/design/PROMPT-SYSTEM.md` | 新小节 `### 6.84`：机制记录（要件见 §3） | 设计席（`D1`：设计档归设计席笔） | 实施轮之先 |
| ② | `thincoder-core/prompts/persona-eng-designer.md` | 四行，插在 `## Five-step workflow` 第 3 步那块之后（逐字见 §3 围栏甲） | 实施轮 eng-coder | ① 落盘之后 |
| ③ | `docs/batches/2026-11-08-criteria-self-feed.md` | 本节围栏甲 = ② 的逐字来源 | 本席 | 本轮已落 |

**为什么不能反过来**：`F2` 定的是记录在前。

依据 `docs/core/design/PROMPT-SYSTEM.md`「改规则 → 先改机制文档 → coder 依它改 EN（产品代码面）」

先改提示词再补记录，窗口期内这条规矩在提示词面已生效、在机制面查不到出处——下一个人读到它，要么以为它是凭空加的，要么以为它已被废弃；两种误读都不产生任何红灯，而这条规矩的全部价值就在于有人真的照它跑一次。**顺序本身是那条规则的一部分。**

**`### 6.84` 的位置**：接在现档最后一个机制小节 `### 6.83`（三席互锁）之后、同档 `## 8. 提示词承载` 之前。

**与 `### 6.79` 的分工（`D2` 划界，两节不互为副本）**：

- `### 6.79` 治**通用面**：任何一条判据，改前要在不通过那侧跑一次。它的 `Q1` 已点到设计轮这一侧——「先说出那侧是哪一侧（改前的状态 ∥ 本该被拒的输入 ∥ 还不存在的那一行）」。
- **`Q3` ∥ `Q4` 正对着设计轮的状态，而它们给出的出路不是造红侧**：依据 `docs/core/design/PROMPT-SYSTEM.md`「改前跑不了（域 ∥ 口径没定死）」⇒ 处置 = 先定域与口径，定不下来的部分报「未判」；依据同档「空范围不算通过」⇒ 处置 = 报「判了 0 个」。
- **照这两条，设计席可以完全合规地把每条判据写成「未判」或「判了 0 个」**：诚实、可核、一条都不会红，批次带着零个红侧读数收口。它们让缺口**被记录**，本批让它**被造出来**——报「未判」是承认没跑，造出红侧是把它跑了。这一句是本批真正新增的那一半。
- 本批治**设计轮里被判物尚不存在**这一特定空隙：`Q1` 那第三支没有现成对象可跑，**红侧要造出来，不是找出来**。
- 故 `### 6.84` 是 `Q1` 第三支的兑现办法，不是 `### 6.79` 的第二次申明。

**既有件三问（`none found` 逐串实扫 · 照 `### 6.83` 的形）**

- `existing` = `thincoder-core/prompts/common.md`「A reading that can only come out one way has verified nothing」那一块 · consumers = 两模式全部角色（该档全角色加载）⇒ 本条**不换写它、不改它一字**，只在设计席人格档另起一条。
- 分工（一句）：那句话判的是「一条读数会不会变」，读者是任何写读数的人；本条的判域是**判据写作的那一刻**，补的是「判不出来时怎么造出那一侧」。同病根（数不能变即无判据），本条补 `Q3` ∥ `Q4` 留下的那一步。
- 同族第二句（`existing`）= 依据 `thincoder-core/prompts/common.md`「The failing side is recorded, not narrated」——它要求把命令与输出并排记下；本批补的是**那一次运行在设计轮里根本跑不起来时**的取法。
- `none found` = 新题眼 `A criterion you have not watched fail is not yet a criterion` 与三条新探针串（`failing side has to be built rather than found` ∥ `one number takes one type` ∥ `not watched fail`）在 `thincoder-core/prompts/` 全 17 档逐串实扫 ⇒ 零命中（本席本轮）⇒ 不重名、不撞旧句。

### 3 机制设计

**病根（一句）**：既有原则要求「到会失败的地方跑一次」，而设计席写判据时**被判的东西还不存在**——失败侧没有现成对象可跑。于是「跑过了」在设计轮里从不兑现，而写下来的每一条看上去都像判据。

依据 `thincoder-core/prompts/common.md`「A reading that can only come out one way has verified nothing」——原则在位，且明确要求「run it where it is expected to fail」。缺的不是原则，是**设计席这一侧怎么把它兑现**。

**两种红侧取法（不用凭空造缺陷）**：

- **反向控制**：同一命令对一个**必须被命中**的样本跑一次，证明它有本事打印别的数（本批 §4 的 AC-3 就是这么证的）。
- **基线在盘**：把基线逐字抄在判据旁，并说明「本次运行不可能产回它」。

**自察三问（写的时候就能答，答不上即判据未成立）**：

| # | 问 | 答「是」意味什么 | 对应形态 |
|---|---|---|---|
| 1 | 红侧读数与期望读数是不是同一个数 | 这条判据没有红侧 | 改前读数写成改后值 |
| 2 | 基线是不是只靠交叉引用指过去 | 基线不在盘，收口只能拿现值比现值 | 基线写「见某表」而表里无该列 |
| 3 | 一个数是不是同时被要求「重算」与「逐字冻结」 | 两条互斥指令，执行侧无法同时满足 | 一个数两条互斥指令 |

**第四条形态以更窄的形落进终稿第四行，不是重述（父侧 2026-11-08 裁定）**

- 依据 `thincoder-core/prompts/common.md`「a search whose own string carries the answer」——那是**通用描述**，说的是检索本身：串自带答案，两个字符决定绿红。
- 终稿第四行的后半说的是**判据这一侧**：探针的计数只能来自目标档，不能来自判据自己的措辞。同族（同一个病根：读数由自己的措辞给出），判域不同（一个判检索串，一个判红侧读数的来处）。
- 两处并存不算第二份副本（`D2`）：删掉第四行，设计席就拿不到那个当场可做的形——共性描述换不来一个能做的动作；而 `AC-3` 判的只是**字面**（四条形状串逐串 0），语义分工住本节、不被机判冒充。

**设计档 `### 6.84` 的记录要件（本轮定内容 · 落盘归下一轮设计席笔）**

父侧界 = 本轮只写落点与记录内容，不改设计档。故 `### 6.84` 该有什么在这里定死：下一轮设计席照此落笔，实施席照围栏甲落提示词。

| # | 记录要件 | 内容（不得省、不得改语义） |
|---|---|---|
| 1 | 题眼一句 | 设计轮里被判物还不存在：红侧要造出来，不是找出来 |
| 2 | 来源 | 用户 2026-11-08 08:19 裁「B」——「我写要判什么，不写读数怎么取」；前批四轮评审连出四种自喂形态（`docs/batches/2026-11-08-ledger-sweep.md`） |
| 3 | 病根 | 既有原则要求到会失败的地方跑一次，而设计席写判据时被判的东西还不存在——于是「跑过了」在设计轮里从不兑现 |
| 4 | 两种红侧取法 | 反向控制（同一命令对必须被命中的样本跑一次）∥ 基线在盘（逐字抄在判据旁，并说明本次运行不可能产回它） |
| 5 | 自察三问 | 红侧读数与期望读数是不是同一个数 ∥ 基线是不是只靠交叉引用指过去 ∥ 一个数是不是同时被要求重算与逐字冻结 |
| 6 | 与 `### 6.79` 的分工 | 照 §2 那五条：通用面 ∥ `Q3` ∥ `Q4` 的出路是记录而非造 ∥ 特定空隙 ∥ 兑现 `Q1` 第三支 |
| 7 | 逐字终稿 | 逐字等于本章围栏甲四行——口径 = **去折行后逐字相等**（同 `docs/core/design/PROMPT-SYSTEM.md` 的 `### 6.83` 的 `A2`）；同一个对象只有一个权威形 |
| 8 | 验收 | 每条带红法（照 `### 6.79` ∥ `### 6.83` 的形）；至少两条：终稿四行在人格档落一处、两处逐字相等 |
| 9 | 边界 | 不**逐字**重述 `thincoder-core/prompts/common.md` 块 ① 的四条形状串（`D2`）· 第四形以更窄的形落进终稿第四行（同族、判域不同，见 §3）· 不点工具名 · 不给判据模板 · 不新建机检门 |

**一条硬约束**：第 7 件的围栏块与本章围栏甲逐字相等——本批 `AC-6` 判的正是这一处（设计档围栏 ↔ 人格档落地块），两处用同一把尺子（去折行后逐字）。

**落点（插入点逐字 · 两对锚，后一对不依赖任何别批）**

- 前锚（本席本轮实读）依据 `thincoder-core/prompts/persona-eng-designer.md`「leaves that deletion unchecked by anyone」——**已在盘**：`### 6.83` 的终稿甲两行就住在该档上，故无「待别批落盘」的前置。
- 后锚依据 `thincoder-core/prompts/persona-eng-designer.md`「4. **Write the design**」。
- 备用前锚（不依赖 `### 6.83`）依据 `thincoder-core/prompts/persona-eng-designer.md`「leave the chain out of this line」。
- `AC-7` 钉的是「块在两枚前锚的**较后者**之后、后锚之前」：终稿甲哪天被删，备用前锚仍立；两枚一起取不到 ⇒ 读 `null`，不给绿也不误绿。
- 同位置已住着 `### 6.83` 的终稿甲，本块紧随其后、自成一段，原块一字不动。

**逐字终稿 · 围栏甲（唯一权威目标形 · 四行 · 自成一段）**

```text
**A criterion you have not watched fail is not yet a criterion**: the design seat writes it before the thing it judges exists, so where that thing is not on disk yet the failing side has to be built rather than found — and that gap is one a design can carry four unfalsifiable criteria through.
Build it one of two ways and record the output beside the criterion: run the probe against a control sample it must hit, so the same command is seen to print something else; or quote the baseline verbatim and show this run cannot produce it.
A baseline reached by cross-reference is not on disk — the column has to exist before the criterion can compare against it — and one number takes one type, recomputed from a stated formula or frozen verbatim, never both.
A criterion whose red-side reading and expected reading come out the same has no red side, so the two have to be able to differ; and a probe's count has to come from the target rather than from the criterion's own wording.
```

**四样各落在哪一句**（只点位置，正文不重述）：

| 要求 | 落在哪一句 |
|---|---|
| 义务本身（设计席写判据时失败侧还不存在，故那侧要造） | 第一行：`the design seat writes it before the thing it judges exists` ＋ `where that thing is not on disk yet the failing side has to be built rather than found` |
| 两种取法 + 红侧读数落在判据旁 | 第二行：`run the probe against a control sample it must hit` ∥ `quote the baseline verbatim and show this run cannot produce it` ＋ `record the output beside the criterion` |
| 基线在盘 ∥ 一个数一种型 | 第三行：`A baseline reached by cross-reference is not on disk` ＋ `one number takes one type … never both` |
| 红侧与期望同数即无红侧（两半各带自己的补救句） | 第四行前半：`come out the same has no red side` ＋ `the two have to be able to differ` |
| 探针的计数只能来自目标档 | 第四行后半：`a probe's count has to come from the target rather than from the criterion's own wording` |

### 4 本批自己的判据（每条带红侧 · 读数本席实跑 · 每条带跑者与时点）

**判域纪律**（本批自守）：目标档判据（`AC-1` ∥ `AC-2` ∥ `AC-3` ∥ `AC-5` ∥ `AC-6` ∥ `AC-7`）只读三份目标档，不读本档——否则本节引用的探针串会让判据命中自己，这正是本批要治的第四形。**唯一例外 = `AC-4`**：它的对象就是本节判据表本身（判「两格能不能相比」），故它按表格单元解析、不按字符串计数；例外只此一条。

| # | 判据 | 跑什么 / 期望什么 | 改前读数（本席实跑） | 红在什么读数上 | 跑者 ∥ 时点 |
|---|---|---|---|---|---|
| AC-1 | 终稿甲在人格档正好落一处 | 命令 ①：`A1_block` = **1** | `A1_block` = **0**（探针在目标档上现在读到 0 · 本席本轮实跑） | 0（未落）∥ ≥ 2（写两处）⇒ 红 | 本席（交付前）∥ 实施轮（落地后复跑） |
| AC-2 | 块形：正好四行 · 自成一段 · 每行 ≤ 300 字符（提示词面逐行判、无结构豁免） | 命令 ①：`A2_lines` = **4** ∧ `A2_prevBlank` = **true** ∧ `A2_maxLen` ≤ **300** | `A2_lines` = `null`（块未落 ⇒ 不给绿）；`A2_prevBlank` = `null`；`A2_maxLen` = `null`。落盘前预检（读本章围栏四行）= 4 行 · 最长 **294**（本席本轮实跑） | 取不到块 ⇒ 印 `null`（不给绿）；`A2_lines` ≠ 4 ⇒ 红；`A2_prevBlank` = `false`（块没自成一段）⇒ 红；`A2_maxLen` > 300 ⇒ 红 | 本席（交付前预检）∥ 实施轮（落地后复跑） |
| AC-3 | 终稿不**逐字**重述 `thincoder-core/prompts/common.md` 块 ① 的四条形状串（判字面；语义分工见 §3） | 命令 ①：`A3_restated` = **0** ∧ `A3_control` = **4** ∧ `A3_sample` ≥ **1** | `A3_restated` = `null`（块未落 ⇒ 不给绿 · 本席本轮实跑）；本章围栏四行本体实跑 `A3_restated` = **0**（基线在盘）；`A3_control` = **4**；`A3_sample` = **1** | 落地块出现任一形状串 ⇒ > 0 即红；`A3_control` < 4 ⇒ 探针失活 ⇒ 红；`A3_sample` = 0 ⇒ 探针没有命中能力 ⇒ 红 | 本席（本轮实跑，改前 ∥ 样本）∥ 实施轮（落地后复跑） |
| AC-4 | 本节判据表逐行可相比：每行两格以同一把键起头，且值不同数 | 命令 ②：`A4_flagged` = **0** | `A4_flagged` = **4**（改前本表实跑：`AC-1` ∥ `AC-4` ∥ `AC-5` 取不到键，`AC-3` 两侧同数 0）；本席修后复跑 = **0** | 任一行的两格键不同 ∥ 值相同 ∥ 取不到键 ⇒ 该行计入；> 0 即红 | 本席（本轮实跑，改前与修后两枚）∥ 实施轮（重跑） |
| AC-5 | 交付门 | 命令 ③：`A5_first` = **PASS** | `A5_first` = REFUSED（控制样本**本轮乙次**实跑，三档已点名：`docs/batches/2026-11-05-line-refs-block-on-write.md` ∥ `docs/batches/2026-11-08-ledger-sweep.md` ∥ `docs/batches/2026-11-07-anchor-stock-clear.md` ⇒ 同一 gate 命令首行 `DOC-CHECK GATE: REFUSED（锚 37 条 · 行号坐标 98 处）`；本档同一命令首行 `PASS`） | 首行非 `PASS` ⇒ 红；控制样本出不了 `REFUSED` ⇒ 命令失活 ⇒ 也判红（三档任一枚不在盘，该腿先失活——复跑前先确认三档在盘） | 本席（交付前）∥ 父侧（收口复跑） |
| AC-6 | 设计档 `### 6.84` 在盘，且其围栏四行与人格档落地块逐字相等（口径 = 去折行后逐字） | 命令 ①：`A6_section` = **1** ∧ `A6_fenceEq` = **true** ∧ `A6_maxLen684` ≤ **300** | `A6_section` = **0** ∥ `A6_fenceEq` = `null`（本节与围栏都不在盘 · 本席本轮实跑） | 0（未落）∥ ≥ 2（写成两节）⇒ 红；`false`（两处文字不等）⇒ 红；`null`（任一侧取不到）⇒ 不给绿；> 300 ⇒ 红 | 落地后那一轮设计席（`AC-6` 本轮不可能为绿） |
| AC-7 | 落点（钉引文，不记行号）：块在两枚前锚的较后者之后、第 4 步标题之前 | 命令 ①：`A7_order` = **true** | `A7_order` = `null`（块未落 · 本席本轮实跑）；反向对照 `A7_control` = **false**（同一比对喂给「块落在第 4 步之后」的样本） | `false`（块落在锚外）⇒ 红；`null`（前锚取不到）⇒ 不给绿；`A7_control` ≠ `false` ⇒ 比对失活 ⇒ 也判红 | 本席（本轮实跑）∥ 实施轮（落地后复跑） |

**命令 ①（可复跑 · 纯 ASCII · 判域只读三份目标档：人格档 ∥ `common.md` ∥ 设计档；本档不入判）**

```text
node -e "const fs=require('fs');const D=fs.readFileSync('thincoder-core/prompts/persona-eng-designer.md','utf8'),C=fs.readFileSync('thincoder-core/prompts/common.md','utf8'),P=fs.readFileSync('docs/core/design/PROMPT-SYSTEM.md','utf8');const occ=(t,s)=>t.split(s).length-1;const H='**A criterion you have not watched fail is not yet a criterion**';const blk=(A,i)=>{if(i<0)return null;const o=[A[i]];let k=i+1;while(k<A.length&&A[k].trim()!==''){o.push(A[k]);k++}return o};const DL=D.split(/\r?\n/),PL=P.split(/\r?\n/);const iH=DL.findIndex(l=>l.startsWith(H));const B=blk(DL,iH);const s6=PL.findIndex(l=>l.startsWith('### 6.84 '));let s6e=s6;if(s6>=0){s6e=s6+1;while(s6e<PL.length&&!/^### /.test(PL[s6e])&&!/^## /.test(PL[s6e]))s6e++}const S6=s6<0?null:PL.slice(s6,s6e);const B6=S6?blk(S6,S6.findIndex(l=>l.startsWith(H))):null;const shape=['a search whose own string carries the answer','a pattern that matches nothing','a count with no ruler named','a run over no object at all'];const SAMPLE='C2 sample: a criterion worded so a search whose own string carries the answer decides its own result';const j=B?B.join('\n'):'';const fold=a=>a.join(' ').replace(/\s+/g,' ').trim();const A_BEFORE='leaves that deletion unchecked by anyone',A_STEP3='leave the chain out of this line',A_STEP4='4. **Write the design**';const ord=T=>{const i=T.indexOf(H),lo=Math.max(T.indexOf(A_BEFORE),T.indexOf(A_STEP3)),hi=T.indexOf(A_STEP4);return(i>=0&&lo>=0&&hi>=0)?(i>lo&&i<hi):null};const S7=A_BEFORE+'\n'+A_STEP3+'\n'+A_STEP4+'\n'+H;console.log({A1_block:occ(D,H),A2_lines:B?B.length:null,A2_prevBlank:iH>0?DL[iH-1].trim()==='':null,A2_maxLen:B?Math.max(...B.map(l=>[...l].length)):null,A3_restated:B?shape.reduce((n,s)=>n+occ(j,s),0):null,A3_control:shape.reduce((n,s)=>n+occ(C,s),0),A3_sample:shape.reduce((n,s)=>n+occ(SAMPLE,s),0),A6_section:PL.filter(l=>l.startsWith('### 6.84 ')).length,A6_fenceEq:(B&&B6)?fold(B)===fold(B6):null,A6_maxLen684:B6?Math.max(...B6.map(l=>[...l].length)):null,A7_order:ord(D),A7_control:ord(S7)})"
```

**命令 ②（`AC-4` 专用 · 判域 = 本节判据表 · 按表格单元解析，不按字符串计数）**

```text
node -e "const fs=require('fs');const B=fs.readFileSync('docs/batches/2026-11-08-criteria-self-feed.md','utf8').split(/\r?\n/);const rows=B.filter(l=>/^\| AC-\d+ /.test(l));const key=c=>{const t=c.replace(/\*\*/g,'').replace(/\x60/g,'');const m=t.match(/([A-Za-z][A-Za-z0-9_]*)\s*(?:=|\u2264|\u2265)\s*([A-Za-z0-9_.\-]+)/);return m?{k:m[1],v:m[2]}:null};const out=rows.map(l=>{const c=l.split('|');const e=key(c[3]||''),b=key(c[4]||'');const id=(c[1]||'').trim();const f=(!e||!b)?'noKey':(e.k!==b.k?'keyDiff':(e.v===b.v?'sameValue':'ok'));return id+'='+f});console.log({A4_rows:rows.length,A4_flagged:out.filter(x=>!x.endsWith('=ok')).length,rows:out.join(' ')})"
```

**命令 ③**：`doc_check(mode:"gate", docs:["docs/core/design/PROMPT-SYSTEM.md","thincoder-core/prompts/persona-eng-designer.md","docs/batches/2026-11-08-criteria-self-feed.md"])`，首行 `PASS`。

**逐条说清红侧怎么证的**：

- **AC-1** 的红侧是**已跑到的**：同一命令现在跑目标档读到 0，落盘后应读到 1。「它会红」不是句子，是这枚 0。
- **AC-2** 的红侧是**预检 + 越线样本**：本章围栏四行实读 294（≤ 300 有余量）；同一测量式喂一条 301 字符的串得 301 > 300 ⇒ 该比较不是恒绿。行数与自成一段各有一条腿：`A2_lines` 喂五行样本读 5、`A2_prevBlank` 在块前无空行时读 `false`。
- **AC-3** 是**两条腿各自证活**：`A3_control` = 4（四条形状串在 `common.md` 上逐串 1 ⇒ 探针有命中能力）；`A3_sample` = 1（喂一段确实重述了第一形的样本 ⇒ 计数能从 0 走到 1）。基线在盘：围栏四行本体实跑 0。改前 `A3_restated` = `null` 是命令印出来的东西——块缺席就不给绿，不写成 0。
- **AC-4** 是**在本节判据表上真跑的**，不是样本：改前实跑 `A4_flagged` = 4，逐行读数为 `AC-1` noKey ∥ `AC-2` ok ∥ `AC-3` sameValue ∥ `AC-4` noKey ∥ `AC-5` noKey ∥ `AC-6` ok。它当场标出了 `AC-3` 那一行（两侧同数 0）——这正是评审第 1 轮 🔴 的错误被机判抓住的那一次；修后复跑 = 0。
- **AC-5** 用**控制样本**：同一 gate 命令对三档已知带存量的档返回 `DOC-CHECK GATE: REFUSED（锚 214 条）` ⇒ 它能出 `REFUSED`；同一命令对本档读 `PASS` ⇒ 两侧都跑到过。那三档不在本批改动面内，本席只取这一枚读数、不作任何处置。
- **AC-6** 的红侧是**已跑到的**：同一命令现在读 `A6_section` = 0 ∥ `A6_fenceEq` = `null`，落盘后应读 1 ∥ `true`。比对口径 = 去折行后的段比对，与 `### 6.83` 的 `A2` 同口径。第三条腿（落地块 ↔ 本章围栏甲）不在此立：一条判据读本节围栏即自喂，那一步由提示词面批次收尾的既有比对承担。
- **AC-7** 的红侧是**反向对照**：同一比对喂给「块落在第 4 步之后」的样本得 `false` ⇒ 它判得出锚外；现盘块未落 ⇒ `null`，不给绿。两枚前锚任一缺席不误绿也不误红——另一枚仍立。

**弃用的一条候选判据（自曝 · 父侧要求「证不出来就写明并换掉」）**：

- 候选 = 「终稿块内零处文档引用，`scripts/prompt-refs-check.mjs` 全零」。
- **证不出它的红侧**：终稿本身零引用，跑它恒为 0 命中；要证它会红，只有两条路——往提示词面先写一处引用（等于先造缺陷），或读该脚本的判据面另立反向样本。两条都超出本批射程。
- ⇒ **不作为判据**，只作实施轮跑一次的报告项（不改任何判据的通过条件）。

### 5 受影响文件与测试覆盖

| 档 | 层 | 改什么 | 谁改 |
|---|---|---|---|
| `docs/core/design/PROMPT-SYSTEM.md` | 设计档（机制面 · 单源） | 新小节 `### 6.84`（记录要件见 §3） | 下一轮设计席（`D1`），先于下行 |
| `thincoder-core/prompts/persona-eng-designer.md` | 提示词（产品代码面，运行期加载） | 新增一段四行（逐字见 §3 围栏甲） | 实施轮 eng-coder |
| `docs/batches/2026-11-08-criteria-self-feed.md` | 批档（本档） | 本节 | 本席 |

**零改动的面**：源码 ∥ 测试 ∥ 需求档 ∥ `thincoder-core/prompts/common.md` ∥ `thincoder-core/prompts/discipline-engineering.md` ∥ 四份评审档 ∥ 台账——一行不动。

**分层结论**：本批无档跨分层——改动面 = 一份设计档 + 一份提示词档 + 本节，全为 `.md`，运行期代码零改，无拆分计划。

**测试覆盖**：本批无单测文件（不改行为，无被测对象）。验收 = §4 的命令与读数；跑者与时点写在表末列——实施轮复跑 `AC-1` ∥ `AC-2` ∥ `AC-3` ∥ `AC-4` ∥ `AC-7`，`AC-6` 归落地后那一轮设计席，`AC-5` 归本席交付前与父侧收口。

**集成用例（RTM delta）**：**破行 0 · 冗余 0 · 新增 0**——本席本轮**逐行走查** `test/RTM.md` 的故事索引（37 行故事行逐行实读；各故事的用例文件正文本轮未读，`unverified`）。

索引里每行的标题即它断的那件事；与评审 ∥ 提示词相邻的六行如下（其余 31 行是工具 ∥ 台账 ∥ 循环 ∥ 端面）：

| 行 | 它断什么（照索引标题） | 本笔为何不断它 |
|---|---|---|
| CLI 24 评审的方法论符合度不再恒空 | 评审消息里注入的标准块可观察 | 断消息组装面，不断 system prompt 文本 |
| CLI 27 评审写一笔 §3 就够：状态行由工具置位 | §3 写入回执与状态行置位 | 断工具面写盘回执 |
| CLI 17 评审没写进批档就不算过 | 评审是否落盘 | 断批档写面，不读提示词 |
| CLI 5 顾问评审超时改了马上生效 | 超时配置生效 | 断配置面 |
| CLI 6 设计评审的文档范围按项目根受理 | 评审文档范围受理 | 同上 |
| CLI 32 advisor guard 的提醒到顶就停 | 提醒计数与未评审出声 | 断循环面计数 |

两条入口均不成立：① 不改任何既有用例断言的业务可观察结果（37 行里无一行断提示词文本或其等价性）；② 未新增业务上真需要的场景——「设计席下次写判据会不会照第四行跑」从业务入口复现不出可机判结果。

**最近先例（对齐 ∥ 偏离）**：

- **先例** = `docs/core/design/PROMPT-SYSTEM.md` 的 `### 6.83` 落点 ①（设计席终稿甲就住在同一插入点）∥ `### 6.82`（一条规则 + 落点表 + 逐字围栏 + 每条验收带红法 + 每条带跑者）。
- **对齐** = 同插入点、同「一条规则自成一段」的形、每条验收带红侧读数与跑者、围栏块内零文档引用。
- **偏离** = 先例的红侧多是**落地后**才读到的数；本批把**落地前**那枚 0 记进「改前读数」列，并把自审判据（`AC-4`）真正跑在本节表上，而不是跑在样本上。

**勘察证据行（本席本轮实读）**：

- 原则在位：依据 `thincoder-core/prompts/common.md`「A reading that can only come out one way has verified nothing」
- 插入点前一行：依据 `thincoder-core/prompts/persona-eng-designer.md`「leaves that deletion unchecked by anyone」
- 插入点后一行：依据 `thincoder-core/prompts/persona-eng-designer.md`「4. **Write the design**」
- 备用前锚：依据 `thincoder-core/prompts/persona-eng-designer.md`「leave the chain out of this line」
- 本席不得亲改提示词：依据 `thincoder-core/prompts/persona-eng-designer.md`「**Do not edit prompts**: the English runtime prompt is product code」
- 公共源勘察：`PROJECT-MANIFEST.json` 的 `index.publicRepos` 实读 = `[]` ⇒ 工作目录内无独立公共源文档仓——**已查，无相关**。
- 新题眼 `none found` 实扫：`thincoder-core/prompts/` 全 17 档，四条串（题眼 ∥ `not watched fail` ∥ `failing side has to be built rather than found` ∥ `one number takes one type`）逐串零命中（本席本轮实跑）。
- **数据事实核查**：本设计对数据无断言（无行数、无字段、无枚举取自数据）⇒ 无此句。§4 的读数是命令输出，不是数据事实。

### 6 关键决策

| # | 决策 | 取它 | 拒掉的替代 | 理由 |
|---|---|---|---|---|
| K1 | 义务落在第 3 步之后，不落在第 5 步的收尾清单里 | ✔ | 在第 5 步「Pre-review check」加第六腿 | 收尾清单是要打勾的；判据的红侧是**写的时候**决定的，写完之后补不出来。同档已有前例：终稿甲也住第 3 步之后。落点由 `AC-7` 钉住——`AC-1` 的计数兜不住位置 |
| K2 | 红侧取法给两条（反向控制 ∥ 基线在盘），不给一条 | ✔ | 只写「跑一次会失败的」 | 设计席的失败侧常不存在；只写原则等于把那条原则原样再发一遍（父侧裁「这批补的不是原则」） |
| K3 | 第四条形态以更窄的形落进终稿第四行，不删它 | ✔ | 删掉第四行 ∥ 四形在终稿里全写 ∥ 缩成一句离终稿远的判域纪律 | 父侧 2026-11-08 裁：删了设计席就拿不到那个当场可做的形；全写是第二份副本。取中间——同族（同一病根）、判域不同（块 ① 判检索本身，第四行判读数来处），字面判据 `AC-3` 只管字面 |
| K4 | 机制记录并进本批，且按 `F2` 顺序先记录后提示词 | ✔ | 分两批（机制记录另起一批 · 先落提示词再补记录） | 父侧 2026-11-08 改裁：分两批留一个窗口——条款已落、机制记录未落，下一个人从提示词里看到规矩、在机制档里找不到它为什么在那；两种误读都不产生红灯 |
| K5 | 本批判据自带「改前读数」一列 | ✔ | 只写「红在什么读数上」 | 前者是自己跑过的数，后者是一句可能性——本批治的正是这两者的区别 |
| K6 | `AC-4` 是判域纪律的唯一例外：判对象 = 本节判据表 | ✔ | 只留目标档判据、自审不立判据 ∥ 让样本代表整张表 | 本批治的「两侧同数」正发生在表里；不立判据就只能靠评审眼撞（上一轮正是评审撞上的）。例外只此一条，故纪律仍立；它读的是表格单元、不数正文字符串，不走第四形那条路 |
| K7 | 落点单立 `AC-7`（钉两枚前锚），不并进 `AC-1` | ✔ | 靠 `AC-1` 的计数兜住落点 | 块挪到第 4 步之后，`A1_block` 照样读 1——计数判不出位置；位置与计数是两件事（`### 6.79` 的 `A2` 同形） |

### 7 边界（本节不做）

① 不改 `thincoder-core/prompts/common.md`、不改 `thincoder-core/prompts/discipline-engineering.md`、不改四份评审档——提示词面只落设计席人格档这一份。

② 本轮不改 `docs/core/design/PROMPT-SYSTEM.md`：只在本节定落点与记录要件，`### 6.84` 的正文归下一轮设计席笔。

③ 不新建机检门：§4 的七条是验收命令，不是新门；`doc_check` 判据一字不动。

④ 不写反例清单、不点工具名、不给判据模板——一条规则，不做成体系。

⑤ 不治判据写得长、不治评审轮次多。

⑥ 不动本档别段（记录 §1 ∥ 记录 §3–§6 各归其作者）。

⑦ 不写台账（`add` / `update` / `close` 是父侧的笔）。

### 8 上抛项

**1 〔知会 · 语言面〕** 用户给的是中文，落笔为英文面（运行面语言纪律）；四样判据逐句对照见 §3 的落点表。

**2 〔知会 · 本批自曝一处〕** §4 末尾记了一条证不出红侧、因而被弃用的候选判据。本批治的正是「证不出来」这件事，所以本席撞上它时不掩饰、写成条文：**证不出即换掉，不留在判据表里占位**。

**3 〔知会 · 修正轮改了什么〕** 评审第 1 轮 🔴 按父侧裁法改：`AC-3` 的改前读数写成命令真印的 `null`，红侧改由 `A3_control` = 4 与 `A3_sample` = 1 两枚实跑证明。两处由评审建议直接派生的改动：`AC-4` 从样本改为在本节表上真跑（改前 4 行、修后 0 行），落点单立 `AC-7`。

**4 〔知会 · 顺序待实施轮分两次派单〕** 三处落点里 ① 与 ② 是两个笔域（设计档归设计席、提示词归 eng-coder），同一轮要分两次派单，且 ① 必须先落——顺序由 `AC-6` 兜住（`A6_section` 为 0 时 `A6_fenceEq` 只能是 `null`，不给绿）。

**5 〔知会 · 落点 ① 已落盘〕** `### 6.84` 已落 `docs/core/design/PROMPT-SYSTEM.md`（§6.83 之后、`## 8. 提示词承载` 之前）；本节围栏与本章围栏甲去折行逐字相等（命令实跑 = `true`），围栏四行实读 294 ∥ 241 ∥ 220 ∥ 222，节标题计数 1。实施轮可以派 ② 了。

**6 〔知会 · 两处按纪律微调〕** ① 记录要件 2 的批档指针（前批四轮评审所在档）不落进 `### 6.84`：设计档不引批档（引向随批档删除而断，方向只能批档 → 状态档），来源改按用户原话 ＋ 四种自喂形态的内容写，语义未减。② `AC-5` 原读数（`锚 214 条`）无可复跑的三档点名，本轮按现盘存量最高的三档重量，见 `AC-5` 那格。

## §3 设计评审（评审子代理）
**状态行**：评审通过（第 2 轮：上一轮 13 条全部处置（🔴 1 已修 · 🟡 7 修 ＋ 1 父侧裁定认下 · 🔵 3 修 ＋ 1 评审限制）；新增 🟡 2 · 🔵 2 均不阻断；未结 🔴 0）



### 轮次 1（评审子代理）

**第 1 轮结论表（逐条）**

| # | 严重度 | 状态 | 证据（指针） |
|---|---|---|---|
| 1 | 🔴 | 待处置 | AC-3 行：期望「`A3_restated` = **0**」与改前读数「`A3_restated` = **0**」同数；而同一条命令的 AC-2 格写「`A2_maxLen` = `null`（块未落）」——同一个缺席块，命令 ① 的 `A3_restated:B?…:null` 只会印 `null` |
| 2 | 🟡 | 建议 | AC-4 行「同法扫本表：两列逐行比」：表内无「改后期望」列、未给命令、只在「三行样本」上演示——唯一能抓第 1 条的判据自己不可执行 |
| 3 | 🟡 | 建议 | K1「义务落在第 3 步之后」无判据兜住：AC-1 只判 `A1_block` 计数，落点即使跑到第 4 步之后仍读 1（对照 §6.79 的 `A2` 钉引文） |
| 4 | 🟡 | 建议 | §3「**第四条形态不在终稿里重述**」与围栏甲第四行「a probe that also matches the criterion's own words」并存；AC-3 是逐串比对，改写形读 0 |
| 5 | 🟡 | 建议 | §2「它的 `Q1` 已经点到设计轮这一侧」只引 Q1；同表 Q3「改前跑不了」与 Q4「空范围不算通过」正对着本状态，未引未驳 |
| 6 | 🟡 | 建议 | 新题眼无既有件三问；最近既有题眼 = `thincoder-core/prompts/common.md` 块 ① 的「A reading that can only come out one way has verified nothing」，分工段未点名 |
| 7 | 🟡 | 建议 | §3「同位置已住着 `### 6.83` 的终稿甲」＋「前一行依据…leaves that deletion unchecked by anyone」：该块在 §6.83 表内归「实施轮 eng-coder」，本设计未声明落盘状态、无备用锚 |
| 8 | 🟡 | 建议 | §5「**破行 0 · 冗余 0 · 新增 0**」与同节「本席本轮**未逐行走查」（`unverified`）并存——继承结论当作本改动的 delta |
| 9 | 🟡 | 建议 | §4 判据表无「跑者 ∥ 时点」列（§6.79 ∥ §6.83 的验收表都有）；AC-6 本轮不可能为绿，§5 只写「验收 = §4 的命令与读数」 |
| 10 | 🔵 | 知会 | 围栏甲第一行「the failing side has to be built rather than found」普遍化；判据对象已在盘时（AC-2 读同档现最长行）该句读作禁止直接跑 |
| 11 | 🔵 | 知会 | 围栏甲第四行补救句「write both so the count can only come from the target」只对后半（探针）成立 |
| 12 | 🔵 | 知会 | 要件 7「逐字等于 §3 围栏甲四行」与 AC-6 的 `fold` 去折行比对是两把尺子：重折行过的 6.84 围栏过 AC-6、不过要件 7 |
| 13 | 🔵 | 知会 | 评审上下文无文档地图、无项目标准档 ⇒ 文档归属按本档自身惯例与 `AGENTS.md` 判，属限制非缺陷 |

**计数**：🔴 1 · 🟡 8 · 🔵 4（阻断 1）。

VERDICT: changes-required

### 轮次 2（评审子代理）

**第 2 轮（修正轮核验）结论表 —— 只核上一轮 13 条 ＋ 看修正有没有引入新题**

| # | 严重度 | 状态 | 证据（指针） |
|---|---|---|---|
| 1 | 🔴 | 已修 | AC-3 行改前读数「`A3_restated` = `null`（块未落 ⇒ 不给绿」≠ 同行期望「`A3_restated` = **0**」；三腿 `A3_control` = **4** ∧ `A3_sample` ≥ **1**；§4 末「改前 `A3_restated` = `null` 是命令印出来的东西——块缺席就不给绿，不写成 0」 |
| 2 | 🟡 | 已修 | AC-4 行「`A4_flagged` = **4**（改前本表实跑…）；本席修后复跑 = **0**」＋命令 ② 逐格取键（`keyDiff` ∥ `sameValue` ∥ `noKey`）＋「**AC-4** 是**在本节判据表上真跑的**，不是样本」 |
| 3 | 🟡 | 已修 | 新增 `AC-7`（`A7_order` = **true** ∥ 反向对照 `A7_control` = **false**）；K1「落点由 `AC-7` 钉住——`AC-1` 的计数兜不住位置」 |
| 4 | 🟡 | 已认（父侧裁定） | §3「**第四条形态以更窄的形落进终稿第四行，不是重述（父侧 2026-11-08 裁定）**」＋「`AC-3` 判的只是**字面**（四条形状串逐串 0），语义分工住本节、不被机判冒充」 |
| 5 | 🟡 | 已修 | §2「**`Q3` ∥ `Q4` 正对着设计轮的状态，而它们给出的出路不是造红侧**」＋「报「未判」是承认没跑，造出红侧是把它跑了。这一句是本批真正新增的那一半」 |
| 6 | 🟡 | 已修 | §2「**既有件三问（`none found` 逐串实扫 · 照 `### 6.83` 的形）**」＋`existing` 两件（`thincoder-core/prompts/common.md` 两句题眼）＋「逐串实扫 ⇒ 零命中」 |
| 7 | 🟡 | 已修 | 落点节「——**已在盘**：`### 6.83` 的终稿甲两行就住在该档上，故无「待别批落盘」的前置」＋「备用前锚（不依赖 `### 6.83`）」＋`AC-7` 收「较后者」 |
| 8 | 🟡 | 已修 | §5「本席本轮**逐行走查** `test/RTM.md` 的故事索引（37 行故事行逐行实读…）」＋六行近面表（`CLI 24` ∥ `CLI 27` ∥ `CLI 17` ∥ `CLI 5` ∥ `CLI 6` ∥ `CLI 32`） |
| 9 | 🟡 | 已修 | 判据表末列「跑者 ∥ 时点」＋§5「实施轮复跑 `AC-1` ∥ `AC-2` ∥ `AC-3` ∥ `AC-4` ∥ `AC-7`，`AC-6` 归落地后那一轮设计席，`AC-5` 归本席交付前与父侧收口」 |
| 10 | 🔵 | 已修 | 围栏甲第一行改作「so where that thing is not on disk yet the failing side has to be built rather than found」 |
| 11 | 🔵 | 已修 | 围栏甲第四行「so the two have to be able to differ; and a probe's count has to come from the target rather than from the criterion's own wording」 |
| 12 | 🔵 | 已修 | 要件 7「口径 = **去折行后逐字相等**（同 `docs/core/design/PROMPT-SYSTEM.md` 的 `### 6.83` 的 `A2`）」＋硬约束「两处用同一把尺子（去折行后逐字）」 |
| 13 | 🔵 | 已认（评审限制） | 本轮上下文无文档地图 ∥ 无项目标准档 —— 属评审限制，非设计缺陷 |
| N1 | 🟡 | 新 | AC-5 行「控制样本**本轮**实跑：三档带存量的档，同一 gate 命令返回 `DOC-CHECK GATE: REFUSED（锚 214 条）」——样本档未点名，读数不可复跑；§2 已引「**The failing side is recorded, not narrated**」作既有件 |
| N2 | 🔵 | 新 | §4「**唯一例外 = `AC-4`**」与 AC-2「落盘前预检（读本章围栏四行）= 4 行」∥ AC-3「本章围栏四行本体实跑」并存 |
| N3 | 🔵 | 新 | AC-4 逐行读数止于「`AC-5` noKey ∥ `AC-6` ok」——表内已有 `AC-7`，且未记 `A4_rows` |
| N4 | 🟡 | 新 | §4 末「**弃用的一条候选判据（自曝 · 父侧要求「证不出来就写明并换掉」）**」整块逐字重复两次 |

**计数**：上一轮 13 条 = 🔴 1 已修 · 🟡 8（7 修 ＋ 1 父侧裁定认下）· 🔵 4（3 修 ＋ 1 评审限制认下）；本轮新增 🟡 2 · 🔵 2；**未结 🔴 = 0**。

VERDICT: pass

## §4 用户批准（主 agent）

**用户批准**：2026-11-08 08:29，用户原话「自动跑完」——批内整链一次走完，不再逐步请批。

**批的是什么**：`§2` 的判决（设计轮的红侧要造出来，不是找出来）+ 两种兑现法（反向控制 ∥ 基线在盘）+ 逐字终稿四行 + 七条判据 + 三处落点与落地顺序。

**评审侧**：`§3` 轮次 2 判 `pass`（2026-11-08 08:48）；轮次 1 为 `changes-required`（1🔴 + 8🟡 + 4🔵）。

**落地范围（三处，按 `F2` 顺序）**：

| 顺 | 档 | 谁落 | 状态 |
|---|---|---|---|
| ① | `docs/core/design/PROMPT-SYSTEM.md` 新增 `### 6.84` | 设计席 | 已落 |
| ② | `thincoder-core/prompts/persona-eng-designer.md` 四行 | 实施席 eng-coder | 已落 |
| ③ | 本档 `§2` 围栏甲 = ② 的逐字来源 | 设计席 | 已落 |

**父侧对两处上抛的裁**（设计席在落 `§6.84` 时报的）：

- **`AC-5` 控制读数换掉**：原记的 `锚 214 条` 复跑不出来，改成点名三档重量的读数。裁「认」——要的是可复跑，不是某个具体数；旧数留着才是本批要治的那种读数。
- **记录要件 2 的批档指针不落进 `### 6.84`**：裁「认」——状态档引批档，指针随批档删除而断。来源改按用户原话与四形内容写，语义未减。

## §5 实施记录（eng-coder）
**状态行**：实施完成（落点 ② 已落 · 实施轮复跑 AC-1/2/3/4/6/7 全绿 · 审计与代码评审各 1 轮，终态 clean，修正 0 轮）



### 落点（本席唯一一处改动）

| # | 档 | 改了什么 | 谁落 |
|---|---|---|---|
| ② | `thincoder-core/prompts/persona-eng-designer.md` | `## Five-step workflow` 第 3 步那段之后新增四行、自成一段（§2 围栏甲的逐字落地） | 本席（eng-coder） |

- 位置：前锚甲之后、后锚之前，前后各一空行。两枚锚按引文取，不记行号。

  依据 `thincoder-core/prompts/persona-eng-designer.md`「leaves that deletion unchecked by anyone」

- 落点 ①（`### 6.84`）本席开工前核实已在盘，未重复落——`F2` 的记录在前因此成立。

  依据 `docs/core/design/PROMPT-SYSTEM.md`「### 6.84 判据自喂：设计轮里红侧要造出来，不是找出来」

**改了几个字**：一行未改字。四行按 §2 围栏甲原样落：未调标点、未改大小写、未重排折行、未加缩进、无行尾空格。

### 逐字比对（三处同一形）

批档 §2 围栏甲四行 ∥ 设计档 `### 6.84` 围栏四行 ∥ 人格档落地块四行：本轮逐行比对全等（命令 ① 的 `A6_fenceEq` = `true` 是同一件事的机判）。

差异只有围栏框架：本档围栏块紧接收尾反引号，设计档围栏内多留一空行再收尾——两处内容四行本身逐字相同，按空行分块的比对口径不受影响。

### 实施轮复跑读数（命令原样复跑 · 绝对数留在命令输出）

| 判据 | 命令 | 落地前 | 落地后 | 结论 |
|---|---|---|---|---|
| AC-1 | 命令 ① `A1_block` | 0 | 1 | ✅ |
| AC-2 | 命令 ① `A2_lines` ∥ `A2_prevBlank` ∥ `A2_maxLen` | null ∥ null ∥ null | 4 ∥ true ∥ 294 | ✅ |
| AC-3 | 命令 ① `A3_restated` ∥ `A3_control` ∥ `A3_sample` | null ∥ 4 ∥ 1 | 0 ∥ 4 ∥ 1 | ✅ |
| AC-4 | 命令 ② `A4_flagged`（`A4_rows` = 7） | 4（设计席改前） | 0 | ✅ |
| AC-6 | 命令 ① `A6_section` ∥ `A6_fenceEq` | 0 ∥ null | 1 ∥ true | ✅ |
| AC-7 | 命令 ① `A7_order` ∥ `A7_control` | null ∥ false | true ∥ false | ✅ |
| 交付门（单档） | `doc_check(mode:"gate")`，docs = 人格档，首行 | — | `PASS` | ✅ |
| 交付门（本批三档） | `doc_check(mode:"gate")`，§2 命令 ③ 的原样三档口径，首行 | — | `PASS` | ✅（收口复跑仍归父侧） |
| 弃用候选（报告项 · 非判据） | `node scripts/prompt-refs-check.mjs` | — | J1/J2/J3 零命中 · exit 0 | ✅ |

- `AC-3` 三条腿都在：`A3_control` = 4（探针有命中能力）· `A3_sample` = 1（计数能从 0 走到 1）· `A3_restated` = 0（落地块一条形状串都不含）。
- `AC-7` 两条腿都在：`A7_order` = true，反向对照 `A7_control` = false（比对判得出锚外，不是恒绿）。
- 弃用候选那条按 §2 的处置只跑一次、作报告项，不改任何判据的通过条件；读数顺带说明落地块本身零文档引用（无 `.md` token、无 `§`）。

### 交付表（§2 的要求点逐条）

| # | 状态 | 要求点 |
|---|---|---|
| 1 | ✅ Done | 落点 ② 四行逐字落进人格档，与 §2 围栏甲、`### 6.84` 围栏三处同形 |
| 2 | ✅ Done | 落点在第 3 步之后、第 4 步之前（两枚前锚的较后者之后 ＋ 后锚之前） |
| 3 | ✅ Done | 块形：四行、自成一段、每行 ≤ 300、无缩进 |
| 4 | ✅ Done | 实施轮复跑 `AC-1` ∥ `AC-2` ∥ `AC-3` ∥ `AC-4` ∥ `AC-7`，全部为绿 |
| 5 | ✅ Done | 交付门首行 `PASS`（单档 ∥ 三档两种口径各一次） |
| 6 | ✅ Done | 弃用候选判据只跑一次、作报告项，未混进判据表 |
| 7 | ✅ Done | 未越界：只改一个档；设计档、`thincoder-core/prompts/common.md`、`thincoder-core/prompts/discipline-engineering.md`、需求档、台账、本档别段一行未动 |

### 内部审计 ∥ 代码评审（轮次与终态）

- 内部 explore 偏差审计 **1 轮**：五面（判据满足 ∥ 逐字相等 ∥ 形状串与文档引用 ∥ 边界遵守 ∥ 要求真落地非近似）全过，终态 `clean`。
- 内部 advisor 代码评审 **1 轮**：`VERDICT: pass`，两条不阻断项（🟡 协调项 = 本段当时为空，本轮已补；🔵 = 第二行「旁边」的落档，归设计席裁）。
- 修正轮 **0 轮**：两条都不指向本席可改的文本——一条是本段自身，一条要改的是逐字终稿，本席不改。
- 终态：`clean`（收敛，无未结阻断项）。

### 上抛项

1. 〔知会 · 措辞落差 · 不阻断〕§2 项目行写「证明办法由设计席选」，落地第二行写 `Build it one of two ways`；`### 6.84` 与 §2 §3 的 `K2` 都把取法定死成两条。本席按设计逐字落、不擅自改口径；是否改成「由设计席选」的口气，归设计席 ∥ 父侧。
2. 〔知会 · 评审 🔵 · 不阻断〕落地第二行 `record the output beside the criterion` 在同档上下文里没有点明「旁边」是哪张档：第 3 步说判据侧 `reported to the main agent to land in the requirement doc`，第 2 步又说设计席不写需求档。本批自己的做法（判据与红侧读数成对写在自己判据表里）本身是对的，缺的只是提示词面把位置说出来。改不改归设计席裁——本席不改逐字终稿。

## §6 验证与收口（父代理）

**交付面**：四行提示词文本 + 一节机制记录 + 本档。**不改运行期代码、不改测试**，故无单测档。集成集 delta = 0（本批不产生业务可观察结果的变化；`§5` 的逐行走查给出了近面六行为什么不断）。

**父侧独立复验（不采信子代理读数）**：

| 验项 | 读数 |
|---|---|
| 三处逐字相等 | `true`——人格档四行 ∥ `### 6.84` 围栏四行，逐行 294 ∥ 241 ∥ 220 ∥ 222 |
| 落点位置 | 块在两枚前锚的较后者之后（`i` 12184 ＞ `lo` 12141）、后锚之前（＜ 13166） |
| 块形 | 前一行为空、块后紧跟空行，自成一段 |
| 工作树写域 | 改动只两个档：`docs/core/design/PROMPT-SYSTEM.md` ∥ `thincoder-core/prompts/persona-eng-designer.md`；无第三档 |
| 交付门 | `DOC-CHECK GATE: PASS`（三档全清） |

**七条判据的终态**：

| AC | 读数 | 判 |
|---|---|---|
| AC-1 | `A1_block` = 1 | 绿 |
| AC-2 | `A2_lines` = 4 · `A2_prevBlank` = true · `A2_maxLen` = 294 | 绿 |
| AC-3 | `A3_restated` = 0 · `A3_control` = 4 · `A3_sample` = 1 | 绿（三腿都在，探针没失活） |
| AC-4 | `A4_rows` = 7 · `A4_flagged` = 0 | 绿（评审席独立复跑同一读数） |
| AC-5 | `A5_first` = PASS | 绿（控制样本点名三档，`REFUSED` 腿可复跑） |
| AC-6 | `A6_section` = 1 · `A6_fenceEq` = true · `A6_maxLen684` = 294 | 绿 |
| AC-7 | `A7_order` = true · `A7_control` = false | 绿（反向对照证明比对判得出锚外） |

**已知限界（已记账，不在本批改）**：

- 四行里两处措辞没说到底：`Build it one of two ways` 把取法定死成两条、`record the output beside the criterion` 的「旁边」未点档。两条都属措辞面、不改行为；改一个字要同轮动三处并重跑 `A6_fenceEq`，属设计轮活。

**收口复检**：暂缓批复核 = 无；`§2` ↔ 设计档对账 = `§2` 的围栏甲与 `### 6.84` 围栏逐字相等（本轮实测）；`§2` ↔ `§5` 对账 = 七条判据全部由实施轮复跑且与 `§2` 期望一致；用户面文档面同步 = 未触（无用户可见能力变更）；令牌 = 本批收口时消费。
