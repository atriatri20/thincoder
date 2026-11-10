# 2026-11-11 · p2-7-subagent-docroot-coordinates
> 六段，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 每段只有一个作者：作者的段可 `append` 加内容、可就地改（`edit`）；非作者一概拒。
> 编制：主 agent · 2026-11-11 · 来源 = 用户 2026-11-11 02:20 提问「project-manifest 跟 advisor 和子 agent 是否应该建立关联？这样它们能知道哪类内容应该从哪里找」；02:22「我觉得要」。。
> 台账 = #2320（core · 归批）。前情 = 无（独立批）。
## §1 讨论（主 agent）
**状态行**：🔄 进行中（…）
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
**状态行**：设计完成（修正轮 2：§3 轮次 3 的 8 条逐条落盘 + §1 父侧裁定 AC-DC-5 乙（块级判法）已落）
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
| `docs/core/design/MANIFEST.md` | 设计档 | 本轮已写（§2.7 清单 7→8 + 第 8 行 + 「本面无」读数） |
| `docs/batches/<batch record name>.test.mjs` | 单测档（测试面） | 实施轮创建、自写自跑；收口随批删除（零留存，不进分层判断） |

**层级结论**：无档跨层，无拆分计划（设计 §6.61.3）。**单测** = 与批档同名同目录的单测档，实施轮自写自跑，收口删除；覆盖 AC-DC-1–AC-DC-5。
**集成** = 零行（设计 §6.61.9：不改变任何业务可观察结果，两侧入口皆不成立）。

### 验收对照

设计 §6.61.5 六条，逐条回指上表条目：AC-DC-1（条目 1）· AC-DC-2 ∥ AC-DC-3（条目 2，红侧两格）· AC-DC-4（条目 3，红侧三格）· AC-DC-5（条目 4）· AC-DC-6（文档门 = 全批）。

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

## §3 设计评审（评审子代理）
**状态行**：进行中（第 3 轮打回）



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

## §4 用户批准（主 agent）
## §5 实施记录（eng-coder）
## §6 验证与收口（父代理）
