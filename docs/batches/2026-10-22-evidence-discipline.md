# 2026-10-22 · evidence-discipline
> 六段 append-only，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 编制：主 agent · 2026-10-22 · 来源 = 用户 2026-10-22 11:39「当项目大的时候，agent 经常出拿推断当事实的问题，这个在提示词有办法抑制吗？」→ 11:44／11:45 两次校准判据 → 11:47「关键的位置加少量关键约束」；需求 §13.21（FR43）。
> 台账 = #1732（PROMPT-SYSTEM · 归批）。前情 = 无（独立批）。
## §1 讨论（主 agent）
**状态行**：已收口 2026-10-22
<§1 模板占位：本批条目 / 关键判据 / 授权口径>
## §2 批次任务与设计（eng-designer）
**状态行**：设计完成 2026-10-22
<§2 模板占位：本批条目（覆盖） / 设计档落点 / 机制设计 / 受影响文件与测试覆盖 / 验收对照 / 关键决策 / 上抛项>

### 任务（本批覆盖 · 逐条回指）

设计权威 = `docs/core/design/PROMPT-SYSTEM.md` §6.44（逐字英文 B1–B3 + 落点表 L1–L5 + 对照表 + 用例表 + 验收 A1–A9）；需求权威 = `docs/core/requirements/ENGINEERING-MODE-V2.md` §13.21（FR43）；台账 `#1732`。本段只给任务与判据，机制详述不重述（D2）。

| # | 覆盖条目 | 回指 |
|---|---|---|
| 1 | 依据 = 本轮读到的整行、逐字抄录；抄不出 ⇒ 标 `unverified` | 需求 §13.21 约束 1 · 设计 §6.44 机制 1 / B1 第 1 段 |
| 2 | 摘要 / 子代理回报 / 长期记忆 = 线索，不是依据；用作决定依据前回原档重读 | 需求 §13.21 约束 2 · 设计 §6.44 机制 2 / B1 第 2 段 |
| 3 | 决定面五处（设计取舍 · 验收 · 收口 · 派单任务书 · 评审结论）必须带依据 | 需求 §13.21 约束 3 · 设计 §6.44 机制 3 / B1 第 3 段 |
| 4 | 提问面的 checked-evidence 行接同一条形：`file:line` + 本轮逐字一行；查无写「checked, nothing relevant」并点名查面 | 用户 2026-10-22 补令「补」· 设计 §6.44 机制 5 / B3 |
| 5 | R9 判据：决定面无依据 ⇒ 🟡 | 需求 §13.21「落在两处」第 2 句 + 验收 ② · 设计 §6.44 B2 |

**落点（实测 · 2026-10-22）**

| # | 坐标 | 动作 |
|---|---|---|
| L1 | `thincoder-core/prompts/common.md:48` 后 / `:49`（空行）前 | 追加 B1 三段（每段一整行；前导空行 + 段间空行）；+6 行 / +1,312 字符 |
| L2 | `thincoder-core/prompts/common.md:43-48` | 零改（逐字保留）；取代关系 = 无 |
| L3 | `thincoder-core/prompts/advisor-round1.md:59`（R8）后 / `:60`（`Source:`）前 | 插入 B2 一行（体例同 R1–R8）；+1 行 / +352 字符 |
| L4 | 其余 14 档提示词 · `thincoder-core/tool-docs/**` · `scripts/**` · 产品代码 · 需求档 | 零改（±0） |
| L5 | `thincoder-core/prompts/common.md:19` | 原位替换该行（B3 逐字文本在 §6.44）；±0 行 / +238 字符；同段 `:13-18` / `:20-21` 零改 |

**实施面**：英文三段（B1）· R9 行（B2）· 提问面原位替换（B3）· 既有四句零改 · 取代关系 = 无（不删任何既有句）。英文逐字目标形 = 设计档 §6.44 的三个 fenced 块，eng-coder 照抄，不改写。

**验收（三条链 · 均已实测）**

| # | 链 | 判法 / 读数 |
|---|---|---|
| V1 | 文档引用 | `node scripts/prompt-refs-check.mjs` ⇒ 命中 0（2026-10-22 实跑：提示词面 69 档 · 代码面 463 档 · 0）；B1–B3 无 `.md` / 无 `§N` |
| V2 | 文档门 | `doc_check(mode:"gate", docs=["docs/core/design/PROMPT-SYSTEM.md"])` ⇒ PASS · 0 命中（父侧 2026-10-22 实跑，`#1731` 存量已清）；实施轮改后再跑一次同命令 |
| V3 | 子串机判 | `thincoder-core/prompts/common.md` 含 `Evidence is a line you read this turn, quoted as it stands` · `are leads, not evidence` · `A decision carries its evidence in writing` · `the line you read this turn, copied verbatim` 各 1 次；
  `thincoder-core/prompts/advisor-round1.md` 含 `R9 Decision surface without evidence → 🟡` 恰 1 次，`^R\d+[a-z]? ` 12 ⇒ 13 |

逐项判据 = 设计档 §6.44 验收 A1–A9（本段不重述）。

**口径（K1–K6 · 与既有条款零冲突 · 依据 = §6.44 对照表）**

| # | 口径 |
|---|---|
| K1 | 不要求全读：只对将要下的断言取证，读量不加 |
| K2 | `unverified` 保留：抄不出 / 原档够不着 ⇒ 标 `unverified`，总则 `:44-46` 不放宽 |
| K3 | 摘要保留线索价值（`Leads keep their value`）：只否定作依据，不否定作导航 |
| K4 | 零机械门：零脚本 / 零 schema / 零 CI；`prompt-refs-check` 是既有常驻锁 |
| K5 | 既有四句零改（`:44-48`）；替代关系 = 无 |
| K6 | 「非决定面可以不标」只按五面落，不落成总则放宽；被引进决定面 ⇒ 按所在处要求办 |

**体量（实测 + 预期）**：`thincoder-core/prompts/common.md` 304 行 / 49,173 字符 ⇒ 310 行 / 50,723；`thincoder-core/prompts/advisor-round1.md` 63 行 / 12,070 字符 ⇒ 64 行 / 12,422；两档 +7 行 / +1,902 字符；R 行 12 ⇒ 13。无预算帽（D-PS42 ③）。

**零改声明**：其余 14 档提示词 · `thincoder-core/tool-docs/**` · `scripts/**` · 产品代码 · 需求档 = 零改；不新增脚本 / CI / 机判门。

**上抛项**：无。`#1731` 存量裸名指针已由父侧清，gate 全档 PASS。附注（父侧笔，非本席写面）：需求档 §13.21「落在两处」尚未含提问面第三处落点，待父侧同步。

### 设计修订（评审轮 1 · 五条处置 · 2026-10-22）

| # | 评审条目 | 处置 | 落点 |
|---|---|---|---|
| 1 🟡 | 围栏 8 物理行 vs Δ「+6 行」——落地形态未入设计档 | 落点表旁新增「落地形态」行（每段一整行 ⇒ +6 = 前导空行 1 + 3 内容行 + 2 段间空行；围栏折行只为本档行宽、不作落地基线）；L1 动作行补「每段一整行」；受影响文件表补行数分解；§6.1 收尾核对补「围栏内折行时按去折行后的段比对」一句 | `docs/core/design/PROMPT-SYSTEM.md:2812` · `:2818` · `:2849` · `:144` |
| 2 🔵 | A4「五条口径」vs 对照表六行 | 改「六条口径」 | `docs/core/design/PROMPT-SYSTEM.md:2860`（对照表六行 = `:2824-2829`） |
| 3 🔵 | 对照表首行坐标 `:46` 与其所引内容不符 | 改 `:44` 与 `:48`（实测：`:44` 断言须可核句 · `:46` 两来源句 · `:48` 现取现用句） | `docs/core/design/PROMPT-SYSTEM.md:2824` |
| 4 🔵 | §6.44 无「计数连带（D3）」行 | 补该行，四项读数一并登记：`##` 20 ⇒ 20 · 标题节点 26 ⇒ 26 · `###` 6 ⇒ 6 · 需求档 `:64` 节表标题零改 | `docs/core/design/PROMPT-SYSTEM.md:2867` |
| 5 🔵 | 偏离 ① 未点名被偏离的 bullet 形先例 | 点名 §6.17 `:417-421` 五笔清单 ∥ §6.10 `:288-289` 两条 bullet（两处均本席实读） | `docs/core/design/PROMPT-SYSTEM.md:2887` |

**与前文同口径**：本段上表 L1 行已写「每段一整行；前导空行 + 段间空行；+6 行」——设计档现文与之逐项一致，前文零改。

**读数**：`doc_check(mode:"gate", docs=["docs/core/design/PROMPT-SYSTEM.md"])` ⇒ `DOC-CHECK GATE: PASS` · 0 命中（2026-10-22 本席实跑；首跑曾 REFUSED 1 条——本席 D3 行的裸名 `thincoder-core/prompts/common.md` 被锚判为档缺，改全路径后复跑通过，同轮修正）。

**零改**：产品代码 · 提示词文件（`thincoder-core/prompts/**`）· 需求档 · 本批 §1 / §3–§6。

### 设计修订（评审 #10 交接 · 2026-10-22 · 过渡豁免登记 + 行数验收作废）

**缘起**：`eng-coder #10` 评审 🔴——判据单源 `docs/core/design/DOC-DISCIPLINE.md` §3.18 未登记引擎已落的过渡豁免，与需求 §13.23 的三面同口径相抵；同轮作废 `docs/core/design/PROMPT-SYSTEM.md` §6.44 的「310 行」验收条。本段 = 处置记录；机制正文以两档设计文的现行节为准（D2，本段不重述）。

| # | 条目 | 处置 | 落点（改后坐标） | 读数 |
|---|---|---|---|---|
| 1 🔴 | 过渡豁免未登记 · 三份活描述互斥 | §3.18 新增「过渡豁免」独立块：行宽判定集减 `thincoder-core/prompts/**`、锚判取传入档全量；why = D-PS42③ 提示词面无行宽预算；覆盖偏移读数；归口 = FR45 换段判据后删除。判据句与边界行同轮改口，不留旧口径 | `docs/core/design/DOC-DISCIPLINE.md:854` · `:867-874` · `:901` | 与引擎注释 `thincoder-core/doc-check/index.mjs:33-42`、需求 §13.23 三点同口径 |
| 2 🔴 连带 | 模型可见契约与实机相反 | 「每个传入档整档受判」改为「锚判 = 传入档全量；行宽判 = 传入档减提示词面」，并写明报面两行读数 | `thincoder-core/tool-docs/doc_check.md:14-16` · `:23-25` · `:31-34` · `:52-55` | 提示词两档实跑：`REFUSED（命中 1 条）` = 锚 1 / 行宽 0，另出「行宽免判 2 档」行 |
| 3 | 「310 行」当验收 | 行数降为排版读数、不作断言；逐字判等按「去折行后的段」比对 | `docs/core/design/PROMPT-SYSTEM.md:2812` · `:2818` · `:2849` · `:2869-2870` | 落点表 +6 行保留为读数；验收 A1–A9 内无行数条 |

**为什么（文中已写，此处只回指）**：行数是排版副产品。被当成验收条之后，实施席为凑数把三段写成一整行，撞上行宽判据，整批被门拒写（需求 §13.23「这件事在本次会话里的代价」）。判据与验收都指向读者，不指向计数器。

**门读数（独立进程 · 新引擎 `thincoder-core/doc-check/index.mjs` · `runDocCheck` 直调）**

| 档集 | 读数 |
|---|---|
| 本批三档（两设计档 + 工具描述） | `DOC-CHECK GATE: PASS` · 0 命中（锚 0 / 行宽 0） |
| 提示词两档（覆盖偏移对读） | `REFUSED（命中 1 条）`——行宽 0 · 锚 1（`thincoder-core/prompts/common.md:82` 的操作数字面 `docs/core/design/MANIFEST.md` 被判档缺：D-PS6 操作数豁免清单、HEAD 存量，非本批引入）；报面另出「行宽免判 2 档」点名行 |
| 同两档 · 改前基线（§5 读数） | `REFUSED（62 = 行宽 61 + 锚 1）` |

**零改**：`thincoder-core/**` 代码（`.mjs`）零改 · `thincoder-core/prompts/**` 零改 · `docs/core/requirements/**` 零改 · §6.42 / §6.43 零改。`thincoder-core/tool-docs/doc_check.md` = 任务书第 2 项指定面（文档面，非代码）。

**本批不处置（在册 · 归 FR45 或后续轮）**：① `docs/core/design/MANIFEST.md:796` KD-M1-50 仍写「判定范围 = 解析范围 = 传入清单」——行宽面已不成立（同条 `widthExemptZones` / `exemptions` 两句仍真）；不在本批三档改动面内。② 豁免面住模块常量而非 `DOC_CHECK_BUILTINS`（`docs/core/design/DOC-DISCIPLINE.md` §7 F2 表与计数 3 未随动）· 报面文案两态各写一份 · 无回归用例——§5 遗留 ③，随 FR45 换判据收口。

**上抛项**：无（①② 已在册、归口明确）。

## §3 设计评审（评审子代理）

### 轮次 1（评审子代理）

**评审对象**：`docs/core/design/PROMPT-SYSTEM.md` §6.44 / D-PS44 + 需求 `docs/core/requirements/ENGINEERING-MODE-V2.md` §13.21（FR43）· 状态 = 待评审 · 排除 = 本档其它 §6.x 节。

**坐标核对（本席直读 2026-10-22）**：`thincoder-core/prompts/common.md:13-21`（`:13` 节标题 · `:14-18` 五句 · `:19` checked-evidence 句 · `:20-21` 尾两句）· `:43-50`（`:43` 节标题 · `:44-46` 总则 · `:47` 空行 · `:48` 现取现用句 · `:49` 空行 · `:50` `## Business gates`）· `##` 20 · `###` 6；
  `thincoder-core/prompts/advisor-round1.md:46-60`（R1–R8 = `:48`–`:59`，`^R\d+[a-z]? ` = 12 · R8 = `:59` · `Source:` = `:60`）——与本节声明逐项一致。需求 §13.21（`:940-952`）三条约束 + 落在三处 + 两条验收，设计均有对应落点（B1 / B3 / B2）。
  测试面无约束：`thincoder-core/test/**` 无一条断言这三档提示词文本（`advisor-project-context.test.mjs:74-81` 只扫 `advisor/project-context.mjs` ∥ `declaration.mjs`），受影响文件表「产品测试零改」成立。方法论判据面降级：本次上下文未提供项目标准档与文档地图（`docs/README.md` 不在评审面）。

| # | Category | Severity | Issue | Suggestion |
|---|----------|----------|-------|------------|
| 1 | Clarity / Acceptance | 🟡 | B1 围栏块的物理行数与其 Δ 声明对不上。围栏实为 6 内容行 + 2 空行（`:2777`–`:2784`），而 L1 的 Δ 写「+6 行」（`:2812`）、受影响文件表算「**+6 行 / +1,312 字符**（= B1 三段 1,306 + 6 个换行）」（`:2847`）——这两个数只在「三段各落一整行」时成立；
  该落地形态在 §6.44 里没有（批档写「每段一整行」，`docs/batches/2026-10-22-evidence-discipline.md:28`）。照围栏原样落 = 插入 9 行（前空行 + 8 行）⇒ `thincoder-core/prompts/common.md` 到 313 行而非 310；而 §6.1 的批次收尾核对以「落地档 ↔ 围栏块逐行」为基线，3 行落地对 8 行围栏必然对不上，实施席只能在两条指令间自选。 | 在落点表旁写明落地形态（每段一整行）与插入行数（+6 = 3 内容行 + 3 空行），并声明围栏内的折行只为本档行宽、不作落地基线；
  或去掉三段的折行，令围栏行数 = 落地行数。 |
| 2 | Clarity | 🔵 | 验收 A4 写「五条口径零冲突」（`:2858`），其上方对照表是六行（`:2818` 标题「与既有六条口径逐句对照」，`:2822`–`:2827` 六行）；批档同为 K1–K6。同一批里「五」与「六」并存。 | 把 A4 的计数改成「六条」，或把「无机械门」「既有四句零改」两类（不是既有口径）移出对照表，收敛为五条。 |
| 3 | Clarity | 🔵 | 对照表首行把「不要求全读」挂在 `:46`（`:2822`）：该行现文是两来源句（"An assertion has two sources only…"），「只对本席将要下的断言取证 ∥ 不预读无关代码」在 `:48`，把要求限定到「将要下的断言」的是 `:44`。坐标与其所引内容不符，而这张表正是「零冲突」结论的依据面。 | 坐标改成 `:44` 与 `:48`（或只写 `:48`）。 |
| 4 | Methodology / Clarity | 🔵 | §6.44 没有「计数连带（D3）」行。同档各落点节都单列（§6.16 `:408` · §6.17 `:431` · §6.18 `:453` · §6.19 `:473` · §6.20 `:497` · §6.21 `:523` · §6.26 `:651`），本节自己引的先例 §6.43 也以 A9 承载（`:2701`）。
  本节 D3 事实散在 K1 ∥ D-PS44（零 `##` 20 ⇒ 20）与 A2（R 行 12 ⇒ 13），而「标题节点 26 ⇒ 26 · `###` 6 ⇒ 6 · 需求档 `docs/core/requirements/PROMPT-SYSTEM.md:64` 节表标题零改」三项未登记。 | 补一行「计数连带（D3）」把四项读数一并登记，收尾对账只对一处。 |
| 5 | Closest precedent | 🔵 | 偏离 ① 写「三条写成三段而非三条 bullet」（`:2883`），但所列先例（§6.42 ∥ §6.43 ∥ D-PS42③）都不以「三条 bullet」形承载——被偏离的那个既有形没有被点名，判据要求的「点名所查先例」一半只剩集体指称。 | 点名一个用 bullet 形的同族先例（§6.10 两条 bullet · §6.17 五笔清单），或改写成「本节首次以段落承载三条」，与偏离 ② 同形。 |

**计数**：🔴 0 · 🟡 1 · 🔵 4 —— 需求覆盖（三条约束 × 三处落点 × 两条验收）完整；坐标实读全部对上；无测试面 / 机检面连带。

VERDICT: pass

## §4 用户批准（主 agent）

**批准记录（主 agent）**

- 本批实施轮（三处落文）在用户批准后启动。**记录缺口（如实记）**：批准原话当时未逐字抄进本节，只留在会话记录里；本节补记时不回填引文，避免把转述写成用户原话。
- 口径：批准即启动（用户 2026-10-19 定：批准/等价表示 = 实施开始，无第三步）。

## §5 实施记录（eng-coder）
**状态行**：实施完成 2026-10-22



**实施概述**：三处提示词落点 + 一处引擎改动。三段英文逐字取自设计档 `docs/core/design/PROMPT-SYSTEM.md` §6.44 的三个 fenced 块（围栏内折行只为该档行宽，落地按「去折行后逐段一整行」）；既有句零改，取代关系 = 无。引擎改动 = 父侧 2026-10-22 12:08 裁定引入的**过渡豁免**（行宽判据不判提示词面），注释里写明归口：FR45 把判据从「行」换成「段」后删除本豁免（引擎改造走 FR45 自己的批次，不并在本批）。

**落点表（提示词面 · 改后行号 · 逐字首尾各一句）**

| # | 坐标 | 动作 | 逐字首 | 逐字尾 |
|---|---|---|---|---|
| L5 | `thincoder-core/prompts/common.md:19` | B3 原位替换一行 | **Carry the checked-evidence line when you ask (both directions follow this)** | … and name the surface you checked — a query that missed and a surface with nothing on it otherwise read the same. |
| L1 | `thincoder-core/prompts/common.md:50-54` | B1 三段追加（`:48` 之后；
  原空行现为 `:55` · `:56` = `## Business gates`） | **Evidence is a line you read this turn, quoted as it stands.** Copy the whole line from the open file, character for character | … This rule reaches no further than those five; a claim carried into one of them answers to the rule where it now sits. |
| L3 | `thincoder-core/prompts/advisor-round1.md:60` | R9 一行插入（R8 = `:59` · `Source:` = `:61`） | R9 Decision surface without evidence → 🟡 — a design choice, an acceptance call, a closeout claim | … (report the claim and the line that should carry it — the author supplies the quote). |

**引擎改动（过渡 · `thincoder-core/doc-check/index.mjs`）**：行宽的判定集从传入档里减去提示词面（`PROMPT_FACE` · `thincoder-core/prompts/**`）；
  **锚判照旧**——`checkAnchors` 仍取传入档全量，一条不减。门面与报告面各出一条「行宽免判 N 档（提示词面无行宽预算 · 只读数不设帽——锚判照旧）」逐档点名行，结论行改为「锚判 N 档 · 行宽判 M 档」，返回形增 `widthSkipped`，JSDoc 同步。注释写三件事：理由（300 字符量的是人类读者读一行的负担，提示词档的读者是模型）、依据（`docs/core/design/PROMPT-SYSTEM.md` D-PS42③ 体量只读数、不设帽）、**过渡归口**（FR45 换判据后删除）。
  `width.mjs` 零改：直接把两档交给 `checkDocWidths` 仍报 61 条 —— 豁免住在调用面，判据实现本体未动。

**逐字判等（去折行后比对 · 5/5 全等）**：`node .thincoder/tmp/2026-10-22-fr43-verbatim-check.mjs` ⇒ `逐字判等 = 5/5`（exit 0）——`thincoder-core/prompts/common.md:19` = B3（498 字符）· `:50` = B1 段 1（491）· `:52` = 段 2（417）· `:54` = 段 3（398）· `thincoder-core/prompts/advisor-round1.md:60` = B2（350）。
  四个折行连接点各得一个空格：`from it stays` ∥ `where the source` ∥ `reaches no further` ∥ `the line that should carry it`。

**计数读数（UTF-16 字符 · 行数只作读数、不作断言——父侧 2026-10-22 裁定「310 行」验收作废，三段按常识排版、句末可换行）**

| 档 | 字符 | `##` | `###` | 标题节点 | `^R\d+[a-z]? ` |
|---|---|---|---|---|---|
| `thincoder-core/prompts/common.md` | 50,723 | 20 → 20 | 6 → 6 | 26 → 26 | — |
| `thincoder-core/prompts/advisor-round1.md` | 12,422 | 3 → 3 | 0 → 0 | 3 → 3 | 12 → 13 |

落盘形 = 每段一整行（既有形态，未重排）；行数读数（310 / 64）只登记、不判。

**门读数**

| 闸 | 命令 | 读数 |
|---|---|---|
| 文档引用 | `node scripts/prompt-refs-check.mjs`（仓根） | `汇总：提示词面 69 档 · 代码面 463 档 · 命中 0` · `OK(prompt-refs)：J1/J2/J3 三式零命中` · exit 0 |
| 逐字子串（A1/A2/A9） | 见上行脚本 | 五个见证串各恰 1 次；`R9 Decision surface without evidence → 🟡` 恰 1 次；R 行 13 |
| 既有句零改（A5/A9） | HEAD 对读 | `thincoder-core/prompts/common.md:44-48` 全等 · `thincoder-core/prompts/advisor-round1.md:46-59`（R1–R8）全等 · `thincoder-core/prompts/common.md:13-18` / `:20-21` 全等 |
| 口径扫描（A3/A4/A6） | 见上行脚本 | why 三句 1/1/1 · `whole document\|read everything\|all files` 0 · `unverified` 2 · `Leads keep their value` 1 · 禁令腔 0 |
| 提示词两档 gate（**新引擎 · 独立进程实跑**） | `runDocCheck(repo, {mode:"gate", docs:[两档]})` | `DOC-CHECK GATE: REFUSED（命中 1 条）`——行宽 0 · 锚 1；另出「行宽免判 2 档」点名行 |
| 同上 · 改前基线 | 同命令（旧引擎） | `REFUSED（命中 62 条）`——行宽 61 · 锚 1 |
| 剩余锚命中（逐条读数） | 同上 | `✗ 锚·档缺 thincoder-core/prompts/common.md:82 \`docs/core/design/MANIFEST.md\``——该行是 D-PS6 操作数豁免清单（`AGENTS.md` / `SKILL.md` / `README.md` / `docs/core/design/MANIFEST.md` …），HEAD `:76` 同文，非档缺；锚判按父侧裁定照旧，本批不动 |
| `docs/` 面行宽 | `runDocCheck(repo, {mode:"gate", docs:["docs/core/design/PROMPT-SYSTEM.md"]})` | `DOC-CHECK GATE: PASS` · 0 命中 |
| 判据实现本体零改 | `checkDocWidths` 直接吃提示词两档 | 61 条（与改前同）——豁免只在调用面 |
| 单测 | `cd thincoder-core && node test/run.mjs` | `tests 35 · pass 35 · fail 0` |
| 本会话内 `doc_check` 工具 | `doc_check(mode:"gate", docs=[两档])` | `DOC-CHECK GATE: ERROR（引擎已更新（doc-check/index.mjs mtime 2026-10-22T04:10:50.220Z > 进程启动 2026-10-22T03:30:20.158Z），请重启会话后复跑）`——引擎档晚于进程启动，版本守卫按设计 fail-closed；上表「新引擎 · 独立进程实跑」即其替代读数 |

**清单外**：无。`git diff --name-only`（仓根）= `thincoder-core/doc-check/index.mjs` · `thincoder-core/prompts/common.md` · `thincoder-core/prompts/advisor-round1.md` · `docs/core/design/PROMPT-SYSTEM.md` · `docs/core/requirements/ENGINEERING-MODE-V2.md`；
  **后两档是本批设计席的既有改动（父侧 12:03 已述），非本席笔**。本批批次档另计（未跟踪档，不进 `git diff`）。其余 14 档提示词 · `thincoder-core/tool-docs/**` · `scripts/**` · 需求档 = 零改；未新增脚本 / CI / 机判门。

**审计 ∥ 评审轮次**

| 轮 | 类型 | 结论 | 处置 |
|---|---|---|---|
| 1 | 内部 explore 分叉审计（只读） | 逻辑面六问（覆盖面 / 锚判 / 零回归 / 披露 / 注释事实 / 清单外）逐条对上；5 条发现：`1,003 字符` 未限定到两档 · 路径正则大小写敏感（Windows 同一档可因拼法逃逸）· 门面固定「判据」行仍称全量受判 · JSDoc 缺 `widthSkipped` · §5 未写 | 四条已改（读数限定两档 / 加 `/i` / 该行按有无免判档分流 / 补 JSDoc）；§5 本笔即写 |
| 2 | 内部 advisor 代码评审（只读） | `VERDICT: changes-required`——🔴 1 · must-fix 🟡 1 · 其余 🟡 2 / 🔵 3 | 在手域内的两条已改：报告面旧不变量（「整档入判 · 判定范围 = 解析范围」与「声明」两行，在 `widthSkipped > 0` 时改分流形）+ 档头 `:8` 加例外括注；其余见「上抛」与下方遗留 |

**遗留（本席笔域外 / 本批不做）**：① 判据单源未登记本豁免（`docs/core/design/DOC-DISCIPLINE.md` §3.18 自述唯一权威、豁免类集为闭集；需求 §13.23「不做的」逐字禁止提示词面路径豁免）——设计 / 需求笔属主，路由父侧，见上抛；② `thincoder-core/tool-docs/doc_check.md` 的模型可见契约仍写「每个传入档整档受判」——同属文档面，随 ① 一并处置；
  ③ 豁免面住模块常量而非 `DOC_CHECK_BUILTINS`（§7 F2 的参数表与 D3 计数 3 未随动）、报面文案双写、无回归用例 —— 三项都在 FR45 换判据时一并收口，本批按父侧「别再扩大」不动。

**上抛**

- `[上抛·待裁]` **判据单源未登记过渡豁免**（advisor 轮 2 的 🔴）：代码已按父侧裁定落豁免，但 `docs/core/design/DOC-DISCIPLINE.md` §3.18 仍是「域 = 传入清单、豁免类集闭集（扩 = 设计 + 评审另批）」，需求 `docs/core/requirements/ENGINEERING-MODE-V2.md:993`（FR45「不做的」）逐字写着「不为提示词面开路径豁免」。两份活描述互斥，读者无从判断哪份为准。
  建议父侧路由：§3.18 加一句过渡豁免 + 覆盖偏移读数 + FR45 删除归口，需求处改「本豁免由 FR43 批过渡引入、FR45 批删除」。本席未改这两档（笔域外）。
- `[上抛·知会]` 批档 §2 `:60` 的「产品代码 = 零改」已被本笔的引擎改动推翻；本段即其记录（文件 / 语义 / 归口），§2 正文按 append-only 不回改。
- `[上抛·知会]` 批档 §2 `:61` 附注「需求档 §13.21「落在两处」尚未含提问面第三处落点」已陈旧：需求档现文为「**落在三处**」（`docs/core/requirements/ENGINEERING-MODE-V2.md:950`）且已含提问面第三处。属设计席写面，请父侧路由。

**终局状态：stalled**（手域内全绿：三处落点 + 引擎豁免 + 披露一致性 + 35/35 单测；卡在一条笔域外的 🔴——判据单源未登记，等父侧路由）

**同轮自检披露（批档自身 gate 读数）**

本笔写入后，对**批档自身**用新引擎实跑一次（单档 · 显式清单）：`DOC-CHECK GATE: REFUSED（命中 8 条）`。

八条全部出在本次 §5 正文里，不是存量：

- 锚 5 条：本节用裸名形写了提示词两档的文件名（`:140` 三处 · `:144` 两处操作数字面），裸名不跨目录解析 ⇒ 记档缺。全文形应写 `thincoder-core/prompts/common.md` / `thincoder-core/prompts/advisor-round1.md`。
- 行宽 3 条：本节三行散文 448 / 328 / 325 字符（`:121` / `:159` / `:163`）。

处置：批档自身不入机检门（结构兜底的 `selfKey` 排除——载体不是判据对象），故这 8 条不改变任何门判定；若父侧要本档回到「单档 gate PASS」，需父侧改写本节（append-only ⇒ 本席只可追加，不回改既有行）。

### 追加（2026-10-22 12:2x · 父侧两条追加令：操作数豁免 + 删行宽面豁免）

**任务**：① 锚判在**提示词面**不把六名 CANON 操作数当指针（消 `thincoder-core/prompts/common.md:82` 的 `docs/core/design/MANIFEST.md` 假阳性——它卡 `batch close`）；② 删除 `#10` 加的**提示词面行宽豁免**（用户 12:23–12:24：「提示词面更需要！」「你再豁免下去，这个产品就死掉了」）；③ 报出提示词两档恢复行宽判后的读数。**前文 `:121` 起的「行宽免判」段被本轮反转**（append-only ⇒ 本段即其记录）。

**改动（两档 · 本席笔）**

| # | 文件 | 动作 |
|---|---|---|
| 1 | `thincoder-core/doc-check/anchors.mjs` | 新增 `CANON_OPERANDS` 六名 + `stripCanonOperands`（整串删除，与 J3 豁免同式）；新增面判据 `OPERAND_FACE` / `isOperandFace`（`thincoder-core/prompts/**`）；`checkAnchors` 在提示词面先剥再抽（`docs/` 面零剥）。签名 / 返回形不变 |
| 2 | `scripts/prompt-refs-check.mjs` | 表与剥除函数改从引擎 import（定义单源 = `anchors.mjs`）；`J1_WHITELIST` 同取该表（六名，`docs/core/design/PROMPT-SYSTEM.md` §6.6「三面逐字一致」由结构保证）；`stripCanonOperands` 导出面保留 |
| 3 | `thincoder-core/doc-check/index.mjs` | **回退到 HEAD**（`git checkout --`）：`PROMPT_FACE` / `isPromptFace` / `widthSkipped` / 免判报面两行 / 分支报面 / JSDoc / 返回形全部退场——代码面 grep 三符号 = 0，零死字段 |
| 4 | `thincoder-core/tool-docs/doc_check.md` | 行宽面四段回退到 HEAD（父侧同轮写入的豁免陈述随机制删除，不留死字）；现盘与 HEAD 逐字相同（`git diff` 空） |

**读数（新进程实跑 · 2026-10-22）**

| 项 | 命令 | 读数 |
|---|---|---|
| 提示词两档 gate（用户要的读数） | `runDocCheck(repo,{mode:"gate",docs:["thincoder-core/prompts/common.md","thincoder-core/prompts/advisor-round1.md"]})` | **`REFUSED（命中 61 条）`**——行宽 61 · 锚 0；61 条全为存量超宽行，逐条点名 |
| 同上 · 改前（含 `#10` 豁免） | 同命令 | `REFUSED（命中 1 条）`——行宽 0 · 锚 1（`thincoder-core/prompts/common.md:82` `docs/core/design/MANIFEST.md`） |
| `docs/` 面 | `runDocCheck(repo,{mode:"gate",docs:["docs/core/design/PROMPT-SYSTEM.md"]})` | `PASS` · 0 命中 |
| 操作数豁免（夹具 · 临时域 · 零落仓） | 提示词面六名 + `docs/core/design/MANIFEST.md` §2 + 非操作数 the absent-doc fixture；`docs/` 面 `docs/core/design/MANIFEST.md` + the absent-doc fixture | 提示词面只报 the absent-doc fixture；`docs/` 面两名都报 ⇒ 闭集 + 面界成立 |
| 行宽面 | 提示词两档 report | 命中 61（锚 0 · 行宽 61）——行宽照判，无面级豁免 |
| 单测 | `cd thincoder-core && node test/run.mjs` | `tests 35 · pass 35 · fail 0` |
| 文档引用锁 | `node scripts/prompt-refs-check.mjs` | 提示词面 69 档 · 代码面 463 档 · 命中 0（exit 0） |

**清单外（逐条披露）**

- `scripts/prompt-refs-check.mjs`：必改。两条硬约束——`docs/core/design/DOC-DISCIPLINE.md` A-DD29 ⑤ 要求 `thincoder-core/**` 对 `scripts/**` 的 import 点 = 0（引擎 import 脚本 = 违），且本脚本是零参主程序、被 import 即整轮扫描 ⇒ 同源只能反向：表迁入引擎、脚本 import。AC⑤ 的「diff = 引擎档」因此多一档，理由如上。
- `thincoder-core/tool-docs/doc_check.md`：只回退到 HEAD（净 diff = 0），未新增锚面豁免句（见遗留 ②）。

**审计 ∥ 评审轮次**

| 轮 | 类型 | 结论 | 处置 |
|---|---|---|---|
| 1 | 内部 explore 分叉审计 | 🟡3 · 🔵6（判据单源未登记 · 模型可见契约 · J1 白名单第二份 · 注释过宽 · 生成区 · 批档旧文 · 面界 · 清单外 · 子串剥除） | 手域内两条已改（J1 白名单同表化 · 注释收窄到 `README.md` / `docs/core/design/MANIFEST.md`）；余为文档笔 / 面界 / 无回归用例 |
| 2 | 内部 explore 分叉复审（反转后） | 编码面只剩 `:10` 注释旧说法 + 再出口无消费点 | 两条已改（注释改指 `OPERAND_FACE`；导出面保留并写明「仓内无消费点」） |
| 3 | 内部 advisor 代码评审 | `VERDICT: changes-required`——🔴1（`docs/core/design/DOC-DISCIPLINE.md` §3.18 仍描述已删的行宽豁免，并点名不存在的 `PROMPT_FACE` / `isPromptFace` / `widthSkipped`）+ 🟡/🔵 余项（契约未登记锚面豁免 · 豁免面窄于 §6.6 的「提示词面」
  定义 · 新判据零用例 · 子串剥除无 token 边界 · 本批 close 会落 61 条行宽的协调项） | 🔴 与 🟡 全部在笔域外（设计档 / 模型可见契约 / 父侧裁定），本席代码零改 |

**遗留（笔域外 · 父侧路由）**

- ① **`docs/core/design/DOC-DISCIPLINE.md` §3.18 仍在描述已删的行宽豁免**：`:854` 括注、`:867`–`:874` 独立块、`:901` 边界句；`:870` 点名 `index.mjs:41` 的 `PROMPT_FACE` / `isPromptFace` 与 `:165-166`、`:871` 点名 `widthSkipped`——盘上代码面 grep = 0。与 `index.mjs:144-145`（两判据同取 `checkFiles`）互斥，须按用户「删干净，不留死字」同轮退场。
- ② **`thincoder-core/tool-docs/doc_check.md` 未登记锚面操作数豁免**：`:9` 全称句与 `:48-49`「no exemptions」按新行为需一句面级限定。本席未写：一是该档父侧同轮在笔；二是逐字列六名会在「该档被 gate」时自身落 `docs/core/design/MANIFEST.md` 档缺（除非面界同时扩到 tool-docs——见 ③，属父侧裁定）。
- ③ **豁免面窄于所引单源**：`OPERAND_FACE` 只覆盖 `prompts/**`，而 `docs/core/design/PROMPT-SYSTEM.md:192` 的「提示词面」= `prompts/**` + `tool-docs/**`。今日无活命中（`tool-docs` 唯一 CANON 名 `advisor.md` 走类名免），属潜伏假阳面。
- ④ **新判据分支零回归用例**：`docs/core/design/DOC-DISCIPLINE.md:2171` 要求判据改动词「护栏必配」；建议在既有 `thincoder-core/test/doc-check-*.test.mjs` 体例下补两条 tmpdir 夹具（提示词面 ⇒ 0；`docs/` 面 ⇒ 照报），本批未加（AC④ 只要求 35/35，且父侧 12:2x 令「改完别再动引擎」）。
- ⑤ **`docs/core/design/DOC-DISCIPLINE.md` §3.20 ①「抽取面两免」未登记新免形**（`anchors.mjs:4` 自称判据单源 = 该节）；同 ① 的文档笔次内一并补。
- ⑥ **本批 close 协调项**：两档提示词恢复行宽判后落 61 条存量超宽行（本段读数表第 1 行）；若 close 候选集含这两档，门读数 = `REFUSED（61 条）`、K ≥ 1——按用户裁定记「提示词面照受判 · 命中归 FR45 换段判据时清零」，或同轮修到 PASS。

**终局状态：stalled**（手域内全绿：操作数豁免 + 行宽面豁免全删 + 35/35 + 引用锁 0；卡在笔域外的 🔴 ①——设计档仍写已删机制，等父侧笔）

**本段更正一行**：上表标题「改动（两档 · 本席笔）」措辞不准——实质改动 = 第 1、2 行两档；第 3、4 行是**回退**（第 3 行净 diff = 0，第 4 行净 diff = 0）。判定口径不变。

## §6 验证与收口（父代理）

**验证与收口（父侧 · 2026-10-22 重启后复跑）**

**① 落地读数**
- `thincoder-core/prompts/common.md:50`「The user's name belongs only to their own words」在位（逐字比对过、5/5 相符，见 §5）。
- `thincoder-core/prompts/common.md` 的证据段（本轮读到的整行 + 逐字引文）在位。
- `thincoder-core/prompts/advisor-round1.md:96` `R9 **Decision surface without evidence → 🟡**` 在位。
- `node scripts/prompt-refs-check.mjs`：提示词面 69 档 · 代码面 463 档 · **命中 0**。
- `cd thincoder-core && node test/run.mjs`：**35 / 35 pass**。
- `doc_check` gate（重启后会话内）：本档与另两份文档 **PASS** · 0 命中。

**② 集成测试**：本批只改提示词文本，无对应集成用例 ⇒ 不形成集成门。

**③ 台账**：`#1732`（FR43）→ 待核销 → **已核销**（依据 = 本节读数）。

**④ 暂缓批复核**：本批无暂缓批 ⇒「暂缓批复核：无」。

**⑤ 遗留**：本档收口时门报的 25 条命中（§1–§5 前段裸档名与长行）已由父侧机械收正（补仓根相对全路径 + 折行），复跑 0 命中；纯指针形，语义零改。
