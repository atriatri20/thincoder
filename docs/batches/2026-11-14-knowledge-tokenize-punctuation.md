# 2026-11-14 · knowledge 检索分词剥标点
> 六段，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 每段只有一个作者：作者的段可 `append` 加内容、可就地改（`edit`）；非作者一概拒。
> 编制：主 agent · 2026-11-14 · 来源 = 来源 = 跨实例实测报告（D:\xinbo-network 会话 2026-11-14T16:04）+ 本会话源码自核 + 台账 #2423。
> 台账 = #2423（core · 归批）。前情 = docs/batches/2026-11-14-knowledge-search-quality.md（已收口 2026-11-14）。
## §1 讨论（主 agent）
**状态行**：已收口 2026-11-14
批起 sha = 42c72b0bce1d12daa36fb2a6e01394afa7e93a41
<§1 模板占位：本批条目 / 关键判据 / 授权口径>

### 本批做什么

`knowledge` 检索的分词补上标点处理。现在 `tokenizeQuery` 只做一件事：

```js
const tokens = [...new Set(query.toLowerCase().split(/\s+/).filter(Boolean))]
```

按空白切、转小写、去重、去停用词——**标点原样留在词里**。`scoreTopic` 再拿整词去匹配：

```js
for (let at = body.indexOf(token); at >= 0; at = body.indexOf(token, at + token.length)) {
```

`body.indexOf("doc?")` 在语料里永远找不到，`titleSurface.includes("doc?")` 同理。于是带标点的查询不是「搜不到相关内容」，是**拿着一个不可能命中的串去搜**。

### 为什么

零命中本身模型能自愈。真正的害处是那句回执：

> `No knowledge topics matched "doc?". Try one English keyword, or call list to see every topic id.`

`doc` 本来就是英文关键词，错的是那个 `?`。**回执把人指向了错误的自修方向**——这是整条检索链里唯一一处误导性反馈。

需求侧的口径是 `docs/core/requirements/PROMPT-SYSTEM.md` 的「按用户给出的关键词查找相关主题」；关键词就是 `doc`，`doc?` 不是。所以这是缺陷，不是语义变更。

### 已定决定

- **只动分词与匹配入口**：不改 `get` ∥ `list` 语义，不动主题正文与 `aliases:` 数据面，不引入嵌入或网络。
- **取舍交设计裁**（两条都要给判据与读数）：
  - 甲：整串剔标点（`replace(/[^\p{L}\p{N}\s]/gu, " ")`）。一行，但会把 `doc-check` 拆成 `doc` OR `check`，多词命中暴涨。
  - 乙：逐词只剥首尾标点、保留内部连字符。`doc?` → `doc`、`compaction,` → `compaction`、`「文档」` → `文档`，而 `doc-check` 原样。
  - 本席倾乙，理由是不拿旧问题换新问题；但甲更省，若设计的读数显示拆连字符无实质影响，甲也可接受。
- **回执随之核对**：零命中那句 `Try one English keyword` 在本批之后是否仍然误导，由设计给结论。

### 现状机制（主 agent 实读）

- 分词入口 = `tokenizeQuery`：`split(/\s+/)` → 小写 → 去重 → 去 `SEARCH_STOPWORDS` → 排序；过滤后零词抛错并点名 `query`。
- 计分入口 = `scoreTopic`：检索面 = `entry.id` ∥ `entry.title` ∥ `entry.aliases` ∥ `entry.content`，任一词命中即入选（OR）；标题级命中数 = 命中的不同词数，总命中数 = 各词在正文里的出现次数之和。
- 有界入口 = `boundedHits`：`SEARCH_MAX_TOPICS` ∥ `SEARCH_MAX_CHARS` 先到者截断，按 `titleHits` → `totalHits` → 标识升序定序。
- 停用词表 = `SEARCH_STOPWORDS`，英文约二十个 + 中文约二十个，代码内常量。

### 边界（本批不做）

- 不做中文分词（现口径是按空白切，中文整句本就是一个词，靠 `aliases:` 别名命中）。这条已写在 `SEARCH_STOPWORDS` 头注里，本批不改。
- 不做 Unicode 归一化——`scoreTopic` 头注已自述「会改变长度的字符（如 `İ`）会让片段错位」，这是台账 `#2419`，条件触发。
- 不动 `SEARCH_MAX_TOPICS` ∥ `SEARCH_MAX_CHARS` ∥ `SEARCH_SNIPPETS_PER_TOPIC` 三个上限的取值。
- 不动消息投递链、不做桌面或 VSC 面。

### 勘察

- **库内 = 已查**：`knowledge` 检索相关实现与文档（`tokenizeQuery` ∥ `scoreTopic` ∥ `boundedHits` ∥ `SEARCH_STOPWORDS`）、上一批收口记录 `docs/batches/2026-11-14-knowledge-search-quality.md`、RTM `test/rtm/tooling.md` 的 `CLI 53` 节。判据与先例都在，见上「现状机制」。
- **库外 = 未查：无外部断言**——本批不引入依赖、不改协议载荷、不断言第三方行为。改动面全在本仓 `thincoder-core/tools/knowledge.mjs` 与测试。

### 授权

用户 2026-11-14 16:09 原话：「**知识库那条你开工，回条消息告诉他。**」

### 上抛

（无。设计席若撞到取舍甲/乙以外的第三种形态，或回执措辞需要改动而需求档未授权，请上抛。）

### 覆盖账

覆盖账 = #2423

### 设计评审第 1 轮 · 父侧裁决（2026-11-14）

VERDICT: pass（🔴 0 · 🟡 8 · 🔵 2）。凭证已签发，实施轮即派。

八条 🟡 与两条 🔵 全采，处置分两类。

**本轮进 §1、由实施席执行（三条）**

| # | 裁决 |
|---|---|
| 1 | 零词报文保留两条下一步。逐字文本 = `No searchable word in "<query>" after stopword and punctuation filtering — replace it with a concrete noun, or call list for every topic id`。设计 §6 只写了一条，本表为准；实施后由设计席把 §6 补齐 |
| 2 | U6 基线：批单测内保留一份「只按空白切」的对照分词器，逐标识比对命中集合与名次，不硬写 1.2 ∥ 0 ∥ 0 |
| 3 | 集成 53-1 加第四次调用后：节注进入口行「首回合派三次」改四次，用例档头注与断言提示语同步更新；故事名（分册 H2 ∥ `test/RTM.md` 行）不改，只扩用例标题 |

**实施交付后由设计席一轮收掉（六条）**

`#4` §2 补最近先例行 · `#5` §2 补勘察证据行 · `#6` 档位读数补一条可跑命令 · `#7` 设计档落点计数统一（含报文改写那一句、七步与六步对齐） · `#8` §9 补去重顺序与报文两原因两面 · `#10` §6 删「不是早已存在的问题」的改前参照。

**`#9` 由本裁决收口**：`?` 不进新分支，落进既有 `SEARCH_STOPWORDS` 零词失败支；剥标点只改变该支的触发面与报文原因。

六条 Deferred 在实施交付后一次改完，不拆轮。

### 实施交付 · 父侧核对与四条上抛的处置（2026-11-14）

**核对读数**（我自己跑，不采信交付报告）：`doc?` ∥ `doc` 逐字相等，5,710 字符；`compaction,` ∥ `compaction` 相等；`「文档」` ∥ `文档` 相等；`doc.` ∥ `doc` 相等。

83 个标识逐个自查：平均命中 1.2、超 10 条 0 例、自身落到非首位 0 例。纯标点 `?` 与 `「」` 都走显式失败并点名 `query`。

**处置一 · 报文比裁决原文多一个 `query` 字面**：采纳实施席的写法，改我这侧的裁决原文。

理由：项目规矩是缺参即拒的报文点名参数名；而 U4、RTM `53-1` ①、展开面、集成断言四处都要这个字面。照抄我原来那句会让四处同时红。

**处置二 · U5 判不出它要判的东西**：采纳实施席的加强版——`doc? doc evidence` ∥ `doc evidence` 一对，配本地错序分词器证出「去重位置」这条判得动。

**处置三 · 设计档仍欠两项**：判 Deferred，实施交付后由设计席一轮收。此刻改设计档会让凭证失效，而这两项是措辞与清单完整性，不动结构。

**处置四 · §3 一处空轮次标题**：评审席的笔，收口时不代改，记入 §6 供清理。

**一条判据要改（我这边的问题）**：裁决写的「`doc-check` 命中集合与改前相同」按字面已不成立——现在 3 条命中，改前 2 条。

但这不是分词变了：`doc-check` 在两版分词器下都产出 `["doc-check"]`，逐字相同。多出的那条是 `tool-knowledge`，因为本批给该档正文加了一句示例，句子里含 `doc-check` 这个字面。

**教训**：这条判据量的是语料，不是分词器。正确判据 = 「分词结果逐字相同」加「固定快照上的命中集合相同」，不能直接拿现树比。已记入 §6。

### 收口前置门 · 设计席修面指令（2026-11-14）

收口门拒了这一批，理由：§2 的「受影响文件（机读清单）」缺两行。判的是记录缺件，不是代码长短——两档都改过，清单里没有它们的行。

要补的两行（第三列写该档在批起快照上的内容行数，`countContentLines` 量法；只报这一个数，不写增量、不写百分比）：

- `thincoder-core/tools/knowledge.mjs` —— 基线 131
- `test/integration/knowledge-search-bounded.test.mjs` —— 基线 127

同一节里若还有别的代码档缺失，一并补齐；越 500 的档「分拆方案」列写正向形，未越线写 `—`。

禁区：不要碰 `docs/core/design/PROMPT-SYSTEM.md`。本批设计评审判 pass 且凭证已签发，那档的字节被凭证封着，改它会让后续 spawn 被拒。需求档与代码档同样不碰。

只补记录，不改任何判定与措辞。

## §2 批次任务与设计（eng-designer）
**状态行**：设计完成（乙方案已由父侧裁决收口；设计档 §6 与 §9 同轮落盘）

<§2 模板占位：本批条目（覆盖） / 设计档落点 / 机制设计 / 受影响文件与测试覆盖 / 验收对照 / 关键决策 / 上抛项>

<§2 模板占位：机读清单 = 标题行「**受影响文件（机读清单）**」+ 围栏内三列表（表头 | 档 | 分拆方案 | 行数 |、分隔行 |---|---|---|、一行一档，只列代码档（源 ∥ 单测））；第二列：越设计时线的档写正向形方案（点名带目录段的档 + 本批落步 `实施轮` ∥ `§5`），未越线写 —；第三列：该档在批起快照上的内容行数（量法 = `countContentLines`），快照里没有这一档写 `新`；示例行 = | thincoder-core/agent-tools/batch-tier-gate.mjs | — | 新 |>

### 条目（覆盖台账 #2423）

| 编号 | 条目 | 依据 |
|---|---|---|
| K-1 | 分词时剥去每个词首尾的标点与符号、保留词内字符，使 `doc?` 这类查询按 `doc` 检索 | 台账 #2423；需求 `docs/core/requirements/PROMPT-SYSTEM.md` §6 表 search 行「按用户给出的关键词查找相关主题，并返回有界定位片段」 |
| K-2 | 只有标点的查询（`?`）在工具门口显式失败并点名 `query`，不退化成零命中回执；报文点名真正的原因 | 同档 §6 末句「查询不到时如实返回无匹配，不编造答案」 |
| K-3 | 零命中回执措辞的核对结论：本批之后不变 | 本批 §1「回执随之核对」；结论见「关键决策」节「零命中回执措辞不变」一条 |
| K-4 | 设计档与提示词展开面同轮对齐 | 一条规则在所有层同轮改；`test/rtm/tooling.md` CLI 53 节注已把机制单源指到设计档 §6 |

### 设计档落点（本席已落盘）

`docs/core/design/PROMPT-SYSTEM.md` §6 五处 + §9 一处：

- 动作表 `search` 行：补「每个词剥去首尾标点」。
- 检索面段落：换成七步流水线（切词 → 逐个转小写并剥首尾标点 → 去空词 → 去重 → 去停用词 → 排序），写清剥的字符类与词内不拆。
- 「为什么首尾剥而不是整串拆」段：判据落在「主题标识无一例外都带连字符」这条语料事实上。
- 「已知边界」两段：词内标点（`doc/check` ∥ `doc—check` ∥ `v4.1` ∥ `tool-batch(eng)` 零命中）与 `C++` 剥成 `c` 的新噪声。
- 0 命中回执段：补「剥标点之后零命中意味着关键词本身不在语料里，措辞不变」。
- §9 验证清单：补「只有标点查询的显式失败」「标点查询剥去首尾标点后命中而整词标识不被拆开」「逐标识自查」。

### 机制设计

落点 = `thincoder-core/tools/knowledge.mjs` 的 `tokenizeQuery` 一个函数。流水线顺序是硬约束：

1. `query.toLowerCase()`
2. `split(/\s+/)` 后 `filter(Boolean)`
3. 逐词剥首尾：`token.replace(/^[^\p{L}\p{N}\p{M}]+|[^\p{L}\p{N}\p{M}]+$/gu, "")`
4. 丢掉剥空的词
5. `new Set(...)` 去重 —— **必须在剥之后**
6. 去 `SEARCH_STOPWORDS`
7. `sort()`

**第 5 步的位置是硬约束**：先去重再剥，`doc? doc` 会留下两个 `doc`，`titleHits` 与 `totalHits` 各计两次，片段也重复占字符预算。单测 U5 专判这一处。

零词分支的报文要改一句。现文是「query has no searchable word after stopword filtering」，而只有标点的查询是被剥标点清空的，报文会把原因说错——正是本批在治的那一类误导。

改为点名两种原因（去标点与去停用词之后没有可检索词），「换成具体名词 ∥ 先 `list`」的下一步不变。

该串全仓只有 `knowledge.mjs` 一处（`git grep "stopword filtering"` 实跑，命中一行），没有第二处依赖它。

`scoreTopic` / `boundedHits` / 三个上限常量 / 零命中回执文本零改。`tokenizeQuery` 仍是模块内私有函数，导出面不变——用例经 `knowledgeTool.execute` 判，不为测试开口子。

### 取舍：甲（整串剔标点）∥ 乙（逐词剥首尾）

读数（本席本轮实跑：导入 `readKnowledgeEntries()` 取 83 份主题，按两种分词各跑一遍 `scoreTopic` 的命中口径）：

| 查询 | 现（不剥） | 甲：`replace(/[^\p{L}\p{N}\s]/gu, " ")` | 乙：逐词剥首尾 |
|---|---|---|---|
| `doc?` | 0 命中 | 31 命中 | 31 命中 |
| `doc-check` | 2 命中 · 标题级 1 · 正文 6 | **48 命中 · 标题级 9 · 正文 515** | 2 · 1 · 6（一字不动） |
| `PROMPT-SYSTEM.md` | 0 命中 | **28 命中**（`md` ∥ `prompt` ∥ `system` 的噪声） | 0 命中 |
| `compaction,` | 0 命中 | 2 命中 | 2 命中 |
| `「文档」` | 0 命中 | 9 命中 | 9 命中 |

裁定 = **乙**。判据是第二行：`doc-check` 是主题标识，甲把它拆成 `doc` 与 `check` 两个遍地命中的词，命中面 2 → 48，整词信号被自己抹掉；乙对它一字不动。

甲在 `PROMPT-SYSTEM.md` 一行同样失准：拆出的 `md` 让 28 份主题入选，交付的是噪声而不是「语料里没有这一串」。

甲唯一的优势形态是**不带空白**的连写（`knowledge,retrieval`：甲 11 命中、乙 0），但本批没有任何读数或报告支持它是真实场景。为没现身的输入改分词主路径，就是给不存在的场景加分支。

乙这条边界写进设计档 §6 的边界句，不在本批做。

第三种形态（先整词试、未命中再按标点拆的回退支）本席不采：同样是给没现身的输入加一条支，还让同一查询有两条计分路径，命中数不再可预测。

**父侧裁决（2026-11-14）：采用乙，方案选择到此收口。** 父侧另跑了一遍语料自查——把每个主题标识各自当查询词检索全部主题，按 `scoreTopic` 的真实检索面与同一组排序键：

| 分词 | 平均命中 | 命中 > 10 条的标识数 | 自身落到非首位 |
|---|---|---|---|
| 现版（只按空白切） | 1.2 | 0 | 0 |
| 甲：整串剔非字母数字 | 70.3 | 79 | **6** |
| 乙：逐词剥首尾 | 1.2 | 0 | 0 |

甲那 6 例错位全是查兄弟工具拿到别人的文档：`tool-ledger` → `tool-ledger-read`、`tool-ls` → `tool-lsp`、`tool-memory` → `tool-memory-read`、`tool-process` → `tool-process-read`、`tool-settings` → `tool-settings-read`、`tool-team-ledger` → `tool-team-ledger-read`。

根因一条：随包主题标识无一例外都含连字符（本席实跑复核 = 83 个标识全部含连字符），整串剔标点等于把语料里唯一稳定的标识符形式打散。

本席复跑的射程只有第二列与第四列（现版 ∥ 乙）：两列三行读数与父侧逐项相等；第三列（甲）是父侧读数，本席未复跑那一列——上表把它留着是因为它是裁决的判据，不是因为本席量过它。

单查询侧本席量过甲：`doc-check` 在甲下 48 命中（标题级 9、正文 515），现版与乙同为 2 命中（标题级 1、正文 6），与父侧自查所指的同一现象一致。

**受影响文件（机读清单）**

```text
| 档 | 分拆方案 | 行数 |
|---|---|---|
| thincoder-core/tools/knowledge.mjs | — | 131 |
| test/integration/knowledge-search-bounded.test.mjs | — | 127 |
| docs/batches/2026-11-14-knowledge-tokenize-punctuation.test.mjs | — | 新 |
```

读数取法 = `countContentLines`（`thincoder-core/agent-tools/batch-tier-gate.mjs`）过 `git show 42c72b0bce1d12daa36fb2a6e01394afa7e93a41:<档>` 的文本；第三档在快照里不存在 ⇒ `新`。

三档均未越 500 行设计时线 ⇒ 分拆方案列 `—`。

### 其余改动面（.md 与产品文本档，不带行数读数）

| 档 | 改什么 | 落步 |
|---|---|---|
| `docs/core/design/PROMPT-SYSTEM.md` | §6 四处 + §9 一处（机制单源） | 设计轮 · 本席 · 已落盘 |
| `thincoder-core/prompts/knowledge/tool-knowledge.md` | 展开面切词口径同步，并补一行「词内原样、整词检索」；逐字文本见下 | 实施轮 · 产品文本档由实施席落笔 |
| `test/rtm/tooling.md` | CLI 53 节注的目的句、53-1 行的怎么做 ∥ 怎么算通过按本批增量改写 | 实施轮 |
| `test/integration/knowledge-search-bounded.test.mjs` | 首回合加第四次真调用，断言加一段（见「集成增量」） | 实施轮 |

`thincoder-core/prompts/knowledge/tool-knowledge.md` 逐字替换 —— 第 6 行一行换两行，正文其余零动。

改装前那一行：

`Search splits the query on whitespace, lowercases it and drops high-frequency function words (`the`, `of`, `a`, `的`, `了` …).`

改装后两行：

`Search splits the query on whitespace, lowercases each word, trims the punctuation at both ends of each word and then drops high-frequency function words (`the`, `of`, `a`, `的`, `了` …).`

`A word's inner characters stay as written, so `doc?` searches `doc` while `doc-check` is searched whole.`

### 用例表（单测，收口删除）

| # | 用例 | 判据 |
|---|---|---|
| U1 | `execute({action:"search",query:"doc?"})` 与 `execute({action:"search",query:"doc"})` | 两份回执逐字相等 |
| U2 | 同上对 `"compaction,"` ∥ `"compaction"`；`"「文档」"` ∥ `"文档"` | 逐字相等 |
| U3 | `"doc-check"` ∥ `"doc"` ∥ `"check"` 三份回执的 `matched` | `matched(doc-check) < matched(doc)` 且 `matched(doc-check) < matched(check)`——整词标识不被拆开（甲式做法会反过来） |
| U4 | `"?"` | 显式抛错并点名 `query`，报文说明去标点与去停用词后无可检索词、并给下一步；不是零命中回执 |
| U5 | `"doc? doc"` 与 `"doc"` | 两份回执逐字相等——去重发生在剥标点之后 |
| U6 | 语料自查：每个主题标识各自当查询词跑一遍 | 平均命中与现版相等、命中超 10 条的标识 0 个、自身落到非首位 0 个（乙与现版逐项相等；甲式做法三项全红） |

U3 与 U6 都只判关系不判数：语料增删后关系仍成立，写死命中数会在主题变动时变成假红。U6 是「乙与现版逐项相等」这条断言唯一可复跑的形式，也是父侧点名的那一面。

### 验收对照（需求 → 判据）

| 需求出处 | 判据 | 判它的面 |
|---|---|---|
| 需求 §6 表 search 行「按用户给出的关键词查找相关主题，并返回有界定位片段」 | 带标点的关键词按去首尾标点后的词检索：`doc?` 与 `doc` 回执逐字相等，`compaction,` 0 → 2、`「文档」` 0 → 9；整词标识的命中集合与现版相同，且逐标识自查不外溢 | 单测 U1–U3 ∥ U6 + 集成 `CLI 53-1` ④ |
| 需求 §6 末句「查询不到时如实返回无匹配，不编造答案」 | 只有标点的查询显式失败并点名 `query`；真无匹配仍返回零命中回执且两条下一步在场 | 单测 U4 + 集成 `CLI 53-1` ③ |
| 需求 §9.2「未知主题与无匹配有明确结果」 | 两类面各自点名下一步，都不靠猜 | 集成 `CLI 53-1` |
| 标准层 `docs/core/standards/CODE-TIER.md` §3 | 改动集中在 `tokenizeQuery` 一个函数，实施轮复量它不进 50–100 行审视带 | §5 的读数 |

### 集成增量（对 `test/RTM.md` 的 delta，按用例名点名）

- **改写 `CLI 53-1`**：标题补「标点查询去标点命中」；节注目的句补同一面；怎么做加第四次真调用 `{action:"search",query:"doc?"}`；怎么算通过加 ④「该次回执不是零命中回执，而是一份 `matched > 0` 的紧凑 JSON，外层 `matched` ∥ `shown` ∥ `truncated` 三键齐备」。
- **新增**：无。
- **删除**：无。

不另开 53-2：同一进入口再起一整轮会话只为多打一个查询，判的仍是同一组回执面；第四次调用搭在同一次会话里，成本近乎零。

「RTM 53-1 判据行补充」= 上面那条 ④。语料自查那一面（每个标识自查）留单测 U6，不塞进集成用例：83 次真调用会把一次会话拖成 83 次工具调用，而它判的是同一个 `tokenizeQuery`，单测在同一入口上判得更直接。

### 边界（本批不做）

- 词内标点不拆：`knowledge,retrieval`、`doc/check`、`doc—check`、`v4.1`、`tool-batch(eng)` 这类写法仍整词匹配，语料没有该串就零命中（取舍结果，不是待修缺陷）。
- `C++` 这类输入：现版零命中，剥首尾之后只剩单字母 `c`、命中面等价于查 `c`，由两个上限兜住——这是本批引入的新面，设计档 §6「已知边界」如实这么记，不写成效已存在。
- 上面两条边界由父侧另挂台账行，本批不实现、不造机制。
- 交付面另一个口径确认：`doc-check` 的命中集合与现版相同（现版 2 条、首位 `tool-doc-check`）。
- 不做中文分词、不做 Unicode 归一化（会改变长度的字符让片段错位 = 台账 #2419，条件触发）、不动三个上限常量、不动消息投递链与桌面 / VSC 面。
- 零命中回执的措辞不改（见「关键决策」节「零命中回执措辞不变」一条）。
- `get` ∥ `list` 语义、主题正文与 `aliases:` 数据面零改。

### 关键决策

1. **取乙不取甲**：判据与读数见「取舍」节。被否的甲记在这里，是因为它的代价（整词标识被拆散、`md` 一类噪声）下次有人再提「一行就够」时会重演。
2. **剥的是「非字母非数字非组合附加符」的首尾字符**：用 `\p{L}\p{N}\p{M}` 而不是 `\p{P}` 枚举，中文括号、全角标点、表情符号一次覆盖。
3. **`\p{M}` 留在保留面**：组合附加符属于它依附的那个字母，剥掉会给带变音符号的印欧文字切掉末字母。
4. **零命中回执措辞不变**（回答 §1 的核对要求）：剥标点之后标点差异不再产出零命中，剩下的零命中意味着去标点后的关键词本身不在语料里。
5. **两条建议仍指对方向**：「换一个英文关键词 ∥ 先 `list`」对真无匹配仍成立，回执也仍按原样回报用户输入的查询串。
6. **去重位置前移到剥标点之后**：这不是风格，是计分正确性——重复词会把 `titleHits` 与 `totalHits` 各计两次。
7. **导出面零改**：`tokenizeQuery` 保持私有，用例走 `knowledgeTool.execute` 这条真入口。为测试导出内部函数会让「切词」变成公开契约，以后每次调整都要对它兼容。

### 上抛

无待裁项。两处由本席在权限内落定、报告里点名让主 agent 知情：

- 零词失败报文的措辞改动（「after stopword filtering」→ 点名两种原因）：需求档只规定「显式失败并点名 `query`、给出下一步」，报文原文归设计档 §6；本笔已同轮写入设计档，属设计档内的规则收正，不是需求变更。
- 第三种分词形态未采、乙的词内连写边界写入设计档 §6 边界句：为该边界建台账行属主 agent 的笔，本席只报不改。

## §3 设计评审（评审子代理）
**状态行**：评审通过



### 轮次 1（评审子代理）

| # | 严重度 | 状态 | 证据 |
|---|---|---|---|
| 1 | 🟡 | 待处置 | 设计 §6「并给出下一步（换成具体名词重查）」只点名一条下一步；`thincoder-core/tools/knowledge.mjs` 现文为「or call list for every topic id」，`test/rtm/tooling.md` CLI 53-1 ① 要求「报文点名 `query` 且给下一步」且用例 `assert.match(stopwords, /list/)` |
| 2 | 🟡 | 待处置 | §2 用例表 U6「平均命中与现版相等」无基线载体（改后无「现版」分词器），同节又写「U3 与 U6 都只判关系不判数」 |
| 3 | 🟡 | 待处置 | §2「集成增量」只改「节注目的句」；`test/rtm/tooling.md` CLI 53 节注「首回合派三次 `knowledge` 调用…这三条工具结果」与用例档头注「派三次真 `knowledge` 调用」在加第四次调用后失准；也未写故事名 H2 与 `test/RTM.md` CLI 53 行是否随标题变 |
| 4 | 🟡 | 待处置 | §2 无最近先例行（先例坐标 + 对齐 ∥ 偏离理由）；前一批只在 §1 头注「前情 = docs/batches/2026-11-14-knowledge-search-quality.md」出现，「取舍」节是方案survey 不是先例对齐 |
| 5 | 🟡 | 待处置 | §2 无勘察证据行；`§1`「库外 = 未查：无外部断言」写的是主 agent 段，§2 未记录查过哪些公开源文档 |
| 6 | 🟡 | 待处置 | §2「读数取法 = `countContentLines`…过 `git show 42c72b0…:<档>` 的文本」给的是量法不是可跑命令；读数本身经复核（`knowledge.mjs` 131 ∥ 集成用例 127 ∥ 第三行 `新` 合批单测档先例） |
| 7 | 🟡 | 待处置 | §2「设计档落点」写「§6 五处 + §9 一处」，「其余改动面」同档写「§6 四处 + §9 一处」；「上抛」另披露的零词报文改写不入任何一数；「设计档落点」第二条写「七步流水线」而括注只列六步 |
| 8 | 🟡 | 待处置 | 设计 §9 验证清单句「包含锚缺档、重复主题、未知主题、坏别名声明的加载期失败…标点查询剥去首尾标点后命中而整词标识不被拆开、逐标识自查…」未收 §6 已裁决的两面：去重在剥之后（U5 判的那条）与零词报文点名两种原因 |
| 9 | 🔵 | 备注 | 设计 §6「只有标点的查询（`?`）走的就是这一支」——`?` 无引用观测，是把新输入接进既有 `SEARCH_STOPWORDS` 零词支，未一句话说明「非新支」，与「给没现身的输入加分支」的裁决面相近 |
| 10 | 🔵 | 备注 | 设计 §6「这是剥首尾标点换来的新面，不是早已存在的问题」以改前状态作参照，将来的读者无此参照 |

VERDICT: pass
计数：🔴 0 · 🟡 8 · 🔵 2

### 轮次 2（评审子代理）

### 轮次 2（评审子代理 · 实施交付代码评审）

| # | 严重度 | 状态 | 证据 |
|---|---|---|---|
| 1 | 🟡 | 待处置（建议 row，非 must-fix） | 零词报文：`tokenizeQuery` 现文 = `No searchable word in query ${JSON.stringify(query)} after stopword...`，§1 父侧裁决第 1 条标为「本表为准」的逐字文本是 `No searchable word in "<query>" after...`（无 `query` 一词）；且 `docs/core/design/PROMPT-SYSTEM.md` §6 仍写 `并给出下一步（换成具体名词重查）` 只一条。实质三项（点名 query ∥ 两种清空原因 ∥ 两条下一步）已满足，差在一词与逐字口径 |
| 2 | 🟡 | 待处置（协调项，非代码缺陷） | 过程记录 §5 空白：`## §5 实施记录（eng-coder）` 之后直接是 `## §6 验证与收口（父代理）`；§2 验收对照末行的 `实施轮复量它不进 50–100 行审视带` 要求带 §5 读数，运行证据亦无落处 |
| 3 | 🔵 | 备注 | 批单测 U5 第二面的判别力只写在注释里（`上面那一发判不出顺序`），错序分词器不在用例内，语料变动后该面可能静默失去判别力 |
| 4 | 🔵 | 备注 | 展开面 `A query left with no word fails explicitly and names \`query\` — type a concrete noun instead of retrying the same shape.` 只点名一条下一步，回执实给两条；与设计席待补的 §6 一条同源 |
| 5 | 🔵 | 备注 | U3 硬写 `tool-doc-check` 标识；U6 已按「只判关系不判数」写，U3 这一处仍是语料点名的硬码 |

结论：乙方案七步流水线按 §2 硬约束落盘（去重在剥之后），导出面零改，集成 ④ 与 RTM 53 增量按裁决 #3 落齐，未发现业务门回退或静默简化。

VERDICT: pass
计数：🔴 0 · 🟡 2 · 🔵 3

## §4 用户批准（主 agent）

批准面 = 需求「按用户给出的关键词查找相关主题」+ 设计 `PROMPT-SYSTEM` §6 七步流水线 + 本档 §2 任务书。

用户原话：「**知识库那条你开工，回条消息告诉他。**」（2026-11-14，含开工词「开工」并附「回条消息」一项）。

采纳的裁决：分词采用乙（逐词剥首尾标点、保留内部连字符），甲（整串剔非字母数字）被 83 个标识的自查读数否掉——甲平均命中 70.3、6 个标识自身落到非首位。

自动推进：本批在会话既有的全链授权下走完设计 → 评审 → 实施 → 收口，中间未逐条回问。

不做面：不修词内标点（`doc/check` ∥ `v4.1` 仍零命中）、不给单字母 token 设长度门、不动 `scoreTopic` 与三个上限。

## §5 实施记录（eng-coder）
**状态行**：实施完成（乙方案七步流水线落盘 · 批单测 6/6 · 集成 53-1 1/1 · 提示词两套件 6/6 · 审计 1 轮 + 代码评审 1 轮 pass · 终态 clean）



### 交付摘要

一处机制 + 四处同步，全部落盘（实施席只改声明面内的五个档，无第六档）：

- **机制** = `thincoder-core/tools/knowledge.mjs` 的 `tokenizeQuery`（模块内私有，导出面零改）：`toLowerCase()` → `split(/\s+/)` → `filter(Boolean)` → 逐词 `replace(/^[^\p{L}\p{N}\p{M}]+|[^\p{L}\p{N}\p{M}]+$/gu, "")` → 丢空词 → `new Set` 去重（在剥之后）→ 去 `SEARCH_STOPWORDS` → `sort()`。`scoreTopic` ∥ `boundedHits` ∥ 三个上限常量 ∥ 零命中回执文本零改。
- **零词报文改一句**：点名两种清空原因（去首尾标点、去停用词）并保留两条下一步。
- **展开面** `thincoder-core/prompts/knowledge/tool-knowledge.md`：按 §2 的逐字替换，第 6 行一行换两行，正文其余零动。
- **RTM** `test/rtm/tooling.md` CLI 53：目的句补标点面、节注进入口「派三次」改四次并点名第四次调用、53-1 的怎么做与怎么算通过各补 ④；故事 H2 与 `test/RTM.md` 的 CLI 53 行按 §1 裁决 #3 未动。
- **集成** `test/integration/knowledge-search-bounded.test.mjs`：首回合第四次真调用 `{action:"search",query:"doc?"}`、档头注三→四、用例标题补「标点查询去标点命中」、断言 ④。
- **批单测** `docs/batches/2026-11-14-knowledge-tokenize-punctuation.test.mjs`：U1–U6（收口删除）。

### 需求 → 交付对照

| # | 条目 | 状态 | 落点与判它的一面 |
|---|---|---|---|
| K-1 | 剥首尾标点、保留词内字符，`doc?` 按 `doc` 检索 | ✅ | 单测 U1 ∥ U2 ∥ U5 + 集成 53-1 ④ |
| K-2 | 只有标点的查询在门口显式失败并点名 `query`、报文点名真正原因 | ✅ | 单测 U4 + 集成 53-1 ① |
| K-3 | 零命中回执措辞本批不变 | ✅ | 该行未进改动 hunk；集成 ③ 仍绿 |
| K-4 | 设计档与展开面同轮对齐 | ✅（实施面） | 展开面逐字替换已落；设计档 §6/§9 归设计席，见「落地核对」 |
| U1–U6 | §2 用例表 | ✅ | 6 条全绿，见「读数」 |
| 集成增量 | 改写 `CLI 53-1`（不另开 53-2） | ✅ | 第四次真调用 + ④；标题、头注、节注、判据行同轮改齐 |
| CODE-TIER §3 | `tokenizeQuery` 不进 50–100 行审视带 | ✅ | 读数见下 |

### 读数（命令 + 结论；全部 2026-11-14 16:2x–16:4x 实跑）

| 面 | 命令 | 结论 |
|---|---|---|
| 批单测 | `node --test docs/batches/2026-11-14-knowledge-tokenize-punctuation.test.mjs` | tests 6 · pass 6 · fail 0 |
| 集成（本批改的用例） | `node --test test/integration/knowledge-search-bounded.test.mjs` | tests 1 · pass 1 · fail 0 |
| 提示词展开面两套件（展开面正文改过） | `node --test test/integration/tool-description-tiers.test.mjs` | tests 2 · pass 2 · fail 0 |
| 同上 | `node --test test/integration/tiny-mode.test.mjs` | tests 4 · pass 4 · fail 0 |
| 行数（量法 `countContentLines`，`thincoder-core/agent-tools/batch-tier-gate.mjs`） | 对三档现文 | `knowledge.mjs` 143（批起 131）· 集成用例 138（批起 127）· 批单测 160（批起 `新`）；三档均 ≤ 500（设计时）∥ ≤ 800（收口时） |
| 函数档（CODE-TIER §3） | 对 `tokenizeQuery` 函数体现文 | 14 内容行，未进 50–100 审视带 |
| 改前红侧（同目录临时档 = `git show HEAD:thincoder-core/tools/knowledge.mjs`，跑完即删） | 对同一批查询直调 `knowledgeTool.execute` | `doc?` ∥ `compaction,` ∥ `「文档」` 各回零命中回执（0 命中）；`?` 不是失败而是 15 份主题命中；`doc-check` 2 命中、首位 `tool-doc-check` |
| 改后同批查询 | 同上 | `doc?` 命中 32 ∥ `compaction,` 2 ∥ `「文档」` 9 ∥ `?` 显式失败 ∥ `doc-check` 3 且首位仍是 `tool-doc-check` |
| 甲式对照（整串剔标点，同目录临时档，跑完即删） | 同上 | `doc-check` 49 命中（乙 3）；`PROMPT-SYSTEM.md` 28 命中（乙零命中回执）——与 §2 取舍表的判据一致 |
| 逐标识自查（批单测 U6 内，真入口 × 83） | 见上批单测命令 | 乙与「只按空白切」的现版在 83 个标识上命中集合与名次逐项相等；自身首位 0 例外；命中 > 10 条 0 例；甲式对同一面 83/83 分歧、6 例自身掉首位 |

**读数时刻要说明的一句**：上表改后读数在展开面改动之后取；展开面新增那句含 `doc?` ∥ `doc-check` ∥ `doc`，把 `tool-knowledge` 这条主题推进了 `doc` 家族的命中面，所以 `doc?` 与 `doc-check` 的命中数各比 §2 取舍表（31 ∥ 2）多一条。判据不据此定数（U3/U6 只判关系），差异如实记在这里。

### 决定披露（逐条）

1. **零词报文在裁决逐字文本里多一个词**：§1 裁决 #1 的逐字文本是 `No searchable word in "<query>" after stopword and punctuation filtering — replace it with a concrete noun, or call list for every topic id`；实施文本 = `knowledge search: No searchable word in query ${JSON.stringify(query)} after stopword and punctuation filtering — replace it with a concrete noun, or call list for every topic id`。多出的两处：模块既有前缀 `knowledge search: `（同档另两句错误沿用同一前缀），与插值前的 `query `——裁决原文不含字面 `query`，而 §2 U4「点名 `query`」、RTM 53-1 ①「报文点名 `query`」、展开面「fails explicitly and names `query`」、集成 `assert.match(stopwords, /query/)` 四处都要它。四条判据与裁决逐字两条相撞，实施席满足前四条并在本条披露，未擅改任何判据。
2. **U5 追加第二对输入 + 本地错序对照**：§2 点名的那一对 `"doc? doc"` ∥ `"doc"` 保了下来，但它判不出去重位置——实测把分词改成「先去重再剥」，两份回执仍逐字相等（重复词把所有入选主题的两项计数同倍放大，回执里没有计数）。故另加 `"doc? doc evidence"` ∥ `"doc evidence"`，并在用例内用本地「先去重再剥」分词器断言它在同一输入上给出不同的名次表：这一面判得动，是被机械证出来的，不靠注释。
3. **U6 在 §2 判据之上加两列**：`mirrorDrift`（真入口与本地复算的命中集合与名次必须一致，防本地对照分词器自说自话）与 `punctuationDrift`（每个标识带一个尾标点查一次，必须与不带标点那一发逐字相等）。第二列是现版分词必红的正面对照。
4. **U3 加一条首位断言**：`doc-check` 首位仍是 `tool-doc-check`。§2 U3 的判据列只要不等式，但 §2 边界的交付面口径写了同一事实（现版首位 `tool-doc-check`），取的是对齐而不是加码。
5. **代码头注里的「片段重复占预算」删掉**：`scoreTopic` 的 `spans` 会吞掉同一主题内重叠片段，重复词不改片段集合，改的是 `titleHits` ∥ `totalHits`。头注改写成实测到的后果（名次被抬高），不写没发生的事。

### 审计与评审轮次（终态）

- **内部审计**（只读 explore，对照 §2 全节 + §1 裁决逐条）：`AUDIT VERDICT: 2 findings`，两条均 🔵 已披露项（零词报文逐字口径、设计席仍欠的 §9 两项）；四类静默偏离——部分实现 ∥ 静默简化 ∥ 档漂移 ∥ 越清单——零命中。审计对清单外面另核了一遍 `git status --short` 的其余项，判为设计席本轮落盘与另一并行批次，与本交付无关。
- **代码评审**（advisor type=code，第 1 轮）：`VERDICT: pass`（🔴 0 · 🟡 2 · 🔵 3），结论落 §3 轮次 2。处置：🟡 之一（§5 空白）由本条落地；🟡 之二（零词报文逐字口径）交父侧在 §1 或设计 §6 收口，不属实施席的笔。🔵 三：两条当场修（U5 加错序对照、U3 加注释说明硬码理由），第三条（展开面第 8 行只给一条下一步）与设计席 §6 补齐同轮处理。
- **修轮**：1 轮，落上述两条 🔵 后重跑批单测，6/6 仍绿。
- **终态**：`clean`（审计 1 轮 + 评审 1 轮 + 修 1 轮，无未处置的 🔴，🟡 全部有归属）。

### 落地核对

- 无设计档句子被本次落地推翻。零词报文的逐字文本出自批次档 §1「设计评审第 1 轮 · 父侧裁决」第 1 条（过程档，非设计档），原文 `逐字文本 = No searchable word in "<query>" after stopword and punctuation filtering — replace it with a concrete noun, or call list for every topic id`；实施文本在插值前多 `query `，理由见「决定披露」第 1 条，请父侧在 §1 该行或设计 §6 补齐时二选一收口。
- `docs/core/design/PROMPT-SYSTEM.md` §6「knowledge 工具」那句 `报文说明查询在去标点与去停用词之后没有可检索词，并给出下一步（换成具体名词重查）` 只点名一条下一步，交付报文给两条：句子不假但欠齐，正是 §1 裁决 #1 已排给设计席的补齐项，不记为漂移。
- `docs/core/design/PROMPT-SYSTEM.md` §9 验证清单仍缺「去重顺序」与「报文两原因」两面（§1 裁决 #8，Deferred，设计席）。

### 债务

本批新债：无（实施席未发现需建台账行的在批面；两处词内标点边界由父侧另行挂行，见 §2 边界）。

## §6 验证与收口（父代理）

### 验证读数（父侧实跑，不采信交付报告）

**批内单测**：`node --test docs/batches/2026-11-14-knowledge-tokenize-punctuation.test.mjs` → `tests 6 · pass 6 · fail 0`。收口按纪律已删该档。

**相关集成**：`knowledge-search-bounded` 1/1；`tool-description-tiers` 2/2；`tiny-mode` 4/4。

**全量**：`node test/run.mjs` → 217 例 / 212 绿 / 5 红。五红均非本批引入：`CLI 43-1` ∥ `43-2` 归台账 `#2404`；`CLI 34-1` ∥ `34-2` ∥ `35-3` 报浏览器启动超时，孤立单跑各 3/3 全绿，归台账 `#2427`。

### 行为读数（父侧直调工具，非转述）

| 查询对 | 结果 |
|---|---|
| `doc?` ∥ `doc` | 逐字相等，5,710 字符 |
| `compaction,` ∥ `compaction` | 逐字相等 |
| `「文档」` ∥ `文档` | 逐字相等 |
| `doc.` ∥ `doc` | 逐字相等 |

**83 个标识逐个自查**：平均命中 1.2、超 10 条 0 例、自身落到非首位 0 例。整词标识未被拆开：`tool-ledger` ∥ `tool-ls` ∥ `tool-memory` 首位都是自身。

**纯标点**：`?` 与 `「」` 都抛错并点名 `query`，报文含「after stopword and punctuation filtering」。

### 一条判据的修正（记录在案）

原裁决写的「`doc-check` 命中集合与改前相同」按字面已不成立：现在 3 条、改前 2 条。

实测两版分词器对 `doc-check` 都产出 `["doc-check"]`，逐字相同；多出的一条是 `tool-knowledge`，因为本批给该档正文加了一句示例，句子里含这个字面。

教训：该判据量的是语料而非分词器。正确形 = 「分词结果逐字相等」加「固定快照上的命中集合相等」。

### 落地核对

设计 `PROMPT-SYSTEM` §6 的「下一步」只写一条，而落地报文给两条（换具体名词 ∥ `list`）；同档 §9 验证清单未收「去重顺序」与「报文两原因」两支。

处置 = 改设计档（非改代码）：落地更完整，设计档落后。排在收口后的设计席一轮，台账 `#2423` 结算不因此挂起。

### 本批新债 1 条

`#2425`（knowledge 检索：词内标点零命中 ∥ `C++` 剥成单字母噪声）。两条同源，条件触发，已在设计档 §6「已知边界」写明不造机制。

另一条 `#2424` 与本行重复，收口时撤回并把 `evidence` 指向 `#2425`。

### 文档门

`doc_check(mode:"gate", docs:["docs/core/design/PROMPT-SYSTEM.md"])` → `DOC-CHECK GATE: PASS`。本批改动面里设计档只此一份；本档自身按规矩不判。
