# 2026-10-20 · requirements-discussion
> 六段 append-only，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 编制：主 agent · 2026-10-20 · 来源 = 用户令（2026-10-20 23:18「关键问题是他没有跟用户进行过有效的讨论！」+ 23:20「开」）：需求阶段必须问出来 · 堵掉「答案不再改变需求」自判逃生口 · 文档答事实、意图/规则/取舍必须问。
> 台账 = #1721（ENGINEERING-MODE · 归批）。前情 = 无（独立批）。
## §1 讨论（主 agent）
**状态行**：已收口 2026-10-20
<§1 模板占位：本批条目 / 关键判据 / 授权口径>

## 讨论记录

**用户令（2026-10-20 23:15 / 23:18 / 23:20）**：「查一下它的会话历史，评估一下提示词系统，我想知道它碰到这么复杂的业务问题的时候为什么不先调研清楚就开始设计？」→ 我给出数据前提分析后，用户纠向更根本的一层：「**关键问题是他没有跟用户进行过有效的讨论！**」→「**开**」。

**实读（`d:\repos` 会话 `.3` · 4,106 消息 / 10-16 起）**：

| 指标 | 读数 |
|---|---|
| 助手消息 / 用户消息 | 1,910 / 230 |
| `question` 工具调用 | **4 次**——08:06「裁定列拆成…每格显示什么？」· 08:07「案型列与裁定列还留着吗？」· 14:49 参数空 · 14:49「设计 §8 改成全程走 v2 现有过程，可以吗？」——**全在设计成形之后** |
| 助手消息以问号结尾 | 51（2.7%） |
| 工具面 | `bash` 632 · `execute` 286 · `edit` 251 · `read` 164 · `batch` 85 —— 动手为主，发问极少 |
| 用户消息以祈使句开头 | 57（「你先去拉几条数据看看」「这些都不得…」「先检查前置」） |

**几处代表性事实**：04:55 用户问「operatingexp 的需求还没写吧？」→ 它才承认「对，还没写」；05:00 业务规则由用户给出（「航次/船/收款方/付款方/费用科目这些都是前置条件」），它回「这条把落脚点说清了」；09:19 / 12:10 / 13:52 三次源头纠正（v1∥v2 · `docbody`∥`og_voyage_port` · 字节数推业务）。形状 = **汇报 + 等纠正**，不是**讨论 + 求确认**。

**根因（提示词三处）**：① `discipline-engineering.md:30` 只有动词「discuss」、无机制（不问几次、不问什么算讨论过）；② `:37` 完成判据含自判逃生口「or answers no longer change the requirements」——一次没问也能宣布「答案不再改需求」；③ `common.md:15` 的成本过滤（「ask only when…」）被读成「先别问」，业务意图永远不在文档里，于是永不发问。

**本批范围（三条）**：① 设计前至少一轮「提问 → 用户回答」，覆盖业务规则 / 边界 / 优先级 / 验收口径四类，读代码只填事实；② 需求完成判据改「用户明确确认（原话或点选）」，删自判逃生口，未确认只出「待确认问题清单」；③ `common.md` 加分界——文档答事实，意图 / 规则 / 取舍必须问。

**不做**：不改 `question` 工具语义 · 不改 persona 的不阻塞 / 默认值 / 四停相 · 不改评审 ∥ 实施面 · 不改数据前提面（另议，`#1722`）。

**已确认**：用户 23:20 逐字「开」= 开批。评审发起照旧等用户（本次未给整批令）。

## §2 批次任务与设计（eng-designer）
**状态行**：设计完成
<§2 模板占位：本批条目（覆盖） / 设计档落点 / 机制设计 / 受影响文件与测试覆盖 / 验收对照 / 关键决策 / 上抛项>

### 本批条目（覆盖 · 回指需求档 §13.16 ∥ 台账 #1721）

| # | 条目 | 落点 |
|---|---|---|
| 1 | 需求必须问出来：设计前至少一轮「提问 → 用户回答」，覆盖业务规则 / 边界 / 优先级 / 验收口径；读代码只填事实 | 设计档 §6.40 R1（`discipline-engineering.md` `:35` 后 / `:37` 前插入） |
| 2 | 需求完成 = 用户明确确认（原话或点选）；删自判逃生口；未确认只出待确认问题清单 | §6.40 R2（同档 `:37` 整行替换） |
| 3 | `common.md` 分界：文档答事实；意图 / 规则 / 取舍必须问 | §6.40 R3（`common.md:15` 后插入一行） |
| 4 | 面分界：三条只作用于需求形成期；执行面（不阻塞 / 默认值 / 四停相）零改 | §6.40 R3 末句 + 对照表 persona 五行 |

**设计档落点**：`docs/core/design/PROMPT-SYSTEM.md` §6.40（机制 / 逐字英文文本 R1–R3 / 落点表 L1–L7 / 提示词条款对照表 + §6.34·§6.38·§6.39 对照表 / 用例表 C1–C8 / 受影响文件 / 验收 A1–A9 / 决策 K1–K6）。**读数与判据串以该节为准（只引不抄）**。

**实施轮落点（引 §6.40 落点表）**：L1 `discipline-engineering.md` `:35` 后插入 R1 段 · L2 同档 `:37` 整行替换 R2 · L3 `common.md:15` 后插入 R3 · L4–L6 零改（`persona-engineering.md` / `tool-docs` / 产品代码 / 需求档 / 批次档六段结构）。

**说明（实施席注意）**：R1 用段落不用 bullet——五要素列表仍是五条；L2 以 R2 前的收束段原文为锚，不按行号（L1 插入后 `:37` 下移两位，见 §6.40 表注 2）；§6.36 L3 的块 C 锚（收束段尾句 `are the marker that requirements were accepted.`）由 R2 逐字保留。

**受影响文件与测试覆盖**：文件清单与 Δ 读数见 §6.40「受影响文件」表；测试覆盖 = 零单元测试档（纯文本改动、无分支），机判 = 既有 `scripts/prompt-refs-check.mjs` + 交付门 `doc_check`，零新增常驻断言。

**验收对照（回指需求 §13.16 四条验收）**：

| 需求验收 | 设计验收 | 判法 |
|---|---|---|
| ① 三项在提示词面各 1 次（一轮 + 四类 · 用户明确确认 · 文档答事实 ∥ 意图规则取舍必须问） | §6.40 A1 / A2 / A3 / A4 | 子串机判，串见 §6.40 |
| ② 旧逃生口零残留 | §6.40 A2 | 提示词面扫 `answers no longer change the requirements` = 0；分析面引文不计（同 §6.38 A2 判据域） |
| ③ `prompt-refs-check` 命中 0 · 体量 ≤ +3% | §6.40 A6 | 脚本零参运行；三档合计上限见 §6.40「受影响文件」表 |
| ④ 与 `common.md:13` 无矛盾（分界句在场） | §6.40 A4 + 对照表 `common:14` / `common:15` 两行 | 分界句子串 + 逐句对照结论 = 零矛盾 |
| ⑤ 携 why、无禁令腔 | §6.40 A5 | 新增文本扫禁令词 = 0 |

**关键决策（引 §6.40 K1–K6）**：K1 R1 用段落（D3 五要素计数不牵动）· K2 R2 整行替换删逃生口（D8）· K4 分界按条件归类不写豁免（与 `common:15` 零冲突）· K5 面分界句落 `common.md`（全角色两模式共读）· K6 `persona-engineering.md` 零改（D2，需求点名的执行面零改）。

**边界**：`thincoder-core/prompts/**` 本设计轮零笔；产品代码 / 需求档 / `tool-docs` / 普通模式 / `question` 工具语义 / persona 执行面 / 数据前提面（`#1722`）= 零改。

**上抛项**：无。

### 修正轮（设计评审 #43 · 轮次 1 · 八条收正）

按评审 #43（🟡6 · 🔵4；#9/#10 无动作）逐条落地。落点 = 设计档 §6.40 内位置（改后实读行号）。

| # | 评审条 | 处置 | 落点（§6.40） |
|---|---|---|---|
| 1 🟡 | R1 落点位移未声明 | 补偏离 ③：位移 + K1 读序理由；R1 保持落 `:35` / `:37` 之间（A1 是子串判，两个落点都过） | 偏离块（`:2149-2150`） |
| 2 🟡 | L7 锚断言过宽 | 收窄：§6.36 锚 = 前段 + 后段逐字，前段由 R2 删除 ⇒ 锚退役、只剩尾句；判据 = A8 位置复跑 | L7（`:2062`）+ A8（`:2131`） |
| 3 🟡 | A6 按合计判体量 | 改逐档：discipline ≤ 38,457 · common ≤ 44,372 · persona ±0；合计 147,065 = 附带读数 | A6（`:2129`）+ 合计行（`:2111`） |
| 4 🟡 | R3 拆开过滤句与 `**Why**` | 插点移到 `common.md:16` 之后（Why 行后）；`:15` 与 `:16` 保持相邻 | R3 头（`:2046`）+ L3（`:2058`） |
| 5 🟡 | `persona:42` 跨层重复未处置 | 对照表补 `persona:42` 行：按 D-PS41 声明关键锚点重复（common 层 = 两模式 + 全部子代理；persona 层 = 工程侧；各层独立可读），保留不删 | 对照表（`:2079`）+ K6（`:2145`） |
| 6 🟡 | 边界与 R3 落点冲突 | 改 §6.14 限定形：普通侧专属档零改，公共层句经 `common.md` 照达普通侧 | 边界（`:2134`） |
| 7 🔵 | C3 期望多于文本 | C3 注明为对 R1 的解读（「你们定」= 用户对该类给出的答案），依据按 `:38` 当轮落盘；R1 文本不改 | C3（`:2097`） |
| 8 🔵 | A7 用改前坐标判 | A7 改按引文判；`:30` / `:31-35` / `:38` / `common.md:14` = 改前坐标、只作读数 | A7（`:2130`） |

逐档体量（A6 判据）：`discipline-engineering.md` 37,337 × 1.03 = 38,457.11 ⇒ ≤ 38,457（预计 38,203）· `common.md` 43,080 × 1.03 = 44,372.4 ⇒ ≤ 44,372（预计 43,728）· `persona-engineering.md` 65,134 ±0；合计 147,065。基线三档 = 本席 `node` 实读（201 行 / 37,337 · 273 行 / 43,080 · 244 行 / 65,134 字符），与 §6.40 受影响文件表一致。

坐标随动：`discipline-engineering.md` 的 `:37` 行在 L1 插入后下移两位；`common.md:17` 起在 L3 插入后下移一位（§6.40 表注 2 已载）。

零改面（本条修正轮）：`thincoder-core/prompts/**` · 产品代码 · 需求档 · 批次档 §1/§3/§4/§5/§6；只动 `docs/core/design/PROMPT-SYSTEM.md` §6.40 与本段 §2。

doc_check（交付门 · gate · 显式 docs = `docs/core/design/PROMPT-SYSTEM.md`）= `DOC-CHECK GATE: PASS`（0 条命中）。

上抛项：无。

## §3 设计评审（评审子代理）

### 轮次 1（评审子代理）

设计评审 · PROMPT-SYSTEM.md §6.40（FR38：R1 需求必须先问 ∥ R2 完成判据收紧 ∥ R3 common 事实/意图分界）

| # | Category | Severity | Issue | Suggestion |
|---|----------|----------|-------|------------|
| 1 | Requirements / Clarity | 🟡 | 需求 §13.16 把 R1 机制句的落点写成 `discipline-engineering.md:30`（ENGINEERING-MODE-V2.md:815），设计却把 `:30` 判为零改（PROMPT-SYSTEM.md:2060），R1 改落 `:35`/:37 之间（PROMPT-SYSTEM.md:2056）；偏离块（PROMPT-SYSTEM.md:2148）只列两条，未把这次位移写成偏离。 | 把这次位移补进「先例 ∥ 偏离」并给理由（K1 的读序论证），或把 R1 句落到 `:30` 行；A1 判据是子串判，两种都过，缺的是「已声明」。 |
| 2 | Clarity / doc-state | 🟡 | L7（PROMPT-SYSTEM.md:2062）称「块 C 锚 = 收束段原文；R2 保留其尾句 ⇒ 锚仍成立」，但 §6.36 登记的锚 = 前段 + 后段逐字（PROMPT-SYSTEM.md:1464），前段正是 R2 删掉的括注——只有尾句存活。 | 把断言收窄成 A8 实际重跑的位置判据（`are the marker…` → `A decision lands…` → `2. **Design**` 的次序），并注明 §6.36 前段引文已成历史（或记为锚退役）。 |
| 3 | Acceptance criteria | 🟡 | A6（PROMPT-SYSTEM.md:2128）按三档合计判体量（≤149,917 = 145,551×1.03），而 D-PS42 ③（PROMPT-SYSTEM.md:2206）定的是「每档净增 ≤3%」；合计式判据抓不到单档超限（当前逐档读数 +2.32% / +1.50% / ±0，均未破）。 | A6 改逐档判（discipline ≤38,457 · common ≤44,372 · persona ±0），合计读数留作附带。 |
| 4 | Clarity | 🟡 | L3（PROMPT-SYSTEM.md:2058）把 R3 插在 `common.md:15` 之后，等于把成本过滤句与它自己的 `**Why**` 行（`common.md:16`）拆开——插入后 `**Why**: the docs are…` 读起来像 R3 的理由。 | 插到 `common.md:16` 之后（或本节末 `:20` 后），让过滤句保住自己的 why；R3 自带行内 why，不依赖该行。 |
| 5 | Document ownership | 🟡 | R3 的「asking again spends the attention the first look was meant to save」与 `persona-engineering.md:42`「re-asking an authorized scope spends the user's attention」是同一规则的第二处活描述；对照表（PROMPT-SYSTEM.md:2076-2079）处置了 `:36-39` / `:40` / `:41` / `:54-59`，没有 `:42` 行，跨层重复未处置（D2 ↔ D-PS41 关键锚点重复）。 | 补一行 `persona:42` 的对照：或按 D-PS41 声明为关键锚点重复（写清各层须独立可读的理由），或从 R3 删去该子句。 |
| 6 | Clarity | 🟡 | 边界（PROMPT-SYSTEM.md:2133）写「不改普通模式」，但 R3 落的 `common.md` 本身就是普通模式的提示词面，K5（PROMPT-SYSTEM.md:2143）还明写「全角色两模式共读」——边界句读起来禁止了它自己描述的那次落地。 | 改用 §6.14 已有的限定形（PROMPT-SYSTEM.md:372）：普通侧专属档零改，公共层句经 `common.md` 照达普通侧。 |
| 7 | Acceptance criteria | 🔵 | 用例表 C3（PROMPT-SYSTEM.md:2096）期望「该类记为「用户已授权自定」并写明依据」，但 R1/R2/R3 没有任何一句要求记录这类授权——用例比文本多出一步。 | 或在 R1 文本里把「用户答不了」的出口写明，或在 C3 注明这是对 R1 的解读而非独立要求。 |
| 8 | Clarity | 🔵 | A7（PROMPT-SYSTEM.md:2129）用改前坐标 `:30` / `:31-35` / `:38` 判「逐字零改」；L1 插两行后 `:38` 已是另一行（插入段的空行），照行号复读会判错行。表注 2（PROMPT-SYSTEM.md:2115）只作通例提醒，A7 未标「改前坐标」。 | A7 标为改前坐标，或按引文判（同 L7 / §6.39 的锚点纪律）。 |
| 9 | Method / data integrity | 🔵 | 受影响文件行数与盘上实读一致（discipline 201 / common 273 / persona 244，各较 `read` 总行数少 1，口径 = `split("\n")−1` ✓）；字符读数（37,337 / 43,080 / 65,134 与各项 Δ）未独立复算——Δ 算式自洽（662+2+202=866 · 647+1=648 · 866+648=1,514 · 145,551+1,514=147,065 ≤ 149,917）。 | 无（预算面若被依赖，实施轮复读字符数即可）。 |
| 10 | Methodology / inputs | 🔵 | 本次评审未声明项目标准档与文档地图，ownership 判据改用 AGENTS.md + 本档自带的档位指路；§6.40 落在已拥有该主题的档（PROMPT-SYSTEM.md §6 族，未新建档），形态正确。 | 无——记为评审输入的限制。 |

VERDICT: pass
counts: 🔴 0 · 🟡 6 · 🔵 4

## §4 用户批准（主 agent）

**批准原话（2026-10-20 23:48）**：逐字「**批**」。

- 批准对象 = §6.40 设计 + 修正轮后的三处提示词文本（R1 / R2 / R3），落点与体量见 §2。
- 批准前状态：设计评审 #43 pass（🔴0 · 🟡6 · 🔵4）→ 修正轮 #44 八条全 Fixed（§2「修正轮」节）→ 父侧逐条核验（`:2150` 偏离 ③ · `:2062` 锚退役 · `:2129` 逐档体量 · `:2046` 插点 · `:2079` `persona:42` 行 · `:2134` 边界限定 · `:2097` C3 · `:2130` A7）。
- 评审发起 = 用户 23:29 逐字「评审」；实施授权 = 本条批准（非整批令，批准门由用户逐次开）。

## §5 实施记录（eng-coder）
**状态行**：实施完成 2026-10-20



### 实施记录（eng-coder · 2026-10-20）

**落笔（L1–L3 · 逐字 = 设计档 §6.40 围栏块）**

| # | 档案 | 动作 | 落点（改后实读） |
|---|---|---|---|
| L1 | `thincoder-core/prompts/discipline-engineering.md` | 插入 R1 段落（前后各一空行 · 三空格缩进 · 非 bullet） | 新 `:37`（原 `:35` 与 `:37` 之间） |
| L2 | 同档 | 整行替换原 `:37` 为 R2 | 新 `:39`；旧逃生口句已删 |
| L3 | `thincoder-core/prompts/common.md` | `:16`（`**Why**` 行）之后插入 R3 一行 | 新 `:17`；`:14`–`:16` 原文零改 |
| L4 | `thincoder-core/prompts/persona-engineering.md` | 零笔 | 改前改后 `sha256` 前 16 位同 `da9b9d0d9396ff9b`；244 行 / 65,134 字符 |

**机检读数（逐条 · `node` 实读）**

| # | 判据 | 读数 |
|---|---|---|
| 1 | 三块 = 设计档围栏块逐字 | R1 = `PROMPT-SYSTEM.md:2037` ✓ · R2 = `:2043` ✓ · R3 = `:2049` ✓（逐串相等；长度 662 / 514 / 647） |
| 2 | 旧逃生口（提示词面） | `thincoder-core/prompts/**` 扫 `answers no longer change the requirements` = 0 |
| 3 | A1（一轮 + 四类 + 读码只填事实） | `at least one round of questions to the user and answers back` 1 · `business rules · boundaries · priorities · acceptance criteria` 1 · `cannot stand in for the user stating it` 1（`discipline-engineering.md:37`） |
| 4 | A2（用户明确确认 + 待确认清单） | `the user's explicit confirmation of the requirement set` 1 · `the open-questions list, not a design` 1（`:39`） |
| 5 | A3 / A4（common 分界 + 面分界） | `A doc answers facts; intent gets asked` 1 · `are the user's to state and must be asked` 1 · `The line holds while the requirement is being formed` 1 · `the in-flight ask still steers with a workable default` 1（`common.md:17`） |
| 6 | A5（无禁令腔 + why） | 新增文本扫 `never` ∥ `do not` ∥ `don't` ∥ `must not` ∥ `may not` ∥ `forbidden` = 0；why 子句 `a fact can support a rule` 1 · `the work built on it gets redone` 1 |
| 7 | A6（机检 + 逐档体量） | `node scripts/prompt-refs-check.mjs` = `汇总：提示词面 69 档 · 代码面 463 档 · 命中 0`；`discipline-engineering.md` 203 行 / 38,203 字符（≤38,457）· `common.md` 274 行 / 43,728（≤44,372）· `persona-engineering.md` 244 行 / 65,134（±0） |
| 8 | A7（五要素计数 + 相邻句零改） | 五要素 bullet 5 条（`discipline:31-35`）；`discuss what's wanted until clear, land it in the requirements doc, confirm, then move on` 1 · `organized by **five elements**` 1 · `A decision lands in the round it is made` 1 · `common.md` 先查档句 1 —— 均原文零改 |
| 9 | A8（位置判据） | `are the marker that requirements were accepted.` 1 次（`:39`）→ `A decision lands in the round it is made`（`:40`）→ `2. **Design**`（`:41`），次序成立 |
| 10 | 体量合计（附带读数） | 三档 721 行 / 147,065 字符（+1,514 / +1.04%） |

**对照结论（A9）**：设计档 §6.40「与既有提示词条款逐句对照」表 = 零矛盾；实施后复读，新文与 `discipline:30` ∥ `:31-35` ∥ `:40` ∥ `:50-58`、`common:14` ∥ `:15` ∥ `:16`、`persona:36-42` ∥ `:54-59` 无字面冲突。引 §6.40。

**坐标位移（§6.40 表注 2）**：`discipline-engineering.md:37` 随 R1 插入下移两行（原收束段 → 新 `:39`）；`common.md:17` 起下移一行（原 `:17` → 新 `:18`）。按需复读，不留常驻锁。

**偏差审计 ∥ 代码评审 ∥ 修正轮**

| 轮 | 对象 | 结论 |
|---|---|---|
| 偏差审计（explore · 只读） | 实现 vs 设计 §6.40 · 落点表 L1–L3 · A1–A8 | clean（四类偏差 0 条；该席无执行面，字符读数引本席读数） |
| 代码评审（advisor · code） | 两档改动 + 设计档上下文 | pass；🟡2 + 🔵1 —— §6.36 锚悬空（设计档面）· §5/§4 记账（协调项）· A7 措辞（设计档面），均不在本笔改面 |
| 修正轮 | — | 0 轮（无 must-fix） |

**终态**：clean。

**披露**：越清单改动 = 无（触碰面 = `discipline-engineering.md` + `common.md`，与 L1–L3 相等）；工作树改前已脏（29 M + 8 untracked，他批遗留，含 `persona-engineering.md` 改前修改），本笔新增差异仅上述两档；产品代码 ∥ 设计档 ∥ 需求档 ∥ 普通侧两档零触。上抛：无（评审提出的设计档两条与 §4 记账归父侧收口轮处置）。

doc_check（交付门 · gate · docs = 本档）= `DOC-CHECK GATE: PASS（0 档）`——本档在 `anchors.exclude`（batches）内，落「不在声明域，未检」；提示词档 = 产品代码（`promptsLanding`），不在 `checkConfig.scanDirs`（docs）声明域。

## §6 验证与收口（父代理）

## 验证与收口

**父侧复跑（2026-10-20 23:56 · 独立于 #45 自报）**

| 判据 | 读数 | 判定 |
|---|---|---|
| 三档体量（逐档 ≤ +3%） | `discipline-engineering.md` **203 行 / 38,203**（上限 38,457）· `common.md` **274 / 43,728**（上限 44,372）· `persona-engineering.md` **244 / 65,134**（±0） | ✅ |
| 旧逃生口 | `answers no longer change the requirements` 全提示词面 **0** | ✅ |
| 四段子串（A1–A4） | R1 提问句 1 · R2 确认句 1 · R2 待确认清单句 1 · R3 事实/意图句 1 · R3 面分界句 1 | ✅ |
| 引用机检 | `node scripts/prompt-refs-check.mjs` ⇒ 提示词面 69 档 / 代码面 463 档 · **命中 0** | ✅ |
| A7 引文判 | `:30` 讨论句 · `organized by **five elements**` · `A decision lands…` 各 1；五要素子 bullet 5 条（`:31-35`） | ✅ |
| A8 位置判 | `are the marker…` `:39` → `A decision lands…` `:40` → `2. **Design**` `:41` | ✅ |
| doc_check gate | `DOC-CHECK GATE: PASS`（2 档 · 0 命中；首跑 REFUSED 一条 = 需求档 `:811` 423 字符，同轮拆行后复跑 PASS） | ✅ |

**上抛两项的处置（#45 报 · 父侧落）**

1. §6.36 锚与 §6.40 L7 说法不一 → 父侧**机械小改**（`PROMPT-SYSTEM.md:1464-1465`）：锚退役声明 + 坐标现值（`:30`/`:31-35`/`:37`/`:39`/`:41`）；删去已失效的旧「层次说明」行。可回退。
2. 批次档 §4 空 → 已补记（批准原话 + 批准前状态）。
3. 🔵 A7 措辞（「子 bullet 仍 5 条」会读到 6 条）→ 已限定为「五要素子 bullet 仍 5 条（`:31-35`；另有一条既有决策子 bullet，不计入）」。

**收口清单**

- doc_check 交付门（close 触发）：PASS。
- 暂缓批复核：无。
- 前批遗留横核：无（本批独立）。
- 用户文档面同步：无（提示词为运行时面，用户可见行为不变）。
- 台账：`#1721` 在途 → 待核销 → **已核销**；`#1722`（数据前提门）保持待讨论。
- 设计令牌：链终消费。
- 新债：无。
