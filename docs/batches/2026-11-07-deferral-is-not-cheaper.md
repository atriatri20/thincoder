# 2026-11-07 · deferral-is-not-cheaper
> 六段，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 每段只有一个作者：作者的段可 `append` 加内容、可就地改（`edit`）；非作者一概拒。
> 编制：主 agent · 2026-11-07 · 来源 = 台账 #2153；用户 2026-11-07 22:33「不进提示词,以后还是记不住」。
> 台账 = #2153（core · 归批）。前情 = 无（独立批）。
## §1 讨论（主 agent）
**状态行**：已收口 2026-11-07
<§1 模板占位：本批条目 / 关键判据 / 授权口径>

### 需求：把「挂账为什么是假便宜」落进提示词

**用户原话（逐字）**：「**挂账不省评审这事儿你记着也没用啊,不进提示词,以后还是记不住.**」

### 当日实况：同一件事我在会话里认了三次

| 时 | 事 |
|---|---|
| 20:01 | 我判「`§6.77` 四条措辞债挂账，改它要重走评审」，用户驳回：「**挂账难道以后就不用过评审了吗？**」 |
| 20:0x | 改判、重开、修正、复审——**实际花掉一个修正轮 + 一次窄化评审，与"当时就改"完全相同** |
| 22:33 | 用户点破：**这条教训只活在对话里，什么也没改变** |

**⇒ 教训落在会话里 = 零留存。**下个会话的我，仍会把"这不属于本批"当票用。

### 缺口在哪（不是"没规则"，是"缺那条为什么"）

`thincoder-core/prompts/persona-engineering.md` 已有处置路由（`§ Debts, ledger upkeep, and the closeout sweep`，逐字「inside ∧ small form (wording / coordinates / indexes / cleanup) ⇒ fix it on the spot; inside ∧ large (… needs design) ⇒ book it this round as a ledger row」）——**它讲的是"怎么处置"**。

**但"攒"之所以每次都赢，不是不知道该怎么处置，是它看起来便宜**：

```
现在改：一次修正轮 + 一次评审
挂账改：同一次修正轮 + 同一次评审（推迟）+ 这段时间盘上一段假话 + 一条台账要多养一次
```

**⇒ 挂账一分钱不省，还多两样东西。**而每一次"攒"的当下，这个账没有人算给我看——**所以我每次都算错。**

### 落点判语（父侧定，设计席可提异议）

- **受众 = 工程模式**（评审门是工程模式的机器；`挂账不省评审` 这个说法离开它就不成立）。
- **落点 = `thincoder-core/prompts/persona-engineering.md`**，**紧挨 `${处置路由}` 之后**——那一条讲处置，这一条讲为什么处置，**且判挂账的人正读那一格**（今日 20:01 就是照那格把四笔措辞债判成挂账）。
- **`discipline-engineering.md` 不改**——本批的判据面在处置路由那一格，不在模式纪律档；**改它等于把道理放在读的人不会去看的地方**。
- **形态 = 因果形**（同 `#2145` ∥ `#2149`）：讲清挂账的成本结构，不写「严禁挂账」这类禁令。

### 边界（这批不做什么）

- 不改 `thincoder-core/prompts/common.md` ∥ 普通模式提示词（本批受众 = 工程模式）。
- 不改台账 ∥ 批档 ∥ 评审机制本身（要改的是提示词里那段道理，不是机制）。
- 不做存量清理 ∥ 不动源码 ∥ 不动 `test/**`。

### 库外 = B 类

改动面 = `thincoder-core/prompts/**`（纯文本）；**外部断言 = 零**，不联网查证。

## §2 批次任务与设计（eng-designer）
**状态行**：设计完成（落点 = thincoder-core/prompts/persona-engineering.md 处置路由之后（父侧已裁）；纪律层零改）
<§2 模板占位：本批条目（覆盖） / 设计档落点 / 机制设计 / 受影响文件与测试覆盖 / 验收对照 / 关键决策 / 上抛项>

### 本批覆盖的条目

| # | 需求（批档 §1） | 落点 | 判据回指 |
|---|---|---|---|
| 1 | 「挂账不省评审」这条道理进提示词（用户 22:33 原话见 §1） | `thincoder-core/prompts/persona-engineering.md`「Debts, ledger upkeep, and the closeout sweep」处置路由 `Why` 行之后增列 5 行（块 ①） | `docs/core/design/PROMPT-SYSTEM.md` §6.78 的 A1 ∥ A2 |
| 2 | 与处置路由相邻（一条讲处置、一条讲为什么），且同一条判据的其余两处表述同轮对齐 | 同上：块 ① 紧接处置路由；路由括注与台账生命周期第 4 条各删一项（块 ② ∥ 块 ③） | §6.78 的 A2 ∥ A6 ∥ A7 |
| 3 | 因果形 · 零禁令词 · 每行 ≤300 字符 | 同上逐字块 ①（5 行） | §6.78 的 A3 ∥ A5 |
| 4 | 零外溢（其余提示词档零命中） | — | §6.78 的 A4 |
| 5 | 可等的对象只剩事件（`its own round` 退役 · 零残留）· 交付门 | `thincoder-core/prompts/persona-engineering.md` 路由改后三行 ∥ 写域两行（零改）∥ 台账第 4 条逐一核 | §6.78 的 A6 ∥ A7 ∥ A8 ∥ A9 |

### 本批明确不含

- 不改 `thincoder-core/prompts/common.md` ∥ 普通模式提示词（受众 = 工程模式，§1 边界）。
- 不改台账 ∥ 批档 ∥ 评审机制本身；不动源码；不动 `test/**`；不做存量清理。
- 不改处置路由的三个去处与写域句（小形项就地修 ∥ 大项当轮开账 ∥ 界外不动，三支保持原样）。

### 落点裁定（父侧已裁 · 2026-11-07）

**本批落点由 `thincoder-core/prompts/persona-engineering.md` 承担；`thincoder-core/prompts/discipline-engineering.md` 不改。**

理由 = **判挂账的人读的那一格是处置路由**：路由住人格层，主 agent 在那一格判「小形项就地修 ∥ 大项开账」。今天把四笔措辞债判成挂账，正是照该条 `inside ∧ large … ⇒ book it this round as a ledger row` 那一支。

`thincoder-core/prompts/discipline-engineering.md` 现无该路由条（实读：该档第 2 条讲错结构，另一条讲机器大小）——所以这条道理落人格层：判挂账的人读的那一格是处置路由。

**这句写在这里是为了让下一个人不必再查一遍**：纪律层零改是有理由的，不是漏了。

### 括注裁定的连带（父侧 2026-11-07 裁）

`its own round` 不再是挂账理由：它不是事件，是成本——成本早晚要付，只有事件挡得住「现在做」。
故路由括注与台账生命周期第 4 条同轮各删一项（D11：一条规则改在每一层，留一处就是下一轮的假话），逐字改动形见 §6.78 块 ② ∥ 块 ③。

### 设计档落点

`docs/core/design/PROMPT-SYSTEM.md` §6.78 = 本节唯一权威：判据 ∥ 逐字英文块 ∥ 对照表 ∥ 用例表 ∥ 验收 A1–A9 与四条可复跑命令 ∥ 关键决策 ∥ 边界。§2 不复制其中文字。

### 受影响文件与分层结论

| 档 | 面 | 谁落 |
|---|---|---|
| `docs/core/design/PROMPT-SYSTEM.md` | 文档面（设计） | 本席，已落（§6.78 + 同档连带三处：§6.77 正文与证据行的现行形 ∥ §6.73 清点表 persona·Debts 行 ∥ §6.8 四处与清点表 persona·Ledger 题眼随 `its own round` 退役改齐） |
| `thincoder-core/prompts/persona-engineering.md` | 产品代码面（运行期提示词） | 实施轮 eng-coder（块 ① 增列 5 行 + 四行续行；块 ② ∥ 块 ③ 各换写一行） |
| `thincoder-core/prompts/discipline-engineering.md` | 产品代码面 | 零改（见上节裁定） |
| 测试档 | — | 0（零代码面） |

**分层结论 = 无档跨分层**：档位线只量代码面；提示词 `.md` 免档位判定，运行期代码零改。

### 验收对照

逐条回指 §6.78 的 A1–A9；每条带命令与期望，那里是唯一权威。实施轮跑 A1 ∥ A2 ∥ A5 ∥ A6 ∥ A7 ∥ A8，本席已跑 A3 ∥ A4 并由实施轮复跑；A9 = 交付门，本席交付前跑 ∥ 父侧收口复跑（本席已跑：首行 `PASS`）。

### 关键决策

回指 §6.78 的 K1–K6：因果形不写禁令 ∥ 落人格层处置路由之后 ∥ 只收窄理由面、不废除大项开账 ∥ 逐字块住设计档单源 ∥ `its own round` 从原因列删除（路由 ∥ 台账同改）∥ 判据行前置路由的两道闸。

### 上抛项

无待裁。两项已由父侧 2026-11-07 裁：落点（人格层）∥ `its own round` 删除；本批无未决项。
〔知会〕同档连带三处已随改：§6.77 正文标出旧声明形为改前形并写出现行形 ∥ §6.73 清点表 persona·Debts 行 24 条与题眼随改 ∥ §6.8 四处（中文判据 ∥ 参考译 ∥ 落点 4 两形 ∥ A8）与清点表 persona·Ledger 题眼随 `its own round` 退役改齐；§7 本批不加 D-PS 行（末行仍为 D-PS58）。

### 修正轮 2（§3 轮次 2 的 3 条 · 当轮落）

| # | §3 轮次 2 条目 | 落法 | 读数 |
|---|---|---|---|
| 1 | 🔴 同档 `its own round` 旧形与本条 A7「零残留」并立 | `docs/core/design/PROMPT-SYSTEM.md` §6.8 四处（中文判据 ∥ 参考译 ∥ 落点 4 中文终稿 ∥ 参考译 ∥ A8）与 §6.73 清点表 persona·Ledger 题眼，逐处删该项；退役项已在父侧括注裁定内，故非新语义（D11：一条规则改在每一层） | 设计档内该旧形只剩 §6.78 自己的改前围栏块与 §6.8 证据行标为「改前逐字」的那一条（后者照 §6.77 先例 · 倒查路径） |
| 2 | 🟡 A6 标称四行实判三行；写域两行无 A 项覆盖 | A6 改称「路由改后三行」；新增 A8 = 写域两行原样在场（逐字 · 各命中 1）；交付门改 A9；验收标题改 A1–A9；对照表该行注明在场由 A6 ∥ A8 判 | 命令 ④ 六串：`gate` ∥ `outside` ∥ `wd1` ∥ `wd2` 各 1；`route` ∥ `ret4` 各 0（改前侧 · 块 ②∥③ 尚未落盘） |
| 3 | 🔵 命令 ① 在块未落盘时 `slice` 得空数组 ⇒ `equal` 假绿 | 命令 ① 增 `missing` ∥ `hitsDisk` ∥ `hitsFence` 三读数，`equal` 改为三者同时成立才算过；A1 行写明这一假绿形态 | 本席实跑（块 ① 未落盘）：`hitsDisk 0 · hitsFence 1 · missing "disk" · equal false`，差异行打出 `<block not on disk>` ⇒ 红在正确的侧 |

A9 交付门本席已跑：`doc_check(mode:"gate", docs:["docs/core/design/PROMPT-SYSTEM.md"])` 首行 `DOC-CHECK GATE: PASS`。

## §3 设计评审（评审子代理）
**状态行**：评审通过



### 轮次 1（评审子代理）

| # | 严重度 | 状态 | 证据（指针） |
|---|---|---|---|
| 1 | 🔴 | 待处置 | §6.78 围栏块末行「with no such event, the fix is due now」对撞同节勘察证据行所引路由「inside ∧ large (its own round / a precondition / needs design) ⇒ book it this round」；A6 又把该括注钉成「逐字与改前相等」，对照表却写「本节不重述三个去处，不改它一字」 |
| 2 | 🟡 | 建议 | 判据行「不需要 ⇒ 没有可推的东西，当场做」漏掉路由另两闸：「must the user rule on it? Yes ⇒ ask now」与「outside ⇒ not fixed, not booked, not reported」 |
| 3 | 🟡 | 建议 | A6 的「逐字与改前相等」无改前基线；A1 的等值半边靠命令 ① 的 `l.slice(0,60)` 打印，截断后判不出整行相等 |
| 4 | 🟡 | 建议 | §6.77「`doc_check` 工具 schema 里 `target` 参数写着「Defaults to the session anchor」」与同节证据行「现行描述已无默认」同档两说；正文复现步「打开工具 schema 逐字读参数行 → 读出「Defaults to…」」已走不通 |
| 5 | 🟡 | 建议 | 两张受影响文件表都只记「已落（新节 §6.78）」，同轮对 §6.77 证据行的写入无 知会 上抛（对照 §6.77 上抛 6 ∥ §6.76 上抛 2 的写法） |
| 6 | 🟡 | 建议 | 缺 §6.73 的类② 判定行与清点表连带：清点表「persona · Debts, ledger upkeep, and the closeout sweep / 23」的条数格与题眼列未随（§6.77 上抛 6 为先例） |
| 7 | 🟡 | 建议 | §2「§1 初判的「与它相邻」在纪律层不成立」与 §6.78 上抛 1「初判落纪律层系凭记忆写就」对撞 §1「落点 = thincoder-core/prompts/persona-engineering.md」（修订式残句） |
| 8 | 🔵 | 建议 | 先例 ∥ 偏离 只给节号（§6.77 ∥ §6.76 ∥ §6.75），无前批坐标（§6.77 对应台账 #2149） |
| 9 | 🔵 | 建议 | §7 未加新行与紧前各节一致（末行 D-PS58），但未声明，读作漏 |
| 10 | 🔵 | 建议 | 用例表 C2 ∥ C4 的输入无实况引文；两分支本身来自路由原括注，非新造 |

VERDICT: changes-required

计数：🔴 1 · 🟡 6 · 🔵 3 · 合计 10

### 轮次 2（评审子代理）

上轮 10 条（1🔴 + 6🟡 + 3🔵）逐条对当前盘核过：10 条全部 Fixed（逐条证据见评审报告）。

| # | 严重度 | 状态 | 证据（指针） |
|---|---|---|---|
| 1 | 🔴 | 待处置 | 处置路由那一节的「中文 = 规范面 · 唯一副本 = 本节」仍写「写域内 ∧ 大件（要单独一轮 / 有前置条件 / 要设计）⇒ 当轮进池」，落点 4 中文终稿仍写「新债 = 要自己一轮」，其参考译与 A8 仍要旧形那行 ⇒ 1——与 §6.78 A7「全档 `its own round` ⇒ 0」两说并立；清点表「persona · Ledger」题眼亦载旧名 `A new debt is work needing its own round…`。本档自己那条「触达即全清」要求同档同类过期措辞一并收正 |
| 2 | 🟡 | 建议 | A6 标称「路由改后四行在场 · 逐字 · 唯一」，表内与命令 ④ 实判三行路由（台账行归 A7）；§6.78 表内声称「与写域句 原样保留，零改」的那两行不在任何 A 项内 |
| 3 | 🔵 | 建议 | 命令 ① 的 `a=pe.slice(i,i+5)` 在块未落盘（i = -1）时得空数组 ⇒ diff 空 ⇒ `equal: true` 与 `hits: 0` 同时成立；A1 须靠「块首行串全档命中 ⇒ 1」兜住 |

VERDICT: changes-required

计数：🔴 1 · 🟡 1 · 🔵 1 · 合计 3（上轮 10 条全部 Fixed）

### 轮次 3（评审子代理）

上轮 3 条（1🔴 + 1🟡 + 1🔵）逐条对当前盘核过：3 条全部 Fixed，未清 🔴 = 0，无新增 🔴。

| # | 严重度 | 状态 | 证据（指针） |
|---|---|---|---|
| 1 | 🔴 | Fixed | §6.8 五处旧形已删净：中文规范面「写域内 ∧ 大件（有前置条件 / 要设计）⇒ 当轮进池」∥ 参考译 `inside ∧ large (a precondition / needs design)` ∥ 落点 4 中文终稿「4. **新债 = 有前置条件 / 要设计的活儿**」∥ 其参考译 `4. **A new debt is work needing a precondition or design**` ∥ A8「扫 … ⇒ **1**」；清点表「persona · Ledger」题眼已作 `A new debt is work needing a precondition or design…`。盘内其余 `its own round` 全为退役项自身的指称 ∥ 本批块 ② ∥ 改前围栏行 ∥ §6.8 证据行标「改前逐字（本批落笔前）」那一条——无第六处活面 |
| 2 | 🟡 | Fixed | A6 改称「路由改后三行在场 · 逐字 · 唯一」并注「（三行；台账第 4 条归 A7）」；新增 A8「写域两行原样在场 · 逐字 · 零改」（`**Write domain = what this stroke may write**` ∥ `The write-domain boundary outranks both` 各命中 1 且整行相等）；交付门改 A9；验收标题 A1–A9；命令 ④ 六串 gate ∥ route ∥ outside ∥ wd1 ∥ wd2 ∥ ret4 齐备；对照表注明「原样保留，零改（三行与写域两行的在场各由 A6 ∥ A8 判）」 |
| 3 | 🔵 | Fixed | 命令 ① 增 `missing` ∥ `hitsDisk` ∥ `hitsFence` 三读数，`equal:hitP===1&&hitD===1&&diff.length===0`，块不在盘时 `a=['<block not on disk>']` 直接打红；A1 行写明空真形态「`missing` 须为 `none`」 |
| 4 | — | 判留 | §6.8 证据行「改前逐字（本批落笔前）」= 该节 A1「三条旧规则清零 · 改前各 1」的读数来源（所引三条已整条删除），属倒查证据非活指令，与块 ② ∥ 块 ③ 的改前围栏行同一处理 ⇒ 留 |

VERDICT: pass

计数：🔴 0 · 🟡 0 · 🔵 0 · 合计 0 未清（上轮 3 条全 Fixed）

### 轮次 4（评审子代理）

### 实施轮交付复审（code · target = `thincoder-core/prompts/persona-engineering.md`）

对当前盘逐项核过 §6.78 的 A1–A8：三块均已落，逐字与围栏块相等，位置钉在 `- **Why**: a debt living only in report prose` 之后、`- **A settled decision the requirements doc has not taken yet` 之前；`its own round` 全档零残留；三条探针串（`paid either way` ∥ `saves nothing` ∥ `a stale line on disk`）在 `thincoder-core/prompts/` 其余档零命中。

| # | 严重度 | 状态 | 证据（指针） |
|---|---|---|---|
| 1 | 🔵 | 建议 | 块 ① 末行「a precondition (another batch landing first), a user ruling, a design that does not exist yet」把「等用户裁定」列为可等事件，而同档处置路由首闸「must the user rule on it? Yes ⇒ ask now: never start the work, never book it」要求当场提问、不记账；两处动作相容（等的对象是裁定，动作是当场问），但并读可被读成「等在裁定上 ⇒ 可以挂账」。文本是设计档围栏块逐字终稿，实施席无权改，记录备查 |

VERDICT: pass

计数：🔴 0 · 🟡 0 · 🔵 1 · 合计 1（无未清 🔴；A9 交付门本轮无命令通道，未复跑，未据此签发任何读数）

## §4 用户批准（主 agent）

### 用户批准

- **批准形 = 用户指令**：22:33「**挂账不省评审这事儿你记着也没用啊，不进提示词，以后还是记不住。**」——**这是对"落进提示词"的明确要求**；22:35「**直接跑完吧**」= 整批令，覆盖批内全链。
- **父侧裁定（三处）**：① 落点 = `thincoder-core/prompts/persona-engineering.md` 的处置路由之后（**判挂账的人读的就是那一格**）；② 逐字文本由设计席出、父侧只给方向与边界；③ **不把「挂账」一刀切禁掉**——等别批 ∥ 等用户裁定 ∥ 等不存在的设计，这三种仍是合法挂账，本批只删「因为要重走评审」那一种。
- **设计评审三轮**：轮 1 `changes-required`（1 🔴 + 6 🟡 + 3 🔵）→ 修正 → 轮 2 `changes-required`（**评审抓出"退役只改到提示词面，设计档自己的规范面、参考译、`A8`、清点表另一行仍载旧形"**）→ 修正 → 轮 3 `pass`。
- **轮 2 那条 🔴 是这批最值钱的发现**：`A8`（旧，要求旧串 ⇒ 1）与 `A7`（新，要求 ⇒ 0）**两条活验收在同一档里互相排斥**；根因是把一条规则从一处改掉、设计档自己的另几处还留着。**「一条规则改在每一层」不是口号，是这一轮修的东西。**
- **实施一轮过**：内部背离审计 `DIVERGENCE: none` ∥ 代码评审 `pass`（🔴 0 · 🟡 0 · 🔵 1）；父侧复量十一项读数全对（见 `§6`）。

## §5 实施记录（eng-coder）
**状态行**：实施完成（三块同轮落 · 验收 A1–A9 全跑 · 审计与评审各 1 轮无 🔴）



### 实施轮（eng-coder · 2026-11-07）

**落点 = `thincoder-core/prompts/persona-engineering.md` 一档**（声明域内的唯一文件）。出列表改动 = 0；`thincoder-core/prompts/discipline-engineering.md` ∥ `thincoder-core/prompts/common.md` ∥ 设计档 ∥ 源码 ∥ `test/**` 零触。

#### 三块落盘（改前 → 改后）

| # | 位置 | 改前 | 改后 |
|---|---|---|---|
| 块 ① | `### Debts, ledger upkeep, and the closeout sweep` 节内，处置路由 `- **Why**: a debt living only in report prose…` 行之后、下一条 bullet `- **A settled decision…` 之前 | 无（新增） | 新增一条 bullet + 四行续行 = 5 行，逐字同设计档围栏块 ① |
| 块 ② | 同节处置路由第二行（`It is work ⇒ judge the write domain…`）整行换写 | 括注 `inside ∧ large (its own round / a precondition / needs design)` | 括注 `inside ∧ large (a precondition / needs design)` |
| 块 ③ | 同档台账生命周期第 4 条整行换写 | `4. **A new debt is work needing its own round, a precondition, or design**` | `4. **A new debt is work needing a precondition or design**` |

块 ② ∥ 块 ③ 各只删括注一项，行内其余字一字未动（写域两行由 A8 判在场与整行相等）。块 ① 的行序、两空格续行缩进、直引号与长破折号，全部照 §6.78 围栏块落笔，未润色。

#### 验收读数（实跑 · 命令取设计档 §6.78 围栏内的 `node -e` 原文，逐字执行，未改写）

```text
===== 命令 ①（A1 整行比对：块 ① 5 行 vs 围栏块）=====
{ hitsDisk: 1, hitsFence: 1, missing: 'none', equal: true, diff: [] }

===== 命令 ②（A3 删词 ∥ A5 行宽·语言·引用）=====
{ lines: 5, banned: 0, maxLen: 261, cjk: 0, refs: 0 }

===== 命令 ③（A4 零外溢：其余 16 档三探针串）=====
offSpill 0

===== 命令 ④（A6 ∥ A7 ∥ A8：六个串各期望 1，末项期望 0）=====
gate 1
route 1
outside 1
wd1 1
wd2 1
ret4 1
itsOwnRound 0
```

```text
A2 位置读数 = { whyLine: 213, blockFirstLine: 214, settledLine: 219, immediatelyAfterWhy: true, beforeSettled: true }
标题计数零改 = { h2: 18, h3: 5 }（与设计档上抛 3 一致）
全档行数 = 495 → 500（净增 5，等于块 ① 行数；块 ② ∥ 块 ③ 为同额换行）

A9 交付门 = doc_check(mode:"gate", docs:["docs/core/design/PROMPT-SYSTEM.md", "thincoder-core/prompts/persona-engineering.md"])
       首行 = DOC-CHECK GATE: PASS · 结论行 = 0 段有问题（2 档全清）
```

**`its own round` 改后计数 = 0**（改前 = 2：路由括注 ∥ 台账第 4 条；扫描域 = 该档全档，D14）。

#### 内部审计与代码评审

| 环节 | 轮次 | 结论 |
|---|---|---|
| 内部背离审计（只读 explore） | 1 | DIVERGENCE: none —— 三块逐字、位置、零外溢、零残留四类全无；该席无命令通道，属读面核对，实跑读数以上节为准 |
| 内部代码评审（code） | 1 | VERDICT: pass · 🔴 0 · 🟡 0 · 🔵 1 —— 该条为设计档围栏块逐字终稿面的读法提示（块 ① 末行的 `a user ruling` 与处置路由首闸并读），实施席无权改，结论已落批档 §3 轮次 4 |
| 自修正轮 | 0 | 无待修项（审计与评审均无 🔴） |
| 终止态 | — | clean |

#### 交付覆盖（§2 五个覆盖条目）

| # | §2 条目 | 状态 | 读数 |
|---|---|---|---|
| 1 | 道理进提示词（块 ①） | ✅ Done | 命令 ① `equal: true` ∥ `missing: none` |
| 2 | 与处置路由相邻，同条判据其余两处同轮对齐（块 ② ∥ 块 ③） | ✅ Done | A2 位置读数 ∥ 命令 ④ `route 1` ∥ `ret4 1` |
| 3 | 因果形 · 零禁令词 · 每行 ≤300 字符 | ✅ Done | 命令 ② `banned 0` ∥ `maxLen 261` ∥ `cjk 0` |
| 4 | 零外溢 | ✅ Done | 命令 ③ `offSpill 0` |
| 5 | 可等的对象只剩事件（`its own round` 退役 · 零残留）· 交付门 | ✅ Done | 命令 ④ `itsOwnRound 0` ∥ A9 首行 `PASS` |

#### 测试面

单测文件 = 0 · 集成用例 = none —— 依据 `docs/core/design/PROMPT-SYSTEM.md` §6.78「集成测试设计」：改动面 = 一档提示词增列 5 行 + 两处换行，零代码面，两条入口均不成立（无既有用例断言提示词文本；「模型是否不再以评审价挂账」从业务入口复现不出可机判结果）。

#### 未决项

无。上抛 = 0（无 `[上抛·待裁]` 项）。

## §6 验证与收口（父代理）

### 验证与收口（父侧独立复量）

| 验收 | 量法 | 父侧读数 |
|---|---|---|
| **`A7` 退役项零残留** | 该档全档数 `its own round` | **0**（改前 2） |
| **`A6` 路由改后行** | 数 `inside ∧ large (a precondition / needs design)` | **1**；旧括注残 **0** |
| **`A7` 台账第 4 条** | 数改后形 | **1** |
| **`A8` 写域两行零改** | 两串各数一次 | **1 ∥ 1** |
| **`A1` 块 ① 在场且逐行** | 首行计数 + 五行行宽 | **1**；`154,139,170,170,261` |
| **`A3` 禁词** | 五行扫 `must∥shall∥should∥never∥always∥forbidden∥required to∥do not∥don't` | **0** |
| **`A5` 汉字 ∥ 文档引用** | 五行扫 | **0 ∥ 0** |
| **`A2` 位置** | 块 ① 首行是否紧随处置路由的 `Why` 行 | **是**（紧随其后一行） |

**这批存在的理由**

用户 22:33 的原话：「**挂账不省评审这事儿你记着也没用啊，不进提示词，以后还是记不住。**」

**当日实况**：我在会话里三次认「挂账不省评审」，三次都是人工记着——**规则不在提示词层，就没有留存**。而「攒」之所以每次都赢，不是不知道该怎么做（处置路由早就写着小形项就地修），**是它在攒的那一秒看起来便宜**。

**落地的这条讲的就是那个账**：现在改 = 一次修正轮 + 一次评审；挂账改 = **同一次修正轮 + 同一次评审，只是推迟**，再加盘上一段假话与一条要多养一次的行。**一分不省，还多两样。**

**并且 `its own round` 从原因列删掉了**——它是**成本**，不是**事件**；成本早晚要付，只有事件才说得上「现在做不了」。

**两处披露**

- **`§6.8` 的证据行保留改前引文**（设计评审判定）：所引三条已整条删除、不可能是现行副本，且它是该节 `A1`「改前各 1」的唯一读数来源。**判据是「倒查证据还是活指令」，不是「它看起来像旧文」。**
- **代码评审那条 🔵 记录在案**：块 ① 末行把 `a user ruling` 列入可等事件，与处置路由首闸「当场提问、不记账」并读时可被读成「等在裁定上 ⇒ 可挂账」。**文本是设计档逐字终稿，实施席无权改；本批不动，留作下一轮观察。**

**这批的教训（写进本节，因为它是本批的起因）**

同一句话说三遍不等于落盘——**它在会话里，下个会话就没有了**。一个规则要生效，得住在读的那个模型的上下文里。

**收口**

- 台账 `#2153`：**在途 → 待核销 → 已核销**。
