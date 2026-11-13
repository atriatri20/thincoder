# 2026-11-14 · tool-docs 母版与按档装配
> 六段，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 每段只有一个作者：作者的段可 `append` 加内容、可就地改（`edit`）；非作者一概拒。
> 编制：主 agent · 2026-11-14 · 来源 = 用户 2026-11-14 原话「结论一不要管了，只管结论二的事儿。」∥「我希望按照当时的设想做。」∥「修。后续自动跑吧，跑完你就开工工具面的修改。」。
> 台账 = #2406（core · 归批）。前情 = 无（独立批）。
## §1 讨论（主 agent）
**状态行**：进行中（tool-docs 母版与按档装配 · 设计席 #22 在跑 · 台账 #2406）
批起 sha = e82e704beb6d63269366dbe00758a4deddbc454e
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

## §2 批次任务与设计（eng-designer）
**状态行**：设计完成（第 1 轮评审 13 项已处置：六个调用点逐名列表与各自档位、机读清单补两行新建档、最近先例/勘察证据/三问、advisor 取完整档、宿主行级改写规则、E4 取数面、极简目标文本、知识面读取成本；预估句与「装配点两处」已删）

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

壳的落点 `existing: thincoder-core/tools/shared.mjs · name: "toOpenAISchema" · consumers: 下方六个调用点`。主题标识 `none found:`——已查 `prompts/knowledge` 13 份 + `core/knowledge` 1 份，无 `tool-*` 标识，故 28 个新标识不与现有撞车。

### 机制设计（摘要，规则本体在设计档）

工具体对象在登记期构造，档位却在每次 `prepareRun` 现读，所以展开必须发生在装配期：`DESC(name)` 继续返回母版原文（含锚），`toOpenAISchema(tool, mode)` 在拼 schema 时按 mode 展开。规则本体 = 设计 TOOLS §1（装配点表、mode 必填、行级改写规则）与设计 PROMPT-SYSTEM §2 §7。

展开复用 `prompt-files.mjs` 的 `expandKnowledgeTopics`，不新造第二套。工具面经 `expandToolDescription(text, mode)` 薄壳调用，校验 mode 后转交；`tools/shared.mjs` 只多一次调用，避免把 494 行的档推过 500 线。

语法细节：`expandKnowledgeTopics` 第二参是对象 `{ minimal }`，薄壳据此把 mode 翻成布尔，不把 mode 字符串直接传进去。

**六个调用点与各自传的档**（全仓 `toOpenAISchema` 调用点逐名核准；`thincoder-vscode/src/tools/index.mjs` 只 re-export，不调用）：

| # | 调用点 | 现状写法 | 本批传哪一档 | 依据 |
|---|---|---|---|---|
| 1 | `thincoder-core/agent/setup.mjs` prepareRun | `const toolSchemas = tools.map(toOpenAISchema)` | 会话现读 mode，取自同函数 `const mode = resolveWorkMode(agent.config?.agent)` | 主链按档装配 |
| 2 | `thincoder-core/advisor/loop.mjs` `advisorToolsFor` | `schemas: tools.map(toOpenAISchema)` | 完整档 `"normal"`，不读会话 mode | requirements §9.1「完整档工具描述和 consult/advisor 独立基底不被极简装配改写」；设计 PROMPT-SYSTEM §4 同口径 |
| 3 | `thincoder-server/src/agent/chat-env-tools.mjs` `createEnvTools` | `core.toOpenAISchema(toolOf[name])` | `"normal"` | 环境工具面不经极简装配；可见文本与本批改造前一致，接极简不在本批范围 |
| 4 | `bench/check/toolcall.check.mjs` | `builtinTools.map(toOpenAISchema)` | `"normal"` | 对照面 = 产品面实面逐字 = 改造前全文 |
| 5 | `bench/toolcall/variants.mjs` | `const tools = builtinTools.map(toOpenAISchema)` | `"normal"` | 同上 |
| 6 | `prompt-fixture/tools.mjs` | `.map((name) => toOpenAISchema(DECLARED_TOOLS[name]))` | `"normal"` | 同上 |

后四面的 `"normal"` 不是把它们当普通模式会话，而是取完整档装配结果——也就是改造前的唯一文本，故这四处零行为变化。

`map(toOpenAISchema)` 这五处现状写法本批必须一并改写成 `.map((tool) => toOpenAISchema(tool, mode))`：`map` 的第二手参是下标，会被当成 mode，首个元素即因取值非法而抛——mode 一必填，这几处就是最先炸的地方。

顺序 = 先展开、后 `applyPromptInjections`：端侧注入值因此不会被当成主题锚二次展开。

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
| 12 | context.md | 拆 | `tool-context`——三动作行为、compact 的失败回落背景 |
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

本表 69 行 = 拆 28 行 + 不拆 41 行。判「拆」的 28 档对应 28 份新主题，主题 id 全为 `tool-<档名>`（`_` 换 `-`）；判「不拆」的 41 档整档留作常驻面，不含锚，不进遍历集。

**对照基准写死**：所有「改造前」「原文」的读数一律取批起快照 `e82e704` 上的档（`git show e82e704:thincoder-core/tool-docs/<档名>.md`），不取工作树当前文——用改后的档自比自会恒等通过。

表与快照一致性的读数（实施轮可重跑）：`git ls-tree -r --name-only e82e704 -- thincoder-core/tool-docs` 得 69 个路径，与工作树 `*.md` 逐名比对差集为空，故本表的档名与正文即快照上的档名与正文。开工时 `knowledge list` 共 14 条主题（`prompts/knowledge` 的 13 份 + `core/knowledge` 的 `prompt-resources`），无 `tool-*` 主题 ⇒ 本批 28 个新主题 id 与现有标识不撞车。

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

非代码档（`.md`，不计行数读数）：`docs/core/design/PROMPT-SYSTEM.md` · `docs/core/design/TOOLS.md`（本段作者已改）；`thincoder-core/tool-docs/*.md`（被拆的档，按上节判据）；`thincoder-core/prompts/knowledge/tool-*.md`（新建 28 份，一份被拆的档一条）。

`thincoder-vscode/src/agent/tool-table.mjs` 不在改动面：`- action:'panel'` 行留在常驻面，既有过滤继续生效（设计 TOOLS §1.1）。

**单测档**：`docs/batches/2026-11-14-tool-docs-master-split.test.mjs`（与批次档同名、同目录，收口期删除）。跑法 = `node --test docs/batches/2026-11-14-tool-docs-master-split.test.mjs`。

**集成用例档**：`test/integration/tool-description-tiers.test.mjs`，承载 `CLI 50-4`。

单元面要守的失败侧（不是只守 happy path）：

1. 一份描述在完整档下渲染 = 批起快照 `e82e704` 上该档全文逐字（对照读取 = `git show e82e704:<档>`，不是工作树当前文）。
2. 同一份描述在极简档下渲染不含锚、不含展开面正文；目标文本按设计 PROMPT-SYSTEM §7 判，不按尾空行判。
3. 锚指向不存在的主题 ⇒ 抛；同一描述里同一主题锚出现两次 ⇒ 抛。
4. `toOpenAISchema(tool)` 不带 mode ⇒ 抛并点名 `mode`；mode 取值不在三档内 ⇒ 抛。
5. `.map(toOpenAISchema)` 形态（下标被当 mode）⇒ 抛——守住这个错法不会被写回来。

### 验收对照（逐条回需求，读者可判）

| 条目 | 判据 | 谁判、判什么 |
|---|---|---|
| E1 | 上表 69 行逐行成立：判「拆」的每档都有一条同名主题，主题正文与批起快照 `e82e704` 上该档对应段落逐字相等；判「不拆」的每档整档留在盘上、全文无锚 | 实施轮按表逐档判，不抽样；对照文本用 `git show e82e704:thincoder-core/tool-docs/<档名>.md`，不用工作树当前文；`knowledge list` 作交叉核对（无缺、无多） |
| E2 | 改造前后各渲染一次全部工具描述，字符串相等；「改造前」一侧取批起快照 `e82e704` 的档 | 比对输出；任一份不相等即不成立 |
| E2b | 主链之外的四个装配面（advisor、server 环境面、bench 两处、prompt-fixture）经薄壳后文本与本批改造前一致 | 逐面渲染一次比对；四个面都不随会话档位变化 |
| E3 | 极简档工具 schema 里无锚字面、无展开面正文；工具名集合与每个 schema 的键集与批起快照 `e82e704` 上的同一集合相同 | 键集对照，不看条数 |
| E4 | 四项各有读数并列，不合成一个数；工具声明一项取 `toOpenAISchema(tool, mode)` 输出的 `function.description` 串长之和，不取 `scripts/tool-schema-size.mjs` 的现量（那量的是含锚母版，两档都不是这个数） | 读报表，四项能否分别指出，并指出取数面 |
| 切档 | 运行中切换 mode 后，下一次 prepareRun 的 toolSchemas 用新档，历史消息不改写 | 设计 PROMPT-SYSTEM §5；切一次、再取一次渲染文本 |
| 打包 | 28 份 `tool-*` 主题随 `@thincoder/core` 包，VSIX 与 Desktop 物化后 `knowledge get` 可取回 | requirements §9.3；三面各取一份主题 |
| 边界 | schema（必填 ∥ 枚举 ∥ 校验）与工具集合零改动：与批起快照 `e82e704` 上的 schema 比对，差集为空 | 改造前后 schema 比对，差集为空 |

### 集成增量（对 `test/RTM.md`）

- **加**：`CLI 50-4`——三档工具描述。编号先在 `test/RTM.md` 的 CLI 50 故事里设立，再写用例标题；落档 = `test/integration/tool-description-tiers.test.mjs`。
  - 需求回指：requirements PROMPT-SYSTEM §7（描述分档）与 §9.3（打包面）。
  - 业务入口：一次 minimal 会话的进入点——`resolveWorkMode` 取到 minimal 后装配工具表。
  - 评估的组件交互：`toOpenAISchema(tool, mode)` 的分档展开 ∥ `knowledge` 工具的 `get` 取回；断言的是模型看不到展开面正文、经 `get` 拿得到同一份正文，以及完整档下一次装配的文本等于改造前全文。
- **改**：无。`CLI 50-1`（模式切换与三项注入收窄）与 `CLI 50-2`（knowledge list/search/get）断言的面不被本批改动。
- **删**：无。

### 关键决策（含被否方案与试的理由）

1. **复用 `{{knowledge:}}` 锚与 `expandKnowledgeTopics`，不新造展开器。** 否掉的：给工具描述另立一套展开语法——两套展开器各有各的失败面，逐字一致那条规则要在两处各写一遍，漂一处就查不出。
2. **展开面主题放 `prompts/knowledge`（可内联那类），不放 `core/knowledge`。** 完整档会把它装进工具声明，那本身就是内联；放进纯查询目录，与设计档「core/knowledge 三档都不内联」当场矛盾。
3. **装配期展开，不在 `DESC` 里展开。** 否掉的：`DESC` 里按档展开——工具对象在建表时构造，档位会冻在首轮，会话中途切档后模型继续读旧档文本，而错处要到它按旧文本行事时才显形。
4. **`mode` 必填、不给缺省。** 缺省会让一次运行悄悄用上另一档的文本；错的是被替换的值，暴露的是三层之外的空结果。
5. **主题文件不以换行结尾。** 这是逐字一致的第三个条件，不是洁癖：`expandKnowledgeTopics` 在完整档只替换锚、不吞换行，主题末尾多一个换行就多一行空行。先例读数 = `prompts/knowledge/doc-lookup.md` 末字节非换行、`prompts/common.md` 末为换行。
6. **主链之外四个装配面显式传完整档，不猜会话档位。** 否掉的：让 server / bench / prompt-fixture 各自读会话 mode——这三面都没有会话档位可读，猜出来的值是没人选过的档；而完整档装配结果就是改造前唯一的文本，传它即零行为变化。
7. **advisor 与 consult 的工具描述取完整档，不随会话 mode 变化。** 依据 requirements §9.1「完整档工具描述和 consult/advisor 独立基底不被极简装配改写」——独立基底被极简改写，那条就当场不成立。否掉的：advisor 也跟会话 mode（要改需求，不在本批）。
8. **被端面行级剔除的 `- action:'panel'` 行留常驻面。** 否掉的：改宿主过滤去匹配展开后的文本——装饰层在展开之前，看不到展开结果，改了也不生效。代价是 `subagent.md` 的常驻面比纯内容判据多一行，换来端差剔除继续成立。
9. **极简目标文本含尾空行，不追加清理。** 否掉的：为极简结果加一次行尾改写——多一处改写就多一个逐字一致的失败面，而尾空行不影响判据（无锚、无展开面正文）。

### 上抛项

- **[上抛·知会]**「工具描述暂不随 minimal 改写」这句旧口径在 `docs/core/design/PROMPT-SYSTEM.md` §7 仍活着（需求档已改成分档口径），本批已在设计档 §7 换成现行口径。需求档与设计档之间不再有第二份旧句。

## §3 设计评审（评审子代理）

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

## §4 用户批准（主 agent）
## §5 实施记录（eng-coder）
## §6 验证与收口（父代理）
