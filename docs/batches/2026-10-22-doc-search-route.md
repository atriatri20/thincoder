# 2026-10-22 · doc-search-route
> 六段 append-only，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 编制：主 agent · 2026-10-22 · 来源 = 用户令（2026-10-22 10:02 转述**别的项目的反馈** + 10:04「提示词强化一下，但是要求还是老规矩“知其然知其所以然”」）：发现式文档检索走 doc_search，grep 不用于发现；每条规则携 why。
> 台账 = #1728（ENGINEERING-MODE · 归批）。前情 = docs/batches/2026-10-21-no-fallback.md（已收口 2026-10-21）。
## §1 讨论（主 agent）
**状态行**：已收口 2026-10-22
<§1 模板占位：本批条目 / 关键判据 / 授权口径>

## 讨论记录

**来源（用户 2026-10-22 10:02 逐字 · 转述他项目反馈）**：「我们明明提供了doc_search工具，但是模型在查文档的时候总是用直觉使用grep，这就带来很多问题，首先是跨仓文档查不到，其次是批次档里的旧信息经常造成污染。」→ 10:04：「好，提示词强化一下，但是要求还是老规矩“**知其然知其所以然**”。**这是别的项目的反馈，不是我这边的发现**。」

**结构诊断（父侧实读，2026-10-22）**

| # | 事实 | 证据 |
|---|---|---|
| 1 | 批次档**早已排除在文档索引之外**（段序列 `docs/batches` 无条件排除；`_archive` 同排除） | `thincoder-core/declaration.mjs:121-144`（面⑥）· `PROJECT-MANIFEST.json` `index.excludePaths` |
| 2 | ⇒「批次档旧信息污染」不是索引的问题，是 **grep 绕过了索引**：它按字面扫全树，**没有档类判据** | 同上；grep 工具面无档类概念 |
| 3 | 跨仓查不到 = 声明域为空：`index.publicRepos = []` ⇒ 本仓之外零文档入索引 | `PROJECT-MANIFEST.json` |
| 4 | 提示词只有「探索顺序 repo_outline → doc_search → code_search」，**无「文档检索禁用 grep 做发现」**；工具路由表只列 doc_search 用途，未写 grep 边界 | `common.md`「Codebase exploration order」∥ 工具路由表 |

**两个症状同根**：`doc_search` = 「按声明域检索 + 排除过程档」；grep = 「按字面扫全树」。走拦路 grep 等于每次现编一份「什么算文档」，于是过程档被当依据、跨仓永远查不到。

**本批范围**（= 需求 §13.19 / FR41 五条）
1. **两分法**：发现式（哪份文档说过 / 有没有既有规范 / 旧决定在哪）⇒ `doc_search` 首查；定位式（已知档名或坐标，要拿 `file:line`）⇒ grep 照用。
2. **无命中要说出来**：`doc_search` 0 命中后才许 grep 兜底，结论写「doc_search 已查无」。
3. **命中不是口径**：grep 命中 `docs/batches/**` ∥ `**/_archive/**` ⇒ 线索不是结论，回状态档核。
4. **跨仓**：`index.publicRepos` 声明的才查得到；未声明 ⇒ 写「跨仓未纳入索引」，不许 grep 顶替后当已查。
5. **每条携 why**（用户令「知其然知其所以然」）：写清机制差——**声明域 ∩ 排除过程档** vs **字面扫全树**；不许只写禁令。

**不做**：不改 `doc_search` 检索语义 · 不改既有排除规则（面⑥ 已正确）· **本批不动 `PROJECT-MANIFEST.json`**（`publicRepos` 声明与否 = 配置面，用户未裁 ⇒ 不改，按「未声明」边界写）· 不禁 grep · 不新增机械门。

### 1.1 父侧更正（用户 2026-10-22 10:06）

**用户原话**：「grep的问题不是扫全树，是会忽略跨仓文本。」

**改的是 why 的主轴，不是结论**：

| | 原写法（降为次因） | 更正后（主轴） |
|---|---|---|
| 机制差 | grep「按字面扫全树、无档类判据」 | **搜索面不同**：`doc_search` = **声明域**（可含 `publicRepos` 跨仓源，一次覆盖多仓 + 带档类）；grep = **你递给它的那一个路径**（缺省 cwd） |
| 后果 | 批次档被捞回来当依据 | **跨仓结构性失明**——别的仓的文本除非已知绝对路径否则不可见，而模型连「这台机器上有哪些仓」都不知道 ⇒ 不是「没查仔细」，是**看不见** |
| 次因（保留） | — | grep 无档类判据，绕过索引后才把已排除的过程档捞回来 |

**连带**：需求 §13.19 的 why 行已改写；派单已 `send` 给设计席 `#60`（非中断，下一回合边界消费），验收加一条——新增文本必须出现「跨仓/别的仓」层表述，且不得把「扫全树」当作 grep 的主缺陷。

## §2 批次任务与设计（eng-designer）
**状态行**：（eng-designer 写入时更新）
<§2 模板占位：本批条目（覆盖） / 设计档落点 / 机制设计 / 受影响文件与测试覆盖 / 验收对照 / 关键决策 / 上抛项>

**状态行**：✅ 设计完成 2026-10-22

## 本批条目（覆盖 · 回指 `ENGINEERING-MODE-V2.md` §13.19 FR41）

| # | 需求条 | 覆盖 | 落点 / 判法 |
|---|---|---|---|
| 1 | 两分法写进提示词（发现式 ⇒ `doc_search` 首查 ∥ 定位式 ⇒ grep） | ✅ 完成 | `common.md` 新 `###` 首段；A1 |
| 2 | 无命中要说（`doc_search: none found`） | ✅ 完成 | 同节第 3 段；A2 |
| 3 | 命中不是口径（批次档 / `_archive` = 线索） | ✅ 完成（降为次因） | 同节第 4 段；A3 |
| 4 | 跨仓（`index.publicRepos` 声明的才入索引 ∥ 未声明携 `cross-repo: not indexed`） | ✅ 完成 | 同节第 2 / 5 段；A4 · A5b |
| 5 | 配置面一并处置（是否声明 `publicRepos` 由用户裁） | ⚠️ 未做（本批不做 · 父侧明令） | `PROJECT-MANIFEST.json` 零改；设计按「未声明」边界写（§6.43「边界」） |
| — | 需求验收 ② 的「声明后能命中」分支 | ⚠️ 不可验（依赖第 5 条未裁） | 只验「未声明」分支；已在 §6.43 边界登记 |

**why 主轴（父侧 10:06 更正后）**：`doc_search` 检索面 = 声明域（本仓 + `index.publicRepos` 声明的跨仓源，一次提问覆盖多仓、命中携档类）；grep 检索面 = 你递给它的一个路径（缺省 = 当前 cwd）⇒ **跨仓结构性失明**。「扫全树 / 无档类判据」= 次因（过程档在域外，grep 绕过后才捞到）。用户原话：「grep的问题不是扫全树，是会忽略跨仓文本。」

## 设计档落点

`docs/core/design/PROMPT-SYSTEM.md` 新增 **§6.43**（`:2520` 起，`## 7. 关键决策记录` 之前）+ §7 新增 **D-PS43** 行。

## 机制设计（六件）

1. 两分法（发现式 / 定位式；判据 = 检索面，不确定在哪个仓 ⇒ 只有 `doc_search` 够得着）。
2. 机制差（why 主轴，见上）。
3. 无命中要说（英文面 `doc_search: none found`；中文记录面 `doc_search 已查无：`）。
4. 命中不是口径（`docs/batches/**` ∥ `**/_archive/**` ∥ 日志页 = 域外证据 ⇒ 回状态档核；次因）。
5. 跨仓未声明（`cross-repo: not indexed` / `跨仓未纳入索引：`）。
6. 分界句：FR38 管「要不要先查」· FR39 管「落笔前交什么答案」· 本节管「用哪个工具查、检索面覆盖什么」——三条相邻不同轴。

## 落点判断（designPoints 6）

候选 A「`### Codebase exploration order` 续段」· 候选 B「工具路由表表行加注」→ **两候选皆否**，采纳「同层新增 `###` 子节（A 之后）」：该 `## Tool discipline` 已装联网面两张搜索选择子节、文档面缺第三张；A 的 2 行格言体塞不下机制差（逐字零改）；B 的单元格装不下 why。四判面（读者 / 读时机 / 能否携 why / 计数连带）逐条见 §6.43 落点判断表。

## 受影响文件与测试覆盖

| 文件 | 现行 | Δ → 改后 |
|---|---|---|
| `thincoder-core/prompts/common.md` | 292 行 / 46,256 字符 | **+12 行 / +2,917 字符** ⇒ 304 行 / 49,173（+6.31% · 体量无帽只读数） |
| `docs/core/design/PROMPT-SYSTEM.md` | 2,711 行（写入前） | §6.43 新节 + D-PS43（本席笔） |
| 其余提示词 15 档 · `tool-docs/**` · `PROJECT-MANIFEST.json` · 产品代码 · `scripts/**` · 需求档 | — | **±0** |

计数连带（D3）：`common.md` `##` 节数 20 ⇒ 20 · 标题节点 25 ⇒ 26 · h3 5 ⇒ 6；需求档 `### 2.3` 大纲（`##` 级）零连带。测试：本批不新增用例文件；机判沿用 `node scripts/prompt-refs-check.mjs`（基线 69 档 / 463 档 / 命中 0）+ `doc_check(mode:"gate")`。

## 验收对照（§6.43 A1–A9 + A5b）

A1 两分法 · A2 `doc_search: none found` · A3 线索句 · A4 跨仓句 · A5 why（检索面主轴）· **A5b 10:06 更正验收（跨仓层表述在场 ∥ `whole tree` 零命中）** · A6 禁令腔 = 0（`execute` 实测 0）· A7 零文档引用 + `doc_check` PASS · A8 FR38 / FR39 逐字零改 · A9 计数。逐条子串见 §6.43 验收表。

## 关键决策（缩）

K1 落公共层 `###`（受众 = 两模式 + 全子代理）· K2 探索顺序两行逐字零改 · K3 工具路由表零改 · K4 双语字面（英文面 / 中文记录面两形一词）· K5 主轴 = 检索面之差、非裸禁令 · K6 「看不见」带绝对路径限定句（不写绝对化）。全文见 §6.43。

## 上抛项

无。需求第 5 条（配置面）父侧已明令本批不做 ⇒ 按「未声明」边界落，不作上抛。

### 修正轮（评审 §3 轮次 1 · #61 · 8 条）

**范围**：按 §3 的 8 条逐条落；设计档 §6.43 / D-PS43 就地更新（状态档只留现态，沿革记本段）。零改：`thincoder-core/prompts/**` · `PROJECT-MANIFEST.json` · 产品代码 · 需求档——本席本轮只写设计档与本段（git status 实读）。

| # | 级别 | 修正 | 设计档坐标 |
|---|---|---|---|
| 1 | 🔴 | A4 第三判读串 `different set in both directions`（B1 无此串）→ `adds nothing to the searchable domain`（B1 P5 实有 · 1 次）；同格 `index.publicRepos` 由「1 次」更正为 **2 次**（B1 P2 / P5 各 1，`node` 实测） | `PROMPT-SYSTEM.md:2631` |
| 2 | 🔴 | A3 两处路径字面量（B1 无）→ 改判 B1 实有串 `batch records and archived pages stay out of the index`（1 次）。选「判 B1 实有串」不选「把路径写进 B1」：提示词是产品面、跨项目加载，`docs/batches` 是本仓 manifest 值（`PROJECT-MANIFEST.json:23`），写死路径在别的项目为假；B1 的语义陈述跨项目成立 | `:2630` |
| 3 | 🟡 | FR41 ⑤ 在册化：`上抛项` 由「无」改为待裁项（解除条件 = 用户裁定；声明 ⇒ 另开配置面批次补声明 + 补验 A10）；验收加 **A10 = 需求验收 ② 前半本批不可验（阻塞于 ⑤）** | `:2677` · `:2637` |
| 4 | 🟡 | B1 P2 三句直读：① 声明域 = `declaration.mjs:81` ∥ `:266-277` + `memory/code-search.mjs:19-25` + `memory/docs.mjs:28-32`；② 一次提问 = `memory/docs.mjs:112-131`；③ grep 一个路径 = `tool-docs/grep.md:7` ∥ `tools/search.mjs:93`。「命中携档类（requirement / design / module）」**无源且与实现相反**（`memory/docs.mjs:236-238` 命中形 = path > heading + 行段 + relevance；`memory/code-index.mjs:203` language 只有 markdown / text / rst / asciidoc）⇒ 该句从 B1 删除；「（父侧实读，本席采信为引证）」二手句删除 | B1 `:2568` · 勘察 `:2660-2673` |
| 5 | 🟡 | 对照表「B1 P4 不重述机制（D2）」断言删除 → 改记「关键锚点重复」（D-PS41 先例：各层须能独立阅读；机制详述仍只住 Doc vs process / Batch record 两节） | `:2594` |
| 6 | 🟡 | D8：A5b 行（「10:06 更正验收」）删除，实质并入 A5（`whole tree` 零命中 + 跨仓层串）；`「扫全树 / 无档类判据」降为` 沿革句（`:2526` ∥ 偏离③）改为现态陈述 | `:2632` · `:2526` · `:2657` |
| 7 | 🔵 | 联网两子节统一为一次实读：`## Tool discipline` = `common.md:130-164` · `### Search tool priority` `:131-136` · `### When online verification is required` `:138-150`（C10 引的 `:149` 落在读面内）；对照表行改同一读数 | `:2595` · `:2660-2673` |
| 8 | 🔵 | 对照表断言的三节补进勘察读面：`Evidence discipline` `:43-48` · `Batch record` `:251-259` · `Doc vs process` `:260-265` | `:2660-2673` |

**改后 A3 / A4 判读串（从 B1 逐字块重新导出 · `node` 实测）**：

- A3 = `a lead, not a finding` 1 · `batch records and archived pages stay out of the index` 1 · `turns a past round's draft into this round's standard` 1。
- A4 = `cross-repo: not indexed` 1 · `index.publicRepos` 2 · `adds nothing in the searchable domain` → 实为 `adds nothing to the searchable domain` 1。

**B1 P2 三条直读坐标**：`memory/code-search.mjs:19-25` · `memory/docs.mjs:112-131` · `tools/search.mjs:93`。

**体量读数（改后实算）**：B1 = 2,848 字符 / 11 行（删「命中携档类」句 −68 字符）；`common.md` 292 行 / 46,256 字符（零改）⇒ 304 行 / 49,105 字符（+12 行 / +2,849 字符 · +6.16%）。

**机检**：`doc_check(mode:"gate")` = **PASS**（设计档 1 档全清 · 0 命中）。

**仍待父侧**：⑤ 落台账（本席无台账写权限）；本轮未改 B1 语义主轴与落点。

### 修正轮（评审 §3 轮次 2 · 第 4 条残留 · 单条）

**范围**：按 §3 轮次 2 第 4 条（Unfixed · 部分修）收口；只动设计档 `PROMPT-SYSTEM.md:2541` 机制 2 一处。零改：`thincoder-core/prompts/**` · `PROJECT-MANIFEST.json` · 产品代码 · 需求档（`ENGINEERING-MODE-V2.md:885` 的「并带档类」父侧已删，本席零写）。

| # | 级别 | 修正 | 坐标 |
|---|---|---|---|
| 1 | 🔴 | 机制 2 删「命中携档类（需求 / 设计 / 模块）」+ 连带顿号 ⇒ 现文「…声明的公共源仓），一次提问覆盖多仓；」（−20 字符）。删后句读得通（`；` 直接承接 `grep` 检索面对句）⇒ 不另补命中形句，A1–A10 判读串零牵连 | `PROMPT-SYSTEM.md:2541` |

**依据（本席复读）**：`thincoder-core/memory/docs.mjs:236-238` 命中形 = `path > heading` + `(L…-L…, relevance …)` + 内容片段 ⇒ 无档类字段；与 `:2668` 证据行结论一致。

**残留扫描（全档 · 本席 grep 实读）**：`携档类` = 1（`:2668` 证据行「已删」记录，派单明示豁免）· `document class` = 0；宽扫 `档类` = 2（`:2526` = 「`grep` 无档类判据」另一断言 · `:2668`）。

**机检**：`doc_check(mode:"gate", target:"D:\teamcode\thincoder", docs:["docs/core/design/PROMPT-SYSTEM.md"])` = **PASS**（1 档全清 · 0 命中）。

### 修正轮（评审 #65 第 9 条 · 单条 · 口径限定）

**范围**：收 §3 轮次 3 第 9 条（🟡）：需求档 `ENGINEERING-MODE-V2.md:885` 在评审轮被父侧改写 1 行，设计档仍记「需求档 零改 / ±0」⇒ 补一行记录 + 口径限定。本席本轮只写设计档 §6.43 与本段；零改：`thincoder-core/prompts/**` · `PROJECT-MANIFEST.json` · 产品代码 · 需求档（父侧笔）。

| # | 级别 | 修正 | 坐标 |
|---|---|---|---|
| 1 | 🟡 | 边界面之后新增一行「需求档本批改写 1 行（父侧笔 · 实施席面之外）」：`:885` 断言「并带档类」→「不带档类——实读 `thincoder-core/memory/docs.mjs:236-238`」，1 行改写 · 行数不变；「零改 / ±0」= 实施席面口径（实施席零写需求档） | `PROMPT-SYSTEM.md:2644` |
| 2 | 🟡 | L4「**零改**（K1 · K3）」→「**零改**（实施席不改 · K1 · K3）」；受影响文件表「**±0**」→「**±0**（实施席面；需求档 `:885` 1 行断言更正 = 父侧笔，行数不变）」——数值零变 | `:2584` · `:2622` |

**口径核对（本席实读 · 三处）**：§6.43 内「需求档 × 零改 / ±0」= `:2584`（已限定）· `:2622`（已限定）· `:2636` A9（所判 = 需求档 `docs/core/requirements/PROMPT-SYSTEM.md:64` 一行标题，本批确零改，口径已明）. `:2672` 勘察证据行为读面坐标，非零改断言。设计档其余「需求档 零改 / ±0」句均属 §6.1–§6.42（他批设计面），不涉本批。

**证据**：需求档 `:885` 现文 =「…不带档类——实读 `thincoder-core/memory/docs.mjs:236-238`」（本席复读）；改写前文 = §3 轮次 2 #4 记录的「需求档 `:885` 亦写「并带档类」」。`git diff` 实读：需求档 §13.19 整节 = 本批未提交新增，`:885` 为其中一行 ⇒ 与 HEAD 比不显示单行改动，评审轮内该行改写以 §3 轮次 2 #4 与轮次 3 #9 两处记录为据（1 行 · 行数不变）。

**机检**：`doc_check(mode:"gate", target:"D:\teamcode\thincoder", docs:["docs/core/design/PROMPT-SYSTEM.md"])` = **PASS**（1 档全清 · 0 命中 · 阈值 300 字符）。

**补读数（全档扫描 · 本席 grep 实读 · 设计档改后复跑）**：全档 `需求档` × `零改|±0|零触|零笔` = **43 行**：§6.43 内 4 行（`:2584` · `:2622` · `:2636` · `:2644` 本笔）+ §6.1–§6.42 **38 行** + §7 `:2708`（D-PS25 决策行）**1 行**；后 39 行均属他批设计面 / 已成文决策行 ⇒ 不涉本批。

**D8 取舍**：设计档 `:2644` 不写旧文「并带档类」（「先前 X ⇒ 改 Y」形式 = 规范面残留）；只记现文断言 + 「本批评审轮改写 1 行 · 行数不变」。旧文与更正过程住记录面（本段表格行 ∥ §3 轮次 2 #4）。

**机检（终态）**：`doc_check(mode:"gate")` = **PASS**（1 档全清 · 0 命中）。

### 修正轮（实施轮评审 · B1 P4 归档排除条件化 · 父侧 1 条 + 读数收正）

**范围**：按父侧实施轮评审（B1 P4 把归档排除写成无条件机制）落笔，并同步同一实读在机制 4 的同句；本席本轮只写设计档 §6.43 与本段。零改：`thincoder-core/prompts/**`（B1 P4 重落 = 实施席）· `PROJECT-MANIFEST.json` · 产品代码 · 需求档。

| # | 面 | 修正 | 坐标 |
|---|---|---|---|
| 1 | B1 P4（模型可见面 · 落地面 `common.md:163`） | 归档排除改条件形：批次档无条件（`declaration.mjs:144` 面⑥），归档页仅在项目声明 `index.excludePaths` 时排除（缺省 `[]` · `manifest-schema.mjs:63`）；后果句随条件收窄为「命中被排除文档」。lead / state / draft 三句逐字未动 | `PROMPT-SYSTEM.md:2572` |
| 2 | 验收 A3 | 旧判读串 `batch records and archived pages stay out of the index` 删除 ⇒ 改判两条：`batch records always stay out of the index` 1 次 + `archived pages wherever the project declares them excluded` 1 次；另两条不动 | `:2630` |
| 3 | 体量读数 | 改前落地实测 = +2,850 ⇒ 49,106（父侧读数）；P4 改写 +67 字符 ⇒ **+12 行 / +2,917 字符 ⇒ 304 行 / 49,173**；B1 = 2,915 字符 / 11 行；+6.31% | `:2581` · `:2620` · `:2639` |
| 4 | 机制 4 同句（本席派生） | 「声明域已排除过程档（面⑥）」= 同一实读错误 ⇒ 改「批次档无条件 + 归档页按项目声明排除」；不在父侧清单内，属同一裁定的直接派生 | `:2543` |
| 5 | 本段旧读数作废 | `:87` 的 `+2,917 ⇒ 49,173` 作废（含后来删除的「命中携档类」句的原始估算，换行计法差 1）。**权威读数 = 设计档 `:2581` / `:2620` / `:2639`**：+2,917 ⇒ 49,173（与 `:87` 同数不同源：−68 档类句 + 1 换行计法 + 67 P4 改写 = 0） | 本节 |

**改后 B1 P4 机制句（逐字）**：

```text
The declared domain leaves process documents out — batch records always stay out of the index, archived pages wherever the project declares them excluded — so a hit in an excluded document tells you the search ran outside the domain: a secondary cost next to the cross-repo blindness above.
```

**实施席重落**：B1 逐字块（设计档 `:2564-2574`）已改 ⇒ `common.md:163` 按新块重落该一行；重落后实测应为 304 行 / 49,173 字符（改前 49,106 + 67）。

**机检**：`doc_check(mode:"gate", docs:["docs/core/design/PROMPT-SYSTEM.md"])` = **PASS**（1 档全清 · 0 命中）。

## §3 设计评审（评审子代理）

### 轮次 1（评审子代理）

### 设计评审 · §6.43（FR41）· 轮 1 · VERDICT: changes-required

| # | Category | Severity | Issue | Suggestion |
|---|----------|----------|-------|------------|
| 1 | 验收 (Acceptance) | 🔴 | A4 的第三判读串 `different set in both directions`（PROMPT-SYSTEM.md:2631）在全档只出现于 A4 行自身（子串扫描唯一命中 = 该行），B1 逐字块（:2563-2575）无此串 ⇒ 按「`common.md` 内」判必红，按设计档判则自查自证；实施席只能交红或在落地档写 B1 之外文本（违反 :2559「唯一权威目标形」） | 用 B1 实有串重写 A4 第三项（如 `adds nothing to the searchable domain` / `count once declared`），或先改 B1 再同步验收表 |
| 2 | 验收 (Acceptance) | 🔴 | A3 要求 `docs/batches/**` · `**/_archive/**` 各 1 次（:2630），但 B1 P4 的表述是 `batch records and archived pages stay out of the index`（:2572）；两个路径字面量只在设计散文里（:2543 / :2608）⇒ 同 A4，验收不可达 | 二选一：A3 改判 B1 实有串（`a lead, not a finding` + `batch records and archived pages stay out of the index`）；或把路径字面量写进 B1（路径操作数属 §6.6 判保留面）后同步复跑 A7 |
| 3 | 需求覆盖 | 🟡 | FR41 ⑤（`publicRepos` 是否声明 = 用户裁，ENGINEERING-MODE-V2.md:883）在 :2641 记为「本批未裁」，但 :2668 上抛项 = 无（「父侧已明令本批不做」）⇒ 用户裁项无载体、收口阶段无从核；同时 FR41 验收 ② 前半「跨仓声明后 `doc_search` 能命中」（:887）在 A1–A9 无一判据、也未标「本批不可验」 | ⑤ 记成带回指的在册项（台账行 / 待裁行含解除条件）；验收表加一行「②前半 = 本批不可验（阻塞于 ⑤）」；若批次档 §1 已载，本节引其坐标 |
| 4 | 可行性 / 证据 | 🟡 | B1 P2 的主轴断言（声明域含 `index.publicRepos` · 命中携档类 · 一次跨多仓）中，声明域与过程档排除引的是二手读数（:2662「（父侧实读，本席采信为引证）」），「命中携档类（requirement / design / module）」无任何记录来源；这段字进模型可见面后模型将据此判断检索面 | 直读 `declaration.mjs` / `doc_search` 实现，为三句各锚一个 `file:line`（删掉无源那句），把直读结论补进勘察证据行 |
| 5 | 文档归属 / D2 | 🟡 | 对照表称「B1 P4 复述的是后果，不重述机制（D2）」（:2594），但 P4 实文写 `the state lives in the requirement and design documents, and a batch record can be dropped whole`（:2572）——正是同格所指「Doc vs process」/「Batch record」两节的机制句，在同一文件内再写一次 ⇒ 设计自己的合规断言与其逐字块不符 | 二选一：P4 收到后果面（只留「开它指向的状态档」）；或改记为由 D-PS41 先例支撑的「关键锚点重复」并删掉「不重述机制」的断言 |
| 6 | 文档卫生 (D8) | 🟡 | 规范面留修订式表达：验收行标题「**10:06 更正验收（父侧）**」（:2633）与「「扫全树 / 无档类判据」降为」（:2526，偏离③ 同句），是「先前 X ⇒ 现改 Y」的沿革叙事落在 AC / 判据面；历史应归记录面（批档 / git），残留会让读者把已改掉的旧口径当活条目重开 | 删掉「更正」叙事：A5b 实质（跨仓层在场 + `whole tree` 零命中）并入 A5 作判读串；沿革句移入批档记录面 |
| 7 | 文档态一致性 | 🔵 | 同一内容两套读数：联网两子节记在 `:113-136`（:2595），勘察证据行却把 `## Tool discipline` 与联网两子节一并记在 `:130-153`（:2659）；C10 另引 `:149` 判法（:2613），该坐标不在已记读面内。落点理由（新 `###` 与联网两张同 `##` 节）恰依赖这几段的节界 | 落笔前统一为一次实读：给出 `## Tool discipline` 起止行与两个联网 `###` 的真实行段，并把 `:149` 补进勘察证据行 |
| 8 | 勘察证据 | 🔵 | 对照表断言与 `common.md`「Doc vs process」/「Batch record」/「Evidence discipline」三节零矛盾（:2594 / :2596），但勘察证据行（:2659-:2664）记录的读面只有 `:13-21` / `:130-153` / `:166-191` 与 `tool-docs` ⇒ 零矛盾结论的读面未留痕 | 把那三节的读坐标补进勘察证据行，或把这三行对照降为「待实施席核」 |

计数：🔴 2 · 🟡 4 · 🔵 2 —— 达标面：设计档在位（PROMPT-SYSTEM.md §6.43 + D-PS43）· 先例 ∥ 偏离行在位（:2655-:2657，三处偏离各有理由）· 勘察证据行在位（:2659-:2664，含「已查，无相关」）· 受影响文件均为 `.md`（行数标注义务不适用）。

VERDICT: changes-required

### 轮次 2（评审子代理）

### 轮次 2 复核（#62 修正轮 · 八条 fix claims）

已读面：`thincoder/docs/core/design/PROMPT-SYSTEM.md` §6.43 `:2520-2678` + D-PS43 `:2724`；`thincoder/docs/core/requirements/ENGINEERING-MODE-V2.md` §13.19 `:864-887`。

| # | Orig# | File | Severity | Status | Notes |
|---|-------|------|----------|--------|-------|
| 1 | 1 | design/PROMPT-SYSTEM.md | — | Fixed | A4 `:2631` 已从 B1 重导：`adds nothing to the searchable domain`（B1 `:2574` 实有）· `index.publicRepos` 2 次（`:2568` + `:2574`）· `cross-repo: not indexed` 1 次 ⇒ 可判可达 |
| 2 | 2 | design/PROMPT-SYSTEM.md | — | Fixed | A3 `:2630` 改判 B1 实有串三条（`a lead, not a finding` ∥ `batch records and archived pages stay out of the index` ∥ `turns a past round's draft into this round's standard`，均在 `:2572`）+ 路径字面量不判的理由（manifest 值随项目变）在案 |
| 3 | 3 | design/PROMPT-SYSTEM.md | — | Fixed | A10 `:2637`（②前半 = 本批不可验，阻塞于 FR41⑤）+ 上抛项 `:2677` 带解除条件（声明 ⇒ 另开配置面批次补验 A10）⇒ 用户裁项有载体 |
| 4 | 4 | design/PROMPT-SYSTEM.md | 🔴 | Unfixed | 部分修：B1 P2 已删档类句（`:2568` 现为 `queried in one call`）且声明域/一次调用各锚 `file:line`（`:2665-2667`）；但机制 2 仍写「一次提问覆盖多仓、命中携档类（需求 / 设计 / 模块）」（`:2541`），而证据行自承「命中**不带档类**，「命中携档类」句无源，已删」（`:2668`）；需求档 `:885` 亦写「并带档类」且无任何待正载体（L4 需求档零改）⇒ 同一机制两处相反描述，读者无从判权威（R1 例外），且这是父侧 #4「无源句删」的未执行部分 |
| 5 | 5 | design/PROMPT-SYSTEM.md | — | Fixed | 对照表 `:2594` 已改记「关键锚点重复（D-PS41 先例）」并删掉「不重述机制」的断言 ⇒ 与 B1 P4 实文相符 |
| 6 | 6 | design/PROMPT-SYSTEM.md | — | Fixed | A5b 已并入 A5（`:2632` 含 `whole tree` 零命中两向读数），沿革句「降为次因」已改写为「次因 = 过程档在域外」（`:2526`）；10:06 原话仅存来源面 `:2524` 与决策理由（K5 `:2652` · D-PS43），规范面无残留 |
| 7 | 7 | design/PROMPT-SYSTEM.md | — | Fixed | 坐标已统一：`:2595` 与勘察证据行 `:2662-2664` 一致（`## Tool discipline` `:130-164` · 联网 `:131-136` ∥ `:138-150` · 探索 `:152-153` · 并行 `:155-158` · 路由表 `:166-191`）；C10 `:2613` 的 `:149` 已由 `:2663` 落读 |
| 8 | 8 | design/PROMPT-SYSTEM.md | — | Fixed | 勘察证据行 `:2662` 已补三节读坐标（`:43-48` Evidence discipline · `:251-259` Batch record · `:260-265` Doc vs process）= 对照表 `:2594`/`:2596` 的零矛盾结论有读面 |

计数：🔴 1 · 🟡 0 · 🔵 0（八条中七条 Fixed，第 4 条部分修 → Unfixed）。

第 4 条的收口动作二选一：① 若代码实读为准（命中不带档类）⇒ 删 `:2541` 的「命中携档类（需求 / 设计 / 模块）」，并把需求档 `:885`「并带档类」记成待正项（带上抛/台账载体，需求档本批零改）；② 若代码实际带档类 ⇒ 恢复 B1 P2 该句并在验收补对应判读串（同时纠正 `:2668` 的结论）。两向都是单点改动，不需重做设计。

VERDICT: changes-required

### 轮次 3（评审子代理）

| # | Orig# | File | Severity | Status | Notes |
|---|-------|------|----------|--------|-------|
| 1 | 1 | PROMPT-SYSTEM.md | — | Fixed | A4 `:2631` 判读串仍与 B1 实文对齐（`adds nothing to the searchable domain` = `:2574`；`index.publicRepos` 恰 2 = `:2568` + `:2574`；`cross-repo: not indexed` 1 次） |
| 2 | 2 | PROMPT-SYSTEM.md | — | Fixed | A3 `:2630` 仍判 B1 实有三串（均在 `:2572`），路径字面量不判 + 理由在场 |
| 3 | 3 | PROMPT-SYSTEM.md | — | Fixed | A10 `:2637` + 上抛项 `:2677`（FR41 ⑤ 待裁 + 解除条件）均在位 |
| 4 | 4 | PROMPT-SYSTEM.md / ENGINEERING-MODE-V2.md | — | Fixed | 原唯一 🔴 收口：机制 2 `:2541` 的「命中携档类」已删（现文「一次提问覆盖多仓；`grep` 的检索面…」）；证据行 `:2668`「命中不带档类…已删」自洽；需求档 `:885` 改为「不带档类——实读 …docs.mjs:236-238」，三处同一事实同一说法 |
| 5 | 5 | PROMPT-SYSTEM.md | — | Fixed | 对照表 `:2594` 仍为「关键锚点重复（D-PS41 先例）」，与 P4 实文相符 |
| 6 | 6 | PROMPT-SYSTEM.md | — | Fixed | A5b 未回潮；A5 `:2632` 含 `whole tree` 零命中；`:2526` 为「次因 = 过程档在域外」（无「降为」叙事）；10:06 原话只在来源面 `:2524` / K5 `:2652` |
| 7 | 7 | PROMPT-SYSTEM.md | — | Fixed | `:2595` 与勘察证据行 `:2663-2664` 坐标仍统一（`:130-164` / `:131-136` / `:138-150` / `:152-153` / `:155-158`），C10 `:2613` 的 `:149` 有读面 |
| 8 | 8 | PROMPT-SYSTEM.md | — | Fixed | 勘察证据行 `:2662` 仍覆盖 `:43-48` / `:251-259` / `:260-265` |
| 9 | new | ENGINEERING-MODE-V2.md | 🟡 | New | 需求档 `:885` 本轮被改写（「不带档类——实读」），但设计档仍记「需求档 | **零改**（K1 · K3）」（`:2584`）与「· 需求档 | — | **±0** |」（`:2622`）——批次文件影响面与实际改动不一致；建议在边界/偏离补一句限定（零改 = 实施席面，评审轮 :885 断言更正 1 行） |
| 10 | new | ENGINEERING-MODE-V2.md | 🔵 | New | 新增坐标串损坏：`:885` 写「hincoder-core/memory/docs.mjs:236-238」（实路径 = `thincoder-core/memory/docs.mjs`，glob 已证），且「实读」后有游离制表符、别处「(L行段, relevance)」措辞粘连；一名之修即恢复可指认性 |

计数：🔴 0 · 🟡 1 · 🔵 1（前轮 8 条 = 8 Fixed，含原唯一 🔴 #4；新增 2 条 = 1 🟡 + 1 🔵，均非阻断）

VERDICT: pass

## §4 用户批准（主 agent）

**批准依据**：用户 2026-10-22 10:04「好，提示词强化一下，但是要求还是老规矩「知其然知其所以然」」+ 10:06「grep的问题不是扫全树，是会忽略跨仓文本」（更正 why 主轴）。

- 链路：设计 `#60` → 评审 `#61`（changes-required）→ 修正 `#62` → 复核 `#63` **pass** → 设计补正 `#66` → 实施 `#67` → 补正 `#69` → 重落 `#70`。
- 无 🔴 遗留（`#63` 两条新项为 🟡/🔵，均已在收口前处置）。

## §5 实施记录（eng-coder）

### 交付摘要

按设计档 `PROMPT-SYSTEM.md` §6.43 的 B1 逐字块（`:2564-2574`）落笔：`common.md` 在 `### Codebase exploration order`（`:152-153`，逐字零改）之后、`### Parallel call principles`（现 `:167`）之前插入新 `###` 子节（`### Document search — finding a document vs locating a line` + 五段），前后各一空行。本席唯一改动文件 = `thincoder-core/prompts/common.md`。

### 落地读数（父侧机判逐条）

- **B1 逐字相等**：`common.md:155-165` 与设计档 `:2564-2574` 逐行全等（11 行 · 2,848 字符）——`node` 逐行比较 = `true`。
- **落点 / 空行**：`:154` 空 · `:155` 标题 · `:165` 末段 · `:166` 空 · `:167` `### Parallel call principles`。
- **行数**：292 换行 → 304 换行（+12）。`##` 20 → 20 · `###` 5 → 6 · 标题节点 25 → 26。
- **字符数**：46,256 → **49,106**（+2,850）。设计档派生值记 +2,849 ⇒ 49,105（`:2581` / `:2620` / `:2639`）：差 1 字符 = 11 行内容串 2,848（已含 10 个内部换行）只加 1 个尾随空行，漏计末段行自身的终止换行；实插 12 行 = 2,838 内容字符 + 12 换行 = 2,850。行数与落点两边一致，仅派生字符数差 1（设计档读数勘误 = 设计席 / 父侧笔）。
- **A1** `finding a document vs locating a line` · `**Discovery**` · `**Locating**` · `which repository holds it` 各 1。
- **A2** `doc_search: none found` 1 · `An unstated fallback reads to the next person as` 1。
- **A3** `a lead, not a finding` 1 · `batch records and archived pages stay out of the index` 1 · `turns a past round's draft into this round's standard` 1。
- **A4** `cross-repo: not indexed` 1 · `index.publicRepos` 2 · `adds nothing to the searchable domain` 1。
- **A5** `searches a declared domain` / `the one you hand it, the current repository by default` / `Other repos on this machine` / `structural limit across repositories` / `secondary cost next to the cross-repo blindness` 各 1；`whole tree` **0 命中**。
- **A6** B1 内 `never|do not|don't|must not|may not|forbidden` = **0**。
- **A7** `node scripts/prompt-refs-check.mjs` = 提示词面 69 档 · 代码面 463 档 · **命中 0**（与基线一致）；B1 内 `.md` 0 · `§N` 0。
  `doc_check(mode:"gate", docs:["thincoder-core/prompts/common.md"])` = **`DOC-CHECK GATE: PASS`**。读数注：该档不在声明域（`checkConfig.scanDirs = ["docs"]`），门报「跳过 1 档 · 0 档受检」——项目声明面的既知边界，非本席豁免。
- **A8** `common.md:13-21` 与 `discipline-engineering.md:42` 逐字零改（本席改动 = 纯插入，`git diff --numstat` = `12 0`）；分界句 `decides when to look; this subsection decides which tool looks` 1。
- **A9** 见上计数行；需求档 `:64`「common.md 20 节」零改（本席零笔）。
- **A10** 本批不可验（阻塞于 FR41 ⑤；设计档 `:2637` / `:2679` 在案）。

### 决策披露

- **出清单改动：零**。`git status` 中本席唯一文件 = `thincoder-core/prompts/common.md`；其余已修改文件（批档 3 档 · 设计档 · 需求档 · MENU.md · CORE-UNIFICATION.md · desktop / render-core / vscode 代码）皆为会话前既存改动，非本席笔。
- **零改面**：`tool-docs/doc_search.md` · 需求档 · 设计档 · `PROJECT-MANIFEST.json` · 其它 15 档提示词 · 产品代码。
- **设计读数偏差 1 条**已在「落地读数」披露（+2,849 / 49,105 → 实测 +2,850 / 49,106）；B1 逐字块零改——逐字块是唯一权威目标形，本席不擅改设计措辞。

### 审计与代码评审轮次（终态）

| 轮 | 面 | 结果 |
|---|---|---|
| 1 | 内部 explore 偏离审计 | B1 逐字 / 落点 / 空行 / 计数 / 文件清单全部 match；唯一偏差 = §5 当时未写（即本段，已消） |
| 2 | 内部 advisor 代码评审 | `VERDICT: pass`（0 🔴 · 1 🟡 · 3 🔵） |

**评审 4 条 = 全部落在设计措辞面，非实现偏离；B1 逐字块不改 ⇒ 转父侧 / 设计席裁**：

1. 🟡 `common.md:163`「archived pages stay out of the index」——归档排除取项目 `index.excludePaths`，默认空（`manifest-schema.mjs:63`），本仓才声明两条前缀（`PROJECT-MANIFEST.json:58`）；跨项目加载时该半句可能为假。
2. 🔵 `:159` 用「repository」度量 `grep` 检索面，而工具面度量一个路径、缺省 cwd（`tools/search.mjs:93` / `:104`）。
3. 🔵 `:159`「this project's documents」未体现声明范围门（`file-list.mjs:51-52`）。
4. 🔵 中文记录面字面（`doc_search 已查无` / `跨仓未纳入索引`）在 16 档提示词面 0 命中；需求档 `:880` / `:882` 的中文字形无载体（设计 K4 双语表未落）。

**修正轮：0**（无待修项）。**终态 = clean**。

### 实施轮（B1 P4 归档排除条件化 · 唯一改动 `common.md:163`）

**交付摘要**：按设计档 §6.43 修正轮（`PROMPT-SYSTEM.md:2572`）重落 `thincoder-core/prompts/common.md` 的 P4 段：归档排除由无条件形改条件形（批次档恒排除 · 归档页按项目声明 `index.excludePaths`），后果句由 `so such a hit` 收窄为 `so a hit in an excluded document`。lead / state / draft 三句与同节其余四段逐字未动。本席本轮唯一改动文件 = `thincoder-core/prompts/common.md`（1 行对 1 行替换 · 净 0 行）。

**改动依据（本席实读）**：

- `thincoder-core/declaration.mjs:144` 面⑥ 段序列对批次档**无条件**（同档 `:122` 注释「**无条件**——不看 `index.excludePaths` 是否配置」；`:124-125`「`docRoot.batches: null` ⇒ 约定段恒在（无逃生口）」）。
- `thincoder-core/declaration.mjs:146-148` 面① 前缀（归档类）排除读 `decl?.index?.excludePaths`，空表 ⇒ 恒 false；`thincoder-core/manifest-schema.mjs:63` `excludePaths: Object.freeze([])` 缺省空。
- ⇒ 原文 `batch records and archived pages stay out of the index` 把归档排除说成无条件机制 = 假事实；改后条件形与实读一致（本仓 `PROJECT-MANIFEST.json:57-60` 恰声明两条 `_archive`，条件形在本仓亦取真值）。

**落地读数（本席机判）**：

- **围栏全串相等**：`common.md:155-165` 与设计档 `:2564-2574` 11 行逐行全等 = `true`（2,915 字符 / 11 行）。
- **体量**：`common.md` = **304 行 / 49,173 字符**（改前 304 行 / 49,106 字符；Δ = +67 = 新 P4 745 − 旧 P4 678）。`##` 20 · `###` 6 · 标题节点 26。
- **A3 四串**：`a lead, not a finding` 1 · `batch records always stay out of the index` 1 · `archived pages wherever the project declares them excluded` 1 · `turns a past round's draft into this round's standard` 1（均在 `:163`）。
- **旧串清零**：`batch records and archived pages stay out of the index` 0 · `so such a hit` 0 · `whole tree` 0。
- **机检**：`node scripts/prompt-refs-check.mjs` = 提示词面 69 档 · 代码面 463 档 · **命中 0**。
- **doc_check**：`DOC-CHECK GATE: PASS`（显式 docs 0 档受检——`common.md` 不在 `checkConfig.scanDirs = ["docs"]`，门报「跳过 1 档」，与前落地轮同一边界；本档实检腿 = `prompt-refs-check`）。
- **diff**：`git diff --numstat` = `12 0`（相对 HEAD 含前轮整节插入；本笔为替换，净 0 行、+67 字符）。`git status` 中 `thincoder-core/prompts/` 仅 `common.md` 一项变更。

**读数口径说明（覆盖关系 · 本节内）**：本节前块（上一落地轮）记的 `46,256 → 49,106（+2,850）` 与 A3 旧串 `batch records and archived pages stay out of the index` **已被本轮取代**；现态权威读数 = 本块（304 行 / 49,173 字符 · A3 四串见上），与设计档 `:2581` / `:2620` / `:2630` / `:2639` 一致（§5 append-only，前块原文保留、不改写）。

**决策披露**：

- 出清单改动：**零**。本轮只碰 `common.md:163`；设计档 / 需求档 / 产品代码 / 其它提示词档 / `PROJECT-MANIFEST.json` 本席零笔。
- `git status` 其余已修改档（设计档 · 需求档 · CORE-UNIFICATION · DOC-DISCIPLINE · MENU · desktop / render-core / vscode 代码等）= 会话前既存改动，非本席笔。
- 设计措辞面未擅改：P4 逐字 = 设计围栏；评审给出的可选措辞建议只回父侧 / 设计席。

**审计与代码评审轮次（终态）**：

| 轮 | 面 | 结果 |
|---|---|---|
| 1 | 内部 explore 偏离审计 | 围栏全串 / 其余四段零改 / 旧串零残留 / `### Codebase exploration order` 零改 / 行数与标题计数全部 match；唯一 finding = §5 未追加本轮（即本块，已消） |
| 2 | 内部 advisor 代码评审 | `VERDICT: pass`（0 🔴 · 1 🟡 · 3 🔵） |

**评审 4 条 = 全落在记录面 / 设计措辞面，非实现偏离（P4 逐字不改 ⇒ 转父侧 / 设计席裁）**：

1. 🟡 `docs/batches/2026-10-22-doc-search-route.md` §5 旧读数 / 旧 A3 未随本轮更新 —— 本块即解法（追加块给现态读数，前块不改）。
2. 🔵 `common.md:163` 前提句 `The declared domain leaves process documents out` 仍是全称，而同语第二类（归档页）已条件化 ⇒ 可选：前提分别点名两类。
3. 🔵 `common.md:163` 段内理由 `a batch record can be dropped whole` 只对批次档成立，而收窄后的后果句覆盖「任意被排除的档」（含归档页）⇒ 可选：理由按类各写一句。
4. 🔵 设计档 A7（`:2634`）的 `doc_check` 腿对本档空转（档在声明域外）⇒ 可选：A7 记该边界，避免收口把「跳过」读成「已检」。

**修正轮：0**（无实施面待修项；2–4 属设计措辞 / 验收记录面）。**终态 = clean**。

## §6 验证与收口（父代理）

## 验证与收口

**链路**：设计 `#60` → 评审 `#61`（changes-required：🔴2 · 🟡4 · 🔵2）→ 修正 `#62` → 复核 `#63`（pass；新 2 项：需求档跨档滞后 🟡 + 坏坐标 🔵）→ 设计补正 `#66` → 实施 `#67` → 设计补正 `#69`（P4 改条件形）→ 重落 `#70`。

**父侧复跑（2026-10-22 10:34 · `node` 脚本逐串）**

| 判据 | 读数 | 判定 |
|---|---|---|
| A1–A5 / A8 判读串 | 18 条**各 1 次**；`index.publicRepos` **2 次** | ✅ |
| 零命中串 | `whole tree` · `batch records and archived pages stay out of the index` · `so such a hit` 各 **0** | ✅ |
| 禁令腔 | B1 段 `never|do not|don't|must not|may not|forbidden` = **0** | ✅ |
| 计数 | `##` **20**（不变）· `###` **6**（+1） | ✅ |
| 体量 | **304 行 / 49,173 字符**（与设计档 `:2639` 一致） | ✅ |
| `prompt-refs-check` | 命中 **0**（69 档 ∥ 463 档） | ✅ |

**收口轮处置**

1. **需求档 §13.19 验收 ①** 措辞收正：判**英文落地形**（`doc_search: none found`），不判中文字面（原「已查无」是需求侧的提法，非逐字要求）。
2. **需求档 `:885` 坏坐标修好**：`hincoder-core/…` → `` `thincoder-core/memory/docs.mjs:236-238` ``，并清掉游离制表符（评审 `#65` 🔵）。
3. **`PROMPT-SYSTEM.md` 口径**：`需求档本批改写 1 行（父侧笔 · 实施席面之外）`（`:2644`），L4 ∥ 受影响文件表的「零改 / ±0」限定为实施席面（`#66`）。

**接受但不修（🔵 ×3，理由在案）**

- P4 前提句 `The declared domain leaves process documents out` 仍是全称，同语第二类已条件化——**接受**：紧随其后的破折号分句立刻给出两类各自的边界（批次档恒排除 ∥ 归档按项目声明），读者不会误读；再拆一句会把一段变成三段，收益不抵。
- 段内理由 `a batch record can be dropped whole` 只对批次档成立——**接受**：该句是 P4 的 why，指向的是「过程档可整档删」中**唯一无条件**那一类；归档页不承担该理由。
- `A7` 的 `doc_check` 腿对 `common.md` 空转（该档不在 `doc_check` 的判域）——**已记为本批边界**：提示词面实检腿 = `prompt-refs-check`（命中 0），`doc_check` 的「跳过」不得读成「已检」。

**收口清单**：`doc_check` PASS（设计档 · 需求两档）· 暂缓批复核无 · 前批遗留无 · 用户文档面同步：无（提示词面，新会话生效）· 台账 `#1728` → **已核销** · 令牌链终消费 · 新债：`#1729`（`publicRepos` 待裁）。
