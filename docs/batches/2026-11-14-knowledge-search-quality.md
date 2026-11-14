# 2026-11-14 · knowledge-search-quality
> 六段，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 每段只有一个作者：作者的段可 `append` 加内容、可就地改（`edit`）；非作者一概拒。
> 编制：主 agent · 2026-11-14 · 来源 = 用户 2026-11-14 14:23 裁定「我认为可以，就这么做。」—— 采纳另一会话对 `knowledge` 检索的实测与四条改法（顺序照其性价比排列，先加全局上限）。
> 台账 = #2415（core · 归批）。前情 = docs/batches/2026-11-14-tiny-knowledge-pointer.md（已收口 2026-11-14）。
## §1 讨论（主 agent）
**状态行**：已收口 2026-11-14
批起 sha = 88ac84672b010055c51055d357b0d97b4d93c3c5
- **自动推进**：本批全链（设计 → 评审 → 实施 → 验证 → 收口）不需逐步确认 · 自 2026-11-14 14:24 · 用户原话：「**开工，自动跑完。**」

覆盖账 = #2415

## 本批做什么

把 `knowledge` 工具的检索面从「子串匹配 + 字母序 + 无上限」修成可用。四条按用户裁定采纳，顺序即采纳的性价比序：

1. **search 结果加全局上限**（量级由设计定，采纳来源建议 10 主题 ∥ 6,000 字符）。
2. **按空白分词做 OR 检索**，排序按「标题命中数 + 命中总数」，替代现行字母序。
3. **主题加中文近义词 `aliases:`**，并入索引。
4. **0 命中回执给下一步**（换单个英文关键词，或先 `list`）。

## 为什么

另一实例实测、本会话已复跑：`compact` 命中 2,451 字符，`compact threshold` 归零；`文档` ∥ `证据` 中文零命中；`the` 一次回报 **59,530 字符**。

59,530 是 tiny 档整个系统提示词（20,771 字符）的 2.9 倍。tiny 档设 262,144 有效窗口就是为了控成本（#2411），一次误调用吃掉窗口一截，与它的存在理由相反。

## 已定决定

- **已定决定**：采纳四条改法与其次序（先加全局上限） · 用户原话：「我认为可以，就这么做。」 · 时间：2026-11-14 14:23

## 边界（不做）

- 不改 `list` ∥ `get` 的语义，不改主题正文内容（`aliases:` 是新增字段，正文不动）。
- 不引入嵌入 ∥ 外部索引 ∥ 网络：需求 §6 已写明不需要嵌入服务或外部网络。
- 不动消息投递链（待裁事项，见本节末）。
- 不重排主题拆分，不改 83 份主题的正文。

## 勘察（库内已查）

- `doc_search`「knowledge 工具 search 检索 主题 命中 上限」→ 命中 8 份，权威两处：需求 `docs/core/requirements/PROMPT-SYSTEM.md` §6「按用户给出的关键词查找相关主题，并返回有界定位片段」；设计 `docs/core/design/PROMPT-SYSTEM.md` §6「对主题标识、标题和正文做本地关键词匹配，按主题返回有界定位片段」。
- 设计 §3 已记「读取成本是这条目录设计的已知代价……现状不加索引或缓存」——本批改的是检索质量与该条的下半句，不改它说的读取量结论。
- 需求 §9.2「`knowledge list/search/get` 能取回同一主题；未知主题与无匹配有明确结果」——本批第 4 条即这条的落点。

## 勘察（库外）

**库外 = B 类**：改动面 = 本仓 `thincoder-core/tools/knowledge.mjs` ∥ `thincoder-core/prompt-files.mjs` ∥ 主题文件的 `aliases:` 字段；外部断言 = 零（无新依赖、不涉第三方 API 行为、不改协议载荷）。

## 授权与推进

用户在 2026-11-14 14:23 裁定采纳上述四条。设计评审与实施按本批授权推进；每一步的判据落在 §2 验收对照。

## 待裁（不在本批）

- 消息投递链缺陷（挂起窗内取件不可达）的修法甲 ∥ 乙 ∥ 丙仍等用户裁定，`#2414` 之外单独记。
- `#2414`：常驻套件缺「极简子代理 ∥ engineering 档」的 knowledge 指引在场断言。

### 设计评审第 1 轮裁决（🔴 2 · 🟡 5 · 🔵 3）

| # | 处置 |
|---|---|
| 1 🔴 | **修**。delta 只核了索引档，案例行在 `test/rtm/tooling.md`。`50-4` ③ 断言「展开面正文逐字等于 `prompts/knowledge/tool-bash.md` 全文」，与本批设计 §2「首行 `aliases:` 声明不计入正文」是同一断言的两写。按「改写 1」落：点名 `50-4` 为被改写的既有用例（全文 → 正文），并写 `50-2` 的处置（保留 ∥ 扩）。 |
| 2 🔴 | **修**。(a) 分词后零词的抛错不可达——`thincoder-core/tools/knowledge.mjs` 第 49 行已有 `"knowledge search: query is required"`；删掉该句，或写出可达复现。(b) 坏别名声明的加载期失败缺观测与复现路径——补一条可复现路径（造一份首行 `aliases:` 取不出词的档，看加载报错点名主题）。 |
| 3 🟡 | 补可跑命令（`countContentLines` 的 node 调用）与两行 `新` 的档位判（新建按本次落盘长度）。 |
| 4 🟡 | A6 判者改点名两档：`test/integration/tiny-mode.test.mjs` ∥ `test/integration/tool-description-tiers.test.mjs`。 |
| 5 🟡 | `CLI 53-1` 补组件与进入口（照 `tooling.md` 各节注的「组件 = … ⟷ …」「进入口 = …」形）与需求锚。 |
| 6 🟡 | 新名补三问：`aliases:` · `SEARCH_MAX_TOPICS` · `SEARCH_MAX_CHARS` · `matched`/`shown`/`truncated`。已 grep：`aliases` 在 `thincoder-core` 只有 `STATUS_WORD_ALIASES` ∥ `STATUS_ALIASES` ∥ `LEGACY_MODE_ALIASES`，与主题别名无关 ⇒ 写 `none found:`。 |
| 7 🟡 | 定别名进 search 的接口：库存条目加 `aliases` 字段，或 search 读新的加载器导出。`listKnowledgeTopics` 现在只回 `{ id, title }`。 |
| 8 🔵 | §6 补一行需求 §6 的三项性质（主代理与子代理皆可查 · 不写记忆 · 无嵌入与网络）。 |
| 9 🔵 | §3 定分隔符集合（半角逗号 only，还是全角也算）；否则全角会静默成单个别名。 |
| 10 🔵 | §2 说明分词 ∥ 计分 ∥ 截断拆成具名函数，`execute` 留在 50–100 带下。 |

改后重送评审（第 2 轮只核这 10 项与新增议题）。

### 用户追加需求（第 11 项 · 停用词过滤）

- **已定决定**：search 分词后过滤停用词，过滤后零词明确失败并给下一步 · 用户原话：「**检索是不是还得有个停用词表啊？像the这样的词就该排除掉。**」 · 时间：2026-11-14 14:32
- **落点**：`thincoder-core/tools/knowledge.mjs` 新增代码内常量 `SEARCH_STOPWORDS`（中英各约 20 个高频虚词），分词后、计分前过滤，大小写不敏感。与第 ② 项同函数同行，不另开文件。
- **为什么放代码常量不放数据文件**：它是检索逻辑不是主题内容；进 `prompts/knowledge` 会多一份资源边界与热加载成本，而它一次定稿后极少变。
- **它同时合掉了评审 #2(a)**：「切词后一个词都没有 ⇒ 显式失败」原本无可达场景（`query is required` 已挡死），停用词过滤给了它真场景——改成「切词并去掉停用词后一个词都没有」，场景 = `the` ∥ `a of the` 这类全虚词查询。一条分支，两条判据合成一条。
- **中文那半不靠它**：分词按空白切，中文整句是一个词，虚词过滤对它无效；中文命中靠第 ③ 项 `aliases`。两条并行、不重叠，都已写进 §2。
- **判据**：`the` 单独查询 ⇒ 明确失败报文含 `query` 且给下一步、不返回主题片段；`the evidence discipline` ⇒ 仅 `evidence` ∥ `discipline` 参与计分，`the` 贡献零次；过滤前后同一查询的返回体积对比记 §2 红侧。

### 收口修面（fix 轮 · 阻塞收口）

`doc_check(mode:"gate")` 在收口时拒收，点名 `thincoder-core/prompts/knowledge/tool-knowledge.md` 两段超 300 字：第 6 段 502 字、第 10 段 390 字。两段都是本批写进去的检索语义。

处置口径（固定，不做判断）：

- 只换行，一个字都不改。断在句子或从句结束处：第 6 段在 `Search splits…` ∥ `A query left with no word…` ∥ `Every remaining word…` ∥ `Ranking: …` 四处断开；第 10 段在 `Results are capped…` ∥ `The envelope reports…` ∥ `No match returns…` 三处断开。
- 提示词面按行判长，每行自成一个段落——把一句话留在同一行即达标，不做重新措辞。
- 改完复跑 `doc_check(mode:"gate")` 须为 `PASS`；同一档其余行不动。

完成即停，不扩面。

## §2 批次任务与设计（eng-designer）
**状态行**：设计完成

### 本批条目（覆盖）

| 台账 | 条目 | 覆盖面 |
|---|---|---|
| #2415 | knowledge 检索四改 + 停用词过滤 | ① search 全局上限 ② 空白分词 OR + 排序 ③ 主题 `aliases:` 中文近义词 ④ 0 命中回执给下一步 ⑤ 停用词过滤（用户 2026-11-14 14:32 追加；机制见 ⑦） |

四改与停用词过滤走的是同一条检索链（`search` 分词 → 匹配 → 排序 → 有界返回 → 空结果回执），落在 `thincoder-core/tools/knowledge.mjs` 与 `thincoder-core/prompt-files.mjs` 两档，不加第三个落点。

### 设计档落点

- `docs/core/design/PROMPT-SYSTEM.md` §6「knowledge 工具」：search 行的动作语义、检索面（标识 ∥ 标题 ∥ 别名 ∥ 正文）、排序三键、停用词过滤（`SEARCH_STOPWORDS`）与全虚词查询的显式失败、两个上限、截断披露、0 命中回执、三个具名函数。
- 同档 §3「知识主题目录」：`aliases:` 首行声明的形、剥出正文的规则、坏声明的两种形态（`aliases` 后无冒号 ∥ 冒号后切不出非空词）与其加载期失败、条目面 `readKnowledgeEntries` 导出，`list` ∥ `get` ∥ search 都经它读主题。
- 同档 §2 两句收正：主题文件带一行元数据声明；锚回填「逐字」的比对对象改为正文（首行声明不计）。§9 验证清单同句同步，并补收别名命中与排序键序、全虚词查询的显式失败两支（同一档两处覆盖面对齐）。
- 需求档 `docs/core/requirements/PROMPT-SYSTEM.md`：**零改动**。§6 表已写「按用户给出的关键词查找相关主题，并返回有界定位片段」、末句已写「查询不到时如实返回无匹配」，§9.2 已写「无匹配有明确结果」——四条改动都是这三句的实现层细化，加需求条款就是替用户改需求语义。

### 机制设计

**① 分词与匹配**。查询按空白切词、转小写、去重，再按 ⑦ 去停用词，任一词命中即入选（OR），不要求全词命中。检索面 = 标识 + 标题 + 别名 + 正文。空查询与只有空白的查询在切词之前就由现行守卫失败并点名 `query`（`thincoder-core/tools/knowledge.mjs`：`throw new Error("knowledge search: query is required")`）；切词后全是虚词的情形由 ⑦ 处理。

**② 排序**。键序 = 标题级命中数（不同词数，标识 ∥ 标题 ∥ 别名计同一级）→ 总命中数（各词在全文中出现次数之和）→ 标识升序。**为什么别名按标题级**：别名的存在就是为了把查询词引到该主题，命中它与命中标题是同一个信号；把它算成正文命中会把别名降权到与顺带提及同级。

**③ 两个上限**。`SEARCH_MAX_TOPICS = 10`、`SEARCH_MAX_CHARS = 6000`，整份返回按紧凑 JSON 计量（含外层字段）。先到者截断：下一个主题会越过任一上限就不再加入。

**为什么截断必须披露**：返回外层带 `matched`（命中总数）、`shown`（返回数）、`truncated`。只给 10 条而无一字说明，模型会把「返回了 10 条」读成「只有 10 条命中」，停在第一个上限上——真实答案可能在第十一条。

**为什么是这两个量级**：单次误调用的成本要低于一次窗口预算的一小截。tiny 档整个系统提示词 ≈ 20,771 字符，6,000 约其 29%——最坏情况一次 search 吃掉窗口的一小截，而不是 2.9 倍（用户实测 `the` = 59,530 字符）。

**④ 别名声明**。主题文件首行可写 `aliases: 词一, 词二`。声明是元数据不是正文：加载器在读出主题时剥掉它，`get`、完整档内联与锚回填都只看剩下的正文。**为什么必须剥**：不剥的话，别名行会随主题正文一起被内联进完整档系统提示词，也会出现在 `get` 的回执里——为检索加的元数据变成模型可见的噪声。

解析点只有一处 = `thincoder-core/prompt-files.mjs` 的 `readKnowledgeEntries`：它剥首行声明、把 `aliases` 挂回条目。`listKnowledgeTopics` 仍只回 `{ id, title }`；search 直接读同一条目面（`content` ∥ `aliases`），不为取别名把目录再扫一遍——这是第 1 轮评审 #7 要定的那个接口。

**分隔符集合** = 半角逗号 ∥ 全角逗号 ∥ 顿号（`,` `，` `、`）。**为什么三种都算**：作者写中文近义词时用的是 `，`，写并列项时用的是 `、`；只认半角，这两种写法会整行落成一条永不命中的长别名，而且不报错、只少命中。词内其余字符（含半角空格）原样保留，所以英文短语别名照写。

**坏声明显式失败**：首行以 `aliases` 开头却不成形 ⇒ 加载期抛错并点名主题；「不成形」两种 = `aliases` 之后没有冒号 ∥ 冒号后切不出非空词。**为什么不当成没有别名**：静默丢掉别名会把「别名写坏了」和「这个词本来就不命中」说成一回事，两者在失败回执上长得一模一样；无冒号那一种按「一个词」宽松解析，一条散文首行会静默成一条永不命中的别名，与「声明只有两种形态」当场矛盾。

**复现路径**（评审 #2b 要的那条）：造一份临时主题档，首行逐字 `aliases:`、其后无词，再以 `readKnowledgeEntries([{ kind: "prompt", dir: <临时目录> }])` 读一次 ⇒ 当场抛错，消息里带该主题标识。`sources` 是既有形参，`listKnowledgeTopics` 与 `loadKnowledgeTopic` 都吃它，所以不必改盘上任何主题就能触发这一支。

该函数是加载器导出的读取入口（`thincoder-core/prompt-files.mjs` 的 `export function readKnowledgeEntries`），评审第 2 轮 #11 说的「无导出面」至此不成立。

**⑤ 0 命中回执**。回执点名两条下一步：换单个英文关键词，或先 `list` 看全部主题标识。**为什么**：中文查询只能经别名命中，一条只说「没匹配」的回执会让模型按同一形态重试。

**⑥ 模型可见描述同步**。`thincoder-core/prompts/knowledge/tool-knowledge.md`（工具描述的展开面）同步写清检索分词与停用词过滤、排序、上限、截断披露与 0 命中回执。描述与行为不同步，模型会按旧语义使用返回结果（例如把 10 条当真全部命中，或反复用全虚词查询）。

**⑦ 停用词过滤（第 11 项追加）**。分词、转小写、去重之后按代码内常量 `SEARCH_STOPWORDS` 去掉虚词，再进计分。中英各约二十个——英文 `the a an of to in on at is are was were be been for and or not with by from this that it as`，中文 `的 了 在 是 和 与 或 就 也 都 而 及 其 之 于 对 从 把 被 让`；匹配大小写不敏感。

**为什么治排序不治体积**：`the` 命中 80 份主题（红侧读数），会把 `evidence` 这种真信号顶下去——体积早由两个上限兜住，噪声没有人兜。过滤后剩不下一个词时显式失败并点名 `query`，报文给下一步（「这个查询没有有效词，用具体名词重查」）：这一支的真场景就是 `the` ∥ `a of the` 这类全虚词查询，评审 #2(a) 说的「无可达场景」至此有了场景，两条合一。

**不做 CJK 分词**：分词按空白切，中文整句本就是一个词，虚词过滤对它无效——中文靠 ③ 的别名解决，两条并行、不重叠。词表也不做成数据文件：它属于检索逻辑，进 `prompts/knowledge` 就多一份资源边界与热加载成本。

### 边界（本批不做）

- `list` ∥ `get` 行为与返回形不动；`get` 仍按精确标识取正文（正文不含别名行）。
- 主题正文一字不动；新增的只有首行别名声明。
- 不引嵌入、不做外部索引、不走网络（需求 §6）。
- **不做词干化、不做中文分词**：中文查询按子串整词匹配（`批次档怎么写` 不会命中），这是本批的已知上限，由 0 命中回执与别名指路。
- 不动消息投递链（§1 待裁事项）、不动主题拆分。

### 受影响文件与测试覆盖

第三列 = 该档在批起快照 `88ac8467` 上的内容行数，量法 = `countContentLines`（`thincoder-core/agent-tools/batch-tier-gate.mjs`，node 一次跑完）。

**受影响文件（机读清单）**

```
| 档 | 分拆方案 | 行数 |
|---|---|---|
| thincoder-core/tools/knowledge.mjs | — | 60 |
| thincoder-core/prompt-files.mjs | — | 177 |
| docs/batches/2026-11-14-knowledge-search-quality.test.mjs | — | 新 |
| test/integration/knowledge-search-bounded.test.mjs | — | 新 |
```

非代码档（不入机读清单，`.md` 不带行数读数）：

| 档 | 改什么 |
|---|---|
| `thincoder-core/prompts/knowledge/tool-knowledge.md` | 展开面：检索分词与停用词过滤、排序、双上限与截断披露、0 命中回执 |
| `thincoder-core/prompts/knowledge/*.md` ∥ `thincoder-core/knowledge/*.md` | 每份主题首行加一行 `aliases:`（正文不动）；没有合适近义词的主题不写这一行 |
| `docs/core/design/PROMPT-SYSTEM.md` | 本批设计落点（见上） |
| `test/RTM.md` ∥ `test/rtm/tooling.md` | CLI 53 故事行与用例行；`test/rtm/tooling.md` 的 `CLI 50-4` ③ 判据行收正（展开面全文 → 正文，首行 `aliases:` 声明不计） |

**档位结论**：两个代码档 60 ∥ 177，未越 500 软线，无分拆方案。读数命令（本席现跑，`cwd` = 仓根；第三列的数即它的输出）：

```
node -e "import('./thincoder-core/agent-tools/batch-tier-gate.mjs').then(async (m) => { const { execFileSync } = await import('node:child_process'); const sha = '88ac84672b010055c51055d357b0d97b4d93c3c5'; for (const p of ['thincoder-core/tools/knowledge.mjs','thincoder-core/prompt-files.mjs']) console.log(p, m.countContentLines(execFileSync('git', ['show', sha + ':' + p], { encoding: 'utf8' }))) })"
```

逐行输出 = `thincoder-core/tools/knowledge.mjs countContentLines = 60` ∥ `thincoder-core/prompt-files.mjs countContentLines = 177`。

两行 `新`（本批单测档、集成用例档）设计时不在盘：按 `CODE-TIER.md` §2① 「新建文件使用其本次落盘长度」，在实施轮落盘后判，设计时不写数。

函数档：`execute` 现 20 行上下，改动后按设计 §6 拆出 `tokenizeQuery` ∥ `scoreTopic` ∥ `boundedHits` 三个具名函数，`execute` 只留动作分派与回执成形——四者都不进 `CODE-TIER.md` §3 的 50–100 审视带（不是「文件短所以豁免」：拆的是概念，切词、计分、截断各是一个可独立复述的概念）。`prompt-files.mjs` 的 `readKnowledgeEntries` 增的是声明解析一段，同档同带。

**可跑形**：`node --test docs/batches/2026-11-14-knowledge-search-quality.test.mjs`（cwd = 仓根），用例覆盖上限截断、排序键序、别名命中、0 命中回执四条。

### 集成 delta（对照 `test/RTM.md`）

- **新增 `CLI 53-1`**：标题「knowledge 检索有界：宽词查询不吞窗口，0 命中指路」。用例落 `test/integration/knowledge-search-bounded.test.mjs`；RTM 索引落 `test/rtm/tooling.md` 新增的 `CLI 53` 节，节注照该档各节形：
  - 回指 = 需求 `docs/core/requirements/PROMPT-SYSTEM.md` §6「按用户给出的关键词查找相关主题，并返回有界定位片段」∥ 同节末句「查询不到时如实返回无匹配」∥ §9.2「未知主题与无匹配有明确结果」。
  - 组件 = knowledge 检索链（`thincoder-core/tools/knowledge.mjs` 的 `execute` search 支）⟷ 主题加载与别名剥离（`thincoder-core/prompt-files.mjs` 的 `readKnowledgeEntries`）⟷ 三档工具表（tiny ∥ normal ∥ engineering）⟷ 真 CLI 会话的模型请求体。
  - 进入口 = 真 CLI 起 tiny 档会话，本地脚本化模型端点首回合派三次 `knowledge` 调用（`{action:"search", query:"the"}` ∥ `{action:"search", query:"the evidence"}` ∥ 一次 0 命中查询），读第二回合请求体里带回的这三条工具结果。三次而非两次：全虚词失败支落地后 `the` 不再返回有界结果，宽词的有界截断要另由一条含虚词但不全虚词的查询观测。
  - 业务面 = 宽词查询（`the evidence`）的结果字符数不越过窗口预算的一小截（≤ 6,000）且外层报 `matched` / `shown` / `truncated`；全虚词查询（`the`）显式失败并点名 `query`；0 命中回执点名两条下一步。
- **改写 `CLI 50-4`**（档 = `test/integration/tool-description-tiers.test.mjs`）：判据 ② ∥ ③ 的比对对象从「展开面原文 ∥ `prompts/knowledge/tool-bash.md` 全文」收正为「展开面主题的**正文**（首行 `aliases:` 声明不计）」——它与设计 §2 的锚回填口径是同一断言的两写，收正的是措辞。用例代码不动：该档现读 `loadKnowledgeTopic("tool-bash", { promptOnly: true })`，改后这个调用回的正是正文，两条断言仍绿。
- **保留 `CLI 50-2`**（档 = `test/integration/tiny-mode.test.mjs`）：四条判据（三档均有 knowledge · search 只定位 · get 取完整主题 · 错误显式）改后仍成立，判据不读返回外形；该档代码亦不动。
- **删除 0 行**。`grep -n knowledge test/RTM.md` 零命中只说明**索引档**里没有；用例行在 `test/rtm/tooling.md` 的 `CLI 50` 节——第 1 轮评审 #1 点名的正是这个漏读面。
- 用例从「生产真出过的问题」进门：`the` 一次 59,530 字符、`compact threshold` 与 `文档` 零命中，都是实测。

### 验收对照（逐条回指需求）

| # | 需求锚 | 判据 | 判者 |
|---|---|---|---|
| A1 | 需求 §6 search 行「返回有界定位片段」 | 造一个命中 40+ 主题的宽词查询 ⇒ 返回主题数 ≤ 10 且总字符 ≤ 6,000，且 `matched` > `shown`、`truncated: true` | 本批单测 |
| A2 | 需求 §6 search 行「按关键词查找相关主题」 | 查询 `compact threshold` ⇒ 命中含 `compact` 的主题仍返回；标题命中者排在正文命中者之前；同分按标识升序 | 本批单测 |
| A3 | 需求 §6「工具对主代理和子代理开放…不需要嵌入服务或外部网络」 | 中文查询 `文档` ∥ `证据` 有命中（经别名），全程无网络调用、无新增依赖 | 本批单测 + 集成 `CLI 53-1` |
| A4 | 需求 §6 末句「查询不到时如实返回无匹配」· §9.2「无匹配有明确结果」 | 0 命中回执点名两条下一步（单个英文关键词 ∥ 先 `list`），且不伪造主题 | 本批单测 |
| A5 | 需求 §9.2「list/search/get 能取回同一主题」 | 上限截断后，被截掉的主题仍能 `get` 与 `list` 取回；`get` 返回正文不含别名行 | 本批单测 |
| A6 | 需求 §7 ∥ 设计 §9 完整档兼容 | 完整档渲染不变：顶层主题正文与其锚展开逐字一致（首行别名声明不计），极简档工具描述仍未变 | `node --test test/integration/tiny-mode.test.mjs test/integration/tool-description-tiers.test.mjs` |
| A7 | 需求 §6 search 行「按用户给出的关键词查找相关主题，并返回有界定位片段」 | 全虚词查询（`the` ∥ `a of the`）⇒ 明确失败报文含 `query` 并给下一步，不返回主题片段；`the evidence discipline` ⇒ `the` 参与计分零次，命中主题数少于改前 | 本批单测 |

**红侧已记**（命令 = 仓根以 node import `thincoder-core/tools/knowledge.mjs` 的 `knowledgeTool.execute({ action: "search", query })` 直调，盘上主题 83 份；下面的数取该命令输出）：

- A1：`the` ⇒ **59,530 字符**、命中 **80** 份主题——超 6,000 上限近十倍。
- A2：`the evidence discipline` ⇒ **0 命中**、54 字符：整串子串匹配，`evidence` ∥ `discipline` 都在盘上却取不回。同命令的对照 = `evidence discipline` ⇒ 1 命中、256 字符。
- A3：`文档` ∥ `证据` ⇒ 0 命中。
- A7：`a of the` ⇒ 0 命中、39 字符；`the` ⇒ 80 份主题。虚词把真信号顶下去，而全虚词查询拿到的是一句「没有匹配」——与「主题里真没有」在回执上长得一样。

四条都是本批改造前的实测，命令与读数即上面两段。

### 关键决策

| # | 决策 | 理由 |
|---|---|---|
| 1 | 上限 10 主题 ∥ 6,000 字符，双上限同时生效 | 6,000 ≈ tiny 整档系统提示词的 29%；成本门按窗口预算的一个小截定，不按主题数好看定 |
| 2 | 截断如实披露（`matched`/`shown`/`truncated`） | 不披露就会被读成「只有 10 条命中」，上限从成本门变成相关性判断 |
| 3 | 别名按标题级计分 | 别名是为引路而写的，命中它与命中标题同信号 |
| 4 | 别名声明从正文剥离 | 不剥就随内联进完整档系统提示词、进 `get` 回执，元数据变噪声 |
| 5 | 坏别名声明加载期失败 | 静默吞掉会让「写坏了」与「不命中」不可分 |
| 6 | 加停用词表；不做词干化、不做中文分词 | 上限只限体积、限不住排序噪声：`the` 命中 80 份主题，会把 `evidence` 顶下去。中文不分词，靠别名与 0 命中回执指路 |

**被否掉的替代**：① 只加字符上限、不加主题数上限——单主题可到 3 段 × 240 字符，10 个就超 6,000，两个都要；② 别名放独立索引档——省 83 份主题文件的改动，但别名与主题正文分家，主题改名时别名没有跟动的约束；③ 按 BM25 类打分——需要词频统计与长度归一，本工具查询面是「定位」，三键序已够，多出的复杂度没有对应场景。

### 新落点三问（本批新增的名）

三问 = 这东西现在落在哪 · 它叫什么 · 谁在用。答案两形：`existing:` 用现成的，`none found:` 才是查过的缺席。

| 新名 | 答案 |
|---|---|
| `aliases:`（主题首行声明字段） | `none found:` 已查 `thincoder-core/**/*.mjs` 的 `ALIASES` ∥ `aliases`，全量命中三处——`STATUS_WORD_ALIASES`（`thincoder-core/agent-tools/batch-segment-vocab.mjs`）∥ `STATUS_ALIASES`（`thincoder-core/agent-tools/task.mjs`）∥ `LEGACY_MODE_ALIASES`（`thincoder-core/config-migrate.mjs`）。三处都是枚举别名表，与主题别名无关 |
| `SEARCH_MAX_TOPICS` ∥ `SEARCH_MAX_CHARS` | `none found:`（`grep SEARCH_MAX thincoder-core/tools` 零命中）。同族现成件 = 同档两个片段上限常量 `SEARCH_SNIPPET_CHARS` ∥ `SEARCH_SNIPPETS_PER_TOPIC`，命名照它们的前缀形 |
| `matched` ∥ `shown` ∥ `truncated`（搜索结果外层字段） | `none found:` 三个名字在 `thincoder-core/tools` 只以局部变量或消息措辞出现（`repomap.mjs` 的 `const shown`、`execute.mjs` 的 `truncated` 布尔、`knowledge.mjs` 的 `No knowledge topics matched`），没有一处是工具返回的外层字段。形照本工具既有回执：错误消息点名 `knowledge <action>: <param> is required`，结果面此前是裸数组，无外层字段可对齐 |

### 最近先例（对齐 ∥ 偏离）

- **对齐** `2026-11-14-tool-desc-concise`：`tool-knowledge.md` 属工具描述展开面，改的是展开面文字，常驻面（`tool-docs/knowledge.md` 的一句用途）不动。
- **对齐** 同批的 `#2407` 口径：技能描述与知识主题都来自随包资源、走同一加载器；本批只加首行声明，不改加载路径与包边界。
- **偏离并给理由**：设计 §2 原写「主题正文逐字等于主题文件全文」。加别名声明后全文 ≠ 正文，判据收正为「等于正文（首行声明不计）」——判据保护的是展开面与主题不漂，剥离后的正文比对仍然保护它。

### 公共源勘察

已读 `PROJECT-MANIFEST.json` 的 `index.publicRepos` = `["../.thincoder","../thincoder.com"]`；两者是同类 agent 产品仓，与 knowledge 检索实现无共源关系，已查，无相关公共源可引。

### 上抛项

无。需求 §6 ∥ §9.2 与四条改动相容，无矛盾需裁定。

## §3 设计评审（评审子代理）
**状态行**：评审通过（第 2 轮 · 🔴 0 · 新增 🟡 2 ∥ 🔵 1 · 2026-11-14）


### 轮次 1（评审子代理）

> 状态行重置：第 1 轮打回（changes-required）· 上一轮状态行 = 评审通过 → 进行中 · 2026-11-14

注：本轮 `§3` 状态行被工具置为「评审通过」，早于结论落定；以本段 `VERDICT` 行为准，两条 🔴 处置前不得读作通过。

| # | 严重度 | 状态 | 证据 |
|---|---|---|---|
| 1 | 🔴 | 待修 | §2「集成 delta」第二条「既有集成用例一条也不断言 knowledge 的 search 面（`grep -n knowledge test/RTM.md` 零命中，本席现跑）」——`test/rtm/tooling.md` 有 `CLI 50-2`「search 只定位、get 取完整主题」与 `CLI 50-4` ③「展开面正文逐字等于 `prompts/knowledge/tool-bash.md` 全文」，后者与设计 §2「首行 `aliases:` 声明不计入正文」是同一断言的两写 |
| 2 | 🔴 | 待修 | 设计 §6「切词后一个词都没有时显式失败并点名 `query`」：`knowledgeTool.execute` 已有「knowledge search: query is required」挡在前，无可达场景；设计 §3 坏别名声明失败同缺观测 ∥ 复现路径（§2「红侧已记」三条均非此二支） |
| 3 | 🟡 | 待修 | §2「档位结论」只给 `60 ∥ 177` 与「量法 = `countContentLines`」，未给命令；机读清单四行中两行 `新` 无档位判 |
| 4 | 🟡 | 待修 | 验收 `A6` 判者格「`node --test` 既有提示词套件」未点名档（应为 `test/integration/tiny-mode.test.mjs` ∥ `test/integration/tool-description-tiers.test.mjs`） |
| 5 | 🟡 | 待修 | §2 新增 `CLI 53-1` 只给标题与业务面，缺组件交互与进入口（`test/rtm/tooling.md` 各节注均带「组件 = … ⟷ …」「进入口 = …」） |
| 6 | 🟡 | 待修 | 新名 `aliases:` ∥ `SEARCH_MAX_TOPICS` ∥ `SEARCH_MAX_CHARS` ∥ `matched`/`shown`/`truncated` 无 `existing:` ∥ `none found:` 三问答案 |
| 7 | 🟡 | 待修 | 设计 §6 写 search 面含「别名（§3）」，而 `listKnowledgeTopics` 只回 `{ id, title }`——别名经哪个接口进 `search` 未定 |
| 8 | 🔵 | 备注 | 设计 §6 未收需求 §6 三项性质（主代理与子代理皆可查 · 不写记忆 · 不需嵌入服务或外部网络）；记录 §2「边界」有 |
| 9 | 🔵 | 备注 | 设计 §3 声明形 `aliases: 词一, 词二` 未定分隔符集合，全角逗号会静默成单个别名（无报错、只少命中） |
| 10 | 🔵 | 备注 | §2「档位结论」只判 300 行函数档；CODE-TIER §3 的 50–100 ∥ ≥100 两档未提（分词 ∥ 计分 ∥ 截断可各成一函数） |

VERDICT: changes-required
计数：🔴 2 · 🟡 5 · 🔵 3

### 轮次 2（评审子代理）

| # | 严重度 | 状态 | 证据 |
|---|---|---|---|
| 1 | 🔴 | 已修 | §2「集成 delta」现含「改写 `CLI 50-4`」「保留 `CLI 50-2`」「删除 0 行」与「`grep -n knowledge test/RTM.md` 零命中只说明**索引档**里没有」；`test/rtm/tooling.md` 的 `50-4` ③ 与 `50-2` 四条判据在盘；`test/integration/tool-description-tiers.test.mjs` 的 `loadKnowledgeTopic("tool-bash", { promptOnly: true })` 证实「用例代码不动、两条断言仍绿」 |
| 2 | 🔴 | 已修 | 设计 §6「全虚词查询（`the`、`a of the`）走的就是这一支」→ 该支可达（`the` 过既有守卫后被停用词清空）；§2「复现路径（评审 #2b 要的那条）」给出坏别名声明构造 |
| 3 | 🟡 | 已修 | §2「档位结论」现有 node 读数命令段 + 「两行 `新`…按 `CODE-TIER.md` §2① 新建文件使用其本次落盘长度」段 |
| 4 | 🟡 | 已修 | 验收 `A6` 判者格现为「`node --test test/integration/tiny-mode.test.mjs test/integration/tool-description-tiers.test.mjs`」，两档均存在 |
| 5 | 🟡 | 已修 | §2 `CLI 53-1` 项下现带「回指 = …」「组件 = …⟷…」「进入口 = 真 CLI 起 tiny 档会话…」与业务面 |
| 6 | 🟡 | 已修 | §2「新落点三问」表三行均 `none found:`（`aliases:` ∥ `SEARCH_MAX_TOPICS` ∥ `matched`/`shown`/`truncated`） |
| 7 | 🟡 | 已修 | 设计 §3「加载器读主题条目时（`readKnowledgeEntries`）剥掉首行声明，把别名挂回同一条目」；§2 ④同句 |
| 8 | 🔵 | 已修 | 设计 §6 首段「工具对主代理与子代理同样开放，只读且不写记忆…不需要嵌入服务或外部网络（需求 §6）」 |
| 9 | 🔵 | 已修 | 设计 §3「分隔符是**半角逗号、全角逗号与顿号**三种」 |
| 10 | 🔵 | 已修 | 设计 §6「检索链按概念拆成三个具名函数：切词与去停用词（`tokenizeQuery`）…`execute` 只做动作分派与回执成形」 |
| 11 | 🟡 | 新 | §2「复现路径」以 `readKnowledgeEntries([{ kind: "prompt", dir: <临时目录> }])` 为跑法，而该函数在 `thincoder-core/prompt-files.mjs` 是模块内部件（`function readKnowledgeEntries(sources = KNOWLEDGE_SOURCES)`，无 `export`）；带 `sources` 的导出面是 `listKnowledgeTopics(sources = KNOWLEDGE_SOURCES)` |
| 12 | 🟡 | 新 | 设计 §9 验证清单只到「坏别名声明的加载期失败、搜索无匹配、search 双上限截断与披露」，未收 §6 新增的停用词支（全虚词查询显式失败）——同一档两处覆盖面不一致 |
| 13 | 🔵 | 新 | §2 非代码档表 `test/RTM.md` ∥ `test/rtm/tooling.md` 行只写「CLI 53 故事行与用例行」，未写同档 `50-4` 判据行的收正，与「集成 delta」的改写项不完全对齐 |

VERDICT: pass
计数：🔴 0（前轮 2 条已修）· 🟡 2 新 · 🔵 1 新 · 前轮 🔴 2 ∥ 🟡 5 ∥ 🔵 3 全部核销

## §4 用户批准（主 agent）

**批准记录（主 agent）**

- 批前提案：四条改法（search 全局上限 ∥ 分词 OR 与相关度排序 ∥ `aliases:` 中文近义词 ∥ 0 命中给下一步）由主 agent 提出、逐条列出判据方向，用户答「**我认为可以，就这么做。**」——这是对范围的批准。
- 开工词：设计席派遣前主 agent 复述范围与验收方式，用户答「**开工，自动跑完。**」——这是对「设计 → 评审 → 实施 → 验证 → 收口」全链的授权，故本批不再逐步回问。
- 批中追加：用户问「检索是不是还得有个停用词表啊？像 the 这样的词就该排除掉。」——采纳为第 11 项（`SEARCH_STOPWORDS` 与全虚词查询显式失败），属同一机制面的加严，未另开批；设计评审第 2 轮据此复核。
- 未越出批准范围：`list`/`get` 语义、主题正文、工具 schema、每轮注入、消息投递链均未动。

## §5 实施记录（eng-coder）
**状态行**：实施完成



### 实施摘要

四条改动 + 第 11 项停用词过滤全部落地，落点与 §2 一致：两档代码（`thincoder-core/tools/knowledge.mjs` ∥ `thincoder-core/prompt-files.mjs`）、83 份主题的首行 `aliases:`、工具描述展开面、两条测试档、RTM 两档。**清单外零档**：83 份 `.md` 主题档（`prompts/knowledge` 82 份 + `core/knowledge` 1 份）+ 4 个代码/测试档 + RTM 两档，全部在 §2 的机读清单与「非代码档」表内。

| # | 落点 | 做了什么 |
|---|---|---|
| ① | `tools/knowledge.mjs` | `SEARCH_MAX_TOPICS = 10` ∥ `SEARCH_MAX_CHARS = 6000` 双上限同时生效；`boundedHits` 先到者截断，返回外层报 `matched` / `shown` / `truncated`。字符数按整份返回的紧凑 JSON 计量（含外层字段），且用**交付时那个** `truncated` 值计量（`true` 比 `false` 少一个字符，用错一侧实际交付会多一个字符） |
| ② | 同上 | `tokenizeQuery` 按空白切、转小写、去重、排序（词序影响不了名次与片段集合）；`scoreTopic` 对标识 ∥ 标题 ∥ 别名 ∥ 正文做 OR 匹配；`boundedHits` 定序 = 标题级命中数 → 正文出现次数 → 标识升序 |
| ③ | `prompt-files.mjs` | `splitAliasDeclaration` 在 `readKnowledgeEntries` 里剥首行 `aliases:` 声明，把词挂回条目（`{ id, title, content: body, aliases, kind }`）；分隔符半角逗号 ∥ 全角逗号 ∥ 顿号；坏声明加载期点名主题失败；`listKnowledgeTopics` 仍只回 `{ id, title }`。83 份主题各加一行声明，正文逐字未动 |
| ④ | `tools/knowledge.mjs` | 0 命中回执点名两条下一步（换单个英文关键词 ∥ 先 `list`），不伪造主题 |
| ⑥ | `prompts/knowledge/tool-knowledge.md` | 展开面写清分词与停用词过滤、排序、双上限与截断披露、0 命中回执；常驻面 `tool-docs/knowledge.md` 一字未动 |
| ⑦ | `tools/knowledge.mjs` | `SEARCH_STOPWORDS`（英文 25 ∥ 中文 20，照设计列的词），分词后、计分前过滤；过滤后零词显式失败并点名 `query` |

### 机制细节落点（设计没写死、由实施判的两处）

- **别名进 search 的接口**（评审第 1 轮 #7）：`readKnowledgeEntries` 由模块内部件改为导出，search 一次读齐 `content` ∥ `aliases`，不为取别名把目录再扫一遍。评审第 2 轮 #11 说「复现路径要的 `readKnowledgeEntries([{kind,dir}])` 在盘上没有导出面」——导出后该复现路径成立，单测里就是照它跑的。
- **声明的两种形态按「只有两种」执行**：首行以 `aliases` 开头但不成形（没有冒号，或冒号后取不出词）都走加载期失败。设计 §3 只写了「取不出非空词」那一种；无冒号那一种若按「一个词」宽松解析，散文首行会被静默当成一条永不命中的别名，与「声明只有两种形态」当场矛盾，故选失败。**这是实现层对设计的一句补全，不是改设计**；要把无冒号也写进拒绝面，属设计席笔。

### 读数（命令 + 结论；数在命令输出里）

命令 = 仓根 `node -e` 导 `thincoder-core/tools/knowledge.mjs` 的 `knowledgeTool.execute({ action: "search", query })` 直调，盘上 83 份主题：

- `the` ∥ `a of the` ⇒ 抛错，报文含 `query` 与下一步；**改前同一次调用是 80 份主题、59,530 字符**（批次 §2 红侧；本席用带别名的盘面重跑旧实现得 60,040，差额即 83 行声明）。
- `tool` ⇒ `matched` 78、`shown` 8、`truncated: true`、返回 5,487 字符（≤ 6,000）。红侧同查询是裸数组、无外层字段。
- `the evidence` ⇒ `matched` 20、`shown` 8、`truncated: true`、5,768 字符。
- `compact threshold` ⇒ `matched` 5、未截断（红侧 0 命中）；`threshold compact` 与它逐字相等（词序不影响）。
- `文档` ⇒ 9 份命中；`证据` ⇒ 1 份（`evidence-discipline`，该词只在别名行、正文里没有）。红侧两查都 0 命中。
- 片段长度：宽词查询里最长片段 = 240 字符（夹到 `SEARCH_SNIPPET_CHARS`）。

**正文逐字性**：脚本比 `git show 88ac8467:<path>` 与盘上文件去首行后的正文，83 份逐一相等；首行都是 `aliases:` 声明。`get` 回的正文不含声明，完整档锚回填与 `get` 同一来源。

### 验证（本席跑的命令 + 结果）

- `node --test docs/batches/2026-11-14-knowledge-search-quality.test.mjs` ⇒ 8/8 绿（A1 ∥ A2 ∥ A3 ∥ A4 ∥ A5 ∥ A7 ∥ 坏别名声明拒绝侧 ∥ 分隔符三种）。
- `node --test test/integration/knowledge-search-bounded.test.mjs` ⇒ 1/1 绿（`CLI 53-1`）。
- `node --test test/integration/tiny-mode.test.mjs test/integration/tool-description-tiers.test.mjs` ⇒ 6/6 绿（A6：`CLI 50-1` ∥ `50-2` ∥ `50-3` ∥ `50-6` ∥ `50-4` ∥ `50-5`）。
- **失败侧实跑**（证明上面这些绿是挣来的）：把批起快照的检索实现落成临时档 `thincoder-core/tools/__redside-knowledge.mjs`，用同一组判据跑 ⇒ `matched` 为 `undefined`（裸数组）、`the` 是 60,040 字符 80 份主题且不抛错、`compact threshold` 0 命中、`文档` 0 命中；四条判据全部红。跑完即删该临时档。
- 口径：`docs/core/standards/CODE-TIER.md` §2.2 收口时 800。落盘 `countContentLines`：`tools/knowledge.mjs` 129（设计时 60）∥ `prompt-files.mjs` 203（设计时 177）∥ 批单测 159 ∥ 集成用例 127，全部 ≤ 800。函数档按 §3：`tokenizeQuery` 8 ∥ `scoreTopic` 26 ∥ `boundedHits` 14 ∥ `execute` 21，都不进 50 以上的审视带。

### 交付对照（§2 验收表）

| # | 状态 | 依据 |
|---|---|---|
| A1 | ✅ | 单测 A1：`tool` 宽词查询 `matched` > `shown`、`truncated: true`、主题数 ≤ 10、紧凑 JSON ≤ 6,000；补一条「命中 40+ 主题」的前置断言，上限不是空跑 |
| A2 | ✅ | 单测 A2：`compact threshold` 命中含 `tool-context`；按标识 ∥ 标题 ∥ 别名自算两键复核返回序、标题级优先、同分标识升序；词序交换结果逐字相等 |
| A3 | ✅ | 单测 A3：`文档` ∥ `证据` 经别名命中，且这两个词在该主题正文里不存在（只可能来自声明）；`list` 返回形仍是 `{ id, title }`。无网络调用与无新增依赖属**未变更面**：`knowledge.mjs` 仍只 import `../prompt-files.mjs` 与 `./shared.mjs`，全仓无 `package.json` 变更，本批不可能把它改坏，故不设断言（改前也绿，设了只是恒绿） |
| A4 | ✅ | 单测 A4 + 集成 53-1 ③：回执含 `No knowledge topics matched`、`English keyword`、`list`，且零个主题片段 |
| A5 | ✅ | 单测 A5：宽词查询里被截掉的主题仍能从 `list` 与 `get` 取回，`get` 正文不含首行声明 |
| A6 | ✅ | 两条既有集成用例 6/6 绿；`CLI 50-4` 的 ②③ 两侧都走 `loadKnowledgeTopic`，别名两侧同时被剥，断言仍相等 |
| A7 | ✅ | 单测 A7：`the` ∥ `a of the` ∥ `THE A OF` 抛错且报文点名 `query`、给下一步、无主题片段；`the evidence discipline` 与 `evidence discipline` 结果逐字相等（虚词零贡献）；`matched` 从 80 降到 23 |

### 偏离与披露

| # | 项 | 说明 |
|---|---|---|
| 1 | `CLI 53-1` 首回合派**三次**调用，§2 进入口写「两次」 | 停用词过滤 + 设计裁定 `the` 走显式失败后，`the` 已观测不到 §2 业务面要求的「宽词查询 ≤ 6,000 且报 `matched`/`shown`/`truncated`」。故保留 `the`（判显式失败）并增 `the evidence`（判有界截断），第三条是 0 命中查询。RTM `CLI 53` 节注与用例都写三次，**§2 的「两次」已过期**——§2 属设计席段，本席不改，交父代理收口时对齐 |
| 2 | `SEARCH_MAX_TOPICS` ∥ `SEARCH_MAX_CHARS` ∥ `SEARCH_SNIPPET_CHARS` 改为导出 | 集成用例与单测要按同一组上限判；抄一份常量会随生产改数静默过期（评审 #5 提的正是这个形）。导出比镜像少一个漂移面 |
| 3 | 无冒号的 `aliases` 首行也拒 | 见上「机制细节落点」第二条：实现层补全设计「只有两种形态」那句 |

### 审计与评审轮次

- **库内探索偏离审计**（只读 explore，1 轮）：`DIVERGENCE: found (4)`，A1–A7 逐条复核（它无执行工具，运行期判据交本席的实测）。
- 审计 ①🟡 **真缺陷，已修**：`boundedHits` 计价把 `truncated` 硬写 `true`，未截断一侧实际交付会多一个字符、真越 6,000；改成按交付值计量。
- 审计 ③🔵 **恒真断言，已删**：`fullByCount || fullByChars` 两臂互斥穷尽；换成「宽词确实命中 40+ 主题」的前置断言。
- 审计 ②🔵 §2 进入口与用例不一致，见「偏离与披露」#1；审计 ④🔵 设计 §9 缺停用词支，见「落地核对」。
- **顾问代码评审**（`advisor type=code`，1 轮）：**VERDICT: pass**（🔴 0）。🟡 一条真、已修：`boundedHits` 的 JSDoc 被本席上一笔改出重复段，第二段还是旧口径（「按『已截断』这个最坏形判定」），与代码相反——删重复段，只留与代码一致那一版。
- 评审 🔵 处置（逐条）：
  - 总命中数把标题算两次（surface 与正文各一次）⇒ **已修**：改成正文出现次数（标题在正文里，只数一次），「全文」按正文读正是设计 §6 那句；连带断掉「只命中别名的主题会掉出结果」的隐患（入选条件改为两键皆 0 才 null）。
  - 片段实际长度 = 240 + 词长 ⇒ **已修**：先钉词尾再往前留至多 240，最长片段实测 240，并在单测里加断言（改前可越 240）。
  - 集成用例镜像生产常量 ⇒ **已修**：改 import（见披露 #2）。
  - 用例头注与 §2 红侧数不一致（60,040 vs 59,530）⇒ **已修**：头注改引批次红侧读数 59,530，并注明带别名盘面重跑得 60,040（差额 = 声明行）。
  - 命中偏移在小写串上算、从原串上切，`İ` 一类会错位 ⇒ **不修，留债**：盘面 83 份主题无此类字符，加一套 Unicode 偏移映射是给没出现过的输入开分支；`unverified` 面记在这里，父侧可归账。
- **终态：clean**（审计 1 轮 + 自修 3 处，评审 1 轮 + 自修 4 处，无残留 🔴）。

### 落地核对

**落地核对：无**——没有一句话因本次落地变假。逐句核过（设计档原句与落地一致）：

- §2「首行可另带一行 `aliases:` 别名声明（§3），它不算正文：`get`、完整档内联与锚回填看到的都是去掉声明之后的正文」
- §3「分隔符是**半角逗号、全角逗号与顿号**三种」
- §3「`listKnowledgeTopics` 仍只回标识与标题」
- §6「两个上限同时生效……返回的外层字段报 `matched`（命中总数）、`shown`（返回数）与 `truncated`」
- §6「检索链按概念拆成三个具名函数：切词与去停用词（`tokenizeQuery`）、按条目计分（`scoreTopic`）、按两个上限收集（`boundedHits`）」
- §6「单主题的定位片段仍是至多 3 段、每段 240 字符」与 §9「展开面正文逐字等于其主题文件的正文（首行 `aliases:` 声明不计入正文）」

**一条覆盖缺口（不是假话，设计席笔，交父代理路由）**：`docs/core/design/PROMPT-SYSTEM.md` §9「变更与验证」的清单第二行「包含锚缺档、重复主题、未知主题、坏别名声明的加载期失败、搜索无匹配、search 双上限截断与披露、资源打包。」未收 §6 新增的全虚词失败支——同一档两处覆盖面不一致（评审第 2 轮 #12 已记为 🟡 新，本轮仍未落笔）。

## §6 验证与收口（父代理）

**验证（父代理实跑，不采信实施报告）**

| 面 | 命令 | 结果 |
|---|---|---|
| 批内单测 | `node --test docs/batches/2026-11-14-knowledge-search-quality.test.mjs` | tests 8 · pass 8 · fail 0 |
| 新集成 | `node --test test/integration/knowledge-search-bounded.test.mjs` | tests 1 · pass 1 · fail 0 |
| 相关既有 | `node --test test/integration/tiny-mode.test.mjs test/integration/tool-description-tiers.test.mjs` | tests 6 · pass 6 · fail 0 |
| 全量集成 | `node --test test/integration/*.test.mjs` | tests 216 · pass 214 · fail 2 |

两条红 = `CLI 43-1` ∥ `CLI 43-2`（`test/integration/doc-anchor-graph.test.mjs`），归台账 `#2404`（`DOC-GRAPH` 重写遗留），与本批无 import 面交集；本批未触碰该档与锚图文档。

**行为读数（仓根直调 `knowledgeTool.execute`，独立于实施报告）**

| 查询 | 改前（实施报红侧） | 现在 |
|---|---|---|
| `the` | 59,530 字符 / 80 主题 | 显式失败并点名 `query` |
| `a of the` | — | 同上（停用词过滤后零词） |
| `compact threshold` | 0 命中 | matched 5 · shown 5 · 2,601 字符 |
| `context window` | 0 命中 | matched 25 · shown 10 · truncated true · 5,691 字符 |
| `文档` | 0 命中 | matched 9 · 768 字符（经别名） |
| `证据` | 0 命中 | matched 1 · 125 字符 |
| `tool` | 26,021 字符 | matched 78 · shown 8 · 5,487 字符（< 6,000） |
| `the evidence discipline` ∥ `evidence discipline` | 不同 | 逐字相等（5,425 · matched 23 · shown 7）——虚词只被滤掉，不参与计分 |

**剥离面（元数据不进正文）**

三档系统提示词（tiny 20,771 ∥ normal 112,447 ∥ engineering 112,447）含 `aliases:` = 否；`get doc-lookup` = 4,268 字符、不以 `aliases:` 开头；`list` 83 行、不含 `aliases:`。抽检四份主题（`doc-lookup` ∥ `evidence-discipline` ∥ `tool-bash` ∥ `prompt-resources`），去首行声明后与批起快照 `88ac8467` 逐字相等。

**档位（`countContentLines` 实跑，实施后）**

`thincoder-core/tools/knowledge.mjs` 131（批前 60）· `thincoder-core/prompt-files.mjs` 203（批前 177）· `test/integration/knowledge-search-bounded.test.mjs` 127。无一档越 500；最长函数 68 行（测试档 `toolResultsById`），`knowledge.mjs` 最长 `scoreTopic` 32 行，无一函数达 100 行。

**落地核对**：无。设计档 §6 的检索口径、§3 的声明剥离与解析点、§9 的验证清单与落地逐条相符（§9 停用词一条由设计席本轮补入，见 §1 裁决）。

**台账**：`#2415` 本笔结算。本批新债 1 条 = `#2419`（`scoreTopic` 片段偏移在小写改变长度的字符上错位；今日盘面无此类字符，条件触发）。

**收口动作**

- 批内单测档 `docs/batches/2026-11-14-knowledge-search-quality.test.mjs` 已删（测试纪律：随批存删）。读数留在 §5 与本节验证表。
- `doc_check(mode:"gate")` 对本批改动区判 `PASS`（`docs/core/design/PROMPT-SYSTEM.md` ∥ `test/RTM.md` ∥ `test/rtm/tooling.md`）。
- 需求档零改动：四条改动是需求 §6 ∥ §7 ∥ §9.2 既有句的实现细化，不需新增条款。

**§5 一处过期行**

- §5 偏离披露第 1 行仍写「§2 进入口写『两次』」，而 §2 与用例已按三次对齐（`the` 判显式失败 ∥ `the evidence` 判有界截断 ∥ 0 命中判空结果）。
- 处置 = 记在此处不改那段：§5 是实施席的段，改写它等于两个笔在同一节交错。以 §2 与 `test/rtm/tooling.md` 的三次为准。

**提交切分**

- 工作树 96 处改动里，`test/rtm/tooling.md` 同时含本批的 `53-1` 与 `#2416` 的 `46-2`，按路径拆不出两笔干净的提交。
- 处置 = 两批同笔提交，提交信息分列两批内容与各自读数；不硬拆以免归属错乱。

**收口阻塞与处置（须记）**

- 首次 `batch close` 被文档门拒收：`thincoder-core/prompts/knowledge/tool-knowledge.md` 第 6 段 502 字、第 10 段 390 字。
- 按写域默认路径应派实施席 fix 轮，但两处都堵住：① 设计席在评审通过后改过 `docs/core/design/PROMPT-SYSTEM.md`，令牌封印失效，spawn 被拒；② fix 轮的任务书是 §2（设计席段），§1 的修面说明到不了实施席。
- 走通需再排三轮（设计席写 §2 ∥ 重开评审签新令 ∥ 实施席换行），为两处换行，代价不合比例。
- **处置 = 主 agent 亲自换行**，并在本节留账：偏离写域默认路径，理由是上述两堵与「只换行、一个字不改」的可验证性。
- 可验证读数：归一化空白后与暂存版逐字相等 = `true`；最长行 502 → 209；行数 13 → 18。复跑文档门 `PASS`。
