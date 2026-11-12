# 2026-11-11 · gate-silent-when-pass
> 六段，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 每段只有一个作者：作者的段可 `append` 加内容、可就地改（`edit`）；非作者一概拒。
> 编制：主 agent · 2026-11-11 · 来源 = 来源 = 用户 2026-11-11 16:12「你干脆不拦的地方就别瞎几把报数了，你他妈现在最大的问题就是信息爆炸」+ 16:13「对，不拦截的地方就别报数了。开批」。现场 = VSC 端四类拒面中大量是「不阻断但逐条列清单」，执行席据此长出「拆成单行写」的 workaround。。
> 台账 = #2339（core · 归批）。前情 = 无（独立批）。
## §1 讨论（主 agent）
**状态行**：已收口 2026-11-12
批起 sha = 48482678ab9c708d3eaf63d5d49f520d2041ae34
<§1 模板占位：本批条目 / 关键判据 / 授权口径>

## 讨论纪要（主 agent）

用户 2026-11-11 16:12：「**你干脆不拦的地方就别瞎几把报数了，你他妈现在最大的问题就是信息爆炸，给的信息太多。**」16:13：「对，不拦截的地方就别报数了。开批。」

### 现场（父侧读码）

`thincoder-core/agent-tools/batch-gate.mjs` 的回执分两层：**判决**与**读数**。判决只有一条 —— `k >= 1` 才是 `REFUSED`；其余全是「不阻断但照样出数」。今天出数的有四类：

```
存量计数 + 逐条 ✗ 行      stockCount = disclosed.length + res.stockHits.length
指针读数 + 逐条清单        pointerReads（证据格里解不到的指针）
环引读数                   CYCLE_READ_LINE(res.cycleReads.length)
不同序读数                 drift（显示面与引擎报面漂移）
```

**四类都不阻断，却都在 `PASS` 的回执里占行、占清单。**

### 这条裁定与刚收口那一批相反，必须写明

`#2335` 刚把 「区外存量只出一行计数、不逐条列」 当作交付（单源 = `docs/core/design/DOC-DISCIPLINE.md` `DD-217`：「区外存量不阻写、**仍明示**」）。**用户现在的裁定是那句的反面：不拦就不出数。** 所以本批不是加一条，**是撤一条**——`DD-217` 的「仍明示」与 `STOCK_LINE` 的存废都要跟着改。

### 已定决定

- **已定决定**：`k = 0` 时回执行只有一行 `PASS`，四类读数一律不出 · 用户原话：「对，不拦截的地方就别报数了」 · 时间：2026-11-11 16:13
- **已定决定**：`k >= 1` 时只出强制那几条 + 一句总数，**不列存量清单** · 同上 · 时间：2026-11-11 16:13

### 代价（要认下来）

存量缺陷在**写入面**彻底不可见。兜底只剩两处：**收口那一次整档判**，与 `doc_check` 的 `report` 面（显式要才给）。**这是用户已知并接受的代价**——「信息爆炸」比「看得见」更贵。

### 边界

- **不动判决**：`blocks` 的判定、`k` 的算法、三个面的取区口径一律不改。
- **不动 `report` 面**：`doc_check(mode:"report")` 的清单照旧——它是显式问的那一面。
- **收口面**：判不出改动区的档**不入判集**（E7）。收口仍是最后一道，但「判不了 ⇒ 整档判」这条撤掉——多仓批次与搬迁批否则永远收不了口（VSC 端 16:27 现场）。

### 父侧补正：射程从「不报数」改成「撤掉概念」

用户 16:14：「**我他妈的根本没问过你存量的问题，所有为存量出来的折腾，全是你他妈的自己的过度工程！**」

**这句话是对的，本批射程因此重写。**

「存量」不是一个需求，是我在设计判域时自己引入的分类：先把一批与本次无关的命中认定为「存量」，再为它造一套「不阻断但明示」的输出。**用户从来只要一件事——与本次改动无关的旧债别拦我。** 而「别拦」的正确实现是**不把它纳入判定**，不是**纳入之后判它不阻断再报出来**。

### 要撤的（逐件点名它当初为什么存在）

```
STOCK_LINE 常量与全部消费面
  本来为解决「区外存量看不见」——而那个问题不该存在：区外本来就不该进判域
stockCount ∥ disclosed / forced 的存量分家
  本来为把「本条」与「旧债」分成两个桶——两个桶都只为了印一份清单
pureDeleteStock 与整套基线映射
  本来为救「扩区把邻段拉进判域」——邻段本来就不该进来
DD-217「区外存量不阻写、仍明示」
  整条是我写的，不是用户要的
```

### 改后的判据（只剩一句）

**判本次改动区内的命中。区外的不判、不算、不印。**

**验收按「删掉多少行」计，不按「加了多少」。**

### 父侧补记：三处判据外延（VSC 端 16:27 ∥ 16:35 两笔现场并入本批）

用户 16:16：「**你再仔细盘点一下整个项目范围，别他妈的挂一漏万，说到那里改到那里，别处还有没有残留，一起都改了。**」据此把下面三件并入本批射程——它们与本批治的是同一个病（判据范围选错），分两批修必然改出两套口径。

**已定决定**：本批判据 = 判本次改动区内的命中，区外不入判集 · 用户原话：「对，不拦截的地方就别报数了」 · 时间：2026-11-11 16:13

#### 外延一：收口面的整档回落（VSC 现场）

```
同一份记录、同一时刻：
  batch append §6  →  PASS · 范围 6 档
  batch close      →  REFUSED · 659 条
三件命中件 git ls-files --error-unmatch 全部解得出（已跟踪、基线里都有）
```

**收口判集里有两类档必然回落整档**：跨仓档（基线 sha 是 A 仓的，在 B 仓解不出 ⇒ `kind:"unknown"`）、整件搬入（`git mv` 进仓 ⇒ 基线里没有它 ⇒ `kind:"whole"`）。`blocks` 收口支 `kind !== "region" ⇒ return true` 把两者一并整档判。

**判据**：判不了 ⇒ **不入判集**，不是整档判。多仓批次与搬迁批否则永远收不了口。

#### 外延二：提示词与工具描述在误导（VSC 原文，两处）

```
doc_check 的 gate 描述："Every listed document is judged **whole**: …"   无条件、无例外
另一处："本轮动过的档，收口判整档。"                                     漏了「区未定 ⇒ 回落」
```

**这两句让 VSC 去清别人的 659 条、又补派两件不该做的活。** 描述面要与行为面同源：直接调用判整档、批档门内判改动区、区未定才回落。

#### 外延三：拒文要说出路

`close` 被拒那行只说了「区未定 ⇒ 整档判」，没说怎么让区定下来。**读回执的人只知道未定，不知道往哪走。** 拒文补一句可操作的话（跨仓档需在该仓自己的批起 sha 上解析 ∥ 搬迁需能被识别）。

### 已定决定：判据只有两种结局——拦，或者根本不出现

**已定决定**：门内不存在「不拦但报数」这一档；不拦的判据类**连计数都不出** · 用户原话：「不拦截的就不要报数……人家收到一个没意义的数据还要想半天，不定做出什么判断，没事儿吓唬人家干嘛！」 · 时间：2026-11-11 16:37

父侧原拟「降为只出读数」被此裁定否决——**换个位置报仍是报。**

```
拦（保留阻断）  档缺 ∥ 引缺 ∥ 节缺 ∥ 段落长 ∥ 行太长
不出（不拦不报）行号坐标 ∥ 跨仓未声明 ∥ 裸档名
```

**分列标准 = 判得准不准，不是值不值**：拦的五类都数得准；不出的三类误报都来自判不准（坐标要换算、跨仓要猜根、裸档名要猜目录）。

`doc_check(mode:"report")` 不动：那是显式问才出的清单，与门内回执不是一回事。

### 已定决定：相对路径按指出它的档所在目录解；仓外一律不判

**已定决定**：相对路径（`./` ∥ `../` 开头）按**指出它的那份档所在目录**解析，不按仓根 · 用户原话：「B 你处理掉啊」 · 时间：2026-11-11 16:53

**现场**：这一类写法相对的是引用方所在目录，按仓根解永远解不到 ⇒ `档缺`。这不是误报策略，是**解析方向错了**。样本（本批 §1 上一笔就这样被拒，两行原文如下）：

```text
../doc-check/per-root.mjs
../manifest.mjs
```

**已定决定**：死指针**只判仓内**，仓外的一律不判 · 用户原话：「死指针只判舱内的，仓外的不要判了，不归你管的地方，你想管也管不住」 · 时间：2026-11-11 16:53

**射程**：`../` 出仓的路径 ∥ 仓外配置（如用户目录下的文件）∥ 未声明同级仓 ⇒ **不入判、不出命中**。判得着的只有仓内的档——**判不了就别判，判了也只是噪音**。

- **已定决定**：档位登记的读法改为「设计席必须在交付里逐档报出每个代码档的**原始行数**（`doc_check` 的 `lines` 读数，判域 = 该档全部行、末行换行不计），只报这一个数，不报改前 ∥ 改后 ∥ 增量等其它数」——理由 = 不强制它先读行数，它就会无视拆档纪律；设计档正文仍不携绝对读数（D12），读数落在设计席的交付面（批档 §2 的档位登记段） · 用户原话：「如果不要求它先读行数，他就会无视拆当纪律，要要求它的输出里包含每个代码文件的原始行数，不要报其他数」 · 时间：2026-11-12 12:43

- **已定决定**：上一条（12:43）里「读数 = `doc_check` 的 `lines` 面」一句作废——该面随本批 `doc_check` 重写已退场（`thincoder-core/doc-check/` 全目录对该串零命中，本轮实读）。**改按现有唯一那把尺：内容行数（末行换行不计），实现单源 = `thincoder-core/agent-tools/batch-tier-gate.mjs` 的 `countContentLines`。** 判据不变（设计席交付里逐档报原始行数，只报这一个数） · 依据 = 设计席上抛 + 本轮实读 · 时间：2026-11-12 13:03

## §2 批次任务与设计（eng-designer）
**状态行**：设计完成（修正轮累计七件已落。前四件 = §10.2 补解析尺与 settle 面拒签两句、三问表补 designSealHash、§10 档位登记升八档并给 advisor-async.mjs 分拆方案；本轮三件 = §10 分拆方案补全依赖六项、把「不成环」改成实况（两档单向 + 与 async-settle.mjs 的既有环、环数不变）、拆出族「只读」改「对池与队列只读」。代码零改、需求档零改）
<§2 模板占位：本批条目（覆盖） / 设计档落点 / 机制设计 / 受影响文件与测试覆盖 / 验收对照 / 关键决策 / 上抛项>

### 1 判据一句（本批唯一的口径）

**门的判集 = 本次改动区内的命中；区外的不判、不算、不印。**

一处推论：命中不在改动区内 ⇒ 它**不在判域**，不是「拦了但只明示」。今天代码里那一层「区外 ⇒ 分类成存量 ⇒ 单列/单个计数」是把「不在判域」写成了「判过、判为别人」。本批删的就是这一层。

用户原话（2026-11-11 16:14）：「我他妈的根本没问过你存量的问题，所有为存量出来的折腾，全是你他妈的自己的过度工程！」——本批治的是**概念多余**，不是输出太吵。

### 2 本批条目

| # | 条目 | 落点 |
|---|---|---|
| E1 | 判据一句落到 `blocks`：去掉 `pureDeleteStock` 入参，只剩「这条命中落在本次改动区内吗」+ 面别倒向 | `thincoder-core/agent-tools/batch-gate-judge.mjs` |
| E2 | 「存量」在引擎面撤除：`STOCK_LINE` 常量 ∥ `stockHits` 桶 ∥ 两处出场（gate 面 ∥ report 面）∥ 写前门的消费行 | `thincoder-core/doc-check/index.mjs` ∥ `thincoder-core/tools/doc-write-gate.mjs` |
| E3 | 「存量」在门面撤除：`stockCount` ∥ `disclosed`/`forced` 分家 ∥ 拒面「—— 区外存量命中…」整块 | `thincoder-core/agent-tools/batch-gate.mjs` ∥ `thincoder-core/agent-tools/batch-gate-report.mjs` |
| E4 | 纯删基线映射整族撤除：`pureDeleteStockEntries` ∥ `gitFileText` ∥ `survivingLineMap` ∥ 基线那一跑（`texts` = 基线全文）；零宽 hunk ⇒ 该档交**空区表**（本笔零命中），不是「不交」（不交 = 引擎按整档判） | `thincoder-core/agent-tools/batch-regions.mjs` ∥ `batch-gate-judge.mjs` 的 `zoneTablesOf` |
| E5 | 不拦却印的行撤除：`pointerReads` 行 ∥ 环引行在门的出场 ∥ `aligned`/`drift` 行 ∥「本次文本已判 N 行」行 | `batch-gate.mjs` ∥ `batch-gate-hit.mjs` |
| E6 | 文档面同步：`DD-217` 整条删除 ∥ `docs/core/design/DOC-CHECK.md` §2.9.4 的常量与三面取区句 ∥ §2.10.1「代价谁兜底」段 ∥ `docs/core/design/BATCH-RECORD.md` §4.22 的「指针读数桶」条目与 BR-88 | 三份设计档 |

### 3 撤完之后剩下什么

- **`blocks` 保留，退化成一条**：`(e) => 这条命中落在本次改动区内吗`。面别只决定倒向，倒向一个不改——收口面：该档无区 ∥ 区未定 ⇒ 不入判集（不判、不拦、不出行）；写段面：区未定 ⇒ 零强制。参数 `pureDeleteStock` 删除。传参从五件降到四件。
- **`zoneTablesOf` 原样保留**：它只回答「哪些档交出改动区」。改动一条：**区已定就交键**（今天用 `r.zones.length > 0` 过滤，零宽档因此落成「不交键」⇒ 整档判）。
- **纯删靠什么仍是改动区** = 靠 diff 自己给的**零宽定位点**。`git diff -U0` 的 `-` 侧标出被删的行，删完一处那个位置就是宽度为零的区间（`del` 侧给出行号、`replacement` 长度为零），它照样占区间表一格；扩区表拿它当定位点，落到包含它的整段 ∥ 整块上（删空行并两段 ⇒ 两段都进区）。
- **为什么不再需要基线那一套**：判集只问一个答案——「哪些行属于本次」。定位点由 diff 直接给出，就有这个答案；基线副本、存活行映射、单元端点比较那一整套是为回答「这条命中是旧的还是这批造成的」，而那正是本批撤掉的问题本身。
- **定位点无可扩单元时交空表**：例如删掉中间一整段、前后两段各自完整 ⇒ 该档交出空表，引擎按逐档语义判「每一条命中都在区外」⇒ 一条不进判（代价见 §6：并段越线也不再拦）。
- **引擎的 `zones` 逐档语义、扩区表、三条判据、阈值、命中类闭集、verdict 词**：零改。
- **区外命中在引擎里就地丢弃**：不再进任何桶（`stockHits` 桶撤除）。「算了但不留」与今天的「算了留着不印」在行为上等价，差别是后者留着一个会被重新接上的钩子。

### 4 受影响文件

**设计档（本席笔域）**

| 文件 | 改动 |
|---|---|
| `docs/core/design/DOC-CHECK.md` | §2.9.4 删 `STOCK_LINE` 的定义与三处消费面句、删「部分进 stockHits 读数桶，照列、不阻断」；§2.10.1 删「代价谁兜底」段与 append 面「不出存量」句；§2.10.1 的 `zones` 条目删 `stockHits` 桶；§2.9.9 删 C-1 ∥ C-3 ∥ C-5 三格改判；§9 三行改写 |
| `docs/core/design/DOC-DISCIPLINE.md` | `DD-217` 整条删除（用例表同行）；§3.20「命中分流」∥「两面的分工」∥「段长类的判域」三处的存量句改成判域句；§3.27 同句；§5 用例 `DD-214` ∥ `DD-219` 改判 |
| `docs/core/design/BATCH-RECORD.md` | §4.9 门 ④ 一句 ∥ §4.22「指针读数桶」条目 ∥ §4.22 增补行 ∥ BR-88 行 |

**实现面（不由本席落笔，只点名）**

```text
thincoder-core/agent-tools/batch-gate.mjs       删 stockCount ∥ disclosed ∥ disclosedLines ∥ pointerReads 行 ∥ 环引行 ∥ 不同序行 ∥ 已判行数行
thincoder-core/agent-tools/batch-gate-report.mjs  composeReport 去 disclosedLines 入参与整块
thincoder-core/agent-tools/batch-gate-judge.mjs   blocks 去 pureDeleteStock；zoneTablesOf 保留零宽档空表
thincoder-core/agent-tools/batch-gate-hit.mjs     aligned ∥ drift 退役
thincoder-core/agent-tools/batch-regions.mjs      pureDeleteStockEntries ∥ gitFileText ∥ survivingLineMap 退役
thincoder-core/doc-check/index.mjs               STOCK_LINE ∥ stockHits 退役（两处出场）
thincoder-core/tools/doc-write-gate.mjs          STOCK_LINE 消费行退役
thincoder-core/tool-docs/doc_check.md            若载了存量句，同行删除
```

**测试面（`test/**` 不属本席笔域）**

```text
test/integration/batch-close-gate.test.mjs        断言「存量命中 1 条」那一处
test/integration/batch-touched-region-gate.test.mjs  三处
test/integration/batch-edit-spec-section.test.mjs   一处
test/rtm/guard.md                                 7-3 ∥ 7-16 两行改判（见 §8）
```

### 5 验收（每条都能红；量 = 删掉多少行）

**量法与命令**（行数单源 = `doc_check` 的 `lines` 面）：`doc_check({mode:"report", docs:[<本批改动的实现档>], lines:[<同一批>]})`。**断言 = 每档改后行数 ≤ 改前**，绝对数住 §5。本批**只减不增**；任何一档行数上去 ⇒ 红。

| # | 判据（可跑） | 红侧 |
|---|---|---|
| AC-1 | 夹具 = 触达账内一档带旧悬空锚、本笔只改别处一行 ⇒ `append` 回执**只有** `[doc-check gate] DOC-CHECK GATE: PASS · 范围 N 档` 一行 | 把任何一条被删的行接回来 ⇒ 该行重现 ⇒ 红 |
| AC-2 | 符号族零残留：`grep` 于 `thincoder-core/**`，`STOCK_LINE` ∥ `stockHits` ∥ `stockCount` ∥ `pureDeleteStockEntries` ∥ `survivingLineMap` ∥ `disclosed` ⇒ 零命中（预期残留数 = 0，域 = 该 glob） | 恢复 `export const STOCK_LINE` 一行 ⇒ 命中 +1 ⇒ 红 |
| AC-3 | 纯删面：基线里邻段带旧死引文，本笔只删中间一段 ⇒ 放行、回执零附加行 | 把基线映射接回来 ⇒ 同一夹具再出计数行 ⇒ 红 |
| AC-4 | 该拦的仍拦：同夹具把悬空锚放进本笔改动区 ⇒ `REFUSED`、命中行逐条、首行按腿总数；区外那批不出现 | 把区外命中接回强制集 ⇒ 区外行也出现 ⇒ 红 |
| AC-5 | 结构断言：`blocks` 的函数体零 `stock` ∥ `disclosed` ∥ `pureDeleteStock` 标识符，只剩区成员判定与面别倒向 | 把 `pureDeleteStock.has(e)` 接回 ⇒ 命中 ⇒ 红 |
| AC-6 | 收口面同判：`close` 同夹具零附加行；区未定 ⇒ 不入判集、放行、一行覆盖明示 | 收口面改回「区外单列」⇒ 附加行重现 ⇒ 红 |

### 6 代价（认下来）

- **纯删删掉整段仍不被拦**：删掉整段、前后两段各自完整 ⇒ 无邻段可扩、该档交空表 ⇒ 本笔零命中即放行。要判它得把整条基线映射造回来，那是本批删掉的东西。**删空行并段不在此列**：并出来的那一段进区（§2.10.4「点在空行」；实现 = `judgeZones` 对零宽 ∥ 只含空行的区取紧邻两侧的段落）。**用户已知并接受**（「信息爆炸」比「看得见」更贵；本批更进一步——不为它造机制）。收口面不再有「整档判」这一态：判不出的档不入判集；唯一的机械兜底是显式 `doc_check` 的 `gate` 面（判整档）。
- **旧债在门面彻底不可见**：写入面 ∥ 收口面都不再提。兜底一处：显式 `doc_check` 的 `gate` 面（判整档）；收口面判不出的档干脆不判。
- **闸自身的一致性不再印给人看**：`aligned`/`drift` 从回执里退场，改由用例看住。今天没有业务入口能长出一条集成用例（它不是业务可观察结果），因此本批不新立集成行——这一笔以台账一行交代（§10）。

### 7 最近先例 ∥ 勘察证据 ∥ 库外

**最近先例**：`#2335`（把「区外存量逐条列」收成「一行计数」）——本批是它的反面：不再把清单收成计数，而是把「存量」这一层删掉。对齐的部分一个不丢：`zones` 逐档语义、扩区表、面别倒向、fail-closed 方向。

**勘察证据（本仓，逐处读过）**：

- `thincoder-core/agent-tools/batch-gate-judge.mjs`「`if (region.kind === "unknown") return false`」——面别倒向在 `blocks` 里，本批只删入参。
- `thincoder-core/agent-tools/batch-regions.mjs` 的 `pureDeleteStockEntries` ∥ `gitFileText` ∥ `survivingLineMap` 三个符号即纯删基线整族。
- `thincoder-core/agent-tools/batch-gate.mjs`「`const stockCount = disclosed.length + (res.stockHits?.length ?? 0)`」——存量计数由本门重分类那批与引擎桶相加。
- `docs/core/design/DOC-DISCIPLINE.md` 用例表 `DD-217`「区外存量不阻写、仍明示」——规范面的源头。
- `docs/core/design/DOC-CHECK.md` §2.9.4「存量命中 N 条（不属本次改动区，不阻断交付；整档读数）」——字面单源。

**库外**：B 类——改动面全在本仓内的 JS 与设计档，无外部依赖面；结论不涉任何外部系统的行为断言。

### 8 集成测试设计（RTM 增量）

读 `test/RTM.md` 故事索引表后按增量作答。

- **改写 = 3**：`test/rtm/guard.md` 的 `7-3`（「后半收口放行并出一行存量计数」改成「后半收口放行、回执零附加行」）∥ `7-16`（三半里带计数行的两半改成「零附加行」）∥ `test/rtm/guard.md` 的 `37-3`（环引在门的出场退场，只剩指向成环仓时照拒）。
- **冗余 = 0**：`26-x` ∥ `36-x` ∥ `44-x` ∥ `45-x` 断的是识别面 ∥ 域表 ∥ 豁免面，与本笔无交集。
- **新增 = 1**：`7-20`（故事 `CLI 7`）。**交互** = 触达账档的改动区 → 引擎判集 → 门回执；**业务可观察结果** = 一笔与旧债无关的写入，回执只有一行 `PASS`，且把悬空锚放进本次改动区时照拒；**服务需求** = `docs/core/requirements/DOC-CHECK.md` F9 ∥ AC-7；**入口** = 子代理 `batch({action:"append"})` 的回执。加这一行的依据是「问题 production 真的产生过」——用户 16:12 ∥ 16:14 两次点名。
- 用例文件落 `test/integration/`，编号先定在本节，用例名随实施轮落地。

### 9 边界（本批不做）

- 不改三条判据本体：阈值 ∥ 抽取面 ∥ 解析序 ∥ verdict 词。
- **入闸面按 §14 收窄**：三类命中不进 `hits`（行号坐标 ∥ 跨仓未声明 ∥ 裸档名）；`节缺` ∥ 段落长 ∥ 行太长 照拦——动的是哪几类出声，不是判法。
- 不改 `zones` 的逐档语义与扩区表本体（`judgeZones` 照旧消费）。
- 不改 `doc_check` 显式声明那一面（`mode:"report"`）的任何行，唯一一处例外：`STOCK_LINE` 那一行随常量一起删（它的出场条件是调用方交 `zones`，而交 `zones` 的三个调用点都在门面）。
- 不改 `doc_check(mode:"gate")` 的「没判」明示行（读不到 ∥ 跳过 ∥ 未核 ∥ 排除 ∥ 围栏内）——它们说的是「这一轮没判完」，删了就是假绿；与本批删的「判了没拦」不是一类。
- 写段面的面别倒向与 fail-closed 方向不动；**收口面的倒向随 E7 改**（判不了 ⇒ 不入判集）——这是本批唯一一处行为倒向的改动。

### 10 上抛项

1. **需求档一句话要跟着改**：`docs/core/requirements/DOC-CHECK.md` AC-7 ① 现文「批档已落段不出存量读数（可见性归 `edit` ∥ 收口两面）」——本批删掉「存量」后这句失去所指。需求档不在本席笔域，请主 agent 处置。**在这一句落地前，本批设计与该条断言两处不同口径**，请勿按旧句验。
2. **`aligned`/`drift` 退场后没有永久看护**：它不是业务可观察结果，长不出集成用例。若用户要一个永久看护，需另立一行（按「业务场景」或「生产问题」两入口，今天两条都不成立）。

### 11 清点与处置（逐档）

清点来源 = 父侧 2026-11-11 实扫（域 = `thincoder-core/**` ∥ `docs/core/**` 全部层 ∥ `test/**`，扣 `node_modules` ∥ `.thincoder/tmp` ∥ `docs/batches`）。**每处只问一句：这一行撤成什么。** 行数沿用父侧清点，本席未复算。「已读」= 本席读过该处原文；「未读」= 只拿到档名与行数，落笔前实施席按同一句核一遍再改。

#### A · 代码标识符（10 档）

| 档 | 行 | 撤成什么 |
|---|---|---|
| `thincoder-core/agent-tools/batch-gate.mjs` | 12 | 已读。`disclosed` ∥ `disclosedLines` ∥ `stockCount` ∥ `pureDeleteStock` 四个符号与它们的行全删；`pointerReads` 变量与提示行删（`e.pointerRead` 的过滤**留**——它决定拦不拦，本批不动判决）；环引提示行删；`aligned`/`drift` 解构与提示行删；「N 行已判」两行删。撤成：`forced` 即判集，回执只出强制集 |
| `thincoder-core/doc-check/index.mjs` | 16 | 已读。`stockHits` 桶与它那两处出场（`STOCK_LINE`）删；`zones` 的过滤**留**，区外命中在装配处丢弃、不返桶。撤成：`hits` 只有区内的 |
| `thincoder-core/agent-tools/batch-gate-judge.mjs` | 5 | 已读。`blocks` 去 `pureDeleteStock` 入参与 `!pureDeleteStock.has(e)`；`zoneTablesOf` 的 `r.zones.length > 0` 条件改成「区已定即交」（零宽档交空表）。撤成：一条区成员判定 + 面别倒向 |
| `thincoder-core/agent-tools/batch-gate-report.mjs` | 4 | 已读。`composeReport` 去 `disclosedLines` 入参与「—— 区外存量命中…」整块；两处注释里的存量句删。撤成：`first` + 强制集行 + 附注行 |
| `thincoder-core/tools/doc-write-gate.mjs` | 4 | 已读（import 行 + 第 255–256 两行 + 注释）。四行全删。撤成：放行时零附加行 |
| `thincoder-core/agent-tools/batch-regions.mjs` | 1 | 已读（符号面）。`pureDeleteStockEntries` ∥ `gitFileText` ∥ `survivingLineMap` 三个符号整族删；`touchedRegions` ∥ `committedDocs` ∥ `safeRead` 留 |
| `thincoder-core/prompts/persona-eng-coder.md` | 1 | 未读。提示词面 = 产品代码，本席不改：**上抛主 agent**（内容由主 agent 给，eng-coder 落盘）。该行撤成：删「区外存量只出计数」一句，**不换成任何替代措辞**（判据只在设计档） |
| `docs/core/design/BATCH-RECORD.md` | 3 | 4 处已读（§4.9 门④ ∥ §4.22 增补行 ∥ §4.22 指针读数桶条目 ∥ BR-88），另 1 处未读。逐处见 B 组同一行 |
| `docs/core/design/DOC-CHECK.md` | 14 | 4 处已读（§2.9.4 的常量与句形 ∥ §2.10.1 的代价段 ∥ C-1 ∥ C-5），另 10 处未读。逐处见 B 组同一行 |
| `docs/core/design/DOC-DISCIPLINE.md` | 10 | 8 处已读（§3.20 四处 ∥ §3.27 一处 ∥ §5 三行），另 2 处未读。逐处见 B 组同一行 |

#### B · 文档口径词（17 档）

| 档 | 行 | 撤成什么 |
|---|---|---|
| `docs/core/design/DOC-CHECK.md` | 23 | §2.9.4 整节：删 `STOCK_LINE` 的字面与「三面共用一句」的表述、删「区外的命中进 `stockHits` 读数桶，照列、不阻断」；`zones` 条目改成「区外命中丢弃」；§2.10.1「代价谁兜底」整段删、append 面「不出存量」句改「区外不入判」；用例 `C-1` ∥ `C-3` ∥ `C-5` 三格改判（后两格 = 纯删面改成「放行、零附加行」） |
| `docs/core/design/DOC-DISCIPLINE.md` | 13 | `DD-217` 整条删（用例表同行同删）；§3.20「命中分流」∥「两面的分工」∥「段长类的判域」三处的存量句改判域句；§3.27 同句；`DD-214` ∥ `DD-219` 两行改判（「带一行 `STOCK_LINE`」删成「零附加行」） |
| `docs/core/design/BATCH-RECORD.md` | 5 | §4.9 门④「区外命中一律出 `STOCK_LINE` 一句」→「区外命中不入判」；§4.9 表内同句；§4.22「指针读数桶」整条条目删；§4.22 增补行同改；`BR-88` 行「两个区外命中只出 `STOCK_LINE`」→「两个区外命中不出行」 |
| `test/integration/batch-touched-region-gate.test.mjs` | 9 | **整本为它造的 ⇒ 重写**：三处 `assert.match(/存量命中 1 条…/)`（写段半 ∥ 收口半 ∥ `7-19`）换成「回执零附加行」的正断言；四处 `doesNotMatch(/old-gap/)` **保留**（区外那处仍不得出现在回执里）；头注三行与夹具注释改成「区外命中不入判」的说法 |
| `test/rtm/guard.md` | 5 | `7-3` ∥ `7-16` 两行改判成「放行、零附加行」；`37-3` 一行把环引的出场删掉（保留指向成环仓时照拒）；另两行节注删存量句 |
| `test/integration/batch-close-gate.test.mjs` | 2 | 删 `存量命中 1 条` 断言，换「回执零附加行」 |
| `test/integration/batch-edit-spec-section.test.mjs` | 1 | 同上 |
| `docs/core/requirements/DOC-CHECK.md` | 2 | **不在本席笔域** ⇒ 上抛主 agent（AC-7 ① 「批档已落段不出存量读数」那句） |
| `docs/core/requirements/ENGINEERING-MODE-V2.md` | 2 | **不在本席笔域** ⇒ 上抛主 agent |
| `docs/core/design/PROMPT-SYSTEM.md` | 1 | 未读。处置 = 删该行的存量说法，判据零改 |
| `docs/core/design/TESTING.md` | 1 | 未读。处置同上 |
| `thincoder-core/agent-tools/batch-gate.mjs` | 11 | 未读（注释面）。处置 = 注释与口径句改成「区外命中不入判」，行为零改 |
| `thincoder-core/agent-tools/batch-gate-report.mjs` | 4 | 已读。`gateReceiptLine` 注释里「存量读数」句删 |
| `thincoder-core/doc-check/index.mjs` | 2 | 已读。`zones` 入参注与 `stockHits` 注释同删 |
| `thincoder-core/tools/doc-write-gate.mjs` | 3 | 未读（注释面）。处置同 `batch-gate.mjs` |
| `thincoder-core/agent-tools/batch-record-write.mjs` | 1 | 未读。处置同上 |
| `thincoder-core/doc-check/anchors.mjs` | 1 | 未读。处置同上 |

#### 撤完的量

本批**只减不增**：A 组 10 档、B 组 17 档，逐处删或改写，无一处新增机制。每档改后行数 ≤ 改前（量法 = `doc_check` 的 `lines` 面，绝对数住 §5）。`AC-2` 是这一点的机检：符号族在 `thincoder-core/**` 零残留。

### 12 设计档正文落地（上一轮欠笔，本轮补）

三份设计档已按 §11 逐处落笔。**口径撤掉就是撤掉**：删掉的地方不留「旧称 X ⇒ 现称 Y」这类带旧名的解释——读者不该看见一个已不存在的概念的名字。

**`docs/core/design/DOC-CHECK.md`**

- §2.9.1 推论 1：三面改为「区内进阻断集、区外不入判集」（不计数、不列行、不出回执）。
- §2.9.1.1：删掉「偏离既有存量句」那条先例；`STOCK_LINE` 的新名一行整条删；「触达账腿」先例句里的「区外只出计数」删。
- §2.9.3 ∥ §2.9.9 的 B-1 格：环引不进闸时**门面不出行**，`report` 面读数行照旧（`report` 面不动）。
- §2.9.4：整节重写取区口径——`STOCK_LINE` 字面与其三处消费面句删；纯删的「行映射 ∥ 逐行文本判据 ∥ 组合单元判据 ∥ 单元类型改变 ∥ 基线怎么判」五条全删，改写成「零宽定位点扩出的区，不跑基线」；「代价」段改成纯删（删掉整段）不被拦；「代价谁兜底」整段删。
- §2.9.8 关键决策：删「存量读数句形」一行；「判域跟写入走」与「收口面的区从哪来」两行的否掉理由去掉存量措辞。
- §2.9.9 用例表：C-1 ∥ C-3 ∥ C-5 三格改判成「回执零附加行」；C-6（纯删新组合单元照拦）**整格删**——它断的行为随基线单元比较一起退场。
- §2.10.1：`zones` 条目改成「区外命中就地丢弃 + 零宽区照交」；表里「收门口的纯删基线那一跑」整行删；append 面「不出存量读数」句与该面代价段换成本笔的代价（纯删并段）。
- §2.10.4 ∥ §2.10.5 ∥ §2.10.6 ∥ §2.10.7 ∥ §2.10.8：措辞与红侧改成「区外不入判」；AC-P2 改判成「纯删的区 = 零宽定位点扩出的相邻单元」；AC-P3（读 `pureDeleteStockEntries` 函数体）整条删——符号随族退场；AC-P7 的红侧从「落进 `stockHits`」改成「整份不判」。
- §4 受影响文件行：`STOCK_LINE` 与环引读数行两件换成「`zones` 的逐档语义与零宽区照交」。
- §9.1 的 `7-3` ∥ `7-16` ∥ `37-3` ∥ `7-19` 四行改写成「零附加行」，与 §8 的 RTM 增量同口径。

**`docs/core/design/DOC-DISCIPLINE.md`**

- `DD-217` 的判据条目改写为「区外命中不入判集」，用例表同一行同改；`DD-214` ∥ `DD-218` ∥ `DD-219` 三行的 `STOCK_LINE` 读数断言删掉，改成零附加行；`DD-218` 的夹具措辞换成「既有锚」。
- §3.20：段长类判域句、① 面表行、① 面范围与强制集句、append 面那一句、「命中分流」、「两面的分工」五处改成判域句；集成差量块的夹具措辞同改。
- §3.23 批档门那一句、§5 的 `DD-217` 条目与三行用例、A-DD31 的 8–11 四条同改。

**`docs/core/design/BATCH-RECORD.md`**

- §4.9 门 ④：「区外命中一律出 `STOCK_LINE` 一句」→「区外命中不入判集（不计数、不出行）」。
- §4.19 文档机检门行：同句同改。
- BR-88 行：「两个区外命中只出 `STOCK_LINE`」→「回执零附加行」；§7 覆盖行同步。
- §4.22：「指针读数桶（`pointerReads`）`」整条删；证据格一节的用例格、先例句、代价句、落点句里的「指针读数行」全部改成「零附加行」或删（落点句改成「证据格识别与判集分腿的落位」）。

**顺带的那一句已在 §3 改写**：零宽定位点由 diff 自己给出，判集只需要「哪些行属于本次」这一个答案——这就是撤掉基线映射之后纯删仍算改动区的理由；无可扩单元时交空表，代价在 §6 写明。

**未落地的（不在本席笔域，已上抛）**：需求档 AC-7 ① 的那一句（§10 第 1 条）与提示词面那一行（§11 A 组的 `thincoder-core/prompts/persona-eng-coder.md`）仍带旧口径，由主 agent 处置。

**理由自证**：判据 = 三份档里 `STOCK_LINE` ∥ `存量命中` ∥ `区外存量` ∥ `仍明示` ∥ `stockHits` ∥ `pureDeleteStock` 六串零命中（域 = 这三档），`grep` 复跑即可红绿两侧各见一次。

### 13 追加：三件外延（判不了 ⇒ 不入判集 · 描述面同源 · 回执说出路）

#### 13.1 判据（追加的那一句，与 §1 同源）

门的判集只问一句：**这条命中是不是本次改动区内的。** 判得出改动区 ⇒ 判区内；判不出 ⇒ **不入判集**（不判、不拦、不印）。

改前收口面问的是另一句——「这档能不能判」，判不了就整档判。两句话在跨仓档与整件搬入档上分道：前者放行，后者让整批永远收不了口。

依据 `thincoder-core/agent-tools/batch-gate-judge.mjs`「if (close) return region?.kind === "region" && region.zones.some((z) => e.line >= z.start && e.line <= z.end)」——`blocks` 的收口支现文只认 `region` 且落区内，判不出改动区即不入判集。

#### 13.2 E7 收口面：判不了 ⇒ 不入判集

| 处 | 今天 | 改成 |
|---|---|---|
| `thincoder-core/agent-tools/batch-gate-judge.mjs` 的 `blocks` 收口支 | `kind !== "region"` ⇒ `return true`（整档判） | ⇒ `return false`（不入判集） |
| 同档 `zoneTablesOf` 交键规则 | 非 `region` 档**不交键**（引擎因此按整档判） | 收口腿对非 `region` 档交**空区间表** |
| 同档 `zoneTablesOf` 签名 | `(regions, docs)` | `(regions, docs, face)`——`face` 无缺省，两个调用点各交自己的面 |
| 写段腿（`append` ∥ `edit` 的触达账各档） | — | **一字不动**：`whole` ⇒ 整档判 ∥ `unknown` ⇒ 零强制 |

**为什么交空表、不是不交键**：引擎的逐档语义是「某档在 `docs` 里而 `zones` 里没有它的键 ⇒ 该档整份进阻断集」，不交键等于把整档判留在原地。依据 `docs/core/design/DOC-CHECK.md`「交空表与不交键是两件事——空表 = 该档每一条命中都在区外，不交键 = 该档整份进阻断集」。

**因此不入判集的档（闭集两类）**：

- `unknown`——不在 git 仓 ∥ `git ls-files` 跑不出 ∥ 批起 sha 不可解析（跨仓档即这一类）∥ `git ls-tree` 跑不出 ∥ `git diff` 跑不出。
- `whole`——不在跟踪面（本轮新建未提交）。

**已裁（A 案 · 父侧 2026-11-11）**：跟踪面上、基线提交里没有的档（新建 ∥ `git mv` 搬入）**不落这两类**——`git diff -U0` 把整份标成 `+` ⇒ 判成 `region`、改动区 = 整档、照判（实现单源 = `thincoder-core/agent-tools/batch-regions.mjs` 的 `touchedRegions`）。原「基线里没有该档 ⇒ 不入判集」的 B 案字面随之作废。

**为什么可以放（理由，不是宽容）**：收口面的整档判，对本批写过的字节是第二遍——每次写入已在自己的改动区内判过，未跟踪的新建档在写盘门按整份新内容判过。撤掉的不是保护，是「旧债的一票否决」，正是用户那句「与本次改动无关的旧债别拦我」。

**代价（认下来）**：判不出改动区的档（`unknown` ∥ 未跟踪的 `whole`）在收口面零保护（不经写盘门的那条路，例如脚本改盘）。搬入档不再逃——照判，代价反向：搬入档的既有死引文会被多拦一次（A 案比 B 案严；到期 = 下批落 `git diff -M` 重判，§13.8 同一行）。兜底 = 显式 `doc_check({mode:"gate", docs:[…]})`，那一面判整档，本批不动。

#### 13.3 E9 回执说出路（外延三）

今天那行只说未定、不说往哪走：`thincoder-core/agent-tools/batch-gate.mjs` 的 `notes.push`「收口改动区未定——整档判（${named}）」。判据改了以后它也不再是拒文，而是**没判的明示行**——「没判完」这一类要出声，删了就是假绿。

**新字面（单源住本段，实施席照写，一行）**：

```text
收口面不入判集 N 档（判不出改动区）：<档>（<原因>）…；出路：跨仓档在该档所属仓解析得到批起 sha（多仓批每仓各记自己的）∥ 要连旧债一起判就用 doc_check({mode:"gate", docs:[该档]})
```

仍然只出一行、不逐档列清单：`N` 与括号里的档名带原因已经是点名，再加清单就是本批要消的信息爆炸。

#### 13.4 E8 描述面与行为面同源（外延二，逐处点名）

父侧引的两句在盘上各找到一处，都不是逐字（转述），实文与落点如下。三处都是产品面，本席只点名与给字面，落盘归 eng-coder。

| 档与位置 | 现文（逐字） | 改成 |
|---|---|---|
| `thincoder-core/tool-docs/doc_check.md` 的 `gate` 条目 | 「Every listed document is judged **whole**: a pre-existing dangling pointer or an overlong paragraph anywhere in it counts, not only this round's lines.」 | 三段真话：直接调用判整档 ∥ 批档门内（`append` ∥ `edit` ∥ `close`）只判本批改动区 ∥ 判不出改动区的档不入判集，回执一行点名 |
| 同档 `texts` ∥ `zones` 段末 | 「With both absent, every listed document is judged whole - which is what `doc_check` always does.」 | 保留「无 `zones` 键 ⇒ 整档」这半句（引擎语义零改），补一句：批档门自己交 `zones`，它交空表 = 该档不入判集 |
| `thincoder-core/tool-docs/batch.md` 的文档机检门说明 | 「the close face is where it is enforced」 | 收口面判同一个改动区、不判整档；判不出区的档不入判集，回执一行点名加出路 |
| 同档 `edit` 条目 | 「so a dead citation anywhere in the record refuses an unrelated edit」 | 锚类在改后整档视图上看，只有替换区内阻断；别处一条死引文不阻一笔无关的 `edit` |

前两处的误导后果是现成的：读它的人会去清别人的存量，再补派两件不该做的活。

#### 13.5 验收（三条，各带红侧）

| # | 判据（可跑） | 红侧 |
|---|---|---|
| AC-7 | 跨仓档夹具：临时 git 仓一档、档内带一处既有死引文，批档 §1 的 `批起 sha` 写一个该仓解不出的 sha（同仓内模拟外仓基线）⇒ `close` 放行，回执多出的只有 13.3 那一行，首行仍 `PASS` | 把 `blocks` 收口支接回 `kind !== "region" ⇒ return true` ⇒ 同一夹具 `REFUSED`、命中 = 该档旧债 ⇒ 红 |
| AC-8 | 搬入档夹具（A 案）：临时仓基线提交里没有该档、工作树里有它（`git mv` 进仓的形），档内带一处既有死引文 ⇒ 该档整份标 `+`、照判 ⇒ `close` `REFUSED`、命中 = 那条死引文（依据 `thincoder-core/agent-tools/batch-regions.mjs`「⇒ 判成 `region`」） | 把「基线里没有该档」判成不入判集（B 案）⇒ 同一夹具放行 ⇒ 红 |
| AC-9 | 描述面读者判据：读者只读 `thincoder-core/tool-docs/doc_check.md` 的 `gate` 条目与 `thincoder-core/tool-docs/batch.md` 的门说明，被问「批档门收口判整档还是判改动区」，读出的答案 = 判改动区、判不出区的档不入判集 | 今天这两处读出来的答案相反（`judged **whole**` ∥ `the close face is where it is enforced`）⇒ 红 |

AC-9 是文档面的读者判据，不落自动断言：它判的是读者能读出什么，而读的人就是验收的人。

#### 13.6 受影响文件（在 §4 之上追加）

```text
thincoder-core/agent-tools/batch-gate-judge.mjs   blocks 收口支改 return false；zoneTablesOf 加 face 入参、收口腿交空表
thincoder-core/agent-tools/batch-gate.mjs         收口未定那行换成 13.3 的字面（不再是「整档判」）
thincoder-core/agent-tools/batch-gate-report.mjs  注释里的「整档」口径句同改（若有）
thincoder-core/tool-docs/doc_check.md             gate 条目 ∥ texts-zones 段末（13.4 前两行）
thincoder-core/tool-docs/batch.md                 门说明 ∥ edit 条目（13.4 后两行）
```

设计档（本席本轮已落，逐处见 13.7 之后的交代）：`docs/core/design/DOC-CHECK.md` 的 §2.9.4 ∥ §2.9.8 ∥ §2.9.9 ∥ §2.10.1 ∥ §9.1；`docs/core/design/DOC-DISCIPLINE.md` 的 §3.20 两处与 `DD-218` ∥ `DD-219`；`docs/core/design/BATCH-RECORD.md` 的 §4.9 门 ④ ∥ §4.22 ∥ `BR-88`。

测试面：`test/integration/batch-touched-region-gate.test.mjs`（`7-19` 两半）∥ `test/rtm/guard.md`（`7-19` 改判、新增 `7-21`）。

#### 13.7 集成测试（RTM 增量，在 §8 之上）

- **改写 = 1**：`7-19` 后半「区未定 ⇒ 整档判照拒」改成「区未定 ⇒ 不入判集、放行、回执一行点名原因与出路」。
- **新增 = 1**：`7-21`（故事 `CLI 7`）。**交互** = 批起基线 → 改动区判定 → 收口回执；**业务可观察结果** = 一份判不出改动区的档不再让整批收不了口，且回执说出往哪走；**服务需求** = `docs/core/requirements/DOC-CHECK.md` F9 ∥ AC-7；**入口** = depth-0 `batch({action:"close"})`。入口依据 = 生产真的产生过（同一份记录、同一时刻，`append` 与 `close` 一个 PASS 一个 659 条）。
- **冗余 = 0**。

#### 13.8 关键决策（追加）

| 决策 | 选了 | 否掉了什么，为什么 |
|---|---|---|
| 判不出改动区的档怎么处置 | 不入判集 | 整档判——那等于把该档的旧债挂到本批头上，多仓批与搬迁批永远收不了口 |
| 收口腿交空表 ∥ 不交键 | 交空表 | 不交键 = 引擎按整档判，正是本批要撤的那一档 |
| 新增 `git diff -M` 识别重命名 | **本批不做** | 它能把「基线无该档」的两义（新建 ∥ 搬入）分开、判得更准；但它是新机制，还要给 `batch-regions.mjs` 加行，与本批「只减不增」的验收自相矛盾。场景成立（搬入批），因此不删念头，只挪批次 |
| 写段面面别倒向 | 一字不动 | 在写段面，`whole` 不是「判不了」而是「整份就是本笔」（未提交的新档）；同向会放掉本轮刚写坏的字 |

#### 13.9 上抛（追加）

1. **`§1` 边界那一行与本批自相矛盾，需主 agent 处置**：`§1` 早段写「不动收口面：收口是最后一道，它的整档判与拒绝照旧」，后段的「外延一」与用户 16:16 的裁定把收口面的倒向改了。以外延一为准（后者更晚、且带用户原话），`§1` 那一行是旧口径。
2. 需求档 `docs/core/requirements/DOC-CHECK.md` 的 AC-7 ① 仍带旧口径（原 §10 第 1 条，未处置）。
3. 提示词 `thincoder-core/prompts/persona-eng-coder.md` 那一行仍带旧口径（原 §11 A 组，未处置）。
4. 搬入档若要被逐行判，需另立批做重命名识别；本批的代价如实写在 13.2 末段。

### 14 追加：判据只有两种结局（拦，或者不出现）

用户 16:37 原话：「**不拦截的就不要报数……人家收到一个没意义的数据还要想半天，不定做出什么判断，没事儿吓唬人家干嘛！**」

这条把 §13.3 的「没判明示行」之外那一整层废掉，也把本批的判据从「不拦不出数」收紧成「不拦就根本不出现」。

#### 14.1 判据（本批第三句，也是最终口径）

一条命中在门内只有两种结局：**拦**（进强制集、出现在拒面），或者**根本不出现**（不拦、不报、计数也没有）。没有「不拦但告诉你一声」这一档。

| 结局 | 命中类（闭集） |
|---|---|
| 拦 | `档缺`（本仓解析腿能解析、解析完确实不在盘的路径）∥ `引缺`（`依据 <档>「引用串」` 那句在该档里找不到）∥ `节缺`（目标档在盘而无该节）∥ 段落长（报面词 = 文字太长，难于阅读）∥ 行太长 |
| 不出 | 行号坐标 ∥ 跨仓未声明 ∥ 裸档名 |

**分列标准 = 判得准不准，不是值不值**：拦的五类都是确定的——路径在不在盘、引文串在不在档里、节号有没有那个标题行、段与行多少字；它们入闸不出误报。不出的三类误报都来自判不准——行号坐标要换算坐标、跨仓未声明要猜根、裸档名要猜目录。用户 2026-11-11 16:44 原话：「AC-12 ⑥ 接长不再因段长拒 为啥呀？你这把放过去，下一把他妈的你就说是存量不管。」

`report` 面一字不动——它是**显式问**才出的清单，与门内回执不是一回事。

#### 14.2 E10 门内装配：三类不进 `hits`

- `thincoder-core/doc-check/index.mjs` 的 `gate` 装配处：`行号坐标` ∥ `跨仓未声明` ∥ `裸档名` 三类不并入 `hits`、不计数、不进任何桶、不出行；`档缺` ∥ `引缺` ∥ `节缺` ∥ 段落长 ∥ 行太长 五类照旧入闸、照旧可判 `REFUSED`。判据本体（阈值 ∥ 抽取面 ∥ 解析序）一字不动——动的是**哪几类出声**，不是判法。
- `thincoder-core/agent-tools/batch-gate.mjs`：`k` 由 `档缺` ∥ `引缺` ∥ `节缺` ∥ 段落长 ∥ 行太长 构成；`classifyCounts` 的类名闭集同步去掉不入闸的三类。
- 不入闸的三类仍在 `report` 面逐处列出（那一面是显式问的，本批不动）；入闸的五类两面同判。
- **写盘门（`thincoder-core/tools/doc-write-gate.mjs`）同拍**：一条判据两个判决 = 漂移，门内不留第二套宽严。写盘门的拒写判定照旧读 `hits.anchors + hits.paragraph`、不读 `hits.lineRefs`——`档缺` ∥ `引缺` ∥ `节缺` 在锚类、段落长 ∥ 行太长 在段类 ⇒ **接长越界照拒**（需求档 AC-12 ⑥ 写回「拒」）；不入闸的三类它本来就不读。

#### 14.3 边界（这一条我不是自己裁的，但落点要划清）

- **`没判` 的明示行留**（读不到 ∥ 跳过 ∥ 未核 ∥ 排除 ∥ 围栏内 ∥ 判不出改动区）：它们说的是**覆盖**，不是**命中**——删掉，一个什么都没判的 `PASS` 会被读成「都判过了、都干净」，那是假绿。用户这句裁的是「判了但不拦」那一层，不是「没判」这一层。
- **已裁（用户 2026-11-11，经主 agent 的裁定回合）**：`没判` 的明示行留。用户裁的是「判了不拦」那一层；`没判` 说的是覆盖——删掉它，一个什么都没判的 `PASS` 会被读成「都判过了」。增删只在这一处：要撤就删 §13.3 那一行与本节这段，两处一起。

#### 14.4 验收（AC-10）

| # | 判据（可跑） | 红侧 |
|---|---|---|
| AC-10 | 不出半：夹具档各带一条 行号坐标 ∥ 指向未声明仓的指针 ∥ 裸档名，且无 `档缺` ∥ `引缺` ∥ `节缺` ⇒ `doc_check({mode:"gate"})` 首行 `PASS`、回执零附加行、那三串一个也不出现；同夹具在 `report` 面照旧全列。拦半：同一夹具另加超长段 ∥ 超宽行 ∥ 指不存在的节各一条 ⇒ 首行 `REFUSED`、命中逐条 | 把不出三类之一接回 `hits`（例如行号坐标）⇒ 命中数从 0 变 1、附加行重现 ⇒ 红；把拦的三类之一（段落长 ∥ 行太长 ∥ 节缺）摘出 `hits` ⇒ 拦半那一笔放行 ⇒ 红 |

#### 14.5 受影响层（逐层点名；需求档与提示词不在本席笔域）

```text
thincoder-core/doc-check/index.mjs          gate 装配处三类（行号坐标 ∥ 跨仓未声明 ∥ 裸档名）不入 hits
thincoder-core/agent-tools/batch-gate.mjs   k 的构成（档缺 ∥ 引缺 ∥ 节缺 ∥ 段落长 ∥ 行太长）与类名闭集收窄
thincoder-core/tools/doc-write-gate.mjs     同拍：接长越界照拒（读 anchors + paragraph，不读 lineRefs）
thincoder-core/tool-docs/doc_check.md       「What it checks」三条与 gate 回执段按两种结局重写
文档层（本席本轮落）                          docs/core/design/DOC-CHECK.md · docs/core/design/DOC-DISCIPLINE.md · docs/core/design/BATCH-RECORD.md
需求档（上抛主 agent）                        docs/core/requirements/DOC-CHECK.md 的 F1 ∥ F11 ∥ F14 ∥ AC-9 ∥ AC-12
提示词面（上抛主 agent）                      thincoder-core/prompts/persona-eng-coder.md 那一行
```

#### 14.6 这一条的落点（分列标准 = 判得准不准）

**拦的五类都判得准，因此照拦。** 路径在不在盘、引文串在不在档里、节号有没有那个标题行、段与行多少字——四件事都是确定的，300 就是 300，没有误报可言。

**不出的三类误报都来自判不准。** 行号坐标要换算坐标、跨仓未声明要猜根、裸档名要猜目录——猜错的代价是拿一条假命中挡住一笔无关的写，因此不出现。

**早先「段落长是排版偏好、该让它过去」的判法是错的**（用户 2026-11-11 16:44 原话：「AC-12 ⑥ 接长不再因段长拒 为啥呀？你这把放过去，下一把他妈的你就说是存量不管。」）。读着累不是判错，是判对了而收益有争议——可争议的从来不是准不准，因此不构成不拦的理由。写盘门同拍已在 14.2 落定（接长越界照拒）。

**留给后来人的一句**：`行号坐标` ∥ `跨仓未声明` ∥ `裸档名` 不出现是裁掉的，别把它读成「门忘了判这三类」；段落长 ∥ 行太长照拦也不是漏做——它们判得准。

### 15 修正轮：`§3.23` 条目 W 按两列改判（父侧 2026-11-11 16:4x 派单）

**判据（第三句的落点）**：行号坐标**门内不出现**——`report` 面清点照旧，`gate` 面不计入 `hits`、不出命中行、首行不带该类、围栏内读数行也删。

| # | 点名处 | 改成（逐字要点） |
|---|---|---|
| 1 | `§3.23` 标题 ∥ 效力句 ∥ 采集点 | 「### 3.23 条目 W：行号坐标（`report` 清点 · 门内不出现 · 三形归属窗）」；「`report` 面 = 清点（不产 verdict，供清债用）；**门内不出现**——不进 `hits`、不出命中行、首行不计这一类、回执不出该类任何读数」；采集点「`report` 面读它出清单，`gate` 面不读它」 |
| 2 | 「为什么挂 `gate` 面」∥「写前门显式不挡」∥「判法 = 行为断言」三块 | 删，换成一句：「**两道门都不判这一类**：写前门…读 `hits.anchors + hits.paragraph`，批档门…强制集同样是那五类——行号坐标在两处都不进 `hits`、不进拒文、不出回执行」 |
| 3 | 「gate 判据（第三条…）」∥ 围栏内读数行 ∥「判面 = 正文面」∥「射程」∥「为什么改判」∥ 落点表五行的 gate 半 | 整块删，换成「**门内不出现（本类的效力边界，逐件）**：`hits` 只有锚 ∥ 段两类；首行判决串不带该类；命中行不出；围栏内那批也不出读数行」+「**围栏块与正文面的分列 = `report` 面的读数口径**」+ 落点两条（采集面零改 ∥ 门侧只做减法：`hits` 组装与 `gateReport` 不再取 `lineRefs`） |
| 4 | 「存量当轮清」头句 ∥「清债轮的实际后果」整段 | 头句改「**清债的量在清单、不在门内**：门内不出现这一类 ⇒ 没有强制点」；「清债轮的实际后果」删 |
| 5 | `A-DD37` | 标题「`report` 清点 · 门内不出现」；判据 3 改「门内不出现…`gate` 首行 = `DOC-CHECK GATE: PASS` ∧ 零该类命中行 ∧ `hits` 只有锚 ∥ 段两类」；判据 8 改「围栏内 ∥ 围栏外都只进清单」；工具描述面条目改「判据数仍是 2（锚 ∥ 段），verdict 类名不补该类」；`aligned` 一条改「不得把这一类算进去」 |
| 6 | 用例表 | `DD-144` ∥ `DD-150` ∥ `DD-174` ∥ `DD-176` ∥ `DD-178` ∥ `DD-204` ∥ `DD-220` ∥ `DD-221` ∥ `DD-222` 九行改形（不再断言 `REFUSED` ∥ `hits.lineRefs`） |
| 7 | 同一条规则的其余落点（D11 sweep，本席同轮落） | 档头 ∥ `§3` 标题括注改「行号坐标清点（条目 W）」；`§3.20` 边界改「不加第三条判据」+「行号坐标门内不出现」；`§3.20` 行数读数先例句去「`gate` 面另立判据」；`§3.28` 四处（机制面第四条 ∥ 「四条合起来」∥ `AB-1` 格 ∥ 「行号坐标一类门内不出现」段）+ 边界两条；`§4` 索引行改「条目 W（行号坐标清点）」 |
| 8 | 顺带：`§3.20`「存量债在收口门判」∥「整档累积的存量债归收口面」 | 改判域句（收口面判同一个改动区，判不出区的档不入判集）——与本批外延一（E7）同源 |

**机检**：`doc_check({mode:"gate", docs:["docs/core/design/DOC-DISCIPLINE.md"]})` ⇒ 首行 `DOC-CHECK GATE: PASS`，结论 `0 段有问题（1 档全清）`。

**集成差量（本档内）**：第 26 节按新口径重算 ⇒ **破 2 行**（`26-3` ∥ `26-6` 的 `gate` 半幅）· 冗余 0 · 缺 0；用例文件不变。

**未落地（不在本席笔域，仍上抛）**：

1. `test/RTM.md` 第 34 行故事 26 标题仍写「（行号坐标：`report` 清点 ∥ `gate` 拦）」；`test/rtm/guard.md` 的 `26-3` ∥ `26-6` 断言仍带 `REFUSED` 与 `hits.lineRefs` —— 测试面属产品面，归实施席。
2. `thincoder-core/doc-check/index.mjs` 的文件头注与 `gateReport` 仍写「第三条判据」「`hits.lineRefs`」——随代码改，归实施席。
3. 需求档 `docs/core/requirements/DOC-CHECK.md` 的 F11 ∥ F14 ∥ AC-9 ∥ AC-12 ⑥；`thincoder-core/prompts/persona-eng-coder.md` 那一行——归主 agent。

### 16 追加：E11 ∥ E12（判域的两条收边）

**与 §12 同一族**：这两条与 E1 同源——都是**判域**，不是判据。判据本体（阈值 ∥ 命中类闭集 ∥ verdict 词 ∥ 抽取式）一字不动；改的是「哪些 token 进判面」。

#### 16.1 本批条目（在 §2 的表上追加两行）

| # | 条目 | 落点 |
|---|---|---|
| E11 | 相对形（`./` ∥ `../` 开头）在既有两级**之前**多一级：以引用方档所在目录为基根解析；只对相对形生效 | 解析序本体 = `docs/core/design/PATH-RESOLUTION.md`（腿序）；锚面入参 = `thincoder-core/doc-check/anchors.mjs` 的 `resolveDoc` |
| E12 | 判域收边：候选落在判域外 ⇒ 该腿不成腿；全部腿在域外 ⇒ 该 token 不判（不入 `hits`、不计数、两面都不出行） | `thincoder-core/doc-check/anchors.mjs` ∥ `thincoder-core/path-resolve.mjs` 的声明仓腿 |

#### 16.2 判据（逐条，可跑）

- **E11**：解析序加一级，**只对相对形生效**。现状是**解析方向错了**，不是误报策略：`../` 相对的是引用它的那份档所在目录，按项目根解永远解不到 ⇒ 一律 `档缺`。
  依据 `thincoder-core/path-resolve.mjs`「const legs = order === "near-first" ? [refDir, rootLeg] : [rootLeg, refDir]」——引用方目录这条腿本来就有，缺的是它在相对形上排在前面。
- **不切 `order:"near-first"`**：那一支把两级整体翻序，裸名 ∥ 普通路径形的结果跟着变（引用方目录下一份同名档会压过项目根那份），超出裁定射程。
- **E12**：判域 = 该档判定根（组根）∪ 该根 `index.publicRepos` 里在本机的声明根。域外 ⇒ 不判、不出命中、连计数都不出。
  射程三形：`../` 出仓 ∥ 仓外配置 ∥ 未声明同级仓（首段 = 同级目录名，`siblingRepoNames` 现有探测）。
- **判在候选路径上**：缺档那一半没有可解析路径；只在 `resolved` 上判，域外**不存在**的那条会漏成 `档缺`。
- **这不是放宽，是判域收边**：域外存在与否都不改变「不归门管」，判了只是一条假命中挡一笔无关的写。用户 16:53：「死指针只判仓内的，仓外的不要判了，不归你管的地方，你想管也管不住」。
- **两面同判**：判域是共同前置，不是输出过滤 ⇒ `report` 面同样不出这类行。§14.1 的「`report` 面不动」管的是命中类的出声面，本条输入在进命中类之前已经不判。

#### 16.3 验收（红侧逐条）

| # | 判据（可跑） | 红侧 |
|---|---|---|
| AC-E11 | 一份档在正文写一条相对路径，相对它自己的目录成立（指向仓内一份在盘档）⇒ 回执零命中 | 腿序改回「只按项目根」⇒ 同一夹具判 `档缺` ⇒ 红 |
| AC-E12 | 同一份档再写两条域外路径（一条真实存在 ∥ 一条不存在）⇒ 两种都零命中，`report` 面也不列 | 把域外候选接回存在性判定 ⇒「不存在」那条重现 `档缺` ⇒ 红 |
| AC-E12b | 仓内真悬空照拦：写一条仓内不存在的档 ⇒ `档缺`、进 `hits` | 边界写成「凡解不到就不判」⇒ 这条放行 ⇒ 红 |

**验收的度量面**：本批总验收仍是「删掉多少行」（§5）；E11 的那一级是**唯一加行的地方**，它与 E1–E10 的减法同批落，档层行数结论由 `doc_check` 的 `lines` 面出，绝对数住 §5。

#### 16.4 受影响文件（在 §4 ∥ §13.6 ∥ §14.5 之上追加）

```text
docs/core/design/PATH-RESOLUTION.md        腿序表加「相对形前置引用方目录」这一级（解析序本体单源）
thincoder-core/path-resolve.mjs             腿序：相对形前置一级；声明仓腿未声明支与其同级目录载荷删除
thincoder-core/doc-check/anchors.mjs        resolveDoc 交新一级的开关；每条腿先判候选在不在判域内
thincoder-core/doc-check/index.mjs          报面「该名未在 index.publicRepos 声明」那句随产出点删
docs/core/design/DOC-CHECK.md               §2.11 已落（本席本轮）
```

**设计档落点已落盘**：`docs/core/design/DOC-CHECK.md` §2.11（判据一句 ∥ 2.11.1 相对形 ∥ 2.11.2 仓外不判 ∥ 2.11.3 关键决策 ∥ 2.11.4 验收）。

**已落盘（腿序表，逐处见 §17）**：`docs/core/design/PATH-RESOLUTION.md` 是解析序**本体单源**，本轮已按 E11 ∥ E12 改完；实施轮照 §17 的落点改代码，两处同源。

#### 16.5 集成差量（RTM）

- **新增 = 1**：`7-22`（故事 `CLI 7`）。**交互** = 引用方目录 → 解析腿 → 命中集；**业务可观察结果** = 相对路径按引用方目录解得中、仓外指针不出现、仓内真悬空照拒；**服务需求** = 文档机检门的判域（回指 `docs/core/design/DOC-CHECK.md` §2.11）；**入口** = 子代理 `batch({action:"append"})` 的回执。入口依据 = 生产真的产生过——本批 `§1` 的第一笔写入被自己的引擎按相对路径拒掉，现场两行原文在 `§1`。
- **破 = 未核**：本席本轮未读 `test/rtm/guard.md` 与 `test/integration/**` 的本轮现文，判不出既有行里有没有断言「域外指针 ⇒ `档缺`」。按同一判据核这一面归实施席（他有 test 面与当轮读数）；**判出破行的，按 §8 的形改写，不新增第二条口径**。
- **冗余 = 0**（识别面 ∥ 豁免面 ∥ 域表那几族与本笔无交集）。

#### 16.6 上抛（追加）

1. **需求档要加这两条**（`docs/core/requirements/DOC-CHECK.md`）：判域收边与相对形解析方向。需求档不在本席笔域。**在它落地前，本档 §2.11 是这两条的唯一口径**，验收按 §2.11.4 走。
2. **`test/rtm/guard.md` 的破格数待核**（见 16.5）：本席未读该档现文，不拿一个没读过的数冒充读数。

### 17 追加：腿序表落地（E11 ∥ E12 已落 `docs/core/design/PATH-RESOLUTION.md`）

**两问的答复**

1. **腿序只加一条前置腿，别形不动**：`./` ∥ `../` 开头的 token 在 `order` 两级**之前**多一级——引用方目录（无 `referrer` ⇒ 会话锚，与已有那一级重合则去重）；裸名 ∥ 普通仓根相对形仍按 `order` 原序，绝对形在第 2 步已 `resolved`。不切 `order:"near-first"`：那一支把两级整体翻序，别形的结果跟着变。
2. **域外落在「腿的前置条件」上，不落在「判档缺」那一支**：每条腿先算候选、再判候选在不在判域内；域外 ⇒ 该腿不成腿。全部腿在域外 ⇒ 没有一条腿可走，因此它是解析序的一个**终止态**（第五态 `outOfDomain`），不是 `dangling` 的分支——判成 `dangling` 必被下游映射成 `档缺` 并拒写，正是本批要撤的那条假命中。按该档现结构取后者（§2.1 状态表 + §2.2 第 4 步），载荷刻意留空，免得被渲染成一行读数。

**逐行（改前 → 改后）**

| 处 | 改前 | 改后 |
|---|---|---|
| §1 模块目标 | 四态之一 | 五态之一，末项 = 判域外（不判、不出声） |
| §1.2 先例对齐 | 偏离三处（四态） | 偏离四处（五态）；④ = 相对形前置腿（KD-16） |
| §2.1 标题 | 一个函数，四态结果 | 一个函数，五态结果 |
| §2.1 opts 表 | 末行 = `suffixFallback` | 增 `domainRoots` 一行 |
| §2.1 状态表 | 末行 = `unverified` | 增 `outOfDomain` 一行（无载荷） |
| §2.1 各态依据表 | 四行 | 增 `outOfDomain` 一行（现场：仓内档写 `../` 出仓指针被判 `档缺` 并拒写） |
| §2.2 第 3 步 | 恒不产 `ambiguous ∥ dangling ∥ unverified` | 恒不产其余四态 |
| §2.2 第 4 步 | 两条腿序 + 项目根两形 + `scanBases` 不参与 | 追加四条：相对形前置腿 ∥ 该级不依赖项目根 ∥ 域判 = 腿的前置条件 ∥ 一条腿都不在域内 ⇒ `outOfDomain`；「直接走 §2.3」改为「落 §2.3（相对形先走上一级再落这里）」 |
| §2.2 第 5 步 | 前两级基根（①②，按 `order`）首命中 | 各级基根（每一级；相对形前置腿算首级） |
| §2.2 第 7 步 | 零命中 ⇒ `dangling` | 追加前提：至少一条腿在域内；一条腿都不在域内 ⇒ `outOfDomain` |
| §2.5 锚面行 | `declaredRepos`；「两级序…解析面零变」 | 增 `domainRoots`；腿序随本层；`outOfDomain` 两面都不出行 |
| §2.6 | 四类结果；`dangling` 带「未声明形」一行 | 五类结果；删未声明形那行；增 `outOfDomain` 不报 |
| §2.7 判据一句 | 没声明就拒（`档缺`，入闸） | 没声明就是域外（`outOfDomain`，不判） |
| §2.7 结局表 | 红〔未声明〕⇒ `dangling` ⇒ `REFUSED` | 不判〔未声明〕⇒ `outOfDomain` ⇒ 不出行 |
| §2.7 未声明形 | `dangling` + `siblingRepos` 候选 | 域外不判；同级名集只用来认这一形，不产载荷 |
| §2.7 同级名集 | 两处消费（提示面 20 帽 ∥ 判定面不封顶） | 一处消费（判定面），不封顶 |
| §2.8 | 「提示面那份 20 帽」∥「未声明形只给同级提示」∥ 红侧「转 resolved」 | 只有一处消费 ∥ 未声明形落域外 ∥ 红侧「不再落 `outOfDomain`、转 `resolved`」 |
| §3 path-resolve 行 | 帽值「提示尾传 `SIBLING_MAX`」 | 判定面传 `Infinity`；增相对形前置腿与域判两条落点 |
| §3 anchors 行 | 传 `declaredRepos` | 传 `declaredRepos` 与 `domainRoots` |
| §4 | 末条 = KD-15 | 增 KD-16（相对形前置腿，被否两案）∥ KD-17（域判 = 腿的前置条件，被否三案；域怎么组成引 `DOC-CHECK.md` §2.11） |
| §5 | AC-1 四态；AC-10 未声明记 `dangling`；AC-11 未限 token 形；AC-20 ① 记 `dangling` | AC-1 五态；AC-10 改 `outOfDomain`；AC-11 限定非相对形；AC-20 ① 改不判；增 AC-21（三支、三条红侧） |
| §6 用例表 | 未声明两行记 `dangling` + `siblingRepos` | 一行 `outOfDomain`；另一行改「首段非同级目录、仓内无该档 ⇒ `dangling`」 |
| §7 边界 | 无域外条 | 增「不判域外」一条（含代价与正确处置） |
| §8 交互 | 未声明 ⇒ `档缺` + 同级候选 | 未声明 ⇒ 不判、不出行 |
| §9 集成 | 29-4 ∥ 37-2 记「未声明 ⇒ `锚·档缺` + 同级候选」 | 两条记「不判、零行」 |

**本轮加行的两处（只此两处，其余全是删或改写）**：`domainRoots` 一行入参与 `outOfDomain` 一个状态。前者不传 ⇒ 不设域判，其余六面零变；后者只在传了前者的面出现。§5 的 AC-21 是判据面，不是机制面加行。

**机检**：`doc_check({mode:"gate", docs:["docs/core/design/PATH-RESOLUTION.md"]})` ⇒ 首行 `DOC-CHECK GATE: PASS`，结论 `0 段有问题（1 档全清）`。

**未落地（仍上抛）**：需求档 `docs/core/requirements/DOC-CHECK.md` 与 `thincoder-core/prompts/persona-eng-coder.md` 的旧口径（§16.6 第 1 条），以及测试面（实施席）。

### 18 修正轮：评审第 1 轮 13 条逐条落点（父侧 2026-11-11 派单）

**判据变化一句（本次改判，非新语义）**：档位结论改成「两档过线、本批拆」——`thincoder-core/doc-check/index.mjs` 1076 行越 800 硬线、`thincoder-core/doc-check/anchors.mjs` 630 行越 500 设计器硬线，两份分拆方案住 `docs/core/design/DOC-CHECK.md` §2.9.7，**本批实施前落地，不推下批**（用户 2026-11-11 17:14「那不行啊！」+「设计器不管的吗？」）。

**读数（本节唯一一处绝对数，命令 `doc_check({mode:"report", lines:[…]})`）**：352 `thincoder-core/agent-tools/batch-gate.mjs` · 488 `batch-lifecycle.mjs` · 218 `batch-regions.mjs` · 630 `anchors.mjs`（越 500）· 160 `graph-tokens.mjs` · 1076 `doc-check/index.mjs`（越 800）。

| # | 处置 | 落点（档 + 逐字） |
|---|---|---|
| 1 | 三问全部按今天的 `grep` 重取 | `docs/core/design/DOC-CHECK.md` §5 五行改 `existing:`（`rootOf` ∥ `perRootGroups` → `per-root.mjs`；`projectRoots` ∥ `domainTables` → `doc-check/index.mjs`；`NAME_CH ∥ EXT_PART ∥ isExtension ∥ isDocToken` → `anchors.mjs`）；§2.10.5 三行同改（`texts` ∥ `zones` → `index.mjs`；`BARE_NAME_EXTS` → `anchors.mjs`）；§2.9.1.1 三行（`alignZonesToFences` 改「**已退役**」∥ `isExecutableSpan` → `paragraph.mjs` ∥ 环引字面 → `index.mjs` 的 `CYCLE_READ_LINE`）。取证 = `grep` 两个导出声明：`anchors.mjs` 的「export function isDocToken(token, exts = DEFAULT_DOC_EXTS)」∥ `per-root.mjs` 的「export function rootOf(abs, declaredBase)」 |
| 2 | 档位结论重写 | §2.9.7 全节重写：两档给分拆方案（切五族 + 切识别面一族、落点入围栏、再导出保证 import 行零改、`只搬不改`、**验收 = 拆前拆后 `report` ∥ `gate` 输出逐字相等**）；`batch-gate.mjs` 改「未越线（352 行）」，原「过 500」删除 |
| 3① | `hits` 组成选一个单源 = **两数** | §2.7「`hits` 三数（锚 ∥ 段 ∥ 行号坐标）」→「`hits` 两数（`anchors` ∥ `paragraph`）」；§2.7 的 `kind` 表删 `行号坐标` 一行；AC-X4 第三类撤、改「`行号坐标` 不可登记：它不进 `hits`」；§2.9.5 整节改成「行号坐标不进 `hits`，因此没有登记面」；§2.9.9 的 `D-1` 行删；§4 两处「行号坐标载荷（§2.9.5 ④）」删 |
| 3② | 闸的闭集：**以设计的五类为单源**（`档缺` ∥ `引缺` ∥ `节缺` ∥ 段落长 ∥ 行太长），理由是用户 16:44 那句把段长按回「拦」 | 需求档 `docs/core/requirements/DOC-CHECK.md` 的档头句「**闸只由这两类构成**」与 F3 同名句是旧口径 ⇒ **[上抛·待裁] 归主 agent 改成指针**（需求档不在本席笔域） |
| 4 | §9 增量按今天的 RTM 重出 | `DOC-CHECK.md` §9.1 计数改「改写 = 3 ∥ 破 = 3 ∥ 冗余 = 0 ∥ 新增 = 1」；新增表只留 `7-20`；另点名「已在盘四行不重复新增：`7-17` ∥ `7-18` ∥ `7-19` ∥ `44-2`」；破的三行 = `26-3` ∥ `26-6` 的 `gate` 半幅 + `45-2` 整行撤；§9.2 改「新增 = 0」、标题去「上一批」。`37-3` 所在册本席未读 ⇒ 标「归实施席按同一句核」，不冒充读数 |
| 5 | `LCS_CELL_CAP` 退回支：无场景、无可复现命令 ⇒ **删** | `DOC-CHECK.md` §2.10.4 的「**退回形（判据的一部分，不是实现的私活）**」段与「**退回的代价如实写**」段两段整删 |
| 6 | 贴线判表按实测改 | `docs/core/design/PATH-RESOLUTION.md` §3：标题改「本批两档过线」；`index.mjs` 行改「**越 800 硬线**（1076 行）」；`anchors.mjs` 行改「**越 500 设计器硬线**（630 行）」；原「**本批不拆**」段与本地那份拆分计划整块换成一句「分拆方案单源 = `docs/core/design/DOC-CHECK.md` §2.9.7」（D2：两份计划迟早各改各的） |
| 7 | 档头「本批的判据条目」删 | `DOC-CHECK.md` 档头改「需求层 = `docs/core/requirements/DOC-CHECK.md`（F1–F23 / AC-1–AC-19）」，不再把某几个条目认作「本批」 |
| 8 | `graph-tokens.mjs` 补进 §4 表 | §4 新增一行：未越线（160 行）、第五个 `isDocToken` 消费面、裸写代码族档名不再作边（§2.10.3） |
| 9 | 函数档读数：写明谁在哪一步取 | §2.9.7 改「读数归父侧收口门那一次跑：量法 = 逐函数花括号配对的 `node` 词法扫描，命令与结论记批档 §6」；删「本轮尚未取到读数」这类过程叙述 |
| 10 | §2.10.7 上抛补 D13 三件 | 改为「**这一条是待裁，不是已裁**：谁裁 = 主 agent；按什么裁 = 需求档 F14 那句改指针时一并裁；到期 = 本批收口前，到期未裁按本段现文生效」 |
| 11 | §3 契约行补入参 | `DOC-CHECK.md` §3 的判法入口行改「`checkAnchors(root, { files, manifest?, exts?, textOf? })`」——与盘上 `index.mjs` 的 `checkAnchors(g.root, { files, manifest, exts, textOf })` 调用面一致 |
| 12 | 九处后缀兜底引用改仓根全路径 | `docs/core/design/DOC-DISCIPLINE.md` 六处落笔：`thincoder-core/agent-tools/doc-check.mjs` 四处（A-DD29 判据 1 ∥ 5、A-DD30 判据 1、判据 7 的声明面）· `thincoder-core/tool-docs/doc_check.md` 两处（A-DD29 判据 1、A-DD30 判据 8）· `docs/core/requirements/NORMAL-MODE.md` 一处（§3 死指针判据的实测句）。第九处原文本就带仓根，无需落笔 |
| 13 | 无标准档 / 无文档地图这两项限制 | 记在本段一句：本仓没有标准层目录、没有文档地图，因此评审的方法学合规与文档归属两项只能按惯例判；本批不另立标准档 |

**写入面的一次自我拒绝（知会 §6）**：本轮首次写入被本档自己的门按 `锚·档缺` 拒掉六条——分拆方案里六个新档名此刻不在盘。改法 = 把新档名收进围栏块（§8 的两条合法写法之一），语义一字未改。这不是绕过判据，是那份清单本来就属「示例枚举」一类。

**机检**：`doc_check({mode:"gate", docs:[三档设计档]})` 结论见交付报告（三档全清）。

**未落地（不在本席笔域）**：

1. **`docs/core/requirements/DOC-CHECK.md`**：档头「**闸只由这两类构成**」与 F3 同名句改指针（单源 = 设计 §2.9.1 的五类）；AC-7 ① 的「不出存量读数」旧口径（§10 第 1 条）。
2. **提示词面** `thincoder-core/prompts/persona-eng-coder.md` 那一行（§11 A 组）。
3. **测试面**：`test/rtm/guard.md` 的 `7-3` ∥ `7-16` ∥ `7-19` 改判、`26-3` ∥ `26-6` 的 `gate` 半幅、`45-2` 整行撤；`test/RTM.md` 故事 26 标题。
4. **代码面**：`thincoder-core/doc-check/index.mjs` 的 `EXEMPTION_KINDS` 仍含 `LINE_REF_CLASS`，`hits` 仍带 `lineRefs`——随 §2.9.1 推论 4 一并收（实施轮）。

### 19 修正轮：评审第 2 轮 10 条逐条处置（父侧 2026-11-11 派单）

**射程**：本轮只改文档，零代码（父侧原文：「只改文档，别动代码。`doc_check` 过即报，逐条报「改了哪处 → 逐字」」）。逐条处置如下，行号不入账，改处按节名 + 逐字前后文点名。

#### 19.1 逐条

| # | 处置 | 落点与逐字 |
|---|---|---|
| 🔴1 | 补第三档过线 + 分拆方案 | `docs/core/design/PATH-RESOLUTION.md` §3：「**贴线判（设计器硬线 500 · 其他检查硬线 800）：本批两档过线。**」→「本文受影响源码里有三档过线。」；表增一行「`thincoder-core/agent-tools/subagent-spawn.mjs` \| **越 500 设计器硬线**，分拆方案见本节末条」；表题改「下表四档」；新增末条「`subagent-spawn.mjs` 的分拆（本档自有的受影响档，方案住本节）：切两族」——族一 = 任务书与 system 固块拼装（`taskBriefOf` ∥ `filesBlockOf` ∥ `DOCS_COORDINATE_KEYS` ∥ `DOCS_COORDINATE_PREFIX` ∥ `docsCoordinatesBlockOf`）∥ 族二 = 设计令牌门（`resolveDesignSlot` ∥ `designTokenRefusal` ∥ `gateDesignToken`），新档名住围栏；「只搬不改」+ 再导出保对外 import 零改 + 验收 = 落到设计器硬线以下且 spawn 判据用例逐条同名同结果 |
| 🔴2 | 集成用例档进 §4 表 | `docs/core/design/DOC-CHECK.md` §4 表增六行：`batch-close-gate.test.mjs`（`7-3` 改判；越 500，分拆方案见 §2.9.7）∥ `batch-touched-region-gate.test.mjs`（`7-16` ∥ `7-19`）∥ `cross-repo-refs.test.mjs`（`37-3`）∥ `doc-check-line-refs.test.mjs`（`26-3` 的 `gate` 半幅）∥ `doc-check-fence-verdict.test.mjs`（`26-6` 的 `gate` 半幅）∥ `doc-check-exemptions.test.mjs`（`45-2` 整行撤）；后五个均注「未越线」 |
| 🔴3 | 绝对读数离规范面 | `DOC-CHECK.md` §2.9.7 删「（1076 行）」∥「（630 行）」∥「未越线的四块（读数已取）…（352）∥（218）∥（488）∥（160）」四处；§4 的 `graph-tokens.mjs` 行「未越线（160 行）」→「未越线」；`PATH-RESOLUTION.md` §3 删同两个数。两处标题句各加「绝对行数与命令回执住批档」（§2.9.7 并引 §3.30.1） |
| 🔴4 | 删「另批处理」通道 | `DOC-CHECK.md` §2.9.7「新撑越 500 线的块另批处理。」→「**搬出来的档若撑越 500 设计器硬线 ⇒ 本批收口前再拆一次**：硬限不允许诞生，「另批处理」这条通道不存在。」 |
| 🟡5 | 识别面落点定死 | 定死「新档定义、`anchors.mjs` 再导出」：`DOC-CHECK.md` §2.6 落点句「…`thincoder-core/doc-check/anchors.mjs` 导出的一组常量与一个谓词。」→「识别面一族的定义住新档 `doc-tokens.mjs`…；`thincoder-core/doc-check/anchors.mjs` 再导出这一族 ⇒ 消费面的 import 行零改。判据面…仍住 `anchors.mjs`。」；§4 的 `anchors.mjs` 行增「识别面一族的定义面随 §2.9.7 的分拆搬新档、本档再导出」；§5 两行（`NAME_CH` 族 ∥ `DEFAULT_DOC_EXTS`）的落点格同改 |
| 🟡6 | 计数改 2 | `DOC-CHECK.md` §9.2 判据行「新增 = **0**；缺的那一行已落为…`44-1` ∥ `45-1` 也已在盘」→「新增 = **2**（`44-1` ∥ `45-1`，配故事 `CLI 44` ∥ `CLI 45`，逐条四件见下）；识别面缺的那一行 = `36-3`，不另立新号」 |
| 🟡7 | 判现值后处置 | 见 19.2——两处都不是现值，本席不改 `A-DD38 ③` 一字（它是判据形、不载绝对值），需求档 F12 那侧上抛 |
| 🟡8 | 保留 | `§2.10.7` 一字未动（三件齐备 = D13 合规） |
| 🟡9 | 本批不动，记已知 | 见 19.3 第一条 |
| 🟡10 | 本批不动，记已知 | 见 19.3 第二条 |

#### 19.2 🟡7 的判据：同一条命令，两处读数，没有一个现值

读数（命令 = `node scripts/prompt-refs-check.mjs`，cwd = 本仓根，本次运行）：`EXIT=1`；汇总行「汇总：提示词面 85 档 · 代码面 506 档 · 命中 9」；末行「FAIL(prompt-refs): 9 条文档引用命中（闸态——阈值 0）」。

- **需求档 F12 的「从 10 条降到 4 条」**：那批的当次验收读数——读数面，不是现值（今天读到 9）。
- **`docs/core/design/DOC-DISCIPLINE.md` 的 `A-DD38 ③` 与 §3.24 的「零命中 ∧ `exit 0`」**：**判据形**，本身不载绝对值（§3.24 明写「判据值（一句 · 绝对值不入本档）」）⇒ 它不是那条命令的「读数副本」，删它等于把判据降成读数。今天它为红，是真债，不是文档病。

**处置**：本席不动 `A-DD38 ③`。需求档 F12 那侧归主 agent——建议改成判据指针（单源 = `A-DD38 ③`），并把那 9 条真命中交清账轮。**[上抛·待裁]**

#### 19.3 已知两件（父侧裁定本批不动）

- **受影响文件表落在设计档 §4**，与 F-R24a「受影响文件表归批档 §2，设计档不设」相抵：面位问题，既有，本批不动（父侧同日派单原文「这是既有的面位问题，**本批不动**，写进 §2 一句已知即可」）。
- **设计档无「变更记录」段**，与 F7-1 相抵：D8 禁止设计档与需求档出现变更记录 ∥ 历史沿革族，**设计层胜**，本批不动（父侧同日派单「**D8 禁止，设计层胜；本批不动**」）。

#### 19.4 机检与读数

- **交付门**：`doc_check({mode:"gate", docs:["docs/core/design/DOC-CHECK.md", "docs/core/design/PATH-RESOLUTION.md"]})` ⇒ 首行 `DOC-CHECK GATE: PASS`，结论「0 段有问题（2 档全清）」。
- **档位读数**（命令 = `doc_check` 的 `lines` 面）：`subagent-spawn.mjs` 558（越 500）· `batch-close-gate.test.mjs` 542（越 500）· 其余四个集成用例档 183 ∥ 142 ∥ 138 ∥ 106（均未越线）。规范面不载这些数，只载越线与方案。

#### 19.5 本轮写入面的一次自我拒绝（知会 §6）

`PATH-RESOLUTION.md` §3 首次写入被本档自己的门按 `锚·档缺` 拒掉一条：`依据 …「export { … } from "./subagent-spawn.mjs"」` 里那段内置路径被读成相对本档目录的指针。改法 = 引文只引带符号的那半句（逐字仍是该行的连续子串），路径不搬进引文。语义一字未改——**被引那份档不在写者的判域里，引文就该停在判据要用的那半句**。

#### 19.6 未落地（不在本席笔域）

1. 需求档 `docs/core/requirements/DOC-CHECK.md` 的 F12 读数句（19.2）——归主 agent。
2. 六个集成用例档的改写与 `test/rtm/guard.md` 的行（§9.1 的改写 ∥ 破 ∥ 新增）——测试面归实施席。
3. 分拆方案（`index.mjs` ∥ `anchors.mjs` ∥ `subagent-spawn.mjs` ∥ `batch-close-gate.test.mjs` 四档）——落盘归实施席，本批收口前须完成，不许推下批。

### 20 修正轮（第 3 轮）：受影响文件面移出设计档，清单搬进本段

**判据（为什么搬）**：`docs/core/design/DOC-DISCIPLINE.md` §3.7 条目 H 原文「设计 / 需求档**不设「受影响文件」表**——那张表答的是「这一批改了哪些档」，是一次性执行记录；……该表归**批档 §2**，状态档一格不留」，`A-DD15` 同一句。

而 `docs/core/design/DOC-CHECK.md` §4 写着「受影响文件面反过来只在本节这张表」——两份在审的设计档，同一件事说成两个面。**数撤掉了，表还在**；上一轮「面位问题本批不动」的理由被评审驳回，驳回是对的。

#### 20.1 改了什么（三处 + D14 连带四处）

| # | 处 | 改成 |
|---|---|---|
| 1 | `docs/core/design/DOC-CHECK.md` 的 §4（整节） | 删：表 · 「以下落地件由实施轮创建」围栏 · 「档层结论单源 = §2.9.7 / 受影响文件面反过来只在本节这张表」那句。三句实质接缝叙述（`per-root.mjs` 一族已整族住在那里 ∥ 该接缝是拆分起点 ∥ 档位语义单源 = `DOC-GRAPH.md` §3）一字不改，就地归入 §3 接口契约 |
| 2 | 同档 §2.7 的「#### 受影响文件与档层结论」小标题与其「读清单去 §4，读结论去 §2.9.7」句 | 删；该节末句（判据面两条）留 |
| 3 | 同档 §2.9.7 三段 | 首段去「受影响文件面 = 本档 §4 那张表」，改「逐档改动清单与档层读数不在这里：状态档不设该表（`DOC-DISCIPLINE.md` §3.7 条目 H），该表归批档」；「未越线的四块」改「未越线的源码档（十份）」并补齐六份（评审第 11 条）；「§4 表里的集成用例档同判」改「集成用例档同判」，另起一行补「其余六份集成用例档未越线」 |
| 4 | 同档 §2.6 那一句「`paragraph.mjs` 的载荷字段 `text`（§4）」 | → 「（§3）」 |
| 5 | 同档 §9 那句「`test/rtm/paths.md` 因而不进 §4 的受影响文件表」 | → 「因而不在本批改动面内」 |
| 6 | 同档 §2.6 的围栏块清单 | 删指 §4 那一行（原 14 行「落地件清单 · 示例枚举 ⇒ 留」——那块随 §4 走了），原第 15 行改为第 14 行；头句「共 15 块」→「共 14 块」（D3 计数与清单同拍） |
| 7 | `docs/core/design/BATCH-RECORD.md` §4.22 的「先例 = `DOC-CHECK.md` §4 对 `paragraph.mjs` 载荷 `text` 的处置」 | → 「§3」。删节后该指针即 `节缺`，按 D14 改指、不删句 |

**§2.9.7 本轮结论句（逐字）**

```text
- **未越线的源码档（十份）**：`thincoder-core/agent-tools/` 四份——`batch-gate.mjs` ∥ `batch-regions.mjs` ∥ `batch-lifecycle.mjs` ∥ `batch-paths.mjs`。
- **未越线续**：`thincoder-core/doc-check/` 三份——`graph-tokens.mjs` ∥ `line-refs.mjs` ∥ `paragraph.mjs`；另三份——`thincoder-core/manifest-schema.mjs` ∥ `thincoder-core/tools/doc-write-gate.mjs` ∥ `thincoder-core/agent-tools/doc-check.mjs`。档位语义 = `docs/core/design/DOC-GRAPH.md` §3，本节不另立判法；零改档（`thincoder-core/declaration.mjs`）不出档位结论。
- **集成用例档同判**：`test/integration/batch-close-gate.test.mjs` 越 500 设计器硬线 ⇒ 切「夹具与 git 语料」一族搬去新档（落点见围栏），用例本体留原档；**只搬不改**，验收 = 拆前拆后 `node --test test/integration/batch-close-gate.test.mjs` 逐条同名同结果。
- **其余六份集成用例档未越线**：`batch-touched-region-gate.test.mjs` ∥ `cross-repo-refs.test.mjs` ∥ `doc-check-line-refs.test.mjs` ∥ `doc-check-fence-verdict.test.mjs` ∥ `doc-check-exemptions.test.mjs` ∥ `doc-check-exclude-paths.test.mjs`。
```

#### 20.2 逐档清单（自设计档 §4 原样搬入；指针仍是设计档节号）

| 文件 | 改动 |
|---|---|
| `thincoder-core/doc-check/index.mjs` | ① 每组一次 `readManifest` 并注入判法；返回 `domainTables`；`report` 面域表读数块（§2.5）。② **保留** `excludeFaceOf` ∥ `splitExcluded` ∥ `excluded` 桶 ∥ `exemptedAll` 及三处读它 ∥ 排除桶行（排除面本批零改）。**增**：清单传递、装配处豁免分类、`exempted` 桶、两面豁免块、`report` 末行带已裁定数（§2.7）；另 `zones` 的逐档语义与零宽区照交（§2.9.4 ∥ §2.10.1） |
| `thincoder-core/doc-check/anchors.mjs` | ① 域表吃注入的 `manifest`（`docRootBaseKeys` ∥ `batchFaceContext`）；跨仓三笔（`resolveDoc` 传 `declaredRepos` · 环检出 `锚·环引` · 两处收集点收 `未核` 且不入 `hits`）——口径单源 = `DOC-DISCIPLINE.md` §3.20。② 扩展名枚举换作 `DEFAULT_DOC_EXTS` ∥ `NAME_CH` ∥ `EXT_PART` ∥ `isExtension` ∥ `isDocToken`，边界对转导出面；识别面一族的定义面随 §2.9.7 分拆搬新档、本档再导出；三条抽取式改由这组常量拼出并加 `u`；`docNameExemption` 词干判定改吃 `isExtension`；四个豁免调用点各加一次 `isDocToken`（§2.6）；另码段豁免面收为段级（§2.9.6 ⑤） |
| `thincoder-core/doc-check/line-refs.mjs` | `NAME_RE` 改由同一组常量拼出（含边界对）、本档第二份字符类整条删除，并加 `u`；import 面换新常量；`nameSpans` 的豁免调用点同加 `isDocToken`（§2.6）；另命中对象带上坐标原文 `text` |
| `thincoder-core/doc-check/paragraph.mjs` | 新增段级命令谓词，`isExecutableLine` 改为读它（§2.9.6 ⑤） |
| `thincoder-core/doc-check/graph-tokens.mjs` | 未越线。第五个 `isDocToken` 消费面：裸写的代码族档名不再作边，两张图形的边集因此变更、不入 verdict（§2.10.3） |
| `thincoder-core/agent-tools/batch-paths.mjs` | `batchDocBases` 增可选 `manifest` 注入（缺省自读，既有调用零改） |
| `thincoder-core/agent-tools/doc-check.mjs` | 改两处：① `target` 必填——缺 ∥ `null` ∥ 空串 ⇒ 拒、点名 `target`（缺省支删除）；schema 加 `required: ["target"]`；② `ambiguous` 守卫的「给了 `target`」判据 = 非空字符串（§3 ∥ §5 KD-10 ∥ AC-11）。工作区锚的提前返回已不在盘上，不重建；另两处读数行透出（§2.9.3 ② ∥ §2.9.4 ③） |
| `thincoder-core/agent-tools/batch-gate.mjs` | `append` ∥ `edit` ∥ 收口三面的判域（§2.9.4 ③⑥）；`append` 与 `edit` 的判定输入走 `texts`、区间走 `zones`，零临时档（§2.10.1） |
| `thincoder-core/agent-tools/batch-regions.mjs` | 承接 git 改动区与纯删映射（§2.9.4 ③⑥）；纯删基线走 `texts`、不落临时档；`fragmentPathOf` 的调用点随片段档一族整族退役（§2.10.2） |
| `thincoder-core/agent-tools/batch-lifecycle.mjs` | 在飞扫描不再按片段前缀排除，改按两条判：扩展名不是 `.md` 的不算批档 ∥ 点开头的不算批档（§2.10.2） |
| `thincoder-core/manifest-schema.mjs` | `DEFAULT_MANIFEST.index` 保留 `docCheckExcludePaths`（含数组层判据），新增 `docCheckExts` 与 `docCheckExemptions`；两键校验面分开写：`docCheckExts` 进元素层（非空字符串，非串 ∥ 空串进 `errors`），`docCheckExemptions` 两层都不入选校验（条目形态在消费点判，KD-X3）；数组层两键都 `[]` 合法；节点数因此为 16 |
| `thincoder-core/tools/doc-write-gate.mjs` | 排除面零改；**判域面改它**：hunk 并集 ∥ 身份 = 目标档 ∥ 片段档一族退役（§2.10） |
| `thincoder-core/declaration.mjs` | **零改**——`splitExcluded` 保留，`normalizePathList` 消费面也保留 |
| `thincoder-core/tool-docs/doc_check.md` | 解析序句已换三行终稿；保留两处旧排除键的免责式说明；增豁免登记与第三档说明、清单可配一句 |
| `thincoder-core/tool-docs/manifest.md` | 键面新增两行（`docCheckExemptions` ∥ `docCheckExts`），旧键行逐字保留；可写节点数句为 16；两键说明句写「后缀在清单内 ∧ 形分档（裸名按扩展名族）才是候选」；全文压回 5,000 字符以内 |
| `docs/core/design/MANIFEST.md` | §2.2 键面恢复旧键并新增两键 · 元素层句保留旧键点名 · `DEFAULT_MANIFEST` 两处字面（§2.2 ∥ §2.11）· §2.10 键目录补两行 · 节点数 16 五处对齐 · AC-47 口径 · 四处改成本轮口径（带目录段一族同判 · 裸名按扩展名族分档，判据句单源 = `DOC-DISCIPLINE.md` §3.20）· 「读 manifest 四处」两处改指本档 §2.8（五处） |
| `docs/core/design/DOC-DISCIPLINE.md` | **§3.20** 三件事分开写（判定范围只落传入文件 ∥ 扫描域不从 manifest 拿 ∥ 声明面只改判什么・拦不拦），扩展名写法换成清单（`DEFAULT_DOC_EXTS` ∪ 该项目 `index.docCheckExts`）并写形分档（验收 = 本档 §2.10.3 ∥ AC-G14）；**§3.21** 条目 T Ⅲ 与抽取单源句；**§3.23** 判定句改形分档口径；**§3.24** 两处（共用扩展名定义 ∥ 词干判定改吃 `isExtension`）；**§5 用例表** `DD-146` ∥ `DD-181` 同换口径 |
| `docs/core/design/DOC-GRAPH.md` | 一处改指（D14）：§1「起点事实」那处逐字依据改指活的扩展名清单（依据 `DOC-CHECK.md` §2.6），否则实施轮改完该句即成 `引缺` |
| `docs/core/design/BATCH-RECORD.md` | §4.18 的 append 面描述 ∥ §4.22 拒文根格：候选文本以批档本体身份判，临时片段档那条退场（§2.10.1） |
| `test/rtm/guard.md` ∥ `test/RTM.md` | **36-5 保留**（排除面行为未变），节注里指 §2.6 的那一笔改指 §2.7；故事 `CLI 44` ∥ `CLI 45` 与行 `44-1` ∥ `45-1`（§9） |
| `test/integration/doc-check-exclude-paths.test.mjs` | **保留**——它断的免检放行仍在；未越线 |
| `test/integration/batch-close-gate.test.mjs` | §9.1 的 `7-3` 改判：夹具把悬空指针放进本批改动区，并加一格「区外悬空 ⇒ 收口放行、回执零附加行」；越 500 设计器硬线，分拆方案见 §2.9.7 |
| `test/integration/batch-touched-region-gate.test.mjs` | §9.1 的 `7-16` ∥ `7-19` 改判：区外旧锚不阻收口 ∥ 区未定 ⇒ 不入判集、放行 + 一行覆盖明示；未越线 |
| `test/integration/cross-repo-refs.test.mjs` | §9.1 的 `37-3`：门面环引读数行退场，只剩「判集指向环上仓时照拒」；未越线 |
| `test/integration/doc-check-line-refs.test.mjs` | §9.1 破行 `26-3` 的 `gate` 半幅：行号坐标门内不出现，`hits` 只留锚 ∥ 段两数；未越线 |
| `test/integration/doc-check-fence-verdict.test.mjs` | §9.1 破行 `26-6` 的 `gate` 半幅：围栏内 ∥ 围栏外同类都只进清单；未越线 |
| `test/integration/doc-check-exemptions.test.mjs` | §9.1 破行 `45-2` 整行撤：坐标类豁免键随同一裁定消失；未越线 |

**落地件由实施轮创建（`test/**` 与新档不在本席笔域）**：

```text
docs/batches/2026-11-09-doc-check-recognition.test.mjs   那一笔的单元测试档
test/rtm/guard.md                                        44-1 ∥ 45-1 两行与节注
test/integration/**                                      集成用例文件（编号按 §9 落地）
thincoder-core/doc-check/doc-decl.mjs                    §2.9.7 ①
thincoder-core/doc-check/exemptions.mjs                  §2.9.7 ②
thincoder-core/doc-check/range-input.mjs                 §2.9.7 ③
thincoder-core/doc-check/line-reads.mjs                  §2.9.7 ④
thincoder-core/doc-check/report-blocks.mjs               §2.9.7 ⑤
thincoder-core/doc-check/doc-tokens.mjs                  §2.9.7 识别面一族
```

#### 20.3 本轮读数（命令与输出住本段，规范面不载）

命令 = `doc_check({mode:"report", docs:["docs/core/design/DOC-CHECK.md"], lines:[本节 20.2 的全部源码与集成用例档]})`。

- 越 800 硬线：`thincoder-core/doc-check/index.mjs` 1076。
- 越 500 设计器硬线：`thincoder-core/doc-check/anchors.mjs` 630 ∥ `test/integration/batch-close-gate.test.mjs` 542。
- 未越线 18 份，读数：`batch-lifecycle.mjs` 488 ∥ `declaration.mjs` 397 ∥ `batch-gate.mjs` 352 ∥ `doc-write-gate.mjs` 313 ∥ `batch-paths.mjs` 234 ∥ `batch-touched-region-gate.test.mjs` 228 ∥ `batch-regions.mjs` 218 ∥ `paragraph.mjs` 207 ∥ `manifest-schema.mjs` 186 ∥ `cross-repo-refs.test.mjs` 183 ∥ `graph-tokens.mjs` 160 ∥ `doc-check-exemptions.test.mjs` 142 ∥ `per-root.mjs` 138 ∥ `doc-check-line-refs.test.mjs` 138 ∥ `line-refs.mjs` 132 ∥ `doc-check-fence-verdict.test.mjs` 106 ∥ `agent-tools/doc-check.mjs` 96 ∥ `doc-check-exclude-paths.test.mjs` 87。
- 同一次跑还报「登记未命中 1 条」——即项目清单里那条已裁定假阳的登记，本机正在盘上对不上，属既有面，本席不动清单。

#### 20.4 边界与上抛

- **不动需求档**：评审第 7 条（F12 与 AC-10 ① 两条活读数）由父侧改掉，本席一字未碰。
- **不再有第二张表**：设计档 `DOC-CHECK.md` 里没有任何逐档清单；本段 20.2 是它唯一的落点（D2 单源）。
- **[上抛·知会]** 其它设计档若还留「受影响文件」表，本席未逐档扫；本轮只按评审点名处置 `DOC-CHECK.md` 一处。

### 21 修正轮（评审第 9 轮 4🔴 · 6🟡 · 1🔵 逐条处置）

**射程**：只改两份设计档（本席笔域 = `docs/core/design/DOC-CHECK.md` ∥ `docs/core/design/DOC-DISCIPLINE.md`）。零代码、零测试面、零需求档。

#### 21.1 逐条（改前 → 改后）

| # | 处置 | 落点与逐字 |
|---|---|---|
| 🔴1 | `D-1` 改判成「坐标类没有登记面」 | `DOC-CHECK.md` §2.9.9：改前「登记 `kind` = 行号坐标、`text` = 该行整行原文 / `豁免 1 条`，命中减一」→ 改后「造一条正文面坐标命中；再在清单里登记一条 `kind` = 行号坐标 ⇒ 门面回执零该类行、首行 `PASS`（`hits` 只有锚 ∥ 段两数）；同一处在 `report` 面逐处列出；登记那条落 `登记未命中 1 条`」。活的一句 = §2.9.5 ④，`D-1` 现在只判它 |
| 🔴2 | `hits` 两桶收口 | `AC-5` ∥ `AC-8` ∥ `AC-11` ∥ `7-14` 的「`hits` 三桶（锚 ∥ 段长 ∥ 行号坐标）」→「`hits` 两数（`anchors` ∥ `paragraph`）」；`AC-5` 同时删掉逐档值里的 `collectLineRefs` 项，并写明「行号坐标不进 `hits`（§2.9.5 ④），因此不参与本条的逐项比较」；§3 契约的引擎返回行「`hits` 三数口径、`anchorHits` ∥ `paragraphHits` ∥ `lineRefHits` 形状不变」→「`hits` 两数口径（`anchors` ∥ `paragraph`，和 = `hits.total`）不变；行号坐标不进 `hits`，返回形不携它的键」——与 `DOC-DISCIPLINE.md` 的 `DD-150` 同源 |
| 🔴3 | `DOC-DISCIPLINE.md` §3.30.3 整节删除 | 删掉的是「受影响文件与分层结论」标题 + 52 条路径清单 + 「清单只界定受影响文件」句 + 「分层结论 = 无档跨分层」。依据 = 同档 §3.7 条目 H「设计 / 需求档**不设「受影响文件」表**……该表归**批档 §2**，状态档一格不留」。连带：原 §3.30.4「验收、用例与边界」重编为 **§3.30.3**（节号连号；该节内容一字未动） |
| 🔴4 | §2.3 的「同名根」分支删除 | 改前「项目名 = 本次调用里能唯一定位该根的最短路径后缀……重名（两个项目各有一个 `web`）⇒ 往前多取一段」→ 改后「项目名 = 该根的完整路径（不取末段、不做取短）」，并写明取短那一支没有现场（本仓两个根的末段本已不同）。连带两处同源：`AC-6` 的「项目名按 §2.3 取最短唯一定位后缀，同名根必须分得开」→「项目名 = 该根的完整路径，§2.3」；`7-10` 改判成「两根目录末段同名 ⇒ 标签 = 该根的完整路径，两根因此天然分得开；无同名根时同一句式、无第二分支」 |
| 🟡围栏清单 | 按现盘重列 | `DOC-CHECK.md` §2.6「本档围栏块共 14 块」→「本档围栏块逐块判过（清单如下）」**不写数**（计数与清单同拍的风险随之消失），表由 14 行重列为 24 行：补 `§2.11.1` ∥ `§2.9.3` ∥ `§2.9.4` ∥ `§2.9.7`×3 ∥ `§2.10.2` ∥ `§2.10.3`×2 ∥ `§2.10.4`；「用例表」那一行从 `§2.6` 改记 `§2.7 用例表小节`（盘上该围栏在 §2.7 的 `#### 用例表` 之下） |
| 🟡§9 四件 | 改写 ∥ 破两组都补四件 | §9.1 改写表列头「行 ∥ 为什么变 ∥ 改成什么」→「行 ∥ 交互 ∥ 业务可观察结果 ∥ 服务需求 ∥ 入口」；破三行由一句散文改成同形四列表（`26-3` ∥ `26-6` 的 `gate` 半幅 ∥ `45-2` 整行撤各一行） |
| 🟡§2.11 位置 | 物理搬移 | `### 2.11 判域的两条收边` 整节（含 §2.11.1–§2.11.4 与全部围栏）从「§2.5 与 §2.6 之间」搬到「§2.10.8 之后、`## 3. 接口契约` 之前」；节号不变（2.11 现在读在 2.10 之后）。正文逐字未改，只换了位置 |
| 🟡旧表述 | 删旧留新 | 档头「第三笔只换写法、不动任何判据。」整句删（改为「判定逻辑、命中类与 verdict 串不动」）；§2.6「先前那一版把路径形从清单里放出来，理由是……」改为现在时的理由句（路径分隔符证明的是「这是一条路径」，不是「这是一份档」） |
| 🟡`未核` 定一个说法 | 一处定义 + 两处引用 | §2.5 新增一条：「`未核` 与「域外不判」是两件事——`未核 N 条` 是**覆盖**行（这一轮有一批没判到，删了就是假绿）；域外（未声明 ∥ 出仓）在判域之外，连行都不出（§2.11.2）」；§8 的边界行与 §2.5 的 `gate` 面句同口径重写 |
| 🟡F14 待裁 | 保留登记，一字未动 | §2.10.7 现文已是 D13 三件齐（谁裁 = 主 agent ∥ 按什么裁 = 需求档 F14 改指针时一并裁 ∥ 到期 = 本批收口前，未裁按本段现文生效）。裁定本身不在本席笔域 |
| 🔵非功能层 | 未做，上抛 | 见 21.3 第 3 条：给设计档补「非功能硬指标含度量」是**新内容**，修正轮不收新语义 |

#### 21.2 读数（命令与输出住本段，规范面不载）

**交付门**：`doc_check({mode:"gate", docs:[两份设计档]})` ⇒ 首行 `DOC-CHECK GATE: PASS`，结论「0 段有问题（2 档全清）」。

**行数读数**（命令 = `doc_check({mode:"report", docs:[两份], lines:[两份]})`）：`DOC-CHECK.md` 1185 · `DOC-DISCIPLINE.md` 3985。

**行数走向如实写**：本轮 `DOC-CHECK.md` **+16**、`DOC-DISCIPLINE.md` **−63**，两档净 −47。加行的只有两处，都是评审点名要补的结构面：围栏清单 14 → 24 行（+10）、§9 两组表补四件（+6）。没有新增机制。

**围栏清单自检**（命令 = `node` 逐行扫围栏标记，域 = `DOC-CHECK.md`）：围栏块 24 个，清单表 24 行 —— 两个数相等。

**§9.1 计数自检**：计数行「改写 = 3 ∥ 破 = 3 ∥ 冗余 = 0 ∥ 新增 = 1」与表行数对齐（改写 3 行 ∥ 破 3 行 ∥ 新增 1 行）。

#### 21.3 未落地与上抛

1. **[上抛·待裁]** 需求档 `docs/core/requirements/DOC-CHECK.md` 的 F11 残留旧表述（「原先「`gate` 面判整档」的口径作废」）——评审 🟡 点名那条的一半，需求档不在本席笔域。
2. **本批自查发现、未动笔的三处**（同一条纪律的兄弟副本，都在 `DOC-DISCIPLINE.md`，`grep` 可复现：`\*\*受影响文件\*\*`）：第 2457 行（§3.26 条目 Z）、第 2544 行（§3.27 条目 AA）、第 2619 行起的整块（§3.28 条目 AB，含「跨层结论」）。三处都是「设计档里带受影响文件表」，与 §3.7 条目 H 同向相抵。**没动的原因**：§3.27 那一块的「跨层结论」段里混着一条仍活着的写法惯例（改面单元测试档不写死路径、由实施轮按惯例定位），整段删会把那条惯例一起带走——需要主 agent 定「惯例搬去哪」，或另开一笔只删表、留惯例。建议归本批收口前处置。
3. **[上抛·知会]** 🔵 非功能层：需求档无「非功能性需求」层、设计档无「非功能硬指标含度量」（模板 F2-2 ∥ F7-1）。补这一层是新内容，修正轮不夹带；要落地请另立一笔。

### 22 修正轮：退役对象「设计档带受影响文件表」三处收口（父侧 2026-11-12 派单）

**射程**：只改 `docs/core/design/DOC-DISCIPLINE.md`。零代码、零测试面、零需求档。

#### 22.1 逐处（改前 → 改后）

| # | 处 | 改成 |
|---|---|---|
| 1 | §3.26 条目 Z 的 `**受影响文件**：新增 …零跨层…` 整行 | 删。该行的「零跨层」与同节「尺寸结论」行重复，判据不受影响 |
| 2 | §3.27 条目 AA 的 `**受影响文件**：落点表八档…` 整行 ∥ `**跨层结论**：零跨层…` 整行（含行内「改面单元测试档的档位结论与判法」） | 删；夹在里面的活惯例另行落点（第 3 行） |
| 3 | §3.4 条目 E 的载体行之后 | **增**一段「载体定位（判据句）」：载体在实施轮建档才上盘 ⇒ 设计 / 需求档与批档正文都不写死它的路径（写死即一条悬空锚）；定位 = 在批档目录内取「与批次档同名、名尾加 `test`、扩展名 `.mjs`」那一档，复跑 `node --test <该档>`（cwd = 仓根）。落点理由 = 该行原本就答「载体是谁 ∥ 住哪 ∥ 怎么命名」，定位是同一问的第三半 |
| 4 | §3.28 条目 AB 的 `**受影响文件**：` 整块（四条 bullet）+ `**跨层结论**：零跨层…` 整行 | 删 |
| 5 | §3.10 的「这三条量的是…「受影响文件」表退场后它们照旧在」句 | 改成判域句「与批档无关：设计评审据此逐档判…」。原句是退役叙述（D8 的「关于已删物的否定句」），随同一个退役对象一并收 |

#### 22.2 读数（命令 + 结果，本次运行）

```text
grep "受影响文件" docs/core/design/DOC-DISCIPLINE.md   ⇒ 7 处（三处目标已归零）
grep "跨层结论"   docs/core/design/DOC-DISCIPLINE.md   ⇒ 0 处
```

余下 7 处逐处归类——没有一处是「设计档里的一张受影响文件表」：

- `§3.7 条目 H` 的禁止句本体（「设计 / 需求档**不设「受影响文件」表**」）= 活规则的家。
- R2 ∥ R8 两行改档台账 = 答「别的档里那张旧表改成了什么」。
- `assertTierPlan` 那行 = `batch-tier-gate.mjs` 读**批档 §2** 的「受影响文件（机读清单）」，活消费面。
- `A-DD15` = 同一条规则的机械面判据行。
- 判据② 的泛指族举例与其正则字面 = 「受影响文件表」是**指批档**的类名词之一。

**「0 处」这判据今天不成立**：余下七处指名的是两个仍在用的东西——批档 §2 的机读清单与那条禁止句本身。凑到 0 只能删活规则或改判据字面，那是让 check 去写记录。**[上抛·待裁]** 请裁：接受「7 处 + 归类」∥ 还是连活规则一起改。

#### 22.3 门与未落地

- `doc_check({mode:"gate", docs:["docs/core/design/DOC-DISCIPLINE.md"]})` ⇒ 首行 `DOC-CHECK GATE: PASS`，结论「0 段有问题（1 档全清）」；同一次跑报「登记未命中 1 条」，属本仓 manifest 既有面，本席不动。
- 另两档（`DOC-CHECK.md` ∥ `BATCH-RECORD.md`）的同族残留本轮未扫——父侧只点名本档，本席不越笔。

### 23 修正轮：退役对象「设计档带受影响文件表」在另两档的收口（父侧 2026-11-12 派单）

**判据（父侧本轮改后那条，取代旧「grep = 0」）**：**有表就删（表归批档 §2）；只引用这个词的不动，归类上报**。「零出现」不是终态——禁止句本体、批档 §2 的机读清单、消费面、举例都用这个词，凑零只能删活规则。

**射程**：只改 `docs/core/design/BATCH-RECORD.md` 一处。`docs/core/design/DOC-CHECK.md` 零改。零代码、零测试面、零需求档。

#### 23.1 读数（命令 = 内置 `grep`，域 = 单档全文）

```text
串「受影响文件」： DOC-CHECK.md = 1 处 · BATCH-RECORD.md = 14 处
串「受影响面」  ： DOC-CHECK.md = 0 处 · BATCH-RECORD.md = 10 个块头
```

两串合计 = `DOC-CHECK.md` 1 ∥ `BATCH-RECORD.md` 24（同域第二把尺 = `node` 逐行扫，两数相等）。

#### 23.2 逐处归类（有表 / 引用）

**表 = 1 处，已删**：`BATCH-RECORD.md` §5.4 的「**同批落点表（五档——…D11 要求同批同拍…）**」——列 = `# | 档 | 改什么`，五行逐档写「改哪个提示词档、改什么」。它答的正是「这一批改了哪些档」= 一次性执行记录，家 = 批档 §2。该表不含上面那两个串（表头是 `# | 档 | 改什么`），由表头扫描找出，因此不在 23.1 的 25 行读数之内。

改前 → 改后（逐字要点）：

- 改前：五档表 + 两条只解释该表的条目（「第 5 档为什么排在落点表里」∥「第 5 行的扫面不止那两处」）。
- 改后：一句规则散文 + 一条条目。散文 = 「同一规则的各声明面同批同拍（D11；缺一即本批未完成）」+ 四段提示词面点名 + 设计档面 `D-PS16` ∥ `K6` 走 D17 正向路 + 「逐档落点表归批档 §2，本档不设」；四档档名改由围栏承载，坐标一字不丢。条目 = 「扫面不止流程句那两处（D14 一次扫完）」。

`DOC-CHECK.md` 的表 = **0 处**（§4 那张表已在上一轮整节删除；该档现存 `# | 档 | …` 形表全部是判据表 / 三问表 / 用例表 / RTM 行，不答「本批改了哪些档」）。

**引用 = 15 处，全部不动**：

- `DOC-CHECK.md` 1 处：§2.9.7 的禁止句本体（「状态档不设「受影响文件」表……该表归批档」）= 活规则的家，正是 §3.7 条目 H 的落点。
- `BATCH-RECORD.md` 14 处，逐类：批档 §2 的内容面与最薄形（designer 侧一句 ∥ §2 模板占位 ∥ §4.20 指针闭集 ∥ 最薄形 ∥ 三问行）5 处 · 用例行 `BR-16` ∥ `BR-91` 2 处 · L7 护栏的取数面与射程 3 处 · §5 纪律行 1 处 · 提示词档的节名（`persona-eng-designer.md` 的受影响文件清单）2 处（其中 1 处是 `DOC-GRAPH.md` §3 的逐字依据引文）· §4.23 的档层结论散文 1 处（它指向批档 §2 那张表，本身不是表）。

**另查过、不属本族的近形表（各一行落在原地）**：替代者收口的「三条必带内容」表（规则表）· 结算签字的「机制三件」表（机制表）· §5 的「六列清单」模板行（载体形模板，家 = 批档 §5）· §6.2 的镜像锚 A1–A10（锚表）· `DOC-CHECK.md` 的三问表 ∥ 用例表 ∥ AC 表（判据表）。

#### 23.3 门与未落地

- `doc_check({mode:"gate", docs:["docs/core/design/DOC-CHECK.md", "docs/core/design/BATCH-RECORD.md"]})` ⇒ 首行见交付报（写入面被本档自己的门拒过一次：首稿那段一行装五件事，改「两句短句 + 一空格分段」后才落，语义零改）。
- **首稿被拒一次（知会）**：`REFUSED（1 段文字太长）`，命中新写那句。处置 = 拆成两句、中间空行分段；未动判据、未动内容。
- **[上抛·待裁] 「受影响面」10 个块头 = 同族但不同形**：块内是条目/围栏，不是表，答的却是同一问（本批改了哪些档）。整块删会把活的机制坐标一起带走（例：「新档 `batch-supersede.mjs`：动作本体 + 五条拒面」今天仍是「这套机制住在哪」的现况句）。处置建议 = 逐块改写（删一次性叙述、留活坐标），不是删块。这是改「这些句子说什么」的语义面，本席不自行落笔，请父侧裁。
- **[上抛·知会]** `DOC-CHECK.md` 的 §2.9.7 围栏里仍列着分拆后的新档名——那是围栏内的示例枚举（`doc_check` 围栏整块跳过），不是档表，本批不动。

### 24 修正轮：「受影响面」块拆两半（父侧 2026-11-12 裁定落地）

**裁定（父侧）**：「受影响面」块拆两半——「零改面」删，「实现 / 文档面」留。判据 = 这句话在回答「机制在哪」，还是在回答「这一批动了什么」；前者是状态、后者是过程。边界 = 只做减法，活坐标一个字不能丢。

**读数（命令 = 内置 `grep`，域 = 本档全文，本次运行）**：

```text
串「零改面」  ：改前 6 处（5 条条目 + 1 处引用） → 改后 0 处
串「受影响面」：改前 10 行 → 改后 10 行（9 个条目块头 + §4.17 节标题，块头一条未动）
```

§23.1 记的「10 个块头」把 §4.17 的**节标题**算进去了；实为 9 个条目块头。

#### 24.1 逐条（改前 → 改后）

| # | 处 | 改前逐字 | 改后 |
|---|---|---|---|
| 1 | §4.17 块 | 零改面条：骨架与占位字面（`TEMPLATE_PLACEHOLDERS` ∥ `TOOLS.md` §6.20 判定域）逐字不动 | 整条删 |
| 2 | §4.18-A 块 | 零改面条：`STATUS_WORDS` 字面 · 六段作者表 · append 段白名单 · 冻结门对已收口档 append/status 的拒（逐字）· `close` 的 §6 单段拒串（唯一缺段时逐字）· `thincoder-core/agent-tools/batch-read.mjs` 读面 · 台账 | 整条删 |
| 3 | §4.20 块 | 零改面条：裁定行锚 ∥ `verdictGapOf` ∥ 轮次块计数 ∥ V3 ∥ 段白名单 ∥ 冻结门 ∥ 链门 ∥ 段序门——判据一行不动 | 整条删 |
| 4 | §4.21 块 | 零改面条：`STATUS_WORDS` 字面 · 六段作者表 ∥ 段白名单 · 冻结门 / 链门 / §5 段序门 / §3 裁定行闸 · 骨架与占位字面 · `thincoder-core/agent-tools/batch-read.mjs` · `updateSectionStatusLine` 本体 · 台账六态与已核销行的冻结 | 整条删 |
| 5 | §4.23 块 | 零改面条：`statusPassPlan` ∥ `statusResetPlan` ∥ `updateSectionStatusLine` ∥ 段白名单 ∥ `batch` 工具的三类写面（append / edit / status）∥ `§5` 写门 ∥ `persistEngTokens` 本体 ∥ `ADVISOR-GUARDS.md` §1.1 判据①（轮次块数） | 整条删 |
| 6 | §4.21 验收回指的「零回归」行 | `本条「零改面」+ 四件不动单写者` | `四件不动单写者` |

第 6 条不是新内容，是第 4 条的连带：它是被删条目在本档里的**唯一引用点**，不改即一句悬空锚（D14 一次扫完）。

#### 24.2 删完逐块自检（每块还答得出「这套机制住在哪」吗）

| 块 | 留下的条目 | 结论 |
|---|---|---|
| §4.17 | 实现（`batch-skeleton.mjs` 多枚归一 + 渲染 ∥ `batch-lifecycle.mjs` 的 `reanchorOnClose` ∥ `batch.mjs` 的 `ledger` schema）· 文档 / 描述面（`tool-docs/batch.md` 的 `ledger` 参数描述） | 答得出 |
| §4.18-C | 单段散文：`batch-ledger-view.mjs`（`repairDecisionOf` 住此）∥ `batch-lifecycle.mjs` 两条收口径 ∥ `batch-closeout.mjs` 补关分支 ∥ `tool-docs/batch.md` | 答得出（本块无零改面条目） |
| §4.18-D | 九条实现 / 描述 / 锚句 / 提示词条目逐一在位（新档 `batch-supersede.mjs` 动作本体 + 五条拒面等） | 答得出（本块无零改面条目） |
| §4.18-A/B | 实现 · 描述面（`TOOLS.md` §6.24）· 读数随动（`PROMPT-SYSTEM.md` §6.11）· 测试面 | 答得出 |
| §4.19 | 六条实现坐标（`batch.mjs` ∥ `batch-gate.mjs` ∥ `batch-lifecycle.mjs` ∥ `tool-docs/batch.md` ∥ `batch-skeleton.mjs` ∥ 提示词三处） | 答得出（本块无零改面条目） |
| §4.20 | 提示词六档 · 工具描述面两处 · 描述面预算读数 · 跨仓锚句族 A5 / A6 / A8 | 答得出 |
| §4.21 | 实现（六档）· 描述面 · 测试面 | 答得出 |
| §4.22 | 五条实现 / 描述 / 单测坐标 | 答得出（本块无零改面条目） |
| §4.23 | `design-token.mjs` 三处 · `advisor-settle.mjs` 一笔 · 单测档 | 答得出 |

#### 24.3 门、残余与边界

- **交付门**：`doc_check({mode:"gate", docs:["docs/core/design/BATCH-RECORD.md"]})` ⇒ 首行 `DOC-CHECK GATE: PASS`，结论「0 段有问题（1 档全清）」；同一次跑报「登记未命中 1 条」，属本仓 manifest 既有面，本席不动。
- **活坐标核查（逐名）**：五条里出现的每个符号名在本档另有活面——`TEMPLATE_PLACEHOLDERS`（§4.10 节内 ∥ `D-BR28`）· `STATUS_WORDS`（§4.12 ∥ §7 `D-BR19`）· `updateSectionStatusLine`（§4.12 ∥ §4.21.2 ∥ §4.23）· `statusResetPlan` / `statusPassPlan`（§4.23）· `persistEngTokens`（§4.23 机制表）· `verdictGapOf`（§4.20 裁行表 ∥ 符号表）。
- **[上抛·知会] 唯一没有第二处的是 `thincoder-core/agent-tools/batch-read.mjs`**：删完这两条后本档不再点名该档。它仍在 `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md`（`listBatchRecords` 的宿主）与 `docs/core/design/DESIGN-TOKEN-SETTLEMENT.md`（「读档 / 解析工具住 …」）各有一处活坐标 ⇒ 文档系统内未丢；本档内不补写（补一句就是加内容）。
- **边界**：本节标题 §4.17 的「受影响面」三字、九块头本身、各块的实现 / 描述 / 测试面条目、各块的「边界 / 不做」段，一字未动。零新增机制、零新增句子。

### 25 修正轮（评审第 2 轮 6 条 · 父侧派单）

**射程**：只改 `docs/core/design/DOC-CHECK.md` 一份档。零代码、零测试面、零需求档（需求侧那条 🔴 父侧本轮已改，本席一字未碰）。

#### 25.1 逐条（改前 → 改后）

| # | 处 | 改前 | 改后 |
|---|---|---|---|
| 🟡1 | §3 引擎入口行 | `runDocCheck(root, { docs, mode, docsSource, lines })` +「**签名不变**」 | 形状补 `texts?` ∥ `zones?` 两参，判据栏改「既有入参语义不变，另加两个可选入参」，两者缺席 ⇒ 与改前逐字相同（单源 = §2.10.1） |
| 🟡2 | §2.10.4（单源新增） | 零宽只散在四处，无判据 | 新增「零宽定位点扩到哪个单元」一段 + 两例：**点在空行**（删空行 ⇒ 两段并成一段 ⇒ 两段都进区）∥ **点在段内**（删段里一行 ⇒ 该段进区；删掉整段 ⇒ 前后段各自完整、无可扩单元 ⇒ 该档交空表） |
| 🟡2 | §2.9.4 / §2.10.1 两行 / `edit` 行 / `close` 行 / AC-G10 / AC-P2 / C-5 | 六种说法并存（「仍扩出完整相邻单元」∥「可能就是空表」∥「交零宽区间表」∥「零宽档交空表」…） | 六处一律只引用 §2.10.4，不再各写一份；AC-G10 与 AC-P2 的夹具归入「点在段内」那一例 |
| 🟡3 | §2.6 常量清单 | 五项（缺 `BARE_NAME_EXTS`） | 六项，并写明「本族唯一清单」；取值与族义单源指 §2.10.3 |
| 🟡3 | §2.9.7 识别面一族 | 「五个常量（含 `DEFAULT_DOC_EXTS` ∥ `BARE_NAME_EXTS`）」——第二个数且第二个清单 | 删数删清单，改「常量族与三个谓词……**常量清单只有一个出处：§2.6**」 |
| 🟡3 | §2.10.3 | `BARE_NAME_EXTS` 只说取值 | 补定义面（`doc-tokens.mjs`）∥ 导出面（`anchors.mjs`）∥「在 §2.6 是第六项」 |
| 🟡4 | §2.6 落点行 | 「锚 ∥ 花括号 ∥ 依据行 ∥ 行号面四处」 | 五处（补档图面），并写明「个数单源 = 本行，四 ∥ 五两个说法不许并存」 |
| 🟡4 | §5 三问行 | 「四条抽取式 ∥ 四处豁免调用点」 | 「四条抽取式 ∥ 五个消费面（锚 ∥ 花括号组 ∥ 依据行 ∥ 行号面 ∥ 档图面）」 |
| 🟡5 | §6 AC-2 | 「本仓固定三档的 `report` 面与基线逐字相等」——本批改的正是这三档的候选面，本条必红 | 拆两半：① 零变化面 = 一组夹具档（不含裸写的代码族档名）报面逐字相等；② 本仓 `docs/core/design/` 三档点名（`DOC-CHECK.md` ∥ `DOC-DISCIPLINE.md` ∥ `PATH-RESOLUTION.md`）**不列零回归基线**，差量实测记批档 §5；红侧 = 清单并集改成替换 ⇒ 裸 `.md` 名不成候选 |
| 🟡5 | §7 用例 7-2 ∥ §2.9.7 分拆验收 | 7-2「本仓三档」；分拆验收同用三档且未说与 AC-2 的关系 | 7-2 改指「AC-2 ① 的零变化面夹具」；分拆验收加一句「这份基线只判搬家前后是否逐字相等，与 AC-2 不是同一条」 |
| 🟡6 | §2.5 ∥ §2.6 ∥ §2.7 各一行 | 三个报面字面都无先例三问 | 各补一行，三处**均为 `existing`**：`report-blocks.mjs` 的 `DOMAIN_TABLE_HEAD`（L87）∥ `extListLine`（L215）∥ `EXEMPT_STALE`（L189）——句形已在盘、本批零改字面 |
| 🟡7 | §2.10.4「为什么留两行上下文」 | ±2 行只有一句理由，无出处 | 补「**本条据 `docs/core/requirements/DOC-CHECK.md` AC-12 ⑥⑦ 而立**」并引两句原文（⑥「判面 = 该段整段」∥ ⑦「被碰段落里的旧悬空指针照拒」）；AC-G9 加回指 |

#### 25.2 对读（同一件事还有没有第二个说法）

- **零宽**：全档 8 处含该词——改后只剩 §2.10.4 一处判据，其余六处是「零宽区间 ∥ 定位点」的名词用法，不含「扩不扩、交不交」的说法；C-5 原含第二个说法，已改。
- **消费面个数**：全档「四处」仅剩 §2.10.1 的「入口仍是四处」——那是**入口数**（另一件事），不是消费面。
- **常量数**：全档「五个常量」由 1 → 0；「六项」三处中仅 §2.6 那一处是本族清单，另两处分别指本节缺陷条数与别节，不冲突。
- **`texts` ∥ `zones` 谁在用**：§2.10.5 三问行原写「两处 ∥ 三处」，与 §2.10.1 的表逐行数出来的不等 ⇒ 改后 `texts` 三处、`zones` 四处（按表逐行核对，含 append 腿）。

#### 25.3 读数（命令 + 结果，本次运行）

```text
doc_check({mode:"gate", docs:["docs/core/design/DOC-CHECK.md"]})
  ⇒ 首行 DOC-CHECK GATE: PASS · 结论「0 段有问题（1 档全清）」
  （同一次跑报「登记未命中 1 条」，属本仓 manifest 既有面，本席不动清单）
```

- **未落地**：无。六条全落本档；需求档侧那条 🔴 归父侧（已由父侧本轮改掉）。
- **边界**：本轮零新增机制、零新增判据——🟡2 的一条规则是把已有六种说法收成一种，🟡5 的一条是把一条必红的判据改成能红的判据。

### 26 修正轮（父侧派单三条 🟡 · 2026-11-12）

**射程**：只改 `docs/core/design/DOC-CHECK.md`（本席笔域）与本段。零代码、零测试面、零需求档。

#### 26.1 逐条（改前 → 改后）

| # | 处 | 改前 | 改后 |
|---|---|---|---|
| 🟡1 | §8 边界那行 | 「需求档本批不再改（判域面）：…已含 F17 ∥ AC-15」——需求档本批正是在判域面改的，读者顺它去查会落空 | 「**不动需求档**：…的 F2 ∥ AC-1 ∥ AC-7② 已在判域面与本档对齐（判域 = 本批改动区、区外不入判集），单源 = 本档 §2.9.4」 |
| 🟡2 | AC-P2 的括注 ∥ 新增 AC-P3 | AC-P2 说「删空行并两段的扩区由 AC-G10 的正向形承担」，而 AC-G10 现文是「删掉中间一整段 ⇒ 交空表」——两支都在说空表，「点在空行」那一支没有验收 | AC-P2 改指 AC-P3；新增 **AC-P3**（删空行并段 ⇒ 单元 = 合并后的整段 ⇒ 合并段里的旧死引文落在区内、拒写；红侧 = 零宽点原样当零宽区间交 ⇒ 放行、本条红） |
| 🟡3 | §2.5 域表读数行 | 只有 §5 的 `domainTables` 键行间接覆盖，本行自己没有三问 | 补「这一行的先例三问」：在哪 = `report-blocks.mjs` 的 `domainTableBlock`（块首行取 `DOMAIN_TABLE_HEAD`）；谁在用 = `index.mjs` 的唯一调用点 ∥ 集成断言零处；对齐 = 句形照抄、本批不改字面 |

**连带两处（同一指针未跟着改，同一轮收）**：§2.10.4「点在空行」那例补「AC-P3 的夹具即此形」；同节「零宽语义只有这一个出处」的引用清单补 AC-P3；AC-P4 的「纯删两场景」改「三场景（AC-P2 ∥ AC-P3）」。

#### 26.2 对读发现：`§2.10.1` 那句「代价」与判据相反（本席自查，同一轮改）

- 改前：「纯删**并段**不再被拦——删掉段间空行、两段合并后跳过段长线 … 改动区内零命中 ⇒ 放行」。
- 事实（读码）：`thincoder-core/tools/doc-write-gate.mjs` 的 `judgeZones` 对「宽度为零 ∥ 只含空行」的区取整段与**紧邻两侧的段落**（JSDoc：「两段并一段 ⇒ 并出来的那一段」；本体 = `around(start - 1)` ∥ `around(end + 1)`）⇒ 并出来的那一段**在区内**，段长判据看得见这一笔的后果。同句与同档 §2.10.4「点在空行」相反。
- 改后：代价句落回真正放过的那一支 = **删掉整段、前后两段各自完整**（无可扩单元 ⇒ 空表 ⇒ 放行），并写明「删空行并两段不在这一支」。
- **本段 §6 的同句同改**（`batch edit`，同一轮），否则记录面与设计面各留一份相反说法。

#### 26.3 读数（命令 + 结果，本次运行）

- `doc_check({mode:"gate", docs:["docs/core/design/DOC-CHECK.md"]})` ⇒ 首行 `DOC-CHECK GATE: PASS`，结论「0 段有问题（1 档全清）」；同一次跑报「登记未命中 1 条」，属本仓 manifest 既有面，本席不动清单。
- 对读（命令 = `node` 逐行扫本档 + 两个代码档）：`AC-P3` 提及 5 处、定义行 1 处（其余 4 处为指针）；旧指针「AC-G10 的正向形」= 0 处；`#### 2.9.4` 在盘且含「收口门：阻断集 = **本批改动区**」；`domainTableBlock` ∥ `DOMAIN_TABLE_HEAD` ∥ 调用点 `domainTableBlock(projectRoots, read)` 三处均实读得到。

#### 26.4 边界与未落地

- 未动：判据本体、阈值、`zones` 逐档语义、需求档、代码、测试面。
- **[上抛·知会]** 需求档侧两条（F2 标题 ∥ AC-15②）父侧本轮已改，本席未碰。
- **[上抛·待裁]** `§2.10.4`「点在空行」那支今天**无实现级夹具**：AC-P3 是本批设计面新增的验收行，红侧与夹具要由实施轮落 `docs/batches/<本批批档同名>.test.mjs`；若实施席发现 `judgeZones` 对该形实际交空表，本条即红——按「实现与设计相抵 = 语义面」上抛，不自行改判。

### 27 修正轮：`#2339` ③b ∥ ④（父侧派单两条 · 2026-11-12）

**射程**：只改 `docs/core/design/DOC-CHECK.md`（本席笔域）。零代码、零测试面、零需求档。来源 = 批档 §5「核实轮」上抛第 1 ∥ 第 2 条（`[上抛·待裁]`），父侧本轮裁定「实现为准，改设计」。

#### 27.1 本席先复算（不信转述，自己跑）

依据 `thincoder-core/tools/doc-write-gate.mjs`「for (const run of [around(start - 1), around(end + 1)]) if (run && !picked.includes(run)) picked.push(run)」——零宽 ∥ 只含空行的区取**紧邻两侧的段落**，因此「删整段到底交什么」不由「删掉了一整段」决定，而由**删除点在改后档落在哪一行**决定。三条形各跑一次（`judgeZones` 直调，夹具 = A 段 / 空 / B 段 / 空 / C 段）：

```text
① 只删 B、两侧空行都留着（改后档两行连续空行）      ⇒ zones = []            （空表）
② 删 B 与一侧空行（A、C 之间只剩一行空行）          ⇒ zones = [{6,7}] = 后一段
③ 删 B 连同两侧空行（A、C 并成一段）                ⇒ zones = [{3,6}] = 合并段
④ 三行空行中间删一行（两侧都不是段）                ⇒ zones = []            （空表）
```

**对父侧转述的补正**：③b 不是「设计全错、实测一律后段进区」，而是**原文把一形写成了三形**——「交空表」在①成立，在②③不成立。所以改法是**把三形分开写**，不是把「空表」整句删掉；否则会改出相反的第二种错（删整段一律进区），而①④真的放行。

#### 27.2 逐条（改前 ∥ 改后）

| # | 处 | 改前 | 改后 |
|---|---|---|---|
| ③b | §2.10.4「点在段内」 | 「删掉的**就是那一整段**（连同两侧空行）⇒ 前后两段各自完整、无可扩单元 ⇒ 该档交空表，邻段不在区内」 | 三形分开：两侧各留一行空行 ⇒ 空表；只留一侧空行 ⇒ 那一段进区；连同两侧空行一并删 ⇒ 合并段进区（与「点在空行」同一支） |
| ③b | AC-G10 | 「删掉中间一整段（改后侧宽度为零、前后两段各自完整）⇒ … 该档交空表，邻段因此不进判集」 | 标题与夹具钉到**两侧空行都不删**；末句写明「本条只管这一形」，另两形断在 AC-P2 |
| ③b | AC-P2 | 「纯删删掉整段 ⇒ 无可扩单元 ⇒ 该档交空表」，夹具只写「删除点上方留两段」 | 标题与夹具有形（两侧空行不删 ⇒ 空表、放行）；新增**第二拍（反向）**：只留一侧空行 ⇒ 邻段进区 ∥ 连同两侧空行删 ⇒ 合并段进区，两拍各断一次 |
| ③b | §2.10.1 代价条 | 「纯删删掉整段仍不被拦——前后两段各自完整、无邻段可扩 ⇒ 该档交空表」 | 「删掉整段、**两侧空行都留着**时仍不被拦」，并点名另两形进区（指针指 §2.10.4，不各写一份） |
| ③b | §2.9.9 用例 `C-5` | 「只删其间的第三个段落 … 无可扩单元 ⇒ 该档交空表，邻段不在区内」 | 夹具补「两侧空行不删」；结论格标明「另两形不在此格」——同一说法的第四份拷贝，同轮收（D14 一次扫完） |
| ④ | §2.10.4 新增一段「两支在写前门腿的射程」 | 无此句（`judgeZones` 头注有、设计档没有） | 写前门先加 ±2（`withContext`）⇒ 零宽点已被抬成四行区，写前门面的拒写由 **±2** 承担、不由零宽扩区承担；零宽那一支的真射程 = 不加上下文的两面（收口 diff 区间表 ∥ 引擎面直传区间表） |
| ④ | AC-P3 | 「**红侧**：把零宽定位点原样当零宽区间交（不扩区）⇒ 合并段不在区内、本例放行，本条红」——端到端那一半按此永远不会红 | 「**红侧在引擎面**：手交零宽区间表、不扩区 ⇒ 放行」＋「**端到端那一半不是红侧**：±2 先盖住邻行，停用零宽扩区后该腿照样拒写」 |

#### 27.3 读数（命令 + 结果，本次运行）

```text
doc_check({mode:"gate", docs:["docs/core/design/DOC-CHECK.md"]})
  ⇒ 首行 DOC-CHECK GATE: PASS · 结论「0 段有问题（1 档全清）」
  （同一次跑报「登记未命中 1 条」，属本仓 manifest 既有面，本席不动清单）
grep「无可扩单元|零宽档交空表|删掉整段|纯删删掉整段|邻段不在区内」于 docs/core/**/*.md
  ⇒ 5 处，全在本档，全部已按三形改写（域 = docs/core，扣批档目录）
judgeZones 直调四形（夹具与读数见 §27.1）
  ⇒ 空表 ∥ 后段 ∥ 合并段 ∥ 空表 —— 与改后原文逐形对齐
```

#### 27.4 边界与未落地

- 未动：判据本体、阈值、`zones` 逐档语义、`judgeZones` 实现、需求档、测试面。
- **本席不改代码**：实测与设计相抵时按父侧裁定「实现为准」改设计；`judgeZones` 一分未动。
- **[上抛·待裁]** 批档 §5 的核实轮单测档（`docs/batches/2026-11-11-gate-silent-when-pass.test.mjs`）里没有「只留一侧空行 ∥ 连同两侧空行删」这两形的用例——AC-P2 第二拍今天**无实现级夹具**，红侧与夹具要由实施轮补；本席只把判据写到可红。

### 28 撤扩区 ∥ 撤读数（用户 2026-11-12 三道裁定 · 父侧派单）

**射程**：只改 `docs/core/design/DOC-CHECK.md`（本席笔域）与本段。零代码、零测试面、零需求档。

#### 28.1 判据闭集（本批最终口径）

文档门只判三件事：**引用的档在不在、引用的节在不在、引文是不是逐字。它不量长度，不出读数。** 判据闭集 = `档缺` ∥ `引缺` ∥ `节缺`。

#### 28.2 判域一句

判域 = 本笔 diff 的字面行；不扩区、不 ±2、不设扩区表。纯删宽度为零 ⇒ 该档交空表 ⇒ 本笔零命中即放行——漏报，已认（用户「漏就漏呗……可以接受漏报，不能接受误报」）。

#### 28.3 删了哪几块（`docs/core/design/DOC-CHECK.md`，逐处）

| 处 | 撤成什么 |
|---|---|
| 档头判据行 | 「判据仍三条（锚 ∥ 段长 ∥ 行号坐标）」→「三类（`档缺` ∥ `引缺` ∥ `节缺`），长度与行数一概不量、不出读数」 |
| §2.9.1 推论 1 | 写盘门判域「扩区后的片段区」→「本笔 diff 的字面行」 |
| §2.9.1 推论 2 | 「改动区须落在完整段落 ∥ 围栏块 ∥ 表格行上、扩区表是判域的一部分」→「判域 = 字面行，不扩区」 |
| §2.9.1 推论 4 | 拦的闭集去 `行太长`；写明段落长 ∥ 行太长 ∥ 行数读数三条判据与读数面整条不存在 |
| §2.9.4 写盘门 ∥ 收口门 ∥ 纯删段 | 三处「经扩区表」→字面行；纯删段 → 该档交空表 |
| §2.9.9 C-5 | 零宽四形的期望改成「交空表 ⇒ 本笔零命中」 |
| §2.10.1 `zones` 条目 ∥ 调用表三行 ∥ 代价条 | 零宽 hunk 交空表；写前门 ∥ `edit` ∥ 收口三条腿的区改字面行；代价条只留纯删漏报 |
| §2.10.2 区间表条 | 「扩区表照旧保留」→「只并区，不扩区」 |
| §2.10.4 整节 | 七段（判据句 ∥ 为什么 ∥ 根因码块 ∥ 修法 ∥ 零宽四形 ∥ ±2 射程 ∥ 判面行）→ 一段三句 |
| §2.10.5 先例句 ∥ AC-G8 ∥ AC-G9 | 「同一张扩区表」「±2 行内」→同一取区法、字面行 |
| §2.10.6 AC-G10 ∥ AC-P2 ∥ AC-P3 | 三条验收整条删（零宽四形随扩区退场）；AC-P1 改判「纯删档交空表」，AC-P4 红侧改指 AC-P1 |
| §2.7 命中类表 | 删 `段·文字太长，难于阅读` ∥ `行·行太长` 两行；登记面只管进 `hits` 的三类 |
| §2.9.7 ∥ §8 ∥ KD-8 ∥ §3 契约 | `lines` 当尺 ∥ `runDocCheck` 的 `lines` 入参 ∥ 「四类判据」的表述全部撤掉 |
| §2.12 计划件 | 三节（机制 ∥ 2.12.1 验收 ∥ 2.12.2 边界与代价）→ 一节两句 + 两条验收；无边界节、无代价节、无三问表、无档层结论 |

#### 28.4 实施轮要做（本席不改代码，点名）

```text
thincoder-core/tools/doc-write-gate.mjs    拆段落 ∥ 围栏 ∥ 表格单元的扩区；拆 withContext 的 ±2；判面行去掉「判定区」读数
thincoder-core/doc-check/paragraph.mjs     段判据整条退役（段落长不再是命中类）
thincoder-core/doc-check/index.mjs         lines 入参 ∥ countContentLines 读数面 ∥ 段类 ∥ 行类命中退役；k 只由 档缺 ∥ 引缺 ∥ 节缺 构成
thincoder-core/doc-check/report-blocks.mjs 读数块里的段 ∥ 行两行与行数块退役
thincoder-core/tool-docs/doc_check.md      判据行改一条（档 ∥ 节 ∥ 引文）；删 lines 段与「段长」「行太长」两句
thincoder-core/prompts/**                  载了长度/读数句的，同行删（提示词 = 产品代码，本席不改）
```

**本轮实测的旁证**：`doc_check` 的 gate 回执自报「判据：逐段检查——文字太长，难于阅读」——代码面仍以段判据为判据，撤它归实施轮。

#### 28.5 上抛（不在本席笔域）

1. **[上抛·待裁]** 需求档 `docs/core/requirements/DOC-CHECK.md`：F3「闸的拦截闭集 = … ∥ `段落长` ∥ `行太长`」及其档头同句、F15 ∥ AC-13（`lines` 读数面）、AC-12 ⑥⑦（接长照拒 ∥ 判面 = 该段整段）、§11 边界「三数 = 锚 ∥ 段 ∥ 行」与设计不再同源。**在它落地前，本档 §2.9.1 是本批唯一口径。**
2. **[上抛·知会]** `docs/core/design/DOC-DISCIPLINE.md` 仍是旧口径：§3.18 条目 Q（段判据口径）、§3.26 的扩区三式表 ∥ 第二消费面 ∥ 判面行固定串、§3.20「行数读数」块、A-DD35 ∥ A-DD40 ⑩ ∥ A-DD41、DD-171 ∥ DD-172 ∥ DD-173 ∥ DD-183–DD-193、DD-219 的「同一张扩区表」。本轮未动：一次改要连带两处「判据句在册」的逐件清单与用例表十几行，排期请父侧定。
3. **[上抛·知会]** 本档 §2.9.7「档层结论」仍在盘：它记的是一次已落地的分拆，不是活判据；删它要连带 §2.6 逐块清单三行 ∥ §2.10.8 ∥ §3 三处指针，本轮未一次带起。另 §2.7 ∥ §3 ∥ §6 仍按 `hits` 两数（`anchors` ∥ `paragraph`）写，段判据退役后应收成一数。

#### 28.6 读数

```text
doc_check({mode:"gate", docs:["docs/core/design/DOC-CHECK.md"]})
  ⇒ 首行 DOC-CHECK GATE: PASS · 结论「0 段有问题（1 档全清）」
  （同一次跑报「登记未命中 1 条」，属本仓 manifest 既有面）
```

### 29 压缩轮：§2 只留五块（用户手令 · 2026-11-12）

**来源**：用户原话「一个 doc_check，检查很简单的几件事儿，被你写了一千多行，你他妈的羞耻吗！」；射程 = 只改 `docs/core/design/DOC-CHECK.md` 一份档，`DOC-DISCIPLINE.md` 一字未碰（用户警告上一轮按行号删把它改坏、已回滚）。

#### 29.1 改后 §2 的结构（五节，别的一概不留）

| 节 | 内容 |
|---|---|
| §2.1 判据三类 | `档缺` ∥ `引缺` ∥ `节缺`；不判行号坐标 ∥ 跨仓未声明 ∥ 裸档名；不量长度、不出读数；命中只有「拦」或「不出现」 |
| §2.2 解析腿序 | 仓根 → 引用方目录（只对相对形）→ 声明仓 → 后缀兜底；仓外一律不判 |
| §2.3 四条豁免 | 排除面 ∥ 豁免登记 ∥ 批档互引 ∥ 计划件（在途批档 §2 机读清单） |
| §2.4 定根 | 一档一根；无声明根 ⇒ `ERROR（无法定根 N 档）` 点名，不猜；域事实按档自己的根读 |
| §2.5 三道门判域 | 写盘门 ∥ 批档 `edit`·`append` ∥ 收口门 = 本笔 diff 字面行，不扩区；区未定 ⇒ 不入判集 |

#### 29.2 删掉的节（整节）

`§2.6` 档名与扩展名识别面（含围栏块逐块表）· `§2.7` 逐条豁免与假阳第三档的报面字面 · `§2.8` 读 manifest 单源表 · `§2.9` 六条缺陷的判据本体与用例表 · `§2.10` 判域三义（`texts` ∥ `zones` ∥ 扩区 ∥ ±2）· `§2.11` 判域两条收边 · `§2.12` 计划件独立节（并入 §2.3 第 4 条）。同轮删净：段落长 ∥ 行太长 ∥ `lines` 读数面 ∥ `countContentLines` 的一切表述；§5 的先例三问表、名字三问表、独立参考系勘查（§2 之外，同为用户点名的噪音）。

#### 29.3 读数（同一把尺：`node` 逐行扫；`doc_check` 的 `lines` 面另报一数）

```text
docs/core/design/DOC-CHECK.md   改前 1133 物理行 → 改后 269 物理行
  §2                             改前 880 行（第 15–894 行）→ 改后 58 行
doc_check({mode:"report", lines:[该档]})                        ⇒ 268（内容行，另一把尺，同向）
doc_check({mode:"gate", docs:[该档]})                           ⇒ DOC-CHECK GATE: PASS（0 段有问题，1 档全清）
grep「§2.(6|7|8|9|10|11|12)」于本档                                ⇒ 零命中（无残留旧指针）
```

#### 29.4 上抛（不在本席笔域，未动）

1. **[上抛·待裁]** 别的设计 / 需求档仍指着被删的节：`BATCH-RECORD.md`（§2.9.1 ∥ §2.9.4 ∥ §2.10.1 ∥ §2.10.2 ∥ §2.6 ∥ §2.7 ∥ §2.8）· `DOC-DISCIPLINE.md`（§2.6 ∥ §2.7 ∥ §2.8 ∥ §2.9.4 ∥ §2.10.1–§2.10.4 ∥ §2.11）· `DOC-GRAPH.md`（§2.6）· `LEDGER.md`（§2.9.7）· `MANIFEST.md`（§2.6 ∥ §2.7 ∥ §2.8 ∥ §2.10.3）· `PATH-RESOLUTION.md`（§2.11）· `docs/core/requirements/DOC-CHECK.md`（§2.7 ∥ §2.8 ∥ §2.9.4 ∥ §2.10.3 ∥ §2.12）· `ENGINEERING-MODE-V2.md`（§2.9.1 ∥ §2.9.4）。这些指针在本档删节后成死指针，逐处改指或改句归各档作者；本席按用户令只改一份档。

### 30 指针改指轮：被删的 §2.6–§2.12 改指到新的五节（父侧 2026-11-12 派单）

**射程** = 8 档只改指针串；引用的段落**内容一字未改**（「扩区」「段落长」那些句子按令不动）。落 **6 档 / 25 处**；挡 **1 档 / 14 处**（原因见 30.2）；`§2.8` ∥ `§2.9.7` 两族无对应节，**未动**（见 30.3）。

#### 30.1 改了哪几处（逐档）

| 档 | 处 |
|---|---|
| `docs/core/design/BATCH-RECORD.md` | 9 |
| `docs/core/design/MANIFEST.md` | 5 |
| `docs/core/design/DOC-GRAPH.md` | 2 |
| `docs/core/design/PATH-RESOLUTION.md` | 3 |
| `docs/core/requirements/DOC-CHECK.md` | 5 |
| `docs/core/requirements/ENGINEERING-MODE-V2.md` | 1 |

**旧号 → 新节的对应（本轮的判据）**：

```text
§2.6  识别面 / 扩展名清单 / 裸名族        → §2.1      排除面那半 → §2.3
§2.7  豁免 · 登记 · 排除面               → §2.3      命中类 / 分流 → §2.1
§2.9.1 判据闭集 · 判定输入与阻断集        → §2.5
§2.9.4 三面取区 · 收口门 · 改动区         → §2.5
§2.10.1 texts ∥ zones ∥ 各次调用各交什么  → §2.5
§2.10.2 区间表 · 判定输入                 → §2.5
§2.10.3 形分档 · 裸名族                  → §2.1
§2.10.4 零宽 · 上下文                    → §2.5
§2.11  相对形前置腿 · 仓外不判            → §2.2
§2.12  计划件                            → §2.3
```

**两处把两个旧号并成一个新节**（`§2.9.1 ∥ §2.9.4`、`§2.10.1 ∥ §2.10.2` 指向同一件事）——`§2.5` 一节已同时承载判定输入与阻断集，不另造第二个指针。

#### 30.2 卡住的：`DOC-DISCIPLINE.md` 17 处（`[上抛·待裁]`）

该档 **14 处**（另 3 处无对应节，见 30.3）的改法在草稿里已定，**一处也没落盘**：该档的写盘门对锚类**整档判**，而档内有两处**先于本轮存在**的 `引缺`（不是本轮引入，也不在本轮射程）：

```text
L1381  依据 thincoder-core/doc-check/anchors.mjs「const OPERAND_STRIP_RES = CANON_OPERANDS.map((name) => new RegExp(」
       ⇒ 该符号随本批分拆搬进 thincoder-core/doc-check/doc-names.mjs（引文在那一档逐字在场）
L2141  依据 thincoder-core/agent-tools/batch-gate-hit.mjs「const aligned = drift === 0」
       ⇒ aligned ∥ drift 本批退役（该档 grep 零命中），引文在盘上已无出处
```

第一处是**纯指针改指**（改靶档名即可）；第二处的依据对象**整个没了**，要么删那行、要么换一条活的依据——都是内容裁定，且该档被父侧明令「只许换指针串」。故 17 处一并交回，不在本席自行处置。

#### 30.3 无对应节、未动的两族

```text
§2.8   读 manifest 声明面五处 · 逐行清单 —— 新 §2 无此节（声明面散在 §2.1 ∥ §2.2 ∥ §2.3）
§2.9.7 档层结论 · 函数档量法 —— 整节随压缩退场，五节里没有替身
```

`MANIFEST.md` 2 处 + `DOC-DISCIPLINE.md` 2 处属前者，`LEDGER.md` 2 处属后者。**没有另立一节去接它们**——那等于本席自造设计面，不属本轮射程。

#### 30.4 读数（命令 + 结果，本次运行）

```text
doc_check({mode:"gate", docs:[本轮写过的 7 档]})   ⇒ 首行 DOC-CHECK GATE: PASS · 0 段有问题（7 档全清）
node 逐行扫（正则 = DOC-CHECK.md 后 40 字内接 §2.6–§2.12）
  docs/core     22 处 / 3 档   （DOC-DISCIPLINE 17 · LEDGER 2 · MANIFEST 2 + 1 格机检假阳）
  thincoder-core 31 处 / 18 档 （全部是 .mjs 注释面 = 产品代码，不归本席）
  docs/batches 183 处 / 16 档  （过程档 = 历史记录，一次性载体，不动）
```

**机检假阳一处**：`MANIFEST.md` 那 3 处里有一格的 `§2.11` 指 `MANIFEST.md` 自己的 §2.11，只因同一行 30 字前出现 `DOC-CHECK.md` 而被正则收进来——**不是死指针，未改**（为让 grep 变 0 去改一条正确指针，就是把判据写进被检面）。

### 31 指针改指轮（`DOC-DISCIPLINE.md` · 父侧 2026-11-12 裁定）

**射程**：只改 `docs/core/design/DOC-DISCIPLINE.md`。零代码、零测试面、零需求档。改法 = 指针串 + 两处挡路的 `引缺`；句子其余语义一字未动。

#### 31.1 逐处（18 处指针）

| 旧指针 | 新指针 | 处数 | 为什么这么指 |
|---|---|---|---|
| `DOC-CHECK.md` §2.10.3 | §2.1 | 2 | 形分档 = 判据三类那一节 |
| §2.10.1 | §2.5 | 5 | 判定输入与 `zones` 归三道门判域 |
| §2.10.4 | §2.5 | 1 | 扩区与上下文归判域 |
| §2.9.4 | §2.5 | 5 | 三面取区 = 判域 |
| §2.8 | 删指针半句 | 2 | 五节里没有「读 manifest 声明面」一节 |
| §2.10.2 | 删指针半句 | 3 | 在飞扫描判据不在新 §2 |

**删的是指针，不是句子**：后两族共 5 处只删「单源 = …§2.8 ∥ §2.10.2」那一截，句子其余部分照留——留一句干净的话，不留一条指向废节的指针。

#### 31.2 两处挡路的 `引缺`

```text
① 依据 thincoder-core/doc-check/anchors.mjs「const OPERAND_STRIP_RES = CANON_OPERANDS.map((name) => new RegExp(」
   → 改靶档名：thincoder-core/doc-check/doc-names.mjs（符号随本批分拆搬走，引文在新档逐字在场）

② 依据 thincoder-core/agent-tools/batch-gate-hit.mjs「const aligned = drift === 0」
   → 整行删：aligned ∥ drift 本批退役，该档 grep 零命中；规则留着，出处没了就空着
```

#### 31.3 读数（命令 + 结果，本次运行）

```text
doc_check({mode:"gate", docs:["docs/core/design/DOC-DISCIPLINE.md"]})
  ⇒ 首行 DOC-CHECK GATE: PASS · 结论 0 段有问题（1 档全清）
grep「DOC-CHECK.md`? ?§2.(6|7|8|9|10|11|12)」于该档                         ⇒ 零命中
doc_check({mode:"report", docs:[docs/core 全部 119 档]})
  ⇒ 命中 20 条（锚 20 · 引缺 0 · 节缺 0）；另 8 条已裁定假阳（不阻断）
```

#### 31.4 上抛（本席未动，等父侧裁）

1. **[上抛·待裁]** 该档仍带被撤掉的「存量」层：`STOCK_LINE` 串、逐处「区外命中只出 `STOCK_LINE` 读数」、「区未定才整档判」、用例行 `DD-217` 的「区外存量不阻写、仍明示」、A-DD31 第 8–11 条。§12 记的是「已改完」，盘上是回滚后的旧文。**本轮按父侧令只换指针串，未动这些句子**；其中五处指针本轮已改指 §2.5，而句子仍写「区外只出读数」，与新 §2.5「区外就地丢弃」相反——两处并读会读出一条已被撤掉的规则。
2. **[上抛·知会]** 处数对不上：§30.2 清点记 17 处，实扫为 **18 处指针 + 2 处 `引缺`**（共 20 处）。清点数按实扫记，不按旧计数凑。
3. **[上抛·知会]** 该档有一处 `§2.6` 出现在「其余机制族 token 位点」的枚举里，指的不是 `DOC-CHECK.md` 的节 ⇒ 不是死指针，未改。

### 32 撤层轮：`DOC-DISCIPLINE.md` 删「存量」层（父侧 2026-11-12 裁定 · 只此一档）

**射程**：`docs/core/design/DOC-DISCIPLINE.md` 一份，零代码、零测试面、零需求档。删法 = 按内容删（每处先读上下文），不按行号删。

#### 32.1 逐处（19 处：17 处改写 + 2 处整条删）

| # | 位置 | 删成什么 |
|---|---|---|
| 1 | §3.20「段长类的判域在写者面收窄」 | 「区外命中只出 `STOCK_LINE` 读数（单源 = … 收口门 ∥ 存量读数句）」→「区外命中不入判集（不计数、不出行；单源 = 收口门）」 |
| 2 | §3.20 机械点表 ① 裁定消费 | 删括注「触达账区外存量命中只入回执」 |
| 3 | §3.20「① 面的范围与强制集」 | 「区外存量命中要明示」→「区外命中不入判集（不计数、不出行）」 |
| 4 | §3.20「`writer` 面的强制集」下 | 「`append` 面不出已落段的存量读数：可见性由 `edit`（替换区外的存量读数）∥ 收口（本批改动区外的 `STOCK_LINE` 行）两面承担」→「已落段本就不在本次改动区，`append` 面不出任何行」 |
| 5 | §3.20 触达账腿标题 | 删裁定括注后半「存量债在收口门判」 |
| 6 | §3.20 判据句 | 「整档累积的存量债归收口面」→「没碰到的旧命中不入判集——收口面同样只判本批改动区」 |
| 7 | §3.20「未定」的处置 | 「区未定才整档判」→「区未定 ⇒ 该档不入判集、不判不印」 |
| 8 | §3.20「命中分流」 | 「区外 ⇒ 明示集，只出引擎那一行 `STOCK_LINE` 读数」→「区外 ⇒ 不入判集，就地丢弃——不计数、不出行、不逐条列」 |
| 9 | §3.20「两面的分工」 | 「区外的存量只出 `STOCK_LINE` 读数；区未定才整档判」→「区外命中不入判集；区未定 ⇒ 该档不判」；同句「对批档已落段不出存量读数…可见性由 `edit` ∥ 收口两面承担」→「不出任何行…已落段本就不在本次改动区」 |
| 10 | §3.20「批档本体不再逐笔入判」 | 「已落段字的存量读数归 `edit` ∥ 收口两面出」→「已落段不在本次改动区 ⇒ 不入判集、不出行」 |
| 11 | §3.20 用例 `DD-131` 期望 | 「那处存量由 `edit` ∥ 收口两面出读数」→「那处不在本次改动区 ⇒ 不入判集」 |
| 12 | §3.23「批档门三腿」 | 「区外存量命中只入回执」→「区外命中不入判集（不计数、不出行）」；「`append` 对批档已落段不出读数」→「不出行」 |
| 13 | §5 `A-DD31` 第 8 点 | 删「回执出 `STOCK_LINE(1)` 计数行」→「回执零附加行」 |
| 14 | §5 `A-DD31` 第 10 点（原「区外存量不阻写、仍明示（DD-217）」） | **整条删**——规则本体已被撤（判据只剩「拦」或「不出现」） |
| 15 | §5 `A-DD31` 第 11 点 | 顺延为第 10 点；「回执带一行 `STOCK_LINE`（…只出读数）」→「回执零附加行（…不入判集）」 |
| 16 | 用例表 `DD-214` | 「回执含 `STOCK_LINE(1)` 行」→「回执零附加行（区外那条不入判集）」 |
| 17 | 用例表 `DD-217` | **整行删**——该判据已不存在 |
| 18 | 用例表 `DD-219` | 「放行 + 一行 `STOCK_LINE`（存量在改动区外，只读数、不阻断）」→「放行、回执零附加行（那条在改动区外，不入判集）」 |
| 19 | `A-DD31` 可跑形用例号段 | 「DD-214–DD-219」→「DD-214–DD-216 ∥ DD-218 ∥ DD-219」（`DD-217` 已删，号段不指空号） |

**保留面（本轮未动）**：判据本体（`blocks` 的面别倒向、`zones` 逐档语义、扩区表、阈值、命中类闭集、verdict 词）；四态「改动区取法」及其「②未跟踪 ⇒ 整档」；「未定 ⇒ 只明示不阻本次写」那一行（属「没判」明示，不是命中读数）；§3.23「存量当轮清」（行号坐标清债，另一机制，与门内存量层无关）。

#### 32.2 读数（命令 + 结果，本次运行）

```text
doc_check({mode:"gate", docs:["docs/core/design/DOC-DISCIPLINE.md"]})
  ⇒ 首行 DOC-CHECK GATE: PASS · 结论「0 段有问题（1 档全清）」
node 逐行扫（域 = docs/core/design + docs/core/requirements 全部 .md）
  STOCK_LINE ⇒ 0 命中（改前 = 10 处，全在本档）
  「区外存量」「存量读数」「仍明示」「DD-217」 ⇒ 0 命中
```

#### 32.3 残留与上抛

1. **[上抛·知会]** `存量` 一词在本档仍出现在两处非本层语义：§3.23「存量当轮清」（行号坐标的历史清债）与几处夹具描述（「含 1 条存量悬空锚」= 改动区外的旧锚）。它们不描述「区外命中怎么报」，不在本轮射程。
2. **[上抛·知会]** §31.4 第 1 条（本档仍带被撤存量层）由本轮关闭；该条其余各项（`STOCK_LINE` 串、`DD-217` 用例行、A-DD31 第 8–11 条里的存量层）本轮一并落盘。
3. **[上抛·待裁]** 本档 §3.20「②：仓内新建未跟踪档 ⇒ 按整档判」与本批收口面「区未定 ⇒ 不入判集」是两种态（前者区**已定**为整档）——本轮按原义保留；若父侧要统一口径，需另裁。

### 33 撤扩区 · 撤 gate 拦行号 · 补死指针（父侧 2026-11-12 三条裁定 + 评审 4 🔴 之三）

**射程**：`docs/core/design/DOC-DISCIPLINE.md` ∥ `docs/core/design/DOC-CHECK.md`（后者不在本 spawn 声明的文件清单里，逐条报告）。零代码、零测试面、零需求档。

#### 33.1 逐件落点（逐条 → 改了哪一处 → 逐字）

| # | 父侧裁定 | 落处 | 改成（逐字要点） |
|---|---|---|---|
| ① | 扩区表撤，判域 = 字面行 | `DOC-DISCIPLINE.md` §3.20 判据句 | 「判域 = 本笔 diff 的字面行 ± 2 行上下文（相邻 ∥ 重叠者并区）：不扩到段、不扩围栏、不并段」 |
| ② | 同上 | §3.20 四态表 ① 行 | 「该档的 `git diff -U0` 区间表（取法 = 下句）± 2 行上下文」 |
| ③ | 同上 | §3.26 判面取法第 3、4 步 | 「各 hunk 两侧各取 2 行上下文、相邻 ∥ 重叠者并区——判区到此为止，不再向外取字」；「**不切片**」 |
| ④ | 扩区三式表删 | §3.26（原表三行 + 「段落」的单源 + 「扩区表的第二消费面」两段） | 整块删，留一句「**区只有一种**：本笔的字面行 ± 2 行上下文——没有第二张表、没有第二种取法」 |
| ⑤ | 同上 | §3.26 判据句 ∥ 「为什么判到段落为止」段 | 判据句 = 「本笔写进目标档的那些字——判域 = 本笔 diff 的字面行，区外一行不入」；理由段改写为「±2 是唯一例外」 |
| ⑥ | 同上 | §3.20「最近先例」∥ §3.26 判法行 ∥ 判面行固定串 ∥ DD-219 尾句 | 「同一张扩区表」→「同一条判域」；`zones` = 改动区；判面行收成一数 `判面：改动区 {M} 区` |
| ⑦ | 行号坐标只留 `report` | §3.23 条目 W 标题 | 「`report` 清点 + 交付门拦 + 存量当轮清 · 三形归属窗」→「`report` 清点 · 三形归属窗」 |
| ⑧ | 同上 | §5 A-DD37 标题 ∥ ③ ∥ ⑤ 工具描述面行 ∥ ⑧ | 标题改「`report` 清点，`gate` 不判」；③ 改为「`gate` 面不判这一类」；⑤ 改「清点段自承门内不判，判据数与 verdict 类名零改」；⑧ 改成两数各计各的 |
| ⑨ | 同上 | 用例 `DD-174` ∥ `DD-176` ∥ `DD-221` ∥ `DD-222` | 期望改成「`report` 清单记该处；`gate` 首行 `PASS`」 |
| ⑩ | 设计 §2.5 的 ±2 | `DOC-CHECK.md` §2.5 首句 ∥ 写盘门行 ∥ §2.1 取向句 | 「判域 = 本笔改动的那几行 ± 2 行上下文。**不扩到段、不扩围栏、不并段**」；写盘门行补 ±2；取向句「不扩区」→「不扩到段」 |
| ⑪ | 死指针 | `DOC-CHECK.md` `7-16` ∥ `7-17` ∥ `7-18` ∥ §3 返回行 ∥ §9.2 两处回指 ∥ §9.3 两处 | `AC-PL1` ∥ `AC-PL2` ∥ `AC-X1–AC-X4` ∥ `AC-R1–AC-R3` ∥ `AC-P8` ∥ `AC-P4` ∥ `C-5` 七处全撤，改指仍在册的节（`§2.1` ∥ `§2.3` ∥ `§2.5`） |
| ⑫ | §9.2 记改写 = 0（错） | §9.2 计数行 + 一张八行表 | 「改写 = **8**」+ 逐行回指改到 `§2.1` ∥ `§2.2` ∥ `§2.3` ∥ `§2.5` |
| ⑬ | 设计头行 | 档头指针行 | `F1–F23 / AC-1–AC-19` → `F1–F24 / AC-1–AC-20` |
| ⑭ | §2.1 三个说法 | 同节「不判」行 | 「裸档名」→「不带文档名后缀的裸名（代码族裸名 ∥ 无后缀裸词）」——与「裸名只认 `md` ∥ `markdown`」同口径 |

#### 33.2 读数（命令 + 结果，本次运行）

```text
grep「扩区|扩到整段|扩到该段」于 docs/core/design        ⇒ 零命中（含 DOC-CHECK.md 与全层）
doc_check({mode:"gate", docs:[DOC-DISCIPLINE.md, DOC-CHECK.md]})  ⇒ 首行 DOC-CHECK GATE: PASS · 0 段有问题（2 档全清）
```

#### 33.3 未落（如实报，不算交付）

1. **[上抛·待裁] ① 段落长 ∥ 行太长整条撤：未落。** `DOC-DISCIPLINE.md` 仍带 **42 处**（量法 = `grep「段落长|段长|文字太长|行太长」`，域 = 该档；零命中不在其中）。它们分三类：
   - **§3.18 条目 Q 整节**（第 1108 行起，含阈值 ∥ 单位 ∥ 面谓词 ∥ 名字 ∥ 七条口径）——同时承载 `谓词面`（十二名）∥ `围栏行止` ∥ `isListItem` 闭集，三者被 `anchors.mjs` ∥ 写前门 ∥ §3.28 消费。整条删会把活实现坐标一起带走，需同一轮把消费面改指，本席未在本轮硬删。
   - **§3.20 判据 ②（段长）与「三条判据的分工」行**——判据表本身要重排成一类，连带 `REFUSED（锚 A 条 · P 段… · L 行太长）` 的报面固定串（三处）与 `§7` 常量表（`paragraphMax` ∥ `lineMax` 六个键）。
   - **§5 的 `A-DD27` ∥ `A-DD35` 两块 + 用例行 `DD-115`–`DD-137`–`DD-140` ∥ `DD-173` 等**——判据撤了，这些行的期望输出随之作废。
   **为什么没在本轮硬删**：一处规则撤要连带 ~40 处回指与 6 张表；按 D11 一次改到底，否则盘上留「节没了、判据还在」的半截。建议单开一轮、只此一件，本席照办。
2. **[上抛·待裁] `test/rtm/guard.md` 八行的回指改盘未落**：`test/**` 属产品/测试面（eng-coder 笔域），本席只把八行记进 `DOC-CHECK.md` §9.2 的改写表。判据「`DOC-CHECK.md §2.(6|7|9|10|11|12)` 于 `test/` = 0」由实施席落，本席未跑、不代跑。
3. **[上抛·知会] 需求档 F11 那句由父侧改**（本席未碰）：

#### 33.4 代价（认下来）

- **纯删与围栏的旧行为变了，且不是放宽**：`±2` 保留 ⇒ 删一行空行的判区 = 那行两侧各 2 行（不是零宽）；围栏块内的改动只判本笔那几行 ± 2，不再整块连标记。`DD-171` ∥ `DD-172` 已按新口径重写期望（放行），理由从「扩区那一形」改成「那几行里没有可命中的判据」。
- **`段落长` 撤后，段判据曾承担的两件事没有接替者**：长段可读性不再由门判；写前门不再因「接长一段」拒写。这条代价与 `DOC-CHECK.md` §2.1 的取向句（可以接受漏报）同向，父侧已认。

### 34 撤段判据 ∥ 行太长 · 判域收成「本笔 diff 标出来的那些行」（父侧 2026-11-12 三次更正后的定案）

**射程**：`docs/core/design/DOC-DISCIPLINE.md`（本席笔域）· `docs/core/design/DOC-CHECK.md` §2.5 与取向句（清单外，逐条报告）。零代码、零测试、零需求档。

**已定判决（用户逐字）**：①「段落长判据 ∥ 行太长判据」= 撤（阈值 ∥ 命中即拒 ∥ `REFUSED` 串 P∥L 段 ∥ 常量两键）；② 判域 = 本笔 diff 标出来的那些行——不扩到段、不取 ±2、不扩围栏、不并段，「相邻 ∥ 重叠者并区」与「±2」「扩到段」一并作废（前两条更正以本条为准）；③ 留谓词面十二名 ∥ 围栏行止 ∥ `isListItem`。

**改了什么（逐件 · 逐处点名）**

| # | 处 | 改成 |
|---|---|---|
| 1 | `DOC-DISCIPLINE.md` §3.18 条目 Q | 改题「行类谓词与围栏行止（单源）」；留谓词面十二名 ∥ 列表项符号集 ∥ 围栏行止 ∥ 区带常量位；**删**口径条 1–7（单位 ∥ 阈值 300 ∥ 面 ∥ 命中即拒）、用例表（DD-115–DD-163）、验收回指、集成差量 `7-13` |
| 2 | §3.20 起步判据表 | 三条 → 两条（① 锚 ∥ ② 行号坐标）；「三条判据的分工」→ 两条 |
| 3 | §3.20 参数面 ∥ 报面 | `paragraphMax` / `lineMax` 两键与「段判据入参」整块删；报面「判据：逐段检查——文字太长」→ 锚；`REFUSED` 只剩 `锚 A 条`；尾行处置块（五行）整块删 |
| 4 | §5 A-DD27 ∥ A-DD35 ∥ 用例行 | A-DD35（段判据不分面）整块删；A-DD27 条目改谓词面（符号集 ∥ 围栏行止 ∥ 命名残留）；DD-83 ∥ DD-137 ∥ DD-139 ∥ DD-140 ∥ DD-169 ∥ DD-173 行删；DD-171 ∥ DD-201 改判 |
| 5 | §7 引擎 | F1 ∥ F2 ∥ F3 去段判据；F2 常量表删两键、计数 6 → 4；AC-M8-5 去段判据；单元测试档句去「段判据」 |
| 6 | 判域句四处 | §3.20「判域 = 本笔 diff 标出来的那些行：段落、围栏块、段界都不是判域的单位——区外一行不入。」∥ §3.26 判据句同句 ∥ 「区只有一种：本笔 diff 标出来的那些行」∥ `DOC-CHECK.md` §2.5 三条门逐句同句 |

**读数（本次运行 · 命令 + 首行）**

```text
doc_check({mode:"gate", docs:[docs/core/design/DOC-DISCIPLINE.md, docs/core/design/DOC-CHECK.md]})
  ⇒ DOC-CHECK GATE: PASS · 结论「0 段有问题（2 档全清）」· 登记未命中 1 条（旧 manifest 登记失配，非本批）
grep「段落长|段长|行太长|paragraphMax|lineMax|± 2|并区」于 DOC-DISCIPLINE.md
  ⇒ 改前 42 处 → 改后 4 处（全是真判据残留，见下「未落」）
```

**未落（如实报 · 不算交付）**

1. **A-DD27 前三条仍在盘**（`docs/core/design/DOC-DISCIPLINE.md` §5「A-DD27 判据」）：① 口径七条在册 ∥ ② 折行失效 ∥ ③ 拆段有效——三条都是段判据的验收条，本次只改到第 4 条起。同节 ④ 已换成锚面。
2. **用例表两条残余**：DD-80（「仅末式命中（段判据面）」）∥ DD-86（「整档入判」行含段类）∥ DD-85 附近仍有一行 `paragraphExemptZones` 口径——属于区带机制的验收，未与段判据一起裁。
3. **§3 标题括注枚举与档头枚举**仍写「段判据口径（条目 Q）」——枚举与条目同轮改（D3）未做。
4. **`docs/core/design` 其余档带同类词**：`BATCH-RECORD.md`（拒文四件 ∥ 「段判据罚的是…」）· `TOOLS.md` 的 `doc_check` 工具描述 · `ANCHOR-DEBT-REPAIR.md` AC-2 · `PROMPT-SYSTEM.md` 多处 `lineMax` 读数 —— **不在本席本批笔域，未动**，按「一处规则撤要连带改到底（D11）」需父侧派单。
5. **实现面零改**：`thincoder-core/doc-check/**` 仍判段与行——本次 gate 回执第二行仍是「判据：逐段检查——文字太长，难于阅读」，即设计与实装此刻不同源。实施轮与设计档同批落，才谈得上一致。

**边界（本批不做）**：不改锚判据本体与解析序；不改 `report` 面的行号坐标清点；不改区带机制（`paragraphExemptZones` 常量位与 §3.15 条目 N）；不改实现代码与测试面。

### 35 恢复轮：段长判据与「扩到整段」回装（用户 2026-11-12 手令 · 本席前一小时删错）

**用户原话**：「我刚才跟你说的，扩到整段，只用于判段长！你他妈的搞鸡毛啊！」＋「恢复 != 重写。拿 HEAD 的原文贴回去。」

**误删的根**：本席把「扩到整段」当成锚判据的扩区一并撤了。正确形状是两套判域：锚类判 diff 字面行、段落长判该行所在整段、行太长判该行本身。

#### 35.1 恢复了哪几块（逐块取 `git show HEAD:docs/core/design/DOC-DISCIPLINE.md` 原文，零重写）

| # | 块 | HEAD 行段 | 行数 |
|---|---|---|---|
| 1 | §3.18 标题 + 段判据口径条 1–7 与其七条子段（段是单位 ∥ 提示词面量行 ∥ 名字 ∥ 阈值 300 ∥ 不分域 ∥ 一处单源 ∥ 不分面） | 1063–1092 | 30 |
| 2 | §3.18 尾块：关键决策 ∥ 用例表（DD-115–DD-163 十行）∥ 验收回指 ∥ 集成测试 ∥ 集成差量表 ∥ 边界 | 1146–1175 | 30 |
| 3 | §3.20 参数面 `paragraphMax` / `lineMax` = 300 + 入参形态块（三格必填 + 一格可省） | 1268、1272–1279 | 9 |
| 4 | §3.20 起步判据 ② 段长（新增一行）+ 三条判据的分工（两条→三条） | 1292–1293、1295 | 3 |
| 5 | 交付门 gate 报面：「判据：逐段检查——文字太长，难于阅读」∥ 结论「0 段有问题」∥ `REFUSED（锚 A 条 · P 段文字太长，难于阅读 · L 行太长）` 与缺位省段句 | 1714、1716、1719–1725 | 7 |
| 6 | 报告态报面：「命中 K 条（锚 a · 文字太长…p · 行太长 l）」∥ `✗ 文字太长…` ∥ `✗ 行太长` ∥ 零命中结论行 | 1629–1635、1643 | 4 |
| 7 | 段长类的判域一句（新增，「段长判该行所在整段、行太长判该行本身」，单源指 DOC-CHECK §2.5） | 按用户三行口径落 | 1 |
| 8 | §5 A-DD27 ④ 段长判据条（提示词面逐行裸判 + 工具描述面同判段长） | 3439 | 1 |
| 9 | §5 A-DD35 整块（工具描述面同判段长，五条） | 3610–3618 | 9 |
| 10 | §5 用例行：`DD-83`（常量面 300→80）∥ `DD-137` ∥ `DD-139` ∥ `DD-140` ∥ `DD-169` ∥ `DD-171` ∥ `DD-172` ∥ `DD-173` | 1815、3799–3802、3824、3826–3828 | 8 |
| 11 | §7 F1（内核含段判据）∥ F2（键枚举含 `paragraphMax` / `lineMax`）∥ F3（单常量族）∥ 常量表 1–2 两键 ∥ 计数 4 → 6 ∥ AC-M8-5 | 3939–3941、3948–3949、`计数` 行、3998 | 7 |

#### 35.2 设计档两套判域（`docs/core/design/DOC-CHECK.md`）

- **§2.1 判据三类 → 五类**：闭集 = `档缺` ∥ `引缺` ∥ `节缺` ∥ `段落长` ∥ `行太长`；新增两个命中类条目（单源 = `DOC-DISCIPLINE.md` §3.18 条目 Q）；删掉「长度与行数一概不量」那句。
- **§2.5 判域表**：锚类 = 本笔 diff 标出来的那些行 ∥ `段落长` = 该行所在整段（段首行 → 段末行）∥ `行太长` = 该行本身；三道门（写盘 ∥ 批档 `edit`·`append` ∥ 收口）各按表分套。节标题改「三道门判域（锚类 ∥ 长度类两套）」。
- **§3 契约行两处**：`hits` 两数（`anchors` ∥ `paragraph`）；`line-refs.mjs` 行去掉「段判据已退役」。

#### 35.3 读数（本次运行 · 命令 + 结果）

```text
node 扫串（同尺：/段落长|段长|行太长|paragraphMax|lineMax/）docs/core/design/DOC-DISCIPLINE.md
  改前(HEAD) = 59 · 改前(盘上误删态) = 0 · 改后 = 39
grep 同串于 docs/core/design 全层         ⇒ 70 处（DOC-DISCIPLINE 39 · PROMPT-SYSTEM 16 · DOC-CHECK 11 · 余 4 档各 1–2）
doc_check({mode:"gate", docs:[DOC-DISCIPLINE.md, DOC-CHECK.md]})
  ⇒ 首行 DOC-CHECK GATE: PASS · 结论「0 段有问题（2 档全清）」
  ⇒ 回执第二行「判据：逐段检查——文字太长，难于阅读」——实装面仍以段判据为判据，设计面回装后两处同源
```

#### 35.4 未回装（23 行 · 逐行点名，本席不自行续删续改）

逐行清单 = `git show HEAD:docs/core/design/DOC-DISCIPLINE.md` 与盘上逐行比对，判据 = 同一行原串。三类：

1. **该回装、本席未落**（§3.18 列表项符号集那块的兄弟行）：HEAD 1115 ∥ 1125 ∥ 1127（方向性质 ∥ 读数用途 ∥ 实现坐标）——现盘是压缩后的说法，语义未丢、字面不同。
2. **与后续用户裁定相抵、不应回装**：HEAD 1295（行号坐标在 `gate` 面计入 `hits`）∥ 1442（区外命中只出 `STOCK_LINE`）∥ 1456 ∥ 2163 ∥ 3508 ∥ 3737 等——行号坐标的门面与「存量读数」已被用户 16:37 / 16:44 两次裁定撤掉，照 HEAD 贴回会复活被撤的判据。
3. **未判是否属本批误删，待父侧核**：HEAD 174 ∥ 428 ∥ 1392 ∥ 1394 ∥ 1426 ∥ 1569 ∥ 1759 ∥ 2387 ∥ 2623 ∥ 3416 ∥ 3420 ∥ 3457 ∥ 3482 ∥ 3827（`DD-172` 括号内「边界（反证）」与现盘「边界」一字之差）。**[上抛·待裁]**

#### 35.5 边界

不改实现代码（`thincoder-core/doc-check/**` · `doc-write-gate.mjs` 零改）：本笔只动设计档两份。判据阈值、抽取式、verdict 词、`zones` 逐档语义零改。用户原话「恢复 != 重写」照办：每块取 HEAD 原文，未重新表述；一处例外如实报——§3.18 列表项口径用的是 HEAD 原句，但落点由「整节替换」改为「插在现 §3.18 标题之下」（现盘该节保留了后续轮的压缩行，本笔未删）。

### 36 收尾轮：`DOC-DISCIPLINE.md` 砍到只留要求（用户 2026-11-12 手令）

**用户原话**：「只留要求，废话清干！」「每条 = 一句要求 + 一句为什么；不写判据怎么判 · 夹具怎么造 · 用例号 · 验收回指 · 读数 · 历史沿革」「目标：300 行以内」。

#### 36.1 判据（本轮的取舍线）

**每留一句问：这是「文档该长什么样」，还是「怎么保证它长成那样」？** 前者留，后者砍（它的家在 `DOC-CHECK.md` ∥ 批档 ∥ 台账）。

#### 36.2 结果

| 档 | 改前 | 改后 | 留了什么 |
|---|---|---|---|
| `docs/core/design/DOC-DISCIPLINE.md` | 3234 行 | **121 行** | 档头三行指针 + D1–D17 每条「要求 + 为什么」+ §2 边界（本档不写什么）+ §3 机器那一面在哪（一句指针） |
| `docs/core/design/DOC-CHECK.md` | 294 行 | 400 行 | 新增 §2.6 长度类判据实现面 · §2.7 抽取面三免 · §2.8 报面形 · §2.9 常量键位 · §2.10 写前门判面；档头改「判据口径单源在本档」 |

**读数（命令 = `doc_check` 的 `lines` 面）**：`DOC-DISCIPLINE.md` 121 · `DOC-CHECK.md` 400（合计 2 档，两档未越线）。

#### 36.3 砍掉的六类（对应用户的点名）

判据细则 · 夹具与用例号（DD-\* / A-DD\* 全体）· 验收回指 · 绝对读数 · 历史沿革与沿革叙述 · 边界讨论。`§2 机械校验最小集`（V1–V6）· `§4 文档↔实装对账` · `§5 验收标准` · `§7 机检引擎` 整节随砍。

#### 36.4 必须报的一件事（本轮先前的误伤）

本轮早前一轮按行号区间搬运时打偏两处：`§3.19`（条目 R）与 `§3.21`–`§3.25`（条目 T / U / W / X / Y）的正文在被替换区间内一并删除。**最终态的 121 行不依赖这些内容**（它们属本轮砍掉的那一类），但若后续要回查这几个条目的原文，来源只有备份 `.thincoder/tmp/DOC-DISCIPLINE.before-strip.md`（3234 行）与 git。按用户令「砍坏了报我，我从备份恢复，你别自己补救」——如实报，不自行回填。

#### 36.5 机检

```text
doc_check({mode:"gate", docs:[DOC-DISCIPLINE.md, DOC-CHECK.md]})  ⇒ 首行 DOC-CHECK GATE: PASS · 0 段有问题（2 档全清）
```

### 37 重写轮：`DOC-CHECK.md` 整档重来（用户 2026-11-12 手令）

**用户原话（同一轮三笔，后两笔是更正）**：

- 「重写 `docs/core/design/DOC-CHECK.md`。整个重来，不是修。目标 100 行以内。」
- 「我需要控制的事情只有几个：1. 一段文字不能太长，太长读不过来。2. 不要用行号做锚，因为行号会飘移。我根本没让你检查别的，其他的，都是你自己在加戏。」
- 「跨仓不报！」

第二笔里的「跨仓」是更正前一笔（原话曾写「跨仓解不到就报」）——**不是「解不到才报」，是根本不看**。本档按更正后的口径落。

**判据（取代 §1–§36 的全部判据面）**：门只判三件事——一段太长（超过 300 字）∥ 拿行号做锚（`档名 + 冒号 + 数字`）∥ 悬空指针（仓根相对形，项目根下找不到）。仓外一律不看：`../` 出仓 ∥ 绝对路径出仓 ∥ 别仓的档 ⇒ 跳过、一个字都不出。

#### 37.1 交付（报三件）

| # | 项 | 结果 |
|---|---|---|
| 1 | 改后多少行 | 401 → **70** 行（量法 = `doc_check` 的 `lines` 面，读数见 37.3） |
| 2 | 判几件事 | **三件**：一段太长 ∥ 行号做锚 ∥ 悬空指针。仓外零判 |
| 3 | 删掉了哪几节 | 模块目标与定根 · 解析腿序 · 四条豁免 · 定根（一档一根 ∥ 声明根 ∥ 分组建模） · 三道门判域 · 长度类实现面（段界十二谓词 ∥ 围栏行止 ∥ 码段配对 ∥ 区带机制） · 抽取面三免 · 报面形（gate 三形 ∥ report 报面整段 ∥ 未核行 ∥ 空范围） · 常量键位 · 写前门判面 · 接口契约 · 关键决策（KD-1–KD-10） · 验收（AC-1–AC-12） · 用例表（7-1–7-18） · 边界与登记项 · 集成测试设计。留下的只有：三件事、段落怎么数、怎么找、仓外不看、报面句子、判面、落点 |

#### 37.2 用户逐条点名不许有的，一条没留

```text
不许有  节缺（引用的节在不在）
不许有  引缺（引文对不对）
不许有  根 · 一档一根 · manifest · 域表
不许有  解析腿序（仓根 → 引用方目录 → 声明仓 → 后缀兜底）
不许有  四条豁免（排除面 ∥ 登记 ∥ 批档互引 ∥ 计划件）
不许有  判域（diff 行 ∥ zones ∥ texts ∥ 三道门）
不许有  读数 ∥ 报面分块 ∥ 档图面
```

新档的落点只写三个位置（段落 ∥ 档名抽取 ∥ 行号形）。三个调用点仍调同一套判据——**判据一套，谁调都一样**，调用点的差别不进判据面。

#### 37.3 读数（命令 + 结果）

```text
doc_check({mode:"report", lines:["docs/core/design/DOC-CHECK.md","docs/core/design/DOC-DISCIPLINE.md"]})
  ⇒ DOC-CHECK.md 70 行（改前 401）· DOC-DISCIPLINE.md 140 行（改前 141）
doc_check({mode:"gate", docs:[这两档]})
  ⇒ 首行 DOC-CHECK GATE: PASS · 结论「0 段有问题（2 档全清）」
  ⇒ 围栏内行号坐标 1 处（示例句，不入判）· 正文面 0 处
```

#### 37.4 顺带改的同族一处（`DOC-DISCIPLINE.md` · 出本席派单表，逐条报）

三处指路 + 一条要求与新判据相抵，同轮改（D11：一条规则变了，凡声明它的地方同轮改）：

| 处 | 改前 | 改后 |
|---|---|---|
| 档头指路行 | 「判据五类 · 解析腿序 · 四条豁免 · 定根 · 三道门判域 · 段长实现面 · 抽取面三免 · 报面形 · 常量键位 · 写前门判面」 | 「只判三件事：一段太长 · 拿行号做锚 · 悬空指针」 |
| 「边界」节首条 | 「判据、阈值、豁免、定根、判域、报面句形、常量键位」 | 「判据、阈值、报面句形」 |
| 「机器那一面在哪」节 | 「锚 · 长度（段与行）· 四条豁免 · 定根 · 三道门判域 · 报面句形 · 常量位」 | 三条判据各自问什么 + 报面句形 + 「找得到」指哪一句 |
| 第 19 条（`D19`） | 「行号引用写成 `档名:行号`」——与新判据②**直接相反** | 「不拿行号指路：写那一节的标题，或直接引那一句原文」 |
| 纪律节标题 | 「D1–D17」（实际写到 D20） | 「D1–D20」 |

#### 37.5 上抛（本席笔外）

1. **[上抛·待裁]** 需求档整层与新判据相抵：`docs/core/requirements/DOC-CHECK.md` 的 F1–F24 ∥ AC-1–AC-20 写的是旧机制（腿序 ∥ 豁免 ∥ 定根 ∥ 判域 ∥ 五类命中）。设计已收成三件事，需求层未动 ⇒ 两处不同口径。整档重写与否，归主 agent。
2. **[上抛·知会]** 实现面仍是旧机制：`thincoder-core/doc-check/**` 今天仍判节缺 ∥ 引缺 ∥ 行太长，三道门仍按 `zones` 挑改动区。本档是目标态，落地归实施轮；落地前设计与实装不同源。
3. **[上抛·待裁]** `DOC-DISCIPLINE.md` 第 20 条（「依据必须引原文」）与新三件事的关系：引缺不再判，写「依据」仍要求引原文。撤或留，由用户裁。
4. **[上抛·知会]** `doc_check` 报告态连跑两次都出「登记未命中 1 条（原文已变或已不在判集，复核后删）」——manifest 的 `index.docCheckExemptions` 存着一条失配登记，清它属主 agent 的笔域。

### 2026-11-12 · 轮次：两处设计档漂移（机制删了，教它的规范没删）

**射程** = `docs/core/design/BATCH-RECORD.md` §4.22 ∥ `docs/core/design/TESTING.md` §11.18.8。判据 = 读者照着规范写，写出来的东西没有机制接。

#### 1 盘上事实（本席实读 ∥ 实跑，非转述）

```text
thincoder-core/agent-tools/   无 batch-gate-hit.mjs ∥ batch-gate-judge.mjs ∥ batch-gate-report.mjs
grep pointerCell|证据格|evidenceCell|existenceOnly
  于 agent-tools ∥ doc-check ∥ tools 的 *.mjs                     ⇒ 0 命中
doc-check/index.mjs 的 hitLine = 三形单行（档+token ∥ 档+段+字数 ∥ 档+行号+token）——无解析根、无四件组装
test/rtm/guard.md 的 H2 = CLI 7 ∥ CLI 12 ∥ CLI 47；test/** 搜 48-1 ∥ CLI 48 ⇒ 0
ADVISOR-CONVERGENCE.md §18 实读标题 =「评审侧工具执行面：返回值归一」——不是「评审跑不了 doc_check」
```

#### 2 逐条改了什么

| # | 档 · 位置 | 改前 | 改后 |
|---|---|---|---|
| 1 | `BATCH-RECORD.md` §4.22 整节（138 行） | 教「证据格里判不了存在性的不进 `hits`」，连同 `pointerCells` 识别器 ∥ 三条腿同判 ∥ 拒文四件四格表 ∥ `tool-docs/batch.md` 三段逐字目标形 ∥ 集成行 `48-1`/`CLI 48` ∥ A 面指针 | 整节删除（判据与实现两空：见 §1） |
| 2 | 同档 §4.9 门 ④ 末句 | 「…仍按整档结构判；证据格列的收窄见 §4.22。」 | 「…仍按整档结构判。」 |
| 3 | 同档 §4.20 指针形态闭集 | 「…；§3 的列名 = `证据`，§4.22）」 | 「…；§3 的列名 = `证据`）」——列名规则留本行，只摘死指针 |
| 4 | `TESTING.md` §11.18.8 `guard` 行 | CLI 7 · CLI 12 · CLI 26 · CLI 36 | CLI 7 · CLI 12 · CLI 47 |
| 5 | 同表 `tooling` 行 | 止于 CLI 35 | 续 CLI 41 · 42 · 43 · 46 · 49 |
| 6 | 同表 `ends` 行 | CLI 33 · VSC 1 · VSC 2 | CLI 33 · CLI 39 · CLI 40 · VSC 1 · VSC 2 |
| 7 | `TESTING.md` 四处 `anchors.mjs` 的旧落点（`doc-check/` 下，重写轮已搬图侧） | 旧落点 | 现落点 `doc-graph/`（`CANON_OPERANDS` 三处实读仍在；§11.16 两处 ∥ 第七名三问两处） |
| 8 | 同档 §11.16 第七名三问 | 转抄 `grep … 零命中` | 改成它服务的关系句（既有六名与 J1 白名单无它；本批落第七位）——原命令改指后返回 1 条注释命中，转抄的「零」已成假话 |

**第 4 条之外的第 5、6 两条是同一判据的扫尾**：该表自述「现盘故事节逐条归册，一条不落」，不是只有 `guard` 一行漂。

#### 3 读数（命令 + 结果）

```text
grep 48-1 ∥ CLI 48 ∥ pointerCells ∥ 证据格判据   于 docs/core/design/**/*.md  ⇒ 0
grep 证据格                                       于 docs/core/design/**/*.md  ⇒ 17（全为活义，见 §4）
表 vs 盘（node 逐册集合比对）guard 3 ∥ batch-ledger 11 ∥ tooling 14 ∥ loop 8 ∥ paths 2 ∥ ends 5 = 43
                              盘上 43；六册集合全等
doc_check({mode:"gate", docs:[BATCH-RECORD.md, TESTING.md]})  ⇒ 首行 DOC-CHECK GATE: PASS（2 档全清）
行数（node 同一把尺）BATCH-RECORD 1688 ∥ TESTING 1764；本笔净删 138 行（两处摘指针不改行数）
```

#### 4 「证据格」到不了零：同名两义，判的只是死的那一义

- **死**：批档门的指针格豁免（判不了存在性的不进 `hits`）——本笔删的，删前只在 §4.22 一处，现零。
- **活**：§3 结论表的证据格（一格放一个归因指针，三形闭集）∥ RTM 五列里的证据格（放用例档路径或 `未落（用例待补）`）。17 处全是这一义。
- 故交付按「死义零命中」计：`48-1` ∥ `CLI 48` ∥ `pointerCells` ∥ `证据格判据` = 0。单字 `证据格` 不能判零，它的活义在盘上有两条活的规范靠它。

#### 5 关键决策

- **§4.22 的号不复用，§4.23 不提前**：`§4.23` 被代码注释引用（`thincoder-core/agent-tools/advisor-settle.mjs`「§4.23 ③（回退两处）」∥ `design-token.mjs`「与 §4.23 ③」），提前一档会把两处注释打成死指针。本档已有 §4.13→§4.15 同类号缺：号是稳定标识，不是连续序。
- **只删不换**：不写「原 §4.22 已退役」这类注记——否定句仍把死机制的名字留在规范面，读者照旧会去翻它。

#### 6 上抛 ∥ 未落

1. **[上抛·待裁]** 需求层还写着本条删掉的判据：`docs/core/requirements/ENGINEERING-MODE-V2.md` §13.23 第 4 条「证据格里的 `档缺` 属「指向而非证明」一类，三条腿都不入命中集、不出行（口径 = `docs/core/design/BATCH-RECORD.md` §4.22）」——口径所指已删，且与今天实现（`hitLine` 照出 `档缺`、计入 `hits`）相反。需求档不在本席笔域。
2. **[上抛·待裁]** 另两处设计档引用已删节：`ADVISOR-CONVERGENCE.md` §18 勘察证据行的「`BATCH-RECORD.md` §4.22（同一链的 B ∥ C 面）」∥ `LEDGER.md`「`notes` 是文档机检门回执的附加行族（`BATCH-RECORD.md` §4.22）」。两条都不在本轮声明内，未动；`notes` 家族本身仍活（`batch-gate.mjs` 的 `noteLines`），只是指针要改落点。
3. **[上抛·待裁]** `thincoder-core/tool-docs/batch.md`（产品描述面）仍逐字教那条死豁免：「A hit inside an evidence cell that only fails existence still lets the write land…」——它以 §4.22 为唯一副本，副本已删 ⇒ 现在是一句没有出处的活规范。
4. **[上抛·知会]** 另有 15 处 `anchors.mjs` 的旧落点（`doc-check/` 下）散在 6 份设计档：`DOC-GRAPH.md` 7 ∥ `PATH-RESOLUTION.md` 5 ∥ `ANCHOR-DEBT-REPAIR.md` ∥ `DOC-CODE-RECONCILE.md` ∥ `MANIFEST.md` 各 1；重写轮搬档后未改指，不在本笔两档内。
5. **[上抛·知会]** `doc_check` 回执尾部恒带「登记未命中 1 条（原文已变或已不在判集，复核后删）」——`PROJECT-MANIFEST.json` 的 `index.docCheckExemptions` 残留，归主 agent。

### 38 死指针清轮（父侧 2026-11-12 派单：对象已删，按 D8 判句子）

**判据（父侧原文）**：六串于 `docs/core/design` 全零；句子讲的机制**还在** ⇒ 改指新家；机制**整体没了** ⇒ 整句删；不写「（已退役）」「（原 X）」这类残留。围栏块里的示例不算残留。

#### 38.1 六串读数（同一把尺 = `node` 逐行扫；域 = `docs/core/design` 全层）

```text
改前 38 行命中 → 改后 10（五串归零）
scripts/doc-check.mjs            18 → 0
scripts/doc-check-anchors.mjs     5 → 0
doc-check/per-root.mjs            1 → 0
.thincoder/advisor.md            11 → 10   ← 未归零，见 38.3
doc-check-line-refs               2 → 0
cross-repo-refs                   1 → 0
围栏内命中：0（改前 0 · 改后 0）
```

#### 38.2 逐处处置（机制判 + 落到哪）

| 串 | 处 | 机制判 | 处置 |
|---|---|---|---|
| 仓根 doc-check 入口 | `DOC-CODE-RECONCILE.md` §3.1 引擎与入口两行 | 没了：`--domain` 参数化、单包装根、整仓扫这三形今天都不成立（工具面 = `thincoder-core/agent-tools/doc-check.mjs`，`target` / `mode` / `docs` 三参，判域 = 调用方给的档） | 两行整删（父侧 ① 的「不成立」支） |
| 同上 | `AGENT-LOOP-ASYNC-POOL.md` 五行（A-TW7 ∥ A-TW13 ∥ A-TW19 ∥ A-DA8 ∥ A-AD7）∥ `AGENT-LOOP-UPSTREAM.md` 一行（A-ZW6） | 没了：这几行整行只写「跑到仓根跑那条命令、对比悬空 / 行宽基线」 | 整行删；正文里的 A-TW22 一句同删，标题改 `A-TW20–A-TW21` |
| 同上 | `AGENT-LOOP-UPSTREAM.md` 的 A8 ∥ A-UM4 ∥ U5 ∥ `BASH-EXECUTOR-FACE.md` 的 AC8 ∥ `CORE-UNIFICATION.md` 的 T-C9 ∥ K1 | 没了 | A8 / A-UM4 只删命令半句、留「三方一致」；U5 删「机检本体仍 = …」括注；AC8 删末句；T-C9 ∥ K1 两行整删（行内容只有那条命令） |
| 同上 | `ENGINEERING-MODE-V2.md` 的 M8 | 还在，落了新家 | 改指 `thincoder-core/doc-check/`（引擎）+ `thincoder-core/agent-tools/doc-check.mjs`（工具面） |
| 同上 | `MANIFEST.md` §2.7 消费点表第 8 行 ∥ §2.10 消费面表第 4 行 | 没了：那两行记的「第二份发现实现」与「读 `DOC_CHECK_BUILTINS` 的两脚本」都不存在了 | 两行整删；行号续排（9→8；5–8→4–7），清单标题 `8 处` → `7 处` |
| anchors 手跑入口 | `DOC-CODE-RECONCILE.md` §3.6 两处 ∥ `DOC-SYSTEM.md` 末注三段 ∥ `MEMORY.md` 跨仓引用一条 ∥ `MANIFEST.md` 第 4 行 | 注记标记集机制没了（现役引擎无该通道） | 前两档整句 / 整块删；`MEMORY.md` 改指 `thincoder-core/doc-graph/anchors.mjs`（锚机检声明源候选仍活）；`MANIFEST.md` 随行删 |
| per-root | `MANIFEST.md` §2.10 去重键那行 | 还在，尺子换了家 | 依据行改 `thincoder-core/doc-graph.mjs`（`pathKey` 现是该档私有谓词，**不再导出**——原文「同仓已导出的 `pathKey`」那半句同改） |
| line-refs ∥ cross-repo-refs 两族用例 | `PATH-RESOLUTION.md` §2.3 后一支依据段 ∥ §9「已落地的行不再列」一句 ∥ `TOOL-PARAM-ZERO-DEFAULTS.md` 跑者清单 | 用例档与那几行 RTM 都删了 | 前两处整段删（两段只是被删对象的旁证）；跑者清单去掉已删项、`6 档` → `2 档` |

#### 38.3 没归零的那一条（[上抛·待裁]）

advisor 档那一串现 10 处，全部在讲一个**活着的机制**：`thincoder-core/advisor/history.mjs`「`export const ADVISOR_MD_PATH`」+「`loadAdvisorMd(cwd)`」仍在读它，`thincoder-core/advisor/messages.mjs` 仍把它作为 `## Review Criteria` 推进用户消息。删掉的那一份是**盘上的档**，不是机制。

按父侧自己的两分支规则，这一条落在「机制还在」支——只是它没有搬过家，无处可改指。按「归零」执行就得删掉活规则的描述：`PROMPT-SYSTEM.md` 的提示词面操作数豁免、`ADVISOR-CONVERGENCE.md` 的准则覆盖语义都会失真。**本席按规则处置、不按归零处置**：只改掉一句已经不成立的观察（`ADVISOR-GUARDS.md` 里「工作区根 … 实存」改成条件句），其余九处保留。

要归零，需父侧裁一句：这条是「档没了就算机制没了」，还是「机制以代码为准、句子留」。裁完本席同轮落。

#### 38.4 写前门挡下的一件（如实记）

`TOOL-PARAM-ZERO-DEFAULTS.md` 第一笔写被写前门拒（`REFUSED（锚 4 条）`）：该档改动区里本就躺着三个已删用例档的指针。按 D14 同笔清掉这三处后才落盘——即父侧那句「清完就不挡了」的同一形。

#### 38.5 边界与残余

- 只删句子 / 只改指：判据本体、阈值、词表零改；未动 `test/**`、需求档、提示词面。
- 本轮只治这六串。另一族（不在这六串内、本轮未动，仅记）：`DOC-GRAPH.md` §3 已无 `DOC-DISCIPLINE.md` 的那个节号、`MEMORY.md` 的 `DOC-DISCIPLINE.md` §4.2.2 同理、`MANIFEST.md` §2.10 的 `DOC_CHECK_BUILTINS` 三键与现行常量表不一致。

### 12 增补 · `.thincoder/` 整片不判（裁定已下 · 2026-11-12）

**判据一句**：`.thincoder/` 下的路径一律不判——不入判集、不出命中、不出一行。

**为什么**：那是运行时状态目录——会话 ∥ 记忆 ∥ 临时件 ∥ 运行期操作数全在那儿。它不是文档区；判它等于把工具自己的家当当成读者要翻的资料。

**为什么不是豁免表**：一条路径前缀，一眼可判——没有文件名清单、没有逐条登记、没有按类按文的匹配。

**现场（这是真误报，不是假想输入）**：`thincoder-core/doc-check/existence.mjs` 的 `pathIndexOf` 建索引时跳过 `.thincoder`，而判据 ③ 先看「拼根路径在盘」；两下一夹，`.thincoder` 下不存在的运行期路径就落 `档缺`。本仓 `.thincoder/` 实测只有 `tmp/`、几份日志与 `delivery-checklist.md`。上一轮本席的 §2 就是被这一条挡下的。

**落点三处**（本席两处 + 父侧一处）：

| # | 落点 | 状态 |
|---|---|---|
| ① | `docs/core/design/DOC-CHECK.md` §3：token 问句块加一行 + 第三个例外段 + 「为什么这不是豁免表」 | 已落 |
| ② | `docs/core/requirements/DOC-CHECK.md` F7 + AC-8（另加一句「F7 不是豁免表」） | 已落——按父侧本轮明令同笔；需求档非本席常态笔域，见 §13 第 1 条 |
| ③ | `thincoder-core/doc-check/existence.mjs` 判据 ③ 的跳过面 | **未动**——父侧令「等我另派」 |

**顺手记下的一条（父侧点名）**：**删机制要连带看它原先盖住的真误报。** `index.docCheckExcludePaths` ∥ `index.docCheckExts` 今天没有消费者，而它们当初盖住的「运行期目录里的路径别判」这一需求，删面之后以 `.thincoder/` 前缀的真误报重新露头。删一条机制时先问一句：它当初替谁挡了什么？不答这句，挡掉的那类误报会在下一轮换个面孔回来。

### 13 增补 · `MANIFEST.md` 两处相反记载 + 三处死节号（父侧第二件）

**按现引擎重写，键按令保留**：

- `docCheckExcludePaths` ∥ `docCheckExts`：原写「落进去的档不入判、不出命中」，与 schema 注释「今天无消费面」相反 ⇒ 改成「键在，今天没有消费者」，不写「已删」。
- `DOC_CHECK_BUILTINS`（`lineWidth` ∥ `widthExemptZones` ∥ `exemptions`）：引擎里已无此符号 ⇒ 参数面改成「代码常量 `PARAGRAPH_MAX = 300`（`thincoder-core/doc-check/paragraph.mjs`），另两判据无阈值」。
- 三处死节号：`MANIFEST.md` 指 `DOC-CHECK.md` 的 §2.1 ∥ §2.3 ∥ §2.8（该档现为 §1–§7）⇒ 改指现存节 §1 ∥ §3 ∥ §4 ∥ §5。
- 连带同笔（同一条规则的别处说法）：§2.11 的「判据两条 ∥ 行宽 300 ∥ 声明面五处 ∥ 锚解析序两级」与现引擎相反，一并改成「三条判据 ∥ 段长阈值 ∥ 声明面只读 `docRoot.batches` 一处 ∥ 仓内找一次、不判唯一」。

**验收判据（每条都能绿也能红）**：

```text
① grep `DOC_CHECK_BUILTINS` ∥ `BARE_NAME_EXTS` 于 docs/core/design/MANIFEST.md  ⇒ 0 命中
   红侧：把 `DOC_CHECK_BUILTINS` 接回任一行 ⇒ +1
② grep `.thincoder/advisor.md` 于 docs/core/design/PROMPT-SYSTEM.md            ⇒ 仍在（运行期操作数的自述，按令不动）
③ 目检：docs/core/design/DOC-CHECK.md §3 四条不报齐（仓外 ∥ 在建 ∥ 批档整份 ∥ `.thincoder/` 之下）；
   docs/core/requirements/DOC-CHECK.md 的 F7 ∥ AC-8 在表内
   红侧：删掉 §3 的第三个例外段 ⇒ 读者在 §3 找不到 `.thincoder/` 一句
④ doc_check(mode:"gate", docs:[本轮三档]) 首行 = DOC-CHECK GATE: PASS
```

**读数（命令 + 结果）**：

```text
grep `DOC_CHECK_BUILTINS` 于 docs/core/design/MANIFEST.md         ⇒ 0 命中（改前 2 行：§2.11 参数面 ∥ KD-M1-47）—— 合计口径见下一条
grep `BARE_NAME_EXTS` 于 docs/core/design/MANIFEST.md             ⇒ 0 命中
grep `.thincoder/advisor.md` 于 docs/core/design/PROMPT-SYSTEM.md ⇒ 7 行命中（仍在）
node 行计数（内容行数、末行换行不计；改前 = HEAD、改后 = 现盘）：
  docs/core/design/MANIFEST.md            1470 → 1460
  docs/core/design/DOC-CHECK.md           1147 → 95      （HEAD 是重写前那一版；本轮在此档上加 §3 第三个例外）
  docs/core/requirements/DOC-CHECK.md       80 → 59      （同上；本轮加 F7 ∥ AC-8）
```

**轮次性质**：本轮是**增行轮**（落一条新规则），与前面撤机制的「只减不增」不是同一件事——两条口径不互相覆盖。

**笔域披露**：需求档 F7 ∥ AC-8 由本席落笔，依据是本轮父侧明令「落三处」并把它列入本席本轮的声明文件表；按 D1 需求档常态归主 agent，故在此点名，不是默认口径。

### 修正轮 · 评审第 21 轮（2🔴 + 8🟡 + 1🔵 · 父侧 2026-11-12 派单「只修、不加新东西」）

**射程**：三份档——`docs/core/design/TOOLS.md` §6.25 ∥ `docs/core/design/DESIGN-TOKEN-SETTLEMENT.md` §9 ∥ §10 ∥ §10.1 ∥ §10.2 ∥ 用例表 ∥ 档位登记 ∥ `docs/core/requirements/DESIGN-TOKEN-SETTLEMENT.md` 档头 ∥ F-D7。代码一字未动；未加节、未加机制。

#### 1 落点（逐条 · 评审号 → 改前 ∥ 改后）

| # | 评审项 | 改前 → 改后（逐字） | 落点 |
|---|---|---|---|
| 🔴1 | 同节既七又六 | 九处改成七：「六态拆分的每一句」→「七态拆分的每一句」∥「本节六态拆分的前四态」→「七态拆分的前四态」∥ ③ 标题「门六态分支的六条拒句逐字」→「门七态分支的七条拒句逐字」∥ L5「③ 六条拒句」→「③ 七条拒句」∥ A2「六态互异」→「七态互异」∥ A5「后两态」→「后三态」∥ K1「六态 = 同一次判定的六条分支…后两态」→「七态…七条分支…后三态」∥ K5「六条拒句」→「七条拒句」∥ K2「六态可单测」→「七条分支可单测」（派单未点；清点连带——grep 判据要求 §6.25 零命中，它是第九处） | `TOOLS.md` §6.25 |
| 🔴2 | `gateDesignToken` 住哪 | 五处改成 design-token 档：「两枚 `export function` …住 `subagent-spawn.mjs`」→「定义住 `agent-tools/subagent-design-token.mjs`；`agent-tools/subagent-spawn.mjs` 只再导出」＋再导出行入围栏块逐字 ∥「helper 落位：两枚定义追加在同档模块尾（`buildSpawnChild` 之后、文件末）」→「两枚定义住 `agent-tools/subagent-design-token.mjs` …本笔只在该档内加 ⑤ ⑥ 两步」∥ L7 坐标「同档模块尾（`buildSpawnChild` 之后）」→「`agent-tools/subagent-design-token.mjs`」∥ ③ 标题宿主（清点连带）∥「外部档案处置」段（派单点名）∥ 舱 B 文件列（派单点名） | `TOOLS.md` §6.25 |
| 🟡3 | `publicRepos` 读数错 | §9「项目声明 … 的 `index.publicRepos` = 空 ⇒ 无公开源档可查」→「`index.publicRepos` 的实读与结论单源 = §10.1 那条（本节不另记读数）」；§10「= `[]`（本轮 `manifest read` 实读）」→「读数单源 = §10.1（本节不另记）」。单源 = §10.1 那条正确读数（盘上 `PROJECT-MANIFEST.json` 的 `index.publicRepos` 两条：`../.thincoder` ∥ `../thincoder.com`） | 设计 §9 ∥ §10 |
| 🟡4 | `batchDocAbs` 怎么进函数 | 设计 §10.1 新增一段「**入参面**：`gateDesignToken(parent, args, { batchDocAbs })`——第三参就是上面那个已解析的值（解析单源 = `buildSpawnChild` 的 batchDoc 门，本步不再解析 `args.batchDoc`）。⑥ 封印步不添入参：它读的是槽里的 `docs`。」；同步 `TOOLS.md`：④ 签名块、⑤ 比较对象段、`buildSpawnChild` token 门块那句、⑤ 落点表 L5、K2 | 设计 §10.1 ∥ `TOOLS.md` §6.25 ④⑤ |
| 🟡5 | 封印不可读无用例 | 用例表新增 `U-BG22`：「槽有封印值，清单里一份被审档从盘上删掉（缺档 ∥ 权限错）后派单」⇒「拒；拒文逐字 = seal-unreadable 句（含那份额档的路径）；不落进「无值 ⇒ 不拦」；按原字节放回那份档后再派单 ⇒ 放行」 | 设计 §10 用例表 |
| 🟡6 | A8 漏归属 | 「A8 = U-BG17 + U-BG19 + U-BG20」→「A8 = U-BG17 + U-BG18 + U-BG19 + U-BG20 + U-BG21 + U-BG22（闸面：批不符 ⇒ 拒；批相符 ⇒ 放行；封印未动 ⇒ 放行；封印动一个字节 ⇒ 拒；旧槽无值 ⇒ 跳过；封印不可读 ⇒ 拒）」 | 设计 §10 验收 |
| 🟡7 | 缺失行数量 | 「一处：… **10-4**」→「两处：… **10-4**（清点「批」列显名）与 **10-5**（闸面两向各拒一次——批不符与封印不符各得一条拒文，改回原字节后放行）」 | 设计 §10 集成测试设计 |
| 🟡8 | 分支出处自相矛盾 | 「**分支出处（本次会话实况）**：评审 #58 过后沿用同一枚令牌派了 #66 ∥ #71——令牌的批归属与派单批一致…拦不住」→「**分支出处（复现路径 · 复现驱动的防御）**：以 `batchDoc` = A 批跑一次设计评审铸一枚槽，再用同一枚令牌派 `batchDoc` = B 批的 eng-coder——四步核全过、派单放行；本步拒的就是这一面。未留下「归属与派单批不同」的会话实况记录，故本条按复现路径立、不按实况立。」 | 设计 §10.1 |
| 🟡9 | `U-7` 别名 | 需求 F-D7「（`U-BG16`——原稿作 U-7，与设计侧同名）」→「（`U-BG16`）」；设计「**编号对齐**：…`U-7` = `U-BG16`；…`U-8` = `U-BG8`（同一用例…）」整句删，只留其后的「**夹具前置**」段 | 需求 F-D7 ∥ 设计 §10 |
| 🟡10 | 档位登记漏一档 | 「本批六档」→「本批七档」；「改代码前未过 500（四档）」→「（五档）」并补 `thincoder-core/agent-tools/subagent-design-token.mjs`（改前 81 行——§10.1 ⑤ ∥ §10.2 ⑥ 的落点档，未过 500） | 设计 §10 |
| 🔵11 | 需求档头覆盖 | 「（F-D1–F-D6 / N-D1–N-D4 判定句）」→「（F-D1–F-D9 / F-SL1–F-SL3 / N-D1–N-D4 判定句）」 | 需求档头 |
| 12 | 清点连带（同族 · 派单未点） | `TOOLS.md` 里两处以行号指向 `resolveDesignSlot` 拒句的坐标（正文一处、K3 行一处）改成按符号定位：无槽拒句已是 `throw designTokenRefusal("missing")`，该函数住 `subagent-design-token.mjs`。理由 = 同一问（这道门住哪）的第三处错答——盘上那个行号现落在无关分支上 | `TOOLS.md` §6.25 |

#### 2 读数（命令 + 结果）

```text
grep 六态|六条 于 §6.25（node 行扫描；节范围 = 1901–2081 行）        ⇒ 0 命中（改前 9）
全档同式扫描                                                          ⇒ 3 命中，均为「台账六态」（台账状态机，非本对象）
U-7 ∥ U-8 于设计 + 需求两档                                           ⇒ 0 残留
`publicRepos` = `[]` 形于设计 + 需求两档                              ⇒ 0 残留
内容行数（末行换行不计）subagent-design-token.mjs                      ⇒ 81
doc_check(mode:"gate", docs:[三档])                                    ⇒ 首行 DOC-CHECK GATE: PASS（3 档全清）
```

#### 3 写前门拒过三次（如实记）

1. 第一批 17 条全被拒：`./subagent-design-token.mjs` 被当成指针判 `档缺`，另有两段过长。处置 = 那把再导出语句放进围栏块（围栏整块不判），长段拆句。
2. 第二批仍 1 段过长：新写的「外部档案处置」段与下一行并成一段（相邻非空行并段）。处置 = 两问分两段（各 < 300）。
3. 本段首投被拒：表内那个行号坐标字面被判命中。处置 = 改成「以行号指向…的坐标」的说明写法，不再写该字面。三批均零字节落盘，无半写态。

#### 4 与派单的差异（披露）

- **A8 比派单多列一个**：派单给的是 `17+18+19+20+21`；`U-BG22` 由本轮第 5 条新建、同属闸面，若不同列则无验收归属（正是第 6 条要消的那类缺口）。父侧若要严格照原文，删掉 `+ U-BG22` 与「封印不可读 ⇒ 拒」半句即可。
- **第 10 条照令写了「改前 81 行」**：该节下一句本就写着「逐档读数…按 D12 住批档，本节只写关系」——两者相抵。派单明令写明，故照令落；若要守 D12，删这个数即可，档位结论（七档、未过 500）不受影响。

### 收尾三件（父侧 2026-11-12 末轮派单）

**射程**：两档设计档逐处——`docs/core/design/TOOLS.md` §6.25 与 `docs/core/design/DESIGN-TOKEN-SETTLEMENT.md` 的档位登记。代码零改，需求档零改。

#### ① 删掉那个绝对读数

档位登记改后逐字：「`thincoder-core/agent-tools/subagent-design-token.mjs`（§10.1 ⑤ ∥ §10.2 ⑥ 的落点档；未过 500）。」

删掉的只是那一个读数，结论「未过 500 ⇒ 不提分拆」留在原处。同节下一句本来就写着「逐档读数按 D12 住批档」——两句话从此不再互相打脸：规范面只带结论，读数住批档。

#### ② §6.25 的行号坐标清零

点名的三处：

1. `buildSpawnChild` 的 token 门块——坐标删，留函数名定位。改后：「`buildSpawnChild` 的 token 门块改为 `issuedToken = gateDesignToken(parent, args, { batchDocAbs })`」。
2. `designId` 回写那句——坐标删，改由函数名 + 逐字代码定位。改后：「`buildSpawnChild` 里 `if (role === "eng-coder" && issuedToken) … child._engDesignId = args.designId ?? null` 那一段依赖它」。
3. L4 落点行整行删。它的现文是 `throw new Error("Invalid or missing design token …")`，该串在今天 `thincoder-core/**` 零命中（`gateDesignToken` 已改用 `designTokenRefusal`）⇒ 这一行要改的东西早就不在盘上，留着只会让实施席去找一句不存在的话。它要求的效果已由 L5（调用行改成带第三参的 `gateDesignToken`）与 §6.25 ③ 的七条逐字拒句承担，不另立第二行。

连带四处同形（同节，同一缺陷）：

4. ① 表的两格坐标删成「eng-coder 角色行」「任务书段末」。
5. ③ 表 missing 态「（`:131` 改写为同句）」→「（该函数的无槽拒句改写为同句）」。
6. ⑥ 表 T2「（`:131` 并入同态）」→「（`resolveDesignSlot` 的无槽拒句并入同态）」。
7. §6.25 机制段那句把已不存在的旧串当引文：「门的同一句 `Invalid or missing design token` 拆七条判定分支」→「门的判定拆七条分支」（现状 = 七条各成一句，不再有那句被拆的总句）。

节外两处（§6.25 之外、同一缺陷，由「整档判」逼出，已一并改）：一处是端侧副本的两处行号，删坐标留「该副本 pending 分支 ∥ advisor 分支」的角色定位；一处是「兼容-2」用例行里的三串行号，删坐标留用例名（C1 ∥ AC-11）。

#### ③ 三处「六态」——一句话确认

读数：内置 `grep`，串 `六态`，域 `docs/core/design/TOOLS.md` ⇒ 3 处，全部是台账状态机（协议字面值一行 ∥ 边界段一行 ∥ checklist 语义承接一行），与本节的对象不同，按父侧裁定原样保留。

**更正我上一轮的措辞**：那 3 处不在 §6.25 节内，分布在该档的三处别节；上一轮报成「§6.25 里」，是定位写错了，处置本身不变。

#### 读数

```text
grep  `:[0-9]` （反引号形，域 TOOLS.md 全档）        ⇒ 0 命中（改前 8：§6.25 内六处 + 节外两处）
grep  81 行   （域 DESIGN-TOKEN-SETTLEMENT.md）      ⇒ 0 命中
grep  Invalid or missing design token（域 docs/core/design/**）⇒ 0 命中（改前 1，在 §6.25 机制段）
grep  六态    （域 TOOLS.md）                        ⇒ 3 命中，均为台账状态机
doc_check(mode:"gate", docs:[两档])                  ⇒ 首行 DOC-CHECK GATE: PASS · 0 段有问题（2 档全清）
```

### 39 修正轮 · 父侧 2026-11-12 派单四件（三处设计缺口 + 一处硬限违规）

**射程**：只改 `docs/core/design/DESIGN-TOKEN-SETTLEMENT.md` 一份。代码零改、需求档零改、数值 / 判据 / 拒文零改。来源 = 批档 §5「DESIGN-TOKEN-SETTLEMENT §10.1 ∥ §10.2 落地」的 §6 上抛第 1–3 条 + §4 第 6 条档位读数。

#### 39.1 逐件（改前 ∥ 改后）

| # | 件 | 改前 | 改后 |
|---|---|---|---|
| ① | §10.2 缺一句：封印清单按哪把尺解析 | 只有「被算集合 = 该次评审 `documents` 里的非批档」，未写 `documents` 按哪把尺解析 | 新增一段：`documents` 走 `thincoder-core/agent-tools/review-facts.mjs` 的 `resolveReviewDocPaths(documents, agent.cwd)`，结果随实例落 `run.docAbs`，封印计算与派单复算都读这一组；实例键 `docSetKey` 只对旧实例兜底 |
| ② | §10.2 缺一句：settle 面封印算不出来的处置 | 只有闸面一侧（闸面读不到 ⇒ 抛），settle 侧无文 | 新增三段：返回 `{passed:false, sign:null}` 且在任何写之前返回、标记句单源 `SEAL_UNREADABLE_MARK` ∥ 拒签而非 throw 的理由（throw 穿过 `settleAdvisorRun` 的 `onAccounting`，该串无 catch）∥ 闸面不随此改（那里没有可回的结算面） |
| ③ | 三问表漏一个名 | 三问表无 `designSealHash` | 新增一行：`existing but unusable: thincoder-core/agent-tools/subagent-run.mjs taskSeal`（只接单串、sha256 截断 12 位）⇒ 一处定义、两处同调（settle 算 ∥ 闸面复算） |
| ④ | §10 档位登记漏一档 + 硬限 | 「本批七档」，未含 `advisor-async.mjs`（改前 512 行，已过 500 设计器线） | 「本批九档」（五档未过 500 · 新增档两档 · 已过 500 两档）；新增「分拆方案（`advisor-async.mjs`，本批内实施）」四条 |

#### 39.2 分拆方案（单源 = 设计 §10「分拆方案」；实施归本批 eng-coder）

- **拆出族** = 实例与池判定（只读）：`advisorRunsRead` · `advisorRuns` · `openCodeRun` · `openDesignRun` · `resolveAdvisorLaunch` · `effectiveAdvisorRound` · `ADVISOR_POOL_LIMIT` · `resolveAdvisorPoolLimit` · `advisorPoolLimitFor` · `runningAdvisorOfScope` · `runningAdvisorCount` · `advisorReviewPending` → 新档 `advisor-launch.mjs`（与 `advisor-async.mjs` 同目录）。
- **切点** = 原档「Review-instance registry」分节起、`cancelAsyncAdvisor` 之前的整段。
- **原档留下** = `cancelAsyncAdvisor` · relay · 出队 ∥ 刷新 ∥ 补位 · `launchAsyncAdvisor` · `closeOpenCodeAdvisorRuns`；既有 import 面经 re-export 零改（同 `design-token.mjs` ∥ `advisor-settle.mjs` 两次拆分的先例）。
- **为什么切在这里**：只读判定一族 / 写动作一族读写面不交叉；依赖成单向边（拆出族只用 `carrierField` ∥ `docSetKey` ∥ `resolveReviewDocPaths` ∥ `randomUUID`）。
- **未落「另批再拆」**：设计写的是「本批内实施」，没有逃生口句。

#### 39.3 档位登记读数（每档一个数：原始行数）

**量法**：node 行扫描，内容行数、末行换行不计（与收口面 `countContentLines` 同一把尺）。命令 = 对下表八档逐个 `readFileSync(f,'utf8').split('\n').length - (t.endsWith('\n')?1:0)`。

| 档 | 原始行数 |
|---|---|
| `thincoder-core/token-ttl.mjs` | 428 |
| `thincoder-core/agent-tools/design-slots.mjs` | 305 |
| `thincoder-core/session-slot-write.mjs` | 279 |
| `thincoder-core/agent-tools/design-token.mjs` | 429 |
| `thincoder-core/agent-tools/subagent-design-token.mjs` | 132 |
| `thincoder-core/session-slots-manifest.mjs` | 264 |
| `thincoder-core/agent-tools/batch-lifecycle.mjs` | 488 |
| `thincoder-core/agent-tools/advisor-async.mjs` | 516 |

`advisor-launch.mjs` 现未落盘（本批 eng-coder 建），故无读数。

**量法与 2026-11-12 12:43 裁定的口径差（[上抛·待裁]）**：裁定写「读数 = `doc_check` 的 `lines` 面」，而该面已随 `doc_check` 重写退场——`thincoder-core/agent-tools/doc-check.mjs` 对 `lines` 零命中（本席实读）。本表因此用 node 行扫描。要恢复 `doc_check` 面须先把该面加回引擎，请裁。

#### 39.4 验收（本轮）

- 设计档交付门：`doc_check(mode:"gate", docs:[设计档])` ⇒ 首行 `DOC-CHECK GATE: PASS`· 0 段有问题。
- 分拆是否落地：本批 eng-coder 交付后 `advisor-async.mjs` 落到 500 之下 ∧ `advisor-launch.mjs` 在盘 ∧ 既有 import 面零改（`completion.mjs` ∥ `advisor.mjs` ∥ 测试面不改）。

§9 integration delta = zero rows: no business-observable result changed, so no row can break or be added（分拆 + re-export = 行为零变）。

### 40 修正轮 · 父侧 2026-11-12 派单：设计 §10 分拆方案的两句（依赖清单 ∥ 环）

**射程**：只改 `docs/core/design/DESIGN-TOKEN-SETTLEMENT.md` 的 §10「分拆方案（`advisor-async.mjs`，本批内实施）」段。代码零改、需求档零改、判据与数值零改。来源 = 本记录 §5「`advisor-async.mjs` 分拆」的 §6 上抛第 1 条（评审 🟡#1 同指）。

#### 40.1 逐件（改前 ∥ 改后）

| # | 件 | 改前 | 改后 |
|---|---|---|---|
| ① | 依赖清单漏两项 | 「拆出族只依赖 `carrierField` ∥ `docSetKey` ∥ `resolveReviewDocPaths` ∥ `randomUUID`」 | 「只依赖六项——`carrierField` ∥ `getAsyncPool`（`async-settle.mjs`）∥ `docSetKey` ∥ `resolveReviewDocPaths` ∥ `scopeAdvisorMirror`（`review-facts.mjs`）∥ `randomUUID`（`node:crypto）」 |
| ② | 「不成环」是绝对句、与模块图不符 | 「原档反向 import 它的判定函数，成一条单向边，不成环。」 | 「原档反向 import 它的判定函数，两档之间是单向边。与 `async-settle.mjs` 之间的一环是拆分前既有的（该档静态 import `refillAdvisorQueue`，拆出族 import `carrierField` ∥ `getAsyncPool`）——拆分后同一环多经 `advisor-launch.mjs` 一格，环数不变、本次未新增环，环上无模块级求值（两侧都只在函数体内调用）。」 |
| ③ | 派单外一件（披露 = 40.3） | 「**实例与池判定**（只读）」 | 「**实例与池判定**（对池与队列只读）」 |
| ④ | 机械门逼出的排版一件（披露 = 40.3） | 「**为什么切在这里**：① … ② … ③ … ④ …」= 一条 771 字的清单项（本笔把 ② 改完后更长） | 拆成五个带名子项（① ∥ ② ∥ ②-1 ∥ ③ ∥ ④），逐字不改。起因 = 首次折行被门拒：无标记续行并成一段 ⇒ 「文字太长，难于阅读」，一个字节未落盘 |

#### 40.2 读数（命令 + 结果 · 本席实读，不经 §5 转述）

```text
thincoder-core/agent-tools/advisor-launch.mjs 的 import 三行（改前改后同值）
  import { randomUUID } from "node:crypto"
  import { docSetKey, resolveReviewDocPaths, scopeAdvisorMirror } from "./review-facts.mjs"
  import { carrierField, getAsyncPool } from "./async-settle.mjs"
  ⇒ 六项与交付表逐字相等；设计原清单缺 getAsyncPool ∥ scopeAdvisorMirror 两项

环（三处静态 import，逐档实读）
  advisor-launch → async-settle（carrierField ∥ getAsyncPool）
  async-settle  → advisor-async（refillAdvisorQueue）
  advisor-async → advisor-launch（判定函数四名 + re-export 块两名）
  ⇒ 一环三格；拆前同一环是 advisor-async ↔ async-settle 两格 ⇒ 环数不变

内置 grep 不成环 于 docs/core/design/**（全 .md）   ⇒ 0 命中（改前 1，即本句）
doc_check(mode:"gate", docs:[DESIGN-TOKEN-SETTLEMENT.md]) ⇒ 首行 DOC-CHECK GATE: PASS · 0 段有问题（1 档全清）
```

#### 40.3 决策披露：第 ③ 件不在派单里

- **它为什么还是改了**：派单边界是「只改这一处…不改别的节」；第 ③ 件在**同一段、相邻一行**，且是同一缺陷在设计面的另一半——§5「分拆」评审 🔵#4 认定「头注主词『只读』与档内两处写动作不符（`advisorRuns` 建容器、`resolveAdvisorLaunch` 写注册表与镜像）」，实施席当场改了新档头注，设计档那句留在盘上。改后与新档头注逐字同口径（「对**池与队列**只读」）。
- **改动量** = 一个括注，零判据、零数值、零新语义。
- **不改的代价**：设计档继续称该族「只读」，下一位读档的人按它推断「这族不写任何状态」，而它写实例注册表与镜像。
- **越界则回退** = 一处括注。
- **第 ④ 件也是门逼出来的**：本笔把 ② 从 4 项写成 6 项后，该清单项一行 771 字。首次处置 = 在句间折行，**被门拒**（`docs/core/design/DESIGN-TOKEN-SETTLEMENT.md` 报「1 段文字太长，难于阅读」，零字节落盘）——无标记的续行会被并成一段，折行解决不了。按门给的第一条出路处置：逐条加标记、逐条起名，拆成带名列表项，**逐字不改**。判据读数 = 折行形被拒、带名子项形 PASS（同一处两种形，见 40.2 末两行）。

#### 40.4 验收（本轮）

```text
设计档交付门   doc_check(mode:"gate") ⇒ DOC-CHECK GATE: PASS（1 档全清）
依赖清单       六项，与 advisor-launch.mjs 的 import 三行逐名相等
环             「单向边」+「既有环、环数不变」两句在盘；「不成环」零命中
```

§9 integration delta = zero rows: no business-observable result changed, so no row can break or be added（本笔只改设计档两句，代码与行为零改）。

## §3 设计评审（评审子代理）
**状态行**：评审通过



### 轮次 1（评审子代理）

## 评审结论（设计轮 · 四档：requirements/DOC-CHECK.md ∥ design/DOC-CHECK.md ∥ DOC-DISCIPLINE.md ∥ PATH-RESOLUTION.md）

| # | 严重度 | 状态 | 证据 |
|---|---|---|---|
| 1 | 🔴 | 未修 | 设计 §5 新名三问「`none found`——仓内零命中，本批首建」vs 盘上 `per-root.mjs` 的 `export function rootOf(abs, declaredBase) {`、`anchors.mjs` 的 `export function isDocToken(token, exts = DEFAULT_DOC_EXTS) {`、`index.mjs` 的 `runDocCheck(root, { docs, mode = "report", docsSource, lines, texts, zones } = {})` |
| 2 | 🔴 | 未修 | 设计 §2.9.7「过设计器硬线 500」点名 `batch-gate.mjs`，实测 352（未越）；越 500 的 `anchors.mjs`（630）无分拆方案；`index.mjs`（1076，越 800）写「拆分放**另一批**执行」 |
| 3 | 🔴 | 未修 | 设计 §2.7「`hits` 三数（锚 ∥ 段 ∥ 行号坐标）」vs 需求 F11「`gate` 面不计入 `hits`、不出回执、不阻断」vs DOC-DISCIPLINE DD-150「`hits` 无 `lineRefs` 键（只有 `anchors` ∥ `paragraph` 两数，和 = `hits.total`）」；设计 §2.9.1「拦的闭集 = `档缺`…`段落长`」vs 需求 F3「闸只由这两类构成」 |
| 4 | 🔴 | 未修 | 设计 §9.1「新增五行」vs `test/rtm/guard.md` 已在盘的行 `7-17` ∥ `7-18` ∥ `7-19` ∥ `44-2` ∥ `45-2`；§9.2「本批新增 = `44-1` ∥ `45-1`」同行在盘；`test/RTM.md` 已有「CLI 44」∥「CLI 45」 |
| 5 | 🔴 | 未修 | 设计 §2.10.4「超过 `LCS_CELL_CAP` 时**退回改前的首末包络**」——既无观测原话也无复现路径（判据 6b） |
| 6 | 🟡 | 未修 | `PATH-RESOLUTION.md` §3 贴线判表「越 500 软线（硬限未越）」vs 同档实测 1076；「**本批不拆**」 |
| 7 | 🟡 | 未修 | 档头「本批的判据条目 = **F18–F21** ∥ **AC-16–AC-19**」vs §2.9 ∥ §2.10 ∥ §2.11 各自称「本批」；§9.2 自称「上一批，行已在盘」 |
| 8 | 🟡 | 未修 | 设计 §2.10.3「**第五个消费面 = 档图面**」点名 `graph-tokens.mjs`，该档不在 §4 受影响文件表内 |
| 9 | 🟡 | 未修 | 设计 §2.9.7「两档的最长函数本轮**尚未取到读数**」——函数档（第一判据）无结论 |
| 10 | 🟡 | 未修 | 设计 §2.10.7「请评审确认这不是新的口径」——无到期条件、无答「是新口径」时的处置 |
| 11 | 🔵 | 未修 | 设计 §3 契约行「`checkAnchors(root, { files, manifest? })`」缺 §2.10.1 自述的 `exts` |
| 12 | 🔵 | 未修 | 三档 report 读数「后缀兜底读数：how=\"suffix\" 9 处」——引用靠唯一后缀兜底才解得到 |
| 13 | 🔵 | 未修 | 无项目标准档、无文档地图 ⇒ 方法学合规与文档归属两项判据降级 |

**计数**：🔴 5 · 🟡 5 · 🔵 3。机检面：四档 `doc_check` 锚 ∥ 段 ∥ 行三类命中 0 条，行号坐标正文面 0 处。

VERDICT: changes-required

### 轮次 2（评审子代理）

| # | 严重度 | 状态 | 证据（指针） |
|---|---|---|---|
| 1 | 🔴 | 未解决 | `docs/core/design/PATH-RESOLUTION.md` §3「贴线判」的「本批两档过线」与同节「改（源码）」清单冲突：`thincoder-core/agent-tools/subagent-spawn.mjs` 实测 558（`doc_check` 报告态 `lines` 面：越 500 设计器硬线），既未进贴线判表、也无分拆计划 |
| 2 | 🔴 | 未解决 | `docs/core/design/DOC-CHECK.md` §4 表内零集成测试档；§9.1 要求改写的 RTM 行 `7-3`（「夹具把那条悬空指针放进**本批改动区**」）落在 `test/integration/batch-close-gate.test.mjs`（用例标题「CLI 7-3 错误 · 笔域集内一档含悬空指针 ⇒ 收口被拒（throw）、§1 状态行字节不变」），实测 542 ⇒ 越 500，无档位判定、无分拆计划 |
| 3 | 🔴 | 未解决 | 规范面携绝对读数：`docs/core/design/DOC-CHECK.md` §2.9.7「越 800 硬线（1076 行）」「（630 行）」「未越线的四块（读数已取）」与 `docs/core/design/PATH-RESOLUTION.md` §3 贴线判表同数并列；相抵于 `docs/core/design/DOC-DISCIPLINE.md` §3.30.1「只写同尺比较和越线结论，不写绝对值」及 §2.9.7 自句「本节不载绝对读数（D12）」 |
| 4 | 🔴 | 未解决 | `docs/core/design/DOC-CHECK.md` §2.9.7「新撑越 500 线的块另批处理」= 跨批延后通道；判据句要求「硬限不允许诞生」 |
| 5 | 🟡 | 未解决 | 识别面一族落点两说：§2.6「机制的落点只有一处：`thincoder-core/doc-check/anchors.mjs` 导出的一组常量与一个谓词」∥ §5 新名三问「existing: thincoder-core/doc-check/anchors.mjs」 vs §2.9.7 围栏把这一族搬到 `thincoder-core/doc-check/` 下新建的一档（新档名住 §2.9.7 围栏） |
| 6 | 🟡 | 未解决 | §9.2 计数行「改写 = 0 ∥ 冗余 = 0 ∥ 新增 = 0」与同节「新增两行、两个故事：… `44-1` ∥ `45-1`」冲突 |
| 7 | 🟡 | 未解决 | 同一命令两条活验收读数：`docs/core/requirements/DOC-CHECK.md` F12「从 **10 条降到 4 条**」vs `docs/core/design/DOC-DISCIPLINE.md` A-DD38 ③「汇总行**零命中** ∧ `exit 0`」 |
| 8 | 🟡 | 未解决 | §2.10.7 上抛项（F14 字面 vs 判域口径）待裁：三件齐备（D13 合规），属协调项，非设计缺陷 |
| 9 | 🟡 | 未解决 | 受影响文件表落设计档 §4（F-R24a「受影响文件表归批档 §2，设计档不设」）；面位裁定，非本轮新立 |
| 10 | 🟡 | 未解决 | 设计档无「变更记录」与三层需求层：与 F7-1 相抵、与 D8「变更记录段 / 不并项与历史沿革族 不得出现在设计档与需求档」一致（R7b：高层胜） |

VERDICT: changes-required

计数：🔴 4 · 🟡 6 · 🔵 0

### 轮次 3（评审子代理）

### 第二轮复核（上轮 10 项 + 新发现 1 项）

| # | 严重度 | 状态 | 证据（指针） |
|---|--------|------|--------------|
| 1 | — | 已修 | PATH-RESOLUTION.md §3 贴线判：「本文受影响源码里有三档过线」；`thincoder-core/agent-tools/subagent-spawn.mjs` 行「**越 500 设计器硬线**，分拆方案见本节末条」，§3 末条给两族落点 |
| 2 | — | 已修 | DOC-CHECK.md §4 表新增 `test/integration/batch-close-gate.test.mjs` 行「越 500 设计器硬线，分拆方案见 §2.9.7」；§2.9.7「**§4 表里的集成用例档同判**」段给夹具族落点 |
| 3 | — | 已修 | DOC-CHECK.md §2.9.7「越 800 硬线，本批分拆，不推下批」+「绝对行数与命令回执住批档（§3.30.1）」；PATH-RESOLUTION.md §3「**绝对行数与命令回执住批档**」，贴线判表已无读数 |
| 4 | — | 已修 | DOC-CHECK.md §2.9.7「搬出来的档若撑越 500 设计器硬线 ⇒ 本批收口前再拆一次：硬限不允许诞生，「另批处理」这条通道不存在。」 |
| 5 | — | 已修 | DOC-CHECK.md §2.6「**机制的落点只有一处**：识别面一族的定义住新档 `doc-tokens.mjs`」；§5 三问与 §4 行同步 |
| 6 | — | 已修 | DOC-CHECK.md §9.2「改写 = **0** ∥ 冗余 = **0** ∥ 新增 = **2**（`44-1` ∥ `45-1`…）」 |
| 7 | 🟡 | 未解决 | 需求档 F12 已改「汇总行**零命中** ∧ `exit 0`」，但 AC-10 ① 仍「改后 = **4 条命中**（改前 10）」、方式列「跑脚本读数 = 4」——同一条命令两条验收读数 |
| 8 | 🟡 | 已接受 | DOC-CHECK.md §2.10.7「**这一条是待裁，不是已裁**（D13 三件齐备）」三件齐备，属协调项 |
| 9 | 🔴 | 未解决（升级） | 同一面两处相反：DOC-DISCIPLINE.md §3.7 条目 H「设计 / 需求档**不设「受影响文件」表**……该表归**批档 §2**，状态档一格不留」 vs DOC-CHECK.md §4「**受影响文件面反过来只在本节这张表**」 |
| 10 | 🟡 | 已接受 | D8 侧证据在盘：A-DD44 判据 ③ 要求 `变更记录\|历史沿革\|不并项` 标题命中 = 0 ⇒ 设计档不设变更记录为正确，滞后的是 F7-1 那句 |
| 11 | 🟡 | 新 | DOC-CHECK.md §2.9.7「**未越线的四块**」与「§4 表里其余四个集成用例档未越线」未覆盖 §4 表里其余源码档（`line-refs.mjs` ∥ `manifest-schema.mjs` ∥ `doc-write-gate.mjs` ∥ `paragraph.mjs` ∥ `batch-paths.mjs` ∥ `agent-tools/doc-check.mjs`）——上轮实测均未越线，仅结论行覆盖面不全 |

VERDICT: changes-required

counts: 🔴 1 · 🟡 3 · 已修 6 · 已接受 2

### 轮次 4（评审子代理）

### 第三轮（评审子代理）复核

| # | 严重度 | 状态 | 证据指针 |
|---|---|---|---|
| 1 | — | Fixed | PATH-RESOLUTION §3「本文受影响源码里有三档过线」+ 表行「`subagent-spawn.mjs` … 越 500 设计器硬线，分拆方案见本节末条」+ §3 末「切两族」方案 |
| 2 | — | Fixed | DOC-CHECK §2.9.7「**集成用例档同判**：`test/integration/batch-close-gate.test.mjs` 越 500 设计器硬线 ⇒ 切「夹具与 git 语料」一族搬去新档」 |
| 3 | — | Fixed | DOC-CHECK §2.9.7「绝对行数与命令回执住批档（§3.30.1）」∥ PATH-RESOLUTION §3「绝对行数与命令回执住批档」（两档面内绝对读数已零） |
| 4 | — | Fixed | DOC-CHECK §2.9.7「硬限不允许诞生，「另批处理」这条通道不存在」 |
| 5 | — | Fixed | DOC-CHECK §2.6「机制的落点只有一处：识别面一族的定义住新档 `doc-tokens.mjs`」；§2.9.7 围栏同落点；§5 两行同口径 |
| 6 | — | Fixed | DOC-CHECK §9.2「改写 = **0** ∥ 冗余 = **0** ∥ 新增 = **2**（`44-1` ∥ `45-1`…）」 |
| 7 | — | Fixed | 需求档 AC-10「判据形 = 汇总行**零命中** ∧ `exit 0`」与 F12 ∥ DOC-DISCIPLINE A-DD38 ③ 三处同值 |
| 8 | 🟡 | Accepted | DOC-CHECK §2.10.7「这一条是待裁，不是已裁（D13 三件齐备）」——已登记上抛，到期条件在位 |
| 9 | 🔴 | Fixed | DOC-CHECK §2.9.7「状态档不设「受影响文件」表（…§3.7 条目 H），该表归批档」；全档已无 §4 节（标题序为 §3 → §5），面位矛盾消失 |
| 10 | 🟡 | Accepted | DOC-DISCIPLINE A-DD26 判据③「`^#{2,4}.*(变更记录\|历史沿革\|不并项)` 命中 = 0」——设计档无变更记录即正确行为，D8 胜 |
| 11 | 🟡 | Fixed | DOC-CHECK §2.9.7「**未越线的源码档（十份）**」逐档点名 ∥ 「**其余六份集成用例档未越线**」——前轮缺的档位结论已补 |

计数：Fixed = 9 ∥ Accepted = 2 ∥ Unfixed = 0 ∥ 残留 🔴 = 0

VERDICT: pass

### 轮次 5（评审子代理）

> 状态行重置：第 5 轮打回（changes-required）· 上一轮状态行 = 评审通过 → 进行中 · 2026-11-11

### 代码评审（第 1 轮 · 门那几族：删读数层 + 收口面不入判集）

| # | 严重度 | 状态 | 证据（指针） |
|---|---|---|---|
| 1 | 🔴 | 未修 | `BATCH-RECORD.md` §4.22「对齐与否不影响四件」条（`aligned` … **这句不许删**）+ 红判据行「漂移可见」；交付三族与 `thincoder-core/**` 中 `不同序` 零命中 |
| 2 | 🔴 | 未修 | `BATCH-RECORD.md` §4.1 第 4 行「收口面区未定才整档阻断」 vs `batch-gate-judge.mjs` `blocks` 收口支 `return region?.kind === "region" && …` 与 `DOC-DISCIPLINE.md` §3.20「判不出改动区的档干脆不入判集」（同一机制两处活描述） |
| 3 | 🟡 | 未修（归设计席） | `DOC-CHECK.md` §2.9.4「该档在那个基线提交里没有 … ⇒ 改动区判不出 ⇒ 不入判集」+ 本批 §13.2 的 `whole` 闭集 vs `batch-regions.mjs`「⇒ 判成 `region`」（用户书面裁定 A） |
| 4 | 🟡 必修 | 未修 | `batch-regions.mjs` `index.has(relPath)`（原始大小写）绕开本档声明的路径键单源 `pathKey`（`per-root.mjs`：`win32 ⇒ toLowerCase`） |
| 5 | 🟡 | 未修 | 本批 §20.1 / `DOC-CHECK.md` §2.9.7「切「夹具与 git 语料」一族搬去新档 … 只搬不改」；`test/integration/fixtures/` 下点名的那份夹具族档不在盘（目录只有 4 份与此无关的夹具）——本轮追加该文本时本门自己按此判了一次 `档缺` |
| 6 | 🟡 | 未修 | 本批 §13.7「新增 = 1：`7-21`」vs `test/rtm/guard.md` 故事 7 节注「二十一态」= `7-1`…`7-20` ∥ `7-22`（无 `7-21`），后段 §18 ∥ §20 测试面清单只写「改判」 |
| 7 | 🔵 | 未修 | `batch-regions.mjs` `why: "不在跟踪面（本轮新建未提交）"` 也落在「本批已提交的删除档」这一支 |
| 8 | 🔵 | 未修 | `batch-gate.mjs` `export { pointerCells } from "./batch-gate-hit.mjs"` 零消费者（`pointerCells` 唯一消费点 = `hitEntries`） |
| 9 | 🔵 | 未修 | `batch-record-write.mjs`「区外锚类只出整档存量读数」（本轮已撤该层，注释未同步） |
| 10 | 🔵 | 未修 | `batch-gate.mjs` 收口面两行同因（`收口面不入判集 N 档…` + `基 sha 未定——本批笔域集只认触达账`）vs 本批 §13.3「仍然只出一行」 |

计数：🔴 2 · 🟡 4 · 🔵 4。本轮未复跑 `node --test`（评审只有读工具），用例全绿与否未核。

VERDICT: changes-required

### 轮次 6（评审子代理）

窄域复核（修正轮①③；面 = report-blocks.mjs ∥ tools/doc-write-gate.mjs；两档全文新读 + AC-2 六串全仓 grep）。前两笔被门拦同因：引文照录了源档行内的相对形 import 路径字面，相对批档解析为不存在的档 = 档缺——本轮引文改为同行两段连续片段并明示隔开的是该路径字面，语义零改。

| # | 严重度 | 状态 | 证据（符号 ∥ 原文） |
|---|--------|------|----------------------|
| 1 | — | Fixed | ① AC-2 符号族零残留：两靶档全文零符号；grep 于 thincoder-core 面 `STOCK_LINE ∥ stockHits ∥ stockCount ∥ pureDeleteStockEntries ∥ survivingLineMap ∥ disclosed` 六串零命中（唯一命中在 thincoder-core/prompts/persona-eng-coder.md 英文句，见 #4）。`noRootOutcome` 返回形 `hits: { total: 0, anchors: 0, paragraph: 0, lineRefs: 0 }` 同键零改（无 stockHits 键）；`gateReport` 无存量读数行；`runDocWriteGate` 拒写判定读 `res.hits.anchors + res.hits.paragraph` 不读 `hits.total`。两档 import 逐一有消费（`\brel\b` 于 report-blocks.mjs 零命中），无死再出口、无语法残破（JSDoc 闭合完整）。 |
| 2 | 🟡→已修 | Fixed | 轮-1 头注死引：tools/doc-write-gate.mjs 头注现文为同行两段连续引文「锚 ∥ 段两条判据与报面字面全部来自」∥「（`runDocCheck` / `DOC_CLASS` / `PARA_DISPOSE`）」，两段之间隔开的恰是源档行内的相对形 import 路径字面（引文不在批档复录它，见本笔开头说明）——原「存量读数句」字样已撤，括注三名与 import 行（`runDocCheck` / `DOC_CLASS` / `PARA_DISPOSE`）逐字对齐。 |
| 3 | 🟡→已修 | Fixed | 轮-1 围栏式理由死引：`judgeZones` JSDoc 现文「落到区外（不入判集）而不阻断。方向从严，故留着」——原「存量读数」机制名已撤，与引擎现语义（区外就地丢弃）一致。两靶档全文再无「存量」字样。 |
| 4 | 🔵 | 观察项（非阻断） | AC-2 判据字面精度：六串零命中按「含 .md 全后缀」跑永不可绿——thincoder-core/prompts/persona-eng-coder.md 英文句 "a reduced version disclosed afterwards" 先于本批存在、与符号族无关（本轮 grep 自证该行在盘）。建议：批档收口时把 AC-2 记法限定为代码面（*.mjs）或登记此假阳，勿为凑绿改无关提示句。 |
| 5 | — | 待门开（by-design 排序，非缺漏） | ③「与 AC-8 的偏离（A 案）」批档内字面检索零命中——§5 机械门在 §3 状态行非「评审通过」时拒绝写入，故本条待本 verdict 开门后照写。内容三分（B 案理由 = 新建档逃出收口判集 = 把门拆了；代价 = 搬入档既有死引文今天会被多拦一次；到期 = 下批落 git diff -M 重命名识别后重判）与设计 §13.2 ∥ §13.8 已裁文一致，照写即可。 |
| 6 | — | 面外（不判不记行） | thincoder-core/doc-check/index.mjs 的 `CYCLE_READ_LINE` 再出口注释（「批档门取它拼拒串」——消费面已在门族轮撤除）不在本轮窄域面内；轮-1 候选，留给父侧核对，不影响本 verdict。 |

VERDICT: pass

计数：🔴 0 · 🟡 0（两条轮-1 🟡 已修）· 🔵 1（判据精度观察）· 面外 1 · ③ 待门开照写。修正轮① 验收成立；verdict 开门后 §5 立即落「与 AC-8 的偏离（A 案）」段。

### 轮次 7（评审子代理）

复审（第 2 轮 · 独立评审席）——按本轮声明面（doc-check 五档：`index.mjs` ∥ `anchors.mjs` ∥ `doc-tokens.mjs` ∥ `doc-names.mjs` ∥ `report-blocks.mjs`）全量重读后逐项核验前轮产出。

| # | 严重度 | 状态 | 证据 |
|---|--------|------|------|
| 1 | — | Fixed | AC-2 符号族（STOCK_LINE ∥ stockHits）：对 thincoder-core 全域 grep 零命中——doc-check 两档已扫净（残留只在 docs/batches 过程档，非设计依据） |
| 2 | — | Fixed | 「缺机读清单」∥「无该块」两串：thincoder-core 内唯一命中是 agent/setup.mjs 注释里的巧合子串「子代理可有可无该块」（spawn 块语境，与门判据无关）；doc-check ∥ batch-gate 各档零命中——「缺块 ⇒ 拒」判据已死 |
| 3 | 🟡 | Unfixed | anchors.mjs `sectionOnDisk` 头注与 `checkAnchors` 调用点相悖：头注言明「读不到 ⇒ 记 unreadable（不当『无该节』…）」，但映射仍为空 ⇒ 调用点 `sectionPresent` 判 false ⇒ 仍出 `节缺` 命中行。闸面 verdict 安全（unreadable ⇒ ERROR，不产假绿），报告面那行把「没读成」说成「目标无 §N」——成因错标。一行可修（注改或行为改，父席定夺） |
| 4 | 🔵 | New | index.mjs 读数面两套排序不同源：`domainTables` 按 lowercase 升序 ∥ `projectRoots` 按默认（大小写敏感）升序——混合大小写多根场景两序可错位 ⇒ `domainTableBlock` 的 `read[i]` 对错根（读数行错标，verdict 与 gate 面不受影响） |

计数：🔴 0 · 🟡 1（不阻断，非 must-fix）· 🔵 1。
范围注：batch-gate-judge.mjs ∥ batch-regions.mjs ∥ test/rtm/guard.md 不在本轮声明面内——前轮对它们的未决项本轮未重判，不视为已核。

VERDICT: pass

### 轮次 8（评审子代理）

> 状态行重置：第 8 轮打回（changes-required）· 上一轮状态行 = 评审通过 → 进行中 · 2026-11-12

| # | 严重度 | 状态 | 证据（指针） |
|---|---|---|---|
| 1 | 🔴 | 待处置 | 需求 `requirements/DOC-CHECK.md` F3「闸只由这两类构成…段长 ∥ 行号坐标 ∥ 节号 ∥ 跨仓未声明 ∥ 裸档名既不拦也不出」＋§3 边界「闸 = `档缺` + `引缺`」 vs `design/DOC-CHECK.md` §2.9.1 推论 4「拦的闭集 = …∥ `节缺`…∥ 段落长 ∥ 行太长」＋§2.7「`hits` 两数（`anchors` ∥ `paragraph`）」 vs `design/DOC-DISCIPLINE.md`「报面（固定句形 · 交付门 gate）」`DOC-CHECK GATE: REFUSED（按类分列：锚 A 条 · P 段文字太长，难于阅读 · L 行太长）` |
| 2 | 🟡 | 待处置 | `design/DOC-CHECK.md` §2.10.1「引擎入口加两个**可选**入参…`texts` ∥ `zones`」 vs §3 接口契约「`runDocCheck(root, { docs, mode, docsSource, lines })`｜**签名不变**」 |
| 3 | 🟡 | 待处置 | `design/PATH-RESOLUTION.md` §3「贴线判…本文受影响源码里有三档过线」表判 4 档；同节「改（源码）」列 14 档；`thincoder-core/agent-tools/subagent-scheduler.mjs` 实测 485 行未判 |
| 4 | 🟡 | 待处置 | `design/PATH-RESOLUTION.md` §3 标题「受影响文件清单」；METHODOLOGY F-R24a「受影响文件清单不在本模板——它归批档 §2」 |
| 5 | 🟡 | 待处置 | `design/DOC-CHECK.md` §2.9.8 / §2.11.3 / §2.7 决策表列「弃案」「否掉了什么，为什么」；`design/PATH-RESOLUTION.md` KD-9「被否三案」∥ KD-15「三条被否」；METHODOLOGY F7-2「被否决的备选不进设计档」 |
| 6 | 🟡 | 待处置 | `design/DOC-CHECK.md` §2.9.7「函数档判据（≥300 行触及即判）的读数归父侧收口门那一次跑…本批不另动结构」——函数档位无结论行 |
| 7 | 🟡 | 待处置 | `design/DOC-CHECK.md` §9.1「已在盘四行不重复新增：…`44-2`」 vs §9.2「故事索引表加 `CLI 44` ∥ `CLI 45`」＋新行 `44-1` |
| 8 | 🟡 | 待处置 | `design/DOC-CHECK.md` §9.1「改写三行」表列 = `行 ∥ 为什么变 ∥ 改成什么`——缺 交互 ∥ 业务可观察结果 ∥ 入口 ∥ 回指 |
| 9 | 🟡 | 待处置 | `design/DOC-CHECK.md` §2.11.1／§2.11.2 与 `design/PATH-RESOLUTION.md` §2.2「相对形前置腿」／KD-16／KD-17 同一机制两处描述；AC-E11／AC-E12 与 AC-21 重复 |
| 10 | 🟡 | 待处置 | `design/DOC-CHECK.md` 档头「需求层 = `docs/core/requirements/DOC-CHECK.md`（F1–F23 / AC-1–AC-19）」；`grep` 该档 `CANON_OPERANDS` ／ `FILENAME_CLASSES` ／ `PLACEHOLDER_STEMS` ／ `prompt-refs-check` 零命中 ⇒ F12／AC-10 无设计节与验收项 |
| 11 | 🟡 | 待处置 | `design/DOC-CHECK.md` §2.6「扩展名清单：缺省 + 本仓 N 项」· §2.5「域表读数：2 根…」· §2.7「登记未命中 N 条…」——三个新报面文案无三问行 |
| 12 | 🟡 | 待处置 | `requirements/DOC-CHECK.md` F3「实测 `docs/**` 4464 条锚命中里 3156 条仓内唯一可定位」· AC-4「现状实测：全仓 0 命中（2026-10-18 16:27）」· AC-5「158 → 0」——规范面绝对读数（DOC-DISCIPLINE D12） |
| 13 | 🔵 | 待处置 | 盘面读数：`thincoder-core/doc-check/index.mjs` 399 行，§2.9.7 说「由本批实施轮创建」的五档已在盘（`doc-decl.mjs` 94 · `exemptions.mjs` 97 · `range-input.mjs` 111 · `line-reads.mjs` 117 · `report-blocks.mjs` 308）· `doc-tokens.mjs` 108 且 `anchors.mjs` 504（仍越 500） |
| 14 | 🔵 | 待处置 | `doc_check` 报告态对四档跑出「登记未命中 1 条（原文已变或已不在判集，复核后删）」——manifest 存一条失配登记 |
| 15 | 🔵 | 待处置 | §9 各行的 RTM 行号/故事号（`7-3` ∥ `7-16` ∥ `37-3` ∥ `7-20` ∥ `44-1` ∥ `45-1` ∥ `26-3` ∥ `45-2`）— `test/RTM.md` 不在本轮评审范围，未核 |

计数：🔴 1 · 🟡 11 · 🔵 3（共 15 条）。

VERDICT: changes-required

### 轮次 9（评审子代理）

| # | 严重度 | 状态 | 证据（指针） |
|---|---|---|---|
| 1 | 🔴 | 待处置 | `docs/core/design/DOC-CHECK.md` §2.9.9 用例表 D-1「登记 `kind` = 行号坐标 … `豁免 1 条`，命中减一」 ⟂ §2.9.5 ④「这一类没有登记面」／AC-X4「`行号坐标` 不可登记」／§9.1「`45-2` 整行撤」 |
| 2 | 🔴 | 待处置 | 同档 §6 AC-5／AC-8／AC-11「`hits` 三桶（锚 ∥ 段长 ∥ 行号坐标）」＋ §3 契约「`hits` 三数口径 … 形状不变」 ⟂ §2.7「`hits` 两数（`anchors` ∥ `paragraph`）」／§2.9.5 ④「门内不进 `hits`」；`docs/core/design/DOC-DISCIPLINE.md` DD-150「`hits` 无 `lineRefs` 键（只有 `anchors` ∥ `paragraph` 两数，和 = `hits.total`）」 |
| 3 | 🔴 | 待处置 | `docs/core/design/DOC-DISCIPLINE.md` §3.30.3「受影响文件与分层结论」＋「清单只界定受影响文件」 ⟂ 同档 §3.7 条目 H「设计 / 需求档**不设「受影响文件」表**」；且 §3.30.3 对纯 `.md` 给「分层结论 = 无档跨分层」 |
| 4 | 🔴 | 待处置 | `docs/core/design/DOC-CHECK.md` §2.3「重名（两个项目各有一个 `web`）」——无观测读数、无复现路径；唯一支撑是夹具 7-10 |
| 5 | 🟡 | 待处置 | 同档 §2.6「本档围栏块共 14 块，逐块判过（清单如下）」 vs 该档围栏开启行 24 处；清单第 11 行把「用例表」记在 §2.6，盘上该围栏块在 §2.7 |
| 6 | 🟡 | 待处置 | 同档 §9.1 改写表列头「结构 = 行 ∥ 为什么变 ∥ 改成什么」、破三行段无「交互 ∥ 业务可观察结果 ∥ 业务入口 ∥ 服务需求」，与 §9.1 新增行四件、§9.3 表四列不同形 |
| 7 | 🟡 | 待处置 | 同档小节序：「### 2.11 判域的两条收边」排在「### 2.6 档名与扩展名识别面」之前 |
| 8 | 🟡 | 待处置 | `docs/core/requirements/DOC-CHECK.md` F11「原先「`gate` 面判整档」的口径作废」；`docs/core/design/DOC-CHECK.md` §2.6「先前那一版把路径形从清单里放出来」、档头「第三笔只换写法、不动任何判据」 |
| 9 | 🟡 | 待处置 | `docs/core/design/DOC-CHECK.md` §8「`gate` 面增的是 `未核 N 条` 列报」 ⟂ `docs/core/requirements/DOC-CHECK.md` 档头「行号坐标 ∥ 跨仓未声明 ∥ 裸档名既不拦也不出」与「不拦截的就不要报数」 |
| 10 | 🟡 | 待处置 | 同档 §2.10.7「这一条是待裁，不是已裁」——需求档 F14「判集 = 本笔触碰的段落」与 §2.10.4 区间口径在裁定落地前两说并存（到期 = 本批收口前） |
| 11 | 🔵 | 记录 | 需求档无「非功能性需求」层、设计档无「非功能硬指标含度量」（`docs/core/standards/METHODOLOGY.md` F2-2 ∥ F7-1） |

VERDICT: changes-required
计数：🔴 4 ∥ 🟡 6 ∥ 🔵 1

### 轮次 10（评审子代理）

| # | 严重度 | 状态 | 依据（指针） |
|---|---|---|---|
| 1 | 🔴 | New | `thincoder-core/prompts/discipline-engineering.md`「**⚠️ The problem statement does NOT go here**」 vs `docs/core/standards/METHODOLOGY.md` F2-4「设计档含问题陈述 / 方案理由 / 验收标准逐条回指」 |
| 2 | 🔴 | New | `thincoder-core/prompts/persona-eng-designer.md` 设计档 9 项之 4「**Key decision record** (rejected alternatives included)」 vs `docs/core/standards/METHODOLOGY.md` F7-2「**被否决的备选不进设计档**」「（**不含被否候选列**）」 |
| 3 | 🔴 | New | `thincoder-core/prompts/persona-eng-designer.md` 设计档 9 项之 3「**Affected-file list** — source/test files + one tier-conclusion line」 vs `docs/core/standards/METHODOLOGY.md` F7-1「**受影响文件清单不在本模板——它归批档 §2（F-R24a）**」∥ F-R24a「**受影响文件表归批档 §2，设计档不设**」 |
| 4 | 🔴 | New | `thincoder-core/prompts/discipline-engineering.md`「**What testing produces**: no test-design document, and no per-user-story case.」 vs `docs/core/standards/METHODOLOGY.md` F2-5「验证 + 测试文档——每条用户故事至少一个测试用例」「用例表三态齐全且每条功能性需求 ≥1 条映射」 |
| 5 | 🟡 | New | `docs/core/requirements/ENGINEERING-MODE-V2.md` §13.24「（`PROJECT-MANIFEST.json` `checkConfig.lineWidth`）」 vs 同档 §13.20「**`checkConfig` 整键删除**」 |
| 6 | 🟡 | New | `docs/core/requirements/ENGINEERING-MODE-V2.md` §13.24「本仓现最长行 300，已过线」 vs 同档 §13.1 D12「规范面（需求 ∥ 设计 ∥ 提示词）零绝对读数」 |
| 7 | 🟡 | New | `docs/core/requirements/ENGINEERING-MODE-V2.md` §13.11 ∥ §13.12 ∥ §13.13 验收行内「提示词⑤」「提示词⑥」窜入句 |
| 8 | 🟡 | New | `docs/core/standards/METHODOLOGY.md` F2-2「需求文档按总目标 / 功能用户故事 / 非功能标准三层组织」 vs `docs/core/requirements/ENGINEERING-MODE-V2.md` §6.1「七层」∥ `thincoder-core/prompts/discipline-engineering.md`「organized by **five elements**」 |
| 9 | 🔵 | New | `docs/core/requirements/ENGINEERING-MODE-V2.md` 章号缺 §2 ∥ §9.2 ∥ §12（「### 9.1 阶段」直接跳「### 9.3 轮次」） |
| 10 | 🔵 | New | `thincoder-core/prompts/discipline-engineering.md`「面判定机器单源 = thincoder-core/agent/write-face.mjs；本表与本行同义，冲突时以该档判据为准。」（英文提示词面整句中文） |
| P1–P11 | — | Accepted | 上一轮表 #1–#11 的对象 = `docs/core/design/DOC-CHECK.md` ∥ `docs/core/design/DOC-DISCIPLINE.md` ∥ `docs/core/requirements/DOC-CHECK.md`，不在本轮评审面（本轮声明面 = ENGINEERING-MODE-V2.md ∥ METHODOLOGY.md ∥ 六份提示词档 ∥ prompt-overlays.mjs）⇒ 按边界不重判，不记为已修 |

VERDICT: changes-required

计数：🔴 4 · 🟡 4 · 🔵 2 · 上一轮项按边界收口 11（不重判）。

### 轮次 11（评审子代理）

| # | 严重度 | 状态 | 证据 |
|---|---|---|---|
| 1 | 🔴 | 待处置 | 需求 F2「**每档全文检查**（不是只查改动行；不是全仓）」+ AC-1「改过的档**全文**检查——改动行之外的同档存量问题也报」 vs 设计 §2.9.4「**收口门**：阻断集 = **本批改动区**」/ 用例 C-1「改后：三面都放行、回执零附加行——那批既有命中不在本次改动区内，因此不进判集」；§1 又把 F1 第三触发点映射成「父侧收口（`batch` 工具两机械点）」，§8 仍写「**需求档本批不再改（判域面）**」 |
| 2 | 🟡 | 待处置 | §2.10.1「引擎入口加两个**可选**入参（`thincoder-core/doc-check/index.mjs` 的 `runDocCheck`）：`texts` ∥ `zones`。」vs 接口契约节「`runDocCheck(root, { docs, mode, docsSource, lines })`」+「**签名不变**」 |
| 3 | 🟡 | 待处置 | §2.9.4「零宽定位点仍扩出完整相邻单元，演成该档的区间表照交」vs §2.10.1「该档照交它那张区间表（可能就是空表）」/ AC-G10「该档交零宽区间表；邻段因此不进判集」/ AC-P2「纯删的区 = 零宽定位点扩出的相邻单元」而其正文「邻段不入判集」 |
| 4 | 🟡 | 待处置 | §2.6 常量清单（`NAME_CH` · `EXT_PART` · `TOKEN_LEFT_GUARD` · `TOKEN_RIGHT_GUARD` · `DEFAULT_DOC_EXTS`，无 `BARE_NAME_EXTS`）vs §2.9.7「五个常量（含 `DEFAULT_DOC_EXTS` ∥ `BARE_NAME_EXTS`）」vs §2.10.3「`BARE_NAME_EXTS` 的取值 = `md` ∥ `markdown`（一处定义…）」 |
| 5 | 🟡 | 待处置 | §2.6「锚 ∥ 花括号 ∥ 依据行 ∥ 行号面四处，各加一次同形判断」/ §5「四条抽取式 ∥ 四处豁免调用点」vs §2.10.3「锚 ∥ 花括号组 ∥ 依据行 ∥ 行号面 ∥ 档图面五条消费面因此自动同判」 |
| 6 | 🟡 | 待处置 | AC-2「本仓固定三档的 `report` 面与基线（改码前同一命令的报面整段，存批档实施记录）**逐字相等**（差 0）」vs §2.6「「新式在现盘 `docs/**` 上新增多少候选、其中多少解不到」只能实跑得出」 |
| 7 | 🟡 | 待处置 | 缺先例三问的三个新报面字面：§2.6「`扩展名清单：缺省 + 本仓 N 项`」· §2.7「`登记未命中 N 条（原文已变或已不在判集，复核后删）`」· §2.5「域表读数：2 根（读 manifest 2 · 无 manifest 0）」（§5 只给了桶标签 `豁免 N 条…` 与 `ERROR（无法定根 N 档）`） |
| 8 | 🟡 | 待处置 | §2.10.4「各带 ±2 行上下文」的出处只到理由句「一笔插入若落在两段之间，邻接段的**段落长度**可能因这一笔变」；AC-G9「把旧锚移进某处改动的 ±2 行内 ⇒ 拒写、零字节」为构造场景，无观测读数或复现命令 |
| 9 | 🔵 | 待处置 | §9.2「用例档落 `test/integration/` 目录下（`test/**` 不属本席笔域，文件名与落地归实施轮）」——行号已定（`44-1` ∥ `45-1`）但未写用例标题逐字带 RTM 号 |
| 10 | 🔵 | 待处置 | 需求档功能点表 F7 之后直接 F9（无 F8，无退役注记）；F22 ∥ F23 排在 F18 ∥ F19 之前 |
| 11 | 🔵 | 待处置 | 设计档章节号 §3 之后直接 §5（无 §4） |
| 12 | 🔵 | 待处置 | §2.6 围栏块逐块清单第 15 行「§2.9.3 ｜ 环引读数行现场形」——该块内容为两行 `onEdge` 回传 token（读数行在 §2.9.4，已由第 16 行承接） |
| 13 | 🔵 | 待处置 | §2.9.7「五族分拆已落地」/「未越线的源码档（十份）」等档位结论未能抽核：源 / 测试文件不在本次评审声明范围，本轮只核到「越档者带拆分计划 + 一个读数来源」 |

VERDICT: changes-required

计数：🔴 1 ∥ 🟡 7 ∥ 🔵 5

### 轮次 12（评审子代理）

| # | 严重度 | 状态 | 证据（指针） |
|---|---|---|---|
| 1 | 🔴 | 待处置（新，由 #6 的修正引入） | 设计 §6 AC-2「**② 变化面如实** … ⇒ 这三档**不列零回归基线**」＋「**① 零变化面** = 一组夹具档」 vs 需求 AC-15「② **单项目场景零回归**——同一批本仓档…⇒ **差 0**」，其构造列「单项目基线用本仓固定三档存档比对」；设计该行仍标「回指 AC-15 ②」 |
| 2 | — | 已修（原 1，🔴） | 需求 F2「收口面（`batch` 工具两机械点）= **本批改动区入判**」∥ AC-7「**判域按本批改动区**」∥ AC-1「**交付面**…改过的档**整档**入判」；设计 §2.9.4「**收口门**：阻断集 = **本批改动区**」——两面同口径、单源指向 §2.9.4 |
| 3 | — | 已修（原 2） | 设计 §3 引擎入口 = `runDocCheck(root, { docs, mode, docsSource, lines, texts?, zones? })` ＋「**既有入参语义不变，另加两个可选入参**」 |
| 4 | — | 已修（原 3） | 设计 §2.10.4「**零宽定位点扩到哪个单元（本节单源）**」＋两例（点在空行 ∥ 点在段内）＋「零宽语义只有这一个出处」；§2.9.4 ∥ §2.10.1 ∥ AC-G10 ∥ C-5 只引用 |
| 5 | 🟡 | 待处置（新，由 #4 的修正引入） | 设计 AC-P2「删空行并两段的扩区由 AC-G10 的正向形承担」 vs AC-G10「**AC-G10（纯删行）**：删掉中间一整段…无可扩单元 ⇒ 该档交空表」——§2.10.4「点在空行」那一支无验收行 |
| 6 | — | 已修（原 4） | 设计 §2.6「**常量（六项，本族唯一清单）**…`BARE_NAME_EXTS`」；§2.9.7「**常量清单只有一个出处：§2.6，本行不列第二份**」 |
| 7 | — | 已修（原 5） | 设计 §2.6「档图面**五处**…个数单源 = 本行，四 ∥ 五两个说法不许并存」；§5「五个消费面（…∥ 档图面，§2.6 ∥ §2.10.3）」 |
| 8 | — | 已修（原 6） | 设计 AC-2 拆①零变化面 ∥ ②变化面如实；§2.9.7「**这份基线只判「搬家前后是否逐字相等」**…与 §6 AC-2 的零回归不是同一条」 |
| 9 | 🟡 | 未修（原 7，部分） | 扩展名清单行 ∥ 登记未命中行已各带「**这一行的先例三问**」；§2.5「域表读数：2 根（读 manifest 2 · 无 manifest 0）」仍无自己的三问，只由 §5 的 `domainTables` 键行带 |
| 10 | — | 已修（原 8） | 设计 §2.10.4「**本条据 `docs/core/requirements/DOC-CHECK.md` AC-12 ⑥⑦ 而立**」；AC-G9「（±2 行的出处 = §2.10.4 据 AC-12 ⑥⑦ 立的那一段）」 |
| 11 | 🔵 | 未修（原 9） | 设计 §9.2「（`test/**` 不属本席笔域，文件名与落地归实施轮）」——用例标题带 RTM 号的约定仍未写 |
| 12 | 🔵 | 未修（原 10） | 需求功能点表 F7 之后直接 F9（无 F8 及退役注记）；「**F22**｜**相对形按引用方目录解析**」排在 F18 ∥ F19 之前 |
| 13 | 🔵 | 未修（原 11） | 设计档章节号 §3 之后直接「## 5. 关键决策记录」（无 §4） |
| 14 | 🔵 | 未修（原 12） | 设计 §2.6 围栏块逐块表「| 15 | §2.9.3 | 环引读数行现场形 | 逐字证据（回执）⇒ 留 |」，而该块内容是两行 `onEdge` 回传 token |
| 15 | 🔵 | 未核（原 13） | 设计 §2.9.7「五族分拆已落地」「未越线的源码档（十份）」等档位结论：源/测试文件不在本次评审范围，只核到「越档者带拆分计划 + 一个读数来源」 |
| 16 | 🟡 | 待处置（新） | 设计 §8「**需求档本批不再改（判域面）**：`docs/core/requirements/DOC-CHECK.md` 已含 F17 ∥ AC-15。」——需求档本批在判域面已改（F2 ∥ AC-1 ∥ AC-7），且该指针落不到收口判域 |
| 17 | 🟡 | 待处置（新，修 #2 的残句） | 需求 F2 单元内「**每档全文检查**（不是只查改动行；不是全仓）」与其后「收口面…= **本批改动区入判**，区外存量命中不入拒因」相反；F2 标题仍为「**范围 = 调用方给的那几档，全文**」 |

VERDICT: changes-required
计数：🔴 1 ∥ 🟡 4 ∥ 🔵 5；上一轮 7 条已修（原 1–8、10），1 条部分未修（原 7），5 条 🔵 未修（原 9–13）

### 轮次 13（评审子代理）

| # | 严重度 | 状态 | 证据（指针） |
|---|--------|------|------|
| 1 | 🔴 | 已修 | 需求 `F2` 节「判域按面定，两个面不同，别混」＋ `AC-1`「交付面…整档入判」＋ `AC-7`②「判域按本批改动区」；设计 `§2.9.4 收口门`「阻断集 = **本批改动区**」 |
| 2 | 🟡 | 已修 | 设计 `§3 接口契约 · 引擎入口`：`runDocCheck(root, { docs, mode, docsSource, lines, texts?, zones? })` ＋「既有入参语义不变，另加两个可选入参」 |
| 3 | 🟡 | 已修 | 设计 `§2.10.4`「零宽定位点扩到哪个单元（本节单源）」两例齐（点在空行 ∥ 点在段内）；`§2.9.4` ∥ `§2.10.1` ∥ `AC-G10` ∥ `AC-P2` ∥ `AC-P3` 只引用 |
| 4 | 🟡 | 已修 | 设计 `§2.6`「常量（六项，本族唯一清单）」；`§2.9.7`「常量清单只有一个出处：§2.6，本行不列第二份」 |
| 5 | 🟡 | 已修 | 设计 `§2.6`「档图面**五处**…个数单源 = 本行，四 ∥ 五两个说法不许并存」；`§5`「五个消费面」；`§2.10.3`「五条消费面因此自动同判」 |
| 6 | 🟡 | 已修 | 设计 `§6 AC-2` 分「① 零变化面」∥「② 变化面如实」；`§7 7-2`「= AC-2 ① 的零变化面夹具」 |
| 7 | 🟡 | 已修 | 三处新报面字面各有「这一行的先例三问」：`§2.5` `domainTableBlock` ∥ `§2.6` `extListLine` ∥ `§2.7` `EXEMPT_STALE` |
| 8 | 🟡 | 已修 | 设计 `§2.10.4`「本条据 `docs/core/requirements/DOC-CHECK.md` AC-12 ⑥⑦ 而立」；`AC-G9`「±2 行的出处 = §2.10.4 据 AC-12 ⑥⑦ 立的那一段」 |
| 9 | 🔴 | 已修 | 需求 `AC-15`② 已改「分两半量…变化面 = 本仓 `docs/core/design/` 三档…不要求差 0（单源 = 设计档 §6 AC-2）」，构造列改成「零变化面夹具档」⇒ 与设计 `AC-2` 同口径 |
| 10 | 🟡 | 已修 | 设计 `AC-P2` 括注改指 `AC-P3`；`AC-P3`（删空行并段 ⇒ 单元 = 合并后的整段）已在盘，`AC-G10` 守空表那一支 |
| 11 | 🟡 | 已修 | 设计 `§8`「不动需求档：…`F2` ∥ `AC-1` ∥ `AC-7②` 已在判域面与本档对齐…单源 = 本档 §2.9.4」 |
| 12 | 🟡 | 已修 | 需求 `F2` 标题改为「范围 = 调用方给的那几档，判域按面定」，「（不是只查改动行）」只修饰交付面 |
| 13 | 🔵 | 未修 | 设计 `§9.2`「用例档落 `test/integration/` 目录下（`test/**` 不属本席笔域，文件名与落地归实施轮）。」仍无用例标题带 RTM 号的约定 |
| 14 | 🔵 | 未修 | 需求 `§2 功能点`「| **F9** | **结构兜底 = batch 工具两机械点** |」直跟 F7（无 F8）；`F22` ∥ `F23` 排在 `F18` ∥ `F19` 之前 |
| 15 | 🔵 | 未修 | 设计档「## 5. 关键决策记录」直跟 §3，无 §4 |
| 16 | 🔵 | 未修 | 设计 `§2.6 围栏块逐块判过`「| 15 | §2.9.3 | 环引读数行现场形 | 逐字证据（回执）⇒ 留 |」，而 §2.9.3 那块是 `onEdge` 回传 token |
| 17 | 🔵 | 未修（本轮未核） | 设计 `§2.9.7`「读数取法 = `doc_check` 的 `lines` 面（D15：长度类读数只认这一把尺）」；档位结论的绝对读数需源码/测试文件，不在评审声明范围 |

计数：🔴 1 → 0（已收口）∥ 🟡 9 → 0 ∥ 🔵 5（未修，不阻断）。新增：0。

VERDICT: pass

### 轮次 14（评审子代理）

> 状态行重置：第 14 轮打回（changes-required）· 上一轮状态行 = 评审通过 → 进行中 · 2026-11-12

| # | 严重度 | 状态 | 证据（指针） |
|---|--------|------|--------------|
| 1 | 🔴 | 未解 | 段落长（段判据）无删除落点：设计 §2.1「长度与行数一概不量：三类判据之外没有读数面」∥ 需求档 F11「锚 ∥ 引文 ∥ 行号坐标 ∥ 段长四类同免」（段长仍被当活类）∥ 设计自称判据口径单源 DOC-DISCIPLINE §3.20 标题「机检内建为产品工具（起步两条判据 + 声明面 + 交付门 gate）」＋ §3.18「阈值 300 字符」；设计 §3 接口契约与 §8 边界全篇未点名 `thincoder-core/doc-check/paragraph.mjs` ∥ `paragraphMax` ∥ `lineMax` |
| 2 | 🔴 | 未解 | 行号坐标判据自相矛盾：设计 §8「行号坐标判据与引文判法均未动」vs 同档 §2.1「不判：行号坐标」＋ §9.1 破三行 26-3／26-6「首行 `PASS`、零该类命中行」 |
| 3 | 🔴 | 未解 | 扩区：需求 F14「判集 = 本笔 diff 的字面行，不扩区」并自指「判据句单源 = DOC-DISCIPLINE §3.26」，而 §3.26 扩区表第 1／3 行「扩到该段落整段」「扩到该围栏块的开启标记行到闭合标记行」＋判面取法第 3 步「各 hunk 两侧各取 2 行上下文」；设计 §2.5「也不加 ±2 上下文」与 §8 未提该表作废 |
| 4 | 🔴 | 未解 | 死指针族：设计 §3／§7／§9 引 `AC-X1` ∥ `AC-X4` ∥ `AC-R1–AC-R3` ∥ `AC-PL1` ∥ `AC-PL2` ∥ `AC-P8` ∥ `AC-P4` ∥ `C-5`，§6 只定义 AC-1–AC-12；`test/rtm/guard.md` 的 7-17 ∥ 7-18 ∥ 7-19 ∥ 7-20 ∥ 36-5 ∥ 44-1 ∥ 45-1 ∥ 45-2 引本档 §2.6 ∥ §2.7 ∥ §2.9.1–§2.9.5（压缩后 §2 只剩 2.1–2.5）与 AC-R1–AC-R4 ∥ AC-X1–AC-X5，而 §9.2 记识别面／豁免面「改写 = 0」 |
| 5 | 🟡 | 未解 | 设计头行「需求层 = F1–F23 / AC-1–AC-19」而需求档有 F24 ∥ AC-20，本档 AC-12 自己回指「F24 ∥ AC-20」 |
| 6 | 🟡 | 未解 | §2.1「不判：行号坐标 · 跨仓未声明 · 裸档名」与同节首条「裸名只认文档名后缀」＋ §2.2 腿序第 4 条「零份 ∥ 多份都不算解到」互斥—裸名腿留不留读不出 |
| 7 | 🟡 | 未解 | §2.5 只给收口门「区未定 ⇒ 该档不入判集」，批档 `edit` ∥ `append` 腿的触达账「改动区判不出」态未定义（DOC-DISCIPLINE DD-218 有现成答「触达账改动区未定——只明示、不阻本次写」，本档未挂指针） |
| 8 | 🟡 | 未解 | §9.2「故事索引表加 `CLI 44` ∥ `CLI 45`」「本批新号…`CLI 44` 起」与同档 §9.4「盘上故事索引到 `CLI 49` 为止」互斥；`test/RTM.md` 故事索引已有 CLI 44／CLI 45，`test/rtm/guard.md` 已有 44-1／45-1／7-20，§9.1 拟新增的 7-20 会撞号 |
| 9 | 🔵 | 未解 | 设计编节缺 §4（§3 接口契约 直接接 §5 关键决策记录） |

VERDICT: changes-required

计数：🔴 4 ∥ 🟡 4 ∥ 🔵 1（共 9）。判据三类与三道门判域的字面行本身写得可实施（§2.5 三腿齐、`texts`／`zones` 一个入口、纯删宽度零），阻断点是：段落长与行号坐标两处的判据面口径在档间互斥、扩区表的单源仍要段落扩区、以及压缩删节后留下的一族死指针（内部 AC-P 族与盘上 8 行 RTM 引的 §2.6／§2.7／§2.9.x）。

### 轮次 15（评审子代理）

## 轮次 2（评审子代理）· DOC-CHECK 设计 ∥ 需求 复核

| # | 原# | 严重度 | 状态 | 证据（指针） |
|---|---|---|---|---|
| 1 | 1 | 🔴 | 未解 | 需求 F3 仍写「**段长之所以是常量**：参数化的前提是「不同项目确需不同判据」……改判据 = 改代码、走评审」，与同一 F3 的「不量长度、不出读数」、设计 §2.1「长度与行数一概不量」、§3 的 `line-refs.mjs` 行「段判据已退役」互斥（F11 的「段长四类同免」已改「三类同免」，撤干净了那一处） |
| 2 | 2 | — | 已修 | 设计 §8「不改既有判据正文：引文判法未动；行号坐标**已动**——`gate` 面撤掉这一类，只留 `report` 清点」与 §2.1「不判：行号坐标」自洽（`DOC-DISCIPLINE` §3.23 条目 W ∥ A-DD37 的同步更新仍属协调项，本轮未复读该档） |
| 3 | 3 | 🔴 | 未解 | 需求 §1「落盘前判**本次写入落进去的那个段落**」＋ F14「判到段为止」vs F14「**不扩到段、不扩整块、不设上下文窗口**」∥ F11「写前门判本笔 diff 的字面行」∥ 设计 §2.5「段落与围栏块都不是判域的单位」；设计 §8 仍未交代 F14 所指单源 §3.26 扩区表的处置 |
| 4 | 4 | — | 已修 | 设计 §3／§7／§9 的 `AC-PL*` ∥ `AC-R*` ∥ `AC-X*` ∥ `C-5` 全落（§7 三行改指 §2.3 第 4 条）；§9.2「改写八行（回指改到仍在册的节）」逐行给出 7-17 ∥ 7-18 ∥ 7-19 ∥ 7-20 ∥ 36-5 ∥ 44-1 ∥ 45-1 ∥ 45-2 的新落点 |
| 5 | 5 | — | 已修 | 头行「需求层 = `docs/core/requirements/DOC-CHECK.md`（F1–F24 / AC-1–AC-20）」与正文 AC-12 ∥ 需求档一致 |
| 6 | 6 | — | 已修 | §2.1「不判：行号坐标 · 跨仓未声明 · 不带文档名后缀的裸名（代码族裸名 ∥ 无后缀裸词）」已加限定语，与同节「裸名只认文档名后缀（`md` ∥ `markdown`）」不再互斥 |
| 7 | 7 | 🟡 | 未解 | §2.5 的「区未定……该档**不入判集**、不拒、一行明示」只挂在收口门；批档 `edit` ∥ `append` 的「触达账各档的改动区」判不出时无态，而同节「某档在清单里却没有 `zones` 键 ⇒ 整份进判集」会把同一种「判不出」推向相反结论 |
| 8 | 8 | 🟡 | 未解 | §9.1「新增一行」= `7-20`，§9.2 八行表又把 `7-20` 记成「改写」；§9.2「故事索引表加 `CLI 44` ∥ `CLI 45`」「本批从 `CLI 44` 续」与 §9.4「盘上故事索引到 `CLI 49` 为止」互斥 |
| 9 | 9 | 🔵 | 未解 | 编节自「## 3. 接口契约」直跳「## 5. 关键决策记录」，§4 缺号 |

计数：原 🔴 4 条 —— 已修 2（#2 ∥ #4）∥ 未解 2（#1 ∥ #3）；原 🟡 3 条 —— 已修 3（#5 ∥ #6 ＋ 头行）∥ 未解 2（#7 ∥ #8）；🔵 未解 1（#9）；本轮新增 🔴 0。
§2.5 三道门的字面行本身已够实施（写盘门 ∥ 批档 `edit`／`append` ∥ 收口门各给判域，`texts`／`zones` 一个入口、纯删宽度为零、两参缺席零回归）——阻断只剩判据面两处口径互斥。

VERDICT: changes-required

### 轮次 16（评审子代理）

### 轮次 3 复核（9 项，全部 Fixed）

| # | 原# | 严重度 | 状态 | 证据（指针） |
|---|-----|--------|------|--------------|
| 1 | 1 | 🔴→— | Fixed | 重写后段长是活判据且两档同口径：需求 F1「一行 | **F1** | **一段文字太长要报**：一个正文段落超过 300 字 ⇒ 报出它所在的位置与字数 |」；设计 §1 ①「| ① | 一段太长 | 一段超过 300 字 |」；旧文「段长之所以是常量 / 已退役」两处活口径全数消失 |
| 2 | 2 | 🔴→— | Fixed | 设计 §1 ②「| ② | 拿行号做锚 | 正文里出现「档名 + 冒号 + 数字」的定位写法 |」与需求 F2「正文里出现「档名 + 冒号 + 数字」」同向；旧 §8「行号坐标已动」与 §2.1 的互斥随重写不复存在 |
| 3 | 3 | 🔴→— | Fixed | 判面只剩一种说法：设计 §6「判面 = 整份文档」+「交给门的是哪份文档，就判那份文档的全文——不按「这次改了哪几行」挑。」；需求 §3「**不查未改的档**：判的是本轮交付的档，不是全仓。」；旧扩区/段判域/§3.26 单源指针全部不在档内 |
| 4 | 4 | 🔴→— | Fixed | 身份号闭集自足：需求 §4 只有 AC-1…AC-6（末条「| **AC-6** | 同一份夹具里写一个在途批档 §2 清单上的新档名 ⇒ **零输出**…」）；AC-PL*/AC-R*/AC-X*/C-5/§2.9.x 全数零残，设计侧不引任何 AC 号 |
| 5 | 5 | 🟡→— | Fixed | 需求编号自洽：功能点止于「| **F5** | **在建的档不报**…|」，验收止于 AC-6；设计侧不再出现「F1–F23 / AC-1–AC-19」这类计数头行 |
| 6 | 6 | 🟡→— | Fixed | 裸名不判清单（「代码族裸名 ∥ 无后缀裸词」）已删，改为二值判：设计 §3「一个 token 先问一句：它该在仓内吗？」+「不该在仓内 ../ 开头的 ∥ 绝对路径指着本仓之外的 ∥ 别仓的档 ⇒ 跳过，一个字都不出」 |
| 7 | 7 | 🟡→— | Fixed | 批档 zones / touched-ledger 机制整体不在档内（设计 §6 只判整份文档），旧「区未定」缺位所指向的接缝已不存在 |
| 8 | 8 | 🟡→— | Fixed | §9 台账与故事号计数不在档内；需求 §5「三个触发点：设计轮交付 · 实施轮交付 · 父侧收口前，各跑一次。」无 CLI 号、无 7-20/44-1 类行号记账 |
| 9 | 9 | 🔵→— | Fixed | 节号连续：设计 §1 只判三件事 → §2 怎么数「一段」→ §3 怎么「找一下」→ §4 仓外一律不看 → §5 报什么 → §6 判面 → §7 落点，无缺号 |

复核另查：重写未在三件判据（段落长 ∥ 行号锚 ∥ 仓内悬空）与两条不报规则（跨仓 ∥ 在建）上引入新的互斥口径——需求 §2 尾「**三条判据之外没有第四条。**」与 F1–F5 结构一致。

未解项：无（🔴 0 · 🟡 0 · 🔵 0）

VERDICT: pass

### 轮次 17（评审子代理）

### 轮次（评审子代理 · code · 文档面 delta）

| # | 严重程度 | 状态 | 证据（指针） |
|---|---|---|---|
| 1 | 🟡 | 协调项（不属本席目标） | `docs/core/design/BATCH-RECORD.md` §4.22「缺 = 1 行，号 = `48-1`」∥「落地两处：`test/rtm/guard.md` 的 `48-1` 行 + `test/RTM.md` 故事索引表的 `CLI 48` 一行」——设计席需同步 §4.22（用户已派） |
| 2 | 🔵 | 可选 | `test/RTM.md` A-1 再测结果格「用例落地后补测，绿则改回 `有`」＝计划非结果（§11.5 字段 = 再测结果） |
| 3 | 🔵 | 可选 | 故事 `CLI 48` 删除后索引 `CLI 47` → `CLI 49` 零痕迹，A-1 说明只点 `CLI 47`（§11.15「行号永不复用…删掉的行号不回收」） |
| 4 | 🔵 | 可选 | `test/RTM.md` A-1 严重程度「中」与用户口径「假绿比红着更坏」不同尺 |

裁决：两项用户裁定均已落地——矩阵 `CLI 47` = `待补`（§11.18.1 待补 = 行在册 ∧ 证据格 `未落（用例待补）`）· 48 故事与用例行删净（`test/**` 搜 `CLI 47` ∥ `CLI 48` 只命中 md）· A-1 已记（异常格 `A-1` 回指）。
`doc_check` 报告态（`test/RTM.md` + `test/rtm/guard.md`）：命中 0 条（锚 0 · 段 0 · 行号坐标 0）。

VERDICT: pass
counts: 🔴 0 ∥ 🟡 1（协调项）∥ 🔵 3

### 轮次 18（评审子代理）

| # | 严重度 | 状态 | 证据（指针） |
|---|--------|------|--------------|
| 1 | 🟡 | New · 报告不改（DOC-GRAPH.md 属别席之笔，本审范围外） | `docs/core/design/DOC-GRAPH.md`「行数档位口径」仍写「执行面留两句——…第 8 条判据的指针句、…受影响文件清单的指针句——只指本节，不另立判定时点。」——两处指针已被自带数字的句子替换，该句成为过期的活描述；同节「数值（两条线各是多少）= 产品常量 `fileSoftMax` ∥ `fileHardMax`」也随之与提示词内的字面 500／800／300 不一致（数值现为三处） |
| 2 | 🟡 | New · 可选（非阻断） | `persona-eng-designer.md` 第 3 项新增三行自称「nothing to go and read elsewhere」，但判的是「over 500 lines before the change」；新建档没有「改前」读数（`DOC-GRAPH.md`「新建档没有「改前」：判它落盘时的长度——它是本批写出来的那一档。」），本批新建 600 行源档时该句无判据 |
| 3 | 🔵 | New | `advisor-design.md` 第 8 条「Tier authority」自称口径就在本条内，但本条只有 500（设计时）与 300（函数），不含 800 收口线；`persona-eng-designer.md` 第 3 项三条齐全 |
| 4 | 🔵 | New | 第 8 条两次陈述同一条禁数规则：「no number goes into the design document」∥「Neither the size nor an expected delta goes into the design document」，阅读成本而非缺陷 |

数值核对：500／800／300 与方法论 F3-1「设计时判**改代码前** 500…收口时判 800」一致；机检常量 `batch-tier-gate.mjs` 的 `FILE_SOFT_MAX = 500` 同值，无数字漂移。
`thincoder-core/prompts/` 全目录已无 `DOC-GRAPH` ∥ `DOC-DISCIPLINE` ∥ `行数档位口径` 命中（grep 零命中），两处指针确已拔除。

VERDICT: pass
计数：🔴 0 · 🟡 2（均非 must-fix） · 🔵 2

### 轮次 19（评审子代理）

> 状态行重置：第 19 轮打回（changes-required）· 上一轮状态行 = 评审通过 → 进行中 · 2026-11-12

| # | 严重度 | 状态 | 证据 |
|---|---|---|---|
| 1 | 🔴 | 未处置 | 设计 §3「若这个档名出现在某份在途批档的 §2 机读清单里 ⇒ 不报」∥ 需求 F5 同句——清单的条目形（哪个块、哪一列）与匹配谓词两档皆无定义、无指针；本对档之外全 `docs/core` 只有 `PATH-RESOLUTION.md` 提到该词，未定义条目形 ⇒ 豁免集两种读法各不相同 |
| 2 | 🟡 | 未处置 | 设计 §3「不造解析腿序、不造声明仓、不造 `publicRepos`、不造豁免。一句「仓内找一次」就够。」vs 同节三条例外；需求 §3 边界「没有「根」、没有「腿序」、没有「豁免表」。仓内找一次，找不到就报。」∥「不查未改的档：判的是本轮交付的档，不是全仓。」vs F5 的跨档声明面 |
| 3 | 🟡 | 未处置 | 需求 F7「一律不报」∥ 设计 §3「第三个例外：`.thincoder/` 下的路径一律不判」未说抑制三判据中的哪些，亦未说被判档本身落在 `.thincoder/` 时如何；同节「面别只决定悬空判不判」只解了批档面 |
| 4 | 🟡 | 未处置 | 需求 AC-6「该批收口后同一条 ⇒ 报」——收口后目标档已在盘同样使该格变红侧，「豁免失效」与「指针已解」不可分；夹具列「批在飞 ∥ 批已收口」未给收口状态的表示法 |
| 5 | 🟡 | 未处置 | 设计 §3「批档收口之后清单跟着失效」——「在途」的真值单源住 `docs/core/design/BATCH-RECORD.md` §4.9「在途性真值 = 批次档状态行自身」，本对档未点名 ⇒ 「某份在途批档」可被读成「盘上任何一本批档」 |
| 6 | 🟡 | 未处置 | 需求 §2 的 F7 行与 §4 的 AC-8 行皆为空行后的孤行、无表头（「\| **F7** \| **`.thincoder/` 之下一律不报**」「\| **AC-8** \| 文中写出 `.thincoder/` 下的路径 ⇒ **零输出**」）⇒ 渲染成竖线文本，本轮两条新规则各自丢掉一列 |
| 7 | 🔵 | 未处置 | 设计 §3「（§1–§6 一整份）」∥ 需求 F6「（§1–§6 整份）」——豁免钥是整份档还是这六节集合未定 |

已核为真（不构成 finding）：F6 与 `docs/core/design/MANIFEST.md`「它读的声明面只有一处：`docRoot.batches`（批档面在哪儿 ⇒ 批档整份不判悬空，单源 = `docs/core/design/DOC-CHECK.md` §3）」一致；面别边界对批档面有明文（设计 §3「面别只决定悬空判不判：段长 ∥ 拿行号做锚两判据对批档照旧生效。」∥ 需求 F6「批档整份不判悬空」）；F7 的「不是豁免表」在两面同口径（设计 §3 ∥ 需求「F7 不是豁免表」）。

VERDICT: changes-required
计：🔴 1 · 🟡 5 · 🔵 1

### 轮次 20（评审子代理）

### 轮次（设计评审子代理）

评审对象 = `docs/core/design/DESIGN-TOKEN-SETTLEMENT.md` §10.1–§10.2 ∥ `docs/core/requirements/DESIGN-TOKEN-SETTLEMENT.md` F-D9（含 F-D7 闸半边）。

| # | 严重度 | 状态 | 证据（指针） |
|---|---|---|---|
| 1 | 🔴 | 待修 | §10.1「本次 `batchDoc` 的绝对路径」——派单侧该值的来源未写；「无 batchDoc」分支未写，且与 §10「不加「工程模式评审必带批档」的强制面」相抵 |
| 2 | 🔴 | 待修 | §10.1「读该 designId 的批归属旁列」未定读形；§10「读形（收口面严格 ∥ 清点面宽容）」已立两形 |
| 3 | 🔴 | 待修 | §10.2「重算同一个 sha256」——派单侧被审档清单来源、字节口径（顺序 ∥ 分隔 ∥ 路径是否入算）均未写 |
| 4 | 🔴 | 待修 | §10.2 全节无落点；对照 §10.1「落点 = `thincoder-core/agent-tools/subagent-design-token.mjs`」；序列化 / 合并 / 恢复三处与冲突规则未名 |
| 5 | 🔴 | 待修 | U-BG1–U-BG16 ∥ A1–A7 无封印 ∥ 闸面批归属项；F-D9 行「验收两条」未指名用例宿主（F-D7 指名「`U-BG16`」+「集成 10-4」） |
| 6 | 🔴 | 待修 | §10.1「⇒ 拒（两个路径都点名）」∥ §10.2「不一样 ⇒ 拒」——两条拒分支无观测引文、无复现命令（§10 各分支均有「分支出处」） |
| 7 | 🔴 | 待修 | §10「既有用例 U-BG1 ∥ U-BG8 ∥ RTM 10-1 走的就是它」——批档在被审档集内时，实施轮写批档即改被审档 ⇒ 封印自毁 |
| 8 | 🟡 | 待议 | §10.2 未定被审档缺档 ∥ 不可读时「不拦 ∥ 拒」 |
| 9 | 🟡 | 待议 | §10「射程划分」引「批归属的旁列（F-D7）不属本条射程」≠ 需求 §5 末条现文「**批归属的旁列（F-D7）∥ 评审封印的旁列（F-D9）不属本条射程**」 |
| 10 | 🟡 | 待议 | §10「边界（不做）」仍写「`engDesignTokenSeals` 旁列不属本条」，与 §10.2 同节定义相抵 |
| 11 | 🟡 | 待议 | §10.1 ∥ §10.2 无自带「最相近先例」「公开源核查」行（§10 两行只覆盖批归属半边——F2-6） |
| 12 | 🟡 | 待议 | 「新名字的三问答案」表无 `engDesignTokenSeals`、无闸面批归属步 |
| 13 | 🟡 | 待议 | KD-BG1–KD-BG10 无封印项（F7-2）；§10.2 无问题陈述 ∥ 理由 |
| 14 | 🟡 | 待议 | §10.1 拒文非逐字（对照 §10.2「the reviewed documents changed after the review passed — re-run the review or revert」） |
| 15 | 🟡 | 待议 | §10.1「现有四步核之后」= 位置指代、未名符号（同前一处「四步核」无符号名） |
| 16 | 🟡 | 待议 | 「集成测试设计」的「缺失行 | 一处：故事 10 新行 **10-4**」未含派单面行，亦未答既有行夹具是否被封印改写 |
| 17 | 🟡 | 待议 | 「档位登记（本批六档…）」不含 §10.1 落点档（`subagent-design-token.mjs`）∥ §10.2 将落的档 |
| 18 | 🔵 | 备注 | 需求表 F-D9 行位于 F-D7 与 F-D8 之间（编号序乱）；§10「行数与坐标 = 本轮实读」属过程句留规范面 |

计数：🔴 7 · 🟡 10 · 🔵 1。未发现「token 值形」与「收口消费」两面的冲突（§10.2「token 值形零改——仍 `<uuid>:<expiryMs>` 两段」与 §10 各条一致）。

VERDICT: changes-required

### 轮次 21（评审子代理）

| # | 严重度 | 状态 | 证据（指针） |
|---|---|---|---|
| 1 | 🔴 | 待处置 | TOOLS §6.25 标题「门报错七态」∥ ③ 表七行 vs 同节 ③ 标题「门六态分支的六条拒句逐字」· 偏离段「六态拆分的每一句」· A2「六态互异」· K1「六态 = 同一次判定的六条分支」· K5「六条拒句零令牌值」· L5「③ 六条拒句」；同一节内「后三态」（拆七条判定分支段）与「后两态」（K1 ∥ A5）互斥 |
| 2 | 🔴 | 待处置 | 设计 §10.1「落点 = `gateDesignToken` 的第 ⑤ 步（`thincoder-core/agent-tools/subagent-design-token.mjs`）」+ §10.2 派单复算行 vs TOOLS §6.25「两枚 `export function`（`designTokenRefusal` / `gateDesignToken`）住 `thincoder-core/agent-tools/subagent-spawn.mjs`」·「helper 落位：两枚定义追加在同档模块尾」· L7 |
| 3 | 🟡 | 待处置 | 设计 §10「`index.publicRepos` = `[]`（本轮 `manifest read` 实读）」 vs §10.1「= `[\"../.thincoder\",\"../thincoder.com\"]`（本轮实读）」 |
| 4 | 🟡 | 待处置 | 设计 §10.1「比较对象 = 本次 spawn 的 `batchDoc` 参数解析后的绝对路径… `batchDocAbs`」 vs TOOLS §6.25 ④ 签名「export function gateDesignToken(parent, args)」+ L5 调用形——⑤ 的比较对象不在该签名入参面 |
| 5 | 🟡 | 待处置 | 需求 F-D9 边界「被审档缺档 ∥ 不可读 ⇒ 拒（fail-closed）」· TOOLS §6.25 seal-unreadable 行；设计 U-BG 表仅有 U-BG19 ∥ U-BG20 ∥ U-BG21，该分支无用例（T6 只断言七句互异） |
| 6 | 🟡 | 待处置 | 设计「A8 = U-BG17 + U-BG19 + U-BG20」；U-BG18（批相符放行）∥ U-BG21（旧槽跳过）在用例表内但无验收归属 |
| 7 | 🟡 | 待处置 | 设计「缺失行」行称「一处：故事 10 新行 10-4」 vs 同节行表同时给出 10-4 与 10-5，且落点段称「两行编号与文字落 `test/RTM.md`」 |
| 8 | 🟡 | 待处置 | 设计 §10.1「分支出处（本次会话实况）：评审 #58 过后沿用同一枚令牌派了 #66 ∥ #71——令牌的批归属与派单批一致，四步核全过，拦不住」——所述场景里归属与派单批一致 ⇒ batch-mismatch 支不会触发 |
| 9 | 🟡 | 待处置 | 需求 F-D7「（`U-BG16`——原稿作 U-7，与设计侧同名）」· 设计「编号对齐…所称 `U-7` = 上表 `U-BG16`」 |
| 10 | 🟡 | 待处置 | 设计「档位登记（本批六档…）」未含 §10.1 ∥ §10.2 的 ⑤ ∥ ⑥ 落点档 `subagent-design-token.mjs`（本轮量 81 行 ⇒ 不越档结论不变） |
| 11 | 🔵 | 记录 | 需求档头「本档 = 该机制的**需求层权威**（F-D1–F-D6 / N-D1–N-D4 判定句）」未覆盖 F-D7–F-D9 ∥ F-SL1–F-SL3 |

计数：🔴 2 · 🟡 8 · 🔵 1（共 11）

VERDICT: changes-required

### 轮次 22（评审子代理）

| # | 严重度 | 状态 | 证据（指针） |
|---|---|---|---|
| 1 | 🔴→✅ | Fixed | TOOLS §6.25 全节统一为七：标题「门报错七态」· 「门的判定拆七条分支」· 「七态拆分的每一句」· 「③ 门七态分支的七条拒句逐字」· A2「七态互异」· A5「后三态各加一条拒绝条件」· K1「七态 = 同一次判定的七条分支」· K5「七条拒句」；全节「六态/六条」零命中 |
| 2 | 🔴→✅ | Fixed | §6.25 落点句已改：「两枚 `export function`（`designTokenRefusal` / `gateDesignToken`）定义住 `thincoder-core/agent-tools/subagent-design-token.mjs`；`thincoder-core/agent-tools/subagent-spawn.mjs` 只再导出」· helper 落位 · L7 · 「外部档案处置」同指；与设计 §10.1「落点 = `gateDesignToken` 的第 ⑤ 步（`thincoder-core/agent-tools/subagent-design-token.mjs`）」一致 |
| 3 | 🟡→✅ | Fixed | 设计 §10「公开源核查：读数单源 = §10.1（本节不另记）」· §9 同句；§10.1「`index.publicRepos` = `["../.thincoder","../thincoder.com"]`（本轮实读）」为唯一读数，「= `[]`」已删 |
| 4 | 🟡→✅ | Fixed | 设计 §10.1 新增「**入参面**：`gateDesignToken(parent, args, { batchDocAbs })`」；§6.25 ④ 抽取签名、L5 调用行、K2、⑤ 比较对象段同形 |
| 5 | 🟡→✅ | Fixed | 设计用例表新增 U-BG22「错误（封印不可读）…按原字节放回那份档后再派单 ⇒ 放行」；需求 F-D9 用例列 =「`U-BG19` ∥ `U-BG20` ∥ `U-BG22`」 |
| 6 | 🟡→✅ | Fixed | 设计「A8 = U-BG17 + U-BG18 + U-BG19 + U-BG20 + U-BG21 + U-BG22（…）」，U-BG18 / U-BG21 / U-BG22 均有验收归属 |
| 7 | 🟡→✅ | Fixed | 设计「缺失行 \| 两处：故事 10 新行 10-4…与 10-5「闸面两向各拒一次」」，与行表两行编号及「两行编号与文字落 `test/RTM.md`」一致 |
| 8 | 🟡→✅ | Fixed | 设计 §10.1「**分支出处（复现路径 · 复现驱动的防御）**：以 `batchDoc` = A 批跑一次设计评审铸一枚槽，再用同一枚令牌派 `batchDoc` = B 批的 eng-coder——四步核全过、派单放行」 |
| 9 | 🟡→✅ | Fixed | 需求 F-D7 用例列已无「原稿作 U-7」，仅「（`U-BG16`）」；设计档「U-7 / U-8 / 编号对齐」零命中 |
| 10 | 🟡→✅ | Fixed | 设计「档位登记（本批七档…）」含「`thincoder-core/agent-tools/subagent-design-token.mjs`（§10.1 ⑤ ∥ §10.2 ⑥ 的落点档；未过 500）」，五档 + 新增一档 + 已拆一档 = 七 |
| 11 | 🔵→✅ | Fixed | 需求档头「本档 = 该机制的**需求层权威**（F-D1–F-D9 / F-SL1–F-SL3 / N-D1–N-D4 判定句）」 |
| 12 | 🟡 | New（不阻断） | TOOLS §6.25 T10 标题仍作「正常（新增两态都不触发）」，同行断言列已作「七态都不触发」，与同节「后三态」「三条新拒句」不符——六→七态修复的残留一 

计数：Fixed 11 · 新增 🟡 1（advisory，不阻断）· 未决 🔴 0

VERDICT: pass

## §4 用户批准（主 agent）

- **用户批准**：2026-11-12 13:24，用户原话「1，走。」（回应「两条线收口」的请示）。
- **批准对象**：本批的 §2 设计（令牌闸七态 · ⑤ 闸面批归属 · ⑥ 评审封印）+ §3 评审通过 + §5 实施记录，连同据此收口的要求。
- **批准前已核**：§3 评审判 pass、实施席交付的当批单测 18/18 绿、两轮代码评审终态 clean。

## §5 实施记录（eng-coder）
**状态行**：实施完成



### 实施记录 · 解析与识别面那一轮（eng-coder）

**射程**（父侧派单）：① `index.mjs` 五族分拆 ② `anchors.mjs` 识别面一族分拆 ③ E11 相对形前置腿 ④ E12 `outOfDomain` 判域收边 ⑤ `subagent-spawn.mjs` 切两族。门那几族（`batch-gate*` 删存量、收口面不入判集）**不在本轮**，一字未动。

#### 1 交付表（逐条）

| # | 条目 | 状态 | 落点 |
|---|---|---|---|
| ① | `index.mjs` 五族分拆 | ✅ | `doc-decl.mjs` ∥ `exemptions.mjs` ∥ `range-input.mjs` ∥ `line-reads.mjs` ∥ `report-blocks.mjs`；`index.mjs` 只留装配 + 公有名再导出 |
| ② | `anchors.mjs` 识别面一族分拆 | ✅ | `doc-tokens.mjs`；`anchors.mjs` 再导出这一族（含四条抽取式） |
| ②′ | **第二刀**（§2.9.7 那句再拆规则，父侧裁定「走 A」） | ✅ | `doc-names.mjs`（档名豁免 + CANON 操作数）；`anchors.mjs` 再导出 ⇒ 两个消费面 import 行零改 |
| ③ | E11 相对形前置腿 | ✅ | `path-resolve.mjs` 的 `coreLegs`：`./` ∥ `../` 开头时引用方目录那一级提到 `order` 两级之前，其余各形零变 |
| ④ | E12 `outOfDomain` 判域收边 | ✅ | `path-resolve.mjs`（`domainRoots` ∥ `underRoot` ∥ `undeclaredSiblingForm` ∥ 第 7 步两个终态）+ `anchors.mjs` 三条抽取分支各显式跳过 + 未声明支与提示载荷按 §2.11.2 删除 |
| ⑤ | `subagent-spawn.mjs` 切两族 | ✅ | `subagent-brief.mjs`（任务书 ∥ 写域行 S4 ∥ 文档坐标行 S5）∥ `subagent-design-token.mjs`（槽解析 ∥ 四态拒句 ∥ 令牌门，**原样再导出**） |
| ⑥ | 验收面（本轮头条行为的可跑断言） | ✅ | `path-resolution.test.mjs` 新增 `29-7`（E11）∥ `29-8`（E12 ∥ E12b）；`29-4` ∥ `cross-repo-refs.test.mjs` 的 `37-2` 按「未声明 = 域外」改判；RTM `paths.md` 同步四行 |

**越界说明（父侧要求写进本段）**：设计档点的是「五个新档」，本轮落了 **7 个 doc-check 新档 + 2 个 spawn 新档**。

**越界 = 第 6/7 档（`doc-tokens.mjs` ∥ `doc-names.mjs`），依据 §2.9.7 那句再拆规则**——「搬出来的档若撑越 500 设计器硬线 ⇒ 本批收口前再拆一次：硬限不允许诞生」。第一刀后 `anchors.mjs` 实测 557，仍在 500 之上，故按该规则补第二刀；父侧同日裁定「走 A」。

**其它清单外改动（2 处，已在交付报点名）**：`thincoder-core/agent-tools/review-facts.mjs`（+3 行：消费面总覆盖守卫，`unverified` ∥ `outOfDomain` 两态在该面今天不可达，属 fail-closed 补齐）；三份验收面档（`path-resolution.test.mjs` ∥ `cross-repo-refs.test.mjs` ∥ `test/rtm/paths.md`，见 ⑥）。

#### 2 读数（`doc_check` 的 `lines` 面 · D15 唯一把尺）

```
拆前 → 拆后（同一把尺）
index.mjs            1076 → 404     （越 800 硬线 → 未越线）
anchors.mjs           630 → 499     （越 500 设计器硬线 → 落回线下，余 1 行）
path-resolve.mjs      469 → 499     （未越线 → 未越线）
subagent-spawn.mjs    558 → 428     （越 500 → 落回线下）

七个 doc-check 新档：doc-decl 94 ∥ doc-tokens 108 ∥ exemptions 97 ∥ line-reads 117
                    ∥ range-input 111 ∥ report-blocks 315 ∥ doc-names 74
两个 spawn 新档：    subagent-brief 76 ∥ subagent-design-token 81
```

**没有一档越 500**：最长的 `report-blocks.mjs` 315、`path-resolve.mjs` 499、`anchors.mjs` 499。

#### 3 「拆前 ∥ 拆后输出是否逐字相等」——分两组答，因为本轮同时有「只搬不改」与「有意改判」两种改动

口径 = 同一批档、同一引擎、两个问法各跑一次，比 `report` 文本与整份结构化返回（含全部命中数组）。

| 组 | 夹具 | 结果 |
|---|---|---|
| **分拆不变性** | 三份设计档 ∥ 判据五类夹具 ∥ 提示词面夹具 | **设计档组 txt 与 JSON 全同**；**提示词面组全同**；判据夹具组 `report` ∥ `gate` **文本逐字相同**，JSON 只差一格：`档缺` 载荷里的 `siblingRepos: []` 随 §2.11.2 删除（该格渲染为空串，故文本零变） |
| **有意改判（E11/E12）** | 一份档写四条指针：相对形一条（相对自己目录成立）∥ 出仓两条（存在 ∥ 不存在）∥ 未声明同级仓一条 ∥ 仓内真悬空一条 | **4 命中 → 1 命中**：三条域外消失（引缺 1 · 档缺 2），仓内真悬空照拦——这正是 E11/E12 的验收读数 |

#### 4 验证（命令 + 结果）

- `node --check`：本轮改动的 18 个 `.mjs` 全绿（doc-check 九档 ∥ `path-resolve.mjs` ∥ `declared-repos.mjs` ∥ `manifest-schema.mjs` ∥ 四个 agent-tools 档 ∥ 两个用例档）。
- 集成：`node --test` 跑过本轮全部受影响档，**104 条用例全绿**。
- **红侧实跑（新加的两条用例不是「只会绿」）**：把 `relativeForm` 置 `false`、把 `inDomain` 置 `() => true` 后复跑 ⇒ `29-7` ∥ `29-8` 双双转红（`pass 6 · fail 2`）；还原后 12/12 绿、探针零残留。
- `doc_check({mode:"gate"})` 于本轮写过的唯一 `.md`（`test/rtm/paths.md`）⇒ `DOC-CHECK GATE: PASS`。
- 三份设计档 + `PATH-RESOLUTION.md` 的 `gate` ⇒ `PASS（4 档全清）`。

#### 5 内部审计与代码评审（终态声明）

- **独立分歧审计（explore 子代理）**：`divergence(2)` —— ① `doc-names.mjs` 不在设计档落点清单里（已知上抛，父侧已裁「走 A」）；② `review-facts.mjs` 属清单外改动（低，不可达的 fail-closed 补齐，已在报点名）。六条判据逐条「符合」：导出面等价 ∥ 再导出覆盖三处消费 ∥ 三条分支显式跳过 `outOfDomain` ∥ 五态只在传域的面出现 ∥ 段长与行太长未被放过 ∥ `siblingRepos` 载荷连提示行删净。
- **独立代码评审（advisor · code）**：第 1 轮 `changes-required`（🔴 1 ∥ 🟡 2 ∥ 🔵 3）。**处置**：🔴（E11 零断言）→ 落 `29-7`；🟡（E12/E12b 覆盖不足）→ 落 `29-8`；🟡（设计档滞后）→ 父侧/设计席笔域，本席不动，已上抛；🔵 三条（`anchors` 再导出缺两条抽取式 ∥ `doc-names` 双 import ∥ `subagent-spawn` 头注比事实宽）→ 当场全改。
- **终态 = clean**（偏离项全部关闭或已明确上抛，无未处置项）。

#### 6 已知代价与上抛

1. **[上抛·知会]** 设计档两处滞后由设计席补笔：`DOC-CHECK.md` §2.9.7 的「`anchors.mjs` 留 … ∥ 豁免谓词」与它的新档清单（缺 `doc-names.mjs`）。代码侧不改设计档（D1 笔域）。
2. **[上抛·知会]** `DOC-DISCIPLINE.md` 里那条 `依据` 行（「剥除面 = 整 token 边界」段所领的那一条）在第二刀后一度成 `引缺`——指针仍指 `anchors.mjs`。父侧已派人改指 `doc-names.mjs`，复跑 `PASS`，此处只留记录。
3. 设计钉的集成行 `7-20 ∥ 7-22`（故事 `CLI 7`，入口 = `batch append` 回执）**未落**：该入口属门那几族（下一轮）。本轮验收落在解析层自己的册（`paths` 的 `29-7` ∥ `29-8`）；两处口径差已在交付报点名，请父侧定是否在门那一轮补 guard 册的行。
4. 本轮**没有新建一次性夹具档**（父侧令）：读数来自既有夹具与两条新用例。

### 实施记录 · 修正轮（父侧 2026-11-11 20:26 派单三件 · ②由父侧接走）

**射程**：① AC-2 符号族零残留 · ③ 本段补「与 AC-8 的偏离（A 案）」。② 那两行在另一份批档 §5 第 6 节，本席写入面绑在本文 ⇒ 跨批拒写正确，父侧接走（前提证据见本段末）。

#### ① AC-2：删了什么 → 现在怎么走（逐处，预期残留 = 0）

| 档 | 删了什么 | 现在怎么走 |
|---|---|---|
| `doc-check/report-blocks.mjs` | `STOCK_LINE` 定义整条（存量读数句形的定义面） | 区外命中在引擎装配处就地丢弃，没有任何报面行再引用这句形 |
| `doc-check/index.mjs` 头注 ∥ 再出口 ∥ import | 头注两处 `STOCK_LINE` 句与 `stockHits` 释义 ∥ `export { CYCLE_READ_LINE, STOCK_LINE }` 的后半 ∥ import 名单里的 `STOCK_LINE` | `CYCLE_READ_LINE` 保留单导出（注释改「引擎两面取它拼读数行」——原「批档门取它拼拒串」的消费面已在门族轮撤除）；`zones` 释义改「区外命中就地丢弃（区外不入判集）」 |
| `doc-check/index.mjs` 装配处 | `const stockHits = []` ∥ `partition` 的收集支 ∥ 返回形 `stockHits` 键 ∥ `gateReport` 实参 ∥ report 面 `STOCK_LINE` 推行 | `partition` 改 `if (inZone(h)) kept.push(h)`——区外直接丢弃：不入判集、不计数、不出行；区内照拦（判决零改） |
| `doc-check/report-blocks.mjs` 返回形 ∥ `gateReport` | `noRootOutcome` 的 `stockHits: []` 键 ∥ `gateReport` 签名 `stockHits = []` 入参 ∥ gate 面 `STOCK_LINE` 推行 ∥ 死 import `rel` | 无声明根返回形与 gate 报面不再携带存量桶；豁免块位置照旧；import 收窄到四个有名 |
| `tools/doc-write-gate.mjs` | 头注导出名 ∥ import `STOCK_LINE` ∥ `refusalMessage` 的 `res.stockHits` 分支 ∥ 五处指向已撤存量层的注释字样（「存量读数句」∥「落进存量读数」∥「多认存量」×2 ∥「夹着存量锚」） | 拒串 = verdict + 命中行 + 判面行 + 零字节句 + 处置块；注释改判域口径（「落到区外（不入判集）」∥「多认未判命中」∥「未判的旧命中」）——方向语义零改 |

#### ① 的读数（命令 + 结果）

- **AC-2 机检**：`STOCK_LINE|stockHits`（父侧点名的两个符号）于 `thincoder-core/**` 全后缀扫描（node 递归）⇒ **0 命中**；六串全族（加 `stockCount|pureDeleteStock|survivingLineMap|disclosed`）于同域 `*.mjs` ⇒ **0 命中**。判据字面注：`thincoder-core/prompts/persona-eng-coder.md` 一句英文（"a reduced version disclosed afterwards"）使「含 .md 全后缀六串零命中」永不可绿——该词先于本批存在、与符号族无关，收口按代码面（`.mjs`）记法或登记假阳，不为凑绿改无关提示句。
- **语法 ∥ 装配**：三档 `node --check` 过；`index.mjs` ∥ `doc-write-gate.mjs` import 实跑过（`STOCK_LINE in module: false`）。
- **集成**：门族与引擎面九档 `node --test` = **31 条全绿 0 失败**（batch-close-gate 14 ∥ batch-touched-region-gate 2 ∥ batch-edit-spec-section 3 ∥ doc-write-gate 2 ∥ doc-check-recognition 2 ∥ 豁免 ∥ 空范围 ∥ 行数 ∥ per-file-root 共 8）。
- **红侧**：恢复任一被删行（如 `STOCK_LINE` 定义）⇒ 扫描命中 +1 ⇒ 红；恢复 `partition` 收集支 ⇒ 区外命中重回回执 ⇒ 红。
- **`doc_check` 首行**：三份设计档 `gate` ⇒ 全 `DOC-CHECK GATE: PASS`。
- **修正轮评审**：advisor code 第 6 轮 = pass（🔴 0 · 🟡 0 · 🔵 2，均面外观察项）；本席两次尝试带代码相对形路径字面进 §3 引文被门拦（批档落盘后即成死指针，拦得对），改连续片段引文后落档。

#### ③ 与 AC-8 的偏离（A 案）

AC-8 红侧原写「把『基线里没有该档』判成不入判集（B 案）⇒ 同一夹具放行 ⇒ 红」。本批按用户书面裁定走 **A 案**：跟踪面上、基线提交里没有的档（新建 ∥ `git mv` 搬入）**不落**「不入判集」两类——`git diff -U0` 把整份标成 `+` ⇒ 判成 `region`、改动区 = 整档、照判（实现单源 = `thincoder-core/agent-tools/batch-regions.mjs`「基线里没有该档（本批新建 ∥ `git mv` 搬入）= 整份新增…判成 `region`」）。

- **为什么偏离（理由）**：B 案让一切新建档（含批档自身——每批必新建）逃出收口判集 = 把门拆了。
- **代价（认下来）**：搬入档的既有死引文今天会被多拦一次（A 案比 B 案严；同一旧债不漏，只是严了）。
- **到期**：下批落 `git diff -M` 重命名识别后重判本条——那时「基线无该档」的两义（新建 ∥ 搬入）分得开，再定搬入档的判法。
- 设计档侧的 B 案字面已由设计席同轮换成 A 案（`docs/core/design/DOC-CHECK.md` §2.9.4 现文：「该档在那个基线提交里没有…= 整份新增…照判」）。

#### ② 跨批拒写（父侧接走）

「设计面漂移 ∥ 记录面漂移……待设计席就地回写」两行在另一份批档 §5 第 6 节——本席批档写入面绑在本文，跨批拒写正确。**前提已核实**：`DOC-DISCIPLINE.md` §3.20 现文已是「本臂不判的三形：缺块 ∥ 行不成两列 ∥ 档不在盘不是拒因」∥ `DOC-GRAPH.md` §3 ② 现文已是「判的是记录缺件…没有越线档 ⇒ 该判不启动」∥ 该批档 §2 落点带「已修 · 2026-11-11 本席同轮」注 ∥ 三参 `assertTierPlan(src, root, changed)` 在盘。

### 实施记录 · 修正轮（评审第 7 轮两条发现 · 父侧 2026-11-11 派单）

**射程**：① `sectionOnDisk` 行为改（读不到 ⇒ 不出 `节缺` 行）② 根序两套比较器收成一把。只动这两处 + 各自红侧，零扩大。

#### ① anchors.mjs —— 行为改（不是改注释）

| 处 | 改前 | 改后 |
|---|---|---|
| `sectionOnDisk` 头注 | 「读不到 ⇒ 记 unreadable（不当『无该节』…），映射仍为空」——与调用点行为相悖 | 头注与行为一致：读不到 ⇒ 记 unreadable、映射空，**调用方据此把该档的存在性记为未判** |
| 调用点（`checkAnchors` 锚分支） | `sectionPresent` 判 false ⇒ 照出 `节缺` 行（把「没读成」说成「无 §N」——成因错标） | `unreadable.includes(r.abs)` ⇒ 不出 `节缺` 行；边落「判不了存在性」（既有三态之一，不冒充「不在盘」）。判据本体零改：读得回且节真缺 ⇒ `节缺` 照出 |

安全性：该档已在 `unreadable` 清单（`readText` 记入）⇒ `gate` 首行判 `ERROR（读不到 N 档）`（fail-closed，不产假绿）、报面「未判」桶点名——正是评审指出的兜底路径。

#### ② index.mjs —— 三处同一把尺（共用谓词，不写两份）

| 处 | 改前 | 改后 |
|---|---|---|
| 新增 `rootOrder` | —— | 唯一比较器：按 `pathKey` 比（win32 折小写），头注点名两套排序同取这一把 |
| `projectRoots` | `.sort()`（默认序，大小写敏感） | `.sort(rootOrder)` |
| `domainTables` 返回面 | 独立 `toLowerCase()` 比较器链 | `sortedTables`（排一次、两处同吃）映射，序与 `projectRoots` 同源 |
| 域表读数块的 `read` | `domainTables.map(d => d.ok)`——取**分组序**，与排序后的 `projectRoots` 按索引配对 | `sortedTables.map(d => d.ok)`——布尔与根同吃同一份排序结果 |

红侧实跑修正了评审的判定面：报面块的配对今天恰好碰对（`checkFiles` 与 `projectRoots` 同尺），**真正错配在返回面**——红侧读数：`domainTables` 返回 `[alpha, Zeta]` 而 `projectRoots` 返回 `[Zeta, alpha]`，按索引消费返回面的用例即错根。修法收三处（比较器 ∥ 返回面 ∥ 报面块）到一份排序结果，比只对齐比较器更窄不更宽。

#### ③ 红侧（`docs/batches/2026-11-11-gate-silent-when-pass.test.mjs` · 收口删除）

- **改前红**（命令 = `node --test docs/batches/2026-11-11-gate-silent-when-pass.test.mjs`）：① `hits.anchors = 2`——目标**读不到**却出两条 `✗ 锚·节缺`，其中「无 §2.5」那条的 §2.5 实际存在（成因错标实锤）；② `domainTables` 与 `projectRoots` 两序错位（deepEqual 红，序见上）。
- **改后绿**：pass=2 fail=0。
- **红侧失效验证**（stash 撤单侧复跑）：撤销① ⇒ pass=1 fail=1（①红）；撤销② ⇒ pass=1 fail=1（②红）；两处均还原、stash 面干净。
- **夹具①的机造样本**：win32 `icacls /deny (RD)`——`statSync` 通、`readFileSync` 报 EPERM（本机实测），正是「在盘但读不到」；对照支验判据本体零改（读得回 ⇒ 真缺节照出 `节缺`、`REFUSED（锚 1 条）`）。

#### ④ 读数（命令 + 结果）

- `node --check`：三档全过（`anchors.mjs` ∥ `index.mjs` ∥ 单测档）。
- 既有夹具全量复跑**保持绿**：doc-check 族 10 档（per-file-root 3 ∥ recognition 2 ∥ line-refs 4 ∥ exemptions 2 ∥ exclude-paths 1 ∥ fence-verdict 1 ∥ empty-range 1 ∥ line-counts 2 ∥ path-resolution 8 ∥ citation 1）+ 门族 5 档（batch-close-gate 14 ∥ batch-touched-region-gate 2 ∥ batch-edit-spec-section 3 ∥ cross-repo-refs 4 ∥ brace-group 1）= **15 档 46 条全绿 0 失败**。
- `doc_check` 首行（本批批档 gate）：`DOC-CHECK GATE: REFUSED（锚 2 条）`——两处命中均在**非本席笔域**的段：

```text
L346 = §13.1 设计席的依据行：引文与 E7 改后的 blocks 现文已对不上（锚·引缺）
L934 = §3 轮次 7 表格里的裸段路径（thincoder-core/agent/ 目录下 setup.mjs；锚·档缺）
```

按「命中档在本席笔外 ⇒ 上抛父席路由」处置，本席不动别人的段。

#### ⑤ 上抛（知会）

1. **[上抛·知会]** 批档 gate 两处命中（上行围栏所列两处）在 §13.1（设计席）∥ §3 轮次 7（评审席）段内，归父席路由：前者依据引文需随 E7 改后的 `blocks` 现文更新或删除；后者属裸路径形，按 16:53 裁定「裸档名不出现」，评审席段内历史表述的去留由父席定夺。
2. **[上抛·知会]** 设计档无相抵：`DOC-DISCIPLINE.md` §3.20「节不在盘 ⇒ 节缺」以读到内容为前提，「读不到」归同节「读面」块（不当命中、不当干净）——行为改落在既有口径内，设计席无需改笔。
3. **[上抛·知会]** 本席 §5 写入面被门拒过一次（本段草稿把示例段路径写在散文里 ⇒ `档缺`）——按 D8 改法（示例进围栏）落笔，语义零改；与既有轮次的「写入面自我拒绝」同形，记录在案。

### 实施记录 · 核实轮（父侧 2026-11-12 派单四件 · 先核实、后补）

**射程**：零生产代码改动。按父侧点名的四件做实测核实（不读码定案），把设计面点名要实施轮落的那一条验收补上。

两次临时停用 `judgeZones` 的零宽支做红侧验证，均已还原：`git diff` 于该档只余原件既有的未提交改动（撤 `STOCK_LINE` 那批），无探针标记残留。

区间一律记作 `[起,止]`（行号，1-based 闭区间）。

#### 1 四条核实结论（设计说 X · 实测 Y · 一致 ∥ 不一致）

| # | 设计说（X） | 实测（Y） | 判定 |
|---|---|---|---|
| ① | 引擎入口 `runDocCheck(root, { docs, mode, docsSource, lines, texts?, zones? })`；两参缺席 ⇒ 与改前逐字相同 | 签名逐字如此。同一两档清单：不带两参与带两参（`texts` 同盘上内容、`zones` = 整档一区）的 `report` **逐字相等**，`hits` 逐字相等 | 一致 |
| ② | 收口面判本批改动区：区外命中不入判集、不计数、不出行；判不出改动区的档不入判集 | 引擎 `partition` 只留区内（两条死引文、一条落在区外 ⇒ `hits.anchors` = 1，区外那条不入 `hits`、不出行）；`zoneTablesOf` 收口腿对 `unknown` 交空表、写段腿不交键；`blocks` 收口支 `unknown` ⇒ false、`region` 区内 true ∥ 区外 false；收口回执只出「不入判集 N 档」那一行（属 §14.3 保留的「没判」明示，不是命中读数） | 一致 |
| ③a | 点在空行：删掉两段之间的空行 ⇒ 单元 = 合并后的整段 | `judgeZones` 交 `[3,6]` = 合并后的整段；真 `touchedRegions` 同一夹具亦交 `[3,6]`；写前门端到端拒写 | 一致 |
| ③b | 点在段内：删掉整段（连同两侧空行）⇒ 前后两段各自完整、无可扩单元 ⇒ 该档交空表、邻段不在区内 | 真 `touchedRegions` 交 `[6,7]` = **后一段**（不是空表）；删掉两侧空行时两段并成一段、交合并段；写前门面（±2 上下文）两侧邻段都进区、端到端拒写（锚 1 条来自后一段） | **不一致** |
| ④ | AC-P3：删空行并段 ⇒ 合并段里的旧死引文拒写；红侧 = 零宽原样交 ⇒ 放行 | 端到端 `REFUSED（锚 2 条）`、零字节；引擎面手交零宽区间表 ⇒ 0 命中、`PASS` | 一致（机制归因见下） |

##### ③b 的复现路径与读数

夹具 = 三段正文，只删中间那一段、A 与 C 之间仍留一行空行；新档里两段各自完整。

- 真 `touchedRegions`（收口/触达面，不加上下文）交 `[6,7]` —— 落在**后一段**上。
- 写前门面（`withContext` 先加 ±2）交两侧邻段，端到端拒写。
- 唯一能交空表的一形 = 删除点两侧都不是段（例如三段空行中间删掉一行），交空表。

依据 `thincoder-core/tools/doc-write-gate.mjs`「for (const run of [around(start - 1), around(end + 1)]) if (run && !picked.includes(run)) picked.push(run)」——零宽点取「紧邻两侧」，删整段时其中一侧必然紧挨着某一整段，因此扩得到单元。

设计那半句（依据 `docs/core/design/DOC-CHECK.md`「无可扩单元 ⇒ 该档交空表，邻段不在区内」）与实测相反；`AC-G10` ∥ `AC-P2` 与它同源，照字面落用例会当场红。

##### ④ 的机制归因（不改变 ④ 的判定，但设计的归因要改）

端到端的拒写由写前门的 ±2 上下文承担，不由零宽扩区承担。

依据 `thincoder-core/tools/doc-write-gate.mjs`「const zones = regions.length === 0 ? [] : judgeZones(newLines, withContext(regions, newLines.length))」——零宽点（宽度为零）到手时已被 ±2 抬成四行区，等于并出来的那段。

实测：把零宽支整块停用后，「母题」「长段落形」两条 `judgeZones` 用例仍绿（落段式自己取到了合并段），只有新补的「零宽支独有行为」转红；端到端亦仍绿。设计 AC-P3 写的红侧（不扩区 ⇒ 本例放行）只在引擎面（手交零宽区间表）成立。

#### 2 补件（改前 ∥ 改后）

改前：无此档。改后：`docs/batches/2026-11-11-gate-silent-when-pass.test.mjs`，五条，只断 AC-P3 所属的零宽语义。

| # | 用例 | 断什么 | 红侧是否实跑过 |
|---|---|---|---|
| 1 | 母题：删空行 ⇒ 两段并成一段 ⇒ 零宽点扩到合并后的整段 | `judgeZones` 交 `[3,6]`，且等于 `paragraphRuns` 的合并段 | 是（停用扩区两步 ⇒ 交空表） |
| 2 | 零宽支的独有行为：区落在两段之间且两段各自完整 ⇒ 两侧段落都进区 | 只含空行的区 ⇒ 两段各一格 | 是（停用整支 ⇒ 只剩空行那一格） |
| 3 | 长段落形：合并段比 ±2 窗口宽，仍整段进区 | 合并段 10 行、点在其内 ⇒ 交 `[3,12]` | 是（同上） |
| 4 | 绿侧：合并段里的旧死引文落在区内 ⇒ 写前门拒写、零字节 | 端到端 `REFUSED`、零字节句、两条旧死引文都进判集 | **否**——由 ±2 上下文承担，停用零宽支仍绿（已在档头注明） |
| 5 | 红侧：零宽定位点原样交 ⇒ 合并段不在区内 ⇒ 放行 | 引擎面 0 命中、`PASS`；扩到合并段则 2 命中 | 本条即 4 的红侧 |

#### 3 读数（命令 + 结果）

```text
node --test docs/batches/2026-11-11-gate-silent-when-pass.test.mjs        ⇒ tests 5 · pass 5 · fail 0
同档红侧（停用零宽 ∥ 只含空行那一支）                                      ⇒ pass 4 · fail 1（转红的是第 2 条）
同档红侧（连分支一起停用，落段式接管）                                     ⇒ pass 2 · fail 3（第 1、2、3 条转红）
node --test test/integration/batch-close-gate.test.mjs                    ⇒ tests 14 · pass 14 · fail 0
node --test test/integration/batch-touched-region-gate.test.mjs           ⇒ tests 2  · pass 2  · fail 0
grep 六串（STOCK_LINE ∥ stockHits ∥ stockCount ∥ pureDeleteStockEntries ∥ survivingLineMap ∥ disclosed）
  于 thincoder-core/**/*.mjs                                              ⇒ 零命中
doc_check({mode:"gate", docs:[DOC-CHECK.md, DOC-DISCIPLINE.md]})          ⇒ 首行 DOC-CHECK GATE: PASS · 0 段有问题（2 档全清）
```

第 2、3 两行是同一红侧的两支：停用「扩区两步」时三条并段类用例全红；只停用整支（让落段式接管）时第 1、3 条仍绿——说明只有第 2 条钉住了那一支，第 1、3 条钉的是「并出来的段进区」这个结果。

#### 4 上抛

1. **[上抛·待裁]** ③b：设计 §2.10.4「点在段内」那半句与实现相反，`AC-G10` ∥ `AC-P2` 同源。本席按父侧令停下、不改设计、不改代码。**按实测读**：删整段时邻段（至少后一段）进区，实际比设计更严（不是放过，是多拦一次）；「交空表」只在删除点两侧都不是段时成立。处置归设计席 ∥ 父席。

2. **[上抛·待裁]** ④ 的归因：AC-P3 的红侧在写前门面跑不出来（±2 上下文先盖住邻行），只在引擎面成立。设计那行要不要改口径，归设计席。

3. **[上抛·知会]** 收口后零宽扩区没有点名看护：本档按头注「收口时随批档一并删除」，而测试面对 `judgeZones` ∥ `paragraphRuns` 零引用。要留永久看护需另落一条集成用例（按「业务场景 ∥ 生产问题」两入口，今天两条都不成立）。

#### 5 审计与评审（轮次与终态）

- **独立分歧审计（explore 子代理）**：`divergence(2)`，两条均 low——① 本轮无 §5 交代（即本段）；② 临时目录残留一支探针（已删）。审计独立复算后判定「设计档 §2.10.4『点内』那半句与其下 `AC-G10` ∥ `AC-P2` 与实现相反，实现一侧不必改」——与本节 ③b 同结论。
- **独立代码评审（advisor · code）第 1 轮**：`VERDICT: pass`，🟡 2 ∥ 🔵 4。处置：🟡#1（母题两条钉不住零宽支）⇒ 补第 2 条用例并实跑红侧；🟡#2（AC-P3 红侧在写前门面成立不了）⇒ 归设计席，已上抛（本节第 2 条）；🔵#3 ∥ #4 ∥ #6 ⇒ 当场改（档头自相矛盾句、夹具开跑先清、`assert.ok` 与消息措辞）；🔵#5 ⇒ 转为本节第 3 条上抛。
- **终态 = clean**：偏离项全部关闭或已明确上抛；生产代码零改动。

### 实施记录 · 重写轮：`doc-check/` 收到三件（父侧 2026-11-12 派单 · 裁① 锚族搬图侧）

**射程**：① `doc-check/` 只判三件事（一段太长 ∥ 拿行号做锚 ∥ 悬空指针）② 锚扫描族整族搬出到图侧 ③ 两个消费者各改各的 import。**不加任何参数 / 读数 / 豁免。**

#### 1 交付五个数（口径 = `countContentLines`，末行换行不计）

| 项 | 读数 |
|---|---|
| `doc-check/` | 改前 **15 档 2513 行** → 改后 **6 档 598 行**（派单给的 2528 是同一批档的另一种计数：每档多算末行空行，15 档差 15 行） |
| 图侧 | 新增 **1 目录 4 档 720 行**（只搬不改）；另有 2 档各改 1–2 行 import |
| `doc_graph` 五条集成用例 | **5 绿 0 红**（`node --test test/integration/doc-anchor-graph.test.mjs` ⇒ tests 5 · pass 5 · fail 0） |
| 需求 AC-1–AC-6 单测 | **6 条 6 绿**（`node --test docs/batches/2026-11-11-gate-silent-when-pass.test.mjs` ⇒ tests 6 · pass 6 · fail 0）；红侧实跑：停用「在途批档清单」那一支 ⇒ AC-6 转红（pass 5 · fail 1） |
| `doc_check` gate 首行 | `DOC-CHECK GATE: PASS`（本席本轮写过的三份 `.md` 逐档 PASS） |

#### 2 留下的 6 档

```text
doc-check/index.mjs      122  引擎：runDocCheck(root,{docs}) / judgeText / hitLine（三判据的装配与报面句子）
doc-check/paragraph.mjs  132  判据① + 结构谓词族（围栏 ∥ 标题 ∥ 列表 ∥ 引用 ∥ 表格 ∥ 码段）——图侧也借这一族
doc-check/doc-tokens.mjs 111  档名 / 扩展名的常量与谓词（判据②③共用）
doc-check/doc-names.mjs   73  类名 ∥ 占位词干：哪些名字不算档名（精度面，不是豁免面）
doc-check/line-refs.mjs   38  判据②：档名 + 冒号 + 数字
doc-check/existence.mjs  122  判据③：仓内找一次 + 在途批档 §2 清单 + 仓外跳过
```

撤除的 9 档：

```text
搬走（图侧 1 目录）  anchors.mjs ∥ graph-tokens.mjs ∥ doc-batch-face.mjs ∥ doc-suffix.mjs
整档删              doc-decl.mjs ∥ exemptions.mjs ∥ per-root.mjs ∥ range-input.mjs ∥ line-reads.mjs ∥ report-blocks.mjs
```

闸口的 `zones` ∥ `texts` ∥ `lines` 三个入参随之退场；`judgeText(text,{file,root})` 是唯一判据入口——读盘的与还没落盘的走同一条。

#### 3 下游（同一笔改动，逐处点名）

```text
tools/doc-write-gate.mjs          311 → 55   判面 = 整份新内容（不剥前后缀、不取改动区、不加 ±2 上下文）
agent-tools/batch-gate.mjs        322 → 174  判域 = 触达账 ∪ 本批 diff ∪ 批档自身；k = 命中数；报面 = 首行 + 逐条命中
agent-tools/batch-gate-hit/judge/report      三档整档删（唯一消费者 = 上一行）
agent-tools/batch-regions.mjs     126 → 31   只留 safeRead ∥ committedDocs（区间表一族随判面收编退役）
agent-tools/batch-tier-gate.mjs               §2 机读清单解析上移 batch-segment-vocab.mjs（两侧共用一份）；countContentLines 移入本档
agent-tools/doc-check.mjs          96 → 76   lines 参数退场
scripts/doc-check.mjs ∥ doc-check-anchors.mjs 整档删（它们包的是已删的旧引擎）
scripts/doc-check-paragraph.mjs ∥ prompt-refs-check.mjs ∥ doc-check-linecounts.mjs  各改 1–2 行 import
advisor/project-context.mjs                   pathKey 改为本档私有（per-root 已整档删）
```

#### 4 两处判据读法（按「判得准才判」取的口径，请父侧裁定）

1. **判据③的候选 = 带目录段的档名**，裸名不判。读数：`docs/core/**` 120 档，按裸名全判 ⇒ 1009 条命中（`BATCH-RECORD.md` 单串 27 条）——裸名没有可找的位置，判它把「本文档的邻居」全算成悬空；只判带目录段的 ⇒ 261 条。
2. **「仓内找一次」= 项目根路径索引一次建成**：`root/token` 命中 ⇒ 在；否则仓内**唯一后缀**命中 ⇒ 在；否则报。读数：261 → 41 条（余下多为真悬空：已删的用例档、示例路径）。不做这一层的话，本仓自己的设计档会被自己的门全数拒掉（`provider/rate.mjs` 这类写法 261 条）。

#### 5 未做 / 做不动的（如实）

1. **集成套件仍有红**：全量 193 条 ⇒ pass 159 · fail 34。其中 **3 条与本事无关**（`anthropic-tool-roundtrip` 的 1-1∥1-2∥1-3：`context overflow: prompt ~108817 tokens · limit 96000`；本批没有加大任何提示面，判为环境/存量，未复跑基线复核）。**31 条是本批的必然后果**，两类：
   - **断言的是已删机制**（`29-4/5/8/9` 跨仓/后缀/腿序；`7-17` ∥ `7-20` 的存量与改动区措辞）——用例还在盘，**未改**，也不是一句改字能绿的；
   - **夹具被整档判**：`14-4/5/10/12/13/14` ∥ `13-4` ∥ `7-3/6/9` 的临时仓批档里写着仓根不存在的路径，旧口径只判改动区、今天判整份 ⇒ 收口被拒。这是「旧债照报」落在夹具上的样子，要做的是逐份夹具清路径，**本轮没做**。
2. **RTM 的同步只做了一半**：删掉的 12 个用例档对应的行已从 `guard.md`（故事 26 ∥ 36 ∥ 38 ∥ 44 ∥ 45 整节 + `7-12∥7-16∥7-19`）、`paths.md`（故事 37 整节 + `29-3…29-9`）、`RTM.md` 索引表（CLI 26∥36∥37∥38∥44∥45）删净；**仍红的那 31 条的 RTM 行没动**。
3. **设计档 / 需求档的路径回指是我的笔外**：`docs/core/design/DOC-GRAPH.md` §2.6 仍说 `checkAnchors` 住在文档机检那一侧（实际已搬到图侧 `thincoder-core/doc-graph/`）；`docs/core/design/DOC-CHECK.md` §7 的落点写「三档」（实际 6 档，多出 `existence` ∥ `doc-names`）。归设计席改指。
4. **`PROJECT-MANIFEST.json` 的两个键仍在盘**（`index.docCheckExcludePaths` ∥ `index.docCheckExemptions`）——机制已删、键还在，归主 agent。
5. **判据②③ 在门面同时生效**：旧口径里行号坐标门内不出现、`report` 面才列；今天它是判据之一，门内照判。与旧 `DOC-DISCIPLINE.md` 条目 W（「门内不出现」）相抵——该条目归设计席。

### 实施记录 · 判据③改「存在性」（父侧 2026-11-12 派单 · 只改这一处）

**射程**：一处判定条件——仓内找档的结局从「唯一后缀才算出」改成「有就算在」。零扩大：判据①的段长、判据②的阈值、报面句子、`report` 面、收口面、31 条红测试一律不动。

#### 1 改前 ∥ 改后（逐字）

```text
改前  if (index.get(pathKey(token)) === 1) continue // 仓内唯一后缀找到 ⇒ 是那一份，不报
改后  if (index.has(pathKey(token))) continue        // 仓内有任一档以它结尾 ⇒ 在，不报（不判唯一）
```

索引面随之收口（计数已无第二个消费者，留着就是「多解」这个概念的钩子）：

```text
pathIndexOf        Map<后缀, 命中档数> → Set<后缀>：`seen.set(suf, (seen.get(suf) ?? 0) + 1)` → `seen.add(suf)`
JSDoc `indexPath`  Map<string,number> → Set<string>
```

「多解 ⇒ 报 / 多解 ⇒ 不确定」这一类分支：doc-check 一族除上面那一处外**零命中**（全族 `grep` `=== 1` ∥ `\.size === 1` ∥ `唯一` 复核，无第二处）。图侧 `thincoder-core/doc-graph/doc-suffix.mjs` 的 `multi` 不是这一类——它只让 `引缺` ∥ `节缺` 不判（多解 ⇒ 存在性通过、内容判据无主语），存在性一侧本来就是「多解算在」，**未动**。

#### 2 仓内重跑（同一探针，两侧各跑一次）

探针 = `runDocCheck(root, { docs: docs/core/** })`，数 `kind == "missing"`。

```text
改前（`=== 1` + 计数 Map）  119 档 ⇒ missing 80
改后（`has` + Set）          119 档 ⇒ missing 74
```

差 6 条，方向 = 变少，与「去掉唯一性约束只会少报」一致。派单里那句「原 41 条」在今天这棵树上复现不出来——41 是重写轮当时的读数，此后档集与判据面都动过；本节只报同一探针同一天的两侧读数。

#### 3 单测（需求 AC-3）

档 = `docs/batches/2026-11-11-gate-silent-when-pass.test.mjs`（一次性；收口随批档删）。四条：两份同名档 ⇒ 在 ∥ 一处也找不到 ⇒ 报（行号与 token 都带上）∥ 根下真有该相对路径 ⇒ 不报（对照，防判据退化成「恒不报」）∥ 回执面：同名不出声、真悬空照出。

```text
node --test docs/batches/2026-11-11-gate-silent-when-pass.test.mjs
  改后                               tests 4 · pass 4 · fail 0
  红侧（`has` 接回 `=== 1` + 计数 Map） tests 4 · pass 2 · fail 2 —— 转红的恰是两条与唯一性有关的用例
  还原后复跑                          tests 4 · pass 4 · fail 0
```

#### 4 回归（两侧同跑，读数逐字相同）

```text
test/integration/doc-write-gate.test.mjs     改前 1 pass / 1 fail    改后 1 pass / 1 fail
test/integration/batch-close-gate.test.mjs   改前 4 pass / 10 fail   改后 4 pass / 10 fail
test/integration/doc-anchor-graph.test.mjs   ——                      5 pass / 0 fail
```

两侧读数逐字相同（同名、同因）⇒ 本笔没有改变任何一条集成用例的结局。那 11 条红先于本笔存在：断言的是已退役的字面（`REFUSED（命中 N 条）` ∥ `✗ 锚·档缺`）与已退役的参数（`{mode, docsSource}`）。按派单「31 条红测试另开一轮」，本笔未动。

#### 5 改到的档

```text
thincoder-core/doc-check/existence.mjs                     判据③那一行 + 索引类型 + 头注与参数注
docs/batches/2026-11-11-gate-silent-when-pass.test.mjs     新建（一次性单测，收口删）
```

`thincoder-core/doc-check/index.mjs` **零改动**：它只把 `pathIndexOf` 的返回当不透明值转交，两侧签名不变；派单点了它是探面，实际没动。

顺带同步一处注释（行为零改）：`existence.mjs` 头注原写「没有后缀兜底」，与代码不符——「找一次」本来就是两形（根下路径在盘 ∥ 仓内有任一档以它结尾）。现改成两形并列，并写上「不判唯一」的理由（仓里几份同名是仓库的状态，不是引用的对错）。

#### 6 漂移与上抛

1. **[上抛·知会]** 设计档 `docs/core/design/DOC-CHECK.md` §3 只写「在项目根下找一次：找到不报，找不到就报」，没写「找」认哪两形。今晚这条裁定把第二形（仓内任一档以 token 结尾、不判唯一）定死了，设计面缺这一句 ⇒ 归设计席补。实现按裁定与代码现状走，设计档未动。
2. **[上抛·知会]** 需求档 AC-3「文中写一个仓内不存在、但形如路径的档名 ⇒ 报」与本笔同向，无需改。

#### 7 审计与代码评审（轮次与终态）

- **独立分歧审计（explore 子代理）**：`divergence(1)`，最高严重度 **low** —— 唯一一条 = 设计档 `docs/core/design/DOC-CHECK.md` §3 不写第二形（「仓内任一档以 token 结尾」），与本节第 6 条第 1 项同一件事（已上抛、未动设计档）。其余五条逐条「符合」：唯一性约束删净 ∥ 无「多解 ⇒ 报/不确定」残留 ∥ 三个消费者都只把索引当不透明值转交 ∥ 注释与行为一致 ∥ 清单外改动只有那一个单测档。审计自注：其工具面无执行面，`node --test` 读数未复跑，记 `unverified`——本席的读数在本节第 3、4 段各实跑过。
- **独立代码评审（advisor · code）第 1 轮**：`VERDICT: pass`，🔴 0 ∥ 🟡 2 ∥ 🔵 4。
  - 🟡#1（设计档不带第二形）＝ 归设计席，已在本节第 6 条上抛，代码不动。
  - 🟡#2（一次性单测随批档删 ⇒ 存在性读法没有永久看护）＝ 协调项，父侧定；本节如实记下这个代价，不自行造永久用例（派单只给了「一次性单测」）。
  - 🔵#3 ∥ #4 ∥ #5 ∥ #6 ⇒ **当场全改**：③ 删掉不可达的豁免谓词（候选恒带目录段 ⇒ `docNames` 对含 `/` 的 token 恒返回 null），并把这句写进候选注 ∥ 单测第 3 条的标题与括注改成它实际断言的事（「恒不报」由第 2 条守）∥ `pathIndexOf` 头注补「读不到的子目录不进索引 ⇒ 该 token 判档缺（误报方向，不记未核标记）」∥ 同头注补「入参须为已 `resolve` 的根（不带尾分隔符）」。

**修正轮读数（命令 + 结果）**：

```text
node --test docs/batches/2026-11-11-gate-silent-when-pass.test.mjs   ⇒ tests 4 · pass 4 · fail 0
同探针仓内重跑（docs/core/**，119 档）                                ⇒ missing 74（与修正前逐字相同 ⇒ 删掉的那一行确是不可达死码）
node --test test/integration/doc-write-gate.test.mjs                 ⇒ 1 pass / 1 fail（与基线同名同因）
node --test test/integration/batch-close-gate.test.mjs               ⇒ 4 pass / 10 fail（与基线同名同因）
```

- **终态 = clean**：审计的 1 条 low 与评审的 2 条 🟡 均已明确处置（前者上抛设计席、后者父侧裁定），4 条 🔵 当场改完；无未处置项。

### 实施记录 · 集成套件清理轮（父侧 2026-11-12 派单 · 只改测试面与 RTM 三份）

**射程**：34 条红按派单判据分三类——「它断言的那个行为今天还该存在吗」：不该存在 ⇒ 删用例 + 删 RTM 行；该存在而只是夹具写错 ⇒ 修夹具；C 类存量（3 条 context overflow）不动。**生产代码零改。**

#### 1 改前读数

```
命令 = node --test "test/integration/*.test.mjs"（44 非浏览器档 + 3 浏览器档）
tests 193 · pass 159 · fail 34
```

#### 2 交付表（逐类）

| 类 | 条目 | 处置 | 依据（实读） |
|---|---|---|---|
| A 删 | 7-15（批档面互引不判）∥ 7-17（引文判）∥ 7-20（存量旧债不入判）∥ 7-22（相对形按引用方目录解） | 用例 + `test/rtm/guard.md` 行各删 | 设计只判三件事；`thincoder-core/doc-check/existence.mjs` 无批档面豁免、无腿序、`../` 与 `/` 开头一律 `continue` |
| A 删 | 29-5 ∥ 29-6 ∥ 29-7 ∥ 29-8 ∥ 29-9 | 用例删（RTM 本无这些行，故 paths.md 零删） | 要求 §3「不做路径解析系统：没有「根」、没有「腿序」、没有「豁免表」」 |
| A 未删 | 13-4 ∥ 29-4 | **保留**，见 §3 披露 | 两条断的行为仍在产（下文点名） |
| B 修夹具 | 14-4 ∥ 14-5 ∥ 14-6 ∥ 14-7 ∥ 14-10 ∥ 14-11 ∥ 14-12 ∥ 14-13 ∥ 14-14 ∥ 13-4 ∥ 27-3 | 三份夹具的 `makeProject` 里把骨架 §2 占位行点名的那份真档落地 | `thincoder-core/agent-tools/batch-skeleton.mjs`「示例行 = \| thincoder-core/agent-tools/batch-tier-gate.mjs \| — \|」；夹具里没这份 ⇒ 整档判时它是悬空指针 ⇒ close 被门拦 |
| B 修夹具 | 7-3 ∥ 7-6 ∥ 7-9 | 7-3/7-6 无（它们本已对）；7-9 的裸档名换成带目录段的悬空路径 | 裸名今天不判（`existence.mjs`「if (!token.includes("/")) continue」） |
| C 改断言形 | 7-2 ∥ 7-5 ∥ 7-7 ∥ 7-13 | `runDocCheck(root,{mode,docsSource})` + `anchorHits/paragraphHits` → `runDocCheck(root,{docs})` + `hits[].kind` | 引擎现签名 `runDocCheck(root, { docs })`，返回形 `{report, verdict, hits, checkFiles, missing, unreadable}` |
| C 改断言形 | 7-3 ∥ 7-5 ∥ 7-6 ∥ 7-8 ∥ 7-9 ∥ 7-13 ∥ 7-14 ∥ 41-1 | 拒面串改成现形 | `batch-gate.mjs` 的 `first` 只有 `DOC-CHECK GATE: REFUSED`／`PASS` 两值（无「命中 N 条」）；命中行 = `<档> <token> 这个档不存在` ∥ `<档> 第 N 段 L 字，超过 300`；写门拒串首行 = `doc_write_gate: 文档机检门拒写` |
| C 删断言 | 7-6 的 `§1（作者：主 agent）` ∥ 7-14 的「判面：改动区 1 区 · 判定区 1 区」 | 两条断言删 | 门今天不产这两种信息（`hitLine` 只给档位与 token；写门拒串无判面行）——删的是已不存在的信息，不是放宽判据 |

#### 3 与派单不同的两处（决策披露）

1. **A 类点名 7 条，实删 5 条**：`13-4` ∥ `29-4` 保留，因为实读发现它们断的行为今天仍在产——
   - `29-4` 断 `thincoder-core/doc-check/existence.mjs`「if (index.has(pathKey(token))) continue // 仓内有任一档以它结尾 ⇒ 在，不报（不判唯一）」，与设计 §3「**「有就行」，不判唯一。**」同源；
   - `13-4` 断 `thincoder-core/agent-tools/batch-closeout.mjs` 的「`\n  新事理由（#${r.id}）：${r.reason}`」，该回执行仍在产。
   两条保留并各有 RTM 行。若父侧仍按原派单要删，请同笔删 `test/rtm/batch-ledger.md` 的 13-4 行与 `test/rtm/paths.md` 的 29-4 行，并说明这两处覆盖由谁接。

2. **补回 2 条常驻用例（占用 `29-3` ∥ `29-4` 号）**：删 29-8 后，「仓外一律不报」（要求 F4 ∥ AC-4）与「同名多处在册算在」在全域没有常驻看护。两条按现判据重写（夹具为 `../` 出仓在盘 ∥ 不在盘、同名两处、带目录段零命中），断言用现在的句子；`test/rtm/paths.md` 同时补 29-3 ∥ 29-4 两行并把节注的「三态」改成「四态」。

#### 4 改后读数

```
node --test（44 非浏览器档）               ⇒ tests 175 · pass 172 · fail 3
node --test test/integration/browser-*.mjs ⇒ tests 9   · pass 9   · fail 0
合计                                       ⇒ tests 184 · pass 181 · fail 3
```

三条红 = C 类存量 `anthropic-tool-roundtrip` 1-1 ∥ 1-2 ∥ 1-3，逐条实读原因 = `context overflow: prompt ~108817 tokens · max_tokens 32000 · window 128000 (limit 96000)`——本批未碰提示面，按父侧「已核，存量」处理，未修未删。

用例数对账：193 − 11（删：7-15 ∥ 7-17 ∥ 7-20 ∥ 7-22 ∥ 旧 29-3…29-9 七条）+ 2（新 29-3 ∥ 29-4）= 184。

浏览器 3 档在全量并发跑里出现过两次 flake（34-1 ∥ 34-3 转红），单跑与分批复跑均 9/9 绿——与本轮改动无关（本轮未碰 browser 用例与其依赖），如实记此一笔。

#### 5 改到的档

```
test/integration/batch-close-gate.test.mjs       A 删 3 + B/C 修 6 + 头注
test/integration/batch-edit-spec-section.test.mjs A 删 7-17
test/integration/doc-write-gate.test.mjs          C 改 7-14 断言 + 头注
test/integration/edit-batch-entry-outcome.test.mjs C 改拒串字面
test/integration/path-resolution.test.mjs         A 删 5 + 新增 29-3 ∥ 29-4 + 头注
test/integration/batch-gates-reanchor.test.mjs    夹具 + 头注
test/integration/batch-ledger-bind.test.mjs       夹具 + 头注
test/integration/batch-status-auto-set.test.mjs   夹具
test/rtm/guard.md                                删 4 行 + 改 6 行 + 节注（十八态 → 十四态、回指改现存 F/AC 与设计 §1/§2/§5/§6）
test/rtm/paths.md                                节注改现存单源 + 补 29-3 ∥ 29-4 两行
test/RTM.md                                      索引 CLI 48 标题逐字对齐分册 H2
```

#### 6 审计与代码评审（轮次与终态）

- **独立分歧审计（explore 子代理）**：`divergence(4)` —— ① medium：删 29-8 后 F4/AC-4 无常驻看护（→ 按 §3 第 2 点补回）；② medium：`test/rtm/paths.md` 节注仍指已退役的解析章节且「三态」与两行不符（→ 已改）；③ low：`guard.md` 48-1 断的「证据格」机制在 `thincoder-core/**` 零命中，但 `docs/core/design/BATCH-RECORD.md` §4.22 仍写成活规范（→ 两处权威互斥，归父侧裁，本席未动）；④ low：`batch-close-gate.test.mjs` 探针注仍以「批档面互引不判」为由（→ 已改成现由）。
- **独立代码评审（advisor · code）第 1 轮**：`VERDICT: pass`（🟡 7 ∥ 🔵 3）。处置：🟡#3（索引 48 标题留「只列读数」）⇒ 已改；🟡#5 ∥ #6（两份用例头注指 `DOC-DISCIPLINE.md §3.18/§3.20/§3.26/§5 A-DD40` 与需求 `F14/AC-12`，四处都已不在盘）⇒ 已改成现存单源（设计 §1/§2/§5/§6、需求 F1/F3/AC-1/AC-3）；🔵#8–#10（三份头注把判据原文指到索引档 `test/RTM.md 第 N 节`）⇒ 已改指分册；🟡#1 ∥ #2（13-4 ∥ 29-4 未删）⇒ 即 §3 第 1 条披露；🟡#4（guard.md 47-1 ∥ 48-1 证据格是目录、盘上无用例档而索引标「有」）⇒ 上抛第 1 条；🟡#7（本轮读数无落档单源）⇒ 由本节第 1、4 段补上。
- **终态 = clean**：审计 4 条与评审 10 条全部「已改」或「已明确上抛」，无未处置项。

#### 7 上抛

1. **[上抛·待裁]** `test/rtm/guard.md` 的 47-1 ∥ 48-1 两行证据格写 `test/integration/`（括注「用例档落地归另一轮」），盘上无该族用例档（`test/**` 内搜 `CLI 47` ∥ `CLI 48` 只命中两 md），而 `test/RTM.md` 端覆盖矩阵把 CLI 47 ∥ CLI 48 的 CLI 列标成 `有`。要么补用例档并把证据格写成真档名，要么把矩阵改回 `待补`／`缺` 并在「异常与更正」记一笔。
2. **[上抛·待裁]** 故事 48 断的「证据格」机制已不在实现里（`thincoder-core/**` 对 `证据格` 零命中），而 `docs/core/design/BATCH-RECORD.md` §4.22 仍把它写成活规范——两处权威互斥，这一故事的去留归父侧。
3. **[上抛·知会]** 本轮之前没有本轮的读数与分类落档（对本文搜「清理集成测试」∥「34 条红」∥「删用例」∥「修夹具」零命中）；本节第 1、2、4 段把改前/改后读数与逐类分类补上了。

### 实施记录 · 收尾轮：RTM 两处裁定（父侧 2026-11-12 派单 · 两件）

**射程**：只动测试面两份 md（`test/RTM.md` ∥ `test/rtm/guard.md`）。生产代码零改，套件零改。

#### 1 两件裁定 → 落点（逐件）

| # | 裁定（父侧要旨） | 落点 | 改前 → 改后 |
|---|---|---|---|
| ① | `47-1` ∥ `48-1` 证据格写目录、盘上无用例档，矩阵却标 `有` ⇒ 改 `待补` + 记一笔「异常与更正」 | `test/RTM.md` 的 `CLI 47` 索引行 ∥「异常与更正」；`test/rtm/guard.md` 的 `47-1` 证据格 | `guard` 列 `有` → `待补`；证据格 `test/integration/`（用例档落地归另一轮） → `未落（用例待补）`；新增 `A-1` 行；导读句「现无异常记录」删（已不成立） |
| ② | 故事 48 断的「证据格」机制在 `thincoder-core/**` 零命中 ⇒ 故事 48 删（连同用例行）；`BATCH-RECORD.md` §4.22 归设计席 | `test/rtm/guard.md` 的 `## CLI 48.` 整节（目的 ∥ 节注 ∥ 表头 ∥ `48-1` 行）；`test/RTM.md` 的 `CLI 48` 索引行 | 整节删 ∥ 整行删；索引 `CLI 47` 之后直接 `CLI 49`，号不复用 |

**形对齐**：`待补` 的定义与证据格字面值单源 = `docs/core/design/TESTING.md` §11.18.1 ∥ §11.3；`47-1` 的异常格首格补 `A-1`（§11.18.5「行的异常格写异常编号」）。`A-1` 的再测结果格写的是「未补测 + 无可复跑对象」，不是计划（评审 🔵#2 的处置）。

#### 2 读数（命令 + 结果）

```text
node --test --test-reporter=tap "test/integration/*.test.mjs"
  ⇒ tests 184 · pass 181 · fail 3
  三条红 = CLI 1-1 ∥ 1-2 ∥ 1-3（anthropic-tool-roundtrip），同因逐条实读：
  context overflow: prompt ~108817 tokens · max_tokens 32000 · window 128000 (limit 96000)
grep `CLI 48|48-1` 于 test/**（.md ∥ .mjs）                    ⇒ 0 命中（删净）
grep `CLI 47` 于 test/integration/**                            ⇒ 0 命中（`待补` 是真话，不是假绿）
doc_check({mode:"gate", docs:[test/RTM.md, test/rtm/guard.md]}) ⇒ 首行 DOC-CHECK GATE: PASS · 0 段有问题（2 档全清）
```

#### 3 审计与评审（轮次与终态）

- **独立分歧审计（explore）**：`divergence(1)`，low —— `47-1` 的异常格没有异常编号（审计自注：该格散文先于本轮存在）。已按 §11.18.5 补 `A-1` 首格。
- **独立代码评审（advisor · code）第 1 轮**：`VERDICT: pass`（🟡 1 ∥ 🔵 3）。处置：🟡#1（`BATCH-RECORD.md` §4.22 仍要求落 `48-1` ∥ `CLI 48` 两处）= 设计席笔域、父侧已认领派单，本席只点名（下 §4 第 1 条）；🔵#2（再测结果格装了计划而非结果）⇒ 当场改；🔵#3（删故事 48 在两档零痕迹）⇒ 不落新行：删除的痕迹在 git 提交里，RTM 不另记沿革；🔵#4（严重程度记 `中`）⇒ 保留，本缺陷是记录面假绿、无用户可见行为，`中` 是记录面一档的取值。
- **终态 = clean**（🟡 已上抛，🔵 两条当场处置、两条如实保留并写明理由）。

#### 4 上抛

1. **[上抛·待裁]** `docs/core/design/BATCH-RECORD.md` §4.22 仍写「**缺 = 1 行**，号 = **`48-1`**」与「落地两处：`test/rtm/guard.md` 的 `48-1` 行 + `test/RTM.md` 故事索引表的 `CLI 48` 一行」——两处现盘都不存在。设计席同步后该面互斥才消。
2. **[上抛·待裁]** `thincoder-core/tool-docs/batch.md` 仍把已死的证据格豁免写成活规范。依据 `thincoder-core/tool-docs/batch.md`「A hit inside an evidence cell that only fails existence still lets the write land: the receipt lists it as a pointer reading, not as a refusal」——代码面对 `证据格` ∥ `pointerCell` 零命中，故父侧原前提「`thincoder-core/**` 零命中」对代码面成立、对产品描述面不成立。修不修归父侧。
3. **[上抛·知会]** `docs/core/design/TESTING.md` §11.18.8 的「| guard | CLI 7 · CLI 12 · CLI 26 · CLI 36 |」与盘上该册（guard 现 = 7 · 12 · 47）不符——设计席笔域，本轮未动。

### 实施记录 · 产品面三笔（父侧 2026-11-12 三轮派单连做 · ②③ 由同一条判据带出）

**射程**（父侧三次派单，同一轮落）：① `tool-docs/batch.md` 删「证据格豁免」那段 + 从 `manifest-schema.mjs` 摘掉 `index.docCheckExemptions` · ② `tool-docs/doc_check.md` 整档重写（对着 `doc-check/` 六档与设计档写）+ 四份提示词补「豁免」说明 · ③ 批档整份不判悬空（代码 + 设计档 §3 + 需求 F6/AC-7 + 工具描述 + RTM/用例）。

#### 1 交付表（逐条 · 父侧每一条都点名）

| # | 条目 | 状态 | 落点 |
|---|---|---|---|
| ① | 删 `batch.md` 里教「证据格豁免」的段落 | ✅ | `A hit inside an evidence cell that only fails existence still lets the write land…` 整段删净（`pointer reading` 该档 0 命中）；同节其余仍教已死引擎的句子一并按现状重写（见 §3 清单外改动） |
| ① | `index.docCheckExemptions` 从 schema 摘掉 | ✅ | 键 ∥ 上方注释 ∥ `validateManifest` 里两行注释块删净；`docCheckExcludePaths` ∥ `docCheckExts` 按令未动 |
| ② | `doc_check.md` 整档重写（61 → 50 行） | ✅ | 三判据 ∥ 两条→三条不报（仓外 ∥ 在途批档 §2 机读清单 ∥ 批档整份）∥ 报面三句逐字 ∥ `target`/`mode`/`docs` 三参 ∥ `不在盘，未判` 假绿防线；旧引擎的 `节缺`/`引缺`/`环引`/腿序/`texts`/`zones`/豁免表/定根全数退场 |
| ② | 四份提示词补豁免（内容照父侧原文） | ✅ | `persona-eng-coder` ∥ `persona-eng-designer` ∥ `discipline-engineering` ∥ `persona-engineering`（末一份无该句 ⇒ 在它讲 `doc_check` 那段补同义句）；同一句另在 `advisor-design` ∥ `advisor-round2` ∥ `advisor-round3` 三份里同形更新（清单外，见 §3） |
| ③ | 批档整份不判悬空 | ✅ | `existence.mjs` 新增 `isBatchFace(abs, root)`（批档根与在途批档的家同取 `batchDirs` 一处）；`index.mjs` 的 `judgeText` 对批档面跳过判据 ③，段长 ∥ 行号锚照判 |
| ③ | 设计档 §3 加一句 + 为什么 | ✅ | `docs/core/design/DOC-CHECK.md`「第二个例外：批档整份不判悬空」 |
| ③ | 需求档 F5 后补 F6 | ✅ | `docs/core/requirements/DOC-CHECK.md` F6；另补 AC-7（F6 的验收行，否则该功能点不可验） |
| ③ | `tool-docs/doc_check.md` 两情形 → 三情形 | ✅ | `Three cases are not reported at all` + `**A batch record, whole**` 一条 |

#### 2 决策披露（与派单不同／超出派单）

1. **「照贴」的那句提示词拆成三行**：父侧给的整句单行 = 434 字，而提示词面判据是**逐行**、阈值 300（`paragraph.mjs` 的 `isPromptFace` + `PARAGRAPH_MAX`）。原句一字未改，只按续行拆开（135 / 115 / 142 / 122 字）。字面判据「`档缺` 那一行同时提到两个不报情形」因此落成**条目级**（本行 + 紧邻续行），单行级读数为 false——见 §4 读数。
2. **重写 `batch.md` 的整个「Document-check gate」小节**：派单只点了「证据格豁免」一段，但同节另外四处也在教已死引擎（`档缺`/`节缺`/`引缺` 三类 ∥ `环引` 行 ∥ 「区外命中出一行计数」∥ 「change region，只有前两处能拒」），且新规则下「批档里一处死引文拒一次无关编辑」永不发生。按现状重写（三判据、整份判、writer/close 两个判域、回执形、`ERROR` 面、批档豁免、在途清单）。
3. **`manifest.md` 两个「无消费面」的键改了口径**：`docCheckExcludePaths` ∥ `docCheckExts` 在 `thincoder-core/**` 里**零运行时读者**（只有 schema 校验与注释）。父侧原话说「`doc-tokens.mjs` 与 `doc-graph/anchors.mjs` 还在读它」——实测两处都只是注释提法。**键按令未动**，只把工具描述里「wrong ⇒ …」那种承诺效果的后果句改成现状（「no check reads it today」）。同一行 `publicRepos` 的「未声明 ⇒ 指针判档缺、交付门失败」也随新引擎失效，改成「不在可搜可引的清单里」。
4. **`batch-gate.mjs` 的 `范围 N 档` 改成只数真判过的档、并把未判的档逐行点名**（评审第 2 轮 🟡 必改项）：原 `count = docs.length` 把「不在盘／读不到」的档算进范围，且 `noteLines` 在成功回执里根本不打印——重写后的 `batch.md` 那句话就成了空头承诺（正是本门自己禁的假绿）。改法取「修代码」而不是「改文案」：`count: judged` + 回执附 `unjudged` 行。
5. **`batchDirs` 区分「显式 `null`」与「缺键」**：`docRoot.batches: null`（「本面无」的合法哨兵）此前同样回落 `docs/batches` ⇒ 一个自称没有批档面的项目仍拿到悬空豁免。现在显式 `null` ⇒ 空集，`doc_check.md` 同句写明。
6. **`design/DOC-CHECK.md` §7 落点**顺手改准（原写「三档」，实际判据 ③ 与两条例外住 `existence.mjs`）。
7. **设计档 ∥ 需求档两档是本席落笔**：按 D1，那是 eng-designer ∥ 主 agent 的笔域；父侧本轮明令「① ② ③ 三处同笔，别只改代码」，故照令落笔并在本表点名。

#### 3 清单外改动（逐档 + 理由）

```text
thincoder-core/tool-docs/manifest.md        两个无消费面键与 publicRepos 的后果句改真（派单判据域 grep 逼出）
thincoder-core/agent-tools/manifest.mjs     头注「17 个可写节点 / index 八子键」→ 16 / 七（摘键后计数必须跟，D3）
thincoder-core/agent-tools/batch-gate.mjs   count 只数真判过的 + 回执附「未判」行（§2 第 4 条）
thincoder-core/prompts/{advisor-design,advisor-round2,advisor-round3}.md  同一句「Doc names」同形更新（同一规则同一层，D11）
thincoder-core/prompts/persona-engineering.md 无该句 ⇒ 在 doc_check 段补（父侧预留的口子）
test/integration/batch-close-gate.test.mjs  CLI 7-6 ∥ 7-8 由「拒」改判为「放行」+ 7-6 补设计档对照面（新规则直接推翻旧断言）
test/rtm/guard.md                           7-6 ∥ 7-8 行改判 + 节注回指改 F6 ∥ AC-7
docs/core/design/DOC-CHECK.md §3 ∥ §7       父侧点名的同步面 + 落点改准
docs/core/requirements/DOC-CHECK.md         父侧点名的 F6 + AC-7
```

#### 4 读数（命令 + 结果 · 每条都有红侧）

```text
node --check  index.mjs ∥ existence.mjs ∥ manifest-schema.mjs ∥ agent-tools/manifest.mjs ∥ batch-gate.mjs  ⇒ 5 档全过
grep docCheckExemptions 于 thincoder-core/**（全后缀）                                  ⇒ 0 命中
grep 证据格 于 tool-docs/batch.md（改前改后同值=0，该档是英文）∥ pointer reading（改前 1 → 改后 0）  ⇒ 红侧实读
grep plannedPathsOf ∥ §2 机读清单 于 tool-docs/doc_check.md                            ⇒ 各 1 处命中
四份提示词「档缺」条目级三情形：persona-eng-coder:49 ∥ persona-eng-designer:127
  ∥ discipline-engineering:380 ∥ persona-engineering:416                              ⇒ 三情形全在；单行级 false（见 §2 第 1 条）
```

夹具实跑（repo 引擎直调，两端都跑，跑完删临时目录）：

```text
A 批档 §2 写「docs/missing/ghost.md 这份档不存在」      ⇒ PASS · 0 命中
B 同一句搬进设计档 ∥ 需求档                            ⇒ REFUSED · missing 各 1 条
C 批档同时含 320 字段                                 ⇒ REFUSED · paragraph 1 条（三判据里只有 ③ 对面豁免）
D docRoot.batches = null 的批档 ∥ 设计档               ⇒ 两侧都报（显式「本面无」不再回落约定目录）
E 无 manifest（约定 docs/batches）                     ⇒ 批档面照免、设计档照判
F 在途批档 §2 清单点名 docs/planned/new.md             ⇒ 该条不报，区外那条照报
G 同一夹具把 §1 改「已收口」                            ⇒ 清单豁免失效，那一档立刻回到「找不到就报」
H batch-gate 回执（触达账含一份不存在的档）             ⇒ 「范围 2 档」+ 换行「docs/design/gone.md 不在盘，未判」
```

```text
node --test "test/integration/*.test.mjs"  ⇒ tests 184 · pass 181 · fail 3
  三条红 = CLI 1-1 ∥ 1-2 ∥ 1-3（anthropic-tool-roundtrip 的 context overflow，先于本笔存在，同因）
doc_check 于本轮写过的 13 份 .md（repo 引擎直调）        ⇒ PASS · 13 档 · 0 命中
doc_check(mode:"gate")（会话在跑的 CLI）              ⇒ DOC-CHECK GATE: PASS · 13 档全清
```

**一条读者须知**：本会话在跑的 `doc_check` 工具是**进程启动时载入的旧引擎**（回执里带 `后缀兜底读数` ∥ `批档面互引未判` ∥ `行太长` 三样东西在现盘代码里都不存在），所以工具面读数只当「文字太长」那一条的旁证；上表 A–H 与 13 档判都是**直调现盘引擎**取的。要让使用者看到新行为与新的工具描述，需重启会话。

#### 5 审计与评审（轮次 + 终态）

- **独立分歧审计（explore 子代理）**：`divergence(3)` —— 三行 DOC-DRIFT（`MANIFEST.md` 8 处 ∥ `CROSS-REPO-WRITE.md` AC-6 ∥ `ENGINEERING-MODE-V2-SPEC-MANIFEST.md`），最高 **medium**；四类其余三类零命中。处置：**三行都在设计/需求席笔域，本席不改**，见 §6 上抛 1。
- **独立代码评审（advisor · code）第 1 轮**：`changes-required`（🔴 4 ∥ 🟡 5 ∥ 🔵 2）。🔴 四条 = `batch.md` 整节死引擎（→ 按现状重写）∥ 两份提示词「Two cases」（→ 改三条）∥ `manifest.md` 两个死键（→ 改口径）。🟡 五条 = `publicRepos` 后果句 ∥ schema 注释指不存在的 §2.6/§2.7 ∥ `batchDirs` 的 `null` 回落 ∥ 豁免只在 `doc_check.md` 出现 ∥ F5/AC-6 无永久用例。**除最后一条外全部当场改完**（最后一条 = 测试面，归父侧，见 §6 上抛 2）。
- **第 2 轮复核**：全部前轮 🔴 已修；新开一条 🟡 必改（`batch.md` 的「N = 真判过的档、未判的逐行点名」与 `gateReceiptLine` 不符）⇒ 改代码落地（§2 第 4 条），未改文案。
- **第 3 轮复核**：`VERDICT: pass`（前轮 🔴 0 残留；🟡 1 条 advisory + 🔵 2 条；无新 🔴）。
- **终态 = clean**：🔴 与必改 🟡 全关闭；advisory 🟡 1（F5/AC-6 无永久用例）与 🔵 2（`isBatchFace` 逐档读 manifest ∥ `declaration.mjs` 一条陈旧注释）如实留档，前者上抛。

#### 6 上抛

1. **[上抛·待裁]** 设计/需求席三档仍按旧口径记事，与本笔互斥：`docs/core/design/MANIFEST.md` 8 处（`docCheckExemptions` 当活键、`17 个可写节点`、`AC-K2`/`AC-47`）∥ `docs/core/design/CROSS-REPO-WRITE.md` `AC-6`（写明 `manifest.md` 含 `17 writable nodes` 与 `index's 8 sub-keys`——本轮已改 16 / 7，该验收行改后必红）∥ `docs/core/requirements/ENGINEERING-MODE-V2-SPEC-MANIFEST.md`（`index.*` 八子键）。同批同步，否则明天读档的人拿到的是旧数。
2. **[上抛·待裁]** `test/**`：F5（在途 §2 清单豁免）与 F6（批档整份不判悬空）都还没有常驻用例——F6 的两条落在 `batch-close-gate.test.mjs` 7-6 ∥ 7-8（本轮改判），F5 零覆盖；需求 AC-6 明写「夹具两次：批在飞 ∥ 批已收口」。要不要补、补在哪一册，归父侧定。本轮的 F5 读数只有夹具（§4 F/G 两行）。
3. **[上抛·知会]** `thincoder-core/declaration.mjs` 一条陈旧注释：「第三个消费面 = `doc_check` 的排除面（`index.docCheckExcludePaths`——机制见 `docs/core/design/DOC-CHECK.md` §2.6）」——该消费面与 §2.6 都不存在（评审第 3 轮 🔵）。

#### 7 追加：`doc_check.md` 读数面复核 + 全仓「拆档/档位」普查（父侧第四笔）

**射程**：零生产代码改动。核 `doc_check.md` 有没有残留教「`lines` ∥ 拆档 ∥ 档位线」的字，再把 `prompts/*.md` ∥ `tool-docs/*.md` 两份模型可见面扫一遍——**只报不删**（派单明令）。

**① `doc_check.md` 的命中数（改前 = `git show HEAD:`，改后 = 盘上）**

```text
参数名形（带反引号）  `lines` 2 → 0 · `texts` 1 → 0 · `zones` 1 → 0
其余字面形            "hard line" 1 → 0 · "soft line" 1 → 0 · "split" 2 → 0 · 拆档 0 → 0 · 档位 0 → 0
裸词 "lines"          6 → 3（三处都是「正文的行」：paragraph 的 body lines ∥ quote lines ∥
                      「not only the lines this round touched」——与已退役的参数无关）
改前 72 行 → 改后 52 行
```

**② 普查出处（单源 = `docs/core/design/DOC-GRAPH.md` §3「行数档位口径」给的那条检索式）**

```text
(500|800|650) ∧ (行数|长度|lines?|file size) 于 prompts/*.md ∥ tool-docs/*.md  ⇒ 1 条命中
  thincoder-core/prompts/advisor-design.md 第 46 行
  「The function tier is the first criterion: a file ≤500 lines containing a 300+ line single function is still non-compliant.」
```

**③ 与派单前提相反的一条实测（须上报，本席未动一字）**

派单说「那条拆档阈值今晚随 DOC-DISCIPLINE 的验收节一起被砍掉了，**盘上无出处**」。**实测有出处，而且是活的**：

```text
docs/core/design/DOC-GRAPH.md §3「行数档位口径」（该档 597 行，本节完整）
  「① 设计时判一次 = 500（设计器判；判的是改代码前的长度）」
  「过 500（> 500）⇒ 必须给分拆方案，且分拆在本批内实施」
  「② 收口时判一次 = 800（收口检查判代码长短；另外判一条记录缺件）」
  「③ 判定时点只有两个，中间一概不判」
```

所以隔壁「全仓找不到依据」不是规则没了，而是**取数的那条路没了**——`doc_check` 的 `lines` 面随重写退场，而两处模型可见文本还在叫模型去用它：

```text
thincoder-core/prompts/persona-eng-designer.md 第 112 行
  「take the lengths first with `doc_check` (`mode:"report"`, `lines:` over this batch's
   source/test files) and paste its reading line into batch record §2」
thincoder-core/prompts/discipline-engineering.md 第 434 行（D15）
  「a line count is reported by `doc_check`, and a line count taken any other way is
   **not "another convention" but a different decoding standard**」
```

模型照这两句去调，拿不到读数（参数已不存在），于是「找不到依据 ⇒ 不执行」——**与用户报的现场同形**。这两句不在本批射程，本席只报不改；处置归父侧裁：要么给 `doc_check` 加回读数面，要么把这两句改成现存出处 + 现存的取数办法。

**④ 其余带「拆档/tier」字样的命中（过一遍，判定无冲突）**

- `advisor-design.md` 的 41–44 行 ∥ `persona-eng-designer.md` 的 180–181 行：只写「把长度结论写进档、不写数字」，档位语义指回 `DOC-GRAPH.md` §3——指对了，本体不重复数字。
- `discipline-normal.md` 的 78 ∥ 81–82 ∥ 99–105 行：普通模式的函数级 ∥ 模块边界规则（≈100 行该拆、≥300 行函数是债、file caps 是 fallback 不是目标），与 §3 的两条线不是同一对象，也不报 500/800。
- 其余 `split` ∥ `tier` 命中全是无关语义：拆探针串 ∥ 工作分层 ∥ 仓拆分 ∥ 文本分段。

**⑤ 本笔的一次自我拒绝（如实记）**：本节首次 append 被门拒（一条段长 + 三处 `档名:行号` 形），一个字节未落盘；按门给的出路拆成条目、把坐标改成「档名 的 N–M 行」后复投落地。

### 实施记录 · 提示词两处「叫模型用已退役参数」修正轮（父侧 2026-11-12 派单 · 两处 + 一条判据）

**射程**：两处提示词。不给 `doc_check` 加回 `lines`；不动 `advisor-design.md` 的 ≤500 档位规则；不动其他提示词；零代码改动（两个 `.md`）。

#### 1 改前 ∥ 改后（逐字）

```text
persona-eng-designer.md 行 112（同一行内）
改前  **A tier conclusion is not a conclusion without its reading**: take the lengths first with `doc_check` (`mode:"report"`, `lines:` over this batch's source/test files) and paste its reading line into batch record §2;
改后  **A tier conclusion is not a conclusion without its reading**: count the lines yourself — a one-liner over the file, or read it and check the end — before deciding a tier, and paste that reading line into batch record §2;

discipline-engineering.md 行 435（D15 第二句）
改前  Two rulers carry this project — `doc_check` for length-type readings, a `node` line scan ∥ the built-in `grep` for text-type readings.
改后  Two rulers carry this project — a node line scan for length-type readings, and the built-in `grep` for text-type readings.

discipline-engineering.md 行 434（D15 首句 · 清单外连带，见下）
改前  a line count is reported by `doc_check`, and a line count taken any other way is …
改后  a line count is reported by a node line scan, and a line count taken any other way is …
```

**唯一一处非逐字承接**：父侧给的替换文本止于「before deciding a tier」，而原句尾「and paste **its** reading line into batch record §2」在删掉 `doc_check` 后半句失去先行词，故「its」改成「that」。语义与字数零改。

**434 首句为什么一并改**：D15 若只改 435，434 仍写「a line count is reported by `doc_check`」⇒ 一条纪律里并存两把尺，正是 D15 自己禁止的形态。改法照父侧裁定（换的只是「哪把尺」），规则本体（一种读数一把尺、两种尺读数不可比）一字未动。

#### 2 判据读数

```text
node 行扫描（fs.readFileSync + split("\n")，逐行 includes "lines:"）于 thincoder-core/prompts/**
  ⇒ 2 处，均子串误命中：
       discipline-engineering.md:362  「…maintained by discipline. Seventeen doc-update disciplines:」
       persona-engineering.md:379     「…two verbatim lines: what it said before…」
  参数形（反引号 `lines:`）                        ⇒ 0 处
  `doc_check` 与「line count ∥ length」同句         ⇒ 0 处（改前该形 = 2 处）
内置 grep `lines:` 于 thincoder-core/prompts/*.md  ⇒ 2 处（同上两条；两把尺读数一致）
本轮改过的 2 档，现盘引擎直调 runDocCheck(root,{docs})  ⇒ PASS · 0 命中
doc_check(mode:"gate", docs:[两档])                ⇒ 首行 DOC-CHECK GATE: PASS
逐行长度（node 扫描，阈值 300，prompt 面逐行判）      ⇒ 0 行越线（档长 206 行 ∥ 469 行）
```

红侧：改前 `persona-eng-designer.md` 行 112 逐字含 `` `lines:` `` 参数形（本轮首次读盘时所见），改后 0；把那半句接回 ⇒ 该读数 +1。

#### 3 审计与评审（轮次 + 终态）

- **独立分歧审计（explore 子代理）**：`divergence(4)`，最高 **low**。一致项 4 类（两处落笔逐字 ∥ 不再叫模型用死参数 ∥ D15 规则本体零删 ∥ 同族 `advisor-design.md` 的 ≤500 规则未被误动）。三条 low：① 434 首句属清单外连带（已在本节披露）∥ ② 行 112 之后两行续行不在父侧给的文本里（本轮首次读盘即在盘，非本笔引入）∥ ③ D15 的 why 句与「命令尺」相反（已上抛）。
- **独立代码评审（advisor · code）第 1 轮**：`changes-required`（🔴 0 ∥ 🟡 2 ∥ 🔵 2）。
  - 🟡#1（必改）：改后句子给了两种取法（「a one-liner over the file」∥「read it and check the end」），而 D15 只认一把尺；本仓收口面的尺是 `countContentLines`（末行换行不计），边界 500 / 501 处两法可差 1。**处置 = 不落笔**：这两句是父侧逐字给的内容，改写等于替父侧定稿；改法一行、已上抛（本节第 4 条第 1 项）。
  - 🟡#2：`docs/core/design/DOC-GRAPH.md` 行 429 仍写明法 = `doc_check(mode:"report", lines:[…])`，而同档第 3 项把档位语义指到那一节 ⇒ 死参数在下一层照旧；同族设计档另五处。**归设计席，本笔未动**，已上抛。
  - 🔵#3（改后句丢了被量对象：旧文「over this batch's source/test files」）∥ 🔵#4（D15 末句「关于量法的讨论当轮带一个读数」与 D12「规范面不载绝对读数」互指）：均并入第 1 条上抛的一项里，本笔不改父侧给的文字。
- **终态 = stalled**：1 条必改未落（内容是父侧逐字给定，改写非本席授权），已连同改法上抛；其余 🔴 0、无未披露项。

#### 4 上抛

1. **[上抛·待裁]** 尺的口径未钉。父侧给的句子给了两种取法（「a one-liner over the file」∥「read it and check the end」），而本仓收口面唯一的长度尺是 `countContentLines`，依据 `thincoder-core/agent-tools/batch-tier-gate.mjs`「/** 内容行数（末行换行不计）——本档是它唯一的消费面，量法随消费面走。 */」。两种取法在 500 / 501 边界上可差 1（`split("\n").length` 对以换行结尾的档多算 1；`wc -l` 对末行无换行的档少算 1）。**本席未改父侧文字**。若定改，建议一行落法：在现有句后补「over this batch's source/test files — content lines, the trailing newline not counted」并把取法收成一种。
2. **[上抛·待裁]** 死参数在下一层照旧：`docs/core/design/DOC-GRAPH.md` 行 429「**量法**：`doc_check(mode:"report", lines:[…])` 的逐档读数——同一个数只从这一把尺取。」，而 `persona-eng-designer.md` 第 3 项把档位语义指到该节（`docs/core/design/DOC-GRAPH.md` §3「行数档位口径」）。同形另见 `AGENT-LOOP-SUBAGENT.md` 两处 ∥ `MULTI-INSTANCE-COLLAB.md` 一处 ∥ `PROMPT-SYSTEM.md` 两处 ∥ `TOOL-PARAM-ZERO-DEFAULTS.md` 一处（node 行扫描读数，见本节第 2 段同一把尺）。设计档归设计席，本笔一字未动。
3. **[上抛·待裁]** `discipline-engineering.md` D15 的 why 句「A ruler left in a script has to be remembered; built into the tool it sits in the hand.」——尺已不再是内建工具，这句理据与被它解释的尺相反。改不改归父侧（本笔按「只改两处」未动）。
4. **[上抛·知会]** 行 112 之后的两行续行（「the design document carries the conclusion only…」∥「**No reading line in §2 ⇒ the delivery is not complete**…」）不属本笔：本轮首次读盘时它们已在盘。审计因无提交边界记 `unverified`，此处以本席读盘记录澄清归属。

### 实施记录 · 提示词两处「去某份档里查档位口径」→ 自带数字（父侧 2026-11-12 派单 · 两处 + 一条判据）

**射程**：两处提示词句（产品面）。不动 `docs/core/design/DOC-GRAPH.md`；不新增任何仓内路径引用；零代码改动。

#### 1 交付（逐字）

```text
persona-eng-designer.md 设计档 9 项之 3（旧 1 行 → 新 3 行）
改前  The tier's semantics — where the line sits, which point judges it, what crosses it — have one home: `docs/core/design/DOC-GRAPH.md` §3「行数档位口径」; this item restates none of it.
改后  Three lines, and they are the rule itself — nothing to go and read elsewhere: a source or test file over 500 lines before the change ⇒
      the design carries a split plan that lands inside this batch; over 800 lines at closeout ⇒ split first, a plan alone does not close it;
      a single function of 300 lines or more is non-compliant however long the file is.

advisor-design.md 第 8 条判据（旧 2 行 → 新 1 行）
改前  **Any file over the design-time line must carry a split plan in the design.** Which line, which point judges it, and the basis (the length **before** the code change) have one home: `docs/core/design/DOC-GRAPH.md` §3「行数档位口径」.
      This criterion restates none of it and adds no judgment point of its own.
改后  **Any file over 500 lines before the change must carry a split plan in the design.** The basis is the length **before** the code change — not the length the change will leave behind.
```

#### 2 与「逐字照贴」的一处必要偏离（披露）

- **为什么非偏离不可**：父侧给的 persona 句是单行，实测 359 字符；提示词面按行判、阈值 300。
- **判据出处**：`thincoder-core/doc-check/paragraph.mjs`「提示词面（`thincoder-core/prompts/`）每行自成一界——那里的换行排的是版式，不是分段」＋ `PARAGRAPH_MAX = 300`。
- **不处置的后果**：单行照贴 ⇒ 门判「文字太长」⇒ 收口面 REFUSED。
- **处置**：按本档 §5 上一轮同一情形的先例（「照贴」句拆行、原句一字未改）折成三行，只在两个空格处换成换行。
- **字数核**：三行 trim 后以单空格拼回，与父侧文本逐字相等（`===` 为 true）；字符顺序一字未动。

红侧实跑（同一条判据，两种形）：

```text
paragraphHits(单行形, {promptFace:true})     ⇒ [{"line":1,"len":359}]   红
paragraphHits(交付三行形, {promptFace:true}) ⇒ []                       绿
```

#### 3 判据读数（命令 + 结果）

```text
grep DOC-GRAPH 于 thincoder-core/prompts/**            改前 2 → 改后 0
grep \b500\b 于 persona-eng-designer.md               改前 0 → 改后 1（判据「各至少一处」达标）
grep \b800\b 于 persona-eng-designer.md               改前 0 → 改后 1（判据要求 ≥1，达标）
grep \b500\b 于 advisor-design.md                     改前 1 → 改后 2（达标）
新两句内含仓内路径形（docs/ ∥ thincoder-core/）        0（判据「不许引用任何仓内路径」）
逐行长度（node 扫描，阈值 300，两档）                  越线 0 行（最长 294）
runDocCheck(root,{docs:[两档]})（现盘引擎直调）        PASS · hits 0 · checkFiles 2（真判过，非跳过）
doc_check(mode:"gate", docs:[两档])                  首行 DOC-CHECK GATE: PASS · 0 段有问题（2 档全清）
```

#### 4 改到的文件

```text
thincoder-core/prompts/persona-eng-designer.md    设计档 9 项之 3：旧指针句一句 → 自带数字三行
thincoder-core/prompts/advisor-design.md          第 8 条判据：旧指针句两句 → 自带数字一行
```

两档均在派单声明面内；无清单外改动。

#### 5 审计与代码评审（轮次 + 终态）

- **独立分歧审计（explore 子代理）**：`divergence(4)`，最高 **high**。
  - ① high：`docs/core/design/DOC-GRAPH.md` §3 仍写「执行面留两句——…只指本节」，相对盘上已假（设计席笔域，未改）。
  - ② medium：`advisor-design.md` 无 800。经本席复核：**改前工作树那两行本无 800**，审计取的是 `git show HEAD` 的旧版；派单判据也只要求 persona 有 800。
  - ③ low：审计判据 (b) 被本席写宽——提示词面另有 20 处旧仓内路径，均非档位句、非本笔引入。
  - ④ low：新句与同项首句重复「split plan…lands inside this batch」（父侧逐字文本）。
- **独立代码评审（advisor · code）第 1 轮**：`VERDICT: pass`（🔴 0 ∥ 🟡 2 ∥ 🔵 2）。
  - 🟡#1 = 同审计 ①（DOC-GRAPH §3 跨档滞后）。
  - 🟡#2 = 新句「before the change」未覆盖「新建档没有改前读数」这一支（DOC-GRAPH §3 有该支）。
  - 🔵#3 = 第 8 条自称档位「stated in this bullet」但不含 800。
  - 🔵#4 = 同条禁数规则连说两遍。
- **处置**：🟡#1 属设计席笔域；🟡#2 ∥ 🔵#3 ∥ 🔵#4 落在**父侧逐字给定的文本**上（改写等于替父侧定稿）。四件**全部上抛，本席一字未改**。
- **终态 = clean**：🔴 0；无未披露项；四条均已明确上抛。

#### 6 上抛

1. **[上抛·待裁]** `docs/core/design/DOC-GRAPH.md` §3「行数档位口径」的「执行面留两句——`thincoder-core/prompts/advisor-design.md` 第 8 条判据的指针句、`thincoder-core/prompts/persona-eng-designer.md` 受影响文件清单的指针句——只指本节，不另立判定时点」与本轮改后不符：两处提示词已无指针句。同节「**数值**（两条线各是多少）= 产品常量 `fileSoftMax` ∥ `fileHardMax`」如今也少算提示词那一份。设计席笔域，派单边界也明令不动该档。
2. **[上抛·待裁]** `advisor-design.md` 第 8 条现只带 500（设计时线）；800 收口线不在该条。父侧给的文本即如此，评审席也只判设计时线——若仍要求对称，需父侧给句。
3. **[上抛·待裁]** `persona-eng-designer.md` 新句「over 500 lines before the change」没有「新建档没有『改前』：判它落盘时的长度」这一支（该支在 DOC-GRAPH §3）。父侧逐字文本，本席未改。
4. **[上抛·知会]** 过程档 `docs/batches/2026-11-11-designer-tier-rule.md` §2 的 C4 ∥ C5 目标形 = 「只留指针句」，其 §5 亦记「只留指针」；与本轮裁定相反。过程档可整份丢弃，是否回写归父侧。

### 实施记录 · DESIGN-TOKEN-SETTLEMENT §10.1 ∥ §10.2 落地（父侧 2026-11-12 派单）

**射程**：设计档 §10.1（闸面批归属 = 令牌门第 ⑤ 步）∥ §10.2（评审封印 = 第 ⑥ 步）的实现面，按 §10.2「落点」七处（settle 算封印 ∥ 派单复算 ∥ 读形 ∥ 序列化 ∥ 落盘 ∥ 合并 ∥ 恢复）加 §10.1 的闸面一步。设计档 ∥ 需求档 ∥ 工具描述面 ∥ 提示词面零改。

#### 1 交付表（逐条）

| # | 条目 | 状态 | 落点 |
|---|---|---|---|
| ① | 第 ⑤ 步：旁列有值 ∧ 归一后 ≠ 本次 `batchDocAbs` ⇒ 拒；无值 ⇒ 跳过；槽文件读不到 ⇒ 抛（严格形） | ✅ | `agent-tools/subagent-design-token.mjs` `gateDesignToken`；`agent-tools/subagent-spawn.mjs` 调用行改 `gateDesignToken(parent, args, { batchDocAbs })` |
| ② | 第 ⑥ 步：有封印值 ⇒ 只读槽里 `docs` 重算 sha256；不一致 ⇒ 拒；清单里一份档读不到 ⇒ 拒（fail-closed）；无值 ⇒ 跳过 | ✅ | 同上（`designSealHash` 单源 = `agent-tools/design-token.mjs`） |
| ③ | 七态拒句逐字（TOOLS §6.25 ③）与判据顺序（missing → mismatch → expired → invalid → batch → seal） | ✅ | `subagent-design-token.mjs` `designTokenRefusal` / `gateDesignToken` |
| ④ | settle 算封印 + 清单一并写槽（批档面排除；空集删旧行） | ✅ | `agent-tools/design-token.mjs` `settleDesignReview`（`sealDocSetOf` + `designSealHash`） |
| ⑤ | 序列化 / 落盘 / 恢复三个旁列对位点 | ✅ | `token-ttl.mjs` `engTokenSlotFields` ∥ `persistEngTokens` ∥ `restoreEngTokens` |
| ⑥ | 读形（两形：宽容 ∥ 严格）与 `README`-级同形兄弟 | ✅ | `token-ttl.mjs` `readEngTokenSealsFromSlot` |
| ⑦ | 保存面并集纯函数（槽独有项保留、同 key 新写者胜） | ✅ | `session-slot-write.mjs` `mergeEngTokenSealsForSave` |
| ⑧ | 封印清单来源 = 受理面同一把尺（`resolveReviewDocPaths`）落 `run.docAbs`，实例键 `docSetKey` 只作旧形回退 | ✅ | `agent-tools/advisor-async.mjs` `resolveAdvisorLaunch` 的 design 实例字面 + `design-token.mjs` `sealDocSetOf` |
| ⑨ | 定向单测（U-BG17 ∥ U-BG19 ∥ U-BG20 ∥ U-BG21 ∥ U-BG22 ∥ 七句逐字 ∥ 严格读 ∥ 清单来源 ∥ 旧形回退 ∥ 合并纯函数） | ✅ | `docs/batches/2026-11-11-gate-silent-when-pass.test.mjs`（一次性，收口随批档删） |

#### 2 读数（命令 + 结果；红侧逐条实跑）

```text
node --test docs/batches/2026-11-11-gate-silent-when-pass.test.mjs   ⇒ tests 18 · pass 18 · fail 0
node --test（batch-close-token-consume ∥ advisor-record-gate ∥ batch-status-auto-set ∥ review-pass-signs-itself）
                                                                     ⇒ tests 19 · pass 19 · fail 0
node --test "test/integration/*.test.mjs"                            ⇒ tests 184 · pass 181 · fail 3
  三条红 = CLI 1-1 ∥ 1-2 ∥ 1-3（anthropic-tool-roundtrip 的 context overflow，先于本笔存在、同因，未动）
内容行数（node 行扫描，末行换行不计）：token-ttl 370→428 ∥ design-token 341→429 ∥ session-slot-write 261→279
  ∥ subagent-design-token 81→132 ∥ subagent-spawn 429→430 ∥ advisor-async 512→516 ∥ existence 160（未改）
```

红侧（每条都把判据拆一次，跑完还原）：

```text
① 关掉第 ⑤ 步（`if (bound)` → 关）∥ ② 关掉第 ⑥ 步 ∥ ③ 取掉封印集合的批档排除
   ⇒ 5 条转红（U-BG17 ∥ U-BG19 ∥ U-BG20 ∥ U-BG22 ∥ designId 省略那条）
④ 两条旁列读改 `{ strict: false }` ⇒ 「槽文件读不到 ⇒ 闸面抛」转红（宽容读静默放行）
⑤ 封印算不出改回 `throw e` ⇒ 「settle 侧 fail-closed」转红（要的是返回拒签、零字节写）
⑥ `sealDocSetOf` 忽略 `run.docAbs` ⇒ 「清单来源 = 受理路径」转红（旧形会去读 cwd 拼法的错路径）
```

#### 3 改到的档

```text
thincoder-core/token-ttl.mjs                        封印旁列：字段 / 恢复 / 落盘 + readEngTokenSealsFromSlot
thincoder-core/session-slot-write.mjs               mergeEngTokenSealsForSave（同形纯函数）
thincoder-core/agent-tools/design-token.mjs         designSealHash ∥ sealDocSetOf ∥ settle 面封印写与拒签
thincoder-core/agent-tools/subagent-design-token.mjs 七态拒句 + 第 ⑤ ⑥ 步 + resolveDesignSlot 回 designId
thincoder-core/agent-tools/subagent-spawn.mjs       调用行带第三参（{ batchDocAbs }）
```

**清单外改动（逐档 + 理由）**：

```text
thincoder-core/agent-tools/advisor-async.mjs        design 实例字面加 docAbs（评审受理路径，封印清单的来源）——
                                                    这是评审第 2 轮的唯一 must-fix：封印不能拿实例键 docSetKey
                                                    的 cwd 拼法当清单。该档改前 512 行（node 行扫描），本笔 +4；
                                                    设计档 §10 的档位登记未列它 ⇒ 档位结论归设计席（见 §4 第 6 条）。
docs/batches/2026-11-11-gate-silent-when-pass.test.mjs  一次性单测的续写（收口随批档删；名随批档是设计指定落点）
thincoder-core/doc-check/existence.mjs              声明面内但**零改动**（只被 design-token.mjs 只读导入 isBatchFace）
```

#### 4 决策披露（设计未覆盖 / 与设计的写法不同）

1. **settle 面封印算不出 ⇒ 返回拒签，不 throw**。设计 §10.2 只裁了闸面（派单时读不到 ⇒ 拒）；结算面这一支是本笔定的：返回 `{passed:false, sign:null}` + 恒定标记 `SEAL_UNREADABLE_MARK`，且在**任何写之前**返回（§3 签字与槽都在它之下）。理由两条：① 这是数据条件（评审看过的档在结算前被移走/锁住），不是接线故障，读回执的人需要一句话与下一步；② throw 会穿过 `settleAdvisorRun` 的 `onAccounting`（那里与 `settleAsyncEntry` 的调用串都没有 catch），跳过结算尾（挂起 / 事件 / 唤醒 / 补位），把可重评的拒签变成未捕获异常。已上抛设计席补一句正文（§6 第 4 条）。
2. **封印清单来源 = `run.docAbs`（受理面同一把尺），实例键 `docSetKey` 只作旧形回退**。设计 §10.2 写「该次评审 `documents` 里的非批档」，没说 `documents` 按哪条解析。`docSetKey` 走的是 `normAbs` 的 cwd 拼法，受理面走 `resolveReviewDocPaths` 的 root-first 解析——cwd 非项目根时两者指向不同路径（前者会读不到或盖到另一份同名档上）。`docAbs` 在 `resolveAdvisorLaunch` 里由 `resolveReviewDocPaths(documents, agent.cwd).resolved.values()` 落，回退面对旧实例 ∥ 手建实例仍可用（用例两条各守一面）。设计面这一句归设计席（§6 第 2 条）。
3. **成形不全的旁列行按「无值」跳过**：`bound` 非串 ∥ 封印行不成 `{hash:string, docs:string[]}` ⇒ 跳过该态（不拦）。与 `restoreEngTokens` 的入档过滤同一取舍（两个读入面不产生「重启前后判定不同」的第二套语义）；整档结构损坏仍由严格读的解析失败兜住。设计只裁到「旧槽无值 ⇒ 不拦」⇒ 已上抛裁决（§6 第 1 条）。
4. **接线故障断言**：旁列有值而 `batchDocAbs` 不是串 ⇒ throw（白文点名「batchDoc 门先于令牌门」）。与 `settleDesignReview` 的 `boundBatch` 不变量同形；生产路径不可达（`buildSpawnChild` 恒传已解析的绝对路径）。
5. **`designTokenRefusal(kind, designId, scope)` 增第三参**：batch 行要两个批档路径、seal-unreadable 行要那份档的路径；四态既有调用行零改，七句逐字零改。
6. **档位读数**：`advisor-async.mjs` 改前 512 行（已过 500 设计器线）、本笔 +4；设计档 §10 的档位登记不含该档 ⇒ 分拆方案/「该档不属于本批」由设计席与父侧定。其余五档改后均在线下（428 ∥ 429 ∥ 279 ∥ 132 ∥ 430）。

#### 5 审计与代码评审（轮次 + 终态）

- **独立分歧审计（explore 子代理）**：`divergence(4)`，最高 **low** —— ① 清单外测试档（已披露）；② 新导出名 `designSealHash` 未进设计档「新名字的三问」表；③ settle 面「先算后写」在签字之后算 ⇒ token 先落内存、封印算不出会抛（→ 当场改成封印先算、拒签返回）；④ 成形不全的旁列行按无值跳过（→ 留作上抛裁决）。其余逐条「符合」：§10.2 七处落点齐 ∥ 七句逐字与顺序 ∥ 无越域改动 ∥ 五个代码档无残留旧说法。
- **独立代码评审（advisor · code）第 1 轮**：`changes-required`（🟡 must-fix 1 ∥ 🟡 2 ∥ 🔵 3）。must-fix = 封印算在 §3 签字之后且失败时 throw ⇒ 签字留在盘上无回退句柄、异常穿过 `onAccounting`（未捕获）。🟡 之二 = 封印清单取自 `docSetKey` 的 cwd 拼法（受理面另一把尺）。🔵 三条 = 严格读无用例 ∥ 七句只查互异没查逐字 ∥ 序数交叉引用漂移。
- **修正轮 ①**：封印块挪到裁定闸之后、§3 签字之前，失败改返回拒签；补「槽文件读不到」用例；七句改逐字整串断言；序数改成行名。
- **独立代码评审第 2 轮**：`changes-required`（must-fix = 封印清单来源仍未修，并指出 `resolveReviewDocPaths` 已在受理面用过、同一次评审已有 `docAbs` 载体）。
- **修正轮 ②**：`resolveAdvisorLaunch` 落 `run.docAbs`（受理路径），`sealDocSetOf` 首选它、`docSetKey` 降为旧形回退；补两条用例（来源优先 ∥ 旧形回退）。
- **独立代码评审第 3 轮（复核）**：`VERDICT: pass` —— 六条逐条 Fixed/Accepted：① 封印先算后写（用例断言批档字节不变 + 三个 Map 零写）∥ ② `docAbs` 优先、`docSetKey` 回退、两条用例 ∥ ③ 成形不全的跳过为写明裁定（Accepted）∥ ④ 严格读用例 ∥ ⑤ 七句逐字断言 ∥ ⑥ 序数改行名。
- **终态 = clean**：🔴 0；must-fix 0；无未披露改动；上抛 4 条（§6）。

#### 6 上抛

1. **[上抛·待裁]** `docs/core/design/DESIGN-TOKEN-SETTLEMENT.md` §10.2 只裁「旧槽无值 ⇒ 不拦」；**成形不全**的旁列行（值非串 ∥ 封印行缺 `hash`/`docs`）本笔按「无值」跳过（写明注释、与恢复面同一取舍）。要不要改成 fail-closed（需第八条拒句 ∥ §10.2 增一句），归设计席与父侧定。
2. **[上抛·待裁]** 设计 §10.2「被算集合 = 该次评审 `documents` 里的非批档」未写 `documents` 按哪把尺解析。实现取「受理面同一把尺」（`run.docAbs`），`docSetKey` 退为旧形回退；设计面缺这一句，补了以后 `sealDocSetOf` 的回退面才不再是「两种来源」。
3. **[上抛·知会]** 设计档「新名字的三问」表未含 `designSealHash`（§10.2 的 settle/闸面共用字节口径函数）；实现面只有一个函数、两处同调，未另造第二套字节法。归设计席补表。
4. **[上抛·知会]** 结算面封印算不出 ⇒ 拒签（不 throw）是本笔定的行为，设计 §10.2 无此句（§4 第 1 条的完整理由）。设计席补一句即可与实现同文。

### 实施记录 · `advisor-async.mjs` 分拆（只读判定族 → `advisor-launch.mjs`）

**射程**：一件。按设计 §10「分拆方案（`advisor-async.mjs`，本批内实施）」把该档的只读判定族拆到新档 `advisor-launch.mjs`（同目录）。判定语义零改、行为零改、不加新函数、不重构别处、不与 ⑤⑥ 两步混改。

#### 1 交付表

| # | 条目 | 状态 | 落点 |
|---|---|---|---|
| ① | 拆出族 12 个符号逐个搬走 | ✅ | 新档声明：`advisorRunsRead` ∥ `advisorRuns` ∥ `openCodeRun` ∥ `openDesignRun`（私有）∥ `resolveAdvisorLaunch` ∥ `effectiveAdvisorRound` ∥ `ADVISOR_POOL_LIMIT` ∥ `resolveAdvisorPoolLimit` ∥ `advisorPoolLimitFor` ∥ `runningAdvisorOfScope` ∥ `runningAdvisorCount` ∥ `advisorReviewPending` |
| ② | 留下的族 | ✅ | 原档保留：`cancelAsyncAdvisor` ∥ `relayAdvisorOutput` ∥ `dequeueAdvisor` ∥ `refreshAdvisorQueuedTokens` ∥ `refillAdvisorQueue` ∥ `launchAsyncAdvisor` ∥ `closeOpenCodeAdvisorRuns` |
| ③ | re-export（既有 import 面零改） | ✅ | 原档 import 四个内部消费名，另出 10 名 re-export 块（`ADVISOR_POOL_LIMIT` ∥ `advisorRuns` ∥ `advisorReviewPending` ∥ `advisorPoolLimitFor` ∥ `effectiveAdvisorRound` ∥ `openCodeRun` ∥ `resolveAdvisorLaunch` ∥ `resolveAdvisorPoolLimit` ∥ `runningAdvisorCount` ∥ `runningAdvisorOfScope`） |
| ④ | 原档头注改成拆分后的实况 | ✅ | 「This module owns the WRITE half — launch ∥ queue ∥ cancel ∥ close」，并点名 READ half 住新档；条目重编号 1（池）∥ 2（结算记账） |
| ⑤ | 原档清理 | ✅ | 随代码移除的不再需要的 import（`randomUUID` ∥ `docSetKey`）删净；剩余 import 逐个有消费点 |

#### 2 读数（命令 + 结果）

```text
内容行数（尺 = countContentLines，末行换行不计）
  拆前（工作树，含本轮之前那笔 docAbs 改动）  advisor-async.mjs        516
  拆后                                      advisor-async.mjs        364
  新档                                      advisor-launch.mjs       178
  参考：HEAD 里的 advisor-async.mjs         512（git show HEAD:…，同一把尺）

node --check advisor-async.mjs ∥ advisor-launch.mjs        ⇒ 两档全过
node -e import(advisor-async.mjs) 冒烟                     ⇒ load ok（resolveAdvisorLaunch ∥ launchAsyncAdvisor ∥ closeOpenCodeAdvisorRuns 均为 function）
导出同一性（旧面 re-export 的 10 名 === 直接取自新档）      ⇒ 10/10 same
```

```text
node --test（本批单测档 + 令牌 / 顾问相关集成档 7 份）       ⇒ tests 49 · pass 49 · fail 0
  docs/batches/2026-11-11-gate-silent-when-pass.test.mjs 18 · 其余 6 份 31
node --test "test/integration/*.test.mjs"（全量）           ⇒ tests 184 · pass 180 · fail 4
  4 条红：CLI 1-1 ∥ 1-2 ∥ 1-3（anthropic-tool-roundtrip 的 context overflow，先于本笔存在、同因）
         + CLI 46-1（cross-instance-message，全量并发下 flake）
  CLI 46-1 单跑 test/integration/cross-instance-message.test.mjs ⇒ 1 pass / 0 fail（与本笔无关）
```

首次全量跑另有两次 flake：CLI 46-1 之外还出现两条浏览器族转红，复跑即绿；这批 flake 与本笔无关（本笔未碰浏览器族与其依赖），如实记一笔。

#### 3 改到的档

```text
thincoder-core/agent-tools/advisor-async.mjs    拆出判定族 + re-export 块 + 头注改实况
thincoder-core/agent-tools/advisor-launch.mjs   新建（判定族全量搬入，函数体逐字）
```

清单外改动：**无**（两档都在本次派单的声明面内）。

#### 4 决策披露（与设计的写法差 / 设计没写的三处）

1. **设计 §10 ② 的依赖清单与实现不符**：设计写「拆出族只依赖 `carrierField` ∥ `docSetKey` ∥ `resolveReviewDocPaths` ∥ `randomUUID`」，实现还要 `getAsyncPool`（池守卫三函数）与 `scopeAdvisorMirror`（`resolveAdvisorLaunch` 落镜像）——两者都是设计自己点名的族所必需，说明是设计清单漏列，不是实现多引。新档头注按实况写全六项，设计档归设计席（见第 6 条第 1 项）。
2. **「不成环」这句话要按实况读**：两档之间确是单向边，但与 `async-settle.mjs` 之间有一环既有（该档静态 import `refillAdvisorQueue`，本档 import `carrierField` ∥ `getAsyncPool`）。拆分前是 `advisor-async` ↔ `async-settle` 的一环，拆分后同一环多经新档一格——环数不变、本笔未新增环，环上无模块级求值。新档头注写的就是这一句，不写「不成环」。
3. **`advisorRunsRead` 跨档可见但不进 re-export 名单**：写动作一族的 `closeOpenCodeAdvisorRuns` 要用它，所以新档必须导出它；它不是原档的既有导出，故 re-export 名单不含它——原档的 import 面因此与拆分前逐字相同。这一条写在该函数的 JSDoc 里。
4. **`runningAdvisorOfScope` 的形参名遮蔽同档的键函数**：形参 `docSetKey` 与自 `review-facts.mjs` 引入的 `docSetKey` 同名。今天函数体不调用键函数，未成错；**本笔保留逐字搬迁不改名**，理由是「只搬不改」本身是要给审计与评审核的证据面（改名会让搬入体不再逐字）。记为已知瑕疵，改名留给后续轮。

#### 5 审计与评审（轮次 + 终态）

- **独立分歧审计（explore 子代理）**：`divergence(3)`，最高 **medium**。
  - ① medium：设计 §10 ② 的「不成环」与交付的模块图不符（`advisor-launch` → `async-settle` → `advisor-async` → `advisor-launch` 一环）⇒ 当场把新档头注改准（写明既有环、环数不变、无模块级求值）；设计档上抛。
  - ② low：拆出族多引 `getAsyncPool` ∥ `scopeAdvisorMirror` 两个设计清单未列的名字 ⇒ 同属设计清单漏列，上抛。
  - ③ low：`docs/batches/2026-11-11-designer-tier-rule.test.mjs` 的夹具断言 `advisor-async.mjs` 须大于 500 行，拆完必抛 ⇒ 该档不属本笔笔域（另一批的过程档，头注自述「不进仓套件 · 收口前删除」），上抛。
  - 其余逐条「符合」：12 个符号齐搬且原档零残留 ∥ 留下的族一件未动 ∥ re-export 名单齐 ∥ 9 处既有 import 面逐个可解析 ∥ 搬入体与 HEAD 逐字相同（唯一差额是本轮之前那笔 `docAbs` 改动，§5 已有记录）∥ 无死 import、无重复定义 ∥ 两档均在线下。
- **独立代码评审（advisor · code）第 1 轮**：`VERDICT: pass`（🔴 0 ∥ 🟡 2 ∥ 🔵 3）。
  - 🟡#1（设计 §10 ② 依赖清单与实现不同口径）= 设计席笔域，上抛，代码不动。
  - 🟡#2（「green」只有读码证据、无实跑证据；本批 §5 当时尚无本笔记录）= 由本节第 2 段满足：load 冒烟 + 7 份定向档 49/49 + 全量 184 档的逐条读数已落。
  - 🔵#3（`advisorRunsRead` 导出于新档却不进 re-export 名单）⇒ 当场改：在该函数 JSDoc 写明「跨档可见但不入 re-export」的理由。
  - 🔵#4（头注主词「只读」与档内两处写动作不符：`advisorRuns` 建容器、`resolveAdvisorLaunch` 写注册表与镜像）⇒ 当场改：主词改成「实例与池判定一族」，并写明「对池与队列只读；实例注册表按既有语义懒建与回收」。
  - 🔵#5（形参 `docSetKey` 遮蔽键函数）⇒ 保留并披露（本节第 4 条第 4 项）。
- **终态 = clean**：🔴 0、must-fix 0；两条 🟡 已明确处置（一条上抛设计席、一条由本节读数关闭）；🔵 两条当场改、一条写明理由保留。

#### 6 上抛

1. **[上抛·待裁]** `docs/core/design/DESIGN-TOKEN-SETTLEMENT.md` §10 ② 的依赖清单与实现不符：写的是「拆出族只依赖 `carrierField` ∥ `docSetKey` ∥ `resolveReviewDocPaths` ∥ `randomUUID`」并据此断言「成一条单向边，不成环」；实有六项（另加 `getAsyncPool` ∥ `scopeAdvisorMirror`），且与 `async-settle.mjs` 有既有环。设计档归设计席改一句。
2. **[上抛·待裁]** `docs/batches/2026-11-11-designer-tier-rule.test.mjs` 的夹具前提「`advisor-async.mjs` 须大于 500 行」拆后必假 ⇒ 该档今天一跑就抛在夹具断言上。它是另一批的过程档（头注自述「不进仓套件 · 收口前删除」），本笔未动；去留归父侧。
3. **[上抛·知会]** 全量套件两次跑各出一次与本笔无关的 flake（CLI 46-1；另一次是两条浏览器族），单跑均绿；三条 CLI 1-x 是既有 context overflow 存量红。

## §6 验证与收口（父代理）

**验证**

- 当批单测（`docs/batches/2026-11-11-gate-silent-when-pass.test.mjs`，18 条）：`node --test` ⇒ `tests 18 · pass 18 · fail 0`，父侧本轮复跑确认。关键三条即本批要治的两件事的机器版：U-BG17（A 批令牌派 B 批 ⇒ 拒、点名两批档、槽不删）· U-BG20（评审后改被审档一个字节 ⇒ 拒，改回 ⇒ 放行）· U-BG22（封印清单里一份档被删 ⇒ 拒，放回 ⇒ 放行）。
- 定向集成套件（4 份令牌相关）：`tests 19 · pass 19 · fail 0`。
- 全量集成：`tests 184 · pass 181 · fail 3`，三条红 = CLI 1-1 ∥ 1-2 ∥ 1-3（`context overflow`，先于本笔存在的存量）。
- 红侧实跑：关第 ⑤ 步 ∥ 关第 ⑥ 步 ∥ 取掉封印集合的批档排除 ⇒ 5 条转红；旁列读改宽容形 ⇒ 严格读用例转红；封印算不出改回 throw ⇒ 拒签用例转红；`sealDocSetOf` 忽略 `docAbs` ⇒ 清单来源用例转红。

**收口核对**

- 本批新债：无（三条待办已在批 ② 侧登记，本批不重复记）。
- 台账：`#2339`（本批自身行）随 `batch close` 结算。
- 单元测试档：`docs/batches/2026-11-11-gate-silent-when-pass.test.mjs` 按纪律随本批收口删除，§5 保留读数行。
- 文档纪律门：本档自身对「悬空」判据整份豁免（过程档可整份丢弃）；写入回执每笔均 `DOC-CHECK GATE: PASS`。
- 未覆盖面（如实记）：不经 spawn 直接改代码这条路径不受本闸约束，归写入门；本批只封了「令牌 ↔ 批档 ↔ 被审档」三者的一致性。
