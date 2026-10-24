# 2026-10-15 · desktop 走查修复（raw 键 ∥ 模型选择归位）
> 六段 append-only，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 编制：主 agent · 2026-10-15 · 来源 = 用户 2026-10-15 23:34 desktop 走查：① attach/stop 按钮显示原始键（`toolbar.attachShort`/`toolbar.stop`）② 设置页模型选择应归会话界面；其他端同类排查。。
> 台账 = #1513（desktop · 归批）。前情 = 无（独立批）。
## §1 讨论（主 agent）
**状态行**：已收口 2026-10-19
<§1 模板占位：本批条目 / 关键判据 / 授权口径>

### 笔 1 · raw 键修复（轻通道 · 缺陷修复 · 主 agent 直接执行 · 2026-10-15 23:5x）

**披露**（笔前两发：初披露「desktop refresh ∥ VSC textContent」→ 读透后**重披露**扩大为核件级单源）：修法 = 核件 `applyWords` 词面重派生单源——创建期取词的五件（panel ∥ attach ∥ controls ∥ model-menu ∥ atmenu）全在词表之前跑，端侧点补只会继续漏下一处。射程 = core 5 ∥ desktop 2 ∥ VSC 1 ∥ 测试档 1；回滚 = revertable（逐文件可拆）。

**改动（9 档）**：
- 核件 `render-core/composer/panel.mjs`：创建期词面内联赋值抽为 `applyWords()`（input placeholder ∥ aria；send/abort title ∥ aria ∥ abort text）+ 组装四子件 applyWords；构造尾调用一次；句柄出新面 `applyWords`。
- 核件 `render-core/composer/attach.mjs`：`applyWords`（attach title ∥ aria ∥ text；paste-badge aria）。
- 核件 `render-core/composer/controls.mjs`：七钮 title ∥ aria 两层入 `WORDS` 表 + `applyWords`（末端 `applyModeButtons` 收口 plan 标题）；`planDefaultTitle` 快照退场 ⇒ 动态 `t("toolbar.planMode")`。
- 核件 `render-core/composer/model-menu.mjs`：两浮层 aria 入 `applyWords`。
- 核件 `render-core/composer/atmenu.mjs`：`#at-dropdown` aria 入 `applyWords`。
- desktop `renderer/mount-composer.mjs`：`refresh()` += `panel.applyWords()`（boot `initDict` 后既有调用点）。
- desktop `renderer/app.mjs`：帧分派 `locale` 支 += `composer.refresh()`（沿拖柄两处先例——语言切换词面随动）。
- VSC `webview/chat-messages.js`：i18n 到达点 += `composer.applyWords()`（+ import）。
- 单元测试档 `docs/batches/2026-10-15-desktop-walkthrough-fixes.test.mjs`（红/绿/幂等三测——用后即删）。

**走查（读数）**：
- ① 红面（根因复现）：空词表下创建 ⇒ `attach-btn.textContent = "toolbar.attachShort"` ∥ `abort-btn.textContent = "toolbar.stop"` ∥ placeholder = 键名（探针在案——挂载先于词表 + 重派生漏面，两因缺一不现）。
- ② 绿面（修后）：置词 + `applyWords()` ⇒ **24 项词面全量 = zh 值**（title ∥ aria ∥ textContent 三层）——探针通过。
- ③ 跑法 + 结果：`node --test docs/batches/2026-10-15-desktop-walkthrough-fixes.test.mjs` ⇒ **3/3 pass**；回归 `car2-aria-zh-probe`（置词先行径）⇒ **30/30**；冒烟 `b10-probe-appdom`（desktop boot 装载）⇒ **OK**。
- 真机目视 = 用户侧（重载桌面端：attach/stop 文本 ∥ 悬停题注 ∥ 语言切换；VSC 重载同——其停止钮原缺 textContent 重派生，同修）。

**冻结**：本笔冻结（改动 = 上述 9 档；后续补笔另起）。② 模型选择归位 = 独立条（非轻通道，候口径确认后另办）。

### 收口核定（2026-10-19 · 主 agent）

**本条 ② 是陈旧记录。** §1 原文「② 候口径确认」写于 2026-10-15；**口径用户当时已给**（23:34 走查原话：「② 设置页『模型』段（默认模型采用）应归会话界面」+ 23:53「认可」），且该 ② **已于 2026-10-16 由模型选择归位批落地**——决策单源 = `docs/desktop/design/SETTINGS.md` §1 **KD-80** ∥ §2.24 · 台账 `#1516` · 实施 = `docs/batches/2026-10-15-model-selection-pivot.md` §5 · 提交 `fa88fda5`。

**实读核验（设计席 2026-10-19 交付）**：设置页段闭集 = 七名（`settings.mjs:43`–`:51`，**无 `model`**）· 段体分派无 `model` 支（`:281`–`:297`）· `modelBody` 已删（余 `modelHeadNode:53` ∥ `modelChoicesTree:65` ∥ `modelRowNode:73` 唯一消费者 = 向导步 2 `onboarding.mjs:180`）· 两语 `settings.section.model` 已退 · 会话面控件 `#model-btn`（`render-core/composer/controls.mjs:46` ∥ `model-menu.mjs:339`）。三端对位（CLI `/model` ∥ VSC 会话面模型钮 ∥ 桌面 `#model-btn`）**现形已对齐**。

> 不适用：§3 —— 本批 `②` 无需新增设计（盘面已落）；本档无独立设计评审轮。`①` raw 键修复的评审读数见 §1 三绿行。

**教训（与今晚同族第五例）**：§1 一句「候口径确认」挂了两天，**而口径从来不需要确认**——它把「已给的口径」记成了「等确认」，于是活停在原地。**记录说得比事实慢，就是这一例的成因。**

## §2 批次任务与设计（eng-designer）
**状态行**：设计完成（② 已落地核验（KD-80 ∥ #1516），本批零新增设计）
<§2 模板占位：本批条目（覆盖） / 设计档落点 / 机制设计 / 受影响文件与测试覆盖 / 验收对照 / 关键决策 / 上抛项>

### 设计轮（eng-designer · initial · 2026-10-19）—— 结论：② **已落地**，本批零新增设计

**结论先给**：用户 2026-10-15 23:34 的 ②「设置页『模型』段应归会话界面」已由 **模型选择归位批**（`docs/batches/2026-10-15-model-selection-pivot.md` §5 · 2026-10-16 · 决策单源 = `docs/desktop/design/SETTINGS.md` §1 **KD-80** ∥ §2.24 · 台账 #1516）落盘并与源码一致。本批 §1「② 候口径确认」是 2026-10-15 的陈旧行——口径用户当时已给（KD-80 引原话 + 23:53「认可」）。本席不重做该设计：重做会与在盘实现重复，且要撤掉已生效的 KD-80。

#### 1 · 现状实读（`file:line`）

| 项 | 读数 |
|---|---|
| 设置页段闭集 | `thincoder-desktop/renderer/views/settings.mjs:43-51` = **七段** `providers ∥ agent ∥ mcp ∥ env ∥ tools ∥ models ∥ team`——**无 `model` 项**；段体分派 `:281-297` 无 `name === "model"` 支 |
| 「模型」段体 | `thincoder-desktop/renderer/views/settings-sections.mjs` 已无 `modelBody`；余 `modelHeadNode:53` ∥ `modelChoicesTree:65` ∥ `modelRowNode:73` 的唯一活消费者 = 首启向导步 2（`views/onboarding.mjs:180`） |
| 段名词键 | 两语 `settings.section.model` 已退（`thincoder-desktop/renderer/i18n-settings.mjs:5` 链文记载净退；本轮实读该键在现源码零出现） |
| 「models」段 ≠ 本项 | `views/settings.mjs:49` 的 `models` = **会诊与审查**段（consult ∥ advisor 行，`docs/desktop/design/SETTINGS.md` §2.1）——非默认模型选择面 |
| 会话界面模型选择 | 核件控件行 `#model-btn`（`thincoder-render-core/composer/controls.mjs:46`；两级菜单 `thincoder-render-core/composer/model-menu.mjs:339` 点击开）——桌面装配经 `thincoder-desktop/renderer/mount-composer.mjs` 注入；设计句 = `docs/desktop/design/COMPOSER.md` §2 ∥ `docs/desktop/design/UI.md` §1「撤会话头随动」（三值唯一居所 = 输入区控件行；**模型选择唯一入口面**） |
| 读面残留（KD-80 ③ 有意保留） | `settings.model` 切片 ∥ `loadModels` 供向导步 2 + agent 段子代理模型槽候选——非选择面，零触 |

#### 2 · 目标形 + 位置依据（三端对位表）

**说明**：`docs/core/design/TEAM.md` §2.5 是**三端「团队」面**同构表（入口 ∥ 字段 ∥ 登退 ∥ 状态 ∥ 设置面管理卡），不含模型选择——本批任务书把它当模型选择的位置依据，不成立。模型选择的对位单源 = `docs/desktop/design/COMPOSER.md` §2（桌面对位 = VSC 输入区）。

| 端 | 模型选择所在面 | 坐标 | 设置页有否模型选择控件 |
|---|---|---|---|
| CLI | 会话内 `/model` + TUI 模型候选 | `thincoder-cli/src/tui/cmd-model.mjs:8`（选定实变即同拍写回 `config.defaultModel`） | 无设置页 |
| VSC | 会话面输入区模型钮（两级菜单）；banner 钮重指同径 | `thincoder-vscode/webview/chat-messages.js:156`（`#model-btn` 同径开）∥ `docs/vsc/design/WEBVIEW.md` §4.8 | 零（Providers 卡「默认模型」行撤场，`settings-providers.js` 194⇒144） |
| 桌面 | 会话面输入区控件行 `#model-btn`（两级菜单） | `thincoder-render-core/composer/controls.mjs:46` ∥ `model-menu.mjs:339` | 零（七段，无 `model`） |

**判**：三端同为「会话面输入区 ∥ 命令」，设置页三端均零模型选择控件——**现形已对齐**，无需再搬。

#### 3 · 先例 ∥ 偏离

- **先例（沿袭）**：设置菜单组项收窄批（2026-10-02 · `docs/desktop/design/MENU.md` §1 **KD-67** ∥ `SETTINGS.md` §2.11）——菜单侧先撤「模型」入口，同方向。
- **偏离**：无。本席零新增设计 ∥ 零新增实现。

#### 4 · 受影响文件 + Δ

**零**。本批不写产品码；重做 ② 反而要撤 `thincoder-desktop/renderer/views/settings.mjs`（454 行）现七段闭集并恢复已删段体与词键——不建议。

#### 5 · 判据（可跑）

- **静态断言（本轮已跑 · 读数）**：读 `views/settings.mjs` 段闭集 === `["providers","agent","mcp","env","tools","models","team"]` ∧ 分派无 `model` 支 ∧ `i18n-settings.mjs` 无 `settings.section.model` ∧ `settings-sections.mjs` 无 `modelBody` ∧ `thincoder-render-core/composer/controls.mjs` 有 `model-btn` ⇒ **ASSERT PASS**。
- **DOM 断言（收口轮真机，命令沿 `docs/desktop/design/E2E-TESTING.md` §3.3 序 5）**：Electron 起桌面端 ⇒ 点 `#settings-btn` ⇒ 断言 `[data-settings] [data-section]` 的 `data-section` 列表 `=== ["providers","agent","mcp","env","tools","models","team"]`（设置页不再渲染「模型」段）∧ `[data-slot="composer"] #model-btn` 在场（会话界面在位）。`thincoder-desktop/test/run.mjs` 现仅收集 `files.mjs` ∥ `rc-resolve.mjs`，本断言属收口轮执行面。

#### 6 · 边界（不做）

不改模型选择行为与持久化（`defaultModel` 写面 = 会话选定写回 ∥ 向导「采用」∥ 迁移，KD-80 ②）· 不重排设置页其余六段 · 不动 `models`（会诊与审查）段 · 不动向导模型步 · 不动 VSC ∥ CLI。

#### 7 · 上抛

1. **[上抛·待裁] 前提被事实推翻**：② 已落地（KD-80 ∥ #1516 ∥ pivot 批 §5，提交 `fa88fda5`）。请裁本批 ② 的处置：按「已落地核验」结算，还是另给新口径（若用户仍见「模型」段，见第 2 条）。
2. **[上抛·知会] 陈旧打包件**：`thincoder-desktop/dist-r3` ∥ `dist-r4` 的 `resources/app.asar/renderer/views/settings.mjs` 仍含 `{ name: "model", word: "settings.section.model" }`——用户若跑的是这两个打包产物，看到旧段属预期；用户实际运行哪一份，本席未验（`unverified`）。
3. **[上抛·知会] pivot 批 §6 无内容**（`2026-10-15-model-selection-pivot.md:276` 起为空）——#1516 是否已结算需父侧核；本席不写他人段。

## §3 设计评审（评审子代理）
## §4 用户批准（主 agent）

### 用户批准（2026-10-15 / 2026-10-19）

**用户逐字（2026-10-15 23:34 桌面走查）**：① attach/stop 显原始键（`toolbar.attachShort` / `toolbar.stop`）② 「设置页『模型』段（默认模型采用）应归会话界面」。**23:53「认可」** = 两项方向均批准。

**2026-10-19 17:11「那就做啊！」** = 恢复推进授权（本批收口）。

**批准口径**：`①` 修 raw 键（词面重派生覆盖按钮标签）；`②` 模型选择归会话面——**该项已于 2026-10-16 由 pivot 批落地**（KD-80），本批只作完成核验，不重做。

## §5 实施记录（eng-coder）
## §6 验证与收口（父代理）

### 收口（2026-10-19）

**角色表**：讨论 ∥ 收口 = 主 agent · 设计 = eng-designer `#1`（2026-10-19 · 只作完成核验，零新增设计）· 实施 = 2026-10-15 轮（`①`）∥ 2026-10-16 pivot 批（`②`，`fa88fda5`）· 评审 = `①` 三绿读数 ∥ `②` 无独立轮。

**状态行**：两项均已完成 · **已收口 2026-10-19**。

**完成读数（逐项）**：

| 项 | 读数 |
|---|---|
| `①` raw 键修复 | 探针 **3/3** ∥ car2 回归 **30/30** ∥ appdom 冒烟 **OK**（2026-10-15 §1 记录） |
| `②` 模型段归会话界面 | **2026-10-16 pivot 批已落**（提交 `fa88fda5` · KD-80 · `#1516`）· 2026-10-19 实读复核：设置页七段无 `model` ∥ 段体分派无 `model` 支 ∥ `modelBody` 已删 ∥ 两语键已退 ∥ 会话面 `#model-btn` 在位 |
| 三端对位 | CLI `/model`（`cmd-model.mjs:8`）∥ VSC 会话面模型钮（`chat-messages.js:156`）∥ 桌面 `#model-btn`（`controls.mjs:46`）——**现形一致** |

**静态断言（本轮实跑 · 设计席交付）**：段闭集 === 七名 ∧ 无 `model` 支 ∧ 无 `settings.section.model` ∧ 无 `modelBody` ∧ 有 `model-btn` ⇒ **ASSERT PASS**。

**DOM 断言（收口轮真机，未跑）**：沿 `docs/desktop/design/E2E-TESTING.md` §3.3 序 5——起桌面端 ⇒ 点 `#settings-btn` ⇒ 断言段列表 === `["providers","agent","mcp","env","tools","models","team"]` ∧ `[data-slot="composer"] #model-btn` 在场。**如实记：本轮未跑真机**（`desktop/test/run.mjs` 只收集 `files.mjs` ∥ `rc-resolve.mjs`）；该项转 `#1709`。

**搁置清单回核**：三条上抛——① 前提被事实推翻 ⇒ 本档按「已完成核验」收口；② 陈旧打包件（`dist-r3`/`dist-r4` 的 `settings.mjs` 仍含 `{ name: "model" }`，用户跑旧产物会看到旧段）转 `#1709`；③ pivot 批 §6 空白 ⇒ `#1516` 结算状态待核，转 `#1709`。**暂缓批复核：无。**

**文档机检门**：`DOC-CHECK GATE: PASS`（本轮新进程引擎 · 范围含本档）。

**用户文档面同拍**：设置页不再有「模型」段 ∥ 会话面有模型选择钮——**与用户 10-15 走查诉求一致**。

**待办勾销**：`#1513` 随本批收口核销；`#1709` 挂收口同轮。

**结算读数**：本批未决项 = 1（`#1709`）。
