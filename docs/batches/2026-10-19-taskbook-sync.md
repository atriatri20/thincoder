# 2026-10-19 · taskbook-sync
> 六段 append-only，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 编制：主 agent · 2026-10-19 · 来源 = 用户令（2026-10-19 23:15「开批」）：批次档 §2（任务书）重述计数/判据，后批改设计后前批 §2 未随动；修 §2 只引不抄 + 设计变更传播 + 收口对账。
> 台账 = #1714（ENGINEERING-MODE · 归批）。前情 = 无（独立批）。
## §1 讨论（主 agent）
**状态行**：已收口 2026-10-19
<§1 模板占位：本批条目 / 关键判据 / 授权口径>

## 讨论记录

**现象（用户报告 · 2026-10-19 23:13）**：`D:\repos` 会话中 `#31` 在修 4 条，其中一条 — 较早批 `docs/batches/20261019-console-case-doc-views.md` §2 第 5 条仍写「`:1378` 自建表四张 → **五张**，补 `skip_combo`，与 §2.2 `:93`、C3 同一表集」；后一批 `docs/batches/20261019-console-docs-from-source.md` §2 加 `doc_all` 镜像，「自用库改**六张表**」「§5.1 C3 表集加 `doc_all`」。前批仍在途，**§2 未随动**——照前批 §2 收口，C3 的「恰好五张」等值断言会与设计的「六张」当场对不上。

**性质**：不是实现错，是**任务书（§2）里的陈旧口径**。抓到它靠的是 `#31` 的注意力，不是结构。

**提示词缺口（父侧实读坐标）**：
1. `persona-engineering.md:162`：任务书从「THIS batch's own documents（**batch record §2 / design doc**）」填——两源并列，**无优先级**；§2 与设计不一致时无判据。
2. `persona-engineering.md:168`：「ONE criterion source」只约束**派单任务书**（the dispatch）；§2 里重述的计数 / 判据不在射程内——§2 自己造了第二判据，设计一变就陈旧。
3. `discipline-engineering.md:188-189`：D7 收口清单有「counts」，但没有「§2 判据 / 计数 ↔ 当前设计档」这一项；跨批设计变更的传播也没有条款。
4. `persona-eng-designer.md:82-84`：三链同源检查只在**本批设计轮返工前**跑一次；后续批次改共享设计不重跑。

**本批范围（三条）**：
1. **§2 只引不抄**：任务书里的判据 / 计数按「设计档 §X / 需求档 §Y」引用，不重述数字；必须出现计数时（如验收等值断言），以引用单一权威节为准。
2. **设计变更传播**：设计变更落地点（修正轮落地 / 评审通过后的设计定稿）⇒ 扫在途批次中引用到被改节的 §2，**同轮**追加 §2 更正（append-only），或当日挂债；触发 = 设计变更落地（可观察）。
3. **收口对账**：D7 收口清单加一项「§2 判据 / 计数 ↔ 当前设计档：一致，或差异已记 §6」。

**为什么**：状态在活文档（设计档），过程在 §2；任务书若把活值抄成死值，后一批改设计就把前一批的任务书变成错的——收口按错的判据判，正确实现会被判红，或者旧口径被放过。

**不做**：不改批次档六段结构 · 不新增机械门 · 不改冻结档（新老划断）· 不改普通模式（另裁）· 不替换三链同源检查（只加第二个触发点）· 不改设计档。

**已确认**：用户 2026-10-19 23:15 逐字「开批」。

## §2 批次任务与设计（eng-designer）
**状态行**：✅ 设计完成 2026-10-19
<§2 模板占位：本批条目（覆盖） / 设计档落点 / 机制设计 / 受影响文件与测试覆盖 / 验收对照 / 关键决策 / 上抛项>

**覆盖的需求条目**：`docs/core/requirements/ENGINEERING-MODE-V2.md` §13.13（FR35）①–⑥ 全部覆盖——① §2 只引不抄 · ② 设计变更传播 · ③ D7 收口对账 · ④ 携 why / 无禁令腔 · ⑤ 零文档引用 + 体量 ≤ +3% · ⑥ 与既有条款逐句对照。台账 `#1714`。

**明确不在本批（边界）**：批次档六段结构 · 冻结档（新老划断）· 普通模式（另裁）· 机械门 / 工具 / 状态 · 需求档 · 产品代码 · `common.md` / `tool-docs` / 批次档骨架 · 既有在途 §2 的裸 `§N.M` 写法不回改（扫描按标题串兜底）。设计与理由 = 设计档 §6.37「边界」与 K5 / K8。

**设计档落点**：`docs/core/design/PROMPT-SYSTEM.md` §6.37（新增小节；三条规则单源 = 该节）——逐字英文块 A–E + 落点表 L1–L6 + 对照表 8 行 + 用例表 U1–U8 + 验收 A1–A8 + 扫描形态与误报 / 漏报边界 + K1–K8。

**机制设计（三条规则，文本见 §6.37 逐字块）**：
1. **§2 只引不抄**——判据 / 计数以 `design §N.M` / `requirements §N.M` 引用；字面值只在验收等值断言处出现，且作为该节陈述的值 + 引用紧贴。落点：`persona-eng-designer.md:53` 后（写 §2 的笔，块 E）∥ `persona-engineering.md:162`（两源优先级，块 A）∥ `:168`（单一判据源射程扩到任务书，块 B）。
2. **设计变更传播**——触发 = 设计变更落地（修正轮落地 / 评审通过后的设计定稿）；动作 = 父侧扫在途批次 §2 引用行 → 同轮派 designer 修正轮 append 更正（旧行不动）或当日挂债。落点：`persona-engineering.md:162` 后新 bullet（块 C）。责任面 = D1：扫描 / 派单父侧，§2 的笔 eng-designer；父侧代笔被 `batch` 段白名单机械拒（用例 U6）。
3. **收口对账**——D7 清单加一项「§2 判据 / 计数 ↔ 当前设计档：一致，或差异已记 §6」。落点：`discipline-engineering.md:188` 行内（块 D）。

**受影响文件与测试覆盖**：见 §6.37「受影响文件」表（`persona-engineering.md` 242 → 243 行 / 61,449 → 62,880 字符 · `discipline-engineering.md` 201 行 / 37,074 → 37,337 · `persona-eng-designer.md` 88 → 89 行 / 18,077 → 18,574 · 设计档本节）。零单测档（纯文本）；机判 = `node scripts/prompt-refs-check.mjs` + `doc_check` gate + §6.37 A1–A5 子串判据。

**验收对照**：§13.13 ①–⑥ → §6.37 A1–A6；派单 ②（三触发可观察）/ ③（designer 同落判定）→ A7 / A8。三条触发 = 写 §2 时 · 设计变更落地 · 批次收口。

**关键决策**：K1 规则 1 权威短句落 designer（父侧只留优先级 + 射程）· K2 传播落任务书节 · K3 对账落 D7 内 `counts` 之后 · K4 引用形态 `design §N.M` / `requirements §N.M` · K5 common / tool-docs / 骨架不落 · K6 更正 = append · K7 对账逃生面「差异已记 §6」· K8 批次档设计档零登记。理由逐条见 §6.37 K 表。

**设计轮零笔面**：`thincoder-core/prompts/**` 本设计轮零改（实施轮由 eng-coder 照 §6.37 落点表 L1–L5 落笔）；需求档 / 产品代码 / 普通模式面零触。

**上抛项**：无。

**验收 ⑥ 对照结论（本轮补记 · 2026-10-19）**：`design §6.37`「对照表（与既有各句逐句对照 · 结论 = 零矛盾）」八行逐句判读，结论 = **零矛盾**（依据 = 该表「为何不矛盾」列逐行）；本行即 §13.13 ⑥「对照结论记入批次档」的落点，A6 判法点名本行。

**本轮修正（父侧内容核验 · 2026-10-19 · 编号 → 改动 file:line）**：
1. 验收 ⑥ 结论句悬空 → 本段上方「验收 ⑥ 对照结论」行；A6 判法同步点名（`docs/core/design/PROMPT-SYSTEM.md` §6.37 A6 行）。
2. 块 B 引用形态补需求档形态 → `docs/core/design/PROMPT-SYSTEM.md` §6.37 块 B（`:1616`）：引用形态由 `design §N.M` 扩为 `design §N.M` / `requirements §N.M`；A1 子串随动（`persona-engineering.md` 内 `requirements §N.M` 1 次）；L2 增量 +352 → +374，改后 62,902 字符（≤ 63,292 上限）。
3. K8 归属改为登记 → `docs/core/design/BATCH-RECORD.md` §4.10（`:253-255`）新增「§2 段体内的引用形态约定」段（格式归属，回指 §6.37）；K8 理由同步改写（`PROMPT-SYSTEM.md` §6.37 K8 行）。

不变量：三条规则的判定 / 落点 / 触发点零改；`thincoder-core/prompts/**`、需求档、产品代码零笔。

**本轮修正（设计评审 #18 · 2026-10-19 · 编号 → 改动 file:line，五条八处）**：
1. 🟡 块 D 两端锚与 L4「之间插入」二义 → 取「整段替换」读法（块 D 逐字 `:1628` 不动，首尾即两端锚）：块 D 标题动作 `docs/core/design/PROMPT-SYSTEM.md:1625` 与 L4 `:1644` 改写为「整段替换现文 `counts / pointers`」；A3 `:1693` 补判据「该行内 `counts /` 与 `pointers` 各出现 1 次（两端锚重复即红）」。+263 字符读数在替换读法下复核成立：块 D 280 字符 − 现文 `counts / pointers` 17 字符 = 263，替换后 D7 行 420 字符、`counts /` 与 `pointers` 各 1 次。
2. 🟡 扫描片段以整档正文 `/已收口/` 过滤，与自述「在途按 §1 状态行判定」相左、漏前情指针含「已收口」的在途批 → 过滤改 §1 状态行判据 `/^\*\*状态行\*\*：[^\n]*已收口/m`（`:1580`）；边界表漏报行 `:1594` 同步写明该判据与「前情指针里的『已收口』字样不触发跳过」。实测（仓根跑改后片段，sec=6.37）：命中本批；旧过滤会跳过 8 个在途批（`2026-10-15-core-misc-closeout` · `2026-10-15-doc-ref-direction-cleanup.records` · `2026-10-15-doc-residue-fix` · `2026-10-16-unit-test-lifetime` · `2026-10-17-doccheck-stock-clean` · `2026-10-17-prompt-why-form` · `2026-10-19-taskbook-sync` · `2026-10-19-tech-todo-sweep`），新过滤只跳过 §1 状态行已收口的档（122 档全带状态行，零误滤）。
3. 🔵 偏离 ② 缺 why → `:1599` 并入缺口表半句：该括注（`batch record §2 / design doc`）本身就是缺口——两源并列、无优先级，纯追加会在原地留下一对无判据的并列源（缺口表第一行）。
4. 🔵 受影响文件表 `BATCH-RECORD.md` 行 → `:1682` 读数注明「登记段落地前实读；现盘 647 行 / 54,997 字符」（本席实测 `split("\n").length − 1` / `length`，= 643 + 4 行 / 54,753 + 244 字符）+「实施轮零触」，与 `PROMPT-SYSTEM.md` 行同形。
5. 🔵 A5 对块 E 补「落地行与本节块 E 逐字围栏块整行相等」判据（行首三空格缩进在内；只判字数时措辞微调仍可全绿），字数上限作附带读数 → `:1695`，对齐本档 §6.9 `:263` 口径。

不变量：三条规则的判定 / 落点 / 触发点零改；`thincoder-core/prompts/**`、需求档、产品代码零笔；本轮设计档改动 = 上列五条八处（`:1580` · `:1594` · `:1599` · `:1625` · `:1644` · `:1682` · `:1693` · `:1695`）。

## §3 设计评审（评审子代理）

### 轮次 1（评审子代理）

**评审对象**：PROMPT-SYSTEM.md §6.37（任务书陈旧口径 · FR35）· 设计轮 · 三档在评（PROMPT-SYSTEM.md ∥ requirements/ENGINEERING-MODE-V2.md ∥ design/BATCH-RECORD.md）。

**实测核对（本席实读）**：`persona-engineering.md:162` 括注 `(batch record §2 / design doc)` ∥ `:168` `the dispatch carries ONE criterion source` ∥ `discipline-engineering.md:188` D7 行含 `counts / … pointers` ∥ `persona-eng-designer.md:53` 后接 `Six-segment boundary` 行 ∥ `:82-84` 三链同源——四处坐标与设计所述一致；行数读数复核一致（persona 242 ∥ discipline 201 ∥ designer 88 内容行）；`BATCH-RECORD.md` §4.10 的「§2 段体内引用形态约定」登记段已在盘（`:253-255`，回指 §6.37），格式归属无主问题不存在；`PROJECT-MANIFEST.json:61` `publicRepos: []` 与勘察证据行相符。

| # | 类别 | 严重度 | 问题 | 建议 |
|---|---|---|---|---|
| 1 | 清晰度 | 🟡 | 块 D（`PROMPT-SYSTEM.md:1628`）的逐字块自带两端锚 `counts / **§2 ↔ design-doc reconciliation**` … `/ pointers`，而 L4（`:1644`）的动作用语是「插入块 D（`counts /` 与 `pointers` 之间）」——按字面插入会得到 `counts / counts / … / pointers / pointers` 的重复锚；A3（`:1693`）只判该子串「1 次」且「与 `7. **D7 settlement sync**` 同一行」，重复锚形仍全绿；+263 字符读数也只在「整段替换」读法下成立 | 把 L4 动作写成「以块 D 整体替换现文 `counts / pointers` 一段（块 D 首尾即两端锚）」或块 D 去掉两端锚只给中段；A3 补一条「`counts /` 与 `pointers` 在 D7 行各出现 1 次」 |
| 2 | 验收 / 可行性 | 🟡 | 扫描片段（`:1580`）以整档正文 `/已收口/.test(s)` 排除冻结档，与同节自述判据「『在途』按 §1 状态行判定」（`:1594`）相左；而新批 §1 通常带 `前情 = docs/batches/<旧档> §N（已收口 <日期>）` 指针（`requirements/ENGINEERING-MODE-V2.md:674`）⇒ FR35 背景里「较早批 §2 未随动」这一类典型在途批会被静默跳过，且该漏报类未登记进「扫描边界（误报 / 漏报）」表 | 过滤条件改为 §1 状态行（如 `/^\*\*状态行\*\*：[^\n]*已收口/m`），或在表内补一行「漏报 · 正文（含前情指针）出现『已收口』字样 / 以 §1 状态行复判」 |
| 3 | 最近先例 | 🔵 | 取法（`:1596`–`:1599`）中偏离 ① 带了理由（动作者是 designer），偏离 ② 只有陈述：「② `:162` 的括注改写为带优先级的句子，不是纯追加。」——为何不纯追加的理由在本节之上（缺口表 `:1557` 已把该括注指为缺口本身），未随偏离句成文 | 把缺口表那一句（该括注即「两源并列无优先级」的所在）并进偏离 ② 的理由位，使偏离自带 why |
| 4 | 受影响文件 | 🔵 | `:1674` 表头声明「现行行数 / 字符数 … 实读」，但 `BATCH-RECORD.md` 行（`:1682`）的 `643 行 / 54,753 字符（2026-10-19 本席实读）` 是登记段落地**前**读数（磁盘现为 647 内容行 = 643 + 4），且该行未带 `PROMPT-SYSTEM.md` 行有的「实施轮零触」标记 ⇒ 实施席有把 +4 行当本轮待办之虞 | 该行读数注明「登记段落地前实读」并补「实施轮零触」，与 `PROMPT-SYSTEM.md` 行同形 |
| 5 | 验收 | 🔵 | `persona-eng-designer.md` 预算余量仅 45 字符（`:1680`「改后 18,574 ≤ 18,619（+3% 上限，余量 45 字符）」），而 A5（`:1695`）只判「字符数 ≤ 预算」、A1 对块 E 只判三个片段 ⇒ 措辞微调的落地仍可全绿（与本档 §6.9 `:263`「内容判据 = 落地行与英文逐字围栏块整行相等」的口径不一致） | A5 对块 E 补「落地行与逐字块整行相等」判据，字数上限只作附带读数 |

**计数**：🔴 0 · 🟡 2 · 🔵 3。

**限制说明**：本次评审上下文未提供项目 Document Map（`PROJECT-MANIFEST.json` 的 `advisor.docMap` 为空串），文档归属按本档 §1/§5 指针与 `BATCH-RECORD.md` §4.10 的格式归属面判；项目标准档未声明，方法论合规按 AGENTS.md 与本档既有先例形判。

VERDICT: pass

## §4 用户批准（主 agent）

## 用户批准

**批准依据（批级放行，覆盖批准门）**：用户 2026-10-19 23:26 逐字「**自动跑完**」+ 23:29「这条纪律有问题啊！**应该是要能够自动跑完的。**」

- 第一条 = 本批（及在办批）的批级放行；第二条 = 用户对「整批令不豁免批准门」旧条的裁定推翻——批内全链自动跑完，评审照走。
- 按此口径：本批设计评审 #18 pass（🔴0/🟡2/🔵3）→ 修正轮 #19 五条全 Fixed → 父侧核验 → **直接实施**（未再停批准门）。
- 本批评审链完整：设计 → 评审 → 修正 → 核验 → 实施 → 收口；无跳步。

## §5 实施记录（eng-coder）

**状态行**：✅ 实施完成 2026-10-19

**落点（L1–L5 · 逐字命中读数 · 本席实测）**：

| # | 坐标（落盘后） | 动作 | 逐字判据 | 读数 |
|---|---|---|---|---|
| L1 | `thincoder-core/prompts/persona-engineering.md:162` | 整行替换（块 A） | 与 `PROMPT-SYSTEM.md:1610` 围栏块整行相等 | true · 全档出现 1 次 |
| L2 | 同档 `:169` 行尾（原 `:168`，由 L3 的 +1 行位移） | 同行追加块 B（±0 行） | 行尾与 `:1616` 块整行相等（含行首单空格） | true · 出现 1 次 |
| L3 | 同档 `:163` | 新增 bullet（块 C；`Six-segment` 同类列表内，`:162` 后 / `:164` 前，无空行） | 与 `:1622` 块整行相等 | true · 出现 1 次 |
| L4 | `thincoder-core/prompts/discipline-engineering.md:188` | 以块 D 整段替换现文 `counts / pointers`（首尾即两端锚） | 与 `:1628` 块整行相等 | true · 出现 1 次 |
| L5 | `thincoder-core/prompts/persona-eng-designer.md:54` | 新增行（块 E；三空格缩进；`:55` = `Six-segment boundary`） | 与 `:1634` 块整行相等（含三空格） | true · 出现 1 次 |

**A3（D7 两端锚）**：`discipline:188` 行首即 `7. **D7 settlement sync**`（同行）；该行内 `counts /` 1 次 · `pointers` 1 次 · `counts / **§2 ↔ design-doc reconciliation**` 1 次（两端锚零重复）。

**A4（携 why · 无禁令腔）**：五块扫 `never|do not|don't|must not|may not|forbidden` = 0；why 子句逐块在位：A `A number restated in §2 stays alive only until the next design change falsifies it` · B `a criterion or count written into batch record §2 as its own text is that second criterion` · C `a correction left unbooked is one nobody comes back to make` · D `judging closeout by a stale §2 is what turns a correct implementation red` · E `closeout fails correct work by a stale criterion`。

**A5（零文档引用 · 体量）**：仓根 `node scripts/prompt-refs-check.mjs` = `汇总：提示词面 69 档 · 代码面 463 档 · 命中 0` / `OK(prompt-refs): J1/J2/J3 三式零命中`。体量实测（`split("\n").length − 1` / `length`）：persona 243 行 / 62,902 字符（≤ 63,292）· discipline 201 行 / 37,337 字符（≤ 38,186）· designer 89 行 / 18,574 字符（≤ 18,619）。

**Δ 反算（证明本轮只加不改他处）**：把五处在内存里撤销重建改前态 ⇒ persona 242 行 / 61,449 字符 · discipline 201 / 37,074 · designer 88 / 18,077——与任务书基线逐值相等；正向 Δ = +1 行 / +1,453 字符 ∥ ±0 / +263 ∥ +1 / +497，与 §6.37 受影响文件表（`:1678-1680`）逐值相等。

**零改核对**：本轮五次写工具调用全部落在三档；三档 mtime = 15:32:53 / 15:32:57 / 15:33:00，其余工作树改动（`common.md` 00:59:49 · `tool-docs/subagent.md` 14:28:31 · 设计档 15:31:16 · 需求档 15:31:01 · `BATCH-RECORD.md` 15:21:13 等）均早于本轮首笔。`git status` 读数 = 14 改 + 7 未跟踪；其中除三档外的 11 改 + 7 未跟踪均为既有在途批未提交改动（mtime 证据见上），本轮增量仅三档。`common.md` / `tool-docs` / 批次档骨架 / 需求档 / 产品代码零笔；`(batch record §2 / design doc)` 旧括注全档残留 0。

**修正轮（内部 · 1 次）**：L3 首笔以行首前缀为锚，插入点落入句中（块 C 嵌进块 A 句子中段）⇒ 当笔按行号区间整体重写 `:162-163` 为「块 A 整行 + 块 C 整行」；复核 = 两行与围栏块整行相等。

**交付协议读数**：内部分歧审计（explore · 阻断）= CLEAN（五处匹配 / 整行相等 true / divergence: none）；内部代码评审（advisor · code）= pass（🔴 0 · 🟡 1 · 🔵 3）。🟡「§5 空、落笔席未记」由本段闭合（落笔席 = 本席 eng-coder；五处坐标与读数即本段）；三条 🔵 落在 §2 与设计档（designer 笔，非本席可改）⇒ 报告父侧：① §2 `:47` 的 `62,880` 与 `:61` 的 `62,902` 并列（同一测量的两个活值）；② §2 `:51`「K8 批次档设计档零登记」与 `:62`「K8 归属改为登记」并列；③ 设计档 `:1642` L2 坐标 `:168` 在 L3 插入后实位为 `:169`。终态 = clean（实现面零偏离；未落地项 = 上述三条他人笔面）。

**doc_check 门**：`DOC-CHECK GATE: PASS（0 档）`——三档不在声明域（`checkConfig.scanDirs` 只含 `docs`），门按 0 档判过；范围如实记。

**零单测档**：纯文本改动、无分支；机判 = 上述 prompt-refs-check + 逐字相等 + 体量，不新增常驻断言。

## §6 验证与收口（父代理）

## 验证与收口

**交付核验（父侧实读 + 复跑 · 2026-10-19 23:38）**

- **L1** `persona-engineering.md:162`：块 A 整行替换（`the design doc is the criterion source of record` 1 次；旧括注消失）；**L2** `:169` 行尾块 B（`The same reach extends to the task book itself` 1 次）；**L3** `:163` 块 C（`A landed design change propagates` 1 次）。
- **L4** `discipline-engineering.md:188`：块 D 整段替换——该行 `counts /` 1 次 · `pointers` 1 次 · `§2 ↔ design-doc reconciliation` 1 次；行首 = `7. **D7 settlement sync**`（同行成立）。
- **L5** `persona-eng-designer.md:54`：块 E 三空格缩进行，整行相等。
- **体量实测**：persona **243 行 / 62,902**（≤ 63,292）· discipline **201 / 37,337**（≤ 38,186）· designer **89 / 18,574**（≤ 18,619，余量 45）。
- **机检（父侧复跑）**：`prompt-refs-check` ⇒ 提示词面 69 档 · 代码面 463 档 · **命中 0**。
- **零改**：`common.md` / `tool-docs` / 骨架 / 需求档 / 产品代码零笔；本轮增量仅三档（其余工作树改动早于本轮首笔，非本笔）。

**验收勾销（A1–A8）**

| # | 判据 | 读数 | 判定 |
|---|---|---|---|
| A1 | 只引不抄句（两档分判） | persona `the design doc is the criterion source of record` 1 · `§2 is a dispatch surface that cites it` 1 · `The same reach…` 1；designer `§2 cites rather than transcribes` 1 · `citation beside it` 1 | ✅ |
| A2 | 传播句（触发 / 扫描 / 同轮更正 / 挂债） | `A landed design change propagates` 1 · `scan the in-flight batch records` 1 · `append a §2 correction` 1 · `book the day's debt` 1 | ✅ |
| A3 | D7 对账项 + 两端锚各 1 | `:188` 行内 `counts /` 1 · `pointers` 1 · `§2 ↔ design-doc reconciliation` 1；与 D7 同行 | ✅ |
| A4 | 携 why、无禁令腔 | 五块禁令词扫描 0；五条 why 逐块在位 | ✅ |
| A5 | 零文档引用 · 体量 ≤ +3% | refs 0；62,902 ≤ 63,292 · 37,337 ≤ 38,186 · 18,574 ≤ 18,619（块 E 整行相等） | ✅ |
| A6 | 对照无矛盾 + 结论落批次档 | 对照表 8 行 = 零矛盾；结论行 = 本批 §2「验收 ⑥ 对照结论（本轮补记）」 | ✅ |
| A7 | 三条触发可观察 | 写 §2 时 / 设计变更落地 / 批次收口 | ✅ |
| A8 | designer 同落判定 | 落（块 E，K1 理由） | ✅ |

**上抛处置（实施席三条 · 父侧裁定）**：① §2 `:47` 的 62,880 与 `:61` 的 62,902 并存——后者为修正轮追加行（K6 更正形），**现行读数以 §5 / 本节实测为准**（62,902 / 37,337 / 18,574）；② §2 `:51`「K8 零登记」与 `:62`「K8 改为登记」互斥——同属 K6 追加形，`:62` 为现行口径（`BATCH-RECORD.md:253-255` 登记段在盘）；③ 设计档 L2 坐标 `:168` 在 L3 插入后实位 `:169`——执行时点正确，作审计表时以本条为实位备注。三条均为记录面读数，不改任何判据。

**收口清单**

- doc_check 交付门（close 触发）：PASS（close 回执确认）。
- 暂缓批复核：无。
- 前批遗留横核：无（本批独立）。
- 用户文档面同步：无用户文档面变更。
- 台账：`#1714` 在途 → 待核销 → **已核销**（证据 = 本节 + §5 + 三档坐标）。
- 设计令牌：链终消费。
- 新债：无新增。
