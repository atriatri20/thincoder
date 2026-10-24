# 2026-10-22 · manifest-read-subagent
> 六段 append-only，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 编制：主 agent · 2026-10-22 · 来源 = 用户 2026-10-22 13:52「我觉得子代理也要给 manifest 的权限，不能只有主代理」。
> 台账 = #1738（MANIFEST · 归批）。前情 = docs/batches/2026-10-22-prompt-rewrite.md（FR46 提示词改写 · 进行中）。
## §1 讨论（主 agent）
**状态行**：已收口 2026-10-22
<§1 模板占位：本批条目 / 关键判据 / 授权口径>
## §2 批次任务与设计（eng-designer）
**状态行**：设计完成
<§2 模板占位：本批条目（覆盖） / 设计档落点 / 机制设计 / 受影响文件与测试覆盖 / 验收对照 / 关键决策 / 上抛项>

**本批条目（覆盖 · 台账 #1738）**

| # | 条目 | 源（指针） |
|---|---|---|
| 1 | 用户令：子代理也要有 manifest 权限——读面开给子代理，写面仍归主 agent | 批次档 §1 · 设计 `docs/core/design/MANIFEST.md` §2.10.1 |
| 2 | 需求功能点 ⑦ 权限面：写面只挂主 agent；读面 = 只读变体（同名工具、`action` 枚举只剩 `read`） | `docs/core/requirements/ENGINEERING-MODE-V2-SPEC-MANIFEST.md:34` |
| 3 | AC-M1-12：子代理写面不可达；读面 = 只读变体；主 agent 写放行 | `docs/core/requirements/ENGINEERING-MODE-V2-SPEC-MANIFEST.md:57` |

**不在本批（明确排除）**：提示词档改用 `manifest read`（设计 §2.10.1 边界——另批另裁）；写面（`init` / `write`）放开给子代理；改 `readAction` 校验 / 写门 / 白名单 / spawn `files` 二道防线 / `docRoot` 解析（同边界）。

**设计档落点**：`docs/core/design/MANIFEST.md` §2.10.1（`:707` 起）。机制设计、工具定义逐字块、描述档全文、挂载行、四条写面判据、受影响文件表、用例 T84–T86、边界与关键决策 KD-M1-51–54 全部落在该节——本节只引不抄。

**机制摘要（指针形；逐字块与判据见设计 §2.10.1）**

- 新增只读变体 `manifestReadTool`：同名 `manifest`，`action` 枚举 `["read"]`，参数只剩 `target`，`readonly: true`。
- 挂载 = 全部 depth>0 五段（eng-coder / eng-designer / coder / consult / 兜底），与 `ledgerReadTool` / `teamLedgerReadTool` 同律。
- `readAction` 增 `canInit` 参数：缺省 `true` ⇒ depth-0 输出逐字零变；`false` 时缺档提示行不指 `init`。
- 描述单源 = 新描述档 `manifest-read`；主 agent 描述档首句随正；登记册双导出，VSC 端侧零改。

**受影响文件**：见设计 §2.10.1「受影响文件」表 8 行（产品 5 · 工程工具面 1 · 设计档 1 · 本批一次性单测 1）；行数与增量预算以该表为准。本批设计轮触及面 = 设计档该节 + 本节；**零改代码**。

**验收对照（回指设计 §2.10.1「验收对照」表）**：AC-R1 schema 窄化 · AC-R2 写面机械不可达 · AC-R3 读面等价 · AC-R4 描述单源 · AC-R5 写面零改 · AC-R6 上下文与包面——每条核法见设计同表；用例 T84（正常）/ T85（越权错误）/ T86（缺档边界）见设计「用例」表。

**需求回读（父侧收正后）**：`docs/core/requirements/ENGINEERING-MODE-V2-SPEC-MANIFEST.md:34` 与 `:57` 与设计 §2.10.1 **同口径、零差异**——写面只挂主 agent（沿写门）+ 子代理写面两道防线不动；读面 = 只读变体（`action` 枚举 `["read"]`）；主 agent 写放行。未改需求档。

**上抛项**：P1（需求两行权限面口径）已由父侧办结。P3（会话内 `doc_check` gate 因引擎档 mtime 晚于进程启动报 ERROR）由父侧重启后复跑；本节格式读数另以独立进程核过。

**修轮记账（设计评审 §3 轮次 1 · changes-required 八条已落 · 2026-10-22）**

| 编号 | 落点（设计 `docs/core/design/MANIFEST.md` §2.10.1 现行行） |
|---|---|
| 1 🔴 | T68 预期收正（§3.2 用例表 T68 行 = `:1138`）+ 受影响文件行 7 编辑点列入 T68 |
| 2 🟡 | AC-R3 收窄：「`ok` / `invalid` / `workspace` 三态逐字一致；`missing` / `no-project` 仅 hint 行不同」 |
| 3 🟡 | 新增「同名双导出的影响面勘察」五条（按工具名建表 / 按导出名枚举 / `export *` / 按名取只读性 / 结论）+ AC-R6 机判「枚举读数两条 `manifest`」 |
| 4 🟡 | 受影响文件新增行 8 = `TOOLS.md`「**无需改**」+ 三面判据（工具名不变 ∥ §6.7 要旨行仍真 ∥ 逐面契约在本档） |
| 5 🔵 | 陈旧数字收正为 as-of：§2.10 `:602`、§2.3 行 55（`:199`）、行 51（`:195`）各标 as-of 并指现行读数；§2.10.1 行 6 标 as-of（53 ⇒ 54） |
| 6 🔵 | 描述档全名逐字（`thincoder-core/tool-docs/manifest-read.md`，围栏块）+ 「`DESC(name)` = 读 `tool-docs/<name>.md`，`name` = 描述档名 ≠ 工具名」成句 |
| 7 🔵 | `readonly: true` 保留并点名四门（`dispatch.mjs:61` / `:177` / `record-results.mjs:98` / `helpers.mjs:375`），并入 AC-R1 断言 |
| 8 🔵 | 受影响文件行 9 补「一次性之由」+ 代价明写（AC-M1-12 收口后无常设回归位——明示，不假称已覆盖） |

**受影响文件表现行 = 9 行**（本次新增行 8 `TOOLS.md`「无需改」；行号 1–9）。设计档 `:817` 行 7 现值 = 984 → **1,145**（+161，预算 ≤+70，超帽 91——逐字块三段所致，同本节验收②）。
**判据语义未改**：第 2 / 3 / 6 / 7 / 8 条只把已写内容写成可判；第 1 条只消两条互斥断言；第 5 条只标 as-of、不重测盘面——盘面数字由实施轮落盘前复读确认。
**§2 早前记的「表 8 行」= 修轮前计数**，现行以本行为准（9 行）。

## §3 设计评审（评审子代理）

### 轮次 1（评审子代理）

### 设计评审 · MANIFEST.md §2.10.1 子代理只读面 + 需求 :34 / AC-M1-12

| # | 类别 | 严重度 | 问题 | 建议 |
|---|---|---|---|---|
| 1 | 需求覆盖 / 验收一致性 | 🔴 | §2.10.1 把 `manifest` 只读变体挂进全部 depth>0 段（`MANIFEST.md:779`：「manifestReadTool」入 eng-coder 段），AC-42① 亦断言「五格（eng-coder / eng-designer / coder / consult / 兜底）各含恰一 `manifest`」（`MANIFEST.md:1036`）；但同档 §3.2 的 T68 预期仍写「depth>0 全格零」（`MANIFEST.md:1120`）——同一机制（子代理装配面有无 `manifest`）两处相反；且 §2.10.1 受影响文件行 7 的编辑点只列「本块 + `:56` / `:600` / `:196` 收正 + AC-42」（`MANIFEST.md:816`），未列 T68 行 ⇒ 实施后档内自带两条互斥验收 | 把 §3.2 T68 行补进 §2.10.1 受影响文件的编辑点，并把其预期改为「depth>0 五段各含恰一 `manifest`（只读变体，`action` 枚举 = `["read"]`）」；② 主 agent 实调放行子句保持 |
| 2 | 验收可判性 | 🟡 | AC-R3 自相矛盾：既要求「`read` 五态输出与全量变体逐字一致」（`MANIFEST.md:825`），又要求只读面 `missing` / `no-project` 提示行零 `action=init`；而全量变体这两态的行**含** `action=init`（`MANIFEST.md:754`）⇒ 2/5 态按字面必不逐字一致，AC 不可通过 | 收窄为「`ok` / `invalid` / `workspace` 三态逐字一致；`missing` / `no-project` 仅 hint 行不同（逐字见 §2.10.1 的 `canInit` 两条）」 |
| 3 | 可行性 / 勘察 | 🟡 | 登记册同名双导出是本仓首例：先例 `ledgerReadTool` **不入**登记册（`MANIFEST.md:842`：「偏离一处 = 读变体经登记册双导出」），本批首次让 `thincoder-core/agent-tools.mjs` 同时导出两个 `name: "manifest"`（`MANIFEST.md:811`：「`:16` 改双导出」）；档内未勘察任何以「工具名」为键的消费面（探针枚举 / `toolByName` / VSC `export *`），AC-R6 只断言「枚举含读变体」，无法发现同名塌缩。**unverified**：相关消费面代码不在本轮阅读范围 | 先例行补一句同名双导出的影响面（以名为键的消费面逐个点名，或明确「无」），并给一条可机判：枚举读数出现两条 `manifest`（而非一条） |
| 4 | 相邻面协调 | 🟡 | 上一批把 `manifest` 登记进 `docs/core/design/TOOLS.md` §6.2 元工具清单 / §6.7 要旨行（`MANIFEST.md:237`），本批新增**子代理可见的只读面**，但 §2.10.1 受影响文件表 8 行（`MANIFEST.md:810-817`）既无 TOOLS.md 行、也未声明「无需改」。**unverified**：TOOLS.md §6.7 要旨 / 逐角色工具表是否含「只挂主 agent」表述不在本轮阅读范围 | 在受影响文件表或边界行二选一明写：「TOOLS.md §6.7 要旨行无需改（判据 = 工具名不变）」或把该档列为编辑点——别留空 |
| 5 | 文档卫生 / 数值漂移 | 🔵 | 同一常量两处活值：`EXPECT["tool-docs"]` 在 §2.10.1 行 6 写「53 ⇒ **54**」（`MANIFEST.md:815`），§2.10 写「48 ⇒ **50**」（`MANIFEST.md:602`）、§2.3 行 55 写「**50**」（`MANIFEST.md:199`）；同类：`agent-tools.mjs` 29 行（`MANIFEST.md:195`）vs 32 行（`MANIFEST.md:811`） | 实施轮先读盘复测，把旧两处收正为同一值（或在旧行标 as-of），避免落盘时择错值 |
| 6 | 清晰度 | 🔵 | 描述档路径未逐字给出：正文只写「新描述档（`thincoder-core/tool-docs/` 下 `manifest-read`」（`MANIFEST.md:721`）、表内亦只写 `manifest-read`（`MANIFEST.md:813`）——AC-R4「逐字节相等」与行 6 的档数计数都依赖确切文件名；`DESC(name)` 的 name→文件名规则（此处 name ≠ 工具名 `manifest`）未成句 | 写全 `thincoder-core/tool-docs/manifest-read.md`，并补一句「`DESC(name)` = 读 `tool-docs/<name>.md`」；若仓内有「描述档 ↔ 工具名 1:1」检查，一并点名 |
| 7 | 未断言字段 | 🔵 | 只读变体声明了 `readonly: true`（`MANIFEST.md:742`），但四条写面判据表（`MANIFEST.md:788-793`）与 AC-R1–R6 无一处消费 / 断言该字段；分类面已由 `dispatch-gates` 的「`manifest read` 已判只读类，本批零改」（`MANIFEST.md:845`）承担 | 点名该字段的消费者（哪个门读它）并入 AC；否则删掉——无消费者的字段会成为下一个「看起来在管权限」的假闸 |
| 8 | 测试持久性 | 🔵 | 受影响文件行 8 把单元测试档定为「本批一次性——实施轮新建，收口即删」（`MANIFEST.md:817`），无理由句；AC-R1 / R2 / R4 / R6 的可机判核法只落在这份一次性档（`MANIFEST.md:823-828`）⇒ 收口后权限面（schema 窄化 / execute 门 / 描述逐字节）零持久守卫 | 写明为何一次性（如项目既有惯例），或把这四条断言并入既有装配 / 描述面测试档，使 AC-M1-12 有长期回归位 |

计数：🔴 1 · 🟡 3 · 🔵 4（共 8 条）。
已核：文档地图在位（`thincoder/docs/README.md`——AGENTS.md 声明；本轮未读，判据来源）；§2.10.1 就地落于拥有 M1 模块设计的档，零新建设计档 ⇒ 归属合规；受影响文件 8 行均带现值 + 增量预算，无档越 500 行、无函数层级风险；先例行（`MANIFEST.md:842`）与勘察行（`MANIFEST.md:843-848`，含「工作目录外公共源未勘察」明示）均在位。

VERDICT: changes-required

### 轮次 2（评审子代理）

### 第 2 轮复验（八条：🔴1 · 🟡3 · 🔵4）

| # | 原# | 文件 | 严重度 | 状态 | 结论 |
|---|-----|------|--------|------|------|
| 1 | 1 | docs/core/design/MANIFEST.md | 🔴 | Fixed | T68 已收正（`:1138`「depth>0 五段（eng-coder / eng-designer / coder / consult / 兜底）各含恰一 `manifest`（只读变体，`action` 枚举 = `["read"]`）」，编辑点表同载「**§3.2 用例表 T68 行预期收正**」`:824`）——与 §2.10.1 挂载行 `:787-791` 及 AC-42① `:1054` 现一致 |
| 2 | 2 | docs/core/design/MANIFEST.md | 🟡 | Fixed | AC-R3 已收窄（`:834`「`ok` / `invalid` / `workspace` 三态输出与全量变体逐字一致」，`missing` / `no-project` 两态「**仅 hint 行不同**」），与 `canInit` 两条逐字（`:762-763`）自洽，按字面可通过 |
| 3 | 3 | docs/core/design/MANIFEST.md | 🟡 | Fixed | 新增「同名双导出的影响面勘察（本仓首例——以「工具名」为键的消费面逐个点名）」（`:853-860`，四点名 + 结论）+ AC-R6 增可机判「枚举读数出现**两条** `manifest`（不是一条）」（`:837`） |
| 4 | 4 | docs/core/design/MANIFEST.md | 🟡 | Fixed | `:825` 新列 TOOLS.md 行并给「**无需改**」三面判据（工具名不变 / `:222` 要旨行对全量变体仍真 / 摘要不随变体扩写）——协调项闭合 |
| 5 | 5 | docs/core/design/MANIFEST.md | 🔵 | Fixed | 旧值全标 as-of + 指现行读数（`:195`「**现行读数** 32 行」/`:199`「**现行读数**见 §2.10.1 受影响文件行 6 = 53 ⇒ 54」/`:602` 同）；行 6 `:823` 另加「实施轮落盘前复读一次」 |
| 6 | 6 | docs/core/design/MANIFEST.md | 🔵 | Fixed | 描述档全名逐字给出（`:725-726`）+ DESC 规则成句（`:721-722`「**`DESC(name)` 的 `name` = 描述档名，不是工具名**……`join(TOOL_DOCS_DIR, `${name}.md`)`」） |
| 7 | 7 | docs/core/design/MANIFEST.md | 🔵 | Fixed | `readonly` 消费者点名并断言：AC-R1（`:832`「只读变体 `readonly === true`——消费面四门逐门点名」，四门 = `dispatch.mjs:61` / `:177` / `record-results.mjs:98` / `helpers.mjs:375`） |
| 8 | 8 | docs/core/design/MANIFEST.md | 🔵 | Unfixed | 理由 = 「**一次性之由** = 项目测试纪律（单元测试档 = 改动期反馈回路，收口即删、零保留）」（`:826`）——但同档 §2.11 行 14-17（`:938-941`）新增 / 修改 `thincoder-core/test/*.test.mjs` 且无「收口即删」句，所述纪律不被本档证据支持；「AC-M1-12 收口后无设回归位」的代价仍成立（🔵 不阻塞） |
| 9 | (new) | docs/core/design/MANIFEST.md | 🟡 | New: 修复引入的断言错误 | `:859`「⇒ 两变体皆 `readonly: true`」与 `:720`（仅只读变体带该位）及 §2.10 `:601`「`init` / `write` 保持侧效门（审批不绕过）」相反；若据该句给全量变体加位，`dispatch.mjs:177`（`tool.readonly || …`）即被绕过。`unverified`：`manifestTool` 现值未在本轮读取范围内。建议改为「只读变体 `readonly: true`；全量变体不带该位（只读性由 action 分类面承担）」 |

**计数**：修复 7 · 未闭合 1（🔵）· 新增 1（🟡）· 🔴 0。

VERDICT: pass

## §4 用户批准（主 agent）

**批准记录（主 agent 记）**

- 用户 2026-10-22 13:52 原话：「我觉得子代理也要给 manifest 的权限，不能只有主代理」——本批的需求起点。
- 14:46 原话：「子代理manifest只读面先跑完」——排在发版之前先做完。
- 14:52 原话：「点火」——点设计评审（第 2 轮）。
- 14:52 原话：「自动跑完」——授权本批全链自动跑到底（评审 → 修 → 实施 → 收口），父侧不再逐步请示。

**授权口径**：整批令覆盖批准门与实施启动；停相只留四种（🔴 未决 / 偏离批准设计 / 用户明示 hold / 范围变更）。本批四次停相均未触发。

## §5 实施记录（eng-coder）

**实施轮 · eng-coder · 2026-10-22**（任务书 = 设计 `docs/core/design/MANIFEST.md` §2.10.1 · 台账 #1738）

**落点逐处（含读数）**

| # | 文件 | 改动 | 读数 |
|---|---|---|---|
| 1 | `thincoder-core/agent-tools/manifest.mjs` | `readAction(target, { canInit = true } = {})`（两态 hint 分支）+ 新增导出 `manifestReadTool`（逐字 = 设计「工具定义」块） | 200 → 233 行（+33，预算 ≤+35） |
| 2 | `thincoder-core/agent-tools.mjs` | `:16` 双导出 `manifestTool, manifestReadTool` | 32 行（净增 0） |
| 3 | `thincoder-core/agent/family-tools.mjs` | `:29` 解构 + depth>0 五段挂载（`manifestReadTool` 插在 `teamLedgerReadTool` 后）+ `:151-152` / `:185-186` 注释 | 204 → 206 行（+2，预算 ≤+4） |
| 4 | `thincoder-core/tool-docs/manifest-read.md` | 新建（设计「描述全文」块） | 1,132 字符（机制限 ≤1,500） |
| 5 | `thincoder-core/tool-docs/manifest.md` | 首句收正（删「subagents can neither see nor write」，明只读变体 + 写面归主 agent） | 3,759 → 3,803 字符（+44，预算 ≤+80） |
| 6 | `thincoder-vscode/scripts/check-vsix.mjs` | `EXPECT["tool-docs"]` 53 → 54 + `:11-12` / `:37-38` 注释随正 | 档数实读 54（盘上 53 + 新档 1） |
| 7 | `thincoder-core/test/manifest-read-subagent.test.mjs` | 新建一次性单测 5 用例（AC-R1 / R2 / R3 / R4 / R6） | 169 行；按测试纪律收口即删 |

**出清单改动（1 处 · 附由）**：`thincoder-desktop/scripts/check-dist.mjs:126` `PROMPT_FACE_EXPECT` 53 → 54（`:18` / `:125` 注释同步）。由 = 该档自述「同源 = `check-vsix` `EXPECT`——两处硬等，改一改二」；不随正 ⇒ 桌面 D 族打包断言 `:186`（`repo.size === PROMPT_FACE_EXPECT[dir]`）必红（盘上 54 ≠ 53）。设计受影响文件表只列 check-vsix（漏项），实施轮按该档自述的「改一改二」补齐。

**决策披露（三处与设计/任务书的口径差，逐条给由）**
1. `readAction` 签名取设计块逐字形 `readAction(target, { canInit = true } = {})`；任务书 bullet 1 的 `readAction(args, ctx, …)` 与设计块调用 `readAction(resolveTarget(args, ctx), { canInit: false })` 不相容——设计 = 权威，取设计块，`manifestTool` 的 `read` 分支调用面零改（仍 `readAction(target)`，缺省 `canInit=true` ⇒ 输出逐字零变）。
2. `manifest-read.md` 第 1 段折为两行：设计块该段单行 360 字符，原样落盘 ⇒ `doc_check` 行宽门（300 字符）REFUSED；措辞零改、仅插一个换行，AC-R4 的「description = 描述档逐字节」由测试断言仍成立。
3. 设计 `:859`「两变体皆 `readonly: true`」与工具定义块矛盾：实现按块 + 红线（只读变体 `readonly: true`；`manifestTool` 保持 `readonly: false`）。该句收正 = eng-designer 笔（设计评审轮次 2 第 9 条已点）。

**验收读数（AC-R1–R6）**

- **AC-R1 ✅** 五段夹具 `assembleFamilyTools({depth:1, role})`（eng-coder / eng-designer / coder / consult / 兜底）各恰一 `manifest`（对象 === `manifestReadTool`），`action.enum = ["read"]`、无 `key` / `value`、`readonly === true`；`depth:0` × `engineering` 两值各恰一 `manifestTool`（三枚举、`readonly === false`）。
- **AC-R2 ✅** `{action:"init"}` / `{action:"write", key:"phase", value:"production"}` / `{action:"bogus"}` 三例全抛 `manifest read: refused — …`；盘 sha256 前后相等。
- **AC-R3 ✅** `ok` / `invalid` / `workspace` 三态双变体输出逐字相等；`missing` / `no-project` 差异恰一行 hint——只读面零 `action=init`、全量面保留。
- **AC-R4 ✅** 两变体 `description` 与各自描述档逐字节相等；`manifest.md` 首句无 `subagents can neither see nor write`，含「read-only variant」+「init / write stay main-agent only」。
- **AC-R5 ✅** `manifestTool` 体零 diff（`readonly: false` · init/write 分支 · 白名单 · `writer: "main"`）；`dispatch-gates.mjs` / spawn `files` 域 / `docRoot` 解析零改；全量套 40/40。
- **AC-R6 ✅** 新描述档 1,132 字符（≤1,500）；登记册枚举两条 `manifest`（`manifestReadTool` readonly=true enum=["read"]；`manifestTool` readonly=false enum=["read","init","write"]）；`tool-schema-size` 读数 `toolCount: 53` ∧ `failed: []`；`check-vsix` EXPECT = 盘上 54。

**五门读数**

1. `node scripts/prompt-refs-check.mjs`（仓根）⇒ 提示词面 70 档 · 代码面 463 档 · **命中 0** · `OK(prompt-refs)`。
2. `cd thincoder-core && node test/run.mjs` ⇒ **40/40** 全绿（基线 35 + 本批 5）。
3. `doc_check(mode:"gate")`（docs = 两工具描述档）⇒ 首行 `DOC-CHECK GATE: PASS`（2 档全清）。
4. check-vsix 等价读数 ⇒ 盘上 54 = `EXPECT["tool-docs"]` 54；`check-dist` `PROMPT_FACE_EXPECT` 亦 54（三方一致）。
5. 两变体装配夹具 ⇒ 见 AC-R1（同一档内断言，`node --test` 5/5）。

**审计与评审轮次 · 终态**

- 内部分歧审计（read-only `explore`）：1 轮 ⇒ `clean`（四类偏差零命中；两处已披露项判为非分歧）。
- 独立代码评审（advisor · code）：轮次 1 ⇒ `changes-required`（🔴1 / 🟡2 / 🔵3）。已修：check-dist 53→54（🔴）· family-tools `:152` 陈旧括注「子代理各段零挂」（🟡）· check-vsix 头部读数 53→54（🔵）。报告级未修：`prompts/persona-eng-designer.md:16` 的「(main agent only)」= 设计边界（提示词另批）· 描述档折行（doc_check 门所致）· 他档 53 计数漂移。
- 轮次 2（复验）⇒ `pass`；另两条 🔵（check-dist `:18` / check-vsix `:37` 注释残留旧口径）已就地收正，无未决 must-fix。
- **终态 = `clean`**（审计 clean · 代码评审 pass · 0 未决 🔴 / 🟡；未修项均为报告级 / 设计边界）。

**待父侧路由（知会）**：① 设计 `:859` 与工具定义块矛盾（eng-designer 收正）；② `prompts/persona-eng-designer.md:16` 现为假断言（提示词另批的边界内，本批未动）；③ `docs/core/design/CORE-UNIFICATION.md` / `PROMPT-SYSTEM.md` / `docs/RELEASE.md` 等仍载「tool-docs 53」读数（本批不动文档层，按盘上 54 统一收正即可）。

## §6 验证与收口（父代理）

**验证与收口（父侧 · 2026-10-22）**

**① 父侧亲验读数（不采信回报，逐项自跑）**

| 项 | 读数 |
|---|---|
| `manifestReadTool` | `name=manifest` · `readonly=true` · `enum=["read"]` · 参数 = `action` + `target`（无 `key` / `value`） |
| `manifestTool` | `readonly=false` · `enum=["read","init","write"]`——**写面审批门未被绕过** |
| 登记册同名项 | 恰两条（`manifestTool` / `manifestReadTool`） |
| depth>0 装配（eng-coder / coder / consult 抽样） | 各 count=1 · `readonly=true` |
| depth:0 装配 | count=1 · `readonly=false` |
| `node scripts/prompt-refs-check.mjs` | 提示词面 70 档 · 代码面 463 档 · **命中 0** |
| `cd thincoder-core && node test/run.mjs` | 交付时 **40/40**；一次性档删除后 **35/35**（基线） |
| `thincoder-core/tool-docs/*.md` | **54 档**（含新增 `manifest-read.md`） |

**② 一次性单测档**：`thincoder-core/test/manifest-read-subagent.test.mjs` 按设计行 9 收口删除（40/40 读数落在此行，档不留存）。**代价按设计明写**：AC-M1-12 无常设回归位，长期守卫靠集成场景树与触碰 `family-tools.mjs` 时的装配断言重跑。

**③ 实施席出清单改动（1 处，已披露并采纳）**：`thincoder-desktop/scripts/check-dist.mjs` 的 `PROMPT_FACE_EXPECT` 53 → 54。设计受影响文件表只列 `check-vsix`，漏了桌面同源硬等；不随正则桌面 D 族打包断言必红。**判为设计漏项**，非越界。

**④ 设计文档面收正（`#5`）**：`:859` 那句「两变体皆 `readonly: true`」已改正（三行：该表不含 `manifest` ⇒ 按名恒 false；两变体实读 `manifest.mjs:225` true ∥ `:141` false；不得给全量变体加该位的原因）；设计档计数 6 档 29 处 53→54 / 52→53 已改。

**⑤ 残留债（如实记，不掩）**：6 档设计文档整档 gate 报 **18 条存量悬空指针**（`CORE-UNIFICATION.md` 14 · `RELEASE.md` 3 · `PACKAGING.md` 1），全部在本次改动行之外，属既有裸名指针债 `#1731`。需求档 3 处计数（`requirements/CORE-UNIFICATION.md:19` · `requirements/PROMPT-SYSTEM.md:11` / `:244`）由父侧收口同轮补改。

**⑥ 集成测试**：本笔改产品代码（工具面 + 装配面），但无既有集成用例覆盖该面；35/35 单测 + 五个夹具读数为本批测试门。

**⑦ 台账**：`#1738` 在途 → 待核销 → **已核销**（依据 = 本节 ①）。

**⑧ 暂缓批复核**：无暂缓批 ⇒「暂缓批复核：无」。

**⑨ 设计评审链**：两轮（`#1` changes-required 八条 → `#3` pass）；令牌 `designId 96c2a2c3` 已消耗于实施。
