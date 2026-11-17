# 2026-11-10 · code-paths-no-default
> 六段，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 每段只有一个作者：作者的段可 `append` 加内容、可就地改（`edit`）；非作者一概拒。
> 编制：主 agent · 2026-11-10 · 来源 = 用户 2026-11-10 04:37「不要带这个默认值」。
> 台账 = #2270（core · 归批）。前情 = 无（独立批）。
## §1 讨论（主 agent）
**状态行**：已收口 2026-11-10
<§1 模板占位：本批条目 / 关键判据 / 授权口径>

## 讨论与路由（主 agent）

### 来源与授权

- **用户提问（原话）**：「**manifest工具会默认写codePath？为啥要有这个？**」
- **用户裁定（原话）**：「**不要带这个默认值。**」（2026-11-10 04:37）——对象 = `DEFAULT_MANIFEST.codePaths` 的 `["src"]`。
- **父侧对来由的记录**：父侧答了该默认值的作用（一组目录段名，决定「这条路径算代码还是算文档」；默认规则是「`.md` ⇒ 文档」，而代码目录下的 `.md` 常是产品的一部分），并指出本仓 `codePaths: ["src"]` 挂着、而根下没有 `src/` 目录 ⇒ **写着但不生效的配置项比没有更糟**。用户听后给出上述裁定。

### 库内 = 已查

- `DEFAULT_MANIFEST` 的三个读面同源（`init` 写源 ∥ `fillDefaults` 补默认 ∥ `buildDeclaration` 的 `?? [...DEFAULT_MANIFEST.codePaths]`）⇒ **改 `DEFAULT_MANIFEST.codePaths` 一处，三面同时改观**；只让 `init` 少写那个键无效（`fillDefaults` 会补回来）。
- `classifyPath` 的代码段是**段名、任意深度匹配**（`thincoder-cli/src/**` 这类同样命中）——**父侧早期按「根下有没有 `src/`」判断是错的**，已在本批纠正并写进设计。
- 本仓 `PROJECT-MANIFEST.json` 现带**显式** `"codePaths": ["src"]`，是文件里的值、不是默认值。

### 库外 = B 类

`库外 = B 类：改动面 = manifest-schema 默认值 + declaration 装载 + 三份设计档 + 需求层 F9/N1；外部断言 = 零`（不新增依赖、不调外部 API、不对第三方行为下结论）。

### 已定决定

- **已定决定**：默认值 `[`"src"`]` 去掉（`init` 不再带它、读面无默认段）· 用户原话：「不要带这个默认值。」· 时间：2026-11-10 04:37
- **已定决定**：需求层 `PORTABILITY.md` 的 **F9 ∥ N1** 随本改动同轮改——F9 从「代码段优先级在前（`src/test/**` 仍判 code）」改为「代码段只来自项目声明、无内置默认；未声明仓里同一路径判 `aux`」；N1 从「默认判据（`src` 为代码面）对既有项目行为一致」改为「未声明代码段的项目按无代码段分类，code→doc/aux 是有意变更，不算假阳」· 时间：2026-11-10 04:50（父侧笔）

### 父侧两处判断被设计席否定（记档，父侧认它）

1. **「本仓没有 `src/` 目录 ⇒ 该默认值一次没生效过」——错**。段名任意深度匹配，`thincoder-cli/src/**` 等命中；父侧据此动过本仓 manifest，已改回。
2. **「一个写着却不生效的默认段比没有更糟」——不能用作理由**（与上一条同根）。设计席改用「**默认段不是便利缺省，而是产品替项目下的一条判据**」，评审判其更准。

### 本批不做什么（边界）

- **不动 `docRoot` 的其他键**，不动 `index.*` 的默认面。
- **不改本仓 manifest 的 `codePaths`**——它已显式声明，与默认值无关。
- 不迁移任何既有仓的旧值（KD-M1-11 口径：旧值不迁移）。

## §2 批次任务与设计（eng-designer）
**状态行**：设计完成
<§2 模板占位：本批条目（覆盖） / 设计档落点 / 机制设计 / 受影响文件与测试覆盖 / 验收对照 / 关键决策 / 上抛项>

**本批覆盖条目**

- 台账 `#2270`（core · 归批）：`manifest init` 写出的默认档不带 `codePaths: ["src"]`。用户 2026-11-10 原话「不要带这个默认值」。

**设计落点（现有档，零新建）**

- `docs/core/design/MANIFEST.md`：§2.2 `DEFAULT_MANIFEST` 行 + `codePaths` 键条目 · §2.4 KD-M1-31 · §2.10 键目录 `codePaths` 行 · §2.11 接口契约 `DEFAULT_MANIFEST` 行 · §3.1 AC-31 · §3.2 T56。
- `docs/core/design/PORTABILITY.md`：§2 默认判据行 · §3.1 声明语义行 · §3.2 分类语义（`code` 一支 ∥ 优先级句 ∥ 面判读数第 4 行）· §5 T-26 ∥ T-27 ∥ T-36 ∥ T-37。
- `docs/core/design/MEMORY.md`：§6.14 面⑦ 条目三键行 + 键面表 `codePaths` 行。

```text
派单提到的 PROJECT-MANIFEST.md 在 docs/core/design/ 下不存在（本仓设计目录无此档）；
codePaths 默认值的权威档 = MANIFEST.md（schema 面）∥ PORTABILITY.md（分类面）。未新建第二份。
```

**机制设计：改哪一处，默认值才真的消失**

读默认值的面有三个，全部取自同一个常量：

- 建档写源：`initManifest` 走 `writeManifest(cwd, DEFAULT_MANIFEST, …)`，逐字写 `DEFAULT_MANIFEST` ⇒ 档里带什么由它定。
- 读面补默认：`fillDefaults` 以 `DEFAULT_MANIFEST` 起底，档里缺该键就补回。
- 声明投影：`buildDeclaration` 的 `normalizeCodePaths(m?.codePaths) ?? [...DEFAULT_MANIFEST.codePaths]`；`DEFAULT_DECLARATION = buildDeclaration(null)` 走同一兜底。

⇒ 改 `thincoder-core/manifest-schema.mjs` 的 `DEFAULT_MANIFEST.codePaths` 一处（`["src"]` → `[]`），三面同时改观；单源不变，兜底表达式不必动。

**为什么不走「只让 init 少写这个键」**：`fillDefaults` 会把 `["src"]` 补回来——档看起来干净、行为零变，等于把「写着不生效」换成「不写却生效」，比现状更难发现。本批改的是默认值本体。

**改后「未声明代码段的仓」得到什么**

分类优先级 = 代码段 → temp → doc → aux → state → 兜底 code。第一支恒不命中 ⇒ 变化面只有「文档后缀文件落在代码段内」这一类：

```text
路径（档内未声明 codePaths）   改前                 改后
src/x.md                      code（src 段命中）    doc（扩展名判据命中）
src/x.mjs                     code（src 段命中）    code（兜底）
test/x.mjs                    aux                   aux（零变）
```

**变化落在哪些面**：六面变判 + 两面零变（父侧门 ∥ 写闸与文档机检），共八行，逐行表住 `docs/core/design/MANIFEST.md` §2.4.1「`codePaths` 缺省值：`["src"]` → `[]`（逐面对照）」节（本段不复述——D2）。两条要点：

- **零变两面**：父侧门（判据 = `faceOf`，不读 `classifyPath`；依据 `thincoder-core/agent/dispatch.mjs` 头注）∥ 写闸与文档机检（`writeManifest` 判 writer；`doc_check` 判集 = `docRoot` 声明）。
- **变判六面**：评审陈旧判定 ∥ `isDocOnlyChange` ∥ `hasCodeMutations` ∥ verify 快路径 ∥ 索引范围 ∥ `declared` 旗。

**这些仓怎么声明回来**：`PROJECT-MANIFEST.json` 里加 `"codePaths": ["src"]`（`manifest` 工具的 `write`，`key` = `codePaths`）。

**受影响文件**

- 设计面（本轮已改）：`docs/core/design/MANIFEST.md` · `docs/core/design/PORTABILITY.md` · `docs/core/design/MEMORY.md`。
- 实施面（交实施轮）：`thincoder-core/manifest-schema.mjs` 一字（`DEFAULT_MANIFEST.codePaths`）；两处档头注释按 `docs/core/design/PORTABILITY.md` §3.2 收正（`thincoder-core/conventions.mjs` 的「default: the path segment `src`」· `thincoder-core/agent-tools/verify.mjs` 的「default: src」）；工具描述面 `thincoder-core/tool-docs/manifest.md` 的 `codePaths` 行（DESC 单源 = AC-43③）。
- 零改面（在册）：`thincoder-core/tool-docs/manifest-read.md`（只列键名）· `thincoder-core/declaration.mjs`（兜底取常量，值随动）· 本仓 `PROJECT-MANIFEST.json`（显式声明值，K4）。
- 分层结论：无文件跨层；量法 = `doc_check` 的 `lines`。

**验收对照（可红断言）**

```text
AC-D1  空目录 ⇒ initManifest(cwd, { writer: "main" })（∥ manifest 工具 init）
       ⇒ 读回档 codePaths 缺键或 []。
       红侧：把 DEFAULT_MANIFEST.codePaths 改回 ["src"] ⇒ 该断言报红。

AC-D2  夹具仓（档内无 codePaths）⇒ classifyPath("<root>/src/x.md", loadProjectDeclaration(root)) = "doc"。
       红侧：同上一条的改法。

AC-D3  同夹具加 codePaths: ["src"] ⇒ src/x.md = "code"；src/x.mjs = "code"（控制项：改前改后都 code）。
       红侧：不声明却期望 judge 成 code ⇒ 红。
```

命令与读数住 §5（实施轮）；本段只钉断言与红侧。

**集成用例（自 `test/RTM.md` 起步的增量）**

- 破 0 行、冗余 0 行：现盘无一例断言 `manifest init` 的档内容（`test/rtm/paths.md` 的 9-1 只断言工作区拒建）。
- 缺 1 行，编号先定：**9-2**（同 `paths` 故事，紧接 9-1）——交互 = `manifest` 工具 `init` 在空目录建档后读回；业务可观察结果 = 档内 `codePaths` 缺键或 `[]`，且同仓代码段内的文档后缀文件判文档；需求 = `#2270`；入口 = `manifest init`；用例档（新建，住 `test/integration/`）：见下格。

```text
test/integration/manifest-init-default.test.mjs
```

- 台账 `#2253` 在册：集成集 178 例已越窗（≈50–100）。9-2 属新故事增量 ⇒ 实施轮须同轮按故事裁旧例，否则不落。

**关键决策**

- K1 改默认值本体，不改建档投影（`fillDefaults` 会补回）。
- K2 保留 `codePaths` 键（五键不变）：删键会让 `MANIFEST_SCHEMA.keys` 少一键，现存项目档里的 `codePaths` 会落成未知键、被 `fillDefaults` 丢弃。
- K3 `?? [...DEFAULT_MANIFEST.codePaths]` 兜底保留：改值后两条路都得 `[]`，删它等于造第二处判据。
- K4 不做迁移：现存项目档里的 `["src"]` 是用户自己的声明值，不改写。

**上抛项**

- [上抛·待裁] 需求面 `docs/core/requirements/PORTABILITY.md` 的 F9 判据行要求「代码段优先级在前（`src` 段下的 `test` 目录仍判 code）」——该判据只在默认段在场时成立；默认段清空后，未声明代码段的仓里同一输入判 aux。需求档不在本席写面，请主 agent 处置：改判据 ∥ 明写「须声明 `codePaths`」前提。
- [上抛·知会] 本仓 `PROJECT-MANIFEST.json` 的 `codePaths: ["src"]` = 显式声明值，**保留不动**（K4）；先前「是否同轮清空」一问已裁为不改，该问不再在册。
- [上抛·知会] `docs/core/design/PORTABILITY.md` §2 的行数读数（`conventions.mjs` 172 行 ∥ `declaration.mjs` 173 行）属 D12「读数住规范面」的既有债，本批未动（清它须重新量，与文档面读数清理批同族）。

**第 3 轮（验修 · 对第 2 轮 1🔴 + 1🟡 + 3🔵 逐号处置）**

- **🔴1 · 同一道门两处反面结论 → 五处收到一个判据**（判据源 = 本轮实读 `thincoder-core/agent/dispatch.mjs` 的父侧门段：`if (faceOf(abs) !== "product") continue`，头注「设计门的面判据由 `isCodePath` 换成 `faceOf`」——该门不读分类器）：
  - `docs/core/design/PORTABILITY.md` §1「已知代价」重写：「代价由**分类驱动的五面**承担：评审陈旧判定 · 评审范围发现（`isDocOnlyChange`）· 变更记账（`hasCodeMutations`）· verify 快路径 · 索引范围；声明偏离旗另计（判据 = 值比较——第 4 轮 🔵4 修正此处计数）。**设计门不在其中**：父侧门与父侧写闸的判据都是 `faceOf`（`thincoder-core/agent/write-face.mjs`），分类器不参与。」原句「设计门不再把这类档当产品代码拒」删除；两条 `依据` 引文 = `dispatch.mjs` 头注句 ∥ `if (faceOf(abs) !== "product") continue`。
  - §2 表「父侧设计门禁」行：「**判据 = `faceOf`**……文档面放行 ∥ 其余一切产品面（fail-closed）；分类器不参与」；原「缺省放行面 = aux ∥ state」删除。
  - §3.7 行 1：「判据 = `faceOf`（非分类器）⇒ 文档面放行」；原「判 aux ⇒ 放行」删除。
  - §3.8 行 1：「判据 = `faceOf`（非分类器）⇒ 两档不判产品面、主 agent 放行（合规落盘 ∥ 清理）」；原「判 state ⇒ 主 agent 放行」删除。
  - §3.6 行「父侧设计门禁」+ 同节状态注：「判定经共享谓词 = `faceOf`……分类器不参与」「VSC 父侧门与变更记账守卫均经核单源（父侧门判据 = `faceOf`）」。
- **🟡2 · 勘察行收正**（`docs/core/design/MANIFEST.md` §2.4.1「勘察行」第 4 款）：原「F9 的判据行要求默认段在场才成立——与本改动冲突，已上抛，未在本席写面改」整句删除，改为「**F9 ∥ N1 已由父侧改毕**——F9 = 「代码段只来自项目声明、无内置默认；未声明仓里 `src/test/**` 判 `aux`」，N1 = 「未声明代码段的项目按无代码段分类，`code→doc/aux` 是有意变更、不算假阳」；设计侧与改后的判据一致」。
- **🔵3 · KD-M1-9 加交叉注记**（`MANIFEST.md` §2.4）：理由列补「本条是**未被要求改默认时**的默认立场，**该立场让位于显式用户裁定**：`codePaths` 缺省值翻转（`["src"]` → `[]`）由用户 2026-11-10「不要带这个默认值」直接裁下（理由 = KD-M1-31；逐面代价 = §2.4.1）」。
- **🔵4 · 版式：键族枚举不再被切两截**：原夹在 §2.2 的 `codePaths` 条与 `index` 条之间的整段（逐面对照表 8 行 · 收回路径 · 先红 · 最近先例 · 勘察行 · 受影响文件 + 分层结论 · 集成测试设计）**整段移出**，落成 `docs/core/design/MANIFEST.md` §2.4.1（紧随 §2.4 KD-M1-31 之后、§2.5 之前），文字逐字搬（除 🟡2 那一句）；`codePaths` 条末加指针「逐面对照 = §2.4.1」；本档 §2 行内指向 §2.2 的那句同轮改指 §2.4.1。
- **🔵5 · 豁免**：不动——`memory.db` 条五字段齐全，维持「已裁定假阳」。

**本轮自查（同一根因，写面内顺手收正的一处）**：`MANIFEST.md` §2.5「项目状态档（state）豁免工程写闸（#941）」原写「分类器五值增补 `state` ⇒ 工程模式父侧门对两档不再按产品代码拦」——同一句把该门写成分类驱动，与 `dispatch.mjs` 的 `faceOf` 判据相反。改为「父侧门的判据 = `faceOf`（不读分类器）⇒ 两档在该门下不判产品面……分类器 `state` 值供其余消费面读数，不改该门判据」。

**上抛项（本轮新增）**



**验收自查**：`doc_check(mode:"gate")` 对两档 = `DOC-CHECK GATE: PASS`（0 段有问题；附「登记未命中 5 条」为既有登记项，非本轮命中的豁免）。

**第 4 轮（验修 · 对第 3 轮 2🔴 + 1🟡 + 1🔵 逐号处置）**

- **🔴1 · `PORTABILITY.md` §3.1 的 `codePaths` 条：「门禁恢复」整句删除。** 判据源 = 本轮实读 `thincoder-core/agent/write-face.mjs` 的 `faceDetail`——四格判据依次为出辖 ∥ `docRoot` 前缀命中 ∥ `manifestFilePath(root)` 恰等 ∥ 兜底产品面，**无一处读 `classifyPath` 或 `codePaths`**；`dispatch.mjs` 的父侧门段只经 `declarationForTarget` 取辖域（`if (!conv) continue`）与 hint 指路（`!conv.declared`），拒判据行 = `if (faceOf(abs) !== "product") continue`。改后该条只主张**分类读数**的收回（§1 那五面），并明写「声明代码段不让门放行」。
- **🔴1 同族三处一并收到分类面口径**：§3.2 行 5「父侧门缺省放行面」→「分类面读数（父侧门判据 = `faceOf`、不读分类器）」；§3.2 分类语义 `aux` 条删「辅助面 = 工程模式父侧门的缺省放行面（写测试与临时驱动无须设计令牌）」——该句在 `faceOf` 下不成立（`test/**` 判产品面、照旧要令牌），改为「分类面上的一个读数值」并点名四个消费面。
- **🔴2 · §3.9 行 1「F11 前」格按同一判据重写。**「无档面按缺省 fail-closed **判码** ⇒ 拒」删除：本档自序 F9（§3.7）先于 F11（§3.9），按 §3.7 行 1 的判据，F11 前该门已是 `faceOf`；「先后未核」不构成保留依据，而「`faceOf` 换源晚于 F11」的在档可核依据给不出。改后 = 「声明选择取会话 cwd（只供 hint 指路）；面判据同为 `faceOf`（§3.7 行 1）⇒ 非文档面判产品面 ⇒ 拒」——该行差分只剩辖域面（声明选择 + 出辖放行），与行 2–6 的零扰口径一致。
- **🟡3 · `MANIFEST.md` §2.4.1 勘察行：需求侧落到可查的名字。** 原「F9 ∥ N1 已由父侧按本改动改毕」及其转述句删除，改为两行 `依据` 形式引文——`docs/core/requirements/PORTABILITY.md` §2 功能性需求 F9 行 ∥ §3 非功能性需求 N1 行，逐字取原文，并写明核对法 = 在该档搜这两句原文（不必读全档）。评审的「未核」由此从读全档缩成搜两句。
- **🔵4 · §1 计数与判据分家。**「分类驱动的六面」改为「分类驱动的五面」，单列「声明偏离旗按值比较」（出口 = 门禁 hint 的指路段，不是路径读数）；下一行「那六面」随之改「那五面」，并补 hint 指路段为可见面之一。

**本轮自查**：`doc_check(mode:"gate")` 对两档 = `DOC-CHECK GATE: PASS`（0 段有问题）。第三份设计档（`docs/core/design/MEMORY.md`）不在本轮写面，零改。

**第 5 轮（实况收正 · 只动 `docs/core/design/PORTABILITY.md` 三处，另同枚举第二处）**

依据 = 父侧 2026-11-10 转来的实测（本席探针，父侧采信）：`test` ∥ `scripts` ∥ `.thincoder/tmp` 三形走设计门皆 `denied: true`（理由 `engineering design gate`），文档档过门——**门有分辨力，aux 面一个也过不去**。本轮只把档面改成与实测一致，不作裁定。

- **① §3.7 行 1 裁定格**：原「判据 = `faceOf`（非分类器）⇒ 文档面放行 ｜ **已达成**」⇒「判据 = `faceOf`（非分类器）⇒ **辅助面判产品面 ⇒ 拒**：放行面只剩文档面 ∥ `PROJECT-MANIFEST.json` 本体 ∥ 出辖（现行为；探针三形 = `test` ∥ `scripts` ∥ `.thincoder/tmp`）」，裁定格改「**与需求层 F9 相反**：现行为 = 拒，F9 要求放行；F9 的存废待用户裁定（台账 `#2271`；裁定到达前本条按实况读）」。同表下补一行「§3.7 行 1 的判据原文」= `faceDetail` 四格 + 两处 `依据` 引文（`thincoder-core/agent/write-face.mjs` ∥ `thincoder-core/agent/dispatch.mjs`）。
- **② §5 `T-27`**：原「辅助面写放行」⇒「**辅助面写 ⇒ 拒**」（断言 `denied: true` + 拒绝理由 `engineering design gate`；三形各一例；判据 = §3.7 行 1）+ 尾注「若用户裁定回退 2026-11-02 那次退役，本条恢复为放行断言（台账 `#2271`）」。
- **③ §3.9 声明面**：原「项目内判定全照旧（code 段 / fail-closed 兜底 / doc·temp·aux·state 豁免）」⇒「在辖目标的项目内判定 = `faceOf` 实况：放行面只剩 `doc` 面 ∥ `PROJECT-MANIFEST.json` 本体 ∥ 出辖；`aux`（三形）与其余路径一并判产品面 ⇒ 拒」。
- **③ 的同枚举第二处**：§3.9「排除面（不动）」句内「state / aux / temp / doc 豁免零改」⇒「`doc` 面 ∥ `PROJECT-MANIFEST.json` 本体 ∥ 出辖的放行面零改；`aux` ∥ `temp` 在 `faceOf` 下本就不放行（§3.7 行 1）」。不改则该节两处反面结论。
- **未写结论词**：三处均不出「已达成 / 已收口」；写「现行为 = 拒；需求 F9 要求放行；裁定见 `#2271`」。
- **未改需求档**：`docs/core/requirements/PORTABILITY.md` F9 一字未动（父侧笔）。
- **未碰代码 ∥ 未派实施 ∥ 未发评审**：本轮写面只此一档。
- **验收**：`doc_check(mode:"gate")` 对 `docs/core/design/PORTABILITY.md` = `DOC-CHECK GATE: PASS`（0 段有问题）。

**本轮上抛（新增）**

- [上抛·待裁] `docs/core/design/PORTABILITY.md` §3.8 行 1（父侧写闸）写「两档不判产品面、主 agent 放行」并标「**已达成**」——「两档」= `PROJECT-MANIFEST.json` ∥ 旧声明档；`faceDetail` 第 3 格只认 `manifestFilePath(root)` 恰等 ⇒ 旧声明档不落该格、落兜底产品面。同一判据下 §5 `T-35`「旧声明档写放行」同向。属 state 面，不在本轮三处内，未改；处置请裁（并入第 4 轮评审 ∥ 另开）。
- [上抛·待裁] §5 `T-36` ③「在辖豁免回归——doc / temp / aux / state 四形」——按 §3.7 行 1 现行为，`temp` ∥ `aux` 两形判产品面 ⇒ 拒；该格照旧写「豁免回归」则跑起来必红。同上，不在三处内，未改。

**第 6 轮（收尾 · 四条逐号处置 · 写面只 `docs/core/design/PORTABILITY.md`）**

依据 = 父侧 2026-11-10 转来的四条 + 本轮实读 `thincoder-core/agent/write-face.mjs`（不重跑探针，读数采用父侧已实测的三形皆拒）。

- **① `§3.8` 行 1 按 `faceDetail` 四格重写**。「两档不判产品面、主 agent 放行」整句删除；改「判据 = `faceOf`（非分类器——同 §3.7 行 1）。`faceDetail` 四格先命中先定：① 出辖 ⇒ 放行 ∥ ② `docRoot` 前缀命中 ⇒ 放行 ∥ ③ 与 `manifestFilePath(root)` **恰等** ⇒ 放行（`manifest-state`）∥ ④ 其余一切 ⇒ 产品面（fail-closed）。**放行面 = 第 ③ 格那恰等的一份**（`PROJECT-MANIFEST.json` 本体）；**旧声明档（`.thincoder` 下的声明 JSON）的路径不等于 `manifestFilePath(root)` ⇒ 不落第 ③ 格、落第 ④ 格兜底产品面**」。裁定格改「档面与 `faceDetail` 四格一致；**两档在门下的读数 = 待核**（第 ③ 格只认 `PROJECT-MANIFEST.json` 恰等——旧声明档侧未取实跑读数；写锁 2026-11-03 起不分面，面在那里只选拒文变体）」——不写「放行」，不写「拒」。

**① 的判据原文（本轮实读，两处 `依据` 引文）**：`thincoder-core/agent/write-face.mjs`「3 文件 = `PROJECT-MANIFEST.json`（项目状态档）⇒ 放行（`manifest-state`）」／同档「4 其余一切 ⇒ 产品面（`product`，fail-closed——判不出面就按产品面走全链）」。

同判代码行 = `if (key === faceKey(manifestFilePath(root))) return { face: "pass", reason: "manifest-state", test }`。写锁面口径 = 同档头注「写锁 2026-11-03 起不分面（设计档 §2.3），面在那里只选拒文变体」。

- **② `§5 T-36` ③ 收到两形**。原「在辖豁免回归——doc / temp / aux / state 四形」⇒「在辖豁免回归——`doc` ∥ `state` 两形（`temp` ∥ `aux` 按 `faceOf` 实况**不在放行面**——§3.7 行 1）」。
- **③ 设计档撤台账号 `#2271`（三处）**：§3.7 行 1 裁定格 · §3.9 声明面 · `T-27` 尾注 ⇒ 改「F9 的存废待用户裁定」（不带号）。批档仍带号。
- **③ 的核对**：改后全档 `#2271` 零命中；`见台账` 零命中（撤号后无「指向空悬」的句子）。
- **④ 结论词全档清**：本轮改前全档「已达成 ∥ 已收口 ∥ 修好了」= 2 处（`§3.8` 行 1 ∥ `§3.9` 行 1）；改后 0 处。
- **④ 的两处落法**：`§3.8` 行 1 取 ① 的「待核」；`§3.9` 行 1 裁定格 ⇒「档面与实测一致（`faceOf` 四格 ∥ 探针三形皆拒——§3.7 行 1）；该行差分 = 辖域面（声明选择 + 出辖放行）」。这条线上的状态表述取「档面与实测一致；F9 的存废待用户裁定」。

**四条之外同根顺手收的两处（都在本档、都由 ① 直接推出，逐条列出以接受评审）**

- `§5 T-35` 原「`PROJECT-MANIFEST.json` ∥ 旧声明档写放行」与 ① 直接相反（同一机制两处反面结论）⇒「`PROJECT-MANIFEST.json` 写放行 ∥ 旧声明档侧 = **待核**（其路径不过 `faceDetail` 第 ③ 格、落兜底产品面——§3.8 行 1）」。不改则该档在 §3.8 与 §5 各说一端。
- §3.7 行 1「（现行为；探针三形 = `test` ∥ `scripts` ∥ `.thincoder/tmp`，读数住批次档 §2）」中**指向批档的那半句删除**（批档可整本删，规范面指它是必死指针）；三形列举保留。

**验收**

- `doc_check(mode:"gate")` 对 `docs/core/design/PORTABILITY.md` = `DOC-CHECK GATE: PASS`（0 段有问题）。「登记未命中 7 条」= 既有登记项与本轮判集（显式 1 档）不对齐的读数，非本轮命中、不改。
- 读回核对：两处改写落盘；`#2271` ∥ 结论词 ∥ `见台账` 三项扫零（命令与读数住本轮报告，不移植规范面）。

**上抛项（本轮）**

- [上抛·待裁] **F9 的存废**（设计档已不带号；台账号在批档）：设计面三个反例点（§3.7 行 1 ∥ §3.9 声明面 ∥ `T-27`）与需求层 `docs/core/requirements/PORTABILITY.md` 的 F9 相反——**A** = F9 按 2026-11-02 那次退役裁定作废 / 重写为实况；**B** = F9 是想要的 ⇒ 判产品缺陷。裁定到达前设计档按实况读。
- [上抛·待裁] **旧声明档侧的门读数仍待核**：§3.8 行 1 ∥ `T-35` 现写「待核」，落成「放行」或「拒」需要一次实跑（父侧门对 `<项目根>/.thincoder/` 下声明 JSON 的写入）。本席未跑（四条明示不重测）。

**第 7 轮（验修 · 第 4 轮 1🔴 + 2🟡 逐号处置 · 写面只 `docs/core/design/PORTABILITY.md`）**

依据 = 父侧转来第 4 轮评审三条 + 本轮实读 `thincoder-core/agent/write-face.mjs` 的 `faceDetail`（第 ③ 格 = `if (key === faceKey(manifestFilePath(root))) return { face: "pass", reason: "manifest-state", test }`）与 `docs/core/requirements/PORTABILITY.md` 的 F10 行原文。

- **🔴 · `T-36` ③ 收窄 + 放行面两种写法收到一处口径**
  - `T-36` ③：原「在辖豁免回归——`doc` ∥ `state` 两形」⇒「`doc` 面 ∥ `state` 面的**恰等那一份**（项目根的 `PROJECT-MANIFEST.json` 本体——判据 = §3.8 行 1 的放行面；`state` 按 basename 任意层判、比放行面宽 ⇒ 旧声明档 ∥ 非恰等的同名档不在本格，归 `T-35` 待核格）」；`temp` ∥ `aux` 那半句保留（§3.7 行 1）。
  - `T-35`：原「`PROJECT-MANIFEST.json` 写放行 ∥ 旧声明档侧 = **待核**」⇒「项目根的 `PROJECT-MANIFEST.json` 本体（恰等面）写放行 ∥ **待核格** = 旧声明档 ∥ 非恰等的同名档（里层）两形（其路径不过 `faceDetail` 第 ③ 格、落兜底产品面；实跑读数未取——§3.8 行 1）」——旧声明档那一形按评审所指并入本格。
  - 口径合一：`§3.7` 行 1 一次定义「`PROJECT-MANIFEST.json` **本体** = 与 `manifestFilePath(root)` 恰等的那一份，`root` = 目标所属项目根；非恰等的同名档、旧声明档不属此面」；`§3.8` 行 1 ∥ `§3.9` 声明面 ∥ `§3.9` 排除面 ∥ `T-35` 改用「本体（恰等面——§3.7 行 1）」短形。原 `§3.7` 行 1 与 `§3.9` 单写「本体」、按字面含任意层同名牌——该读法已无处可落。
  - 同根补一处（🔴 的根因 = 把分类面与门放行面当一面）：`§3.8` 面绑定登记增「**该面 ≠ 父侧门的放行面**——分类器按 basename 任意层判 `state`，门只放行与 `manifestFilePath(root)` 恰等的那一份（§3.8 行 1）」。
  - `§3.7` 行 1 判据原文条第 ③ 格：原「`PROJECT-MANIFEST.json` 本体放行」⇒「与 `manifestFilePath(root)` **恰等**的那一份放行（`manifest-state`）」，并补同判代码行 `依据` 引文（上列 `write-face.mjs` 那一行，逐字）。

- **🟡 · `§3.2` 行 7「生产门经 `isCodePath` 派生消费」收正**：改为「生产**消费面**经 `isCodePath` 派生读数：变更记账 ∥ verify 快路径 ∥ 评审陈旧判定 ∥ 评审范围发现（§3.8 表）；父侧门 ∥ 写闸的判据 = `faceOf`、不读分类器——§3.7 行 1」。原句按字面读 = 门经分类器 ⇒ 与 §1 ∥ §3.7 行 1 ∥ §3.8 行 1 互斥；收后全档「门经 `isCodePath`」零命中。

- **🟡 · `§3.8` 行 1 点需求冲突（F10）**：裁定格补「**与需求层 F10 相反**——依据 `docs/core/requirements/PORTABILITY.md`「效果：主 agent 在工程模式下可以直接写这两个文件，父侧门放行，不需要令牌」：F10 要求两档都父侧门放行，第 ③ 格只认恰等的那一份 ⇒ 旧声明档侧不被该格放行；F10 的存废待用户裁定，裁定到达前本条按实况读」；原「两档在门下的读数 = 待核」保留为实跑读数格。「待核（实测未取）」与「需求无冲突」由此分家。

- **同写面内顺手收正一处（一致性面，报备）**：档首注「（F1–F9 现行面——…）」⇒「（F1–**F11** 现行面——…）」。依据 = `docs/core/requirements/PORTABILITY.md`「本档 = 该机制的**需求层权威**（F1–F11 / N1–N4——编号承旧档，不改号）」；同档 §3.8 ∥ §3.9 通篇已按 F10 ∥ F11 立论，首注是唯一还写 F1–F9 处。

- **未动**：`§3.7` 行 1 对 F9 的处置（「与需求层 F9 相反」+「F9 的存废待用户裁定」+ 按实况读）按评审确认保持原样；`docs/core/design/MANIFEST.md` ∥ `docs/core/design/MEMORY.md` ∥ 需求档 ∥ 代码零改；未派实施、未发评审。

- **验收**：`doc_check(mode:"gate")` 对 `docs/core/design/PORTABILITY.md` = `DOC-CHECK GATE: PASS`（0 段有问题）；两条 `依据` 引文的既有字符由该门的 `引缺` 判据核过（F10 句 ∥ `faceKey(manifestFilePath(root))` 代码行）。残留扫零三项（命令与读数住本轮报告）：`门经 \`isCodePath\`` = 0 · `` `doc` ∥ `state` 两形 `` = 0 · `F1–F9` = 0。

**上抛项（本轮无新增）**：F9 的存废 ∥ 旧声明档侧门读数两条仍在册（前几轮所记），本轮未变。

**第 8 轮（用户裁定落地 · 写面只 `docs/core/design/PORTABILITY.md`）**

依据 = 父侧 2026-11-10 转来的用户裁定原话「工程模式下不能允许没令牌的时候写脚本。」（父侧已同轮改毕需求档）；本轮实读 `docs/core/requirements/PORTABILITY.md` 的 F9 行 ∥ F10 行 ∥ F11 行 ∥ N1 行。

- **① 三处「待用户裁定」⇒ 已定**（改后设计面与需求面同向）：
  - `§3.7` 行 1 裁定格：原「**与需求层 F9 相反**：现行为 = 拒，F9 要求放行；F9 的存废待用户裁定，裁定到达前本条按实况读」⇒ 改为「**与需求层 F9 同向**」+ F9 新标题「父侧写域 = 判产品面的一律要令牌」+ `依据` 引用户原话；「无待裁项」。
  - 该句前半「与需求层 F9 相反」随需求档改毕**作废**（两边已一致；不改则该句为假）。
  - `§3.9` 声明面：原「（F11 不改该门判据；与需求层 F9 的相反关系见 §3.7 行 1）」⇒「（…；F9 已按用户 2026-11-10 裁定改为「父侧写域 = 判产品面的一律要令牌」，与本行同向——§3.7 行 1）」。
  - `§5` `T-27`：原「**若用户裁定回退 2026-11-02 那次退役，本条恢复为放行断言**（F9 的存废待用户裁定）」⇒ 判据 = F9（新义 + `依据` 引原话）+「本条「辅助面写 ⇒ 拒」即该判据的落实，无回退分支」——回退假设分支随裁定作废。
- **② `§3.8` 行 1 的 F10 待裁范围收窄**：原「F10 的存废待用户裁定，裁定到达前本条按实况读」⇒「**待用户裁定的范围 = F10 两个文件里的后一个**」——即「旧声明档（`.thincoder` 下的声明 JSON）该不该也父侧门放行」。
  - 写清两件不在问内：F10 的**存废**本身；**脚本面**（用户已裁 `test` / `tests` / `scripts` 与 `.thincoder/tmp/**` 判产品面 ⇒ 无令牌拒）。
  - 「与需求层 F10 相反」那半句与原 `依据` 引文**保留原样**（F10 确未逐行对齐实测）。
- **③ 第 5 轮 🔴 本轮未改**（`非恰等的同名档（里层）` vs nearest-wins）：父侧裁定修复轮已到上限、记 `#2273` 另批处置；`§3.8` 行 1 与 `T-35` 该句一字未动。
- **同根收正（一致性面，逐条报备）**：F9 改标题后，本档原「F9 = 辅助面缺省」的标签指向失效——逐处改指仍发该判据的需求行（F3 的优先级句），或去掉编号：
  - `§3.1` `codePaths` 收回面条：「（F9 · §3.2）」⇒「（F3 分类优先级 · §3.2）」。
  - `§3.2` 行 5：「`isAuxPath`（F9 新增）」⇒「`isAuxPath`（辅助面谓词——F3）」。
  - `§3.2` 分类语义首句：「（… F9 辅助面）」⇒「（… 辅助面 = F3 优先级第四级）」。
  - `§3.2` 面判读数第 2 行：「（F9「任意深度」…）」⇒「（段匹配任意深度——F3；…）」。
  - `§3.7` 节标题：「### 3.7 F9 缺省辅助面（aux）…」⇒「### 3.7 缺省辅助面（aux）…」——该标题与同节行 1 的 F9 新义紧邻，不改则同屏两个 F9。
  - `§3.9` 排除面：「声明收回面（F9）零改」⇒「（F3）零改」。
  - `§4` D9 两处：「非门内定向谓词（F9）」⇒「（F3）」；「F9 判据线即以 `classifyPath` 四例书写」⇒「aux 面判据线即以 `classifyPath` 四例书写（§5 T-26）」。
  - `§5`：「**F9 承诺**」⇒「**aux 面承诺**」；「**F9 新增用例**」⇒「**aux 面新增用例**」。
  - `§6` 第 4 条：「**F9 缺省射程外**」⇒「**辅助面缺省射程外**」。
  - `§3.7` 行 2「硬要求（F9）」**未动**：F9 新正文含「**eng-coder 门不动**」⇒ 该引更准。
- **未动**：代码零改 · 需求档零改 · `docs/core/design/MANIFEST.md` ∥ `MEMORY.md` 零改 · 未派实施 · 未发评审。
- **验收**：`doc_check(mode:"gate")` 对本档 = `DOC-CHECK GATE: PASS`（0 段有问题；「登记未命中 7 条」= 既有登记项与本轮判集（显式 1 档）不对齐的读数，非本轮命中）。两条 `依据` 引文由该门的 `引缺` 判据核过。残留扫零（命令与读数住本轮报告）：`与需求层 F9 相反` = 0 · `F9 的存废` = 0 · `F10 的存废待用户裁定` = 0 · `若用户裁定回退` = 0 · `F9「任意深度」` = 0。

**上抛项（本轮）**

- [上抛·知会] **F9 的存废一问已闭**（用户 2026-11-10 裁定改为「判产品面的一律要令牌」）——前几轮在册的该待裁项不再在册。
- [上抛·待裁] **旧声明档侧门读数仍待核**（`§3.8` 行 1 ∥ `T-35`）：一次实跑（父侧门对 `<项目根>/.thincoder/` 下声明 JSON 的写入）即可定「放行 / 拒」。本轮未跑。
- [上抛·待裁] **`docs/core/design/MANIFEST.md` §2.4.1 勘察行有断引**（本轮实读所获，不在本席写面）：其 F9 条 `依据` 引文「代码段优先级在前——…未声明代码段的仓里同一路径判 `aux`」在需求档已零命中（该档搜「代码段优先级在前」= 无匹配）⇒ 该档进任何 gate 判集即报 `引缺`。同节 N1 条引文仍在。处置请裁（并入下一批 ∥ 另开）。

**第 8 轮（续 · 用户追加裁定「没有内层manifest。」⇒ 删净「非恰等的同名档（里层）」形）**

依据 = 父侧 2026-11-10 转来的用户追加裁定原话「**没有内层manifest。**」；判据 = **放行面 = 与 `manifestFilePath(root)` 恰等的那一份**——不存在第二个同名牌要讨论。原记「第 5 轮 🔴 拆两场」的处置**作废**（不是拆，是删）。

- **四处删净**（删，不改写成「暂不涉及」/「待核」形）：
  - `§3.7` 行 1：原「…；非恰等的同名档、旧声明档不属此面——§3.8 行 1）」⇒「…；旧声明档不属此面——§3.8 行 1）」。
  - `§3.8` 行 1：「**旧声明档（`.thincoder` 下的声明 JSON）与非恰等的同名档（里层）的路径都不等于 `manifestFilePath(root)`**」⇒「**旧声明档（`.thincoder` 下的声明 JSON）的路径不等于 `manifestFilePath(root)`**」。
  - `§5` `T-35`：「**待核格** = 旧声明档 ∥ 非恰等的同名档（里层）两形」⇒「**待核格** = 旧声明档」。
  - `§5` `T-36` ③：「⇒ 旧声明档 ∥ 非恰等的同名档不在本格，归 `T-35` 待核格」⇒「⇒ 旧声明档不在本格，归 `T-35` 待核格」。
- **旧声明档未删**：它是唯一剩下的待核形（与「内层 manifest」是两件事），四处的「旧声明档」成分逐处保留。
- **全档扫词**：`里层` = 0 · `非恰等` = 0（命令与读数住本轮报告，不移植规范面）。
- **验收**：`doc_check(mode:"gate")` 对本档 = `DOC-CHECK GATE: PASS`（0 段有问题）。

**上抛项（本轮新增）**

- [上抛·待裁] **`§5` `T-37` 的嵌套句与 `§3.7` 行 1 相反**（本轮实读本档所获，未改）：该行写「嵌套根 R 内子 S（`lib`）：`<S>/lib/a.md` ⇒ 拒 ∥ `<R>/lib/a.md` ⇒ **放行**（子优于根）」，同句的判别理由亦按分类器立论（「按 A 装载则无代码段 ⇒ doc ⇒ 放行」）。
  按 `§3.7` 行 1 ∥ `§3.8` 行 1 的四格，`<R>/lib/a.md` 不落第 ③ 格（非恰等）、亦无 `docRoot` 前缀 ⇒ 产品面 ⇒ **拒**；且门不读分类器，该判别理由不成立。
  另：本轮用户裁定「没有内层manifest」若也涵盖**嵌套项目**（子 S 自带 manifest），则该行整条嵌套子句连同其夹具一并失效——两种读法（只删同名档形 ∥ 连嵌套项目形一起删）本席不替裁，请父侧裁后一并收正。

**第 9 轮（父侧还债 · 写面只 `docs/core/design/MANIFEST.md` 的 §2.4.1 · 2026-11-10）**

依据 = 父侧 2026-11-10 派单（① 勘察行断引由父侧改需求 F9 时改坏，补它；② `T-37` 嵌套句只报读数、不改）。本轮实读：

- `docs/core/requirements/PORTABILITY.md` 的 F9 行 ∥ N1 行原文；
- `thincoder-core/agent/write-face.mjs` 的 `faceDetail` ∥ `faceOf`；
- `thincoder-core/declaration.mjs` 的 `declarationForTarget` ∥ `thincoder-core/manifest-discovery.mjs` 的 `owningProject`。

**① 断引补上**（`MANIFEST.md` §2.4.1「勘察行」F9 条）：

- 旧引文在需求档已零命中（「**代码段优先级在前**——…未声明代码段的仓里同一路径判 `aux`」）。
- 换为现文连续子串「代码段只来自项目声明、无内置默认；声明 `codePaths` 不改变本门判据（门用面判 `faceOf`、不读分类器）。」
- 并注明该行标题 = 「父侧写域 = 判产品面的一律要令牌」；N1 条按父侧令一字未动。

**① 的同根顺手收正**（一致性面，报备）：

- 紧邻一行原写「设计侧与这两句一致：… §3.1 ∥ §3.2 本就写成带条件的「**声明了 `src` 段的项目里** `src/test/**` 仍判 code」」。
- 该句逐字只在设计档 §3.2；§3.1 是同一条件的另一种写法（列入 `test` / `tests` / `scripts` 同段序列 ⇒ 代码段优先命中、判 `code`）。
- 处置 = 归属收到 §3.2、§3.1 改记「同旨」。改的是引文归属，不改任何判据。

**① 的验收读数**（两向都跑过，命令与读数住本轮报告）：新引文在需求档 = `true` · 旧引文在需求档 = `false` · `MANIFEST.md` 内「代码段优先级在前」计数 = 0。

- **② `T-37` 嵌套句未改**：按父侧令只报读数，结论未进设计档（用户裁定未到）。
- **未动**：`docs/core/design/PORTABILITY.md` ∥ `docs/core/design/MEMORY.md` ∥ 需求档 ∥ 代码——四者零改；未派实施 · 未发评审。
- **验收**：`doc_check(mode:"gate")` 对 `docs/core/design/MANIFEST.md` = `DOC-CHECK GATE: PASS`（0 段有问题；「登记未命中 7 条」= 既有登记项与本轮判集不对齐的读数，非本轮命中）。

**第 10 轮（`T-37` 按实测收正 · 写面只 `docs/core/design/PORTABILITY.md` · 2026-11-10）**

依据 = 父侧 2026-11-10 派单（用户采信本席探针读数：`<R>/lib/a.md` 在 `faceDetail` 四格下判产品面 ⇒ 无令牌拒；对照格 = `lib` 的 `docRoot` 覆盖该文书则过门，故第 ④ 格不是恒拒的假判据）+ 本轮实读 `thincoder-core/agent/write-face.mjs` 的 `faceDetail` ∥ `thincoder-core/agent/dispatch.mjs` 的父侧门段。

- **① `T-37` 判据收正**：原「嵌套根 R 内子 S（`lib`）：`<S>/lib/a.md` ⇒ 拒 ∥ `<R>/lib/a.md` ⇒ 放行（子优于根）」⇒ 改为「… ∥ `<R>/lib/a.md` ⇒ **判产品面 ⇒ 无令牌拒**（`lib` 自带档 ⇒ 归属项目 = `lib`，其 `docRoot` 不含 `a.md` ⇒ 不落 `docRoot` 前缀格、亦非 `manifestFilePath(root)` 恰等 ⇒ 兜底第 ④ 格——§3.7 行 1；**对照格**：`lib` 的 `docRoot` 覆盖该文书 ⇒ 过门——第 ④ 格不是恒拒的假判据）」。
- **① 的射程句**：「**「子优于根」只定「载谁的声明」，不定门开不开**」写进同格。
- **夹具保留**：该格断言的是「嵌套项目的档覆盖不到的文书仍判产品面」——与用户 2026-11-10 裁定「没有内层 manifest」不冲突（那句删的是同一项目里第二个同名 manifest，不是嵌套项目）。
- **顺带核（同判据，零改）**：`§3.7` 行 1 未按「子优于根 ⇒ 放行」立论；`§3.2` 的 `declarationForTarget` 行 ∥ `§3.9` 辖域判定句只述「载谁的声明 / 出辖放行」，不派生放行。全档 `子优于根` 只剩新写的射程句一处（读数住本轮报告）。
- **未动**：`thincoder-core/**` 代码 · `docs/core/requirements/PORTABILITY.md` · `docs/core/design/MANIFEST.md` ∥ `MEMORY.md`——四者零改；未派实施 · 未发评审。

**验收**：`doc_check(mode:"gate")` 对 `docs/core/design/PORTABILITY.md` = `DOC-CHECK GATE: PASS`（0 段有问题；「登记未命中 7 条」= 既有登记项与本轮判集（显式 1 档）不对齐的读数，非本轮命中）。两向读数（命令与读数住本轮报告）：`放行（子优于根）` = 0 命中 · 新句 `判产品面 ⇒ 无令牌拒` 在盘 = true · `只定「载谁的声明」，不定门开不开` = 1 处。

**上抛项（本轮）**

- [上抛·待裁] **`T-37` 前半句的「判别」理由不成立（本轮实读代码所得，未改）**：该句写「`<B>/lib/a.md` ⇒ 拒（按 A 装载则无代码段 ⇒ doc ⇒ 放行——判别）」。按现门两条路都判产品面：`faceDetail` 内「`const conv = declarationForTarget(abs)`」恒按目标定归属项目、不取会话 cwd；即便真按会话 cwd 装载 A，`<B>/lib/a.md` 也不在 A 根内 ⇒ 跳第 ②③ 格 ⇒ 第 ④ 格产品面 ⇒ 拒。⇒ 这条「判别」在现门下分辨不出装载源。处置候选：删该括注 ∥ 把判据改到辖域面（按 A 装载 ⇒ 出辖放行 vs 在辖拒，判据行 = `dispatch.mjs` 的「`if (!conv) continue`」）。本席未改（超出本轮指令面，且动的是该格断言什么）。
- [上抛·知会] 第 8 轮（续）登记的那条上抛（`T-37` 嵌套句与 `§3.7` 行 1 相反）**本轮已处置完毕**——按用户采信的实测改成拒；该条不再在册。

**第 11 轮（用户裁定落地：删 `T-37` 的「判别」括注 · 写面只 `docs/core/design/PORTABILITY.md` 的 `T-37` 一格 · 2026-11-10）**

依据 = 用户 2026-11-10 对第 10 轮上抛的裁定：「你上一条那个『判别』上抛我裁了：删掉它，不改成辖域面。」并附前置条件：「若你实读后发现『按 A 装载』那条支路其实存在，就报我，别按上面改——那是另一个读数」。

- **前置条件未触发（本轮实读，逐条读数）**：
  - `thincoder-core/agent/write-face.mjs` 的 `faceDetail` 取声明 = `const conv = declarationForTarget(abs)`——面判定一律按**目标**取声明，门无「按会话 cwd 装载」的支路。
  - `thincoder-core/declaration.mjs` 的 `declarationForTarget` = `const root = owningProject(targetAbs, parse(targetAbs).root)` … `return loadProjectDeclaration(root)`——选择判据 = 目标祖先链（nearest wins），会话 cwd 不参与。
  - 假使真按会话 cwd 的 A 装载：`<B>/lib/a.md` 相对 A 根含 `..` ⇒ `inRoot` 为假 ⇒ 同落第 ④ 格产品面 ⇒ 两条路同判。
  - 需求侧同向：`docs/core/requirements/PORTABILITY.md` F11「判据声明面 = **目标所属项目**（最近祖先，nearest wins），不再取会话 cwd」。
- **改法（按裁定，不改写成辖域面）**：`§5` `T-37` 首句的括注「按 A 装载则无代码段 ⇒ doc ⇒ 放行——判别」整条删除；断言 `<B>/lib/a.md` ⇒ 拒 **保留**；同格补写该格实际断言什么——「本格只断言这个结论，不断言能分辨装载源」，并分列两条装载路的读数（按目标装载 ⇒ 落第 ④ 格；假使按会话 cwd 装载 ⇒ 同落第 ④ 格），判据原文指 `§3.7` 行 1。
- **未动**：`T-37` 后半（嵌套项目 `lib` 那句）· 其余用例格 · `§1`–`§4` · `§6` · 代码 · 需求档 · `docs/core/design/MANIFEST.md` · `docs/core/design/MEMORY.md`——零改；未派实施 · 未发评审。
- **验收读数（本轮跑）**：
  - `doc_check(mode:"gate")` 对 `docs/core/design/PORTABILITY.md` = `DOC-CHECK GATE: PASS`（0 段有问题；「登记未命中 7 条」= 既有登记项与本轮判集（显式 1 档）不对齐的读数，非本轮命中）。
  - 残留扫零（本档）：`判别` = 0 · `按 A 装载` = 0 · `则无代码段` = 0。

**上抛项（本轮）**：无新增。前轮在册的「旧声明档侧门读数待核」（`§3.8` 行 1 ∥ `T-35`）仍在册，本轮未碰。

**第 12 轮（用户裁定「实施前收」· 第 7 轮 3🟡 逐号处置 · 写面只 `docs/core/design/PORTABILITY.md` 的 `T-37` 一格 · 2026-11-10）**

依据 = 父侧转来的用户裁定（第 7 轮 pass、三条 🟡「实施前收」）+ 本轮实读 `thincoder-core/agent/write-face.mjs` 的 `faceDetail` ∥ `thincoder-core/manifest-schema.mjs` 的 `DEFAULT_MANIFEST.docRoot` ∥ 两套夹具探针实跑。

- **① 调用形 ∥ 负向断言整段删除（用户裁定取方案 ②：只依赖 §3.7 行 1 的四格穷尽枚举）**：原「`faceDetail` 取 `declarationForTarget(abs)`，门无按会话 cwd 装载的支路」与「其二，假使按会话 cwd 的 A 装载：…同样落第 ④ 格」两句删除；改「判据 = §3.7 行 1 的四格（穷尽枚举、先命中先定）：该路径在 B 根内、不命中 `docRoot` 前缀格、亦非 `manifestFilePath(root)` 恰等 ⇒ 兜底第 ④ 格产品面 ⇒ 无令牌拒」。**不新增代码引文**——四格是穷尽枚举，判据不再依赖「谁取声明」这件事。
- **② 题头改成本格实际锁定的读数**：原「声明装载换源：cwd = 项目 A…」⇒「跨项目目标 ⇒ 判产品面 ⇒ 无令牌拒」；「本格只断言这个结论，不断言能分辨装载源」保留（题名与自认限制由此不再互斥）。
- **③ 两条夹具前提逐条写进格内**：**B 未声明 `docRoot` ⇒ 取默认**（六子键逐个列出、根 = 项目根、皆不含 `lib` 段下的文档后缀文件）∥ **`<B>/lib` 无档 ⇒ 归属项目 = B**；并点名两个夹具的 `lib` 档状态两样（前半 `<B>/lib` 无档 ∥ 后半 `lib` 自带档）⇒ 「归属项目 = B」与「归属项目 = `lib`」两个夹具互不串。
- **保留（逐字未动）**：对照格（`lib` 的 `docRoot` 覆盖该文书 ⇒ 过门——第 ④ 格不是恒拒的假判据）∥ `T-37` 后半 ∥ 「子优于根」只定「载谁的声明」∥ 档非法 ⇒ 照默认 + 不抛；上一轮三处（F9 已定 ∥ 内层形删净 ∥ F10 待什么）未碰。
- **未动**：代码 · 需求档 · `docs/core/design/MANIFEST.md` ∥ `docs/core/design/MEMORY.md`；未派实施 · 未发评审。
- **夹具形一处收正（本轮实施所必需）**：夹具文书路径取本档既有占位形 `<x>.md`——以「段名 + 实档名」写的夹具路径被本档写闸判 `档缺` 并拒写（夹具路径不是盘上真档，占位形才是本档既有写法；本轮连撞两次，一次在 `T-37` 格、一次在本段）。
- **验收**：`doc_check(mode:"gate")` 对 `docs/core/design/PORTABILITY.md` = `DOC-CHECK GATE: PASS`（0 段有问题；「登记未命中 7 条」= 既有登记项与本轮判集（显式 1 档）不对齐的读数，非本轮命中）。两向读数（命令与读数住本轮报告）：旧形五项 = 0 · 新形五项各 1 · 保留项四项各 1。探针两套夹具：`<B>` 内 `lib` 段下文档后缀文书 ⇒ `{"face":"product","reason":"product"}`，对照 `<B>` 的默认 `docRoot` 文书 ⇒ `doc-root`；嵌套 `<R>/lib` 下同一形 ⇒ `product`。

**上抛项（本轮）**

- [上抛·待裁] **「声明装载换源」这条读数在 §5 已无一格承载**：题头改名后，装载源「按目标定」只剩断言面（§3.1「读向按用点（F11）」∥ §3.2 行 8 `declarationForTarget` ∥ §3.9），用例面零承载。用户给的两个处置里本席取了「改名」，故该问不在本轮改面内：要不要补一格用例（或由 `T-38` 的 hint 指路间接承载）请裁。

**第 13 轮（用户裁定落地：`T-37` 补装载源指针 · 写面只 `docs/core/design/PORTABILITY.md` 的 `T-37` 一格 · 2026-11-10）**

依据 = 父侧转来的用户裁定（处置本席第 12 轮上抛）：**不新增用例格，补指针**。用户原话：「`T-38` 的 hint 指路 = `manifestFilePath(conv.root)`，它本来就承载这个读数——装载源若错成会话 cwd，hint 会指到 A 的档去。这格是活的判别，只是没人把它和『装载源』连起来。」

- **加一句指针**：`§5` `T-37` 格末补「**装载源可分辨的读数在 `T-38` 的 hint 指路（`manifestFilePath(conv.root)`）**——装载源若错成会话 cwd，hint 就会指到 A 的档」。不新增用例格 · 不动 `T-37` 既有断言 · 不动 `T-38` 格。
- **为什么值当写**：不写则读者按 `T-37` 题头（「跨项目目标 ⇒ 判产品面 ⇒ 无令牌拒」）判定「装载换源」无人测，于是再补一个同款用例——而那个用例只能一种结果，什么也验不了（即第 11 轮删掉的那半句）。
- **用户裁定（不挂账）**：本席原拟把写闸对夹具路径判 `档缺` 挂账，用户裁定**不挂账、那不是缺陷**。判据 = 设计档里写的路径必须是盘上真档；夹具路径本非真档 ⇒ 用占位形（`<x>.md`）即正解，不是绕过。记成账反而会引导别人去「修门」，把一条正确的检查修松。
- **未动**：其余用例格 · `§1`–`§4` · `§6` · 代码 · 需求档 · `docs/core/design/MANIFEST.md` ∥ `docs/core/design/MEMORY.md`——零改；未派实施 · 未发评审。
- **验收**：`doc_check(mode:"gate")` 对 `docs/core/design/PORTABILITY.md` = `DOC-CHECK GATE: PASS`（0 段有问题；「登记未命中 7 条」= 既有登记项与本轮判集（显式 1 档）不对齐的读数，非本轮命中）。残留读数（命令与输出住本轮报告）：`装载源可分辨的读数在` = 1 处，落 `T-37` 格。

**上抛项（本轮）**：无新增。前轮在册两条（`§3.8` 行 1 ∥ `T-35` 的旧声明档侧门读数待核）仍在册，本轮未碰。

**第 14 轮（父侧派单：登记第 9 个消费面 · 写面只 `docs/core/design/MANIFEST.md` §2.4.1 · 2026-11-10）**

依据 = 父侧 2026-11-10 派单，性质 = 记录实施已交付的事实，非新设计；本轮实读 `thincoder-core/agent/dispatch.mjs` 的 hint 支。

- **逐面对照表加第 9 行**：面 = 门禁 hint 的指路段 · `convNote`（`!conv.declared` 支的拒绝文案）。
  改前列段名（`code paths: ${…join}`）；改后述判据来源（兜底分类）+ 声明指路；裁定 = 变。
  与同表第 1 行同文件不同坐标：第 1 行是面判据（`faceOf`，零变），第 9 行是文案取值（该值取自被清空的常量）。
- **受影响文件表加一行**：`thincoder-core/agent/dispatch.mjs`（门禁 hint 文案）。
- **分层结论行同步（一致性面，报备）**：原「一个数据常量 + 两处注释 + 一处描述句」⇒ 末尾加「+ 一处 hint 文案」。
- **两向读数**：`dispatch.mjs`「原先 `code paths: ${…join}` 的空集渲染会印出一句残句」在盘 = true；§2.4.1 逐面对照表 = 第 1–9 行连续九行。
- **未动**：代码 · `conventions.mjs` 的 aux 注句（父侧明示另排）· `PORTABILITY.md` ∥ `MEMORY.md` · 需求档 · 批档其他段；未派实施 · 未发评审。
- **验收**：`doc_check(mode:"gate")` 对 `docs/core/design/MANIFEST.md` = `PASS`（0 段有问题；「登记未命中 7 条」为既有登记项读数，非本轮命中）。

**上抛项（本轮）**：无新增。

## §3 设计评审（评审子代理）
**状态行**：评审通过



### 轮次 1（评审子代理）

| # | 严重度 | 状态 | 证据（指针，非行号） |
|---|---|---|---|
| 1 | 🔴 | 未决 | `MANIFEST.md` §2.2 `codePaths` 条 vs `PORTABILITY.md` §3.7 行 1「父侧门 `thincoder-core/agent/dispatch.mjs` 的父侧门段」∥ 行 5「评审陈旧判定 `thincoder-core/agent-tools/advisor-settle.mjs`」∥ 行 6 `isDocOnlyChange`——四面清单（verify ∥ 变更记账 ∥ 索引范围 ∥ `declared`）缺这三个消费者，且清单只在本轮机内、未落任何档 |
| 2 | 🔴 | 未决 | `MEMORY.md` §6.14「本工作区覆盖对照表」行 `thincoder/thincoder-{cli,vscode,desktop,server}/src/**` 依据「thincoder 条目 `codePaths: ["src"]`」 vs 同节「键面表」`codePaths` 行「`[]` ⇒ 代码面零命中」；本仓数据档 `PROJECT-MANIFEST.json` 现值为 `"codePaths": []` ⇒ 同一机制两处活描述；回法（补 `["src"]`）三份档零记载 |
| 3 | 🔴 | 未决 | 三份档皆无「集成测试设计（对 `test/RTM.md` 的增量）」节（体例 = `MANIFEST.md` §2.12 破/冗余/缺），而本改改变业务可观察结果（`MANIFEST.md` §2.2「`src/**` 下的 `.md` 因此判文档」） |
| 4 | 🟡 | 未决 | 无「最近先例」行（体例 = `MANIFEST.md` §2.12「先例与勘察」∥ KD-M1-45 对齐/偏离） |
| 5 | 🟡 | 未决 | 无「勘察行（查过的公共源 ∥ 结论）」——旧默认值在档外的残留面无人记录查过 |
| 6 | 🟡 | 未决 | 无受影响文件表 ∥ 档位结论；`thincoder-core/tool-docs/manifest.md`（描述单源 = AC-43③）与常量注句面未列 |
| 7 | 🟡 | 未决 | `PORTABILITY.md` §1 行 2「**门禁静默绕过**」vs 同节目标句「缺失即显式降级」——未声明项目该面重开无登记、无可见通道（§3.4 hint 仅在拒时发） |
| 8 | 🟡 | 未决 | KD-M1-31 前提句「`["src"]` 对本仓这类无 `src/` 目录的项目不起作用」 vs `MANIFEST.md` §2.2「路径**段名**数组（任意深度匹配）」+ `MEMORY.md` §6.14 该 `src` 行；`PORTABILITY.md` D1 仍写「组件式 `src` 路径段」为判据 |
| 9 | 🟡 | 未决 | 无「先红」条件在档；三条行为断言里唯 `src/**/*.md` ⇒ doc 会翻（`PORTABILITY.md` §3.2 优先级 ∥ 兜底），可红格实为 `MEMORY.md` §6.14 L-⑧-1 矩阵「`codePaths` 缺省 ∥ `[]`」 |
| 10 | 🔵 | 已判 | 本仓 `PROJECT-MANIFEST.json` `index.docCheckExemptions` 的 `memory.db` 条五字段齐全（`file` ∥ `kind` ∥ `text` ∥ `why` ∥ `review`）⇒ 已裁定假阳，非以豁免换绿灯；命中清单 unverified（`doc_check` 本轮两次执行报错） |

VERDICT: changes-required

计数：🔴 3 · 🟡 6 · 🔵 1 · 共 10 条

### 轮次 2（评审子代理）

**第 2 轮（验修）**——上轮 3🔴+6🟡+1🔵 中 8 条已核销（🔴1 逐面对照表已成 8 行、🔴2 覆盖表依据格 + 显式值声明 + 落空后果三处齐（本仓数据档实带 `"codePaths": ["src"]`）、🔴3 集成测试设计节含破/冗余/缺 + 9-2、🟡4 先例行、🟡5 勘察行、🟡6 受影响文件 + 分层结论、🟡8 理由句与 D1 已收正、🟡9 先红三格）；剩 1🔴 + 1🟡 + 3🔵。

| # | 严重度 | 状态 | 证据（指针） |
|---|---|---|---|
| 1 | 🔴 | 待修 | `MANIFEST.md` §2.2「逐面对照」行 1「该门判据 = `faceOf`…不读 `classifyPath`」作「零变」——同轮 `PORTABILITY.md` §1「已知代价」写「设计门不再把这类档当产品代码拒」，§3.7 行 1「判 aux ⇒ 放行」+「**已达成**」、§3.8 行 1、§2 表「缺省放行面 = aux ∥ state」、§3.6「判定经共享谓词」仍把该门写成分类驱动：同一机制两处反面结论 |
| 2 | 🟡 | 待修 | `MANIFEST.md` §2.2「勘察行」「F9 的判据行要求默认段在场才成立——与本改动冲突，已上抛，未在本席写面改」——父侧已改 F9/N1，此行仍记冲突为未决 |
| 3 | 🔵 | 可选 | `MANIFEST.md` §2.4 KD-M1-9「改默认会改变所有未覆盖仓的行为（兼容面）——要求「既有仓零改即绿」」未与 KD-M1-31 交叉注记（本改动即改默认，靠用户裁定成立） |
| 4 | 🔵 | 可选 | `MANIFEST.md` §2.2 的「先红 ∥ 先例 ∥ 勘察 ∥ 受影响文件 ∥ 集成测试设计」五块夹在「`codePaths`」条与「`index`（嵌套对象）」条之间，键族枚举被截断 |
| 5 | 🔵 | 已判 | `PROJECT-MANIFEST.json` `index.docCheckExemptions` 的 `memory.db` 条五字段齐全（file/kind/text/why/review）= 已裁定假阳，非拿豁免换绿灯；命中清单 unverified（本会话 `doc_check` 报错） |

计数：🔴 1 · 🟡 1 · 🔵 3 · 共 5 条（第 1 行同时是对「父侧门兜回是否成立」的裁定：机制前提成立，档面未按该事实写）。

VERDICT: changes-required

### 轮次 3（评审子代理）

| # | 严重度 | 状态 | 证据 |
|---|---|---|---|
| 1 | 🔴 | 待修 | `docs/core/design/PORTABILITY.md` §3.1「`codePaths` 兼作辅助面缺省的收回面」条「代码段优先命中，判 code（门禁恢复）」vs 同档 §1「父侧门与父侧写闸的判据都是 `faceOf`…分类器不参与」 |
| 2 | 🔴 | 待修 | 同档 §3.9 行 1「F11 前」格「无档面按缺省 fail-closed 判码 ⇒ 拒」vs 同档 §3.7 行 1「判据 = `faceOf`（非分类器）⇒ 文档面放行」；节序 §3.7 = F9、§3.9 = F11，F11 在后 ⇒ 该格「判码」与自序矛盾；「先后未核」为未核之自认，非不修理由 |
| 3 | 🟡 | 待核 | `docs/core/design/MANIFEST.md` §2.4.1 勘察行「F9 ∥ N1 已由父侧按本改动改毕」——需求档不在本评审声明范围，未核（F9/N1 摘句本身与同档 §3.1 ∥ §3.2「声明了 `src` 段的项目里 `src/test/**` 仍判 code」一致） |
| 4 | 🔵 | 观察 | `docs/core/design/PORTABILITY.md` §1「分类驱动的六面」含「声明偏离旗」，而同档 `docs/core/design/MANIFEST.md` §2.4.1 行 7 记其判据 = 值比较（非分类读数） |

已核通过——本轮五件的其余四处：

- 五处已同判据（`faceOf`，分类器不参与）：§1 已知代价 ∥ §2 表父侧设计门禁行 ∥ §3.7 行 1 ∥ §3.8 行 1 ∥ §3.6 父侧设计门禁区；旧句「设计门不再把这类档当产品代码拒」已不在盘。
- `docs/core/design/MANIFEST.md` §2.5「项目状态档（state）豁免工程写闸」条：收正句与同档 §3.8 行 1 同判据，未引入新不一致。
- §2.2 键族枚举：`codePaths` 条后直落 `index` 键族，无断句残留。
- 指向 §2.4.1 的四处指针（§2.2 ∥ KD-M1-9 ∥ KD-M1-31 ∥ PORTABILITY §1 与 §3.1）全部落到存在的节，且「行 1」= 父侧门行。

VERDICT: changes-required
计数：🔴 2 · 🟡 1 · 🔵 1

### 轮次 4（评审子代理）

| # | 严重度 | 状态 | 证据 |
|---|---|---|---|
| 1 | — | 已闭（上轮 🔴1） | `docs/core/design/PORTABILITY.md` §3.1 `codePaths` 条「收回的只是**分类读数**（§1 那五面）；父侧门判据 = `faceOf`、不读分类器 ⇒ 「声明代码段就让门放行」不成立」——上轮「门禁恢复」残留已除 |
| 2 | — | 已闭（上轮 🔴2） | `docs/core/design/PORTABILITY.md` §3.9 行 1「F11 前」格「面判据同为 `faceOf`（§3.7 行 1）⇒ 非文档面判产品面 ⇒ 拒」——「判码」措辞已除，该行差分归辖域面 |
| 3 | — | 已闭（上轮 🟡） | `docs/core/design/MANIFEST.md` §2.4.1 勘察行两条 `依据` 引文已逐字核：`docs/core/requirements/PORTABILITY.md` F9 行 ∥ N1 行 均含引文原文；「已改毕」结论句已改可核形 |
| 4 | — | 已闭（上轮 🔵） | `docs/core/design/PORTABILITY.md` §1「分类驱动的**五面**」+「**第六面「声明偏离旗」不按分类、按值比较**」 |
| 5 | 🔴 | 待修（新） | `docs/core/design/PORTABILITY.md` §5 T-36 ③「在辖豁免回归——`doc` ∥ `state` 两形」vs §3.8 行 1「**放行面 = 第 ③ 格那恰等的一份**（`PROJECT-MANIFEST.json` 本体）」+ T-35「旧声明档侧 = **待核**（其路径不过 `faceDetail` 第 ③ 格、落兜底产品面）」——同一输入（旧声明档 ∥ 任意层同名牌）两说 |
| 6 | 🟡 | 待修（新） | `docs/core/design/PORTABILITY.md` §3.2 行 7「生产门经 `isCodePath` 派生消费」——与 §1「分类器不参与」∥ §3.7 行 1 互斥，须点明指「生产消费面」还是「门」 |
| 7 | 🟡 | 待修（新） | `docs/core/design/PORTABILITY.md` §3.8 行 1 未点需求冲突：`docs/core/requirements/PORTABILITY.md` F10 行「主 agent 在工程模式下可以直接写这两个文件，父侧门放行」vs 该格「旧声明档…落第 ④ 格兜底产品面」——同档 §3.7 行 1 对 F9 已按「相反 + 待裁」处置，此处缺同款登记 |
| 8 | — | 接受（不修成立） | `docs/core/design/PORTABILITY.md` §3.7 行 1 裁定「**与需求层 F9 相反**：现行为 = 拒，F9 要求放行；F9 的存废待用户裁定」——F9 原文「判非代码面 ⇒ 父侧无令牌可写」确以门为射程，故「按实况读 + 不替用户改需求」= 正确处置 |

VERDICT: changes-required
计数：上轮 4 项全闭 · 🔴 1（新）· 🟡 2（新）· 接受 1

### 轮次 5（评审子代理）

本轮只核上轮 1🔴 + 2🟡、放行面单源、§3.2 表·`isStatePath` 行 / §3.8 表·父侧写闸行新写两句，及档首注「F1–F11」一笔。

| # | 严重度 | 状态 | 证据（指针） |
|---|---|---|---|
| 1 | 🔴 | 未修 | §3.8 表·父侧写闸行「非恰等的同名档（里层）的路径都不等于 `manifestFilePath(root)`」↔ 同格「`root` = 目标所属项目根」＋ §3.2 表·`declarationForTarget` 行「沿祖先链取最近带档目录（`owningProject`——nearest wins ∕ 纯 fs ∕ 发现梯不参与）」；`T-35`「待核格 = 旧声明档 ∥ 非恰等的同名档（里层）两形」与 `T-36` ③「归 `T-35` 待核格」沿该断言 |
| 2 | 🟡 | 保留 | §3.8 表·父侧写闸行「`faceDetail` 四格先命中先定」整段重述定义；§2 表·父侧设计门禁格「文档面放行 ∥ 其余一切产品面（fail-closed）」窄于 §3.7 行 1 定义 |
| 3 | 🟡 | 保留 | §3.2 表·`isStatePath` 行「生产**消费面**经 `isCodePath` 派生读数」↔ §3.7 表头列名「消费面」（其父侧门行不读分类器） |
| 4 | 🔵 | 记录 | §3.2 表·`isStatePath` 行平述 `isCodePath` ↔ §3.7 表首段「其既有表达（`isCodePath` 等）」；`isDocOnlyChange` 所属谓词 unverified |
| 5 | 🔵 | 记录 | §3.8 表·父侧写闸行「档面与 `faceDetail` 四格一致」＋「旧声明档侧实跑读数 = 待核」；`T-35`「实跑读数未取」无复现路径 |
| 6 | 🔵 | 记录 | 档首注「F1–F11 现行面」在批内、内证足（正文 §3.7 / §3.8 / §3.9 自指 F9 / F10 / F11）；需求侧 unverified |
| 7 | 🔵 | 记录 | §5「机检件 = 单元测试档——不进集成测试树」（无 RTM 起点的集成节）；§2 表·分类裁判行「档级行数」以数字代档位结论 |

上轮 1🔴 已核销：`T-36` ③ ∥ `T-35` ∥ §3.8 表·父侧写闸行三处已同口径（放行面 = 恰等那一份）；上轮 🟡6 的「门 / 分类器互斥」已解；上轮 🟡7 已补 F10 相反关系与待用户裁定。

计数：🔴 1 · 🟡 2 · 🔵 4

VERDICT: changes-required

### 轮次 6（评审子代理）

本轮按声明只验三件（不新开面）；上轮 1🔴 因用户裁定「没有内层 manifest」改为整条删除，按删除后的现状复核。

| # | 严重度 | 状态 | 证据（指针） |
|---|---|---|---|
| 1 | — | 已核销 | 上轮 🔴 的对象为整条删除：全档扫 `里层` ∥ `非恰等` = 零命中；`T-35` 待核格收为「旧声明档」一形（「其路径不过 `faceDetail` 第 ③ 格、落兜底产品面」） |
| 2 | — | 已核销 | ① F9 已定三处：「**与需求层 F9 同向**：F9 已按用户 2026-11-10 裁定改为…无待裁项」（§3.7 表·父侧门行）；「F9 已按用户 2026-11-10 裁定改为…与本行同向」（§3.9·声明面）；「已按用户 2026-11-10 裁定改为…无回退分支」（`T-27`）。「与需求层 F9 相反」半句已清（全档「相反」仅存 F10 一处） |
| 3 | — | 已核销 | ③ 「**待用户裁定的范围 = F10 两个文件里的后一个**——即「旧声明档（`.thincoder` 下的声明 JSON）该不该也父侧门放行」…F10 的存废本身不在问内」（§3.8 表·父侧写闸行） |
| 4 | — | 已核销 | 「旧的声明档（`.thincoder` 下那份）」保留：§3.1「旧声明档（`.thincoder` 目录下的声明 JSON）不在读面（内容零解析）」∥ §3.4 表旧声明档行 ∥ `T-30` ∥ `D15` |
| 5 | 🟡 | 未修（非 must-fix） | 放行面仍未真单源：§3.8 表·父侧写闸行仍整段重述「`faceDetail` 四格先命中先定」；§2 表·父侧设计门禁格「文档面放行 ∥ 其余一切产品面（fail-closed）」窄于 §3.7 表·父侧门行的定义（漏「出辖」与「恰等本体」两族放行） |
| 6 | 🟡 | 未修（非 must-fix） | §3.2 表·`isStatePath` 行「生产**消费面**经 `isCodePath` 派生读数」与 §3.7 表头列名「消费面」（其父侧门行）撞词 |
| 7 | 🔵 | 未修 | §3.2 表·`isStatePath` 行平述 `isCodePath` ↔ §3.7 表首段「其既有表达（`isCodePath` 等）」；逐族派生 `unverified`（代码层不在本轮靶面） |
| 8 | 🔵 | 未修 | §3.8 表·父侧写闸行「档面与 `faceDetail` 四格一致」＋「**旧声明档侧实跑读数 = 待核**」，`T-35`「实跑读数未取」——无最小复现路径，待核无闭合条件 |
| 9 | 🔵 | 未修 | 档首注「F1–F11 现行面」：在批内、内证足（正文自指 F9/F10/F11）；需求侧面 `unverified`（不在可读范围） |
| 10 | 🔵 | 未修 | §5「机检件 = 单元测试档——不进集成测试树」；§2 表「档级行数」与 `D18` 以行数代替档位结论行（声明的非靶面，仅记录） |

新增 🔴：无（删除后未留悬空引用；`T-36` ③ ∥ `T-35` ∥ §3.8 表·父侧写闸行三处同口径）。
计数：🔴 0 · 🟡 2（均未标 must-fix，不阻断）· 🔵 4

VERDICT: pass

### 轮次 7（评审子代理）

| # | 严重度 | 状态 | 证据 |
|---|---|---|---|
| 1 | 🟡 | 待处理 | `docs/core/design/PORTABILITY.md` §5 T-37 前半「`faceDetail` 取 `declarationForTarget(abs)`，门无按会话 cwd 装载的支路」——§3.7 行 1 所引原文无对应引文（负向断言「无支路」无依据行） |
| 2 | 🟡 | 待处理 | 同格题头「声明装载换源：cwd = 项目 A」与同格「本格只断言这个结论，不断言能分辨装载源」——题名所载机制本格未断言 |
| 3 | 🟡 | 待处理 | 同格夹具前提未写出：「B 的 `docRoot` 不含该文书」所依的「B 未声明 `docRoot` ⇒ 取默认」与「`<B>/lib` 无内层档」两句皆缺（同格后半却写「`lib`，自带档」） |
| 4 | 🔵 | 观察 | 本轮改动面纯 `.md`（无代码档跨界判定）；本档自载读数 conventions.mjs 172 ∥ declaration.mjs 173 ∥ dispatch.mjs 499 |
| 5 | ✅ | 已核 | ① 同格「`<R>/lib/a.md` ⇒ **判产品面 ⇒ 无令牌拒**」+「**「子优于根」只定「载谁的声明」，不定门开不开**」；旧形「放行（子优于根）」全文零命中 |
| 6 | ✅ | 已核 | ② 「判别」/「暂不判别」全文零命中（真删，非改写）；同格已写明「本格只断言这个结论，不断言能分辨装载源」 |
| 7 | ✅ | 已核 | ③ 判定 = 非新断言：「B 的 `docRoot` 不含该文书」为夹具前提（默认 `docRoot` 派生），非产品行为断言、未增分支、未增用例；「内层」全文零命中 ⇒ 与「没有内层 manifest」无档内冲突 |

VERDICT: pass

计数：🔴 0 · 🟡 3 · 🔵 1（第 7 轮，只验 §5 T-37 两处改动 + 「新断言」一问）

## §4 用户批准（主 agent）

### 用户批准

- **批准形态 = 批级放行（原话）**：「**自动跑完**」（2026-11-10 06:54）。据此本批从评审通过一路跑到收口，中途不再逐步请示。
- **本批之间的两条用户裁定（原话），均已落需求层**：
  - 「**工程模式下不能允许没令牌的时候写脚本。**」（2026-11-10 06:41）⇒ 需求层 F9 重写为「父侧写域 = 判产品面的一律要令牌」，`test` / `tests` / `scripts` / `.thincoder/tmp/**` 判产品面 ⇒ 无令牌拒；F11 的 aux·temp 豁免句同轮收正。台账 `#2271` 由此核销。
  - 「**没有内层manifest。**」（2026-11-10 06:44）⇒ 设计档「非恰等的同名档（里层）」整条删除（那个形不存在），第 5 轮那条 🔴 随之作废；「旧的声明档（`.thincoder` 下那份）」保留，仍是唯一待核形。
- **批准范围 = 设计第 7 轮评审通过的那份**（token `bc35df0e…`）+ 其后四轮只做评审 🟡 的收正与实施事实登记，未改设计语义。

## §5 实施记录（eng-coder）
**状态行**：实施完成



## 实施记录（eng-coder · 2026-11-10）

**改动面（按 §2「受影响文件」逐条落）**

| # | 文件 | 改什么 |
|---|---|---|
| 1 | `thincoder-core/manifest-schema.mjs` | `DEFAULT_MANIFEST.codePaths`：`Object.freeze(["src"])` → `Object.freeze([])`；上补四行理由注释（KD-M1-31 指针 + 用户裁定原话 + 收回路径） |
| 2 | `thincoder-core/conventions.mjs` | 分类词汇注句删「default: the path segment `src`」，改「none by default: a project declares `codePaths`」（整块重排换行，他处字面未改） |
| 3 | `thincoder-core/agent-tools/verify.mjs` | 快路径注句收正：删「(default: src — incl. prompts/*.md)」与「The project's own layout is declarable」，改「There is no default segment …（未声明 ⇒ 段面为空）」 |
| 4 | `thincoder-core/tool-docs/manifest.md` | `codePaths` 行：「replaces `["src"]`」→「no default segment…（未声明 ⇒ 无代码段，`src/` 下 `.md` 判文档）」（DESC 单源 = AC-43③） |
| 5 | `test/integration/manifest-init-default.test.mjs` | 新建（集成用例 9-2） |
| 6 | `test/rtm/paths.md` | 加 9-2 行；节注回指补 AC-31 ∥ §2.4.1，三态 = 9-1 错误 · 9-2 正常 |

**零改面核对（§2 在册的三档）**：`thincoder-core/tool-docs/manifest-read.md`（只列键名，无缺省值）· `thincoder-core/declaration.mjs`（兜底取 `DEFAULT_MANIFEST.codePaths`，值随动）· 本仓 `PROJECT-MANIFEST.json`（`codePaths: ["src"]` 是显式声明值，K4）。三档逐档读过，未改。

**不在派单文件表内的两处改动（逐处报明）**

| # | 文件 | 改什么 | 为什么 |
|---|---|---|---|
| A | `thincoder-core/agent/dispatch.mjs` | 父侧门 hint 的 `code paths:` 取值加空集分支（空时印 `none declared`） | 该 hint 只对「未声明项目」发（`!conv.declared`），旧默认下必有段名；默认清空后同一句渲成 `code paths: )`。属被改常量的消费面——不修则工程模式下每次拦写都印一句残句。设计 §2.4.1 行 7 只记「声明偏离旗变」，未记 hint 的取值渲染 |
| B | `test/rtm/paths.md` 行 `29-5` 的夹具路径 | 旧的直写夹具路径（真实仓名 + `..` 跳段 + 文档后缀）→ 占位形 `<仓名>/../<x>.md` | 既有 `档缺` 命中（不是本改动造成的）：本席触碰该档后 `doc_check` 的 gate 整档判、因此 REFUSED。按设计第 13 轮口径（夹具路径不是盘上真档 ⇒ 用占位形）收正，判据面零改 |

**验收对照（§2 的三条可红断言）**

- AC-D1 空目录 ⇒ `manifest` 工具 `init` ⇒ 读回档 `codePaths` 缺键或 `[]`。读数 = 新建用例首块断言（`默认档的 codePaths 须缺键或为 []`）。
- AC-D2 夹具仓（档内无 `codePaths`）⇒ `<root>` 下 `src` 段的文档后缀档判 `doc`。读数 = 探针实跑。
- AC-D3 同夹具加 `codePaths: ["src"]` ⇒ 同一路径判 `code`；控制项（脚本档）改前改后皆 `code`。读数 = 探针实跑。

**先红（红侧真跑过，非推断）**

```text
改回 ["src"] 后跑同一用例：
  ✖ fail 1 —— 默认档的 codePaths 须缺键或为 []，实际：["src"]
同态探针（红侧）：
  DEFAULT_MANIFEST.codePaths = ["src"] · loadProjectDeclaration.codePaths = ["src"]
  classifyPath(<root>/src/x.md)  = code   （绿侧期望 doc ⇒ AC-D2 同红）
  classifyPath(<root>/src/x.mjs) = code   （回归护，两态同值）
绿侧探针：
  DEFAULT_MANIFEST.codePaths = [] · undeclared src/x.md = doc · src/x.mjs = code
  declared ["src"] ⇒ src/x.md = code · src/x.mjs = code · declared 旗 = true
```

**验证命令与读数**

```text
node --test test/integration/manifest-init-default.test.mjs
  → tests 1 · pass 1 · fail 0
node test/run.mjs（全集成集）
  → tests 194 · pass 191 · fail 3
doc_check(mode:"gate", docs = test/rtm/paths.md ∥ thincoder-core/tool-docs/manifest.md)
  → DOC-CHECK GATE: PASS（0 段有问题；「登记未命中 7 条」= 既有登记项与本轮判集不对齐的读数，非命中）
```

三红全在 `test/integration/anthropic-tool-roundtrip.test.mjs`，读数 = `context overflow: prompt ~104047 tokens … window 128000 (limit 96000) … [model claude-fake-1]`。与本改动无涉：台账 `#2235` 已记该档单跑即红（fake 模型窗规格），且设计 §2.4.1 的变判清单里没有提示词面。

**集成集读数（三把不同的尺，各量各的，不互相校验）**

```text
尺 1  用例声明行：test/integration/*.test.mjs 的 ^test(     = 178 行 / 57 档
尺 2  RTM 登记行：test/rtm/*.md 的 | N-M |                   = 166 行 / 6 分册
尺 3  运行时计数：node --test 的 ℹ tests（含 t.test 子测试）  = 194
```

尺 1 量「静态写了多少个 `test(` 行」；尺 2 量「RTM 登记了多少个用例行」；尺 3 量「运行时执行了多少个测试（含子测试）」。本批 +1 例（9-2）。

**待裁项**

- [上抛·待裁] **未按 `#2253` 修剪集成集**。父侧 2026-11-10 裁定：本批只加 9-2、旧行零改，「未按 `#2253` 修剪」记待裁。理由 = 台账 `#2253` 自判其属集成面维护、须另一批；裁哪条故事不再需要属产品判断（材料无名单）。

**顺带记录（未改，报备）**

- `thincoder-core/conventions.mjs` 的 aux 注句两处仍写「the engineering-mode parent gate's default exemption surface」，与 `docs/core/design/PORTABILITY.md` §3.2 ∥ §3.7 行 1（该门判据 = `faceOf`、不读分类器）相反；同档「— F9」标签亦已过期（F9 现义 = 父侧写域要令牌）。属独立于本改动的一条旧债，且该面正在设计席手上动，本席未改。

**验修（代码评审 🔵 两条，只动注释与 hint 文案）**

- `thincoder-core/agent/dispatch.mjs`：那条 hint 的三元收成常量串。理由 = 该支只在 `!conv.declared` 时发，而 `declared` 是值比较（`buildDeclaration`）⇒ 未声明 ⇒ `codePaths` 与缺省逐项相等（= 空）⇒ `length > 0` 一支恒不成立，是死分支；同句前半「by the default conventions」在默认段清空后也失去所指。现文案改述判据来源（兜底分类）+ 声明指路。
- `thincoder-core/conventions.mjs`：档头枚举里的 `advisor.*` 删（该族已退场——`RETIRED_KEYS` 含它，`DEFAULT_MANIFEST` / `MANIFEST_SCHEMA` 均无此键，本仓实档亦无）。

**验修后复跑（读数分两笔，各位各的时点）**

```text
第一次全量（验修前）：tests 194 · pass 191 · fail 3（三红全在 test/integration/anthropic-tool-roundtrip.test.mjs）
第二次全量（验修后）：tests 194 · pass 190 · fail 4（同上三红 + CLI 34-3 浏览器末关形）
CLI 34-3 所在档单跑：test/integration/browser-shared-pool.test.mjs → tests 3 · pass 3 · fail 0
   ⇒ 该红并发负载下的 flake（单跑绿），与本次改动无涉：两笔验修只改注释与一句 hint 文案
test/integration/manifest-init-default.test.mjs 单跑（验修后）→ tests 1 · pass 1 · fail 0
```

三红（`anthropic-tool-roundtrip`）两笔相同读数、同一句 `context overflow … [model claude-fake-1]`，台账 `#2235` 在先。

## §6 验证与收口（父代理）

### 验证与收口（父侧）

**交付结论**：`DEFAULT_MANIFEST.codePaths` 由 `["src"]` 改为 `[]`——默认档不再替项目下「哪个目录算代码」这条判据。三处读面（`init` 写源 ∥ `fillDefaults` 补默认 ∥ `buildDeclaration` 兜底）同源改观。

**父侧独立复跑的读数（不引用实施席自报）**

```text
thincoder-core/manifest-schema.mjs:51   codePaths: Object.freeze([])          ✔
node --test test/integration/manifest-init-default.test.mjs   tests 1 · pass 1 · fail 0  ✔
node test/run.mjs   tests 194 · pass 191 · fail 3
三红全在 test/integration/anthropic-tool-roundtrip.test.mjs（同一句 token 窗口断言）
该档单跑  同红  ⇒ 既有账（`#2235` 在册），与本改动无关
CLI 34-3   父侧这次跑为绿 ⇒ 实施席报的「第四红」确认是并发 flake
doc_check(mode:"gate") 判集 5 档（MANIFEST ∥ PORTABILITY ∥ 需求 PORTABILITY ∥ rtm/paths ∥ tool-docs/manifest）
  ⇒ DOC-CHECK GATE: PASS · 0 段有问题
```

**三把尺各量什么（不是同一件事的三个数字）**：`test/integration/*.test.mjs` 的 `^test(` = 178，量「静态用例声明行」；`test/rtm/*.md` 的 `| N-M |` = 166，量「RTM 登记行」；`node --test` 的 `ℹ tests` = 194，量「运行时测试数（含子测试）」。

**实施席披露的两处表外改动，父侧逐条判**

- **A · `thincoder-core/agent/dispatch.mjs` 的 hint 文案**：默认段清空后，`code paths: ${…join}` 在空集上印残句 ⇒ 改述判据来源。**判定 = 清空默认值的必然后果，非顺手改**；第 9 个消费面已由设计席登记进 `MANIFEST.md` §2.4.1（逐面对照表第 9 行 + 受影响文件表一行 + 分层结论计数）。
- **B · `test/rtm/paths.md` 的 `29-5` 夹具路径改占位形**：既有 `档缺` 命中，触碰该档即整档判 REFUSED。**判定 = 按设计第 13 轮口径收正（占位形即正解），判据面零改。**

**评审处置收敛**

- 第 7 轮 pass 后三条 🟡（`T-37` 的 `faceDetail` 调用形无引文 ∥ 题头说的机制本格验不到 ∥ 两条夹具前提写成事实）**全部 `Fixed`**，逐条证据在 §2 第 13 轮与 `MANIFEST.md` §2.4.1 第 14 轮。
- 评审余项 🟡×2（放行面两处重述、`消费面` 撞词）**Deferred（有理由）**：非 must-fix，记 `#2279`。

**集成面（本批增量与窗口）**

- 新增 **9-2**：`manifest init` 在空目录建档 ⇒ 读回 `codePaths` 缺键或 `[]`；同仓代码段内文档后缀档判文档。用例档 `test/integration/manifest-init-default.test.mjs`，RTM 分册 `test/rtm/paths.md` 加 9-2 行。
- **未按 `#2253` 修剪**：台账自判其属集成面维护、须另一批；「裁哪条故事」是产品判断，材料无名单。已排期为 `#2253`（下一批显式接手）。

**未决 / 挂账**

- `#2253` 集成集越窗（178 ≫ 窗口 50–100）——本批按上列裁定不修，下一批接手。
- `#2279` 设计档两处 🟡（放行面重述 ∥ `消费面` 撞词）。
- `#2280` `conventions.mjs` 的 aux 注句仍写「engineering-mode parent gate's default exemption surface」+「— F9」标号过期——与 `PORTABILITY.md` §3.7 行 1（该门判据 = `faceOf`）相反，**既有旧债，本批未碰**。
- `§3.8 行 1` ∥ `T-35` 的「旧声明档侧门读数 = 待核」仍在册：一次实跑即可定放行 / 拒，`F10` 待用户裁。
- 暂缓批复核：无。
- 用户文档面同步：本批不涉用户可见能力，无。

**文档机检**：`DOC-CHECK GATE: PASS`（判集 5 档，0 段有问题）。
