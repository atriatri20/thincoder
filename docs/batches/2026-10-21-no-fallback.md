# 2026-10-21 · no-fallback
> 六段 append-only，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 编制：主 agent · 2026-10-21 · 来源 = 用户令（2026-10-21 17:14「喜欢写兜底代码…业务上走不通的就该走不通」+ 17:20「开」）：业务门失败必须显式失败，禁止兜底放过；兜底仅限业务结果不变的系统性条件。
> 台账 = #1725（ENGINEERING-MODE · 归批）。前情 = docs/batches/2026-10-21-reuse-first.md（已收口 2026-10-21）。
## §1 讨论（主 agent）
**状态行**：已收口 2026-10-21
<§1 模板占位：本批条目 / 关键判据 / 授权口径>

## 讨论记录

**用户报告（2026-10-21 17:14，逐字）**：「大模型还有一个恶习：喜欢写兜底代码，总是试图让程序怎么都能跑通，导致在做业务系统时经常因为这些兜底导致业务纪律漏洞，**业务问题不能靠技术解决，业务上走不通的就该走不通**，而不是被兜底放过。我希望这类问题也能通过提示词抑制。」→ 17:20「**开**」。

**结构诊断（父侧）**

| # | 原因 | 证据 |
|---|---|---|
| 1 | 提示词的隐性目标是「跑通」：四步流程、验收、测试都以「能跑」为终点，无一处定义「业务失败必须浮出来」 | 诚实纪律（stop-and-report / evidence）只管「说」，不管「运行期行为」 |
| 2 | 「兜底」在提示词里从不被视为缺陷：既有 `fallback ∥ 降级 ∥ 回落` 的用法全是正当的（Bing 兜底、压缩兜底、缓存回落）⇒ 模型只学到「兜底是好事」 | `common.md:115` · `:146` |
| 3 | 需求/设计验收写的是 happy path（「能导入」「能建单」），没人写「前置不满足时必须失败」 | FR32–FR39 验收全为正向行为 |
| 4 | 评审无「业务门」判据：设计评审 11 条 ∥ 代码评审六维，没有一条查「这里是不是把该失败的业务路径做通了」 | `advisor-design.md` · `advisor-round1.md` |

**本批范围**（= 需求 §13.18 六条）：① 业务门失败显式失败（带可指认原因）；② 兜底唯一合法判据 = **业务结果不变**；③ 自检问句「删掉这个兜底，会不会冒出一个业务错误？」；④ 业务/技术分界（技术手段不得改变业务判定；例外只能由用户裁定并落档）；⑤ 评审判据（掩盖业务失败 ⇒ 🔴）；⑥ 失败路径要有机器可判用例。

**预算口径（本批起生效）**：提示词**无体量帽**（用户 2026-10-21 17:18 裁定 + 17:19「要」）；体量只作读数。

**不做**：不禁系统性重试/降级/缓存/占位/i18n 回落（限业务结果不变）· 不改既有安全机制 · 不改普通模式既有纪律。

## §2 批次任务与设计（eng-designer）
**状态行**：（eng-designer 写入时更新）
<§2 模板占位：本批条目（覆盖） / 设计档落点 / 机制设计 / 受影响文件与测试覆盖 / 验收对照 / 关键决策 / 上抛项>

**状态行**：设计完成 2026-10-21
**设计档**：`docs/core/design/PROMPT-SYSTEM.md` §6.42（逐字英文文本 + 落点表 + 对照表 + 用例表 + 验收 A1–A10 + 关键决策 K1–K10 + 体量读数）。

### 覆盖条目（= 需求 §13.18 六条）

| # | 条目 | 落点 | 逐字文本 |
|---|---|---|---|
| 1 | 业务门失败必须显式失败（带可指认原因）；禁默认值 ∥ 自动补建 ∥ catch-continue ∥ 空集合 ∥ 中性文案 | `common.md` 新节 `## Business gates — a business failure must fail`（`## Evidence discipline` 节末插入） | B1 |
| 2 | 兜底唯一合法判据 = 业务结果不变；正例四项 / 反例五项 | 同节（`The one test every fallback must pass` + `Legitimate` / `Never a fallback` 两组） | B1 |
| 3 | 自检问句逐字 + 可机检子串 | 同节：`"If I delete this fallback, would a business error surface?"` | B1 |
| 4 | 业务 / 技术分界；例外只能由用户 / 业务方裁定并落档（哪条规则 ∥ 谁批 ∥ 有效期） | 同节 `Business and technical do not trade` 段 | B1 |
| 5 | 代码评审判据：兜底使本应失败路径变成功 ⇒ 🔴；无「业务结果不变」证据 ⇒ 🟡 | `advisor-round1.md` 新增 R8（R7e 行后 · `Source:` 行前） | B2 |
| 6 | 业务门失败路径要有机器可判用例，happy path 单独不算 | `discipline-engineering.md` 测试纪律节新增 bullet（`:112` 后） | B3 |

### 不在本批（明确不做）

- 不禁系统性重试 / 降级 / 缓存 / 占位 / i18n 缺键回落（限业务结果不变）。
- 不改既有安全机制、校验机制、渲染层占位。
- 不改普通模式既有纪律（`discipline-normal.md` 零笔）。
- `discipline-engineering.md` **不同落**业务门本体（K2：工程会话同读 `common.md`，双份 = 同一机制两份活描述）。
- `advisor-design.md` / `advisor-round2.md` / `advisor-round3.md` 零笔（K3：判据只落首轮发现面）。
- `persona-engineering.md` / `persona-normal.md` / `persona-plan.md` 的 `workable default` 族零改（K4 / K6：由 B1 末段一次分界）。
- 不新增脚本 / CI 步 / 机判门；不改台账。

### 受影响文件

| 文件 | 现行（`node` 实读） | 改动 |
|---|---|---|
| `thincoder-core/prompts/common.md` | 274 行 / 43,728 字符 | +1 节 / +17 行 / +2,446 字符 ⇒ 46,174 |
| `thincoder-core/prompts/advisor-round1.md` | 62 行 / 11,210 字符 | +1 行（R8）/ +860 字符 ⇒ 12,070 |
| `thincoder-core/prompts/discipline-engineering.md` | 203 行 / 39,336 字符 | +1 行（bullet）/ +462 字符 ⇒ 39,798 |
| `docs/core/design/PROMPT-SYSTEM.md` | 本节写入后 2,597 行 / 216,497 字符 | 新增 §6.42 |
| 其余提示词档 · 产品代码 · 需求档 · `scripts/**` | — | ±0 |

### 验收对照（对应派单验收 ①–⑤）

| 验收 | 判法 / 读数 | 状态 |
|---|---|---|
| ① 逐字英文文本（common 主落 + discipline 是否同落给结论 + `advisor-round1.md` 判据）与既有条款逐句对照 | 设计档 §6.42 的 B1/B2/B3 + 落点表 L1–L6 + 对照表 11 行（`common:115` ∥ `:146` ∥ `:169` ∥ `common:17` ∥ persona 两档 ∥ `persona-plan:22` ∥ `discipline:22/24/27` ∥ `discipline:170` ∥ `advisor-round1:53` ∥ `:32` 严重度 ∥ `discipline:103-113` ∥ `advisor-design`）；discipline 同落结论 = **不同落**（K2） | ✅ |
| ② 界线写死「业务结果是否改变」+ 正反例 | B1 正例 4（重试 ∥ 缓存 ∥ 占位 ∥ i18n 缺键）+ 反例 5（默认值 ∥ 自动补建 ∥ catch-continue ∥ 空集合 ∥ 中性文案）；用例表 C2–C10 逐条给输入 / 期望 | ✅ |
| ③ 自检问句逐字 + 可机检子串 | B1 内 `If I delete this fallback, would a business error surface?` 恰 1 次（A3） | ✅ |
| ④ 设计档新节 + 落点表 + 验收 + 用例 | §6.42 六块齐（机制 ∥ 逐字文本 ∥ 落点表 ∥ 对照表 ∥ 用例表 ∥ 验收 A1–A10 ∥ 体量读数 ∥ 边界 ∥ K1–K10） | ✅ |
| ⑤ §2 写入 + doc_check PASS | 本段 + 设计档；gate 读数随本批报告 | 见报告 |

### 关键决策（摘要 · 全文见 §6.42）

- **K1** 主落 `common.md` 新节（恒第二位注入 = 两模式 + 全子代理唯一全覆盖面）；插在 `## Evidence discipline` 之后（说真话 ↔ 别把错误做没，同族相邻）。
- **K2** 工程纪律层不同落业务门本体（D2 单一权威）；只落测试形态 B3。
- **K3** 评审判据只落首轮代码评审（发现面）；二 / 三轮只查修态。
- **K4** `workable default` 族零改，由 B1 末段一次分界（执行面默认 vs 业务结果）。
- **K8** R8 作用域 = 评审范围内的业务流（对象作用域，不用模式信号——先例 `#1724` K10）。
- **K9** 严重度：🔴 = 本应失败变成功；🟡 = 无「业务结果不变」证据。
- **K10** 写「业务门」而非「业务逻辑」（前者可判：存在 / 状态 / 权限 / 金额 / 关联）。

### 三问答案行（FR39）

`none found: common.md 全档（无业务门节）· discipline-engineering.md 测试纪律节（无失败用例条）· advisor-round1.md 判据表 R1–R7e · advisor-design.md` —— 本条无新名字 / 新组件 / 新端点 / 新标签文字，全部为既有档内的规则句；已查上列四面，无现成件可复用。

### 上抛项

无。

### 修正轮（评审轮次 1 · 七条 · 2026-10-21）

**处置表**（编号 = 本档 §3 轮次 1 的 #1–#7；落点均在设计档 `docs/core/design/PROMPT-SYSTEM.md` §6.42）：

| 评审 # | 处置 | 改动坐标（设计档） |
|---|---|---|
| 1 🟡 | 需求 ③ 补记录面：B1 自检段增句 `write the answer on the record`（批档笔行 ∥ 设计档，并写明兜的条件与「业务结果不变」）；机制 3 同步；A3 增判该句；A10 口径对齐（③ 的记录面 = 该句） | `:2363` · `:2385` · `:2470` · `:2477` |
| 2 🟡 | A7 改「四行逐字在场」判法，读数改为 persona 两档各 2 次 + `common.md:17` 1 次（只作读数） | `:2474` |
| 3 🟡 | A9 判读串换两段连续子串 `a gate nobody has watched reject` · `catching its way to success`，删省略号形态 | `:2476` |
| 4 🟡 | 新增「计数连带（D3）」块：① 需求档 §2.3 标题 19 → 20 节 + 表行 +1（需求档笔，本批登记不改）；② `common.md` `##` 19 → 20（代码面无节数断言，实读）；③ 序位口径 = 落笔当时读数、非定位坐标，指称以节名——存量本就不齐（§6.16 `:399` = 17 ∥ §6.22 `:533` = 16 ∥ §6.25 `:613` = 17 ∥ D-PS22 = 15），本节段中插入不牵动之；偏离 ① 同步指向该块 | `:2415-2419` · `:2503` |
| 5 🟡 | B1 末段只留新增半句（执行面 vs 业务判定 · 不发明业务结果 · 判据 = 结果不是机制），删对 `common.md:17` 的复述；对照表 `common.md:17` 行管辖面改为「问与不问 + 执行期 `workable default`（`once work is under way`）」 | `:2389` · `:2427` |
| 6 🔵 | L1 写明尾随空行另加 1 行 ⇒ 实增 18 行；受影响表与合计读数按实算重写 | `:2408` · `:2458` · `:2480` |
| 7 🔵 | B3 补层级词 `a unit case — deleted with the batch, like every other unit case`；边界增「收口后不留永久护栏（要长期护栏 ⇒ 另立集成集裁定）」；对照表测试纪律行同步 | `:2401` · `:2483` · `:2434` |

**修正轮自查收正（同面）**：B2 的 Δ 原写 +860，实读 = 858（行 857 字符 + 1 换行）⇒ `:2459` · `:2480`，改后 = 12,068；本档自读行原写 2,597 行 / 216,497 字符，实读 2,604 行 / 217,874 字符 ⇒ `:2461`。

**逐字块变更（实施席按改后块重落）**：B1（17 行正文 + 尾随空行 = +18 行 / +2,528 字符 · `:2373-2389`）· B3（+522 字符 · `:2401`）。B2 未改（+1 行 / +858 字符）。
**体量读数（实算）**：改后 `common.md` 46,256 · `advisor-round1.md` 12,068 · `discipline-engineering.md` 39,858；提示词面合计 +3,908 字符 / +20 行。
**B1–B3 语义**：未改 FR40 六条；改动仅评审裁定的收正面（记录面 · 末段去复述 · 层级词）。
**零改**：`thincoder-core/prompts/**` · 产品代码 · 需求档 · 本档 §1 / §3–§6 · 设计档其它节。
**机检**：`doc_check(mode:"gate")` = PASS（1 档全清）。

## §3 设计评审（评审子代理）

### 轮次 1（评审子代理）

**评审对象**：设计档 `docs/core/design/PROMPT-SYSTEM.md` §6.42（FR40——业务门必须显式失败 + 兜底唯一判据 + 自检问句 + 业务/技术分界 + 代码评审 R8 + 失败路径用例）；需求权威 `docs/core/requirements/ENGINEERING-MODE-V2.md` §13.18（`:845-862`）。

**勘察面（本席实读）**：两份评审文档全文；设计自指落点坐标的定点核对 = `common.md:43-50` ∥ `:112-118`（`:43` 节首 · `:48` 末内容行 · `:49` 空行 · `:50` 下一节首 · `##` 节数 19 实测）· `advisor-round1.md:44-62`（R1–R7e `:48-58` · `:58` R7e · `:59` Source 行 · `:32` 严重度 · `:53` R6）· `discipline-engineering.md:100-118`（`:103` 测试纪律节首 · `:105-111` 九条 · `:112` 断言条 · `:114` `## Doc discipline`）；`thincoder-core/prompts/` 全目录 `fallback` ∥ `workable default` ∥ `business gate` 全量 grep 对账。

| # | Category | Severity | Issue | Suggestion |
|---|---|---|---|---|
| 1 | Requirements coverage | 🟡 | 需求 ③ 的括号面未落——`ENGINEERING-MODE-V2.md:855` 写「（落笔时自答，答案进 §1 笔行或设计档）」，而 B1（`PROMPT-SYSTEM.md:2385`）只落问句与「会 ⇒ 删」，无「答案落到何处」的句子；机制 3（`:2363`）∥ 验收 A3（`:2464`）也只检问句逐字。前批 §6.41 对同形条款落了「答案进批档 §1 该笔行」（`:2183`）并给收口读面（`:2186`）——本条无对应面，A10（`:2471`）仍写「需求六条逐条有落点」 | B1 自检问句段补一句「把答案写进这笔改动所在的笔行（批档 §1）或设计档」；或显式写明该记录面不属提示词面、由既存交付报告条（`discipline-engineering.md:101`）承接——二者任一都要让 A10 的「逐条有落点」与实况一致 |
| 2 | Acceptance criteria | 🟡 | A7 的机检读数与在盘不符——`:2468` 写「`workable default` 在 persona 两档原文各 1 次」；实读 `persona-engineering.md:36` ∥ `:37` 各 1 次（共 2 次）· `persona-normal.md:27` ∥ `:28` 各 1 次（共 2 次）· 另 `common.md:17` 1 次。照现文执行 ⇒ 期望值与读数矛盾（判失败，或被静默按错基线放过） | A7 读数改为「两档各 2 次」并补 `common.md:17` 1 次（三段逐字零改），或把该项改为「两行原文逐字在场」的比对形，避开计数 |
| 3 | Acceptance criteria | 🟡 | A9 第二条判读串含省略号——`:2470` 的 `a gate nobody has watched reject … catching its way to success`（各 ≥1）；B3 实文（`:2401`）为「a gate nobody has watched reject is a gate that may be defaulting, auto-creating or catching its way to success」⇒ 省略号不是连续子串，按 `includes` 判不可能命中，「≥1」成不可执行判据 | 换一条连续片段（如 `catching its way to success` 或 `a gate nobody has watched reject`），或写成「省略号两侧两段各 ≥1」 |
| 4 | Document ownership | 🟡 | B1 给 `common.md` 新增 `##` 节（19 → 20 · `:2408`），但 §6.42 无「计数连带（D3）」块——此前每次 common.md 新增节都登记需求档大纲随动（§6.16 `:404` ∥ §6.22 `:535` ∥ §6.25 `:619` 均含「需求档 `docs/core/requirements/PROMPT-SYSTEM.md` §2.3 标题 + 表行」；§6.19 `:468` 以「无」显式声明）⇒ 需求档 §2.3 逐节大纲少一节而无处现形。另一层：段中插入把 `产品常识` ∥ `安全纪律` 序位各后移一位，而 §7 D-PS30 ∥ D-PS36（`:2546` ∥ `:2552`）与 §6.25（`:613`）以「第 16 / 17 节」指称它们——偏离 ①（`:2497`）只说「本节无 §N 依赖」，未覆盖这层连带 | 补「计数连带（D3）」块：① 需求档 §2.3 标题 + 表行（或显式「无」）；② `common.md` `##` 节数 19 ⇒ 20；③ 段中插入引起的序位后移，与 §6.25 / D-PS30 / D-PS36 的「第 16 / 17 节」口径一并交代（改数或声明序位非权威） |
| 5 | Document ownership | 🟡 | B1 末段（`:2389`）把「workable default = 取用户已确认范围内的默认」这半句复述一遍，而同一档已有原句：`common.md:17` 的「still steers with a workable default drawn from what the user already confirmed」；对照表（`:2421`）把 `common.md:17` 末句的管辖面写成「需求形成期的问与不问」，但该句自带「once work is under way」——执行面正是 B1 末段的对象 ⇒ 同档两处活描述，且对照表对既有句的管辖面描述偏窄 | B1 末段只留真正新增的半句（`it never invents a business outcome` + 「判据 = 结果、不是机制」），前半句改写为对同档既有句的锚（同档节号属协议自名，不触引用锁）；或保留复述但登记为「有意锚点重复」，写明两句须同改 |
| 6 | Affected-file annotations | 🔵 | L1（`:2408`）要求「前后各一空行」，而受影响表（`:2452`）的 Δ =「+17 行」＝围栏块本身（11 内容行 + 6 空行 · `:2373-2389`）；现盘 `:49` 已是空行、`:50` 紧接 `## Document writing discipline`（`common.md:49-50` 实读）⇒ 满足「后一空行」还须再加 1 行，实落 = +18 行 / +2,447 字符；收尾按「恰多 N 行」核会撞一次假不一致 | 读数改 +18 行 / +2,447 字符，或在 L1 写明「尾随空行计入 Δ」 |
| 7 | Clarity | 🔵 | B3（`:2401`）未点明失败用例属哪一层；同节邻近条已有「a single change adds no case to the set」（`discipline-engineering.md:107`）与「unit tests … delete on use」（`:105`），判定（单元级 · 随批删）只住设计档对照表（`:2428`）——运行期读到的是提示词本身（两界原则 `:181`）⇒ 可被读成给永久集成集加例。另一面：随批删意味着收口后该门无永久护栏，若期望长期护栏则是集成集层面的另一笔裁定 | B3 里补层级词（如「a unit case, deleted with the batch」），并把「收口后无永久护栏」写成显式边界；若用户要长期护栏，另立集成集裁定 |

**计数**：🔴 0 · 🟡 5 · 🔵 2（共 7 项）

VERDICT: pass

## §4 用户批准（主 agent）

**批准依据（批级放行）**：用户 2026-10-21 17:20 逐字「**开**」+ 17:22 逐字「**自动跑完**」（批级放行 = 批内全链自动跑完，评审照走；按 2026-10-19 23:29 裁定覆盖批准门）。

- 链路：设计 `#56` → 评审 `#57`（pass）→ 修正 `#58` → 实施 `#59` → 父侧复跑 + 收口轮三处笔。
- 无 🔴 遗留；无跳步。

## §5 实施记录（eng-coder）

### 实施记录（2026-10-21 · eng-coder）

**状态行**：实施完成 2026-10-21（三处逐字落笔 · 审计 clean · 代码评审 pass · 修正轮 0）

**落笔三处（逐字 = 设计围栏块；判法 = 围栏内容逐行取出，与落笔区逐行全串比较 + 整段长度比较）**

| # | 文件 | 落笔后坐标 | 动作 | 逐字 | 行 Δ | 字符 Δ |
|---|---|---|---|---|---|---|
| L1 | `thincoder-core/prompts/common.md` | `:50-66`（前后空行 `:49` / `:67`） | 插 `## Business gates — a business failure must fail` 整节（17 行正文 + 尾随空行） | ✓ 逐行相等（设计围栏 17 行） | +18 | +2,528 |
| L2 | `thincoder-core/prompts/advisor-round1.md` | `:59`（R7e `:58` 后 · `Source:` `:60` 前） | 插 R8 一行 | ✓ 整行相等 | +1 | +858（码点） |
| L3 | `thincoder-core/prompts/discipline-engineering.md` | `:113`（断言条 `:112` 后 · `## Doc discipline` `:115` 前） | 插失败用例 bullet 一行 | ✓ 整行相等 | +1 | +522 |

**体量读数（无帽 · `node` 实读）**

| 档 | 行（前 → 后） | 字符（前 → 后） |
|---|---|---|
| `thincoder-core/prompts/common.md` | 274 → 292 | 43,728 → 46,256 |
| `thincoder-core/prompts/advisor-round1.md` | 62 → 63 | 11,210 → 12,070（UTF-16 单元） |
| `thincoder-core/prompts/discipline-engineering.md` | 203 → 204 | 39,336 → 39,858 |

口径注：设计预测 `advisor-round1.md` 12,068 按码点计；该档码点实读 12,038（基线码点 11,180 + Δ 858），Δ 与设计一致。B2 的 🔴 / 🟡 各 1 码点 = UTF-16 双单元，故单元读数 12,070。

**验收 A1–A10（逐条实读）**

| # | 读数 | 判 |
|---|---|---|
| A1 | `business gate` `:52` · `fail explicitly` `:53` · `which gate, which input` `:53` 各 1；五反例串各 1（`:60`） | ✓ |
| A2 | `the business result does not change` `:57` · `Legitimate` `:59` · `Never a fallback` `:60` 各 1；四正例串各 1（`:59`） | ✓ |
| A3 | 自检问句恰 1（`:62`）· `write the answer on the record` 恰 1（`:62`） | ✓ |
| A4 | 三串各 1（`:64`） | ✓ |
| A5 | 三串各 1（`advisor-round1.md:59`）；`^R\d+[a-z]? ` 计 12 | ✓ |
| A6 | 两串各 1（`discipline-engineering.md:113`） | ✓ |
| A7 | 末段两句各 1（`:66`）；`workable default` = persona 两档各 2 · `common.md:17` 1，四行逐字未动 | ✓ |
| A8 | prompt-refs-check = 69 档 / 463 档 / 命中 0；doc_check gate = PASS（0 档，三档不在声明域） | ✓ |
| A9 | why 句 1（`:55`）· `a gate nobody has watched reject` 1 ∥ `catching its way to success` 1（`discipline-engineering.md:113`） | ✓ |
| A10 | 需求档 §13.18 零改（mtime 17:19 早于本轮 17:32–17:33）· 六条 ↔ A1–A6 · ③ 记录面 = `write the answer on the record`（A3 判） | ✓ |

**自检清单（派单）**：三块逐字相等 ✓ · `##` 19 → 20（实读 20）· `^R\d+[a-z]? ` = 12 · `business gate` / `Never a fallback` / `If I delete this fallback` 各 1 · prompt-refs-check 0 ✓ · 禁令词见 D2。

**决策披露**

| # | 决策 | 理由 |
|---|---|---|
| D1 | 落点 = 内容锚 + 行号双写；先读后写，写后逐行比对 | 行号会漂、锚不漂；写后比对让「逐字」可核 |
| D2 | 禁令词自检口径 = 围栏外新增 0 | 派单自检行写「新增文本 = 0」，而设计围栏原文自带 `never`×4 · `Never`×1 · `do not`×1 · `must not`×1（`common.md:55` / `:60` / `:64` / `:66`）；逐字照抄与「= 0」不可同真。按「唯一权威目标形 = 围栏块、不改措辞」执行，读数如实上报，设计一字未改 |
| D3 | 体量按 UTF-16 单元 + 码点双报 | 设计 12,068 的基线按单元、Δ 按码点，两个口径混用；Δ 858 一致，非文本差 |
| D4 | 非目标档零笔 | 工作树另有六档在改（需求档 §13.18 · 设计档 §6.42 等），mtime 17:19–17:30 早于本轮写盘 17:32–17:33，非本轮写入 |

**验证读数**

- `node scripts/prompt-refs-check.mjs` → 提示词面 69 档 · 代码面 463 档 · 命中 0；J1/J2/J3 零命中。
- `doc_check(mode:"gate", docs = 三档, target = D:\teamcode\thincoder)` → `DOC-CHECK GATE: PASS（0 档）`；三档不在声明域，显式跳过 3 档。
- `git diff --stat -- thincoder-core/prompts/` → 3 files changed, 20 insertions(+)（18 / 1 / 1）。
- `git status --porcelain -- thincoder-core/prompts/` → 恰三档 ` M`。

**审计 ∥ 代码评审轮次（终态 clean）**

- 内部 explore 审计 1 轮：逐字 / 落点 / A1–A10 / 越界四类，唯一偏差 = §5 未写（本段即补）；无其它偏差。
- 内部 advisor 代码评审 1 轮：🔴 0 · 🟡 1（协调项：需求档 §2.3 大纲 19 节待主 agent 收口改 20）· 🔵 2（设计档 §6.41 旧「≤ N」读数与新无帽裁定并存 · 批档 §2 表列旧 Δ 与修正轮读数并存）⇒ VERDICT: pass。
- 修正轮 0：无代码面 / 文本面需改项。

**零改确认**：需求档 · 设计档 · 产品代码 · 其它提示词档 · persona-* 零笔。

## §6 验证与收口（父代理）

## 验证与收口

**评审**：`#57`（design · **pass**：🔴0 · 🟡5 · 🔵2）→ 七条全 Fixed（`#58`）→ 实施 `#59`（三块逐字落笔）。

**父侧复跑（2026-10-21 17:44）**

| 判据 | 读数 | 判定 |
|---|---|---|
| 三块在场 | `common.md` `## Business gates — a business failure must fail` ✓ · `advisor-round1.md` R8 ✓ · `discipline-engineering.md` 「A business gate ships with its failure case」✓ | ✅ |
| 计数连带 | `common.md` `##` 节数 **20**（19→20）· `advisor-round1.md` `^R\d+[a-z]? ` = **12**（11→12） | ✅ |
| 需求档大纲 | `requirements/PROMPT-SYSTEM.md` §2.3 标题改 **20 节** + 表内插入第 7 行「业务门纪律」，原 7–17 行序位 +1（表 17 → 18 行）——**父侧笔，本批收口轮落** | ✅ |
| `prompt-refs-check` | 命中 **0**（J1/J2/J3 零命中） | ✅ |
| `doc_check` gate | **PASS**（设计档 + 需求两档 · 0 命中） | ✅ |
| 体量（无帽 · 只读数） | common **292 行 / 46,256** · round1 **63 / 12,070** · discipline **204 / 39,858** | ✅ |

**收口轮处置（父侧）**

1. 需求档 §2.3 大纲：标题 19→20 节 + 新第 7 行「业务门纪律」+ 后续行序位 +1（设计 §6.42 D3 块登记的父侧笔）。
2. `PROMPT-SYSTEM.md` §6.40/§6.41 残留的「≤ N 字符 · 余 N」帽读数清为「改后 N（无帽 · 读数）」——与 17:18 无帽裁定对齐；首轮替换曾误留 `$1` 字面，已逐行修正并复核。
3. 批档 §2 表列旧 Δ 与修正轮读数并存 = **已知**，以修正轮读数为准（§6 本节即权威读数）。

**收口清单**：doc_check PASS · 暂缓批复核无 · 前批遗留无 · 用户文档面同步：无（提示词面，新会话生效）· 台账 `#1725` → **已核销** · 令牌链终消费 · 新债：无。
