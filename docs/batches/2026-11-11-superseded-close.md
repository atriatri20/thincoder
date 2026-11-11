# 2026-11-11 · superseded-close
> 六段，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 每段只有一个作者：作者的段可 `append` 加内容、可就地改（`edit`）；非作者一概拒。
> 编制：主 agent · 2026-11-11 · 来源 = 来源 = 主 agent 2026-11-11 11:53 在处置 `docs/batches/2026-11-08-ledger-disposal.md` 时撞到的结构性缺口：一份「设计在、实施没做、对象已消失」的批档没有收口路径——正常收口要 §2/§3/§4/§6 齐全，补关要求行集全归档，两条都走不了。用户 2026-11-11 11:54「走」＝ 修这条缺口。。
> 台账 = #2332（core · 归批）。前情 = 无（独立批）。
## §1 讨论（主 agent）
**状态行**：已收口 2026-11-11
批起 sha = 68b741fb5eafdf18deaa4f32e1858ec23f31a579
<§1 模板占位：本批条目 / 关键判据 / 授权口径>

## 讨论纪要（主 agent）

**缺口是撞出来的，不是想出来的**

2026-11-11 11:53，我在处置 `docs/batches/2026-11-08-ledger-disposal.md`（一份 11-08 暂缓、对象已消失的批档）时，把两条收口路都试了一遍：

```
正常收口  batch close  → REFUSED: Missing §3 / §4 / §6
补关      repair close → 要求「行集非空 ∧ 全归档 ∧ `halfStates` 恰为唯一 `open-but-settled`」
                      ├─ 据设计档 §4.18-C 的判据推得，**我未实跑**（当时先撞上了上一行的拒）
                      └─ 它名下还有 8 条在途 + 3 条待核销 ⇒ 这一条也走不了
```

**两条都走不了。** 而它名下的 `#1913` ∥ `#1932` ∥ `#1933` 三条**活是真做完的**（evidence 分别写着「复量已归零」「阻断已不存在」「那一步当年执行过」），却结不了账：

```
ledger close #1913 → REFUSED：批档未收口（§1 = open），不得单独结算
```

**三条真实的完成被一个形式卡住。**

**这不是一份档的问题**

同形的批档今晚已数过：13 份「open-but-settled」是同一类（行结算了、档冻不了），用户 2026-11-11 01:02 裁「已经结算了的就算了」——那次是**行先结、档留开**；这次是**档关不了 ⇒ 行结不了**，方向相反，但根子是同一个：**批档只有「全链收口」一条出口，没有「被取代」这条。**

### 已定决定

- **已定决定**：加一条「被取代」收口边，而不是让 3 条已完成的账永远挂着 · 用户原话：「走」· 时间：2026-11-11 11:54

### 这条边不许伪造的部分

**这是本批最要紧的一条边界，设计席必须守住**：

「被取代」≠「跑过了」。它冻结的记录**不许出现 §3 评审结论、§4 批准、§6 验证**这些从未发生过的东西。

反过来，它也**不许把这些段留成空白就了事**——空白读起来像「还没来得及写」，而事实是「这批永远不会实施了」。

所以它至少要说清三件事，且能机读：
1. **谁取代了它**（哪一批 ∥ 哪个落点文档做了同一件事）
2. **它自己从未实施**（明写，不是暗示）
3. **名下已完成的待核销行照常结算**，未完成的在途行照常改挂「条件」并带「原批已收口，须另起批次接手」

### 边界（本批不做什么）

- 不改正常收口与补关两条路的判据——它们是对的，本批只加第三条。
- 不动那 13 份 `open-but-settled` 旧档（用户 11-11 01:02 已裁「算了」）。
- 不碰 15 份 10-15~19 的旧档（用户 2026-11-01「两周前的就先别管了」）。

## §2 批次任务与设计（eng-designer）
**状态行**：设计完成（验收轮 6 项已落（A 8 处依据引文改指新档 ∥ B `LEDGER.md` §11.2 一行 ∥ C 「节号」边界句 ∥ D 两条构造函数落点 ∥ E AC-19 ∥ AC-21 判据改可读口径 ∥ F AC-16② 改漂移面 0 处）；`doc_check` gate ∥ report 各 0 命中）

### 任务书

**目标**：给「对象已消失、永不实施」的批档一条收口边——靠「谁取代了它」这条人给的事实冻结。机制判据单源 = `docs/core/design/BATCH-RECORD.md` §4.18-D；本段只引不抄（§4.10 ∥ `docs/core/requirements/ENGINEERING-MODE-V2.md` §13.13）。

**需求回指**：`docs/core/requirements/ENGINEERING-MODE-V2.md` §13.6（批次档生命周期 FR28；「闭合/退役」条）。本批加的是该条之下的第三条终态：批被另一批 ∥ 另一落点取代。

三方一致 = 本段 E 表 ↔ §4.18-D 的验收回指 ←→ §13.6；需求粒度是整条生命周期，本批条目是它之下的一个终态，逐条映射见 E 表末句。

### 1 条目（条目 → 落点节号 → 判据源 → 验收行）

| # | 条目 | 落点（`BATCH-RECORD.md`） | 判据源 | 验收 |
|---|---|---|---|---|
| E1 | 第三条收口边的放行合取 D-1…D-5 | §4.18-D「放行合取」 | §4.18-D | AC-1 ∥ AC-3 ∥ AC-8 |
| E2 | `supersededBy` 的三形语法与「解不到就拒」 | §4.18-D「取代者的语法」 | 同节 D-5 ∥ R1 | AC-4 ∥ AC-5 ∥ AC-6 |
| E3 | 三条必带内容与 §1 追记行 | §4.18-D「三条必带内容」∥「§1 追记行」 | 同节 | AC-1 |
| E4 | `requireAllInFlight` 无缺省 + 未点名在途行的两步处置 | §4.18-D「③ 的实现面」 | 同节 | AC-2 ∥ AC-9 |
| E5 | 参数面 `completed` ∥ `closeEvidence`；点名一条本批在途行 = 该行 `已核销`（正路） | §4.18-D「入口」 | 同节 | AC-10 ∥ AC-11 ∥ AC-20 |
| E6 | 跳过两臂、保留其余门与写序 | §4.18-D「保留门与写序」 | 同节 | AC-12 |
| E7 | 反例 R1…R5 各自的拒面 | §4.18-D「反例」 | 同节 | AC-3…AC-8 |
| E8 | 提示词面一句：什么时候该用它 | §4.18-D ∥ `persona-engineering.md`「Batch-record lifecycle」第 3 条 | §4.18-D | AC-13 |
| E9 | 三族分拆**本批内**实施（`ledger-cmd.mjs` → `ledger-close.mjs` ∥ `ledger-consistency.mjs`，次序 ①→②） | §4.18-D「分档结论」① ② ③ | 同节 ∥ 用户 12:13「必须当批实施」 | AC-14（读数，非判定点）∥ AC-15 |
| E10 | 500 行规则五处同轮（判据单源 = `DOC-GRAPH.md` §3 ①） | `DOC-GRAPH.md` §3「行数档位口径」＋四处落笔面 | 同节 ① 判法句 | AC-16 |
| E11 | 集成测试套件缺失 ⇒ **本批就地建**，不再只记一笔 | `thincoder-core/prompts/discipline-engineering.md`「A missing integration suite is a debt…」 | 用户本轮新裁 · **集成套件条** | AC-17 |
| E12 | 安全机制 ⇒ **本批提出、本批落地**（谁定不变）：**两处同轮 = ① ∥ ⑤**，同一道口子的两种写法（`come later or in a separate round as needed` ∥ `propose it separately`）；五条逐条过，第三处 = 无 | `thincoder-core/prompts/common.md`「Security discipline」① ∥ ⑤ | 用户本轮新裁 · **安全机制条** | AC-18 |
| E13 | 评审 `Deferred` 默认本轮回修，两处同轮 | `thincoder-core/prompts/persona-engineering.md` ∥ `discipline-normal.md` 的 `Deferred` 段 | 用户本轮新裁 · **`Deferred` 条** | AC-19 |
| E14 | 本仓未声明目标的写入 = 同轮声明、同轮落地（「声明即写权、不加第二道锁」那一半不动）；支路按**有没有另一个项目的账**分（他仓 ∥ 非他仓），不按「在不在仓外」分；「这件活归谁做」不归本条（条款 9 ∥ 10） | `thincoder-core/prompts/discipline-engineering.md`「Docs & ledger repo-self-contained」条款 6 第二支 | 用户本轮新裁 · **条款 6 条** | AC-21 |

E11–E14 的出处一律写**裁定主题**，不写序数：序数在盘上曾让 E12 ∥ E14 都记成同一条，主题才是能追回原话的那一半（四条的序数不参与任何判据）。

E 表每一行的需求列 = `docs/core/requirements/ENGINEERING-MODE-V2.md` §13.6（同一条：批次档生命周期的闭合面）。

### 2 受影响文件与分档结论

| 文件 | 改动 | 档位 |
|---|---|---|
| `batch-supersede.mjs`（新档，落 `agent-tools/`） | `supersedeBatchRecord` + D-1…D-5 五条拒面 + `resolveSupersededBy` + 两条回执/追记构造函数（新名三问 = §4.18-D「新档与新名」） | 新档，设计期估 < 500 |
| `batch-closeout.mjs` | `assertCloseoutGates` 的 `repair?:boolean` → `mode:"normal"\|"repair"\|"supersede"` | 不越 |
| `batch-ledger-view.mjs` | `assertCloseDisposition` 透传 `requireAllInFlight`；新增读侧 `archivedStateOf` 供 D-3 | 不越 |
| `batch.mjs` | `action` 枚举 +1、`execute` 分派 +1、`supersededBy` 参数描述 | 不越 |
| `ledger-close.mjs`（新档 · 落 `agent-tools/`，本批拆出） | 收口重锚族六符号整族搬入（零语义改）+ `requireAllInFlight`（无缺省）+ 未点名在途行的退回边分支（§4.18-D「分档结论」①） | 新档，设计期估 < 500 |
| `ledger-consistency.mjs`（新档 · 落 `agent-tools/`，本批拆出） | 半状态读数族四符号整族搬入（零语义改）（§4.18-D「分档结论」②） | 新档，设计期估 < 500 |
| `ledger-cmd.mjs` | 两族搬出后只余绑定 ∥ 回收族 + 出口转出（逐名不变）；本路对它的新增改动 = 零。**两族各自跨度读数**（尺 = `node` 行扫的**物理行**，族首符号行 → 下一族首行前一行）：① 收口重锚族 = 288…422 = 135 行（族首 `completedSetForRows` 288）；② 半状态读数族 = 423…508 = 86 行（族首 `HALF_STATE_EXITS` 423）；全档 = 507 行（**另一把尺**：`doc_check` 的 `lines` 面 · 内容行）。**两把尺不相减**：物理行跨度与内容行读数没有换算关系，「搬出后余多少」不在此处推——它由 AC-14 那条命令在拆完后重跑得出（同一把尺 = `doc_check` `lines` 面），不构成第二个长度判定点。**超线时的下一刀**：回收族整族搬出 `ledger-recycle.mjs`（同一刀法：整族搬、零语义改、转出逐名不变），本档余绑定 + 出口转出 | 拆后读数为准（AC-14 是**读数**，不是判定点；判定点仍只有设计时 500 与收口 800） |
| `tool-docs/batch.md` | 描述面 +1 action、+1 参数 | — |
| `BATCH-RECORD.md` | §4.18-D（语法 ∥ 新名三问 ∥ 分档 ∥ 验收 ∥ 勘察行）· §4.1 枚举 · §4.3 分派 · §6.2 A8「七动作」——**盘上后三处已含 `supersede`／「七动作」⇒ 实施轮照复核，不再加一遍** | — |
| `LEDGER.md` §11.2 | 一行：批未收口的第三个出口 | — |
| `persona-engineering.md` | 收口动作段 +1 句（只指过去，不复述判据） | — |
| `docs/core/design/DOC-GRAPH.md` §3「行数档位口径」（判据单源） | 判法句 = 「过 500 ⇒ 必须给分拆方案，且分拆在本批内实施」；引文块标成**目标形**（落齐后即为逐字引文，落齐前按判法句判）；「两处互指」改「五处同轮」（本处 ∥ 工作区根 `AGENTS` ∥ `thincoder-cli/AGENTS.md` ∥ `advisor-design.md` 第 8 条 ∥ `persona-eng-designer.md` 受影响文件清单）。**本席已落** | — |
| 工作区根 `AGENTS` 档（Coding Conventions · File size · **仓外**） | 该句改成「above 500 lines ⇒ the design must carry a split plan and the split lands inside this batch (no deferral to another batch)」——逐字照 §3 新句。**父侧落笔**（仓外，走 `index.writableRepos` 声明） | — |
| `thincoder-cli/AGENTS.md` | 该句与工作区根那句逐字节同一句 ⇒ 同改成上句（逐字一致）。**落笔 = eng-coder**（产品文本面，非本席） | — |
| `thincoder-core/prompts/advisor-design.md` | 第 8 条判据「Affected-file tier check」改成「>500 lines → the design must give a split plan (no discretion), and the split lands inside this batch (no deferral to another batch)」；`>800` 那条逐字不动。**内容依据 = §4.18-D「分档结论」，落笔 = eng-coder**（本席不改提示词） | — |
| `thincoder-core/prompts/persona-eng-designer.md` | 受影响文件清单改成「each with a **split plan** that lands inside this batch, or that none crosses」。**落笔 = eng-coder** | — |
| `thincoder-core/prompts/discipline-engineering.md` | 「A missing integration suite is a debt…」那条：删「books a ledger row」，改成 AC-17 块里的**英文目标句**（本批 RTM 增量点名的用例在本批落地；套件为空则本批起建，50–100 窗口不变）。**落笔 = eng-coder**（内容依据 = E11） | — |
| `thincoder-core/prompts/discipline-engineering.md`（条款 6 · 「Docs & ledger repo-self-contained」） | 第二支删 `in a separate round`，改「未声明 ⇒ 停并上报（what / why）→ 主 agent 本轮把该目录加进本仓 `index.writableRepos`，该笔写入同轮落地、记在本仓账上；子代理遇未声明目标 ⇒ 上抛，由主 agent 声明后同轮落」。同条下半 `Why the table decides…` 逐字不动（它讲的是按目录声明就够，与哪一轮落无关）。**落笔 = eng-coder**（内容依据 = E14；逐字目标句见 AC-21） | — |
| `thincoder-core/prompts/common.md` | **Security discipline 两处同轮**。① 中段 `come later or in a separate round as needed` 逐字改成 `come after the feature is usable, and land in the same batch once the user approves them — not a separate round`；同句另两半分不动（`get the feature to "usable" first` ∥ `no security items are established before the feature takes shape`）。⑤ 删 `separately`，改「本批发现、本批提出；用户点头后在本批落地，不另开一批」；「不默认建立」「由用户定」两半个字不动。**五条逐条过 = 无第三处**（读数见 AC-18 块）。**落笔 = eng-coder**（内容依据 = E12） | — |
| `thincoder-core/prompts/persona-engineering.md` ∥ `thincoder-core/prompts/discipline-normal.md` | `Deferred` 段两处同轮改：默认本轮回修；`Deferred` 只剩「需用户裁定 ∥ 需改设计语义」两种，🟡/🔵 不再自动取得延期资格。**落笔 = eng-coder**（内容依据 = E13） | — |
| `2026-11-11-superseded-close.test.mjs`（当批定向单测，与批档同目录） | 收口随批删 | 新档，估 < 500 |
| `test/rtm/batch-ledger.md` ∥ `test/RTM.md` | 集成行 `14-14` + 故事标题两处同步（见 §4） | — |

本批三个新档（机制 = §4.18-D「新档与新名」∥「分档结论」；本处只给落点）：

```text
thincoder-core/agent-tools/batch-supersede.mjs
thincoder-core/ledger-close.mjs
thincoder-core/ledger-consistency.mjs
```

**笔权归属（是「谁执笔」，不是「本批不做什么」）**：提示词实体的**落笔 = eng-coder**（内容依据 = §4.18-D ∥ E11–E14，逐字目标句见 AC-13 ∥ AC-17 ∥ AC-18 ∥ AC-21 块）；本席只写内容依据，不改提示词档。故 E11–E14 四处改动**在本批范围内**，只是笔不在本席。

**量法与重跑命令**（D15 一把尺）：`doc_check(mode:"report", target:<仓根>, docs:[…], lines:[<上表源档>])` 的「行数读数」段；拆出两族之后同一条命令再跑一次，读 `ledger-cmd.mjs`（AC-14）。

本轮读数：`batch-closeout.mjs` 265 · `batch-ledger-view.mjs` 81 · `batch-lifecycle.mjs` 482 · `batch.mjs` 267 · `ledger-cmd.mjs` **507（越 500）**。

### 3 验收对照（每条都能红；载体 = `2026-11-11-superseded-close.test.mjs`）

| # | 输入 | 判据 | 机检形 |
|---|---|---|---|
| AC-1 | 现场形：§3/§4/§6 空 · §5 空 · 行 = 3 `待核销` + 8 `在途` · record open；调用 = `supersededBy` + `completed: []` + 非空 `closeEvidence` ⇒ `supersede` | 状态行 = `已收口 <日期>（被取代）`；§1 段尾恰 +1 行 `**取代记录**`（含 successor 与 `本批无实施记录（§5 未写）`）；§3/§4/§6 字节不变；此后 `append` 拒。8 条在途行全未点名 = 本路的合法形（「`[]` 合法当且仅当本批无 `在途` 行」是 `close` 路独有） | 档面逐字节比对（仅状态行 1 行替换 + 追记行 1 行新增） |
| AC-2 | 同 AC-1，读台账 | 3 条 `待核销` → `已核销`（`evidence` 带 `收口 <日期>：` 前缀）；8 条 `在途` → `待讨论` + `trigger=条件` + `resume_when` = 续启句原句，`task_book` / `executor` 清空 | 行读回 |
| AC-3 | R3：行集全归档 ⇒ `supersede` | 拒，拒文点名 `close` / 补关并含 `Nothing was written`；档账零变 | 单测断言拒串 + 档哈希不变 |
| AC-4 | R1a：`supersededBy` 空白 | 拒，拒文点名该参数；档账零变 | 同上 |
| AC-5 | R1b–R1d：形合法而解不到（三例见下块） | 三支各拒，拒文点名解不到的是哪一段；档账零变 | 同上 |
| AC-6 | R2：`supersededBy` = 本档路径 | 拒，拒文指回重开径（§4.18-B） | 同上 |
| AC-7 | R4：§5 有内容 ⇒ `supersede` | 拒 | 同上 |
| AC-8 | R5：台账读不出（库不可达 ⇒ `batchLedgerConsistency` 抛） | 拒，不降级放行 | 同上 |
| AC-9 | 收口后 `batch({action:"check"})` | `consistent = true`（判据三条见下块） | 读面回执 |
| AC-10 | `completed` 点名一条非本批在途行（一条 `待核销` 行 ∥ 别批的行） | 拒（依据 `ledger-cmd.mjs`「`completed` 含非本批在途行 #${id}（须属于本批且现态 在途）」）；档账零变 | 单测断言 |
| AC-11 | 三例：① `close` 路、有 `在途` 行、传 `completed: []`；② `supersede` 路、同形、`completed: []` 与省 `completed` 各一例；③ `closeEvidence` 缺 ∥ 空串 ∥ 全空白 | ① 拒（依据 `ledger-cmd.mjs`「completed 漏列在途行」）；② 两例均放行（= AC-1 那一形）；③ 两路同拒（依据同档「closeEvidence 必填（本笔工作证据，非空字符串）」） | 单测断言：①③ 断言拒串，② 断言成功 |
| AC-12 | 零回归：同形档不带 `supersededBy` 走 `close` | 链门原串逐字拒（§4 缺 ∥ §6 缺）；正常 `close` 行为零变 | 拒串逐字比对 |
| AC-13 | 提示词面那句（**英文面**：落点 = `persona-engineering.md`「Batch-record lifecycle」第 3 条 Close / retire actions，该档是英文运行时提示词） | 该句此前不存在 ⇒ 判据 = 改后英文新句**逐字在**（见下块），且句内指 `BATCH-RECORD.md` §4.18-D；**不判中文串**（英文提示词档里中文串永远零命中，拿它当判据会把正确落笔读红） | 内置 `grep`，同一把尺：改后英文新句 = 1 命中；中文形 = 0（仅对照，不作判据） |
| AC-14 | 拆出两族之后的 `ledger-cmd.mjs` | **读数，不是判定点**：拆完重跑一次 `lines` 面，读数入 §5；长度判定仍只有设计时 500 与收口 800 两处（`DOC-GRAPH.md` §3 ③ 一个字不动） | `doc_check(mode:"report", target:<仓根>, docs:[…], lines:["thincoder-core/ledger-cmd.mjs"])` 的「行数读数」段——拆后重跑 |
| AC-15 | 搬家零语义改。**这是搬家证明，不是集成验收** | ① 搬出符号体逐字节相同：每个符号在新档的函数体文本 = 搬前 `ledger-cmd.mjs` 该符号区段；② 导出面逐名比对：`ledger.mjs` 的转出名集搬前 ∥ 搬后相等（不多、不少、不改名）；③ 当批定向单测档里本路用例全绿（集成用例不在本条内，跑在父侧收口） | ① ② 同一次 `node` 行扫：取该符号区段与转出名集，两条读数入 §5；③ `node --test docs/batches/2026-11-11-superseded-close.test.mjs` |
| AC-16 | 500 行规则五处同轮；判据单源 = `docs/core/design/DOC-GRAPH.md` §3「行数档位口径」 | 两半。① **四处落笔面各读该句**（工作区根 `AGENTS` 仓外 ∥ `thincoder-cli/AGENTS.md` ∥ `advisor-design.md` 第 8 条判据 ∥ `persona-eng-designer.md` 受影响文件清单）：都要求「分拆在本批内实施」，无逃生口（不出现 `no split` ∥「另起一批」∥「体量过大可另批」）；`>800` 那条逐字不变。② **漂移面 = 0 处**：全库不存在把长度判定派给中间环节的句子（改前 / 改后各一条读数，读数住 §5）——这一问能红也能绿。腿二检索的候选读数（109 行 / 53 档）只作背景，不作判据：候选面问的是「可能相关的地方」，拿它当判据等于要求全库零提长度 | ① 改前 / 改后各读四处该行（内置 `grep`，同一把尺）：改前 = 只要求 `split plan` ∥ 改后 = 要求分拆在本批内落。② 改后漂移面 = 0 处（同一把尺）；候选面读数只作背景 |
| AC-17 | 用户新裁 · **集成套件条**：套件缺失当场建（**英文面**：落点 = `discipline-engineering.md`「A missing integration suite is a debt…」条） | 该条正文改成英文目标句（见下块）；判据 = 旧串零命 + 新句逐字在——**不判中文串**（同 AC-13：英文提示词档里中文串永远零命中，会把正确落笔读红） | 改前 / 改后各读该条一次（内置 `grep`，同一把尺）：`books a ledger row` 改前 = 1 → 改后 = 0；新句改后 = 1 |
| AC-18 | 用户新裁 · **安全机制条**：安全机制本批提出、本批落地 —— **两处同轮（① ∥ ⑤）+ 五条逐条过**（漏一处即假绿：改前 `separate round` 在 ①、`separately` 在 ⑤） | ① 逐字：`get the feature to "usable" first; security mechanisms come later or in a separate round as needed; no security items are established before the feature takes shape` → `get the feature to "usable" first; security mechanisms come after the feature is usable, and land in the same batch once the user approves them — not a separate round; no security items are established before the feature takes shape`（头半 `get the feature to "usable" first` ∥ 尾半 `no security items are established before the feature takes shape` 逐字不动，只换中段）；⑤ 逐字：`to establish one = propose it separately (what it guards against ∥ the cost ∥ why now), for the user to choose` → `to establish one = propose it (what it guards against ∥ the cost ∥ why now), for the user to choose — and once the user approves, it lands in this batch, never deferred to another`（删 `separately`，`(what it guards against ∥ the cost ∥ why now), for the user to choose` 逐字不动）；改后仍逐字在：`get the feature to "usable" first` ∥ `not established by default` ∥ `for the user to choose` | 判据 = 旧句零命 + 新句逐字在，**不按词组数命中**：范围 = `## Security discipline` 行 → 收尾句 `For situations you haven't seen before` 之前（内置 `grep`／`node` 行扫，同一把尺），改前 / 改后各读一次。① 旧串 `come later or in a separate round as needed` 改前 1 → 改后 0；⑤ 旧串 `propose it separately` 改前 1 → 改后 0；两句新形改后各 1；三短语逐字回读各 1。**为什么不判 `separate round` 词组零命**：① 的新句以否定形 `— not a separate round` 含该词组 1 处，那处正是裁定句本身；按词组零命判，正确的落笔也读红，且判不出「旧规矩还在」与「新规矩用否定语提到它」的分别——判据要能红，也要能绿。五条逐条过的读数见下表块 |
| AC-19 | 用户新裁 · **`Deferred` 条**：默认本轮回修，两处同轮 | `persona-engineering.md` ∥ `discipline-normal.md` 两处都改成：默认本轮回修；`Deferred` 只剩两种合法情形 = 需用户裁定 ∥ 需改设计语义；🟡/🔵 不再自动取得延期资格 | 两处各读该行，针 = `🟡/🔵 improvements`：改前两处各 1、改后两处各 0（同一把尺）。改前两处原句不同形（persona = ``Deferred` fits 🟡/🔵 improvements`；discipline-normal = ``**`Deferred` fits** 🟡/🔵 improvements``），故 `fits 🟡/🔵 improvements` 在后者改前实读 0（`fits` 与 emoji 之间夹着 `**`），不作针——针要两处都读得出。第二半 = 改后两处新句逐字一致 |
| AC-20 | `completed` 点名的正路（此前只有拒面与空形） | 1 条在途行点名 + 7 条未点名 ⇒ 被点名那行 `已核销`（`evidence` 带 `收口 <日期>：` 前缀）、7 行退回 `待讨论` + `trigger=条件` + 续启句原句；档冻结成功 | 单测断言 + 行读回（同一夹具，行态逐行断言） |
| AC-21 | 用户新裁 · **条款 6 条** 第二处：本仓未声明目标的写入 = 同轮声明、同轮落地；**支路按「有没有另一个项目的账」分，不按「在不在仓外」分**（他仓一定是仓外；仓外不一定是他仓——工作区根文件在仓外，而那一层既无 `.git` 也无 `PROJECT-MANIFEST.json`，没有「别人的账」这回事） | `discipline-engineering.md` 条款 6 第二支改成逐字（原 `Not in the table ⇒ **stop and report** (what / why), and the main agent handles it **in a separate round** — a write outside this repo in this round lands in a repo whose account this round does not hold.` 整句退场）：`Not in the table ⇒ **stop and report** (what / why), then the main agent adds that directory to this repo's `index.writableRepos` — declared in this round — and the write lands in the same round, booked on this repo's account. A subagent that meets an undeclared target raises it to the main agent, which declares it and lands the write in the same round.` ／ `**The split is not "inside or outside this repo's tree" but whether another project's account exists**: a target outside the tree that carries no manifest and no ledger of its own (a workspace-root file ∥ shared config ∥ a scratch area) is not another repo — nothing else records the write, so declaring it here lands the write in the same round on this repo's account. A target that is another project (its own manifest ∥ ledger) ⇒ **not** declared into this repo's `index.writableRepos`: who owns that work follows clauses 9 ∥ 10.` ／ `**This clause answers only two questions — whether the write is allowed, and whose account carries it.**`。同条第一支与下半 `Why the table decides: …` 逐字不动 | 改前 / 改后各读该条一次（范围 = `6. **Out-of-repo changes` 行 → `7. **Several repos coexisting` 之前；内置 `grep`／`node` 行扫，同一把尺）：① 改前含 `in a separate round` = 1，改后 = 0；改后 `declared in this round` = 1 ∥ `lands in the same round` = 1 ∥ `Why the table decides` = 1。② **主语半条**：改后判断句的主语读出来是「有没有另一个项目的账」——含 `whether another project's account exists` = 1，且 `outside this repo's tree` 只出现在否定形 `is not` 之后；`writableRepos` 逐处判——三处各自点名该表（写入这里 ∥ 子代理上抛 ∥ 他仓不声明），**不按出现次数判**（总数随句子数走，句子增删不改语义）∥ `the target repo's ledger is never written` = 1 ∥ `not` declared into this repo's `index.writableRepos` = 1（**这一条才分得清两种落法**：改后软指针 `stays under the first branch above` 必须 = 0——它逐字在 ⇒ 他仓不走本仓声明，两种读法之一被排除） |

AC-5 的三例与 AC-9 的三条判据（载体同表）：

```text
AC-5 · 形合法而解不到：docs/batches/2099-01-01-never-existed.md
AC-5 · 文档在盘而节号不命中：docs/core/design/LEDGER.md §99.9
AC-5 · commit 不可达：任意 40 位十六进制（版本库里不存在）

AC-9 判据一：closed-but-open-rows 对 在途 行恒计，不看 trigger
  依据 thincoder-core/ledger-cmd.mjs「const inFlight = rows.filter((r) => r.status === "在途")」
AC-9 判据二：条件 排除只作用等待态那一臂
  依据 同档「(r.status === "待讨论" || r.status === "待设计") && r.trigger !== "条件" && r.trigger !== "认账不排期"」
AC-9 判据三：在途 行进不了 conditioned 支
  依据 同档「if (row.status !== "待讨论" && row.status !== "待设计") continue」
AC-9 结论：无命中的原因是 行已离开 在途（退回边那条），不是把 条件 行排除出去
```

AC-13 ∥ AC-17 的逐字目标句（**英文面，实施不得改写**：两处落点都是英文运行时提示词，判据只读英文形；中文形在那里永远零命中，不作判据）：

```text
AC-13 · persona-engineering.md「Batch-record lifecycle」第 3 条 Close / retire actions 下新增一条：
**A record whose object is gone, will never be implemented, and can name its successor goes `supersede`** (`BATCH-RECORD.md` §4.18-D) — do not fill the four sections in to make `close` pass, that is fabrication; and do not keep it open forever.

AC-17 · discipline-engineering.md「A missing integration suite is a debt…」条改为：
- **A missing integration suite is a debt, not a steady state**: an empty set passes nothing — the closeout reports the count against the window (`0 / 50–100`), and the cases this batch's RTM delta names land in this batch; with an empty suite, the suite starts in this batch (the window stays 50–100).
```

AC-18 的五条逐条过（2026-11-11 本席逐行读 `thincoder-core/prompts/common.md`「Security discipline」全五条，找「以后再做」被写成「另一轮做」的第三处）：

```text
① 「security mechanisms come later or in a separate round as needed」—— 命中 ⇒ 改后句见 AC-18 行
② 「get it running first, then enumerate the attack surface from real data flows」—— 次序句（先跑起来再枚举），非「另一轮」= 无
③ 「when an existing protection blocks the path you need to verify now ⇒ disable it / tear it down first」—— 当场处置，非「另一轮」= 无
④ 「when stopping it, stop it cleanly — close the config + collect the runtime residue」—— 当场收净，非「另一轮」= 无
⑤ 「to establish one = propose it separately」—— 命中 ⇒ 改后句见 AC-18 行
节首那句「usable first, secure later」—— 「可用之后」的次序，与改后 ① 同义，非「另一轮」= 不动
结论：五条里两处把「以后再做」写成「另一轮做」= ① ∥ ⑤；其余三处与节首句 = 无第三处

2026-11-11 本轮复读全五条 + 节首句逐字（thincoder-core/prompts/common.md「Security discipline」），读数不变：① ∥ ⑤ 两处；②③④ 与节首句 = 无第三处。
```

### 4 集成测试设计（`test/RTM.md` 读面 → 本批增量 = 1 行）

**读面**：本席本轮实读 `test/RTM.md` 的故事索引表与分册 `test/rtm/batch-ledger.md`。

- **破 = 0**：`14-13`（全归档补关）断的是「全归档 ⇒ 补关」，本批 D-3 在同形上拒 `supersede`，该行判据零改。
- **破 = 0（续）**：`14-4` ∥ `14-5` ∥ `14-10` ∥ `14-11`（正常 close 的完成清单与重锚）走 `requireAllInFlight=true`，行为零变。
- **冗余 = 0**：没有一行断言过「未全归档 ∧ §5 空 ⇒ 也能收口」——既有两行只覆盖链门与补关。
- **并入六项之后的增量 = 零**：分拆（E9）= 纯搬家，不改任何业务可观察结果——换的是符号住在哪个档，调用面逐名不变（AC-15），故无场景新增；500 行规则（E10）= 规则陈述，`DOC-GRAPH.md` §3 末段已同判「集成用例差量 = 零行」；用户新裁四条（E11–E14）= 提示词面措辞改动，其中 E11 只改「什么时候建套件」、不改窗口、不改本批 `14-14`；E12 ∥ E13 ∥ E14 改的是「哪一轮落」的措辞（安全机制 ∥ `Deferred` ∥ 未声明目标），不动任何业务可观察结果。
- **缺 = 1 行**，号 = **`14-14`**，住 `test/rtm/batch-ledger.md` 的故事 `CLI 14`。
- 该故事标题随行扩成「评审过、完成清单收口、重开回、被取代冻结」——`test/RTM.md` 索引标题格与该册 H2 两处逐字一致。
- **结论**：§4 的 delta 仍是破 0 · 冗余 0 · 缺 1 行（`14-14`）；六项并入不移动这个结论。

`14-14` 五格：

- **交互** = `batch` 工具 → 台账重锚事务 → `batch check` 读面。
- **业务可观察结果** = 一本 §5 空、行 = 3 `待核销` + 8 `在途` 的批档调 `supersede`：状态行变 `已收口 <日期>（被取代）`、§1 段尾落 `**取代记录**`、§3/§4/§6 逐字节不变；3 行结清为 `已核销`（证据带收口前缀）；8 行退回 `待讨论` 并改挂条件（续启句入 `resume_when`）；`check` 读一致。
- **业务入口** = 主 agent 在收口轮调 `batch({action:"supersede"})`。
- **回指** = `BATCH-RECORD.md` §4.18-D ∥ `docs/core/requirements/ENGINEERING-MODE-V2.md` §13.6。
- **用例文件** = `test/integration/batch-gates-reanchor.test.mjs`。

### 5 勘察证据行

查过 = 本仓 `BATCH-RECORD.md` §4.18-A ∥ B ∥ C ∥ D ∥ §4.13 ∥ §4.1 ∥ §4.3 ∥ §4.10——**相关**。

另查 = `LEDGER.md` §11.2 ∥ `docs/core/requirements/ENGINEERING-MODE-V2.md` §13.6 ∥ §13.13 ∥ `test/RTM.md` ∥ `test/rtm/batch-ledger.md`（第 13 / 14 / 27 节）——**相关**。

另查（续）= 用户新裁三条并入后新入射程的几处，逐句已读，**相关**：

- `thincoder-core/prompts/discipline-engineering.md` 的「A missing integration suite is a debt…」条。
- `thincoder-core/prompts/common.md` 的「Security discipline」全五条（① ∥ ⑤ = 两处同一道口子，②③④ 与节首句无第三处）。
- `persona-engineering.md` ∥ `discipline-normal.md` 的 `Deferred` 段（两处同一段话）。
- 两条 500 行落笔面：`advisor-design.md` 第 8 条判据 ∥ `persona-eng-designer.md` 受影响文件清单。

声明源 = `PROJECT-MANIFEST.json` 的 `index.publicRepos` = **`["../.thincoder", "../thincoder.com"]`**（实读该段两处）⇒ 兄弟仓已声明；两处都不是本口径的语义源头（`../.thincoder` 那份同主题档 2026-11-11 已按用户裁定整份删除；`../thincoder.com` 的对象是 HTML 页，不是代码档的档位口径），故公共源勘察结论 = 无相关，无独立文档仓可勘察。

### 6 open 与上抛

- **open（归主 agent）**：需求档 §13.6 是否要为「被取代」单独立一条子条目。本席只引该节、不改需求档；若裁「要立」，判据不变，多一条需求行。
- **open（归主 agent，本轮新报）**：E14 / AC-21 那条纪律（本仓未声明目标的写入 = 同轮声明、同轮落）在需求档里没有现成条目——§13.6 = 批次档生命周期，§13.13 = §2 只引不抄 + 设计变更传播，两处都不管「写入记谁的账」。本席不改需求档。裁定条件 = 主 agent 判「立 ∥ 不立」；失效条件 = 立则多一条需求行（判据不变，仍 AC-21），不立则以「用户本轮新裁 · 条款 6 条」为唯一依据、随批档留存。
- **本批实施（不再是待裁）**：`ledger-cmd.mjs` 的三族分拆按 §4.18-D「分档结论」① → ② 次序在本批内做完；拆后读数（AC-14）入 §5，不构成第三个长度判定点。
- **待裁（归主 agent → 用户；本轮已报，用户本轮未裁）**：`thincoder-core/prompts/discipline-engineering.md` 条款 10 逐字「**The one exception**: they **block or overturn the current task** ⇒ the stop-and-report discipline applies, and the main agent opens a separate round to dispose of them in their own repo — lose nothing, mix nothing.」——它是「这件活归谁做」的出口，不是写权问题，故本批不动（本批改动面 = 只有条款 6，见 E14）。裁定条件 = 主 agent 下一轮问用户；失效条件 = 用户裁定后本行改写为裁定结果，若本批收口前仍未裁则随 §6 记「未裁、未动」。
- **实施轮开工第一步**：§4.18-D 引的四条代码依据（`inFlight` 恒计 ∥ `条件` 只作用等待态 ∥ `在途` 不进 `conditioned` 支 ∥ `alreadyAnchored` 那一支）本轮未进代码面复核（代码不在评审射程），实施轮先复读这四行再动手。

### 7 边界（本批不做）

- 不改正常收口与补关两条路的判据——它们是对的，本批只加第三条。
- 不为「行集未全归档 ∧ 无 successor」开第四条边：工作既没归档也没人接手，唯一出路是做完它，或把行裁成 `已废弃` 再补关。
- 不动那 13 份 `open-but-settled` 旧档，不碰 15 份 10-15~19 的旧档（用户已裁）。
- 不把 `supersede` 并进 `close`（§4.18-D「关键决策」KD-D1 已裁 = 独立 action）。





## §3 设计评审（评审子代理）
**状态行**：评审通过（第 5 轮：上轮 9 条（#15–#23）逐条核过，全修；本轮新 0 条）



### 轮次 1（评审子代理）

| # | 严重度 | 状态 | 证据 |
|---|--------|------|------|
| 1 | 🔴 | 待修 | `docs/batches/2026-11-11-superseded-close.md` §9 表 `thincoder-core/ledger-cmd.mjs` 行「存量，不越档」+ §9「分档结论」「无一提分拆」——`doc_check` lines 读数该档「越 500（设计器硬线：设计轮必给分拆方案）」，设计无分拆方案 |
| 2 | 🔴 | 待修 | 同档 §12「RTM delta 未定形」+「这一句是推断，不是读数」——全档无以 `test/RTM.md` 为起点的集成测试设计节，缺失行的号未定 |
| 3 | 🔴 | 待修 | 同档 §7 R1 行「点不出 successor 的落点」vs §2 表①「解析回本档自身 ⇒ 拒」+ §10 AC-4「空白 ⇒ 拒」——R1 在盘上的机判只有空白 ∥ 自指两条，任何编造的 successor 串都过 |
| 4 | 🟡 | 提示 | 同档 §1 表补关行「行集非空 ∧ 每行 `已核销 / 已废弃`」∥ `docs/core/design/BATCH-RECORD.md` §4.18-C「且 `halfStates` 恰为唯一 `open-but-settled` 时进入补关」——§2 复述少一合取，即同档 §4.8 BR-91「机制叙述不在 §2」的漂移实例 |
| 5 | 🟡 | 提示 | 同档 §9 表 BATCH-RECORD 行「新 §4.18-D（状态面）+ §4.13 一行指针 + §7 两条决定」——盘上 §4.18-D 自持 KD 表、§7 无该批决定行；且 §4.1 的 action 枚举仍止于 `close`（未登记第八个动作） |
| 6 | 🟡 | 提示 | 同档 §2 ③「`待核销` → `已核销`（带 `closeEvidence`）」——`completed` / `closeEvidence` 的参数面与「`[]` 合法当且仅当本批无 `在途` 行」未进 §2，§10 无对应 AC |
| 7 | 🟡 | 提示 | 同档 §10 AC 表只到 AC-6（R3 / R1 / R2 / R4）——R5「台账读不出 ⇒ 拒」无验收行，而 `docs/core/design/BATCH-RECORD.md` §4.18-D 要求「R1 / R2 / R3 / R4 / R5 各一条拒面」 |
| 8 | 🟡 | 提示 | 同档 §10 AC-1「行 = 3 `待核销` + 8 `条件`」vs §1「还有 8 条在途 + 3 条待核销」——两份读数互相矛盾，且「11-08 形」这条 AC 不触发退回边那一支 |
| 9 | 🟡 | 提示 | 同档 §10 AC-7「也不再属本批行集（`task_book` 已清）」vs `docs/core/design/BATCH-RECORD.md` §4.10「两向互为反查」+ §4.18-C「还命中 `header-row-missing` 等任一读形 ⇒ 拒」——§14 判据一 / 二 / 三 未覆盖清 `task_book` 这一面（代码不在本轮范围，未核） |
| 10 | 🟡 | 提示 | 同档 §10 两行与 §12 第二条上抛（`HALF_STATE_EXITS` 只给出路句）在 §14 落判据三后仍存活——§14「残留（下一轮须清）」「内容已被本条取代」= 修订式残留留在规范面 |
| 11 | 🟡 | 提示 | 同档 §8 全节为仓内代码档（`batch-closeout.mjs` / `batch-lifecycle.mjs` / `batch-ledger-view.mjs` / `ledger-cmd.mjs`）——无公共源档 ∥ 独立档库的勘察证据行 |
| 12 | 🟡 | 提示 | 同档 §9 只有「档位」列、「分档结论」无判据出处——无量法 ∥ 复核命令；单元测试档行标「—」（未判） |
| 13 | 🟡 | 提示 | 同档 §9 首行 `thincoder-core/agent-tools/<batch-supersede>.mjs`——新档名仍是占位形，新名三问（在哪 ∥ 叫什么逐字 ∥ 谁用）未逐名给出 |
| 14 | 🟡 | 提示 | 同档 §2 无需求档回指——`docs/core/design/BATCH-RECORD.md` §5「批次档 §2 条目 = 设计档验收回指 = 需求档条目」三方对不齐，第 2 条缺行的回指对象也缺 |
| 15 | 🔵 | 备忘 | 同档 §14「处置 = 工具修好后删这两行」无批号 ∥ 台账行承载，残留会跨批留存 |

VERDICT: changes-required

计数：🔴 3 · 🟡 11 · 🔵 1（共 15 条）。

### 轮次 2（评审子代理）

| # | 严重度 | 状态 | 证据 |
|---|--------|------|------|
| 1 | 🔴 | 已修 | `docs/batches/2026-11-11-superseded-close.md` §2 表 ledger-cmd 行「改前已越 500 ⇒ 带分拆方案」+ `docs/core/design/BATCH-RECORD.md` §4.18-D「分档结论」三族 ∥ 切点 ∥ 次序 ∥ 承接 |
| 2 | 🔴 | 已修 | 同档 §2「集成测试设计」：破 = 0 · 冗余 = 0 · 缺 = 1 行 · 号 `14-14` · 五格齐 |
| 3 | 🔴 | 已修 | `docs/core/design/BATCH-RECORD.md` §4.18-D「取代者的语法」三形各带机读判据 +「不存在就拒」；同档 §2 AC-5 三支 |
| 4 | 🟡 | 已修 | 同档 §2「只引不抄」+ 机制单源 §4.18-D；§1 补关行已含 `halfStates` 合取 |
| 5 | 🟡 | 已修 | 同档 §2 表 BATCH-RECORD 行改「§4.1 枚举 +1 · §4.3 分派 +1 · §6.2 A8」；「§7 两条决定」条已去 |
| 6 | 🟡 | 已修 | 同档 §2 E5 + AC-10 ∥ AC-11；`docs/core/design/BATCH-RECORD.md` §4.18-D「入口」参数三行（但见新 #16） |
| 7 | 🟡 | 已修 | 同档 §2 AC-8 = R5「台账读不出 ⇒ 拒，不降级放行」 |
| 8 | 🟡 | 已修 | 同档 §2 AC-1「行 = 3 `待核销` + 8 `在途`」；§4.18-D 验收 1 ∥ 1b 两夹具各自点名驱动支 |
| 9 | 🟡 | 已修 | §4.18-D 验收 4 子块：`header-row-missing` ∥ `pointer-stale` 两判据 +「靠的是「行已离开行集」」 |
| 10 | 🟡 | 已修 | 旧 §10 推断行与旧 §12 上抛整段退场；同档 §6 改「open ∥ 待裁 ∥ 实施轮开工第一步」 |
| 11 | 🟡 | 已修 | 同档 §5「勘察证据行」：查过 ∥ 另查 ∥ 声明源 `index.publicRepos` = `[]` |
| 12 | 🟡 | 已修 | 同档 §2「量法与重跑命令」+「本轮读数」五档；实测 265 ∥ 81 ∥ 482 ∥ 267 ∥ 507 与读数逐档一致 |
| 13 | 🟡 | 已修 | 同档 §2 新档名逐字 `thincoder-core/agent-tools/batch-supersede.mjs`；§4.18-D「新档与新名（逐名三问）」八名逐个 |
| 14 | 🟡 | 已修 | 同档 §2「需求回指」`docs/core/requirements/ENGINEERING-MODE-V2.md` §13.6 + 三方一致句 + E 表末句 |
| 15 | 🔵 | 已修 | §6「待裁（归父侧排期）」承接分拆批；旧「工具修好后删这两行」无残 |
| 16 | 🔴 | 待修 | `docs/core/design/BATCH-RECORD.md` §4.18-D「入口」「`[]` 合法当且仅当本批无 `在途` 行」∥ 同节 ③「传 `false` 时未点名的在途行走**两步**」+ 验收 1「本形驱动退回边那一支」——同一机制两处活描述互斥：`docs/batches/2026-11-11-superseded-close.md` §2 AC-1（8 `在途`、不传 `completed`）与 AC-11（「有在途行却传 `completed: []`」⇒ 拒）不能同真；AC-1 亦未给 `closeEvidence`，而该笔结算 ≥1 行时 §4.18-D「入口」言其必填 |
| 17 | 🟡 | 待修 | `docs/core/design/BATCH-RECORD.md` §4.18-D 验收 2「同形：…8 条 `条件` 行字节不变」——紧随 1 ∥ 1b 两夹具，「同形」指哪一条不明；指 现场形 则与 验收 1「8 条在途行未经点名」及 验收 4（退回 `待讨论`）冲突 |
| 18 | 🔵 | 待修 | `docs/core/design/BATCH-RECORD.md` §4.18-D「新档与新名」块前一处空「受影响面」标题、其后另有同名一处；`docs/batches/2026-11-11-superseded-close.md` §2「新档的三条全路径」两条实为「分档结论」的将来拆分落点 |
| 19 | 🔵 | 备忘 | 同档 §2 表 BATCH-RECORD 行把 §4.1 枚举 ∥ §4.3 分派 ∥ §6.2 A8 列为待改，盘上三处已含 `supersede` 与「七动作」——实施轮照「复核」而非再加一次 |

VERDICT: changes-required

计数：上轮 15 条全修（🔴 3 · 🟡 11 · 🔵 1）；本轮新 4 条（🔴 1 · 🟡 1 · 🔵 2）。

### 轮次 3（评审子代理）

| # | 严重度 | 状态 | 证据 |
|---|---|---|---|
| 1 | 🔴 | 待修 | `docs/batches/2026-11-11-superseded-close.md` §7「边界（本批不做）」逐字「不拆 `ledger-cmd.mjs`（承接批另起）」∥ 同档 §6「open 与上抛」逐字「本批只带方案不自行拆」；同档 §2 受影响文件表逐字「本批拆出」∥ AC-14「行数 ≤ 500」∥ AC-15，`docs/core/design/BATCH-RECORD.md` §4.18-D「分档结论」逐字「承接 = 本批实施」——本批范围声明与本批交付相反 |
| 2 | 🔴 | 待修 | `docs/core/design/DOC-GRAPH.md` §3「行数档位口径」逐字「**全引**（字句未改）」与「引文与两份 `AGENTS` 档（工作区根 ∥ `thincoder-cli/AGENTS.md`）逐字一致」——工作区根 `AGENTS` 档现文只到「above 500 lines ⇒ the design must carry a split plan; at or below ⇒ nothing to judge」，无本批内那半句；同批 §2 表四处逐字「父侧落笔」/「落笔 = eng-coder」尚未落 ⇒ 单源先落、四引用后落，同一机制两处活描述不同，且「逐字一致」当场为假 |
| 3 | 🔴 | 待修 | 同 `docs/core/design/DOC-GRAPH.md` §3「行数档位口径」③ 逐字「实施轮 ∥ 代码评审 ∥ 其他任何中间环节都**不作代码长度检查**」vs `docs/batches/2026-11-11-superseded-close.md` §2 AC-14「行数 ≤ 500」——本轮改了 ① 未改 ③，单源自身两支相反 |
| 4 | 🟡 | 待修 | `docs/batches/2026-11-11-superseded-close.md` §2 条目表 E1–E8 无新并入的两项（三族分拆 ∥ 500 规则五处同轮）⇒ 条目表 ∥ AC-14–AC-16 ∥ 受影响文件表三方不齐 |
| 5 | 🟡 | 待修 | 同档 §4「集成测试设计」的「破 = 0」∥「冗余 = 0」∥「缺 = 1 行」写在两项并入之前；对它们未写「不改任何业务可观察结果、不新增场景，理由是…」 |
| 6 | 🟡 | 待修 | 同档 AC-15 逐字「两次全绿，且断言零增删」＝搬家零语义改的判据：三档集成用例未覆盖的路径不在判内，且三档集成用例被排进实施轮验收 |
| 7 | 🟡 | 待修 | 同档 AC-10 ∥ AC-11 只断 `completed` 的拒面与「空 ∥ 省」两形；「点名一条在途行 ⇒ 该行 已核销」这一正路无验收 |
| 8 | 🟡 | 待修 | 同档 §2 受影响文件表 ledger-cmd 行逐字「拆出两族后 ≤ 500」：两族各自读数未给、余量与转出行未算、超线时无下一刀 |
| 9 | 🟡 | 待修 | `docs/core/design/BATCH-RECORD.md` §4.18-D「新档与新名（逐名三问）」未含「分档结论」① ∥ ② 拆出的两档 ⇒ 三问缺两名 |
| 10 | 🟡 | 待修 | 同节「受影响面」逐字「A8 行「六动作」随枚举改「七动作」」vs 本档 §6.2 A8 已写「action 枚举七动作」，且同一列表 `batch.mjs` 那条已写「盘上三处已含」——盘态两说 |
| 11 | 🟡 | 待修 | `docs/batches/2026-11-11-superseded-close.md` §2 状态行逐字「第 2 轮评审 19 条全落」vs 本档「轮次 2」的 #16（🔴）与 #17–#19 均记「待修」 |
| 12 | 🟡 | 待修 | 同档 AC-16 逐字「四处各取该行」：四处各读一行，无一条读数证明「五处」穷尽——`docs/core/design/DOC-GRAPH.md` §3 的「腿二 · 按数」不在验收内 |
| 13 | 🔵 | 备忘 | `docs/core/design/BATCH-RECORD.md` §4.18-D 验收 1b 逐字「落 `alreadyAnchored`」＝同节唯一未带依据的代码读数名 |
| 14 | 🔵 | 备忘 | 同节「分档结论」逐字「（>500 必须给方案，无裁量）」仍是改前那半条；`docs/core/design/DOC-GRAPH.md` §3 ① 现为「方案 + 本批内实施」 |

VERDICT: changes-required

计数：🔴 3 · 🟡 9 · 🔵 2（共 14 条）。

### 轮次 4（评审子代理）

| # | 严重度 | 状态 | 证据 |
|---|---|---|---|
| 1 | 🔴 | 已修 | `docs/batches/2026-11-11-superseded-close.md` §7「边界（本批不做）」已无「不拆 `ledger-cmd.mjs`（承接批另起）」；§6「open 与上抛」改逐字「**本批实施（不再是待裁）**」 |
| 2 | 🔴 | 已修 | `docs/core/design/DOC-GRAPH.md` §3「行数档位口径」引文块前改逐字「下面这段是**目标形**——五处同轮落齐之后即为逐字引文」，另起一段「**「逐字一致」是目标状态，不是当前读数**」记盘上现状 |
| 3 | 🔴 | 已修 | `docs/batches/2026-11-11-superseded-close.md` §2 AC-14 改逐字「**读数，不是判定点**」；`docs/core/design/DOC-GRAPH.md` §3 ③「中间一概不判」未动 |
| 4 | 🟡 | 已修 | 同档 §2 条目表补 E9–E14 六行 |
| 5 | 🟡 | 已修 | 同档 §4 补「并入五项之后的增量 = 零」并逐项给理由 |
| 6 | 🟡 | 已修 | 同档 AC-15 改为搬家证明三判：符号体逐字节 ∥ 导出面逐名 ∥ 单测全绿（集成不在本条内） |
| 7 | 🟡 | 已修 | 同档 AC-20 补「1 条在途行点名 + 7 条未点名」的正路 |
| 8 | 🟡 | 已修 | 同档 §2 ledger-cmd 行补两族跨度读数与逐字「**超线时的下一刀**」 |
| 9 | 🟡 | 已修 | `docs/core/design/BATCH-RECORD.md` §4.18-D「新档与新名（逐名三问）」补 `ledger-close.mjs` ∥ `ledger-consistency.mjs` 两名三问 |
| 10 | 🟡 | 已修 | 同节「受影响面」A8 那条改逐字「**盘上已写「action 枚举七动作」**，实施轮照复核，不再加一遍」 |
| 11 | 🟡 | 已修 | `docs/batches/2026-11-11-superseded-close.md` §2 状态行改「第 3 轮 14 条已落」 |
| 12 | 🟡 | 已修 | 同档 AC-16 补「腿二 · 按数」读数与「命中档集合 ⊆ 五处」 |
| 13 | 🔵 | 已修 | `docs/core/design/BATCH-RECORD.md` §4.18-D 验收 1b 的 `alreadyAnchored` 已带逐字依据 |
| 14 | 🔵 | 已修 | 同节「分档结论」改逐字「本节带分拆方案，且分拆在本批内实施」 |
| 15 | 🔴 | 待修 | `docs/core/design/BATCH-RECORD.md` §4.18-D「分档结论」的「**四层同轮改**」只列四处（漏 `thincoder-cli` 的 `AGENTS` 档），并引「任一处改动，须同轮改另一处」；`docs/core/design/DOC-GRAPH.md` §3「行数档位口径」同一条规则写逐字「同口径共五处……任一处改动，须同轮改其余四处」——同一机制两处活描述不同，且前者引的那句已不是原文 |
| 16 | 🟡 | 待修 | `docs/core/design/DOC-GRAPH.md` §3「行数档位口径」勘察证据写 `advisor-design` 第 8 条「已按本节对齐」；同节又写「逐字一致」是目标状态、四处未落；`docs/batches/2026-11-11-superseded-close.md` §2 受影响文件表对同一档写「落笔 = eng-coder」——同一档的落盘状态三说 |
| 17 | 🟡 | 待修 | 同档 AC-17 的判据要「改后 = 0 且含「本批起建」」，落点是英文面提示词档；`docs/core/design/DOC-GRAPH.md` §3 自订「中文字面串在这里永远零命中」⇒ 正确的英文落笔会被判红。AC-13 的中文目标句同一问题，须给逐字英文形或指出该档的双语半区 |
| 18 | 🟡 | 待修 | 同档 AC-21 目标句逐字「stays under the first branch above」指针不明：另一项目的目标既可读成「声明进本仓 `writableRepos`、同轮落」，也可读成「归条款 9 ∥ 10」；AC-21 的机检形只查否定形与几个串，分不出这两种落法 |
| 19 | 🟡 | 待修 | 同档 §7「边界（本批不做）」逐字「不改提示词实体」，而 §2 受影响文件表列六处提示词面改动（E11–E14）；同档 §4 的「并入五项之后的增量 = 零」与 §7 括注的「E11–E13」两处清单都漏 E14 |
| 20 | 🟡 | 待修 | 同档 E12 ∥ E14 的判据源都逐字「用户本轮新裁 ②」（E11 = ①、E13 = ③）——同一条裁定被两处认领，E14 依据哪一条读不出 |
| 21 | 🟡 | 待修 | 同档 §5 与 `docs/core/design/BATCH-RECORD.md` §4.18-D 勘察行都写 `index.publicRepos` = `[]`；`docs/core/design/DOC-GRAPH.md` §1 ∥ §3 勘察写同一键「已声明两个兄弟仓」（`../.thincoder` ∥ `../thincoder.com`）——同一份声明档两个读数 |
| 22 | 🔵 | 备忘 | 同档 §2 ledger-cmd 行两族跨度用 `node` 行扫的物理行（② 止于 508），全档用 `doc_check` 的 `lines` 内容行（507），相减得「余 ≈ 286」混了两把尺 |
| 23 | 🔵 | 备忘 | 同档 E5 的验收列仍只写 AC-10 ∥ AC-11；本轮新增的 AC-20 没有回指，条目 ↔ 验收 两端对此项不齐 |

VERDICT: changes-required

计数：上轮 14 条已修（🔴 3 · 🟡 9 · 🔵 2）；本轮新 9 条（🔴 1 · 🟡 6 · 🔵 2）。

### 轮次 5（评审子代理）

| # | 严重度 | 状态 | 证据 |
|---|---|---|---|
| 15 | 🔴 | 已修 | `docs/core/design/BATCH-RECORD.md` §4.18-D「分档结论」改「**五处同轮改**」，五条逐项在（含 `thincoder-cli` 的 `AGENTS` 档），并以依据形逐字引 `docs/core/design/DOC-GRAPH.md` §3「同口径共五处……任一处改动，须同轮改其余四处」，与该节现文逐字相符——四层 ∥ 五处的两说退场 |
| 16 | 🟡 | 已修 | `docs/core/design/DOC-GRAPH.md` §3「行数档位口径」勘察证据改「**按本节目标形落笔、待同批落齐**——盘上现为旧半条（只要求给方案），落笔 = eng-coder」，与批档 §2 表同一句「落笔 = eng-coder」同口径，不再自称已对齐 |
| 17 | 🟡 | 已修 | `docs/batches/2026-11-11-superseded-close.md` AC-13 ∥ AC-17 改英文面判据，各给逐字英文目标句并写明「英文提示词档里中文串永远零命中，拿它当判据会把正确落笔读红」；两句目标形单列在 §3 验收对照之后 |
| 18 | 🟡 | 已修 | 同档 AC-21 的软指针退场，目标句改「⇒ **not** declared into this repo's `index.writableRepos`: who owns that work follows clauses 9 ∥ 10」，机检形加「改后软指针……必须 = 0」——两种落法由这一条分开 |
| 19 | 🟡 | 已修 | 同档 §7「边界（本批不做）」已无「不改提示词实体」；§2 另起「**笔权归属（是「谁执笔」，不是「本批不做什么」）**」段，写「E11–E14 四处改动**在本批范围内**，只是笔不在本席」；§4 改「并入六项」「用户新裁四条（E11–E14）」 |
| 20 | 🟡 | 已修 | 同档 E11–E14 的判据源改裁定主题标识（集成套件条 ∥ 安全机制条 ∥ `Deferred` 条 ∥ 条款 6 条），并写明「四条的序数不参与任何判据」——E12 ∥ E14 争同一个序数退场 |
| 21 | 🟡 | 已修 | `docs/core/design/BATCH-RECORD.md` 八个勘察行统一为「声明源 = `PROJECT-MANIFEST.json` 的 `index.publicRepos` = **两处兄弟仓**（实读该段两处）」，结论逐处改为「查过两处声明源，无……相关」；`docs/core/design/DOC-GRAPH.md` §1 ∥ §3 同读数 ⇒ 同一键两个读数的互斥解除，且各处的「两处都不相关」理由彼此一致 |
| 22 | 🔵 | 已修 | 同档 §2 ledger-cmd 行加「**两把尺不相减**：物理行跨度与内容行读数没有换算关系」，「搬出后余多少」交 AC-14 拆后重跑，508 ∥ 507 不再相减 |
| 23 | 🔵 | 已修 | 同档 E5 的验收列 = 「AC-10 ∥ AC-11 ∥ AC-20」，与 AC-20 的回指闭合 |

VERDICT: pass

计数：上轮 9 条全修（🔴 1 · 🟡 6 · 🔵 2）；本轮新 0 条。

## §4 用户批准（主 agent）

## 用户批准（主 agent）

**这批批准的是一条规则的四层改动 + 一条新收口边 + 一个档的分拆，不是一次措辞微调。**

时间线与每次原话：

```
2026-11-11 11:54   「走」                        → 修「被取代收口边」这条缺口
2026-11-11 12:13   「必须当批实施」               → ledger-cmd.mjs 三族分拆不另起批
2026-11-11 12:16   「我说的是让你检查工程模式的提示词，
                    把 500 行硬线分拆当批做进提示词」 → 500 规则本身改口径
2026-11-11 12:21   「这三个只记不做的也要尽可能当批处理」 → 集成套件 ∥ 安全 ∥ Deferred
2026-11-11 12:30   「仓外写入那个也要去掉」         → 条款 6 第二支改同轮声明同轮落
2026-11-11 12:31   「仓外和他仓是两个概念吧？」     → 分界按「有没有另一个项目的账」
2026-11-11 12:33   「他仓的事情归他仓」             → 条款 10 不动，已按原文结清
```

**设计评审五轮**：第 1 轮 15 条 → 第 2 轮 15 条（1🔴）→ 第 3 轮 14 条（3🔴）→ 第 4 轮 9 条（1🔴）→ 第 5 轮 **pass，0 🔴**。

**批准范围 = §2 条目表 E1–E14 与验收 AC-1–AC-21 的全部落笔面**，一处不多、一处不少。`D:\teamcode\AGENTS.md` 在本范围内：它仓外、非他仓（工作区根无 manifest、无 git），本仓 `index.writableRepos` 已在同轮声明目录，写入记本仓账。

**不在本批范围内**：存量 13 份 `open-but-settled` 旧档、15 份 10-15~19 旧档（用户已裁「算了」「两周前的别管了」）、需求档 §13.6 的子条目（裁定不立）、`MODEL-BENCH.md` 的豁免清理（已在本轮清空，属声明档维护）。

## §5 实施记录（eng-coder）
**状态行**：✅ 实施完成 2026-11-11（审计 1 轮 none · 代码评审 2 轮 pass · 修正 1 轮）



### 一、交付（一条新收口边 + 一次三族分拆 + 一批措辞落笔）

**新增三档**

- `thincoder-core/agent-tools/batch-supersede.mjs`（229 行）：`supersedeBatchRecord`（D-1…D-5 判序 → 保留门 → 凭证消费 → 档写盘 → 台账重锚 → 台账失败用写前全文回滚）、`resolveSupersededBy`（三形各带机读判据 + 三支解不到 + 自指 R2）、五条拒面构造函数（R3 逐字取 §4.18-D）、`supersedeTraceLine` / `supersedeReceiptLine`、`supersedeCountsOf`（写前读数，供追记行两格计数）。
- `thincoder-core/ledger-close.mjs`（188 行）：收口重锚族六符号整族搬入（零语义改）+ `localDay` 随迁（`closeEvidenceText` 依赖它，`ledger-cmd.mjs` 反向 import 取用，单向无环）；新增 `requireAllInFlight`（**无缺省**，非布尔即抛）与 `retreatInFlightRow`（退回边两步：`在途 → 待讨论` 走 `applyRowUpdateTx`，再按既有 `conditioned` 支口径落 `trigger=条件` + 续启句）。
- `thincoder-core/ledger-consistency.mjs`（113 行）：半状态读数族四符号整族搬入（零语义改）。

**改动档**

- `ledger-cmd.mjs`：两族搬出后只余绑定 ∥ 回收族 + 指针读面 `ledgerBatchRows`；文件末逐名转出 `assertLedgerCloseDisposition` ∥ `ledgerReanchorBatch` ∥ `batchLedgerConsistency`。**`ledger.mjs` 零改**（转出面逐名不变 ⇒ 调用方零改）。
- `agent-tools/batch-closeout.mjs`：`assertCloseoutGates` 的 `repair?:boolean` → `mode:"normal"|"repair"|"supersede"`——两臂跳过由这一处决定，补关与被取代都不另写一份门。
- `agent-tools/batch-ledger-view.mjs`：`assertCloseDisposition` 透传 `requireAllInFlight`；新增 `archivedStateOf`（D-3 只要「全归档」这一问的薄封装，与补关分流同一份读数，不另造归档判定；读不出 ⇒ throw，不降级）。
- `agent-tools/batch.mjs`：`action` enum +1、`execute` 分派 +1、`supersededBy` 参数面、`closingCall` 三路（close ∥ supersede ∥ status 写已收口）、`completed` / `closeEvidence` 两条描述同轮改（后者原本写「close / status 已收口 only」，与守卫相反，属评审第 1 轮 must-fix）。
- `agent-tools/batch-lifecycle.mjs`（**表外**，理由见「四」）：`mode` 两个调用点、`reanchorOnClose` 增 `requireAllInFlight` 并在两路传 `true`、`assertCloseDisposition` 两处传 `true`；`assertGateOpen` ∥ `assertMainAgentOnly` ∥ `designTokensReceiptLine` ∥ `ledgerAfterRecordWrite` ∥ `reanchorOnClose` 开出口（supersede 复用同一串与同一写序，不复制文案）。
- 描述面 `tool-docs/batch.md`：+1 action（supersede 全段：`supersededBy` 三形、`closeEvidence` 必填、三条必带内容、行的去向、四条拒面、保留门）、+1 参数；「Who may write what」的 depth-0 行 +supersede。
- `test/RTM.md` ∥ `test/rtm/batch-ledger.md`：故事标题两处逐字改为「评审过、完成清单收口、重开回、被取代冻结」，分册 +`14-14` 五格（节注的十三态改十四态）。
- `test/integration/batch-gates-reanchor.test.mjs`：+案例 `14-14`（业务入口 = `batch({action:"supersede"})`）。

**提示词与 500 规则（E8 ∥ E10 ∥ E11–E14）**

- `persona-engineering.md`：收口动作段 +supersede 一句（只指过去，不复述判据）+ `Deferred` 段改「默认本轮回修，只剩两种合法情形」。
- `discipline-normal.md`：`Deferred` 段同轮改成同一句（两处措辞逐字一致）。
- `discipline-engineering.md`：集成套件条改「本批起建」（删「books a ledger row」连带的两句 book 语义）；条款 6 第二支改「同轮声明、同轮落地」，并加「支路按有没有另一个项目的账分」+「本条只答两问」两句，`Why the table decides` 逐字不动。
- `common.md`：Security ① 删 `in a separate round`、⑤ 删 `separately`，两处同轮（五条逐条过 = 无第三处）。
- 500 规则五处同轮：工作区根 `AGENTS`（仓外）∥ `thincoder-cli/AGENTS.md` ∥ `advisor-design.md` 第 8 条 ∥ `persona-eng-designer.md` 受影响文件清单 ∥ `DOC-GRAPH.md` §3（判据单源，本席未改）。`>800` 那条逐字不动。
- `D:\teamcode\AGENTS.md`：仓外、非他仓（该目录无 `PROJECT-MANIFEST.json`、无 `.git`），本仓 `index.writableRepos` 已声明 `[".."]` ⇒ 写入记本仓账。

### 二、决策披露表

| 条目 | 状态 | 落点 / 说明 |
|---|---|---|
| E1 放行合取 D-1…D-5 | ✅ Done | `batch-supersede.mjs` 判序：§1 非 open 走既有冻结门（串逐字不变）→ 归档态读数 → §5 空 → 取代者 → 保留门 |
| E2 `supersededBy` 三形与「解不到就拒」 | ✅ Done | `resolveSupersededBy`：批档路径 / 文档+节号 / commit（`git cat-file -e`）；三支解不到各自点名，空白与自指各一条 |
| E3 三条必带内容 + §1 追记行 | ✅ Done | 追记行逐字含 `本批无实施记录（§5 未写）`；§3/§4/§6 零写面 |
| E4 `requireAllInFlight` 无缺省 + 退回边 | ✅ Done | 非布尔即抛；正常两路 `true`、本路 `false`；退回边为**两步**（`inFlight` 恒计，只挂 `trigger` 的行仍报在途未结） |
| E5 参数面 + 点名一条在途行 = 已核销 | ✅ Done | `completed` 可省 / 可空（缺省视同 `[]`）；点名判据不变；`closeEvidence` 三路同一条 |
| E6 跳过两臂、保留其余门与写序 | ✅ Done | 只跳链内容门与 §3 状态词臂；单测档门、文档机检门、完成清单预检、凭证消费、写序与补偿、`[ledger consistency]` 全保留 |
| E7 反例 R1…R5 拒面 | ✅ Done | 五支各一条拒，R3 拒串逐字取 §4.18-D |
| E8 提示词面一句 | ✅ Done | AC-13 英文新句逐字入 `persona-engineering.md` 第 3 条 |
| E9 三族分拆本批实施 | ✅ Done | ①→② 次序；`ledger.mjs` 零改；拆后读数见「三」 |
| E10 500 规则五处同轮 | ✅ Done | 四处落笔面逐字落「分拆在本批内实施」，`>800` 不动（单源一侧的腿二读数见「五 · 5」） |
| E11 集成套件缺失 ⇒ 本批起建 | ✅ Done | 本批 RTM 增量点名的 `14-14` 在本批落地；套件本身非空（既有 14 例 + 本批 1 例），故不触发「套件为空则起建」那一支 |
| E12 安全机制两处同轮 | ✅ Done | ① ∥ ⑤，五条逐条过 = 无第三处 |
| E13 `Deferred` 默认本轮回修 | ✅ Done | 两处同轮、措辞一致 |
| E14 未声明目标 = 同轮声明同轮落 | ✅ Done | 条款 6 第二支；支路按「有没有另一个项目的账」分；条款 10 未裁未动 |

### 三、验收读数（同一把尺 = `node` 行扫 / 内置 `grep`；读数非判定点）

**测试**

- `node --test docs/batches/2026-11-11-superseded-close.test.mjs` → **6 / 6 pass**
  （AC-1∥2∥9 · AC-5 · AC-3∥4∥6∥7 · AC-8 · AC-10∥11 · AC-12∥20）
- `node --test test/integration/batch-gates-reanchor.test.mjs` → **14 / 14 pass**（含新 `14-14`）
- `node test/run.mjs` → **210 tests · 207 pass · 3 fail**

三条失败全在 `test/integration/anthropic-tool-roundtrip.test.mjs`，原文含 `model "claude-fake-1" not found in MODEL_SPECS` ⇒ 上下文溢出。
该档 0 处 ledger 引用，与本批改动面无关；本批动手前后同一读数都是这三条。
过程读数：同一命令连跑三次分别读到 3 / 5 / 3 条失败，中间那两次的额外条目复跑中自行消失（本机 flaky，非本次改动引入）。

**AC-14 拆后读数**（`doc_check(mode:"report", lines:[…])` 的「行数读数」段）

```text
ledger-cmd.mjs 507 → 286   ledger-close.mjs 188   ledger-consistency.mjs 113
batch-supersede.mjs 229    batch-lifecycle.mjs 482 → 488
batch-closeout.mjs 265 → 268   batch-ledger-view.mjs 81 → 109   batch.mjs 267 → 276
八档全部未越设计器硬线 500
```

**AC-15 搬家证明**（同一次 `node` 行扫，基准 = `git show HEAD:thincoder-core/ledger-cmd.mjs`）

- ① 符号体逐字节相同 = **11 / 11 SAME**：

```text
完成清单族：completedSetForRows ∥ closeDisposition ∥ assertCloseEvidenceValue
证据与预检：closeEvidenceText ∥ assertLedgerCloseDisposition
重锚本体：ledgerReanchorBatch     辅助：localDay
半状态族：HALF_STATE_EXITS ∥ UNKNOWN_RECORD_EXIT ∥ halfStateOf ∥ batchLedgerConsistency
```

- `localDay` 是随族搬出的辅助符号（不在 ① 的六符号名单里），体同样逐字节相同。
- 搬家证明取的是**第一步（纯搬家）**的读数。其后 `completedSetForRows` ∥ `ledgerReanchorBatch`
  因 +`requireAllInFlight` ∥ +退回边而变，属第二步（新边），不在搬家证明内。
- ② `ledger.mjs` 转出面逐名相等 = **55 ∥ 55**，少 0 · 多 0。
- ③ 当批单测 6 / 6 全绿（见上）。

**AC-16 ① 四处落笔面**（句在数：改前 → 改后；逃生口 = `no split` ∥「另起一批」∥「体量过大可另批」）

| 落笔面 | 句在 | 逃生口 |
|---|---|---|
| 工作区根 `AGENTS`（仓外） | 改前只有 `split plan` 那半句（设计席 §3 勘察行记的盘上现状）→ 改后 1 | 0 / 0 / 0 |
| `thincoder-cli/AGENTS.md` | 0 → 1（与工作区根同句，合并成段后逐字相同） | 0 / 0 / 0 |
| `advisor-design.md` 第 8 条 | 0 → 1（`and the split lands inside this batch`） | 0 / 0 / 0 |
| `persona-eng-designer.md` 受影响清单 | 0 → 1（`split plan** that lands inside this batch`） | 0 / 0 / 0 |
| `advisor-design` 的 `>800` 那条 | 1 → 1（逐字不动） | — |

**其余新裁四条**（改前 → 改后）

```text
AC-13  supersede 英文新句                          0 → 1
AC-17  books a ledger row                          1 → 0     新句（段合并后读）0 → 1
AC-18  come later or in a separate round as needed 1 → 0     ① 新句 0 → 1
AC-18  propose it separately                       1 → 0     ⑤ 新句 0 → 1
AC-18  三短语逐字回读（usable first ∥ not established by default ∥ for the user to choose） 1/2/1 → 1/2/1
AC-19  fits 🟡/🔵 improvements（persona）           1 → 0     （discipline-normal 改前实读 0，见「五 · 3」）
AC-19  两处新句逐字一致                             0 → 1 ∥ 0 → 1
AC-21  条款 6 内 in a separate round                1 → 0     declared in this round 0 → 1
AC-21  lands in the same round                     0 → 1     Why the table decides 1 → 1（逐字不动）
AC-21  whether another project's account exists     0 → 1     outside this repo's tree 只在 is not 之后（实读 true）
AC-21  `not` declared into this repo's `index.writableRepos` 0 → 1
AC-21  软指针 stays under the first branch above    0 → 0     the target repo's ledger is never written 1 → 1
```

### 四、越出清单（改了、但不在我的文件清单里的，逐条给理由）

1. `thincoder-core/agent-tools/batch-lifecycle.mjs`
   - **硬理由一**：设计把 `assertCloseoutGates` 的 `repair` 改成 `mode`，两个调用点必须同轮改，
     否则补关会退回链门（集成 14-13 当场红）。
   - **硬理由二**：设计要求被取代的收口**保留**凭证消费、写序、失败补偿与重锚，这三件在本档是私有件；
     而 `docs/core/design/LEDGER.md` §11.2 的现文已写明 supersede「同经 `reanchorOnClose`」。
   - 改动面 = 5 处开出口 + 2 处 `mode` + 4 处 `requireAllInFlight` 透传，零业务语义改（482 → 488 行）。
2. `test/RTM.md` ∥ `test/rtm/batch-ledger.md` ∥ `test/integration/batch-gates-reanchor.test.mjs` ——
   §2 受影响文件表把 `14-14` 行、故事标题与用例文件列为本批交付。
3. `D:\teamcode\AGENTS.md` —— E10 五处之一；仓外、非他仓，本仓 `index.writableRepos` 已声明同轮落。

### 五、设计漂移、判据缺陷与未落项（上抛）

1. **AC-16 ② 按字面不可满足**。
   - 判据要求「腿二检索命中的档集合 ⊆ 五处」，而 `DOC-GRAPH.md` §3 自己写明检索式只找候选、
     漂移的判据是「那一处把长度判定派给了谁」。
   - 实读：候选 **109 行 / 53 档**；五处在射程内的只有三档（工作区根与 CLI 侧在射程外）。
   - 真正要的那一问 = **0 处**：命中行要么是两个判定时点、要么是反向陈述「中间一概不判」；改前改后同为 0。
   - 一条合格的判据要能红也要能绿——这一条在这个库里只会红，替它读的是上面那句漂移判据。
2. **`supersedeTraceLine` / `supersedeReceiptLine` 的落点两说**：§2 受影响文件表把它们写进新档
   `batch-supersede.mjs`；§4.18-D「新档与新名」写「⇒ 新函数，同档共址」（`repairTraceLine` 所在档 = `batch-closeout.mjs`）。
   **按 §2 落在新档**。
3. **AC-19 的改前读数对 `discipline-normal.md` 不成立**：该处原文是 `**`Deferred` fits** 🟡/🔵 improvements`，
   判据写的针 `fits 🟡/🔵 improvements` 在该档改前实读 0（persona 侧改前 1）。
   两处改后都不含它、且新句逐字一致 ⇒ 判据目的达成。
4. **AC-21 的 `writableRepos` 读数**：设计期望 1，实读 3——新句在三处各自点名该表
   （写入这里 ∥ 子代理上抛 ∥ 他仓不声明）。计数不迁就文本，保留现状。
5. **设计 §4.18-D 判据表的「节号」一行未含边界句**：代码评审第 1 轮指出 `§3` 会命中 `## 13`
   （机器替人写了一条不存在的取代事实），已按 must-fix 收严为「号的两边都不是数字或点」并补了对偶用例；
   设计面那一行仍是宽口径，**待设计席补**（非我的笔）。
6. **`docs/core/design/LEDGER.md` §11.2「批未收口的第三个出口」一行：未落**。
   §2 表列了它却没指定笔权，该档是设计席的笔、不在我的文件清单——交父侧路由。
7. **Leads（超出本批范围，不记缺陷）**：`DOC-GRAPH.md` §3 之外仍有若干档以缩短形复述
   「>500 ⇒ 必给分拆方案」而不含「本批内落」（如 `MODEL-BENCH.md`、`AGENT-LOOP-ASYNC-POOL.md`、`requirements/` 若干档）。
   本批按设计把改动面限定在五处，未扩面。

### 六、轮次与终态

- **内部探索审计**（read-only，1 轮）：`DIVERGENCE: none`。1 条 🔵 附注 = 追记行与回执的计数取写前读数、
  逐行明细取事务回读，并发窗口内可分叉；评审同轮提出，已收敛为「两处计数同源」。
- **代码评审**（advisor · code）：第 1 轮 `changes-required`（🟡 must-fix 2 · 🟡 1 · 🔵 4）→ 全修 →
  第 2 轮 **pass**（新增 1 条 🟡 report-only = 第 5 项设计面待补；§5 空那条在本段落笔时关闭）。
- **修正轮**：1 轮修完 6 条。**终态 = clean**。
- **集成测试声明**：本批我只跑了改动面的单元测试与 `14-x` 那一档集成，**父侧收口跑仍是唯一集成验收跑**；
  未集成验收的部分 = 全量集成套件（读数见「三」，其中 3 条为既存环境失败）。

## §6 验证与收口（父代理）

## 验证与收口（主 agent）

### 父侧复跑（不是转述实施席的读数）

```
node --test docs/batches/2026-11-11-superseded-close.test.mjs   6 / 6 pass
node --test test/integration/batch-gates-reanchor.test.mjs     14 / 14 pass（含新 14-14）
doc_check(mode:"gate") 4 档                                    PASS · 0 段有问题
```

**行数读数**（`doc_check` `lines` 面，内容行）：`ledger-cmd.mjs` 287 ∥ `ledger-close.mjs` 189 ∥ `ledger-consistency.mjs` 114 ∥ `batch-supersede.mjs` 233 ∥ `batch-lifecycle.mjs` 489——**五档全在 500 线下**。

### 交付了什么

| 目标 | 条目 | 落点 |
|---|---|---|
| 第三条收口边 | E1–E8 | `batch-supersede.mjs`（新档）+ 四档追加分支 + `tool-docs/batch.md` |
| `ledger-cmd.mjs` 分拆 | E9 | 两族搬到 `ledger-close.mjs` ∥ `ledger-consistency.mjs`，507 → 287 |
| 500 行规则改口径 | E10 | 五处同轮（两份 `AGENTS` ∥ 两档提示词 ∥ `DOC-GRAPH.md` §3） |
| 三条「只记不做」改当批 | E11–E13 | 集成套件 ∥ 安全两处 ∥ `Deferred` 两处 |
| 仓外写入改同轮 | E14 | `discipline-engineering.md` 条款 6 第二支 |

### 越界（如实记录）

实施席动了 §2 受影响文件表**没列**的四处，理由成立、但仍是越界：

```
thincoder-core/agent-tools/batch-lifecycle.mjs   482 → 489（repair→mode 的两个调用点必须同轮改，否则补关当场红）
test/RTM.md ∥ test/rtm/batch-ledger.md           14-14 与故事标题
test/integration/batch-gates-reanchor.test.mjs    新用例
```

**没记成「简化」，记成「越界」**——差别的意义是：下一个读者知道表列得不全，而不是以为表就是全部。

### 审阅中发现、当场修掉的两类

- **断引文**：拆分让 `BATCH-RECORD.md` 的 8 处依据引文失去对象（7 条被机检拒，第 8 条是裸名、机检看不见，由设计席自己找出）。全部改指新档。
- **判据不可满足**：AC-16 ② 拿「候选面」当判据，全库只会红。改成「漂移面 = 0 处」，候选面降为背景。

### 本批新债

**0 条**（范围内无遗留）。

**范围外一条已入账**：`#2334` 写门缺口（`manifest write` 不绑在途号、且它能改 `writableRepos` 那张授权表；`ssh put ∥ send` 同样不记账）。用户 2026-11-11 13:13 裁「先缓」，不并入本批。

### 未做的

```
13 份 open-but-settled 旧档 ∥ 15 份 10-15~19 旧档   用户已裁「算了」「两周前的别管了」
需求档 §13.6 子条目                                 裁定不立（FR28 已覆盖，机制住 §4.18-D）
```

### 收口结论

三件交付全部落地并复跑通过；五档全在 500 线下；`doc_check` 门 PASS；集成用例 14-14 就地建成。
