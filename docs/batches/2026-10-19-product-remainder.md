# 2026-10-19 · 产品代码面余项（L 批文档面之外的六条 + #1511 core 余量）
> 六段 append-only，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 编制：主 agent · 2026-10-19 · 来源 = 用户 2026-10-19 11:10「都起。赶紧干完。」+ 2026-10-19 台账核销轮挖出的产品代码面余项。
> 台账 = #1511（core · 归批）。前情 = 无（独立批）。
## §1 讨论（主 agent）
**状态行**：已收口 2026-10-19
<§1 模板占位：本批条目 / 关键判据 / 授权口径>

### 讨论来源与父侧裁定（2026-10-19）

**来源**：用户 2026-10-19 11:10「都起。赶紧干完。」——批 L 只做文档面，本批接它的产品代码面六条 + `#1511` 的 core 余量。

**本批的病灶（为什么单独立批）**：批 L 把「该改什么」写进了文档，但**一行代码都没改**。于是台账上的六行与文档描述之间隔着一条真实的缝：文档说三态语义、代码还是单态；文档说登出成拍推、代码只推状态。本批要把这条缝补上。

**父侧对四条上抛的裁定**（2026-10-19，裁决人 = 主 agent；依据 = 用户整批令「都起。赶紧干完。」下的批次内处置权）：

1. **`#1511` 第 7 处「保留」**——`_archive/ENGINEERING-MODE-MECHANISM.md:355` 是 F14 标记族的**定义句**。定义句里出现被定义的名字不是污染，删掉它反而使 F14 无从解释。**AC 相应改写**：编码面 / 引用面 `（拟新增` 命中 = 0，**定义句除外**（该行在册为豁免，附一句理由）。
2. **`#1566` 中间态 513 行「接受」**——500 是咨询线，800 才是硬线。本批只交缝 1，缝 2 立台账另批。**中间态不得越 800。**
3. **`#1533`「不可达则不交付」**——执行体 `.6` 不可达时，本项不交付、台账行保持未决切态；**不许降级为盘上模拟**（模拟出的绿不算绿）。执行载体在实施轮前确认。
4. **`#1529` 偏离批 L 的拆缝「接受」**——改抽三纯件（placement / labels / state），放弃抽 `providerRow`（113 行 DOM 件）：抽它的风险高于收益，且三纯件已覆盖判据面。

**一处记录更正**（设计席本轮实测）：`#1528` 的 `settings.mjs` 实为 **427** 行；494 属 `model-menu.mjs`（`#1529` 的档）。父侧派单曾把 494 记在 `#1528` 名下 —— **以设计席实测为准**。

**裁定 2 更正（2026-10-19 11:17，主 agent 自我推翻）**：原裁定「`#1566` 中间态 513 行接受，500 是咨询线」——**前提读数是错的**。首轮评审实测：`:51`–`:192` 切在 `listFilesOf` 中间（该函数 `core-run.mjs:188` 起、`:216` 才收尾），实可搬区间 = `:51`–`:216` = **166 行** ⇒ 交付后 **655 − 166 ≈ 489，压根没越 500**。⇒ **裁定改为：交付读数以实测为准（≈489），不构成越线问题；缝 2 仍另批，但本批不含任何「越线容忍」**。记录此更正的理由：**按一个错数做的裁定，即使结论听起来合理，也已经把错数变成了许可**。

## §2 批次任务与设计（eng-designer）
**状态行**：设计完成（2.8 修正轮 2：二轮评审 3 条按号落定（#1518 非空 prefs 夹具 / #1566 导出面定稿 14 导出 + 2 私有 / 跑器免登记 + A1 新档 175），2.1–2.7 相抵处以 2.8 为准）
<§2 模板占位：本批条目（覆盖） / 设计档落点 / 机制设计 / 受影响文件与测试覆盖 / 验收对照 / 关键决策 / 上抛项>

### 2.1 判定总表（七条 · 实读证据 · 行数口径 = `split("\n").length`，含末尾空段，与批 L 同口径）

| 号 | 面 | 判定 | 实读证据（2026-10-19 本轮） |
|---|---|---|---|
| `#1511` | 文档 | **6 处 / 3 档可直落；第 7 处前提失效 → 上抛①** | 全 `docs/**` 对 `（拟新增` 的命中只剩 core：`docs/core/design/MODEL-SPECS.md:1103` ∥ `:1402` ∥ `:1719` ∥ `:1832`（4）· `docs/core/design/PROVIDER.md:622`（1）· `docs/core/design/TEAM.md:181`（1）· `docs/core/requirements/_archive/ENGINEERING-MODE-MECHANISM.md:355`（1，该行 = F14 标记族的**定义句本身**）。非 core = **0 命中** ⇒ 批 L 的「非 core 49 处已清」成立 |
| `#1518` | 产品码 | **设计已有 · 可直落**（V1/V2/V3/D1 + C1 零动作） | V1 `panel-messages-settings.mjs:277`–`:285`：成功径 `:281` 只 `_pushStatus()`，**无** `_pushSettings()`；登录径 `:268` 有。V2 `team-surface.mjs:144`–`:154`：成功径 `:149` 只 `afterChange()`，**无** `_pushSettings`；登录径 `:135` 有。V3 `settings.mjs:397` 早退早于 `flush()`（`:402`–`:420`，`_lastModelsPayload` 写在 `:405`、`models` 推送在 `:418`；`_lastPushedPrefs` 声明 `:376`；复推点 `panel-session.mjs:164` 读 `lastModelsPayload()`）。D1 `mount-team.mjs:154`–`:165`：`:163` `loadTeam()` / `:164` `loadProviders()`，**无** `onProvidersChanged?.()`；登录径 `:149` 有。C1 `cmd-team.mjs:202` 已有 `await syncProvidersFromDisk(agent)`（定义 `:235`）⇒ 零动作 |
| `#1519` | 产品码 | **设计已有 · 判据改形**（无 DOM 测试环境，静态断言会验空气） | `views-sandbox.mjs:316`–`:317` 工作区清单失败径 = `() => []`（读败与「无承载」同值）；`:305` `applyGate()`；`:318`–`:341` 只按容器侧分支渲，工作区侧无第三态 |
| `#1528` | 产品码 | **设计已有 · 可直落**（两行整删） | `settings.mjs:172`–`:173` 注释 + `defaultModel: loadRaw().defaultModel ?? null` 现读仍在；webview 零消费（批 L 已核，本轮未复扫，不影响删） |
| `#1529` | 产品码 | **设计已有（`RENDER-CORE.md:228`–`:230` 三态语义在位）· 拆缝前提失效 → 改缝** | `model-menu.mjs:93`–`:97` 单支 `!models \|\| models.length === 0` ⇒ 一律「加载模型…」；`place()` `:123`–`:130`；空表隐钮 `:466`–`:471`。**批 L 的拆缝漏算 `providerRow`**：`:153`–`:265` = 113 行（含 `PROVIDER_SHORT` `:48` ∥ `shortName` `:55` 两个纯件） |
| `#1566` | 产品码 | **前提失效（缝 1 = 8 件，非 9）· 设计可直落** | `core-run.mjs` 655 行：区间 `:51`–`:192` 内 = 常量/类 `MAX_TOOL_OUTPUT:51` `BOX_PROVIDER:54` `ShellError:58` `FLAG_KEYS:67` `FLAG_SETTERS:70` `FILE_LIST_LIMIT:78` `FILE_SCAN_LIMIT:79` `IGNORED_DIRS:82` + **纯函数 8 件** `slotOf:85` `withBoxProvider:93` `isToolFailureText:111` `textOf:119` `flagsOf:128` `projectMessages:140` `excerptOf:175` `listFilesOf:188`；`createCoreRun:228`；`reasonTextOf:610` 在区间外 |
| `#1533` | 真机 | **设计已有 · 代码零改动** | AC-5 原文已读 `docs/batches/2026-10-16-box-quota-recovery.md:100`：`.6` 上一工作区造陈旧挂载 ⇒ 走 ② 得恢复 + `quota_recovered` 行；销毁后零残留。字段名 = `recovery` ∥ `quota_recovered` ∥ `findmnt`/`losetup` 零残留 |

**行数读数（本轮实测 · 纠正一处误归属）**：`model-menu.mjs` 494 · `settings.mjs` 427 · `panel-messages-settings.mjs` 299 · `team-surface.mjs` 191 · `mount-team.mjs` 355 · `mount-settings.mjs` 308 · `cmd-team.mjs` 268 · `views-sandbox.mjs` 343 · `core-run.mjs` 655 · `server/package.json` 32 · `RENDER-CORE.md` 510。
派单例举「`#1528` 的 494 行是旧读数」= **归属误记**：494 是 `model-menu.mjs`（`#1529` 的档），且**不是旧读数**（本轮 493+1=494）；`#1528` 的档 `settings.mjs` = 427（与本批 L 同值）。行数无漂移。

### 2.2 逐条设计

**① `#1511` · core 余量——6 处删标记、内容全保；第 7 处上抛**

- 落点（逐档逐行，只删 `（拟新增…）` 从句，标记句承载的路径 ∥ 行数预算 ∥ 机制句全留）：
  - `docs/core/design/MODEL-SPECS.md:1103`（`thincoder-core/model-specs-table.mjs`（拟新增——主档 re-export 保 import 面零改）⇒ 删括注、保路径与「主档 re-export」句；该 `.mjs` 现**不在盘**，见判据注）
  - `docs/core/design/MODEL-SPECS.md:1402`（`src/extension/settings-snapshots.mjs`（拟新增）⇒ 删括注，保路径）
  - `docs/core/design/MODEL-SPECS.md:1719` ∥ `:1832`（「落点 = 单元测试档（拟新增）」⇒ 删括注，留「单元测试档」）
  - `docs/core/design/PROVIDER.md:622`（`image-heal.mjs`（拟新增——新档：…）⇒ 删「拟新增——」前缀词，保「新档」与机制枚举；该 `.mjs` **在盘**）
  - `docs/core/design/TEAM.md:181`（「本批（轮换）单元测试档（拟新增）」⇒ 删括注）
- **不判档缺的前提（本轮实读）**：`thincoder-core/doc-check/anchors.mjs:23` 的 `ANCHOR_RE` 只匹配 `*.md` 记号 ⇒ 上述 `.mjs` 前向引用删标记后**不产生新锚**，gate 不会因此转红；新引擎对 `拟新增` / `NEW_MARKER` **0 命中**（本轮扫 `thincoder-core/doc-check/*.mjs`）。
- 判据见 2.4 行 1。
- **上抛①**：`_archive/ENGINEERING-MODE-MECHANISM.md:355` 是 F14 豁免族的**规则定义句**——删标记 = 改判据语义（需求档 = 主 agent 笔），本席不自改。

**② `#1518` · 登出成拍补推送 + V3 同拍清簿记**

- V1 `thincoder-vscode/src/extension/panel-messages-settings.mjs:281` 后插一行 `panel._pushSettings()`（登录径 `:268` 同形）。
- V2 `thincoder-vscode/src/extension/team-surface.mjs:149`（`afterChange()` 之后）插 `_chatPanel?._pushSettings?.()`（登录径 `:135` 同形）。
- V3 `thincoder-vscode/src/extension/settings.mjs:397` 早退前插三行：`postMessage({ type: "models", models: [], prefs: loadModelPrefs(workspaceState) })` + `_lastModelsPayload = []` + `_lastPushedPrefs = null`，并附一句理由注（空表 = 已到且空；簿记同拍清，否开/切会话按 `panel-session.mjs:164` 复推旧候选）。
- D1 `thincoder-desktop/renderer/mount-team.mjs:164` 后插 `onProvidersChanged?.()`；同行注释 `:13` 的「登出 ∥ 轮换两径零改」收正为「登出径同随动」；`mount-settings.mjs:82` 的枚举句补登出径（`provider 写成功 ∥ 登录成` ⇒ `… ∥ 登出成`）。
- C1 零动作（`:202` 已对称）。
- 判据见 2.4 行 2。

**③ `#1519` · 承载清单读败径（第三态）**

- 现状：`workspacesCall` 失败 ⇒ `[]`；`applyGate()` 只看 `boundCount > 0 && !boundConfirmed` ⇒ 读败时删除钮可点、勾选门不渲。
- 目标形：① `workspacesCall` 改返 `{ ok, listed }`（与容器侧 `:314`–`:315` 同形）；② **判门逻辑外提为纯件** `public/sandbox-remove-gate.mjs`：`removeRunnerGate({ containerReachable, listedCount, workspacesOk, boundCount, boundConfirmed }) → { confirmDisabled, hintKey, retry }`（四态：不可达 ∥ 无承载 ∥ 有承载未勾 ∥ **读败**）；③ 读败 ⇒ `hintKey = admin.sandbox.workspacesUnreachable`（新 i18n 键，server 两档各 +1）+ `confirmDisabled = true` + `retry = true`；④ 渲染侧按返回值渲就地句 + 重试钮（重跑两取数）。
- 外提理由（判据可行性）：`views-sandbox.mjs` 是浏览器模块，仓内**无 happy-dom / jsdom**（本轮实核 `node_modules` 三处皆 false）⇒ 不抽纯件就只能靠 grep 验空气。
- 判据见 2.4 行 3。

**④ `#1528` · VSC 快照死键**

- `settings.mjs:172`–`:173` 两行整删（注释 + 键），行为零变（零消费者）。
- 判据见 2.4 行 4。

**⑤ `#1529` · 三态 + 锚零矩形兜位（拆缝改设计）**

- 目标形（与 `RENDER-CORE.md:228`–`:230` 逐条对齐）：`models == null` ⇒ 现「加载模型…」；`models` 为**空数组** ⇒ 渲 `model.empty`（「无可用模型」），不渲分组；锚零矩形 ⇒ 面板**视口居中**。
- **拆缝（换批 L 的 `place()`+分组渲染方案）**：
  - 新档 `thincoder-render-core/composer/model-menu-place.mjs`：`computePlacement({ anchorRect, viewport, panelHeight, up }) → { left, top }`（纯件，零 DOM 读写）；`openModelMenu` 内 `place()` 退化为「取矩形 → 调纯件 → 写样式」三行。
  - 新档 `thincoder-render-core/composer/model-menu-labels.mjs`：`PROVIDER_SHORT`（`:48`）+ `shortName`（`:55`）。
  - 新档 `thincoder-render-core/composer/model-menu-state.mjs`：`menuStateOf(models) → "loading" \| "empty" \| "list"`（纯件，供渲染支与单测共用）。
  - 为何不抽 `providerRow`（批 L 的「分组渲染支」）：它是 113 行带 DOM 构造与 flyout 事件的件，抽它 = 一次结构搬迁，超出本项射程；抽三件纯件已使 `model-menu.mjs` ≤ 500 且各件可直测。
- 净行：494 −（place 体 ≈8 + labels ≈17 + 状态判 ≈5）+ 三行接线 + 三态渲染 ≈10 ⇒ **≈ 477**；三新档 ≈ 12 / 18 / 8。
- 判据见 2.4 行 5。

**⑥ `#1566` · `core-run.mjs` 缝 1（8 件纯函数外提）**

- 移出块 = `:51`–`:192`（142 行：八常/类 + 八件纯函数）⇒ 新档 `thincoder-server/deploy/sandbox/member-shell/core-run-util.mjs`；`core-run.mjs` 保留**同名 re-export**（`export { … } from "./core-run-util.mjs"`），import 面零改。
- 减量读数：655 − 142 = **513**，**仍越 500 咨询线**（硬限 800 未越）——本批只交缝 1，缝 2（`createCoreRun` `:228`–`:607` 三族拆分）不在本批；交付表按此如实标注。
- 壳树后果：`deploy/sandbox/member-shell/**` 是壳件内容寻址版本的覆盖集 ⇒ 增档即换壳版本，实施轮须 `deploy/pack-box-shell.mjs` 重打包并留 3 件回退窗；档账随正 = `docs/server/design/agent/MEMBER-AGENT.md` §5（新增 `core-run-util.mjs` 与 `core-run.mjs` 新读数）。
- 判据见 2.4 行 6。

**⑦ `#1533` · 配额自愈 AC-5 真机复证（代码零改动）**

- 设计 = 一条可照做的命令序列 + 三条断言（字段名取自 AC-5 原文 `:100`，本轮已核与批 L 步骤一致）：
  1. 取样本盒 → `findmnt -no TARGET,SOURCE,FSTYPE,OPTIONS -T <工作区目录>`（基线；期望 `SOURCE=/dev/loopN`）。
  2. 造陈旧：重写该 loop 的 backing 镜像（或换挂别的 old 镜像）→ **复读一次 `findmnt` 留存**。
  3. 走建盒/启动 ⇒ 断言 A `recovery ∈ {rebuild, reconnect}`。
  4. 断言 B（计数式）：`select count(*) from audit_event where kind='quota_recovered' and id > <基线max(id)>` == **1**。
  5. 销毁：`umount <目录>` → `losetup -d <loopN>`（按 back-file 归属定位）→ `rm -rf <目录> <目录>.loop.img`。
  6. 断言 C：`findmnt -T <目录>` 无该挂载 ∧ `losetup -a -O NAME,BACK-FILE -n` 无本工作区镜像行 ∧ 目录与 `.loop.img` 皆不存在。
- 前置：`.6` ssh 可达 + 读挂载侧需 root/`disk` 组（`EXECUTION.md` §4 已裁为部署前提）。若 `.6` 不可达 ⇒ 本项**不交付**并如实上报，不降级为「盘上模拟」。
- 判据见 2.4 行 7。

### 2.3 受影响文件表（现行行数 = 本轮实测 · Δ 为设计预期）

| 条 | 文件 | 现行 | Δ | 面 |
|---|---|---|---|---|
| `#1511` | `docs/core/design/MODEL-SPECS.md` | — | 4 处删括注（±0 行） | 文档 |
| `#1511` | `docs/core/design/PROVIDER.md` | — | 1 处（±0） | 文档 |
| `#1511` | `docs/core/design/TEAM.md` | — | 1 处（±0） | 文档 |
| `#1511` | `docs/core/requirements/_archive/ENGINEERING-MODE-MECHANISM.md` | — | **0（上抛①）** | 文档 |
| `#1518` V1 | `thincoder-vscode/src/extension/panel-messages-settings.mjs` | 299 | +1 | 产品码 |
| `#1518` V2 | `thincoder-vscode/src/extension/team-surface.mjs` | 191 | +1 | 产品码 |
| `#1518` V3 | `thincoder-vscode/src/extension/settings.mjs` | 427 | +6（3 行代码 + 1 句注 + 空行） | 产品码 |
| `#1518` D1 | `thincoder-desktop/renderer/mount-team.mjs` | 355 | +1（并 `:13` 注 1 行改） | 产品码 |
| `#1518` 注 | `thincoder-desktop/renderer/mount-settings.mjs` | 308 | ±0（`:82` 枚举句改写） | 产品码 |
| `#1518` C1 | `thincoder-cli/src/tui/cmd-team.mjs` | 268 | 0 | 产品码 |
| `#1528` | `thincoder-vscode/src/extension/settings.mjs` | 427 | −2 | 产品码 |
| `#1519` | `thincoder-server/public/views-sandbox.mjs` | 343 | +10 / −6 ⇒ ≈347（判门外提后） | 产品码 |
| `#1519` | 新档 `thincoder-server/public/sandbox-remove-gate.mjs` | 0 | ≈30 | 产品码 |
| `#1519` i18n | `thincoder-server/public/i18n-zh-core.mjs` ∥ `i18n-en-core.mjs` | 145 / 142 | +1 / +1 | 产品码 |
| `#1529` | `thincoder-render-core/composer/model-menu.mjs` | 494 | −30 / +12 ⇒ ≈477 | 产品码 |
| `#1529` | 新档 `model-menu-place.mjs` ∥ `model-menu-labels.mjs` ∥ `model-menu-state.mjs` | 0 | ≈12 / 18 / 8 | 产品码 |
| `#1529` i18n | `thincoder-server/public/i18n-zh-core.mjs`（`model.empty`）∥ `i18n-en-core.mjs` ∥ `thincoder-desktop/renderer/i18n-composer.mjs`（en/zh 两处）∥ `thincoder-vscode/locales/en.json` ∥ `zh.json` | 145 / 142 / 152 / 351 / 351 | +1 / +1 / +2 / +1 / +1 | 产品码 |
| `#1529` 设计档 | `docs/render-core/design/RENDER-CORE.md` 510 | 三态语义已在 `:228`–`:230` ⇒ 本批 0（只核不改） | 文档 |
| `#1566` | `thincoder-server/deploy/sandbox/member-shell/core-run.mjs` | 655 | −142 ⇒ **513（仍越 500）** | 产品码 |
| `#1566` | 新档 `…/member-shell/core-run-util.mjs` | 0 | ≈145 | 产品码 |
| `#1566` | `docs/server/design/agent/MEMBER-AGENT.md` | 439 | +2（档账两行） | 文档 |
| `#1566` | `thincoder-server/public/box-shell/**` | — | 重打包（内容寻址版本变更） | 构建产物 |
| `#1533` | 无 | — | 0 | 真机 |

**注**：`#1519` 与 `#1529` 的 i18n 新增键同时落在 `i18n-zh-core.mjs` / `i18n-en-core.mjs` ⇒ 顺序上先落 `#1529` 的键表再落 `#1519` 的键（同一文件，串行）。

### 2.4 判据（每条一条可复跑）

| 条 | 判据（可复跑） |
|---|---|
| `#1511` | `node -e "扫描 docs/**/*.md（排除 docs/batches/**）对字面 （拟新增 的命中"` ⇒ **0 命中**；若上抛①裁定保留 `_archive` 一处，则该单点命中在报告点名、其余 0 |
| `#1518` | VSC 批内定向单测（沿用既有 extension 测试的 panel 假件）：走 `handleTeamLogout` 成径 ⇒ 收到 `models` 消息 ≥1 且 `_pushSettings` 被调 1 次；走 `logoutFlow` 成径 ⇒ `_pushSettings` 调 1 次；`fullStatus` 在 `providerState.state === "invalid"` 夹具下 ⇒ 收到 `models` 空表 1 次 ∧ `lastModelsPayload() === []` ∧ `lastPushedPrefs() === null`。桌面：`mount-team` 的 `logout` 成径 ⇒ `onProvidersChanged` 被调 1 次（注入替身计数） |
| `#1519` | 新纯件 `removeRunnerGate` 单测 4 例：① 容器可达 + 无承载 ⇒ `confirmDisabled:false`；② 有承载未勾 ⇒ `true`；③ 已勾 ⇒ `false`；④ **工作区读败** ⇒ `confirmDisabled:true` ∧ `hintKey` = 读败键 ∧ `retry:true`。旧行为三例逐字不变（对照断言） |
| `#1528` | `grep -c defaultModel thincoder-vscode/src/extension/settings.mjs` ⇒ **0**；`node --check` exit 0 |
| `#1529` | `menuStateOf` 三例：`null` ⇒ `"loading"` ∥ `[]` ⇒ `"empty"` ∥ `[{...}]` ⇒ `"list"`；`computePlacement` 三例：零矩形 + 视口 1200×800 ⇒ `left`/`top` 使面板中心落视口中心（`\|cx−600\| ≤ 2 ∧ \|cy−400\| ≤ 2`）· 正常锚 ⇒ 与现 `Math.max(4, …)` 公式逐值相等（回归）· `up:true` ⇒ 翻上；`node --check` ×4 |
| `#1566` | ① 新档导出名集合 ⊇ `{MAX_TOOL_OUTPUT, BOX_PROVIDER, ShellError, FLAG_KEYS, FILE_LIST_LIMIT, FILE_SCAN_LIMIT, slotOf, withBoxProvider, isToolFailureText, projectMessages, listFilesOf}`；② `core-run.mjs` 内上述函数**零本地定义**（grep `function slotOf` 等 8 名 = 0）且 re-export 行在；③ 两档 `node --check` exit 0；④ `node -e "import('…/core-run.mjs')"` 成功且导出名集合与改前**逐名相等**；⑤ `core-run.mjs` 行数 = 改前读数 − 移出块行数 ± 2 且 < 600；⑥ `public/box-shell/` 内容哈希与改前不同（重打包生效） |
| `#1533` | `.6` 上跑 2.2⑦ 六步：断言 A `recovery` 值 · 断言 B 计数式 == 1 · 断言 C 三项零残留。判据不容「盘上模拟」替代 |

### 2.5 先例行 ∥ 勘察证据行

**先例行**：`#1518` 先例 = 登录成拍径（`panel-messages-settings.mjs:268` ∥ `team-surface.mjs:135` ∥ `mount-team.mjs:149`），对齐 = 登出径照抄同拍一行，偏离 = 无。`#1519` 先例 = 同档容器侧两态（`views-sandbox.mjs:314`–`:315`），对齐 = 同构补第三态；偏离 = 判门外提为纯件（理由 = 仓内无 DOM 测试环境，静态断言验空气）。`#1529` 先例 = 键族 `model.loading`（三端五档）+ 体量拆分先例（`cmd-config.mjs` 543→304 四子菜单外提）；对齐 = 纯件外提 + 键同址同形；偏离 = 拆件选点改为三纯件（批 L 的 `providerRow` 抽法漏算 113 行）。`#1566` 先例 = `quota.mjs` ∥ `box.mjs` 按职责拆；偏离 = 新档落壳源树内 ⇒ 触发内容寻址版本变更 + 工件重发。`#1528` 先例 = 死键清理（批 L 判类机械），偏离 = 无。`#1533` 先例 = `EXECUTION.md` 读件形，偏离 = 无。

**勘察证据行**：本轮实读 = 七条落点文件逐处（`file:line` 见 2.1/2.2）· `thincoder-core/doc-check/anchors.mjs:23`（`ANCHOR_RE` 只判 `.md`）· `thincoder-core/doc-check/*.mjs` 对 `拟新增`/`NEW_MARKER` **0 命中** · 五档 i18n 现键（`model.empty` 全 0，`model.loading` 各 1/1/2/1/1）· `docs/README.md` 档目 · `RENDER-CORE.md:226`–`:230` 输入面板族 §5 条 6。公开源：本轮未查外部源（本批七条全为仓内实现/文档面，无外部规格依赖）。

### 2.6 上抛项

1. **`#1511` 第 7 处 = 语义面**（`docs/core/requirements/_archive/ENGINEERING-MODE-MECHANISM.md:355`）：该行是 F14「前向引用 `（拟新增` 豁免族」的**规则定义**。删标记 = 改判据语义；整个 F14 族的唯一载体（旧机检引擎的豁免）已退场，新引擎对该标记 0 命中。**本席倾向**：整段 F14 删除（对象已不存在，留着会被检索当现行规则）；备选 = 保留原样（归档史）。需求档 = 主 agent 笔，未自改。
2. **`#1566` 交付后仍越线**：缝 1 后 513 > 500 咨询线。本批只交缝 1；缝 2 需另批（结构变更须独立设计轮）。请确认这一「中间态越线」可接受。
3. **`#1533` 依赖 `.6` 可达**：不可达则本项不交付（不降级为盘上模拟），请确认执行载体（父侧直跑 ∥ 派实施轮）。
4. **`#1529` 拆缝偏离批 L**：改抽 `computePlacement` / `PROVIDER_SHORT+shortName` / `menuStateOf` 三件，放弃抽 `providerRow`（113 行 DOM 件）。需评审核可。

### 2.7 修正轮 1 · 评审 13 条逐条落定（2026-10-19）

**本节 = 修正后的定稿口径**：2.1–2.6 中与本节相抵的读数 / 坐标 / 判据 / 行数，一律以本节为准（批档 append-only，旧行不改）。
**本轮范围**：只修证据 · 坐标 · 判据 · 行数。不动代码 · 不动 §3 · 不动 §1 · 不改七条归属与方向 · 不扩射程。
**本轮实测口径**：行数 = `split("\n").length`（含末尾空段，与批 L 同口径）；全部读数为本轮现盘重读。

#### A. 四条 🔴

**A1 · `#1566` 移出块坐标与行数（评审 1）**

- 移出块 = **`core-run.mjs:49`–`:216` = 168 行**。`:49`–`:50` 是 `MAX_TOOL_OUTPUT` 的前注（注释随常量走）；`:51`–`:216` = 166 行（八常/类 + 八件纯函数，其中 `listFilesOf` `:188` 起、`:216` 收尾）。
  **2.2⑥ 的「`:51`–`:192` = 142 行」作废**：`:192` 是 `listFilesOf` 体内的 `let scanned = 0`，照字面搬会把函数切两半。
- **交付读数**：`core-run.mjs` 现值 **655** ⇒ 655 − 168 = **487**，再加 import 回用 1 行 + re-export ≈3 行 = **≈491**；若 `readdirSync` / `join` 搬出后核心体零余用则再 −1~−2。**判据取区间 `487–493` 且 < 500——未越咨询线，全批删除一切「越线容忍」措辞（§1 裁定 2 已由父侧自我推翻）**。
- **新档** `thincoder-server/deploy/sandbox/member-shell/core-run-util.mjs` = 168 行搬入 + 档头注 ≈4 + `node:fs` / `node:path` import 2 = **≈174**（2.3 表原记 ≈145，作废）。
- 连带更正：2.3 表 `core-run.mjs` 行 Δ 改 **−168 ⇒ ≈491**（原「−142 ⇒ 513（仍越 500）」作废）；2.6 上抛②「中间态仍越线」**关闭**。

**A2 · `#1519` i18n 落点改正确载体（评审 2）**

- `admin.sandbox.*` 族载体 = **`thincoder-server/public/i18n-zh-sandbox.mjs`（283 行）∥ `i18n-en-sandbox.mjs`（283 行）**；两 core 档（`i18n-zh-core.mjs:145` ∥ `i18n-en-core.mjs:142`）对 `admin.sandbox.` **0 命中**（本轮实扫）。
- 新键 `admin.sandbox.workspacesUnreachable` 与 `admin.sandbox.runnerUnreachable` 同址：**zh `:40` ∥ en `:40`**。Δ = **+1 / +1**（283 → 284）。
- 2.3 表该行改：`i18n-{zh,en}-sandbox.mjs` · 283 / 283 · +1 / +1。

**A3 · `#1528` 判据改键位形（评审 3）**

- 判据改：`grep -cE '^\s*defaultModel:' thincoder-vscode/src/extension/settings.mjs` ⇒ **现盘 1**（`:173`），删 `:172`–`:173` 后 ⇒ **0**；`node --check` exit 0。
- 档头注 `:69`–`:70` 保留（`activeProvider = resolveProviders 的 defaultModel` 是解释句，不是键）⇒ **全文** `grep -c defaultModel` 删后仍 = 2，**该形不作判据**。

**A4 · `#1518` V3 定案 = (a)，与 `:409` / `:411` 同式（评审 4）**

- `settings.mjs:397` 早退径改为（插在 `return` 前）：
  - `const prefs = prefsOverride ?? loadModelPrefs(workspaceState)` —— **与 `:409` 完全同式**（会话槽复合优先，workspaceState 兜底）；
  - `_lastModelsPayload = []`；
  - `_lastPushedPrefs =` 与 `:411`–`:413` 同式（`prefs.provider` / `prefs.model` 皆为非空字符串 ⇒ `"provider:model"`，否则 `null`）；
  - `panel?.webview.postMessage({ type: "models", models: [], prefs })`；
  - 一句理由注：空表 = 已到且空；prefs 与簿记**同拍同源**，否则 `:372`–`:375` 的判零源（防系统播种劫持全局默认）在这条径上失守。
- **为何弃 (b)**：`:372`–`:375` 明写 `_lastPushedPrefs` = 本次下发复合的判零源；推非空 prefs 却记 `null`，webview 回写即无可判零 ⇒ 正好绕过防劫持门。`:406`–`:408` 又明写 prefs = 会话槽复合优先 ⇒ 早退径不得偏离单源。
- Δ 改 **+7**（3 行代码 + 2 行簿记 + 1 句注 + 空行；原 +6 作废）。

#### B. 七条 🟡 + 两条 🔵

**B5 · 裁定① 回写（评审 5）** —— `#1511` 判据主句定稿：
「扫 `docs/**/*.md`（排除 `docs/batches/**`）对字面 `（拟新增` ⇒ **除 `docs/core/requirements/_archive/ENGINEERING-MODE-MECHANISM.md:355` 这一行（在册豁免）外 0 命中**；豁免理由 = 该行是 F14 前向引用豁免族的**规则定义句**，删标记即改判据语义。」
现盘总命中 7（6 core + 1 `_archive`）。**2.6 上抛① 关闭（裁定① = 保留，已裁）**：原「本席倾向：整段 F14 删除」一句不再作为设计口径。

**B6 · `#1566` re-export / import 面（评审 6）**
- 新档**只导出改前已导出的 11 名**：`MAX_TOOL_OUTPUT` `:51` · `BOX_PROVIDER` `:54` · `ShellError` `:58` · `FLAG_KEYS` `:67` · `FILE_LIST_LIMIT` `:78` · `FILE_SCAN_LIMIT` `:79` · `slotOf` `:85` · `withBoxProvider` `:93` · `isToolFailureText` `:111` · `projectMessages` `:140` · `listFilesOf` `:188`。
- 非导出 5 名随块搬入新档后**仍不导出**：`FLAG_SETTERS` `:70` · `IGNORED_DIRS` `:82` · `textOf` `:119` · `flagsOf` `:128` · `excerptOf` `:175`。
- 其中 **3 名仍被保留体使用 ⇒ `core-run.mjs` 以 `import` 回用**：`FLAG_SETTERS`（`:406`）· `flagsOf`（`:253` ∥ `:269`）· `excerptOf`（`:369`）。
- `textOf`（`:149` ∥ `:179`）与 `IGNORED_DIRS`（`:206`）只被搬出的函数使用 ⇒ 不回 import。
- 全量 re-export 会让导出面多 5 名 ⇒ 判据④ 必红；故「同名 re-export」限定为 11 名。

**B7 · `#1519` 渲面契约 + 重试可重跑（评审 7）**
- **判门外提纯件**返回 `{ confirmDisabled, hintKey, retry }`；`hintKey` **只覆盖容器侧提示行**（现 `views-sandbox.mjs:322`–`:330` 的三支）。
- **承载工作区行按原位保留**：现 `:331`–`:336`（`admin.sandbox.runnerWorkspaces` 句 + 「确认丢弃」勾选 + `applyGate`）不并入 hint 面；`radio` 两支（`:328`–`:329`）同样原位。
- **并存态写死**：容器不可达 ∧ 工作区清单读败 ⇒ `hintKey` = 读败键、`confirmDisabled = true`、`retry = true`，且容器侧「不可达」句照常渲染（两行并存，不互相取代）。
- **重试可重跑**：把现 `:313`–`:341`（两取数 + 一次渲）提为具名函数 `renderRemoveRunnerBody()`，重试钮复调该函数（两取数重发）。`submit` 的 `boundCount` 判定沿用函数内赋值。
- Δ 改 **「结构不变 + 估 ≤ +25」**（提函数 + 重试钮 + 三态渲；原「+10 / −6 ⇒ ≈347」作废，交付读数见 §5）。

**B8 · `#1519` 文档落点两行（评审 8）**

| 文件 | 现读 | Δ | 内容 |
|---|---|---|---|
| `docs/server/design/webui/SANDBOX.md` | 131 | 删除节点弹窗句（`:19`）改一句 | 补第三态：工作区清单读败 ⇒ 明示句 + 重试钮 + 删除钮先禁；提交体零 `confirm` |
| `docs/server/design/sandbox/SANDBOX.md` | 670 | `:73` 行补一句 | 客户端读工作区清单失败 ⇒ 不携 `confirm` 且删除钮先禁（读败 ≠ 无承载）；**服务端行为零改**（不可达 ⇒ 仅 keep 可过，现行不变） |

**B9 · `computePlacement` 补 `panelWidth`（评审 9）**
- 签名定稿：`computePlacement({ anchorRect, viewport, panelHeight, panelWidth = 270, up }) → { left, top }`（缺省 270 = 现 `model-menu.mjs:128` 的写死常量）。
- 判据两例**同一宽度源**：零矩形 + 视口 1200×800 + `panelWidth: 270` ⇒ `left = 465`、`top = 400 − panelHeight / 2`，即面板中心落视口中心（`|cx − 600| ≤ 2 ∧ |cy − 400| ≤ 2`）；正常锚回归例同用 270，与现 `Math.max(4, Math.min(r.left, viewport.width − panelWidth))` 逐值相等。

**B10 · 受影响表补测试档三行（评审 10）**

| 文件 | 现读 | Δ | 载体 |
|---|---|---|---|
| `docs/batches/2026-10-19-product-remainder.test.mjs` | 0 | ≈140 | `#1518` V1/V2/V3 · `#1519` 4 + 3 例 · `#1566` 五腿（沿现存四件批内件惯例） |
| `thincoder-render-core/test/model-menu-pure.test.mjs` | 0 | ≈70 | `#1529` 六例（`menuStateOf` 3 + `computePlacement` 3） |
| `thincoder-render-core/test/run.mjs` | 83 | +1 | 注册上一行新档 |

**B11 · `#1518` 注释保留轮换句（评审 11）**
- `mount-team.mjs:13` 定稿为「**登出径同随动 ∥ 轮换径零改**」（两个口径都留在句内）。
- **轮换径零改 = 设计拍**，理由：`panel-messages-settings.mjs:290`–`:298` 轮换成径已 `_pushStatus()` 重取渠道行；候选面由 `fullStatus` 探针产生，轮换不改变**渠道集合**（只换 token），下一次打开/切换会话拍自然刷新。若用户裁定轮换也要随动，另批一行同形补上。

**B12 · 净行统一（评审 12）**
- `#1529` 定稿一组数：`model-menu.mjs` 494 − 搬出 30（place 8 + labels 17 + state 5）+ 接线 3 + 三态渲 10 = **477**；2.3 表该行改「−30 / +13 ⇒ 477」。
- 文档现读更正：`docs/render-core/design/RENDER-CORE.md` = **511**（2.1 / 2.3 记 510 作废）；`docs/server/design/agent/MEMBER-AGENT.md` = **440**（2.3 记 439 作废）。

**B13 · `#1533` 断言 B 补执行径，并改正表列名（评审 13）**
- **表名 / 列名按现盘更正**：表 = `audit_events`（非 `audit_event`）；**无 `kind` 列**——kind 在 `detail` JSON 内。写入点 = `thincoder-server/src/sandbox/box.mjs:227`–`:234`（`type: "sandbox_event"`、`detail: { workspaceId, runnerId, recovery, path }`）。
- 断言 B 定稿：
  `select count(*) from audit_events where type='sandbox_event' and json_extract(detail,'$.kind')='quota_recovered' and json_extract(detail,'$.workspaceId')=<工作区 id> and id > <基线 max(id)>;` ⇒ **== 1**。
  `json_extract(detail, …)` 同式先例 = `box.mjs:561`。
- 库路径：`config.db`（缺省 `data/gateway.db`，相对**配置档所在目录**解析为绝对路径 —— `ops/config.mjs:19` ∥ `:52` ∥ `:371`–`:373`）。
- 执行径（`.6` 上，二选一）：① `sqlite3 <解析后的 db 绝对路径> "<上句>"`；② `node --input-type=module -e "import {DatabaseSync} from 'node:sqlite'; …"`（Node ≥ 24 内置）。

#### C. 上抛项收正

| 上抛 | 状态 |
|---|---|
| ① `#1511` 第 7 处 | **已裁 · 保留**（定义句在册豁免，判据主句已改，见 B5） |
| ② `#1566` 中间态越线 | **关闭**（实测 ≈491 < 500，前提读数是错的） |
| ③ `#1533` 执行载体 | 保持未决：`.6` 不可达 ⇒ 不交付、台账行留切态，不降级为盘上模拟 |
| ④ `#1529` 拆缝改三纯件 | 保持未决（待评审核可） |

### 2.8 修正轮 2 · 二轮评审 3 条逐条落定（2026-10-19）

**本节 = 修正后的定稿口径**：2.1–2.7 中与本节相抵的判据 / 导出面 / 行数 / 账目，一律以本节为准（批档 append-only，旧行不改）。
**本轮范围**：只修判据 · 导出面 · 账目。不动代码（设计席）· 不动 §3 · 不动 §1 · 不改七条判类方向 · 不扩射程。

#### C1 · 🔴 `#1518` 补非空 prefs 夹具（二轮评审第 4 行 · Unfixed）

**缺口的形状**：实现条款（2.7 A4）已修实，但判据只断言「`lastPushedPrefs() === null`」——只在空 prefs 下验，推载荷与簿记是否同值一个字没验 ⇒ **改回旧形仍绿**。

**判据全文定稿**（替换 2.4 行 2 `#1518` 的单元测试句）：

> VSC 批内定向单测。夹具：面板假件 = `{ webview: { postMessage(msg) { pushes.push(msg) } } }`（`pushes` 逐条留存，按 `type === "models"` 过滤）；`workspaceState` 假件 = `{ get(k) { return k === "thincoder.modelPrefs" ? seed : undefined }, update() {} }`（读面口径 = `thincoder-vscode/src/extension/session-io.mjs:242`–`:243`）；配置经 `_setConfigPathForTest(<tmp>/config.json)`（`thincoder-core/config-io.mjs:35`–`:39`）指向 `providerStatus().providerState.state === "invalid"` 的配置（`providerState` 来源 = `thincoder-vscode/src/extension/settings.mjs:118`–`:129`）。
>
> 1. **V1 登出成径**：走 `handleTeamLogout` ⇒ 收到 `models` 消息 ≥ 1 且 `_pushSettings` 被调 1 次。
> 2. **V2 登出成径**：走 `logoutFlow` ⇒ `_pushSettings` 被调 1 次。
> 3. **早退径 · 空 prefs**（`seed = undefined`）：`fullStatus(panel, workspaceState)`（`prefsOverride` 取缺省 `null`，签名 = `thincoder-vscode/src/extension/settings.mjs:393`）⇒ 收到 `models` 消息 1 次，且
>    - 载荷 `models` 深等于 `[]`；
>    - 载荷 `prefs` 深等于 `{}`；
>    - `lastModelsPayload()` 深等于 `[]`；
>    - `lastPushedPrefs() === null`。
> 4. **早退径 · 非空 prefs**（`seed = { provider: "anthropic", model: "claude-x" }`）：同一调用 ⇒ 收到 `models` 消息 1 次，且
>    - 载荷 `models` 深等于 `[]`；
>    - **载荷 `prefs` 深等于 `{ provider: "anthropic", model: "claude-x" }`**；
>    - **`lastPushedPrefs() === "anthropic:claude-x"`**；
>    - `lastModelsPayload()` 深等于 `[]`。
>    **两断言缺一不可**：只验簿记，「推非空 prefs 却记 null」仍绿；只验推载荷，「推了 prefs 却说没推」仍绿——那正是 `#1518` 的形状。
>
> 5. **桌面 D1**：`mount-team` 的 `logout` 成径 ⇒ `onProvidersChanged` 被调 1 次（注入替身计数）。

**为何断言成立（代码面依据）**：早退径定稿（2.7 A4）= `const prefs = prefsOverride ?? loadModelPrefs(workspaceState)`（同 `thincoder-vscode/src/extension/settings.mjs:409`）⇒ 缺省 `prefsOverride` 时 `prefs` = `workspaceState` 读出的复合；簿记同 `:411`–`:413` 式 ⇒ `"provider:model"`；载荷 `prefs` 与簿记**同源同拍**（`:418` 的推送形，早退径同形）。判零源理由见 `:372`–`:375`。

#### C2 · 🟡 `#1566` 导出面定稿（二轮评审第 14 行 · 与 2.7 B6 相抵处改正）

**相抵点**：2.7 B6 写「非导出 5 名随块搬入新档后**仍不导出**」，紧接一句「其中 3 名仍被保留体使用 ⇒ 以 `import` 回用」——**非导出的绑定无法 import**，两句不能并存。

**定稿表**（新档 = `thincoder-server/deploy/sandbox/member-shell/core-run-util.mjs`）：

| 名 | 现坐标（`thincoder-server/deploy/sandbox/member-shell/core-run.mjs`） | 移出前导出面 | 新档定稿 | 保留体回用（`core-run.mjs`） |
|---|---|---|---|---|
| `MAX_TOOL_OUTPUT` | `:51` | 导出 | **导出** | 由 `core-run.mjs` re-export |
| `BOX_PROVIDER` | `:54` | 导出 | **导出** | re-export |
| `ShellError` | `:58` | 导出 | **导出** | re-export |
| `FLAG_KEYS` | `:67` | 导出 | **导出** | re-export |
| `FLAG_SETTERS` | `:70` | **非导出** | **导出** | `import` 回用：`:406` |
| `FILE_LIST_LIMIT` | `:78` | 导出 | **导出** | re-export |
| `FILE_SCAN_LIMIT` | `:79` | 导出 | **导出** | re-export |
| `IGNORED_DIRS` | `:82` | **非导出** | **仍私有** | 无（只被搬出的 `listFilesOf` 用，`:206`） |
| `slotOf` | `:85` | 导出 | **导出** | re-export |
| `withBoxProvider` | `:93` | 导出 | **导出** | re-export |
| `isToolFailureText` | `:111` | 导出 | **导出** | re-export |
| `textOf` | `:119` | **非导出** | **仍私有** | 无（只被搬出的 `projectMessages:149` ∥ `excerptOf:179` 用） |
| `flagsOf` | `:128` | **非导出** | **导出** | `import` 回用：`:253` ∥ `:269` |
| `projectMessages` | `:140` | 导出 | **导出** | re-export |
| `excerptOf` | `:175` | **非导出** | **导出** | `import` 回用：`:369` |
| `listFilesOf` | `:188` | 导出 | **导出** | re-export |

**汇总**：新档导出面 = **14 名**（11 名原导出 + `FLAG_SETTERS` / `flagsOf` / `excerptOf` 三名因保留体回用而转导出）；`textOf` / `IGNORED_DIRS` 两名**档内私有**。`core-run.mjs` 的 re-export 限 **11 名**（改前已导出的那 11 名），另 3 名以 `import` 回用、**不回 re-export**。

**判据对齐（逐条改后定稿）**：
- **判据①**（2.4 行 6 定稿）：新档导出名集合 **⊇** 上表 14 名（11 名原导出 + `FLAG_SETTERS` / `flagsOf` / `excerptOf`）。
- **判据④**（2.4 行 6 定稿）：`node -e "import('thincoder-server/deploy/sandbox/member-shell/core-run.mjs')"` 成功且导出名集合与改前**逐名相等**（= 11 名）。新增转导出的 3 名不从 `core-run.mjs` re-export ⇒ ④ 不会因新档多出的 3 名而红。
- **判据②**（零本地定义 8 名）不变：`slotOf` / `withBoxProvider` / `isToolFailureText` / `projectMessages` / `listFilesOf`（导出件）+ `textOf` / `flagsOf` / `excerptOf`（私有件）——八名全部搬出，两档 grep `function <名>` 于 `core-run.mjs` = 0。

#### C3 · 🔵 两条账目更正（二轮评审第 15 行）

1. **`thincoder-render-core/test/run.mjs` 的「+1 注册」不需要**：跑器用单层 glob `test/*.test.mjs`（`thincoder-render-core/test/run.mjs:81`）+ 盘面自检（`:69`–`:78` 全档 `node --check` + 空清单守卫）⇒ 新档 `test/model-menu-pure.test.mjs` 自动被收集。B10 表该行定稿 = **「无需登记（Δ 0）」**。
2. **A1 新档行数 ≈174 少算 1 行**：新档需 import `capText` / `RESULT_SUMMARY_MAX`——搬出的 `projectMessages` 在 `core-run.mjs:164`–`:165` 用两者、`excerptOf` 在 `:181` 用 `capText`；同名导入在保留体仍被使用（`:271` `capText` ∥ `:529` `capText` + `RESULT_SUMMARY_MAX`），故 `core-run.mjs` 的 `./protocol.mjs` 导入行（`:42`–`:45`，`:43` 含两符号）**原样不动**。新档行数改 **≈175**（168 搬入 + 档头注 4 + 三条 import 3）。
   **新档 import 清单（3 行）**：
   - `import { readdirSync } from "node:fs"`（`listFilesOf` 于 `:197` 用）
   - `import { join } from "node:path"`（`:197` 用）
   - `import { RESULT_SUMMARY_MAX, capText } from "./protocol.mjs"`（`:164`–`:165` ∥ `:181` 用）
   **行数口径补正**：删导入**名**不删**行**（`core-run.mjs:39` 改 `import { existsSync } from "node:fs"`、`:40` 视余用同为 1 行）⇒ 此项行数变动计 **0**，交付读数区间 **487–493** 不变。

### 2.9 修正轮 3 · 父侧裁定：测试载体三舱分档（2026-10-19）

**本节 = 定稿口径**：§2.7 B10 的测试载体句与本节相抵处以本节为准（批档 append-only，旧行不改）。

**父侧裁定（2026-10-19）**：三舱并行 ⇒ 测试载体三舱各一档——B10 原文的单档 `docs/batches/2026-10-19-product-remainder.test.mjs` 为共享写面，同档互覆。

| 舱 | 条目 | 载体（定稿） | 用例 |
|---|---|---|---|
| 甲 | `#1566` | `.thincoder/tmp/2026-10-19-core-run-split.test.mjs`（临时区——零留存，不入交付、不入任何门） | 定向 8 例（§5 实读 8/8 pass） |
| 乙 | `#1518` / `#1528` | `docs/batches/2026-10-19-product-remainder-1518.test.mjs` | 6 例（V1 ∥ V2 ∥ V3 空 prefs ∥ V3 非空 prefs ∥ D1 ∥ `#1528`） |
| 丙 | `#1519` / `#1529` | `docs/batches/2026-10-19-product-remainder.test.mjs`（6 例）+ `thincoder-render-core/test/model-menu-pure.test.mjs`（6 例；跑器 `test/*.test.mjs` 自动收集，免登记） | 12 例 |

**两处核对（本轮实读）**：

1. 「用例 DD-106–DD-109」在 §2 全文 **0 命中**——B10 原句只写用例类别（`#1518` V1/V2/V3 · `#1519` 4 + 3 例 · `#1566` 五腿）与单档载体（`:238`）。本节只改载体口径，用例号不涉及。
2. `#1528` 落点：§2.1 / §2.2④ 均写 `thincoder-vscode/src/extension/settings.mjs:172`–`:173`；批档无 `session-flags.mjs:172`–`:173` 的落点句（§4 `:437` 仅把该档列入乙舱文件域）。实读 `thincoder-desktop/src/main/session-flags.mjs` = 97 行、`defaultModel` 零命中 ⇒ 无坐标可收正（§5 `:574` 已记录该派单笔误）。

**与 §5 一致**：三舱实际落盘与本节逐行相符（甲临时区 8 例 ∥ 乙 `-1518` 档 6 例 ∥ 丙批内档 6 例 + render-core 6 例）。

## §3 设计评审（评审子代理）

### 轮次 1（评审子代理）

### 首审（产品代码面余项批）— 计数 13 项 = 4 🔴 / 7 🟡 / 2 🔵

| # | Category | Severity | Issue | Suggestion |
|---|----------|----------|-------|------------|
| 1 | 行数注记 / Feasibility | 🔴 | `#1566` 移出块坐标与实况不符：设计 `:91` 写「移出块 = `:51`–`:192`（142 行：八常/类 + 八件纯函数）」，但 `thincoder-server/deploy/sandbox/member-shell/core-run.mjs:188` 的 `export function listFilesOf(cwd, { q = "", limit = FILE_LIST_LIMIT, scanLimit = FILE_SCAN_LIMIT } = {}) {` 到 `:216` 才收尾（`:192` 是其函数体内的 `let scanned = 0`）⇒ `:51`–`:192` 不含完整函数，照字面搬会把函数切两半。实际可搬区间 = `:51`–`:216` = **166 行**（连 `:49`–`:50` 前注则 168）⇒ 655 − 166 = **≈489（未越 500）**，而非 `:92` 的「减量读数：655 − 142 = **513**」。连带错：`:131` 新档「≈145」低估；`:147` 判据⑤；`:159` 上抛②与 §1 裁定 2 的 513 前提 | 以 `:51`–`:216` 重算移出块行数、`core-run.mjs` 交付读数（≈489）与新档预算，并把「中间态仍越咨询线」的表述改为实测值（未越线则删该上抛）；判据⑤ 改为以实测移出块行数代入 |
| 2 | Clarity（受影响档） | 🔴 | `#1519` i18n 落点错档：设计 `:125` 写「`thincoder-server/public/i18n-zh-core.mjs` ∥ `i18n-en-core.mjs` \| 145 / 142 \| +1 / +1」，但 `admin.sandbox.*` 族实际载体是 `thincoder-server/public/i18n-zh-sandbox.mjs:40`「`"admin.sandbox.runnerUnreachable": "节点不可达——容器无法核对（如有将保留运行）",`」与 `i18n-en-sandbox.mjs:35`；两 core 档对 `admin.sandbox.` **0 命中**（本轮实扫），zh-sandbox 现读 283 行 | 载体改为 `i18n-{zh,en}-sandbox.mjs`（新键 `admin.sandbox.workspacesUnreachable` 与 `runnerUnreachable` 同址），现行行数/Δ 按该两档实读回填；同时核 `docs/server/design/webui/SANDBOX.md` 的 `admin.sandbox.*` 键表句是否需随正 |
| 3 | Acceptance | 🔴 | `#1528` 判据一跑就红：`:145` 判「`grep -c defaultModel thincoder-vscode/src/extension/settings.mjs` ⇒ **0**」，但该档除待删的 `:172`–`:173` 外，`:69` 与 `:70` 的档头注仍含该词（`:70` 为「运行期 `/models` 拉取，见 fullStatus。activeProvider = resolveProviders 的 defaultModel」）⇒ 删后计数 = 2 | 判据限定为「键位形 0 命中」（如 `grep -cE "^\\s*defaultModel:" `）或只对 `agentSettings` 字面段判零；说明档头注保留故全文计数不为 0 |
| 4 | Requirements / Acceptance | 🔴 | `#1518` V3 三行插入与既有单源相抵且 AC 空过：`:61` 令早退前推 `prefs: loadModelPrefs(workspaceState)` 并置 `_lastPushedPrefs = null`；但 `settings.mjs:409` 的 flush 以「`const prefs = prefsOverride ?? loadModelPrefs(workspaceState)`」会话槽复合优先（`:406`–`:408` 注「models push 的 prefs = 会话槽复合优先」），早退径却忽略 `prefsOverride`（该参数在 `:393` 签名内可用）；且 `:372`–`:375` 注明 `_lastPushedPrefs` = 本次下发复合（判零源，防系统播种劫持全局默认），推非空 prefs 却记 null 会使回写失去判零源。`:143` 判据只在空 prefs 夹具下断言 ⇒ 缺陷空过 | 二选一定死并在设计写明：(a) 早退径也走 `prefsOverride ?? loadModelPrefs(workspaceState)` 并按 `:411` 同式记 `_lastPushedPrefs`；(b) 该径推 `prefs: null` 并说明理由。判据补一例「workspaceState 有 prefs 复合」的夹具，断言推载荷与簿记同值 |
| 5 | Consistency（裁定 ∥ 设计） | 🟡 | 裁定①（§1 `:17`「第 7 处「保留」」+「AC 相应改写：…定义句除外」）未回写设计：`:142` 判据仍以「⇒ **0 命中**」为主句、只挂「若上抛①裁定保留」条件从句（实测该扫描必得 1 命中 = `docs/core/requirements/_archive/ENGINEERING-MODE-MECHANISM.md:355`），且 `:158` 上抛①仍以「**本席倾向**：整段 F14 删除」与裁定「保留」相反 | 按裁定把判据主句改写为「除 `_archive` 定义句一行（在册豁免）外 0 命中」，并收正 `:158` 的倾向句（由上抛改记为已裁保留）；裁定②③④与设计的对应处已一致，无需动 |
| 6 | Acceptance | 🟡 | `#1566` 判据自相抵/可空过：`:147` ④「导出名集合与改前**逐名相等**」与 `:91`「保留**同名 re-export**（`export { … } from "./core-run-util.mjs"`）」相抵——`FLAG_SETTERS`（`core-run.mjs:70`，`const FLAG_SETTERS = Object.freeze({`，非导出）、`IGNORED_DIRS`（`:82`）、`textOf`（`:119`）、`flagsOf`（`:128`）、`excerptOf`（`:175`）现均非导出，而 `flagsOf`/`excerptOf`/`FLAG_SETTERS` 仍被保留体使用（`:253`「flags: flagsOf(d),」· `:369`「row.excerpt = excerptOf(data)」· `:406`「if (!core[FLAG_SETTERS[key]](cwd, slot, args[key] === true)) {」）⇒ 必须回 import；全量 re-export 会新增 5 个导出名使 ④ 红。① 的 ⊇ 名单只 11 名，正好漏这 5 件。⑤「行数 = 改前读数 − 移出块行数 ± 2 且 < 600」的移出块行数取自同一份错读数（见 1），且 < 600 宽于本项口径 | 明写「`core-run.mjs` 只 re-export 改前已导出的 11 名；非导出的 5 件以 `import` 回用」，① 的名单补齐 16 名分两类；⑤ 改为「= 改前读数 − 实测移出块行数 ± 2」并附实测值 |
| 7 | Clarity | 🟡 | `#1519` 渲染面重写未定：现渲面是两层——容器三支提示行（`views-sandbox.mjs:322`–`:330`）与承载工作区行（`:331`–`:336`，含 `admin.sandbox.runnerWorkspaces` 的 count/names）可并现；设计 `:69` 的纯件只返**单一** `hintKey`，未说明它取代哪些行、radio/勾选行是否保留、`不可达 + 读败` 并存时取哪态；`:69`④ 的「重试钮」需重跑两取数，而取数块现为 modal 内联闭包（`:314`–`:341`），未说明如何改为可重跑；`:123` 的「+10 / −6 ⇒ ≈347」未含该重写 | 在 2.2③ 补渲面契约：`hintKey` 覆盖的仅是容器侧/读败句，承载行与 radio、勾选行按原位保留；把取数+渲一段提为具名函数（重试钮复调），并把该重写计入 Δ 或改判 Δ 为「结构不变 + 估 ≤±20」 |
| 8 | Document ownership | 🟡 | `#1519` 无设计档落点：表内该条 0 文档行，2.1 仅以代码 `:314`–`:315` 为「设计已有」的证据；实际拥有该弹窗语义的档是 `docs/server/design/webui/SANDBOX.md:19`，其句为「无承载/不可达 ⇒ 体不携 `confirm`（现行两径零回归）」——只有两径，无「工作区清单读败」第三态、无重试钮、无新键（对比 `#1529` 列了 `RENDER-CORE.md:228`–`:230` 行、`#1566` 列了 `MEMBER-AGENT.md` 行） | 表内补 `docs/server/design/webui/SANDBOX.md`（删除节点弹窗块）与 `docs/server/design/sandbox/SANDBOX.md:73` 两行的随正 Δ，把第三态/重试/新键写进拥有该主题的档 |
| 9 | Clarity | 🟡 | `#1529` `computePlacement` 入参缺面板宽：`:82` 签名为「`computePlacement({ anchorRect, viewport, panelHeight, up }) → { left, top }`」，而 `:146` 的水平居中判据「`\|cx−600\| ≤ 2`」需面板宽（现公式把 270 写死：`model-menu.mjs:128`「panel.style.left = Math.max(4, Math.min(r.left, window.innerWidth - 270)) + "px"」）⇒ 纯件只能内隐常量，而「正常锚逐值相等」回归例又要求同式 | 签名补 `panelWidth`（缺省 = 现常量 270），并在判据里点明两例都用同一宽度源 |
| 10 | Clarity（受影响档） | 🟡 | 受影响档表无任何测试档行：2.4 判据的 `#1518`（VSC 批内定向单测）、`#1519`（4 例 + 旧行为 3 例）、`#1529`（3 + 3 例）、`#1566`（5 腿）都需单测载体，但表内 0 测试件；仓内惯例 = 批内件 `docs/batches/<批>.test.mjs`（现存四件）与 `thincoder-render-core/test/run.mjs` | 表内补测试档两行（批内件与/或 render-core 跑器）并标现行行数与 Δ，使 2.4 每条判据有具名载体 |
| 11 | Scope / Clarity | 🟡 | `#1518` 注释收正丢支且轮换径不对称未议：`:62` 把 `mount-team.mjs:13`「登出 ∥ 轮换两径零改」收正为「登出径同随动」，改后该注不再交代轮换径；轮换径确实仍零随动（`panel-messages-settings.mjs:290`–`:298` 只 `pushTeamStatus` + `_pushStatus`；桌面 rotate 同形），而轮换会重签 token ⇒ 派生渠 `apiKey` 变 | 注释改为「登出径同随动 ∥ 轮换径零改」，或在设计里给一句「轮换径不随动的理由」；若轮换也需随动则并入本批（同形一行） |
| 12 | 数值漂移 | 🔵 | `#1529` 净行两处不一：`:86` 算「+ 三行接线 + 三态渲染 ≈10 ⇒ **≈477**」（494−30+13），`:126` 表行写「−30 / +12 ⇒ ≈477」（实为 476）；另 `:129` 记 `RENDER-CORE.md` 510 行，现读 511（`RENDER-CORE.md:224`–`:237` 段落可见） | 统一为一组数（Δ 拆项与终值同源）；文档行数以现读回填（纯 `.md` 免 Δ，只修读数） |
| 13 | Clarity | 🔵 | `#1533` 断言 B 无执行载体：`:102` 的「`select count(*) from audit_event where kind='quota_recovered' and id > <基线max(id)>` == 1」未给执行径（`.6` 上 `sqlite3` 路径 ∥ node 脚本 ∥ 库文件位置），表名列名亦未对源核对 | 补一行执行径与库路径（并按 server 库表实读核对 `audit_event.kind` 列名），使六步可照抄 |

**已核通过项（免修）**：`#1518` V1/V2/D1/C1 四处实读坐标逐条成立（`panel-messages-settings.mjs:268` 登录有 / `:281` 退出无 ∥ `team-surface.mjs:135` 有 / `:149` 无 ∥ `mount-team.mjs:149` 有 / `:163`–`:164` 无）；`#1528` 两行落点与 webview 零消费（`webview/ui.js` 仅见 `banner.defaultModelFallback*` i18n 键）成立；`#1511` 前提成立（`thincoder-core/doc-check/anchors.mjs:23` 的 `ANCHOR_RE` 仅匹 `*.md`；`thincoder-core/**` 对 `NEW_MARKER`/`拟新增` 0 命中；`docs/**` 该字面余 7 处 = 设计所列，非 core 0 命中）；`#1529` 先例档 `RENDER-CORE.md:228` 三态语义在位；`:48`/`:55` 两纯件与 `:123`–`:130` `place()` 体量（8 行）读数成立；2.5 先例行（对齐/偏离逐条，含三处偏离理由）与勘察证据行（含「本轮未查外部源」明示）齐备。

**计数**：13 项 = 4 🔴 · 7 🟡 · 2 🔵

VERDICT: changes-required

### 轮次 2（评审子代理）

### 第二轮（验修正轮 13 条 · 不重新狩猎）

计数：前轮 13 条 = **12 Fixed**（含 🔴 3 条修实）+ **1 Unfixed（部分修复）**；新增 2 条 = 1 🟡 + 1 🔵。表内 15 行，🔴 = 1（残余）。

| # | Orig# | File | Severity | Status | Notes |
|---|-------|------|----------|--------|-------|
| 1 | 1 | `docs/batches/2026-10-19-product-remainder.md` §2.7 A1 | 🔴 | Fixed | 移出块改 `:49`–`:216` = 168 行（`:49`–`:50` 前注随常量走；本轮复读 `core-run.mjs:188` 起 `:216` 收尾），655−168=487，+import/re-export ≈491；判据改「区间 487–493 且 < 500」；2.3 行 Δ −168、2.6 上抛② 关闭、§1 裁定 2 更正三处回写齐 |
| 2 | 2 | §2.7 A2 | 🔴 | Fixed | 载体改 `i18n-{zh,en}-sandbox.mjs`（本轮复读 zh:40 ∥ en:40 均 `admin.sandbox.runnerUnreachable`，zh 现读 283），新键同址 +1/+1 |
| 3 | 3 | §2.7 A3 | 🔴 | Fixed | 判据改 `grep -cE '^\s*defaultModel:'`：现盘 1（仅 `settings.mjs:173`），删后 0；并明写全文计数删后 = 2 不作判据（`:69`/`:70` 注释在位，本轮复读） |
| 4 | 4 | §2.7 A4 ∥ §2.4 行 2 | 🔴 | Unfixed | 实现条款已修实（与 `settings.mjs:409` 同式、`:411` 簿记同式、`:372`–`:375` 判零源理由在位）；但判据仍只有「`lastPushedPrefs() === null`」一断言，无「workplaceState 有 prefs 复合」夹具 ⇒ 推载荷与簿记同值无例可验，改回旧形仍绿 |
| 5 | 5 | §2.7 B5 | 🟡 | Fixed | 判据主句定稿为「除 `_archive:355` 一行（在册豁免）外 0 命中」+理由；上抛① 已裁·保留 |
| 6 | 6 | §2.7 B6 | 🟡 | Fixed | re-export 限 11 名、非导出 5 名分类、3 名回 import 理由齐全（相抵处见新条 14） |
| 7 | 7 | §2.7 B7 | 🟡 | Fixed | hintKey 只覆盖容器侧三支、承载行与 radio 原位、并存态写死、取数块提为 `renderRemoveRunnerBody()`、Δ 改「结构不变 ≤+25」；注：hintKey 双层语义仍靠散文约束，返形未分字段（不阻塞） |
| 8 | 8 | §2.7 B8 | 🟡 | Fixed | 两文档行补上：`webui/SANDBOX.md` 131（`:19` 删除节点弹窗句在位）∥ `sandbox/SANDBOX.md` 670（`:73` 有承载 `confirm: true` 句在位） |
| 9 | 9 | §2.7 B9 | 🟡 | Fixed | 签名补 `panelWidth = 270` = `model-menu.mjs:128` 写死常量；两例同宽源 |
| 10 | 10 | §2.7 B10 | 🟡 | Fixed | 三行测试档已列（run.mjs 一行多余，见新条 15） |
| 11 | 11 | §2.7 B11 | 🟡 | Fixed | `mount-team.mjs:13` 现读「…；登出 ∥ 轮换两径零改）」；定稿双口径 + 轮换零改理由 |
| 12 | 12 | §2.7 B12 | 🔵 | Fixed | #1529 统一 −30 / +13 ⇒ 477；文档读数更正（本轮复读 RENDER-CORE 511 / MEMBER-AGENT 440） |
| 13 | 13 | §2.7 B13 | 🔵 | Fixed | 表 `audit_events` ✓、kind 入 detail（`box.mjs:121`）✓、json_extract 先例 `box.mjs:561` ✓、写入点 `:227`–`:234` ✓；库路径解析句本轮未复读（unverified，不阻塞） |
| 14 | (new) | §2.7 B6 | 🟡 | New | 「非导出 5 名随块搬入新档后仍不导出」与「其中 3 名仍被保留体使用 ⇒ 以 `import` 回用」相抵：非导出绑定不可 import，`flagsOf`/`excerptOf` 又属判据②「零本地定义」8 名 ⇒ 必由新档导出；正解 = 3 名导出供回用、`textOf`/`IGNORED_DIRS` 仍不导出 |
| 15 | (new) | §2.7 A1 ∥ B10 | 🔵 | New | `render-core/test/run.mjs` 的「+1 注册」不需要（跑器单层 glob `test/*.test.mjs` + 盘面自检，新档自动收集）；A1 新档 ≈174 少算 `./protocol.mjs` 侧 `capText`/`RESULT_SUMMARY_MAX` import 1 行 |

VERDICT: changes-required

计数：15 行 = 1 🔴（Unfixed）· 13 🟡/🔵 已闭 · 新增 1 🟡 + 1 🔵

### 轮次 3（评审子代理）

**第三轮（验修正轮 2 的 3 条 · 只核不狩猎）**

计数：前轮 15 行 = **15 Fixed**（含 🔴 1 条真落逐点复核）；新开 0 条（1 处 🔵 措辞残点记入第 14 行 Notes，不立链）。焦点两件：① `#1518` 非空 prefs 夹具 = **可执行、且两断言分别拦住「推了不记 / 记了不推」**；② `#1566` 导出面 16 行表 = **与「导出 14 / 私有 2」自洽，判据 ①（⊇14）与 ④（=11）不再相抵**。

| # | Orig# | File | Severity | Status | Notes |
|---|-------|------|----------|--------|-------|
| 1 | 1 | `2026-10-19-product-remainder.md` §2.7 A1 | 🔴 | Fixed | 本轮全档复读 §2.7 未改：移出块 `:49`–`:216` = 168、交付 655−168=487、+import/re-export ≈491、判据区间 `487–493` 且 < 500 均在位；源档坐标上轮实证（`core-run.mjs:188` 起 `listFilesOf`），本轮仅复读档面 |
| 2 | 2 | §2.7 A2 | 🔴 | Fixed | A2 未改（载体改 `i18n-{zh,en}-sandbox.mjs`、新键同址 zh:40 ∥ en:40、283→284）；该两档本轮未复读（unverified，上轮实证） |
| 3 | 3 | §2.7 A3 | 🔴 | Fixed | A3 未改：判据 `grep -cE '^\s*defaultModel:'` ⇒ 现盘 1 / 删后 0，并明写全文计数 = 2 不作判据 |
| 4 | 4 | §2.8 C1（原 §2.4 行 2） | 🔴 | **Fixed** | ① 判据全文已替换：`:287`–`:291` 非空 prefs 例（`seed = { provider: "anthropic", model: "claude-x" }`）断言载荷 `prefs` 深等复合 ∧ `lastPushedPrefs() === "anthropic:claude-x"`，`:292` 明写「两断言缺一不可」并点名两退形 ⇒ 「只验簿记 / 只验推载荷」两种退形各被一条拦住。② 夹具可搭：panel 假件够用（`settings.mjs:357:   panel?.webview.postMessage({ type: "providerStatus", keyOk, status: s })`，早退径前只此一处触 panel）；签名缺省 `prefsOverride = null`（`:393`）；空例载荷 `{}` 成立（`session-io.mjs:243:   try { return workspaceState.get("thincoder.modelPrefs") \|\| {} } catch { return {} }`）；两访问器实存（`:370` / `:377`）；配置缝实存且生效（`config-io.mjs:37: export function _setConfigPathForTest(p) { _pathOverride = p }` → `:39` → `config.mjs:30: function cfgPath() { return _configPath() }` → `:194`），invalid 态可达（`config.mjs:298:   merged.providerState = plan.state // ok ∥ fallback ∥ invalid`）；`settings.mjs:8`–`:23` 导入面无 `vscode` ⇒ node 测试可载 |
| 5 | 5 | §2.7 B5 | 🟡 | Fixed | 判据主句 + 上抛①「已裁·保留」均在位，本轮复读未见回退 |
| 6 | 6 | §2.7 B6 | 🟡 | Fixed | 相抵处以 §2.8 C2 定稿取代（见第 14 行） |
| 7 | 7 | §2.7 B7 | 🟡 | Fixed | hintKey 覆盖面 / 承载行原位 / 并存态 / `renderRemoveRunnerBody()` / Δ ≤+25 均在位；hintKey 双层语义仍靠散文（不阻塞） |
| 8 | 8 | §2.7 B8 | 🟡 | Fixed | 两文档行在位（131 `:19` ∥ 670 `:73`）；两档本轮未复读（unverified，上轮实证） |
| 9 | 9 | §2.7 B9 | 🟡 | Fixed | `panelWidth = 270` 缺省 + 两例同宽源在位 |
| 10 | 10 | §2.7 B10 ∥ §2.8 C3 | 🟡 | Fixed | 三行测试档在位；run.mjs 一行由 C3 改判「无需登记（Δ 0）」 |
| 11 | 11 | §2.7 B11 | 🟡 | Fixed | 「登出径同随动 ∥ 轮换径零改」+ 轮换零改理由在位 |
| 12 | 12 | §2.7 B12 | 🔵 | Fixed | −30 / +13 ⇒ 477、RENDER-CORE 511 / MEMBER-AGENT 440 在位；两文档本轮未复读（unverified） |
| 13 | 13 | §2.7 B13 | 🔵 | Fixed | `audit_events` / kind 入 detail / `json_extract` 先例 / 写入点在位；源档本轮未复读（unverified） |
| 14 | (new·上轮) | §2.8 C2 | 🟡 | Fixed | 定稿表 16 行与源档逐名相符：导出 11（`core-run.mjs:51/54/58/67/78/79/85/93/111/140/188`）+ 转导出 3（`FLAG_SETTERS:70` · `flagsOf:128` · `excerptOf:175`）= **14**；私有 2（`textOf:119` · `IGNORED_DIRS:82`）；回用坐标实存（`:253` · `:269` · `:369` · `:406`），`textOf` 仅 `:149`/`:179`、`IGNORED_DIRS` 仅 `:206`（皆随块搬出）⇒ 「仍不导出 ∧ 以 import 回用」的相抵已消除；判据 ① ⊇14 ∥ ④ 只约束 `core-run.mjs` 的 11 名 ⇒ 两判据不再相抵。🔵 残点（不立链、不阻塞）：C2 末条仍把 `flagsOf`/`excerptOf` 写作「（私有件）」，与「私有 2」字面不一致（语义 = 改前面，表格已明写「导出」） |
| 15 | (new·上轮) | §2.8 C3 | 🔵 | Fixed | ① 跑器免登记成立：`thincoder-render-core/test/run.mjs:81: const r = spawnSync(\`"${process.execPath}"\`, ["--test", "test/*.test.mjs"], { stdio: "inherit", shell: true })` + `:69`–`:78` 全档 `--check` 与空清单守卫 ⇒ 新档自动收集；② 新档 ≈175 与三条 import 清单成立（`core-run.mjs:39` 含 `readdirSync`、`:40` `join`、`:43` 含 `RESULT_SUMMARY_MAX, … capText`；搬出侧用点 `:164`/`:165`/`:181`/`:197`，保留侧仍用 `:271`/`:529` ⇒ 删名不删行、行数变动 0） |

VERDICT: pass

## §4 用户批准（主 agent）

### 批准（2026-10-19 · 父侧代签）

**批准依据**：用户 2026-10-19 11:10 逐字「都起。赶紧干完。」= 本批（及清账轮其余在办批）的**整批令**——覆盖「点火 → 设计 → 评审 → 实施」全链各步的启动权。

**代签说明（如实标注）**：本行由主 agent 代签，**不是用户逐条过目后的签字**。用户未见三轮评审明细；若用户对本批内容另有处置，**本行作废、按用户指令重走**。

**评审收敛结果**：设计评审三轮（首审 🔴4·🟡7·🔵2 → 修正 → 二轮 🔴1残余·🟡1·🔵1 → 修正 → 三轮 15 条全 Fixed）。**评审通过**（凭证值不入档）。

**实施拆分（按变更面，非按条目）**——一批七条分三舱并行，各舱文件域不重叠：

| 舱 | 条目 | 文件域 |
|---|---|---|
| 甲 | `#1566` `core-run.mjs` 拆分 | `thincoder-server/deploy/sandbox/member-shell/core-run.mjs` + 新建 `core-run-util.mjs` |
| 乙 | `#1518` 登出成拍推送 ∥ `#1528` 死键 | `thincoder-vscode/src/extension/{settings,panel-messages-settings,team-surface}.mjs` ∥ `thincoder-desktop/{src/main/session-flags.mjs,renderer/mount-team.mjs,renderer/mount-settings.mjs}` |
| 丙 | `#1519` 读败第三态 ∥ `#1529` 三态兼拆缝 | `thincoder-server/public/{views-sandbox,i18n-zh-sandbox,i18n-en-sandbox}.mjs` + 新建 `sandbox-remove-gate.mjs` ∥ `thincoder-render-core/composer/model-menu.mjs` + 新建三纯件 + 五档 i18n |

**`#1531`（原 `#1533`）真机项不入实施舱**：按 §1 裁定 3——`.6` 不可达即不交付、台账行保持未决，**不许降级为盘上模拟**。执行载体验证在实施前后台确认。

**`#1511` 文档面六处**（core 三档六处删括注、`_archive` 一处保留）由本舱之外的文档笔随批落，不占实施舱文件域。

## §5 实施记录（eng-coder）

### 实施记录 · 甲舱（`#1566` `core-run.mjs` 拆分）

**改动清单（本舱文件域 + 设计判定的随正件）**

| 文件 | 改动 | 读数 |
|---|---|---|
| `thincoder-server/deploy/sandbox/member-shell/core-run-util.mjs` | **新建**：`:49`–`:216` 整块搬入（八常/类 + 八纯函数），3 处 `export` 修饰（`FLAG_SETTERS` ∥ `flagsOf` ∥ `excerptOf`）；`textOf` ∥ `IGNORED_DIRS` 档内私有 | 180 行（split）/ 179（换行计数） |
| `thincoder-server/deploy/sandbox/member-shell/core-run.mjs` | 删 `:49`–`:216` 与随块 `join` 导入行；`:39` 去 `readdirSync` 名；`:47` import 回用 11 名；`:49`–`:52` re-export 原 11 名 | 491 行（split）/ 490（换行计数） |
| `docs/server/design/agent/MEMBER-AGENT.md` | §5 档账：新增 `core-run.mjs`（490）与 `core-run-util.mjs`（179）两行，聚合行移出 `core-run`（1960 → 1306）；§5 口径括注收正为「`\n` 个数；带末尾换行的档比 read 末行号少 1」 | 440 → 442 行 |
| `thincoder-server/public/box-shell/**` | 重打包（`node deploy/pack-box-shell.mjs`）：`ac8f85f4…` → `15b117e3…`，9 件 / 114176 字节，留 3 件回退窗 | 构建产物（不入 git） |
| `.thincoder/tmp/2026-10-19-core-run-split.test.mjs` | 定向单测 8 例（临时区——零留存；不入交付、不入任何门） | 8/8 pass |

**六项判据读数（本轮实跑）**

| 判据 | 命令 | 读数 |
|---|---|---|
| ③ 两档语法 | `node --check core-run.mjs` ∥ `node --check core-run-util.mjs` | exit 0 ∥ exit 0 |
| ④ 原档导出面逐名相等 | `import()` 取 `Object.keys(module).sort()` | 改前 13 名 ∥ 改后 13 名，逐名相等（11 名原导出 + `createCoreRun` + `loadCore`） |
| ① 新档导出 ⊇ 14 名 | 同上 | 14 名逐名命中（11 + `FLAG_SETTERS` / `flagsOf` / `excerptOf`） |
| ⑤ 新档私有 2 名 | 同上 | `textOf` ∥ `IGNORED_DIRS` 均不在导出面 |
| ② 原档 8 名零本地定义 | `grep "function <名>\|class <名>\|const <名>"` × 8 | 8/8 = 0 命中；re-export 行 `:49`–`:52` 在 |
| ⑤ 原档行数 | `split("\n").length` | **491**（判据区间 487–493 且 < 500） |
| ⑥ 壳工件版本变更 | `public/box-shell/manifest.json` | `15b117e3…` ≠ 改前 `ac8f85f4…` |
| ⑥ 定向单测 | `node --test .thincoder/tmp/2026-10-19-core-run-split.test.mjs` | tests 8 / pass 8 / fail 0 |
| 回归 | `node .thincoder/tmp/probe-parity-a.mjs`（改前 ∥ 改后各一次） | 18/18 ∥ 18/18 |
| 仓自带门 | `cd thincoder-server && npm test`（`node --test test/*.test.mjs`） | 0 例、exit 0（空绿——本仓无该面用例，如实标注） |

**决策披露**

1. **搬出块取 `:49`–`:216`（168 行）而非设计早期 `:51`–`:192`**——按 §2.7 A1 定稿；`:188` 起 `listFilesOf` `:216` 才收尾，照旧数切会把函数切两半。
2. **`join` 导入整行删除**（搬出后零用点；`.join("\n")` 是 `Array.prototype.join`）；该行在 C3 记为「行数变动 0」的口径下实际 −1 ⇒ 交付 491 仍落在 487–493。
3. **`core-run.mjs` 的 import 行一次携 11 名**（不只 C2 点名的 3 名）：`export { … } from` 不产生本地绑定，保留体用到的 8 名（`BOX_PROVIDER` ∥ `FLAG_KEYS` ∥ `ShellError` ∥ `slotOf` ∥ `withBoxProvider` ∥ `isToolFailureText` ∥ `projectMessages` ∥ `listFilesOf`）必须本地可引用；导出面与语义零变。
4. **定向单测落临时区**（`.thincoder/tmp/`）而非 `docs/batches/2026-10-19-product-remainder.test.mjs`：本批三舱并行，该批内件为共享写面，甲舱写它会与乙/丙舱互覆。该件档头已预告「甲 ∥ 乙舱用例由各自补入」——本条如实上抛（见下「待父侧」）。
5. **文档行号漂移未自改（越出本舱笔面）**：本改动使三处设计档坐标失效——`docs/core/design/API-CONTRACT.md:2878`–`:2890`（11 行符号坐标仍指旧档旧行；该区为生成器唯一笔，未手改）、`docs/server/design/agent/MEMBER-AGENT.md:58` ∥ `:434`（`core-run.mjs:233` 记作装配单点，实读装配点在 `:291`）、`docs/core/design/TOOLS.md:1306`（`core-run.mjs:237` 的 `loadConfig` 桥，现 `:73`）。设计档 = 设计席笔，故只报不改。

**内部审计 / 代码评审（轮次与终态）**

- **审计（explore · 只读对设计）1 轮**：9 条判项全「符合」，`VERDICT: clean`；附一处口径注（§5 换行计数 vs batch §2.7 的 split 口径，两者差 1 行，已由 §5 括注写明）。
- **代码评审（advisor `type=code` · 同步）1 轮**：`VERDICT: pass` —— 0 🔴；🟡 4 条全为**可选、非 must-fix**（生成区符号表随正 ∥ 档内两处行号 ∥ 批内件载体 ∥ 本档 §5/§6 空）；🔵 2 条（§5 行数口径疑似混用——复核为**误判**：两档均按 `\n` 口径，490 ∥ 179 与实读一致；原档头注未提新档——不改，拆出面以 `:47` import 与 §5 档账两处可见）。
- **fix round = 0**（无 must-fix 项）；终态 = **clean**。
- 评审提出的 4 条可选文档面项落本舱「待父侧」清单，随本批收口处置。

**待父侧（上抛·知会）**

1. `docs/batches/2026-10-19-product-remainder.test.mjs` 的 `#1566` 五腿由谁落（本舱用临时区件替代，理由见披露 4）。
2. 上列三处设计档坐标随正（API-CONTRACT 生成区建议整区重生成，勿手改）。

### 丙舱实施记录（`#1519` ∥ `#1529` · 2026-10-19）

**范围**：只做 §4 拆分表的丙舱两件。甲舱 `#1566`、乙舱 `#1518` / `#1528` 未触碰。

**改了什么（现行行数 = 交付后实测，口径 `split("\n").length`）**

| 文件 | 现行 | Δ | 内容 |
|---|---|---|---|
| `thincoder-server/public/sandbox-remove-gate.mjs`（新） | 31 | +31 | 判门纯件 `removeRunnerGate({ containerReachable, listedCount, workspacesOk, boundCount, boundConfirmed }) → { confirmDisabled, hintKey, retry }`；四态 + 并存态（读败键优先） |
| `thincoder-server/public/views-sandbox.mjs` | 365 | +22 | 工作区取数改返 `{ ok, listed }`（旧失败径 `() => []` 即病根：读败与无承载同值）；两取数 + 一次渲提为 `renderRemoveRunnerBody()`（重试钮复调、两取数重发）；读败 ⇒ 明示句 + 重试钮 + 删除钮先禁；容器三支 ∥ 承载工作区行 ∥ radio 原位保留；判门单源改纯件 |
| `thincoder-server/public/i18n-zh-sandbox.mjs` ∥ `i18n-en-sandbox.mjs` | 284 / 284 | +1 / +1 | 新键 `admin.sandbox.workspacesUnreachable`（与 `runnerUnreachable` 同址 `:41`） |
| `thincoder-render-core/composer/model-menu-state.mjs`（新） | 10 | +10 | `menuStateOf(models) → "loading" ∥ "empty" ∥ "list"`（三态判定单源） |
| `thincoder-render-core/composer/model-menu-labels.mjs`（新） | 16 | +16 | `PROVIDER_SHORT` + `shortName` 逐字搬移 |
| `thincoder-render-core/composer/model-menu-place.mjs`（新） | 23 | +23 | `computePlacement`（`panelWidth = 270` 缺省；零矩形 ⇒ 视口居中） |
| `thincoder-render-core/composer/model-menu.mjs` | 488 | −6 | 三态渲（`menuStateOf` 驱动；空表渲 `model.empty`、不渲分组）+ `place()` 退化为「取矩形 → 纯件 → 写样式」 |
| `thincoder-server/public/i18n-{zh,en}-core.mjs` | 146 / 143 | +1 / +1 | `model.empty` |
| `thincoder-desktop/renderer/i18n-composer.mjs` | 154 | +2 | `model.empty`（en ∥ zh 两块） |
| `thincoder-vscode/locales/{en,zh}.json` | 352 / 352 | +1 / +1 | `model.empty` |
| `docs/server/design/webui/SANDBOX.md` | 131 | ±0 | `:19` 删除节点弹窗句补第三态（明示句 + 重试钮 + 先禁 + 两行并存 + 体零 `confirm`） |
| `docs/server/design/sandbox/SANDBOX.md` | 670 | ±0 | `:73` 补一句：客户端读败 ⇒ 不携 `confirm` 且先禁（读败 ≠ 无承载）；服务端行为零改 |
| `thincoder-render-core/test/model-menu-pure.test.mjs`（新） | 50 | +50 | 六例（`menuStateOf` 3 ∥ `computePlacement` 3），跑器 `test/*.test.mjs` 自动收集 |
| `docs/batches/2026-10-19-product-remainder.test.mjs`（新） | 75 | +75 | `#1519` 六例（四态 + 并存态 + 旧三态逐值回归对照）；**本档当前只含丙舱部分**——甲 ∥ 乙舱补入，勿整档覆写 |

**六项判据读数**

① `removeRunnerGate` 四态 + 旧三态对照 —— `node --test docs/batches/2026-10-19-product-remainder.test.mjs` ⇒ **6 pass / 0 fail**（四态各一例 + 并存态一例 + 回归对照一例，后者覆盖 3 实况 × 3 承载数 × 2 勾选态 = 18 组，逐组与旧式 `boundCount > 0 && !boundConfirmed` 相等）。

② `menuStateOf` 三例 + `computePlacement` 三例 —— `cd thincoder-render-core && npm test` ⇒ **6 pass / 0 fail**。
零矩形 + 视口 1200×800 + `panelWidth: 270` ⇒ `left = 465`、`top = 400 − panelHeight/2`（面板中心落 `600,400`，偏差 0 ≤ 2px）；
正常锚回归例与旧式 `Math.max(4, Math.min(r.left, viewport.width − panelWidth))` 逐值相等；`up: true` ⇒ 翻上、下方无位亦翻上。

③ `thincoder-render-core/composer/model-menu.mjs` = **488** ≤ 500（设计预算 477，实差 +11，来源 = 三态 if/else 与接线注文；未越线）。

④ i18n 档数：`146 / 143 / 154 / 352 / 352`（+1 / +1 / +2 / +1 / +1）+ sandbox `284 / 284`（+1 / +1）—— 七档逐档实测。

⑤ `node --check` 全过：`views-sandbox.mjs` ∥ `sandbox-remove-gate.mjs` ∥ `model-menu.mjs` ∥ 三新纯件 ∥ `i18n-composer.mjs` ∥ 两个批内测试档；两 vscode locale JSON 解析通过。

⑥ doc gate：见 §5 末「门禁」行。

**偏离 · 上抛 · 遗留**

- **参数名**：取设计 §2.2③ 的 `containerReachable`；派单已知事实写 `runnerReachable`——两者同一物，按设计为准。
- **`hintKey` 的容器侧三键**在纯件中返回并受单测约束，渲面仍按容器实况内联取键：B7 的并存态要求「读败时 `hintKey` = 读败键、容器句照渲」，容器句因此必须另有键源。两处映射目前同值——设计内的固有张力，未改。
- **设计档漂移（归设计席笔，此处只报，未改）**：`docs/server/design/webui/SANDBOX.md:84` 文件账仍记 `views-sandbox.mjs` **342**（现读 365），§3 表缺新档 `sandbox-remove-gate.mjs` 行；`docs/render-core/design/RENDER-CORE.md:427` 记 `model-menu.mjs` **485**（现读 488），三新纯件未在输入面板族登记（B12 定「本批 0 改」⇒ 未动）。
- **桌面消费面**：`thincoder-desktop/node_modules/@thincoder/render-core/` 是物化副本（`scripts/materialize-deps.mjs`），盘上仍为改前版本 ⇒ 桌面侧到下次 `npm run package`（`prepackage` 前置物化）才拿到 `#1529`。本舱未跑物化（构建步骤，非源码面）。
- **遗留（评审 🟡 optional，未改）**：`createModelMenu` 读面初值把 `null` 压成 `[]`（`model-menu.mjs:310` `(state.models() ?? [])`；VSC 读面初值 `state.js:34 _models: []`）⇒ 首推候选到达前开菜单渲「无可用模型」而非「加载模型…」，`menuStateOf` 的 loading 支在仓内三个消费面均不可达。修点在端侧读面（VSC webview），超出本舱设计面 ⇒ 只报。

**自检轮次**：内部分歧审计 1 轮（explore 只读审计：产出 2 条低危——测试粒度 4→6 已改齐 ∥ `#1519` i18n 落点"§2.3 记 core 档"系 §2.7 A2 已改判 sandbox 两档，交付侧正确）；自修 1 轮（拆 `menuStateOf` 三例）；独立代码评审 1 轮（advisor · code，VERDICT pass，findings 6 条全 optional/🔵，均已按上「偏离 · 上抛 · 遗留」披露）。**终态 = clean**。

**门禁**：`doc_check(mode:"gate")` 见收口回执行（本行只记位置，读数以工具回执为准）。

### 5.1 交付摘要（乙舱 · 2026-10-19）

本舱 = 批档 §2.7 A3/A4 ∥ §2.8 C1 的 `#1518`（登出成拍补推模型候选面，V1/V2/V3/D1，C1 零动作）+ `#1528`（VSC 快照死键删除）。代码面与设计逐点一致；测试载体另立（见 5.4 ②）。

### 5.2 改动清单（坐标 = 改后实读）

| 档 | 改动 | 主坐标 |
|---|---|---|
| `thincoder-vscode/src/extension/panel-messages-settings.mjs` | 登出成径 +1 行 `panel._pushSettings()`（登录径同形） | `:283`（JSDoc 随正 `:274`–`:276`） |
| `thincoder-vscode/src/extension/team-surface.mjs` | `logoutFlow` 成径 +1 行 `_chatPanel?._pushSettings?.()` | `:152`（JSDoc 随正 `:121`–`:123` ∥ `:144`–`:145`） |
| `thincoder-vscode/src/extension/settings.mjs` | invalid 早退径由 `return` 改为 4 行体（prefs / `_lastModelsPayload` / `_lastPushedPrefs` / `postMessage {type:"models",models:[],prefs}`） | `:397`–`:404`（理由注 `:394`–`:396`） |
| `thincoder-vscode/src/extension/settings.mjs` | `agentSettings` 删死键两行（注 + `defaultModel: loadRaw().defaultModel ?? null`） | 原 `:172`–`:173`（文件现 435 行） |
| `thincoder-desktop/renderer/mount-team.mjs` | `logout()` 成径 +1 行 `onProvidersChanged?.()`；档头注两口径收正 | `:165` ∥ `:13` |
| `thincoder-desktop/renderer/mount-settings.mjs` | `deps.onProvidersChanged` 枚举句补「登出成」 | `:82` |
| 新增 `docs/batches/2026-10-19-product-remainder-1518.test.mjs` | 批内定向单测 6 例（V1 V2 V3空 V3非空 D1 `#1528`） | 全档 |

### 5.3 判据读数（派单五项）

① `#1518` 接线 + 定向单测：`node --test docs/batches/2026-10-19-product-remainder-1518.test.mjs` ⇒ **6 pass / 0 fail**（3471ms 那跑）。红-绿对照：分别摘掉 V1/V2/D1 三处接线与早退径簿记赋值、回填死键 ⇒ 5 例转红（V2 单摘转红 1 例），复原后全绿——断言非空过。

② 键位形：`grep -cE '^\s*defaultModel:' thincoder-vscode/src/extension/settings.mjs` ⇒ **0**。

③ 全文：`grep -c defaultModel` 同档 ⇒ **2**（`:69` ∥ `:70` 档头注；按 §2.7 A3 该形不作判据，未写成断言）。

④ `node --check`：五档（`settings.mjs` ∥ `panel-messages-settings.mjs` ∥ `team-surface.mjs` ∥ `mount-team.mjs` ∥ `mount-settings.mjs`）全部 exit 0、零输出。

⑤ gate 读数：`doc_check(mode:"gate", target=d:\teamcode\thincoder)` ⇒ **ERROR（引擎已更新——本会话进程加载的引擎早于盘上引擎档，须重启会话复跑）**；按工具语义 ERROR 不等于 PASS，本会话已无法取得 PASS 读数（非文档面命中）。不改写、不冒充。

### 5.4 决策披露（实现中三处判断，均由我作出）

① **`#1528` 落点以设计与验收为准**：派单文字写「删 `session-flags.mjs:172`–`:173`」，实读该档仅 96 行、无此键；设计 §2.1/§2.2④ 与验收 grep 都指向 `thincoder-vscode/src/extension/settings.mjs` 的 `:172`–`:173`，且该处内容逐字即派单所述（注 + `defaultModel: loadRaw().defaultModel ?? null`）⇒ 落 settings.mjs。

② **测试载体另立档**：设计 §2.7 B10 记 `docs/batches/2026-10-19-product-remainder.test.mjs`（≈140 行共用）；该同名档 `:9` 自写「本档当前只含丙舱（`#1519`）部分；甲 ∥ 乙舱的用例由各自补入，勿整档覆写」。三舱并行同档会互相覆盖 ⇒ 另立 `-1518` 后缀档；账目（§2.7 B10 载体句）已上抛父侧裁定。

③ **登出径保留 `_pushStatus()`**：设计 §2.2② 明写「`:281` 后插一行」，故保留既有 `_pushStatus()` 再补 `_pushSettings()`。代价 = `providerStatus` 背靠背双发一条（`fullStatus` 首行亦推），幂等、无功能后果；删除它 = 超设计范围，未删。

### 5.5 审计 ∥ 评审轮次与终态

- **自审**：五档逐行复读 + `node --check` ×5 + 两处 grep 读数 + 红-绿对照一次；注释与实装逐句核对（清掉 `team-surface.mjs` 原「登出径不合流」过期句）。
- **探索审计**（只读子代理）：一致 8 项；偏移 1 = `docs/core/design/TEAM.md` §2.8 仍写「退出（logout）——既有随动零改」（单源设计档，非本席笔，已上抛）；缺失 1 = §5 空（本节补上）；清单外 1 = 两探针档（已删）。`VERDICT: diverged`，全部落在文档 ∥ 账目面，代码面 0 PARTIAL ∥ 0 简化。
- **代码评审**（advisor · type=code）：🟡×2（§5 空 · 测试载体名与 B10 不一致）+ 🔵×3（全文计数写成断言 · D1 例时间基轮询 · `providerStatus` 双发）。`VERDICT: pass`。
- **自修**（1 轮内，≤5）：🔵 两条已修（删「全文 = 2」断言；D1 改 deferred 确定等到，超时仅作失败护栏，修后 6/6 仍绿）；🟡 两条归父侧（本节补 §5；B10 载体句上抛）。
- **终态：`clean`**（代码面偏移全部关闭；遗留 = 父侧文档 ∥ 账目两件）。

### 5.6 遗留（父侧处置）

1. `docs/core/design/TEAM.md` §2.8 的「退出零改」句与 `:104` 节名 ∥ `:201` AC-⑩ 需随正为「登录 ∥ 登出成径」（eng-designer 笔；批档 §2.3 未列该档）。
2. §2.7 B10 的测试载体句：并入同名档 ∥ 改为三舱各一档。
3. `doc_check` gate 需重启会话后复跑取 PASS 读数。

## §6 验证与收口（父代理）

### 收口（2026-10-19）

**角色表**：讨论 ∥ 收口 = 主 agent · 设计 = eng-designer（`#20`–`#22` 三舱共用的 §2 + 文档笔 `#27` 五档收尾）· 评审 = advisor ×2（首审 + 二轮）· 实施 = eng-coder ×3（甲 `#20` · 乙 `#21` · 丙 `#22`）。

**状态行**：三舱实施全完 · 文档面随正落定 · **已收口 2026-10-19**。

**三舱交付读数（逐舱实测）**：

| 舱 | 条目 | 读数 |
|---|---|---|
| 甲 | `#1566` | `core-run.mjs` **655 → 491**（回 500 线内）· 导出面 13 = 13 逐名相等 · 8 名零本地定义 · 新档导出 14 / 私有 2 · 定向单测 **8/8** · 回归 18/18 · 壳树重打包 · 审计 clean + 代码评审 pass + fix round 0 |
| 乙 | `#1518`+`#1528` | V1/V2/D1 三处接线 + `settings.mjs:397`–`:404` 四行体（`prefsOverride ?? loadModelPrefs` ∥ `_lastPushedPrefs` 同式）· 死键键位形 **0** / 全文 2（不作判据）· 单测 **6/6** + **红-绿对照实测** |
| 丙 | `#1519`+`#1529` | `removeRunnerGate` 四态 + 并存态 · 旧三态 **18 组逐组相等** · `menuStateOf` / `computePlacement` **6/6**（零矩形中心偏差 0 ≤ 2px）· `model-menu.mjs` 494 → **488** · 13 档 `node --check` 全过 |
| 文档 | `#27` | 五档坐标随正（`TEAM.md` 改判 + `MEMBER-AGENT.md:233→:291` + `TOOLS.md:237→:73` + `SANDBOX.md` 342→365 + `RENDER-CORE.md` 485→488）· 批档 §2.9 载体裁定 |

**修正轮落地前置**：三舱各自「审计 1 轮 + 代码评审 1 轮 + 自修 0/1 轮」，终态全 `clean`；无遗留 must-fix。

**搁置清单回核**：本批无搁置项。**暂缓批复核：无。**

**文档机检门**：会话内工具面 = `ERROR（引擎已更新）`（多批并行改过 `doc-check/**`，进程持有的引擎早于盘上档）；**新进程真读数 = 命中 0 条（锚 0 · 行宽 0）· 197 档**（实施全部落地后取得）。

**用户文档面同拍**：`TEAM.md` 三处（`:104` / `:127`–`:130` / `:204` AC-⑩）已由「退出零改」改为「登出成拍」+ 轮换仍零改并给依据——**与实装一致**。

**待办勾销**：`#1696`（`MEMBER-AGENT.md` / `TOOLS.md` 坐标随正）**已由 `#27` 落地** ⇒ 本批收口时勾销。

**前批遗留核对**：无（本批三舱同轮起、同轮收）。

**结算读数**：本批未决项 = 0；台账行按 `#1507` / `#1518` / `#1519` / `#1528` / `#1529` / `#1566` 六条核销（见台账面）。
