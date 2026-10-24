# 2026-10-21 · reuse-first
> 六段 append-only，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 编制：主 agent · 2026-10-21 · 来源 = 用户令（2026-10-21 16:10「三次重造轮子」+ 16:12「可以，落」）：落地前三问（哪里有 ∥ 叫什么 ∥ 谁在用）、偏离收窄、笔前也答、评审计存在性。
> 台账 = #1724（ENGINEERING-MODE · 归批）。前情 = docs/batches/2026-10-20-requirements-discussion.md §13.16（已收口 2026-10-20）。
## §1 讨论（主 agent）
**状态行**：已收口 2026-10-21
<§1 模板占位：本批条目 / 关键判据 / 授权口径>

## 讨论记录

**用户报告（2026-10-21 16:10，逐字）**：「thincoder 有每次重新造轮子的倾向：我犯的错，第三次了。第一次 JSON 显示 → 自己写行内展开；第二次 筛选控件 → 自己写「偏离一处」；第三次 标签文字 → 自己起名「案字段」「正文」。三次都是同一个毛病：有现成的名字 / 现成的组件 / 现成的端点，我没先看，先自己发明。往后我落任何一条之前，先回答三句话：这功能现在哪里有？叫什么？谁在用？答不上来再动手。」→ 16:12「可以，落」。

**父侧诊断（结构原因）**

| # | 原因 | 证据 |
|---|---|---|
| 1 | **所有门都是内部自洽门，没有存在门**——需求↔设计↔实现↔测试逐层查「前后一致」，无一道问「是不是已经存在」 | 本会话 `#1720`（F-W23）走了五道门（设计 → 评审 pass → 修正 → 实施 → 代码评审两轮 pass）零拦截；而答案就在 CLI 同包：`subagent-blocks.mjs:308`/`:323`（think 不碰 `currentTool`），设计只引了 `:341` 未读 308/323 |
| 2 | **先例勘察只有动词，不要求答出名字** | `discipline-engineering.md:40`「survey how similar … align first; an intended deviation ⇒ an explicit rationale」——「相似」即可交差；「偏离 + 理由」是合法通道（F-W23 的偏离理由逐字：「F-W23 ①/② 逐字指定」） |
| 3 | **设计席的交付物只有新东西** | 流程每步产物 = 新设计档 / 新任务书 / 新实现；「它已在 X，用它」不是任何一步的产物，不产出可验收物 |
| 4 | **三问没挂在「笔」上** | 三次实例全是小改（行内展开 ∥ 筛选控件 ∥ 标签文字）——走轻通道 / 直改，**不过设计档**；只加「设计前」规则对三例全部无效 |
| 5 | **命名没有主人** | 「一名一物」是文档纪律；执行面只有 doc_check 的指针/行宽，UI 标签/字段名/按钮文字无任何面拥有 |

**本批范围（= 需求 §13.17 六条 → 五种落面）**：① 三问前置 + 强制产出句式（`existing: … · name: … · consumers: …` ∥ `none found: <查过哪些面>`）；② 「偏离」收窄（仅能力/契约面失败可偏离）；③ 三问挂到「笔」前（轻通道含）；④ 设计评审加存在性判据（🔴）；⑤ 新名字必须挂靠现成概念名（`common.md` 跨角色）。

**可机检面**：三问答案行的**在场性**（`existing:` ∥ `none found:` ∥ `已查无：`）——让「没查」无法伪装成「查无」。其余靠评审判据。

**不做**：不改轻通道准入本体 · 不新增机械门（只加「答案行在场」一条文本判据）· 不改 FR38 的三条 · 不改数据前提门（`#1722`）。

## §2 批次任务与设计（eng-designer）
**状态行**：设计完成 2026-10-21（FR39 六条 → 五落面；设计 = PROMPT-SYSTEM §6.41（B1–B4 逐字文本 · 验收 A1–A10））
<§2 模板占位：本批条目（覆盖） / 设计档落点 / 机制设计 / 受影响文件与测试覆盖 / 验收对照 / 关键决策 / 上抛项>

**设计档**：`docs/core/design/PROMPT-SYSTEM.md` §6.41「落地前先答三问：现成的名字 ∥ 组件 ∥ 端点（重造轮子防御 · 提示词面显式化 · FR39）」——逐字英文块 B1–B4、落点表 L1–L6、对照表、用例表 C1–C8、验收 A1–A10、关键决策 K1–K7 均在该节；本段只引不抄（§6.37 口径）。

**本批条目（覆盖 = 需求 `ENGINEERING-MODE-V2.md` §13.17 六条）**：

| # | 需求条 | 落面 | 落地形 |
|---|---|---|---|
| 1 | 三问前置（哪里有 ∥ 叫什么 ∥ 谁在用） | `discipline-engineering.md:42` | 先例勘察句整行替换为「三问答出名字 + 答上即用现成件」 |
| 2 | 答案落盘（两形 + 两落点） | 同 L1 | `existing: <coordinate> · name: "…" · consumers: …` ∥ `none found: <surfaces checked>`；设计档新机制节每落点一行 ∥ 批档 §1 每笔一行 |
| 3 | 一名一物是判据面 / 新名挂靠 | `common.md:117` 后 | 新 bullet：UI 标签 / 字段名 / 按钮文字 = 现成概念名直译；无对应 ⇒ 登记新名 + 取代谁 |
| 4 | 三问也在「笔」前 | `persona-engineering.md:109` 后 | 轻通道节新增一段：笔前答三问、答案进 §1 笔行；准入三例零改 |
| 5 | 「偏离」条款收窄 | 同 L1（先例勘察句内） | 偏离仅在现成件不可复用；理由指名能力 / 契约面具体失败；口味非理由 |
| 6 | 设计评审加存在性判据（🔴） | `advisor-design.md:24` 后 | 新第 11 条 Existing-piece check：现成件未用且无不可用理由 ⇒ 🔴；缺答案行仍 🟡 |

**受影响文件（现行 = 本席 `node` 实读 · 2026-10-21；Δ 逐档实算，明细在 design §6.41 受影响文件表）**：

| 文件 | 动作 | Δ / 上限 |
|---|---|---|
| `thincoder-core/prompts/discipline-engineering.md` | L1 整行替换 | +1,086 字符 / ±0 行 → 39,289（+2.84% / 39,349） |
| `thincoder-core/prompts/persona-engineering.md` | L2 插入 | +717 字符 / +2 行 → 65,851（+1.10% / 67,088） |
| `thincoder-core/prompts/common.md` | L4 插入 | +568 字符 / +1 行 → 44,296（+1.30% / 45,039） |
| `thincoder-core/prompts/advisor-design.md` | L3 插入（判据 10 → 11 条） | +357 字符 / +2 行 → 12,631（+2.91% / 12,642） |
| `docs/core/design/PROMPT-SYSTEM.md` | 本设计轮：§6.41 新增 + §6.26 计数行 `10` → `11` | 已落（设计面） |
| `thincoder-core/tool-docs/**` · 产品代码 · 需求档 · 批次档六段结构 | 零改 | ±0 |

**测试覆盖**：零单元测试档（纯提示词文本、无分支）；机判 = 既有 `scripts/prompt-refs-check.mjs`（基线读数 69 档 / 463 档 / 命中 0）+ 交付门 `doc_check`；实施轮在 §5 记一行复跑读数。

**验收对照（回指 design §6.41 A1–A10，不在此重述判据）**：

| 需求验收 | 对应 |
|---|---|
| §13.17 ①（三问句在场） | design §6.41 A1 |
| §13.17 ②（答案行两形 + 两落点；抽样机判） | design §6.41 A2 ∥ A9 |
| §13.17 ⑤（偏离收窄） | design §6.41 A3 |
| §13.17 ④（笔前也答） | design §6.41 A4 |
| §13.17 ⑥（评审存在性 🔴 + 条目数） | design §6.41 A5 |
| §13.17 ③（新名挂靠） | design §6.41 A6 |
| 跨条（携 why / 零文档引用 / 体量 / 与 FR38 零冲突 / 交付门） | design §6.41 A7 ∥ A8 ∥ A10 |

**关键决策（摘要 · 全文 = design §6.41 K1–K7）**：

- **K1**：评审判据落 `advisor-design.md` 第 11 条，**不新建** `.thincoder/advisor.md`——该档存在即**整档取代**内建判据（`thincoder-core/advisor/history.mjs:50-59`），新建会顶掉 1–10 条；该档当前不存在、manifest `advisor` 两字段为空。
- **K2**：三问 = 先例勘察句的执行形，整行替换（需求验收 ③ 字面：后者保留、前者是其执行形）。
- **K3**：两形定死 + 三字面（`existing:` ∥ `none found:` ∥ 中文记录面 `已查无：`）——让「没查」与「查无」可区分。
- **K4**：笔前规则与 discipline 层成对（受众分层 · 同 FR38 twin-anchor 处置）。
- **K5**：评审两档：现成件未用且无说明 ⇒ 🔴；缺答案行 ⇒ 🟡。
- **K6**：唯一机检项 = 答案行在场性，判据形（评审读设计档落点行 ∥ 父侧收口读 §1 笔行、抽样 ≥2），**不做机械门**。
- **K7**：§6.26 计数行与 §6.41 同步（`10` → `11`），D3 不留内部互斥。

**坐标说明**：需求 §13.17 引 `discipline-engineering.md:40`；现盘实读 `:42`（FR38 的 R1 在 `:35` 后插入两行所致，§6.40 L1 已预告）。本条按现盘坐标落笔，`:40` 作历史引文。

**边界（不做）**：不改轻通道准入本体 · 不新增机械门 / 脚本 / CI · 不改 FR38 三条（`discipline:37` `:39` `common:17`）· 不改数据前提门（`#1722`）· 不改评审收敛流程与严重度体系 · 不改 `persona-eng-designer.md` 8 项形态 · 本设计轮 `thincoder-core/prompts/**` 零笔 · 产品代码零触 · 需求档零笔。

**上抛项**：无。

### 修正轮（设计评审 #50 收正 · 2026-10-21）

**评审表** = 本档 §3 轮次 1（🔴1 · 🟡5 · 🔵2 · VERDICT changes-required）。逐条处置落在 design §6.41（`docs/core/design/PROMPT-SYSTEM.md:2162-2312`），本段记编号 → 改动坐标。

| # | 处置 | 改动坐标 |
|---|---|---|
| 1 🔴 | **B4 改落 `discipline-engineering.md:117` 同一 bullet 的续句**（整行替换，不落 `common.md`）：判据面就在该行（一名一物已含 `UI word`），并入同条免两份活描述（D2）；`common.md` 无命名纪律节（`:113-118` = 搜索工具节）⇒ 原落点是错节。落点表 L4 / F4 行 / 对照表两行 / 勘察证据行 / A6 / 受影响文件表同步；A6 由「只判子串」改为**子串 + 节锚 + 行锚**（两串须同在 `## Doc discipline` 节内、同在 `- **One word per thing**` 起的行上） | design `:2162-2312` 全节；新增 K8 |
| 2 🟡 | 收口抽读落提示词：新增 **B2b**（`persona-engineering.md:104` 之后），落点表 L2b + A4 子串 + 机制第 7 件 + F6 行 + K9 | design `:2169`(F6) `:2190`(机制 7) `:2209-2214`(B2b) `:2233`(L2b) `:2296`(A4) `:2323`(K9) |
| 3 🟡 | 补第三形 `existing but unusable: <坐标> · name: "<逐字>" · failed on: <能力 ∥ 契约面失败>`：B1 / B2 / B3 三块同步，A2 加两子串，C9 新用例，机制 2 改写，K3 三形 + 记录面两字面 | design `:2180`(机制 2) `:2201`(B1) `:2206`(B2) `:2218`(B3) `:2262`(C9) `:2286`(A2) `:2317`(K3) |
| 4 🟡 | 对照表补 `persona:120` 行（同形不同题：派单给公共源坐标 ∥ 落笔交现成件答案；两形各定死、「缺行 = 没查」同源）；勘察证据行扩到 `persona:104-120` | design `:2247`(对照表新行) `:2331`(证据行) |
| 5 🟡 | K1 ② 收窄到**本仓 cwd**（`D:\teamcode\thincoder\.thincoder\` 无该档）+ 共存注记（工作区根 `D:\teamcode\.thincoder\advisor.md` 实存 ⇒ `history.mjs:53-58` 整档取代内建 ⇒ 只改提示词档在那一 cwd 不生效，影响未实证标 `unverified`）；证据行同步；边界行改「不写不删」 | design `:2315`(K1) `:2333`(证据行) `:2309-2311`(边界) |
| 6 🟡 | `jdata` 实例从公共层文案移除：B4 改通用例（字段名 = 产品已载概念的直译），机制 6 同改；A6 留「`jdata` 全档 0 次」判据 | design `:2185`(机制 6) `:2223`(B4) `:2294`(A6) |
| 7 🔵 | B1 括注 `(design precondition)` → `(any landing: design or direct pen)` | design `:2201`(B1) |
| 8 🔵 | 来源行 `§13.17 :826-845` → `:826-843` | design `:2164` |

**体量重算（与评审 #1 的 +3% 冲突已解 · 读数 = 本席 `node` 实算字长）**：

| 档 | 现行 | 改后 | 上限 |
|---|---|---|---|
| `discipline-engineering.md` | 203 行 / 38,203 | **39,326**（L1 +865 ∥ L4 +258） | 39,349 |
| `persona-engineering.md` | 244 行 / 65,134 | **66,326**（L2 +787/+3 行 ∥ L2b +405/+1 行） | 67,088 |
| `advisor-design.md` | 76 行 / 12,274 | **12,637**（L3 +363/+1 行） | 12,642 |
| `common.md` | 274 行 / 43,728 | **43,728（±0）** | 45,039 |

B4 落 `discipline-engineering.md` 后该档 +1,123（原方案 +1,086 已顶到 39,289，再落 568 会破 39,349）：解法 = 并入 `:117` 同条、复用该行既有 why，B1 与 B4 合计得 +1,123。

**交付门读数**：`doc_check(mode:"gate", target:"D:\teamcode\thincoder")` ⇒ `DOC-CHECK GATE: PASS`（1 档全清 / 0 命中；首跑命中行宽 1 条 = 边界行长 301 字符，同轮拆行后复跑 PASS）。

**零改核对**：`thincoder-core/prompts/**` 零笔（本设计轮）· 产品代码零触 · 需求档零笔 · 本档 §1/§3/§4/§5/§6 零改。

**坐标勘误（上表「改动坐标」列 · 读数 = 本节追加后逐行实读 `PROMPT-SYSTEM.md`）**：

上表若干坐标按改写前的草稿行号记，现盘实际行号如下（判据本体全部在 `:2162-2339` 内）：

| 锚 | 上表记 | 现盘实读 |
|---|---|---|
| design §6.41 全节 | `:2162-2312` | `:2162-2339` |
| F6 行（收口不读 §1 笔行） | `:2169` | `:2175` |
| 机制 2（答案落盘 · 三形） | `:2180` | `:2182` |
| 机制 6（新名挂靠） | `:2185` | `:2186` |
| 机制 7（收口抽读） | `:2190` | `:2187` |
| B1 逐字块 | `:2201` | `:2197` |
| B2 逐字块 | `:2206` | `:2203` |
| B2b 逐字块 | `:2209-2214` | `:2209-2213` |
| B3 逐字块 | `:2218` | `:2215` |
| B4 逐字块（`:117` 整行替换） | `:2223` | `:2221` |
| 落点表 L1 ∥ L2 ∥ L2b ∥ L3 ∥ L4 ∥ L5 ∥ L6 | 仅记 L2b/L4 | `:2231` ∥ `:2232` ∥ `:2233` ∥ `:2234` ∥ `:2235` ∥ `:2236` ∥ `:2237` |
| 对照表 `persona:120` 新行 | `:2247` | `:2251` |
| 用例 C9 | `:2262` | `:2271` |
| A2 ∥ A4 ∥ A6 | `:2286` ∥ `:2296` ∥ `:2294` | `:2290` ∥ `:2292` ∥ `:2294` |
| K1 ∥ K3 ∥ K9 | `:2315` ∥ `:2317` ∥ `:2323` | `:2317` ∥ `:2319` ∥ `:2325` |
| 勘察证据行 | `:2331` | `:2332-2335` |
| 体量读数 | 未记 | `:2300-2305` |

**表行读数（自检 · 逐表实数）**：验收表 A1–A10 = 10 行、无缺号；关键决策表 K1–K9 = 9 行；落点表 L1·L2·L2b·L3·L4·L5·L6 = 7 行；用例表 C1–C10 = 10 行。对照表 13 行（新增 `persona:120` 一行，`common:116`/`common:117` 两行换成 `discipline:116`/`discipline:117`）。

### 修正轮 · 设计面收口五条（2026-10-21 · 依据 = #53 内部评审 🟡1/🟡2/🔵3/🔵5 + §5 设计档漂移行）

**处置表（编号 → 改动 `file:line`）· 设计档现盘坐标 = 本轮写入后实读**

| # | 处置 | 改动坐标（`docs/core/design/PROMPT-SYSTEM.md`） |
|---|---|---|
| 1 🟡 | B3 加作用域：**「设计所依据的需求集要求该答案行时」**才判；不按「工程模式」限定（二择一理由 = K10；工程模式限定在普通模式仍误判——评审上下文无可核模式信号） | B3 逐字块 `:2218` · 机制 5 `:2185` · 唯一机检项读者行 `:2191` · 对照表第 9 条行 `:2255` · 新增 K10 `:2328` |
| 2 🟡 | B2 移出轻通道条：移到轻通道段末（`Closeout-chain segment map` 行之后 / `- **Round field**` 之前）、去两空格缩进去缩进成顶层段落；原 `:113` 段落删除。选「移」不选「原位去缩进」：原位去缩进会让紧随其后的 `Start-up booking`（同为两空格续段）反向读成 B2 的续段，缩进误归属只是换了方向 | B2 围栏 `:2203-2206` · 落点表 L2 `:2232` |
| 3 🔵 | 删 `(criterion 9)` 括注：第 9 条内无「缺答案行」落点，该括注指不到任何条文 | B3 逐字块 `:2218`（同 #1 一行） |
| 4 🔵 | 体量表加行数口径注：`split("\n").length − 1`；`read` 工具「N lines total」含末尾空段 ⇒ 多 1 | 体量读数 `:2302` |
| 5 🟡 | 体量读数收正：discipline 改后 **39,336**（非 39,326）· `:117` 原行 164 字符（非 174）· Δ +268（非 +258）· 合计 +1,133 · 余 13；连带 persona 66,324（B2 去缩进 −2）· advisor 12,634（B3 改后 +360） | 受影响文件表 `:2278-2280` · 体量读数 `:2304-2307` · K8 `:2326` |

**改后逐字块（权威 = 设计档围栏；实施席照围栏整行重落）**

- B2（`persona-engineering.md` · 顶层段落 · 无缩进）逐字 = 设计档 `:2206`（文本与现盘 `:113` 同，只去两空格缩进 + 换位）。
- B3（`advisor-design.md:25` 整行替换）逐字 = 设计档 `:2218`：`11. **Existing-piece check** — where the requirement set requires it: each new name ∥ component ∥ endpoint ∥ label text carries a three-question answer (where it lives · name, verbatim · who) in one of: … **An existing piece left unused with no reason it is unusable ⇒ 🔴**; a missing line stays 🟡.`（`existing: …` ∥ `none found: …` ∥ `existing but unusable: …` 三形与 🔴 判据子串零改——A5 三个子串仍各 1）

**体量（预测值 · 本席按字数实算；实测待实施轮）**

| 档 | 预测 | 上限 / 余量 |
|---|---|---|
| `discipline-engineering.md` | 39,336 | 39,349 / 余 13 |
| `persona-engineering.md` | 66,324（B2 去缩进 −2） | 67,088 / 余 764 |
| `advisor-design.md` | 12,634（B3 行 359 + 换行） | 12,642 / 余 8 |
| `common.md` | 43,728（±0） | 45,039 |

**零改**：`thincoder-core/prompts/**`（本设计轮零笔）· 产品代码 · 需求档 · 本档 §1/§3/§4/§5/§6 · B1 ∥ B2b ∥ B4 语义。

**上抛项**：无。

## §3 设计评审（评审子代理）

### 轮次 1（评审子代理）

### 设计评审 · PROMPT-SYSTEM.md §6.41（FR39）

**评审对象**：`docs/core/design/PROMPT-SYSTEM.md` §6.41（`:2162-2321`）∥ 需求权威 `docs/core/requirements/ENGINEERING-MODE-V2.md` §13.17（`:826-843`）。物证 = 现盘 `thincoder-core/prompts/{discipline-engineering,persona-engineering,common,advisor-design}.md` 定点实读。

| # | Category | Severity | Issue | Suggestion |
|---|----------|----------|-------|------------|
| 1 | Document ownership / Clarity | 🔴 | B4 落点指错文件：L4 写「`thincoder-core/prompts/common.md:117` 之后 | 插入 B4（bullet）」（设计档 `:2226`），F4 与两条对照行同指 `common.md:116-117`（`:2173`）；勘察证据行亦称 `common.md` `:113-118`（文档纪律 · 命名 · 一名一物）（`:2313`）。现盘 `common.md:113` = `### Search tool priority`、`:117` = `**Blocked/unreachable site (docs.claude.com / ai.google.dev etc.) → take a mirror path**`；而 `discipline-engineering.md:116` = `- **Naming discipline**: use names that carry definitions`、`:117` = `- **One word per thing**: one thing keeps one name across every surface`。⇒ 照 L4 实施会把命名条插进「搜索工具优先级」节；A6 只判子串在场、不判所在节 ⇒ 错位不会被判红；对照表两行（`common:116` / `common:117`）对不存在的文本声明「零矛盾」；同一机制（一名一物）由此在两层各留一份活描述，而 B4 未获 K4 给 B1/B2 的 twin-anchor 声明（D2 / R1 夹缝）。 | 按现盘重定 B4 落位：① 落 `discipline-engineering.md:117` 邻位（则须重算该档体量：38,203 + 1,086〔B1〕 + 568〔B4〕 = 39,857 > 上限 39,349，须削 why 或收身）；② 或仍落 `common.md` 并在正确节内落位 + 补四问分层理由 + 对 `discipline-engineering.md:117` 显式声明 twin-anchor（同 K4 形）；F4 / 对照表 / 勘察证据行 / A6 同步改为「节名 + 子串」双判（现只判子串）。 |
| 2 | Requirements coverage | 🟡 | 唯一机检项的读取义务无提示词落点：「② 父侧收口轮读批档 §1 的笔行——**抽样 ≥2 行，不足 2 行全查**」（`:2189`）只写在设计档（中文、运行期读不到）；L5 零改清单（`:2227`）未给任何收口读行义务的落点。本节自己诊断过「只加设计前对三例全部无效」（`:2164`）——同因：设计面单独的规则在运行期不触发。 | 把抽样读取义务落进人格层既有的收口清扫条（`persona-engineering.md`「Closing ledger sweep」邻位）并在落点表登记；或明写「设计面义务、不落提示词」并给理由。 |
| 3 | Requirements coverage / Acceptance | 🟡 | 需求 ② 的「为什么不能用」无形态、无落点：机制 2 只定两形（`:2181`），B1 只给 `existing: …` 与 `none found: <which surfaces were checked>`（`:2198`）——「现成件在但不用」这一格没有答案形，也没有写在哪的判据；A2 只判这两形（`:2275`）。 | 补第三形（现成坐标 + 能力/契约面失败逐字）及其落点，A2 同补一条子串判据。 |
| 4 | Survey / Closest-precedent | 🟡 | 最近同形条未勘察、未对照：`persona-engineering.md:120` 已载 `**if there are none, state「已查无」(checked — none found) explicitly**` + 「a missing line cannot be told apart from a survey that never ran」——与本节「缺行 = 没查」同形；B2 就插在其上方 11 行（`:109` 后），答案形却作 `none found:`。勘察证据行只覆盖 `:107-118`（`:2314`），对照表（`:2232-2244`）无此行。 | 对照表补该行并写明关系（同形不同对象：公共源坐标 vs 现成件），或复用既有 `已查无` 形，避免同档两种「查无」答案形并存无说明。 |
| 5 | Evidence-line accuracy | 🟡 | K1·② 写「该档当前不存在（`.thincoder/` 目录实读：无 advisor 档）」（`:2300`）——只对 `thincoder/.thincoder/` 成立；工作区根 `.thincoder/advisor.md` 存在（`:1` = `# Advisor 评审标准（workspace 级：D:\teamcode）`，含自带六维 design review 节），而 `thincoder-core/advisor/history.mjs:53-58` 在该档存在时**整档取代**内建判据。 | 把「不存在」收窄到实读的那个 cwd，并补共存注记（项目级 advisor 档存在时整档取代内建判据 ⇒ 只改提示词档在该 cwd 不生效）；行为面影响未实证者标 `unverified`。 |
| 6 | Methodology（公共层口径） | 🟡 | B4 把具体项目名带进公共层：`(e.g. a field label that names the `jdata` field)`（`:2216`）——本节 §6.10 口径行 = `新文零具体项目实例`（`:295`），且 §6.18–§6.29 的落层四问一律以「④ 通用层内容（零项目实例）」为准；`jdata` 是实例源项目（`D:\repos` 控制台）的字段名。 | 换通用例（如「与接口已有字段同名的标签」），不带具体项目名。 |
| 7 | Clarity | 🔵 | B1 标题保留括注 `(design precondition)`（`:2198`）而正文同一行已扩到 direct pen（`one line in batch record §1 beside that pen`）⇒ 括注与射程自相抵，读者可读成「只管设计前」。 | 删或改写该括注（如 `(any landing: design or direct pen)`）。 |
| 8 | Numeric drift | 🔵 | 来源行称 §13.17「`:826-845`」（`:2164`），该节实止于 `:843`（`:843` = `**落点**：…`，`:844-845` 空行）。 | 改 `:826-843`。 |

**计数**：🔴 ×1 · 🟡 ×5 · 🔵 ×2。已核对：四档现行行数（203 / 244 / 274 / 76）与 `split("\n").length − 1` 一致；`advisor-design.md` 条目 1–10 在 `:14-24`（无 11），L3 的 `:24` 后 / `:26` 前插入位正确；`discipline-engineering.md:42` 确为 Closest-precedent survey 行；`common.md:17` 确为 FR38 R3 行；§6.26 计数行已改为 `11`（`:644`）。

**VERDICT: changes-required**（1 🔴 未解：B4 落点错文件/错节，且修正后触及 `discipline-engineering.md` +3% 上限）

### 轮次 2（评审子代理）

### 第 2 轮复核（八条 fix claims 逐条对照现盘）

| # | 原# | 文件 | 严重度 | 状态 | 依据（本轮实读） |
|---|-----|------|--------|------|------------------|
| 1 | 1 | docs/core/design/PROMPT-SYSTEM.md | 🔴→ | Fixed | F4 `:2173` 改 `discipline-engineering.md:116-117`；B4 逐字块 `:2224` 替换 `:117`（原句前缀逐字保留）；L4 `:2235`；K8 `:2324` 给 D2 + 预算理由；A6 `:2294` 增节锚 + 行锚 + `jdata` 0 次；对照表 `discipline:116`/`:117` `:2253-2254`；勘察证据行 `:2334` 改述 `common.md:113-118` = 搜索工具节、无命名条。现盘锚点核对：`discipline-engineering.md:117` = `- **One word per thing**: one thing keeps one name across every surface — doc word = UI word = conversation word, 1:1; a second name for the same thing is a defect.`；预算重切 38,203 + 1,123 = 39,326 ≤ 39,349（`:2278` ∥ `:2302`） |
| 2 | 2 | docs/core/design/PROMPT-SYSTEM.md | 🟡 | Fixed | 读者职责进提示词面：B2b `:2212` 落 `persona-engineering.md:104` 之后（现盘 `:104` = `- **Closing ledger sweep (the dual of the opening self-check)**: at **every batch closeout**`）；L2b `:2233`；机制 7 `:2187`；K9 `:2325`；A4 `:2292` ∥ A9 `:2297`；C10 `:2272` |
| 3 | 3 | docs/core/design/PROMPT-SYSTEM.md | 🟡 | Fixed | 第三形到位：`existing but unusable: … failed on: …`（`：2182` ∥ `:2192` ∥ B1 `:2200` ∥ B2 `:2206` ∥ B3 `:2218`），中文面 `现成不可用：`（§6.30 K4 记录面字面类，判据按类）；A2 `:2290` 扩判；C9 `:2271`；K3 `:2319` |
| 4 | 4 | docs/core/design/PROMPT-SYSTEM.md | 🟡 | Fixed | 对照表新增 `persona:120` 行 `:2251`（同形不同题）；勘察证据行 `:2333` 覆盖 `:104-120`（含 `:120` 「已查无」） |
| 5 | 5 | docs/core/design/PROMPT-SYSTEM.md | 🟡 | Fixed | K1 `:2317` 限定「本仓 cwd」并写明工作区根 `D:\teamcode\.thincoder\advisor.md` 实存的共存事实（行为面影响标 `unverified`）；边界 `:2310` 明写不写不删该档 |
| 6 | 6 | docs/core/design/PROMPT-SYSTEM.md | 🟡 | Fixed | B4 `:2224` 已无 `jdata`；A6 `:2294` 增 `jdata` 全档 0 次；本节内 `jdata` 仅存于该验收句 |
| 7 | 7 | docs/core/design/PROMPT-SYSTEM.md | 🔵 | Fixed | B1 `:2200` 括注改 `(any landing: design or direct pen)`，与「直改笔也写」自洽 |
| 8 | 8 | docs/core/design/PROMPT-SYSTEM.md | 🔵 | Fixed | 来源 `:2164` 改 `:826-843`；需求 §13.17 实止 `ENGINEERING-MODE-V2.md:843` |
| N | (new) | docs/core/design/PROMPT-SYSTEM.md | 🔵 | New | 两档预算余量已贴顶：`advisor-design.md` `L3：**+363 字符 / +1 行** → 12,637（+2.96% / 上限 12,642）`（`:2280`，余 5 字符）、`discipline-engineering.md` 39,326 vs 39,349（`:2278`，余 23 字符），且 A8 `:2296` 未给「改后字符数实读」判法；字符总量本席无法复算（unverified）⇒ 逐字块实算若有偏差即越 D-PS42③ |

计数：🔴 0 · 🟡 0 未决（5 条全 Fixed）· 🔵 1（新，非阻断）· 原八条 = 6 Fixed + 2 Fixed（🔵 项）。落点锚点现盘核对通过：`persona-engineering.md:104`（收口清账条）∥ `:110`/`:111`（披露判据段 / Start-up booking）∥ `discipline-engineering.md:114` `## Doc discipline` ∥ `:116`/`:117` ∥ `advisor-design.md:23`/`:24`/`:25` 空行 ∥ `common.md:17`（FR38 R3 句）。

VERDICT: pass

## §4 用户批准（主 agent）

**批准依据（批级放行，覆盖批准门）**：用户 2026-10-21 16:12 逐字「**可以，落**」+ 16:35 逐字「**自动跑完**」（批级放行 = 批内全链自动跑完，评审照走）。按用户 2026-10-19 23:29 裁定（整批令覆盖批准门），本批不再单停批准门。

- 链路完整：设计 `#48` → 评审 `#50`（changes-required）→ 修正 `#51` → 复核 `#52`（pass）→ 实施 `#53` → 设计收口 `#54` → 重落 `#55` → 父侧复跑。
- 无 🔴 遗留；无跳步。

## §5 实施记录（eng-coder）
**状态行**：实施完成 2026-10-21（含修正轮 #54：B2 移位去缩进 ∥ B3 加作用域；四档体量 = 设计预测；审计 clean ∥ 代码评审 pass）



### 实施记录（2026-10-21 · eng-coder）

**落笔五处（逐字 = design §6.41 围栏块；判法 = 围栏内容整行取出与落笔行做 `===` 全串比较，非子串近似）**

| # | 文件 | 落笔后坐标 | 动作 | 逐字 | 字符 Δ | 行 Δ |
|---|---|---|---|---|---|---|
| L1 | `thincoder-core/prompts/discipline-engineering.md` | `:42` | 整行替换 → B1（三空格缩进） | ✅ `:42 === 设计 :2200` | 524 → 1,389 = **+865** | ±0 |
| L4 | 同档 | `:117` | 整行替换 → B4（原句前缀逐字保留 + 续句） | ✅ `:117 === 设计 :2224` | 164 → 432 = **+268** | ±0 |
| L2b | `thincoder-core/prompts/persona-engineering.md` | `:105`（`- **Closing ledger sweep` 条之后） | 插入 B2b bullet | ✅ | 404 + 1 换行 = **+405** | +1 |
| L2 | 同档 | `:113`（`The disclosure carries …` 段之后 ∥ `**Start-up booking**` 之前） | 空行 + 两空格缩进段落 + 空行 → B2 | ✅ | 784 + 3 换行 = **+787** | +3 |
| L3 | `thincoder-core/prompts/advisor-design.md` | `:25`（第 10 条之后） | 插入第 11 条（条目间无空行） | ✅ | 362 + 1 换行 = **+363** | +1 |

**体量（读数 = node fs 实读；行数口径 = `split("\n").length − 1`，与设计同口径）**

| 档 | 行（前 → 后） | 字符（前 → 后） | 上限 | 判定 |
|---|---|---|---|---|
| `discipline-engineering.md` | 203 → 203（±0） | 38,203 → **39,336**（+2.97%） | 39,349 | ✅ 余 13 |
| `persona-engineering.md` | 244 → **248**（+4） | 65,134 → **66,326**（+1.83%） | 67,088 | ✅ |
| `common.md` | 274 → 274（±0） | 43,728 → 43,728（±0） | 45,039 | ✅ 零笔 |
| `advisor-design.md` | 76 → **77**（+1） | 12,274 → **12,637**（+2.96%） | 12,642 | ✅ 余 5 |

（read 工具显示 persona「249 lines total」= 含末尾空段；设计口径 `split−1` = 248 = 244 + 4，两口径差 1，非漂移。）

**验收 A1–A10（逐条实读）**

| # | 读数 | 判 |
|---|---|---|
| A1 | discipline 内 `where does this function live now` ∥ `what is it called` ∥ `who uses it` ∥ `only a checked absence earns a new build` 各 1 | ✅ |
| A2 | discipline 内 `existing: <coordinate>` ∥ `none found: <which surfaces were checked>` ∥ `existing but unusable:` ∥ `failed on:` ∥ `one line per new landing in the new-mechanism section` ∥ `one line in batch record §1 beside that pen` 各 1 | ✅ |
| A3 | `not reusable` ∥ `concrete failure on the capability ∥ contract face` ∥ `is taste, not a rationale` 各 1 | ✅ |
| A4 | persona 内 `A pen answers the three questions before it moves`（`:113`）∥ `Closeout samples the pen lines` ∥ `read at least two of the round's §1 pen lines`（`:105`）各 1；轻通道三例（discipline `:54` ∥ `:56` ∥ `:58`）与一句边界（`:60`）原样 | ✅ |
| A5 | advisor 内 `Existing-piece check` ∥ `left unused with no reason it is unusable ⇒ 🔴` ∥ `existing but unusable: …` 各 1；`^11\. ` 计 1；本档 §6.26 计数行 = **11** | ✅ |
| A6 | 两串各 1，且同在 `## Doc discipline`（`:114-200`）内、同在 `- **One word per thing**` 起的那一行（`:117`）；`jdata` 四档 0 | ✅ |
| A7 | B1–B4 五块扫 `never\|do not\|don't\|must not\|may not\|forbidden` = 0；why 子句在场（B1 `only a checked absence earns a new build` ∥ B4 承接 `:117` 既有 `a second name for the same thing is a defect`） | ✅ |
| A8 | `node scripts/prompt-refs-check.mjs` ⇒ `提示词面 69 档 · 代码面 463 档 · 命中 0` + J1/J2/J3 零命中；五块内 `.md` 词元 0；`doc_check(mode:"gate", target:"D:\teamcode\thincoder")` ⇒ `DOC-CHECK GATE: PASS（0 档）`（三提示词档不在声明域，显式跳过） | ✅ |
| A9 | 「唯一机检项」段（设计 `:2189-2193`）在场；父侧读者有提示词落点 B2b；`scripts/` 零新增（git 未跟踪项 = 3 份批档，无脚本） | ✅ |
| A10 | discipline `at least one round of questions to the user and answers back` 1 ∥ `the user's explicit confirmation of the requirement set` 1 ∥ common `A doc answers facts; intent gets asked` 1 | ✅ |

**答案行在场性（三字面逐档读数）**：discipline `existing:`1 ∥ `none found:`1 ∥ `existing but unusable`1 ∥ `failed on:`1；persona 各 2（B2 ∥ B2b）∥ `failed on:`1 ∥ `已查无：`1 ∥ `现成不可用：`1；advisor 各 1；common 0（零笔）。A1–A10 全绿。

**零改核对**：`common.md` ±0（274 行 / 43,728 字符）· 设计档 / 需求档零笔（设计档的未提交改动 = 设计轮 §6.41，非本席）· 产品代码零触 · `persona-normal.md` / `discipline-normal.md` 零笔 · 轻通道准入三例与边界零改。

**git 态**：本席改动 = `thincoder-core/prompts/discipline-engineering.md` ∥ `persona-engineering.md` ∥ `advisor-design.md` 三档（另加本段）。`persona-engineering.md` 另有两处**本轮之前既存**的未提交 hunk（约 `:39`「Defaults stay in bounds」改写 ∥ 约 `:231`「A perceived file overlap…」新 bullet），不在本批 Δ 内、未触碰。

**内部审计（explore · 只读 · 1 轮）**：五块逐字 ∥ 位置 ∥ 缩进全对；A1–A7、A9（设计面）、A10 通过；唯一偏差 = §5 未写（本轮补写后归零）；A8 两项机判审计席无执行面 ⇒ 由本席读数补（见上）。终态 = clean。

**内部代码评审（advisor · code · 1 轮）**：`VERDICT: pass`（🔴 0 · 🟡 2 · 🔵 3）。两条 🟡 均属**设计覆盖面接缝、非实现偏离**（五块与设计逐字一致）：① 第 11 条射程宽于义务面——`advisor-design.md:1` 的 slot 声明 `advisor(type='design')` 即注入，普通模式设计评审同读该档，而 `discipline-normal.md:10-19` 只要求并只检查「两行」，该模式无三形答案位；② B2 两空格缩进使其读作轻通道列表项（`:108`）内的续段，与其末句「全链笔也写」形成范围暗示。三条 🔵：`(criterion 9)` 括注口径 · A8/体量读数评审席无执行面（本节已补读数）· 行数口径（评审席见 249 = 含末尾空段，设计口径 248）。处置 = 均不改落笔（设计面收口属父侧指派），交父侧裁。终态 = converged（pass）。

**设计档漂移（本席实读 · 交设计席 / 父侧）**：设计 `:2278` 预测 discipline 改后 **39,326**，实读 **39,336**（差 10）；成因 = `:117` 原行实长 **164** 字符，设计按 **174** 计（Δ 记 +258，实为 +268）。上限 39,349 未破，余量 13（设计记 23）。persona 66,326 ∥ advisor 12,637 ∥ common 43,728 与设计预测一致。

### 修正轮 #54（2026-10-21 · B2 移位去缩进 ∥ B3 加作用域）

**本轮范围 = 设计档 §6.41 修正轮（本档 §2 `:143-171`）的 F1 / F2 两块**；B1 ∥ B2b ∥ B4 零动，`common.md` 零笔。

| # | 文件 | 落笔后坐标 | 动作 | 逐字（全串 `===`） | 字符 Δ | 行 Δ |
|---|---|---|---|---|---|---|
| F1 | `thincoder-core/prompts/persona-engineering.md` | `:121` | 旧缩进段整块删 → 轻通道段末重插（顶层段落 · 零缩进 · 前后各一空行） | ✅ `:121 === 设计 :2206`（782 字符） | −2 | ±0 |
| F2 | `thincoder-core/prompts/advisor-design.md` | `:25` | 第 11 条整行替换（加作用域，去 `(criterion 9)` 括注） | ✅ `:25 === 设计 :2218`（359 字符） | −3 | ±0 |

**F1 落点读数**：`:119` = `Closeout-chain segment map…` → `:120` 空 → `:121` B2（行首即 `**`，零缩进）→ `:122` 空 → `:123` = `- **Round field**…`；全档 `A pen answers the three questions` 计 **1**（无第二份、无缩进副本）。
**旧址残痕处置**：上一轮插入块 = 空行 + 段落 + 空行（+3 行）。只删「段落 + 其前空行」会在 `:111` 披露段与 `**Start-up booking**` 之间留一行 HEAD 从未有过的空行（读数 66,325 / 249 行）；本轮按**整块删**（−3 行），旧址恢复 HEAD 相邻形（`:111` → `:112`），得 66,324 / 248 行——与设计档三处数字面（`:2232`「248 行不变」· `:2279`「66,324」· 本档 §2 `:153`「去缩进 −2」）同时吻合。判据 = 数字面唯一可对上，非口径自选。

**体量（读数 = `node` 实读 · 行数口径 = `split("\n").length − 1`）**

| 档 | 行（前 → 后） | 字符（前 → 后） | 上限 | 判定 |
|---|---|---|---|---|
| `discipline-engineering.md` | 203 → 203 | 39,336 → **39,336**（±0 · 本轮零笔） | 39,349 | ✅ 余 13 |
| `persona-engineering.md` | 248 → **248** | 66,326 → **66,324**（−2） | 67,088 | ✅ 余 764 |
| `common.md` | 274 → 274 | 43,728 → **43,728**（±0） | 45,039 | ✅ |
| `advisor-design.md` | 77 → 77 | 12,637 → **12,634**（−3） | 12,642 | ✅ 余 8 |

四档实测 = 设计档预测逐位相等（39,336 ∥ 66,324 ∥ 43,728 ∥ 12,634），无漂移。

**验收复跑（A4 ∥ A5 ∥ 机检）**

| 项 | 读数 | 判 |
|---|---|---|
| A5 作用域 | `advisor-design.md` 内 `where the requirement set requires it:` 计 1 | ✅ |
| A5 三形与 🔴 | `Existing-piece check` 1 ∥ `existing: …` 1 ∥ `none found: …` 1 ∥ `existing but unusable: …` 1 ∥ `left unused with no reason it is unusable ⇒ 🔴` 1 | ✅ |
| A5 条目数 | `^11\. ` 计 1；`(criterion 9)` 计 0 | ✅ |
| A4 | `A pen answers the three questions before it moves` 1 ∥ `Closeout samples the pen lines` 1 ∥ `read at least two of the round's §1 pen lines` 1 | ✅ |
| 机检 | `node scripts/prompt-refs-check.mjs` ⇒ 提示词面 69 档 · 代码面 463 档 · 命中 0（J1/J2/J3 零命中） | ✅ |
| `jdata` | 四提示词档各 0 | ✅ |
| 交付门 | `doc_check(mode:"gate")` ⇒ `DOC-CHECK GATE: PASS`（显式 docs 0 档——`batches` 在排除域） | ✅ |

**零改核对**：B1（`discipline:42`）∥ B2b（`persona:105`）∥ B4（`discipline:117`）本轮零笔（`discipline-engineering.md` ±0 为证）· `common.md` ±0 · 设计档 / 需求档 / 产品代码零触 · 轻通道准入三例与边界零改。

**git 态（`workdir=D:\teamcode\thincoder`）**：本轮改动 = `persona-engineering.md` ∥ `advisor-design.md` 两档。`persona` 另两处**本轮之前既存**的未提交 hunk（约 `:40`「Defaults stay in bounds」改写 ∥ 约 `:232`「A perceived file overlap…」新 bullet）不在本批 Δ 内、未触碰。

**内部审计（explore · 只读 · 1 轮）**：以行内容哈希核 F1/F2 两块与设计围栏**字节相等**；位置 / 零缩进 / 前后空行 / 单份性 / 编号 1..11 全过；旧址整块删的裁定判为忠实执行（数字面唯一可对上）。唯一偏差 = §5 无本修正轮条目（本段补写后归零）。终态 = **clean**。

**内部代码评审（advisor · code · 1 轮）**：`VERDICT: pass`（🟡 2 · 🔵 3，无 🔴、无 must-fix）。两条 🟡 均不属本轮落笔：① 设计档对照表 `PROMPT-SYSTEM.md:2249` 仍称「B2 落在 `:110` 之后」，与现盘 `persona:121` 相抵（design-state 滞后，设计席笔）；② 工作区根 `.thincoder/advisor.md` 整档取代内建判据（K1 已记），故 B3 在 cwd=`D:\teamcode` 不生效（协调项）。三条 🔵：§5 A4 旧坐标 `:113` 随移位失真（本段以 `:121` 记）· 第 11 条只列英文三形而 persona 面承认中文记录面（K3 已把中文形限定批次档 / 台账面）· 设计档 L2 单元格的插入 / 删除行数与其「248 行不变」自相抵。终态 = **converged（pass）**。

**设计档漂移（本席实读 · 交设计席 / 父侧，不越笔）**：① `PROMPT-SYSTEM.md:2249` 的 B2 落点括注（`:110` 之后）已失效于现盘 `persona:121`；② `:2232` L2 单元格「+3 行插入 ∥ −2 行删除 ⇒ 248 行不变」自相抵（照字面落成 249 行，本轮按整块删命中 248）；③ 第 11 条英文三形 vs K3「中文记录面（批次档 / 台账）」对中文设计档落点行无明文，评审遇 `已查无：` 答案行可误判缺行。

## §6 验证与收口（父代理）

## 验证与收口

**评审两轮**：`#50`（design · changes-required：🔴1 · 🟡5 · 🔵2）→ 八条全 Fixed（`#51`）→ `#52`（轮次 2 复核）= **pass**（新增仅 1 条非阻断 🔵）。实施两轮：`#53`（五块落笔，逐字一致）→ `#54`（设计面五条收口）→ `#55`（B2 移位去缩进 + B3 加作用域重落）。

**父侧复跑（2026-10-21 17:12）**

| 判据 | 读数 | 判定 |
|---|---|---|
| 四档体量（逐档 ≤ +3%） | discipline **39,336** ≤ 39,349（余 13）· persona **66,324** ≤ 67,088 · common **43,728** ±0 · advisor-design **12,634** ≤ 12,642（余 8） | ✅ |
| `prompt-refs-check` | 提示词面 69 档 / 代码面 463 档 · **命中 0**（J1/J2/J3 零命中） | ✅ |
| `doc_check` gate | **PASS**（设计档 + 需求档，2 档 0 命中） | ✅ |
| A1–A10 | `#53` 逐条绿；`#55` 复跑 A4/A5 绿；`jdata` 四档 0 | ✅ |
| 五块逐字 | B1 `discipline:42` · B4 `:117` · B2 `persona:121` · B2b `:105` · B3 `advisor:25` 与设计围栏全串相等 | ✅ |

**收口轮处置（父侧 · 机械小改，可回退）**

1. `PROMPT-SYSTEM.md:2232`（L2 单元格）——原「插入 +3 ∥ 删除 2 ⇒ 248 行不变」自相抵，改为「旧址连同前后空行整块删去 ⇒ 净行数不变」。
2. `PROMPT-SYSTEM.md:2249`（对照表 persona 行）——原「B2 落在 `:110` 之后」与现盘（`:121`）相抵，改为新落位表述。
3. 已知限制（登记，不改）：第 11 条只列英文三形；中文记录面两形（`已查无：` ∥ `现成不可用：`）按 K3 限于批次档 / 台账；设计档落点行按 B1 用英文形——若误用中文形，判为「缺行」🟡（信号正确，不误红）。改它需 +60 字符而 advisor-design 仅余 8 字符 ⇒ 不本批动。
4. 协调项（不本批处置）：工作区根 `.thincoder/advisor.md` 存在即整档取代内建判据（K1 已记），cwd=`D:\teamcode` 的会话不读本档第 11 条——是否处置由用户裁。

**收口清单**：doc_check 交付门 PASS · 暂缓批复核无 · 前批遗留无 · 用户文档面同步：无（提示词面，行为面随新会话生效）· 台账 `#1724` → **已核销** · 设计令牌链终消费 · 新债：无（已知限制 1 条登记在本节）。
