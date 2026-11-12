# 2026-11-12 · closeout-gate-changed-region
> 六段，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 每段只有一个作者：作者的段可 `append` 加内容、可就地改（`edit`）；非作者一概拒。
> 编制：主 agent · 2026-11-12 · 来源 = 用户 2026-11-12 16:26「不要恢复！是重写，在现在的基础上，把收口门的判域改成变更区，并且只判变更区，不得擅自扩区。」∥ 16:27「不要加减侧行，就变更区。」∥ 16:28「这只涉及收口门，不涉及写门。」。
> 台账 = #2363（core · 归批）。前情 = 无（独立批）。
## §1 讨论（主 agent）
**状态行**：已收口 2026-11-12
批起 sha = 44615d78b5f3aab2f45d19b9ff6cfd014cd0424c
<§1 模板占位：本批条目 / 关键判据 / 授权口径>

**要解决的问题**

`batch close` ∥ `status → 已收口` 现在判**整份文档**（`docs/core/design/DOC-CHECK.md` §6「判面 = 整份文档」，`thincoder-core/doc-check/index.mjs` 档头同句）。

于是收口量到的是：这份档里几年都没人碰过的旧悬空指针。它把这笔拦下，而本笔一个字都没错在那处。

2026-11-10 与 11-11 两轮曾把收口面收窄到本批改动区（`docs/batches/2026-11-10-gate-defects.md` 第 6 条 · `docs/batches/2026-11-11-batch-edit-touch-zones.md`）。

2026-11-12 的「整档重写」（`docs/batches/2026-11-11-gate-silent-when-pass.md` §37.2 的禁止清单里的「判域」一项）把这一层连同 `zones` ∥ `STOCK_LINE` 一并删掉，此后再无人回头问。

**要的形态**（用户逐字）

- 收口门的判域 = **本批变更区**，只判变更区；区外一个字都不出。
- **不擅自扩区**：不按 `+` 侧行取，不按「这份档被碰过」整份进来，不恢复 `STOCK_LINE` 一类存量读数，不加邻段 ∥ 整块 ∥ 扩区表。
- **只动收口门**：写门（`append` ∥ `edit` ∥ `.md` 落盘前）与 `doc_check` 工具面一律不动。

- **已定决定**：收口门判域改为本批变更区、只判变更区、不得擅自扩区 · 用户原话：「不要恢复！是重写，在现在的基础上，把收口门的判域改成变更区，并且只判变更区，不得擅自扩区。」 · 时间：2026-11-12 16:26

- **已定决定**：判域不按 diff 的 `+` 侧行取，按变更区取（纯删也算变更） · 用户原话：「不要加减侧行，就变更区。」 · 时间：2026-11-12 16:27

- **已定决定**：本批不改写门 · 用户原话：「这只涉及收口门，不涉及写门。」 · 时间：2026-11-12 16:28（16:32 起范围扩到工具面与提示词，见下一条）

**库内 = 已查**：`doc_search`「doc_check 文档检查 需求 功能点 验收标准」→ 命中需求档 F1–F7 ∥ AC-1–AC-9 与设计档 §1–§9（§6 = 判面）。

**库内 = 已查（续）**：查「判域按面定|本批改动区|阻断集」→ 命中 11-10 ∥ 11-11 两轮批档与 `docs/core/design/BATCH-RECORD.md` §4.9 门 ④。

**库内 = 已查（续）**：实读 `thincoder-core/agent-tools/batch-gate.mjs` 的 `evaluate`——整份 `readFileSync` 过 `judgeText`，无区间筛选。

**库外 = B 类**：改动面 = `thincoder-core/agent-tools/batch-gate.mjs` ∥ `thincoder-core/doc-check/index.mjs` 与两份文档；外部断言 = 零（仓内判定逻辑，无外部 API ∥ 版本 ∥ 协议断言）。

**已知事实（设计席必读）**

工作树现在有 159 项改动未提交（12 项已暂存的删除 + 121 项未暂存 + 25 项未跟踪）。

**批起 sha 记的是建档那一刻工作树的快照**：`44615d78…`，subject `batch-start snapshot`，第一父 = HEAD `a3daddd8…`，非 HEAD 祖先（本席早前误当成 HEAD，已按实测更正，本地实测命令与读数见下）。

`git add -A` 走临时索引把未提交与未跟踪的一并写入树，所以 `git diff <批起 sha>` 量的是「建档之后动过的字节」：实测快照对现工作树只有 **31** 档不同，那 159 项脏改动绝大部分已在快照里，不产生差值。

**明确不做**

- 不恢复 `zones` ∥ `STOCK_LINE` ∥ 三档拆分 ∥ 扩区表。
- 不改三条判据、300 阈值、批档面悬空豁免、两个时点的定义。
- 不动写门；`doc_check` 的 `report` mode 仍判整份（诊断面），`gate` mode 按变更区（16:32 决定）。
- 旧档里的旧命中不追、不补账。

**同批收正（死指针）**

`docs/core/design/BATCH-RECORD.md` §4.9 门 ④ 逐字「判定输入与阻断集单源 = `docs/core/design/DOC-CHECK.md` §2.5」——该档现在只有 §1–§9，**没有 §2.5**。

这条与本批是同一件事，同批收正，不另开批。

**落点清单（本席实读，逐条）**

- `docs/core/design/DOC-CHECK.md` §6 标题逐字「## 6. 判面 = 整份文档」——本批要改的正是这一节；§9 两个时点一并核对是否与新判域同句。
- `docs/core/design/BATCH-RECORD.md` §4.9 门 ④ 逐字「判定输入与阻断集单源 = `docs/core/design/DOC-CHECK.md` §2.5」——该节不存在，改指新落点。
- 同档 §4.9 表内另有一条逐字「`zones` = 批档本体替换区 **∪** 触达账各档改动区」——`zones` 机制已不在盘（`grep zones thincoder-core/**` 零命中），一并收正。

**判据来源一句话**：改后的两份设计档必须彼此同句、且与 `docs/core/requirements/DOC-CHECK.md` 的 F8 ∥ AC-10 ∥ AC-11 对得上。需求档那一笔已由主 agent 落盘。

- **已定决定**：任何地方与「收口门只判本批变更区」相悖的表述一律清除，不留着 · 用户原话：「任何地方有与此相悖的表述，都要清除，不要留着。」 · 时间：2026-11-12 16:33

**相悖表述清单（本席实读，逐条带原文）**

| # | 位置 | 逐字原文 | 归属 |
|---|---|---|---|
| 1 | `docs/core/design/DOC-CHECK.md` §6 标题与正文 | 「## 6. 判面 = 整份文档」 | 设计席 |
| 2 | `docs/core/design/BATCH-RECORD.md` §4.9 门 ④ | 「判定输入与阻断集单源 = `docs/core/design/DOC-CHECK.md` §2.5」 | 设计席 |
| 3 | 同档 §4.9 表内 `edit` 行 | 「`zones` = 批档本体替换区 **∪** 触达账各档改动区」 | 设计席 |
| 4 | `docs/core/design/PROMPT-SYSTEM.md` | 「`doc_check` 交付门按整档判」 | 设计席 |
| 5 | `thincoder-core/agent-tools/batch-gate.mjs` 档头 | 「**判面 = 整份文档**（§6）：不按「这次改了哪几行」挑」 | 实施席 |
| 6 | `thincoder-core/doc-check/index.mjs` 档头 | 「判面 = 交给门的那些档的**全文**（§6）」 | 实施席 |
| 7 | `thincoder-core/tool-docs/batch.md` | 「Every document is judged whole, not only the lines this round touched」 | 实施席 |

**不在清除范围**：`thincoder-core/tool-docs/doc_check.md` 的「each is judged whole」——`doc_check` 工具面本批不动，那句话仍是真的。

**清除判据**：清单外再扫一遍同义表述（「整档判」∥「judged whole」∥「不按改了哪几行挑」∥ `zones` ∥ `STOCK_LINE`），扫到即改；改完在 §5 报「实読命中数 = 0」。

- **已定决定**：清除范围只限在用面，旧批档一律不动 · 用户原话：「不要扩散到旧批档！」 · 时间：2026-11-12 16:31

**清除范围（以本条为准，上一条「任何地方」按此收窄）**

- **清**：设计档 ∥ 需求档 ∥ 工具描述面（`thincoder-core/tool-docs/**`）∥ 代码档头注 ∥ 提示词面。
- **不动**：`docs/batches/` 之下的一切旧批档——那是已发生轮次的执行记录，改它等于改写别人的账。本批自己的批档（本档）除外。
- 本批 §5 报读数时分开报：在用面命中数 ∥ 旧批档命中数（后者只报数，不改）。

- **已定决定**：工具面与提示词随动，与本批一起变更 · 用户原话：「工具面和提示词都要随动，一起变更。」 · 时间：2026-11-12 16:32

**工具面与提示词的目标态（本席实读，逐条带原文）**

| # | 位置 | 逐字原文 | 目标态 |
|---|---|---|---|
| 8 | `thincoder-core/tool-docs/doc_check.md` | 「each is judged whole, not only the lines this round touched」 | `gate` = 只判本批变更区；`report` = 仍整份（诊断面） |
| 9 | `thincoder-core/tool-docs/batch.md` | 「Every document is judged whole, not only the lines this round touched」 | 收口面只判本批变更区 |
| 10 | `thincoder-core/prompts/persona-eng-coder.md` | 「before delivering, run `doc_check(mode:"gate")` (range = the docs this session wrote, checked **whole**)」 | 去掉「checked whole」，改按变更区 |
| 11 | `thincoder-core/prompts/persona-eng-designer.md` | 「range = the docs this session wrote (the default), checked **whole**」 | 同上 |
| 12 | `thincoder-core/prompts/persona-engineering.md` | 「Each document is judged whole, not only the lines this round touched, so a pre-existing dangling pointer in a document you touch is reported too.」 | 改成只判变更区 |

**两面的分工（不扩区）**：`report` = 诊断，调用者要的是「这份档现在什么状况」⇒ 整份；`gate` = 交付判定 ⇒ 只判本批变更区。同一句话不许在两面并存两种说法。

**归属**：第 8–12 条实施笔在 eng-coder（工具面 ∥ 提示词属产品面）；设计席只写目标态与判据，不落笔。

- **已定决定**：判不出变更区的档不进判域，且零输出——不点名、不解释、不出任何行 · 用户原话：「不入判域还点个鸡巴名！对方有不需要做什么，你给那么多信息干嘛？让他胡思乱想吗！」 · 时间：2026-11-12 16:37

**主 agent 裁定：变更区的基线（取二：批起快照 → 现工作树）**

- **基线 = 批起 sha（建档快照）→ 现工作树**：`git diff -U0 <批起 sha> -- <档>` 的改动行。它量的正是「建档之后动过的字节」，提交没提交都在里面。
- **不需要收口前先提交**：取工作树而不是 HEAD，正是为了让未提交的本批改动照样被量到。早前那条「必须先提交」按实测作废。
- **没有变更区 ⇒ 零输出**：本批没改这份档、或快照认不出来，都等于没有要判的行。回执不多出一句、不点名、不写「无从判」——对方没有需要做的事，多说的每句都只会让人去猜。
- **基线取法写死在设计档**：读者要能凭一句话重算出同一个变更区，不靠「工具记过什么」。

**设计首轮复核：4 条待修（主 agent 判，修正轮按号落）**

| # | 位置 | 问题 | 要落到什么 |
|---|---|---|---|
| 1 | `docs/core/design/DOC-CHECK.md` §6 | 有两个「**入口在哪**」块（本席实读：一段在「这不是 `zones` 回来」之后，一段在「② 的失败面」之后），内容重复，后者多出 `runDocCheck` 与 `changedRegionsOf` 的完整签名 | 合成一处，保留完整签名（`changedRegionsOf(root, sha, files)` ∥ `runDocCheck(root, { docs, moment, regions })`） |
| 2 | 同节 | 「判不出变更区」的处置自相矛盾：一处写「该档**不入判域**、不回落整档判」，另一处写「`gate` mode 没有在途批档 ⇒ **按整份判**」 | 留「不入判域 + 点名」，删掉「按整份判」——按整份判就是扩区，与 §1 已定决定相抵 |
| 3 | §2 RTM delta | 只写了形状、没有号 | 读 `test/rtm/guard.md` 的 `CLI 7` 表，点名破的行与新增的行（带号） |
| 4 | `docs/core/design/BATCH-RECORD.md` `BR-88` | 该行断「`edit` 替换区外两个命中不入判集」，而 `batch-gate.mjs` 的 `evaluate` 对 `edit` 交整档视图、无区间筛选 ⇒ 判据与代码相反 | 写门本批不动 ⇒ 改该行与代码一致：`edit` 面按整档判，按变更区收窄的只有收口那一刻 |

**需求档复核：一句用户裁定在重写中丢了，已恢复**

- 现状（改前）：需求档 §4 末句是「**「不误报」与「报得出」同权。**」——「同权」把漏判与误判摆平，与用户口径相反。
- 出处：用户 2026-11-11 原话「漏就漏呗……可以接受漏报，不能接受误报」（记在 `docs/batches/2026-11-11-gate-silent-when-pass.md`，旧批档，本批不动它）。
- 已改为：**可以接受漏判，不能接受误判。** 漏掉一条，读者至多没被提醒；误报一条，人就不再信这个门——那比漏掉贵得多。判不准的就不判。
- 与设计档同向后一致：设计档 §1 逐字「判得准才判……那比漏掉一条贵得多」。

- **已定决定**：可以接受漏判，不能接受误判——判不准的就不判 · 用户原话：「可以接受漏判，不能接受误判」「写进去！」 · 时间：2026-11-12 16:39

落点：`docs/core/requirements/DOC-CHECK.md` §4 末句，逐字「**可以接受漏判，不能接受误判。** 漏掉一条，读者至多没被提醒；误报一条，人就不再信这个门，紧接着整个门作废——那比漏掉贵得多。判不准的就不判。」

它给本批的判域设计一条硬边界：**变更区算不出来就不判，不许拿整份判或猜一个区来「报得出」**。这条与设计档 §1「判得准才判……那比漏掉一条贵得多」同向。

- **已定决定**：只按当批文档判，基线取「当前这一批」，不靠扫描在途批档去猜 · 用户原话：「说好了不扩面的，只按照当批文档判，batch-lifecycle.mjs 是干什么的？」 · 时间：2026-11-12 16:44

**上一条「复核发现」作废**：我把判域挂到发现面 `findInFlightBatch` 上，才凭空长出「多份在途批档时判不出来」这个问题——那是把判域交给一个猜的步骤。

正解：谁在判，谁已经知道自己是哪一批。`batch close` ∥ `status → 已收口` 判的就是**正在收口的那份批档**；子代理的交付门有 `batchDoc` 绑定。基线就取该批 §1 的记入行，不进任何发现面。

没有「本批」可指（手工跑、无绑定）⇒ 没有要判的行 ⇒ 零输出。


- **已定决定**：失效的垃圾代码一并清除，不留着 · 用户原话：「那些失效的垃圾代码都要清除掉，别留着。」 · 时间：2026-11-12 16:46

**失效件清点（本席实读，逐条带坐标与原文）**

| # | 坐标 | 现状 | 处置 |
|---|---|---|---|
| A | `thincoder-vscode/package.json` 的 `doc:check` | 逐字 `node ../scripts/doc-check.mjs --root ..`——该脚本已随 11-12 重写删除 | 删掉这条 npm script |
| B | `thincoder-cli/scripts/doc-impact.mjs` | 逐字 `import { extractAnchors } from "../../scripts/doc-check-anchors.mjs";`——目标已删；`thincoder-core/doc-graph/anchors.mjs` 现无 `extractAnchors` 导出，无处可指 | 整档删除（无消费者，cli 的 npm scripts 里没有它） |
| C | `scripts/doc-check-linecounts.mjs` · `scripts/doc-check-paragraph.mjs` · `scripts/doc-check-targets.mjs` | 三档在 `package.json` 与全部 `.mjs` 里零引用（`doc-check-linecounts` 只 import 了 `doc-check-paragraph`，两者自成孤岛） | 三档删除 |
| D | `thincoder-core/doc-check/doc-names.mjs` | 档头逐字「`./anchors.mjs` 再导出本档」「锚判（`./anchors.mjs`）」——该档已删 | 头注改为现役面 |
| E | `thincoder-core/doc-check/doc-tokens.mjs` | 档头逐字「住 `./anchors.mjs`」「`anchors.mjs` 再导出本档的导出面」——同上 | 同上 |
| F | `thincoder-core/agent-tools/batch-paths.mjs` | 注释逐字「`thincoder-core/doc-check/anchors.mjs` 的 `isBatchFaceRef`」——该档已删，谓词现在 `thincoder-core/doc-check/existence.mjs` 的 `isBatchFace` | 改指现役符号 |
| G | `thincoder-core/doc-graph.mjs` | 头注逐字「文档里的边由 `doc-check/anchors.mjs` 的**同一次逐行遍历**旁挂产出」——现役是 `doc-graph/anchors.mjs` | 改指现役目录 |

**判据**：删/改之后，被删档名在 `thincoder-core/**` · `thincoder-cli/**` · `scripts/**` · 各 `package.json` 里 **0 命中**；实施席在 §5 报这个读数。

**落笔归属**：A–G 全是实施席（产品面），§2 的受影响文件清单要含它们——设计席下一轮把这七条折进 §2。

- **已定决定**：过时的文档与失效的代码一并清除 · 用户原话：「过时的文档，失效的代码，都要清除。」 · 时间：2026-11-12 16:48

**过时文档清点（本席抽样实读，逐条带原文；全量清单另派勘察）**

| # | 坐标 | 现状（逐字） | 实测 |
|---|---|---|---|
| H | `docs/core/design/MANIFEST.md` 三处 ∥ `thincoder-core/manifest-schema.mjs` | 「`index.docCheckExcludePaths`……**键在，今天没有消费者**」∥ 同形一句给 `docCheckExts` | `docCheckExcludePaths` **保留**（用户 16:49 裁定）；`docCheckExts` 全仓 `.mjs` 除 schema 自身零消费点 ⇒ 待确认后清除 |
| I | `docs/core/design/EDIT.md` 两处 | 「改后整份内容走引擎的 `texts`、判定区走 `zones`（依据 `thincoder-core/tools/doc-write-gate.mjs`…）」 | 该档已无 `zones` 入参（`grep zones thincoder-core/**` 零命中） |
| J | `docs/core/requirements/DOC-GRAPH.md` F2 | 「形单源 = `thincoder-core/doc-check/anchors.mjs` 的 `ANCHOR_RE`」 | 该档已删；`ANCHOR_RE` 现住 `thincoder-core/doc-check/doc-tokens.mjs` |
| K | `docs/core/design/ANCHOR-DEBT-REPAIR.md` | 「`NOTE_MARKERS` 14 词……住手跑入口」 | 该常量全仓零命中、手跑入口已删 ⇒ 整句指向不存在的东西 |

**范围**：本轮只清「指向已删对象」与「写着无消费者的键」这两类；**旧批档不动**（16:31 裁定），不属本类的历史叙述不改。

**上抛消解（主 agent 实读）**

设计席两轮报的那条「`ENGINEERING-MODE-V2.md` 仍写着判面 = 整份文档」已经不成立：该档第 1000 行现文逐字「4. **判面按面定。** 写门判交给它的那份文本……收口门（`batch close` ∥ `status → 已收口`）与 `doc_check` 的 `gate` mode **只判本批变更区**；`doc_check` 的 `report` mode 是诊断面，判整份。」——主 agent 早前那一笔已落地，设计席读到的是改前视图。

**设计档指批档：8 处待清（设计席报，本席未逐处实读，标待核）**

`TOOL-PARAM-ZERO-DEFAULTS.md` · `DESIGN-TOKEN-SETTLEMENT.md` · `CROSS-REPO-WRITE.md` · `TOOLS.md` · `PROMPT-SYSTEM.md`（四处）· `DOC-GRAPH.md`（两处：以批档为图例节点）。

判法同一句：批档可整份删除，被删之后这句话连同它承载的理由一起消失。列入本批清除面（用户 16:48 裁定：过时的文档都要清除），**实施前逐处实读确认**。

- **已定决定**：`index.docCheckExcludePaths` 保留，并且要接线（写进去必须真的生效） · 用户原话：「docCheckExcludePaths 这个是要保留的」「而且要接线。」 · 时间：2026-11-12 16:49

**接线目标态（本席实读的落点）**

- `thincoder-core/doc-check/existence.mjs` 的 `pathIndexOf(root)` 现在硬编码跳过 `node_modules` ∥ `.git` ∥ `.thincoder`（逐字 `if (e.name === "node_modules" || e.name === ".git" || e.name === ".thincoder") continue`）。接线 = 再读项目 manifest 的 `index.docCheckExcludePaths`，命中这些前缀的目录不进索引（归一与 `index.excludePaths` 同款）。
- 同一档的 `existenceHits` 逐字 `if (pathKey(token).startsWith(".thincoder/")) continue`——同一条判据侧跳过要覆盖新声明的前缀，否则索引里没有了、判据却仍按「找不到」报。
- `docs/core/design/MANIFEST.md` 三处「**键在，今天没有消费者**」改成现役行为；`thincoder-core/manifest-schema.mjs` 的注释同改。

**判据（可红）**：夹具项目在 manifest 里声明一个排除前缀，正文写一条落在该前缀下的路径形档名 ⇒ 零输出；把该声明删掉再跑同一条 ⇒ 报「档不存在」。

- **已定决定**：`index.docCheckExts` 删除 · 用户原话：「index.docCheckExts 这个我也不知道怎么用。」 · 时间：2026-11-12 16:50

**它原本是干什么的**：2026-11-09 加进来的「裸名扩展名追加项」——让项目声明 `.vue` / `.yaml` 这类额外扩展名，好让不带目录段的裸档名也能被认成档名候选，避免 `JSON.parse` ∥ `console.log` 这类代码表达式被误判成档缺。

**为什么现在删**：它赖以成立的前提已经没了。现役 `thincoder-core/doc-check/existence.mjs` 对裸名逐字 `if (!token.includes("/")) continue // 裸名：没有可找的位置，不判`——**裸名根本不判**，扩展名清单也就没有适用面；剩下一半（路径形 token 的扩展名）由内置的 `DEFAULT_DOC_EXTS` 管，不需要项目声明。

**删除面**：`thincoder-core/manifest-schema.mjs` 的默认值 ∥ 数组层与元素层校验 ∥ 注释；`docs/core/design/MANIFEST.md` 的三处（`DEFAULT_MANIFEST` 枚举 ∥ 键说明 ∥ 边界表）。删后全仓 `docCheckExts` 零命中。

**勘察回执（`explore #6`）：三张表 + 一条误报纠正**

清单规模：失效代码 23 条（含 1 处坏 import、1 条死 npm script、3 档孤儿脚本、18 条指已删对象的注释）∥ 过时文档 40 条 ∥ `DOC-DISCIPLINE.md` §3.x 死节指针 15 档 26 处 ∥ 配置键 2 个。

**它把本批的设计 §6 报成「规格与代码正面冲突，建议整节删」——这是误报，本席驳回。**

理由：设计档写的是**目标态**，代码尚未实施（本批的实施轮还没开）。它读到的 `batch-regions.mjs` 只有 `committedDocs`、`index.mjs` 没有 `region` 入参、`tool-docs/doc_check.md` 仍写整份——三处正是本批「五处目标态」表里列明的**待改项**。照它的建议删 §6，等于把一条还没实施的裁定删掉。

**处置决定（主 agent 判边界）**

- **本批只留收口门判域**：设计 §6 ∥ §9 ∥ 需求 F8 ∥ AC-10 ∥ AC-11 ∥ `BATCH-RECORD.md` §4.9。
- **清理面另开一批**：交付目标不同（收口门判域 ≠ 失效件清除），按批次生命周期第 1 条开新记录。清点结果、坐标与逐字原文随勘察报告带过去，不在这里重复写。
- **`index.docCheckExcludePaths` 接线**随后一批走：它是行为变更（有红侧判据），不是清账。

**设计评审轮 1 裁决（3🔴 · 5🟡 · 2🔵）**

| # | 判 | 处置 |
|---|---|---|
| 1 🔴 | 成立 | 需求 F8 与设计 §6 对 `doc_check` 工具面各说一套。按用户 16:32「工具面与提示词随动」判设计对、F8 那句是我早前写的旧口径 ⇒ **主 agent 已改 F8**：判域扩到 `doc_check` 的 `gate` mode，「不在此列」只剩写门与 `report`；另补一条「没有要判的行 ⇒ 不出任何行」。 |
| 2 🔴 | 成立 | AC-10 ∥ AC-11 的「区外 ⇒ 放行」那一半在 RTM delta 里没有行、也没有判读人 ⇒ 设计席补两行（先在 `test/rtm/guard.md` 的 `CLI 7` 表定号）。 |
| 3 🔴 | 成立 | 设计没写「本批新建档（快照里没有）」怎么算变更区，收口时新档可能整份不判 ⇒ 设计席补这一支：快照里没有 ⇒ 整档即变更区，并给活场景。 |
| 4 🟡 | 成立 | §6 三个新名没有三问 ⇒ 按 §8 ∥ §9 同形补。 |
| 5 🟡 | 成立 | §6 无「同类先例」行 ⇒ 补坐标 + 对齐 ∥ 偏离。 |
| 6 🟡 | 成立 | 「库外 = B 类」不点名 ⇒ 补声明源与结论。 |
| 7 🟡 | 成立 | 「判不出变更区」那支没有活场景 ⟹ 与第 3 条同批补复现命令。 |
| 8 🟡 | 成立 | §9「`judgeText` 一行不改」与 §6 必填 `region` 入参相撞 ⇒ 收窄成「判法不变，只多收一个入参」。 |
| 9 🔵 | 采纳 |「五处目标态」的现文列进 §2，设计档只留目标态。 |
| 10 🔵 | 采纳 | 函数档那一句点名两个函数（现只写「两个函数」）。 |

**「手工跑、无绑定 ⇒ 判 0 档即 PASS」那条不另列**：判定依据 = 用户 16:37「判不出就不判、零输出」，属已裁定的代价，不是缺陷；F8 现文补的那一条与此同句。

- **已定决定**：本批落盘的档都要 `git add`；变更区一律走 `git diff`，不为「未跟踪档」造特判 · 用户原话：「你要求它都git add啊！」 · 时间：2026-11-12 17:02

**这一段改掉了评审第 3 号 🔴 的落法**：原设计为「快照里没有这一档 ⇒ 整档即变更区」单开一支。改成前置条件之后，规则只剩一条——**变更区 = `git diff -U0 <批起 sha> -- <档>` 的变更行**；加进索引的新档天然是「整档新增」，不需要特判。未 `git add` 的档在 diff 里看不到 ⇒ 变更区落空 ⇒ 零输出（与其它落空同处置，不造兜底）。

**义务落点**：`thincoder-core/prompts/persona-eng-coder.md` ∥ `persona-eng-designer.md` 各一句——落盘之后 `git add` 自己写过的档，只加自己写的、不 `git add -A`。

**主 agent 裁定（用户 2026-11-12 17:44「我们不是明确了未git add的要先做git add吗？！」「为什么没落地！」）**

现状（本席实读）：`git add` 那条只写在提示词与设计档里，**没有任何一处核它有没有被遵守**；`changedRegionsOf` 对不在索引的档 `continue` 跳过 ⇒ 收口静默 PASS。

这正是本批要消灭的假绿，所以按用户裁定补一条前置检查：

- 收口时先比一次**本批写工具触达的档**与索引；有档不在索引里 ⇒ **拒收口并点名**，要求「先 `git add` 再收口」。
- 与「判不出变更区 ⇒ 零输出」不是一件事：那是**我们不知道**（沉默是对的），这是**写的人没做**（沉默就是纵容）。

**编号 17 的裁决**：六档**补行**。它们是本批 coder 自己写的档，落进本批改动面；`batch-gates-reanchor.test.mjs` 快照读数 670 已越 500 设计时线 ⇒ 按 `docs/core/standards/CODE-TIER.md` 补分拆方案（本批内拆，或在设计里写明不拆的理由与依据），不是只补读数。

- **已定决定**：收口门遇到没 `git add` 的档，自己把它 add 掉再取区间 · 用户原话：「我是说你在收口门里碰到没有git add的文件就add掉，不是说现在这个项目里的文档」 · 时间：2026-11-12 17:47

**这一段取代本节前面那条「拒收口并点名」的裁定**（那条是我读错了，把它当成了「核规矩有没有被遵守」）。

要的形态：收口臂在取变更区之前，对**本批触达的档**执行一次 `git add`（只加这些，不 `git add -A`），然后照常 `git diff -U0 <批起 sha> -- <档>`。于是：

- 新档 ⇒ 进索引 ⇒ diff 里天然是整档新增 ⇒ 整份即变更区；
- 没有「不在索引 ⇒ 跳过 ⇒ 零输出」这一支——它不再需要存在。

不造拒绝、不造点名、不造前置检查：门自己把该做的做了，然后把档判掉。

## §2 批次任务与设计（eng-designer）
**状态行**：设计完成（修正轮 10 已落：24 给复现并写明只影响索引外的档（已跟踪的照判）、25 补「验收」第 6 条并点名用例标题（档名住 §2.4 机读清单）；判据与验收前五条未动）

<§2 模板占位：本批条目（覆盖） / 设计档落点 / 机制设计 / 受影响文件与测试覆盖 / 验收对照 / 关键决策 / 上抛项>

<§2 模板占位：机读清单 = 标题行「**受影响文件（机读清单）**」+ 围栏内三列表（表头 | 档 | 分拆方案 | 行数 |、分隔行 |---|---|---|、一行一档，只列代码档（源 ∥ 单测））；第二列：越设计时线的档写正向形方案（点名带目录段的档 + 本批落步 `实施轮` ∥ `§5`），未越线写 —；第三列：该档在批起快照上的内容行数（量法 = `countContentLines`），快照里没有这一档写 `新`；示例行 = | thincoder-core/agent-tools/batch-tier-gate.mjs | — | 新 |>

### §2.1 本批条目（覆盖）

| # | 条目 | 出处 | 本批动作 |
|---|---|---|---|
| 1 | **F8 · 收口门只判本批变更区**（区内照判、区外一个字都不出、不拦不出行不出读数） | `docs/core/requirements/DOC-CHECK.md` §2 F8 | 设计落 `docs/core/design/DOC-CHECK.md` §6；实施归 eng-coder |
| 2 | **AC-10**（区外悬空放行 ∥ 挪进区内 `REFUSED`） | 同档 §4 AC-10 | 判据与夹具形状 = 设计 §6「验收」第一条 |
| 3 | **AC-11**（区外超长段放行 ∥ 区内含变更行的段超 300 照拒） | 同档 §4 AC-11 | 设计 §6「验收」第二 ∥ 四条 |
| 4 | **两面分工**：`gate` = 交付判定判变更区 ∥ `report` = 诊断判整份 | 用户 2026-11-12 16:32 裁定 | 设计 §6「两个 mode，一支判据」+ §9 收口时点行 |
| 5 | **七处目标态随动**（工具描述面三处：`doc_check.md` 两处——两 mode 判面分开 ∥ `gate` mode 会 `git add`；`batch.md` 一处）∥ 提示词面三处 ∥ `persona-eng-coder` ∥ `persona-eng-designer` 各加一句 `git add` 义务） | 同一条裁定 + 17:02 裁定 + 第 20 号裁定 | 设计 §6「七处落点与目标态」表；实施笔归 eng-coder，本席不改那五档 |
| 6 | **同批收正（相悖表述清除）**：§1 清单第 1 条（设计 §6 标题）∥ 第 2 条（`§2.5` 死指针）∥ 第 3 条（`zones` 行）∥ 第 4 条（提示词整档句，归实施席） | 批档 §1「相悖表述清单」 | 设计席已落 1–3；第 4 与代码档头注（清单 5–7）归实施席 |

**不在本批**：写门（`append` ∥ `edit` ∥ `.md` 落盘前）判域零改 · `doc_check` 的 `report` mode 判域零改 · 三条判据 ∥ 300 阈值 ∥ 批档面悬空豁免 ∥ 两个时点的定义零改 · 不恢复 `zones` ∥ `STOCK_LINE` ∥ 三档拆分 ∥ 扩区表 · 旧档里的旧命中不追不补账。

### §2.2 设计档落点

- `docs/core/design/DOC-CHECK.md` §6：整节重写 —— 判域 = 本批变更区（含基线三选一、纯删的零宽区间、段级扩区、两个 mode、七处目标态、验收）。
- 同档 §9：收口时点行拆成 `gate`（变更区）∥ `report`（整份）；「`doc_check` 工具面站在收口那一侧」那段落补一句两 mode 不同判。
- `docs/core/design/BATCH-RECORD.md` §4.9 门 ④：死指针 `§2.5` 改指 §6 ∥ §9，「判不出改动区的档」改称「变更区」。
- 同档 §4.19「文档机检门」行与「受影响面」两条：`texts` ∥ `zones` ∥ `zoneTablesOf` 的旧描述删净，改写为现役形（`edit` 交改写后整档视图，写时点整份判）。
- 同档用例表 `BR-88` 的期望与现役代码不一致 —— 已回正（`edit` 面按整档判，按变更区收窄的只有收口那一刻），见 §2.7 第 2 条。

### §2.3 机制设计

机制、判据、取值、失败面与七处目标态的逐字要求全部住 `docs/core/design/DOC-CHECK.md` §6（与 §9 叠用）——本节不重述（D2）。

要点三条，供实施席对表：

1. 变更区 = `git diff -U0 <批起 sha> -- <该档>`，`<批起 sha>` 取 §1 记入行（`baseShaOf`），**对比现工作树**，不对比 HEAD。
2. 段长按段判（段内任一行在区内 ⇒ 整段量）；行号锚与悬空按行判；纯删落零宽区间，取缝上现占位的那一段。
3. 交区间的两个调用方 = `batch-gate.mjs` 的 `evaluate`（`scope === "close"`）与 `doc_check` 的 `gate` mode；写门与 `report` mode 交 `null`。

### §2.4 受影响文件与测试覆盖

**受影响文件（机读清单）**

```text
| 档 | 分拆方案 | 行数 |
|---|---|---|
| thincoder-core/agent-tools/batch-gate.mjs | — | 191 |
| thincoder-core/agent-tools/batch-regions.mjs | — | 57 |
| thincoder-core/doc-check/index.mjs | — | 172 |
| thincoder-core/doc-check/paragraph.mjs | — | 132 |
| thincoder-core/agent-tools/doc-check.mjs | — | 80 |
| thincoder-core/tools/doc-write-gate.mjs | — | 64 |
| test/integration/batch-close-gate.test.mjs | — | 460 |
| test/integration/close-gate-fixture.mjs | — | 170 |
| test/integration/path-resolution.test.mjs | — | 190 |
| test/integration/doc-write-gate.test.mjs | — | 86 |
| test/integration/batch-ledger-bind.test.mjs | — | 234 |
| test/integration/batch-status-auto-set.test.mjs | — | 239 |
| test/integration/batch-gates-reanchor.test.mjs | 拆出 `test/integration/batch-gates-ledger.test.mjs` 与共用夹具 `test/integration/batch-gates-fixture.mjs`，本档留八例 · 本批落步 = 实施轮（§5 追记） | 670 |
| test/integration/batch-gates-ledger.test.mjs | — | 新 |
| test/integration/batch-gates-fixture.mjs | — | 新 |
| docs/batches/2026-11-12-closeout-gate-changed-region.test.mjs | — | 新 |
```

**档位结论**：十六档 = 十三档快照读数 + 三档 `新`。量法 = `countContentLines`，取 `git show 44615d78b5f3aab2f45d19b9ff6cfd014cd0424c:<档>` 的输出；记 `新` 的三档 = 本批新建的两档拆出件与一份单测档。

**越 500 的只有 `test/integration/batch-gates-reanchor.test.mjs`（670）一档** ⇒ 上表第二列带落在本批内的分拆方案（见下「拆档方案」）；其余十二档不越线。函数档读数 = `evaluate` 68 ∥ `judgeText` 17 ∥ `runDocCheck` 43 ∥ `judgedDomainDocs` 14 ∥ `paragraphHits` 32，全在 300 行线之下，无拆函数方案；`changedRegionsOf` 本批新建。单测档本批新建，记 `新`。

**拆档方案（`test/integration/batch-gates-reanchor.test.mjs`，快照读数 670，越 500 设计时线）**

- **选拆，不选「不拆 + 理由」**：`docs/core/standards/CODE-TIER.md` §2① 逐字「**过 500（> 500）⇒ 必须给分拆方案，且分拆在本批内实施**」，同条写明「硬性义务，没有裁量空间」；写不拆理由在那条之下没有立足处。
- **切点 = 这个决定由谁做**：十四例分两组。决定由批档状态门做的八例留原档——14-1 ∥ 14-2 ∥ 14-8（评审门）· 14-3（锚批门）· 14-4 ∥ 14-5（收口漏列与 §1 同序）· 14-13（补关冻结）· 14-14（被取代冻结）。
- **决定由台账行迁移规则做的六例出新档**（`test/integration/batch-gates-ledger.test.mjs`）——14-6 ∥ 14-7 ∥ 14-12（重开与回收）· 14-9（退回待讨论）· 14-10 ∥ 14-11（结清起点与双失败补偿）。
- **共用夹具 `test/integration/batch-gates-fixture.mjs`**：`ROOT` ∥ `SCRATCH` ∥ `REC` ∥ `UUID` ∥ `ledgerDir` 与 `after` 收尾，加 `makeProject` ∥ `agentOf` ∥ `ctx0` ∥ `parent` ∥ `rowsOf` ∥ `recOf` ∥ `workOf` ∥ `freshRecord` ∥ `review` ∥ `pushToSettling`（末一个两组都用：14-10 ∥ 14-12 ∥ 14-14）。
- **只在台账侧用的留在台账侧**：`writeToolMap` ∥ `runWrite`（14-6）与 `holdLedgerLock` ∥ `closeWithDoubleFailure`（14-11 ∥ 14-12）。
- **断言与用例号零改**：拆只搬用例与夹具，`CLI 14-N` 的号、断言与夹具入参一字不改；各档自建自己的 `ledgerDir`，互不串。
- **本批落步 = 实施轮（§5 追记）**：拆完三档各报一次 `countContentLines` 读数入 §5，两档都要留在 500 以下。

**设计文档面（不进行数表）**：`docs/core/design/DOC-CHECK.md` · `docs/core/design/BATCH-RECORD.md`；实施席另动 `thincoder-core/tool-docs/doc_check.md` · `thincoder-core/tool-docs/batch.md` · `thincoder-core/prompts/persona-eng-coder.md` · `persona-eng-designer.md` · `persona-engineering.md`。

**测试覆盖**：本批单测档 = `docs/batches/2026-11-12-closeout-gate-changed-region.test.mjs`（与批档同址同名，收口即删）。判读 = 同一档在改前代码上红、改后绿。

**RTM delta（`test/RTM.md` 故事 `CLI 7`）**：

- **破的 = 两行**（与 `docs/core/design/DOC-CHECK.md` §9 同集同说法）：
  - `7-22`：断的东西改了。批起快照版逐字「工具面指名三样俱全的批档 ⇒ PASS 且 checkFiles 不含它；指名同形设计档 ⇒ REFUSED 三样照报」，不点名 mode；现在两 mode 各断一半（`report` ⇒ `REFUSED` 整份；`gate` ⇒ 只判变更区）。
  - `7-14`：判据格旧指「§6（判面 = 整份文档）」，该句已不在盘 ⇒ 改指 §9 写时点。它断的东西一字未改。
- **另一组六行不属于「断的东西变了」**：`7-1` ∥ `7-2` ∥ `7-3` ∥ `7-5` ∥ `7-9` ∥ `7-13` 的范围数与拒绝断言，与本批之前同值。
  - 读数（尺 = `git show <批起 sha>:<档>` 逐行扫，中文字串走 node）：批起快照版的 `范围 N 档` 断言 = `7-1` 2 档 ∥ `7-2` 2 档 ∥ `7-5` 3 档 ∥ `7-13` 5 档；现工作树同值。
  - 破因在夹具基线：批起快照版逐字 `const sha = rev(root)` 与 `rev = rev-parse HEAD` ⇒ 旧形批 ⇒ 按设计 §6「② 的失败面」整批零输出 ⇒ 范围数与拒绝断言全落空。
  - 已改真快照（`snapshot()` = `commit-tree -p HEAD` 的旁支提交）；`snapshot` ∥ `commit-tree` 在该夹具的批起快照版上 0 命中 ⇒ 真快照基线是本批新造的。
- **`7-7` 不在破的里**：它断的等式 `范围 0 档` = `checkFiles` 0 在批起快照版与现工作树同值同形，本批不动它。
- **冗余的 = 无**：`gate` ∥ `report` 分家是本批新面，现役无一行断言两 mode 不同判。
- **缺的 = 两行**（判据与四个格 = 设计 §9「缺的」表；本行不复述）：
  - `7-24`（AC-10：区外悬空放行 ∥ 挪进区内 `REFUSED`）∥ `7-25`（AC-11：区外 400 字放行 ∥ 区内含变更行、整段超 300 拒）。
  - 读数：这两号在批起快照版测试档上 0 命中，现已在 `test/rtm/guard.md` 的 `CLI 7` 表上（该表现二十一态）。
  - `7-21` ∥ `7-23` 在批起快照上已在表，不算缺的。

### §2.5 验收对照

| 需求条目 | 设计面判据 | 判读人 |
|---|---|---|
| F8 | 设计 §6 全文 + 「变更区的两个调用方」 | 本批单测档；集成行见 §2.4 的 RTM delta |
| AC-10 | 设计 §6「验收」第 1 条 | 同上 |
| AC-11 | 设计 §6「验收」第 2 ∥ 4 条 | 同上 |
| 两面分工（16:32 裁定） | 设计 §6「验收」第 3 条 | 同上 |
| 相悖表述清除 | 设计 ∥ 需求 ∥ 工具描述 ∥ 代码头注 ∥ 提示词五面零命中（域 = 这几档；旧批档按 16:31 裁定不动、只报数） | 实施轮 `grep` 复读，读数入 §5 |

### §2.6 关键决策（含被否方案）

1. **基线取 ②（批起 sha → 现工作树），否 ① 与 ③**。① 漏掉未提交的本批改动 ⇒ 本批一字未提交时变更区为空、真缺陷照样 `PASS`，是假绿；③ 的触达账记档不记行，「碰过」不等于「改过」。② 的成立前提 = 记入行的 sha 是**建档时工作树的快照**，读盘实测成立：`批起 sha` 记入行的 `44615d78…` 是一份 subject 为 `batch-start snapshot` 的提交、**不是** HEAD 的祖先，其第一父 = HEAD `a3daddd8…`；同一快照对比现工作树只有 **31** 档不同，而工作树脏项 **159** 条 —— 那 159 项绝大部分已在快照里，不产生差值。
2. **② 的失败面与处置**：记入行若指向旧形批（sha 是当时的 HEAD、是 HEAD 的祖先），它的树里没有当时的未提交改动，差值会把批起时就带在身上的改动算成本批的。识别靠结构（`merge-base --is-ancestor`），不靠年份；旧形 ⇒ 变更区判不出来 ⇒ 这份档没有要判的行、不出任何行，不回落整档判。
3. **不按 `+` 侧行取、不用 HEAD 当基线、不按整份回落**（用户 16:26 ∥ 16:27 两条裁定）。
4. **`gate` 与 `report` 分家**（16:32 裁定）：同一句话不许两面各说一套，故 `report` 判整份、`gate` 判变更区，两者在描述面与提示词面必须分别写清。
5. **区间以必填入参交进引擎，不给缺省值**：`null` = 整份、区间表 = 只判这几行，由调用方明说 —— 缺省值等于替调用方决定判域。

### §2.7 上抛项

1. **（已消）§1 的双记入行**：§1 现只有一行动 `批起 sha = 44615d78b5f3aab2f45d19b9ff6cfd014cd0424c`；同节后面那句「批起 sha 记的是建档那一刻工作树的快照」用的是缩写形（`44615d78…`），不含 40 位串，而 `baseShaOf` 只认首个含 40 位串的行 ⇒ 不构成第二个记入行。
2. **（已落 · 号 4）`BR-88` 按代码对齐**：`edit` 面交改写后整档视图（`pending.recordView`）、无区间筛选 ⇒ 该行改成「替换区外命中照拒」，按变更区收窄的只有收口那一刻。
3. **[上抛·知会] 相悖表述清单第 4 ∥ 5 ∥ 6 ∥ 7 条不在设计席笔域**（提示词三处 + 两个代码档头注 + `tool-docs/batch.md`），按 16:32 裁定并入本批实施轮；七处目标态已写进设计 §6。

### 修正轮（编号 1–7 · 按号落）

| 号 | 改了什么 | 落在哪一节 |
|---|---|---|
| 1 | 三种说法（「不入判域并点名」∥「`gate` 没有在途批档 ⇒ 按整份判 ∥ 回执明说这一行」∥「变更区不可判 ⇒ 出点名原因与出路」）全删，换成同一句「**没有要判的行 ⇒ 不出任何行**」（不点名、不解释、不写「无从判」），并补一义：这样的档也不计入 `范围 N 档` | `docs/core/design/DOC-CHECK.md` §6 首段新增那句 ∥「判不出变更区」段 ∥「② 的失败面」段 ∥「基线从哪一批来」段 ∥「同类先例」段 |
| 2 | 两个「入口在哪」合成一处，保留四枚签名：`changedRegionsOf(root, sha, files)` ∥ `judgeText` 的 `region` 入参 ∥ `paragraphHits` ∥ `runDocCheck(root, { docs, moment, regions })` | 同档 §6「入口在哪」（前一块整块删）∥ §9「引擎里只有一个入口」的签名同步 |
| 3 | RTM delta 落号：破 2 行（`7-22` ∥ `7-14`）、缺 3 行（`7-24` ∥ `7-25` ∥ `7-26`），逐行写清断什么、改成什么 | 本档 §2.4 |
| 4 | `BR-88` 与代码对齐：`edit` 面交改写后整档视图、无区间筛选 ⇒ 替换区外命中照拒；按变更区收窄的只有收口那一刻。索引行同步 | `docs/core/design/BATCH-RECORD.md` 用例表 `BR-88` ∥ §4 索引「机检判域」行 |
| 5 | 残留扫清（同族说法的每一处）：§2.6 KD2 的「不入判域 + 点名」· §4.9 门 ④ 的「不入判集」· `PROMPT-SYSTEM.md` 的「`doc_check` 交付门按整档判」（§1 清单第 4 条）· 同义词 `判面 = 整份` ∥ `judged whole` ∥ `不按改了哪几行挑` 在设计面与需求面各扫一遍 | 见上两档 + `docs/core/design/PROMPT-SYSTEM.md`（门面实读那一行）；剩一处不在本席笔域，见下文 |
| 6 | 基线不再挂发现面：原句「`gate` mode 的基线从哪来：在途批档的 §1 记入行（同一台 `findInFlightBatch` 发现面）。没有在途批档 ⇒ …」整段换成「**基线从哪一批来：谁在判，谁已经知道自己是哪一批**」——三支（`batch close` ∥ `status → 已收口` = 正在收口的那一份批档 · 子代理交付门 = 绑定的 `batchDoc` · 两样都没有 ⇒ 零输出），并写明「门不去找那一份在途批档」。依据句带 `batch-gate.mjs` 的实读原行。§9 复查无同句 | `docs/core/design/DOC-CHECK.md` §6「基线从哪一批来」段 |
| 7 | 设计档不再指批档：§6「验收」之后那段「**同类先例**：`docs/batches/2026-11-11-gate-silent-when-pass.md` 的 E7…」整段删除（它承载的半句判据本节正文两处已写：首段「没有要判的行 ⇒ 不出任何行」∥「判不出变更区 ⇒ …不回落「整档判」」，故不补字）；同族一并清同一档 §8「同类先例」里的「成形批 = `docs/batches/2026-11-11-designer-tier-rule.md`（同批的 A 表与本批 A1 ∥ A2 同形）」，实现坐标 `assertTierPlan` 保留 | `docs/core/design/DOC-CHECK.md` §6 验收段之后 ∥ §8「同类先例」行 |

**第 2 条里的 `replace`**：盘上无此符号——`changedRegionsOf` ∥ `replacementRegionOf` 在 `thincoder-core/agent-tools/*.mjs` 与 `thincoder-core/doc-check/*.mjs` 上 0 命中（`replacementRegionOf` 随 11-12 整档重写退役）。按第 4 条口径 `edit` 面不按替换区筛，故入口块不写它，其余四件签名齐。

**复跑**：`doc_check(mode:"gate")`，`docs` = 本档三份设计档（`DOC-CHECK.md` ∥ `BATCH-RECORD.md` ∥ `PROMPT-SYSTEM.md`）⇒ 首行 `DOC-CHECK GATE: PASS`。

**7 → 删了哪一段、留了什么**

- **删**（`docs/core/design/DOC-CHECK.md` §6「验收」四条之后，整段删）：逐字「**同类先例**：`docs/batches/2026-11-11-gate-silent-when-pass.md` 的 E7（判不出改动区的档不入判集，不回落整档判）。对齐：同一条倒向——判不了就不判、一个字都不出。偏离：E7 落在「整档免不免」，本节落在「同一份档里判哪些行」——两者不在同一层，不互相取代。」删的是全段，含对那份批档路径、「E7」这个只在批档里成立的编号、以及「与 E7 不对同一层」这半句分辨。
- **留**：它真正承载的判据本节正文已经写过两处，所以这一段删掉后**一个字都不补**——首段「**没有要判的行 ⇒ 不出任何行**」（三条来路同一处置）与「**判不出变更区 ⇒ …不回落「整档判」**」。
- **同族一并清（本轮顺手，同一档同一毛病）**：§8「同类先例」行尾的「，成形批 = `docs/batches/2026-11-11-designer-tier-rule.md`（同批的 A 表与本批 A1 ∥ A2 同形）」删掉，保留实现坐标「`thincoder-core/agent-tools/batch-tier-gate.mjs` 的 `assertTierPlan`（现役三实参）」——指向盘上的符号，删批档不带走它。
- **读数**：`Select-String -Path docs\core\design\DOC-CHECK.md -Pattern 'docs/batches/20\d\d'` ⇒ **0** 命中（改前 2 命中 = §6 那条 E7 ∥ §8 那条成形批）。剩余 `docs/batches/` 命中全是模板形（`docs/batches/<批档名>.test.mjs`），不是指某一本批档。
- **其余设计档有同族（不在本批笔域，只报不动）**：`TOOL-PARAM-ZERO-DEFAULTS.md` §3 首句「需求 = 批档 `docs/batches/2026-11-07-tool-param-zero-defaults.md` §1」∥ 同档验收命令指当批单测档 · `DESIGN-TOKEN-SETTLEMENT.md`「验证命令」指当批单测档 · `CROSS-REPO-WRITE.md` 一条 `node --test docs/batches/…test.mjs` · `TOOLS.md`「存活由验收 A6 逐档读数（`docs/batches/2026-11-08-tool-desc-trim.md` §2）」· `PROMPT-SYSTEM.md` 四处「依据 `docs/batches/…`」引批档逐字 · `DOC-GRAPH.md` 两处以批档为图例节点。同族判法同一句：批档可整份删掉，被删之后这句话连同理由一起消失。
- **复跑**：`doc_check(mode:"gate")`，`docs` = `docs/core/design/DOC-CHECK.md` ⇒ 首行 `DOC-CHECK GATE: PASS`。

**已消解（原上抛，修正轮 8 收）**：`docs/core/requirements/ENGINEERING-MODE-V2.md` 第 4 条现文逐字「4. **判面按面定。** 写门判交给它的那份文本」——与本批已定决定同向，不再上抛（§1「上抛消解」已记）。

### 修正轮 2（评审轮 1 裁决 · 编号 2–10 按号落）

| 号 | 改了什么 | 落在哪一节 |
|---|---|---|
| 2 🔴 | AC-10 ∥ AC-11 的「区外 ⇒ 放行」有了集成行与判读人：新增 `7-24`（区外悬空放行 ∥ 挪进区内 `REFUSED`）与 `7-25`（区外 400 字放行 ∥ 区内含变更行超 300 拒），四格齐 = 组件交互 ∥ 业务结果 ∥ 入口 = 真 `batch close` ∥ 回指 = F8 ∥ AC-10 ∥ AC-11；§6 四条验收后补「判读人」一句（四条由本批单测档判，AC-10 ∥ AC-11 另有常驻集成两行）。**同时回正修正轮 3**：当时写「号已定」，实读 `CLI 7` 表最大号 = `7-23`，`7-24`–`7-26` 从未落表 | 设计 §9「缺的」表 ∥ §6「验收」后的判读人句；本档 §2.4 |
| 3 🔴 | 补「快照里没有这一档 ⇒ 整档即变更区」一支，含「建后删掉 ⇒ 无文本可判 ⇒ 零输出」。实跑确认：新建探针档、不 `git add` 时 `git cat-file -e <批起 sha>:<档>` 退非零，`git diff -U0 <批起 sha> -- <档>` 出 0 字节 ⇒ 照 diff 取区就是整份假绿 | 设计 §6「快照里没有这一档」两段 ∥「三条来路的活场景」第三条 |
| 4 🟡 | 三个新名（`changedRegionsOf` ∥ `region` ∥ `regions`）补三问，按同档 §8 ∥ §9 同形，三态各落 `none found:`，带坐标与消费方 | 设计 §6「三个新名的三问」 |
| 5 🟡 | 补「同类先例」：`batch-gate.mjs` 的 `evaluate`（现判整份）∥ §3 第二条例外。对齐 = 同一套判据与报面，只加减进判域的档；偏离 = 两处先例按档、本节按行，段长再按段扩；既有形不适用 = 档级开关落不到「本笔改了哪几行」 | 设计 §6「同类先例」 |
| 6 🟡 | 「库外 = B 类」改成点名：声明源 = `PROJECT-MANIFEST.json` 的 `index.publicRepos` 两处（`../.thincoder` ∥ `../thincoder.com`），两仓 grep `doc_check` ∥ `判域` ∥ `changed region` 零命中 ⇒ 无相关，外部断言 = 零 | 设计 §6 ∥ §9 的库外行 |
| 7 🟡 | 「判不出变更区」补三条可跑场景：无记入行 ∥ 非 git 目录 ∥ 本批新建档（后者不是零输出，走整档即变更区） | 设计 §6「三条来路的活场景」 |
| 8 🟡 | §9「`judgeText` 一行不改」收窄成「判法不变；只多收一个 `region` 入参（§6）」 | 设计 §9 |
| 9 🔵 | 「五处目标态」表去掉「现文」列，设计档只留落点 + 目标态；改前原文搬到本档（见下节） | 设计 §6 表；本档 §2 |
| 10 🔵 | 「本批动到的两个函数」改成点名：`judgeText` ∥ `runDocCheck` ∥ `judgedDomainDocs` ∥ `paragraphHits` ∥ `evaluate` ∥ `changedRegionsOf`（新建），逐函数读数同句报出 | 设计 §9「函数档」 |

**五处目标态 · 改前原文**（自设计 §6 搬来，设计档只留目标态）

| 落点 | 改前原文 |
|---|---|
| `thincoder-core/tool-docs/doc_check.md` | `each is judged whole, not only the lines this round touched` |
| `thincoder-core/tool-docs/batch.md` | `Every document is judged whole, not only the lines this round touched` |
| `thincoder-core/prompts/persona-eng-coder.md` | `run doc_check(mode:"gate")`（`range = the docs this session wrote, checked whole`） |
| `thincoder-core/prompts/persona-eng-designer.md` | `range = the docs this session wrote (the default), checked whole` |
| `thincoder-core/prompts/persona-engineering.md` | `Each document is judged whole, … so a pre-existing dangling pointer in a document you touch is reported too.` |

**本轮实测读数**（命令在本会话跑过；规格面只留关系句，读数留在这里）

- 探针：新建 `tmp-region-probe.md`、不 `git add` ⇒ `git cat-file -e 44615d78…:tmp-region-probe.md` 退非零；`git diff -U0 44615d78… -- tmp-region-probe.md` 出 0 字节；`committedDocs` 的档清单不含它。探针档已删。
- `baseShaOf` 逐档跑 `docs/batches/*.md`：150 份里 98 份返 `null`（§1 无记入行）。
- `committedDocs` 在无 `.git` 的临时目录 ⇒ `ok: false`、`files = 0`。
- `test/rtm/guard.md` 的 `CLI 7` 表最大号 = `7-23`，`7-24` 起未落表。
- 两个声明源仓 grep 零命中；函数读数与档位读数见 §2.4。

**BATCH-RECORD.md 本轮零改**：§1 清单第 2 ∥ 3 条已在前轮落（门 ④ 现指 `DOC-CHECK.md` §6 ∥ §9，`zones` 行已清）；本档 `grep -E 'zones|STOCK_LINE|判面 = 整份'` 零命中，`§2.5` 的三处命中全指 `BATCH-LEDGER-REVIEW-UNIFY.md` §2.5（在盘），不是旧死指针；`BR-88` 与 §4 索引行已按代码对齐 ⇒ 无待改。

### 修正轮 3（复核 11 ∥ 12）

| 号 | 处置 | 落在哪 |
|---|---|---|
| 12 | 「行序表现十九态」改成「行序表现已十九态」（原意 = 那张表现在是十九态） | `docs/core/design/DOC-CHECK.md` §9「同属旧口径的三处随本笔改写」那段 |
| 11 | **未落 · [上抛·待裁]**：前提与代码相反（见下） | 待裁 |

**11 的前提与代码相反（本席实读）**：

- `thincoder-core/agent-tools/batch-tier-gate.mjs` 第 84 行（`TIER_READING_DISPOSAL` 常量末句）逐字 `"本门只拒、不代改。Nothing was written."`；第 111 行（`tierBaselineError`）同字面。
- 同档第 79 行注释逐字「`Nothing was written.` 三处与设计档同字面」。
- 常驻集成用例按 `/Nothing was written\./` 断言这条拒文（`test/integration/batch-close-gate.test.mjs` 第 109 ∥ 233 ∥ 367 行）。
- 照令删掉设计档那一句 ⇒ 「逐字拒文」与运行时输出不再同字面，代码第 79 行注释同时变假。

**处置候选**：一，保留（设计档写的是本门真实输出，与代码逐字对得上）；二，把尾巴另起一行单列，读成两件而不是一句（代价 = 不再是逐字引用，会就地标明）。本席倾向前者。

**11 的第二半（整块对读）已做**：§8 那个围栏块逐行对过代码，块内没有别的工具输出混进来。

- 首句 = `tierReadingHeader()` 逐字；五条逐档发现句 = `  <档> — <说明>` 形。
- 末句只差两处路径写法（运行时写全路径，设计档写「本档 §1」∥「本节『快照怎么取』」）——代码第 77–79 行注释已写明这是刻意改写，不是漏改。

**同族两处（不在本次两处之内，只报不动，随 11 号一并裁）**：

- `docs/core/design/DOC-CHECK.md` §8「同类先例」行逐字「同一种拒文两件（「要写什么」∥ `Nothing was written.`）」——这句本就把尾巴当第二件，与围栏块把两者粘成一句互为矛盾。
- 同节第二块拒文（`tierBaselineError` 那段）末行同样以 `Nothing was written.` 收尾。

### 修正轮 3 收尾（11 撤回 · 12 已落 · 13 已落）

| 号 | 处置 | 落在哪 |
|---|---|---|
| 11 | **撤回**（用户：你对，我错）——`Nothing was written.` 是本门真实输出的尾巴，设计档保留原样：不改写、不加旁注 | 无改动 |
| 12 | 「行序表现十九态」→「行序表现已十九态」 | `docs/core/design/DOC-CHECK.md` §9 |
| 13 | 撤特判、立前置条件、补第六处（见下三条） | 同档 §6 |

**13 → 撤了哪段**：

- 整段删：§6「**快照里没有这一档 ⇒ 整档即变更区。** …」——含 `git cat-file -e` 的探针读数与「整档算、三件照判」的处置。
- 同节「三条来路的活场景」第三条改写成「本批新建、没 `git add` 的档 ⇒ 零输出」；来路仍三条，数不变。

**13 → 新前置条件逐字**（`docs/core/design/DOC-CHECK.md` §6）：

- 「**本批落盘的档必须 `git add`（进索引）。** 这是判域的**前置条件**，不是一条特判：进了索引，`git diff -U0 <批起 sha> -- <该档>` 对新档天然出「整档新增」，整份就是变更区，三件照判。规则因此只剩一条——变更区 = `git diff` 的 `-U0` 变更行。」
- 「**没 `git add` 的后果（不造兜底）：该档在 diff 里看不到 ⇒ 变更区落空 ⇒ 零输出**，与本节其它落空同处置——不点名、不解释。**不为「未跟踪档」单开一条分支**：给它「按整档算」，等于让索引外的档绕开判域，与本节要撤掉的假绿同形。」

**13 → 加了哪两处提示词**（设计只定目标态，实施笔归 eng-coder）：

- 落点表标题「五处」改「六处」，新增一行，落点 = `thincoder-core/prompts/persona-eng-coder.md` ∥ `persona-eng-designer.md`（同这两档，在既有那句之外再加一句）。
- 该行目标态逐字：「落盘之后 `git add` 自己写过的档——只加自己写的，不 `git add -A`，别人的半成品不进索引」。

**本席实测（新前置条件的红 ∥ 绿两侧）**：临时 git 仓里新建 `new.txt`、不 `git add` ⇒ `git diff -U0 <sha> -- new.txt` 出 0 字节；`git add new.txt` 之后同一条命令出 `new file mode 100644` 与 `@@ -0,0 +1 @@` ∥ `+hello`。探针目录已删。

**改后复查（尺 = 内置 `grep`；同一串走 PowerShell 只报 2 命中，那是另一把尺，不算读数）**：`docs/core/design/DOC-CHECK.md` 全文 `grep '整档即变更区|cat-file|五处'` ⇒ 7 行，全在 §8——「整档即变更区」0 ∥「五处」0 ∥ `cat-file` 2 ∥「快照里没有这一档」5；§6 零命中。剩的都在 §8 第三列读数（`新` 那条），与本批判域无关，未动。

### 修正轮 4（14–16 按号落 · 依据 `eng-coder #11` 的交付与 §5 落地核对）

| 号 | 改了什么 | 落在哪一节哪一句 |
|---|---|---|
| 14 | §2 机读清单补两行：`thincoder-core/agent-tools/doc-check.mjs` = 80 ∥ `thincoder-core/tools/doc-write-gate.mjs` = 64；「档位结论」的计数 五 → 七，读数改为指向表列、不再复述 | 本档 §2.4「受影响文件（机读清单）」∥「档位结论」 |
| 15 | 「破的」两行改八行，补 `7-1` ∥ `7-2` ∥ `7-3` ∥ `7-5` ∥ `7-9` ∥ `7-13`，并写清破因与修法 | 本档 §2.4「RTM delta」的破的清单 |
| 16.1 | 「无该行 ⇒ 门走『只认触达账 + 回执明示「基 sha 未定」』」改成「变更区判不出来 ⇒ 每一档没有要判的行 ⇒ 回执零命中行、`范围 0 档`」 | `docs/core/design/BATCH-RECORD.md` §5「`<批起 sha>` 记入行（父侧义务）」条 |
| 16.2 | 删「首行 `DOC-CHECK GATE: PASS` 才算 §6 可落」，补一条：`gate` 判本批变更区、基线取绑定给这一席的批档；深度 0 父侧无绑定 ⇒ 一档不判 ⇒ 那行 `PASS` 只说明「没有要判的行」，本轮档集过没过门读收口那一刻结构面的 `范围 N 档`。同段「父侧协议跑仍是**权威范围面**」改「父侧仍是**权威写入面**」 | 同档 §5「文档机检门（2026-10-18——用户四轮裁定）」条 ∥ 同节「结构面」条 |
| 16.3 | **改判（用户 17:44）**：删掉那句与实际 git 行为不符的话，换成前置条件式——没 `git add` ⇒ 前置条件不满足 ⇒ 该档不判、零输出；不描述 git 输出形态、不加判序、不加新入参。同节「三条来路的活场景」第三条同改 | `docs/core/design/DOC-CHECK.md` §6 那一句 ∥「三条来路的活场景」第三条 |

**本轮实测读数**（尺 = `countContentLines`）：两档快照读数 = 80 ∥ 64，与本席按同尺复核的数一致。改判依据 = 用户 2026-11-12 17:44——落盘即 `git add` 是前置条件，不是一条要为「没 add 的档」设计判法的输入。

### 修正轮 4 · 额外上报一条（编号 17 · 未落，待裁）

**[上抛·待裁] 机读清单可能仍不全。**

`§5「出清单改动」`列的八档里，只有两档按 #14 补进清单；另六档本批也动过，仍在清单之外。

六档快照读数（本席 `countContentLines` 实测，均在 `test/integration/` 下）：`close-gate-fixture.mjs` 170 ∥ `path-resolution.test.mjs` 190 ∥ `doc-write-gate.test.mjs` 86 ∥ `batch-ledger-bind.test.mjs` 234 ∥ `batch-status-auto-set.test.mjs` 239 ∥ `batch-gates-reanchor.test.mjs` **670**。

**为什么没直接补**：收口第 ⑤ 臂的改动面 = 那一席的写工具触达账 ∪ 提交 diff（`thincoder-core/agent-tools/batch-closeout.mjs` 的 `changedSurface`）。本席不知那一面里有什么，凭空补行等于把别的席的档记到本批账上。

**但 670 那一档越了线**：`test/integration/batch-gates-reanchor.test.mjs` 在批起快照上 670 行，越过 500。若它落在收口改动面里，按 `docs/core/standards/CODE-TIER.md`，本批要给它一个落在本批内的分拆方案——那是设计变更，不是补一行读数。

请裁决：补行 ∥ 补行并附分拆方案 ∥ 判定它不在改动面。

**另一条读数**：`git diff --name-only <批起 sha>` 筛 `.mjs|.cjs|.js` = 27 档有改动，其中含并行批次动过的档（如 `thincoder-core/doc-graph/*` ∥ `advisor-launch.mjs`）；这 27 档不全是本批的，处置同上一条。

### 修正轮 5（17 收尾 · 18 按用户 17:47 重做）

| 号 | 改了什么 | 落在哪一节 |
|---|---|---|
| 17 | 六档补进机读清单，读数 = 本席 `countContentLines` 复量（`git show 44615d78…:<档>`）：`test/integration/close-gate-fixture.mjs` 170 ∥ `path-resolution.test.mjs` 190 ∥ `doc-write-gate.test.mjs` 86 ∥ `batch-ledger-bind.test.mjs` 234 ∥ `batch-status-auto-set.test.mjs` 239 ∥ `batch-gates-reanchor.test.mjs` 670 | 本档 §2.4 机读清单 ∥ 档位结论 |
| 17 · 670 那档：选拆 | 不选「不拆 + 理由」——`docs/core/standards/CODE-TIER.md` §2① 对过 500 写成「硬性义务，没有裁量空间」，那一路没有立足处。切点 = 这个决定由谁做（批档状态门 ∥ 台账行迁移）：八例留原档、六例出新档、共用夹具抽一档；拆出的两档另立两行记 `新` | 本档 §2.4「拆档方案」 |
| 18 · 设计 §6 | 收口臂自己 `git add`（用户 17:47 原话「你在收口门里碰到没有git add的文件就add掉，不是说现在这个项目里的文档」）：① 删「本批落盘的档必须 `git add`」那条前置条件，改写成「收口臂自己 add」，执行点 = `thincoder-core/agent-tools/batch-gate.mjs` 的 `evaluate`（`scope === "close"`），取区前对本批触达的档逐个 `git add -- <该档>`、不 `git add -A`；② 删「没 `git add` 的后果（不造兜底）⇒ 这一档不判、零输出」整段，改为「因此不存在『未跟踪 ⇒ 看不到』这一类状态」；③ 删「三条来路的活场景」第三条，标题改为「『判不出变更区』的活场景」（数随语句改，不留「三条」）；④ 补 `changedRegionsOf` 只算区间、不执行 add，也就不带「不在索引就跳过」那一支；⑤ 补 add 的落点（收口臂执行；`report` 面 ∥ 写门不执行——`gate` mode 那一半由修正轮 6 的 19-1 补定） | `docs/core/design/DOC-CHECK.md` §6 |
| 18 · 红侧怎么设 | 夹具里本批写一份新档、不 `git add`、跑 `batch close` ⇒ 收口臂先 add 再取区 ⇒ 该档整份即变更区，区内有命中即 `REFUSED`（不是零输出）；删掉那条命中复跑同一笔 ⇒ 放行。判读人 = 本批单测档（「上面五条」那句已含它，四 → 五同笔改） | 同档 §6「验收」第 5 条 ∥「判读人」 |
| 18 · 实施面随动（归实施席） | `thincoder-core/agent-tools/batch-regions.mjs` 的 `changedRegionsOf` 里那道 `ls-files --error-unmatch` 索引问句随本笔删（它存在的唯一理由就是补「不在索引」那一支）；add 那一笔落 `batch-gate.mjs` 的 `evaluate` 收口臂。本席不改码 | 实施轮（§5 追记） |



### 修正轮 6（19 按号落 · 依据需求 F8）

| # | 改了什么 | 落在哪一句（逐字） |
|---|---|---|
| 19-1 | 「add 只在收口臂发生」改成三句 | `docs/core/design/DOC-CHECK.md` §6：「**收口门自己把要判的档 `git add` 掉，再取变更区。** 收口门有两处，同一件事两处都做：」＋三条列表——「**收口臂**：…取区之前对它触达的档逐个 `git add -- <该档>`。」∥「**`doc_check` 的 `gate` mode**：判之前对调用方交进来的那几份 `docs` 做同一件事——逐个 `git add -- <该档>`。」∥「**`report` 面与写门不 add**：`report` 是诊断面、判整份；写门判的是手上正在写的文本。」＋一句限定「加的时候按路径限定，不 `git add -A`：别人的半成品不进索引。」 |
| 19-2 | 残量说明删除（它服务的状态已不存在） | 本档修正轮 5 末段整段删：「`doc_check` 的 `gate` mode 不执行 add；…一个假零宽区间。这条路走的是「写它的人已 add」那条义务，不是本门自己补。收口臂不受影响——它先 add。」 |
| 19-3 | 验收第 5 条红侧补半句 | 同档 §6「验收」第 5 条尾：「同一半在 `doc_check` 的 `gate` mode 上也立：手写一份新档、不 add、交给 `doc_check(mode:"gate")` ⇒ 先 add 再判，区内有命中即 `REFUSED`。」 |

**同族一并清（同一档同一句的第二处）**：§6 原有整段「**`git add` 只在收口臂发生**：`doc_check` 的 `gate` mode 判的是调用方指名、写它的人已经 add 过的档（提示词面那句义务在这条路上兑现）；`report` 面与写门都不执行。收口臂不同——那里没人替它 add，所以门自己动手。」——按 #19 那半句为假，整段删；这条规矩现在只写在 §6 起点那一处。

**依据**：`docs/core/requirements/DOC-CHECK.md` F8 逐字「收口那一刻（`batch close` ∥ `status → 已收口`）与 `doc_check` 的 `gate` mode，判域 = 本批变更区」——`gate` mode 在本批定义里就是收口门的一员，「收口门自己 add」因此必须同时落在它上面，否则同一件事两处各一套。

**未动**：#17 的六档补行与 670 拆档方案 ∥ #18 的收口臂 add 与 §6 其余各段 ∥ 代码面（#19 的实施笔归实施轮）。

**复跑**：`doc_check(mode:"gate")`，`docs` = `docs/core/design/DOC-CHECK.md` ⇒ 首行 `DOC-CHECK GATE: PASS`（无附加行）。本档 §2 自身经 `batch` 写入门判过：`PASS · 范围 2 档`。

### 修正轮 7（20 按号落 · `gate` mode 会动索引，描述面必须写明）

| # | 改了什么 | 落在哪一句 |
|---|---|---|
| 20-1 | §6 落点表标题「六处」改「七处」，新增一行（落点 = `thincoder-core/tool-docs/doc_check.md`，同这一档、在既有那句之外再加一句）；目标态逐字：**`gate` mode 在判之前会 `git add` 它此行判的那几份档（按路径限定，不 `git add -A`）；`report` mode 不动索引。** | `docs/core/design/DOC-CHECK.md` §6「七处落点与目标态」表 |
| 20-2 | 同格补半句，收正同档首句「Read-only: it writes nothing」：`report` 面仍只读，`gate` 面会写索引 | 同上 |
| 20-3 | 本档条目 5「六处目标态随动」改「七处」、工具描述面两处改三处；§2.2 ∥ §2.3 的「五处目标态」同改 | 本档 §2.1 ∥ §2.2 ∥ §2.3 |

**20-2 的依据**：`thincoder-core/tool-docs/doc_check.md` 首行逐字「Read-only: it writes nothing, asks for no approval, and is safe to run beside other calls.」——`gate` 面 add 之后「writes nothing」这半句为假；「asks for no approval」那半句仍真（它确实不问审批），故只点前者。

**20 第 2 项复查（`§9` ∥「变更区的两个调用方」有没有旧口径）**：`docs/core/design/DOC-CHECK.md` 改前全文 `只读` ∥ `不动索引` 各零命中（尺 = 内置 `grep`），改后这两串的唯一命中就是 §6 新加的那一行；该档的索引面表述只有 §6 那三句（收口臂 add ∥ `gate` mode add ∥ `report` 面与写门不 add），与 20-1 同句 ⇒ 无旧口径要收。

**未动**：#17 ∥ #18 ∥ #19 已落内容 · 代码面——20-1 那一行的实施笔归实施轮（`thincoder-core/tool-docs/doc_check.md` 属产品面）。

**复跑**：`doc_check(mode:"gate")`，`docs` = `docs/core/design/DOC-CHECK.md` ⇒ 首行 `DOC-CHECK GATE: PASS`，无附加行。

### 修正轮 8（评审轮 4 裁决 · 本席笔 = 第 1 ∥ 2 ∥ 5 ∥ 6 号）

| # | 定成什么 | 落在哪 |
|---|---|---|
| 1 🔴 | 三处互斥按实测收成一个答案：**破的 = 两行**（`7-22` 断的东西改了 ∥ `7-14` 判据格改指 §9、断言未改）；**六行**（`7-1` ∥ `7-2` ∥ `7-3` ∥ `7-5` ∥ `7-9` ∥ `7-13`）断言一字未改、红因在夹具的旧形基线；**`7-7` 不在破的里**（等式仍成立）。设计 §9 与本档 §2.4 逐字同集 | `docs/core/design/DOC-CHECK.md` §9「破的/冗余的/缺的」三段 ∥ 本档 §2.4「RTM delta」 |
| 2 🟡 | `7-22` 只留「破的」；**缺的 = 两行**（`7-24` ∥ `7-25`）；`7-21` ∥ `7-23` 在批起快照上已在表，不算缺的 | 本档 §2.4「缺的」∥ 设计 §9「缺的」 |
| 5 🟡 | 那条上抛已消解：`ENGINEERING-MODE-V2.md` 第 4 条现文「判面按面定」，`[上抛·待裁]` 撤掉、改记已消解 | 本档「修正轮 1」末 |
| 6 🟡 | 落点数统一为**七处**：§2.7 第 3 条由「五处」改「七处」（§2.1 条目 5 已在修正轮 7 改齐） | 本档 §2.7 第 3 条 |
| 7 🔵 | 无动作（评审的抽样注记：档位读数住 §2，不在评审 scope） | — |

**1 号的读数**（命令 = `git show <批起 sha>:<档>` 逐行扫，中文字串走 node；同一串走 shell 的 `findstr` 只报 0 命中，那是另一把尺，不算读数）

- 批起快照版 `test/integration/batch-close-gate.test.mjs`：`范围 N 档` 断言 = `7-1` 2 档 ∥ `7-2` 2 档 ∥ `7-5` 3 档 ∥ `7-7` 0 档 ∥ `7-13` 5 档——与现工作树同值。
- 同版 `7-22` 标题逐字「工具面指名三样俱全的批档 ⇒ PASS 且 checkFiles 不含它；指名同形设计档 ⇒ REFUSED 三样照报」，不点名 mode；`7-24` ∥ `7-25` 在该版 0 命中。
- 批起快照版 `test/integration/close-gate-fixture.mjs` 逐字 `const sha = rev(root)` ∥ `rev = rev-parse HEAD`；`snapshot` ∥ `commit-tree` 0 命中 ⇒ 真快照基线是本批新造的。
- 落红因果：旧形基线按设计 §6「② 的失败面」整批零输出 ⇒ 六行的范围数与拒绝断言全落空，改夹具即回绿。

**§5 需要改成什么**（§5 是 eng-coder 的段，本席只给结论，落笔归实施轮）

| 对应号 | §5 要改成的样子 |
|---|---|
| 1 | 「测试面」按本条重写破面：`7-22` 断言改写 ∥ `7-14` 判据格改指 ∥ 六行夹具回绿（断言未改）；并追记 `7-7` 经核不改。 |
| 2 | 「读数」与「决策披露」里新增行只两行（`7-24` ∥ `7-25`），与 §2.4「缺的 = 两行」同数。 |
| 6 | 两处「六处落点」∥「六处目标态随动」改「七处」。决策披露第 5 行按实读改写：`thincoder-core/tool-docs/doc_check.md` 首行仍是「Read-only: it writes nothing」、全文 `git add` 0 命中 ⇒ 修正轮 7 的 20-1 ∥ 20-2 那一行**未交付**，补齐后才可标 ✅。 |

**§3 轮次 4 的第 3 ∥ 4 条不在本修正轮编号内（父侧未派），其 §5 结论一并与上**

| 号 | §5 要改成的样子 |
|---|---|
| 3 | 「落地核对」第 3 条引的设计 §6 两句已删；现文是「因此不存在『未跟踪 ⇒ 看不到』这一类状态」与「`changedRegionsOf` 只算区间、不执行 add」。同条把 `git ls-files --error-unmatch` 记为「已加」，与修正轮 5 的 #18 判「随本笔删」相反 ⇒ 二者取一：删掉代码里那道索引问句，或给设计补回它存在的理由。 |
| 4 | 拆档方案未落：`test/integration/batch-gates-reanchor.test.mjs` 快照读数 670 越 500，§5 记 `14 / 0`（十四例仍在一档）、无三档读数 ⇒ 按 `docs/core/standards/CODE-TIER.md` 的越线义务在本批内拆出 `batch-gates-ledger.test.mjs` 与 `batch-gates-fixture.mjs`，三档各报一次 `countContentLines` 读数入 §5。 |

**本轮实测读数**（尺 = `git show <批起 sha>:<档>` + node 逐行扫；读数只住本节）

- 设计 §9 改后 `CLI 7` 相关计数：破的 2 ∥ 冗余的 0 ∥ 缺的 2，与本档 §2.4 同数。
- `test/rtm/guard.md` 的 `CLI 7` 表现二十一态（`7-1`–`7-25`，缺 `7-12` ∥ `7-15`–`7-17`），与设计 §9 新写法同数。

### 修正轮 9（评审轮 6 交办 · 22 ∥ 23 按号落）

| 号 | 改了什么 | 落在哪一句 |
|---|---|---|
| 22 | 「三个新名的三问」改「**四个新名的三问**」，补 `stageDocs(root, files)` 一条三问（三态取 `none found:`）：住 `thincoder-core/agent-tools/batch-regions.mjs`、与 `changedRegionsOf` 同档 · 叫什么 = `stageDocs`，语义 = 门自己那一笔按路径限定的 `git add`（不 `git add -A`）· 谁 = 两个消费点逐一点名（`batch-gate.mjs` 的 `evaluate`（`scope === "close"`）∥ `agent-tools/doc-check.mjs` 的 `gate` 支），`report` 面与写门不调它。同节「入口在哪」补一枚签名 | `docs/core/design/DOC-CHECK.md` §6「四个新名的三问」第四行 ∥ 「入口在哪」第二条 |
| 23 | 绝对句补成三句：① 首句收窄为「**门自己 add 之后，正常路径下不存在**「未跟踪 ⇒ 看不到」这一类状态」，原判据保留；② 新起一段写**加不进去的例外**（`.gitignore` 挡住 ∥ `.git/index.lock` 被占 ∥ 不在 git 目录里）⇒ 该档留在索引外 ⇒ 变更区落空 ⇒ 零输出，处置与「判不出变更区」同一条，不造拒绝、不造点名；③ 同段末写取舍为什么成立——这几种都是**环境拒绝**，不是写的人忘了做，而「忘了」那一路已被门自己 add 消掉 | 同档 §6「加不进去的例外」段（新段，原句首半句改写为 ①） |

**没动**：判据三件 ∥ 300 阈值 ∥ 验收五条条数 ∥ 七处落点 ∥ §9 两个时点 ∥ §5 ∥ 代码面（后两者不在本席笔域）。未新增判据、未引入拒绝分支。

**读数（命令 + 结果）**

- `stageDocs` 在批起快照版 `thincoder-core/agent-tools/batch-regions.mjs` 上 **0** 命中，该版导出面 = `safeRead` ∥ `committedDocs` ⇒ 第 22 号的三问落 `none found:` 站得住。
- 全仓 `.mjs` 的 `stageDocs` = **8 行 / 3 份档**（定义 1 行、两个消费点各 1 行、其余是注释与 import）；最近的相邻件 `thincoder-core/tools/git.mjs` 的 `add` 动作不是同一件（给模型用的工具面，按调用方给的 `path` 加）。
- 条目计数：三问 4 条 ∥「入口在哪」5 条（尺 = 逐行扫该节 bullet）。
- 复跑 `doc_check(mode:"gate")`，docs = `docs/core/design/DOC-CHECK.md` ⇒ 首行 `DOC-CHECK GATE: PASS`，无附加行。

**旁记（不改，属记录面）**：§3 轮次 6 的 #1 ∥ #5 ∥ #6 ∥ #7 落在实施面与描述面，本席未动；#3（`doc_check` 登记 `readonly: true` 而 `gate` 面写索引）是设计口径之问，本批两号未含它，留待下一轮裁决。

### 修正轮 10（评审第 7 轮两条 🟡 · 24 ∥ 25 按号落）

| 号 | 改了什么 | 落在哪一句 |
|---|---|---|
| 24 | 选了「给复现」那条路，并把适用范围写清：`stageDocs` 的 add 失败有三种来路（`.gitignore` 挡住 ∥ `.git/index.lock` 被占 ∥ 不在 git 目录里），**受影响的只有本来就在索引外的档**；已跟踪的档 add 失败后仍在索引里、照判 | `docs/core/design/DOC-CHECK.md` §6「加不进去的例外」段——原一句拆成四段：来路 ∥ 已跟踪的不受影响 ∥ 复现两半 ∥ 取舍理由 |
| 25 | 「验收」补第 6 条（只补一条，未扩成一组）：加不进索引的档（`.gitignore` 挡住 ∥ 持 `.git/index.lock` 时仍在索引外的新档）⇒ `batch close` 放行、回执只有 `PASS` 一行、不点名该档、不计入 `范围 N 档`；同一笔里已跟踪的档照判 | 同档 §6「验收」第 6 条 ∥ 其下「判读人」由「五条」改「六条」并点名该例 |

**24 为什么选「给复现」、不选「从枚举里去掉」**：`index.lock` 是本批代码 `thincoder-core/agent-tools/batch-regions.mjs` 的 `stageDocs` 真有的一条失败来路（`catch` 把 add 的失败吞掉）。从枚举里删掉，设计档就不再描述代码的现有行为；给复现并写清适用范围只多两句，代码一字不动。

**24 的读数**（尺 = 临时 git 仓里真跑；命令与结果逐条如下）：基线提交之后改一份已跟踪档、另建一份未跟踪档，造一个空的 `.git/index.lock`：

- `git add -- tracked.md` ⇒ 退出码 128（加不进去）；`git add -- untracked.md` ⇒ 退出码 128。
- `git -c core.quotepath=false diff -U0 <sha> -- tracked.md` ⇒ 退出码 0、出 `@@ -1 +1,2 @@`（已跟踪的档照出变更区）。
- 同一条对 `untracked.md` ⇒ 退出码 0、输出 0 字节（索引外的档没有变更区 ⇒ 零输出）。
- 删掉 `.git/index.lock` 之后 `git add -- tracked.md` ⇒ 退出码 0。
- 探针目录已删。

**25 的处理顺带覆盖 🔵 第 4 条**：「该档仍留在索引外」这句的适用范围就是第 24 条写的那半句——只有本来就在索引外的档会落空；已跟踪的档即便 add 失败也仍在索引里、照判。评审标了不阻断，本轮按此写法自然收口，不另开条目。

**第 3 条 🔵（`stageDocs` 三问里的「全仓 8 行」）不改**：评审自标不阻断，本轮号单未含它。

**偏离一处（可一键翻回）**：交办里点了单测档的档名 `docs/batches/2026-11-12-closeout-gate-changed-region.test.mjs`，设计档里只写了**用例标题逐字**，没写档名。理由：档名一进设计档，本批收口删掉那份单测档之后这一行就是悬空指针，而它正落在本批变更区里 ⇒ 收口门会拒自己。档名与读数住本档 §2.4「受影响文件（机读清单）」末行；§6「判读人」沿用同节既有句式「本节不点它的名」。

**用例标题逐字**（本席实读，取自 `docs/batches/2026-11-12-closeout-gate-changed-region.test.mjs`）：`加不进索引的档（`.gitignore` 挡住）⇒ 变更区落空 ⇒ 零输出（取舍钉成读数，不造拒绝）`——比交办里引的那句多一个尾括号「（取舍钉成读数，不造拒绝）」，照全文引。

**没动**：判据三件 ∥ 300 阈值 ∥ 「验收」前五条 ∥ 七处落点 ∥ §8 ∥ §9 ∥ §5 ∥ 代码面。未新增拒绝分支、未造兜底。

**扫尾读数**（尺 = 内置 `grep`，域 = `docs/core/design/DOC-CHECK.md` 全文）：`index\.lock|加不进去|索引外|上面五条|五条由` ⇒ 5 行，全是本轮新增句；「五条」0 命中 ⇒ 无同族第二处要一并改。

**复跑**：`doc_check(mode:"report")`，docs = `docs/core/design/DOC-CHECK.md`（整份，严于变更区）⇒ 首行 `DOC-CHECK GATE: PASS`，无附加行。`doc_check(mode:"gate")` 同档 ⇒ 首行 `DOC-CHECK GATE: PASS`，无附加行。

## §3 设计评审（评审子代理）
**状态行**：评审通过



### 轮次 1（评审子代理）

### 设计评审（独立评审席 · 对象 = 设计 §6 ∥ §9 ∥ 需求 F8 ∥ AC-10 ∥ AC-11 ∥ 同批收正的三处）

| # | 严重度 | 状态 | 证据（指针） |
|---|---|---|---|
| 1 | 🔴 | 待处理 | 需求 F8「与 `doc_check` 工具面**不在此列**——按变更区收窄的只有收口门」 ⟷ 设计 §6「`doc_check` 的 `gate` mode 是交付判定，判**变更区**」（§9 时点表同句；§6 验收还写「`report` ⇒ `REFUSED`，`gate` ⇒ `PASS`」）——同一机制两处相反 |
| 2 | 🔴 | 待处理 | §9「集成测试设计」的「破的」五行只断笔域集档数；「缺的」三行（`7-21` ∥ `7-22` ∥ `7-23`）断批档面与写时点；无一行断 AC-10 ∥ AC-11 的判别性一半（区外 ⇒ 放行） |
| 3 | 🔴 | 待处理 | §6「变更区 = 建档之后这份档动过的那几行」＋取法 `git diff -U0 <批起 sha> -- <该档>`；「变更区判不出来 ∥ 变更区落空 ⇒ 不出任何行」未列「本批新建、快照里没有这一档」这一支（git 行为面本席未验证 = unverified） |
| 4 | 🟡 | 待处理 | §6 无「三问」块（新名 = `changedRegionsOf` ∥ `region` ∥ `regions`）；同档 §8「三个新名的三问」∥ §9「两个新名的三问」都在 |
| 5 | 🟡 | 待处理 | §6 只有「库内 = 已查」∥「库外 = B 类」，无「同类先例」行；同档 §8 ∥ §9 各带坐标 + 对齐 ∥ 偏离 |
| 6 | 🟡 | 待处理 | §6 ∥ §9 的「库外 = B 类」不点名查过哪些外部档（README 声明的兄弟仓） |
| 7 | 🟡 | 待处理 | §6 三条来路里的「变更区判不出来 ⇒ 不出任何行」无活场景 ∥ 复现；同档 §8「这一支的活场景（不是机理推演）」是既有同形 |
| 8 | 🟡 | 待处理 | §9「判据本体（`judgeText`）一行不改」 ⟷ §6「`judgeText` 收 `region` 入参，**必填、不收缺省值**」 |
| 9 | 🔵 | 待处理 | §6「五处目标态」表的「现文」列（如 `each is judged whole, not only the lines this round touched`）——设计档只写目标态 |
| 10 | 🔵 | 待处理 | §9「改前盘上长度无一越过 500」＋「怎么核的 = `countContentLines`」为结论 + 命令形态，合规；逐档读数住批档 §2，不在本评审 scope ⇒ 未现量（unverified） |

VERDICT: changes-required

计数：🔴 3 · 🟡 5 · 🔵 2（🔴 三条未解决 ⇒ 不放行）

### 轮次 2（评审子代理）

| # | 严重度 | 状态 | 证据 |
|---|---|---|---|
| 1 | 🔴 | Fixed | 需求 F8 已含 gate 面（「与 `doc_check` 的 `gate` mode，判域 = 本批变更区」），「不在此列」收窄为「写门 … 与 `doc_check` 的 `report` mode」；设计 §6「两个 mode，一支判据」∥ §9 时点表同行，三处一致 |
| 2 | 🔴 | Fixed | §9「缺的」表补 `7-24`（F8 ∥ AC-10）∥ `7-25`（F8 ∥ AC-11），四列齐（组件交互 ∥ 业务结果 ∥ 服务需求 ∥ 入口 = 真 `batch close`）；§6「判读人」条点名单测档并回指这两行 |
| 3 | 🔴 | Fixed | §6「本批落盘的档必须 `git add`（进索引）」+「没 `git add` 的后果（不造兜底）」+ 第三条活场景（实测 + 复现：建探针档，不 add 一次、add 一次）；落点表第六行把 `git add` 写进两份 persona |
| 4 | 🟡 | Fixed | §6「三个新名的三问」：`changedRegionsOf` ∥ `region` ∥ `regions`，三态取值 + 属主与消费方齐 |
| 5 | 🟡 | Fixed | §6「同类先例」：`evaluate`（现判整份）∥ §3 第二条例外，对齐 ∥ 偏离 ∥ 既有形不适用三句齐 |
| 6 | 🟡 | Fixed | §6「库外 = 已查」点名声明源 `index.publicRepos` 两处 + 逐仓 grep 词 + 零命中结论 |
| 7 | 🟡 | Fixed | §6「这三条来路的活场景（可跑，不是机理推演）」三条各带复现动作 |
| 8 | 🟡 | Fixed | §9 改为「判法不变；`judgeText` 只多收一个 `region` 入参（§6）」，与 §6 必填入参不再相撞 |
| 9 | 🔵 | Fixed | §6 表改为「六处落点与目标态」，现文列已删；`git add` 一行并入 |
| 10 | 🔵 | Fixed | §9「函数档」条点名六个函数（含 `changedRegionsOf`） |
| 11 | 🟡 | New | §9 集成 delta「**破的 = 五行**。它们断的是「笔域集档数 = 回执 `范围 N 档`」，而批档自身现在不计入」——只算了批档面收窄的破面，未答按变更区收窄对现役行有没有破（各例夹具的被断档/行是否都在区内） |
| 12 | 🔵 | New | 需求 F8 已把 `doc_check` 的 `gate` mode 写进判域，而 AC-10（「⇒ `batch close` **放行**」）∥ AC-11 仍只断 `batch close`；gate 面那半的常驻载体只有 `7-22` 一半 |

VERDICT: pass

计数：原 10 条 = 3🔴（Fixed 3）· 5🟡（Fixed 5）· 2🔵（Fixed 2）；新增 1🟡（optional）· 1🔵。

### 轮次 3（评审子代理）

### 实施面评审（变更区接线 · 六档全读）

对象 = `batch-regions.mjs` 的 `changedRegionsOf` ∥ `batch-gate.mjs` 的 `evaluate` ∥ `doc-check/index.mjs` 的 `judgeText`/`runDocCheck` ∥ `paragraph.mjs` 的 `paragraphHits` ∥ `agent-tools/doc-check.mjs` 的 gate mode ∥ `tools/doc-write-gate.mjs`。判据 = 设计 §6 ∥ §9 ∥ 需求 F8 ∥ AC-10 ∥ AC-11。

| # | 严重度 | 状态 | 证据（指针） |
|---|---|---|---|
| 1 | 🟡 | 待处理（optional） | `batch-regions.mjs` 新增的索引前置问句「**索引里没有这一档 ⇒ 它没有变更区（不是「整份删了」）**」⟷ 设计 §6「**不为「未跟踪档」单开一条分支**」＋「该档在 diff 里看不到」——代码自带的反证是同档注释「`git diff <sha>` 对「快照里有、索引里没有」的档报的是 **整份删除**」；处置同（零输出），但 §6 读不回代码，删守卫即回误解报 |
| 2 | 🟡 | 待处理（optional） | `index.mjs` 的 `runDocCheck` 里 `if (regions !== null && (region.rows ?? []).length === 0) continue`（注释断言「`rows` 空 = 这一档在建档之后被删掉整份」）——`rows` 空同时成立于「在盘、只做了纯删」的档；非 ENOENT 的读失败（EACCES ∥ 变成目录）被静默吞掉，与设计 §9「那一句留给读不到的档」相反 |
| 3 | 🟡 | 待处理（optional） | `batch-gate.mjs` 的 `evaluate` 同一判据同形（注释「区间面、且区内只有纯删的缝 = 这一档在建档之后被删掉整份 ⇒ 不出一行（§6）」）——同一处需要 `e?.code === "ENOENT"` 才把「删掉」与「读不到」分开 |
| 4 | 🔵 | 待处理 | `batch-gate.mjs` 的 `baseShaOf` 取「首个 40 位十六进制串」`/[0-9a-f]{40}/i`，而 `changedRegionsOf` 收 `{40,64}`：sha256 对象格式下号被截成 40 位 ⇒ `rev-parse --verify` 失败 ⇒ 整批零输出（静默） |
| 5 | 🔵 | 待处理 | `changedRegionsOf` 的 `base` 在 sha 形守卫支返 `root`、其余支返 `top`，JSDoc 的 `@returns` 未写 `base` 语义；两个消费方都不读它 |
| 6 | 🔵 | 待处理 | `batch-regions.mjs` 的 `safeRead` 是导出面，全仓 `.mjs` 零消费者（grep `safeRead` 只命中定义本身） |
| 7 | 🔵 | 待处理 | `evaluate` 的 `range.basis` 字面 `touched（基 sha 未定）` 在「sha 有、diff 腿失败（非 git）」时也出——把已定的 sha 报成未定，是一条读数错报 |
| 8 | 🔵 | 待处理 | `changedRegionsOf` 逐档两次同步 git 子进程（`ls-files --error-unmatch` ∥ `diff -U0`，各 8s 超时）；收口面的档数一多就把工具调用拖成线性串行 |

**判据面核对（无 🔴 的四条）**：段级扩区（`owned` 的 `g === 0` 取第一段、`g` 落段内 ∥ `g === s-1` 取缝后段）与 §6「区间只在段这一级扩」逐条对得上 · 零宽区间不出行级命中（`inRegion` 只认 `rows`）同 §6 · 四个接线点（`close`+区间表 ∥ `gate` mode+区间表 ∥ `report`+`null` ∥ 写门 `writer`+`null`）与 §6「变更区的两个调用方」＋§9 时点表一致 · `region` ∥ `regions` 无缺省值（`undefined` 即抛）同 §6。

VERDICT: pass

计数：🔴 0 · 🟡 3（皆 optional，无 must-fix）· 🔵 5。

### 轮次 4（评审子代理）

> 状态行重置：第 4 轮打回（changes-required）· 上一轮状态行 = 评审通过 → 进行中 · 2026-11-12

| # | 严重度 | 状态 | 证据（指针） |
|---|---|---|---|
| 1 | 🔴 | 待处理 | 同一 delta 三处互斥：设计 §9「**破的 = 五行**」列「`7-1`（3 → 2）∥ `7-2`（3 → 2）∥ `7-5`（4 → 3）∥ `7-13`（6 → 5）」＋「`7-7` 的机制「批档自身恒在判域」在收口时点退役」；批档 §2.4「**破的 = 八行**」列 `7-22` ∥ `7-14` ＋「**`7-1` ∥ `7-2` ∥ `7-3` ∥ `7-5` ∥ `7-9` ∥ `7-13`（六行）**」且写「六行断的东西一字未改」；批档 §5「测试面」只记「`7-22` 按 mode 重写、`7-14` 判据格改指 §9」，无 `7-7` |
| 2 | 🟡 | 待处理 | 批档 §2.4：`7-22` 同时进「破的」与「缺的」（「`7-21` ∥ `7-22` ∥ `7-23`：三号已在 `test/rtm/guard.md` 的 `CLI 7` 表现场」），而 §5 只报「新增 `7-24` ∥ `7-25` 两行」——「缺的 = 五行」与记录不符 |
| 3 | 🟡 | 待处理 | 批档 §5「落地核对」第 3 条逐字引设计 §6「**没 `git add` 的后果（不造兜底）：该档在 diff 里看不到 ⇒ 变更区落空 ⇒ 零输出**」∥「**不为「未跟踪档」单开一条分支**」——设计 §6 已无此句，现文为「**因此不存在「未跟踪 ⇒ 看不到」这一类状态。**」与「**`changedRegionsOf` 只算区间、不执行 add**」；同条把 `git ls-files --error-unmatch` 记为已加（§5「代码落点」同句），而 §2「修正轮 5」第 18 条判「`changedRegionsOf` 里那道 `ls-files --error-unmatch` 索引问句随本笔删」 |
| 4 | 🟡 | 待处理 | 批档 §2.4「拆档方案」落步 = 「**本批落步 = 实施轮（§5 追记）**：拆完三档各报一次 `countContentLines` 读数入 §5」；§5 状态行 = 「实施完成」，读数「`batch-gates-reanchor` ⇒ `14 / 0`」（十四例仍在原档，未拆）、无三档读数 ⇒ 670 越线的分拆未落，且记录里没有一处能看出它落了 |
| 5 | 🟡 | 待处理 | 批档 §2「修正轮 1」末「**[上抛·待裁] 一处不在本席笔域**：`docs/core/requirements/ENGINEERING-MODE-V2.md` 仍有一整条正面写着「4. **判面 = 整份文档。**」」——该档第 4 条现文逐字「4. **判面按面定。** 写门判交给它的那份文本」，§1「上抛消解」已记「已经不成立」；同一档内一条已消解的上抛仍留「待裁」 |
| 6 | 🟡 | 待处理 | 落点数残留：设计 §6 表名「七处落点与目标态」、§2.1 条目 5 已改「七处」，而 §2.7 第 3 条仍写「五处目标态已写进设计 §6」、§5「工具描述面与提示词面（§6 六处落点）」∥ §5「决策披露」第 5 行「六处目标态随动… ✅ 已做」（该行按六处判的「已做」，第 20 号补的 `doc_check.md` 那一行不在其中） |

VERDICT: changes-required
计数：🔴 1 · 🟡 5 · 🔵 0

### 轮次 5（评审子代理）

| # | 严重度 | 状态 | 证据（指针） |
|---|---|---|---|
| 1 | 🔴 | Fixed | 设计 §9「**破的 = 两行。**」＝`7-22` ∥ `7-14`，六行另立「**另一组六行不属于「断的东西变了」**」，并写「**`7-7` 不在破的里**」；批档 §2.4「**破的 = 两行**（与 `docs/core/design/DOC-CHECK.md` §9 同集同说法）」——三处同一集、同一说法 |
| 2 | 🟡 | Fixed | 批档 §2.4「**缺的 = 两行**」只列 `7-24` ∥ `7-25`，`7-22` 只留在「破的」；同条写「`7-21` ∥ `7-23` 在批起快照上已在表，不算缺的」；设计 §9「**缺的 = 两行**（`7-24` ∥ `7-25`）」同数 |
| 3 | 🟡 | Accepted | 本轮对象声明把「§5 的四处待实施改写（已由 §2 给出结论，落笔归实施轮）」排除；批档「修正轮 8」的「§5 需要改成什么」表第 3 行已给结论（「『落地核对』第 3 条引的设计 §6 两句已删」） |
| 4 | 🟡 | Accepted | 同上；「修正轮 8」同表第 4 行给结论：按 `CODE-TIER` 越线义务拆出两档、三档各报一次 `countContentLines` 读数入 §5 |
| 5 | 🟡 | Fixed | 批档「修正轮 1」末「**已消解（原上抛，修正轮 8 收）**」逐字引 `docs/core/requirements/ENGINEERING-MODE-V2.md` 第 4 条「4. **判面按面定。**」——该档现文同句，`[上抛·待裁]` 已撤 |
| 6 | 🟡 | Fixed | 批档 §2.7 第 3 条「七处目标态已写进设计 §6」∥ §2.1 条目 5「**七处目标态随动**」∥ 设计 §6 表名「**七处落点与目标态**」 |
| 7 | 🔵 | Accepted | 抽样注记（档位读数住 §2，不在评审 scope），无动作 |
| 8 | 🔵 | New | 批档「修正轮 4 · 额外上报一条（编号 17 · 未落，待裁）」仍留「**[上抛·待裁] 机读清单可能仍不全。**」，而「修正轮 5」号 17 已落（六档补行 + 670 拆档方案）——标记未跟改，与第 5 条同类、不阻断 |

VERDICT: pass
计数：原 7 条 = 1🔴（Fixed 1）· 5🟡（Fixed 3 · Accepted 2）· 1🔵（Accepted 1）；新增 1🔵（不阻断）。

### 轮次 6（评审子代理）

| # | 严重度 | 状态 | 证据（指针） |
|---|---|---|---|
| 1 | 🟡 | 待处理（optional） | 登记义务两面各说一套：`tool-docs/batch.md`「The closeout does not ask the writer to stage anything: the closing arm itself runs `git add`」⟷ `persona-eng-coder.md`「This is the gate's precondition, not a formality: an untracked file has no changed region」与 `persona-eng-designer.md` 同句 ⟷ 设计 §6「因此不存在「未跟踪 ⇒ 看不到」这一类状态」＋同档「A file this batch created therefore has a changed region too」 |
| 2 | 🟡 | 待处理（optional） | 设计 §6 的绝对句「**因此不存在「未跟踪 ⇒ 看不到」这一类状态。**」⟷ `batch-regions.mjs` 的 `stageDocs` 自述分支「⇒ 跳过去：它仍在索引外 ⇒ `git diff` 看不见它 ⇒ 变更区落空 ⇒」与 `catch { /* 加不进去（`.gitignore` ∥ 非 git）⇒ 交给取区那一腿照实出结果 */ }`——条件与处置该由设计档写明 |
| 3 | 🟡 | 待处理（optional） | `agent-tools/doc-check.mjs` 仍 `readonly: true`，而档头已写「**`report` 面只读（零副作用 · 免审批 · 可并行）**」、`gate` 面写索引：`dispatch.mjs` 的 `if (agent.planMode && !tool.readonly && !readonlyActionOf(tool, toolCall.name, args)` ∥ `if (tool.readonly || readonlyActionOf(tool, toolCall.name, args)` ∥ `consecutive readonly/parallel tools run as concurrent batches` ⇒ 两笔并发 `gate` 撞 `index.lock` 时 `stageDocs` 静默跳过 ⇒ 零输出 ⇒ 假绿 |
| 4 | 🟡 | 待处理（optional） | 新导出名 `stageDocs` 未进设计 §6：同节「**三个新名的三问**（住哪 · 叫什么 · 谁）：」只列 `changedRegionsOf` ∥ `region` ∥ `regions`，「入口在哪」也只给四个签名；代码侧两处消费方（`batch-gate.mjs` 的 `evaluate` 收口臂 ∥ `doc-check.mjs` 的 `gate` 支）与属主在盘 |
| 5 | 🔵 | 待处理 | `stageDocs` 的返回值无人读（JSDoc 自己写「供调用面自检，判域与报面都不读它」），索引改动因此对调用方不可见；且 `evaluate` 的 `if (close && baseSha) stageDocs(root, docs)` 在旧形批上也写一次索引，随后一档不判 |
| 6 | 🔵 | 待处理 | `tool-docs/doc_check.md` 的「before judging it stages the documents it was given」是无条件句，而 `doc-check.mjs` 是 `if (sha) stageDocs(root, absDocs)`——无绑定批档时不 stage |
| 7 | 🔵 | 待处理 | `stageDocs` 的失败支没有一条夹具（`.gitignore` 挡住的新档 ⇒ 零输出），被接受的取舍因此无机器可查的用例；`report` 面「不动索引」也只断了一份未被 stage 的档 |
| 8 | 🔵 | 待处理 | 记录面：§2.4 拆档方案的落步「拆完三档各报一次 `countContentLines` 读数入 §5」未在 §5 现身——§5「读数」只有 `batch-gates-reanchor` ⇒ `8 / 0` 与 `batch-gates-ledger` ⇒ `6 / 0` 的用例数，三档行读数缺 |

VERDICT: pass

计数：🔴 0 · 🟡 4（皆 optional，无 must-fix）· 🔵 4。判据面核对：两处 `git add` 落点（`evaluate` 的 `scope === "close"` ∥ `doc_check` 的 `gate`）与设计 §6 三句逐条对得上 · `changedRegionsOf` 已无索引问句、与「只算区间、不执行 add」同句 · `stageDocs` 按路径限定（`git add -- <rel>`）、非 `git add -A` · `report` 面与写门不 add · 三档拆分（八例 ∥ 六例 ∥ 共用夹具）用例号与断言面齐、夹具不被收集面收走。

### 轮次 7（评审子代理）

| # | 严重度 | 状态 | 证据 |
|---|---|---|---|
| 1 | 🟡 | 待处理 | 设计 §6「加不进去的例外」——`.git/index.lock` 被占 这一条既无观测读数也无复现路径；同段「「判不出变更区」的活场景」只给「非 git 目录」一条可跑复现 |
| 2 | 🟡 | 待处理 | 设计 §6「验收（回指 … F8 ∥ AC-10 ∥ AC-11）」五条无一条判本次新写的「加不进去的例外 ⇒ 该档变更区落空 ⇒ 零输出」这条处置 |
| 3 | 🔵 | 待处理 | 设计 §6「四个新名的三问」第四条——「全仓 `.mjs` 里这个名字只落在本批三份档上、共 8 行」：三个源档合计 8 行属实，本批单测档另含同名行 ⇒ 「全仓」超出事实，行数读数会随实现漂 |
| 4 | 🔵 | 待处理 | 设计 §6「该档仍留在索引外、`git diff` 看不见它」——对已跟踪档，add 失败（如索引被锁）不把它移出索引（此句读的是 git 语义，本轮未跑命令核，标 unverified）；该句的适用范围宜写明「索引外的档」 |

第 22 条的处置核对：

- §6「四个新名的三问」第四条已落 `stageDocs(root, files)` 三问——住 `thincoder-core/agent-tools/batch-regions.mjs` ∥ 叫什么 ∥ 消费方两个 = `batch-gate.mjs` 的 `evaluate`（`scope === "close"`）∥ `doc-check.mjs` 的 `gate` 支。
- 与代码侧 `export function stageDocs(root, files)` 及两处调用逐一对上，`report` 面与写门零消费。

第 23 条的处置核对：

- §6「不存在未跟踪这一状态」已补成三句——正常路径 ∥ 加不进去的例外 ⇒ 零输出 ∥ 取舍理由。
- 与 `stageDocs` 的 `catch` 支同向，处置与同段「判不出变更区」一条一致。

VERDICT: pass
计数：🔴 0 · 🟡 2 · 🔵 2

## §4 用户批准（主 agent）

**用户批准**：2026-11-12 17:05「开工」。

**评审链**：第 1 轮 `changes-required`（3🔴 5🟡 2🔵）→ 第 2 轮 `pass`（签发首枚 token）→ 实施轮交付 → 第 3 轮 `changes-required`（1🔴 5🟡 1🔵）→ 第 4 轮 `pass`（重签 token，因设计档在两次通过之间被收正）。

**本轮实施范围**（用户 17:44 / 17:46 / 17:47 三次裁定的落点）：收口门遇到没 `git add` 的档自己 add 掉，两处同做（收口臂 ∥ `doc_check` 的 `gate` mode），`report` 面与写门不 add。

## §5 实施记录（eng-coder）
**状态行**：实施完成（第 2 轮落地：收口门两处自己 git add（stageDocs）+ 删 changedRegionsOf 的索引问句 + 描述面收正 + batch-gates 三档拆分；单测 10/10、改动面集成全绿；审计 1 ⚠️ 已按取舍收敛，评审 pass（无 🔴）；三条上抛（提示词陈旧前提 / readonly 与写索引的张力 / 设计缺 stageDocs 三问））



### 实施记录（判域 = 本批变更区 · 落地）

**口径一句话**：`batch close` ∥ `status → 已收口` ∥ `doc_check(mode:"gate")` 只判**本批变更区**——`git diff -U0 <批起 sha> -- <该档>` 的变更行（对比现工作树，不对比 HEAD）；区内照判三件、区外一个字都不出。`doc_check(mode:"report")` 与写门照旧判整份。

**代码落点**

| 落点 | 改了什么 |
|---|---|
| `thincoder-core/agent-tools/batch-regions.mjs` | 新建 `changedRegionsOf(root, sha, files)`：旧形批结构判据（`merge-base --is-ancestor` 成立 ⇒ `ok:false` 空表）、按档 `git diff -U0`、`@@` 段头解析成 `{rows, gaps}`（`gaps` = 纯删的零宽缝，`0` = 档头）；另加一道索引前置检查 `git ls-files --error-unmatch`（见落地核对第 3 条）。档头改写成本档的两条 git 腿。 |
| `thincoder-core/agent-tools/batch-gate.mjs` | `evaluate` 收口臂新增 `regions = changedRegionsOf(root, baseSha, docs).regions`；循环里区间表没有条目的档直接跳过（零输出、不计数）；写时点交 `null`。`baseShaOf` 的 sha 形 `{40}` → `{40,64}`；删掉「基 sha 未定——本批笔域集只认触达账」那条读数行；`range.basis` 三值，不再把「diff 腿失败」报成「基 sha 未定」。 |
| `thincoder-core/doc-check/index.mjs` | `judgeText` 收 `region`（**必填**：`null` = 整份、区间 = 只判这几行，`undefined` 即抛）；行号锚与悬空只认 `region.rows`。`runDocCheck` 收 `regions`（必填，表 ∥ `null`）；表里没有条目的档零输出且不计入 `checkFiles`。 |
| `thincoder-core/doc-check/paragraph.mjs` | `paragraphHits` 收 `region`：段内任一行在区内 ⇒ 整段量；纯删的缝贴段首（`g = s-1`）∥ 落段内 ⇒ 该段；**缝落档头（`g = 0`）⇒ 取第一段**。为此改成「先收段再判」——第一段只有收齐之后才指得出来。 |
| `thincoder-core/agent-tools/doc-check.mjs` | `gate` 支：基线取 `ctx.agent._batchDoc` 的 §1 记入行 → 区间表 → `runDocCheck(..., regions)`；无绑定 ⇒ 空表 ⇒ 一档不判。`report` 支交 `regions: null`。参数描述与档头按两 mode 分家改写。 |
| `thincoder-core/tools/doc-write-gate.mjs` | 写门交 `region: null`（`region` 必填的连带接线）；档头改指 §9 写时点 ∥ §6「写门与 `report` mode 交 `null`」。 |

**工具描述面与提示词面（§6 七处落点）**：

- `tool-docs/doc_check.md`：两 mode 分家、**`gate` 面在判之前会 `git add`**、首句按此收正（`report` 面只读 ∥ `gate` 面写索引）、无条目零输出、无绑定只回一行。
- `tool-docs/batch.md`：写时点整份 ∥ 收口面变更区、**收口臂自己 add**、「删掉整份」同处置。
- `persona-eng-coder.md` ∥ `persona-eng-designer.md`：gate 判变更区 + 各一句 `git add` 义务。
- `persona-engineering.md`：gate 只判变更区、旧悬空不再报出、无绑定的 `PASS` 是什么意思。

**测试面**（按 §2.4「RTM delta」现文重写）：

- `test/rtm/guard.md` 的 `CLI 7` 目的句与节注改写（十九态 → 二十一态）；`7-22` 按 mode 重写、`7-14` 判据格改指 §9、新增 `7-24` ∥ `7-25` 两行。
- `test/integration/batch-close-gate.test.mjs` 档头改写 + `7-22` 重写 + 新增 `7-24` ∥ `7-25` 用例。
- `test/integration/close-gate-fixture.mjs` 的批起基线改成真快照（`snapshot()` = `commit-tree -p HEAD` 的旁支提交）。
- 计数与 §2.4 同集：**破的 = 两行**（`7-22` 断的东西改了 ∥ `7-14` 判据格改指、断言未改）；`7-1` ∥ `7-2` ∥ `7-3` ∥ `7-5` ∥ `7-9` ∥ `7-13` 六行断言同值（红因在夹具的旧形基线，改夹具即回绿）；**`7-7` 经核不改**；**新增只有 `7-24` ∥ `7-25` 两行**。

**本批单测档**：`docs/batches/2026-11-12-closeout-gate-changed-region.test.mjs`（9 例，收口即删）。

### 决策披露（逐条对照 §2.1 六条目）

| # | 条目 | 状态 | 说明 |
|---|---|---|---|
| 1 | F8 · 收口门只判本批变更区 | ✅ 已做 | 收口臂与 `doc_check` gate 都按 `changedRegionsOf` 的区间表判；区内三条照判、区外不出行不出读数。 |
| 2 | AC-10（区外悬空放行 ∥ 挪进区内 `REFUSED`） | ✅ 已做 | 集成 `7-24` 两半同夹具跑完：区外放行零附加行、区内 `REFUSED` 点名该指针，且拒串里没有区外那条 400 字段的命中行。 |
| 3 | AC-11（区外超长段放行 ∥ 区内含变更行整段超 300 拒） | ✅ 已做 | 集成 `7-25`：区内段按**整段**量（`第 5 段 450 字，超过 300`），区外 400 字段一条都不出。 |
| 4 | 两面分工（`gate` 变更区 ∥ `report` 整份） | ✅ 已做 | 集成 `7-22` 重写：同一份设计档 `report` ⇒ `REFUSED` 三样照报，`gate` ⇒ `PASS` 一行不出；批档两 mode 都不进判域。 |
| 5 | 七处目标态随动（工具描述两处 + `doc_check.md` 的 `gate` 面 add 与首句收正 ∥ 提示词三处 ∥ 两 persona 各加 `git add` 一句） | ✅ 已做（本实施轮补齐第 7 处） | 逐处见上「工具描述面与提示词面」。**第 1 轮交付时第 7 处未落**：`thincoder-core/tool-docs/doc_check.md` 首行仍是 `Read-only: it writes nothing`、全文 `git add` 0 命中；本实施轮（第 2 轮）已补：首句收正为「`report` 面只读 ∥ `gate` 面写索引」，并加 `gate` 面 `git add` 那一段。 |
| 6 | 同批收正（相悖表述清除） | ✅ 已做 | 清单第 4–7 条落地：两处代码档头（`batch-gate.mjs` ∥ `index.mjs`）+ `tool-docs/batch.md`；清单外的同族（`doc-write-gate.mjs` 档头、`doc-write-gate.test.mjs` 档头、三份集成夹具的「整档判时」注释）一并改口。 |

### 读数（命令 + 结果；纯读数不进规格面）

- 本批单测档：`node --test docs/batches/2026-11-12-closeout-gate-changed-region.test.mjs` ⇒ `tests 9 · pass 9 · fail 0`（第 2 实施轮后；第 1 轮为 `tests 7 · pass 7`，第 2 轮新增两条「收口门两处自己 add」用例、把第 1 轮那条「索引里没有 ⇒ 不给区间」改写成 `stageDocs` 的正反两侧）。
- 改动面集成：`batch-close-gate` ⇒ `17 / 0`；`path-resolution` ⇒ `4 / 0`；`doc-write-gate` ⇒ `2 / 0`；`batch-gates-reanchor` ⇒ `8 / 0`；`batch-gates-ledger` ⇒ `6 / 0`（拆档前同批用例在原档读作 `14 / 0`，拆后八例 + 六例各跑一次）；`batch-ledger-bind` ⇒ `6 / 0`；`batch-status-auto-set` ⇒ `4 / 0`。
- 全量：`node test/run.mjs` ⇒ `tests 191 · pass 188 · fail 3`（第 2 实施轮后复跑，读数同第 1 轮）；3 红全在 `test/integration/anthropic-tool-roundtrip.test.mjs`（假模型窗口的 context overflow：`prompt ~109382 tokens … window 128000 (limit 96000)`，第 1 轮读作 `~109088`）。3 红与否与本轮改动面无交集：缺口 13k tokens，而本轮对描述的增量约 0.2k 字符；**改前树未跑 ⇒ 该 3 红是否本批之前既存 = unverified**。
- 改前红侧（单测档为何可信）：`git show 44615d78:thincoder-core/agent-tools/batch-regions.mjs | grep changedRegionsOf` ⇒ **0** 命中（改前该导出不在场 ⇒ 单测档 import 即抛）。
- 清除判据读数（尺 = 内置 grep；域 = 在用面 `thincoder-core/**` ∥ `test/**` ∥ `test/rtm/*.md`）：扫 `judged whole|not only the lines this round touched|判面 = 整份文档|checked whole|整档判|STOCK_LINE` ⇒ **4** 命中，全是 `report` 面的正确句（`agent-tools/doc-check.mjs` 参数描述两处 ∥ `tool-docs/doc_check.md` 两处）。旧批档 `docs/batches/*.md` 同扫 ⇒ 108 命中，**只报不改**（16:31 裁定）。`zones` 一族仅剩 `zoneStatus*`（段状态行区，另一机制）。

### 落地核对（哪一句因本次落地而不成立）

- `docs/core/design/BATCH-RECORD.md` §5「`<批起 sha>` 记入行（父侧义务）」条，逐字「无该行 ⇒ 门走「只认触达账 + 回执明示『基 sha 未定』」，回执不静默。」——现文不再成立：没有记入行 ⇒ 变更区判不出来 ⇒ 每一档零输出，回执**不出任何行**，那条「明示」随读数行一并撤掉。
- 同档 §5「文档机检门（2026-10-18——用户四轮裁定）」条，逐字「批准 / 核销 / close 之前，父侧对**本轮文档档集**跑 `doc_check(mode:"gate", docs:[...])`……首行 `DOC-CHECK GATE: PASS` 才算 §6 可落」——深度 0 父侧没有绑定批档 ⇒ gate 判 0 档 ⇒ 那行 `PASS` 只说明「没有要判的行」，不再等于「本轮档集过了门」。
- `docs/core/design/DOC-CHECK.md` §6 现文（修正轮 5 第 18 号之后）逐字「**收口门自己把要判的档 `git add` 掉，再取变更区。**」与「**因此不存在「未跟踪 ⇒ 看不到」这一类状态。**」——本实施轮（第 2 轮）按此落地：收口臂与 `doc_check` 的 `gate` mode 各调一次 `stageDocs`（按路径限定、不 `git add -A`）；`changedRegionsOf` 里那道 `git ls-files --error-unmatch` 索引问句随之删除（§6「`changedRegionsOf` 只算区间、不执行 add……也就不带「不在索引就跳过」那一支」）。**第 1 轮曾把那道问句记为「已加」，与本轮相反——以本轮为准：代码里已无它。**
- 批档 §2.4「RTM delta：破的 = 两行」实读偏少（见下方上抛第 2 条）：夹具的旧形批基线下，7-1 ∥ 7-2 ∥ 7-3 ∥ 7-5 ∥ 7-9 ∥ 7-13 的范围数与拒绝断言会全落空；改成真快照基线后才成立。

### 出清单改动（全部带理由）

| 档 | 为什么必须动 |
|---|---|
| `thincoder-core/agent-tools/doc-check.mjs` | 设计 §6「变更区的两个调用方」把 `doc_check` 的 `gate` mode 定为区间表的消费方；`regions` 必填后不接线它就跑不起来。 |
| `thincoder-core/tools/doc-write-gate.mjs` | `judgeText` 的 `region` 必填、不收缺省值 ⇒ 写时点必须显式交 `null`（判域未改，只接线 + 档头改口）。 |
| `test/integration/close-gate-fixture.mjs` | 夹具的批起 sha 原是 HEAD 的祖先（旧形批）⇒ 按 §6「② 的失败面」整批零输出；改成真快照（`snapshot()`）后才量得出变更区。设计 §9 也点名了这一档的注释随动。 |
| `test/integration/path-resolution.test.mjs` | `29-3` ∥ `29-4` 经 `doc_check(mode:"gate")` 断悬空判据；gate 改判变更区后无绑定 ⇒ 判 0 档。两例改走 `report`（诊断面仍判整份），断的东西一字未改。 |
| `test/integration/doc-write-gate.test.mjs` | 档头判据指针 `§6（判面 = 整份文档）` 已失效 ⇒ 改指 §9 写时点。 |
| `test/integration/batch-gates-reanchor.test.mjs` ∥ `batch-ledger-bind.test.mjs` ∥ `batch-status-auto-set.test.mjs` | 三处夹具注释逐字「否则整档判时它就是一条悬空指针」——「整档判」这一面已不存于收口/工具面，按清除判据改口（只改注释，用例与夹具行为零改）。 |

**`git add` 义务**：本席写过的每一档都已 `git add`（只加自己写的，未 `git add -A`）——这是判域的前置条件，不是形式。

### 审计与评审轮次 · 终态

- **内部发散审计**（`explore`，判 `§2` ∥ 设计 §6 ∥ §9）：6 条判据 → 4 ✅ ∥ 1 ⚠️（缝落档头取第一段未实现，且被本席单测断言锁成「不报」）∥ 1 记录缺口（§5 当时为空）。**已修**：`paragraphHits` 改成「先收段再判」，`gaps: [0]` ⇒ 第一段照量；单测断言翻成设计要的方向（`[440]`），并补一条「第一段不超阈 ⇒ 无命中」的反向。
- **代码评审**（`advisor` `type=code`，六档 + 三份文档；结论写入本档 §3 子代理轮次 3）：**无 🔴**，3 🟡（均 optional）+ 5 🔵，判定 `pass`。
  - 已修 3 条：`runDocCheck` 与 `evaluate` 的读失败分流（现在只在 `rows` 空 ∧ `ENOENT` 时静默；其余照出「读不到，未判」）、`baseShaOf` 的 sha 形 `{40,64}`、`range.basis` 不再把「diff 腿失败」报成「基 sha 未定」。
  - 未修 5 条为报告项：`ls-files` 守卫与 §6 的机制句不符（已进落地核对第 3 条）、`changedRegionsOf` 失败返回的 `base` 字段语义不一、`safeRead` 是死导出、每题两次 git 子进程的线性开销、以及 §3 里记录的其余 🔵。
- **终态**：`clean`（审计的 ⚠️ 已修并复跑；评审无 🔴，3 条 🟡 处置见上；集成与单测全绿）。

### 上抛

1. **[上抛·待裁] 阻断收口**：§2 机读清单缺两档——`thincoder-core/agent-tools/doc-check.mjs`（快照读数 **80**）与 `thincoder-core/tools/doc-write-gate.mjs`（快照读数 **64**）。这两档是本批必有件且都已改；收口第 ⑤ 臂会按「§2 清单里没有这一档的行」拒。补行归 §2（设计席笔），本席不改。
2. **[上抛·知会] §2.4 的 RTM delta 少算破面**：实际「破的」不止 `7-22` ∥ `7-14`；夹具旧形基线下另有一批范围/拒绝断言会落空（已按真快照修夹具使其成立）。本席已在批档 §2 之外报给父侧。
3. **[上抛·知会] 全量 `node test/run.mjs` 有 3 红**，全在 `test/integration/anthropic-tool-roundtrip.test.mjs`（context overflow 断言），与本批改动面无交集；改前树未跑，标 `unverified`。

### 第 2 实施轮（收口门自己 `git add` · 拆档 · §5 收正）

**逐条 → 改成了什么**

| 号 | 要求 | 落成了什么 |
|---|---|---|
| A1 | 收口臂取区前对本批触达的档逐个 `git add`，按路径限定 | `thincoder-core/agent-tools/batch-regions.mjs` 新出 `stageDocs(root, files)`（`rev-parse --show-toplevel` 还原仓根、逐档 `git add -- <仓根相对路径>`、加不进去就跳过）；`batch-gate.mjs` 的 `evaluate` 收口臂在 `changedRegionsOf` 之前 `if (close && baseSha) stageDocs(root, docs)`，没有基线就没有要取的区 ⇒ 索引也不动。 |
| A2 | `doc_check` 的 `gate` 支做同一件事；`report` 面与写门不 add | `agent-tools/doc-check.mjs` 的 `gate` 支：`const sha = bound ? baseShaOf(bound) : null` → `if (sha) stageDocs(root, absDocs)` → 取区；`report` 支仍 `regions: null`、零 add。写门零消费（`stageDocs` 全仓只有这两个消费点）。 |
| A3 | 删 `changedRegionsOf` 的 `git ls-files --error-unmatch` 索引问句与注释 | 已删；同函数 JSDoc 改成「只算区间、不问索引、也不执行 add」，并写明留着它会让收口臂 add 完照样被跳过。 |
| B4 | `tool-docs/doc_check.md` 加「`gate` 会 add」并收正首句 | 首句改成三条（`report` 只读 ∥ 有绑定批档时 `gate` 先 add ∥ 无绑定时不碰索引）；`gate` 段另加一段讲 add 与「为什么新档也有变更区」。 |
| B5 | `tool-docs/batch.md` 按 §6 收正旧口径 | 「A batch's own files must be `git add`-ed for the closeout to see them」整句换成「收口臂自己 add」；并按评审第 1 条把「does not ask the writer to stage anything」收窄成「does not depend on whether the writer staged them」——写者那句义务不被撤销。 |
| C6 | 拆档（670 越 500） | 八例留 `batch-gates-reanchor.test.mjs`（14-1/2/3/4/5/8/13/14）、六例迁 `batch-gates-ledger.test.mjs`（14-6/7/9/10/11/12）、共用夹具 `batch-gates-fixture.mjs`；`CLI 14-N` 的号、断言与夹具入参未改，两档互不 import。 |
| D7–D9 | §5 三处收正 | 落地核对第 3 条按设计现文重写（并写明「第 1 轮记的那道索引问句『已加』作废」）、测试面按 §2.4 现文重写（破的 = 两行 ∥ 六行同值 ∥ `7-7` 经核不改 ∥ 新增只有两行）、「六处」两处改「七处」、决策披露第 5 行改成「第 1 轮第 7 处未交付、本轮补齐」。 |
| E10 | 单测档随 A 更新 | 新增「收口臂自己 add ⇒ 新档照判」∥「`doc_check` 的 `gate` 面先 add 再判」∥「`.gitignore` 挡住 ⇒ 零输出（取舍读数）」三条；第 1 轮那条「索引里没有 ⇒ 不给区间」改写成 `stageDocs` 的正反两侧。 |

**读数（命令 + 结果）**

- 本批单测档：`node --test docs/batches/2026-11-12-closeout-gate-changed-region.test.mjs` ⇒ `tests 10 · pass 10 · fail 0`。
- 拆档三档行读数（尺 = `countContentLines`）：`test/integration/batch-gates-reanchor.test.mjs` ⇒ **334** ∥ `test/integration/batch-gates-ledger.test.mjs` ⇒ **312** ∥ `test/integration/batch-gates-fixture.mjs` ⇒ **81**；两档都在 500 以下。
- 两档各跑绿：`batch-gates-reanchor` ⇒ `tests 8 · pass 8 · fail 0`；`batch-gates-ledger` ⇒ `tests 6 · pass 6 · fail 0`（十四例一个不少，号未改）。
- 红侧（本轮那两笔 add 的证明）：把 `if (close && baseSha) stageDocs(root, docs)` 与 `if (sha) stageDocs(root, absDocs)` 两行临时改成不执行 ⇒ 单测档 2 例红（`'pass' !== 'refused'`，回执读作 `DOC-CHECK GATE: PASS`）；改回来 ⇒ 10/10 绿。
- 全量：`node test/run.mjs` ⇒ `tests 191 · pass 188 · fail 3`（3 红同第 1 轮，全在 `anthropic-tool-roundtrip.test.mjs` 的 context overflow）。
- `doc_check(mode:"gate")`，docs = 本轮写的两份工具描述 ⇒ 首行 `DOC-CHECK GATE: PASS`；同两档跑 `report`（整份）也 PASS。

**落地核对（本轮新增一条）**

- `docs/core/design/DOC-CHECK.md` §6 逐字「**因此不存在「未跟踪 ⇒ 看不到」这一类状态。**」——`stageDocs` 的失败支让这类状态仍然存在：`.gitignore` 挡住 ∥ `index.lock` 被占 ∥ 非 git 目录时 `git add` 抛错被吞，该档留在索引外 ⇒ `git diff` 看不见 ⇒ 变更区落空 ⇒ 零输出。取舍与 §6「判不出变更区」那一支同向（判不准的就不判），代码注释与单测档都写明并钉成读数；设计席要把这一支写进 §6、或改判为显式拒绝，两条都能落——代码侧不必改行为。

**审计与评审轮次 · 终态**

- **内部发散审计**（`explore`，判 §2 ∥ 设计 §6）：6 条判据 → 5 ✅ ∥ 1 ⚠️（`stageDocs` 的 add 失败被吞，等于「未跟踪 ⇒ 看不到」这类状态仍在）。**处置**：行为不改（照 §6「判不出变更区 ⇒ 零输出」），把它写成代码注释里的代价 + 单测档里的一条读数 + 上面那条落地核对。终态 `divergence-found（1 条，已按上述处置收敛）`。
- **代码评审**（`advisor` `type=code`，九档 + 设计 §6；结论住本档 §3 轮次 6）：**无 🔴**，4 🟡（皆 optional）+ 4 🔵，判定 `pass`。
  - 已修 3 条：`tool-docs/batch.md` 那句「does not ask the writer to stage anything」收窄（第 1 条的一半，另一半在提示词面、不在本席笔域）；`doc_check.md` 的 add 句补「有绑定批档时」这一限定（第 6 条）；单测档补 `.gitignore` 那一例（第 7 条）。
  - 不修 / 上抛：设计 §6 缺 `stageDocs` 的三问（设计席笔，见下第 3 条上抛）、`readonly: true` 与 gate 写索引的张力（设计 20-2 明写「asks for no approval」仍真，故标志位不动，见下第 4 条上抛）、`stageDocs` 返回值（已被单测档当读数用，不算死面）、旧形批仍写一次索引（与「没有基线就没有要取的区」不冲突，留给设计席定）。
- **修正轮数**：1 轮（评审 4 条 🟡 中 3 条就地修，1 条转入上抛；没有二次评审）。**终态：`clean`**（单测 10/10、改动面集成全绿、全量 3 红与本批改动面无交集）。

**上抛**

1. **[上抛·待裁] 提示词面仍带着已被作废的前提**：`thincoder-core/prompts/persona-eng-coder.md` 逐字「This is the gate's precondition, not a formality: an untracked file has no changed region, so the gate has nothing to judge in it.」，`persona-eng-designer.md` 同句（少「not a formality」）。本轮之后门自己 add，这个前提不成立（设计 §6「因此不存在「未跟踪 ⇒ 看不到」这一类状态」）；两档不在本席写域，按 §1「任何地方有与此相悖的表述，都要清除」需另派一笔。
2. **[上抛·知会] `doc_check` 仍登记 `readonly: true` 而 `gate` 面写索引**：设计的修正轮 7（20-2）明写「asks for no approval」那半句仍真、只收正「writes nothing」，所以本席不动这个标志位。残留面：`readonly` 同时是 planMode 放行与并发合批的判据，同一批两笔 `gate` 可能在 `.git/index.lock` 上相撞，输的那笔退化成零输出。要不要为此加一句设计口径（或动作级只读），归设计席。
3. **[上抛·待裁] 设计 §6 缺第四个新名**：`stageDocs` 是导出面、两个消费方，§6「三个新名的三问」与「入口在哪」都没有它。补三问 + 一枚签名归设计席。

### 修正轮（21 · 提示词里那句前提已作废）

**依据**：依据 docs/core/design/DOC-CHECK.md「收口门自己把要判的档 `git add` 掉，再取变更区。」——门自己 add 之后，「未跟踪档 ⇒ 没有变更区 ⇒ 门判不了」这条前提不成立，两份提示词里那句因此为假。

**改前逐字**

- `thincoder-core/prompts/persona-eng-coder.md`：`This is the gate's precondition, not a formality: an untracked file has no changed region, so the gate has nothing to judge in it.`
- `thincoder-core/prompts/persona-eng-designer.md`：`This is the gate's precondition: an untracked file has no changed region, so the gate has nothing to judge in it.`

**改后逐字**

- `thincoder-core/prompts/persona-eng-coder.md`（L41 ∥ L42）：
  - `- **`git add` the files you wrote, once they are on disk** — only your own, never `git add -A`: another seat's half-finished file does not belong in the index.`
  - `The gate stages the docs it judges at closeout anyway, so this obligation is not what keeps it working: it keeps the index matching what is on disk, so the gate judges the tree that is actually there.`
- `thincoder-core/prompts/persona-eng-designer.md`（L119 ∥ L120）：
  - `**`git add` the files you wrote, once they are on disk** — only your own, never `git add -A`: another seat's half-finished file does not belong in the index.`
  - `The gate stages the docs it judges at closeout anyway, so this obligation is not what lets it judge: it keeps the index matching what is on disk.`

**义务没撤**：两份都保留「落盘后 `git add` 自己写过的档、只加自己写的、不 `git add -A`」原句一字不放；撤掉的只有那条错误理由。换上的理由 = 让索引与盘上事实一致——门自己会 add，这条义务不是让门能工作的条件。语义两份一致，句式各自贴合本档。

**为什么要分两行（读数）**

- 首版把新句写在同一行，`doc_check(mode:"gate")` 对提示词逐行判，两处读数 = `persona-eng-coder.md 第 41 段 365 字` ∥ `persona-eng-designer.md 第 119 段 309 字`，判 `REFUSED`。
- 拆成两行后同一命令 ⇒ 首行 `DOC-CHECK GATE: PASS`，无附加行（红 ∥ 绿同一把尺、同一组档）。

**复核读数**

- 全仓除 `docs/batches/**`：`grep 'untracked file has no changed region|gate has nothing to judge|gate's precondition'` ⇒ 0 命中。
- 提示词面 `grep 'changed region|untracked|stages the docs'` 只剩 `persona-engineering.md` L429「The gate judges only the batch's changed region」——与本批同向，非相悖表述。

**索引**：两档已 `git add`（只加这两份，未 `git add -A`）。

**落地核对（本轮）：无**——两份提示词改后与设计 §6 两句同句，没有设计档句子因本轮落地而不成立。

## §6 验证与收口（父代理）

**验证（父侧，本会话实跑）**

| 检查 | 命令 | 读数 |
|---|---|---|
| 本批单测档（收口前） | `node --test docs/batches/2026-11-12-closeout-gate-changed-region.test.mjs` | `tests 10 · pass 10 · fail 0` — 含红侧「本批新建、没 git add 的档照判 ⇒ 区内有命中即 `REFUSED`」 |
| 改动面集成 | `node --test test/integration/batch-close-gate.test.mjs batch-gates-reanchor.test.mjs batch-gates-ledger.test.mjs` | `tests 31 · pass 31 · fail 0` |
| 全量 | `node test/run.mjs` | `fail 4`，四处全在未改动档：`anthropic-tool-roundtrip.test.mjs`（3，context overflow）∥ `browser-shared-pool.test.mjs:195`（1） |
| 交付门 | `doc_check(mode:"gate")`，五份在改档 | `DOC-CHECK GATE: PASS` |

**全量那 4 红**：两个测试档 `git status --porcelain` 为空（本批未改），它们的 import 只到 `provider/rate.mjs` ∥ `config.mjs` ∥ `fixtures/anthropic-endpoint.mjs`，本批一档未动。失败形态是「prompt ~109441 tokens 超过窗口 96000」，属上下文预算，与本批射程无交集。**改前树未跑 ⇒ 是否既存 = `unverified`**（实施席一次读到 3 红、父侧一次读到 4 红，差异在 `browser-shared-pool` 那一例）。

**单测档已删（delete-on-use）**：`docs/batches/2026-11-12-closeout-gate-changed-region.test.mjs` 收口前删除，盘上不留可执行件；上面的读数是它存在时的最后一次运行。

**集成集现状**：`test/integration/` 现存用例按档计（本批改动面）= `batch-close-gate` 17 ∥ `batch-gates-reanchor` 8 ∥ `batch-gates-ledger` 6。本批新增 3 例（`7-24` ∥ `7-25` ∥ 「没 add 的新档照判」），改写 2 例（`7-22` 按 mode 拆两半 ∥ `7-14` 判据格改指 §9），拆档不改断言与用例号。

**落地核对**：设计档被实现推翻的句子共 4 处，全部由设计席收正——`BATCH-RECORD.md` §5 两条（`16.1` ∥ `16.2`）、`DOC-CHECK.md` §6 的「未 add 在 diff 里看不到」（`16.3` 改判为「收口门自己 add」）、`stageDocs` 例外那条（第 24 号补复现与适用范围）。**无遗留未处置项。**

**台账**：`#2363` 由本笔 `close` 同笔结算（在途 → 待核销 → 已核销）。

**本批新债 1 条 + `#2366`**：「`doc_check` 登记 `readonly: true` 但 `gate` 面写索引；并发两笔 gate 撞 `index.lock` 时退化成零输出」，触发条件 = 并发两笔 `gate`。

**deferred-batch re-check**：无（本批无暂缓项）。**用户可见面**：无（纯机制面改动）。
