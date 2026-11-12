# 文档检查（DOC-CHECK）· 设计

> 机器判哪几件事、怎么报 = 本档。文档该长什么样（要求面）= `docs/core/design/DOC-DISCIPLINE.md`。
> 判据来源 = 用户 2026-11-12：「我需要控制的事情只有几个：1. 一段文字不能太长，太长读不过来。2. 不要用行号做锚，因为行号会飘移。我根本没让你检查别的，其他的，都是你自己在加戏。」

## 1. 只判三件事

| # | 判什么 | 判据 | 不这样做，会发生什么 |
|---|---|---|---|
| ① | 一段太长 | 一段超过 300 字 | 一次读不完，人就改成扫读、跳过，这一段等于没写 |
| ② | 拿行号做锚 | 正文里出现「档名 + 冒号 + 数字」的定位写法 | 上面插一行，下面每一处一起漂；照它去翻，翻到的是别人的东西 |
| ③ | 悬空指针 | 正文写了一个档名，项目根下找不到这个档 | 读者顺着去找，扑空一次；错的是指路，不是找的人 |

这三件之外不判。**判得准才判**：报出来的东西只要有一条误报，人就不再信这个门，紧接着整个门作废——那比漏掉一条贵得多。

**行数不是第四件事。** 本门量的是「一段多长」（§2），不是一个档有多少行；文档面（设计 ∥ 需求 ∥ 批次 ∥ 台账）一律不量长度。

**要量源码 ∥ 单测档的长度时，尺只有一把**：按**内容行数**计——末行那个换行不算一行（`split("\n")` 出的末段若是空串，不计入）。唯一实现在 `thincoder-core/agent-tools/batch-tier-gate.mjs` 的 `countContentLines`，档位线（500 ∥ 800）的判法单源 = `docs/core/standards/CODE-TIER.md`。手数 ∥ 编辑器行号 ∥ 别的脚本各会数出另一个数——两个数一出来，没人说得出该信哪个。


## 2. 怎么数「一段」

- **一段** = 相邻的非空正文行合起来的那一片文字。标题 ∥ 表格 ∥ 列表 ∥ 引用 ∥ 围栏块各自成界：它们断开段，自己也不算进段。
- **提示词面**（`thincoder-core/prompts/`）每行自成一界——那里的换行排的是版式，不是分段。
- **字** = 字符数，一个汉字算一个。阈值 300 是常数：判据不读项目配置，要改就改代码、走评审。

## 3. 怎么「找一下」

**在项目根下找一次。** 项目根 = 这份档自己所属的项目，也就是沿它往上最近的那个带 `PROJECT-MANIFEST.json` 的目录。

一个 token 先问一句：它该在仓内吗？

```text
该在仓内   仓根相对形：docs/x/y.md ∥ thincoder-core/...
            ⇒ 在仓根下找一次：
                 拼根路径存在                     ⇒ 在，不报
                 否则仓内任一份档以这个 token 结尾  ⇒ 在，不报
                 一份都找不到                     ⇒ 报
不该在仓内 ../ 开头的 ∥ 绝对路径指着本仓之外的 ∥ 别仓的档
            ⇒ 跳过，一个字都不出
.thincoder/ 之下 运行时状态目录，不是文档区 ⇒ 跳过，一个字都不出
```

**「有就行」，不判唯一。** 仓里有两份、三份同名档都算「在」——那是仓库当下的状态，不是这条引用对错。判据只问一句：这个东西在不在。

不造解析腿序、不造声明仓、不造 `publicRepos`、不造豁免。一句「仓内找一次」就够。

**一个例外，否则这条判据会卡死自己**：设计档写「这里要建一个档」时，那个档本来就还不存在。所以**若这个档名出现在某份在途批档的 §2 机读清单里 ⇒ 不报**。清单是这一批打算建或改的东西，列在上面就是「在计划中」，不是「指错了」。

批档收口之后清单跟着失效，同一路径立刻回到「找不到就报」——**豁免期正好等于那一批的生命期，不需要谁去维护它**。

**第二个例外：批档整份不判悬空。** 落在 `docRoot.batches` 之下的档（§1–§6 一整份）里写了盘上不存在的档名 ⇒ 不报。

**为什么**：批档是**可整份删掉的执行记录，不是导航**——读者不会照着 §2 去找档。它记的是「这一轮做了什么、发现了什么」；记录里出现一个不存在的档名，那是**发现**，不是指向空气。判它等于把「某份档不存在」这条发现本身拦在门外，那个发现就永远写不进去。设计档 ∥ 需求档 ∥ 标准档是给人查的，名字得解得到，照判。

**第三个例外：`.thincoder/` 之下的路径不判悬空。** 那是运行时状态目录——会话、记忆、临时件、运行期操作数全在那儿。它不是文档区；判它等于把工具自己的家当当成读者要翻的资料。

**这一条只管「不在盘」那一件。** 同一行里的段长 ∥ 行号锚照判，两件不得一免全免（判据 = `docs/core/requirements/DOC-CHECK.md` AC-9）。

**为什么这不是豁免表**：没有文件名清单、没有逐条登记、没有按类按文的匹配——一条路径前缀，一眼可判。

面别只决定悬空判不判，也只在**写时点**决定：段长 ∥ 拿行号做锚两判据对批档在写的那一刻照旧生效；收口时点批档整份不判（§9）。

## 4. 仓外一律不看

跨仓引用解不到，是那条路径没写清，责任在人；门去猜、或者去报，只会造出一堆要人逐个解释的噪音。**仓内的档是本仓的事，仓外不是。**

代价照实认：指错的仓外路径因此看不见。出路是把路径写清楚，不是让门去找。

## 5. 报什么（一句一条，人话）

首行是机器判的，后面每行一句人话：

```text
DOC-CHECK GATE: PASS
```

```text
DOC-CHECK GATE: REFUSED
docs/x/y.md 这个档不存在
docs/x/y.md 第 3 段 412 字，超过 300
docs/x/y.md 第 12 行的 foo.md:120 用行号做锚，行号会漂
```

- 没有命中 = `PASS`，后面不再添任何一行。
- 有命中 = `REFUSED` 打头，逐条一行：不省一条，也不加统计行。
- 拦与只列两种调用共用同一套判据、同一种句子；差别只在拿不拿它挡这一笔写。

## 6. 判域 = 本批变更区

收口那一刻（`batch close` ∥ `status → 已收口`），一份档进了判域，不等于它整份进来判：**只判本批变更区**。区内照判三件（§1），区外一个字都不出——不拦、不出行、不出读数。

**没有要判的行 ⇒ 不出任何行。** 来路有三条，处置只有这一个：本批没碰这份档 ∥ 变更区判不出来（§1 没有记入行 ∥ 记入行的对象读不到 ∥ 非 git 目录）∥ 变更区落空。这时这份档一行也不判，回执一个字都不出——不点名、不解释、不写「无从判」，也不计入 `范围 N 档`。为什么：判不了的档对方没有需要做的事，多出的每一句都只是让人去猜。

**变更区 = 建档之后这份档动过的那几行。** 取法 = `git diff -U0 <批起 sha> -- <该档>`：`-U0` 只要变过的行、不取上下文；`-c core.quotepath=false` 让非 ASCII 档名照旧解得开。`<批起 sha>` 的取法单源 = §8 的记入行读法。

**为什么拿批起快照当基线、不拿 HEAD**：快照量的是建档那一刻的**工作树**，未提交的改动与未跟踪档都在里面（§8「快照怎么取」）。所以「快照 → 现工作树」量出来的正是建档之后动过的字节——批起时就带在身上的未提交改动不算到本批头上，而本批自己改的那些一定在里面，提交没提交都一样。

**纯删也算变更。** 删掉的那几行就是区。删除在改后文本里没有可指的行，所以它落成一个**零宽区间**：判段长时取这个缝上现占位的那一段（删并出来的段 ∥ 缝后那一段），缝落在档头则取第一段；行号锚与悬空指针在零宽区上不产生命中。

**收口门自己把要判的档 `git add` 掉，再取变更区。** 收口门有两处，同一件事两处都做：

- **收口臂**：`thincoder-core/agent-tools/batch-gate.mjs` 的 `evaluate`（`scope === "close"`），取区之前对它触达的档逐个 `git add -- <该档>`。
- **`doc_check` 的 `gate` mode**：判之前对调用方交进来的那几份 `docs` 做同一件事——逐个 `git add -- <该档>`。
- **`report` 面与写门不 add**：`report` 是诊断面、判整份；写门判的是手上正在写的文本。

加的时候按路径限定，不 `git add -A`：别人的半成品不进索引。

**门自己 add 之后，正常路径下不存在「未跟踪 ⇒ 看不到」这一类状态。** 新档进了索引，`git diff -U0 <批起 sha> -- <该档>` 对它天然出「整档新增」，整份就是变更区，三件照判；规则因此只剩一条——变更区 = `git diff` 的 `-U0` 变更行。

**加不进去的例外 ⇒ 该档变更区落空 ⇒ 零输出。** `stageDocs` 把档加进索引这件事做不成，来路有三条：`.gitignore` 挡住 ∥ `.git/index.lock` 被占 ∥ 不在 git 目录里。**受影响的只有本来就在索引外的档**——本批新建的档、从未 add 过的档。

**已跟踪的档不受影响**：add 失败之后它仍在索引里，`git diff -U0 <批起 sha> -- <该档>` 照出变更区、照判——锁挡的是写索引，不挡读。索引外的档则没有变更区 ⇒ 这份档没有要判的行，处置与本节「判不出变更区」同一条：不出任何行，不造拒绝、不造点名。

**复现（两半各一条，条件即环境真造得出来的那两种）**：

- `.gitignore` 那一半：夹具里写一份落在忽略规则下的新档，跑 `batch close` ⇒ 回执只有 `PASS` 一行，不点名该档、不计入 `范围 N 档`。
- 持锁那一半：仓根造一个空的 `.git/index.lock`（POSIX 写法 `touch .git/index.lock`），同一笔 `batch close` 再跑一次 ⇒ 索引外的新档同样零输出；同一笔里已跟踪的档照判。

**为什么这条取舍成立**：这几种都是环境拒绝，不是写的人忘了做；而「写的人忘了」这一路，已经被门自己 add 消掉了。判不准的就不判（§1 同句）。

**`changedRegionsOf` 只算区间、不执行 add**：`thincoder-core/agent-tools/batch-regions.mjs` 的这个入口收档清单、交区间表，写索引这一笔不在它身上，它也就不带「不在索引就跳过」那一支。

**档在建档之后被删掉（快照里有、盘上没了）⇒ 没有文本可判 ⇒ 不出任何行**：删掉的是整份档，不是某几行。

**区间只在段这一级扩。** 段长判据的单位本来就是段：段里含变更行 ⇒ 整段量（哪怕超长的是段里别的行）；整段无变更行 ⇒ 不判。行号锚与悬空指针按**行**判：命中行本身在区内才判。

**不扩区**：不取邻段、不按「这份档被碰过」整份进来、不加整块 ∥ 扩区表、不出存量读数行。区外命中一律丢弃——不计数、不出行。

**判不出变更区 ⇒ 这份档没有要判的行，不出任何行**（三条来路见本节开头那一句）。**不回落「整档判」**——那正是本节要撤掉的那一档。

**这不是 `zones` 回来**：没有逐档键表、没有 `region ∥ whole ∥ unknown` 三态、没有扩区表。调用方交的是一条按改动行算出来的区间表，装配处只做一次行号归属判定。

**两个 mode，一支判据**：`doc_check` 的 `gate` mode 是交付判定，判**变更区**；`report` mode 是诊断面，判**整份**。同一句话不许两面各说一套：`gate` 与 `batch close` ∥ `status → 已收口` 走同一支，`report` 与写门走另一支。

**基线怎么取（三选一，取 ②）**：

① **批起 sha → HEAD 的已提交差异**——漏掉未提交的本批改动：本批一字未提交时变更区为空，真缺陷照样 `PASS`，是假绿。

② **批起 sha → 现工作树**（取它）——快照量的是建档那一刻的工作树（§8），所以「快照 → 现工作树」正好是建档之后动过的字节；本批改的那些提交没提交都在里面，而批起时就带在身上的改动已在快照里，不产生差值。

③ **本批触达账内求差**——触达账记的是「哪几档被碰过」，不记行；要它出行得另造一套行级记录，且「碰过」不等于「改过」，同一次写可能一行未变。

**② 的失败面**：记入行的 sha 若是一个旧 HEAD 提交（快照机制上线前的批），它的树里没有当时的未提交改动，差值会把「批起时就带在身上的改动」也算成本批的。识别靠结构、不靠年份：`merge-base --is-ancestor <sha> HEAD` 成立 ⇒ 旧形 ⇒ 变更区判不出来 ⇒ 这份档没有要判的行，不出任何行。

**「判不出变更区」的活场景（可跑，不是机理推演）**：

- **没有记入行**：现盘上多数批档的 §1 没有 `批起 sha` 记入行，`thincoder-core/agent-tools/batch-gate.mjs` 的 `baseShaOf` 逐档跑过去返 `null`（读数住批档 §2）。复现 = 取其中一份跑一次 `batch close` ⇒ 变更区判不出来 ⇒ 回执不出任何行。
- **非 git 目录**：`thincoder-core/agent-tools/batch-regions.mjs` 的 `committedDocs` 在没有 `.git` 的目录返 `ok: false`、档清单为空（实测，读数住批档 §2）。复现 = 在无 `.git` 的夹具目录里 `create` 一份批档、写完再 `close` ⇒ 零输出。

**入口在哪**：

- `thincoder-core/agent-tools/batch-regions.mjs` 出 `changedRegionsOf(root, sha, files)`——`git diff -U0` 的解析面，与同档既有 `committedDocs` 共用同一条 git 腿。
- 同档另出 `stageDocs(root, files)`——门自己那一笔按路径限定的 `git add`（不 `git add -A`）：写索引，取区不写索引。
- `thincoder-core/doc-check/index.mjs` 的 `judgeText` 收 `region` 入参，**必填、不收缺省值**：`null` = 判整份，区间表 = 只判这几行——两件事由调用方明说，不靠谁替它决定。
- 段长那一半的归属判定落在 `thincoder-core/doc-check/paragraph.mjs` 的 `paragraphHits`，因为**一段跨哪几行只有它知道**（命中只带段首行与字数，跨行从命中里读不出来）。
- `runDocCheck(root, { docs, moment, regions })`：`regions` 同样必填（表 ∥ `null`）；引擎不读 git，区间由调用方交进来（同形先例 = §8 的 `baseTextOf`）。

**变更区的两个调用方**：`batch-gate.mjs` 的 `evaluate`（`scope === "close"`）与 `doc_check` 的 `gate` mode。写门与 `report` mode 交 `null`。

**四个新名的三问**（住哪 · 叫什么 · 谁）：

- `changedRegionsOf` = `none found:`（`thincoder-core/**` 与 `thincoder-cli/**` 的 `.mjs` 里 `changedRegionsOf` ∥ `replacementRegionOf` 零命中；最近的相邻件是 `thincoder-core/agent-tools/batch-regions.mjs` 的 `committedDocs`，它只出档清单、不出区间）· 住 `thincoder-core/agent-tools/batch-regions.mjs`，与 `committedDocs` 同档、共用一条 git 腿 · 谁 = 属主同一档；消费方两个 = `batch-gate.mjs` 的 `evaluate`（`scope === "close"`）∥ `doc_check` 的 `gate` mode。
- `region`（`judgeText` 的入参）= `none found:` `judgeText` 现在只收 `{ file, root, planned, indexPath }`，没有区间入参（依据 thincoder-core/doc-check/index.mjs「planned = new Set(), indexPath = null」）· 住 `judgeText` 的入参面 · 谁 = 属主 = `runDocCheck`（唯一传参方）；读它的是 `judgeText` 本体。
- `regions`（`runDocCheck` 的入参）= `none found:` `runDocCheck` 现在只收 `{ docs, moment }`（依据 thincoder-core/doc-check/index.mjs「{ docs, moment }」）· 住 `runDocCheck` 的入参面 · 谁 = 属主 = 调用方算好交进来（`batch-gate.mjs` 的 `evaluate` ∥ `doc_check` 的 `gate` mode；写门与 `report` mode 交 `null`）。
- `stageDocs(root, files)` = `none found:`（全仓 `.mjs` 里这个名字只落在本批三份档上、共 8 行——定义一行、两个消费点各一行，其余是注释与 import；批起快照上同档只导出 `safeRead` ∥ `committedDocs`，该名 0 命中。最近的相邻件 = `thincoder-core/tools/git.mjs` 的 `add` 动作——那是给模型用的 `git` 工具面，按调用方给的 `path` 加，不是收口门自己的前置动作）· 叫什么 = `stageDocs`，语义 = 门自己那一笔按路径限定的 `git add`（不 `git add -A`）· 住 `thincoder-core/agent-tools/batch-regions.mjs`，与 `changedRegionsOf` 同档 · 谁 = 属主同一档；消费方两个 = `thincoder-core/agent-tools/batch-gate.mjs` 的 `evaluate`（`scope === "close"`）∥ `thincoder-core/agent-tools/doc-check.mjs` 的 `gate` 支；`report` 面与写门不调它。

**基线从哪一批来：谁在判，谁已经知道自己是哪一批。** 门不去找「那一份在途批档」——怎么找都是猜，猜出来的候选不是本批。基线就取**判它的那一批**批档 §1 的记入行（取法单源 = §8）：

- `batch close` ∥ `status → 已收口`：正在收口的那一份批档（门自己的目标档，不是扫出来的）。
- 子代理的交付门（`doc_check(mode:"gate")`）：该子代理**绑定的 `batchDoc`**。
- 两样都没有（手工跑一次不带绑定的调用）⇒ 没有「本批」可指 ⇒ 没有要判的行 ⇒ 回执不出任何行。

依据 `thincoder-core/agent-tools/batch-gate.mjs`「const baseSha = close ? baseShaOf(selfAbs) : null」——收口面取的就是门自己的目标档；「哪一份批档在途」是写入面的目标定位，不进判域这一支。

**与 §9 是两层，不是两条**：§9 定「这一刻哪些档进来判」，本节定「进来的档里判哪些行」；两条叠起来才是收口门的判域。

**七处落点与目标态**（各档的实施笔归 eng-coder；本节只定目标态与判据）：

| 落点 | 目标态 |
|---|---|
| `thincoder-core/tool-docs/doc_check.md` | 两个 mode 分开写：`gate` 判在途批的变更区；`report` 判整份（诊断面） |
| `thincoder-core/tool-docs/doc_check.md`（同这一档，在既有那句之外再加一句） | **`gate` mode 在判之前会 `git add` 它此行判的那几份档（按路径限定，不 `git add -A`）；`report` mode 不动索引。** 同档首句「Read-only: it writes nothing」按此收正：`report` 面仍只读，`gate` 面会写索引 |
| `thincoder-core/tool-docs/batch.md` | 收口面只判本批变更区 |
| `thincoder-core/prompts/persona-eng-coder.md` | `doc_check(mode:"gate")` 的判域是按变更区，不是整份 |
| `thincoder-core/prompts/persona-eng-designer.md` | 同上 |
| `thincoder-core/prompts/persona-engineering.md` | 判域按变更区；文档里一条旧悬空指针不再因此报出 |
| `thincoder-core/prompts/persona-eng-coder.md` ∥ `persona-eng-designer.md`（同这两档，在既有那句之外再加一句） | 落盘之后 `git add` 自己写过的档——只加自己写的，不 `git add -A`，别人的半成品不进索引 |

**验收（回指 `docs/core/requirements/DOC-CHECK.md` F8 ∥ AC-10 ∥ AC-11）**：

- 同一份设计档：变更区干净、区外一条悬空指针 ⇒ `batch close` 放行、零附加行；把那条指针挪进变更区 ⇒ `REFUSED`。
- 同一份档：区外一段 400 字 ⇒ 放行；区内某段含变更行、整段超 300 字 ⇒ `REFUSED`。
- 两个 mode 不同源：同一份档、同一条区外悬空，`report` ⇒ `REFUSED`，`gate` ⇒ `PASS`。
- 纯删：删掉两段之间的一行使两段并成一段、并出来的段超 300 字 ⇒ `REFUSED`；同一笔在整档下的旧悬空照旧不出行。
- 新档没 add 也照判：夹具里本批写一份新档、不 `git add`、跑 `batch close` ⇒ 收口臂先 add 再取区 ⇒ 该档整份即变更区，区内有命中即 `REFUSED`（不是零输出）；删掉那条命中复跑同一笔 ⇒ 放行。同一半在 `doc_check` 的 `gate` mode 上也立：手写一份新档、不 add、交给 `doc_check(mode:"gate")` ⇒ 先 add 再判，区内有命中即 `REFUSED`。
- 加不进索引的档 ⇒ 零输出：`.gitignore` 挡住的档，以及持着 `.git/index.lock` 时仍在索引外的新档 ⇒ `batch close` 放行、回执只有 `PASS` 一行、不点名该档、不计入 `范围 N 档`；同一笔里已跟踪的档照判。不造拒绝、不造兜底。

**判读人**：上面六条由本批改动面的单测档判读（命令 `node --test <该档>`；本节不点它的名——那份单测档随本批收口删除，写在这里就是一条注定失效的指针）。

第六条 `.gitignore` 那一半的用例标题逐字「加不进索引的档（`.gitignore` 挡住）⇒ 变更区落空 ⇒ 零输出（取舍钉成读数，不造拒绝）」；持锁那一半按本节「加不进去的例外」的复现读。AC-10 ∥ AC-11 那两半另有常驻集成行，见 §9「缺的」表的最后两行，父侧收口前跑一次。

**同类先例**：`thincoder-core/agent-tools/batch-gate.mjs` 的 `evaluate`（现判整份）∥ §3 第二条例外（批档整份不判悬空）。对齐：三处共用同一套三件判据与同一套报面句子，只加减**哪些档**进判域。偏离：两处先例按**档**加减（整份进、整份出），本节按**行**收窄——同一份档里判哪些行，段长再按段扩。既有形不适用：档级开关落不到「本笔改的是哪几行」这个问题上，它只能整份放或整份拦。

**库内 = 已查**：`判域 收口 变更区 diff` → 本档 §8（快照取法）∥ §9（两个时点）· `thincoder-core/agent-tools/batch-regions.mjs`（只出档清单：`committedDocs` ∥ `diffBaseOf`）· `thincoder-core/agent-tools/batch-gate.mjs` 的 `evaluate`（现判整份，无区间筛选）· `thincoder-core/doc-check/paragraph.mjs` 的 `paragraphHits`（只带段首行与字数）。

**库外 = 已查**：声明源 = `PROJECT-MANIFEST.json` 的 `index.publicRepos` 两处（`../.thincoder` ∥ `../thincoder.com`）→ 两仓逐仓 grep 过 `doc_check` ∥ `判域` ∥ `changed region`，**零命中**，无相关：这两个仓不是本门的判据面。改动面全在仓内判定逻辑，外部断言 = 零。

## 7. 落点

判据住在 `thincoder-core/doc-check/`：段判据一档、行号锚一档、存在性一档（面别豁免与在途清单都住这一档），装配与报面句子在 `index.mjs`。三个调用点都调这一套——`doc_check` 工具面、`.md` 落盘前那道门、`batch` 的写入与收口；各自站在哪个时点、批档判不判，见 §9。

## 8. 码档原始行数：批档 §2 的那一列，和谁比对它

批档 §2 的受影响文件表多一列**行数**——写该档的原始行数。设计席当刻现量填，收口臂逐档比对，对不上即拒。

**这不是 `doc_check` 的第四条判据**：本门的判据仍是 §1 那三件。本节判的是批档 §2 的记录缺件，执行面 = 批档收口臂。

**为什么要有这一列**：用户原话是「如果不要求它先读行数，他就会无视拆档纪律，要要求它的输出里包含每个代码文件的原始行数，不要报其他数」。不量就判，判的是印象；量了再判，判的是数。

**同类先例**：实现坐标 = `thincoder-core/agent-tools/batch-tier-gate.mjs` 的 `assertTierPlan`（现役三实参）。
对齐：同一条收口臂、同一份 `machineListRowsOf` 解析面、同一种拒文两件（「要写什么」∥ `Nothing was written.`）。偏离：加第三列与比对一半，理由 = KD-3（读数进表列，不另起围栏读数块）。

**库内 = 已查**：`tier plan gate §2 逐档行数` → `thincoder-core/agent-tools/batch-tier-gate.mjs`（现役实现）· `docs/core/standards/CODE-TIER.md` §2（判据语义单源）· `docs/core/standards/METHODOLOGY.md` F-R24a（逐档报原始行数）· `test/RTM.md` 故事索引（`CLI 7` ∥ `CLI 13`）。
**库外 = B 类**：改动面全是仓内判定逻辑，外部断言 = 零。

**三个新名的三问**：

- 第三列标签「行数」= `existing:` `thincoder-core/agent-tools/batch-skeleton.mjs` 的 §2 模板占位行里的那张表，名称沿用，不另起 · 谁 = 属主同一处模板；消费方 = 收口臂 `assertTierPlan`（`machineListRowsOf` 解出那一列）。
- `新` = `none found:` `thincoder-core/agent-tools/` 全仓无「无基线」取值（同形取值只有空 ∥ `—`，本设计把它们判作缺读数）· 谁 = 属主 = 本节（取值语义）；消费方 = 收口臂 `assertTierPlan` 的读数支 + 写这张表的设计席。
- `baseTextOf` = `none found:` `thincoder-core/agent-tools/batch-gate.mjs` 只有 `baseShaOf`（取号，不取内容）；`refs/thincoder/baseline` 全仓只命中文档、无代码 · 谁 = 属主 = 调用方（`batch-closeout.mjs` 造出 `baseTextReaderOf` 交进来）；消费方 = `assertTierPlan` 的读数支（非函数 ⇒ 入参缺件拒）。

**判域 = 本批改动面里在盘的代码档（源 ∥ 单测）**，不是只判越了线的那些。

`docs/core/standards/METHODOLOGY.md` 的 F-R24a 原文就是「列出本批将改的源 / 测试文件，**逐档报出该档的原始行数**」。收窄成「只报越线的」有两处不合：那是把用户的话改小，且倒因为果——**越没越线正是量了才知道的事**；只判越线的档，等于让 480 行那一档永远不必量，而它正是下一批越线的那一档。

代价照实认：每批得量全部改动码档，一次 `doc_check` 的 `lines` 面就够。

**列形 = 第三列，追加在末尾**：`| 档 | 分拆方案 | 行数 |`。

解析面 = `thincoder-core/agent-tools/batch-segment-vocab.mjs` 的 `machineListRowsOf`，2 格 ∥ 3 格都收：第一列仍是档、第二列仍是方案，加列不移位，旧的两列行照旧解得开。

**两格行 = 该档缺读数**：正因为解得开，它落进「该格没有数」那一支——按缺读数拒并点名该档，不是把整张表解析成空。

**值形只有两种**：剥掉装饰符（反引号 ∥ 星号）与首尾空白后，落在 `^\d+$`，或字面 `新`。

空 ∥ `—` ∥ 带单位（`516 行`）∥ 区间 ∥ 约数（`~516`）∥ 非整数，一律按缺读数拒——给「大致」留一个位置，就是给编数留一个位置。

**`新` = 批起快照里没有这一档**：批起那一刻它不在树上（本批期间建出来的档 ∥ 存量批里前批建了还没提交的档 ∥ 被 `.gitignore` 挡住的档），当刻没有数可报。写 0 会被读成「量过、是空的」；写别的数就是编。门那一侧核一遍：写 `新` 而快照里其实有这一档 ⇒ 拒。

上一批建好、只是还没提交的档**不在**此列：它在批起快照里有内容，照实报数。

**存量批（建档早于全树快照机制）记 `新`**：机制上线前的批，`批起 sha` 实为一份 HEAD 提交，快照里本就没有未跟踪档——那些档照实写 `新`，门核的是「快照里确实没有它」，核得住，因此不算漏。机制上线后的批，快照含未跟踪档 ⇒ 那些档必须报数，报 `新` 即拒。判据不看批的年份，看快照里有没有那一档。

**`新` 的成因写在表外，不强制**：快照里没有这一档有三条来路——本批新建 ∥ 存量批里前批建了还没提交 ∥ 被 `.gitignore` 挡住（多见于构建产物）。第三条没有「哪一批建的」可写，所以成因只作旁注：写在表外，写不写都不进判据；那一格的值形仍只认数字 ∥ `新`。

**比对目标 = 该档在批起快照上的内容行数**，量法 = `countContentLines`（单源 = 本档 §1）。基线内容由调用方取，本门只量。

**这一处的数与 §2 ① 的 500 不同源**：500 判的是改代码前的长度（设计席自己量）；本节判的是快照上的读数写没写对。快照 = 建档那一刻的工作树，所以机制上线后两者同数。
存量批的快照只是一份 HEAD 提交（本批自身即此形，两列读数住批档 §2），未提交的改动不在其中——那些批里那一格要写**快照读数**（本门按它判），而 500 那条仍按改前长度判，两个数不同不算矛盾。

**批起快照 = 建档那一刻工作树的形状**，不是「已提交的那一份」。存 = 批档 §1 的记入行 `批起 sha = <sha>`；取内容 = `git show <批起 sha>:<档>`。

这条记入行的读法单源 = `thincoder-core/agent-tools/batch-gate.mjs` 的 `baseShaOf`（依据 thincoder-core/agent-tools/batch-gate.mjs「的取法（唯一）= 批档 §1 的记入行 `批起 sha = <sha>`」）。收口臂复用它，不另写一份解析。

为什么不拿 HEAD 当基线：本仓工作区常带未提交的改动，而设计席看到的是工作区那棵树。拿已提交的内容作基线，任何在批起时就带着未提交改动的档，读数与基线必然对不上——门会拒掉一个完全没错的设计席。

实测（本批起时，读数住批档，不抄进本节）：本批改动面的三个已跟踪码档，工作区读数与 HEAD 读数三个都不同，且差得不小；第四档在 HEAD 上不存在、在盘上有内容。

**快照怎么取**（建档时一次；不碰工作区、不改索引）：

```text
export GIT_INDEX_FILE=<临时索引路径>
git read-tree HEAD
git add -A
tree=$(git write-tree) ; sha=$(git commit-tree $tree -p HEAD -m "batch-start snapshot")
```

`git add -A` 走的是临时索引，所以未跟踪档一并入树——「上一批建好、还没提交」正是本仓的常见形状。

**不用 `git stash create`**：它只收已跟踪的改动，未跟踪档不入快照。实测（同一棵树）：它的树里 `thincoder-core/agent-tools/batch-tier-gate.mjs` 与 `docs/core/standards/CODE-TIER.md` 都不在，而两档都在盘上。按它判 `新`，等于给每个未跟踪码档开一个「不必量」的口。

**快照对象必须挂 ref**：`git commit-tree` 产出的是游离提交，没有 ref 指着它，`git gc` 一收就没了；批档里写一个随时会消失的 sha，等于把基线建在沙上。落地形 = 建好后挂 `refs/thincoder/baseline/<批档名>`，记入行的 sha 取该 ref 指的提交。取内容照旧走 `git show <批起 sha>:<档>`；门先核记入行指向的对象读不读得到，读不到 ⇒ 按「基线不可判」拒，不静默退回头。存量批没有这个 ref（见「存量批」条），它靠记入行的 sha 直接读。

**改动面那条腿取 `<sha>^`，读数那条腿取 `<sha>`**：快照是 `commit-tree -p HEAD` 造出来的旁支提交，拿它直接 `git diff <sha> HEAD` 量改动面，建档时就脏的档全被算成本批改过，而随批提交的档反掉出去。所以读数基线仍是快照（设计席看到的就是那棵树），改动面跑 `git diff <sha>^ HEAD` —— 快照的第一父就是建档那一刻的 HEAD。

**识别靠结构，不靠提交信息约定**：`git merge-base --is-ancestor <sha> HEAD` 成立 ⇒ 那是机制上线前批的 HEAD 提交，原样跑 `git diff <sha> HEAD`；不成立 ⇒ 它是快照，取 `<sha>^`。约定会被人改掉，改掉那一刻是静默变宽或变窄；祖先关系是结构，不靠人维护。

不比收口时的盘上长度，因为本批的实施就是要改它：`docs/core/standards/CODE-TIER.md` §2 ① 定「**基准 = 改代码前的长度**：判本批改动**之前**该档的读数。不是改动之后的行数，也不是改动的预测增量」；F-R24a 同句定「只报一个数——设计时量到的那一次读数」。拿改后的长度去比，每一个改过码档的批都会被自己拒。

| 现场 | 判 |
|---|---|
| 基线里有这一档 | 该列读数 = 基线读数 ⇒ 过；不等 ⇒ 拒（点名档 · 写的是几 · 基线是几） |
| 基线里没有这一档 | 该列 = `新` ⇒ 过；写别的任何值 ⇒ 拒（点名档 · 写的是什么） |
| 清单里没有这一档的行 ∥ 该列空 ∥ 只有 `—` | 拒（点名档 · 基线读数） |

**基线读不出来 ⇒ 拒，不静默放行**：批档 §1 没有 `批起 sha` 记入行，或那个 sha 指向的对象读不到（快照已被回收），读数就没有比对基准。此时放行等于「没核」，而这一半的实质就是核。

**这一支的活场景（不是机理推演）**：

- 存量批：盘上多数批档的 §1 没有 `批起 sha` 记入行（读数住批档 §2），`baseShaOf` 返 `null`，收口一跑就落这一支。复现 = 取一份无记入行的批档跑一次 `close`。
- 非 git 目录建出来的批：`create` 取不到 `HEAD` 时 §1 写「未取到（原因）」（取法 = `thincoder-core/agent-tools/batch-ledger-bind.mjs` 的 `baseShaForCreate`），同样解不出 sha。

两支同一句话：读数没有比对基准就不放行——放行等于没核。

**「有没有 ref」不进判据**：ref 只负责让那个对象不被回收，不是取内容的入口。存量批本来就没有 ref（见「快照对象必须挂 ref」条），它们的读数照记入行的 sha 直读；ref 被删掉而对象还在，读数照样读得出来。拒的条件只有一个——记入行的 sha 指向的对象读不到。

调用方交进来的那个函数分三值，三者行为不同：

| 返回 | 含义 | 判 |
|---|---|---|
| 串 | 该档在批起快照里的内容 | 用 `countContentLines` 量，与那一格比 |
| `null` | 快照里没有这一档 | 那一格只认 `新` |
| `undefined` | 基线不可判（没有可用的批起 sha） | 拒，整批一条，不再逐档比 |

**两个失败怎么分开（调用方的动作序）**：`git show <sha>:<档>` 对「快照里没这一档」与「那个对象读不到」报的错同形；照错文分流，第一个有新建档的批就会被整批拒，而 `新` 正是本设计的地基。调用方按三步问，各问一件：

```text
git cat-file -e "<批起 sha>^{commit}"   # 非零 ⇒ 返 undefined（基线不可判），到此为止，不再逐档问路径
git cat-file -e "<批起 sha>:<档>"       # 非零 ⇒ 返 null（快照里没有这一档）
git show "<批起 sha>:<档>"              # 解得开 ⇒ 返串
```

两者分得开的理由是判据不同（对象在不在 ∥ 路径在不在），不靠 stderr 的字样。

第四实参不是函数（缺 ∥ 传了别的）⇒ 入参缺件拒，点名该参数——它不是缺省。

**拒文（逐字 · 一句「要写什么」管两类）**：

```text
batch: 码档缺原始行数 ∥ 读数与基线不符（收口前置门 · tier-reading gate）— close refuses: a code file this batch changed carries no usable line reading in §2's 受影响文件（机读清单）（判的是记录缺件，不是代码长短）:
  thincoder-core/agent-tools/a.mjs — 写的是 120，基线是 176（拿已提交的 HEAD 当了基线）
  thincoder-core/agent-tools/b.mjs — 该列没有数（空 ∥ `—`）；基线是 88
  thincoder-core/agent-tools/x.mjs — 写的是 40，而批起快照里没有这一档；本批期间建的档写 `新`
  thincoder-core/agent-tools/y.mjs — 写的是 `新`，而批起快照里这一档有 88 行
  thincoder-core/agent-tools/z.mjs — §2 清单里没有这一档的行；基线是 331
要写什么：在 §2「受影响文件（机读清单）」的第三列写该档的原始行数——量法 = `countContentLines`（单源 = 本档 §1）；取数 = 该档在**批起快照**上的内容（取法 = 本节「快照怎么取」）；快照里没有这一档就写 `新`。只报这一个数：不写增量 ∥ 百分比 ∥ 超了多少行。本门只拒、不代改。Nothing was written.
```

基线不可判另走一句（它不是逐档读数的问题，是整批的比对基准缺件）：

```text
batch: 批起基线不可判（收口前置门 · tier-reading gate）— close refuses: §1 has no usable `批起 sha`（缺记入行 ∥ 该对象读不到），读数的比对基准不存在，这一半无从核起:
要写什么：在 §1 记入行写 `批起 sha = <批起快照 sha>`（取法 = 本节「快照怎么取」）。本门只拒、不代改。Nothing was written.
```

**与「越线必给方案」的先后**：同一臂里跑一遍，两节的发现拼成一条拒文。

读数先判（缺数是更前一件缺件），方案后判；设计席一次改完再收口，不必为同一张表收口两次。两条的触发物不同：读数支 = 改动面里有码档（几乎每批都有），方案支 = 其中实测越了 500 的档。

**「§2 缺块本身不是拒因」照旧成立**：块缺时拒的是「每个码档都缺它那一行读数」，不是「格式没写对」。

**边界**：

- `.md` 档零行数义务（判域 = 代码档，`docs/core/standards/CODE-TIER.md` §1）。
- 500 ∥ 800 两个数值一律不动；本门不新增判定时点（`docs/core/standards/CODE-TIER.md` §2 ③：中间一概不判）。
- 本门不读 git：基线内容由调用方交进来，缺了按入参缺件拒。
- **快照对象读不到 ⇒ 按「基线不可判」拒**：响，不静默——不会被读成「批档没写数」；拒的条件单源 = 本节「基线读不出来 ⇒ 拒，不静默放行」条，与 `refs/thincoder/baseline/<批档名>` 在不在无关。
- **`.gitignore` 挡住的档不入快照**：这类档在基线上读作「没有」，照 `新` 判。判域是码档，落在这里的通常是构建产物。
- 判的是「设计席量没量、报的数对不对」，不是「代码多长」。

**集成测试设计（从 `test/RTM.md` 索引出发的 delta）**

（本节的 delta 只服务上面这一条第三列读数，与本档 §9 的 delta 是两回事。）

这次改的是收口臂里的一条判定，业务可观测结果 = 一次 `batch close` 放行还是被拒；入口 = 父侧 depth-0 的 `batch close`（与 RTM 故事 `CLI 7` 同一条轨）。逐面答一遍：

**破的 = 无**。判据：读数支只在改动面里有码档时启动，而 `test/integration/batch-close-gate.test.mjs` 各例的触达账与提交 diff 腿只带 `.md`；唯一带进码档的是 `7-4` 的批档同目录单测档（裸名 `fixture.test.mjs`），它先被本批单测档臂拒，拒文与判序都不变。

**冗余的 = 无**。

**缺的 = 两行**，都是这次新判定自己的面：

| 新行 | 组件交互 | 断言的业务结果 | 服务需求 | 入口 |
|---|---|---|---|---|
| `7-19` | `batch close`（父侧）⟷ 收口臂 `assertTierPlan` ⟷ 批起快照（`git show`） | 改动面里一个码档、§2 那格缺读数 ⇒ 收口被拒，拒文首句含 `tier-reading gate` 并点名该档；补上快照读数 ⇒ 同一次收口放行 | F5（§2 机读清单的形与取值）∥ `docs/core/standards/METHODOLOGY.md` F-R24a（逐档报原始行数） | 真 `batch close` |
| `7-20` | 同上，判的是读数那一半 | 那格写的数与快照读数不等 ⇒ 拒，拒文逐档写出「写的是几、基线是几」；改成快照读数 ⇒ 放行 | 同上 | 真 `batch close` |

两行的编号已在 `test/rtm/guard.md` 的 `CLI 7` 表里（`7-19` ∥ `7-20`），用例标题按号写，证据档 = `test/integration/batch-close-gate.test.mjs`。

## 9. 两个时点：批档只在「写」的那一刻判

判据三件不变（§1）；本节定的是**什么时候判哪些档**。

| 时点 | 量的是什么 | 批档判不判 | 调用面 |
|---|---|---|---|
| **写时点** | 手上正在写的那段文本 | 照判：段长 ∥ 行号锚（悬空按 §3 第二条例外免） | `batch` 的 `append` ∥ `edit`；`.md` 落盘前那道门 |
| **收口时点** | 几小时前写下的执行记录，而现态已经变了 | 整份不判、且不进判域 | `batch close` ∥ `status → 已收口`（判变更区，§6）；`doc_check` 的 `gate` mode（判变更区，§6）∥ `report` mode（判整份，诊断面） |

本节改的只有批档面这一族的判域时点：除批档面之外的档（含工具描述面 ∥ `thincoder-core/tool-docs/` 下的描述单源）什么时候都照判三件——§1 那三件不按适用面挑。

**为什么分两个时点**（用户 2026-11-12 15:07）：「不是不进任何机检，写门保留，收口不验」。写的那一刻，量的是正在产生的文本，量得出缺陷；收口那一刻，量的是几小时前的记录，现态已经变了，量得出的是时间差——报出来的是记录与当下的距离，不是缺陷。

**`doc_check` 工具面站在收口那一侧**：它不是写，它读的是已经在盘的档；读的时候现态早已变了，与收口的处境同一。把它留在写那一侧，等于把同一份记录换个门口再判一遍。它的两个 mode 不因此同判：`gate` 是交付判定、判变更区，`report` 是诊断面、判整份（§6）。

**一条谓词，住在装配档**：`thincoder-core/doc-check/index.mjs` 出 `judgedDomainDocs(docs, { moment, root })`——写时点原样交回，收口时点把批档面整份移出判域。收口臂 ∥ `doc_check` 工具面 ∥ 落盘前那道门三面都调它，谁都不各写一份「批档免不免」。

这个函数上挂着两道滤：上面这道认批档面，第二道认排除面（§10）——「哪些档进来」的加减只在它这一处发生。

三个参数各有理由：

- `docs` = 候选清单（绝对路径，或相对 `root` 的路径），交回的条目保持原形。非数组一律抛——读成空判域会印出一个什么都没判过的 `PASS`。
- `moment` = 这一刻谁在调，**必填**，闭集 `MOMENT.writer` ∥ `MOMENT.close`（字面就是 `batch` 门 `scope` 那对词，一件事一个名字）。给别的值即抛——它决定批档判不判，缺省值等于替调用者决定这件事；场景见下条。
- `root` = 项目根，`isBatchFace` 的必要第二参。给了 `root` ⇒ 每条按 `resolve(root, 条目)` 定位，**绝对条目以条目自身为准**（`path.resolve` 遇绝对路径忽略基根）；`root` 只在某一档往上找不到项目根时充当回落基准。
- `root` 缺省（不给 ∥ 非串 ∥ 空串）⇒ **不抛**：相对条目按进程 cwd 解析，每份档各自沿自己往上找最近的 `PROJECT-MANIFEST.json`，一个都没有 ⇒ 回落该档所在目录。三个调用面都显式交 `root`；这一支留给直接调谓词的场景。

**两条守卫各自的活场景（不是机理推演）**

- **`moment` 闭集**：调用方把 `moment` 写成 `"Close"`（首字母大写）或干脆漏传。没有这条守卫时，`moment !== MOMENT.writer` 成立 ⇒ 这一笔静默落进收口那支，批档被整份滤出判域，而调用者以为自己在写时点。复现：`node -e "import('./thincoder-core/doc-check/index.mjs').then(m => console.log(m.judgedDomainDocs([B], { moment: 'Close', root: '.' })))"`（`B` = 手上任何一份批档的路径）⇒ 抛 `doc_check: unknown moment "Close" …`；把同一句的 `'Close'` 换成 `'close'`（收口支本身）⇒ 返回 `[]`——那正是没有守卫时它静默走到的结果。
- **写门的判域身份**：`thincoder-core/tools/doc-write-gate.mjs` 把 `moment` 传成 `MOMENT.close`（接线差一个词）。判域于是把目标批档滤掉 ⇒ 判了 0 档 ⇒ `hits: 0` ⇒ 带 350 字正文段的那一笔照落盘、门报干净。复现：把该档交 `moment` 的那一处实参临时改成 `MOMENT.close`，对一份批档跑一笔带 350 字正文段的写 ⇒ 命中守卫、拒文点名 `doc_write_gate`；去掉守卫再跑同一笔 ⇒ 照落盘、`hits: 0`。

判法不变；`judgeText` 只多收一个 `region` 入参（§6）——它对批档面的悬空豁免正是**写时点**那条规则，两件事各有自己的单源。

**引擎里只有一个入口**：`runDocCheck(root, { docs, moment, regions })` 先在入参上收 `moment` 与 `regions`，再算判域。工具面与任何直接调它的地方（集成用例也算）因此拿到同一个时点，不必各自再算一遍。

**空清单的护栏判的是交进来的清单**：一张都没给 ⇒ 抛；给的全在判域外 ⇒ 判完 0 档、回执只有 `PASS` 一行。两件事不同，后者是这一批确实没有别的档可判。

**批档面怎么认，不新造**：落在 `docRoot.batches` 之下的档（子目录也算）即批档面——谓词 = `thincoder-core/doc-check/existence.mjs` 的 `isBatchFace`，与 §3 第二条例外同一个。

**两个新名的三问**（住哪 · 叫什么 · 谁）：

- `judgedDomainDocs` = `none found:`（`thincoder-core/doc-check/` 与 `thincoder-core/agent-tools/` 全仓无「按调用者时点裁判域」的函数；最近的相邻件是 `isBatchFace`，它只认面、不分时点）· 住 `thincoder-core/doc-check/index.mjs` · 谁 = 属主同一档（唯一实现），消费方三面：`runDocCheck`（引擎唯一入口）∥ `thincoder-core/tools/doc-write-gate.mjs`（写时点）∥ `thincoder-core/agent-tools/batch-gate.mjs` 的收口臂（收口时点）。
- `moment` = `existing:` `batch-gate.mjs` 的 `scope`（`writer` ∥ `close`），名称与取值沿用，不另起一套词 · 住 `index.mjs` 的 `MOMENT` 闭集 · 谁 = 属主那一处常量；读它的是 `judgedDomainDocs`，透传它的是 `runDocCheck`，三个调用面各报自己的位置。

**判域跟着缩，两个面同一个数**：`范围 N 档` 的定义是「真判过的档」（`thincoder-core/agent-tools/batch-gate.mjs` 的 `range.count`）——不在判域却计入，就是让回执说一件没发生的事。`doc_check` 工具面的 `checkFiles` 同理。`CLI 7-7` 断的正是这两个数相等，所以它们只能一起动：笔域集只含批档自身时，回执读作 `PASS · 范围 0 档`。

**写时点判据照 §1 那三件，一件不加**（用户 15:07 ②「写门保留」）：`thincoder-core/tools/doc-write-gate.mjs` 落盘前判改后整份，交 `judgeText` 的判据、拒文与报面句子按 §1 ∥ §5；它在入参上把这一刻报成 `MOMENT.writer`。

那个实参的消费方 = `judgedDomainDocs`：写时点它把清单原样交回，所以写门拿交回的清单当判域时，里面必须仍是目标档自己。判域与目标档对不上 ⇒ 接线错了，当场抛带门名的错（场景见上「两条守卫各自的活场景」），不转发 `resolve(undefined)` 那类语言错，也不静默判零条——判零条会交一个「门没判过却报干净」的 `hits: 0` 放行。

**边界**：

- **不按批档 §1 状态行分**（已收口 ∥ 在途）：时点由**谁在调**决定，不由被调的那份记录决定。旧批档在收口时点照样不判。
- 不加「只列不拦」的第四种调用面，也不给在途批档做「先判后放行」。
- 收口不判批档 ≠ 批档没有标准：写的那一刻照判（上表第一行）。
- 收口时点对批档不出命中，**不是**「不在盘，未判」——那一句留给读不到的档，两者在回执里各是各的行。
- 工具面只剩批档一份时，回执只有 `PASS` 一行——它说的是「这一批没有别的档可判」，不是「判过且干净」；批档在写的那一刻判过，那一次的判决在写门回执里。

**验收：判读人与怎么跑**

- **判读人 = 本批改动面的单测档**，命令 `node --test <该档>`（档名与读数住批档 §2；本档不点名——批档可整份删掉，判据不能在那一刻跟着死）。判读 = 同一档在改前代码上红（收口照判批档、`范围` 数得到它），改后绿。
- **覆盖的判域分支**：`judgedDomainDocs`——`docs` 非数组 ⇒ 抛 · `moment` 非闭集 ⇒ 抛 · `writer` 原样交回 · `close` 把批档面整份移出 · `root` 给出 ∥ 缺省两形 · 绝对条目与 `root` 并存时以条目为准。`runDocCheck`——`docs` 非数组 ∥ 空清单 ⇒ 抛 · 清单全在判域外 ⇒ `PASS` 一行、`checkFiles` 为空 · 判域内某档不在盘 ⇒ 出「不在盘，未判」，既不当命中也不当干净。§8 那一支的三值（串 ∥ `null` ∥ `undefined`）不属本批改动面，它的判读人 = §8 集成 delta 的 `7-19` ∥ `7-20` 两行。
- **行为面的三条结论**（同一次夹具各断一句）：一份三样俱全的批档跑收口 ⇒ `PASS`、三样零出、`范围 0 档`；同一份批档在写时点写 350 字正文段 ⇒ 拒、写悬空档名 ⇒ 零输出；同形内容写进设计档 ⇒ 两个时点都照报三样。
- **回指**：`docs/core/requirements/DOC-CHECK.md` F1（段长）∥ F3（悬空）∥ F6（两个时点）；行号锚一条 = 同档 AC-2。
- **常驻的恢复 = `CLI 7-21` ∥ `7-22` ∥ `7-23`**：批档一关，单测档随之删掉，这三行接着看同三条结论。

**同类先例与库内调查**

- **同类先例**：§3 第二条例外（批档整份不判悬空）。对齐：同一个谓词 `isBatchFace`、同一个理由（记录不是导航）；偏离：那条只管悬空、且不分时点——收口那一刻段长与行号锚照判。
- **库内 = 已查**：`批档 面别 时点 收口` → `docs/core/design/DOC-CHECK.md` §3 ∥ §7（现役判据与三个调用点）· `thincoder-core/doc-check/index.mjs` 的面别支 · `thincoder-core/agent-tools/batch-gate.mjs` 的 `scope` 两值 · `test/rtm/guard.md` 故事 `CLI 7`（十九态现役用例，含 `7-19`–`7-23`）。四处现状都按「批档只免悬空」写。
- **库外 = 已查**：声明源 = `PROJECT-MANIFEST.json` 的 `index.publicRepos` 两处（`../.thincoder` ∥ `../thincoder.com`）→ 两仓 grep 过 `doc_check` ∥ `判域` ∥ `changed region`，零命中、无相关：本节的改动面全是仓内判定逻辑与仓内测试，外部断言 = 零。
- **受影响码档与逐档快照读数住批档 §2**（读数不进本档）。改前盘上长度无一越过 500，本批无拆档方案——怎么核的 = `countContentLines`（`thincoder-core/agent-tools/batch-tier-gate.mjs`，量法单源 = 本档 §1）逐档量改前盘上内容，每档一个数，读数住批档 §2「档位结论」。
- **函数档**：本批动到的函数 = `judgeText` ∥ `runDocCheck` ∥ `judgedDomainDocs`（`thincoder-core/doc-check/index.mjs`）· `paragraphHits`（`thincoder-core/doc-check/paragraph.mjs`）· `evaluate`（`thincoder-core/agent-tools/batch-gate.mjs`）· `changedRegionsOf`（`thincoder-core/agent-tools/batch-regions.mjs`，本批新建）；逐个都在函数档线（300 行）之下，无拆函数方案，逐函数读数住批档 §2。

**集成测试设计（从 `test/RTM.md` 索引出发的 delta）**

入口 = 父侧 depth-0 的 `batch close` ∥ 子代理 `append`（故事 `CLI 7` 同一条轨）。

**破的 = 两行。**

- `7-22`：两个 mode 各断一半——`report` 判整份 ⇒ `REFUSED`，`gate` 只判变更区 ⇒ `PASS` 且一行不出。
- `7-14`：判据格指 §9 写时点（判据格是回指，断言本身不随它变）。

**另一组六行不属于「断的东西变了」**：`7-1` ∥ `7-2` ∥ `7-3` ∥ `7-5` ∥ `7-9` ∥ `7-13` 的范围数与拒绝断言按本节口径成立。

这六行的夹具把批起基线取成真快照（`commit-tree -p HEAD` 的旁支提交）；基线落在一份旧形祖先提交上时，按 §6「② 的失败面」整批零输出。

**`7-7` 不在破的里**：它断的是 `范围 0 档` = `checkFiles` 0 这个等式（见「判域跟着缩，两个面同一个数」），两处同数正是它要看着的。

**冗余的 = 无**：现役二十一行里已有四行断着写时点那一半——`7-6` ∥ `7-8` 断「批档整份不判悬空」（同一句搬进设计档照判）、`7-5` ∥ `7-13` 断段判据的围栏与列表语义。它们各断一半，没有一行把「段长拒 ∥ 悬空放」摆在同一份批档上；`7-21` 是这一对同场的第一行，因此不是重复。

**缺的 = 两行**（`7-24` ∥ `7-25`）：判的是本节新增的判别性一半。

| 新行 | 组件交互 | 断言的业务结果 | 服务需求 | 入口 |
|---|---|---|---|---|
| `7-24` | `batch close`（父侧）⟷ `runBatchGate(scope: close)` ⟷ `changedRegionsOf` ⟷ `judgeText` | 一份设计档：一条悬空指针与一段 400 字都落在本批变更区之外 ⇒ 收口放行、回执零附加行；把同一条指针挪进区内（本批改到那一行）⇒ 同一笔 `REFUSED` 并点名该处——两半都成立才算过 | F8 ∥ AC-10 | 真 `batch close` |
| `7-25` | 同一夹具，判的是段长那一半 | 区外一段 400 字 ⇒ 放行；区内某段含变更行、整段超 300 字 ⇒ `REFUSED`——两半都成立才算过 | F8 ∥ AC-11 | 真 `batch close` |

`7-21` ∥ `7-23` 各看一半：一行看写时点那一半，一行看「收口时点批档整份不进判域」；`7-22` 见上「破的」。

**描述面与注释面与行为同一口径**：`thincoder-core/tool-docs/doc_check.md` 是 `doc_check` 的模型可见描述单源。工具面在收口时点不判批档、`checkFiles` 也不数它，这一口径同样写在那份描述里——描述与行为不一致时，模型照描述去用这个工具。

**另三处写着本节的口径**：`test/integration/batch-close-gate.test.mjs` 档头 · `test/integration/close-gate-fixture.mjs` 注释（取材面含批档自身，收口判域才滤）· `test/rtm/guard.md` 的 `CLI 7` 目的句与节注（二十二态在表上，`7-24` ∥ `7-25` ∥ `7-26` 含在内；`7-7` 断 `范围 0 档`）。

`CLI 7` 表现二十二态，各管哪一半：`7-21` ∥ `7-23` 看两个时点，`7-22` 看两个 mode 分家，`7-24` ∥ `7-25` 看区外放行与区内照判，`7-26` 看排除面（声明前缀下的档不进判域）。用例标题按号写，证据档 = `test/integration/batch-close-gate.test.mjs`。


## 10. 排除面：`index.docCheckExcludePaths`

**一句话**：项目 manifest 声明的排除前缀，决定**哪些档不进判域**——判据仍是 §1 那三件，一件不加，也不多出一种「不看某处」的写法。

- 声明处 = 该档自己所属项目 manifest 的 `index.docCheckExcludePaths`（数组；项目根相对路径前缀）。
- 归一单源 = `thincoder-core/declaration.mjs` 的 `normalizePathList`（首部 `./` 剥离 ∥ `\`→`/` ∥ 去尾斜杠 ∥ 空与非串剔除 ∥ 去重保序），与 `index.excludePaths` 同一把尺，本门不另写一份。
- 命中形：档的项目根相对路径**等于**某前缀，或**以「前缀 + `/`」起头**。不拿裸前缀比：声明 `docs/_arch` 会把 `docs/_archive-x` 之下的档一并吃掉，那不是声明的意思。

**这个键不是新起的（`existing:`）——三问的答案**

- **住哪** = `thincoder-core/manifest-schema.mjs` 的 `DEFAULT_MANIFEST.index` 里已经冻结着它（依据 `thincoder-core/manifest-schema.mjs`「docCheckExcludePaths: Object.freeze([])」），数组层校验也已在（非数组 ⇒ 进 `errors`）；归一函数 = `thincoder-core/declaration.mjs` 的 `normalizePathList`。
- **叫什么** = `docCheckExcludePaths`，逐字沿用。它是 manifest 的公开键，改名就是改声明面，不在本门手里。
- **谁** = 属主 = schema 那一处键与 `normalizePathList` 那一处函数；今天**零消费方**（全仓 `.mjs` ∥ `.json` 只命中 schema 自身、`PROJECT-MANIFEST.json` 的空数组、两处注释）。本批把消费方接成 `judgedDomainDocs`：缺的那一环只有「读键进谓词」，键 ∥ 形 ∥ 归一三件都现成。
- **schema 的 `[]` 缺省就是「读不到 ⇒ 照判」落到的那一侧**：没有声明 ⇒ 清单空 ⇒ 一份档都不放行。两者是同一件事的两种写法，不是两条规则。

**落在排除面上的档**：三件一件都不判、不出命中、不进 `checkFiles`（`范围 N 档` 因此数不到它），也不出「免检」「已排除」一类行。全清单都落在排除面上是合法状态：首行照常 `PASS`，零附加行。

**坐在哪**：`thincoder-core/doc-check/index.mjs` 的 `judgedDomainDocs` —— 判域谓词本来就只有这一处、三个调用面共用（§9）。排除面是第二道「哪些档进来」的过滤，与批档面同处同形：先认批档面，再认排除面。

**写时点也吃这一条**：写门与批档 `append` ∥ `edit` 走的是同一个谓词，所以排除面上的档，写的那一刻也不判。一个档要么在门里、要么不在，不按调用面分家。

**读不到 manifest ⇒ 照判**：排除是声明面给的放行，没有声明就没有放行。manifest 读不到时排除面为空、档照判——这一支的方向与 §1「判得准才判」一致：宁可多判一份档，不替项目放行一份它没声明排除的档。

- **出处（两条都在盘上）**：`thincoder-core/manifest.mjs` 的 `readManifest` 对盘上没有的 manifest 返 `ok: false` ＋ `reason: "missing"`（依据 `thincoder-core/manifest.mjs`「return { ok: false, reason: "missing", errors: [], missingKeys: [], unknownKeys: [], manifest: null }」）；读不到 ∥ 不可用的 manifest 走的就是全默认声明那一支（依据 `thincoder-core/declaration.mjs`「// missing / unusable manifest → the defaults, root still known」），而这个键的默认值就是 schema 里那个空数组。
- **复现（两条，环境里真造得出来）**：
  - *没有 manifest 那一半*：夹具根造一份带三样的档（400 字正文 ∥ 仓内不存在的档名 ∥ 一处行号锚），不写 `PROJECT-MANIFEST.json`；`doc_check` 的 `report` 面指名它 ⇒ `REFUSED`，三条照出。该档往上找不到自己的项目根时，`projectRootOf` 回落到调用方给的基根，基根那份 manifest 也没有这个键 ⇒ 同样照判。
  - *键写成非数组那一半*：同一份夹具的 manifest 写 `"docCheckExcludePaths": "docs/tmp"`（串而不是数组）⇒ schema 数组层 fail-closed（依据 `thincoder-core/manifest-schema.mjs`「if (obj.index.docCheckExcludePaths !== undefined && !Array.isArray(obj.index.docCheckExcludePaths)) {」）；即便读方拿到的是一份带错的 manifest，`normalizePathList` 对非数组返空清单（依据 `thincoder-core/declaration.mjs`「if (!Array.isArray(v)) return []」）⇒ 排除面为空 ⇒ 同一份档 `REFUSED`。

**不进这一条的东西**：`index.excludePaths`（文档图与记忆索引的面，不是本门的）· 按节或按内容的排除 · 逐条豁免登记。§3 的三个例外各是一条路径形，不是一张表；本节同样只有前缀。

**落点表（各档的实施笔归 eng-coder；本节只定目标态与判据）**

| 落点 | 目标态 |
|---|---|
| `thincoder-core/doc-check/index.mjs` 的 `judgedDomainDocs` | 第二道滤：按每份档自己的项目根取声明（`projectRootOf` 已有），`readManifest` 读该根的 manifest，`normalizePathList` 归一 `index.docCheckExcludePaths`，再按「相等 ∥ 前缀 + `/`」判；落在排除面上的不进判域 |
| `thincoder-core/manifest-schema.mjs` | 两处「今天无消费面」的注释收正（键默认值那一段 ∥ 数组层校验那一段）：键与校验都留着，消费方改指本节 |
| `thincoder-core/declaration.mjs` | 档头那句把机制指向 `docs/core/design/DOC-CHECK.md` 的 `§2.6` 改指本节——本档没有 §2.6，那是悬空节指针 |
| `thincoder-core/tool-docs/doc_check.md` | 描述面补一句：声明在 `index.docCheckExcludePaths` 前缀下的档不进判域、不计入 `checkFiles`（描述与行为同一口径） |
| `thincoder-core/tool-docs/manifest.md` | 这个键那一行的说明改指本节（排除面已接线）；`docCheckExts` 那一行随 C3 删除 |

**读键的那一侧 = 判域谓词自己读，不经 `buildDeclaration` 的投影**：`buildDeclaration` 今天投影 `excludePaths ∥ publicRepos ∥ writableRepos`，没有这个键；而谓词已经在按每份档自己的项目根算（`projectRootOf`），声明也从同一个根读。这样「同一把尺」是事实而不是口号（同一支 `normalizePathList`），`Declaration` 的形状也不因此加字段——那是给别的消费面的接口面。

**同类先例**：`index.excludePaths`（文档图与记忆索引的面，不是本门的）。对齐：同前缀形、同一把归一尺（`normalizePathList`）。偏离：那个键喂的是**索引**（少收几档进索引），本节喂的是**判域**（少判几档），判据一件不加。既有形不适用：索引侧少几档的效果是那几档「找不到而被报」，方向与放行相反（KD-3）。

**库内 = 已查**：`排除面 前缀 判域 归一` —— 三件事各在盘上有一处落点：

- 键与数组层校验 = `thincoder-core/manifest-schema.mjs`（注释写「今天无消费面」）。
- 归一单源 = `thincoder-core/declaration.mjs` 的 `normalizePathList`，与 `index.excludePaths` 同款。
- 判域唯一一处 = `thincoder-core/doc-check/index.mjs` 的 `judgedDomainDocs`，三个调用面共用。
- 现役用例 = `test/rtm/guard.md` 故事 `CLI 7`：表里没有排除面一行，本节补 `7-26`。

**库外 = 已查**：声明源 = `PROJECT-MANIFEST.json` 的 `index.publicRepos` 两处（`../.thincoder` ∥ `../thincoder.com`）。两仓 grep 过 `docCheckExcludePaths` ⇒ 零命中；`排除面` 在 `../.thincoder` 只命中 `tmp/` 下的历史工作副本（本仓旧拷贝，不是该仓的文档面），`../thincoder.com` 侧零命中。无相关：本节改动面全是仓内判定逻辑，外部断言 = 零。

**验收（回指 `docs/core/requirements/DOC-CHECK.md` F9 ∥ AC-12）**

- **排除即放行（AC-12 前半，`report` 面）**：夹具 manifest 写 `index.docCheckExcludePaths: ["docs/tmp"]`，那条前缀下造一份档（一段 400 字正文 ∥ 一个仓内不存在的档名 ∥ 一处行号锚）⇒ `doc_check` 的 `report` 面指名它 ⇒ `PASS`、零附加行、`checkFiles` 为空。
- **撤掉声明就照判（同一半的红侧）**：删掉那一行声明、别的字节不动 ⇒ 同一份夹具 `REFUSED`，三条命中照出。两半都成立才算过。
- **`gate` 面也立（AC-12 前半的交付面）**：夹具先造出「这份档在本批变更区内」这个条件——真 git 仓 ∥ 批起快照基线（§8「快照怎么取」）∥ 该档本批改过一行，`doc_check(mode:"gate")` 绑这份批档 ⇒ `PASS`、零附加行；撤声明同跑 ⇒ `REFUSED` 并点名该档。条件不成立时 `gate` 恒零输出（§6「两样都没有」），红侧永远红不起来——这一条的成立条件是基线在，不是回执长相。
- **前缀边界（AC-12 后半）**：声明 `docs/tmp` 时，形如 `docs/tmp-x` 的目录**不在**排除面上 ⇒ 那里的一份档，命中照出。
- **声明读不到（F9 末句）**：没有 manifest 的夹具档 ∥ 键写成非数组的夹具档，两条都 `REFUSED`——排除面为空、照判。

**判读人**：上五条由改动面的单测档判读（命令 `node --test <该档>`；单测档随批、收口即删，本档不点它的名）。红侧 = 同一份夹具在没有排除面接线的代码上 `REFUSED`：声明写进去不改变任何一次判定，这一条才立得起来。常驻的那一半见下节（集成行 `CLI 7-26`）。

**集成测试设计（从 `test/RTM.md` 索引出发的 delta）**

索引 = `test/RTM.md` 的故事表；本节读到的那一条 = `CLI 7`（表在 `test/rtm/guard.md`）。入口与 §9 同一条轨：父侧 depth-0 的真 `batch close`（不直调 `runBatchGate`）。本节改的是一个业务可观察结果——项目声明了排除前缀之后，一份原本 `REFUSED` 的档变 `PASS`，`范围 N 档` 也少一档。

**破的 = 无。** 判据：现役各态的夹具都由 `test/integration/close-gate-fixture.mjs` 造根，那份 `PROJECT-MANIFEST.json` 只写 `version` ∥ `phase`、没有这个键；本仓自己的该键是空数组（`PROJECT-MANIFEST.json` 里 `"docCheckExcludePaths": []`）⇒ 排除面处处为空，没有一行的断言方向跟着变。

**冗余的 = 无。** `7-2` 断的是「范围外的档不入判」——那一档不在笔域集里；本节说的是「档在笔域集里、被 manifest 声明排除」：一个由笔域集定，一个由 manifest 定，不是同一件事。`7-7` 断的是 `范围 0 档` = `checkFiles` 0 这个等式：本节改的是判域大小，不是这个等式。

**缺的 = 一行**（`7-26`），判的是本节新增的那一半：

| 新行 | 组件交互 | 断言的业务结果 | 服务需求 | 入口 |
|---|---|---|---|---|
| `7-26` | `batch close`（父侧）⟷ 收口臂 `evaluate` ⟷ `judgedDomainDocs` ⟷ 该档项目的 manifest（`index.docCheckExcludePaths`，归一 = `normalizePathList`） | 夹具 manifest 声明 `docs/tmp`、前缀下一份档带三样病 ⇒ 收口放行、零附加行、`范围 N 档` 数不到它；撤掉那条声明、同一份夹具 ⇒ `REFUSED` 三条照出；同级目录 `docs/tmp-x` 下的档 ⇒ 照报——三半都成立才算过 | F9 ∥ AC-12 | 真 `batch close` |

编号先落 `test/rtm/guard.md` 的 `CLI 7` 表，再写用例标题（`test('CLI 7-26 …')`）——编号在表上定了，用例标题才照号写。

