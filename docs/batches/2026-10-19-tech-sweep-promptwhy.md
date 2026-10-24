# 2026-10-19 · tech-sweep-promptwhy
> 六段 append-only，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 编制：主 agent · 2026-10-19 · 来源 = 用户令 2026-10-19 08:28/08:31/08:33——批 H = 提示词禁类写法改因轮（`#1631` 138 处分诊 → 逐条改因果体）。用户 2026-10-17 23:46 原话：「我不喜欢用什么铁律/禁止/不许之类的办法，我更相信『知其然知其所以然』」。。
> 台账 = #1631（core · 归批）。前情 = docs/batches/2026-10-19-tech-todo-sweep.md（在途）。
## §1 讨论（主 agent）
**状态行**：已收口 2026-10-19
<§1 模板占位：本批条目 / 关键判据 / 授权口径>
## §2 批次任务与设计（eng-designer）
**状态行**：（eng-designer 写入时更新）
<§2 模板占位：本批条目（覆盖） / 设计档落点 / 机制设计 / 受影响文件与测试覆盖 / 验收对照 / 关键决策 / 上抛项>

**状态行**：设计完成 2026-10-19（三类分诊清单 + 标题处置 + 体量/验收；实施 = eng-coder）

### 2.1 本批条目（覆盖 / 不覆盖）

| # | 条目 | 验收判据（机检） |
|---|---|---|
| 1 | 三类分诊清单，逐处 `档:行 → 现文 → 判类 → 拟改文案` | 72 行逐行有判类；41 行可改因各挂组号与拟改句 |
| 2 | 4 个规则块标题处置 | 4 处各给新标题；改后标题不含 `hard constraint` / `iron law` |
| 3 | 每档字数变化 + 超帽方案 | 逐档净增 ≤ 3%（= 每档帽自设，见 2.9）；超者给削句方案 |
| 4 | 验收读数 | 指令式禁令行 41 → 0；残留词面命中全部落在 B/C/D 清单内 |
| 5 | 受影响文件表 | 9 档提示词 + 1 设计档，逐档带现量 |

**不在本批**：判据句单源（机制档 `DOC-DISCIPLINE` / §6.6）· `thincoder-core/tool-docs/**`（工具描述面）· 306 行裸档名存量 · 已删中文镜像 `docs/core/design/prompts/**` · 机制名「铁律块注入」（`AGENT-LOOP-ASYNC-POOL.md:195`，注入块名，不改）。

### 2.2 实测基线（本笔重数 · as-of 2026-10-19）

- 面 = `thincoder-core/prompts/*.md`，16 档，合计 **262,499** 字符（逐档 `String.length`）。
- 英文词面命中（`never` / `do not` / `don't` / `must not` / `may not` / `forbidden` / `red line` / `hard limit`）= **91 处 / 72 行**。
- 中文禁类词（禁止/不许/不得/不准/绝不/切勿）= **0 处**（EN 面无中文；已删中文镜像 = 12 处，非本批目标）。
- 分诊结果：**A 可改因 41 行 + 2 标题** · **B 属约定 4 行** · **C 需用户裁 2 行** · **D 非禁令 25 行**（41+4+2+25 = 72 行）。

### 2.3 判类口径

**A 可改因** = 原句本身已带原因（"…: a silent skip lets the parent proceed …"），改写 = 换句式（`never X: why` → `do Y, because why`），**不新增因果**——这是防伪造的结构性保证。
**B 属约定** = 规则必须存在但无因果（命名 / 阈值 / 结构 / 参数字汇）⇒ 保留禁令式 + 明写「约定」。
**C 需用户裁** = 我方判断不了的政策口径 ⇒ 单列上报，不擅自改写。
**D 非禁令** = 描述性否定 / 能力事实 / 机制事实 / 参数字汇 / 引用用户原话 ⇒ 不改（列入是为解释词面读数）。

### 2.4 A 类：可改因（41 行 + 2 标题）

| 档:行 | 组 | 现文关键句 |
|---|---|---|
| advisor-design.md:60 | G1 | never skip it silently … never pretend it was written |
| advisor-round2.md:22 | G2 | never drop an item silently: a dropped item is gone |
| advisor-round2.md:28 | G2 | zero-reason silence or evasion never closes an item |
| advisor-round2.md:29 | G2 | an item must not vanish from the table silently |
| advisor-round2.md:46 | G1 | never skip it silently, and never pretend it was written |
| advisor-round2.md:64 | G2 | silence or evasion is never accepted |
| advisor-round3.md:21 | G2 | never drop an item silently |
| advisor-round3.md:25 | G2 | a zero-reason non-fix is never accepted |
| advisor-round3.md:26 | G2 | never drop an item silently |
| advisor-round3.md:42 | G1 | never skip it silently … never pretend it was written |
| advisor-round3.md:60 | G2 | silence or evasion is never accepted |
| common.md:19 | G3 | other docs use the term, never restate the definition |
| common.md:28 | G16 | Speed is never the bottleneck — rushing gets paid back |
| common.md:30 | G16 | don't invent — an invented answer hides the gap |
| common.md:55 | G16 | a citation … may not appear in any text the model reads |
| common.md:179 | G16 | **Destructive-command red lines**（标题） |
| common.md:215 | G4 | closed records are frozen, never back-edited |
| common.md:216 | G3 | never copy the cited content — a copy drifts |
| common.md:217 | G3 | a state doc never cites a process doc |
| common.md:225 | G5 | never in git — a ledger in the tree travels with every clone |
| common.md:234 | G6 | never a schedule / never in a batch record |
| common.md:242 | G4 | a state doc states as of now — never how it got there |
| common.md:261 | G16 | "it has always been a config-file item" is never an exception |
| common.md:268 | G7 | never copy checklists from public platforms |
| discipline-engineering.md:3 | H1 | ## 🔴 Top hard constraints（标题） |
| discipline-engineering.md:29 | H2 | ## Basic flow (four hard steps — no skipping)（标题） |
| discipline-normal.md:180 | G2 | a zero-reason refusal is never accepted |
| discipline-normal.md:182 | G2 | a zero-reason refusal is never accepted |
| discipline-normal.md:187 | H4 | ### Rules（标题） |
| persona-eng-coder.md:20 | G14 | do not edit it — report it for the parent to route |
| persona-eng-coder.md:37 | G1 | never skip it silently … never assume the parent will ghost-write |
| persona-eng-coder.md:38 | G15 | do not execute — bounce it back — never fabricate a task book |
| persona-eng-designer.md:30 | G12 | an invalidated expression never stays on the normative face |
| persona-eng-designer.md:49 | G13 | never self-grant an exemption … never booked to the ledger |
| persona-engineering.md:61 | G8 | walk DOWN, never up |
| persona-engineering.md:65 | G8 | **Never brick the session** |
| persona-engineering.md:67 | G8 | Never hand-edit the JSON |
| persona-engineering.md:87 | G9 | never commit on behalf of the user's / others' docs |
| persona-engineering.md:130 | G2 | a zero-reason refusal is never accepted |
| persona-engineering.md:137 | G2 | a zero-reason refusal is never accepted |
| persona-engineering.md:148 | G10 | **Never let a design token expire** |
| persona-engineering.md:151 | G7 | Credentials never land in docs |
| persona-engineering.md:197 | G11 | never into `trigger` |
| persona-engineering.md:214 | G11 | never into `trigger` |

**拟改文案（按组；英文原文用词保留，只换句式）**

- **G1**（4 处）：`If the write does not land, say "<segment> not written" plainly in the report. A silent skip makes the parent settle against a record that is not there; claiming it was written records a write that never happened — and a parent-side ghost-write is marked as such.`
- **G2**（12 处）：`Every item appears in the table with its state: the parent settles by the table, so an item missing from it reads as done. A non-fix with no reason stays Unfixed — with nothing stated there is nothing to evaluate.`
- **G3**（3 处）：`common.md:19` → `Other docs use the term; the definition lives here — a restatement drifts from its source.` · `:216` → `Cite instead of copying: a copy drifts from its source.` · `:217` → `A state doc cites a state doc. A batch record can be deleted whole, so a citation into it dies with it.`
- **G4**（2 处）：`common.md:215` → `Closed records stay as written — a back-edit rewrites an account someone already settled.` · `:242` → `A state doc states what is true now. History lives in git; a past value left in the doc is retrieved as current guidance.`
- **G5**：`The ledger lives in the user data directory. In the tree it travels with every clone and disappears with the project tree.`
- **G6**：`A batch record may be dropped whole, so anything that must outlive the round lives in the requirement/design docs. Dropping one is a maintainer's decision; no schedule does it.`
- **G7**（2 处）：`common.md:268` → `Size protections by the loss this system can actually take, from its real data flows. A copied checklist guards a surface nobody runs.` · `persona-engineering.md:151` → `Credential values stay out of docs: a token written into a doc is a token in every clone, backup and reviewer's copy.`
- **G8**（3 处）：`:61` → `Project root = the nearest directory walking DOWN from the anchor (direct children only). Walking up lands the manifest in an unrelated enclosing project.` · `:65` → `A missing project manifest must not kill the session: the session can start anywhere, and killing it throws away everything it holds.` · `:67` → `Point-edit config through the settings tool. A hand-edited file splits the state from the tool's assumptions, and the next read applies another set of rules.`
- **G9**：`Commit path-limited and only your own work: a commit on someone's behalf takes what they were still writing.`
- **G10**：`A design token is short-lived runtime state: dispatch promptly after issuance. An expired token has to be re-issued, and work done against the old one is re-done.`
- **G11**（2 处）：`The batch name / condition sentence goes into evidence. trigger holds one bare enum value; prose there cannot be filtered on.`
- **G12**：`Delete an invalidated expression from the normative face. Residue makes the next reader re-open a dead item as live work — this happened.`
- **G13**：`An exemption you grant yourself keeps a wrong rule alive because you wrote it. An unclear fix goes to the main agent; the main agent's uncertainty goes to the user. A gate hit is fixed in the round — booking it moves the work where nobody looks.`
- **G14**：`A hit in a doc outside your pen goes to the parent for routing: editing it puts a second pen on someone else's page, and pen-domain discipline outranks a green gate.`
- **G15**：`An unreadable task book means no execution. A fabricated task book runs a whole round on a direction nobody set.`
- **G16**（5 处）：`:28` → `Correctness first. Rushing gets paid back in rework, so speed is not the bottleneck.` · `:30` → `Say you cannot do something instead of inventing it: an invented answer hides the gap, and half-doing it costs more once the user notices.` · `:55` → `A citation sends the reader to another document for the meaning, and its wording changes under the sentence — so the sentence stands on its own.` · `:261` → `Every config item ships its UI in the same batch. "It has always been a config-file item" is a habit, not a reason — a hint pointing at a missing entry costs the trust in every later hint.` · `:179` (标题) → `**Destructive commands — the tool layer catches none of this**`

**标题（H 组）**：

- **H1** `discipline-engineering.md:3` → `## 🔴 What this mode runs on (each clause names the structure it rests on; a clause that cannot answer is a habit)`（4 条正文不动——每条已自带 why）
- **H2** `discipline-engineering.md:29` → `## Basic flow (four steps, in order)`
- **H3** = G16 的 `common.md:179`
- **H4** `discipline-normal.md:187` → `### Conventions (each line states what it rests on)`

### 2.5 B 类：属约定（4 行，保留禁令式 + 明写「约定」）

| 档:行 | 现文 | 处置 |
|---|---|---|
| discipline-engineering.md:70 | a hard limit (line counts · complexity caps) | 阈值约定（`AGENTS.md` ≤800 行 / ≤500 建议）——术语保留，同句已带理由。 |
| discipline-normal.md:210 | `designPoints` … forbidden scope | 参数字汇：字段名是契约（spawn 参数），改名破坏接口 ⇒ 不改。 |
| persona-engineering.md:164 | `designPoints` … forbidden scope | 同上。 |
| persona-engineering.md:74 | §6 never declarable | 结构约定 ⇒ 改 **「(Structure convention) §6 is closed to declaration — the parent writes it.」**（加约定标记，不改内容）。 |

### 2.6 C 类：需用户裁（2 行，不擅自改）

| 档:行 | 现文 | 待裁问题 |
|---|---|---|
| persona-engineering.md:99 | Internal only — never re-broadcast | 内部台账行**完全不向用户播报**是否为定则？若允许播报，「never」改成条件句（"unless the user asks for the pool"）。 |
| persona-engineering.md:203 | Out-of-scope items … do not reach the user | 越界发现**允许静默不回传**的边界（与「发现即报」同档并列）——是产品口径还是可改因？ |

### 2.7 D 类：非禁令（25 行，不改；列出以解释词面残留）

- 描述性否定：`advisor-round1.md:30` · `common.md:197` · `common.md:252` · `common.md:256` · `discipline-engineering.md:44` · `:152` · `:184` · `discipline-normal.md:48` · `:158` · `:175` · `persona-engineering.md:8` · `:95` · `:116` · `:122` · `:165` · `persona-engineering.md:219` · `:222`
- 能力事实：`persona-explore.md:5`（You do NOT have file editing tools）· `persona-normal.md:37`（Subagents do not）
- 机制事实：`discipline-normal.md:213` · `persona-engineering.md:156` · `:168`（content is never read）
- 参数字汇：`common.md` 无（`forbidden scope` 已归 B）
- 引用用户原话：`persona-engineering.md:53` · `:150`（"don't auto"）· `consult-base.md:5`（"I don't know"）

### 2.8 体量与每档字数变化

提示词面无单档帽；`§6.11` 的 ≤8,000 帽属**工具描述面**（见 6.32）。本批自设预算：**每档净增 ≤3%**、全量净增 ≤3%（≈ +7.9k 字符）。按组文案估算（每条改写 ≈ 原句 ±10 字符，why 复用原句）：

| 档 | 现量（字符） | A 类改写数 | 净增上限 3% |
|---|---|---|---|
| common.md | 42,953 | 13 | ≤ 1,289 |
| persona-engineering.md | 57,674 | 10 | ≤ 1,730 |
| discipline-normal.md | 38,509 | 2 | ≤ 1,155 |
| discipline-engineering.md | 36,538 | 2（标题） | ≤ 1,096 |
| persona-eng-designer.md | 17,981 | 2 | ≤ 539 |
| advisor-design.md | 12,260 | 1 | ≤ 368 |
| advisor-round2.md | 11,127 | 5 | ≤ 334 |
| advisor-round3.md | 11,087 | 5 | ≤ 333 |
| persona-eng-coder.md | 5,901 | 3 | ≤ 177 |

**超帽方案**：任一档超 3% ⇒ 该档的 why 削到一句（保留「因」的去向，不删规则），并复测该档字符数；仍超 ⇒ 上报，不自行放宽帽。

### 2.9 受影响文件表

| 文件 | 现量（行 / 字符） | 改动 |
|---|---|---|
| `thincoder-core/prompts/common.md` | 274 / 42,953 | 13 处改写 + 1 标题 |
| `thincoder-core/prompts/persona-engineering.md` | 237 / 57,674 | 10 处 |
| `thincoder-core/prompts/advisor-round2.md` | 65 / 11,127 | 5 处 |
| `thincoder-core/prompts/advisor-round3.md` | 61 / 11,087 | 5 处 |
| `thincoder-core/prompts/persona-eng-coder.md` | 39 / 5,901 | 3 处 |
| `thincoder-core/prompts/persona-eng-designer.md` | 89 / 17,981 | 2 处 |
| `thincoder-core/prompts/advisor-design.md` | 77 / 12,260 | 1 处 |
| `thincoder-core/prompts/discipline-normal.md` | 264 / 38,509 | 2 处 + 1 标题 |
| `thincoder-core/prompts/discipline-engineering.md` | 201 / 36,538 | 2 个标题 |
| `docs/core/design/PROMPT-SYSTEM.md` | — | 已增 §6.32（本笔） |
| 不改 | `advisor-round1.md` · `consult-base.md` · `persona-coder.md` · `persona-explore.md` · `persona-normal.md` · `persona-plan.md` · `subagent-base.md` | — |

**测试覆盖**：提示词正文无运行期行为可断言；按纪律不写「句子在场」型断言。验收 = 计数读数 + 分类比对（见 2.10）。

### 2.10 验收命令与期望读数

```bash
cd thincoder && node -e "const fs=require('fs'),d='thincoder-core/prompts';const re=/never|do not|don't|must not|may not|forbidden|red line|hard limit/gi;let n=0,l=0;for(const f of fs.readdirSync(d).filter(x=>x.endsWith('.md')).sort()){fs.readFileSync(d+'/'+f,'utf8').split(/\n/).forEach((s,i)=>{const m=s.match(re);if(m){n+=m.length;l++;console.log(f+':'+(i+1));}})}console.log('occ',n,'lines',l)"
```

- 改写前：`occ 91 lines 72`（已实测）。
- 改写后期望：**A 类 41 个坐标 + 4 个标题全部消失**；残留 `occ ≤ 33 / lines ≤ 25`，且**逐行落在 2.5–2.7 清单内**（比对方式：把残留坐标与 D/B 清单逐行对齐，零新增）。
- 每档字符：`node -e "…console.log(f, t.length)…"`，逐档 ≤ 2.8 表的上限。
- 文档门：`doc_check(mode:"gate", docs:["docs/core/design/PROMPT-SYSTEM.md"])` 首行 PASS。

### 2.11 关键决策

1. **判类依据 = 原句自带的 why**，不新造因果——伪造因果比禁令更坏（模型拿假理由推别的场合）；找不到 why ⇒ 进 B 或 C。
2. **改写只换句式、不新增句子**：why 复用原句，字节近中性，避开体量膨胀。
3. **词面命中 ≠ 指令式禁令**：口径固定五类排除（见 6.32），避免为凑数把描述性否定也改掉。
4. **标题按「靠什么成立」命名**，不按强度命名（`Top hard constraints` → `What this mode runs on`）。
5. **约定类保留禁令 + 加「约定」标记**：用户可接受约定存在，缺的是「这是道理还是约定」的区分。

### 2.12 发现与上抛

- **F1 计数不复现（需主 agent 收正台账 #1631）**：单面制后 EN 面中文禁类词 **0 处**；英文词面 **91 处 / 72 行**；已删中文镜像 12 处。「138 处」在本笔口径下不可复现——请按 2.2 读数收正。
- **F2 体量判据面错配**：`§6.11` 的 `103,529 / 143,572 / 1.387× / ≤8,000 帽` = **工具描述面**预算；提示词档合计 262,499 字符、单档最高 57,674，按 8,000 帽判会全档超帽。本批改用自设 ≤3%/档（2.8），请裁定是否另行给提示词面立帽。
- **F3 标题计数**：字面「铁律 / Iron law」在 16 档中 **0 处**；对应的规则块标题 4 个（`discipline-engineering.md:3` · `:29` · `common.md:179` · `discipline-normal.md:187`），已给处置。
- **[上抛·待裁] C1** `persona-engineering.md:99`（内部台账不播报）· **C2** `persona-engineering.md:203`（越界发现不回传）：两条是产品口径，我方不改写；若维持原意则只把句子留作约定并加标记。

### 2.13 计数收正（本段自查）

- 2.2 的「A 可改因 41 行 + 2 标题」应读作：**A 类 = 41 个词面行（其中 `common.md:179` 本身是标题）+ 3 个不在词面命中内的标题（`discipline-engineering.md:3` / `:29` / `discipline-normal.md:187`）= 44 个处置项**；41 + B4 + C2 + D25 = 72 行，总数不变。
- 2.4 的表共 **44 行**（含 4 个标题行），与上式一致。

- 交叉引用收正：2.1 第 3 行的「见 2.9」应为 **「见 2.8」**（每档字数表在 2.8）；2.4 标题的「41 行 + 2 标题」以上条 2.13 为准。

### 修正轮 1（设计评审 10 条 · 父侧全接受 · 2026-10-19）

| # | 处置 | 改动坐标（`docs/core/design/PROMPT-SYSTEM.md`） |
|---|---|---|
| 🔴1 | §6.32 补逐项坐标表（44 项：档·行 ∥ 原句摘要 ∥ 目标形（组）∥ 准入）+ 组文案表（G1–G16 逐字，唯一副本 = 节内）+ 受影响档点名（域行 16 档 / 基线表标 9 个改档） | `:951-1034` · `:912` · `:1036` |
| 🔴2 | 命名轴钉成一句可判口径 + 四项标题对照表（现名 ∥ 所在档·行 ∥ 新名 ∥ 依据类别） | `:940` · `:942-949` |
| 🔴3 | 逐档字符基线 ×16 + 两条可复跑计数式 + 验收表（5 行）+ 用例表（C1–C5）+ 体积预算（逐档 ≤3%、全量 ≤270,374） | `:1036` · `:1058` · `:1072` · `:1082` · `:1099` |
| 🔴4 | 先例 ∥ 偏离块：§6.31 处置批形（全形照抄）· §6.13 ∥ §6.28 围栏块形（**不采用**，理由 = 逐字目标句属各档终态，两份文本会对不齐）· §6.1「复用存量词句、语义对等」仍为本批口径；偏离 = 不出全档终态围栏块（44 项散 9 档、1400+ 行） | §6.32「先例 ∥ 偏离」块 |
| 🟡5 | 勘察证据行（查 `DOC-DISCIPLINE.md` D9 ∥ §6.11 ∥ §6.13 ∥ §6.28；余者已查无） | §6.32「勘察证据行」 |
| 🟡6 | 计数复算并钉死：词面 **91 处 / 72 行** = A41 + B4 + C2 + D25；处置项 **44 = 41 词面行 + 3 词面外标题**（= 4 标题 + 40 正文行）；改后残留 **35 处 / 31 行**；节内显式区分「三分类 = 写作依据」与「四分区 = 条目处置」 | `:920` · `:1092-1097` |
| 🟡7 | 域行 + 边界行（5 项不做）+ 窄化依据一句（用户令为「办法」层宽口，本节取模型可见且换句式不丢语义的一面） | `:912-918` |
| 🟡8 | §7 补 **D-PS42**（三条决策 + 理由 + 被否项）+ §6.1 登记一笔（紧凑形） | `:1147` · `:140` |
| 🟡9 | 归属关系行：§6.32 = D9 在提示词面的**应用面**，D9 = 上位机制；判据本体不重述（D2） | `:910` |
| 🔵10 | 两道准入的次序与判据（① 原句自带 why ⇒ 逐字复用；② 机制档坐标 ⇒ 须给坐标，给不出不得走②）+ 逐项表「准入」列逐项标注（42 项① / 2 项② = `persona-eng-coder.md:37` ∥ `:38`，坐标 = `common.md`「Batch record」节「The task book itself」行） | `:922-928` · `:953-998` |

**计数口径收正（本轮实测，父侧请按此收台账）**：旧式（`red line` 无复数、token 无词边界）读作 **92 处 / 73 行**——多读 `advisor-round2.md:13` 的 "may note"（假阳）；新口径（各 token 加词边界 + `red lines?`）读作 **91 处 / 72 行**，即 §2.2 / 台账 `#1631` 的读数。单数形带边界则漏读 `common.md:179` ∥ `discipline-engineering.md:184`（复数形）⇒ 89 处 / 70 行。三种读数均实跑，口径与期望值写进 §6.32 用例 C4。

**改前/改后基准**：16 档 262,499 字符（逐档表在 §6.32「基线」）；词面 91 处 / 72 行；改后期望残留 35 处 / 31 行（B/C/D 不动区），逐档净增 ≤3%。

**本轮未做**：提示词正文零改（实施轮 = eng-coder）· §3 评审段零改 · 其他批次档零触。

**仍有待裁**：C 区两条产品口径（`persona-engineering.md:99` 内部台账不播报 ∥ `:203` 越界发现不回传）· 提示词面是否另立单档绝对帽（本批只设 3% 相对预算）。

**gate**：`doc_check(mode:"gate", docs:["docs/core/design/PROMPT-SYSTEM.md"])` = `DOC-CHECK GATE: PASS`（1 档全清，0 命中）。

### 修正轮 2（评审轮次 2 新增 🔴1 / 🟡1 · 父侧全接受 · 2026-10-19）

| # | 处置 | 改动坐标（`docs/core/design/PROMPT-SYSTEM.md`） |
|---|---|---|
| 🔴1 | 选 **(b)+(a) 同拍**：G8② 文案改成无词面命中（通则保留不窄化）⇒ 期望读数重算为 **39 处 / 35 行**；G1 的 4 处 `never` 显式登记为**保留位**（描述性否定，按口径不处置） | `:1007`（G1 文案补 `(refused / failed)` + 保留位注）· `:1027-1030`（G8② 子句替换 + 改后整行逐字）· `:931`（计数式无语义过滤 ⇒ 保留位口径）· `:1083`（验收表读数）· `:1093`（C1）· `:1104-1105`（残留计数 + 保留位登记） |
| 🟡1 | (a) 逐项表加**第 5 列「why 出处片段」**（①逐字引原句内片段 / ②写可核坐标）+ 准入改 **37① / 7②**；(c) 加「目标形粒度」行 + 逐项粒度列（默认**子句替换**，整行项 9 个）；(b) `:65` 按**子句替换**重写，通则不收窄成 manifest 个案 | `:953`（粒度行）· `:955-1002`（44 行 × 5 列）· `:927-928`（37/7 + 可核形）· `:1027-1030`（`:65` 逐字） |

**读数重算（逐行指认）**：词面 **91 处 / 72 行** = A 41 行（56 处）+ B 4 行（6 处）+ C 2 行（3 处）+ D 25 行（26 处）。

- 改后 B / C / D 原样保留 = **35 处 / 31 行**（清单在 `:1078-1099` 的 B / C / D 三表）。
- A 区 **52 处 / 37 行清零**；余 **4 处 / 4 行 = 保留位**：`advisor-design.md:60` ∥ `advisor-round2.md:46` ∥ `advisor-round3.md:42` ∥ `persona-eng-coder.md:37`，四处同为 G1 目标句里的 `a write that never happened`（描述性否定；计数式无该过滤，故读数仍计）。
- 合计 **39 处 / 35 行**——`advisor-design.md` 1 行 / `advisor-round2` 2 行 / `advisor-round3` 2 行 / `common.md` 13 行 / `discipline-normal` 2 行 / `persona-eng-coder` 2 行 / `persona-eng-designer` 1 行 / `persona-engineering` 12 行 = 35 行。
- **同句多处必须一并换**（否则落不回 39）：`common.md:55`（2 处）· `common.md:217`（2 处）· `common.md:234`（4 处 · 整行）· `persona-eng-coder.md:20`（2 处）· `persona-engineering.md:130`（2 处）。这 5 行的第 2 处正文已在逐项表「原句摘要」列点名，并在组文案表 G2 / G6 / G14 / G16③ 给出对应目标句。
- 验收命令不变（`:1068` 计数式），期望改 `occ 39 lines 35`。

**粒度选定**：默认 **子句替换**（只换含否定词的那一个子句，原句自带的原因句逐字保留）——理由 = 原句的 why 就住在那句里，整行重写会把它一起丢掉，正好抵掉本批的目的。**整行替换例外 9 项**：G1 四站（整行只有这一句）· `common.md:234`（4 处否定在同一分句簇）· 4 个标题（本行即标题）。

**`:65` 新逐字句**（通则保留，why 逐字复用，零词面命中）：见 `:1029`（组文案表 G8② 围栏块）。

**gate**：`doc_check(mode:"gate", docs:["docs/core/design/PROMPT-SYSTEM.md"])` = **`DOC-CHECK GATE: ERROR（引擎已更新…）`**——盘上 `tool-docs/doc_check.md` mtime（2026-10-19T00:44:14Z）晚于本会话进程启动（00:22:28Z），旧引擎读数不可信 ⇒ 按工具口径须**重启会话后复跑**，本轮无法自行取得 PASS。已用只读脚本自查行宽（>300 字符行 = 22，全在本轮改动区之外的历史行 / 表行 / 代码围栏内；本轮新增的 3 处长句已改入围栏块）。**该 ERROR 不是本轮引入**，需父侧重启后复跑确认。

**本轮未做**：提示词正文零改（实施轮 = eng-coder）· §3 评审段零触 · 其他批次档零触。

### 修正轮 3（父侧裁定 · 2026-10-19）：期望读数按实读收正 + `:184` 假阳性登记

| # | 处置 | 落点（`docs/core/design/PROMPT-SYSTEM.md`） |
|---|---|---|
| 🔴1 | 三处期望值按实读收正：改前 `occ 90 lines 71` · 改后 **`occ 38 lines 34`**；D 区 = **25 处 / 24 行**；算式 B 6/4 + C 3/2 + D 25/24 + G1 4/4 = 38/34（6+3+25+4 = 38 · 4+2+24+4 = 34）· A 区 56/41 中 52/37 清零（56−4 · 41−4） | `:1092` · `:1113` · `:1114` |
| 🔴2 | 基线口径收正（同一把尺子）：`91 处 / 72 行` → **`90 处 / 71 行`**——差额 = `discipline-engineering.md:184` 的 1 处 / 1 行：该行 `measured line` 的子串 `red line` 只在**无词边界**时命中，判据式带 `\b` 故 0 次。逐档基线表该档行随之 `4 / 4` → `3 / 3`（逐档和 90/71；其余 12 行不变） | `:1062` · `:1072` · `:1086` · `:1092` · `:1102` · `:1105` · `:1110` · `:1111` |
| 🔴3 | 假阳性登记（不处置 · 不改该行）：`discipline-engineering.md:184` 是普通名词短语、非禁类写法，判据带词边界故不计；**不得为凑数改写该行**（改它只能靠改词躲判据） | 新增条 `:1115` + 口径① `:1086` |
| 🟡4 | §2.5 第 4 行（`persona-engineering.md:74` ⇒ 拟改「(Structure convention) §6 is closed to declaration — the parent writes it.」）**撤回**：该行不改，保住 `never declarable` 才是设计 B 区 6 处 / 4 行；实施轮未动该行（本笔实测该行仍含 1 处 `never`，读数 B 6/4 成立）。§2.5 原文按本节 append-only 保留，其处置效力以本行覆盖 | 本段 |

**本笔实读（同一判据式 · 设计席 2026-10-19 复跑）**：`occ 38 lines 34`，与 §5.1 实施读数一致。

- 逐档和：改后 38/34 = 改前 90/71 − A 区清零 52/37；改前 90/71 = 逐档基线表 91/72 − `:184` 假阳 1/1。
- 分组实测：B 6 处 / 4 行 · C 3 处 / 2 行 · D 25 处 / 24 行 · G1 保留位 4 处 / 4 行；A 区 56 处 / 41 行中 52 处 / 37 行清零。
- 假阳实测：`\bred lines?\b` 对 `discipline-engineering.md:184` 命中 0；去词边界命中 1（`measu|red line| recording`）。同一行无 `red lines` 复数形 ⇒ 旧 §2.13 把 `:184` 归为「复数形漏读」的归因不成立，已按实测收正。

**本笔未做**：提示词正文零改（`:184` 明确不改）· 设计档 §6.32 与本段之外零触 · §3 / §5 零触。

## §3 设计评审（评审子代理）
**状态行**：评审完成（轮次 3：pass —— 轮次 1 十条 + 轮次 2 两条全闭，零新增（2026-10-19））



### 轮次 1（评审子代理）

### 设计评审（批 H · `PROMPT-SYSTEM.md` §6.32 禁类写法改因面）

评审对象 = 唯一在册文档 `thincoder/docs/core/design/PROMPT-SYSTEM.md`（984 行全文实读）；对象声明所述「设计载荷 = 批次档 §2」不在本轮文件清单内 ⇒ 未读、相关判断标注 unverified。

| # | Category | Severity | Issue | Suggestion |
|---|----------|----------|-------|------------|
| 1 | Requirements / Clarity | 🔴 | §6.32 只有原则，没有执行清单：A 档 44 项的「档 ∥ 行 ∥ 原句 → 目标形」在节内零出现，也没有指向其所在处的指针行。`:886` 自定位为「本段 = 该令在提示词面的长期口径」，`:898` 只给聚合计数（`词面命中 91 处 / 72 行`）⇒ 实施者无法知道改哪 44 句、改成什么、在哪个文件。同档每一节都有「落点（唯一副本 · 档 · 行 · 形态）」行（如 `:324` 的 `逐字文本 = 设计围栏块（一次性材料不混入本档——D2）`），本节零落点行。 | 补一条落点/指针：逐项坐标表（档 ∥ 行 ∥ 原句摘要 ∥ 目标形 ∥ 依据类别）或明写清单所在载荷坐标 + 围栏块引用；同时补受影响档清单（本节现未点名任何一档，只写「16 档」）。 |
| 2 | Clarity | 🔴 | 「4 个规则块标题改名」在节内无现名、无目标名：`:894` 只给原则——`规则块不以 `hard constraints` / `iron law` 命名`——`按「它靠什么成立」命名`；而「靠什么成立」有三答案（`:888` 的 `① 机制约束 ② 实测事故 ③ 用户裁决`），未定命名轴（按机制？按裁决？）。实施者既无法定位是哪 4 个块，也无法定新名。 | 补四项对照表（现名 ∥ 所在档/节 ∥ 新名 ∥ 依据类别），并把命名轴钉成一句可判口径（如「标题陈述该块赖以成立的机制/裁决」）。 |
| 3 | Acceptance criteria | 🔴 | 节内无验收面：无判据命令、无期望读数、无用例表（正常/边界/错误）。同档同形节有现成范式：`:849` 验收表（`\| 条目 \| 命令（仓根 `thincoder/`） \| 期望读数 \|`）· `:858` 用例表 · `:792` 判据命令自含。唯一可测约束 `改写预算 = 每档净增 ≤3%、全量净增 ≤3%`（`:896`）无口径、无命令、无逐档基线（`:898` 只给总量 `262,499 字符`），对照 `:286`（`（口径 = 逐档` `JSON.stringify…` 字符和——与机检同式`）` 同 `:292`（`node scripts/tool-schema-size.mjs`）——本节的 ≤3% 按现文不可核。 | 补验收表（逐档字符基线 × 16 + 计数命令 + 期望读数）、用例表（改前/改后读数、幂等复跑、域未失、错误防御），并给 91 处/72 行的可复跑计数式。 |
| 4 | Methodology · closest-precedent | 🔴 | 无「先例 ∥ 偏离」块。本档既有惯例几乎每节必备：`:557`（`**先例 ∥ 偏离 ∥ 桌面腿证据**：`）· `:725` · `:745`，且 `:136` 起每笔登记都为「→ §6.N · §7 D-PSxx」形。本节未写「照何先例的形状」也未写偏离理由 ⇒ 无法判断本次 44 项改写的形状是否沿用 §6.31 的处置批形（逐项处置表 + 验收 + 用例 + 边界 + 上抛），也未声明 `:140` 的 `复用存量词句、语义对等` 是否仍为本批铁口径。 | 补先例行：给出最接近先例坐标（本档 §6.31 处置批形 ∥ §6.10/:324 围栏块形 ∥ `:140` 复用词句口径）+ 对齐项；若偏离（如不出用例表 / 不出逐项表），明写偏离理由。 |
| 5 | Methodology · survey evidence | 🟡 | 无勘察证据行。本档自有产品规则要求设计档携此行：`:608`（`设计档落**勘察证据行**（无相关也照记）`）。缺行 = 未查或未记，且「无相关」同样是必须落字的答案。 | 补一行：查过哪些公共源文档（独立文档仓优先）∥ 有无相关；无相关也照记「已查无」。 |
| 6 | Doc state · 数值 | 🟡 | 分诊计数不自洽：`:898` 的 `词面命中 91 处 / 72 行` 与同句分类和不相容——`指令式 41 行 + 4 个规则块标题 · 约定 4 行 · 需用户裁 2 行 · 非禁令 25 行` = 76 行（≠72）；对象声明记 A = 44 项（≠41+4=45）。另节标题 `三类分诊`（`:884`）与正文四类条目（指令式/约定/需裁/非禁令）不同轴，读作两套分区。 | 复算并钉死一行：处数/行数/各类行数三者相加自洽；分诊分区口径与标题用词一致（三分类 = 写作依据，四分区 = 条目处置，二者在节内显式区分）。 |
| 7 | Scope / Clarity | 🟡 | 无「域」行、无「边界（不做）」行。`§6.6` 有显式域行（`:189` 的 `**域** = `thincoder-core/prompts/**` + `thincoder-core/tool-docs/**``），本节只有隐含的「提示词面」。未交代：`tool-docs/**` 是否同域、`subagent-base.md` 是否在内、中文机制档（大量「铁律/禁止」用语）为何不在本轮、模型可见代码串是否在域。用户令（`:886`）是「铁律/禁止/不许之类的**办法**」层面的宽口，本节窄到「16 档内的英文指令式否定」，窄化本身合理但缺一句依据。 | 补域行 + 边界行（含：不动的面与其理由；中文机制档不在本轮的依据；描述性否定/能力事实/参数字汇的排除已在 `:892`，域与边界仍需成行）。 |
| 8 | Methodology · 决策记录 | 🟡 | 无 §7 决策行（现末行 = `:943` 的 `\| D-PS41 \|`），也无 §6.1 落点清单登记（`:122`–`:139` 的注册串）。同档同形节均两者齐（如 `:136` `→ §6.28 · §7 D-PS39）`）⇒ 本批三条决策（不硬编因果 ∥ 标题命名轴 ∥ 逐档预算）无永久记录面。 | 补 D-PS42 行（决策 + 理由）与 §6.1 登记串一笔（紧凑形即可，先例 `:139`）。 |
| 9 | Document ownership | 🟡 | 「规则必须携 why」这条机制在本档已有归属登记：`:128`（`详解 = `docs/core/design/DOC-DISCIPLINE.md` §1 D9 块——本档不复制`）。§6.32 引同一句用户令（`知其所以然`）并自设判据，但未写与 D9 的关系（上位 / 提示词面应用 / 同义复述）⇒ 存在「同一机制两处活描述」的归属风险。是否措辞相抵 **unverified**（`DOC-DISCIPLINE.md` 不在本轮文件清单，未读）。 | 补一句归属关系行（§6.32 = D9 在提示词面的应用面 ∥ D9 = 上位；或明写 D9 不覆盖本面），避免两处各自成文。 |
| 10 | Requirements（advisory） | 🔵 | `:890` 为「可改因」开了第二道准入：`唯一合法依据 = 原句已带原因（或机制档里有坐标）`，与对象声明的 A 档准入「原句自带 why」不一致；第二道准入既可能诱发该段自己警告的硬编因果，也与 `:896` 的 ≤3% 净增预算相抵（补 why 必然加字，`削 why 到一句` 的兜底已在文）。44 项各自走哪道准入无从核对。 | 明写两道的适用次序与判据（机制档坐标 = 可核坐标，须给坐标），并在逐项表里标出各项所用准入。 |

**计数**：🔴 4 · 🟡 5 · 🔵 1（共 10 条）。可行性维度本身无阻断（纯文本改写、无代码分支、`thincoder-core/prompts/*.md` 为 `.md` 面，行数标注可豁免；但逐档字符基线仍是 ≤3% 的可核前提，已含第 3 条）。

**评审范围限制（须记）**：(a) 本仓无 document map 入册 ⇒ 文档归属只按本档自述坐标判，未做全仓归属核对；(b) 对象声明所述「设计载荷 = 批次档 §2」不在本轮文件清单 ⇒ 未读；若逐项清单/标题对照实际住在该处，第 1、2 条的可修形态退为「补一条指针行」，其实质缺口仍成立（本节现无任何指针）；(c) 项目标准文档未声明，方法与 4 步工作流按 `AGENTS.md` 与本档既有惯例判。

VERDICT: changes-required

### 轮次 2（评审子代理）

## 批 H 轮次 2 复核（设计评审 · `PROMPT-SYSTEM.md` §6.32）

复核面 = 轮次 1 十条发现的落盘（逐项坐标表 ∥ 标题对照表 ∥ 验收/用例表 ∥ 先例行 ∥ 勘察证据 ∥ 计数自洽 ∥ 域/边界行 ∥ D-PS42 ∥ D9 归属 ∥ 两道准入）+ 新引入的明显问题。实读：`PROMPT-SYSTEM.md`（1188 行）§6.1 `:100-144` · §6.32 `:906-1101` · §7 `:1103-1147`；批次档 `2026-10-19-tech-sweep-promptwhy.md` §2/§3 全文。

| # | Orig# | File | Severity | Status | Notes |
|---|-------|------|----------|--------|-------|
| 1 | 1 | PROMPT-SYSTEM.md:951 | 🔴 | Fixed | 逐项坐标表实位：`:951` `**逐项坐标表（44 项 = A 区全部处置项；「目标形（组）」列的逐字文案见下「组文案表」）**：`，表体 `:955`–`:994` = 40 正文行 + `:995`–`:998` = 4 标题 = 44 项；组文案表 `:1000` `**组文案表（逐字 · 实施轮照抄；唯一副本 = 本节）**：`（G1–G16 + H1/H2/H4 逐字）。受影响档已点名：域行 `:912` + 基线表 `本批改档` 列 9 档。逐组处数与表内行数相符（G1 4 ∥ G2 12 ∥ G3 3 ∥ G4 2 ∥ G5 1 ∥ G6 1 ∥ G7 2 ∥ G8 3 ∥ G9–G15 各 1/2 ∥ G16 5） |
| 2 | 2 | PROMPT-SYSTEM.md:940 | 🔴 | Fixed | `:940` `**标题命名轴（可判一句）**：标题陈述**该块赖以成立的机制或裁决**，不陈述服从强度`；`:942` `**标题对照表（4 项）**：`，H1–H4 各给 现名 ∥ 档·行 ∥ 新名 ∥ 依据类别（`:946`–`:949`） |
| 3 | 3 | PROMPT-SYSTEM.md:1074 | 🔴 | Fixed | 验收表 5 行（`:1074`–`:1080`）· 两条可复跑计数式（`:1061` / `:1067`）· 逐档字符基线 ×16 + 3% 帽（`:1038`–`:1056`）· 用例表 C1–C5（`:1084`–`:1090`）· 体积预算（`:1099`）。实算复核：16 档字符相加 = 262,499 ✓；逐档帽取整一致、逐档帽和 7,025 ≤ 全量上限 7,875 = 262,499×3% ✓；逐档 `词面命中` 列相加 = 91 处 / 72 行 ✓（例外见 N1：改后期望读数不成立） |
| 4 | 4 | PROMPT-SYSTEM.md:933 | 🔴 | Fixed | `:933` `**先例 ∥ 偏离**：`：`:935` 先例一 = §6.31 处置批形（全形照抄）· `:936` 先例二 = §6.13 ∥ §6.28 围栏块形（明写**不采用** + 理由）· `:937` 先例三 = §6.1「复用存量词句、语义对等」仍为本批口径 · `:938` `**偏离 = 不出「全档终态围栏块」**` |
| 5 | 5 | PROMPT-SYSTEM.md:931 | 🟡 | Fixed | `:931` `**勘察证据行**：已查 `docs/core/design/DOC-DISCIPLINE.md`…`，含 §6.11 / §6.13 / §6.28 逐一列举与「已查无」落字 |
| 6 | 6 | PROMPT-SYSTEM.md:1095 | 🟡 | Fixed | 计数已自洽并显式分轴：`:1095` `四分区（条目处置）= **A 41 行 + B 4 行 + C 2 行 + D 25 行 = 72 行**`（41+4+2+25 = 72 ✓）· `:1096` 44 = 41−1+3 的推导式在位 · `:920` 「三分类 = 写作依据 / 四分区 = 条目处置」显式不同轴 · 节标题 `:906` 已改为「逐项执行清单」（原「三类分诊」歧义已消） |
| 7 | 7 | PROMPT-SYSTEM.md:912 | 🟡 | Fixed | 域行 `:912` · 不在域 `:913`（tool-docs / `subagent-base.md` / 中文机制档 / 三包生产码 / 描述性否定五类口径）· 窄化依据 `:914` · 边界（本段不做）5 项 `:916`。与 §6.11 的 ≤8,000 帽归属无相抵 |
| 8 | 8 | PROMPT-SYSTEM.md:1147 | 🟡 | Fixed | `:1147` `| D-PS42 |` 三条决策 + 理由 + 被否项；§6.1 登记串 `:140` `**禁类写法改因面（提示词面 16 档）→ §6.32 · §7 D-PS42**` |
| 9 | 9 | PROMPT-SYSTEM.md:910 | 🟡 | Fixed | `:910` `**归属（与 D9 的关系）**：`，`本节 = D9 在**提示词面的应用面**`、判据本体不重述（D2）——两处活描述的归属风险已收口（`DOC-DISCIPLINE.md` 在本轮文件清单外，其措辞是否同义未核） |
| 10 | 10 | PROMPT-SYSTEM.md:922 | 🔵 | Fixed | 两道准入次序 + 判据已钉死（`:924` 准入① ∥ `:925` 准入②「须给坐标；给不出 ⇒ 不得走②」∥ `:926` 次序与兜底）· `:927` 42 项①/2 项② 与表内准入列一致（`:981` / `:982` = ②，余者 ①） |
| 11 | (new) | PROMPT-SYSTEM.md:1076 | 🔴 | New: 改后期望读数与本节已定稿的逐字目标文案相抵 | `:1076` `改后 `occ 35 lines 31`；残留坐标逐行落在 B / C / D 清单内（零新增）`；而 `:1000` 定「组文案表（逐字 · 实施轮照抄）」，其中 G1 文案 `:1003` `claiming it was written records a write that never happened` 在 4 处（`advisor-design.md:60` ∥ `advisor-round2.md:46` ∥ `advisor-round3.md:42` ∥ `persona-eng-coder.md:37`）各留 1 个 `never`；G8② 文案 `:1020` `A missing project manifest must not kill the session` 在 `persona-engineering.md:65` 留 1 个 `must not`。计数式 `:1061` 的正则无「描述性否定不计入」的过滤，而 `:929` 的口径把这类排除在外 ⇒ 逐字照抄后这 5 行仍是词面命中，且不在 B/C/D 清单内 ⇒ 实际应为 **≥ 40 处 / 36 行**（B/C/D 35 处/31 行 + 新增 5 处/5 行），`:1076` / `:1086`（C1）的期望读数与「零新增」判据按现文不可达成 | 
| 12 | (new) | PROMPT-SYSTEM.md:986 | 🟡 | New: 准入① 的登记不可核 + 目标形替换粒度未定，并已见一处语义收窄 | `:924` 准入① = 「**原句本身（或其同段邻句）已带原因**」，但表内只给 `原句摘要`、不给邻句，多条摘要本身无原因却标 ①：`:985` `| `persona-engineering.md:61` | walk DOWN, never up | G8 | ① |`（why 由 `:1019` 的改写句新供给）· `:986` `| `persona-engineering.md:65` | **Never brick the session** | G8 | ① |` ⇒ 42×① 的「不新造因果」保证在档内不可核。另一处可见语义收窄：`:1020` 把通则「Never brick the session」改成个案「A missing project manifest must not kill the session」，与 `:937`「复用存量词句、语义对等」相抵；且 `目标形` 未写「整行替换 / 子句替换」，两种读法产出的终态句不同 | 

**计数**：🔴 1 · 🟡 1（新增）；轮次 1 十条 = 10/10 已闭（9 Fixed + 1 Fixed-with-note）。

**评审范围注记**：对象声明为「批 H 轮次 2」，修正落点实测全在 `docs/core/design/PROMPT-SYSTEM.md`（§6.32 自 14 行扩到 ~196 行；§7 增 D-PS42；§6.1 增登记串）；同时按评审面声明实读了批次档 `2026-10-19-tech-sweep-bench.md`（= 批 B，其 §3 轮次 1/2 已在册，无本轮待验项）。`thincoder-core/prompts/**`（被改对象）、`DOC-DISCIPLINE.md`、`tool-docs/**` 均在文件清单外 ⇒ 相关读数标 unverified。

VERDICT: changes-required

### 轮次 3（评审子代理）

## 轮次 3 复核（设计评审 · `docs/core/design/PROMPT-SYSTEM.md` §6.32）

本轮只核实轮次 2 的两条开项（🔴 N1 期望读数与保留位登记、🟡 N2 粒度选定与准入可核/语义收窄），并复核轮次 1 的十条仍在位。实读面：`PROMPT-SYSTEM.md` `:906-1118`（§6.32 全段）· `:1164`（D-PS42）· `:128-145`（§6.1 变更流登记）。

| # | Orig# | File | Severity | Status | Notes |
|---|-------|------|----------|--------|-------|
| 1 | 1 | PROMPT-SYSTEM.md:953 | 🔴 | Fixed | `:953` `**逐项坐标表（44 项 = A 区全部处置项；「目标形（组 · 粒度）」列的逐字文案见下「组文案表」）**：`；表体 `:959`–`:998` = 40 正文 + `:999`–`:1002` = 4 标题 = 44 项；组文案表 `:1004` `**组文案表（逐字 · 实施轮照抄；唯一副本 = 本节）**：` |
| 2 | 2 | PROMPT-SYSTEM.md:942 | 🔴 | Fixed | `:942` `**标题命名轴（可判一句）**：标题陈述**该块赖以成立的机制或裁决**，不陈述服从强度`；`:944` `**标题对照表（4 项）**：` H1–H4 全给 现名/档·行/新名/依据 |
| 3 | 3 | PROMPT-SYSTEM.md:1088 | 🔴 | Fixed | 验收表 `:1090`–`:1096` · 计数式 `:1077` / `:1083` · 逐档字符基线 ×16 + 3% 帽 `:1054`–`:1072`（复算 16 档字符 = 262,499 ✓、帽和 7,025 ≤ 7,875 ✓、逐档命中列相加 91/72 ✓）· 用例表 C1–C5 `:1100`–`:1106` · 体积预算 `:1116` |
| 4 | 4 | PROMPT-SYSTEM.md:935 | 🔴 | Fixed | `:935` `**先例 ∥ 偏离**：`：先例一 §6.31 处置批形（全形照抄）· 先例二 §6.13 ∥ §6.28（明写不采用 + 理由）· 先例三 §6.1「复用存量词句、语义对等」· `:940` `**偏离 = 不出「全档终态围栏块」**` |
| 5 | 5 | PROMPT-SYSTEM.md:933 | 🟡 | Fixed | `:933` `**勘察证据行**：已查 `docs/core/design/DOC-DISCIPLINE.md`…`，逐源列举 + 「已查无」落字 |
| 6 | 6 | PROMPT-SYSTEM.md:1111 | 🟡 | Fixed | `:1111` `四分区（条目处置 = **A 41 行 + B 4 行 + C 2 行 + D 25 行 = 72 行**`（41+4+2+25 = 72 ✓）· `:1112` 44 = 41−1+3 的推导式 · `:920` 两套分类显式分轴 · 标题 `:906` 已改「逐项执行清单」 |
| 7 | 7 | PROMPT-SYSTEM.md:912 | 🟡 | Fixed | 域 `:912` · 不在域 `:913` · 窄化依据 `:914` · 边界 5 项 `:916`；与 §6.11 ≤8,000 帽归属不相抵 |
| 8 | 8 | PROMPT-SYSTEM.md:1164 | 🟡 | Fixed | `:1164` `\| D-PS42 \| **禁类写法改因面三条**` 三条决策 + 理由 + 被否项；§6.1 登记 `:140` `**禁类写法改因面（提示词面 16 档）→ §6.32 · §7 D-PS42**` |
| 9 | 9 | PROMPT-SYSTEM.md:910 | 🟡 | Fixed | `:910` `**归属（与 D9 的关系）**：`，`本节 = D9 在**提示词面的应用面**`、判据本体不重述（D2） |
| 10 | 10 | PROMPT-SYSTEM.md:927 | 🔵 | Fixed | 两道准入 `:924`–`:928`；`:927` `**本批 44 项**：**37 项走① · 7 项走②**`，与表内准入列逐行相符（②=`:963`/`:964`/`:968`/`:969`/`:970`/`:985`/`:986` 共 7 项 ✓）；`:928` 可核形 + 「两列都没有落字的项 ⇒ 不准改」 |
| 11 | N1 | PROMPT-SYSTEM.md:1092 | 🔴 | Fixed | `:1092` `改后 **`occ 39 lines 35`**；残留坐标逐行落在 B / C / D 清单（35 处 / 31 行）∪ G1 保留位（4 处 / 4 行）两个集合内（零新增）`；`:1113` `改后残留 = **39 处 / 35 行** = B 6 处 / 4 行 + C 3 处 / 2 行 + D 26 处 / 25 行 + **G1 保留位 4 处 / 4 行** ✓（A 区 56 处 / 41 行中 **52 处 / 37 行清零**）`（6+3+26+4=39 ✓ / 4+2+25+4=35 ✓ / 56−4=52 ✓）；`:1114` `**保留位（4 处 / 4 行 · 不处置）**：`advisor-design.md:60 ∥ …` 四处点名 + 不处置理由；`:1007` G1 文案唯一命中已自认（`:1008` `（唯一词面命中 = 句末 `never happened`，描述性否定 ⇒ 见「保留位」）`）；G8② 已改为不含词表句 `:1027` `**Bricking the session is not an option any project state overrides**`（原 `must not` 命中消失）⇒ 读数由「39+1」落到 39 |
| 12 | N2 | PROMPT-SYSTEM.md:955 | 🟡 | Fixed | `:955` `**目标形粒度**：默认 = **子句替换**（只换含否定词的那个子句，原句其余内容逐字保留）；粒度列标 **整行** 的项 = …`（整行项实测 9 处：`:959`/`:963`/`:968`/`:978`/`:985`/`:999`/`:1000`/`:1001`/`:1002`，与自报「整行例外 9 项」一致）；准入可核：表头 `:957` 增「why 出处片段（原句内逐字）」列，逐行落字 `:959`–`:1002`，`:928` 钉死「① 项的 why 逐字引在逐项表第 5 列」；语义收窄已撤：`:1027` `其后的原因句逐字保留（**通则不收窄成 manifest 个案**）`（原「A missing project manifest must not kill the session」个案化文本已不在盘） |

**计数**：轮次 1 十条 10/10 在位（Fixed）；轮次 2 两条 2/2 已闭（N1 Fixed · N2 Fixed）；本轮新增 🔴 0 · 🟡 0。

**VERDICT: pass**

**评审范围注记**：`thincoder-core/prompts/**`（被改对象）· `DOC-DISCIPLINE.md` · `tool-docs/**` 在评审文件清单外 ⇒ 相关逐字读数一律 unverified，本轮只核设计档内自洽与落字。

## §4 用户批准（主 agent）

**批准（2026-10-19 · 用户整批令）**

用户逐字：「技术待办现在就开始处理」·「全部开」·「接着派，别等」——覆盖本批批准门。设计已过三轮评审（末轮 = pass，🔴0）⇒ 实施获准。

**批准范围**：§6.32 的 44 项「禁类写法 → 因面写法」（9 档提示词、44 行、逐行 1:1 替换）。**G1 的 4 处 `never happened` 登记为保留位、不处置**（父侧裁定：描述性否定，改掉只能靠躲词）。

## §5 实施记录（eng-coder）
**状态行**：实施完成 2026-10-19



### 5.1 交付摘要（44 项照 §6.32 逐项落 · 9 档 · 44 行 1:1）

- 改动面：`thincoder-core/prompts/` 9 档 44 行（逐行 1:1 替换，行数零变；16 档结构计数 `##` / 标题节点与改前全等）。
- 粒度：默认子句替换（只换含否定词的子句，原句原因句逐字保留）38 行；整行替换 9 项 = G1 四站 · `common.md:234` · 4 个标题（H1–H4）。
- 改后计数实读（设计 `:1077` 命令，连跑两次同值）：**`occ 38 lines 34`**。
- 对账：B 6 处/4 行 + C 3 处/2 行 + D 25 处/24 行 + G1 保留位 4 处/4 行 = **38/34**；A 区 56 处/41 行中 **52 处/37 行清零**，余 4/4 = G1 保留位（四处 `a write that never happened`，描述性否定）。
- 残留坐标逐行落在 B/C/D 三表 ∪ G1 保留位，**零新增坐标**（唯一偏差是「少」不是「多」，见 5.2 第 1 行）。
- 差额 1 处/1 行 = `discipline-engineering.md:184`。该行原文（含前后半句，逐字）：
  `…and is judged dangling. **Inventory as-of readings** (a measured line recording where things stand now) and **review evidence quotes** (a line quoted from this round's read) each belong to their own face and are outside both forms.`
  命中的是 `measu|red line| recording`（`measured line` 的子串）：无词边界 `red lines?` 命中 1 次，带边界 `\bred lines?\b` **0 次**——该行对设计计数式的全口径零命中。⇒ 设计 D 区（`:1113`）把该坐标计入 26/25 是基线误判。按父裁定③**未动该行**（不为凑数改措辞）。
- 逐档字符（`String.length`，基线取 §6.32 `:1054`–`:1072`）：`advisor-design` 12,260→12,274（+14，帽 368）· `advisor-round2` 11,127→11,288（+161，帽 334）· `advisor-round3` 11,087→11,217（+130，帽 333）· `common` 42,953→43,080（+127，帽 1,289）· `discipline-engineering` 36,538→36,574（+36，帽 1,097）· `discipline-normal` 38,509→38,535（+26，帽 1,156）· `persona-eng-coder` 5,901→6,073（+172，帽 177）· `persona-eng-designer` 17,981→18,077（+96，帽 540）· `persona-engineering` 57,674→57,615（−59，帽 1,731）；合计 262,499→263,202（+703，上限 +7,875）；7 个未改档读数零变。

### 5.2 决策披露表

| # | 决策 | 依据 | 代价 / 说明 |
|---|---|---|---|
| 1 | 差额按实读报 38/34，不给 `:184` 造词 | 父裁定②③（判据描述现实，不逼现实就范） | 设计档 `:1092`/`:1113`/`:1114` 的期望值需设计席收正，本笔不动设计档 |
| 2 | `persona-eng-coder.md` 超帽（+225 > 177）⇒ 削 why 到一句 | 设计 C5（`:1106`）：削 why 到一句、保留「因」的去向、不删规则 | 删去 G14 新增的第二条 why「editing it puts a second pen on someone else's page」，保留原句 why「pen-domain discipline outranks going green」⇒ +172，帽内 |
| 3 | G8③ 未逐字照抄「Point-edit config through the settings tool」 | 该行上下文是 `manifest` 工具（`:67` 同句前段已写 `write <key> <value>` point-edits one node）；写 settings 工具会指错对象 | 保留本行原有正向规则句 + G8③ 的 why 逐字，规则与原因均在 |
| 4 | G2 两站不整段照贴，按站点取语义对等的那一句 | 组文案表 G2 括注（`:1011`）明写「各站取与原句语义对等的那一句，不整段照贴」 | 同档内出现两处同句（`advisor-round2.md:22` / `:29`），字节成本上升；评为 🔵，不改 |
| 5 | 4 处 G1 保留位不动 | 设计 `:1114`（描述性否定、不处置、登记保留位） | 读数因此停在 4 处/4 行，不再降 |

### 5.3 审计 / 评审轮次与终态

- **内部偏离审计（explore，只读，1 轮）**：44/44 逐项 as-designed；out-of-list 改动 0；丢失 why 0；9 档外零改；结论 `AUDIT: clean`。
- **advisor code review（同步，1 轮）**：发现 🟡2 / 🔵2 / 🔴0，`VERDICT: pass`。两条 🟡 都是报告面事项，非实现缺陷：① `:184` 的差额归因须按原文重写（见 5.1）；② 批次档 §2.5 给 `persona-engineering.md:74` 的「约定标记」处置与设计 B 区读数（保住 `never declarable` 才是 6 处/4 行）相抵 ⇒ 设计档优先，实施侧无缺陷，请父侧在 §6 收正陈旧行。
- **修正轮：0**（无 🔴；两条 🔵 为字节/冗余提示，不属本轮必改）。
- **终态：clean**。

### 5.4 验收读数

- 计数式一（`:1077`）：`occ 38 lines 34`（两次同值）。
- 计数式二（`:1083`）：16 档逐档行/字符/`##` 块/标题节点已贴（5.1 字符列；结构计数与改前全等）。
- `node scripts/prompt-refs-check.mjs`：`汇总：提示词面 69 档 · 代码面 463 档 · 命中 0` + `OK(prompt-refs): J1/J2/J3 三式零命中`。
- `doc_check(mode:"gate", target=thincoder)`：**ERROR（引擎已更新**：`tool-docs/doc_check.md` mtime 2026-10-19T00:44:14Z 晚于本会话进程启动 00:22:28Z）——非本轮引入，需重启会话后复跑；本轮未写 `docs/**` 面文档（只改 EN 提示词面，不在 `checkConfig.scanDirs`）。

### 5.5 交付表（对照任务书五条验收）

| # | 状态 | 要求 |
|---|---|---|
| ① | ✅ | 9 档 `git diff --stat`：`advisor-design 10∓ · advisor-round2 16 · advisor-round3 16 · common 92 · discipline-engineering 38 · discipline-normal 22 · persona-eng-coder 26 · persona-eng-designer 20 · persona-engineering 49`（工作树对 HEAD 的累计值，含先前各批未提交改动；本笔自身的逐档增量以 5.1 字符列为准） |
| ② | ✅ | 两条计数式原样输出：`occ 38 lines 34`；结构与字符读数见 5.4 |
| ③ | ✅ | 逐项核对：44 项全落；残留 34 行落在 B/C/D ∪ G1；分组对账 6/4+3/2+25/24+4/4 = 38/34 |
| ④ | ✅ | `prompt-refs-check`：命中 0，`OK` |
| ⑤ | ✅ | 本段（§5）已写 |

## §6 验证与收口（父代理）

**验证与收口（2026-10-19 · 父代理）**

**① 机检门**：`doc_check(mode:"gate")` = **PASS**（会话重启后；全域 197 档 0 命中）。

**② 实施验证读数**：
- 计数式一（设计 `:1077`，连跑两次同值）= **`occ 38 lines 34`**（设计期望 39/35，差额已追到成因并登记）
- 计数式二（设计 `:1083`）：16 档合计字符 **262,499 → 263,202**（+703，上限 +7,875）；`##` 块数与标题节点数逐档与改前**全等**；7 个未改档读数零变
- **44/44 逐项落地**（9 档 · 44 行 · 逐行 1:1 替换 · 行数零变）
- 残留 34 行**逐行**落在 B/C/D 三表 ∪ G1 保留位，**零新增坐标**
- `prompt-refs-check` = **OK**（提示词 69 档 · 代码面 462 档 · 命中 0）

**③ 差额登记（本批最该留给后来者的一条）**：设计基线 `91` 里混进了一个**不存在的东西**——`discipline-engineering.md:184` 的实文是 `(a measured line recording where things stand now)`，命中的是 `measu|red line| recording`，即 `measured line` 的子串。无词边界计 1 次、带 `\b` 计 0 次。**已写入设计档 `:1115` 假阳性登记条，并写明「不得为凑数改写该行」。**

**④ 单元测试零留存**：判据为两条计数式（可复跑），无测试档。

**⑤ 集成面**：提示词面回归 = `prompt-refs-check` 全域，无需另增用例。

**⑥ 修正轮落地前置**：修正轮 3（期望值改 38/34 + 基线 90/71 + 假阳性登记 + §2.5 处置撤回）**已落**。

**⑦ 搁置清单回核**：无。**⑧ 暂缓批复核：无**。

**⑨ 用户文档面同拍**：本批改的是**模型运行时读的提示词**——44 项逐项核过、字符帽内、结构零变 ⇒ 无行为回归。

**⑩ 保留位（不处置，有理由）**：`advisor-design.md:60` ∥ `advisor-round2.md:46` ∥ `advisor-round3.md:42` ∥ `persona-eng-coder.md:37` 四处 `a write that never happened`——**描述性否定**，不是禁令；改掉它只能靠躲词，句子反而更难读。
