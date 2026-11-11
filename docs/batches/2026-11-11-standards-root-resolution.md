# 2026-11-11 · standards-root-resolution
> 六段，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 每段只有一个作者：作者的段可 `append` 加内容、可就地改（`edit`）；非作者一概拒。
> 编制：主 agent · 2026-11-11 · 来源 = 来源 = 用户 2026-11-11 14:39 提问「请使用者把手册、编程规范整理到一个目录并挂在 manifest 的 standards 上，盘点 thincoder 是否真用这个键」+ 父侧实读定位（入账 `#2336`）：工作区锚下 `guideRoot` 无 manifest ⇒ `injectProjectStandards` 落回 `DEFAULT_MANIFEST` 的 `standards: null` ⇒ 评审每次拿 `NO_STANDARDS_NOTICE`「项目里没有任何东西声明标准」，而本仓 manifest 明写 `docs/core/standards`。用户 14:45「可以」＝ 开批修。。
> 台账 = #2336（core · 归批）。前情 = 无（独立批）。
## §1 讨论（主 agent）
**状态行**：已收口 2026-11-11
批起 sha = 6f33e721c2ed84672f60342360b77c2daaee93ba
<§1 模板占位：本批条目 / 关键判据 / 授权口径>

## 讨论纪要（主 agent）

用户把手册 / 编程规范整理进一个目录，挂在 `manifest` 的 `docRoot.standards` 上，他问的是：**thincoder 真用这个键了吗，还是整进去了谁也不看。**

### 读到的现状

**键真被接了四处**（实读）：

```
thincoder-core/manifest-schema.mjs        DEFAULT_MANIFEST.docRoot 第六键 standards: null
thincoder-core/agent-tools/review-facts.mjs   REVIEW_ROOT_KEYS 含 "standards"
thincoder-core/agent/write-face.mjs       标准层写入判文档面（放行）
thincoder-core/advisor/project-context.mjs injectProjectStandards 把层内全部 .md 正文注进评审消息
```

**断在根解析，不在三态机**：

```
thincoder-core/advisor/messages.mjs   injectProjectStandards(agent, parts, guideRoot)
guideRoot = injectProjectGuide 的 findGuideRoot(agent.cwd, scopeFiles) 返回值
本会话锚 = D:\teamcode（工作区根：有 AGENTS.md、无 manifest）
⇒ project-context.mjs：const std = (read.ok && read.manifest ? read.manifest : DEFAULT_MANIFEST).docRoot.standards
   read.ok 假 ⇒ 落回 DEFAULT_MANIFEST 的 null ⇒ dirs.length === 0
⇒ push NO_STANDARDS_NOTICE：「(No project standards document — nothing in the project declares one …)」
```

**后果**：`docs/core/standards/METHODOLOGY.md`（18,403 字节）**一次也没进过评审视野**；而那句降级语说的是反话——`PROJECT-MANIFEST.json` 里 `docRoot.standards` 明写着 `docs/core/standards`。

### 为什么一直没被发现

```
test/integration/review-standards-injection.test.mjs   只测「夹具项目自身即 root」
test/rtm/batch-ledger.md 24-1                          同上
```

**没有一条覆盖「会话锚 = 工作区根、范围文档在某个子项目下」**——用户的实际用法恰是没测的那一种。

### 已定决定

- **已定决定**：本批修根解析（不是改三态机、不是登记豁免）· 用户原话：「可以」· 时间：2026-11-11 14:45
- **已定决定**：修法方向以「拿错根就去找对根」为准，**「布局不支持」只作最后的兜底态**——这里不是不支持的布局，是这个布局本来就该支持 · 时间：2026-11-11 14:45

### 边界

- **不动**三态语义与四句降级文案（它们是对的；错的是把「读不到声明」说成「没有声明」的**触发条件**）。
- **不动** `docRoot.standards` 的声明形态（目录层 / 多目录 / 递归成员，`docs/core/design/MANIFEST.md` §2.12 已定）。
- 与 `#2335` 批（`batch edit` 触达账）**无交集**，两批可并行。

## §2 批次任务与设计（eng-designer）
**状态行**：设计完成（轮 3 收口前修两处过期句（依据引文换现值 ∥ 调用点实读改事实））
<§2 模板占位：本批条目（覆盖） / 设计档落点 / 机制设计 / 受影响文件与测试覆盖 / 验收对照 / 关键决策 / 上抛项>

### 本批条目（覆盖）

**E1 · 标准层的根按「被评审项目的项目根」解析**（不再是「最近 `AGENTS.md` 所在目录」）。

- 回指：需求 `docs/core/requirements/ADVISOR-CONVERGENCE.md` §5.1「项目标准（方法论）」行 ∥ 验收 ③「任何一面都不得静默跳过」；批次决定见 §1「已定决定」两条。
- 现象：会话锚 = 工作区根（有 `AGENTS.md`、无 `PROJECT-MANIFEST.json`）时 `guideRoot` = 锚 ⇒ `readManifest` 不 ok ⇒ 落回 `DEFAULT_MANIFEST`（`standards: null`）⇒ 态 1 句「nothing in the project declares one」；而本仓数据档明写 `docs/core/standards`。

### ① 根该由谁定 —— 判：甲（标准层自己算根，不复用 `guideRoot`）

判据三条，按序：

1. **需求的口径是「被评审项目」，不是「最近的 `AGENTS.md`」。** 依据 `docs/core/requirements/ADVISOR-CONVERGENCE.md`「评审注入的项目上下文（项目指南 ∥ 文档地图 ∥ 项目标准）**只从被评审项目的自述派生**，不猜固定名。」——`findGuideRoot` 问的是「最近的 `AGENTS.md` 在哪」；两者在单项目里重合，在工作区锚下分开。
2. **本键的基数必须是项目根。** 依据同档「项目根相对的**目录**」。锚 `D:\teamcode` 不是项目根（`projectRootView` 实测 = `workspace`、`root: null`），拿它当基数，本键的声明永远读不到。
3. **落在判据本体上，不另造一把尺。** `thincoder-core/manifest-discovery.mjs` 的 `projectRootView` 已是「项目根解析的直读形」（归属形，界 = 目标所在盘根）；被评审文档的归属项目根 = 对它调一次。零新判定、零新走查。

**为什么不乙**：乙把新腿加在 `guideRoot` 上，而 `guideRoot` 同时喂项目指南（`injectProjectGuide`）与 `injectDocumentMap`——加一腿就同时挪动这三个消费者，本批边界不许。

调用点实读（`thincoder-core/advisor/messages.mjs`）：`injectDocumentMap` **恰一处**（设计评审轮 0 路），`injectProjectStandards` 两处（设计评审轮 0 路 + 其余路）。

后果：**代码评审路今天不注文档地图**，故 E3 的地图断言只覆盖设计评审路。

代价差：甲 = 一个模块内新增函数 + 三处调用点；乙 = 三个消费者同动、各要一格验收。

**为什么不丙**：丙在两者都不满足时改传 `agent.cwd`——本场景里 `agent.cwd` 就是 `D:\teamcode`，即被传的 `guideRoot` 本身，对现象零作用。

### 机制设计（目标态）

base 推导三段，按序、任一命中即止：

```text
① 评审范围项的归属项目根   逐项 resolve(cwd, item) → projectRootView(item)，首个 state === "ok" 的 root
② 会话锚自身的归属项目根   projectRootView(agent.cwd).root（仅 state === "ok" 时）
③ 无项目可指               返回 null，调用方落 agent.cwd（既有缺省，原样保留）
护栏                      ①② 每次调用各自包 try（抛 ⇒ 跳过该腿，其余照走）
```

- **①** 逐条范围项取 `resolve(cwd, item)` → `projectRootView(item)` → 首个 `state === "ok"` 的 `root`；序 = 今天喂给 `findGuideRoot` 的同一个序（`[...pathList, ...docList]`）。
- **多项目并列取首个的出处 = 排序不变量，不是新场景**：一次评审只组一份消息、只注一个指南、一个标准层 ⇒ base 只能一个；取「首个可解析者」与 `findGuideRoot`「首个命中即止」同形（同一份操作数、同一个循环形状），不新增判定。
- **它的代价如实记**：范围项跨两个项目、且首个项目的声明里没有本键而后者有时 ⇒ base 落在首个项目 ⇒ 本键未声明 ⇒ 态 1 句。今日无跨项目评审的调用面（`documents` / `paths` 由一次评审的发起方给出，`batchDoc` 绑定一个项目），故不立分支；这一格进 ② 的触发集合如实登记。
- **②** 只走归属形：`projectRootView` 的 `workspace` 不向下取子项目（KD-M1-30「不向下取根」）——工作区锚不会被猜成某个子项目。
- **护栏 = 整个 `findProjectContextRoot` 的，两腿同语义**：每一次 `projectRootView` 调用（① 逐项、② 一次）都包 `try` ⇒ 抛则跳过该腿、其余照走；两腿全抛 ⇒ 落 ③。
- 依据 `thincoder-core/manifest-discovery.mjs`「I/O 异常照原样上抛」——`owningProject` 取根那一环无护栏，同档契约行明写调用点要自己包护栏；而 `injectProjectStandards` 自己的 `try` 只包 `readManifest`，腿 ② 一抛就穿过去。为何护栏住推导函数而不是调用点：本面要守的硬不变量是**不得中断评审消息组装**（§2.12 读抛行同款）。
- **第三参契约（零缺省，`undefined` 与 `null` 同拒）**：`findProjectContextRoot(cwd, scopeFiles)` ∥ `injectProjectStandards(agent, parts, scopeFiles)` ∥ `injectDocumentMap(agent, parts, scopeFiles)` 的 `scopeFiles` 不是数组即当场拒，拒因点名该参数与收到的值。
- **不归一成 `[]`**：归一让「忘了传」与「范围为空」在函数体内同形，而两者语义相反（前者是调用方写错，后者是一次真空范围的评审）；`for…of` 对 `null` 抛 TypeError 正是该契约要提前挡住的那一类。
- 先例 = `thincoder-core/prompts/persona-eng-designer.md`「**Design parameter contracts with zero defaults**: a tool-schema parameter or an exported function signature carries no `= default`; the caller passes what the contract asks, or the call is rejected at the boundary with a reason naming the parameter.」

代码面落点（契约定死，改法归实施）：

- `thincoder-core/advisor/project-context.mjs`：新增导出 `findProjectContextRoot(cwd, scopeFiles)`——**本模块唯一的根推导**（三条腿 + 逐腿护栏见上；无项目可指 ⇒ 返回 `null`）；`injectProjectStandards` 的三态组装、层成员枚举、排序、去重、预算**一字不动**，只换 base 的来源。
- `injectProjectStandards(agent, parts, scopeFiles)`：第三参**无缺省**（契约见上）；base = `findProjectContextRoot(agent.cwd, scopeFiles) ?? agent.cwd`。`injectDocumentMap(agent, parts, scopeFiles)` 同形、同一条 base（见 ④）。
- 三处调用点同传 `[...pathList, ...docList]`（`injectProjectStandards` 两处 ∥ `injectDocumentMap` 一处）；`test/integration/review-standards-injection.test.mjs` 里 24-1 第二半的直调补 `[]`（零语义改）。
- 三态语义、四句降级文案、态 3 用途句、定位注、半读句：不动。`injectProjectGuide` 连根都不动——它的根 = 最近的 `AGENTS.md`，工作区有自己的指南不是错。

### ② 三态怎么办 —— 判：不拆句，靠 ① 消因

**答案**：不新增第五句、不把态 1 句拆两句；靠 ① 让「有项目但取不到根」不再发生。

判据（可机判，供评审核）：

1. 改后态 1 由**三件事**触发，逐条在盘：① 解析出的 base 无数据档（`readManifest` 返 `reason:"missing"`）；② base 的数据档未声明本键（缺键 / 显式 `null`）；③ base 的数据档**非法**（`readManifest` 返 `reason:"invalid"`）。
2. 第三条的机制：依据 `thincoder-core/manifest.mjs`「return { ok: final.ok, manifest, missingKeys: first.missingKeys, unknownKeys: first.unknownKeys, errors: final.errors, reason: final.ok ? undefined : "invalid" }」——`reason:"invalid"` 三支的 `manifest` 取值分两类：JSON 解析失败（「… 不是合法 JSON」）与顶层非对象两支返 `manifest: null`；`validateManifest` 不过这一支返补默认后的对象（非 `null`）而 `ok` 假。三支的 `ok` 一律假，注入面按 `read.ok && read.manifest ? … : DEFAULT_MANIFEST` 取值 ⇒ 无论哪一类都落回 `std = null` ⇒ 态 1。设计档「分支出处」的「态 1：manifest 非法」行按这两类改写（同一轮落地）。
3. 故一个 `docRoot.standards` 声明得好好的项目，只要别的键校验不过，照样发「nothing in the project declares one」。代码面出口同一条：`dirs.length === 0`（`docRootPaths` 对非 `null` 值不返回空——非法形态已被 `validateManifest` 拒）。
4. 本批消掉的是**一条特定的假话**，不是态 1 的全部成因：改后「base 是项目根 ∧ 键有值 ∧ 数据档合法」三者齐备时必进态 2 / 态 3——「有项目、该项目声明了标准层，却发出『没有任何东西声明』」在这条路上不再可达。
5. 触发 ③ 是同族假话的残余，本批**只登记不改**：报明面在会话状态行（§2.12「`read.ok === false`（档非法 / 档缺失）⇒ 走 `DEFAULT_MANIFEST`（`std = null`）⇒ 态 1」与会话状态行 AC-25 同源），改它要动三态语义与「非法档报在哪一面」的既有裁定——本批边界之外。
6. 它**不是没有复现**：复现即 §2.12「分支出处」表现成行「态 1：manifest 非法 … 复现：档内写非法 JSON，跑一次设计评审 ⇒ 态 1 句（报明面在状态行）」。
7. 残留格的第一条通路（写进边界，不立分支）：一次评审**既无 `paths` 也无 `documents`**、且会话锚是工作区根 ⇒ ①②都取不到项目根 ⇒ 落 ③ 锚 ⇒ 态 1 句。这一格的真理由不是「工程模式必有项目」，而是**没有操作数指向任何项目**：`agent.cwd` 是工作区容器，`projectRootView` 按 KD-M1-30 不向下取根（`workspace` ⇒ `root: null`），空范围没有第二条腿能命名一个项目。（第二条通路 = 范围项都在项目之外，见第 9 条。）
8. 反向可造：`thincoder-core/advisor/messages.mjs` 的「Backward-compatible fallback (no documents)」是活路（空 `documents` 走 git 差异发现），故这一格跑得出来。
9. 带范围的评审**只有在每一项都不指向某个项目根时**才出此格：范围项落在某个项目内 ⇒ 归属命中 ⇒ 腿 ① 得根，本格不可达；而范围项在盘上存在、整条祖先链却无档（工作区根上的一份档）⇒ 归属无命中 ⇒ 腿 ① 无根（`root: null` 的两态 `none` ∥ `workspace` 皆是），会话锚又是同一个工作区根 ⇒ 腿 ② 得 `workspace`、`root: null` ⇒ 两腿皆空 ⇒ 仍落本格。故本格的界定是「没有操作数指向任何项目」，不是「范围为空」。实跑读数（本席 `node` 直调）：`projectRootView("D:/teamcode/AGENTS.md")` ⇒ `{state:"none",root:null}`；`projectRootView("D:/teamcode")` ⇒ `{state:"workspace",root:null}`。本格保留为态 1 的既有出路，不加句子。

### 最近先例

- `existing: thincoder-core/manifest-discovery.mjs` 的 `projectRootView`（项目根解析直读形，归属形）· 逐字复用，零新判定。
- `existing: thincoder-core/advisor/project-context.mjs` 的 `findGuideRoot`（逐范围项上溯、首个命中即止）· 对齐其形：`findProjectContextRoot` 同形同序，差异只在判据（数据档而非 `AGENTS.md`）与取根来源（`projectRootView` 而非自走祖先链），且服务两个消费者（标准层 ∥ 文档地图）。

- `existing: thincoder-core/manifest.mjs` 的 `docRootBase` / `docRootPaths` 先例（同一病理的上一例：docRoot 值一律相对**项目根**解析，不相对会话锚；先例注释记的实证是「评审五档全拒」）· 本批是它的标准层副本：解析管线本就共用，错的是传给它的 `base`。

**三问 × 新名 `findProjectContextRoot`**（先例形 = `docs/core/design/LEDGER.md` 的取根族表：「两问不同，名字不复用」）：

| 问 | 答 |
|---|---|
| ① 现在住哪 | `thincoder-core/advisor/project-context.mjs`，紧邻 `findGuideRoot`（同一模块、同一份操作数 `[...pathList, ...docList]`）——不新开档、不搬现有函数 |
| ② 逐字叫法 | `findProjectContextRoot`（已查无：`thincoder-core/**` 对同名字面零命中；与 `findGuideRoot` / `resolveProjectRoot` / `projectRootView` 各答一问，名字不复用） |
| ③ 谁消费 | `injectProjectStandards` ∥ `injectDocumentMap`（两个消费者、一条 base）；`injectProjectGuide` 不在列 |

### 勘察证据行（survey-evidence）

- 实读 `thincoder-core/advisor/project-context.mjs`（`findGuideRoot` / `injectProjectStandards` / `injectDocumentMap` / `collectStandardDocs`）、`thincoder-core/advisor/messages.mjs`（三处调用点：`injectProjectStandards` 两处 ∥ `injectDocumentMap` 一处）、`thincoder-core/manifest.mjs`（`docRootBase` / `docRootPaths` / `readManifest` / `manifestFilePath`）、`thincoder-core/manifest-discovery.mjs`（`owningProject` / `projectRootView` / `discoverProjects`）。
- 实读 `docs/core/design/MANIFEST.md` §2.12（判据块 ∥ 三态文案 ∥ 分支出处表 ∥ 受影响文件表）、`docs/core/requirements/ADVISOR-CONVERGENCE.md` §5.1 注入面表与验收 ①②③④。
- 实读 `test/integration/review-standards-injection.test.mjs`（24-1…24-6）、`test/rtm/batch-ledger.md` 故事 24 表、`test/RTM.md` 故事索引表。
- 数据事实（探针读数，命令见「验收」块末）：`owningProject(<本仓设计档>)` = `D:\teamcode\thincoder`；`readManifest(D:\teamcode)` = `ok:false / reason:"missing"`；`readManifest(D:\teamcode\thincoder)` = `ok:true`、`standards = "docs/core/standards"`；`projectRootView(D:\teamcode)` = `{state:"workspace", root:null}`。
- 库外公共源：改动面全在本仓（`thincoder-core/**` · `test/**` · 本设计档），无外部断言 ⇒ **未联网**（本批判为 B 类，非「不适用」）。

### 受影响文件

- 产品代码 · `thincoder-core/advisor/project-context.mjs`：新增导出 `findProjectContextRoot`（三条腿 + 逐腿护栏 + 第三参契约）；`injectProjectStandards` ∥ `injectDocumentMap` 的 base 推导与第三参、两处函数头注释里的 base 行与参数行（`injectProjectGuide` 零改）。
- 产品代码 · `thincoder-core/advisor/messages.mjs`：两处 `injectProjectStandards(agent, parts, guideRoot)` 与一处 `injectDocumentMap(agent, parts, guideRoot ?? agent.cwd)` 改传范围项实参（`guideRoot` 本身零改，此后只喂 `injectProjectGuide`）。
- 测试 · `test/integration/review-standards-injection.test.mjs`：新增 24-7（一段夹具两段断言，见 ④）；24-1 第二半直调补 `[]`。
- 测试 · `test/rtm/batch-ledger.md`：故事 24 表加 `24-7` 行，节注「三态（行序）」补 `24-7`。
- 文档 · `docs/core/design/MANIFEST.md` §2.12：判据块 `base` 段改写为**共用根推导**（`findProjectContextRoot`，两个消费者同源）∥ 判据块后新增「两个消费者、一条 base」条（含逐腿护栏与第三参契约）∥ 「分支出处」表加四行（三条腿 + 护栏一行）∥ 最近先例「注入形」句与「边界（不做）」句同轮正（D11）。
- 本批单元测试档（落 `docs/batches/`、与本批档同名 `.test.mjs`，收口删）：AC-E1-c 九格 ∥ AC-E1-d 格一 + 格二 ∥ AC-E2-a ∥ AC-E2-b。

### 档层结论（判据 + 失败侧；读数不预载）

- **文件层**：本批改的两个源档在改动前都不过 500 软线 ⇒ 无拆分计划。判据原文 = `thincoder-cli/AGENTS.md`「At design time the designer judges the length **before** this batch's changes: above 500 lines ⇒ the design must carry a split plan」。
- 量法 = `doc_check({mode:"report", lines:["thincoder-core/advisor/project-context.mjs","thincoder-core/advisor/messages.mjs"]})`；读数不预载（与 §2.12「档位结论」条同口径）。
- 失败侧 = 同一条命令跑出「越 500（设计器硬线）」标记 ⇒ 本条红，本批须补分拆方案。
- **函数层**：新增 `findProjectContextRoot` 是单一函数，体 = 三条腿 + 逐腿护栏，不承载遍历、不嵌子臂；两个注入器的函数体只把 base 表达式换成一次调用，**不新增分支、不新增循环**（遍历仍在 `collectStandardDocs`）。
- 设计约束 = 新增函数 ≤ 40 行（同形先例 = `findGuideRoot`：逐项上溯 + 一处显式前提检查）。
- 失败侧 = ① 该函数超过 40 行 ⇒ 把「逐项取根 + 护栏」抽成模块私有 predicate（同 `collectStandardDocs` 先例）；② 把三条腿展开写进 `injectProjectStandards` 体内 ⇒ 该体内出现循环 ∥ 可读单元变大 ⇒ 本条红。
- 先例形 = `docs/core/design/LEDGER.md`「单函数层结论 = 判据 + 失败侧」。
- **文档面**：`docs/core/design/MANIFEST.md` 是既有设计档，`thincoder-cli/AGENTS.md` 明写「**Documents (`.md`) are under no size obligation** — no line limits, no line-count readings, no split plans」⇒ `.md` 零行数义务、不出数、无拆分计划；本批只判上面两条。

### 验收对照（E1）

**AC-E1-a · 集成用例 24-7（新增，能红）**

- 场景：夹具 = 临时目录作**工作区锚**（自身无数据档、有 `AGENTS.md`）+ 其下一个**子项目**（有数据档，`docRoot.standards` 指子项目内的标准层目录，层内一份标准档），设计档与批档都在子项目内。
- 怎么做：`agent.cwd` = 锚；评审范围文档 = 子项目内设计档**相对锚**的路径；构建评审用户消息（`buildAdvisorUserMessage`，`reviewType === "design"`、round 0、`documents` 非空、工程模式开）。
- 怎么算通过：`## Project Standards` 段含该标准档的正文 + 该档绝对路径定位注，**且不含** `NO_STANDARDS_NOTICE`。
- 该用例为什么从消息组装面进而不从 `advisor` 工具进：被测交互是「数据档 → 层读取 → 注入 → 评审消息」，工具入口的三道门（类型 / 准入 `batchDoc` / 账链）不是被测面，把用例挂在它们后面会让它因无关原因红。
- **红条件（在盘上跑得出，本条按现状为红）**：把同一份范围项喂给今日的实现——base 落锚 ⇒ 态 1 句。读数（改动前基线）：

```text
base = 锚 D:\teamcode            → notice? true  | ret = null
base = 项目根 D:\teamcode\thincoder → notice? false | ret = D:\teamcode\thincoder\docs\core\standards\METHODOLOGY.md
```

  复跑命令 `node --test test/integration/review-standards-injection.test.mjs`；实施后 24-7 由红转绿，24-1…24-6 保持绿。

**AC-E1-b · 既有六例零回归**：24-1…24-6 的断言句与夹具不动（24-1 第二半的直调只补第三参 `[]`）——同一命令全绿。

**AC-E1-c · 契约面（`undefined` 与 `null` 同拒）**

- 判据：`findProjectContextRoot` ∥ `injectProjectStandards` ∥ `injectDocumentMap` 的 `scopeFiles` 不传 ∥ 传 `null` ∥ 传非数组 ⇒ 一律当场拒，拒因点名该参数（本批单元测试档九格，与本批同删）。
- 失败侧：任一格返回而不抛 ⇒ 红。今日 `findProjectContextRoot(cwd, null)` 在 `for…of` 上抛 TypeError——那是「跑着跑着炸」、拒因不点名参数，仍判红。

**AC-E1-d · 护栏（两腿同语义，能红）**

- **格一（行为格，走腿 ①）**：评审范围项里有一项让 `projectRootView` 抛，同时另一项的归属项目根可解析 ⇒ 注入照常完成，`## Project Standards` 段是后者那份项目根的正文。
- **格二（直调格，走腿 ②）**：`findProjectContextRoot(<含 NUL 字节的 cwd>, [])` ⇒ 返回 `null` 且不抛——范围项为空 ⇒ 腿 ① 无操作数可走 ⇒ 腿 ② 的 `projectRootView(agent.cwd)` 那一抛必须被吃掉（调用方再落 `agent.cwd`）。腿 ① 命中即止，故格一造不出腿 ② 那一抛；本格是腿 ② 护栏唯一能红的格（落本批单元测试档，与本批同删）。
- 复现操作数：含 NUL 字节的路径（`statSync` 在 `owningProject` 里无护栏 ⇒ 抛）。基线读数（本席实跑 `node` 直调 `projectRootView`，改动前恒如此）：`projectRootView("a\u0000b")` ⇒ `THROWS: ERR_INVALID_ARG_VALUE`；`projectRootView("D:/no/such/dir/xyz")` ⇒ `{state:"none",root:null}`——纯缺路径不抛，故这一格只能由**一次抛错**造出（不限 I/O 类：权限 ∥ 链接环属 I/O，参数值异常不是，但三者落在同一个无护栏的 `statSync` 上）。
- 失败侧：格一红 ⇔ 腿 ① 未包 `try`（该范围项一抛即中断注入）；格二红 ⇔ 腿 ② 未包 `try`（`projectRootView(agent.cwd)` 那一抛穿出 `findProjectContextRoot`）。两腿各有各的格，撤掉任一条护栏都各自有一格转红。

**RTM**：`test/RTM.md` 索引表**不加行**（故事 24「评审的方法论符合度不再恒空」已在表内，本批是同故事的第七个用例）；分册 `test/rtm/batch-ledger.md` 故事 24 表加一行：

```text
| 24-7 | 夹具 = 工作区锚（无数据档、有 AGENTS.md）+ 其下子项目（数据档声明 docRoot.standards，子项目内有 docs/README.md），设计档在子项目内；agent.cwd = 锚，发起一次设计评审 | 评审消息 `## Project Standards` 段含该标准档正文与绝对路径定位注、不含 NO_STANDARDS_NOTICE，**且** `## Document Map` 段含子项目 docs/README.md 正文、不含 NO_DOC_MAP_NOTICE | — | `test/integration/review-standards-injection.test.mjs` |
```

### 关键决策

- **KD 本轮新增（住本段，不入设计档）**：标准层的 base = 被评审范围项的归属项目根，`guideRoot` 只作次选。被否的备选 = 在 `guideRoot` 上加腿（三处调用点同动）、改传 `agent.cwd`（对现象零作用）。
- **两条 base 同源（E3 并入后）**：标准层与文档地图此后共用 `findProjectContextRoot`——同一锚下两段一起出正文、一起降级；三者里只有项目指南仍按最近的 `AGENTS.md` 取根，那是既定分工，不是不一致。
- **多项目并列取首个**：出处 = 上面 ① 的排序不变量（一次评审一份消息、一个指南、一个标准层 ⇒ base 只能一个；取首个与 `findGuideRoot` 同形），不是新场景。
- **它的代价已记**：首个项目未声明本键、后者声明时得态 1 句；今日无跨项目评审的调用面，故不立分支。
- **不拆态 1 句**：理由见 ②。

### 边界（本批不做）

- 不动三态语义与四句降级文案本身。
- 不动 `docRoot.standards` 的声明形态（目录层 ∥ 多目录 ∥ 递归成员）。
- 不动 `injectProjectGuide` 的行为（甲不碰它的根）；`injectDocumentMap` 只换 base，派生梯与 `DOC_ROOT_ORDER` 零改（见 ④）。
- 不做「跨项目评审注入多份标准层」：一次评审只有一条 base（排序不变量见 ①）；跨项目并列的代价已记在 ①，不立分支。
- 不改数据档非法（`reason: "invalid"`）落态 1 的既有格（见 ② 判据第 5–6 条；报明面在会话状态行）。

### ③ 提示词面 —— 四环节各一句（用户 2026-11-11 14:49 裁定并批：原 A/B/C 选 B）

本节补在上面「受影响文件 / 边界 / 验收对照」之上：那三块写的是 E1（根解析），本节写 E2（提示词面）。E1 不改一词。

**E2 条目 · 需求 ∥ 设计 ∥ 编码 ∥ 评审 四个环节各自要求参考项目标准层**，且提示词面按六键判文档面（存量漂移同轮修）。

- 回指：用户 2026-11-11 14:49 裁定（§1 已定决定）；评审面已由需求 `docs/core/requirements/ADVISOR-CONVERGENCE.md` §5.1「项目标准（方法论）」行覆盖，其余三席在需求层**无条目**——见本节末「上抛项」。
- 现象（实读读数，量法 = 逐档扫关键词 `standard|标准|规范|manual|guideline|methodolog|convention|准则|手册`，命令见「勘察证据（补）」）：四个环节的提示词里没有任何一处要求「参考项目标准」。`advisor-design.md` 有判据「Methodology compliance」但没点依据是谁；`persona-eng-coder.md` 全档 `standard` 命中 0；`persona-eng-designer.md` 仅「the standard you write」（语义无关）。
- 同一病第二处（真漂移，同轮修）：提示词面两处把 `docRoot` 写成五键，而代码 `REVIEW_ROOT_KEYS`（`thincoder-core/agent-tools/review-facts.mjs`）是六键（含 `standards`）⇒ 提示词把 `docs/core/standards/**` 判产品面（fail-closed），写面代码判文档面。**同一条判据两处相反。**

#### 单源落点 —— 判：规则句住 `discipline-engineering.md`，四席各写本席职责句

判据三条，按序：

1. **覆盖面**：`discipline-engineering.md` 进三套装配（主 agent ∥ eng-designer ∥ eng-coder，其槽头自述 consumers 明列三席）⇒ 规则句一落同时到三个执行手。评审席是自足装配——`advisor-design.md` 槽头自述「self-contained, NOT part of the main assembly chain」——看不到纪律层，故它的依据句必须指向它自己消息里那个段头。
2. **同题同档**：`docRoot` 的 doc face ∥ product face 判定就住这一档（含「面判定机器单源 = `thincoder-core/agent/write-face.mjs`」声明行），标准层本就是 `docRoot` 的一个层 ⇒ 同题不裂（D2）。
3. **不改指针为跨档档名**：提示词面无规范档引用（一句「见 `xxx.md`」把读的人送去别的档，而那档的字会变），故三处「引用」换指向物——指向**锚点本身** `docRoot.standards`（manifest 键，读的人当场读得到；档名不是）。这一点与用户「其余三处引用/回指」的意图同向，指向物改了，在此如实登记。

| 环节 | 档 | 目标句逐字（实施席照抄） | 判据（可复算） |
|---|---|---|---|
| 需求 | `thincoder-core/prompts/persona-engineering.md` | ②-row-a | 该档含 `docRoot.standards` ≥1 |
| 设计 | `thincoder-core/prompts/persona-eng-designer.md` | ②-row-b | 该档含 `docRoot.standards` ≥1 |
| 编码 | `thincoder-core/prompts/persona-eng-coder.md` | ②-row-c | 该档含 `docRoot.standards` ≥1 |
| 评审 | `thincoder-core/prompts/advisor-design.md` | ②-row-d | 该档含 `## Project Standards` ≥1 |
| （单源） | `thincoder-core/prompts/discipline-engineering.md` | ②-row-e | 该档含 `docRoot.standards` ≥1 |

**行 a · 需求 —— `persona-engineering.md`，紧接「Document directories are declared, not assumed」那段之后插入（同节、同题）：**

```text
**The requirement step reads the project's standards layer before it settles what is wanted**: where `docRoot.standards` declares one, the requirement set — acceptance criteria and boundary included — is settled against it, and a requirement that contradicts a standard goes to the user as a conflict to rule, never written as if the standard were not there.
```

**行 b · 设计 —— `persona-eng-designer.md`，紧接 `4. **Write the design** …` 那行之后插入（缩进 3 空格，与第 1 步子条同形）：**

```text
   - **The design is written against the project's standards layer**: where `docRoot.standards` declares one, the approach, the boundary and the acceptance criteria comply with it, and a design that departs from a standard names that standard and why — a departure ruled on, not one discovered during implementation.
```

**行 c · 编码 —— `persona-eng-coder.md`，插在「## Boundary: the design is the authoritative spec」节内、UI/interaction 那条之后：**

```text
- **The project's standards layer is part of the spec**: where `docRoot.standards` declares one, the code you write complies with those standards — a delivery that contradicts one is a defect, not a style preference.
```

**行 d · 评审 —— `advisor-design.md`，替换 Review Criteria 的第 3 条整行：**

```text
3. **Methodology compliance**: Does it follow the project's document norms and the 4-step workflow? The norms are the ones the review message carries under the fixed section header `## Project Standards` — judge the design against those standards files, not against norms you infer from the design itself. Is the design doc itself present (at any tier) — no doc ⇒ 🔴
```

依据：段头单源 = `thincoder-core/advisor/project-context.mjs`「parts.push("## Project Standards")」——评审消息里恒有这一段（三态由 §2.12 管），故判据可按名点它。

**行 e · 单源 —— `discipline-engineering.md`，在「## Change-face routing (doc face ∥ product face)」节之后、「## Basic flow (four steps, in order)」之前新增一节：**

```text
## The standards layer (project norms)

**The standards layer is `docRoot.standards` in the project manifest**: a directory whose `.md` files, subdirectories included, are the project's own rules — the programming standards, the manual, the conventions the project settled on. What each step owes it is stated in the seat that owns the step.
Why: the layer sits on disk and nothing forces a step to open it — a rule nobody reads is a rule the project pays for and does not get.
```

收窄两处（评审核对用）：

- **本句携带的机制前提只有一条：「层是目录、成员含子目录」（`subdirectories included`）**——执行手要知道该读的不是一份档、也不只是顶层，否则「标准在哪」这句落不到可操作的形态。它**不携带** §2.12「接口契约」拥有的其余细节（排序 ∥ 大小写不敏 ∥ 嵌套根去重 ∥ 注入预算），也不声明排他：机制面的单源仍是 `docs/core/design/MANIFEST.md` §2.12「接口契约」（键语义 ∥ 成员枚举 ∥ 序 ∥ 预算）。
- 粗体句由「Every engineering step reads …」改成「The standards layer is …」：职责句全部落在行 a / b / c / d 四席，本句不复述第二遍——它是四席句子的**公共前提**，不是第五句职责。

#### 五键 → 六键 —— 判：两处都**去枚举、点单源**，不改成六键字面

1. **改字面只是把今天的错补上，明天第七键再错一次**：这次漂移已经落地过一次（本批证据）。
2. **同档已有先例，照它办**：`discipline-engineering.md` 面判定节下一行原文「面判定机器单源 = thincoder-core/agent/write-face.mjs；本表与本行同义，冲突时以该档判据为准。」——同一个问题它已经把机器单源点出来了，键集照同一形办即可，零新判据。
3. **去枚举后提示词不再持第二把尺**：键集只在 `REVIEW_ROOT_KEYS` 那一处改（该常量已被 `write-face.mjs` / `doc-graph.mjs` 以「不另持字面」理由共用），提示词不再是一份会漂的副本。

替换文字两处：

```text
# discipline-engineering.md，doc face 行内的括号
  (requirements / specs / design / modules / batches)
→ (the key set is `REVIEW_ROOT_KEYS` in `thincoder-core/agent-tools/review-facts.mjs` — not retyped here)

# persona-engineering.md，「Document directories are declared, not assumed」整行
**Document directories are declared, not assumed**: the five `docRoot` subkeys — `requirements` / `specs` / `design` / `modules` / `batches` — say where each document class lives; the declared value is the path to use, and no directory path in this prompt is fixed.
→ **Document directories are declared, not assumed**: the `docRoot` subkeys — the layer set is `REVIEW_ROOT_KEYS` in `thincoder-core/agent-tools/review-facts.mjs`, not a list retyped here — say where each document class lives; the declared value is the path to use, and no directory path in this prompt is fixed.
```

**这一改动的是那段判据本身**（「目录是声明的，不是猜的」）：主语与结论一字不动，只把「哪五类」这一句换成正本指针——判据的力度不减，反而不再与代码相反。

### 验收对照（E2）

**AC-E2-a · 五席各有一句，且那句读得对（读者形为主，探针读数次之）**

- **判据（主）——读者与读哪几节写在判据旁**：读者 = 该环节的执行席，读本席那一档**被点名的那一节**，答一个问题：**「按这节读完，我知道本环节要对着 `docRoot.standards` 声明的标准层做事吗？」** 判「对」= 能逐字指出那一句；判「错」= 该节只有「the project's conventions」这类不指键的泛句。
- 点名节：`persona-engineering.md` = 「Document directories are declared, not assumed」段之后新增那段（行 a）· `persona-eng-designer.md` = Five-step workflow 第 4 步 `Write the design` 之下的子条（行 b）· `persona-eng-coder.md` = 「## Boundary: the design is the authoritative spec」节内、UI/interaction 条之后（行 c）· `advisor-design.md` = Review Criteria 第 3 条 `Methodology compliance`（行 d）· `discipline-engineering.md` = 新增的「## The standards layer (project norms)」节（行 e）。
- **判「错」的复现（改动前盘上原文即错侧）**：五档扫关键词全 0 命中（`persona-eng-coder.md` 全档零 `standard`）——读者读完那几节，指不出任何一句要他对标准层做事，也说不出标准层在哪声明。
- **读数（次，机检一格，与本条同档）**：内容由 AC-E2-c 的逐字目标句钉住 ⇒ 句子的**存在**再用探针复核一次，防「读者说在、盘上没有」。该探针只证明串在场，不证明句子读得对；读得对由上面那条读者判据负责，两者不互相顶替。

```text
probes = [["persona-engineering.md","docRoot.standards"], ["persona-eng-designer.md","docRoot.standards"],
          ["persona-eng-coder.md","docRoot.standards"], ["advisor-design.md","## Project Standards"],
          ["discipline-engineering.md","docRoot.standards"]]
量法 = split(token).length - 1；改动前五项全 0（基线读数），改动后逐项断言 ≥ 1
```

**AC-E2-b · 五键枚举从盘上消失（能红）**

- 探针正则（覆盖两处写法：无引号形 ∥ 反引号形）：``/specs`?\s*\/\s*`?design`?\s*\/\s*`?modules`?\s*\/\s*`?batches/``，范围 = `thincoder-core/prompts/*.md`。
- 改动前读数 = **2 命中**（`discipline-engineering.md` 1 · `persona-engineering.md` 1）；改动后期望 **0**。
- 同一命令里附一条对照读数：`REVIEW_ROOT_KEYS` 在 `thincoder-core/agent-tools/review-facts.mjs` 的定义行含 `"standards"`（改动前后恒真——它不是被测面，是参照物）。

**AC-E2-c · 零新增机制**：五个档的改动只增删上面逐字列出的句子；不新增工具、不加检查项、不加评审维度、不加兜底句。判据 = 逐档 diff 只落在所列锚点上（实施席在 §5 报 diff 行数比对）。

**RTM**：`test/RTM.md` 与 `test/rtm/*.md` **不加行**——E2 是提示词面，无业务可观察结果变化，也无用户入口（业务场景 ∥ 生产问题 两条门都不成立），故不立集成用例。

### 受影响文件（E2，补在上面那张表之后）

- 产品代码 · `thincoder-core/prompts/persona-engineering.md`：行 a + 五键行改指单源（两处）。
- 产品代码 · `thincoder-core/prompts/persona-eng-designer.md`：行 b。
- 产品代码 · `thincoder-core/prompts/persona-eng-coder.md`：行 c。
- 产品代码 · `thincoder-core/prompts/advisor-design.md`：行 d（替换 Review Criteria 第 3 条）。
- 产品代码 · `thincoder-core/prompts/discipline-engineering.md`：行 e（新增一节）+ doc face 行去枚举。
- 测试 · 本批单元测试档（`docs/batches/2026-11-11-standards-root-resolution.test.mjs`，收口删）：AC-E2-a ∥ AC-E2-b 两格。

**档层结论**：五个 `.md` 提示词档均为文档/提示词面，`thincoder-cli/AGENTS.md` 的「Documents (`.md`) are under no size obligation」覆盖之 ⇒ 无源档门槛、无拆分计划、不出行数；本批只判 AC-E2-c 的「diff 只落在所列锚点上」。

### 边界（E2 不做）

- **不写「没有标准档时怎么办」的兜底句**：那是三态机与 `docs/core/design/MANIFEST.md` §2.12 的活；提示词面只管「有，就该看」。
- **不加新机制**：不加工具、不加检查项、不加评审维度。
- **不碰** `thincoder-core/prompts/**`（产品码；本席只写目标句，实施席照抄落地）。
- **不动** `common.md` 那 9 处泛泛「the project's conventions」（它们不说具体键、与标准层不冲突，改它只会多一版）。
- **不动** `advisor-round1.md` ∥ `advisor-round2.md` ∥ `advisor-round3.md`（轮次档无 Methodology 判据，改它是扩面）。
- **不把「需求环节读标准层」往需求五要素里拆**（那属需求层，见上抛项）。

### 勘察证据（E2，补在「勘察证据行」之后）

- 盘上盘点（量法 = 逐档扫关键词 `standard|标准|规范|manual|guideline|methodolog|convention|准则|手册`，范围 `thincoder-core/prompts/*.md` 十七档）：`advisor-design.md` 2 · `common.md` 9 · `discipline-engineering.md` 6 · `persona-eng-designer.md` 2 · `persona-engineering.md` 2 · `persona-eng-coder.md` 0 · `persona-coder` / `persona-tester` / `subagent-base` / `consult-base` 各 0。父侧给的盘点与本席复扫**逐档同数**。
- 实读 `thincoder-core/prompts/advisor-design.md`（Review Criteria 1–6b 原文）、`persona-eng-coder.md` 全档、`persona-eng-designer.md` Five-step workflow、`persona-engineering.md` manifest 节、`discipline-engineering.md` Change-face routing 节。
- 实读 `thincoder-core/agent-tools/review-facts.mjs`「export const REVIEW_ROOT_KEYS = ["requirements", "specs", "design", "modules", "batches", "standards"]」；`thincoder-core/agent/write-face.mjs`「文档面键集**不另持字面**（单源 = `agent-tools/review-facts.mjs` 的 `REVIEW_ROOT_KEYS`…」。
- 库外：无外部断言（提示词文本改动，B 类）。内容锚断言的允许面依据 `docs/core/standards/METHODOLOGY.md` §1「内容锚断言 = 结构机检保留面封闭枚举」。

### 上抛项（需求层，主 agent 落）

- **需求 ∥ 设计 ∥ 编码三席的「读标准层」在需求层无条目**：`ADVISOR-CONVERGENCE.md` §5.1 只覆盖评审注入面。建议落点 = 该方法论机制的承载需求档，条目文字建议：「四环节（需求 ∥ 设计 ∥ 编码 ∥ 评审）各自在提示词面持一句『参考项目声明的标准层』；标准层是什么只写一处」——**落哪一档、怎么措辞由主 agent 定**，本席不写需求档。

### 设计档落点（本轮已落 · 读回核对）

- `docs/core/design/MANIFEST.md` §2.12「判据（三段式，三态互异）」块的 `base` 段**已改写为共用根推导**（`findProjectContextRoot`：① 范围项归属项目根 ∥ ② 会话锚归属项目根 ∥ ③ 两腿皆空 ⇒ `null`，调用方落 `agent.cwd`；①② 每次调用各自包护栏），判据块后补一条「两个消费者、一条 base，只一条推导」（含 `injectProjectGuide` 不在列、地图派生梯零改、第三参零缺省且 `null` 同拒、引「const base = root ?? agent.cwd」出处）。
- 同节另改两处旧句（读到即修，D8）：最近先例「注入形」那条的「**base 不再与其同源** … 文档地图仍降级」→「**base 同源** … 一起出正文，一起降级」；「边界（不做）」的「不改文档地图派生」→「不改派生梯——只换它读到的 base」。
- 「分支出处」表新增四行（三条腿各一行 + 护栏一行）；原表「态 1 / 态 2 / 态 3」各行未动。以上三段本席均已读回落盘。
- **提示词面（E2）不另立设计档层**：提示词句子是产品码自身的单源（`thincoder-core/prompts/**` 唯一副本），把每句再登记进设计档就是 D2 的重述；且 `docs/core/standards/METHODOLOGY.md` 记的落点即「方法论的设计落地 = 提示词 + 机制档承载细则」，无独立设计档。故 E2 的设计记录住本段 + 目标句逐字，不新增设计档章节。

### ④ 文档地图的根 —— 与标准层共用一条推导（用户 2026-11-11 14:52 并入本批）

**E3 条目 · 文档地图的 base 也按「被评审范围的归属项目根」解析**，与标准层共用同一条根推导；项目指南的根不动。

- 回指：用户 14:52 裁定（§1 之后的追加射程）；需求 `docs/core/requirements/ADVISOR-CONVERGENCE.md` §5.1 注入面表「文档地图」行（派生只从 `docRoot`；探不到 ⇒ `NO_DOC_MAP_NOTICE`）。
- 现象（实读 + 探针）：`injectDocumentMap` 的 base 与标准层同为 `root ?? agent.cwd`，`root` 同为 `findGuideRoot` 的返回值 ⇒ 同一锚下两段一起拿错根。探针读数（同一份操作数、只换 base）：

```text
base = 锚 D:\teamcode              → MAP ret=null（NO_DOC_MAP_NOTICE）· STANDARD ret=null（NO_STANDARDS_NOTICE）
base = 项目根 D:\teamcode\thincoder → MAP ret=…\docs\README.md           · STANDARD ret=…\METHODOLOGY.md
```

- 机制改动：一条根推导 = **`findProjectContextRoot`**（三条腿 + 逐腿护栏见 ①；它就是「一条根推导」本身）；两个消费者各取 `base = findProjectContextRoot(agent.cwd, scopeFiles) ?? agent.cwd`。`injectDocumentMap(agent, parts, scopeFiles)` 与 `injectProjectStandards` 同形、第三参同无缺省，`null` 同拒（契约见 ①）。
- **不动的三样**：`injectProjectGuide`（根 = 最近的 `AGENTS.md`，工作区有自己的指南不是错）∥ 地图派生梯（各声明根的 `README.md` → 全部声明根公共祖先的 `README.md`）∥ `DOC_ROOT_ORDER`（五键、不含标准层——地图问的是「哪个档拥有哪一节」，标准层是规则档不是分节归属）。

**AC-E3-a · 集成用例 24-7 扩成两段断言（能红）**

- 一段夹具、两段断言：同一锚 + 同一子项目 + 同一份范围文档 —— `## Project Standards` 段含标准档正文且不含 `NO_STANDARDS_NOTICE`，**且** `## Document Map` 段含子项目 `docs/README.md` 正文且不含 `NO_DOC_MAP_NOTICE`。
- 为何不拆成两条用例：被测交互只有一条——**一条根推导喂两个消费者**；两份同夹具的用例测同一件事，维护成本翻倍而不多测一层。
- **红条件**：上面探针那两行就是改动前基线（两侧同红）；改动后同一夹具两段都出正文。

**AC-E3-b · 项目指南零回归**：`injectProjectGuide` 的取根函数与实参不变；24-1…24-6 断言指南段的行一字不动，全绿。

**AC-E3-c · 契约面**：两函数第三参缺省即拒（见 AC-E1-c）。

**RTM**：分册 `test/rtm/batch-ledger.md` 故事 24 的 `24-7` 行期望列含两段断言（一行一用例，行数不变）；`test/RTM.md` 索引表仍不加行。

**边界（E3 不做）**：不动项目指南的根；不动地图派生梯与 `DOC_ROOT_ORDER`；不给标准层与地图各造一条推导（那正是本批要消的重复）；不改 `no.project` / 工作区态的判定语义。

### 轮 3 修正（收口前 · 笔域内两处过期句 —— 实施席 §5 上抛）

两处都住 `docs/core/design/MANIFEST.md` §2.12，同一病理：**改后仍指着改前的盘上文字**。只动这两处，判据、验收条、边界一字未动。

**改法一 · 「两个消费者、一条 base」条的依据行 —— 引文换现值**

```text
改前：依据 …「const base = root ?? agent.cwd」（injectDocumentMap）与「const base = root ?? agent.cwd」
      （injectProjectStandards）——同一条表达式、同一个 guideRoot 来源，两条消费者同时在同一个锚下拿错根。
改后：依据 …「const base = findProjectContextRoot(agent.cwd, scopeFiles) ?? agent.cwd」
      ——两个函数体内各一行、逐字同一条表达式。
```

- 为什么：那句旧表达式在本批改后的盘上零命中 ⇒ 锚判判 `引缺` ⇒ 收口 gate 到该档即 REFUSED。依据引文必须是盘上能逐字命中的一串。被删掉的「两条消费者同时在同一个锚下拿错根」是改前状态的叙述，现态不留（D8）。
- 实读：`injectDocumentMap` 体内 ∥ `injectProjectStandards` 体内各一行同串，逐字即改后引文那句。

**改法二 · 「调用点实读」条 —— 错判断换成事实，读数保留**

```text
改前：**调用点实读（今日既有面，本批不改）**：… injectDocumentMap 恰一处（设计评审轮 0 路），
      injectProjectStandards 两处 ⇒ 代码评审路不注文档地图。
改后：**调用点实读（档数与位置不变，实参换成范围项）**：… injectDocumentMap 恰一处（设计评审轮 0 路）、
      injectProjectStandards 两处，三处一律传 scopeFiles（该档组装函数头把 [...pathList, ...docList]
      算一次，四个调用点共用）；injectProjectGuide 一处照旧 ⇒ 代码评审路不注文档地图。
```

- 为什么：「本批不改」与三处实参同轮换成范围项的事实相反；「几处、在哪里」的读数不动，只换那句判断。
- 实读：`thincoder-core/advisor/messages.mjs` 里 `injectProjectStandards` 两处调用 ∥ `injectDocumentMap` 一处调用，实参均为 `scopeFiles`；`injectProjectGuide` 另有一处，取根未改。

两处的门读数在返回报告里（`doc_check` gate 首行）。

## §3 设计评审（评审子代理）
**状态行**：评审通过



### 轮次 1（评审子代理）

| # | 严重度 | 状态 | 证据（指针） |
|---|---|---|---|
| 1 | 🔴 | 待处置 | §2「① 的护栏」只给腿①配护栏；腿②无。`thincoder-core/manifest-discovery.mjs` 的 `owningProject` 体内 `const st = statSync(dir, { throwIfNoEntry: false })` 无 try/catch；`docs/core/design/MANIFEST.md` §2.2 `projectRootView` 条「I/O 异常照原样上抛」。抛错落在 `injectProjectStandards` 自身 try/catch（只包 `readManifest`）之外 ⇒ 与「本面不得中断评审消息组装」相反；该护栏亦无验收格 |
| 2 | 🔴 | 待处置 | §2 ② 判「改后态 1 只由两件事触发」「无路径可达」不成立：`docs/core/design/MANIFEST.md` §2.12「判据」有「`read.ok === false`（档非法 / 档缺失）⇒ 走 `DEFAULT_MANIFEST`（`std = null`）⇒ 态 1」，同节「分支出处」有「态 1：manifest 非法 … 复现：档内写非法 JSON」⇒ 与批档「且无复现读数」相反；`thincoder-core/manifest.mjs` 的 `readManifest` 对合法 JSON + 非法值返 `reason: "invalid"` 而 `manifest` 非 null |
| 3 | 🟡 | 待处置 | §2① 「`guideRoot` 同时喂 `injectDocumentMap`…设计评审路与代码评审路各一处」与实读不符：`thincoder-core/advisor/messages.mjs` 恰一处（设计评审轮 0 路）；同段「受影响文件」自己写「一处」 |
| 4 | 🟡 | 待处置 | §2 ② 残留格理由「工程模式会话必有项目」不成立：工作区锚 + 工程模式 ⇒ `projectView` 报 `workspace`、`agent.manifest` 为 null（本批 §1 即此现场）；且 `thincoder-core/advisor/messages.mjs` 的「Backward-compatible fallback (no documents)」使空范围不是死路 |
| 5 | 🟡 | 待处置 | 第三参契约只定 undefined（「不传就当场拒」）；`null` 无定论，`findProjectContextRoot(cwd, null)` 在 `for…of` 上抛 ⇒ 同一条不变量破口。零缺省先例未引：`thincoder-core/prompts/persona-eng-designer.md` 第 3 步子条「Design parameter contracts with zero defaults」 |
| 6 | 🟡 | 待处置 | §2① 「多项目并列 ⇒ 取首个」无场景来源（读数 ∥ 日志 ∥ 回报 ∥ 复现命令皆无），且是同一句假话的第二条通路：首个范围项所属项目未声明本键、后一个声明 ⇒ 态 1 句 |
| 7 | 🟡 | 待处置 | §2「档层结论」预载行数「= 413 · = 302」与设计档「1464 行」；判据要结论 + 命令，`.md` 明确禁行数读数（Project Guide 文件尺寸条）；同档 §2.12 既有「读数不预载」先例。复核（`doc_check` `lines`）= 412 ∥ 301 ∥ 284，结论本身成立 |
| 8 | 🟡 | 待处置 | §2「档层结论」只判文件层，函数层（单函数 300 行 +）无读数，而本批给 412 行的 `thincoder-core/advisor/project-context.mjs` 新增一函数；同档 §2.12 有「函数层结论」先例 |
| 9 | 🟡 | 待处置 | 行 e「what the layer is, is stated here and nowhere else」与 `docs/core/design/MANIFEST.md` §2.12「接口契约」的层定义并存（同一描述两处）；且行 e 粗体首句「Every engineering step reads the project's standards layer…」本身已陈述职责，与三席职责句重叠 |
| 10 | 🟡 | 待处置 | `findProjectContextRoot` 无三问行（住哪 · 逐字名 · 谁用）；该引先例在 `docs/core/design/LEDGER.md`「`findGuideRoot` … 两问不同，名字不复用」 |
| 11 | 🔵 | 待处置 | AC-E2-a 是 token 在场探针，非「读者读哪几节、什么叫对」形；同批被改的 `thincoder-core/prompts/persona-eng-designer.md` 自己写着「A criterion is judged by a reader, and that reader is named beside it」 |

已核为正面的四件（不立条目，逐条列出）：

- 腿①可行：`projectRootView` 经 `thincoder-core/manifest.mjs` 转口，该档已在 `thincoder-core/advisor/project-context.mjs` 的 import 面。
- 单源落点成立：`prompt-overlays.mjs` 三套装配各含 `discipline-engineering.md`；`advisor-design.md` 槽头「self-contained」。
- 四句锚点均在盘：`persona-engineering.md` 的「Document directories are declared, not assumed」段、`persona-eng-designer.md` 第 4 步行 + 3 空格子条形、`persona-eng-coder.md` 的「## Boundary」节 UI/interaction 条、`advisor-design.md` Review Criteria 第 3 条。
- 键集漂移实存：`thincoder-core/agent-tools/review-facts.mjs` 的 `REVIEW_ROOT_KEYS` 实为六键；两处五键字面实在 `persona-engineering.md` ∥ `discipline-engineering.md` ⇒ AC-E2-a / AC-E2-b 可红可绿。

VERDICT: changes-required

计数：🔴 2 · 🟡 8 · 🔵 1（共 11 条，未处置 11）。

### 轮次 2（评审子代理）

轮 2 · 只核轮 1 的 11 条落地（不狩新项），逐条按盘复核。

| # | 严重度 | 状态 | 证据（指针） |
|---|---|---|---|
| 1 | — | 已处置 | §2「护栏 = 整个 `findProjectContextRoot` 的，两腿同语义」+ `docs/core/design/MANIFEST.md` §2.12 判据块「护栏 = ①② 每次 projectRootView 调用各自包 try」；AC-E1-d 场景 + 复现操作数 |
| 2 | — | 已处置 | §2 ②「改后态 1 由**三件事**触发」+「它**不是没有复现**」；残余按 §2.12「档非法的报明面在会话状态行」如实登记不改 |
| 3 | — | 已处置 | §2①「`injectDocumentMap` **恰一处**（设计评审轮 0 路）」+「**代码评审路今天不注文档地图**」 |
| 4 | — | 已处置 | §2 ② 第八条「这一格的真理由不是「工程模式必有项目」，而是**没有操作数指向任何项目**」 |
| 5 | — | 已处置 | §2「第三参契约（零缺省，`undefined` 与 `null` 同拒）」+「**不归一成 `[]`**」+ 零缺省先例一条 |
| 6 | — | 已处置 | §2①「**多项目并列取首个的出处 = 排序不变量，不是新场景**」+「**它的代价如实记**」 |
| 7 | — | 已处置 | §2「档层结论（判据 + 失败侧；读数不预载）」——盘上已无行数读数 |
| 8 | — | 已处置 | §2「函数层」设计约束 ≤ 40 行 + 两条失败侧；§2.12「单函数层结论」同句 |
| 9 | — | 已处置 | 行 e 粗体句 =「The standards layer is `docRoot.standards`…」；「nowhere else」已删 |
| 10 | — | 已处置 | §2「三问 × 新名 `findProjectContextRoot`」表（住哪 ∥ 逐字名 ∥ 谁消费） |
| 11 | — | 已处置 | AC-E2-a「判据（主）——读者与读哪几节写在判据旁」，探针降为读数 |
| N1 | 🟡 | 新（建议，不阻断） | AC-E1-d 失败侧「护栏只包腿 ①、腿 ② 裸调」不可由其夹具造出：腿 ① 命中即止 ⇒ 腿 ② 不进 |
| N2 | 🟡 | 新（建议，不阻断） | 批档「非法时 `manifest` 仍非 `null`」∥ `docs/core/design/MANIFEST.md` §2.12「分支出处」「（`reason:"invalid"`, `manifest:null`）」 |
| N3 | 🟡 | 新（建议，不阻断） | §2 ② 第九条「带范围的评审造不出它」与 `docs/core/design/MANIFEST.md` §2.2 `projectRootView` 的「归属无命中 ∧ `discoverProjects` 报 `workspace`」相反 |
| N4 | 🟡 | 新（建议，不阻断） | 行 e「subdirectories included」是 §2.12 成员规则的重述，与同段收窄说明「不重述那些细节」相抵 |
| Y | — | 已核 | 四处同轮清扫 = 对账：E3（用户 14:52 裁定）使「不再同源」「不改文档地图派生」两句必改；两处→三处、三行→四行 = 计数 |

VERDICT: pass

计数：🔴 0（轮 1 两条均已落地）· 🟡 4（新，均非阻断）· 已处置 11。

## §4 用户批准（主 agent）

## 用户批准（主 agent）

**起点是用户 14:39 的一句问**：「我要求使用者把手册、编程规范之类都整理到一个目录里，然后挂在 manifest 的 standards 了，我希望你盘点一下，thincoder 是否正确的使用了这个键值，别我整进去了，结果谁也不看，那就白干了。」

时间线：

```
2026-11-11 14:39  「盘点 standards 键是否真被用」        → 父侧实读四处消费面 + 定位根解析缺口
2026-11-11 14:45  「可以」                              → 批准开批修注入
2026-11-11 14:49  「2」                                 → 提示词面并入本批（原 A/B/C 选 B）
2026-11-11 15:07  「评审，自动推进，有问题现场处理别挂账」 → 全链自动推进
2026-11-11 15:48  「这两个先干完」                       → 指定收尾
```

**批准范围 = §2 的 E1 ∥ E2 ∥ E3 与验收 AC-E1-a…d ∥ AC-E2-a…c ∥ AC-E3-a…c。**

**设计评审两轮**：第 1 轮 `changes-required`（2 🔴 ∥ 8 🟡 ∥ 1 🔵）→ 第 2 轮 `VERDICT: pass`（0 🔴，新报 4 条非阻断）；四条余项与收口前两处漂移由父侧裁定并入。

**不在本批范围内**：`injectProjectGuide` 的根（正确语义，零改）· 三态文案与 `docRoot.standards` 声明形态 · 数据档非法仍落态 1（登记不改，理由 = 既有裁定「非法档的报明面在会话状态行」）。

## §5 实施记录（eng-coder）

### 交付摘要（逐面）

**E1 · 标准层的根按「被评审项目的项目根」解析**

- `thincoder-core/advisor/project-context.mjs`：新增导出 `findProjectContextRoot(cwd, scopeFiles)`——本模块唯一的**项目根**推导，三段任一命中即止：① 评审范围项的归属项目根（逐项 `projectRootView`，首个 `state === "ok"` 即止）∥ ② 会话锚自身的归属项目根（同形，仅 `ok`）∥ ③ 两腿皆空 ⇒ `null`（调用方落 `agent.cwd`）。①② 的每一次 `projectRootView` 调用各自包 `try`（抛 ⇒ 跳过该项 / 该腿，其余照走）。
- 同一档：`injectProjectStandards` ∥ `injectDocumentMap` 的第三参改为 `scopeFiles`（**无缺省**），base = `findProjectContextRoot(agent.cwd, scopeFiles) ?? agent.cwd`；两个函数的 base 都算在 `parts.push` 之前（契约不合时消息里不留半段）。三态语义、四句降级文案、态 3 用途句、`collectStandardDocs` 的成员枚举 / 序 / 去重 / 预算一字未动。
- `thincoder-core/advisor/messages.mjs`：组装函数头部取一次 `const scopeFiles = [...pathList, ...docList]`，四个调用点共用（指南 ∥ 标准层两处 ∥ 文档地图一处）；`injectProjectGuide` 的取根函数与行为零改。

**E3 · 文档地图与标准层共用同一条推导**

- `injectDocumentMap` 只换 base 的来源；派生梯（各声明根 `README.md` → 全部声明根公共祖先的 `README.md`）与 `DOC_ROOT_ORDER`（五键、不含标准层）零改。

**E2 · 提示词面（五个档，行 a–e 逐字）**

| 环节 | 档 | 落点 | 陈述内容 |
|---|---|---|---|
| 需求 | `thincoder-core/prompts/persona-engineering.md` | 「Document directories are declared, not assumed」段之后另起一段 | 需求环节先读标准层；与标准冲突的需求上抛用户裁定 |
| 设计 | `thincoder-core/prompts/persona-eng-designer.md` | Five-step workflow 第 4 步之下的子条（3 空格缩进） | 设计对着标准层写；偏离须点名该标准与理由 |
| 编码 | `thincoder-core/prompts/persona-eng-coder.md` | 「## Boundary: the design is the authoritative spec」节内、UI/interaction 条之后 | 标准层属规格面；违反即缺陷，不是风格偏好 |
| 评审 | `thincoder-core/prompts/advisor-design.md` | Review Criteria 第 3 条整条替换 | 方法论符合度的准绳 = 评审消息 `## Project Standards` 段携带的那几份档 |
| （单源） | `thincoder-core/prompts/discipline-engineering.md` | Change-face routing 与 Basic flow 之间新增一节 | 标准层是什么（`docRoot.standards`：目录、成员含子目录）；各环节欠它什么由各席自述 |

- 键集去枚举两处：`persona-engineering.md` 的「Document directories are declared, not assumed」整行、`discipline-engineering.md` doc face 行的括号 ⇒ 均改成「the key set is `REVIEW_ROOT_KEYS` in `thincoder-core/agent-tools/review-facts.mjs`」，不再重列键名。

### 要求与状态（一行一条，对应 §2 的验收点）

| # | 要求 | 状态 |
|---|---|---|
| E1 | 标准层的 base = 被评审范围项的归属项目根；`findProjectContextRoot` 三腿 + 逐腿护栏 + 第三参零缺省 | ✅ 完成 |
| E3 | 文档地图与标准层共用同一条推导；项目指南的根不动 | ✅ 完成 |
| E2 | 四个环节 + 单源档各一句；doc face 两处去五键枚举、改指 `REVIEW_ROOT_KEYS` | ✅ 完成（逐字，折行见披露 1） |
| AC-E1-a | 新增集成用例 24-7（一段夹具、两段断言），改动前红、改动后绿 | ✅ 完成 |
| AC-E1-b | 24-1…24-6 断言句与夹具不动；24-1 第二半直调补 `[]` | ✅ 完成 |
| AC-E1-c | 三个导出 × {不传, `null`, 非数组} = 九格当场拒，拒因点名参数与值 | ✅ 完成（本批单元测试档） |
| AC-E1-d | 格一（腿 ① 行为格）+ 格二（腿 ② 直调格）各自能红 | ✅ 完成（本批单元测试档） |
| AC-E2-a | 五档各含本席那串（读者形为主、探针为次） | ✅ 完成 |
| AC-E2-b | 五键枚举从提示词面清零（正反对照在同一格里） | ✅ 完成 |
| AC-E2-c | 五个档的改动只落在所列锚点上 | ✅ 完成（逐档比对见下） |
| AC-E3-a | 24-7 两段断言（标准层 + 文档地图） | ✅ 完成 |
| AC-E3-b | 项目指南零回归 | ✅ 完成 |
| AC-E3-c | 两个注入器第三参缺省即拒 | ✅ 完成 |
| RTM | `test/rtm/batch-ledger.md` 故事 24 加 `24-7` 行 + 节注；`test/RTM.md` 不加行 | ✅ 完成 |

**AC-E2-c 的逐档比对**（量法 = `git diff --stat`，范围 = 五个提示词档）：

| 档 | 增 / 删 | 落点 |
|---|---|---|
| `thincoder-core/prompts/persona-engineering.md` | 5 行 / 1 行 | 行 a（折 2 行）+ 五键行改指（折 2 行） |
| `thincoder-core/prompts/persona-eng-designer.md` | 2 行 / 0 行 | 行 b（折 2 行） |
| `thincoder-core/prompts/persona-eng-coder.md` | 1 行 / 0 行 | 行 c（单行） |
| `thincoder-core/prompts/advisor-design.md` | 3 行 / 1 行 | 行 d（折 3 行，替换第 3 条整条） |
| `thincoder-core/prompts/discipline-engineering.md` | 7 行 / 1 行 | 行 e（新节 5 行）+ doc face 行括号 |

- 没有新增工具、检查项、评审维度或兜底句；其余行一字未动（逐档 diff 只含上表落点）。

### 决定披露（本席自行决定、设计未逐字写明的四处）

1. **提示词逐字目标句折行（5 处句子，不改一个字）**：§2 的行 a / b / d / e 与 `persona-engineering.md` 的替换行整行为一字时分别超出提示词面行宽判据（`doc_check` 的 lineMax = 300）；落法 = 在句界或逗号处折行、续行按邻条缩进，word 序列与 §2 目标句逐字相同（空白归一比对七处全部命中）。若不折行，交付门（`doc_check` gate）会以「行太长」拒。
2. **`test/integration/review-standards-injection.test.mjs` 的切段辅助函数改锚点**：`standardsSection` 原按裸串 `## Project Standards` 取首现；行 d 落盘后 `advisor-design.md`（设计评审的系统提示词）里也含这一串，首现落进系统提示词 ⇒ 24-3 的整段相等断言当场红（复跑发现，非审计发现）。改法 = 段头按「行首 + 段名」认（请求体里的转义换行形）；断言句一字未改。
3. **两条护栏的 catch 各补一行 `console.warn`**（内部代码评审 🟡）：不改控制流、不新增降级文案；与本档另两处降级（AGENTS.md ∥ 文档地图不可读）同形，让「两腿皆空 ⇒ 落回 `agent.cwd`」这一步在盘上可追。
4. **`scopeFiles` 算一次、四个调用点共用**（内部代码评审 🔵）：原来是同一表达式写四遍；算一处后，指南 ∥ 标准层 ∥ 文档地图拿到的确实是同一份列表（「一条 base」的前提）。零语义改。

### 上抛父侧 / 建议另立账（本席无写权）

- `docs/core/design/MANIFEST.md` §2.12 两处需同轮正（eng-designer 笔域，本席未改）：(a)「两个消费者、一条 base」条的依据句仍引改前表达式 `const base = root ?? agent.cwd`，该串在 `thincoder-core/advisor/project-context.mjs` 已零命中 ⇒ `doc_check` 的锚判会判 `引缺`；(b)「调用点实读（今日既有面，本批不改）」与三处调用点本批同轮改实参不符。
- `injectProjectGuide` 的 `scopeFiles = []` 缺省保留（§2 边界明写不动该函数的行为）：与两个注入器的零缺省同参不同契约，建议另立一行账，由父侧择轮统一。
- `docs/core/design/PORTABILITY.md` 的注入面表列 `findProjectRoot`（旧名，现为 `findGuideRoot`）：存量漂移，与本草无关，仅记录。

### 自审与评审轮次（终态 = clean / converged）

- **内部偏离审计（explore，只读，1 轮）**：逐条核 §2 的九个验收点 + 五个提示词档逐字 + 「不动」项 + 超清单——`VERDICT: clean`，零超清单（10 档全落在 §2 两张受影响文件表内），无部分实现、无静默简化。附注两条不计偏差：24-1…24-6 的夹具铺设抽成 `projectFiles(root)` 复用（夹具内容逐字未变）；测试档尾部缺换行（已补）。
- **自修（1 轮）**：按内部代码评审的 🟡 / 🔵 落三项（护栏告警、`scopeFiles` 算一处、档注措辞收窄为「本模块唯一的**项目根**推导」）；随后复跑两条测试档时发现并修掉披露 2 的切段回归。
- **内部代码评审（advisor，code 轨，1 轮）**：`VERDICT: pass`——🔴 0 · 🟡 3 · 🔵 6。三条 🟡 的处置：MANIFEST.md 依据句过期与批档「`guideRoot` 只喂 injectProjectGuide」句 ⇒ 设计席笔域，已上抛（见上节）；本段 §5 原本空缺 ⇒ 本轮补齐。六条 🔵：三条已落（见披露 3 / 4 与档注），三条登记（`injectProjectGuide` 缺省、一次评审两腿各走一次盘上走查的代价、代码评审路的 base 无一格集成证据——设计未列该格，本席不扩面）。
- **终态**：clean（converged）。判定依据 = 下列复跑读数全绿 + 交付门首行 `DOC-CHECK GATE: PASS`。

### 复跑读数（命令 + 结论；绝对值只住本段）

```text
node --test test/integration/review-standards-injection.test.mjs
  → tests 7 · pass 7 · fail 0（24-1…24-6 零回归，24-7 新增绿）

node --test docs/batches/2026-11-11-standards-root-resolution.test.mjs
  → tests 5 · pass 5 · fail 0（AC-E1-c 九格 ∥ AC-E1-d 两格 ∥ AC-E2-a ∥ AC-E2-b）

node --check thincoder-core/advisor/project-context.mjs
node --check thincoder-core/advisor/messages.mjs
node --check test/integration/review-standards-injection.test.mjs
  → 三档语法过（零输出即通过）

doc_check(mode:"gate", docs=[test/rtm/batch-ledger.md + 五个提示词档])
  → 首行 DOC-CHECK GATE: PASS（6 档全清）

量法 = node 逐行字符数（thincoder-core/prompts 五档）
  → 最宽行 300 / 299 / 283 / 293 / 292，五档均无 >300 行

量法 = node 正则扫 thincoder-core/prompts/*.md（五键斜杠序列）
  → 改后 0 命中；同一正则对改前两种写法（反引号形 ∥ 无引号形）各 1 命中（正则活着）

node scripts/prompt-refs-check.mjs（仓根零参）
  → 命中集合与本笔改前同：persona-engineering.md 的 BATCH-RECORD.md 引文在 HEAD 即在盘；
    其余 7 条落在 .mjs（另一批在途改动面）⇒ 本笔新增文本零命中

红侧基线（改动前同一份操作数，量法 = node 直调旧式 base = 锚）
  → readManifest(锚) = { ok:false, reason:"missing" } · std = null · findDocumentMap(锚) = null
  ⇒ 态 1 句（NO_STANDARDS_NOTICE）+ NO_DOC_MAP_NOTICE；改动后同一夹具两段都出正文
```

**补记（末笔 = 注释引文收正）**：`findProjectContextRoot` 的档注原把两段契约文字拼成一个带省略号的引文，已改成单个连续片段「I/O 异常照原样上抛」；末次复跑两条测试档合计 `tests 12 · pass 12 · fail 0`，交付门六档 `DOC-CHECK GATE: PASS`。

## §6 验证与收口（父代理）

## 验证与收口（主 agent）

### 父侧复跑

```
review-standards-injection（集成 7 例）+ 本批单测（5 例）  12 / 12 pass（收口前跑，单测档跑完即删）
doc_check(mode:"gate")  MANIFEST.md ∥ 本批档              PASS · 0 段有问题（2 档全清）
```

**引文 ↔ 盘面**（父侧逐串核）：

```
MANIFEST 旧表达式 `const base = root ?? agent.cwd`              0 命中
MANIFEST 新表达式 `findProjectContextRoot(...) ?? agent.cwd`    2 命中
project-context.mjs 同一串                                       2 命中   ← 引文与代码逐字对上
```

**行数读数**（量法 = `doc_check` 的 `lines`）：`project-context.mjs` 412 ∥ `messages.mjs` 301 —— 均未越 500，本批不触发分拆。

### 交付了什么

| 目标 | 条目 | 落点 |
|---|---|---|
| 标准层根解析 | E1 | `findProjectContextRoot(cwd, scopeFiles)`：范围项归属根 → 锚自身归属根 → `null`；两腿各包 `try`；第三参零缺省（`undefined` ∥ `null` 同拒） |
| 文档地图同源 | E3 | 两个消费者共用同一条推导；`injectProjectGuide` 零改 |
| 四环节读标准 | E2 | 需求 ∥ 设计 ∥ 编码 ∥ 评审 各一句；规则句单源住 `discipline-engineering.md`；两处五键枚举改指 `REVIEW_ROOT_KEYS` |

**效果（实施席实跑）**：会话锚 `D:\teamcode`（工作区根）+ 范围项指向本仓 ⇒ base 落到 `D:\teamcode\thincoder`，标准层取到 `docs/core/standards/METHODOLOGY.md`、地图取到 `docs/README.md`，**两句降级语都不再出现**。

### 本批新债

**0 条。**

### 未做的

```
数据档非法（reason:"invalid"）仍发态 1 句    登记不改——既有裁定「非法档的报明面在会话状态行」
injectProjectGuide 的 scopeFiles 缺省与另两注入器不同契约   另立账择轮统一
PORTABILITY.md 注入面表列旧名 findProjectRoot（现 findGuideRoot）  存量漂移，与本批无关
```

### 收口结论

键不再空转：四处消费面全部接通，注入路径在工作区锚布局下取到正确根，四环节提示词各持一句义务。**本批单测档已按零留存删除。**
