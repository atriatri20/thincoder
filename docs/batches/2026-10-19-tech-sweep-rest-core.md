# 2026-10-19 · tech-sweep-rest-core
> 六段 append-only，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 编制：主 agent · 2026-10-19 · 来源 = 用户令 2026-10-19 08:28/08:31/08:33/08:34/08:35「技术待办现在就开始处理」「继续不要等」「全部都开」「接着派，别等」「都派出了吗？」——批 K = core 面剩余 15 项。。
> 台账 = #1220 ∥ #1372 ∥ #1498 ∥ #1500 ∥ #1501 ∥ #1507 ∥ #1508 ∥ #1514 ∥ #1552 ∥ #1583 ∥ #1587 ∥ #1590 ∥ #1598 ∥ #1620 ∥ #1635（归批）。前情 = docs/batches/2026-10-19-tech-todo-sweep.md（在途）。
## §1 讨论（主 agent）
**状态行**：已收口 2026-10-19
<§1 模板占位：本批条目 / 关键判据 / 授权口径>
## §2 批次任务与设计（eng-designer）
**状态行**：设计完成 2026-10-19（修正轮 1 收口 · 15 条 = 零实施 5（零动作 3 + 前提不成立 1 + 条件态 1）∥ 实施 10（文档面 7 + 产品码面 3）· 评审 20 条逐条处置见末四块 · #1587 射程收窄与 #1507 接线另批待裁）
<§2 模板占位：本批条目（覆盖） / 设计档落点 / 机制设计 / 受影响文件与测试覆盖 / 验收对照 / 关键决策 / 上抛项>

### 逐条设计（台账号 → 实读现状 → 目标形 → 判类）

**本批条目（覆盖）**：`#1220` `#1372` `#1498` `#1500` `#1501` `#1507` `#1508` `#1514` `#1552` `#1583` `#1587` `#1590` `#1598` `#1620` `#1635` —— **15 条全覆盖**（用户 2026-10-19「全部都开」）。**设计档落点 = 本 §2 + 就地收正的承载档**（无新建设计档：15 条全是既有机制的残留收正，零新机制）。

**共同判据（本批单源）**：批档可整批清理 ⇒ 指向批档 / 批内单测档的指针一律按「一次性产物」处理：删指针、保事实。单元测试档寿命 = 用毕即删（零留存）。

#### 已消失 / 已落 —— 零动作四条（每条给证据）

| 台账号 | 任务书前提 | 盘上事实（实读） | 判定 |
|---|---|---|---|
| `#1220` | 登录后模型候选面刷新时点待补（补一次全状态推送 + 三端同判） | 批 `docs/batches/2026-10-16-login-model-refresh.md:6` 状态行 = 「已收口 2026-10-16」；落地面实读在位：VSC `thincoder-vscode/src/extension/panel-messages-settings.mjs:268`（`panel._pushSettings()`）∥ `team-surface.mjs:135`（`loginFlow()` 成支 `_chatPanel?._pushSettings?.()`）∥ 桌面 `mount-team.mjs:49/:149` + `mount-settings.mjs:155-156` ∥ CLI 零改（既有 `cmd-team.mjs` `syncProvidersFromDisk` 覆盖） | **零动作**——本批前提已消。批内单测档 `2026-10-16-login-model-refresh.test.mjs` 不在盘（收口随批删，符合零留存）。台账核销归主 agent |
| `#1552` | `BATCH-RECORD.md` §4.13 取行面为「原值等值」，应改解析同址 | `docs/core/design/BATCH-RECORD.md:285`（§4.13 收口重锚块）实读 = 「取本批行集（`ledgerBatchRows`——选行单源 = `design/LEDGER.md` §7.1 解析同址，零二写）」 | **零动作**——口径已是解析同址，与 `LEDGER.md` §7.1 同源。（同档正由批 I 改，本批不触，避免冲突） |
| `#1590` | `PROMPT-SYSTEM.md` §6.11 预算表读数待按当刻实测收正 | 当刻实跑 `node scripts/tool-schema-size.mjs`（exit 0）= **档数 52 · 总量 143,572 · 比值 1.387**；tool-docs **53 档 · 92,396 字符**；top = subagent 17,191 ∥ browser 11,924 ∥ git 7,894 ∥ ssh 7,472 ∥ batch 6,553。表内（`PROMPT-SYSTEM.md:284-292`）「当前 143,572 = 1.387 ×」「单档帽 subagent 17,191 ∥ browser 11,924」「top5 逐字」「53 档（枚举 52 ∥ 目录 53）」**逐项与实测全等** | **零动作**——已由 `#1658` 收正，读数未漂 |
| `#1635` | `dev-link --json` 跳过面与零链不可区分，契约修订时补 `skipped` | 契约冻结期（K6「不加字段、不改契约」）内无契约修订窗口 | **本批不办**——记录「待契约修订时补 `skipped` 标记 + 同步 `READ-DATA-INTERFACE.md` 契约面」；台账保持未核销（条件型：契约修订轮） |

#### 文档面（设计席笔 —— 实施轮落，D8/C 类）

| 台账号 | 实读现状（坐标） | 目标形 | 判类 |
|---|---|---|---|
| `#1498` | `docs/core/design/LEDGER.md` 标题层 §1–§9，**无 §13.4**（原节随 2026-10-15 历史清除删除，内容已入 §3 / §5）。存活死指针 4 处：`thincoder-core/ledger-cmd.mjs:17` ∥ `:30` ∥ `thincoder-core/ledger-db.mjs:139` ∥ `docs/core/requirements/ENGINEERING-MODE-V2-SPEC-LEDGER.md:84`（AC-M2-24 回指「设计档 §13.4」）。docs 面另 2 处（`docs/server/design/ledger/LEDGER.md:6/:22`）已改指 §3/§5（前批已落） | **不补节**（补节将与 §3/§5 双重陈述 = D2 违反）⇒ 余 4 处改指 `§3 / §5`：3 处产品码行注 = 机械改（eng-coder）；需求档 1 处 = **主 agent 笔**（上抛） | 补节 ∥ 改指：**裁 = 改指**；剩余面 = 机械改 3 + 需求档 1 |
| `#1501` | 「随批留存 / 随档留存」陈句族在 **live 文档 ~57 行**（`docs/batches/**` 不计——过程档可整批清理）：core design 6（`AGENT-LOOP-UPSTREAM.md:1087` · `DOC-DISCIPLINE.md:1588` · `PROVIDER.md:493` · `PROXY.md:146` · `TEAM.md:178` `:181`）· desktop design 38（`ACTIVITY` 2 · `CHAT` 3 · `COMPOSER` 8 · `E2E-TESTING` 4 · `MENU` 4 · `PROJECT` 3 · `RENDERER` 1 · `SESSIONS` 4 · `SETTINGS` 4 · `SHELL` 1 · `UI` 4）· render-core 8（`RENDER-CORE.md`）· server design 3（`client/CLIENT.md:46` · `PROJECT.md:157` `:232`）· requirements 2（`ENGINEERING-MODE-V2-SPEC-TEST-DISCIPLINE.md:7` `:14`） | 统一到现行口径 **「用毕即删（零留存）——批档 §5 留一行读数」**；「复跑 = 单档直跑」改「运行口径 = 批内单档直跑，无『再跑旧档』面」。逐档就地替换，不跨档复制副本 | **一致性面 ⇒ 可改**（口径统一，非新语义）。实施按档分段，逐处报读数 |
| `#1508` | `docs/core/requirements/TESTING.md:169`（N11 行，原报 :167 已漂）写「`doc-check.mjs` ∥ `doc-check-width.mjs` ∥ V1–V3 判据**零改**」——`scripts/doc-check.mjs` 现为 V5 专用面、已退出 gate 判据链（`#1666`），gate 判据源 = `thincoder-core/doc-check/index.mjs` | 该句射程收为「**本次清理不得弱化结构机检**」，判据源指名现行 gate 引擎 | **需裁 + 主 agent 笔**（需求档）——上抛，设计席不越笔 |
| `#1514` | `docs/core/design/TOOLS.md` 含测试档引用 **59 行**（`Select-String "test/|\.test\.mjs|单元测试档"`）；`:547` 一带为用例表，命中 `test/turn-domain-mode.test.mjs`（`thincoder-core/test/` 树已清退 ⇒ 死引用）。`T-F9` 在 `docs/core/design/MANIFEST.md` = **0 命中**（已消失） | 逐行三分类：① `thincoder-core/test/**` 类 = 死引用 ⇒ 删引用、保用例本体事实；② `thincoder-vscode|cli/test/**` = 树在盘 ⇒ 逐条判（在盘留作现行读数，不在盘按 ① 办）；③ 批内 `.test.mjs` = 零留存 ⇒ 点「批内定向单测（收口随批删）」形。`:547` 行内 `test/turn-domain-mode.test.mjs` 按 ① 办 | **机械改**（分类判据已给）。`T-F9` 子项 = 零动作 |
| `#1583` | ③ 取材纪律（归档面不得作出处 / 当现行；派单与写档只认 live 面）已生效但**只住批档与台账证据**；`_archive/**` 4 处「三条硬约束②」为当时正确记载 ⇒ 不改（改 = 篡改历史） | ③ 成文入承载档：`docs/core/design/DOC-DISCIPLINE.md`（文档写作纪律节）加一句「归档面（`_archive/**`）为历史记载：不得作出处、不得当现行；派单与写档取材只认 live 面」 | ③ = **文档面机械改**；④（归档标记 / 检索识别）= **用户未点名立项 ⇒ 不做**，只记录 |
| `#1587` | 用户 2026-10-16 17:46 令「这种计数根本就不应该出现在文档里」。判据 = **档数类声明数须有下游消费者**（机器读取面 / 清单自身闭合 / 真实门）；无下游的装饰数字不写进文档。**行数读数不入射程**——归 `docs/core/design/DOC-DISCIPLINE.md:907` / `:912` 保留面，本批零改。实证样例（今日亲历）：同一表内「四档均 ≤500 行」与「781 行」并存；「现盘实读 49 档」实 52 | 全库（`docs/**` live 面，`_archive` ∥ `batches/**` 除外）逐处判：无下游的声明数**删数保事实**（读者数清单即可）；有下游（manifest `checkConfig`、gate 判据、同表自闭合）**留** | **一致性面 ⇒ 可改**；判据机械（有 / 无下游消费者二值） |
| `#1598` | `docs/RELEASE.md`（238 行）逐行长度实测：**>300 字符 26 行**（含表行）。台账原报 `:35` 413 ∥ `:99` 574 为旧号，现实号 = `:37` **636** ∥ `:106` **1,048** | 表行不能折行 ⇒ **改结构**：长单元格拆为「主行 + 续行（列表条目）」，事实逐字保留、零删减 | **需结构改**（文档面）。本批办台账点名 2 处；其余 24 行存量族登记（不硬折） |

#### 产品码面（eng-coder 落 —— 本席只出设计）

| 台账号 | 实读现状（坐标） | 目标形 | 判类 |
|---|---|---|---|
| `#1372` | 准入包装两份同构：`thincoder-core/memory/docs.mjs:123-132`（`declCache` / `scopeCache` / `rowHidden`）∥ `thincoder-core/memory/code-search.mjs:41-50`——函数体逐字相同（排除谓词 ∪ 声明范围门） | 抽 `thincoder-core/memory/read-gate.mjs`：导出 `createReadGate()`（返回 `{ rowHidden }`，内部持两缓存）；两档改为 import 并调用 | **机械改**（行为零变：同判据、同缓存粒度） |
| `#1500` | `thincoder-desktop/src/main/session-flags.mjs:36-44` 四键闭集 + `FLAG_WRITERS` 四口；`:74` 工程位 = `setSlotEngineering`（核单点 `session-slot-write.mjs`），与其余三键同表；「四路判据面」在 `:11` 头注只落「判据两档（`bad-key` / `invalid-patch`）」 | **零动作（前提不成立）**——「四路判据面」在盘上无对应物；写径四判据与失败径归口 = 本条「订正 B」块（`thincoder-core/session-slot-write.mjs:122-134` 四判据在册 ∧ `thincoder-desktop/src/main/session-flags.mjs:75` 归 `slot-missing`） | **零动作** |
| `#1507` | 核字典缺四键 `sub.async` / `sub.sync` / `sub.waiting` / `sub.awaitingApproval`（宿主字典各有定义：desktop `renderer/i18n.mjs:196-199` ∥ VSC `locales/en.json:206-213`）；CLI 运行面板 `thincoder-cli/src/tui/subagent-panel.mjs:73-106` 词面自铸（含 zh 混排）；tool 状态词值形差（en `running…` ≠ `running`）；`:162/:165` advisor 标签无核键 | 核 `i18n.mjs` 四键在册 ⇒ 与宿主同形补四键；CLI 面板改走 `t()` 键（去自铸）；值形统一（`running…` ⇒ 键值形） | **多实现面差默认消除**；唯一路径 / 行数 / 增量 = 本条「#1507 定稿」块。面较大 ⇒ 本批只落「核字典四键 + 值形统一」；CLI 面板词面重写**另批**（上抛） |
| `#1620` | `docs/server/design/agent/ADMIN-AGENT.md` R54/R60/R61/R71 行 + `docs/server/design/webui/CHAT.md` 随正件段逐条点名 `test/2026-10-11-*.test.mjs` 并携行号；server 零留存 ⇒ 引用对象已删 | 改为「批内定向单测（收口随批删）」形；**不写具体档名 / 行号**。R 行是否整体迁出设计档（历史轨迹性质）**另裁** | **一致性面 ⇒ 可改**（引用对象已不存在）；R 行迁移 = 上抛 |

**关键裁决（记入本批）**

1. `#1498` 选「改指」不选「补节」——补节会与 §3/§5 形成两处同义陈述（D2 违反），且原节内容已在 §3/§5 完整承住。
2. `#1552` / `#1590` / `#1220` 判零动作而非「重做一遍」——盘上证据显示前提已消，重做 = 推翻已评审命名 / 重写同值读数。
3. 批内单测档（`docs/batches/*.test.mjs`）在本批一律不进受影响文件表——它们是过程产物（零留存），引用它们的设计句按「批内定向单测（收口随批删）」形写。



**上抛项**

- `[上抛·待裁]` `#1508` 需求档 N11 射程句——需求档笔在主 agent，目标形已给（射程 = 「本次清理不弱化结构机检」，判据源指名 gate 引擎），请主 agent 落笔。
- `[上抛·待裁]` `#1620` R 行（R54/R60/R61/R71）本身是历史轨迹性质，是否整体迁出设计档 = D10 面另裁；本批只做引用形替换。
- `[上抛·待裁]` `#1507` 面较大：本批只落核字典四键 + 值形统一；CLI `subagent-panel.mjs` 词面重写（含 zh 混排）另批。
- `[上抛·待裁]` `#1583` ④（归档标记 / 检索识别）用户未点名立项 ⇒ 不做，只记录。
- `[上抛·知会]` `#1498` 需求档 `SPEC-LEDGER.md:84` 的「设计档 §13.4」回指同为死指针（第 4 处），随上抛一并处置。

**存量登记（不入本批射程）**：`docs/RELEASE.md` 台账点名 2 处之外的存量超宽行族（`#1598`，数目不入判）。

### 第二轮实读 —— 订正与补全（以本块为准）


**订正 B（`#1500` 改判零动作）**：实读 `thincoder-core/session-slot-write.mjs`——`setSlotEngineering`（`:156-158`）= `writeFlag`（`:137-143`）→ `loadSlotForWrite`（`:127-134`），与其余三键**同一条写径**；该径的判据四项（`version > 2` / 异 cwd / 槽档损坏 / 未知槽）在 `:122-126` 注释与 `:132`（文件在但不可读 ⇒ 不覆盖）逐条在册，失败径统一由 `writeFlag` 返回 `false` ⇒ `session-flags.mjs:75` 归 `slot-missing`。**全仓 grep「四路」**：`docs/desktop/design/UI.md:118/:184/:379`（输入提示判据四路——与写槽无关）+ `thincoder-core/config.mjs:55`（并发表 4/4/4）⇒ **任务书所称「四路判据面」在盘上无对应物**。判定 = **零动作（前提不成立）**；若用户另有所指，需点名该面（上抛）。

**订正 C（`#1635` 落点）**：实文件 = `scripts/dev-link.mjs`（12 KB · 非 `thincoder-cli/scripts/`）。实读 `:155-160`：`--win32-only` 在非 win32 ⇒ stderr 出跳过行 + **stdout 出 `{"links":[],"ok":true}`**（`:160`）；而正常零链径（`:168`）同形 ⇒ **确认不可区分**。契约面 = `READ-DATA-INTERFACE.md`（`--json` 契约 `{ links, ok }`，`:26`）。判定 = **本批不办**，记录「契约修订轮补 `skipped` 标记 + 契约面同步」。

**补全 D（`#1514` 分类读数）**：`docs/core/design/TOOLS.md`（**1,554 行**，本轮实读）命中测试档引用 **59 行**，按类分：① `thincoder-core/test/**` = **12 行**（树已清退 ⇒ 死引用）；② `thincoder-vscode|cli/test/**` = **11 行**（树在盘 ⇒ 逐条判：在盘留现行读数，不在盘按 ① 办）；③ `docs/batches/*.test.mjs` = **3 行**（零留存 ⇒ 点「批内定向单测（收口随批删）」形）；④ 其余 33 行 = 「单元测试档」散文（口径句，按 `#1501` 一并收正）。`.test.mjs` 判据 = 文件 `Test-Path` 逐条核（实施轮逐行给读数）。

**补全 E（`#1620` 在盘核）**：`thincoder-server/test/` 实读 = **1 档**（`rc-resolve.mjs`，非单元测试档）⇒ `ADMIN-AGENT.md` R54/R60/R61/R71 与 `webui/CHAT.md` 点名的 `2026-10-11-*.test.mjs` **全部不在盘**（零留存已生效）。⇒ 引用形替换为本批实施面；R 行整体迁移仍上抛。

**补全 F（`#1507` 现行读数）**：`thincoder-core/i18n.mjs`（**127 行**，UTF-8 实读）实读 `sub.*` 八键 = `running:55` · `queued:56` · `stopped:57` · `done:58` · `error:59` · `cancelled:60` · `awaitingDigest:61` · `queueSlot:62`——**确缺** `sub.async` / `sub.sync` / `sub.waiting` / `sub.awaitingApproval` 四键。CLI 面板 `thincoder-cli/src/tui/render-segments.mjs`（非核 `memory/` 下）与 `subagent-panel.mjs` 词面待实施轮实读现号。


**AC 补订**：AC-3 的射程此前写作「`docs/vsc`」——实测 `docs/vsc/**` 零命中该族，射程改为 `docs/core docs/desktop docs/render-core docs/server docs/*.md`，`_archive/**` 与 `batches/**` 除外。AC-5 复跑口径 = `node scripts/tool-schema-size.mjs`（本批已跑：52 档 · 143,572 · 1.387）。

### 修正轮 1（轮次 1 评审 20 条 · 🔴2 ∥ 🟡14 ∥ 🔵4 · 父侧全部接受，按号逐条改）

**本块 = §2 的唯一现行读数面**（§2 为 append-only：下文凡「删前块 X」均给出待删行区间，删除动作需父侧 file edit——`batch` 工具无删面，这一点如实登记，不冒充已删）。本轮零代码、不动 §1/§3、不改 15 条判类方向。

**逐条处置（号 → 改动落点）**

| # | 处置 |
|---|---|
| 1 🔴 | `#1507` 补 AC 全文 = 下方 **AC-12**（四键 = 4 ∥ TUI 裸字面 = 0 ∥ 面板冒烟两行读数）；`#1507` 定稿见「#1507 定稿」节 |
| 2 🔴 | `#1587` 出实例清单 20 项（下方表）+ **AC-13**；`:95` 未解清单的该条由本块销项 |
| 3 🟡 | 读数唯一化：**待删区间 = `:54`–`:74`（旧受影响文件表）∥ `:99`（订正 A 墓碑段）∥ `:132`∥`:133` 的「待实施读」行**；现行单源 = 本块「受影响文件（现行读数）」表 |
| 4 🟡 | `#1507` 唯一路径 = `thincoder-cli/src/tui/render-segments.mjs`（**188 行**）∥ `thincoder-cli/src/tui/subagent-panel.mjs`（**150 行**）；`:45` 与 `:71` 的两种旧写法作废（待删 = 该两处片段） |
| 5 🟡 | `#1507` 目标形收窄 = **只落「核字典四键 + tool 状态词值形统一」**；`t()` 词面重写显式移出本批（见「上抛」） |
| 6 🟡 | 各补 grep 型 AC = **AC-8**（#1514）· **AC-9**（#1620）· **AC-10**（#1598）· **AC-11**（#1508） |
| 7 🟡 | **AC-2** 扩为 4 处（3 码档 + 需求档 `ENGINEERING-MODE-V2-SPEC-LEDGER.md`） |
| 8 🟡 | **AC-3** 补第二形（`再跑旧档` / `复跑 = 单档直跑`）+ 射程一次写定（去 `docs/vsc`） |
| 9 🟡 | **AC-4** 写明 cwd + 命令 + 覆盖说明 |
| 10 🟡 | `#1372` 工厂签名 / 缓存来源 / 实例粒度定稿（下方节）+ 三档增量回填 |
| 11 🟡 | **AC-7** 加改动前基线（>0）+ 行为等价断言 |
| 12 🟡 | 被推翻处置删净：待删 = `:92` 的「四路判据面…需先定」条 ∥ `:99` 墓碑句（与 #3 同区间）；现行判定 = 「`#1500` 零动作（前提不成立）」+ 一行证据 |
| 13 🟡 | 零实施计数一处定稿 = **5 = 零动作 3（#1220 #1552 #1590）+ 前提不成立 1（#1500）+ 条件态 1（#1635）**；实施 **10 = 文档面 7 + 产品码面 3**；`AC-1` 同步点名 5 条 |
| 14 🟡 | `#1587` 判据句 + `#1583③` 归档取材句 → `docs/core/design/DOC-DISCIPLINE.md` **同一节**（文档写作纪律节，§3.3 之后就近；实施轮落笔），**AC-14** |
| 15 🟡 | 先例行补入下方「先例与勘察」节 |
| 16 🟡 | 勘察证据行补入同节 |
| 17 🔵 | 规则号给出处：**D1–D9 = `docs/core/design/DOC-DISCIPLINE.md:9`（§1 文档更新纪律）**；「D10」无此号 ⇒ 改写为「历史轨迹性质 ⇒ 按 §3.19 条目 R 的退场判例另裁」 |
| 18 🔵 | `#1220` CLI 腿补坐标：`thincoder-cli/src/tui/cmd-team.mjs:181` / `:202` / `:219` 调 `syncProvidersFromDisk`（定义 `:235`） |
| 19 🔵 | 保留现状（纯 `.md` 不适用代码档位规则；零动作五条各带可复读坐标） |
| 20 | 计数 20 已核（🔴2 ∥ 🟡14 ∥ 🔵4） |

**先例与勘察（#15 / #16）**

- **最近先例**：`docs/core/design/DOC-DISCIPLINE.md` §3.19 条目 R（行数声明面退役）——同族「声明面退场」判例，本批 `#1587` 与其对齐（**保留面**：机制读数 / 判据基线 / 自闭合清单 / 真实门；**退场面**：盘存规模数）。偏离 = 条目 R 只退 `checkConfig.lineCounts` 声明面，本批退的是文档散文里的盘存数；理由 = 该声明面已退，散文里的同名数失去唯一对账源，留着必漂。第二先例 = §3.7 条目 H（文档行数规则废除）。
- **勘察证据行**：工作目录内查过 `docs/README.md`（文档地图）· `docs/core/design/**`（D1–D9 ∥ §3.7 ∥ §3.19）· `PROJECT-MANIFEST.json` `checkConfig`（`lineCounts` 已无）· `thincoder-core/doc-check/index.mjs` 四键消费面。`index.publicRepos` 声明面内**无独立公开文档仓** ⇒ 公共源侧结论 = 无相关（不是未查）。

**#1587 实例清单（20 项：删 7 ∥ 留 13；判据 = 声明数须有下游消费者）**

类定义 = **档数类盘存数**：句子以「仓库自身的文档/代码树有多少档」为主断言；**行数读数不入本类**——归 `docs/core/design/DOC-DISCIPLINE.md:907` / `:912` 保留面，本批零改。判据二值：有下游（机器读取面 ∥ 清单自身闭合 ∥ 真实门）⇒ 留；无 ⇒ **删数保事实**（名单/谓词留，数字走）。机制读数（耗时 / 容量 / 用例数 / 阈值）不入本类。

| # | 档:行 | 声明数 | 下游消费者 | 处置 |
|---|---|---|---|---|
| 1 | `docs/README.md:67` · `:68` · `:74` | `core/design/` 5 档 · `core/requirements/` 2 档 · 其余 39 档 | 无（同段即逐档名单） | **删数**（实测顶层 design 61 / requirements 49 ⇒ 三数之和 46 ≠ 61） |
| 2 | `docs/README.md:90` | `core/requirements/` 登记（逐档 · 49）… 全 49 档 | 名单自身可数 | **删数**（实测顶层 49 ∥ 递归 52——子目录 3 档未列） |
| 3 | `docs/README.md:43` | 需求侧「已建齐（15 档）」 | 无 | **删数**（实测 49） |
| 4 | `docs/README.md:31` | 「VSC 轮 A 136 + CLI 轮 B 139」 | 无（历史迁移读数） | **删数**（史在 git） |
| 5 | `docs/core/design/MODEL-BENCH.md:1090` | `docs/core/requirements/` 49 档实扫 | 无 | **删数保事实**：「实扫全树无 bench 主题档」（实测递归 52） |
| 6 | `docs/core/design/DOC-SYSTEM.md:149`–`:151` | 47 + 37 = 84 档 / 15·46·41 档 / 86 档收正 | 无（底本 = 已迁完的 CLI 树） | **删数**（改为「底本 = 已迁树，档数不入判」） |
| 7 | `docs/server/design/gateway/PUBLICNET.md:250` | 「server 设计 30 档、gateway 2 档、部分档 194」 | 无 | **删数**（实测 server/design 递归 30 ✓ · gateway 2 ✓ · 五树部分档 84 ≠ 194） |
| 8 | `docs/server/design/gateway/PUBLICNET.md:147` | 29 → 30 档 · 1 → 2 档 | 迁移落点表自闭合 | 留 |
| 9 | `docs/core/design/ARCHITECTURE.md:59` · `:60` | tool-docs 53 档 · prompts 16 档 | `scripts/tool-schema-size.mjs` 读目录 + `check-vsix` `EXPECT` | 留 |
| 10 | `docs/core/design/TOOLS.md:258` | 「50 档随包发布」 | `thincoder-vscode/scripts/check-vsix.mjs:37` `EXPECT["tool-docs"]` | 留（仓面 53 ∥ 发布面 50 的口径差须在行内写明） |
| 11 | `docs/core/design/CORE-UNIFICATION.md:6` `:8` `:78` `:84` `:94` `:475` `:482` `:503` `:524` | 15 / 16 / 53 档 | 同上门 + 注册表自闭合 | 留 |
| 12 | `docs/core/design/PROMPT-SYSTEM.md:17` `:120` `:173` `:281` | 16 / 53 档（枚举 52 ∥ 目录 53 已在句内） | 同上门 | 留 |
| 13 | `docs/core/requirements/PROMPT-SYSTEM.md:11` `:240` · `NORMAL-MODE.md:33` · `CORE-UNIFICATION.md:8` `:19` `:151` | 16 / 53 / 15 档 | 同上门 | 留 |
| 14 | `docs/core/design/DOC-DISCIPLINE.md:170` `:485` `:486` `:504` `:514` `:515` `:517` `:554` | 13 行 / 8 档 · 37 处 / 6 档 · 9 档 … | 判据面 + 处置登记自闭合 | 留 |
| 15 | `docs/cli/design/CLI-DEBT.md:16` | 现读 = 0 档（越 801 行硬限） | 真实门（`thincoder-cli/AGENTS.md:34` blocking） | 留 |
| 16 | `docs/vsc/design/SETTINGS.md:318` | 域 13 档 ⇒ 下限 ≥6 | 档数下限断言（机判） | 留 |
| 17 | `docs/core/design/MANIFEST.md:708` | tool-docs `*.md`（52 档）实读 | 枚举工具数（口径见 PROMPT-SYSTEM:281） | 留（改写为带口径形） |
| 18 | `docs/desktop/design/CHAT.md:200` | 判定表 50 档 · 对位表 22 行 | `RENDER-CORE.md` §1/§3 表自闭合 | 留 |
| 19 | `docs/core/design/DOC-MIGRATION.md:6` `:249` `:252` `:324` `:325` `:334` `:345` | 84 档 / 136·142 / 17·50 / 139 | 迁移台账自闭合（已结清） | 留 |
| 20 | `docs/render-core/design/RENDER-CORE.md:34` | 实测 7 档（vsix 纳入测试档） | 排除规则判据 | 留 |

**类外残余（登记，不入本批射程）**：同判据扫描 `\d+\s*档` ∧ 同行含 `docs/`∥`现盘`∥`实读` = **134 行 / 153 档命中文件**（`_archive` ∥ `batches` 已排除）；未入上表者全为**机制读数**（耗时 / 用例数 / 阈值 / 逐档行数），按判据归「留」。广口径（任意「数字+量词」）= **2,970 命中 / 153 档**——不作为射程，只作规模读数。
**复跑命令**（实施轮与验收同式，cwd = 仓根）：`node -e` 逐行扫 `docs/**/*.md`（排除 `_archive`/`batches`），正则 `/(\d[\d,]*)\s*档/` 且同行含 `docs/|现盘|实读|实扫|在盘`，打印 `档:行`。判据 = 命中集 ⊆ 上表「留」行 ∪ 类外残余。

**#1507 定稿**

- **唯一路径**：`thincoder-cli/src/tui/render-segments.mjs` —— **187 行**（UTF-8 实读）。面板档 `thincoder-cli/src/tui/subagent-panel.mjs` —— **149 行**（本批零改，`t()` 重写另批）。
- **核字典**：`thincoder-core/i18n.mjs` —— **127 行**（UTF-8 实读）。`sub.*` 八键实读 `:55`–`:62` 逐键相符。
- **增量**：`i18n.mjs` **+4 行**（`sub.async` / `sub.sync` / `sub.waiting` / `sub.awaitingApproval`，与宿主同形：desktop `renderer/i18n.mjs:196-199` ∥ VSC `locales/en.json:206-213`）；`render-segments.mjs` **0 行**（`:27`–`:28` 行内替换：`? "running"` ⇒ `? t("tool.running")`，兜底 `|| "done"` ⇒ `|| t("tool.done")`；`t` 已在 `:14` import）。
- **目标形（收窄后）**：核字典四键在册 + tool 状态词值形统一（`running` ⇒ `running…`，值来自 `tool.running`）。`sub.*` 四键**本批只入册、不接线**——面板 / 冻结头的词面重写（`subagent-panel.mjs:73`–`:75`、`render-segments.mjs:93`）**另批**。
- **AC 全文 = AC-12**（下方）。

**#1372 工厂定稿**

```js
// thincoder-core/memory/read-gate.mjs（新档 ≈22 行）
import { loadProjectDeclaration, isExcludedRelPath, declaredIndexScope } from "<两档现有 import 行同源>" // 符号三件已在两档函数体内实读
export function createReadGate() {
  const declCache = new Map()   // origin → 项目声明
  const scopeCache = new Map()  // origin → 声明范围
  const rowHidden = (origin, path) => { /* 逐字迁 docs.mjs:125-132 */ }
  return { rowHidden }
}
```

- **签名**：`createReadGate()` 零入参（两缓存为闭包私有），返回 `{ rowHidden(origin, path) → boolean }`。
- **缓存来源**：`loadProjectDeclaration(origin)`（项目声明）∥ `declaredIndexScope(origin)`（声明索引范围）；判据 = `isExcludedRelPath(path, d, origin)` ∪ `!isInDeclaredScope(path, scope, origin)`——**四符号**（`loadProjectDeclaration` / `declaredIndexScope` / `isExcludedRelPath` / `isInDeclaredScope`）均从 `../conventions.mjs` 导入（实读 `thincoder-core/memory/docs.mjs:15` ∥ `thincoder-core/memory/code-search.mjs:11`），判据式与判据序逐字沿用。
- **实例粒度 = 每次检索调用建一次**（现 `docSearch` / `codeSearch` 的缓存是函数作用域 Map，寿命 = 单次调用）⇒ 两档各在函数首部 `const { rowHidden } = createReadGate()`，**行为零变**。
- **增量**：`read-gate.mjs` 新档 **+22**；`docs.mjs` **255 −9 = 246**；`code-search.mjs` **168 −8 = 160**（现行行数同「受影响文件」表）。

**受影响文件（现行读数 · 唯一一套；读数 = UTF-8 实读 `split("\n").length − 1`，本轮重测）**

| 档 | 现行行数 | 增量 |
|---|---|---|
| `docs/README.md` | 实施轮首动作前回读 | −（删 4 处档数；名单留） |
| `docs/core/design/MODEL-BENCH.md` | 实施轮首动作前回读 | 句内改写 |
| `docs/core/design/DOC-SYSTEM.md` | 实施轮首动作前回读 | 句内改写 |
| `docs/server/design/gateway/PUBLICNET.md` | 实施轮首动作前回读 | 句内改写 |
| `docs/core/design/TOOLS.md` | 1,554 | −12 行（`thincoder-core/test/` 死引用） |
| `docs/core/design/DOC-DISCIPLINE.md` | 2,158 | +2 句（#1583③ + #1587 档数判据） |
| `docs/core/design/PROMPT-SYSTEM.md` | 1,206 | 0（#1590 零动作） |
| `docs/core/design/BATCH-RECORD.md` | 638 | 0（#1552 零动作；他批在改，本批不触） |
| `docs/RELEASE.md` | 388 | ±（`:37` 413 ∥ `:101` 569 两行拆结构） |
| `docs/core/requirements/ENGINEERING-MODE-V2-SPEC-LEDGER.md` | 98 | 0（1 处改指 · 主 agent 笔） |
| `docs/core/requirements/TESTING.md` | 247 | 0（1 句射程 · 主 agent 笔） |
| `docs/core/requirements/ENGINEERING-MODE-V2-SPEC-TEST-DISCIPLINE.md` | 40 | 0（2 处替换） |
| `docs/core/design/PROVIDER.md` · `PROXY.md` · `TEAM.md` · `AGENT-LOOP-UPSTREAM.md` | 716 · 169 · 226 · 1,281 | 0（#1501 句内） |
| `docs/render-core/design/RENDER-CORE.md` | 510 | 0（8 处） |
| `docs/server/design/client/CLIENT.md` · `docs/server/design/PROJECT.md` | 92 · 302 | 0（3 处） |
| `docs/server/design/agent/ADMIN-AGENT.md` · `docs/server/design/webui/CHAT.md` · `docs/server/design/agent/MEMBER-AGENT.md` | 665 · 286 · 439 | 0（引用形替换） |
| desktop design 11 档 | 实施轮首动作前回读 | 0（句内） |
| `thincoder-core/memory/read-gate.mjs` | 新档 | +22 |
| `thincoder-core/memory/docs.mjs` · `code-search.mjs` | 255 · 168 | −9 / −8 |
| `thincoder-core/ledger-cmd.mjs` · `ledger-db.mjs` | 430 · 264 | 0（3 处行注改指） |
| `thincoder-core/i18n.mjs` | 127 | +4 键 |
| `thincoder-cli/src/tui/render-segments.mjs` | 187 | 0（行内替换） |
| `thincoder-desktop/src/main/session-flags.mjs` | 96 | 0（#1500 零动作） |

**AC 全文（本批判据单源；AC-1…AC-7 为订正后文本，AC-8…AC-14 为新增）**

- **AC-1** 零实施 5 条：`#1220` `#1552` `#1590` 各证据行在本 §2 在册且可复读；`#1500` 前提不成立（`session-slot-write.mjs:122-134` 四判据在册 + `session-flags.mjs:75` 归口）；`#1635` 保持条件态（`scripts/dev-link.mjs:155-160` 两径同形）。
- **AC-2** `grep -c "§13.4"` = **0 / 0**（`thincoder-core/ledger-cmd.mjs` · `ledger-db.mjs`）∧ `docs/core/requirements/ENGINEERING-MODE-V2-SPEC-LEDGER.md` 同串 = **0**（第 4 处）。
- **AC-3** 射程一次写定 = `docs/core docs/desktop docs/render-core docs/server docs/*.md`（`_archive/**` ∥ `batches/**` 除外）。两族零命中：① `随批留存|随档留存|留存归档|可按需复跑` ② `再跑旧档|复跑 = 单档直跑`。
- **AC-4** 产品码面测试门，两命令各带 cwd：① `npm test`（= `node test/run.mjs`）exit 0，cwd = `thincoder/thincoder-cli`；② `node bench/check/run.mjs` 0 failed，cwd = 仓根 `d:\teamcode\thincoder`。覆盖说明：`thincoder-core/memory/docs.mjs` 与 `thincoder-core/memory/code-search.mjs` 的 `rowHidden` 行为由核内检索用例覆盖；若该两档无对应用例 ⇒ 按「未覆盖」记，实施轮补一条定向断言（批内单测，收口随批删）。
- **AC-5** `node scripts/tool-schema-size.mjs`（cwd = 仓根）复跑，`PROMPT-SYSTEM.md` §6.11 表逐项与读数全等（#1590 断言）。
- **AC-6** `doc_check(mode:"gate")` = PASS（本轮改过的档）。
- **AC-7** `#1372`：**改动前基线** `grep -c "const rowHidden = " thincoder-core/memory/docs.mjs thincoder-core/memory/code-search.mjs` = **1 / 1**（>0，防空过）；改动后 = **0 / 0**，`thincoder-core/memory/read-gate.mjs` = **1**。**缓存前提腿（已实读核，非 unverified）**：两缓存均为函数作用域 Map——`thincoder-core/memory/docs.mjs:123`–`:124` 在 `docSearch`（`:111` 起）函数体内 ∥ `thincoder-core/memory/code-search.mjs:41`–`:42` 在 `codeSearch`（`:30` 起）函数体内 ⇒ 每次调用新建。行为等价：同一夹具库 + 同一 query，两搜索函数改动前后命中集逐条相等（id + path 序列逐字相同）。
- **AC-8** `#1514`：`docs/core/design/TOOLS.md` `grep -c "thincoder-core/test/"` = **0**（现 **12** 行，其中 `:744` 的 `test/turn-domain-mode.test.mjs` 按死引用删）。
- **AC-9** `#1620`：`docs/server/design` `grep -rn "2026-10-11-"` = **0**；同域 `\.test\.mjs` 命中集 ⊆ 「批内定向单测（收口随批删）」形。现命中 5 行：`agent/ADMIN-AGENT.md:383` · `agent/MEMBER-AGENT.md:438` · `webui/CHAT.md:257` `:264` `:283`（同族，同条射程内处理）。
- **AC-10** `#1598`：`docs/RELEASE.md` 逐行 UTF-8 `.length` > 300 的行 = **0**（现 **2** 行：`:37` = 413 ∥ `:101` = 569，均为表行）。
- **AC-11** `#1501` 第二形 + `#1508`：`ENGINEERING-MODE-V2-SPEC-TEST-DISCIPLINE.md` 两处替换后旧句 grep = 0；`docs/core/requirements/TESTING.md` N11 句射程 = 「本次清理不得弱化结构机检」，判据源指 `thincoder-core/doc-check/index.mjs`，且该句不再把 `scripts/doc-check.mjs` 列为判据源（grep 该档名在 N11 句内 = 0）。
- **AC-12** `#1507`：① `node` 行扫 `thincoder-core/i18n.mjs` 含四键 `"sub.async"` / `"sub.sync"` / `"sub.waiting"` / `"sub.awaitingApproval"` = **4**；② 域 = **本批实改档** `thincoder-cli/src/tui/render-segments.mjs`：裸字面 `"running"` / `"done"`（不带省略号、非 `t(` 实参）= **0**（基线实读 = **1 / 1**，位 `:27` / `:28`），且 `"running…"` 字面 = **0**（省略号只得来自键值）；同树其余档的 `"running"` / `"done"` 为状态比较 / 注释（实读 16 档 24 行，非显示词位），本批零改、不入本判据；③ 冒烟读数两行入 §5：`renderSubagentPanel`（造一 running 块）与 `toolSeg`（造一 running 工具块）各打出首行，人工对读「无键名泄漏（无 `sub.`/`tool.` 原样出现）」。
- **AC-13** `#1587`：7 条删数行逐处 grep 该行原声明数字串 = **0**（逐项给读数）——① `docs/README.md`：`5 档` / `2 档` / `39 档` ② 同档：`49` ③ 同档：`15 档` ④ 同档：`136` / `139` ⑤ `docs/core/design/MODEL-BENCH.md`：`49 档` ⑥ `docs/core/design/DOC-SYSTEM.md`：`47` / `37` / `84` / `15` / `46` / `41` / `86` ⑦ `docs/server/design/gateway/PUBLICNET.md`：`30 档` / `2 档` / `194`。「留」13 行只作回归锁：各原声明数串仍在（各 ≥1）。
- **AC-14** `docs/core/design/DOC-DISCIPLINE.md` 同一节含两句：**归档取材**（`_archive/**` 为历史记载：不得作出处、不得当现行；派单与写档取材只认 live 面）∥ **档数判据**（**档数类**声明数须有下游消费者：机器读取面 / 清单自身闭合 / 真实门；无下游的档数不写进文档，读名单即可；**行数读数不入本判据**——归 `docs/core/design/DOC-DISCIPLINE.md` §3.19 条目 R 的保留面（`:907` / `:912`））。

**上抛（本块新增）**

- `[上抛·待裁]` `#1587` 射程：台账原文 = 「全库逐处判」；本块落地面 = 上表 20 项（覆盖 `docs/README.md` · core 两树 · server design · render-core · desktop 单点），类外残余 134 行登记不入批。**收窄须父侧点头**：若按全库 134 行一次做，本批规模翻数倍且多为机制读数（判据下应留）。
- `[上抛·待裁]` `#1507` 的 `sub.*` 四键接线与面板词面重写（含 zh 混排）= 另批（本批只入册）。
- `[上抛·知会]` §2 append-only ⇒ #3/#4/#12 的「删」只能给待删区间（`:54`–`:74` · `:99` · `:92` · `:132`–`:133`），实际删除需父侧一次 file edit；未删前两套读数并存，以本块为唯一现行面。

**读数补正（修正轮 1 · 末笔 · 全部 UTF-8/行计数实测）**

- `thincoder-cli/src/tui/render-segments.mjs` = **187 行**（前笔写 188——按 `split("\n").length − 1` 口径收正）；`thincoder-cli/src/tui/subagent-panel.mjs` = **149 行**（前笔 150，同口径）；`thincoder-core/i18n.mjs` = **127 行**（与上块一致）。
- `#1372` 工厂 import 源落地：`import { loadProjectDeclaration, isExcludedRelPath, declaredIndexScope } from "../conventions.mjs"`（`thincoder-core/memory/docs.mjs` 与 `code-search.mjs` 现均从 `../conventions.mjs` 导入；`isInDeclaredScope` 留在两档内联使用）。
- AC-7 改动前基线实读 = **1 / 1**（`const rowHidden = ` 在两档各 1 处）⇒ 改动后 0 / 0 可判。
- AC-4 命令落地：cwd = `thincoder/thincoder-cli`，`npm test` = `node test/run.mjs`（`thincoder-cli/package.json` scripts 实读）；`bench/check/run.mjs` 在仓根 `bench/` 下实存，跑法 = cwd = 仓根 `d:\teamcode\thincoder`。
- AC-12 ② 现值实读：`render-segments.mjs` 内裸 `"running"` = **1**、裸 `"done"` = **1**（`:27`–`:28`）⇒ 改动后应为 0 / 0。

### 修正轮 2（轮次 2 评审 11 条 · 🔴1 ∥ 🟡6 ∥ 🔵4 · 父侧全部接受，按号逐条改）

**本块 = §2 现行读数面。** 本轮零代码、不动 §1 / §3、不改 15 条判类方向、不扩射程。修正轮 1 遗留的待删项（`#1500` 判类格 · `render-segments.mjs:26-27` 无目录片段 · 未解清单死行 · 补全 G 表 · 贴线判）已在本轮就地删除（§2 内文件编辑）；两张受影响文件表已合并为一张（「受影响文件（现行读数 · 唯一一套）」）。

**逐条处置（号 → 改动落点）**

| # | 处置 |
|---|---|
| 1 🔴 | 父侧裁定 = **方案 ②（收窄，不推翻承载档）**：`#1587` 射程收窄为「档数类盘存数」，行数读数不入射程。落点 = 本节「#1587 判据句（定稿）」∧ 本档 `#1587` 行判据句 ∧ 实例清单类定义 ∧ **AC-13** / **AC-14**。 |
| 2 🟡 | 两张受影响表合并：补全 G 表（原 `:88`–`:108`）与贴线判（原 `:110`）整段删除；「唯一一套」表按本轮重测重写，并补入原只住 G 表的 `PROMPT-SYSTEM.md` / `BATCH-RECORD.md` 两行。读数：`docs/RELEASE.md` **388** · `thincoder-core/i18n.mjs` **127** · `DOC-DISCIPLINE.md` **+2 句** · `render-segments.mjs` **187** · `read-gate.mjs` **+22**。 |
| 3 🟡 | `#1500` 判类格：删「待补实读 + 需裁」与「四路判据面本体坐标」括注，改判「零动作（前提不成立）」+ 证据坐标（`thincoder-core/session-slot-write.mjs:122-134` 四判据 ∧ `thincoder-desktop/src/main/session-flags.mjs:75` 归 `slot-missing`）。 |
| 4 🟡 | `#1507`：删 `render-segments.mjs:26-27`（无目录）片段，改指本条「#1507 定稿」块；同行 `subagent-panel.mjs:73-106` 补全为 `thincoder-cli/src/tui/subagent-panel.mjs:73-106`（D4 完整路径）。 |
| 5 🟡 | 未解清单整行删；只留真未解项 = `docs/RELEASE.md` 存量超宽行族（`#1598`），改写为「存量登记（不入本批射程）」。 |
| 6 🟡 | `#1372` import 定稿：`isInDeclaredScope` 来源 = `thincoder-core/conventions.mjs`（实读：`thincoder-core/memory/docs.mjs:15` ∥ `thincoder-core/memory/code-search.mjs:11` 均从 `../conventions.mjs` 导入该符号）⇒ 新档 import 四符号，与判据式一致。 |
| 7 🟡 | AC-12 ② 收域 = 本批实改档 `thincoder-cli/src/tui/render-segments.mjs`（基线 1 / 1）；同树其余档读数 = 16 档 / 24 行（状态比较 / 注释，非显示词位），本批零改、不入判据。 |
| 8 🔵 | 分面标签收正：实施 10 = **文档面 8 + 产品码面 2**（`#1620` 落点全 `.md`，按落点归文档面；产品码面 = `#1372` / `#1507`）。 |
| 9 🔵 | AC-4 两命令各带 cwd（`npm test` ⇒ `thincoder/thincoder-cli`；`bench/check/run.mjs` ⇒ 仓根），删「同级仓根按其实读入口」。 |
| 10 🔵 | AC-13 去恒真 ⊆ 判据，改 7 条删数行逐处 grep 原声明数串 = 0（逐项列 token），「留」13 行只作回归锁。 |
| 11 🔵 | `#1372` 缓存前提腿已实读核（非 unverified）：`thincoder-core/memory/docs.mjs:123`–`:124` 在 `docSearch`（`:111` 起）体内 ∥ `thincoder-core/memory/code-search.mjs:41`–`:42` 在 `codeSearch`（`:30` 起）体内 ⇒ 每次调用新建；并入 AC-7 基线行。 |

**#1587 判据句（定稿 · 落 `docs/core/design/DOC-DISCIPLINE.md` 文档写作纪律节，与 #1583③ 同节）**

> **档数判据**：写进文档的**档数类**声明数须有下游消费者（机器读取面 / 清单自身闭合 / 真实门）；无下游的档数不写进文档，读名单即可。**行数读数不入本判据**——文档档里的行数数字归 `docs/core/design/DOC-DISCIPLINE.md` §3.19 条目 R 的保留面（`:907` / `:912`），本批零改。

**与承载档 `:907` / `:912` 的一致性陈述**：`:907` 现文 = 声明面的记录读数退场、文档档里的行数数字照旧在盘；`:912` 现文 = 文档档里手抄的行数数字零改、属文档事实层。收窄后的判据只删「档数」类盘存数，两条保留面一字不动 ⇒ **承载档零改，判据与保留面不交叉**。（评审另引 `:944` 一条经主机校验内容不匹配，不作依据。）

**`:1045` / `:1050` 一带读数的处置**：该两处现文 = 「抽取面两免」的类名闭集与「仓根 AGENTS.md 三档不另立索引」——均为**判据基数**（下游 = 引擎常量 `thincoder-core/doc-check/anchors.mjs:27`–`:35` 与类名免判据本身）⇒ 属「留」。同档内**行数型读数**（如 §3.19 受影响面表的「当前行数」列、各节体内「N 行」句）归 `:912` 保留面 ⇒ 本批零改。

**#1372 工厂定稿（import 行 · 与判据式一致）**

```js
// thincoder-core/memory/read-gate.mjs（新档 +22 行）
import { loadProjectDeclaration, isExcludedRelPath, declaredIndexScope, isInDeclaredScope } from "../conventions.mjs"
export function createReadGate() { /* declCache / scopeCache 闭包私有；rowHidden 逐字迁 thincoder-core/memory/docs.mjs:125-132 */ }
```

- 两档抽件后 import 行按「本档其余代码仍用到的符号」逐符号裁减（实施轮回读；不得留未用 import）。
- 判据式（`!isInDeclaredScope(path, scope, origin)`）与新档 import 行同源，符号有来源。
- 行为等价与改动前基线 = **AC-7**（含缓存前提腿读数）。

**AC-12 ② 域读数（本轮实读）**：`thincoder-cli/src/**` 裸字面 `"running"` / `"done"` = **16 档 / 24 行**；显示词位仅 `thincoder-cli/src/tui/render-segments.mjs:27`（`? "running"`）与 `:28`（`|| "done"`）= **1 / 1**；其余 15 档为状态比较（`status === "running"` 等）与注释。改后判据 = 该档 **0 / 0** ∧ `"running…"` 字面 **0**。

**上抛（本块）**：`[上抛·知会]` 修正轮 1 各块的「待删 = `:N`」类行号均为 as-of 记录——其对象已在本轮删除，行号不再指向当处（D4：行号只作 as-of 参考）。

## §3 设计评审（评审子代理）

### 轮次 1（评审子代理）

**评审对象**：本档 §2（`:12`–`:137`），15 条全覆盖核（零动作 5 ∥ 文档面 7 ∥ 产品码面 3）。
**范围限制**：评审上下文无 Document Map、无项目标准档（Document ownership 判据降级，按 Guide 判）；按指令只读本档，§2 引用的盘上坐标 / 行数**未做盘上复核**——本报告只用**档内自相矛盾**作证据。

| # | Category | Severity | Issue | Suggestion |
|---|---|---|---|---|
| 1 | Requirements / Acceptance | 🔴 | `#1507` 无任何验收判据：AC-1…AC-7（`:78`–`:84`）覆盖 #1220/#1552/#1590/#1498/#1501/#1372，3 条产品码面里独缺 `#1507`；而其实施对象行数在 `:132` 仍写「待实施读」。⇒ 本批可在该条未验证下收口。 | 补 AC：`thincoder-core/i18n.mjs` grep 四键命中 = 4；TUI 侧 `running…` 字面 grep = 0；跑一次 subagent 面板冒烟并记读数。 |
| 2 | Requirements / Completeness | 🔴 | `#1587` 无实例清单且第二轮未补：`:36` 目标形 = 「全库（`docs/**` live 面，`_archive` ∥ `batches/**` 除外）逐处判」，`:95` 自列「本版未实读到底，第二轮补」的未解清单含「`#1587` 逐处实例清单」，而第二轮块（`:97`–`:137`）只订正 #1598/#1500/#1635、补全 #1514/#1620/#1507，**未触及 #1587**；同档 `:9` 仍称「15 条全覆盖」。 ⇒ 无清单的全库机械清扫既不可实施也不可验收。 | 出实例清单（档:行 + 声明数 + 有无下游消费者 + 删/留），并写成 AC（清单内未处置项 = 0）。 |
| 3 | Clarity / Doc hygiene | 🟡 | 同 §2 两张受影响文件表并存且读数互斥：`:62` `docs/RELEASE.md` 238 ∥ `:119` 387；`:72` `session-flags.mjs` 97 ∥ `:133` 74；「待回填」行亦与 `:115`–`:133` 重复；`:37` 「>300 字符 26 行」∥ `:99` 「超 300 字符 = **2 行**」。`:97` 的「以本块为准」给了排序，两套读数仍在规范面。 | 删除被作废的表与行（历史归记录面 / 提交），§2 只留一套读数。 |
| 4 | Clarity / affected-file annotation | 🟡 | `#1507` 待改源档坐标不自洽且缺现行行数：`:45` 写 `render-segments.mjs:26-27`（无目录）、`:71` 写 `memory/render-segments.mjs`，`:109`/`:132` 写 `thincoder-cli/src/tui/render-segments.mjs` + 「待实施读」；待改源档须有现行行数与增量（纯 `.md` 才豁免）。 | 定唯一路径 + 实读行数 + 增量，删旧写法。 |
| 5 | Scope | 🟡 | `#1507` 目标形与判类冲突：目标形含「CLI 面板改走 `t()` 键（去自铸）」，同格判类写「本批只落「核字典四键 + 值形统一」；CLI 面板词面重写**另批**（上抛）」。两种读法都违反一格。 | 目标形只留本批交付（四键 + 值形统一），`t()` 改写显式移入另批条目。 |
| 6 | Acceptance | 🟡 | 文档面多条无判据：#1514 的 12 行 `thincoder-core/test/**` 死引用、#1620 引用形替换、#1598 两处表行拆结构在 AC-1…AC-7 中均无对应（#1514 第 ④ 类 33 行散文只由 AC-3 的 4 个词面间接覆盖）；#1508 仅靠 AC-6 泛化门。 | 各补一条 grep 型 AC（如 `TOOLS.md` grep `thincoder-core/test/` = 0；`docs/server/design` grep `2026-10-11-` = 0；`RELEASE.md` :35/:99 行宽 ≤300）。 |
| 7 | Acceptance | 🟡 | AC-2（`:79`）只覆盖 3 处 `§13.4`（两档产品码），第 4 处 `docs/core/requirements/ENGINEERING-MODE-V2-SPEC-LEDGER.md:84`（`:31`/`:93` 自述）无判据。 | AC-2 增加该档 grep = 0。 |
| 8 | Acceptance | 🟡 | AC-3（`:80`）只判 4 个词面，`#1501` 目标形的第二个替换（`:32` 「复跑 = 单档直跑」改「运行口径 = 批内单档直跑，无『再跑旧档』面」）无判据；AC-3 文内射程（含 `docs/vsc`）与 `:137` 补订（去掉 `docs/vsc`）并存。 | AC-3 补 grep「单档直跑」/「再跑旧档」，射程一次写定。 |
| 9 | Feasibility | 🟡 | AC-4（`:81`）是产品码面唯一测试门，只写 `node bench/check/run.mjs`，无工作目录、无覆盖说明；Guide 记录的主测试入口为 `npm test` → `node test/run.mjs`。执行者无法确认跑哪个、该套是否覆盖 `memory` 检索与 i18n。 | 写明根目录 + 命令，并说明覆盖 `docs.mjs`/`code-search.mjs` 的 `rowHidden` 行为，否则视为不覆盖。 |
| 10 | Clarity | 🟡 | `#1372` 抽件缺接口语义：`:43` 「导出 `createReadGate()`（返回 `{ rowHidden }`，内部持两缓存）」无入参、未说两缓存取数来源、未说「每档一实例 ∥ 共享单例」，同格却断言「行为零变：同判据、同缓存粒度」；若新档需自取 manifest/root，则新档 ≠ ≈20 行、`−9/−8` 需重算。 | 钉住工厂签名、缓存来源、实例粒度（每档建一次），据此回填三档增量。 |
| 11 | Acceptance | 🟡 | AC-7（`:84`）为文本形 grep `const rowHidden = `，若现码为函数形则改动前同样 0 命中 ⇒ 可空过；且它只证「无同名文本」，不证两档检索结果不变。 | 加改动前基线读数（同 grep 改动前 > 0）+ 一条行为等价断言。 |
| 12 | Doc hygiene | 🟡 | 规范面残留被推翻的处置：`:92` 仍写「「四路判据面」本体坐标需先定；定后再判补登记 ∥ 补判据」，而 `:101` 已判「判定 = **零动作（前提不成立）**」；`:99` 以「上一块 `#1598` 行作废」墓碑式订正替代删除。 | 删掉被推翻的提法与墓碑句，只留现行判定 + 一行证据。 |
| 13 | Clarity / Consistency | 🟡 | 零动作计数三处不一致：`:9` 「零动作 5（… #1500 前提不成立）」∥ `:18` 「零动作四条（每条给证据）」（表内 4 行且含条件态 #1635）∥ `:78` 「AC-1 零动作四条」只点名 3 条 + #1635；`#1500` 的零动作判定（`:101`）不在任何 AC。 | 一处枚举定稿（零动作 4 + 条件态 1 + 前提不成立 1 或按实重划），AC-1 同步。 |
| 14 | Methodology / Ownership | 🟡 | `#1587` 判据（声明数须有下游消费者）本批全库执行，但不入承载该主题的档：本批 `#1583③` 正在 `docs/core/design/DOC-DISCIPLINE.md` 加写作纪律句，判据却不入该节；按 Guide「design decisions must be written to docs immediately」，下轮清扫需重新推导。 | 该二值判据一句写进 `DOC-DISCIPLINE.md` 同一节（与 `#1583③` 合笔）。 |
| 15 | Methodology | 🟡 | 缺 closest-precedent 行：§2 无「先例坐标 ∥ 对应设计节 ∥ 先例批 ∥ 一致/偏离理由」；最近者为 `:4` 「前情 = docs/batches/2026-10-19-tech-todo-sweep.md（在途）」，属前情指针非先例对照；无先例时亦无显式声明。 | 补一行先例对照，或显式写「无先例 + 理由」。 |
| 16 | Methodology | 🟡 | 缺 survey-evidence 行：无「已查哪些公共来源档（含独立档仓）∥ 是否相关」记录；`:3` 来源行只列用户令，`:4` 只列前情批。 | 补一行（查过的档 ∥ 结论；无相关也须写「无相关」）。 |
| 17 | Clarity | 🔵 | 引用未定义规则号：`:31`/`:50` 的「D2 违反」、`:89` 的「D10 面另裁」在本档与 Guide 内无定义/坐标。 | 给规则号出处（档:行）或改写规则原文。 |
| 18 | Evidence | 🔵 | `#1220` 证据一腿无坐标：`:22` 其余三面均给档:行，CLI 面写「CLI 零改（既有 `cmd-team.mjs` `syncProvidersFromDisk` 覆盖）」无档:行。 | 补该档:行，否则该腿标 unverified。 |
| 19 | Note | 🔵 | 已查判为无问题两项，记录在案：① `TOOLS.md` 1,119 / `DOC-DISCIPLINE.md` 1,199 越 800（`:135`）——纯 `.md` 对 code-structure 档位规则豁免，不需拆档计划，「存量债」措辞不作缺陷；② 零动作 5 条的判定各带可复读坐标（`:22`–`:25`、`:101`–`:103`），评审焦点②成立。 | 保留现状，无动作。 |

**计数**：🔴 2 ∥ 🟡 14 ∥ 🔵 4（共 20 条）。
VERDICT: changes-required

### 轮次 2（评审子代理）

**评审对象**：§2 修正轮 1（`:114`–`:259`）+ 20 条落地面。**核法**：逐条对读修正轮「处置」列与该条**盘上现行文本**，不重新狩猎无关面。**范围限制**：评审上下文只给两档（本批档 ∥ `docs/core/design/DOC-DISCIPLINE.md`），§2 引用的产品码坐标 / 行数**未做盘上复核**；涉及盘上状态的断言一律标 unverified。

| # | Category | Severity | Issue | Suggestion |
|---|---|---|---|---|
| 1 | Methodology / Document ownership | 🔴 | `#1587` 判据句与承载档既有规范句**同一主题两处相反**：本档 `:36` 目标形「无下游的声明数**删数保事实**」+ AC-14（`:245`）「无下游的盘存数不写进文档，读名单即可」，而 `docs/core/design/DOC-DISCIPLINE.md:912` 写「文档档里**手抄的行数数字**零改——属文档事实层」、`:944` 写「不删文档档里的行数数字」、`:907` 写「文档档里的行数数字照旧在盘（两件事）」。本批对承载档的增量只有 `:213` 的「+2 句」，**无一行收正 `:907`/`:912`/`:944`** ⇒ 落笔后同档并存两条相反的现行判据，读者（与 RAG）无法判定哪一条权威。先例行虽声明了偏离（`:145`），但偏离未落到承载档的保留面，反而与其并存。 | 二选一并在承载档同轮收正：① 把 `:907`/`:912`/`:944` 的保留面收窄到「行数数字」以外的口径并写明「盘存数按声明数判据办」；或 ② `#1587` 判据收窄为「档数类盘存数」，行数读数不入射程。二路都须在 `:213` 的增量行里点名被收正的原句坐标，不得只写「+2 句」。 |
| 2 | Clarity / Doc hygiene（焦点③） | 🟡 | 焦点③答案 = **仍有互斥读数**。修正轮 #3 的待删区间（`:124`「待删区间 = `:54`–`:74`（旧受影响文件表）」）只覆盖一张表；**补全 G 的受影响文件表（`:88`–`:108`）仍在规范面**，与「唯一一套」表（`:204`–`:228`）逐项打架：`docs/RELEASE.md` 387（`:96`）∥ **389**（`:214`）；`thincoder-core/i18n.mjs` 105（`:108`）∥ **127**（`:226`）；`DOC-DISCIPLINE.md` +1 句（`:93`）∥ +2 句（`:213`）；`render-segments.mjs` **188**（`:227`）∥ 187（`:255`）；`read-gate.mjs` ≈20（`:105`）∥ +22（`:202`）。`:116` 的「本块 = §2 的唯一现行读数面」给了排序，故不升 🔴，但两套数在规范面并存本身即 D8 未拔净。 | 把 `:88`–`:108` 整表列入删除区间（与 #3 的原区间合并），或逐行改「见现行表」；同时删 `:110` 的贴线判（读数依赖已作废表）。 |
| 3 | Doc hygiene（#12 未落净） | 🟡 | 被推翻的 `#1500` 处置**仍在规范面**：`:44` 判类格仍写「**待补实读 + 需裁**：先定「四路判据面」所指，再判「补登记 ∥ 补判据」（上抛）」+「（待补实读：四路判据面本体坐标）」，而 `:78` 已判「判定 = **零动作（前提不成立）**」、AC-1（`:232`）已写「`#1500` 前提不成立」。修正轮 #12 的待删只点了「`:92` 的…条 ∥ `:99` 墓碑句」，未及 `:44` 判类格。 | 删 `:44` 的「待补实读 + 需裁」判类与括注，只留「零动作（前提不成立）」+ 一行证据坐标（证据行已在 `:78`）。 |
| 4 | Clarity（#4 未落净） | 🟡 | `#1507` 旧写法**未删**：`:45` 仍写「`render-segments.mjs:26-27` tool 状态词值形差」——无目录段（违 `DOC-DISCIPLINE.md:18` 的 D4 消费点坐标须自仓根完整路径），且与唯一路径 `:180`「`thincoder-cli/src/tui/render-segments.mjs`」并存；修正轮 #4（`:125`）自认「`:45` 与 `:71` 的两种旧写法作废（待删 = 该两处片段）」，父侧只删了 `:71`。 | 删 `:45` 该片段并指向 `:178` 的 `#1507` 定稿节（唯一路径 + 行数 + 增量已在册）。 |
| 5 | Doc hygiene | 🟡 | 未解清单（`:73`）整行已成死清单：仍列 `#1500` 四路判据面坐标（`:78` 已判前提不成立）· `#1507` 现号实测（`:253` 已收正）· `#1620` 测试档在盘状态（`:84` 已核）· `#1587` 逐处实例清单（`:148` 已出表且 `:123` 自称销项）。读者会据该行重开已结项当活工单（D8 的立条理由）。 | 整行删（历史归 git），或只留真未解项（`#1598` 其余存量族）并改写为「登记、不入本批射程」。 |
| 6 | Clarity / Feasibility（#10） | 🟡 | `#1372` 工厂定稿的 import 行与判据式**不自洽**：判据式（`:200`）要求 `rowHidden` 体内调 `!isInDeclaredScope(path, scope, origin)`，而 import 行（`:256`）只给 `loadProjectDeclaration, isExcludedRelPath, declaredIndexScope`，并注明「`isInDeclaredScope` 留在两档内联使用」⇒ 新档 `read-gate.mjs` 内的 `rowHidden` 引用一个该档没有来源的符号，实施者无法照定稿落笔（现码该符号是两档各自持有还是 `conventions.mjs` 导出，本档未实读）。 | 在 `#1372` 工厂定稿里把 `isInDeclaredScope` 的来源钉死（`conventions.mjs` 导出并加入新档 import 行，或随 `rowHidden` 一并迁入并从此不在两档保留同名实现），并把 `:200` 的判据式与 import 行对齐。 |
| 7 | Acceptance（#1 AC-12 可验面） | 🟡 | AC-12 ② 的域**大于**本批改动面：`:243` 判「`thincoder-cli/src/**` 内裸字面 `"running"` / `"done"` = **0**」，而本批只改 `render-segments.mjs` 的 `:27`–`:28`（`:182`「`:27`–`:28` 行内替换」），现值基线也只在该一档量过（`:259`「裸 `"running"` = **1**、裸 `"done"` = **1**」）。同树其它档（`subagent-panel.mjs` 词面本批明令不动、另批）若含同形裸字面，AC 永不可达而本批无权改。**该面盘上未复核（unverified）**。 | AC-12 ② 的域收为「`thincoder-cli/src/tui/render-segments.mjs` 及本批实改档」，或先给 `thincoder-cli/src/**` 的基线读数（各档命中数）再定域——不得以「改动后应为 0」替代基线。 |
| 8 | Clarity（计数口径） | 🔵 | 「实施 **10 = 文档面 7 + 产品码面 3**」（`:134`）与表位不符：产品码面表（`:39`–`:46`）有 4 行，其中 `#1620`（`:46`）的落点全是 `.md`（`ADMIN-AGENT.md` / `CHAT.md` / `MEMBER-AGENT.md`），实为文档面改；按落点应是文档面 8 ∥ 产品码面 2（总数 15 不变）。 | 改分面标签或在 `:134` 注明「`#1620` 按表位归产品码面（落点实为文档面）」。 |
| 9 | Acceptance | 🔵 | AC-4（`:235`）的 cwd 括注自相抵：「`node bench/check/run.mjs`（cwd = `thincoder/thincoder-core` 同级仓根按其实读入口）」——「同级仓根」无从判读，`:258` 才给定「cwd = 仓根 `d:\teamcode\thincoder`」。判据单源应自带可执行形。 | AC-4 的两条命令各写「cwd = …」一项，删「同级仓根按其实读入口」措辞（与 `:258` 对齐）。 |
| 10 | Acceptance | 🔵 | AC-13（`:244`）后半「复跑命令命中集 ⊆ 上表「留」行 ∪ 类外残余」按构造恒真：类外残余（`:175`）的定义即「未入上表者」的全集 ⇒ ⊆ 判据不可证伪。可判部分只剩「20 项未处置项 = 0」。 | 把 ⊆ 判据换成可证伪形：7 条「删数」行的坐标逐处 grep = 0（逐处列读数），「留」行只作回归锁。 |
| 11 | Note（焦点② 判） | 🔵 | `#1372`「每次检索建一次 = 行为零变」（`:201`）**逻辑上成立**：两缓存寿命 = 单次调用，工厂在函数首部每次建实例 ⇒ 缓存粒度与寿命均同前，行为等价断言（AC-7 `:238`）也与之一致。**唯一未核腿 = 前提「现两缓存是函数作用域 Map」**（`thincoder-core/memory/docs.mjs` / `code-search.mjs` 不在本次评审域，unverified）。 | 无动作；实施轮首动作前实读该两处缓存的作用域并记一行读数（并入 AC-7 基线）。 |

**逐条落点速记（20 条 → 结论）**：#1 ✅（AC-12 全文在册，① = 4 ∧ ② 基线 1/1 已记；域问题见 #7）· #2 ✅（20 项表 `:152`–`:173`，删 7 ∥ 留 13，四项齐；⊆ 判据见 #10）· #3 ⚠️ 部分（旧表删了、第二表漏删 → 本表 #2）· #4 ⚠️ 部分（`:45` 未删 → #4）· #5 ✅（目标形已收窄）· #6 ✅（AC-8…AC-11 在册）· #7 ✅（AC-2 四处在册）· #8 ✅（AC-3 两族 + 射程一次写定）· #9 ⚠️（AC-4 cwd 见 #9）· #10 ✅（签名 / 缓存来源 / 粒度 / 三档增量齐；import 行见 #6）· #11 ✅（AC-7 基线 1/1 + 行为等价）· #12 ⚠️ 部分（`:44` 未删 → #3）· #13 ✅（计数定稿 + AC-1 点名 5 条；分面标签见 #8）· #14 ✅（判据句入承载档为 AC-14；与既有保留面冲突见 #1）· #15 ✅（先例行 `:145`：条目 R 坐标 `DOC-DISCIPLINE.md:903` 实存 + 偏离理由）· #16 ✅（勘察证据行 `:146`，含「无相关」结论）· #17 ✅（`D1–D9 = DOC-DISCIPLINE.md:9` 实存，D10 改写）· #18 ✅（`cmd-team.mjs:181/:202/:219` 坐标补入）· #19 ✅（保留现状）· #20 ✅（计数 20 核对）。

**计数**：🔴 1 ∥ 🟡 6 ∥ 🔵 4（共 11 条；焦点①②③ 各有落点：#1 见行 1/#7，焦点② 见行 11，焦点③ 见行 2）。

VERDICT: changes-required

### 轮次 3（评审子代理）

**评审对象**：批 K 三轮 = 验修正轮 2 的 11 条（不狩猎新问题）· 对象状态 待评审
**核法**：逐条对读修正轮 2「处置」列与**盘上现行文本**（本档 §2 ∥ `docs/core/design/DOC-DISCIPLINE.md`）。§2 引用的产品码坐标未做盘上复核，涉及盘上状态的断言标 unverified。

| # | Orig# | File | Severity | Status | Notes |
|---|-------|------|----------|--------|-------|
| 1 | 1 | 2026-10-19-tech-sweep-rest-core.md | 🔴 | Fixed | 方案②已落：判据句只见「档数」——`:36`「判据 = **档数类声明数须有下游消费者**」· `:118`「类定义 = **档数类盘存数**」+「**行数读数不入本类**」· `:253`「无下游的**档数**不写进文档…**行数读数不入本判据**」· `:215` AC-14 同步加限定词。承载档保留面**逐字未改**：`DOC-DISCIPLINE.md:907` = 「声明面的**记录读数**退场，文档档里的行数数字照旧在盘（两件事）」· `:912` = 「- 文档档里**手抄的行数数字**零改——属文档事实层…」· `:944` = 「不折行、不删文档档里的行数数字」⇒ 判据与保留面不再交叉。 |
| 2 | 2 | 2026-10-19-tech-sweep-rest-core.md | 🟡 | Fixed | 两张表已并一张：现行 `:172`–`:198` 为唯一「受影响文件（现行读数 · 唯一一套）」；补全 G 表与贴线判在档内已无命中（仅 `:233`/`:240` 的处置叙述提及）。互斥读数已消：`docs/RELEASE.md` **388**（`:184`，`413`/`569` 与 AC-10 `:211` 同值）· `i18n.mjs` **127**（`:149`/`:196`/`:225` 三处同值）· `DOC-DISCIPLINE.md` **+2 句**（`:181`）· `render-segments.mjs` **187**（`:148`/`:197`/`:225`）· `read-gate.mjs` **+22**（`:193`/`:262`）。 |
| 3 | 3 | 2026-10-19-tech-sweep-rest-core.md | 🟡 | Fixed | `:44` 判类格已改「**零动作（前提不成立）**——「四路判据面」在盘上无对应物」+ 证据坐标；「待补实读 + 需裁」「四路判据面本体坐标」两处措辞在档内只剩 `:101`/`:241` 的处置叙述（历史），规范面已清。 |
| 4 | 4 | 2026-10-19-tech-sweep-rest-core.md | 🟡 | Fixed | `:45` 已无 `render-segments.mjs:26-27` 片段；同格面板档改全路径「`thincoder-cli/src/tui/subagent-panel.mjs:73-106`」（D4 完整路径）。 |
| 5 | 5 | 2026-10-19-tech-sweep-rest-core.md | 🟡 | Fixed | 未解清单整行已删（`:73` 现为「**补全 D（`#1514` 分类读数）**」）；唯一真未解项改挂 `:64`「**存量登记（不入本批射程）**：`docs/RELEASE.md` 台账点名 2 处之外的存量超宽行族（`#1598`，数目不入判）。」 |
| 6 | 6 | 2026-10-19-tech-sweep-rest-core.md | 🟡 | Fixed | 工厂定稿 import 行已含四符号：`:263`「import { loadProjectDeclaration, isExcludedRelPath, declaredIndexScope, isInDeclaredScope } from "../conventions.mjs"」，来源在 `:244` 钉死（`docs.mjs:15` ∥ `code-search.mjs:11`），`:268`「判据式与新档 import 行同源，符号有来源」。残项见行 13。 |
| 7 | 7 | 2026-10-19-tech-sweep-rest-core.md | 🟡 | Fixed | AC-12 ② 域已收为实改档：`:213`「② 域 = **本批实改档** `thincoder-cli/src/tui/render-segments.mjs`…对（基线实读 = **1 / 1**，位 `:27` / `:28`）」，同树其余档读数登记在 `:271`（16 档 / 24 行，非显示词位，不入判据）。① 四键 = 4 与 ③ 冒烟两行仍在册。 |
| 8 | 8 | 2026-10-19-tech-sweep-rest-core.md | 🔵 | Unfixed | 分面标签只改一处、两处旧值仍在：`:246`「实施 10 = **文档面 8 + 产品码面 2**」∥ `:102`「实施 **10 = 文档面 7 + 产品码面 3**」∥ 状态行 `:9`「实施 10（文档面 7 + 产品码面 3）」⇒ 同一分面两个互斥读数残留（总数 15 不变）。非阻塞。 |
| 9 | 9 | 2026-10-19-tech-sweep-rest-core.md | 🔵 | Fixed | `:205` AC-4 两命令各带 cwd：「① `npm test`（= `node test/run.mjs`）exit 0，cwd = `thincoder/thincoder-cli`；② `node bench/check/run.mjs` 0 failed，cwd = 仓根 `d:\teamcode\thincoder`」；「同级仓根」措辞已消。 |
| 10 | 10 | 2026-10-19-tech-sweep-rest-core.md | 🔵 | Fixed | AC-13 已换成可证伪形：`:214`「7 条删数行逐处 grep 该行原声明数字串 = **0**（逐项给读数）…「留」13 行只作回归锁」。残项：`:144` 复跑命令行末仍留旧判据「判据 = 命中集 ⊆ 上表「留」行 ∪ 类外残余。」（恒真式，已不属任何 AC）。 |
| 11 | 11 | 2026-10-19-tech-sweep-rest-core.md | 🔵 | Fixed | 缓存前提腿已记读数：`:208`「**缓存前提腿（已实读核，非 unverified）**：两缓存均为函数作用域 Map——…⇒ 每次调用新建」+ `:249` 同述；行为等价断言同条在册。该两处盘上读数不在本轮域（unverified）。 |
| 12 | (new) | 2026-10-19-tech-sweep-rest-core.md | 🟡 | New: 先例块仍是**收窄前**的口径，与裁定后的判据相抵 | `:113` 写「`#1587` 与其对齐（**保留面**：机制读数 / 判据基线 / 自闭合清单 / 真实门；**退场面**：盘存规模数）。偏离 = 条目 R 只退 `checkConfig.lineCounts` 声明面，本批退的是文档散文里的盘存数」——「盘存规模数 / 盘存数」未限定为档数类，而 `:118`「**行数读数不入本类**」、`:253` 只删「档数」。裁定 #1 的落点表（`:239`）未含 `:113`，故该句未随收窄同拍改。判据单源（AC-14 + 定稿 + 类定义 4 处）一致，读者有权威裁决面 ⇒ 不升 🔴；照 `:113` 读则仍会删行数数字、撞 `:912`。 |
| 13 | (new) | 2026-10-19-tech-sweep-rest-core.md | 🟡 | New: 修正轮 1「读数补正」块的三符号 import 行未作废，与 `:263` 抵 | `:226` 写「`#1372` 工厂 import 源落地：`import { loadProjectDeclaration, isExcludedRelPath, declaredIndexScope } from "../conventions.mjs"`…（`isInDeclaredScope` 留在两档内联使用）」——与 `:263` 的四符号 import 行是同一新档的两种写法；照 `:226` 落笔仍缺 `isInDeclaredScope`（正是上一轮 🟡6 要修的形态）。`:233`「本块 = §2 现行读数面」给了排序 ⇒ 不升 🔴。 |
| 14 | (new) | 2026-10-19-tech-sweep-rest-core.md | 🔵 | New: 承载档行数读数与本轮盘上不符（登记） | `:181`「| `docs/core/design/DOC-DISCIPLINE.md` | 2,158 | +2 句（#1583③ + #1587 档数判据） |」，而本档盘上读取末行 ≥ `:2238`（本轮 read）。`.md` 行数属 §3.7 豁免面、且读数浮动 ⇒ 只登记，不作判据。 |

**焦点三题结论**
① 🔴 裁定真落地：`#1587` 判据句只见「档数类」、明写「行数读数不入本判据」，`DOC-DISCIPLINE.md:907`/`:912`（及 `:944`）保留面逐字未改 ⇒ 越权改承载档未发生。
② 两张受影响表真的只剩一张（补全 G 表 · 贴线判已删），新表读数内部自洽（388 / 127 / +2 句 / 187 / +22 五处均唯一）。
③ 旧 AC-1…AC-7 块确已并入唯一 AC 清单（`:200`–`:215`，AC-1…AC-14 单一套，无第二套判据）。

**计数**：🔴 0 ∥ 🟡 2（新）∥ 🔵 1（新）+ 1（旧·部分落）= 4 条遗留；上一轮 11 条中 **Fixed 10 · Unfixed 1（🔵8）**。

VERDICT: pass

## §4 用户批准（主 agent）

### 批准（2026-10-19 · 父侧代签）

**依据**：用户 2026-10-19 11:10「都起。赶紧干完。」= 整批令。
**代签说明**：主 agent 代签，**非用户逐条过目**；用户另有处置则本行作废、按令重走。
**评审收敛**：三轮（首审 🔴2·🟡14·🔵4 → 修正 → 二轮 🔴1·🟡6·🔵4 → 修正 → 三轮 **🔴0** 遗留 🟡2·🔵3，全非阻塞）。**评审通过**。

**实施拆分（按变更面）**：
- **代码面 → eng-coder**：`#1372` 读闸抽件（`thincoder-core/memory/read-gate.mjs` 新建 + `docs.mjs` / `code-search.mjs` 改 import）∥ `#1507` 核字典补四键（`thincoder-core/i18n.mjs`）+ `thincoder-cli/src/tui/render-segments.mjs` 值形统一。
- **文档面 → eng-designer**：`#1498` 余 4 处改指 ∥ `#1501` 留存族替换 ∥ `#1514` 死引用 ∥ `#1508` §11.6 回指 ∥ `#1583③` 归档取材句 ∥ `#1587` 档数类盘存数清理 ∥ `#1598` 两行拆结构 ∥ `#1620` 引用形替换。
- **零动作 5 条不实施**（`#1220` · `#1552` · `#1590` 已落 / `#1635` 条件态 / `#1500` 前提不成立）。

## §5 实施记录（eng-coder）

**状态行**：实施完成 2026-10-19

### 交付摘要

批 K 代码面两条（文档面归另一席，本席零碰文档）：

- `#1372` 读闸抽件：新增 `thincoder-core/memory/read-gate.mjs`（导出 `createReadGate()` → `{ rowHidden }`，两缓存为闭包私有 Map）；`memory/docs.mjs` ∥ `memory/code-search.mjs` 改为 import + 调用。判据序、缓存来源、缓存寿命逐项沿用设计定稿 ⇒ 行为零变。
- `#1507` 核字典补四键（`sub.async` / `sub.sync` / `sub.waiting` / `sub.awaitingApproval`，值形与宿主逐字同形）+ `thincoder-cli/src/tui/render-segments.mjs:27-28` 两处裸字面改走 `t("tool.running")` / `t("tool.done")`（行内替换，Δ 0 行）。

### 改动清单（5 档 · 行数按 `split("\n").length − 1` 实读）

| 档 | 改前 → 改后 | 改动 |
|---|---|---|
| `thincoder-core/memory/read-gate.mjs` | 新档 → **26** | 新增：四符号 import + 工厂（两缓存闭包私有 + `rowHidden` 逐字迁自两档） |
| `thincoder-core/memory/docs.mjs` | 255 → **246** | import 裁为 `loadProjectDeclaration, declaredIndexScope`（两符号仍用于 `:37` / `:93`）+ 新 import `createReadGate`；`docSearch` 内 10 行判据体换为 `const { rowHidden } = createReadGate()`；机制注释收为指向单源的 2 行 |
| `thincoder-core/memory/code-search.mjs` | 168 → **159** | import 裁为 `declaredPublicRoots`（仍用于 `:23`）+ 新 import `createReadGate`；同上换调用；注释同收 |
| `thincoder-core/i18n.mjs` | 127 → **132** | `sub.*` 族补四键（`:64`-`:67`）+ 1 行来源注释（`:63`） |
| `thincoder-cli/src/tui/render-segments.mjs` | 187 → **187** | `:27` `? "running"` ⇒ `? t("tool.running")`；`:28` `|| "done"` ⇒ `|| t("tool.done")`（`t` 已于 `:14` import） |

### 判据读数（派单六项）

| # | 判据 | 读数 |
|---|---|---|
| ① | 两档导出名与改前一致 | **逐名相等**：`docs.mjs` 改前/改后 = `docSync, syncDocRoot, docSearch, ensureDocEmbeddings, docSearchTool, memoryTools`（6）∥ `code-search.mjs` = `searchOrigins, codeSearch, ensureCodeEmbeddings, codeSearchTool`（4）；对拍脚本 = `git show HEAD:<档>` 的导出名序列与工作树 `JSON.stringify` 比较，两档均 `equal=true`。**派单写「各 11 名」与盘上不符**：两档实为 6 / 4，合计 10，加新档 `createReadGate` = 11——按「共 11 名」读成立，按「各 11 名」读无可判对象（登记，非代码偏差） |
| ② | `read-gate.mjs` 导出 `createReadGate`，体内调 `isInDeclaredScope`，四符号 import 齐 | `read-gate.mjs:14` `export function createReadGate()`；`:11` import 四符号（`loadProjectDeclaration, isExcludedRelPath, declaredIndexScope, isInDeclaredScope` ← `../conventions.mjs`，`:192` 再导出实读在位）；`:23` `return !isInDeclaredScope(path, scope, origin)` |
| ③ | AC-7：两档 `const rowHidden = ` 命中 0 ∧ `read-gate.mjs` = 1（改前基线 1/1） | 改前基线 **1 / 1**（实测 `docs.mjs:125` ∥ `code-search.mjs:43`）；改后 **0 / 0** ∧ `read-gate.mjs:17` = **1** |
| ④ | `#1507` 四键 = 4；`render-segments.mjs` 裸 `"running"`/`"done"` = 0/0；`"running…"` 字面 = 0 | 四键 **4**（`i18n.mjs:64`-`:67`）；裸字面 **0 / 0**（基线 1 / 1，位 `:27` / `:28`）；`"running…"` 字面 **0** |
| ⑤ | `node --check` 全过 | 五档逐个 `node --check` 均 OK（exit 0，无输出） |
| ⑥ | doc_check gate | **未能出 PASS**：`DOC-CHECK GATE: ERROR（引擎已更新（doc-check/anchors.mjs mtime 2026-10-19T03:26:23.200Z > 进程启动 2026-10-19T02:35:53.303Z），请重启会话后复跑）`；引擎档正被别批（`docs/batches/2026-10-19-doccheck-scope.md` 在途）改动 ⇒ fail-closed。本席本轮**零写文档**，gate 判定集为空；已上抛，请收口侧在引擎静止后复跑并记读数 |

### 验证读数（跑过的命令 + 结果）

- 行为等价（AC-7 行为腿，批内一次性对拍，用毕已删）：同一夹具库（`PROJECT-MANIFEST.json` 声明 `codePaths:["src"]` + `index.excludePaths:["vendor"]`）+ 同一 query `widget`，「抽件前 core（`git show HEAD` 覆盖两档 + 删新档）」与「抽件后工作树 core」各跑 `docSearch` / `codeSearch` —— 命中集**逐字相同**且闸确实生效：`{"docs":["docs/design/visible.md"],"code":["src/a.mjs","src/vendor/nested.mjs"]}`（隐藏行：doc 3 条 = 批次段命中 1 ∥ 范围外 1 ∥ 排除前缀 1；code 2 条 = 排除前缀 1 ∥ 范围外 1）。
- 冒烟（AC-12③，批内一次性脚本，用毕已删）：`toolSeg` 造 running 块 ⇒ 首行 `❯ read a.txt  · running…`；done 带 elapsed ⇒ `❯ read a.txt  · 42ms`；done 无 elapsed/summary ⇒ `❯ read a.txt  · done`；键名泄漏判 `/sub\.[a-z]|tool\.[a-z]/` = `false`。
- `node test/run.mjs`（cwd `thincoder-core`）：`tests 5 · pass 5 · fail 0`（该树仅 doc-check 用例，memory 检索无对应用例 ⇒ 按 AC-4「未覆盖」记，由上方行为等价对拍补足）。
- `node test/run.mjs`（cwd `thincoder-cli`）：`test manifest is empty — zero tests = green (2026-09-28 full reset)`。
- `node bench/check/run.mjs`（cwd 仓根）：`bench/check: 118 passed, 0 failed`，exit 0。

### 设计漂移登记（文档面回填项，本席零改文档）

- `read-gate.mjs` 实 **26** 行（§2 写 ≈22 / +22）——多出档头机制注释（` :1`-`:10`）与一行 jsdoc，代码体与定稿骨架同构。
- `code-search.mjs` 168→**159**（§2 写 160）——两档共用的机制注释同步收行，比预测少 1 行，无行为面。
- `i18n.mjs` 127→**132**（§2 写「+4 键」）——4 键 + 1 行来源注释；键计数判据（AC-12① = 4）不受影响。
- `docs/core/design/API-CONTRACT.md`（生成区）未重生成：新增导出 `createReadGate` 不在生成面，且两档新 import 行使 `searchOrigins` / `codeSearch` 坐标后移 1 行（生成区仍记 `code-search.mjs:19` / `:30`，实读 `:20` / `:31`）。生成器唯一笔 = 父侧 `node scripts/api-contract.mjs --write`（`--check` 为报告态、不入闸），本席不代写。

### 过程纪律

- **越界改动**：无。产品档面只动上述 5 档；批内两枚探针（`.thincoder/tmp/k1372-gate-equiv.mjs` ∥ `k1507-toolseg-smoke.mjs`）与夹具目录用毕即删（零留存，全仓 glob 复核零命中）。
- **自审轮次**：内部 explore 偏离审计 1 轮（结论 = 判据面全部符合，唯一一类 = 上述三处行数读数漂移，🔵）∥ advisor 代码评审 1 轮（VERDICT: pass；两条 🟡 = `API-CONTRACT.md` 生成面待父侧重生成、§5 读数待补（即本段）、两条 🔵 = `memory/file-list.mjs:50`/`:52` 第三处同判据、`render-segments.mjs:93` 面板词面另批残留）。自修正轮次 0。
- **终态**：`clean`（无未处置偏差；两项 🟡 均属父侧收口动作，已在此点名）。

## §6 验证与收口（父代理）

### 收口（2026-10-19）

**角色表**：讨论 ∥ 收口 = 主 agent · 设计 = eng-designer（修正轮 1 收口）· 评审 = advisor 二轮 · 实施 = eng-coder `#23`。

**状态行**：实施完成 · **已收口 2026-10-19**。

**交付读数（`#1372` 读闸抽件 ∥ `#1507` 四键）**：

| 判据 | 读数 |
|---|---|
| 导出名逐名相等 | `docs.mjs` **6** ∥ `code-search.mjs` **4**（合计 10）+ 新档 `createReadGate` = **11**，对拍 `git show HEAD` 与工作树均 `equal=true` |
| 抽件后原档零本地定义 | 两档 `const rowHidden = ` = **0 / 0** ∧ `read-gate.mjs:17` = 1 |
| 四键 | `i18n.mjs:64`–`:67` = **4**；`render-segments.mjs` 裸 `"running"`/`"done"` = **0 / 0**（基线 1 / 1）；`"running…"` 字面 = **0** |
| 行为等价 | 同夹具同 query，抽件前（HEAD 快照）与抽件后命中集**逐字相同**（docs 1 条 ∥ code 2 条；隐藏行 doc 3 / code 2——**闸真在判**） |
| 语法 / 回归 | 五档 `node --check` 全 OK · `bench/check/run.mjs` **118 passed / 0 failed** · `thincoder-core` 测试 5 pass |

**行数漂移（非判据，如实记）**：`read-gate.mjs` 实 **26**（设计 ≈22，多的是档头机制注释）· `code-search.mjs` 159（设计 160）· `i18n.mjs` 132（设计「+4 键」，实为 4 键 + 1 行来源注释）。

**API-CONTRACT 生成区**：已由父侧 `node scripts/api-contract.mjs --write` 重跑（**4432 条**），`createReadGate` 已入生成面（`API-CONTRACT.md:1453`）。

**修正轮落地前置**：内部偏离审计 1 轮（唯一类 = 行数读数漂移，判据面全符合）+ advisor 代码评审 1 轮 `pass` + 自修 0 轮 · 终态 `clean`。

**搁置清单回核**：评审建议未采两条（③b 命中档二次判节 · 索引键大小写不对称）均属**射程外**（改其一即动 `resolveDoc` 返回契约 / ④ 语义）⇒ 改判为**父侧记账**，不在本批。**暂缓批复核：无。**

**文档机检门**：会话内 = `ERROR（引擎已更新）`；新进程真读数 = **0 命中 / 197 档**（`#23` 本轮零写 `docs/**`，判定集为空）。

**用户文档面同拍**：本批无用户可见能力变更。

**待办勾销**：`#1372` / `#1507` 随本批收口核销。

**前批遗留核对**：无。

**结算读数**：本批未决项 = 0（行数漂移属读数记录，不构成待办）。
