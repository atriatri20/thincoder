# 2026-10-21 · nested-sub-label
> 六段 append-only，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 编制：主 agent · 2026-10-21 · 来源 = 用户令（2026-10-21 17:43「子代理调用子代理时的那个显示问题，你好像还没搞定」）：落 2026-09-07 已批准的「块内子标」——嵌套子代理的每条活动行行首 dim 标 `explore#1 · `。
> 台账 = #1727（VSC · 归批）。前情 = docs/batches/2026-10-21-think-align-cli.md（已收口 2026-10-21）。
## §1 讨论（主 agent）
**状态行**：已收口 2026-10-22
<§1 模板占位：本批条目 / 关键判据 / 授权口径>

## 讨论记录 · 轻通道轮

**用户令（2026-10-21 17:43）**：「操，我看了一下，子代理调用子代理时的那个显示问题，你好像还没搞定啊！」

**用户是对的**：今天 `#1723` 只做了「think 不改写状态词」（标题不再被顶掉），**2026-09-07 用户批准的「块内子标」形从未实现**——`flow/block.mjs:62` 把 `sub` 只写进 `dataset.sub`（供合并判据读），**行面零渲染**，所以嵌套子代理的每条活动行没有任何身份标记。

**披露（轻通道 · 缺陷修）**：change = `appendAdvisorChunk` 在为嵌套行（`sub` 在场）渲染行首 dim 子标 `<sub> · `；reach = 共用核件（桌面 + VSC 同源）+ 两处 CSS + 五例测试；rollback = 可回退（单档三处 + 两 CSS）。

**批准形的来源（2026-09-07 用户「可以」）**

```
[▶ eng-coder#2 · glm-5.3 · running 2:15 · turn 18/100]     ← 块头不变
  模型思考/文本 …                                          ← eng-coder 自身行
  explore#1 · read — docs/design/AGENT-LOOP.md              ← 子标行（dim 色）
  explore#1 · grep — "D-E2"
  advisor · Review round 1 …
```

**改动**

| 档 | 改了什么 |
|---|---|
| `thincoder-render-core/flow/block.mjs` | 新增 `appendLineText(el, str, subLabel)`：`sub` 在场 ⇒ 行首 `span.advisor-sub`（`<sub> · ` + 正文文本节点）；无 `sub` ⇒ 维持纯文本（零变）；tool 行与 text/think 行两处接入；合并续写仍走末文本节点（子标只一份） |
| `thincoder-vscode/webview/chat.css` ∥ `thincoder-desktop/renderer/core.css` | `.advisor-sub { opacity: 0.55; margin-right: 2px; }`（dim） |
| `thincoder-vscode/test/2026-10-21-vsc-nested-sub-label.test.mjs`（新） | N1 嵌套工具行 · N2 文本/思考行 · N3 无 sub 零变 · N4 toolOutput 合并续写子标一份 · N5 两端 CSS 在场 |
| `thincoder-vscode/test/files.mjs` | 登记第 4 档 |

**走查读数（父侧实跑）**：`node test/run.mjs` ⇒ **24 pass / 0 fail**（既有 19 + 本批 5）· `check-syntax` ⇒ 143 JS files OK。

**待办（收尾链）**：设计形式化（`RENDER-CORE.md` 子块内容面 + `WEBVIEW.md` §5.5/§5.2 相关句）→ 独立评审 → 批准 → 收口。

### 1.1 第二笔（用户 17:44 澄清：指的是 think 顶标题）

**用户原话**：「我说的就是think顶标题这事儿啊！」——`#1723` 只做了「think 不改写**已有**状态词」，但**还没有状态词时**（子代理刚出生、先思考、还没调工具）走 `stateWord()` 缺省支 ⇒ 标题只剩裸 `思考中…`，嵌套子代理名照样被吃掉。这是 `#1723` 留下的缺口。

**本笔修法**（补缺，不是回退 CLI 对齐）：think 仅在 `meta.stateWord == null` 且 `m.sub` 在场时写入 `${m.sub}/${W.thinking()}`；**已有状态词时仍零改写**（CLI：工具行不被 think 顶掉）。

| 场 | 修改前 | 修改后 |
|---|---|---|
| explore 刚起、还没调工具 | `[▶ eng-coder#3 …] 思考中…`（名字丢失） | `[▶ eng-coder#3 …] explore#1/思考中…` |
| explore 已调过 read、再思考 | `explore#1/read`（`#1723` 已修） | `explore#1/read` 不变 |
| 顶层子代理思考、无工具 | `思考中…` | `思考中…`（零变） |

**落点**：`thincoder-render-core/subblocks/activity-view.mjs` `noteChunk` think 支；`2026-10-20-vsc-subagent-think-label.test.mjs` 的 T-A33 ∥ T-A38 期望同步。

**读数**：`node test/run.mjs` ⇒ **24 pass / 0 fail**。

### 1.2 第三笔（用户 18:01 截图 + 现象：闪回 ∥ advisor 不显）

**用户描述（逐字）**：「explore的时候能显示成explore#1/Thinking...，但是不知道为什么中间会穿插一下 Thinking...,但是能恢复，跑advisor的时候就完全没起作用了，还是Thinking...,没显示advisor」+ 截图（块头 `[▶ eng-coder#2 …] Thinking…`，状态条 `1 background subagent(s) running`）。

**根因（日志实读 · 非推断）**

| 现象 | 根因 | 证据 |
|---|---|---|
| 每 ~2s 闪回 `Thinking…` | 挂起期心跳**重发** `status:"started"`，而 `state.mjs` started 支**无条件**清 `stateWord` | 日志 `10:01:45/47/49/51` 连续四条 `"status":"started"`（`ev:subdeliver`）· `state.mjs:174` |
| 跑 advisor 全程只显 `Thinking…` | 子代理内顾问评审的产出以 **toolOutput** 回传（`advisor.mjs:237` `onOutput: ctx.onOutput` ⇒ `onToolOutput`），而**输出面按设计从不写状态词** ⇒ 顾问整段无状态词可显 | `advisor.mjs:237` · `noteChunk` 的 `face !== "toolOutput"` 闸 |
| 面板里完全没有 `advisor#` 频道 | 顾问内容挂在 `sub:eng-coder#2` 频道内（不是独立块），日志 60k 行内 `advisor#` = **0**（内容面未带该前缀） | 日志 grep |

**修法**

1. `state.mjs` started 支：**仅在 `block.queued` 时清**状态词（queued→running 那一次），重发心跳不清 ⇒ 闪回消失。
2. `activity-view.mjs` `noteChunk`：`face === "toolOutput" && tool === "advisor"` ⇒ 状态词写 `<sub>/advisor`（只写**名字**，不写输出文本）⇒ 顾问跑着时标题显示 `advisor#1/advisor` ∥ 顶层 `advisor`；其它 toolOutput 仍零改写。

**读数**：新测试 `2026-10-21-vsc-stateword-flicker.test.mjs`（S1 重发 started 不清 ∥ queued 迁移清 · S2 顾问 toolOutput 显名 ∥ 顶层 · S3 普通输出零改写）；`node test/run.mjs` ⇒ **27 pass / 0 fail** · `check-syntax` ⇒ 144 JS files OK。

> 不适用：§3 —— 本批是轻通道轮，无设计评审段；独立评审走的是**代码评审**（`advisor` #2 `changes-required` → 修复 → #4 `pass`），其结论已落在 §6 的复核表与遗留清单里。

## §2 批次任务与设计（eng-designer）
**状态行**：设计完成（评审 #2 设计档面四件已收正（2026-10-22），门检 PASS）
<§2 模板占位：本批条目（覆盖） / 设计档落点 / 机制设计 / 受影响文件与测试覆盖 / 验收对照 / 关键决策 / 上抛项>

## 批次任务与设计（#1727 · 轻通道轮收尾链的设计形式化）

**本笔性质**：实现已在盘且 27/27 绿（§1 三笔记录），本笔**只写规则与理由**——把四处读者可见行为形式化进设计档，供独立评审与后来者据此判对错；不抄代码。
**笔权**：设计档两档 = 本笔；需求档 / 提示词 / 产品代码 = 零触。

### 覆盖条目（四处行为 → 设计档单源）

| # | 行为（读者能据此判对错的规则） | 设计档单源 |
|---|---|---|
| 1 | **嵌套身份挂行首**：块头 = 父的身份，`sub` 在场的行行首渲 `<sub> · `；`sub` 缺席 = 父自己的行 ⇒ 纯文本；`toolOutput` 同工具同 `sub` 续写只渲一份子标 | `docs/render-core/design/RENDER-CORE.md` §2 **KD-RC-15 ①** ∥ §5 构件族「子块内容面三件」· `docs/vsc/design/WEBVIEW.md` **§5.6「行首子标」**（+ D-W44 · U-W22 · T-A41–T-A43） |
| 2 | **think 不改写已有状态词，唯一例外 = 状态词还空 ∧ 有子标**（⇒ `<sub>/<think 词>`）；顶层 think 恒零写入 | RENDER-CORE §2 **KD-RC-15 ②** · WEBVIEW **§5.2「think 不改写已有状态词」条**（+ D-W43 · U-W21 · T-A33 · T-A34 · T-A38） |
| 3 | **顾问评审进标题只写名字**：`face === "toolOutput" ∧ tool === "advisor"` ⇒ `<sub>/advisor`（顶层 `advisor`），评审正文仍只进块体 | RENDER-CORE §2 **KD-RC-15 ③** · WEBVIEW **§5.2「输出面零写入」条**（唯一例外段 + D-W43 · U-W23 · T-A44） |
| 4 | **`started` 只在 `queued → running` 清状态词**，心跳重发不清（不闪回） | RENDER-CORE §2 **KD-RC-15 ④** · WEBVIEW **§5.2 载体段「`started` 清空」条**（+ D-W45 · U-W24 · T-A45） |

**每条四件齐**：规则（档内条句）· 为什么（用户现象 + 机制理由）· 实现坐标（`file:line`）· 用例（N1–N5 ∥ S1–S3 ∥ T-A33 ∥ T-A34 ∥ T-A38 ∥ T-A41–T-A45）。

### 实现坐标（本笔引用，未改代码）

| 行为 | 坐标 | 用例 |
|---|---|---|
| 行首子标 | `thincoder-render-core/flow/block.mjs:87-94`（`appendLineText`）∥ `:63` 工具行接入 ∥ `:79` 文本/思考行接入 ∥ `:55-57` 续写合并判据（含 `dataset.sub`） | N1 N2 N3 N4 N5 |
| think 例外支 | `thincoder-render-core/subblocks/activity-view.mjs:220-228`（`:224-226` 写入条件；`:228` 零改写返回） | T-A33 T-A34 T-A38 |
| 顾问名支 | 同档 `:211-218` | S2 · T-A44 |
| `started` 幂等 | `thincoder-render-core/subblocks/state.mjs:177`（`if (block.queued) block.stateWord = null`）∥ `:178`（`queued = false`） | S1 · T-A45 |

用例载体 = 单元测试档三档（N 族 / S 族 / think 标签族），随批留存、收口即删；**设计档只留用例号、不落具体档名**（档可被清理，设计档要活过批次）。
行数读数（实读）：`block.mjs` 167 · `activity-view.mjs` 231 · `state.mjs` 334。

### 既有口径的取代关系（逐条 · 冲突处按新行为收正）

| 既有句 | 位置 | 处置 |
|---|---|---|
| 「think / text / toolOutput 均不改写状态词」（无条件） | WEBVIEW §5.2 旧句 | **取代**：think 加唯一例外（空 ∧ 有子标）；`toolOutput` 加唯一例外（顾问名支） |
| 「行首无可见子标——两端同形」 | WEBVIEW §5.6 旧句 | **取代**：删该句，落「行首子标」规则块（身份主承载面） |
| D-W42 = 身份只经状态词 `<sub>/` 前缀体现 | WEBVIEW §7 D-W42 | **收正**：身份主承载 = 行首子标（D-W44），状态词前缀只是附注 |
| D-W43 = think 零改写（无例外） | WEBVIEW §7 D-W43 | **收正**：加例外（状态词空 ∧ 有子标）∥ `toolOutput` 例外 = 顾问名 |
| 「状态词只由结构化工具行写」／件头「写点恰一处」 | WEBVIEW §5.2 ∥ `activity-view.mjs:193` 件头注 | **措辞收正**：写点仍是**一个函数**（`noteChunk`），函数内分三支（工具行 ∥ 顾问名 ∥ think 例外）——「恰一处」说的是函数数，不是分支数；件头注已随实现同步（代码零改） |
| §3 行 3「块头与状态词形态单源 = WEBVIEW §5.2」 | RENDER-CORE §3 | **补指针**：行首子标形态单源 = WEBVIEW §5.6（该行表述仍成立，机制另见 KD-RC-15） |

### 关键决策

| # | 决策 | 理由（可核来源） |
|---|---|---|
| D1 | 身份挂行首，不进块头 | 父子是两个实体（用户 2026-09-07 裁定）；块头只有一个身份位，塞两代会把父的块头改写成子的名字，读者再也确认不了「这个块是谁的」 |
| D2 | think 例外只补「空状态词」，不改写已有 | 工具行是「此刻在做什么」的证据，思考不能顶掉（CLI `currentTool` 同规，`subagent-blocks.mjs:308`/`:323`）；但子代理刚起只给裸思考词会丢掉名字（用户 2026-10-20 16:32 ∥ 2026-10-21 17:44 两次裁定）⇒ 两个约束的交点 = 「空才补」 |
| D3 | 顾问名只写名字不写正文 | 名字是事实（本块正被 advisor 占用），正文是内容（只进块体）；正文入状态词 = 把内容面挤进标题面，短标题装不下长评审 |
| D4 | `started` 清空条件化到 `queued` | 清的语义 = 撤掉排队标注；心跳重发不是新迁移，每次清 = 语义外溢，表现即每 ~2 s 闪回（用户 2026-10-21 18:01） |

### 机检门收正（consistency surface · 逐条在册）

首跑 `doc_check(mode:"gate")` 命中 14 条，全为两档**预存**悬空裸名指针 + 本笔一行超宽；逐条已修（不改语义，只把指针写成仓根全路径 / 拆行）：

| # | 位置 | 原写 | 收正 |
|---|---|---|---|
| 1 | `RENDER-CORE.md` §4 行 14 | `RENDERER.md` §3 | `docs/desktop/design/RENDERER.md` §3 |
| 2 | `RENDER-CORE.md` §4 行 15 | `RENDERER.md` §3 判据 | 同上全路径 |
| 3–5 | `RENDER-CORE.md` §8 表 R3a ∥ R3b ∥ R3c | `IPC.md`（三处） | `docs/desktop/design/IPC.md` |
| 6–9 · 14 | `WEBVIEW.md` 档头 ∥ §4.5 两处 ∥ §4.8 ∥ §10 | `requirements/WEBVIEW.md`（五处） | `docs/vsc/requirements/WEBVIEW.md` |
| 10 | `WEBVIEW.md` §4.8 | `doc:PROVIDER.md:§6.22` | `doc:docs/core/design/PROVIDER.md:§6.22` |
| 11–12 | `WEBVIEW.md` §7 D-W41 ∥ §8 U-W20 | `doc:MODEL-SPECS.md:§15.4`（两处） | `doc:docs/core/design/MODEL-SPECS.md:§15.4` |
| 13 | `WEBVIEW.md` §5.2 `started` 条 | 单行 306 字符 | 拆两行（语义零变） |

修后复跑：`DOC-CHECK GATE: PASS`（显式 2 档 · 0 命中）。

### 验收对照

| 本笔验收 | 落点 | 机检 |
|---|---|---|
| ① 四处行为逐条进设计档（规则 + 为什么） | 上表「覆盖条目」四行 | 文档读回 + `doc_check` |
| ② 每处给实现坐标与用例 | 「实现坐标」表 | `file:line` 逐行实读（本笔会话内） |
| ③ 与既有口径不打架（含取代关系） | 「既有口径的取代关系」表 | 全文 grep「无可见子标」/「均不改写」零残留 |
| ④ `doc_check` PASS | 本笔收尾 | `DOC-CHECK GATE: PASS`（2 档 0 命中） |
| ⑤ 零改产品代码 / 提示词 / 需求档 | 本笔只写设计档两档 + 本段 | `git status` 只出 docs 面两档 |

### 上抛项

无。四处行为均由 §1 已批准的记录 + 本笔实读推出，无新增语义；评审若有异议，落设计档两档内即可收正。

### §2 收正（自检发现 · 分节号与 grep 读数）

1. **分节号收正**：上表「覆盖条目」与「取代关系」引用 `WEBVIEW.md §7 D-W42…D-W45` —— 实读该档标题表，**D 表住 `§6 关键决策记录`**（`docs/vsc/design/WEBVIEW.md:613`）；档内无 `§7` / `§9`（号段跳号 = 既有形态，非本笔造成）。
   正确引用 = **`§6` D-W42 ∥ D-W43 ∥ D-W44 ∥ D-W45**；`U-W21…U-W24` 住 **`§8` UI / 交互决策落档**（`:663`）——原文 §8 引对了，§7 引错。设计档两档内**无** `§7` 引用（本笔未写入错号），故无需改档。
2. **grep 读数（逐字）**：`docs/` 全树 grep `无可见子标|均不改写` 命中 4 行——**设计档两档 0 行**（零残留成立）；命中 3 行在本段「既有口径的取代关系」表（作为被取代句在册）· 1 行在 `docs/batches/2026-10-21-think-align-cli.md:45`（**另一批已收口档**，非本笔写域，按「越界不记录」不动）。

### §2 收正（评审 #2 · 设计档面四件 · 2026-10-22）

逐条落地（编号 → 落点）：

| # | 处置 | 落点 |
|---|---|---|
| 1 🟡 must-fix | §5 契约签名改 5 参 + 一句形参语义；坐标 `:44`（冻结守卫行）→ `:42`（导出签名行）。改前把 `meta` 记在第 4 位 ⇒ 照契约调用 `sub` 恒空 ⇒ 行首子标恒不出 | `docs/render-core/design/RENDER-CORE.md:223` |
| 2 🔵 | §5.2「勘察源」坐标与同节正文同口径：工具行 `:207-210` ∥ 顾问名 `:211-218` ∥ think 例外 `:220-228`（旧记 `:206-209` ∥ `:212-218`，且缺顾问名支） | `docs/vsc/design/WEBVIEW.md:310` |
| 3 🔵 | §3 行 3 补「行首子标形态单源 = WEBVIEW §5.6」（本笔 §2 处置已写、盘上缺） | `RENDER-CORE.md:83` |
| 4 🔵 | core.css 现行读数回填实测 **336**；§6 口径行标 as-of；`:386` ∥ `:434` 两处旧读数改标「该批时点读数」（chat.css 498 不再冒充现行） | `RENDER-CORE.md:348` · `:353` · `:386` · `:434` |

改后逐字：

1. `appendAdvisorChunk(block, kind, text, sub, meta)`（核 `flow/block.mjs:42`）——第 4 位 `sub` = 行首子标来源：非空 ⇒ 行首 `span.advisor-sub`（`appendLineText` `:87-94`）、缺席 ⇒ 纯文本；第 5 位 `meta` = 续写合并判据（`face` ∥ `tool`——`:55-57`）+ 续写并入末文本节点（子标一份）；
2. ③ 核件 `subblocks/activity-view.mjs`（`:38` 词源 ∥ `:104` / `:113` 读点 ∥ `:207-210` 工具行写点 ∥ `:211-218` 顾问名支 ∥ `:220-228` think 例外支）——相关（实现实读）；
3. ……零 A / B / C；块头与状态词形态单源 = `docs/vsc/design/WEBVIEW.md` §5.2；行首子标形态单源 = `docs/vsc/design/WEBVIEW.md` §5.6 |
4. `thincoder-desktop/renderer/core.css` **336**（as-of 2026-10-22 实测，内容行数口径）；· 口径：内容行数（文末换行不计）；「结构不变」= 档职责边界不动；各行行数 = 该批实施时点读数（as-of 该批），非现行读数。

**行数实测**（内容行数 = 文末换行不计）：`thincoder-desktop/renderer/core.css` **336** ∥ `thincoder-vscode/webview/chat.css` **531** ∥ `thincoder-desktop/renderer/theme.css` **70**。

**另见（报告上游 · 未改）**：① `RENDER-CORE.md:349` theme.css 记 **89**，实读 **70**——同段同口径，不在评审 #2 四件内，留裁；② §6:412–413 ∥ WEBVIEW:337–338 三处读数 **167 ∥ 231 ∥ 334**，按本档口径实读 **166 ∥ 230（末次提交；工作树 232，含父侧件头注改动）∥ 333**——差 1，疑原读数含文末空段；按 as-of 口径作为该批时点读数保留。

**机检**：`doc_check(mode:"gate", docs = 显式 2 档)` ⇒ `DOC-CHECK GATE: PASS`（2 档 · 0 命中）。
**零改**：产品代码 · 测试档 · 需求档 · 提示词。

## §3 设计评审（评审子代理）
## §4 用户批准（主 agent）

**批准依据**：轻通道轮，用户逐笔走查后授权收尾——2026-10-22 11:35「先收尾」（此前 10:59 起在开发宿主 PID 30580 上走查子标 / think / 顾问名 / 闪烁四处）。轮内三笔均为「实现与用户当场指出的现象不一致」的缺陷修复，无新机制。

- 链路：三笔轻通道笔 → 设计形式化 #1 → 代码评审 #2（changes-required）→ 修复 → 复核 #4（**pass**）。
- 无 🔴 遗留；复核余 🟡2 / 🔵3 均已处置或记账（`#1733`）。

## §5 实施记录（eng-coder）
## §6 验证与收口（父代理）

## 验证与收口（轻通道轮 · #1727）

**链路**：三笔轻通道笔（子标 · think 例外 + 顾问名 · started 幂等）→ 设计形式化 `#1` → 独立评审 `#2`（changes-required：🟡1 must-fix + 🟡1 + 🔵6）→ 修复（设计档 `#3`，代码件头注与 S2 断言父侧直改）→ 复核 `#4`（**pass**，余 🟡2 + 🔵3）。

**父侧复跑（2026-10-22）**

| 判据 | 读数 | 判定 |
|---|---|---|
| `node test/run.mjs`（vsc 树） | **27 pass / 0 fail**（N1–N5 · S1–S3 · T-A33/A34/A38/A41–A45） | ✅ |
| 四笔行为与设计档一致 | 行首子标（`flow/block.mjs:87-94` · 接入 `:63`/`:79`）· think 例外（`activity-view.mjs:226-228`）· 顾问名（`:213-219`）· `started` 幂等（`state.mjs:177-178`） | ✅ |
| `doc_check` gate | `RENDER-CORE.md` ∥ `WEBVIEW.md` ∥ `ENGINEERING-MODE-V2.md` ⇒ **PASS · 0 命中** | ✅ |

**复核轮 #4 遗留（不阻塞，均已记账）**：① 坐标整组 +2 漂移（本轮件头注 +2 行所致）——**父侧已代改**：`RENDER-CORE.md` KD-RC-15 ②（`:201` → `:203`、`:207-210` → `:209-212`、`:211-218` → `:213-219`、`:220-228` → `:222-230`）与 §5 接口段（`activity-view.mjs:201` → `:203`）、`WEBVIEW.md` §5.2 七处（含 `:224-226` → `:226-228`）；本档 §2 的坐标表为设计轮时点读数，按记录不改写（设计档为准）。② `activity.js:146/150` 归档快照丢 `sub` ⇒ 台账 **`#1733`**。③ N 族用例宿主为自造桩（非 happy-dom）⇒ 与 `#1733` 同批处置。

**收口清单**：`doc_check` PASS · 暂缓批复核无 · 前批遗留无 · 用户文档面同步（两设计档已随正）· 台账 `#1727` → **已核销** · 新债 `#1733`（归档快照端差 + 测试宿主）。
