# 2026-10-19 · tech-sweep-promptface
> 六段 append-only，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 编制：主 agent · 2026-10-19 · 来源 = 用户令 2026-10-19 08:28「技术待办现在就开始处理」+ 08:29「为什么不现在就开？」——批 A = 提示词面两项（`#1683` helpers 常量注 ∥ `#1684` prompt-refs 5 条命中），与文档面批并行。。
> 台账 = #1683 ∥ #1684（core · 归批）。前情 = docs/batches/2026-10-19-tech-todo-sweep.md（在途）。
## §1 讨论（主 agent）
**状态行**：已收口 2026-10-19
<§1 模板占位：本批条目 / 关键判据 / 授权口径>
## §2 批次任务与设计（eng-designer）
**状态行**：设计完成
<§2 模板占位：本批条目（覆盖） / 设计档落点 / 机制设计 / 受影响文件与测试覆盖 / 验收对照 / 关键决策 / 上抛项>

### 本批条目（覆盖）

| 台账号 | 条目标题 | 本批覆盖 |
|---|---|---|
| `#1683` | `helpers.mjs` 常量注口径 `Content authority = parent side` 与设计档相抵 | 全部（四处注，含实读新增的 `:478`） |
| `#1684` | `prompt-refs-check` 五条既有命中 | 全部（五条） |
| —— | 不在本批 | 全仓 261 条既有悬空（另域）· 提示词正文 · 裸档名存量 · §6.6 判据句 |

### 设计档落点

`docs/core/design/PROMPT-SYSTEM.md` §6.31（提示词 / 模型可见面残留清零）——含逐条目标形、受影响文件表、验收读数、用例表、关键决策、边界、上抛项。

### 机制设计（摘要）

- **`#1683`**：三处常量注（`thincoder-core/agent/helpers.mjs:454` `AUTO_TURN_DIGEST_DOMAIN_ENG` · `:461` `UPSTREAM_TURN_DOMAIN` · `:470` `TIMER_TURN_DOMAIN`）末句 `Content authority = parent side.` ⇒ `Content basis = the mechanism doc; landing = eng-coder.`；`:469` / `:477` 的 `Verbatim from the parent-side final text` ⇒ `Verbatim from the mechanism doc`。**定性 = 注释措辞，零行为变**：字符串本体零改、选串点零改。同文件 `:478`（`DIGEST_ACCOUNT_DOMAIN`）同形一处，一并收正。
- **`#1684`**：五条全按「删引用（非改址）· 句义保留」——`batch.md:1` 删 `(§4.18-B)` 括注；`doc_check.md:12` 示例 `file.md:12` 换形为 `<doc>:12`（保留示例含义）；`doc_check.md:33` 清单中该件改称 `this tool description`；`batch-lifecycle.mjs:460` 删 `(§4.18-A)`、`:504` 删 `, §4.18-B`（`§1 → 进行中` 保留 = 协议自名）。零新增豁免。

### 受影响文件与测试覆盖

| 文件 | 现行行数 | 预计 Δ | 档位 |
|---|---|---|---|
| `thincoder-core/agent/helpers.mjs` | 492 | ±0（注内改写 4 处） | 核件 |
| `thincoder-core/tool-docs/batch.md` | 1（单行 · 无尾换行） | ±0 | 工具描述（产品代码面） |
| `thincoder-core/tool-docs/doc_check.md` | 54 | ±0 | 工具描述（产品代码面） |
| `thincoder-core/agent-tools/batch-lifecycle.mjs` | 505 | ±0 | 核件 |
| `docs/core/design/PROMPT-SYSTEM.md` | 880 | +84（实读 ⇒ 964） | 设计档 |

测试面：不新增单元测试档（无分支改动）；机判 = 既有 `scripts/prompt-refs-check.mjs` 常驻脚本，不新增断言。

### 验收对照（逐条回指）

| 条目 | 命令 | 期望读数 |
|---|---|---|
| `#1684` | `cd thincoder && node scripts/prompt-refs-check.mjs` | `命中 0` + `OK(prompt-refs)`（改前 5） |
| `#1684` | doc-check 交付门（范围 = 本轮所写档） | 0 条命中（全仓报告态 261 悬空 = 既有基线，非本批域） |
| `#1683` | `grep -n "Content authority" thincoder-core/agent/helpers.mjs` | 0 行 |
| `#1683` | `node --check thincoder-core/agent/helpers.mjs` | 退出码 0 |

### 关键决策

K1 四处注一并收正（台账记三处，实读第四处 `:478`，同文件同句同依凭）· K2 `doc_check.md:12` 换形不删（删示例即丢含义）· K3 回执串删节号不改指（模型侧无解析能力）· K4 零新增豁免（白名单 = 判据单源）。

### 上抛项

1. `[上抛·待裁]` 台账 `#1683` 记三处，实读四处（`helpers.mjs:478`）——本设计按同批收正，请父侧登记计数差；若认为应单列，实施前可撤该一处。
2. `[上抛·待裁]` 设计档内两处仍写「父侧落笔」：`AGENT-LOOP-UPSTREAM.md:600` · `:328`，与 `PROMPT-SYSTEM.md` §6.1 现行口径（落笔 = eng-coder）相抵——语义面，本笔不动，请父侧裁定。

### 修正轮（round 2 · 评审 10 条父侧全部接受 · 2026-10-19）

**本轮笔域**：只改设计档两档——`docs/core/design/PROMPT-SYSTEM.md`（§6.31 内就地增列 / 改写）与 `docs/core/design/TOOLS.md`（§6.24 ① `close` 行单元格）。代码 / 提示词 / 工具描述正文零触（实施轮）；§3 评审段零触；其他批次档零触。

| # | 严重度 | 处置（号 → 改动 file:line） |
|---|---|---|
| 1 | 🔴 | **选 (a)：改锚**。`docs/core/design/TOOLS.md:1515` §6.24 ① `close` 行同轮改为去括注形；`PROMPT-SYSTEM.md:835`（目标形列 1 号行依据半句）· `:854`（§6.31.3 新增 `TOOLS.md` 行，1551 行 · Δ±0 · 档位 = 设计档）· `:894`（§6.31.6 新增 K5 决策与理由）· `:901`（§6.31.7 边界补「`TOOLS.md` 只同轮改该行，其余节零触」） |
| 2 | 🟡 | `PROMPT-SYSTEM.md:869` 验收补 `grep -in "content authority" thincoder-core/agent/helpers.mjs`（期望 0，大小写不敏感）+ `:870` 补 `grep -n "parent-side final text" thincoder-core/agent/helpers.mjs`（期望 0，覆盖 `:469` / `:477`）；原区分大小写行已换掉 |
| 3 | 🟡 | `PROMPT-SYSTEM.md:873`–`:874` §6.31.4 增「已知代价（改引擎件）」：`tool-docs/doc_check.md` 是门六引擎件之一（该档 `:33` / `:34` 自述）⇒ 实施后本会话交付门只返回 ERROR、实施批 `batch close` 拒收；处置 = 实施批收口在重启会话后执行（先例 `docs/batches/2026-10-18-doc-check-gate.md:828`），表内读数一律取新进程；`:901` §6.31.7 边界同步一句 |
| 4 | 🟡 | `PROMPT-SYSTEM.md:807`–`:808` §6.31 增「最近先例」：`#1684` 对齐 §6.6 清零轮 + §6.19 `:445` 机检形；`#1683` 对齐 `docs/batches/2026-10-19-prompt-mech-single-face.md`；对齐 / 偏离各一句（偏离 = 注释面纳入本笔笔域，理由 = 台账 `#1683` 触发条件 + §6.6 `:186`） |
| 5 | 🟡 | `PROMPT-SYSTEM.md:804`–`:805` §6.31 增「勘察证据（§6.26 义务行）」：查过本档 §6.4 / §6.6 / §6.11 / §6.19 / §6.26 ∥ `docs/README.md` `:50`–`:51` ∥ 需求面第 16 条 ∥ 兄弟仓三处——**已查无**相关机制档 |
| 6 | 🟡 | `PROMPT-SYSTEM.md:851`–`:853` §6.31.3 档位列改「档位与拆分结论」：`batch-lifecycle.mjs` 505 行越 500 咨询线 ⇒ **无需拆分**（本笔只删固定串片段、结构零动；先例 = 本档 `:708` 对 509 行 `cmd-config.mjs`）；`helpers.mjs` 492 行未越线 ⇒ 无需拆分 |
| 7 | 🟡 | `PROMPT-SYSTEM.md:843`–`:844` §6.31.2 增「判据对账」：`§1`–`§6` 裸段号不命中（`scripts/prompt-refs-check.mjs:34` `J2_RE`）；两段形 `§N.M` / `§N.M-K` 照命中 = 外部档节号 ⇒ 命中；与 §6.6 `:185` 判据一致；§6.6 `:191` 括注句本批不改、待另笔收窄 |
| 8 | 🔵 | `PROMPT-SYSTEM.md:857`–`:859` §6.31.3 表下增「预算读数（D3 随动）」：**−14 字符**（算式 `batch.md` −12 ∥ `doc_check.md:12` −2 ∥ `doc_check.md:33` 0；`batch-lifecycle.mjs` 回执串不入计式），复测命令 = `node scripts/tool-schema-size.mjs`。**评审估 ≈ −35 的读数已按实算收正**（差 = 回执串不在 `{description, parameters}` 计式内） |
| 9 | 🔵 | `PROMPT-SYSTEM.md:836` 目标形补 `<doc>` = 元变元（非档名、无 `.md`）；`:837` 目标形补 `this tool description` 入列**不加反引号**（清单其余项为反引号路径） |
| 10 | 🔵 | `PROMPT-SYSTEM.md:812` §6.31.1 首行增「归属理由」：本笔属 §6.6 域故登记本档；`TOOLS.md` §6.15.3 / `AGENT-LOOP-UPSTREAM` / `AGENT-LOOP-ASYNC-POOL` 只作内容依据、不重记（D2） |

**第 1 条选择与理由（(a) 改锚，不选「声明历史锚退役」）**：① 该机制仍现行——`close` 仍冻结档、仍只留重开合取一口，把活锚标成历史文本就是活档留死句；② `TOOLS.md:1507` 自述 §6.24 = 模型可见文本面逐字，两个逐字面（设计锚 ∥ 实现面）必须同形，否则 `batch.md` 落地即成两说（§6.4 设计锚 = 权威源、实现面照抄）；③ 代价 = 一行单元格、行数 ±0。已核：全仓仅 `TOOLS.md:1515` 持该逐字锚（`2026-10-18-batch-freeze-gate-fix.md` 是批次档 = 过程面，非活锚）。

**读数修正（本轮实测）**：`PROMPT-SYSTEM.md` 改前实测 **983** 行（旧标 964 系前测，差 19）；本轮增列后 **1004** 行（§6.31.3 行已按实读填）。`TOOLS.md` 1551 行 · `helpers.mjs` 492 · `batch.md` 1 · `doc_check.md` 54 · `batch-lifecycle.mjs` 505（均 `split("\n").length − 1` 实读）。

**本轮验收读数**：`prompt-refs-check` 改前 = 5 命中（实跑）· `tool-schema-size` = 143,572 / 1.387×（实跑）；`doc_check` 交付门（范围 = 本轮所写两档）= `DOC-CHECK GATE: PASS`，0 条命中。代码面零触 ⇒ `prompt-refs-check` 本轮读数仍为 5（实施轮落笔后应为 0）。

**边界**：本轮不落 `tool-docs/**` 与 `batch-lifecycle.mjs` 正文（实施轮）；不动 §6.6 判据句；不动其他批次档与 §3。

**坐标回正（上表两处行号，落盘后实测）**：第 6 条 = `PROMPT-SYSTEM.md:850`（`helpers.mjs` 行）与 `:853`（`batch-lifecycle.mjs` 行）；第 1 条 / 第 3 条涉及的边界句 = `:898`（§6.31.7），`:901` 为 §6.31.8 上抛项标题。其余坐标经复读一致；`PROMPT-SYSTEM.md` 落地实读 = 1004 行。

## §3 设计评审（评审子代理）

### 轮次 1（评审子代理）

### 设计评审 · 批 A（`#1683` ∥ `#1684`）· 评审对象 = `docs/core/design/PROMPT-SYSTEM.md` §6.31

**评审面限制（先记）**：无项目标准档、无文档地图声明 ⇒ 文档归属与流程合规按 `AGENTS.md` + 本档自身规范（§6.1 变更流 / §6.4 设计锚 / §6.6 判据 / §6.26 勘察义务）判；档内归一（§6.31.3 五行尺寸标注）已逐档实读抽证。

| # | Category | Severity | Issue | Suggestion |
|---|----------|----------|-------|------------|
| 1 | Document ownership | 🔴 | `#1684` 第 1 条改 `thincoder-core/tool-docs/batch.md:1` 的 `close` 分句（`docs/core/design/PROMPT-SYSTEM.md:824` 目标形 = 删括注：`…is refused except the reopen conjunction`），而 `docs/core/design/TOOLS.md:1515`（§6.24 ①「三处 schema description 换写——逐字」`close` 行）持同一文本的**逐字设计锚**（"every further write is refused except the reopen conjunction (§4.18-B)"；节头 `:1507` 自述 = 模型可见文本面逐字单源）；§6.31.3 受影响文件表（`:834-840`）与 §6.31.7 边界（`:874`）均无 `TOOLS.md` 行 ⇒ 落地后同一机制在两份活档里各说一套，且违本档 §6.4「设计锚 = 权威源、实现面照抄」与 D-PS1。 | 受影响文件表补 `docs/core/design/TOOLS.md` 行（§6.24 ① `close` 行同轮改为去括注形，给出 Δ 与档位）；或显式声明该行为历史锚、现行源 = `tool-docs/batch.md`，并写明理由 —— 二者择一写进 §6.31.3 / §6.31.7。 |
| 2 | Acceptance | 🟡 | `#1683` 验收命令不可证第四处：`:850` 为 `grep -n "Content authority" thincoder-core/agent/helpers.mjs`（区分大小写），而 `:478` 现文是小写（`:803` 自述「小写 `content authority = parent side.`」，实读 `thincoder-core/agent/helpers.mjs:478` = "content authority = parent side. */"）⇒ 即使 `:478` 未改，读数仍为 0 行（假绿）；且 `:469` / `:477` 的 `Verbatim from the parent-side final text` 改写无任何判据覆盖。 | 验收补两条：`grep -in "content authority" …`（大小写不敏感，期望 0 行）+ `grep -n "parent-side final text" …`（期望 0 行）；或改为 `grep -nE "Content authority|content authority|parent-side final text"`。 |
| 3 | Feasibility | 🟡 | 本笔改 `thincoder-core/tool-docs/doc_check.md`（第 3 条），而该档是 `doc_check` 门的**六个引擎件之一**（`thincoder-core/tool-docs/doc_check.md:33` 自述清单；`:34` "newer, or unreadable, ⇒ `DOC-CHECK GATE: ERROR（引擎已更新…）`"）⇒ 改后在本会话内跑 `doc_check` 交付门（`:849` 期望 "0 条命中"）只会拿到 ERROR，且本批自身 `batch close` 的文档机检门会 fail-closed 拒收。此前同族批已把此代价写进档（`docs/batches/2026-10-18-doc-check-gate.md:828`「本批收口须在重启会话后执行」），本设计零记载。 | §6.31.4 / §6.31.7 补一行「已知代价」：改引擎件 ⇒ 本会话 `doc_check` gate 返回 ERROR、本批收口须在新进程执行（复跑命令同此）；验收读数注明取新进程。 |
| 4 | Methodology | 🟡 | 无**最近先例行**：§6.31 全节（`:797-879`）未给先例坐标（实施坐标 ∥ 对应设计节 ∥ 先例批）与对齐 ∥ 偏离理由；可用的先例（§6.6 判据清零点、§6.10 / §6.19 的「零新增断言 + 复跑 `prompt-refs-check`」形、`docs/batches/2026-10-18-doc-check-gate.md` 的引擎件同批代价记载）均未点。 | 补一行先例：`#1684` 先例 = §6.6 清零轮（判据同源）· §6.19 / §6.25 机检形；`#1683` 先例 = `docs/batches/2026-10-19-prompt-mech-single-face.md` 同句族收正；偏离（注释面入本批）= 台账 `#1683` 触发条件成立，写明即可。 |
| 5 | Methodology | 🟡 | 无**勘察证据行**：本档 §6.26 已把「设计开工前查公共源文档、查过什么 / 有没有相关，无相关也照记」写成设计席义务（`:605` "设计档落**勘察证据行**"），§6.31 零记载 ⇒ 读作「未查」或「未记」。 | 补一行勘察证据（查过哪些独立文档仓 / 公共源 ∥ 有无相关；无相关也照写「已查无」）。 |
| 6 | Affected-file size annotations | 🟡 | 档位判定缺一句：`thincoder-core/agent-tools/batch-lifecycle.mjs` 现行 505 行（实读 `split("\n").length − 1` = 505，与 `:839` 标注一致）**已越 500 行咨询线**，而 `:839` 档位列只写「核件」，无拆分复核结论（本档先例 `:708` 对 509 行的 `cmd-config.mjs` 明写「无需拆分（≤±3 无结构影响）」）；`helpers.mjs` 492 行同样贴线未记。 | 表中该两行档位列补拆分结论（如「505 行 · 越软线 · 本笔 ±0 只删文本 ⇒ 无需拆分」+ 理由；若认为需拆分则给拆分方案），与本档 §6.27 同形。 |
| 7 | Document ownership | 🟡 | 判据源与实施面口径未对账：§6.31 声明「判据单源 = §6.6」（`:799`），而 §6.6 写「批次档段号 `§1`–`§6`（及其下级两段形）为合法正例」（`:191`）；实现侧 `scripts/prompt-refs-check.mjs:34` 的 `const J2_RE = /§\s*(?:\d{2,}(?![\d\\.])|\d+\.\d)/g` 对 `§4.18-A` / `§4.18-B`（两段形）照命中 ⇒ §6.31.2 第 4 / 5 条把它们当命中删掉，与所引判据句的括注读法相反，设计未给一句话对账（只单点说明 `§1` = 合法正例）。属既有表述，本笔不动它，但读者无从判断哪句为准。 | 在 §6.31.2「处置通则」处补一句对账：`§1`–`§6` 裸段号不命中；两段形（`§N.M` / `§N.M-K`）由 J2 判为外部档节号 ⇒ 命中（§6.6 括注读法 = 后者），并注明 §6.6 判据句本批不改、待另笔收窄。 |
| 8 | Acceptance | 🔵 | 描述面预算读数随动未声明：本笔改 `tool-docs/batch.md` / `tool-docs/doc_check.md` 文本 ⇒ §6.11「预算表（唯一权威处）」的当前读数（`:284` "**143,572**"）会漂（本笔约 −35 字符），设计未按 D3 记「随动 / 不随动 + 理由」。 | §6.31.3 表下补一行：预算读数随动（约 −35 字符，`node scripts/tool-schema-size.mjs` 复测后回填）或写明「报告态读数、本笔不随动」。 |
| 9 | Clarity | 🔵 | 两处目标形可被实施者读偏：`:825` 的 `<doc>:12` 未说明 `<doc>` 是占位元变元（非档名 —— 否则易被读作 §6.6 禁止的「改址」而反复）；`:826` 的「该件改称 `this tool description`」未说明入列时不加反引号（清单其余项均为反引号包裹的路径，写成反引号会被读成路径形）。 | 目标形列补半句：`<doc>` = 元变元（非档名、无 `.md`）；`this tool description` 入列去反引号。 |
| 10 | Document ownership | 🔵 | `#1683` 的收正记录落在本档（提示词 / 模型可见面），而其内容依据的拥有档是 `TOOLS.md` §6.15.3（`:816` 自引）与 `AGENT-LOOP-UPSTREAM.md` / `AGENT-LOOP-ASYNC-POOL.md`；设计未写一句「为何本笔登记在本档而非拥有档」（防日后两处各记一份）。 | 在 §6.31.1 首行补一句归属理由（本批主题 = 模型可见面残留清零，§6.6 域；拥有档只作依据、不重记）。 |

**计数**：🔴 1 · 🟡 6 · 🔵 3（共 10 条）。
**通过面（已抽证）**：五条命中坐标与命中式逐条对上（`batch.md:1` `§4.18-B` · `doc_check.md:12` `file.md` / `:33` `doc_check.md` · `batch-lifecycle.mjs:460` `§4.18-A` / `:504` `§4.18-B`）；四处常量注坐标逐条对上（`helpers.mjs:454` / `:461` / `:470` / `:478`，`:469`–`:470` / `:477`–`:478` 的换行折行形态与目标形一致）；尺寸标注五行逐档实读一致（492 / 1 / 54 / 505 / 964）；无新增断言的口径与既有测试面不冲突（`**/test/**` 内无 `§4.18-A|§4.18-B|closeout chain gate still applies` 断言）。

VERDICT: changes-required

### 轮次 2（评审子代理）

### 轮次 2 发现（修正轮验证 · 批 A）

**轮次 1 十条落盘复核（逐条对盘读数）**：① `TOOLS.md` §6.24 ① `close` 行已去 `(§4.18-B)` 括注（`TOOLS.md:1516`）✅ · ② 验收已改 `grep -in`（`PROMPT-SYSTEM.md:869`）✅ · ③ 引擎件已知代价已立（`PROMPT-SYSTEM.md:873-874`）✅ · ④ 先例行已立（`PROMPT-SYSTEM.md:807-808`）✅ · ⑤ 勘察证据行已立（`PROMPT-SYSTEM.md:804-805`）✅ · ⑥ 档位与拆分结论列已立（`PROMPT-SYSTEM.md:848-855`）✅ · ⑦ 判据对账已立（`PROMPT-SYSTEM.md:843-844`）✅ · ⑧ 预算随动 −14 已立含算式（`PROMPT-SYSTEM.md:857-859`）✅ · ⑨ 元变元已立（`PROMPT-SYSTEM.md:836`）✅ · ⑩ 归属理由已立（`PROMPT-SYSTEM.md:812`）✅ —— 十条 10/10 落盘。

| # | 类别 | 严重度 | 发现 | 建议 |
|---|---|---|---|---|
| 1 | 验收覆盖 | 🟡 | `PROMPT-SYSTEM.md:865-871` 的验收表无全量套件读数行，而本笔改的是 `thincoder-core/agent-tools/batch-lifecycle.mjs` 两处模型可见回执串（`PROMPT-SYSTEM.md:838-839`），且 `PROMPT-SYSTEM.md:846-855` 受影响文件表未列任何测试档。既有 batch 用例可能逐字断言该拒句（其逐字面归 `TOOLS.md` §6.24 ② J 族），静默回归无读数 | 补一行套件读数（口径照既有 A27／A-MS6：失败集合 ⊆ 批前失败集合），或明写「既有用例不逐字断言该串」的实读结论 |
| 2 | 清晰度 · 先例坐标 | 🟡 | `PROMPT-SYSTEM.md:854` 以「先例 = 本档 `:708` 对 509 行 `cmd-config.mjs`『无需拆分（≤±3 无结构影响）』」支撑 505 行不拆；`:708` 实为桌面 `settings-agent.mjs` 表行，所引句在 `:711` | 改指 `:711`，或不落行号、改指 §6.27「结构线」句 |
| 3 | 数值 · 预算算式 | 🔵 | `PROMPT-SYSTEM.md:857-858` 分项不自洽：` (§4.18-B)` 去 10 字符（非 −12）；`doc_check.md:33` 一项记 0，但依 `PROMPT-SYSTEM.md:837`「清单其余项都是反引号包裹的路径」⇒ 该处应 −2。−14 总数可能因两项互补而成立，但分项与所引串对不上（`doc_check.md` 本体在本评审范围外 ⇒ 分项数值 unverified） | 分项重算；总数以复测读数为准（验收已含复测回填） |
| 4 | 坐标 | 🔵 | 又两处 TOOLS.md 坐标低 1：`PROMPT-SYSTEM.md:895` 的 `TOOLS.md:1507`（§6.24 自述行 = 1508）、`PROMPT-SYSTEM.md:827` 的 `TOOLS.md` §6.15.3（`:708`）（注面要求行 = 709）；`PROMPT-SYSTEM.md:854` 记 TOOLS.md 现行 1551，该档末内容行 = 1552（按本表自述 `split("\n").length − 1` 口径）。与轮次 1 坐标「`TOOLS.md:1515`」（实为 1516）同族 −1 偏移 | 四处重锚 |
| 5 | 先例行完整性 | 🔵 | `PROMPT-SYSTEM.md:807-808` 给了设计节 + 先例批坐标并对偏离给了显式理由，但缺**实现坐标**（本档自己在 `PROMPT-SYSTEM.md:843` 引用的 `scripts/prompt-refs-check.mjs:34` 即在手边） | 补实现坐标一处 |
| 6 | 勘察证据完整性 | 🔵 | `PROMPT-SYSTEM.md:804-805` 记了本树勘察与「已查无」，但未记 manifest 声明的公共源清单（`PROJECT-MANIFEST.json` `publicRepos`）——同档 §6.23 的先例行（`PROMPT-SYSTEM.md:1286`）记了 `[]`。「无相关」结论因此只覆盖工作目录树 | 同形登记该清单（含空表读数） |
| 7 | 已知代价覆盖 | 🔵 | `PROMPT-SYSTEM.md:873-874` 只点 `batch close`；实施轮 coder 的 §5 append 同跑文档机检门（`batch` 工具自述：ERROR ⇒ close 被拒而 append 带 ERROR 回执落地），§6 读数亦需重启后跑。只写 close 易让回执被读成「写失败」 | 把 §5 append 回执与「重启后跑 §6 / 再 close」的次序一并写进已知代价 |
| 8 | 文档卫生 · 活面悬空承诺 | 🔵 | `PROMPT-SYSTEM.md:844` 以「§6.6 `:191` 括注…待另笔收窄」收尾，无登记（台账行 / 触发条件）。按 §6.6 `:185`／`:191` 自带「判据 = 指称本协议自身对象」限定，本案（`§4.18` 指 `BATCH-RECORD.md` 节号）本已可判，故该句是活判据面上的松口 | 登记该收窄项（台账行）或改为纯观察句 |

**计数**：🔴 0 · 🟡 2 · 🔵 6；轮次 1 十条 = 10/10 已落盘。

VERDICT: pass

## §4 用户批准（主 agent）

**批准（2026-10-19 · 用户整批令）**

用户逐字：「技术待办现在就开始处理」·「全部开」·「接着派，别等」——**覆盖本批批准门**。设计已过评审（§3 = pass，🔴0）⇒ 实施获准。

**批准范围**：§2 全部实施面（提示词面六处文本面改净 + `helpers.mjs` 的 `Content authority → Content basis` + 删批档固定片段）。

## §5 实施记录（eng-coder）

### 实施记录 · 批 A（`#1683` ∥ `#1684`）· 六处文本面 · 零行为变

**笔域**：四档 — `thincoder-core/agent/helpers.mjs` · `thincoder-core/tool-docs/batch.md` · `thincoder-core/tool-docs/doc_check.md` · `thincoder-core/agent-tools/batch-lifecycle.mjs`。`prompts/**` 零触、`docs/**` 零触、设计档零触（`TOOLS.md` §6.24 ① 的逐字锚已在设计轮同轮落，本笔零改）。

**逐处 改前 → 改后**

| # | 坐标 | 改前 | 改后 |
|---|---|---|---|
| 1 | `thincoder-core/agent/helpers.mjs:454` | `… AGENT-LOOP-ASYNC-POOL.md §6.8. Content authority = parent side. */` | `… AGENT-LOOP-ASYNC-POOL.md §6.8. Content basis = the mechanism doc; landing = eng-coder. */` |
| 2 | 同档 `:461` | `Verbatim from the design doc (single line — no newlines). Content authority = parent side. */` | `Verbatim from the design doc (single line — no newlines). Content basis = the mechanism doc; landing = eng-coder. */` |
| 3 | 同档 `:469` | `timer was for". Verbatim from the parent-side final text (single line — no newlines).` | `timer was for". Verbatim from the mechanism doc (single line — no newlines).` |
| 4 | 同档 `:470` | `Content authority = parent side. */` | `Content basis = the mechanism doc; landing = eng-coder. */` |
| 5 | 同档 `:477`–`:478`（折行两行） | `…（机器线独有）。Verbatim from the parent-side` / `final text (single line — no newlines); content authority = parent side. */` | `…（机器线独有）。Verbatim from the mechanism doc` / `(single line — no newlines). Content basis = the mechanism doc; landing = eng-coder. */` |
| 6 | `thincoder-core/tool-docs/batch.md:1` | `… every further write is refused except the reopen conjunction (§4.18-B); runs the same closeout-chain gate as status …` | `… every further write is refused except the reopen conjunction; runs the same closeout-chain gate as status …` |
| 7 | `thincoder-core/tool-docs/doc_check.md:12` | `(`file.md:12`) are not section references …` | `(`<doc>:12`) are not section references …` |
| 8 | 同档 `:33` | `… / `agent-tools/doc-check.mjs` / `tool-docs/doc_check.md`) each have their mtime` | `… / `agent-tools/doc-check.mjs` / this tool description) each have their mtime` |
| 9 | `thincoder-core/agent-tools/batch-lifecycle.mjs:460` | `… the closeout chain gate still applies at the next close (§4.18-A).` | `… the closeout chain gate still applies at the next close.` |
| 10 | 同档 `:504` | `… status is refused except the reopen conjunction (§1 → 进行中 with a note, §4.18-B) (整档冻结 …` | `… status is refused except the reopen conjunction (§1 → 进行中 with a note) (整档冻结 …` |

字符串本体零改、选串点零改：`helpers.mjs` 五条导出常量文本逐字未动（只改 JSDoc）；`batch-lifecycle.mjs` 两处只删固定片段的括注。

**验收读数（实跑 · 仓根 `d:\teamcode\thincoder`）**

| 条目 | 命令 | 改前 | 改后 |
|---|---|---|---|
| `#1684` | `node scripts/prompt-refs-check.mjs` | 提示词面 69 档 · 代码面 459 档 · 命中 **5**（`batch.md:1 §4.1` · `doc_check.md:12 file.md` · `doc_check.md:33 check.md` · `batch-lifecycle.mjs:460 §4.1` · `:504 §4.1`）· `FAIL(prompt-refs)` exit 1 | 提示词面 69 档 · 代码面 459 档 · 命中 **0** · `OK(prompt-refs): J1/J2/J3 三式零命中` exit 0 |
| `#1683` | `grep -in "content authority" thincoder-core/agent/helpers.mjs` | 4 行 | **0 行** |
| `#1683` | `grep -n "parent-side final text" thincoder-core/agent/helpers.mjs` | 2 行（`:469` / `:477`） | **0 行** |
| 语法 | `node --check thincoder-core/agent/helpers.mjs` · `node --check thincoder-core/agent-tools/batch-lifecycle.mjs` | exit 0 | exit 0（两档；另两档为 `.md`，`node --check` 不适用——实跑报 `ERR_UNKNOWN_FILE_EXTENSION`，故验收口径 = 「两个 `.mjs` 全过」） |
| 全量套件 | `node test/run.mjs`（`thincoder-core` ∥ `thincoder-cli`） | `ℹ test manifest is empty — zero tests = green` exit 0 · 各包 `*.test.mjs` 计数 = 0（六包逐一实读） | 同上 exit 0 ⇒ 失败集合 ⊆ 基线（两集会空） |
| 预算面 | `node scripts/tool-schema-size.mjs` | 143,572 字符 · 1.387× · tool-docs 53 档 92,396 字符 | **143,557** 字符 · 1.387× · tool-docs 53 档 **92,381** 字符 ⇒ **Δ −15** |
| 交付门 | `doc_check(mode:"gate")` | — | `DOC-CHECK GATE: ERROR（引擎已更新（tool-docs/doc_check.md mtime 2026-10-19T00:44:14.502Z > 进程启动 …），请重启会话后复跑）`——**设计 §6.31.4「已知代价（改引擎件）」逐字命中的预期态**；读数须取新进程，收口在重启会话后执行 |

**报告项 · 设计档偏差一处（不属本笔笔域，交父侧路由 eng-designer）**：`PROMPT-SYSTEM.md` §6.31.3 预算行预测 **−14**（分项 `batch.md` −12 ∥ `doc_check.md:12` −2 ∥ `doc_check.md:33` 0）；实测 **−15**，分项 = **−10**（` (§4.18-B)` = 空格+括号+7 字符）∥ **−2**（`file.md`→`<doc>`）∥ **−3**（去反引号 2 + 串差 1）。§6.11 读数 143,572 ⇒ 143,557 待回填（`docs/**` 本笔零触，按笔域纪律留父侧/设计席落笔）。

**审计与评审轮次**

- 内部实施偏移审计（explore · 只读）：1 轮。六处逐字对形 **全一致**；越界改动 **0**（四档 = 批准清单）；两项登记者 = ①§5 未写（即本段）②设计档预算读数待回填（上条）。
- 独立代码评审（advisor · type=code）：1 轮，**pass**，🔴 0 · 🟡 2（均标「可选/协调」，非缺陷：`batch-lifecycle.mjs` 505 行越 500 咨询线已在设计 `:854` 裁定无需拆分 ∥ 批档 §4/§5/§6 未落 = 收口协调项）· 🔵 2（同文件出处措辞「design doc / mechanism doc」并存 ∥ 设计档三处盘上读数漂移）。
- 自纠轮次：0（无 🔴，无需修正）。
- **终态：clean**。

**上抛项**

1. `[上抛·知会]` 预算读数实际 −15（预测 −14）、分项与预测不同 —— 设计档 §6.31.3 / §6.11 待回填。
2. `[上抛·知会]` 本会话 `doc_check` 交付门只能回 ERROR（引擎件已改）—— 收口（§4 / §6 / `close`）须在重启会话后执行；本段 append 落 ERROR 回执亦属预期，不代表写入失败。

**读数口径澄清（回读自检）**：上表「改前」列两条 `grep` 计数（4 行 / 2 行）= 改前逐行实读计数（`helpers.mjs` 改前 `:454` `:461` `:470` 大写 + `:478` 小写 = 4；`:469` `:477` = 2），该命令本身改前未单独跑；「改后」两列 = 实跑读数 0 / 0。

## §6 验证与收口（父代理）

**验证与收口（2026-10-19 · 父代理）**

**① 机检门**：`doc_check(mode:"gate")` = **PASS**（会话重启后；全域 197 档 0 命中）。

**② 实施验证读数**：
- `node scripts/prompt-refs-check.mjs` = **命中 0**（改前 5）——J1/J2/J3 三式零命中，`OK` 出口
- 改动面：`thincoder-core/agent/helpers.mjs`（`Content authority` → `Content basis` + 删批档固定片段）∥ `tool-docs/batch.md` ∥ `tool-docs/doc_check.md` ∥ `agent-tools/batch-lifecycle.mjs`（六处文本面）
- `node --check` 全绿；批内定向核读逐处命中

**③ 单元测试零留存**：本批为文本面笔，无新增测试档（由 `prompt-refs-check` 三式覆盖）。

**④ 集成面**：提示词面回归 = `prompt-refs-check` 全域（69 提示词档 + 代码面），**无需另增集成用例**。

**⑤ 修正轮落地前置**：本批 0 修正轮（首轮即 clean）。

**⑥ 搁置清单回核**：无。**⑦ 暂缓批复核：无**。**⑧ 用户文档面同拍**：本批改的是模型可见文本，**已在同轮改净并复核**。

**⑨ 台账核销**：见本轮收口的 ledger 查询面。

**⑩ 本批意义**：这是今晚唯一一批**从「校验红」变成「校验绿」**的——`prompt-refs-check` 5 → 0，且此后每一批的交付都复跑它，**读数一直保持 0**。
