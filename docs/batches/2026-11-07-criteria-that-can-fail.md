# 2026-11-07 · criteria-that-can-fail
> 六段，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 每段只有一个作者：作者的段可 `append` 加内容、可就地改（`edit`）；非作者一概拒。
> 编制：主 agent · 2026-11-07 · 来源 = 台账 #2154；用户 2026-11-07 22:46 提案「判据必须能失败」。
> 台账 = #2154（core · 归批）。前情 = 无（独立批）。
## §1 讨论（主 agent）
**状态行**：已收口 2026-11-07
<§1 模板占位：本批条目 / 关键判据 / 授权口径>

### 需求：提示词约束「判据本身能不能失败」

**用户 22:46 原话**：「**提示词现在约束了业务门，但没有约束判据本身能不能失败。结果是：一条判据看起来在验，实际永远只会输出同一个读数，验不了任何东西。**」

**当日实测 9 次**：**8 次评审发现 · 1 次设计席自查 · 0 次按规则查出**。

### 为什么这条是今天最贵的一条

**判据永远绿，比没有判据更坏**——它让人**以为验过了**。今天每一批的收口都报了 `PASS`，而其中的判据有多少真的能红，**没有任何机制问过**。

### 四种形状（实测，按频次）

| # | 形状 | 今日实例 |
|---|---|---|
| 1 | **域里含必然命中物** | 全仓检索「双向同步」零命中——可设计档不写出这句就没法描述删了什么 |
| 2 | **命令恒不命中** | CRLF 下 `^…$` 撞 `\r` 恒 0；BRE 下 `(a|b)` 是字面量；cwd 不在仓根 |
| 3 | **口径不唯一** | 同一命令按行 ∥ 按出现 ∥ 去重 = 三个数；「3 命中」没说哪种 |
| 4 | **空范围报通过** | 判 0 个对象仍 `PASS` |

### 父侧补的一条（不在用户提案里，我加的）

**「改前跑一次」必须记成读数，不是记成句子。**

否则「我在不通过那侧跑过一次，是红的」——**这本身就是一条无法失败的判据**。**改前读数要留在记录里（命令 + 输出），与改后期望并列，两者相同 ⇒ 它不是判据。**

**这条是用户提案的执行面**：提案说「改前跑一次」，我补的是「跑出来的那个数必须落到记录上」，**否则同样的形状会从判据挪到叙述里**。

### 落点（父侧定）

- **纪律层两面都放**：`thincoder-core/prompts/discipline-engineering.md` ∥ `thincoder-core/prompts/common.md`——**它约束「怎么写判据」，与角色无关**（用户 §3.1 同判）。
- **不放 persona 层**：判据是写给人看的工作产物，不是某个角色的身份。

### 边界

- **不动**「文档名全路径」规则——**用户明说它今天拦住两次、两次都判得对**，是执行没到位，不是判据有错。
- **工具的 0 档 `PASS` 不在本批**：那是代码层（已挂 `#2155`），本批只落提示词。**提示词管写法，管不了工具把空集判绿。**
- 不改 `doc_check` 代码 ∥ 不动源码 ∥ 不动 `test/**`。

### 验收（这条改动自己也得能红）

用用户给的 9 条做回归：全仓零命中的必然命中物 ∥ CRLF 恒 0 ∥ 未定口径的多解计数 ∥ 空范围 `PASS` —— **四条都必须被拦下**；正常判据（定向命令 + 明确口径 + 改前能读到红）**放行**。

**九条仍被放过 ⇒ 这条提示词也只是又一堵墙**（用户原话）。

### 库外 = B 类

改动面 = `thincoder-core/prompts/**`（纯文本）；**外部断言 = 零**。

## §2 批次任务与设计（eng-designer）
**状态行**：设计完成（修正轮 2：评审第 2 轮 17 行逐条处置——🔴6 C3∥C4 问号改 Q2 ∥ 🟡14 §6.78 先例行对齐 D10（余三处同上抛）∥ 🟡15 A4 说明段移表后（八行连续成表）∥ 🟡16 C 表题名改「拦下 8 · 放行 1」∥ 🔵17 形 1 分项改关系式）
<§2 模板占位：本批条目（覆盖） / 设计档落点 / 机制设计 / 受影响文件与测试覆盖 / 验收对照 / 关键决策 / 上抛项>

### 本批条目（覆盖）

| # | 条目 | 判据面 |
|---|---|---|
| 1 | **判据必须能失败**：四问 + 四形，落提示词两处 | `docs/core/design/PROMPT-SYSTEM.md` §6.79 的 A 表（A1–A8）与 C 表（C1–C9） |

**不在本批**（逐条给理由）：

- `doc_check` 判 0 档仍 `PASS` —— **代码层**，本批只落提示词（批档 §1「边界」明令）。
- **文档名全路径规则零改** —— 用户原话：它今天拦住两次、两次都判得对，是执行没到位（批档 §1「边界」）。
- `thincoder-core/prompts/**` **本设计轮零笔** —— 实施轮由 eng-coder 依两块逐字落（提示词 = 产品代码面）。
- **普通模式提示词零改** —— 判据写法与角色无关，故落公共层（`thincoder-core/prompts/common.md`）而不是普通模式纪律档；公共层两模式同读。
- 源码 ∥ `test/**` ∥ `doc_check` 判据 —— 零触。

### 设计档落点

`docs/core/design/PROMPT-SYSTEM.md` **§6.79 判据必须能失败：读数要先能红**（新节，接 §6.78 之后）。

逐字两块（唯一权威目标形住该节围栏块，本段不复制）：

| 块 | 落点档 | 落点位置 |
|---|---|---|
| 块 ① | `thincoder-core/prompts/common.md` | 「Evidence discipline」节末（`This rule reaches no further than those five…` 行之后、「Business gates」节标题之前） |
| 块 ② | `thincoder-core/prompts/discipline-engineering.md` | 「Testing discipline」节末（「业务门要有失败用例」条之后、「Doc discipline」节标题之前） |

### 机制设计（摘要 · 单源住设计档该节）

**四问（按序问，任一问不合 ⇒ 这条判据不成立）**：

1. **不通过那侧是哪一侧** —— 先说出来（改前的状态 ∥ 本该被拒的输入 ∥ 还不存在的那一行）。
2. **改前在那侧跑过没有** —— **读数是命令 + 输出，不是句子**；父侧补的这一条，是本批的执行面。
3. **改前就绿** ⇒ **判据作废、重写** —— 它改后也只会打出同一个数，收口时那个绿不是挣来的。
4. **判了 0 个对象** ⇒ **空范围不算通过** —— 域没定死时，判据答的是措辞不是事实。

**四形（今日实测，各带实例）**：域含必然命中物 ∥ 命令恒不命中 ∥ 口径不唯一 ∥ 空范围报通过。

**与 D12 的关系**：D12 管「读数是命令输出，不转写」——它让数字诚实；**本批新增的是「这条读数能不能为红」**——同一个数永远不变时，D12 守得住格式，守不住它验了什么。

### 受影响文件与测试覆盖

| 档 | 面 | 归谁 |
|---|---|---|
| `docs/core/design/PROMPT-SYSTEM.md` | 文档面（设计） | 本席（新增节 §6.79 + §6.73 清点表「discipline · Testing discipline」行随改：条数 +1、新条名入枚举） |
| `thincoder-core/prompts/common.md` | 产品代码面（提示词 = 运行期面） | 实施轮 eng-coder（块 ①） |
| `thincoder-core/prompts/discipline-engineering.md` | 产品代码面（提示词 = 运行期面） | 实施轮 eng-coder（块 ②） |
| 测试档 | — | **0**（零代码面） |

**分层结论 = 无档跨分层**：档位线只量代码面；`.md` 提示词档免档位判定，运行期代码零改。

### 验收对照（回指设计档该节 A 表）

| 回指 | 判据 | 读数落在 |
|---|---|---|
| A1 | 两块落盘且与围栏块逐行相等 | 该节命令 ① |
| A3 ∥ A5 | 删词零命中 ∥ 行宽 ≤300 ∥ 零汉字 ∥ 零文档引用 | 该节命令 ② |
| A4 | 零外溢 + 两块不互抄（单源 D2） | 该节命令 ③ |
| A6 | 四问四形在场（探针串各 1） | 该节命令 ④ |
| **A7** | **回归读数（五腿 · 六条读数）**：形 1–4 各读出一条「不能为红」，正常判据两侧读出两个不同的数 | 该节命令 ⑤ + 形 2 的 `findstr` ∥ `node` 对读 + 一次 `doc_check`（形 4）；每腿读期望见该节「A7 五腿」表 |
| A8 | 交付门首行 `PASS`，**三档全列**（本档 + 两块落地档） | `doc_check(mode:"gate", docs:[该三档])` |

**C 表 ≠ 那九条的一一对应**：九条实测（8 条评审发现 + 1 条设计席自查）是输入，C1–C9 是形状归并（拦下 7 ∥ 放行 1 ∥ 叙述形 1）。可机跑的五例（C2 ∥ C5 ∥ C6 ∥ C7 ∥ C8）归 A7 五腿；C1 ∥ C3 ∥ C4 由形 1 ∥ 形 2 两腿代表；C9 无读数，由 A6 的 `recorded, not narrated` 探针在场判。

### 关键决策

| # | 决策 | 理由 |
|---|---|---|
| K1 | 块 ① 落公共层「Evidence discipline」节末 | 判据写法与角色无关；该节恰是「什么算验过」的那一节，一条不能为红的读数在那里最刺眼 |
| K2 | 块 ② 落工程纪律层「Testing discipline」节末 | 验收判据的写作点在那里；紧接「业务门要有失败用例」条——同一根轴（快乐路径不证明门存在），一条是用例面、一条是判据面 |
| K3 | 因果形、零禁令词、讲账不讲纪律 | 同族先例（`#2145` ∥ `#2149` ∥ `#2153`）：禁令回答「允许不允许」，模型不缺许可，缺的是「这个数永远不变说明什么」那一笔账 |
| K4 | 两块各承一面，不互抄 | 公共层承「读数」面（四形 + 改前读数要落成读数），工程纪律层承「判据」面（四问 + 作废重写）；跨档探针串互扫为 0（A4） |
| K5 | 本批自己的验收也按「改前跑一次」写 | 四形的「不能为红」不是断言而是读数：本席已跑（读数在批档 §2 末的回归读数块），实施轮 ∥ 父侧复跑 |

### 回归读数（本席实跑 · 落盘后重取 · 数在输出里，不在句子里）

四形各一条「不能为红」加正常判据两侧两读数 = **A7 的六条改前读数**；每条的**判域写死**，实施轮照跑同一组命令。

| 腿 | 判域（写死） | 读数 |
|---|---|---|
| 形 1 换域 | 同一串 `Letting one expire voids that authorization`（§6.73.1 类① 题眼格）在**全仓** ∥ 在 `thincoder-core/prompts/` | 全仓数 > 提示词域数（= 0），差额全落文档面（本档 ∥ 批档 ∥ `.thincoder/tmp` 若干处——**分项不点数目**：仓内每新增一处描述这次删除，分项即过期，写死它就成了下一轮的假话；可复跑的是关系式）⇒ 全仓那个数由文档的措辞给，判不了「删净没有」 |
| 形 2 仪器坏 | 同一文件同一串，本机 `findstr /c:"机制面"` ∥ `node` 计数 | `findstr` 0 行 ∥ `node` 27 处——读数由仪器定，与事实无关。本机 cwd = `D:\teamcode`（仓根是 `D:\teamcode\thincoder`），是本形第二例 |
| 形 3 三口径 | 同一串在 `thincoder-core/prompts/discipline-engineering.md` | 按行 3 ∥ 按出现 4 ∥ 去重 3——「3 命中」有两个答案 |
| 形 4 空范围 | `doc_check` 对一个不在盘的档 | 首行 `PASS`（0 档）——判了 0 档仍报通过（代码层，本批零触；缺陷修掉后本腿读数反转，见该节「A7 五腿」表） |
| 正常（C8） | `A business gate ships with its failure case` 在两档各计数 | 工程纪律档 1 ∥ 公共层 0——两侧两读数，**这条能红** |

**A5 ∥ A3 ∥ A6 的改前读数（对象 = 该节围栏块；命令 ⑥ 实跑）**：块 ① = 6 行 · 禁词 0 · 最长行 246 · 汉字 0 · 文档引用 0；块 ② = 3 行 · 禁词 0 · 最长行 278 · 汉字 0 · 文档引用 0；九条探针各 1（分块计）。

**落地档的守卫读数（命令 ① ∥ ②，实施轮开工前）**：两档均 `missing: 'disk'` ∥ `missing: true` ⇒ **判红**。旧版命令的漏洞正在这里：无守卫时空 slice 给出 `banned: 0` ∥ `maxLen: -Infinity`，与 A3 的期望「各 0」同形，空范围被读成通过。

### 集成测试设计

`none` —— 改动面 = 两档提示词各增列一段 + 设计档一节，零代码面。

两条入口均不成立：① 不改任何既有用例断言的业务可观察结果（`test/RTM.md` 故事索引表逐行标题看过，无一行断言提示词文本或其等价性）；② 未新增业务上真需要的场景——「模型下一次写判据时会不会问那四问」从业务入口复现不出可机判结果，能机判的只有四形的读数与文本等价（A1–A8）。⇒ 破行 0 · 冗余 0 · 新增 0。

### 边界（本段不做）

- 不落 `thincoder-core/prompts/**`（实施席笔）；不改源码 ∥ `test/**` ∥ `doc_check` 判据。
- 不动文档名全路径规则；不动 `doc_check` 的 0 档 `PASS`（代码层）。
- 不在批档 §1 ∥ §3 ∥ §5 落笔。
- 本段不动 `thincoder-core/prompts/**`（实施席笔）；`docs/core/design/PROMPT-SYSTEM.md` 的落笔面 = 新增 §6.79 + §6.73 清点表那一行，其余旧行不动。

### 上抛项

1. 〔已裁 · 已落盘〕`docs/core/design/PROMPT-SYSTEM.md` §6.79 已落盘，§6.73 清点表「discipline · Testing discipline」行同改（条数 +1、新条名入枚举）；本段对它的 `§` 引用即此节号。
2. 〔知会 · 计数连带〕两块均为**节末增列**：`thincoder-core/prompts/common.md` 零 `##` 块计数连带（新段在 Evidence discipline 节内）；`thincoder-core/prompts/discipline-engineering.md` 同为零连带。
3. 〔知会 · 新名注册〕本条新名 = `A reading that can only come out one way has verified nothing`（公共层）/ `A criterion earns its place by being able to fail`（工程纪律层）；两面各承自己面的形，机制正文单源住设计档该节（D2）。

## §3 设计评审（评审子代理）
**状态行**：评审通过



### 轮次 1（评审子代理）

**设计评审（首轮）结论表 · 对象 = `docs/core/design/PROMPT-SYSTEM.md` §6.79 ∥ 本档 §2**

| # | 严重度 | 状态 | 证据（指针） |
|---|---|---|---|
| 1 | 🔴 | 待修 | A7 的形 1 改前读数不可复跑：本档 §2 回归读数块记「窄串 3 ∥ 带前缀串 2」；本评审实读现盘同两串 = 8 ∥ 4，差额四处全在 §6.79 自身（四形表「形 1」行同时引两串 · C2 行引窄串 · 「命令 ⑤」正文含两串字面）⇒ 判据串的域含自己的答案，正是形 1 |
| 2 | 🔴 | 待修 | A3 的「本席已跑」是空范围读数：「命令 ②」无 `i<0` 守卫，块未落盘时得 `lines: 0` ∥ `banned: 0` ∥ `maxLen: -Infinity`，而 A3 的期望恰是「各 0」；同档 §6.78 的 A1 已写明「块不在盘时 `slice` 得空数组、`diff` 也为空，`equal` 会假绿」并加 `missing` 守卫 |
| 3 | 🟡 | 建议 | A7 题名「**九条回归**」而期望只写「四形各读出「不能为红」，正常判据读出两侧两读数」= 五读数；C9（叙述形）无读数无跑者，§6.79 自述该条「在用户提案之外」；本档 §2 的「九条回归对应用户的 8 条评审发现 + 1 条设计席自查」与 C 表构成（七拦下 + 放行 + 叙述）不符 |
| 4 | 🟡 | 建议 | A8 判域只列 `docs/core/design/PROMPT-SYSTEM.md`，本批落地档另有两档；同档 §6.76 的 A8 逐字「门只判 `docs` 列出的档，漏了它，这轮改的档根本不受判」，紧邻的 §6.78 A9 已列两档 |
| 5 | 🟡 | 建议 | A7 的形 4 腿依赖待修缺陷（`doc_check` 交付门对 0 档受检仍出首行 `PASS（0 档）`，代码层另有归属）；A7 未写该腿的读期望，也未写该缺陷修掉后该腿如何重取 |
| 6 | 🟡 | 建议 | 形 2 一律归「Q3」，而 Q3 内容为「改前跑不了（域 ∥ 口径没定死）」、处置是定域与口径；C3 ∥ C4 的理由（`\r` 顶行尾 ∥ 方言把替换符读成字面量）是仪器坏，不是域没定死——真正拦下它的是 Q2 |
| 7 | 🟡 | 建议 | 形 1 括注「（判据串自带答案）」把两个相反方向并成一个名（必然命中 ∥ 因措辞而恒不命中）；块 ① 操作句「so two characters decide green or red」盖住后者，表内名与 A6 的单探针不区分两向 |
| 8 | 🟡 | 建议 | 边界「不改既有 4 条以外的任何旧行」的「4 条」无前指（对照表列出六条既有句）；K6「只动两块所在的两处，不动既有行」与「唯一随本节同改的既有行 = §6.73 清点表…」相反；排队的修正轮只写作「那批」，未给可追坐标 |
| 9 | 🟡 | 建议 | 「验收冲突时的判准」第三条「两行钉同一个量且判域重叠 ⇒ 后写的一行不动，收口当轮记录该差异」：结果留两行相反的活判据且不说收口按哪一行读；「不动」又与第二条（清点表当轮状态随改）方向相反 |
| 10 | 🟡 | 建议 | A4 的「不互抄」判法 = 两条字面跨档互扫（`has verified nothing` ∥ `earns its place`）；同义改写可全绿，故它判不到「公共层不写四问的处置 ∥ 工程纪律层不重复四形」这一实质面 |
| 11 | 🟡 | 建议 | 先例 ∥ 偏离 只给节号（§6.77 ∥ §6.78 ∥ §6.42）；§6.78 自己的先例行带了「前批坐标 = 台账 `#2149`，批档 `docs/batches/2026-11-07-parameter-zero-defaults.md`」并显式声明另两条「节内无台账号可引…不是漏」，本节两者皆缺 |
| 12 | 🟡 | 建议 | 记录态与盘上状态相反：§2 边界说设计档「在父侧 release 之前零笔」，上抛 1 说「〔已裁 · 落盘完成〕… 已落盘（父侧 release 后落）」，而 `docs/core/design/PROMPT-SYSTEM.md` 的 §6.79 与 §6.73 清点表该行皆已在；§2 受影响文件表只写「（新增节）」未载 §6.73 连带 |
| 13 | 🔵 | 知会 | A5 ∥ A6 的结果已被本节围栏块完全决定（行宽 / 汉字 / 文档引用 / 九串各 1），跑者仍写「实施轮」——本节自己的规矩（改前读数落记录）在这两条上没有落地读数 |

计数：🔴 2 · 🟡 10 · 🔵 1（共 13 条）。未判项：A2 两条锚句在 `thincoder-core/prompts/common.md` 与 `thincoder-core/prompts/discipline-engineering.md` 的在场、A7 的形 3 读数、`test/RTM.md` 的故事索引 —— 均在本轮评审判域之外，未读，按未验处理。

VERDICT: changes-required

### 轮次 2（评审子代理）

**设计评审（第 2 轮 · 只验上轮 13 条 + 新增）· 对象 = `docs/core/design/PROMPT-SYSTEM.md` §6.79 ∥ 本档 §2**

| # | 严重度 | 状态 | 证据（指针） |
|---|---|---|---|
| 1 | 🔴 | 已修 | A7 形 1 换域：判域写死 `thincoder-core/prompts/`，读期望写成关系「全仓数 > 提示词域数，差额全落在文档面」，并给失效条件「两域相等 ⇒ 本腿证物失效，换串重取」；「本档 3」经本轮实扫相符（§6.73.1 类① 行 ∥ A7 五腿形 1 行 ∥ 「命令 ⑤」的 X 字面），提示词域零命中 ⇒ 域不再含本节自引 |
| 2 | 🔴 | 已修 | 「命令 ②」有 `if(i<0){console.log(n,{missing:true,banned:'red — an empty slice would have read as 0'});continue}`；「命令 ①」有 `const miss=(i<0?'disk':'')+(j<0?'fence':'')` 与 `equal:i>=0&&j>=0&&`；A3 期望列自陈「空 slice 会给 `banned:0` ∥ `maxLen:-Infinity`…空范围会被读成通过」；§2 记开工前实测 `missing: 'disk'` ∥ `missing: true` ⇒ 判红 |
| 3 | 🟡 | 已修 | A7 题名改为「回归读数（五腿 · 六条读数）」；C9 有判者（「C9 无读数，由 A6 的 `recorded, not narrated` 探针在场判」）；C 表与九条的关系被显式否认一一对应（「**不是 9 = 8 + 1 的逐条对应**」+ 本档 §2「C 表 ≠ 那九条的一一对应」） |
| 4 | 🟡 | 已修 | A8 标题「交付门（**三档全列**）」，`docs` 列三档齐 |
| 5 | 🟡 | 已修 | 形 4 腿给出读期望与改判条件（「该代码层缺陷修掉之后本腿读数反转（首行变 `REFUSED` ∥ `ERROR`），届时本腿改判「空范围会红」」），上抛项 4 同载 |
| 6 | 🔴 | **未修** | 同一机制两处相反：四形表 2 行写「C3 ∥ C4 归 Q2（仪器坏 ⇒ 改前 ∥ 改后都读 0，这条判据从没红过，定域治不了它）」，而 C 表两格仍写「拦下（Q3）：`\r` 顶在行尾，该模式永远 0」∥「拦下（Q3）：用的方言里那是字面量」——处置一支是作废重写、一支是定域与口径；本节判准自己写「不留两行相反的活判据」 |
| 7 | 🟡 | 已修 | 形 1 名已分两向（「两向：必然命中 ∥ 因措辞而恒不命中」+ 正向 ∥ 反向实例）+「形 1 两向的名不同、处置相同」段 |
| 8 | 🟡 | 已修 | 边界改「不改两处落点与 §6.73 清点表那一行以外的任何旧行」；K6 与「唯一随本节改的既有行」同口径 |
| 9 | 🟡 | 已修 | 判准第三条改为「收口只读判域为「当刻状态」的那一行」+「不留两行相反的活判据」 |
| 10 | 🟡 | 已修 | A4 标题「零外溢（只承字面外溢）」+「**A4 判不到的那一面，谁判**」段（实质面归 A1 逐行相等 ∥ 评审人读判） |
| 11 | 🟡 | 已裁 · 不采纳成立 | D10 在档内可核：§7 的 D-PS16 行写「D10 **过程面坐标不进交付物**」，§6.73 清点表写 `D10 process-plane coordinates stay out of deliverables`；本节「**前批坐标：本节不给台账行号与批档路径，不是漏**」+ 理由（「一份要活很久的档指着一个会被清理的载体，指针先死、理由跟着死」）⇒ 上轮要的显式声明已给 |
| 12 | 🟡 | 已修 | 本档 §2 的「零笔」句已不存在；上抛 1 改「〔已裁 · 已落盘〕… 已落盘，§6.73 清点表…同改」；受影响文件表载「新增节 §6.79 + §6.73 清点表「discipline · Testing discipline」行随改」 |
| 13 | 🔵 | 已修 | 「命令 ⑥」以围栏块取数，A3 ∥ A5 ∥ A6 的改前读数落本档 §2（块 ① 6 行 ∥ 块 ② 3 行 · 禁词 0 · 汉字 0 · 文档引用 0 · 九串各 1）；本轮按围栏块复核行数、九串各 1、禁词 0、汉字 0、引用 0 相符 |
| 14 | 🟡 | 新增 · 同页两说 | §6.78 先例行带「前批坐标 = 台账 `#2149`，批档 `docs/batches/2026-11-07-parameter-zero-defaults.md`」，而紧邻 §6.79 判 D10 不许这两样进规范面 ⇒ 同一字段两套约定并存，须择一 |
| 15 | 🟡 | 新增 · 表被切断 | 「**A4 判不到的那一面，谁判**」段落坐在 A4 行与 `A5` 行之间，A5–A8 从「验收（A1–A8 · 每行带跑者）」表头下脱开 |
| 16 | 🟡 | 新增 · 题名与正文两说 | C 表题名「用例表 C1–C9（九条实测按形状归并 = 九个判例：拦下 7 ∥ 放行 1 ∥ 叙述形 1）」而紧邻段写「**不是 9 = 8 + 1 的逐条对应**，放行（C8）本就不是那九条之一」 |
| 17 | 🔵 | 新增 · 分项数 | 本档 §2 形 1 读数「全仓 6 ∥ 提示词域 0，差 6 全落文档面（本档 3 · 批档 1 · `.thincoder/tmp` 2）」只记一档批档；本轮实扫 `docs/batches/2026-11-06-engineering-mode-purpose.md` 亦含该串一处 ⇒ 分项不可复跑（关系「全仓 > 提示词域」仍立） |

计数：🔴 3（2 已修 · 1 未修）· 🟡 12（9 已修/已裁 · 3 新增）· 🔵 2（1 已修 · 1 新增）· 共 17 行（上轮 13 + 新增 4）。未判项（本轮评审判域之外，未读未跑，按未验处理）：A2 两条锚句在 `thincoder-core/prompts/common.md` 与 `thincoder-core/prompts/discipline-engineering.md` 的在场、A7 的形 2 与形 3 腿读数、`test/RTM.md` 故事索引。

VERDICT: changes-required

### 轮次 3（评审子代理）

**设计评审（第 3 轮 · 只验上轮 17 行）· 对象 = `docs/core/design/PROMPT-SYSTEM.md` §6.79 ∥ 本档 §2**

| # | 严重度 | 状态 | 证据（指针） |
|---|---|---|---|
| 1 | 🔴 | 已修 | A7 形 1 换域：判域写死 `thincoder-core/prompts/`，读期望「全仓数 > 提示词域数，差额全落在文档面」+ 失效条件「两域相等 ⇒ 本腿证物失效，换串重取」；本档该串本轮实读 3 处（清点表 §6.73.1 类① 行 ∥ A7 五腿形 1 行 ∥ 「命令 ⑤」的 `const X = `），与「本档 3」相符，提示词域零命中 ⇒ 域不再含本节自引 |
| 2 | 🔴 | 已修 | 「命令 ②」有 `if(i<0){console.log(n,{missing:true,banned:'red — an empty slice would have read as 0'});continue}`；A3 期望列自陈空 slice 会被读成通过；本档 §2 守卫读数「两档均 `missing: 'disk'` ∥ `missing: true` ⇒ **判红**」 |
| 3 | 🟡 | 已修 | A7 题名「**回归读数（五腿 · 六条读数）**」；C9 判者「C9 无读数，由 A6 的 `recorded, not narrated` 探针在场判」 |
| 4 | 🟡 | 已修 | A8「交付门（**三档全列**）」，`docs` 列三档齐 |
| 5 | 🟡 | 已修 | 形 4 腿「该代码层缺陷修掉之后本腿读数反转…届时本腿改判「空范围会红」」，上抛项同载 |
| 6 | 🔴 | 已修 | C3 ∥ C4 两格已改「拦下（Q2）」，与四形表「C3 ∥ C4 归 Q2（仪器坏 ⇒ 改前 ∥ 改后都读 0，这条判据从没红过，定域治不了它）；C5 归 Q3（域没定死，定域就治得了）」逐项对齐。九行问号本轮自核：C1 Q1 ∥ C2 Q1∥Q2 ∥ C3 Q2 ∥ C4 Q2 ∥ C5 Q3 ∥ C6 Q3 ∥ C7 Q4 ∥ C8 放行 ∥ C9 无问号——C9 是叙述形，依据「父侧补的一条」段而非某一问，不构成第三说 |
| 7 | 🟡 | 已修 | 形 1 名已分两向「两向：必然命中 ∥ 因措辞而恒不命中」+「形 1 两向的名不同、处置相同」段 |
| 8 | 🟡 | 已修 | 边界「不改两处落点与 §6.73 清点表那一行以外的任何旧行」与 K6 同口径（「4 条」已消失）；清点表该行实读「discipline · Testing discipline \| 25」且枚举末列为 `A criterion earns its place by being able to fail` |
| 9 | 🟡 | 已修 | 判准第三条「收口只读判域为「当刻状态」的那一行」+「不留两行相反的活判据」 |
| 10 | 🟡 | 已修 | A4「零外溢（只承字面外溢）」+「**A4 判不到的那一面，谁判**」段 |
| 11 | 🟡 | 已裁 · 不采纳成立 | D10（`过程面坐标不进交付物`）+「**前批坐标：本节不给台账行号与批档路径，不是漏**」+ 理由（「指针先死、理由跟着死」）⇒ 上轮要的显式声明已给 |
| 12 | 🟡 | 已修 | 本档 §2「零笔」句不存在；上抛 1 为「〔已裁 · 已落盘〕」；受影响文件表载 §6.73 清点表连带 |
| 13 | 🔵 | 已修 | 「命令 ⑥」取围栏块；A5 ∥ A6 跑者「本席已跑」；本档 §2 载「块 ① = 6 行 · 禁词 0 · 最长行 246 · 汉字 0 · 文档引用 0；块 ② = 3 行 · 禁词 0 · 最长行 278 · 汉字 0 · 文档引用 0；九条探针各 1（分块计）」，本轮按围栏块复核行数 / 九串各 1 / 禁词 0 / 汉字 0 / 引用 0 全部相符 |
| 14 | 🟡 | 已修 | §6.78 先例行已改「先例只给节号、不给台账行号与批档路径，不是漏——D10：过程面坐标不进交付物」，坐标已删 |
| 15 | 🟡 | 已修 | A 表本轮自数 = 8 行连续（A1 ∥ A2 ∥ A3 ∥ A4 ∥ A5 ∥ A6 ∥ A7 ∥ A8），A4 说明段移到表后 |
| 16 | 🟡 | 已修 | C 表题名「用例表 C1–C9（拦下 8——叙述形算在拦下里 ∥ 放行 1；不由那九条逐条对应，见下段）」与紧邻段一致，8 + 1 = 9 行自洽 |
| 17 | 🔵 | 已修 | 本档 §2 形 1 读数改关系式并写「**分项不点数目**」（「写死它就成了下一轮的假话」），分项绝对数已删 |
| 18 | 🟡 | 判定 · 不阻塞（用户问 ③） | §6.78 两句并存但不相斥：一句政策「D10：过程面坐标不进交付物」，一句事实「§6.76 ∥ §6.75 节内无台账号可引（本席本轮实扫该两节，节内无 `#` 台账坐标）⇒ 这两条只给节号，不是漏」；后句理由已被前句吸收，属旧批措辞卫生，🔵 级 |
| 19 | 🟡 | 判定 · 不阻塞（用户问 · 五处旧坐标） | §6.77 ∥ §6.78 的存量坐标仍在盘上（如「台账 `#2153`」、`依据 docs/batches/2026-11-07-parameter-zero-defaults.md`），属上一批两节，父侧已记 #2156，本批判准明令旧行不回改 ⇒ 不阻塞。附注：§2 状态行称「余三处同上抛」，而 §2 上抛项三行无一记此 ⇒ 记录面卫生，🔵 级 |

计数：🔴 3（3 已修）· 🟡 14（12 已修/已裁 · 2 判定不阻塞）· 🔵 2（2 已修）· 共 19 行（上轮 17 + 判定行 2）。
未判项（本轮评审判域之外，未读未跑，按未验处理）：A2 两条锚句在 `thincoder-core/prompts/common.md` 与 `thincoder-core/prompts/discipline-engineering.md` 的在场、A7 的形 2 与形 3 腿读数、`test/RTM.md` 故事索引。

VERDICT: pass

### 轮次 4（评审子代理）

**代码评审（实施轮交付验证 · 对象 = `thincoder-core/prompts/common.md` 块 ① ∥ `thincoder-core/prompts/discipline-engineering.md` 块 ②）**

| # | 严重度 | 状态 | 证据（指针） |
|---|---|---|---|
| 1 | 🔵 | 已核 | 块 ① 6 行位于 `This rule reaches no further than those five; a claim carried into one of them answers to the rule where it now sits.` 之后、`## Business gates — a business failure must fail` 之前；六行与围栏块逐行相符（A1 ∥ A2） |
| 2 | 🔵 | 已核 | 块 ② 3 行位于 `A business gate ships with its failure case` 条末行之后、`## Doc discipline` 之前；九串探针各 1 且各在自己那一块、跨档互扫 0、两档无 >300 字符行（A4 ∥ A5 ∥ A6） |
| 3 | 🟡 | 建议 · 非阻塞 | 「改前读数要记成读数」在两块各陈述一次：块 ①「The failing side is recorded, not narrated」与块 ②「put that command and its output next to what the change is meant to produce」同义；而 `thincoder-core/prompts/common.md` 首行 consumers 写明两模式 + 全部子代理 ⇒ 工程模式同读两遍。A4 的字面互扫判不到这一面（设计档自陈该面「由评审人读判」） |
| 4 | 🔵 | 未验 | A7 五腿回归读数 ∥ A8 交付门本轮未跑（本评审判域内无执行面，按未验处理） |

计数：🔴 0 · 🟡 1（非阻塞）· 🔵 3。

VERDICT: pass

## §4 用户批准（主 agent）

### 用户批准

- **批准形 = 用户提案 + 整批令**：22:46 用户给出完整提案（问题 ∥ 九条实测 ∥ 建议改法与落点 ∥ 验收 ∥ 两处不建议动）；22:48「**提案那个也开批走起来，让调度器自己去排队吧**」；22:50「**这些你都自动跑吧**」= 整批令。
- **父侧裁定（四处）**：① **落纪律层两面**（公共层 + 工程模式），不放 persona 层——判据与人无关；② **补一条用户提案里没有的**：「改前跑一次」必须**记成读数**（命令 + 输出），不是记成句子——**否则「我在不通过那侧跑过、是红的」本身就是一条无法失败的判据**；③ **两处明令不动**：文档名全路径规则（用户原话「它今天拦住我两次，两次都是我写简写、它判得对。判据没错，是执行没到位，不要放宽」）∥ `doc_check` 的 0 档 `PASS`（代码层，另挂 `#2155`）；④ 设计席的落点判语（判据面住处置路由那一格之外）由父侧复核。
- **设计评审三轮**：轮 1 `changes-required`（2 🔴 + 10 🟡 + 1 🔵）→ 轮 2 `changes-required`（13 条里 11 修、1 拒法成立、1 只改一半）→ 轮 3 `pass`。
- **三条 🔴 的形状各不相同，且都是它自己教的病**：轮 1 = 判据的域含自己的答案（读数 3∥2 实为 8∥4）∥ `A3` 空范围读成通过 ∥ 轮 2 = `C` 表与四形表两处相反（`C3`∥`C4` 一审 `Q2` 一审 `Q3`）。
- **实施一轮过**：内部审计 `DIVERGENCE: none` ∥ 代码评审 `pass`；父侧复量四项（两块各就各位、零串档、禁词 0、行宽合格）。
- **`A8`-类判断由父侧做**：本批收口判定 = 父侧独立复量，非采信实施席报数。

## §5 实施记录（eng-coder）
**状态行**：实施完成（两块逐字落两档提示词；A1 ∥ A2 ∥ A3 ∥ A4 ∥ A5 ∥ A6 ∥ A7 五腿 ∥ A8 全跑，读数在 §5）



**两块落地（逐字照 `docs/core/design/PROMPT-SYSTEM.md` §6.79 的围栏块 · 一字未改、未润色、未重排）**

- 块 ① → `thincoder-core/prompts/common.md` 的 `## Evidence discipline` 节末：落点 = `This rule reaches no further than those five; a claim carried into one of them answers to the rule where it now sits.` 之后、`## Business gates — a business failure must fail` 之前。**披露一处形态选择**：块首行与其上一段之间保留一个空行——该节既有条目本就空行分段，紧贴会让新块读成上一段（`A decision carries its evidence in writing`）的续写；块首行仍落在两锚之间，A2 判法不受影响。
- 块 ② → `thincoder-core/prompts/discipline-engineering.md` 的 `## Testing discipline (simplified · anti-over-engineering)` 节末：落点 = `- **A business gate ships with its failure case**` 条末行之后、`## Doc discipline` 之前；紧接该条，与本节条目连排（该节既有条目之间本无空行）。

**逐字内容（落地档原文，与围栏块逐行相等）**

块 ①（六行）：

```text
**A reading that can only come out one way has verified nothing**: before a check is trusted, run it where it is expected to fail — the state before the change, the input the gate is meant to reject, the row that is not there yet.
A check that reads the same there as it does afterwards measures the wording of its own command rather than the fact it was written to watch — and it reads that way for every later reader too, so the green it reports is one the work did not earn.
**The failing side is recorded, not narrated**: the command and what it printed, beside what the change is expected to produce — "I ran it on the failing side and it was red" is a sentence, and a sentence cannot turn red either.
Four shapes they take, all met in one day of our own work: a search whose own string carries the answer, so two characters decide green or red; a pattern that matches nothing — a carriage return the pattern does not allow for,
a dialect where the alternation is read as a literal, a working directory outside the repo; a count with no ruler named, where per line, per occurrence and deduplicated are three answers to one question;
a run over no object at all, reported as a pass.
```

块 ②（三行）：

```text
- **A criterion earns its place by being able to fail**: run it before the change, on the side where it is meant to read red, and put that command and its output next to what the change is meant to produce — "it was red before" is a sentence, and only the reading can be re-run.
  A criterion already green on its failing side is rewritten rather than kept: it will print the same number after the change, and the batch then closes on a green nobody earned.
  A criterion that cannot be run before the change has not pinned its domain yet — an open range or an unnamed ruler answers however that day's wording falls, and a pass over no object reads exactly like a pass over all of them.
```

**读数（本轮实跑 · 命令见设计档该节；绝对数留在本块，未搬进规范面）**

```text
A1   common.md   hits: 1  missing: 'none'   equal: true
A1   discipline  hits: 1  missing: 'none'   equal: true
A2   块① 位于锚行之后、节标题之前 ∥ 块② 位于条末行之后、节标题之前；两锚各 1 命中；## 计数 22 ∥ 11 零改
A3   common      lines: 6  banned: 0   (块内无禁词)
A3   discipline  lines: 3  banned: 0
A5   common      maxLen: 246  cjk: 0  refs: 0
A5   discipline  maxLen: 278  cjk: 0  refs: 0
A4   spill: 0  cross_disc: 0  cross_common: 0
A6   九串各 1，各在自己那一块（块① 六串 · 块② 三串）
A7   形1  S1_repo: 7  S1_prompts: 0  S1_gap: 7   （两域不等 ⇒ 本腿证物成立）
A7   形2  findstr: 0 行（exit=1） ∥ node: 27 处——同一文件同一串；另 cwd = D:\teamcode（仓根 = D:\teamcode\thincoder）
A7   形3  byLine: 3  byOcc: 4  unique: 3
A7   形4  首行 PASS（0 档）
A7   正常 NORMAL_disc: 1  NORMAL_common: 0      （两数不等 ⇒ 这条能红，放行）
A8   首行 DOC-CHECK GATE: PASS（3 档受检，0 命中）
```

**形 4 腿的读法（写清以免下一位读者当成过期读数）**：本次 `doc_check` 走会话已加载的引擎，首行仍是 `PASS（0 档）`；盘上引擎的 0 档处置已由另一条工作流在工作树内改（`thincoder-core/doc-check/index.mjs`），本批零触。设计档该腿已写反转条件——缺陷修掉后本腿改判「空范围会红」。

**单测档**：无——本批零代码面（两档 `.md` 提示词 + 设计档文字），没有可跑的断言面；实施轮的验证读数即上表。**集成测试**：`none`，沿用设计档该节判定（不改任何既有用例断言的业务可观察结果，也未新增业务场景）。

**改动面与披露**：仅两档提示词各一处增列（`git diff --stat` 该目录：`thincoder-core/prompts/common.md` +7 ∥ `thincoder-core/prompts/discipline-engineering.md` +3；同目录第三处改动属并发另一条工作流，非本笔）。本轮**零 out-of-list 改动**：未触源码 ∥ `test/**` ∥ `doc_check` 判据 ∥ 设计档 ∥ 批档其它段。

**审计 ∥ 评审轮次与终态**：内部分歧审计 1 轮 = `DIVERGENCE: none`（审计席自陈无 git/执行面，A1 的字节相等由 read 对读围栏块得出）；代码评审 §3 第 4 轮 = 🔴 0 · 🟡 1（非阻塞：把「改前读数要记成读数」在两块各陈述一次，责任在设计面，落地笔照围栏块逐字抄故不改）· 🔵 3。**终态 = clean**（无阻塞项，自我修正轮 0 次）。

## §6 验证与收口（父代理）

### 验证与收口（父侧独立复量）

| 验收 | 量法 | 父侧读数 |
|---|---|---|
| **块 ① 只在公共层** | 数 `**A reading that can only come out one way has verified nothing**` | 公共层 **1** ∥ 工程纪律层 **0** |
| **块 ② 只在工程模式** | 数 `- **A criterion earns its place by being able to fail**` | 工程纪律层 **1** ∥ 公共层 **0** |
| **禁词零** | 两块命中行扫 `must∥shall∥should∥never∥always∥forbidden∥do not∥don't` | **0 ∥ 0** |
| **汉字零 ∥ 行宽合格** | 两块命中行 | 汉字 **0 ∥ 0**；最长行 **230 ∥ 278**（≤300） |

**实施席自报的五组读数（我采信，理由 = 每腿都是「两个事实两个数」）**：`A1` 两档 `equal: true`、`missing: none` ∥ `A2` 两锚之间、两档 `##` 计数零改 ∥ `A4` 零外溢、跨档互扫各 0 ∥ `A6` 九串分块各 1 ∥ `A7` 五腿（形 1 `7∥0` ∥ 形 2 `0 行∥27 处` ∥ 形 3 `3∥4∥3` ∥ 形 4 `PASS（0 档）` ∥ 正常 `1∥0`）。

**这批存在的理由**

用户 22:46 的原话：「**提示词现在约束了业务门，但没有约束判据本身能不能失败。结果是：一条判据看起来在验，实际永远只会输出同一个读数，验不了任何东西。**」

**当日实测 9 次：8 次评审发现 · 1 次设计席自查 · 0 次按规则查出。**

**这批自己就是它的样本**：三轮评审的每一个 🔴 都是它要治的病坐在自己身上——轮 1 判据的域含自己的答案（读数 3∥2 变 8∥4）；轮 2 一条规则没改在每一层（四形表改了、C 表没改）；轮 3 只删段没删空行、Markdown 仍切断表。**每一轮都是靠「先跑一次再判」抓出来的。**

**带债收口（不静默）**

- **`A7` 形 4 腿的读期望已到期**：`doc_check` 的 0 档缺陷已由 `#2155` 修掉（盘上引擎），而本会话加载的是旧模块，故实施轮仍读到 `PASS（0 档）`。**按本节自带的反转条件，该腿现在应读「空范围会红」**——下一轮触碰本节时按条件改判，本批不再回改。
- **`§6.78` 的旧坐标（五处）与 `§6.77` 的同类存量**：已记 `#2156`，分属上一批两节，本批判准明令旧行不回改。
- **代码评审的 🟡（不阻塞）**：「改前读数要记成读数」在两块各陈述一次（公共层 `The failing side is recorded, not narrated` ∥ 工程模式 `put that command and its output next to what the change is meant to produce`），工程模式下被读两遍。**文本照围栏块逐字落，处置归设计面。**

**收口**

- 台账 `#2154`：**在途 → 待核销 → 已核销**。
