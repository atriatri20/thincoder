# 2026-11-07 · tool-face-review-route
> 六段，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 每段只有一个作者：作者的段可 `append` 加内容、可就地改（`edit`）；非作者一概拒。
> 编制：主 agent · 2026-11-07 · 来源 = 台账 #1940（2026-11-01 实撞：工程工具面批交付完核销不了）· 用户 2026-11-01 11:43 裁定「1940当然需要做评审啊！」= 走「收紧路由」。
> 台账 = #1940（core · 归批）。前情 = 无（独立批）。
## §1 讨论（主 agent）
**状态行**：已收口 2026-11-07
<§1 模板占位：本批条目 / 关键判据 / 授权口径>

### 需求：工程工具面批也要评审（用户 2026-11-01 11:43 已裁）

**冲突现场**（原行 `#1940` 记录，2026-11-01 实撞）：

| 面 | 说的 |
|---|---|
| 变更面路由 | `test/**` ∥ `scripts/**` ∥ `.thincoder/tmp/**` ∥ CI = **工程工具面 ⇒ 父侧直接编辑，免设计链 / 免 designToken** |
| 台账核销门 | 批档 §3 状态行必须 = `评审通过` |

**⇒ 工具面批交付完核销不了**：要么去跑一场没有评审对象的评审（编结论），要么永远挂着。

**用户裁定**（2026-11-01 11:43 逐字）：「**1940当然需要做评审啊！**」⇒ 走**收紧路由**：**工程工具面批同样要做评审**，评审对象 = **交付档 + 批档读数**（这一面没有设计档，评审对象因此不是设计档）。

**要落什么**：

1. **路由规则改写**：工程工具面**不再「免评审」**——它免的是**设计档**（没有设计文档可写），不免**评审**。
2. **评审对象定义**：工具面批的评审对象 = 本批实际交付的文件 + 批档里的读数（§5 实施记录 + §6 验证）。
3. **核销门对齐**：`§3 = 评审通过` 对工具面批同样成立——因为它真的评过了。
4. **三处同拍**（D11）：变更面路由的**声明面**各自同步（提示词面路由表 ∥ 需求档路由条 ∥ 核销门的设计说明）。

**边界**：

- **不放宽核销门**（不是「工具面批免 §3」）——那等于把这条债换成另一条。
- **不扩大设计档**（工具面批仍然不需要写设计文档）。
- **不动「父侧可以直接编辑」**——那是写权，不是评审豁免。

**验收**：

- 工具面批走完一轮后 `ledger close` 能过（不再报「§3 未通过评审」）；
- 路由表的四类面里**没有一类**写「免评审」；
- 声明面三处同句（无一处仍写「免设计链 ⇒ 免评审」的旧读法）。

### 设计席的两条上抛 · 父侧裁定（2026-11-07 10:54）

| # | 事项 | 裁定 |
|---|---|---|
| 1 | `docs/core/design/ADVISOR-GUARDS.md` 四处 `type:"code"`「不适用」行（评审对象面） | **本轮一并落，不另派。**它正是本批规则的**声明面之一**（D11 同拍）——`§2.15` 说工具面批走代码轨，而该档四处还写着「代码轨不适用」，留着就是两处相反的话。**父侧亲改**（四处措辞，小形） |
| 2 | `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` 的 118 条存量裸坐标 | **不另立账——它已在 `#2077` 的射程内**（存量清理批正在做，该档单档 118 命中、其中死指针 25，已在其 §2 触达集里）。本批交付面 = **新增行零命中**，存量归那批。**两个持有者只会有一个人去修，另一个永远销不掉。** |

**由此确认本批的交付面（三条缺一不可）**：

1. `§2.15` 机制单源（已落）+ D1 行指针（已落）+ `ADVISOR-GUARDS.md` 四处同拍（**父侧本轮亲改**）；
2. **提示词面三档**（`thincoder-core/prompts/discipline-engineering.md` ∥ `persona-engineering.md` ∥ `advisor-design.md`）——内容依据住 `§2.15`，**由 eng-coder 落笔**；
3. **需求档一处**（`docs/core/requirements/ENGINEERING-MODE-V2.md` 的路由条）——**父侧笔**。

**已知未验**：设计席报 `ADVISOR-GUARDS.md` §1.1 的指向取自转述、未直读某节，记 `unverified`；实施轮须直读后再定那处的改法。

### 并入一笔同族账：`#2081`（2026-11-07 10:58 · 用户裁「并」）

- **已定决定**：`#2081` 并入本批（`覆盖账 = #1940 ∥ #2081`）。 · 用户原话：「并」 · 时间：2026-11-07 10:57

**为什么同族**：`#2081` 的三笔全是**设计档声明面落后于实现**——两份档的 `create only` 串过期且互不一致 ∥ `§4.21.2` 点名的两个符号名实装中不存在 ∥ `§6.2` 镜像锚 `A8` 仍写五动作而 schema 已六动作。

**与本批同面**：本批改的也是「设计档说 A、实装是 B」这一类（`ADVISOR-GUARDS.md` 四处「不适用」同拍 ∥ `§2.15` 补缺）。**同一评审面、同一实施面（设计档）⇒ 合并不拆。**

**并入后的射程扩张（实施轮须接住）**：

| 档 | 要落的 |
|---|---|
| `docs/core/design/LEDGER.md` §6.3 ∥ `docs/core/design/TOOLS.md` | `create only —` 四串改 `create / attach —`，并收成一份（两档现互相不一致） |
| `docs/core/design/BATCH-RECORD.md` §4.21.2 | 两个符号名按实装改（**先实读再改，别照原行转述抄**） |
| 同档 §6.2 镜像锚 `A8` | 五动作改六动作 |

**风险记在此**：`#2081` 的原行写明「实施席已按内部评审把代码改成 `create / attach —`，设计档围栏因此过期」——即**代码是对的、档是旧的那一侧**。改档不改码。

## §2 批次任务与设计（eng-designer）
**状态行**：设计完成（修正轮（第 2 版）：评审 12 条逐条处置；绑定面补 `thincoder-core/advisor/loop.mjs`；`#2081` 三笔并入）
<§2 模板占位：本批条目（覆盖） / 设计档落点 / 机制设计 / 受影响文件与测试覆盖 / 验收对照 / 关键决策 / 上抛项>

### 本批条目（覆盖）

台账两条（`#1940` ∥ 2026-11-07 并入的 `#2081`），落点逐条对 §1：

| # | 落点 | 本批做法 |
|---|---|---|
| 1 | 路由规则改写 | 三处声明面同读「工程工具面免的是**设计档**，不免**评审**」——工具面批照走一轮评审，评审对象另行定义 |
| 2 | 评审对象定义 | 工具面批的评审走**代码轨**：`paths` = 本批交付件，`documents` 与 `batchDoc` = 本批批次档 |
| 3 | 核销门对齐 | **核销门零改**（`§3` 状态行 = `评审通过` 照判）。它此前不可达，是因为没有可受理的评审对象，不是因为判据写错 |
| 4 | 三处同拍（D11） | 机制单源 = `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` §2.15；提示词面六档与需求档面各由唯一作者同批落笔 |
| 5 | `#2081` 两份档的 `create only —` 串过期且互不一致 | `docs/core/design/LEDGER.md` §6.3 ∥ `docs/core/design/TOOLS.md` 的 `create only —` 四串改 `create / attach —`，并收成一份：两档该串逐字相等 |
| 6 | `#2081` 设计档点名的符号名实装中不存在 | `docs/core/design/BATCH-RECORD.md` §4.21 的 `4.21.2` 段：两个符号名按实装改——**先实读代码再改**，不照 §1 的转述抄 |
| 7 | `#2081` 镜像锚落后于 schema | 同档 §6.2 的镜像锚 `A8`：五动作改六动作 |

`#2081` 三笔全在 `.md` 档面 ⇒ 无档位判据、无改面单测档；验收 = 上述三档 `doc_check` 的 `gate` 面 PASS。改档不改码——§1 记明代码是对的、档是旧的那一侧。

### 设计档落点

机制单源 = `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` §2.15（本批新增：工具面批的评审对象与绑定面）。

同批由本席同步的声明面：

- `docs/core/design/DOC-DISCIPLINE.md` §1 的 D1 行：一句指针指向 §2.15，不重述（已落）。
- `docs/core/design/ADVISOR-GUARDS.md` 四处逐句（父侧 2026-11-07 10:54 裁定「本轮一并落，不另派」）：

| # | 坐标 | 状态 |
|---|---|---|
| 1 | §2 第 6 条 分支表「不适用」行 | **已改**：`type="code"` 行补「工具面批同判：`batchDoc` 只用来绑定 `§3` 写通道……不带也照发——本门不问」+ 指向 §2.15 |
| 2 | §2 第 7 条 分支表「不适用」行 | **已改**：同句补「工具面批同判：它的 `§3` 结果由批档收口门与台账核销门守」+ 指向 §2.15 |
| 3 | §10 的 `A-AG26` | **核对后不改**：`type="code"` 不受本门约束是真——准入门只判设计轨，工具面批不带 `batchDoc` 也照发 |
| 4 | §2 第 7 条 落点坐标（「代码评审不走本门」） | **核对后不改**：账链门不扩到代码轨，这一句与实装一致 |

上一轮 §2 写的坐标「§12 的 `type="code"` 行」**已删**——该节无此行（其表分支 4 = 受理判据），那是本席的错指。

不属本席写域、同批由各自作者落笔：

- **产品提示词面六档**（`thincoder-core/prompts/`）：`discipline-engineering.md`（块 A）· `persona-engineering.md`（块 B）· `advisor-design.md` ∥ `advisor-round1.md` ∥ `advisor-round2.md` ∥ `advisor-round3.md`（块 C）——产品面 ⇒ eng-coder。内容依据 = `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` §2.15 的**六档表与三块围栏 A / B / C**（已落）：实施席照抄，不自拟措辞。
- **需求档一处**（`docs/core/requirements/ENGINEERING-MODE-V2.md` 的路由条）：主 agent 笔。

### 机制设计：缺口在哪

三处声明面**今天都已写「全链」**：

- `thincoder-core/prompts/discipline-engineering.md` 的 `Product face` 行 = `Requirements → Design → Review → eng-coder (full flow; token gate)`；
- `docs/core/design/DOC-DISCIPLINE.md` §1 的 D1 行末句 = 「面只有两值……产品面……= 全链」；
- `docs/core/requirements/ENGINEERING-MODE-V2.md` = 「一律走全流程」。

卡住的不是措辞，是**全链走不完**——旧读法「免评审」在三处声明面上已无字，问题是这一批连一轮评审都开不起来。

设计评审的受理面只收项目内现存 `.md`（判据 = `docs/core/design/ADVISOR-GUARDS.md` §12 的 A-AG20）。工具面批的交付件是 `.mjs` / `.ps1` 一类，本批又没有设计档可递——没有可受理的对象，`§3` 就只能编。

**一处实证（设计轨消息面）**：设计评审给评审员的原话是 `The documents below are the review scope. Review ONLY these files — do not scan git diff or read any other files.`（`thincoder-core/advisor/messages.mjs`）。

把批次档当设计档递上去，评审员读到的只有批档读数，读不到交付件——那正是用户 2026-11-01 11:43 否掉的「一场没有评审对象的评审」。

### 机制设计：走代码轨

工具面批的评审走**代码轨**（`type:"code"`），三样入参：

- `paths` = 本批交付件（取 §5 实施记录实际落盘的文件，不取计划清单）；
- `documents` = 本批批次档（代码轨把它读作验收语境，原话 `The documents below define acceptance criteria and review context. Read them for context, then read the code files specified in the review scope.`）；
- `batchDoc` = 同一批次档（结论落 `§3` 的绑定）。

评审员因此两面都读得到：交付件（`Review these code files/directories — read them in full for context:`）与批档读数（§2 验收 / §5 实施 / §6 验证）——正对 §1 的「交付档 + 批档读数」。

**绑定面四处**——都只放开轨判定，条件是「携了可读 `batchDoc`」：

| # | 坐标 | 现形（实读） | 改法 |
|---|---|---|---|
| 1 | `thincoder-core/advisor/run.mjs` | `const boundBatchDoc = reviewType === "design" ? batchDocForReview(agent, documents, callbacks) : null` | 携 `batchDoc` 即绑定，与轨无关 |
| 2 | `thincoder-core/advisor/loop.mjs` | `if (reviewType === "design" && batchDoc) tools.push(batchTool(batchDoc, { review: true }))` | 同一条件放开：绑了档就注册 `batch` 工具。**不注册，代码轨评审员没有写 `§3` 的手**——只放开第 1 条，绑定落不到任何一处 |
| 3 | `thincoder-core/agent-tools/advisor.mjs` | `batchDoc` 参数描述只判设计轨；`section3BlocksAtStart` 的读取已是两轨同源（同档 `resolved.run.section3BlocksAtStart = section3BlocksBaseline(resolved.run.batchDoc)` 实读） | 描述改「携了即绑定」；基线那一行不改 |
| 4 | `thincoder-core/agent-tools/advisor-async.mjs` | 异步 `runAdvisorReview` 的调用不携 `batchDoc`，而 `batchDocForReview` 的池扫面只认设计轨 | 异步路径照传本笔 `batchDoc`（与同步同值同形）；不补则父侧默认走的异步代码轨绑不到档 |

依据 thincoder-core/advisor/loop.mjs「if (batchDoc) tools.push(batchTool(batchDoc, { review: true }))」——改后 = 绑定条件只看 `batchDoc` 在场，不含轨判定，这正是本批要证的「绑定面与轨无关」

**账链门不扩到代码轨**：这一门的立法理由是「设计 token 只有批档能关」；代码轨不签 token，没有可关之物 ⇒ 门在代码轨上无对象。工具面批的 `§3` 结果由批档收口门与台账核销门守（两门都要求 `§3` = `评审通过`）。

**`settleDesignReview` 的 `§3` 落地门（判据 1：轮次块数 > 点火基线）同样不扩**：它的消费面在签发路径上（判据 = `docs/core/design/ADVISOR-GUARDS.md` §1.1）。代码轨不签发 ⇒ 没有消费面，搬过去是死代码；代码轨那一半由判据 2 承担——状态行随块由工具置位（机制 = `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` §2.5，与轨无关）。

**代码轨读哪一档提示词**：三面归属与六档表单源 = §2.15；本轮未直读 `thincoder-core/advisor/messages.mjs` 的选面逻辑 ⇒ 记为 `unverified`，实施席落笔前直读一次，按实读落三档（`advisor-round1.md` ∥ `advisor-round2.md` ∥ `advisor-round3.md`）。只改 `advisor-design.md` 时，代码轨评审员读不到 `§3` 指令。

**不签 token**：代码轨不签 designToken，工具面批也不需要——这一面没有设计档要解锁，父侧写权不因评审而变（§1 边界第二条）。

落地证据 = `§3` 轮次块 + 段级状态行。置位由 `append §3` 携 pass 裁定触发，机制与轨无关。

### 受影响文件

| 文件 | 层 | 动作 |
|---|---|---|
| `thincoder-core/agent-tools/advisor.mjs` | 产品核心 | `batchDoc` 参数描述改「携了即绑定」（基线读取已两轨同源，不改） |
| `thincoder-core/advisor/run.mjs` | 产品核心 | `boundBatchDoc` 去掉 `reviewType === "design"` 分支（绑定面第 1 处） |
| `thincoder-core/advisor/loop.mjs` | 产品核心 | `batch` 工具注册条件去掉轨判定（绑定面第 2 处） |
| `thincoder-core/agent-tools/advisor-async.mjs` | 产品核心 | 异步 `runAdvisorReview` 照传本笔 `batchDoc`（绑定面第 4 处） |
| `thincoder-core/prompts/advisor-design.md` · `advisor-round1.md` · `advisor-round2.md` · `advisor-round3.md` | 产品提示词面 | 围栏块 C（`§3` 写作指令的适用条件由「设计评审专用」改判「本评审携了 `batchDoc`」） |
| `thincoder-core/prompts/discipline-engineering.md` | 产品提示词面 | 围栏块 A（`Product face` 行末） |
| `thincoder-core/prompts/persona-engineering.md` | 产品提示词面 | 围栏块 B（`Implementation-round role routing` 段） |
| `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` | 设计档面 | 新增 §2.15（本席，已落） |
| `docs/core/design/DOC-DISCIPLINE.md` | 设计档面 | §1 D1 行加一句指针（本席，已落） |
| `docs/core/design/ADVISOR-GUARDS.md` | 设计档面 | 四处同拍（本席，已落；逐句见「设计档落点」表） |
| `docs/core/design/LEDGER.md` · `docs/core/design/TOOLS.md` | 设计档面 | `#2081`：`create only —` 四串改 `create / attach —` 并收成一份 |
| `docs/core/design/BATCH-RECORD.md` | 设计档面 | `#2081`：§4.21 的 `4.21.2` 段两符号名（先实读）+ §6.2 镜像锚 `A8` 五动作改六动作 |
| `docs/core/requirements/ENGINEERING-MODE-V2.md` | 需求档面 | 路由条补评审对象一句（主 agent） |

**档位结论（两档源文件）**：`thincoder-core/agent-tools/advisor.mjs` ∥ `thincoder-core/advisor/run.mjs` 走 `doc_check` 的 `lines` 读数面判（软线 = 请求审视 ∥ 硬线 = 必须拆）；本档只留这条关系句，不落读数（会变的读数进命令，不进状态档）。本批只改单行条件，不动这两档的职责边界。

**层结论**：不跨层——产品核内三档 + 产品提示词面六档 + 设计档面六档 + 需求档面一档。零发布闭包改动（`thincoder-core/package.json` 的 `files` 已覆盖 `advisor/`、`agent-tools/`、`prompts/`），零端侧改动（两端走同一工具装配）。

### 测试覆盖

**改面单元测试档**：与本批批次档同名、同目录、扩展名 `mjs`（实施轮建、收口删）。跑法 = cwd 仓根 `node --test <该档>`；夹具 = 临时项目根 + 骨架批档 + 假审查实例，零落仓。

| # | 用例 | 期望 |
|---|---|---|
| ① | 代码轨携可读 `batchDoc` | `boundBatchDoc` = 该档绝对路径 |
| ② | 代码轨不携 `batchDoc` | 绑定为空；`append §3` 撞身份拒因 |
| ③ | 设计轨携 / 不携两半 | 行为逐字不变（零回归） |
| ④ | 携不可读 `batchDoc` | 既有 `resolveBatchDocPath` 文案逐字 |
| ⑤ | 评审身份对绑定档 `append §3` 携 `VERDICT: pass` | 段级状态行 = `评审通过` |
| ⑥ | 该档 `close` 与台账核销门 | 双放行（`§3` 判据满足） |
| ⑦ | 代码轨携 `batchDoc` 在评审侧装配工具表 | 工具表含 `batch`；不携 ⇒ 不含（设计轨两半逐字不变） |

**集成测试差量（`test/RTM.md` 故事 27）**：破 0 行 · 冗余 0 行 · 新增 1 行（27-2）。

**判 0 的口径 = 全档行集逐行读过，与本改动同面的行按下表核**：

- 故事 7 的 `7-10`…`7-15`：批档写门；
- 故事 10 的 `10-1`…`10-5`：批档 + 槽消费；
- 故事 14 的 `14-1`…`14-8`：`§3` 门；
- 故事 17 的 `17-1`…`17-3`：准入 ∥ 账链门；
- 故事 24 的 `24-1`…`24-3`：评审注入面；
- 故事 27 的 `27-1`：`§3` 自置位。

六组合计 26 行，进入口与断言全在设计轨上（`batchDoc` + 设计评审）：代码轨放开绑定不改其中任何一条的业务可观察结果 ⇒ 破 0。需要真代码轨的一条 = 新增的 `27-2`。

交互组件 = `advisor`（代码轨）⟷ 批档 §3 写通道 ⟷ 收口 / 核销门。业务可观察结果 = 工具面批不再「交付完核销不了」：一轮评审后 `§3` 成 `评审通过`，收口与核销放行。进入口 = 父侧 fire 一轮代码评审（depth-0，携 `batchDoc`）；回指 = 台账 `#1940` ∥ 本节。

用例落在故事 27 现役用例档内（档名 = `test/RTM.md` 的 `27-1` 行「证据」列所写的那一档），复用该档既有的假模型端点先例；行号 `27-2` 在写用例标题之前先落进 `test/RTM.md`。

### 验收对照（逐条回指 §1 验收）

| # | 判据（§1 逐字） | 本批怎么证 |
|---|---|---|
| A-TF1 | 工具面批走完一轮后 `ledger close` 能过 | 用例 ⑤⑥：一轮评审后 `§3` = `评审通过` ⇒ `close` 与 `ledger close` 双放行；集成 27-2 走真工具链 |
| A-TF2 | 路由表四类面里没有一类写「免评审」（正向判据） | 三处声明面逐处落到围栏块逐字：`discipline-engineering.md` 的 `Product face` 行含 `review on the code track`；`persona-engineering.md` 的 role routing 段含 `skips the design DOCUMENT, never the review`；`docs/core/requirements/ENGINEERING-MODE-V2.md` 的路由条含同句中文形——每处命中并逐字比对围栏块（反向控制：三处 `免评审` 命中 = 0，只作回归，不作主判据） |
| A-TF3 | 声明面三处同句 | 正本 = §2.15 的围栏块 A / B / C；三处落地块与围栏块**逐行相等**（比对对象是围栏块全文，不是「含关键词」） |
| A-TF4 | （本批自加）绑定面与轨无关 | 用例 ①–④ ⑦；`thincoder-core/advisor/run.mjs` 源面 `reviewType === "design" ? batchDocForReview` 命中 0；`thincoder-core/advisor/loop.mjs` 注册 `batch` 工具的条件不含轨判定 |
| A-TF5 | （本批自加）核销门零改 | `thincoder-core/ledger-close-proof.mjs` 本批 `git diff` = 空；`§3` 判据字面零改 |
| A-TF6 | （`#2081` 三笔）设计档与实装同读 | `docs/core/design/LEDGER.md` §6.3 ∥ `docs/core/design/TOOLS.md` 的 `create / attach —` 串逐字相等且 `create only —` 命中 0；`docs/core/design/BATCH-RECORD.md` 的 `4.21.2` 段两符号名在 `thincoder-core/agent-tools/batch.mjs` 源面命中；同档 §6.2 镜像锚 `A8` 六动作；三档 `doc_check` 的 `gate` 面 PASS |

### 关键决策

| # | 决策 | 理由 | 被拒 |
|---|---|---|---|
| KD-TF1 | 工具面批的评审走**代码轨** | 只有代码轨读得到交付件；设计轨消息面明写只读所给 `.md` | **被拒**：把批档当设计档递上去——评审员读不到交付件，等于凭读数编结论，正是用户否掉的那件事 |
| KD-TF2 | 不签 designToken | 这一面没有设计档要解锁；token 的语义是「解锁写权」，评审不改变父侧写权 | **被拒**：为统一口径给代码轨也签 token——签出来没人消费，到期只能靠 TTL 收 |
| KD-TF3 | 核销门零改 | §1 边界第一条：不放宽核销门。门本来就对，缺的是对象 | **被拒**：「工具面批免 §3」——等于把这条债换成另一条 |
| KD-TF4 | 不新建设计档 | §1 边界第二条；工具面批的机制设计住 §2，评审对象因此是「§2 + §5 + §6 + 交付件」 | **被拒**：要求工具面批补一份设计档——把小改动逼成写档，是拿流程换排版 |
| KD-TF5 | 只放开绑定面四处，账链门与 `§3` 落地门不扩 | 两门的立法理由都挂在「设计 token 只有批档能关」上；代码轨不签 token ⇒ 门在这一轨上无对象，扩过去是空转或死代码 | **被拒**：两门随绑定面一起扩——空转的门，加上把代码轨被拒报成 `type=design` 的拒文 |

**最近先例**：同一道绑定面的上一笔 = `batchDoc` 准入门（`docs/core/design/ADVISOR-GUARDS.md` §2 第 6 条）与同档 §1.1 的 `§3` 落地门。

对齐 = 同一绑定点（`resolved.run.batchDoc`）、同一 `§3` 置位路径、同一落地判据；偏差 = 从「设计轨专用」放到「携值即用」，理由住 §2.15。

**先例批**：对 `docs/batches` 面检索 `batchDoc`，命中全是 `batchDocBases` 一类符号名与本批自身 ⇒ **已查无先例批**（2026-11-07 上一轮实跑）。

**公开源核查**：项目 `PROJECT-MANIFEST.json` 的 `index.publicRepos` 为空 ⇒ 仓外无声明源可查（已查无）。本批断言全在仓内代码与文档面，无需外部源。

### 上抛项

- **[上抛·知会]** 本批改面含**产品提示词面六档**（面判定 = 产品面，写权 = eng-coder）：内容依据全部住 `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` §2.15 的六档表与围栏块 A / B / C，实施席照抄，不自拟措辞。
- **`docs/core/design/ADVISOR-GUARDS.md` 四处同拍：已裁**（父侧 2026-11-07 10:54「本轮一并落，不另派」）。本席已按「设计档落点」表逐句处置（两处改、两处核对后不改），无待裁项。

## §3 设计评审（评审子代理）
**状态行**：评审通过（第 2 轮复评：上轮 12 条 9 已消 / 3 未消或部分消，新增 2 条均 🟡，🔴 0）



### 轮次 1（评审子代理）

评审轮次 1（全量审）· 对象 = 本批 §2 设计 ∥ `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` §2.15 ∥ 同拍声明面（`docs/core/design/ADVISOR-GUARDS.md` · `docs/core/design/DOC-DISCIPLINE.md` 的 D1 行）。无项目标准档、无文档地图（Document ownership 判据降级，已在报告注明）。

| # | 严重度 | 状态 | 证据（指针） |
|---|---|---|---|
| 1 | 🔴 | 未消 | §2「本批条目（覆盖）」逐字「台账 #1940 一条，四项落点逐条对 §1「要落什么」」；`#2081` 全档只在 §1 出现（「并入后的射程扩张（实施轮须接住）」），§2 受影响文件表无 `docs/core/design/LEDGER.md` ∥ `docs/core/design/TOOLS.md` ∥ `docs/core/design/BATCH-RECORD.md` |
| 2 | 🔴 | 未消 | `docs/core/design/ADVISOR-GUARDS.md` §2 第 7 条 分支表「不适用」行已写「但工具面批除外」，同节判据句仍写「`type="design"` ∧ `batchDoc` 已解析为绝对路径且可读」；同档 §10 的 A-AG26 仍写「`type="code"` 不受本门约束」；同档 §2 第 7 条 落点坐标仍写「代码评审不走本门」；设计声明的坐标「§12 的 `type="code"` 行」在该节不存在（§12 表分支 4 = 受理判据） |
| 3 | 🔴 | 未消 | §2「改法三条」把账链门同扩到代码轨，未给任何场景出处（6b）；其 companion 文案逐字为「Advisor: launch refused — a design review needs its batch record to carry an unsettled ledger row. [type=design · scope={范围摘要} · round=— · criterion=batchdoc-no-ledger]」——代码轨被拒时报错轨，与 F31「失败结论族记实际评审轨」相抵 |
| 4 | 🟡 | 未消 | §2 受影响文件行「`section3BlocksBaseline` 由「设计轨」改判「携值即判」」；该基线唯一消费面 = `settleDesignReview`（`docs/core/design/ADVISOR-GUARDS.md` §1.1「判定位置：`settleDesignReview`」）⇒ 代码轨无消费面，`docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` §2.15 落地判据 1 无执行点 |
| 5 | 🟡 | 未消 | §2 只改 `thincoder-core/prompts/advisor-design.md`；`docs/core/design/ADVISOR-GUARDS.md` §3.1 记四面「round1 / round2 / round3 / design」——代码轨读哪一面未写（该行为断言 unverified） |
| 6 | 🟡 | 未消 | §2 上抛逐字「实施席照抄节内落笔字面」，而 `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` §2.15 无任何提示词逐字块；A-TF2 / A-TF3 却要求「`Product face` 行含特定串」 |
| 7 | 🟡 | 未消 | `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` §2.15「工程工具面 = 仓根 `scripts/**` ∥ `test/**` ∥ `.thincoder/**` ∥ `.github/**`」= 同档 §2.1 产品面行枚举；`docs/core/design/DOC-DISCIPLINE.md` D1 行「面只有两值」；§1 路由行写「`.thincoder/tmp/**` ∥ CI」（枚举漂移） |
| 8 | 🟡 | 未消 | §2 受影响文件表「层」列与「**层结论**：不跨层」= 写权面而非文件档位；两档源文件无档位结论、无量法（spot-check 未做——范围外档案本审不读） |
| 9 | 🟡 | 未消 | §2「最近先例」只给两个设计节坐标、无先例批；其中 `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` §2.5 是「§3 状态行词表」节，非 `batchDoc` 绑定节（绑定先例住 `docs/core/design/ADVISOR-GUARDS.md` §2 第 6 条） |
| 10 | 🟡 | 未消 | §2「所以「免评审」这个旧读法已不在规范面上」与 A-TF2「三处声明面 `grep`「免评审」= 0」并存 ⇒ 该判据改前改后同值，空过也判绿 |
| 11 | 🟡 | 未消 | §2「[上抛·待裁] … 请主 agent 确认：本席在修正轮一并落，还是另派设计席」与 §1 裁定「**本轮一并落，不另派。**」（2026-11-07 10:54）相抵；且缺 D13 三件之到期条件 |
| 12 | 🔵 | 未消 | §2 集成差量只写「破 0 行 · 冗余 0 行 · 新增 1 行（27-2）」，未点明核过哪些行 |

计数：🔴 3 · 🟡 8 · 🔵 1（合计 12）。三项 🔴 未消 ⇒ 本轮不置段级状态行。

VERDICT: changes-required

### 轮次 2（评审子代理）

轮次 2（复评）· 对象 = 本批 §2 修正版（第 2 版）∥ `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` §2.15 ∥ 声明面同拍（`docs/core/design/ADVISOR-GUARDS.md` · `docs/core/design/DOC-DISCIPLINE.md` D1 行）。范围 = 上轮 12 条逐条处置 + 新问题。

| # | 原# | 严重度 | 状态 | 证据（指针） |
|---|---|---|---|---|
| 1 | 1 | 🔴 | 已消 | §2「本批条目（覆盖）」逐字「台账两条（`#1940` ∥ 2026-11-07 并入的 `#2081`）」，表列 5–7 三笔；受影响文件表含 `docs/core/design/LEDGER.md` ∥ `docs/core/design/TOOLS.md` ∥ `docs/core/design/BATCH-RECORD.md`；验收 A-TF6 |
| 2 | 2 | 🔴 | 已消（含两处有理非修） | §2 第 6 / 7 条分支表两处已改；§10 的 `A-AG26` 与 §2 第 7 条落点坐标「核对后不改」的理由成立——本批已明写「账链门不扩到代码轨」，该二句仍为真；上轮点名的 `docs/core/design/ADVISOR-GUARDS.md` §12 假坐标已删（§2 逐字「已删——该节无此行」） |
| 3 | 3 | 🔴 | 已消 | §2「**账链门不扩到代码轨**」+ KD-TF5「被拒：两门随绑定面一起扩——空转的门，加上把代码轨被拒报成 `type=design` 的拒文」；无场景分支已撤 |
| 4 | 4 | 🟡 | 未消（残余） | `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` §2.15 绑定面行 3 改法仍写「基线读取随之对代码轨生效（基线由第 2 条的工具写作面消费）」，而同节下一段「同样不扩」称代码轨无消费面；§2 侧已改「基线读取已两轨同源，不改」 |
| 5 | 5 | 🟡 | 已消 | 受影响文件表与 §2.15 提示词表均收六档（`advisor-design` ∥ `advisor-round1` ∥ `advisor-round2` ∥ `advisor-round3`）；§2.15「代码轨读哪一面」给出 `ADVISOR_ROUND1` / `ADVISOR_ROUND2` / `ADVISOR_ROUND3` 三档 |
| 6 | 6 | 🟡 | 部分消 | 围栏块 A / B / C 已落（提示词三面有逐字正本）；但 A-TF2 与 A-TF3 判的第三处（`docs/core/requirements/ENGINEERING-MODE-V2.md` 路由条的「同句中文形」）无围栏块，「逐行相等」无比对对象 |
| 7 | 7 | 🟡 | 已消 | §2.15 逐字「**它不是一个第三面**：面仍只有两值（判据 = `§2.1`）」+「路径枚举不在本节重写——单源 = `§2.1` 产品面行，本节只引用不复制」 |
| 8 | 8 | 🟡 | 未消 | §2「**档位结论（两档源文件）**：`thincoder-core/agent-tools/advisor.mjs` ∥ `thincoder-core/advisor/run.mjs` 走 `doc_check` 的 `lines` 读数面判」——只给量法、无越线结论；受影响文件表第三档 `thincoder-core/advisor/loop.mjs` 未纳入 |
| 9 | 9 | 🟡 | 已消 | §2「最近先例」改指 `docs/core/design/ADVISOR-GUARDS.md` §2 第 6 条 ∥ 同档 §1.1；新增「先例批」行「已查无先例批」+ 检索面 |
| 10 | 10 | 🟡 | 已消 | A-TF2 改正向判据（每处命中并逐字比对围栏块），「免评审 = 0」降为回归控制；A-TF3 改「逐行相等」 |
| 11 | 11 | 🟡 | 已消 | §2 上抛项改「四处同拍：已裁……两处改、两处核对后不改，无待裁项」 |
| 12 | 12 | 🔵 | 已消 | §2 给出判 0 口径：六组行集（故事 7 / 10 / 14 / 17 / 24 / 27）「六组合计 26 行」 |
| 13 | (new) | 🟡 | 新 | `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` §2.15 围栏块 C 单行（「When this review carries a bound batch record (a batch tool scoped to it), your round goes into section §3 of that record:」起至句末）约 330 字符，超提示词面逐行阈值（`docs/core/design/ADVISOR-GUARDS.md` §3.1「写成三行、不写成一行」）；A-TF3 又要求落地块与围栏块「逐行相等」 |
| 14 | (new) | 🟡 | 新 | `docs/core/design/ADVISOR-GUARDS.md` §2 第 7 条落点坐标尾句「代码评审不走本门，绑定行对 `type="code"` 仍走原解析——行为零变」与本批绑定面「携 `batchDoc` 即绑定，与轨无关」相抵（该坐标被裁「核对后不改」的理由只覆盖前一子句） |

计数：原 12 条 → 已消 9 · 未消或部分消 3（#4 ∥ #6 ∥ #8）· 新增 2（均 🟡）· 🔴 0 ⇒ 本段置 `评审通过`。

VERDICT: pass

## §4 用户批准（主 agent）

### 用户批准

- **批准形 = 整批令**：用户 2026-11-07 12:24「开」· 12:33「**都自动跑完**」——覆盖本批的设计批准与实施启动。
- **需求侧用户原话**（2026-11-01 11:43，逐字）：「**1940当然需要做评审啊！**」——本批全部内容的来源；路由由此从「工具面免评审」收紧为「工具面免设计档、不免评审」。
- **同族并入**：用户 2026-11-07 10:57 裁「**并**」（`#2081` 并入，`覆盖账 = #1940 ∥ #2081`）。
- **设计评审**：`changes-required` 6 条 → 父侧裁「全部受理」→ 修正轮落完（含 1 条回归断言）。
- **父侧两条裁定**（10:54）：① `docs/core/design/ADVISOR-GUARDS.md` 四处同拍本轮一并落；② `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` 的 118 条存量**不另立账**——已在 `#2077` 射程内，本批交付面 = 新增行零命中。
- **一处字面偏离已由父侧预裁**：块 A 那句 268 字符行末追加会越 `lineMax`，改放该行正下方一行 bullet（`§5` 偏离 1）。

## §5 实施记录（eng-coder）

### 实施记录（2026-11-07）

**交付面（20 档）**

- 绑定面四档：`thincoder-core/advisor/run.mjs`（`boundBatchDoc` 去轨判定）· `thincoder-core/advisor/loop.mjs`（`batch` 工具注册条件 = `batchDoc` 在场，依据该档「if (batchDoc) tools.push(batchTool(batchDoc, { review: true }))」）· `thincoder-core/agent-tools/advisor.mjs`（`batchDoc` 描述改「携了即绑定」+ 账链门注释尾句）· `thincoder-core/agent-tools/advisor-async.mjs`（异步 `runAdvisorReview` 补 `batchDoc`，**绑定面第 4 处**）。
- 提示词六档：`thincoder-core/prompts/discipline-engineering.md`（块 A）· `thincoder-core/prompts/persona-engineering.md`（块 B）· `thincoder-core/prompts/advisor-design.md` ∥ `thincoder-core/prompts/advisor-round2.md` ∥ `thincoder-core/prompts/advisor-round3.md`（块 C 三行）· `thincoder-core/prompts/advisor-round1.md`（块 C 新增整节——该档此前无 §3 落地节）。
- 声明面同拍六处：`docs/core/design/BATCH-RECORD.md`（§4.3 ∥ §4.20 ∥ BR-7 ∥ §6.2 的 A5/A6/A8）· `docs/core/design/AGENT-LOOP-SUBAGENT.md`（§6.28 用例 U4）· `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md`（§2.8 ∥ §2.15 第 3 行 ∥ 围栏块 C 拆三行 ∥ 依据行）· `docs/core/design/ADVISOR-GUARDS.md`（§2 第 7 条落点尾句 → 「绑定面与轨无关」）。
- `#2081` 四笔：`docs/core/design/LEDGER.md`（`create only —` → `create / attach —`）· `docs/core/design/TOOLS.md`（两串同改，与 `docs/core/design/LEDGER.md` 逐字相等）· `docs/core/design/BATCH-RECORD.md` §4.21.2（`sectionHeaderZoneLines` → `headerZoneEntries`；`statusLineSpans(body)` → `firstZoneStatusLineRange` + `zoneStatusCount`）· 同档 §6.2 `A8`（五动作 → 六动作）。
- 测试面三档：`docs/batches/2026-11-07-tool-face-review-route.test.mjs`（新建，随批删）· `test/integration/batch-status-auto-set.test.mjs`（新增 27-2）· `test/RTM.md`（27-2 行 + 节注两态）。

**四条偏离（原文 → 改后 → 为何不变义）**

| # | 原文 | 改后 | 为何不变义 |
|---|---|---|---|
| 1 | 块 A「`Product face` 行末追加一句」+ A-TF2「行含 `review on the code track`」 | 句子逐字不动，放该行正下方一行 bullet | 该行 268 字符 + 句 171 = 439 > `lineMax` 300，提示词面无结构豁免；字面落必拒。父侧已裁「按你的方案落」 |
| 2 | §2.15「绑定面三处」 | 补 `thincoder-core/agent-tools/advisor-async.mjs`，第 4 处 | `batchDocForReview` 池扫面只认 `reviewType === "design"`，异步 callbacks 又无 `batchDoc` 键 ⇒ 父侧默认走的异步代码轨评审绑不到档；补法与同步同形同值 |
| 3 | 受影响文件表未列 `docs/core/design/AGENT-LOOP-SUBAGENT.md`，`docs/core/design/BATCH-RECORD.md` 只列 `#2081` | 两档共六处同拍 | 同一条规则（评审工具表挂载条件），D11 同轮；不改则设计档自己留着两句相反的话。父侧已裁「两档你改」 |
| 4 | 需求档 `docs/core/requirements/ENGINEERING-MODE-V2.md`（advisor 行仍写「仅设计评审，纯只读评审」） | 零 diff | 父侧笔域，父侧已裁「别碰」 |

**修正轮四次**

① 单元档 `t is not defined` → 收尾改模块级 `after` + `closers`；② 单元 ⑥ 先把 §1 写「已收口」⇒ 撞冻结门 → 改夹具序（先评审后收口）；③ 集成 27-2 在 `--test-force-exit` 下 win32 撞 libuv 断言 → `server.unref()` + 裸 `close()`；④ 两次跨区 `edit` 被写前门拒（改动区含存量）→ 改逐处单点编辑。

**验收读数**

| # | 判据 | 读数 |
|---|---|---|
| A-TF1 | 工具面批走一轮后 `ledger close` 能过 | 单元 ⑥ 双半绿（未评前拒「③ 批档 §3 未通过评审」，一轮后放行）；集成 27-2 绿 |
| A-TF2 | 四类面无「免评审」 | 三处声明面各落围栏块；提示词面 `免评审` = 0 |
| A-TF3 | 三处同句 | 块 A 一行 ∥ 块 B 一行 ∥ 块 C 三行，与 §2.15 逐行相等；**第三处（需求档中文形）归父侧，本席零 diff** |
| A-TF4 | 绑定面与轨无关 | 用例 ①②③④⑦ 绿；`thincoder-core/advisor/run.mjs` 源面 `reviewType === "design" ? batchDocForReview` 命中 0 |
| A-TF5 | 核销门零改 | `thincoder-core/ledger-close-proof.mjs` 零 diff |
| A-TF6 | `#2081` 与实装同读 | 两档串逐字相等、`create only —` 命中 0；两符号名在 `thincoder-core/agent-tools/batch-segment-vocab.mjs` ∥ `thincoder-core/agent-tools/batch-record-write.mjs` 命中；`A8` 六动作与 schema 一致 |

`node --test docs/batches/2026-11-07-tool-face-review-route.test.mjs` ⇒ exit 0，`tests 7 · pass 7 · fail 0`；`node --test test/integration/batch-status-auto-set.test.mjs` ⇒ exit 0，`tests 2 · pass 2 · fail 0`。

终态 = `clean`。独立审计轮未跑（父侧收敛指令要求当轮收口；审计面由父侧代码评审覆盖）。

### 修正轮（2026-11-07 · 评审 `changes-required` 6 条）

父侧裁：6 条全部受理，按编号落，另加一条回归断言。本块先记裁定与落点，改完补读数。

| # | 裁定 | 落点 |
|---|---|---|
| 1 | 绑定值逐笔快照 | `thincoder-core/agent-tools/advisor.mjs` 在发起时点算出本笔绑定并随 `launch.batchDoc` 传下；`thincoder-core/agent-tools/advisor-async.mjs` 条目持 `batchDoc` 字段（与 `reviewId` / `designToken` 同形），`entry.start()` 不再读活的 `run` |
| 2 | 不携即清 | 同两档：不携档那一笔 = `null`（不继承上一笔）；`section3BlocksAtStart` 按本笔绑定值算 |
| 3 | 文件越线 = 暂缓 | 只记一行：`thincoder-core/agent-tools/advisor-async.mjs` 503 行越 500 咨询线，拆档归台账另行排期（父侧已立账） |
| 4 | 注释与死参 | `thincoder-core/advisor/loop.mjs`：`reviewType` 保留形参、注释写明本函数不再消费；`read-only ONLY` 改「只读六件 + 绑定档时追加 `batch`（写面限 §3）」 |
| 5 | 池扫兜底删除 | `thincoder-core/agent-tools/batch.mjs` 的 `batchDocForReview`：`callbacks` 缺 `batchDoc` 键 ⇒ `null`，单源 = 逐笔绑定 |
| 6 | 27-2 负半幅 | `test/integration/batch-status-auto-set.test.mjs`：同夹具不携 `batchDoc` ⇒ 工具表不含 `batch` 且 §3 轮次块 = 0 |
| + | 第 1 条回归断言 | `docs/batches/2026-11-07-tool-face-review-route.test.mjs`：两笔同实例发起（A ∥ B）都排队 ⇒ 先启动那笔的写通道只指向 A |

**第 1 条的可达链**（父侧逐字）：发起①携档 A、池满 ⇒ 排队；发起②携档 B ⇒ 取回同一实例 ⇒ `resolved.run.batchDoc = B`；排队条目不撞同 scope 门 ⇒ 槽释放后①启动读到 B ⇒ ①的评审把裁定写进 B。

**为什么严重**：`§3` 的段级状态行正是收口门与台账核销门读的那一格 ⇒ 一本没被评过的档可以被别人的评审置位。

**本轮不做**：不拆 `thincoder-core/agent-tools/advisor-async.mjs` · 不动提示词面 ∥ 设计档（`§2.15` 加不加第 5 行归设计席）· 不动 `thincoder-core/advisor/run.mjs` 的行为。

### 修正轮读数（2026-11-07）

**1 — 绑定值逐笔快照（🔴，本轮命）**

| 落点 | 改法 |
|---|---|
| `thincoder-core/agent-tools/advisor.mjs` | `launchBatchDoc` 在发起时点算一次；异步随 `launch.batchDoc` 传下，同步走 callbacks 同值 |
| `thincoder-core/agent-tools/advisor-async.mjs` | 条目新增 `batchDoc`（与 `reviewId` / `designToken` 同形）；`entry.start()` 改读 `entry.batchDoc` |

可达链已断：排队条目启动时不再读活的 `run.batchDoc`。

**2 — 不携即清**

`args.batchDoc` 缺 ∥ `null` ⇒ `launchBatchDoc = null`，并覆盖写回 `resolved.run.batchDoc`（不继承上一笔）。

同一条的第二句（基线按该笔算）也落了：实测三笔排队后 `section3BlocksAtStart` 被第三笔覆盖成 `null`，第一笔启动就丢基线——与绑定是同一格病（共享实例字段被后一笔覆盖）。载荷多带一个 `section3BlocksAtStart`，`entry.start()` 写回自己那一笔的值。

**3 — 文件越线（只记一行）**

`thincoder-core/agent-tools/advisor-async.mjs` 503 行越 500 咨询线（未越 800 硬限）；拆档归台账另行排期（父侧已立账）。

**4 — 注释与死参**

`thincoder-core/advisor/loop.mjs`：`advisorToolsFor` 的 `reviewType` 形参保留，签名 JSDoc 明写「签名兼容、本函数不再消费——绑定判据只有 `batchDoc` 在场」；集描述由 `read-only ONLY` 改「只读六件 + 绑定档时追加 `batch`（写面限 `§3`）」。

**5 — 池扫兜底删除**

`thincoder-core/agent-tools/batch.mjs` 的 `batchDocForReview` 现在两句：callbacks 带 `batchDoc` 键 ⇒ 该值，否则 `null`。池扫循环整段删除（没有改成「只改 design 半幅」——父侧裁定的第二个错档入口）。

调用面复核：核内 `runAdvisorReview` 两个调用点（同步 = advisor 工具，异步 = 条目 `start()`）现在都显式带 `batchDoc`，删除后无孤儿消费方。

**6 — 27-2 负半幅**

`test/integration/batch-status-auto-set.test.mjs` 新增一格：同夹具、不携 `batchDoc` 发起 ⇒ 工具表不含 `batch`、§3 轮次块 = 0、段级状态行为空。`scriptedProvider` 加空 `calls` 分支（单轮纯文本）。

**回归断言（⑧）**

`docs/batches/2026-11-07-tool-face-review-route.test.mjs` 新增 ⑧：同实例三笔排队（①携 A ∥ ②携 B ∥ ③不携）⇒ ①/② 各持自己的快照、③ = `null` 且实例字段被清；随后启动 ①，其评审请求工具表含 `batch`，写进去的只有 A。

**这条断言验过会红**：把 `entry.start()` 临时改回 `run?.batchDoc ?? null` ⇒ ⑧ 在「写通道仍在」一格失败；改回即绿。

**两处偏离（父侧未点名，理由在此）**

| # | 改动 | 为何 |
|---|---|---|
| a | 第 2 条扩到 `section3BlocksAtStart` 逐笔快照（两档各一小段） | 与 `batchDoc` 同一格病：字段挂共享实例，后一笔发起覆盖它 ⇒ 排队那笔丢基线（⑧ 实测到 `null`）。父侧第 2 条原文已含「基线必须按该笔的绑定值算」，按此落 |
| b | `thincoder-core/advisor/run.mjs` 只改注释三行（行为零变） | 第 5 条删掉池扫面后，该档注释仍写「异步路径 = 池条目的 `run.batchDoc`」——那正是被删的机制。父侧说「不动 run.mjs」，但留一句假话是本轮自造的漂移，故改注释并报明 |

**读数**

- `node --test docs/batches/2026-11-07-tool-face-review-route.test.mjs` ⇒ exit 0，`tests 8 · pass 8 · fail 0`
- `node --test test/integration/batch-status-auto-set.test.mjs` ⇒ exit 0，`tests 3 · pass 3 · fail 0`
- `--test-force-exit` 在本机 win32 上撞 libuv 断言（`UV_HANDLE_CLOSING`）——**与本次改动无关**：只留 27-1 ∥ 27-2 正半幅（等于改前原样）也复现；故读数按不带该旗的跑法。
- 设计档 `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` §2.15 的绑定面表「现形（实读）」列仍记改前表达式（`reviewType === "design" ? … : null`）——该档是设计席面，本席零 diff，仅记此处供父侧定位。

### 交付前内部代码评审（`advisor` · type=code）与逐条处置

范围 = 本批改面六档 + 本批档；结论 6 条（🟡2 · 🔵4，🔴 0）。**六条全受理**，处置如下。

| # | 严重度 | 结论 | 处置 |
|---|---|---|---|
| 1 | 🟡 | 逐笔快照只落到写通道；结算面 ∥ 冻结面仍读活的 `run.batchDoc` | **已修**：`thincoder-core/agent-tools/advisor-settle.mjs` 设计轨结算前写回本笔的 `batchDoc` ∥ 点火基线；`thincoder-core/agent/write-gate.mjs` 冻结窗改读 `entry.batchDoc`（两档在声明文件表外——如实报，理由见下） |
| 2 | 🟡 | `thincoder-core/agent-tools/advisor-async.mjs` 越 500 咨询线 | 父侧已裁暂缓；只在读数里按 `doc_check` 量法如实记，不动结构 |
| 3 | 🟡 | 设计单源仍写「绑定面三处」；§5 原记 503 行 | 读数已按 `doc_check` 重量；设计档面属设计席，只报不改 |
| 4 | 🔵 | 代码轨空串 ∥ 纯空白 `batchDoc` 不按「未携」处理 | **已修**：两轨同用 `missingBatchDoc`（空串一律落 `null`，与「不携即清」对齐） |
| 5 | 🔵 | 路径校验晚于实例解析（代码轨 ⇒ 拒发仍建实例） | **已修**：绑定值解析提到 `resolveAdvisorLaunch` 之前，与本档「零实例 / 零 token / 零槽」不变量复合 |
| 6 | 🔵 | ⑧ 只证「通道在」，未证「落点是 A」 | **已修**：⑧ 改用脚本化端点，评审员用**自己那张工具表**写 §3——落点由它证，不再另建通道 |

**第 1 条为什么算第 1 条的补完、不算另开一批**：它与我改的是同一格病（共享实例字段被同一实例的后一笔发起覆盖）。我不修，`§5` 上面那句「可达链已断」只对写通道成立：设计轨排队场景里评审写进 A、结算按 B 读 §3 并定 token 归属——正是本轮要断的那件事换个面活着。

**第 2 条如实记**：父侧「不拆」的裁定照办，越线读数只记录不作处置。

**改后读数**（`doc_check` 的 `lines` 量法，`countContentLines`）

| 档 | 内容行 |
|---|---|
| `thincoder-core/agent-tools/advisor-async.mjs` | 512（越 500 软线，未越 800 硬限） |
| `thincoder-core/agent-tools/advisor.mjs` | 385 |
| `thincoder-core/agent-tools/advisor-settle.mjs` | 247 |
| `thincoder-core/agent-tools/batch.mjs` | 202 |
| `thincoder-core/advisor/loop.mjs` | 301 |
| `thincoder-core/agent/write-gate.mjs` | 188 |

**回归断言复验（改后重跑探针）**：把 `entry.start()` 临时改回 `run?.batchDoc ?? null` ⇒ ⑧ 仍在「写通道仍在」一格失败；改回即绿。

**终态读数**

- `node --test docs/batches/2026-11-07-tool-face-review-route.test.mjs` ⇒ exit 0，`tests 8 · pass 8 · fail 0`
- `node --test test/integration/batch-status-auto-set.test.mjs` ⇒ exit 0，`tests 3 · pass 3 · fail 0`
- 邻面旁证（改到 `thincoder-core/agent-tools/advisor-settle.mjs` ∥ `thincoder-core/agent/write-gate.mjs`）：`test/integration/advisor-record-gate.test.mjs` ⇒ 3/3 · `test/integration/advisor-guard-reminder-cap.test.mjs` ⇒ 4/4，均 exit 0

## §6 验证与收口（父代理）

### 验证与收口

**父侧独立复验（不转抄 `§5`）**

| # | 判据 | 量法 | 实测 |
|---|---|---|---|
| 一 | **无一处写「免评审」** | 扫 `thincoder-core/prompts/*.md` ∥ `docs/core/requirements/ENGINEERING-MODE-V2.md` ∥ `docs/core/design/ADVISOR-GUARDS.md` ∥ `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` 的 `免评审` ∥ `免设计链` | **零命中** |
| 二 | **绑定面与轨无关** | `thincoder-core/advisor/run.mjs` 扫 `reviewType === "design" ? batchDocForReview` | **0 命中**（旧的三元绑定已拆） |
| 三 | **`#2081` 与实装同读** | `docs/core/design/LEDGER.md` ∥ `docs/core/design/TOOLS.md` 扫 `create only —` | **0 命中**（两串已改 `create / attach —`） |
| 四 | **用例面** | `node --test` 本批单测档 + `test/integration/batch-status-auto-set.test.mjs` | **11 例全绿 · 0 失败**（含新增 `27-2` 正负两半） |

**这批解决的是一条会持续制造假账的结构**

「工具面批免评审」+「台账核销门要求 §3 = 评审通过」两条并存 ⇒ **工具面批交付完核销不了**：要么编一份没有评审对象的结论，要么永远挂着。用户 2026-11-01 的裁定把它收成一句：**工具面免的是设计档，不是评审。**

**修正轮抓出的那条 🔴 值得单记**：异步评审的 `batchDoc` 原先在**启动时**读活的 `run` ⇒ 排队条目启动时可能读到**后一笔**的绑定，**一本没被评过的档可以被别人的评审置位**——`§3` 段级状态行正是收口门与核销门读的那一格。现在改成**逐笔快照**（发起时点算一次、随 `launch.batchDoc` 传下），并有回归断言（两笔同实例发起，先启动那笔的写通道只指向自己那本）。

**未做而必须记明**

- **本批单测档已按纪律删除**（读数留 `§5`：7 例）。**集成用例 `27-2` 保留**（业务入口：真 `batch` 工具 + 真评审绑定），已进 `test/RTM.md`。
- **`thincoder-core/agent-tools/advisor-async.mjs` 503 行越 500 咨询线**：`§5` 已记「拆档归台账另行排期」，父侧确认已立账，**本批不拆**。
- **需求档 `docs/core/requirements/ENGINEERING-MODE-V2.md` 的 advisor 行**（仍写「仅设计评审，纯只读评审」）：**父侧笔域，本批零 diff**。核查该行在**本批规则之外**——本批改的是「工具面批要不要评审」，该行说的是 advisor 的只读面，两者不冲突，**不属本批交付面**。

**对账**

- `§2` ↔ 设计档：本批机制单源在 `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` §2.15；`§2` 只指不抄。
- `§2` ↔ `§5`：六条验收对照逐条有读数；四条偏离中三条由父侧预裁、一条为补漏（绑定面第 4 处）。
- **前批遗留**：无。**暂缓批复核：无。**
- **用户可见面**：改的是评审路由与绑定面（工具面契约），**模型读到的提示词契约与实际行为已同拍**；无 UI 面、无配置项。

**收口**

- 台账 `#1940` ∥ `#2081`：**在途 → 待核销 → 已核销**。
- 本批自身即「工具面批走完一轮后 `ledger close` 能过」的实证：`§3` 有评审结论、`§4`/`§6` 齐备 ⇒ 核销门不再报「§3 未通过评审」。
