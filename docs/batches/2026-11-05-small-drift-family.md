# 2026-11-05 · small-drift-family
> 六段，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 每段只有一个作者：作者的段可 `append` 加内容、可就地改（`edit`，§4.19）；非作者一概拒。
> 编制：主 agent · 2026-11-05 · 来源 = 用户 2026-11-05 05:05「都开吧」——授权把并出的族行逐族开批。本族 = 文档/注释面小形漂移族 `#2062`（12 行并入）。。
> 台账 = #2062（core · 归批）。前情 = 无（独立批）。
## §1 讨论（主 agent）
**状态行**：🔄 进行中（…）
<§1 模板占位：本批条目 / 关键判据 / 授权口径>

## 已定决定

- **已定决定**：一次清扫轮逐档收，**不按 12 件事做 12 次开工**；读到旧坐标换符号名（不补新行号），读到过期计数按当刻机器量改写并写量法，读到与盘相反的措辞改写而不加注解。 · 用户原话：「都开吧。」 · 时间：2026-11-05 05:05

**覆盖账 = #2062**（并入的原行：`#1938` ∥ `#1939` ∥ `#1945` ∥ `#1946` ∥ `#1948` ∥ `#1949` ∥ `#1952` ∥ `#1956` ∥ `#1958` ∥ `#1979` ∥ `#1982` ∥ `#1991`，均已废弃）

## 十二处，逐条判据（每条都保留在原行，这里只给归口）

| 处 | 对象 | 修法方向 |
|---|---|---|
| 1 | 需求档 5–7 处「三包全绿」类断言今日不可达（核 ∥ cli runner 无条件 exit 1） | 改成可达读数：核语法门 ∥ 仓根 `node test/run.mjs` ∥ VSC 单元清单面 |
| 2 | 10 处设计档把「包级 `npm test`」写成集成入口/全绿（`docs/core/design/TESTING.md` 另有 4 行同族） | **先判这句说哪个面**，别按字串替换；`ARCHITECTURE.md` 与 `TESTING.md` 里说对了的那几处不许动 |
| 3 | 五面落地后设计档停在设计时值（行数 / 坐标 / 时态句 / 生成区缺两导出 / §2.2 漏列 RTM） | ①②④ 设计席笔；③ **零笔**（对象退役，见下「处 3③ 的裁定」）；⑤ 不动 |
| 4 | `docs/core/design/MANIFEST.md` §2.12 四处（五子键 ∥ 缺 manifest-read 行 ∥ N2 截断漏点名 ∥ N3 读抛句面说反） | ①② 计数与补行；③④ 的根因分别是「只注入截断点前」与「`path` 传参错」，**别只改字面** |
| 5 | `docs/core/design/LEDGER.md` P4 行三枚坐标全错，而同档另一处是对的 | 以对的那套为准 + 顺手查同档别的「整行搬迁后没跟」 |
| 6 | `thincoder-core/ledger-cmd.mjs` 注释一物四名 | 以工具描述面那一形为唯一形 + 同套词表复扫 `*.mjs` |
| 7 | `docs/desktop/design/E2E-TESTING.md` §9.1 口径注指向已退场的 `checkConfig.lineCounts` | 先定替代锚（或用 `files.mjs` 清单对照）再改列 |
| 8 | `thincoder-core/config.mjs` 两处注释指已删的 §6.16.9 + 裸名不合 D4 | 改指现行节或删指针；档名写全路径 |
| 9 | `docs/core/design/MEMORY.md` D-MEM16 消费坐标过期 + 档名已改（`code-sync` → `code-search`） | 按符号名改指，不补新行号 |
| 10 | `thincoder-core/agent/setup.mjs` ∥ `offload.mjs` 删行后全仓行号漂位 | 换符号名，**不做偏移重算** |
| 11 | `docs/core/design/ADVISOR-GUARDS.md` §1.1 ∥ A-AG23 的 as-of 行号被顶偏 | 同上 |
| 12 | 提示词 D4 条尾句对代码路径不成立、且与相邻行重复 | 删或改写成它真正管的形（`.md` 指针） |

## 这条族的判据（比 12 处本身重要）

十二处**全是小形**——坐标、计数、措辞。它们不是「不算问题」，而是**每次评审都会抓到、每次都被判成『登记一下』的那一类**。攒着就是让下一批再撞一遍。

**所以本批的验收不是「12 处都改了」**，而是：**改完再扫一遍同类形，没有新的命中**（否则说明只修了列举出来的，没修生成这类问题的源头）。

## 边界

- 不改机制、不改判据、不加新判据。
- 每处改完**回读**（D6）。
- 本批 **零笔**：原对象（`API-CONTRACT` 生成区）已随轻通道退役不在盘，生成器也不存在 ⇒ 「重跑生成器、不手改」这条禁令的前提不成立，连同禁令一并写掉（理由见下「处 3③ 的裁定」）。

## 设计席要产出

§2 里给一张**逐处动作表**（处 / 档 / 动作 / 期望 / 为什么），并按「能否机判」分两栏——能机判的给出扫描式，不能的写明判读点。

## 评审轮 1 的裁定（父侧 · 2026-11-05 05:17）

结论 `changes-required`（🔴 2 · 🟡 10 · 🔵 2）。**14 条全收。**

**两条 🔴 的性质不同，先说清**：

| # | 它是什么 | 为什么要改 |
|---|---|---|
| 1 · 缺集成测试设计节 | **形态缺件**：设计根本没读 `test/RTM.md`，「本批无机检件」那句是散文不是 delta | 判据是「有节 + 在节里说 `none` 并给理由」，不是「在别处提了一句」 |
| 2 · 处 4① 把真记录改成假话 | **处方本身错**：`docs/core/design/MANIFEST.md` §2.12 那句 `none found … 五子键` 是**搜索当时的域**，而第六个子键**正是 `standards`**——把「五」改成「六」，句子就成了「在同含 `standards` 的六个子键里没找到 `standards`」 | **这正是本族要治的病**：一处真话被改成一句看起来对齐的假话，而设计的扫描式**抓不到**它（扫描只数数字，判不出句子在说谎） |

**第 2 条是这一轮最有价值的发现**，因为它说明：**「两处数字不一致」不等于「旧的那个错」**——有时旧的那个记的是**当时的事实**，改它等于抹掉证据。这条判断要写进 §2 的判据面，不止改这一处。

### 其余 12 条的处置

- **#3 最近先例行** ∥ **#4 勘察证据行**：补两行（形照 `docs/core/design/TESTING.md` §13.1 与 `docs/core/design/MANIFEST.md` §2.12）。
- **#5 档位结论**：四档代码文件补行数档位结论（数字不落设计档，只落结论）。
- **#6 B 栏形态 + 处 1 ∥ 8 ∥ 10 无扫描式**：B 栏补 `档 / 动作 / 期望态`；三处各给扫描式或判读点——**否则族判据「零新增命中」对这 12 处里的 3 处不可复跑**。
- **#7 保护名单漏测试档**：把 `docs/core/design/TESTING.md` 的正确行加回保护名单，并点名它那四行同族命中——**面单源被字符串替换误伤是这一批最贵的错**。
- **#8「六份」与表 8 档不符**：按表为准，删掉那个数字。
- **#9 处 7 的替代锚**：接到 `docs/desktop/design/E2E-TESTING.md` §8-9 的既有权威（「行数面值单源 = 各域文件账」），别造第二个说法。
- **#10 处 3① 与 `docs/core/design/TESTING.md` §1.3 相抵**：那节明写「会变的读数不写进状态档」+「会变 ⇒ 不进文档，进命令」。**要么删读数只留命令，要么明写为什么留**——留了就得每批重量一次，那正是这一族要停的漂移。
- **#11 生成器未点名**：给命令与文件路径，否则验收（「重跑后该区 diff 为空」）跑不出来。
- **#12 处 9 的可读事实被上抛**：读两档导出面即可判，读完记读数，不要请评审给判。
- **#13 ∥ #14**：B 栏「3 ⑤」点名；「登记在案」给落点或删。

**边界**：只落 14 条；不动十二处的对象本身与已通过的判据方向。

## 处 3③ 的裁定：对象消失，本处零笔（父侧 · 2026-11-05 05:23）

设计席实查：该档（原 API 契约档，`docs/core/design/` 下）**不在盘**（`read` 报 ENOENT），仓内也**无生成器**（两条 `glob` 零命中、`scripts/` 清单无该脚本）。

**裁定 = 认可「对象消失、本处零笔」，且这不是丢档。**

**它有来源**：用户 2026-11-04 03:17 原话「这两个当然是专门删除的，轻通道退役了啊！」——契约档与轻通道档同批**有意删除**，随轻通道退役。

**所以**：

- **不要去找「改名/搬走的新坐标」**——没有新坐标，它就是退了。
- 设计席的写法保留：把「生成区不手改」这条禁令**连同它的前提一起写掉**——**没有对象的禁令留着，下一个人会去找那个对象**。
- 派生出来的「两个导出（`lastRoundBlock` ∥ `VERDICT_PASS_LINE`）没有登记面了」**不另立账**：登记面随该档退役，这两个是裁定面内部助手符号，要不要另设登记面是另一个问题。

**父侧自注**：本节初稿把那两个已删档写成了仓根路径，被写门判 `档缺` 拒了一次——**门是对的**：写一个不在盘的档名，就是造一枚悬空指针。改成本节这种「说它是什么、说它退了」的写法。

### 这条给台账的一句话

**对象消失有两种**：① 从来没做过（`#2057` 的四例）；② **被有意删掉了**（本条）。**只读台账分不出这两种**——接笔第一动作永远是复跑那一次观察。

## 评审轮 2 的裁定（父侧 · 2026-11-05 05:28）

结论 `changes-required`（🔴 1 · 🟡 4）。**只 1 条 🔴，且它是「上一轮修的地方没修透」，不是新开的面。**

| # | 裁定 |
|---|---|
| 1 🔴 | **改。**处 4③④ 的改法把 `thincoder-core/advisor/project-context.mjs` 写进了工作内容，而「受影响文件」表里没有这一档、档位结论只数了四档、验收又说「只落在措辞/坐标/计数三类」——**表与实际工作面不一致**。二选一：要么把该档加进受影响文件表并补档位读数，要么把这条缩到「只改文档措辞、不动产品码」。**不许让三处各说各的** |
| 2 🟡 | **改。**§2 仍挂着「请裁 3③」的上抛，而 §1 05:23 已裁「对象消失、本处零笔」。把上抛段改成「已裁 · 见 §1」 |
| 3 🟡 | **父侧已改。**§1 边界与现场表第 3 行都已就地改成「零笔 + 对象退役」。§2 不用再等 |
| 4 🟡 | **改。**「说对了、不许动」表末行写「记「空集说明器（非门）」的那几处」+「本轮未逐行读」——**两个都不是落点**：一个没点名、一个是没做。要么逐行读一遍点名，要么删掉该行 |
| 5 🟡 | **判为非问题，但改法照它的建议走。**评审说「本工作区不是 git 仓」——**实测是**（`.git` 在盘、`git status` 可跑）。真因是**工作树同时带别的批的改动**，`git diff` 分不出本批动了哪几档。⇒ 两条验收行照它建议换成直读式，**但理由要写对**（写「工作树有并行改动」而不是「没有 git」） |

**父侧自省**：第 3 条与引用锁那批的第 9 条是同一件事——**§1 的旧处方我不收，它就一直在册**，而且每轮评审都会把它再挑一次。**七本批档的 §1 我今晚一并过一遍。**

**边界**：只落上表；处 4 的判据方向不动。

## §2 批次任务与设计（eng-designer）
**状态行**：设计完成 2026-11-05
<§2 模板占位：本批条目（覆盖） / 设计档落点 / 机制设计 / 受影响文件与测试覆盖 / 验收对照 / 关键决策 / 上抛项>

### 覆盖（本批条目）

本轮覆盖 = §1「十二处」全表 + §1「这条族的判据」一条。判据面单源 = 台账 `#2062`；本批不开需求档条目——小形漂移族，无新机制、无新判据（§1 边界）。

**验收不是「12 处都改了」**，是「改完再扫一遍同类形，零新增命中」。所以下面每条都带扫描式，修正轮收口按栏复跑。

### 先例行与勘察证据行

**先例行**：形照 `docs/core/design/TESTING.md` §13.1「先例对齐」与 `docs/core/design/MANIFEST.md` §2.12「最近先例（逐项）」——设计只持「动作 + 期望态 + 复跑式」，逐字终稿留给实施轮。

- 对齐点 = `docs/core/design/TESTING.md` §13.11「判据面清点（逐处处置）」的形：一处一动作、不一处一断言。先例坐标取设计档节、不取批档——批档可整档删除，引批档作先例的坐标会随它失效。
- 偏离 = 无。本族明禁的一种偏离 = 把「改写过期措辞」做成「补一句说明」：读过期的就改写，不加注解。

**勘察证据行**（本轮实读）：

- 文档面：`test/RTM.md`（全文 · 五个端节）· `docs/core/design/TESTING.md` §1.3 ∥ §10.3 ∥ §13.1 ∥ §13.9 ∥ §13.11 · `docs/core/design/MANIFEST.md` §2.11 ∥ §2.12 · `docs/desktop/design/E2E-TESTING.md` §9.1 + 「计数面口径」条。
- 代码面：`thincoder-core/manifest-schema.mjs`（`DEFAULT_MANIFEST`）· `thincoder-core/advisor/project-context.mjs`（`injectProjectStandards` 的三态、截断支与读抛支）· `thincoder-core/memory/code-search.mjs` ∥ `code-sync.mjs` 导出面 · `PROJECT-MANIFEST.json` · `scripts/` 清单 · `thincoder-core/ledger-tools.mjs` ∥ `team-ledger.mjs` 拒串面 · `ledger-db.mjs` 的 `EVIDENCE_TOO_LONG_MAX`。
- 台账面：被并入本族的十二行原文（各行的「接笔判据」逐条读过）。
- 仓外公共源：`PROJECT-MANIFEST.json` 的 `index.publicRepos` = `[]` ⇒ 无声明源，本批不依赖外部源。

### 修正轮的第一动作：先判面，再改字

十二处里有一半是「同一句话在不同面上真假不同」。逐条动作先答「这句说的是哪个面」，字面替换只在面确定之后发生。判反了就是新添一处漂移，比不改更坏。

面清单（单源 = `docs/core/design/TESTING.md` §10.3 ∥ §2.3）：

| 包 | 包级 `npm test` 今天是什么 | 可达读数 |
|---|---|---|
| 核 | 空集说明器（非门） | exit 1 + `requirement N20` 说明 |
| cli | 空集说明器（集成层已上移仓根） | exit 1 + 仓根指引 |
| vsc | 单元清单面（显式清单 + 两向自检） | exit 0 可达，但**不是集成门** |
| desktop | 单元清单面 | exit 0 可达，同上 |
| render-core | 单层 glob 收顶层档 | 假绿——临时件冒充覆盖 |

集成门只有一个入口：**仓根 `node test/run.mjs`**，收口时跑一次、父侧。

### 判据面 · 「两处数字不一致」不等于「旧的那个错」

改数字之前先问一句：这个数记的是**哪个时点的哪个域**。

- 答得出、且与原文语境相符（旧数记的是它当时的事实）⇒ **不动那个数，补时点限定**。改它等于把一条真话抹成一句看起来对齐的假话。
- 答不出 ⇒ 按当刻机器量改写，**并写量法**（哪条命令、扫哪个域、取数日期）。

**为什么立成判据面**：两种「不一致」看起来同形——一种是旧数过期，一种是两处本来在说两件不同的事。扫描式只数数字，判不出句子在说谎；判面是唯一能把它们分开的一步。

### A 栏 · 能机判（给扫描式）

| 处 | 落点档 | 动作 | 扫描式（复跑判零新增） | 期望态 | 为什么 |
|---|---|---|---|---|---|
| 2 | 设计档族（见下方已核实清单） | 逐行判面后改写：核 ∥ cli 面删「全绿 / exit 0 / 集成入口」，vsc ∥ desktop 面改称「单元清单面」，集成门一律写仓根 `node test/run.mjs` | `grep -rn "npm test" docs --include=*.md` 后逐行判面 | 核 ∥ cli 面零「包级 npm test 全绿」；两处说对了的不动 | 包级 `npm test` 在核 ∥ cli 恒 exit 1，写「全绿」是写给一条永远不会绿的读数 |
| 4 | `docs/core/design/MANIFEST.md` §2.12 ∥ `thincoder-core/advisor/project-context.mjs` | ①**不动那个数**：补时点限定（写成「搜当时」），不把五改成六；②受影响表补 `manifest` 工具 `read` 动作一行；③截断支改注入面——截断点之后整份未被注入的档也要点名（改的是该档截断句的覆盖面，见决策 6）；④读抛支不再把 manifest 档路径塞进「declared at `<path>`」那个槽，句面改指「manifest 档读失败」一因 | `grep -n "五子键" docs/core/design/MANIFEST.md`；`grep -n "manifest-read" 同档`；`grep -n "manifest read failed" thincoder-core/advisor/project-context.mjs` | §2.12 那句读起来是「搜当时的域」而非「当前键集」；§2.11 的六子键行零笔；③ 截断句点名截断点之后未注入的份数，④ 读抛句零「declared at <manifest 档>」形 | 「五」记的是搜索当时的域：第六子键 `standards` 正是那次搜出来的东西；改成「六」会让句子变成「在同含 `standards` 的六个子键里没找到 `standards`」。③④ 的根因在代码——只改文档等于把一条真话改成一句与盘相反的规矩 |
| 5 | `docs/core/design/LEDGER.md` §3.5 | P4 行整行重写：三枚行号换成守卫的符号名，删掉 `EVIDENCE_TOO_LONG_MAX` 括注 | `grep -rn "应为字符串" thincoder-core/*.mjs`；`grep -n "^- P4 = " docs/core/design/LEDGER.md` | 期望读数：`应为字符串` 命中恰两处（`thincoder-core/ledger-tools.mjs` ∥ `thincoder-core/team-ledger.mjs`），`ledger-cmd.mjs` 零命中；P4 行以符号名指，零行号 | 实测：`EVIDENCE_TOO_LONG_MAX` 定义在 `thincoder-core/ledger-db.mjs`、由 `ledger-cmd.mjs` 引进来判老化 ⇒ 该括注讲的是另一枚字段，不属 P4 的守卫视位；拒串形 `（应为字符串）` 只在两个拒因档内 |
| 7 | `docs/desktop/design/E2E-TESTING.md` §9.1 | 删「行数面机检：`checkConfig.lineCounts`」整句；替代锚 = 同档「计数面口径」条（行数面值单源 = 各域文件账 ∥ `thincoder-desktop/test/files.mjs` 显式清单 ∥ 口径 = 内容行数），不造第二个说法 | `grep -n "lineCounts" docs/desktop/design/E2E-TESTING.md`；`grep -c checkConfig PROJECT-MANIFEST.json` | §9.1 零 `lineCounts`、零「机检」声称；值行单源仍是本节表 | 实测 `PROJECT-MANIFEST.json` 五键 = version / phase / docRoot / codePaths / index，无 `checkConfig` ⇒ 指针指着一处不存在的机检 |
| 9 | `docs/core/design/MEMORY.md` D-MEM16 ∥ §5 五行表 | 消费面换符号名（`safeSliceUTF16`）；档名按本轮读数各指各面，不按字串统一。**复核 2026-11-05：D-MEM16 已在目标态**（三档档名 + 符号名，零行号）⇒ 该半零笔；「§5 五行表」那半本席未读，留实施轮判 | `grep -rn safeSliceUTF16 thincoder-core`；`ls thincoder-core/memory/code-*.mjs` | D-MEM16 的消费清单与实盘 import 面逐档相等；零行号 | 实读导出面：`memory/code-search.mjs` = 检索面（`searchOrigins` ∥ `codeSearch` ∥ `ensureCodeEmbeddings` ∥ `codeSearchTool`）；`memory/code-sync.mjs` = 同步面（`declaredRootEntries` ∥ `gitSync` ∥ `codeSync` ∥ `markIndexedCommit` ∥ `reindexFile`，另再出口检索面三名）⇒ 两档都在盘、各是真面 |
| 11 | `docs/core/design/ADVISOR-GUARDS.md` §1.1 ∥ A-AG23 | 两处行号坐标换符号名，不做偏移重算 | `grep -nE '\.mjs:[0-9]' docs/core/design/ADVISOR-GUARDS.md`，射程只取 §1.1 与 A-AG23 行 | 该两处零行号坐标 | 该两处是被删行顶偏的重灾区；偏移重算下次仍会漂，符号名不会 |
| 3 ①② | `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` §3 受影响文件（行数表）∥ 同档 §2 各节（行号坐标） | ①删行数读数、留量法命令 + 结论式（逐档档位结论照该档 §3 表既有结论，不落行数）；②落点坐标换符号名 | 量法命令 = `node` 逐档 `split("\n").length`；坐标扫描取同档 §2 ∥ §3 射程 | 同档 §2 ∥ §3 零行数读数、零行号坐标；量法命令在档 | 读数写进状态档 ⇒ 每批重量一次，正是本族要停的漂移（判据 = `docs/core/design/TESTING.md` §1.3「会变 ⇒ 不进文档，进命令」） |
| 3 ③ | 原对象 = `API-CONTRACT` 生成区 | **对象不在盘**：设计档树下无该档、`scripts/` 下无该生成器 ⇒ 「重跑生成器」不可执行，本处无笔可落 | 设计档树 `docs/core/design/` 内零 `API-CONTRACT` 档；仓内四处同名命中全是旁证——退役批档 `docs/batches/2026-11-03-api-contract-retire.md` + `.thincoder/tmp/` 三枚 `api-contract-*` 临时产物，无一是契约档本体、无一是生成器；`scripts/` 清单内无该脚本 | 零笔；两个导出（`lastRoundBlock` ∥ `VERDICT_PASS_LINE`）的登记面随该档消失，不再有登记义务 | 跑一条不存在的命令，最轻的后果是收口读数无从产生；「生成区只重跑生成器、不手改」这条禁令的前提（有个生成器会覆盖）也随之不成立 |
| 3 ④ | `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` §2.5 ∥ `docs/core/design/ADVISOR-GUARDS.md` §1.2 | 「判据 / 拒文已定，代码随本批落」收成完成态 | `grep -n "随本批落\|将落\|待落" docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md`（射程 §2.5）∥ 同式扫 `docs/core/design/ADVISOR-GUARDS.md` | 两处零将来时 | 落地后仍写将来时 ⇒ 读者按未落地办 |

**处 2 已核实的命中**（本轮实读，逐条带原文；修正轮按同一判面处置，未列出的同族行以扫描式补齐）：

| 落点 | 现文 |
|---|---|
| `docs/core/design/AGENT-LOOP-ASYNC-POOL.md` | 「`lint` / 各包 `npm test`（单入口）全绿」 |
| `docs/core/design/AGENT-LOOP-UPSTREAM.md` | 「`cd thincoder-core && npm test` + `cd thincoder-cli && npm test` **双绿**」 |
| 同上 | 「`cd thincoder-core && npm test` 全绿」／「`cd thincoder-cli && npm test` 全绿」 |
| `docs/core/design/BASH-EXECUTOR-FACE.md` | 「CLI/VSC `npm test` 全绿」 |
| `docs/core/design/SESSION-OBSERVABILITY.md` | 「`npm test`（`thincoder-cli/test/run.mjs` 收集 `test/*.test.mjs`）全绿」 |
| `docs/core/design/CORE-UNIFICATION.md` | 「CLI：`npm run lint` → `npm test`；VSC：… **全 exit 0**」 |
| `docs/core/design/DOC-DISCIPLINE.md` | 「跑整个入口：`cd thincoder-cli && npm test` ⇒ exit 0」 |
| `docs/core/design/TIMEOUT-DIGEST.md` | 「`node thincoder-core/test/run.mjs` 全绿」 |
| `docs/desktop/design/E2E-TESTING.md` | 「三包 `npm test` 各自 exit 0（父侧核销读数）」 |

**说对了、不许动的**（判面时先认这几处，别按字串替换）：

| 档 | 对在哪 |
|---|---|
| `docs/core/design/ARCHITECTURE.md` 验证层行 | 单入口 `npm test` 点名 `thincoder-vscode/test/run.mjs` + 显式清单——说的正是那个面 |
| `docs/core/design/AGENT-LOOP-UPSTREAM.md` N20 行 | 逐字写「非零退出并说明」，不读作绿 |
| `docs/core/design/TESTING.md` §2 前言 | 逐字「包级 `npm test` 不再是集成门——口径 = §10.3」 |
| `docs/core/design/TESTING.md` 记「空集说明器」实况的六处：档头注 ∥ §10.3 面表的核行 ∥ A-TS9 ∥ A-SL3 ∥ A-RC3 ∥ KD-U3 | 本轮逐处实读：六处记的都是核 ∥ cli 面的实况（exit 1 + 说明，非门）。**实读更正**：整串「空集说明器（非门）」只在 §10.3 面表核行一处出现，其余五处以「空集说明器」立名并各自记实况——故复跑式按**逐命中判面**走，不按「命中数 = 六」判：改前 19 命中（`grep -n "空集说明器" docs/core/design/TESTING.md` · 2026-11-05），其中 §12 落地段与该表自身的实现注记也在内。改处 2 时这六处一笔不动 |

**同族仍在、须同笔改的四行**（同在 `docs/core/design/TESTING.md`，属处 2 射程）：A-TS18「门 = `npm test` 单入口」∥ A-TS20「`npm test` = 集成层单层收集」∥ 「因此 `npm test` 只证明一件事：集成层的发布门」∥ KD-1「`npm test` 只留集成层」。

**这四行的判面结论 = 改，不是保护**：保护是**行级**不是档级——上面六处记实况，这四行把包级 `npm test` 写成门 ∥ 集成层的收集面，与「集成门单源 = 仓根 `node test/run.mjs`」相抵 ⇒ 逐行改写为仓根入口。复跑式 = `grep -n "npm test" docs/core/design/TESTING.md`，改后这四行零「门 = `npm test`」形。

### B 栏 · 不能机判（写明判读点）

| 处 | 档 | 动作 | 期望态 | 判读点（判错的后果） |
|---|---|---|---|---|
| 2 | 处 2 清单各档 | 逐行判面后改写 | 每行只指一个面 | 一行写着 `npm test`：它说的是包级还是仓根入口 → 判反 ⇒ 把对的改成错的，或留着错的 |
| 3 ① | `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` §3 受影响文件（行数表） | 删行数读数、留量法 | 该表零行数读数 | 删掉的是不是唯一的量法说明 → 删多了，读者再无从重量 |
| 3 ② | 同档 §2 各节 | 落点坐标换符号名 | 零行号坐标 | 该坐标指的函数是否仍在那 → 换行号不换符号名 ⇒ 下一轮再漂 |
| 3 ④ | 同档 §2.5 ∥ `docs/core/design/ADVISOR-GUARDS.md` §1.2 | 「判据 / 拒文已定，代码随本批落」收成完成态 | 两处零将来时 | 落地后仍写将来时 ⇒ 读者按未落地办 |
| 3 ⑤ | 已收口批档 `docs/batches/2026-11-01-ledger-contract-five-faces.md` §2.2 | **不动**（其 §1 状态行 = 已收口 2026-11-01，且批档可整档删除） | 零笔 | 顺手改 ⇒ 越出 §1 边界；往冻结的记录里补行，没人会读到 |
| 4 ② | `docs/core/design/MANIFEST.md` §2.12 | 受影响表补 `manifest` 工具 `read` 动作一行 | 该表覆盖到 `read` | 清单是否漏 `read` 动作 → 漏一行 ⇒ 下一轮又当新缺陷报一遍 |
| 4 ③ | 同档 §2.12 ∥ `thincoder-core/advisor/project-context.mjs` | 改注入面：截断点之后也要点名 | 截断句点名其后未注入的份数 | 只改字面 ⇒ 截断点还在，漏点名照旧 |
| 4 ④ | 同档 ∥ 同件 | 改 `path` 传参，给读抛一条独立句 | 句面说「声明在标准档」而非「在数据档」 | 说反 ⇒ 读者按反向实现；只改字面不改传参 ⇒ 下轮照旧 |
| 9 | `docs/core/design/MEMORY.md` | 见 A 栏处 9 | 见 A 栏 | 两档是两个面还是一物两名 → **本轮已读**（A 栏处 9 末栏），不再上抛 |
| 6 | `thincoder-core/ledger-cmd.mjs` 注释 | 以工具描述面那一形为唯一形 | 全仓 `*.mjs` 只剩一形 | 换成注释里的形 ⇒ 与描述面分叉 |
| 12 | `thincoder-core/prompts/discipline-engineering.md` D4 条 | 删尾句或改写成它真正管的形（`.md` 指针） | 尾句不再对代码路径下判断、不与相邻行重复 | 保留 ⇒ 同一句说两遍，且第二遍对代码不成立 |

### C 栏 · 非本席写面（上抛，本席只给目标态）

| 处 | 档 | 目标态 | 谁写 | 复跑式（扫描式 ∥ 判读点） |
|---|---|---|---|---|
| 1 | `docs/core/requirements/ENGINEERING-MODE-V2.md`（5–7 处） | 「三包全绿」类断言换成可达读数：核 = 语法门 `npm run prepublishOnly` ∥ 仓根 `node test/run.mjs` ∥ VSC 单元清单面 | 主 agent（需求档） | `grep -n "全绿" docs/core/requirements/ENGINEERING-MODE-V2.md` 后逐行判面 |
| 6 | `thincoder-core/ledger-cmd.mjs` 注释 | 见 B 栏处 6 | 主 agent 路由（产品码注释） | `grep -rn "文字太长" thincoder-core` 复扫变体，只留一形 |
| 8 | `thincoder-core/config.mjs` 两处注释 | 指现行节或删指针；档名写全路径 | 主 agent 路由（产品码注释） | `grep -n "6\.16\.9" thincoder-core/config.mjs` ⇒ 零命中；`grep -n "CONTEXT-COMPACTION" 同档` 看是否全路径 |
| 10 | `thincoder-core/agent/setup.mjs` ∥ `offload.mjs` | 行号漂位换符号名，不做偏移重算 | 主 agent 路由（产品码注释） | `grep -rnE "setup\.mjs:[0-9]" docs` ∥ `grep -rnE "offload\.mjs:[0-9]" docs` ⇒ 两条各零命中 |
| 12 | `thincoder-core/prompts/discipline-engineering.md` D4 条 | 见 B 栏处 12 | 主 agent（提示词是产品码） | `grep -n "bare directory segment" thincoder-core/prompts/discipline-engineering.md` ⇒ 零命中 |

**处 8 已核实**：`config.mjs` 两处注释指向 `docs/core/design/CONTEXT-COMPACTION.md` 的第 `6.16.9` 节，而该档只有一个 `6.16` 标题、无 `6.16.9` ⇒ 指针已死。

### 受影响文件与分层

设计档面（本席写）：

- `docs/core/design/TESTING.md` · `docs/core/design/MANIFEST.md` · `docs/core/design/LEDGER.md`
- `docs/core/design/MEMORY.md` · `docs/core/design/ADVISOR-GUARDS.md` · `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md`
- `docs/desktop/design/E2E-TESTING.md`
- 加上处 2 已核实命中清单各档（逐档见上表）。本句不计数——计数与清单分开写，必有一边过期。

产品码面（非本席写）：`thincoder-core/ledger-cmd.mjs` · `thincoder-core/config.mjs` · `thincoder-core/agent/setup.mjs` · `thincoder-core/agent/offload.mjs` · `thincoder-core/prompts/discipline-engineering.md` · `thincoder-core/advisor/project-context.mjs`（处 4③④ 的注入面，见决策 6）。

需求档面（非本席写）：`docs/core/requirements/ENGINEERING-MODE-V2.md`。

**分层结论**：零文件跨层——不新增文件、不动目录、不动清单；全部是既有档的就地改写。

**行数档位结论**（代码档面）：

- 五档产品码 = `thincoder-core/ledger-cmd.mjs` ∥ `thincoder-core/config.mjs` ∥ `thincoder-core/agent/setup.mjs` ∥ `thincoder-core/agent/offload.mjs` ∥ `thincoder-core/advisor/project-context.mjs`。
- 五档改前均在 500 主动审视线内；量法 = `node` 逐档 `split("\n").length`，2026-11-05 本席实量。
- 其中四档只改注释；`project-context.mjs` 另动两条提示句与一条传参（处 4③④）——行数不因此越线，无拆分计划。
- 读数不进设计档（判据 = `docs/core/design/TESTING.md` §1.3「会变 ⇒ 不进文档，进命令」），原文落 §5。

### 关键决策

**决策 1 · 行号一律换符号名，不做偏移重算**。理由：本批十二处的根因之一就是「删行后行号全漂」；重算偏移只能修这一次，下次删行又漂。符号名跟着定义走，删行不漂。代价：读者多一步查定义；换来的是不再复发。

**决策 2 · 处 2 按面改，不按字串改**。理由：`npm test` 这一串在五个包上有五种真假；字串替换必然误伤说对了的那两处（`docs/core/design/ARCHITECTURE.md` 验证层行 ∥ `AGENT-LOOP-UPSTREAM.md` 的 N20 行）。

**决策 3 · 「生成区不手改」这条禁令，前提在本轮不成立**。

- 禁令的前提 = 有个生成器，手改会被下一次重跑覆盖。
- 本轮实读：仓内无该生成器，设计档树下也无 `API-CONTRACT` 那份档 ⇒ 前提不成立。
- 处置：本批不据此派活；处 3 ③ 按「对象消失、零笔」处理——父侧 2026-11-05 05:23 已裁「这不是丢档」（该档随轻通道退役有意删除），登记面不另立账。

**决策 4 · 处 9 的档名按面各指，不按字串统一**。

- 依据：本轮实读两档导出面——`memory/code-search.mjs` 是检索面，`memory/code-sync.mjs` 是同步面（并再出口检索面三名）。
- 结论：两档都在盘、各是真面；按字串归一等于删掉一个真面。
- 判据：D-MEM16 的消费清单与实盘 import 面逐档相等，零行号。

**决策 5 · 落笔在 §4 批准之后由设计席执行**。理由：本批四步走完才进开发（需求 → 设计 → 开发 → 验收）；§2 是设计，改写是开发那一笔，在 §4 批准之前落盘等于让评审对象变成「已改完的盘面」。§4 已批准解冻 ⇒ 落笔轮逐处改、改完回读；逐处改前 ∥ 改后原文与各扫描式读数落 §5。处 3 的 ①②④ 判给设计席笔，归属不变。

**决策 6 · 处 4③④ 落在产品码面，本批受该面约束**。

- ③ 的根因在 `thincoder-core/advisor/project-context.mjs` 的截断句：多份声明共用一次预算，截断落在某一档时句面只点名那一档，**其后的整份既不注入也不点名**——而该面引的判据正是「任何一面都不得静默跳过」（`docs/core/design/MANIFEST.md` §2.12 分支出处表）。
- ④ 的根因在同档读抛支：`STANDARDS_UNREADABLE_NOTICE` 的 `path` 槽装的是 manifest 档路径，句面因此读成「标准档声明在 `<PROJECT-MANIFEST.json>`」。
- 只改文档就等于把一处真话换一句与盘相反的规矩 ⇒ 该档进受影响文件表、按五档报档位结论，验收线与集成节同改。
- 边界：不动三态互异判据、不动 态 1 ∥ 态 2 的句身、不加新判据；改的是截断句的覆盖面与读抛支的句子归属。

**决策 7 · 验收不用 `git diff` 做读数**。工作树同时带别的批的改动（同日另有多本批档与 `test/integration/` 在改，本批的未跟踪档与之混在一处）⇒ `git diff` 分不出本批动了哪几档。改用直读式：逐处「改前原文 ∥ 改后原文」照录入 §5；「说对的不许动」= 改后回读原文与改前逐字相等。读数不进状态档（判据 = `docs/core/design/TESTING.md` §1.3「会变 ⇒ 不进文档，进命令」）。

### 验收对照

| 判据 | 怎么判 |
|---|---|
| 本批覆盖 = §1 十二处 | A 栏九行 ∥ B 栏十一行 ∥ C 栏五行，十二处逐处有点名的落点 |
| 族判据：扫一遍零新增命中 | 复跑 A 栏与 C 栏各行的复跑式，读数与改前比——新增命中 = 0 |
| 说对的那几处不许动 | 直读式（不用 `git diff`，见决策 7）：改后逐处回读原文 = 改前原文，逐处照录入 §5——`docs/core/design/ARCHITECTURE.md` 验证层行 ∥ `docs/core/design/AGENT-LOOP-UPSTREAM.md` N20 行 ∥ `docs/core/design/TESTING.md` §2 前言 ∥ `docs/core/design/TESTING.md` 记「空集说明器（非门）」的六处（名单 = 上文该表末行） |
| 不改机制 ∥ 不改判据 ∥ 不加新判据 | 直读式（同上）：改动面 = 措辞 ∥ 坐标 ∥ 计数 ∥ 处 4③④ 的两条注入句（覆盖面与句子归属）；三态互异判据、态 1 ∥ 态 2 句身、本族各家判据行零改，逐处原文照录入 §5 |
| 每处改完回读 | 修正轮逐处读回原文，读数入 §5 |
| 处 3 ③ 的对象不在盘 | `docs/core/design/` 树内零命中；仓内四处 `*pi-contract*` 命中 = 退役批档 + `.thincoder/tmp/` 三枚临时产物（改前 4 处 · `Get-ChildItem -Recurse` · 2026-11-05），无契约档本体、无生成器 |
| 集成测试 delta 说 `none` 并给理由 | §2「集成测试设计」节：读表（含 §24 三行）+ 破 / 冗余 / 缺三个 0 + 两入口均不成立 |

### 集成测试设计（RTM delta · 三问）

读表：本轮全文实读 `test/RTM.md`：五个端节 = CLI 端 · VS Code 端 · Desktop 端 · 异常与更正 · 签署面（H2 = 端节、H3 = 业务故事）。改动面命中的故事节 = `test/RTM.md` §24「评审的方法论符合度不再恒空」，三行 = 24-1 ∥ 24-2 ∥ 24-3，用例档 `test/integration/review-standards-injection.test.mjs`。

delta：**破行 0 ∥ 冗余行 0 ∥ 缺失行 0**，新增集成用例 = **none**。

- 24-1 ∥ 24-2 ∥ 24-3 不破：三行断的是三态互异与态 2 句含声明路径 + `no such file`；本批不动三态判据与两句身，处 4④ 改的是 manifest 读抛支（自成一族），无行断言它。
- 处 4③ 改的是截断句的覆盖面——RTM 无行断言截断句 ⇒ 无行可破；也不新增行，因为用例只从两个入口长出（业务真实需要的场景 ∥ 生产真出过的问题），这一处两个入口都不成立。
- 其余十一处的改动面是文档措辞 / 坐标 / 计数：没有一句被断言的对象变了。
- 判据 = `docs/core/design/TESTING.md` §11.15（设计轮的起点 = delta 三问）∥ §13.9（同形节的形态）。

**测试面**：十一处措辞类零断言（改措辞却断言「措辞在位」正是测试纪律禁的那类）；处 4③④ 各一条可跑断言，住核单测档、用毕即删——③ 夹具三份声明 + 截断落在第一份 ⇒ 句面点名后两份；④ 把 manifest 档造成目录（`EISDIR`）⇒ 句面指「manifest 档读失败」、不含「declared at `<manifest>`」形。收口读数 = A 栏与 C 栏各复跑式的原文输出，落 §5。

### 边界（本批不做）

不做：改任何机制、改任何判据、新增判据、动 `test/` 树、动需求档正文（只上抛）、动提示词正文（只上抛）、给十二处中的任一处写新的断言、把本批的扫描术做成常驻脚本（脚本 = 又一个要维护的活物）。

扫描式逐条落在 A 栏与 C 栏，复跑读数进 §5 收口行——本批不另立第二处声明面。

### 上抛项

`[上抛·知会]` 处 1 / 6 / 8 / 10 / 12 落在非本席写面（需求档 ∥ 产品码 ∥ 提示词）。本席只给目标态与复跑式，落盘由主 agent 路由。

`[上抛·知会]` 处 9 的档名判定 = 本轮实读结论，不再请评审给判：两档各是真面（读数见 A 栏处 9 末栏），「一物四名」因此只收注释措辞那一半。

`[已裁 · 见 §1]` 处 3 ③ 的对象不在盘：设计档树下无 `API-CONTRACT` 档，仓内也无该生成器 ⇒「重跑生成器、不手改」这条处方不可执行，本处零笔。父侧 2026-11-05 05:23 裁「对象消失、本处零笔，且这不是丢档」——该档随轻通道退役有意删除，不去找改名后的新坐标；两个导出（`lastRoundBlock` ∥ `VERDICT_PASS_LINE`）的登记面随该档退役，不另立账。

## §3 设计评审（评审子代理）
**状态行**：评审通过



### 轮次 1（评审子代理）

**设计评审结论（对象 = 批档 §2「批次任务与设计」· 2026-11-05）**

| # | 严重度 | 状态 | 证据（指针） |
|---|---|---|---|
| 1 | 🔴 | 未决 | 批档 §2「测试面」句「本批无机检件——改动面是文档与注释，不产生可跑断言」；全篇零 `test/RTM.md` 读表；项目既有形 = `docs/core/design/TESTING.md` §13.9 节名「集成测试设计（RTM delta · §11.15 三问）」 |
| 2 | 🔴 | 未决 | 批档 A 栏 处 4「①「五子键」→「六子键」」；`docs/core/design/MANIFEST.md` §2.12「`none found: thincoder-core/manifest-schema.mjs` 的 `DEFAULT_MANIFEST.docRoot` 五子键」；同档 §2.11「`docRoot` 六个子键（五个默认路径 + `standards: null`——§2.12）」 |
| 3 | 🟡 | 未决 | 批档 §2 无先例行（无先例坐标、无对齐/偏离）；对照 `docs/core/design/TESTING.md` §13.1「先例对齐」、`docs/core/design/MANIFEST.md` §2.12「最近先例（逐项）」 |
| 4 | 🟡 | 未决 | 批档 §2 无勘察证据行；对照 `docs/core/design/TESTING.md` §13.1「勘察证据行」、`docs/core/design/MANIFEST.md` §2.12「survey-evidence」 |
| 5 | 🟡 | 未决 | 批档 §2「分层结论」原文「零文件跨层——不新增文件、不动目录、不动清单」= 架构分层，非代码档行数档位结论 |
| 6 | 🟡 | 未决 | 批档 B 栏表头「处 / 判读点 / 判错的后果」缺 档 · 动作 · 期望；§1 原令「（处 / 档 / 动作 / 期望 / 为什么）……能机判的给出扫描式，不能的写明判读点」；处 1 ∥ 8 ∥ 10 仅见 C 栏，无扫描式亦无判读点 |
| 7 | 🟡 | 未决 | §1 处 2 的保护名单 = 架构档 ∥ 测试档（说对了的不许动）；批档「两处说对了、不许动」仅列 `docs/core/design/ARCHITECTURE.md` ∥ `docs/core/design/AGENT-LOOP-UPSTREAM.md`，测试档缺席 |
| 8 | 🟡 | 未决 | 批档「加上处 2 清单里那六份」；同节「处 2 已核实的命中」表列 8 份不同档（`docs/core/design/AGENT-LOOP-UPSTREAM.md` 占两行） |
| 9 | 🟡 | 未决 | 批档 A 栏 处 7「改为在盘清单对照」；`docs/desktop/design/E2E-TESTING.md` §8-9「行数面值单源 = 各域文件账」 |
| 10 | 🟡 | 未决 | 批档 B 栏 处 3①「以 `wc -l` 实测为准」；`docs/core/design/TESTING.md` §1.3「会变的读数（行数 · 命中数 · 档数 · 合计）不写进状态档（设计 ∥ 需求）」+「会变 ⇒ 不进文档，进命令」 |
| 11 | 🟡 | 未决 | 批档 A 栏 处 3③「只重跑生成器，`git diff` 判，不手改」——零生成器名 ∥ 零命令；验收对照行「生成区未手改」 |
| 12 | 🟡 | 未决 | 批档上抛·待裁「请评审席就此给判」——两档档名属可读事实，非裁量 |
| 13 | 🔵 | 未决 | 批档 B 栏「3 ⑤ / 明确不动的那处」——占位句，未点名档与节 |
| 14 | 🔵 | 未决 | 批档边界句「脚本 = 又一个要维护的活物，登记在案即可」——「登记在案」无落点 |

计数：🔴 2 · 🟡 10 · 🔵 2（共 14）

VERDICT: changes-required

### 轮次 2（评审子代理）

**设计评审结论 · 轮次 2（对象 = 批档 §2 对轮 1 十四条的落实）**

轮 1 十四条逐条有落点：

- #1 → §2「集成测试设计（RTM delta · 三问）」节
- #2 → A 栏 处 4①「不动那个数」+ 判据面「两处数字不一致」条
- #3 → 「先例行与勘察证据行 · 先例行」段
- #4 → 同段「勘察证据行」四条
- #5 → 「行数档位结论」段
- #6 → B 栏表头补 档·动作·期望态；处 1 ∥ 8 ∥ 10 复跑式落 C 栏
- #7 → 保护名单回 `docs/core/design/TESTING.md` + 「同族仍在、须同笔改的四行」
- #8 → 删「六份」
- #9 → 处 7 替代锚接 §8-9 权威
- #10 → 处 3① 依 `docs/core/design/TESTING.md` §1.3
- #11 → 处 3③ 零笔并给复跑命令
- #12 → 处 9 实读替上抛
- #13 → 处 3⑤ 点名批档与节
- #14 → 「登记在案」删除

覆盖对得上：A 栏九行 ∥ B 栏十一行 ∥ C 栏五行，十二处逐处有点名落点。

新发现在下（均落在本轮对象 §2 之内）：

| # | 严重度 | 状态 | 证据（指针） |
|---|---|---|---|
| 1 | 🔴 | 未决 | §2 A 栏 处 4「③截断支改注入面（截断点之后也要点名）；④读抛支改 `path` 传参」+ B 栏 4③ 档列「同档 §2.12 ∥ `thincoder-core/advisor/project-context.mjs`」+ 4④「只改字面不改传参 ⇒ 下轮照旧」；对照面：「产品码面（非本席写）」五档无该项目档、「四档产品码」只数四档、验收对照「`git diff` 只落在措辞 / 坐标 / 计数三类」、集成节「本批只改文档措辞 / 坐标 / 计数，零行为改动」 |
| 2 | 🟡 | 未决 | §2 上抛·待裁「请裁：判「对象消失、登记消除」，还是另定登记面——本席不自行改判据。」；§1「裁定 = 认可「对象消失、本处零笔」，且这不是丢档。」「不另立账」；A 栏 3③ 期望态「不再有登记义务」 |
| 3 | 🟡 | 未决 | §1 边界「生成区（`API-CONTRACT` 那类）只重跑生成器，不手改。」仍在；§1 05:23 裁定「把「生成区不手改」这条禁令**连同它的前提一起写掉**」 |
| 4 | 🟡 | 未决 | §2「说对了、不许动的」表末行「记的是核 ∥ cli 面的实况；本轮未逐行读，判面按「说的是哪个面」，不按行号」 |
| 5 | 🟡 | 未决 | §2 验收对照两行以 `git diff` 为读数：「说对的那几处不许动」「不改机制 ∥ 不改判据 ∥ 不加新判据」；评审上下文 = 「No git repository detected」 |
| 6 | 🔵 | 未决 | §2 集成测试节「本轮全文实读 RTM 验收总表（仓根 `test/` 下）」——未给 `test/RTM.md` 路径 |
| 7 | 🔵 | 未决 | §2 先例行「对齐点 = 同族清扫批的处置形（`docs/core/design/TESTING.md` §13.11「判据面清点（逐处处置）」）」——零先例批号 |
| 8 | 🔵 | 未决 | §2「同族仍在、须同笔改的四行」vs 同节 处 2 动作「逐行判面后改写」 |
| 9 | 🔵 | 未决 | §2 A 栏 处 5 扫描式「`grep -rn "应为字符串" thincoder-core/*.mjs`」无期望读数；同栏「守卫住在 `thincoder-core/ledger-tools.mjs`（拒串 `（应为字符串）`）」 |

计数：🔴 1 · 🟡 4 · 🔵 4（共 9）

VERDICT: changes-required

### 轮次 3（评审子代理）

**设计评审结论 · 轮次 3（对象 = 批档 §2 对轮 2 九条的落实 + 处 4③④ 新增产品码面）**

轮 2 九条：8 条已闭环 ∥ 1 条已采纳（#7 给了「不取批档作先例坐标」的理由）。新发现 2 条（1 🟡 可选 · 1 🔵）。

| # | 原# | 严重度 | 状态 | 证据（指针） |
|---|---|---|---|---|
| 1 | 轮2#1 | 🔴 | 已闭环 | 产品码面「`thincoder-core/advisor/project-context.mjs`（处 4③④ 的注入面，见决策 6）」；档位结论「五档产品码」；验收对照「改动面 = 措辞 ∥ 坐标 ∥ 计数 ∥ 处 4③④ 的两条注入句（覆盖面与句子归属）」；集成节「其余十一处的改动面是文档措辞 / 坐标 / 计数」 |
| 2 | 轮2#2 | 🟡 | 已闭环 | 上抛项「[已裁 · 见 §1] 处 3 ③ 的对象不在盘」；§2 上抛项只剩两条 [上抛·知会] + 一条 [已裁 · 见 §1]，零待裁项 |
| 3 | 轮2#3 | 🟡 | 已闭环 | §1 边界「本批 **零笔**：原对象（`API-CONTRACT` 生成区）已随轻通道退役不在盘」；§1 评审轮 2 裁定第 3 行「父侧已改」 |
| 4 | 轮2#4 | 🟡 | 已闭环 | 保护名单行「本轮逐处实读：六处记的都是核 ∥ cli 面的实况（exit 1 + 说明，非门）」+ 六处逐名 |
| 5 | 轮2#5 | 🟡 | 已闭环 | 决策 7「验收不用 `git diff` 做读数。」；验收对照「直读式（不用 `git diff`，见决策 7）」 |
| 6 | 轮2#6 | 🔵 | 已闭环 | 集成测试节「读表：本轮全文实读 `test/RTM.md`」 |
| 7 | 轮2#7 | 🔵 | 已采纳 | 先例行「先例坐标取设计档节、不取批档——批档可整档删除」 |
| 8 | 轮2#8 | 🔵 | 已闭环 | 「这四行的判面结论 = 改，不是保护：保护是**行级**不是档级」 |
| 9 | 轮2#9 | 🔵 | 已闭环 | A 栏 处 5「期望读数：`应为字符串` 命中恰两处」 |
| 10 | (新) | 🟡 | 可选 | 决策 7 携带易变读数「6 档已改 + 8 档未跟踪」；同节判据「读数不进设计档（判据 = `docs/core/design/TESTING.md` §1.3「会变 ⇒ 不进文档，进命令」）」 |
| 11 | (新) | 🔵 | 可选 | A 栏 处 3①「结论式（四档均未越 500 主动审视线）」vs 档位结论「五档改前均在 500 主动审视线内」 |

计数：🔴 0（轮 1 两条 + 轮 2 一条均已闭环）· 🟡 1（可选，不阻塞）· 🔵 1（新发现共 2 条）

VERDICT: pass

## §4 用户批准（主 agent）

## 用户批准

**用户原话**：「**都开吧**」（2026-11-05 05:05）——覆盖本批全部七族，含本族全链（设计 → 评审 → 批准 → 实施 → 收口）。

**批准面**：§2 定稿的十二处动作表 + 评审轮 3 的 `pass` 结论 + 轮 2 ∥ 轮 3 全部 🟡 的落位。

**批准即解冻**：§2 决策 5 的「§4 批准之前不落笔」条件此刻满足。设计档改写由设计席在下一轮落、逐处回读，范围：

- 处 2 四行：`docs/core/design/TESTING.md`
- 处 4①②：`docs/core/design/MANIFEST.md` §2.12
- 处 5：`docs/core/design/LEDGER.md` P4 行
- 处 7：`docs/desktop/design/E2E-TESTING.md` §9.1
- 处 11 ∥ 3④：`docs/core/design/ADVISOR-GUARDS.md`
- 处 3①②：`docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md`
- 处 3③：零笔（对象退役）

**轮 4 报的同族新命中一并纳入落笔轮**（族判据 = 扫一遍零新增命中，漏了它们本批就白立）：

- `docs/core/design/AGENT-LOOP-SUBAGENT.md`（`npm test` = 876/876 那行）
- `docs/core/design/ADVISOR-CONVERGENCE.md`（引 `docs/core/design/TESTING.md` §10 单入口那行）
- `docs/core/design/TWO-REPO-MERGE.md`（两行）
- `docs/core/design/AGENT-LOOP-UPSTREAM.md`（U10 ∥ U-SL3）
- `docs/core/design/PROMPT-SYSTEM.md`（逐字引了 `docs/core/design/TESTING.md` 那句「只证明一件事」——被引句一改，这条引文同笔要跟）

## §5 实施记录（eng-coder）
## §6 验证与收口（父代理）

## 验证与收口（父侧 · 2026-11-05 06:45）

### 交付核对（十二处 + 族判据）

| 处 | 判据 | 读数 |
|---|---|---|
| 2 | 包级 `npm test` 不再写成集成门 | `docs/core/design/TESTING.md` 四行 + 五档同族行已改；**又逐档改六档**（`AGENT-LOOP-ASYNC-POOL` ∥ `BASH-EXECUTOR-FACE` ∥ `SESSION-OBSERVABILITY` ∥ `CORE-UNIFICATION` ∥ `DOC-DISCIPLINE` ∥ `TIMEOUT-DIGEST`） |
| 3① | 行数读数改量法 + 结论式 | `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` §3 行数列整列删除，留量法与结论 |
| 3② | 行号坐标换符号名 | 改前 **73 行**带 `path:NNN` → 改后残留 1 行，是 `sha1(...)[:16]` 的 JS 切片（扫描假阳） |
| 3③ | 对象退役 | 零笔 |
| 3④ | 将来时收成完成态 | 同档 §2.5 ∥ `docs/core/design/ADVISOR-GUARDS.md` §1.2 |
| 4① | 「五子键」**不改数**、补时点限定 | `docs/core/design/MANIFEST.md` §2.12 补「搜当时的域」；**没有改成六** |
| 4② | 受影响面表补 `manifest read` 一行 | 已落 |
| 5 | `docs/core/design/LEDGER.md` P4 行换符号名 | 三枚 `ledger-cmd.mjs:NNN` 坐标删除，改为 `ledger-tools.mjs` ∥ `team-ledger.mjs` 的守卫 |
| 7 | `docs/desktop/design/E2E-TESTING.md` §9.1 死指针 | 删 `checkConfig.lineCounts` 整句，接 §8 第 9 条既有权威 |
| 11 | `docs/core/design/ADVISOR-GUARDS.md` 零行号 | §1.1 ∥ A-AG23 全部换符号名 |
| 族判据 | 扫一遍零新增命中 | 可写面内零新增；**超射程残留已挂 `#2077`**（同两档射程外约 40 处坐标 + 两处批指涉 + 一条行数读数） |

### 设计席报的三条判断，全部采纳

1. **「四档」↔「五档」两说** ⇒ 删数、改成回指（不选一个数）。
2. **「六名」↔「七名」** ⇒ 先量刑，判出两个数说不同物 ⇒ **删数、直接点名**。
3. **`§2.2` 是死指针** ⇒ 改指真实节。

### 收口门读数

- **集成全量**：`node test/run.mjs` ⇒ **`tests 143 · pass 143 · fail 0`**，exit 0。
- **doc-check 门**：本档 append 回执 `PASS`。
- **暂缓批复核**：无。

### 两个假绿被拆掉（本批的意外收获）

- `docs/core/design/BASH-EXECUTOR-FACE.md` AC8 原写「核测试 `node --test` 全绿」——**`thincoder-core` 里一个用例档都没有**，那是**空集上的绿**。已改成可达读数（语法门 + 包级 exit 1 如实）。→ `#2078`
- 设计席拒做门给的那条「插空行切段」出路，理由 = 门自己写着「切段能过机检，但不是处置」。**改成结构重写**（拆具名项 / 进围栏），字面逐字不动。

### 台账

`#2062` 在途 → 待核销 → 已核销。
