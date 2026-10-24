# 2026-10-18 · prompt-single-face
> 六段 append-only，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 编制：主 agent · 2026-10-18 · 来源 = 用户 2026-10-18 22:52「我现在觉得提示词这里可能是个不太符合模型本能的设定，你似乎永远把所有的.md都是视为文档而非代码」+ 22:55「我还有另外一个想法，取消中文版，只保留一份。你觉得会不会更合理一些？」+ 23:00「我的想法是取消中文的镜像」+ 23:00「开」。父侧判断：双份镜像已实证漂移（`#13` 抓出 EN 缺 F1/F2/§1 段尾三条，CN 有而 EN 无）；且「CN = 设计文档 ∥ EN = 代码」这条规则**靠路径表达、模型感知不到**，今晚四次踩坑（父侧直改 EN 判越权 · 设计师反复声明白己的笔域 · EN 翻译被当成"文件不急" · 判据 A 落 CN 而 EN 未落）。。
> 台账 = #1682（core · 归批）。前情 = 无（独立批）。
## §1 讨论（主 agent）
**状态行**：已收口 2026-10-18
<§1 模板占位：本批条目 / 关键判据 / 授权口径>

### 讨论收敛（父侧）

**用户令（逐字）**：22:52「我现在觉得提示词这里可能是个不太符合模型本能的设定，你似乎永远把所有的.md都是视为文档而非代码」∥ 22:55「我还有另外一个想法，取消中文版，只保留一份。你觉得会不会更合理一些？」∥ 23:00「我的想法是取消中文的镜像」∥ 23:00「开」。

**父侧结论：同意「取消中文镜像」**，但把口径说死——**取消的是「中文提示词镜像」，不是「中文」**：中文**机制文档**（`AGENT-LOOP.md` / `BATCH-RECORD.md` / `DOC-DISCIPLINE.md` / `LIGHT-CHANNEL.md` 等）**必须保留**，那才是人读的规格。

**实证依据（三条，都来自身认读与今晚的实战）**：

| # | 事实 | 来源 |
|---|---|---|
| 1 | 16 对镜像一一对应：CN 1476 行 · EN 1495 行，文件名零差异 | 父侧实读（22:55） |
| 2 | **已经漂了**：EN 缺三条判据（F1 判空口径 ∥ F2 单行理由 ∥ 追记行未点 `§1`），CN 有而 EN 无 | `eng-coder#13` 复核轮（今晚） |
| 3 | **规则靠路径表达**：两侧文件头同为 HTML 注释 + markdown 同构，唯一区别是目录与语言 ⇒ 模型感知不到「这是代码」 | 父侧实读（22:52） |

**今晚因这条规则踩的四个坑（同一病根）**：① 父侧直改 EN 被判「笔域越权」；② 设计师反复声明「EN 不是我的笔」；③ EN 翻译被我推到「另开一批」；④ 判据 A 落在 CN 而 EN 未落 ⇒ 规则在生产不存在。

**目标态**：

```
① 中文机制文档（人读规格，权威）→ 描述规则与理由
② 英文提示词（唯一副本，= 代码）→ 实现那套规则
```

**顺序硬约束**：**先补齐 EN（含 out-of-scope 批待译的 7 档）→ 再删 CN**。先删会把「EN 还没译完」的那部分源头一起删掉。

**五步（父侧定形，设计席细化）**：

| 步 | 动作 |
|---|---|
| 1 | **16 对镜像逐档对账**——列出「CN 有、EN 无」（及反向），产出合并清单 |
| 2 | out-of-scope 批的 EN 翻译落地（EN 成为完整副本）——**该批 §5，本批不代做** |
| 3 | 删 CN 镜像 16 档（git 留历史，不建 `_archive`——一次性副本无存档价值） |
| 4 | 改陈述双份制的文档：`PROMPT-SYSTEM.md` §8 · `ENGINEERING-MODE-V2.md` §8.4 · 需求档 `PROMPT-SYSTEM.md` §2.5 · `DOC-SYSTEM.md` §10.3 · D1 写权矩阵相关句 |
| 5 | 引用清扫：全仓 grep `docs/core/design/prompts/`，指针删或改指机制文档 |

**连带判定（须用户确认，见 §2）**：双笔域（CN = eng-designer ∥ EN = eng-coder）随之收敛为**单笔域**——提示词 = 产品代码 ⇒ 归 eng-coder；父侧改提示词从此不再是「越权」，而是「改产品代码，走 coder」。

**风险（父侧如实登记）**：用户将**读不到提示词原文**（只剩英文）⇒ 规则对不对只能靠**中文机制文档**判断。**因此本批硬要求**：机制文档必须真的承载每条规则，不许出现「规则只活在提示词里、机制文档没写」。今晚已有反例（判据 A 在提示词里，机制文档无对应句）。

### 用户裁定（2026-10-18 23:01 · 笔域 = 判据 A）

用户逐字：「**第四步那个认。**」——认第 4 步的连带判定（提示词归 eng-coder 单笔域）。

**裁定内容（本节为权威）**：

| # | 判 |
|---|---|
| 1 | **提示词 = 产品代码**（EN 唯一副本）⇒ **单笔域 = eng-coder**。父侧不再直接改提示词——改就走 coder，哪怕一行。 |
| 2 | **「笔域越权」这个概念作废**——取消镜像后不再有第二支笔，也就不存在"越权"。（今晚 `#1671` 那次 EN 直改判越权，是双笔域下的产物；该判据随本批一并退场。） |
| 3 | **设计师不再写任何提示词**——CN 镜像删除后，其"中文设计文档提示词 = 设计轮直落"的写域条随之作废；设计师的笔 = 机制文档 + 批次档 §2。 |
| 4 | **新变更的路子**：改规则 → 先改**中文机制文档**（人读规格，设计师笔）→ coder 依它改 EN 提示词（代码）。**不再有"先 CN 提示词再翻译"这一步。** |

**存量过渡（两处，说清以免混乱）**：

- **CN 镜像在删除前不再承接任何新改动**（它已被判定要删；往要删的副本上落笔 = 白干）。
- **out-of-scope 批的 EN 翻译（7 档）照旧由该批 §5 的 eng-coder 做**——它译的是"把 CN 定稿搬进 EN"，属于删除前的补齐，不是新增双份。

**连带影响（父侧须自查）**：我（父侧）此后**不再直接编辑 `thincoder-core/prompts/**`**；今晚那种"顺手补一句英文"的动作，按新判定属违规。

### 父侧裁定（2026-10-18 23:08 · 对 `eng-designer#25` 两条待裁）

**U1 · 范围外发现记不记 ⇒ 按判据 A，不采纳「按面分层」**

- **裁定**：范围外发现 = **不写进报告**（判据 A，用户 22:25 裁）。**不采纳**设计席提的「报告面列、台账面只入范围内、不报到用户面前」——那是**新语义**，且与 A 的正面表述相反。
- **依据**：用户 22:25 原裁定「范围外不看 / 不记 / 不报 / 不动手，唯一例外 = 挡住当前任务」。CN 面已按此定稿（`persona-eng-designer:24`–`:28` ∥ `discipline-engineering:88`–`:89` ∥ `discipline-normal:128`–`:129` ∥ 评审四档 `:9`）。
- **EN 的相反句不是"另一种设计"，是待修的旧规矩**——`eng-coder#26` 正在按 CN 定稿翻译（out-of-scope 批 §5）。**本裁定与 `#26` 同向，不冲突。**
- **对账影响**：CN 独有 46 条中「范围外不记录」一族（4 组相抵）**按 CN 为准**，EN 向 CN 对齐；designer 不必再等这一条。

**U2 · D7「变更记录」项与 D8 相抵 ⇒ D8 胜，D7 该项删**

- **裁定**：用户 2026-10-15 裁定「需求 / 设计档**不承载任何历史**，历史只在 git」⇒ D8 胜。D7 的「变更记录」项属**失效表达**，按「失效即删」处置（不留「原 X」对照）。
- **依据**：`docs/core/design/DOC-DISCIPLINE.md` D8 + 用户 2026-10-15 裁定；D7 该项是 D8 生效前的残留。
- **落笔**：本批 R2（机制档补条）时由设计席删该项；**不要**补进 EN。

**U3 · 待译坐标不实（知会转更正）**

- 父侧给的 `advisor-{design,round1,round2,round3}.md:8` 实测是**英文**；真未译面 = `advisor-design:34` ∥ `round2:44`–`46` ∥ `round3:40`–`42` ∥ `persona-eng-coder:22`·`26`·`29`·`33`–`38`。该组坐标来自 out-of-scope 批表 B，**已同步更正给 `#26`**。

### 父侧补正（2026-10-18 23:21 · 行数读数收口）

**§1 讨论表第 1 行原记「CN 1476 行 · EN 1495 行」——作废，以 §2.3 为准**：`CN 1475 · EN 1505`（`split('\n').length - 1` 口径 · 16 档加总 · 父侧新进程直跑复测）。

**为什么有三套读数**（如实记，供以后别重犯）：① §1 = 22:55 父侧按 `Get-Content` 计数（含尾行口径）；② §2.3 初版 = 逐档读数的混合口径加总（部分 EN 行是翻译前读数）；③ 现盘实测 = 单一口径。**三种数都"看起来对"，只有第三种可引用**——这正是 `advisor#27` 第 12 条要抓的东西。

**父侧独立核对 §2.3 逐档表**（自己算，不信转述）：

```
CN 加总 = 1475 ✓    EN 加总 = 1505 ✓
CN 独有 = 46 ✓      EN 独有 = 29 ✓      语义相抵 = 21 ✓
```

与合计行、与实测、与三组差异计数**四处全等**。

## §2 批次任务与设计（eng-designer）
**状态行**：设计完成 2026-10-18（修正轮：advisor#27 12 条全收并逐条落档（A21/A22 补入、§2.3 单口径复测 1475/1505、U1/U2/U3 已裁、AC8/AC9 在册）；无待裁项）
<§2 模板占位：本批条目（覆盖） / 设计档落点 / 机制设计 / 受影响文件与测试覆盖 / 验收对照 / 关键决策 / 上抛项>

### 2.1 本批口径（承接 §1，不重述）

取消**中文提示词镜像**（`docs/core/design/prompts/` 16 档）；中文**机制文档**保留并成为规则的人读权威；EN（`thincoder-core/prompts/`）成为**唯一**提示词副本 = 产品代码。次序硬约束 = 先补齐 EN → 再删 CN。判据 A 已由用户 23:01 裁定（单笔域 = eng-coder；「笔域越权」概念作废；设计师笔域 = 机制文档 + 批次档 §2；新变更路子 = 改规则 → 先改中文机制文档 → coder 依它改 EN）。

**本批 = 判定批**：本批只出判定（逐档对账 / 陈述清单 / 轮序 / 引用清扫清单），**实施面 = R1–R6 各自批**（§2.9）；本批不写代码、不改机制文档、不删档。**§5 / §6 的落形**：§5 = 一行「无实施动作（判定批——实施面见 R1–R6）」；§6 = 收口核（§2 与 §3 / §4 齐备 + 移交入口 = §2.9 六轮表）。

### 2.2 设计正文落点（写面说明——为什么不在本批改 PROMPT-SYSTEM.md §8）

本批是**结构改判**，而改判的执行面（§8 的流程、D-PS1、D-C14、D1 矩阵）都住在机制文档里。按本批禁令「机制文档先列清单、改是下一轮」，设计正文落本节；**逐处现文 → 改后**在 §2.6 给全，批准后由下一轮整批落笔。理由：现在动 §8 就等于提前执行了还没批准的改判，评审对象会先于裁定改变。

代价如实登记：本节属过程档（可整体清理），故 §2.6 的改后文本在下一轮落笔前是**唯一副本**——下一轮必须以本节为输入，落笔完成才可清理本节。

### 2.3 16 对逐档对账（总表）

口径 = **规则级差异**（段落 / 条目 / 判据句）。纯译法差异、表格↔列表改写、空白行差、示例行长短不记。**行数口径 = `split('\n').length - 1`，2026-10-18 23:16 新进程直跑实测：CN 1475 行 · EN 1505 行**；标题数 `^#{1,6} ` 逐档计数 16 对全等（同次实测）。**行数唯一读数 = 本表**（§2.11 合计同此）；§1 表第 1 行的行数读数已由本表取代（§1 为他人笔，改指动作归主 agent）。

| # | 档 | CN 行 / EN 行 | CN 独有 | EN 独有 | 语义相抵 | 判读 |
|---|---|---|---|---|---|---|
| 1 | advisor-design | 76 / 76 | 2 | 1 | 0 | 边界条两侧各写一套（见 2.4 · 9）；EN:34 主体仍为中文（未译面） |
| 2 | advisor-round1 | 71 / 62 | 1 | 1 | 0 | 同边界条；行数差 = 子项内联，非丢内容 |
| 3 | advisor-round2 | 66 / 64 | 1 | 1 | 0 | 同边界条；EN:44-46 整节仍为中文（未译面） |
| 4 | advisor-round3 | 63 / 60 | 2 | 1 | 0 | 同边界条；EN:40-42 整节仍为中文（未译面） |
| 5 | common | 223 / 269 | 6 | 9 | 2 | 主漂移 = 引证适用范围收窄（2.4 · 10） |
| 6 | consult-base | 23 / 25 | 1 | 5 | 1 | 无规则级差异，可整档由 EN 承载 |
| 7 | discipline-engineering | 207 / 198 | 19 | 2 | 10 | **最重缺口**：CN 5–14 整块 EN 无，且 EN:4 与 CN:7 语义相反 |
| 8 | discipline-normal | 258 / 263 | 7 | 1 | 3 | 范围外发现口径（U1 已裁：CN 为准，EN 已落） |
| 9 | persona-coder | 17 / 20 | 0 | 4 | 0 | EN 领先 2 句（父侧看不到上下文 / 你是实现者） |
| 10 | persona-eng-coder | 38 / 38 | 0 | 2 | 0 | 无 CN 独有；EN:22/26/29/33-38 仍为中文（未译面） |
| 11 | persona-eng-designer | 88 / 88 | 1 | 0 | 3 | 笔域命名 + 范围外发现 + 变更记录（2.4 · 13/14） |
| 12 | persona-engineering | 248 / 236 | 5 | 2 | 0 | **CN 207–213「判据 A」整块 EN 无**（2.4 · 3） |
| 13 | persona-explore | 14 / 14 | 0 | 0 | 0 | 无差异 |
| 14 | persona-normal | 43 / 49 | 1 | 0 | 1 | 「四列表」弱项；其余为理由句增补 |
| 15 | persona-plan | 25 / 26 | 0 | 0 | 1 | 只读禁令 → 后果描述 + 显式授权上网 |
| 16 | subagent-base | 15 / 17 | 0 | 0 | 0 | 无差异（行数差 = 折行） |
| — | **合计** | **1475 / 1505** | **46** | **29** | **21** | 共 96 行差异；CN 独有 46 条（`split('\n').length - 1` 口径实测，2026-10-18 23:16） |

**EN 独有 29 条的判读**：绝大多数 EN 是**增补方**（理由句、表格参数细节、溯源日期），CN 没有不是缺失，删 CN 不丢规则。其中三条有规则力：`persona-coder` 两身份句、`persona-eng-coder`:20「pen-domain discipline outranks going green」、`persona-engineering`:211-212 写域/调度元数据增补——这三条**已在 EN**，删 CN 无风险。

**结论（对「能不能删」的直接回答）**：**不能按现状删**。46 条 CN 独有里有 **15 条承载规则**（其余为理由句 / 用户原话 / 措辞），其中 4 组与 EN **语义相反**——U1 已裁「以 CN 为准，EN 向 CN 对齐」。EN 侧另有 **7 处**中文未译（E1 的 3 处 + E2 的 4 处——§2.5），删 CN 后这些段落在仓里只剩中文。

### 2.4 删 CN 前必须先处置的 CN 独有项（逐条，按危险度排序）

摘录逐字；「归属」= 建议落点（最终由父侧裁）。

| # | 档·行 | CN 逐字摘录 | EN 现状 | 归属 / 处置建议 |
|---|---|---|---|---|
| 1 | discipline-engineering 7–14 | 「**三样要写文档**：需求档、设计档、**集成测试（= UAT · 用户验收测试）的文档**……**判据 = 谁验收谁**……**驻留约定**……**UAT 文档形态 = 一份总表，记录着结果，住测试目录**……**用途 = 收款凭证**……**命名 = RTM**……**验收标准不是独立一层，而是一个用例内的段落**」 | EN 无对应段；EN:4 写「**Two steps write docs (requirements / design)**」——**与 CN 相反** | 机制文档已承载（`design/TESTING.md` §11 · `requirements/TESTING.md` §7 F29/F30/F32/F33）⇒ **EN 向机制文档对齐**（改「Two steps」为三样）；CN 的 why 段（用户原话）按需摘译入 EN |
| 2 | discipline-engineering 195（D7） | 「核销同步清单（批次档 §6）：角色表 / 状态行 / 计数 / 指针 / **变更记录** / 待办勾销 / **修正轮落地前置** / **搁置清单回核** / **暂缓批复核**（无…记「无」一行）/ **用户文档面同拍**（含「无」一行）/ 台账可见面」 | EN:185-186 只列 6 项：丢「变更记录 / 修正轮落地前置 / 搁置清单回核 / 暂缓批复核（含「无」行）/ 用户文档面同拍」 | 机制文档已承载（`DOC-DISCIPLINE.md` D7 行 :21 · `BATCH-RECORD.md` §5.3 :528-532）⇒ **EN 补齐 5 项**（D7 的「变更记录」项须按 D8 一并裁：设计档不留变更记录 ⇒ 清单项可能应删而非补） |
| 3 | persona-engineering 207–213 | 「**发现的入账范围（判据 A · 主 agent 版）**」整块 4 条：范围 = 任务书 · 「发现」= 验证过的 · 唯一例外（挡住或推翻当前任务）· 与「已批准设计范围」不同轴 | **EN 全档零对应**（`grep 范围外\|范围内\|入账` 零命中） | **机制文档无对应**（全仓 `判据 A` 只命中提示词）⇒ **须先补进机制文档**，再定 EN 句。这是 §1 点名的硬前置 |
| 4 | discipline-engineering 88 / 160 · discipline-normal 128 · persona-eng-designer 24-25 | 「**范围外的不记录**：……⇒ 不写进报告、不入台账、不上报、不动手……**唯一例外**：它挡住或推翻当前任务」 | **已裁（U1 = 判据 A）**：EN 三处**已落 CN 形态**——`discipline-engineering` EN:73–74 ∥ `discipline-normal` EN:130–131 ∥ `persona-eng-designer` EN:25–26，逐字 =「Out-of-scope items are not recorded … not written into the report, not booked to the ledger, not reported upward, not acted on」（out-of-scope 批 §5 翻译在途已落这三处） | **按 U1：以 CN 为准，EN 已对齐**——本批不改；R1 只核这三处与 CN 定稿等值 |
| 5 | discipline-engineering 89 · discipline-normal 129 · persona-eng-designer 26 | 「**「发现」= 验证过的**：没跑过、没顺过完整调用路径的观察不是发现，是猜测——不写进报告、不入台账；写进报告的发现须带**读数**或**可复现路径**」 | EN 全无对应句 | 机制文档无 ⇒ **须补机制文档**（与 #3 同族，可合并为「发现纪律」节） |
| 6 | discipline-engineering 192（D4 射程） | 「**射程 = 指针**……**实施坐标** · **盘点 as-of 读数** · **评审证据引文**各归其面，不在本条射程内」 | EN:182 只剩「pointer form = `doc:section` (line numbers only as as-of reference)」 | 机制文档已承载（`requirements/ENGINEERING-MODE-V2.md` D4 :605）⇒ **EN 补两类豁免句** |
| 7 | discipline-engineering 151 / 156 | 「**缺的层必须补齐**：**本轮工作需要而缺失**的文档层就地补建……顺带看到、不挡当前工作 = 范围外」「写面按仓切分，一轮一仓一档」 | EN:137 / :142 只剩半句 | 机制文档已承载（`DOC-DISCIPLINE.md` §自持族）⇒ EN 补限定半句，或删 EN 该句改指机制文档 |
| 8 | discipline-engineering 5 | 「**本组规则 = 早期由 agent 自加（非用户习惯）**——须能答「靠哪个结构、值不值」……**前提一变即重新过堂**」 | EN 无 | 机制文档无 ⇒ 建议**补进机制文档**（否则「规则要重新过堂」这条自省义务消失） |
| 9 | advisor-{design,round1,round2,round3} 9 | 「范围外不看；**挡住判断**才上报（属「任务受阻」，不是发现）」 | **已裁（U1 = 判据 A）**：四档 EN:8 现逐字 =「Out-of-scope: not looked at; report it only when it **blocks the judgment** — that is the **task being blocked**, not a finding」——与 CN 同向（已落） | **本批不改**；R1 核四档 EN:8 与 CN 等值即可 |
| 10 | common 49 | 「模型读到的任何文本（**提示词档 · 工具说明 · schema 文本 · 回给模型的串**）里不出现**引证**（档名 / 节号 / **指路句**）」 | EN:55 只提「a doc name or section number」——**适用范围与「指路句」收窄** | 机制文档部分承载（`DOC-DISCIPLINE.md` 指针纪律）⇒ **EN 补列举与「指路句」** |
| 11 | common 9 | 「少用括号（**不套括号**）」 | EN:10 只给理由「nesting buries the main clause」，**无禁令** | EN 补半句（低成本） |
| 12 | common 76 | 「（约定 · 系统形状 = **父队列深度 1**）」 | EN:91 只写「第二条会被拒」，无「深度 1」 | EN 补机制事实；或改指机制文档（`AGENT-LOOP-UPSTREAM.md`） |
| 13 | persona-eng-designer 6 · 14-15 | 「英文提示词 = 代码；**中文设计文档 = 设计文档**」「**你的提示词笔域 = 中文设计文档**」「写域 = ……+ **中文设计文档提示词（设计轮直落）**」 | EN:6/14-15 为「Chinese review face / English runtime face」 | **本批裁定直接作废此二式等式**（判据 A.3）⇒ 不补 EN 现状句，按 2.6 #2 改写 |
| 14 | persona-eng-designer 80 | 「**变更记录**：一行注记（日期 + 变更点）……实现后验收勾销落批次档 §6」 | EN:78「a design/requirement doc carries the **current state only**……changelog 是最大注入污染源」 | 机制文档已承载（`DOC-DISCIPLINE.md` D8 :22 / §4.5）⇒ **CN 侧口径本身已失效**，按 D8 删 CN 该条，EN 保留 |
| 15 | advisor-design 25 | 「**补充检查项（用户 2026-09-18 裁定）——修订式表达**：**设计档 / 批次档 / 需求档**的规范面……」 | EN:66 迁移到裁决规则节，**丢了「设计档 / 批次档 / 需求档」适用范围** | EN 补适用范围（D8 机制文档已有） |

**U1 裁定后的 EN 定稿句（#4 三处逐字同源——`discipline-engineering` EN:73–74 ∥ `discipline-normal` EN:130–131 ∥ `persona-eng-designer` EN:25–26；**已落在盘，本批只核不改**）**：

```text
**Out-of-scope items are not recorded**: anything seen outside that scope (other modules, other batches / layers / docs outside this repo, inconsistencies noticed in passing) ⇒ not written into the report, not booked to the ledger, not reported upward, not acted on — one glance cannot tell real from not, and what gets written down is only a "suspicion"; once it enters the todo list it is treated as a fact. **The one exception**: it blocks or overturns the current task (a stated premise contradicted by the facts, a claim in a doc you depend on contradicted by the code, the task cannot proceed) ⇒ that is the **current task being blocked**, and it follows the stop-and-report discipline.
```

**#9 四处（`advisor-{design,round1,round2,round3}` EN:8）定稿句（已落在盘，本批只核不改）**：

```text
3. **Boundary**: your review target = the review-object declaration (type / target / status / reason / exclude) + the documents in the review scope; a finding outside that surface has nobody in this round to dispose of it and dilutes the object, so the target does not expand. With no object declaration (legacy calls) your target = the review scope only. Out-of-scope: not looked at; report it only when it **blocks the judgment** — that is the **task being blocked**, not a finding.
```

**对账方法说明**：五名勘察子代理分档逐段对读（十六档全文，非抽样），本节结论逐条回读抽验 4 处（discipline-engineering 1–30 · persona-engineering 200–215 · persona-eng-coder 20–39 · EN 侧同名段）。

### 2.5 合并后 EN 的目标态（判据 + 可执行清单）

**判定：保持 EN 现状形态，只补缺，不按 CN 段落结构重排。** 理由三条：① EN 是运行期真实加载面，重排只增风险不增能力（EN 的表格化是运行期更易读的形态，CN 的散文式长段不是更好的目标）；② 两侧标题树 16 档全等，结构上本已对齐，重排会制造无收益的 diff；③ CN 里唯一值得搬进 EN 的是**用户原话与判据来源**（why 段）——那不是结构，是内容。

**可执行清单（EN 单面，逐条可核）**：

| # | 动作 | 判据（机械可核） | 依据 |
|---|---|---|---|
| E1 | 补译 out-of-scope 批登记的 3 处待译面：`persona-eng-designer:25` · `discipline-engineering:71-74` · `discipline-normal:128-131`（原列的 `advisor-{design,round1,round2,round3}:8` 按 U3 更正为**已是英文**，移出本行） | 该 3 处 EN 侧为英文且与 CN 定稿等值（范围外发现一族按 U1 = 判据 A 口径） | out-of-scope 批 §5 · §1 U3 |
| E2 | 补译本次新发现的 4 处 EN 侧中文：`advisor-design:34`（主体中文）· `advisor-round2:44-46`（整节）· `advisor-round3:40-42`（整节）· `persona-eng-coder:22/26/29/33-38`（标题与全段） | `thincoder-core/prompts/*.md` 跑 CJK 正则，除「运行时输出字面」白名单外零命中 | 本批实测 |
| E3 | 按 2.4 逐条补规则（#1 #2 #6 #7 #10 #11 #12 #15 直接补；#3 #5 #8 待机制文档先落 = R2；**#4 #9 按 U1 已裁** ⇒ EN 已落 CN 形态，只核不改（§2.4 末的定稿句）；**#13 按 A17 ∥ #14 按 D8** ⇒ 不补 EN，CN 侧改写或删） | 每行 2.4 的「处置」列有落点，逐条可点名 | 2.4 · U1 · A17 · D8 |
| E4 | 与机制文档相抵处一律**向机制文档对齐**（UAT 三样文档 · D7 五项） | EN 与 `design/TESTING.md` §11 / `DOC-DISCIPLINE.md` D7 逐项同名同数 | D2 单一权威源 |
| E5 | 标题树保持 16 档全等（不许借合并重排加 / 删节） | 每档 `^#{1,6}` 计数与现盘相同 | 结构已对齐 |
| E6 | 不动「运行时输出字面」——中文串如 `「§3 未写入」` · `「暂缓批复核：无」` 是模型要输出的固定文本，不是未译面 | 白名单逐串列明并在档内标注「输出字面」 | 避免 E2 误伤 |

**为什么不是「按 CN 重排 EN」**：CN 段落里的若干结构（例如 discipline-engineering 的 5 段 why 论证、persona-engineering 的判据 A 四小条）在 EN 侧被压成表格行或删掉——若照 CN 重排，等于把 EN 的运行期形态改回散文，读者（模型）获得的信息量不增，diff 规模却是全档级。正确做法是**把内容补进去，形态留在 EN**。

### 2.6 双份制陈述逐处清单（现文 → 改后）

分两组：**A 组 = 机制陈述本体**（定义「两份是什么」，必须改，逐处给逐字现文）；**B 组 = 落点族**（「中文设计文档 + 英文代码」这类落笔坐标句，机械改写式统一，逐档列坐标）。需求档（`docs/core/requirements/**`）**只列不改**——主 agent 的笔。

**A 组 · 机制陈述本体（逐处逐字）**

| # | 档:行 | 现文（逐字摘录） | 改后 |
|---|---|---|---|
| A1 | `design/PROMPT-SYSTEM.md:862` | 「提示词两份，关系 = **设计 → 实现**——**中文提示词 = 设计文档**（`docs/core/design/prompts/`…）∥ **英文提示词 = 代码**（`thincoder-core/prompts/`…）。流程 = 先改中文设计文档 → 英文由 coder 在编码时依它**精确翻译**生成……**无机检门**」 | 「提示词 = **产品代码**，唯一副本 = `thincoder-core/prompts/`（16 档，运行期直接加载）。规则的**人读权威** = 中文机制文档（`docs/core/design/` 纪律族）。变更路子 = 改规则 → 先改机制文档 → coder 依它改 EN（走产品代码面：需求 → 设计 → 评审 → coder）。无机检门（用户裁定不变）」 |
| A2 | `design/PROMPT-SYSTEM.md:866-878`（§8.1 全节） | 「**模板（CN 设计文档）** = `docRoot.design` 逐根 + `/prompts`——取实存者；本仓 = `docs/core/design/prompts/`（16 档）」+ 判据「0 命中 = 配置缺口（fail-loud）」+「**两份语义**：中文设计文档 = 人读的规格……生成 = 精确翻译」 | 整节改为「**提示词面无模板 / 落地二元**——只有一个运行期面 `thincoder-core/prompts/`（`thincoder-core/prompt-files.mjs:30` `PROMPTS_DIR`）。`docRoot.design + /prompts` 的模板探测**退场**（目录不存在是终态，不是配置缺口）；`promptsLanding` 键**保留**、语义收正为「提示词唯一副本路径声明」（不再是「落地产物目录」）——**删键 = schema 面改动**（`MANIFEST.md` 八键 · `manifest-schema.mjs` · `tool-docs/manifest.md` · 需求规格），不属本批，要删另立批；本仓 `PROJECT-MANIFEST.json:25` **无改动**」 |
| A3 | `design/PROMPT-SYSTEM.md:884-889`（F2 / F3 / 结构级复核） | 「F2 更新流程约束：先改中文设计文档 → 依它精确翻译生成英文代码——后者是生成物」「F3 落点读声明面：模板 = `docRoot.design` 逐根 + `/prompts`」 | F2 改为「更新流程约束：先改机制文档 → coder 改 EN」；F3 整行删（无模板面可解析）；「结构级复核」段整段删（无第二面可对） |
| A4 | `design/PROMPT-SYSTEM.md:891-915`（§8.2 16 对复核表 + 两处收正） | 16 行表（每行「双语正当差」）+「**四行并入 CN**（判据 = D-PS1「中文设计文档 = 内容权威」）」 | §8.2 整节删（复核对象不存在）；「四行并入 CN」条删（CN 面不存在，那四行 EN 现体已在） |
| A5 | `design/PROMPT-SYSTEM.md:818`（D-PS1） | 「**中文设计文档 = 设计基准**；英文代码 = 依它精确翻译生成」 | 「**提示词 = 代码单源**（`thincoder-core/prompts/`）；规则的人读权威 = 中文机制文档；同一规则两处成文 = 缺陷」 |
| A6 | `design/PROMPT-SYSTEM.md:152-153`（§6.1 笔域） | 「**英文提示词 = 代码**（中文设计文档 = 设计文档）；**内容权 = 主 agent**……**落笔分述**——**中文设计文档 = eng-designer 笔**……**英文代码 = eng-coder 落笔**」 | 「**提示词 = 产品代码面 ⇒ 单笔域 = eng-coder**（内容由机制文档定）；无「中文设计面」一支；父侧改提示词 = 改产品代码，走 coder」 |
| A7 | `design/PROMPT-SYSTEM.md:925`（AC-M9-3 域注） | 「**域** = 两份提示词档（中文设计文档 16 + 英文代码 16 = 32 档）」 | 「**域** = 提示词档 16 档（`thincoder-core/prompts/`）」 |
| A8 | `design/PROMPT-SYSTEM.md:15 / 20 / 43 / 47-56 / 67-68 / 97 / 102 / 115-117`（§1 / §2 表的中文设计档行） | 「**中文设计档（供人读・非运行期——英文代码由它精确翻译生成）**……归属 = 文档面（16 档）」+ 16 行「镜像 · 1.0000 · 同 · 文档面」 | 中文设计档行**整族退场**（对象消失）；涉及计数处按 D3 同步（本文 §1 表行数、§2 表行数）；保留「核内 16 档 = 唯一副本」一行 |
| A9 | `design/DOC-SYSTEM.md:301-308`（§10.3 落点二） | 「### 10.3 落点二：提示词层（**不落**——英文提示词 = 代码）」+ 表两行：「`docs/core/design/prompts/persona-engineering.md`（**正本**）……」「`thincoder-core/prompts/persona-engineering.md`（**运行期落地档**）……按正本**回写**」 | 标题改「### 10.3 落点二：提示词层（**只落 EN 一面**）」；表改为 1 行（EN 档 + 节）；「为何落这里」句改「两池机制的详述处 = `design/LEDGER.md`（机制档）；提示词只是该规则的执行面」 |
| A10 | `design/DOC-SYSTEM.md:174`（N-d） | 「正本不与落地档同名混淆：提示词正本 = `docs/core/design/prompts/<槽名>.md`；运行期落地档 = `thincoder-core/prompts/<槽名>.md`——两者不同域」 | **改（定一形）**：N-d 改为「**提示词不建第二处**：提示词档只在 `thincoder-core/prompts/`；`docs/` 下不得出现同名档（机检：`docs/**` 下 `prompts/` 目录数 = 0）」 |
| A11 | `design/DOC-SYSTEM.md:121 / 269 / 272-276 / 343 / 355` · `:326-327`（§11 表行 7/8） | 「`docs/design/prompts/`（16 档正本）→ `docs/core/design/prompts/`：提示词正本归 core」等 | **逐行改写（定一形：不删行，表列结构不动）**——`:121` →「`docs/design/prompts/`（16 档）｜**无去向（整族退场）**｜提示词唯一副本 = `thincoder-core/prompts/`；`docs/` 下不含提示词档」；`:269`（§9 ③）→「提示词只有一份 = `thincoder-core/prompts/**`（运行期加载面 = 产品代码，不入 `docs/`）；`docs/` 侧无提示词档｜本规划不引入文档面提示词档，P4 按单面陈述｜✓ 自洽」；`:272-276`（修法 1）→「『正本 → 回写落地档』链路退场；保留扫替判据——域 = 根层 `docs/**` 扣 `_archive/` 与时序日志面、两产品树排除，判据 = 域内 `docs/design/prompts` ∥ `docs/core/design/prompts` 引用计数 = 0」；`:343`（决策 8）→「提示词无文档面正本；唯一副本 = `thincoder-core/prompts/`｜承 2026-10-18 取消镜像裁定」；`:355`（A1）→「16+16 板块档去向逐项给出（§4 表）；提示词面无文档面档（单副本 = `thincoder-core/prompts/`）」；`:326`（§11 行 7）→「`docs/core/design/prompts/discipline-engineering.md`｜**207（实测）**｜−207（整档删）｜两池判据句不落 CN 面｜R5」；`:327`（§11 行 8）→「`thincoder-core/prompts/discipline-engineering.md`｜**198（实测）**｜+5｜两池判据句（coder 落笔）｜R3」 |
| A12 | `design/DOC-DISCIPLINE.md:15`（D1 矩阵） | 「提示词 = 主 agent 内容权 + 落笔分述：中文设计文档（设计文档面）= eng-designer 笔 · 英文代码（代码面）= eng-coder 落笔」 | 「提示词 = **产品代码面** ⇒ 唯一作者 = **eng-coder**（内容依据 = 机制文档）；无第二支笔；「笔域越权」概念作废」 |
| A13 | `design/CORE-UNIFICATION.md:485`（D-C14） | 「**中文设计档（裁定 B）**：根仓 `docs/` 整层 = 基准层……其中 `core/design/prompts/` = **提示词正本**（唯一撰写面 / 内容基准）……**提示词权威链路**：改提示词内容 ⇒ 先改仓根正本 → 按正本回写核内运行期落地档」 | D-C14 **整条退场**（其裁定对象 = 中文镜像，已删）；原地留一句「提示词唯一副本 = `thincoder-core/prompts/`；`docs/` 层不含提示词档（承 2026-10-18 取消镜像裁定）」——同档 `:12 / 31 / 40 / 45 / 68-69 / 80 / 173 / 266 / 302 / 409 / 417 / 420 / 516 / 536 / 585-586 / 953` 逐处随动 |
| A14 | `design/ENGINEERING-MODE-V2.md:72`（M9 行）· `:278` · `:297` · `:299` · `:448` · `:478`（KD5） | 「M9 提示词设计→实现流程：中文设计文档 → 英文代码（依设计文档精确翻译生成）」 | **M9 整条退场**（无「设计→实现」两段可言）；KD5 改「提示词 = 代码单源」 |
| A15 | `design/ARCHITECTURE.md:39` · `:60` | 「core/{requirements,design}/ … design/prompts/（提示词中文正本 16 档）」「prompts/ 槽位提示词运行期落地档（16 档——正本 = `docs/core/design/prompts/`）」 | 两处均改为「`prompts/` = 提示词唯一副本（16 档）」；目录树行删 `design/prompts/` |
| A16 | `docs/README.md:3` · `:51` | 「**提示词正本** = `core/design/prompts/`」「提示词系统（槽位 / 工具描述 / **中文设计档**）」 | 「提示词唯一副本 = `thincoder-core/prompts/`（代码面）」；子系统表描述删「中文设计档」 |
| A17 | `design/prompts/persona-eng-designer.md:6 / 14-15` ∥ EN `:6 / 14-15` | CN「你不写实现代码……**不碰英文代码提示词**（英文提示词 = 代码；中文设计文档 = 设计文档；**你的提示词笔域 = 中文设计文档**）」；EN「your prompt pen = the Chinese review face」 | **按判据 A.3 改**：设计师笔域 = 机制文档 + 批次档 §2；不写任何提示词；「笔域越权」概念删。EN 侧同改（走 coder） |
| A18 | `design/prompts/discipline-engineering.md:189`（D1）∥ EN `:179` | CN「提示词 = 主 agent 内容权 + **落笔分述：中文设计文档 = eng-designer 笔 · 英文运行面 = eng-coder 落笔**」 | 「提示词 = 产品代码面 ⇒ eng-coder 独笔；无中文设计面一支」 |
| A19 | `design/prompts/discipline-engineering.md:18` ∥ EN `:18`（变更面分流表「文档面」行） | 「prempts = main agent content authority + landing split by face」 | 「doc face」行删提示词括号；提示词移入「产品代码面」行 |
| A20 | `design/TWO-REPO-MERGE.md:80-87 / 120 / 136` | 「## 4. 提示词承载（双源保留）」「产品 `docs/design/prompts/`（中文权威）↔ `src/prompts/`（运行期落地物）**保留**」「D14 提示词**不做单副本合流**」 | 整节改「## 4. 提示词承载（单源）」；D14 反转为「单副本」；`:136` 双源守卫句删 |

**A21（`DOC-SYSTEM.md:143` §5.1 P4 判据——含表格竖线，以块形给）**

现文（逐字）：

```text
| **P4** | **运行期 vs 文档面**：提示词**正本**（中文设计档）= 文档面（随 core）；核内运行期落地档（`thincoder-core/prompts/**` · `thincoder-core/tool-docs/**`）= **产品代码**，不入 `docs/` | 二者档名集合相等且各 16 / 52 档（`PROMPT-SYSTEM.md` §2 组陈述） |
```

改后（整行替换；**「16 / 52 档相等」这一机检落点删掉**——第二个对象已不存在，留着就是无对象的判据）：

```text
| **P4** | **提示词 = 产品代码**：唯一副本 = `thincoder-core/prompts/**`（运行期加载面）+ `thincoder-core/tool-docs/**`；`docs/` 下不含提示词档 | 机检：`docs/**` 下 `prompts/` 目录数 = 0 ∧ 提示词档集合 = `thincoder-core/prompts/*.md` 16 档（`PROMPT-SYSTEM.md` 单面陈述） |
```

**A22（`DOC-SYSTEM.md:79` §4 目标目录树子行）**

现文（逐字）：

```text
│   │   └── design/prompts/                 ← 提示词**中文设计档正本**（16 档）
```

改后：**整行删**——该目录随 R5 消失，§4 树里 `core/design/` 下不再有 `prompts/` 子行。

**B 组 · 落点族（机械改写式，逐档列坐标）**

统一改写式：「**落点（中文设计文档 + 英文代码）**……CN 正本 = 设计轮直落 ∥ EN 代码 = 实施轮按 M9 精确翻译回写」→「**落点（提示词 = 代码单源）**：`thincoder-core/prompts/<档>` ＋ 机制文档承载面」；「CN 正本」字样一律删。

| 档 | 命中行 |
|---|---|
| `design/PROMPT-SYSTEM.md` | 171-173 · 246 · 261 · 268 · 276-277 · 297-298 · 336 · 344 · 352 · 354 · 372-373 · 390 · 404-405 · 428 · 450-451 · 471 · 494-496 · 520-521 · 539 · 560 · 622-624 · 649-650 · 760-761 · 781-783 · 807-808 · 827 · 914 |
| `design/ADVISOR-CONVERGENCE.md` | 75 · 162 · 176-179 · 197-201 · 210 · 220-223 · 233 · 342 · 381 · 401-402 · 409 · 419 |
| `design/AGENT-LOOP-UPSTREAM.md` | 216-217 · 265 · 284 · 653 · 667 · 1227 · 1243 · 1259-1261 |
| `design/AGENT-LOOP.md` | 334 |
| `design/AGENT-LOOP-ASYNC-POOL.md` | 195 |
| `design/BATCH-RECORD.md` | 352 · 571-572（「双源断言」整块） |
| `design/DOC-MIGRATION.md` | 6 · 97 · 264 · 270 · 333 · 336 · 367 · 376 · 484 · 507 · 517 |
| `design/ANCHOR-DEBT-REPAIR.md` | 230 · 309-311 |
| `design/DESIGN-TOKEN-SETTLEMENT.md` | 171 · 203 · 234 |
| `design/ENG-TOKEN-BINDING.md` | 98 · 117 |
| `design/LEDGER.md` | 403-406 |
| `design/LEDGER-SELF-CONTAINED.md` | 189 |
| `design/LIGHT-CHANNEL.md` | 150-152 · 162-167 · 194 · 209 |
| `design/MANIFEST.md` | 176-177 · 567 · 634 · 649 · 689 |
| `design/PORTABILITY.md` | 230 |
| `design/STRUCTURE-DEBT.md` | 39 |
| `design/TESTING.md` | 11 |
| `design/TOOLS.md` | 692 · 703 |
| `design/VERIFY-REDESIGN.md` | 67 |
| `design/BASH-EXECUTOR-FACE.md` | 149 |
| `design/ADVISOR-GUARDS.md` | 185 |
| `design/DOC-CODE-RECONCILE.md` | 218 |
| `design/DOC-DISCIPLINE.md` | 36 · 68 · 74 · 228-229 · 266 · 681 · 1552 · 1890 |
| `cli/design/ACP-CLIENT.md` | 132 |
| **需求档（主 agent 笔，只列）** | `requirements/PROMPT-SYSTEM.md`: 4 · 46 · 50-51 · 54 · 61 · 93 · 99 · 105 · 112 · 124 · 133 · 158 · 172 · 175 · 177 · **182（§2.5）**；`requirements/ENGINEERING-MODE-V2.md`: 440 · 446 · 449 · 451 · **602（D1）** · 618；`requirements/ENGINEERING-MODE-V2-SPEC-PROMPT-PIPELINE.md`: **7 · 11（整档即该流程，建议整档退场）**；`requirements/METHODOLOGY.md`: 5 · 15-19 · 30 · 35 · 41-42 · 54 · 104-105；`requirements/PHILOSOPHY.md`: 149；`requirements/LIGHT-CHANNEL.md`: 82-84 · 89；`requirements/NORMAL-MODE.md`: 103 · 115；`requirements/ADVISOR-CONVERGENCE.md`: 75（N5「四面同文」）；`requirements/CORE-UNIFICATION.md`: 73 · 101（F9） · 132；`requirements/DOC-SYSTEM.md`: 23（FR1） · 27（FR5）；`requirements/TESTING.md`: 155（F15 提示词镜像锚）；`requirements/TWO-REPO-MERGE.md`: 26（F4 收窄注记） |

**A 组 + B 组合计**：机制陈述本体 **22** 处（A1–A22）· 落点族 24 档（B 组）· 需求档 12 档（只列）。

### 2.7 引用清扫清单（全仓 `docs/core/design/prompts/` 命中逐处判处置）

| 处置 | 判据 | 命中面 |
|---|---|---|
| **D · 删** | 指针对象消失且该句无线可指（纯「CN 正本在 X」的登记 / 复核 / 差异表行） | `PROMPT-SYSTEM.md:47-56 · 67-68 · 97 · 102 · 115-117 · 891-915` · `CORE-UNIFICATION.md:516`（§2.5 表中文设计档行） · `ANCHOR-DEBT-REPAIR.md:230 · 309-311` · `AGENT-LOOP-UPSTREAM.md:653 · 1259-1261` · `DOC-MIGRATION.md:264 · 270 · 333 · 336 · 367` |
| **M · 改指机制文档** | 该处引 CN 提示词，是因为它是某规则的「唯一详述处」——需改指承载该规则的机制档 | `DOC-SYSTEM.md:305-308`（两池规则 → `design/LEDGER.md`） · `ADVISOR-CONVERGENCE.md:162 · 220-223 · 401-402 · 409 · 419`（评审维度 → 本档 / `DOC-DISCIPLINE.md`） · `DOC-MIGRATION.md:484`（按域分界 → `DOC-DISCIPLINE.md`「按域分界」节） · `TESTING.md:11`（测试纪律 → `requirements/TESTING.md` §2） · `VERIFY-REDESIGN.md:67` · `STRUCTURE-DEBT.md:39`（铁律② → `discipline-*` 机制档） |
| **E · 改指 EN 同名档** | 该处只是「这条规则的执行面在哪个提示词档」——执行面仍在，改指 EN | `AGENT-LOOP-UPSTREAM.md:216-217 · 265 · 284 · 667 · 1227 · 1243` · `MANIFEST.md:176-177 · 567 · 634 · 649 · 689` · `ENG-TOKEN-BINDING.md:98 · 117` · `DESIGN-TOKEN-SETTLEMENT.md:171 · 203 · 234` · `TOOLS.md:692 · 703` · `LIGHT-CHANNEL.md:150-152` · `ADVISOR-CONVERGENCE.md:176-179` · `BATCH-RECORD.md:571-572` · `DOC-CODE-RECONCILE.md:218` · `cli/design/ACP-CLIENT.md:132` · `BASH-EXECUTOR-FACE.md:149` |
| **K · 保留（已指 EN）** | 已指 `thincoder-core/prompts/**`，删 CN 不影响 | `ADVISOR-CONVERGENCE.md:197-201 · 233` · `AGENT-LOOP-ASYNC-POOL.md:195`（同句同时含 CN 与 EN 指针） · `PORTABILITY.md:230` · `DOC-DISCIPLINE.md:228-229 · 681 · 1890`（同族两指针，删 CN 那半） |
| **C · 代码面（工程工具面）** | `scripts/**` = 机械改：`PROMPT_DIRS` 三元素 → 两元素 | `scripts/prompt-refs-check.mjs:10 · 13 · 25`（唯一代码命中；`thincoder-cli/test` 与 `thincoder-vscode/test` 实测**零命中**，无镜像断言存活） |
| **W · 陈述句改写（不含路径字面）** | 该处陈述双份制 / 正本归属，但**句内无路径字面**——`grep` 与机检均抓不到，只能靠清单勾稽 | `DOC-SYSTEM.md:143`（P4 判据句——A21） · `DOC-SYSTEM.md:79`（§4 目录树——A22） · `DOC-SYSTEM.md:174`（N-d——A10） |

**注**：`docs/core/design/_archive/**` 与 `docs/core/requirements/_archive/**` 内的同名命中**不处置**（冻结历史，只读）；`docs/batches/**` 内命中由批次档自身可清理性覆盖（不追改）。**`W` 类为修正轮新增**：`DOC-SYSTEM.md:143`（P4 判据句）与 `:79`（§4 目录树）**不含路径字面**——R4 / R5 的 `grep` 判据都抓不到它们，只能靠本清单逐处勾稽（这正是首轮漏掉这两处的原因）。

### 2.8 判定 B · 设计面承载（哪些规则现在只活在提示词里）

**判据**：把该条从提示词里拿掉，仓里是否还有一处成文能回答「为什么 / 什么时候适用 / 怎么算违反」。答不出 ⇒ 必须补机制文档。

| # | 规则 | 机制文档现状 | 处置建议 |
| B1 | **判据 A（发现的入账范围）**：范围 = 任务书 · 发现 = 验证过的 · 唯一例外 · 与「已批准设计」不同轴 | **无**（全仓 `判据 A` 只命中提示词） | **落 `LEDGER.md` §1.1「发现的入账范围（判据 A）」**——台账 = 入账面，该节给四条判据句（范围 / 定义 / 例外 / 与设计范围不同轴）；R2 硬前置 |
| B2 | **「发现」= 验证过的**（没跑过 = 猜测） | 无 | 与 B1 同节（`LEDGER.md` §1.1）合并 |
| B3 | **写域 / 笔域矩阵与「笔域越权」** | 部分（`DOC-DISCIPLINE.md:15` D1 有矩阵，但内容随本批改判） | 改 D1 行（见 A12），不需新节 |
| B4 | **UAT / RTM 三样文档** | **有**（`design/TESTING.md` §11 · `requirements/TESTING.md` §7） | 机制档已承载 ⇒ **EN 对齐**，无新档 |
| B5 | **D7 核销同步清单 11 项** | **有**（`DOC-DISCIPLINE.md` D7 · `BATCH-RECORD.md` §5.3） | 同上，EN 补齐 |
| B6 | **范围外发现：记不记 / 报不报** | **无统一句**（各机制档只在个别节提到「范围外」） | **已裁（U1 = 判据 A）** ⇒ 落 `LEDGER.md` §1.1（与 B1 / B2 同节）；EN 四处已与 CN 等值（§2.4 #4 / #9 逐字），R1 只核不改 |
| B7 | **「本组规则 = agent 自加，须能答靠哪个结构、前提一变重新过堂」** | 无 | **落 `DOC-DISCIPLINE.md` §4.4「层 3 防回潮 + 流程入规」**——§4.4 追加「规则自身的复核依据」段（该节即「规则怎么自我复核 / 防回潮」节）；**不走 D1–D9 编号**（避免「D1–D9」枚举涟漪） |
| B8 | **D4 射程（实施坐标 / as-of 读数 / 评审证据引文三类豁免）** | **有**（`requirements/ENGINEERING-MODE-V2.md` D4 :605） | EN 补句，无新档 |
| B9 | **引证禁令的适用范围（工具说明 / schema 文本 / 回给模型的串 / 指路句）** | 部分（`DOC-DISCIPLINE.md` 指针纪律讲档间指针，未讲工具说明与 schema） | EN 补列举；若认为工具面也要，补机制档一句 |
| B10 | **父侧 ask 队列深度 = 1** | 有（`AGENT-LOOP-UPSTREAM.md` 上行通道机制） | EN 补半句或改指 |
| B11 | **「变更记录」条（设计档留一行注记）** | **有且相反**（`DOC-DISCIPLINE.md` D8 禁令） | **CN 侧本身失效** ⇒ 按 D8 删，不回流 |
| B12 | **角色能力边界（persona-plan 只读 / persona-coder 身份）** | 部分（`AGENT-LOOP-SUBAGENT.md` 角色表） | 建议留在提示词（人格层是角色面，机制档不承载人格）——**不回流的建议项** |
| B13 | **「说话像人、不蹦黑话」这类语气纪律** | 无（公共层语气节属提示词本体） | 建议留在提示词（不是可判规则）——**不回流的建议项** |

**结论**：真正「只活在提示词里」的硬规则 = **B1 / B2 / B6 / B7**（四条）；B4 / B5 / B8 / B10 机制档已承载（EN 补即可）；B11 反而应删；B12 / B13 属人格 / 语气，**建议留在提示词不回流**（机制档承载它们只会写出一堆不可判的散文）。

### 2.9 判定 C · 迁移顺序（先补 EN → 再删 CN，怎么落）

每轮 = 一个批次（各自 §1–§6），**轮与轮之间以 git 提交为界**——中间态不丢的保证 = 每轮的对面都不动，删的那一轮才动。

| 轮 | 内容 | 完成判据（机械可核） | 依赖 |
|---|---|---|---|
| **R1（补译）** | out-of-scope 批的 3 处（`persona-eng-designer:25` · `discipline-engineering:71-74` · `discipline-normal:128-131`）+ 本批新发现 4 处（2.5 E2）= **7 处** | `thincoder-core/prompts/*.md` CJK 正则零命中（「运行时输出字面」白名单除外） | 无 |
| **R2（机制文档补四条）** | B1 / B2 / B6 落 `LEDGER.md` §1.1「发现的入账范围（判据 A）」；B7 落 `DOC-DISCIPLINE.md` §4.4「规则自身的复核依据」（U1 已裁，无待裁前置） | 两节在册 ∧ B1–B7 各条判据句可 grep（`判据 A` 在机制面可 grep 到） | 无（U1 / U2 / U3 已裁） |
| **R3（EN 补规则）** | 2.5 E3 的 8 条可直接补 + E4 向机制文档对齐（UAT 三样 / D7 五项） | 2.4 表每行「处置」列有落点；EN 与 `design/TESTING.md` §11 / `DOC-DISCIPLINE.md` D7 逐项同名同数 | R2 |
| **R4（改判后的一致性）** | 2.6 A 组 22 处 + B 组 24 档 + 需求档 12 档（主 agent 笔） | **判面二**：① **路径字面**——域 = `docs/**` 扣 `docs/batches/**` · `**/_archive/**` · 产品树 `thincoder-{cli,vscode}/docs/**`，`docs/core/design/prompts` 计数 = 0 ② **无路径字面的陈述句**——按 §2.6 A 组 + §2.7 W 类**逐处勾稽**（清单全覆盖即达标：`grep` 抓不到 `DOC-SYSTEM.md:143` 这类句，只能靠清单）；另 `docs/README.md` 地图同步 | R3 |
| **R5（删 + 引用清扫，同一批）** | 删 16 档 + 2.7 的 D / M / E / W 四类清扫 + `scripts/prompt-refs-check.mjs` 目录元素删一 | **域** = `docs/**` + `scripts/**`；**排除集** = `docs/batches/**` · `**/_archive/**` · 产品树 `thincoder-{cli,vscode}/docs/**`（参照历史，不改指）。判据 = ① `grep -r "design/prompts" docs/ scripts/ --exclude-dir=batches --exclude-dir=_archive` 零命中 ② `node scripts/prompt-refs-check.mjs` 绿 ③ `docs/**` 下 `prompts/` 目录不存在 | R4 |
| **R6（收口核）** | 三处同时成立：EN 零中文 · 引用零命中 · 机制文档承载四条 | 三读数逐项报 | R5 |

**为什么 R4 必须在 R5 之前**：若先删 CN，2.6 里 100+ 处指针当场变死指针，而它们指向的正是「要改成什么」的依据——先删等于让改造失去参照。
**为什么 R5 删除与清扫同一批**：删档与改指针分两批，中间态必有一批死指针在盘上；同批 = 中间态不可见。
**风险**：R3 补进 EN 的规则如果与后续机制文档裁定不一致，会二次漂移 ⇒ R2 必须先于 R3（先定人读权威，再落执行面）。

### 2.10 删除面（16 档，逐档路径）

`docs/core/design/prompts/` 下 16 档：`advisor-design.md` · `advisor-round1.md` · `advisor-round2.md` · `advisor-round3.md` · `common.md` · `consult-base.md` · `discipline-engineering.md` · `discipline-normal.md`
· `persona-coder.md` · `persona-eng-coder.md` · `persona-eng-designer.md` · `persona-engineering.md` · `persona-explore.md` · `persona-plan.md` · `persona-normal.md` · `subagent-base.md`。
不建 `_archive`（一次性副本，git 留历史）。`docs/core/design/prompts/` 目录随之消失。

### 2.11 受影响文件与验收对照

| 面 | 文件 | 现况 | 动作 | 轮次 |
|---|---|---|---|---|
| 提示词 EN | `thincoder-core/prompts/*.md`（16 档，**1505 行**——实测） | 唯一副本（本批后） | 补译 + 补规则（不改结构） | R1 / R3 |
| 提示词 CN | `docs/core/design/prompts/*.md`（16 档，**1475 行**——实测） | 待删 | 删 | R5 |
| 机制文档 | 2.6 A 组 22 处 + B 组 24 档 | 陈述双份制 | 改 | R4 |
| 机制文档（新补） | `LEDGER.md` §1.1「发现的入账范围（判据 A）」（B1 / B2 / B6）· `DOC-DISCIPLINE.md` §4.4「规则自身的复核依据」（B7） | 缺规则 | 新增两节 | R2 |
| 需求档 | 12 档（2.6 表末行） | 陈述双份制 | 主 agent 改 | R4 |
| 代码 / 脚本 | `scripts/prompt-refs-check.mjs`（138 行） | `PROMPT_DIRS` 三元素（`:25`）；注释 `:10` · `:13` 含第三目录 | 删一元素 + 两行注释随改（**Δ 0 行**） | R5 |
| 声明面 | `PROJECT-MANIFEST.json:25`（`promptsLanding`） | 键保留（A2 已定：语义收正为「提示词唯一副本路径声明」） | **无改动** | —— |
| 地图 | `docs/README.md:3 / 51` | 指 CN 正本 | 改 | R4 |

**验收对照（回指本批条目）**

| 条目 | 判据 | 读数 |
|---|---|---|
| AC1 | 16 档逐档有差异表 / 结论；计数自洽 | §2.3 表 16 行 + 合计行（46 / 29 / 21 = 96）；逐档行数实测 |
| AC2 | EN 目标态清单每项带机械判据 | §2.5 E1–E6 |
| AC3 | A 组逐处带现文与改后；B 组带统一改写式与坐标 | §2.6 A1–A22 + B 组 24 档 |
| AC4 | 三类处置 + 逐处坐标 | §2.7（含 W 类两处） |
| AC5 | 记录裁定 + 代价 | §2.12 D1 |
| AC6 | 16 档逐档 | §2.10 |
| AC7 | 档内实读数：§2.12 勘察证据行含**独立仓结论**与 **`DOC-CHECK GATE` 首行读数** | §2.12 末段 |
| AC8 | B1 / B2 / B6 / B7 各自点名**唯一机制档 + 节位 + 判据句**；R2 完成时以「机制档该节存在 ∧ 判据句可 grep」核 | §2.8 + §2.9 R2 行 |
| AC9 | 六轮各有机械可核完成判据；轮际依赖 **R2<R3**、**R4<R5** 明写 | §2.9 |

### 2.12 关键决策 / 上抛项

| # | 决策 / 上抛 | 内容 |
|---|---|---|
| D1 | **单笔域（判据 A，已裁）** | 提示词 = 产品代码 ⇒ eng-coder 独笔；「笔域越权」作废；设计师笔域 = 机制文档 + §2。**代价**：小改动也要 spawn 一轮 coder（含 designToken 流程）；**收益**：不再有第二支笔与歧义。父侧从此不直接改提示词 |
| D2 | **EN 形态 = 保持现状只补缺**（不按 CN 重排） | §2.5 三条理由 |
| D3 | **删除不建 `_archive`** | 一次性副本；git 留历史。与 CORE-UNIFICATION `:536`「已撤面：两产品 `docs/design/prompts/**` 的删除」不冲突（那是产品树旧档，本批删的是根仓正本） |
| D4 | **设计正文落 §2、机制文档改在下一轮** | §2.2；代价已登记 |
| **U1** | **已裁（§1 23:08）：范围外发现 = 不写进报告（判据 A）** | 裁定 = 按判据 A：范围外发现不进报告、不入台账、不上报、不动手（唯一例外 = 挡住或推翻当前任务）；**不采纳**「按面分层」。落法：CN 三档为定稿，EN 向 CN 对齐——`discipline-engineering` EN:73–74 ∥ `discipline-normal` EN:130–131 ∥ `persona-eng-designer` EN:25–26 ∥ 四档 `advisor-*` EN:8 **均已落**同级形态（§2.4 #4 / #9 逐字）；对账影响 = CN 独有 46 条中「范围外不记录」一族按 CN 为准 |
| **U2** | **已裁（§1 23:08）：D7「变更记录」项按 D8 删** | 裁定 = D8 胜（需求 / 设计档不承载历史，历史只在 git）；D7 该清单项 = 失效表达 ⇒ 删，且不补进 EN。落法：R2 落机制文档时该核销清单**不含**「变更记录」项——`DOC-DISCIPLINE.md:21` D7 行现文即无该项（核验 = 与现盘一致，不新增） |
| **U3** | **已裁（§1 23:08 · 知会转更正）：待译坐标更正** | `advisor-{design,round1,round2,round3}.md:8` 实测**已是英文**（逐字 =「Out-of-scope: not looked at; report it only when it **blocks the judgment**」）；真未译面 = `advisor-design:34` ∥ `advisor-round2:44`–`46` ∥ `advisor-round3:40`–`42` ∥ `persona-eng-coder:22`·`26`·`29`·`33`–`38`。R1 按此补译（E1 3 处 + E2 4 处 = 7 处） |

**先例行**：查过 = `docs/README.md`（文档地图）· `docs/core/design/PROMPT-SYSTEM.md` §6.1 / §8（`:845-930`）· `DOC-SYSTEM.md` §10.3（`:301-308`）· `DOC-DISCIPLINE.md` D1/D7/D8
· `requirements/ENGINEERING-MODE-V2.md` D1（`:602`）与 §8.4（`:440-451`）· `requirements/PROMPT-SYSTEM.md` §2.5（`:180-196`）· `design/TESTING.md` §11 · `BATCH-RECORD.md` §5.3
· `PROJECT-MANIFEST.json`（`docRoot` / `promptsLanding`）· `scripts/prompt-refs-check.mjs` · 16 对提示词全文（五名勘察子代理分档逐段，抽验 4 处）。

**最接近先例行**：先例批次 = `docs/batches/2026-10-15-prompt-dual-face-align.md`（其 §1 `:11`–`:18`：两面定位「CN = 审核 / 规范面 ∥ EN = 运行 / 产品码面」+ 跨面差异默认消除）；对位设计节 = `PROMPT-SYSTEM.md` §6.1（`:152-153`）· §8.1（`:866-878`）· D-PS1（`:818`）；实现坐标 = `thincoder-core/prompts/**` 16 档 ∥ `docs/core/design/prompts/**` 16 档。**对齐面 = 方法**（逐档对账 + 逐处现文→改后 + 引用清扫清单，承该批三段式）；**偏离面 = 方向**（该批把两面**补齐**，本批把两面**并成一面**）——偏离理由：① 双份镜像已实证漂移（§1 表第 2 行：EN 缺三条判据）② 「CN = 文档 ∥ EN = 代码」靠路径表达、模型感知不到（§1 表第 3 行）。**无同形先例**：仓内无「取消镜像」先例批；最近的是 `docs/batches/2026-10-16-prompt-design-code-model.md`（`:107` 列 ①–⑨ 确立两面模型与路径取法），正是本批反转的对象。**反转对象逐条**：D-PS1（`PROMPT-SYSTEM.md:818` → A5）· D-C14（`CORE-UNIFICATION.md:485` → A13）· M9（`ENGINEERING-MODE-V2.md:72` → A14）· D14（`TWO-REPO-MERGE.md:80-87` → A20）——四处均为有意偏离，改后文本逐条在 §2.6。

**勘察证据行**：公共源档（`docs/core/design/**` · `docs/core/requirements/**`）逐处已查，相关面 = 上列 8 档；`_archive/**` 与产品树 `docs/**` 已判冻结 / 参照历史，不处置。**独立文档仓结论 = 不相关（已查无）**：工作区外参考系 `D:\ref\` 已移出工作区、不入索引（工作区 `AGENTS.md` 项目表末行），且 `PROJECT-MANIFEST.json:56` `index.publicRepos = []`（无声明源）⇒ 无独立仓可查，本批不引其结论。**doc_check 读数（新进程直跑 `thincoder-core/doc-check/index.mjs` 的 `runDocCheck`，mode = gate，docs = 本批档，2026-10-18 23:16）**：首行 `DOC-CHECK GATE: PASS（0 档）`——范围行明示「显式 docs 0 档 · 跳过 1 档（不在声明域内）」：`checkConfig.anchors.exclude` 含 `batches` ⇒ 批次档不进交付门。本批为判定批（无机制文档改动），落笔轮（R4 / R5）的 gate 由该轮自判。

### 2.13 修正轮处置（`advisor#27` · 12 条全收 · 2026-10-18）

逐条处置（`号 → 改动位置`；文件 = 本档 §2）：

| # | 处置 | 落点 |
|---|---|---|
| 1 🔴 | `DOC-SYSTEM.md:143`（P4 判据句）与 `:79`（§4 目录树）补入 A21 / A22：逐字现文 + 改后；**P4 的「16 / 52 档相等」机检落点删除**，换为有对象的判据（`docs/**` 下 `prompts/` 目录数 = 0 ∧ 提示词档集合 16 档） | §2.6 A21 / A22 · §2.7 W 行 + 注 |
| 2 🟡 | 三行改「已裁（§1 23:08）+ 裁定内容」；E1 坐标按 U3 更正为 3 处；§2.3 未译 11 → **7 处**；R1 改「3 + 4 = 7 处」；§2.4 #4 / #9 给**已落定稿句**（三处 EN + 四档 EN:8）；E3 分类随 U1 / A17 / D8 对齐 | §2.12 U1–U3 · §2.5 E1 / E3 · §2.3 · §2.9 R1 · §2.4 表 + 定稿句块 |
| 3 🟡 | R4 / R5 判据写明**域 + 排除集**（`batches` · `_archive` · 产品参照树）；R4 增「无路径字面 ⇒ 逐处清单勾稽」判面 | §2.9 R4 / R5 |
| 4 🟡 | 增 AC8（§2.8 四条硬规则各有机制档节 + 判据句）/ AC9（§2.9 逐轮判据 + 依赖 R2<R3 · R4<R5） | §2.11 验收对照 |
| 5 🟡 | 勘察证据行改**档内实读数**：`DOC-CHECK GATE: PASS（0 档）` + 跳过原因（批次档不在声明域） | §2.12 勘察证据行 |
| 6 🟡 | A10 定「改」一形（N-d 改为「提示词不建第二处」）；A11 定「逐行改写」一形，落到 `:121 / :269 / :272-276 / :343 / :355 / :326-327` 七处 | §2.6 A10 / A11 |
| 7 🟡 | B7 唯一落点 = `DOC-DISCIPLINE.md` §4.4（追加「规则自身的复核依据」段，不走 D1–D9 编号）；R2 前置改「无」 | §2.8 B7 · §2.9 R2 · §2.11 新补行 |
| 8 🟡 | `scripts/prompt-refs-check.mjs` 补「138 行 / Δ 0 行」；A2 定为**键保留、语义收正** ⇒ `PROJECT-MANIFEST.json:25` 入表记「无改动」 | §2.11 · §2.6 A2 |
| 9 🟡 | §2.1 声明「**本批 = 判定批**，实施面 = R1–R6 各自批」，§5 / §6 落形写明 | §2.1 |
| 10 🟡 | 增**最接近先例行**：先例批次 + 对位设计节 + 实现坐标；对齐面 = 方法，偏离面 = 方向 + 两条偏离理由；无同形先例显式声明；反转对象 D-PS1 / D-C14 / M9 / D14 逐条点名 | §2.12 最接近先例行 |
| 11 🔵 | 勘察证据行补独立仓结论：`D:\ref\` 不入索引 + `index.publicRepos = []` ⇒ 不相关（已查无） | §2.12 勘察证据行 |
| 12 🔵→🟡 | **单一口径**（`split('\n').length - 1`，新进程直跑）复测逐档：**CN 1475 / EN 1505**（16 档加总）；§2.3 逐档表、合计行、§2.11 同值；§1 读数由本表取代 | §2.3 · §2.11 |

**修正轮附带（非评审条目，一并记）**：① §2.3「标题数逐档 16 对全等」本次复测仍成立（`^#{1,6} ` 逐档计数）；② §2.11 验收对照表原 AC1 / AC3 / AC7 列数不齐（4 格对 3 列表头），本轮统一为 3 格。

**新发现（外于本批条目 · 报父侧知会）**：`DOC-SYSTEM.md:326-327` §11 表「当前行数」列与现盘不符——CN 写 189、实测 207；EN 写 264、实测 198。A11 的改后已按实测值给出；该表其余行未复测（不属本批面）。

## §3 设计评审（评审子代理）

### 轮次 1（评审子代理）

**评审对象**：批次档 §2（16 对镜像对账 + 目标态 + 陈述逐处清单 + 引用清扫 + 迁移六步）· 对象状态 = 待评审
**评审范围（实读全文）**：`thincoder/docs/batches/2026-10-18-prompt-single-face.md` §2 · `docs/core/design/PROMPT-SYSTEM.md` · `docs/core/design/DOC-SYSTEM.md` · `docs/core/design/DOC-DISCIPLINE.md`
**计数**：🔴 1 · 🟡 9 · 🔵 2

| # | Category | Severity | Issue | Suggestion |
|---|----------|----------|-------|------------|
| 1 | Document ownership | 🔴 | §2.6 A 组（A1–A20）与 §2.7 逐处清单漏 `DOC-SYSTEM.md` 两处现役规范句：`:143`（P4 判据句「提示词**正本**（中文设计档）= 文档面（随 core）」，机检落点「二者档名集合相等且各 16 / 52 档」）与 `:79`（§4 目标树「提示词**中文设计档正本**（16 档）」）。A11 只列 `:121 / 269 / 272-276 / 343 / 355`，A9 只列 `:301-308`，§2.7 只列 `:305-308`；`:143` 不含路径字面 ⇒ R4/R5 机械判据抓不到。执行后 P4 与目标态（单一副本 = EN）成两张并立活描述 | A11 增列 `:143` / `:79` 并给逐字现文 + 改后；P4 改后须删「16 / 52 档相等」这一已无对象的机检落点；§2.7 对应处置类同步登记 |
| 2 | Requirements / Clarity | 🟡 | 三项上抛在 §1 已裁、§2 仍作待裁，且可执行项沿用裁前假定：§2.12 U1/U2/U3 仍写「上抛·待裁」，而 §1 23:08 已裁（U1 = 按判据 A、不采纳按面分层；U2 = D7「变更记录」项按 D8 删）；E1 仍列 `advisor-{design,round1,round2,round3}:8` 的 EN 对应位，而 §1 U3 记其实测为英文；§2.3「EN 侧另有 11 处中文未译」与 R1「7 处 + 4 处」承此旧读数（真未译 = 3 + E2 的 4）。E1 判据「语义与 CN 等值」对那 4 处与 §2.4 #9「语义相抵」自相矛盾 | §2.12 三行改写为「已裁 + 裁定内容」；E1 坐标按 U3 更正后重算；§2.4 #4/#9 与 E3 分类随裁定对齐并给出四处 EN 的改后文本 |
| 3 | Acceptance criteria | 🟡 | R5 完成判据与 §2.7 自设处置面冲突：`grep -r "design/prompts" docs/ scripts/` 零命中 会命中本批次档自身（docs/batches/**）与已声明不处置的 `_archive/**`；R4 判据 只余「已删」行外零命中 只认全字面 `docs/core/design/prompts`，树形 / 散文形（如 DOC-SYSTEM §4 目录树）漏判 | 两条判据写明域 + 排除集（batches / _archive / 产品参照树），并与 §2.7 注一致；R4 增补「非路径字面陈述」判面或改为逐处清单勾稽 |
| 4 | Acceptance criteria | 🟡 | AC1–AC7 无覆盖 §2.8（判定 B：B1/B2/B6/B7 机制档承载）与 §2.9（六轮顺序与轮际依赖 R2<R3、R4<R5）；迁移顺序是本批唯一的执行蓝图，现无验收项 | §2.11 增 AC 行：§2.8 四条硬规则各有机制档节 + 判据句；§2.9 逐轮完成判据与依赖关系在册 |
| 5 | Acceptance criteria | 🟡 | AC7 的证据不在档内：勘察证据行以「新进程直跑读数见交付报告」结句，`doc_check` 回执为本批自设验收项的读数却无读数 | 把读数（或明确记为未取到 + 原因）落进 §2.12，或把 AC7 判据改为档内可核项 |
| 6 | Clarity | 🟡 | A 组「改后」列留二选一：A10「整条删（两个对象变一个）；或改…」、A11「删或改…；§11 受影响文件表…按单面改」，实施者须自定形；AC3 要求「A 组逐处带现文与改后」，未达 | 每处定一形并写出改后句（不同形 = 分列两条），「按单面改」落到具体行与形态 |
| 7 | Clarity | 🟡 | B7 无落点：§2.8 写「建议补机制文档（`discipline-engineering` 机制档头节）」——该名与被删镜像同名且非机制档；§2.11 记「待定一处（B7）」，R2 完成判据却要求 B7 有节 | 为 B7 指定唯一机制档落点与节位（同名歧义消解），或把它移出 R2 的硬前置并入不需落点的一类 |
| 8 | Affected files | 🟡 | §2.11 受影响文件表缺标注与缺档：唯一改动的源档 `scripts/prompt-refs-check.mjs` 无「现行行数 / 预计 Δ」（项目口径 = 源 / 测试档保留该两列）；A2 令「`promptsLanding` 键退场」，但 `PROJECT-MANIFEST.json` 未列、无轮次——键若真退场即唯一漏列改动面 | 补 `scripts/prompt-refs-check.mjs` 的行数与 Δ；A2 写明是删 manifest 键（则入表并给轮次）还是只退场文档表述（则键留） |
| 9 | Scope / Methodology | 🟡 | 本批无实施面：§2.9「每轮 = 一个批次（各自 §1–§6）」把 R1–R6 全拆给他批，§2.2「批准后由下一轮整批落笔」⇒ 本批 §5 无内容，收口链路（§5 段）无以为继 | §2.1 / §2.12 显式声明「本批 = 判定批，实施面 = R1–R6 各自批」，并给出本批 §5/§6 的落形 |
| 10 | Closest precedent | 🟡 | 无最接近先例行：档内只有「先例行」（查过哪些档）与「勘察证据行」，无先例坐标（实现坐标 ∥ 对位设计节 ∥ 先例批次）+ 对齐 ∥ 偏离理由。本批反转 D-PS1、D-C14、M9、D14，属有意偏离，缺显式偏离理由行 | 增一行最接近先例：给出先例批次 / 设计节坐标，写明对齐面与偏离理由（无同形先例亦须显式声明） |
| 11 | Survey evidence | 🔵 | 勘察证据行在册但只记内部两树；独立文档仓（参考系 = `D:\ref\`，工作区外）未记「已查无 / 不相关」——缺该句读作未查 | 勘察证据行补一句独立仓结论（相关面 / 已查无 / 不相关 + 依据） |
| 12 | Doc hygiene | 🔵 | 同一事实两处读数：§1 表「CN 1476 行 · EN 1495 行」vs §2.3「行数 CN 1491 / EN 1511」（§2.3 逐档行数加总恰为 1491 / 1511，自洽） | 落笔前复测一次，只留一处读数，另一处改指或删 |

**未验证项（越出本轮评审范围，不作判据）**：A13（`CORE-UNIFICATION.md:485`）· A14（`ENGINEERING-MODE-V2.md`）· A15（`ARCHITECTURE.md`）· A16（`docs/README.md`）· A20（`TWO-REPO-MERGE.md`）· B 组 24 档逐处坐标 · 需求档 12 档逐处坐标 · `scripts/prompt-refs-check.mjs:10/13/25` 实测 —— 这些档不在本轮 Documents to Review 清单内，坐标未核。
**范围限制**：本轮无项目标准档、无文档地图声明（Document ownership 判据退化），归属判据以 Project Guide + 在盘 `DOC-SYSTEM.md` / `DOC-DISCIPLINE.md` 规则为准。

VERDICT: changes-required
**计数**：🔴 1 · 🟡 9 · 🔵 2

## §4 用户批准（主 agent）

**用户批准（2026-10-18 23:21）**——用户逐字「批准」。

**批准范围**：本批**设计**（§2 · 12 条评审发现已全修并经父侧复核），即 **R1–R6 六轮执行蓝图**。

**批准依据（在盘）**：

| 项 | 读数 |
|---|---|
| §3 评审轮次 1 | **changes-required**（🔴1 · 🟡9 · 🔵2）——12 条父侧全收 |
| 修正轮 | 12 条逐条落档（A21/A22 补入 · P4 机检落点换有对象判据 · 行数单口径复测 · U1/U2/U3 已裁 · AC8/AC9 在册） |
| 父侧复核 | §2.3 逐档表加总 = **1475 / 1505**、差异计数 = **46 / 29 / 21**，与合计行、实测、差异计数**四处全等**；`PASS（0 档）`（批档在声明域外，如实记） |

**本批性质（已写进 §2.1）**：**判定批**——§5 无实施动作；实施面 = R1–R6 各自批。

**批准不含**：R1–R6 的实际执行（各自批走各自的 §1–§6，本设计为其输入）；EN 提示词内容的改动（R1/R3）；机制文档的改动（R2）。

## §5 实施记录（eng-coder）
## §6 验证与收口（父代理）

### 验收与收口（父侧 · 2026-10-18 23:22 · 判定批）

**① 交付验证（父侧亲跑）**

| 项 | 读数 | 手段 |
|---|---|---|
| §2.3 逐档表加总 | CN **1475** · EN **1505** | 父侧按行加总，与合计行 / 实测 / 差异计数四处全等 |
| 差异计数 | CN 独有 **46** · EN 独有 **29** · 语义相抵 **21** | 同上 |
| A21/A22 | 在盘（`§5.1 P4` 判据 · `§4 目录树` 子行） | 父侧实读批档 `:213` / `:227` |
| 门 | `DOC-CHECK GATE: PASS（0 档）` | 新进程直跑；批档在 `checkConfig.anchors.exclude` 内，**0 档入判 = 判据未实际执行**，如实记 |

**② 结算核对**

- 台账 `#1682`：**保持未核销**——本批交付 = 设计，需求本身（取消中文镜像）要等 R1–R6 落地才成立。指针已挂本档。
- §1–§6 均有内容；§5 按判定批声明「无实施动作」。

**③ 文档机检门**：会话工具面 `ERROR（引擎已更新…）` ⇒ **`batch close` 会被拒**，本档保持「进行中」，重启后复跑 gate 即收口。新进程读数 = `PASS（0 档）`（批档不在声明域）。

**④ 暂缓批复核**：无暂缓批。

**⑤ 收口测试线**：本批**无代码变更**（判定批）⇒ 无单元测试面；集成场景未受影响。

**⑥ 移交入口（R1–R6，各自批）**

| 轮 | 内容 | 输入 |
|---|---|---|
| R1 | 补译 EN 中文残留（3 处 + 4 处） | §2.5 E2 · §2.4 #4/#9 定稿句 |
| R2 | 机制文档补 4 条硬规则（A / 发现须验证 / 范围外口径 / 规则自加前提） | §2.8 B1–B7 · B7 落点 = `DOC-DISCIPLINE.md` §4.4 |
| R3 | EN 补规则 + 向机制档对齐 | §2.4 十五行 · §2.5 E1/E6 |
| R4 | 改陈述 22 处 + 24 档 + 需求档 12 档 | §2.6 A1–A22 · B 组 |
| R5 | 删 16 档 + 引用清扫（**必须同批**） | §2.7 D/M/E/K/W/C 六类 |
| R6 | 三读数收口 | §2.9 |

**硬前置**：R2 < R3（机制档先有承载，EN 才能向它对齐）；R4 < R5（先改指针再删档，否则中间态必有死指针）。
