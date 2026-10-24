# 2026-10-17 · code-defect-batch
> 六段 append-only，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 编制：主 agent · 2026-10-17 · 来源 = 用户 2026-10-17 23:10「都处理掉」+ 23:40「一起全派出去」；本批 = C 组（产品码缺陷小批 · 设计先行）。
> 台账 = #1628（core · 归批）。前情 = docs/batches/2026-10-17-ledger-cleanup-light.md §6（已收口 2026-10-17）。
## §1 讨论（主 agent）
**状态行**：已收口（四条缺陷落地 + 父侧亲验（批内 9/9 ∥ server 19/19）；环消 · 非有限落 due now · 失败可见 · --json 契约恢复；设计档随正 4 档 + 生成面重跑；#1526 判不成立）
<§1 模板占位：本批条目 / 关键判据 / 授权口径>

**本批条目（5 条）**

| # | 台账 | 缺陷 | 判据（修后） |
|---|---|---|---|
| 1 | `#1615` | 模块环：`chat.mjs → chat-asks → member-relay → chat.mjs` | 零环（DFS 探针）+ 应答词表四 kind 行为不变 + 既有审批卡 17/17 |
| 2 | `#1502` | 核 `timer` `list` 非有限缺口 ⇒ `Infinity:NaN:NaN` | 非有限行不吐 `NaN`/`Infinity`，落 `due now`；有限三行零变 |
| 3 | `#1526` | `loadConfig()` 裸调用 | **判不成立**（父侧裁：实现与 `IPC.md:328` 声明一致；畸形档 = 前置失败，映射五值即假回执）。次级发现（注释与代码相抵）已由父侧收正 |
| 4 | `#1589` | `read-data.mjs` 两处 `.catch(()=>{})` 静默吞错 | 失败经 `ctx.log` 可见（同因不刷屏）、成功复位、不崩 |
| 5 | `#1522` | `dev-link --json --win32-only` 破 stdout JSON 契约 | `--json` 在场 ⇒ stdout 恰一段可解析 JSON，跳过行入 stderr；无 `--json` 原样 |

**关键判据**：四条改法都属**缺陷类**（回到既有意图，不加机制、不改契约）；`#1526` 是**台账错、代码对**——按声明式设计保持 throw。

**授权口径**：用户 2026-10-17 23:10「检查台账，分分批都处理掉」+ 23:40「一起全派出去」+ 23:36「自动跑完」= 本批各子批发火令。

**批径**：产品码面（`thincoder-server/**` ∥ `thincoder-core/**` ∥ `thincoder-cli/**` ∥ 仓根 `scripts/**`）；设计 = 本档 §2；评审 = `advisor#105`（pass）；实施 = eng-coder（designToken 在册）。

## §2 批次任务与设计（eng-designer）
**状态行**：设计完成（fix 轮：advisor#105 号 1–15 逐条处置——12 条改 §2；号 5 属 §1（父侧）；号 9/11 转跟进；实读校正 3 处）
<§2 模板占位：本批条目（覆盖） / 设计档落点 / 机制设计 / 受影响文件与测试覆盖 / 验收对照 / 关键决策 / 上抛项>

**本批简报**（initial 轮 · 设计先行 · 产品码零写（唯一例外 = 父侧已落一行注释）· 2026-10-17）
任务书 = 用户 23:40「一起全派出去」；本批 = C 组五条（台账 `#1628`：`#1615` ∥ `#1502` ∥ `#1526` ∥ `#1589` ∥ `#1522`）。
交付 = 本表（可直接照着改）+ 交付报告；实现交下一轮 eng-coder（`files` 只声明本批档）。产品码零写——唯一例外 = 父侧已落的 `thincoder-core/team.mjs:89` 一行注释（§2③；§5 表已记）。
四条属**缺陷类**（实现与意图不符）；`#1526` 经父侧 2026-10-17 裁定**不成立**（实现合声明纪律）⇒ 本批零改动。四条缺陷不新增机制、不改契约、不拓面。

### 1. 实读定位（逐条「成立 ∥ 不成立 + 证据」）

| # | 台账 | 实读坐标（`file:line`） | 复现判据（本轮亲跑，非转述） | 结论 |
|---|---|---|---|---|
| 1 | `#1615` 模块环 | `chat.mjs:47` → `chat-asks.mjs:24` → `member-relay.mjs:23` → `chat.mjs` | 依赖图探针（`thincoder-server/src/**` **93 档**，相对 import，DFS）⇒ **恰 1 环** = 上列三点互引 | **成立** |
| 2 | `#1502` 核 `list` 非有限 | `agent-tools/timer.mjs:20-24`（`localText`）∥ `:38-44`（`durText`）∥ `:53` ∥ `:58-61` | 假 agent 置 `expiresAt=Infinity`（一次性 ∥ `at:true`）与 `NaN` + `execute({list:true},{now:1e6})` ⇒ 逐字 `next Infinity:NaN:NaN` ∥ `at NaN-NaN-NaN NaN:NaN` ∥ NaN 行 `due now`（对照） | **成立** |
| 3 | `#1526` `loadConfig` 裸调用 | `team.mjs:74` ∥ `:91` ∥ `:118` ∥ `:238`；throw 单点 = `config.mjs:315-323` | 临时 config 写坏 JSON ⇒ 四函数全 throw（零请求零写盘） | **不成立**（父侧 2026-10-17 裁：畸形档拒绝直传 = 声明纪律） |
| 4 | `#1589` 静默吞错 | `thincoder-cli/src/acp/read-data.mjs:118-119`（两处 `.catch(() => {})`） | 假 ctx（`getCwd` 抛 `probe-boom`）+ `intervalMs:20` ⇒ `start()` 后 120ms：**诊断 0 条 ∥ unhandledRejection 0 条**；`watcher.check()` 直调仍 reject（说明失败真实发生、被吞） | **成立** |
| 5 | `#1522` `--json` 契约 | 实址 = 仓根 **`scripts/dev-link.mjs`**（台账拼写 `thincoder-cli/src/scripts/` 为旧形，以盘为准）∥ 契约行 `:26` ∥ 平台门 `:155-158` ∥ JSON 写点 `:164` | `main(["--json","--win32-only"], { platform:"linux" })` ⇒ exit 0、stdout = 人读行 **1 行**、stderr 空、`JSON.parse` 失败（`Unexpected token 'd'`） | **成立** |

坐标收正（三处，以盘为准）：`#1589` = `thincoder-cli/src/acp/read-data.mjs`；`#1522` = `scripts/dev-link.mjs`；`#1502` 的「核 `list`」= **timer 工具的 `list` 动作**（不是名为 `list` 的工具）。

### 2. 改法表（file:line ∥ 改前 → 改后形 ∥ 先例坐标）

**① `#1615` 模块环 — 应答词表下沉叶子档**

| 落点 | 改前 → 改后 |
|---|---|
| 新 `thincoder-server/src/agent/ask-vocab.mjs`（≈30 行，**零 import 叶子**） | 新建：`ASK_KINDS` ∥ `ITEM_VERDICTS` ∥ `BATCH_VERDICTS` ∥ `askAnswerBodyOf` 自 `member-relay.mjs` **逐字搬入**（零语义改） |
| `member-relay.mjs:33-38` ∥ `:45-68` | 删（搬出）；`:23` 邻位加 `import { ASK_KINDS, ITEM_VERDICTS, BATCH_VERDICTS, askAnswerBodyOf } from "./ask-vocab.mjs"`（本档留用点：`:375` 用 `ASK_KINDS` ∥ `:400` 用 `askAnswerBodyOf`——import 行不可省）+ `export { ASK_KINDS, ITEM_VERDICTS, BATCH_VERDICTS, askAnswerBodyOf } from "./ask-vocab.mjs"`（**公共面零变**——重导出非第二份） |
| `chat-asks.mjs:24` | `from "./member-relay.mjs"` → `from "./ask-vocab.mjs"`（导入清单实读 = 仅 `askAnswerBodyOf`；`:23` = `chat-store.mjs` 的 `appendMessage`——整行改源可行）；档头 `:4` 同拍改词（「自 `ask-vocab.mjs` 导入复用」） |
| 结果边 | `chat-asks → {chat-store, ask-vocab}`；`member-relay → chat.mjs` 保留（单向）；环消。`chat.mjs` **0 行 Δ**（`ADMIN-AGENT.md:356` 的 `chat.mjs:230` 坐标不漂） |

**切点举证（实读）**：`askAnswerBodyOf` 依赖集（`member-relay.mjs:48-68`）= `ITEM_VERDICTS` ∥ `BATCH_VERDICTS` 两名（均随搬）——不引用 `ASK_KINDS`、不调本档其它件、不 import 任何模块 ⇒ 搬出后新档 = 零 import 叶子（`ASK_KINDS` 随搬 = 公共面需要，非函数依赖）。

先例 = `thincoder-core/ledger-db.mjs:137-139`（枚举常量档单源 + 原名 re-export 保公共面零变——同一处方，消 `ledger-cmd ↔ ledger.mjs` 环）；档名 `ask-vocab.mjs` = 前批上抛已点名（`docs/batches/2026-10-17-admin-approval-cards.md:172`）。
不选（被否）：① 下沉「文本词表」（`argsTextOf` 等四件）——切点更大（4 导出 + 其用户），且非评审建议方向；② 让 `member-relay` 不再依赖 `chat.mjs`——同样解环但改动面大（掩蔽/截断单源要去第三档）。

**② `#1502` 核 `list` 非有限 — 两处消费点守卫**

| 落点 | 改前 → 改后 |
|---|---|
| `timer.mjs:53` | `if (t?.at === true) return \`at ${localText(t.expiresAt)}\`` → `if (t?.at === true && Number.isFinite(t.expiresAt)) return …`（非有限 ⇒ **段不插** ⇒ 落 `one-shot` 形，不吐 `NaN-NaN-NaN NaN:NaN`） |
| `timer.mjs:60` | `return at > now ? \`next ${durText(at - now)}\` : "due now"` → `return Number.isFinite(at) && at > now ? … : "due now"`（非有限 ⇒ **`due now`**——与既有 NaN 支同桶） |

**kind 列派生（实读 `timer.mjs:48-55`）**：`kindText` 判序 = `everyMs`（有限且 >0）→ `daily`（`DAILY_RE` 命中）→ `at === true` → `one-shot` 兜底。`:53` 守卫把「`at:true` ∧ `expiresAt` 非有限」改落入 `one-shot` 兜底 ⇒ §3 第 2 行期望串 `one-shot` 与改法逐字对应；有限 `at` 行仍印 `at <本地刻>`（回归腿）。

**非有限值的入口与其他读者（实读）**：工具面四式全显式校验（`seconds` `:189` · `at` `:164-167` · `every` `:173` · `daily` `:181`）⇒ 生产面产不出非有限 `expiresAt`；其它写者 = 调度回插 `timers.mjs:91`（`nextFireAt` 产物——有限）∥ 初始化 `agent.mjs:73`（空表）。

`expiresAt` 的其他读者非零：`timers.mjs:86` ∥ `:88`（到期出列 ∥ 保留过滤）∥ `:58`（`everyMs` 基准）——非有限值下比较恒 false ⇒ 项滞留、不触发、不崩。**不做**：调度面不加守卫——无生产入口（仅手造 fake agent 可达），且与既有 NaN 桶同判（K3）；本批射程 = 显示面（`list` 行）。

先例 = CLI 同族修（`thincoder-cli/src/tui/cmd-timers.mjs:24` ∥ `:48` 两处 `Number.isFinite` 守卫；批 `2026-10-15-timer-face-closeout.md:151`；裁定 K3 = 不新造占位符 `:61`）；核内同向支 = `timer.mjs:60` 的 NaN ⇒ `due now` 既有行为。
不选：`durText`/`localText` 内部钳制——先例把守卫放**消费点**（格式器保持纯形），且 `durText` 唯一调用点即 `:60`，放调用点同效同形。

**③ `#1526` — 判不成立（父侧 2026-10-17 已裁）；产品码零改动**

- 裁定依据：畸形档 = **前置失败**，`docs/desktop/design/IPC.md:328` ∥ `thincoder-desktop/src/main/team.mjs:17-18` 声明「不吞错 · 拒绝直传 · 零假回执」；五值域（`TEAM.md:74-76`）描述的是**操作失败** ⇒ 把前置失败映射成任一值 = 假回执。
- 次级发现已由父侧当场收正（产品码面 · 一行注释 · 可回退）：`team.mjs:88-89` 现读「畸形档不到本函数：`loadConfig()` 畸形即抛，端侧拒绝直传（零 catch 吞）——故本行不列畸形档」。
- 本批不落任何 `team.mjs` 改动。
- **catch 边界（记录 · 不动裁定）**：桌面链 = 核 `team.mjs:74` throw → 转口 `thincoder-desktop/src/main/team.mjs:24`（零 catch）→ `ipc-registry.mjs:98-101`（`ipcMain.handle` 回调零 catch）⇒ Electron 把 handler 同步抛转成渲染面 `invoke` 的 rejection；接住点 = 渲染面窄桥 `mount-settings.mjs:104-117`（catch ⇒ `{ ok:false, reason }` + `console.error`）⇒ `mount-team.mjs:71-76` `ok !== true` 径落段 `none` + 面级失败串（零静默）。CLI TUI 面 = `cmd-team.mjs:56` 同步抛，由 `slash-commands.mjs:128-132` 捕获成 `[error]` 行。

**④ `#1589` 静默吞错 — 收窄为可见**

| 落点 | 改前 → 改后 |
|---|---|
| `read-data.mjs:52` 工厂内 | 增 `let lastError = null` + `runCheck()`（≈10 行）：`check().then(() => { lastError = null }, (e) => { 同键 ⇒ 不重复；异键 ⇒ 记键 + `ctx.log?.("[acp] read-data watcher check failed:", key)` })` |
| `read-data.mjs:118-119` | `void check().catch(() => {})` ∥ `setInterval(() => { void check().catch(() => {}) }, …)` → 两处 `runCheck()` |

通道 = **`ctx.log`**（已在 ctx 面：`acp.mjs:121` 注入；`:147` = `process.stderr.write` ⇒ ACP stdio 协议面零触）——**零新注入参数**、工厂签名零变。
- **runCheck 形（≈10 行）**：`let lastError = null`；`function runCheck() { return check().then(() => { lastError = null }, (e) => { const key = String(e?.code ?? e?.message ?? e); if (key === lastError) return; lastError = key; ctx.log?.("[acp] read-data watcher check failed:", key) }) }`。
- **比较键（单点）** = `String(e?.code ?? e?.message ?? e)`（`code` 优先、无则 `message`、再无则 `String(e)` 兜底）；**成功复位时点** = `check()` resolve 当拍（inflight 跳过拍返回 `[]` 亦属 resolve——零特判）。
- 断言对应（§3 第 4 行）：假 ctx 的 `getCwd` 恒抛 `Error("probe-boom")`（无 `code`）⇒ 键恒 `"probe-boom"` ⇒ 首拍 1 行、同键后续拍零行（3 拍同键仍 1）。

「已知可忽略态」实测清点（收窄依据）：`fileSig`（`:42-44`）吞 stat 全错 ∥ `listBatchRecords` 逐档读错跳过（`batch-read.mjs:30`）∥ `collectMarkdownFiles` 吞 readdir 错（`batch-lifecycle.mjs:78`）∥ 无根已改 null（`:102`）⇒ 逃到外层 catch 的**皆真异常** ⇒ 收窄形 = 一律报（不新增忽略分支；将来出现已知码再在 `runCheck` 首行加一条）。
先例 = `login.mjs:16-46`（`[acp]` 前缀 console.error 诊断）；`ledger-surface.mjs:52`（观察器失败不崩宿主）——**对齐**「不崩」、**偏离**「不吞」（本条意图 = 可见）。

**⑤ `#1522` 平台门跳过行 — 走 stderr + 跳过投影 JSON**

| 落点 | 改前 → 改后 |
|---|---|
| `dev-link.mjs:155-158` | 分支内：`--json` 在场 ⇒ `errorLog(跳过行)` + `log(JSON.stringify({ links: [], ok: true }))` + `return 0`；无 `--json` ⇒ 原样 `log(跳过行)`（人读面零变） |

契约形不变（`:26` = `{ links, ok }`）；跳过投影 = **零链 + `ok:true`**（与 exit 0 同判）；人读行 = 诊断 ⇒ stderr。零 fs 动作仍在 `repoRoot()` 之前（门位零移）。
先例 = 本档 `:163/:173`（errors ⇒ `errorLog`）+ `:26` 契约行；同形契约句 = `docs/cli/design/READ-DATA-INTERFACE.md:74-75`（成功 = stdout 单段 JSON 零杂行 ∥ 错误 ⇒ stderr）。
不选：stdout 空输出（消费者 `JSON.parse("")` 仍红）；加 `skipped` 字段（改契约——本批禁）。

### 3. 红绿判据（每条一个可跑断言；修前必红）

批内单测档 = `docs/batches/2026-10-17-code-defect-batch.test.mjs`（仓根跑：`node --test docs/batches/2026-10-17-code-defect-batch.test.mjs`；`thincoder-core/test/run.mjs:48` 只收 `test/*.test.mjs` ⇒ 不进产品树收集域；先例 = `2026-10-15-team-token-rotation.test.mjs` 同址同 `load(rel)` 取件法）。

| # | 断言（修后可跑） | 修前读数（本轮实测） |
|---|---|---|
| 1 | `assert.deepEqual(findCycles(serverSrc), [])`（93 档 DFS）＋ `askAnswerBodyOf` 四 kind 行为回归 ＋ 既有 `cd thincoder-server && node --test --test-timeout=20000 test/2026-10-17-admin-approval-cards.test.mjs` ⇒ **17/17**（基线已测 17 pass / 0 fail） | 1 环（红） |
| 2 | 非有限三行**逐字**断言：`2 · one-shot · due now · …` ∥ `3 · one-shot · due now · …` ∥ `4 · one-shot · due now · …`（kind 派生 = `kindText`——`at:true` 行经 `:53` 守卫落 `one-shot` 兜底，见 §2②）；并 `assert.ok(!/NaN|Infinity/.test(out))` | `next Infinity:NaN:NaN` ∥ `at NaN-NaN-NaN NaN:NaN`（红） |
| 3 | 不适用——判不成立（父侧裁），无产品码断言 | 四函数 throw = 合声明纪律（非红） |
| 4 | 假 ctx（`getCwd` 抛 `probe-boom` 并逐调用计数 `ticks`；`log` 收口）+ `intervalMs:20` ⇒ **有界轮询**至 `ticks >= 3`（首查 + ≥2 周期拍；上限 2000ms——去固定 sleep）⇒ 断言 `logs.length === 1` ∧ `/probe-boom/`（3 拍同键，无去重则 3 行——1 行 = 同因不刷屏） | `logs.length === 0`（红） |
| 5 | `main(["--json","--win32-only"], {platform:"linux", log, errorLog})` ⇒ `code===0` ∧ `out.length===1` ∧ `deepEqual(JSON.parse(out[0]), {links:[],ok:true})` ∧ `err.length===1`；同档回归腿 = `main(["--json","--win32-only"], {platform:"win32"})` ⇒ `code ∈ {0,1}`（只读判定——退出码随本机链态）∧ `out.length===1` ∧ `JSON.parse(out[0])` 形 = `{links:[…], ok:<boolean>}`（正常执行面零误伤） | `JSON.parse` 抛（红） |

回归腿（修前修后同绿，防误伤）：
- 2：有限三行逐字 `next 01:30`（+90s）∥ `next 1:00:00`（+1h）∥ `due now`（−1ms）；`kindText` 的 `every <N>s` ∥ `daily <HH:MM>` ∥ `at <本地刻>`（有限 `at`）三形零变。
- 4：正常 ctx（临时空目录）⇒ `watcher.check()` 首查仍 `[]`（基线静默、零诊断）。
- 5：`main(["--check","--win32-only"], {platform:"linux"})` ⇒ 人读行仍 stdout（`out` 1 ∥ `err` 0）；win32 面零触（`--check` 复判仍 0 漂移）。
- 1：既有审批卡 17/17（上列命令）——环解后 `chat-asks`/`chat.mjs` 行为不变。

### 4. 冲突与顺序

| 面 | 判 |
|---|---|
| 源面文件 | 四条落地面**两两不相交**（①=member-relay/chat-asks/新 ask-vocab；②=timer.mjs；④=read-data.mjs；⑤=dev-link.mjs；③=team.mjs 零改）⇒ **零冲突，可并行** |
| 共享写面 | 批内单测档 = 单一文件 ⇒ 四席并行会互踩。二选一：**(a) 单席串行（推荐——每改 <30 行，切换成本低于合并成本）** ∥ (b) 四席各出独立测试档（`…-<n>-<topic>.test.mjs`，收口随批删） |
| 串行序（单席） | **① #1615 → ② #1502 → ④ #1589 → ⑤ #1522**（风险降序：① 面最大且带 17/17 回归；余为局部小修；`#1526` 判不成立 ⇒ 不入序） |
| 他批 | 在途 A1–A4/B 均文档面，零触；`#1617` 已改 `chat-routes.mjs`（本批零触，① 的 17/17 回归即其批内件）⇒ **无跨批冲突** |
| 生成面 | `API-CONTRACT.md` 生成区（`:12 BEGIN GENERATED`）含 `member-relay` 导出坐标 `:3352-3360` 与 `dev-link` `:19-25` ⇒ 全部落地后重跑 `node scripts/api-contract.mjs --write`（**生成器唯一笔 = 父侧**，非 coder 笔） |

### 5. 受影响文件与行数（实读口径 = `split("\n").length − 1`）

| 文件 | 现读 | Δ | 说明 |
|---|---|---|---|
| `thincoder-server/src/agent/ask-vocab.mjs`（新） | 0 | ≈+30 | 零 import 叶子（①） |
| `thincoder-server/src/agent/member-relay.mjs` | **438** | ≈−28 | 搬出 `:33-38`（6 行）/`:45-68`（24 行）+ 2 行 import/re-export（①） |
| `thincoder-server/src/agent/chat-asks.mjs` | **242** | ±0 | 只改 import 源 + 档头词（①） |
| `thincoder-core/agent-tools/timer.mjs` | **226** | ±0～+2 | 两处守卫（②） |
| `thincoder-core/team.mjs` | **281** | 0 | 判不成立——本批零改；父侧一行注释已落（`:89`，产品码面唯一例外） |
| `thincoder-cli/src/acp/read-data.mjs` | **130** | ≈+10 | `runCheck()` ≈9 行 + `lastError` 1 行（④） |
| `scripts/dev-link.mjs` | **181** | ≈+5 | `--json` 跳过投影（⑤） |
| `docs/batches/2026-10-17-code-defect-batch.test.mjs`（新） | 0 | ≈+180 | 四条红绿 + 回归腿（`#1526` 不适用）；收口随批删 |

设计档随正（**非 coder 笔**——另笔；实现落地同拍）：
`docs/server/design/agent/ADMIN-AGENT.md`（`:35` chat-asks 读数（§6 表）∥ `:160` KD-SV-224「词表单源 = 成员面」→ ask-vocab ∥ `:245` ∥ `:250` 导入源句只写指针「`ask-vocab.mjs`（行数 ∥ 角色见 `MEMBER-AGENT.md` §5）」——**本档不增 ask-vocab 行**）·
`docs/server/design/agent/MEMBER-AGENT.md`（§5 表 `:348` member-relay 行——现读已是 438（**盘面 438 ≠ 档内 419，既有漂读**，本次随正）∥ 同表增 `src/agent/ask-vocab.mjs` 行——**该行唯一归属本档 §5**（词表域面），`ADMIN-AGENT.md` 只做指针）·
`docs/core/design/TEAM.md`（零触——`#1526` 不成立）·
`docs/core/design/AGENT-LOOP-ASYNC-POOL.md`（`:748` `list` 行加「非有限 ⇒ `due now` ∥ `at` 段不插」一句）·
`docs/cli/design/READ-DATA-INTERFACE.md`（§2.6 观察器加「失败 ⇒ `ctx.log` 一行（stderr；同因连续不刷屏）」）·
`docs/core/design/API-CONTRACT.md`（生成区重跑，见 §4）。

### 6. 关键决策

- **K1（① 切点）**：只搬**应答词表**（4 件），不搬文本词表 ⇒ 最小解环边（`chat-asks → member-relay`），`member-relay → chat.mjs` 保留单向。被否见 §2①。
- **K2（① 重导出）**：`member-relay` 保留同名 re-export ⇒ 公共面零变（先例 `ledger-db.mjs:137-139` 逐字同法）；这不是第二份（同绑定）。
- **K3（② 非有限桶）**：`+∞`/`NaN` 同归 `due now`（`at` 段不插）——不新造占位符（CLI #1329 裁定 K3）；`+∞` 语义上「永不」，但畸形值的唯一既有桶 = `due now`，与 NaN 支一致。
- **K4（④ 通道）**：用 **`ctx.log`**（既有 stderr 缝），不新增工厂参数——零签名变更、零 `acp.mjs` 改动；同因连续去重 + 成功复位（去重键 = `String(e?.code ?? e?.message ?? e)`；复位 = `check()` resolve 当拍——防 5s 刷屏，又不致失败被永久静音；先例 = 一次性警告族）。
- **K5（③ 定性）**：**不修**（父侧 2026-10-17 裁）——畸形档 = 前置失败，拒绝直传是声明纪律（`IPC.md:328`）；五值域只管操作失败。附带：`teamStatus` 读面无失败值域（三端首触点仍 throw）——现状即终态，不另立改。
- **K6（⑤ 跳过投影）**：`{links: [], ok: true}`——零链 + 与 exit 0 同判；**不加字段、不改契约**。

### 7. 验收对照（回指台账）

| 台账 | 判据（机检） |
|---|---|
| `#1615` | 依赖图 0 环 ∧ 既有审批卡 17/17 ∧ `askAnswerBodyOf` 四 kind 回归 |
| `#1502` | 非有限三行零 `NaN`/`Infinity` ∧ 逐字 `due now` ∧ 有限三行逐字零变 |
| `#1526` | **判不成立**（父侧已裁）——本批零改动（父侧一行注释已落，见 §2③）；台账回笔由父侧 |
| `#1589` | 失败可见 ≥1 行（`/probe-boom/`）∧ 同因不刷屏（恰 1）∧ 正常路径零诊断 |
| `#1522` | `--json --win32-only`（非 win32）stdout 恰 1 行且可 `JSON.parse` = `{links:[],ok:true}` ∧ 跳过行进 stderr |

### 8. 边界（本批不做）

- 不写产品码（唯一例外 = 父侧已落的 `thincoder-core/team.mjs:89` 一行注释；`files` 只声明本批档）；不改契约值域；不新增依赖/端点/配置项。
- 不做 `chat.mjs` 拆档（KD-SV-208/228 另案）；不做 `member-relay` 的文本词表搬迁（K1 被否）。
- 不改 `teamStatus` 读面（无失败值域——K5）；不改 `dev-link` 的 `fold`/`relink` 平台读（台账已注「设计口径允许」）。
- 不跑 `doc-check` 入口（用户 2026-10-15 12:10 禁令）；生成面重跑走 `api-contract.mjs`。

### 9. 最近先例 ∥ 公开源核查

- 最近先例：① = `ledger-db.mjs:137-139`（同处方解环）+ `2026-10-17-admin-approval-cards.md:172`（点名 `ask-vocab.mjs`）· ② = `2026-10-15-timer-face-closeout.md:151`（CLI 同族两守卫）· ③ = 不适用（判不成立——`IPC.md:328`）。
- ④ = `login.mjs:16-46`（`[acp]` 诊断前缀）+ `ledger-surface.mjs:52`（观察器不崩）· ⑤ = `dev-link.mjs:163/:173` + `READ-DATA-INTERFACE.md:74-75`（stdout 单段 JSON ∥ 错误 ⇒ stderr）。
- 公开源核查（已查）：仓内设计档 `TEAM.md` ∥ `AGENT-LOOP-ASYNC-POOL.md` ∥ `ADMIN-AGENT.md` ∥ `READ-DATA-INTERFACE.md`——**无相关**（五条均为仓内实现面事项：四条缺陷 + 一条判不成立）。
- 公开源核查（未查）：外部公开源——**因无适用面**（机制单源全在仓内，零外部协议/库面）。

### 10. 上抛与知会

- **`#1526` 定性已裁**（父侧 2026-10-17）：不成立、不修——见 §6 K5。
- **[上抛·知会] `teamStatus` 读面**：畸形档 ⇒ 四函数全 throw（含读面）；该行为属声明纪律射程（前置失败不吞）——现状即终态，零动作。
- **[上抛·知会] 读数漂移**：`MEMBER-AGENT.md:348` 记 `member-relay.mjs` 419，盘面 **438**——本次随正。

### 设计档随正（eng-designer · 2026-10-18 · 父侧派单「四档随正」· initial 轮）

读数 = 现盘实测（口径 = 换行计数——`MEMBER-AGENT.md` §5 声明口径，与 `split("\n").length − 1` 同值）：`ask-vocab.mjs` **37**（零 import 叶子）∥ `member-relay.mjs` **410**（`:25` import ∥ `:28` 重导出）∥ `chat-asks.mjs` 242 ∥ `timer.mjs` 226 ∥ `read-data.mjs` 145 ∥ `scripts/dev-link.mjs` 185。

| # | 档 | 落点 | 改动 |
|---|---|---|---|
| 1 | `server/design/agent/ADMIN-AGENT.md` | —— | **零改**：全档无 `member-relay` 行数读数（该名三处 = `:245`/`:246`/`:250`，皆无计数）；`chat-asks.mjs` 读数 `:35` = 242（现读一致）；`timer` 无行数读数 ⇒ 无可随正；该档文件表**不增 `ask-vocab` 行**（唯一归属 = `MEMBER-AGENT.md` §5） |
| 2 | `server/design/agent/MEMBER-AGENT.md` | §5 `:351` | `member-relay.mjs` 现读 `**419**` ⇒ `**410**`；新增 `ask-vocab.mjs` 行（**37**，零 import 叶子，含 `ASK_KINDS` ∥ `ITEM_VERDICTS` ∥ `BATCH_VERDICTS` ∥ `askAnswerBodyOf`；`member-relay` 以 import + 重导出同源——公共面零变） |
| 3 | `core/design/AGENT-LOOP-ASYNC-POOL.md` | `:748` | `list`（非空）行补一句：非有限 `expiresAt`（`NaN` ∥ `±Infinity`）⇒ `at` 段不插、落 `one-shot · due now`（守卫 = `thincoder-core/agent-tools/timer.mjs:53`/`:60`） |
| 4 | `cli/design/READ-DATA-INTERFACE.md` | §2.6 `:70`（新行） | 观察器失败面：`check()` 失败经 `ctx.log` 报一行（`[acp]` 前缀；通道 = stderr，协议面零触）∥ 同因连续不重复（比较键 = `e.code` 优先 → `e.message` → `String(e)`）∥ 成功即复位 ∥ 失败不崩宿主——正常路径零诊断、失败路径恒 ≥1 行 |

档级读数（改前 → 改后）：`ADMIN-AGENT.md` 658 → 658（`##` 14 → 14）· `MEMBER-AGENT.md` 438 → **439**（`##` 9 → 9）· `AGENT-LOOP-ASYNC-POOL.md` 1153 → 1153（`##` 9 → 9）· `READ-DATA-INTERFACE.md` 242 → **243**（`##` 9 → 9）。

grep 复核（design 面）：`member-relay.mjs` ∧（`419` ∨ `438`）⇒ **0 命中**；`438`（member-relay 语境）仅存于批档历史读数（`2026-10-15-server-mech-closeout.md:263` ∥ 本档 §2/§5 实施前读数）——批档为已冻结的执行记录，不随正。

边界：产品码零写 ∥ 需求档零触 ∥ 提示词零触 ∥ `API-CONTRACT.md` 零触（生成面 = 父侧跑生成器）。

**上表 #3 落点订正（同轮）**：新句独立成行（`:749`，132 字）——`:748` 原文复原（283 字；行长 ≤300 保持）；`AGENT-LOOP-ASYNC-POOL.md` 行数改前 → 改后 = 1153 → **1154**（`##` 9 → 9）。

## §3 设计评审（评审子代理）

### 轮次 1（评审子代理）

审查对象 = 本档（`thincoder/docs/batches/2026-10-17-code-defect-batch.md`）全文，设计面 = §2。判据面：需求覆盖 / 可行性 / 方法论 / 清晰度 / 验收 / 范围 / 文档归属 / 行数标注 / 最近先例 / 公开源核查。

| # | Category | Severity | Issue | Suggestion |
|---|----------|----------|-------|------------|
| 1 | Clarity | 🟡 | ④ 的「同因」判据未定义：`read-data.mjs:52` 侧「增 `let lastError = null` + `runCheck()`（≈9 行）」只说「同因连续 ⇒ 不重复」，未给比较键（`e.code` ∥ `e.message` ∥ 同值对象）；而绿判据 `80ms 后 `logs.length === 1` ∧ `/probe-boom/`；再 60ms ⇒ 仍 **1**（同因不刷屏）` 正靠该键成立 ⇒ 实现者自定键 = 自定验收语义 | 在设计里钉死比较键与成功复位时点，使 §3 第 4 行断言与该键一一对应 |
| 2 | Acceptance | 🟡 | ② 绿判据不能由改法推出：`timer.mjs:53` 改法只写「非有限 ⇒ **段不插** ⇒ 落 `one-shot` 形」，未说 kind 列由何字段派生；若 kind 由 `t.at === true` 派生，该行仍印 `at`，则「`3 · one-shot · due now · …`」在改法正确时依旧红 | 补一句 kind 列的派生源，并按实际渲染校正绿判据的期望串（本审查域内未读 `timer.mjs`，此项为未核实） |
| 3 | Clarity | 🟡 | ① 的切点依赖两处未举证的事实：新档声明「零 import 叶子」，且 `chat-asks.mjs:24` 整体改源「`from "./member-relay.mjs"` → `from "./ask-vocab.mjs"`」；若被搬的 `askAnswerBodyOf` 体引用 member-relay 内其它局部件，或 `:24` 还导入未搬出的符号，K1 的切点不成立（本条为未核实，审查域内未读源档） | 列出 `askAnswerBodyOf` 的依赖集与 `:24` 的导入清单（或写明「经实读为四件」），使切点可复核 |
| 4 | Requirements | 🟡 | ② 只治显示面，入口与其它消费点未写：复现是「假 agent 置 `expiresAt=Infinity`」，设计未说明真实路径（args 解析/写盘）能否产生非有限值，也未清点 `expiresAt` 的其它读者（调度/due 计算）；同一畸形值若另有消费点，本批修完同类缺陷仍会复现 | 增一句「入口不做校验（另案 ∥ 已由某处拒收）」或点名其它读者为零，把「显示面收窄」的射程写死 |
| 5 | Methodology | 🟡 | §1 讨论面仍是空占位：`**状态行**：🔄 进行中（…）` + `<§1 模板占位：本批条目 / 关键判据 / 授权口径>`，而 §2 已「设计完成」；四步流程的第一面未落，本批条目/判据/授权口径只由两条用户引语 + 台账承载 | §1 补录条目/判据/授权口径（或把状态行与占位一并收口），使流程记录与 §2 一致 |
| 6 | Affected-file size annotations | 🔵 | Δ 与 §2 行区间对不上（两处）：member-relay 删 `:33-38`+`:45-68` = 30 行、加 2 行 ⇒ 应 ≈−28，表记「**438** \| ≈−32」；read-data 记「**130** \| ≈+7」，而 `runCheck()`（≈9 行）+ `lastError` 1 行 ⇒ ≈+10（现读列本身在审查域内无法核对盘面） | 用同一口径重算两处 Δ（或改标区间），免 coder 按表核对时误判 |
| 7 | Test determinism | 🔵 | ④ 断言是墙钟依赖：固定 `80ms` / `+60ms` 配 `intervalMs:20`，慢机或调度抖动即假红/假绿 | 改为有界轮询到条件成立，或注入 tick 计数，去掉固定 sleep |
| 8 | Acceptance coverage | 🔵 | ⑤ 只验跳过面：回归腿写「win32 面零触（`--check` 复判仍 0 漂移）」，矩阵里没有 `--json` 在 win32（正常执行面）的断言 ⇒ 改法误伤正常 JSON 输出时本批红灯不亮 | 补一行 `main(["--json","--win32-only"], {platform:"win32"})` 的回归断言 |
| 9 | Test durability | 🔵 | 批内测试「收口随批删」：① 的 0 环不变量与 ② 的格式形随档消失，之后环/NaN 回归无守卫；且「只收 `test/*.test.mjs` ⇒ 不进产品树收集域」仅举证 thincoder-core 一个 runner（他 runner/CI 通配域未提） | 至少把 0 环检查沉到 server 侧 test 树（或立跟进项），并说明其它收集域 |
| 10 | Boundary statement | 🔵 | 「产品码零写」与已落改动不一致：§2 开头「产品码零写」/ §8「不写产品码（`files` 只声明本批档）」，而 §2③ 披露「次级发现已由父侧当场收正（产品码面 · 一行注释 · 可回退）」（team.mjs:88-89 已改） | 边界句限定为「除该一行注释外产品码零写」，或在 §5 表备注登记该改动 |
| 11 | Contract semantics | 🔵 | ⑤ 跳过投影与真零链不可区分：「零链 + 与 exit 0 同判」（K6），消费者无法分辨「平台不适用」与「跑过但 0 链」；契约冻结下属自觉选择，但无跟进项记录 | 在台账/§10 记一条跟进（未来契约修订加 skip 标记） |
| 12 | Documentation | 🔵 | #1526 裁定前提缺一坐标：档内记「四函数全 throw（零请求零写盘）」，未记该 throw 在何处被接住并转成可见的工具错误；缺这一格，「拒绝直传」与「进程级炸裂」在档面不可分 | 补一句 catch 边界坐标（只做记录，不动裁定） |
| 13 | Pointer hygiene | 🔵 | 前情指针含冗余段：`docs/batches/2026-10-17-loc/../2026-10-17-ledger-cleanup-light.md §6`——字面解析可通（目标档存在），但路径内 `2026-10-17-loc/../` 是残余段 | 收成规范路径 `docs/batches/2026-10-17-ledger-cleanup-light.md` |
| 14 | Document ownership | 🔵 | 新模块清单归属未定：`ADMIN-AGENT.md`「§1 表增 `ask-vocab.mjs` 行」与 `MEMBER-AGENT.md:348` member-relay 行数并行维护；本档已录同类漂移（「盘面 438 ≠ 档内 419，既有漂读」）⇒ 双清单漂移是实有风险 | 指明 `ask-vocab.mjs` 清单行唯一归属档，另一档只做指针 |
| 15 | Survey evidence | 🔵 | §9 记「未查外部公开源（无适用面）」——把「查过无相关」与「未查」并成一句；结论可采（五条皆仓内实现面），但记录形态分不出二者 | 拆成「已查 X 档：无相关 ∥ 未查：因无适用面」两半 |

已满足项（不判发现）：设计档在位（§2 完整十节）；五条台账逐条有判（四条缺陷 + 一条判不成立且有 IPC/TEAM 依据）；最近先例行在位且 ④ 明写「对齐不崩 / 偏离不吞」；受影响文件表逐档带现读行数与 Δ，最大 438 行（未触 500 档）；设计档随正清单为既有归属档，无新建档顶替既有节。

VERDICT: pass

计数：🔴 0 · 🟡 5 · 🔵 10

## §4 用户批准（主 agent）
## §5 实施记录（eng-coder）

**状态行**：实施完成（四条缺陷修复落地；批内 9/9 · 审批卡 17/17 · server 19/19；审计零偏离 · 代码评审 pass · 终态 clean）

### 1. 改动表（七档；`file:line` + 改前/改后）

| # | 文件 | 改前 → 改后 |
|---|---|---|
| ① | `thincoder-server/src/agent/ask-vocab.mjs`（新，37 行） | 新建零 import 叶子：`ASK_KINDS` ∥ `ITEM_VERDICTS` ∥ `BATCH_VERDICTS` ∥ `askAnswerBodyOf` 自 `member-relay.mjs` 逐字搬入（零语义改；档头注说明解环理由） |
| ① | `thincoder-server/src/agent/member-relay.mjs:25,:28` | 原 `:33-38` ∥ `:45-68`（30 行）删除；`:25` 加 `import { ASK_KINDS, ITEM_VERDICTS, BATCH_VERDICTS, askAnswerBodyOf } from "./ask-vocab.mjs"`；`:28` 加同名 `export { … } from "./ask-vocab.mjs"`（重导出 = 同一绑定，公共面零变）。438 → 410 行 |
| ① | `thincoder-server/src/agent/chat-asks.mjs:4,:24` | `:4` 档头「自 `member-relay.mjs`」→「自 `ask-vocab.mjs`」；`:24` `from "./member-relay.mjs"` → `from "./ask-vocab.mjs"`（该行只导 `askAnswerBodyOf`）。242 行零变 |
| ② | `thincoder-core/agent-tools/timer.mjs:53,:60` | `:53` `if (t?.at === true)` → `if (t?.at === true && Number.isFinite(t.expiresAt))`（非有限 ⇒ `at` 段不插 ⇒ 落 `one-shot`）；`:60` `return at > now ? …` → `return Number.isFinite(at) && at > now ? …`（非有限 ⇒ `due now`）。226 行零变 |
| ④ | `thincoder-cli/src/acp/read-data.mjs:93,:118-128,:133-134` | 增 `let lastError = null`（`:93`）+ `runCheck()`（`:118-128`：比较键 `String(e?.code ?? e?.message ?? e)`——同键不重复、异键 `ctx.log` 一行；`check()` resolve 当拍复位）；原 `:118-119` 两处 `void check().catch(() => {})` → `void runCheck()` ∥ `setInterval(() => { void runCheck() }, intervalMs)`。130 → 145 行 |
| ⑤ | `scripts/dev-link.mjs:155-161`（工程工具面——越声明面改动，见 §4） | 平台门分支：`--json` 在场 ⇒ `errorLog(跳过行)` + `log(JSON.stringify({ links: [], ok: true }))` + `return 0`；无 `--json` ⇒ `log(跳过行)` 原样。契约形 `{ links, ok }` 零变；门位仍在 `repoRoot()` 之前（零 fs 动作）。181 → 185 行 |
| — | `docs/batches/2026-10-17-code-defect-batch.test.mjs`（新，222 行） | 批内断言 9 条 = §3 判据（① 零环 + 四 kind 回归 · ② 非有限三行 + 有限回归 · ④ 假 ctx 可见 + 正常 ctx 回归 · ⑤ `--json` 跳过面 + win32 正常面 + `--check` 人读回归）；用毕随批删 |

`thincoder-core/team.mjs` 本批零改（#1526 判不成立）；`chat.mjs` 零行 Δ。

### 2. 红绿实跑读数（修前红 → 修后绿）

命令统一 = `node --test --test-reporter=tap docs/batches/2026-10-17-code-defect-batch.test.mjs`（cwd = 仓根；单点名以 `--test-name-pattern` 收窄）。

| 判据 | 修前（红 ∥ 基线绿） | 修后 |
|---|---|---|
| ① 零环 | 1 环（chat-asks → member-relay → chat.mjs → chat-asks）；ask-vocab 导入 = `ERR_MODULE_NOT_FOUND` | `files = 94 · cycles = []` |
| ① 四 kind 回归 | 红（随上一行失败） | `member-relay` 与 `ask-vocab` 四符号**同一绑定**；permission/batch/question/secret 四支 + 非法值全绿 |
| ② 非有限三行 | `2 · one-shot · next Infinity:NaN:NaN · boom-one-shot` ∥ `3 · at NaN-NaN-NaN NaN:NaN · next Infinity:NaN:NaN · boom-at` ∥ NaN 行 `due now` | `2 · one-shot · due now · boom-one-shot` ∥ `3 · one-shot · due now · boom-at` ∥ `4 · one-shot · due now · boom-nan`；`!/NaN\|Infinity/` 绿 |
| ② 有限回归 | 绿（基线） | `next 01:30` ∥ `next 1:00:00` ∥ `due now` ∥ `every 60s` ∥ `daily 09:00` ∥ `at <本地刻>` 逐字零变 |
| ④ 失败可见 | `logs.length === 0`（静默） | 有界轮询（上限 2000ms）`ticks = 6`（≥3）⇒ `logs.length === 1` = `[["[acp] read-data watcher check failed:", "probe-boom"]]`；继续 2 拍仍 1（同因不刷屏） |
| ④ 正常回归 | 绿（基线） | 临时空目录 `watcher.check()` 首查 `[]`、零诊断 |
| ⑤ 跳过面 | `JSON.parse` 抛 `Unexpected token 'd'` | `code = 0` · stdout 恰 1 行 `{"links":[],"ok":true}` · stderr 1 行跳过诊断 |
| ⑤ win32 正常面 | 绿（基线） | `code = 0` · stdout 1 行 · `{links, ok}` 形（本机 5 链全规范、ok = true） |
| ⑤ 人读回归 | 绿（基线） | `--check --win32-only`（linux）⇒ `code = 0` · stdout 1 行 · stderr 0 |
| ① 审批卡回归 | 17/17（基线） | `cd thincoder-server && node --test --test-timeout=20000 test/2026-10-17-admin-approval-cards.test.mjs` ⇒ `# tests 17 · # pass 17 · # fail 0` |
| ⑥ 语法 | — | 七档逐档 `node --check` ⇒ 全 `Syntax OK` |
| ⑥ server 套件 | — | `cd thincoder-server && node --test` ⇒ `# tests 19 · # pass 19 · # fail 0` |

批内档全量 = **9 pass ∥ 0 fail**（修前 = 4 pass ∥ 5 fail，红位与 §3 逐条对应）。

### 3. 行数读数（口径 = `split("\n").length − 1`）

`ask-vocab.mjs` 0 → **37** · `member-relay.mjs` **438 → 410**（Δ−28，设计 ≈−28）· `chat-asks.mjs` **242 → 242**（Δ0）· `timer.mjs` **226 → 226**（Δ0）· `read-data.mjs` **130 → 145**（Δ+15；设计 ≈+10——多出 = `runCheck` 档注 2 行 + 空行）· `scripts/dev-link.mjs` **181 → 185**（Δ+4，设计 ≈+5）· 批内测试档 0 → **222**。

### 4. 越界披露

- **`scripts/dev-link.mjs`（仓根 `scripts/**` = 工程工具面，机制上不进 `files` 声明）**：⑤ 缺陷本体即在该档，任务书已授权「照常改并如实披露」——改动仅平台门分支 `:155-161`，零 fs 动作、零契约变更、无第二处。
- 无其它声明面外改动；`thincoder-core/team.mjs` 零改（#1526 判不成立）；未触任何设计档/需求档。

### 5. 审计与代码评审轮次与终态

- **内部偏离审计**（explore · 1 轮）：**零偏离**——A–G 七判据逐条「符合」；独立 `node --check` ×7 绿；证据边界如实记（审计席无执行工具，运行读数以本席申报为准；`chat.mjs`/`team.mjs` 零改以清单 + mtime 佐证）。
- **独立代码评审**（advisor · code · 1 轮）：**pass** —— 🔴 0 · 🟡 2（均文档层/协调项，非代码面：§5 记录 + 设计档随正）· 🔵 7（可选：member-relay 冗余本地导入 2 名 · 环探针仅静态边 · 测试次圈复用 deadline · `--json` 参数错面仍无 JSON · `ctx.log` 声明单参而调用两参 · 测试档随批删致回归无守卫 · `kindText` 与 `nextText` 取数形不一致）。无 must-fix。
- **fix round**：0（审计零偏离；评审 pass 且无 must-fix）——终态 **`clean`**。

## §6 验证与收口（父代理）

**验证与收口（父侧 · 2026-10-18 00:0x）**

**实施**：`eng-coder#112`（四条缺陷）+ `eng-designer#116`（设计档随正）+ 父侧小笔（3 处指针/读数 + 生成面重跑）。

**父侧亲跑读数（自己跑的，非引用）**：

| 判据 | 命令 | 读数 |
|---|---|---|
| 批内九条 | `node --test docs/batches/2026-10-17-code-defect-batch.test.mjs` | **9 pass / 0 fail** |
| server 全套 | `Set-Location thincoder-server; node --test` | **19 pass / 0 fail**（既有 17 + 本批 2） |
| ① 零环 | 同上批内 | `files = 94 · cycles = []` |
| ② 非有限三行 | 同上批内 | `one-shot · due now`，`!/NaN\|Infinity/` 绿 |
| ④ 失败可见 | 同上批内 | 有界轮询内 `logs.length === 1`、含 `probe-boom`、不再增长 |
| ⑤ `--json` 契约 | 同上批内 | exit 0 ∧ stdout 恰 1 行可解析 JSON ∧ stderr 1 行 |
| 生成面 | `node scripts/api-contract.mjs --write` | 4329 条 → `API-CONTRACT.md`（截断 5 行 · −33 符号） |

**改动面（7 档产品码 + 4 档设计档 + 1 生成档）**：`ask-vocab.mjs`（新 37 行，零 import 叶子）∥ `member-relay.mjs` 438→410 ∥ `chat-asks.mjs`（import 源）∥ `timer.mjs:53/:60` ∥ `read-data.mjs` 130→145 ∥ `scripts/dev-link.mjs` 181→185（**工程工具面，越声明改动已披露**）∥ 批内测试档；设计档：`MEMBER-AGENT.md:351/:352` ∥ `AGENT-LOOP-ASYNC-POOL.md:749`（+ `:732` 读数 46→226 父侧笔）∥ `READ-DATA-INTERFACE.md:70` ∥ `ADMIN-AGENT.md:245/:250` 导入源改 `ask-vocab`（父侧笔）；生成面 `API-CONTRACT.md`。

**内部评审**：`eng-coder#112` 自跑 advisor（type=code）**pass**（🔴 0 / 🟡 2 文档层 / 🔵 7）；探索审计 1 轮零偏离；fix round 0。

**父侧小笔披露（可单笔回退）**：`ADMIN-AGENT.md:245/:250` 导入源句、`AGENT-LOOP-ASYNC-POOL.md:732` 读数 46→226——三处均为「指针/读数随正」，零新语义。

**转跟进**：`#1634` 环守卫常驻化（批内测试档收口即删 ⇒ 环回归无信号）· `#1635` `--json` 跳过面契约。

**清理**：批内测试档 `docs/batches/2026-10-17-code-defect-batch.test.mjs` 按「收口随批删」删除；读数留本段。

**收口**：`#1615` ∥ `#1502` ∥ `#1589` ∥ `#1522` 核销；`#1526` 判不成立（父侧裁）；本档冻结。
