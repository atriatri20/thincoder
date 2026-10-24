# 2026-10-16 · 行数声明面退役（C 族）
> 六段 append-only，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 编制：主 agent · 2026-10-16 · 来源 = 来源 = 用户 2026-10-16 13:56「知道了，砍掉C族」+ 13:57「落地吧」（承 `#1581` 评估轮）∥ 出处 = `docs/core/design/DOC-DISCIPLINE.md` §3.7 条目 H「文档行数规则废除」+ §5「零行数门在册」。范围 = **只退役 C 族（行数声明面）**，锚 / 行宽 / A4–A7 不动。性质 = 判据语义改动 ⇒ 走设计 → 评审 → 用户批准 → 实现（`_archive/modules/ENGINEERING-MODE-V2-MODULE-MACHINE-CHECK.md` §2.5）。。
> 台账 = #1581（core · 归批）。前情 = 无（独立批）。
## §1 讨论（主 agent）
**状态行**：已收口 2026-10-16
<§1 模板占位：本批条目 / 关键判据 / 授权口径>

**父侧更正（2026-10-16 14:00）——验收判据撞了在效禁令，已作废改写**

- **事实**：派单原验收要求「跑 `node scripts/doc-check.mjs --root .`（行数面段消失 ∥ 锚 231 ∥ 行宽 29 不变 ∥ 退出码不变）」。这与用户 **2026-10-15 12:10 逐字令**「**禁止调用 doc-check —— 一切轮次、一切角色，不再跑、不再引其读数、不再以其红/绿作任何判据**」（在册 = `docs/batches/2026-10-15-doc-ref-direction-cleanup.md:219-232` §1.zf）**直接相抵**。该令未被 13:56「砍掉C族」/ 13:57「落地吧」覆盖（那两句只定 C 族去留方向），**本批不豁免**。
- **责任**：派单缺陷，父侧所出（设计席 `#15` 上抛指出）。
- **改写后的验收（全静态 · 零运行 · 零引读数）**：① 源面接线段零残留（grep `scripts/doc-check.mjs` ⇒ 零 `checkLineCounts`：`import` ∥ `:67` `CRITERIA_KEYS` 项 ∥ `:89-96` 子域守卫 ∥ `:97` 调用 ∥ `:99` 报告句，逐项 `file:line` + 改前现文对照）；② 声明面键面零残留（**直读** `PROJECT-MANIFEST.json` ⇒ `checkConfig` 无 `lineCounts` 键、34 条无余项）；③ 保留面仍在（`scripts/doc-check-linecounts.mjs` 在盘）；④ 零误伤改用**改动面证明**（`git diff --stat` 改动集 ⊆ 本批声明文件清单，锚 / 行宽 / A4–A7 相关件零触）。
- **新增设计项（采纳设计席建议）**：该禁令**目前只住一条可随时被清的批档** ⇒ 本轮设计须把用户逐字原话落进 `docs/core/design/DOC-DISCIPLINE.md`（设计席笔），注明出处；**只搬原话、不加语义**。理由：禁令的寿命不能短于它约束的对象——批档一清，令就断了。

**父侧补落 §1 书面依据（2026-10-16 14:0x · 应设计席 U-R5）**

- **批条目** = 台账 `#1581`（「重新评估文档机检逻辑」→ 用户裁「砍掉C族」）。**交付目标** = C 族（行数声明面）退役：撤声明面 34 条 + 摘引擎接线 + 禁调令落状态档。**任务书** = 本批档；台账 `task_book` 指向本档（在途）。
- **授权口径**：用户 2026-10-16 13:56 逐字「知道了，砍掉C族」+ 13:57「落地吧」；性质 = 判据语义改动 ⇒ 设计 → 评审 → 批准 → 实现（`_archive/modules/ENGINEERING-MODE-V2-MODULE-MACHINE-CHECK.md` §2.5）。
- **在效约束（本批必须守）**：用户 **2026-10-15 12:10** 逐字「**禁止调用 doc-check——一切轮次、一切角色，不再跑、不再引其读数、不再以其红/绿作任何判据**」⇒ 本批验收 = **全静态四条**（见上条更正），**零运行、零引读数**。
- **已知相抵（如实记）**：`docs/batches/2026-10-16-doc-stale-ref-sweep.md:227`（§2.9.4）引了 doc-check 读数（悬空 231 ∥ 行宽 29），系该批席 C 在**不知禁令**下作出 ⇒ 与本约束相抵；该批尚在批准前，父侧已将此记入其 §1；**本批及其后各批不再引任何该工具读数**。
- **未决纳批/转出（父侧裁）**：**U-R1/R2（R-12/R-13）＝ 纳批**——`thincoder-core/manifest-schema.mjs:46`/`:75-79`/`:119-121` + `manifest.mjs:13` 与 `ENGINEERING-MODE-V2.md:143`/`:154` + `DOC-MIGRATION.md:458` 须同拍（否则键退场后仍被 schema 认作已知键、可被 `fillDefaults` **复活** ⇒ 退役不彻底）；**U-R3（R-14）= 转出台账**（桌面域 13 档样板行的 `checkConfig.lineCounts` 死指称 → 并 `#1576` 行）；**U-R4** = 无动作（`MANIFEST.md` 仍有对应条文，专权未失源）；**R-15 张力 = 父侧裁**：禁令条须可溯 ⇒ **保「用户 2026-10-15 12:10 逐字令」+ 原话，删批档路径括注**（日期属规则自身属性、可留；过程档路径违 D4/D8），此改属机械指针形态更正，父侧直改豁免②，实施轮一并落并标注。

**父侧记录（2026-10-16 15:18 · 定点修轮收尾）**

- **过程面留痕（按评审 #7 处置）**：`scripts/doc-check.mjs` 的 Δ **−18 ⇒ −13** 之推导 = 删面逐条 `:21` import 1 行 + `:88-96` 子域守卫 9 行 + `:97-99` 调用/报告 3 行 = 13；原记「≈ −18」为估值、已删。同型 = U-R4 行号 as-of `:800` ⇒ 落笔后实测 `:804`。
- **父侧两处认错（设计席当场纠正）**：① 现读取值——父侧引 `read` 工具「总行数」得 179 ∥ 288，**与本档既有口径（KD-4 内容行数 = `countContentLines`，末空减一）不符**；正解 = **178 ∥ 287**（同表三例 195 / 104 / 49 皆该口径），设计席按本档口径落，**父侧采纳**。② 「四处括注」——**父侧手写计数无据**（禁在手写计数旁自述一版）；全仓规范档内具体批档路径括注**实读 = 1 处**（`DOC-DISCIPLINE.md:82`），按 1 处落。
- **A-DD28 ④ 零改（父侧认）**：其文件清单以**单源引用**形式指向 §3.19 受影响面表 ⇒ 表一更新即同拍，无需改述。
- **登记（不阻断）**：批档 §2 上抛表 U-R3 行文字仍写「另批或并入本批」，与 §1 已裁「转出台账（并 `#1576`）」**结局一致**（均不入本批）⇒ 纯文字滞后，留待落笔轮同拍。

**父侧直接执行留痕（2026-10-16 15:2x · 三笔 · 皆打标可回退）**

**为什么由父侧直改**：① `scripts/**` 与 ② `PROJECT-MANIFEST.json` 分别属**工程工具面**与**manifest 专权面**（`writeManifest` writer:'main'）——派 eng-coder 时机制**当场拒绝**（`files` 列 `scripts/*` 被拒：「engineering-tools face … must not be listed in files」）⇒ **闸门优先**，归父侧笔；③ `docs/core/requirements/**` = 需求档，D1 写权归主 agent。产品码面（R-12）另派 `eng-coder#21`（携 token）；设计档面（R-7/R-10/R-11/R-13）另派 `eng-designer#20`。

| 笔 | 动作 | 实测验证 |
|---|---|---|
| `PROJECT-MANIFEST.json` | 删 `checkConfig.lineCounts` 整块（原 `:43-180`，34 条 / 138 行） | `JSON.parse` 通过 ✓ · `checkConfig` 键 = `scanDirs / lineWidth / widthExemptZones / anchors / exemptions` = **5** ✓ · `lineCounts` 零残留 ✓ · 锚键（`domain`/`exclude`）与 `scanDirs`/`lineWidth` 值原样（`["docs"]` / `300`）✓ |
| `scripts/doc-check.mjs` | R-2 `:21` import 删 · R-3 `CRITERIA_KEYS` 去项（现 6 项）· R-4 `:88-96` 子域守卫段删 · R-5 `:97-99` 调用 + 打印 + **报告句（「回填工单即本清单」）**删 · R-6 头注两处（单引擎句 / 键枚举句）· **＋设计未列项**：`:65` D3 注释行仍枚举 `lineCounts` ⇒ 一并收正 | `node --check` **Syntax OK** ✓ · `grep` `checkLineCounts`/`lineCounts` = **零命中** ✓（A-DD28 ①）|
| `docs/core/requirements/ENGINEERING-MODE-V2-SPEC-MACHINE-CHECK.md` | R-8 `:12` 去「行数面声明（`lineCounts`）」分句 · R-9 `:38` AC-M8-6 示例计数「7 = 6 + 1」⇒「**6 = 5 + 1**」 | 回读对照 ✓（与实装 5 键 + anchors 拆分 1 = 6 项自洽）|

**过程缺陷（父侧自报）**：`PROJECT-MANIFEST.json` 首删后**留了多余逗号**（JSON 非法，`JSON.parse` 在第 43 行报错）⇒ 当场修好并复验。**教训**：删整段时**边界逗号**是必查项——**跑一次**才暴露。

**设计缺口（记录，交 §6）**：R-6 覆盖头注 `:3-8`/`:11`，**未覆盖 `:65` 的 D3 注释行**（同为键枚举现役陈述）⇒ 本轮由父侧就地收正并打标（机械形态更正，可回退）。

## §2 批次任务与设计（eng-designer）
**状态行**：设计完成（文档侧落笔轮已落（R-7/R-10/R-11/R-13 + U-R3 行同拍 · 2026-10-16））
<§2 模板占位：本批条目（覆盖） / 设计档落点 / 机制设计 / 受影响文件与测试覆盖 / 验收对照 / 关键决策 / 上抛项>

**来源** = 用户 2026-10-16 13:56「知道了，砍掉C族」+ 13:57「落地吧」；执行人 = eng-designer；**本轮不做**：实现零落笔（`scripts/**` ∥ `PROJECT-MANIFEST.json` ∥ 产品码 = 一行未动）。
**禁区内零触**：设计轮 + 定点修轮落笔面 = 设计档一档——`docs/core/design/DOC-DISCIPLINE.md`（§2 禁令条 + §3.19 条目 R + §3 标题枚举 + 档头枚举 + §5 A-DD28）+ 本档 §2；未动 `scripts/**` · 未动 `PROJECT-MANIFEST.json` · 未动锚 ∥ 行宽 ∥ A4–A7 族 · 未新增任何判据。

### 一 本批条目（覆盖）

| # | 条目 | 落点 |
|---|---|---|
| R-0 | **C 族退役设计**（声明面 + 引擎比对接线整体退役；保留 `doc-check-linecounts.mjs` 当手跑读数器） | 设计档 §3.19 条目 R |
| R-0b | **§3.17 条目 P 存废判决** | 设计档 §3.19「与 §3.17 的关系」（要方 + 射程句收正） |
| R-0c | **禁调 `doc-check` 禁令落状态档**（用户 13:56/13:57 之外的父侧第三件回裁 · 采纳） | 设计档 §2 总则族（用户逐字 + 求值口径 + 出处） |

### 二 设计档落点

`docs/core/design/DOC-DISCIPLINE.md`（文档纪律与机检对账设计档 = 机检引擎的权威设计档，其 §7 即引擎面）：新增 **§3.19 条目 R：行数声明面退役（C 族）** ∥ §5 新增 **A-DD28** 判据行 + 判据块 ∥ §3 标题枚举与档头枚举同拍加项（D3）∥ §2 总则族新增禁调条。
**另档落点（记入条目 R 的受影响面表，实施轮落）**：`PROJECT-MANIFEST.json`（主 agent 笔 · R-1）· `scripts/doc-check.mjs`（eng-coder · R-2–R-6）· `docs/core/requirements/ENGINEERING-MODE-V2-SPEC-MACHINE-CHECK.md`（主 agent 笔 · R-8/R-9）· `docs/core/design/DOC-SYSTEM.md`（设计笔 · R-10）· `docs/core/design/ENGINEERING-MODE-V2.md` · `docs/core/design/DOC-MIGRATION.md`（设计笔 · R-13）· `docs/core/design/MANIFEST.md`（设计笔 · R-12 落点 `:107`）· `thincoder-core/manifest-schema.mjs` · `manifest.mjs`（eng-coder · R-12 · 本批 · 须 designToken）。

### 三 机制设计（目标态）

引擎内核 = **锚检查 + 行宽检查**两件；`checkConfig` 判据键 **6 项**。逐处改动清单 = 条目 R 三表（R-1–R-13 本批 · R-14 计外（本批零触） · R-15 已落），逐行给 `文件:行` + 现文摘 + 改后 + 笔权。
**保留面**：`scripts/doc-check-linecounts.mjs` 在盘（三导出零改 · 跟踪面零 import 点）；文档档里手抄的行数数字零改（事实层）。
**零改面**：锚（A1–A3 入闸 ∥ A4–A7 报告面）· 行宽 · `checkConfig` 其余六键 · `docs/batches/**` · `.github/workflows/test.yml:79`。
**语义损失登记**：子域「持 `lineCounts` ⇒ fail-closed」守卫随族退场（本仓零子域 ⇒ 仓根运行零差别；产物包多域场景不再有该守卫）。

### 四 受影响文件与测试覆盖

| 档 | 现读 | Δ | 面 / 笔 |
|---|---|---|---|
| `docs/core/design/DOC-DISCIPLINE.md` | — | +条目 R ∥ +A-DD28 ∥ +R-15 | 设计档 · **本轮已落** |
| `PROJECT-MANIFEST.json` | 195 | −138 | 声明面 · 主 agent |
| `scripts/doc-check.mjs` | 104 | −13 | 工程工具面 · eng-coder |
| `docs/core/requirements/ENGINEERING-MODE-V2-SPEC-MACHINE-CHECK.md` | 49 | 0（行内改） | 需求档 · 主 agent |
| `docs/core/design/DOC-SYSTEM.md` | — | 0（行内改） | 设计档 · 设计笔 |
| `docs/core/design/ENGINEERING-MODE-V2.md` | — | ≈ −1（例面行删 ∥ 校验描述分句删） | 设计档 · 设计笔（R-13） |
| `docs/core/design/DOC-MIGRATION.md` | — | ≈ −1（迁移表 ② 行删） | 设计档 · 设计笔（R-13） |
| `docs/core/design/MANIFEST.md` | — | 0（行内改） | 设计档 · 设计笔（R-12 落点 `:107`） |
| `thincoder-core/manifest-schema.mjs` · `manifest.mjs` | 178 ∥ 287 | −11（schema）∥ 0（行内改，manifest） | 产品码 · eng-coder（**本批** · 须 designToken） |

**测试覆盖**：本条不新增检查项 ⇒ 无判据改动词护栏义务；盘上无测试件依赖该面 ⇒ **不落单元测试档**、不跑动件；实施轮自证 = 静态三件（源面 `grep` · `node --check` · `git diff --stat`）。集成面 = 无（文档 / 工具面）。

### 五 验收对照（回指 §5 A-DD28 · 全静态）

| # | 判据 | 方式 |
|---|---|---|
| ① | 源面接线段零残留——`scripts/doc-check.mjs` 零 `checkLineCounts`（五处逐项） | `grep` + 逐项现文对照 |
| ② | 声明面键面零残留——`checkConfig` 内无 `lineCounts` | 直读 `PROJECT-MANIFEST.json` |
| ③ | 保留面仍在——`doc-check-linecounts.mjs` 在盘 | 文件在盘 |
| ④ | 零误伤——`git diff --stat` 改动集 ⊆ 本批声明文件清单；锚 ∥ 行宽 ∥ A4–A7 件零触 | `git diff` |

**读数面**：本批验收**不引任何引擎读数**、不跑入口、不直调（用户 2026-10-15 12:10 禁调令——父侧 13:57 回裁：仍在效 · 本批不豁免）。

### 六 关键决策

| # | 决策 | 理由 / 否决 |
|---|---|---|
| KD-R1 | `doc-check-linecounts.mjs` **保留**（手跑读数器，不删） | 能力不丢、零 import 点即不再自动跑；否决「删档」（用户默认 (a) 保留） |
| KD-R2 | 文档档里**手抄的行数数字零改** | 属文档事实层；§3.7 取消的是标注义务，不是既有读数（用户默认 (b)） |
| KD-R3 | **§3.17 条目 P 要方（保留）**，仅收正其射程句的 `lineCounts` 指称 | 立条理由主体 = 规范档只写终态（D8）——与机检件无关；本条自载「机判 = 无」；工具配对敏感只是该条的一个已观察实例（去实例 ≠ 废规则）。见条目 R §「与 §3.17 的关系」 |
| KD-R4 | 设计轮只落**条目 R + A-DD28 + 两处枚举 + §2 禁令条**；引擎面记述（§7 / DOC-SYSTEM / 需求档）与代码同轮翻 | 避免「文档说退役、引擎还在跑」的中间态窗口（先例：本档条目体例 = 判据句先落、实施面随轮） |
| KD-R5 | 验收取**全静态**（源面 / 直读 / diff 面） | 用户 12:10 禁调令在效（父侧 13:57 回裁）；禁调令下**读数不作判据** |
| KD-R6 | 禁调令**落 §2 总则族**（状态档自持 + 出处一行） | 禁令原只住一次性批档 ⇒ 「批档一清、令就断」；落状态档即不再依赖可清载体 |

### 七 上抛项

| # | 项 | 本席判断 | 须裁 |
|---|---|---|---|
| U-R1 | **R-12（产品码：`thincoder-core/manifest-schema.mjs` 缺省值 + 元素层谓词 + 校验支 ∥ `manifest.mjs` 头注 ∥ `MANIFEST.md:107` 元素层形态句）** | 不删也跑得动（缺键 = `missingKeys` 非拒），但留着 = 退役键仍被 schema 认作已知键、可被 `fillDefaults` 复活 ⇒ **纳批**（本批 · 产品码须 designToken） | **已裁 = 纳批**（§1 `:22`）——本批实施轮落 |
| U-R2 | **R-13（`ENGINEERING-MODE-V2.md:143`/`:154` · `DOC-MIGRATION.md:458`）** | 与 R-12 同拍——例面 / 校验描述 / 迁移表行皆随 schema 退场 | **已裁 = 纳批**（与 U-R1 同裁 · §1 `:22`）——本批实施轮落 |
| U-R3 | **R-14（桌面域 13 档设计档「行数面机检」样板行 + `desktop/PROJECT.md:218`）** | 样板行是**死指称**（指已退场的检查）——应改述为「值表自持句」；但属桌面域设计档（另一板 · 并发写者在场） ⇒ **本批零触** | **已裁 = 转出台账**（并 `#1576` 行）——本批零触（§1 `:22`） |
| U-R4 | **`docs/core/design/DOC-DISCIPLINE.md:804`（§3.16 O-6 ②）中「声明修改笔权 = main 直笔」（`writeManifest` 专权）** | 该句随 O-6 ② 整项删 ⇒ 「`writeManifest` 专权」这一事实在本档将**无载体**（`docs/core/design/MANIFEST.md` 仍有对应条文 ⇒ 未失源） | 是否在 MANIFEST 档补一行显式承接 / 保持现状 |
| U-R5 | 本批 §1 未落（模板占位「本批条目 / 关键判据 / 授权口径」） | 条目的书面依据 = 派单正文 + 台账 #1581 | 主 agent 补 §1（与 §2 条目表同源） |

**禁调令落点（已收口——R-15 指针形态更正）**：`DOC-DISCIPLINE.md:82` 出处句的批档路径括注**已删**——禁令本体 + 逐字原话自持（载体清后零损失），与 D4 细则二方向一致。

**定点修轮（2026-10-16 · 评审 #16 判词十条 · 父侧逐条接受 · 按号 1–10 落）**：
① 范围同拍——上抛 U-R1/U-R2 状态列改「已裁 = 纳批」；§四 表与设计档 §3.19 受影响面表补 `ENGINEERING-MODE-V2.md` / `DOC-MIGRATION.md` / `MANIFEST.md` 三行，产品码行改「本批」；`DOC-DISCIPLINE.md:938`「计外发现」标签同拍。
② R-12 落点补 `docs/core/design/MANIFEST.md:107`。
③ R-7 行写明第 5 条落位 = **移出接口列表**、另立一行「手跑读数器（不入引擎 · 零 import 点）」——标题计数 4 = 列表条数。
④ 改动清单（R-11）补 `DOC-DISCIPLINE.md:1075`（§4.2.6 实装现状）。
⑤ 判据补域——`:913` 保留面句 ∥ A-DD28 ① ∥ DD-69 改「跟踪面（仓内受跟踪源树 ∥ 排除 `.thincoder/**` 草稿）」。
⑥ 两表产品码行补现读 `178 ∥ 287`、增量 `−9`（schema）∥ `0`（行内改）。
⑦ §四 表直改 `−13`；U-R4 行号 `:800` ⇒ `:804`；删「原记 ⇒ 实算」订正句（过程留 §1）。
⑧ 删 `DOC-DISCIPLINE.md:82` 出处句的批档路径括注（禁令本体 + 逐字原话自持）。
⑨ §3.19 先例行补实现坐标（退场面：删面坐标 R-2–R-6 / R-12 + 保留面坐标）。
⑩ `:959` 理由改记实因（零新增判据 + 盘上无测试件依赖该面），禁调令只作读数面约束。
落笔面 = `docs/core/design/DOC-DISCIPLINE.md` + 本档 §2；未动 `scripts/**` · `PROJECT-MANIFEST.json` · 产品码。

**落笔轮（2026-10-16 · 文档侧 C 族退场面落笔 · 设计笔）**

- **来源** = 设计评审通过（§3 轮 1 changes-required → 轮 2 pass）+ 本档 §2 三「机制设计」∥ 设计档 `DOC-DISCIPLINE.md` §3.19 条目 R 改动清单。执行人 = eng-designer。
- **落笔面（文档侧）**：`docs/core/design/DOC-DISCIPLINE.md`（R-7 七行 · R-11 六处）· `docs/core/design/DOC-SYSTEM.md`（R-10 两处）· `docs/core/design/ENGINEERING-MODE-V2.md`（R-13 两处）· `docs/core/design/DOC-MIGRATION.md`（R-13 一处 + 同源级联）· 本档 §2（U-R3 行同拍）。
- **逐处**：R-7 = §7 沿革 · F1 内核句 · F2 键枚举 · 「五档接口」⇒「四档接口」（`doc-check-linecounts.mjs` 项移出接口列表 · 另立「手跑读数器（不入引擎 · 零 import 点）」行 · 标题计数 4 = 列表条数）· 自测护栏覆盖范围句删 · AC-M8-5；R-10 = `DOC-SYSTEM.md` `:232`（判据项 7⇒6 去 `lineCounts`）· `:233`（五档接口段⇒四档接口段）；R-11 = §3.16 O-6 ② 整项删（四件⇒三件）· §5 A-DD24 ③ 四件⇒三件 · §3.17 射程去指称 · §3.17 落笔清单指针句 · §4.2.6 实装现状 · §7 值位形约定行理由；R-13 = 例面 `"lineCounts": []` 行删 · 校验描述分句删 · 迁移表 ② 行删。
- **复扫（剥笔动作口径）**：`DOC-DISCIPLINE.md` 内「五档接口」现役陈述 = **0**；「行数面（引擎）」类现役陈述 = **0**（口径 = §7 记述 + §3.16/§3.17/§4.2.6/§5 A-DD24 现役句；排除 §3.19 改动清单「现文（摘）」列之引文）。余 3 处边界句仍携「行数面」字样（§3.15 `:760`/`:781` · §3.18 `:893`）——锚族边界句，按派单「不动锚族句」未动，见上抛。
- **同源级联（一致性面 · 已修 · 逐处报）**：`DOC-DISCIPLINE.md:827`（DD-65 O-6 ④ ⇒ ③，随 ② 项删重排）；`DOC-MIGRATION.md:409`（死指针括注去）· `:511`（AC-3 四件⇒三件）· `:449`/`:509`（§11.5 ④ ⇒ ③，随 ② 行删重排）。
- **本轮不做**：`scripts/**` ∥ `PROJECT-MANIFEST.json` ∥ 产品码（eng-coder / 主 agent 面）；表外改述（除上述同源级联）。

**计数随正轮（2026-10-16 · 设计笔 · 承 `#20` 上抛 + `#21` 实测更正）**

- **来源** = 设计席 `#20` 落笔轮上抛（三处锚族边界句仍携「行数面」字样——已失效的现役指称）+ 实施席 `#21` 实测（R-12 行数与增量更正）。执行人 = eng-designer。规范面落点 = `docs/core/design/DOC-DISCIPLINE.md`；过程留痕 = 本档。
- **逐处**：① §3.19 条目 R 的 R-12 行文件坐标 `:119-121` ⇒ `:119-122`（校验支含收尾 `}` 共 4 行：注 + `if` + `errors.push` + `}`）∥ ② §3.19 受影响面表第 9 行 schema 增量 `−9` ⇒ `−11`（`manifest.mjs` `0` 不变）∥ ③ 本档 §四 表产品码行同拍 `−9` ⇒ `−11` ∥ ④ 三处边界句去失效项——§3.15 `:760`／`:781` · §3.18 `:893`：`锚检查 ∕ 行数面` ⇒ `锚检查`（「行数面」作引擎面的指称随 C 族退场；三处皆「不动项」并列列举中的冗余项，按句意**去项**，非改「行宽」——替换将使句面自相抵，见下报告）。
- **实删行数实测（`git diff` 逐段核）**：`:46` 1 行 + `:75-80` 6 行（`isLineCountsValue` 注 + 函数 + 其后空行）+ `:119-122` 4 行 = **11** ⇒ 178 → 167 ✓。
- **本轮不做**：`scripts/**` ∥ `PROJECT-MANIFEST.json` ∥ 产品码 ∥ §1 与 §3 评审判词 ∥ `DOC-MIGRATION.md`（`#20` 已收口）。
- **未决（报请裁定）**：R-12 行坐标 `:75-79` 只覆盖谓词 5 行，而实删含其后空行（旧 `:80`）⇒ 该行三坐标之和 = 1+5+4 = **10**，与 Δ `−11` 差 1 行（空行）。是否把 `:75-79` 随正为 `:75-80`（使坐标和 = Δ）——本席按派单只改 `:119-122`，未擅动 `:75-79`。

## §3 设计评审（评审子代理）

### 轮次 1（评审子代理）

评审对象：`docs/batches/2026-10-16-linecounts-family-retire.md`（§2 设计面）+ 已落 `docs/core/design/DOC-DISCIPLINE.md` §3.19 条目 R / §2 禁令条 / §5 A-DD28 + 射程内两档（`ENGINEERING-MODE-V2-SPEC-MACHINE-CHECK.md` · `DOC-SYSTEM.md`）。射程外只读实核件：`scripts/doc-check.mjs` · `PROJECT-MANIFEST.json` · `thincoder-core/manifest-schema.mjs` · `manifest.mjs` · `.gitignore`。

| # | Category | Severity | Issue | Suggestion |
|---|----------|----------|-------|------------|
| 1 | Requirements coverage / Acceptance criteria | 🔴 | 批档 §1 已裁「**U-R1/R2（R-12/R-13）＝ 纳批**」（`docs/batches/2026-10-16-linecounts-family-retire.md:22`），但设计面仍按计外处置：§2 上抛项 U-R1 的「须裁」列仍写「是否纳入本批实施轮（本批任务书四处清单未列）」（`:90`），U-R2 写「与 U-R1 同裁（R-12 不纳 ⇒ 本行不入）」（`:91`），§四 表与设计档受影响面表均记「产品码 · **计外（另轮 + designToken）**」（`:60` ∥ `DOC-DISCIPLINE.md:957`）。后果：按 §1 裁定落 R-12/R-13（含 `ENGINEERING-MODE-V2.md:143` · `:154` 与 `DOC-MIGRATION.md:458`）⇒ 改动集含不在 `§3.19 受影响面表`（`DOC-DISCIPLINE.md:950-957`）内的两档 ⇒ 已落判据 A-DD28 ④「改动集 **⊆ 本批声明文件清单**」（`DOC-DISCIPLINE.md:1595`）按现文读为违规——验收判据与本批范围自相抵 | 二择一并写定：① 受影响面表补 `ENGINEERING-MODE-V2.md` / `DOC-MIGRATION.md` 两行 + U-R1/U-R2 状态改「已裁 = 纳批」；② 或把 §1 裁定改回「另轮」并同拍 §四 与 §3.19 表。两路均须使 A-DD28 ④ 的文件清单与实施面一致 |
| 2 | Requirements coverage | 🟡 | R-12 落点只列 `thincoder-core/manifest-schema.mjs` + `manifest.mjs`（`DOC-DISCIPLINE.md:942`），未列同机制的档面描述位 `docs/core/design/MANIFEST.md:107`「**`checkConfig.lineCounts` 元素层形态**——#546」（只读实核；该档在评审射程外）⇒ 键与校验支删后，M1 模块设计档仍写该判据在位 | R-12 落点补该处（与 U-R1 纳批同拍），或在该行写明「`MANIFEST.md` 由该档主笔随拍收正」 |
| 3 | Clarity（D3 计数·枚举） | 🟡 | R-7 把 §7 标题「**五档接口**」（`DOC-DISCIPLINE.md:1652`）改「**四档接口**」（`DOC-DISCIPLINE.md:931`），但同节列表仍留第 5 条 `doc-check-linecounts.mjs`（行数面 ∕ 第五判据）（`DOC-DISCIPLINE.md:1658`）且 R-7 对该项只写「改述」未写移出列表 ⇒ 计数 4 与列表 5 条相抵（D3：N 与列表同时改） | R-7 行写明第 5 条落位（移出接口列表另立「手跑读数器」一行 ∥ 标题叙明「四档引擎接口 + 一手跑读数器」），使标题计数与列表条数一致 |
| 4 | Requirements coverage / D3 | 🟡 | 同档 §4.2.6「**实装现状**」句仍是现役陈述「`scripts/` 现存五档 = 锚 + 行宽 + 行数面」（`DOC-DISCIPLINE.md:1075`），未列入 R-7 / R-11 清单 ⇒ 引擎内核裁为「锚 + 行宽」两件（`DOC-DISCIPLINE.md:907`）后与该句相抵 | 改动清单补 `:1075` 行（改述为「现存五档——其中行数面 = 手跑读数器、不入引擎」或按新内核重述） |
| 5 | Acceptance criteria | 🟡 | 「**零 import 点**」（`DOC-DISCIPLINE.md:913`）与 A-DD28 ① 「全仓 `doc-check-linecounts` 的 **import 点 = 0**」（`DOC-DISCIPLINE.md:1592`）均未界定域：盘上实有 1 处——`.thincoder/tmp/d37-backfill-dryrun.mjs:5`（`import { parseSectionRows, countContentLines } from "../../scripts/doc-check-linecounts.mjs";` · 草稿目录 · `.gitignore:20` 已忽略）⇒ 按字面全树 `grep` 复扫读为 FAIL | 判据补域（「跟踪面 ∥ 排除 `.thincoder/**` 草稿」）或改述「引擎面 import 点 = 0」；保留面句同步该域 |
| 6 | Affected-file size annotations（criterion 8） | 🟡 | 受影响面表两处对**源文件**未给「现读 + 增量」形态：`thincoder-core/manifest-schema.mjs` · `manifest.mjs` 行记「— ∥ ≈ −8」（`DOC-DISCIPLINE.md:957` ∥ `…linecounts-family-retire.md:60`）。抽验：实读 = **179 行** ∥ **288 行**；删面 = `:46` 1 行 + `:75-79` 5 行 + `:119-121` 3 行 = **9**（`manifest.mjs:13` = 行内改 ±0）⇒ 「≈ −8」少计 1（两档均 ≤500 软线内 ⇒ 无需拆案，此点已核无异议） | 补现读两值 + 增量写 `−9`（或 `≤±9`）；如另有行内改口径，在该行写明算法 |
| 7 | Doc hygiene（2026-09-18 用户裁定） | 🟡 | 作废值留桩在设计面：§四 表仍记 `scripts/doc-check.mjs` Δ「≈ −18」（`…linecounts-family-retire.md:57`），订正写在同一段末（`:98` 逐字「Δ 原记「≈ −18」，实算 = **−13**」），设计档表已用 −13（`DOC-DISCIPLINE.md:954`）；同型 = `:99` 的 as-of 行号订正（`:800` ⇒ `:804`） | 表内直改 −13 / `:804`，删「原记 ⇒ 实算」订正句（过程留 §1 / 记录面）——修订式表达不留规范面 |
| 8 | Document ownership（引用方向纪律） | 🟡 | 已落禁令条出处句仍带批档路径「原载批档 `docs/batches/2026-10-15-doc-ref-direction-cleanup.md:219-232`——一次性记录载体、随时可清」（`DOC-DISCIPLINE.md:82`），与本档 **D4 细则二**「规范档**禁引**批档及其单元测试档」（`DOC-DISCIPLINE.md:58` · 处置 = 删引用片段 · 阈值 = 0 · 无豁免）相抵；且 §1 裁定记「删批档路径括注」（`…linecounts-family-retire.md:22`）与 §2 记「R-15 按父侧指令**带出处指针**（批档路径）」（`:96`）对同一指令的记载相反。非阻断理由 = §1 已给出落法（该改属机械指针形态更正、实施轮一并落） | 二者取一并写定：① 按 §1 裁删括注（禁令本体 + 逐字原话自持，载体清后零损失）；② 若确要留指针 ⇒ 在 D4 细则二落一行显式例外（同拍登记，不落隐性豁免） |
| 9 | Closest-precedent | 🔵 | §3.19 先例行给了设计档节位与对齐声明（`DOC-DISCIPLINE.md:963`，批名不入档 = D4 方向唯一、合规），但未给实现坐标——对照 §3.18 先例行给了 `isTableRow`（`scripts/doc-check-width.mjs:42`）∥ `isZoneHead`（`:45`）（`DOC-DISCIPLINE.md:878`） | 如可指认，补一对实现坐标；退场面无实现坐标可引 ⇒ 显式写「无实现坐标可引」亦可 |
| 10 | Methodology | 🔵 | 「单元测试档随动」段把理由归给禁调令：「**禁调令下**无跑动件，故**不落单元测试档**」（`DOC-DISCIPLINE.md:959`），但禁令射程 = 调用入口 ∥ 直调其导出（`DOC-DISCIPLINE.md:80-81`），不含 `node --test`；实因应为「不新增检查项 ⇒ 无判据改动词护栏义务」+ 盘上无测试件依赖该面（实核：`thincoder-cli/test/**` 对 `doc-check` 零命中） | 理由改记实因（零新增判据 + 无测试依赖），禁调令只作读数面约束 |

**射程外备注（不判级）**：① `.github/workflows/test.yml:79`（`- run: node scripts/doc-check.mjs --root .`）被设计列为零改面（`DOC-DISCIPLINE.md:916`），而新落禁令条以「不再以其红 / 绿作任何判据」为口径（`DOC-DISCIPLINE.md:80`）——CI 步是否属该条射程（CI 非「轮次／角色」，但其非零退出即构建判据）宜由父侧一句裁明（该件在评审射程外 · 只读实核）。② `docs/core/design/AGENT-LOOP-ASYNC-POOL.md:826`（A-TW19 引 doc-check 读数「悬空 25 ∥ 行宽 0 ∥ 行数面 18 报告」）= 带时点锚读数行，按禁令条「凡此前派单含该项者，以本条为准，不再要求」整体作废 ⇒ 拟可零触，仅记备确认。③ 桌面域 13 档 + `desktop/PROJECT.md:218`（R-14）已在批档登记为**本批零触**（`:92`）。

**评审限制**：无文档地图声明（ownership 维度按 Project Guide 指向的 `docs/README.md` 之外、以设计自陈的单源关系（`DOC-DISCIPLINE.md` §7 / §3 条目）判读）；无项目标准档声明（方法学按 `AGENTS.md` + 档内在效纪律判读）；射程外证据一律只读实核、已逐条标注出处。

**计数**：🔴 1 · 🟡 7 · 🔵 2。

VERDICT: changes-required

### 轮次 2（评审子代理）

评审对象（轮 2 · 复评：只验轮 1 表十条的修正主张）：`docs/batches/2026-10-16-linecounts-family-retire.md`（§1 裁定面 + §2 设计面）+ `docs/core/design/DOC-DISCIPLINE.md` §2 禁令条 / §3.19 条目 R / §5 A-DD28 + 射程内两档；射程外只读实核件（`thincoder-core/manifest-schema.mjs` · `manifest.mjs`）。

| # | Orig# | File | Severity | Status | Notes |
|---|-------|------|----------|--------|-------|
| 1 | 1 | 批档 §2 · DOC-DISCIPLINE.md §3.19 | 🔴 | Fixed | 受影响面表补三行 + 产品码行改本批：`:957`「\| 6 \| `docs/core/design/ENGINEERING-MODE-V2.md` \| — \| ≈ −1（例面行删 ∥ 校验描述分句删） \| R-13（设计笔） \|」（`:958` DOC-MIGRATION.md ∥ `:959` MANIFEST.md 同型）；`:960`「\| 9 \| `thincoder-core/manifest-schema.mjs` · `manifest.mjs` \| 178 ∥ 287 \| −9（schema）∥ 0（行内改，manifest） \| R-12（产品码 · **本批** · 须 designToken） \|」；U-R1/U-R2 状态列改「**已裁 = 纳批**（§1 `:22`）——本批实施轮落」（批档 `:100`/`:101`）；A-DD28 ④（`:1598`）保持单源引用「（§3.19 受影响面表）」⇒ 表一更新即同拍（批档 `:28`）⇒ 实施 R-12/R-13 不再越界 |
| 2 | 2 | DOC-DISCIPLINE.md `:942` | 🟡 | Fixed | R-12 落点已含档面描述位：「\| R-12 \| `thincoder-core/manifest-schema.mjs:46` / `:75-79` / `:119-121` · `thincoder-core/manifest.mjs:13` · `docs/core/design/MANIFEST.md:107` \|」（改后列含「`MANIFEST.md:107` 去 `checkConfig.lineCounts` 元素层形态句」），受影响面表 `:959` 同步 |
| 3 | 3 | DOC-DISCIPLINE.md `:931`（R-7 行） | 🟡 | Fixed | 第 5 条落位写定：「「五档接口」⇒ **四档接口**（D3——`doc-check-linecounts.mjs` 项**移出接口列表**，于表后另立一行「**手跑读数器（不入引擎 · 零 import 点）**」；标题计数 4 = 列表条数）」 |
| 4 | 4 | DOC-DISCIPLINE.md `:935`（R-11 行） | 🟡 | Fixed | 改动清单已含「`:1075`（§4.2.6 实装现状）」，改后列写定为「§4.2.6 改述「`scripts/` 现存五档 = **四档引擎**（锚 + 行宽 + 入口 + 采集）+ **一手跑读数器**（行数面——不入引擎）」」 |
| 5 | 5 | DOC-DISCIPLINE.md `:913` ∥ `:1595` ∥ `:980` | 🟡 | Fixed | 域已界定（三处同拍）：`:913`「**跟踪面零 import 点**（不入引擎 = 不再自动跑；跟踪面 = 仓内受跟踪源树 ∥ 排除 `.thincoder/**` 草稿」；A-DD28 ① `:1595`「全仓**跟踪面**（仓内受跟踪源树 ∥ 排除 `.thincoder/**` 草稿）`doc-check-linecounts` 的 **import 点 = 0**」；DD-69 `:980` 同域 |
| 6 | 6 | DOC-DISCIPLINE.md `:960` ∥ 批档 `:70` | 🟡 | Fixed | 现读两值 + 增量已补：`:960` 记 `178 ∥ 287` ∥ `−9（schema）∥ 0（行内改，manifest）`。本节复核实读：`manifest-schema.mjs` 内容行止于 `:178`（工具总数 179 = 内容 +1，与 `:203`/KD-4 口径一致）；`manifest.mjs` 内容行止于 `:287`（工具总数 288）；删面 = `:46` 1 行（`lineCounts: Object.freeze([]), // 行数面机检声明（#546）：[] = 未载惰性（doc-check 行数族）`）+ `:75-79` 5 行 + `:119-121` 3 行 = **9** ⇒ 现读与增量均自洽 |
| 7 | 7 | 批档 §四 · DOC-DISCIPLINE.md `:935` | 🟡 | Fixed | 表内直改：「\| `scripts/doc-check.mjs` \| 104 \| −13 \| 工程工具面 · eng-coder \|」（批档 `:64`）；R-11 行号用 `:804`（`:935`）；「原记 ⇒ 实算」订正句已离设计面（只在 §1 `:26` 过程面留痕） |
| 8 | 8 | DOC-DISCIPLINE.md `:82` | 🟡 | Fixed | 出处句已去批档路径括注：「**出处**：用户 2026-10-15 12:10 逐字（原话逐字见上）；**本条自持**——禁令本体 + 逐字原话已在此，不依赖任何过程载体（该载体清后本条仍全效）。」；批档 §2 旧「⚠ 张力」记载已换为收口句（`:106`）⇒ 与 §1 `:22` 裁定同拍。本节复核：本档内 `docs/batches/` 命中皆为目录级 / 模板形 / 机制本体句（§4.5.4 例外②③），无具体批档路径残留 |
| 9 | 9 | DOC-DISCIPLINE.md `:966` | 🔵 | Fixed | 先例行已补实现坐标：「**实现坐标**：本条是**退场面**——无「在位实现」坐标可引」（后接删面坐标 R-2–R-6 ∥ R-12 + 保留面坐标） |
| 10 | 10 | DOC-DISCIPLINE.md `:962` | 🔵 | Fixed | 理由改记实因：「本条**不新增检查项** ⇒ **无判据改动词的护栏义务**；且盘上**无测试件依赖该面**」+「禁调令只作**读数面约束**（不跑入口 ∥ 不直调导出——见 §2），不构成本段理由。」 |
| 11 | (new) | 批档 §2 `:102`（U-R3 行） | 🟡 | New | 本条未列在轮 1 十条内、由本轮修面同拍遗漏所见：U-R3 的「须裁」列仍写「另批（桌面域笔）或并入本批」，与 §1 `:22` 已裁「**U-R3（R-14）= 转出台账**（…→ 并 `#1576` 行）」相抵——其中「并入本批」分支字面即入本批。§1 `:29` 已登记「**登记（不阻断）**：批档 §2 上抛表 U-R3 行文字仍写「另批或并入本批」，与 §1 已裁「转出台账（并 `#1576`）」**结局一致**（均不入本批）⇒ 纯文字滞后，留待落笔轮同拍。」——登记理由「均不入本批」与实际行文（含「并入本批」）不完全相符，属文字滞后未清；落笔轮同拍即可，不阻断 |
| 12 | (new) | DOC-DISCIPLINE.md `:938` | 🔵 | New | 批档 `:109` 声称「`DOC-DISCIPLINE.md:938`「计外发现」标签同拍」，现文为「**计外发现（非派单四处清单所列——处置：R-12/R-13 = 本批 · R-14 = 本批零触）**：」——括注内的处置已同拍（本批），但题名「计外发现」未改，字面与「= 本批」构成轻度反义；建议落笔轮把题名一并改述（如「派单外发现」），不阻断 |

**计数**：轮 1 表十条 = 全部 Fixed（0 Unfixed · 0 Accepted）· 新见 2（🟡 1 · 🔵 1）· 余🔴 0。
**射程外备注（不判级）**：`DOC-DISCIPLINE.md:1402`（A-DD26 落点列「§4.5 · 批档 §2」）含裸「批档 §N」形态，而 A-DD26 判据②（`:1408`）正令「无路径字面的批档指针命中 = 0」——系既有状态（非本轮修面所引），仅记备。
VERDICT: pass

## §4 用户批准（主 agent）
## §5 实施记录（eng-coder）

**状态行**：实施完成（内审 clean + 代码评审 pass · 2026-10-16）

**交付摘要**：R-12 产品码面（C 族 · 行数声明面退役）落笔完成。撤 `checkConfig.lineCounts` 缺省值键 ∥ 元素层谓词 `isLineCountsValue` ∥ `validateManifest` 校验支 ∥ `manifest.mjs` 头注枚举句；并同拍收正模块头注计数句。落笔面 = `thincoder-core/manifest-schema.mjs`（**178 → 167 · −11**，`countContentLines` 口径）· `thincoder-core/manifest.mjs`（**287 → 287 · ±0**）。

**逐处（改前现文 → 改后 · file:line）**：

| # | file:line（改前） | 改前现文 | 改后 |
|---|---|---|---|
| 1 | `manifest-schema.mjs:46` | `lineCounts: Object.freeze([]), // 行数面机检声明（#546）：[] = 未载惰性（doc-check 行数族）` | 整行删（`exemptions` 成 `checkConfig` 末键，尾逗号合法） |
| 2 | `manifest-schema.mjs:75-80` | `/** …checkConfig.lineCounts 元素层判据… */` + `function isLineCountsValue(v) { … }`（5 行）+ 后随空行 | 整段 6 行删（含分隔空行——避免自造双空行） |
| 3 | `manifest-schema.mjs:119-122` | `// checkConfig.lineCounts 元素层形态…` + `if (nested === "checkConfig" && sub === "lineCounts" && !isLineCountsValue(value[sub])) {` + `errors.push(…)` + `}` | 整段 **4** 行删（设计写 `:119-121` 只点名 3 行，**漏收尾 `}`**；只删 3 行留孤 `}` = 语法错） |
| 4 | `manifest-schema.mjs:4` | `… · 元素层谓词两件 · …` | `… · 元素层谓词一件 · …`（**未列项**：谓词删后计数失真，同拍收正） |
| 5 | `manifest.mjs:13` | `…（…，F7）+ checkConfig.lineCounts 元素层形态——**纯函数、零 fs**；不落盘。` | `…（…，F7）——**纯函数、零 fs**；不落盘。`（行内改 ±0） |

**决策透明表**：

| 决策 | 依据 |
|---|---|
| 校验支删 4 行（含 `}`），非设计所写 3 行 | 该支带花括号（注释 + `if` + `push` + `}`）；只删 3 行留孤 `}` ⇒ `node --check` 必红。最小合法删除 = `:119-122` |
| 头注 `两件`⇒`一件`（未列项） | 任务书「不留悬挂引用…一并处理并点名」；谓词删后「元素层谓词」只剩 `isNonEmptyStringArray`，计数失真即 drift |
| 谓词段连后随空行一并删（−6 非 −5） | 避免自造双空行（缺陷）；净效果 = 保持档内单空行分隔 |
| 自证只用静态面 + 自撰运行时校验，**零调 doc-check** | 用户 2026-10-15 12:10 在效禁令（`DOC-DISCIPLINE.md` §2） |

**自证读数**：
- `node --check` 两档 = Syntax OK；`grep 'lineCounts|isLineCountsValue' thincoder-core/` = **0 命中**。
- 自撰运行时（`execute` import 后断言）：`checkConfig` 键 = 5（无 `lineCounts`）· `MANIFEST_SCHEMA.nestedKeys.checkConfig` 无 `lineCounts` · `fillDefaults({})` 不含该键 · **`fillDefaults` 丢输入里的 `lineCounts`（不复活）** · `validateManifest({checkConfig:{lineCounts:[]}})` ⇒ 该键入 `unknownKeys`（非 `missingKeys`、零 error）。
- 零触：我笔仅两档；`manifest-schema.mjs` 工作树另含一处**他批**未提交改动（头注第 3 行 `〔原 :194-205 + :240-369 两段非连续〕` 移除），非本轮所出（`git diff` 混同一 hunk，登记备核）。

**审计与代码评审轮次与终态**：
- **内审**（explore 子代理 · 只读偏差审计）：代码本体四问（退役完整性 / 删除最小合法 / 无悬挂引用 / 无越界）+ 头注一致性 = **全过**；唯一偏差 = 计数读数（设计 −9 vs 实测 −11），判为**设计档数值口径**（设计笔面）⇒ 代码零修。
- **代码评审**（advisor `type:"code"` · 同步）：VERDICT = **pass**；1 条 🟡（非阻断）= 设计档 R-12 坐标登记滞后（`:119-121` / `−9` 未随正 + 未列 `manifest-schema.mjs:4`），归设计笔；2 条射程外备注（`MANIFEST.md:54/104/107` 滞后 · `.thincoder/tmp` 草稿）不判级。
- **终态 = `clean`**（代码零修；未触发 fix round）。

**本轮不做**：`scripts/doc-check.mjs`（R-2–R-6）· `PROJECT-MANIFEST.json`（R-1）· `docs/**` 一切档（R-8/R-9/R-10/R-11/R-13 + `MANIFEST.md:107`）· `doc-check-linecounts.mjs`（保留面）· 桌面域 13 档（R-14）。**设计档 R-12 行号/增量收正 = 设计笔**（[上抛·知会] 已发父侧）。

## §6 验证与收口（父代理）

### 6.1 收口结论

**本批 = C 族（行数声明面）退役**（台账 `#1581`）。**链路**：用户 13:56「知道了，砍掉C族」定方向 → 设计（`eng-designer#15`）→ **设计评审轮 1 = changes-required**（🔴 1 · 🟡 7 · 🔵 2；🔴 = 父侧 §1 裁「R-12/R-13 纳批」而设计面仍记「计外」⇒ 已落判据 A-DD28 ④ 会读成违规）→ 父侧十条逐条接受 → **修正轮（`#18`）** → **评审轮 2 = pass**（轮 1 十条全 Fixed · 新见 2 不阻断）→ 签发 token → **实施**（用户 15:03「自动跑完」= 批准）→ 全落并核读。

**实施四笔 + 父侧两笔机械更正**：`eng-coder#21`（产品码 R-12）· `eng-designer#20`（设计档 R-7/R-10/R-11/R-13 + 同源级联）· `eng-designer#22`（R-12 计数随正 + 三处锚族边界句）· 父侧直笔三处（`PROJECT-MANIFEST.json` · `scripts/doc-check.mjs` · 需求档）· 父侧机械更正两处（`MANIFEST.md` 三处 · `DOC-DISCIPLINE.md:942` 坐标 `:75-80`）。

### 6.2 角色表

| 席 | 面 | 产出 |
|---|---|---|
| `eng-designer#15` | 设计 | §3.19 条目 R（改动清单 R-1–R-15）· §5 A-DD28 四条 · §2 禁令条落状态档 · §3.17 条目 P 判「保留」（三条理由） |
| 评审 `#16`（轮 1） | 独立评审 | changes-required：🔴 1 · 🟡 7 · 🔵 2（判词在 §3） |
| `eng-designer#18` | 修正轮 | 十条逐条落地（含 U-R1/U-R2 改「已裁 = 纳批」· 受影响面表补 3 行） |
| 评审 `#19`（轮 2） | 复评 | **pass**：十条全 Fixed · 新见 🟡1（U-R3 行文字滞后）· 🔵1（题名）· 🔴 0 |
| `eng-coder#21` | 产品码 | R-12：`manifest-schema.mjs` **−11**（178→167）· `manifest.mjs` ±0 · **运行时断言证明 `fillDefaults` 不复活该键** |
| `eng-designer#20` | 设计档 | R-7 七行 · R-11 六处 · R-10 两处 · R-13 三处 + `DOC-MIGRATION.md` 同源级联五处 |
| `eng-designer#22` | 随正轮 | R-12 计数/坐标随正 · 三处锚族边界句**同判去项**（判词：§3.15/§3.18 本身即行宽族 ⇒ 改「行宽」会自相抵） |
| 父侧直笔 | manifest / 工具面 / 需求档 | `lineCounts` 34 条整块删（138 行）· `doc-check.mjs` 接线段摘净 · `SPEC` `:12`/`:38` |

### 6.3 计数与读数（实跑 · 逐条）

- `PROJECT-MANIFEST.json`：**JSON 合法** ✓ · `checkConfig` 键 = 5（`scanDirs`/`lineWidth`/`widthExemptZones`/`anchors`/`exemptions`）· `lineCounts` 零残留 ✓ · 前缀复算 = 旧值零误伤 ✓。
- `scripts/doc-check.mjs`：`node --check` **Syntax OK** ✓ · `grep checkLineCounts|lineCounts` **零命中** ✓（含设计未列的 `:65` 注释残留，父侧就地收正）。
- `thincoder-core/`：`grep lineCounts|isLineCountsValue` **零命中** ✓ · `node --check` 两档净 ✓ · **运行时断言**（实施席自撰）＝ `fillDefaults({})` 不含该键 ∧ **`fillDefaults` 丢弃输入里的 `lineCounts`（不复活）** ∧ `validateManifest({checkConfig:{lineCounts:[]}})` ⇒ `unknownKeys`（零 error）——**评审轮 1 那条 🔴 的同因闭合证据** ✓。
- 行数（`countContentLines` 口径）：`manifest-schema.mjs` 178 → **167**（−11 = 1 + 5 + 1 空行 + 4）· `manifest.mjs` 287 → **287**。
- 文档侧复扫：`DOC-DISCIPLINE.md` 内「五档接口」= 0 ·「行数面（引擎）」= 0 ·「判据项 7」= 0 ✓。
- **未跑 `doc-check` 入口、未引其读数**（用户 2026-10-15 12:10 禁令 ✓；验收按 A-DD28 四条全静态执行 ✓）。

### 6.4 台账勾销与结转

| 行 | 处置 |
|---|---|
| `#1581` | **已核销**（本批交付；凭据 = 本档 §6 + §1 父侧直笔留痕） |

**本批派生（已在册）**：`#1582`（`test.yml:79` CI 步与禁令相抵 ⇒ 须停用/降级 · 工程工具面 · 父侧直改）· `#1583`（归档面被当现行的取材纪律 + 归档标记机制提议）· `#1576`（R-14 桌面域 13 档死指称已并入）· `#1577`/`#1578`/`#1579`（前批派生，另轮）。

### 6.5 未决与复核

- **§6 未决项**：无未落台账行者——`#1582`（CI 步）· `#1583`（归档取材纪律 / 机制提议）· R-14（并入 `#1576`）三件皆已入册。
- **暂缓批复核**：本批无暂缓批 ⇒ **暂缓批复核：无**。
- **冻结档残留扫描**：本批无冻结档引用。
- **U-R4（`writeManifest` 专权随 O-6 ② 删在本档失载体）**：`MANIFEST.md:56` 仍有同源条文 ⇒ **未失源**，无动作。
- **他批残留（非本批）**：`thincoder-core/manifest-schema.mjs` 头注第 3 行 `〔原 :194-205 + :240-369 两段非连续〕` 的移除来自另一在飞批（实施席已如实报，勿计本批账）。

### 6.6 结算行

台账读数（本批收口时）：**未决 105**（本批勾销 1 行 `#1581`；派生 2 行 `#1582`/`#1583` 已入册）。
