# 2026-10-18 · prompt-EN-parity
> 六段 append-only，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 编制：主 agent · 2026-10-18 · 来源 = 用户 2026-10-18 23:32「后续都自动跑完吧」——R3（蓝图第 3 轮）：把 EN 面补齐到与 CN 设计等值，并对齐机制档。**这一轮之后，删 CN 不会丢规则**——R1 清了语言，R3 清内容差。。
> 台账 = #1682（core · 归批）。前情 = docs/batches/2026-10-18-prompt-single-face.md §2.9 R3（已收口 2026-10-18）。
## §1 讨论（主 agent）
**状态行**：已收口 2026-10-19
<§1 模板占位：本批条目 / 关键判据 / 授权口径>

### 讨论收敛（父侧 · 2026-10-18 23:48）

**用户令**：23:32「后续都自动跑完吧」。

**R3 是什么**：`prompt-single-face` §2.4 列出的 **CN 独有 46 条**（其中 **15 条承载规则**、**4 组与 EN 语义相抵**），逐条落成 EN 侧等值——或判「机制档已承载，EN 只需指认」。**R1 解决的是语言（中文散文 → 英文），R3 解决的是内容（CN 有而 EN 无的规则）。**

**四条铁律**：

| # | 铁律 | 理由 |
|---|---|---|
| 1 | **机制档已承载的 ⇒ EN 不补原文，只对齐口径**（或干脆不补） | D2 单一权威源；补 = 第三处详述 |
| 2 | **机制档没有的 ⇒ 才补进 EN** | 那是规则唯一住处 |
| 3 | **CN 有而 EN 无、但 CN 自己已失效的 ⇒ 两边都不补** | 失效表达该删，不该搬 |
| 4 | **EN 独有 29 条一律不删**（多数是理由句 / 补充细节 / 溯源日期） | 删 = 信息损失；它们已在 EN，删 CN 无风险 |

**已知的四条主线（§2.4 十五行的摘要）**：

| 线 | 内容 | 判定方向 |
|---|---|---|
| **甲** | `discipline-engineering` 5–14：**三样要写文档**（需求 / 设计 / **UAT 文档**）+ 判据「谁验收谁」+ 命名 RTM | EN 现写「Two steps write docs」= **相反**。机制档 `design/TESTING.md` §11 / `requirements/TESTING.md` §7 已有 ⇒ **EN 向机制档对齐**（补指认，不补全文） |
| **乙** | D7 **十一项**（EN 只列 6 项） | 机制档 `DOC-DISCIPLINE.md` D7 已有 ⇒ EN 补 5 项（枚举完整性） |
| **丙** | 判据 A / B（范围外不记录 + 发现须验证） | **已由 out-of-scope 批落进 EN**（`discipline-engineering:73/74` 等）；R2 已把规则本体落进 `LEDGER.md` §1.1 ⇒ R3 只需**引式指认**，不重述 |
| **丁** | `common:49` 引证范围列举收窄 · `discipline-engineering:192` D4 射程三类豁免 | 机制档已有 ⇒ EN 补句对齐 |

**边界**：CN 镜像本批**只动 `common.md:76` 一行**（父队列双闸事实收正），其余随 R5 删 · 不动机制档（R2 已落）· 不动需求档 · 不改 EN 独有内容。

### 父侧裁定（2026-10-18 23:50 · 对 `eng-designer#15` 上抛「父队列深度」冲突）

**裁定：以产品面（代码）为准，且这不只是 CN/EN 不一致——EN 面也有同一个错。**

**代码真值（父侧实读）**：

```
thincoder-core/agent-tools/parent-channel.mjs:52   export const UPSTREAM_QUEUE_MAX = 20
                                              :235    if (pending.length >= UPSTREAM_QUEUE_MAX) →
                                              :236    refused('…queue is full (20)…')
```

**三处现文对比**：

| 面 | 现文 | 判定 |
|---|---|---|
| 产品面 `tool-docs/notify_parent.md:14` | 「the parent's in-flight queue holds **≤20** messages」 | **对** |
| CN `docs/core/design/prompts/common.md:76` | 「系统形状 = 父队列深度 **1**」 | **错** |
| EN `thincoder-core/prompts/common.md:91` | 「**One ask at a time**: while an `ask` … is still waiting …, a second one is refused」 | **错**（同病：说第二条会被拒） |

**处置**：

1. **EN `common.md:91` 必须改**——这句会直接误导模型：它让模型以为“只能问一次”，实际可以排到 20 条。改后须说清：**未取走的 `ask` 可并存（≤20）**；超 20 才是明确报错；**「一次答完」的理由不是“会被拒”，而是省往返**。
2. **CN `common.md:76` 同改**（它是设计面；留假事实会在 R4 的陈述改写里继续传播）。
3. **机制档零命中**——`docs/` 全树查证只有提示词档与批次档提到，故无需机制档同步。
4. **本项并入 R3 范围**（判为「与产品面对齐」的正例，不是新增语义）。

**记一条教训**：这条错**活了两份文本**（CN 与 EN 各写一遍，且都错），**没有任何门能发现它**——因为门只查形态（锚 / 行宽），不查事实。**事实的守卫只能是“对代码读一次”。**

### 父侧撤回与改判（2026-10-18 23:53 · 我判错了，采纳设计席的落法）

**撤回上一条裁定（23:50 那段）。它基于一个不完整的代码读数。**

**代码真值（父侧重读，逐行）**：

```
parent-channel.mjs:54   export const UPSTREAM_ASK_MAX_INFLIGHT = 1
                  :228   if (kind === "ask") {
                  :230     if (mine.length >= UPSTREAM_ASK_MAX_INFLIGHT)
                  :231       return refused('… one ask at a time until the parent picks it up …')
                  :235   if (pending.length >= UPSTREAM_QUEUE_MAX)      // = 20
                  :236     return refused('… queue is full (20) …')
```

**两道闸，管两件事**：

| 闸 | 量 | 上限 | 越闸后果 |
|---|---|---|---|
| **闸二** | **同一子代理**未 drain 的 `ask` | **1** | `refused('one ask at a time')` |
| **闸三** | 父队列**总长**（所有子代理的消息） | **20** | `refused('queue is full')` |

**所以**：EN `common.md:91`「a second one is refused」= **对的**（说的是闸二）。我上一条判它错，**判错了**——只看到 `:52` 的 20 与 `:235` 的队列满，就下了结论。

**我的两个错，逐条认**：
1. **读码不全**：只翻了 `:52` / `:235`，没往下看 `:228`–`:233` 的闸二分支。
2. **否定判断又错一次**：我写「`docs/` 全树查证只有提示词档提到此事」——**不成立**。机制档 `docs/core/design/AGENT-LOOP-UPSTREAM.md:63` / `:66` 逐字写明双闸，只是**措辞不是「深度 1」**，我用关键词搜就搜不到。

**改判（采纳它的落法）**：

| 面 | 处置 |
|---|---|
| **CN** `common.md:76` | 括号改「**同一子代理未取走的 ask ≤1；父队列总长 20**」——真错只有这一处（原文写「深度 1」，把两道闸混成一道） |
| **EN** `common.md:91` | **保留**「未取走再发一条被拒」，**补**「父队列 20 / 超 20 明确报错 / 并成一条省往返」 |

**为什么不能删「被拒」句**：删了模型会真的撞闸二——**那是把对的改成错的**。

**教训升级（比上一条更硬）**：上一条我写「否定判断必须先给查过哪些面」。这次我给了查证面（`docs/` 全树搜「深度 1」），**还是错了**——因为**查的是措辞，不是概念**。改成：**否定判断必须按「机制」去找，不能按「我记得的那句话」去找**；找不到时先假设「是我搜得不对」，再下结论。

### 父侧发现（2026-10-18 23:59 · T5 的规则与语料正相抵，量级 100+）

**父侧实测（新进程扫 16 档 EN 提示词）**：

| 形 | 出现次数 | 分布 |
|---|---|---|
| `batch record §N` | **26** | advisor-design 1 · round2 1 · round3 1 · discipline-engineering 4 · persona-eng-coder 3 · persona-eng-designer 7 · persona-engineering 9 |
| 裸 `§N` | **86** | common 9 · discipline-normal 14 · persona-eng-coder 9 · persona-eng-designer 14 · persona-engineering 33 · advisor 7 |
| `*.md` 档名 | **22** | common 8 · discipline-normal 6 · advisor 4 · discipline-engineering 2 · 其余 2 |

**这意味着什么**：T5 落的规则「no **citation** (a doc name / **a section number** / a pointer sentence) may appear in **any text the model reads**」，一旦落地，**现有提示词面当场违反 100 余次**（连「batch record §2 是任务书本体」这种**工作流自己的坐标**都算违规）。

**根因（我的判断）**：这条规则的**原意是「会过期的引用」**（EN 现文 `common.md:55` 的措辞是 `a doc name or section number **goes stale**`），而 T5 把射程写成了「出现在模型读到的任何文本里」——**把「会烂的坐标」写成了「一切坐标」**。

**因此 #1 的根因也不是 T2 的括注**：`(batch record §6)` 属**机器坐标**（工作流自身的结构），本不违原意。`#18` 已按我的指令把它删成自足句——**删了不坏，但真该修的是 T5 的射程**。

**处置**：给 T5 补**射程 carve-out**（详见 §2 修正轮），并据实测计数作为设计依据；`#18` 备忘里 `discipline-engineering:6` 的 `batch record §2` 在 carve-out 下**合法**，不需改。

**教训（第四条，与前三条不同）**：前三条错在「否定判断」，这条错在**把量词写大**——「一切 / 任何 / 所有」在规则里出现时，**必须拿语料数一遍**，否则规则落地即自我违反。

## §2 批次任务与设计（eng-designer）
**状态行**：设计完成 2026-10-18
<§2 模板占位：本批条目（覆盖） / 设计档落点 / 机制设计 / 受影响文件与测试覆盖 / 验收对照 / 关键决策 / 上抛项>

### 2.1 逐条处置表（§2.4 十五行 · 基线 = `batches/2026-10-18-prompt-single-face.md` §2.4）

判定三分：**补 EN**（规则只活在 CN 提示词）· **对齐**（机制档已有，EN 只补口径句/半句，不搬原文）· **不补**（EN 已等值 ∥ CN 已失效 ∥ 非规则差异）。「改后整行」见 §2.3，编号 T1–T7。

| # | CN 坐标 | 判定 | 机制档坐标（实读） | 改后 |
|---|---|---|---|---|
| 1 | `discipline-engineering:7–14` | **补 EN**（对齐机制档口径） | `design/TESTING.md` §11（:415–620）· `requirements/TESTING.md` §7 F29/F30/F33（:212–226） | T1 |
| 2 | `discipline-engineering:195`（D7） | **补 EN**（对齐机制档 10 项；第 5 项「变更记录」不补） | `DOC-DISCIPLINE.md`:21（D7 行）· `requirements/ENGINEERING-MODE-V2.md`:608（同 10 项） | T2 |
| 3 | `persona-engineering:207–213`（判据 A 整块） | **不补**（EN 已等值） | `LEDGER.md` §1.1（:16–32） | — |
| 4 | `discipline-engineering:88/160` ∥ `discipline-normal:128` ∥ `persona-eng-designer:24–25` | **不补**（EN 三处已落 U1 定稿句） | `LEDGER.md` §1.1 | — |
| 5 | `discipline-engineering:89` ∥ `discipline-normal:129` ∥ `persona-eng-designer:26` | **不补**（EN 已等值） | `LEDGER.md` §1.1 判据 B | — |
| 6 | `discipline-engineering:192`（D4 射程） | **补 EN**（对齐机制档口径，一类一句） | `requirements/ENGINEERING-MODE-V2.md`:605（D4 行，含三类豁免逐字） | T3 |
| 7 | `discipline-engineering:151 / 156` | **不补**（EN:137 已逐条等值；EN:142 只缺「一轮一仓一档」括号短语 = 措辞差） | `DOC-DISCIPLINE.md` §自持族 | — |
| 8 | `discipline-engineering:5`（本组规则自加） | **补 EN**（唯一住处 = CN 提示词，机制档无） | 无（grep `自加` / `重新过堂` 零命中） | T4 |
| 9 | `advisor-{design,round1,round2,round3}:9` | **不补**（四档 EN:8 已落 U1 定稿句） | `LEDGER.md` §1.1 | — |
| 10 | `common:49`（引证范围） | **补 EN**（范围列举 + 「指路句」） | `DOC-DISCIPLINE.md` D4 细则二（方向面；范围列举不在其内） | T5 |
| 11 | `common:9`（不套括号） | **补 EN**（半句） | 无（属措辞纪律，无机制档） | T6 |
| 12 | `common:76`（父队列深度 1） | **改 EN 与 CN 两面**（依据 §2.9：`notify_parent` 双闸——同一子代理「未取走」的 `ask` ≤1 + 父队列总长 20；CN 括号把闸二写成了「队列深度 1」） | `parent-channel.mjs`:52 / :54 / :227–233 / :235–236 · `tool-docs/notify_parent.md`:3 / :14 · `AGENT-LOOP-UPSTREAM.md`:63 / :66 | T8 |
| 13 | `persona-eng-designer:6 / 14–15` | **不补**（CN 二式等式已由判据 A.3 作废；EN 现文即目标形态） | `DOC-DISCIPLINE.md`:15（D1 行：提示词 = 主 agent 内容权 + 落笔分述，英文代码面 = eng-coder 落笔） | — |
| 14 | `persona-eng-designer:80`（变更记录） | **不补**（CN 形态已由 D8 废除；EN:78 现文即目标形态） | `DOC-DISCIPLINE.md`:22（D8）∥ :1493（禁令句） | — |
| 15 | `advisor-design:25` | **补 EN**（补适用范围三档） | `DOC-DISCIPLINE.md`:22（D8 规范面枚举） | T7 |

**合计**：动 EN 8 条（1 · 2 · 6 · 8 · 10 · 11 · 12 · 15）· 不补 7 条（3 · 4 · 5 · 7 · 9 · 13 · 14）· 动 CN 1 处（#12 的 `common:76`）。15 = 8 + 7。

**4 组「与 EN 语义相抵」→ 表行映射**（口径 = `batches/2026-10-18-prompt-single-face.md`:75「「范围外不记录」一族（4 组相抵）」；该族 = 先例批 §2.4 的 #3 / #4 / #5 / #9 四行）：

| 相抵组 | 先例批 §2.4 行 | 本批 §2.1 行 | 处置 | EN 落点（已等值） |
|---|---|---|---|---|
| 判据 A 整块（范围外发现的入账范围） | #3 | 3 | 不补 | `persona-engineering`:202–206 |
| 范围外不记录（三档同文） | #4 | 4 | 不补 | `discipline-engineering`:73 · `persona-eng-designer`:25 · `discipline-normal`:130 |
| 「发现」= 验证过的 | #5 | 5 | 不补 | `discipline-engineering`:74 · `persona-engineering`:204 · `persona-eng-designer`:26 |
| 范围外不看 / 挡住判断才上报（评审四档） | #9 | 9 | 不补 | `advisor-design` ∥ `advisor-round1/2/3`:8 |

四组同出 U1 一处裁定（= 判据 A），EN 侧已由 out-of-scope 批落定 ⇒ 本批只核不改，无一条留待搬译。

### 2.2 四条主线的落点与理由

| 线 | 落点 | 理由 |
|---|---|---|
| **甲 · UAT 三样** | T1 改 `thincoder-core/prompts/discipline-engineering.md:4`：把「Two steps write docs (requirements / design)」改成**三样**（需求档 / 设计档 / UAT 报告）+ 一句判据「谁验收谁」 | EN:4 与 CN:7 语义相反（EN 明说测试不入文档步）。机制档 `design/TESTING.md` §11 与 `requirements/TESTING.md` §7 已把 RTM 形态 / 结构 / 签署面写全 ⇒ EN 只承载「有三样 + 判据」，不搬 §11 结构（D2）。**计量单位 = 每端一份**（cli ∥ vsc ∥ desktop），非每任务一份——`design/TESTING.md`:441 已裁「份数 = 每端一份」（签署按交付物、零跨包引用），故 T1 句内写明 one per delivery end |
| **乙 · D7 项数** | T2 补 4 项至 10 项 | 机制档 D7 = 10 项（`DOC-DISCIPLINE.md`:21 与 `requirements/ENGINEERING-MODE-V2.md`:608 两处同形同数），EN 现 6 项 ⇒ 缺 4 项：修正轮落地前置 / 搁置清单回核 / 暂缓批复核 / 用户文档面同拍。CN 的第 5 项「变更记录」**不补**——D8 已废除变更记录段，机制档 D7 亦不含该项（CN 侧属失效残留，归 R5 删 CN 时处理，本批不动 CN） |
| **丙 · 判据 A/B** | **不补、也不加 pointer** | ① EN 已等值：`discipline-engineering:73/74` · `persona-engineering:202–206`（含「不同轴」一条）· `persona-eng-designer:25/26` · `discipline-normal:130/131`；② 父侧建议的「补一句 pointer」**与同档纪律相抵**——`common.md:55`「Prompt face — no document references」禁提示词面出现档名 / 节号，故 pointer 句自身违规；机制档 `LEDGER.md` §1.1 已承载细则，EN 保持执行面原文 + 机制档为详述面 |
| **丁 · 引证范围 / D4 射程** | T5（引证范围列举 + 指路句）· T6（不套括号）· T3（D4 三类豁免）· T7（修订式表达三档范围）· T8（#12 父队列双闸，两面改） | 三类豁免的机制详情住 `requirements/ENGINEERING-MODE-V2.md`:605（逐字有）；EN:182 只剩指针形态一句 ⇒ EN 补「射程 = 指针 + 三类各归其面」的口径句，不抄 :605 全文。引证范围列举与「指路句」机制档未承载（D4 细则二只管引用方向）⇒ 补 EN |

### 2.3 改后整行（逐条逐字 · 供实施轮直接落）

**T1 — `thincoder-core/prompts/discipline-engineering.md:4`（整行替换）**
```text
1. **Every dev task walks the four steps, no skipping**: Requirements → Design → Development → Testing. **Three things are written down**: the requirement doc, the design doc, and the **UAT report** (integration testing = user acceptance testing — the one the client signs; **one per delivery end**, since the signature is per deliverable, not per task). The dividing line = **who accepts whose work**: the delivery face (the client accepts ours) keeps a document; the internal face (we accept the coder's) need not. Unit tests stay the change-time feedback loop (**the batch's unit test files** — added as you go) and leave no standing document. Jumping straight to code is wrong nine times out of ten.
```

**T2 — `thincoder-core/prompts/discipline-engineering.md:185–186`（第 7 条整条替换）**
```text
7. **D7 settlement sync** — every batch settlement runs a fixed **settlement sync checklist**: role table / status line / counts / pointers / todo check-offs
   (including the **prior-batch leftover cross-check** — entry done, its anchor batch unclosed ⇒ the **fallback settlement path**) / **fix-round landing precondition** (a correction round after implementation must have landed and been verified before close) / **shelved-list re-check** (every registered ∥ shelved item: realized ∥ move it to a new batch) / **deferred-batch re-check** (each deferred batch against its resume conditions; none ⇒ one line "deferred-batch re-check: none") / **user-doc face sync** (a user-visible capability touched ⇒ compare face by face; not touched ⇒ one line "none") / **ledger visible face (settlement line)**.
```

**T3 — `thincoder-core/prompts/discipline-engineering.md:182`（第 4 条整条替换）**
```text
4. **D4 pointer discipline** — pointer form = `doc:section` (line numbers only as of reference); NO "see above / see that section" relative pointers. **What this pointer-form rule reaches = pointers** (a citation into another doc's section). **Implementation coordinates** (a code / tool-face location) carry **their own form**: the full path from the repo root with `:line` — a bare directory segment without the repo-root part resolves ambiguously and is judged dangling. **Inventory as-of readings** (a measured line recording where things stand now) and **review evidence quotes** (a line quoted from this round's read) each belong to their own face and are outside both forms.
```

**T4 — `thincoder-core/prompts/discipline-engineering.md:3` 后插一段（置顶硬约束标题下、第 1 条前）**
```text
**This block of rules is self-added, not a user habit**: each clause here was added by us, so each must be able to answer **"which structure does it rest on, and is it worth it"** — a clause that cannot answer is a habit, not a constraint; **when the premise changes it goes back for review** — "it has always been there" does not make it right today, and treating an old conclusion as a standing ruling keeps a rule alive on a dead premise.
```

**T5 — `thincoder-core/prompts/common.md:55–56`（整块替换：规则句 + 操作数豁免行合并为一块 · 射程判据见 §2.12）**
```text
- **Prompt face — no document references**: a **citation** — any token that sends the reader to **another document** for what the sentence means (a doc name, a doc name with a section number, a `file:line` into another doc, a **pointer sentence** such as "see the design doc") — may not appear in any text the model reads (**prompt files · tool descriptions · schema text · strings returned to the model**): it goes stale, and a model reading it follows the pointer and guesses instead of reading the source, so a sentence must stand on its own; citations are **deleted, never re-pointed** (they belong in docs or comments).
  **The test — where does it point?** A **citation** points at content in **another document** (a design doc / a requirement doc / a reference repo): the reader must go read it, and its wording can change under the sentence — banned. A **machine coordinate** points at a position **inside the protocol the model is executing**, and stays: the batch-record segment it writes (`batch record §2` = the task book itself; `§1`–`§6` = the segments) · a tool parameter name it passes (`batchDoc` / `segment` / `files` / `docs`) · a ledger state it moves · this file's own section numbers — the model acts on it directly, and nothing outside can reword it.
  **Operand exemption**: `AGENTS.md` · `SKILL.md` · `README.md` · `MANIFEST.md` · `.thincoder/advisor.md` · `project_rules.md` · path forms · the `".md"` literal — names the model **reads, writes or passes**, not prose it has to chase; those stay.
```

**T6 — `thincoder-core/prompts/common.md:10`（整行替换）**
```text
Few parentheses, and **no nested parentheses** (nesting buries the main clause); no stacking of ∥ ⇒ or paired-bracket marks — tables and `file:line` when they earn their keep, prose stays prose.
```

**T7 — `thincoder-core/prompts/advisor-design.md`:66（整段替换：自 `Doc-hygiene rule` 起，至尾词 `(this actually happened).` 止）**
```text
Doc-hygiene rule (added 2026-09-18, user ruling): revision-style expressions left on the **normative face** of a **design doc / requirement doc** (`~~strikethrough~~` / "previously X ⇒ corrected Y" / corpse-marked "void / scrapped" in feature points / AC / judgment lines / discipline lines / boundaries / status statements) → 🟡 (Doc hygiene) — the invalidated expression must be **deleted** (history belongs to the record face: batch records and **git commits** — a changelog or history section inside a design / requirement doc is itself the violation). Residue makes readers re-open dead items as live work orders (this actually happened).
```

**T8 — 两面（EN `thincoder-core/prompts/common.md:91–92` 整条 · CN `docs/core/design/prompts/common.md:76` 整行）**

```text
- **One ask at a time — per child, not per parent queue**: while an `ask` of yours is still waiting in the parent's
  queue (not yet picked up), a second `ask` is refused; ask again once the parent has picked the first one up. `note`
  messages are not limited this way, and the parent's queue as a whole holds 20 messages — exceeding that is an
  explicit error, nothing is silently dropped. Two questions folded into one ask save a round trip. When unsure
  whether a question qualifies, fall back to the stop-and-report discipline above.
```

```text
- **一问一答（约定 · 同一子代理「未取走」的 `ask` ≤1；父队列总长 20）**：你的 `ask` 还留在父队列里（父尚未取走）时再发一条 `ask`，会被机械拒绝；父取走后即可再问。`note` 不受此限，父队列总长超 20 才是全局限流（明确报错，不静默丢）。两个问题并成一条问完可省一次往返。拿不准是否该问 ⇒ 回落到上面的「停下上报」纪律。
```

### 2.4 「不补」逐条理由（7 条）

| # | 理由类别 | 逐条 |
|---|---|---|
| 3 | 机制档已有 + EN 已等值 | EN `persona-engineering:202–206` 逐条在：判据 A（:202–203）· 判据 B（:204）· 唯一例外（:205）· 「与已批准设计范围不同轴」（:206）；细则住 `LEDGER.md` §1.1。§2.4 #3 写「EN 全档零对应」是 U1 落盘前的读数，已过期 |
| 4 | EN 已等值（U1 定稿） | 三处逐字 = §2.4 末定稿句（`discipline-engineering:73` ∥ `persona-eng-designer:25` ∥ `discipline-normal:130`），本批只核不改 |
| 5 | EN 已等值 | `discipline-engineering:74` 逐字在（「is not a finding, it is a guess … reading or a reproducible path」）∥ `persona-engineering:204` ∥ `persona-eng-designer:26`。§2.4 #5 「EN 全无对应句」同为过期读数 |
| 7 | EN 已等值（仅措辞差） | EN:137 已含「this round's work needs and that is missing」+「seen in passing that does not block = out of scope — not recorded, not acted on」；EN:142 只缺「一轮一仓一档」这一括号约定短语，规则义已在（separate round / write outside this repo = violation） |
| 9 | EN 已等值（U1 定稿） | 四档 `advisor-*:8` 逐字 = §2.4 定稿句（「Out-of-scope: not looked at … not a finding」） |
| 13 | CN 形态已作废 | 判据 A.3 作废「英文提示词 = 代码 ∥ 中文设计文档 = 设计文档」二式等式；EN:6/14–15 现文（English runtime face = product code）即目标形态，无规则要补 |
| 14 | CN 形态已失效 | 变更记录段已由 D8 废除（`DOC-DISCIPLINE.md`:22、:1493 禁令句）；EN:78 的「current state only」即目标形态。CN:80 属待删残留（R5 处置），不搬 |

**#12 不在本表**：已改判「改 EN 与 CN 两面」（`notify_parent` 双闸），改后整行见 §2.3 T8，事实依据见 §2.9。

### 2.5 受影响文件（实施轮 · EN 提示词面 + CN 设计面一行）

**.md 不标行数增量（豁免依据）**：标注义务的射程 = **源 / 单元测试档**（`.mjs` / `.cjs`，`DOC-DISCIPLINE.md`:225）；本表四档全是提示词 `.md`，既非源档也非测试档，且不触 500 / 800 行限 ⇒ 不列「当前行数 + 预计增量」两列。

| 文件 | 改动 | 条目 |
|---|---|---|
| `thincoder-core/prompts/discipline-engineering.md` | 4 处：T1（:4 整行）· T2（:185–186 整条）· T3（:182 整条）· T4（:3 后插段） | 1 · 2 · 6 · 8 |
| `thincoder-core/prompts/common.md` | 3 处：T5（:55–56 整块）· T6（:10 整行）· T8（:91–92 整条） | 10 · 11 · 12 |
| `docs/core/design/prompts/common.md` | 1 处：T8（:76 整行——双闸事实收正） | 12 |
| `thincoder-core/prompts/advisor-design.md` | 1 处：T7（:66 首句） | 15 |
| 其余 13 档（`persona-engineering` · `persona-eng-designer` · `discipline-normal` · `advisor-round1/2/3` 等） | 零改动 | — |

**落笔者（D1 写权矩阵 · `DOC-DISCIPLINE.md`:15）**：`thincoder-core/prompts/*` 三档 = 英文代码面 ⇒ **eng-coder 落笔**（产品代码面，实施轮）；`docs/core/design/prompts/common.md:76` 一行 = **中文设计文档面 ⇒ eng-designer 落笔**，内容权在主 agent。该行**不实施轮 coder 的笔**——coder 写它即越笔域。

**不动面（边界 · 本批唯一的 CN 边界陈述）**：CN 镜像只动 `common.md:76` 一行（T8 收正双闸事实），其余随 R5 删 CN 时一并处置 · 机制档（R2 已落，本批只读不写）· 需求档（主 agent 笔）· 产品面 `tool-docs/notify_parent.md`（本就对）· 代码（本就对）· EN 独有 29 条（一条不删）。§1 的「不动 CN 镜像（R5 删；本批不碰）」是设计改判前的旧读数，收正归 §1 作者（六段一段一作者）。

### 2.6 关键决策 · 先例 · 勘察证据

**关键决策**

| # | 决策 | 备选与否决理由 |
|---|---|---|
| K1 | 丙 线不加 pointer 句 | 备选 = 在 EN 判据 A/B 后加「mechanism home = `LEDGER.md` §1.1」。否决：`common.md:55` 禁提示词面带档名 / 节号，pointer 句自身违规；机制档与 EN 各自成面（机制档 = 详述，EN = 执行句）已满足 D2 |
| K2 | 甲 线只补「有三样 + 谁验收谁」，不搬 RTM 结构 | 备选 = 照 CN:9–11 摘译 UAT 文档形态 / 粒度 / 命名 / 签署面。否决：那些是 `design/TESTING.md` §11 的详述面（D2），搬进 EN 即第三处详述 |
| K3 | 乙 线 EN 对齐到 **10 项**（不是 CN 的 11 项） | 备选 = 照 CN 补 11 项。否决：D8 已废除变更记录段，机制档两处（设计侧 :21 / 需求侧 :608）同为 10 项；补 11 项 = 把失效项搬进 EN |
| K4 | #12 判「改两面」：CN 括号「深度 1」收正为双闸事实；EN 保留「未取走再发一条被拒」，补父队列总长 20 与「并成一条省往返」 | 备选一 = 照 CN 补「深度 1」——否决：与 `parent-channel.mjs:235`（队列 20）相抵。备选二 = 删 EN 的「再发一条被拒」——否决：与 `parent-channel.mjs:228–233`（`UPSTREAM_ASK_MAX_INFLIGHT = 1`）逐字相抵，删了模型会撞闸二 |

**先例行（closest precedent）**：同类先例 = `2026-10-18-prompt-single-face` §2.4 #4/#9 的落法——EN 承载可执行句、机制档承载细则，两侧各自成面。**对齐**：本批 T1–T7 同形（EN 只落执行句，机制档坐标为详述面）。**偏离**：先例把 CN 原文逐字译进 EN；本批对机制档已详述的四类（甲 / 丙 / 丁-D4 / 乙 的分项定义）只落口径句，不搬原文——理由 = 机制档在 R2 后已是权威源（D2）。

**勘察证据行**：实读并逐条比对——`design/TESTING.md` §11（:415–620，含 :417 定位 / :423 形态 / :439–441 落点命名份数）· `requirements/TESTING.md` §7（:212–226，F29/F30/F33 + 范围边界）· `DOC-DISCIPLINE.md` §1 D 表（D1 :18 区 · D4 :18 · D7 :21 · D8 :22）+ D8 细则（:25–36）+ D4 细则（:38–72）+ :1493 禁令句 · `LEDGER.md` §1.1（:16–32 全文）· `requirements/ENGINEERING-MODE-V2.md` :602–610（D1–D9 表，D4 :605 · D7 :608）· `tool-docs/notify_parent.md`:14 · EN 六档与 CN 六档逐处对照（`discipline-engineering` · `common` · `persona-engineering` · `persona-eng-designer` · `discipline-normal` · `advisor-design`）。**负向判断的查证面**（B7 教训）：判「机制档无」的两处已给面——#8 查 `docs/` 全树 `自加`/`重新过堂` 零命中；#12 二次复核见 §2.9——机制档 `AGENT-LOOP-UPSTREAM.md`:63 / :66 逐字承载双闸（ask ≤1 + 队列 ≤20），产品面 `tool-docs/notify_parent.md`:3 / :14 同述；前一读数的查证面只查了「队列深度」类词，漏了 `UPSTREAM_ASK_MAX_INFLIGHT` 与「未 drain」。**声明公共源**（项目形 = `TESTING.md`:14「已查 + 无相关」）：工作目录树内公共源**已查**——`docs/**` 设计 / 需求两树 + 本仓提示词十六档，相关 = `DOC-DISCIPLINE.md` · `design/TESTING.md` · `requirements/TESTING.md` · `requirements/ENGINEERING-MODE-V2.md`（逐条坐标见上）；外部参考系五仓（`kimi-code` ∥ `MiMo-Code` ∥ `opencode` ∥ `oh-my-pi` ∥ `openclaw`，索引外）：**无相关**——本批判据面 = 本仓提示词与机制档口径，参考系不辖本仓提示词纪律。

### 2.7 上抛项

- **[上抛·知会] #12 父队列双闸（已裁 · 采纳本落法）**：`notify_parent` 有双闸——`parent-channel.mjs`:54 `UPSTREAM_ASK_MAX_INFLIGHT = 1`（同一子代理「未取走」的 `ask` ≤1；:227–233 第二条即 `refused`）+ :52 `UPSTREAM_QUEUE_MAX = 20`（父队列总长）。EN 原句是对的，真错只在 CN 括号「深度 1」；父侧 23:53 撤回原裁定，T8 按代码真值落（§2.9），其余 14 行不受影响。
- **[上抛·知会] #9 D7 槽位枚举（已核 · 不丢槽）**：EN D7 现文（`thincoder-core/prompts/discipline-engineering.md`:185–187 实读）**无**「收口测试行」槽，CN D7 十一项（`docs/core/design/prompts/discipline-engineering.md`:195 实读）亦无 ⇒ T2 整条替换**不丢任何现有槽**。权威取 `DOC-DISCIPLINE.md`:21 十项（与 `requirements/ENGINEERING-MODE-V2.md`:608 同形同数）。**机制档内部张力（本批不改）**：`design/TESTING.md`:120 / §3.3 称「收口测试行」住 §6 清单、且以 D7 行为槽位枚举权威，而 D7 十项无该槽——两处描述不一致，收正归机制档，留待下一轮。
- **[上抛·待裁] §1 `:33` 的 CN 边界句与 T8 相抵**：§1 写「不动 CN 镜像（R5 删；本批不碰）」，而 T8 改 CN `common.md:76`。§2.5 已给本批唯一 CN 边界陈述（只动该一行，其余随 R5）；§1 那行需 §1 作者（主 agent）收正——六段一段一作者，本席不改他人段。
- **[上抛·知会] CN `common.md:49` 同病（本批不改 · 随 R5 处置）**：CN `docs/core/design/prompts/common.md:49` 的量词与 T5 改前一样大（「模型读到的**任何文本**……不出现**引证**（档名 / 节号 / 指路句）」），同与语料相抵；它同时带着 `:50` 的操作数豁免行。T5′ 的写法以 `:50` 的枚举形为准（§2.12 ②）。CN 这一行本批不动（§2.5 边界：CN 只动 `common.md:76`），随 R5 删 CN 时一并消失。

### 2.8 本批条目（覆盖 / 不覆盖）

- **覆盖**：§2.1 十五行逐条处置 + 4 组相抵映射 + 八条改后整行（T1–T8）+ 七条不补理由 + 受影响文件表与落笔者 + 先例行 / 勘察证据行 / §2.9 双闸复核 / §2.10 评审轮 1 逐条处置 / §2.12 T5 射程收正。
- **不覆盖（边界）**：不落笔改 EN 三档（实施轮 = eng-coder，产品代码面）· CN 只动 `common.md:76` 一行（eng-designer 笔），其余随 R5 · 不动机制档（R2）· 不动需求档 · 不删 EN 独有 29 条 · 不含 E1/E2 的补译面（§2.5 E1/E2 另条）。

**验收对照（机械可核）**：

- ① **设计面**：十五条逐条有判定（§2.1 表行 = 15）· 8 条有改后整行（T1–T8）· 7 条有不补理由（不补表行 = 7）· 4 组相抵有映射行（映射表行 = 4）· §2.10 处置行 = 14。
- ② **EN 落盘后 `grep -c`**（期望值逐串）：`thincoder-core/prompts/discipline-engineering.md` —— `Three things are written down` = 1 · `one per delivery end` = 1 · `fix-round landing precondition` = 1 · `their own form` = 1 · `self-added, not a user habit` = 1；`thincoder-core/prompts/common.md` —— `no nested parentheses` = 1 · `pointer sentence` = 1 · `where does it point?` = 1 · `batch record §2` = 1 · `Operand exemption` = 1（且旧句 `a doc name or section number goes stale` = 0）· `per child, not per parent queue` = 1 · `a second \`ask\` is refused` = 1（**保留句**——K4 自列的头号风险，删了即错）；`thincoder-core/prompts/advisor-design.md` —— `design doc / requirement doc` = 1 且 `batch record / requirement doc` = 0。
- ③ **CN 落盘后**：`docs/core/design/prompts/common.md` 的 `:76` 同一行同时命中 `同一子代理「未取走」的 \`ask\` ≤1` 与 `父队列总长 20`（双闸数字两处都在）；全档 `父队列深度 1` = 0。
- ④ **被替换原串在测试域零命中**（替换前基线已实测 = 0，替换后须仍为 0）：`Two steps write docs` · `D7 change trail` · `outside this rule's scope` · `a doc name or section number goes stale` · `Few parentheses (nesting buries the main clause)` · `**One ask at a time**: while an` · `revision-style expressions left on the **normative face**` —— 在 `thincoder-core/test` · `thincoder-cli/test` · `thincoder-vscode/test` 三树 `grep -rn` 各 0。
- ⑤ **改动面**：未改动的 13 档不出现在 `git diff --name-only`。

### 2.9 #12 代码真值复核（双闸 · 对 §1 裁定依据的更正）

**结论**：`notify_parent` 有**两道闸**，§1 只读到第二道。所以「EN 面也错」不成立；真错只在 CN 括号。

**代码真值（本步实读）**

| 坐标 | 内容 |
|---|---|
| `thincoder-core/agent-tools/parent-channel.mjs:50` | `export const UPSTREAM_MSG_MAX = 1500` |
| `thincoder-core/agent-tools/parent-channel.mjs:52` | `export const UPSTREAM_QUEUE_MAX = 20`（父队列总长） |
| `thincoder-core/agent-tools/parent-channel.mjs:54` | `export const UPSTREAM_ASK_MAX_INFLIGHT = 1`（同一子代理「未 drain」的 ask 上限） |
| `thincoder-core/agent-tools/parent-channel.mjs:227–233` | 闸二：`kind === "ask"` 且本子代理已有未 drain 的 ask（`mine.length >= 1`）⇒ `refused("… one ask at a time until the parent picks it up …")` |
| `thincoder-core/agent-tools/parent-channel.mjs:235–236` | 闸三：`pending.length >= 20` ⇒ `refused("… queue is full (20) …")` |

**六处现文对读**

| 面 | 坐标 | 现文 | 判定 |
|---|---|---|---|
| 产品面 | `thincoder-core/tool-docs/notify_parent.md:3` | 「One ask at a time while a previous one still waits in the parent's queue」 | **对**（= 闸二） |
| 产品面 | `thincoder-core/tool-docs/notify_parent.md:14` | 「the parent's in-flight queue holds ≤20 messages」 | **对**（= 闸三） |
| 机制档 | `docs/core/design/AGENT-LOOP-UPSTREAM.md:63` | 「同一子代理「未 drain」的 `ask` ≤1（`UPSTREAM_ASK_MAX_INFLIGHT = 1`——再问 ⇒ 工具报错，不投递）」 | **对**（= 闸二） |
| 机制档 | `docs/core/design/AGENT-LOOP-UPSTREAM.md:66` | 「父队列总长上限（`UPSTREAM_QUEUE_MAX = 20`——超 ⇒ 工具报错，不静默丢）」 | **对**（= 闸三） |
| EN | `thincoder-core/prompts/common.md:91` | 「while an `ask` … is still waiting …, a second one is refused」 | **对**（窗口 = 未取走，与闸二逐字一致） |
| CN | `docs/core/design/prompts/common.md:76` | 「系统形状 = 父队列深度 1」 | **错**（把闸二写成队列长度；队列实为 20） |

**§1 原裁定（23:50）与撤回（23:53）**：原判「EN 面也错」不成立——EN 与代码、产品面、机制档三处逐字一致；原判「`docs/` 全树只有提示词档提到」也不成立——机制档 `AGENT-LOOP-UPSTREAM.md` 已逐字承载双闸（:63 / :66，失败面 F5 :76 亦写「双闸」）。§1 已逐条认错并采纳 T8 落法。

**T8 落法**：CN 括号收正为「同一子代理未取走的 `ask` ≤1；父队列总长 20」；EN 保留「未取走再发一条被拒」，补「父队列 20 · 超 20 明确报错 · 并成一条省往返」。删掉「被拒」句会让模型撞闸二——工具返回 `refused` 比读一句准确的话更贵。

**状态**：父侧已撤回 23:50 裁定并采纳本落法（§1「父侧撤回与改判」）；T8 文本 = §2.3，实施轮直接落。

### 2.10 评审轮 1（`advisor#17` · 14 条）逐条处置

裁定 = 14 条全收；三条 🔴 优先。下表「落点」= 本档改后位置（设计面），实施面落点见各 T 号与 §2.5。

| # | 严重度 | 处置 | 落点 / 依据 |
|---|---|---|---|
| 1 | 🔴 | T2 去掉引证：删 `(batch record §6)`，改为**自足句** `a fixed settlement sync checklist`——清单本体在句内枚举，读者不需指向任何档或节 | §2.3 T2（原 §2.1 行 2）；依据 = 同批 T5 落地的「no citation（doc 名 / 节号 / 指路句）」 |
| 2 | 🔴 | T7 档类枚举收成 **design doc / requirement doc**（与机制档同轴）；record face 括注同步为「batch records and git commits」，并明写「设计 / 需求档内的变更记录段或历史沿革 = 违规本身」 | §2.3 T7；依据 = `DOC-DISCIPLINE.md`:32（批档 = 记录面）· :33（禁历史行限设计档与需求档）· :22（D8） |
| 3 | 🔴 | T3 **保留代码坐标形态句**：指针形态只管指针，实施坐标另有一形（自仓根完整路径 + `:line`，裸相对段判悬空） | §2.3 T3；依据 = `DOC-DISCIPLINE.md`:18（D4 行含「消费点代码坐标一律写自仓根完整路径」）· :40–:51（D4 细则：裸段 ⇒ 唯一 basename 索引失效 ⇒ 判悬空） |
| 4 | 🟡 | #13 机制住址 `:60` → `:15`（`:60` = D4 细则二成因条；D1 行在 `:15`）。同表其余坐标本席实读 = `:15` / `:21` / `:22`；`requirements/ENGINEERING-MODE-V2.md`:605 / :608 沿用父侧给定坐标，未重读（标 unverified 不标） | §2.1 行 13 |
| 5 | 🟡 | 验收补三条：CN 行落盘判据（③）· EN 保留「未取走再发一条被拒」句（②）· 被替换原串在测试域零命中（④） | §2.8 ②③④ |
| 6 | 🟡 | 4 组相抵 → 表行映射表（组 → 先例批 §2.4 行 → 本批行 → 处置 → EN 落点） | §2.1 合计后新增表（口径 = 先例批 `:75`） |
| 7 | 🟡 | T1 写明计量单位 `one per delivery end`（签署按交付物）；甲线理由行补依据 | §2.3 T1 · §2.2 甲行；依据 = `design/TESTING.md`:441 |
| 8 | 🟡 | 受影响文件表后单列**落笔者**（D1）：EN 三档 = eng-coder；CN `common.md:76` = eng-designer 笔 | §2.5 落笔者行；依据 = `DOC-DISCIPLINE.md`:15 |
| 9 | 🟡 | 已核：EN D7 无「收口测试行」槽（`:185–187` 实读）⇒ T2 整条替换不丢槽；权威 = `DOC-DISCIPLINE.md`:21 十项；TESTING §3.3 与 D7 十项不一致 = 机制档内部张力，上抛 | §2.7 第 2 条 |
| 10 | 🟡 | §2.5 边界句标为「本批唯一的 CN 边界陈述」（只动 `common.md:76` 一行，其余随 R5）；§1 `:33` 收正上抛给 §1 作者 | §2.5 不动面 · §2.7 第 3 条 |
| 11 | 🔵 | T2 更名 **D7 settlement sync**（去掉易误读成 changelog 的「change trail」） | §2.3 T2 |
| 12 | 🔵 | 公共源声明改成项目形「已查 + 无相关」（树内已查 / 外部参考系不辖本批判据面，理由句保留） | §2.6 勘察证据行末句；形 = `TESTING.md`:14 |
| 13 | 🔵 | `.md 不标行数增量`补豁免依据：标注义务射程 = 源 / 单元测试档 | §2.5 标题下第 1 段；依据 = `DOC-DISCIPLINE.md`:225 |
| 14 | 🔵 | T7 换面边界改句界字面：整段替换，自 `Doc-hygiene rule` 起、至尾词 `(this actually happened).` 止 | §2.3 T7 标题行 |

### 2.11 修订轮（评审轮 1 · 14 条处置已就地改入）

- **三条 🔴**：T2 去引证（改为自足清单句）· T7 档类收成「设计档 / 需求档」（与机制档同轴）· T3 保留代码坐标形态句（D4 射程 = 指针形态 + 代码坐标形态）。
- **十一条 🟡/🔵**：逐条落点见 §2.10 表，无一条留作「待定」。
- **新增上抛两条**（§2.7）：#9 D7 槽位枚举（已核不丢槽；TESTING §3.3 与 D7 十项不一致 = 机制档内部张力）· §1 `:33` 的 CN 边界句收正（§1 作者笔）。
- **机检读数**：`doc_check` gate = `DOC-CHECK GATE: PASS（0 档）`——批档在 `checkConfig` 排除面（`batches`），故行宽 / 锚两条判据对本档不判；设计面自检三项已过（`§N` 引用全部存在 · 表行与计数相符 · 数字均为实读）。

### 2.12 修正轮 · T5 射程收正（父侧 2026-10-18 23:59 发现）

**问题**：T5 改前的量词写成了「no **citation** … may appear in **any** text the model reads」——按字面，`batch record §2`（= 任务书本体）、`§4` / `§6`（= 段位）、台账状态值全在禁止面，落地即与现有语料相抵 100 余次。原意 = EN 现文（改前 `common.md:55`）的「a doc name or section number **goes stale**」：禁的是**会烂的引用**，不是一切坐标。

**本席复测（新进程 · `thincoder-core/prompts` 十六档 · 逐处分类）**

| 形 | 父侧计数 | 本席复测 | 分类结果 |
|---|---|---|---|
| `batch record §N` | 26 | 27 | 全部 = 批档段位（机器坐标） |
| 裸 `§N` | 86 | 94（`§` 全量 121，同行多次计） | **94 处所在行，无一行同时含别的档名或外档 `file:line`**（唯一命中行 = `common.md:56` 操作数豁免句自身，列的是操作数）⇒ 全部 = 本协议 / 批档自身段位（机器坐标） |
| `*.md` 档名 | 22 | 22（`AGENTS.md` 14 · `README.md` 4 · `SKILL.md` / `MANIFEST.md` / `.thincoder/advisor.md` / `project_rules.md` 各 1） | 全部在 `common.md:56` 操作数名单内（操作数，非引用）；**无一处是「档名 + 节号」** |

**结论**：三形**没有一处**是「会烂的外部引用」——语料与**原意**零相抵，相抵的只有量词。故修法 = 补判据（一条测试句 + 一张允许形清单），不逐处改语料、不加新规则。

**判据表（carve-out 三类）**

| 类 | 判据（可判） | 语料中的形（实测） | 处置 | 动因 |
|---|---|---|---|---|
| 会烂的外部引用 = **citation** | 读者必须打开**另一个档**才知道这句在说什么；那个档的措词会在句子下方变化 | 本批语料 0 处（无一处指外档节号）；T5 原型 = `X.md:12` / 「见设计档」 | **仍禁**：删引用，句子自带语义 | 档会改、节号会移，模型会照着猜而不读原档 |
| 机器坐标 = **machine coordinate** | 指向**模型正在执行的协议内部位置**：要写的段位 / 要传的参数 / 要动到的状态 / 本文件节号 | `batch record §N` 27 · 裸 `§N` 94（全为本协议段位） | **合法**，保留 | 协议自身定义、工具机械执行；模型据它干活，外部改不动 |
| 操作数 = **operand** | 模型要读 / 写 / 传的**对象名**（文件、路径、参数值） | `*.md` 22（全在 `:56` 名单内） | **合法**，并入同一块 | 动作对象，不承载内容 |

**语料射程**：本表「语料」= `thincoder-core/prompts` 十六档（提示词面）。批档 / 设计档 / 需求档里的引用属记录面 / 状态面，各按自己的形态纪律（`doc:section`），不受本条约束——本条只管**提示词面读到的文本**。


**② CN `common.md:49` 原文核对**：**CN 无更准措词**——`:49` 同病（「模型读到的**任何文本**（提示词档 · 工具说明 · schema 文本 · 回给模型的串）里不出现**引证**（档名 / 节号 / 指路句）」），量词一样大。有参考价值的是 `:50` 的**操作数豁免**行：它把豁免写成**枚举的允许形**（可判），不是「必要除外」式空话。故 T5′ 照这一形写（测试句 + 枚举），并把 `:50` 名单**原样并入同一块**（一份清单，不是两份）。CN `:49` 自身随 R5 删 CN 时处置（§2.7 末条 · 本批边界）。

**③ 证据行 · 量词与语料核对**：规则里出现「any / 一切 / 所有 / every」时，**须附语料计数**——量词把射程写大，规则就落地即自我违反，且没有门能发现（门只查形态，不查射程）。**本条计数 = 26 / 86 / 22**（`batch record §N` / 裸 `§N` / `*.md`，父侧 2026-10-18 23:59 新进程实测；本席复测 27 / 94 / 22，差 = 计数口径，量级一致）。§1 已记同一教训（教训第四条），本条为设计面证据行。

**④ `discipline-engineering:6`（`#18` 备忘项）判定：合法，不需改**。理由：`batch record §2` 指模型**要写的段位**（`batch` 工具的 `segment` 参数机械落位），不是别的档的内容；按测试句——读者不需打开任何别的档就能读懂「entries land in batch record §2」（= 任务书本体）。`#18` 已落的自足句不回退。

**K5 决策**：carve-out 与 `:56` 操作数豁免**合并成一块**（T5 整块替换 `:55–56`）。备选 = 另起一段单列机器坐标。否决：两份豁免清单在射程上重叠（本文件节号两处都列），读者要交叉查；同一规则的豁免面裂成两处 = 下一个读者判不准哪份是权威（D2）。

**验收追加（已并入 §2.8 ②）**：`common.md` 落盘后同时命中 `where does it point?` / `batch record §2` / `Operand exemption` / `pointer sentence` 各 1。

### 2.13 T8 CN 面落盘（eng-designer 笔 · 2026-10-19）

**落点**：`docs/core/design/prompts/common.md:76` 整行替换，改后逐字 = §2.3 T8 CN 块（180 字符，逐字符比对等值）。本席笔域 = 中文设计文档面（D1，`DOC-DISCIPLINE.md`:15）；EN 面 `thincoder-core/prompts/common.md:92–96` 已由 eng-coder 落（§5.1 T8）。

**事实依据（本席实读）**：`thincoder-core/agent-tools/parent-channel.mjs:52` `UPSTREAM_QUEUE_MAX = 20` · `:54` `UPSTREAM_ASK_MAX_INFLIGHT = 1` · `:228–233` 闸二（同子代理未 drain 的 `ask` ≥1 ⇒ `refused`）· `:235–236` 闸三（队列 ≥20 ⇒ `refused`）· `:221–222` 消息长度上限 1500（本行未涉）。

**落盘读数**（node UTF-8 逐串计数，全档 `docs/core/design/prompts/common.md`）：

| 串 | 命中 |
|---|---|
| `父队列深度 1` / `父队列深度` | **0 / 0** |
| `同一子代理` | 1 |
| `≤1` | 1 |
| `父队列总长 20` | 1 |
| `省一次往返` | 1 |

**两面同机制**：CN 与 EN 同述两道闸（同子代理 `ask` ≤1 → 父取走可再问；队列总长 20 → 超则明确报错）+ `note` 不受闸二限 + 理由 = 并成一条省一次往返。

**交付门**：`doc_check(mode:"gate")` = `DOC-CHECK GATE: PASS`（显式 docs 1 档，0 命中）。

**边界**：本席只动 `common.md:76` 一行；EN 面、机制档、需求档、同档其余行零改动（§2.5 边界句不变）。

## §3 设计评审（评审子代理）

### 轮次 1（评审子代理）

### 评审对象
type=design · target=R3 设计：15 条判定（动 EN 8 · 不补 7）+ T1–T8 改后整行 · 读全 = `docs/batches/2026-10-18-prompt-EN-parity.md` ∥ `docs/core/design/TESTING.md` ∥ `docs/core/design/DOC-DISCIPLINE.md`

### 发现表

| # | Category | Severity | Issue | Suggestion |
|---|---|---|---|---|
| 1 | Document ownership | 🔴 | T2 把引证 "(batch record §6)" 落进提示词面（`…prompt-EN-parity.md:149`），而同批 T5 落进同一族提示词文件的规则是「no **citation** (a doc name / a section number / a **pointer sentence**)」（`:165`），K1 还据该禁令否决 pointer 句（`:137`）。两文同时落 ⇒ 实施轮必违其一。 | 去掉该括注或改成自足表述；若确要保留，须在设计中写出显式例外并指认唯一权威句。 |
| 2 | Document ownership | 🔴 | T7 把 "batch record" 写进规范面文档三类（`:175`），而 `DOC-DISCIPLINE.md:32` 把**批档**整类判为记录面（保留零触）、`:33` / `:1493` 把禁历史行的射程限于**设计档与需求档**；设计所指机制住址 `DOC-DISCIPLINE.md:22` 只枚举内容类目（功能点 / AC / 判据句…），不承载文档三档。 | 指明三档口径以哪处为准并收正 T7 的档类枚举；若要给机制档加「批档规范行」保留条款，按上抛项记，而不是在提示词面写第三份描述。 |
| 3 | Document ownership | 🔴 | T3 断言 implementation coordinates「each belong to their own face and are **outside this rule's scope**」（`:155`），而在审机制档把**消费点代码坐标**明列 D4 之内并附约束形：`DOC-DISCIPLINE.md:18`「**消费点代码坐标一律写自仓根完整路径**」+ `:40`「档内写**代码消费点坐标**（路径 + `:行号` 形态）」。同一条 D4 两份现役描述射程相反，读者无从判断代码坐标是否受约束。 | 二择一并写明依据：EN 侧保留代码坐标形态句 ⇒ T3 收窄为「本文所说 rule = 指针形态」；或确认 `requirements/ENGINEERING-MODE-V2.md:605` 的 D4 行与 `DOC-DISCIPLINE.md:18/:40` 本就相抵 ⇒ 记为上抛项，不在对齐 EN 时静默选边。 |
| 4 | Clarity / 勘察证据 | 🟡 | #13 的机制住址不可解析：`:125` 写「`DOC-DISCIPLINE.md`:60（D1 行：提示词 = 产品代码面）」，但 `:60` 是 D4 细则二的「**成因（两条实证）**」条；D1 行在 `:15`。该行是「不补」判定的唯一依据。 | 把该坐标改指 D1 行（`:15`），并核同类其余坐标。 |
| 5 | Acceptance criteria | 🟡 | 验收对照（`:242`）未覆盖三处：① CN `common.md:76` 那一行（本批唯一「改事实」的落点）；② EN 仍保留「未取走再发一条被拒」句（K4 自己列的头号风险）；③ 无「测试树 / 现有用例是否逐字断言被替换的原串」的查证，替换后可能只在实施轮才见红。 | 补三条可机核判据（CN 行命中、EN 保留句命中、被替换原串在测试域的命中数 = 0）。 |
| 6 | Requirements coverage | 🟡 | 设计自述本批口径含「**4 组与 EN 语义相抵**」（`:13`），但 §2.1 十五行从未标出哪 4 组、各自落到哪一行 / 哪条 T。相抵项正是「不搬就会留错」的那批，缺映射即无法证明覆盖。 | 增一列或一小表：4 组相抵 → 对应表行号 / T 编号 / 处置。 |
| 7 | Requirements fit | 🟡 | T1 现文「Every dev task walks the four steps … **Three things are written down** … the **UAT report**」（`:144`）以「dev task」为计量单位，而机制档已裁的单位是「**已裁 = 每端一份**（cli ∥ vsc ∥ desktop）」（`TESTING.md:441`）。模型照 EN 读会按任务产出 UAT 报告。 | 在 EN 句内说清计量单位（按端 / 按交付物，而非按任务），或写明摊到任务的读法并给依据。 |
| 8 | Methodology / ownership | 🟡 | CN 设计面那一行无落笔者：`:212` 把它列入受影响文件，`:240` 却把实施轮整体定为 eng-coder「产品代码面」，而 `DOC-DISCIPLINE.md:15` 规定设计文档面 = eng-designer 笔（内容权 = 主 agent）。 | 对该行单独记落笔者与内容权依据（D1），避免实施轮越写域。 |
| 9 | Requirements coverage | 🟡 | D7 槽位枚举在两份机制档之间不一致：`TESTING.md:120` 把 D7 定为槽位枚举权威并含「收口测试行」，而 `DOC-DISCIPLINE.md:21` 的十项（角色表 / 状态行 / 计数 / 指针 / 待办勾销…）无测试槽；T2 又是**整条替换**（`:149`）。替换后提示词面这一「权威面」可能与 §3.3 契约脱节。 | 先核当前 EN D7 是否含收口测试行槽：含 ⇒ 整条替换会静默丢槽，须保留；并记下以哪份枚举为准。 |
| 10 | Doc state | 🟡 | 同一批次档内两条现役边界句相抵：`:33`「**边界**：不动 CN 镜像（R5 删；本批不碰）」vs T8 / §2.5 实际改 CN `common.md:76`（`:189` · `:212`）。 | 收口为一条 CN 边界陈述（本批只动该一行，其余随 R5）。 |
| 11 | Clarity | 🔵 | T2 条目名保留 "**D7 change trail** + settlement sync"（`:149`），而 D8 已废除变更记录段（`DOC-DISCIPLINE.md:22`「变更记录段 / 历史沿革 已废除」）；「change trail」易被读成要求写 changelog，与本批 #14 判定反向。 | 按核销同步职能命名该条，避免 changelog 复读。 |
| 12 | Survey evidence | 🔵 | 公共源声明的写法是「= **未查**」（`:231`），而项目形是「已查 + 无相关」（`TESTING.md:14`）。前者读作省略，后者读作决定。 | 改写成「已查 / 不适用 + 无相关」的项目形，保留理由句。 |
| 13 | Affected-file size | 🔵 | `.md 不标行数增量`（`:206`）在 `thincoder-core/prompts/**` 上缺依据句：同一文件族被 `DOC-DISCIPLINE.md:15` 标为「代码面」，而标注义务射程 = 源 / 单元测试档（`.mjs` / `.cjs`）（`DOC-DISCIPLINE.md:225`）。按本评审判据属豁免（纯 `.md`、无越档），但理由未落。 | 补一句豁免依据（提示词档非源 / 单元测试档），免得实施轮按「代码面」补标。 |
| 14 | Clarity | 🔵 | T7 指令「**首句替换**」（`:173`）与所给多句段落之间缺边界：段落含括注内句点与破折号，实施轮自行判断会切错位置。 | 给出被替换句的终止字面（尾词）作边界。 |

### 评审范围限制（声明）
- 未声明项目标准档；无文档地图 ⇒ Ownership 判据按 Project Guide + 判据 7 本体执行（已声明降级）。
- 设计所改的 EN 提示词 / CN 提示词 / 代码文件（`thincoder-core/prompts/*` · `docs/core/design/prompts/common.md` · `parent-channel.mjs`）在本次读域外 ⇒ 涉及它们的断言（如 EN:91 现文、双闸数字）本轮**未核**，不作判据；已核面 = 三份在审文档。

### 计数
🔴 3 · 🟡 7 · 🔵 4（合计 14）；已核坐标：`DOC-DISCIPLINE.md:15/:18/:21/:22/:32/:33/:40/:60/:1493` · `TESTING.md:14/:120/:128/:417/:418/:441` · 批次档 `:13/:33/:125/:127/:137/:144/:149/:155/:165/:173/:175/:189/:206/:212/:231/:240/:242`

VERDICT: changes-required

## §4 用户批准（主 agent）

**用户批准（2026-10-19 00:03）**——依据 = 用户 2026-10-18 23:32 逐字「**后续都自动跑完吧**」（整批令，覆盖 R1–R6 各步的评审发起与实施启动）。

**批准范围**：R3 设计（§3 两轮：轮次 1 changes-required 🔴3 → 轮次 2 **pass**）⇒ 落 **EN 8 条（T1–T8）+ CN 1 行**。

**批准依据（在盘）**：

| 项 | 读数 |
|---|---|
| 轮次 1 | 🔴3（T2 括注与 T5 禁令自相抵 · T7 批档列进规范面 · T3 判出 D4 射程）+ 🟡7 + 🔵4 |
| 轮次 2 | **pass**；12 Fixed / 2 Accepted；三条 🔴 逐条实读确认；引文 2/2 过主机校验 |
| 中途改判 | T5 射程 carve-out（父侧实测 26/86/22 次引用 ⇒ 量词收小） |

**落笔分工（D1）**：EN 三档 = eng-coder（产品代码面）· CN `common.md:76` 一行 = eng-designer（设计文档面）。**两条同时落**，避免两面不同步。

**未含**：机制档（R2 已落）· 需求档 · 其余 13 档 EN · CN 其余行（随 R5）。

## §5 实施记录（eng-coder）
**状态行**：实施完成（含 T9/T10 修复轮（5.5 / 5.6），2 条待裁 + 4 条知会）



### 5.1 改动清单（8 处 · 3 档 · 逐字照 §2.3）

落盘后行号为实测；改前坐标见 §2.3 各条标题。三条 EN 提示词档 = 产品代码面，本笔（eng-coder）域。

| T | 文件:行（落盘后） | 改动 |
|---|---|---|
| T1 | `thincoder-core/prompts/discipline-engineering.md:6` | 第 1 条整行替换：`Two steps write docs (requirements / design)` → `Three things are written down`（需求档 / 设计档 / **UAT 报告** + 判据「谁验收谁」+ `one per delivery end`），并保留「单测不留常设文档」句 |
| T2 | 同上 `:187–188` | 第 7 条整条替换：更名 `D7 settlement sync`，清单由 6 槽扩到 10 槽（新增 修正轮落地前置 / 搁置清单回核 / 暂缓批复核 / 用户文档面同拍）；原 `(batch record §6)` 引证随替换消失 |
| T3 | 同上 `:184` | 第 4 条整条替换：D4 射程三分——指针形态 / **实施坐标另有一形**（自仓根完整路径 + `:line`，裸段判悬空）/ 现状读数与评审引文各归其面 |
| T4 | 同上 `:4` | 在置顶硬约束标题（`:3`）下、第 1 条前插入一段：本组规则自加 + 须答「立在哪条结构上、值不值」+ 前提变则回顾 |
| T5 | `thincoder-core/prompts/common.md:55–57` | `:55–56` 整块替换为三段式：citation 定义 / **the test（where does it point?）** 含机器坐标 carve-out（`batch record §2` · 段位 · 工具参数 · 台账状态 · 本文件节号）/ **Operand exemption**（原 `:56` 名单原样并入，含 `".md"` 字面） |
| T6 | 同上 `:10` | 整行替换：`Few parentheses (nesting buries the main clause)` → `Few parentheses, and **no nested parentheses** (nesting buries the main clause)` |
| T8 | 同上 `:92–96` | 整条替换：标题改 `per child, not per parent queue`，保留「未取走再发一条被拒」（闸二），补父队列总长 20 / 超 20 明确报错 / 并成一条省往返 |
| T7 | `thincoder-core/prompts/advisor-design.md:66` | 整段替换（自 `Doc-hygiene rule` 至尾词 `(this actually happened).`）：档类收为 **design doc / requirement doc**，记录面改 `batch records and **git commits**`，并明写设计 / 需求档内的变更记录段即违规本身 |

**未动**：`discipline-engineering.md:189`（第 7 条的收口行释义句）按 §2.10 #9 保留，替换后通顺；CN 镜像、机制档、需求档、其余 13 档 EN 提示词、任何 `.mjs` —— 零改动（本笔域 = 三档 EN 提示词）。

### 5.2 验证读数

| 项 | 命令 / 口径 | 读数 |
|---|---|---|
| §2.8 ② 十三串 | node UTF-8 逐串计数（`indexOf` 循环，非 findstr） | 全部命中期望值：`Three things are written down` / `one per delivery end` / `fix-round landing precondition` / `their own form` / `self-added, not a user habit` / `no nested parentheses` / `pointer sentence` / `where does it point?` / `batch record §2` / `Operand exemption` / `per child, not per parent queue` / `a second \`ask\` is refused` 各 **1**；`a doc name or section number goes stale` = **0**；`design doc / requirement doc` = **1**、`batch record / requirement doc` = **0** |
| 八块逐字 | 从批档 §2.3 取出围栏块与文件行段逐字符比对 | **8/8 逐字等值**（T1 703 / T2 803 / T3 681 / T4 441 / T5 1521 / T6 194 / T7 643 / T8 540 字符） |
| §2.8 ④ 七原串 | `thincoder-core/test` · `thincoder-cli/test` · `thincoder-vscode/test` 三树全文件扫描（8 档） | 七串**各 0** |
| 装配 | `assemblePrompt(scenario)` 逐场景（`prompt-overlays.mjs:68`） | engineering / normal / eng-coder / eng-designer / explore / coder / plan / consult **warnings 全 `[]`** |
| 测试 | 三包 `npm test`（`node test/run.mjs`） | 三包均 `test manifest is empty — zero tests = green（2026-09-28 full reset）`——仓库现无测试用例，绿是空绿；已如实记录，不作「测过」的证据 |
| 交付门 | `doc_check(mode:"gate")` | `DOC-CHECK GATE: PASS（0 档）`——批档在 `checkConfig` 排除面（`batches`），故 0 档被判 |
| 改动面 | 十六档 `prompts/*.md` mtime | 仅三档 = 2026-10-19 00:04（本笔）；其余十三档最晚 23:43 ⇒ 本轮零触 |

### 5.3 审计与代码评审轮次 · 终态

| 轮 | 对象 | 结果 |
|---|---|---|
| 内部分歧审计 1 轮（explore） | 三档 vs §2.3 / §2.5 / §2.8 | T1–T8 八条全 **CONVERGENT**；无表外改动、无漏落元素、无新造档内矛盾；唯一发现 = §5 未写（本轮已补） ⇒ `findings(1)` 已消解 |
| 内部代码评审 1 轮（advisor · code） | 三档（documents = 本批档） | **VERDICT: pass**；🔴 0 · 🟡 2 · 🔵 2，无一条标 must-fix。两条 🟡 = ① T8 的 CN 面未落（另笔，见 5.4）② T1 与同档 `:46` 既有句相抵（CN 同形，设计面裁定）；两条 🔵 = `:38` `(above)` 相对指针（既有形态）· §2.8 ④ 名单里有一串对「是否替换」零证明力 |

**终态 = clean**（无本笔域内的 must-fix 项；四条意见逐条落在 5.4 上报，不自行处置——其中两条属他人笔域 / 既有设计面矛盾，一条是 §2 判据行自身，一条是表外行）。

### 5.4 上报（不自行处置 · 需父侧 / 设计席裁）

1. **[上抛·待裁] T8 两面只落 EN 面**：CN `docs/core/design/prompts/common.md:76` 仍写「系统形状 = 父队列深度 1」，§2.8 ③ 两条判据在现盘不成立（代码真值 `parent-channel.mjs:52` = 20）。按 §2.5 落笔者行，该行 = **eng-designer 笔**；本笔不越域。**T8 在收口时不得记为已完成**，否则双闸事实以错形态留在设计面（R5 删 CN 前继续传播）。
2. **[上抛·待裁] T1 与同档 `discipline-engineering.md:46` 相抵**：T1 现写「三样要写文档 …和 UAT 报告」，而 `:46` 仍写 `Testing produces no test document`。CN 侧同形（`docs/core/design/prompts/discipline-engineering.md:59`「无测试文档」）⇒ 这是**与 CN 等值的既有设计面矛盾**，非 R3 的 EN 缺口；裁决点是 `:46` 是否收窄为「不出逐任务 / 逐用户故事文档」，与 UAT 报告（交付物面、按端一份）分开。
3. **[上抛·知会] `discipline-engineering.md:38`**：`(process doc ∥ state doc, above)` 正是 T3 落成的 D4（`:184`）所禁的相对指针；既有形态（CN `:52`「见上」同形），且属表外行 ⇒ 未改，留下一轮。
4. **[上抛·知会] §2.8 ④ 名单校正**：`revision-style expressions left on the **normative face**` 被列为「被替换原串」，但 T7 改后仍逐字保留该短语（`advisor-design.md:66` 句首）⇒ 该串零证明力；判据宜改用 `batch record / requirement doc`（§2.8 ② 已用）。

### 5.5 修复轮 · T9 / T10（eng-coder · 2026-10-19）

**出处**：§5.4 第 2 条（T1 与同档 `:46` 相抵）· 第 3 条（`:38` 的 `, above` 相对指针）——父侧逐条实读确认后交本笔修。本笔域 = `thincoder-core/prompts/**`（D1：EN 运行面 = eng-coder 落笔）；CN 镜像、机制档、需求档、本档其余行，零改动。

**① `:46`（T9）改前 → 改后（整行）**

改前：

```text
4. **Testing** — verify. **Verify by actually running it**: the change's implementer runs the change-time feedback loop; the parent runs the real check at delivery (one-line readings). **Testing produces no test document and mandates no per-user-story case — verification spend ∝ cost of failure.**
```

改后：

```text
4. **Testing** — verify. **Verify by actually running it**: the change's implementer runs the change-time feedback loop; the parent runs the real check at delivery (one-line readings). **Testing produces no test-design document and mandates no per-user-story case** — unit tests leave no standing document, and the **UAT report** is step 1's deliverable (signed per delivery end, not per task); verification spend ∝ cost of failure.
```

改动实质 = 「no test document」射程收窄到**测试设计档**（`no test-design document`），并显式点名 **UAT 报告**不在此列（交付物面、按端签）；`mandates no per-user-story case` 与 `verification spend ∝ cost of failure` 两句按要求原样保留。

**② `:38`（T10）改前 → 改后（整行）**

改前（末尾括注）：

```text
**⚠️ The problem statement — symptom / root cause / rejected options / trial readings — does NOT go here; it goes in the batch record** (process doc ∥ state doc, above). Design settles before you start.
```

改后：

```text
**⚠️ The problem statement — symptom / root cause / rejected options / trial readings — does NOT go here; it goes in the batch record** (the batch record is the process doc, the design doc the state doc). Design settles before you start.
```

改动实质 = 删掉 `, above`（`:184` 刚落的 D4 禁令所指的相对指针形），改为自足命名句；无语义变化。

**③ `:46` 与 T1 不矛盾（自证）**：`:6` 的三样 = 需求档 / 设计档 / **UAT 报告**（交付物面、`one per delivery end`）；`:46` 只否**测试设计档**，并把单元测试定为「不留常设文档」、把 UAT 报告点名保留为交付物。两句射程不交叉，旧串 `Testing produces no test document` 全档与 `thincoder-core/prompts` 全树零残留。

**④ 读数**（node UTF-8 逐串计数 · 装配实跑 · `git diff`）

| 项 | 读数 |
|---|---|
| 全档 `, above` | **0** |
| 全档 `see above` / `see that section` | 1 / 1——同在 `:184`，是 D4 规则**自身列举的被禁形标签**，非指针实例（该行属本轮禁改的「其余行」，未动） |
| `no test document` / `no test-design document` | **0** / **1** |
| `mandates no per-user-story case` / `verification spend ∝ cost of failure` | 1 / 2（第二处 `:105` 为本轮之前既有） |
| `(process doc ∥ state doc` / 自足括注 | 0 / 1 |
| `above` 词形全档 | `:38` 已清零；余 `:40`（`independent doc repos above all`，副词短语）· `:184`（同上） |
| 装配 `assemblePrompt`（8 场景：engineering / normal / eng-coder / eng-designer / explore / coder / plan / consult） | warnings 全 `[]` |
| 改动面 | 本档仅 `:38` / `:46` 两行；`git diff` 中其余差异 = 前几轮未提交落盘，非本轮引入 |

**⑤ 审计与代码评审轮次 · 终态**

| 轮 | 对象 | 结果 |
|---|---|---|
| 内部分歧审计 1 轮（explore） | 本轮两行 vs 任务书 / 禁改面 | **VERDICT: convergent**；四类偏差（PARTIAL / SILENT-SIMPLIFICATION / DOC-DRIFT / OUT-OF-LIST）均未发现；①–⑥ 逐条 CONVERGENT。附一条 FYI：`step 1's deliverable` 的指代可读（见 5.6 第 1 条） |
| 内部代码评审 1 轮（advisor · code） | 本档（documents = 本批档） | **VERDICT: changes-required**；🔴 0 · 🟡 5 · 🔵 1。逐条处置见下 |

**advisor 六条逐条处置（不自行扩笔 · 全部有据）**

| # | 严重度 | 意见 | 处置 |
|---|---|---|---|
| 1 | 🟡 must-fix | `:46` 的 `the UAT report is step 1's deliverable` 按字面把 UAT 报告摆到「需求」步，与机制档 `docs/core/design/TESTING.md:417`（交付物面的验收报告 = 集成测试的文档面）读感相抵 | **不修 · 上抛**：该措辞 = 本轮设计点逐字内容（父侧「UAT 报告是第 1 步的交付物、按端签」）；改它 = 变更委托语义，本笔无权定。另有一种自洽读法可立（本档四步的第 1 步块内声明三样文档，与 CN `:7` 原结构同形）⇒ 留父侧裁，见 5.6 第 1 条 |
| 2 | 🟡 optional | `mandates no per-user-story case` 与 RTM「按业务故事分节、一行一用例」（`TESTING.md:423`）读感相抵 | **不修**：父侧明令保留该子句；UAT 报告的粒度归机制档 §11 承载。记录在案，见 5.6 第 2 条 |
| 3 | 🟡 optional | `:49` 的 `any one of the three below` 与 `:38` 刚清掉的 `, above` 同族（同违 `:184` D4） | **不修**：表外行，本笔禁改 ⇒ 上抛，见 5.6 第 3 条 |
| 4 | 🟡 optional | CN 镜像 `docs/core/design/prompts/discipline-engineering.md:52`（`（过程文档 ∥ 状态文档，见上）`）与 `:59`（`**无测试文档 ∥ 无「每条用户故事一条用例」要求——验证投入 ∝ 失败代价**`）仍带本轮在 EN 清掉的两个缺陷 | **不动**：父侧边界（CN 随 R5 处置，§2.5 / §2.7 已登记）⇒ 知会，见 5.6 第 4 条 |
| 5 | 🟡 optional | 记录面滞后：§5.4 第 3 条仍写 `未改，留下一轮。`；§6 空段；本轮两处修复无机检读数行 | **§5 已补读数（本段 ④）**；§5.4 收正与 §6 属父侧笔域 ⇒ 见 5.6 第 5 条 |
| 6 | 🔵 | `signed per delivery end, not per task` 与 `:6` 的同一计量单位重复（D2 精神） | **不修**：父侧指定的「按端签」措辞；重复为半句级，无权威冲突 |

**终态 = `clean`（本笔域内无自修项）**：advisor 唯一 must-fix 落点 = 父侧指定的那句话本身，改它属变更委托语义 ⇒ 转上抛，不自行处置；其余五条均为表外行 / 他人笔域 / 已知边界。

### 5.6 上抛（本轮新增）

1. **[上抛·待裁] `:46` 的 `the UAT report is step 1's deliverable`（advisor must-fix 第 1 条）**：两面读法并存——① 字面读 = UAT 报告在「需求」步产出，与 `docs/core/design/TESTING.md:417`（交付物面的验收报告 = 集成测试的文档面）、`:439`（落点 `<包>/test/`）读感相抵，审计亦独立提同一歧义；② 结构读 = 「四步的第 1 步块内声明的三样文档之一」（与 CN `:7` 原结构同形）。本笔按任务书逐字落，未改。若父侧要消歧，可选方向 = 去掉步骤编号、只留「交付物面 / 按端签」，但那是任务书改字，需父侧下令。
2. **[上抛·知会] `:46` 的 `mandates no per-user-story case` 与 RTM 粒度**：机制档 `TESTING.md:423` 要求 RTM「按业务故事分节，一节一表、一行 = 一个集成用例」；`:46` 的该子句按父侧令保留。建议下一轮把该子句显式限定在单元测试 / 内部回路射程，或由机制档承载粒度、提示词面不再复述。
3. **[上抛·知会] `:49` 的 `any one of the three below`**：与 `:38` 刚清的 `, above` 同族（`:184` D4 所禁的相对指针），属表外行未改——本档因此仍自己演示被禁形态（与本档 `:172`–`:174`「residue is demonstration」纪律相反）。
4. **[上抛·知会] CN 镜像两处滞后**：`docs/core/design/prompts/discipline-engineering.md:52` / `:59` 仍带本轮 EN 已清的两个缺陷；本轮之后 EN 与 CN 在这两处正式分叉，随 R5 删 CN 一并带走，期间勿把 CN 现文当 EN 对照基线。
5. **[上抛·知会] 记录面**：§5.4 第 2 / 3 条现为「仍待裁 / 未改」形态，而盘上两处已落；§6 收口时按落盘状态收正，并把本段 ④ 的读数行计入收口测试行（本档 `:103` 口径）。

## §6 验证与收口（父代理）

### 验收与收口（父侧 · 2026-10-19 00:17）

**① 交付验证（父侧亲跑 · 新进程）**

| 项 | 读数 |
|---|---|
| T1 三样 + UAT | `Three things are written down` = 1 · `Two steps write docs`（旧串）= **0** |
| T2 D7 十项 | `settlement sync checklist` = 1 |
| T3 D4 射程 | `their own form` = 1 |
| T4 规则自加条 | `self-added, not a user habit` = 1 |
| T9 测试档收窄 | `no test-design document` = 1 · `no test document`（旧串）= **0** |
| T11 步序歧义 | `step 1` = **0** · `delivery-face document` = 1 |
| T12 相对指针 | `below` 词形 = **0**（`:184` 规则本体举例除外，非实例） |
| 父队列双闸（两面） | EN `per child, not per parent queue` ✓ · CN `同一子代理` + `父队列总长 20` ✓ · CN `父队列深度` 残留 **0** |
| EN 面含汉字残留 | **36 行**（与 R1 收口时同数——本批未引入新中文） |
| 装配 | engineering 137,169 · eng-coder 87,564 · normal 87,937 —— **warnings 全 `[]`**；engineering/eng-coder 含 `delivery-face document`，`step 1` 三场景均无 |

**② 结算核对**

- 台账 `#1682` 保持**在途**（覆盖 R1–R6，R3 只是其中一轮）。
- §1–§6 均有内容；§5 含四笔实施读数（`#21` 八条 · `#22` CN 一行 · `#23` 两处 · `#25` 两处）。

**③ 文档机检门**：`DOC-CHECK GATE: PASS`（批档在 `batches` 排除面 ⇒ 0 档入判，如实记）；**EN 面仍无自动门**（`scanDirs=["docs"]`），验收只能靠 ① 的机检与装配读数。

**④ 暂缓批复核**：无暂缓批。

**⑤ 收口测试线**：本批改提示词文本，无单元测试档；三包 `npm test` = `test manifest is empty — zero tests = green`（**空绿，不作为「测过」证据**）；集成场景未受影响。

**⑥ 遗留（三条，均已处置或归位）**

| # | 项 | 处置 |
|---|---|---|
| 1 | 提示词内容 4 条规则的本体住机制档 | R2 已落（`LEDGER.md` §1.1 · `DOC-DISCIPLINE.md` §4.4） |
| 2 | CN 设计面 `common.md:52/:59` 仍带本轮在 EN 清掉的两个缺陷 | **随 R5 删 CN 处置**；此前勿以 CN 现文作 EN 对照基线 |
| 3 | `:46` 的 `mandates no per-user-story case` 与 `TESTING.md:423`（RTM 一行 = 一个集成用例）读感相抵 | **本批前既有**；该子句按设计保留。属机制档要回答的问题，**不在本批处置** |
