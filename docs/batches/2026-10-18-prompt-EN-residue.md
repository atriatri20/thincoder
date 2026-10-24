# 2026-10-18 · prompt-EN-residue
> 六段 append-only，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 编制：主 agent · 2026-10-18 · 来源 = 用户 2026-10-18 23:24「A」——启 R1（`prompt-single-face` 已批准蓝图的第 1 轮）。R1 = 把 EN 运行面里**仍是中文的残留段**补译成英文：这些段是双份镜像漂移的另一半——删 CN 之后它们会是仓里唯一的中文块。。
> 台账 = #1682（core · 归批）。前情 = docs/batches/2026-10-18-prompt-single-face.md §2.9 R1（已收口 2026-10-18）。
## §1 讨论（主 agent）
**状态行**：已收口 2026-10-18
<§1 模板占位：本批条目 / 关键判据 / 授权口径>

### 讨论收敛（父侧 · 2026-10-18 23:25）

**用户令**：23:24「A」——启 R1（`prompt-single-face` §2.9 已批准蓝图的第 1 轮）。

**R1 是什么**：把 EN 运行面（`thincoder-core/prompts/**`）里**仍是中文的残留段**补译成英文。这些段是双份镜像漂移的另一半——CN 删除后，它们会是仓里仅存的中文块。

**父侧实测（新进程逐档扫，2026-10-18 23:24）—— 与蓝图的「7 处」不符**：

| 面 | 读数 |
|---|---|
| 含中文的行（14 档） | **100 行** |
| 其中中文 ≥8 字（多半是散文段） | **38 行** |
| 其中中文 <8 字（多半是枚举值 / 标识符） | **62 行** |

**必须保留中文的那一类（不能译）**：`ledger` 的六态值（待讨论 / 待设计 / 在途 / 待核销 / 已核销 / 已废弃）与 `trigger` 三值（归批 / 条件 / 认账不排期）——**它们是工具的实参值**，译成英文会导致工具拒收。用户逐字引语、需要机检的中文判据串同理。

**散文段分布（须译）**：`advisor-design:34` · `advisor-round2:44`–`46` · `advisor-round3:40`–`42` · `common:143/182/222/237`（4 段标题）· `persona-eng-coder:22/26/29/33`–`38`（5 段标题 + 交付协议）· `persona-engineering:74`–`77/194`–`197/211/214`–`215`（内含枚举值，须保留枚举、译外围）· `persona-normal:17` · `discipline-normal:98/101`–`103` 等（多为枚举值夹在英文句中 ⇒ 保留枚举即可）。

**父侧判断（如实说）**：蓝图的「7 处」是从上一批的对账表继承来的，那次对账漏了**散文段之外的存量中文**——今晚第四次出现「清单数字偏低」。**这次按实测做**：R1 的范围 = **38 行散文段**（枚举值一律保留），不再按 7 处执行。

### 父侧裁定（2026-10-18 23:28 · 对 `eng-designer#1` 两项上抛）

**① 父侧「38 行散文段」的判定被设计席纠正 —— 采纳它的读数**

15 行中文**本身就是载荷**（枚举链 / 机判字面 / 机读标记），译了就是坏。真散文 = **23 行**。分类结果：**译 64 · 译＋保留枚举 5 · 保留 31**。

**父侧错在哪**：我用「汉字数 ≥8」当散文判据，而 `在途 → 待核销 → 已核销` 这种迁移链汉字很多、**恰恰最不能译**。计数能筛出「有中文」，筛不出「中文是不是载荷」——**这一步只能逐行判**。

**② 7 行「零汉字、只含全角标点」——判为**本批范围内**（同批顺手归一）**

`common:10/183` · `discipline-engineering:47` · `persona-eng-designer:37/71` · `persona-engineering:3/115`：零汉字、零语义、零行数变化（全角标点 → 半角 / 相应英文标点）。理由：EN 运行面是英文面，混入的全角标点是同一类残留；**分两批做只是多一轮**。设计席须把这 7 行补进 §2.5 表（类别 = 标点归一），否则实施轮没有落点。

**③ `PROMPT-SYSTEM.md` §6.30 是「新规则」不是「翻译」——父侧如实标注**

设计席新增了 §6.30「EN 运行面的语言纪律」（EN 散文一律英文；中文只许 K1–K4 四类字面，各带机械依据）。**这不是 R1 的原文范围**（R1 = 补译残留），属**新语义**。父侧判：**保留**，理由 = 残留会反复长回来，而这条规则是它的守门判据；但**必须在设计评审里单独受审**，不许搭着翻译蒙过去。评审若判它越界，则移出本批另立。

### 父侧裁定（2026-10-18 23:43 · 对 `eng-designer#10` 两处异议）

**① P1 补回句的位置 —— 采纳它的位置，不按我的指令**

- 我写「放在 `would be a second source` 之后」，它按 `git diff` 的**原文位置**补（`batch record §3` 之后、`(no path parameter;` 之前），理由 = 这句解释的是「为什么要写 §3 条目」，挂在写 §3 那句上才对。
- **裁定：采纳它的。** 我的指令位置会把原因句挂到「评审戳」那句上，**语义挂错**——那就不是「还原原文」，是「另造一句」。

**② 三档 advisor 要不要统一带该句 —— 不统一（判「不加」）**

- 实证：`git diff` 显示 `advisor-round2.md:45` / `advisor-round3.md:41` 的原文**从来就没有这句**，所以 §2.5 原写「同 `advisor-design:59` 整行（逐字同）」是**错的**，它改成「同整行，但去掉该句」是对的。
- **裁定：不统一。** 给两档补一句它们从没有过的英文 = **新增内容**，而本批的任务是「把已有中文译成英文」，不是「把三档改齐」。**三档措辞本就不齐**是既有事实，属另一根轴（要不要对齐 = 另批另议）。
- **记一句原则**：**「看起来同形」不等于「稿件同源」**——今晚第三次栽在这上面（`advisor:8` 坐标、36 行读数、这次的同位副本）。

**连带**：`§4` / `§5` 记的「107 行」与本批 §2 的 **108** 差 1（`:12` 新入表）——§6 收口时以 §2 的 108 为准，§4/§5 的旧数按记录面保留（它们是当时读数）。

## §2 批次任务与设计（eng-designer）
**状态行**：设计完成
<§2 模板占位：本批条目（覆盖） / 设计档落点 / 机制设计 / 受影响文件与测试覆盖 / 验收对照 / 关键决策 / 上抛项>

**状态行**：设计完成（2026-10-18 · 修订 3 —— §2.5 表内补漏 4 处 + §2.9 E2 判据校正）

### 2.1 本批条目（覆盖）

| # | 条目 | 判据 |
|---|---|---|
| E1 | `thincoder-core/prompts/**` 里承载规则/解释的中文散文 → 英文 | 译后逐行分类表中「译」与「译＋保留枚举」两类全部落英文；`thincoder-core/prompts/**` 内四类保留字面之外的中文行 = 0 |
| E2 | 工具实参 / 机判字面一字不动 | 六态 6 串 + trigger 3 串逐个 grep 在场；K2 十串中 7 串在场（3 个状态词本面不存在，0 = 不适用）+ K3 五串在场 |
| E3 | 逐行分类有据（不译必给类别 + 理由） | 108 行逐行表（含汉字 100 + 零汉字标点 8），每行带类与处置；「保留」类逐条给理由 + 机制坐标 |

**不在本批**：CN 镜像（`docs/core/design/prompts/**`，要删的副本）· 机制文档（`docs/core/design/*.md` 除本批 §2.4 那一节）· 产品代码 · `tool-docs/**`。

### 2.2 父侧读数校正（本设计的第一产出 = 分类，不是译文）

我的独立扫描（node 直跑，`thincoder-core/prompts/*.md` 16 档全量）与父侧一致：**含汉字 100 行 · 汉字 ≥8 字 38 行 · <8 字 62 行**；分布逐档相等。另有 **8 行只含全角标点、零汉字**（原记 7 行 + `persona-engineering:12`；父侧裁定②已判**本批范围内**——见 §2.7）。

**但「38 行散文段（须译）」这个前提不成立**：38 行里 **15 行的中文本身就是载荷**（枚举链 / 机判字面 / 机读标记），按判据必须保留；真正要译的散文 = **23 行**。样本：`persona-engineering.md:195` 汉字 25 个，内容是 `在途 → 待核销 → 已核销` 的迁移链（K1），不是散文。

### 2.3 分类口径（四类保留 + 两类译）

| 类 | 判据 | 处置 |
|---|---|---|
| K1 工具实参枚举 | `ledger` 六态 · `trigger` 三值 | 一字不动 |
| K2 批次档机判字面 | `**状态行**：` · `进行中` / `已收口` / `设计完成` / `评审完成` / `实施完成` · `> 不适用` · `<§N 模板占位：` · `前情 = ` · `**重开记录**：` | 一字不动 |
| K3 机产 / 机读标记 | `[上抛·待裁]` `[上抛·知会]` · `收尾链待跑` · `老化` · `### 轮次 N（评审子代理）` | 一字不动 |
| K4 记录面 / 输入面复写 | 枚举以 `docs/core/design/PROMPT-SYSTEM.md` §6.30 K4 行为唯一权威（记录面约定串 + 用户中文别名）；本段按类引用，不重列 | 一字不动 |
| 译 | 中文承载规则 / 解释 | 整句英译，**不增语义、不删限定词**、沿用该档既有语感 |
| 译＋保留枚举 | 中英混排 | 译外围，字面原样嵌回 |

**机械依据（我实读的代码坐标，不是推断）**：

- `ledger-db.mjs:161/167`（库表 `CHECK` 六态 + trigger 三值）· `ledger-tools.mjs:107/117`（工具 `enum`）· `ledger-cmd.mjs:69`（`在途/待核销` 写面谓词）· `agent/dispatch.mjs:90`（在途行判定）。
- `batch-skeleton.mjs:35-38`（`STATUS_WORDS` 五词）· `:61`（`STATUS_LINE_RE`）· `:221`（`EXCLUDED_LINE_RE`：`> 不适用` ∥ `<§N 模板占位：`）· `batch-lifecycle.mjs:291`（`**重开记录**：` 追记行）。
- `agent-tools/parent-channel.mjs:155`（`KIND_MARK`）· `agent/light-round.mjs:25`（`ROUND_MARKER = "收尾链待跑"`）· `ledger.mjs:137`（`（老化 n）` 渲染）。

**`未写入` 在核内零代码引用**（grep 全核 `.mjs` 无命中）⇒ 属可译串，判据成立。

### 2.4 设计档落点

`docs/core/design/PROMPT-SYSTEM.md` **§6.30「EN 运行面的语言纪律（中文只许出现在四类字面上）」**——本批已落（长期面：规则 + 四类字面 + 机械依据 + 判据 + 边界）。逐行表与逐字英文定稿 = 本段（一次性执行材料，不进设计档）。

### 2.5 逐行分类表（108 行 = 含汉字 100 行 + 零汉字标点 8 行 · 全部）

列：`档:行 → 类 → 处置 → 改后整行`（译类 = 可直接落的整行；保留类 = 原文不动，理由见 §2.6）。

**advisor-design（3）**

| 坐标 | 类 | 改后整行 |
|---|---|---|
| advisor-design:34 | 译 | `- **The \`Suggestion\` column carries the fix, not the executor** — an attribution sentence reads as "not mine" and the whole findings table gets bypassed: forbid attribution-shaped phrasing ("to be corrected by the main agent / parent side"), since downstream reads it as "not my job" ⇒ **the entire findings table is skipped**; who disposes of an item is decided when the parent dispatches. **Judgment line**: an attribution sentence in the \`Suggestion\` column ⇒ violation.` |
| advisor-design:59 | 译＋保留枚举（K3 工具戳） | `Design-review only (**applicable only when this review is a design review and the tool face has \`batch\` mounted** — code review has no such tool, so this section does not apply): in addition to the report, use \`batch({action:"append", segment:"§3", text})\` to write this round's **findings table + VERDICT + counts verbatim** into batch record §3 — a review that leaves no §3 entry leaves the parent nothing to settle (no path parameter; the tool stamps its own \`### 轮次 N（评审子代理）\` source marker, so a heading you write yourself would be a second source).` |
| advisor-design:60 | 译 | `If the write does not land (refused / failed) → say "§3 not written" plainly in the report — never skip it silently: a silent skip lets the parent proceed as if the record were on disk, and never pretend it was written (a parent-side ghost-write must be marked).` |

**advisor-round2（3）**

| 坐标 | 类 | 改后整行 |
|---|---|---|
| advisor-round2:44 | 译 | `## Batch-record §3 landing (design review only — tool mounted)` |
| advisor-round2:45 | 译＋保留枚举（K3） | 同 `advisor-design:59` 整行，**但去掉** `— a review that leaves no §3 entry leaves the parent nothing to settle ` 一句——该档原文从无此句（`git diff` 可证，改前即无），各档以自身原文为准；其余逐字同 |
| advisor-round2:46 | 译 | `If the write does not land (refused / failed) → say "§3 not written" plainly in the report — never skip it silently, and never pretend it was written (a parent-side ghost-write must be marked).` |

**advisor-round3（3）**

| 坐标 | 类 | 改后整行 |
|---|---|---|
| advisor-round3:40 | 译 | `## Batch-record §3 landing (design review only — tool mounted)` |
| advisor-round3:41 | 译＋保留枚举（K3） | 同 `advisor-design:59` 整行，**但去掉** `— a review that leaves no §3 entry leaves the parent nothing to settle ` 一句——该档原文从无此句（`git diff` 可证，改前即无），各档以自身原文为准；其余逐字同 |
| advisor-round3:42 | 译 | 同 `advisor-round2:46` 整行 |

**common（31）**

| 坐标 | 类 | 改后整行 |
|---|---|---|
| common:3 | 译 | `## Language` |
| common:10 | 标点归一 | `Few parentheses (nesting buries the main clause); no stacking of ∥ ⇒ or paired-bracket marks — tables and \`file:line\` when they earn their keep, prose stays prose.` |
| common:13 | 译 | `## Check the docs before you ask` |
| common:22 | 译 | `## Who you are` |
| common:27 | 译 | `## When choices conflict` |
| common:33 | 译 | `## Instruction precedence — on conflict, in this order, high to low` |
| common:42 | 译 | `## Evidence discipline` |
| common:49 | 译 | `## Document writing discipline — semantic merge, no script ghost-writing` |
| common:51 | 译 | 整句同原文，仅 `no 历史沿革 (user ruling 2026-10-15)` → `no lineage section (user ruling 2026-10-15)` |
| common:53 | 译（+ 指针跟改） | 整句同原文，仅 `in the "指令优先级" section` → `in the "Instruction precedence" section`（跟着 :33 的标题改，否则断指针） |
| common:60 | 译 | `## Stop and report` |
| common:67 | 译 | `## Upstream channel — subagents and their parent` |
| common:100 | 保留原文（K3） | 不动（`[上抛·待裁]`） |
| common:101 | 保留原文（K3） | 不动（`[上抛·知会]`） |
| common:107 | 译 | `## Tool discipline` |
| common:108 | 译 | `### Search tool priority` |
| common:129 | 译 | `### Codebase exploration order` |
| common:132 | 译 | `### Parallel call principles` |
| common:137 | 译 | `### Steering your own context` |
| common:143 | 译 | `## Tool routing — write-type scenarios route per the table, not bash` |
| common:182 | 译 | `## System interface — reading the reminder fields each role receives` |
| common:183 | 标点归一 | `(Slot note — each persona file may override with the semantics of the fields that role actually receives.)` |
| common:206 | 译 | `    - **History** — superseded statements, changelog, lineage notes, "previously X".` |
| common:219 | 译 | `## Ledger — the project's todo book` |
| common:222 | 保留原文（K1） | 不动（六态全串） |
| common:225 | 译 | 整句同原文，仅 `「登记」-style in-doc registration` → `a "noted on the record" registration inside a doc` |
| common:228 | 译 | `## Batch record — the carrier of task flow` |
| common:233 | 译 | 整句同原文，仅 `say "§× 未写入" plainly` → `say "§× not written" plainly` |
| common:237 | 译 | `## Doc vs process — state goes in the state doc, process in the process doc` |
| common:256 | 译 | `## Product common sense` |
| common:259 | 译 | `## Security discipline` |

**discipline-engineering（4）**

| 坐标 | 类 | 改后整行 |
|---|---|---|
| discipline-engineering:47 | 标点归一 | `**Light channel (detail-face ∥ convergence-face controlled bypass — hit one of the three ⇒ walk; bypass ≠ cancellation)**: any one of the three below ⇒ skip the "Design → Review → Approval" chain — direct edit → live walkthrough → freeze:` |
| discipline-engineering:174 | 保留原文（K1） | 不动（`归批` / `条件` / `认账不排期`） |
| discipline-engineering:188 | 译 | 整句同原文，仅 `no changelog section, no 历史沿革` → `no changelog section, no lineage section` |
| discipline-engineering:193 | 译 | 整句同原文，仅 `findstr /c:"<中文>"` → `findstr /c:"<Chinese text>"` |

**discipline-normal（11）：全部保留原文**

| 坐标 | 类 | 理由 |
|---|---|---|
| discipline-normal:98 | 保留原文（K1） | 六态全串在英文句中 |
| discipline-normal:101 | 保留原文（K1） | `在途` + 迁移链 |
| discipline-normal:102 | 保留原文（K1） | trigger 三值 |
| discipline-normal:103 | 保留原文（K1） | `在途 → 待核销 → 已核销` |
| discipline-normal:124 | 保留原文（K1） | `已核销` |
| discipline-normal:126 | 保留原文（K2） | `已收口`（冻结门词） |
| discipline-normal:237 | 保留原文（K4） | `会诊` = 用户输入别名，非翻译注 |
| discipline-normal:245 | 保留原文（K4） | `会诊` / `会诊一下` = 用户原话 |
| discipline-normal:252 | 保留原文（K4） | `飞刀` 别名 |
| discipline-normal:258 | 保留原文（K4） | `飞刀 is the Chinese alias` |
| discipline-normal:259 | 保留原文（K4） | `飞刀` / `飞刀一下` = 用户原话 |

**persona-coder（3）**

| 坐标 | 类 | 改后整行 |
|---|---|---|
| persona-coder:3 | 译 | `## Role: controlled implementation coder` |
| persona-coder:10 | 译 | `## Permission boundary (write gate)` |
| persona-coder:14 | 译 | `## Reporting duty` |

**persona-eng-coder（12）**

| 坐标 | 类 | 改后整行 |
|---|---|---|
| persona-eng-coder:3 | 译 | `## Role: the authorized implementer` |
| persona-eng-coder:13 | 译 | `## Boundary: the design is the authoritative spec` |
| persona-eng-coder:19 | 译 | 整句同原文，仅 `doc_check: PASS（N 档）` → `doc_check: PASS (N docs)` |
| persona-eng-coder:22 | 译 | `## Self-contained delivery protocol (overview)` |
| persona-eng-coder:26 | 译 | `The delivery table follows the shared layer's unified format; audit / review rounds and the terminal state go into the report (role supplement).` |
| persona-eng-coder:29 | 译 | `## file-domain declaration semantics = the expected touch surface (scheduling queue + transparent-disclosure baseline) — not an authorization boundary; going beyond the declaration ≠ overreach, just disclose it truthfully (user ruling 2026-09-10)` |
| persona-eng-coder:33 | 译 | `## Batch-record discipline (six segments, self-written · executor refusal)` |
| persona-eng-coder:34 | 译 | `- **§5 is yours to write** (**one segment, one author**): §1 main agent / §2 eng-designer / §3 review subagent / §4 main agent / **§5 you** / §6 parent —` |
| persona-eng-coder:35 | 译 | `  the delivery summary / decision-disclosure table / audit and code-review rounds and terminal state / fix rounds land in **batch record §5**, not via the parent's paraphrase (a paraphrase is a distortion source).` |
| persona-eng-coder:36 | 译 | `  Write means = the \`batch\` tool \`batch({action:"append", segment, text})\` (**no path parameter** — the target is the batch record bound at your spawn; the segment number follows from your identity: eng-coder → §5);` |
| persona-eng-coder:37 | 译 | `  write fails (refused / failed) → say "§5 not written" plainly in the report — never skip it silently, and never assume the parent will ghost-write on your behalf.` |
| persona-eng-coder:38 | 译 | `- **Executor refusal**: no task book found (batch record §2 / the \`batchDoc\` path unreadable) → **do not execute — bounce it back** — never fabricate a task book and carry on.` |

**persona-eng-designer（5）**

| 坐标 | 类 | 改后整行 |
|---|---|---|
| persona-eng-designer:37 | 标点归一 | 整句同原文，仅 `「exploration budget ≤6 explore spawns / batch」` → `"exploration budget ≤6 explore spawns / batch"`；**`existing` 与引号之间一个半角空格**——改后该处逐字 = `the existing "exploration budget ≤6 explore spawns / batch"` |
| persona-eng-designer:48 | 译 | 整句同原文，仅 `doc_check: PASS（N 档）` → `doc_check: PASS (N docs)`（与 `persona-eng-coder:19` 同串同改） |
| persona-eng-designer:55 | 译 | `   Write means = the \`batch\` tool, \`batch({action:"append", segment, text})\` (**no path parameter** — the target doc is bound at your spawn, the segment number is determined by your identity: eng-designer → §2); write fails (refused/failed) → the report states "§2 not written".` |
| persona-eng-designer:71 | 标点归一 | 整句同原文，仅 `states「decision + rationale」directly` → `states "decision + rationale" directly` |
| persona-eng-designer:88 | 译 | 整句同原文，仅 `**conclusions + \`号 → 改动 file:line\`** (number → change file:line)` → `**conclusions + \`number → change file:line\`**` |

**persona-engineering（22）**

| 坐标 | 类 | 改后整行 / 理由 |
|---|---|---|
| persona-engineering:3 | 标点归一 | `[Engineering mode — engineering discipline is in force for this session.]` |
| persona-engineering:12 | 标点归一 | `The go-ahead lasts until one of three things — (i) the scope changes (ii) the user calls a stop (iii) the batch runs to completion; work outside the batch still waits for a new go-ahead.` |
| persona-engineering:74 | 保留原文（K2） | 不动：`**状态行**：` · `> 不适用：§N` · `<§N 模板占位：…>` 三串均在 |
| persona-engineering:75 | 保留原文（K2） | 不动：`已收口 <date>` · `进行中` · `**重开记录**：…` 行形 |
| persona-engineering:76 | 保留原文（K2/K3） | 不动：`「暂缓 · 复核条件」` 标记 + `进行中` |
| persona-engineering:77 | 保留原文（K2） | 不动：`前情 = … §N（已收口 <日期>）`（`前情 = ` 由 batch create 剥离） |
| persona-engineering:88 | 译＋标点归一 | 整句同原文，仅 `report as「号 → 改动 file:line」(number → change file:line)` → `report as "number → change file:line"`，并把 `㈠` `㈡` `㈢` → `(i)` `(ii)` `(iii)`、`「**this round does NOT do**」` → `"**this round does NOT do**"` |
| persona-engineering:96 | 保留原文（K1） | 不动：`归批` / `认账不排期` |
| persona-engineering:99 | 保留原文（K3） | 不动：`老化`（台账渲染字面） |
| persona-engineering:107 | 保留原文（K1） | 不动：`在途` |
| persona-engineering:108 | 保留原文（K1） | 不动：`在途` |
| persona-engineering:109 | 保留原文（K3） | 不动：`收尾链待跑`（`ROUND_MARKER`） |
| persona-engineering:115 | 标点归一 | 整句同原文，仅 `**must carry「round」**` → `**must carry "round"**` |
| persona-engineering:116 | 保留原文（K4） | 不动：`已查无` = 写进中文任务书的字面 |
| persona-engineering:151 | 保留原文（K4） | 不动：`评审通过` = 写进中文批次档 / 台账 evidence 的字面 |
| persona-engineering:194 | 保留原文（K1） | 不动：`待讨论 → 待设计 → 在途` |
| persona-engineering:195 | 保留原文（K1） | 不动：`在途 → 待核销 → 已核销` 两步链 |
| persona-engineering:196 | 译＋保留枚举（K4） | 整句同原文，仅删括注 `(authority = \`docs/core/design/DOC-DISCIPLINE.md\` §3.20 交付时点强制)`——文档指针按 **§6.6 删引用（非改址）** 删除，其余英文句自足；`「暂缓批复核：无」`（K4）保留；另 `「doc-check gate: no doc changes」` 的全角引号 → 半角（引号内纯英文，见 §2.7 引号归一） |
| persona-engineering:197 | 译＋保留枚举（K1） | `- **New debt found** (**in-scope** review findings / stop-and-report output / doc drift) ⇒ **book it the same day** — a tech todo must carry \`trigger\` (**bare enum**: \`归批\` / \`条件\` / \`认账不排期\` — the batch name / condition sentence goes into \`evidence\`, **never into \`trigger\`**, because a value written as prose cannot be filtered on); a debt left in report prose, a code comment, or a "noted on the record"-shaped note is seen by nobody again.` |
| persona-engineering:211 | 译 | `**Family rows**: scattered rows on the same work object ⇒ **collapse into one family row** (one row = one work object; the title carries the member list; members **close within the same batch / round**) — the pre-ignition scan reads the whole picture at a glance. "Dedupe on booking" governs the registration moment; family rows govern the merging form of existing rows; same axis as *One row = one settlement unit*: **split** = unrelated items are not tied together, **merge** = one work object is not split apart.` |
| persona-engineering:214 | 保留原文（K1） | 不动：trigger 三值 |
| persona-engineering:215 | 译＋保留枚举（K3） | `  trigger-less entries go into the "to dispose" list, entries older than 30 days get marked 「老化」(aging) — report is read-only, disposal is a human judgment (you and the user).` |

**persona-explore（2）**

| 坐标 | 类 | 改后整行 |
|---|---|---|
| persona-explore:3 | 译 | `## Role: read-only scout` |
| persona-explore:7 | 译 | `## Reporting duty` |

**persona-normal（5）**

| 坐标 | 类 | 改后整行 |
|---|---|---|
| persona-normal:5 | 译 | `## Capability boundary` |
| persona-normal:9 | 译 | `## Role and collaboration stance` |
| persona-normal:17 | 译 | `## Confirmation and approval gate (confirm before writing files)` |
| persona-normal:26 | 译 | `## In-flight ask — non-blocking steer during long runs` |
| persona-normal:43 | 译 | `## System interface (fields this role receives)` |

**persona-plan（3）**

| 坐标 | 类 | 改后整行 |
|---|---|---|
| persona-plan:3 | 译 | `## Role: read-only planner` |
| persona-plan:8 | 译 | `## Permission boundary (read-only)` |
| persona-plan:12 | 译 | `## Reporting duty` |

**subagent-base（1）**

| 坐标 | 类 | 理由 |
|---|---|---|
| subagent-base:16 | 保留原文（K3） | 不动：`[上抛·待裁]` / `[上抛·知会]` = `KIND_MARK` 机产标记 |

### 2.6 改后仍携中文的每一行（36 行 · 逐行实测，与 §2.10 ① 逐档读数同源）

判据 = 译后该行是否仍含 K1–K4 字面（逐行读过原文后判定，不是公式套算）。

| 类 | 行 | 小计 |
|---|---|---|
| K1 工具实参枚举（原样保留） | common:222 · discipline-engineering:174 · discipline-normal:98/101/102/103/124 · persona-engineering:96/107/108/194/195/214 | 13 |
| K2 批次档机判字面（原样保留） | discipline-normal:126 · persona-engineering:74/75/76/77 | 5 |
| K3 机产 / 机读标记（原样保留） | common:100/101 · subagent-base:16 · persona-engineering:99/109 | 5 |
| K4 记录面 / 输入面复写字面（原样保留） | discipline-normal:237/245/252/258/259 · persona-engineering:116/151 | 7 |
| 译＋保留枚举（K3 评审戳 `### 轮次 N（评审子代理）`） | advisor-design:59 · advisor-round2:45 · advisor-round3:41 · persona-engineering:215 | 4 |
| 译＋保留枚举（K1 trigger 三值） | persona-engineering:197 | 1 |
| 译＋保留枚举（K4 `「暂缓批复核：无」`） | persona-engineering:196 | 1 |
| **合计** | — | **36** |

`discipline-normal:245/259`（`会诊一下` / `飞刀一下`）归入 K4 —— 它们是用户原话、同时是别名，不另立第五类（避免跨类重复计数）。

**为什么必须留（逐类机械依据）**：

- K1 = 库表 `CHECK` 与工具 `enum` 的字面（`ledger-db.mjs:161/167` · `ledger-tools.mjs:107/117`），`在途/待核销` 还参与写面谓词（`ledger-cmd.mjs:69`）与轮次闸（`agent/dispatch.mjs:90`）——译 = 工具拒收 / 状态机失常。
- K2 = `**状态行**：` 正则（`batch-skeleton.mjs:61`）· 状态词五词（`:35-38`）· `> 不适用` / `<§N 模板占位：`（`:221`）· `前情 = `（batch create 前缀剥离）· `**重开记录**：` 追记行（`batch-lifecycle.mjs:291`）——译 = 冻结门 / 链完整性门判读失败。
- K3 = `[上抛·待裁]` / `[上抛·知会]`（`parent-channel.mjs:155`）· `收尾链待跑`（`light-round.mjs:25`）· `老化`（`ledger.mjs:137` 渲染）· 评审戳（batch 工具机写）——译 = 标记对不上。
- K4 = 写进中文记录面 / 用户输入面的字面（枚举见 `PROMPT-SYSTEM.md` §6.30 K4 行）——译 = 描述一个没人会写的串，或识别不到用户原话。

### 2.7 全角标点 / 引号归一（10 处 · 父侧裁定②：本批范围内）

这 10 处零语义、零行数变化，故不进 §2.6 的 36 行计数；处置 = 全角标点换半角 / 相应英文标点，已入 §2.5 表（类别 = 标点归一 / 引号归一）。其中 8 处落在零汉字行（原 7 行 + `persona-engineering:12`），另 2 处落在 `persona-engineering:88` / `:196`——这两行本身含汉字、已在 §2.5 表内各占一行，归一处置并入该行，不另立行。

| 坐标 | 现存全角 | 处置 |
|---|---|---|
| common:10 | `〔〕` | `paired-bracket marks`（全角括号对改为英文描述） |
| common:183 | `（` | 行首 `（` → `(`，行尾 `)` |
| discipline-engineering:47 | `「」` | → `""` |
| persona-eng-designer:37 | `「」` | → `""` |
| persona-eng-designer:71 | `「」` | → `""` |
| persona-engineering:3 | `【】` | → `[]` |
| persona-engineering:115 | `「」` | → `""` |
| persona-engineering:12 | `㈠㈡㈢` | → `(i)` `(ii)` `(iii)` |
| persona-engineering:88 | `㈠㈡㈢` + `「」` | → `(i)` `(ii)` `(iii)`；引号 → `""` |
| persona-engineering:196 | `「doc-check gate: no doc changes」` | 引号 → `""`（引号内纯英文） |

### 2.8 受影响文件（行数 = 本设计日实读）

| 档 | 现况行数 | 本批改动行 | 预期 Δ 行 |
|---|---|---|---|
| `thincoder-core/prompts/advisor-design.md` | 77 | 3 | 0（逐行原地替换） |
| `thincoder-core/prompts/advisor-round2.md` | 65 | 3 | 0 |
| `thincoder-core/prompts/advisor-round3.md` | 61 | 3 | 0 |
| `thincoder-core/prompts/common.md` | 270 | 31 | 0 |
| `thincoder-core/prompts/discipline-engineering.md` | 199 | 4 | 0 |
| `thincoder-core/prompts/discipline-normal.md` | 264 | 0 | 0（全保留） |
| `thincoder-core/prompts/persona-coder.md` | 21 | 3 | 0 |
| `thincoder-core/prompts/persona-eng-coder.md` | 39 | 12 | 0 |
| `thincoder-core/prompts/persona-eng-designer.md` | 89 | 5 | 0 |
| `thincoder-core/prompts/persona-engineering.md` | 237 | 22 | 0（14 保留 + 2 译 + 3 译＋保留 = 19 含汉字行，+ 3 零汉字标点归一） |
| `thincoder-core/prompts/persona-explore.md` | 15 | 2 | 0 |
| `thincoder-core/prompts/persona-normal.md` | 50 | 5 | 0 |
| `thincoder-core/prompts/persona-plan.md` | 27 | 3 | 0 |
| `thincoder-core/prompts/subagent-base.md` | 18 | 0 | 0（全保留） |
| `docs/core/design/PROMPT-SYSTEM.md` | 937 → 952 | 新增 §6.30 | +15（本批已落） |

`advisor-round1.md`（63）· `consult-base.md`（26）· `tool-docs/**`：零中文 / 不在本批 ⇒ 零触。全部 14 档远低于 500 建议线 ⇒ 无拆分计划。

### 2.9 验收对照（回指 §2.1）

| 条目 | 判据 | 落盘后机检 |
|---|---|---|
| E1 | 译类全落英文 | 主判据 = `thincoder-core/prompts/**` 内 K1–K4 四类字面之外的中文行 = 0；读数（逐行实测，§2.6 表可逐条对账）= **36 行**（基线 100） |
| E2 | 枚举 / 机判字面一字不动 | 六态 6 串 + trigger 3 串 **逐串计数 before = after**；K2 十串中 **7 串在场且计数不变**（`**状态行**：` / `进行中` / `已收口` / `> 不适用` / `<§N 模板占位：` / `前情 = ` / `**重开记录**：`）；另 3 串（`设计完成` / `评审完成` / `实施完成`）**本面不存在 ⇒ 读数 0 视为不适用**——它们是 `agent-tools/batch-skeleton.mjs:34-39` 的 `STATUS_WORDS` 工具词表（§2 / §3 / §5 段的状态词），从未写进英文提示词面，改前改后均 0；K3 五串（`[上抛·待裁]` / `[上抛·知会]` / `收尾链待跑` / `老化` / `### 轮次 N（评审子代理）`）逐串在场 |
| E3 | 逐行有类与处置 | §2.5 逐行表 **108 行**（含汉字 100 + 零汉字标点 8）：advisor-design 3 + advisor-round2 3 + advisor-round3 3 + common 31 + discipline-engineering 4 + discipline-normal 11 + persona-coder 3 + persona-eng-coder 12 + persona-eng-designer 5 + persona-engineering 22 + persona-explore 2 + persona-normal 5 + persona-plan 3 + subagent-base 1 = 108 |

### 2.10 自证设计（读数由实施轮出，本段只定方法与预期）

① **译后中文判据**：`node -e` 逐档读 `thincoder-core/prompts/*.md`，行内含 `[\u4e00-\u9fff]` 即计一行。
   - 预期：**100 → 36**。
   - 逐档预期 = advisor-design 1 · advisor-round2 1 · advisor-round3 1 · common 3 · discipline-engineering 1 · discipline-normal 11 · persona-engineering 17 · subagent-base 1 = **36**。
   - 其余 6 档 **0**（persona-coder · persona-eng-coder · persona-eng-designer · persona-explore · persona-normal · persona-plan）。
   - 36 行必须与 §2.6 的表逐条对得上；多出的一行 = 漏译或误译，少一行 = 枚举被译掉。
② **枚举字面在场**：同一脚本按串计数（`待讨论` `待设计` `在途` `待核销` `已核销` `已废弃` `归批` `条件` `认账不排期`），**before / after 两列逐串相等**；K2 / K3 各串同法。
③ **装配读数口径**：`import { assemblePrompt } from 'thincoder-core/prompt-overlays.mjs'` → `assemblePrompt('engineering').length`（父侧基线 133,723 字符，warnings `[]`）。实施轮记 before / after 两个数；差值应 ≈ 各档替换行的净字符变化，**不设阈值**——只要求 warnings 仍为 `[]`（缺档降级会立刻暴露）。

### 2.11 关键决策

| # | 决策 | 理由 / 被否方案 |
|---|---|---|
| KD1 | 按「机制是否依赖该字面」分类，不按「像不像散文」分类 | 被否：按汉字数 ≥8 判散文——`persona-engineering:195` 汉字 25 个却是枚举链，按长度判会把它译掉、工具拒收 |
| KD2 | `§N 未写入` 译为 `"§N not written"`，`**状态行**：` 等保留 | 前者核内零代码引用（grep 实证），属报告串；后者有解析器 |
| KD3 | 中英双标题（`## 中文（English）`）**只删中文、不重译英文** | 英文已是同义定稿（如 `## 人机分工（Who you are）`），重译会引入语义漂移；被否：整句新写 |
| KD4 | `### Consultation (会诊)` / `### Escalation (飞刀)` 括注保留 | 括注是用户输入别名，不是翻译注；删了模型识别不到「会诊一下」 |
| KD5 | `common:53` 的节名指针随 `common:33` 标题一起改 | 不改则标题译完指针即断（`"指令优先级" section` 指向不存在的标题） |
| KD6 | 不新增 / 不改任何既有英文句的语义 | 本批只做语言面；改述会与 CN 镜像的设计基准脱钩（该镜像本批零触） |
| KD7 | 提示词内指向中文档节的指针 = **按 §6.6 删引用（非改址）**，句子改为英文自足句 | 被否：原样保留——`PROMPT-SYSTEM.md:212` 裁定「提示词中根本不应该出现对文档的引用…删引用（非改址）」、`:223` J1 对同域断言零命中、白名单不含 `DOC-DISCIPLINE.md`；原样保留会让同一对象在 §6.6 与 §6.30 各有一条相反规矩 |
| KD8 | 全角标点 / 引号归一（10 处）入本批 | 父侧裁定②：零语义、零行数变化；EN 运行面是英文面，混入的全角标点是同一类残留，分两批只是多一轮 |

### 2.12 边界

不做：CN 镜像（`docs/core/design/prompts/**`）· `tool-docs/**` · 机制文档（除 §6.30 那一节）· 产品代码 · 任何语义增删或重排（标点归一 = 零语义，只换字形）。

### 2.13 上抛项

- `[上抛·知会]` **蓝图数字再校**：`prompt-single-face` §2.9 R1 的「7 处」与本段实测 100 行差两个量级；本段的「38 行散文段」再校为 **23 行**（38 − 15 行载荷）。本批按实测走，蓝图侧是否补记由父侧定。

### 2.14 自检读数（三处交叉核对）

1. `PROMPT-SYSTEM.md`：**937 → 952 行（+15）**（`node` 直读原文，2026-10-18）。
2. 残留读数：§2.6 逐类合计 = **36**（13 + 5 + 5 + 7 + 4 + 1 + 1）；§2.10 ① 逐档合计 = **36**（1+1+1+3+1+11+17+1）；E1 读数 = **36** —— 三处同数。
3. §2.5 逐行表对账：advisor-design 3 + advisor-round2 3 + advisor-round3 3 + common 31 + discipline-engineering 4 + discipline-normal 11 = **55**；
   继续 + persona-coder 3 + persona-eng-coder 12 + persona-eng-designer 5 + persona-engineering 22 = **97**；
   再 + persona-explore 2 + persona-normal 5 + persona-plan 3 + subagent-base 1 = **108**。
4. 基线复核：`thincoder-core/prompts/*.md` 含汉字 **100 行**、汉字 ≥8 字 **38 行**、零汉字标点 **8 行**（原记 7 行 + `persona-engineering:12`——`㈠` 不在原扫描的标点集内，本轮复扫补入）。

### 2.15 方法面（最近先例行 ∥ 勘察证据行）

**最近先例行**：
- 先例坐标 = `docs/core/design/PROMPT-SYSTEM.md` §6.6「提示词面禁带文档引用（机判锁）」（`:210`–`:232`）；先例批次 = `docs/batches/2026-10-18-prompt-single-face.md`（CN/EN 双面收口 · 2026-10-18）。
- **对齐面** = 同域（`thincoder-core/prompts/**`）、同对象（提示词内的文档引用）⇒ 沿用 §6.6 的**删引用（非改址）**口径：`§6.30` 判据③ 与 `persona-engineering:196` 的指针处置同轴。
- **偏离** = 无。差异只在处置形态（本批对其余中文行做整行英译，§6.6 及其先例批只删引用），两者不冲突。

**勘察证据行**：

- 查过 `docs/README.md`（文档地图：提示词系统 → `PROMPT-SYSTEM.md`）。
- 查过 `docs/core/design/PROMPT-SYSTEM.md`：§6.6 引用锁 `:210`–`:232` ∥ §6.26 跨仓勘察义务 `:634`–`:656` ∥ §6.30 语言纪律 `:814`–`:827`——**三节均相关**，§6.6 直接决定本批判据。
- 查过 `docs/core/design/prompts/**`（CN 正本镜像——本批零触，仅作翻译基准）· `docs/batches/2026-10-18-prompt-single-face.md`（R1 蓝图来源）。
- 实扫 `thincoder-core/prompts/**` 16 档全量：含汉字 100 行 · 零汉字标点 8 行（含 `persona-engineering:12` 的 `㈠㈡㈢`）。
- **无相关项**：`tool-docs/**` 不在本纪律域（§6.30 边界行已写明）。

### 2.16 修订 3（表内补漏 · 2026-10-18 23:42）

本轮只改 §2.5 表与 §2.9 E2 的判据，无新语义。四处置：

- **P1** `advisor-design:59` 补回原文一句 `— a review that leaves no §3 entry leaves the parent nothing to settle`（逐字，位置同改前原文：在 `into batch record §3` 之后、`(no path parameter;` 之前，`git diff` 可证）。同位副本 `advisor-round2:45` / `advisor-round3:41` 的原文**从无此句**（改前 `git diff` 亦无）⇒ 两行改为「同 `advisor-design:59` 整行，但去掉该句」。
- **P4** `persona-eng-designer:37` 补明：`existing` 与引号之间一个半角空格，改后该处 = `the existing "exploration budget ≤6 explore spawns / batch"`。
- **P3** 三处全角残留入表：`persona-engineering:12` 新立一行（`㈠㈡㈢` → `(i) (ii) (iii)`）；`:88`（`㈠㈡㈢` + 全角引号）与 `:196`（全角引号包纯英文）并入其原行，不另立行。§2.7 由 7 行改为 **10 处**。
- **P2** `§2.9 E2`：K2 十串改为「**7 串在场且计数不变** + 另 3 串（`设计完成` / `评审完成` / `实施完成`）本面不存在 ⇒ 读数 0 视为不适用」，依据 = `agent-tools/batch-skeleton.mjs:34-39` 的 `STATUS_WORDS` 是工具词表，不是提示词内容。

计数随动（D3 同改）：§2.5 表 107 → **108 行**（含汉字 100 + 零汉字标点 8）· §2.7 7 → **10 处** · §2.9 E3 与 §2.14 逐档和 107 → **108** · §2.8 `persona-engineering` 改动行 21 → 22。残留 **36 不变**（新增三处均不含汉字）。

**待下一支实施笔落盘**：本节改的是表，`thincoder-core/prompts/**` 现盘尚未跟上——`advisor-design:59` 仍缺该句、`persona-eng-designer:37` 仍缺空格、`persona-engineering:12/88/196` 仍带全角。

**段外对账**：§4 / §5 记「107 行」（父侧 / eng-coder 段，本席无权改），与本节 108 差 1（`:12` 新入表）；请父侧 §6 收口时对齐。

## §3 设计评审（评审子代理）

### 轮次 1（评审子代理）

### 设计评审判定（对象 = §2 逐行分类 + 23 行散文定稿 + 保留类理由 + 目录 §6.30）

| # | 类别 | 级 | 发现 | 建议 |
|---|---|---|---|---|
| 1 | 验收判据 | 🔴 | E1 的机检预期读数自相矛盾：本批分类合计 = 译 64 · 译＋保留枚举 5 · 保留 31（batch:33），100 − 64 = **36**；而 §2.9 E1 写「含汉字行数 = **33**」（batch:300）、§2.10 ① 逐档预期把 advisor-design / advisor-round2 / advisor-round3 计入「其余 9 档 0」（batch:307）。那 3 行的改后整行仍携 K3 标记 `### 轮次 N（评审子代理）`（batch:93 ∥ batch:101 ∥ batch:109）⇒ 改后必仍含汉字。§2.6 的 33 行表（batch:258）同样漏这 3 行。后果：实施轮按 ① 的「多出的一行 = 漏译或误译」（batch:308）读 36 为失败，可能把 K3 评审戳译掉换轮。 | 把 E1 / §2.10 ① 的预期读数改为 **36**，逐档表补 advisor 三档各 1 行，§2.6 表补这 3 条；把 batch:55 的「四类保留字面之外的中文行 = 0」保留为主判据，36 作为次级读数。 |
| 2 | 文档归属（机制级矛盾） | 🔴 | §6.30 判据③ 立「指向中文档节的指针（如 `DOC-DISCIPLINE.md §3.20 交付时点强制`）原样保留——译即断指针」（PROMPT-SYSTEM.md:825），而同一档 §6.6 的裁定 = 提示词内文档引用「**删引用（非改址）**」，J1 对该域断言 `[A-Z][A-Z0-9-]{2,}\.md` 零命中（PROMPT-SYSTEM.md:223），域明含 `thincoder-core/prompts/**`（PROMPT-SYSTEM.md:222）；本批正以「译即断指针」为由保留该串（batch:221 ∥ batch:265）。同一对象（EN 运行面里的文档节指针）有两处活着的相反规则，读者无从判断哪份作准。 | 把判据③ 收进 §6.6 的口径：明写该指针是「§6.6 清理前的存量、保留待清」或按 §6.6 删除（以裁定为准），并让 §6.30 的判句回指 §6.6，而不是为同一对象另立第二条规则。 |
| 3 | 方法论（最近先例行） | 🟡 | §2 无最近先例行：没有「实施坐标 ∥ 对应设计档节 ∥ 先例批」的对齐/偏离说明，也没有「无先例」的显式声明。可援的先例确实存在（§6.6 引用锁 + 前一批提示词面批），缺行使 #2 在评审前无法被作者自查出来。 | 补一行先例坐标（先例批 ∥ 设计档节 ∥ 本批落点）+ 对齐 ∥ 偏离理由；偏离项须点名先例并说明为何不适用。 |
| 4 | 方法论（勘察证据行） | 🟡 | §2 无勘察证据行（查过哪些公共源文档 ∥ 有没有相关）。本项目自己的规则要求它：`PROMPT-SYSTEM.md:641`「查过什么 / 有没有相关 ⇒ 设计档落**勘察证据行**（无相关也照记）」+ `:643` 评审检查句③「缺行 ⇒ 未查或未记」。 | 补勘察证据行；无相关也明写「已查无 / 无相关」。 |
| 5 | 需求覆盖 / 范围 | 🟡 | §1 裁定② 把这 7 行全角标点判为本批范围内、并要求「设计席须把这 7 行补进 §2.5 表」（batch:39），而 §2.7 的处置 = `open`、本批不动（batch:272），§2.12 同向；§2.13 又把这件已裁事重新上抛成 `[上抛·待裁]`。同一条范围有两处活着的相反陈述。 | 二选一：按裁定把 7 行补进 §2.5（类别 = 标点归一）；或在 §2 落一条显式偏离条目（点名 §1 裁定② + 理由）并撤掉被推翻的那句，只留一处活口径。 |
| 6 | 文档卫生（修订式残留） | 🟡 | 规范面留修订式表达：§2.8 表仍写 `954` / `+17`（batch:292），§2.14 以散文纠正「上文写的「954 / +17」是笔误，以此处为读数」（batch:334）；§2.6 与 §2.14.2 同形（batch:335）。失效表达应删，不该以追记句留在规范面。 | 就地改正两个数值（954 → 952、+17 → +15）并重算 §2.6 行数，删掉「上文…是笔误」类纠正句，只留正确值。 |
| 7 | 清晰度（悬空指针） | 🟡 | §6.30 判据② 把规范判据外包给未来的一次性材料：「判据命令见台账批 `2026-10-18-prompt-EN-residue` 的实施轮」（PROMPT-SYSTEM.md:825）——该 §5 尚未存在，且批档是一次性执行材料（承 §6.1 的 D2 一次性材料不入本档口径）。 | 把判据命令写进 §6.30 本体内（一行自含命令 + 正则），或删掉该括注；规则必须能从设计档自身读出并跑通。 |
| 8 | 文档归属（重复枚举） | 🟡 | K4 类有两份成员不同的活枚举：§6.30 表列 `评审通过` · `暂缓批复核：无` · `暂缓 · 复核条件` · `已查无` + 别名（PROMPT-SYSTEM.md:823）；§2.3 K4 只写「约定串 + 别名」（batch:74）；§2.6 K4 多列 `DOC-DISCIPLINE.md §3.20`、少列 `暂缓 · 复核条件`（batch:265）。 | 定一份权威枚举（长期面 = §6.30），§2 表按类引用而不重列；两处成员集合对齐。 |
| 9 | 验收判据（检查集弱于类定义） | 🟡 | §2.9 E2 的 K2 检查集（batch:301）列 `**状态行**：` / `进行中` / `已收口` / `> 不适用` / `前导 §N 模板占位`：① 漏掉 §2.3 K2 声明的另外 3 个状态词、`前情 = `、`**重开记录**：`；② `前导 §N 模板占位` 不是可 grep 的字面（字面是始于 `<§N 模板占位：` 的行首形）。 | 让 E2 的串集与 §2.3 K2 逐串一致，并按字面原样引（含尖括号与冒号）。 |
| 10 | 说明（范围限制） | 🔵 | 本轮只读两份在册文档：100 行逐行表的**逐行保真度**（坐标是否命中真行、改后整行是否为该行原文的准确英译）未与 `thincoder-core/prompts/**` 实盘对照——`unverified`，不据此判过/不判过。 | 实施轮以实盘逐行替换并出 before/after 读数；评审判定只覆盖分类口径、判据与设计档落点。 |

**计数**：🔴 2 · 🟡 6 · 🔵 1（共 9 条 + 1 条说明）

VERDICT: changes-required

（评审读法：8 条可改项里 #1 与 #2 属阻断——#1 的预期读数会被实施轮当成「漏译」信号，#2 的指针句与 §6.6 引用锁对同一对象各说一套；其余 6 条为口径/卫生项。）

### 轮次 2（评审子代理）

### 设计评审判定（复审 · 对象 = §3 轮次 1 九条发现的落盘验证 · §2 修订 2 与 PROMPT-SYSTEM.md §6.30）

| # | 原# | 档 | 级 | 状态 | 证据（本轮实读） |
|---|---|---|---|---|---|
| 1 | 1 | batch §2.6/§2.9/§2.10/§2.14 | 🔴 | Fixed | 预期读数已改 36 且三处同数：§2.6 标题 `改后仍携中文的每一行（36 行`（batch:271）；E1 `读数（逐行实测，§2.6 表可逐条对账）= **36 行**（基线 100）`（batch:335）；§2.10 ① `advisor-design 1 · advisor-round2 1 · advisor-round3 1 …= **36**`（batch:343）。逐类合计 13+5+5+7+4+1+1 = 36，逐档 1+1+1+3+1+11+17+1 = 36，两路与 §2.5 表行集合一致；advisor 三档的 K3 评审戳行已入 §2.6 的「译＋保留枚举（K3）」组（batch:281）。 |
| 2 | 2 | PROMPT-SYSTEM.md §6.30 / batch §2.5 §2.11 | 🔴 | Fixed | 判据③ 已收回 §6.6 口径（PROMPT-SYSTEM.md:831：`③ 指向中文档节的指针（如 `DOC-DISCIPLINE.md §3.20`）= 文档引用，按 §6.6 处置：**删引用（非改址）**`）；批次侧同轴落笔：persona-engineering:196 改为删括注指针（batch:234：`文档指针按 **§6.6 删引用（非改址）** 删除`），KD7 记录被否方案与理由（batch:359）。同一对象不再有两条相反规则。 |
| 3 | 3 | batch §2.15 | 🟡 | Fixed | 新增 `### 2.15 方法面（最近先例行 ∥ 勘察证据行）`（batch:379）：先例坐标 = §6.6（`:210`–`:232`）+ 先例批 `2026-10-18-prompt-single-face`，对齐面/偏离面分述（batch:383、batch:384 `**偏离** = 无。`）。 |
| 4 | 4 | batch §2.15 | 🟡 | Fixed | 勘察证据行在场（batch:386 `**勘察证据行**：`，逐条列 `docs/README.md` ∥ §6.6/§6.26/§6.30 ∥ CN 镜像 ∥ 实扫 16 档，并记「无相关项」）。 |
| 5 | 5 | batch §2.5/§2.7/§2.12 | 🟡 | Fixed | 7 行全角标点已入 §2.5 表（common:10/183 · discipline-engineering:47 · persona-eng-designer:37/71 · persona-engineering:3/115，类别 = 标点归一），§2.7 改为 `已入 §2.5 表（类别 = 标点归一）`（batch:297）；§2.12 边界同向（batch:364 `标点归一 = 零语义，只换字形`）。§1 裁定② 与 §2 不再有一处被推翻的相反陈述。 |
| 6 | 6 | batch §2.8/§2.14 | 🟡 | Fixed | 修订式残句（「上文写的「954 / +17」是笔误」）已删；§2.8 与 §2.14 现同为 952/+15，只留正确值一种写法。残留的数值时效问题另列本轮 #11。 |
| 7 | 7 | PROMPT-SYSTEM.md §6.30 | 🟡 | Fixed | 判据② 现自含命令（PROMPT-SYSTEM.md:827 `② 四类之外的中文行 = 残留。判据命令自含（扫描根 = `thincoder-core/prompts``）+ :829 一行 `node -e` 扫描；对批档 §5 的悬空指路已删。 |
| 8 | 8 | PROMPT-SYSTEM.md §6.30 / batch §2.3 §2.6 | 🟡 | Fixed | 枚举定单源：§2.3 K4 改为 `枚举以 `docs/core/design/PROMPT-SYSTEM.md` §6.30 K4 行为唯一权威（记录面约定串 + 用户中文别名）；本段按类引用，不重列`（batch:74）；§2.6 K4 行不再列 `DOC-DISCIPLINE.md §3.20`。成员集合已对齐；仅余一处类标签差，另列本轮 #12。 |
| 9 | 9 | batch §2.9 E2 | 🟡 | Fixed | E2 串集已与 §2.3 K2 逐串一致（batch:336：`K2 十串（**状态行**： / 进行中 / 已收口 / 设计完成 / 评审完成 / 实施完成 / > 不适用 / <§N 模板占位： / 前情 = / **重开记录**：）`），非字面占位形已换为可 grep 的字面形。 |
| 10 | 10 | batch §2 | 🔵 | Accepted | 范围限制条 = 说明性条目，无可改对象（逐行保真度 = 实施轮 before/after 读数面）。本轮仍按同一限度：未与 `thincoder-core/prompts/**` 实盘对行。 |
| 11 | (新) | batch §2.8 / §2.14 | 🔵 | New: 行数读数已失效（修订 2 把 §6.30 从 14 行扩到 20 行）——§2.8 仍写 `937 → 952 | 新增 §6.30 | +15（本批已落）`（batch:327）、§2.14 `PROMPT-SYSTEM.md：**937 → 952 行（+15）**`（batch:372），而本轮实读该档 = **958 行**（`### 6.30` 现跨 :814–:833）。数值漂移，不影响判据。 |
| 12 | (新) | batch §2.5/§2.6 vs PROMPT-SYSTEM.md §6.30 | 🟡 | New: `暂缓 · 复核条件` 的类标签两处不一——§2.5 记 `保留原文（K2/K3）`（batch:221）、§2.6 计入 K2 组（batch:278 `discipline-normal:126 · persona-engineering:74/75/76/77`），而 §2.3 已宣告 §6.30 K4 行为唯一权威、该串正列在 K4（PROMPT-SYSTEM.md:823）。处置同为「一字不动」故实施面无歧义，但类计数归属与权威枚举不符（K2 5→4 / K4 7→8，合计仍 36）。建议改标签，不动计数总数。 |

**计数**：🔴 0 · 🟡 1（新 #12）· 🔵 2（#10 Accepted · #11 新）· 原 🔴 2 条均已验为 Fixed，原 🟡 6 条均验为 Fixed。

九条发现全部落盘：两条阻断项（#1 读数、#2 指针规则）已按建议改到位，且改动本身一致（36 三处同数、逐类逐档两路对得上；§6.30 判据③ 与 §6.6 同轴、批次侧同步删指针）。新引入的问题仅两条非阻断项（一处行数读数过期、一处类标签归属差），不影响实施轮落笔。

VERDICT: pass

## §4 用户批准（主 agent）

**用户批准（2026-10-18 23:33）**——依据 = 用户 23:32 逐字「**后续都自动跑完吧**」（整批令，覆盖 R1–R6 各步的评审发起与实施启动）。

**批准范围**：R1 设计（§3 轮次 2 **pass**：🔴 0 · 🟡 1 · 🔵 2）⇒ 落 EN 运行面 **107 行**（100 含汉字 + 7 全角标点）。

**批准依据（在盘）**：

| 项 | 读数 |
|---|---|
| 轮次 1 | changes-required（🔴2 · 🟡6 · 🔵1）→ 9 条全修 |
| 轮次 2 | **pass**；两条 🔴 经父侧实读确认修复：残留读数 **36**（三处同数）· §6.30 判据③ 改为按 §6.6 删引用 |
| 未决非阻断 | #11（§2.8 行数 952 已陈旧，实为 958）· #12（`暂缓 · 复核条件` 的类标注 K2/K4 分歧，处置相同） |

**边界**：只落在设计表列出的 107 行；枚举字面（六态 6 · trigger 3 · K1–K4 全部）一字不动；CN 镜像零触；机制文档零触（R2 在做）。

## §5 实施记录（eng-coder）
**状态行**：实施完成（2026-10-18 · 107 行落盘 + §2.5 修订 3 五处补落（P1 还原句 / P4 补空格 / P3 三处字形归一）· 残留 36 行 · 审计 clean · 代码评审 pass · fix round 1）



### 5.1 实施摘要（2026-10-18 23:34 · eng-coder）

按 `§2.5` 逐行表落盘 **107 行**（含汉字 100 + 零汉字全角标点 7），落点 = **12 档** `thincoder-core/prompts/*.md`；`discipline-normal.md` / `subagent-base.md` / `advisor-round1.md` / `consult-base.md` 零触。**逐行原地替换，14 档行数全部 Δ 0**（字符数有增减，行数不变）。

改法 = 只落表里的「改后整行」；「整句同原文，仅 X → Y」类的行只动 X 段。K1–K4 四类字面**一字未动**。

### 5.2 逐档 before / after（含汉字行数，`[\u4e00-\u9fff]` 逐行扫描）

| 档 | before | after | 本批改动行 |
|---|---|---|---|
| advisor-design.md | 3 | 1 | 3 |
| advisor-round1.md | 0 | 0 | 0 |
| advisor-round2.md | 3 | 1 | 3 |
| advisor-round3.md | 3 | 1 | 3 |
| common.md | 29 | 3 | 28 |
| consult-base.md | 0 | 0 | 0 |
| discipline-engineering.md | 3 | 1 | 3 |
| discipline-normal.md | 11 | 11 | 0（全保留） |
| persona-coder.md | 3 | 0 | 3 |
| persona-eng-coder.md | 12 | 0 | 12 |
| persona-eng-designer.md | 3 | 0 | 5 |
| persona-engineering.md | 19 | 17 | 7 |
| persona-explore.md | 2 | 0 | 2 |
| persona-normal.md | 5 | 0 | 5 |
| persona-plan.md | 3 | 0 | 3 |
| subagent-base.md | 1 | 1 | 0（全保留） |
| **合计** | **100** | **36** | 74 行文本改动（107 行中 30 行保留 + 3 行 K 组保留待核） |

行分类计数（按 §2.5 逐行核对）：**译 64 · 译＋保留枚举 6 · 保留原文 30 · 标点归一 7 = 107**；100 行含汉字 = 64 + 6 + 30。注：§1 摘要行记「译 64 · 译＋保留枚举 5 · 保留 31」，与逐行表差 1 行（分桶口径差，非行数差），合计与残留 36 均一致。

### 5.3 残留 36 行逐行清单（改后仍含汉字，全部落在 K1–K4）

| # | 坐标 | 类 |
|---|---|---|
| 1 | advisor-design:59 | 译＋保留（K3 评审戳） |
| 2 | advisor-round2:45 | 译＋保留（K3 评审戳） |
| 3 | advisor-round3:41 | 译＋保留（K3 评审戳） |
| 4 | common:100 | K3（`[上抛·待裁]`） |
| 5 | common:101 | K3（`[上抛·知会]`） |
| 6 | common:222 | K1（六态全串） |
| 7 | discipline-engineering:174 | K1（trigger 三值） |
| 8–12 | discipline-normal:98/101/102/103/124 | K1（含迁移链） |
| 13 | discipline-normal:126 | K2（`已收口`） |
| 14–16 | discipline-normal:237/245/252 | K4（`会诊` 别名 · 用户原话） |
| 17–18 | discipline-normal:258/259 | K4（`飞刀` 别名 · 用户原话） |
| 19–22 | persona-engineering:74/75/76/77 | K2（状态行 / 五状态词 / 不适用 / 模板占位 / 重开记录 / 前情） |
| 23 | persona-engineering:96 | K1（`归批` / `认账不排期`） |
| 24 | persona-engineering:99 | K3（`老化`） |
| 25–27 | persona-engineering:107/108/109 | K3（`在途` ×2 · `收尾链待跑`） |
| 28 | persona-engineering:116 | K4（`已查无`） |
| 29 | persona-engineering:151 | K4（`评审通过`） |
| 30–31 | persona-engineering:194/195 | K1（`待讨论 → 待设计 → 在途` · `在途 → 待核销 → 已核销`） |
| 32 | persona-engineering:196 | 译＋保留（K4 `「暂缓批复核：无」`；文档指针按 §6.6 已删） |
| 33 | persona-engineering:197 | 译＋保留（K1 trigger 三值） |
| 34 | persona-engineering:214 | K1（trigger 三值） |
| 35 | persona-engineering:215 | 译＋保留（K3 `「老化」`） |
| 36 | subagent-base:16 | K3（`[上抛·待裁]` / `[上抛·知会]`） |

逐档合计 = 1 + 1 + 1 + 3 + 1 + 11 + 17 + 1 = **36**，与 §2.6 / §2.10① 逐行集合**逐条对上**。

### 5.4 字面计数对照（改前 → 改后，全 16 档合计）

六态：`待讨论` 5→5 · `待设计` 5→5 · **`在途` 12→11** · `待核销` 6→6 · `已核销` 7→7 · `已废弃` 2→2；trigger：`归批` 5→5 · `条件` 5→5 · `认账不排期` 5→5。

`在途` 差 1 的解释（已定位到行，不是枚举被译）：基线的第 12 处是 `persona-normal.md:26` 的**中文标题短语** `在途提问`（现为 `## In-flight ask — non-blocking steer during long runs`），属 §2.5 表内的「译」行；枚举位上的 11 处全部在位（`common:222` · `discipline-normal:98/101/103` · `persona-engineering:107/108/194/195` 等）。

K2 十串：`**状态行**：` 1→1 · `进行中` 2→2 · `已收口` 4→4 · `> 不适用` 1→1 · `<§N 模板占位：` 1→1 · `前情 = ` 1→1 · `**重开记录**：` 1→1；**`设计完成` / `评审完成` / `实施完成` 改前改后均 0**（全 16 档 grep 无命中——它们是 `batch-skeleton.mjs` 的 `STATUS_WORDS` 词，EN 运行面从未出现；§2.9 E2 的「十串逐串在场」因此不可满足，判定为批档盘点误差，已按评审 #1 报父侧）。
K3 五串：`[上抛·待裁]` 2→2 · `[上抛·知会]` 2→2 · `收尾链待跑` 1→1 · `老化` 2→2 · `### 轮次 N（评审子代理）` 3→3。
K4 串：`评审通过` 1→1 · `暂缓批复核：无` 1→1 · `暂缓 · 复核条件` 1→1 · `已查无` 1→1 · `会诊` / `飞刀` 家族 6→6。

### 5.5 装配读数（`assemblePrompt`，新进程直读）

| 场景 | before | after | warnings |
|---|---|---|---|
| engineering | 133,723（父侧基线） | **133,795** | `[]` |
| normal | — | 86,585 | `[]` |
| eng-coder | — | 84,212 | `[]` |
| eng-designer | — | 96,291 | `[]` |
| explore | — | 83,213 | `[]` |
| coder | — | 84,005 | `[]` |
| plan | — | 84,611 | `[]` |
| consult | — | 3,639 | `[]` |

八场景 warnings 全 `[]`（缺档降级会立刻出现 slot 警告）。engineering 净增 **+72 字符**（英文替中文的整体净变化）。

### 5.6 doc-check gate

`doc_check(mode:"gate", target=thincoder)` → **`DOC-CHECK GATE: PASS（0 档）`**；12 档提示词全部「跳过（不在声明域内）」——`checkConfig.scanDirs=["docs"]`，与任务书预期一致。本批未写声明域内文档。

### 5.7 审计与代码评审轮次

| 轮次 | 类型 | 结果 | 处置 |
|---|---|---|---|
| 内部审计 1 | explore 只读对账（设计表 vs 实盘） | **107/107 行 PASS · DIVERGENT 0**；(a) 36 行集合外中文 = 0；(c) 表外改动 = 0；(b) 报出 K2 三串零命中（同 §5.4） | 无 fix（0 条须改） |
| 代码评审 1 | advisor `type="code"`（12 档 + 批档） | **pass**：无 🔴；🟡 #1（K2 三串不可满足，批档侧）· 🟡 #2（㈠㈡㈢ 与两处全角引号属未分类残留）· 🔵 #3（`persona-eng-designer:37` 引号前缺空格）· 🔵 #4（common 行数 270 vs 269 的盘点差）· 🔵 #5（`persona-eng-coder:25/26` 相邻重复，源自设计行）· 🔵 #6（与改前原文的逐行保真度无 diff 可证，`unverified`） | **零 fix**（6 条全部落在设计行 / 批档盘点，不在我这支笔下；见 §5.8） |

**终态 = `clean`**（0 个 fix round）。

### 5.8 决策透明表（设计与实盘的差异 / 未改项 / 披露）

| # | 事项 | 处置与理由 |
|---|---|---|
| D1 | `advisor-design:59` 的改后整行**删掉了一句** `— a review that leaves no §3 entry leaves the parent nothing to settle` | **按表落**（表是唯一依据、已过两轮评审）。如实标注：这是设计行自带的语义删减，不是实施期擅自剪裁。建议下一轮设计席决定是否补回。 |
| D2 | `persona-eng-designer:37` 落成 `the existing"exploration budget ≤6 explore spawns / batch"`（`existing` 与引号间无空格） | 表里只给了 `「…」→ "…"` 的替换、其余同原文 ⇒ 按表落。空格属字形瑕疵，评审 🔵 #3 已登记，**未自行加空格**（加空格即偏离表）。 |
| D3 | `persona-engineering:12/88/196` 仍有 `㈠㈡㈢` 与两处全角引号包纯英文 | 不在 107 行表内、也不在 7 行「零汉字全角」基线内（`㈠` 不在 `[\u4e00-\u9fff]`，`:88`/`:196` 改前行内含汉字故未被标点扫描计入）⇒ **未动**，评审 🟡 #2 报父侧。 |
| D4 | `persona-engineering:196` 的文档指针 | 按 KD7 / §6.6 **删引用（非改址）**：整段 `(authority = \`docs/core/design/DOC-DISCIPLINE.md\` §3.20 交付时点强制)` 删除，句子其余部分自足；`「暂缓批复核：无」`保留。 |
| D5 | 三档 advisor 的 `### 轮次 N（评审子代理）` | **原样保留**（工具机写戳，K3）。 |
| D6 | 表外改动 | **0 处**。只动 12 档；CN 镜像、机制文档、需求档、代码零触。 |
| D7 | 行数 | 14 档全部 Δ 0；`common.md` 实读 269 个物理行（`split("\n")` 得 270 元素，含末尾空元素）——§2.8 的 270 是同一份文件的不同数法，与评审 🔵 #4 同源。 |

### 5.9 交付自检

- 每条验收（E1/E2/E3）逐条对过 §2.9 判据；E1 主判据（四类之外中文行 = 0）**通过**，读数 36 与三处交叉核对同数。
- 改动面 = 12 档，逐档行数不变、无残留旧中文句、无调试残留。
- 无单元测试档（提示词面零留存口径）；本批验收 = 上述机械读数（node 扫描 + `assemblePrompt`）。
- 未做集成测试（`test/run.mjs` 全量）——按口径属父侧收口；提示词面改动不触业务用例，但**装配链已被 `assemblePrompt` 实跑覆盖**。

### 5.10 修正轮（2026-10-18 23:45 · eng-coder · 照 §2.5 修订 3 补五处）

依据 = §2.5 修订 3 与父侧 23:43 裁定（P1 位置按设计席原文位置；三档 advisor 不统一）。本轮**只补五处**，其余行零字节改动；**不新增语义**——P1 = 还原 `git diff` 原文丢掉的句子，P4/P3 其余 = 字形归一。

| # | 坐标 | 改前整行 | 改后整行 |
|---|---|---|---|
| P1 | `advisor-design:59` | `Design-review only (**applicable only when this review is a design review and the tool face has `batch` mounted** — code review has no such tool, so this section does not apply): in addition to the report, use `batch({action:"append", segment:"§3", text})` to write this round's **findings table + VERDICT + counts verbatim** into batch record §3 (no path parameter; the tool stamps its own `### 轮次 N（评审子代理）` source marker, so a heading you write yourself would be a second source).` | `Design-review only (**applicable only when this review is a design review and the tool face has `batch` mounted** — code review has no such tool, so this section does not apply): in addition to the report, use `batch({action:"append", segment:"§3", text})` to write this round's **findings table + VERDICT + counts verbatim** into batch record §3 — a review that leaves no §3 entry leaves the parent nothing to settle (no path parameter; the tool stamps its own `### 轮次 N（评审子代理）` source marker, so a heading you write yourself would be a second source).` |
| P4 | `persona-eng-designer:37` | `   - **Turn budget + landing timing (land first, correct after)**: **draft first, correct after** — "everything verified" as a precondition for landing means nothing ever lands; **first version ≤15 turns / per-doc fix ≤10 turns**; past **half** the budget (first version >7 / per-doc fix >5 turns) with nothing landed ⇒ **degrade the delivery** (skeleton + unresolved list) — **counted alongside the existing"exploration budget ≤6 explore spawns / batch", not replacing it**.` | `   - **Turn budget + landing timing (land first, correct after)**: **draft first, correct after** — "everything verified" as a precondition for landing means nothing ever lands; **first version ≤15 turns / per-doc fix ≤10 turns**; past **half** the budget (first version >7 / per-doc fix >5 turns) with nothing landed ⇒ **degrade the delivery** (skeleton + unresolved list) — **counted alongside the existing "exploration budget ≤6 explore spawns / batch", not replacing it**.` |
| P3a | `persona-engineering:12` | `The go-ahead lasts until one of three things — ㈠ the scope changes ㈡ the user calls a stop ㈢ the batch runs to completion; work outside the batch still waits for a new go-ahead.` | `The go-ahead lasts until one of three things — (i) the scope changes (ii) the user calls a stop (iii) the batch runs to completion; work outside the batch still waits for a new go-ahead.` |
| P3b | `persona-engineering:88` | `- **Fix-round dispatch must write three sentences**: when dispatching a fix round, **three sentences are mandatory** — ㈠ the `Suggestion` column = reviewer's advice, **the executor = the subagent** (you have already adjudicated each one accepted); ㈡ fix by finding number `1..N`, report as "number → change file:line"; ㈢ state the「**this round does NOT do**」list explicitly.` | `- **Fix-round dispatch must write three sentences**: when dispatching a fix round, **three sentences are mandatory** — (i) the `Suggestion` column = reviewer's advice, **the executor = the subagent** (you have already adjudicated each one accepted); (ii) fix by finding number `1..N`, report as "number → change file:line"; (iii) state the "**this round does NOT do**" list explicitly.` |
| P3c | `persona-engineering:196` | `3. **Batch closeout** ⇒ **settlement cross-check**: verify entries settled, pointers resolve; **prior-batch leftovers** (entry done, anchor batch record unclosed) ⇒ the **fallback settlement path**, since otherwise that account stays open forever; **deferred-batch re-check** — run the deferral scan against resume conditions; none ⇒「暂缓批复核：无」in §6; **doc-check gate** — before approval / settlement / close, run `doc_check(mode:"gate", docs:[...])` over **this round's doc set** (the list = `git diff <batch-start sha> --name-only -- docs`, `<batch-start sha>` = HEAD before this round started); `REFUSED` ⇒ no approval, no settlement, no close, no ledger write — send it back to the author for a same-round fix, re-run to `PASS`; `ERROR` ⇒ the same judgment (no `PASS` means not passed), and an unclear fix goes to the main agent — unsure ⇒ relay to the user; no doc changes ⇒ one line「doc-check gate: no doc changes」in §6; **Settlement line** — **ensure the settlement line lands** (the settlement sync checklist's mechanical step) + **the settled count goes with the closeout** (reported together with it, not as a separate line).` | `3. **Batch closeout** ⇒ **settlement cross-check**: verify entries settled, pointers resolve; **prior-batch leftovers** (entry done, anchor batch record unclosed) ⇒ the **fallback settlement path**, since otherwise that account stays open forever; **deferred-batch re-check** — run the deferral scan against resume conditions; none ⇒「暂缓批复核：无」in §6; **doc-check gate** — before approval / settlement / close, run `doc_check(mode:"gate", docs:[...])` over **this round's doc set** (the list = `git diff <batch-start sha> --name-only -- docs`, `<batch-start sha>` = HEAD before this round started); `REFUSED` ⇒ no approval, no settlement, no close, no ledger write — send it back to the author for a same-round fix, re-run to `PASS`; `ERROR` ⇒ the same judgment (no `PASS` means not passed), and an unclear fix goes to the main agent — unsure ⇒ relay to the user; no doc changes ⇒ one line "doc-check gate: no doc changes" in §6; **Settlement line** — **ensure the settlement line lands** (the settlement sync checklist's mechanical step) + **the settled count goes with the closeout** (reported together with it, not as a separate line).` |

**P1 位置核对**：补回句落在 `into batch record §3` 之后、`(no path parameter;` 之前，与 `git diff` 的 `-` 行逐字同位（`advisor-design:59`）。

**复跑读数（改后实扫）**：

| 项 | 读数 |
|---|---|
| 含汉字行（16 档逐行 `[一-鿿]`） | **36**（advisor-design 1 · advisor-round2 1 · advisor-round3 1 · common 3 · discipline-engineering 1 · discipline-normal 11 · persona-engineering 17 · subagent-base 1） |
| 四类之外中文行 | **0**——36 行的汉字串逐个提取后全部为 K1–K4 字面（六态 / trigger 三值 / `**状态行**：` 等 K2 形 / `[上抛·…]` `收尾链待跑` `老化` 评审戳 / `会诊` `飞刀` `已查无` `评审通过` `暂缓批复核：无` `暂缓 · 复核条件` `原收口 · 理由 · 操作者`） |
| `㈠㈡㈢` / 全角引号（本表五处） | **0**（`persona-eng-designer:37` · `persona-engineering:12/88/196` 已归一） |
| 行数 | 三档行数不变（advisor-design 77 · persona-eng-designer 89 · persona-engineering 237，与 §2.8 同数；改前改后同一数法实读） |
| 装配 `assemblePrompt` 八场景 | warnings 全 `[]`；engineering 133,795 → **133,817** · eng-designer 96,291 → **96,292** · 其余六场景不变（normal 86,585 · eng-coder 84,212 · explore 83,213 · coder 84,005 · plan 84,611 · consult 3,639） |
| `doc_check(mode:"gate")` | `DOC-CHECK GATE: PASS（0 档）`——批档不在声明域（`checkConfig.scanDirs=["docs"]`，`batches` 排除），与 §5.6 同读数 |
| 内部审计（explore 只读对账） | **DIVERGENT 0**：五处逐处 PASS；`㈠㈡㈢` 三字 ∥ `the existing"`（引号紧贴）∥ `「doc-check gate` 三串零命中；残留 36 且四类之外 0（其工具面无 `execute`，装配读数侧标 `unverified`，以本席实跑为准） |
| 代码评审（advisor `type="code"`） | **pass**：🔴 0 · 🟡 1（可选 · 非必修：10 处含载荷行仍带全角括注/引号，属另一轮口径）· 🔵 2（`advisor-design:33-34` 版式既有问题 · 记录面行数口径） |
| fix round | **1 轮**（本轮），终态 `clean` |

**改动面**：5 行文本替换（`advisor-design:59` · `persona-eng-designer:37` · `persona-engineering:12/88/196`）。CN 镜像 · 机制档 · 枚举字面 · 表外行：零触。

## §6 验证与收口（父代理）

### 验收与收口（父侧 · 2026-10-18 23:48）

**① 交付验证（父侧亲跑，非转述）**

| 项 | 读数 |
|---|---|
| 含汉字残留（16 档） | **36 行**：advisor-design 1 · advisor-round2 1 · advisor-round3 1 · common 3 · discipline-engineering 1 · discipline-normal 11 · persona-engineering 17 · subagent-base 1 |
| 四类之外的中文行 | **0**（36 行汉字串逐个归入 K1–K4） |
| `㈠㈡㈢` ∥ `the existing"` ∥ `「doc-check gate` | **三串全 0** |
| P1 补回句位置 | `into batch record §3`(326) < 补回句(382) < `(no path parameter;`(418) ⇒ **正确** |
| 装配 | `engineering` = 133,817 · warnings `[]` ∥ `normal` = 86,585 · `[]` |

**② 结算核对**

- 台账 `#1682` **保持「在途」**——它覆盖 R1–R6 全链，本批只是其中一轮；指针已挂本档。
- §1–§6 均有内容；§5 含实施 + 修正轮读数（§5.10）。

**③ 文档机检门（如实记，不冒充机检）**

- 批档在 `checkConfig.anchors.exclude`（`batches`）内 ⇒ **受检 0 档**；
- **`thincoder-core/prompts/**` 不在 `scanDirs=["docs"]`** ⇒ **EN 面没有自动门**。这是今晚第二次确认：EN 侧两次漂移无人发现的机制原因就在这里。验收只能靠 ① 的 grep + 装配读数。

**④ 暂缓批复核**：无暂缓批。

**⑤ 收口测试线**：提示词面零留存口径，本批无单元测试档；集成场景未受影响（提示词装配链已由 `assemblePrompt` 八场景实跑覆盖）。

**⑥ 遗留与裁定（不留在散文里）**

| # | 项 | 处置 |
|---|---|---|
| 1 | `persona-engineering.md` 10 处**含载荷行**仍带全角括注/引号（`:75 :76 :77 :96 :99 :109 :116 :151 :196 :215`） | **父侧裁定：不动。** 这些行里的全角字符是**载荷本身**（K2 `**状态行**：` 的全角冒号、K4 的 `「暂缓批复核：无」` / `「暂缓 · 复核条件」`）；归一它们 = 改工具实参，会把 E2 判据打成假。**P3 那一类（零汉字行）才该归一，这批不是。** |
| 2 | `advisor-design.md:33-34` 版式（Suggestion 列说明被排进 `Severity levels:` 列表首项） | **本批前既有**，零语义翻译不动结构 → 不属本批；如要治，另批。 |
| 3 | CN 镜像 16 档仍在（R5 才删） | 见 `prompt-single-face` §2.9 R5。 |
