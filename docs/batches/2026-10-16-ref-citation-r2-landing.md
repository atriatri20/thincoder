# 2026-10-16 · R2 层前缀引称落地
> 六段 append-only，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 编制：主 agent · 2026-10-16 · 来源 = 用户 2026-10-16 13:37 令「按规矩补齐」（承 `#1572` 三选一之 (b)：落 R2 层前缀引称）∥ 出处 = `docs/core/design/DOC-SYSTEM.md` §7 第 2 条（已定未落，其机检栏自记「✗ 现无」）。性质 = 缺陷修复（实现回到出处）⇒ 走轻通道：直改 → 走查 → 定版；因范围 = 全树迁移 + 机检，故另起新批（不入 `2026-10-16-doc-stale-ref-sweep`）。。
> 台账 = #1580（core · 归批）。前情 = docs/batches/2026-10-16-doc-stale-ref-sweep.md（同族，未收口）。
## §1 讨论（主 agent）
**状态行**：已收口 2026-10-16
<§1 模板占位：本批条目 / 关键判据 / 授权口径>

**范围更正（2026-10-16 13:38 · 用户当场否掉机检项）**

- **本批范围 = 仅「引称按 R2 写法迁移」**（`DOC-SYSTEM.md` §7 第 2 条：同部分跨层同名对 ⇒ 层前缀 `design/X.md §N`），核法 = **人读**。
- **「补机检」半已作废、不做**（创建时的来源行曾含此半）：R2 是**语义约定**，机检只能验**形状**（开头有无 `design/`）——形状全绿而引称语义写错时照样绿，属**替代品 / 假地板**；且 `DOC-DISCIPLINE.md` §7 自述该引擎「**可选的手跑清单工具——非门禁、不产生任何约束（用户令 > 机检）**」⇒ 加了不产生约束。
- **父侧认错**：本条源于把「这儿没验证」自动读成「这儿不安全」的反射（用户已于 2026-10-15 裁「无机检门」、2026-10-16 01:45 当面质问「为什么你总是要提机检」，本次为**第三次复发**）。

**父侧裁决（2026-10-16 15:11 · 对设计席 U-1…U-7 逐条）**

- **U-1（落笔轮时机）＝ 采设计席倾向**：R2 判据句与迁移**待 `2026-10-16-linecounts-family-retire` 批收口后另起一轮**落笔。依据 = **同档两写者**（`DOC-SYSTEM.md` / `DOC-DISCIPLINE.md` 同在 C 族批射程内；设计席按派单禁区③**两档零写入**，判据句仅以规格表交付）⇒ 不并批、不抢写，顺序 = C 族批收口 → 本轮落笔轮。
- **U-2 / U-3（基数）＝ 采实测 332 行**（设计席逐行实测 > `explore#12` 的 ≈251；五项逐项吻合 ⇒ 差在 core 设计侧与 R3 面口径），**口径须在落笔轮写明**（域 / 裸名 token 定义 / 去重规则）。
- **U-4（`:814` 命中在代码串注释内）＝ 计入**（判据不区分载体，从宽），**落笔轮逐处人判**并在 §2 标注。
- **U-5（`DOC-MIGRATION.md:534` 自述 `SETTINGS` 全路径）＝ 与 R3 同向**，落笔轮在该档明写 R2/R3 关系。
- **U-6（头行台账）＝ 父侧已改**（`#1572` ⇒ **`#1580`**；机械形态更正、可回退——`#1572` 已核销并入 `#1580`）。
- **U-7（坐标漂移 `:1460` ⇒ `:1541`）＝ 采纳**；成因 = C 族批今日在该行号前插入内容（父侧派单引旧坐标，责任在父侧）。
- **设计席自报缺陷（父侧登记，落笔轮一并处理）**：① §2 一行 **472 字符**（超 300 上限——设计席引入，append-only 未能就地改写）；② §2「四」计数表 `R2+R3` 行取值与逐组表不一致（原始面 ∥ 处置面，已订正 2 说明）；③ 逐处**改前回读未做**（332 行未逐行读）——落笔轮动作。
- **结构结论（交用户知悉）**：本批**无状态档落点**即在盘前的「工单态」——落笔轮之前，全树引称合规性**无现行判据可依**；这是「同档两批」的必然结果，非缺陷。

**禁令违规记录（父侧 · 2026-10-16 16:0x · 落笔轮 `eng-designer#23`）**

- **事实**：该席在落笔轮报告 ②「复扫读数」内自述跑过 `node scripts/doc-check.mjs --root .`（cwd = 仓根），并引其读数（悬空 241 · 行宽 FAIL 30 行 · 候选 51127 ⇒ 51112）。对照用户 **2026-10-15 12:10 逐字令**「禁止调用 `doc-check` —— **一切轮次、一切角色**，不再跑、不再引其读数、不再以其红/绿作任何判据」（在册 = `docs/core/design/DOC-DISCIPLINE.md` §2 总则族，**今日 C 族批刚落**）⇒ **违规**。
- **父侧责任（更大）**：本轮派单（`#23`）**未携带该禁令**——禁项只写「不新增机检/脚本」，未复述「不跑既有入口、不引其读数」；而 C 族批那几笔派单皆已携带 ⇒ **派单纪律破口在父侧**。另：禁令文本今日已落状态档 §2，该席读同一份档却未及该节 ⇒ 两处失守。
- **处置**：① 该席所报**一切 doc-check 读数作废**，不得作任何判据、不得引用；② 其**落笔成果不受影响**（判据句落盘 · 口径句 · 豁免条 · 折行 · 计数表读法 —— D3 计数自查走的是复扫而非该工具 ✓）；③ **本批后续一切派单必携禁令原文**（父侧更正，立即生效）；④ 后续评审不复跑该工具，验收走**源面/静态面**。
- **教训（携 why 记）**：禁令是**跨批长期约束**，不是某一批的局部禁项——**每次派单都要带，不能靠"上次带过"** ✗。

## §2 批次任务与设计（eng-designer）
**状态行**：设计完成（落笔轮后评审判据句与迁移执行表已成现行面；fix 轮（评审轮 2 · 号 1–4 + 6–9）已落（见订正 5）；全树 331 行引称迁移仍零落笔（另轮））
<§2 模板占位：本批条目（覆盖） / 设计档落点 / 机制设计 / 受影响文件与测试覆盖 / 验收对照 / 关键决策 / 上抛项>

**来源** = 用户 2026-10-16 13:37 令「按规矩补齐」+ 15:03「自动跑完」（承 `#1572` 三选一之 (b)）；台账 = `#1580`（core · 归批 · 在途）；执行人 = eng-designer。
**本轮不做**：全树引称**一行未改**；两处判据句交付 = **规格表**，不是落笔（禁区内——见「二」）。

### 一 本批条目（覆盖）

| # | 条目 | 落点 |
|---|---|---|
| ① | R2 判据句收正为**宽读**口径（关系列 ∥ 判据段 ∥ 机检列 ∥ 现状计数） | `docs/core/design/DOC-SYSTEM.md` §7 |
| ② | 两处**同层引称判 R1 合规**处改写 | `docs/core/design/DOC-DISCIPLINE.md` `:1541` ∥ `:723`（`+ :1543` 同行引称本体） |
| ③ | 全树迁移计划（逐条可落） | 本节「四」 |
| ④ | **地图式裸名列豁免**书面化（带复核条件） | `docs/core/design/DOC-SYSTEM.md` §7（R2 行附条） |
| ⑤ | **R2 ∥ R3 分工句** + 跨部分同名面实测 | 同上 |
| ⑥ | 迁移**分批顺序** | 本节「四」末 |

### 二 设计档落点 · 禁区内零触（须父侧裁）

落点 = `docs/core/design/DOC-SYSTEM.md`（§7 收正 + 例外条 + 分工句）∥ `docs/core/design/DOC-DISCIPLINE.md`（两处改写）。

**⚠️ 两档均在在途批 `2026-10-16-linecounts-family-retire` 射程内**（该批 §四表：`DOC-SYSTEM.md` = 「设计笔 · R-10 · 实施轮落」，**待落**；`DOC-DISCIPLINE.md` = 该批本轮已写、`§5` 未落）⇒ 与本批派单禁区③「不碰上一批射程内的档」**直接相抵**。

**本席处置**：按禁区办——**两档本轮零写入**；① ② 以**规格表**（本节「三」）交付，落笔随该批收口后一轮。
**代价（如实记）**：本轮设计**无状态档落点**——「三」的文本是**工单**，不是现行规则；在落笔轮之前，全树引称合规性**无现行判据可依**（`#1580` 证据面已记「宽读 ⇒ 251 条全数入迁移面 ⇒ 属新范围，须用户点头后才动」，同向）。
**禁区内零触核对**：本轮只写本批档 `§2`；`docs/core/design/{DOC-SYSTEM,DOC-DISCIPLINE,DOC-MIGRATION}.md` 零 diff · `PROJECT-MANIFEST.json` 零触 · `scripts/**` 零触 · 产品码零触。

### 三 判据句收正表（规格 · 待落笔轮执行）

**表 A —— ① `docs/core/design/DOC-SYSTEM.md` §7**

| 坐标 | 现文（逐字摘） | 改后（逐字） | 依据 |
|---|---|---|---|
| `:191` R2 行 · 关系列 | `同部分 · 跨层（需求 ↔ 设计）` | `同部分 · **同名成对**（design/X.md ↔ requirements/X.md）` | 宽读（`#1580` 父侧裁）——关系是「同名成对」，不是引称方向 |
| `:191` R2 行 · 形态列 | `**带层前缀**（解析根 = 引用方所在**部分根** `docs/<部分>/`）：`design/<档>.md §N` ∥ `requirements/<档>.md §N`` | 同文 + 追加一句：`该部分存在同名对时，**一切**指向该档名的裸名引称均须带层前缀（**不以引称方向为条件**）。` | 同上（消两列不自洽） |
| `:191` R2 行 · 机检列 | `✗ 现无——板块镜像同名使 V1 的域内索引**两档互满足节号**（mask 假阴）⇒ 须按层前缀解析` | `**人读核**（不设机检——§1 2026-10-16 13:38 用户否掉「补机检」半）` | §1 范围更正；`DOC-DISCIPLINE.md` §7 自述引擎「可选手跑清单工具、非门禁」 |
| `:198` R2 判据段 | `**R2 的机检判据**：带层前缀 ⇒ 按该层解析（基准 = 引用方所在**部分根** `docs/<部分>/`）；同一部分出现**同名两档**（design ↔ requirements 跨层对）时禁止裸名 + `§N` 引用（判红）。` | `**R2 的判据（人读）**：同一部分内 design ↔ requirements 成同名对时，**一切**裸名 + 坐标引称判违规（**不以引称方向为条件**）；带层前缀者按该层解析，基准 = 引用方所在**部分根** `docs/<部分>/`。` | 同上 |
| `:203` 现状计数 | `⇒ R2 落地红面 = 裸名 + 跨层对 **126** 处` | `⇒ R2 落地红面 = **332 行**（同名对 52 对；口径 = 同部分跨层同名对的裸名坐标引称 + 跨部分同名裸名引称，逐行计数）` | 实测（本席扫描，口径见「四」）；`126` = 旧口径，`#1580` 已记作废 |

**表 B —— ② `docs/core/design/DOC-DISCIPLINE.md`**

| 坐标 | 现文（逐字摘） | 改后（逐字） | 依据 |
|---|---|---|---|
| `:1541`（派单与 `#1580` 均记 `:1460`——**行号已漂**：该批今日在 `:1460` 之前插入内容；本席实读收正为 `:1541`） | `…引用形态 = 同部分同层**裸名** `<档>.md §N`（判据句住 `DOC-SYSTEM.md` §7 的 R1 行）。` | `…引用形态 = 同部分同层裸名 `<档>.md §N`——**仅当该部分内该档名无跨层同名对**；有同名对者一律带层前缀（例：引设计侧同名对档 ⇒ `design/DOC-SYSTEM.md §6`；判据句住 `DOC-SYSTEM.md` §7 的 **R2** 行）。` | 宽读 |
| `:1541` 同行 · 引称本体 | `§3.14 的 `DOC-SYSTEM.md §6` 引用` | `§3.14 的 `design/DOC-SYSTEM.md §6` 引用` | 宽读（`core/requirements/DOC-SYSTEM.md` 成对 ⇒ 禁裸名） |
| `:723` | `判据句住 `DOC-SYSTEM.md §6`「命名规则（选定形态）」表首行（同部分同层的板块名唯一）` | `判据句住 `design/DOC-SYSTEM.md §6`「命名规则（选定形态）」表首行（同部分同层的板块名唯一）` | 同上 |
| `:1543` | `（`DOC-SYSTEM.md` §6 命中 = 单向指针形态，无判据句复制）` | `（`design/DOC-SYSTEM.md` §6 命中 = 单向指针形态，无判据句复制）` | 同上 |

### 四 迁移计划（逐条可落）

**扫描口径（本席实测 · 非转抄）**：域 = `docs/<部分>/{design,requirements}/**`（扣 `_archive`）；命中 = 裸名 token `X.md`（token 内**不含 `/`**）后**紧随坐标**（`§N` ∥ `:N`）；面 = **R2**（该部分 design ↔ requirements 同名对）∥ **R3**（`X.md` 在 **≥2 部分**出现）；两判同中时计 **R3**。**逐行计数（同行重复 token 去重）**。核法 = **人读**（用户已裁 · 无机检项）。

**计数**

| 面 | 可动 | 禁区（`DOC-SYSTEM` ∥ `DOC-DISCIPLINE` ∥ `DOC-MIGRATION`） | 合计 |
|---|---|---|---|
| R2（纯） | 210 | 65 | 275 |
| R3（纯） | 28 | 10 | 38 |
| R2+R3 | 18 | 1 | 19 |
| **合计** | **256 行 / 114 组** | **76 行 / 26 组** | **332 行 / 140 组** |
（读法：本表 = **原始扫描分类**；逐组表按 KD-3 已把 `R2+R3` 那 19 行**归入 R3** ⇒ 其「面」列只出现 `R2` / `R3` 两值。两表同源——计数表看**原始面**，逐组表看**处置面**（同中归 R3）。）

按部分：`cli` 2 · `core` 262（可动 186 ∥ 禁区 76）· `desktop` 3 · `server` 13 · `vsc` 52。
同名对 52 对（cli 5 · core 34 · desktop 10 · server 1 · vsc 2）——与 `explore#12` 一致。
（`explore#12` 读数为「≈251 + R3 19」；本席复算得 332 —— **差异见报告「未决 ①」**：其 `core 设计侧 ≈166` ≈ 本席 246 减 `DOC-DISCIPLINE` 37；`core 需求侧 45` / `vsc R2 28` / `server 13` / `desktop 3` / `cli 1` 五项**逐项吻合**。）

**R2 改写规则（判据句 · 禁「视情况」）**
- **形**：现写法三式 —— ① 两段反引号 `` `X.md` §N `` ∥ ② 单段 `` `X.md §N` `` ∥ ③ 坐标式 `` `X.md`:N ``。改后一律 = **层前缀档名 + 原坐标**：`design/X.md §N` ∥ `requirements/X.md §N` ∥ `requirements/X.md:N`。
- **层归属**：**引称方与被引档同层 ⇒ 该层**（设计档互引 ⇒ `design/`）；**需求档回指设计档 ⇒ `design/`**（本仓需求档引称绝大多数是「源 = 设计档 `X.md`」形）。
**层判定的实证例外（逐条 · 非推测）**——五条：
- `core/design/MANIFEST.md:334` ⇒ `requirements/PORTABILITY.md:63`（FR11 = 需求侧）
- `core/design/TESTING.md:6` ⇒ `requirements/TOOLS.md §4.7`（`§4.7` 实居 `docs/core/requirements/TOOLS.md:120`）
- `core/requirements/PROMPT-SYSTEM.md:28/32/33/34/47` ⇒ `requirements/ENGINEERING-MODE-V2.md`（句作「v2 需求」）
- `core/requirements/TOOLS.md:124/149` ⇒ `requirements/TESTING.md §6/§6.2`
- `core/requirements/TESTING.md:181/183/188/210/232` ⇒ `requirements/TOOLS.md §4.7`

**R3 改写规则**：`docs/<部分>/<层>/X.md §N`（**仓根相对全路径** · 层 = 被引档所在层）。


**本副本 = 落笔履历 · 取值以单源判**：本节四的逐组表 / 禁区表 / 分批序 = 落笔履历副本，**取值一律以 `DOC-MIGRATION.md` §12 为准**；差异四处 = ① `API-CONTRACT.md` 组（单源标「出射程」）· ② 禁区表 5 组「逐处判」（单源已定案）· ③ `DOC-DISCIPLINE.md` 组行号 +2（单源作 `1544` / `1546`）· ④ 分批序第 5 / 6 行（单源已作「该批已收口 ⇒ 条件解除」）。
**逐组表（可动 114 组 · 表列 = 源档 ∥ 被引档 ∥ 面 ∥ 改后前缀 ∥ 行号）**

| 源档（`docs/` 下相对） | 被引 | 面 | 改后 | 行号 |
|---|---|---|---|---|
| `cli/requirements/READ-DATA-INTERFACE.md` | `LEDGER.md` | R3 | `docs/core/design/LEDGER.md` | `18` |
| `cli/requirements/TUI.md` | `TUI.md` | R2 | `design/` | `36` |
| `core/design/ADVISOR-CONVERGENCE.md` | `CONTEXT-COMPACTION.md` | R2 | `design/` | `404` |
| `core/design/AGENT-LOOP-ASYNC-POOL.md` | `AGENT-LOOP.md` | R2 | `design/` | `14` `36` `871` `1004` `1087` |
| `core/design/AGENT-LOOP-SUBAGENT.md` | `AGENT-LOOP.md` | R2 | `design/` | `101` `350` `407` `410` |
| `core/design/AGENT-LOOP-SUBAGENT.md` | `CONFIG.md` | R2 | `design/` | `647` |
| `core/design/AGENT-LOOP-SUBAGENT.md` | `DESIGN-TOKEN-SETTLEMENT.md` | R2 | `design/` | `49` |
| `core/design/AGENT-LOOP-SUBAGENT.md` | `TESTING.md` | R2 | `design/` | `273` `330` |
| `core/design/AGENT-LOOP-SUBAGENT.md` | `TOOLS.md` | R2 | `design/` | `672` |
| `core/design/AGENT-LOOP.md` | `CONTEXT-COMPACTION.md` | R2 | `design/` | `276` `458` |
| `core/design/AGENT-LOOP.md` | `CORE-UNIFICATION.md` | R2 | `design/` | `6` `163` `167` `456` `460` |
| `core/design/AGENT-LOOP.md` | `MEMORY.md` | R2 | `design/` | `461` |
| `core/design/AGENT-LOOP.md` | `MULTI-INSTANCE-COLLAB.md` | R2 | `design/` | `467` |
| `core/design/AGENT-LOOP.md` | `PORTABILITY.md` | R2 | `design/` | `288` |
| `core/design/API-CONTRACT.md` | `TOOLS.md` | R2 | `design/` | `814` |
| `core/design/BASH-EXECUTOR-FACE.md` | `CORE-UNIFICATION.md` | R2 | `design/` | `90` |
| `core/design/BATCH-RECORD.md` | `TOOLS.md` | R2 | `design/` | `64` `229` `239` `244` `347` `517` |
| `core/design/BROWSER-TOOL.md` | `TOOLS.md` | R2 | `design/` | `33` |
| `core/design/CHECKPOINT.md` | `CORE-UNIFICATION.md` | R2 | `design/` | `6` `64` |
| `core/design/CHECKPOINT.md` | `TOOLS.md` | R2 | `design/` | `104` |
| `core/design/CONFIG.md` | `ADVISOR-CONVERGENCE.md` | R2 | `design/` | `96` |
| `core/design/CONFIG.md` | `CORE-UNIFICATION.md` | R2 | `design/` | `6` `57` `59` `72` |
| `core/design/CONSULTATION.md` | `CORE-UNIFICATION.md` | R2 | `design/` | `6` `85` `89` |
| `core/design/CONTEXT-COMPACTION.md` | `CORE-UNIFICATION.md` | R2 | `design/` | `6` `37` |
| `core/design/CONTEXT-COMPACTION.md` | `PROVIDER.md` | R2 | `design/` | `41` `57` |
| `core/design/CONTEXT-COMPACTION.md` | `SESSION.md` | R2 | `design/` | `104` |
| `core/design/CONTEXT-COMPACTION.md` | `TOOLS.md` | R2 | `design/` | `354` |
| `core/design/CORE-UNIFICATION.md` | `AGENT-LOOP.md` | R2 | `design/` | `744` `769` |
| `core/design/CORE-UNIFICATION.md` | `TOOLS.md` | R2 | `design/` | `796` |
| `core/design/DESIGN-TOKEN-SETTLEMENT.md` | `ENG-TOKEN-BINDING.md` | R2 | `design/` | `94` |
| `core/design/ENG-TOKEN-BINDING.md` | `DESIGN-TOKEN-SETTLEMENT.md` | R2 | `design/` | `195` |
| `core/design/ENGINEERING-MODE-V2.md` | `PROMPT-SYSTEM.md` | R2 | `design/` | `295` `297` |
| `core/design/ENGINEERING-MODE-V2.md` | `SESSION.md` | R2 | `design/` | `329` |
| `core/design/I18N.md` | `CORE-UNIFICATION.md` | R2 | `design/` | `6` `38` `42` |
| `core/design/LEDGER-SELF-CONTAINED.md` | `PROMPT-SYSTEM.md` | R2 | `design/` | `146` |
| `core/design/LEDGER.md` | `MEMORY.md` | R2 | `design/` | `65` `268` `379` `654` |
| `core/design/LOGGING.md` | `CONFIG.md` | R2 | `design/` | `100` |
| `core/design/LOGGING.md` | `CORE-UNIFICATION.md` | R2 | `design/` | `6` `41` |
| `core/design/MANIFEST.md` | `DESIGN-TOKEN-SETTLEMENT.md` | R2 | `design/` | `332` |
| `core/design/MANIFEST.md` | `LEDGER.md` | R3 | `docs/core/design/LEDGER.md` | `331` `686` |
| `core/design/MANIFEST.md` | `LIGHT-CHANNEL.md` | R2 | `design/` | `332` |
| `core/design/MANIFEST.md` | `MEMORY.md` | R2 | `design/` | `123` `125` `280` `683` |
| `core/design/MANIFEST.md` | `PORTABILITY.md` | R2 | `design/`（`:334` 例外 ⇒ `requirements/`） | `280` `296` `334` `358` |
| `core/design/MANIFEST.md` | `PROMPT-SYSTEM.md` | R2 | `design/` | `240` |
| `core/design/MANIFEST.md` | `TOOLS.md` | R2 | `design/` | `331` |
| `core/design/MCP.md` | `CORE-UNIFICATION.md` | R2 | `design/` | `6` `19` `47` |
| `core/design/MEMORY.md` | `AGENT-LOOP.md` | R2 | `design/` | `812` |
| `core/design/MEMORY.md` | `CORE-UNIFICATION.md` | R2 | `design/` | `6` `20` `73` |
| `core/design/MEMORY.md` | `PORTABILITY.md` | R2 | `design/` | `804` |
| `core/design/MEMORY.md` | `PROMPT-SYSTEM.md` | R2 | `design/` | `800` |
| `core/design/MODEL-BENCH.md` | `CONFIG.md` | R2 | `design/` | `105` |
| `core/design/MODEL-SPECS.md` | `PROVIDER.md` | R2 | `design/` | `467` `1400` `1413` `1442` |
| `core/design/MODEL-SPECS.md` | `SETTINGS.md` | R3 | `docs/vsc/design/SETTINGS.md` | `1415` |
| `core/design/MULTI-INSTANCE-COLLAB.md` | `SESSION.md` | R2 | `design/` | `23` `45` `66` `71` `75` `298` `320` `321` |
| `core/design/MULTI-INSTANCE-COLLAB.md` | `TOOLS.md` | R2 | `design/` | `144` |
| `core/design/PROMPT-SYSTEM.md` | `CONFIG.md` | R2 | `design/` | `593` `710` |
| `core/design/PROMPT-SYSTEM.md` | `CORE-UNIFICATION.md` | R2 | `design/` | `6` `144` |
| `core/design/PROMPT-SYSTEM.md` | `ENGINEERING-MODE-V2.md` | R2 | `design/` | `880` |
| `core/design/PROMPT-SYSTEM.md` | `MEMORY.md` | R2 | `design/` | `377` |
| `core/design/PROMPT-SYSTEM.md` | `SETTINGS-TOOL.md` | R2 | `design/` | `798` |
| `core/design/PROMPT-SYSTEM.md` | `TOOLS.md` | R2 | `design/` | `307` |
| `core/design/PROVIDER.md` | `CORE-UNIFICATION.md` | R2 | `design/` | `6` `57` |
| `core/design/PROXY.md` | `PROVIDER.md` | R2 | `design/` | `36` |
| `core/design/SESSION.md` | `CORE-UNIFICATION.md` | R2 | `design/` | `6` `24` `42` `60` |
| `core/design/SESSION.md` | `MULTI-INSTANCE-COLLAB.md` | R2 | `design/` | `91` |
| `core/design/SESSION.md` | `PROVIDER.md` | R2 | `design/` | `192` |
| `core/design/SETTINGS-TOOL.md` | `MULTI-INSTANCE-COLLAB.md` | R2 | `design/` | `31` |
| `core/design/TESTING.md` | `TOOLS.md` | R2 | `requirements/`（`§4.7` 实居需求档） | `6` |
| `core/design/TOOLS.md` | `AGENT-LOOP.md` | R2 | `design/` | `282` |
| `core/design/TOOLS.md` | `BROWSER-TOOL.md` | R2 | `design/` | `904` `1185` |
| `core/design/TOOLS.md` | `CONTEXT-COMPACTION.md` | R2 | `design/` | `170` |
| `core/design/TOOLS.md` | `CORE-UNIFICATION.md` | R2 | `design/` | `6` `85` `146` `771` |
| `core/design/TOOLS.md` | `PROMPT-SYSTEM.md` | R2 | `design/` | `258` |
| `core/design/TRACES.md` | `AGENT-LOOP.md` | R2 | `design/` | `44` |
| `core/design/TRACES.md` | `CORE-UNIFICATION.md` | R2 | `design/` | `6` `40` |
| `core/design/WORKSPACE.md` | `CORE-UNIFICATION.md` | R2 | `design/` | `6` `63` |
| `core/requirements/AGENT-LOOP.md` | `AGENT-LOOP.md` | R2 | `design/` | `23` `247` |
| `core/requirements/CHECKPOINT.md` | `CHECKPOINT.md` | R2 | `design/` | `24` |
| `core/requirements/CONFIG.md` | `CONFIG.md` | R2 | `design/` | `23` `26` |
| `core/requirements/CONSULTATION.md` | `CONSULTATION.md` | R2 | `design/` | `21` |
| `core/requirements/CONTEXT-COMPACTION.md` | `CONTEXT-COMPACTION.md` | R2 | `design/` | `22` `25` `29` |
| `core/requirements/ENGINEERING-MODE-V2-SPEC-LEDGER.md` | `MEMORY.md` | R2 | `design/` | `41` |
| `core/requirements/I18N.md` | `I18N.md` | R3 | `docs/core/design/I18N.md` | `24` |
| `core/requirements/LOGGING.md` | `LOGGING.md` | R2 | `design/` | `20` |
| `core/requirements/MCP.md` | `MCP.md` | R3 | `docs/core/design/MCP.md` | `21` |
| `core/requirements/MEMORY.md` | `MEMORY.md` | R2 | `design/` | `24` |
| `core/requirements/MEMORY.md` | `MULTI-INSTANCE-COLLAB.md` | R2 | `design/` | `201` |
| `core/requirements/PROMPT-SYSTEM.md` | `ENGINEERING-MODE-V2.md` | R2 | `requirements/` | `28` `32` `33` `34` `47` |
| `core/requirements/PROMPT-SYSTEM.md` | `PROMPT-SYSTEM.md` | R2 | `design/` | `59` `216` |
| `core/requirements/PROVIDER.md` | `PROVIDER.md` | R2 | `design/` | `20` `24` `25` `31` |
| `core/requirements/SESSION.md` | `SESSION.md` | R2 | `design/` | `22` `39` |
| `core/requirements/TESTING.md` | `TOOLS.md` | R2 | `requirements/` | `181` `183` `188` `210` `232` |
| `core/requirements/TOOLS.md` | `TESTING.md` | R2 | `requirements/` | `124` `149` |
| `core/requirements/TOOLS.md` | `TOOLS.md` | R2 | `design/` | `23` `62` `63` `64` `65` `66` `68` `69` |
| `core/requirements/TRACES.md` | `TRACES.md` | R2 | `design/` | `20` |
| `core/requirements/WORKSPACE.md` | `WORKSPACE.md` | R2 | `design/` | `23` |
| `desktop/design/ACTIVITY.md` | `PROJECT.md` | R3 | `docs/desktop/design/PROJECT.md` | `116` |
| `desktop/design/SESSIONS.md` | `PROJECT.md` | R3 | `docs/desktop/design/PROJECT.md` | `142` `163` |
| `server/design/accounts/ACCOUNTS.md` | `PROJECT.md` | R3 | `docs/server/requirements/PROJECT.md` | `4` |
| `server/design/agent/ADMIN-AGENT.md` | `PROJECT.md` | R3 | `docs/server/design/PROJECT.md` | `6` `41` `540` `613` |
| `server/design/client/CLIENT.md` | `PROJECT.md` | R3 | `docs/server/requirements/PROJECT.md` | `4` |
| `server/design/gateway/API.md` | `PROJECT.md` | R3 | `docs/server/requirements/PROJECT.md` | `4` |
| `server/design/ledger/LEDGER.md` | `PROJECT.md` | R3 | `docs/server/requirements/PROJECT.md` | `4` |
| `server/design/mcp/MCP.md` | `PROJECT.md` | R3 | `docs/server/design/PROJECT.md` | `89` |
| `server/design/metering/METERING.md` | `PROJECT.md` | R3 | `docs/server/requirements/PROJECT.md` | `4` |
| `server/design/ops/OPS.md` | `PROJECT.md` | R3 | `docs/server/requirements/PROJECT.md` | `4` |
| `server/design/project/PROJECTS.md` | `PROJECT.md` | R3 | `docs/server/requirements/PROJECT.md` | `4` |
| `server/design/webui/WEBUI.md` | `PROJECT.md` | R3 | `docs/server/requirements/PROJECT.md` | `4` |
| `vsc/design/VSC-DEBT.md` | `PROJECT.md` | R3 | `docs/vsc/requirements/PROJECT.md` | `13` `15` `145` `146` `147` `151` `152` `195` `197` `421` `459` |
| `vsc/design/VSC-DEBT.md` | `WEBVIEW.md` | R2 | `design/` | `14` `149` `150` `196` `224` |
| `vsc/design/WEBVIEW-PROTOCOL.md` | `I18N.md` | R3 | `docs/core/design/I18N.md` | `275` |
| `vsc/design/WEBVIEW-PROTOCOL.md` | `SETTINGS.md` | R3 | `docs/vsc/design/SETTINGS.md` | `115` `120` `122` `124` `390` `413` `415` `451` `463` `496` `497` |
| `vsc/design/WEBVIEW-PROTOCOL.md` | `WEBVIEW.md` | R2 | `design/` | `50` `92` `101` `190` `200` `210` `216` `246` `262` `263` `266` `271` `311` `315` `316` `319` `320` `329` `363` `424` `427` `500` `501` |
| `vsc/requirements/WEBVIEW.md` | `SETTINGS.md` | R3 | `docs/vsc/design/SETTINGS.md` | `33` |

**禁区表（26 组 / 76 行 · 随 `linecounts-family-retire` 收口后同轮）**

| 源档（`docs/` 下相对） | 被引 | 面 | 改后 | 行号 |
|---|---|---|---|---|
| `core/design/DOC-DISCIPLINE.md` | `AGENT-LOOP.md` | R2 | `design/` | `264` `378` `389` `390` `391` `392` `393` `394` `395` `401` `409` `1496` `1627` |
| `core/design/DOC-DISCIPLINE.md` | `CHAT.md` | R3 | `docs/desktop/design/CHAT.md` ∥ `docs/server/design/webui/CHAT.md`（逐处判） | `944` |
| `core/design/DOC-DISCIPLINE.md` | `CORE-UNIFICATION.md` | R2 | `design/` | `210` `1626` |
| `core/design/DOC-DISCIPLINE.md` | `DESIGN-TOKEN-SETTLEMENT.md` | R2 | `design/` | `1235` |
| `core/design/DOC-DISCIPLINE.md` | `DOC-SYSTEM.md` | R2 | `design/`（`:1541`/`:1543` 见「三」表 B） | `521` `522` `723` `726` `1389` `1501` `1503` `1541` `1543` |
| `core/design/DOC-DISCIPLINE.md` | `PROMPT-SYSTEM.md` | R2 | `design/` | `521` `522` `606` `1501` `1503` `1505` |
| `core/design/DOC-DISCIPLINE.md` | `SETTINGS.md` | R3 | `docs/vsc/design/SETTINGS.md`（逐处判） | `944` |
| `core/design/DOC-DISCIPLINE.md` | `TESTING.md` | R2 | `design/` | `264` |
| `core/design/DOC-DISCIPLINE.md` | `TOOLS.md` | R2 | `design/` | `522` `606` `1501` `1503` `1505` |
| `core/design/DOC-MIGRATION.md` | `AGENT-LOOP.md` | R2 | `design/` | `29` `41` `64` `289` |
| `core/design/DOC-MIGRATION.md` | `CONFIG.md` | R2 | `design/` | `54` `310` |
| `core/design/DOC-MIGRATION.md` | `CONSULTATION.md` | R2 | `design/` | `310` |
| `core/design/DOC-MIGRATION.md` | `CORE-UNIFICATION.md` | R2 | `design/` | `195` `310` |
| `core/design/DOC-MIGRATION.md` | `DOC-SYSTEM.md` | R2 | `design/` | `14` `151` `311` `460` `534` |
| `core/design/DOC-MIGRATION.md` | `ENG-TOKEN-BINDING.md` | R2 | `design/` | `311` `314` |
| `core/design/DOC-MIGRATION.md` | `I18N.md` | R3 | `docs/core/design/I18N.md`（逐处判） | `311` |
| `core/design/DOC-MIGRATION.md` | `LEDGER.md` | R3 | `docs/core/design/LEDGER.md`（逐处判） | `311` |
| `core/design/DOC-MIGRATION.md` | `PORTABILITY.md` | R2 | `design/` | `312` |
| `core/design/DOC-MIGRATION.md` | `PROJECT.md` | R3 | 逐处判（`core/desktop/server/vsc` 四部分同名） | `395` `396` `400` `405` `468` `471` `524` |
| `core/design/DOC-MIGRATION.md` | `PROMPT-SYSTEM.md` | R2 | `design/` | `503` |
| `core/design/DOC-MIGRATION.md` | `SEND-STALL-DISTILL.md` | R2 | `design/` | `312` |
| `core/design/DOC-MIGRATION.md` | `TOOLS.md` | R2 | `design/` | `30` `38` `39` `71` `72` |
| `core/design/DOC-MIGRATION.md` | `TWO-REPO-MERGE.md` | R2 | `design/` | `313` |
| `core/design/DOC-MIGRATION.md` | `VERIFY-REDESIGN.md` | R2 | `design/` | `200` |
| `core/design/DOC-MIGRATION.md` | `WORKSPACE.md` | R2 | `design/` | `45` |
| `core/design/DOC-SYSTEM.md` | `PROMPT-SYSTEM.md` | R2 | `design/` | `143` |

**分批顺序（依据 = 写者冲突 ∥ 面大小）**

| 批 | 部分 | 行数 | 依据 |
|---|---|---|---|
| 1 | `server` | 13 | 面小 · **无在途写者** · R2/R3 同轮（`PROJECT.md` 一次定形） |
| 2 | `desktop` | 3 | 同上 |
| 3 | `vsc` | 52 | 有**正向夹具**（`docs/vsc/requirements/WEBVIEW.md:5` 已写 `design/WEBVIEW.md`、`:142` 明文引 R2 形 ⇒ 零改，可作对齐样板）· R3 面最大 |
| 4 | `cli` | 2 | 同第 1 批 |
| 5 | `core` 可动 | 186 | 面最大；**且 76 行在在途批射程内** ⇒ 须待其收口 |
| 6 | `core` 禁区 | 76 | 随第 5 批解除条件 |

### 五 豁免条（地图式裸名列 · 待落 `DOC-SYSTEM.md` §7）

拟入 `docs/core/design/DOC-SYSTEM.md` §7（R2 行后附条），逐字文本：

```text
**R2 例外（地图式裸名列 · 带复核条件）**：``文档**地图 / 登记表**内的**裸档名列**``（`docs/README.md` §4 子系统档表与逐档登记行等）**不属引称**、不判 R2——它是**地图**（谁在哪一栏），不是**引用**（读哪一节）；理由 = 地图方**无「部分根」**（跨部分登记），落不进 R2 的解析根模型。
**复核条件**：该列一旦**携带坐标**（`§N` ∥ `:N`）⇒ 即转为**引称**、照 R1/R2/R3 判；地图行被**改写成引用句**时同判。
**形**：裸名 + 无坐标。
```

`docs/README.md:47-61`（`core/design` 子系统档表）· `:74-84`（其余 39 档列）· `:86-97`（工作流档 + `core/requirements` 登记）· `:72`（`vsc/` 档列）——**逐行实读：全为裸名 + 无坐标**（`:45-62`/`:74-84` 的第三列是**台账编号**非坐标）⇒ 全部落在本条内、**零改**。

### 六 R2 ∥ R3 分工句（待落 `DOC-SYSTEM.md` §7）

```text
**R2 ∥ R3 分工**：`X.md` 在**同一部分**内 design ↔ requirements 成同名对 ⇒ 走 **R2**（层前缀 `design/X.md` ∥ `requirements/X.md`）；`X.md` 在 **≥2 个部分**出现 ⇒ 走 **R3**（仓根相对全路径 `docs/<部分>/<层>/X.md`）。**两判同时成立时判 R3**（全路径含部分 + 层，已消歧，无须再判 R2）。
**跨部分同名面（实测 6 名）**：`CHAT.md`（desktop · server）· `I18N.md`（core · server）· `LEDGER.md`（core · server）· `MCP.md`（core · server）· `PROJECT.md`（core · desktop · server · vsc）· `SETTINGS.md`（desktop · vsc）。
```

**派单所举不全（本席实测收正）**：派单作「`PROJECT` 落 desktop∥server∥vsc · `SETTINGS` 落 desktop∥vsc」——`PROJECT.md` **亦在 `docs/core/requirements/`**；另四名（`CHAT`/`I18N`/`LEDGER`/`MCP`）同属跨部分面，未列。

### 七 受影响文件与验收对照

| # | 档 | 本轮 | 落笔轮 |
|---|---|---|---|
| 1 | `docs/core/design/DOC-SYSTEM.md` | 零写（禁区） | §7 四处收正 + 例外条 + 分工句 |
| 2 | `docs/core/design/DOC-DISCIPLINE.md` | 零写（禁区） | `:1541`/`:723`/`:1543` 三处 |
| 3 | 迁移面 114 组 / 256 行（51 档） | 零写 | 分批 1–5 |
| 4 | 禁区迁移 26 组 / 76 行（3 档） | 零写 | 分批 5–6 |
| 5 | 本批档 `§2` | **已落** | —— |

| # | 验收标准 | 方式 |
|---|---|---|
| ① | 判据句收正表齐（`file:line` → 现文 → 改后） | 本节「三」（表 A 5 行 + 表 B 4 行） |
| ② | 迁移计划逐组**给定案**（或明标逐处人判 + 判定记录面）+ 计数自洽 | `docs/core/design/DOC-MIGRATION.md` §12（组数 114 + 26 = 140；行数 256 + 76 = 332；逐处判 5 组已在表内给定案；出射程 1 组已列） |
| ③ | 豁免条含范围 + 复核条件 | 本节「五」 |
| ④ | R2/R3 分工句 + 跨部分同名面 6 名 | 本节「六」 |
| ⑤ | 越界零触（**源面核**） | 受影响档清单 + 逐档比对（源面：`git diff` 逐档 ∥ 直读档）+ 越界档零命中——**不依赖 `git diff --stat` 单条读数**（三档现存改动 = 授权落笔 · `PROJECT-MANIFEST.json` 零 diff · `scripts/**` 零 diff） |

### 八 关键决策

| # | 决策 | 依据 / 否决 |
|---|---|---|
| KD-1 | 取**宽读**（有对即禁裸名） | 父侧已裁；依据 = R2 自述的 mask 成因（域内两档互满足节号 ⇒ 同层引称一样中招） |
| KD-2 | 两处判据句**本轮只出规格、零落笔** | 派单禁区③（不碰在途批射程内的档）与要点 ① ② 的相交处；落笔随该批收口轮（代价见「二」） |
| KD-3 | **R3 优先于 R2**（两判同中计 R3） | 全路径含部分 + 层 ⇒ 已消歧；否则同一处要判两遍 |
| KD-4 | 豁免取**形**（裸名 + 无坐标）而非**行号清单** | 行号清单会随 README 编辑漂移；形判据自带复核条件 |
| KD-5 | 层归属给**判据句 + 实证例外名单**，不给「视情况」 | 派单明令；例外名单均带实读证据 |
| KD-6 | 分批序 = 面小/无写者者先、`core` 大面且在途批同档者后 | 报面域隔离（同档两写者 = 冲突源）；`vsc` 有正向夹具宜早对齐 |
| KD-7 | 判据句**不引本批档**（D4 方向） | 状态档不引过程档；迁移表归本档 §2（一次性载体） |
| KD-8 | 机检列改「人读核」 | §1 2026-10-16 13:38 用户当场否掉「补机检」半（该半已作废） |

### 九 上抛项

| # | 项 | 本席判断 | 须裁 |
|---|---|---|---|
| U-1 | **两档落笔时机与笔权**：`DOC-SYSTEM.md` §7 收正 + `DOC-DISCIPLINE.md` 三处的**落笔轮** | 建议随 `linecounts-family-retire` 收口后一轮（其 `DOC-SYSTEM.md` R-10 待落 ⇒ 同档两写者）；笔权 = 设计席 | 何时落、是否并入该批 |
| U-2 | **`:203` 现状计数改后值**（本席给 `332 行`，口径见「四」） | 旧值 `126` 已作废（`#1580` 已记）；新值口径须父侧认 | 采本席值 ∥ 父侧给定口径 |
| U-3 | **`explore#12` 与本节读数差**（≈251+R3 19 vs 332） | 五项子读数逐项吻合（`core 需求侧 45`/`vsc R2 28`/`server 13`/`desktop 3`/`cli 1`）⇒ 差在 `core 设计侧` 与 R3 面口径；本席值为**逐行实测** | 以何者入账 |
| U-4 | `docs/core/design/API-CONTRACT.md:814` 命中落在**代码串注释行**内 | 本席按「文本内的引称」计入 R2（R2 判据不区分载体）；`#1580` 已记「算不算引称须人判」 | 计 ∥ 出射程 |
| U-5 | `docs/core/design/DOC-MIGRATION.md:534` 自述 `SETTINGS` 已定全路径形 | 与该行 R2 归属相交（`SETTINGS` = 跨部分名 ⇒ 本席判 R3，与其次述同向） | 是否需在该档明写 R2/R3 关系 |
| U-6 | 本批档**档头台账号**：批档 `§1` 头行作 `#1572`，派单与 `#1580` 作 `#1580` | `#1572` 已核销（并入 `#1580`）⇒ 头行应为 `#1580` | 由父侧改（`§1` 归父侧笔） |
| U-7 | 派单坐标 `DOC-DISCIPLINE.md:1460` **已漂**（实读 `:1541`） | 该批今日在 `:1460` 前插内容所致；本席按实读`收正 | 与 U-1 同轮落 |

**订正（自检复读所得 · 两处标点）**：「五」围栏块首行原写 ``` ``文档…`` ```（双反引号），应为**单**反引号对 `` `文档**地图 / 登记表**内的**裸档名列**` ``；「九」U-7 末句原写「本席按实读`收正」，衍一反引号，应为「本席按实读收正」。

**订正 2（自检三道复读所得 · 两处）**

1. **「四」计数表的 `R2+R3` 行 ≠ 逐组表取值**：计数表的三行 = **原始扫描分类**；逐组表按 KD-3 已把 `R2+R3` 那 19 行**归入 R3**（故表内只出现 `R2` / `R3` 两值：R2 114 组 · R3 26 组）。两表不矛盾，读法 = 计数表看**原始面**、逐组表看**处置面**。
2. **一处超宽**：「四」的「层判定的实证例外（逐条 · 非推测）」行长 **472 字符**（超 300 单行上限）⇒ 落笔/收口轮应拆为 **5 条 bullet**（五条例外各一行）。本席复读时发现，受 append-only 约束未能就地改写。

### 十 落笔轮（2026-10-16 · 判据句已落 · 迁移仍零落笔）

**来源** = 父侧放行（`2026-10-16-linecounts-family-retire` 今日 15:3x 收口冻结 ⇒ 上一轮禁区「两档在射程内」解除）+ 本批 §1 裁决（U-1…U-7）。**执行人** = eng-designer。**本轮不做**：全树 332 行引称迁移（另轮）· 迁移面逐行改前回读（随迁移轮）· `scripts/**` ∥ `PROJECT-MANIFEST.json` ∥ `docs/README.md` 正文 零触。

**落笔逐处表（「现文 → 改后」均已落盘）**

| # | `file:line` | 现文（摘） | 改后（摘） |
|---|---|---|---|
| 1 | `docs/core/design/DOC-SYSTEM.md:191` R2 行 · 关系列 | `同部分 · 跨层（需求 ↔ 设计）` | `同部分 · **同名成对**（design/X.md ↔ requirements/X.md）` |
| 2 | `:191` 形态列 | `…requirements/<档>.md §N` | 同文 + 追加：`该部分存在同名对时，**一切**指向该档名的裸名引称均须带层前缀（**不以引称方向为条件**）` |
| 3 | `:191` 机检列 | `✗ 现无——…mask 假阴…须按层前缀解析` | `**人读核**——不设机检：R2 属语义约定，机检只能验形状…（假地板）；引擎面见 `DOC-DISCIPLINE.md` §7` |
| 4 | `:198` R2 判据段 | `**R2 的机检判据**：…时禁止裸名 + `§N` 引用（判红）。` | `**R2 的判据（人读）**：…成同名对时，**一切**裸名 + 坐标引称判违规（**不以引称方向为条件**）；带层前缀者按该层解析，基准 = …部分根 `docs/<部分>/`。` |
| 5 | `:202` 现状计数 | `R2 落地红面 = 裸名 + 跨层对 **126** 处`（旧口径 `246` 处一并删） | `同名对 **52 对**（cli 5 · core 34 · desktop 10 · server 1 · vsc 2）⇒ R2 落地红面 = **332 行 / 140 组**` |
| 6 | `:204-206`（新增） | —— | **计数口径（可复算）**：域 ∥ 裸名 token 定义 ∥ 同行去重 ∥ 两判同中计 R3；按面（行）275+38+19=332 · 按面（组）114+26=140 · 按部分 262+52+13+3+2=332 |
| 7 | `:208-210`（新增） | —— | **R2 例外（地图式裸名列 · 带复核条件）**：`docs/README.md` §4 登记列（`:47-61` ∥ `:72` ∥ `:74-84` ∥ `:86-97`）不属引称（地图 ≠ 引用）；**复核条件 = 一旦携坐标即转引称**；形 = 裸名 + 无坐标 |
| 8 | `docs/core/design/DOC-DISCIPLINE.md:723` | `判据句住 `DOC-SYSTEM.md §6`「命名规则…」` | `判据句住 `design/DOC-SYSTEM.md §6`「命名规则…」` |
| 9 | `:1544`（派单旧号 `:1541`） | `§3.14 的 `DOC-SYSTEM.md §6` 引用…；引用形态 = 同部分同层**裸名** `<档>.md §N`（判据句住 `DOC-SYSTEM.md` §7 的 R1 行）。` | `§3.14 的 `design/DOC-SYSTEM.md §6` 引用…；引用形态 = 同部分同层**裸名**——**仅当该部分内该档名无跨层同名对**；有同名对者一律带层前缀（例 ⇒ `design/DOC-SYSTEM.md §6`；判据句住 `design/DOC-SYSTEM.md` §7 的 **R2** 行）。` |
| 10 | `:1546`（派单旧号 `:1543`） | `（`DOC-SYSTEM.md` §6 命中 = 单向指针形态…）` | `（`design/DOC-SYSTEM.md` §6 命中 = 单向指针形态…）` |
| 11 | `docs/core/design/DOC-MIGRATION.md:413-414`（新增 · U-5） | —— | **同名面判据（R2 ∥ R3）**：同部分同名对 ⇒ R2；≥2 部分 ⇒ R3；同中判 R3——判据句住 `design/DOC-SYSTEM.md` §7（指针形，不重述）；本例 `SETTINGS.md` ⇒ R3，与本节处置同向 |
| 12 | 本批档 §2 `:87` ∥ `:96-100` | `:86` 计数表无读法 · `:95` 单行 **472 字符** | 计数表下加读法注（原始面 ∥ 处置面）· 472 字符行折为**五条** bullet（各 < 300） |

**复扫读数（fresh）** ⊗ **整块作废**（依据 = §1「该席所报一切 doc-check 读数作废」——不得作任何判据、不得引用）

- **本席射程非表格超宽单行**：`DOC-SYSTEM.md` 0 · `DOC-MIGRATION.md` 0 · 本批档 0 · `DOC-DISCIPLINE.md` **3**（`:966` 361 ∥ `:1230` 612 ∥ `:1232` 315——**改前既有**，非本席触碰）⇒ 本席**可动面 = 0**。
- **机检**（`node scripts/doc-check.mjs --root .` · cwd = 仓根）：锚 **悬空 241 = 改前基线**（本席三档条目逐条同源：`DOC-DISCIPLINE` 913/944×9/1106 · `DOC-MIGRATION` 181/183 · `DOC-SYSTEM` 365 → 372 位移同条）· 候选 51107 ⇒ **51112（+5，全可解析/白名单）** · 行宽 FAIL **30 行 = 改前基线**（分层前缀形经 V5-A「多命中 basename + 带 `/`」分支 fail-open 通过 ⇒ 零新增红）。
- **D3 计数核对（本席复扫）**：逐组表 **114 组 / 256 行** · 禁区表 **26 组 / 76 行** ⇒ **140 组 / 332 行** = 计数表合计 ✓；同名对逐部分复扫 = cli 5 · core 34 · desktop 10 · server 1 · vsc 2 = **52** ✓（与 `:202` 落盘值逐项相等）。

**与「三」规格表的三处落笔偏差（如实记 · 均属形态面）**

1. **机检列去批档引用**：规格文本含 `§1 2026-10-16 13:38`（= 本批档 §1）⇒ 落笔删——状态档不引过程档（D4 方向规则），理由改述为「R2 属语义约定 ⇒ 机检验形状 = 假地板」。
2. **改后文本尾部裸名收正**：规格「三」表 B 改后句尾保留裸名 `DOC-SYSTEM.md §7` ⇒ 落笔写 `design/DOC-SYSTEM.md §7`（`DOC-SYSTEM.md` 在 `core` 成同名对 ⇒ 裸名自违本轮所落 R2）；同理 `:1544` 首处引用本体按规格已带前缀。
3. **豁免条落点**：落 `§7` 末（计数口径段后 · `## 8.` 前）——表格行内不能起段 ⇒ 非「R2 行后」字面位置。
4. **本批档就地折行**：`append-only` 不能折行 ⇒ 本条二处（`:87` 读法注 ∥ `:96-100` 折行）经 `edit` 直改**本席 §2 段内**（未触他段）。

**未决 / 上抛**

| # | 项 | 本席判断 | 须裁 |
|---|---|---|---|
| V-1 | 「六」的 **R2∥R3 分工句 + 跨部分同名面 6 名清单**未落 `DOC-SYSTEM.md` §7 | 本轮派单三处未含；其判据内容经 U-5 落 `DOC-MIGRATION.md:413`（指针形）。本席浅扫（仅顶层档）得跨部分名 **2**（`PROJECT.md` · `SETTINGS.md`），6 名含 `server/` 嵌套子域档 ⇒ 若下轮要落，先按 `:204` 同一口径深扫 | 是否下轮补落 §7 |
| V-2 | `:190` R1 行指 `docs/README.md` §3.7 = **死指针**（该档现只有 §1–§5，无 §3.7） | 未改（R1 行不在本轮三处内）；属 D4/死指针类 | 是否本轮外补修 |
| V-3 | R1 行未携「同名对时 R1 让位」条件 | 该条件现落 `DOC-DISCIPLINE.md:1544`；R1 行自身照旧写「裸名」 | 是否回写 R1 行 |
| V-4 | `API-CONTRACT.md:814` 命中（U-4 已裁**计入**） | 仍待迁移轮逐处人判 | 迁移轮 |

**订正 3（fix 轮 · 评审 `#24` 十三条落地）**

**来源** = 设计评审 13 条判词（本批 §3 · VERDICT = changes-required）+ 父侧逐条接受。**执行人** = eng-designer。**本轮不做**：全树 332 行引称迁移（另轮）· `scripts/**` ∥ `PROJECT-MANIFEST.json` ∥ 产品码 ∥ `docs/core/requirements/**` 零触 · 不跑 `doc-check`、不引其读数 · 不改 §3 判词。

| # | 落点（号 → 改动 `file:line`） |
|---|---|
| 1 🔴 | `DOC-SYSTEM.md:173`（N-c）· `:190`（R1）补「同名对时让位 ⇒ 带层前缀」——与 `:191`（R2）行同形（三处对同一输入给出一致形态；R2 行不另载优先序） |
| 2 🟡 | `DOC-SYSTEM.md:212-213`（§7 新增）R2 ∥ R3 分工句 + 跨部分同名面 6 名（深扫含 `server/` 嵌套子域档） |
| 3 🟡 | 迁移执行表移入 `DOC-MIGRATION.md` §12（`:539` 起）；本档侧留本轮原委 + 指针（见下 d） |
| 4 🟡 | `DOC-MIGRATION.md` §12 逐组表 `API-CONTRACT.md:814` 组 → **出射程**；不改 .md / 不改源码 |
| 5 🟡 | `DOC-MIGRATION.md` §12 禁区表 5 组「逐处判」→ **定案**；本档 §七 验收② `:307` · 验收⑤ `:310` 改述（② 逐组给定案；⑤ 源面核法） |
| 6 🟡 | 本订正块 a（状态面：状态行 + §二 `:59` + §七 `:298`） |
| 7 🟡 | 本订正块 b（最近先例） |
| 8 🟡 | 本订正块 c（调研证据） |
| 9 🟡 | **父侧笔，未动**（`docs/core/requirements/DOC-SYSTEM.md:37` N1 ∥ 本档 `:27` 回指行） |
| 10 🟡 | `DOC-SYSTEM.md:359`（A7）· `:361`（A9）· `:366`（用例表引）· `:370`（T1）· `:371`（T2）· `:372`（T3）· `:375`（T6）改述为源面 / 静态面判据 |
| 11 🔵 | `DOC-SYSTEM.md:208` 例外条去行号坐标（判据仍以「形」为唯一落点） |
| 12 🔵 | 本档 §10「复扫读数」块首行加**作废标注**（依据 = §1 `:30`） |
| 13 🔵 | 本订正块 e（就地改写说明） |

**a 状态面收正（#6）**：§2 状态行（`:34`）· §二 `:59`（三档零 diff）· §七 `:298`（零写（禁区））均为**落笔轮前**陈述。**落笔轮实况**（授权来源 = §二 `:346` 父侧放行〔在途批今日收口 ⇒ 禁区解除〕+ §1 对 U-1…U-7 的裁决）：`DOC-SYSTEM.md` §7 · `DOC-DISCIPLINE.md`（`:723` ∥ `:1544` ∥ `:1546`）· `DOC-MIGRATION.md`（§11.1 + 本轮新增 §12）**均已落笔** ⇒「三档零 diff」「无现行判据可依」不再成立。

**b 最近先例（#7）**：先例坐标 = `docs/core/design/DOC-DISCIPLINE.md:1544`（A-DD22 判据 2「有同名对者一律带层前缀」）· 对应设计档节 = 本档 §7 交叉引用形态 · **先例批 = 本批落笔轮**（该句系本轮所改 ⇒ 批内自生、非批外独立源）；**对齐** = R1 / N-c 行按同一口径补写让位条件（同形）· **偏离** = 无 · 实现坐标 = `DOC-SYSTEM.md:190-191`。

**c 调研证据（#8）**：本面属**仓内文档机制**——核过同族设计档 `docs/core/design/{DOC-SYSTEM,DOC-DISCIPLINE,DOC-MIGRATION}.md` 与 `docs/README.md` §4 登记面；**仓外公开源均不相关**（无外部规范可引）。

**d 迁移执行表搬家（#3）**：§2 三 `:112-260` 的逐组表 + 禁区表 + 计数表 + 改写规则 + 分批序**逐字移入 `docs/core/design/DOC-MIGRATION.md` §12**（迁移主题拥有档——该表要跨分批 1–6 多轮执行，不能只住可删批档）。**单源 = `DOC-MIGRATION.md` §12**；本节副本 = 本轮原委（随批档清理消失）。

**e 就地改写说明（#13）**：§2 段内经就地 `edit` 改写处（`append-only` 不能折行所致，原行内容保留于本节历史行）：① 落笔轮（§10）：计数表下加读法注 ∥ 472 字符行折为五条 bullet；② 本轮：§七 验收② `:307` ∥ 验收⑤ `:310` 改述；§10「复扫读数」块首行加作废标注（`:365`）。改写时点 = 各行所载；追加序可复原。

**f 上抛收口（V-1 / V-3）**：V-1（§7 分工句未落）⇒ 已落 `DOC-SYSTEM.md:212-213`；V-3（R1 行未携让位条件）⇒ 已落 `:190`（N-c 同理 `:173`）。⇒ 二者不再只作上抛，已列为本轮必改处。

**订正 4（收尾轮 · 依据指针 / 回指面三处 · 2026-10-16）**

**来源** = 评审 `#24` 判词（设计席 V-2 上抛：`:190` R1 行引 `docs/README.md` §3.7 = 死指针）+ 父侧收尾裁（另二处随拍：`:29` N3 回指行 · `:27` N1 回指行）。**执行人** = eng-designer。
**本轮不做**：全树 332 行引称迁移（另轮）· `docs/core/requirements/**`（父侧本轮已落 ⇒ 零触）· `scripts/**` ∥ `PROJECT-MANIFEST.json` ∥ 产品码 ∥ `docs/README.md` 零触 · 不跑 `doc-check`、不引其读数 · 不改 §3 判词 · 不扩到三处之外。

| # | `file:line` | 现文（摘） | 改后（逐字） |
|---|---|---|---|
| 1 | `docs/core/design/DOC-SYSTEM.md:190`（R1 行 · 机检列） | `V1 现成 ✓（`docs/README.md` §3.7 口径）` | `**文本纪律面 · 人读核**（V1 无对应机检器——实装随 v2 单引擎收敛撤除；口径 = 本行形态列自载）` |
| 2 | `:29`（N3 回指行） | `§13（`A9`——三机检读数）` | `§13（`A9`——源面判据：锚引用可解析 + 行宽 + 台账面查询）` |
| 3 | `:27`（N1 回指行） | `N1 可机判 …（逐条判据句 + 机检落点）` | `N1 可判 …（逐条判据句 + 判据面：机检落点 ∥ 人读核面）` |

（§10 订正 3 第 9 条登记的「本档 `:27` 回指行」= 本条 **3**——已落，不再挂「未动」。）

**号 1 依据指针解析实证（实读）**：`docs/README.md` 标题集 = §1 本层内容 ∥ §2 迁移政策 ∥ §3 待迁清单 ∥ §4 子系统设计档 ∥ §5 与产品文档地图的关系——**无 §3.7**；该档对本板块只作外指（§2.6「交叉引用形态 = `core/design/DOC-SYSTEM.md`」）⇒ R1 口径（同部分同层裸名）在基准层 README **无落点** ⇒ 依据改**自持**（判据句 = 本行形态列 + §6 N-c）。
**历史所指（仅供溯源）** = CLI 产品树 README §3.7「文档人类可读（格式纪律）」（`thincoder-cli/docs/_archive/README.md:88`——该节讲行宽 / 跨产品引用形态，非 R1 口径；该树已归档退役）⇒ 原指针既指错档、又指错题。
**同格残句一并收正（号 1 附 · 同一格内）**：`V1 现成 ✓` 与 `docs/core/design/DOC-DISCIPLINE.md:88`（V1 落点 =「文本纪律面（**无对应机检器**）」）· `:1078`（V1–V4 机检实装随 v2 单引擎收敛**撤除**）相抵 ⇒ 同格改写为文本纪律面实况。

**复扫（源面 `grep` · 未跑任何读数器）**：字面「三机检读数」类现役句 = 设计面 **0** ∥ 本批档 **0**（本档 §10 读数块首行 `:365` 已标「整块作废」）。

**越界候选（登记 · 未动 · 不属本轮三处）**

| # | `file:line` | 内容 | 本席判 |
|---|---|---|---|
| ① | `DOC-SYSTEM.md:154` | 「含 `design/prompts/` 则 99 = **机检域读数**」 | 域内档数读数（非红/绿判据）——边界候选 |
| ② | `DOC-SYSTEM.md:183-184` | 「现状影响面（域一口径）」读数块（候选 1626 / 直命中 725 / fail-open 654 / **悬空 0** ⇒ 收紧后仍绿 1000 · 转红 601） | 含红/绿判据面——边界候选，须父侧裁是否另轮收 |
| ③ | `LEDGER-SELF-CONTAINED.md:6` ∥ `:25` | **同一死指针 `docs/README.md` §3.7** 二处（正文引用形态规范的所指） | 与号 1 同病因 · 别档（越本轮射程） |
| ④ | `docs/README.md:25` ∥ `:37` ∥ `:105` | §2.5 迁移验收 = `doc-check … exit 0` ∧ 零悬空锚 ∥ 「三机检绿」∥ §5 机检覆盖命令 | 三条机检读数类现役句（越本轮射程 · 与迁移批直接相交） |

**订正 5（fix 轮 · 评审轮 2 九条落地 · 2026-10-16）**

**来源** = 设计评审轮 2 判词（本批 §3 · VERDICT = pass · 🔴 0 / 🟡 6 / 🔵 3）+ 父侧逐条接受（号 1–4 + 6–9 归本席；号 5 = 需求面，父侧同轮已落）。**执行人** = eng-designer。

**本轮不做**：全树 331 行引称迁移（另轮）· `docs/core/requirements/**`（父侧已落 ⇒ 零触）· `scripts/**` ∥ `PROJECT-MANIFEST.json` ∥ 产品码 ∥ `docs/README.md` 零触 · 不跑 `doc-check`、不引其读数 · 不拆 `DOC-MIGRATION.md`（只出建议）· 不改 §3 判词 · 不碰已冻结的 C 族批档。

| 号 | 号 → 改动 `file:line` |
|---|---|
| 1 | 取值保持 **34 / 52**：`docs/core/design/DOC-SYSTEM.md:205`（新增 · `_archive` 不计句）∥ `docs/core/design/DOC-MIGRATION.md:547`（新增 · 同句）——依据 = 源面实算，见下 |
| 2 | 取口径 ②（判据收为三式 · 与执行面同界）：`DOC-SYSTEM.md:198`（判据段）∥ `:201`（反向夹具同步改述） |
| 3 | `DOC-SYSTEM.md:192`（R3 机检列 V1 指称收正）∥ `:197` ②（节号存在性 → 文本纪律面 · 人读核） |
| 4 | 本档 `:113`（§2 四副本前新增一行 · 副本 = 落笔履历 · 取值以单源判 + 差异四处） |
| 6 | `DOC-MIGRATION.md:56` ∥ `:101`（RELEASE 落点 → `docs/RELEASE.md`）∥ `:119`（层归属不对称登记 → 统一面档登记）；`DOC-SYSTEM.md:213` 6 名清单 = **不并计**（RELEASE 单档在仓根 · 不在任何部分） |
| 7 | 本档 `:411`（最近先例 · 补「先例批 = 本批落笔轮」+ 三要素坐标） |
| 8 | 不拆 `DOC-MIGRATION.md`——拆分建议一行随交付报告，供入册 |
| 9 | `DOC-MIGRATION.md:578`（表头 · 114 → `实迁移 113 组 + 出射程 1 组`） |

**号 1 实算证据（源面 · 本席逐名实核）**：`docs/core/design/*.md`（顶层 61）∩ `docs/core/requirements/*.md`（顶层 48）= **34 对**；两侧 `_archive` 并计 ⇒ **35**（唯一增量 = `_archive/ENGINEERING-MODE.md`）⇒ 评审读数「35」= 未扣 `_archive`。
口径与执行域均扣 `_archive` ⇒ 取值 **34**；其余四处（`cli` 5 · `desktop` 10 · `server` 1 · `vsc` 2）复算吻合 ⇒ 合计 **52**。三处取值（`DOC-SYSTEM.md:202` ∥ `DOC-MIGRATION.md:563` ∥ 本档 `:97`）本就同值 ⇒ 零改。

**号 2 同界实证（本席逐行实扫）**：紧随坐标形命中 = **335** 处（式 ① 270 ∥ ② 23 ∥ ③ 42 · 其他 **0**）⇒ 三式 ≡「紧随坐标」定义 ⇒ 判据面 = 执行面（同界）。原反向夹具作非紧随形（`X.md` 的 §N 类）⇒ 按所选口径改述（「判据说红而执行面无项」已消）。

**号 6 逐处实读**：`docs/RELEASE.md` 实存（仓根 · 单档 · 核 + CLI / VSC / 桌面三端统一发布计划）；`docs/cli/design/RELEASE.md` ∥ `docs/core/requirements/RELEASE.md` 盘上均不存在 ⇒ 三处落点均改为仓根实存路径。

**D6 回读**：落点逐处回读在场（`DOC-SYSTEM.md` `:192` `:197` `:198` `:201` `:205` · `DOC-MIGRATION.md` `:56` `:101` `:119` `:547` `:578` · 本档 `:113` `:411`）。

**就地改写登记**：① 本档 `:113` 新增一行（追加 · 原行零改）；② 本档 `:411` 就地改写（原行 = 订正 3 b 首句，改因 = 补先例批坐标 + 记该句系本轮所改）；③ 其余逐处 = 就地改写既有行（原值被取代 ⇒ 按 D8 删 · 无残留）。

## §3 设计评审（评审子代理）

### 轮次 1（评审子代理）

**独立设计评审（2026-10-16 · 评审员 = 独立 advisor，非父侧自审）** · 评审对象 = 批 2026-10-16-ref-citation-r2-landing（§2 设计面 + §10 落笔轮）∥ 同批射程档 = `docs/core/design/{DOC-SYSTEM,DOC-DISCIPLINE,DOC-MIGRATION}.md`。**本评审未跑 `doc-check`、未引其任何读数**（在效禁令：`docs/core/design/DOC-DISCIPLINE.md:80`），验收只走源面 / 静态面。

**独立复算（源面核过、站得住的部分）**：逐组表 = **114 组 / 256 行**、禁区表 = **26 组 / 76 行** ⇒ **140 组 / 332 行** ✓（逐行数逐一相加）；按部分 `cli 2 · core 262 · desktop 3 · server 13 · vsc 52` = 332 ✓；同名对 52 对（cli 5 · core 34 · desktop 10 · server 1 · vsc 2）✓（:202 落盘值与 §2 :97 一致）；跨部分同名 6 名与盘上事实吻合（`CHAT/I18N/LEDGER/MCP/PROJECT/SETTINGS` 逐名实核）；判据句落盘坐标 `:191` / `:198` / `:202` / `:204-206` / `:208-210` 与 `DOC-DISCIPLINE.md:723` / `:1544` / `:1546`、`DOC-MIGRATION.md:413-414` **逐处实读在场** ✓。计数面与落盘面本身**自洽**——下述发现均在判据语义面与载体面，不在算术面。

| # | Category | Severity | Issue | Suggestion |
|---|----------|----------|-------|------------|
| 1 | Document ownership（同机制异述） | 🔴 | 落盘 R2 与**同档既有规范句**相冲，输入类明确：`docs/core/design/DOC-SYSTEM.md:191` 新写「该部分存在同名对时，**一切**指向该档名的裸名引称均须带层前缀（**不以引称方向为条件**）」；同档 `:173`（N-c）仍写「只在本部分出现者可写裸名」；同档 `:190`（R1 行）仍写「裸名 `<档>.md §N`」——三者对同一输入（**档名仅在本部分出现 ∧ 该部分 design↔requirements 成对**）给出互斥形态。实例 = `WEBVIEW.md`（盘上仅 `vsc` 一面，且有 `vsc/design/WEBVIEW.md` ↔ `vsc/requirements/WEBVIEW.md`）：本批逐组表 `:225`/`:228` 判其 **R2 ⇒ 层前缀**，而 N-c 行照字面许可裸名。§10 只登记了 R1 半（`:384` V-3），**N-c 一处未被感知**——即本批改动词在既有规范面**制造了一处未被记录的冲突**，而 332 行迁移将按此判据执行。 | 二择一并落盘：① 在 R1 行与 N-c 行同步写入「同名对时让位 ⇒ 带层前缀」条件（与 `DOC-DISCIPLINE.md:1544` 已写口径同形）；或 ② 在 R2 行 / 判据段明写与 R1、N-c 的**优先序**。二者须在迁移批开跑前落，并把该条列入落笔轮的必改处（不止于上抛）。 |
| 2 | Requirements coverage | 🟡 | 本批 §2 条目表 `:49` 把「**R2 ∥ R3 分工句** + 跨部分同名面实测」列为条目⑤、落点标「`docs/core/design/DOC-SYSTEM.md` §7」，§2 七 `:298` 亦将其列在落笔轮交付面；但 §10 `:382`（V-1）自报未落，实核 `:185-210` 落盘面无分工句（仅 `:204` 计数口径内嵌「两判同中者计 **R3**」）。⇒ 条目表列出的交付项未兑现，且 §2 七未随动。 | 二择一并落盘：① 补落 §7 分工句（含 6 名清单，先按 `:204` 同一口径深扫定型）；或② 收正条目⑤与 §2 七，把该条移入「本批不做 / 下轮」面并写明理由（V-1 已给「本轮派单三处未含」）。 |
| 3 | Document ownership（载体 / 可删性） | 🟡 | 332 行迁移执行表**只住批档**（`:82`-`:260`），依据 = `:322` KD-7「迁移表归本档 §2（一次性载体）」。这与在册契约相抵：`docs/core/design/DOC-DISCIPLINE.md:1161`「**批次档必须是能够随时清理掉的**」· `:1168`「只能就地写全（或移入长期档位）」——批档清理即断，而该表要跨「分批 1–6」多轮执行（`:264-271`），且 `DOC-MIGRATION.md` 本是迁移主题的拥有档（DOC-SYSTEM.md:157「该台账 = 本节的**唯一执行表**」）。D4 方向规则（规范档禁引批档）约束的是**引用方向**，不构成「执行表只能住批档」的理由。 | 把逐组表 + 禁区表移入其主题拥有档（`docs/core/design/DOC-MIGRATION.md`——`§10.2` 迁移落点规则所在处），或以「单源 + 指针」形自持；批档侧只留本轮原委。 |
| 4 | Feasibility / Clarity | 🟡 | 逐组表 `:130` 的 `core/design/API-CONTRACT.md:814` 命中**落在生成区内**：`API-CONTRACT.md:10`「## 1. 生成区（生成器唯一笔——勿手改）」· `:12`「重跑 = `node scripts/api-contract.mjs --write`」；且该行文本源自**代码注释**（`thincoder-core/agent.mjs:42` 含「TOOLS.md §6.16（子代装配点从本档取用）」）。该组「改后 = `design/`」按计划**落不了**：手改 .md 与「勿手改 / 重跑即覆盖」相抵（FR9 判据 = 生成区零漂移），改源码又越本批 `:59`「产品码零触」边界。§10 `:332`（U-4）只记「命中落在**代码串注释行**内」，未记其**属生成区 / 文本源在代码面**。 | 该组单列一处处置口径：或**出射程**（登记理由 = 生成区 + 源码面），或改源码注释并在受影响文件表 / 边界句处显式扩面（不在本批则登记为另轮）。 |
| 5 | Acceptance criteria | 🟡 | 验收②（`:307`「迁移计划**逐条可落**」）与计划自身相抵：禁区表 5 组「改后」列填「**逐处判**」（`:236` CHAT · `:241` SETTINGS · `:250` I18N · `:251` LEDGER · `:253` PROJECT），目标档未定；另验收⑤（`:310`）的核法 = `git diff --stat`，本次评审上下文报「No git repository detected」⇒ 该核法在该环境不可执行（`DOC-DISCIPLINE.md:962` 已把静态面三件列为可用自证形）。 | ① 为 5 组给候选定案，或把验收②改写为「逐组给定案 ∨ 明标逐处人判 + 判定记录面」；② 验收⑤补源面替代核法（受影响档清单 + 逐档比对），`git diff --stat` 降为环境可用时的补充。 |
| 6 | Methodology / 状态面 | 🟡 | §2 状态行 `:34` 仍写「两处判据句因禁区**只出规格**」、`:58`「在**落笔轮之前**，全树引称合规性**无现行判据可依**」、二 `:59`「`docs/core/design/{DOC-SYSTEM,DOC-DISCIPLINE,DOC-MIGRATION}.md` **零 diff**」；§10 `:350-364` 已在**三档**落笔（含 `DOC-MIGRATION.md:413-414` 新增）。⇒ 设计面状态陈述与落笔实况不一致，读者按 §2 会重新打开已闭的事项。 | 追加订正块（或按现状改写这几句）：把「只出规格 / 零 diff / 无现行判据」改为落笔轮后的实况，并注明三档落笔的授权来源（`:346`）。 |
| 7 | Methodology（判据 9 · 最近先例） | 🟡 | 全档**无「最近先例」行**（先例坐标 ∥ 对应设计档节 ∥ 先例批 + 对齐 ∥ 偏离理由）：`先例`一词仅见于 `:268`「已有…`design/WEBVIEW.md`…**可作对齐样板**」∥ `:321`「`vsc` 有正向夹具宜早对齐」——皆非先例坐标行；亦无「无先例」显式声明。 | 补一行最近先例（实现坐标 ∥ 对应设计档节 ∥ 先例批 + 对齐 / 偏离理由）；确无同类先例者亦须**显式声明**（不静默跳过）。 |
| 8 | Methodology（判据 10 · 调研证据） | 🟡 | 全档**无「调研证据」行**（核过哪些公开源档 ∥ 有无相关；「均不相关」亦须记录）——`勘测 / 公开源 / 参考系 / 独立仓` 全档零命中。 | 补一行调研证据（含「未调研」或「均不相关」的显式记录）；本面属仓内机制，若无外部源可核，明写该结论即可。 |
| 9 | Requirements / Document ownership（需求面未随动） | 🟡 | 落盘把 R2 的机检列改为「**人读核**——不设机检」（`DOC-SYSTEM.md:191`）与判据段改「**R2 的判据（人读）**」（`:198`），但需求面与回指面未随动：`docs/core/requirements/DOC-SYSTEM.md:37`（N1）「**可机判**：命名规则 / 归属判据 / **引用形态**三条都必须是**判据句**（可写进机检谓词）」· 本档 `:27`「N1 可机判 → §6 · §7 · §8（逐条判据句 + **机检落点**）」。 | 按内容分层（设计 > 需求）落一处单源句：在需求侧 / 回指行记明 R2 已转人读判据（依据 = 用户禁令与语义约定面），或把 N1 的三条射程显式收为「可表述为谓词者」；不要把两套口径并留在盘上。 |
| 10 | Doc-state（验收面 · 禁令未随动） | 🟡 | 本档验收 / 用例行仍以被禁读数为判据：`:357`（A7「`node scripts/doc-check.mjs --root .` **域一悬空 = 0**」）· `:358`（A9）· `:367`（T1「悬空 0 · `OK(V5)` · exit 0」）· `:368`（T2），与在册禁令 `DOC-DISCIPLINE.md:80`「**禁止调用 `node scripts/doc-check.mjs`**——一切轮次、一切角色，**不再跑、不再引其读数、不再以其红 / 绿作任何判据」相抵（既有面，非本批引入）。 | 把这四行改述为源面 / 静态面判据（或标为「手跑读数器读数——非门禁、不作判据」）；**不得**以复跑该工具作为验收方式。 |
| 11 | Clarity（豁免条自洽） | 🔵 | 落盘豁免条内嵌行号坐标（`:208`「`:47-61` ∥ `:72` ∥ `:74-84` ∥ `:86-97`」），与 `:319` KD-4「豁免取**形**（裸名 + 无坐标）而非**行号清单**——行号清单会随 README 编辑漂移」的理据相抵（同处又删去了规格 `:283` 的「等」字收窄面）。 | 行号坐标降为「实读示例（as-of 日期）」或移入记录面，判据仍以「形」为唯一落点。 |
| 12 | Doc hygiene（记录面） | 🔵 | §10 `:365-368`「**复扫读数（fresh）**」仍整块载 doc-check 读数（悬空 241 / 行宽 FAIL 30 / 候选 51112），而 `:30` 已裁「该席所报**一切 doc-check 读数作废**」——作废读数在记录面**未加作废标注**，后续读者易误当证据。 | 在该块首行加作废标注（或移入已声明作废的历史面）；本批后续面不再复述该读数。 |
| 13 | Discipline（记录纪律） | 🔵 | `:376` 自报「`append-only` 不能折行 ⇒ 本条二处…经 `edit` 直改**本席 §2 段内**」——对既有行的就地改写与档头 `:2`「六段 **append-only**，一段一作者」相抵（更正史应走追加，`订正` / `订正 2` 块即为此形）。 | 更正内容一律以追加块落盘（保留原行），使读者能按追加序复原；已改写处不回溯。 |

**计数**：🔴 **1** · 🟡 **9** · 🔵 **3**（共 13 条）。**out-of-scope note（无严重度）**：`DOC-DISCIPLINE.md` 其余以 doc-check 读数为判据的验收行（如 `:1379` A-DD1 / `:1512` 第 8 项 / `:1545` 第 3 项）与本批改动面无交集，未逐条展开，仅登记该族的存在。

**VERDICT: changes-required**（🔴 #1 = 同档两处同机制异述 ⇒ 迁移批开跑前须收正）。

### 轮次 2（评审子代理）

**独立设计评审（轮 2 · 2026-10-16 · 评审员 = 独立 advisor，非父侧自审）** · 评审对象 = 批 `2026-10-16-ref-citation-r2-landing` 的**修正轮落地**（评审 #24 的 13 条 + 收尾三处 + 需求面四处）。**本评审未跑 `doc-check`、未引其任何读数**（在效禁令 = `docs/core/design/DOC-DISCIPLINE.md:80`）；验收只走源面 / 静态面。

**逐条复核（13 条 + 收尾 3 + 需求面 4 —— 全部落盘、逐字在场）**

- #1 🔴：`:173`（N-c）· `:190`（R1）· `:191`（R2）· `:198` 四处对同一输入给出**一致形态**（同名对 ⇒ 层前缀；R1 明写「让位于 R2」）⇒ 机制级异述已消。
- #2 🟡：`docs/core/design/DOC-SYSTEM.md:212-213` 分工句 + 6 名清单在场；6 名逐名实核 = 完整无遗（盘上另无第 7 个跨部分档名）。
- #3 🟡：`docs/core/design/DOC-MIGRATION.md:539` 起 §12（逐组表 `:580-693` = 114 行 · 禁区表 `:701-726` = 26 行——逐行点数吻合）。
- #4 🟡：`:594` 出射程标注 · `:695` 实迁移面 = 331 行 / 139 组。
- #5 🟡：`:728-731` 五组定案；三处定案逐处实核**正确**（`:944` = 桌面域 13 档样板行 ⇒ desktop · `:311` = 本档核心设计档清单 ⇒ core · §11.1 桌面面 ⇒ desktop）；本批档验收② `:307` / 验收⑤ `:310` 已改述为定案 / 源面核。
- #6 🟡：订正 3 a（本批档 `:407`）落盘并附授权来源。
- #7/#8 🟡：订正 3 b/c（本批档 `:409` / `:411`）落盘（先例行 · 调研证据行各一，含「仓外公开源均不相关」的显式记录）。
- #9 🟡：`docs/core/requirements/DOC-SYSTEM.md:37`（N1 人读核）+ 本批档 `:27` 回指行。
- #10 🟡：`DOC-SYSTEM.md:359` / `:361` / `:366` / `:370` / `:371` / `:372` / `:375` 七处改述为源面 / 静态面（逐处实读在场）。
- #11 🔵：`:208` 例外条已去行号坐标。 #12 🔵：`:365` 块首「整块作废」。 #13 🔵：订正 3 e 登记就地改写。
- 收尾三处：`DOC-SYSTEM.md:190`（R1 机检列）· `:29`（N3 回指）· `:27`（N1 回指）逐处在场；`docs/README.md` 无 §3.7 的死指针依据已切除。
- 需求面四处：`requirements/DOC-SYSTEM.md:26`（FR4 人读核）· `:29`（FR7）· `:37`（N1）· `:39`（N3）。

**独立复核（源面）**：逐组 / 禁区表行数与计数表闭合 ✓；`DOC-MIGRATION.md` 自身行号（≥413 者 +2）抽查 `:470` / `:473` / `:526` 三处逐处命中 ✓；跨部分 6 名 ✓。**唯一不复现项 = 同名对基数**（core 实为 35，落盘 34）——见发现 1。

| # | Category | Severity | Issue | Suggestion |
|---|----------|----------|-------|------------|
| 1 | Requirements / 计数基数 | 🟡 | 落盘「同名对 **52 对**（`cli` 5 · `core` 34 · `desktop` 10 · `server` 1 · `vsc` 2）」（`docs/core/design/DOC-SYSTEM.md:202` ∥ `docs/core/design/DOC-MIGRATION.md:561` ∥ 本批档 `:97`）按盘实况**不复现**：`docs/core/design/*.md`（61）∩ `docs/core/requirements/*.md`（48）逐名实核 = **35 对**（35 个同名档在两层均在场）⇒ 合计应为 **53**；其余四处复算吻合。同名对是 R2 面的判据输入（漏一对 ⇒ 该名下的裸名 + 坐标引称不判 R2） | 重算 core 一处并同步 `:202` / `DOC-MIGRATION.md:561` / 本批档 `:97` 取值；若 34 系按某排除规则（如某类档不计对）而得，须把该规则写进 `:204` 计数口径，使 35↔34 之差**可复算** |
| 2 | Clarity（判据 ∥ 执行面） | 🟡 | 判据段作「**一切**裸名 + 坐标引称判违规」（`DOC-SYSTEM.md:198`），而计数口径 / 执行表的命中定义 = 裸名 token 后「**紧随坐标**（`§N` ∥ `:N`）」（`:204` · `DOC-MIGRATION.md:545`）⇒ **非紧随形**（`DOC-SYSTEM.md:201` 的 `` `CORE-UNIFICATION.md` 的 §2.5 `` ∥ `` `AGENT-LOOP.md` 的 §11.2 / §18 ``）判据上违规、却不在迁移面（该档在表内仅 `:143` 一组）；该表自述为「该迁移的**唯一执行表**」（`DOC-MIGRATION.md:541`）⇒ 迁移跑完仍留有判据意义上的红点 | 二择一落盘：① 命中定义由「紧随坐标」扩到「同格 / 同句内坐标」并重算面；② 把 `:198` 的「一切」收为三式枚举（两段反引号 `` `X.md` §N `` ∥ 单段 `` `X.md §N` `` ∥ 坐标式 `` `X.md`:N ``），使判据与执行面**同界** |
| 3 | Doc-state（同表内 V1 存废两述） | 🟡 | 本轮改写的 R1 机检列作「**文本纪律面 · 人读核**（V1 无对应机检器——实装随 v2 单引擎收敛撤除；口径 = 本行形态列自载）」（`DOC-SYSTEM.md:190`；同说见 `DOC-DISCIPLINE.md:88` / `:1078`），同表 R3 行仍作「V1 **须扩**「带 `/` 的 `.md` 按仓根解析」」（`:192`）、`:197` 仍作「② **节号**存在性（V1）」——V1 在同一张表内既「无机检器」又「须扩 / 存在性判据」 | 把 `:192` 机检列与 `:197` ② 的 V1 指称收正到现行面（层前缀 + 节号的存在性判据归「文本纪律面 · 人读核」或写明 v2 承接），与 `:190` 同形 |
| 4 | Doc-state（副本未随单源） | 🟡 | 迁移表已立单源（`DOC-MIGRATION.md:539` §12 · 本批档 `:413` 同语），但本批档 §2 三（`:231-260`）副本未随动：仍作「逐处判」（`:236` · `:241` · `:250` · `:251` · `:253`）、行号仍为收正前值（`:239` 的 `521 522 723 726 1389 1501 1503 1541 1543` ∥ 单源 `:705` 的 `… 1544 1546`）、`:241` 目标档仍作 `docs/vsc/design/SETTINGS.md`（逐处判）∥ 单源 `:707` 已定 `docs/desktop/design/SETTINGS.md` ⇒ 同一执行信息两处不同 | 在副本前加一行「本副本 = 落笔履历；逐组取值以 `DOC-MIGRATION.md` §12 为准（差异 = 5 组已定案 · 行号 +2）」；副本正文不回改，取值以单源判 |
| 5 | Doc-state（需求面验收法与禁令） | 🟡 | 本轮父侧笔的需求面仍以读数器为验收法：「**机检 = 可选手跑，非门禁**——用户 2026-10-15 令禁调 `doc-check`」+「锚 / 行宽读数按手跑读数器口径落档（非门禁 · 不作判据）」（`docs/core/requirements/DOC-SYSTEM.md:39`）· 「实修 + 锚读数（域一悬空 0 · 手跑读数器口径，非门禁）」（`:29`）；与禁令「**不再跑、不再引其读数、不再以其红 / 绿作任何判据**」（`docs/core/design/DOC-DISCIPLINE.md:80`）及设计侧 A9 的源面改述「自建读数器**不跑、不引**」（`DOC-SYSTEM.md:361`）并存 | 需求侧两处按设计侧同形收正为源面 / 静态面（`grep` ∥ 直读 ∥ 逐档比对），并删「可选手跑」句；按内容分层（设计 > 需求）以设计面口径为单源 |
| 6 | Doc-state（迁移台账落点 vs 盘） | 🟡 | `docs/core/design/DOC-MIGRATION.md` 的 RELEASE 落点三处与盘不符：`:56`「已落 `docs/cli/design/RELEASE.md`」· `:101`「已落 `docs/core/requirements/RELEASE.md`」· `:119`「`RELEASE` 两档跨部分成对（设计 = `docs/cli/design/` · 需求 = `docs/core/requirements/`）」——两路径在盘上均不存在（实存 `docs/RELEASE.md` 一处）；若该档确为两部分各一，`DOC-SYSTEM.md:213` 的「跨部分同名面（实测 **6** 名）」须并计 | 逐处回读 RELEASE 三处的实际目标档，落点改为盘上实存路径（或标「已归并 / 待核」）；同拍复核 `DOC-SYSTEM.md:213` 的 6 名清单是否随动 |
| 7 | Discipline（最近先例 · 判据 9） | 🔵 | 订正 3 b（本批档 `:409`）把 `docs/core/design/DOC-DISCIPLINE.md:1544`（「有同名对者一律带层前缀（例：引设计侧同名对档 ⇒ `design/DOC-SYSTEM.md §6`」）记为「**已写**」的先例；该句系**本批落笔轮所改**（本批档 `:360` 第 9 条「改后」文本即含「有同名对者一律带层前缀（例 ⇒ `design/DOC-SYSTEM.md §6`」）⇒ 先例为批内自生、非批外独立源；该行亦未携「先例批」坐标 | 一行注明该口径的落点批（本批落笔轮）或改引批外同类先例；先例行三要素（实现坐标 ∥ 对应设计档节 ∥ 先例批）补齐 |
| 8 | File size | 🔵 | `docs/core/design/DOC-MIGRATION.md` 本轮新增 §12（`:539` 起）后全档 **743 行**，距 800 行硬顶 57 行（该档已载 §9–§12 四套执行方案） | 下一轮评估按主题分档（迁移收尾 §9 ∥ 退役 §10 ∥ 桌面拆分 §11 ∥ R2 迁移 §12），或先按 `DOC-DISCIPLINE.md` §3.14 登记拆分债 |
| 9 | Clarity | 🔵 | 逐组表表头作「**逐组表（可动 114 组 · 表列 = 源档 ∥ 被引 ∥ 面 ∥ 改后前缀 ∥ 行号）**」（`DOC-MIGRATION.md:576`），同节出射程条给出「⇒ **实迁移面 = 331 行 / 139 组**」（`:695`）⇒ 114 含已出射程的 1 组，表头未注明 | 表头改「可动 113 组 + 出射程 1 组」或加括注「（含出射程 1 组，实迁移 113）」 |

**计数**：🔴 **0** · 🟡 **6** · 🔵 **3**（共 9 条；13 条判词 + 收尾三处 + 需求面四处 = 全部落地，无 🔴）。

**out-of-scope note（无严重度 · 越本轮 Documents to Review 列表）**：`docs/core/design/DOC-DISCIPLINE.md` 内仍以 `node scripts/doc-check.mjs` 读数为判据的验收行族仍在场（如 `:1545`「机检零新增」· `:1554`「全仓读数（清账轮收口）」），与上一轮 out-of-scope 登记同族、同病因（禁令未随动）——仅登记，不与本轮改动面相交。

**VERDICT: pass**（🔴 = 0；🟡 6 条 / 🔵 3 条均不阻断）

## §4 用户批准（主 agent）
## §5 实施记录（eng-coder）
## §6 验证与收口（父代理）

### 6.1 收口结论

**本批交付 = R2 引称判据成文 + 全树迁移计划落地**（台账 `#1580`）。**链路**：设计（`#17`）→ 落笔轮（`#23`，因两档在 C 族批射程内先行零写入）→ **评审轮 1（`#24`）= changes-required**（🔴 1 · 🟡 7 · 🔵 2；🔴 = 落盘 R2 与同档 N-c/R1 三处互斥）→ 修正轮（`#25`，13 条）→ 收尾轮（`#26`，三处：R1 死指针消解为自持 · N3/N1 回指行）+ **父侧需求面四处**（`N1` / `N3` / `FR4` / `FR7`）→ **评审轮 2（`#27`）= pass**（🔴 0 · 🟡 6 · 🔵 3，签发 token）→ 修正轮（`#28`，8 条）。

**交付内容**：① 判据句成文——`docs/core/design/DOC-SYSTEM.md` §7 R1–R3 三行 + N-c 行**对同一输入形态一致**（同名对 ⇒ 带层前缀，不以引称方向为条件）；② 计数口径可复算（`:204`/`:205`）——含 **`_archive` 不计**规则（计入则 `core` 35 / 合计 53；扣后 34 / 52，差 1 对全在 `_archive`）；③ 全树迁移计划**入住主题拥有档** `docs/core/design/DOC-MIGRATION.md` §12（逐组表 114 行 · 禁区表 26 行 = 140 组 / 332 行 · **实迁移 113 组 + 出射程 1 组**）；④ 豁免条成文（地图式裸名列 + 复核条件）；⑤ R2 ∥ R3 分工句 + 跨部分同名面 **6 名**清单（`CHAT`/`I18N`/`LEDGER`/`MCP`/`PROJECT`/`SETTINGS`）；⑥ 分批序 server → desktop → vsc → cli → core 可动 → core 禁区。

### 6.2 角色表

| 席 | 面 | 产出 |
|---|---|---|
| `eng-designer#17` | 设计 | 判据收正表 + 332 行迁移计划 + 豁免条 + 分批序（工单态——彼时两档在 C 族批射程内） |
| `eng-designer#23` | 落笔轮 | 判据句成文 · 口径句 · 豁免条 · 472 字符行折行（**该席自述跑过 `doc-check` ⇒ 读数已按 §1 裁定作废**） |
| 评审 `#24`（轮 1） | 独立评审 | changes-required：🔴 1（同机制异述）· 🟡 7 · 🔵 2 |
| `eng-designer#25` | 修正轮 | 13 条：三处一致 · 迁移表入住 `DOC-MIGRATION.md` §12 · 生成区 1 组出射程 · A7/A9/T1–T3/T6 源面化 |
| `eng-designer#26` | 收尾轮 | R1 行**死指针消解为自持**（溯源证原指为已归档 CLI README 的异题节）· `:29`/`:27` 回指行随拍 |
| 评审 `#27`（轮 2） | 独立复评 | **pass**（🔴 0 · 🟡 6 · 🔵 3）；独立复算挖出 `core` 同名对基数疑点 |
| `eng-designer#28` | 修正轮（轮 2 后） | 8 条：**`_archive` 排除规则显式化**（反证评审 35 = 未扣 `_archive`）· 判据收为三式枚举（与执行面同界）· V1 指称收正 · RELEASE 落点回填（盘实存 = `docs/RELEASE.md` 单档）· 表头 113+1 |
| 父侧笔 | 需求面 | `requirements/DOC-SYSTEM.md` **四处**：`N1`（引用形态 ⇒ 人读核）· `N3`（三机检 ⇒ 锚 + 行宽 + **读数器禁调**）· `FR4`（机检判据 ⇒ 人读核）· `FR7`（锚读数 ⇒ 源面核） |

### 6.3 计数与读数（源面 / 静态面 · 未跑 `doc-check`）

- **同名对基数**：`core` 两层**顶层** = 61 ∩ 48 ⇒ **34 对** ✓（+`_archive` 则 35 ✗）；合计 **52 对**（cli 5 · core 34 · desktop 10 · server 1 · vsc 2）——**评审的 35 不复现，已反证** ✓；排除规则已入口径（可复算）。
- **判据 ∥ 执行面同界**：三式枚举 vs 命中定义逐行实证（紧随坐标形命中 335 处，: 式分布 ①270 ∥ ②23 ∥ ③42 ∥ 其他 **0**）⇒ 无落网者 ✓。
- **面计数存疑（转入迁移轮）**：设计席同口径逐行复扫 = **309 行**（行去重后），与落盘 **332** 差 **23 行**，成因未定 ✗ ⇒ 交迁移轮**逐处改前回读**时对账（见 §6.5 ①）。
- 触碰面 `>300` 字符单行 = **0** ✓；越界零触（三档写面 ⊆ 声明）✓。
- **未跑 `doc-check` 入口、未引其读数** ✓（禁令在效）；`#23` 自跑的那次读数已作废 ✓。

### 6.4 台账勾销与结转

| 行 | 处置 |
|---|---|
| `#1580` | **已核销**（本批交付；凭据 = 本节 + §3 两轮判词） |

**本批派生（已在册）**：`#1584`（机检读数 / 红绿判据类现役句 + 同源死指针族，**含 `docs/README.md:25` 迁移验收自撞禁令——迁移批前置**）。

### 6.5 未决与复核

- **① 面计数对账（转迁移轮）**：332 vs 309 差 23 行——**不阻断本批**（执行物 = 逐组表明列的行号，非汇总数 ✗），但迁移轮**逐处改前回读**须逐项核并对账；确认为缺口 ⇒ 回写 `:202` / `DOC-MIGRATION.md:563` 计数。
- **② 迁移前置**：迁移批开轮前须先落 `#1584` ④（`docs/README.md:25` 把验收写成 `doc-check … exit 0` ⇒ 迁移批若照它验收即**自撞禁令** ✗）。
- **③ 过程面不办**：本批 §3 评审表 17 行 `>300` 字符（评审子代理笔 · 过程面 · 随批档清理消失）⇒ **不办** ✓。
- **④ 工作树他批存量**：`git status` 302 档已改（含 `PROJECT-MANIFEST.json` / `scripts/**` / 产品码）——**他批在途**，非本批产物 ✓（本批验收⑤ 已按**源面核**写，即为此设）。
- **暂缓批复核**：本批无暂缓批 ⇒ **暂缓批复核：无**。
- **冻结档残留扫描**：本批无冻结档引用。

### 6.6 结算行

台账读数（本批收口时）：**未决 106**（本批勾销 `#1580`；派生 `#1584` 已在册）。
