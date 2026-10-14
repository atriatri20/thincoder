# 2026-10-13 · 台账状态行写后即时刷新
> 六段 append-only，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 编制：主 agent · 2026-10-13 · 来源 = 用户 2026-10-13 12:09 原话「写了以后就要立即更新，你他妈这种设计逻辑真他妈的病态」（对状态行台账计数 120s 轮询的当场判决）。
> 台账 = #1350（core · 归批）。前情 = 无（独立批）。
## §1 讨论（主 agent）
**状态行**：已收口 2026-10-13
<§1 模板占位：本批条目 / 关键判据 / 授权口径>

**笔 1（轻通道 · 缺陷修复类）** — 披露：「轻通道（缺陷修复）| 改动 = 台账库目录 `fs.watch` ⇒ 写后去抖即时重扫 | 射程 = `ledger-surface.mjs` 单档（+ 批内单测件一件） | 回滚 = revert 本笔」

**改动（file:line）**：`thincoder-core/ledger-surface.mjs`——① `:10-12` 导入 `node:fs watch` + `ledger-db.mjs ledgerDirPath`；② `:31-77` `startLedgerSurface` 挂 `watch(ledgerDirPath(), { persistent: false })`：`.db`/`-wal`/`-shm`/`-journal` 变更 ⇒ 去抖 400ms ⇒ **forced tick**（`state.processing` 跳过只在**定时轮**生效——库变更轮放行，本症现场 = 回合中写台账）；目录未建（首写才建）⇒ 每轮补挂；`dispose` 关 watcher。**行为差**：写前台账状态行最多滞后 120s（跨进程更久）⇒ 写后 ≤~0.5s 即重扫（同进程 ∥ 跨进程皆覆盖——两实例互见）；`REFRESH_MS`（120s）降为兜底。

**变更源**：用户 2026-10-13 12:09 原话「写了以后就要立即更新，你他妈这种设计逻辑真他妈的病态」。

**机检**：新件 `docs/batches/2026-10-13-ledger-live-refresh.test.mjs` **2/2 绿**（C1 写库 ⇒ 重扫 + `scannedAt` 推进 ∥ C2 非 `.db` 文件忽略 ∥ C3 `processing` 中写仍放行 ∥ C4 `dispose` 后停）；既有件回归 **2 件 17 例全绿**（`2026-10-10-ledger-family-anchor-local` 9 ∥ `2026-10-03-ledger-family-aggregate` 8）。`node --check` OK。

**收尾链待办（形式化时落）**：`docs/core/design/LEDGER.md:368` 挂载判据行现文含「周期 `unref()` / 回合处理期间跳过本轮」——需收正为「周期（兜底）+ 库变更去抖即扫（变更轮不受 processing 挡）」。**注**：运行中实例（桌面 app ∥ 对端 CLI）载旧码——重启后生效。

**笔 2（评审 #5 修复轮——父侧直笔 · 可 revert）**：裁后修复四条（发现 #1/#2/#4/#5/#6 全收；#3 转红族登记见清账批）。**㈠ 发现 #1（变更轮在途被丢）**：`ledger-surface.mjs` `tick` 现文——在途时变更轮 `pendingForce = true` 记待办，扫描落定后 `void tick(true)` 补跑（不丢）。**㈡ 发现 #2（目录未建窗口）**：`armWatcher` catch 分支 2s 短重试补挂（`armTimer`；`dispose` 同清）。**㈢ 发现 #4（提示覆盖）**：桌面首启向导团队表单补提示节点（`renderer/views/onboarding.mjs:138-142`——`data-team-server-hint` 同形）；VSC 首启板本已有端口占位符（`webview/index.html:95` `placeholder="http://host:port"`）⇒ 无需补。**㈣ 发现 #5（键数链）**：`i18n-settings.mjs:5` 77 ⇒ **78** + 链补「#1247 端口提示批」句 ∥ `i18n.mjs:154` 77 ⇒ **78**。**㈤ 发现 #6（措辞齐）**：VSC 两语对齐桌面用形（`en.json:301` ∥ `zh.json:301`）。**机检**：批内件 **3/3 绿**（C1/C2/C3/C4 + 新增 **C5** 目录后建短重试——直测发现 #2 修复）；`node --check` OK；两 JSON parse OK（317 键 ∥ 317 键）。**本轮不做**：不改旧批内件（零维护裁定）；VSC 状态栏 item 面（`src/extension/ledger-surface.mjs`）不加写触发（射程外，另见评审越界注记）。

## §2 批次任务与设计（eng-designer）
**状态行**：（eng-designer 写入时更新）
<§2 模板占位：本批条目（覆盖） / 设计档落点 / 机制设计 / 受影响文件与测试覆盖 / 验收对照 / 关键决策 / 上抛项>
## §3 设计评审（评审子代理）
## §4 用户批准（主 agent）
## §5 实施记录（eng-coder）
## §6 验证与收口（父代理）

**状态行收口**：本批收口 2026-10-13（轻通道轮——笔 1 缺陷修复 + 评审 #5 修复轮 · 笔 2）。

**角色链**：讨论 = 主 agent（用户 12:09 判决「写了以后就要立即更新」）∥ 实施 = 主 agent 直笔（轻通道产品码笔）∥ 设计形式化 = 主 agent 小改（`docs/core/design/LEDGER.md:368` 挂载判据行收正）∥ 独立评审 = advisor 代码评审（id 5 · VERDICT **pass** · 6 发现全处置；码修 3 条 = #1/#2/#4 ∥ 收正 2 条 = #5/#6 ∥ 登记 1 条 = #3 转清账批）∥ 批准 = **父侧代签**（依据 = 用户 2026-10-13 12:15「马上收口，别挂着」+ 12:16「自动跑，别等我」全链授权）。

**机检读数**：批内件 `docs/batches/2026-10-13-ledger-live-refresh.test.mjs` **3/3 绿**（C1 写 ⇒ 重扫 ∥ C2 非 `.db` 忽略 ∥ C3 `processing` 中仍刷 ∥ C4 `dispose` 停 ∥ C5 目录后建短重试——直测发现 #2 修复）；`node --check` OK；两 JSON parse OK（317 ∥ 317 键）。**既有回归**：`2026-10-10-ledger-family-anchor-local`（9/9）∥ `2026-10-03-ledger-family-aggregate`（8/8）改动前后同绿。

**收口清单（D7）**：角色表 ✓ ∥ 状态行 ✓ ∥ 计数与列表同拍（发现 6 = 3 + 2 + 1）✓ ∥ 指针解析：`LEDGER.md:368` 现文与码面一致 ✓ ∥ changelog 面 = 无 ∥ 台账 = #1350（在途 ⇒ 待核销 ⇒ 已核销——随本收口）∥ 「暂缓批复核」= 本批无。

**笔 2 更正**：其括注「修复四条」应为「处置五条」（#1/#2/#4 码修 + #5/#6 收正；#3 另行登记）——计数以本条为准（D3）。

**已知限**：运行中实例（桌面 app ∥ 对端 CLI pid 7824）载旧码——**重启后生效**。
