# 2026-11-09 · standards-as-directory
> 六段，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 每段只有一个作者：作者的段可 `append` 加内容、可就地改（`edit`）；非作者一概拒。
> 编制：主 agent · 2026-11-09 · 来源 = 用户 2026-11-09 18:01 口头裁定：「应该是目录！」——`docRoot.standards` 的语义应为**目录（一个层）**，不是单个文件；起因 = 评审实读标准档撞 `EISDIR`，暴露出该键在三处语义不一致：advisor 按文件 `readFileSync` ∥ `REVIEW_ROOT_KEYS` 不含它（故面判不认它、新写的 doc-graph 只能私持一份字面）∥ doc-graph 按目录层扫。。
> 台账 = #2239（core · 归批）。前情 = 无（独立批）。
## §1 讨论（主 agent）
**状态行**：已收口 2026-11-09
<§1 模板占位：本批条目 / 关键判据 / 授权口径>

## 讨论结论（2026-11-09 18:01）

- **用户裁定**：`docRoot.standards` 的值是**目录**（`docRoot` 的一个层），不是单个文件。原话：「应该是目录！」
- **起因**：评审实读标准档撞 `EISDIR`。追下去发现同一个键在三处语义不同，三处均已实读：
  - `thincoder-core/advisor/project-context.mjs` 把声明路径当**文件** `readFileSync` ⟹ 指向目录即 `EISDIR`，回落成「声明了但读不到」。
  - `thincoder-core/agent-tools/review-facts.mjs` 的 `REVIEW_ROOT_KEYS` 实读为 `["requirements","specs","design","modules","batches"]`，**不含 `standards`** ⟹ 面判不把它当文档面。
  - `thincoder-core/doc-graph.mjs` 按目录层扫 `.md`（方向对），但没有单源可依，只能私持一份字面表。
- **判定口径**：这个键只有一个语义 —— **目录层**。三个消费点向它对齐，不各留一份。
- **本批三件落地**：
  - ① 语义写进设计档键面（`docs/core/design/MANIFEST.md` §2.12 ∥ 键目录）与工具描述（`thincoder-core/tool-docs/manifest.md`）。
  - ② `REVIEW_ROOT_KEYS` 收 `standards`；`doc-graph` 改 import 它、删掉私有字面。
  - ③ `advisor` 的注入改按**目录**读（层内 `.md` 按名序），本仓 manifest 的值从文件迁到目录。
- **已同轮改**：`docs/core/requirements/ADVISOR-CONVERGENCE.md` §5.1 的注入面行已改为「标准档目录（项目根相对的目录，是 `docRoot` 的一个层；单目录 ∥ 多目录数组；层内 `.md` 按名序注入）」。
- **本仓迁移落点**（由设计定）：`METHODOLOGY.md` 今天住在 `docs/core/requirements/`，与五十份需求档同层；standards 成层后要有自己的目录，迁移与指针更新算本批交付。

## §2 批次任务与设计（eng-designer）
**状态行**：设计完成
### 2.1 本批条目（覆盖 · 三链同源：本表 = 设计档验收条 = 需求条目）

| # | 条目 | 需求依据 | 设计落点 |
|---|---|---|---|
| R1 | `docRoot.standards` 的语义 = **一个文档层（目录）**：单目录 ∥ 多目录数组 ∥ `null`＝本面无；文件值不受理（态 2 `not a directory`） | 用户 2026-11-09 18:01 裁定「应该是目录！」· `docs/core/requirements/ADVISOR-CONVERGENCE.md` §5.1「项目标准」行 · 台账 #2239 | `docs/core/design/MANIFEST.md` §2.12「接口契约」 |
| R2 | 评审注入**按层读**：层内直接子 `.md`、按文件名码点序、不下钻；三态互异（未声明 / 声明了但一份读不到 / 读到），态 2 逐因点名（目录不存在 · 不是目录 · 层内无 `.md` · 读抛） | 同上 + §5.1 验收 ③④ | 同档 §2.12「判据」「分支出处」「三态文案」「注入预算」 |
| R3 | 三个消费点向同一语义对齐：`REVIEW_ROOT_KEYS`（`thincoder-core/agent-tools/review-facts.mjs`）收 `standards`；`thincoder-core/doc-graph.mjs` 只经该常量取层键集；写面随键集 | 同上 | 同档 §2.2「键集」条 + §2.12「副作用面」 |
| R4 | 键面与工具描述同源：设计档键目录 `standards` 行与 `thincoder-core/tool-docs/manifest.md` 同句义（目录层） | 同上 | 同档 §2.10 键目录 `standards` 行 |
| R5 | 本仓落地：标准层 = `docs/core/standards/`，`METHODOLOGY.md` 住层内，声明值指向该目录，指向该档的活指针写现位置 | 批次 §1「本仓迁移落点」 | 同档 §2.12「本仓的标准层」 |

### 2.2 不在本批（边界）

- 不探测任何固定档名；不动 `DOC_ROOT_ORDER`（文档地图派生）；不动 `REVIEW_ROOT_KEYS` 之外的评审面（token 门 / 批档门 / 门序 / 冻结窗口）。
- 不做「文件 ∥ 目录」双读法（旧声明得到一句可读原因，不自动改档）；不为 `missingKeys` 加过滤分支；不加迁移脚本。

### 2.3 机制设计（单源 = 设计档，本节不重述）

- 语义、判据、三态文案、预算、副作用面、决策：`docs/core/design/MANIFEST.md` §2.12（KD-M1-62–66）。
- 关键词逐字：`dirs.length === 0 ⇒ 态 1`（硬不变量，态 2 句永不含 `undefined`）；层内成员 = 「直接子档」+ 名序 + 不下钻。

### 2.4 受影响文件

| 面 | 文件 | 改什么 |
|---|---|---|
| 产品代码 | `thincoder-core/advisor/project-context.mjs` | `injectProjectStandards` 改按层读（列目录 · 名序 · 四因 reason · 态 3 用途句与逐档定位注 · 截断指针指向被截断那份） |
| 产品代码 | `thincoder-core/agent-tools/review-facts.mjs` | `REVIEW_ROOT_KEYS` 收 `standards`（键集唯一源） |
| 产品代码 | `thincoder-core/doc-graph.mjs` | 注释三处（文件头 ∥ import 旁 ∥ 扫描面的「那五层」计数）随键集收键改正；逻辑零改 |
| 产品代码 | `thincoder-core/manifest-schema.mjs` | `standards: null` 注释随正（值 = 文档层目录；悬空 KD 号改到 KD-M1-62 ∥ 63 ∥ 66）；零行为变化 |
| 产品代码 | `thincoder-core/tool-docs/manifest.md` | 键目录 `docRoot.standards` 行改目录语义（英文同义句，三腿齐） |
| 产品代码 | `thincoder-core/tool-docs/doc_graph.md` | 扫描面那句改「声明的各层」（补列：同一键的产物侧第二读法） |
| 产品代码 | `thincoder-core/tool-docs/manifest-read.md` | 键描述改目录层（补列：同上，原写 by file path） |
| 产品代码 | `PROJECT-MANIFEST.json` | 已改：`docRoot.standards` = `docs/core/standards` |
| 测试 | `test/integration/review-standards-injection.test.mjs` | 夹具标准层改目录；原因词改 `no such directory`；新增 24-4 / 24-5 两例 |
| 测试 | `test/rtm/batch-ledger.md` | 故事 24：`24-1` / `24-2` 两行改写，新增 `24-4` / `24-5` 两行；节注「三态（行序）」枚举随五号同步（RTM 增量 = 设计档 §2.12「集成测试设计」） |
| 单元测试 | `docs/batches/2026-11-09-standards-as-directory.test.mjs` | 本批单元测试档（用毕即删；覆盖 T87–T96 / AC-51–AC-59） |
| 文档面 | `docs/core/standards/METHODOLOGY.md` | 已在盘（自 `docs/core/requirements/` 迁入，内容零改） |
| 文档面 | `docs/core/design/MANIFEST.md` | 本席本轮（§2.12 重写 + §1.4 / §2.2 / §2.10 / §2.11 / §3.1 五处随正） |

**层级结论**：无档跨层（无「一个改动跨多档职责」的情形）；本轮不新增产品代码档，最大改动面 = `thincoder-core/advisor/project-context.mjs` 的一个函数体；行数读数由实施轮报（§5），设计档不预载。

### 2.5 验收对照（每条回指 R 条目；判据全文 = 设计档 §2.12）

| # | 回指 | 判据（一句话） |
|---|---|---|
| AC-51 | R2 | 四格夹具三态互异；态 2 句必含绝对路径、绝不含 `undefined`（「层内零 `.md`」格归 AC-58③，不重复入表） |
| AC-52 | R2 | 零探测负向锁：层在盘但未声明 ⇒ 态 1 句；源码面固定档名探测零命中 |
| AC-53 | R2 | 预算与截断：超帽 ⇒ `PARTIAL` + `N of M` + 被截断那份的绝对路径 |
| AC-54 | R3 | 副作用三锁：`resolveReviewRootsFor` 恰多该层；`null` ⇒ `entryDocPaths` 逐项等值；`declared` 旗不变 |
| AC-55 | R1 | 写面往返：写目录值成功 + 回读相等；非法形态拒且盘零变 |
| AC-56 | R2 | 多目录部分不可读 ⇒ 正文 + 半读句；全不可读 ⇒ 态 2（不冒半读句） |
| AC-57 | R2 | 数据档读抛（`EISDIR`）⇒ 态 2 族句含 `manifest read failed: EISDIR`，不抛、零 `undefined` |
| AC-58 | R1 / R2 | 层读取四条：名序 + 非 `.md` 不进 + 不下钻 + 层内零 `.md` ⇒ `no .md file` + 文件值 ⇒ `not a directory` |
| AC-59 | R3 | 评审根收键三面：`faceDetail` ⇒ `doc-root`；锚点图扫该层；层键集无第二份字面 |

### 2.6 关键决策（全文 = 设计档 §2.12 决策表）

- KD-M1-62 值 = 目录层；文件值 ⇒ `not a directory`（一个键一个语义）。
- KD-M1-63 层内成员 = 直接子 `.md`、码点名序、不下钻。
- KD-M1-64 `REVIEW_ROOT_KEYS` 收 `standards`（键集只在一处改）。
- KD-M1-65 态 2 的 reason 增目录侧三因（可修面不同）。
- KD-M1-66 迁移 = 搬档 + 逐处改指针；零迁移脚本、零兼容分支。

### 2.7 上抛项

- **[上抛·知会]** 需求层的活指针已由父侧同轮扫净：全仓 `grep "docs/core/requirements/METHODOLOGY.md"` 的命中只剩批档（过程档，历史）、`thincoder-cli` / `thincoder-vscode` 的 CHANGELOG 与 README（产品发行文本，不改）、以及 `test/integration/review-standards-injection.test.mjs` 的夹具常量（本批测试面，实施轮改）。设计档与需求档现无死指针。
- **[上抛·知会]** **仓外遗留一例**：工作区根的仓库指南（本仓之外、非本仓档）「Design philosophy flows」句仍指旧位置。不在本批写域，设计档 §2.12「本仓的标准层」已登记为已知遗留；送达实施轮与收口时不得当作本仓指针债。
- **[上抛·知会]** **评审发现 #7 的解**：`manifest-schema.mjs` 原引 `KD-M1-55/57`、`project-context.mjs` 原引 `KD-M1-61`，本档已无这三个号——设计侧把改号写进了 §2.12「副作用面」，由实施轮随注释同发。
- **[上抛·待裁]** 无。本批未发现需求与实现相抵，也未出现需用户裁的语义分叉。

### 2.8 修复轮（设计席 · 2026-11-09）

实施轮（§5）落地后，设计档有两处死引文与四处计数漂移未随代码走。已收在 `docs/core/design/MANIFEST.md` 与 `docs/core/design/ADVISOR-GUARDS.md`，逐项：

| # | 项 | 落点 | 改法 |
|---|---|---|---|
| 1 | 死引文两行（引的是改前代码） | 设计档 §2.12「病灶」 | 两条 `依据 …「…」` 改为围栏块「改前的盘上原文」，逐行注读数来源（`git show HEAD` ∥ 改前工作树——`doc-graph.mjs` 当时未入库，无 git 读数），另起一行写现态。`依据` 形不再跨代码引用：代码一改那行必死 |
| 2 | `docRoot` 五键 → 六键 | 同档 §2.1 第 1 条 | 改「键存在（`docRoot` 六键、`index` 子键）」 |
| 3 | 受影响文件漏两档 | 同档 §2.12「受影响文件」 | 补 `doc_graph.md` ∥ `manifest-read.md` 两行 + 一段补列理由：两份工具描述是同一键在产物里的第二读法，留着则 KD-M1-62「一个键一个语义」不成立；原清单按代码面列而漏，属清单补全 |
| 4 | `docRoot` 五键 → 六键 | `docs/core/design/ADVISOR-GUARDS.md`「收面（仓根放宽）」 | 同句改六键 |
| 5 | `read failed: unknown` 一格空隙 | 同档 §2.12「三态文案」 | 补「`<code>` 缺失时落 `unknown` 占位」：闭合的是形态（固定短语 ∥ 固定短语`: <非空码>`、句内无 `undefined`），`<code>` 按运行时开放不枚举。取设计档补句，不改代码 |
| 6 | `doc-graph.mjs` 注释「两处」 | 同档 §2.12「副作用面」∥「受影响文件」 | 改「三处」并点名第三处（扫描面「那五层」随收键改「声明的各层」） |

- 计数结论：设计档内剩余「五键」命中全为 schema 顶层五键（`version` / `phase` / `docRoot` / `codePaths` / `index`），与 `docRoot` 六子键不同层，不改。
- 两档工具描述现状实读：`doc_graph.md` 写六层含 `standards`（目录层）∥ `manifest-read.md` 写 `standards` **layer** —— 一句一个语义，与设计档同言。
- 门读数：`doc_check` gate 两档 PASS。

**补记（第 7 项，核对时发现）**：同档 §2.12「三态文案」原有一行把旧用途句写成「现行实现逐字推 `The file below …`」并要求 24-1 随改——实施后该句已不在代码里（实读 `thincoder-core/advisor/project-context.mjs` 只余 `The documents below are the project's standards …`），那行属实施前语态，已改为陈述现态：「态 3 的用途句 = 上面那两句；集成用例 24-1 逐字断言这两句」。改后两档 `doc_check` gate 复跑 PASS。

## §3 设计评审（评审子代理）
**状态行**：评审通过（第 2 轮：上轮 2🔴 全修、7🟡 六修一接受、2🔵 全修；余 1🟡（测试档列未落名）不阻批准）



### 轮次 1（评审子代理）

### 第 1 轮设计评审结论（标准层声明口：目录语义 ∥ 态 2 三因 ∥ 键集单源 ∥ 本仓迁移）

评审对象 = `docs/core/design/MANIFEST.md` §2.12 + `docs/core/requirements/ADVISOR-CONVERGENCE.md` §5.1。重点三件逐条：

- **① 目录语义同言**：成立。§2.10「键目录」`standards` 行 ∥ §2.11 `DEFAULT_MANIFEST` 行 ∥ §2.12 键行 ∥ 需求 §5.1 行四处都说「目录层」。旧「文件」形只剩两处且都已登记：`thincoder-core/manifest-schema.mjs` 的注释（§2.12「副作用面」登记随正）、`thincoder-core/advisor/project-context.mjs` 的实读文件读法（§2.12「病灶」登记）。
- **② 三态可机判区分**：成立（态 1 零路径零 `declared`；态 2 句含 `declared at` + 路径字面）。「三因穷尽」**不成立**（见 #1 · #2 · #3）。
- **③ 本仓迁移与现况一致**：盘上 `docs/core/standards/METHODOLOGY.md` 在，`PROJECT-MANIFEST.json` 的 `docRoot.standards` = `docs/core/standards`——与 §2.12「本仓的标准层」三行一致。唯工作区根指南仍指旧位置（见 #8）。

| # | 严重度 | 状态 | 证据（指针） |
|---|---|---|---|
| 1 | 🔴 | 未修 | §2.12 AC-51 格 1「层目录无可读档」映射「态 1」× 同节判据「R 空 ⇒ 态 2」/ AC-58③「层内零 `.md` ⇒ 态 2 `no .md file`」/ T94；该节硬不变量句「由 AC-51 断言」 |
| 2 | 🔴 | 未修 | §2.12「分支出处」表无 `readdirSync` 抛一臂的行（只列 `no such directory` / `not a directory` / `no .md file` / `manifest read failed` / 半读句 / 不下钻）；`readdirSync` 在现行 `thincoder-core/advisor/project-context.mjs` 的 `injectProjectStandards` 体内零出现 ⇒ 新分支 |
| 3 | 🟡 | 未修 | §2.12 判据块给 `readdirSync 抛` 一臂、`!statSync(dir).isDirectory()` 一臂，无 `statSync` 抛的臂；而 reason 取值域写死为封闭五值 |
| 4 | 🟡 | 未修 | §2.12 无「受影响文件 + 档位结论行」（对照 §2.11 验收表有「测试档」列）；实测：`project-context.mjs` 332 行 · `review-facts.mjs` 131 行 · `manifest-schema.mjs` 181 行 · `test/integration/review-standards-injection.test.mjs` 219 行 ⇒ 无一跨档，结论行仍缺 |
| 5 | 🟡 | 未修 | §2.12 AC-51–AC-59 只给「核法」，未点名改动面单元测试档（实施轮无 `node --test <file>` 目标） |
| 6 | 🟡 | 未修 | 态 3 用途句换句未登记：现行 `project-context.mjs` 推「The file below is the project's standards document.」且集成用例 24-1 逐字断言它；§2.12 态 3 改为「The documents below are the project's standards」，「句身不变」只对态 1 / 态 2 / 半读句声明 |
| 7 | 🟡 | 未修 | `thincoder-core/manifest-schema.mjs` 注释引「MANIFEST.md §2.12 · KD-M1-55/57」、`project-context.mjs` 引「零静默——KD-M1-61」；§2.12 关键决策现只余 KD-M1-62…66（55–61 全档零命中） |
| 8 | 🟡 | 未修 | §2.12「本仓的标准层」句「指向该档的活指针一律写现位置 `docs/core/standards/METHODOLOGY.md`——旧路径已不在盘」× 工作区根指南（仓外）的「Design philosophy flows」句仍把标准档写成 `requirements` 层下的 METHODOLOGY.md |
| 9 | 🟡 | 未修 | §2.12「最近先例（逐项）」五项皆实现坐标（`existing:` 形）+ 一处偏离理由，缺档内节坐标与先例批坐标（对照 §2.11「先例」行三段） |
| 10 | 🔵 | 未修 | `test/rtm/batch-ledger.md` 故事 24 节注「三态（行序）= 24-1 正常 · 24-2 错误 · 24-3 边界」；§2.12 集成增量加 24-4 / 24-5 后该枚举未同步（D3） |
| 11 | 🔵 | 未修 | 三因字面 `no such directory` / `not a directory` / `no .md file` 无逐名三问行；「最近先例」只覆盖键位 / 解析 / 注入形 / 取值源 |

计数：🔴 2 · 🟡 7 · 🔵 2（合计 11）。

通过项（已核）：集成测试设计段在位且从 `test/RTM.md` 读起（故事 24 属册 = `batch-ledger`；破 24-1 / 24-2，冗余无，缺 24-4 / 24-5）✅；勘察证据行在位 ✅；需求侧行已收正（需求 §5.1 写「目录」、默认 `null`、验收 ③④ 可机判）✅；分支出处表除 #2 外每行都有实读句或复现路径 ✅。

VERDICT: changes-required

### 轮次 2（评审子代理）

### 轮次 2 复核（上轮 2🔴 + 7🟡 + 2🔵 逐条落地核）

| # | 严重度 | 状态 | 证据 |
|---|---|---|---|
| 1 | 🔴 | 已修 | `docs/core/design/MANIFEST.md` §2.12 的 AC-51 已改「四格夹具（项目无 manifest / 声明目录不存在 / 声明且可读 / 多目录部分不可读）」，并把空层格显式移交「归 AC-58③，本表不重复」——与判据「R 空 ⇒ 态 2」及 AC-58③ 不再冲突 |
| 2 | 🔴 | 已修 | 「分支出处」表新增行目「态 2：目录在、列不出来」，写明 `readdirSync` 在本函数体内零出现故为新分支 + `icacls` / `chmod 000` 复现命令 |
| 3 | 🟡 | 已修 | 判据块新增独立臂「statSync 抛 ⇒ 不可读 { path: dir, reason: "read failed: <code>" }」，与 `readdirSync 抛` 臂并列，五值域不再有洞 |
| 4 | 🟡 | 已修 | 新增两段：「受影响文件（本批无档跨层 ⇒ 无拆分计划）」+「档位结论：产品代码 / 测试档无一越 800 硬线」；`doc-graph.mjs` 自测读至末行 = 582 行，与结论的「已越 500 软线、只改注释零逻辑 ⇒ 不触发拆分」自洽 |
| 5 | 🟡 | 未修 | AC 表「测试档」列已加但其值为「本批单元测试档」（AC-51）∥「同 AC-51」，不落任何档名；「受影响文件」段只有「测试 · test/integration/review-standards-injection.test.mjs ∥ test/rtm/batch-ledger.md（故事 24）」——六条 AC 都要跑的单元测试档在两处都不见落点 |
| 6 | 🟡 | 已修 | 新增「态 3 的用途句 = 换句（登记项，不在「句身不变」之列）」段，逐字引出旧句并写明「集成用例 24-1 逐字断言旧句 ⇒ 该断言随本批同轮改（不改则 24-1 必红）」 |
| 7 | 🟡 | 已修 | 副作用面把 `manifest-schema.mjs` 注释的悬空 KD 号改到 KD-M1-62 ∥ 63 ∥ 66，把 `project-context.mjs` 旁注的 KD-M1-61 改指 KD-M1-65 |
| 8 | 🟡 | 已接受 | 声明收为「本仓内」并单列「已知遗留（仓外，不在本批写域）」段登记仓外指南的旧指向——有理由的非修，本轮关闭 |
| 9 | 🟡 | 已修 | 「最近先例（三面：① 实现坐标 ∥ ② 档内节 ∥ ③ 迁移语义——与 §2.11 的先例行同形）」补齐三面，另设「先例批坐标不入本档」说明 |
| 10 | 🔵 | 已修 | 「节注同步」段：五个号（24-4 正常 · 24-5 错误），明写 D3 计数与枚举一起改 |
| 11 | 🔵 | 已修 | 新增「三因字面 · 逐名三问」表（字面 ∥ ① 现在住哪 ∥ ② 逐字叫法 ∥ ③ 谁消费），并写明旧字面 `no such file` 由 `no such directory` 替换可核 |
| 12 | 🔵 | 新 | 判据块写「由 AC-51 的「声明目录不存在」格与 AC-58③（层内零 `.md`）两行断言」，但 AC-58③ 原文只断「态 2 `no .md file`」，未断句内路径字面 ⇒ 空层格缺一条路径断言（建议 AC-58③ 补「句含该目录绝对路径」半句） |

**本轮五件**：① AC-51 四格与 AC-58③ 分工已同句，无剩余格冲突；② 「防御支、不配验收格」与 `validateManifest` 拒非法形态 ⇒ 实读只经 `std == null` 落态 1 的链条自洽，上一版「硬不变量」表述已撤；③ `statSync` ∥ `readdirSync` 两臂并排，`reason` 五值封闭域与判据逐臂对应，穷尽；④ 态 3 换句已登记、24-1 断言随改写清；⑤ 档位结论成立（实测 `doc-graph.mjs` 582 行，本批仅注释）。

计数：🔴 0 未决 · 🟡 1 未修（不阻批准）· 🔵 1 新提。

VERDICT: pass

## §4 用户批准（主 agent）

## 用户批准（2026-11-09）

- **裁定本身即需求**：用户 2026-11-09 18:01 原话「**应该是目录！**」——`docRoot.standards` 的值是目录（`docRoot` 的一个层），不是单个文件。本批全部交付绕这一句展开。
- **批级授权**：用户 2026-11-09 17:13「都自动跑完吧」——覆盖本批的评审发起、修正轮与实施。
- **设计已过评审**：第 2 轮 `VERDICT: pass`（designId `0a12d57e-cd0d-4ea4-afd0-d07d50227847`），token 已签发并用于实施。
- **实施后设计又有两轮修正**（都由评审发现驱动、由父侧裁定）：四处计数口径随「`docRoot` 六键」收正、两条改前引文改为围栏块内的历史读数、两份工具描述补进受影响面。**没有一处是扩大范围**。

## §5 实施记录（eng-coder）
**状态行**：实施完成



### 实施概况（2026-11-09 · eng-coder）

语义单源 = `docs/core/design/MANIFEST.md` §2.12。依据 `docs/core/design/MANIFEST.md`「这个键只有一个语义 = 一个文档层（目录）」——本席按目录层落，不留第二读法。

**改动面**（8 档声明域 + 2 档越界，越界理由见 D-2）

- 产品代码 · `thincoder-core/advisor/project-context.mjs`：`injectProjectStandards` 改按**层**读。逐目录四臂（不存在 / stat 抛 / 不是目录 / 列不出来），再取直接子 `.md` 按码点名序，逐档读成 R、读败 U。
  态 3 用途句换句，每档一行 `<!-- standards file: <绝对路径> -->` 定位注；一个层共用一次注入的预算，截断指针指向被截断的那一份。
- 产品代码 · `thincoder-core/agent-tools/review-facts.mjs`：`REVIEW_ROOT_KEYS` 收 `standards`（六层），注释写明键集单源与消费三面。
- 产品代码 · `thincoder-core/doc-graph.mjs`：注释三处（设计列两处，第三处见 D-1），逻辑零改。
- 产品代码 · `thincoder-core/manifest-schema.mjs`：`standards: null` 注释随正（目录层 / 层内成员 / 文件值不受理），悬空 KD 号改 KD-M1-62 ∥ 63 ∥ 66；零行为变化。
- 产品代码 · `thincoder-core/tool-docs/manifest.md`：键目录 `docRoot.standards` 行改目录语义（值形 ∥ 何时改 ∥ 写错后果三腿齐）。
- 测试 · `test/integration/review-standards-injection.test.mjs`：夹具改目录层，24-1 / 24-2 改写，24-4 / 24-5 新增。
- 测试 · `test/rtm/batch-ledger.md`：故事 24 两行改写 + 两行新增，节注枚举随五号同步（D3）。
- 单元测试 · `docs/batches/2026-11-09-standards-as-directory.test.mjs`：17 例覆盖 T87–T96 / AC-51–AC-59（用毕即删）。
- 越界两档（见 D-2）：`thincoder-core/tool-docs/doc_graph.md` · `thincoder-core/tool-docs/manifest-read.md`。

### 验收对照（回指 §2.5）

| # | 状态 | 交付要点 |
|---|---|---|
| AC-51 | ✅ | 四格两两互异；态 2 句含绝对路径、零 `undefined` |
| AC-52 | ✅ | 层在盘未声明 ⇒ 态 1；standards 段源码面固定档名零命中 |
| AC-53 | ✅ | 超帽 ⇒ `PARTIAL` + `N of M` + 被截断那份绝对路径（专测「不误指前一份」）；≤ 帽逐字节全等 |
| AC-54 | ✅ | 评审根恰多该层（逐项数组）；`null` ⇒ 索引范围与缺键逐项等值；`declared` 旗不变 |
| AC-55 | ✅ | 写目录值落盘 + 回读相等；`""` / `[]` 拒且 sha256 零变 |
| AC-56 | ✅ | 部分不可读 ⇒ 正文 + 半读句点名；全不可读 ⇒ 态 2、不冒半读句 |
| AC-57 | ✅ | 数据档造成目录 ⇒ `manifest read failed: EISDIR`，不抛、零 `undefined` |
| AC-58 | ✅ | 名序 ∥ 非 `.md` 不进 ∥ 不下钻 ∥ 空层 `no .md file` ∥ 文件值 `not a directory` |
| AC-59 | ✅ | 层内档 `faceDetail` ⇒ `pass` / `doc-root`；图扫该层（回执档数 +1）；两档无私持层键集字面 |

R1–R5 逐条落地，无一条降级为简化。

### 偏差与决策披露

| # | 项 | 内容 | 处置 |
|---|---|---|---|
| D-1 | 设计只列 `doc-graph.mjs` 注释两处 | 实改三处。第三处 = 扫描面注释「`REVIEW_ROOT_KEYS` 那五层」的计数随收键失真（D3：计数与枚举同改），改「声明的各层」 | 已改，记此 |
| D-2 | 越出声明写域两档 | 两处都是产物里活着的同一键第二读法：`doc_graph.md` 写「本版扫描面不含该层」被本批收键证伪；`manifest-read.md` 写「by file path」与目录语义正面冲突 | 已改（码评第 1 轮两项 🔴 指认） |
| D-3 | 逐档筛选按名、不按 dirent 类型 | 审计第 1 轮指出多一道 `isFile()` 门会把「名字是 `.md` 却读不了」漏成「层内零 `.md`」，作者被指错修法方向 | 已改按名筛；新增一例（层内目录同名 `broken.md` ⇒ 逐档 `read failed: EISDIR`） |
| D-4 | 集成用例取段法 | 原「下一个 `## `」会被标准档自带的二级标题骗断，断言随正文内容红/绿 | 改取装配序恒定段头；24-4 夹具的 `b.md` 加 `## 附则` 作负向锁 |
| D-5 | 设计 §2.12「受影响文件」未列 D-2 两档 | 这是设计清单的漏项，不是本席擅自扩面 | 留父侧转设计席（见下节） |

### 内部审计与码评轮次

- 审计（explore · 只读）：1 轮 ⇒ 1 项 should-fix（D-3）+ 2 项 note。note 之一（注释里 §2.10 指针不解析）已就地改指 §2.5；note 之二（受影响文件描述与交付面不符）记入 D-1 / D-5。
- 码评（advisor · code）：第 1 轮 changes-required（2🔴 + 1🟡 + 5🔵）⇒ 修复 ⇒ 第 2 轮 pass。
  第 2 轮明细：2🔴 全修；2🔵 修（用例文件头的「三例」、取段法）；1🟡 以已裁理由接受（`doc-graph.mjs` 580 行——§2.12「档位结论」已登记既有体量、本批只改注释）；2🔵 未修（非阻塞）；1🔵 新增登记（设计 §2.12 受影响文件漏列）。
- 终态：clean。

### 验证读数

```text
node --test docs/batches/2026-11-09-standards-as-directory.test.mjs   → tests 17 / pass 17 / fail 0
node --test test/integration/review-standards-injection.test.mjs     → tests 5  / pass 5  / fail 0
node --test test/integration/doc-anchor-graph.test.mjs               → tests 3  / pass 3  / fail 0
五档合跑（doc-anchor-graph ∥ doc-write-gate ∥ review-doc-scope
        ∥ path-resolution ∥ manifest-workspace-init）                → tests 16 / pass 16 / fail 0
五档单跑（advisor-record-gate ∥ cross-repo-refs ∥ batch-live-batch-lock
        ∥ doc-check-exclude-paths ∥ doc-check-recognition）          → 3 ∥ 4 ∥ 16 ∥ 1 ∥ 1 全绿
```

取段法失败侧读数：同一段「层内标准档自带 `## 附则`」的消息体，旧取段法把「条款乙」切断，新取段法保留——旧法下 24-4 必红。

键集失败侧读数：`git show HEAD:thincoder-core/agent-tools/review-facts.mjs` 仍为五键（不含 `standards`）⇒ AC-54① 与 AC-59 的键集断言在本批之前必红。

### 留给父侧（不在本席写域）

- **`docs/core/design/MANIFEST.md` §2.1 第 1 条**：仍写「键存在（`docRoot` 五键、`index` 子键）」——现为六子键。
- **同档 §2.12「受影响文件」**：未列 D-2 两档。
- **同档 AC-51–AC-59「测试档」列**：不落档名（设计评审第 2 轮 #5 遗留）。
- **`docs/core/design/ADVISOR-GUARDS.md` §「收面」**：写「`docRoot` 五键不再充当评审受理边界」——计数失真。
- **`docs/core/design/DOC-GRAPH.md` 勘察证据行**：写「`docRoot` 五类根齐备（requirements ∥ specs ∥ design ∥ modules ∥ batches）」——本仓现声明六类。
- **残留 🔵（非阻塞）**：`project-context.mjs` 三处抛错臂在 `e.code` 缺失时吐出 `read failed: unknown`，与 §2.12「五值 reason 域」措辞有一格空隙；设计档补一句占位说明或代码换稳定替代码，二选一。
- **仓外遗留一例**：工作区根仓库指南「Design philosophy flows」句仍指旧位置（不在本批写域）。

**补记（码评第 2 轮之后）**：`manifest-read.md` 的目录语义写成单段时被批档机检门判「文字太长，难于阅读」⇒ 同轮重排为三段（语义逐字不变：目录层 ∥ 直接子 `.md` 按名序 ∥ 文件值不受理）。

重排后实读工具描述仍含 `standards **layer**`；文档体检门与批档门复跑 PASS，单元档与集成档复跑全绿。

## §6 验证与收口（父代理）

## 验证与收口（父侧）

### 验收读数

- 实施席交付读数（本批单测档，收口时已删）：`tests 17 · pass 17 · fail 0`。
- 集成面：`test/integration/review-standards-injection.test.mjs` ⇒ `tests 5 · pass 5 · fail 0`；`test/integration/doc-anchor-graph.test.mjs` ⇒ `tests 3 · pass 3 · fail 0`；五档合跑 ⇒ `tests 16 · pass 16 · fail 0`。
- `doc_check(mode:"gate")` 四档（`docs/core/design/MANIFEST.md` ∥ `docs/core/design/ADVISOR-GUARDS.md` ∥ 需求档 ∥ 本批档）⇒ `DOC-CHECK GATE: PASS`，0 段命中。

### 落地核对

- **一个键一个语义**：`docRoot.standards` = 目录层，四处在档同言（设计 §2.10 键目录 ∥ §2.12 ∥ `thincoder-core/tool-docs/manifest.md` ∥ `thincoder-core/tool-docs/manifest-read.md`）；文件值不受理（态 2 `not a directory`）。
- **键集单源**：`REVIEW_ROOT_KEYS` 收 `standards`（六层），`write-face` ∥ 评审候选扫描 ∥ `doc-graph` 三面同源，**无第二份字面**——这一笔同时闭合了锚点图那批的偏差「文档面暂时少一层」。
- **三态可机判区分**：态 1（零路径字面）∥ 态 2（点名路径 + 原因，五值域 + `<code>` 缺失落 `unknown` 占位）∥ 态 3（正文 + 每档定位注）。
- **本仓迁移**：`docs/core/standards/METHODOLOGY.md` 在盘 ∥ 声明值指向该目录 ∥ 仓内活指针零旧路径（批档与产品发行文本按边界不改）。

### 集成测试面

- 本批新增 `24-4` ∥ `24-5`，改写 `24-1` ∥ `24-2`，节注同步为五个号；改动落在 `test/rtm/batch-ledger.md` 与 `test/integration/review-standards-injection.test.mjs`。
- 集成集现状读数已在跨仓那批 §6 记过（157 行 / 6 分册，超窗为既有体量），台账行 `#2241` 承接。

### 台账

- 本批行 `#2239` 走完 `在途 → 待核销 → 已核销`。

### 收口扫描

- **延后批复核**：无。
- **文档检查门**：`PASS`（上面第 3 条）。
- **仓外遗留**：工作区根指南仍把标准档指向 `requirements` 层旧位置——设计档 §2.12 已登记为「已知遗留（仓外，不在本批写域）」，本批不改仓外档。
- **残留未决**：无本批范围内的未决项。
