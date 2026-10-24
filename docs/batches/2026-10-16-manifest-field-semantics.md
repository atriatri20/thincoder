# 2026-10-16 · manifest-field-semantics
> 六段 append-only，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 编制：主 agent · 2026-10-16 · 来源 = 用户 2026-10-16 17:11「关键是主agent仿佛不过不知道怎么使用，也不知道里面有什么字段什么用途。」+ 17:12「**这个必须要改，要让 agent 能够清晰的知道 manifest 该怎么管，有什么用。**」= 开工令。父侧实测三条缺口（工具描述只给动作+键名 · 提示词层只讲发现/建档 · 语义单源在设计档）——需求已落 `docs/core/requirements/ENGINEERING-MODE-V2.md` §5.1。。
> 台账 = #1585（core · 归批）。前情 = 无（独立批）。
## §1 讨论（主 agent）
**状态行**：🔄 进行中（…）
<§1 模板占位：本批条目 / 关键判据 / 授权口径>
## §2 批次任务与设计（eng-designer）
**状态行**：设计完成（修正轮 13 条按号收正（号 1–6 + 8–13；号 7 归实施轮、本轮零触））
<§2 模板占位：本批条目（覆盖） / 设计档落点 / 机制设计 / 受影响文件与测试覆盖 / 验收对照 / 关键决策 / 上抛项>

### 批次条目（覆盖）
- **条目源** = 需求块 `docs/core/requirements/ENGINEERING-MODE-V2.md` §5.1「字段语义须达用点（2026-10-16 · 用户令 · 台账 `#1585`）」（父侧笔，已落盘）。
- **本条覆盖**（1 条）：主 agent **仅凭工具描述 + 提示词**即可判「某键该不该改、改成什么、不改会怎样」——**不必翻设计档**。
- **本条不覆盖**：键面语义 / 写门（fail-closed）/ manifest 结构 / 白名单 —— 需求块边界逐字**零改**。
- **本轮范围** = **设计轮**（知识面）。实施 = 下一轮，**按面分派**：
  · 产品面（`thincoder-core/tool-docs/manifest.md` 描述档 ∥ `thincoder-core/prompts/persona-engineering.md` 英文运行时面）→ **eng-coder**；
  · 文档面（`docs/core/design/prompts/persona-engineering.md` 中文评审面 ∥ `docs/core/design/PROMPT-SYSTEM.md` §6.11 指针行）→ **eng-designer**。
  本轮不写实现、不动 `thincoder-core/**` 正文、不动提示词正文。

### 病根（父侧实测三条 · 过程面——住本档，不进设计档）
① 工具描述只交付**动作 + 键名**，字段语义零；② 提示词层「项目状态档」节只讲**怎么发现 / 怎么建档**，无一节讲**怎么管 / 有什么用**；③ 语义单源在设计档 ⇒ 主 agent 在**用工具的那一刻**读不到。用户令（逐字）= 2026-10-16 17:11「关键是主 agent 仿佛不知道**怎么使用**，也不知道**里面有什么字段什么用途**」+ 17:12「**这个必须要改**，要让 agent 能够清晰的知道 manifest 该怎么管，有什么用。」

### 设计档落点
`docs/core/design/MANIFEST.md` §2.10 尾新增块「**字段语义达用点（知识面）**」（`:624` 起——就地扩，不另立档）。

### 两层分工（哪句住哪层 · 为何不重复）
| 层 | 载体 | 常驻性 | 载荷 | 不载 |
|---|---|---|---|---|
| ① 键面事实 | `thincoder-core/tool-docs/manifest.md`（`DESC("manifest")` 单解析面） | **常驻**（每轮可见）⇒ 受篇幅约束 | 键目录 + 每键一句（是什么 · 何时动 · 改错后果） | 管理流程 / 与台账·批次档分工 |
| ② 管理面 | `docs/core/design/prompts/persona-engineering.md`「项目状态档」节 + 英文副本 `thincoder-core/prompts/persona-engineering.md`（同义） | 场景触发**阅读**（物理上文件级常驻） | 怎么管 · 有什么用 · 何时动 · 与台账 / 批次档的分工（需求 §5.4 三账分工） | 每键完整语义目录 |

**分工线 = 一句问法**：「这个键是什么」住 ①；「什么时候该想起它 / 它和别的账怎么分」住 ②。同一句不写两遍（D2）。

### 篇幅上限与取形
- 上限：机制硬限 = 单档 ≤8,000 字符（`scripts/tool-schema-size.mjs:72` `over8k`）；**设计自设更紧 = `tool-docs/manifest.md` ≤5,000 字符**（面专属读数——算式住设计档本块）。
- 算术闭合：现值 **2,235** + 载荷预算 **≤2,300** = **≤4,535 ≤ 5,000**（余 ~465）；载荷预算 = 20 节点 × ~115 字符（**目标语言 = 英文**）。
- 取形 = 目录 + 每键一句（非段落散文；可族分组）；句形「`键` — 是什么；何时动；改错 ⇒ 后果」（三腿齐）；**落地语言 = 英文**。
- **引设计档不复制**：描述只载「用点必需的最小事实」，全语义仍单源在设计档；描述内**零引证**（档名 / 节号 / 指路句——`common.md:48` 提示词面禁带文档引用）；设计档指针落**注释面**（`thincoder-core/agent-tools/manifest.mjs:3` 头注）。

### 触发与实况
- **触发条件** = 「主 agent 要动 manifest 某个键 / 判断某声明该不该改」这一刻——节领句写成场景条件句。
- **物理实况（须报）**：工程模式提示词三档**文件级常驻**（`thincoder-core/prompt-overlays.mjs:42` 恒拼接），**无节级条件装配机制** ⇒「只在该场景进上下文」在文件级不可达；本设计以「短节（≤8 行）+ 场景触发领句」达成意图；节级条件装配 = 新机制，出本批边界。

### 验收对照（回指需求块 · 三链同源 = 需求块 ↔ 设计档 AC-K1–K5 ↔ 本表）
| # | 验收条 | 核法（源面） |
|---|---|---|
| AC-K1 | 场景答问·字段语义：给「本仓要排除归档目录不入索引」，只读描述 + 提示词 ⇒ 答出 ① 键 = `index.excludePaths` ② 为什么 = 索引用途前缀排除数组 ③ 改错 = 前缀命中语义 | 描述档**恰一行**把该键绑到「索引用途 + 前缀排除 + 目录」；提示词节**零键名**（只供管理面） |
| AC-K1b | 场景答问·动作面：问「本仓无档时怎么建 / 改一个键怎么写」⇒ 答 `init` / `write`（缺档拒 + 引导 init） | 描述档动作段命中 `init` / `write` 两行且明「已带档拒」「缺档拒」 |
| AC-K2 | 键目录全备：载全部 **20** 可写节点（键名逐列 ∥ 可族分组）；三腿齐（无后果者明写「无失败后果 + 理由」） | 文本键名覆盖 = 20（与 `MANIFEST_SCHEMA` 对齐）；三腿逐节点在 |
| AC-K3 | 两层不重复（D2）：同一键语义句只在 ① 一次；② 节内不含键面语义 | ② 节内**零键名命中**（20 键名行扫——可机判） |
| AC-K4 | 字面上限：① ≤5,000 字符（自设帽；且 ≤8,000）；② 提示词节新增 ≤8 行 | 字符计数 / 行数差 |
| AC-K5 | 零语义 · 零行为改 | `manifest.mjs` / `manifest-schema.mjs` / `MANIFEST_SCHEMA` 零 diff |

### 受影响文件表（行数口径 = 读取工具显示行数——末行无换行符 ⇒ = `wc -l` + 1；as-of 2026-10-16 实测）
| # | 文件 | 面 | 执行角色 | 当前行数 | 变更 | 增量 |
|---|---|---|---|---|---|---|
| 1 | `thincoder-core/tool-docs/manifest.md` | 产品（描述档） | eng-coder | 17（2,235 字符） | 修改（增键目录块——全 20 节点） | ≤ +2,300 字符（落 ≤5,000 自设帽） |
| 2 | `docs/core/design/prompts/persona-engineering.md` | 文档（中文评审面） | eng-designer | 219 | 修改（「项目状态档」节尾续管理面 + `:56` 失义措辞收正） | ≤ +8 行 |
| 3 | `thincoder-core/prompts/persona-engineering.md` | 产品（英文运行时面） | eng-coder | 217 | 修改（英文同义落地 + `:56` 同款收正） | ≤ +8 行 |
| 4 | `docs/core/design/MANIFEST.md` | 文档（设计档） | eng-designer | 868 | 修改（本块 + `:201` / `:604` 坐标收正） | ≤ +100 行 |
| 5 | `docs/core/design/PROMPT-SYSTEM.md` | 文档（预算表） | eng-designer | 882 | 修改（§6.11 预算表 +1 行——面专属帽指针行） | +1 行 |

> **文档 / 提示词面零行数义务**（`docs/core/requirements/ENGINEERING-MODE-V2.md:645` F12）；受篇幅约束者 = 产品描述档（**字符帽**，非行数）。**测试覆盖 = 无**（本批为文本面知识设计——核法 = 源面读判 AC-K1–K5，无代码可单测）；实施轮只改文本，无单元测试档。

### 关键决策
| # | 决策 | 理由 |
|---|---|---|
| KD-M1-42 | 分层载荷 = ① 键面事实目录（常驻·短句）∥ ② 管理面（场景触发阅读）；零重复 | 键面封闭有限（20）宜常驻；管理面是流程判据，常驻即噪音（D2） |
| KD-M1-43 | 描述取形 = 目录 + 每键一句；描述内零引证；设计档指针落注释面 | `common.md:48` 提示词面禁带文档引用——「引设计档不复制」的实现形 |
| KD-M1-44 | 篇幅 = 硬限 8,000 ∨ 自设 3,500；不用新载体（不加 skill / 不加条件装配） | 新载体 = 新机制，出本批边界 |
| KD-M1-45 | 与 `settings` 描述形对齐、偏离其粒度 | 先例 = `tool-docs/settings.md` + `SETTINGS-TOOL.md` N-ST6「描述纪律」；偏离 = settings 只给两例类型口径，manifest 键面封闭且需求要逐键可判 ⇒ 给全目录 |

### 上抛项
- `[上抛·知会]` 触发式实况：需求方（批次任务书）期望「提示词那节只在该场景进上下文」；实测**无节级条件装配机制**（`prompt-overlays.mjs:42` 文件级恒拼接）⇒ 该期望在文件级不可达。本设计以短节 + 场景触发领句达成意图；节级条件装配属**新机制**，出本批边界，未擅动。

### 设计侧落笔 · 中文文档面（2026-10-16 · eng-designer）

**本轮 = 同一设计的中文文档面落地**（英文产品面已由 eng-coder `#4` 落 —— 见 §5）。逐条：

- ① `docs/core/design/prompts/persona-engineering.md`「项目状态档」节（`:52-64`）：尾续**管理面 4 行**（有什么用 / 怎么管 / 何时动 / 三账分工，与英文 `thincoder-core/prompts/persona-engineering.md:61-64` **同义**）+ 收正 `:56` 失义措辞——`多个 = 歧义——停：列候选，不猜，也绝不建档` → `多个 = 工作区——常态：报明事实、逐列候选项目并点名其项目根，不猜，也绝不建档`（口径同 `MANIFEST.md:310` / `:320`）。
- ② `docs/core/design/PROMPT-SYSTEM.md` §6.11 预算表（`:317`）：+1 **指针行**（`面专属帽` → `docs/core/design/MANIFEST.md` §2.10 尾块；**表内不载帽值数值** —— D2 单源）。

**读数（静态面机判 · 不引 `doc-check` 读数）**：中文节新增 **4 行**（≤8）；20 键名行扫 = **0 命中**（AC-K3）；「歧义」节内命中 = **0**（AC-②）；两档触碰面无 >300 字符单行；`PROMPT-SYSTEM.md` §6.11 行数 **+1**（882 → 883）且该行为指针形。

**执行人** = eng-designer（中文设计文档面笔 —— D1）。**来源** = `docs/core/design/MANIFEST.md:624-709`（设计块）+ §2 + 英文面 `#4` 已落。**本轮不做** = 不改英文面（已落）· 不改产品码 `thincoder-core/**` · 不动 `scripts/**` · 不跑 `doc-check` · 不改本档 §2/§5/§3 既有段 · 未触 `MANIFEST.md` 本块（`:689` / `:692` 两行所指）。

**未决（交父侧裁）**：`docs/core/design/prompts/persona-engineering.md` 叶宽面（该档不在 `scanDirs=["docs"]`？——实读在检域内，本轮两处触碰行均守 ≤300）无异常；无上抛项。

## §3 设计评审（评审子代理）

### 轮次 1（评审子代理）

### 设计评审 · 对象 = 批 2026-10-16-manifest-field-semantics（manifest 字段语义达用点）

**评审范围**：批档 §2 ∥ `docs/core/design/MANIFEST.md` §2.10 尾块（`:624-698`）∥ 需求块 `ENGINEERING-MODE-V2.md` §5.1（`:153-158`）∥ 提示词档 `docs/core/design/prompts/persona-engineering.md`。无文档地图、无项目标准档（判据 7/8 按 Project Guide + 范围内证据判）。

| # | Category | Severity | Issue | Suggestion |
|---|----------|----------|-------|------------|
| 1 | Acceptance criteria | 🟡 | AC-K1 核法「两份文本各命中一行把该键绑到「索引用途 + 前缀排除 + 目录」」（`MANIFEST.md:670` ∥ 批档 `:44`）与 AC-K3「② 节内键语义复制品零命中（人读判）」（`MANIFEST.md:672`）、KD-M1-42「两侧零重复」（`MANIFEST.md:691`）互斥——② 若真含把 `index.excludePaths` 绑到索引用途 / 前缀排除的行，即违 KD-M1-42 / AC-K3；按字面两条不可同时成立 | AC-K1 核法收正为「①（描述）命中该键绑定；② 仅供管理面」；AC-K3 核法由「人读判」改为可机判（② 节内零键名） |
| 2 | Acceptance criteria / Feasibility | 🟡 | 篇幅与载荷互斥：`MANIFEST.md:641` 定「≤3,500 字符」且「增量上界 ~1,300」（现值 2,235）⇒ 余量 = 1,265 字符；而 AC-K2 要「载全部 **20** 可写节点逐键一句」（`:671`）+ 句形「`键` — 是什么；何时动；改错 ⇒ 后果」（`:642`）——按 `:642` 自给句例（单句 ≈90 字符，估算）20 节点 ≈1,800 字符 ⇒ 逐键一句式下必越 3,500；既有动作段被定为零改（`:664`）⇒ 无处腾量；工具描述面为**英文**（现档 `thincoder-core/tool-docs/manifest.md` 全英文）⇒ 英文同义句更长，预算未按目标语言复核 | 二择一并写进同一处：① 抬帽（帽值随预算权威处登记）② 载荷改族级行（键名逐列 + 值形），同步把 AC-K2 的「逐键一句」收正为「键名覆盖 = 20（可族分组）」；编辑点点明目标语言 |
| 3 | Requirements coverage | 🟡 | 句形三腿未逐行落地：`checkConfig.*`（`:658`）· `index.codeExtensions`/`docExtensions`（`:659`）· `index.publicRepos`（`:661`）· `advisor.*`（`:662`）四行（覆盖 10 节点）缺「改错 ⇒ 后果」腿，`promptsLanding`（`:655`）第三腿为「无形态校验（登记面」边界句而非后果句 ⇒ 与需求「某个键该不该改、改成什么、不改会怎样」（`ENGINEERING-MODE-V2.md:156`）的第三问有缝 | 四行逐行补第三腿（无失败后果者写明「无后果 + 理由」），并把该腿纳入 AC-K2 核法 |
| 4 | Document ownership | 🟡 | 本块就地自设并落预算句「`tool-docs/manifest.md` ≤3,500 字符」（`MANIFEST.md:641` ∥ `:680`），而描述面预算表**唯一权威处** = `PROMPT-SYSTEM.md` §6.11（`:305` ∥ `:309`；需求 F15 = `requirements/TOOLS.md:69`；`design/TOOLS.md:258` 同口径）——本批受影响文件表不含该档 ⇒ 预算双源，且未记 F15 总读数影响（`PROMPT-SYSTEM.md:314` 载「1.253 × 基线」，加量只使比值更远 | 帽值登记进 §6.11 预算表（或明确本帽 = 「面专属读数 + 指针行」），并在新块记一句 F15 总预算影响 |
| 5 | Methodology | 🟡 | 批档 `:16` 写「实施（写描述档 + 提示词文本）= 下一轮 eng-coder」，但 `docs/core/design/prompts/persona-engineering.md` 属 `docs/**` 文档面 ⇒ 路由规则指 eng-designer（`prompts/persona-engineering.md:93`「**文档面**（`docs/**` 需求/设计档）→ **eng-designer**」+「文档面派 eng-coder = 违规」）；受影响文件表未逐档标面（`:681` 行 2 空栏） | 受影响文件表逐档补「面（产品 / 文档 / 工程工具）+ 执行角色」；批档 `:16` 的实施句按面拆写两段 |
| 6 | Doc-state coordination | 🟡 | 本批要改的提示词节仍以旧判据框定同一态：`persona-engineering.md:56`「多个 = 歧义——停：列候选，不猜，也绝不建档」（EN 副本 `:56` "several = ambiguous — a stop: list the candidates, never guess, never land one"），而现行设计已改判为 `workspace` 常态并禁该措辞（`MANIFEST.md:310`「不抛「歧义」」· `:769`「上述各面输出**不得含** `ambiguous`（`node` 行扫）」）——本批设计既未收正也未登记为他批残留 | 改写该节时一并收正措辞（或明写「归他批」+ 触发条件）；核法可复用 AC-44 的禁字样行扫 |
| 7 | Doc-state coordination | 🟡 | 同一文件被两批同改而指令相反：本块定「此句属**动作面**，住描述既有段（零改）」（`MANIFEST.md:664`），而 §2.10 自身已定返回锚 = `state=ok|missing|invalid|workspace|no-project`（`:587`）、§2.5 定该面「文案去 `ambiguous` / 「never picks one」」（`:320`）——盘上描述档现含 `state=…|ambiguous|`（`thincoder-core/tool-docs/manifest.md:4`）与 "the mechanism never picks one"（`:8`）（旁证文件，范围外） | 本批改写该档时一并收正旧态名 / 措辞（或明写该收正归他批 + 触发条件），使「零改」边界不与 `:587` / `:320` 相抵 |
| 8 | Survey evidence | 🟡 | 勘察行（`MANIFEST.md:698`）记「**公开源勘察 = 已查无**」，依据却是「本仓 `PROJECT-MANIFEST.json` 的 `index.publicRepos` 实读为 `[]`（空）⇒ 无公共仓源可引」——与本主题（工具描述承载字段语义是否有先例）无关；未记查过哪些公共源（AGENTS.md 载参考系在 `D:\ref\`） | 记「查过的公共源 ∥ 结论（无相关 / 已查无）」，或明写「未勘察外部源」；publicRepos 那句移出勘察行 |
| 9 | Affected-file annotations（抽查） | 🔵 | 标注数与盘面不符：① `MANIFEST.md:683` 行 4「**781**」而本块 `:624-698` 已落 75 行、盘面实读 857 行；增量栏「≤ +40 行」被本块 75 行越过；② `:685`「四档均 ≤500 行」与同行 781 自相矛盾（正解 =「文档（设计 / 需求 / 批次 / 台账）不受行数限制——无任何行数义务」，`ENGINEERING-MODE-V2.md:645`）；③ `:680`「≤ +1,300 字符（落 ≤3,500 字符上限）」越 3,500 − 2,235 = 1,265 余量；④ 同一硬限两坐标 `scripts/tool-schema-size.mjs:70`（`:604`）∥ `:72`（`:641`），实读 `:72` = `const over8k = entries.filter((e) => e.chars > 8000)`；⑤ EN 提示词节标 `:52-61`（`:682`）而实读节 = 52–60 | 四档行数 / 字符数重测（或标注「as-of 落块前」），行数口径注按实测统一 |
| 10 | Affected-file annotations（口径） | 🔵 | 口径注「`wc -l`（换行符计数；读取工具显示值 +1）」（批档 `:50`）与所填数字不符——行 3 填 217 = 读盘「217 lines total」显示值（`thincoder-core/prompts/persona-engineering.md`） | 口径注改为可复现一句，或按 `wc -l` 重测整齐 |
| 11 | Clarity / drift guard | 🔵 | 围栏表定为「拟落描述文本 = 设计围栏块」（`:649`）「一次性材料」，其实施后身份未定：它既是描述漂移的唯一对照载体，又与盘上描述构成第二份键语义（无同步判据） | 明写实施后身份（删 ∥ 保留为「描述内容契约」并挂 AC-K2 键名核法） |
| 12 | Requirements | 🔵 | 「怎么使用」半面（用户 17:11 原话）由既有动作段承载且定为零改（`:664`），本块只核字段语义面，未给该半面核法 | 若要覆盖该半面，AC-K1 加一格「动作 / 参数面答问」；否则块内写明「动作面已就位、本批不核」 |
| 13 | Review limitation | 🔵 | 本次评审无文档地图（AGENTS.md 指「逐档权威地图 = `thincoder/docs/README.md`」，不在评审范围）且无项目标准档 ⇒ 判据 7 只按 Project Guide + 范围内证据判；判据 8 按「目标全为 `.md` ⇒ 标注豁免」（`ENGINEERING-MODE-V2.md:645` · `ADVISOR-CONVERGENCE.md:359`） | 文档地图可用时复跑归属维度（四处落点均在既有主档所在节，无碎片化新档迹象） |

**范围外注记（无严重度）**：`MANIFEST.md:604` 载「仓内侧现盘实读 49 档」，而 `thincoder-core/tool-docs/*.md` 盘面实读 52 档、`PROMPT-SYSTEM.md:307` 亦载「52 档」——属他批（manifest agent 工具面批）行，不在本批设计面内。

**计数**：🔴 0 · 🟡 8 · 🔵 5（合计 13）

VERDICT: pass

## §4 用户批准（主 agent）
## §5 实施记录（eng-coder）
**状态行**：实施完成（偏差审计 1 轮 · 代码评审 2 轮 · 终态 clean · 2026-10-16）



### 交付摘要（本实施轮 = 产品面两档 · 2026-10-16 17:29 起）

- ① `thincoder-core/tool-docs/manifest.md`：**2,235 → 4,522 字符**（17 → 28 内容行，29 行含尾空行）。既有段后增「Key catalog」块（10 行覆盖 **20** 可写节点，键名逐列族分组，每行三腿「是什么 ∥ 何时动 ∥ 改错 ⇒ 后果」）；并按**派单第 7 号**收正既有段两处失义：`:4` 状态锚 `ambiguous` → `workspace`；`:8` 工作区措辞改用现行动作句（去 `ambiguous` / 「never picks one」）。
- ② `thincoder-core/prompts/persona-engineering.md`：**217 → 221 行**。`## Project state file` 节尾续 **4 行**管理面（有什么用 / 怎么管 / 何时动 / 三账分工，**零键名**）；`:56` 失义措辞收正（`several = ambiguous — a stop: list the candidates, never guess, never land one` → `several = a workspace — a normal state: report the fact, list every candidate project and name its root, never guess, never land one`）。
- **读数（源面机判）**：`manifest.md` = 4,522 字符（**增量 +2,287 ≤ 设计帽 +2,300**；距自设帽 5,000 余 478；距机制硬限 8,000 余 3,478）；② 节新增 4 行（≤8）；两档 `grep -i ambiguous` = **0**；键名覆盖 **20/20**（各恰一次，对 `MANIFEST_SCHEMA` 白名单逐字对齐 — `manifest-schema.mjs:29-65` 实读 4 顶层 + docRoot 5 + checkConfig 5 + index 4 + advisor 2）。
- **零代码 diff**：`manifest-schema.mjs` / `agent-tools/manifest.mjs` / `manifest.mjs` 三档会话前后 sha256 前 16 位**逐一相同**（`00d3976df4fe423a` ∥ `1424871a8c4174bc` ∥ `e073473465600652`）。
- **静态探针**（run-only，**非 doc-check**）：`node scripts/tool-schema-size.mjs` ⇒ `manifest`（meta）**5,711 字符 < 8,000**；`tool-docs` 52 档 · 83,471 字符；工具 schema 总量 132,038 · 比值 **1.276**（与设计 `MANIFEST.md:645` 的 F15 预测「≤1.276」相符）；`超单档 8,000` 段**空**。

### 决策透明表

| # | 决策 | 理由 |
|---|---|---|
| D-1 | 提示词档 `:53` `project phase` → `project stage`；`:57` `version control` → `source control`（两处均在 `thincoder-core/prompts/persona-engineering.md`） | AC-K3 = **② 节内 20 键名零命中**（行扫机判）；`phase` / `version` 即两个顶层键名 —— 不改则 AC 必红。两处同义替换，语义不变 |
| D-2 | 键目录取**英文电报体**（`change when …; wrong ⇒ …`），非完整散文句 | 目标语言 = 英文；设计自设帽 ≤5,000 且载荷预算 ≤2,300 字符 —— 20 节点 × 三腿只有电报体容得下（设计 `MANIFEST.md:646` 句形即此体） |
| D-3 | 键目录**族分组**（10 行覆盖 20 节点） | 设计 `MANIFEST.md:646` 明许「**可族分组**——同族节点键名逐列 + 逐族一句」 |
| D-4 | `index.excludePaths` 行只给「前缀排除用途 + 改错后果」，不写命中细则（恰等 ∨ 后随 `/`） | 设计契约表 `MANIFEST.md:667` 同粒度；AC-K1③ 已满足（该精度建议留作评审 🔵 备选，父侧裁） |
| D-5 | 评审第 1 项（🟡）**自修**：`:8` 按动作分写「`read` 报明 / `init`·`write` 拒」 | 原文把工作区一律写成「拒」 ⇒ 与同档 `:4`（read 五态含 `workspace`、`Never throws`）互斥；设计 `:320` / `:593` 本就是两分口径；**派单第 7 号明许补动作面既有事实** |
| D-6 | 键目录块**保留**为描述漂移对照载体（不删） | 设计 `MANIFEST.md:656`：本表 = 描述内容契约，实施后保留；语义单源仍在本档 §2.2 |

### 审计与代码评审轮次与终态

- **偏差审计（explore · 阻塞 1 轮）**：结论 = **无实质偏差**；AC-K1 / K1b / K2 / K3 / K4 / K5 逐条源面读判通过；两条 low = 「**记录面窄于交付面**」——描述档 `:4` / `:8` 收正、提示词 `:53` / `:57` 收正均超出设计受影响文件表所记编辑点（前者由派单第 7 号授权；后者由 AC-K3 强制、非自愿扩面）。
- **代码评审（advisor · 同步 2 轮）**：轮 1 = **pass**（1 🟡 备选 + 3 🔵；无必修）；轮 2（自修后复核）= **pass**（🟡 关闭；余 2 项前轮 🔵 未处理、1 项字符帽不可机测、1 项裁剪微收窄新增 —— 均 🔵 非必修）。
- **终态 = clean**（无必修项遗留；🔵 备选项已列入交付报告「未决」）。

### fix round（自修 1 轮）

- **F-1**：`:8` 由 `A target that is a workspace … is refused` 改为 `A workspace target … is reported by `read` and refused by `init` / `write``；同笔裁 `:19` / `:21` / `:23` 三行共 17 字符，把增量压回 ≤+2,300（落 4,522 / 增量 +2,287）。
- **未处理（🔵 备选 · 交父侧裁）**：`:25` / `:28` 第三腿未载「形态非法 ⇒ 校验拒」；`:26` 未载前缀命中规则；`:19` 裁剪顺带略去设计 `:660` 的「建档」触发（`init` 落默认档时本就写入，读者不因此误判）。

## §6 验证与收口（父代理）
