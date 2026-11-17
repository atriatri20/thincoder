# 2026-11-12 · stale-refs-sweep
> 六段，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 每段只有一个作者：作者的段可 `append` 加内容、可就地改（`edit`）；非作者一概拒。
> 编制：主 agent · 2026-11-12 · 来源 = 用户 2026-11-12 16:46「那些失效的垃圾代码都要清除掉，别留着。」∥ 16:48「过时的文档，失效的代码，都要清除。」∥ 16:49「docCheckExcludePaths 这个是要保留的」「而且要接线。」∥ 16:50「index.docCheckExts 这个我也不知道怎么用。」。
> 台账 = #2364（core · 归批）。前情 = 无（独立批）。
## §1 讨论（主 agent）
**状态行**：已收口 2026-11-12
批起 sha = a08c7c4cac85ab1e9a38b0a575bdab94bdc833f1
<§1 模板占位：本批条目 / 关键判据 / 授权口径>

**要解决的问题**

2026-11-12 的一轮「整档重写」删掉了文档机检的一整套旧机制（`doc-check/` 下十档、`batch-gate-hit/judge/report` 三档、`scripts/doc-check.mjs` 与 `doc-check-anchors.mjs`），但引用它们的代码与文档留在原地——有的是坏 import、有的是死 npm script、有的是注释与验收行还指着一个不存在的档。

用户裁定：**过时的文档、失效的代码，都要清除。** 判据是「读者照着这句话去做，会落空」——不是「看着旧」。

**勘察结果（`explore` 只读，全仓扫过 `.mjs` ∥ `package.json` ∥ `docs/**` 扣 `docs/batches/`）**

| 栏 | 量 | 典型 |
|---|---|---|
| 失效的代码 | 23 条 | `thincoder-cli/scripts/doc-impact.mjs` 导入已删的 `doc-check-anchors.mjs`（全仓无消费者）· `thincoder-vscode/package.json` 的 `doc:check` 指向已删的 `scripts/doc-check.mjs` · `scripts/doc-check-linecounts.mjs` ∥ `doc-check-paragraph.mjs` ∥ `doc-check-targets.mjs` 三档孤儿 · 18 条注释仍指 `doc-check/anchors.mjs` |
| 过时的文档 | 40 条 | 多份设计档的验收行写 `node scripts/doc-check.mjs --root .` · `EDIT.md` 两处写 `zones` 入参 · `PATH-RESOLUTION.md` 写五个已删档 · `ANCHOR-DEBT-REPAIR.md` 写 `NOTE_MARKERS` ∥ `DOC_CLASS` |
| 死节指针 | 15 档 26 处 | 全仓把 `docs/core/design/DOC-DISCIPLINE.md` §3.x（§3.5 ∥ §3.7 ∥ §3.15 ∥ §3.20 ∥ §3.23 ∥ §3.28 ∥ §3.30.1）当落点——该档重写后只有 `## 1` `## 2` `## 3` 三节 |
| 配置键 | 2 个 | `index.docCheckExcludePaths` ∥ `index.docCheckExts`，除 `manifest-schema.mjs` 自身外全仓零消费点 |

**已定决定**

- **已定决定**：失效的垃圾代码一律清除 · 用户原话：「那些失效的垃圾代码都要清除掉，别留着。」 · 时间：2026-11-12 16:46

- **已定决定**：过时文档与失效代码同批清除 · 用户原话：「过时的文档，失效的代码，都要清除。」 · 时间：2026-11-12 16:48

- **已定决定**：`index.docCheckExcludePaths` 保留并接线（写进去必须真生效） · 用户原话：「docCheckExcludePaths 这个是要保留的」「而且要接线。」 · 时间：2026-11-12 16:49

- **已定决定**：`index.docCheckExts` 删除 · 用户原话：「index.docCheckExts 这个我也不知道怎么用。」 · 时间：2026-11-12 16:50

**库内 = 已查**：`explore` 全仓扫（`.mjs` ∥ `package.json` ∥ `docs/**` 扣 `docs/batches/`），检索面覆盖十个已删 `doc-check/` 模块名、三个 `batch-gate-*`、`scripts/doc-check*.mjs`、六个已删机制符号、全部 manifest 键名；逐条给路径与逐字原文。

**库外 = B 类**：改动面 = 仓内代码与档；外部断言 = 零。

**不动**：`docs/batches/` 下一切旧批档（用户 2026-11-12 16:31 裁定：不要扩散到旧批档）。

**设计轮 1 上抛的三条，主 agent 裁定（2026-11-12 18:47）**

**① 需求面缺行 —— 已补，本席落笔。** `docs/core/requirements/DOC-CHECK.md` 新增 **F9**（排除面收窄判集：`index.docCheckExcludePaths` 声明的路径前缀，其下的档不进判域、不计入 `范围 N 档`；命中形 = 相等或以「前缀 + 斜杠」开头；声明读不到 ⇒ 照判）与 **AC-12**（声明 ⇒ 零输出 ∥ 撤声明 ⇒ 报 ∥ 前缀边界照报）。

写这一笔时被门自己拦了一次：AC-12 初稿里写了一个不存在的路径形，`doc_write_gate` 判「档不存在」拒写；改成不带路径 token 的写法后落盘。**门在我自己身上生效了。**

**② `thincoder-cli/AGENTS.md` 那条约定 —— 改指，不删句。**
那句写的是「实施轮开工前先跑一遍，看这轮会影响到哪些档」。删掉脚本之后**意图仍然成立**（开工前看影响面），失效的只是落点。
删一句既有约定属语义变更，不该由清账批顺手做掉；改成指向现役的 `doc_graph` 工具面，意图不变、落点落地。设计席把这一行写进 §2 落点表。

**③ 计数不符 —— 记账，不改数。**
§1 原写「18 条注释指 `doc-check/anchors.mjs`」，同尺实测 6 处（代码 4 ∥ 文档 2，扣 `docs/batches`）。差额疑在旧批档里（不在射程）。
**§1 那个数保留原样、在此标注差异**：它是我勘察时的读数，改它等于改写当时的证据；现任读数以设计席的 6 为准。

**C4 落点改动 —— 准。**
设计席把落点从「前缀命中的目录不进索引（`pathIndexOf`）」改成 `judgedDomainDocs`（判域谓词），理由是排除的方向是**放行**而不是**加报**。
原写法照做会让命中前缀的档「找不到而被报」，方向反了。**以设计的落点为准。**

- **已定决定**：自动推进 = 本批全链（含 `#2365`）· 评审点火 ∥ 修正轮 ∥ 实施 ∥ 收口 全程不再逐步等开工词 · 用户原话：「自动跑完吧」 · 时间：2026-11-12 18:51

**设计席报的两条 Leads，本席判「收进本批射程」**（它们都是本批要清的同一个病：把退役/批次叙述写进活档）

1. `test/rtm/guard.md` 的 `7-7` 行异常列「旧机制「批档自身恒在判域」在本行退役」——**改写为现状陈述**（该行断什么就写什么，不提「退役」）。
2. `test/integration/batch-close-gate.test.mjs` 注释「// 7-20（本批新增）」——**删掉批次叙述**，只留用例说明。

两条都归实施轮（产品面），设计席须在 §2 落点表补两行。判据：改后这两处读不到「退役 ∥ 本批新增」一类历史视角。

**主 agent 接走的两项（实施席路由过来的）**

1. **`PROJECT-MANIFEST.json` 的 `"docCheckExts": []` 已删**（本席直接改档：`manifest` 工具拒绝 `null`，且它自己的键目录仍列着这个键 ⇒ 用工具删不掉）。删后 `manifest-schema.mjs` 与全仓 `.mjs` 里 `docCheckExts` 零命中，`doc_check(mode:"gate")` 仍 `PASS`（说明 manifest 解析正常）。
2. **设计/需求档面的旧命令与旧符号**：归设计席（`eng-designer #16` 在办）。

**工具面的一个残留（只记不修）**：`manifest` 工具的键目录里仍有 `index.docCheckExts`，读出来还会报 `missingKeys=index.docCheckExts`——而 schema 已无此键。工具目录跟着 schema 走才能自洽，不属本批射程。

## §2 批次任务与设计（eng-designer）
**状态行**：设计完成（文档面全落；`docs/vsc/design/VSC-DEBT.md` 整份 `report` 首行 `PASS`（改前 6 命中）· 修正轮 30 ∥ 31 已落 · 收口门补件 32 ∥ 33 已落（机读清单 +6 行读数、越线档一条拆档方案，实施笔归下一轮）· 两条待裁见本节末段）

<§2 模板占位：本批条目（覆盖） / 设计档落点 / 机制设计 / 受影响文件与测试覆盖 / 验收对照 / 关键决策 / 上抛项>

<§2 模板占位：机读清单 = 标题行「**受影响文件（机读清单）**」+ 围栏内三列表（表头 | 档 | 分拆方案 | 行数 |、分隔行 |---|---|---|、一行一档，只列代码档（源 ∥ 单测））；第二列：越设计时线的档写正向形方案（点名带目录段的档 + 本批落步 `实施轮` ∥ `§5`），未越线写 —；第三列：该档在批起快照上的内容行数（量法 = `countContentLines`），快照里没有这一档写 `新`；示例行 = | thincoder-core/agent-tools/batch-tier-gate.mjs | — | 新 |>

**本批条目（覆盖）**

| # | 条目 | 判据（可判的落点） |
|---|---|---|
| C1 | 清除失效代码：坏 import（`thincoder-cli/scripts/doc-impact.mjs`）· 死 npm script（`thincoder-vscode/package.json` 的 `doc:check`）· 三份孤儿脚本（`scripts/doc-check-linecounts.mjs` ∥ `scripts/doc-check-paragraph.mjs` ∥ `scripts/doc-check-targets.mjs`） | 删净后全仓按下面的「清扫尺」跑一遍 ⇒ 这四类名字零命中 |
| C2 | 清除过时文档与死节指针：写着已删机制的验收行、已删的入参、已删的节号（`docs/core/design/DOC-DISCIPLINE.md` §3.x 一族） | 同一把尺跑一遍 ⇒ `scripts/doc-check.mjs` ∥ `doc-check/anchors.mjs` ∥ `doc-check-anchors.mjs` 三串零命中；指向 `DOC-DISCIPLINE.md` 的 §3.5 ∥ §3.7 ∥ §3.15 ∥ §3.20 ∥ §3.23 ∥ §3.28 ∥ §3.30.1 一律改指该档现有三节之一（`## 1` ∥ `## 2` ∥ `## 3`）或删句 |
| C3 | `index.docCheckExts` 删除：schema 默认值 ∥ 数组层校验 ∥ 元素层校验 ∥ 注释 ∥ 本仓 `PROJECT-MANIFEST.json` 的键 ∥ 三处注释提法 | 全仓 `docCheckExts` 零命中（清扫尺同款） |
| C4 | `index.docCheckExcludePaths` 保留并**接线**：写进去必须真生效 | 需求 = `docs/core/requirements/DOC-CHECK.md` F9 ∥ AC-12（三半逐条回指）· 设计单源 = `docs/core/design/DOC-CHECK.md` §10 的三条验收（排除即放行 ∥ 撤声明照判 ∥ 前缀边界）· 判读人 = 本轮单测档 |
| C5 | **不做**：`thincoder-core/doc-graph.mjs` 档头两行陈旧指针（`doc-check/anchors.mjs` ∥ `doc-check/graph-tokens.mjs`） | 该档批起快照读数 778 行，越过 500 行设计器硬线；碰它就要在本批背一份拆档方案，而本批是清账批 ⇒ 台账行由主 agent 记，不在本批改 |

**清扫尺（本批所有「零命中」判据的同一把尺）**：内置 `grep`（文本类读数的尺；不用 shell 的 rg ∥ findstr——换个尺量的数与本尺不可比），在仓根跑，检索面 = `**/*.mjs` ∥ `**/*.json` ∥ `**/*.md`；计入面扣 `node_modules` ∥ `.git` ∥ `docs/batches` ∥ `_archive`；模式串 = 上列各名字面。读数写在本批 §5（实施记录），不抄进任何设计档。

**设计档落点**

- 机制设计（排除面）= `docs/core/design/DOC-CHECK.md` §10（本席本轮新增，已落盘）。§10 定目标态与判据；实施笔归 eng-coder。
- 键面口径 = `docs/core/design/MANIFEST.md` 的键条与键目录表：`docCheckExts` 行删除；`docCheckExcludePaths` 行由「键在，今天没有消费者」改成 §10 的口径并指回 §10。
- 工具描述面 = `thincoder-core/tool-docs/manifest.md`（两键行）∥ `thincoder-core/tool-docs/doc_check.md`（补一句：排除面上的档不进判域）。描述面随行为同笔改，不是顺手改。

**机制设计（C4 摘要，单源在 §10）**

- 声明面 = 该档所属项目 manifest 的 `index.docCheckExcludePaths`，项目根相对路径前缀；归一复用 `normalizePathList`（`thincoder-core/declaration.mjs`）。
- 命中 = 相等或「前缀 + `/`」起头；裸前缀不算命中。
- 落点 = `thincoder-core/doc-check/index.mjs` 的 `judgedDomainDocs`（判域谓词唯一一处，三个调用面共用）：先批档面、再排除面。
- 效果 = 不进判域：三件不判、不出行、不进 `checkFiles`（`范围 N 档` 数不到它）；全排除是合法状态，首行照常 `PASS`。
- 失败面 = manifest 读不到 ⇒ 排除面为空、照判（放行必须有声明）。

**受影响文件与档位结论**

代码档（源 ∥ 单测）：

| 档 | 本批动作 |
|---|---|
| `thincoder-core/doc-check/index.mjs` | C4 接线：`judgedDomainDocs` 加排除面过滤（读 manifest + `normalizePathList` + 前缀命中） |
| `thincoder-core/manifest-schema.mjs` | C3：删 `docCheckExts` 默认值 ∥ 两处校验 ∥ 注释；C4：`docCheckExcludePaths` 的注释改指 §10 |
| `thincoder-core/declaration.mjs` | 注释面：第三个消费面的机制指针改指 `docs/core/design/DOC-CHECK.md` §10（原指该档已不存在的 §2.6） |
| `thincoder-core/doc-check/doc-tokens.mjs` | 注释面：删「项目追加项 = `index.docCheckExts`」一句（C3） |
| `thincoder-core/doc-graph/anchors.mjs` | 注释面：同一句 C3 提法删除；档头首行的 `doc-check/anchors.mjs` 改成本档真实路径 `thincoder-core/doc-graph/anchors.mjs`（档搬走后档头未跟） |
| `thincoder-core/agent-tools/batch-paths.mjs` | 注释面：`doc-check/anchors.mjs` 改指 `thincoder-core/doc-graph/anchors.mjs` |
| `thincoder-core/doc-graph/doc-batch-face.mjs` | 档头两行：「`doc-check/doc-batch-face.mjs`」改成本档真实路径（本档即落点，副本早已搬走）；「分拆落点 = 归批档 §2 的机读清单」那行里的 `thincoder-core/doc-check/anchors.mjs` 改指现役 `thincoder-core/doc-graph/anchors.mjs` |
| `scripts/prompt-refs-check.mjs` | 注释面：`doc-check/anchors.mjs` 改指 `thincoder-core/doc-graph/anchors.mjs` |
| `thincoder-cli/scripts/doc-impact.mjs` | **删档**：`../../scripts/doc-check-anchors.mjs` 已不存在，`extractAnchors` 在 `thincoder-core/doc-graph/anchors.mjs` 零命中（该档只出 `checkAnchors`）；同职能已有 `doc_graph` 工具面（`thincoder-core/agent-tools/doc-graph.mjs`），本脚本无代码消费者 |
| `scripts/doc-check-linecounts.mjs` ∥ `scripts/doc-check-paragraph.mjs` ∥ `scripts/doc-check-targets.mjs` | **删档**：仓内 `.mjs` ∥ `.json` 零消费者（只互相 import） |
| `thincoder-vscode/package.json` | 删 `doc:check` 一行（指向已删的 `scripts/doc-check.mjs`） |
| `test/integration/batch-close-gate.test.mjs` | 加一条集成用例 `CLI 7-26`（设计 `docs/core/design/DOC-CHECK.md` §10「集成测试设计」）：排除面前缀下的档不进判域 ∥ 撤声明照判 ∥ 同级目录 `docs/tmp-x` 照报，入口 = 真 `batch close` |

文档档（无行数义务，逐档按清扫尺处置）：

- 设计面：`docs/core/design/DOC-CHECK.md`（本席，§10 已落）∥ `docs/core/design/MANIFEST.md` ∥ `docs/core/design/ANCHOR-DEBT-REPAIR.md` ∥ `docs/core/design/DOC-CODE-RECONCILE.md` ∥ `docs/core/design/DOC-SYSTEM.md` ∥ `docs/core/design/PATH-RESOLUTION.md` ∥ `docs/core/design/EDIT.md`。
- 需求面：`docs/core/requirements/DOC-GRAPH.md` ∥ `docs/core/requirements/DOC-SYSTEM.md` ∥ `docs/core/requirements/ENGINEERING-MODE-V2-SPEC-MACHINE-CHECK.md` ∥ `docs/core/requirements/TESTING.md`。
- 端面与描述面：`docs/cli/design/ACP-CLIENT.md` ∥ `docs/cli/design/ACP-PROTOCOL-COMPLIANCE.md` ∥ `docs/desktop/design/PANEL-READBACK.md` ∥ `docs/server/design/PROJECT.md` ∥ `docs/server/design/ops/OPS.md` ∥ `docs/vsc/design/VSC-DEBT.md` ∥ `docs/TODO.md` ∥ `test/rtm/tooling.md`。
- 工具描述面：`thincoder-core/tool-docs/manifest.md` ∥ `thincoder-core/tool-docs/doc_check.md`。

约定面（C1 删脚本后原句无落点 ⇒ 改指现役工具面，不删句）：

| 档 | 目标态（逐字） |
|---|---|
| `thincoder-cli/AGENTS.md` | `- **改动面反查（工程工具约定）**：实施轮开工前用 \`doc_graph\` 工具面反查文档影响面（基准 = 上一批收口点）——其输出的设计/需求档建议一并录入本批「受影响文件」表。` |

只换落点：条目名 ∥ 意图（开工前先看影响面）∥ 后半句（建议一并录入受影响文件表）逐字不动——删一条既有工作约定属语义变更，不在清账批里做。

**档位结论**：逐档读数（`countContentLines`，批起快照 `a08c7c4`，取值 = `git show <sha>:<档>`）见下表第三列；**最大 = 474**（`thincoder-core/doc-graph/anchors.mjs`），**无一档越过 500** ⇒ 本批无拆档方案。唯一的 778 行档 `thincoder-core/doc-graph.mjs` 不进本批改动面（条目 C5）。

**受影响文件（机读清单）**

```text
| 档 | 分拆方案 | 行数 |
|---|---|---|
| thincoder-core/doc-check/index.mjs | — | 172 |
| thincoder-core/manifest-schema.mjs | — | 182 |
| thincoder-core/declaration.mjs | — | 397 |
| thincoder-core/doc-check/doc-tokens.mjs | — | 111 |
| thincoder-core/doc-graph/anchors.mjs | — | 474 |
| thincoder-core/agent-tools/batch-paths.mjs | — | 234 |
| thincoder-core/doc-graph/doc-batch-face.mjs | — | 59 |
| scripts/prompt-refs-check.mjs | — | 145 |
| thincoder-cli/scripts/doc-impact.mjs | — | 144 |
| scripts/doc-check-linecounts.mjs | — | 142 |
| scripts/doc-check-paragraph.mjs | — | 6 |
| scripts/doc-check-targets.mjs | — | 97 |
| thincoder-vscode/package.json | — | 161 |
| test/integration/batch-close-gate.test.mjs | 抽出 `test/integration/batch-close-gate-narrowing.test.mjs`：`CLI 7-24` ∥ `7-25` ∥ `7-26`（区外不出行两例 + 排除面前缀一例）与其夹具常量整体搬入，原档留其余用例与共享夹具 `close-gate-fixture.mjs`；断言语义与用例号零改；本批落步 = 实施轮 | 460 |
| docs/batches/2026-11-12-stale-refs-sweep.test.mjs | — | 新 |
| thincoder-core/agent-tools/design-token.mjs | — | 429 |
| thincoder-core/agent-tools/subagent-design-token.mjs | — | 132 |
| thincoder-core/token-ttl.mjs | — | 428 |
| thincoder-core/session-slot-write.mjs | — | 279 |
| test/integration/edit-batch-entry-outcome.test.mjs | — | 92 |
| test/integration/tester-role.test.mjs | — | 298 |
```

**机读清单补登六行的归属（32）**：这六档的笔不在本批——前四档的实现归 `#2365`，后两档是实施席为让 `test/rtm/tooling.md` 与用例同笔而同步的夹具路径。本批只登记读数、不认领实现：收口门按改动面判，不按归属判，缺读数就拒。

**验收对照（回指需求与设计）**

| 条目 | 判据落在 | 怎么判 |
|---|---|---|
| C1 ∥ C2 ∥ C3 | 本段「清扫尺」 | 同一把尺（内置 `grep`）跑一次，命中 = 0（`docs/batches` 之外的活面）；读数进 §5 |
| C4 | 需求 `docs/core/requirements/DOC-CHECK.md` F9 ∥ AC-12 · 设计 `docs/core/design/DOC-CHECK.md` §10 三条 | 本轮单测档 `node --test <该档>`，F9 的三半逐条判：声明前缀下的夹具零输出（AC-12 前半）∥ 撤掉同一条声明、同一份夹具照报（AC-12 中半）∥ 前缀边界——与声明首段同字、只多若干字母的同级目录照报（AC-12 后半）；红侧 = 改前代码同一夹具 `REFUSED` |
| C5 | 本段条目表 | 本批 `git diff --name-only` 不含 `thincoder-core/doc-graph.mjs`；台账行由主 agent 记 |
| 集成面 | 设计 `docs/core/design/DOC-CHECK.md` §10「集成测试设计（从 `test/RTM.md` 索引出发的 delta）」 | 破的 0 · 冗余 0 · 缺 1（`CLI 7-26`，走真 `batch close`）——C1–C3 是删死件、不动业务可观测结果；C4 接上排除面后，一份原本 `REFUSED` 的档变 `PASS` 正是 AC-12 断的那件事，故本批有 delta（本仓 `docCheckExcludePaths` 现为 `[]` 只说明今天没有声明，不说明没有 delta） |

**关键决策**

- **KD-1 排除面 = 判集收窄，不是第四判据**：判据仍三件；排除面只决定「哪些档进来」。理由 = 用户要 `docCheckExcludePaths` 真生效，而多一种「不看某处」的判据会把三条判据的边界弄糊。
- **KD-2 失败方向 = 照判**：manifest 读不到 ⇒ 不排除。理由 = 放行必须有声明；读不到声明时替项目放行，等于把声明面的把关换成一次静默猜测。
- **KD-3 落点在 `judgedDomainDocs` 而不是索引侧**：排除若只落进 `pathIndexOf`（索引少几档），效果是让那里的档「找不到」而被报——方向反了；排除是放行，不是加报。
- **KD-4 `doc-impact.mjs` 删档不重指**：它 import 的 `extractAnchors` 在现役 `thincoder-core/doc-graph/anchors.mjs` 零命中，仓里没有可重指的实现；同职能已有 `doc_graph` 工具面。重造一个抽取函数 = 新机制，没人要——走 D13 会拿它接着活、D1 会要授权，两条都不该在这里发生。

**上抛项**

**本轮无待裁项**——三条已由 §1 于 2026-11-12 18:47 裁定，落点如下：

- **① 需求面已接上**：`docs/core/requirements/DOC-CHECK.md` 已含 **F9**（排除面收窄判集：声明前缀下的档不进判域、不计入「范围 N 档」；命中形 = 相等或以「前缀 + 斜杠」开头；声明读不到 ⇒ 照判）与 **AC-12**（声明 ⇒ 零输出 ∥ 撤声明 ⇒ 报 ∥ 前缀边界照报），主 agent 笔。本段 C4 的条目行与验收对照行逐条回指这两处。
- **② 约定行 = 改指，不删句**：`thincoder-cli/AGENTS.md` 那句的意图（开工前先看影响面）仍成立，失效的只是落点；目标态逐字入本段「文档档 → 约定面」表，实施笔归 coder。

- **③ 计数读数（本轮复量，取代上一轮的 6）**：内置 `grep`，模式 `doc-check/anchors\.mjs`，域 `**/*.{mjs,json,md}`，仓根跑一遍；`docs/batches/**` 的命中不计（那一面按 §1 裁定不动）⇒ 活面 **7 行 / 7 档**：代码 5 处（`thincoder-core/agent-tools/batch-paths.mjs` · `thincoder-core/doc-graph/anchors.mjs` · `thincoder-core/doc-graph/doc-batch-face.mjs` · `thincoder-core/doc-graph.mjs` · `scripts/prompt-refs-check.mjs`）+ 文档 2 处（`docs/core/requirements/DOC-GRAPH.md` · `test/rtm/tooling.md`）。§1 的「18 条」为勘察期读数，保留原样，差额在不在射程的旧批档里；上一轮本席记的 6 漏了 `thincoder-core/doc-graph/anchors.mjs` 的档头一行，以 7 为准。本批清 6 处，`thincoder-core/doc-graph.mjs` 那 1 处归 C5。

**修正轮 · 评审号 29（2026-11-12）**

**29 → 已落：`docs/core/design/DOC-CHECK.md` §9 的修订式表达清零。** 目标 1 处 + 同族扫出 10 处 = **11 处**，逐条如下（落点按原句认，不按行号）。

| # | 落点（§9 内，按原句认） | 删了什么 → 现在是什么 |
|---|---|---|
| 1 | 「旧口径的另三处已改成…」整句（本轮目标） | 删「旧口径的另三处已改成本节的说法」与括号里转述的退役口径「原写「批档自身恒在判域 ∥ 含批档自身」」→ 现写「**另三处写着本节的口径**：…注释（取材面含批档自身，收口判域才滤）…（二十一态在表上，`7-24` ∥ `7-25` 含在内；`7-7` 断 `范围 0 档`）」 |
| 2 | 「同类先例」条末（§9 库内调查段） | 删「，正是本批要治的那处」 |
| 3 | 「破的」· `7-22` 那条 | 删「断的东西改了。」与转述的退役口径「旧行断「批档 `PASS` ∥ 同形设计档 `REFUSED`」，不点名 mode」→ 现只写两个 mode 各断一半 |
| 4 | 「破的」· `7-14` 那条 | 删「判据格旧指「§6 判面 = 整份文档」，该句已不在盘 ⇒ 改指」与「一字未改」→ 现写「判据格指 §9 写时点（判据格是回指，断言本身不随它变）」 |
| 5 | 六行那一句 | 删「与本设计之前同值」→ 「按本节口径成立」 |
| 6 | 六行的落红 ∥ 回绿段 | 删「还是旧形批（`rev-parse HEAD` 取到的祖先提交）…换成真快照后回绿，断言一字未改」→ 现写「夹具把批起基线取成真快照（`commit-tree -p HEAD` 的旁支提交）；基线落在一份旧形祖先提交上时，按 §6「② 的失败面」整批零输出」 |
| 7 | 「`7-7` 不在破的里」句 | 删「本设计下仍成立」 |
| 8 | 「缺的 = 两行」句 | 删「本设计新增的」与「此前表上没有这两号」→ 「判的是本节新增的判别性一半」 |
| 9 | `7-21` ∥ `7-23` 那段 | 删「是本设计之前就落定的两行」「本设计不改它们的判据」「`7-22` 的改写见上」 |
| 10 | 「描述面与注释面随行为同笔改」段（两笔） | 删「随行为同笔改」「行为改了而描述不改，模型读到的是旧口径」「它是本批的必有件，不是顺手改」→ 现写「与行为同一口径」+「描述与行为不一致时，模型照描述去用这个工具」 |
| 11 | 「写时点判据一个字节都不改」段 | 删「一个字节都不改」「与本节之前逐字相同」「变动的只有一件事」→ 现写「写时点判据照 §1 那三件，一件不加」+ 拒文与报面句子「按 §1 ∥ §5」 |

**全档复扫（同一族，整档而非只 §9）**：零残。剩一处程序性的「换成」在「`moment` 闭集」那条的复现步骤里（「把同一句的 `'Close'` 换成 `'close'`」）——那是让人照着跑的动作，不是历史，保留。带「旧」字的三处是结构性称谓，不是退役措辞：`旧形祖先提交`（§6「② 的失败面」的结构分类）∥ `旧批档`（盘上既有批档）∥ `旧悬空指针`（区外既有悬空）。

**改后的三处现写什么（本轮读过的，不是据记忆）**：`test/integration/close-gate-fixture.mjs`「取材面含批档自身；收口判域里它被移出」∥「含批档自身：取材面不滤它，收口判域才滤」· `test/integration/batch-close-gate.test.mjs` 档头按 §6 ∥ §9 ∥ §3 ∥ §8 分条 · `test/rtm/guard.md` 的 `CLI 7` 目的句写「判的是本批笔域集里**收口时点要判的档**，而每一档里只判**本批变更区**」。

**读数取法（保留不动）**：本批「零命中」判据那把尺 = 内置 `grep`、仓根逐面跑（`**/*.mjs` ∥ `**/*.json` ∥ `**/*.md`），**批档命中在事后扣除**，不用 `!docs/batches/**` 排除式——那形在仓根不生效（工具面行为，已记账，不属本批射程）。

**复跑**：`doc_check(mode:"gate", docs:["docs/core/design/DOC-CHECK.md"])` → 首行 `DOC-CHECK GATE: PASS`，无附加行。

**修正轮 · 评审第 1 轮（1🔴 · 7🟡 · 1🔵；1–8 本席已落，9 归需求面）**

落点全部在 `docs/core/design/DOC-CHECK.md`（§10 为主体，第 7 条在 §9）。逐号如下。

| # | 改了哪一处 | 逐字要点 |
|---|---|---|
| 1 | §10 新增「集成测试设计（从 `test/RTM.md` 索引出发的 delta）」整节 | 破的 = 无（现役夹具的根由 `test/integration/close-gate-fixture.mjs` 造，那份 manifest 只写 `version` ∥ `phase`；本仓 `PROJECT-MANIFEST.json` 的 `"docCheckExcludePaths": []`）· 冗余的 = 无（`7-2` 由笔域集定、本节由 manifest 定；`7-7` 断的是 `范围 0 档` = `checkFiles` 0 的等式，本节改判域大小）· 缺的 = 一行 `7-26`（四格：组件交互 / 业务结果三半 / `F9 ∥ AC-12` / 真 `batch close`）。§10「判读人」原句「单测档随批、不进本档，也不进集成树」删除，改作「单测档随批、收口即删……常驻的那一半见下节（集成行 `CLI 7-26`）」 |
| 2 | §10 新增「同类先例」∥「库内 = 已查」∥「库外 = 已查」 | 先例 = `index.excludePaths`：对齐（同前缀形 ∥ 同 `normalizePathList`）· 偏离（那个键喂索引、本节喂判域，判据一件不加）· 既有形不适用（索引侧少几档的效果是「找不到而被报」，方向与放行相反，KD-3）。库外实跑：两个声明仓 grep `docCheckExcludePaths` 零命中；`排除面` 在 `../.thincoder` 只命中 `tmp/` 旧工作副本、`../thincoder.com` 零命中 |
| 3 | §10 新增「这个键不是新起的（`existing:`）——三问的答案」 | 住哪 = `thincoder-core/manifest-schema.mjs` 的 `DEFAULT_MANIFEST.index`，引「docCheckExcludePaths: Object.freeze([])」· 叫什么 = 逐字沿用（公开键，改名即改声明面）· 谁 = 属主 = schema 那处键 + `normalizePathList`，今天零消费方，本批接成 `judgedDomainDocs`。另补一句：schema 的 `[]` 缺省就是「读不到 ⇒ 照判」落到的那一侧 |
| 4 | §10 新增「落点表」（五档）+「读键的那一侧」段 | 五档 = `thincoder-core/doc-check/index.mjs`（谓词读键）· `manifest-schema.mjs`（两处「今天无消费面」注释收正）· `declaration.mjs`（档头把机制指向 `§2.6` 的悬空节指针改指本节）· `tool-docs/doc_check.md` · `tool-docs/manifest.md`。读键侧 = 判域谓词自己读，**不经 `buildDeclaration` 投影**（它只投影 `excludePaths ∥ publicRepos ∥ writableRepos`；谓词已在按每份档的项目根算），归一仍走同一支 `normalizePathList` |
| 5 | §10 验收第 3 条（`gate` 面）重写 | 成立条件写死：夹具先造「该档在本批变更区内」——真 git 仓 ∥ 批起快照基线（§8「快照怎么取」）∥ 该档本批改过一行；并写明「条件不成立时 `gate` 恒零输出（§6「两样都没有」），红侧永远红不起来——这一条的成立条件是基线在，不是回执长相」 |
| 6 | §10「读不到 manifest ⇒ 照判」补「出处」∥「复现」两半；验收补第 5 条 | 出处 = `readManifest` 返 `reason: "missing"`（逐字引）+ `declaration.mjs`「missing / unusable manifest → the defaults, root still known」；复现 = 无 manifest 的夹具档 ∥ 键写成非数组（引 schema 数组层 fail-closed 与 `normalizePathList` 对非数组返空清单），两条都 `REFUSED` |
| 7 | §9「一条谓词，住在装配档」后加一句 | 「这个函数上挂着两道滤：上面这道认批档面，第二道认排除面（§10）——「哪些档进来」的加减只在它这一处发生。」 |
| 8 | §10 验收标题改「验收（回指 `docs/core/requirements/DOC-CHECK.md` F9 ∥ AC-12）」，五条各标 AC 的半 | AC-12 前半 = 排除即放行 + 撤声明照判（红侧）+ `gate` 面（交付面）；AC-12 后半 = 前缀边界；F9 末句 = 声明读不到 |
| 9 | 未动 | 需求档 AC-12 的例化改写归主 agent（`docs/core/requirements/DOC-CHECK.md`），本席一字未碰 |

**同族扫出的两处（同一轮改掉）**：§9 里 `CLI 7` 的态数两处（「另三处写着本节的口径」括号内 ∥ 「`CLI 7` 表现…态，各管哪一半」）由二十一改二十二并点入 `7-26`——新行落在同一张表上，计数与表必须同笔动。

**§2 自身就地更正两处**：机读清单补两行（`test/integration/batch-close-gate.test.mjs` = 460，批起快照读数；`docs/batches/2026-11-12-stale-refs-sweep.test.mjs` = `新`）·「验收对照」的集成面一行由「zero rows」改成 §10 的 delta（破的 0 · 冗余 0 · 缺 1）。

**复跑**：`doc_check(mode:"gate", docs:["docs/core/design/DOC-CHECK.md"])` → 首行 `DOC-CHECK GATE: PASS`，无附加行。

**文档面轮（eng-designer 第 2 派 · 2026-11-12）**

笔域 = 本 spawn 声明的 8 档 `.md`。产品面与需求面不在本席笔下。

| 档 | 改了什么 | 现读什么 |
|---|---|---|
| `docs/core/design/MANIFEST.md` | 键集删 `docCheckExts`（默认档 ∥ 键目录行 ∥ 元素层清单 ∥ 白名单 17→16）；`docCheckExcludePaths` 两处改接线口径回指 §10；删「`scripts/doc-check*.mjs` 脚本面仍在盘」整条；删 `publicRepos` 条指 §4.2.2 的子句；读声明面「一处」→「两处」 | 键目录 16 节点；排除面口径 = `docs/core/design/DOC-CHECK.md` §10 |
| `docs/cli/design/ACP-CLIENT.md` | AC-862-5 手跑命令改文档门；§11 交叉印证行的 `MiMo-Code` 路径 token 收成「`MiMo-Code`（opencode 派生）的 ACP agent 实现」 | `doc_check(mode:"gate")` 首行 `DOC-CHECK GATE: PASS` |
| `docs/cli/design/ACP-PROTOCOL-COMPLIANCE.md` | AC-6 行 ∥ §12 第 3 项同改 | 同上 |
| `docs/desktop/design/PANEL-READBACK.md` | AC-5（文档）同改 | 同上 |
| `docs/server/design/PROJECT.md` | 文档面行 ∥ 交付面收口轮句同改；R43 行同族清单五处→三处（两档本批删档，计数与清单同笔动） | 同上 |
| `docs/TODO.md` | 「新引擎 `scripts/doc-check.mjs`」→「新引擎（`doc_check` 报告态）」；删已不在盘的 `scripts/mirror-divergence.mjs` 复现命令子句 | 无脚本名 |

**一档未落：`docs/vsc/design/VSC-DEBT.md`。** 门拒三处**既有**悬空——`test/edit-tool-improvement.test.mjs` ∥ `thincoder-vscode/test/edit-tool-improvement.test.mjs` ∥ `test/protocol-coverage.test.mjs`，全仓 `*.test.mjs` 按名扫零命中。复现 = 对该档跑一次写，回执逐字列这三行。

该档本批要改的五处因此未落：`DOC-DISCIPLINE.md` §3.7 ×2 → `D18`；`node scripts/doc-check.mjs --root .` ×2 → 文档门；`doc-check` 裸名；一条已废的行宽判据口径注（`isTableRow` 那条，行宽已不是判据）。

**路由（不在本席笔下）**：`docs/core/requirements/DOC-GRAPH.md` 两处写 `thincoder-core/doc-check/anchors.mjs`；现役 = `thincoder-core/doc-graph/anchors.mjs`（实读该档 `export { ANCHOR_RE, … }`）。需求档按 D1 归主 agent。

**读数**：内置 `grep`，域 `**/*.{mjs,json,md}` 扣 `docs/batches/**`，仓根，模式 = `scripts/doc-check\.mjs|doc-check-anchors|docCheckExts|DOC-DISCIPLINE\.md`? §3\.7|DOC-DISCIPLINE\.md`? §4\.2\.2`。

活面 **22 行 / 17 档**；本席笔域现余 5 行（全在 `VSC-DEBT.md`）。

**射程外的一大族**：`DOC-DISCIPLINE.md` §4.2.2 被 9 档引用（`BATCH-RECORD.md` · `DOC-SYSTEM.md` ×2 · `LEDGER-SELF-CONTAINED.md` ×3 · `LEDGER.md` ×3 · `MEMORY.md`）；§3.7 被 4 档引用（`ANCHOR-DEBT-REPAIR.md` ×2 · `PATH-RESOLUTION.md` · `docs/vsc/requirements/PROJECT.md`）；`docs/server/design/ops/OPS.md` 另有一处手跑命令。

⇒ **C2 的「零命中」按现射程跑不到零**：需父侧裁「并进本批另派」或「另开一批」，本席不擅自扩射程。

**修正轮 · 评审号 30 ∥ 31（父侧裁定 2026-11-12）**

**30 → 三处挡门悬空：删命令与它服务的验收条目，不改指。** 逐条：

| # | 删了什么（逐字） | 连带删的断言 |
|---|---|---|
| 1 | §3.1 测量协议的行内命令 `node --test --test-concurrency=1 --test-name-pattern="<例名>" test/edit-tool-improvement.test.mjs`——现写「用 `--test-name-pattern` 指名跑单个例」（方法留、失效落点去；余两句是方法，不动） | 无 |
| 2 | A2 整行：判定句「单跑 >500 ms 者已 `slow(` 归册」+ 机判命令 `grep -n "slow(" thincoder-vscode/test/edit-tool-improvement.test.mjs` | §10 三方一致表 D-1 行 `A1 / A2 / A3` ⇒ `A1 / A3` |
| 3 | A5 整行：判定句「复跑零未处置」+ 机判命令 `cd thincoder-vscode && node --test test/protocol-coverage.test.mjs` | §10 表 D-2 行 `A4 / A5 / A6` ⇒ `A4 / A6`；§3.2 判据③ 由 `npm run doc:check` 改文档门（与 31 同笔） |

A 列保留原编号、不重排：A2 ∥ A5 留空洞——编号是 §10 ∥ §12.9 的引用键，重排要连带改三张表，且 D8 不许留「已删」尸标。

**31 → 五处本批改动落地**（落点按原句认，不按行号）

| # | 落点 | 改前 → 改后（逐字） |
|---|---|---|
| a | KD-19 依据 | `DOC-DISCIPLINE.md` §3.7（文档行数规则废除……）→ `DOC-DISCIPLINE.md` D18（文档不标行数——给本档补拆分规划即违该条） |
| b | §12 末「文档档零行数义务」 | 判据单源 `DOC-DISCIPLINE.md` §3.7 → `DOC-DISCIPLINE.md` D18 |
| c | 三处手跑命令：§12.4 第 5 条 ∥ A14 ∥ V13-5 | `node scripts/doc-check.mjs --root .` → `doc_check(mode:"gate")`（交付门口径写进第 5 条括号：判据面 = 本轮写过的档、只判本批变更区） |
| d | `doc-check` 一族：§3.2 判据③ ∥ A9 ∥ §12.5 第 4 步门禁列 | `npm run doc:check` ∥ 裸 `doc-check` → `doc_check(mode:"gate")`；A14 条目名「`doc-check` 按档归属零新增」→「文档门按档归属零新增」 |
| e | §12.4 第 5 条下方的口径注 | 整行删（行宽已不是判据——`isTableRow` 豁免说的是已废的判据）；同族「零新增超宽行」两处（第 5 条 ∥ A14）同笔删，只留「零新增悬空」 |

**读数（同一把尺 = `doc_check`，整份判）**：改前 `doc_check(mode:"report", docs:["docs/vsc/design/VSC-DEBT.md"])` 首行 `DOC-CHECK GATE: REFUSED` + 6 行（三处用例路径 + `scripts/doc-check.mjs` ×3）；改后同尺同面首行 `DOC-CHECK GATE: PASS`，无附加行。首行之外一句不读即判：红侧那 6 行是改动前实跑的回执，不是推断。

**计数更正**：「手跑命令 ×2」实为 **3** 处（第 5 条 ∥ A14 ∥ V13-5）；按 3 落。原二来自上一轮只点了第 5 条与 A14，漏了 §13.6 的 V13-5。

**不动（父侧已裁）**：`docs/core/requirements/DOC-GRAPH.md` 两处归父侧；`DOC-DISCIPLINE.md` §4.2.2 被 9 档引 ∥ §3.7 被 4 档引 ∥ `docs/server/design/ops/OPS.md` 一处——另开一批，本批不追零。

**上抛项**

1. **[待裁] KD-11 的理由指着一个已无实现的机检**：`protocol-coverage-reverse` 与符号 `HOST_DISPATCH` 按名全仓扫（`**/*.{mjs,js,json,md}`）零实现命中，只余 `thincoder-vscode/src/extension/panel-messages.mjs` 一条注释提「reverse 机检的 `HOST_DISPATCH` 扫描域」。删这条理由 = 撤一条决策的依据，改指 = 改语义，两条都不属本修正轮授权。
2. **[待裁] 本档坐标形 = `file:line` 与「行段」列**（§3.2 表注「`file:line` 由提取器输出」∥ §12.2 ∥ §13.x）——与 D19「不拿行号指路」同族。全档换形是一次大改，不在本修正轮授权。

**收口前置门补件 · 32 ∥ 33（2026-11-12）**

门拒的是记录缺件，不是代码：本节只补记录，设计正文 ∥ 代码 ∥ 旧批档一字未动。

**32 → 机读清单加 6 行（三列齐，含读数）。**

- 前四档（实现笔归 `#2365`）：`thincoder-core/agent-tools/design-token.mjs` · `thincoder-core/agent-tools/subagent-design-token.mjs` · `thincoder-core/token-ttl.mjs` · `thincoder-core/session-slot-write.mjs`。
- 后两档（实施席的夹具路径同步）：`test/integration/edit-batch-entry-outcome.test.mjs` · `test/integration/tester-role.test.mjs`。
- 量法 = `countContentLines`；取数 = 批起快照 `a08c7c4` 的那份内容（`git show a08c7c4:<档>`）；六档逐档实跑，读数与父侧给的六个数逐个相同。
- 数只写在第三列（单源），此处不重抄；归属注紧贴表下——这六档的笔不在本批，本批只登记读数、不认领实现。

**33 → 越线档的第二列由 `—` 改成方案；第三列仍是 460。**

- 读数：收口时点 611 行（`countContentLines` 量盘上现文）∥ 批起快照 460 行——本批新增的 `CLI 7-26` 把这一档推过 500。
- 第三列不动的原因：那一格判的是批起快照，改成现值会被读数门按「与基线不符」拒。
- 方案逐字（= 机读清单该行第二列，同一句）：

```text
抽出 test/integration/batch-close-gate-narrowing.test.mjs：CLI 7-24 ∥ 7-25 ∥ 7-26（区外不出行两例 + 排除面前缀一例）与其夹具常量整体搬入，原档留其余用例与共享夹具 close-gate-fixture.mjs；断言语义与用例号零改；本批落步 = 实施轮
```

- 实施笔 = 下一轮 coder：收口门要的是「§2 带方案」，不是「已拆完」。搬完两侧各跑一遍原命令（原档与新档各一次 `node --test`），用例号与断言一词不改。

## §3 设计评审（评审子代理）
**状态行**：评审通过



### 轮次 1（评审子代理）

评审对象 = `docs/core/design/DOC-CHECK.md` §10（排除面）∥ §9 修订式清零 + `docs/core/requirements/DOC-CHECK.md` F9 ∥ AC-12

| # | 严重度 | 状态 | 证据（指针） |
|---|---|---|---|
| 1 | 🔴 | 待处理 | §10 整节无「集成测试设计（从 `test/RTM.md` 索引出发的 delta）」；其「判读人」末句「单测档随批、不进本档，也不进集成树」；同档 §6 ∥ §8 ∥ §9 各带一节 |
| 2 | 🟡 | 待处理 | §10 无「同类先例」行、无「库内 = 已查 ∥ 库外 = 已查」两行；§6 ∥ §8 ∥ §9 各有（先例就在 §10 边界条的 `index.excludePaths`） |
| 3 | 🟡 | 待处理 | §10 无新名三问块；该名已在盘：`manifest-schema.mjs`「`docCheckExcludePaths` = 排除目录（**今天无消费面**」 |
| 4 | 🟡 | 待处理 | §10 无落点表（对比 §6「七处落点与目标态」）；`declaration.mjs` 的 `buildDeclaration` 只投影 `excludePaths ∥ publicRepos ∥ writableRepos`；其头注指「本档 §2.6」，本档无这一节 |
| 5 | 🟡 | 待处理 | §10 首条验收「`report` 与 `gate` 两面都 `PASS`」对 `gate` 半不判别：§6「两样都没有（手工跑一次不带绑定的调用）⇒ 没有「本批」可指 ⇒ 没有要判的行 ⇒ 回执不出任何行」 |
| 6 | 🟡 | 待处理 | §10「读不到 manifest ⇒ 照判」无观测、无复现路径、三条验收也不覆盖它；§6 ∥ §8 ∥ §9 的失败分支各带「复现 ∥ 活场景」 |
| 7 | 🟡 | 待处理 | §9「一条谓词，住在装配档」只述批档面一支，§10「先认批档面，再认排除面」加第二道而无回指 |
| 8 | 🟡 | 待处理 | §10「验收（判据住在本节）」无回指行；对比 §8「验收（回指 `docs/core/requirements/DOC-CHECK.md` F8 ∥ AC-10 ∥ AC-11）」 |
| 9 | 🔵 | 待处理 | 需求 AC-12「与它首段同字、只多若干字母的那个同级目录下的档」为描述式，非具体例 |

已核清其一：§9 修订式表达已清零——无删除线标记 ∥ 无「先前 X ⇒ 改成 Y」∥ 无尸体标记。

已核清其二：§10 的声明名 ∥ 命中形 ∥ 读不到照判三条，与需求 F9 ∥ AC-12 逐句对得上，无机制面两写。

已核清其三：§9 档位结论句「改前盘上长度无一越过 500」带量法（`countContentLines`）；抽查 `thincoder-core/doc-check/index.mjs` ∥ `paragraph.mjs` ∥ `agent-tools/batch-gate.mjs` ∥ `batch-regions.mjs` ∥ `declaration.mjs` 均远在 500 下，结论站得住，档内无逐档读数。

VERDICT: changes-required
计数：🔴 1 · 🟡 7 · 🔵 1

### 轮次 2（评审子代理）

| # | Orig# | 严重度 | 状态 | 证据 |
|---|-------|--------|------|------|
| 1 | 1 | 🔴 | Fixed | §10「集成测试设计（从 `test/RTM.md` 索引出发的 delta）」：入口 = 父侧 depth-0 的真 `batch close`；「破的 = 无」「冗余的 = 无」「缺的 = 一行」（`7-26`），编号先落 `test/rtm/guard.md` 的 `CLI 7` 表 |
| 2 | 2 | 🟡 | Fixed | §10 三行俱在：「同类先例」（`index.excludePaths` 对齐 ∥ 偏离 ∥ 既有形不适用）∥「库内 = 已查」∥「库外 = 已查」 |
| 3 | 3 | 🟡 | Fixed | §10「这个键不是新起的（`existing:`）——三问的答案」：住哪 = `DEFAULT_MANIFEST.index` ∥ 叫什么 = 逐字沿用 ∥ 谁 = 属主 + 零消费方 |
| 4 | 4 | 🟡 | Fixed | §10「落点表」五行（schema 两处注释 ∥ declaration.mjs 头句 ∥ `doc_check.md` ∥ `manifest.md`）；「读键的那一侧 = 判域谓词自己读，不经 `buildDeclaration` 的投影」；`§2.6` 已点名「那是悬空节指针」 |
| 5 | 5 | 🟡 | Fixed | §10「`gate` 面也立」：先造「这份档在本批变更区内」；「条件不成立时 `gate` 恒零输出（§6「两样都没有」），红侧永远红不起来」 |
| 6 | 6 | 🟡 | Fixed | §10「出处（两条都在盘上）」∥「复现（两条，环境里真造得出来）」（没有 manifest ∥ 键写成非数组）∥ 验收「声明读不到（F9 末句）」 |
| 7 | 7 | 🟡 | Fixed | §9「这个函数上挂着两道滤：上面这道认批档面，第二道认排除面（§10）」 |
| 8 | 8 | 🟡 | Fixed | §10「验收（回指 `docs/core/requirements/DOC-CHECK.md` F9 ∥ AC-12）」，五条各标 AC 半 |
| 9 | 9 | 🔵 | Fixed | 需求 AC-12「声明 `docs/tmp` 时，同一层里名字只多一个连字符的那个目录（`tmp-x`）下的档 ⇒ 照报」 |
| 10 | (new) | 🔵 | New | §10 落点表「`docCheckExts` 那一行随 C3 删除」——`C3` 全档只此一处，无定义 |
| 11 | (new) | 🔵 | New | §9「十九态现役用例」∥「现役二十一行里已有四行」∥「`CLI 7` 表现二十二态」三处计数互不相等 |

VERDICT: pass

counts: 🔴 0（未决 0）· 🟡 0 · 🔵 2（New）

## §4 用户批准（主 agent）

**用户批准**：2026-11-12 18:51「自动跑完吧」——批级授权覆盖本批全链（评审点火 ∥ 修正轮 ∥ 实施 ∥ 收口）。

**评审链**：第 1 轮 `changes-required`（1🔴 7🟡 1🔵）→ 第 2 轮 `pass` → 实施轮（C1–C5）→ §5 被写门拒（四份档的存量悬空，父侧裁定清账法）→ 实施席清账后写 §5 → 设计席补文档面。

**越界披露**：实施席为让 `test/rtm/tooling.md` 与用例同笔，改了 `edit-batch-entry-outcome.test.mjs` ∥ `tester-role.test.mjs` 两个集成用例的**夹具路径**（断言对象一字未动），已在交付报告与 §5 明示。

## §5 实施记录（eng-coder）
**状态行**：实施完成 2026-11-12（四档整份零命中；两处越笔域测试同笔改并复跑绿）



**本 spawn 的笔域**：`README.md` · `thincoder-vscode/AGENTS.md` · `thincoder-cli/README.md` · `test/rtm/tooling.md`（父侧分派）。本段记这一轮落地了什么、读数是什么。

**做了什么（A 段 · 十四条命中逐条）**

| # | 落点 | 改前（命中） | 改后（现读什么） |
|---|---|---|---|
| 1 | `README.md` 入口行 | `thincoder-cli/docs/README.md` | 入口只留 `thincoder-cli/AGENTS.md`（CLI）与 `thincoder-vscode/AGENTS.md`（extension） |
| 2 | 同上 | `thincoder-vscode/docs/README.md` | 同上——该包已无 `docs/` 树 |
| 3 | `README.md` 台账节 | `docs/TODO-archive.md` 表行 | 台账节改述现役坐标：用户数据目录里按项目根键控的 SQLite，`ledger` 查询面读；`docs/TODO.md` 记为退役的 md 前身、留盘作历史 |
| 4 | `README.md` 第 43 段超 300 字 | 段落过长 | 拆成三段（文档层 /. 迁移政策 /. 产品树退役），`doc_check` 不再回该行 |
| 5 | `README.md` 第 50 段超 300 字 | 段落过长 | 拆成两段（说明一句 / 三个路径一行） |
| 6 | `thincoder-vscode/AGENTS.md` | `src/config.mjs` | 改成「（本端自持镜像已删——W16）」，与同档 Provider config 条同形；`thincoder-vscode/src/config.mjs` 确实不在盘，补包前缀仍会悬空，故取同档既有写法 |
| 7 | 同上 | `thincoder-issues/check-gitee-issues.mjs` | 裸名 `check-gitee-issues.mjs`（该档在工作区根，不属本仓） |
| 8 | 同上 | `test/smoke-provider.mjs` | 删掉那条 smoke 说明——`thincoder-vscode/test/` 与仓根 `scripts/` 都没有这个档 |
| 9 | 同上 | `test/integration/files.mjs` | 集成面改指仓根：`test/integration/`（索引 `test/RTM.md`、入口 `node test/run.mjs`），并写明本包不持集成清单——依据该包 `test/run.mjs` 档头「集成测试集已归仓根 `test/integration/`」 |
| 10 | `thincoder-cli/README.md` | `skill-name/SKILL.md` | 改成「每个技能一个目录，目录里放 `SKILL.md`」——目录格式的说明保留，只把路径形换成裸名 |
| 11 | 同上 | `docs/core/requirements/METHODOLOGY.md` | 裸名 `METHODOLOGY.md` · `PHILOSOPHY.md`（该行是历史版本说明，不需可点） |
| 12 | `test/rtm/tooling.md` 行 `30-1` | `test/failing.test.mjs` ∥ `test/passing.test.mjs` | 裸名 `failing.test.mjs` ∥ `passing.test.mjs`，并补一句「两份夹具档造在临时项目根下」 |
| 13 | `test/rtm/tooling.md` 行 `41-1` | 回执里的 `docs/design/notes.txt` | 裸名 `notes.txt`；`1 file(s) written: …` 的回执形态与断言一字未动 |

**同句收正（第 8 / 9 条那一块）**：`thincoder-vscode/AGENTS.md` 的 Testing 块原有三处「清单现为空（`export default []`）」∥「both manifests are empty」∥「集成清单现为空」，与盘不符——`test/files.mjs` 现登记 11 档（本轮实读）。同一块改成：单元清单的登记规则加 `test/run.mjs` 两道反查门；集成面指仓根。不删整块，只把不成立的三句换掉。

**越出笔域的两档（明示）**：`test/integration/edit-batch-entry-outcome.test.mjs` ∥ `test/integration/tester-role.test.mjs`。

理由：这两个用例逐字引用了要改的夹具路径——前者断言末行 `… 1 file(s) written: docs/design/notes.txt`，后者断言报告含 `node --test test/failing.test.mjs`。只改 RTM 会让验收矩阵与用例对不上，那才是写假话。故两侧同笔改：夹具档挪到临时项目根、命令随之变短，断言对象（末行逐字 ∥ 报告含命令原文 ∥ `fail 1` ∥ `pass 1`）一字未动。

**读数（同一把尺：`doc_check`，四档整份判）**

- 改前：首行 `DOC-CHECK GATE: REFUSED`，下接 14 行（12 行悬空指针 + 2 行段落超 300）。
- 改后（同尺同面）：首行 `DOC-CHECK GATE: PASS`，无附加行。
- 交付门：`doc_check(mode:"gate")` 点名四档 → `PASS`；缺省范围（本轮写过的 .md）→ `PASS`。

**测试**

| 命令（cwd = 仓根） | 结果 |
|---|---|
| `node --test test/integration/edit-batch-entry-outcome.test.mjs` | pass 1 · fail 0 |
| `node --test test/integration/tester-role.test.mjs` | pass 2 · fail 0（CLI 30-1 ∥ CLI 30-2） |

红侧：夹具档若仍留在临时项目的 `test/` 下而命令已改短，`node --test failing.test.mjs` 在项目根找不到档 ⇒ 30-1 的 `pass 1` / `exit code 0` 断不出来；41-1 则因末行字串不等而红。两例都是改完才绿的，不是本来就会绿。

**未落（已路由，不在本席笔下）**

| 项 | 归谁 |
|---|---|
| `PROJECT-MANIFEST.json` 删 `docCheckExts` 键 | 父侧（已接走） |
| 设计 / 需求档面的过时行（`docs/core/design/**` · `docs/core/requirements/**`） | 设计席 |
| C1 删三份孤儿脚本 ∥ `doc-impact.mjs` ∥ `doc:check`；C3 schema 面；C4 接线 | §2 名单里的其它 spawn |

**Lead（只报不改）**：`thincoder-vscode/test/run.mjs` 档头仍写「非 .test.mjs 命名的 smoke 档（smoke-provider.mjs / smoke-settings.mjs）必须保持可跑」——这两个档已不在盘，与本轮删掉的那条 smoke 说明同因。该档是代码注释、不在本席四档内。

**落地核对：无**——本轮没有让某句设计档变假；两个夹具路径只出现在旧批档里，不在本批射程。

## §6 验证与收口（父代理）

**验证（父侧，本会话实跑）**

| 检查 | 命令 | 读数 |
|---|---|---|
| 本批单测档 + 改动面集成（收口前） | `node --test docs/batches/2026-11-12-stale-refs-sweep.test.mjs test/integration/batch-close-gate.test.mjs` | `tests 23 · pass 23 · fail 0` |
| 交付门 | `doc_check(mode:"gate")`，五份在改档 | `DOC-CHECK GATE: PASS` |
| 实施席红侧 | 排除面接线前后同一夹具 | 接线前 `REFUSED` 4 命中 / checkFiles 1；接线后 `PASS` 0 / 0 |

**单测档已删（delete-on-use）**：`docs/batches/2026-11-12-stale-refs-sweep.test.mjs` 收口前删除。

**集成集**：新增常驻用例 `CLI 7-26`（排除面三半 + 写时点），`7-26` 先落 `test/rtm/guard.md` 的 `CLI 7` 表再写标题；`CLI 7` 表现二十二态。

**交付残面（记清，不粉饰）**：C2 的「零命中」按本批射程**没跑到零**——活面还剩 22 行 / 17 档的跨档引用族，已登记 `#2368`（归批）。本批的靶是「失效代码 + 直接指向它的文档行」，跨档引用面的重指是另一件事，刻意不并。

**落地核对**：`docs/core/design/MANIFEST.md` 的键集与计数已由设计席收正（`docCheckExts` 删、白名单 17→16）；`PROJECT-MANIFEST.json` 的 `"docCheckExts"` 由父侧删除，改后全仓 `.mjs` 该名零命中、`doc_check` 仍 `PASS`。

**台账**：`#2364` 由本笔 `close` 同笔结算。**本批新债 1 条 + `#2368`。**
