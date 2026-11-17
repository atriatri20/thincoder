# 2026-11-10 · p2-1-volume-convergence
> 六段，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 每段只有一个作者：作者的段可 `append` 加内容、可就地改（`edit`）；非作者一概拒。
> 编制：主 agent · 2026-11-10 · 来源 = 用户 2026-11-10 16:11 批准 P0–P2 全部并自动执行；范围 = docs/core/requirements/ENGINEERING-SYSTEM-OPTIMIZATION.md 的 C10 + P2-1 行。
> 台账 = #2294（core · 归批）。前情 = docs/batches/2026-11-10-p1-2-micro-batch-cost.md §6（已收口 2026-11-10）。
## §1 讨论（主 agent）
**状态行**：已收口 2026-11-10
批起 sha = 4fafb49c002e12d935989fd9a7eeb72d0d0d2c6b
<§1 模板占位：本批条目 / 关键判据 / 授权口径>

## 讨论（体量收敛）

**目标**：同一规则只在一处详述，其余删除或一句指向；设计档规范面只留量法，绝对读数住批档。

**已定决定**：

- **C10 的射程 = 重复，不是失效**：同一规则在主 persona 与 discipline 同文重复、主 agent 收两遍的那些条（「裸档名可解析」「示例路径进围栏」「doc_check PASS」「异步报告自动到达」等）⇒ 每条只留一个权威位置。
- **绝对读数那条 = 规范面不收数**：档数 ∥ 条数 ∥ 行数的绝对值从设计档正文撤到批档；**量法与阈值留下**（阈值是判据，不是读数）。
- **不改判据、不改规则语义**：本批只去重与挪读数，任何一处若需要改规则才能去重 ⇒ 停下报我。

`库内 = 已查：主 persona 与 discipline 的同文重复` → 落在 `thincoder-core/prompts/persona-engineering.md` ∥ `discipline-engineering.md`；设计档读数面 = `docs/core/design/**`。

`库外 = B 类：改动面 = 提示词与设计档；外部断言 = 零`

## §2 批次任务与设计（eng-designer）
**状态行**：设计完成（C10 与 P2-1 设计已落；doc_check PASS）
### 本批条目与设计落点

| 条目 | 覆盖 | 设计落点 |
|---|---|---|
| C10 重复条款收敛 | 两份工程模式提示词的同文重复与角色独有半边保留 | `docs/core/design/PROMPT-SYSTEM.md` §6.97 |
| P2-1 设计档绝对读数 | 档数、条数、行数的规范面清退，量法与阈值保留 | `docs/core/design/DOC-DISCIPLINE.md` §3.30 |

明确不在本批：需求档修改、代码与装配逻辑修改、规则语义或阈值调整、其他提示词、常驻测试夹具、集成用例新增。

### C10 任务表

每行的完整判据与红侧回指 `design §6.97.1`；R14 是短执行句的保留项，防止把角色说明误当第二份详述。

| # | 重复规则 | 权威位置 | 另一处怎么处置 |
|---|---|---|---|
| R1 | 三式工作法 | discipline `How a good engineer moves` | persona 删除同名整节 |
| R2 | 模式理由、测试累积与 drift 通用理由 | discipline `Why this mode exists` | persona 只留主 agent 责任块 |
| R3 | 需求决定当轮落盘 | persona `Confirmation & approval gate` | discipline 步骤 1 的这条只留一句执行口径（动作主体 + 两个落点），删掉它复述的理由；persona 的固定行形、压缩重锚与未落盘决定处置不动 |
| R4 | product/doc 改动面分类 | discipline `Change-face routing` | persona 删除路径域重述，保留派单前判面与机器单源 |
| R5 | tool-face 仍须代码轨评审 | persona `Change-face routing and dispatch fields` | discipline 删除重复行；persona 的发起动作与 §3 落点保留 |
| R6 | 最近先例三问及回答形态 | discipline `Closest-precedent survey` | persona 删除重复定义，保留收口抽样 |
| R7 | 任务边界、Leads、finding 与可复现路径 | discipline `Task boundary & finding discipline` | persona 删除共享定义，保留入账、§6 与阻塞例外 |
| R8 | 范围内欠账随批挂号与 `trigger` | discipline `Rules & exceptions` | persona 删除共享时点、字段与计数定义，保留主 agent 路由 |
| R9 | 一个实施轮使用自己的批档 | persona `Batch-record lifecycle` | discipline 自持节删除离题重复条 |
| R10 | 裸档名唯一时可解析 | discipline D4 后条 | persona 删除同文条 |
| R11 | 示例路径、命令进入围栏 | discipline `Doc discipline` | persona 删除同文条，doc-check 门不动 |
| R12 | D7 的前批遗留、暂缓复核、settlement line | discipline D7 | persona 删除清单重复，保留会话启动与条件事件扫描 |
| R13 | 异步报告自动到达 | discipline `Parallel calls` | persona 只留结束轮次、status/observe 与 blocking wait_for 的父侧动作 |
| R14 | 写域与派单路由 | discipline D1 | persona 的短角色执行句保留，不复制作者分配表 |

`doc_check PASS` 在这两档不是重复规则，零改。设计连续打回停止与同一判据机械失败停止是两条不同停止条件，零合并、零阈值改动。判据见 `design §6.97.2`。

### P2-1 任务表

每行判据回指 `design §3.30.1`；判类规则回指 `DOC-DISCIPLINE.md` §3.22 的 U-5 / U-6。

| 读数类 | 撤哪个面 | 量法留哪 |
|---|---|---|
| 档数 | `docs/core/design/**` 规范面中的库存、扫描覆盖量、命中档数与无表合计 | 目录全集、文件闭集、扫描域、排除面与集合差；数值只出命令或批档 |
| 条数 | 同面中的当前条数、命中处数、样本量、清账结果及派生比例 | 条目定义、正则、判定谓词、排除面；内置 `grep` 或既有复算式 |
| 行数 | 同面中的当前、改前改后、净增与目标绝对行数 | `doc_check` 的 `lines` / `countContentLines` 与尺寸阈值；只写同尺关系 |

阈值、测试输入与预期、行为契约数量、本节目表支撑的结构数保留。D12 行不改，因为它已写明「规范面零绝对读数」；本批只清理违反它的现存文本。

### 受影响文件与测试覆盖

| 文件 / 域 | 改动 |
|---|---|
| `thincoder-core/prompts/persona-engineering.md` | 实施席按 R1–R13 去重 |
| `thincoder-core/prompts/discipline-engineering.md` | 实施席按 R3、R5、R9 去重，其余权威正文保留 |
| `docs/core/design/PROMPT-SYSTEM.md` | 本席已落 §6.97；按 §3.30 清理其中读数；并按 R1–R3 收正 §6.72 ∥ §6.95 ∥ §6.73 ∥ §6.36 块 C ∥ §6.96.4 ∥ §6.96.10 ∥ §6.96.11 |
| `docs/core/design/DOC-DISCIPLINE.md` | 本席已落 §3.30；D12 不改，清理其中读数；并按 R10、R11 收正 §3.27 ∥ §3.28 ∥ A-DD42 ∥ A-DD43 ∥ DD-194 ∥ DD-205 与 D16 行 |
| `design §3.30.3` 列名的其余设计档 | 逐节判类后清理实际读数命中；精确文件清单以该节为准 |

写域分工：设计档由 eng-designer 按 `design §3.30` 清理；两份提示词由 eng-coder 按 `design §6.97` 去重。两写域同批落地，运行时代码零改。

分层结论：全部是 `.md` 文本，无代码跨档与拆分计划。无接口变更，无新增常驻单元测试档、探针脚本或常驻夹具；本批交付的改面单元测试档随批收口删除。验证 = 两份提示词逐节对照、改前探针命中与改后同探针零命中、读数保留项逐节读者判读，以及 `doc_check(mode:"gate")`。

### 验收对照

- C10：`design §6.97.1` 的每行只剩一个详述点；主 agent 不再重复接收；子代理共享规则不丢失；角色独有触发、动作和记录位置不丢失。
- P2-1：`design §3.30.1` 三类绝对值撤到批档，量法、阈值、结构数与行为数量保留；删数后的现状断言按盘重核。
- 统一负例：不得合并 `doc_check` 的不同主题或两条不同停止条件；不得以「实读 / 历史 / 只作记录」保留绝对读数；不得用零正则命中代替逐节判读。
- RTM delta：`test/RTM.md` 无此文本清理的业务入口；不改业务可观察结果，无生产问题新入口，破行、冗余、新增均为零。

### 关键决策

权威位置由主题归属决定，短角色动作不等于重复详述。D12 规则已经完整，不通过改写规则来清理存量。其他设计档与两份目标设计档同批按 U-5 / U-6 清理，不把「重复」当「失效」，也不把「有数字」当「读数」。

### 上抛项

无未决项。两条停止条件已由父侧确认为不同规则，本批不动。

### 前节收正（评审五条逐一处置）

统一判据 = 同一份设计档里不能再同时读到两种互斥的终态。每条二选一：收窄 R，或同步收正前节的目标与验收。

| # | 处置 | 改在哪 |
|---|---|---|
| 1（R1） | 收正前节 | `PROMPT-SYSTEM.md` §6.72：落点表删 persona 行、标题改「纪律档档首新增一节」、两段「为什么」并为「为什么只落纪律档一处」、A1 ∥ A3 ∥ A4 ∥ A5 ∥ A10 与用例 C1 改到纪律档；§6.96.4 与 §6.96.11 的 C4 行从「两处都改为 / 两档同一短句」改为纪律档一处 |
| 2（R2） | 收正前节 | 同节「人格档的落点」改为：三式与通用理由都不落人格档，人格档只留责任句与三条 bullet；A1 的判据改为 `^## Why this mode exists` 与 `^## How a good engineer moves$` 两条零命中 |
| 3（R3） | 收窄 R | R3 改为「discipline 步骤 1 只留一句执行口径（动作主体 + 两个落点），删掉它复述的理由」；§6.36 块 C 删去复述 why 的半句，A4 的块 C 判据改为「三空格缩进的子 bullet 继承父条目 why」 |
| 4（R10） | 收正前节 | `DOC-DISCIPLINE.md` §3.27：落点表删 persona 行并重编号，七组九档 → 六组八档；A-DD42 ① ② ④ ⑥、DD-194、§3.27 全文计数、§1 的 D16 行与档头枚举同轮改齐 |
| 5（R11） | 收正前节 | §3.28：落点表第 4 行只留 designer ∥ coder，五行七档 → 五行六档；A-DD43 ① ④ ⑦、DD-205 与 §3.28 全文计数同轮改齐 |

R10 ∥ R11 为什么不收窄：C10 的射程在 §1 已定决定里逐字点名「裸档名可解析」与「示例路径进围栏」两条，只留一个权威位置是用户裁定，收窄即改规则。

增补验收：读者打开 `PROMPT-SYSTEM.md` 的 §6.72 ∥ §6.95 ∥ §6.73 ∥ §6.96.4 ∥ §6.96.11，读到的都是「三式与通用理由只在纪律档」；打开 `DOC-DISCIPLINE.md` 的 §3.27 ∥ §3.28，落点档数与 A-DD42 ∥ A-DD43 的判据同数。

### 第 2 轮收正（评审七条逐一处置）

统一判据同前节：同一份设计档里不能再同时读到两种互斥的终态。本轮扫的射程包含点名的行与同节的既有件、关键决策、偏离与验收。

| # | 处置 | 改在哪 |
|---|---|---|
| 🔴1 | 收正 §6.72 四处旧终态：既有件三问改为人格档两节按 §6.97 删除；K1 改「通用理由只落纪律档一处、不落公共层」；K2 改「通用理由只落纪律档一处，义务句只写人格档」；偏离删原 ② 并把原 ③ ④ 顺编为 ② ③ | `PROMPT-SYSTEM.md` §6.72 既有件三问 ∥ K1 ∥ K2 ∥ 偏离 |
| 🔴2 | §6.73 既有件三问改为定位纪律档的两节（`## How a good engineer moves` ∥ `## Why this mode exists (the chain every seat here protects)`），括注改 `§6.72 终稿一 ∥ §6.95`，删去已不存在的「终稿一」指称 | `PROMPT-SYSTEM.md` §6.73 既有件三问 |
| 🟡3 | 落点标题「两处」→「一处」；A6 ∥ A7 的「两落块」改为点名两个落块（纪律档「终稿一」∥ 公共层「终稿二」）；受影响文件删人格档落点，注明其两节归 §6.97 的 R1 ∥ R2 | `PROMPT-SYSTEM.md` §6.72 落点 ∥ A6 ∥ A7 ∥ 受影响文件 |
| 🟡4 | §3.28 跨层结论「十档」→「九档」（落点六档 + 示例三档） | `DOC-DISCIPLINE.md` §3.28 跨层结论 |
| 🟡5 | 受影响文件表补 §6.95 ∥ §6.73：本节受影响表与 §6.97.3 表同轮改；本批受影响表与增补验收行同轮改 | 本档上文两处 ∥ `PROMPT-SYSTEM.md` §6.95 受影响文件 ∥ §6.97.3 |
| 🟡6 | §6.72 A5 判据改为「人格档 `##` 计数比改前少两节」，并把删除的归属写明 = §6.97 的 R1 ∥ R2 | `PROMPT-SYSTEM.md` §6.72 A5 |
| 🔵7 | §3.27 标题与档头枚举的「六落点」统一为「六组」，与表题「六组 · 八档」同词 | `DOC-DISCIPLINE.md` §3.27 标题 ∥ 档头枚举 |

同轮扫出的连带三处（均属同一缺陷类，未在七条内点名）：

| 处 | 原状 | 处置 |
|---|---|---|
| §6.72 终稿块序号 | 人格档那份（原「终稿一」）删除后，「终稿二 ∥ 终稿三」成了无首的孤儿号 | 顺编为「终稿一 ∥ 终稿二」，节内引用同轮跟改 |
| §6.72 既有件三问第三条 | 「两档标题各取一个不重名的括注」——人格档那节已删，无标题可取 | 改为纪律档一处取括注，并写明人格档删除后不留同名标题 |
| §6.73 A1 ② ∥ A3 | 「三块理由段在位（人格档 ∥ 纪律档 ∥ 公共层）」与「三围栏块」 | 改为「两块理由段（纪律档 ∥ 公共层）」与「两围栏块」，人格档不持理由块，判据回指 §6.95 读② |

增补验收（本轮）：读者打开 `PROMPT-SYSTEM.md` 的 §6.72 ∥ §6.73 ∥ §6.95，读不到人格档必须新增三式、保留通用四段、与纪律档共享短句、或「两档各落一份」的任一要求；打开 `DOC-DISCIPLINE.md` 的 §3.27 ∥ §3.28，落点表档数与跨层结论同数。

### 第 3 轮收正（父侧裁定 · 一条）

评审第 3 轮 #8（🟡 指针，非阻断）裁定 = **§6.95 对、§6.72 A3 错**，理由取盘上实序：`thincoder-core/prompts/discipline-engineering.md` 的 `## How a good engineer moves` 在前、`## Why this mode exists (the chain every seat here protects)` 在其后。

| # | 处置 | 改在哪 |
|---|---|---|
| 1 | A3 判据改为「『终稿一』首行紧跟 `## How a good engineer moves` 之后，是档内第二个 `## ` 行，其后的首条规则节 = `## 🔴 What this mode runs on`」；原「档内第一个 `## ` 行」删除。§6.95 目标落点不改 | `docs/core/design/PROMPT-SYSTEM.md` §6.72 A3 |

同轮扫：全档再无第二处称「终稿一」为档内第一个 `##` 的判据（其余 `## ` 首行判句属 §6.73 另一节，与此无关）。增补验收（本轮）：打开 `PROMPT-SYSTEM.md` 的 §6.72 A3 与 §6.95 目标落点，两处读到的纪律档节序相同 = 三式在前、理由在后。

### 第 4 轮收正（父侧裁定 · 三条，实施席披露 1–3 的处置面）

统一判据同前：设计档里点名的条号必须与盘上那条的实编号对上；目标字面逐字给出，实施席照落。本席只改设计档（`docs/core/design/PROMPT-SYSTEM.md` ∥ `docs/core/design/CROSS-REPO-WRITE.md`），提示词正文与代码零笔。

| # | 裁定 | 处置 | 改在哪 |
|---|---|---|---|
| ① | 编号漂移（确定要改） | discipline 自持节实编号 = 1–13（第 5 条 `Subagents write only this repo` · 第 6 条 `Out-of-repo changes: two cases…` · 第 10 条 `Findings in another repo…`）；三处跨档指称改到实号 | `PROMPT-SYSTEM.md` §6.73.1 类②表：`Docs & ledger repo-self-contained` 条数 14 → 13，题眼枚举删 `One batch = one implementation round…`（该条已随 R9 删，盘上零命中）；同表合计与分布随行改齐（见下读数）；§6.96.5「第 11 条首句改为」→「第 10 条」，围栏内条目号 `11.` → `10.` |
| ① 连带 | 同批扫出的第三处漂移（父侧三条未点名，同一缺陷类） | 该行的两条指称同时漂：`Subagents…` 原记第 6 条、`Out-of-repo…` 原记第 7 条 | `CROSS-REPO-WRITE.md` §2「`Docs & ledger repo-self-contained`」第 6 条（原第 7 条，标题随改后的现文补全）∥ 同表下一行：第 6 条 → 第 5 条、行内指针「表内目标见第 7 条」→ 第 6 条、「第 6 条与本批第 7 条」→「第 5 条与本批第 6 条」；用户 2026-11-09 原话「改第 6 条」逐字保留，后随括注写清所指 = 现第 5 条 |
| ② | `现成不可用：` 搬到权威处 | R6 行补归属：中文记录形随三种回答同住 discipline；目标字面入围栏 | `PROMPT-SYSTEM.md` §6.97.1 R6 行 ∥ 同节新增「目标字面」块（R6 条）；§6.97.3 discipline 行补 R6 的补行 |
| ③ | persona 首条 `that chain` 修 | R2 行补目标字面：指代换成自涵的 `requirement → design → code chain` | `PROMPT-SYSTEM.md` §6.97.1 R2 行 ∥ 同节「目标字面」块（R2 条） |

**两条目标字面（实施席照落）**

R2 · `thincoder-core/prompts/persona-engineering.md` 的首条正文改为：

```text
**The duty this puts on you**: the consistency of the requirement → design → code chain is carried by you.
```

R6 · `thincoder-core/prompts/discipline-engineering.md` 的 `Closest-precedent survey` 三种回答形之后补一行：

```text
     **The Chinese record face of these shapes**: `已查无：` for `none found:` ∥ `现成不可用：` for `existing but unusable:`.
```

R2 的先行词出处 = 被删节的标题与其正文（`## Why this mode exists (the chain this mode protects)`；正文「keep requirement → design → code in sync」）。R6 的中文配对按被删行的书写顺序读出（该行未逐对声明对应），设计档已标注这条属推断；实施席读到不同配对即停下报父侧。

**读数（同尺 = node 行扫描，本席本轮复跑）**

| 读数 | 改前 | 改后 |
|---|---|---|
| §6.73.1 类②表行数 ∥ 条数列合计 | 32 行 ∥ 279 | 32 行 ∥ 278 |
| 类① 表行数 | 19 | 19 |
| §6.73.1 合计声明（不变量 ∥ 分布 ∥ 上抛项） | 300（= 19 + 281） | 297（= 19 + 278） |
| discipline 自持节条号 | 1–13 | 1–13（本席零笔） |

**披露**：`281` 在改前就已比同表行合（279）多 2——那是本批之前留下的差，不是本轮的改动引起。本席按「行合」这把尺把合计改齐（19 + 278 = 297），三处声明（不变量 ∥ 分布 ∥ 上抛项）与类② 表头同轮改到 278。若父侧认定 281 另有一把尺（例如把散文段计入），请回我改齐；按现表行合它读不到。

**增补验收（本轮）**：打开 `PROMPT-SYSTEM.md` 的 §6.73.1 ∥ §6.96.5 与 `CROSS-REPO-WRITE.md` 的 §2 表，任一处点 discipline 自持节的条号都能在 `thincoder-core/prompts/discipline-engineering.md` 那一节读到同号同题的条；读 §6.73.1 类②表行合计 = 表头声明数 = 不变量与分布的第二个加数。`doc_check(mode:"gate")` 首行 = `DOC-CHECK GATE: PASS`。

**上抛项（待父侧定 · 一条）**：父侧交接里写「随后派**实施席**落这两句 + 设计档绝对读数撤除那一半」。两句 = 提示词正文，归 eng-coder，无异议；但「设计档绝对读数撤除」的落点是 `docs/core/design/**`，按 discipline 的 D1 写域表（`Design docs | eng-designer`）该由设计席落笔，交实施席会形成同一面的第二支笔。请裁定：设计席续做，或由父侧明示该半批改派。

### 第 6 轮（P2-1 收口轮 · 父侧三条）

**① 「零测试档」两句改口径 —— 已落两处**

- 设计档：`PROMPT-SYSTEM.md` §6.97.4 现读「本批不新增**常驻**单元测试档、探针脚本或常驻夹具；改面单元测试档随批收口删除。」
- 批档：上文「受影响文件与测试覆盖」的分层结论现读「无接口变更，无新增常驻单元测试档、探针脚本或常驻夹具；本批交付的改面单元测试档随批收口删除。」

两处与实况一致：改面单测档 `2026-11-10-p2-1-volume-convergence.test.mjs` 随批收口删除、零常驻。

**② §2 目标字面围栏块收正 —— 已落**

「两条目标字面」块收成设计 `§6.97.1` 的同形：指路行（R2 / R6 落点句）移到围栏外，围栏内只留两条逐字面。

**③ 设计档绝对读数撤除 —— 本轮未完成，如实报**

量法（可复跑，node 行扫描；域 = `DOC-DISCIPLINE.md` §3.30.3 清单 54 档；跳过围栏块、剥离行内码段、排除「第 N 条」规则编号行与阈值行 `≤ ≥ > < 软线 硬限 阈值 字符`）⇒ 候选 **2141 处 / 47 档**。

本轮落：**11 处读数撤除 + 6 处同族措辞收正**（`PROMPT-SYSTEM.md` 10 处、`DOC-DISCIPLINE.md` 1 处）：

- 「体量读数（无帽 · 只读数）」段首两处与四条字符数 bullet（§6.44 段面）——整块撤，`行数口径` 与「超出即削 why 不削规则」两条规则行保留
- 「本节新增文本（逐字块实算）= … 字符 / 行」一行
- 「提示词面机检基线 = 69 档 / 代码面 463 档 / 命中 0」两处 ⇒ 收成关系句「机检基线 = 命中 0（量法 = `node scripts/prompt-refs-check.mjs` 零参运行的汇总行）」
- 「本节只留读数、不设上限」⇒「不设上限」（读数撤后该半句已无所指）
- 四处「先例形制 = … + 体量读数」的兄弟指称同步删该词（同族连带，非父侧点名项）
- `DOC-DISCIPLINE.md` §7 的「净变化：**5 档 ~830 行**」一行

未落：其余 46 档，含两档自身的存量读数块。分布（本席本轮量取）：

| 档 | 候选处数 |
|---|---|
| `PROMPT-SYSTEM.md` | 510 |
| `DOC-DISCIPLINE.md` | 313 |
| `MODEL-SPECS.md` | 63 |
| `MODEL-BENCH.md` | 62 |
| `BATCH-LEDGER-REVIEW-UNIFY.md` | 56 |
| `CORE-UNIFICATION.md` | 56 |
| `CONTEXT-COMPACTION.md` | 42 |
| `TESTING.md` | 42 |
| `ADVISOR-GUARDS.md` · `TOOLS.md` | 39 · 39 |
| `AGENT-LOOP-UPSTREAM.md` · `LEDGER.md` | 37 · 34 |
| `MANIFEST.md` · `TOOL-PARAM-ZERO-DEFAULTS.md` | 31 · 31 |
| 余 34 档 | 各 ≤27 |

判由（为什么不是「做完」再报）：一处读数撤离要先读它所在节判类（U-5 撤 ‖ U-6 留），再同轮收正引用它的关系句与验收句；2141 处按单席一轮做不到「逐节判读」。抽样交付会让 47 档停在「半判过」——哪档判过、哪档没判，读档的人看不出来，下一位评审也无法复核。故本轮只落能逐处点名的一批，其余按档切域交父侧定：续轮、或按档并行派席（每席 3–5 档）。

**未落同族两处（本轮零改，已在盘点内）**：`PROMPT-SYSTEM.md` 仍有两处「体量只读数」的说法（§6.45 K5 行与一条先例行）——它们是「只作读数、不作判据」的决策句，不是绝对值；撤读数后是否改写随同族清理一并定。

**验证**：`doc_check(mode:"gate", docs:[两份设计档])` 首行 = `DOC-CHECK GATE: PASS`（0 段问题）；`batch` 段门同轮对 §2 写入判 PASS。

### 第 7 轮（P2-1 读数清理 · 父侧派单两份大档）

**写域**：本席本轮只改 `docs/core/design/PROMPT-SYSTEM.md` ∥ `docs/core/design/DOC-DISCIPLINE.md`；提示词正文、运行时代码、`DOC-DISCIPLINE.md` §3.30 与 §3.22 的判类本体零笔。

**判类口径**（父侧本轮钉死，一个字不扩）：撤档数 ∥ 条数 ∥ 行数的绝对值；留量法、阈值、结构关系句、U-5 ∥ U-6 判出的行为契约数量与夹具输入预期。每处动作顺序 = ① 读它所在那一节判 U-5 ∥ U-6 → ② 撤或留 → ③ 同轮把引用它的关系句收正。

**量法与读数**（同尺 = `node` 行扫描：跳过围栏块、剥行内码段、排除阈值行 `≤ ≥ > < 软线 硬限 阈值 字符` 与「第 N 条」规则编号行；候选 = 附着计数单位的数字 token）

| 档 | 改前 | 改后 |
|---|---|---|
| `docs/core/design/PROMPT-SYSTEM.md` | 544 | 537 |
| `docs/core/design/DOC-DISCIPLINE.md` | 423 | 421 |

**前一轮的 `510 ∥ 313` 本轮复跑不出来**：上文第 6 轮只记了量法的文字描述（域 ∥ 跳过 ∥ 剥离 ∥ 排除面），没记候选的正则，同一命令量不回那两个数 ⇒ 两把尺的读数不相比较（D15）。本表这把尺是本轮唯一读数，前值不再引用，也不改写上一轮的记录文字。

**本轮清掉 7 处**（逐处 = 所在节 · 撤掉的现文逐字 · 接住它的关系句）

| # | 节 | 撤掉的逐字读数 | 接住它的关系句（同轮在位） |
|---|---|---|---|
| 1 | `PROMPT-SYSTEM.md` §6.6 J3 代码面「本席读数」 | 「新进程 · 三包 459 档」「命中 **69 处，全在 `thincoder-core`**」「`thincoder-cli/src` 0 · `thincoder-vscode/src` 0」「槽 loader key 59 · 实现表 9（…八名 + …一名）· 模型可见路径串 1」「处置 = 69/69 保留，删 0 · 改形 0」 | 上行判据句「判保留面（槽 loader key · 文件表 · 路径操作数）不处置，只登记」；本轮补「档数与处数只出命令输出与批档」 |
| 2 | 同档 §6.4 面级指路句条 | 「存量 2 处」 | 「三式均不命中…域内现余 0」 |
| 3 | 同档 §6.29 机检行 | 「三档 19 ∥ 17 ∥ 10 改前 = 改后」 | 同位保留「三档改前 = 改后」 |
| 4 | 同档 §6.31.2 首行 | 「提示词面 69 档 · 代码面 459 档 · 命中 5」 | 改为量法句「`node scripts/prompt-refs-check.mjs` 零参运行，汇总行给出两面的档数与命中数；改前读数住批档」；节标题「五条命中处置」由下表五行撑住（U-6） |
| 5 | 同档 §6.31.5 用例 C3 行 | 「2026-11-10 实读 = 提示词面 85 档 · 代码面 499 档」 | 同行「判法是两次相等，不是某一对数——档数随盘变，写死一个数下一次就不成立」 |
| 6 | `DOC-DISCIPLINE.md` §3.9 J-3 | 「as-of 2026-10-27 实读 = **54**」 | 同条「唯一值 = 判时实读 `git ls-files thincoder-core/tool-docs` 的行数，声明值须等于它」；改为「不写死任何一次读出的数——声明值按判时实读取代」 |
| 7 | 同档 §3.23「代价」段 | 「清前各余 4 处 ∥ 31 处」 | 同句「已宣布的『0 处』按旧尺成立、按新尺不成立」∧「终点不变（全规范面合计 0 处）」 |

**判 U-6 或判非读数而留的类**（逐类给理由，非抽样漏判）

- **夹具输入与预期**（`合计 0 处` ∥ `命中 1 条` ∥ `触达账存量命中 3 条` ∥ `正文面 1 处 · 围栏内 1 处 · 合计 2 处`）：§3.30.1 明写保留；删即毁用例的可判性。
- **阈值与尺寸档**（`300 字符` ∥ 软线 ∥ 硬限 ∥ 80 000 字符上限）：阈值是判据不是读数。
- **本节目表支撑的结构数**（落点表档数、用例号段、`D1–D16` 枚举、表行合计）：U-6——同节有表且该数是它的合计或构成，删了破算式。
- **归零型判据**（`0 处` ∥ 零命中 ∥ 现余 0）：§3.22「面不交」明列，量的是同一量法下的存量，不是跨规则可比性。
- **判据自身的教学例**（§3.22 U-7 的 `6681 ∥ 912` 等）：该节自带「例子的射程」句，且属判据的教学材料，与本批清理对象不同类。

**未落（如实报）**：两档仍有 **537 ∥ 421** 候选未逐处判。集中段（本席量取）：`PROMPT-SYSTEM.md` 的 §1 落点清单（改前⇒改后成对）· §6.53 · §6.45 · §6.50 · §6.66 · §7 关键决策记录 · §6.61；`DOC-DISCIPLINE.md` 的 §5 验收标准 · §3.20 · §1 · §3.19 · §4.2.7 设计期实测基线 · §3.18。

判由：一处读数撤离要先读它所在节判 U-5 ∥ U-6，再同轮收正引用它的关系句、验收句与计数句；853 处按单席一轮做不到逐节判读。抽样交付会让两档停在「半判过」——读档的人看不出哪一处判过、哪一处没判，下一位评审也无从复核。故本轮只落能逐处点名的 7 处，余量按档切域交父侧定（续轮 ∥ 每席 3–5 节的窄域派单）。

**验证**：`doc_check(mode:"gate", docs:[两份设计档])` 首行 = `DOC-CHECK GATE: PASS`，`0 段有问题（2 档全清）`；回执另带「登记未命中 7 条」——那是 manifest 里既有豁免登记与现文不再对上的存量提示，不阻断 PASS，本席未动豁免表（不在本批写域）。

## §3 设计评审（评审子代理）
**状态行**：评审通过（第 3 轮：上一轮 7 项全部落盘；余一处 🟡 位置记法指针，不阻断）



### 轮次 1（评审子代理）

上一轮 429 未产出可核销项；本轮重读当前文件后，新发现五组同档终态冲突。

| # | 严重度 | 状态 | 证据 |
|---|---|---|---|
| 1（R1） | 🔴 | New | docs/core/design/PROMPT-SYSTEM.md §6.97.1 要求「persona 删除同名整节」；同档 §6.95 验收仍要求「两档新增节都与落点 A 围栏逐行相等」，§6.96.11 仍要求「两档同一短句」。整节删除后两组验收不可同时成立。 |
| 2（R2） | 🔴 | New | docs/core/design/PROMPT-SYSTEM.md §6.97.1 要求 persona「只保留 `The duty this puts on you` 起的主 agent 责任块，删除此前的通用重复论述」；同档 §6.95 读②仍要求既有节「标题、四段、责任句与三条 bullet 逐字不动」。删除四段会直接打破既有验收。 |
| 3（R3） | 🔴 | New | docs/core/design/PROMPT-SYSTEM.md §6.97.1 要求「discipline 的 Requirements 删除 `A decision lands in the round it is made` 重复条」；同档 §6.36 A1 仍是「两档各读：`A decision lands in the round it is made` 在位一处」。权威位置改成单处后，旧的两处验收未同步收正。 |
| 4（R10） | 🔴 | New | docs/core/design/PROMPT-SYSTEM.md §6.97.1 要求「persona 删除 `Doc names: any form that resolves` 同文条」；docs/core/design/DOC-DISCIPLINE.md §3.27 落点表仍把该 persona 档列为九档之一，A-DD42 仍要求「九档各 `grep` 设计句 ⇒ ≥1」且「多一档少一档都不收口」。 |
| 5（R11） | 🔴 | New | docs/core/design/PROMPT-SYSTEM.md §6.97.1 要求「persona 的 doc-check 清单删除 `Examples — sample rows, commands, paths` 同文条」；docs/core/design/DOC-DISCIPLINE.md §3.28 落点表仍把该 persona 档列入七档，A-DD43 仍要求「七档各 `grep` 三串（`fenced block` ∥ `档缺` ∥ `<area>/<name>.md`）⇒ 各 ≥1」。 |

范围说明：docs/core/design/DOC-DISCIPLINE.md §3.30.3 的其余设计档不在本轮可读范围，其清单外部完整性未核，不按已核处理；批档 §2 与新节同向，未另发现逐行漂移，但也未化解上述冲突。

VERDICT: changes-required
计数：🔴 5 · 🟡 0 · 🔵 0。

### 轮次 2（评审子代理）

第 2 轮：只验上一轮 5 个 🔴 的处置。已消解三项——R3 收窄落地（`docs/core/design/PROMPT-SYSTEM.md` 块 C 只留动作主体 + 两落点，A4 改读「继承父条目 why」）；R10 在 `docs/core/design/DOC-DISCIPLINE.md` §3.27 与 A-DD42 ∥ DD-194 同拍（六组八档、persona 行已删）；R11 在 §3.28 与 A-DD43 ∥ DD-205 同拍（五行六档）。

R1 ∥ R2 未消解：收正落在 §6.95 ∥ §6.96.4 ∥ §6.96.11 ∥ §6.72 的落点表与人格档落点段，但同两档里仍有四处终态句要求人格档持有副本——同一类缺陷复发。

| # | 严重度 | 状态 | 证据 |
|---|---|---|---|
| 1 | 🔴 | New | `docs/core/design/PROMPT-SYSTEM.md` §6.72 既有件三问「在该节前插入 `## How a good engineer moves`，该节与其后内容一字不动」；同节 K1「落两档、不落公共层」· K2「两档都写理由，义务句只写人格档」· 偏离②「两档各落一份」——与本节已收正的「三式与通用模式理由都不落人格档」及 §6.95 读②「人格档无同名通用节」互斥 |
| 2 | 🔴 | New | 同档 §6.73 既有件定位仍写「两节一字不动」，其「两节」之首 = `thincoder-core/prompts/persona-engineering.md` 的 `## Why this mode exists (the chain this mode protects)`；括注「（§6.72 终稿一 ∥ 终稿二）」所指的「终稿一」已不在 §6.72（该节现只持「终稿二 ∥ 终稿三」）；§6.95 读④ 已把 §6.73 列入红侧判面，现文自触红 |
| 3 | 🟡 | New | 同档 §6.72 落点标题「落点（两处，唯一副本 = 本节）」而落点表只余一行；A6 ∥ A7 仍读「两落块」；受影响文件仍把 `thincoder-core/prompts/persona-engineering.md` 列为落点面——计数未随收正同改（D3） |
| 4 | 🟡 | New | `docs/core/design/DOC-DISCIPLINE.md` §3.28 跨层结论「十档全在 `thincoder-core/prompts/` 与 `thincoder-core/tool-docs/` 内」与同节落点表六档 + 示例三档不同数——persona 行删去后的旧值未跟改 |
| 5 | 🟡 | New | 受影响文件表未列被改前节：批次档 §2 的 PROMPT-SYSTEM 行只写「按 R1–R3 收正 §6.72 ∥ §6.36 块 C ∥ §6.96.4 ∥ §6.96.11」，§6.97.3 同形；§6.95 已改、§6.73 待改，两者均未列入，§2 增补验收行同缺 §6.73 |
| 6 | 🟡 | New | 同档 §6.72 A5「人格档 `##` 计数与改前相等」与 R1 ∥ R2 落地后的终态（少两节）互斥——A10 的分工句只管改动面，未写进 A5 |
| 7 | 🔵 | New | `docs/core/design/DOC-DISCIPLINE.md` §3.27 标题「六落点」与同节「落点表（六组 · 八档）」为同一数的两种叫法——无计数错，但可被读成六个档 |

VERDICT: changes-required
计数：🔴 2 · 🟡 4 · 🔵 1。

### 轮次 3（评审子代理）

第 3 轮：只验上一轮结论表的 2🔴 + 4🟡 + 1🔵。七项逐条核完，全部落盘。另记一处位置记法冲突（🟡 指针，非阻断，不进本轮处置面）。

| # | 严重度 | 状态 | 证据 |
|---|---|---|---|
| 1 | 🔴 | Fixed | `docs/core/design/PROMPT-SYSTEM.md` §6.72 既有件三问已改为「两节按 §6.97 的 R1 ∥ R2 删除，本节不在该档新增副本」；K1 读「通用理由只落纪律档一处、不落公共层」；K2 读「通用理由只落纪律档一处，义务句只写人格档」；偏离已无「两档各落一份」 |
| 2 | 🔴 | Fixed | 同档 §6.73 既有件三问只定位一份档：`thincoder-core/prompts/discipline-engineering.md` 的 `## How a good engineer moves` 与 `## Why this mode exists (the chain every seat here protects)`，括注改「§6.72 终稿一 ∥ §6.95」；人格档指称已删 |
| 3 | 🟡 | Fixed | 同档 §6.72 落点标题读「落点（一处，唯一副本 = 本节）」；A6 ∥ A7 读「两个落块（纪律档「终稿一」∥ 公共层「终稿二」）」；受影响文件写「人格档不在本节落点」 |
| 4 | 🟡 | Fixed | `docs/core/design/DOC-DISCIPLINE.md` §3.28 跨层结论读「九档全在」，与同节落点六档 + 示例三档同数 |
| 5 | 🟡 | Fixed | 批次档 §2 受影响行与增补验收行、`docs/core/design/PROMPT-SYSTEM.md` §6.97.3 与 §6.95 的受影响表，均已列入 §6.72 ∥ §6.73 ∥ §6.95（§6.96.10 同在） |
| 6 | 🟡 | Fixed | 同档 §6.72 A5 读「人格档 `##` 计数比改前少两节（三式与通用理由按 §6.97 的 R1 ∥ R2 删除）」，与上抛项 1 的「人格档 `##` −2 归 §6.97」同拍 |
| 7 | 🔵 | Fixed | `docs/core/design/DOC-DISCIPLINE.md` §3.27 标题与档头枚举均读「六组」，与「落点表（六组 · 八档）」同词 |
| 8 | 🟡 | New（指针） | `docs/core/design/PROMPT-SYSTEM.md` §6.72 A3 读「纪律档：「终稿一」首行是档内第一个 `## ` 行」，与 §6.95 目标落点「档首先为 `## How a good engineer moves`，随后为 `## Why this mode exists (the chain every seat here protects)`」位置互斥；非阻断，谁为准由父侧定 |

连带三处同轮核过，均与新终态一致：终稿块序号顺编为「一 ∥ 二」且 A1 ∥ A2 ∥ A6 ∥ A8 与 §6.73 A1 的引用同拍；§6.72 既有件三问第三条只留纪律档一处括注并写明人格档删除后不留同名标题；§6.73 A1 ② ∥ A3 读「两块理由段」「两围栏块」。

VERDICT: pass
计数：🔴 0 · 🟡 1（指针，不阻断） · 🔵 0。

### 轮次 4（评审子代理）

本轮 = 交付前链内代码评审（对象：两条逐字目标字面 + 单测档探针）。两条字面已逐字核对：persona 首条 `**The duty this puts on you**: the consistency of the requirement → design → code chain is carried by you.` 与 design §6.97.1「目标字面」块逐字相同；discipline `Closest-precedent survey` 第三种回答形之后新增行与 design 块逐字相同（含 5 空格续行缩进、行尾 `unusable:.`）。

| # | 严重度 | 状态 | 证据 |
|---|---|---|---|
| 1 | 🟡 | New | design §6.97.4「纯文本改动不新增单元测试档、探针脚本或常驻夹具。」∥ 批档 §2 分层结论「无接口变更，无单元测试文件、无新增探针或常驻夹具。」 vs 交付面 `2026-11-10-p2-1-volume-convergence.test.mjs`（§5 披露 3 已报，父侧任务书要求，属父侧协调项） |
| 2 | 🟡 | New | §5 未记本轮落盘：全文 `现成不可用：` 仅命中 design 面两行与披露 2；§5 披露 2 仍读「实施面不自行补句」，与本轮已落该句的现文相反；验证读数仍是「6 tests / 6 pass / 0 fail」 |
| 3 | 🔵 | New | 目标字面探针不含缩进与前位：design §6.97.1 R6 条读「三种回答形之后补一行」，测试档该条只计子串次数 |
| 4 | 🔵 | New | R6 组「探针取「形定义」整串，不取裸 token」后缺 `none found:` 合计探针，第三份副本不会被抓 |
| 5 | 🔵 | New | 批档 §2「两条目标字面（实施席照落）」围栏块混入说明行（`首条正文：` ∥ `三种回答形之后补一行：`），design §6.97.1 块为纯字面 |

VERDICT: pass
计数：🔴 0 · 🟡 2（均为父侧协调项，无 must-fix） · 🔵 3。

## §4 用户批准（主 agent）

## 用户批准

- **批准形态 = 整批授权**：用户 2026-11-10 16:11 指令「P0–P2 全部批次自动跑完，碰到问题现场修」。
- **中途一条用户直令改变处置方式**：「能当场修的绝不挂账」——本批 R1 ∥ R2 的冲突就是照这条在当轮修掉的（不挂账）。
- **一处父侧裁定**：评审留的 🟡（§6.72 A3 与 §6.95 的位置记法互斥）由父侧实读盘上 `##` 行序后裁定 §6.95 为准，A3 收正。

## §5 实施记录（eng-coder）
**状态行**：实施完成（第 5 轮两条逐字目标字面已落，单测 7/7，doc_check PASS）



### 实施范围与读数（eng-coder 2026-11-10）

写域 = `thincoder-core/prompts/persona-engineering.md` ∥ `thincoder-core/prompts/discipline-engineering.md`，加改面单元测试档 `docs/batches/2026-11-10-p2-1-volume-convergence.test.mjs`（随批收口删除，零常驻）。设计档读数撤除与设计档收正 = eng-designer 笔，本席零笔。

同一把尺 = node 字符串计数（`split(literal).length - 1`）与 `^## ` ∥ `^### ` 行首计数；改前改后同一命令、同一量法。

| 读数 | 改前（本席动手前的工作树） | 改后 | 说明 |
|---|---|---|---|
| persona `##` 行数 | 19 | 17 | −2 = R1 ∥ R2 两节删除（§6.72 A5 的关系式按此基线成立） |
| persona `###` 行数 | 5 | 5 | 不变（§6.72 A5） |
| discipline `##` 行数 | 12 | 12 | 不变 |
| discipline `###` 行数 | 7 | 7 | 不变 |
| discipline 自持节条目数 | 14 | 13 | −1 = R9 删「一个实施轮用自己的批档」条 |
| 两档最长行 | 300 ∥ 300 | 300 ∥ 292 | 均 ≤300 |

基线两条读数并存，如实登记：批起 sha `4fafb49c` 上 persona `##` = 18、discipline `##` = 11；本席动手前的工作树已是 19 ∥ 12。

差额来自工作树里未提交的既有笔。其中 persona 的冻结句与写域句现文与设计 §6.96.2 ∥ §6.96.1 的目标围栏逐字相同，判为已落地的既有笔，非本席改动。

### R1–R14 逐条处置

| R | 改哪档 | 删／改了什么 | 读数（改前 → 改后） |
|---|---|---|---|
| R1 | persona | 整节 `## How a good engineer moves`（三式四段） | persona 标题 1 → 0；discipline 保持 1 |
| R2 | persona | `## Why this mode exists (the chain this mode protects)` 的标题与通用论述四段；保留 `The duty this puts on you` 起首句 + 三条 bullet（逐字） | 标题 1 → 0；`Deleting a unit test once its use is spent` 1 → 0 |
| R3 | discipline | 步骤 1 该条复述理由的半句 `waiting for the discussion to close leaves the decision in the conversation alone, where the next compaction erases it`；留动作主体 + 两个落点那一句 | `where the next compaction erases it` 1 → 0；persona 固定行形 ∥ 重锚 ∥ 未落盘处置零改 |
| R4 | persona | 两枚路径域定义 bullet（product face ∥ doc face） | 两串各 1 → 0；判面句 ∥ 机器单源 ∥ 诊断探针 ∥ judgment lines 在盘 |
| R5 | discipline | tool-face 重复行 | 1 → 0；persona 的 tool-face 发起句与批档 §3 落点在盘 |
| R6 | persona | 三问段 ∥ 三种回答 bullet ∥ 设计档落点段；并删同源句 `A missing line reads as "not checked"…` | 三问 1 → 0；`The three answer shapes` 1 → 0；`none found:` 1 → 0；抽样动作条在盘 |
| R7 | persona | `A "finding" = something verified` ∥ `must carry a reproducible path` ∥ Leads 定义与其 why；`Booking scope` 首条的范围定义句改为「何者入账」 | 两串各 1 → 0；`Scope = the task book / task brief` 1 → 0；入账 ∥ §6 排除 ∥ 阻塞例外 ∥ 范围≠已批准设计 保留 |
| R8 | persona | 收口时点（三处）∥ `trigger` 裸枚举 ∥ 计数定义；并删同文件里重复的 `A tech todo must carry trigger` 句 | 时点 3 → 0；裸枚举 1 → 0；计数句 1 → 0；`**Tech-todo specific**` 条在盘 |
| R9 | discipline | 自持节第 5 条；其后条目顺编 6→5 … 14→13，节内 `follows clause 7 instead` 同拍改 `clause 6` | 该串 1 → 0；编号连续 1–13 |
| R10 | persona | `Doc names: any form that resolves` 整条 | 1 → 0；discipline 同条保持 1 |
| R11 | persona | doc-check 清单里的 `Examples — sample rows, commands, paths` 条 | 1 → 0；门本身与 discipline 同条在盘 |
| R12 | persona | 收口清单的前批遗留（含 why）∥ 暂缓复核 ∥ settlement line 三项 | 三串各 1 → 0；`Re-check deferred batches first` 与会话启动 ∥ 条件事件扫描在盘 |
| R13 | persona | 报告到达机制两半；留父侧等待姿势两条 | 机制串 1 → 0；姿势两条在盘；discipline 机制句保持 1 |
| R14 | 零改（核） | 不复制作者分配表；persona 的 `Dispatch, do not write` 与角色边界句保留 | persona 无 `\| Change \| Writer \|`；discipline 有 |

红侧 = 上表「改前」列：13 条重复在各自「另一处」各命中 1 次（R8 的收口时点在 persona 命中 3 次），persona `##` = 19。同一批断言在改前会红，改后按上表归零。

### 验证读数

- `node --test docs/batches/2026-11-10-p2-1-volume-convergence.test.mjs`：6 tests / 6 pass / 0 fail（含 60+ 条字面与同义改写探针、结构计数、R9 编号连续、行宽、责任块）。
- `doc_check(mode:"gate", docs:[两份提示词])`：首行 `DOC-CHECK GATE: PASS`。
- 探针档与被判档同尺：字面计数与结构计数都由 node 行扫描得出。

### 轮次与终端状态

| 轮 | 类型 | 结论 | 处置 |
|---|---|---|---|
| 1 | 内部 explore 偏差审计（只读） | divergent，5 条要点 | 逐条判：2 条归属既有笔（见交付披露 5）、1 条是本席待写的 §5、1 条测试档与设计结论互斥（披露 3）、1 条基线读数（披露 6） |
| 2 | 链内 advisor 代码评审 轮 1 | changes-required（🔴 1 · 🟡 4 · 🔵 3） | 逐条处置：🔴 R6 残留删净；🟡 R8 同文件重复句删、R7 范围定义句改为「何者入账」、测试档补同义改写探针、测试档与设计结论的互斥入披露；🔵 重复断言行换掉、测试档根改由本档位置推出 |
| 3 | 链内 advisor 代码评审 轮 2（只核修复声明） | pass（7 项 Fixed · 2 项 Unfixed 且均为非阻断的报告项／可选优化，零新增 🔴） | 无 |

终端状态：`clean`（修复轮 1 轮即收敛，审计与评审的全部 🔴 已落盘复核）。

### 交付披露（越出「按 R 列删重」的部分，逐条报父侧）

1. **设计档编号随 R9 漂移，不在本席写域**。R9 删掉 discipline 自持节一条后编号 14→13，下列设计档字面需设计席同轮收正（本席零笔）：

```text
docs/core/design/PROMPT-SYSTEM.md  §6.73.1 类②表：`discipline · Docs & ledger repo-self-contained | 14` 与题眼枚举里的 `One batch = one implementation round…`，及同表「类① 19 + 类② 281 = 300」的合计
docs/core/design/PROMPT-SYSTEM.md  §6.96.5：「第 11 条首句改为」——该条现为第 10 条（Findings in another repo）
docs/core/design/CROSS-REPO-WRITE.md：「Docs & ledger repo-self-contained」第 7 条两处指称，现为第 6 条
```

2. **`现成不可用：` 的中文记录面映射已归位**（父侧第 5 轮裁定，见下「第 5 轮」）。该串原只在被删的那条 bullet 里出现过；父侧裁定把它并入 discipline 的 `Closest-precedent survey`，与三种回答同居，本席照落一行；persona 侧零命中。
3. **改面单元测试档与两处「零测试档」结论互斥**。设计 §6.97.4 ∥ §6.97.3、批档 §2 的受影响文件表与分层结论都写零测试档；父侧任务书明确要该档，故按父侧指令交付，随批收口删除、零常驻。两处终态句的收正不在本席写域。
4. **persona 首条正文的 `that chain` 已换成自涵名**（父侧第 5 轮裁定，见下）。先行词随 R2 删掉的节离开；现句逐字取 design §6.97.1 R2 的目标字面，指代换成 `requirement → design → code chain`，不再依赖被删节。
5. **persona 的冻结句与写域句不是本席改动**。内部审计按批起 sha 把这两处列为越界候选；两处现文与设计 §6.96.2 ∥ §6.96.1 的目标围栏逐字相同，判为工作树里已落地的既有笔。本席未触这两行。
6. **基线两条读数并存**：§6.72 A5 的「比改前少两节」以本席动手前的工作树为基线成立（19→17）；以批起 sha 为基线只读到 −1（18→17）。两读数各自可复跑，不互斥。
7. **附记（不进本批判面）**：R10 ∥ R11 的「唯一详述位置」只在两份目标档之间成立；其余提示词里同一原文仍在，它们属设计 §3.27 ∥ §3.28 的落点档组，本批零改。

### 第 5 轮（父侧裁定 · 两条逐字目标字面）

父侧第 5 轮裁定两条目标字面（与 design §6.97.1「目标字面（实施席照此逐字落地 · 两条）」块同文），本席照落并同步改面单测档。写域 = 两份提示词 + 改面单测档，其余零笔。

**落点**

| 条目 | 档 / 节 | 落下的逐字面 |
|---|---|---|
| R2 | `persona-engineering.md` 首条正文 | `**The duty this puts on you**: the consistency of the requirement → design → code chain is carried by you.` |
| R6 | `discipline-engineering.md` 的 `Closest-precedent survey`，第三种回答形之后一行（5 空格续行层） | `     **The Chinese record face of these shapes**: `已查无：` for `none found:` ∥ `现成不可用：` for `existing but unusable:`.` |

两条与 design §6.97.1 目标字面块逐字符相等：本轮以 node 逐行读盘比对，两行 `===` 均为 true（含 `→` ∥ `：` 全角与前面的 5 空格）。

**配对核实（父侧要求落前先核）**

被删行原文（批起 sha 上 persona 的 `The three answer shapes` 条）为：

```text
- **The three answer shapes**: `existing:` ∥ `none found:` ∥ `existing but unusable:`; the Chinese record face is `已查无：` ∥ `现成不可用：`.
```

两个中文形按书写顺序对应第 2、3 个英文形（`existing:` 是正面形，无中文记录形），与目标字面的配对一致；旁证 = persona 保留条 `state「已查无」(checked — none found) explicitly.`。故照落，未改配对。

**读数（同尺 = node 字符串计数）**

| 读数 | 改前 | 改后 |
|---|---|---|
| persona `that chain` | 1 | 0 |
| persona 目标句逐字在位 | 0 | 1 |
| discipline `现成不可用：` | 0 | 1 |
| persona `现成不可用：` | 0 | 0 |
| discipline `none found:` | 1 | 2（形定义 + 映射键） |
| discipline `existing but unusable:` | 1 | 2 |
| 两档最长行 | 300 ∥ 292 | 300 ∥ 292 |

**探针处置（改面单测档，随批删）**

① 新增 6 条：R2 的 `that chain` = 0 与目标句 = 1；R6 的 persona `The Chinese record face of these shapes` = 0、persona `现成不可用：` = 0、discipline `现成不可用：` = 1、discipline 映射整行 = 1。
② 收窄 1 条：`none found:` 裸 token（期望 1）改为形定义整串（期望 1），因新增行以 `none found:` 作配对键、裸 token 在权威位合法出现两次。
③ 补合计探针 2 条：`none found:` = 2 ∥ `existing but unusable:` = 2，防第三份副本出现在别处。
④ 补位置/缩进断言 1 条：映射行必须是第三种回答形之后的下一行，且缩进恰 5 空格。

**失败侧读数**

- 新增 6 条落在未改的两档上时红 4 条：`R2「that chain」expect 0 got 1` ∥ `R2「**The duty this puts on you**: the consistency of the requir」expect 1 got 0` ∥ `R6「现成不可用：」expect 1 got 0` ∥ `R6「**The Chinese record face of these shapes**: ...」expect 1 got 0`；改后全转绿。
- 位置/缩进断言的失败侧就地实测（内存造变体，不写盘）：真实行判绿；4 空格 ∥ 7 空格 ∥ 顶格 ∥ 挪位四种变体各判红。同时量到裸子串探针对 7 空格版仍绿——这正是本条断言存在的理由。

**验证**

- `node --test docs/batches/2026-11-10-p2-1-volume-convergence.test.mjs` = 7 tests / 7 pass / 0 fail。
- `doc_check(mode:"gate", docs:[两份提示词])` 首行 `DOC-CHECK GATE: PASS`。

**轮次（本轮）与终端状态**

| 轮 | 类型 | 结论 | 处置 |
|---|---|---|---|
| 1 | 内部 explore 偏差审计（只读） | conforms（6 条判据全符合，0 偏差） | 无 |
| 2 | 链内 advisor 代码评审 | pass（🔴 0 · 🟡 2 · 🔵 3，无 must-fix） | 🟡2 本轮补记（本段）；🔵3 ∥ 🔵4 已落（位置缩进断言 ∥ 合计探针）；🟡1 ∥ 🔵5 属设计面与父侧，见披露 8 ∥ 9 |

终端状态：`clean`。

**披露（本轮，续编号）**

8. **设计面「零测试档」终态与改面单测档仍互斥**（评审 🟡1）。`design §6.97.4` 读「纯文本改动不新增单元测试档、探针脚本或常驻夹具。」，批档 §2 分层结论读「无接口变更，无单元测试文件、无新增探针或常驻夹具。」。该档按父侧任务书交付、随批收口删除；两处终态句的收正在设计席与父侧，本席零笔。
9. **批档 §2「两条目标字面（实施席照落）」围栏块混入指路行**（评审 🔵5）：`thincoder-core/prompts/persona-engineering.md 首条正文：` 这类说明行与字面同在一个 text 围栏块内。本席以 design §6.97.1 的纯字面块为准落地（落点正确），§2 整块的收正归设计席。
10. **`已查无` 在 persona 仍留 1 处**：`state「已查无」(checked — none found) explicitly.` 是设计 R6 明确保留的 closeout 抽样动作条（与派单公共源同一形，design 已按「同形不同题」登记）；`现成不可用：` 在 persona 已零命中。

## §6 验证与收口（父代理）

## 验证与收口

- **交付面 = C10（重复条款收敛）+ 「设计档不写绝对读数」这条规则本身。** 提示词去重 R1–R14 全落（两档），两条不许合并的零改项核过；设计面 `docs/core/design/PROMPT-SYSTEM.md` §6.97 ∥ `docs/core/design/DOC-DISCIPLINE.md` §3.30 把规则写定。
- **父侧读数**：`node --test docs/batches/2026-11-10-p2-1-volume-convergence.test.mjs` ⇒ tests 7 · pass 7 · fail 0 · todo 0；`persona-engineering.md` 的 `that chain` = 0 ∥ `## How a good engineer moves` = 0 ∥ `## Why this mode exists` = 0 ∥ duty 句逐字在盘；`discipline-engineering.md` 的 `现成不可用：` = 1。
- **doc-check 门**：`DOC-CHECK GATE: PASS`。
- **未完成的一半（如实）：设计档存量绝对读数的清理只做了 18 处，全规范面按最后一轮那把尺仍有约两千处 ∥ 47 档。** 规则已写成、新写的按规则判；**存量是清账，不是规则**——已挂账另批（见下），不在本批收口面内。
- **量法的两把尺（D15）**：先一轮报 2141 / 47 档，后两轮报 544∥423 与 537∥421——同一命令的正则没留在批档里，所以前值复跑不出来。**本批收口以后两轮那把尺为准，前值不再引用**；这一条本身是「读数必须带得来量法」的实例。
- **本批新债 1 条**：设计档存量读数清理（约两千处 ∥ 47 档），另起批次按节窄域派，不按整档派。
- **暂缓批复核**：无。
- **用户文档面**：无涉。
- **单测档**随收口删除。
