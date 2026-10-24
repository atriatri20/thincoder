# 2026-10-16 · 记录面收正轮（清账·收正）
> 六段 append-only，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 编制：主 agent · 2026-10-16 · 来源 = 用户 2026-10-16 00:02 原话「合并台账只是减了数量显示，实际问题一个也没处理啊！就不能马上开工处理吗？！」⇒ 开「记录面收正轮」——把挂账的记录面/读数滞后族、死指针、记录面 stale 项当场收正（或判定不改并写明理由），不再往后挂。。
> 台账 = #1510（core · 归批）。前情 = 无（独立批）。
## §1 讨论（主 agent）
**状态行**：🔄 进行中（…）
<§1 模板占位：本批条目 / 关键判据 / 授权口径>

### 开账（2026-10-16 00:02 · 主 agent）

**触发**：用户 2026-10-16 00:02 原话「合并台账只是减了数量显示，实际问题一个也没处理啊！就不能马上开工处理吗？！」——本轮 = 把挂账的记录面/读数滞后项**当场收正或判定**，不再往后挂。

**范围四组（台账行 → 对象）**：
1. **#1510 族（记录面/读数滞后）**：`webui/SYSTEM.md` 三值 ∥ `mcp/MCP.md:212-213` ∥ `sandbox/SANDBOX.md:648` R72 ∥ `desktop/UI.md:490` ∥ `desktop/PACKAGING.md:337` ∥ `AGENT-LOOP-ASYNC-POOL.md` 受影响表/写点坐标 ∥ `sandbox/EXECUTION.md:7` ∥ `accounts/ACCOUNTS.md` 十六型 7 处 ∥ `client/CLIENT.md:44`（v10 vs v24）+ `:91`。
2. **#1498**：`core/design/LEDGER.md` §13.4 死指针（5 处引用）。
3. **#1514**：`core/design/TOOLS.md` 测试档引用 ~50 处 + 旧值 + `T-F9` 无定义。
4. **#1501**：「随批留存」陈句族（设计档/prompts/服务端/桌面/渲染核）。
**域外（只报不改）**：`PROJECT-MANIFEST.json` 声明串 9 处（主 agent 笔）∥ 需求档面（主 agent 笔）∥ 产品码行注/注释面（另轮）∥ 词面字典件（另轮）。
**规矩**：逐条处置三择一——收正 ∥ 判定不改（理由 + 依据）∥ 写明真实阻塞条件；不许原样留账。

## §2 批次任务与设计（eng-designer）
**状态行**：设计完成（逐条处置 19 项：收正 15 ∥ 判定不改+阻塞 2 ∥ 只报 2；设计档/CN 提示词面已落）
<§2 模板占位：本批条目（覆盖） / 设计档落点 / 机制设计 / 受影响文件与测试覆盖 / 验收对照 / 关键决策 / 上抛项>

### 本批条目（覆盖——台账行 ⇒ 派单四组）

| 台账 | 组 | 覆盖面 |
|---|---|---|
| #1510（含并入 #1504 / #1509 / #1512 / #1515） | ① 记录面/读数滞后族 | 行账差异 ∥ 坐标漂移 ∥ 存量滞读 ∥ MANIFEST 声明串 ∥ ASYNC-POOL 表陈旧 |
| #1498（并入 #1506） | ② 死指针 ×5 | `docs/core/design/LEDGER.md` §13.4 |
| #1514 | ③ TOOLS.md 测试档引用同族 + `:547` 旧值 + `T-F9` 无定义 | 设计档侧 |
| #1501（并入 #1499 / #1507 面） | ④「随批留存」陈句族 + 变体「随批档归档」 | 设计档/prompts 侧 |

写域 = `docs/**`（设计档 + CN 审核面提示词）。不动产品码 ∥ 不动需求档 ∥ 不动 `PROJECT-MANIFEST.json` ∥ 不动批内件。

### 逐条处置表（号 → 处置 → `file:line` ∥ 读数）

**① 记录面/读数滞后族**

| # | 项 | 处置 | 依据 / 读数（实读 2026-10-16） |
|---|---|---|---|
| 1 | `docs/server/design/webui/SYSTEM.md` §3 文件账（`:53–:56` + 面小计 `:58`） | 收正 | `views-system.mjs` 222⇒**237** ∥ `i18n-zh-system.mjs` 204⇒**219** ∥ `i18n-en-system.mjs` 204⇒**219**（`:54` 166 与实读同值，未动）；面小计 796⇒**841**（四行之和） |
| 2 | `docs/server/design/mcp/MCP.md:212-213` | 收正 | 两 i18n-system 行 `≈221`⇒**219**。**坐标收正**：派单/台账写「`webui/MCP.md:212-213`」，`docs/server/design/webui/MCP.md` 实为 72 行 ⇒ 命中处 = `docs/server/design/mcp/MCP.md:212-213` |
| 3 | `docs/server/design/sandbox/SANDBOX.md:648`（R72③ 随正件） | 收正 | 该行原载六组批内件行值与三族 i18n 行值（`205∥205` ∥ `214∥214` ∥ `171∥175` ∥ `167` ∥ `529` ∥ `719∥395∥395`——全为已闭批设计轮预估）。现值 = 沙盒 **282∥282** ∥ admin **176∥180** ∥ system **219∥219**。按 D2（值面单源 = 各面档文件账）+ D10（死件名 / 时点值去除）改写为：门禁链现值 + i18n 键组三族（指向各面档） |
| 4 | `docs/desktop/design/UI.md:490` | 收正 | `renderer/i18n-views.mjs` **437⇒436**（行内 `422⇒437` 同拍改 `422⇒436`） |
| 5 | `docs/desktop/design/PACKAGING.md:337` | 收正 | `scripts/check-dist.mjs` **339⇒422**（机检复红项，已清） |
| 6 | `docs/core/design/AGENT-LOOP-ASYNC-POOL.md:769–:781`（受影响表「现读」列） | 收正 | 表头 `2026-10-12 设计轮实测`⇒`实读 2026-10-16`；逐行：`agent/timers.mjs` 113⇒**164** ∥ `agent-tools/timer.mjs` 46⇒**226** ∥ `tool-docs/timer.md` 6⇒**13** ∥ `cli/src/tui/cmd-timers.mjs` 33⇒**70** ∥ `server/src/agent/chat-env-tools.mjs` 232⇒**328** ∥ 本档 1141⇒**1153** ∥ `TOOLS.md` 1362⇒**1243** ∥ `cli/design/TUI.md` 937⇒**737** |
| 7 | `docs/core/design/AGENT-LOOP-ASYNC-POOL.md:408` | 收正 | 写点坐标：`timer.mjs:42`⇒**`:199`** ∥ `timers.mjs:38-44`⇒**`:93`**（实读 `agent._pendingTimers` 全仓仅两处写：`agent-tools/timer.mjs:199`（在途追加）+ `agent/timers.mjs:93`（出列重排）） |
| 8 | `docs/server/design/sandbox/EXECUTION.md:7` | 收正 | `docker.mjs:163`⇒**`:189-201`**（`:163` 属 `demuxDockerLogs` 内；`parseImageRef` 定义实读 = `:189`） |
| 9 | `docs/server/design/accounts/ACCOUNTS.md` 七处（`:28/:153/:155/:156/:169/:171/:210`） | 收正 | 「十六型」⇒**「十七型」**。依据 = 该档自身 `:81`「型面现状（v24）：十七型（上表十六型 + `mcp_event`）」+ 码面 `accounts/audit.mjs:22` `AUDIT_TYPES` 计数 **17** |
| 10 | `docs/server/design/client/CLIENT.md:44` | 收正 | 「结构版本保持 v10」⇒「本域零迁移——结构版本现读 **v24**」（码面 `store/migrations.mjs:771` `SCHEMA_VERSION` = 24） |
| 11 | `docs/server/design/client/CLIENT.md:91`（R50④） | 收正 | 旧链随正记录（`prepublishOnly` 38⇒39 ∥ 断言件 39⇒40）⇒ 现值：门禁链撤除（`thincoder-server/package.json` `prepublishOnly` = 3×`node --check`，实读 30 行） |
| 12 | 族余项：`PROJECT-MANIFEST.json` 声明串 9 处（#1512）∥ `docs/core/design/MANIFEST.md:327` 坐标 ∥ `TEAM.md:107↔:53` 四/五计数 | 不改（非本席写域 / 另族） | `PROJECT-MANIFEST.json` = 主 agent 笔（派单明令不触）；`MANIFEST.md:327` 坐标与 `TEAM.md` 计数差 = 另族（上抛 4/6） |

**② §13.4 死指针 ×5**

| # | 项 | 处置 | 依据 |
|---|---|---|---|
| 13 | `docs/server/design/ledger/LEDGER.md:6` ∥ `:22` | 收正 ⇒ **§3/§5** | 原节去向已核：`docs/core/design/LEDGER.md` 标题层现为 §1–§9；§13.4（「查询面逐行老化标记 `aged`」）随提交 `2d32dd0d`（2026-10-15 历史清除）删除，其内容现住 **§3（六态 + 迁移表）** 与 **§5（老化行——「查询面逐行标记 `aged`」）**。按 D2 **不补节**（补节将与 §3/§5 双重陈述）⇒ 引用改指 |
| 14 | `thincoder-core/ledger-cmd.mjs:18` ∥ `:31` ∥ `thincoder-core/ledger-db.mjs:61` | 只报（产品码面） | 三处行注仍引「LEDGER.md §13.4」；另 `docs/core/requirements/ENGINEERING-MODE-V2-SPEC-LEDGER.md:81`（AC-M2-24 回指「设计档 §13.4」）= 需求档（主 agent 笔）⇒ 一并只报 |

**③ TOOLS.md 测试档引用同族 + `:547` 旧值 + `T-F9`**

| # | 项 | 处置 | 依据 |
|---|---|---|---|
| 15 | `docs/core/design/TOOLS.md:538` §6.14 落位表「现状」列 | 收正（收「框」） | 该列携带批改动前读数（`git.mjs` 420 ∥ `git-ext.mjs` 173 ∥ `execute.mjs` 243 ∥ `shared.mjs` 467）却被读作现状（D10 时点陈述）；现值实读 **402 ∥ 176 ∥ 238 ∥ 473**。同表带「改动 / 增量」列 ⇒ 逐格刷新会与增量列算术相抵，故表头收正为「现状（本批改动前实读）」 |
| 16 | `TOOLS.md` 测试档引用 ≈40 处（`thincoder-{core,vscode,cli,desktop}/test/*.test.mjs`） | 判定不改（本批）+ 阻塞 B | 分类 = **全部死引用**：`core/test/` = `run.mjs`/`slow.mjs` ∥ `cli/test/` = `run.mjs`/`slow.mjs`/smoke 三档 ∥ `vscode/test/` = `files.mjs`/`run.mjs`/`slow.mjs`/smoke 两档/`integration/files.mjs` ∥ `desktop/test/` = `files.mjs`/`run.mjs`/`rc-resolve.mjs`/`integration/`（空）/`artifacts/*.png` —— **在册 `.test.mjs` 零件**（存量清退）。重表述的目标形取决于 ④ 的寿命口径定案（阻塞 B） |
| 17 | `docs/core/design/MANIFEST.md:745` ∥ `:746`（`T-F9` 无定义） | 收正 | `T-F9` 全域仅此两处、无定义（案例 id 出身 = 已闭批档 = 过程面）⇒ 去坐标保本体：`:745` 删「同 T-F9 法」∥ `:746` 改「既有发现面同判据 ∥ 既有发现面用例零改即回归守卫」 |

**④「随批留存」陈句族**

| # | 项 | 处置 | 依据 |
|---|---|---|---|
| 18 | `docs/core/design/prompts/discipline-engineering.md:97/:98/:100` | 收正 | **CN 审核面与 EN 运行面同机制两口径**：EN `thincoder-core/prompts/discipline-engineering.md:99/:102` = 「**Delete on use** … **Zero retention**」；CN 原文为「单元测试用例随批次档存…**可按需复跑**」。按 D1（CN 面 = 本席笔；语义从运行面一面）收正三条：用后即删（零留存）+ 批档 §5 留一行读数 ∥ 收口测试行①半改「本批验证读数」∥ 「不累积」句改「单元测试件用后即删（零留存）」 |
| 19 | `docs/core/design/TESTING.md` 13 行（`:4/:10/:49/:64/:90/:104/:109/:113/:121/:124/:195/:273/:309/:320`）∥ `docs/server/design/PROJECT.md:158/:233` ∥ `docs/server/design/agent/ADMIN-AGENT.md:348` ∥ `docs/server/design/client/CLIENT.md:46` ∥ `docs/desktop/design/*`（ACTIVITY/CHAT/COMPOSER/E2E-TESTING/MENU/PROJECT/RENDERER/SESSIONS/SETTINGS/SHELL/UI）≈35 处 ∥ `docs/render-core/design/RENDER-CORE.md` 7 处 ∥ `docs/core/design/{PROVIDER.md:489, PROXY.md:146, TEAM.md:152/:155, AGENT-LOOP-UPSTREAM.md:1107}` | 判定不改（本批）+ 阻塞 A | 寿命口径的**机制单源 = `TESTING.md`**（D2）；同一机制句另住需求档 `docs/core/requirements/TESTING.md`（F6/F8/F9 + `:47/:61/:75/:77/:78/:122/:167`——主 agent 笔，派单明令只报）与 `TESTING.md` §2.3 认账块（含「锁族/断代件 14 件」清单——**需实质判定，非改词**）。改设计面而不动需求面 ⇒ 新增设计↔需求相抵 |

### 本批不改 · 真实阻塞条件（触发型）

- **阻塞 A（④#19）**——触发条件 = **三面同轮**：① 需求档 `docs/core/requirements/TESTING.md` §2 F6/F8/F9 + `:47/:61/:122/:167`（主 agent 笔）；② 设计档 `docs/core/design/TESTING.md` 13 行 + §2.3 认账块（14 件锁族清单的处置需裁）；③ 提示词 EN 运行面 `thincoder-core/prompts/discipline-engineering.md:99`（eng-coder 落）。三面不齐 ⇒ 改一面即生新相抵。
- **阻塞 B（③#16）**——触发条件 = **阻塞 A 定案后**：≈40 处测试档引用的目标形态（「载体 = 批档本地单元测试件，用后即删」）由寿命口径决定。
- **阻塞 C（①#12）**——触发条件 = 主 agent 笔：`PROJECT-MANIFEST.json` `checkConfig.lineCounts` 声明串 9 处（#1512，节标题含「迁自 …」/已改名）。

### 验收对照（批条目 → 判据）

| 批条目 | 判据（机检 / 读数） |
|---|---|
| ① 数值/坐标收正 | `checkLineCounts` 直调（`node` 调 `scripts/doc-check-linecounts.mjs`，显式 root = 仓根）：差异 **69 ⇒ 65**（本批域 4 条已清 = `webui/SYSTEM.md:53/:55/:56` ∥ `desktop/PACKAGING.md:337`）；**行式异常 8 ⇒ 8（不增）**；`compared` 160 ⇒ 160 |
| ② 死指针 | `docs/**` 内指向 `docs/core/design/LEDGER.md` 的 `§13.4` 引用 = **0**（原 2 处已改指；余 3 处产品码 + 1 处需求档在册） |
| ③ | `docs/core/design/MANIFEST.md` 全域 `T-F9` = **0**（原 2 处）；`TOOLS.md:538` 表头已标注 |
| ④ | `docs/core/design/prompts/discipline-engineering.md` 全域「随批留存 / 随档留存 / 可按需复跑」= **0**（原 3 处）；CN 面与 EN 面同口径 |
| 回读 | 逐条 locale 回读（edit 工具 back-context 已逐条核；`docs/core/design/prompts/discipline-engineering.md:97/:98/:100` ∥ `MANIFEST.md:745/:746` ∥ `TOOLS.md:538` 在读回上下文内） |

### 关键决策

| # | 决策 | 理由 |
|---|---|---|
| D-RF1 | `SANDBOX.md:648` R72③ 与 `TOOLS.md:538` 现状列 = **收「框/单源」而非逐格刷新值** | 两处或存在值面双重陈述（D2），或刷新后与同行「增量」列算术相抵（批内自相矛盾）——框收正才不会造新的内部不一致 |
| D-RF2 | 设计档 `TESTING.md` 机制面**本批不改词** | 寿命口径是一条跨三面（需求/设计/提示词）的机制句；改一面即生相抵（阻塞 A） |
| D-RF3 | 本批以**派单正文四组清单**为准执行并逐条处置 | 派单自述「§1 清单逐条在册」，实读 §1 = 模板占位行（上抛 1） |

### 上抛项

1. **[上抛·待裁]** 本批档 §1 现为模板占位（`<§1 模板占位：本批条目 / 关键判据 / 授权口径>`）——派单称「§1 清单逐条在册」，实读为占位（主 agent 笔）。本批按派单正文四组清单执行。
2. **[上抛·待裁]** 测试件寿命口径三面不一（阻塞 A）——本席朝向 = **运行面「用后即删（零留存）」为准**（旁证：实盘 `docs/batches/*.test.mjs` 仅存 6 件 = 未收口批；`agent/MEMBER-AGENT.md:370` ∥ `ops/OPS.md:118` 同口径；EN 提示词 `:99/:102` 明文）；需求档 `requirements/TESTING.md` 与设计档 `TESTING.md` 站「留存归档（不销毁）」侧，需主 agent 裁定。
3. **[上抛·知会]** 派单坐标 `webui/MCP.md:212-213` 实为 `docs/server/design/mcp/MCP.md:212-213`。
4. **[上抛·知会]** `PROJECT-MANIFEST.json` 声明串 9 处未命中（`desktop/design/` 8 档 + `webui/SANDBOX.md`）= 主 agent 笔，本批零触。
5. **[上抛·知会]** 产品码/需求档侧 §13.4 死指针 4 处（`ledger-cmd.mjs:18/:31` ∥ `ledger-db.mjs:61` ∥ `requirements/ENGINEERING-MODE-V2-SPEC-LEDGER.md:81`）= 另轮。
6. **[上抛·知会]** 派单「`TOOLS.md:547` 旧值」实读落 `:544`（`git.mjs` 420）——该档行号随清账已漂；`:549`/`:550` 亦载已退场件。
7. **[上抛·知会]** 族余项未动：`docs/core/design/MANIFEST.md:327` 坐标（`doc-check.mjs` `detectRoot` = `:26-44` ∥ 拒面 = `:75-81`）∥ `TEAM.md:107`（四消费面）vs `:53`（五消费面）计数不符 = 另一族（#1510 成员补）。

### 本席自查纠正（回读复核所出）

- **纠 1**：上文④#18 验收行「`docs/core/design/prompts/discipline-engineering.md` 全域『随批留存 / 随档留存 / 可按需复跑』= 0（原 3 处）」——**原值应为 2 处**（`:97`「可按需复跑」∥ `:98`「随档留存」）；第三处改动 = `:100` 的「单元测试档恒随批次档存」句（词面不在三短语内）。收正后全域三短语命中 = **0**（本席复扫实测）。
- **纠 2**：上文①#3 括注「六组批内件行值与三族 i18n 行值」——原行实含 **3 组 i18n 行值**（沙盒/admin/system）+ **4 组批内件名值**（门禁链 `59` ∥ 档目件 `167` ∥ `runner-admin-console-ui` `529` ∥ `admin-agent-chat*` `719 ∥ 395 ∥ 395`）；改写后该四组随「用后即删」退场。

## §3 设计评审（评审子代理）
## §4 用户批准（主 agent）
## §5 实施记录（eng-coder）
## §6 验证与收口（父代理）
