# 2026-11-11 · p2-7-subagent-docroot-coordinates
> 六段，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 每段只有一个作者：作者的段可 `append` 加内容、可就地改（`edit`）；非作者一概拒。
> 编制：主 agent · 2026-11-11 · 来源 = 用户 2026-11-11 02:20 提问「project-manifest 跟 advisor 和子 agent 是否应该建立关联？这样它们能知道哪类内容应该从哪里找」；02:22「我觉得要」。。
> 台账 = #2320（core · 归批）。前情 = 无（独立批）。
## §1 讨论（主 agent）
**状态行**：已收口 2026-11-11
批起 sha = f3c69ca7d406450b7c184fcae82371d447f45942
<§1 模板占位：本批条目 / 关键判据 / 授权口径>

**本批条目（一条）**：子代理的系统提示增加一行文档坐标（`requirements` ∥ `design` ∥ `batches`），数据源 = 项目声明的 `PROJECT-MANIFEST.json` `docRoot`。

**关键判据**：
- **未声明 ≠ 读不出**：缺键 ⇒ 明写未声明；整档不存在 ∥ 坏档 ⇒ **不注入这一行**（三层皆无声明时发三个「未声明」是非项目目录的噪音）。
- **不得把默认值当声明**：`readManifest` 的返回已补默认值（`manifest-schema.mjs` 的 `requirements: "docs/requirements"`），直接打印就是造一个从未声明的坐标 ⇒ 用同次返回的 `missingKeys` 判别。
- **不探路径是否存在**：声明是项目的话；探测会把「声明了但目录还没建」变成静默隐瞒。
- **只三行、项目根相对**，不写绝对路径、不列全五键。

**授权口径**：用户 2026-11-11 02:20「project-manifest 跟 advisor 和子 agent 是否应该建立关联？这样它们能知道哪类内容应该从哪里找」+ 02:22「我觉得要」。

**需求层**：已立 `docs/core/requirements/AGENT-LOOP.md` §4.7 `F3`（子代理携文档坐标），与本批同名。

**两处已裁（设计席上抛）**：① 无档 ⇒ 归「读不出、不注入」，不照发三个「未声明」；② `test/rtm/` ∥ `test/integration/` 是否断言 `_spawnSystemBlock` 内容 = `unverified`，作为实施轮复核项。

**父侧裁定 · AC-DC-5 乙 的判法是块级的（实施席已按此落地，设计档措辞向它对齐）**

- 实施席实读：`thincoder-core/agent-tools/audit-block.mjs` 的模板无条件拼 `Batch record (batchDoc): ${batchDoc}`，审计块自身就带这一行。而本批明令既有三块零改 ⇒ 字面「块内无该串」不可达。
- **裁定**：乙 = **没有独立的批档行块**（整块不以该串开头；该串的唯一出现位置在审计块内），不是「全文无此串」。
- 这条与 AC-DC-5 自己的理由句（「审计块与批次档行互斥」）同向，也与 §6.61.2 ① 的「可达的复合态只有两条」同向。
- **修法归设计席**：design 档措辞按上述块级形改写；实施席的行为不改。

**父侧裁定 · 「非抛错」与「可能抛」两处相反，收在 `MANIFEST.md`（第 4 轮 🔴 的处置方向）**

- **事实面**：`thincoder-core/manifest-discovery.mjs` 的 `owningProject` 里 `statSync(dir, { throwIfNoEntry: false })` **无护栏**；`scanChildren` 才有 `} catch { return [] }`。⇒ `docs/core/design/AGENT-LOOP-SUBAGENT.md` §6.61.2 ④ 新写的「同样读盘、同样可能抛」是准的，`docs/core/design/MANIFEST.md` §2.2 的「非抛错」与 `discoverProjects` 的「不抛」成了第二份活描述。
- **裁定**：项目根解析机制的主档是 `MANIFEST.md` §2.2，**两份描述收到那一档**——要么把「非抛错」收窄成「状态面不抛（I/O 异常照原样上抛）」，要么在 §2.2 里点名 `owningProject` 那一环无护栏；`docs/core/design/AGENT-LOOP-SUBAGENT.md` §6.61.2 ④ 改成指针或与之同词。
- **不改代码**：本批不做 `owningProject` 的护栏（那是另一件事，若要做得另开批）；本批只让两份文档说同一句话，并用护栏包住调用点。
- 这条同时决定 🔵5 的落法：护栏宽度段保留，但它的依据从「解析链会抛」改成「`MANIFEST.md` §2.2 的现行口径 + `owningProject` 无护栏」。

## §2 批次任务与设计（eng-designer）
**状态行**：设计完成（修正轮 5：§3 轮次 7 的五条 🟡 逐条落地（AC-DC-8 红侧改「本批实施加宽前的形」· 用例 12 零回归改锚真装配 · 三块态触发形补绑定 coder · 两块态加「非可达态全分类」限定 · 需求行补 requirements §4.7 F3））
<§2 模板占位：本批条目（覆盖） / 设计档落点 / 机制设计 / 受影响文件与测试覆盖 / 验收对照 / 关键决策 / 上抛项>

### 本批条目（覆盖）

| # | 条目 | 判据出处 |
|---|---|---|
| 1 | 子代理 system 面多一行文档坐标（`requirements` ∥ `design` ∥ `batches` 三层，项目根相对） | 设计 §6.61.2 ②（逐字文本）· AC-DC-1 |
| 2 | 未声明的层呈现 `(undeclared)`，**不回落 `DEFAULT_MANIFEST` 的默认路径** | 设计 §6.61.2 ③ · AC-DC-2 ∥ AC-DC-3 |
| 3 | manifest 读不出（无档 ∥ 坏档 ∥ 读抛）⇒ 不推这一块，spawn 照常 | 设计 §6.61.2 ④ · AC-DC-4 |
| 4 | 既有三块（批档行 ∥ 审计块 ∥ 写域行）零改、零换序，本行追加在尾 | 设计 §6.61.2 ① · AC-DC-5 |
| 5 | `docRoot` 消费面清单登记本消费点 | `docs/core/design/MANIFEST.md` §2.7（8 处清单第 8 行） |

**本批不覆盖**（父侧明令 / 需求未及）：advisor 面零改；不为「两份一致」造公共层；不给整张 document map；不探测路径存在性（设计 §6.61.7）。

### 设计档落点

- 机制正本 = `docs/core/design/AGENT-LOOP-SUBAGENT.md` §6.61（做法与理由 §6.61.1 ∥ 接口契约 §6.61.2 ∥ 受影响文件 §6.61.3 ∥ 关键决策 §6.61.4 ∥ 验收 §6.61.5 ∥ 用例表 §6.61.6 ∥ 边界 §6.61.7 ∥ UI §6.61.8 ∥ RTM delta §6.61.9）。
- 注入位分类表 = 同档 §6.26 表新增第 16 行（S5），细节回指 §6.61（D2：表不复述）。
- 消费面登记 = `docs/core/design/MANIFEST.md` §2.7「全消费面清单」由 7 处改 8 处 + 第 8 行；同节「本面无」消费面读数补齐 S5 一格。

### 机制设计（一段速览）

`buildSpawnChild` 的 `spawnBlocks` 收集点推第五块：局部纯函数 `docsCoordinatesBlockOf(parent.cwd)` 读 `readManifest`，用**原始档算得的** `missingKeys` 判「未声明」、用 `docRootPaths` 取项目根相对路径，读不出返回 `null`、调用点不推块。文本、出口、三格红侧全在设计 §6.61.2。

**为什么这是本批的真难点**：`readManifest` 的返回值已 `fillDefaults`，`DEFAULT_MANIFEST.docRoot` 带五条真实默认路径——直接打印返回值就是「猜路径」，且看起来很像是声明（设计 §6.61.1 第三段 · KD-DC2）。

### 受影响文件与测试覆盖

| 文件 | 层级 | 本批 |
|---|---|---|
| `thincoder-core/agent-tools/subagent-spawn.mjs` | 产品代码（核） | 实施轮写：局部纯函数 + 一行推块 + 收集序注释补 S5 |
| `thincoder-core/agent/setup.mjs` | 产品代码（注释面） | 实施轮写：拼接分支上方注释的块枚举补「文档坐标行」、计数与收集点同数（四块），零行为变更（设计 §6.61.3） |
| `docs/core/design/AGENT-LOOP-SUBAGENT.md` | 设计档 | 本轮已写（§6.61 + §6.26 表第 16 行） |
| `docs/core/design/MANIFEST.md` | 设计档 | 本轮已写（§2.7 清单 7→8 + 第 8 行 + 「本面无」读数；§2.2 项目根解析的不抛口径收窄为「状态面不抛」+ `owningProject` 无护栏段 + 同档八处活描述随正） |
| `docs/batches/<batch record name>.test.mjs` | 单测档（测试面） | 实施轮创建、自写自跑；收口随批删除（零留存，不进分层判断） |

**层级结论**：无档跨层，无拆分计划（设计 §6.61.3）。**单测** = 与批档同名同目录的单测档，实施轮自写自跑，收口删除；覆盖 AC-DC-1–AC-DC-5。
**集成** = 零行（设计 §6.61.9：不改变任何业务可观察结果，两侧入口皆不成立）。

### 验收对照

设计 §6.61.5 八条，逐条回指上表条目：AC-DC-1（条目 1）· AC-DC-2 ∥ AC-DC-3 ∥ AC-DC-7（条目 2：红侧两格 + 整键格）· AC-DC-4 ∥ AC-DC-8（条目 3：红侧三格 + 护栏宽度）· AC-DC-5（条目 4）· AC-DC-6（文档门 = 全批）。

### 关键决策

KD-DC1 system 固块非 user 首条 · KD-DC2 `missingKeys` 判别、不回退默认档 · KD-DC3 只给三层 · KD-DC4 读不出不推块（业务结果零变，非兜底静默）· KD-DC5 不探测路径存在性——理由与否决替代逐条在设计 §6.61.4。

### 上抛项

1. **[已结] 需求层落点**：需求条目已立 = `docs/core/requirements/AGENT-LOOP.md` §4.7 `F3`，判定句含「未声明与读不出两种状态必须可区分（前者明写未声明，后者不注入）」——与本段条目表、设计 §6.61.5 六条 AC 同读法，无待裁项。
2. **[已结] 整档缺失归哪一格**：按 §1 裁定「无档 ⇒ 归读不出、不注入」落定（设计 §6.61.2 ④ ∥ AC-DC-4 第一格）；与 F3 判定句一致。此项不再待裁。
3. **[已核，复核项撤销]** `test/` 下对 `_spawnSystemBlock` 检索**零命中**（本轮 `grep`）⇒ 无既有用例断言该字段内容，设计 §6.61.9 首行由「实施轮复核」改为「已核」。
4. **[上抛·待裁] 既有档越软线的拆分排期**：`thincoder-core/agent-tools/subagent-spawn.mjs` 越 500 软线（读数见修正轮 🔴2 行），本批判定**不拆**（理由在设计 §6.61.3）。是否单开一批拆、按「调度 ∥ 固块 ∥ 门禁」三族切，归父侧定并记账——本席不自行拆。

### 修正轮（§3 轮次 1 的 11 条逐条落点）

编号 = §3 表行号；落点 = 设计档内改到的那一处。

| # | 落点 |
|---|---|
| 🔴1 | §6.61.2 ① 新增「可达的复合态」条：审计块与批档行**互斥**（源证 = `thincoder-core/agent/spawn-child.mjs` 的 `gateEngCoderSpawn` 只放行 `role='explore'`；`thincoder-core/agent-tools/subagent-spawn.mjs` 的 `batchBound = engineeringRole \|\| (role === "coder" && !!batchDocAbs)`）⇒ 可达完整集只有两条。AC-DC-5 改这两条（甲 = 工程角色 + `files`，乙 = `explore` + `files`）；用例 7 ∥ 8 同步改，不再主张四块共存 |
| 🔴2 | §6.61.3 层级结论重写：补**量法**句（`doc_check(mode:"report", lines:[…])`，软线 500 与量法同源 `DOC-GRAPH.md` §3）+ 结论「`thincoder-core/agent-tools/subagent-spawn.mjs` 越 500 软线」+ 主动拆分审视（**不拆**：本批只加局部纯函数与一行推块，拆分是整档搬位，与本批「兄弟块零改、零换序」的验收相反；切法属独立一批判断）。读数（2026-11-11 本轮 `doc_check(mode:"report", lines:[…])` 输出）：`501  thincoder-core/agent-tools/subagent-spawn.mjs  · 越 500 软线（主动审视）` |
| 🟡3 | §6.61.2 ② 重写为「形 + 逐字前缀」：给**形**（前缀 + `层 = 值`，层间 ` · `，同层 `, `，层次序固定），该串标为**示例**且不抄本仓现值（本仓 requirements ∥ design 各六根，抄进来就过期）；AC-DC-1 绑**夹具 F1** 三值；用例 1 ∥ 2 同步 |
| 🟡4 | §6.61.2 ③ 表增「这一格管的输入」列 + 复现 code 块三条（① 缺子键 ② 整键缺 ③ 本面无）；「三层全未声明」改登记为「不另设分支」（同一逐层判据连用三次）；旧用例 7 删除，位置由可达复合态占用 |
| 🟡5 | `docs/core/design/MANIFEST.md` §2.7 第 8 行「读不出 ⇒ 该项零贡献」改「读不出 ⇒ **整块不推**（三层一行都不出现）」，与 §6.61.2 ④ 同词同义 |
| 🟡6 | §6.61.3 表加改面单测档行；§6.61.5 首行具名该档（与批档同名同目录、`node --test` 只跑这一个目标、收口删除），档位结论 = 测试面不进产品档分层判断 |
| 🟡7 | §6.26 第 16 行「现载体」前提收正：由「`docRoot` 此前无子代理消费点」改为「**未自动注入**」+ 点明五个 depth>0 段各挂 `manifestReadTool`；§6.61.1 新增「相对既有 `manifest` 读工具的增量」段（省掉「先想到、再探明」那一趟，不是新开数据通路） |
| 🟡8 | §6.61.2 ⑦ 代价拆三条：档读 ∥ 注入 token（随三层**根总数**增长、与层数无关；KD-DC3 砍不掉根数）∥ 不设根数上限（与 S4「清单不截断」同一判据，降本走声明侧或层数） |
| 🔵9 | §6.61.9「被破坏的现有行」改为已核事实：`test/` 下 `_spawnSystemBlock` 检索零命中，不再是实施轮复核项 |
| 🔵10 | §6.61.1 新增「既有件三问」表三行（新函数 `docsCoordinatesBlockOf` ∥ Docs 行文本 ∥ 「未声明」判别）——有意成行，非散落 |
| 🔵11 | §6.61.1 新增「advisor 侧各有其主」段：`thincoder-core/advisor/project-context.mjs` 已承 advisor 那一半，两侧各有其主、不合并、不抽公共层 |

**本轮读数（命令 + 结论；绝对值只住本段）**：

- `doc_check(mode:"report", lines:["thincoder-core/agent-tools/subagent-spawn.mjs"])` ⇒ `501 … 越 500 软线（主动审视）`。
- 夹具读数（`node --input-type=module` 走 `thincoder-core/manifest-schema.mjs` 的 `validateManifest` ∥ `fillDefaults`）：缺 `docRoot.design` ⇒ `missingKeys` 含 `"docRoot.design"`，同次 `fillDefaults` 给出 `"docs/design"`；`docRoot` 整键缺 ⇒ `missingKeys` 含 `"docRoot"`；`docRoot.batches = null` ⇒ 不含该项、`errors` 空、`fillDefaults` 保持 `null`。
- `grep _spawnSystemBlock`（`thincoder/test` 全域）⇒ 零命中。

**三处自洽检查**：① 引用集 ↔ 标题集——§6.61.1–§6.61.9 九节齐备，正文引用的 `§6.61.2 ①–⑦` ∥ `§2.7` ∥ `§6.60.2 ①` ∥ `§6.26` 均实存；② 表行 ↔ 计数——`docs/core/design/MANIFEST.md` §2.7 清单 8 行与「8 处」一致，AC 六条逐条回指本段条目表四条；③ 断言 ↔ 实测——上面三条读数均为本轮命令输出。

### 修正轮 2（§3 轮次 3 的 8 条 + §1 父侧裁定 AC-DC-5 乙）

条目表 5 条与判据出处不变；本轮只收正同一机制在别处的活描述，以及三处缺格。

| # | 落点 |
|---|---|
| 🔴1 | 同一机制两处活描述相左 ⇒ 设计档四处一并收正：§6.26「零回归」句改「null 两形 = **depth-0**（不走 `buildSpawnChild`）∥ **depth>0 但一块都没推**（manifest 读不出 ∧ 无 `files` ∧ 非工程角色）」，并点明 `depth>0` 不是 null 的充分条件（S5 对任何 `depth>0` 角色都推）；用例 **U5** 输入格同改；用例 **U9** 改「块内无写域行（不含 `Files declared for this spawn`），批档行与文档坐标行照旧在位」——原文主张「逐字节 = `Batch record (batchDoc): <abs>`」在 S5 落地后不成立；**A23-4** 去掉 U6 作 null 路径、**A23-8** 同改；§6.26 写域行收集序行改「其后还可能有文档坐标行（S5），全序正本 = §6.61.2 ①」 |
| 🟡2 | AC-DC-5 乙 按 §1 父侧裁定的**块级**判法改写：乙 = 块内**没有独立的批档行块**（首块不以 `Batch record (batchDoc):` 开头；该串唯一出现处 = 审计块模板自身带的那句批档路径），并写明「全文无该串」在审计块零改前提下不可达；用例 8 同步（期望加「块头 = `[Audit scope — mechanical context`」、改「无独立批档行块」） |
| 🟡3 | 用例表 8 行 → **10 行**：新增第 9 行（`docRoot` 整键缺 ∥ 值非对象 ⇒ 三层皆 `(undeclared)`，契约 ③ 整键格）与第 10 行（manifest 读抛 ⇒ 不推块、spawn 照常，AC-DC-4 第三格）——交付单测已覆盖这两格，表里此前无行 |
| 🟡4 | 越单补登记：§6.61.3 表新增 `thincoder-core/agent/setup.mjs` 一行——拼接分支上方注释的块枚举补「文档坐标行」、块计数与收集点同数（四块）；注释面，零行为变更 |
| 🔵5 | 护栏宽度写进契约：§6.61.2 新增「**护栏宽度 = 整段坐标计算**」段——基数取法 `docRootBase(cwd)` 走项目发现链（`resolveProjectRoot` → `projectRootView` 的 `owningProject` ∥ `discoverProjects`），同样读盘、同样可能抛 ⇒ 只包 `readManifest` 那一句只兑现半条承诺。**实施面随之加宽 try**（现盘只包读档一句） |
| 🔵6 | §6.61.1 做法行改「在既有三块之后追加一格（站点号 S5）」，并新增「**`S5` 是站点号，不是块计数**」段：本批后块上限四块、可达态最多三块 |
| 🔵7 | AC-DC-4 机检列补夹具前提：临时目录且祖链上无 `PROJECT-MANIFEST.json`——否则「无档」格取到别处的档，用例读的不是它自己造的状态 |
| 🔵8 | 越 500 软线为读数、非缺陷；拆分排期由上抛项 4 登记，本席不重判 |

**本轮读数（命令 + 结论；绝对值只住本段）**：

- `doc_check(mode:"report", lines:["thincoder-core/agent-tools/subagent-spawn.mjs","thincoder-core/agent/setup.mjs"])` ⇒ `554 … 越 500 软线（主动审视）` ∥ `302 … 未越线`。修正轮 1 记的 `501` 是**实施前**读数，实施席新增该函数后为 554。
- 设计档自身 `doc_check(mode:"report", docs:["docs/core/design/AGENT-LOOP-SUBAGENT.md"])` ⇒ 命中 0 条。
- 源证（`thincoder-core/agent-tools/audit-block.mjs`）：块头 `[Audit scope — mechanical context, independent of the eng-coder's self-report:]`；块内 `Batch record (batchDoc): ${batchDoc}`——两句并存，正是 AC-DC-5 乙 只能判块级的原因。
- 源证（`thincoder-core/manifest.mjs`）：`docRootBase` 体内 `resolveProjectRoot(cwd) ?? resolve(cwd ?? ".")`；`thincoder-core/manifest-discovery.mjs` 的 `resolveProjectRoot` ⇒ `projectRootView(cwd).root` ⇒ `owningProject` ∥ `discoverProjects`——基数取法是一次读盘。

**三处自洽检查**：① 引用集 ↔ 标题集——本轮新引的 `§6.61.2 ①` ∥ `§6.61.2 ④` ∥ `§6.26` ∥ `§6.61.1` 均实存，§6.61 仍九节齐备；② 表行 ↔ 计数——用例表 8 → 10 行（新增两行）、§6.61.3 表 3 → 4 行（新增 `thincoder-core/agent/setup.mjs`）、AC 六条逐条回指条目表四条不变；③ 断言 ↔ 实测——上面两条 `doc_check` 读数与两条源证均为本轮实跑 / 实读。

**上抛项不变**：1–3 已结；4（越软线的拆分排期）仍待父侧定。

### 修正轮 3（§3 轮次 4 的 6 条 + §1 父侧裁定）

条目表 5 条与判据出处不变。本轮不新增语义，只把同一机制在别处的活描述收成一句、补三处缺格。

| # | 落点 |
|---|---|
| 🔴1 | 同一机制两处活描述相反 ⇒ 按 §1 父侧裁定**收在 `docs/core/design/MANIFEST.md` §2.2**：`projectRootView` 契约行「非抛错 / 零写」改「**零写 · 状态面不抛**——`state` 三值恒有答案；I/O 异常照原样上抛」；新增「**I/O 异常上抛（无护栏）**」段，点明 `owningProject` 体内 `statSync(dir, { throwIfNoEntry: false })` 无 try/catch 而同档 `scanChildren` 有 `} catch { return [] }`，并写明「凡经本函数取根的读侧面，其『不抛』只指**状态面**」。同档随正的活描述共八处：启动流程图 `projectView` 注 · `projectView` 契约行 · `resolveEngineeringManifest` 契约行与「树不抛」句 · §2.5 读侧单点行 · KD-M1-20 · KD-M1-24 · §2.8 接口行 · §2.9「`read` 从不抛」行。`docs/core/design/AGENT-LOOP-SUBAGENT.md` §6.61.2 ④ 按裁定改成**指针 + 同词**：依据从「解析链会抛」改为「`owningProject` 无护栏」，口径单源指向 `MANIFEST.md` §2.2 `owningProject` 条；护栏宽度段保留 |
| 🟡2 | §6.26「零回归」的 null 两形重写：depth>0 那一形由「manifest 读不出 ∧ 无 `files` ∧ 非工程角色」改为**四格全空**（`batchBound` 为假 ∧ `engAuditAttempt === null` ∧ `files` 空 ∥ 未传 ∧ 文档坐标块不推），并新增一行点明「不能压成『非工程角色』」，源证 = `batchBound = engineeringRole \|\| (role === "coder" && !!batchDocAbs)`；用例 **U5** 输入格同改；**A23-4** 补「null 的枚举逐格见 U5」 |
| 🟡3 | §6.26 **A23-5**「分类裁定表 15 行」→「**16** 行」，并点名第 16 行（文档坐标行 S5） |
| 🟡4 | 三处缺格补齐：① **AC-DC-4** 第三格（读抛）给触发手段 = 把 `PROJECT-MANIFEST.json` 造为目录 ⇒ `readFileSync` 抛 `EISDIR`（非 ENOENT ⇒ `manifest.mjs` 的 `throw e` 上抛），用例 10 输入格同改；② 新增 **AC-DC-7** = `docRoot` 整键缺 ∥ 非对象 ⇒ 三层皆 `(undeclared)` 且全文不含默认路径（用例 9 的落点）；③ 新增 **AC-DC-8** = 护栏宽度的源码面结构断言（`try` 覆盖 `readManifest` ∥ `docRootBase` ∥ `docRootPaths`），用例表加第 11 行；该条**现盘先红** |
| 🔵5 | §6.26 **U9** 输入格补夹具条件（临时项目目录、manifest 可读、三层已声明）——`docRoot` 不可读时坐标行本就不推，那时「照旧在位」无从判 |
| 🔵6 | **AC-DC-5** 乙由「首块不以 `Batch record (batchDoc):` 开头」升为「**恰三块** + 首块块头 = 审计块头」；甲同加「恰三块」——原判法下多一块批档行也照样绿 |

**本轮读数（命令 + 结论；绝对值只住本段）**：

- `doc_check(mode:"report", docs:["docs/core/design/AGENT-LOOP-SUBAGENT.md","docs/core/design/MANIFEST.md"])` ⇒ `命中 0 条（锚 0 · 文字太长 0 · 行号坐标 0）`。
- 源证（`thincoder-core/manifest-discovery.mjs`）：`owningProject` 体内 `const st = statSync(dir, { throwIfNoEntry: false })` 无护栏；`scanChildren` 体内 `} catch { return [] }`。
- 源证（`thincoder-core/manifest.mjs`）：`export function docRootBase(cwd)` 体 = `resolveProjectRoot(cwd) ?? resolve(cwd ?? ".")`；`readManifest` 内 `throw e // 权限/目录等其他读错——fail-closed 上抛，不伪装成缺失`；`readFileSync` 之外 `ENOENT` 才转 `reason: "missing"`。
- 源证（`thincoder-core/agent-tools/subagent-spawn.mjs`）：`docsCoordinatesBlockOf` 的 `try {` 内只有 `read = readManifest(cwd)`，`const base = docRootBase(cwd)` 与 `docRootPaths(...)` 在其外 ⇒ AC-DC-8 **现盘先红**（这一格是实施轮的必改项，不是已达成项）。

**三处自洽检查**：① 引用集 ↔ 标题集——本轮新引 `§2.2` ∥ `§2.5` ∥ `§2.7` ∥ `§2.8` ∥ `§6.61.2 ④` ∥ `§6.61.5` 均实存，§6.61 九节齐备；② 表行 ↔ 计数——AC 六条 → **八条**（新增 AC-DC-7 ∥ AC-DC-8），用例表 10 → **11 行**，§6.26 分类裁定表 16 行（A23-5 已随正），本段条目表仍 5 条；③ 断言 ↔ 实测——上面四条读数均为本轮实跑 / 实读。

**上抛项不变**：1–3 已结；4（越软线的拆分排期）仍待父侧定。本轮无新增待裁项。

### 修正轮 4（父侧三项派单 + 两条顺带收正）

条目表 5 条与判据出处不变。本轮不加语义：只把设计档里与**交付后盘面**相反的三处描述收到现态，并补一格表行。

| # | 落点 |
|---|---|
| ① | **AC-DC-8 的「现盘先红」是反的** ⇒ §6.61.5 AC-DC-8 机检列改「**红侧 = 护栏变窄**：`try` 只包 `readManifest`、基数与路径映射留在护栏外（改前态，设计时实读）」；判据列补「且 `try {` 之前与 `catch` 之后两面都不留同调用」（与交付单测实际断的 prologue ∥ epilogue 两面同宽）。§6.61.6 用例 **11** 期望格同改，去「现盘先红」 |
| ② | **越单补进受影响表** ⇒ §6.61.3 表 `thincoder-core/agent-tools/subagent-spawn.mjs` 行由三项补成四项之实：新增局部纯函数一句内明写「护栏 = 整段坐标计算：读档 ∥ 基数解析 ∥ 路径映射 ∥ 串拼装全在 `try` 内」——AC-DC-8 正是为它立的，此前表里没有这一项实改 |
| ③ | **用例表 ↔ 单测档对账** ⇒ §6.61.6 用例表 11 **→ 12 行**：新增第 12 行（正常格：夹具 F1 三层已声明 + 工程角色 + `files` ⇒ Docs 块 = 整块末行单行、去掉它后首块仍为批档行、装配零落盘，回指 **AC-DC-5 零回归半**）。**表外零格**——表 12 行与交付单测 12 格一一对应，不再有「表外一格」的记账缺口。同轮 **AC-DC-5** 机检列补零回归半的判法（去掉 Docs 行后整块以批档行开头 + 装配前后目录内容不变）——表里多一格而判据列不说怎么判，等于让读者自己猜 |
| ④ | **顺带（§3 轮次 5 #12）**：用例 9 期望格补 `(AC-DC-7)` 回指 + 「全文不含默认路径（`docs/requirements` ∥ `docs/design` ∥ `docs/batches`）」两断言——AC-DC-7 的判据列本就要「两断言并取」，表行此前只记了前半 |
| ⑤ | **顺带（§3 轮次 5 #8）**：§6.61.2 ① 「可达的完整集只有两条」与 §6.26 **U10**（`explore` spawn 带 `files`、无 `batchDoc`、无审计）相左——U10 那一格收 [写域行, Docs 行]，也是可达态。改「**三块态**只有两条」+ 点名两块态（非工程父下的 `explore` + `files`）不在本批验收内；验收主张不变（仍只断两条三块态）。同轮 AC-DC-5 判据列「两条**可达**复合态」改「两条可达**三块态**」，与 ① 同词——两处不同词就是下一个读者要解一次的歧义 |

**本轮读数（命令 + 结论；绝对值只住本段）**：

- `doc_check(mode:"gate", docs:["docs/core/design/AGENT-LOOP-SUBAGENT.md"])` ⇒ 首行 `DOC-CHECK GATE: PASS`，`0 段有问题（1 档全清）`。
- 源证（`thincoder-core/agent-tools/subagent-spawn.mjs` 的 `docsCoordinatesBlockOf` 体内）：`try {` 之后依次为 `const read = readManifest(cwd)` ∥ `const base = docRootBase(cwd)` ∥ `docRootPaths(value, cwd)`，三处都在 `} catch {` 之前，`catch` 收成 `return null` ⇒ 交付盘面 = 护栏覆盖整段坐标计算，AC-DC-8 现为**绿**；「现盘先红」的写法与盘面相反，故改「改前态」。
- `Select-String 现盘先红`（`docs/core/design/AGENT-LOOP-SUBAGENT.md` 全域）⇒ **零命中**（改后扫，本轮）。
- 计数取法（量法 = `node` 行扫描，同一次跑出两档）：`§6.61.6` 段内 `^\| <数字> \|` 数据行 ⇒ **12 行**（编号 1–12 连续）；交付单测档行首 `test(` ⇒ **12** ⇒ 一对一，表外零格。同次跑出：`现盘先红` 命中 **0**；`§6.61.x` 三级标题 **9** 个（九节齐备）。

**三处自洽检查**：① 引用集 ↔ 标题集——本轮新引 / 改引的 `§6.61.2 ①` ∥ `§6.26 U10` ∥ `§6.61.3` ∥ `§6.61.5` ∥ `§6.61.6` ∥ `AC-DC-5` ∥ `AC-DC-7` ∥ `AC-DC-8` 均实存，§6.61 仍九节齐备；② 表行 ↔ 计数——用例表 11 → 12 行（唯一计数变动），§6.61.3 表仍 4 行、AC 仍八条（本轮无新增 / 删除 AC）；③ 断言 ↔ 实测——上面四条读数均为本轮实跑 / 实读。

**上抛项**：1–3 已结；4（`thincoder-core/agent-tools/subagent-spawn.mjs` 越 500 软线的拆分排期）仍待父侧定。本轮新增两条，**均在本轮写域之外**（父侧边界 = 只改 `docs/core/design/AGENT-LOOP-SUBAGENT.md`）：

5. **[上抛·待裁]** `thincoder-core/manifest-discovery.mjs` 的 `projectRootView` 注释仍写「非抛错 / 零写」——项目根解析链的**第三份活描述**；`docs/core/design/MANIFEST.md` §2.2 与 §6.61.2 ④ 已按 `owningProject` 无护栏收正，代码注释面尚未同词。归父侧排期（产品代码不是设计席笔）。
6. **[上抛·待裁]** `docs/core/design/MANIFEST.md` §2.2 `owningProject` 条的 I/O 段写「调用点要『绝不赔掉一次调用』，护栏自己包」，未点名任何调用点——该档不在本轮写域；本批的唯一调用点 = `docsCoordinatesBlockOf`（§6.61.2 ④ 已在该档同词说明），是否在 §2.2 补一句点名，归父侧定。

### 修正轮 5（§3 轮次 7 的五条 🟡，父侧明令本轮清掉；写域 = `docs/core/design/AGENT-LOOP-SUBAGENT.md`）

五条全为措辞 / 回指 / 断言锚点，零机制变更；`thincoder-core/agent-tools/subagent-spawn.mjs` 与单测档本轮零触。

| # | 落点 | 改后逐字 |
|---|---|---|
| ① AC-DC-8 红侧括注无比较基准 | §6.61.5 AC-DC-8 机检列 | 「**红侧 = 护栏变窄**：`try` 只包 `readManifest`、基数与路径映射留在护栏外——这是**本批实施加宽前的形**（`docsCoordinatesBlockOf` 本批新增，本批落地前无该函数的盘面承载体，故不称「改前档面」）；取法 = 把护栏收窄成只包 `readManifest` 后重跑用例 11，须转红」——取父侧给的**第一支**：该函数本批新增，无本批落地前的承载体可点名；红侧由「收窄护栏」这一动作造出，不靠追一个不存在的旧盘面 |
| ② 用例 12 零回归近乎重言（从成品串剪接即可满足） | §6.61.6 用例 12 行 + §6.61.5 AC-DC-5 机检列 | 用例 12 输入 =「AC-DC-4 的「无档」夹具 + 工程角色 + `files` 两条（真 `buildSpawnChild`；该夹具下 Docs 块本就不推）」，期望 =「整块**恰两块**且序 = 批档行（首）→ 写域行——即该夹具本批改前的期望（真装配读出，不是从成品串剪掉 Docs 行）；装配前后目录内容不变（零落盘）（AC-DC-5 零回归半）」；AC-DC-5 机检列同句同改。零回归半改锚在**一次真装配**上：该夹具下 Docs 块不推是既定事实（AC-DC-4），故那次装配的块集就是本批改前的期望，不经剪接 |
| ③ 三块态触发形漏了绑定 `coder` | §6.61.2 ① | 「**三块态**只有两条：**批档行在场者**（工程角色 ∥ 绑定 `coder`）+ `files` ⇒ [批档行, 写域行, Docs 行]；审计子代理 + `files` ⇒ [审计块, 写域行, Docs 行]。」——与同句引的 `batchBound = engineeringRole || (role === "coder" && !!batchDocAbs)` 对齐；块集与「只有两条」的结论不变 |
| ④ 「两块态」读作穷举 | §6.61.2 ① 同段 | 「三块之外还有**两块态**，例如非工程父下的 `explore` + `files` 收 [写域行, Docs 行]（§6.26 U10）· 无 `files` 的批档行在场者收 [批档行, Docs 行] · 无 `files` 的审计子代理收 [审计块, Docs 行]。**这一段列的是本批验收所要的块集，不是可达态的全分类**：验收只断上面两条三块态，其余态不在本批验收内。」——限定句写明这一段的身份；三个例子标为「例如」，不冒充穷举 |
| ⑤ 需求行只有引语、无需求档条目号 | §6.61 开篇需求行 | 「**需求** = `docs/core/requirements/AGENT-LOOP.md` §4.7 `F3`（子代理携文档坐标；条目句 =「未声明与读不出两种状态必须可区分」）。该条目由父侧本批派单落地（用户 2026-11-11 02:20「…」→ 02:22「我觉得要」）。」——**需求层有条目**，故按兄弟节（§6.59 引 `AGENT-LOOP.md` §4.20 ∥ §6.60 引 `DOC-GRAPH.md` §4 AC-10）的形补条目号，不登记「需求层缺条目」 |

**本轮读数（命令 + 结论；绝对值只住本段）**：

- 源证（`docs/core/requirements/AGENT-LOOP.md`）：`### 4.7 子代理观测 / 注入` 节内 `| F3 | 子代理携文档坐标 | As a 子代理，我需要知道本项目声明的文档层住在哪里（`requirements` ∥ `design` ∥ `batches`）……**未声明与读不出两种状态必须可区分**（前者明写未声明，后者不注入）` ⇒ ⑤ 的条目号实存，非推断。
- `doc_check(mode:"gate", docs:["docs/core/design/AGENT-LOOP-SUBAGENT.md"])` ⇒ 首行 `DOC-CHECK GATE: PASS`，`0 段有问题（1 档全清）`。
- 计数（量法 = `node` 行扫描，一次跑出）：§6.61.6 数据行 **12**（编号 1–12 连续）· §6.61.5 AC 行 **8** · `### 6.61.x` 三级标题 **9** · §6.61.3 受影响表档行 **4**。
- 退役措辞扫描（同一次 `node` 行扫描，正则 `改前态|现盘先红|去掉它后首块`）⇒ **0 命中**（改前这三串分别住 AC-DC-8 括注、旧用例 11 行、旧用例 12 行）。

**三处自洽检查**：① 引用集 ↔ 标题集——本轮新引 `docs/core/requirements/AGENT-LOOP.md` §4.7 `F3` ∥ `§6.26 U10` ∥ `AC-DC-4` ∥ `AC-DC-5` 均实存（前两条本轮实读，后两条本档内实存）；§6.61 仍九节齐备；② 表行 ↔ 计数——用例表仍 12 行（本轮只改第 12 行内容，不增删）、AC 仍八条（无新增 / 删除）、§6.61.3 表仍 4 行；③ 断言 ↔ 实测——上面四条读数均为本轮实跑 / 实读。

**上抛项**：1–3 已结；4（`thincoder-core/agent-tools/subagent-spawn.mjs` 越 500 软线的拆分排期）仍待父侧定；5 ∥ 6（`thincoder-core/manifest-discovery.mjs` 注释面口径 ∥ `docs/core/design/MANIFEST.md` §2.2 未点名调用点）仍待父侧排期——均在本轮写域之外，本轮零触。

## §3 设计评审（评审子代理）
**状态行**：评审通过（第 6 轮：0 🔴 · 5 🟡 · 4 🔵，九条均不阻断；盘面对齐三处与用例↔单测一对一为范围外未核项）



### 轮次 1（评审子代理）

| # | 严重度 | 状态 | 证据（指针） |
|---|---|---|---|
| 1 | 🔴 | 待处置 | §6.61.5 AC-DC-5「四块齐」+ §6.61.6 用例 8；`thincoder-core/agent/spawn-child.mjs` `gateEngCoderSpawn`「if (role !== "explore") {」「return attempt」；`thincoder-core/agent-tools/subagent-spawn.mjs`「const batchBound = engineeringRole \|\| (role === "coder" && !!batchDocAbs)」与 `if (engineeringRole)` / `else if (role === "coder")` 两支赋 `batchDocAbs` ⇒ 工程角色恒无审计块、审计子代理恒无批档行，四块不可共存 |
| 2 | 🔴 | 待处置 | §6.61.3「**层级结论**：无档跨层，无拆分计划」；`doc_check(mode:"report", lines:["thincoder-core/agent-tools/subagent-spawn.mjs"])` 读数「501  thincoder-core/agent-tools/subagent-spawn.mjs  · 越 500 软线（主动审视）」；姊妹节 §6.60.3 有「**量法** = `doc_check(mode:"report", lines:[…])`」，§6.61.3 无 |
| 3 | 🟡 | 待处置 | §6.61.2 ②「**文本（逐字**；英文——与兄弟块同语体**）**」与 `PROJECT-MANIFEST.json` 实值（「"docs/RELEASE.md"」、design 六根）；AC-DC-1「逐字等于契约 ② 的形」无确定期望串 |
| 4 | 🟡 | 待处置 | §6.61.2 ③「missingKeys 含 `docRoot.<键>`」/「`manifest.docRoot[键] === null`」两格无观察场景、无复现命令；§6.61.6 用例 7 无依据点名 |
| 5 | 🟡 | 待处置 | `docs/core/design/MANIFEST.md` §2.7 第 8 行「读不出 ⇒ 该项零贡献」 vs §6.61.2 ④「⇒ 不推块」/ §6.26 第 16 行「读不出不推块」——「该项」两读 |
| 6 | 🟡 | 待处置 | §6.61.3 受影响文件表无改面单测档；§6.61.5「与批档同名同目录的那个单测档（`node --test` 一个目标）」无具名目标、该档档位未判 |
| 7 | 🟡 | 待处置 | §6.26 第 16 行「**未注入**（`docRoot` 此前无子代理消费点）」 vs 同档 §6.60.2 ① 五段皆挂 `manifestReadTool` + `docs/core/design/MANIFEST.md` AC-42；设计未述注入相对既有 `manifest` 读工具的增量 |
| 8 | 🟡 | 待处置 | §6.61.2 ⑦ 代价只记档读、未记注入 token；本仓 requirements 六根 / design 六根 ⇒ 行长数倍于契约 ② 示例，与 KD-DC3 立论并读 |
| 9 | 🔵 | 可选 | §6.61.9「被破坏的现有行 = **0 条**（实施轮复核一遍…）」；`thincoder/test` 内 `_spawnSystemBlock` 零命中，0 条已可当轮证成 |
| 10 | 🔵 | 可选 | 新名 `docsCoordinatesBlockOf` 三问散在 §6.61.1 最近先例 + §6.61.2 ⑤，未成行（对照 §6.60.1 / §6.26「既有件三问」） |
| 11 | 🔵 | 可选 | 用户 02:20 问句含 advisor 侧；§6.61.7 边界 2 只写「父侧明令不动」，未点 `thincoder-core/advisor/project-context.mjs` 已承该半 |

**判别面核查（正面结论：KD-DC2 成立，默认值/缺键可区分）**——四处读数：

- `readManifest` 返回「missingKeys: first.missingKeys」，且 `const manifest = fillDefaults(obj)` 在后 ⇒ 缺键判在原始档上。
- `validateManifest` 产「missingKeys.push(nested)」（整键缺/非对象）与点形子键两形。
- `fillDefaults`「if (sub in src) out[key][sub] = src[sub]」保 `null`；`docRootPaths`「if (value === null) return []」。
- `docRootBase` 与 `writeRoot` 同式（`resolveProjectRoot(cwd) ?? resolve(cwd ?? ".")`）⇒ 基数同源。

VERDICT: changes-required

计数：🔴 2 · 🟡 6 · 🔵 3

### 轮次 2（评审子代理）

| # | Orig# | 严重度 | 状态 | 证据（指针） |
|---|-------|--------|------|--------------|
| 1 | 1 | 🔴 | Fixed | `docs/core/design/AGENT-LOOP-SUBAGENT.md` §6.61.5 AC-DC-5 拆为甲/乙两条可达复合态；乙可达性 = `thincoder-core/agent/spawn-child.mjs` `gateEngCoderSpawn`「if (parentRole === "eng-designer") return null」与「return attempt」 |
| 2 | 2 | 🔴 | Fixed | §6.61.3「**量法** = `doc_check(mode:"report", lines:[…])`」+「**读数结论**：…**越 500 软线**（绝对值按上一条量法取，不进本节）」+「**主动拆分审视，结论 = 不拆**」；复核读数 = 501 越软线 |
| 3 | 3 | 🟡 | Fixed | §6.61.2 ② 拆「形 + 逐字前缀」，示例标「示例值不是本仓实值」并绑 AC-DC-1 的夹具 F1 |
| 4 | 4 | 🟡 | Fixed | §6.61.2 ③ 增「这一格管的输入」列 + 复现 ①–③ 代码块；②「三层全未声明**不另设分支**」 |
| 5 | 5 | 🟡 | Fixed | `docs/core/design/MANIFEST.md` §2.7 第 8 行「读不出 ⇒ **整块不推**（三层一行都不出现）」 |
| 6 | 6 | 🟡 | Fixed | §6.61.3 表增 `docs/batches/<batch record name>.test.mjs`；§6.61.5 具名同档且 `node --test` 只跑该目标 |
| 7 | 7 | 🟡 | Fixed | §6.26 第 16 行「**未自动注入**——五个 depth>0 段各挂 `manifestReadTool`」；§6.61.1「相对既有 `manifest` 读工具的增量」 |
| 8 | 8 | 🟡 | Fixed | §6.61.2 ⑦「档读」∥「注入 token」∥「不设根数上限」三条 |
| 9 | 9 | 🔵 | Fixed | §6.61.9「**0 条**——本批**已核**…此项不再是实施轮复核项」 |
| 10 | 10 | 🔵 | Fixed | §6.61.1「既有件三问（本批新增名）」三行表 |
| 11 | 11 | 🔵 | Fixed | §6.61.1「**advisor 侧各有其主**…那一半由它承」 |
| 12 | (new) | 🔵 | Open | §6.61.5 AC-DC-4「**红侧三格**：无档 ∥ 坏 JSON ∥ 读抛」而 §6.61.6 只有第 5/6 行（无档 ∥ 坏 JSON）——读抛格无用例行 |
| 13 | (new) | 🟡-可选 | Open | §6.61.3「**上抛**：该档越软线的拆分排期归父侧」= 协调项，非缺陷 |

计数：复核项 11/11 = Fixed；未决 🔴 0；必改 🟡 0；🔵 1；🟡-可选 1。

VERDICT: pass

### 轮次 3（评审子代理）

> 状态行重置：第 3 轮打回（changes-required）· 上一轮状态行 = 评审通过 → 进行中 · 2026-11-11

### 轮次 3（评审子代理 · 实施轮自审）

| # | 严重度 | 状态 | 证据（指针） |
|---|--------|------|--------------|
| 1 | 🔴 | Open | 同一机制两处活描述相左：§6.26「零回归：`_spawnSystemBlock` 为 null ⇒ 拼接分支不进入 ⇒ depth-0 / explore / plan / coder / consult 的 system 逐字节同改前」∥ 用例 U9「`_spawnSystemBlock` 逐字节 = `Batch record (batchDoc): <abs>`（S4 未推块）」∥ AC「A23-8「`files` 空 / 未传 ⇒ `_spawnSystemBlock` 逐字节同改前（U9——零回归）」」，vs §6.61.2 ①「角色无关：任何 `depth>0` 角色都收本行」，实现 `thincoder-core/agent-tools/subagent-spawn.mjs`「if (docsBlock) spawnBlocks.push(docsBlock)」 |
| 2 | 🟡 | Open | §6.61.5 AC-DC-5 乙「块内无 `Batch record (batchDoc):`」在「审计块零改」前提下不可达：`thincoder-core/agent-tools/audit-block.mjs`「`Batch record (batchDoc): ${batchDoc}\n` +」无条件拼入；单测已按块级口径落地并注明「审计块模板**自身**带 `Batch record (batchDoc): <abs>` 一句」 |
| 3 | 🟡 | Open | §6.61.6 用例表止于第 8 行（「审计子代理（`eng-coder` 父 + `role` = `explore`）+ `files`」）；交付单测 11 格，其中「契约 ③ 整键格 docRoot 整键缺 ∥ 非对象 ⇒ 三层皆 (undeclared)」与「AC-DC-4 红侧三格：manifest 读抛」无表行；单测首注只说「表里缺的一格「manifest 读抛」」 |
| 4 | 🟡 | Open | 越单：`thincoder-core/agent/setup.mjs`「子代理可有可无该块：四块里一个都没推 ⇒ 同样不进。」（本批必改的枚举句）不在 §6.61.3 受影响文件表（该表只列 `thincoder-core/agent-tools/subagent-spawn.mjs` ∥ 设计档 ∥ 单测档） |
| 5 | 🔵 | Open | `docsCoordinatesBlockOf` 的护栏只包一行：`try {` 之内为「read = readManifest(cwd)」；`const base = docRootBase(cwd)` ∥ `docRootPaths(...)` ∥ `relative(...)` 在 try 之外 ⇒「读不出不赔掉一次 spawn」的宽度 = try 块宽度 |
| 6 | 🔵 | Open | §6.61.1「**做法**：`buildSpawnChild` 的固块收集点推第五块（S5）」——收集点现为四块，`S5` 是站点号；读成块计数会与 `thincoder-core/agent/setup.mjs`「四块」相左 |
| 7 | 🔵 | Open | 单测前置「夹具须处于「无档」态（临时目录祖链上无 PROJECT-MANIFEST.json）」= 环境依赖（非确定性；已有前置断言自护，故只作提示） |
| 8 | 🔵 | Open | `thincoder-core/agent-tools/subagent-spawn.mjs` 仍越 500 软线（拆分排期已由 §2 上抛项 4 登记，本评审判定排除，仅登记读数不重判） |

正面读数（KD-DC2 判别成立、三块零改零换序、`test/` ∥ `bench/` 无 `_spawnSystemBlock` 断言）逐条见报告正文。

VERDICT: changes-required

计数：🔴 1 · 🟡 3 · 🔵 4

### 轮次 4（评审子代理）

| # | 严重度 | 状态 | 证据（指针） |
|---|---|---|---|
| 1 | 🔴 | 待处置 | `docs/core/design/AGENT-LOOP-SUBAGENT.md` §6.61.2 ④「它同样读盘、同样可能抛」 ⟷ `docs/core/design/MANIFEST.md` §2.2 `projectRootView` 条「非抛错 / 零写」· `discoverProjects` 条「**不抛**（锚不可读 ⇒ `none`）」——同一条项目根解析链两处相反；`thincoder-core/manifest-discovery.mjs` 的 `owningProject` 内 `statSync(dir, { throwIfNoEntry: false })` 无护栏 ⇒ 读盘链确可上抛，MANIFEST.md 成为第二份活描述，护栏宽度无权威读数 |
| 2 | 🟡 | 待处置 | §6.26「null 两形…（manifest 读不出 ∧ 无 `files` ∧ 非工程角色）」与 U5 同句：`thincoder-core/agent-tools/subagent-spawn.mjs` 的 `const batchBound = engineeringRole \|\| (role === "coder" && !!batchDocAbs)` ∥ `if (engAuditAttempt !== null) spawnBlocks.push(buildAuditBlock(ctx))` ⇒「非工程角色」不蕴含「无批档行 ∥ 无审计块」；A23-4 经 U5 继承该不充分枚举 |
| 3 | 🟡 | 待处置 | §6.26 A23-5「分类裁定表 15 行」——同表已含「文档坐标行（S5）」一格，实为 16 格 |
| 4 | 🟡 | 待处置 | §6.61.5 AC-DC-4 第三格「读抛」无触发手段（另两格给了夹具）；§6.61.2 ④ 扩宽的护栏面（`docRootBase` ∥ `docRootPaths` ∥ `relative`）无对应验收行；§6.61.6 用例行 9（`docRoot` 整键缺 ∥ 非对象）在 AC-DC-1–AC-DC-6 内无落点 |
| 5 | 🔵 | 登记 | §6.26 U9 期望「批档行与文档坐标行照旧在位」以 manifest 可读为条件，输入列未载该夹具条件 |
| 6 | 🔵 | 登记 | §6.61.5 AC-DC-5 乙的「首块不以…开头」弱于「无独立批档行块」；`thincoder-core/agent-tools/audit-block.mjs` 的块形（块头「Audit scope — mechanical context」+ 模板自带 `Batch record (batchDoc):` 行）已核对 **对得上**，可直接改断块数 = 3 |

VERDICT: changes-required

计数：🔴 1 · 🟡 3 · 🔵 2 · 合计 6。

### 轮次 5（评审子代理）

| # | 严重度 | 状态 | 证据（指针） |
|---|---|---|---|
| 1 | 🔴 | 已闭（旧 1） | `docs/core/design/MANIFEST.md` §2.2 `projectRootView` 条「零写 · **状态面不抛**……I/O 异常照原样上抛」＋ `owningProject` 条新增「I/O 异常上抛（无护栏）」段（`statSync(dir, { throwIfNoEntry: false })` 对比 `scanChildren` 的 `} catch { return [] }`）∥ `docs/core/design/AGENT-LOOP-SUBAGENT.md` §6.61.2 ④「口径**单源** = `docs/core/design/MANIFEST.md` §2.2 `owningProject` 条」——两档同口径，代码面 `thincoder-core/manifest-discovery.mjs` 的 `owningProject` 确实无护栏 ⇒ 口径与实现一致 |
| 2 | 🔴 | 已闭（旧 1 连带面） | 八处（启动流程图注 ∥ `projectView` ∥ `resolveEngineeringManifest` 与「树体不抛状态错」∥ §2.5 读侧单点 ∥ KD-M1-20 ∥ KD-M1-24 ∥ §2.8 接口行 ∥ §2.9「I/O 异常除外——`owningProject` 无护栏」）全改；该档「非抛」零命中；余下「不抛」两处经核非残留：`discoverProjects` 条（`existsSync` ＋ `scanChildren` 护栏，不走本链）与钩子 / AC 面（按态限定） |
| 3 | 🟡 | 已闭（旧 2） | `docs/core/design/AGENT-LOOP-SUBAGENT.md` §6.26「**depth>0 但四格全空**（`batchBound` 为假 ∧ `engAuditAttempt === null` ∧ `files` 空 ∥ 未传 ∧ 文档坐标块不推）」＋「**四格要逐格写，不能压成「非工程角色」**」；U5 ∥ A23-4 同词 |
| 4 | 🟡 | 已闭（旧 3） | §6.26 A23-5「分类裁定表 **16** 行逐处有裁定」——表实 16 格（第 11 格「同类已解」、第 16 格「文档坐标行（S5）」） |
| 5 | 🟡 | 已闭（旧 4） | §6.61.5 AC-DC-4 第三格给出触发手段（`PROJECT-MANIFEST.json` 造成目录 ⇒ `EISDIR`，先例 `docs/core/design/MANIFEST.md` AC-57）；新增 AC-DC-7（整键格——`thincoder-core/manifest-schema.mjs` 的 `missingKeys.push(nested)` 只推整键名、不产 `errors` ⇒ `ok` 仍真，可执行）与 AC-DC-8 ＋ 用例 11 |
| 6 | 🔵 | 已闭（旧 5） | §6.26 U9 输入格补「夹具 = 临时项目目录，带可读 manifest 且三层已声明」 |
| 7 | 🔵 | 已闭（旧 6） | §6.61.5 AC-DC-5 甲 / 乙 均「**恰三块**」，乙另给「判法 = 块数 3（多一块批档行就是 4）+ 首块块头为审计块头」 |
| 8 | 🟡 | 新出 | `docs/core/design/AGENT-LOOP-SUBAGENT.md` §6.61.2 ①「可达的完整集只有两条：工程角色 + `files` ⇒ [批档行, 写域行, Docs 行]」与同档 §6.26 U10「explore spawn 带 `files`（无 `batchDoc`、无审计）」冲突——该格可达集 = [写域行, Docs 行]；「只有两条」应为「三块态只有两条」 |
| 9 | 🟡 | 新出 | §6.61.3 受影响表对 `thincoder-core/agent-tools/subagent-spawn.mjs` 只列三项（新增函数 ∥ 一行推块 ∥ 注释补 S5），未列 AC-DC-8「**现盘先红**：`try` 只包 `readManifest`，基数与路径映射在护栏之外」所需的护栏改写——盘上 `const base = docRootBase(cwd)` 仍在 `try` 之外 |
| 10 | 🟡 | 新出 | `thincoder-core/manifest-discovery.mjs` 的 `projectRootView` 注释仍写「**非抛错 / 零写**；`resolveProjectRoot` 薄委托本函数。」——第三份活描述仍在，且 §6.61.3 受影响表未列该档，「只剩一个口径」在代码注释面尚未成立 |
| 11 | 🟡 | 新出 | `docs/core/design/MANIFEST.md` §2.2 `owningProject` 条 I/O 段的「调用点要「绝不赔掉一次调用」，护栏自己包」未点名任何调用点；钩子段「**工作区 / 档非法 / 建档失败 → 不抛**」与 AC-22 的 `attachManifest` 不抛都不含 I/O 腿 ⇒ 用户裁定「不砖死」在这一格无护栏归属 |
| 12 | 🔵 | 新出 | §6.61.6 用例 9 即 AC-DC-7 的那一格，期望格未带 `(AC-DC-7)` 回指（其余各行皆带） |
| 13 | 🔵 | 新出 | §6.61.5 AC-DC-8 判据 = 源码面「切出 `docsCoordinatesBlockOf` 函数体后断三处调用的位置」——随函数体改写即漂（先例 = `docs/core/design/MANIFEST.md` AC-58⑦ 源码面验收） |

VERDICT: pass

计数：🔴 0 未闭 · 🟡 4（报告面，不阻断）· 🔵 2 · 旧条目 7 条全闭（6 条已改 + 连带面复核）。

### 轮次 6（评审子代理）

| # | 严重度 | 状态 | 证据（指针，非行号） |
|---|---|---|---|
| 1 | 🟡 | 待处置（不阻断） | `docs/core/design/AGENT-LOOP-SUBAGENT.md` §6.61.5 AC-DC-8 红侧括注「（改前态，设计时实读）」× §6.61.3「新增局部纯函数 `docsCoordinatesBlockOf(cwd)`」——本批新增函数无「改前」的窄护栏形，比较基准未写明 |
| 2 | 🟡 | 待处置（不阻断） | 同档 §6.61.6 用例 12「去掉它后首块仍为批档行」——对成品串剪接即可满足，未独立证明既有三块集合与相对序零变 |
| 3 | 🟡 | 待处置（不阻断） | 同档 §6.61.2 ① 三块态触发形「工程角色 + `files` ⇒ [批档行, 写域行, Docs 行]」，而同一句引的 `batchBound` 谓词含绑定 `coder`（§6.26 缓存契约兼容证明段「带绑定的 `coder` 不是工程角色、却推批档行」） |
| 4 | 🟡 | 待处置（不阻断） | 同档 §6.61.2 ①「三块之外还有**两块态**：非工程父下的 `explore` + `files` 收 [写域行, Docs 行]」——该句读作穷举，同一组谓词还产出别的两块态 |
| 5 | 🟡 | 待处置（不阻断） | 同档 §6.61「**需求** = 父侧本批派单（用户 2026-11-11 02:20…）」——只有会话引语、无需求档条目号；兄弟节 §6.59 引 `docs/core/requirements/AGENT-LOOP.md` §4.20、§6.60 引 `docs/core/requirements/DOC-GRAPH.md` §4 AC-10 |
| 6 | 🔵 | 记录 | 同档 §6.61.5 AC-DC-8「切出 `docsCoordinatesBlockOf` 函数体后断三处调用的位置」——源码文本形断言，行为等价的改写会翻转读数 |
| 7 | 🔵 | 记录 | 同档 §6.61.1 既有件三问表「「未声明」判别」行——以表内序位指路 `docs/core/design/MANIFEST.md` §2.7 全消费面，上游插行即漂 |
| 8 | 🔵 | 记录 | 同档 §6.61.6 用例 2「夹具 F1 的 `design` 改回单串」——全表唯一无 AC 回指行 |
| 9 | 🔵 | 记录 | 同档 §6.61.2 ②「结果为空（声明路径 = 项目根自身）呈现为 `.`」——无用例、无 AC 的格式分支 |

未核（评审范围外，非发现）：盘面对齐三处（AC-DC-8 红侧实形 ∥ §6.61.3 受影响表护栏行 ∥ 用例 12 断言）、「用例表 12 行 ↔ 单测档 12 格」一对一、受影响档档位抽查——证据在 `thincoder-core/agent-tools/subagent-spawn.mjs` 与 `docs/batches/<batch record name>.test.mjs`，不在本轮评审范围，由 §5 实施记录面闭合。

VERDICT: pass
计数：🔴 0 · 🟡 5 · 🔵 4（九条均不阻断；本轮无新发现）

## §4 用户批准（主 agent）

**批准依据（用户原话，逐字）**

> 后续你都自动推进走完吧

（2026-11-11 02:58 —— 批次级全权：评审 ∥ 实施 ∥ 收口不再逐项请示；四种情况除外：🔴 改不动 ∥ 须偏离已批设计 ∥ 用户喊停 ∥ 范围变更。）

**本批落在这条之内**：设计评审第 6 轮 pass（0 🔴），实施按已批设计落地、无偏离，范围未变，用户未喊停 ⇒ 批准 = 上述批次授权，本批不另请一次。

**同批的口径裁定（用户逐字，2026-11-11 03:09）**

> 我觉得我中间别为代码长度纠结了，就设计器判一次，收口检查判一次，中间其他地方对代码长度的检查一概都取消，这样最干净。

⇒ 本批 `subagent-spawn.mjs` 的 500 行判读只发生在设计时（§6.61.3 已给分拆方案），中间环节不判；收口判 800（该档 558 行，未越）。

## §5 实施记录（eng-coder）
**状态行**：实施完成（AC-DC-1–AC-DC-5 ∥ AC-DC-7 ∥ AC-DC-8 落地；终态 clean；遗留 4 条全为设计席笔 / 收口席动作）



## 实施记录（eng-coder · 2026-11-11）

**本席接手的盘面**：本批主机制（`docsCoordinatesBlockOf` + 一行推块 + 收集序注释）已由前一轮落盘于提交 `7aad8121`；`thincoder-core/agent/setup.mjs` 的注释面枚举（「批次档路径行 / 审计模板 / 写域行 / 文档坐标行」+「四块里一个都没推 ⇒ 同样不进」）亦已在盘。本席本轮做的是**设计与盘面之差的那一格**（§2 修正轮 3 记的 AC-DC-8「现盘先红」）与随之的断言面补齐。

### 本批条目（5 条，逐条对照）

| # | 条目 | 状态 | 落点 / 读数 |
|---|---|---|---|
| 1 | 子代理 system 面多一行文档坐标（三层，项目根相对） | ✅ 已实现 | `thincoder-core/agent-tools/subagent-spawn.mjs` 的 `docsCoordinatesBlockOf` + 收集点一行推块；用例 1 ∥ 2 逐字断言（AC-DC-1） |
| 2 | 未声明的层呈现 `(undeclared)`，不回落默认档 | ✅ 已实现 | 判别取 `readManifest(...).missingKeys`（原始档算得）；用例 3 带红侧对照（同一原始档经 `fillDefaults` 给的正是被禁的 `docs/design`），用例 4 断显式「本面无」（`null`）同呈现（AC-DC-2 ∥ 3）；整键格两个夹具各取「逐字未声明 + 全文不含默认路径」两断言（AC-DC-7） |
| 3 | manifest 读不出（无档 ∥ 坏 JSON ∥ 读抛）⇒ 不推块、spawn 照常 | ✅ 已实现 | 三格各一次真读盘夹具（无档 ∥ 坏 JSON ∥ `PROJECT-MANIFEST.json` 造成目录 ⇒ EISDIR），均断「块内无 `Docs (`」∧「批档行照旧」（AC-DC-4） |
| 4 | 既有三块零改、零换序，本行追加在尾 | ✅ 已实现 | 用例 7（甲）/ 8（乙）各断「恰三块 + 首块块头 + 相对序」；三处推块语句本轮零触（AC-DC-5） |
| 5 | `docRoot` 消费面清单登记本消费点 | ✅ 已就位（设计席笔） | `docs/core/design/MANIFEST.md` §2.7「全消费面清单（8 处）」第 8 行 + 同节「本面无」读数 S5 一格 |

### 本席改的两个文件（逐处与理由）

| 文件 | 改动 | 理由（依据） |
|---|---|---|
| `thincoder-core/agent-tools/subagent-spawn.mjs` | `docsCoordinatesBlockOf` 的护栏从「只包 `readManifest` 一句」加宽为**整段坐标计算**（`readManifest` ∥ `docRootBase` ∥ `docRootPaths` ∥ `relative` ∥ 串拼装全在 `try {` 之内），`catch` 收成 `return null`；函数头注释补「护栏宽度 = 整段坐标计算」段 | 设计 §6.61.2 ④「护栏宽度 = 整段坐标计算……不是只包 `readManifest` 那一句」+ AC-DC-8；该条设计明记「**现盘先红**」= 实施轮必改项 |
| `docs/batches/2026-11-11-p2-7-subagent-docroot-coordinates.test.mjs` | ① 新增用例 11（AC-DC-8 源码面结构断言：切出函数体 → 三处调用须在 `try` 块内，且**护栏前后的 prologue / epilogue 两面都不得有**）；② 整键格用例改为两夹具各取两断言（逐字未声明 + 全文不含默认路径，AC-DC-7 的「两断言并取」）；③ 甲 ∥ 乙用例各加「恰三块」计数（`blockCount`，块头只按「块首」计，审计块模板自带的 `Batch record (batchDoc):` 一句只隔单个换行、不数成独立一块）；④ 「零回归」格的断言说明收窄到它真正证明的事 | 设计 §6.61.5 AC-DC-7 ∥ AC-DC-8、§6.61.6 用例 9 ∥ 11；修正轮 3 🔵6「AC-DC-5 甲/乙 同加『恰三块』」 |

**未改（标明边界）**：设计档两处（设计席笔，见下「遗留」）· `thincoder-core/agent/setup.mjs`（盘上已就位，本轮零触）· `thincoder-core/manifest.mjs` ∥ `manifest-schema.mjs`（零新解析、零新导出）· `thincoder-core/advisor/project-context.mjs`（父侧明令冻结）。

### 读数（命令 + 结论；绝对值只住本段）

- `node --test docs/batches/2026-11-11-p2-7-subagent-docroot-coordinates.test.mjs`（cwd = 仓根）⇒ `tests 12 · pass 12 · fail 0`。
- **红侧（同一档、改动前）**：加宽前该档读作 `pass 11 · fail 1`，失败行 `AssertionError: docRootBase(）须在 try 块内——护栏宽度 = 整段坐标计算` ⇒ 用例 11 在真事上先红、改后转绿，不是一句同义反复。
- `doc_check(mode:"gate", docs:["docs/core/design/AGENT-LOOP-SUBAGENT.md", "docs/core/design/MANIFEST.md", "docs/batches/2026-11-11-p2-7-subagent-docroot-coordinates.md"])` ⇒ 首行 `DOC-CHECK GATE: PASS`，`0 段有问题（3 档全清）`（AC-DC-6）。
- `doc_check(mode:"report", docs:["docs/core/design/AGENT-LOOP-SUBAGENT.md"], lines:["thincoder-core/agent-tools/subagent-spawn.mjs","docs/batches/2026-11-11-p2-7-subagent-docroot-coordinates.test.mjs"])` ⇒ 行数读数 `558 thincoder-core/agent-tools/subagent-spawn.mjs · 越 500 软线（主动审视）` ∥ `314 docs/batches/<批档同名>.test.mjs`；合计「越硬限 0 · 越软线 1 · 未越线 1」。按用户 2026-11-11 裁定（实现 / 收口 / 评审只查 800 硬线，超了才拆）⇒ 558 未越硬线，本席不拆；500 软线的拆分排期 = §2 上抛项 4，父侧定。
  - **更正留痕**：本段初稿此条写的是「未越 1999 行档位的 800 硬线」，那是未跑命令的转述（错读数）——现改为上面这次实跑的输出。留痕的理由：读数的来源必须可复跑，改法不能变成把错句悄悄换成对句。
- `grep _spawnSystemBlock`（`test/` ∪ `thincoder-core/` 全域，`.mjs/.ts/.js`）⇒ 命中 3 处，全在产品档（`thincoder-core/agent/setup.mjs` ∥ `thincoder-core/agent-tools/audit-block.mjs` 注释 ∥ `thincoder-core/agent-tools/subagent-spawn.mjs`）；`test/` 下零命中 ⇒ 设计 §6.61.9「被破坏的现有行 = 0 条」独立复核成立。

### 决策披露（实施席自决项，逐条给理由）

| 决策 | 处置 | 理由 |
|---|---|---|
| 加宽后的 `catch` 形态 | 裸 `catch { return null }`（不按 `e.code` 分流） | 设计契约 ④ 的承诺面就是「读抛 ⇒ 不推块」，且 KD-DC4 已给「业务结果零变」的理由（不加本行 = 本批之前的行为）。按 `e.code` 分流会引入设计未定的第三态；可观测性缺口已作为 🔵 进报告交给父侧/设计席 |
| 断言「护栏外两面」 | 补 prologue（`try {` 之前）一侧，与 epilogue 并取 | 评审席指出只看 `catch` 之后的话，`try {` 上方留一份同调用仍会绿——判据的完备性缺口，就地补 |
| 「零回归」格的字节面主张 | 收窄断言说明，不造改前快照 | 本档没有改前三块的快照，`startsWith` 证不到「逐字未动」；宁可让说明等于它证的事，不让一句话看起来锁住了字节面 |
| 单测档当前位置 | 保留在 `docs/batches/<批档同名>.test.mjs`，收口删除 | 设计 §6.61.3 ∥ §6.61.5 明定此位；「用毕即删」的动作归收口席（见遗留 3） |

### 审计与评审轮次（本席内部两轮）

| 轮 | 类型 | 结论 | 处置 |
|---|---|---|---|
| 1 | 内部发散审计（`explore`，只读，对批档 §2 + 设计 §6.61） | `DEVIATIONS`：🟡×2（设计档未随交付收正：§6.61.5/§6.61.6 的「现盘先红」；§6.61.3 受影响表缺护栏加宽）+ 🔵×1（AC-DC-7 的两断言只施加到一个夹具）；无 🔴；OUT-OF-LIST 零 | 🔵 就地修（两夹具各取两断言）；两处 🟡 属设计席笔 ⇒ 不改档，落「遗留」上抛 |
| 2 | 内部代码评审（`advisor` `type="code"`） | `VERDICT: pass`，无 🔴；🟡×4（全为报告面/断言强度）+ 🔵×2 | 其中 2 条在实施席笔内（护栏外只查 `catch` 之后 ∥「零回归」格主张超出断言）⇒ 本轮就地修并复跑；另 2 条属设计档 ⇒ 上抛；余 2 条 🔵 未动（裸 `catch` 的可观测性需设计席先改契约 ④；AC-DC-8 的行为半条，设计已把它定为结构断言） |

**终态 = `clean`**：两个内部轮次的笔内项已闭，复跑 `pass 12 / fail 0`；未闭项全部为设计席笔或父侧排期，已逐条列为遗留。

### 遗留（上抛父侧 / 设计席；本席不改档）

1. `docs/core/design/AGENT-LOOP-SUBAGENT.md` §6.61.5 AC-DC-8 判据列与 §6.61.6 用例表第 11 行仍写「**现盘先红**：`try` 只包 `readManifest`」/「（AC-DC-8；现盘先红）」——与交付后盘面相反（现盘三处调用都在 `try` 内）。设计席收正。
2. 同档 §6.61.3 受影响文件表 `subagent-spawn.mjs` 一行只列三项，缺本轮实改的「护栏加宽」（§3 轮次 5 第 9 条已登记，现状仍开）。设计席补行。
3. 单测档 `docs/batches/2026-11-11-p2-7-subagent-docroot-coordinates.test.mjs` 现为**已被 git 跟踪**的文件（随提交 `7aad8121` 入库）。「收口随批删除、零留存」需 `git rm`（`delete` 工具对已跟踪档需显式授权），动作归收口席。
4. 本轮新增/强化的断言（用例 11、恰三块计数、整键格两夹具）未进 §6.61.6 用例表——表由设计席维护；若要与交付单测一一对应，请设计席按「表 11 行 ↔ 档 12 格（表外一格 = 零回归）」对账。
5. §2 上抛项 4（`thincoder-core/agent-tools/subagent-spawn.mjs` 越 500 软线的拆分排期）本席不动，按父侧排期。

## §6 验证与收口（父代理）

**验证结论（父侧亲跑，2026-11-11 03:18）**

```
node --test docs/batches/2026-11-11-p2-7-subagent-docroot-coordinates.test.mjs
tests 12 · pass 12 · fail 0 · duration_ms 559
```

红侧先取（实施席读数，§5 在案）：加宽前 `pass 11 · fail 1`，失败行点名 `docRootBase` 须在 try 块内 ⇒ 这条断言能判红，不是跑一遍全绿。

**单测档收口删除**：`git rm docs/batches/2026-11-11-p2-7-subagent-docroot-coordinates.test.mjs` —— 该档随 `7aad8121` 入过库，本笔 `rm` 让它回到「零留存」。§5 留一行读数即可。

**复核过的三处盘面**

- `docsCoordinatesBlockOf` 的 `try` 覆盖 `readManifest` ∥ `docRootBase` ∥ `docRootPaths` 三处调用，`catch` 收 `return null` ⇒ AC-DC-8 成立。
- `_spawnSystemBlock` 在 `test/` 下零命中、3 处全在产品档 ⇒ 设计 §6.61.9「被破坏的现有行 = 0 条」独立成立。
- 行数读数：`thincoder-core/agent-tools/subagent-spawn.mjs` = 558 行。按用户 03:09 口径：设计时判 500（§6.61.3 已给分拆方案），收口判 800（未越）⇒ 本批无拆分动作。

**doc-check gate**：本批档 §1–§6 六段全绿，末笔 §4 回执 `DOC-CHECK GATE: PASS · 范围 2 档`。

**台账**：本批覆盖行 `#2320` 随本笔收口（在途 → 待核销 → 已核销）；`#2321` 已于 02:39 按口径变更撤销（已废弃，不再是债）。

**未做（明确记录，不留在报告散文里）**：`owningProject` 的护栏（§1 裁定另开批）· `catch` 按 `e.code` 分流（会引入设计未定的第三态，留给设计席先改契约 ④）。

**deferred-batch re-check**：无暂缓批次命中本批收口条件。
