# 2026-11-12 · acceptance-no-self-count
> 六段，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 每段只有一个作者：作者的段可 `append` 加内容、可就地改（`edit`）；非作者一概拒。
> 编制：主 agent · 2026-11-12 · 来源 = 用户 2026-11-12 14:35「你要检查提示词，让他别瞎写验收标准」；14:39「我总感觉你在这个问题上绕来绕去的」；14:40「必须输出改前读数，但是不是放在设计文档里，可以放在批档里」。。
> 台账 = #2355（core · 归批）。前情 = 无（独立批）。
## §1 讨论（主 agent）
**状态行**：🔄 进行中（…）
批起 sha = a3daddd838ea13544261c873a8851ca1585bbb20
<§1 模板占位：本批条目 / 关键判据 / 授权口径>

**要解决的问题**

设计席提示词里管验收的只有一句「Acceptance criteria … (each verifiable)」，`common.md` 再加一句「every requirement is verifiable」。**两句管的都是「读得出来吗」，不管「这个数会不会被活本身改变」。**

后果（本会话实例）：一批的验收写成「表里有七个行」，本批每新建一个代码档就要改一次验收——而那一次改动正是账本失去意义的地方：读者再没法从验收行看出活干完没有。

**已定的三件**（用户 2026-11-12 14:40 逐字）

- 每个受影响的代码档**必须报改前读数**——这是义务，不是可选项；
- 读数**住批档 §2 的受影响文件表**，不进设计档正文（设计档写规则，不写本批的数）；
- 验收标准写「必须成立什么」，**不数本批自己的产出**。

**库内 = 已查**：查询「acceptance criteria design prompt」→ 命中 `thincoder-core/prompts/persona-eng-designer.md`（设计档 9 项第 5 条）· `thincoder-core/prompts/common.md`（Acceptance before prose）· `docs/core/standards/METHODOLOGY.md` F-R24a（逐档报原始行数已在此）。

**库外 = B 类**：改动面 = `thincoder-core/prompts/persona-eng-designer.md`；外部断言 = 零（提示词文本，无外部依赖、无协议面、无版本断言）。

- **已定决定**：改前读数必报、住批档 §2、不进设计档；验收不数本批产出 · 用户原话：「必须输出改前读数，但是不是放在设计文档里，可以放在批档里」 · 时间：2026-11-12 14:40

- **已定决定**：改前超过 500 行 ⇒ 必须给分拆方案，且分拆在本批内做完 · 用户原话：「还有改前超过500行，必须分拆。」 · 时间：2026-11-12 14:43
- **已定决定**：提示词要要求设计器——设计文档写最终形态，本次工作任务写在批档里 · 用户原话：「我是说提示词里要要求设计器，设计文档写最终形态，本次工作任务写在批档里」 · 时间：2026-11-12 14:44
- **已定决定**：验收标准写成「每个代码文件都小于 500 行」这种必须成立的样子，具体几行不关心 · 用户原话：「验收标准是每个代码文件都小于500行，具体是几行不关心」 · 时间：2026-11-12 14:46

## §2 批次任务与设计（eng-designer）
**状态行**：设计完成（落点 = 九项第 5 项一处增列 · 条目①②④ 零笔（① 由他批落点承载）· 设计面 = §6.98）


### 本批条目（覆盖的四条事实）

| # | 条目 | 落点 | 状态 |
|---|---|---|---|
| ① | 每个受影响的代码档报改前读数；读数住批档 §2 受影响文件表第三列，不进设计档 | 由他批（`2026-11-12-tier-reading-gate`）落点承载、本批零笔：`thincoder-core/prompts/persona-eng-designer.md` 九项第 3 项现文「Every code file this batch touches reports one number — its content-line count in the batch-start snapshot — in the third column of batch record §2's affected-files table」；新建档一支「A file the batch-start snapshot does not carry (built inside this batch) takes the literal `新` instead of a number.」 | 零笔 · 已在盘（他批落点） |
| ② | 改前超 500 行 ⇒ 给分拆方案，且分拆在本批内做完 | 同项 `Three lines` **已在盘逐字成立**（`a source or test file over 500 lines before the change ⇒` ∥ `the design carries a split plan that lands inside this batch;`） | 零笔（不落第二份） |
| ③ | 验收标准写「必须成立什么」，不数本批自己的产出 | 同档九项第 5 项（项内增列三行，逐字块 = 设计 §6.98 围栏块） | 已落笔（§5 实施记录） |
| ④ | 设计文档写最终形态；本次工作任务写批档 | 已覆盖：`thincoder-core/prompts/discipline-engineering.md` 的 D17（`a design or requirement document states what should be now, never how this batch will change it: no` ∥ `The plan lives in the batch record — §2 for what changes, §5 for what changed.`）+ `thincoder-core/prompts/persona-eng-designer.md` 的 `**Current state only**: a design/requirement doc states what is true now.` | 零笔（缺的是执行，不是条文） |

**明确不在本批**：`thincoder-core/prompts/common.md`（受众含普通模式与写不了 §2 的子代理）· `discipline-engineering.md` 的 D17 本体 · advisor 层 ∥ 需求档 ∥ 标准层 · 500 ∥ 800 ∥ 300 三行阈值与量法 · 机检门 / 单测档 / 探针 · 批档六段结构 · 在途其它批档。

### 目标态

设计席的 9 项里，第 3 项回答「§2 那张表写什么」（每档报一个数、写进 §2 第三列；新建档写 `新`；设计档只写规则），第 5 项回答「验收写什么」（必须成立的事，不是本批产出数）。改后读者读到「表里有七行」知道不该写；读到「每档报一个数、写进 §2 第三列」知道必须写且写在哪里；读到「改前 520 行」知道要拆且本批拆完。

逐字英文目标文本 = `docs/core/design/PROMPT-SYSTEM.md` §6.98「逐字英文文本」一块围栏（第 5 项三行；实施席照此落笔，行首七空格与各项既有续行同形）。

### 判据（读者面，父侧逐字）

读者读完两处之后：

1. 遇到「表里有七行」知道自己不该这么写验收；
2. 遇到「每档报一个数、写进 §2 第三列」知道必须写、且写到哪里；
3. 遇到「改前 520 行」知道要拆、且本批拆完。

### 落点

| # | 落点 | 形 |
|---|---|---|
| ① | 九项第 3 项（`3. **Affected-file list**` 项内） | 零笔：条目一由他批落点承载，见本段「本批条目」① |
| ② | `thincoder-core/prompts/persona-eng-designer.md` 九项第 5 项：`5. **Acceptance criteria pointing back**` 那一行之后 | 项内增列三行 |

零新节、零新项：九项仍 `1.`–`9.` 齐，`##` 9 处、`###` 1 处。只落一处、另外三条零笔的理由 = `docs/core/design/PROMPT-SYSTEM.md` §6.98 K1 ∥ K3。

### 受影响文件与改前读数

**量法** = `docs/core/standards/CODE-TIER.md` §2 ②（该格写的是该档在批起 sha 上的内容行数）∥ §7（读数面）；读数取法 = `countContentLines`（`thincoder-core/agent-tools/batch-tier-gate.mjs` 导出），本席本轮现量。单源 = `docs/core/standards/METHODOLOGY.md` F-R24a。

| 档 | 类别 | 批起快照读数（`a3daddd8` 上的内容行数） | 尺寸档位 | 分拆方案 |
|---|---|---|---|---|
| `thincoder-core/prompts/persona-eng-designer.md` | 代码档（源；提示词 = 产品代码面） | 199 | 未越 500 —— 不判分拆 | — |
| `docs/core/design/PROMPT-SYSTEM.md` | 设计档（状态档，非代码档，不读数） | — | 不适用 | — |

**读数取值面 = 批起快照，不是此刻盘上**：量法 `countContentLines`（`thincoder-core/agent-tools/batch-tier-gate.mjs` 导出）对批起 sha `a3daddd8` 上的该档现量。工作区现值 213（本席本轮现量；§5 记的 207 → 212 是那一轮落笔当刻的读数，此后该档又被别的批改过）——两数不同是本批在治的那个病的现象，不是矛盾。

**表级尺寸档位结论 = 无档越线**：本批唯一的代码档读数 199 行，远在 500 之下；本批不产生新代码档，故无需分拆方案，`CODE-TIER.md` 的 800 收口线与 300 函数体线均不触发。

**受影响文件（机读清单）**

```text
| 档 | 分拆方案 | 行数 |
|---|---|---|
| thincoder-core/prompts/persona-eng-designer.md | — | 199 |
```

### 验收（回指设计档，不抄判据）

- 读者面逐条 = `docs/core/design/PROMPT-SYSTEM.md` §6.98「验收」A1–A6：A1 = 第 3 项既有三列句在位（本批零笔，只读）；A2 = 第 5 项新增句在位（本批落笔）；A3–A6 各自读现盘。本批不另立判据。
- 本批「判据」三条即 A4（三问读者面）的展开，二者同源。
- 测试覆盖：纯文本改动、无分支 ⇒ 零单元测试档；机判 = `doc_check(mode:"gate")`（设计档 ∥ 提示词档逐行 ≤300）+ 设计档 §6.98 A1 ∥ A2 ∥ A3 的逐字串在位判。不新增常驻断言 ∥ 探针脚本 ∥ 夹具。

### 边界

只改 `thincoder-core/prompts/persona-eng-designer.md` 九项第 5 项一处；第 3 项零笔；不改别的提示词、不改需求档 / 标准层 / 实现代码；不加禁令清单、不新开节、不新增机检；本设计轮提示词零笔（实施轮由 eng-coder 落笔）。

### 关键决策

`docs/core/design/PROMPT-SYSTEM.md` §6.98 的 K1–K4（只落第 5 项一处 ∥ 术语取 `code file` ∥ 条目一、二、四零笔 ∥ 验收例子写明是「形状」）。

### 集成测试 delta

`test/RTM.md` 内 `提示词` ∥ `prompt` 零命中（本席本轮实读）⇒ 零行可破、零行冗余、零行新增：本改动不改变任何业务可观察结果，也无生产问题入口。

### 上抛项

无。

## §3 设计评审（评审子代理）
**状态行**：评审通过



### 轮次 1（评审子代理）

| # | 严重度 | 状态 | 证据 |
|---|---|---|---|
| 1 | 🟡 | open | §6.98「验收」A3 行「D17 与 `## Current state only` 逐字未动」——探针形不成立：实档为 `**Current state only**: a design/requirement doc states what is true now.`；且批档 §2 ④ 行「同档 `## Current state only`」把它记到 `discipline-engineering.md`，该档无此串 |
| 2 | 🟡 | open | §6.98 K2 理由「一个东西一个名」 vs 落点 ② 围栏 `every code file stays under 500 lines`（同批内同一判域两个名） |
| 3 | 🟡 | open | §6.98 对照表「自查照跑；义务从自查动作移到清单项，两处不互斥」——既有 pre-review check ② 「paste that reading line into batch record §2」零笔，义务在同一档两处活描述 |
| 4 | 🟡 | open | §6.98 无 Interface contract 一行；九项抬头「for an omitted item, write one line in the design doc saying why it does not apply」；所引先例 §6.97 有「Interface contract：不适用」 |
| 5 | 🟡 | open | §6.98 K2 是显式命名决定，无「既有件三问」三答行（existing ∥ none found ∥ existing but unusable） |
| 6 | 🔵 | open | 批档 §2 受影响文件表「设计档（状态档，非源 / 测试档） | 10275 | 不适用（F-R24a 判域 = 源 / 测试档）」——不适用格仍载数；盘上现值 10379，无批起快照可核，读数 unverified |
| 7 | 🔵 | open | §6.98 A5「新增两段内读不到禁令词」——未给词集或指名词集所在节 |

已核通过项：最近先例行带偏离理由；公共源勘察行在位；集成测试 delta 述明理由且 `test/RTM.md` 实读 `提示词` ∥ `prompt` 零命中（本轮复核）；受影响文件皆 `.md`（档位判定豁免），批档 §2 表级结论「无档越线」在位；设计档内零读数（合 F-R24a）。

VERDICT: pass

计数：🔴 0 · 🟡 5 · 🔵 2

### 轮次 2（评审子代理）

### 轮次（实施面独立复核 · 落笔后复读成品）

| # | 严重度 | 状态 | 证据 |
|---|---|---|---|
| 1 | 🟡 | open | 九项第 3 项新句 `Every source / test file this batch touches reports its pre-change line count` 无「新建档」分支——标准层 `CODE-TIER.md` §2 ② 的口径是 `写 0 会被读成「量过、是空的」，写别的数就是编`（报 `新`）；属围栏本体缺口，非逐字偏差 |
| 2 | 🟡 | open | 九项第 5 项新句 `every code file stays under 500 lines` 与第 3 项 `source / test file` 同判域两名（设计 §6.98 K2 定名 `source / test file`）；即轮次 1 第 2 行在成品文本上的落点 |
| 3 | 🔵 | open | §6.98 A5 `新增两段内读不到禁令词` 仍无词集；成品新句含 `never this batch's numbers`，宽读即命中，A5 不可判 |
| 4 | 🔵 | open | A5 的 `##` ∥ `###` 「与改前同数」不可复算：§2 报改前 207 行、成品 212 行（207+5 自洽），但盘上无改前快照 |

已核通过项：

| # | 项 | 读数 |
|---|---|---|
| P1 | 逐字落笔 | 两处与 §6.98 围栏块逐字一致：`**Every source / test file …**` 两行在 `3. **Affected-file list**` 之后、`Three lines, and they are the rule itself` 之前；`**An acceptance criterion states what must hold…**` 三行在 `5. **Acceptance criteria pointing back**` 之后；行首七个空格同形 |
| P2 | A1 ∥ A2 | `reports its pre-change line count` ∥ `batch record §2's affected-files table` ∥ `states what must hold, not what the count happens to be` ∥ `this batch's own tally` 各在位 |
| P3 | A3 | `a source or test file over 500 lines before the change ⇒` ∥ `the design carries a split plan that lands inside this batch;` 原样在读 |
| P4 | A5 结构面 | 九项仍 1–9；`##` 9 处；`###` 1 处 |
| P5 | A6 | `doc_check` 首行 = `DOC-CHECK GATE: PASS`（本轮实跑 `thincoder-core/prompts/persona-eng-designer.md`） |
| P6 | 与自查段同向 | 新句与轮末自查 ② `paste that reading line into batch record §2` 同向（§2 载读数、设计档载结论），无矛盾 |

VERDICT: pass

计数：🔴 0 · 🟡 2 · 🔵 2

## §4 用户批准（主 agent）
## §5 实施记录（eng-coder）
**状态行**：实施完成（两处逐字落笔 · 207→212 · doc_check PASS · 审计 ∥ 评审终态 clean）



### 交付摘要

落点 ① = 九项第 3 项内增列 2 行：`3. **Affected-file list**` 那一行之后、`Three lines, and they are the rule itself` 那一行之前。

落点 ② = 九项第 5 项内增列 3 行：`5. **Acceptance criteria pointing back**` 那一行之后。行首七个空格，与项内既有续行同形。

两段与 `docs/core/design/PROMPT-SYSTEM.md` §6.98「逐字英文文本」两块围栏逐行相等（比对输出 true ∥ true，红面复跑 false）。零新节、零新项、零删行、零禁令清单。

改动面 = `thincoder-core/prompts/persona-eng-designer.md` 一档，即 §2 受影响文件表点名的唯一源档；无第二档被写。

改前读数 207 → 改后 212（同一把尺 `countContentLines`，与 §2 同源），差值 +5 = 本批增列行数，无别的行被碰。

### 验收读数（设计 §6.98 A1–A6）

| A | 读数 | 结论 |
|---|---|---|
| A1 | 第 3 项内 `reports its pre-change line count` 1 处 ∥ `batch record §2's affected-files table` 1 处 | ✅ |
| A2 | 第 5 项内 `states what must hold, not what the count happens to be` 1 处 ∥ `this batch's own tally` 1 处 | ✅ |
| A3 | `a source or test file over 500 lines before the change ⇒` ∥ `the design carries a split plan that lands inside this batch;` 逐字仍在；`**Current state only**: a design/requirement doc states what is true now.` 未动 | ✅（事实二零笔成立；D17 未碰） |
| A4 | 三问读者面：段 ② 明写 `the design has seven rows` 是 `this batch's own tally`；段 ① 明写读数住 §2 受影响文件表；500 行分拆句在位 | ✅ |
| A5 | 计数面：九项 1–9 齐、`##` 9 处、`###` 1 处（改前 = 改后）；词集面 = 判不成立（见「落地核对」第 2 行） | 计数 ✅ · 词集面红 |
| A6 | `doc_check(target=仓根, mode:"gate", docs=["thincoder-core/prompts/persona-eng-designer.md"])` → 首行 `DOC-CHECK GATE: PASS` | ✅ |

### 自查与验证

| 检查 | 取法 | 读数 |
|---|---|---|
| 逐字一致（红面也跑） | 从 §6.98 取两块围栏，与落档对应行逐行比；再把其中一处 `line count` 改成 `line counts` 复跑同一函数 | true ∥ true；改一字后 false（判据非空判） |
| 改前 ∥ 改后行数 | `countContentLines`（`thincoder-core/agent-tools/batch-tier-gate.mjs` 导出，与 §2 同一把尺） | 207 → 212 |
| 项数 ∥ 节数 | node 行扫描：九项列表 9 ∥ 9、`##` 9 ∥ 9、`###` 1 ∥ 1（HEAD 快照 → 现盘） | 零连带 |
| 行宽 | 同一次行扫描：>300 字符行 | 0 |
| 文档门 | `doc_check(mode:"gate")` | `DOC-CHECK GATE: PASS` |
| 提示词引用门 | `node scripts/prompt-refs-check.mjs` | FAIL 9 条，本档 0 条（9 条全在 `persona-engineering.md` ∥ `batch-supersede.mjs` ∥ `ledger-close-proof.mjs`，属他批 / 代码面，见 Leads） |
| 单元测试档 | 纯文本增列、无分支 ⇒ 零单测档（设计 §2「测试覆盖」已定，未新造常驻文件） | 无 |
| 集成 delta | `test/RTM.md` 内 `提示词` ∥ `prompt` 零命中（本席本轮实读）⇒ 破行 ∥ 冗余 ∥ 新增均零 | 零行 |

### 决定披露

| 决定 | 理由 |
|---|---|
| 围栏一字不改（含 `never this batch's numbers` ∥ 例子 `every code file stays under 500 lines`） | 设计档 = 权威规格；K2 ∥ K4 的张力属设计面（§3 轮次 1 第 2 行已记），实施席自改即偏离 |
| 未新增单测档 ∥ 探针 ∥ 机检门 | 两处增列无分支；§2 边界明列不新增机检 |
| 未动 `common.md` ∥ `discipline-engineering.md` ∥ 需求档 ∥ 标准层 | §2 边界明列零笔 |

### 内部审计 ∥ 代码评审 ∥ 终态

| 轮 | 席 | 结论 |
|---|---|---|
| 1 | 内部 explore 偏差审计（只读） | `TERMINAL: divergence found (1)`——唯一一条 =「§5 实施记录为空」，即本段，现已写；提示词面四类偏差（缺落 ∥ 静默简化 ∥ 文档漂移 ∥ 超范围）均为零 |
| 1 | 内部 advisor 代码评审 | `VERDICT: pass`；🟡 2 ∥ 🔵 2，全部落在设计侧围栏与判据措辞，实施面零 must-fix；其评审轮已自写入 §3「轮次 2」 |
| — | 自修轮 | 0 轮（无 must-fix 项；两处 🟡 均为设计侧改笔，不由实施席自改） |
| 终态 | — | `clean` |

### 落地核对（本批落地使哪条设计档句子不再成立）

| # | 档 ∥ 节 | 原句逐字 | 落地后实况 |
|---|---|---|---|
| 1 | `docs/core/design/PROMPT-SYSTEM.md` §6.98「验收」A3 | 「D17 与 `## Current state only` 逐字未动」 | 该串在提示词档不存在；实档是 `**Current state only**: a design/requirement doc states what is true now.`（§3 轮次 1 第 1 行同记，非本批落地所致） |
| 2 | 同档 §6.98「验收」A5 | `新增两段内读不到禁令词；九项项数仍 9` | 词集未给；且围栏块 ② 首行自带 `must`（`states what must hold`，正是 A2 要求在场的串）、块 ① 自带 `never`。按 §6.79 的禁词表扫必红，按 §6.75 A4「词表不作判据」的判法则绿——A5 按字面不可判 |
| 3 | 同档 §6.98「关键决策」K2 | 「术语取 `source / test file`，不取 `code file`」 | 围栏块 ② 的例子写的是 `every code file stays under 500 lines`；照抄落笔后同一档内两词并存（§3 轮次 1 第 2 行同记） |
| 4 | 同档 §6.98「逐字英文文本」落点 ① 那一段（围栏本体） | `**Every source / test file this batch touches reports its pre-change line count，` | 无「本批新建档」分支：新建源 / 测试档没有改前读数，读者按此句只能编数；标准层要求写 `新`（`docs/core/standards/CODE-TIER.md` §2 ②「写 0 会被读成「量过、是空的」，写别的数就是编」）。属围栏缺口，非逐字偏差 |

以上四条断法（代码错 ∥ 目标变了）归收口判；实施席未改设计档一字。

### Leads（不在本批范围）

- `node scripts/prompt-refs-check.mjs` 现盘 FAIL 9 条：`persona-engineering.md` 2 条 ∥ `batch-supersede.mjs` 5 条 ∥ `ledger-close-proof.mjs` 2 条。本档 0 条 ⇒ 与本批改动无关；疑似在途他批（`2026-11-12-restate-before-spawn`）与代码面既有漂移，属其归属方处理。
- 工作树有大量未提交改动（`git status` 114 项 M ∥ 12 项 D ∥ 20 项 未跟踪），本档在本次落笔前即为 `M`（含他批增列 8 行）。本席交付差值按写前 ∥ 写后现量取（207 → 212），未据 HEAD 推算。

## §6 验证与收口（父代理）
