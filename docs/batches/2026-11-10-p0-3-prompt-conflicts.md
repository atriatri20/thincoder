# 2026-11-10 · p0-3-prompt-conflicts
> 六段，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 每段只有一个作者：作者的段可 `append` 加内容、可就地改（`edit`）；非作者一概拒。
> 编制：主 agent · 2026-11-10 · 来源 = 用户 2026-11-10 16:11「这些工作我认为都要做…依次做完，自动执行」；范围 = `docs/core/requirements/ENGINEERING-SYSTEM-OPTIMIZATION.md` C1–C9。
> 台账 = #2285（core · 归批）。前情 = 无（独立批）。
## §1 讨论（主 agent）
**状态行**：已收口 2026-11-10
批起 sha = 4fafb49c002e12d935989fd9a7eeb72d0d0d2c6b
<§1 模板占位：本批条目 / 关键判据 / 授权口径>

## 讨论（P0-3 提示词冲突清零）

**来源**：`docs/core/requirements/ENGINEERING-SYSTEM-OPTIMIZATION.md` C1–C9。
**目标**：九处互相矛盾的提示词表述全部统一；**不加新规则**，只裁定哪边留、哪边删。

### 九条的父侧裁定

- **C1 主 agent 写域**：定一张写域表 = 主 agent 写需求档/批档/台账/manifest；设计档归 eng-designer；提示词与代码归 eng-coder。`persona-engineering.md` §Debts 里把设计档/提示词列进主 agent 笔域的句子删除。
- **C2 批档生命周期**：定为「批档是一次性过程档，可由维护者删除；收口不自动删；规范档不得依赖它」。persona 的「not deleted」、designer 的「deleted at closeout」都改。
- **C3 提示词禁引用 vs coder 读设计档**：区分「规范内容的引用」（禁）与「执行坐标的引用」（允许，设计档是执行依据）。
- **C4 三式 vs 四步不跳**：四步是质量门与顺序；三式是每步内的动作选择。补一句「简单改动的最小四步形态」，但不得写成可跳步。
- **C5 explore 范围外观察**：统一为「范围外观察只作线索单列，不进发现、不记账、不上抛为缺陷」。
- **C6 设计档九项**：改为「按适用性裁剪，缺项写一句理由」，不再「缺一项即 incomplete」。
- **C7 fix round 记录**：过程记录只住批档；设计档只写修后的目标态与必要决策理由。persona 里「Each fix round's findings + planned changes land in the owning design doc」删除。
- **C8 被拒绝方案**：方案级否决理由住设计档决策句；试验过程与否决细节住批档。
- **C9 上游坐标**：区分「决策依据的事实」（回源）与「定位坐标」（可直接用）；坐标若成为判据依据则必须回源。

### 库内勘察

`库内 = 已查：提示词六档实测与冲突对照（调研 #2）→ thincoder-core/prompts/persona-engineering.md、discipline-engineering.md、common.md、persona-eng-coder.md、persona-eng-designer.md、persona-explore.md`
`库外 = B 类：改动面 = 本仓提示词；外部断言 = 零`

### 既有件三问

- `existing: docs/core/design/PROMPT-SYSTEM.md · name: "提示词系统" · consumers: 提示词装配与历次落点`（本批设计落点仍写它，新节编号顺延）
- `existing: docs/core/requirements/ENGINEERING-SYSTEM-OPTIMIZATION.md · name: "C1–C9" · consumers: 本批范围来源`

### 边界

本批只改提示词文本与对应设计落点；不改工具实现、不改状态机、不动其他批档。

## §2 批次任务与设计（eng-designer）
**状态行**：设计完成（C1–C9 已落 PROMPT-SYSTEM §6.96；待评审）
<§2 模板占位：本批条目（覆盖） / 设计档落点 / 机制设计 / 受影响文件与测试覆盖 / 验收对照 / 关键决策 / 上抛项>

### 本批条目（覆盖）

需求同源 = `docs/core/requirements/ENGINEERING-SYSTEM-OPTIMIZATION.md` C1–C9；目标文本、删留句与权威详述均住 `docs/core/design/PROMPT-SYSTEM.md` §6.96，本节不复制判据值。

| 条目 | 覆盖 | 设计落点 |
|---|---|---|
| C1 主 agent 写域 | 一张 D1 写域表；主 agent 不再取得设计档或提示词写权 | design §6.96.1 |
| C2 批档生命周期 | 维护者可删、收口不自动删、规范档不依赖批档 | design §6.96.2 |
| C3 引用与执行坐标 | 禁规范内容引用；允许 coder 读取设计档的执行坐标 | design §6.96.3 |
| C4 三式与四步 | 四步不跳；三式只管步内动作；补最小四步形态 | design §6.96.4 |
| C5 范围外观察 | 只进独立 `Leads`；不进 findings、不记账、不执行、不按缺陷上抛 | design §6.96.5 |
| C6 设计档九项 | 按适用性裁剪；缺项写一句理由 | design §6.96.6 |
| C7 fix 轮记录 | 过程住批档；设计档只收目标态与长期决策理由 | design §6.96.7 |
| C8 被拒绝方案 | 方案级否决理由住设计档；试验细节住批档 | design §6.96.8 |
| C9 上游坐标 | 定位可直接用；决策事实与判据依据必须回源 | design §6.96.9 |

### 不在本批

C10 重复条款收敛、工具实现、状态机、装配逻辑、需求档改写、其他批档均不在本批。边界以 design §6.96.14 为准。

### 受影响文件与测试覆盖

文件全集与分层结论见 design §6.96.10。六份提示词均在本批核对域；`persona-eng-coder.md` 只保留现有执行坐标，不作文本改动。

验收逐条回指需求 C1–C9，红侧探针、改后零命中与单一详述核法见 design §6.96.11；正常、边界、错误场景见 design §6.96.12。

纯文本改动不新增单测、探针脚本或常驻夹具；实施轮只跑本节所列改变面检查与文档门。集成测试结论见 design §6.96.14。

### 关键决策与上抛

九条关键决策及被否方案见 design §6.96.13。上抛项 = 无。

## §3 设计评审（评审子代理）
**状态行**：评审通过



### 轮次 1（评审子代理）

| # | 严重级 | 状态 | 证据 |
|---|---|---|---|
| 1 | 🟡 | 建议 · 不阻断 | `docs/core/design/PROMPT-SYSTEM.md` §6.96 引入 `Leads` 新标签，但未设「既有件三问」行；补一行以 `existing` / `none found` / `existing but unusable` 之一交代住处、逐字名与读者。 |
| 2 | 🔵 | 知会 · 不阻断 | `docs/core/design/PROMPT-SYSTEM.md` §6.96.11 的语义红侧需读者打开命中节复核；量法已同时规定探针与读者核节，保持双层验收。 |

VERDICT: pass

计数：🔴 0 · 🟡 1 · 🔵 0。九条均有明确删留与权威详述；D1 写域表唯一；C3 执行坐标可判且实施者读设计档不受禁令覆盖；C4 无跳步口；C7 逐轮过程不住长期设计档；各改前探针已实扫命中，改后可同串清零复核。

## §4 用户批准（主 agent）

### 用户批准

- **原话**：「我看了，挺好，这些工作我认为都要做，从P0-P2，都需要做，你开工吧，依次做完，自动执行」（2026-11-10 16:11）。
- **批准范围 = 评审通过的 §6.96**：C1–C9 九处冲突的删与统一；修轮仅断行与句式，不改语义。

## §5 实施记录（eng-coder）
**状态行**：实施完成（C5/C8/C9 五处修轮与验证完成）



### 修轮实施：C5 / C8 / C9 五处

仅按新围栏拆分既有一行文本，未改其他八条、设计档或其他提示词；清单外改动 = 无，设计档漂移 = 无。

| # | 改动 | 文件路径 |
|---|---|---|
| 1 | C8：过程与状态分界拆为三段 | `thincoder-core/prompts/common.md` |
| 2 | C9：定位与回源规则拆为两段 | `thincoder-core/prompts/common.md` |
| 3 | C5：总口径拆出续行 | `thincoder-core/prompts/discipline-engineering.md` |
| 4 | C5：Disposition routing 的 outside 分支独立成段 | `thincoder-core/prompts/persona-engineering.md` |
| 5 | C5：Booking scope 的范围外观察独立成段 | `thincoder-core/prompts/persona-engineering.md` |

1 → 落地原文：

```text
**Process (delete-eligible in a state doc)**: symptom · root cause · problem statement · reproduction · trial readings · experimental rejection details · change trail · superseded values.

**State (keep)**: the current rule · current value · current contract · current acceptance criterion · current boundary · decision + its one-line reason · design-level rejected alternatives and their lasting reasons.

Mechanism-body sentences, directory-ownership sentences, template / placeholder forms, and a date that is part of a rule also stay.
```

2 → 落地原文：

```text
**Take evidence only for the assertions you are about to make**: a locator supplied by the task book, parent or reviewer may be used directly to find the source; a fact that supports a decision or criterion must be read at its source.

Pre-reading unrelated code spends survey time on assertions you are not making.
```

3 → 落地原文：

```text
- **Out-of-scope observations are leads only**: anything seen outside that scope (other modules, other batches / layers / docs outside this repo, inconsistencies noticed in passing) may appear only in a separate `Leads` list.

  It is not a finding, not booked to the ledger, not acted on, and not escalated as a defect.
```

4 → 落地原文：

```text
  It is work ⇒ judge the write domain: inside ⇒ fix it on the spot, in this round — what it would take is not a reason to defer it.

  Outside ⇒ not fixed and not booked; the observation may appear only as a separate lead, not as a defect escalation — the batch that touches it corrects it then, clearing the whole file rather than leaving it to the next batch.
```

5 → 落地原文：

```text
  **Out-of-scope items are not booked and do not enter §6 unresolved items**.

  An out-of-scope observation you spot yourself (other modules, other batches / layers / docs outside this repo, inconsistencies noticed in passing) may appear only in a separate `Leads` list, never as a finding or defect escalation.
```

### 验证与评审

- 旧探针：内置 `grep(literal:true)` 在 §6.96.10 的六档域重跑 C5 一条、C8 两条、C9 两条，均无命中。
- 新句：逐节 `read` 对照 §6.96.5、§6.96.8、§6.96.9；五块均与对应围栏逐行相等，含续行与空行。
- 文档门：`doc_check(mode:"gate")` 覆盖本轮三份提示词，结果 PASS。
- 单测 / 集成：纯文本修轮不新增单测、探针脚本、常驻夹具或集成用例；未做父侧集成测试。
- 内部 explore 差异审计 = 1 轮，clean；内部 advisor 代码评审 = 1 轮，`VERDICT: pass`；修正轮 = 0；终态 = clean。
- `verify` = passed。

依据 docs/core/design/PROMPT-SYSTEM.md §6.96.11「新句的读数 = 打开目标节，与对应围栏逐行相等（含续行与空行）；不得以整段长串命中代替。」

## §6 验证与收口（父代理）

### 验证与收口（父侧）

**交付**：C1–C9 九处冲突全部落地到提示词正文；五处超长单行围栏经设计修轮改为短段后落齐。

**父侧独立复核**：

```
grep「frozen records are not migrated, not deleted」→ 零命中（C2）
grep「Out-of-scope items are not recorded」→ 工程六档零命中（仅 discipline-normal.md 仍在，属普通模式档、不在本批范围）
persona-engineering.md 写域行 = 「Write domain = the D1 write-domain table … the main agent never takes design docs or prompts into its own pen」（C1）
doc_check(mode:"gate") → PASS（3 档）
```

**实施侧读数**：内部 explore 差异审计 clean；内部 advisor 代码评审 pass；verify passed；§5 已写。

**未解决**：无。**普通模式档的同族旧句**不在本批范围，留作后续普通模式批的线索，不记账为缺陷。

**集成测试**：none——纯提示词文本，不改业务可观察断言。
