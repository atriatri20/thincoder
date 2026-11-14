# 2026-11-14 · tiny-knowledge-pointer
> 六段，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 每段只有一个作者：作者的段可 `append` 加内容、可就地改（`edit`）；非作者一概拒。
> 编制：主 agent · 2026-11-14 · 来源 = 用户 2026-11-14 14:00 指出：tiny 档系统提示词里没有一句提示使用 knowledge 工具；查需求层发现 §4 ∥ §5 ∥ §9.2 三处都要求保留查询指引，实施面缺失，需补。。
> 台账 = #2413（core · 归批）。前情 = docs/batches/2026-11-14-tiny-window-cap.md（已收口 2026-11-14）。
## §1 讨论（主 agent）
**状态行**：已收口 2026-11-14
批起 sha = d730a5332351e5b68c61777578d48282003c973c
<§1 模板占位：本批条目 / 关键判据 / 授权口径>

### 本批做什么

让 tiny 档的系统提示词里出现一句明确的 knowledge 查询指引，使模型知道：细节正文按主题拆在知识库里，什么时候该去取、怎么取。

### 为什么

需求层三处都要求这件事，实施面一处也没落：

- 需求 `PROMPT-SYSTEM.md` §4：「不确定工作方法或工具约定时，先查询 knowledge，再继续行动。」同节末句「但不得省略上述义务本身」。
- 需求 §5：「tiny 不内联主题正文，只保留查询指引。」
- 需求 §9.2：「极简槽仍包含关键硬规则和 knowledge 查询指引。」

设计档 `PROMPT-SYSTEM.md` §8 内容归属表也写着「极简槽 = 必须常驻的硬规则与查询指引」。

设计档 §2 给的理由只支撑「不发锚字面」——原话「包含锚只在装配器内部使用，不发送给模型」。它没有授权「连一句散文指引也不留」。

### 已定决定

- **补一句指引，不是补回主题正文** · 用户原话：「**是的，那开工作吧，做了我继续测。**」 · 时间：2026-11-14 14:00
- **tiny 档的省钱目标不变**：指引本身要短，且不能让模型每轮都去取（取回的正文进 history，每轮重发） · 依据同上轮对话，用户原话：「有些模型很昂贵，而且对缓存命中没有多大优惠」

### 现状机制（主 agent 实读）

- `thincoder-core/prompts/common.md` 10 个锚、`discipline-normal.md` 3 个、`persona-normal.md` 0 个，共 13 处；这 13 行**全是锚本身**，母版里没有一句散文提到 knowledge 工具。
- `thincoder-core/prompt-files.mjs` 的 `expandKnowledgeTopics`：tiny 用 `/\{\{knowledge:([a-z0-9-]+)\}\}(?:\r?\n){0,2}/g` 替换成空字符串，锚连同其后至多两个换行一起删掉，不留替换文本。
- `thincoder-core/tool-docs/knowledge.md` 全文两行：一句用途 + 一个锚。展开面里的「Search only to locate: read `get` before acting on a rule」在 tiny 档随锚一起消失。
- `test/integration/tiny-mode.test.mjs` 只断言 `toolNames(tiny).includes("knowledge")`——工具在表里，不指针在位。需求 §9.2 那条「仍包含查询指引」无任何用例覆盖。

### 边界（不做）

- 不改工具集合、不改任何工具的 schema 键与 required。
- 不为 knowledge 单开一档例外——69 份工具描述刚统一成「常驻面只写一句用途」，破例会把它变回「一档一规则，除了 knowledge」。展开工具描述是另一条路，本批不走。
- 不新增每轮注入项：指引要进常驻面（进一次），不进每轮追加块。
- 不动 `CONTEXT-COMPACTION.md` 那对档，那是台账 `#2412` 的面。
- 不改窗口、压缩、越窗守卫。

### 勘察

- **库内 = 已查**：`doc_search("极简档 knowledge 查询指引 常驻内容 不得省略")` → 命中需求 §4 ∥ §5 ∥ §6 ∥ §9.2 与设计 §8 内容归属表，四节口径一致（tiny 保留查询指引）。`grep` 实读锚分布（13 处）与 `expandKnowledgeTopics` 的 tiny 分支（替换成空串）。
- **库外 = B 类**：改动面 = 本仓提示词母版、装配面与测试档；外部断言 = 零（无新依赖、不涉第三方 API 行为）。

### 授权

用户原话：「**是的，那开工作吧，做了我继续测。**」——授权开工，不含逐条确认；交付方法案由设计席给、评审席判、实施席落。

### 上抛

无。方案（指引写在哪、措辞、触发条件式的写法）留给设计席，本批不预设。

### 两条实施席必须知道的既有约束

- `test/integration/tiny-mode.test.mjs` 的 `CLI 50-1` 断言 `!tiny.system.includes("## Evidence discipline")`。指引措辞里出现任何被删主题的小节标题都会撞红。
- 若指引落在 `common.md` 常驻正文，normal ∥ engineering 也会多这一句。`CLI 50-4` 对完整档的断言与设计档「语义等价、不要求逐字复刻」的口径要一并核。

### 设计稿核对（主 agent，内容级）

- 落点成立：`thincoder-core/prompts/common.md` 现有五节（Language ∥ Who you are ∥ Instruction precedence ∥ Stop and report ∥ System interface），新增一节不带锚，tiny 支只删锚故照留——零代码改动。
- 三档可见性理由成立：`prompts/knowledge` 的主题正文在完整档内联，`core/knowledge` 的纯查询主题三档都不内联（与 `knowledge` 工具描述「Pure-reference topics are never inlined into system prompts」同向），故完整档也需要这个入口。
- 边界守住了：不搬回主题正文、不改工具集合与 schema、不加每轮注入。
- 待评审裁的一处：完整档同样多三行常驻文本。备选 `{{tiny:…}}` 专属标记被否（为一个三档都为真的句子给装配器开第二个语法出口），我认同否掉的理由；若评审认为完整档字节不可变，则须回批。

### 设计评审第 1 轮裁决（VERDICT: pass · 🔴 0 · 🟡 7 · 🔵 3）

**本轮实施必须照办（两条）**

- **#3 验收替身判据**：§2 验收里「零个 prompts/knowledge 主题小节标题（`## Evidence discipline` 为守）」不能停在一条小节标题上——别的主题正文留着它仍绿。实施时把断言改成**遍历 `thincoder-core/prompts/knowledge/` 下全部主题的标题**逐个断言不在 `tiny.system` 里。
- **#5 `CLI 50-1` 的 delta 缺两格**：补业务入口（`/tiny` 切档进极简会话）与所评估的组件交互（母版装配 × 锚展开器的极简支 × 工具面）。

**实施后由设计席补设计档（三条）**：#1 设计 §6 补需求 §6 的非功能边界（不写记忆 ∥ 不联网 ∥ 对子代理开放）；#2 设计 §5 补四槽顺序与「每槽按场景至多一份」；#7 设计 §4 的 consult/advisor 完整档规则补装配点坐标。

**主 agent 自己落（两条）**：#4 需求 §9.3 的前后体量在 §6 记录；#6 需求 §5 补一句「完整档也带这段指引」的口径。

**🔵 备注**：#8 同一档两形（`prompt-files.mjs` ∥ `thincoder-core/prompt-files.mjs`）；#9 需求 §9.1「注入缺键」与 §9.3 末条在设计 §9 验证清单无对应条；#10 完整档增一节已裁定接受（见 §4）。

## §2 批次任务与设计（eng-designer）
**状态行**：设计完成


### 覆盖条目

- 需求 `docs/core/requirements/PROMPT-SYSTEM.md` §4 末条「不确定工作方法或工具约定时，先查询 knowledge，再继续行动。」——此前实施面零落点，本批落一句常驻指引。
- 需求 §5「tiny 不内联主题正文，只保留查询指引。」
- 需求 §9.2「极简槽仍包含关键硬规则和 knowledge 查询指引。」
- 台账 #2413。

明确不做：本批不碰需求层（三处口径一致，无需改动），不改工具集合、工具描述、schema、窗口、压缩与自动注入。

### 设计档落点

`docs/core/design/PROMPT-SYSTEM.md` §2（母版两件东西：主题锚 + 不带锚的常驻查询指引，含「完整档也需要它」的理由）与 §9 极简档验证条（点名常驻查询指引在场）。设计档 §8 内容归属表「极简槽 = 必须常驻的硬规则与查询指引」由此有了实现面。

### 机制设计

1. 指引写在 `thincoder-core/prompts/common.md`，独立成节 `## Knowledge topics`，位置在 `## Language` 节末、`{{knowledge:doc-lookup}}` 锚之后：极简档最缺的就是入口，越靠前越容易被读到。锚在 tiny 里被删，该节照样留下。
2. 不带锚、不写主题标识：普通正文在 `expandKnowledgeTopics` 的 tiny 支里不被碰，锚与主题正文照旧被删。
3. 不改 `thincoder-core/prompt-files.mjs`、不改 `thincoder-core/prompt-overlays.mjs`：这是纯文本落点，装配逻辑零变。
4. 措辞不出现任何被移出主题的小节标题（`CLI 50-1` 断言 tiny 系统提示词不含 `## Evidence discipline`），也不出现 `{{knowledge:` 字面。
5. 正文逐字（三行，每行一条；每行都短于 300 字符——提示词面逐行判段）：

```
## Knowledge topics
Detailed method and tool conventions live in bundled knowledge topics, read with the `knowledge` tool.
When the method or a tool convention is unclear, query before acting: `list` shows the topic ids and titles, `search` finds topics by keyword and returns a locator snippet, `get` returns one whole topic.
A `search` hit is a locator, not the rule — read the topic with `get` before acting on it.
```

### 关键决策（含被否备选）

- **指引进 common.md 常驻正文，不新造 tiny 专属档或新锚文法** · 理由：core/knowledge 的纯查询主题在三档都不内联（需求 §5），完整档也只有经工具才能取回，所以这句话在三档都是真的，不必按档分支。**被否备选**：新标记（如 `{{tiny:…}}`，tiny 留、完整档删）——为一个句子给装配器开第二个语法出口，而它要表达的事实三档都成立。
- **完整档因此也多一节，本批接受** · 理由：需求未要求完整档带指引，但这句在完整档为真且补上了 core/knowledge 的入口；代价是 normal / engineering 各多三行常驻文本。
- **不改工具描述** · 理由：69 份工具描述的常驻面刚统一成「一句用途」（设计档 §2），为 knowledge 单开例外会把它变回一档一规则。指引属提示词面，不属工具描述面。
- **`search` 只是定位这句必须留下** · 理由：需求 §6 的 search 行写着「据此行动前必须再用 get 读取完整主题」；极简档里这条细则的展开面不在场，常驻面不写就等于删掉这条义务。

### 受影响文件与测试覆盖

| 档 | 变更 | 行数（批起快照） |
|---|---|---|
| `thincoder-core/prompts/common.md` | 增一节 `## Knowledge topics`（三行正文） | —（.md 不读数） |
| `test/integration/tiny-mode.test.mjs` | `CLI 50-1` 增两条断言：tiny 装配含该节；该节不含任何主题正文 | 247 |
| `docs/batches/2026-11-14-tiny-knowledge-pointer.test.mjs` | 本批单元测试档（收口删除） | 新 |

读数（批起快照里已在盘的代码档）：`test/integration/tiny-mode.test.mjs` = 247 内容行，量法 = `countContentLines`（`thincoder-core/agent-tools/batch-tier-gate.mjs`），`git diff --stat d730a53 -- test/integration/tiny-mode.test.mjs` 无输出 ⇒ 与批起快照一致。`thincoder-core/prompts/common.md` 是 .md，不带读数。

**受影响文件（机读清单）**

```
| 档 | 分拆方案 | 行数 |
|---|---|---|
| test/integration/tiny-mode.test.mjs | — | 247 |
| docs/batches/2026-11-14-tiny-knowledge-pointer.test.mjs | — | 新 |
```

### 验收对照（每条可判：读哪、怎样算对）

| 需求条 | 判据 |
|---|---|
| §4 末条 | 读 tiny 档装配出的系统提示词：`## Knowledge topics` 节在场，且说出「方法或工具约定不确定时先查 knowledge」 |
| §5 | 同一装配结果里零条 `{{knowledge:` 字面、零个 prompts/knowledge 主题小节标题（`## Evidence discipline` 为守） |
| §9.2 | tiny 主代理与 tiny 子代理两条装配都含该节；三档工具面仍含 knowledge 工具，schema 键集不变 |
| §9.1 | normal 与 engineering 装配仍四槽同序，工具集合与 schema 不变；新增的三行是唯一差异 |
| §2（需求） | 三档语义不因本批互相冒充：极简档短、完整档全 |

读者侧判法（文档面）：`docs/core/design/PROMPT-SYSTEM.md` §2 第 2 段与 §9 极简档验证条，读起来必须能回答「这句指引写在哪、为什么完整档也有、为什么不开 tiny 专属文法」；答不上即未过。

### 用例面（集成 delta，对 `test/RTM.md`）

- 改写：`CLI 50-1`（「mode command changes the next real request, narrows three injections and survives slot restore」）——增一条断言，读装配后的 `tiny.system`，要求含 `## Knowledge topics` 且不含主题正文。需求 §9.2 那条「仍包含查询指引」此前无任何用例覆盖，本条把它接上。
- 删除：零条。
- 新增：零条（不新开编号：`CLI 50-1` 已是本故事的入口用例，断言落在这里不需第二个场景）。

断言读的是装配出的系统提示词（产品行为），不读 `common.md` 文件字面，措辞改写不误红。

### 勘察与先例

- 台账本板块 9 行全为已核销或已废弃，无与本机制同落点的在途行；本批行 #2413 为唯一在途。
- 锚分布实读：`thincoder-core/prompts/common.md` 10 处、`discipline-normal.md` 3 处，全部是裸锚，母版里没有一句散文提到 knowledge 工具——这就是缺口本身。
- 先例 `#106` 曾记录 `common.md` 节数被 `thincoder-cli/test/prompts-dual-source.test.mjs` 的 T-CL1 计数守住；本批实读 `docs/core/design/prompts/` 目录与 `thincoder-cli/test/prompts-dual-source.test.mjs` 均已不在盘，节数守卫随双源面一并消失，本批增节不触发计数连带。
- 最接近先例三问（新落点 `## Knowledge topics`）：现成位置 = `common.md` 现有五个 `##` 节之外无知识工具节；现成名字 = 无；消费者 = 三档装配与全部子代理。结论：`已查无`，新建一节。
- §1 点名的 `CLI 50-4` 已核：它住在 `test/integration/tool-description-tiers.test.mjs`，判的是三档工具描述（常驻面 ∥ 展开面），不读系统提示词正文；本批增的是提示词面，撞不到它。设计档「语义等价、不要求逐字复刻」那条管工具描述，本批不改工具描述。

### 上抛

无。用户已授权开工（§1「授权」），方案面由本席落、评审席判。

## §3 设计评审（评审子代理）
**状态行**：评审通过



### 轮次 1（评审子代理）

评审对象 = `docs/core/design/PROMPT-SYSTEM.md`（全档）∥ `docs/core/requirements/PROMPT-SYSTEM.md`（全档），对照批档 §1 ∥ §2 全文。轮次 1：全量审 + 处置 §1 待裁项。

| # | 严重度 | 状态 | 证据 |
|---|---|---|---|
| 1 | 🟡 | 建议 | 设计 §6 只到「并在 tiny、normal、engineering 三档工具表中提供」；需求 §6「工具对主代理和子代理开放，不写 personal、project 或 team 记忆，不需要嵌入服务或外部网络。」在设计档无落点 |
| 2 | 🟡 | 建议 | 设计 §5 只有 mode 的用途枚举与切换后行为；需求 §3「完整档保持以下固定顺序：」的四槽与「每槽按场景至多一份，缺槽按当前规则处理。」在设计档无落点，需求 §9.1「四槽组成与顺序不变」读不到可判句 |
| 3 | 🟡 | 建议 | 批档 §2 验收对照 §5 行「零个 prompts/knowledge 主题小节标题（`## Evidence discipline` 为守）」——一条小节标题代全体主题正文，别的主题正文留着它仍绿 |
| 4 | 🟡 | 建议 | 需求 §9.3「记录系统提示词与完整请求的修改前后体量；不以字符数代替真实 token 或业务成功率。」；批档 §2 无前后读数，设计 §7「体量分四项分别测量——系统提示词、工具声明、自动注入、完整请求——不互相冒充。」也不带前后对 |
| 5 | 🟡 | 建议 | 批档 §2 用例面「改写：`CLI 50-1`」只给需求回指（§9.2）与结果（「要求含 `## Knowledge topics` 且不含主题正文」），缺业务入口与所评估的组件交互 |
| 6 | 🟡 | 建议 | 设计 §2「指引是普通正文，三档装配都看得见」vs 需求 §4 节名「极简档常驻内容」与需求 §5「tiny 不内联主题正文，只保留查询指引。」——需求层无一字记下完整档新增一节（跨档滞后，报不改） |
| 7 | 🟡 | 建议 | 设计 §4「工具面同一口径：advisor 与 consult 装配的工具描述取完整档，不随会话 mode 变化」无装配点或符号，读者据它定位不到判定处 |
| 8 | 🔵 | 备注 | 同一档两形：设计 §1「prompt-files.mjs 以 import.meta.url 定位」vs 设计 §2「`thincoder-core/prompt-files.mjs` 的 `expandKnowledgeTopics`」 |
| 9 | 🔵 | 备注 | 需求 §9.1「overlay、注入缺键和未知锚仍按现有规则处理。」与 §9.3「未使用目标小上下文模型实测时，不宣称已经证明其任务成功率提升。」在设计 §9 验证清单无对应条 |
| 10 | 🔵 | 已裁 | §1 待裁项（完整档多三行）判可接受：需求 §9.1 所钉两项不变量（四槽组成与顺序 · 工具集合与参数 schema）不因 common.md 增一节而变；口径滞后见 #6 |

VERDICT: pass

计 0 🔴 · 7 🟡 · 3 🔵（#10 为 §1 待裁项的裁定，不计入缺陷数）

### 轮次 2（评审子代理）

评审对象 = 实施面（`thincoder-core/prompts/common.md` ∥ `test/integration/tiny-mode.test.mjs` ∥ `docs/batches/2026-11-14-tiny-knowledge-pointer.test.mjs` ∥ `test/rtm/tooling.md` 50-1 行），对照设计 ∥ 需求 `PROMPT-SYSTEM.md` 与批档 §2。全量审一轮。

| # | 严重度 | 状态 | 证据 |
|---|---|---|---|
| 1 | 🟡 | 建议 | 常驻用例只断到极简主代理与完整 normal 档；「极简子代理」与「engineering 档」的指引在场断言只活在批内测试档（其头部自述收口删除）——设计 §9 验证清单点名「极简主代理与子代理角色矩阵」；佐证 = 批内档 `const child = systemOf("explore", "tiny")` ∥ 常驻档 CLI 50-2 子代理分支只断 `## Evidence discipline` 缺席 |
| 2 | 🟡 | 建议 | RTM 50-1 判据②写「触发句逐字在场（方法或工具约定不确定时先查 knowledge）」，括号是中文释义而用例断的是英文原句——按「逐字」去核中文串会找不到 |
| 3 | 🔵 | 备注 | RTM 50-1 判据③只写 `prompts/knowledge` 主题标题，用例经 `listKnowledgeTopics()` 覆盖两类目录（含 core/knowledge），口径比判据宽 |
| 4 | 🔵 | 备注 | CLI 50-1 主题遍历断言的是 `topic.title`，正文内联而标题被改仍绿；将来某主题标题若是常见短语则误红——建议并断正文首行 |
| 5 | 🔵 | 备注 | 批内档取该节正文用 `indexOf("\n\n", indexOf(POINTER_HEADING))` 切片，节成末节时得 -1 会静默截一字（该档收口删除，风险仅限本批） |

VERDICT: pass

计 0 🔴 · 2 🟡 · 3 🔵

## §4 用户批准（主 agent）

## 用户批准

设计评审第 1 轮判 **pass**（0 🔴 · 7 🟡 · 3 🔵，凭证已签发）。用户授权原话：「**是的，那开工作吧，做了我继续测。**」

- **自动推进**：本批余下全链（实施 → 验证 → 收口）不需逐步确认，授权同上 · 自 2026-11-14 · 用户原话：「**是的，那开工作吧，做了我继续测。**」
- **批准范围**：`common.md` 增一节常驻查询指引、`CLI 50-1` 增断言、批内单测档新建。不含代码改动、不含装配器语法扩展（`{{tiny:…}}` 备选未采纳）。
- **完整档增一节已裁定接受**（评审第 10 条）：需求 §9.1 所钉两项不变量（四槽组成与顺序 · 工具集合与参数 schema）不因 `common.md` 增一行节而变。

## §5 实施记录（eng-coder）

### 交付摘要（eng-coder · 2026-11-14）

改动四处：三处在本批声明清单内，一处出清单（`test/rtm/tooling.md`，理由见「偏离与披露」）。

| 档 | 变更 | 需求落点 |
|---|---|---|
| `thincoder-core/prompts/common.md` | 增常驻节 `## Knowledge topics`（标题 + 三行正文，逐字取自本档 §2 围栏块），位置 = `## Language` 节末、`{{knowledge:doc-lookup}}` 锚之后 | 需求 §4 末条 ∥ §5 ∥ §9.2 |
| `test/integration/tiny-mode.test.mjs` | `CLI 50-1` 增断言：极简档含该节与触发句；完整 normal 档含该节；逐个主题断「标题与整段正文都不在极简档」 | 需求 §9.2 ∥ §9.1 |
| `docs/batches/2026-11-14-tiny-knowledge-pointer.test.mjs` | 本批单元测试档（4 条，收口删除） | 改动面反馈环 |
| `test/rtm/tooling.md` | 分册行 `CLI 50-1` 改写：业务入口（`/tiny` 切档进极简会话）+ 所在组件交互（母版装配 × 锚展开器极简支 × 工具面）+ 判据随用例重写 | 设计评审第 1 轮 #5 |

零代码改动：`thincoder-core/prompt-files.mjs` ∥ `thincoder-core/prompt-overlays.mjs` 未动，装配逻辑零变（本档 §2 机制设计 3）。该节的可见性来自 `expandKnowledgeTopics` 的极简支只删锚、不碰普通正文。

### 验收对照（逐条给出读数）

| 条目 | 判据 | 实施读数 |
|---|---|---|
| 需求 §4 末条 | 极简档装配含 `## Knowledge topics`，并说出方法或工具约定不确定时先查 knowledge | 单元测试 1 ∥ `CLI 50-1` 均断该节 + 触发句，绿 |
| 需求 §5 | 同一装配零条 `{{knowledge:` 字面、零个主题标题 | 单元测试 1/2/3 ∥ `CLI 50-1` 遍历 83 个主题逐个断（标题与整段正文），绿 |
| 需求 §9.2 | 极简主代理与极简子代理两条装配都含该节；三档工具面仍含 `knowledge`、schema 不变 | 单元测试 2 断 `explore` 极简装配；`CLI 50-2` 断子代理工具面含 `knowledge`；`CLI 50-4 ∥ 50-5` 断三档 schema 键集与逐字相等，全绿 |
| 需求 §9.1 | 完整档四槽同序、工具集合与 schema 不变；新增三行是唯一差异 | 零代码改动 + 槽序读数（persona 起点 < `## Knowledge topics` < discipline 起点）；单元测试 4 断 normal ∥ engineering 该节逐字同形 |
| 需求 §2 | 三档语义不互相冒充 | 极简档短（主题正文全删、指引在场），完整档全（主题正文内联 + 同一句指引）；单元测试 3/4 分别守住两侧 |

### 决定与偏离披露

- **出清单档 `test/rtm/tooling.md`，理由**：设计评审第 1 轮 #5 把「`CLI 50-1` 的 delta 缺业务入口与所评估的组件交互」列为本轮必办；该 delta 的行本体住分册（`test/RTM.md` 只是索引，CLI 50 的行细则在 `test/rtm/tooling.md`），故落在分册行，索引未动。同处顺手修掉该行原判据「完整档内容不变」——本批后完整档多一节，原句不再成立，换成语义口径且与用例实断一一对应的判据。
- **主题遍历的口径是两类目录**：`listKnowledgeTopics()` 覆盖 `prompts/knowledge` 与 `core/knowledge`，比评审 #3 点名的 `prompts/knowledge` 更宽；纯查询主题在三档都不内联，多断它们不产生假红，且正对需求 §9.1「纯查询知识不进系统提示词」。
- **未做（批外）**：评审 #1 ∥ #2 ∥ #4 ∥ #6 ∥ #7 是设计席与主 agent 的笔，本席未动；本档 §2 边界里「不改工具描述、不改工具集合与 schema、不加每轮注入」逐条守住。
- **待父侧裁的一处覆盖落差**：常驻套件里「极简子代理」与「engineering 档」的指引在场只由批内档断（收口删除），设计 §9 验证清单点名「极简主代理与子代理角色矩阵……常驻查询指引在场」。本档 §2 用例面写的是「新增：零条、断言落在 `CLI 50-1`」，故未把该断言塞进 `CLI 50-2`（那会给出第二个场景）。是否需要长期覆盖，请父侧定；本席不自行扩面。

### 审计与评审轮次（终态 = 收敛）

- **内部勘察分叉审计**（explore 只读，1 轮）：1 🟡 · 5 🔵 · 0 🔴。修掉：① 🟡 RTM 行判据有两格超出常驻用例实断范围（改成与 `CLI 50-1` 实断一一对应）；② 🔵 主题遍历空集可绿（加非空守卫）；③ 🔵 批内档注释与代码不符（「摘要」→「系统提示词」）。另两条 🔵 转为本段「偏离披露」与「待父侧裁」。
- **内部代码评审**（advisor 同步，轮次 2 已记入 §3）：0 🔴 · 2 🟡 · 3 🔵，VERDICT pass。五条全部落地：判据②的中文释义改成英文原句；判据③口径改成两类目录；判据把「标题不在场」补成「标题 + 整段正文都不在场」；批内档取节正文改为先判边界再切片。修后重跑两档全绿。
- 修正轮次共 2 轮，第 2 轮无新增发现，终态 `clean`。

### 验证读数（本席实跑）

- `node --test docs/batches/2026-11-14-tiny-knowledge-pointer.test.mjs` → 4/4 pass。改前同档 3/4 fail（红在「极简主代理含该节」「极简子代理含该节」「完整档含该节」），即判据能红。
- `node --test test/integration/tiny-mode.test.mjs` → 4/4 pass。改前 `CLI 50-1` 红在新加的「完整档含该节」，改后绿。
- `node --test test/integration/tool-description-tiers.test.mjs` → 2/2 pass（`CLI 50-4` ∥ `CLI 50-5`，工具描述档不受本批影响）。
- 空集反证：同一条遍历判据跑在 `normal` 完整装配上命中 13 个主题，跑在极简档上 0 个——该判据不是每次都绿。
- 槽序读数：`normal` 装配里 persona 起点早于 `## Knowledge topics`，后者早于 `discipline-normal` 起点，四槽序未变。
- `doc_check(mode:"gate")` → `DOC-CHECK GATE: PASS`（`thincoder-core/prompts/common.md` ∥ `test/rtm/tooling.md`）。
- 集成 delta：改写 1 条（`CLI 50-1`），新增 0 条、删除 0 条，符合本档 §2 用例面口径。
- 本批单元测试档 = `docs/batches/2026-11-14-tiny-knowledge-pointer.test.mjs`（收口删除）；集成运行 = 父侧收口那一次，本席未跑全量套件。

### 落地核对

**落地核对：无**（本次落地未使任何设计/需求档语句失真；设计 §2「母版与知识相关的有两件东西：主题锚，和一段不带锚的常驻查询指引」与需求 §5/§9.2 由本次落地补上实现面，落前已由设计席写入，故无需回写。）

## §6 验证与收口（父代理）

## 验证与收口

### 收口验证（父侧实跑，不采信交付报告）

| 面 | 命令 | 结果 |
|---|---|---|
| 批内单测 | `node --test docs/batches/2026-11-14-tiny-knowledge-pointer.test.mjs` | tests 4 · pass 4 · fail 0 |
| 本批集成 | `node --test test/integration/tiny-mode.test.mjs` | tests 4 · pass 4 · fail 0 |
| 工具描述档回归 | `node --test test/integration/tool-description-tiers.test.mjs` | tests 2 · pass 2 · fail 0 |
| 全量集成 | `node --test test/integration/*.test.mjs` | tests 215 · pass 213 · fail 2 |

两红为 `CLI 43-1` ∥ `CLI 43-2`（`doc-anchor-graph.test.mjs`），归台账 `#2404`，非本批引入。

### 装配读数（父侧独立跑 `assemblePrompt`）

| 项 | tiny | 完整档 |
|---|---|---|
| 系统提示词字符 | **20,771**（本批前 20,352） | 112,447（本批前 112,028） |
| 含 `## Knowledge topics` | **true** | true |
| `knowledge` 出现次数 | **2**（本批前 **0**） | 4 |
| 残留锚 `{{knowledge:` | 0 | 0 |
| 含 `## Evidence discipline` | false | — |
| 槽序（persona < 指引 < discipline） | 成立 | 成立 |

增量 419 字符 = 新增一节（标题 + 三行正文）。这是本批唯一的行为面差异。

### 文档门

`doc_check(mode:"gate")` 对四档 → `DOC-CHECK GATE: PASS`。

### 落地核对

**落地核对：无。** 设计 §2「母版与知识相关的有两件东西：主题锚，和一段不带锚的常驻查询指引」与需求 §4 末条 ∥ §5 ∥ §9.2 的句子，与盘上实现逐条相符，未产生任何使设计或需求语句失真的落地。

### 台账

- 覆盖账 `#2413` → 本笔结算为 **已核销**。
- **本批新债 1 条**：`#2414` —— 常驻集成套件缺「极简子代理 ∥ engineering 档」的指引在场断言（现只由收口即删的批内档守）。触发 = 下一批动提示词槽或极简装配时捎带。

### 一处父侧判断错误（留痕）

`#2412` 收口时我给出的处置句「标题文本计入固定开销（system）」与代码相反：`contextUsage` 的 overhead 只有 `system` 与 `tools`，`assemblePrompt` 入参不含 agent，标题预算在 `generate-title.mjs` 的 `MAX_TITLE_TOKENS` / 40 字符截断。设计席上抛后按实测改正。记在这里是为了让以后读这段的人知道那句错误建议存在过。
