# 2026-11-08 · doc-check-exclude-paths
> 六段，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 每段只有一个作者：作者的段可 `append` 加内容、可就地改（`edit`）；非作者一概拒。
> 编制：主 agent · 2026-11-08 · 来源 = 用户 2026-11-08 15:48「我希望能在project-mainifest里定义doc_check的排除目录.」· 15:50「排除目录就是排除目录,不要自己加戏.」。
> 台账 = #2195（core · 归批）。前情 = docs/batches/2026-11-08-doc-standard-sync-gate.md（已收口 2026-11-08）。
## §1 讨论（主 agent）
**状态行**：已收口 2026-11-08
<§1 模板占位：本批条目 / 关键判据 / 授权口径>

### 已定决定

- **已定决定**：在 `PROJECT-MANIFEST.json` 里给 `doc_check` 定义排除目录 · 用户原话：「我希望能在project-mainifest里定义doc_check的排除目录.」「排除目录就是排除目录,不要自己加戏.」 · 时间：2026-11-08 15:48 / 15:50

### 要做什么（只有这一件）

`doc_check` 判之前，把落在 manifest 声明排除目录里的档从判集里去掉。排除面写在 manifest 里，不写在调用参数里。

**不做的事**（用户明确说了别加戏）：
- 不加「排除前缀不得覆盖 `docRoot`」这类守卫；
- 不加排除数量的报告行以外的任何机制；
- 不改判据（阈值 ∥ 命中类 ∥ verdict 词一律不动）——**排除改的是判集，不是判据**。

### 两处必然跟着改的（因为它们是同一条规则的另外几层，D11）

1. **`docs/core/requirements/DOC-CHECK.md` 的 F3**：现文写「**无 `checkConfig`、无任何按项目的参数面**」。加了排除键之后这句就不成立——**它必须同一轮改**，否则需求档说着与实现相反的话。
2. **`PROJECT-MANIFEST.json` 的键面**：新键落在哪一层、叫什么名、校验怎么认，由设计席定。

### 事实（已核，供设计席起步）

- 现有 manifest 已有 `index.excludePaths`（`docs/core/design/_archive` ∥ `docs/core/requirements/_archive`）——**那是索引的排除面，`doc_check` 不吃它**。
- `doc_check` 当前读 manifest 只读一处：`docRootBaseKeys()` 取 `docRoot` 各键作同名候选的扫描根（`thincoder-core/doc-check/anchors.mjs`）。**判集本身来自调用方传的 `docs` 列表。**
- 所以落点是「取 manifest 的排除面 → 过滤调用方清单」这一处，判据本体零改。

### 第三条授权原话（补编制行未载的一句）

- **已定决定**：排除面写成覆盖全库就是全库不判，不设守卫 · 用户原话：「排除如果被定义成了全关,就要全关.」 · 时间：2026-11-08 15:52

**为什么单独补一条**：这句是 KD-Ex4 的依据（设计 §2.6 引作「用户原话」），而编制行的来源只载了 15:48 与 15:50 两句——**一句裁定的来源对不上，它就只是一句转述。**评审 §3 第 1 轮 #10 点的就是这处，落在这里补上。

**两条的关系**（写清，免得下一次又被当成重复）：
- 15:50 那句「排除目录就是排除目录,不要自己加戏」= **不要给排除加机制**（守卫 ∥ 提示 ∥ 额外开关）；
- 15:52 这句 = **排除的语义就是它字面写的**（写全库就全库不判，不软化、不兜底）。

## §2 批次任务与设计（eng-designer）
**状态行**：设计完成（2026-11-08 · 评审第 1 轮 13 条已逐条落；设计档 gate PASS（2 档））
<§2 模板占位：本批条目（覆盖） / 设计档落点 / 机制设计 / 受影响文件与测试覆盖 / 验收对照 / 关键决策 / 上抛项>

### 本批条目（覆盖）

- 台账 #2195 · 用户原话「我希望能在project-mainifest里定义doc_check的排除目录.」⇒ 覆盖：manifest 声明排除面，`doc_check` 判前把落在里面的档从**判集**里去掉。
- 用户裁定（同轮更正）：「排除如果被定义成了全关,就要全关.」⇒ 排除面写成什么样就是什么样，全关即全关——**不设守卫、不设提示**，这是定义不是缺陷。
- 明确不在本批：判据本体（阈值 ∥ 命中类 ∥ verdict 词 ∥ 抽取式 ∥ 解析序）零改；`index.excludePaths` 不被 `doc_check` 吃；不新立顶层第六键。

### 设计档落点

- `docs/core/design/DOC-CHECK.md` §2.6（机制 · KD-Ex1–KD-Ex4 · 受影响文件与档层结论 · AC-Ex1–AC-Ex5 · 用例表 · 边界）；同档 §8 增一条边界、§9 增一行 RTM 增量。
- `docs/core/design/MANIFEST.md` §2.2 键面增 `index.docCheckExcludePaths` 一条（写明 `doc_check` 不吃 `index.excludePaths`），`DEFAULT_MANIFEST` 键集字面同轮补键。

### 三件（键名 ∥ 匹配语义 ∥ 生效坐标）

1. **键名与层**：`index.docCheckExcludePaths`，缺省 `[]`，数组；非数组 ⇒ `validateManifest` 记 `errors`（与 `index.excludePaths` 同款数组层 fail-closed）。
2. **匹配语义（一种，无分支）**：归一 = `thincoder-core/declaration.mjs` 的 `normalizePathList` 单源（本批由私有改为导出）；命中 = 恰等 ∨ 后随 `/`，逐字比较，相对**该档自己的项目根**；目录与单个档同写一式，不设尾斜杠第二写法。
3. **生效坐标**：`thincoder-core/doc-check/index.mjs` 的 `runDocCheck`，**装配一处**——分组之前逐档按自身根过滤，得 `checkFiles`（排除后的可判集）；`perRootGroups` 分的就是它，三条判据与报面全吃它，不另设第二个清单名。`anchors.mjs` ∥ `paragraph.mjs` ∥ `line-refs.mjs` 零改。逐条与弃案见设计 §2.6「生效坐标」。

### 受影响文件（产品面 → eng-coder）

- `thincoder-core/manifest-schema.mjs`：默认档 `index` 增键 + 校验一行。
- `thincoder-core/declaration.mjs`：`normalizePathList` 私有 → 导出（零语义改动）。
- `thincoder-core/doc-check/index.mjs`：判集过滤 + `excluded` 桶 + 报面两行 + 返回值增 `excluded` 读数。
- `thincoder-core/tool-docs/manifest.md`：键面描述增一行。
- `docs/core/design/MANIFEST.md`：键面 §2.2 一条 · 元素层句点名该键 · 写面白名单 13→14（`index.*` 四→五子键）· AC-47 改口径。
- `docs/batches/` 下与批档同名的单元测试档：本批用例（用毕即删）。

档层结论：**逐档一行，句在**设计 §2.6「受影响文件与档层结论」（含取数命令）。读数面上的两个新动到的源档 = `thincoder-core/manifest-schema.mjs` ∥ `thincoder-core/declaration.mjs`，均未越线；`thincoder-core/doc-check/index.mjs` 越软线、未越硬限，本批不拆（理由接回设计 §4）。

### 验收对照（回指设计 §2.6）

- **AC-Ex1 过滤本身生效**：同一份带死指针的档，落在排除面 ⇒ 不出命中；移出排除面 ⇒ 出 1 条 `档缺`。两读同夹具、同命令、只换排除面——两读不相等才证明过滤在起作用。
- **AC-Ex2 归一与命中形**：`\` 形 ∥ `./` 形 ∥ 去尾斜杠三种写法行为逐字相同；前缀同名兄弟目录不被吞。
- **AC-Ex3 单档形**：排除面写一个具体档路径 ⇒ 只排除那一档。
- **AC-Ex4 值形态**：非数组 ⇒ `validateManifest(...).ok === false` 且 `errors` 点名该键；域表 `manifest:false`，照判（向严）。
- **AC-Ex5 缺省零变化**：manifest 无该键 ⇒ `hits` ∥ `checkFiles` ∥ 报面与改动前逐字相等。
- **AC-Ex6 全排除不得读成干净**：排除面覆盖清单全部档 ⇒ `gate` 首行 `ERROR（0 档受检…）` 且空范围句取「全落在排除面内」那一句；`report` 面末行取「0 档入判…不得读作已检」，「均清」零出。设计 §2.6「报面」。
- **核法**：以上六条一律 `node --test docs/batches/2026-11-08-doc-check-exclude-paths.test.mjs`（用毕即删）。
- **红侧**：改造前 AC-Ex1 的第一读恒为「排除仍判」，AC-Ex6 那两句两面都不存在；用例档两读同跑，红侧读数随交付报出。

### 需求档同轮改（D11 —— 主 agent 笔，字面如下）

`docs/core/requirements/DOC-CHECK.md` F3 现句：「**无 `checkConfig`、无任何按项目的参数面**」。

改写为：「**无 `checkConfig`；判据参数（阈值 ∥ 命中类 ∥ verdict 词）没有任何按项目的参数面**——唯一的项目级声明面 = manifest 的 `index.docCheckExcludePaths`（`doc_check` 的排除目录）：它改的是**判集**，不是判据；落在排除面内的档不入判、不出命中、不进 `未核`。」

原意保持：判据不可配；改判据 = 改代码、走评审。后半句「排除面写成什么样就是什么样（覆盖全库即全库不判）」按用户裁定并入同条。

### 上抛项

- 无。键名 ∥ 匹配语义 ∥ 生效坐标按派单三件自作，理由 = 设计 §2.6 KD-Ex1–KD-Ex4（弃案同表）。

### 改轮记录（设计评审第 1 轮 · 13 条）

- **#1** 判集口径写死为「甲」：`checkFiles` = 排除后的清单，在装配一处建；弃案与理由在设计 §2.6「生效坐标」，AC-Ex5 ∥ 用例表取同一个名字。
- **#2** 受影响表逐档一行档层结论 + 取数命令（读数本轮实跑，数住命令输出）；`thincoder-core/doc-check/index.mjs` 那行接回设计 §4 的拆档接缝与「本批不拆」。
- **#3** 新桶 N=0 不出（进 AC-Ex5 与用例表）；§9 增一句「新桶撞不撞既有行」。
- **#4** 全排除两面各写一句，出哪面 ∥ 顺序 ∥ 为何不受「gate 面只放判据」约束都写明，并新增 **AC-Ex6**。
- **#5** RTM 行号定死 `36-5`，四件齐（交互 ∥ 业务可观察结果 ∥ 业务入口 ∥ 回指需求）。
- **#6** §5 三问表扩到「十一个名字」（新增五行），表计数与表同轮改。
- **#7** `docs/core/design/MANIFEST.md` 四处同轮处置：§2.2 元素层句点名该键 · 写面白名单 13→14（`index.*` 四→五子键）· AC-47 改口径 · §2.11「不再读 manifest」句改写。
- **#8** 六条 AC 各带核法：`node --test docs/batches/2026-11-08-doc-check-exclude-paths.test.mjs`。
- **#9** 大小写改为与 `pathKey` 同一处平台语义，并写明 Windows 上写错即静默不生效的后果。
- **#10** 上抛主 agent（见下）；§1 编制行不属本席笔域。
- **#11** 先例「偏离一处」改为「形上零偏离，差别只在消费面」。
- **#12** 非数组分支补复现场景一句。
- **#13** 零改（实施轮第一读自证）。

**上抛（待裁）**：评审 #10——「排除如果被定义成了全关,就要全关.」这句在批档编制行里没有带时点的来源（现有只有 15:48 ∥ 15:50 两句）。它是 KD-Ex4 那条分支的依据，须由主 agent 在 §1 编制行补成第三条带时点的用户原话，或并入 15:50 那句。本席不写 §1。

## §3 设计评审（评审子代理）
**状态行**：评审通过



### 轮次 1（评审子代理）

| # | 严重度 | 状态 | 证据 |
|---|---|---|---|
| 1 | 🔴 | 已解决 | `docs/core/design/DOC-CHECK.md` §2.6「**`checkFiles` = 排除后的清单**」∥「三条判据…**全部吃 `checkFiles`**」∥「**不另设 `judgedFiles` 这第二个名字**」——与 §2.2 的全局 `checkFiles` 口径已合一 |
| 2 | 🔴 | 已解决 | 同档 §2.6 受影响表逐档「档层结论」列 + 「档层读数怎么取」命令；`docs/batches/2026-11-08-doc-check-exclude-paths.md` §2「均未越线」∥「越软线、未越硬限，本批不拆」 |
| 3 | 🟡 | 已解决 | §2.6「**N = 0 时不出**」∥ 用例表「排除桶零出（N=0 不出行）」∥ §9「新桶会不会撞既有行」 |
| 4 | 🟡 | 已解决 | §2.6 两面各一句（`gate` 首行 + 空范围句 / `report` 末行）+ AC-Ex6 + 用例表两行；并写明「`gate` 面只放判据」那条管的是**读数** |
| 5 | 🟡 | 已解决 | §9「号已定死 `36-5`」+ 交互 ∥ 业务可观察结果 ∥ 业务入口 ∥ 回指业务需求 四件齐 |
| 6 | 🟡 | 已解决 | §5「本批新引入的十一个名字，逐个三问」含 `excluded` ∥ 桶标签 ∥ 空范围句 ∥ Report 面结论句 |
| 7 | 🟡 | 已解决 | `docs/core/design/MANIFEST.md` §2.2「元素层宽容」句点名该键 ∥ §2.11「**14 个可写节点**」∥ §2.11「它读声明面有两处」∥ AC-47「项目声明面只读两处」 |
| 8 | 🟡 | 已解决 | §2.6「逐条核法 = `node --test docs/batches/<本批批档同名>.test.mjs`」；批档 §2「以上六条一律 …」 |
| 9 | 🟡 | 已解决 | §2.6「比较走平台语义，与引擎既有 `pathKey` 同一处规则」+ Windows 静默不生效后果 |
| 10 | 🟡 | 已接受 | 批档 §1「时间：2026-11-08 15:52」补了第三条带时点原话（§1 非设计席笔域，编制行仍两句——见新 d） |
| 11 | 🔵 | 已解决 | §2.6「**形上零偏离**。与本键的差别只在**消费面**」 |
| 12 | 🔵 | 已解决 | §2.6「**复现场景**（先例对称：`index.excludePaths` 同款同形）」 |
| a | 🟡 | 新 | `docs/core/design/MANIFEST.md`「全 **12** 可写节点」∥「（20 个可写节点）」对照 §2.11「= **14 个可写节点**」；批档 §2 键目录「键面描述增一行」 |
| b | 🟡 | 新 | §2.6「`report` 面：`范围` 行照出 0 档…」对照 `docs/core/design/MANIFEST.md`「`report` 面没有「空清单」读法」——抛出触发点未点名 |
| c | 🔵 | 新 | §2.6「`node --test docs/batches/<本批批档同名>.test.mjs` 」（占位名）对照批档 §2 的具体档名，命令不可直接复制 |
| d | 🔵 | 新 | 批档 §2「**上抛（待裁）**」仍读作未决，而其内容已由 §1 的 15:52 条落定；编制行「来源 = 用户 2026-11-08 15:48」仍只载两句 |

计数：🔴 未解决 0 · 🟡 2（非必改）· 🔵 2。上一轮 13 条：11 条已解决、1 条已接受（#10）、1 条为评审范围说明。

VERDICT: pass

## §4 用户批准（主 agent）

- **批准（评审后）**：§3 第 2 轮判 `pass`（第 1 轮 2 🔴 + 8 🟡 + 3 🔵 全处置：🔴 两条已解决、`#10` 已接受、余为 🔵 登记；第 2 轮新增 2 🟡 2 🔵 均非必改——**其中两条转 `#2196 留池**）。批准面 = 该轮评审所对的那版 §2。

**批准附的两条即时裁定**（实施轮上抛，都在当场定下）：

- **越 800 硬限 ⇒ 照设计 §4 的预留接缝拆，不回退挂账。**回退的成本不是挪一个档，是**把一个已越硬限的档留在盘上、再记一笔台账等下一轮**。
- **写前门穿透 ⇒ 排除照旧生效，但门不许把「没判」报成「判干净」。**用户裁「全关即全关」，所以不加绕过入参；错的是返回值，改那一处。

**批准范围明写**：机制面 = 判集过滤（不改判据）；文档面 = 设计档 ∥ 需求档 F3 ∥ 键面说明；测试面 = 集成用例 1 条 + 本批单测（用毕即删）。**判据本体（阈值 ∥ 命中类 ∥ 豁免谓词 ∥ 解析序）在批准面上是零改项**——改它就是超出本批。

## §5 实施记录（eng-coder）
**状态行**：实施完成（2026-11-08 · 两裁已落地（拆分保留 ∥ 写前门返回未判）；终端状态 clean）



### 实施摘要

- 装配一处：`thincoder-core/doc-check/index.mjs` 的 `runDocCheck` 在**分组之前**过滤判集——`splitExcluded(range.check, base, readOf)` 得 `{ checkFiles, excluded }`；`checkFiles` 是唯一名字，三条判据与报面全吃它（全文零 `judgedFiles`）。
- 键面：`index.docCheckExcludePaths`（`thincoder-core/manifest-schema.mjs` 的 `DEFAULT_MANIFEST.index` 加子键 + `validateManifest` 数组层一行，与 `index.excludePaths` 同款 fail-closed）。
- 归一单源：`thincoder-core/declaration.mjs` 的 `normalizePathList` 私有 → 导出（零语义改动，不写第二份）。
- 匹配语义：恰等 ∨ 后随 `/`；比较走 `pathKey`（`win32` 折小写）；排除面相对**该档自己的项目根**（`rootOf(该档, 声明根)`）。
- 每根一次读：`manifestReader` 按根记忆 `readManifest`，排除面与 `domainTables` 吃**同一次读**。
- 报面：`excluded` 桶（N=0 不出行，两面同出）、gate 空范围句、report 末行；返回值增 `excluded` 读数（`noRootOutcome` 同键补空集）。
- 硬限拆分：新增 `thincoder-core/doc-check/per-root.mjs`，判据面（`anchors` ∥ `paragraph` ∥ `line-refs`）零改。

### 决策披露（越出派单文件清单的改动）

| 档 | 改动 | 理由 |
|---|---|---|
| `thincoder-core/doc-check/per-root.mjs` | 新增档：搬出 `declaredRoot` ∥ `rootOf` ∥ `perRootGroups` ∥ `reportLayout` ∥ `rootsSuffix` ∥ `bucketLines` ∥ `NO_ROOT_HEAD` ∥ `noRootItems` ∥ `rel` ∥ `pathKey` | 设计 §4 预留分支「越硬限时按上面这条接缝拆」；实施后 `thincoder-core/doc-check/index.mjs` 读 849 行，过 800 硬限（读数 = `doc_check` 的 `lines` 档位标记 `hard`）⇒ 条件触发。拆后 731 行（`soft`）、新档 138 行（未越线） |
| `thincoder-core/agent-tools/manifest.mjs` | 仅头注两处数字：可写节点 13→14、`index.*` 四→五子键 | 本批给 `index` 族加一子键，写面白名单由 `MANIFEST_SCHEMA` 派生（14 = 3 整键 + `docRoot` 6 + `index` 5）；注释不跟随即在机制旁留一句假话（D11） |
| `test/RTM.md` | **未改** | 索引表按故事一行，CLI 36 已存在且 CLI 列已是「有」；本批增量只是 36 下一条用例行（落 `test/rtm/guard.md` 的 `36-5`） |

### 验收读数（红侧 = 改造前的真跑，同一夹具同一命令）

| AC | 绿侧读数 | 红侧读数（改造前） |
|---|---|---|
| AC-Ex1 | 排除面内：`hits.total = 1`、`excluded` = 1 档、`checkFiles` = 1 档；同一夹具删掉该键后 `hits.total = 2` | `2 !== 1` —— 断言当场失败：排除仍判，两档都出 `档缺` |
| AC-Ex2 | `[".\\docs\\excluded\\", "./docs/excluded"]` 与 `["docs/excluded"]` 报面逐字相等；`docs/excluded-fork` 照判 | 排除面零生效，`excluded` 为 `undefined` |
| AC-Ex3 | 排除面写单档 ⇒ 只该档入 `excluded`，同目录另一档照判 | 同上（零生效） |
| AC-Ex4 | `validateManifest` `ok:false` 且 `errors` 点名该键；域表 `manifest:false`、照判 `hits.total = 2` | `true !== false`（键不存在 ⇒ 非数组值不被拒） |
| AC-Ex5 | 无该键 ∥ `[]` 两读报面逐字相等；另用**改动前基线**重放本仓三档与一套带 3 条命中的夹具，`report` ∥ `gate` 两面逐字相等 | 基线本身即改动前读数 |
| AC-Ex6 | gate 首行 `DOC-CHECK GATE: ERROR（0 档受检——空范围不判 PASS）`、空范围句 = `范围为空：清单 2 档全落在 manifest 排除面内——没有可判档`、`本会话没有写过 .md 档` 零出；report 末行 = `结论：0 档入判——清单 2 档全落在 manifest 排除面内，不得读作已检`、`均清` 零出；两面排除桶点名两档 | 两句都不存在：首行 `REFUSED（锚 2 条）`、末行 `结论：2 条命中——报告态，不作拒执行的理由` |

### 验证读数

- `node --test docs/batches/2026-11-08-doc-check-exclude-paths.test.mjs` ⇒ 绿侧 `pass 8 · fail 0`；改造前同一命令 `pass 0 · fail 8`（红侧）。
- `node --test test/integration/doc-check-exclude-paths.test.mjs` ⇒ `pass 1 · fail 0`；红侧读数为首行 `REFUSED（锚 1 条）`、绿侧 `PASS`（新进程直调盘上引擎，同一夹具只换排除面）。
- 改动面回归（12 份集成档全 `fail 0`）：`doc-check-per-file-root` ∥ `doc-check-empty-range` ∥ `doc-check-line-refs` ∥ `doc-check-line-counts` ∥ `doc-check-fence-verdict` ∥ `doc-check-citation` ∥ `doc-check-brace-group` ∥ `batch-close-gate` ∥ `doc-write-gate` ∥ `batch-touched-region-gate` ∥ `path-resolution` ∥ `cross-repo-refs`。
- 交付门：`doc_check({mode:"gate"})` 判 `test/rtm/guard.md` ∥ `thincoder-core/tool-docs/manifest.md` ∥ `test/RTM.md` ⇒ `DOC-CHECK GATE: PASS`。
- 档层读数：`thincoder-core/doc-check/index.mjs` 731（`soft`）· `thincoder-core/doc-check/per-root.mjs` 138 · `thincoder-core/manifest-schema.mjs` 164 · `thincoder-core/declaration.mjs` 373 · `thincoder-core/tool-docs/manifest.md` 42 · `test/rtm/guard.md` 94。

### 审计与代码评审轮次

- 内部偏离审计（explore）：1 轮，出 4 条——2 条已就地修或披露（`index.mjs` 头注 `rootOf` 签名少一参 → 已改；`per-root.mjs` 未在设计受影响表 → 见上「决策披露」）；1 条为混态空范围句的口径收窄，经核是设计未给该态句子（本席不自行造句，已在代码注释写明）；1 条为越界披露项，与上表同。
- 独立代码评审（advisor · code）：1 轮，🔴 1 / 🟡 5 / 🔵 2，结论 `changes-required`。🔴 = 排除面静默穿透到写前门（`thincoder-core/tools/doc-write-gate.mjs` 的拒写判据 `hits.anchors + hits.paragraph === 0` 不读 `checkFiles`，目标档在排除前缀下时片段档同被排除 ⇒ 返 `judged: true, hits: 0` ⇒ 放行）；设计受影响表无此档、判据面零改是 §8 边界 ⇒ **已上抛主 agent 待裁，本席未改该档**。
- 终端状态：**stalled**（除该 1 条待裁项外全部收敛）。

### 档层漂移（转设计席 / 主 agent，本席未改）

- `docs/core/design/DOC-CHECK.md` §4 与 §2.6 受影响表仍写「本批不拆 / 未越硬限」，与本轮拆分（849 → 731）相反，须同轮改写。
- 同档 §2.6 的 `pathKey` 引文、§5 三问表里 `perRootGroups` 的落点已随拆分改到 `thincoder-core/doc-check/per-root.mjs`。
- `docs/core/requirements/ENGINEERING-MODE-V2-SPEC-MANIFEST.md` 仍写 `index.*` 四子键（同行的 `docRoot.*` 五子键也与盘面六子键不符）——需求档，不属本席笔域。

### 裁定落地（主 agent 两裁 · 2026-11-08）

| 裁定 | 落地 | 读数 |
|---|---|---|
| ① 硬限拆分照设计 §4 分支执行、不回退 | 保留 `thincoder-core/doc-check/per-root.mjs`；`thincoder-core/doc-check/index.mjs` 只留 import 与装配件 | HEAD 版 768 行 · 本批改动后（未拆）849 行（档位标记 `hard`）· 拆后 731 行（`soft`）· 新档 138 行（未越线）。849 含工作树里另一未提交批的少量增行（hunk 级无法逐行归属）；档位判据读的是档本身，849 大于 800 成立 |
| ② 写前门不得把「没判」报成「判干净」 | `thincoder-core/tools/doc-write-gate.mjs` 的 `runDocWriteGate` 加**一处**返回值分支：判集被排除面吃空 ⇒ 返回**未判**（`judged` 假、`hits` 0）；`@returns` 注同轮补一句。拒写判据、`faceDetail` 那道口、片段落盘逻辑零改 | 红绿两读见本节末围栏（同一夹具、同一笔带悬空指针的正文） |

### 越界披露（补上表之外的一档）

| 档 | 改动 | 理由 |
|---|---|---|
| `thincoder-core/tools/doc-write-gate.mjs` | 一处返回值分支 + `@returns` 注一句 | 写前门是 `runDocCheck` 的消费面，设计受影响表漏列该档；主 agent 裁定「排除即各处不判，但不得把没判报成判干净」并把该档加进本批写域 |

### 验证读数（终态 · 裁定后重跑）

- `node --test docs/batches/2026-11-08-doc-check-exclude-paths.test.mjs` ⇒ `pass 9 · fail 0`（新增「传导面」1 条，钉写前门返回值）。
- `node --test test/integration/doc-check-exclude-paths.test.mjs` ⇒ `pass 1 · fail 0`。
- 改动面 12 份集成档全 `fail 0`（含 `doc-write-gate` ∥ `batch-close-gate` ∥ `batch-touched-region-gate`）。
- 交付门：`doc_check({mode:"gate"})` 判 `test/rtm/guard.md` ∥ `thincoder-core/tool-docs/manifest.md` ∥ `test/RTM.md` ⇒ `DOC-CHECK GATE: PASS`。
- 档层读数：`thincoder-core/doc-check/index.mjs` 731（`soft`）· `thincoder-core/doc-check/per-root.mjs` 138 · `thincoder-core/tools/doc-write-gate.mjs` 252 · `thincoder-core/manifest-schema.mjs` 164 · `thincoder-core/declaration.mjs` 373 · `thincoder-core/agent-tools/manifest.mjs` 246。

### 终端状态

- **clean**：偏离审计 1 轮、独立代码评审 1 轮；评审那条 🔴（排除面静默穿透到写前门）已按裁定落地并有红绿两读；本席未留待裁项。
- 余项供设计席 / 主 agent 订正（本席只报不改）：设计 §4 与 §2.6 的「未越硬限、本批不拆」；同档 §2.6 的 `pathKey` 引文与 §5 三问表里 `perRootGroups` 的落点；`docs/core/requirements/ENGINEERING-MODE-V2-SPEC-MANIFEST.md` 的 `index.*` 四子键写法。

本节末围栏（裁定 ② 的红绿读数，逐字取自当次运行；围栏内的形是指针写法示例，不是盘面坐标）：

```text
红侧 = HEAD 版写前门 + 本批引擎，同一夹具同一笔带悬空指针的正文
  {"judged":true,"zones":1,"hits":0}
绿侧 = 本批分支，同一笔
  {"judged":false,"zones":0,"hits":0}
```

## §6 验证与收口（父代理）

### 父侧复量

| 判集 | 档数 | 读数 |
|---|---|---|
| `docs/core/design` | 66 | `DOC-CHECK GATE: PASS` |
| `docs/core/requirements` | 48 | `DOC-CHECK GATE: PASS` |
| `docs/server/design` | 30 | `REFUSED（3 段文字太长）`——**本批零触，改前即有**，不记本批 |
| `test/integration/doc-check-exclude-paths.test.mjs` | 1 | `pass 1 · fail 0` |

**规范面 114 档全绿**（设计 ∥ 需求）。`docs/server/design` 那 3 段长文与本批无关，是存量。

### 实施轮的两处读数推翻与处置

| 前提 | 实读 | 处置 |
|---|---|---|
| 设计 §4 ∥ §2.6 写「未越硬限、本批不拆」 | `thincoder-core/doc-check/index.mjs` 改前 768 → 加本批 849（**越 800**）→ 拆后 731，新档 138 | **按 §4 预留接缝整族拆出 `thincoder-core/doc-check/per-root.mjs`**，判据面零改；设计档已改成现态 |
| 写前门把「没判」报成「判过了」 | 排除面吃空判集时，返回值里 `judged` 为 true 而 `hits` 为 0 | 改一处返回值 ⇒ 判集为空返回「未判」。**不加参数、不加开关**——被排除就是被排除，但门不许说它判过 |

**第二条是本批最重要的一个外溢发现**：排除面会自动穿透到写前门，而设计与 AC 都没提那个档（`thincoder-core/tools/doc-write-gate.mjs`）。**穿透本身是用户裁定「全关即全关」的自然结果；错的是返回值在撒谎。**

### 单元测试档

`docs/batches/2026-11-08-doc-check-exclude-paths.test.mjs` 已删。**读数留在 §5**：改后 9 条全过，改前同一命令 `pass 0 · fail 8`（红侧真跑）。

### 转出项

| 项 | 去处 |
|---|---|
| `docs/core/design/MANIFEST.md` 三个「可写节点」数对不上 ∥ `report` 面全排除读法未接线 | `#2196`（`trigger = 条件`） |
| 设计评审第 2 轮 `a` ∥ `b` | 同上，已并入 `#2196` |

### 台账

`#2195` → 核销。

### 门检

本节落笔回执：`DOC-CHECK GATE: PASS`。
