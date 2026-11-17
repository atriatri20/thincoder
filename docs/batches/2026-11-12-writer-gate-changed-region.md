# 2026-11-12 · writer-gate-changed-region
> 六段，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 每段只有一个作者：作者的段可 `append` 加内容、可就地改（`edit`）；非作者一概拒。
> 编制：主 agent · 2026-11-12 · 来源 = 用户 2026-11-12 20:24：改一行文档被整份存量债拦下（30 处行号锚 + 1 处超长段），指出写门必须判变更区而不是整份。
> 台账 = #2369（core · 归批）。前情 = 无（独立批）。
## §1 讨论（主 agent）
**状态行**：已收口 2026-11-12
批起 sha = 27cf33b90d84e63833df5589a516d96192da019a
<§1 模板占位：本批条目 / 关键判据 / 授权口径>

**要解决的事**：写门（`.md` 落盘前那一道）一直判整份文档。用户 2026-11-12 20:24 改一行（某需求档 D-1 单元格换路径）被整份存量债拦下——30 处行号锚 + 1 处超长段 + 3 处悬空，没有一条在他改的那一行附近。他要的是判变更区，这几天一直如此。

**根因（不是代码 bug）**：需求档 `docs/core/requirements/DOC-CHECK.md` 里，写门的判域**没有任何一条功能点规定**。它只在「不扩区」那半句被顺带排除，理由是一句「写门判它手上那份改后文本」；设计档 §6 ∥ §9 照此写成「写时点判整份」，代码照落。

**已定决定**：补 F10 正面规定写门判域，并删掉「不扩区」里的写门排除语。用户原话：「开工」（2026-11-12 20:35，就派设计席的开工令）。时间：2026-11-12 20:35。

**需求已落**（本席笔，`docs/core/requirements/DOC-CHECK.md` 三处）：
- F10 新功能点（判这一笔改的行；新档 ⇒ 整份判）；
- 「变更区怎么算」那段未动，作为共用算法；
- 新增一段「缝上没有字，所以只喂段长」——段长认缝，行号锚与悬空指针只看变更行；
- 「不扩区」删去写门半句，只留 `report` mode。

**库内 = 已查**：`docs/core/requirements/DOC-CHECK.md` 全文实读（F1–F9 ∥ 变更区算法 ∥ 不扩区 ∥ §3 边界 ∥ §4 验收 AC-1–AC-12）→ 写门判域无功能点，仅在第 33 行被排除语带过。`docs/core/design/DOC-CHECK.md` §6 ∥ §9 的「两个时点」描述按既有转述记录，本轮未逐行复核（设计席落笔前须实读）。

**库外 = B 类**：改动面 = `thincoder-core/tools/doc-write-gate.mjs` ∥ `thincoder-core/doc-check/index.mjs` ∥ 设计档与工具描述；外部断言 = 零。

**自动推进**：范围 = 本批全链（设计 → 评审点火 → 修正轮 → 实施 → 收口），自 2026-11-12 20:36 起，用户原话：「自动跑完」。遇需要用户拍板的事才停。

- **已定决定**：写门判域改判「这一笔改的行」，收口门与写门共用同一套变更区算法 · 用户原话：「开工」· 时间：2026-11-12 20:35

**已定决定（实施轮的边界，父侧实读盘上得出）**

- **`7-24` ∥ `7-25` ∥ `7-26` 三行早已落地**：`test/rtm/guard.md` 的 `CLI 7` 表有这三行，`test/integration/batch-close-gate.test.mjs` 有 `CLI 7-24` ∥ `CLI 7-25` ∥ `CLI 7-26` 三条同号案例。**实施轮不要再建这三行**。
- **本批真正缺的集成行只有 `7-27` ∥ `7-28`**（写门面：区外存量放行 ∥ 纯删缝合）。编号先落 `test/rtm/guard.md` 的 `CLI 7` 表，再写用例标题，落在 `test/integration/doc-write-gate.test.mjs`。
- 设计档 §9 ∥ §10 里「缺的」那三行的旧说法，**收口前由设计席一并收正**，不在实施轮改（改设计档就要重开评审，不值得）。
- **用例该不该补，只看产品面**：这一笔有没有产生一个业务可观察的结果、现有行有没有断它。与落在哪个档、那个档多长无关。

**待落（本批之外，交付后另开一批）：`persona-engineering.md` 第 103–104 行那段纪律的改法**

用户 2026-11-12 21:09 裁定：把「评审后零写入」与「修正轮先落再请批准」合成一段，别分开写。今晚我在这一处连开三轮设计修正、三次作废 token，根因是那两句读起来互相打架——B 说「修正落到盘上再复验」，A 说「窗口期零写入」，而 B 是命令式、A 是机理解释，赢的是 B；且 A 只管 "small corrections"，给了我把它归成「不是小事」的口子。

**替换第 103–104 行，写这三段**：

> **Once the review has passed, do not edit the reviewed documents until the implementation starts.** This holds for every finding, small ones included. The design token is tied to the exact bytes that were reviewed, so any edit makes the next spawn refused. A change made in between also means the implementer builds something the reviewer never read. Write what needs fixing into the batch record, and change the document after the implementer delivers.
>
> **Approval is a separate step from the spawn.** Approval exists so nobody signs off on a document that is still being edited. So fix things before asking for approval. But "before approval" does not mean "before the spawn": when the user has already said to run the whole batch, there is no separate approval step, and the spawn follows the review directly.
>
> **The exception: a finding that changes what the thing means.** If building the approved version would build the wrong thing, stop and tell the user. That is new scope: it needs a new design and a new review. One extra round costs far less than shipping the wrong build.

**同时收窄第 287–288 行 B 条的适用面**：那句话管的是「什么时候可以请批准」，不管 spawn；补一句指向本文件 `## Advance & stop` 的零写入条。

## §2 批次任务与设计（eng-designer）
**状态行**：设计完成（修正轮 3 已落：§3 第 2 轮八条（4🟡 + 4🔵）全收，只动设计档；gate ∥ report 两跑皆 PASS；`7-23` 有号无案例已按实况改口并上抛）

<§2 模板占位：本批条目（覆盖） / 设计档落点 / 机制设计 / 受影响文件与测试覆盖 / 验收对照 / 关键决策 / 上抛项>

<§2 模板占位：机读清单 = 标题行「**受影响文件（机读清单）**」+ 围栏内三列表（表头 | 档 | 分拆方案 | 行数 |、分隔行 |---|---|---|、一行一档，只列代码档（源 ∥ 单测））；第二列：越设计时线的档写正向形方案（点名带目录段的档 + 本批落步 `实施轮` ∥ `§5`），未越线写 —；第三列：该档在批起快照上的内容行数（量法 = `countContentLines`），快照里没有这一档写 `新`；示例行 = | thincoder-core/agent-tools/batch-tier-gate.mjs | — | 新 |>

**目标态（一句话）**：写门（`.md` 落盘前那道门）不再判整份档，判**这一笔改的行**——变了的行加上被删那几行所在的缝；没变的行一条都不出。盘上还没有这份档 ⇒ 整份判。

**本批覆盖的条目**（需求档已落，本席只照它写设计）

- **F10 写门判这一笔改的行**：判域 = 本次要写的文本相对盘上现文改动的行，算法同「变更区」一段；新档整份判。设计落点 = `docs/core/design/DOC-CHECK.md` §6「写门怎么取区间」。
- **F10 尾句的理由**：改一行不等于重写整份；按整份判，量到的是与本笔无关的旧账。落点 = §6 同节 + §9 写时点一段。
- **「缝上没有字，所以只喂段长」**：`gaps` 只进 `paragraphHits`，行号锚与悬空指针只认 `rows`。已核代码即如此（`judgeText` 的 `inRegion` 只读 `rows`），本次不改代码，只写清。落点 = §6 `judgeText` 那一条。
- **「不扩区」删去写门半句**：设计面把「`report` 与写门走另一支」改成三面分开——`gate`/`batch close` 取快照区、`report` 整份、写门取两文本区。落点 = §6「两个 mode，一支判据」。
- **§9 两个时点重述**：写时点判这一笔改的行，收口时点判批起快照区；两者同归 `judgeText(text, { region })` 这一个入参，只是区间来路不同。落点 = §9「写时点判据照 §1 那三件」一段。

**机制设计（判定 + 归属）**

- **区间求法归 `thincoder-core/doc-check/index.mjs` 的 `changedRegionOf(oldText, newText)`**。理由：① 区间语义是判据自己的词汇（`rows` 落改后文本、`gaps` 是缝上的行号），认法只在 `judgeText` ∥ `paragraphHits` 里，生产者与消费者同档才不会各有一套；② 写门自述「本档只装配，不重述口径」（依据 thincoder-core/tools/doc-write-gate.mjs「本档只装配，不重述口径」）。
- **形状与 `changedRegionsOf` 逐字同形** = `{rows:number[], gaps:number[]}`：`rows` 按改后文本 1-based，`gaps` = 纯删那一处的缝（缝前那一行的行号，档头 `0`）。
- **取法不同源**：那条读 `git diff -U0`，这条读两份文本。写门没有 sha，硬套 git 腿等于要一个写那一刻不存在的基线。
- **算法** = 按行求最长公共子序列，未被对齐的旧行与未被对齐的新行成组：组里有新行 ⇒ 新行进 `rows`；组里没有新行 ⇒ 纯删，落一个 `gaps`。
- **不做前缀/后缀裁剪了事**：那样两处远处的改动会连成一片，中间没变的行被算成变更行，与「没变的行一条都不出」相反。
- **三条落盘路径**：`write` ∥ `edit` ∥ `apply_patch` 的 stage 段都走 `writeThroughPath`（依据 thincoder-core/tools/doc-write-gate.mjs「挂点唯一 = `./write-path.mjs` 的 `writeThroughPath`」），门只认「盘上现文」与「改后整份文本」两份。
- **`apply_patch` 多处改动**：同一份 `old` 对同一个 `content`，多处落成多个组 ⇒ `rows` 是并集，不必按 hunk 分别求。
- **新档**：盘上读不到 ⇒ 写门交 `region: null` 整份判。函数本身不收 `null`（两参都是字符串）——「取不到盘上现文」由写门判，不由函数猜。
- **批档 `append`**：`content` = 原文 + 追加段 ⇒ `rows` = 追加段的每一行；缝上的旧末行没被改动，不进区。

**受影响文件**

| 档 | 改什么 |
|---|---|
| `thincoder-core/doc-check/index.mjs` | 新增导出 `changedRegionOf(oldText, newText)`；`judgeText` ∥ `paragraphHits` 的区间语义不动；档头那句「判整份的只有诊断面（`doc_check` 的 `report` mode）与写时点（写门交 `null`）」随判法改口——写时点两臂都交区间表，交 `null` 的只有新档与 `report` |
| `thincoder-core/tools/doc-write-gate.mjs` | 由 `region: null` 改为 `changedRegionOf(old, content)`；新档仍交 `null`；档头关于判域的自述随判法改 |
| `thincoder-core/agent-tools/batch-gate.mjs` | 写时点臂由 `regions: null` 改为「只装自档一格的区间表」（`changedRegionOf(盘上现文, 候选文本)`）；盘上读不到该档现文 ⇒ 那一格 `null`；`evaluate` 里「写时点：交 `null` = 判整份」那句注释随判法改 |
| `test/integration/doc-write-gate.test.mjs` | 新用例 `7-27` ∥ `7-28`；`7-14` 的断言不动（它写的是变更行、照拒） |
| `test/rtm/guard.md` | 破 `7-14` ∥ `7-18` 的判据 / 判定句；加 `7-27` ∥ `7-28` 两行；档头「交互组件」句改判域；二十二态 → 二十四态 |
| `docs/core/design/DOC-CHECK.md` | 本席已落：§6 新增「写时点怎么取区间」（两臂）、§6 变更区的调用方、§6 五个新名的三问、§9 写时点一段、§9 集成 delta |
| `thincoder-core/agent-tools/batch-record-write.mjs` | 出清单的一笔（实施轮第 7 条，收正轮补记）：`append` 交给门的 `pending.body` 由「只有追加段」改为**候选全文**（盘上现文 + 这一笔 + 状态行改写），门位随之落到 `insertIntoSection` 与状态行改写之后、`writeFileSync` 之前 |

**受影响文件（机读清单）**

```
| 档 | 分拆方案 | 行数 |
|---|---|---|
| thincoder-core/doc-check/index.mjs | — | 232 |
| thincoder-core/tools/doc-write-gate.mjs | — | 64 |
| thincoder-core/agent-tools/batch-gate.mjs | — | 205 |
| thincoder-core/agent-tools/batch-record-write.mjs | — | 392 |
| test/integration/doc-write-gate.test.mjs | — | 86 |
| docs/batches/2026-11-12-writer-gate-changed-region.test.mjs | — | 新 |
```

**档位结论**：六个代码档改前快照读数最高 392，无一越过 500 线 ⇒ 无拆档方案；本批动到的函数（`changedRegionOf` ∥ `runDocWriteGate` ∥ `evaluate` 的写时点段 ∥ `appendBatchRecord`）各自远低于 300 行函数线。

**读数取法**：批起快照 `27cf33b90d84e63833df5589a516d96192da019a` 上逐档跑 `countContentLines`（导出单源 = `thincoder-core/agent-tools/batch-tier-gate.mjs`），取数 = `git show <批起 sha>:<档>` 的文本。

读数：`thincoder-core/doc-check/index.mjs` = 232 · `thincoder-core/tools/doc-write-gate.mjs` = 64 · `thincoder-core/agent-tools/batch-gate.mjs` = 205 · `thincoder-core/agent-tools/batch-record-write.mjs` = 392 · `test/integration/doc-write-gate.test.mjs` = 86。

另核一档：`test/integration/batch-close-gate.test.mjs` = 611，本批不动它的代码——`7-18` 的判定句改在 `test/rtm/guard.md`，断言本身不变。

**验收对照（每条都给红侧）**

- **区外存量不拦**：设计档区外带存量三样，本笔只改一行无关文字 ⇒ 落盘、零命中。红侧 = 把 `region` 传 `null` 复跑 ⇒ 三样各一条命中、拒写。
- **区内照判、段按段扩**：改到 350 字段段内某一行 ⇒ 拒写并点名该段。红侧 = 只把被改那一行进 `rows`、不按段扩 ⇒ 放行（漏判）。
- **纯删的缝合**：删掉两段之间一行使两段并成超 300 字的一段 ⇒ 拒写。红侧 = 丢掉 `gaps` 只交 `rows` ⇒ 放行。
- **新档整份判**：写一笔带 350 字段的新档 ⇒ 拒写。红侧 = `old === null` 时交空 `rows` ⇒ 放行。
- **多处改动取并集**：`apply_patch` 改两处、一处悬空 ⇒ 拒写且只点名悬空那一处；只改干净那一处 ⇒ 落盘。红侧 = 只取第一处改动的近似算法 ⇒ 第二处不被点名。
- **批档 `append`**：往带存量 350 字段的 §2 追加干净文本 ⇒ 落盘；追加段自身超 300 字 ⇒ 拒写。红侧 = `region: null` ⇒ 前半也照拒。
- **判读人** = 本批单测档 `docs/batches/2026-11-12-writer-gate-changed-region.test.mjs`，命令 `node --test` 该档；收口时随批删除。

**本席这一轮被现行门拦过两次（现存缺陷的实例，非推演）**：写 `docs/core/design/DOC-CHECK.md` 时按整份判，先报「第 198 段 336 字」，改短后再报「第 536 段 305 字」——两次都在新写的那一节里，正是「整份判」把体量与落点混在一起。改判变更区后，同一笔只判新写的那几行。

**关键决策**

- **区间求法放 `doc-check/index.mjs`，不放 `doc-write-gate.mjs`**。拒掉的另一支 = 写门里算（读数只有它手上有两份文本，看着更顺手）。不取的理由：区间语义由判据定义，放写门等于让装配档持有第二处口径；且 `changedRegionsOf` 那条 git 链与它同形不同源，形状的单源必须与消费面同档。
- **读不到盘上现文按「新档」整份判，不按「判不出来就不判」**。拒掉的另一支 = 与 §6「判不出变更区 ⇒ 零输出」同处置。不取的理由：那等于这一笔完全没判，而写门的契约是「命中即 throw、零字节」；放行一笔没人判过的写比按整份拦一次更贵。
- **不引入 git、不引入基线 sha**。写门那一刻手上只有两份文本；引 git 会把「盘上现文」换成索引里的版本，而写门判的正是盘上那份还没被改的档。

**边界（本批不做）**

- 不改 `judgeText` ∥ `paragraphHits` 的区间语义——它们已按需实现，本批只核不改。
- 不动 `report` mode 判整份，也不动收口面的取区链（`changedRegionsOf` ∥ `stageDocs`）。

**§9 集成 delta ≠ 零行**：破三行（`7-22` 断两 mode 分家不变；`7-14` 判据格里的「写门判改后整份」；`7-18` 判定句「改后整份入判」），缺两行（`7-27` 区外放行 ∥ 区内照拒、`7-28` 纯删的缝合）。两行新用例服务 F10（AC-13 ∥ AC-14），落在 `test/integration/doc-write-gate.test.mjs`；判据 = `docs/core/design/DOC-CHECK.md` §9「集成测试设计」。

**批档段写那一臂的集成 delta**：缺一行（写时点往带存量三样的批档 §2 追加 ⇒ 放行；追加段自身超 300 字 ⇒ 拒）。破的待实施席对着 `test/rtm/guard.md` 的 `CLI 7` 表逐行核——本席这一轮没有逐行读完那张表，`unverified`。

**上抛项**

1. **[已裁] F10 的 AC**：主 agent 2026-11-12 已落 AC-13（区外存量放行 ∥ 区内照判）与 AC-14（纯删的缝合）。设计 §6 的验收已按两条对齐，AC-14 点名挂在 `changedRegionOf` 的 `gaps` 返回值上。
2. **[已裁·本席错了] 批档段写经不经写门**：结论反了——它确实经过，只是不经 `writeThroughPath`，而是 `thincoder-core/agent-tools/batch-gate.mjs` 直接 import `judgeText`。设计已补这一臂（§6「写时点怎么取区间」），机读清单已加该档读数 205。错误成因 = 只 grep 了 `writeThroughPath` ∥ `runDocWriteGate` 两个名字，没查「谁直接 import `judgeText`」。
3. **[上抛·知会] `thincoder-core/tool-docs/doc_check.md` 本批不改**：该描述写的是 `doc_check` 工具面（两个 mode ∥ 批档时点 ∥ 排除面），不描述写门判域。已 grep 该目录，`写门` ∥ `整份` 零命中。

**修正轮（2026-11-12 · 主 agent 三条裁定后）**

**裁定一 · 上抛 ② 本席错了**：批档段写确实经过判，臂在 `thincoder-core/agent-tools/batch-gate.mjs`——它直接 import `judgeText`（依据 thincoder-core/agent-tools/batch-gate.mjs「import { displayPath, hitLine, judgeText, judgedDomainDocs, MOMENT } from "../doc-check/index.mjs"」）。写时点它交 `regions: null`，所以整份判。

**设计补的三条**（落点 = `docs/core/design/DOC-CHECK.md` §6「写时点怎么取区间」）：

- **区间同源**：`append` 的候选全文 ∥ `edit` 的改写后整档视图都是整档文本，一份 `changedRegionOf(盘上现文, 候选文本)` 直接求区，与写门同一句。
- **写时点交的表只装这一笔在写的那一档**：其余进笔域集的档不在表里 ⇒ 不判、不数（依据 thincoder-core/agent-tools/batch-gate.mjs「if (regions !== null && region === undefined) continue」）。
- **盘上读不到该档现文 ⇒ 那一格 `null` = 整份判**；本笔没有候选文本 ⇒ 不进表 ⇒ 零输出。

**改名与扫尾**：该节由「写门怎么取区间」改名为「写时点怎么取区间」（现在两个臂，旧名只盖住一个）；§6「两个 mode，一支判据」与 §9 写时点那一段的交叉引用同轮改口；`changedRegionOf` 补进 §6「五个新名的三问」（原表漏了它，是上一轮的真缺件）。

**裁定二 · 上抛 ① 已落**：AC-13 ∥ AC-14 进需求档；设计 §6 验收按两条对齐，AC-14 点名挂在 `changedRegionOf` 的 `gaps` 返回值上。

**裁定三 · 上抛 ③ 留着**：设计档那两段（336 字 ∥ 305 字）是用户报告的缺陷现场，作为红侧证据留。本轮动笔前复跑整份诊断面，设计档当前零命中。

**本席这一轮又被整份判拦了一次（同一缺陷的第二个现场）**：改本节机读清单那一笔被 `[doc-check gate] REFUSED` 挡下，点名「第 85 段 333 字」——那是我新写的读数行，与我要改的那张表无关。把那一行拆成两段后同一笔放行。

**读数（批起快照，量法 = `countContentLines`）**：`thincoder-core/agent-tools/batch-gate.mjs` = 205，未越 500 线 ⇒ 无拆档方案。

**修正轮 2（2026-11-12 · §3 评审七条，七条全收，一条不驳）**

范围 = 只动 `docs/core/design/DOC-CHECK.md`；需求档 ∥ 代码 ∥ 旧批档一字未碰。逐条 → 改了哪一句：

| # | 处置 | 落点与改法（逐条） |
|---|---|---|
| ① 🟡 `op` 条件 | 已改 | §6「写径不分叉」：删去歧义半句「`op === "write"` 才调门」，改成正面断言——三件到门时 `op` 都等于 `"write"`；并列出各写点实参：`write` ∥ `insert_after` ∥ `hashline_edit`（`file.mjs` 三处）· `edit`（`edit-diff.mjs`）· `edits` 批形（`edit-batch.mjs`）· `apply_patch` 第一段（`patch.mjs`，`{ op: "write", stage: true }`）；`{ op: "commit" }` 与 `delete` ∥ `rmdir` ∥ `copy` ∥ `move` ∥ `rename` 不调门。依据 = 实读 `thincoder-core/tools/write-path.mjs` |
| ② 🟡 delta 漏一条行为变化 | 已认领：没有现役行断它 | §6「批档段写那一臂 · 缺陷现场」红侧改写为「仍交 `null` ⇒ 判整份」并指向 §9；§9 新增一段「写时点那一臂的另一条行为变化，没有现役行断着它」——写时点笔域集里别的档不再判、也不计入 `范围 N 档` |
| ③ 🟡 读不到现文无场景 | 已改 | §6 那一支补两条真造得出来的入口（目标是目录 ⇒ `EISDIR`；权限拒绝 ⇒ `EACCES`），并写清代价：这是 F10「区外不出行」唯一被整份判顶掉的状态 |
| ④ 🔵 AC-14 夹具与需求措辞不一 | 已按需求对齐 | §6 AC-14 条与 §9 `7-28` 行改成「删空行、接到超 300 ⇒ 拒；同一笔里同时把其中一段删短到不超 ⇒ 零输出」；原「两段都还短 ⇒ 落盘」降为附加例；`7-28` 的服务需求格补 `AC-14` |
| ⑤ 🔵 态数三处对不上 | 已改 | 三处绝对数（十九态 ∥ 二十一行 ∥ 二十四态）全部删掉；算术只留一处（§9「冗余的 = 无」那句），写成员不写总数 |
| ⑥ 🔵 证据档区间自相矛盾 | 已改 | §9 末句按行点档，三档互不重叠：`batch-close-gate.test.mjs`（`7-1`–`7-9` · `7-11` · `7-13` · `7-19`–`7-26`）∥ `batch-edit-spec-section.test.mjs`（`7-10`）∥ `doc-write-gate.test.mjs`（`7-14` · `7-18` · `7-27` · `7-28`） |
| ⑦ 🔵 算法无尺寸上界 | 已改 | §6「算法」条补「代价上界与实现约束」：行数之积是时间上界；实现不得建行×行全表（先剥公共前后缀、中段按行对齐、空间线性于较短那一份）；被拒的是「只剥前后缀、把中段整片当变更」，不是剥前后缀本身 |

**同轮扫尾**：§6 那句「`.md` 落盘的**八处**写点」与同句列出的写点个数对不上，改成「内容写点」不报数（同一处、同一笔）。

**读数（本轮现量；命令与回执如下，设计档只写关系不抄数）**

- 文档面最大的一份（量法 = 逐档 `readFileSync` 后按 `split("\n")` 计内容行，末行换行不计）：`docs/core/design/PROMPT-SYSTEM.md` = 10747 行；行数自乘 = 115498009 格 —— §6「代价上界」指的就是这两个数。
- 读一份目录当文件：`readFileSync("docs","utf8")` ⇒ `EISDIR: illegal operation on a directory, read` —— §6 ③ 那一支的活入口。
- `test/rtm/guard.md` 的 `CLI 7` 表现役 22 态（量法 = 抓行首 `| 7-`：`7-1`–`7-11` · `7-13` · `7-14` · `7-18`–`7-26`）；本批加 `7-27` ∥ `7-28` ⇒ 收口时 24 态。
- 交付门：`doc_check(mode:"gate")` 判 `docs/core/design/DOC-CHECK.md` ⇒ `DOC-CHECK GATE: PASS`。

**机读清单不变**：本轮未增删代码档，五档与第三列读数同前（`index.mjs` 232 · `doc-write-gate.mjs` 64 · `batch-gate.mjs` 205 · `doc-write-gate.test.mjs` 86 · 本批单测档 `新`）。

**修正轮 3（2026-11-12 · §3 第 2 轮八条，八条全收）**

范围 = 只动 `docs/core/design/DOC-CHECK.md`；需求档 ∥ 代码 ∥ 旧批档一字未碰。① 由主 agent 自改需求档（已读，F10 现已写明「盘上现文读不出来（目录 ∥ 权限拒绝）⇒ 整份判」），本席未动那一档。

| # | 处置 | 落点与改法（逐条） |
|---|---|---|
| ② 🟡 AC-14 措辞 | 已改 | §6 验收「AC-14 · 纯删的缝合」与收口面验收清单第 4 条：都改成「删的是两段之间的**空行**，两段因此接成一段」；同条附加例的「删掉的那一行」也改成「那个空行」（扫尾时找到的同一缺陷） |
| ③ 🟡 写时点笔域集行为变化 | 择 ②：明写不需要行的理由 | §9 那一句之后新增两段「这一条不单独占一行」＋理由：它不是新的产品结果，而是 F10 同一句落在写时点这一臂上的形状——别的档这一笔零变更行 ⇒ 零输出；`7-27` 断的正是这一句，差别只在存量落在另一份档里还是同一份档的另一行。跨档这一形也没有新场景可断——写者在别的档上落笔时，那一笔在它的写时点已被同一套判据判过 |
| ④ 🟡 §9 与 §8 清单状态 | 已改 | §9「库内 = 已查」改成两件事分开说：表上**登记**到 `7-26`、`7-19`–`7-23` 五个号都有；盘上**有案例**的是 `7-19`–`7-22`。§8 的 delta 同步改口——「缺的 = 两行」改成「缺的 = 无」，`7-19` ∥ `7-20` 早在 `test/integration/batch-close-gate.test.mjs` 里，表头「新行」改「行」（那两行不是待补编号） |
| ⑤ 🔵 LCS 只说约束 | 已改 | §6「算法」条补唯一落法：回溯用**两遍长度重算**（Hirschberg——正反各算一遍长度表，再按中分点分段回溯），「空间线性」由此有实现路径；读数仍住本段 |
| ⑥ 🔵 枚举跳号 | 已改 | §9 那句拆成独立段并补半句「`7-12` 与 `7-15`–`7-17` **表上无此号**（`test/rtm/guard.md` 的 `CLI 7` 表里没有这几行，不是漏列）」，两张表由此闭合 |
| ⑦ 🔵 「那笔写本来也落不了盘」 | 已改 | §6 那一支的代价句收窄成实现事实：不再说「那笔写本来也落不了盘」（可写不可读的目标上不成立），改成「`catch` 把两种情形落成同一个 `null`，这一支只剩『整份判』与『不判』两条路，而不判就是放行一笔没人判过的写」 |
| ⑧ 🔵 `op` 条件没有验收守 | 已补一条 | §6 验收清单新增「三条写点都过门（`op` 那一支）」：`write` ∥ `insert_after` ∥ `hashline_edit` 各落一笔带 350 字段的写 ⇒ 三支都拒；红侧 = 把任一支的 `op: "write"` 改成 `"edit"` ⇒ 同一笔落盘、零命中 |

**③ 择 ② 的代价说法**：另一条路（补一行）要落在 `test/integration/batch-close-gate.test.mjs`——该档改前已越 500 线，同批就得连带一份拆档方案，那是本批没批的工作面。要那一行的话另起一批更省。

**④ 的实读**：`test/integration/batch-close-gate.test.mjs` 盘上案例（量法 = 抓标题行首 `test('CLI 7-`）= `7-1`–`7-9` · `7-11` · `7-13` · `7-19`–`7-22` · `7-24`–`7-26`；`7-23` 只有表行与档头注释，没有案例。

**同轮扫尾**（改了 ②–⑧ 之后回头扫同类）：§6 AC-14 附加例的「删掉的那一行」· §8 的「缺的 = 两行」与表头「新行」· §9「常驻的恢复」里的 `7-23` · §9 末段「证据档逐行对」的 `7-19`–`7-26`（改成 `7-19`–`7-22` · `7-24`–`7-26` 并注明 `7-23` 有号无案例）——四处一并改在同一笔。

**读数（本轮实跑，命令与回执如下）**

- 交付门：`doc_check(mode:"gate")` 判 `docs/core/design/DOC-CHECK.md` ⇒ `DOC-CHECK GATE: PASS`；整份诊断面 `mode:"report"` 同档 ⇒ `DOC-CHECK GATE: PASS`（两条都是本轮跑出来的）。
- 本轮被整份判拦下两次，两次点名的都是我这一笔自己要写的那一段：先报「第 540 段 329 字」，拆一段后再报「第 542 段 329 字」；把 §9「态数只在这一句算一次」拆成独立段后同一笔放行。这是「整份判」把一处体量与另一处落点混在一起的第三、第四个现场（前两个 = 修正轮 2 记的那两次）。

**机读清单不变**：本轮未增删代码档（③ 择了不补行），五档与第三列读数同前（`index.mjs` 232 · `doc-write-gate.mjs` 64 · `batch-gate.mjs` 205 · `doc-write-gate.test.mjs` 86 · 本批单测档 `新`）。

**上抛项**

1. **[上抛·知会] `7-23` 有号无案例**：`test/rtm/guard.md` 的 `CLI 7` 表上有 `7-23`（带病批档 ⇒ `PASS · 范围 0 档`），`test/integration/batch-close-gate.test.mjs` 里没有同号案例；全仓 `grep 7-23` 只命中的是表行与那份测试档的档头注释。可复现路径 = 抓该档标题行首 `test('CLI 7-` ⇒ 得 `7-1`–`7-9` · `7-11` · `7-13` · `7-19`–`7-22` · `7-24`–`7-26`。设计档已按实况改口（不再说它「现役」），要不要落那一行归主 agent ∥ 另一批。
2. **[上抛·知会] ③ 的另一条路**：若要在写时点补一行「笔域集里别的档带存量悬空 ⇒ 落盘、`范围 N 档` 只数本笔那一份」，它落在 `test/integration/batch-close-gate.test.mjs`；该档改前越 500 线 ⇒ 同批需要拆档方案。本席择了「明写不需要行的理由」，理由已入 §9。

**收正轮（2026-11-12 · 交付后：父侧三条 + 评审第 3 轮三条小收正）**

范围 = 只动三份设计档（`docs/core/design/DOC-CHECK.md` ∥ `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` ∥ `docs/core/design/TOOLS.md`）＋本节机读清单；代码 ∥ 需求档 ∥ 别的批档一字未碰。

**一、机读清单补一行**

`thincoder-core/agent-tools/batch-record-write.mjs` = 392（取数 = `git show 27cf33b…:thincoder-core/agent-tools/batch-record-write.mjs` 的文本过 `countContentLines`；同笔核到盘上现文 394）。人读表同笔补一行写清这一笔做什么；档位结论由「五个代码档 ∥ 最高 232」改「六个 ∥ 最高 392」，本批动到的函数补 `appendBatchRecord`（函数级档位未另量：本节只报档级读数，函数口径 = 「远低于 300 行」这句本身）。

**二、三处被实施顶掉的设计描述（逐条 → 改了哪一句）**

| # | 落点 | 改法 |
|---|---|---|
| 1 | `docs/core/design/DOC-CHECK.md` §9「那个实参的消费方」段 | 原句「写门拿交回的清单当判域时，里面必须仍是目标档自己。判域与目标档对不上 ⇒ 接线错了，当场抛带门名的错」改成两段：回执三种——判域里仍是目标档自己 ⇒ 照判；判域为空、而目标档落在声明排除面上 ⇒ 不判零命中；判域非空却不含目标档 ⇒ 抛。依据 = 需求 F9 ∥ 本档 §10「排除面上的档，写的那一刻也不判」 |
| 2 | `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md`「留痕行 → 状态行」段 | 原条「**留痕行不经文档机检门**：门位在 `insertIntoSection` 之前（判集只含评审正文 `pending.body`），留痕行插在其后 ⇒ 不进门判集」整条换成两条：门位 = `insertIntoSection` 与状态行改写之后、`writeFileSync` 之前，判集 = 候选全文；留痕行落进判集仍零命中（块引用行、不带档名与行号锚、不并进正文段）。依据 = `thincoder-core/agent-tools/batch-record-write.mjs`「runBatchGate({ abs, cwd, agent, scope: \"writer\", pending: { section: n, body: written } })」位于 `insertIntoSection` 与 `updateSectionStatusLine` 之后 |
| 3 | `docs/core/design/TOOLS.md` §6.15.2 裁定点④末条 | 见下「三·3」——按实读改的是**消歧**，不是把位置改成文档机检门的位置 |

**三、两条知会 + 一处前提纠正**

1. **收**：`docs/core/design/DOC-CHECK.md` §6 新增一条「两臂的区间读数不要求逐字相等」——收口链解 `git diff -U0`、写时链按行对齐回溯，重复行上允许落在不同的**合法**对齐；差别停在「哪几行算进区」，两臂各判自己的区间、不互相核行号。只写到「合法对齐可以不同」，没有替实现承诺「只会过报」：那个方向属实现的读数，本席未逐行核 `lcsPairs` 的回溯分支。
2. **收**：`docs/core/design/DOC-CHECK.md` §6 验收「三条写点都过门」的红侧句改了——原「把某一支的 `op: \"write\"` 临时改成 `\"edit\"` ⇒ 同一笔落盘、零命中」改成「拿掉门那一跳（`if (op === \"write\") await runDocWriteGate(…)` 整句）⇒ 同一笔落盘、零命中」。理由 = 实读 `thincoder-core/tools/write-path.mjs`「throw new Error(`writeThroughPath: unknown op \"${op}\"`)」——`defaultPath` 没有 `edit` 支，照原句做红侧先撞这条语言错。
3. **前提不成立，改的是消歧**：转达说「TOOLS.md 那句现在落在 `insertIntoSection` 之后」。实读 `thincoder-core/agent-tools/batch-record-write.mjs` 的 `appendBatchRecord`：F11-C 占位机检（`findPlaceholderResidue` 那一跳）仍在 `insertIntoSection` **之前**，位置未动；挪位置的是**文档机检门**（另一道）。故原句改成点明「这一道门（占位残留机检）」并补一句「append 上另有一道文档机检门在其后、两道挂点不按一个位置核另一个」——照原话把位置改过去会让这一条变成假的。

**四、评审第 3 轮三条小收正（同轮落完）**

1. **`缺的` 改成已落地**：§9 原「缺的 = 四行（`7-24` ∥ `7-25` ∥ `7-27` ∥ `7-28`）」改「缺的 = 无」，四行各自点名落在哪份证据档；§10 原「缺的 = 一行（`7-26`）」改「缺的 = 无」；两处表头「新行」改「行」；§10「现役用例」与末句的「本节补 `7-26`」改成「表上有号、盘上有同号案例」。实读依据 = `test/rtm/guard.md` 的 `CLI 7` 表有 `7-24`–`7-28` 五行；`test/integration/batch-close-gate.test.mjs` 有 `test('CLI 7-24 …` ∥ `7-25 …` ∥ `7-26 …` 三条，`test/integration/doc-write-gate.test.mjs` 有 `7-27` ∥ `7-28` 两条。
2. **§6 判读人按号点名**：原「见 §9『缺的』表的最后两行」改「`7-24` ∥ `7-25`（§9 集成 delta 表按号列）」——位置引用随表增行即漂。
3. **删掉被撤的引文**：§6「读不到盘上现文」那一条的代价句里，「它不靠『那笔写本来就落不了盘』撑着——可写不可读的目标上那句话不成立」整句删去，只留实现事实那一半。

**五、同轮扫尾**：`docs/core/design/DOC-CHECK.md` §9「`test/rtm/guard.md` 档头那一句随本批改：它现在写着…——改成…」是计划形写进状态档，改成现状句（该句现为「交盘上现文与改后文本两份求出的区间，区外存量不出行」）。

**六、读数（本轮实跑）**：`thincoder-core/agent-tools/batch-record-write.mjs` 行数 = 批起快照 392 ∥ 盘上现文 394（量法 = `countContentLines`）；交付门回执见报告行。

**上抛项**

1. **[上抛·知会] 代码注释仍写旧门位**：`thincoder-core/agent-tools/batch-record-write.mjs` 的 `appendBatchRecord` 里「// 留痕行不经文档机检门——门位在上面（判集 = 本次评审正文 `pending.body`）。」与新门位相反（门在下面、判集 = 候选全文）；同档档头那段 docstring 已按新口径写。代码不是本席笔域，未动，交父侧路由。

## §3 设计评审（评审子代理）
**状态行**：评审通过



### 轮次 1（评审子代理）

设计评审 · 对象 = 需求 F10 ∥ AC-13 ∥ AC-14 ∥「缝只喂段长」· 设计 §6「写时点怎么取区间」（writeThroughPath 臂 ∥ batch-gate 臂）· §9 两时点重述 · 集成 delta

| # | 严重度 | 状态 | 证据（指针） |
|---|---|---|---|
| 1 | 🟡 | 未解决 | §6「写时点怎么取区间」：「`op === "write"` 才调门」 vs 需求 F10「`write` ∥ `edit` ∥ `apply_patch`」——三支各自的 op 值未写 |
| 2 | 🟡 | 未解决 | §6 验收「批档段写那一臂 · 缺陷现场」红侧「四份别的档的悬空各一条、拒写」= 写时点笔域集行为改变，§9 delta「破的 = 三行」未认领该结果 |
| 3 | 🟡 | 未解决 | §6「读不到盘上现文的其他情形…取「整份判」这一侧」——无观测 ∥ 无复现路径（F2-7） |
| 4 | 🔵 | 未解决 | 需求 AC-14「同时把其中一段也删短到不超 ⇒ 零输出」 vs §6 验收「同一笔里删掉的行使两段都还短 ⇒ 落盘」 |
| 5 | 🔵 | 未解决 | §9「现役二十一行」 vs「十九态现役用例」 vs「二十四态」（19+4+1=24，21 不合） |
| 6 | 🔵 | 未解决 | §9「`7-1`–`7-26`（batch-close-gate）」与「`7-14`（doc-write-gate）」交叉；二十四态而编号到 `7-28` |
| 7 | 🔵 | 未解决 | §6「算法：按行对齐求最长公共子序列」——未写尺寸假设 ∥ 上界 |

已核通过：单源不复制（§9 指向 §6）、同类先例 + 对齐 ∥ 偏离、库内 ∥ 库外已查、五个新名三问、`gaps` 只喂段长、§8 档位结论句（改前无一过 500 · 函数档无一过 300）、判读人 = `node --test <该档>`。

VERDICT: pass

计数：🔴 0 · 🟡 3 · 🔵 4

### 轮次 2（评审子代理）

#### 第 2 轮：只验第 1 轮 3🟡 + 4🔵 的处置

七项逐项处置结果（① op 条件 · ② 笔域集行为变化入 delta · ③ 读不到现文两入口 · ④ AC-14 夹具对齐 · ⑤ 态数只算一次 · ⑥ 证据档按行点档 · ⑦ LCS 代价上界）：①③⑤⑥⑦ 已落地；②④ 部分落地（残留见下表 2 ∥ 3）。

| # | 严重度 | 处置 | 证据（指向，不复制原句） |
|---|---|---|---|
| 1 | 🟡 | 待改 | 需求档 F10 的判定句仍只有「盘上还没有这份档 ⇒ 整份都是这一笔写的 ⇒ 整份判」；设计档 §6 却把「读不到盘上现文的其他情形」也取整份判，并自认这是「F10「区外不出行」唯一会被整份判顶掉的状态」——两层对同一状态各说一半 |
| 2 | 🟡 | 待改 | 设计档 §6「AC-14 · 纯删的缝合挂在 `gaps` 上」与 §6 验收清单都写「删掉两段之间的一行」；需求档 AC-14 与 `7-28` 写的是「空行」——段落由空行分界，删掉一行非空行不会并段，夹具按 §6 那一句造会造不出断言场景 |
| 3 | 🟡 | 待改 | 设计档 §9「写时点那一臂的另一条行为变化，没有现役行断着它」把行为变化（改前拒写 ⇒ 改后不判、不计 `范围 N 档`）写清了，但没判它要不要一行：既未在 `CLI 7` 表补行，也未写「产品不需要这个场景」的理由 |
| 4 | 🟡 | 待改 | 设计档 §9「库内 = 已查」写「现役用例含 `7-19`–`7-23`」，§8 的 delta 写「缺的 = 两行」且「编号已在 `test/rtm/guard.md` 的 `CLI 7` 表里…用例标题按号写」——同一份清单两处状态不一致，实施方可能据此跳过两行用例 |
| 5 | 🔵 | 待改 | 设计档 §6「算法」只给「回溯所需的空间线性于较短的那一份」这一约束，未点出满足它的回溯法（Hirschberg ∥ 两遍长度重算），且「常规二维数组装不下」的依据读数在批档 §2，本档内不可核 |
| 6 | 🔵 | 待改 | 设计档 §9「态数只在这一句算一次」的枚举跳过 `7-12` ∥ `7-15`–`7-17`，全文无一句说明这几个号是不存在还是已废——证据档表同样不列，读的人分不清「没有」与「漏了」 |
| 7 | 🔵 | 待改 | 设计档 §6「读不到盘上现文的其他情形」的代价句「那笔写本来也落不了盘」对「可写不可读」的目标不成立；结论（取整份判）本身已有 `catch` 落成同一个 `null` 的理由，不靠这一句 |
| 8 | 🔵 | 待改 | 设计档 §6「写径不分叉」断言三件到门 `op` 都等于 `"write"`，但验收面只被 `7-27`（真 `edit`）与「多处改动取并集」（`apply_patch`）间接覆盖，没有一条断言 `write` 这一支也过门、也没有一条断言非 `"write"` 的 `op` 被挡在门外 |

计数：3🟡 + 4🔵 = 7 条（无 🔴）。

VERDICT: pass

### 轮次 3（评审子代理）

#### 第 3 轮：只验第 2 轮 4🟡 + 4🔵 的处置

- ① 已落：需求 F10「盘上现文读不出来（目标是一份目录、权限拒绝）⇒ 没有可比的旧文本 ⇒ 整份判」与设计 §6 同支两条入口（`EISDIR` ∥ `EACCES`），两层不再各说一半。
- ② 已落：「空行」在 §6 验收 ∥ 收口面验收第 4 条 ∥ `7-28` 三处一致，附加例降为「删掉的那个空行使接起来的两段都还短 ⇒ 零输出」。
- ③ 已落：§9「这一条不单独占一行」＋理由（F10 同一句在写时点臂上的形状 · `7-27` 已断这一句 · 跨档无新场景）。
- ④ 部分落：§8「缺的 = 无」已改；§9 库内按 `7-19`–`7-23` 五个号说清登记与有案例，与盘上一致；残留见下表 1。
- ⑤ 已落：Hirschberg 点名（两遍长度重算 ∥ 中分点分段回溯），「空间线性」有了唯一落法。
- ⑥ 已落：`7-12` ∥ `7-15`–`7-17`「表上无此号」与 `test/rtm/guard.md` 的 `CLI 7` 表实况相符。
- ⑦ 已落（代价句收窄成实现事实），残留见下表 3。
- ⑧ 已落：「三条写点都过门」带红侧——任一支 `op` 改成 `"edit"` ⇒ 同一笔落盘、零命中。

| # | 严重度 | 状态 | 证据（指针） |
|---|---|---|---|
| 1 | 🟡 | 未解决 | §9「缺的 = 四行（`7-24` ∥ `7-25` ∥ `7-27` ∥ `7-28`）」与 §10「缺的 = 一行（`7-26`）」把已落地的三行报成缺的：`test/rtm/guard.md` 的 `CLI 7` 表有 `\| 7-24 \|` ∥ `\| 7-25 \|` ∥ `\| 7-26 \|`，`test/integration/batch-close-gate.test.mjs` 有 `test('CLI 7-24 …` ∥ `7-25 …` ∥ `7-26 …`；§10 库内「本节补 `7-26`」同病 |
| 2 | 🟡 | 未解决 | §6 判读人段「AC-10 ∥ AC-11 那两半另有常驻集成行，见 §9「缺的」表的最后两行」——最后两行是 `7-27`（服务需求 F10）∥ `7-28`（F10 ∥ AC-14），服务 AC-10 ∥ AC-11 的是前两行 `7-24` ∥ `7-25`；按位置引用，表增两行即漂 |
| 3 | 🔵 | 未解决 | §6 代价句把已撤的理由留在规范面原文：「它不靠「那笔写本来就落不了盘」撑着」——失效表达式按 doc-hygiene 宜删，不留引用句 |

VERDICT: pass

计数：🔴 0 · 🟡 2 · 🔵 1

## §4 用户批准（主 agent）

**用户批准**：2026-11-12 20:36「自动跑完」——批级授权覆盖本批全链（设计 ∥ 评审点火 ∥ 修正轮 ∥ 实施 ∥ 收口）。

**评审链**：第 1 轮 `pass`（3🟡 4🔵）→ 修正 → 第 2 轮 `pass`（4🟡 4🔵）→ 修正 → 第 3 轮 `pass`（2🟡 1🔵）→ 派 coder 实施 → 交付后收正轮（设计席）。

**用户在这一批中途纠正过一次流程**：我在评审通过与派单之间连开三轮设计修正，每次作废 token 又重开评审。用户指出「提示词没写评审过了再改就要作废」之后，改按「评审一过立刻派单，小收正留到交付之后」执行——本批的收正轮（设计席 `#14`）就是在交付之后落的。

## §5 实施记录（eng-coder）
**状态行**：实施完成（写门判域改「这一笔改的行」：changedRegionOf + 两个写时点臂接线；guard.md 加 7-27 ∥ 7-28；集成 2 例 + 单测 9 例；91 例全绿，红侧逐条实测；1 🔴（排除面被当接线错）已修；3 条设计档漂移上抛）



**逐条 → 改了什么 + 读数**

| # | 任务书条目 | 落点与改法 | 判定 |
|---|---|---|---|
| 1 | 新增 `changedRegionOf(oldText, newText)` | `thincoder-core/doc-check/index.mjs`：新导出 + 两个私有助手 `lcsRowOf`（一维滚动长度表）· `lcsPairs`（Hirschberg：正反两遍长度重算 + 中分点回溯）；剥公共前后缀只减量、中段仍按行对齐求组；组里有新行 ⇒ 新行进 `rows`（改后文本 1-based），无新行 ⇒ 落 `gaps`（缝前那一行，档头 0）；两参非字符串 ⇒ 当场抛（不收 `null`） | ✅ |
| 2 | 写门改判「这一笔改的行」 | `thincoder-core/tools/doc-write-gate.mjs`：`region: null` → `old === null ? null : changedRegionOf(old, content)`；档头三句与判域注释随判法改口（新档 / `EISDIR` / `EACCES` ⇒ 整份判） | ✅ |
| 3 | 批档写时点臂 | `thincoder-core/agent-tools/batch-gate.mjs`：写时点交「只装这一笔在写的那一档」的表（盘上现文 vs 候选全文）；该档现文读不到 ⇒ 那一格 `null`；本笔无候选文本 ⇒ 空表 ⇒ 零输出；其余档走既有 `region === undefined ⇒ continue`（不判、不计入 `范围 N 档`） | ✅ |
| 4 | guard.md 两行 + 三处改口 | `test/rtm/guard.md`：新增 `7-27` ∥ `7-28` 两行（四格齐、回指 F10 ∥ AC-13 ∥ AC-14）；`7-14` 判据格「写门判改后整份」→「写门判这一笔改的行」；`7-18` 判定句「改后整份入判」→「判面 = 那一行」；档头交互组件句「改后整份内容…不分改动区」→「交盘上现文与改后文本两份求出的区间，区外存量不出行」；二十二态 → 二十四态（枚举同笔补两态） | ✅ |
| 5 | 集成两例 | `test/integration/doc-write-gate.test.mjs`：`CLI 7-27`（区外存量三样一条不出、照落盘 ∥ 改到那段 350 字段内一行 ⇒ 拒写、点名该段）· `CLI 7-28`（删两段之间的空行接成 320 字 ⇒ 拒写 ∥ 同一笔里同时把其中一段删短 ⇒ 零输出）；`CLI 7-18` 标题里已作废的「判定区取到整份文本」改口 | ✅ |
| 6 | 判读人（单测档） | `docs/batches/2026-11-12-writer-gate-changed-region.test.mjs`（新建，收口随批删）9 条：`changedRegionOf` 本体 · 千行量级两处远距改动/远距纯删 · AC-13 三半（区外放行 ∥ 段按段扩 ∥ 行号锚写进被改那一行）· AC-14 缝合（含丢 `gaps` 红侧）· 新档整份判（含空 `rows` 红侧）· `apply_patch` 并集 · 三条写点都过门 + `op` 缺省 · 排除面写时不判 · 批档段写那一臂（别的档不判不数 ∥ 追加段自身照判） | ✅ |
| 7 | **出清单的一笔**：`thincoder-core/agent-tools/batch-record-write.mjs` | append 的 `pending.body` 由「只有追加段」改为**候选全文** `written`，门位随之落到 `insertIntoSection` / 状态行改写之后、`writeFileSync` 之前。理由：设计 §6 逐字「`append` 交候选全文」，而原代码只交半段——半段与盘上现文不同形，`changedRegionOf(盘上现文, 半段)` 求出来的不是这一笔的行。代价照实认在「落地核对」第 2 ∥ 3 条 | ✅（已披露） |

**决定披露（每一笔本席自己拍的，附理由）**

| 决定 | 理由 |
|---|---|
| 区间求法住 `doc-check/index.mjs` | 设计 §6 逐字指定；本席不另选 |
| `changedRegionOf` 对非字符串入参当场抛（含 `null`） | 设计 §6 逐字「函数本身不收 `null`——两参都是字符串」；`String(x ?? "")` 会把「整份判」这条决定替调用方做了 |
| 改 `batch-record-write.mjs`（**不在任务书文件清单**） | 见上第 7 条：不改则设计 §6 的机制句落不了地，求出来的区间与「这一笔改的行」不是一回事 |
| 排除面上的档 ⇒ 判域为空 ⇒ `{judged:false, hits:0}`（原来抛「判域异常」） | 评审 🔴 修。F9「其下的档不进判域——三件一样都不出」+ 设计 §10「写门与批档 `append` ∥ `edit` 走的是同一个谓词，所以排除面上的档，写的那一刻也不判」+ `tool-docs/doc_check.md`「an excluded document is out of the domain whether it is being written or read」。throw 只留给「判域非空却不含目标档」那一支 |
| 两处「区内纯删 + ENOENT ⇒ 零输出」加 `region !== null` 守卫 | 评审 🔵 修：`null` 是本 API 合法的一格（= 整份判），`(region.rows ?? [])` 在 `null` 上仍抛 TypeError |

**审计与评审轮次（同会话内跑完）**

- **内部差异审计（`explore`，只读）第 1 轮**：VERDICT divergent，五条 —— D1 出清单档未在任务书文件表 / D2 设计 §6 未点名该档的落点 / D3 单测缺批档那一臂两条验收 / D4 AC-13 缺「行号锚写进被改那一行」的正向断言 / D5 `7-18` 用例标题仍留已作废的「取到整份文本」。处置：D3 ∥ D4 ∥ D5 本席修；D1 ∥ D2 属设计档与记录笔域，上抛（见「落地核对」第 4 条与报告）。复审口径：修完的断言各带红侧读数（见下）。
- **内部代码评审（`advisor` code）第 1 轮**：VERDICT changes-required —— 1 🔴（排除面被当成接线错误 throw）· 1 🟡（§2 机读清单缺 `batch-record-write.mjs`）· 3 🔵（`null` 档位 TypeError ∥ 千行量级无观测 ∥ 两条链对齐差异无边界说明）。处置：🔴 修 + 带红侧；🔵 两条修（`null` 守卫、千行量级用例），另一条 🔵 与 🟡 属设计档 / 记录笔域，上抛。
- **终态**：`clean`（本席笔域内无未修项；三条上抛项不进本席的收敛条件）。

**修正轮记录（1 轮落完）**

审计 5 条 + 评审 5 条同轮修：单测档 6 条 → 9 条（补批档臂、排除面、千行量级）；`CLI 7-18` 标题改口；`doc-write-gate.mjs` 加「空判域 = 不判」；`index.mjs` 与 `batch-gate.mjs` 两处 `region !== null` 守卫；`runDocCheck` 的 `regions` 注释补「表里某一格可以是 `null`」。

**读数（本轮实跑，命令 + 回执；数在命令输出里）**

- `node --test` 本批全链 16 档 = `doc-write-gate` · `batch-close-gate` · 本批单测档 · 其余 11 档 batch ∥ doc ∥ apply-patch ∥ edit-line-anchor ∥ advisor-record-gate ∥ review-doc-scope ⇒ `tests 91 / pass 91 / fail 0`。
- 本批单测档单跑：`node --test docs/batches/2026-11-12-writer-gate-changed-region.test.mjs` ⇒ `tests 9 / pass 9 / fail 0`。
- **红侧逐条（改一处代码再跑同一档，跑完复原）**：
  - `changedRegionOf` 恒返 `{rows:[],gaps:[]}` ⇒ `7-14` ∥ `7-27` ∥ `7-28` 三例红（`7-18` 仍绿，它要的就是放行）。
  - 只丢 `gaps`、留 `rows` ⇒ 只有 `7-28` 红——这一条断的正是那个返回值。
  - 写时点臂退回交 `null` ⇒ 单测「批档段写那一臂」红。
  - 拿掉「空判域 = 不判」那一支 ⇒ 单测「排除面」红。
  - 把 `doc-write-gate.mjs` 里门那一跳拿掉 ⇒ 一笔 350 字段的写落盘（门在/门不在两读）。
- **性能抽样**（`changedRegionOf`，仓内最大的文档面档 10747 内容行）：单行改 3 ms · 头尾各改 200 行 1033 ms · 整档重写（10747 × 10000）811 ms。行数之积是上界、没有行×行全表。
- **交付门**：`doc_check(mode:"gate")` 判 `test/rtm/guard.md` ⇒ `DOC-CHECK GATE: PASS`。先证能红：往变更区塞一处悬空档名 + 一处行号锚 ⇒ `REFUSED` 并逐条点名那两处；撤回后同跑 ⇒ `PASS`。

**落地核对（这一笔让设计档里三句不再成立，逐字抄；本席不改设计档，交父侧路由）**

1. `docs/core/design/DOC-CHECK.md` §9：「所以写门拿交回的清单当判域时，里面必须仍是目标档自己。判域与目标档对不上 ⇒ 接线错了，当场抛带门名的错」——排除面上的档（§10）在这一刻确实不在判域里；本笔把「空判域」按不判放行。这句要收成「除排除面外仍是目标档自己」。
2. `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md`「留痕行 → 状态行」段：「**留痕行不经文档机检门**：门位在 `insertIntoSection` 之前（`thincoder-core/agent-tools/batch.mjs` 的门位，判集只含评审正文 `pending.body`），留痕行插在其后 ⇒ 不进门判集」——本笔把 append 的门位落到 `insertIntoSection` 与状态行改写之后、判集 = 候选全文，留痕行现在**在**判集里（它是块引用行、不带档名与行号锚，实测不进任何段；§3 相关用例全绿）。主句与理由都要改。
3. `docs/core/design/TOOLS.md`「gate 挂点」条：「append 于 gate/text 校验后 `insertIntoSection` 前（主档）」——现在是 `insertIntoSection` 与状态行改写之后、写盘之前。
4. （记录面，不是设计档）`docs/batches/2026-11-12-writer-gate-changed-region.md` §2 的机读清单与人读表都缺 `thincoder-core/agent-tools/batch-record-write.mjs` 一行（本笔改了它）；不补则收口 §8 读数门按「清单里没有这一档的行」拒。§2 不是本席笔域。

**未做的事（不进本席判定）**：`7-23` 有号无案例（设计 §9 已改口，§2 上抛项 1 在案）；`test/batches/2026-11-11-*.test.mjs` 与 `2026-11-12-ledger-query-default-limit.test.mjs` 三份旧批单测档仍在盘（不是本批的档，未动）。

## §6 验证与收口（父代理）

**验证（父侧，本会话实跑）**

| 检查 | 命令 | 读数 |
|---|---|---|
| 改动面集成（收口前，含本批单测档） | `node --test doc-write-gate + batch-close-gate + 本批单测档` | `tests 31 · pass 31 · fail 0` |
| 收口后复跑常驻两档 | `node --test test/integration/doc-write-gate.test.mjs test/integration/batch-close-gate.test.mjs` | `tests 22 · pass 22 · fail 0` |
| 交付门 | `doc_check(mode:"gate")`（三份设计档） | `DOC-CHECK GATE: PASS` |

**单测档已删（delete-on-use）**：`docs/batches/2026-11-12-writer-gate-changed-region.test.mjs` 收口前删除。

**集成集**：新增 `CLI 7-27`（区外存量放行 ∥ 改到那段内一行即拒）与 `CLI 7-28`（纯删缝合超段拒 ∥ 同笔删短即放行）；`CLI 7` 表由二十二态到二十四态。

**落地核对**：实施顶掉了三处设计描述（DOC-CHECK §9 的「判域对不上即抛」· BATCH-LEDGER-REVIEW-UNIFY 的「留痕行不进门」· TOOLS 的 gate 挂点），已由设计席在交付后收正；TOOLS 那一条实读后发现原话不成立（挪位置的是文档机检门，不是占位残留机检），改成消歧而非照改——理由记在收正轮报告里。

**未落（记账）**：`thincoder-core/agent-tools/batch-record-write.mjs` 里 `appendBatchRecord` 的一句注释仍写旧门位（「留痕行不经文档机检门——门位在上面（判集 = 本次评审正文 `pending.body`）」），与现状相反。代码不属设计席笔域，本批收口前未改——记入台账。

**本批新债 1 条 + `#2372`。**
