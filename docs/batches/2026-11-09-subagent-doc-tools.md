# 2026-11-09 · subagent-doc-tools
> 六段，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 每段只有一个作者：作者的段可 `append` 加内容、可就地改（`edit`）；非作者一概拒。
> 编制：主 agent · 2026-11-09 · 来源 = 用户 2026-11-09 21:55：「我觉得两个都得加上，给所有这些子代理。」——`doc_check` 与 `doc_graph` 两个工具面挂给全部子代理角色。。
> 台账 = #2245（core · 归批）。前情 = 2026-11-09-doc-graph-signal-noise（进行中）。
## §1 讨论（主 agent）
**状态行**：已收口 2026-11-09
<§1 模板占位：本批条目 / 关键判据 / 授权口径>

## 用户裁定（2026-11-09 21:55）

- **用户原话：「我觉得两个都得加上，给所有这些子代理。」**
- **范围**：`doc_check` 与 `doc_graph` **两个工具面**，挂给**全部子代理角色**——`eng-coder` ∥ `eng-designer` ∥ `tester` ∥ `explore` ∥ `consult`，以及 `advisor`（它是评审子代理，见下方边界）。

## 父侧实读（2026-11-09 21:53）

`thincoder-core/agent/family-tools.mjs` 的装配现状：

| 角色 | `doc_check` | `doc_graph` |
|---|---|---|
| 深度 0（主 agent） | ✅ | ✅ |
| `eng-coder` | ✅ | ❌ |
| `eng-designer` | ✅ | ❌ |
| `coder` / `consult` / `explore` / `tester` | ❌ | ❌ |
| `advisor` | ❌ | ❌ |

**`doc_graph` 不给子代理的现有理由（源码逐字）**：「只挂 depth-0——`scan` 写台账库，而子代理段拿到的台账是只读变体；照同一先例本版不做 `doc_graph` 的只读变体，子代理要看图由父侧扫完再查」。

## 本批要定的一件事（设计席先给方案，父侧再定）

**`doc_graph` 挂给子代理时，`scan` 这一 action 挂不挂。** 两个可判形态：

- **甲（父侧默认）**：子代理拿到的是**查询面**——`forward` ∥ `reverse` ∥ `chain` 在，`scan` 不在。理由：`scan` 是一次写（重写共享边表），而子代理的台账面本就是只读；扫描由父侧做，子代理查父侧扫出来的结果。
- **乙**：连 `scan` 一起挂。代价 = 多个子代理可同时重写共享边表，且它们没有在途号可绑这笔写。

**设计席按甲出方案**；若用户要乙，改的是同一处装配清单，一行之差。

## 边界：`advisor` 单独一句

`advisor` 是**只读评审**角色，它的判据来自文档本体而不是机检工具。给它挂 `doc_check` 会让它拿机检结果当判据（那不是它的活）；给它挂 `doc_graph` 同款。**本批给 `advisor` 的处置是「按用户裁定挂上，但设计档要写清它为何可以不调用」**——工具在场不等于义务。

## 已知代价（明写）

- **`doc_graph` 查询面扩到全部子代理** ⇒ 子代理会拿到可能过期的图（`scan` 仍手动）。回执的时效格（`#2244` 那一批）正好补这一刀：**读者能看到图建于何时、此后几档变更**。两批的先后由此有了依赖关系。

## 设计席派单要点（随 `#31` 的 §2 一同生效）

**装配面**（`thincoder-core/agent/family-tools.mjs` 三个 depth>0 分支）：`eng-coder` ∥ `eng-designer` ∥ 兜底段各挂什么；`doc_graph` 若需去 `scan` 的只读变体，先例 = 同族两变体（`ledgerReadTool` ∥ `manifestReadTool`）。

**`advisor` 的处置**：只读评审，工具在场 ≠ 义务；设计要写清它为何不拿机检结果当判据。

**与 `#2244` 的接线**：子代理会读到可能过期的图。`#2244` 的时效格（回执写「图建于何时 · 此后 N 档变更」）正好补这一刀；若 `#2244` 先落，本批设计引用其回执形。

**测试面**：装配表是代码面；集成用例按 `test/RTM.md` 现有故事安放，不新开故事。

## §2 批次任务与设计（eng-designer）
**状态行**：设计完成
<§2 模板占位：本批条目（覆盖） / 设计档落点 / 机制设计 / 受影响文件与测试覆盖 / 验收对照 / 关键决策 / 上抛项>

## 批次任务（本批覆盖）

| # | 需求条目 | 本批做什么 | 判据落点 |
|---|---|---|---|
| 1 | `docs/core/requirements/DOC-GRAPH.md` §4 AC-10（子代理可用文档工具面） | 七个 family 角色（`eng-coder` ∥ `eng-designer` ∥ `coder` ∥ `consult` ∥ `explore` ∥ `tester` ∥ `plan`）与 advisor 的装配面各加 `doc_check` 与 `doc_graph` 只读变体（无 `scan`） | 判据 = `docs/core/design/AGENT-LOOP-SUBAGENT.md` §6.60.5 的 AC-DT1 – AC-DT6，逐条回指 AC-10；用例表 = 同节 §6.60.6 |

**显式不在本批**：

- 连 `scan` 一起挂给子代理——按父侧 §1 的甲案（子代理拿查询面）出设计；用户若要乙案，改的是同一处装配清单（`docs/core/design/AGENT-LOOP-SUBAGENT.md` §6.60.2 ①）。
- 给 `doc_check` 造只读变体——它没有可收窄的写 action，同节 D-DT3。
- 改端侧 tool-table（`thincoder-vscode/src/agent/tool-table.mjs`）——家族段由核 `assembleFamilyTools` 追加，端侧基础集不涉（同节 §6.60.3「不改」表）。
- 给 advisor 加「必须先跑机检」的门——工具在场 ≠ 义务，界线写成纪律（同节 §6.60.2 ③）。

## 机制设计（落点两档）

- `docs/core/design/AGENT-LOOP-SUBAGENT.md` §6.60（新增，装配矩阵单源）：一处 `docTools` 常量、五个 depth>0 分支各展开一次；只读变体的形与拒绝面；advisor 面为何可以不调用；判据 ∥ 用例 ∥ 边界 ∥ 集成 delta。同档 §6.59.2 ⑤ 与 §6.59.7 第 4 条同步改准（tester 兜底段现在含这两件）。
- `docs/core/design/DOC-GRAPH.md` §2.5.5（新增，变体契约）：两个变体的 action 枚举 ∥ `readonly` ∥ `scan` 被调时的拒绝 ∥ 描述面追加句。同档 §3 的工具登记面说明改准为「两变体互斥装配」，§7 删去「不做子代理段的只读变体」一条（该边界已被本批推翻）。

## 受影响文件（代码面 = 实施轮）

- `thincoder-core/agent/family-tools.mjs`（`docTools` 常量 + 五个 depth>0 分支展开；depth-0 段零改）
- `thincoder-core/agent-tools/doc-graph.mjs`（新导出 `docGraphReadTool`）
- `thincoder-core/agent-tools.mjs`（再导出一行）
- `thincoder-core/advisor/loop.mjs`（`advisorToolsFor` 追加两件 + `export`）
- `test/integration/tester-role.test.mjs`（新增 `test("CLI 30-2 …")`）∥ `test/rtm/tooling.md`（故事 30 节加一行 `30-2`）

## 验收（本批怎么算完）

- 代码面：本批单测档（与批档同名同目录，收口删除）跑 `node --test` 全绿，覆盖 `docs/core/design/AGENT-LOOP-SUBAGENT.md` §6.60.5 的 AC-DT1 – AC-DT5；AC-DT6 = 本批触碰档 `doc_check(mode:"gate")` 首行 `DOC-CHECK GATE: PASS`。
- 集成面：`test/integration/tester-role.test.mjs` 的 `30-2` 通过（同节 §6.60.9）；既有 `30-1` 零改仍绿。
- 需求对照：AC-10 三句（全部子代理八角色有 `doc_check` ∥ `doc_graph` 在且无 `scan` ∥ 调 `scan` 报拒且三查询可用）逐句对得上 AC-DT1 ∥ AC-DT2 ∥ AC-DT3。

## 上抛项（父侧裁）

1. **需求层角色串（父侧已改净，无待办）**：`docs/core/requirements/DOC-GRAPH.md` 的 F7 与 AC-10 原举两串不一致的角色（F7 有 `coder` 无 `tester`，AC-10 有 `tester` 无 `coder`）；父侧已把两处对齐成同一串八个角色（`eng-coder` ∥ `eng-designer` ∥ `coder` ∥ `plan` ∥ `explore` ∥ `tester` ∥ `consult` ∥ `advisor`）。设计随之收口：判据 = `docs/core/design/AGENT-LOOP-SUBAGENT.md` §6.60.5 的 AC-DT1（family 侧七名）∥ AC-DT5（advisor 一名），角色串写在同节 §6.60 前言。

## 第 1 轮评审处置（11 条全收，本轮改净）

- **#1 分层结论**：改成一行结论 + 量法（`doc_check(mode:"report", lines:[…])`，软线 500 行 = 主动审视线）；逐档绝对读数住 §5，设计档不抄数。落点 = `docs/core/design/AGENT-LOOP-SUBAGENT.md` §6.60.3。
- **#2 构造**：`thincoder-core/agent-tools/doc-graph.mjs` 改成参数化工厂 `makeDocGraphTool(actions, { readonly, description })`——`ALL_ACTIONS` 一处字面、`READ_ACTIONS` 由它派生 ⇒ 两变体同体、无第二份字面对象；先例对齐到 `thincoder-core/ledger-tools.mjs` 的 `makeLedgerTool`，「偏离 = 无」由此成立（同档 §6.60.2 ②）。
- **#3 纪律住所**：正本 = 同档 §6.60.2 ③ 那一段（本批不改 advisor 提示词 ⇒ 受影响文件表无 advisor 档一行）。
- **#4 单源**：§6.60.2 ② 改成回指 `docs/core/design/DOC-GRAPH.md` §2.5.5（不复述枚举 ∥ `readonly` 逐字值），前言「回指不复述」由此为真；§2.5.5 反向补一条构造单源回指。
- **#5 库外勘察**：§6.60.1 补「已查库外：无」一行（改动面无外部 API ∥ 协议 ∥ 版本断言）。
- **#6 角色串**：当时按并集收口；父侧后把需求档两处对齐成同一串八个角色（增 `plan`）⇒ 设计改按该串收口（`docs/core/design/AGENT-LOOP-SUBAGENT.md` §6.60 前言 ∥ AC-DT1），并集那版作废。
- **#7 双挂**：`eng-coder` ∥ `eng-designer` 两段删字面 `docCheckTool`；AC-DT1 加同名唯一断言（名字数组去重前后等长）。
- **#8 `export`**：`advisorToolsFor` 早已导出 ⇒ §6.60.2 ③ 与受影响文件表均改为「导出面零改」。
- **#9 取用行**：`family-tools.mjs` 取用行只加一个名字 `docGraphReadTool`（`DOC-GRAPH.md` §3 同改）。
- **#10 映射**：§6.60.2 ① 加「段 ↔ 角色」一行（五段 + advisor = AC-10 六角色）。
- **#11 废句**：§6.7.3 的「原「豁免」句废」半句删除，沿革归 commit。

**实施轮新增动作（不在原表内，实现面）**：`docGraphTool` 也走同一工厂（行为逐字不变），故 `doc-graph.mjs` 的改动比原「新导出」多一步「抽工厂 + 两调用点」；AC-DT4 的零回归判据覆盖这一步。

## 第 2 轮（AC-DT6 引缺修正 + 角色串对齐，2026-11-09）

四条 `引缺` 不是误报：实现轮把 `thincoder-core/agent/family-tools.mjs` 那两句「只挂 depth-0 / 不做只读变体」的注释改写、把 `thincoder-core/agent-tools/doc-graph.mjs` 抽成参数化工厂、给 `thincoder-core/advisor/loop.mjs` 的工具数组加了两件 ⇒ §6.60.1 那四条 `依据 …「…」` 引的是改前原文。

- **修法 = 改引现文，不删行**：引文换成盘上现文后，「为什么这么改」仍有据可查。逐条落点（`docs/core/design/AGENT-LOOP-SUBAGENT.md` §6.60.1 勘察证据）：
  - 前两条（原「只挂 depth-0」「不做只读变体」）→「**两变体互斥装配**——本段（depth-0）挂全量四动作；」与「const docTools = [docCheckTool, docGraphReadTool]」，各承载「互斥装配」与「一处写、五处展开」两个口径。
  - 第三条（原 `readonly: false, // 写面工具…`）→「export const docGraphTool = makeDocGraphTool(ALL_ACTIONS, { readonly: false })」。
  - 第四条（原 advisor 旧数组）→ 现文整行（已含两件）。
- **角色串：需求档先改，设计跟随**。F7 与 AC-10 现在举同一串八个角色（含 `plan`）⇒ §6.60 前言、§6.60.2 ① 段↔角色算术、AC-DT1 角色列、用例表第 1 行、D-DT5、§6.60.9 载体说明（六处设计面 + 本节三行）同轮改准。
  - AC-DT1 从六名扩到七名（含 `plan`）：**已实测**——`assembleFamilyTools({ depth: 1, role, engineering: true })` 逐角色跑，七个 family 角色的名字集合各含两件、去重前后等长，`plan` 的 `doc_graph` 枚举三值且 `readonly === true`。
- **只读变体留着 `scan` 的 `scope`：判保留**，理由写进设计（同档 §6.60.2 ② 末条）：两句不矛盾（`scope` 说明以「`scan` only」起头、追加句说 `scan` 归主 agent）；「按动作忽略不相关入参」是全量变体也有的既有行为，不是本变体新开的失败面；删它要在工厂里加一条按 `actions` 派生 `properties` 的分支。**父侧要收则是一处代码改动 + 一轮复验，交实施轮处理。**
- **AC-DT6**：`doc_check(mode:"gate", docs:["docs/core/design/AGENT-LOOP-SUBAGENT.md"])` 首行 `DOC-CHECK GATE: PASS`、0 段有问题。AC-DT1 – DT5 的状态由实施席在 §5 记。

```text
DOC-CHECK GATE: PASS
范围：显式 docs 1 档
判据：逐段检查——文字太长，难于阅读
结论：0 段有问题（1 档全清）
```

## §3 设计评审（评审子代理）
**状态行**：评审通过（第 1 轮设计评审：🔴 0 · 🟡 7 · 🔵 4，VERDICT: pass）



### 轮次 1（评审子代理）

**第 1 轮 · 设计评审结论表（评审子代理）**

四件重点的核定结果：

- **① 段数算术闭合**：`docs/core/design/AGENT-LOOP-SUBAGENT.md` §6.60.2 ① 的五段与 `thincoder-core/agent/family-tools.mjs` 的实读分支逐条相符（`engChildRole === "eng-coder"` ∥ `"eng-designer"` ∥ `role === "coder"` ∥ `role === "consult"` ∥ 末段兜底）。
- **① 无缺角色**：`tester` ∥ `explore` ∥ `plan` 落兜底段，`advisor` 走 `advisorToolsFor` ⇒ AC-10 六角色全覆盖。
- **② 拒 `scan` 的落点**：`thincoder-core/agent-tools/doc-graph.mjs` 的 `execute` 现文 `if (!["scan", "forward", "reverse", "chain"].includes(action))` + 「取值 ∈ {scan, forward, reverse, chain}」；设计「按本变体取值集再拒一次、只印三值」可落且与现报文同族。
- **③ 义务面**：有判据面论证与零硬门决定（D-DT5），但纪律住所未点名（见 #3）。
- **④ 与 §2.5.5 同读**：`docs/core/design/DOC-GRAPH.md` §2.5.5 四行（枚举 ∥ `readonly` ∥ 调 `scan` 的拒绝 ∥ 描述面追加句）逐行无内容冲突；#2244 批档不在本轮评审面内（`unverified`）。

| # | 严重度 | 状态 | 证据 |
|---|---|---|---|
| 1 | 🟡 | 待处置 | §6.60.3「层级结论」只有「**无档跨层**」+「改动量都是几行到三十行级」，缺档级尺寸结论与量法（`docs/core/design/DOC-GRAPH.md` §3 有「量法 = `doc_check(mode:"report", lines:[…])`」） |
| 2 | 🟡 | 待处置 | §6.60.1「最近先例」写「**偏离** = 无」，但先例构造是参数化工厂：`thincoder-core/ledger-tools.mjs` 的 `makeLedgerTool(actions, { readonly = false, writeFace = false } = {})` 与 `ledgerReadTool = makeLedgerTool(READ_ACTIONS, { readonly: true })`；设计只写「新导出 `docGraphReadTool`」，未定构造 |
| 3 | 🟡 | 待处置 | §6.60.2 ③「**这条界线写成纪律而不是机检**」未点名住在哪一档哪一节；§6.60.3 受影响文件表无对应档（无 advisor 提示词 ∥ 纪律面落点） |
| 4 | 🟡 | 待处置 | §6.60 前言「本节回指不复述」与 §6.60.2 ② 实写「**action 枚举** = `["forward", "reverse", "chain"]`」自相矛盾；同一枚举在 `docs/core/design/DOC-GRAPH.md` §2.5.5 表内再出现一次 |
| 5 | 🟡 | 待处置 | §6.60 无公开源勘察行；同批 `docs/core/design/DOC-GRAPH.md` §1 有「已查库外（公开源坐标，三条都相关）」 |
| 6 | 🟡 | 待处置 | `docs/core/requirements/DOC-GRAPH.md` F7 列举 `coder`、AC-10 列举 `tester`（同一规则两串角色）；§6.60 只引 §4 AC-10，AC-DT1 静默取并集 |
| 7 | 🟡 | 待处置 | §6.60.2 ① eng-coder ∥ eng-designer 改后格「同上（`docCheckTool` 由 `docTools` 展开供给）**＋ `docGraphReadTool`**」未写「删掉字面 `docCheckTool`」；尾部统一追加 `...docTools` ⇒ 按字面实现会同段双挂 `doc_check`，而 AC-DT1 只判「都含」不判唯一 |
| 8 | 🔵 | 备注 | §6.60.2 ③「该函数加 `export`（一行）」已是现状——`thincoder-core/advisor/loop.mjs` 现有 `export { advisorToolsFor, advisorToolsFor as _advisorToolsFor }`，且循环已收 `toolsOverride ?? advisorToolsFor(agent, reviewType, batchDoc)` |
| 9 | 🔵 | 备注 | §6.60.3 family-tools 行未写「取用行加 `docGraphReadTool`」；`docs/core/design/DOC-GRAPH.md` §3 同档行写「加两个名字」，而 `thincoder-core/agent/family-tools.mjs` 取用行已含 `docGraphTool` |
| 10 | 🔵 | 备注 | 段↔角色映射未印出（五个 depth>0 段 + advisor = AC-10 六角色，`tester` ∥ `explore` 落兜底段），读者须自行做这步算术 |
| 11 | 🔵 | 备注 | §6.7.3「**advisor 同补（ED-4 起——原「豁免」句废）**」= 存量残句（doc hygiene，非本批引入） |

计数：🔴 0 · 🟡 7 · 🔵 4。

VERDICT: pass

### 轮次 2（评审子代理）

**实施交付评审（AC-DT1 – AC-DT5）结论表**

| # | 严重度 | 状态 | 证据 |
|---|---|---|---|
| 1 | 🟡 | 待处置 | `docs/batches/2026-11-09-subagent-doc-tools.md` §5「实施记录」只有标题、无内容；设计 §6.60.3「绝对值住批档实施记录」因此无落点 |
| 2 | 🔵 | 备注 | 批档单测 AC-DT1 以 `engineering = true` 装配含 `coder` 的六角色；工程模式 role enum 无 `coder`（`family-tools.mjs`「enum: ["explore", "eng-designer", "eng-coder", "tester"]」），断言仍成立 |
| 3 | 🔵 | 备注 | `advisor/loop.mjs` 的 W8 依据段记既有链为 `batch-lifecycle.mjs → …`；可核到的链是 `batch.mjs → batch-paths.mjs → path-resolve.mjs → declared-repos.mjs → declaration.mjs → memory/file-walk.mjs → memory/schema.mjs` |

核定通过的四面（逐条）：

- **装配面**：五段 + advisor 各含 `doc_check` 与 `doc_graph`，同名只挂一次。
- **变体面**：枚举三值 `["forward","reverse","chain"]`、`readonly: true`；调 `scan` 报拒且只印三值。
- **零回归**：depth-0 四动作、`readonly: false` 未变。
- **集成面**：`CLI 30-2` 与 `test/rtm/tooling.md` 的 `30-2` 行在位。
- **W8 契约②**：`doc-check.mjs` 静态链已达 `node:sqlite`，既有 `batchTool` 链同达 ⇒ 非本批新开通路。
- **未跑面**：`node --test` 本轮未执行，判据只据读码与用例内容。

计数：🔴 0 · 🟡 1 · 🔵 2。

VERDICT: pass

## §4 用户批准（主 agent）

## 用户批准（2026-11-09）

- **用户原话：「我觉得两个都得加上，给所有这些子代理。」**（21:55）
- **批准的是**：`doc_check` 与 `doc_graph` 两个工具面挂给全部子代理 / 会诊 / 评审角色。
- **父侧对形态的裁定**：`doc_graph` 挂**查询面**（`forward` ∥ `reverse` ∥ `chain`），`scan` 仍归深 0——扫写共享边表，而子代理的台账面是只读的。用户未反对此形态。
- **`advisor` 的处置**：按用户裁定挂上；**工具在场 ≠ 义务**，判据仍来自文档本体。
- **一处父侧裁定保留**：只读变体仍保留 `scan` 专属参数 `scope`。理由 = 与全量变体对 `forward` 带 `scope` 同样不生效，是既有行为、不是本变体新开的失败面；收它要在工厂里加一条按 `actions` 派生 `properties` 的分支，代价大于收益。

## §5 实施记录（eng-coder）

## 实施轮（eng-coder · 2026-11-09）

**范围 = 批档 §2 的代码面两件**：装配矩阵（§6.60.2 ①）与变体构造（§6.60.2 ②），加 §6.60.2 ③ 的 advisor 面与 §6.60.9 的集成行。

### 改了哪些档，为什么

- `thincoder-core/agent-tools/doc-graph.mjs`：抽参数化工厂 `makeDocGraphTool(actions, { readonly, description })`；`ALL_ACTIONS` 一处字面、`READ_ACTIONS` 由它派生；两个调用点产出 `docGraphTool`（四动作）∥ `docGraphReadTool`（三动作）。execute 的护栏改取同一 `actions` 参数 ⇒ schema 枚举、护栏、拒文取值集同源，变体只印自己的三值。

- `thincoder-core/agent-tools.mjs`：再导出加 `docGraphReadTool`（与 `docGraphTool` 同一行），并把该行上「只挂 depth-0」的注释改成两变体事实——那句原话随本批失效，留着就是一句假话。

- `thincoder-core/agent/family-tools.mjs`：新增 `const docTools = [docCheckTool, docGraphReadTool]`，五个 depth>0 段尾部各展开一次；`eng-coder` ∥ `eng-designer` 两段的字面 `docCheckTool` 删掉（不删就是同段双挂、provider 侧同名报错）；取用行加一个名字 `docGraphReadTool`；depth-0 段照旧挂 `docCheckTool` + 全量 `docGraphTool`。

- `thincoder-core/advisor/loop.mjs`：`advisorToolsFor` 数组尾部追加两件（静态 import，同 `batchTool` 那条的形）；导出面零改，零硬门。

- `test/integration/tester-role.test.mjs`：新增 `CLI 30-2 …`——真门真装配派 `tester`，读子代理那一发请求体的工具表，并与同一次派单所在父进程的 depth-0 家族段对读。

- `test/rtm/tooling.md`：故事 30 节加 `30-2` 行；节注的「两态」改「三态（行序）= 30-1 正常 · 30-2 边界」，并加挂 §6.60.9 回指。

- `docs/batches/2026-11-09-subagent-doc-tools.test.mjs`：本批单测档（与批档同名同目录，收口删除），五条用例覆盖 AC-DT1 – AC-DT5。

### 读数（命令 + 结果，本档只此一处）

- `node --test docs/batches/2026-11-09-subagent-doc-tools.test.mjs` ⇒ **pass 5 · fail 0**（AC-DT1 ∥ DT2 ∥ DT3 ∥ DT4 ∥ DT5）。

- `node --test test/integration/tester-role.test.mjs` ⇒ **tests 2 · pass 2 · fail 0**（30-1 零改仍绿 ∥ 30-2 新增绿）。

- `node --test test/integration/doc-anchor-graph.test.mjs` ⇒ **pass 5 · fail 0**（`doc_graph` 全量变体抽工厂后零回归，AC-DT4 的旁证）。

- 相邻面回归：`advisor-record-gate` 3 pass ∥ `advisor-guard-reminder-cap` 4 pass ∥ `advisor-timeout-hot` 3 pass ∥ `review-doc-scope` 5 pass ∥ `review-standards-injection` 6 pass ∥ `doc-check-line-refs` 4 pass，全 fail 0。

- **失败面的记录**（只读不会红的检查不算验证）：把兜底段的 `...docTools` 临时删掉后，单测档 AC-DT1 当场红（`explore：装配面缺 doc_check：["timer","notify_parent","ledger","team_ledger","manifest"]`）、集成 30-2 当场红（子代理工具表无 `doc_check`）；复原后两边复绿。两次红是这两条判据的失败面读数。

- **量法面**：`doc_check(mode:"report", lines:[…])` 未对本批四档取绝对行数；四档职责未变、未拆（结论同设计 §6.60.3 表）。

### 判据对照（AC-DT1 – AC-DT6）

| # | 状态 | 说明 |
|---|---|---|
| AC-DT1 | ✅ 达 | 六角色 + advisor 各含两件；每段名集去重前后等长（EN 段字面 `docCheckTool` 已删） |
| AC-DT2 | ✅ 达 | 子代理面 `enum` 逐字 `["forward","reverse","chain"]`、`readonly === true`、同名 `doc_graph` |
| AC-DT3 | ✅ 达 | 变体调 `scan` 抛错，报文点名 `scan` 且只印 `{forward, reverse, chain}`；三查询在夹具库上出回执 |
| AC-DT4 | ✅ 达 | depth-0 四动作、`readonly === false`、名集与改前逐名相等；`scan` 仍可用 |
| AC-DT5 | ✅ 达 | advisor 两件皆 `readonly: true`；余名集与改前逐名相等；绑定批档只多 `batch` |
| AC-DT6 | ❌ 未达 | 设计档 `docs/core/design/AGENT-LOOP-SUBAGENT.md` §6.60.1 有 4 条 `引缺`（1248/1249/1251/1254 引的正是本批删改前的原文）⇒ 该档 gate 不 PASS。**归设计席修正**，非本席笔；修后复跑本档 gate |

### 清单外改动（逐条理由）

- `thincoder-core/agent/family-tools.mjs` 的 `docCheckTool` 上方注释：设计 §6.60.3 只点名改 `docGraphTool` 上方那段，但这一句「写文档 / 设计档的角色段（eng-coder / eng-designer）另挂」在本批之后为假 ⇒ 同轮改准（零行为）。

- `thincoder-core/agent-tools.mjs` 的注释：同上理由（「只挂 depth-0」已失效）。

- `test/integration/tester-role.test.mjs` 的档头注释与 `test/rtm/tooling.md` 的节注：新增 30-2 后原文只描述 30-1，属同轮改准。

### 审计与评审轮次

- **内部审计（explore 子代理，对照设计）**：终态 **clean**——AC-DT1 – AC-DT5 逐条 met、七档逐档 met、清单外改动 0；三条观察（`...docTools` 落位在条件段之前 ∥ 多改一处注释 ∥ 只读变体仍带 `scope` 参数）均非四类偏差。

- **内部代码评审（advisor type=code）**：**VERDICT: pass**，🔴 0 · 🟡 1 · 🔵 2，结论表落地 = 本节所属批档 §3 轮次 2。两条 🔵 已在本轮改净（`advisor/loop.mjs` 的 W8 依据段改成可逐跳核到的链；单测档 `assemble` 的 `engineering` 位加一行说明）。🟡 1 = 本节原为空、设计 §6.60.3 的逐档读数无落点 —— 由本节这次的「读数」段承接，逐档绝对行数一项未取，理由记在读数段末条。

- **修正轮**：实现轮内 3 轮（① 单测档 `teardown.mjs` 相对路径修 `../../test/`；② 失败面两验（临时删 `...docTools` → 红 → 复原 → 绿）；③ 评审两条 🔵）

- **终态**：`clean`（代码面与集成面）· 唯一未清项 = AC-DT6，归设计席。

### 上抛项

1. **[上抛·待裁] AC-DT6 归设计席**：`docs/core/design/AGENT-LOOP-SUBAGENT.md` §6.60.1 四条 `依据 …「…」` 引的是本批改前的原文，已随实现失效。建议改法：①② 删那两行（事实由 §6.60.2 ① 承载）；③ 改引现文 `export const docGraphTool = makeDocGraphTool(ALL_ACTIONS, { readonly: false })`；④ 改引现文 `const tools = [readTool, globTool, grepTool, lsTool, lspTool, advisorCodeSearchTool(agent), docCheckTool, docGraphReadTool]`。父侧已裁定：不归本席改、不豁免、如实记未达。

2. **[上抛·知会] 只读变体留着 `scan` 专属参数 `scope`**：设计 §6.60.2 ② 要求「两变体同体」，故未删；代价 = 该变体的 schema 里同时有「`scope` only for scan」的描述与追加句「`scan` belongs to the main agent」。要实现「删参」得写第二份 schema 字面，与设计相冲 ⇒ 留给设计席判。

## §6 验证与收口（父代理）

## 验证与收口（父侧）

### 验收读数（父侧亲自跑，2026-11-09 22:58）

- `node --test test/integration/tester-role.test.mjs` ⇒ **`tests 2 · pass 2 · fail 0`**（`CLI 30-1` 零改仍绿 ∥ `CLI 30-2` 新增绿）。
- `node --test docs/batches/2026-11-09-subagent-doc-tools.test.mjs` ⇒ **`pass 5 · fail 0`**（该档收口时删除，读数留此）。
- `doc_check(mode:"gate", docs:[设计档 AGENT-LOOP-SUBAGENT ∥ DOC-GRAPH ∥ 本批批档])` ⇒ **`DOC-CHECK GATE: PASS`，3 档全清**。

### 失败面（实施席验过，父侧采信其读数）

临时删掉兜底段的 `...docTools` 后：单测 AC-DT1 当场红（`explore：装配面缺 doc_check`）、集成 `30-2` 当场红（子代理工具表无 `doc_check`）；复原后双双复绿。

**只读不会红的检查不算验证**——这一条是本批唯一证明了「这几格真的在断东西」的读数。

### 落地核对

- **参数化工厂**：`makeDocGraphTool(actions, { readonly, description })`；`ALL_ACTIONS` 一处字面、`READ_ACTIONS` 由它派生 ⇒ schema 枚举、execute 护栏、拒文取值集**同源**。
- **`scan` 拒在门外两层**：schema 枚举（建议性）+ `execute` 入口再拒一次并点名该值。
- **五段尾部各展开 `...docTools`**；`eng-coder` ∥ `eng-designer` 两段的字面 `docCheckTool` **已删**（不删即同段双挂、provider 侧同名报错）。
- **`advisor`**：`advisorToolsFor` 尾部追加两件，导出面零改、零硬门。
- **三端与 depth-0**：depth-0 段零改；端侧 tool-table 零改（家族段由核追加）。

### 实施中清掉的两处漂移

- **需求档角色串**：F7 与 AC-10 原本各举六个角色且互缺一个（`coder` ∥ `tester`），父侧对齐成同一串八个（含 `plan`）；设计席同轮把设计面六处改准，AC-DT1 从六名扩到七名（family 七角色 + advisor 由 AC-DT5 覆盖）。
- **四条 `依据` 引文失效**：设计档 §6.60.1 引的正是本批实现删掉的旧文本 ⇒ `引缺`，AC-DT6 一度卡住。设计席逐条改引现文（**改引不删行**，两个口径仍各有据可查），门禁复 `PASS`。

### 已知边界（明写，不留白）

- **只读变体保留 `scope` 参数**：schema 里同时有「`scope` only for scan」的描述与「`scan` belongs to the main agent」的追加句；两句同向（都告诉读者这个参数属于本变体没有的那个动作），不是自相矛盾。父侧裁定保留（见 §4）。
- **`advisor` 不设机检门**：「工具在场 ≠ 义务」写成纪律（§6.60.2 ③ 即正本），本批不改 advisor 的任何提示词档。

### 越软线登记

- 本批未新增越线档；`thincoder-core/agent-tools/doc-graph.mjs` 抽工厂后行数见设计档 §6.60.3 的 tier 结论（本档不记读数，量法在设计档）。

### 集成测试面

- 故事 30 由 1 行变 2 行（`30-1` 正常 ∥ `30-2` 边界），不新开故事。

### 台账

- 本批行 `#2245` 走完 `在途 → 待核销 → 已核销`。
- 本批登记的技术债 `#2247`（`AGENT-LOOP-SUBAGENT` §6.28 指向已不在盘的 `host-shape-spawn.test.mjs`）**不在本批处置**，转入下一批。

### 收口扫描

- **延后批复核**：无。
- **文档检查门**：`PASS`。
- **遗留**：`#2247` 未处置（见上）。
