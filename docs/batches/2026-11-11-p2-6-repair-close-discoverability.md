# 2026-11-11 · p2-6-repair-close-discoverability
> 六段，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 每段只有一个作者：作者的段可 `append` 加内容、可就地改（`edit`）；非作者一概拒。
> 编制：主 agent · 2026-11-11 · 来源 = 用户 2026-11-11 02:15 提问「现在这些台账补关逻辑，模型清楚吗？知道怎么用吗？」——查工具描述面发现两处缺口，02:17「补吧」。。
> 台账 = #2319（core · 归批）。前情 = 无（独立批）。
## §1 讨论（主 agent）
**状态行**：🔄 进行中（…）
批起 sha = f3c69ca7d406450b7c184fcae82371d447f45942
<§1 模板占位：本批条目 / 关键判据 / 授权口径>

**本批条目（一条）**：`thincoder-core/tool-docs/batch.md` 的补关条目补一句「先跑 `check` 判自己属不属于补关」——使模型无需读拒文摸索就能入径。

**关键判据**：模型可见面不带跨档指针（`thincoder-core/prompts/common.md` 的 `Prompt face — no normative document references`：工具描述在射程内，处置 = 删引用、非改址）⇒ 那句只能写「本档内能直接照做的话」，不指别的档。

**授权口径**：用户 2026-11-11 02:15「现在这些台账补关逻辑，模型清楚吗？知道怎么用吗？」+ 02:17「补吧」。同日 02:24 评审 Ⓐ① 判定为该指针不可入面，故本批收缩为「只做入径那一句」。

**评审裁下的两处不做**：
- `notices` 四值不搬进本档——该字段只出 `ledger` 回执，`batch close` 从不产生它；同四值已在 `thincoder-core/tool-docs/ledger.md` 的 `close` 条目在档，搬过来就是第二处陈述。
- 判定序不提——三支互斥、任何输入只得一条 `notice`，序不可观测。

## §2 批次任务与设计（eng-designer）
**状态行**：设计完成（两处描述面改写：close 入口句（入口收窄到 §1 状态行 open 一格）∥ check 括注（同轮收窄）；机制与代码零改）
### 一 · 本批条目（覆盖）

| # | 条目 | 判定面 |
|---|---|---|
| E1 | 补关入径可发现：只读 `close` 动作段的读者，能读出「§1 状态行读 `进行中` ⇒ 先跑 `check`」与「合格读形 = 唯一 `open-but-settled`，出路句写直接收口」；行集前提不在此重述（它就在同条目首句） | `thincoder-core/tool-docs/batch.md` 的 `close` 动作 · 补关条目（入口句） |
| E2 | 边界：只动 `thincoder-core/tool-docs/batch.md` 一档（档内两处：`close` 入口句 ∥ `check` 括注）；不碰机制本体、不碰代码、不新造概念 / 字段 / 判据，不写跨档指针 | 全批 |
| E3 | 描述面预算：机检的超单档名单不新增档名 | `node scripts/tool-schema-size.mjs` 的机检行 |
| E4 | 反面同一入口：只读 `check` 动作段的读者，读到的补关入口与 E1 同一格 —— `open-but-settled` 只在 §1 状态行读 `进行中` 时称补关入口；读不出 §1 那一形只作读数，不称入口 | `thincoder-core/tool-docs/batch.md` 的 `check` 动作 · `open-but-settled` 括注 |

### 二 · 设计档落点

本批的设计面就是本段 —— 机制零改，故设计档零改。`docs/core/design/BATCH-RECORD.md` §4.18-C 仍是补关的机制单源：条件、判据、拒面、门序一字不动。

依据 docs/core/design/BATCH-RECORD.md「**两个收口入口同门**：`close`（§4.13）与 `status` 写 §1「已收口」——写盘前都过 `assertCloseoutChainComplete(src)`；全归档补关的唯一分流 = §4.18-C。」

依据 docs/core/design/LEDGER.md「`thincoder-core/tool-docs/ledger.md`、`thincoder-core/tool-docs/batch.md` | 同步模型可见契约」——设计侧早把本档列进受影响面，缺的正是「同步什么」。

理由：本批补的是**入口句**，不是行为。改机制档会让写下来的行为与跑出来的行为分叉，而这里没有行为要改。

### 三 · 机制设计（目标文本，逐字）

**缺口 · 补关入径**

改前（本轮实读）：该条目现由两句组成 —— 首句写成立条件，第二句是本批上轮插入的入口句、本轮被替换：

```text
Whether this record qualifies is a reading, not a guess: when this record's row set is non-empty, every row is `已核销` / `已废弃`, and the record is not frozen, run `check` first — the qualifying reading is `open-but-settled` as the only inconsistency, with the exit line 直接收口（活已做完、档未冻结）.
```

首句（本批零改，成立条件与行集前提都在它里面在档）：

依据 thincoder-core/tool-docs/batch.md「non-empty, every row `已核销` / `已废弃` — and the only reading against it is `open-but-settled`」

第二句红三处：入口写 `the record is not frozen`，比补关分支的真实入口宽一格（见本节「入口条件收窄」）；`non-empty, every row 已核销 / 已废弃` 与首句同一前提两处陈述；读不出 §1 的档照它走会落空（见本节「读不出 §1 那一格的复现」）。

改后（逐字目标文本，整句替换上述第二句、不另加句）：

```text
Whether this record qualifies is a reading, not a guess: when its §1 status line reads 进行中, run `check` first — the qualifying reading is `open-but-settled` as the only inconsistency, with the exit line 直接收口（活已做完、档未冻结）.
```

**入口条件收窄：`进行中`，不是「档未冻」**

「成立条件」不等于「入口条件」。`close` 的补关分支只接 `read.record === "open"`；`check` 报 `open-but-settled` 只要求 `record !== "closed"` —— 两者差一格。

`record = unknown`（§1 状态行读不出）正在格里：`check` 照报唯一读形与出路「直接收口」，`close` 却不走补关（冻结门以「状态行不可解析或缺失」早拒）。故入口写成 §1 状态行读 `进行中` —— 与 `read.record === "open"` 同宽，不写 `the record is not frozen`（那是 `check` 侧的宽度）。

依据 thincoder-core/agent-tools/batch-ledger-view.mjs「if (read.record !== "open" || rows === 0) return { repair: false, rows }」

依据 thincoder-core/ledger-cmd.mjs「if (record !== "closed" && rows.length > 0 && archived.length === rows.length) halfStates.push(halfStateOf("open-but-settled", rows))」

依据 thincoder-core/agent-tools/batch-segment-vocab.mjs「if (value.includes(STATUS_WORDS[1].open)) return "open"」

`进行中` 这个写法是准的：解析面认的 open 关键字就是它（`STATUS_WORDS[1] = { open: "进行中", closed: "已收口" }`），读面与写面同一词。

**出路句的出处**

依据 thincoder-core/ledger-cmd.mjs「直接收口（活已做完、档未冻结）；要继续做须先另立新行认领」

目标句取到括注为止（`直接收口（活已做完、档未冻结）`）：末段「要继续做须先另立新行认领」是继续做的台账侧出路，不属补关条目 —— 该条目已明写不做台账写。

**读不出 §1 那一格的复现**（本轮实跑；`execute` 内联 JS，逐行等价于下列命令）

```text
node --input-type=module -e 'import("file:///D:/teamcode/thincoder/thincoder-core/agent-tools/batch-segment-vocab.mjs").then((m) => { const src = ["# rec","## §1 讨论","正文","","### 轮次 1","**状态行**：进行中","","## §2 设计",""].join("\n"); const record = m.readBatchStatusLine(src); console.log(JSON.stringify({ record, checkReports: record !== "closed", repairTakes: record === "open" })); })'
```

读数：`{"record":"unknown","checkReports":true,"repairTakes":false}` —— 同一份档，`check` 面报、补关分支不接。这正是本批要消灭的摸索路径。

**同一入口句不再重述行集前提**：`non-empty, every row 已核销 / 已废弃` 就在同条目首句逐字在档，重述即第二处陈述 —— 本句只留动作与入口。§1 读不出的处置见同条目后一句（「cannot enter repair close — repair §1 first」）。

第三件事（其余半状态逐项点名并指回 `check`）已在同条目下一句逐字在档，本批零改 ——

依据 thincoder-core/tool-docs/batch.md「an all-archived batch that also reads as any other inconsistency (`header-row-missing` etc.) is refused with every reading listed and a pointer to `check`」

**缺口 · `check` 面同一入口（同轮收窄，不留两面两说）**

改前（设计轮实读；实施中该括注整段替换，现盘已是改后文本）：`check` 动作的 `open-but-settled` 括注把「读不出 §1」那一形一并称作补关入口 —— 它以「not frozen — `open`, or a §1 line that cannot be read」定义该读形，收尾句直称其为「the entry condition for a repair close」：读不出 §1 的档被称作补关入口，出路句又给「直接收口」，与 E1 的入口相反，且正是上一节复现的那条死路。

为什么这半句不再带 `依据` 行：`依据` 断言「引文逐字在该档在册」，而实施落盘后那半句已不在 `thincoder-core/tool-docs/batch.md`（它正是本批替换掉的收尾），原地保留即假依据；改指本档的改前样本则成同档自引，`依据` 就不成其为依据。改前全文只逐字留在上方 `close` 入口句的改前样本里，`check` 括注的改前只留这两段引文 —— 这两段由 §3 轮次 3 第 2 条当时的实读在册，改前整段已被替换、现盘无从复读。

改后（逐字目标文本，整段括注替换）：

```text
`open-but-settled` (not frozen — `open`, or a §1 line that cannot be read — with a non-empty row set entirely archived: the expected reading after reopening a fully settled batch. It is the entry condition for a repair close only when the §1 line reads 进行中 — an unreadable §1 line is a reading here, not an entry)
```

为什么同轮收窄而不记「不改」：留一句「读不出也算入口」，只读 `check` 面的模型就被指进死路 —— 那正是本批要消灭的摸索路径；而 `close` 面早已写着读不出的档进不了补关，两面必须同一格。改动量 = 该括注一句，同档内，不新增节、不新增判据。

依据 thincoder-core/tool-docs/batch.md「a record whose §1 status line is unreadable cannot enter repair close — repair §1 first」

**处置边界**：不搬「豁免 notice 的 `reason` 四值」（`batch close` 的回执不产生该字段，同四值已在既有档在册）；不写判定序（三支互斥、任何输入只得一条 notice，序不可观测）；不写跨档指针。本轮动的只有 `close` 入口句 ∥ `check` 括注两处。

### 四 · 受影响文件与测试覆盖

| 文件 | 改动 | 面 / 分层 | 笔 |
|---|---|---|---|
| `thincoder-core/tool-docs/batch.md` | 两处改写：`close` 补关条目的入口句（整句替换）∥ `check` 动作的 `open-but-settled` 括注（整段替换） | 产品面（描述档）· 不跨层 | eng-coder |

**分层结论**：无档跨分层，无拆分计划 —— 本批只改 `.md` 文本，代码零改。

**接口契约**：不适用 —— 无接口、协议或数据流变更，只改模型可见文本。

**测试覆盖**：零单测档、零集成用例。断言该骑行为、不骑散文：本批不改任何业务可观察结果，对描述字符串下断言只会让措辞一改就红，且不证明行为。

**集成测试设计（`test/RTM.md` 读面 → 本批增量 = 0）**：读过 `test/RTM.md` 的故事索引表，以及 `test/rtm/batch-ledger.md` 的 14-13 行（全归档批补关断言的是档冻结、§1 追记行、`[ledger repair]` 回执、`check` 读形翻转）。本批只改描述面文字，那些业务可观察结果一个不动 ⇒ **破行 0 ∥ 冗余 0 ∥ 新增 0**；无新业务场景、无生产问题可挂。

### 五 · 验收对照

| # | 判据（读者能判） | 红侧（改前应当红） | 绿侧 |
|---|---|---|---|
| AC-1 | 只读 `close` 动作段的读者能复述两件：§1 状态行读 `进行中` ⇒ 先跑 `check`；合格读形 = 唯一 `open-but-settled`，出路句「直接收口（活已做完、档未冻结）」 | 现盘该条目的入口句写 `the record is not frozen` —— 对 §1 读不出的档也成立，而 `close` 的补关分支不接它，照走落空；且行集前提与首句重复 | 目标句落在该动作段内，两件读得出；入口与 `read.record === "open"` 同宽，行集前提不再重述 |
| AC-2 | 改动面只 `thincoder-core/tool-docs/batch.md` 一档（档内两处） | `ledger.md`、代码档或 `docs/core/design/**` 被本批动过 | §5 的改动清单只列该档两处 |
| AC-3 | 复跑 `node scripts/tool-schema-size.mjs`，超单档 8,000 的名单不新增档名 | 名单多出一个档名 | 名单与九 ① 记下的改前同集（`batch` 本就在册） |
| AC-4 | `doc_check(mode:"gate", docs:["thincoder-core/tool-docs/batch.md"])` 首行 `DOC-CHECK GATE: PASS` | 任一判据命中（锚 / 段落过长 / 行号坐标） | PASS |
| AC-5 | 只读 `check` 动作段的读者，读到的补关入口与 AC-1 同一格：`open-but-settled` 只在 §1 读 `进行中` 时称入口，读不出 §1 那一形明标为读数 | 现盘括注把「not frozen — `open`, or a §1 line that cannot be read」直接收尾为「and the entry condition for a repair close」⇒ 读不出也算入口 | 括注把入口绑到 `进行中`，并把读不出那一形标成读数（`a reading here, not an entry`） |

AC-1 / AC-5 的红侧是内容判据（读者读到什么），不是字面计数：三串（`直接收口` · 先跑 `check` 的入口句 · `the record is not frozen`）与文件字符数只作定位读法，由实作轮用同一条命令在改写前后各取一次 —— 绝对值落 §5 的读数表，该表随本轮改写作废、整表重取；§2 只给命令与关系。

**文档门**：`doc_check(mode:"gate", docs:["thincoder-core/tool-docs/batch.md"])` 首行 `DOC-CHECK GATE: PASS`。

### 六 · 最近先例 / 调研证据 / 数据事实

**最近先例**：`existing: thincoder-core/tool-docs/browser.md · name: "**Route to browser instead of fetch:**" · consumers: 读描述面的模型`。同一手法 —— 内容已在档、缺的是入口，于是在最上游的决策点补一句触发句；不搬内容、不新建节。偏离：本批落在既有动作条目内，先例是动作族节的首行。

**调研证据**：`doc_search` 查询「补关 repair close 入径 可发现性 工具描述 batch.md 单档预算」→ 命中全是本仓设计档（`docs/core/design/LEDGER.md` §11.3–§11.4 · `docs/core/design/BATCH-RECORD.md` §4.13 · `docs/core/design/TOOLS.md` §6.20）；声明源未见相关规则。已查，无相关公共源。

**数据事实**：本批不改行为，不主张行数、填充率或枚举分布，无需读数据。

**口径限制（一行）**：本仓无独立项目标准档 —— `docs/README.md` 的提示词系统行把 owner 指向 `docs/core/design/PROMPT-SYSTEM.md`，故落点判据取该设计档 + `thincoder-core/tool-docs/batch.md` 原位；本批新档 0，同机制第二处陈述 0（唯一的既有第二处是 `check` 括注，见三「缺口 · `check` 面同一入口」，本轮收窄）。

### 七 · 关键决策

| # | 决策 | 理由 | 被否 |
|---|---|---|---|
| K1 | 目标文本落在既有补关条目内 | 模型在 `close` 段读补关；入口句挪到别的节 = 缺口原地不动 | 新起「补关入径」小节 |
| K2 | 第三件事不另写一句 | 同条目下一句已逐字写着同一规则；再写一遍是第二处陈述，必然漂，且本档已超帽 | 三件各写一句 |
| K3 | 目标句不写跨档指针；`notices` 四值与判定序不搬进本档 | 提示面禁规范文档引用，处置 = 删引用、非改址；`batch close` 回执不产生 `notices`，搬过来即第二处陈述；判定序三支互斥、任何输入只得一条 notice，序不可观测 | 句内指 `ledger.md` 的 `close` 段 · 把四值与判定序搬进本档 |
| K4 | 入口条件写 §1 状态行读 `进行中`，不写 `the record is not frozen` —— 取代上轮目标文本；§5 的 D1 ∥ D3 两条主张随之撤（行留在 §5 作历史，主张不再成立） | 补关分支的真实入口 = `read.record === "open"`；`check` 的报形条件只到 `record !== "closed"`。差的一格正是 §1 读不出 —— 「not frozen」把它放进来，`check` 给出路、`close` 不接 ⇒ 模型照走即落空，正是本批要消灭的摸索路径 | 保留 `the record is not frozen` · 只写「先跑 `check`」不带入口条件 |
| K5 | `check` 面同轮收窄，不记「不改」 | 只收窄 `close` 面而留 `check` 面宽口，只读 `check` 的模型照样被指进死路（复现见 §2 三）；两面同格才叫消灭摸索路径。改动是同档内一句，不新增节、不新增判据 | 保留该括注原文、只在本段记「不改」；或把收窄推到下一批 |

### 八 · 边界

不碰 `thincoder-core/tool-docs/ledger.md`；不碰补关机制本体（`thincoder-core/agent-tools/batch-ledger-view.mjs` 的 `repairDecisionOf`、`batch-lifecycle.mjs` 的分流、`ledger-cmd.mjs` 的 `HALF_STATE_EXITS`）。

不新增参数、字段、判据或节；不改 `docs/core/design/**`、不改需求档、不动单档帽本身的裁定（超帽现状见九 ①）。

不走「先改机制档再改描述面」那条路：机制零改，落点全在描述面 —— `close` 入口句与 `check` 括注同住 `thincoder-core/tool-docs/batch.md`，两处都是描述面；`check` 括注的收窄不构成机制改。

### 九 · 上抛项

**[上抛·待裁] ① `batch.md` 已超单档帽，本批只取增量最小解**

读数（2026-11-11 本轮实跑 `node scripts/tool-schema-size.mjs`，退出码 0）：超单档 8,000 的名单 = `browser` · `ssh` · `batch` · `doc_check` · `doc_graph` · `subagent` · `ledger`，`batch` 在册。量尺 = 该脚本自身的口径，非文件字符数 ——

依据 scripts/tool-schema-size.mjs「口径（与 §2.2.1 基线同式）：逐档 len(JSON.stringify({description, parameters})) 字符之和。」

帽与它的报告态 ——

依据 docs/core/design/PROMPT-SYSTEM.md「单档帽 | ≤ 8,000 字符——超限档在册报告态，档名与逐档字符数 = 机检行输出。」

故本批取「不新增超限档名 + 增量只限本批两句（`close` 入口句 ∥ `check` 括注）」，`ledger.md` 零改。

裁者 = 用户（经父侧转呈）；条件 = 用户要求 `batch.md` 回到 ≤8,000；到期 = 本批收口前。要回落须另开削身批，本批不夹带。

**[上抛·知会] ② 上轮的抛点已撤：机检命令现在跑得动**

`node scripts/tool-schema-size.mjs` 本轮实跑退出码 0，正常打出分面读数与超单档名单；上轮记的 import 缺导出报错不复现。AC-3 因此可判，不再 `unverified`。

**[上抛·知会] ③ 目标文本已改：§5 的交付与 D1 ∥ D3 须随实作轮重取**

本轮 `close` 入口句由上轮的 `the record is not frozen` 改为 `§1 status line reads 进行中`，并同轮收窄 `check` 括注。§5 记的是上轮那句，读数表三行随之作废 —— 实作面须重跑：落 §2 三 的两段逐字文本、整表重取读数、把 D1 ∥ D3 标为被 K4 取代（历史行留、主张撤）。

父侧须派实作轮；设计面已定，无待裁项。

## §3 设计评审（评审子代理）
**状态行**：评审通过（第 4 轮：第 3 轮 2🔴+3🟡+4🔵 全部落账，新出 🔴 0，余 🔵 2 条知会非阻断 · 2026-11-11）



### 轮次 1（评审子代理）

| # | 严重度 | 状态 | 证据 |
|---|---|---|---|
| 1 | 🔴 | 未决 | 缺口二目标句「the order the four are judged in is in `thincoder-core/tool-docs/ledger.md`'s `close` section」× `thincoder-core/prompts/common.md` 的 `Prompt face — no normative document references`「a **citation** that supplies the meaning of a rule has no place in any text the model reads — prompt files · tool descriptions · schema text · strings returned to the model」「Disposal = delete, not re-point: the citation goes, the meaning stays in the sentence」；机器坐标枚举 = 「the batch-record segment it writes」∥「a tool parameter name it passes」∥「a ledger state it moves」∥「this file's own section numbers」，不含另一份 tool-doc 的节 |
| 2 | 🟡 | 建议 | §2 三 · 缺口二「四值与其判定序只住 `thincoder-core/tool-docs/ledger.md` 的 `close` 段」——该档 `close` 条目只列四例、无判定序句；判定序在 `docs/core/design/LEDGER.md` §11.2「**豁免判定序**（同一行可同时命中两支）：先判指针形态三支」；`thincoder-core/ledger-close-proof.mjs`「三支互斥，任何输入只得一条 notice——序不可观测」 |
| 3 | 🟡 | 建议 | `thincoder-core/agent-tools/**` 内 `notices` 零命中；`batch close` 回执由 `reanchorReceiptLine` ∥ `newDebtReasonReceiptLine` ∥ `consistencyReceiptLine` 组成；该字段只出 `ledger` 回执（`thincoder-core/ledger-cmd.mjs` ∥ `thincoder-core/ledger-write-ops.mjs`），而同四值已在 `thincoder-core/tool-docs/ledger.md` 的 `close` 条目「Four cases pass the gate without a record to judge」逐字在档 |
| 4 | 🟡 | 建议 | §2 三 · 缺口一「而手上只有「行都结了、档没冻」的模型不会先跑 `check`：它会直接 `close`，再从英文长拒文里摸索」无引文场景（批档头只有用户 02:15 提问）；同档 `check` 条目已写「the entry condition for a repair close」；AC-1 自限「不读 `check` 段」 |
| 5 | 🟡 | 建议 | §2 九 ② 的抛点现状不成立：`thincoder-core/agent-tools/batch-lifecycle.mjs` 内 `FRAGMENT_PREFIX` 零命中；`thincoder-core/agent-tools/batch-gate.mjs` 导出恰为 `pointerCells` ∥ `runBatchGate` ∥ `gateReceiptLine` ∥ `gateRefusalMessage`；AC-4 的 `unverified` 依据须重取 |
| 6 | 🟡 | 建议 | 本档 §1 正文仍为 `<§1 模板占位：本批条目 / 关键判据 / 授权口径>`；§2 九 ③ 要裁的那一问无授权口径可对 |
| 7 | 🟡 | 建议 | §2 四 · 测试覆盖段无 `test/RTM.md` 读数、无 破行 ∥ 冗余 ∥ 新增 计数；形 = `docs/core/design/PROMPT-SYSTEM.md` §6.96.14「**集成测试设计**：`test/RTM.md` 的故事索引没有提示词文本冲突的业务入口」 |
| 8 | 🟡 | 建议 | §2 六 最近先例 `name: 路由段触发句` 非逐字；`thincoder-core/tool-docs/browser.md` 的原句 = `**Route to browser instead of fetch:**` |
| 9 | 🔵 | 知会 | 超帽处置成立：`docs/core/design/PROMPT-SYSTEM.md` §6.11 单档帽行「超限档在册报告态」「其余超限档未削，处置上抛父侧裁」；14,288 ∥ 7,390 两数为 `unverified`（量法已给、本轮无 shell 复算），无增量读数 |
| 10 | 🔵 | 知会 | 两处插入不破文档门：`doc_check` 报告态两档「命中 0 条（锚 0 · 文字太长，难于阅读 0 · 行太长 0）」；`DOC_CHECK_BUILTINS` 的 `lineMax` 只在提示词面逐行判，两处目标行均为列表项（段判据不计） |

计数：🔴 1 · 🟡 7 · 🔵 2 = 10 条。

VERDICT: changes-required

### 轮次 2（评审子代理）

| # | 严重度 | 状态 | 证据 |
|---|---|---|---|
| 1 | 🔴 | 已消 | 缺口二整条删除：`docs/batches/2026-11-11-p2-6-repair-close-discoverability.md` §2 三 只剩「缺口 · 补关入径」，目标句「run `check` first — the qualifying reading is `open-but-settled` as the only inconsistency」内无档名、无节号；§2 K3「目标句不写跨档指针；`notices` 四值与判定序不搬进本档」 |
| 2 | 🟡 | 已消（随缺口二删除） | §2 三「**本句的处置边界**：不搬「豁免 notice 的 `reason` 四值」」；§1「`notices` 四值不搬进本档」 |
| 3 | 🟡 | 已消（随缺口二删除） | §1「该字段只出 `ledger` 回执，`batch close` 从不产生它；同四值已在 `thincoder-core/tool-docs/ledger.md` 的 `close` 条目在档」（上轮已核实 `thincoder-core/agent-tools/**` 内 `notices` 零命中） |
| 4 | 🟡 | 已改 | 行为断言已删；换为文档面事实「合格读形的判据句不在这个动作段里，它在 `check` 动作段」+ 依据「and the entry condition for a repair close」；「出路句 `直接收口` 也不在本段：全档该串零命中」（本轮实读 `thincoder-core/tool-docs/batch.md` 全文确认该串零命中） |
| 5 | 🟡 | 已改 | §2 九 ②「上轮的抛点已撤：机检命令现在跑得动」「本轮实跑退出码 0」「AC-3 因此可判，不再 `unverified`」；AC-3 判据 = 超单档名单不新增档名 + 红侧「名单多出一个档名」 |
| 6 | 🟡 | 已改 | §1 正文已填「**本批条目（一条）**」「**关键判据**」「**授权口径**」；`<§1 模板占位：…>` 字面余留属 `thincoder-core/tool-docs/batch.md` 明许的模板行「`<§N 模板占位：…>` template lines are legal and never blocked」 |
| 7 | 🟡 | 已改 | §2 四「**集成测试设计（`test/RTM.md` 读面 → 本批增量 = 0）**」+「**破行 0 ∥ 冗余 0 ∥ 新增 0**」；14-13 用例实读 = 全归档批补关断言档冻结 / `**补关记录**` / `[ledger repair]` / `check` 读形消失 |
| 8 | 🟡 | 已改 | §2 六 `name: "**Route to browser instead of fetch:**"` 与 `thincoder-core/tool-docs/browser.md` 原句逐字一致 |
| 9 | 🔵 | 已改 | §2 九 ① 量尺换成机检口径，引文与 `scripts/tool-schema-size.mjs` 第 3 行注释「口径（与 §2.2.1 基线同式）：逐档 len(JSON.stringify({description, parameters})) 字符之和。」逐字一致；名单 7 档含 `batch`；`thincoder-core/tool-docs/ledger.md` 零改 |
| 10 | 🔵 | 已消 | 只余一处插入；`thincoder-core/tool-docs/batch.md` 报告态机检「命中 0 条（锚 0 · 文字太长，难于阅读 0 · 行太长 0）」，目标句无档名且落既有列表项（段判据不计） |
| 11 | 🟡 | 新增·建议（非阻断） | §2 三 目标句「when this record's row set is non-empty, every row is `已核销` / `已废弃`, and the record is not frozen」与同条目首句「non-empty, every row `已核销` / `已废弃`」为同一前提两处陈述，与 §2 K2「再写一遍是第二处陈述，必然漂」相左；削去前提只留「run `check` first」可免两处漂 |
| 12 | 🔵 | 新增·知会 | §2 三 目标句引机读串「直接收口（活已做完、档未冻结）」现无 `依据` 行；该串实在 `thincoder-core/ledger-cmd.mjs` 的 `open-but-settled` 分支「直接收口（活已做完、档未冻结）；要继续做须先另立新行认领」 |

计数：上轮 🔴 1 · 🟡 7 · 🔵 2 全部落账（🔴 0 余留 · 🟡 7 改/消 · 🔵 2 改/消）；本轮新增 🟡 1（建议，非阻断）· 🔵 1。

VERDICT: pass

### 轮次 3（评审子代理）

> 状态行重置：第 3 轮打回（changes-required）· 上一轮状态行 = 评审通过 → 进行中 · 2026-11-11

| # | 严重度 | 状态 | 证据 |
|---|---|---|---|
| 1 | 🔴 | 未决 | `docs/batches/2026-11-11-p2-6-repair-close-discoverability.md` §2 一 E1 判定面「非空全归档且档未冻 ⇒ 先跑 `check`」× 同档 §2 三 目标句「when its §1 status line reads 进行中, run `check` first」× 同档 §2 七 K4 被否列「保留 `the record is not frozen`」——同一入口在同一段内两处活陈述，且照 E1 判本批自己的目标句为红 |
| 2 | 🔴 | 未决 | `thincoder-core/tool-docs/batch.md` 的 `check` 动作 `open-but-settled` 括注「a §1 line that cannot be read」「the entry condition for a repair close」× 同档 `close` 动作本轮回执 §2 三 目标句（只 `进行中` 入径）× `thincoder-core/agent-tools/batch-ledger-view.mjs` 的 `repairDecisionOf`「if (read.record !== "open" \|\| rows === 0) return { repair: false, rows }」——同档两面两说；读不出档仍被指向「直接收口」，正是本轮要消灭的摸索路径，设计只引该短语、未处置 |
| 3 | 🟡 | 建议 | 同档 §2 五 AC-1 红侧「该动作段只写成立条件」= 第 1 轮基线；`thincoder-core/tool-docs/batch.md` 现文同条目已有两句（含「the record is not frozen」）⇒ 红侧对本轮改前实档不成立，两基线混在一格 |
| 4 | 🟡 | 建议 | 同档 §2 五「绝对值住 §5 的读数表」× §5 读数表「`直接收口` 0 / 1」「`run \`check\` first` 0 / 1」——本轮改写后该表整体作废，设计未给新读数的落点 |
| 5 | 🟡 | 建议 | §5 决策披露 D1「不削前提、不改措辞」∥ D3「保留 `the record is not frozen` 的写法」× 同档 §2 七 K4 被否列同项——记录面仍以活口径为被否形辩护，未记本轮取代 |
| 6 | 🔵 | 知会 | 同档 §2 三 只以位次指认被替换句（「该条目首句之后那一句」），未逐字引现文被替换句——上一轮正是把它当插入句交付过 |
| 7 | 🔵 | 知会 | 同档 §2 三 目标句引「直接收口（活已做完、档未冻结）」止于括注；`thincoder-core/ledger-cmd.mjs` 的 `HALF_STATE_EXITS` 原串余「；要继续做须先另立新行认领」，且该串无 `依据` 行（第 2 轮 🔵 未落） |
| 8 | 🔵 | 知会 | 读不出档的死路是源码可推、无复现命令：设计未给能跑出 `check` 报唯一 `open-but-settled` + 「直接收口」而 `close` 拒的复现路径 |
| 9 | 🔵 | 知会 | 口径限制：无独立项目标准档；`thincoder/docs/README.md` 提示词系统行（owner = `docs/core/design/PROMPT-SYSTEM.md`）已读，落点仍在 `thincoder-core/tool-docs/batch.md` 原位——新档 0、同机制第二处陈述 0（除第 2 条那条既有括注） |

计数：🔴 2 · 🟡 3 · 🔵 4 = 9 条。

VERDICT: changes-required

### 轮次 4（评审子代理）

| # | 严重度 | 状态 | 证据 |
|---|---|---|---|
| 1 | 🔴 | 已消 | `docs/batches/2026-11-11-p2-6-repair-close-discoverability.md` §2 一 E1 判定面改成「能读出「§1 状态行读 `进行中` ⇒ 先跑 `check`」」+「行集前提不在此重述（它就在同条目首句）」，与 §2 三 目标句「when its §1 status line reads 进行中, run `check` first」、§2 七 K4 同格；旧宽口径只余被否列与改前叙述 |
| 2 | 🔴 | 已消 | §2 三·缺口·`check` 面同一入口：改前逐字与 `thincoder-core/tool-docs/batch.md` 现文括注一致（「and the entry condition for a repair close」），改后整段括注「It is the entry condition for a repair close only when the §1 line reads 进行中 — an unreadable §1 line is a reading here, not an entry」——与 `thincoder-core/agent-tools/batch-ledger-view.mjs` 的 `repairDecisionOf`「if (read.record !== "open" \|\| rows === 0) return { repair: false, rows }」同宽，两面不再两说 |
| 3 | 🟡 | 已消 | §2 五 AC-1 红侧改为按现盘「现盘该条目的入口句写 `the record is not frozen`」；§2 三 改前 fenced 块逐字引现文第二句，与 `thincoder-core/tool-docs/batch.md` 同条目第二句逐字一致，两基线不再混一格 |
| 4 | 🟡 | 已消 | §2 五 末段「绝对值落 §5 的读数表，该表随本轮改写作废、整表重取；§2 只给命令与关系」 |
| 5 | 🟡 | 已消 | §2 七 K4「取代上轮目标文本；§5 的 D1 ∥ D3 两条主张随之撤（行留在 §5 作历史、主张不再成立）」+ §2 九 ③「把 D1 ∥ D3 标为被 K4 取代（历史行留、主张撤）」 |
| 6 | 🔵 | 已消 | §2 三 改前块「该条目现由两句组成 —— 首句写成立条件，第二句是本批上轮插入的入口句、本轮被替换」+ 逐字 fenced 块 |
| 7 | 🔵 | 已消 | §2 三·出路句的出处 `依据 thincoder-core/ledger-cmd.mjs「直接收口（活已做完、档未冻结）；要继续做须先另立新行认领」` + 取到括注为止的理由（末段属继续做、该条目明写不做台账写） |
| 8 | 🔵 | 已消 | §2 三·读不出 §1 那一格的复现：命令 + 读数「{"record":"unknown","checkReports":true,"repairTakes":false}」，与 `thincoder-core/agent-tools/batch-segment-vocab.mjs` 的「取值区只有一个 = 段头区」∥「if (hits.length !== 1) return "unknown"」一致 |
| 9 | 🔵 | 已消 | §2 六 末「口径限制（一行）」：`docs/README.md` 提示词系统行 owner 指向 `docs/core/design/PROMPT-SYSTEM.md`，落点取该设计档 + 原位，新档 0、同机制第二处陈述 0 |
| 10 | 🔵 | 新增·知会 | §2 三 复现命令的 `checkReports` 只取 `record !== "closed"` 一个合取项，而同一段自引的 `thincoder-core/ledger-cmd.mjs`「rows.length > 0 && archived.length === rows.length」另有两个合取项 —— 该读数是入口宽度的谓词近似，不是一次 `check` 运行 |
| 11 | 🔵 | 新增·知会 | 记录面 §5 仍写「一处插入」∥ 审计行「E1–E3 ∥ AC-1–AC-4 全「一致」」，而 §2 已 E1–E4 ∥ AC-1–AC-5 ∥ 两处改写；§2 九 ③ 已派实作轮重取读数与 D1 ∥ D3，未点名该审计行 |

计数：上轮 🔴 2 · 🟡 3 · 🔵 4 = 9 条全部落账（余留 0）；本轮新增 🔵 2（知会，非阻断）。两问复核：① 只剩一处活入口（§2 一 E1 ∥ §2 三 目标句 ∥ §2 七 K4 同格）；② 改后括注与 `repairDecisionOf` 的 `read.record === "open"` 同宽；③ E4 ∥ K5 ∥ AC-5 与 §2 状态行 · §2 四 · §2 八 · §2 九 ① 的「两处」计数一致；④ 新出 🔴 0。

VERDICT: pass

## §4 用户批准（主 agent）
## §5 实施记录（eng-coder）
**状态行**：实施完成（两处描述面改写（close 入口句 ∥ check 括注）· 机制与代码零改 · 审计 DIVERGENCE: none · 代码评审 VERDICT: pass · 终态 clean）



### 交付摘要 · 实作轮 1（已被实作轮 2 取代 — 本节以下的读数表、验收对照、审计表同为实作轮 1 的面；现盘 = 两处改写，见本段末「实作轮 2」）

`thincoder-core/tool-docs/batch.md` 的 `close` 动作 · `Repair close (`补关`)` 条目首句之后插入一句 —— 逐字为 §2 三 的目标文本，一字未改：

```text
Whether this record qualifies is a reading, not a guess: when this record's row set is non-empty, every row is `已核销` / `已废弃`, and the record is not frozen, run `check` first — the qualifying reading is `open-but-settled` as the only inconsistency, with the exit line 直接收口（活已做完、档未冻结）.
```

落点核验：该句前一句 = 「…the chain content gate and the §3 pass arm are skipped and the record is frozen.」，后一句 = 「The work is already recorded on the ledger side; what was missing was the freeze.」—— 落在同一条目内、首句之后；全档整句字面命中 1 处（无重复插入）。

### 读数（改前 / 改后同一条命令的两次运行）

量法 = `node -e` 对 `thincoder-core/tool-docs/batch.md` 全文做字面子串计数（不用 shell 侧的量尺）：

| 读数 | 改前 | 改后 |
|---|---|---|
| `直接收口` 计数 | 0 | 1 |
| `run \`check\` first` 计数 | 0 | 1 |
| 文件字符数 | 14288 | 14572 |

`node scripts/tool-schema-size.mjs` 两次实跑（退出码 0）：超单档 8,000 的名单两轮同集 7 档 —— `browser` · `ssh` · `batch` · `doc_check` · `doc_graph` · `subagent` · `ledger`（`batch` 本就在册，未新增档名）；`batch` 从 22467 → 22751（+284），总量 210,996 → 211,280。

`doc_check(mode:"gate", docs:["thincoder-core/tool-docs/batch.md"])` 首行 `DOC-CHECK GATE: PASS`，判读「0 段有问题（1 档全清）」。

### 验收对照 · 实作轮 1（只到 AC-1–AC-4；AC-5 与现盘判据见本段末「实作轮 2」）

| # | 判据（读者能判） | 结果 |
|---|---|---|
| AC-1 | 只读 `close` 动作段的读者能复述两件 | 达成 —— 两件都在插入句内（`run \`check\` first` ∥ 合格读形 = 唯一 `open-but-settled`，出路句「直接收口（活已做完、档未冻结）」）；红侧已实测（改前 0 / 0） |
| AC-2 | 改动面只 `thincoder-core/tool-docs/batch.md` 一档 | 达成 —— 本批改动文件只有该档一句 |
| AC-3 | 超单档名单不新增档名 | 达成 —— 两轮名单同集 7 档 |
| AC-4 | `doc_check` gate 首行 PASS | 达成 |

### 决策披露

| # | 决策 | 依据 / 理由 |
|---|---|---|
| D1 | 逐字照抄 §2 三 的目标文本，不削前提、不改措辞〔已被 §2 七 K4 取代：目标文本改为「when its §1 status line reads 进行中」，本行主张不再成立，行留作历史；实作轮 2 的照抄主张见本段末 D5〕 | §2 三 给的是「逐字目标文本」；§3 轮次 2 第 11 条只是建议（非阻断，VERDICT: pass），不构成设计变更 |
| D2 | §3 轮次 2 #11 指的前提重复不在本批处理 | 那是设计层文本决定；实现者自己削句 = 交付一份没人批准的目标句。已作为知会随本段上抛 |
| D3 | 保留 `the record is not frozen` 的写法〔已被 §2 七 K4 取代：该写法已从盘上撤下，入口改由 §1 状态行读 `进行中` 承担，本行主张不再成立，行留作历史〕 | 同 D2（设计原文）。该写法与 `check` 的 `open-but-settled` 判据同宽（`record !== "closed"`），比补关入口（`read.record !== "open"`）宽一格 —— 判据代码本轮实读，作为知会②上抛 |
| D4 | 不新增节 / 字段 / 判据，不写跨档指针 | §2 E2 边界；插入句内无 `.md` 名、无节号，句中的 `check` 指同档动作 |

### 改动文件与设计漂移

改动文件 = `thincoder-core/tool-docs/batch.md` 一档（同一条目内 +1 句）。无越界文件。

设计漂移 = 无：§2 四 的受影响文件表已列本档，`docs/core/design/**` 零改（机制零改，见 §2 二），模块图与受影响面表无需更新。

### 审计与评审轮次 · 实作轮 1（本会话内，全部只读；面 = E1–E3 ∥ AC-1–AC-4。实作轮 2 的轮次与面见本段末）

| 轮 | 谁 | 结论 |
|---|---|---|
| 1 | explore 分歧审计（对 §2 判交付） | `DIVERGENCE: none` —— E1–E3 ∥ AC-1–AC-4 全「一致」，逐字比对命中 1 处，越界文件 0 |
| 2 | advisor 代码评审（`type:"code"`，面 = 本档 + 本批档） | `VERDICT: pass` —— 🔴 0；🟡 1（本段当时为空，本轮已写，随本段消解）；🔵 2（均为设计层措辞，见 D2 / D3） |
| 修复轮次 | — | 0（两轮零阻断项，无需修正轮） |

终态：`clean`。

### 新债

本批新债 0 条。两条 🔵 都不进台账：① 前提重复 = §3 轮次 2 #11 已在册的设计层悬点；② 「not frozen」比机制宽一格 = 设计层措辞，判据代码本轮实读，作为知会随本段上抛父侧裁（要动须另开设计修改，本批不夹带）。

### 实作轮 2（本轮 · 取代上轮的交付面；两处描述面改写，机制与代码零改）

**交付摘要（一档之内两处，逐字照抄 §2 三 的目标文本）**

`thincoder-core/tool-docs/batch.md` 两处，一字未改照抄 §2 三「改后（逐字目标文本…）」：

1. `close` 动作 · `Repair close (`补关`)` 条目第二句 —— 整句替换，不另加句：

```text
Whether this record qualifies is a reading, not a guess: when its §1 status line reads 进行中, run `check` first — the qualifying reading is `open-but-settled` as the only inconsistency, with the exit line 直接收口（活已做完、档未冻结）.
```

2. `check` 动作 · 六类半状态行里 `open-but-settled` 的括注 —— 整段替换：

```text
`open-but-settled` (not frozen — `open`, or a §1 line that cannot be read — with a non-empty row set entirely archived: the expected reading after reopening a fully settled batch. It is the entry condition for a repair close only when the §1 line reads 进行中 — an unreadable §1 line is a reading here, not an entry)
```

**落点核验（本轮实读）**

- 段一仍在该条目内：它前面是成立条件那一句（收尾 `…the chain content gate and the §3 pass arm are skipped and the record is frozen.`），后面是既有句 `The work is already recorded on the ledger side; what was missing was the freeze.`。
- 段二仍在两个相邻括注之间：前为 `open-but-unwritable`，后为 `pointer-stale`。
- 两段整串各在全档字面命中 1 处 —— 无重复插入、无旧句残留（改前那句 `…and the record is not frozen…` 现档零命中）。

**读数（改前 / 改后 · 同一量尺的两次运行 · 整表重取）**

量法 = 内联 node 对 `thincoder-core/tool-docs/batch.md` 全文做字面子串计数（不走 shell 侧量尺；只有同一量尺的两次运行才可比）。改前侧不是沿用上一轮记数：本轮把两处临时还原成旧文后实测，再落目标文本。

| 读数 | 改前 | 改后 |
|---|---|---|
| `直接收口` 计数 | 1 | 1 |
| `run` + 反引号 `check` + ` first` 计数 | 1 | 1 |
| `the record is not frozen` 计数 | 1 | 0 |
| `status line reads 进行中` 与 `§1 line reads 进行中` 合计 | 0 | 2 |
| `a reading here, not an entry` 计数 | 0 | 1 |
| 文件字符数 | 14572 | 14598 |
| 文件字节数 | 15282 | 15313 |

`node scripts/tool-schema-size.mjs` 两次实跑（退出码 0；改前侧同样取自临时还原后的实测）：

| 读数 | 改前 | 改后 |
|---|---|---|
| 超单档 8,000 名单 | `browser` · `ssh` · `batch` · `doc_check` · `doc_graph` · `subagent` · `ledger`（7 档） | 同集 7 档，未新增档名 |
| `batch` 档字符 | 22751 | 22777（+26） |
| 总量 | 211280 | 211306 |
| `tool-docs` 面字符 | 156223 | 156249 |

`doc_check(mode:"gate", docs:["thincoder-core/tool-docs/batch.md"])` 首行 `DOC-CHECK GATE: PASS`，判读 `0 段有问题（1 档全清）`。

反向对照（证明该门不是橡皮章）：同轮造一份带悬空锚与行号坐标的临时档送报告态，读到 `锚·档缺` 1 条 + 行号坐标正文面 1 处；该档同轮删除。

```text
.probe-doccheck-tmp.md  —— 本轮创建 → 跑报告态 → 同轮删除；盘上零残留、未进版本库
```

**验收对照（本轮 · §2 五 的 AC-1–AC-5）**

| # | 判据（读者能判） | 结果 |
|---|---|---|
| AC-1 | 只读 `close` 动作段的读者能复述两件 | 达成 —— 两件同在段一：入口写「§1 状态行读 `进行中` ⇒ 先跑 `check`」，合格读形 = 唯一 `open-but-settled`，出路句「直接收口（活已做完、档未冻结）」。红侧实测成立：改前入口写 `the record is not frozen`（改后该串 0），而补关分支只接 `read.record === "open"` |
| AC-2 | 改动面只 `thincoder-core/tool-docs/batch.md` 一档（档内两处） | 达成 —— 交付写入只有该档两处；域外另有一份临时对照档同轮建删（见「越界与声明面」） |
| AC-3 | 复跑机检，超单档 8,000 名单不新增档名 | 达成 —— 两次实跑同集 7 档，`batch` 本就在册 |
| AC-4 | `doc_check` gate 首行 PASS | 达成 —— 见读数表下两行 |
| AC-5 | 只读 `check` 动作段的补关入口与 AC-1 同格 | 达成 —— 段二把入口绑到 `进行中`，并把读不出 §1 那一形明标为 `a reading here, not an entry`，与同档后一句「§1 读不出进不了补关」同说 |

**决策披露（本轮）**

| # | 决策 | 依据 / 理由 |
|---|---|---|
| D5 | 两段逐字照抄，`进行中` 不加反引号 | §2 三 给的是逐字目标文本；本档他处把同一关键字写成代码字面，此处仍照抄 —— 实现者自行补字形 = 交付一份没人批准的目标句。字形差异作知会①上抛 |
| D6 | 改前读数用「临时还原旧文再实测」取得，不沿用上一轮 §5 的记数 | §2 五 明写上一轮读数表随本轮改写作废、整表重取；两个不同档面取来的数不可比，只有同一量尺的两次运行可比 |
| D7 | 只落两处，不代设计层改其余表述（含 `check` 括注之外的任何一句） | §2 八 边界；§2 二 机制零改，`docs/core/design/**` 本轮未动 |

**越界与声明面**

本 spawn 的声明写入面 = `thincoder-core/tool-docs/batch.md`。本轮实际写过的路径共两处：

- `thincoder-core/tool-docs/batch.md` —— 声明面内，两处改写。
- 一份临时对照档（上前一个围栏块内已具名）—— 声明面外，仅为 AC-4 的反向对照而建，同轮删除，盘上零残留、未进版本库（审计席复核：读该路径为 `ENOENT`，且不在未跟踪清单）。

除这两处外零写：机制代码、`thincoder-core/tool-docs/ledger.md`、`docs/core/design/**` 本轮零改。

**审计与代码评审（本会话内，全部只读）**

| 轮 | 谁 | 结论 |
|---|---|---|
| 1 | explore 分歧审计（对 §2 判交付） | `DIVERGENCE: none` —— E1–E4 ∥ AC-1–AC-5 逐条「一致」；两段目标文本逐字相同；跨档指针 0；越界文件 0（唯一域外项 = 同轮建删的临时档，判为无残留）。AC-3 在该席位无 shell，标 `unverified`，由本轮实跑补齐 |
| 2 | advisor 代码评审（`type:"code"`，面 = 本档 + 本批档） | `VERDICT: pass` —— 🔴 0 · 🟡 1（§5 未随本轮重取 —— 即本段这次写入）· 🔵 3（同档两处入口句并存的日后同步风险 ∥ 出路句引文截断 ∥ AC-3 待复跑，本轮已复跑） |
| 修复轮次 | — | 0（两轮均无阻断项，无需修正轮） |

终态：`clean`。

**新债**

本批新债 0 条。评审席 🔵 三条都不进台账：① 两处入口句并存 = §2 七 K5 已明的取舍（只读一面的模型也走对路），风险在日后只改一面，记在本段由下一轮遵守；② 出路句取到括注为止 = §2 三「出路句的出处」已裁定；③ AC-3 复跑 = 本轮已做，非债务。

**知会（父侧）**

- ① 〔知会〕`进行中` 在两段落下的文本里是散文写法，而本档他处（如 `Reopening a frozen record` 条目）写作代码字面。逐字照抄优先，未自行统一字形；若要统一，属另一次设计改动。
- ② 〔知会〕补关入口现分居同档两处（`close` 条目 ∥ `check` 括注），内容同格。日后任一轮改入口措辞须两处同改 —— 只改一面就回到本批要消灭的「两面两说」。

**文档门复核（记录面 · 本轮实跑，两条都在本段笔面之外）**

`doc_check(mode:"gate")` 本轮跑两次，判集不同、读数不同，两个都记：

| 判集 | 首行 | 说明 |
|---|---|---|
| `thincoder-core/tool-docs/batch.md` 单档 | `DOC-CHECK GATE: PASS` | 本批交付面，零命中（AC-4 即此读数） |
| 上式 + 本批档整档入判 | `DOC-CHECK GATE: REFUSED（锚 2 条）` | 两条命中的作者都不是本席，见下 |

```text
✗ 锚·引缺 docs/batches/2026-11-11-p2-6-repair-close-discoverability.md:102 `thincoder-core/tool-docs/batch.md`（引文不在该档内：「and the entry condition for a repair clo…」）
✗ 锚·档缺 docs/batches/2026-11-11-p2-6-repair-close-discoverability.md:259 `thincoder/docs/README.md`（该名未在 index.publicRepos 声明）
```

两条的归属：

- 第一条是**本轮改写造成的设计档漂移**：§2 三「缺口 · `check` 面同一入口」用「改前（本轮实读）」的 `依据 …「…」` 形式，引本批整段替换掉的那半句。替换落盘后那条引文在档内已不存在 ⇒ 判 `引缺`。这不是实现偏差：§2 自己给的改前样本就写在它上方的围栏块里，`依据` 行重复引同一句、且引的是已不存在的字面。**处置面 = §2 是 eng-designer 的笔**：把该行改指改前样本，或删掉这行 `依据`。实作轮不代改。
- 第二条是存量，且本轮内它变过：本轮早段我读 manifest，`docCheckExemptions` 恰有 1 条正是这条（`file` 指向本批档、`text` 即该旧形指针），当时的单档 gate 回执把它记作「登记未命中」；收笔前再读同一文件，该键已是空数组 —— 豁免不在了，该命中于是回到阻断位。**处置面 = manifest 是主 agent 的笔，这条证据格是评审席的笔。**

交付面结论：本批唯一被改的产品档 `thincoder-core/tool-docs/batch.md` 单档 `DOC-CHECK GATE: PASS`；把本批档一并整档入判时首行为 `REFUSED`，两条命中均在他人笔面，按笔域纪律上抛父侧路由，不在这里改成绿。

## §6 验证与收口（父代理）
