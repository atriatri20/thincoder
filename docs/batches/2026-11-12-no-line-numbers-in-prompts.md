# 2026-11-12 · no-line-numbers-in-prompts
> 六段，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 每段只有一个作者：作者的段可 `append` 加内容、可就地改（`edit`）；非作者一概拒。
> 编制：主 agent · 2026-11-12 · 来源 = 用户 2026-11-12 21:27「我的原则不是只清这几处，是类似的用行号的地方都清，也包括行计数」。
> 台账 = #2371（core · 归批）。前情 = 无（独立批）。
## §1 讨论（主 agent）
**状态行**：已收口 2026-11-12
批起 sha = 7a62229cab66641446e120b5a3d988a7f3cc55d2
<§1 模板占位：本批条目 / 关键判据 / 授权口径>

**要治的事**：提示词本身在教人把**行号**与**行计数**写进状态档。今晚现场：设计档抄了一份 RTM 行号清单，`7-24` ∥ `7-25` ∥ `7-26` 三行早已落盘，它还写着「缺」——实施照着做就是写重号。

**用户裁定的原则（2026-11-12 21:27 逐字）**：「我的原则不是只清这几处，是类似的用行号的地方都清，也包括行计数。」

**要做的事**：把 `thincoder-core/prompts/` 里所有教人把行号 ∥ 行数 ∥ 「几行」写进需求档 ∥ 设计档 ∥ 标准档的地方清掉，改成不写这些。批档里的读数不是清理对象。

**已扫到四处（待设计席复核并补全，不是全部）**：
- `persona-eng-designer.md` 第 9 条「Integration test design」：`which rows this change breaks / redundant / missing` ＋ `A new row's number is fixed in the RTM before its case title is written … the same number verbatim`；
- 同档自检「Table rows ↔ summary counts」：`whatever the rows tally to is the number you state`；
- 同档微批边界的成品句：`§9 integration delta = zero rows: …`；
- `discipline-engineering.md`：`rows broken, rows redundant, rows missing` ＋ `a row's number is fixed in the RTM`。

**留着的（不在清理面）**：批档 §2 机读清单第三列的**行数读数**——那是批档里的读数，机器按它判档位；本条清的是「把计数写进状态档」。`countContentLines` 这类量法本身不动。

**已定决定**：开批清理 · 用户原话：「开批，不过，我的原则不是只清这几处，是类似的用行号的地方都清，也包括行计数。」· 时间：2026-11-12 21:27

**库内 = 已查**：`thincoder-core/prompts/*.md` 全目录扫 `line number` ∥ `行号` ∥ `number verbatim` ∥ `编号` ∥ `row` ∥ `RTM` → 命中集中在 `persona-eng-designer.md`（第 9 条 ∥ 自检第 2 条 ∥ 微批边界句）、`discipline-engineering.md`（集成索引段）、`advisor-design.md`（同一句第三次重复）；`advisor-*` 与 `common.md` 的「不引行号、引符号名」是反面参照，方向正确。

**库外 = B 类**：改动面 = 提示词档与设计档；外部断言 = 零。

**要做的事**：把 `thincoder-core/prompts/` 全目录读一遍，凡是在教人把行号 ∥ 行数 ∥ 「几行」写进状态档（需求 ∥ 设计 ∥ 标准）的，都改成不写。改完给出：每处改成什么、还剩哪些没改以及为什么。

**设计席 `#21` 这一轮只做一件事（它排队中，跑起来读这里）**：删掉 §6.102 修正轮留下的那句「本档存量计数…清不清、何时清请你定——已登记在 §6.102 上抛项与 §2」，**两处都删，不换成别的问题，不留痕**。

**理由（用户 2026-11-12 21:47）**：存量不判是这个项目当前的方向——写门本批刚改成只判这一笔改的行（`#2369`），判的是这一笔、不是整份。把「存量要不要清」写成待裁项，等于让存量重新进账，与方向相反。

**上面这条是给主 agent 自己的**：不要再把存量摆上桌，也不要转述任何人类似提问。

## §2 批次任务与设计（eng-designer）
**状态行**：设计完成（存量收口轮已落：TESTING §11.17 三块 → 落点表；§6.50 B7 ∥ B8、§6.51 B2 → 落点行；词句单源 = §6.102；探针 10→5 ∥ 4→3；文档门 PASS）

<§2 模板占位：本批条目（覆盖） / 设计档落点 / 机制设计 / 受影响文件与测试覆盖 / 验收对照 / 关键决策 / 上抛项>

<§2 模板占位：机读清单 = 标题行「**受影响文件（机读清单）**」+ 围栏内三列表（表头 | 档 | 分拆方案 | 行数 |、分隔行 |---|---|---|、一行一档，只列代码档（源 ∥ 单测））；第二列：越设计时线的档写正向形方案（点名带目录段的档 + 本批落步 `实施轮` ∥ `§5`），未越线写 —；第三列：该档在批起快照上的内容行数（量法 = `countContentLines`），快照里没有这一档写 `新`；示例行 = | thincoder-core/agent-tools/batch-tier-gate.mjs | — | 新 |>

**本批条目（覆盖）**

| # | 条目（要治的答法） | 证据 ① 现文逐字 ∥ ② 目标态 ∥ ③ 判据 | 设计档落点 |
|---|---|---|---|
| E1 | 判据立一处：状态档不写位置、不写量；写名字与关系，读数住批档与命令输出 | ① 提示词面现无此判据（`common.md` 只有 `A line number is never the citation`，管引文不管计数）② 一段三句的自问（问「位置或量」还是「名字或关系」+ 写什么代替 + 不碰读数三例）③ A1 | §6.102 落点 ①（`common.md` §Evidence discipline 内增列） |
| E2 | 设计席两处换答法：item 9 点名不点数 ∥ 自检第 2 条对齐物从「数」换成「名」 | ① `Read it before designing, then answer as a delta: which rows this change breaks (rewrite them), which rows are redundant (delete them), which rows are missing (new rows) —` ∥ `whatever the rows tally to is the number you state` ② 落点 ②③ ③ A2 | §6.102 落点 ②③（`persona-eng-designer.md`） |
| E3 | 纪律层集成索引同源句换写 | ① `answers as a delta — rows broken, rows redundant, rows missing` ② 落点 ④ ③ A3 | §6.102 落点 ④（`discipline-engineering.md`） |
| E4 | 评审面第 12 条换写 + 一条 🟡（旧答法要有判据可抓） | ① `which rows this change breaks, which are redundant, which are missing` ② 落点 ⑤ ③ A4 | §6.102 落点 ⑤（`advisor-design.md`） |

**不在本批（各自理由住设计档 §6.102 的普查表）**：批档 §2 机读清单第三列的行数读数（批档可整份删）· 微批 §2 的固定边界句（同上）· RTM 用例号约定（身份不是位置，插行不重编）· D10 ∥ D12 ∥ `doc_check` 行号判据的本体（规则对，缺的是教法）。

**设计档落点** = `docs/core/design/PROMPT-SYSTEM.md` §6.102（题目：状态档不写行号当锚、不写计数当内容）。规则本体（D10 ∥ D12）零改；本批只换教它们的五处人话。同批同面收窄 §6.66 的数那一半（两节各管一半），并把 §8.2 的落点行拆成两行（引用那半 ∥ 计数这半各写各的正文单源）。

**机制设计一句**：判据住公共层（两模式 + 全部角色都读），答法住各自那一层——设计面、纪律面、评审面各写自己那一半，互不重述（D2）。

**受影响文件**

| 档 | 改动 |
|---|---|
| `thincoder-core/prompts/common.md` | 落点 ①（增列一段） |
| `thincoder-core/prompts/persona-eng-designer.md` | 落点 ②③（两处换写） |
| `thincoder-core/prompts/discipline-engineering.md` | 落点 ④（一句换写） |
| `thincoder-core/prompts/advisor-design.md` | 落点 ⑤（两行换写 + 一条 🟡） |
| `docs/core/design/PROMPT-SYSTEM.md` | §6.102（新增节）· §6.66 数那一半收窄 · §8.2 落点行拆两行 |

**机读清单 = 空表**：本批零代码档，改动面全为 `.md`；`.md` 不带读数（设计席 item 3 的第三列只列代码档），故批起快照上无档需报数，无档位判定适用。

**受影响文件（机读清单）**

```text
| 档 | 分拆方案 | 行数 |
|---|---|---|
```

**验收对照（每条回指设计档 §6.102 的验收行）**

- E1 → A1：判据在 `common.md` 的 `## Evidence discipline` 内读得到，且同段读得到「写什么代替」与「数字仍可用于什么」两半，以及「读数的量法与日期一并归批档」那句。
- E2 → A2：设计席 item 9 读得到「点名用例」，不再读得到 `which rows this change breaks`；自检第 2 条读得到 `Names in the prose ↔ names in the table`。
- E3 → A3：纪律层读得到「点名用例」，不再读得到 `rows broken, rows redundant, rows missing`。
- E4 → A4：评审第 12 条读得到「点名用例」，且 🟡 那句在位。
- 全批 → A5 ∥ A6：A5 = 每个新增行取**起句**，禁令词集逐个比，命中 0（`never` 只作句中状语）；A6 = `doc_check(mode:"gate")` 首行 PASS，且实施席报回的断行拼回后与围栏块词句逐字相等、每行码点数 ≤300（读数住本节末「修正轮读数」）。四档 `##` / `###` 标题计数改前 = 改后。

**关键决策（摘；全表与理由住设计档 §6.102）**：判据一处、答法四处，不写禁形清单（清单漏下一个没见过的形，自问不漏）；四处换写而非删除（删了设计席与评审都失去答法）；用例号判「不算」并保留（身份不是位置）；**同批收窄 §6.66 的数那一半**（以本节为准，不放宽本节）；**围栏块定词句、断行归实施席**（设计档排版与提示词行宽是两把尺）。

**集成 delta**：本批可观察面 = 模型读到的提示词文本，RTM 的行断言工具 / 循环 / 批档 / 端面的业务结果，没有一行断言措辞。以「行号」为题眼扫 `test/RTM.md` 全文，命中只有 `CLI 28`「拿行号改文档不会静默改错行」——它断言 `edit` 工具拿行号定位时不静默改错行（工具面），本批零触工具面，故不破；冗余 = 无（无行的业务结果与本批答法相关）；新增 = 无（不新增用户可见入口，措辞断言进 RTM 会随改写变红且证明不了行为）。行级理由住设计档 §6.102「集成测试设计」。

**上抛项**：无。

**修正轮（§3 第 1 轮 = `changes-required`，十条全收 · 用户 2026-11-12 裁定）**

处置只动设计档与本段；提示词本体、需求档、别的批档零触。

| # | 严重度 | 处置 | 改了哪一句（档 · 逐字） |
|---|---|---|---|
| 1 | 🔴 | 全收：以本节取代 §6.66 的数那一半，不放宽本节 | ① §6.66 判法一句改为「**机制本体的常量与阈值留**（段长上限 ∥ 字符预算这类认定值）；**对某个集合的计数不留**，它是读数，归批档与命令输出（规则本体与答法 = 本档 §6.102）」；② 射程右列三格改写（原 `权威读数表` ∥ `带量法与日期的读数块` ∥ `当下准确的读数` 各一行改为「机制本体的常量与阈值」与「读数写在哪…判据 = 本档 §6.102」，第三格留 `——`）；③ 原「权威读数表、带量法与日期的读数块、当下准确的读数，都不是负债」整句删去，改为「读数连它的量法与日期一起落在批档与命令输出，不落在状态档（去向 = §6.102）」；④ 原「带量法与日期的读数块 ∥ 权威读数表 ∥ 当场可核的当下读数不在此列」改为「机制本体的常量与阈值不在此列」；⑤ §6.66「清单的维护面」限定为「本节（**该清单**人读权威的唯一活描述）」；⑥ §8.2 原一行拆两行——「引用钉内容，不钉位置」的正文单源 = `DOC-DISCIPLINE.md` §1 D4（提示词面形态 = §6.66），「状态档不写位置锚与计数」的正文单源 = §6.102；⑦ §6.102 对照表首四行逐条写清与 §6.66 的分工（含「旧口径就这三句与本条相反」与「两节各称的不是同一件事」） |
| 2 | 🔴 | 全收（按用户改判的形）：词句在围栏块，断行归实施席，本节给规则 + 读数 | §6.102 新增「断行规则（五个落点通用，与词句分开）」三句：只在句或分句边界断 ∥ 词一个不改 ∥ 拼回一行后与围栏块逐字相等、每行 ≤300；新增「行宽读数」一段（读数见下）；A6 改为「`doc_check(mode:"gate")` 首行 PASS **且** 实施席报回的断行逐条可拼回」；用例表加 C7（照抄围栏块不改断行 ⇒ 按三句重断） |
| 3 | 🟡 | 全收：口径统一 + 判域补齐 | 普查新增「判据三档」段——写进状态档的位置 ∥ 计数 ∥ **读数（含其量法与日期）**都算、批档与命令输出不算、边干活时用手上的数不算；普查「域」改为 `thincoder-core/prompts/**` + `thincoder-core/tool-docs/**`；普查表新增第 13 行（tool-docs 全目录扫描结论 = 命中全在工具契约面，无教学面） |
| 4 | 🟡 | 全收 | §6.102 新增「既有件三问（改名的标签 `Names in the prose ↔ names in the table` · 读者 = 设计席在收尾自检时）」三段：`existing:` 段（旧名 `Table rows ↔ summary counts`）+ 改名不是第二份 + 旧名随换写退场 |
| 5 | 🟡 | 全收 | 「最近先例」改为「最近先例（含实现坐标）」，两条各给落笔坐标与逐字句（`the pin is yours` 三行 · `Once the review has passed, do not edit the reviewed documents until the implementation starts.` 三行与 `Approval timing — this bullet decides one thing: when the approval request may go out`） |
| 6 | 🟡 | 全收：改成只判起句位置 | A5 判法改为「取**起句**（去行首空白、`>`、列表编号与 `**` 之后到第一个空格前的那一个词）与禁令词集逐个比，落在集内 ⇒ 不过」，并写出实读（`never` 在落点 ① L1 与落点 ④ L1 是句中状语，起句分别是 `A state doc` 与 `A design round`） |
| 7 | 🟡 | 全收：定位物补成完整整行 | W1 补到第 2 ∥ 3 两行的完整整行（末字 `—` 与 `…business-observable point).` 都在），W4 补到第 2 ∥ 3 两行完整整行（原 `…` 处逐字引全）；落点 ② 的第二行不再只给 `with each row naming…`，W1 的两行整段交给落点 ② 三行替换 |
| 8 | 🟡 | 全收：按本批真正的面重读 RTM 再答 | §6.102「集成测试设计」按本批自己的题眼重写——以「行号」扫全表命中只有 `CLI 28`「拿行号改文档不会静默改错行」（断言 `edit` 工具行为，面不同故不破）；删掉抄来的「`CLI 20` 与本批同主题」那句理由；本段「集成 delta」同步换写（原句是同一份复印件） |
| 9 | 🟡 | 全收：删表，改标成落点图 | §6.102 的「受影响文件」表整表删去，改为「**落点图**（哪条答法落哪一档；受影响文件表归批档 §2——F-R24a）」，五个条目各写档 + 落点，含本节同批收窄 §6.66 与 §8.2 的两处 |
| 10 | 🔵 | 全收：统一措辞 | 落点 ②③⑤ 统一为同一句答法：`the case this change rewrites, the case it deletes, the case it adds, each named by its own title` + `the interaction between components it evaluates, the business-observable result it asserts, the requirement it serves, and this project's entry`（落点 ⑤ 不再用 `the business result` ∥ `traces back to`） |

**修正轮读数（量法写清，数住本段）**

- **行宽（五个落点）**：量法 = `[...line].length`，按句界断后逐行算。落点 ① 最长行 = 232 码点 · ② = 240 · ③ = 204 · ④ = 212 · ⑤ = 242；越 300 的行 = 0；无不可拆短语、无阻塞。
- **禁令起句**：量法 = 按 A5 的起句取法逐行取词、与 `never` ∥ `must not` ∥ `forbidden` ∥ `禁止` ∥ `不得` 比。范围 = 落点 ①–⑤ 的新增行共 17 行；命中 = 0。
- **文档门**：`doc_check(mode:"gate")` 首行 = `DOC-CHECK GATE: PASS`（含本节与 §6.102 的全部改动区）。
- **普查域**：`thincoder-core/prompts/**` + `thincoder-core/tool-docs/**`，模式见 §6.102；tool-docs 面命中逐条读过，无一条在教人往状态档写位置 ∥ 计数 ∥ 读数。

**修正轮自己扫出并同轮改掉的（评审未点名，同一缺陷的隔壁副本）**：

- 本段「集成 delta」原是设计档那句的复印件（🟡8 同一处）——已换写。
- 本段 E1 的验收描述原写「不碰读数」，与落点 ① 改后的第三段名不符——已改为「数字仍可用于什么」。
- A5 ∥ A6 的验收对照行原只写「零禁令起句」「首行 PASS」——已补成可判的判法与断行拼回。
- **§6.66 的两处同族句**原仍说「读数不是负债」：用例表 C7（「当下准确的读数、带量法与日期的读数块、权威读数表，都不在这一条里」）与验收 A8（「本节各处读数同行携量法、同段携日期」）——本轮一并改成「数连量法与日期归批档与命令输出（§6.102）」。
- §6.102 落点图原写「射程表两格」，实改三格——已正。

**§1 `#21` 本笔（删存量上抛 · 用户 2026-11-12 21:47）**

只做一件事：把「本档存量计数清不清、何时清」这个待裁项从盘上删掉。不换成别的问题，不留痕。

| # | 位置 | 处置 |
|---|---|---|
| 1 | 设计档 §6.102「上抛项」 | 整条删去 `[上抛·待裁] 本档存量计数…本节不回溯清存量。`；该节「上抛项」现余 `[上抛·知会]` 一条 |
| 2 | 本段「上抛项」 | 原 `一条待裁——本档（PROMPT-SYSTEM.md）存量计数清不清、何时清…` → `无。` |
| 3 | 本段「修正轮」末条 | 整条删去——同一问题在本批档的第二处登记 |

同轮扫掉的指向（对象删了即成死指针，同一缺陷的隔壁副本）：

- §6.102 对照表第 3 行：删去 `——清存量属另一笔（见上抛项）`，留下 `本节管新写，不回溯清存量`；
- §6.102 边界条：`**不清本档存量计数**（域 = 本档全文，属另一笔，见上抛项）。` → `**不清本档存量计数**（域 = 本档全文）。`

判据未动：§6.66「读数作用域」末句（`旧节里的数照原样留在各节`）照旧，按当轮域读。存量在这里不是待裁项，是读法。

**读数**（量法 = node 行扫描，范围 = §6.102 起止行 `10876`–`11083`，共 208 行）：

- `见上抛项`：改前 2 → 改后 0；
- `上抛·待裁`：改前 1 → 改后 0；
- `存量`：改后 2，两处都是边界 ∥ 读法句（对照表第 3 行、边界条），无一处是问句。

本段里 `存量` 只出现在本笔这几行记录（写的是删了什么），没有一处把它写成待裁项；§1 那三行（`#21` 的令、理由、给主 agent 的话）仍带这个词，属主 agent 的段，不在本席笔面。

**收正轮（交付后 · 父侧复跑核对后 · 四条）**

前提 = 父侧复跑核对读数：四条旧句全档命中 0 · 五处落点拼回逐字相等 · 最长行 212。本轮只动设计档 §6.102 与本段；提示词本体、需求档、别的批档零触。

| # | 条（父侧点名） | §6.102 改了哪一句 | 交实施轮落的词句（逐字） |
|---|---|---|---|
| 一 | `common.md` 第 9 条 `counts and lists change together` 与新规则打架——普查第 11 行判「不算：条文本体」判错了 | ① 普查第 11 行拆两行：11 = 第 9 条那半句 **算**（「它是被换掉的旧教法的压缩形，新规则落进同一份档后自相矛盾；换写 → 落点 ⑥」），11b = 纪律层 D10 ∥ D12 ∥ `A line number is never the citation` 仍不算；② 新增落点 ⑥ + 要修表 W6 + 对照表 1 行（第 9 条） + 关键决策 K8 + 落点图 1 条 + 边界 1 条；③ §8.2「状态档不写位置锚与计数」行的提示词落点补 `common.md` 的 `## Documentation system` 第 9 条 | `9. Acceptance before prose — every requirement is verifiable; a set of things named in one place goes by the same names wherever else it appears, and a count of them is a reading, kept in the batch record.` |
| 二 | 用例号句三份副本两个名词（`A new row's number` ∥ `A missing row's number` ∥ `A case's number`） | ① 新增落点 ⑦（同一句 + 三档坐标表 ⑦-1/⑦-2/⑦-3）+ 要修表 W7 + 对照表 1 行（三处副本）+ 关键决策 K9；② 落点 ④ 围栏块末行同轮改为同一句（`discipline-engineering.md` 那一处即随 ④ 落）；③ 对照表另记一行：`persona-engineering.md` 的 `whose ledger carries this row's number` 指台账行，不在本条判域，零改 | `A case's number is fixed in the RTM before its case title is written — `test('CLI 1-1 …')`, the same number verbatim.` |
| 三.1 | A5 实读漏数一处 `never`（落点 ① 末行） | A5 整格重写：判域 ①–⑤ → ①–⑦（新增行与替写行皆算）；读数改成计数式并逐个点名——`never` 共 3 处、全在句中：落点 ① L1（起句 `A state doc`）· 落点 ① 末行（起句 `The rule bites`）· 落点 ④ L1（起句 `A design round`） | ——（判据行，无词句落盘） |
| 三.2 | 三问只覆盖改名标签，`common.md` 新起的粗体规则名未覆盖 | 三问标题加「· 新起的判据名」；补一行 `none found: thincoder-core/prompts/** + thincoder-core/tool-docs/**`，写明改前命中 0、现盘 1 处即落点 ① 自己，同题面的 `A line number is never the citation` 是行号那半的判据、不是同一个名 | ——（同上） |

**接续读法（第 9 条与新规则怎么一起读；同一份判读也记在对照表那一行）**

- 前半句留：`every requirement is verifiable` 判的是验收，与计数无关，逐字不动。
- 旧后半句拆两半：「名单要同变」留下、对齐物换成名字——`a set of things named in one place goes by the same names wherever else it appears`；「计数」那半不留，改为指名去处——`a count of them is a reading, kept in the batch record`。
- 这样单读第 9 条也读得完，不必回翻落点 ①；同档两句不再相反：旧句教人把计数与名单并排写进状态档，新句把计数送进批档与命令输出。

**读数（量法写清，数住本段）**

- **行宽**：量法 = `[...line].length`，域 = 落点 ①–⑦ 的围栏块共 19 行。逐落点最长 = ① 232 · ② 240 · ③ 204 · ④ 217 · ⑤ 242 · ⑥ 205 · ⑦ 117；**越 300 的行 = 0**，不可拆短语 = 无。（④ 由 212 → 217，因末行并入统一后的用例号句。）
- **禁句起句**：量法 = 按 A5 的起句取法（去行首空白 / `>` / 列表编号 / `**` 后首个词）逐行取，与 `never` ∥ `must not` ∥ `forbidden` ∥ `禁止` ∥ `不得` 比。域 = 上述 19 行；**命中 0**。`never` 全批 3 处、全为句中状语（坐标见上表三.1）。
- **探针**（内置 `grep` 逐字串，域 = `thincoder-core/prompts/**` + `thincoder-core/tool-docs/**`）：`counts and lists change together` = 1（现盘；实施轮落点 ⑥ 后应为 0）· `A state doc carries what is true` = 1（落点 ① 自己）· `row's number` = 3（W7 三处；实施轮后应余 1，即 `persona-engineering.md` 里 `whose ledger carries this row's number` 那一句）· `case's number` = 1（W7 第三处；实施轮后应为 3）。
- **标题计数**：`common.md` 22 `##` / 6 `###` · `persona-eng-designer.md` 9 / 1 · `advisor-design.md` 7 / 0 · `discipline-engineering.md` 13 / 7（量法 = node 行扫描）——第 9 条与三处用例号句均为整行换写，不新开标题。
- **文档门**：`doc_check(mode:"gate")` 首行 = `DOC-CHECK GATE: PASS`（域 = 本档本轮改动区）。
- **本段的编写过程**：首版 §2 文本被批档候选文本门拒一次（一段 371 字超 300 · 一处「档名:行号」当锚）；改法 = 接续读法改三条列表项、行号锚改成逐字句；复跑 PASS 后落盘。

**边界（本轮不做）**：提示词本体零笔（落点 ⑥⑦ 交实施轮 eng-coder 照围栏块落）· 需求档零笔 · 别的批档零触 · `common.md` 第 9 条其余六段与同档其余条目逐字不动 · 不动 D10 ∥ D12 ∥ `doc_check` 的行号判据本体。

**上抛项**：无。

**收正轮（交付后 · 父侧复跑绿 · 评审第 3 轮 6🟡 3🔵 的处置）**

只动设计档：`docs/core/design/PROMPT-SYSTEM.md`（§6.102 ∥ §6.50）与 `docs/core/design/TESTING.md`（§11.17）。提示词本体 ∥ 需求档 ∥ 别的批档 ∥ 代码零触。

| # | 条（来源） | 改了哪一句（档 · 逐字） |
|---|---|---|
| 一 | A5 计数与判法对不上（评审 #1） | §6.102 A5 格：读数改 `**落盘 29 行**（① 11 · ② 5 · ③ 3 · ④ 3 · ⑤ 4 · ⑥ 1 · ⑦ 2）`，判法补 `一行落到多处的各算一处`；`行宽读数` 段末句改 `**七个落点的围栏块共 19 行**（这是围栏块的行数；落盘行数由实施席按断行规则重断，判据与读数见 A5，两数不是同一件事）`——两个数字各自标明用的是哪一把尺 |
| 二 | W3 引文与盘面不符（评审 #3） | **W3 未改**：批起快照实读为 W3 所引那一句（`git diff 7a62229cab66641446e120b5a3d988a7f3cc55d2 -- thincoder-core/prompts/discipline-engineering.md` 的 `-` 侧逐字含 `; a row's number is fixed in the RTM before its case title is written.`）。不符的是 W7 第 3 格，已改为 `第 3 处**不是独立一行**：它是 W3 那一整句的末半句 \`a row's number is fixed in the RTM before its case title is written.\``，处置写明 `第 3 处随 W3 整句换（落点 ④ 已含该句）` |
| 三 | 起句定义与点名不一致（评审 #5） | A5 定义统一为 `取其**首词**（去掉行首空白、\`>\`、列表编号与 \`**\` 之后，到第一个空格为止的那一个词；\`must not\` 按 \`must\` 算）`；三处 `never` 改按逐字句点名：`never where it sits`（首词 `A`）· `never at the moment it is read`（首词 `The`）· `never a blank "which scenarios does this change need" list`（首词 `A`） |
| 四 | 第 9 条保留半句 ∥ 对照表「去掉」∥ K1「一处」（评审 #6） | 保留半句并把作用写明：对照表该行改 `计数那半就地换写成去处 \`a count of them is a reading, kept in the batch record\`——读者只读这一条也知道数去哪，故这一句留着。它不构成第二份判据：第 9 条没有「位置或量还是名字或关系」的自问、没有代替物清单，判据与答法仍只住落点 ①`；K1 改 `判据立 \`common.md\` 的 \`## Evidence discipline\` 一处；其余各处在原地换答法（②③④⑤，加 ⑥ 第 9 条与 ⑦ 用例号三处）` |
| 五 | 设计层旧名词逐字副本（实施席上抛 1） | 四处全换为 `A case's number is fixed in the RTM before its case title is written — \`test('CLI 1-1 …')\`, the same number verbatim.`：`TESTING.md` §11.17 的 ① ∥ ② ∥ ③ 三处、`PROMPT-SYSTEM.md` §6.50 B7 一处 |
| 六① | A5 用行号定位（评审 🔵7） | 随第三条一并改：三处 `never` 按「档 + 节名 + 逐字句」点名，无 `L1` ∥ `末行` 字样 |
| 六② | 三问 `none found` 那行（评审 🔵8） | 改为 `落笔前扫两域 = 0 命中；落盘后现盘 1 处，在 \`thincoder-core/prompts/common.md\` 的 \`## Evidence discipline\`（即落点 ① 自己）` |

**本轮读数**（量法 = node 行扫描 · `includes` 逐字串 ∥ `[...line].length`）

- **落盘行与首词**：落点 ①–⑦ 的落盘行共 29 行（① 11 · ② 5 · ③ 3 · ④ 3 · ⑤ 4 · ⑥ 1 · ⑦ 2），首词逐个比禁令词集 = 命中 0；`never` 3 处、全在句中（首词分别为 `A` ∥ `The` ∥ `A`）。
- **旧名词探针**（域 = `thincoder-core/prompts/**` 四档 + 两档设计档）：`A new row's number` = 0 · `A missing row's number` = 0 · `a row's number is fixed` = 0；`A case's number is fixed in the RTM before its case title is written` = 3（`thincoder-core/prompts/**` 内）。
- **文档门**：`doc_check(mode:"gate")`（target = 本仓，docs = 上列两档）首行 = `DOC-CHECK GATE: PASS`。

**在册未处置（in-scope anomaly · 性质 = 旧答法残留在旧批落点节，交父侧定）**

`TESTING.md` §11.17 的 ①②③ 围栏块与 `PROMPT-SYSTEM.md` §6.50 的 B7 ∥ B8、§6.51 的围栏块，除用例号那一句已收齐，仍持 §6.102 换掉的旧答法：

- `which rows this change breaks (rewrite them), which rows are redundant (delete them), which rows are missing (new rows)`；
- `rows broken, rows redundant, rows missing`。

复现 = `grep -n "which rows this change breaks" docs/core/design/TESTING.md docs/core/design/PROMPT-SYSTEM.md` → 命中 10 处，其中 **5 处**是旧答法正文：`TESTING.md` §11.17 的 ① ∥ ② 两处，`PROMPT-SYSTEM.md` §6.50 的 B7 ∥ B8 与 §6.51 的一处围栏块；余 5 处是 §6.102 自己的现文引文与判据格（记的是被打掉的那个形，不是教法）。

它们是那几节作为旧批落点记的正文。改成 §6.102 的新答法，等于在同一机制上并存第二份正文（D2）。本轮只收父侧点名的旧名词那一族，处置请您定：同批由本席收（改成指向 §6.102 的落点行、不留词句副本），还是另批。

**上抛项**：`[上抛·知会]` 实施记录里「盘上从来没有过 W3 那个形」与批起快照不符（路径见上表第二条）；W3 原引文即盘面，已零改。

**存量收口轮（用户 2026-11-12 裁定：同批收，不留到另批）**

- 理由（用户本轮逐字）：「这几处是**同一条规则在状态档上的第二份正文**……派出去另批，等于承认「同一个机制两份正文」可以并存。」
- 改法（用户本轮逐字）：「**不在这里另写一份词句**。这几处改成指向规则本体的落点行（节名 + `design §6.102 落点 ②③` 这类坐标），让状态档里只有一处写着词句。」

**逐处 → 改成了哪句坐标**

| # | 档 · 位置 | 改前持什么 | 改成（落盘形） |
|---|---|---|---|
| 1 | `docs/core/design/TESTING.md` §11.17 ① | 围栏块整段（`persona-eng-designer.md` 第 9 项目标形，含 `Read it before designing, then answer as a delta: which rows this change breaks (rewrite them)…`） | 落点表行 ①：`persona-eng-designer.md` 第 9 项（设计档条目 9）= **§6.102 落点 ② ∥ ⑦-1** |
| 2 | 同节 ② | 围栏块整段（第 12 条目标形，含 `which rows this change breaks, which are redundant, which are missing`） | 落点表行 ②：`advisor-design.md` 第 12 条 = **§6.102 落点 ⑤ ∥ ⑦-2** |
| 3 | 同节 ③ | 围栏块整段（集成索引段，含 `rows broken, rows redundant, rows missing`） | 落点表行 ③：`discipline-engineering.md` 集成索引段 = **§6.102 落点 ④ ∥ ⑦-3** |
| 4 | `docs/core/design/PROMPT-SYSTEM.md` §6.50 B7 | 围栏块（七行，第 9 项目标形） | `B7 — …第 9 项：**词句不在本节复制**——现行目标形与落点 = 本档 §6.102（落点 ② ∥ ⑦-1）。` |
| 5 | 同节 B8 | 围栏块（两行，第 12 条目标形） | `B8 — …第 12 条：**词句不在本节复制**——现行目标形与落点 = 本档 §6.102（落点 ⑤ ∥ ⑦-2）。`（原括注「与 §6.51 B2 同文，两处并存待收口合并」随块删去） |
| 6 | 同档 §6.51 B2 | 围栏块（两行，与 B8 同文） | `B2 — …第 12 条：**词句不在本节复制**——现行目标形与落点 = 本档 §6.102（落点 ⑤ ∥ ⑦-2）。`（同上的并存括注同删） |

**第 3 处是本席同轮扫出来的第 6 处**：它不在用户点名的 5 处内，但同族、同节、旧答法正文——按「改完按同一探针再扫一遍」并进本轮。

**同节其余两处连带（TESTING §11.17 已无逐字块，留着即失真）**

- 标题「（三处逐字）」→「（三处 · 词句单源 = `docs/core/design/PROMPT-SYSTEM.md` §6.102）」；
- 引文「本节持最终文字」→「本节只记落在哪三档的哪一处，**词句不在这里复制**」；
- 「`#87` 保留件的并存口径」与「三个用名」两段（只为造那三块而写）→ 一行「本节只管『落在哪一档的哪一处』……状态档里只留一处写着词句」。

**同轮扫掉的隔壁副本（本席自查，用户未点名）**

- §6.50 A1 的 `围栏块 B1–B12` → `B1–B6 ∥ B9–B12`，并写明 B7 ∥ B8 现为落点行、不入本项比对；
- §6.50 A4 的 `B2 ∥ B7 各带一行 Why:` → `B2 带一行 Why:`，B7 的词句与写形指向 §6.102。

**读数（量法写清，数住本段）**

- `which rows this change breaks`（探针 = 内置 `grep` 逐字串，域 = `docs/core/design/` 上列两档）：**改前 10 → 改后 5**。余下 5 处全在 `PROMPT-SYSTEM.md` 的 §6.102：普查表第 1 ∥ 4 行（判据格）、要修表 W1 ∥ W4（现文引文）、验收 A2（判据格）。`TESTING.md` = 0。
- `rows broken, rows redundant, rows missing`（同一探针、同一域）：**改前 4 → 改后 3**。余下 3 处全在 §6.102：普查表第 3 行、要修表 W3、验收 A3。`TESTING.md` = 0。
- 文档门：`doc_check(mode:"gate")`（target = 本仓，docs = 上列两档）首行 = `DOC-CHECK GATE: PASS`。
- 落地核对：落点表三行的坐标逐条对有 §6.102 的落点 ②⑤④ 与 ⑦-1∥⑦-2∥⑦-3（读该档 §6.102 的落点段与 ⑦ 处置表）。

**集成 delta = 零行**：本轮可观察面是设计档里的词句副本，业务结果一行不动（与本节前文的 delta 同据）。

**边界（本轮不做）**

- 提示词本体零笔 · 需求档零笔 · 别的批档零触 · 代码零笔。
- §6.102 的现文引文与判据格零改（用户点名的 5 处命中里，留下的那一半就是它）。
- §6.102 落点 ①–⑦ 的词句 ∥ 断行 ∥ 验收口径零改；落点表只是指过去。

**在册（in-scope，未处置 · 交父侧定）**

- `docs/core/design/PROMPT-SYSTEM.md` §6.51「取代」首条仍写「本节 B2 取代 §6.50 B8 的目标形」；B8 现为落点行、无目标形可取代，两点现同指 §6.102。复现 = `grep "B2 取代" docs/core/design/PROMPT-SYSTEM.md` → 命中 1 处。改写上一批的取代记录属语义面，本席未动。
- §6.50「中文复核面」的 B7 ∥ B8–B11 两条仍用中文复述答法语义（供人复核、不入提示词，非旧答法词句）。零改。

**上抛项**：无。

**收口小笔（§6.51「取代」首条 · 父侧点名一处）**

只动 `docs/core/design/PROMPT-SYSTEM.md` §6.51 的一行；§6.50 中文复核面、提示词本体、需求档、别的批档、代码零触。

- **改前（逐字）**：本节 B2 取代 §6.50 B8 的目标形与该节 A1 的 `the project's entry` 读数：同一元素、名字不变，B2 补同一句注解 ⇒ A1 的「评审档恰 1」改按两档计（本节 A2）。
- **改后（逐字）**：本节 B2 与 §6.50 B8 现同形：两条都是指向本档 §6.102 落点 ⑤ ∥ ⑦-2 的落点行，两节都不再持词句，故本节与那节之间已无「目标形」可取代。
  `entry` 一事的现行答案在本档 §6.102 的落点 ② ∥ ⑤（两面同一句）：`this project's entry (where a user enters the business — a business-observable point)`。
- **原句为何不成立**：§6.50 B8 与本节 B2 现文同形，都是「词句不在本节复制 —— 现行目标形与落点 = 本档 §6.102（落点 ⑤ ∥ ⑦-2）」，无目标形可取代；
  §6.50 A1 现文也已不含「评审档恰 1」这条读数（它判的是围栏块 B1–B6 ∥ B9–B12 与 `TESTING.md` §13.2 逐句一致，并写明 B7 ∥ B8 是落点行、不入本项比对）。
- **新句两处事实已实读**：两条落点行同指 §6.102 落点 ⑤ ∥ ⑦-2；两面落盘句去缩进后逐字相等（`advisor-design.md` 第 12 条与 `persona-eng-designer.md` 条目 9）。
- **读数**（量法 = node 行扫描，域 = `PROMPT-SYSTEM.md` + `TESTING.md`）：`B2 取代` = 0 · `B8 的目标形` = 0 · `评审档恰 1` = 0 · `该节 A1` = 0（改前 `B2 取代` = 1）；新行 211 字。
- **文档门**：`doc_check(mode:"gate")` 首行 = `DOC-CHECK GATE: PASS`。



**收口笔（A2 引文打不到盘 · 用户 2026-11-12「改完这个批就收口」）**

用户给的二选一取**形 A：补正引文（带 `this`）**，判法不改。

- **A2 逐字**：`评审档内 \`this project's entry (where a user enters the business — a business-observable point)\` ∥ \`Only one reason stands:\` 各在位一处` —— 原引文缺 `this`，盘上两档实读无该形，按它逐字检索 0 处，那条验收判不了。
- **同轮扫掉的隔壁四处**（同一句的副本；只改 A2 会与它们在 §6.51 同页相反）：机制 2 → `名字沿用盘上既有名：两面同为 \`this project's entry\`（评审档第 12 条 ∥ 设计席 item 9）`；中文复核面 B2 ∥ B5 → `名 = 本项目的入口（评审档 ∥ 设计席同为 \`this project's entry\`）`；K2 → `入口名不变（两面同为 \`this project's entry\`）`；既有件三问 → `\`this project's entry\` 在册（\`advisor-design.md\` ∥ \`persona-eng-designer.md\`）`。
- **读数**（量法 = 内置 `grep` 逐字串）：`this project's entry (where a user enters the business — a business-observable point)` 在 `thincoder-core/prompts/` = 两档各 1 处（A2 的「各在位一处」由此可判）；`the project's entry`（不带 `this`）在 `thincoder-core/prompts/` = 0。
- **零改的两处**（改前引文，非现况）：§6.51 J2 的 `现文（摘 · 逐字）` 与要修表 W4 的改前整行——两张表记的是各自那一笔落盘前盘上的字，改它即抹掉评审据以核对的引文。
- **文档门**：`doc_check(mode:"gate")`（target = 本仓，docs = `docs/core/design/PROMPT-SYSTEM.md`）首行 = `DOC-CHECK GATE: PASS`。

## §3 设计评审（评审子代理）
**状态行**：评审通过



### 轮次 1（评审子代理）

| # | 严重度 | 状态 | 证据（指针） |
|---|---|---|---|
| 1 | 🔴 | 待处置 | §6.66「判法一句…数是机制本体就留」+「两种引用形 + 一条读数规则…权威读数表、带量法与日期的读数块、当下准确的读数，都不是负债」·「清单的维护面…本节（人读权威的唯一活描述）」 vs §6.102 落点 ①「a reading belongs to the batch record and to the command's own output」+ §8.2 新行「正文单源 = `docs/core/design/PROMPT-SYSTEM.md` §6.102」——同一机制（状态档里能不能写一个读数/计数）在同一份档里两处活描述，各称单源；§6.102 的「对照表…结论 = 零矛盾」未列 §6.66，公共源勘察亦未命中它 |
| 2 | 🔴 | 待处置 | A6「`doc_check(mode:\"gate\")` 首行 = `DOC-CHECK GATE: PASS`…判物 = 单行码点数 ≤300」 vs 落点 ③ 围栏块整行（「**Names in the prose ↔ names in the table**…one end hidden.」约 387 码点）、落点 ② 首行（约 334）、落点 ④（约 347）——三处目标行皆越 300；同档 §6.67 记的正是提示词面逐行 300 被 `doc_check` 拒的那次事故；本节无「逐行 ≤300」的实算行（§6.9 有「参考译五行行宽 ≤300（本席本轮 `node` 实算）」） |
| 3 | 🟡 | 待处置 | 普查判据「写进状态档的位置 ∥ 计数算，读数与批档不算」 vs 落点 ①「The rule bites at the moment a number is written into a state document」——读数算不算，两处两说；普查域「`thincoder-core/prompts/**`」不含 `thincoder-core/tool-docs/**`，§6.66 的判域是两面 |
| 4 | 🟡 | 待处置 | 缺「既有件三问」——本节把「Table rows ↔ summary counts」换名为「Names in the prose ↔ names in the table」，无 `existing:` / `none found:` 一行；§6.101 与 §6.66 各有该段 |
| 5 | 🟡 | 待处置 | 「最近先例 ∥ 偏离」只给设计档节号（§6.100 ∥ §6.101），无实现坐标与先例批；§6.101 的同一段标题为「最近先例（含实现坐标）」 |
| 6 | 🟡 | 待处置 | A5「禁令词集…对落点 ①–⑤ 的新增行逐行读，命中 0（落点 ① 的 `never … written into`…）」 vs 落点 ②「never tallies them」· 落点 ④「never a blank」——按「命中 0」读则 A5 不过；A5 标题写的是「零禁令起句」 |
| 7 | 🟡 | 待处置 | 定位靠逐字句而 W1 现文以「—」截断、W4 现文含「…」、落点 ② 第二个目标行只给到 `with each row naming…`——本节自己禁行号做定位，逐字残缺即无可定位之处 |
| 8 | 🟡 | 待处置 | 「集成测试设计」与 §6.101 同名节逐句同形（同为 `CLI 20` ∥ `CLI 10` ∥ `CLI 13` ∥ `CLI 17`，同一句「与本批同主题的行只有 `CLI 20`」）——本节主题是状态档教法，与该行主题的名字对照无据 |
| 9 | 🟡 | 待处置 | 「**受影响文件**」表在状态档内——`docs/core/standards/METHODOLOGY.md` F-R24a「受影响文件表归批档 §2，设计档不设」；表内无行数、无增量（机判句不触） |
| 10 | 🔵 | 待处置 | 同一句答法两处措辞不一：落点 ② 「the requirement it serves」/「the business-observable result」 vs 落点 ⑤ 「the business requirement it traces back to」/「the business result」 |

VERDICT: changes-required

计数：🔴 2 · 🟡 7 · 🔵 1（共 10 条；已核 `doc_check(report)` 对本档 = PASS，本条读数不构成第 2 条的反证——围栏块内不受段判）

### 轮次 2（评审子代理）

**第 2 轮核验（只验第 1 轮 2🔴 7🟡 1🔵 的处置）**

| # | 严重度 | 状态 | 证据（指针） |
|---|---|---|---|
| 1 | 🔴 | Fixed | §6.66 判法一句现读「**机制本体的常量与阈值留**（段长上限 ∥ 字符预算这类认定值）；**对某个集合的计数不留**，它是读数，归批档与命令输出（规则本体与答法 = 本档 §6.102）」；「都不是负债」在 §6.66 内已无一处，残留只在 §6.102 对照表左列（记的是被替掉的旧口径） |
| 2 | 🔴 | Fixed | §6.102「断行规则」+「行宽读数（本席实算 · 同一把尺 `[...line].length`）」：`落点 ① 最长行 = 232 码点 · 落点 ② = 240 · 落点 ③ = 204 · 落点 ④ = 212 · 落点 ⑤ = 242`；围栏块已按分句边界重断，A6 改为判落盘行 + 拼回逐字相等 |
| 3 | 🟡 | Fixed | 普查「**判据三档**」三段收齐（状态档的位置 ∥ 计数 ∥ 读数 都算；批档与命令输出不算；干活时手上的数不算）；**域** = `thincoder-core/prompts/**` + `thincoder-core/tool-docs/**`，补齐普查 13 行 |
| 4 | 🟡 | Fixed | §6.102「**既有件三问（改名的标签 `Names in the prose ↔ names in the table` …）**」带 `existing:` 行；残留见本轮 N2（新起的判据句未入三问，🔵） |
| 5 | 🟡 | Fixed | 标题已为「**最近先例（含实现坐标）**」，两条先例各带档 + 节 + 逐字句坐标 |
| 6 | 🟡 | Fixed | A5 取词法写明（去掉行首空白、`>`、列表编号与 `**` 之后到第一个空格前的那一个词）；残留见本轮 N1（`never` 列举少一处，🔵，不影响「0 起句」结论） |
| 7 | 🟡 | Fixed | W1 ∥ W4 现文两行均逐字整行给出（`… (new rows) —` ∥ `with each row naming … point).`；`… which are missing;` ∥ `each row names … traces back to.`） |
| 8 | 🟡 | Fixed | 集成测试设计已按本批重读：题眼行改为 `CLI 28`，并写「为何仍逐行读过」；不再是 §6.101 的同一组行与同一句理由 |
| 9 | 🟡 | Fixed | 受影响文件表已撤，改为「**落点图**（哪条答法落哪一档；受影响文件表归批档 §2——F-R24a）」 |
| 10 | 🔵 | Fixed | 落点 ② 与落点 ⑤ 现同为「the business-observable result it asserts, the requirement it serves」 |
| N1 | 🔵 | New | A5「本笔实读：17 行无一以禁令词起句（`never` 在落点 ① L1 与落点 ④ L1 都是句中状语…）」——落点 ① 末行「never at the moment it is read」同含 `never` 未列；起句为 `The`，结论不变 |
| N2 | 🔵 | New | 既有件三问只覆盖改名标签；`common.md` 新起的判据句名「A state doc carries what is true…」未入三问（elif 归 🔵：非可复用标签） |

**核对**：`doc_check(report)` on `docs/core/design/PROMPT-SYSTEM.md` = `DOC-CHECK GATE: PASS`（A6 的门条件对本档可成立）。

VERDICT: pass

counts: 🔴 0 open / 🟡 0 open / 🔵 2 open（optional）

### 轮次 3（评审子代理）

**第 3 轮（设计评审 · 只验交付后收正四条 = 落点 ⑥⑦ ∥ A5 读数 ∥ 三问补行 ∥ A1–A7）**

| # | 严重度 | 状态 | 证据（指针） |
|---|---|---|---|
| 1 | 🟡 | open | §6.102「A5 · 全批」判法句「落点 ①–⑦ 的**每一落盘行**（新增行与替写行皆算）」 vs 其读数「**19 行，起句落集 = 0**」；落点 ⑦ 一句在 ⑦-1 ∥ ⑦-2 各自整行落盘（⑦-3 与落点 ④ 末行重合），按该判法应为 20 |
| 2 | 🟡 | open | 落点 ⑦ 缺缩进规则（对比落点 ②③④ 各带「缩进与相邻行同形」）；W7 引三处现文缩进 = 3 ∥ 4 ∥ 2 空格，而 A6 判「拼回…与本节围栏块所给词句逐字相等」——零缩进落盘反合围栏块 |
| 3 | 🟡 | open | W7 第 3 份副本现文「`  A case's number is fixed in the RTM before its case title is written.`」与 W3 同一句引文「a row's number is fixed in the RTM before its case title is written.」互相不一致（两处同称「逐字整行」）；A7 探针只含 `A new row's number` ∥ `A missing row's number`，未含第三份的 `a row's number` |
| 4 | 🟡 | open | ⑦-3 处置「整行换为上面那一句」 vs 落点 ④ 围栏块末行「how many of each is a reading, so it lives in the batch record rather than in the design section. A case's number is fixed…」——照 ⑦-3 字面执行会删掉前半句 |
| 5 | 🟡 | open | A5 起句定义「到第一个空格前的那**一个词**」 vs 点名三处的写法「起句 `A state doc`」∥「起句 `The rule bites`」∥「起句 `A design round`」（三词短语） |
| 6 | 🟡 | open | 落点 ⑥ 目标行保留计数半句「and a count of them is a reading, kept in the batch record」 vs 对照表「`common.md` 第 9 条的 `counts and lists change together`」行「计数那半去掉」∥ K1「判据立 `common.md` 一处」 |
| 7 | 🔵 | open | A5 以「落点 ① L1」「落点 ① 末行」指认三处 `never`，与本节「定位按「档 + 节名 + 逐字句」找，不按行号」相反；三处可改按 `never where it sits` ∥ `never at the moment it is read` ∥ `never a blank` 点名 |
| 8 | 🔵 | open | 「既有件三问」的 `none found` 行「命中 0（现盘 1 处，就是落点 ① 自己）」——未写那 1 处在哪一档，读者易读成与「命中 0」矛盾 |
| 9 | 🔵 | open | 同档 §6.104「**What must not appear in it**: … its acceptance lines, its case table, its integration delta」 vs §6.102 本节的验收 A1–A7 ∥ 用例表 ∥ 集成测试设计读数共存；§6.102 边界「不清本档存量计数」与 §6.104「不回溯清本档存量 100 节」已声明不清，故不拦本轮 |

已核通过（四条收正）：

- ① 落点 ⑥ 目标态整行给全、前半句逐字不动；普查第 11 行判定已改「**算**」并指回落点 ⑥。
- ② 落点 ⑦ 三份副本名词归一为 `case`，⑦-3 与落点 ④ 末行同源。
- ③ A5 已为计数式并点名三处；本席独立数得块行 19 = 7+3+2+2+3+1+1 · `never` 3 处全在句中（落点 ① L1 ∥ 落点 ① 末行 ∥ 落点 ④ L1）。
- ④ 三问已补 `none found:` 行。
- A1–A7 逐条可判、判法自持；集成测试设计节在场（起读 `test/RTM.md`，破行 ∥ 冗余 ∥ 新增）；最近先例行与公共源勘察行在场；零代码档、无分支。

VERDICT: pass

计数：🔴 0 · 🟡 6 · 🔵 3 · 未解决 🔴 = 0

## §4 用户批准（主 agent）

**用户批准**：2026-11-12 21:27「开批，不过，我的原则不是只清这几处，是类似的用行号的地方都清，也包括行计数」——批级授权，覆盖本批全链。

**评审链**：第 1 轮 `changes-required`（2🔴 7🟡 1🔵）→ 修正 → 第 2 轮 `pass` → 实施 → 第 3 轮 `pass`（交付后收正，6🟡 3🔵）→ 实施（落点 ⑥⑦）→ 收正轮两笔。

**用户在批中途纠正过两次判断**，都记在 §1：①我把「清行号」写成了一套「算 ∥ 不算 ∥ 拿不准」的分类法，被指出「写要做什么事儿就行」；②我提议清设计档里的存量计数，被指出「存量不判」「写门判改的行」。

## §5 实施记录（eng-coder）

**实施轮 · 五处落盘（eng-coder）**

依据 = `docs/core/design/PROMPT-SYSTEM.md` §6.102 的五个围栏块（逐字词句）+ 批档 §2 的 E1–E4 与 A1–A6。
**词句与断行分开**：词句逐字等于围栏块，一个字不改；断行由本席按「只在句或分句边界断 · 词一个不改 · 拼回逐字相等 · 每行 ≤300 码点」自定。
落盘后逐条实读：**五处拼回与围栏块逐字相等**（含字符数相等），**全批新增 26 行，最长行 212 码点**，四个档的 `##` / `###` 计数改前 = 改后。

### 五处逐条（改前逐字 → 改后落点 · 断在哪 · 拼回 · 行宽）

| # | 档 · 落点 | 改前（逐字整行） | 改后 | 断在哪 | 拼回 = 围栏块 | 行宽（码点，量法 `[...line].length`） |
|---|---|---|---|---|---|---|
| ① | `common.md` · `## Evidence discipline` | 无此段（增列）；位置 = `above it, while what you cited — the section, its words, the symbol — stays findable.` 之后、`"Known behavior…" and "I'm confident…"` 之前 | 11 行，起 `**A state doc carries what is true, never where it sits or how much of it there is**:`，止 `The rule bites at the moment a number is written into a state document, never at the moment it is read.` | 6 处：`**:` / `on its own —` / `stands still;` / `or the exact words.` / `asserts this").` / `about to be edited,` 之后 | 相等 | 85 · 124 · 127 · 97 · 131 · 127 · 104 · **192** · 106 · 95 · 103 |
| ② | `persona-eng-designer.md` · item 9 | `   Read it before designing, then answer as a delta: which rows this change breaks (rewrite them), which rows are redundant (delete them), which rows are missing (new rows) —` ∥ `   with each row naming the **interaction between components** it evaluates, the business-observable result it asserts, the requirement it serves, and this project's entry (where a user enters the business — a business-observable point).` | 5 行（缩进 3 空格，与相邻行同形） | 4 处：`it adds,` / `after rows move;` / `counting them;` / `it serves,` 之后 | 相等 | 123 · 80 · 120 · 149 · 93 |
| ③ | `persona-eng-designer.md` · 自检第 2 条 | `     2. **Table rows ↔ summary counts**: one count, one source — whatever the rows tally to is the number you state, and a row added or removed takes the summary line with it in the same pass; the failure this names is the two disagreeing — one moved, the other did not.` | 3 行，首行 `     2. **Names in the prose ↔ names in the table**: …` | 2 处：`same pass,` / `did not.` 之后 | 相等 | **191** · 88 · 123 |
| ④ | `discipline-engineering.md` · 集成索引段 | `  A design round opens by reading it and answers as a delta — rows broken, rows redundant, rows missing — never a blank "which scenarios does this change need" list; a row's number is fixed in the RTM before its case title is written.` | 3 行（缩进 2 空格，与原句同形） | 2 处：`need" list;` / `the design section.` 之后 | 相等 | **212** · 99 · 71 |
| ⑤ | `advisor-design.md` · 第 12 条 | `    The section answers as a delta against it — which rows this change breaks, which are redundant, which are missing;` ∥ `    each row names the **interaction between components** each evaluates, the business result each asserts, the project's entry (where a user enters the business — a business-observable point), and the business requirement each traces back to.` | 3 行 + 增列一条 🟡（在 `**An integration section that starts from a blank "which scenarios do we need" list, with no RTM read, ⇒ 🔴.**` 那一行之后；缩进 4 空格，与相邻行同形） | 3 处：`own title;` / `it serves,` 之后；🟡 为独立一句 | 相等（前三行） | 146 · 150 · 94 · 178 |

**落盘后新增 26 行**（①11 + ②5 + ③3 + ④3 + ⑤4），最长 **212 码点**（④ 首行），越 300 的行 = 0，不可拆短语 = 无。

### 验收实读（A1–A6 · 探针 = 内置 `grep` 逐字串 / 拼接比对 / `[...line].length`）

- **A1 落点 ① 判据在位**：`A state doc carries what is true, never where it sits or how much of it there is` = 1；`What to write instead` = 1；`What a number is still for` = 1；`belong to the batch record` = 1；`the method that produced it and the date it was taken` = 1。
- **A2 设计面两处换写**：item 9 `the case this change rewrites, the case it deletes, the case it adds` = 1；全 `thincoder-core/` 读不到 `which rows this change breaks`（改前 1 → 改后 0）；自检第 2 条 `Names in the prose ↔ names in the table` = 1，`whatever the rows tally to is the number you state` 改后 0。
- **A3 纪律层换写**：`the case it rewrites, the case it deletes, the case it adds, each named by its own title` = 1（整串同在一行）；`rows broken, rows redundant, rows missing` 改后 0。
- **A4 评审面换写 + 🟡**：`as a delta against it — the case this change rewrites` = 1；`answering with a tally of rows instead of their names` = 1；全 `thincoder-core/` 读不到 `which are redundant, which are missing`（改前 1 → 改后 0）。
- **A5 零禁令起句 · 零新节**：26 行逐行取起句（去行首空白 / 列表编号 / `**` 后首词）= `A · before · a · They · the · What · To · A · What · a · The ∥ Read · each · how · each · and ∥ Names · and · A ∥ A · how · A ∥ The · each · and · A`，与 `never ∥ must not ∥ forbidden ∥ 禁止 ∥ 不得` 逐个比 = **命中 0**。`##` / `###` 计数：`common.md` 22/6 · `persona-eng-designer.md` 9/1 · `discipline-engineering.md` 13/7 · `advisor-design.md` 7/0 —— 改前读的是同一组数，改后不变。
- **A6 文档门 + 断行可拼回**：`doc_check(mode:"gate")` 首行 = `DOC-CHECK GATE: PASS`；五处拼回与围栏块逐字相等 = 5/5（各块字符数亦相等：① 1301、② 554、③ 383、④ 378、⑤ 555）；行宽见上表。

### 决定披露

| # | 决定 | 理由 |
|---|---|---|
| 1 | 断行不与围栏块同形（围栏 17 行 → 落盘 26 行） | 设计 §6.102 K7 + 断行规则：围栏块是设计档版式，落盘断行归实施席；用例 C7 明写照抄断行「不算缺陷也不算对」 |
| 2 | 落点 ④ 的首两行合并为一行（212 码点） | A3 的判据是一整串 `the case it rewrites, … each named by its own title`；首版断在两行（拼回仍相等）时，逐字读回会漏判，故合并，仍 ≤300 |
| 3 | 落点 ⑤ 用 4 空格缩进（围栏块为 5 空格） | 「缩进与相邻行同形」；缩进是版式不是词句，拼回按去缩进后比对 |
| 4 | RTM 用例号约定原样留住（`A new row's number is fixed in the RTM …` 三处未动） | 设计 K4 + 普查第 8 行：用例号是身份不是位置，插行不重编 |
| 5 | 未新增单测档 / 探针 / 机检门 | 本批零代码面；批档 §2 明写「零代码档、零单测档」，验证 = 上列实读 + 文档门 |
| 6 | 交收发现 1 条不改盘（见下） | 词句属设计席笔面，本席不改盘；处置由父侧路由 |

### 交收发现（不改盘，交父侧路由）

- `[上抛·知会]` **`common.md` 的 `## Documentation system` 第 9 条仍读 `counts and lists change together`**（本席逐字复读在位），与同档本轮落点 ① 的 `a state doc keeps none of them` 同档并存：读者在一份档里读得到「数与名单一起变」与「状态档一个数都不留」两个方向。这正是用户 21:27 原则（「类似的用行号的地方都清，也包括行计数」）所指的那一族，也是落点 ③ 换掉的教法的压缩形。设计 §6.102 普查第 11 行对它只给了一句 `不算：条文本体，方向正确，本节零改`，未逐句判，且不在本批五个落点内 —— 故本席不改，交父侧决定（改词句属设计席；不改则把判读写进普查第 11 行使读法可核）。
- `[上抛·知会]` 同一规则的三份副本现用两个名词：`A case's number is fixed in the RTM …`（落点 ④）vs `A new row's number …` / `A missing row's number …`。词句由围栏块给定，本席照抄正确，属措辞不齐（🔵），收齐由设计席定。

### 审计与评审轮次 · 终态

- **本席自查**：落盘前先用 dry-run 脚本比对五块拼接与围栏词句（相等才动盘），落盘后再从盘上逐块复读拼回（5/5 相等）；改一次断行（决定 2），改后重跑全部实读。
- **explore 差异审计（1 轮）**：`VERDICT: clean`，a–f 六类无一差异；它明写两项未能复跑（`doc_check(mode:"gate")` 需绑定批档的改动区；`[...line].length` 其工具面无 execute）——两项本席已实跑，读数见上。
- **advisor 代码评审（1 轮）**：`VERDICT: pass`；🟡 1 条（report-only，非 must-fix，即上面交收发现第 1 条）+ 🔵 1 条（第 2 条），无 🔴。A1–A6 六条它逐条实读通过，并记「实现与设计一致，无偏差」。
- **修正轮**：0 轮（审计与评审均无 must-fix）；唯一一处落地修正（落点 ④ 合并两行）发生在审计之前，已记在决定 2。
- **终态**：`clean`（converged）。

### 落地核对

**落地核对：无**（设计档 §6.102 的句子在落盘后仍成立：五处落点均在位、拼回逐字相等、A5/A6 的判法与读数口径未变；三处 `row's number` 的保留正是普查第 8 行的判读；`common.md` 第 9 条是普查第 11 行的既有判读，不是本轮落盘使某句失效）。

**文档门**：`doc_check(mode:"gate")`（target = 本仓，docs = 四份提示词档）首行 = `DOC-CHECK GATE: PASS`。
**本批新债**：0 条（零代码面）；交收发现 2 条见上，台账写权在主 agent，本席未落号。

**实施轮 · 收正轮两处落盘（eng-coder · 落点 ⑥ ∥ ⑦）**

依据 = 设计档 §6.102 的落点 ⑥ ∥ 落点 ⑦ 两个围栏块（逐字词句）+ 本段 §2 收正轮第 一 ∥ 二 两条 + 本席本轮任务书的落点 ⑥ ∥ ⑦ 正文。
上一轮已落的 ①–⑤ 未重做（盘上逐处复读仍在位）。断行按 §6.102「断行规则」三条：只在句界断、词一个不改、拼回逐字相等。本轮四处落盘各为**整行替换**，未新增行、未新增节。

### 两处落点 · 改前逐字 → 改后逐字

| # | 档 · 位置 | 改前（盘上逐字整行） | 改后（落盘逐字整行） | 行宽（`[...line].length`） |
|---|---|---|---|---|
| ⑥ | `common.md` · `## Documentation system` 第 9 条首行 | `9. Acceptance before prose — every requirement is verifiable; counts and lists change together.` | `9. Acceptance before prose — every requirement is verifiable; a set of things named in one place goes by the same names wherever else it appears, and a count of them is a reading, kept in the batch record.` | 205 |
| ⑦-1 | `persona-eng-designer.md` · 设计档条目 9 内 | `   A new row's number is fixed in the RTM before its case title is written — `test('CLI 1-1 …')`, the same number verbatim.` | `   A case's number is fixed in the RTM before its case title is written — `test('CLI 1-1 …')`, the same number verbatim.` | 120 |
| ⑦-2 | `advisor-design.md` · 第 12 条内 | `    A missing row's number is fixed in the RTM before its case title is written — `test('CLI 1-1 …')`, the same number verbatim.` | `    A case's number is fixed in the RTM before its case title is written — `test('CLI 1-1 …')`, the same number verbatim.` | 121 |
| ⑦-3 | `discipline-engineering.md` · 集成索引段内 | `  A case's number is fixed in the RTM before its case title is written.` | `  A case's number is fixed in the RTM before its case title is written — `test('CLI 1-1 …')`, the same number verbatim.` | 119 |

⑥ 的前半句 `Acceptance before prose — every requirement is verifiable` 逐字未动，只换了分号之后那半。
⑦ 三处换后各为三处副本同一句（词句 117 码点），缩进各自与相邻行同形。

### 三处副本 · 盘上实读现文（改前）

本轮任务书要求「去盘上实读，不按设计档引文照抄」，实读结果如下（缩进位数 = 行首空格数）：

| # | 档 | 缩进 | 现文逐字（改前） | 尾半句 |
|---|---|---|---|---|
| 1 | `persona-eng-designer.md` 条目 9 | 3 | `A new row's number is fixed in the RTM before its case title is written — `test('CLI 1-1 …')`, the same number verbatim.` | 有 |
| 2 | `advisor-design.md` 第 12 条 | 4 | `A missing row's number is fixed in the RTM before its case title is written — `test('CLI 1-1 …')`, the same number verbatim.` | 有 |
| 3 | `discipline-engineering.md` 集成索引段 | 2 | `A case's number is fixed in the RTM before its case title is written.` | **无** |

第 3 处的实读与设计档两处引文都不一致：要修表 W7 引它作 `A case's number …`（无尾半句，与本席实读同形），W3 引同一句作 `a row's number is fixed …`（小写、无尾半句、嵌在长句里）——**盘上从来没有过 W3 那个形**。本席按盘面处置：保留其 `A case's number` 起句与 2 空格缩进，只补出尾半句，使三处逐字相同。

### 两处设计档没说清的地方 · 本席判据

| # | 判断 | 判据 |
|---|---|---|
| 1 | 落点 ⑦ 的缩进 | 设计档未给 ⑦ 的缩进规则，按「相邻行同形」落：条目 9 那行是条目 9 的续行，相邻续行 3 空格；第 12 条那行相邻行为 4 空格；集成索引段那行相邻两行为 2 空格。围栏块本身不带缩进，故缩进属版式、拼回按去缩进比对（与上一轮决定 3 同口径） |
| 2 | 第 3 处的现文以盘面为准 | 见上表：盘上是 `A case's number …` 无尾半句。补出尾半句后，落点 ④ 的拼回也与围栏块逐字相等（改前 ④ 拼回缺尾半句，本轮读数为此） |

### 验收逐条读数（A7 那一条 · 探针 = 内置 `grep` 逐字串，域 = `thincoder-core/`；行宽 = `[...line].length`）

- **`counts and lists change together` = 0**（改前 1，改前那一行见 `git diff` 的 `-` 侧）。
- **`A new row's number` = 0**（改前 1）· **`A missing row's number` = 0**（改前 1）。
- **`a row's number is fixed` = 0 / 改前 0** —— 这条**不能区分**：盘上从来没有这个小写形（第 3 处实读是 `A case's number`）。有判别力的两条是上面那两条大写形（1 → 0）。
- **`a set of things named in one place goes by the same names wherever else it appears` = 1**（即 `common.md` 第 9 条）。
- **`A case's number is fixed in the RTM before its case title is written` = 3 处**，去掉缩进后三处逐字相同（`new Set(trim).size === 1` = true）。
- **`row's number` 剩 1 处**（`persona-engineering.md` 的台账行那句，普查表判「不算」）· **`case's number` = 3 处** —— 与 §2 的探针预期（1 ∥ 3）一致。
- **行宽**：四处落盘行 = 205 ∥ 120 ∥ 121 ∥ 119 码点，**越 300 的行 = 0**。
- **拼回**：⑥ 与围栏块逐字相等 = true；⑦ 三处去缩进后与围栏块逐字相等 = true；④ 三段拼回与围栏块逐字相等 = true。
- **零标题连带**：`##` / `###` 计数 = `common.md` 22/6 · `persona-eng-designer.md` 9/1 · `advisor-design.md` 7/0 · `discipline-engineering.md` 13/7，改前读的是同一组数。
- **文档门**：`doc_check(mode:"gate")` 首行 = `DOC-CHECK GATE: PASS`（域 = 四份提示词档的本轮改动区）；另跑 `doc_check(mode:"report")` 同四档 = `PASS`，作为「PASS 不是判了个空」的对照（正侧与改后同域、整档判）。
- **单测面**：`test/` 内对四份提示词档零引用（`prompts/(common|persona-eng-designer|advisor-design|discipline-engineering)` 命中 0），故无既有用例可跑、无红侧；本批零代码档，验证 = 上列实读 + 文档门。

### 未碰（逐条）

设计档零笔 · 需求档零笔 · 其它批档零触 · 代码零笔 · 上一轮五个落点零改 · `persona-engineering.md` 的 `whose ledger carries this row's number` 零改（普查表判「不算」）。

### 交收发现（本席不改盘，交父侧路由）

- `[上抛·知会]` **设计层另有三处逐字副本**：`docs/core/design/TESTING.md` 的 `### 11.17 提示词落点（三处逐字）` 两行照抄了 `A new row's number …` 与 `A missing row's number …`；`docs/core/design/PROMPT-SYSTEM.md` 的 `### 6.50` 围栏块（整段照抄提示词条目 9）一行 `A new row's number …`。§6.102 内那几处是设计档自己的改动记录引用，不算副本。本批判域是 `thincoder-core/`，设计档不在本席笔面，故零改。
- `[上抛·知会]` **打包产物里是旧第 9 条**：`thincoder-desktop/dist-r3` 与 `dist-r4` 的 `app.asar` 内嵌 `counts and lists change together`（构建快照，不在源码面）。
- `[上抛·知会]` 设计档要修表 W3 对第 3 处现文的引文（`a row's number …`）与盘面不符；该处已由 §3 第 3 轮第 3 条在册，非本轮落盘产生。

### 落地核对

**落地核对：无**。设计档 §6.102 的落点 ⑥ ∥ ⑦ 句子在本轮落盘后仍成立：两处词句逐字等于围栏块、拼回相等、行宽在限内；⑦-3 的括注「落点 ④ 围栏块末行已按此写」在本轮补出尾半句后首次为真（改前 ④ 拼回缺尾半句，那句括注当时不成立——补出即消，未新增不实句）。W3 引文与盘面的出入属评审轮次在册项，非本次落盘使其失效。

**文档门**：`doc_check(mode:"gate")` 首行 = `DOC-CHECK GATE: PASS`。
**本批新债**：0 条（零代码面）；交收发现 3 条见上，台账写权在主 agent，本席未落号。

### 审计与评审轮次 · 终态

- **本席自查**：落盘前先取盘面实读（改前四行逐字、缩进位数、码点数），落盘后从盘上逐块复读、按去缩进拼回比对围栏块（三处 ⑦ 与 ⑥ 全相等），再跑探针与文档门；读数见上。
- **explore 差异审计（1 轮）**：`VERDICT: clean`，0 差异；六条验收项逐条 ✅（含「五处旧落点仍在位」与「旧形 5 个探针 0 命中」）。它自报两处工具面限制：其席位无 `execute`/`bash`，故行宽未用 `[...line].length` 实算，改以整行锚定正则相等 + `doc_check` 整档判间接确立；`doc_check(mode:"gate")` 未复跑（无批档绑定则无改动区可判）——该门本席已实跑。
- **advisor 代码评审（1 轮）**：`VERDICT: pass`，0 🔴 / 0 must-fix 🟡 / 1 🔵（report-only）。那条 🔵 = 第 9 条只点「批档」一个读数之家，而 §8.2 与落点 ① 写两处（批档 + 命令输出）；本席判据 = 落盘词句是围栏块逐字形，改它属设计席笔面，故**不改盘**，登记于此。评审引用的行号为相对路径形，宿主侧未能校验；其实质结论所据的逐字引文与本席本轮实读一致。
- **修正轮**：0 轮（审计与评审均无 must-fix）；两处判据（⑦ 缩进 ∥ 第三处现文以盘面为准）已写进上节，未产生落地修正。
- **终态**：`clean`（converged）。

## §6 验证与收口（父代理）

**验证（父侧，本会话实跑，探针 = 内置 `grep` 逐字串，域 = `thincoder-core/prompts/`）**

| 检查 | 读数 |
|---|---|
| 新规则在位 | `A state doc carries what is true` = 1 · `Names in the prose` = 1 · `the case this change rewrites` = 2 · `A case's number is fixed in the RTM` = 3 |
| 旧答法清零 | `which rows this change breaks` = 0 · `rows broken, rows redundant, rows missing` = 0 · `counts and lists change together` = 0 · `A new row's number` = 0 · `A missing row's number` = 0 |
| 文档门 | `doc_check(mode:"gate")` 首行 `DOC-CHECK GATE: PASS`（范围 5 档） |

**单测**：本批零代码档，无单测档可写、无既有用例可跑；`test/` 对四份提示词档零引用（实施席 grep 证实）。

**集成集**：本批不破任何既有用例——可观察面是提示词文本，`CLI 28` 断的是 `edit` 工具行为，面不同；RTM delta = 破 0 ∥ 冗余 0 ∥ 新增 0。

**落点核对**：五处提示词落点 + 交付后两处（⑥⑦）+ 设计档三处副本收齐（`TESTING.md` §11.17 ∥ `PROMPT-SYSTEM.md` §6.50 B7·B8 ∥ §6.51 B2）全部落盘；`TESTING.md` 的「三处逐字」块改成落点表，词句单源回到 §6.102。

**两处刻意零改**：J2 的现文摘录与 W4 的改前整行仍引旧句——那是评审核过的引文，改它就抹掉了核对基准。

**本批无新债。**
