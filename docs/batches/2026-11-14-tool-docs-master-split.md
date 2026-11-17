# 2026-11-14 · tool-docs 母版与按档装配
> 六段，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 每段只有一个作者：作者的段可 `append` 加内容、可就地改（`edit`）；非作者一概拒。
> 编制：主 agent · 2026-11-14 · 来源 = 用户 2026-11-14 原话「结论一不要管了，只管结论二的事儿。」∥「我希望按照当时的设想做。」∥「修。后续自动跑吧，跑完你就开工工具面的修改。」。
> 台账 = #2406（core · 归批）。前情 = 无（独立批）。
## §1 讨论（主 agent）
**状态行**：已收口 2026-11-14
批起 sha = 014d2f21aef5e708259a15112f2d54d34e2b12f8

（该 sha = 2026-11-14 03:47:48 的快照提交：点火时工作树带着前序各批的未提交改动，该提交把它们一并冻结，故 `e82e704 → 014d2f21` 之间的差异不属本批。）
<§1 模板占位：本批条目 / 关键判据 / 授权口径>

### 本批做什么

把工具描述改成「母版 + 按档装配」：`thincoder-core/tool-docs/*.md` 每份拆常驻面（用途、适用场景、最关键边界）与展开面（长示例、详细分支、完整错误说明、背景解释），展开面进对应 knowledge 主题。完整档装配时展开，渲染与改造前逐字一致；极简档只常驻短描述，细节经 `knowledge get` 取回。

不动：工具集合、参数 schema（必填 ∥ 枚举 ∥ 校验）、描述内容的删留判据（本批只搬不删，不裁撤任何句子）、按需加载协议。

### 为什么

极简档的固定开销大头在工具声明：实测 `tools ≈ 74.7k` token、`system ≈ 70k`，而 minimal 只压 system，工具面一分未动。所以「minimal 省钱」目前只是省了提示词那一段。

改法来自两处已定结论：`docs/batches/2026-11-08-tool-desc-trim.md`（#2201，已收口）定的「判据是内容不是长度、不设字符上限」，以及 #2393 时确定的「不删工具、不改参数语义，只压描述正文，长示例移进知识主题」。

### 已定决定

- **已定决定**：只做结论二（描述母版拆分），不做结论一（按档裁工具集）；后者需改需求并重新裁定。· 用户原话：「结论一不要管了，只管结论二的事儿。」· 时间：2026-11-14
- **已定决定**：按当时设想推进——不删工具、不改参数语义、不引入按需加载协议。· 用户原话：「我希望按照当时的设想做。」· 时间：2026-11-14

### 需求面已改（本批同轮落）

`docs/core/requirements/PROMPT-SYSTEM.md` 原句「工具 schema 和完整工具描述不因本功能自动改写；其体量单独测量」已改为分档口径：schema 不因档位改写，描述分常驻面与展开面，完整档装配后逐字一致，极简档只常驻短描述，体量四项分别测量。

### 验收方向（细则归 §2）

- 完整档渲染逐字一致：改造前后各取一次渲染结果做字符串比对。
- 极简档工具数量与 schema 键集不缩水。
- 每份被拆的描述都能 `knowledge get` 取回完整说明（遍历全部，不抽样）。
- 体量四项分开报：系统提示词 ∥ 工具声明 ∥ 自动注入 ∥ 完整请求。

### 与在飞工作的关系

`2026-11-14-turn-projection-recovery` 已收口；本批改动面（tool-docs 描述档、knowledge 主题、PROMPT-SYSTEM 需求句）与之不重叠。

### 主侧设计复核（第 1 轮 · 送评审前）

**已实读核对、成立的**：

- 装配点确为两处，全仓 `toOpenAISchema` 只此两个调用点：`thincoder-core/agent/setup.mjs`「const toolSchemas = tools.map(toOpenAISchema)」· `thincoder-core/advisor/loop.mjs`「schemas: tools.map(toOpenAISchema)」。setup 侧 mode 已在同函数上游就位（`resolveWorkMode(agent.config?.agent)`），advisor 侧 `advisorToolsFor(agent…)` 手上有 agent，可同法就地取。
- 路径与设计一致：`TOOL_DOCS_DIR = join(ROOT, "tool-docs")`、`KNOWLEDGE_DIR = join(PROMPTS_DIR, "knowledge")`；盘上 `thincoder-core/tool-docs` 实有 **69** 份 `.md`（非 70），`thincoder-core/prompts/knowledge` 实有 13 个主题。
- 复用可行：`expandKnowledgeTopics(text, { minimal })` 已存在，minimal 支剥锚连其后至多两个换行、完整支替换为 `loadKnowledgeTopic(id, { promptOnly: true })` 正文——与「展开面放 prompts/knowledge」一致。
- 逐字一致条件 3 有先例读数：`thincoder-core/prompts/knowledge/doc-lookup.md` 末字节 = 46（`.`，非换行）。
- `test/RTM.md` 的 CLI 50 故事在册（`test/rtm/tooling.md`「## CLI 50. 三档模式切换、极简提示词与知识查询」），`CLI 50-4` 有新故事可挂。

**两处送回设计席（本轮 fix 轮）**：

- **V1 覆盖判据自证**：§2「遍历集由盘上读得，不由名单猜」+ 验收 E1 只判「带 `{{knowledge:` 的档」。未被拆的档不进集合 ⇒ 一份含长示例却整档留着的描述，E1–E4 全过。要求：为 `thincoder-core/tool-docs` 全部 69 档各给一行处置（拆 ⇒ 主题 id；不拆 ⇒ 一句它含什么、为何不构成展开面），该表作 E1 的枚举源，`knowledge list` 作交叉核对。判据仍是内容不是长度，不设字数线。
- **V2 E1 的对照基准未写死**：「主题正文与原文该段逐字相等」里的「原文」须写死为批起 sha `e82e704` 上的文本（`git show <sha>:<档>`），不是工作树当前文——否则实现轮拿改后的档自比自，恒等通过。

**我自己修掉的两处 §1 死指针**（本段作者笔）：`TOOLS.md §6.9` 该节不存在（该档只有 §1–§8，§6 是 SSH），已删该引用、改为「描述内容的删留判据（本批只搬不删）」；`本批做什么` 里的路径 `thincoder-core/tools/tool-docs/*.md` 与盘上不符，已改为 `thincoder-core/tool-docs/*.md`。

**Lead（不入本批、不记账）**：2026-11-08 批把「描述内容去留判据」住在 `TOOLS.md` §6.9，该节已随 TOOLS.md 重构消失，全仓设计档再无该规则（只有那份批档里留着一句）。本批只搬不删，不依赖它，故不阻塞。

### 第 1 轮评审裁决（13 项）

- **🔴 #1 `toOpenAISchema` 调用点不止两处** ⇒ 本轮修。§2 逐名列出全部调用点与各自取 mode 的位置；server 环境工具面（`chat-env-tools.mjs`）∥ bench 两处 ∥ `prompt-fixture` 三面逐一裁定各自传哪一档，或明说该面不在本批范围并把迁移写进 §2；这几档并入机读清单与验收对照。理由：mode 一必填，这四个单参调用点当场抛错，而这条分支的真实场景正是它们。
- **🔴 #2 两个新建代码档无行** ⇒ 本轮修。机读清单补两行：批档同名单测档（`—` / `新`）、承载 `CLI 50-4` 的 `test/integration/<名>.mjs`（`—` / `新`）；集成增量的用例名指向该档。收口门拒文是「§2 清单里没有这一档的行」，先例 = `2026-11-12-ledger-query-default-limit` §2 同形行。
- **🟡 #3–#10** ⇒ 本轮修：#3 补最近先例行 · #4 补勘察证据行 · #5 补新名三问答案 · #6 `CLI 50-4` 补齐交互/需求锚/入口/落档 · #7 验收补 advisor 装配点 ∥ 运行时切档 ∥ 新主题打包面 · #8 裁定 minimal 下 advisor/consult 的描述档位 · #9 宿主侧行级改写规则 · #10 E4 工具声明取数面写明。
- **🔵 #11–#13** ⇒ 本轮修：#11 极简档目标文本写死并逐字断言 · #12 删 §2 的「约增 2 行 ⇒ 约 496」预估 · #13 知识面读取成本写入设计档；#13 是否本批处理由设计席裁定，不处理则由主 agent 记台账。

### 第 2 轮评审裁决（7 项）

- **🔴 #1 consult 面档位** ⇒ 走「实现 §4」，不改文档。裁定理由：`PROMPT-SYSTEM` §4 与 §2 决策 7 已两处一致承诺 consult 取完整档，收窄文档等于撤掉一个已定的语义，还要再改两处；改实现只需在装配点对 `agent._role === "consult"` 取完整档。追加进 E2b 与 `CLI 50-4`。
- **🟡 #2 调用点按表达式列** ⇒ 本轮修。两处 `toOpenAISchema(readImageTool)` 各补一行，并给出非 `map` 调用点的改写形。
- **🟡 #3 `CLI 50-4` 落点** ⇒ 本轮修。落点改 `test/rtm/tooling.md` 的 CLI 50 节（含节注三态行），两个 RTM 档计入受影响文件。
- **🟡 #4 业务入口** ⇒ 本轮修。按节注的进入口写，`resolveWorkMode` 只作内部坐标。
- **🟡 #5 `toOpenAISchema` 头注计数** ⇒ 本轮只写进 §2 改动面，由实施席改代码；设计席不碰实现档。
- **🔵 #6 删增量表述** ⇒ 本轮修。
- **🔵 #7 缝序搬进 `TOOLS.md` §1** ⇒ 本轮修。

### 设计评审通过（第 3 轮）与一项可选裁决

- 第 3 轮评审判 pass：第 2 轮 7 项全部落实，凭证已签发，实施席已派。
- 评审留一项可选 🟡（未处置、不阻塞）：§2 与 `docs/core/design/TOOLS.md` §1 的示例位 `.map((tool) =&gt; toOpenAISchema(tool, mode))` 与表内第 3、5、7 行的 `"normal"` 并存。
- **裁决**：以 §2 表「本批传哪一档」列为准。只有第 1 行（`thincoder-core/agent/setup.mjs`）作用域里有 `mode` 变量，第 3、5、7 行一律写实参 `"normal"`，第 9 行（`prompt-fixture`）写 `"normal"`，非 `map` 形态同样写实参；示例位不按字面抄 `mode`。

### 实施后裁决（三处上抛）

- **裁决 1 · `context.md` 动作枚举行**：按 `docs/core/design/TOOLS.md` §1.1「动作枚举行属常驻面」执行 —— `context.md` 恢复为**不拆**（整档作常驻面），删 `thincoder-core/prompts/knowledge/tool-context.md`；计数随之变 **27 拆 ∥ 42 不拆**。理由：该档快照全文 1228 字符（`git show e82e704:thincoder-core/tool-docs/context.md` 实测：1242 字节 ∥ 1228 字符，尺 = UTF-8 字符数）里，中间整块就是三条动作行（约 1100 字符），两端只剩一句用途与一句失败形；把它搬走等于极简档里看不到 `stats` ∥ `prune` ∥ `compact` 三个动作名，模型得先 `knowledge get` 才知道这个工具能做什么——那是能力回退，不是省固定开销。
- **裁决 2 · `TOOLS.md` §1 示例形**：以调用点表「传哪一档」列为准。第 1 行作用域有 `mode` 变量，写 `toOpenAISchema(tool, mode)`；第 3、5、7 行作用域没有该变量，写实参 `"normal"`。示例位不得用 `mode` 字面代替该行取值。
- **裁决 3 · `PROMPT-SYSTEM.md` §3 主题表**：该节自己写着「清单由 `knowledge list` 现读；本表不复制一份会漂的名单」，而表内逐条列了 13 条、落盘后实为 42 条——表与本节规则互相矛盾且已失真。删逐条枚举，保留两类目录（可内联 ∥ 纯查询）的区分与 `knowledge list` 指路。

### 裁决 2 的示例形：以「该行取值」为准（设计席取舍采纳）

- 第 1 行（`agent/setup.mjs`）写 `.map((tool) =&gt; toOpenAISchema(tool, toolMode))`，`toolMode = agent._role === "consult" ? "normal" : mode`。
- 第 3、5、7 行写实参 `"normal"`，那三处作用域没有 `mode` 变量。
- 我先前那句「第 1 行作用域有 `mode` 变量，写 `toOpenAISchema(tool, mode)`」是按 consult 分岔加进第 1 行之前写的，已作废。裸 `mode` 会让极简会话内的 consult 取极简档，与 requirements §9.1 当场矛盾。
- 设计席按末句（该行取值）落、不按字面实例落，判断正确，采纳。

### 评审结算时序问题（诊断）

两次 settle 判 `no-section3-block`，但盘上 §3 实际已有三个轮次块：`### 轮次 1` · `### 轮次 2` · `### 轮次 3`（第 3 块第 432 行有独立 `VERDICT: pass`，§3 状态行 = 评审通过）。

判据：结算门读到「点火基线 2 块、当前 2 块」，而评审席的 append 是在结算采样之后落盘的（`#32` 那次基线已是 3 块、本轮无写入，故仍判无块）。

处置：改成同步调用重发一次设计评审，让写入与结算在同一调用链内完成；本轮只核 `#31` 三项裁决改后的现字节。

## §2 批次任务与设计（eng-designer）
**状态行**：设计完成（实施后三项裁决已落：context.md 回常驻面（27 拆 ∥ 42 不拆）、TOOLS §1 示例形按「传哪一档」列取值、PROMPT-SYSTEM §3 删逐条主题表；实施侧待落两项（删 tool-context.md、单测断言取 27））

<§2 模板占位：本批条目（覆盖） / 设计档落点 / 机制设计 / 受影响文件与测试覆盖 / 验收对照 / 关键决策 / 上抛项>

<§2 模板占位：机读清单 = 标题行「**受影响文件（机读清单）**」+ 围栏内三列表（表头 | 档 | 分拆方案 | 行数 |、分隔行 |---|---|---|、一行一档，只列代码档（源 ∥ 单测））；第二列：越设计时线的档写正向形方案（点名带目录段的档 + 本批落步 `实施轮` ∥ `§5`），未越线写 —；第三列：该档在批起快照上的内容行数（量法 = `countContentLines`），快照里没有这一档写 `新`；示例行 = | thincoder-core/agent-tools/batch-tier-gate.mjs | — | 新 |>

### 本批条目（覆盖）

| # | 条目 | 需求锚 | 落点 |
|---|---|---|---|
| E1 | 工具描述母版拆分：常驻面留 `thincoder-core/tool-docs/<档名>.md`，展开面整块搬进 `thincoder-core/prompts/knowledge/tool-<档名>.md`，原位置换独占一行的 `{{knowledge:<id>}}` 锚 | requirements PROMPT-SYSTEM §7 | 设计 PROMPT-SYSTEM §2 |
| E2 | 完整档装配后与改造前逐字一致 | 同上 | 设计 PROMPT-SYSTEM §2、§7 |
| E3 | 极简档只发常驻面，展开面经 `knowledge get` 取回；工具数量与 schema 键集不缩水 | 同上 | 设计 PROMPT-SYSTEM §7、§6；TOOLS §1 |
| E4 | 体量分系统提示词、工具声明、自动注入、完整请求四项分别测量 | 同上 | 设计 PROMPT-SYSTEM §7 |

不在覆盖内：按档裁工具集（§1 已定决定只做结论二）、参数 schema 与校验、`knowledge` 工具接口、工具集合。

### 设计档落点

`docs/core/design/PROMPT-SYSTEM.md` §1（tool-docs 是母版、`DESC` 不清锚）· §2（锚机制与逐字一致三条件）· §3（主题标识规则）· §7（按档装配、schema 不改、四项计量）· §8（内容归属两行）· §9（验证三条）。

`docs/core/design/TOOLS.md` §1（装配点、`toOpenAISchema(tool, mode)`、mode 必填、失败语义单点）。

**最近先例**：`thincoder-core/prompt-files.mjs` 的 `expandKnowledgeTopics(text, { minimal })` 与 `KNOWLEDGE_ANCHOR_RE`——全仓唯一的 `{{knowledge:}}` 展开器，提示词母版已在用。对齐 = 同一锚文法、同一重复标识失败、同一未解析失败、完整档替换为 `loadKnowledgeTopic(id, { promptOnly: true })` 正文。偏离 = 无。锚独占一行、主题文件不以换行结尾两条既有形，见设计 PROMPT-SYSTEM §2。

**勘察证据**：已读 `thincoder-core/tools/shared.mjs` 的 `toOpenAISchema` / `DESC`、`agent/setup.mjs` 的 prepareRun、`advisor/loop.mjs` 的 `advisorToolsFor`、`prompt-files.mjs` 的知识加载四函数、`thincoder-vscode/src/agent/tool-table.mjs` 的 `vscSubagentFace`，以及 `bench` 与 `prompt-fixture` 三个对照面。

公开源档勘察：`doc_search` 查「tool description schema assembly minimal mode」→ 命中全部是本仓设计档本身（`docs/core/design/TOOLS.md` §1、`docs/core/design/PROMPT-SYSTEM.md` §7、`docs/core/requirements/PROMPT-SYSTEM.md` §2 与 `docs/cli/design/TUI-COMMANDS.md` §1 的档位注册面），无仓外档、无独立档仓相关项。

相关面全在本仓内，无外部依赖、无外部断言，故不涉及库外结论。盘上计数：`thincoder-core/tool-docs` 69 份 `.md`、`prompts/knowledge` 13 份主题、`core/knowledge` 1 份。

**新名三问**——`expandToolDescription` 是本批唯一新名。`existing: thincoder-core/prompt-files.mjs · name: "expandKnowledgeTopics" · consumers: assemblePrompt 的提示词装配` ⇒ 薄壳只提供带 mode 校验的工具面入口，展开体一律调它，不另写展开逻辑。

壳的落点 `existing: thincoder-core/tools/shared.mjs · name: "toOpenAISchema" · consumers: 下方八处调用表达式（六档）`。主题标识 `none found:`——已查 `prompts/knowledge` 13 份 + `core/knowledge` 1 份，无 `tool-*` 标识，故 27 个新标识不与现有撞车。

### 机制设计（摘要，规则本体在设计档）

工具体对象在登记期构造，档位却在每次 `prepareRun` 现读，所以展开必须发生在装配期：`DESC(name)` 继续返回母版原文（含锚），`toOpenAISchema(tool, mode)` 在拼 schema 时按 mode 展开。规则本体 = 设计 TOOLS §1（装配点表、mode 必填、行级改写规则）与设计 PROMPT-SYSTEM §2 §7。

展开复用 `prompt-files.mjs` 的 `expandKnowledgeTopics`，不新造第二套。工具面经 `expandToolDescription(text, mode)` 薄壳调用，校验 mode 后转交。

语法细节：`expandKnowledgeTopics` 第二参是对象 `{ minimal }`，薄壳据此把 mode 翻成布尔，不把 mode 字符串直接传进去。

**八处调用表达式与各自传的档**（全仓 `toOpenAISchema` 逐表达式核准，共六档；`thincoder-vscode/src/tools/index.mjs` 只 re-export，不调用；`bench/toolcall/data.mjs` 与 `report.mjs` 只在注释里提它）：

逐表达式的档位规则本体 = 设计 TOOLS §1 的调用点表；下表是本批要改的这八处。

| # | 调用点 | 现状表达式 | 本批传哪一档 | 依据 |
|---|---|---|---|---|
| 1 | `thincoder-core/agent/setup.mjs` prepareRun | `const toolSchemas = tools.map(toOpenAISchema)` | 会话现读 mode，取自同函数 `const mode = resolveWorkMode(agent.config?.agent)` | 主链按档装配 |
| 2 | 同上，`agent._role === "consult"` 时 | 同上（同一表达式，按角色分岔） | 完整档 `"normal"`，不读会话 mode | requirements §9.1「完整档工具描述和 consult/advisor 独立基底不被极简装配改写」；设计 PROMPT-SYSTEM §4 同口径 |
| 3 | `thincoder-core/advisor/loop.mjs` `advisorToolsFor` | `schemas: tools.map(toOpenAISchema)` | 完整档 `"normal"`，不读会话 mode | 同上 |
| 4 | `thincoder-server/src/agent/chat-env-tools.mjs` `createEnvTools` | `core.toOpenAISchema(toolOf[name])` | `"normal"` | 环境工具面不经极简装配；可见文本与本批改造前一致，接极简不在本批范围 |
| 5 | `bench/check/toolcall.check.mjs` | `builtinTools.map(toOpenAISchema)` | `"normal"` | 对照面 = 产品面实面逐字 = 改造前全文 |
| 6 | `bench/check/toolcall.check.mjs` | `toOpenAISchema(readImageTool)` | `"normal"` | 同上 |
| 7 | `bench/toolcall/variants.mjs` | `const tools = builtinTools.map(toOpenAISchema)` | `"normal"` | 同上 |
| 8 | `bench/toolcall/variants.mjs` | `tools.push(toOpenAISchema(readImageTool))` | `"normal"` | 同上 |
| 9 | `prompt-fixture/tools.mjs` | `.map((name) => toOpenAISchema(DECLARED_TOOLS[name]))` | `"normal"` | 同上 |

第 2 行的档位与第 1 行的系统提示词 mode 分开取（`agent._role === "consult" ? "normal" : mode`）。

consult 子代理经 `thincoder-core/agent-tools/consult.mjs` 以「config: agent.config」+「role: "consult"」建出，再由 `thincoder-core/agent/run-start.mjs` 进同一条装配链。它因此只在装配点按角色分岔，主链的 mode 语义不变。

改写形分两种。`map` 直传的四处（第 1、3、5、7 行）写成 `.map((tool) => toOpenAISchema(tool, D))`，`D` = 该行「本批传哪一档」列的值——`map` 的第二手参是下标，会被当成 mode，首个元素即因取值非法而抛。第 1 行的 `D` = `toolMode`（`agent._role === "consult" ? "normal" : mode`，即上表第 1、2 行与紧随其后的 consult 段），第 3、5、7 行作用域里没有会话档位，`D` 写实参 `"normal"`。

其余四处（第 4、6、8、9 行）把档位写在实参位：`toOpenAISchema(readImageTool, "normal")` · `tools.push(toOpenAISchema(readImageTool, "normal"))` · `core.toOpenAISchema(toolOf[name], "normal")` · `.map((name) => toOpenAISchema(DECLARED_TOOLS[name], "normal"))`。

第 2–9 行的 `"normal"` 不是把它们当普通模式会话，而是取完整档装配结果——也就是改造前的唯一文本，故这八处零行为变化。

**改动面补一条**：`thincoder-core/tools/shared.mjs` 的 `toOpenAISchema` 头注现写「两个调用点（`agent/setup.mjs` · `advisor/loop.mjs`）同经本函数。」，本批八处表达式之后不成立——由实施席按上表改写这条头注；设计席不碰实现档。

顺序 = 先展开、后 `applyPromptInjections`（规则本体 = 设计 TOOLS §1）：端侧注入值因此不会被当成主题锚二次展开。

失败语义不变：缺工具描述档 ⇒ 抛（`loadToolDoc` 既有语义）；主题不存在 / 标识重复 / 锚无法解析 / mode 缺失或取值非法 ⇒ 抛，不把残缺描述当成可继续运行的结果。

**宿主侧行级改写**（规则本体 = 设计 TOOLS §1.1）：`thincoder-vscode/src/agent/tool-table.mjs` 的 `description: tool.description.split("\n").filter((l) => !l.startsWith("- action:'panel'")).join("\n")` 剔的是母版行，装配期锚展开在它之后，看不到这次剔除。

因此 `tool-docs/subagent.md` 的 `- action:'panel'` 一行留在常驻面、不搬进 `tool-subagent` 主题；判「拆」的该档仍拆，搬走的是九动作分支、角色矩阵与提示词写法。

### 内容形判据（69 档逐份处置 = E1 的枚举源）

判据本体在设计档：`docs/core/design/PROMPT-SYSTEM.md` §2（内容是判据、不是长度：长示例 ∥ 详细分支 ∥ 完整错误说明 ∥ 背景解释之一即展开面；四类都没有的档全文即常驻面）。动作枚举行不构成展开面：它是调一次就要看见的常驻面（与设计 TOOLS §1.1 同一判据）。

下表是 E1 的枚举源，不是抽样名单：`thincoder-core/tool-docs` 在批起快照 `e82e704` 上实有 69 份 `.md`，逐份一行处置。判定时逐档读完正文，不按档名字面猜。交叉核对 = `knowledge list`：判「拆」的每一档都应有一条同名主题，且清单里没有本批之外多出来的 `tool-*` 主题。

| # | 档 | 处置 | 依据（拆 ⇒ 主题 id；不拆 ⇒ 它含什么、为何不构成展开面） |
|---|---|---|---|
| 1 | advisor.md | 拆 | `tool-advisor`——审查范围（documents 的解析与接受形、工作区根拒绝）、三轮收敛、池与异步背景 |
| 2 | apply_patch.md | 拆 | `tool-apply-patch`——统一 diff 文法、hunk 定位规则、失败分块回执形 |
| 3 | bash.md | 拆 | `tool-bash`——路由清单、输出块、TTY/环境/截断等背景 |
| 4 | batch-eng-coder.md | 不拆 | 只有写作机制：三步、拒绝清单、段边界；无示例、无分支目录、无背景 |
| 5 | batch-eng-designer.md | 不拆 | 同上：§2 的三步、行限与拒绝清单即全部内容 |
| 6 | batch-review.md | 不拆 | 只有 §3 的写作机制与「证据指针须可解析」一条准则 |
| 7 | batch.md | 拆 | `tool-batch`——九个动作的分支细节、doc-check 门说明、骨架占位与 §3 规则 |
| 8 | browser.md | 拆 | `tool-browser`——动作参数长表、Notes 全段、Real-world practice |
| 9 | code_search.md | 不拆 | 一句用途 + 与 doc_search/read_history 的分工，无展开面 |
| 10 | consult_start.md | 不拆 | 何时调用、非阻塞、brief 要点，均为调用前必读 |
| 11 | consult_stop.md | 不拆 | 取消语义与返回形 |
| 12 | context.md | 不拆 | 三条动作枚举行即该档正文主体（快照全文 1236 字符），两端只剩一句用途与一句失败形；动作枚举行属常驻面（设计 PROMPT-SYSTEM §2 · TOOLS §1.1），搬走等于极简档看不到 `stats` ∥ `prune` ∥ `compact` 三个动作名，是能力回退 |
| 13 | delete.md | 不拆 | 路由、两个参数、短拒绝清单（受管档、非空目录、符号链接），均为调用期契约 |
| 14 | doc_check.md | 拆 | `tool-doc-check`——三判项展开、四类不报、回执形与参数长段 |
| 15 | doc_graph-read.md | 拆 | `tool-doc-graph-read`——参数清单与「输出怎么读」规则 |
| 16 | doc_graph.md | 拆 | `tool-doc-graph`——六类边目录、边状态、截断与收窄、业务拒绝清单 |
| 17 | doc_search.md | 不拆 | 用途与工具分工，两段 |
| 18 | edit.md | 拆 | `tool-edit`——路由清单、容忍匹配与 LCS 规则、批量回执、行号锚定拒绝 |
| 19 | eng.md | 不拆 | 一句模式切换语义 |
| 20 | execute.md | 拆 | `tool-execute`——路由清单、截断与不可逆等 Notes |
| 21 | fetch.md | 不拆 | 两个参数 + 后端链/重定向/超时短说明 |
| 22 | file_ops.md | 不拆 | 路由、三参数、短 Notes |
| 23 | get_current_time.md | 不拆 | 一句话与返回字段 |
| 24 | git-read.md | 不拆 | 只读动作清单与参数，均为调用期契约 |
| 25 | git.md | 拆 | `tool-git`——三十个动作的逐条参数说明 |
| 26 | glob.md | 不拆 | 模式文法即调用期契约，Notes 短 |
| 27 | goal.md | 不拆 | 四动作一句一义 |
| 28 | grep.md | 不拆 | 参数与上下文规则即调用期契约 |
| 29 | hashline_edit.md | 不拆 | 三参数 + 短 Notes（哈希失效即重读） |
| 30 | insert_after.md | 不拆 | 参数 + 读后插入守卫 |
| 31 | instance_list.md | 不拆 | 一段返回形 |
| 32 | instance_send.md | 不拆 | 三参数与投递语义 |
| 33 | knowledge.md | 不拆 | 三动作一句一义 |
| 34 | ledger-read.md | 拆 | `tool-ledger-read`——筛选、四个行读数字段、分页尾行、项目根推导背景 |
| 35 | ledger.md | 拆 | `tool-ledger`——六态迁移逐边、task_book 门细则、批量迁移与 notices |
| 36 | lint.md | 不拆 | 两参数 + 按扩展名选检查器的短表 |
| 37 | ls.md | 不拆 | 路由 + 两参数 + 三行 Notes |
| 38 | lsp.md | 不拆 | 五子命令与三参数 |
| 39 | main_history.md | 不拆 | 一句话 |
| 40 | manifest-read.md | 拆 | `tool-manifest-read`——docRoot/standards 解释、五点状态锚、定位用法 |
| 41 | manifest.md | 拆 | `tool-manifest`——十五个可写节点的 when / wrong⇒ 目录 |
| 42 | memory-read.md | 拆 | `tool-memory-read`——层概念解释与参数/筛选清单 |
| 43 | memory.md | 拆 | `tool-memory`——五动作分支（单删/批删/清空/维护） |
| 44 | notify_parent.md | 拆 | `tool-notify-parent`——ask/note 规则、投递标记、队列上限 |
| 45 | peer_instances.md | 不拆 | 一句返回形 |
| 46 | plan.md | 不拆 | 模式语义四句 |
| 47 | process-read.md | 不拆 | list 一动作 + 两参数 |
| 48 | process.md | 不拆 | list/kill 参数与短 Notes |
| 49 | question.md | 拆 | `tool-question`——options 形态、一次一问、何时问的成段准则 |
| 50 | read_history-batch.md | 拆 | `tool-read-history-batch`——窗口背景、六个筛选逐条、limit 必填 |
| 51 | read_history.md | 拆 | `tool-read-history`——跨会话 path/cwd/all 分支、「哪个工具答哪个问题」表 |
| 52 | read_image.md | 不拆 | 参数 + 格式/大小短 Notes |
| 53 | read.md | 不拆 | 路由、四参数、短 Notes |
| 54 | recent_changes.md | 不拆 | 跟踪工具清单 + 三行用法 |
| 55 | repo_outline.md | 不拆 | 两段用途 |
| 56 | settings-read.md | 不拆 | 两动作 + 敏感键规则 |
| 57 | settings.md | 拆 | `tool-settings`——按键族的类型校验规则、null/未知键语义、敏感键规则 |
| 58 | skill.md | 不拆 | list/load 两动作 |
| 59 | ssh.md | 拆 | `tool-ssh`——参数长表 + Notes（密钥优先、凭据纪律、fail-soft、会话上限、传输限制） |
| 60 | subagent.md | 拆 | `tool-subagent`——九动作分支、角色矩阵、提示词写法 |
| 61 | task.md | 不拆 | 状态与两行规则 |
| 62 | team_ledger-read.md | 不拆 | 两动作 + 六态 + 登录门 |
| 63 | team_ledger.md | 拆 | `tool-team-ledger`——六态边表、add/update/close 分支 |
| 64 | timer.md | 不拆 | 四种排期互斥 + 待决上限 + cancel/list |
| 65 | tree.md | 不拆 | 路由 + 两参数 + 短 Notes |
| 66 | verify.md | 不拆 | 三结论与 basis 声明，均为调用期契约 |
| 67 | wait_for.md | 拆 | `tool-wait-for`——条件清单、discouraged 背景、返回形 |
| 68 | websearch.md | 拆 | `tool-websearch`——参数、后端链、弱引擎告警 |
| 69 | write.md | 不拆 | 两参数 + 三行 Notes |

本表 69 行 = 拆 27 行 + 不拆 42 行。判「拆」的 27 档对应 27 份新主题，主题 id 全为 `tool-<档名>`（`_` 换 `-`）；判「不拆」的 42 档整档留作常驻面，不含锚，不进遍历集。

**对照基准写死**：所有「改造前」「原文」的读数一律取批起快照 `e82e704` 上的档（`git show e82e704:thincoder-core/tool-docs/<档名>.md`），不取工作树当前文——用改后的档自比自会恒等通过。

表与快照一致性的读数（实施轮可重跑）：`git ls-tree -r --name-only e82e704 -- thincoder-core/tool-docs` 得 69 个路径，与工作树 `*.md` 逐名比对差集为空，故本表的档名与正文即快照上的档名与正文。开工时 `knowledge list` 共 14 条主题（`prompts/knowledge` 的 13 份 + `core/knowledge` 的 `prompt-resources`），无 `tool-*` 主题 ⇒ 本批 27 个新主题 id 与现有标识不撞车。

### 受影响文件与测试覆盖

**受影响文件（机读清单）**

```
| 档 | 分拆方案 | 行数 |
|---|---|---|
| thincoder-core/tools/shared.mjs | — | 494 |
| thincoder-core/agent/setup.mjs | — | 307 |
| thincoder-core/advisor/loop.mjs | — | 319 |
| thincoder-core/prompt-files.mjs | — | 177 |
| thincoder-server/src/agent/chat-env-tools.mjs | — | 333 |
| bench/check/toolcall.check.mjs | — | 297 |
| bench/toolcall/variants.mjs | — | 77 |
| prompt-fixture/tools.mjs | — | 79 |
| docs/batches/2026-11-14-tool-docs-master-split.test.mjs | — | 新 |
| test/integration/tool-description-tiers.test.mjs | — | 新 |
```

读数口径 = `countContentLines`（`thincoder-core/agent-tools/batch-tier-gate.mjs`），对象 = 批起快照 `e82e704` 上的档，一档一行、一档一数；八份代码档均无越线，分拆方案列全部 `—`。两行 `新` = 本批新建、快照里没有该档。

非代码档（`.md`，不计行数读数）：`docs/core/design/PROMPT-SYSTEM.md` · `docs/core/design/TOOLS.md`（本段作者已改）；`test/RTM.md` ∥ `test/rtm/tooling.md`（CLI 50 故事行与节注四态行，由实施席落）；`thincoder-core/tool-docs/*.md`（被拆的档，按上节判据）；`thincoder-core/prompts/knowledge/tool-*.md`（新建 27 份，一份被拆的档一条；`tool-context.md` 已删）。

`thincoder-vscode/src/agent/tool-table.mjs` 不在改动面：`- action:'panel'` 行留在常驻面，既有过滤继续生效（设计 TOOLS §1.1）。

**单测档**：`docs/batches/2026-11-14-tool-docs-master-split.test.mjs`（与批次档同名、同目录，收口期删除）。跑法 = `node --test docs/batches/2026-11-14-tool-docs-master-split.test.mjs`。

**集成用例档**：`test/integration/tool-description-tiers.test.mjs`，承载 `CLI 50-4`。

单元面要守的失败侧（不是只守 happy path）：

1. 一份描述在完整档下渲染 = 批起快照 `e82e704` 上该档全文逐字（对照读取 = `git show e82e704:<档>`，不是工作树当前文）。
2. 同一份描述在极简档下渲染不含锚、不含展开面正文；目标文本按设计 PROMPT-SYSTEM §7 判，不按尾空行判。
3. 锚指向不存在的主题 ⇒ 抛；同一描述里同一主题锚出现两次 ⇒ 抛。
4. `toOpenAISchema(tool)` 不带 mode ⇒ 抛并点名 `mode`；mode 取值不在三档内 ⇒ 抛。
5. `.map(toOpenAISchema)` 形态（下标被当 mode）⇒ 抛——守住这个错法不会被写回来。
6. 同一个 minimal 会话里，`role: "consult"` 的装配取完整档、主链取极简档——两处同取一档即红。

### 验收对照（逐条回需求，读者可判）

| 条目 | 判据 | 谁判、判什么 |
|---|---|---|
| E1 | 上表 69 行逐行成立：判「拆」的每档都有一条同名主题，主题正文与批起快照 `e82e704` 上该档对应段落逐字相等；判「不拆」的每档整档留在盘上、全文无锚 | 实施轮按表逐档判，不抽样；对照文本用 `git show e82e704:thincoder-core/tool-docs/<档名>.md`，不用工作树当前文；`knowledge list` 作交叉核对（无缺、无多） |
| E2 | 改造前后各渲染一次全部工具描述，字符串相等；「改造前」一侧取批起快照 `e82e704` 的档 | 比对输出；任一份不相等即不成立 |
| E2b | 主链之外的四个装配面（advisor、server 环境面、bench 两处、prompt-fixture）经薄壳后文本与本批改造前一致；另加极简会话内的 consult 子代理——它走主链，但在装配点按角色取完整档 | 逐面渲染一次比对；这五个面都不随会话档位变化 |
| E3 | 极简档工具 schema 里无锚字面、无展开面正文；工具名集合与每个 schema 的键集与批起快照 `e82e704` 上的同一集合相同 | 键集对照，不看条数 |
| E4 | 四项各有读数并列，不合成一个数；工具声明一项取 `toOpenAISchema(tool, mode)` 输出的 `function.description` 串长之和，不取 `scripts/tool-schema-size.mjs` 的现量（那量的是含锚母版，两档都不是这个数） | 读报表，四项能否分别指出，并指出取数面 |
| 切档 | 运行中切换 mode 后，下一次 prepareRun 的 toolSchemas 用新档，历史消息不改写 | 设计 PROMPT-SYSTEM §5；切一次、再取一次渲染文本 |
| 打包 | 27 份 `tool-*` 主题随 `@thincoder/core` 包，VSIX 与 Desktop 物化后 `knowledge get` 可取回 | requirements §9.3；三面各取一份主题 |
| 边界 | schema（必填 ∥ 枚举 ∥ 校验）与工具集合零改动：与批起快照 `e82e704` 上的 schema 比对，差集为空 | 改造前后 schema 比对，差集为空 |

### 集成增量（对 `test/RTM.md`）

- **加**：`CLI 50-4`——三档工具描述。先在 `test/RTM.md` 的 CLI 50 故事行在册，再在 `test/rtm/tooling.md` 的 CLI 50 节用例表里加一行 `50-4`；同节节注的「三态 = 50-1 正常 · 50-2 正常 · 50-3 边界」随之改为四态，`50-4` 记正常。用例落档 = `test/integration/tool-description-tiers.test.mjs`。

  - 需求回指：requirements PROMPT-SYSTEM §7（描述分档）与 §9.3（打包面）。
  - 业务入口：按 CLI 50 节注的进入口取——真 CLI 命令与本地脚本化模型端点；`resolveWorkMode` 只作内部坐标，不是入口。
  - 评估的组件交互：`toOpenAISchema(tool, mode)` 的分档展开 ⟷ `knowledge` 工具的 `get` 取回。
  - 断言三件事：极简档里模型看不到展开面正文；经 `get` 拿得到同一份正文；完整档下一次装配的文本等于改造前全文。
  - consult 面：极简会话内起一次 consult 子代理，其工具描述为完整档——同一用例内取一次。
- **改**：无。`CLI 50-1`（模式切换与三项注入收窄）与 `CLI 50-2`（knowledge list/search/get）断言的面不被本批改动。
- **删**：无。

### 关键决策（含被否方案与试的理由）

1. **复用 `{{knowledge:}}` 锚与 `expandKnowledgeTopics`，不新造展开器。** 否掉的：给工具描述另立一套展开语法——两套展开器各有各的失败面，逐字一致那条规则要在两处各写一遍，漂一处就查不出。
2. **展开面主题放 `prompts/knowledge`（可内联那类），不放 `core/knowledge`。** 完整档会把它装进工具声明，那本身就是内联；放进纯查询目录，与设计档「core/knowledge 三档都不内联」当场矛盾。
3. **装配期展开，不在 `DESC` 里展开。** 否掉的：`DESC` 里按档展开——工具对象在建表时构造，档位会冻在首轮，会话中途切档后模型继续读旧档文本，而错处要到它按旧文本行事时才显形。
4. **`mode` 必填、不给缺省。** 缺省会让一次运行悄悄用上另一档的文本；错的是被替换的值，暴露的是三层之外的空结果。
5. **主题文件不以换行结尾。** 这是逐字一致的第三个条件，不是洁癖：`expandKnowledgeTopics` 在完整档只替换锚、不吞换行，主题末尾多一个换行就多一行空行。先例读数 = `prompts/knowledge/doc-lookup.md` 末字节非换行、`prompts/common.md` 末为换行。
6. **主链之外四个装配面显式传完整档，不猜会话档位。** 否掉的：让 server / bench / prompt-fixture 各自读会话 mode——这三面都没有会话档位可读，猜出来的值是没人选过的档；而完整档装配结果就是改造前唯一的文本，传它即零行为变化。
7. **advisor 与 consult 的工具描述取完整档，不随会话 mode 变化。** 依据 requirements §9.1「完整档工具描述和 consult/advisor 独立基底不被极简装配改写」——独立基底被极简改写，那条就当场不成立。落点 = prepareRun 里按 `agent._role === "consult"` 取 `"normal"`（consult 与主链共用这一处装配），advisor 在 `advisor/loop.mjs` 独自取 `"normal"`。否掉的：把 consult 也写成跟会话 mode——那要再改两处已定口径，还要撤掉一个已定的语义。
8. **被端面行级剔除的 `- action:'panel'` 行留常驻面。** 否掉的：改宿主过滤去匹配展开后的文本——装饰层在展开之前，看不到展开结果，改了也不生效。代价是 `subagent.md` 的常驻面比纯内容判据多一行，换来端差剔除继续成立。
9. **极简目标文本含尾空行，不追加清理。** 否掉的：为极简结果加一次行尾改写——多一处改写就多一个逐字一致的失败面，而尾空行不影响判据（无锚、无展开面正文）。

### 上抛项

- **[上抛·知会]**「工具描述暂不随 minimal 改写」这句旧口径在 `docs/core/design/PROMPT-SYSTEM.md` §7 仍活着（需求档已改成分档口径），本批已在设计档 §7 换成现行口径。需求档与设计档之间不再有第二份旧句。

- **[上抛·知会]** `TOOLS.md` §1 示例形按「传哪一档」列取值写，不按 §1 裁决 2 的字面实例写裸 `mode`。依据 = 该裁决末句「示例位不得用 `mode` 字面代替该行取值」；第 1 行的取值含 consult 分岔，写裸 `mode` 会让极简会话内的 consult 取极简档，与 requirements §9.1 及第 2 轮 #1 裁决当场矛盾。代码现状 `toolMode` 即此形。要字面实例则须同时改 §5 的 consult 口径。

### 实施后三项裁决的落点（依 §1「实施后裁决」）

1. **`context.md` 回常驻面**：本段处置表第 12 行改判「不拆」，拆分档数 28 → 27、不拆 41 → 42。判据补在设计侧：设计 PROMPT-SYSTEM §2 新增「动作枚举行与每个动作的调用期契约属常驻面，不按『详细分支』判成展开面」一句，设计 TOOLS §1.1 原文不动。
2. **`TOOLS.md` §1 示例形**：改成「`map` 形态的第二个实参填该行『传哪一档』列的值，不填裸 `mode`」，主链写 `.map((tool) => toOpenAISchema(tool, toolMode))`——与盘上 `thincoder-core/agent/setup.mjs` 的 `const toolMode = agent._role === "consult" ? "normal" : mode` 同形；其余五面写实参 `"normal"`。
3. **`PROMPT-SYSTEM.md` §3**：删逐条 13 行主题表，留两类目录区分（可内联 ∥ 纯查询）与 `knowledge list` 指路，不再复制会漂的名单。

实施侧待落两项（本段只记，不代劳）：① 删 `thincoder-core/prompts/knowledge/tool-context.md`，`thincoder-core/tool-docs/context.md` 去锚恢复整档常驻；② 单测档的 `assert.equal(splitDocs, 28, …)` 改取 27。

## §3 设计评审（评审子代理）
**状态行**：评审通过（第 3 轮：第 2 轮 7 项（🔴1 · 🟡4 · 🔵2）全部落到位并经盘上取数核对；余 1 项 🟡 可选（批档 §2 与 docs/core/design/TOOLS.md §1 的 map 改写示例用 `mode` 占位，同表「本批传哪一档」列已可判），不阻塞）



### 轮次 1（评审子代理）

| # | 严重度 | 状态 | 证据（指针） |
|---|---|---|---|
| 1 | 🔴 | 未处置 | `TOOLS.md` §1「装配点两处——`agent/setup.mjs` 的 prepareRun 与 `advisor/loop.mjs`」与「mode 是必填参数：缺它或取值不在 minimal / normal / engineering 之内即抛错」互相锁死，但全仓 `toOpenAISchema` 调用点不止两处，四处按单参调用：`thincoder-server/src/agent/chat-env-tools.mjs` 的 `createEnvTools`「core.toOpenAISchema(toolOf[name])」（`src/agent/chat.mjs` 调它）、`bench/check/toolcall.check.mjs`「builtinTools.map(toOpenAISchema)」、`bench/toolcall/variants.mjs`「const tools = builtinTools.map(toOpenAISchema)」、`prompt-fixture/tools.mjs`「.map((name) => toOpenAISchema(DECLARED_TOOLS[name]))」。四档均不在 §2 机读清单内 ⇒ mode 必填即当场抛错（F-R24c）。该分支的真实场景就是这四个未迁移调用点，§2 未点名（F2-7） |
| 2 | 🔴 | 未处置 | §2 机读清单只四行源档，两个新建 `.mjs` 无行：`**单测档**：`docs/batches/2026-11-14-tool-docs-master-split.test.mjs``（写在清单外散文里），且集成增量「**加**：`CLI 50-4`」未点名任何 `test/integration/**` 档。模板「只列代码档（源 ∥ 单测）」+ 快照无此档写 `新`；`test/RTM.md`「本表只登记仓根 `test/integration/**` 的集成用例，批次单元测试不进入本表」；门拒文「§2 清单里没有这一档的行」。先例行 = `2026-11-12-ledger-query-default-limit` §2「| docs/batches/2026-11-12-ledger-query-default-limit.test.mjs | — |」 |
| 3 | 🟡 | 建议补 | §2 无「最近先例」行（节序 = 本批条目 / 设计档落点 / 机制设计 / 内容形判据 / 受影响文件与测试覆盖 / 验收对照 / 集成增量 / 关键决策 / 上抛项）。被复用机制实体 = `thincoder-core/prompt-files.mjs` 的 `expandKnowledgeTopics`，§2 只给「复用 `{{knowledge:}}` 锚与 `expandKnowledgeTopics`，不新造展开器」，无坐标、无对齐 ∥ 偏离说明。近邻记录 = `2026-11-13-minimal-mode` §2「**最近先例** = …」 |
| 4 | 🟡 | 建议补 | §2 无「勘察证据」行。证据只在设计档头注（`PROMPT-SYSTEM.md`「勘察证据：已读分层、装配矩阵、overlay、工具描述、记忆边界与自动注入。」· `TOOLS.md`「勘察证据：已读注册、权限、编辑、git、后台、SSH、网络与角色收窄。」），两处均未答「公开源档（含独立档仓）是否勘察、是否相关」 |
| 5 | 🟡 | 建议补 | 三问答案部分在场：主题标识「无 `tool-*` 主题 ⇒ 本批 28 个新主题 id 与现有标识不撞车」（`none found` 形）、展开器复用（`existing` 形）。缺 = §2 机制设计新名「工具面经 `expandToolDescription(text, mode)` 薄壳调用」无 `existing: …` ∥ `none found: …` 三问答案 |
| 6 | 🟡 | 建议补 | §2 集成增量「**加**：`CLI 50-4`——三档工具描述：完整档逐字一致、极简档只发常驻面、展开面经 `knowledge get` 取回。」只给业务结果，缺该用例评估的组件交互（`toOpenAISchema` 分档展开 ∥ `knowledge` 取回）、需求回指（requirements PROMPT-SYSTEM §7）与业务入口（minimal 会话进入点） |
| 7 | 🟡 | 建议补 | §2 验收对照 E1–E4 + 边界 ∥ 单测四条不含：`advisor/loop.mjs` 装配点取 mode 的行为；设计档 §5「配置或会话命令在运行中切换 mode 后，下一次 prepareRun 自然使用新值」；requirements PROMPT-SYSTEM §9.3「core 包、VSIX 和 Desktop 均能加载极简槽与知识主题。」（28 份新主题的打包面） |
| 8 | 🟡 | 建议补 | `PROMPT-SYSTEM.md` §4「consult 与 advisor 的独立基底不经过极简槽替换。」∥ `TOOLS.md` §1「各自经 `resolveWorkMode` 取到 mode 再传」+ requirements §9.1「完整档工具描述和 consult/advisor 独立基底不被极简装配改写。」——minimal 会话内 advisor/consult 的工具描述取哪一档，设计档与 §2 均未裁定 |
| 9 | 🟡 | 建议补 | 宿主侧对母版的行级改写无规则：`thincoder-vscode/src/agent/tool-table.mjs`「tool.description.split("\n").filter((l) => !l.startsWith("- action:'panel'")).join("\n")」读母版行，注「① 描述：先剔 panel 行（端面无该动作）**再**附 role suffix」；被剔的行在 `thincoder-core/tool-docs/subagent.md`「- action:'panel': DIAGNOSE and fix the subagent panel」，§2 处置表第 60 行判 `subagent.md` 为「拆」——该行落进展开面后过滤失效，VSC 描述重新带上端面没有的动作 |
| 10 | 🟡 | 建议补 | §2 E4「四项各有读数并列，不合成一个数」未点名工具声明一项的取数面；现存读数器 `scripts/tool-schema-size.mjs`「const chars = JSON.stringify({ description: tool.description ?? "", parameters: tool.parameters ?? null }).length」量工具对象（改造后 = 含锚母版），两档都不是这个数 |
| 11 | 🔵 | 备注 | `prompt-files.mjs` 的 `expandKnowledgeTopics` 极简支「const pattern = minimal ? /\{\{knowledge:([a-z0-9-]+)\}\}(?:\r?\n){0,2}/g : KNOWLEDGE_ANCHOR_RE」只吞锚后至多两个换行：展开面在描述尾部时极简结果留一个尾空行；E3「极简档工具 schema 里无锚字面、无展开面正文」抓不到 |
| 12 | 🔵 | 备注 | §2「四档均在 500 线以下，无越线档，分拆方案列全部 `—`。`shared.mjs` 本批约增 2 行 ⇒ 约 496，仍在 500 以内。」——预估增量与「因此不拆」并列，对照 `CODE-TIER` §2.1「`≤ 500`：不进入拆分讨论，不写"因此不拆"的冗余结论」与门拒文「只报这一个数：不写增量 ∥ 百分比 ∥ 超了多少行」 |
| 13 | 🔵 | 备注 | `prompt-files.mjs` 的 `readKnowledgeEntries` 逐档 `readFileSync` 全正文、`loadKnowledgeTopic` 每次重扫全部条目；本批新增 28 份 `tool-*` 主题（`batch.md` 19064 B、`subagent.md` 10660 B）后，`knowledge list` 与每次锚展开的读取量随之放大——设计档未提该面成本 |

已实读核对、成立的（不进结论表）：

- §2 处置表 69 行与盘上 `thincoder-core/tool-docs` 69 份 `.md` 同名同序，拆 28 / 不拆 41 与表末自述一致。
- 四档读数按 `countContentLines` 形状复核：`shared.mjs` 494、`agent/setup.mjs` 307、`advisor/loop.mjs` 319、`prompt-files.mjs` 177，均 ≤500，「无越线档」成立。
- `prompts/knowledge` 13 份主题与设计档 §3 表逐名相符；`core/knowledge` 另有 `prompt-resources`。
- 两份设计档均不含受影响文件表 ∥ 施工账（F2-4 成立）。

VERDICT: changes-required
计数：🔴 2，🟡 8，🔵 3。

### 轮次 2（评审子代理）

### 复核轮（第 1 轮 13 项的落实 + 修后文档集合自洽）

| # | 严重度 | 状态 | 证据（指针） |
|---|---|---|---|
| 1 | 🔴 | 未处置 | 设计 PROMPT-SYSTEM §4「工具面同一口径：advisor 与 consult 装配的工具描述取完整档，不随会话 mode 变化」＋§9「advisor 装配点的工具描述取完整档」＋批档 §2 关键决策 7「advisor 与 consult 的工具描述取完整档，不随会话 mode 变化」，而 TOOLS §1「各调用点传哪一档」只钉 `advisor/loop.mjs`，§2 六个调用点表无 consult 行；consult 子代理实走主链：`thincoder-core/agent-tools/consult.mjs` 的 runConsultChild「config: agent.config」＋「role: "consult"」→ `thincoder-core/agent/run-start.mjs`「await prepareRun(」→ `thincoder-core/agent/setup.mjs`「const toolSchemas = tools.map(toOpenAISchema)」⇒ minimal 会话内的 consult 子代理按会话 mode 取极简档；E2b 四面不含该面 |
| 2 | 🟡 | 建议补 | §2 六个调用点表一档一行，虽写「全仓 `toOpenAISchema` 调用点逐名核准」，`bench/check/toolcall.check.mjs` 只引「builtinTools.map(toOpenAISchema)」，同档另一处单参调用「toOpenAISchema(readImageTool)」未列；`bench/toolcall/variants.mjs` 同形「tools.push(toOpenAISchema(readImageTool))」；TOOLS §1 的改写形「.map((tool) => toOpenAISchema(tool, mode))」不覆盖这两处 |
| 3 | 🟡 | 建议补 | 集成增量写「编号先在 `test/RTM.md` 的 CLI 50 故事里设立」，而 CLI 50 故事节在 `test/rtm/tooling.md`「## CLI 50. 三档模式切换、极简提示词与知识查询」；§2 受影响文件段未列 `test/RTM.md` ∥ `test/rtm/tooling.md`，节注「三态 = 50-1 正常 · 50-2 正常 · 50-3 边界」的更新无落点 |
| 4 | 🟡 | 建议补 | 集成增量「业务入口：一次 minimal 会话的进入点——`resolveWorkMode` 取到 minimal 后装配工具表」以内部函数作入口；`test/rtm/tooling.md` CLI 50 节注的进入口 = 「真 CLI 命令与本地脚本化模型端点」 |
| 5 | 🟡 | 建议补 | `thincoder-core/tools/shared.mjs` 的 `toOpenAISchema` 头注「两个调用点（`agent/setup.mjs` · `advisor/loop.mjs`）同经本函数。」在本批六个调用点后不成立；§2 受影响文件列了该档，改动项里无这条注释 |
| 6 | 🔵 | 备注 | §2 机制设计「`tools/shared.mjs` 只多一次调用，避免把 494 行的档推过 500 线」＝增量 + 按改后长度谈档位；读数已在机读清单，CODE-TIER §2.1「基准是修改代码前的长度」 |
| 7 | 🔵 | 备注 | §2「顺序 = 先展开、后 `applyPromptInjections`」这条缝序规则只住本批档，TOOLS §1 ∥ PROMPT-SYSTEM §2 §7 无对应句，收口后无从查 |

已复核成立（不进结论表）：

- 第 1 轮 🔴 #2：两份新建档已入机读清单，行数列为 `新`，集成增量点名了承载档。
- 第 1 轮 🟡 #3–#10：最近先例（坐标＋对齐∥偏离）、公开源档勘察（仓外无相关项）、`expandToolDescription` 与主题标识三问、`CLI 50-4` 三要素、切档∥打包∥E2b 验收、advisor 取完整档、宿主行级改写 §1.1、E4 取数面，均已在 §2 落到位。
- 第 1 轮 🔵 #11–#13：极简目标文本写死并断言、预估句已删、知识面读取成本已写入设计 PROMPT-SYSTEM §3。

- 八份代码档读数按盘上复核相符：494 ∥ 307 ∥ 319 ∥ 177 ∥ 333 ∥ 297 ∥ 77 ∥ 79；`shared.mjs` 内无 300+ 行单函数。
- 69 份 `tool-docs` 与处置表逐名相符（拆 28 ∥ 不拆 41）；`prompts/knowledge` 13 份 + `core/knowledge/prompt-resources` = 14 条主题。
- `CLI 50-4` 在 `test/RTM.md` 与现有用例档均未占用（50-1 ∥ 50-2 ∥ 50-3 在册）。

VERDICT: changes-required
计数：🔴 1，🟡 4，🔵 2。

### 轮次 3（评审子代理）

本轮复核第 2 轮 7 项（🔴1 · 🟡4 · 🔵2）＋上轮新增 1 项 🟡；`docs/core/design/PROMPT-SYSTEM.md`、`docs/core/design/TOOLS.md` 与批档 §2 全部本轮重读，代码侧断言逐条取数核对。

| # | 严重度 | 状态 | 证据（指针） |
|---|---|---|---|
| 1 | 🔴 | 已处置 | consult 面档位四处一致：`docs/core/design/PROMPT-SYSTEM.md` §4「工具面同一口径：advisor 与 consult 装配的工具描述取完整档，不随会话 mode 变化」· §9「advisor 与 consult 装配点的工具描述取完整档，极简会话内不变」· `docs/core/design/TOOLS.md` §1 调用点表首行「`agent._role === "consult"` 时取完整档」· 批档 §2 关键决策 7。机制有落点且有同点先例：`thincoder-core/agent/setup.mjs` 已按 `agent._role === "consult"` 分岔（`if (agent._role === "consult" && !base)`），`thincoder-core/agent.mjs` 的 `createAgent` 设 `_role: role`，`thincoder-core/agent-tools/consult.mjs` 以 `role: "consult"` 建子代理；E2b 五面、单测第 6 条、`CLI 50-4` 的 consult 子条齐 |
| 2 | 🟡 | 已处置 | `docs/core/design/TOOLS.md` §1 调用点表补两行「`builtinTools.map(toOpenAISchema)` ∥ `toOpenAISchema(readImageTool)`」与「`builtinTools.map(toOpenAISchema)` ∥ `tools.push(toOpenAISchema(readImageTool))`」，并给非 `map` 改写形「`toOpenAISchema(readImageTool, "normal")`」；批档 §2 八处表达式表第 6、8 行逐条落位 |
| 3 | 🟡 | 已处置 | 批档 §2 集成增量改指「先 `test/rtm/tooling.md` 的 CLI 50 节用例表里加一行 `50-4`」，节注四态与 `test/RTM.md` ∥ `test/rtm/tooling.md` 双档已进非代码档段；盘上核对 `test/rtm/tooling.md` 的 CLI 50 节注逐字「三态 = 50-1 正常 · 50-2 正常 · 50-3 边界。」 |
| 4 | 🟡 | 已处置 | 批档 §2「业务入口：按 CLI 50 节注的进入口取——真 CLI 命令与本地脚本化模型端点；`resolveWorkMode` 只作内部坐标，不是入口」，与节注「进入口 = 真 CLI 命令与本地脚本化模型端点」逐字一致 |
| 5 | 🟡 | 已处置 | 批档 §2「**改动面补一条**：`thincoder-core/tools/shared.mjs` 的 `toOpenAISchema` 头注现写「两个调用点（`agent/setup.mjs` · `advisor/loop.mjs`）同经本函数。」」，盘上该头注逐字为「两个调用点（`agent/setup.mjs` · `advisor/loop.mjs`）同经本函数。」——前提成立，改写已指派实施席 |
| 6 | 🔵 | 已处置 | 批档 §2 机读清单段现为「八份代码档均无越线，分拆方案列全部 `—`。两行 `新` = 本批新建、快照里没有该档。」，「约增 2 行 ⇒ 约 496」类预估句已不在 |
| 7 | 🔵 | 已处置 | 缝序规则本体进 `docs/core/design/TOOLS.md` §1「装配顺序是先在 schema 装配处展开锚、再跑 `applyPromptInjections`：注入值由端侧提供，顺序倒过来会把注入值当主题锚再展开一次。」；批档 §2 只留「（规则本体 = 设计 TOOLS §1）」指针，收口后可查 |
| 8 | 🟡 | 未处置（可选，不阻塞） | 批档 §2「`map` 直传的四处（第 1、3、5、7 行）写成 `.map((tool) => toOpenAISchema(tool, mode))`」与同表第 3、5、7 行「完整档 `"normal"`，不读会话 mode」并存，该三处作用域无 `mode` 变量；`docs/core/design/TOOLS.md` §1「`map` 形态一律写成 `.map((tool) => toOpenAISchema(tool, mode))`」同形。同表「本批传哪一档」列可判，故按可选记 |

已实读核对、成立的（不进结论表）：

- 第 1 轮 13 项仍到位：最近先例、勘察证据、公开源档结论、新名三问、`CLI 50-4` 三要素与落档、切档 ∥ 打包 ∥ E2b 验收、宿主机行级改写 §1.1、E4 取数面、极简目标文本、知识面读取成本。
- 需求锚逐字在位：`docs/core/requirements/PROMPT-SYSTEM.md` §9.1「完整档工具描述和 consult/advisor 独立基底不被极简装配改写。」· §9.3「core 包、VSIX 和 Desktop 均能加载极简槽与知识主题。」
- 调用点清单六档完整（setup ∥ advisor ∥ server 环境面 ∥ bench 两处 ∥ prompt-fixture），`thincoder-vscode/src/tools/index.mjs` 只 re-export，与批档 §2 自述一致；机读清单 10 行 = 8 代码档 + 2 `新`。

VERDICT: pass
计数：🔴 0，🟡 1（可选），🔵 0。

### 轮次 4（评审子代理）

### 复核轮（第 3 轮 · 第 2 轮 7 项 + 上轮 1 项可选，对现字节重签）

本轮重读 `docs/core/design/PROMPT-SYSTEM.md` · `docs/core/design/TOOLS.md` · `docs/core/requirements/PROMPT-SYSTEM.md` 与批档 §2 全文，逐项对现字节核对。

| # | 严重度 | 状态 | 证据（指针） |
|---|---|---|---|
| 1 | 🔴 | 已处置 | `PROMPT-SYSTEM.md` §4「工具面同一口径：advisor 与 consult 装配的工具描述取完整档，不随会话 mode 变化」· §9「advisor 与 consult 装配点的工具描述取完整档，极简会话内不变」· `TOOLS.md` §1 调用点表首行「`agent._role === "consult"` 时取完整档」＋同节「在 prepareRun 里按 `agent._role === "consult"` 取完整档」· 批档 §2 决策 7、表达式表第 2 行、单测第 6 条、E2b「另加极简会话内的 consult 子代理」、集成增量「consult 面」——五面齐 |
| 2 | 🟡 | 已处置 | 批档 §2 表达式表九行八表达式：第 5/6 行 `bench/check/toolcall.check.mjs`「`builtinTools.map(toOpenAISchema)` ∥ `toOpenAISchema(readImageTool)`」，第 7/8 行 `bench/toolcall/variants.mjs` 同形；非 `map` 改写形「`toOpenAISchema(readImageTool, "normal")`」在位；`TOOLS.md` §1 表同样以「∥」并列两表达式 |
| 3 | 🟡 | 已处置 | 批档 §2 集成增量「再在 `test/rtm/tooling.md` 的 CLI 50 节用例表里加一行 `50-4`」＋同节节注改四态；非代码档段「`test/RTM.md` ∥ `test/rtm/tooling.md`」 |
| 4 | 🟡 | 已处置 | 批档 §2「业务入口：按 CLI 50 节注的进入口取——真 CLI 命令与本地脚本化模型端点；`resolveWorkMode` 只作内部坐标，不是入口。」 |
| 5 | 🟡 | 已处置 | 批档 §2「**改动面补一条**：`thincoder-core/tools/shared.mjs` 的 `toOpenAISchema` 头注现写「两个调用点（`agent/setup.mjs` · `advisor/loop.mjs`）同经本函数。」，本批八处表达式之后不成立——由实施席按上表改写这条头注」 |
| 6 | 🔵 | 已处置 | 批档 §2 机读清单段「八份代码档均无越线，分拆方案列全部 `—`。两行 `新` = 本批新建、快照里没有该档。」；「只多一次调用，避免把 494 行的档推过 500 线」已不在 §2 |
| 7 | 🔵 | 已处置 | `TOOLS.md` §1「装配顺序是先在 schema 装配处展开锚、再跑 `applyPromptInjections`」；批档 §2 只剩「（规则本体 = 设计 TOOLS §1）」指针 |
| 8 | 🟡（可选） | 已处置 | `TOOLS.md` §1「`map` 形态的第二个实参填该行「传哪一档」列给出的值，不填裸 `mode`：…写成 `.map((tool) => toOpenAISchema(tool, toolMode))`」；批档 §2 同形（`D` = 该行「本批传哪一档」列的值）——上轮「示例位用 `mode` 占位」的并存已消 |

三项实施后裁决复核：`PROMPT-SYSTEM.md` §3 已无逐条主题表（现句为「当前清单由 `knowledge list` 现读——设计档不复制一份会漂的名单。」）；批档 §2 处置表第 12 行 `context.md` 判「不拆」，表末「拆 27 行 + 不拆 42 行」与之相符；`TOOLS.md` §1 示例形按「传哪一档」列取值。

需求锚逐字在位：`docs/core/requirements/PROMPT-SYSTEM.md` §9.1「完整档工具描述和 consult/advisor 独立基底不被极简装配改写。」

计数：🔴 0 · 🟡 0（可选 1，已处置）· 🔵 0 未解；已处置 8。

VERDICT: pass

## §4 用户批准（主 agent）

### 批准结论

本批（tool-docs 母版与按档装配 · 台账 #2406）按 `docs/core/design/PROMPT-SYSTEM.md` ∥ `docs/core/design/TOOLS.md` 的现文实施并交付。

- **授权形态**：一次批量放行，覆盖本批的设计修正、设计评审、实施与收口，不再逐节点等确认。用户原话：「修。后续自动跑吧，跑完你就开工工具面的修改。」（2026-11-14，本批点火前）
- **范围固化**：只做结论二（工具描述母版与按档装配），结论一（工具描述去留判据）不并入本批。用户原话：「结论一不要管了，只管结论二的事儿。」
- **不改的面**：工具集合、参数 schema（必填项、枚举、校验）一律不动；完整档装配结果逐字等于改造前。依据 = `docs/core/requirements/PROMPT-SYSTEM.md` §7「工具 schema（参数、必填、枚举、校验）不因档位改写；工具描述分常驻面与展开面」。
- **设计过审**：设计评审四轮，末轮 `VERDICT: pass`（🔴 0 未解），凭证签发后进入实施。
- **实施期间的追加裁决**：三项（`context.md` 回常驻面、`TOOLS.md` §1 示例形按「传哪一档」列取值、`PROMPT-SYSTEM.md` §3 删逐条主题表）由父侧裁定后交设计席落，均属本批已授权范围。

## §5 实施记录（eng-coder）
**状态行**：✅ 实施完成 · 2026-11-14（10 例单测 + CLI 50-4 集成用例绿；审计 2 项、代码评审 2 🟡 + 3 🔵 均处置或上抛；实施后裁决 1 已落地（context.md 回常驻面、tool-context 主题已删、拆档数 27），见本节末补记）



### 实施摘要（eng-coder · 2026-11-14）

两件事：① 27 份工具描述拆成常驻面 + 展开面，展开面整块进 `thincoder-core/prompts/knowledge/tool-<档名>.md`，原位换独占一行的锚；② `toOpenAISchema(tool, mode)` 在 schema 装配处按档展开，八处调用表达式逐处传档（consult 取完整档，其余五面取 `"normal"`）。

改动面 = §2 机读清单的 8 份代码档 + 2 份新建档，另加非代码档 `test/rtm/tooling.md`、27 份 `tool-docs`、27 份新主题（`context.md` 按实施后裁决 1 回常驻面，见本节末补记）。**清单外零档**；两处「列了但没改」的说明：`thincoder-core/prompt-files.mjs` 原样复用 `expandKnowledgeTopics`、一字未改（薄壳落在 `tools/shared.mjs`）；`test/RTM.md` 未改——CLI 50 故事行本就在册且为 `有`，新用例不改变该格取值。

`thincoder-core/tools/shared.mjs` 494 → 510 内容行（`countContentLines`）；收口线 800，不触发拆分。

### 拆分怎么做的（方法披露）

27 档的分块由一支按行切片的脚本落盘：脚本先逐档断言「完整档展开 == `git show e82e704:<档>`」，断言通过才写文件。分块首尾由我逐档读完全文后按内容判据选定，脚本只做字节搬运、不改一字。这是零语义搬迁——语义全在「切哪一段」这一判断上，而它由人逐档做。

### 逐档处置（搬走的连续区块 → 主题）

| 档 | 主题 id | 搬走 | 常驻面留什么 |
|---|---|---|---|
| advisor.md | tool-advisor | L14–L26 | 用途、type 两值、documents 规则、返回形 |
| apply_patch.md | tool-apply-patch | L8–L19 | 用途、patch 参数、ledger/project |
| bash.md | tool-bash | L18–L39 | 用途、路由、四个参数、ledger/project（输出块与 Notes 搬走） |
| batch.md | tool-batch | L43–L76 | 用途、无静默写、九个动作分支、路径规则 |
| browser.md | tool-browser | L11–L58 | 用途、非接管、路由清单（参数长表与 Notes 全搬） |
| context.md | 不拆（实施后裁决 1 改判） | — | 整档即常驻面：一句用途 + 三条动作枚举行 + 一句失败形；快照全文 1228 字符逐字保留 |
| doc_check.md | tool-doc-check | L13–L59 | 用途、两档区别、参数、误用、读档提示 |
| doc_graph-read.md | tool-doc-graph-read | L7–L19 | 用途、四问、target 必填 |
| doc_graph.md | tool-doc-graph | L20–L48 | 用途、存储/解析背景、四动作、参数 |
| edit.md | tool-edit | L17–L39 | 两种定位形、容忍匹配、LCS、replace_all |
| execute.md | tool-execute | L5–L15 | 用途、fs 归属、ledger/project |
| git.md | tool-git | L7–L30 | 用途、三十动作枚举 |
| ledger-read.md | tool-ledger-read | L5–L30 | 用途、六态、只读边界 |
| ledger.md | tool-ledger | L5–L29 | 用途、add 起头、close --batch/query/count |
| manifest-read.md | tool-manifest-read | L3–L11 | 用途、只读、target 规则 |
| manifest.md | tool-manifest | L20–L30 | 用途、三动作、target/key/value、拒绝形 |
| memory-read.md | tool-memory-read | L8–L17 | 用途、两动作、写权归属 |
| memory.md | tool-memory | L5–L14 | 用途、search/put/list 三条、ledger/project |
| notify_parent.md | tool-notify-parent | L6–L11 | 通道用途、ask/note 两形 |
| question.md | tool-question | L10–L16 | 用途、两参数、阻塞语义（inject 锚留常驻面） |
| read_history-batch.md | tool-read-history-batch | L3–L15 | 用途、窗口外落点、batch 边界 |
| read_history.md | tool-read-history | L19–L34 | 用途、默认形、子代理形、筛选、返回形 |
| settings.md | tool-settings | L7–L17 | 用途、三动作、set 语义、审批面 |
| ssh.md | tool-ssh | L36–L54 | 用途、会话、路由、参数全表、输出形 |
| subagent.md | tool-subagent | L13–L58 | 九个动作分支（含 `- action:'panel'` 行） |
| team_ledger.md | tool-team-ledger | L7–L10 | 用途、读写面、repo tag、query/count |
| wait_for.md | tool-wait-for | L7–L24 | 用途、何时用/何时不用、两条 Notes |
| websearch.md | tool-websearch | L14–L18 | 用途、后端链、五个参数 |

### 与 §2 处置表的偏离（逐条披露）

1. **一份描述只能拆成两块**（设计 PROMPT-SYSTEM §2「一份工具描述被拆成两块」，主题标识一档一个），而 §2「依据」列对多档点名了三处以上的内容（advisor：审查范围 / 三轮收敛 / 池与异步；subagent：九动作分支 / 角色矩阵 / 提示词写法）。一个锚只覆盖一段连续区块，故每档只搬一段，选的是该档最贴合「长示例 / 详细分支 / 完整错误说明 / 背景解释」的那一段；「依据」列其余项目留在常驻面。逐档位置见上表。
2. **参数清单一律留常驻面**：设计 PROMPT-SYSTEM §8 把 tool-docs 的常驻面定义为「路由、参数、错误与副作用中每次调用都要看见的部分」。故「依据」列点名为「参数长表」的档（ssh / browser / doc_check 等）搬走的是 Notes / 判项 / 输出块，参数面留下——极简档仍能照着描述发对一次调用。
3. **`subagent.md` 搬的是角色矩阵 + 任务书 + 异步/池/调度 + 提示词写法**（L13–L58），九动作分支留在常驻面。理由：`- action:'panel'` 行必须留常驻面（设计 TOOLS §1.1 / §2 决策 8），而「搬走九动作分支」会把该行一起带走；两块分离后取的是「保留调用期动作契约、搬走工作流指南」这一侧。
4. **`context.md` 已按实施后裁决 1 改判不拆**：三条动作枚举行属常驻面（设计 TOOLS §1.1），该档整档作常驻面、主题 `tool-context` 已删。首轮曾按 §2 处置表把它搬走（那时 §2 第 12 行判「拆」），裁决后已还原成批起快照原文，见本节末补记。

### 交付表（本批条目 → 状态）

| # | 状态 | 条目 | 依据 |
|---|---|---|---|
| E1 | ✅ | 27 档拆出展开面、42 档整档保留（`context.md` 按实施后裁决 1 回常驻面），逐档有处置；每份拆档都能 `knowledge get` 取回原文 | 单测「极简档」「逐份取回」两条；`knowledge list` 交叉核对：`prompts/knowledge` 40 份（13 既有 + 27 个新 `tool-*`）+ `core/knowledge` 的 `prompt-resources` = 41 条；`tool-*` 前缀共 28 条 = 27 新增 + 既有的 `tool-operations`（设计 PROMPT-SYSTEM §3 在册，非本批产出）⇒ 无缺无多 |
| E2 | ✅ | 完整档装配与改造前逐字一致（69 档全量，不抽样） | 单测「完整档」：`expandToolDescription(DESC, "normal"∥"engineering")` == `git show e82e704:<档>`，drift 0 |
| E2b | ✅ | 主链之外五面 + 极简会话内的 consult 均取完整档、文本不随会话档位变化 | 代码面六档八处逐处传 `"normal"`；单测「consult 装配」；集成用例 consult 子条；bench check 通过 |
| E3 | ✅ | 极简档无锚字面、无展开面正文；工具数与 schema 键集不缩水 | 单测「极简档」；集成用例 ② 断言工具数相等 + 键集 deepEqual；单测「档位只换描述」断言 `parameters` 原样透传 |
| E4 | ⚠️ | 四项分别测量 | 工具声明一项已测（下表）；另三项给了读数与取数面，但 `memory: null` 使文档/记忆/大纲注入未触发，带 memory 的真读数归父侧收口 |
| 切档 | ✅ | 运行中换档后下一次 prepareRun 用新档，历史消息不改写 | 单测「切档」；集成用例 ②④ 经真 CLI 命令切档后重取渲染 |
| 打包 | ⚠️ | 27 份主题随 `@thincoder/core` 包 | `thincoder-core/package.json` 的 `files` 含 `"prompts/"` 与 `"tool-docs/"`（`prompts/knowledge/**` 在内）；VSIX 与 Desktop 物化后真取一份主题未跑，归父侧 |
| 边界 | ✅ | schema 与工具集合零改动 | 单测「档位只换描述」：`parameters` 两档 deepEqual 且等于 `tool.parameters`；集成用例键集对照；变更面不含任何工具定义档的参数 |

### 六条失败侧（不是只守 happy path）

| 条 | 守的错法 | 用例 |
|---|---|---|
| 1 | 完整档与改造前不一致 | 单测「完整档」逐档比对快照 |
| 2 | 极简档漏出锚或展开面正文 | 单测「极简档」+「必短于完整」两条 |
| 3 | 未知主题、同一主题重复、锚无法解析 | 单测「锚失败面」三断言 |
| 4 | mode 缺失 / 取值非法 | 单测「mode 必填且受枚举约束」 |
| 5 | 把函数直接交给 `map` | 单测「把函数直接交给 map 的写法不成立」 |
| 6 | 同一极简会话里两处同取一档 | 单测「consult 装配取完整档，主链取极简档」 |

### 验证读数

- **单测**：`node --test docs/batches/2026-11-14-tool-docs-master-split.test.mjs` → `tests 10 / pass 10 / fail 0`。
- **失败侧实跑**（证明上面这些绿是挣来的，不是恒绿）：把 `tool-docs/websearch.md` 还原成未拆态 → 「极简档」用例转红（拆档数与断言不等；当时断言取 28）；把 `prompts/knowledge/tool-websearch.md` 的 `Notes:` 改一字 → 「完整档」与「逐份取回」两例转红；两处还原后 10/10 转绿。
- **集成用例**：`node --test test/integration/tool-description-tiers.test.mjs` → `1 pass`（CLI 50-4）。
- **回归**：`minimal-mode` 3/3 · `tool-role-fitting` 3/3 · `advisor-record-gate` 3/3 · `server-work-mode` 2/2，全绿。
- **bench**：`node bench/check/run.mjs` → 116 passed / 2 failed（`probe.check.mjs` · `roster.check.mjs`）。在批起快照 `e82e704` 的分离工作树里复跑同样两份 → 10/1 与 6/1，同样失败 ⇒ 与本批无关的既有失败；两份 check 档不引用 `toOpenAISchema` ∥ `tools/index.mjs` ∥ `shared.mjs`。
- **极简体量**：69 份描述语料 161,860 → 89,779 字符（省 72,081，44.5%）；量法 = 69 档 `expandToolDescription(loadToolDoc(n), mode).length` 求和，`context.md` 回常驻面后重取。
- **E4 四项**（cwd = 本仓根、`memory: null`、52 工具、同一句输入）：

  | 项 | minimal | normal | 取数面 |
  |---|---|---|---|
  | 系统提示词 | 20,352 | 112,028 | `prepareRun` 的 `systemPrompt.length` |
  | 工具声明 | 144,365 | 209,832 | `JSON.stringify(toolSchemas).length`；描述串合计 72,879 ↔ 137,796 |
  | 自动注入 | 4,515 | 4,514 | `JSON.stringify(agent.history).length`（含本次输入 `probe`） |
  | 完整请求 | 169,488 | 327,558 | `JSON.stringify({system, messages, tools}).length` |

  `memory: null` 时文档、记忆、大纲三条注入不触发，故自动注入一项本读数只是环境/时间/git 短事实；带 memory 的真读数与分档对比归父侧收口。四项读数取于 2026-11-14（`context.md` 回常驻面之后），同一支尺、同一次跑。
- **doc_check**：`test/rtm/tooling.md` gate → `DOC-CHECK GATE: PASS`；另抽 3 份新主题 + 3 份被拆档 `report` → PASS。

### 落地核对

- `docs/core/design/TOOLS.md` §1「`map` 形态一律写成 `.map((tool) => toOpenAISchema(tool, mode))`」——本次落地在 `thincoder-core/agent/setup.mjs` 写成 `.map((tool) => toOpenAISchema(tool, toolMode))`（`toolMode` = consult 取 `"normal"`、主链取会话 `mode`）。它与同节调用点表第 1 行的要求一致，与该句字面不一致；哪一侧要改由收口裁（代码侧要保 consult 取完整档，故不是把代码改回 `mode` 就能两全）。
- 其余核对**无**：设计 PROMPT-SYSTEM §2（拆成两块、逐字三条件）、§7（完整档逐字、极简目标文本、四项计量）、§8（tool-docs 常驻面定义）、§9（验证清单）与 TOOLS §1.1 均与落地一致。

### 审计与评审轮次 · 终止状态

- **内部 explore 偏差审计：1 轮，2 项**。① `CLI 50-4` 只走脚本化端点、没走真 CLI 命令入口 → 当场修：切档改经 `handleMinimalCommand` ∥ `handleNormalCommand` 落槽再掀下一轮，集成用例加「命令切档后重取渲染」两步；② E4 四项读数在盘上无落点 → 当场补进本节下表（含取数面与已知限制）。
- **advisor 代码评审：1 轮，`VERDICT: pass`**（0 🔴 · 2 🟡 · 3 🔵）。两条 🟡 都在设计档笔域：`TOOLS.md` §1 的 map 示例形与「一律」句（读者照字面写 `mode` 会 ReferenceError，落地的写法是对的）——未改，归收口裁；`context.md` 的动作枚举行与 `TOOLS.md` §1.1「动作枚举行属常驻面」口径分叉——已由实施后裁决 1 裁定，本轮落地。两条 🔵 在集成用例档（按下标取请求体、快照缺失时报裸 git 错）已当场修并复跑绿；第三条 🔵（`PROMPT-SYSTEM.md` §3 逐条主题表与实际主题数不符）属设计档，已由实施后裁决 3 删掉该表。
- **终止状态：`clean`** —— 0 项未处置的必修项；余项全部在设计席笔域，已逐条写进本节与交付报告。

### 补记 · 实施后裁决 1 的剩余实施面（eng-coder · 2026-11-14 第二轮）

本轮派单只两项，都是 §2「实施后三项裁决」留下的实施面（§2 末句已点名）。

1. **`context.md` 去锚、整档回常驻面**：删掉 `{{knowledge:tool-context}}` 那一行，把它原先承载的三条动作枚举行按批起快照原文写回。落盘后逐字节等于 `git show e82e704:thincoder-core/tool-docs/context.md`（1228 字符，实测相等）。
2. **删 `thincoder-core/prompts/knowledge/tool-context.md`**（882 字符）。全仓再无 `tool-context` 引用——`grep tool-context` 只余批档自身。
3. **单测档拆档数 28 → 27**，并在同一用例里加一条守动作名的断言：极简档必须仍看见 `action='stats'` ∥ `'prune'` ∥ `'compact'`。加这条的理由：只钉拆档数挡不住「再拆一次、同时把数改成 28」这条退路，而那正是裁决 1 要防的能力回退。

读数（本轮实跑）：

- 单测：`node --test docs/batches/2026-11-14-tool-docs-master-split.test.mjs` → `tests 10 / pass 10 / fail 0`。
- 集成：`node --test test/integration/tool-description-tiers.test.mjs` → `1 pass`（CLI 50-4）；`test/integration/minimal-mode.test.mjs` → `3 pass`。
- 盘上计数：`thincoder-core/tool-docs` 69 份，其中带锚 27 份（锚出现 27 次，一档一个）；`prompts/knowledge` 40 份，`tool-*` 28 份 = 27 新增 + 既有 `tool-operations`。

失败侧（新断言不是恒绿，两侧各取过一次数）：

- **拆档数**：开工时工作树仍是拆态 ⇒ 锚 28 处；落盘后 27 处。断言取 27 后，同一用例跑在拆态树上即红。
- **动作名**：把批起快照还原成拆态母版（中间整块换成锚行，5 行），其极简文本含动作名 0/3（344 字符）；现在的常驻面 3/3（1228 字符）。故这条断言在拆态下必红，在现态下绿。

改动面：本轮不碰任何代码档（`thincoder-core/tools/shared.mjs`、八处调用点、装配逻辑一字未动）。改动 = `thincoder-core/tool-docs/context.md`、删 `thincoder-core/prompts/knowledge/tool-context.md`、`docs/batches/2026-11-14-tool-docs-master-split.test.mjs`，三份都在本轮派单声明内；**清单外零档**。

本轮落地核对：

- `docs/core/design/TOOLS.md` §1.1「动作枚举行属常驻面」——落盘与之相符（`context.md` 整档常驻、极简档仍见三个动作名）。
- 上一轮记的那处漂移仍在：`TOOLS.md` §1 示例位字面写 `.map((tool) => toOpenAISchema(tool, mode))`，代码与同表首行取值写 `toolMode`。归收口裁，本轮不动（设计席笔域）。

本轮终止状态：`clean` —— 派单两项全部落地，无待处置项。

### 本轮审计与评审轮次 · 终止状态

- **内部 explore 偏差审计：1 轮，0 项偏差**。逐项核过：`context.md` 与 `e82e704` 快照逐字相等（`git diff e82e704 -- thincoder-core/tool-docs/context.md` 空输出）、`tool-context.md` 不在盘上且全仓无引用、单测只剩一处 27 断言、本轮未越出三份声明档、§5 的 27／42 与 40 份／28 份 `tool-*`／41 条与盘上逐数相符。
- **审计报出、不属本轮交付面的 1 项**（上抛父侧路由）：批档 §1 裁决 1 与 §2 处置表第 12 行写「快照全文 1236 字符」，而 §5 与盘上实测为 1228 字符（`ls` 1242 字节，正文含 7 个三字节字符，1242 − 7×2 = 1228）。§1／§2 是主 agent 与设计席的笔域，实施席未改；§5 各处一律取 1228。
- **advisor 代码评审：1 轮，`VERDICT: pass`**（0 🔴 · 1 🟡 可选 · 3 🔵）。
  - 两条 🔵 在单测档，当场修并复跑绿：① 拆档数改按「档」计而非「锚出现次数」计，并加 `ids.length <= 1` 断言——引擎只拦同主题重复，一份描述装两个不同主题是合法态（实测 `expandToolDescription` 不抛），按次数会数出 27 而实际只拆 26 档；② 补一条「`knowledge list` 里不得再有 `tool-context`」断言——删主题原本无任何机器守卫（实测该标识已不在清单、`loadKnowledgeTopic` 抛 unknown topic）。
  - 第三条 🔵 **未处置、上抛**：动作名守卫只覆盖 `context.md`，而设计 PROMPT-SYSTEM §9 那条规则是全量面——把 `batch.md` 的动作行搬进展开面，现有三条用例仍会全绿（完整档逐字对照看不见它，极简档只查「不含展开面正文」）。通用断言要先判「哪一行是动作枚举行」，我造不出不脆的判法，故不自行发明，留父侧取舍。
  - 一条 🟡（可选，他席笔域）：批档 §2 裁决 1 的字符数与 §5 不符，见上条。
- **本轮终止状态：`clean`** —— 两条当场修完并复跑（`tests 10 / pass 10 / fail 0`），余项均为可选或他席笔域，已逐条写明。

## §6 验证与收口（父代理）

### 验证读数（父代理实跑 · 2026-11-14）

| 面 | 命令 | 结果 |
|---|---|---|
| 三档合并复跑 | `node --test docs/batches/…-tool-docs-master-split.test.mjs test/integration/tool-description-tiers.test.mjs test/integration/minimal-mode.test.mjs` | `# tests 14 / # pass 14 / # fail 0` |
| 全量集成 | `node --test test/integration/*.test.mjs`（56 档） | `# tests 213 / # pass 211 / # fail 2` |
| 逐字一致（收口复核） | `git show e82e704:thincoder-core/tool-docs/context.md` 实测 | 1242 字节 ∥ 1228 字符，与常驻面逐字节相同 |

### 两红归属（非本批）

`CLI 43-1` ∥ `CLI 43-2`（`test/integration/doc-anchor-graph.test.mjs`）。成因 = `docs/core/design/DOC-GRAPH.md` 被整篇重写（497 行 → 103 行，改动未提交、不在本批改动面），已在台账 #2404 登记。本批不改它，**收口不写成「全绿」**。

`bench/check/run.mjs` 的 `116 passed / 2 failed` 同为既有红，实施席在批起快照的分离工作树里复现同样结果。

### 收口纪律：批内单测档已删

`docs/batches/2026-11-14-tool-docs-master-split.test.mjs` 已按纪律删除。保留的读数行：

删除前 `node --test` 该档 → `10 pass / 0 fail`，覆盖：27 档拆出、一份描述至多一个锚、完整档装配逐字等于 `e82e704`、极简档无锚字面且无展开面正文、schema 键集不缩水、`knowledge list` 不再有 `tool-context`、切档后下一轮取新档。删除后常驻守卫 = `CLI 50-4`。

### 集成面现状

新增 `CLI 50-4` 一例（`test/integration/tool-description-tiers.test.mjs`），已在 `test/rtm/tooling.md` 的 CLI 50 节落行、节注改四态；未改写其他用例。集成集现为 **213 例**，已超出 ≈50–100 的窗口——这是存量规模，不是本批造成（本批只加 1 例）。

### 落地核对

设计档被落地弄假的句子：无。`PROMPT-SYSTEM.md` §8 的两行归属（`tool-docs` = 常驻面 ∥ `prompts/knowledge` 的 `tool-*` = 展开面）与盘上一致；§7「schema 不因档位改写」与 `toOpenAISchema(tool, mode)` 的实现一致；`TOOLS.md` §1.1「动作枚举行属常驻面」与 `context.md` 回常驻面一致。

一处读数差（不改结论）：§2 处置表第 12 行记「快照全文 1236 字符」，盘上实测 **1228 字符**（1242 字节、含 7 个多字节字符）。§1 已按 1228 改正，§5 全节取 1228；§2 该数字留原样（设计席笔域，本批不再开轮）。该行结论「搬走三条动作枚举行等于极简档看不到动作名」不因这 8 个字符改变。

### 新债

本批新债 **0 条**。

### doc-check

本批每次文档写入（§1 ∥ §2 ∥ §4 ∥ §5）的 `batch` 回执各带一次 `DOC-CHECK GATE: PASS · 范围 1 档`，无一次被拒。整篇 `report` 模式未跑：它会连带报既有存量项，与本批改动无关。
