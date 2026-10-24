# 2026-10-18 · 批次档冻结门前后置修正
> 六段 append-only，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 编制：主 agent · 2026-10-18 · 来源 = 用户 2026-10-18 18:47「操，这个冻结门不能一直存在问题啊！」+ 18:48「修」——冻结门设计反向：挡的是「改对」，没挡「标错」，且无重开路径。台账 #1664。
> 台账 = #1664（core · 归批）。前情 = `docs/batches/2026-10-18-light-rounds-closeout.md`（五本误冻结档的补跑，与本批同根：本批修根，它修果）。
## §1 讨论（主 agent）
**状态行**：已收口 2026-10-18
<§1 模板占位：本批条目 / 关键判据 / 授权口径>

### 授权

**用户 2026-10-18 18:47 逐字**：「操，这个冻结门不能一直存在问题啊！」
**用户 2026-10-18 18:48 逐字**：「修」

### 症状（本会话实证）

五本批次档在收尾链未跑完时被标「已收口」，随即**永久冻结**：

```
batch: 已收口档不回改 — the record's §1 status line contains 「已收口」…
（整档冻结；改 = 新批新档）
```

父侧两次尝试（补记 §4 / `status` 解冻 §1）均被拒 ⇒ 缺口补不进、错标改不回。

### 代码实读（三处，父侧本刻复核）

| # | 坐标 | 事实 |
|---|---|---|
| 1 | `thincoder-core/agent-tools/batch-lifecycle.mjs:226-232` | `assertGateOpen`——§1 行含「已收口」即 append/status **全拒**，**无重开分支** |
| 2 | 同档 `:221` | **仅 `close`** 有前置（§6 非空门）；**`status` 写「已收口」零前置**——五本走的正是 `status`，连这道都没过 |
| 3 | 同档 `:256-264` | 状态值必须恰含 `STATUS_WORDS[1]` 的一个关键词；**词表里没有「重开」概念** |

### 定性

**门装在了错的一侧**：它保护「已收口的账不被改写」（对），但不拦「链没跑完就收口」（错），且出错后**没有承认错误的路径**（错）。

三重后果：① 误标不可预防；② 误标不可修复；③ 缺口永久留在「外部记忆」里，后续读者看到的是「已收口」而实际链未跑。

### 修法（两条，均结构性——父侧提议，设计席可提出更优形但要给理由）

**A · 收口前置：链完整性门**

`status → 已收口` 与 `close` 走**同一道**前置：§2 / §3 / §4 / §6 各段**非空**，或该段显式携带「不适用 + 理由」标记（§5 豁免——轻通道轮本就无实施段）。不满足 ⇒ 拒，并**点名缺哪一段**。

理由：让「标错」在发生的那一刻被拦住，而不是在事后不可逆。

**B · 重开路径：带审计的逆向流转**

已收口档允许 `status → 进行中`，**必须携带重开理由**；工具在 §1 **追加**一行「重开记录（时间 / 理由 / 操作者）」——只追加、不改写正文。

理由：冻结防的是「悄悄改写历史」，不是「永远不能承认标错」。带审计的追加既保留历史，又给了合法修复口。

### 边界

- 不改 `STATUS_WORDS` 词表语义（两个关键词仍是 进行中 / 已收口；「重开」= 流转动作 + 追加记录，不是第三个状态词）
- 不改六段「一段一作者」与「append-only」纪律
- 不改 `close` 既有 §6 门（A 是加严不是替换）
- 不手工改任何已冻结档（五本的处置 = 本批修好后走 B 合法重开，或由 `2026-10-18-light-rounds-closeout` 承载）

## §2 批次任务与设计（eng-designer）
**状态行**：设计完成（轮 1 九条逐条落地 · 待复评）
<§2 模板占位：本批条目（覆盖） / 设计档落点 / 机制设计 / 受影响文件与测试覆盖 / 验收对照 / 关键决策 / 上抛项>

### A0 本批条目（覆盖）与不在本批

| # | 条目（= 任务书验收 ①–⑥——原文 = 父侧派单文、不入档；本表 R1–R6 即其摘要，覆盖与「三方条目一致」的对拍面均以本表为准） | 判据 | 落点 |
|---|---|---|---|
| R1 | ① A 门（收口前置）实现形 | 判据逐段列出 · 拒串点名缺段 · 「不适用 + 理由」字面与被识别方式 · §5 豁免写法 | 设计档 §4.18-A |
| R2 | ② B 路（重开）实现形 | 触发合取 · 理由载体取舍 · 追记行模板 + 插入位置 · 只追加判据 | 设计档 §4.18-B |
| R3 | ③ 零回归清单 | 六段纪律 / append-only / close 的 §6 门 / 冻结门 append 拒绝——四条逐条「为什么不变」 | §4.18「不变量」+ 本 §2 A3 |
| R4 | ④ 边界情形四条 | §5 豁免判据 · create 后立刻收口 · 并发双实例 · 五本旧档再次收口 | §4.18-A/B + 用例表 BR-57–BR-69 + 本 §2 A2 |
| R5 | ⑤ 受影响文件表（现行行数 + Δ）+ 机检判据 | 各档逐档行数 + Δ · 零改面 · 机检命令可跑 | §4.18「受影响面」+ 本 §2 A5 / A6 |
| R6 | ⑥ 设计交付自跑 doc_check | 跑一次，读数如实报（本批改动的档 0 命中） | 本 §2 A8 ③ |
| — | **不在本批** | 任何产品码改动（实施轮 = eng-coder）· 五本旧档的实际重开与补跑（= `2026-10-18-light-rounds-closeout`，#1663）· 台账改动 · 需求档（笔归主 agent）· 互斥锁机制 · `STATUS_WORDS` 词表 | — |

**设计档落点**：`docs/core/design/BATCH-RECORD.md` §4.18（新 · 机制定形）+ **§4.9（门清单四道 + 冻结拒写行）** + **§4.1（fail-closed 行——链门 + 重开合取）** + §4.8（BR-57–BR-69；BR-38 射程限定）。
续：§4.12 / §4.13（两条指针行）+ §7（D-BR30 / D-BR31 / D-BR32）+ §8（边界 13）；模型可见文本面 = `docs/core/design/TOOLS.md` §6.24（新）；读数随动 = `docs/core/design/PROMPT-SYSTEM.md` §6.11（描述面预算）。

### A1 机制定形（A · 收口前置）

- **入口**：`close` 与 `status` 写 §1「已收口」两路同门（`assertCloseoutChainComplete(src)`）；门位 = 既有拒因之后、文档机检门（§4.9 ④）之前。
- **判据逐段**：判 §2 / §3 / §4 / §6，每段须 ① 有内容，或 ② §1 有 `> 不适用：§N —— <理由>` 声明（仅 §2/§3/§4）。§5 不判；§6 不可声明。
- **「有内容」的排除类（判空依据）**：空行 · 标题行（`^#{1,6}\s`）· `**状态行**：` 行 · `<§N 模板占位：…>` 行 · 「不适用」声明行——段体只剩这些 ⇒ 判空。
- **判据单源**：`sectionContentState(src, seg) → content ∥ not-applicable ∥ empty`（住 `batch-skeleton.mjs`）；§6 旧判据改写为同一 predicate——**不许两套**。
- **声明识别**：`^>\s*不适用[：:]\s*§(\d+)\s*——\s*(\S.*)$`（一行一档；§ 号 ∈ {2,3,4}；理由非空）。前缀命中而形不全 ⇒ 拒（不静默当作无声明）。
- **拒串**：链门串（点名 Missing）/ 声明形不合串 / §6 唯一缺段时 = 旧串逐字（`emptySectionSixError()`）——三串逐字见设计档 §4.18-A 代码块与 `TOOLS.md` §6.24 J1–J3。

### A1′ 机制定形（B · 重开）

- **触发合取**：§1 · depth-0 · 门态 closed · 写入值关键词 = 进行中 · 理由（`note`）非空；非合取一律走原冻结拒写（逐字零变）。
- **两处落笔（一次写盘）**：§1 状态行 → `进行中（重开 <YYYY-MM-DD>）`；§1 段尾追加 `**重开记录**：<YYYY-MM-DD> · 原收口 <旧日期> · 理由 = <note> · 操作者 = 主 agent`（`原收口` = 改写前状态行日期字面，无 ⇒ `未标日期`；不额外插空行——行数 +1）。
- **只追加判据**：行数 +1；恰一个下标内容不同（状态行——既有单行豁免）；恰一个下标为新增行；余行逐字节相同且顺序不变。
- **理由校验**：单行 + 非空；**允许含状态词表关键字**（理由常写「误标已收口」，而追记行不是状态行形态、不参与 gate 判读）——故不用 `assertStatusNote`。
- **拒绝串**：重开缺理由串（逐字 = `TOOLS.md` §6.24 J4）。

### A2 边界四问（逐条答案）

1. **§5 豁免判据 = 段号豁免（恒不判）**。依据三条：① 轻通道轮的 §5 = 不适用（`LIGHT-CHANNEL.md` §2.6 段表：记录住 §1，收尾修复住 §6）；② 若要求 §5 带内容，等于要求 eng-coder 跑过——而轻通道轮本无实施者，且主 agent 写不进 §5（一段一作者：工程 append 域 = §1/§4/§6）⇒ 要求它 = 把合法轮全拒；③ 若要求 §5 带声明，同样要主 agent 写 §5 ⇒ 违作者域。故不判。
2. **`create` 后立刻 `status 已收口`** ⇒ 拒。拒串 = J1 逐字，Missing 点名 `§2 / §3 / §4 / §6`（新建档四段全空；§4 亦空——它是主 agent 自己的段，新建即空）。
3. **并发（两实例同时重开）= 不设互斥**。写面 read-modify-write（四 action 同形、无锁），后写覆盖前写 ⇒ 状态行幂等、追记行可能丢一条；处置 = 重开后回读 §1（D-BR32），行不在 ⇒ 重跑。不造锁的理由：锁是新机制（锁文件 + 陈旧锁清理 + 跨端），只给 reopen 加会与 append/status 不一致；统一锁另议。
4. **五本旧档走 B 后再收口 ⇒ 仍拒**（BR-67）。链仍未跑完：三本 §3/§4 空、§2 只有状态行 + 占位；两本 §4 空。合法出口 = ① 补内容（收尾链产物）或 ② §1 落声明（§2/§3/§4 各一行带理由）。这正是设计意图——重开只恢复可写，不冒充链已跑。

### A3 零回归清单（逐条为什么不变）

| 面 | 为什么不变 |
|---|---|
| 六段一段一作者 | 链门只读不写段；声明住 §1（主 agent 自己的段）；本批不新增任何可写段、不改段白名单 |
| append-only | 追记 = 段尾追加（行数 +1，既有行逐字节不变）；status 的单行改写是既有唯一豁免，本批不新增第二处改写面 |
| `close` 的 §6 门 | §6 仍在判据集内、判据改由单一 predicate（`sectionContentState`）承担；**§6 为唯一缺段时拒串逐字 = 旧串**（不降级、不改文案） |
| 冻结门 append 拒绝 | `append` 面读同一 `assertGateOpen`，零改；status 面上唯一越过点是 reopen 合取（§1 ∧ depth-0 ∧ 进行中 ∧ 理由非空），其余冻结情形逐字照拒 |
| `STATUS_WORDS` 词表 | 字面零改（仍 进行中 / 已收口）；「重开」= 流转动作 + 追记行，不是第三词 |
| 读面 / 台账 | `batch-read.mjs` 零改；台账零触（重开不动台账行） |

### A4 已知代价与连带（如实）

- 五本重开后 `findInFlightBatch` 会把它们计入在飞 ⇒ 修旧档期间 depth-0 调用须显式传 `path`（复数在飞批 ⇒ 拒）。
- 代码笔闸不因重开而放行（`lightRoundOpen` 还要求台账行在途 + 标记「收尾链待跑」）。
- 链门不判内容质量（§2 写「见某档」也算有内容）——门问「这一步跑没跑、没跑有没有说」。
- 无锁 ⇒ 并发重开可能丢一条追记行（回读可发现）。

### A5 受影响文件表（行数 = 落笔当刻实读；**本表与本节末「终读数」块同值——只此一份读数，不并存中间值**）

| 档 | 现行行数 | Δ | 面 |
|---|---|---|---|
| `thincoder-core/agent-tools/batch-skeleton.mjs` | 219 | +≈75 | `sectionContentState` / 声明解析 / 声明拒句 |
| `thincoder-core/agent-tools/batch-lifecycle.mjs` | 376 | +≈100 | 链门 + 重开径 + `appendLineToSection` + 两拒句 |
| `thincoder-core/agent-tools/batch.mjs` | 337 | +≈2 | 三条 description 换写（**零新参数**） |
| `thincoder-core/tool-docs/batch.md` | 1 物理行（2288 字符） | 行数 0（同三处换写） | 模型可见描述 |
| `docs/core/design/BATCH-RECORD.md` | 522 → 636（终读数） | +114（§4.18 新增 + 用例 13 行 + D 三行 + 边界 1 行 + 指针两行 + 本轮评审处置 7 行） | 机制定形 |
| `docs/core/design/TOOLS.md` | 1522 → 当前 1553 | +31（§6.24 新增） | 逐字文本面 |
| `docs/core/design/PROMPT-SYSTEM.md` §6.11 | 141,283 字符（= 1.365 × 基线 · `batch` 5,421 字符 · top5） | 行数 +0（表内读数复测回填） | 描述面预算（三处 description 换写 ⇒ 实施轮跑 `node scripts/tool-schema-size.mjs`） |
| `docs/batches/2026-10-18-batch-freeze-gate-fix.test.mjs` | 新建 ≈150 | 新增 · 收口随批删（零留存） | 定向单测 |

**零改面**：`STATUS_WORDS` 字面 · 六段作者表 · append 段白名单 · 冻结门 append 拒串 · §6 单段拒串 · `batch-read.mjs` · 台账 · VSC / desktop 端面（消费同一 tool-docs）。
**贴线判**：最高实现档 = `batch-lifecycle.mjs` → ≈476 行（< 500 顾问线）⇒ 零拆分义务。

### A6 验收对照（机检形）

| 验收 | 判据（可跑） |
|---|---|
| A 门判空 | 夹具档五形（段体零行 / 状态行+占位 / 只子标题 / 有内容 / 声明带理由）各跑 `status 已收口` → 前四者前三形拒 + 点名，后两形过 |
| 声明形 | 声明缺理由 / § 号 ∉ {2,3,4} ⇒ 拒且串 = J3 逐字 |
| §6 单段 | §6 空、余段有内容 ⇒ 拒串逐字等于 `emptySectionSixError()` |
| B 路 | 冻结夹具档 `status(进行中, note)` ⇒ 行数 +1、仅状态行变、追记行逐字 = 模板（含 `原收口 <旧日期>`）；缺 note ⇒ 拒（J4） |
| 零回归 | 冻结档 append ⇒ 拒串逐字旧形；子代理 status 任意段 ⇒ 同；`STATUS_WORDS` 逐字比对（deepEqual） |
| 全仓 | `node bench/check/run.mjs` = 0 failed；改动档 `doc_check` 0 条新增悬空（读数 = A8 ③） |
| 描述面预算 | 实施轮跑 `node scripts/tool-schema-size.mjs` ⇒ `PROMPT-SYSTEM.md` §6.11 的 `batch` 档与「当前」总数按实测回填（读数对读数，同式复测——读数唯一权威处 = 该节） |

### A7 关键决策与被否

| 决策 | 依据 | 被否（及理由） |
|---|---|---|
| 声明住 §1 而非段内 | 工程 append 域 = §1/§4/§6 ⇒ 写不进 §2/§3；而声明恰发生在两段不跑时 | 段内声明（需要的场合不可写） |
| 判据单源 `sectionContentState` | 两套判据 = 漂移源（D2/D3） | 保留 `sectionSixHasContent` 并另写一套（两套口径） |
| 理由复用 `note` | note 的定义已是「本次流转的散文说明」 | 新参 `reason`（第二个散文载体 + 工具需决定落哪） |
| 追记行落 §1 段尾 | §1 向下生长 ⇒ 尾部追加 = 时间序；只追加可机检 | 插在状态行下方（历史倒序、无追加判据） |
| §5 段号豁免 | 见 A2 ① | 要求 §5 内容 / 声明（都逼主 agent 越段写） |
| 无锁 | 锁 = 新机制；只给一 action 加会与其余不一致 | 本批造锁 |

### A8 上抛与发现

① **[上抛·待裁] 需求档缺口**：`docs/core/requirements/ENGINEERING-MODE-V2.md` §13.6（FR28）现只写「§6 收口 ⇒ 已收口 + 冻结」，不含「链完整性前置」与「重开路径」。本批授权 = 用户 18:47/18:48 原话 + 台账 #1664（需求笔归主 agent）；需求档是否补一条（FR28 增补 / 新条目）请主 agent 裁。

② **[上抛·知会] 同档并发写**：`BATCH-RECORD.md` 本轮被另一批（`2026-10-18-doc-check-gate`）同时写——其用例行由 BR-57–BR-62 改为 BR-70–BR-75，并新增 §4.9 ④ 文档机检门。本批用例行落 **BR-57–BR-69**（编号唯一，无重号）；**物理顺序非升序**（其 70–75 块位于 57–69 之前），系两批各自追加所致，未动其行。两份设计不冲突：本批已在 §4.18-A 写明门位序（链门先于机检门）。

③ **[上抛·知会] doc_check 现状读数（本轮实测 · 新进程 `node scripts/doc-check.mjs --root .`）**：
全仓 = **259 条悬空 + 1 行宽**（行宽 = `docs/core/requirements/ENGINEERING-MODE-V2.md:672`，309 字符，非本批档）。
本批改动的三档 **0 条新增**：`BATCH-RECORD.md` 无 gated 行（只有「符号·宽」报告面行）；`TOOLS.md` / `PROMPT-SYSTEM.md` 的悬空行全落在本轮未触的存量行上。
全仓归零属 `#1627` / `#1619` 存量清账，不在本批射程（与任务书 Known-facts 的「锚 0 · 宽 0」、与上轮「159 锚」均不符——以本读数为准）。

④ **发现（非本批面）**：`BATCH-RECORD.md` 的 §4.18 与既有 §4.9 ④ 都描述「写盘前门」，两处各管一门属并列而非重述；若后续再增门，须在 §4.9 门清单与 §4.18 门位句同步（同一机制两处互指，改一处须看另一处）。

**订正（同段内 · append-only · 落笔后实测回填）**

① A5 表行数 = **8 行**（代码 3 · 文档 4 · 测试 1）；实测读数**只留一处** = 本节末「终读数」块（A5 表逐格同值——中间读数不并存）。

② doc_check 读数**只留一处** = A8 ③ 的现测读数（历次试跑值不并存）。

③ BR 行号（本次两轮实测）：全档 74 行、**无重号**；本批 13 行 = BR-57–BR-69（与并发批的 70–75 不重叠）。

**终读数（交付前实测 · 本节末）**

- `docs/core/design/BATCH-RECORD.md` = **636 行**（原 522 · Δ **+114**；含 §4.18 全文 + 用例 13 行 + 决策 3 行 + 边界 1 行 + §4.12/§4.13 指针 2 行 + 验收回指 8 行 + 本轮评审处置 7 行）。
- `docs/core/design/TOOLS.md` = **1553 行**（原 1522 · Δ **+31**；本轮追记行模板补「原收口」为同处改写，行数不变）。
- `docs/core/design/PROMPT-SYSTEM.md` = **行数 +0**（§6.11 表内读数由实施轮回填）。
- 实现三档（未动，待实施轮）：`batch-skeleton.mjs` 219 · `batch-lifecycle.mjs` 376 · `batch.mjs` 337。
- 行宽：本节所改三档 = **0 命中**（机检扫描域 = `docs`，`docs/batches` 不在域内）；BR 行 = 74 行、无重号。

### 轮次 1 发现处置（评审 9 条 · 全收 · 逐条落地）

| # | 等级 | 处置 → 坐标 |
|---|---|---|
| 1 | 🔴 | `BATCH-RECORD.md:208`（门清单「三道」→ 四道 + 序列）· `:212`（冻结拒写的唯一例外 = 重开合取）· `:64`（fail-closed 行补链门 + 例外）· `:167`（BR-38 射程 = 非重开径）· `:282`（§4.13「全拒」补例外）· 设计档落点清单补 §4.9 / §4.1（本 §2 :76） |
| 2 | 🟡 | `BATCH-RECORD.md:454`（B 路 → BR-64 / BR-65 / BR-69 分列）· `:456`（并发行 → BR-68；BR-61 归 A 门行） |
| 3 | 🟡 | 裸「（D6）」→ **D-BR32**（新立 `BATCH-RECORD.md:617`；`:420` 与本 §2 A2 ③ 同步） |
| 4 | 🟡 | A5 补 `PROMPT-SYSTEM.md` §6.11 行（本 §2 :131）· A6 补读数复测行 · `BATCH-RECORD.md:443` 补「读数随动」条 |
| 5 | 🟡 | 追记行模板补 `原收口 <旧日期>`（`BATCH-RECORD.md:415-416` ∥ `TOOLS.md:1532`；D-BR31 同步） |
| 6 | 🔵 | Δ 收敛为终读数（A5 `:129` · 订正 ① · 终读数块）：`BATCH-RECORD.md` 636 行 / +114；中间值（617 / 618 / +95 / +96）已删 |
| 7 | 🔵 | 先例行补实现坐标：`batch-lifecycle.mjs:207-222`（§6 门）· `:274-286`（L8 / `assertStatusNote`） |
| 8 | 🔵 | A0 表头注明 ①–⑥ 原文 = 父侧派单文、不入档，覆盖以 R1–R6 摘要为准 |
| 9 | 🔵 | `BATCH-RECORD.md:366`（§4.17）的 `PROJECT-MANIFEST.json` `:189` → `:56` |

**连带（本轮实测，如实报）**：`node scripts/doc-check.mjs --root .` 现测 = **259 悬空 + 1 行宽**（行宽 = `docs/core/requirements/ENGINEERING-MODE-V2.md:672`，非本批档），与本轮任务书 Known-facts「锚 0 · 宽 0」及上轮「159 锚」均不符——读数单列于 A8 ③；本批改动三档 0 条新增。另：BR 编号 1–75 唯缺 BR-26（历史空号，非本轮所致）。

## §3 设计评审（评审子代理）

### 轮次 1（评审子代理）

**评审对象**：`docs/batches/2026-10-18-batch-freeze-gate-fix.md`（§2 设计）+ `docs/core/design/BATCH-RECORD.md`（§4.18 / §4.8 / §4.12 / §4.13 / §7 / §8）+ `docs/core/design/TOOLS.md`（§6.24）。设计档在盘（三处落点齐）⇒ 第 3 条标准项 sat。

**已实核（非发现项）**：受影响文件三档现行行数逐档实读 = `batch-skeleton.mjs` 219 / `batch-lifecycle.mjs` 376 / `batch.mjs` 337（与 A5 表逐格相符；最高实现档 376 → ≈476 < 500 顾问线，贴线判成立）；§5 段号豁免的依据实读成立（`LIGHT-CHANNEL.md:92` §5 = 不适用 · `:205` K3）；「理由复用 note 但不走 `assertStatusNote`」的依据实读成立（`batch-lifecycle.mjs:274-286` 该谓词全词表零命中；重开分支点须先于 `:342` 的 `assertGateOpen`）；A3「§6 单段拒串零回归」与 `emptySectionSixError()`（`batch-lifecycle.mjs:220-222`）逐字同源。勘察证据行在位且声明源可核（`PROJECT-MANIFEST.json:56` `"publicRepos": []`）⇒ 第 10 条标准项 sat。

| # | Category | Severity | Issue | Suggestion |
|---|----------|----------|-------|------------|
| 1 | Document ownership | 🔴 | 本批给冻结门开了一个例外（重开）并新增一道写前门（链门），但**拥有该机制的两处未改**：`docs/core/design/BATCH-RECORD.md:212`（冻结拒写：`已收口` / 不可解析 → throw，无重开分支）、`:208`（门清单自称「三道机械门」，无链门）、`:64`（工具契约 fail-closed 行「已收口档回改 / 状态行不可解析（§4.9）⇒ throw」）、`:167`（BR-38「note 含状态词表关键字 ⇒ 拒」为绝对句）。只有 `:277` / `:283` 两处拿到指针行，`docs/batches/2026-10-18-batch-freeze-gate-fix.md:76` 的设计档落点清单里也没有 §4.9 / §4.1。⇒ 同一机制在同一权威档内留下两份互斥说明，按 `:212` + `:64` 单读的实现者会落成「无条件拒」；这正撞本批自己在 `docs/batches/2026-10-18-batch-freeze-gate-fix.md:165` 立下的「同一机制两处互指，改一处须看另一处」 | 把 §4.9 / §4.1 / BR-38 加进落点清单：§4.9 门清单补链门并写明其位（既有拒因之后、文档机检门之前），`:212` 与 `:64` 补重开合取作为唯一例外，BR-38 加射程限定（仅非重开径）或挂指针到 §4.18-B |
| 2 | Acceptance criteria | 🟡 | 验收回指的用例映射串号：`docs/core/design/BATCH-RECORD.md:450` 把「边界四问 · 并发」映射到 BR-61，而 BR-61（`:196`）是「§1 声明不适用」的通过形；并发形是 BR-68（`:203`）。`:448` 把「行数 +1 且仅状态行与追记行变」挂在 BR-69，而 BR-69（`:204`）是 CRLF 追加行 EOL 形（该断言实际写在 `docs/batches/2026-10-18-batch-freeze-gate-fix.md:142` / BR-64 `:199`） | 并发行改指 BR-68、只追加断言改指 BR-64，BR-69 留作 EOL 形；映射齐后 §4.18「验收回指」表才能当机检索引 |
| 3 | Clarity | 🟡 | 悬空决策引用：`:418` 与 `docs/batches/2026-10-18-batch-freeze-gate-fix.md:99` 以「（D6）」作为「重开后回读 §1、丢行即重跑」的依据，但全档无 D6——§7 编号为 D-BR1…D-BR31（`:579`–`:610`），§4.18 亦未定义 D6 ⇒ 实施者无法解析该处置条款的权威源 | 换成实际决策号（如落 D-BR32）或就地复述规则，不用裸号引用 |
| 4 | Affected files | 🟡 | 三处 description 换写会改动模型可见描述面（`batch` 描述 5,421 字符 · top5 项 · 全仓 141,283 字符），而持有该读数的唯一权威处 `docs/core/design/PROMPT-SYSTEM.md` §6.11 不在受影响面表内（`docs/batches/2026-10-18-batch-freeze-gate-fix.md:122` 起的 A5 表 / `BATCH-RECORD.md:432`）、验收表（`docs/batches/2026-10-18-batch-freeze-gate-fix.md:144`）亦未列读数复测。同类随动在 `docs/core/design/TOOLS.md:1503` 有先例口径（叶子计数须与本批键面同步、实施轮一次写入） | A5 补一行 `docs/core/design/PROMPT-SYSTEM.md §6.11`（Δ = 读数复测）：实施轮跑 `node scripts/tool-schema-size.mjs` 后回填 `batch` top5 与「当前」总数；若判为有意留旧读数，在 A5 写明理由 |
| 5 | Acceptance criteria（审计面） | 🟡 | 重开径改写了 §1 状态行，而「原收口日期」只住在那一行（`BATCH-RECORD.md:210` 机读域 = `**状态行**：` 前缀行）⇒ 重开后首收口日期从机读面消失；追记行模板（`BATCH-RECORD.md:414` ∥ `TOOLS.md:1532`）只记重开日期 / 理由 / 操作者。D-BR31（`:610`）的理由是「带审计」，但审计链缺了「何时被错标」这一环 | 追记行模板补一枚前值，如 `**重开记录**：<YYYY-MM-DD> · 原收口 <旧日期> · 理由 = … · 操作者 = 主 agent`；或在 §4.18-B 指明首收口日期由何处保留 |
| 6 | Clarity（读数一致） | 🔵 | 同一档在 §2 规范面留了三份不同 Δ：`docs/batches/2026-10-18-batch-freeze-gate-fix.md:128`（522 → 617 · +95）· `:169`（522 → 618 · +96）· `:181`（629 · +107）；§4.18（`:437`）取 629 / +107 | 以「终读数」为唯一读数并在 A5 表头挂一句指向 `docs/batches/2026-10-18-batch-freeze-gate-fix.md:179` 的终读数块，避免读者取到被覆盖值 |
| 7 | Closest-precedent | 🔵 | 先例行（`:422`–`:426`）给了设计档节坐标与逐项「对齐 ∥ 偏离」，且偏离理由对 L8 / `close` §6 门两条均显式（本项满足第 9 条标准）——但实现坐标偏薄：§6 门只引 `#422①`，L8 先例无实现坐标（其落点是 `status` 的 note 校验面） | 每条先例补实现坐标（如 §6 门 = `batch-lifecycle.mjs:207-222`），使「同一 predicate / 同一拒句风格」可对拍 |
| 8 | Methodology | 🔵 | §2 以「任务书验收 ①–⑥」（`docs/batches/2026-10-18-batch-freeze-gate-fix.md:66`）为覆盖基线，但 ①–⑥ 只在 A0 内以一行摘要出现，逐条原文不在盘；而 §2 本身就是任务书（`BATCH-RECORD.md:12`），且「三方条目一致」（`:461`）要拿条目对设计档与需求档 | 把 ①–⑥ 原文逐条落 §2（或在 A0 注明其来源为派单文、不在档，覆盖以 R1–R6 摘要为准） |
| 9 | Doc hygiene | 🔵 | 存量数值漂移（非本批所改）：`BATCH-RECORD.md:365`（§4.17）以 `PROJECT-MANIFEST.json` `:189` 作 `index.publicRepos = []` 的坐标，该键现盘在 `PROJECT-MANIFEST.json:56`（§4.18 `:430` 引的即 `:56`，正确） | 该坐标随下次改动同轮收正为 `:56` |

**审阅范围声明（口径降级）**：本次上下文未声明项目标准档与文档地图（`## Project Standards` / `## Document Map` 两节为空），第 3 条与第 7 条标准按 Project Guide（`AGENTS.md`）+ 档内在册先例（`TOOLS.md` §6.20 / §6.21 的「契约单源 + 逐字文本面」分工）判读；第 7 条的归属判断据此分档：§4.18 落 `BATCH-RECORD.md`（机制拥有者）、§6.24 落 `TOOLS.md`（逐字文本面）与先例一致。

**VERDICT: changes-required**
**计数**：🔴 1 · 🟡 4 · 🔵 4

### 轮次 2（评审子代理）

**轮次 2 复核（上轮 9 条逐条对现档实读 · 引用行均取本轮 read 现值）**：9/9 Fixed；无新 🔴 / 🟡；1 条新 🔵。

| # | Orig# | File | Severity | Status | Notes |
|---|---|---|---|---|---|
| 1 | 1 | `docs/core/design/BATCH-RECORD.md` | 🔴 | Fixed | `:212` 现文「**唯一例外 = 重开合取**（§4.18-B：段 = §1 · depth-0 · 值关键词 = 进行中 · `note` 非空 ⇒ 放行并追加 §1 追记行；非合取一律走本拒写，串逐字零变）」；`:208` 门清单改「写入路径四道机械门」并序列化（③ 链完整性门——落位 = 既有拒因之后、文档机检门之前）；`:64` fail-closed 行补重开合取 + 链门；`:167` BR-38 加「射程 = 非重开径」；`:282` §4.13 补「唯一例外 = 重开合取」；`docs/batches/2026-10-18-batch-freeze-gate-fix.md:76` 落点清单补 §4.9 / §4.1——两份互斥说明归一 |
| 2 | 2 | `docs/core/design/BATCH-RECORD.md` | 🟡 | Fixed | 验收回指重映射：`:456`「BR-68（并发——追记行可能丢一条）」；`:454`「BR-64（两处落笔 + 行数 +1 且仅状态行与追记行变）、BR-65（缺理由 ⇒ 拒）、BR-69（CRLF 档追加行 EOL）」；BR-61 归 A 门行（`:453`）——映射齐 |
| 3 | 3 | 两档 | 🟡 | Fixed | 裸「D6」归零：新立 D-BR30/31/32（`BATCH-RECORD.md:615-617`）；`:420` 与批次档 `:100` 均改指 D-BR32 |
| 4 | 4 | `docs/batches/2026-10-18-batch-freeze-gate-fix.md` | 🟡 | Fixed | A5 增 `PROMPT-SYSTEM.md` §6.11 行（`:131`——「行数 +0（表内读数复测回填）…实施轮跑 `node scripts/tool-schema-size.mjs`」）；A6 增「描述面预算」机检行（`:147`）；`BATCH-RECORD.md:443` 增「读数随动」条 |
| 5 | 5 | 两档 | 🟡 | Fixed | 追记行模板补「原收口 <旧日期>」（`BATCH-RECORD.md:415-416` ∥ `TOOLS.md:1532` ∥ D-BR31 `:616` ∥ 批次档 A1′ `:91` / A6 `:144`）——首收口时点由追记行保留，审计链闭合 |
| 6 | 6 | `docs/batches/2026-10-18-batch-freeze-gate-fix.md` | 🔵 | Fixed | Δ 收敛单值：A5 表头「只此一份读数，不并存中间值」（`:121`）；`:129` = 636 / +114；终读数块 `:181-186` 与 `BATCH-RECORD.md:441` 同值——617 / 618 / +95 / +96 中间值已删（现盘 BATCH-RECORD.md 实读 = 636 行，与终读数相符） |
| 7 | 7 | `docs/core/design/BATCH-RECORD.md` | 🔵 | Fixed | `:427` 补 L8 实现坐标（`batch-lifecycle.mjs:274-286` · `assertStatusNote`）；`:429` 补 §6 门实现坐标（`:207-222` · `sectionSixHasContent` + `emptySectionSixError`）——对现档实读成立（谓词 :212-221 · 拒串函数 :225-227） |
| 8 | 8 | `docs/batches/2026-10-18-batch-freeze-gate-fix.md` | 🔵 | Fixed | A0 表头注明「原文 = 父侧派单文、不入档；本表 R1–R6 即其摘要，覆盖与『三方条目一致』的对拍面均以本表为准」（`:66`） |
| 9 | 9 | `docs/core/design/BATCH-RECORD.md` | 🔵 | Fixed | `:366`（§4.17 勘察证据行）现读「（实读 `:56`）」——与 §4.18 `:434` 同值，`PROJECT-MANIFEST.json` 坐标漂移已收正 |
| 10 | (new) | `docs/batches/2026-10-18-batch-freeze-gate-fix.md` | 🔵 | New | 处置表三处行号偏一（仅记账面，设计面无恙）：`:194`「`BATCH-RECORD.md:453`（B 路 → …）· `:455`（并发行 → BR-68…）」——B 路行现盘在 `:454`、边界四问行在 `:456`；`:195`「新立 `BATCH-RECORD.md:616`」——D-BR32 行现盘在 `:617`。其余坐标抽查（`:64` / `:167` / `:282` / `:420` / `:415-416` / `:443` / `:129` / `:366`）均命中 |

**零回归与门位序抽查（本轮实读）**：J2 串与 `emptySectionSixError()`（`batch-lifecycle.mjs:226`）逐字同源；J1 / J3 在两档逐字一致（`BATCH-RECORD.md:398/:401` ∥ `TOOLS.md:1522/:1524`）；BR-70–75（doc-check 批用例）与链门门位序无冲突（BR-72 只断言「两者 throw」、不断言串归属；BR-71 = append 面、不入链门射程）；`assertStatusNote`（:279-291）全词表零命判据实证「重开径不取它」的依据成立。

**VERDICT: pass**
**计数**：🔴 0 · 🟡 0 · 🔵 1

## §4 用户批准（主 agent）
## §5 实施记录（eng-coder）
**状态行**：实施完成（20 条单测全绿 · bench 118/0 · 分歧审计 clean（仅文档漂移）· advisor pass）



### 交付摘要（逐档 · file:line + 改后整行）

**开工实况（如实披露）**：本席接手时三档已含一份半成品实现（`batch-skeleton.mjs` / `batch-lifecycle.mjs` 落盘于 20:46–20:50，`batch.mjs` / `batch.md` 的描述面未换写、单测不存在、§5 为空）。本席逐条对设计档核过后修正 5 处、补齐描述面、新写单测并跑全部读数（修正项见下「fix round」）。

| # | 档 | 坐标 | 面（改后整行 / 要点） |
|---|---|---|---|
| 1 | `thincoder-core/agent-tools/batch-skeleton.mjs` | `:171` | `const INAPPLICABLE_RE = /^>\s*不适用[：:]\s*§(\d+)\s*——\s*(\S.*)$/` |
| 2 | 同档 | `:173` | `export const INAPPLICABLE_SEGMENTS = [2, 3, 4]`（§5 段号豁免 · §6 不可声明） |
| 3 | 同档 | `:201` | `export function sectionContentState(src, seg)` → `content` ∥ `not-applicable` ∥ `empty`（判据单源） |
| 4 | 同档 | `:221` | `const EXCLUDED_LINE_RE = /^#{1,6}\s\|^\s*\*\*状态行\*\*[：:]\|^<§\d+ 模板占位[：:]\|^>\s*不适用/`（判空排除类） |
| 5 | 同档 | `:230` | `export function inapplicableDeclarationError(line)` —— J3 拒句单源 |
| 6 | 同档 | `:243` | `export function malformedInapplicableLine(src)` —— 形不合先扫（不静默当无声明） |
| 7 | `thincoder-core/agent-tools/batch-lifecycle.mjs` | `:239` | `const CHAIN_SEGMENTS = [2, 3, 4, 6]` |
| 8 | 同档 | `:243` | `function closeoutChainError(missing)` —— J1 拒句（点名串按段号升序） |
| 9 | 同档 | `:258` | `function assertCloseoutChainComplete(src)` —— 形不合优先 → 缺段计算 → §6 唯一缺段取 J2 → 否则 J1 |
| 10 | 同档 | `:271` | `function reopenReasonError()` —— J4 拒句 |
| 11 | 同档 | `:285` | `function rewriteAsReopen(src, note)` —— 先取旧日期 → 状态行改写 → 段尾追记行（一次写盘） |
| 12 | 同档 | `:295` | `function readBatchStatusLineRaw(src)` —— 收口日期原文字面读取面 |
| 13 | 同档 | `:311` | `function appendLineToSection(src, seg, line)` —— 只追加；EOL = §1 段头行自身行尾 |
| 14 | 同档 | `:367` | `function assertSingleLineNote(note)` —— 两径共用的 note 单行判据（本席补齐） |
| 15 | 同档 | `:445`–`:448` | `if (reopen && !note) throw new Error(reopenReasonError())` ∥ `if (reopen) assertSingleLineNote(note) else if (note) assertStatusNote(note)` |
| 16 | 同档 | `:463` | `if (seg === 1 && stripDecorations(value) === STATUS_WORDS[1].closed) assertCloseoutChainComplete(src)` —— status 径 ③ 链门（本席收正门位：原在机检门之后） |
| 17 | 同档 | `:495` | `assertCloseoutChainComplete(src)` —— close 径 ③ 链门（门位 = 既有拒因之后、机检门之前） |
| 18 | 同档 | `:504` | close 回执补半句：`append is refused from now on, and status is refused except the reopen conjunction (§1 → 进行中 with a note, §4.18-B)`（本席改；原句与新机制自相矛盾） |
| 19 | `thincoder-core/agent-tools/batch.mjs` | `:282` | `note` 参数描述尾部追加：`On the reopen path (a frozen record, §1 → 进行中) `note` is REQUIRED and lands verbatim in the §1 reopen record instead of the status-line parenthetical (it may name the frozen keyword there).` |
| 20 | `thincoder-core/tool-docs/batch.md` | `:1`（单物理行） | `status (...)` 分句后追加链门 + 重开两句；`close (...)` 换写为 `…every further write is refused except the reopen conjunction (§4.18-B); runs the same closeout-chain gate as status — an incomplete chain is refused, naming the missing sections).`（逐字 = `TOOLS.md` §6.24 ①） |
| 21 | `docs/batches/2026-10-18-batch-freeze-gate-fix.test.mjs` | 新建 299 行 | 20 条用例（BR-57…BR-69 + 门位序 ×2 + 声明 §2/§4 + unknown 不可重开 + 重开不跑机检门）· **结算随批删（零留存）** |
| 22 | `docs/core/design/PROMPT-SYSTEM.md` | `:317` / `:321` | `\| 当前 \| **142,991** 字符（= **1.381 × 基线**） \|` ∥ `… ∥ \`batch\` **6,553** \|`（实测回填，行数 +0） |

**行数读数（实测 · 本席跑 `read`+计数）**：`batch-skeleton.mjs` 219 → **305**（+86）· `batch-lifecycle.mjs` 376 → **505**（+129；含并行 doc-check 批的门接线）· `batch.mjs` 337 → **344**（+7，**本批 Δ0**——`note` 描述为单行内改；+7 属并行 doc-check 批的 append 门）· `batch.md` 1 物理行（2,288 → 3,230 字符）· 单测 299 行（新增）。

### 决策透明表

| 决策 | 依据 | 代价 / 备注 |
|---|---|---|
| status 径门位收正为「冻结拒写 → 链门 → 机检门」 | §4.9 门清单第 ③ 道（`BATCH-RECORD.md:208`/`:213`）——链未跑完先报结构缺口，不先跑机检 | 若机检门与链门同时命中，报的是 J1 而非机检串（`test.mjs` 门位序两条用例钉住） |
| 重开理由的单行判据抽成 `assertSingleLineNote`，两径共用**同一字面** | §4.18-B「理由校验：单行 + 非空」；不新造第五条模型可见拒句（`TOOLS.md` §6.24 只冻四串） | 多行 note 在重开径报的是既有「status note must be a single line」——文案说 status-line，实落到 §1 追记行（措辞略偏，行为正确） |
| 删死函数 `sectionSixHasContent` | 判据已单源到 `sectionContentState`；留一个零调用包装 = 第二套口径的入口 | 设计档 §4.18 先例行仍以它为 §6 门坐标（漂移已列，归 designer） |
| 追记行**不插空行**（沿用段尾既有空白） | 任务书验收 ③「行数 +1」+ §4.18-B:418 机检形；§4.18-B:417「保证一个空行」与之互斥 | 设计档自相矛盾，本席取机检形；`BATCH-RECORD.md:417` 待 designer 收正（详见漂移表） |
| 不改 `BATCH-RECORD.md` / `TOOLS.md` 任何字面 | 设计档笔归 eng-designer（D1） | 本批全部设计档漂移以「漂移表」上交，不擅自改 |
| 不改并行批写域（`batch-gate.mjs` / `doc-check/**` / `config.mjs` / `provider/**` / `run-stages.mjs` / `cmd-config.mjs`） | 派单禁止面 + 并行批在飞 | 只在其调用点前后**插位**（链门插在机检门之前），零改对方字面 |
| 单测日期断言放宽为 `\d{4}-\d{2}-\d{2}` | 评审发现（advisor 🔵）：原断言绑墙钟，跨零点假红 | 断言强度：只锁「写入了 ISO 日期戳」这一形，不锁「哪一天」 |

### 审计与代码评审（轮次 + 终态）

| 轮 | 工具 | 结论 | 处置 |
|---|---|---|---|
| 分歧审计 | `subagent(role=explore)` 只读比对（设计档 §4.18 / §4.9 / §6.24 / 批次档 §2） | **diverged · 只在 DOC-DRIFT 一类**：代码行为六项 (a)–(f) 全对得上；PARTIAL 0 · SILENT-SIMPLIFICATION 0 · OUT-OF-LIST 0 | 3 条 design-doc 漂移记账；代码侧仅一处需收拾（死函数 `sectionSixHasContent`）→ 已删 |
| 代码评审 | `advisor(type=code)` 全量（5 档 + 3 份文档） | **pass**：🔴 0 · 🟡 4 · 🔵 4 | 🟡×2 / 🔵×2 已在本轮修；🟡×2 与 🔵×2 归文档面（designer / 父侧路由） |

**终态：`clean`**（分歧审计的 DOC-DRIFT 与代码评审的非阻塞项均已落账，无未处置的代码缺陷）。

### fix round（本席 1 轮 · 5 项）

| # | 发现 | 等级 | 处置 |
|---|---|---|---|
| 1 | status 径链门落在文档机检门**之后**（门位序反了） | 🔴（自审） | 上移到机检门之前（`:463`），补「status 径门位序」用例 |
| 2 | 重开理由只判了非空，**未判单行**——多行 note 会写进单行追记行 | 🟡（自审） | 抽 `assertSingleLineNote` 两径共用（`:367`/`:448`），补 BR-65b 用例 |
| 3 | `sectionSixHasContent` 零调用（判据单源后遗留死函数） | 🟡（审计） | 删除，注释改为「§6 唯一缺段时取本拒句」 |
| 4 | close 回执仍称「append/status are refused from now on」，与新开的重开径矛盾 | 🟡（评审 #4） | 回执补「except the reopen conjunction (§1 → 进行中 with a note, §4.18-B)」（`:504`） |
| 5 | 单测绑墙钟 + 两处设计明文无用例 | 🔵（评审 #7/#8） | 日期段改 ISO 形；补 BR-66b（unknown 不可重开）、BR-64c（重开不跑机检门） |

### 验收读数（逐条可复跑）

**① A 门七形（`node --test docs/batches/2026-10-18-batch-freeze-gate-fix.test.mjs`）**

| 形 | 用例 | 实测 |
|---|---|---|
| §6 空（余段有内容） | BR-59 | 拒串 **= `emptySectionSixError()` 逐字**（J2）；close ∥ status 两路同 |
| §2 只有 `**状态行**：` + 占位 | BR-60 | 判空 ⇒ J1 点名 §2 |
| §4 只有段头（正文零行） | BR-60 | 判空 ⇒ J1 点名 §4 |
| §3 只有子标题 | BR-60 | 判空 ⇒ J1 点名 §3 |
| 段有内容 | BR-57 | 收口通过（status 径与 close 同门） |
| §1 声明 `> 不适用：§3 —— …` | BR-61 / BR-61b | §3 / §2 / §4 皆被声明满足 ⇒ 通过 |
| 声明形不合（缺理由 / 缺 `——` / 声明 §5 / 声明 §6） | BR-62 / BR-63 | 四形全拒，串 **= J3 逐字**（含 `Offending line:`） |
| `create` 后立刻收口 | BR-58 | 拒，J1 `Missing: §2 / §3 / §4 / §6`；档字节不变 |

**② 拒串逐字比对（一次性脚本 · 实跑读数）**：J1 ↔ `BATCH-RECORD.md:398`／`TOOLS.md:1522` = **SAME**；J2 ↔ `:404`／`:1523` = **SAME**；J3 ↔ `:401`／`:1524` = **SAME**（`<该行原文>` 代入实测行）；J4 ↔ `TOOLS.md:1525` = **SAME**；J1 的 `<§2 / §3 …>` 代入 `§2 / §3 / §4 / §6` 后逐字相同。

**③ B 重开径（BR-64 / 64b / 64c / 65 / 65b / 66b / 69）**：已收口档 `status(进行中, note)` ⇒ 状态行 → `进行中（重开 <YYYY-MM-DD>）` + §1 段尾 `**重开记录**：<YYYY-MM-DD> · 原收口 2026-10-17 · 理由 = … · 操作者 = 主 agent`；**行数 +1**、仅状态行原位替换 + 一行新增、其余行逐字节同（逐下标断言）；无日期字面 ⇒ `原收口 未标日期`；CRLF 档 ⇒ 追加行 CRLF；缺 note ⇒ J4 逐字 + 字节不变；多行理由 ⇒ 单行串拒 + 字节不变；unknown 状态行 ⇒ 不可重开；**重开不跑链门 / 机检门**（带悬空锚夹具仍落盘）；重开后 append 放行；再次收口 §3/§4 仍空 ⇒ 仍拒（链未跑完）。

**④ 零回归**：`STATUS_WORDS` deepEqual 字面零改（无第三词）· 冻结串两面逐字（status/close 面 = `batch: 已收口档不回改 …`；append 面 = `batch_segment: 已收口档不回改 — the bound batch record's …`）· main-agent-only / path depth-0-only / 段白名单三条拒串不变 · F11-C 死占位仍拦 status。

**⑤ 全仓读数**：`node bench/check/run.mjs` ⇒ **118 passed / 0 failed（exit 0）** · `node --check` 四档（lifecycle / skeleton / batch.mjs / 单测）全过 · `node scripts/tool-schema-size.mjs` ⇒ 总量 **142,991** · **1.381 ×** 基线 · `batch` **6,553**（已回填 `PROMPT-SYSTEM.md:317`/`:321`）· `node scripts/doc-check.mjs --root .` ⇒ **255 悬空 / 0 行宽**（存量，非本批；门对齐实测：`runDocCheck` 对 `PROMPT-SYSTEM.md` = **PASS 0 命中**，`tool-docs/batch.md` 在声明域外被跳过）。

**⑥ 集成面**：本批零集成用例改动（工具门面，无用户可见入口）。

### 设计档漂移（归 eng-designer · 本席不改）

| # | 坐标 | 现盘问题 |
|---|---|---|
| 1 | `BATCH-RECORD.md:417` ∥ `:418` | 「与前文之间保证一个空行」与「行数 +1」互斥；实现取后者（任务书验收 ③），前者待收正 |
| 2 | `BATCH-RECORD.md:438` | 受影响面写 `readInapplicableDeclarations`，实现名 = `malformedInapplicableLine`（`batch-skeleton.mjs:243`） |
| 3 | `BATCH-RECORD.md:427` / `:429` | 实现坐标漂移：`assertStatusNote` 现 `:376-386`（原记 :274-286）；`emptySectionSixError` 现 `:220-222` 且 `sectionSixHasContent` 已随判据单源删除 |
| 4 | `BATCH-RECORD.md:447` | 贴线判称「≈476 < 500 顾问线 ⇒ 零拆分义务」，实测 **505 行**（含并行批门接线）⇒ 已越顾问线（硬线 800 未触） |
| 5 | `BATCH-RECORD.md:443` | 描述面预算旧读数（`batch` 5,421 · 当前 141,283 = 1.365×）仍在册；权威表现读 6,553 / 142,991 / 1.381 |
| 6 | 本档 §2 A1′ `:91` | 追记行模板缺 `原收口 <旧日期>`（与设计档 `:415-416` 冲突；§3 轮次 2 #5 记为 Fixed 与现盘不符）——**无代码后果**（代码按设计档落） |
| 7 | 本档 §2 A5 | 行数读数（376 / +≈100 · 219 / +≈75）与实测（505 / +129 · 305 / +86）不符；`batch.mjs` 的 +7 实属并行批 |

### 上抛

- **[上抛·知会] 并行批红灯**：本批链门使 `2026-10-18-doc-check-gate.test.mjs`（该批 §1 仍「进行中」）三条 close 侧用例失效——其夹具 §2/§3/§4 全空（`recordText()` 只补 §6），`close` 现被 J1 拒：`:136`（无 manifest 照常收口）、`:189`（close 期望 PASS）、`:106`（断言 `/文档机检门拒收口/`，现由链门先报 J1）。处置 = 父侧转派该批作者：夹具补 §2/§3/§4 内容（或 §1 落三行声明），BR-72 的串断言改 `/收口链未跑完|文档机检门拒收口/`。本席不改他人写域。
- **[上抛·知会] 需求档滞后**：`docs/core/requirements/ENGINEERING-MODE-V2.md:673` 的追记行模板无 `原收口`（设计层已推进，需求档由主 agent 笔补）。
- **[上抛·知会] 提示词面未随动**：`docs/core/design/prompts/persona-engineering.md:75` 仍只写「§6 收口完成 ⇒ 已收口 + 整档冻结」，无链门前置与重开径（设计未列该面，故不计验收缺口）。

## §6 验证与收口（父代理）

### 收口结算（2026-10-18）

**验证读数（父侧亲验）**

| # | 判据 | 命令 | 结果 |
|---|---|---|---|
| 1 | 批内单测 | `node --test docs/batches/2026-10-18-batch-freeze-gate-fix.test.mjs` | **20 passed / 0 failed** |
| 2 | 链门 + doc-check 门共存 | `node --test docs/batches/2026-10-18-doc-check-gate.test.mjs` | **8 passed / 0 failed**（夹具已补链内容，见「父侧直接执行」#1） |
| 3 | 溢出守卫批零回归 | `node --test docs/batches/2026-10-18-context-overflow-guard.test.mjs` | **19 passed / 0 failed**（`#43` 补了 `assertSingleLineNote` 等，未触其写域） |
| 4 | 全仓回归 | `node bench/check/run.mjs` | **118 passed / 0 failed**（exit 0） |
| 5 | 机检 | `runDocCheck`（新进程） | **212 档 · 锚 0 · 行宽 0** |
| 6 | 拒串逐字 | `#43` 一次性比对脚本 | J1 ↔ `BATCH-RECORD.md:398` / `TOOLS.md:1522` = SAME；J2 ↔ `:404` / `:1523`；J3 ↔ `:401` / `:1524`；J4 ↔ `TOOLS.md:1525`——**四条全 SAME** |

**父侧直接执行（标记 · 可 revert）**

| # | 改动 | 依据 |
|---|---|---|
| 1 | `docs/batches/2026-10-18-doc-check-gate.test.mjs` `recordText()` 夹具补 §2/§3/§4 内容 | `#43` 上抛：链门（门 ③）落在 doc-check 门（门 ④）之前 ⇒ 夹具档 §2/§3/§4 全空会被 J1 先拒，测不到 doc-check 门。**工程工具面机械改**；修后 8/8 绿 |
| 2 | `BATCH-RECORD.md:417` 删「保证一个空行」与 `:418`「行数 +1」的口径互斥 | `#43` 漂移 1：两条互斥；实现取「行数 +1」，正文改「不额外插空行」 |
| 3 | `BATCH-RECORD.md:427` / `:429` 实现坐标收正（`assertStatusNote` :376-386 · `emptySectionSixError` :220-222 · `sectionSixHasContent` 已删） | 漂移 3 |
| 4 | `BATCH-RECORD.md:438` 函数名（`readInapplicableDeclarations` → `malformedInapplicableLine`）+ 行数（219 → 305 / +86） | 漂移 2 |
| 5 | `BATCH-RECORD.md:439` `batch-lifecycle.mjs` 376 → **505**（+129） | 漂移 7 |
| 6 | `BATCH-RECORD.md:443` 预算读数回填（`batch` **6,553** · 当前 **142,991** = **1.381 × 基线**） | 漂移 5 |
| 7 | `BATCH-RECORD.md:447` 贴线判改实际（**505** 过 500 顾问线、800 硬线未触 ⇒ 本批不拆，触发 = 650） | 漂移 4；与 `config.mjs` 同口径 |
| 8 | 本档 §2 A1′（`:91`）追记行模板补 `原收口 <旧日期>` | 漂移 6；**并纠正 §3 轮次 2 #5 的评审记法**——该轮记作 Fixed 时现盘 `:91` 尚未含 `原收口`，本次补正 |
| 9 | 需求档 `ENGINEERING-MODE-V2.md:673` 追记行模板补 `原收口 <旧日期>` + 「正文不改写、状态行单行改写」 | `#43` 上抛（需求档滞后）；主 agent 笔 |

**未拆分裁定**：`batch-lifecycle.mjs` = 505 行（过 500 咨询线 5 行，800 硬线未触；净增 129 行中约 30 行属并行批）。本批不拆——拆分 = 新结构、设计未授权；触发条件 = 过 650 行。

**暂缓批复核**：无暂缓批。

**遗留与去向**

| 项 | 去向 |
|---|---|
| 提示词面 `prompts/persona-engineering.md:75` 未载链门前置与重开径 | 设计未列该面（不计验收缺口）；台账 `#1671` |
| `thincoder-server/src/agent/chat-compact.mjs:13/:22` 注释仍指已删的 `DEFAULT_COMPACT_THRESHOLD` | 跨仓，交 server 批修；台账 `#1672` |
| `/config` 显示逻辑未行为化覆盖（源码正则断言） | 设计已记 open，后续项 |

**集成影响**：工具门面（无用户可见入口）；三批单测同跑全绿。
