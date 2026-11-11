# 2026-11-11 · batch-edit-touch-zones
> 六段，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 每段只有一个作者：作者的段可 `append` 加内容、可就地改（`edit`）；非作者一概拒。
> 编制：主 agent · 2026-11-11 · 来源 = 来源 = v1-convert-console 台账 `#134`（VSC 端报，用户 2026-11-11 14:29 转来）+ 父侧读码定位（入账 `#2335`）。它报「`batch edit` 按旧行判定 ⇒ 含死指针的行改不掉」，读码后判该结论不成立；真缺口 = `edit` 面只给批档本体交 `zones`，被本 run 触碰过的各档没有自己的区 ⇒ 整档判，未跟踪触碰档的存量死锚能整笔拒写。用户 14:31「你处理吧」＝ 修。。
> 台账 = #2335（core · 归批）。前情 = 无（独立批）。
## §1 讨论（主 agent）
**状态行**：已收口 2026-11-11
批起 sha = 6f33e721c2ed84672f60342360b77c2daaee93ba
<§1 模板占位：本批条目 / 关键判据 / 授权口径>

## 讨论纪要（主 agent）

**报方说的与代码不符，但缺陷是真的——只是不是它说的那个。**

v1-convert-console 那边报：`batch({action:"edit"})` 按旧行判定，含死指针的行就地改不掉。它自己也标了：「判据按旧行判定」是从「回执回显改前那两行」推出的**推断**，不是取证结论。

我读 `thincoder-core/agent-tools/batch-gate.mjs` 的 `edit` 面：

```
docs  = [...touched, selfAbs]
texts = Map([[selfAbs, inputBody]])        // inputBody = recordView = 改后整档
zones = Map([[selfAbs, judgeZones(viewBody.split("\n"), [editRegion])]])
```

`replacementRegionOf` 按**改后行号**算区 ⇒ 把死指针那行换掉，它在区外，**记录自身那一腿应当放行**。

**真缺口在触控账那一腿**：同一处 `zones` 只给了 `selfAbs`。而引擎的逐档语义（本档头注自己写着）是「某档在 `docs` 里、`zones` 里没有它的键 ⇒ 该档整份进阻断集」。于是：

```
edit 面下，每个被本 run 触碰过的 .md 都被整档判
→ blocks 收：非自档走 regions
→ regions 里 kind === "whole"（未跟踪档）直接 return true
⇒ 一个与本笔无关的未跟踪触碰档含存量死锚，就能整笔拒 batch edit
```

报方看到的拒串「DOC-CHECK GATE: REFUSED（命中 N 条——**触达账改动区**（锚 N 条））」正是 `touchHits` 那一路——**被拒的不是批档自身那两行**。

### 已定决定

- **已定决定**：`edit` 面触达账各档必须有自己的改动区（与设计档 §3.20「触达账腿的判面 = 本次改动区」一致）· 用户原话：「你处理吧」· 时间：2026-11-11 14:31

### 两条候选修法（设计席判，各带理由与反例）

```
甲  edit 面把触达账各档的改动区一并交 zones（与 append 面同形）
乙  blocks 对 kind==="whole" 的触碰档改判「本 run 是否真写过它」，不拿整档存量债当本次
```

**两条改出来的是不同的门**，不能都做——会把「谁的债算谁的」判两次。

### 边界

- **不动**记录自身那一腿（它已经是对的，改了会破刚收口的 supersede）。
- **不动** `append` 面与收口面。
- 报方列的 `#115`（跨仓解析按会话锚解路径）是那些 `bms_v2/...` 被判档缺的**上游原因**，`unverified`；**若本批查实它是根，另记账不并批**——混批正是今晚反复吃的亏。

### 父侧补正（设计席读码推翻我的一半判断）

**我 §1 写的真因只对了一半。** 设计席读 `blocks` 逐支后指出：

```
kind === "region"  → 区外命中本来就不阻断
kind === "whole"   → return true（未跟踪档，整档断）
kind === "unknown" → return false
```

**⇒ 那句拒串是 `whole` 态产出的，不是 `edit` 面少交 `zones`。** 甲（把触达账改动区一并交 `zones`）改的是**读数**——`DD-217` 要求区外存量只出计数，而 `edit` 面今天逐条列；判决仍由 `blocks` 按区收。

**这条更正我认**：我拿「`docs` 里有 `touched`、`zones` 里没有」推到了判决面，而判决面另有收口。

### 已定决定

- **已定决定**：E1 落甲（读数口径与 `append` 对齐，区外存量只出计数）· 依据 = `DD-217`「区外存量不阻写、仍明示，该 3 条不逐条列」· 时间：2026-11-11 14:35
- **已定决定**：E2（`whole` 态前提「未跟踪只可能是本轮新建」跨 run 为假）**本批不动判据，取丙-1**——保持 ②，把出路写进设计档：**先提交，再改**。理由 = 盘上今天无实例，而项目已立的规矩是「没有可复现场景的分支先不加」（`#2161` 同判）；`whole` 的反例是用户 2026-11-07 11:11 裁定的②态，本批不拿一个没见过的输入去推翻它。· 时间：2026-11-11 14:35
- **已定决定**：丙-3（查 `#115` 是否为那些 `档缺` 的真根）**另起一轮查，不并批**——它的对象是跨仓路径解析，不是本门。

### 乙为什么不能落（设计席三条，我采认）

1. 它推翻用户 2026-11-07 11:11 裁定的 ② 态与用例 DD-218 ②；
2. **字面形是空判据**：`_touchedFiles` 记的就是本 run 用写工具改过的档，「本 run 是否真写过它」对表内每一项**恒真**，永不拒——门变装饰；
3. 未跟踪档没有提交面，本 run 起点那份内容无人记账，判不出哪几行是本轮的笔。

**第 2 条是决定性的**：一条永远不会红的判据，比没有判据更坏。

### 本批射程（收窄）

```
做   E1：edit 面 zones = 批档本体替换区 ∪ 触达账各档改动区（与 append 同函数）
不做 E2（丙-1，写进设计档当出路）∥ #115（另轮）∥ append 面同病（只报）
```

## §2 批次任务与设计（eng-designer）
**状态行**：设计完成（修轮 2：表第 1 行 · 留档面 · 不变式 · ④ 按 K7 后实况重写，编排档共享小件只余 isDocPath；K8 入表 = batch-regions 自持的 pathKey 换源同单源；集成增量仍 0；边界补本族外四份 pathKey）

### 结论（先给判，再给理由）

- **E1 落 `甲`**：它把 `edit` 面的引擎入参与**设计档已定的判面**对齐，不改任何判决规则。
- **`乙` 不落**：它推翻 §3.20 的 ② 态（用户 2026-11-07 11:11 裁定过的判据）与用例 DD-218 ②，且它的字面形是空判据。
- **报方看到的拒是真拒，但产出它的不是「`edit` 少交 zones」，是 ② 态**——那一条本批零改（E2 已裁 = 丙-1，见下）。
- **本批同时承担 `thincoder-core/agent-tools/batch-gate.mjs` 的三族分拆**：设计时读数越 500 ⇒ 分拆随当批落地，见「档层结论」。

### E1 · `edit` 面把触达账各档的改动区一并交 `zones`（落 `甲`）

**判据句（沿用，不新立）**：`writer` 面触达账腿判的是写者本 run 写进那一档的那些字，扩到段落为止——判据单源 = `docs/core/design/DOC-DISCIPLINE.md` §3.20「触达账腿的判面 = 本次改动区」。

**今天的两面差（实读 `thincoder-core/agent-tools/batch-gate.mjs`）**：判域两面同形（`docs` = 触达账各档 ∪ 批档本体），**区表两面不同形**——`append` 交 `zoneTablesOf(regions, touched)`；`edit` 交的是 `new Map([[selfAbs, judgeZones(viewBody.split("\n"), [editRegion])]])`，**只有批档本体**。

引擎的逐档语义（单源 = `docs/core/design/DOC-CHECK.md` §2.10.1）：某档在 `docs` 里而 `zones` 里没有它的键 ⇒ 该档整份进阻断集。

**这是读数错，不是判决错**：随后 `blocks` 按 `regions` 逐条收（`region.zones.some(...)` 才断），真正被拒的仍然是区内命中。错在区外那批——设计档 DD-217 要求「区外存量不阻写、仍明示；该 3 条不逐条列」，而 `edit` 面上这些命中以逐条 `✗` 行进「区外存量命中」段。

同一批存量：`append` 面只出计数器一句（字面单源 = 引擎的 `STOCK_LINE`），`edit` 面列成行 ⇒ 两面读数不一致，且与设计档的明示面口径相反。

**射程限定（`kind` 四态）**：上一句只对 `kind:"region"` 的触达档成立——`zoneTablesOf` 只收这一态。`kind:"whole"` 照旧整档阻（DD-218 ②）；`kind:"unknown"`（改动区未定）改后仍逐条列，与 `append` 面对称，见「已知项」。

**改法**：`edit` 面 `zones` = 批档本体替换区 ∪ `zoneTablesOf(regions, touched)`——与 `append` **同一个函数、同一张扩区表**，零新判据、零新常量、零新依赖（`zoneTablesOf` = 本档既有局部函数，分拆后随「判集分腿」族搬家）。

它一档都交不出时返回 `undefined` ⇒ 与今天的 `edit` 面逐字同形，那条路径零变。

**同笔改它的头注**：逐字「`edit` 只交批档本体（替换区），触达账各档交给 `blocks` 逐条判」改后为假，改为「`edit` 与 `append` 同交触达账各档改动区；批档本体另交替换区」——注释行，行为零变。

### E2（已裁 = 丙-1，本批零改）· ② 态「未跟踪 ⇒ 整档」的前提在跨 run 时是假的

设计档 ② 的理由逐字：「写工具不提交，未跟踪的 `.md` 只可能是本轮新建的档，整本即本轮的笔」。前半句真，**后半句不成立**：未跟踪是跨 run、跨批的状态——前一个 run 建了没提交，本 run 只改它一行，它照样被当成「整档即本轮的笔」。

**复现路径（读码推出，`unverified` 未实跑）**：① run 1 在仓内新建一篇含死锚的 `.md`，不提交；② run 2 用写工具改它一行（进 `_touchedFiles`）后调 `batch({action:"edit"})` ⇒ `touchedRegions` 判 `kind:"whole"` ⇒ `blocks` 那一支 `return true` ⇒ 拒串第三段读「触达账改动区（锚 N 条）」，而那 N 条一条都不是 run 2 写的。

**盘上今天没有实例**：`git status --porcelain` 的未跟踪 `.md` 只有本批档一本 ⇒ 这是可达路径，不是实测。

**三条候选，已裁 = 丙-1**：

| # | 候选 | 代价 ∥ 缺口 |
|---|---|---|
| **丙-1（已选）** | 保持 ② 不动；出路 = 先把该档提交（进 ① 态，改动区可算） | 作者撞一句**在批内改不掉**的拒；本仓批档长期未提交，撞面不小 |
| 丙-2 | ② 加判别「该档在本 run 之前是否已存在」 | 今天无机械证据（`git status` 只给 `??`，分不出谁建的）；要落得记 per-run 基线 = 新机制 |
| 丙-3 | 报方那批 `bms_v2/...` 被判 `档缺` 若根在 `#115`（跨仓解析按会话锚解路径），命中本身是假阳 ⇒ ② 不触发 | `#115` 未核；查实**另记账不并批**（§1 边界） |

**丙-1 的出路已落设计档**：`docs/core/design/DOC-DISCIPLINE.md` §3.20「改动区取法」② 态那一段补了一条「② 态的出路 = 先提交、再改」——判据不动，给作者一条走得通的路。

### 受影响文件

| # | 档 | 本批改什么 |
|---|---|---|
| 1 | `thincoder-core/agent-tools/batch-gate.mjs` | E1：`evaluate` 里 `edit` 面的 `zones` 合成（一行改 + 头注一行）；分拆后本档余 `runBatchGate` ∥ `evaluate` 编排 ∥ 范围解析（`docPaths` ∥ `baseShaOf` ∥ `replacementRegionOf`）∥ 共享小件只余 `isDocPath` 一件（`pathKey` ∥ `safeRead` 不在本档自持、也不由本档导出：各取既有单源，见第 10 行与 K8） |
| 2 | 命中行组装新档（`batch-gate-hit.mjs`） | 新档：`pointerCells` ∥ `hitEntries` ∥ `displayLineOf` ∥ `inEvidenceCell` ∥ `srcOfOf` ∥ `oneLine` ∥ `ANCHOR_CLASSES` ∥ 证据格识别小件（`EVIDENCE_HEADERS` ∥ `DELIM_ROW_RE` ∥ `lastCellSpan` ∥ `cellLabel`） |
| 3 | 判集分腿新档（`batch-gate-judge.mjs`） | 新档：`zoneTablesOf` ∥ `blocks`（由 `evaluate` 内的闭包提为纯函数，入参 = 改动区表 ∥ 面别 ∥ `pureDeleteStock`；三态判定表达式与顺序逐字照搬） |
| 4 | 报面组装新档（`batch-gate-report.mjs`） | 新档：`composeReport` ∥ `gateReceiptLine` ∥ `gateRefusalMessage` ∥ `classifyCounts` ∥ `attributionOf` ∥ `authorMapOf` ∥ `sectionOfLine` ∥ `emptyRange` ∥ `errorState` |
| 5 | `docs/core/design/DOC-CHECK.md` | §2.10.1「各次调用各交什么」表的 `edit` 行：`zones` = 批档本体替换区 ∪ 触达账各档的改动区，`docs` 行同步写实（触达账各档 + 批档本体）——本机制的单源表 |
| 6 | `docs/core/design/BATCH-RECORD.md` | §4.9 门 ④ 的 `edit` 面描述改回指句（单源 = `docs/core/design/DOC-CHECK.md` §2.9.1 ∥ §2.9.4 ∥ §2.10.1，本档不重述）；§4.22 档层结论去逃生口；§4.22 勘察证据行的 `hitEntries` ∥ `blocks` 坐标改成「分拆后独立成档」 |
| 7 | `docs/core/design/DOC-DISCIPLINE.md` | 三笔：① §3.20「改动区取法」② 态补一条出路（先提交、再改）——丙-1 的落盘位；② 剥除面那句里带目录段的操作数档名改占位形 `<dir>/<name>.md`——修法 = 该档 §3.28 AB-3，判据零改；③ §3.20「命中分流」与用例 DD-214 ∥ DD-217 的存量读数改引 `STOCK_LINE` 符号、删本地字面（字面单源 = `docs/core/design/DOC-CHECK.md` §2.9.4）——判据零改 |
| 8 | 本批单测新档（`docs/batches/2026-11-11-batch-edit-touch-zones.test.mjs`） | 定向单测（新增 · 收口随批删 · 零留存） |
| 9 | `test/integration/doc-check-citation.test.mjs` | `ANCHOR_CLASSES` 随命中行组装一族搬进 `thincoder-core/agent-tools/batch-gate-hit.mjs` ⇒ 该档的源面直读**改指新档**；断言正则与判词一字未改（§5 自报的清单外改动，本席补入表——不补则收口「清单外零改动」与盘对不上） |
| 10 | `thincoder-core/agent-tools/batch-regions.mjs` | 两笔、同一收口：① K7（甲）的落点——`safeRead` 由本地函数改为 `export`，与编排档共用同一实现、消掉同体重复；② K8——删本档的 `const pathKey` 本地定义、改 import 自 `thincoder-core/doc-check/per-root.mjs`（与①同一理由的另一半）。两笔判据零改 |

三个新档的落点路径见下方码块（新档尚未落盘 ⇒ 码块外只写裸名，不写路径）：

```text
thincoder-core/agent-tools/batch-gate-hit.mjs
thincoder-core/agent-tools/batch-gate-judge.mjs
thincoder-core/agent-tools/batch-gate-report.mjs
```

**跨层结论**：无档跨层。

**档层结论（设计时读数 · 500 线）**：

- **越线档 = `thincoder-core/agent-tools/batch-gate.mjs`**：改代码前读数过 500（读数 = `doc_check` 的 `lines`，存本批 §5；本档不载数值）⇒ 分拆**在本批内实施**，不外排承接批。
- **三族切法**（切在「谁读什么」的边界上，不切在调用链中间）：① 命中行组装 = 引擎的一批命中 → 落格 ∥ 补四件 ∥ 证据格判读；② 判集分腿 = 一条命中算本次还是存量（交哪些区 ∥ 三态收口）；③ 报面组装 = 强制集 ∥ 明示集 ∥ 读数行 → 首行 ∥ 拒串 ∥ 回执行。
- **留档面**：`runBatchGate` ∥ `evaluate` ∥ 范围解析 ∥ 共享小件——它们是「判谁」的编排，不属上面任何一族。
- **共享小件的归属（分拆后终态）**：本档自持的共享小件只剩 `isDocPath`。`pathKey` 单源 = `thincoder-core/doc-check/per-root.mjs` 的既有导出；`safeRead` 单源 = `thincoder-core/agent-tools/batch-regions.mjs` 的导出。族档与编排档一律 import 这两处，本档不自持、也不导出。
- **不变式（分拆的验收面）**：对外导出面零改（`runBatchGate` ∥ `gateReceiptLine` ∥ `gateRefusalMessage` 四个消费档照旧 import；`pointerCells` 保持导出）∥ 搬迁的符号体逐字不动 ∥ `blocks` 提纯函数时三态判定表达式与顺序逐字照搬 ∥ 共享小件零重复定义（量法 = 「分拆的验收」第三格）。

### 验收（A1 ∥ A2 ∥ A5 能红；A3 ∥ A4 是零回归护栏，方向 = 改后仍拒）

**夹具（A1 ∥ A2 ∥ A5 共用；A3 ∥ A4 由同一夹具各改一处即得，不另立）**：临时 git 仓里造三样——① 一份**在跟踪面**的设计档，基提交里就有、内含 1 条存量死锚（落在本笔不动的那几行）；② 该档在工作树里只改**别处一行**（改完进 `_touchedFiles`）；③ 批档本体，其 §1 写 `批起 sha = <基提交 sha>`。

**A3 ∥ A4 的造法（各改上面一处）**：A3 = 把①那份设计档改成仓内**新建未提交**的 `.md`（`git status` 读 `??`，改它一行后进 `_touchedFiles`）⇒ `touchedRegions` 判 `kind:"whole"`、改动区 = 整档。A4 = 把一条死锚写进③批档本体本笔的 `newText`（落进替换区），所在档仍是同一份批档。

**前置读数（夹具成立的判据）**：同一夹具在改前必须读到该档逐条 `✗` 行（明示面非零）；读不到 ⇒ 夹具落在 `unknown`（零强制）或 `whole`（整档判）上，A1 会假绿，本条作废重造。

| # | 在 A1 之上再加什么 | 期望（改后） |
|---|---|---|
| A1 | 什么都不加（存量与改动区分离） | 放行，且两合取同时成立：① 明示面该档 `✗` 行 **0 条**；② 回执出存量读数行，逐字 = `STOCK_LINE(1)`，即 `存量命中 1 条（不属本次改动区，不阻断交付；整档读数）`（字面单源 = 引擎 `STOCK_LINE`；与 `test/rtm/guard.md` 行 `7-16` 断的是同一串）。**改前读数**：该档 `✗` 行逐条列（非零）⇒ ① 红 |
| A2 | 把那条死锚挪进该档改动区 | `REFUSED`；首行第三段逐字 `触达账改动区（锚 1 条）` |
| A3 | 触碰档**未跟踪**（`kind:"whole"`）含存量死锚 | **仍 `REFUSED`**（DD-218 ② 零回归）；方向 = 拒 |
| A4 | 死锚落在批档本体替换区内 | `REFUSED`；首行第三段读 `批档替换区（锚 1 条）`；方向 = 拒 |
| A5 | 同 A1，另记存量条数 | 存量条数与改前**同一数字**（命中原在明示面，改后进引擎 `stockHits`；`stockCount` = 重分类那批 + `stockHits` 两桶相加不变）⇒ 计数掉了即红 |

**机检形**（cwd = 仓根）：`node --test docs/batches/2026-11-11-batch-edit-touch-zones.test.mjs`——断言住上表五格。

**分拆的验收（同档三格）**：

- **符号体逐字不变**：以 `git show <批起 sha>:thincoder-core/agent-tools/batch-gate.mjs` 为原文本，对每个搬迁符号取原符号体与新档同名符号体逐字比较，全部全等才算过；三新档 `node --check` 零错。
- **行为不变**：`batch-close-gate.test.mjs` ∥ `batch-touched-region-gate.test.mjs` ∥ `batch-edit-spec-section.test.mjs` ∥ `doc-check-citation.test.mjs` 四档集成用例全绿（父侧收口面跑，本批不代跑）。
- **共享小件零重复定义**（K8 的可红读数）：量法 = `grep -n "const pathKey" thincoder-core/agent-tools/` ⇒ 本族 0 命中（唯一单源 = `thincoder-core/doc-check/per-root.mjs` 的导出）；改前同一命令在 `batch-regions.mjs` 出命中、改后 0 命中 ⇒ 可红可绿。护栏 = 上条四档集成用例全绿 + 编排档 ∥ `batch-regions.mjs` 各 `node --check` 零错。其他模块自持的 `pathKey` 不属本族、不进本判据（见「边界」）。

### 勘察证据行：查过下面各处，结论如各项所注。

- `docs/core/design/DOC-DISCIPLINE.md` §3.20「触达账腿的判面 = 本次改动区」∥「命中分流」∥「改动区取法」四态——**相关**（判据单源；E2 的出路也落回该节）。
- `docs/core/design/DOC-DISCIPLINE.md` §5 `A-DD31` 第 8–11 条 ∥ 用例表 DD-214–DD-219——**相关**（`edit` 面同判 = DD-216；区外只出计数 = DD-217；② 态零回归 = DD-218 ②）。
- `docs/core/design/DOC-CHECK.md` §2.10.1「各次调用各交什么」表 ∥ §2.9.4 的 `STOCK_LINE`——**相关**（单源表本批同拍改；期望串锚它）。
- `docs/core/design/DOC-GRAPH.md` §3「行数档位口径」——**相关**（设计时 500 线的分拆义务与时点）。
- `thincoder-core/agent-tools/batch-gate.mjs`（`evaluate` 编排）∥ `thincoder-core/agent-tools/batch-gate-hit.mjs`（`hitEntries`）∥ `thincoder-core/agent-tools/batch-gate-judge.mjs`（`zoneTablesOf` ∥ `blocks`）∥ `thincoder-core/agent-tools/batch-gate-report.mjs`（`composeReport`）∥ `thincoder-core/agent-tools/batch-regions.mjs`（`touchedRegions` 四态）∥ `thincoder-core/doc-check/index.mjs`（`STOCK_LINE` ∥ `stockHits` 两桶）——**相关**。
- `test/rtm/guard.md` 行 `7-3` ∥ `7-16` ∥ `7-17`——**相关**（存量读数同一串 ∥ `edit` 面判定区的既有行）。
- `docs/batches/2026-11-07-touched-gate-scope.md`——**相关**（触达账判改动区的先例批，见下）。
- 库外：本批不对外部系统的行为作任何断言（改的是本仓门内部的读数面）——**无相关**。

### 最近先例（对齐 ∥ 偏离）

- **先例批 = `docs/batches/2026-11-07-touched-gate-scope.md`**：它立下的正是「触达账只判改动区、区外存量不逐条列」。**对齐**其「命中分流」——区内进强制集、区外只入回执计数；**对齐**其 DD-216 形（`edit` 面与 `append` 面同判）。**偏离 = 无**：判面、四态、首行三段标签本批都不动。
- **对齐** `docs/core/design/DOC-DISCIPLINE.md` §3.20「触达账腿的判面 = 本次改动区」+ DD-214–DD-219：判面同一张扩区表、`writer` 面区外只出读数。本批把 `edit` 面接到同一条腿上（`append` 面早已接上）。
- **对齐** `docs/core/design/BATCH-RECORD.md` §4.9 的 `edit` 行既有口径「区内命中阻断、区外命中只出读数」——该句今天在 `edit` 面没有全兑现（区外命中逐条列），本批是把它兑现。
- **偏离 = 无**：不新增判据、不新增常量、不改阈值、不改命中类；分拆是文件边界重排，判据面零改。

### 关键决策

| # | 决策 | 依据 |
|---|---|---|
| K1 | 选甲不选乙 | 乙动的是 §3.20 ② 态（用户 2026-11-07 11:11 裁定的判据）+ DD-218 ②；甲只补入参 |
| K2 | 乙的字面形不能落 | `_touchedFiles` 记的就是本 run 用写工具改过的档（`thincoder-core/agent/record-results.mjs`「if (!agent._touchedFiles.includes(abs)) agent._touchedFiles.push(abs)」）⇒「本 run 是否真写过它」对表内每一项恒真 ⇒ 该判据永不拒 |
| K3 | ② 态本批零改（E2 已裁 = 丙-1） | 「谁的债算谁的」在 ② 态里没有可算的基线：未跟踪档无提交面，本 run 起点那份内容无人记账；出路 = 先提交再改 |
| K4 | 不改 `blocks` | 三分支（自身 / region / whole / unknown）已能把「谁的债算谁的」判完；本批只让引擎看见同一张区表 |
| K5 | 分拆在本批内实施，不外排承接批 | 判据句 = `docs/core/design/DOC-GRAPH.md` §3「过 500（> 500）⇒ 必须给分拆方案，且分拆在本批内实施」——「另起一批拆」不是方案 |
| K6 | 先搬后改，两者同批同面 | 搬是零逻辑编辑；E1 那一行落在搬后的 `evaluate`。先改后搬会让「符号体逐字不变」失去基准 |
| K7 | 环的裁决 = 甲，且按既有单源搬回、零新档 | 族档反向 import 编排档 = 层次倒挂（单测 `blocks` 也要拖进整个编排档连引擎）；乙的「今日不炸」给不出可复现的炸法，按「没有可复现场景的分支先不加」不留无场景的例外。落点 = `pathKey` 取 `thincoder-core/doc-check/per-root.mjs` 的既有导出、`safeRead` 取 `thincoder-core/agent-tools/batch-regions.mjs` 的既有同体实现（改为 export，顺手消掉重复） |
| K8 | `batch-regions.mjs` 自持的 `pathKey` 收进同一单源（一行换源、判据零改） | `pathKey` 的单源 = thincoder-core/doc-check/per-root.mjs 的导出：依据 thincoder-core/doc-check/per-root.mjs「export const pathKey = (p) => (process.platform === "win32" ? p.toLowerCase() : p)」；另一份原住 thincoder-core/agent-tools/batch-regions.mjs，K8 后该档改 import 自 `per-root.mjs`，两处已合并为这一份。两份并存 ⇒ 日后一边改形，区表键与查询键不再相等，`blocks` 落进 fail-closed 支（不是崩，是悄悄全拒，最难查的一类）。K7 只收了 `safeRead`，留一半等于留一个「已收过口」的错觉。落点无环：`per-root.mjs` 只 import `node:path` ∥ `thincoder-core/manifest.mjs`（实读该档 import 面两行），而编排档本就同时 import 这两族 |

### 集成测试设计（读面 = `test/rtm/guard.md` 的 RTM 行 → 本批增量 = 0）

- **读面点名三行**：`7-3`（收口面存量读数同一串 `STOCK_LINE`）∥ `7-16`（`append` 面 + 收口面：存量锚在改动区外只出计数、拒面零该档命中）∥ `7-17`（`edit` 面：替换区外存量不阻、区内失效引文照拒）。
- **交互组件** = 真 `batch` 工具 ⟷ `runBatchGate` ⟷ `doc-check` 引擎；**业务可观察结果** = 写入落没落盘、拒面出哪几行；**入口** = 真 `batch` 调用（设计席改 §2 = `edit` 面）。
- **破 = 0**：三行断的是「存量只出统一读数」与「区内照拒」，本批两条都不放宽；`edit` 面区外命中原先逐条列、改后归同一行读数——既有三行没有一行断言过「`edit` 面逐条列」（那正是缺陷本身）。
- **冗余 = 0**。
- **缺 = 0**：同一机制已由 `7-16` 在 `append` 面断过一次、`7-17` 在 `edit` 面的批档本体内断过一次；本批只把 `edit` 面的触达账腿接到同一行读数，不新增业务场景，也不是生产真发生过的问题（§1 的现场本批未复现）。

- **本批第二条（K8 的 `pathKey` 换源）同判**：它改的是同一个键函数住在哪一档，业务可观察结果零变（逐字同体的函数换了个 import 源）⇒ RTM 增量仍 = 0；四档集成用例是它的护栏，不是它的新行。

### 边界（不做）

- **不收敛本族之外各模块自持的 `pathKey`**：`thincoder-core/declared-repos.mjs` ∥ `thincoder-core/doc-graph.mjs` ∥ `thincoder-core/ledger-write-ops.mjs` ∥ `thincoder-core/path-resolve.mjs` 各有一份本地定义，它们的键不参与本门 `blocks` 的区表查询（区表键全部产自 `thincoder-core/agent-tools/batch-regions.mjs` 与 `thincoder-core/doc-check/per-root.mjs` 这两处）——收它们是另一件事。

- 不动记录自身那一腿（`texts` = 改后整档、区按改后行号算——它是对的）。
- 不动 `append` 面 ∥ 收口面；`append` 面 ② 态同病（它也不交 `whole` 的区、`blocks` 同样 `return true`）——同一条判据同一种行为，本批只报不改（E2 覆盖它）。
- 不做 per-run 基线机制（丙-2 的落地前提），不新增 dryRun 探路动作。
- 不改 `blocks` ∥ `touchedRegions` ∥ `replacementRegionOf` ∥ `judgeZones` 的任何判定表达式（分拆只搬不改）。

### 已知项（已登记，本批不改）

- **`kind:"unknown"` 态改后仍逐条列**：`zoneTablesOf` 只收 `kind === "region"` 的档，未定态没有键 ⇒ 命中进 `entries`、`blocks` 对该态返回 false ⇒ 落进「区外存量命中」段逐条显示（同时另有 `STOCK_LINE` 计数行）。改它会同时改 `append` 面的读数口径（两面本就对称），属读数口径调整，须单独立项。
- **② 态跨 run 的前提为假（E2）**：已裁 = 丙-1（判据零改，出路 = 先提交再改）；复现路径 `unverified`，盘上今天无实例。
- **`#115`**（跨仓解析按会话锚解路径）是否为报方那批 `档缺` 的真根：另轮查，不并批。

### 修轮 1 · 三处坐标补齐 ∥ 环的裁决（K7 = 甲 · 零新档）

**① 受影响文件表补两行**（§5 自报的清单外改动，本席认）：`test/integration/doc-check-citation.test.mjs`——`ANCHOR_CLASSES` 随命中行组装一族搬进 `thincoder-core/agent-tools/batch-gate-hit.mjs`，该档的源面直读改指新档；断言正则与判词一字未改。另一行是 K7 的落点 `thincoder-core/agent-tools/batch-regions.mjs`（`safeRead` 由本地函数改为 export，消掉它与本档的同体重复）。

**② 三处坐标已失效，同族一并补齐**：`pointerCells` ∥ `hitEntries` ∥ `aligned` ∥ `ANCHOR_CLASSES` ∥ 拒文四件组装这一族，今天住在 `thincoder-core/agent-tools/batch-gate-hit.mjs` 与 `thincoder-core/agent-tools/batch-gate-report.mjs`，编排档 `thincoder-core/agent-tools/batch-gate.mjs` 只余 `runBatchGate` ∥ `evaluate` ∥ 范围解析 ∥ 共享小件。逐处改法：

- `docs/core/design/BATCH-RECORD.md` §4.22「新名三问」的 `pointerCells` 行：落点改 `batch-gate-hit.mjs`（`hitEntries` 同档）。
- 同档 §4.22「受影响面」第一行：`pointerCells` ∥ 拒文四件组装 ∥ `aligned` 的判定归 `batch-gate-hit.mjs`；编排档那半句只留「指针读数桶与 `aligned` 读数行的落位」——它确实在 `evaluate` 的 `notes` 里。
- 同档 §4.22 红判据段的 `ANCHOR_CLASSES`：改指 `batch-gate-hit.mjs`（同族，同笔补齐）。
- `docs/core/design/DOC-DISCIPLINE.md` §3.23 落点表第 4 行的 `hitEntries`：改指 `batch-gate-hit.mjs`。
- 同档 A-DD37 第 8 点「`batch-gate.mjs` 的 `aligned` 仍为真」：改指 `batch-gate-hit.mjs`（同族）。
- 同档两处 `依据` 引文的档名（**引文自身逐字不动，只改档名**）：`const aligned = drift === 0` 现居 `batch-gate-hit.mjs`；`export function gateRefusalMessage(gate, action = "append") {` 现居 `batch-gate-report.mjs`。两处今天读作 `引缺`，是本轮同批让它们失效的那一笔。
- `docs/core/design/PATH-RESOLUTION.md` 受影响文件表里那句「`ANCHOR_CLASSES` 增 `环引`」：改指 `batch-gate-hit.mjs`（同族；该档不在本批声明清单内 = 越清单笔，记在此）。

判据面零改：这批改的全是「符号住在哪一档」，没有一句判据、阈值、命中类被动过。

**③ 环的裁决 = 甲（抽出即消失），但按「已有单源」落，不新增第四档**：

- **今日读数（本席实跑）**：对 `thincoder-core/**` 的 313 档建 import 图取强连通分量 ⇒ 含四档的环 **1 组**（四个点同属一个强连通分量）。**指向编排档的反向 import 边 = 2 条**：`batch-gate-hit.mjs`（`import { pathKey, safeRead } from "./batch-gate.mjs"`）∥ `batch-gate-judge.mjs`（`import { pathKey } from "./batch-gate.mjs"`）。

- **`batch-gate-report.mjs` 不 import 编排档**：它只 `import { ANCHOR_CLASSES } from "./batch-gate-hit.mjs"`，进环是被 `hit` 带进来的。
- **父侧那条「第三条」不是 import 行**：命中的是该档头注第 6 行那句「编排与范围解析留在 `…/batch-gate.mjs`」。
- **复现**：`grep -n 'from "\./batch-gate' thincoder-core/agent-tools/batch-gate-*.mjs` ⇒ 只出 `hit` ∥ `judge` 各一条，`report` 零条。
- **两种数法都对、说的是两件事**：按反向边记 2 条（实施席对），按分量记 1 组（`report → hit → gate → report` 闭合）。本席两边都记。
- **建图做法**：逐档正则取 `from "…"` 的相对说明符、`node:path.posix` 归一后建图、Tarjan 取 SCC；命令形态记在此，数值留在输出。
- **为什么不取乙**：这个环今天不炸，而且**造不出炸法**——三个新档对 `pathKey` ∥ `safeRead` 只在函数体里取值，ESM 的活绑定到那时早已初始化，换任何载入顺序都不抛。「接受 + 能红的读数」因此只能落成「今日不炸」，而那正是本项目不认的理由（没有可复现场景的分支先不加）。反面还有一条实的：族档反向 import 编排档是**层次倒挂**——想单独测 `blocks` 也得把整个编排档连引擎一起拖进来。
- **甲怎么落（零新档、零新名）**：两个共享小件本来各有既有单源，搬回去即可。`pathKey` 取 `thincoder-core/doc-check/per-root.mjs` 的既有导出（引擎族叶档，`batch-gate.mjs` 本就 import 同族 `doc-check/index.mjs`）；`safeRead` 取 `thincoder-core/agent-tools/batch-regions.mjs` 里**已有一份同体实现**，改为 export 后两族共用（顺手消掉这份重复，判据零改）。
- **可红读数**：同一条建图命令，改后「含四档的环」= **0**；`grep "const pathKey" thincoder-core/agent-tools/batch-gate.mjs` = 0（该档不再自持）；`node --check` 四档零错；四档集成用例照旧全绿（父侧收口面跑）。

**④ 导出面（终态）**：对外导出面零改——`runBatchGate` 在编排档；`gateReceiptLine` ∥ `gateRefusalMessage` ∥ `pointerCells` 仍由编排档再出口，四个消费档的 import 行一个都不用改。`pathKey` ∥ `safeRead` 不从编排档导出：两者各取既有单源（见下「修轮 2」与 K8）。

**修轮 2（本批末轮 · 两笔）**：

- **表与留档面按 K7 后的实况写**：受影响文件表第 1 行、「留档面」∥「不变式」两条、本节 ④ 一律照实况——编排档自持的共享小件只剩 `isDocPath`，`pathKey` ∥ `safeRead` 取既有单源、不从本档导出。
- **K8 入表**：`thincoder-core/agent-tools/batch-regions.mjs` 自持的 `pathKey` 收进同一单源（第 10 行 ∥ K8 ∥ 「分拆的验收」第三格）。
- 两笔判据零改：改的都是「符号住在哪一档、谁取哪一份」。

## §3 设计评审（评审子代理）
**状态行**：评审通过（第 2 轮：第 1 轮 11 条 11/11 已落地；🔴 0）



### 轮次 1（评审子代理）

| # | 严重度 | 状态 | 证据 |
|---|---|---|---|
| 1 | 🔴 | 未修 | 档层结论缺：`thincoder-core/agent-tools/batch-gate.mjs` 改前读数越 500（量法 = `doc_check` 的 `lines`），§2「受影响文件」三条无一字提分拆；应有形态 = 同一份受审档 `docs/core/design/BATCH-RECORD.md` §4.22 的「**档层结论**」行（含三族分拆方案 ∥ 量法单源） |
| 2 | 🔴 | 未修 | 文档归属：§2 只改 `docs/core/design/BATCH-RECORD.md` §4.9，而「`edit` 交哪几档 `zones`」的单源表在 `docs/core/design/DOC-CHECK.md` §2.10.1，其 `edit` 行逐字「批档 → `newText` 所占行区间经扩区表后的区」⇒ 改后同一机制两处相反；而同档 §4.9 自写「判定输入与阻断集单源 = `docs/core/design/DOC-CHECK.md`」 |
| 3 | 🔴 | 未修 | 验收期望串非实出串：A1 ∥ A5 写 `触达账存量命中 1 条`，产品实出 = `thincoder-core/doc-check/index.mjs` 的 `STOCK_LINE`「存量命中 ${n} 条」+「（不属本次改动区，不阻断交付；整档读数）」，`test/rtm/guard.md` 7-16 断的正是后者 ⇒ 该分句按字面绿不了 |
| 4 | 🟡 | 未修 | 集成测试设计读面点的是设计档用例（DD-214–DD-219）而非 RTM 行；理由「没有业务可观察结果变化，也没有用户从这个面进入产品」与 `test/rtm/guard.md` 7-16 ∥ 7-17（断的就是批档门回执行）+ `docs/core/design/BATCH-RECORD.md` §4.22「业务入口 = 评审 ∥ 设计席…读回执」相反 |
| 5 | 🟡 | 未修 | §2 状态行「E2（② 态前提）上抛待裁」与上抛项「**语义面，需用户裁**」同 §1「**已定决定**：E2…**本批不动判据，取丙-1**」冲突 ⇒ 已裁项被摆成活任务 |
| 6 | 🟡 | 未修 | 无勘察证据行（形态先例 = `docs/core/design/BATCH-RECORD.md` §4.22「**勘察证据行**：查过下面各处，**相关**。」） |
| 7 | 🟡 | 未修 | 「最近先例」两条皆设计档坐标，无先例批次坐标（先例批 = `docs/batches/2026-11-07-touched-gate-scope.md`，它建了「触达账存量只出计数」那一句） |
| 8 | 🟡 | 未修 | A1 ∥ A2 ∥ A5 要的 `kind:"region"` 态前提（在仓 ∧ 在跟踪面 ∧ 基线可解析）未写夹具怎么造 ⇒ 夹具可能落在 `unknown`（零强制）或 `whole`（整档判）上而假绿 |
| 9 | 🔵 | 未修 | 表头「验收（每一条都能红）」与 A3 ∥ A4 的「改前读数 = ——」自相矛盾（二者是零回归护栏，方向是改后仍拒） |
| 10 | 🔵 | 未修 | `zoneTablesOf` 头注逐字「`edit` 只交批档本体（替换区），触达账各档交给 `blocks` 逐条判」改后为假；§2 写「`zoneTablesOf` 已在 import 面」，实为同档局部函数 |
| 11 | 🔵 | 未修 | 标题句「区外存量只出计数」在 `kind:"unknown"` 态不成立（`zoneTablesOf` 只收 `kind === "region"` 的档，`blocks` 对 `unknown` 返回 false）——与 `append` 面对称，设计未点名 |

判读 ① E1 确实只改读数不改判决——`blocks` 对触碰档走的是 `regions` 而非 `zones`，`zones` 只决定命中进 `hits` 还是进 `stockHits`；`kind:"whole"` 与 `"unknown"` 两支被 `zoneTablesOf` 整支跳过，A3 的零回归成立。

判读 ② A1 可红可绿（判别子 = 该档 `✗` 行归零）；A2 ∥ A4 的第三段标签与代码一致；A5 的「两批相加不变」与 `stockCount` 的两桶相加一致；A3 ∥ A4 是护栏不是红点。

判读 ③ `append` 面同病（同样不交 `whole` 的 zones、`blocks` 同样整档断）经读码成立，只报不改与已裁 E2 的覆盖面一致。

判读 ④ 有 🔴 三条，见上表。

VERDICT: changes-required

计数：🔴 3 · 🟡 5 · 🔵 3（总计 11 条）

### 轮次 2（评审子代理）

第 2 轮：核第 1 轮 11 条落地真伪 + 两笔自报写面外改动（本轮不狩新项）。

| # | 严重度 | 状态 | 证据 |
|---|---|---|---|
| 1 | 🔴 | 已落地 | §2「档层结论」逐字「越线档 = …改代码前读数过 500 ⇒ 分拆**在本批内实施**」；本席实量该档 = 621 行（`doc_check` 的 `lines`，越设计器硬线）∥ 受影响文件表第 2–4 行列三新档 ∥ 不变式 = 「符号体逐字不变」+ `node --check`（可红） |
| 2 | 🔴 | 已落地 | `docs/core/design/DOC-CHECK.md` §2.10.1 表 `edit` 行 zones 格逐字含「**∪ 触达账各档的改动区**」；`docs/core/design/BATCH-RECORD.md` §4.9 门 ④ 逐字「各交哪些档、哪些区 = 同档 §2.10.1「各次调用各交什么」表（本档不重述）」 |
| 3 | 🔴 | 已落地 | `STOCK_LINE` 在盘逐字「存量命中 ${n} 条（不属本次改动区，不阻断交付；整档读数）」；A1 两合取（明示面该档 `✗` 行 0 条 ∧ 回执行逐字 = `STOCK_LINE(1)`）读码可分红绿：改前该档命中经 `blocks` 的 region 支不阻、落明示面逐条；改后走引擎 `stockHits` 只出计数 |
| 4 | 🟡 | 已落地 | §2「集成测试设计」读面点名 `test/rtm/guard.md` 的 7-3 ∥ 7-16 ∥ 7-17——三行在盘，断的正是「存量命中 1 条（…）」与「触达账改动区（锚 1 条）」；破/冗余/缺 各带理由 |
| 5 | 🟡 | 已落地 | §2 状态行「E2 已裁 = 丙-1」；§2 全文零「需用户裁」、零上抛项节（该二串只余第 1 轮表内） |
| 6 | 🟡 | 已落地 | §2「勘察证据行」八条逐条缀 **相关**，末条库外 = **无相关** |
| 7 | 🟡 | 已落地 | §2「最近先例」首条「先例批 = `docs/batches/2026-11-07-touched-gate-scope.md`」——该档在盘 |
| 8 | 🟡 | 已落地 | §2「夹具」（临时 git 仓 ∥ 基提交 ∥ 批档 §1 写 `批起 sha`）∥「前置读数」（读不到逐条 `✗` ⇒ 夹具落 `unknown`/`whole`、A1 假绿、本条作废重造） |
| 9 | 🔵 | 已落地 | 验收节标题逐字「A1 ∥ A2 ∥ A5 能红；A3 ∥ A4 是零回归护栏，方向 = 改后仍拒」 |
| 10 | 🔵 | 已落地 | §2「E1·改法」括注「`zoneTablesOf` = 本档既有局部函数」（实读该档 = 局部 `function zoneTablesOf`）+「同笔改它的头注」——该头注句在盘逐字「`edit` 只交批档本体（替换区），触达账各档交给 `blocks` 逐条判」 |
| 11 | 🔵 | 已落地 | §2「射程限定（`kind` 四态）」+「已知项」首条（`unknown` 态改后仍逐条列，须单独立项） |
| 12 | 🟡 | 新报 | 自报写面外两笔：`docs/core/design/DOC-DISCIPLINE.md` §3.20「② 态的出路（未跟踪档）」在盘、判据零改（属射程，受影响文件表第 7 行已列）；同档「名物分开」句现读占位形「带目录段的形如 `<dir>/<name>.md`」，该笔未进受影响文件表 ⇒ 表不全，收口「清单外零改动」对不上 |
| 13 | 🟡 | 新报 | 存量字面漂移（改前在盘，本批未动）：`docs/core/design/DOC-DISCIPLINE.md` §3.20「命中分流」括号内 ∥ 用例表 DD-214 ∥ DD-217 仍写「触达账存量命中 N 条」，而 `STOCK_LINE` 实出无「触达账」前缀、句尾异 |
| 14 | 🔵 | 新报 | A3 ∥ A4 的夹具形态未写（夹具节自称「A1 ∥ A2 ∥ A5 共用」） |

判读 ① 第 12 笔的语义面：占位形是该档自己立的修法（§3.28 AB-3 尖括号占位 ∥ 该节「改成不指真档的占位形」），句义「带目录段的 ⇒ 免不到」未变；操作数族第七名仍逐字保存在同档逐字目标形围栏内 ⇒ 不是「删句换绿」。

判读 ② 第 13 笔不阻断：本批 A1 锚的是 `STOCK_LINE`（与 `test/rtm/guard.md` 7-3 ∥ 7-16 同串），落地方向正确；错字面只在用例表与分流句的引文。

VERDICT: pass

计数：🔴 0 · 🟡 3（第 13 笔为存量）· 🔵 2（新增）；第 1 轮 11 条：11/11 已落地

## §4 用户批准（主 agent）

## 用户批准（主 agent）

**这批的起点不是我的判断，是 VSC 端报上来的一个缺陷**：`batch({action:"edit"})` 含死指针的行改不掉。用户 14:29 转来，说「这是 vsc 端说的」。

时间线与每次原话：

```
2026-11-11 14:29  「这是 vsc 端说的」            → 接入，我读码定位
2026-11-11 14:31  「你处理吧」                  → 批准开批并自行处置
2026-11-11 15:07  「评审，自动推进，有问题现场处理别挂账」 → 授权全链自动推进，余项当场修
2026-11-11 15:48  「操！这两个先干完」           → 指定先收尾 #2335 ∥ #2336
```

**批准范围 = §2 的 E1–E9、K1–K8 与验收 A1–A5**（分拆 K1–K6 由评审打回后补入，K7/K8 由实施席与设计席在修正轮报出并经父侧裁定加入）。

**设计评审两轮**：第 1 轮 `changes-required`（3 🔴 ∥ 5 🟡 ∥ 3 🔵）→ 第 2 轮 `VERDICT: pass`（0 🔴，新报 3 条非阻断）；其后修正轮 N1–N4 与 K7/K8 的判罚均由父侧裁定。

**不在本批范围内**：`#115`（跨仓解析按会话锚解路径）—— 报方所列的上游原因，`unverified`，另轮。`append` 面同病 —— 只报不改。

## §5 实施记录（eng-coder）
**状态行**：实施完成（E1 与三族分拆同批落完 · K7 修正轮已落（四族环 = 0、safeRead 单源）· K8 修正轮已落（pathKey 单源、本族零重复定义）· 审计 1 轮 + 代码评审 2 轮，终态 clean）



### 交付摘要

本笔两件事同批同面（先搬后改，K6）：

- **E1**：`batch` 的 `edit` 面把触达账各档的改动区一并交给引擎——与 `append` 同一个 `zoneTablesOf`、同一张扩区表。改后区外存量由引擎的 `stockHits` 计数、只出一行 `STOCK_LINE`，不再以逐条 `✗` 进明示面。
- **分拆**：`thincoder-core/agent-tools/batch-gate.mjs` 由 621 行降到 352 行；命中行组装 ∥ 判集分腿 ∥ 报面组装三族各独立成档；`blocks` 由 `evaluate` 内的闭包原样提为纯函数（入参 = 改动区表 ∥ 面别 ∥ `pureDeleteStock`），三态判定表达式与顺序逐字照搬。

### 需求覆盖表

| # | 状态 | 要求（§2 的条目） |
|---|---|---|
| 1 | ✅ | E1：`edit` 面 `zones` = 批档本体替换区 ∪ `zoneTablesOf(regions, touched)`，零新判据/常量/依赖 |
| 2 | ✅ | 同笔改 `zoneTablesOf` 头注里那句「`edit` 只交批档本体」——改后为假，已换成「`edit` 与 `append` 同交触达账各档改动区；批档本体另交替换区」 |
| 3 | ✅ | 分拆三族成三档（`batch-gate-hit.mjs` ∥ `batch-gate-judge.mjs` ∥ `batch-gate-report.mjs`），本档余 `runBatchGate` ∥ `evaluate` ∥ 范围解析 ∥ 共享小件 |
| 4 | ✅ | 不变式三条：导出面不减（`runBatchGate` ∥ `gateReceiptLine` ∥ `gateRefusalMessage` ∥ `pointerCells`）∥ 搬迁符号体逐字 ∥ `blocks` 三态逐字 |
| 5 | ✅ | 单测 A1–A5（新增 · 收口随批删 · 零留存） |
| 6 | ✅ | 分拆行为不变：§2 点名的四档集成用例本席实跑 18/18（父侧收口面照旧再跑一次） |
| 7 | ⚠️ | 受影响文件表漏一行：`test/integration/doc-check-citation.test.mjs` 被改（源面直读改指），表里没有它——理由见 D4 |
| 8 | ⚠️ | 设计档三处旧坐标未改（不属本席笔域，见「收口交接」）；本席只报不改 |

### 读数与复跑命令

```text
改前红（E1 那一行落之前，同一夹具，cwd = 仓根）：
  node --test docs/batches/2026-11-11-batch-edit-touch-zones.test.mjs
  ⇒ tests 5 · pass 3 · fail 2
  ⇒ A1 ∥ A5 红，形态 = 明示面逐条列：'✗ 锚·档缺 docs/notes/design.md:3 `docs/notes/old-gap.md`（缺「old-gap.md」）（根：…）'

改后（同一命令）：
  ⇒ tests 5 · pass 5 · fail 0

分拆行为不变（四档集成用例 = §2 验收那四档）：
  node --test test/integration/batch-close-gate.test.mjs test/integration/batch-touched-region-gate.test.mjs test/integration/batch-edit-spec-section.test.mjs test/integration/doc-check-citation.test.mjs
  ⇒ tests 18 · pass 18 · fail 0

末次复跑（单测 + 四档集成同一次进程）：
  ⇒ tests 23 · pass 23 · fail 0

行数读数（量法 = doc_check 的 lines；数值语义单源 = docs/core/design/DOC-GRAPH.md §3）：
  batch-gate.mjs 352（改前 621）· batch-gate-hit.mjs 166 · batch-gate-judge.mjs 56 · batch-gate-report.mjs 113 · 单测档 211
  ⇒ 合计 5 档：其他检查硬线 0 · 设计器硬线 0 · 未越线 5

符号体逐字（对 git show <批起 sha>: 原文本，逐符号取体比对）：
  ⇒ verbatim 25/28；差额 3 = 三处单行箭头（emptyRange ∥ errorState）被我第一版比对脚本截断 + pathKey 只多了 export 关键字；
    逐条复核后 28/28 正文逐字相同（blocks 三态体另比一次：逐字相同）
```

### 决策披露表

| # | 决策 ∥ 偏差 | 依据与代价 |
|---|---|---|
| D1 | 四个消费档的 import 一行未改；`gateReceiptLine` ∥ `gateRefusalMessage` ∥ `pointerCells` 由本档再出口 | §2 不变式；代价 = 本档多两行再出口，`pointerCells` 当期零外部消费者（只为守住导出面） |
| D4 | 改 `test/integration/doc-check-citation.test.mjs` 的源面直读（`batch-gate.mjs` → `batch-gate-hit.mjs`） | `ANCHOR_CLASSES` 随族搬走，原读面必红，而 §2 要求这四档全绿；断言正则与判词一字未改、仍咬得住（该串在 `batch-gate-hit.mjs` 逐字在盘） |
| D5 | 行为面微调：`edit` 面成功回执那句附注由「锚类只判本次替换区」改为「锚类只判本次区表（替换区 ∪ 触达账各档改动区；区外命中出存量读数）」 | E1 之后原句为假——回执会告诉作者一条已不成立的判法。全仓无断言读这串 |
| D6 | 区表合成次序：触达账各档先铺、自档那一键最后落 | 与「替换区 ∪ 触达账各档改动区」同一张表、行为零变；代价 = 多一层 spread，换来自档键永不被别处覆盖 |
| D7 | 设计档三处旧坐标只报不改 | 设计档 = 设计席笔域（D1 路由）；本席改它就是越笔 |

### 审计与评审

- **内部偏离审计（explore · 只读）1 轮**：`DIVERGENCE VERDICT: findings(7)`——E1 与分拆本体零偏差。7 条 = 1 条受影响文件表漏行（D4）+ 3 条设计档旧坐标 + 3 条小项（共享小件归属 ∥ §5 读数落点 ∥ 头注把四个消费档写成三个）。**当场修 1 条**：头注计数已改四。
- **代码评审（advisor · code）2 轮**：第 1 轮 `VERDICT: pass`，🔴 0 · 🟡 3 · 🔵 1。**当场修 1 条**（🔵 区表次序 ⇒ D6）；另 3 条是记录∥归属面：D4 ∥ 共享小件归属 ∥ §5 读数落点（本节即落点）。第 2 轮（K8 后）`VERDICT: pass`，🔴 0 · 🟡 1 · 🔵 1——🟡 = §2 的 K8 证据句因本笔删除而失效（设计席笔域，入「收口交接」）；🔵 = 本节那枚 `D2` 死指针，**当场修**。
- **修正轮次 = 4 轮**（审计后 1 轮 · 评审后 1 轮 · K7 后 1 轮 · K8 后 1 轮），每轮后复跑；末次读数见「修轮 K8」节。
- **终态 = clean**。

### 清单外改动（逐笔）

1. `test/integration/doc-check-citation.test.mjs`——源面直读改指（理由 = D4，断言本体未动）。
2. 仓根临时日志（`node --test` 输出转存，多个 `.tmp-*.txt`）：读完即删，**盘上现零留存**（审计实读为不存在）。

### 收口交接（父侧）

- **设计档三处旧坐标**（本席未改）：`docs/core/design/BATCH-RECORD.md` §4.22「新名三问」仍写 `pointerCells` 在「`batch-gate.mjs` 的 `hitEntries` 旁」；同节「受影响面」仍把 `pointerCells` ∥ 拒文四件组装记在 `batch-gate.mjs` 下；`docs/core/design/DOC-DISCIPLINE.md` 用例表那行仍写「`batch-gate.mjs` 的 `hitEntries`」。三处的符号现已住 `batch-gate-hit.mjs`。同节相邻的「勘察证据行」设计席已改成「分拆后独立成档」，这三处是同一笔的漏项。
- **受影响文件表补一行**：`test/integration/doc-check-citation.test.mjs`（D4）。
- **§2 的 K8 证据句失效**（本席未改）：K8 行第二句逐字引本档被删掉的那份本地定义作证据，删后该引文在盘上不存在，`doc_check` 判 `引缺` 1 条 ⇒ 整档门禁拒写。§2 = 设计席笔域，请父侧路由：改成不指原文的陈述形，或改引 §5「修轮 K8」段。
- **本批新债**：无。E1 与分拆都在本批内落完；`append` 面 ② 态同病与 `#115` 按 §2 边界外排，不是本笔新债。

### 修轮 K7 · 反向 import 消除（同批接续）

**落点（照 §2「修轮 1」③ 甲：零新档、零判据改动、不新增第四档）**：

| 档 | 改什么 |
|---|---|
| `thincoder-core/agent-tools/batch-regions.mjs` | `safeRead` 由本地函数改为 `export`（单源住这里——它本就 import 了 `node:fs`）；档内其余一字未动 |
| `thincoder-core/agent-tools/batch-gate.mjs` | 删本地的 `pathKey` ∥ `safeRead` 定义与导出，改从既有单源取（两条 import 见下码块）；头注第 51–54 行同步写实 |
| `thincoder-core/agent-tools/batch-gate-hit.mjs` | 两条 import 换源（路径键取判域族的导出、读档取 `batch-regions.mjs` 的导出，见下码块），注释同步 |
| `thincoder-core/agent-tools/batch-gate-judge.mjs` | 一条 import 换源（路径键取判域族的导出，见下码块），注释同步 |

换源后的 import 与导出（逐字，摘自盘上四档）：

```text
batch-gate.mjs       import { pathKey } from "../doc-check/per-root.mjs"
                     import { committedDocs, pureDeleteStockEntries, safeRead, touchedRegions } from "./batch-regions.mjs"

batch-gate-hit.mjs   import { pathKey } from "../doc-check/per-root.mjs"
                     import { safeRead } from "./batch-regions.mjs"

batch-gate-judge.mjs import { pathKey } from "../doc-check/per-root.mjs"

batch-regions.mjs    export function safeRead(abs) {
```

**终态**：对外导出面零改（四个消费档一个 import 行都没改）；共享小件零重复定义——`pathKey` 住 `thincoder-core/doc-check/per-root.mjs`、`safeRead` 住 `thincoder-core/agent-tools/batch-regions.mjs`，各一份，族档与编排档一律 import 这两处。

**读数（命令 + 结果，cwd = 仓根）**：

```text
① 建图取强连通分量（做法 = 逐档正则取 from "…" 的相对说明符、node:path 归一后建图、Tarjan 取 SCC；
   射程 = thincoder-core/** 的 313 档）
   改前：含四档的强连通分量 1 组（hit ∥ judge ∥ report ∥ gate 四点同组）∥ 指向编排档的反向边 2 条
   改后：含四档的强连通分量 0 组（四档各自都不在任何 size>1 分量里）∥ 指向编排档的反向边 0 条
   同一条命令的旁读数：size>1 分量总数 6 → 5（其余几组与四档无关、本来就在）
   指向编排档的入边改后只剩四个消费档：batch-closeout ∥ batch-lifecycle ∥ batch-record-write ∥ batch-supersede

② Select-String -Path thincoder-core/agent-tools/batch-gate.mjs -Pattern 'const pathKey'
   ⇒ 0 命中（该档不再自持路径键）

③ node --check（编排档 ∥ hit ∥ judge ∥ regions 四档）
   ⇒ 四档全 OK

④ node --test test/integration/batch-close-gate.test.mjs test/integration/batch-touched-region-gate.test.mjs
     test/integration/batch-edit-spec-section.test.mjs test/integration/doc-check-citation.test.mjs
   ⇒ tests 18 · pass 18 · fail 0

⑤ node --test docs/batches/2026-11-11-batch-edit-touch-zones.test.mjs（E1 的 A1–A5，换源后回归）
   ⇒ tests 5 · pass 5 · fail 0

⑥ safeRead 单源清点（全仓 *.mjs 搜定义与导入）
   ⇒ 定义 1 处（batch-regions.mjs）· 导入 2 处（batch-gate.mjs ∥ batch-gate-hit.mjs）· 同体重复已消除
```

**行数读数（量法 = `doc_check` 的 `lines` 面；D15 一把尺；取数时刻 = 本笔末次编辑之后）**：

```text
  352  thincoder-core/agent-tools/batch-gate.mjs
  168  thincoder-core/agent-tools/batch-gate-hit.mjs
   57  thincoder-core/agent-tools/batch-gate-judge.mjs
  113  thincoder-core/agent-tools/batch-gate-report.mjs
  218  thincoder-core/agent-tools/batch-regions.mjs
合计 5 档：其他检查硬线 0 · 设计器硬线 0 · 未越线 5
与父侧改前读数（354 ∥ 166 ∥ 56 ∥ 113）对比：编排档 -2、`hit` +2、`judge` +1、`report` 零变；
增行都落在「注释 + import 换源」那两处，删行是两份定义。
```

**清单外改动**：无（本笔只动上面四档，四档都在本席声明的写域内）。

**设计档漂移（只报不改，笔域 = 设计席）**：§2「受影响文件」表第 1 行与「留档面」条仍把 `pathKey` ∥ `safeRead` 记作编排档自持的共享小件；K7 落地后该档只余 `isDocPath`（`docPaths` 已另列）——这两处读起来仍像「共享小件住编排档」，与盘上相反。

**顺带项（未做，交父侧裁）**：`batch-regions.mjs` 仍自持一份 `pathKey`（与 `doc-check/per-root.mjs` 的导出同体、逐字相同）——K7 只收敛了 `safeRead`。今日两份逐字相同 ⇒ 无行为差；但它是 K7 采甲的同一理由（各写一份必然漂），日后一边改形会让区表键与查询键不再相等，`blocks` 便落进 fail-closed 支。改法 = 一行换源、行为零变。

**评审（advisor · code）1 轮**：`VERDICT: pass`，🔴 0 · 🟡 0 · 🔵 3（① 上述 `pathKey` 顺带项 ∥ ② `hit` 经 `batch-regions.mjs` 连带载入引擎侧——`blocks` 一路已达隔离、`hitEntries` 一路未达 ∥ ③ 读图按 import 行取边、勿以头注散文计边）。三条都不要求改动，终态 = **clean**。
**未复跑项**：无——①–⑥ 六条读数均本席实跑。

### 修轮 K8 · `pathKey` 收进同一单源（同批接续）

**落点**：`thincoder-core/agent-tools/batch-regions.mjs` 删掉本地 `const pathKey` 与它那行头注，改为从 `thincoder-core/doc-check/per-root.mjs` 的既有导出 import；该档 11 处调用一字未动，判据零改。

**为什么**：K7 只收了 `safeRead`，留一半等于留一个「已收过口」的错觉。区表键产在本档、查询键用在编排档，两份逐字同体时无行为差；日后一边改形就不再相等，`blocks` 落进 fail-closed 支——不是崩，是悄悄全拒，最难查的一类。

**读数（命令 + 结果，cwd = 仓根）**：

```text
① grep "const pathKey" thincoder-core/agent-tools/
   改前：1 命中（batch-regions.mjs:23 的本地定义）
   改后：0 命中

② 建图取强连通分量（同 K7 那条命令、同射程 = thincoder-core/** 的 313 档）
   改前：size>1 分量 5 · 含四档的分量 0 · 指向编排档的反向边 0 · batch-regions → per-root 边 = 无
   改后：size>1 分量 5 · 含四档的分量 0 · 指向编排档的反向边 0 · batch-regions → per-root 边 = 有
   环的旁证：per-root.mjs 的出边只有 manifest.mjs 一条；manifest.mjs 的 import 是 manifest-schema ∥
   manifest-discovery ∥ log ∥ node 内建——都不进 agent-tools/

③ node --check（batch-regions ∥ batch-gate ∥ batch-gate-hit ∥ batch-gate-judge ∥ batch-gate-report）
   ⇒ 五档全 OK

④ node --test docs/batches/2026-11-11-batch-edit-touch-zones.test.mjs
   ⇒ tests 5 · pass 5 · fail 0

⑤ node --test 四档集成（batch-close-gate ∥ batch-touched-region-gate ∥ batch-edit-spec-section ∥ doc-check-citation）
   ⇒ tests 18 · pass 18 · fail 0
```

**行数读数（量法 = `doc_check` 的 `lines`）**：`batch-regions.mjs` 218 行，与改前同数——删 3 行（本地定义 + 它的头注 + 一个空行）、加 3 行（换源 import + 两行理由注）。

**清单外改动**：无。本笔只动 `batch-regions.mjs` 一档，在声明的写域内。

**本笔让一处证据句失效（只报不改）**：§2 的 K8 行第二句逐字引本档被删掉的那份本地定义作证据；删后该引文在盘上不存在，`doc_check` 判 `引缺` 1 条。§2 是设计席笔域，本席不改，交父侧路由。

## §6 验证与收口（父代理）

## 验证与收口（主 agent）

### 父侧复跑（不是转述实施席的读数）

```
本批单测（收口前跑，跑完即删）    node --test docs/batches/2026-11-11-batch-edit-touch-zones.test.mjs     5 / 5 pass
四档集成                        node --test batch-close-gate ∥ batch-touched-region-gate
                                         ∥ batch-edit-spec-section ∥ doc-check-citation           18 / 18 pass
五档 node --check               batch-regions ∥ batch-gate ∥ hit ∥ judge ∥ report                 全 OK
doc_check(mode:"gate") 本批档                                                                   PASS · 0 段有问题
```

**行数读数**（量法 = `doc_check` 的 `lines` 面，取数于末次编辑之后）：`batch-gate.mjs` 354 ∥ `batch-gate-hit.mjs` 168 ∥ `batch-gate-judge.mjs` 57 ∥ `batch-gate-report.mjs` 113 ∥ `batch-regions.mjs` 218 —— **五档全在 500 线下**。

### 交付了什么

| 目标 | 条目 | 落点 |
|---|---|---|
| E1 读数口径 | E1 | `edit` 面 `zones` = 批档替换区 ∪ `zoneTablesOf(regions, touched)`，与 `append` 同函数 |
| 档层分拆（当批） | K1–K6 | `batch-gate.mjs` 621 → 354；新增 hit ∥ judge ∥ report 三族档 |
| 消环 | K7 | 反向 import 2 条 → 0；含四档 SCC 1 组 → 0 |
| 共享小件单源 | K8 | `pathKey` 本族本地定义 1 → 0；`safeRead` 重复一份消除 |

### 两处「我在中途说错的」与更正

- 我说「三条环」：实读是 **1 个 SCC + 2 条反向边**，`report.mjs` 那处命中的是头注散文而非 import 行。设计席用 Tarjan 建图纠正了我。
- 我说「先提交再改」能解未跟踪档：**不成立** —— 收口面查的是**基线提交**，本批新建的档在基线里本就不存在，提交后仍是 `kind:"whole"`。这条已作废，另记 `#2338`。

### 本批新债

**代码面 0 条**（范围内无遗留）。

**范围外一条已入账**：`#2338` 收口门「未跟踪 ⇒ 整份都是本批的笔」跨批为假——与本批 E2 同一条前提，在收口面还有一处。只报不改。

### 未做的

```
append 面同病（同样不交 whole 的 zones、blocks 同样整档断）   只报不改
#115 跨仓解析按会话锚解路径                                  另轮
```

### 收口结论

读数口径与 `append` 对齐；分拆与消环均落地并有可红验收；五档全在 500 线下；本批档 `doc_check` gate PASS。**本批单测档已按零留存删除。**
