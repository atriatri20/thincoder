# 2026-10-15 · 模型选择归位（设置页→会话面 · desktop+VSC）
> 六段 append-only，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 编制：主 agent · 2026-10-15 · 来源 = 用户 2026-10-15 23:34 desktop 走查②「设置页上不应该出现模型选择，模型选择应该归会话界面，放在设置页上很别扭」→ 23:53「认可」（对默认方案：desktop 撤设置页「模型」段 + 输入区会话选定写回 `defaultModel`（沿 CLI 判据句 6）+ VSC 对位；咨询顾问/子代理模型槽保留）。。
> 台账 = #1516（desktop · 归批）。前情 = 无（独立批）。
## §1 讨论（主 agent）
**状态行**：🔄 进行中（…）
<§1 模板占位：本批条目 / 关键判据 / 授权口径>

### ② 模型选择归位（用户走查 + 认可 · 2026-10-15 23:34–23:53 · 主 agent）

**需求（用户原话）**：「设置页上不应该出现模型选择，模型选择应该归会话界面，放在设置页上很别扭。」
**口径（2026-10-15 23:53「认可」= 对默认方案的确认）**：desktop 撤设置页「模型」段（`views/settings.mjs:43-52` 段序第 2 段——默认模型采用表 `settings-sections.mjs:52/:71` → 写 `defaultModel`）＋ 输入区会话选定**写回 `defaultModel`**（沿 CLI 判据句 6——`thincoder-cli/src/tui/cmd-model.mjs:8`「选定实变即同拍写回 `config.defaultModel`」）＋ **VSC 对位**（其设置面同款默认模型项 `webview/settings-providers.js:60-125` + `ui.js:59-63` banner 钮）；**保留**咨询顾问/子代理模型槽（角色配置，非选择面）；CLI（/model 已是此口径）/webui（无该面）零动。
**边界**：不改 `session:prefs` 会话面语义（三值居所照旧——`UI.md:28`）；不新造机制（回写 = 沿 CLI 先例）；首启向导模型步不动。
**授权与序**：走全链（小设计 → 评审 → 用户批准 → 实施）。设计轮点火 = 待 #47（desktop 复核）窗口关闭——其冻面含 `UI.md`，避免写撞使其结算陈旧；点火后本批进「待设计」。

## §2 批次任务与设计（eng-designer）
**状态行**：设计完成 2026-10-15（eng-designer · 设计轮 initial：desktop 撤设置页「模型」段 + VSC 撤设置面默认模型行 + banner 钮重指会话菜单；决策单源 = docs/desktop/design/SETTINGS.md §1 KD-80 ∥ §2.24；零新机制）
<§2 模板占位：本批条目（覆盖） / 设计档落点 / 机制设计 / 受影响文件与测试覆盖 / 验收对照 / 关键决策 / 上抛项>

**状态行**：设计完成 2026-10-15（eng-designer · 设计轮 initial）

### 2.1 本批条目（覆盖）

| # | 条目 | 来源 |
|---|---|---|
| 1 | **desktop 撤设置页「模型」段**——`SECTIONS` 八 ⇒ 七（`thincoder-desktop/renderer/views/settings.mjs:45` 去项）· 段体分派支去（`:287`）· `modelBody` 净删（`renderer/views/settings-sections.mjs:98-101`）· 词键 `settings.section.model` 两语净退 | 台账 #1516 ∥ §1 ② |
| 2 | **desktop 会话选定写回 `defaultModel` 回归锁**——零新机制（既有链：`src/main/agent-host.mjs` `setPrefs` ⇒ `src/main/settings.mjs` `carryoverDefaultModel`） | 同上（判据单源 = `docs/core/design/SESSION.md` §6.21 判据句 6） |
| 3 | **VSC 撤设置面「默认模型」行**——行 HTML + `_setDefaultModel` + `_defaultModelMenu` + 绑定 + `saveAgentSettings` 载荷支 + 词键四退（两语） | §1 ②「VSC 对位」 |
| 4 | **VSC banner 动作钮重指会话级模型菜单**（原指向设置面 ⇒ 撤行后成死端） | 派生（决策单源 = `docs/desktop/design/SETTINGS.md` §1 **KD-80** ⑤） |

**本批不做（显式排除）**：咨询顾问 ∥ 子代理模型槽（角色配置，非选择面）∥ 首启向导模型步 ∥ `session:prefs` 三值居所语义 ∥ 核 ∥ CLI ∥ webui ∥ 迁移面；**不新造机制**（零新 IPC ∥ 零新推送 ∥ 零新载荷键 ∥ 零新变量 ∥ 零新 CSS）。

### 2.2 设计档落点

- **决策单源 = `docs/desktop/design/SETTINGS.md` §1 KD-80 + §2.24**（面形撤场 / 保留面点名 / 闭集随动 / 写面 / UI 决策 / VSC 对位 / 受影响文件十行 / 判据 / 边界）。
- **随正面（本批改变事实的句，均已改）**：`SETTINGS.md`（§1 KD-68 ③④ ∥ KD-75 ② ∥ §2.1 设置面行 ∥ §2.15 消费面 ∥ §2.16 项 5 ∥ §3.1 三行 ∥ §4 验收块 ∥ §5 T-DSK71 + T-DSK64 ∥ §6 DM/DN）、`MENU.md`（§1 KD-65/KD-67 + §4 验收三句）、`IPC.md`（§2 会话级偏好注边界 + 设置族注 8①）、`COMPOSER.md`（§2 两处）、`UI.md`（§1 输入区行）、`E2E-TESTING.md`（§3.2 侧证 + §3.3 第 5/6 步 + §6 用例行）、`PROJECT.md`（§7 T-DSK27 行）、`PACKAGING.md`（§2.8.1 官网段列）、`WEB-QUICKCHECK.md`（§3.2 通道表行）；`SHELL.md:78` 实读已「七段」⇒ 零改。
- **VSC 侧**：`docs/vsc/design/SETTINGS.md`（§1 Providers 行 + §2.2 入口面 + §2.3 载荷面 + §2.16 ④ ↔ 标题「扩面四件 ⇒ 三件」+ §5 U-S15/U-S16）、`docs/vsc/design/WEBVIEW.md` §4.8（§4.10 会话写回链零改）、`docs/vsc/design/WEBVIEW-PROTOCOL.md`（`saveAgentSettings` 行发点收窄）。

### 2.3 机制设计（要点）

1. **撤场范围 / 保留面（点名）**——删：`SECTIONS.model` 项 ∥ 段体分派 `model` 支 ∥ `modelBody` ∥ `settings.section.model` 词键。**保留**（消费面仍在）：`modelHeadNode` ∥ `modelChoicesTree` ∥ `modelRowNode` ∥ `modelIdOf` ∥ `useModel` 出口 ∥ `loadModels` ∥ `settings.model` 切片 ∥ `SETTINGS_KEYS`——消费 = 首启向导步 2 + agent 段子代理模型槽候选 ∥ advisor 档枚举。
2. **闭集随动（零枚举改：全自 `SECTIONS` 派生）**——`SCOPES` 十一 ⇒ **十**（`renderer/mount-settings.mjs:59`）；`MODAL_READS` 八 ⇒ **七行**（同档 `:66-73` 去 `:67` `model: loadProviders`）；菜单闭集 `SETTINGS_GROUPS` 六名**零动** ⇒ 漂移检测句改为「≡ `SECTIONS` 名序去「团队」」；菜单词投影枚举 `SETTINGS_SECTION_KEYS`（`src/main/menu-words.mjs:13`）本就不含 `model` ⇒ 词键净退无副作用（实读）。
3. **写面（零新机制）**——`defaultModel` 三处：会话选定写回（既有）∥ 向导模型步「采用」（`renderer/mount-settings-exits.mjs:165` `useModel`——设置页消费面撤场后唯一视图出口；其失败串 scope 字面由 `model` 改 `panel`）∥ 迁移（核）。`loadProviders`（内含 `loadModels`）开面 ∥ 复读链**零改**。
4. **VSC 对位**——撤行四件（行/hint ∥ 两函数 ∥ 绑定 ∥ 载荷支+探支）；banner 钮重指 = **复用模型钮开径**（`onChoose` ⇒ 会话模型钮点击，单一开径零第二实现；注入点 `webview/chat-messages.js:156`）⇒ 选定走既有 §4.10 写回链。

### 2.4 受影响文件与测试覆盖

（十行文件账 = `docs/desktop/design/SETTINGS.md` §2.24 项 6——desktop 五档 + VSC 四档 + 单元测试档；VSC 侧 `settings-providers.js` 194 ⇒ ≈140 ∥ `settings-panel-write.mjs` 224 ⇒ ≈216。）
**测试覆盖**：desktop 单元测试档（拟 · 五用例：段闭集七段 ∥ `SCOPES` 十 ∥ `MODAL_READS` 七行 ∥ 段体分派零 `model` 支 ∥ 词键零残）；VSC 单元测试档（拟 · 三用例：卡树零 `#prov-defaultmodel-row` ∥ `_defaultModelMenu` 零在场 ∥ banner `onChoose` 指向会话菜单）。两档**随批留存 · 用后即删**，不进集成测试树；集成面零新增（本批零业务链改——`T-DSK27` 段序断言随正，真机用例 = T-DSK71）。

### 2.5 验收对照（条目 ↔ 判据）

| 条目 | 判据（机检 ∥ 真机） | 载体 |
|---|---|---|
| 1 desktop 撤段 | 段序 = 七段（`["providers","agent","mcp","env","tools","models","team"]`）；零 `[data-section="model"]` 节点 ∥ 零空段壳 | 单元测试档 + T-DSK71 ①⑤ |
| 2 会话选定写回 | 选定后 `config.json` `defaultModel` 同拍在场；系统回声 ∥ 同值重选零写 | T-DSK71 ②③（回归锁） |
| 3 VSC 撤行 | 卡树零 `#prov-defaultmodel-row`；`_defaultModelMenu` / `saveAgentSettings{defaultModel}` 零在场；两语键集相等 | VSC 单元测试档 |
| 4 VSC 钮重指 | fallback 态点钮 ⇒ 会话模型菜单在场（锚 = 模型钮）⇒ 拾取 ⇒ 槽写 + `defaultModel` 回写 | VSC 冒烟 +

三维一致：本表条目 = §2.24 验收 = 需求回指（`docs/desktop/requirements/COMPOSER.md` D6 会话选定写回 ∥ 需求卷 `SETTINGS.md` D37/D39 信息架构）。

### 2.6 关键决策（含被否备选）

- **KD-80 ①–⑥**（全文 = `docs/desktop/design/SETTINGS.md` §1）；**否决**：① 保留设置页模型段仅补写回（用户明言设置页不应有该面）② 并撤向导模型步（向导非设置页；首启无会话 ⇒ 会撤掉首启唯一模型选定面）。
- **VSC banner 钮处置**：取「重指会话级模型菜单」（由 = 撤设置面模型面后原指向成死端；用户定音即「模型选择归会话界面」）；**否决**：罢钮（留提示句无动作）∥ 保留指设置面（死端）。
- **VSC `defaultModel` 载荷支净删**（而非留作兼容）：消费面唯一生产者（`settings-providers.js:58`）已撤 ⇒ 零残件纪律；契约面随正落 VSC §2.3。

### 2.7 上抛项

1. **[上抛·待裁] DM — 需求卷段数口径需主 agent 回笔**：需求卷 `SETTINGS.md` D37 ∥ D39 记「设置面全**七**段」（D39 并写「设置页面七段零动」），而设计档现值 + 盘面均为**八段**（含「模型」段）——**本批前即相抵**（实读：`views/settings.mjs:44-51` 八项）。本批撤「模型」段后页面 = 七段，仅当需求句「七段」原义 = 「不含模型段的其余各段」时两档自洽。请主 agent 核口径并回笔（需求档笔 = 主 agent；本席不写需求档）。本席侧已按「页面七段」落定（KD-80）。
2. **[上抛·待裁] 需求侧本批条目登记**：需求卷无本批条目行（现状 = D6/D37/D39 三处间接承载）；请主 agent 记「模型选择归位」条目（新增 ∥ 并入 D37/D39）。
3. **[上抛·知会] DN — VSC banner 钮重指 = 派生裁定**（已按 KD-80 ⑤ 落设计，含被否备选）；如需改「罢钮」请裁。
4. **[上抛·知会] 台账**：本批 = #1516（待讨论）；状态迁移与核销 = 主 agent 笔（同走查批 #1513 亦在途——两条同源、边界不同：本批 = 模型选择归位，另批 = 工具条 raw 键）。

### 2.8 写后自检读数（三机检对拍）

1. **引文集 ↔ 标题集**：本批所引 `§N` 逐条实读在盘——desktop `SETTINGS.md` §1（KD-80 / KD-68 / KD-75）∥ §2.1 ∥ §2.15 ∥ §2.16 ∥ §2.24 ∥ §3.1 ∥ §4 ∥ §5 ∥ §6（DM / DN）；`MENU.md` §1 / §4；`IPC.md` §2；`COMPOSER.md` §2；`UI.md` §1；`E2E-TESTING.md` §3.2 / §3.3 / §6；`PROJECT.md` §7；`PACKAGING.md` §2.8.1；`WEB-QUICKCHECK.md` §3.2；VSC `docs/vsc/design/SETTINGS.md` §1 / §2.2 / §2.3 / §2.16 / §5；VSC `WEBVIEW.md` §4.8 / §4.10；需求卷 `docs/desktop/requirements/COMPOSER.md` D6 ∥ `docs/core/design/SESSION.md` §6.21。**本轮修掉两处自引缺陷**：§2.24 项 7 原引「§4 VSC 块」（§4 无此节）⇒ 改引 VSC 档实坐标；`modelBody` 行域原记 `:98-101` ⇒ 改 `:99-101`（实读函数首行 = `settings-sections.mjs:99`）。
2. **表行 ↔ 计数**：§2.24 项 6 表 = **10 行**（§2.4「十行文件账」相符）；§4 验收块「五用例」= 列 5 项；§2.4 desktop 五 ∥ VSC 三 ↔ §2.24 行 10 所列（5 ∥ 3）相符；§2.1 条目 **4 行** ↔ §2.5 验收 **4 行** 逐条 1:1；VSC §2.16 标题「扩面**三**件」↔ 删后余三件（实读 bullets = 拉取失败不可存 ∥ 硬编码串入表 ∥ API Key）。
3. **断言 ↔ 读数（本批新测，非记忆）**：`SECTIONS` 八项（`thincoder-desktop/renderer/views/settings.mjs:44-51`，`model` 在 :45；段体分派支 :287）∥ `SCOPES` = `SECTIONS` + 三常量 = **11** ∥ `MODAL_READS` **八行**（`mount-settings.mjs:66-73`；`model: "loadProviders"` 在 :67）∥ 菜单词投影枚举 `SETTINGS_SECTION_KEYS`（`src/main/menu-words.mjs:13`）= **六名**（不含 `model` ⇒ 删词键零副作用）∥ `settings.section.model` 仅在 `renderer/i18n-settings.mjs:38 / :129` 两语定义、零其他消费 ∥ VSC `saveAgentSettings {defaultModel}` 唯一发点 = `thincoder-vscode/webview/settings-providers.js:58` ∥ VSC banner `onChoose` 注入点 = `thincoder-vscode/webview/chat-messages.js:156` ∥ 行数（口径 = 实读行数 − 1 尾空行，与在册文件账同口径）：`views/settings.mjs` 455 ∥ `views/settings-sections.mjs` 102 ∥ `mount-settings.mjs` 307 ∥ `mount-settings-exits.mjs` 313 ∥ `i18n-settings.mjs` 209 ∥ VSC `settings-providers.js` 194 ∥ VSC `settings-panel-write.mjs` 224 ∥ VSC `locales/*.json` 各 350。
4. **§2.5 表行 4 补正**（上条发文截断）：VSC 钮重指条目的载体 = **VSC 单元测试档 + 冒烟（`thincoder-vscode/test/files.mjs` 清单内档）**。

### 2.9 修正记录（fix 轮 · 评审 #66 轮次 1 · 1–11 逐号落 · 12 父裁不动）

**🔴 1 核定证据（开轮实读 · `node -e` 读盘）**：`thincoder-desktop/renderer/mount-settings.mjs` —— `MODAL_READS` 表 = **11 行**（`:66-76`：`providers` / `model` / `agent` / `mcp` / `env` / `tools` / `models` / `team` + 三添加弹窗组常量行 `providerAdd` / `mcpForm` / `consultAdd`）；`model: "loadProviders"` 在 `:67`；`SCOPES`（同档 `:59`）= `SECTIONS` **8 名** + 三常量 = **11**（与 `MODAL_READS` 同行数）；`SECTIONS` 实读 = `thincoder-desktop/renderer/views/settings.mjs:43-52`（`model` 在 `:45`）。
⇒ **正解 = 十一 ⇒ 十**（本批去 `model` 一行 / 一名）。三处「八 ⇒ 七」= 旧基数（`MODAL_READS` 行数与 `SCOPES` 名数逐轮同值：KD-75 七⇒八 ∥ §2.18 八⇒十 ∥ §2.21 ⇒十一）。
**四处数值已改齐**：`docs/desktop/design/SETTINGS.md` §1 KD-80 ④（`:31`）∥ §2.24 项 2（`:395`）∥ §3.1 `mount-settings.mjs` 行（`:443`）∥ §4 模型选择归位批机检（`:486`）+ §2.24 表行 3（`:405`）∥ 行 11（`:413`）。同句「皆自 `SECTIONS` 派生」已改为「`SCOPES` 自 `SECTIONS` 派生 + 三添加弹窗组常量；`MODAL_READS` 逐组指名表」。

**逐号落表（号 → 改动 `file:line`）**

| 号 | 改动落点 |
|---|---|
| 1 🔴 | `docs/desktop/design/SETTINGS.md:31`（KD-80 ④）· `:395`（§2.24 项 2）· `:443`（§3.1 行）· `:486`（§4 机检）· `:405`（§2.24 行 3）· `:413`（§2.24 行 11）——`MODAL_READS` 「八 ⇒ 七行」⇒ **十一 ⇒ 十行**；「皆自 `SECTIONS` 派生」⇒「`SCOPES` 自 `SECTIONS` 派生 + 三常量；`MODAL_READS` 逐组指名表」 |
| 2 🟡 | `SETTINGS.md:26`（KD-75 ②「等价路径 = 模型段「采用」」⇒ 向导模型步）· `:89`（§2.5 项 3 去「模型」条，「其余六段」⇒「其余五段」）· `:114`（§2.9 项 3 域半边改指 §2.24）· `:121-122`（§2.10 项 2 复用链去 `modelBody` / 「模型」）· `:131-132`（§2.11 现值十名 / 十组）· `:174`（§2.14 去「设置面「模型」段」）· `:303-304`（§2.21 第 8 段 ⇒ 第 7 段 ∥ `SCOPES` 派生十）· `:491`（§4 收窄批十名）· `:498`（§4 团队段七段 / 十）；`docs/desktop/design/MENU.md:86 · :89 · :90 · :145`（十一名 ⇒ 十名）；VSC 清单补记 = 本记录末「随正面补记」 |
| 3 🟡 | `SETTINGS.md:399`（项 6 增口径句）· 表新增行 6 = `store.mjs` **374 ⇒ 374**（结构不变 · `settings.modal` 闭集注释十一 ⇒ 十随正——实读 `:117`）· 行 10 = locales **353 ⇒ ≈349**；全表统一「现行 ⇒ 预期」（`:401-414`） |
| 4 🟡 | 口径定死一处 = **内容行数（文末换行不计）**（`SETTINGS.md:399`）；本记录末「批档侧数值更正」给出批档 §2.8 / §2.1 旧读数 / 旧坐标的更正值；`modelBody` 行域 = `settings-sections.mjs:99-101`（§2.24 `:393` 已是此形） |
| 5 🟡 | 批档 §2 补先例行 = 本记录末「先例行」 |
| 6 🟡 | 批档 §2 补调查证据行 = 本记录末「调查证据行」 |
| 7 🟡 | `SETTINGS.md:413`（行 11）+ `:486`（§4）——两档测试档留存措辞统一 = **用毕即删（零留存）** |
| 8 🟡 | `SETTINGS.md:414`（新增行 12——本批触及的在册机检族零留存无留档 · 无变红面 · 档头注 + 收口互指） |
| 9 🔵 | `SETTINGS.md:413`（行 11 增**写回链**用例 ⇒ desktop **六用例**）+ `:486`（§4 六用例） |
| 10 🔵 | `SETTINGS.md:416`（判据段注册段节点锚 = `data-section`——实读 `thincoder-desktop/renderer/views/settings.mjs:264` ⇒ `[data-section="model"]` 零在场断言非空判） |
| 11 🔵 | `docs/vsc/design/SETTINGS.md:33`（§2.2 决策单源 + 理由行）· `:38`（§2.3 决策单源）· `docs/vsc/design/WEBVIEW.md:207`（§4.8 钮重指决策单源 + 理由行） |
| 12 🔵 | **未动**——父裁：批档 §2 append-only（两条状态行不可删；后续轮不再产生第二条） |

**先例行（第 5 条补）**
- 撤设置面「模型」段：先例 = 设置菜单组项收窄批（2026-10-02——菜单侧同方向撤「模型」入口，`docs/desktop/design/MENU.md` §1 KD-67 ∥ `SETTINGS.md` §2.11）；实现坐标 = `thincoder-desktop/renderer/views/settings.mjs` `SECTIONS`（`:43-52`）；设计档节 = `docs/desktop/design/SETTINGS.md` §1 KD-80 ∥ §2.24。**沿袭**。
- 会话选定写回 `defaultModel`：先例 = CLI `thincoder-cli/src/tui/cmd-model.mjs:8`「选定实变即同拍写回 `config.defaultModel`」（判据句 6）；设计档节 = `docs/core/design/SESSION.md` §6.21 判据句 6 ∥ `docs/desktop/design/IPC.md` §2「会话级偏好注」项 8。**沿袭**（零新机制——既有链）。
- VSC 撤设置面「默认模型」行：先例 = 三端 provider 配置面对齐批（2026-10-07——桌面照 VSC 源）；本批反向（桌面为准、VSC 对位）；设计档节 = `docs/vsc/design/SETTINGS.md` §1 Providers 行 ∥ §2.2。**偏航（有意）**：由 = 归位方向由用户定音（会话面为唯一来路），三端同处置。
- VSC banner 钮重指会话级模型菜单：**偏航（有意）**——由 = 撤设置面模型面后原指向（`openSettings`）成死端；单源 = `SETTINGS.md` §1 KD-80 ⑤ ∥ `docs/vsc/design/WEBVIEW.md` §4.8（原句「钮不开会话级模型菜单」随本批翻转）；被否备选 = 罢钮 ∥ 保留指设置面。
- 首启向导模型步：**无先例**（不撤——向导非设置页）。

**调查证据行（第 6 条补）**
- 查过 = 仓内公共源档（`docs/**` 需求 / 设计 / 批档——本批已逐档实读，见批档 §2.8 项 1「引文集 ↔ 标题集」对拍）；`PROJECT-MANIFEST.json` `index.publicRepos` = **空** ⇒ 无声明仓外源。
- 仓外参考系（`D:\ref\`：`kimi-code` / `MiMo-Code` / `opencode` / `oh-my-pi` / `openclaw`——`AGENTS.md` 述）**未列入声明源** ⇒ 按「仓外源按声明读」纪律本批未采。
- 结论 = **无相关外部公共源项**（本批 = 本仓设置面 / 会话面归位，跨端对位面皆住本仓设计档）。

**随正面补记（第 2 条补 · VSC 清单）**：`docs/vsc/design/SETTINGS.md:412`（「默认模型行撤场后 `settings-providers.js` 不再发 `saveAgentSettings`」）亦属本批已改句，补入 §2.2 随正面清单。

**批档侧数值 / 坐标更正（第 1 / 4 / 7 条补 · 原行不改，以本记录为准）**
- §2.3 项 2「`MODAL_READS` 八 ⇒ 七行（`:66-73`）」⇒ **十一 ⇒ 十行（`mount-settings.mjs:66-76`）**。
- §2.4「desktop 单元测试档 … `MODAL_READS` 七行」⇒ **十行**。
- §2.8 项 3「`MODAL_READS` **八行**（`:66-73`）」⇒ **十一行（`:66-76`）**。
- §2.8 项 3 行数（口径 = 实读行数 − 1 尾空行）：455 / 307 / 102 / 313 / 209 ⇒ **454 / 306 / 101 / 312 / 216**（与 §2.24 / §3.1 同口径）。
- §2.1「`modelBody` 净删（`settings-sections.mjs:98-101`）」⇒ **`:99-101`**。
- 「十行文件账」随新增 `store.mjs` 行 ⇒ **十一行**（desktop 六档 + VSC 四档 + 单元测试档）；VSC 侧现行读数（内容行数口径）= `settings-providers.js` **193**（非 194）∥ `settings-panel-write.mjs` **223**（非 224）。
- 测试档留存措辞 = **用毕即删（零留存）**（§2.4「随批留存 · 用后即删」与 §2.24 行 10「随批留存」同此）。

**新增发现（本记录 · 非驳回项，供父侧路由）**
1. `thincoder-desktop/renderer/i18n-settings.mjs` 实读 = **216 行**（`settings.section.model` 两语 = `:38` / `:133`）；设计轮记 208、批档 §2.8 记 209，**两者皆与实读不符**（差 7 / 8）。该档在工作树中处未提交修改态 ⇒ 数值随实现复读。
2. 工作树现态：`docs/desktop/design/SETTINGS.md` / `MENU.md`、`docs/vsc/design/SETTINGS.md` / `WEBVIEW.md` 皆处**未提交修改**态；`SETTINGS.md` 在本次作业期间由外部增 1 行（549 ⇒ 550）——本记录坐标以实读为准。

### 2.25 修正记录（fix 轮 · 轮次 2 · 两条扫漏 ① ② 逐号落）

**改法择定 = 前者（改后事实 = 七段）**：normative 面留旧值 = 检索污染源（Doc discipline D8 / D10），故两处一律改为改后事实，不采「as-of 批前」标注。

| 号 | 改动 `file:line` | 旧 ⇒ 新 |
|---|---|---|
| 1 🟡 | `docs/desktop/design/SETTINGS.md:24`（§1 KD-68 ④ 闭集关系句） | 「`SECTIONS`（视图单源，**八段**）」⇒「（视图单源，**七段**）」——与同句后半「校验面 `SCOPES` = 十名（七段名 + …）」及 KD-80 ①（`:31`）/ §2.24（`:393`）/ §4 机检（`:486`）同值 |
| 2 🟡 | `docs/desktop/design/SETTINGS.md:3`（档头） | 「设置面板（**八段**） / 首启向导 / 渠道族形态 / **模型 /** agent 参数 / …」⇒「设置面板（**七段**） / 首启向导 / 渠道族形态 / agent 参数 / …」——段数改七段；「模型」板块面项净删（本批撤场面，「模型清单段」= models 段保留、零动） |

**回读读数（改后实读）**：`:3` = 「设置面板（七段） … agent 参数 … 模型清单段 …」；`:24` = 「`SECTIONS`（视图单源，七段）」；两者与 `:31` / `:393` / `:486` 三处「七段」同值。同档其余「八段」出现仅存 `:548`（§6 **DM** 行「设计档现值与盘面均为**八段**」）——该句为 DM 披露行内对「本批前」旧态的 as-of 述事（DM 判据本身即「批前计数相抵」），不在本轮受理两条内，未动。

**范围**：只动上述两处；机制面 ∥ §2.24 落点表 ∥ 其余扫漏面零触。批档 §2 append-only（原行不改，更正以本记录为准）。

### 2.26 修正记录（fix 轮 · 轮次 3 · 词键四退 ⇒ 三退）

**裁定（父侧）**：§2.24 项 5「词键四退」与同档 `docs/desktop/design/SETTINGS.md` §1 **KD-80** ⑥ 零触保留面自相抵——`settings.pickModel` 在保留面上有活消费者 ⇒ 改「**四退 ⇒ 三退**」，**保留 `settings.pickModel`**；另三键（`settings.defaultModel` ∥ `.defaultModelTitle` ∥ `settings.pickModelEmpty`）唯一消费者在撤场行内 ⇒ 照删。KD-80 ⑥ 边界句不改（本裁即按其判）。

**实读读数（2026-10-16）**
- `thincoder-vscode/webview/settings-consult-dialog.js:79` = `pickBtn.textContent = t("settings.pickModel")`（会诊添加弹窗选模型钮——保留面）。
- `thincoder-vscode/webview/settings-models.js:124` = `btn.textContent = provider && model ? labelFor(provider) + " · " + model : t("settings.pickModel")`（模型槽钮文案——保留面，顾问 ∥ 会诊槽共用）。
- 另三键（本仓全档实读）：仅 `thincoder-vscode/locales/{en,zh}.json` 定义（en `:126` ∥ `:127` ∥ `:292`；zh `:126` ∥ `:127` ∥ `:292`）——零其他消费（撤场行已在盘上撤除）。
- `settings.pickModel` 两语定义 = `locales/en.json:291` ∥ `zh.json:291`；三键退场后两语内容行数 = 353 ⇒ **350**（实读 353）。

| 号 | 改动 `file:line` | 旧 ⇒ 新 |
|---|---|---|
| 1 | `docs/desktop/design/SETTINGS.md:398`（§2.24 项 5） | 「词键**四**退 × 两语（`settings.defaultModel` ∥ `.defaultModelTitle` ∥ ~~`settings.pickModel`~~ ∥ `settings.pickModelEmpty`…）」⇒「词键**三**退 × 两语（`settings.defaultModel` ∥ `.defaultModelTitle` ∥ `settings.pickModelEmpty`…；**`settings.pickModel` 保留** = 保留面消费者在册：会诊添加弹窗选模型钮 ∥ 模型槽钮文案（`settings-consult-dialog.js:79` ∥ `settings-models.js:124`）——按 KD-80 ⑥「咨询顾问 ∥ 子代理模型槽零触」；删则两处渲染裸键名）」 |
| 2 | `docs/desktop/design/SETTINGS.md:412`（§2.24 项 6 行 10） | 「各 **353 ⇒ ≈349**（−**4** 键 × 两语；两语键集相等机检）」⇒「各 **353 ⇒ 350**（−**3** 键 × 两语——`settings.pickModel` 保留；两语键集相等机检）」 |

**回读读数（改后实读）**：`:398` = 「词键三退 × 两语…`settings.pickModel` 保留…删则两处渲染裸键名」；`:412` = 「各 353 ⇒ 350（−3 键 × 两语…）」——两处与 §1 KD-80 ⑥（`:31`「咨询顾问 ∥ 子代理模型槽…零触」）自洽，本档 §2.24 内「三退」与「−3 键」同值。

**批档原行不改**：本档 §2.1 行 3「词键四退（两语）」（`:28`）不修（append-only · 设计轮初稿留存）——**与更正相抵处以本段为准**。§3 轮次 1 第 4 条 / 轮次 2 第 4 条引「词键四退」为评审当时实录（冻结段，不改）。

**范围**：只动上述两处设计档 + 本更正段；**产品码 ∥ KD-80 ⑥ 句 ∥ 其余撤场面零触**。

**新增发现（非本件 · 供父侧路由）**：工作树现态 `thincoder-vscode/webview/settings-providers.js` = **144 内容行**，而 §2.24 项 6 行 7（`:409`）记「**193 ⇒ ≈139**」——撤场行 ∥ `_setDefaultModel` ∥ `_defaultModelMenu` ∥ 绑定已不在盘上（`settings.js:53-59 ∥ :63-88 ∥ :109-119 ∥ :158` 诸坐标越界）；即撤场代码似已落盘而本档 §5 实施记录尚空。该面在本次作业域外 ⇒ **unverified**，请实施轮 / 收口轮核（行 7「现行 193」与盘面 144 已不对应）。

## §3 设计评审（评审子代理）

### 轮次 1（评审子代理）

评审对象 = 模型选择归位批 §2 设计（KD-80 + §2.24 + 三端随正）· 状态 = 待评审 · 评审面 = 六档（批档 + desktop SETTINGS/MENU/COMPOSER + vsc SETTINGS/WEBVIEW），代码侧行数未开档核验。

| # | Category | Severity | Issue | Suggestion |
|---|----------|----------|-------|------------|
| 1 | Acceptance criteria | 🔴 | 闭集行数对不上：KD-80 ④ 记「`SCOPES` 十一 ⇒ 十、`MODAL_READS` 八 ⇒ 七行」（`2026-10-15-model-selection-pivot.md:31`），§2.24 项 2 同值并引同档 `:65-77`（`thincoder/docs/desktop/design/SETTINGS.md:392`），而 §2.8 项的实读记「`MODAL_READS` **八行**（`mount-settings.mjs:66-73`；`model: "loadProviders"` 在 :67）」（`2026-10-15-model-selection-pivot.md:79`）——同一块被引成 8 行（:66-73）与 13 行（:65-77）两形；设计档现行句明写现值「= **十一组**：+`providerAdd` → `loadProviders`」（`thincoder/docs/desktop/design/SETTINGS.md:132`）、「`MODAL_READS` 八组 ⇒ 十组（+2 行）」（同档 `:265`）、「`MODAL_READS` +1 行（`team → loadTeam`」（同档 `:304`）⇒ 按 §2.11/§2.18/§2.21 三处复算应为十一 ⇒ 十，不是八 ⇒ 七；`MODAL_READS` 行数与 `SCOPES` 名数逐轮同值（KD-75 七⇒八 ∥ §2.18 八⇒十 ∥ §2.21 ⇒十一），而本批对 `SCOPES` 用了正确基数、对 `MODAL_READS` 用了旧基数。验收用例把「`SCOPES` 十 ∥ `MODAL_READS` 七行」写进机检（同档 `:481`、`2026-10-15-model-selection-pivot.md:49`），据此写出的断言必错；同句「皆自 `SECTIONS` 派生」亦与 §2.8 的「`SCOPES` = `SECTIONS` + 三常量」（`2026-10-15-model-selection-pivot.md:79`）不符 | 先把 `mount-settings.mjs` 的 `MODAL_READS` 行数与 `model` 行位核定为一处结论（含 `providerAdd`/`mcpForm`/`consultAdd`/`team` 三常量行是否在表内），据此统一 KD-80 ④、§2.24 项 2、§2.8 项 3 与两处验收用例的数值；并把「皆自 `SECTIONS` 派生」改成与「`SECTIONS` + 三常量」相符的表述 |
| 2 | Document ownership | 🟡 | 随正面清单（`2026-10-15-model-selection-pivot.md:36` 自称「本批改变事实的句，均已改」）漏项，改后同档同机制仍留旧事实：§2.9 项 3「本域半边 = 本档 §2.1（模型段）」（`thincoder/docs/desktop/design/SETTINGS.md:114`）、§2.10 项 2 复用链仍点名「段体组件（`providersBody` ∥ `modelBody` ∥ `agentBody` ∥ `mcpBody` ∥ `envBody` ∥ `toolsBody` ∥ `modelsBody` ∥ `teamBody`）」（同档 `:122`，`modelBody` 本批净删）、§2.11「**现值十一名**」（同档 `:132`）、§2.14「设置面「模型」段 ∥ **向导模型步**候选**同源**」（同档 `:174`）、§2.21「段形：设置面第 8 段「团队」（`SECTIONS` 追加序尾——不重排既有七段）」（同档 `:303`）∥「团队入 `SECTIONS`（八段）⇒ `SCOPES` 派生十一」（同档 `:304`）、§4 团队段验收「闭集对拍（`SECTIONS` 八段 ∥ `SETTINGS_GROUPS` 六名 ∥ `SCOPES`/`MODAL_READS` 十一）」（同档 `:493`）、KD-75 ② 残留「等价路径 = 模型段「采用」」（同档 `:26`）、§2.5 项 3 仍把「模型（当前 ∥ 候选行——nowrap + 省略；`使用` 右对齐既有）」（同档 `:89`）列为在场段；MENU.md 同病：「（`SCOPES`——现值十一名）」（`thincoder/docs/desktop/design/MENU.md:86`）与「校验十一名宽容 pin」（同档 `:90`）对照已改的「渲染面校验 `SCOPES` 十名宽容（设置页对齐——零改）」（同档 `:13`）。另：vsc 档已改但不在 VSC 清单内——「默认模型行撤场后 `settings-providers.js` 不再发 `saveAgentSettings`」（`thincoder/docs/vsc/design/SETTINGS.md:412`）对 `2026-10-15-model-selection-pivot.md:37` 的 VSC 清单 | 按改后事实逐句收正（七段 ∥ `SCOPES` 十 ∥ `MODAL_READS` 十行 ∥ 模型段零在场 ∥ 等价路径 = 向导模型步「采用」），或明标「as-of 该批」的历史口径；收正后使随正面清单与实际改动面逐条对齐 |
| 3 | Affected-file annotations | 🟡 | 十行文件账漏列本批会改的档：§2.24 项 2 自陈「`settings.modal` 闭集十值（`store.mjs` 注释级随正）」（`thincoder/docs/desktop/design/SETTINGS.md:392`），`store.mjs` 不在 `:396-409` 表内；表第 9 行只给键数差「各 **−4** 键（两语键集相等机检）」（同档 `:408`），无现行行数 | 把 `store.mjs` 补成表行并标「结构不变 · 注释随正」；`locales/*.json` 两行补现行行数与预期差；全表统一「现行 ⇒ 预期」计数口径 |
| 4 | Affected-file annotations | 🟡 | 计数口径不自洽：§2.8 项 3 以「行数（口径 = 实读行数 − 1 尾空行，与在册文件账同口径）：`views/settings.mjs` 455」（`2026-10-15-model-selection-pivot.md:79`）引出，而 §2.24 项 6 同档给「**454 ⇒ ≈452**」（`thincoder/docs/desktop/design/SETTINGS.md:400`），五档 desktop 逐档差 1（102/101 ∥ 307/306 ∥ 313/312 ∥ 209/208）；同轮自检自陈已把行域「`:98-101` ⇒ 改 `:99-101`」（`2026-10-15-model-selection-pivot.md:77`），但 §2.1 仍写「`modelBody` 净删（`renderer/views/settings-sections.mjs:98-101`）」（同档 `:26`），只改了 §2.24（`thincoder/docs/desktop/design/SETTINGS.md:390`） | 定死一处口径与一组数字（口径句与所列数值须自洽），并把行域坐标在 §2.1 ∥ §2.24 两处改齐（或统一以 §2.24 为单源坐标） |
| 5 | Closest-precedent | 🟡 | 批档 §2 无「最接近先例」行（先例坐标 = 实现坐标 ∥ 对应设计档节 ∥ 先例批次 + 沿袭 ∥ 偏航理由）：材料散见 KD-80 理由列（CLI `cmd-model.mjs:8`，`thincoder/docs/desktop/design/SETTINGS.md:31`）与 §2.24 项 5（同档 `:395`）；VSC 钮重指属有意偏航且已给由（同档 `:395`「`WEBVIEW.md` §4.8 …现行句「钮不开会话级模型菜单」随本批翻转」），但未成行 | 补一行先例行：实现坐标 ∥ 设计档节 ∥ 先例批次，逐条标沿袭或偏航并给偏航理由；无先例的面显式声明「无先例」 |
| 6 | Survey-evidence | 🟡 | 批档 §2 无调查证据行（查过哪些公共源档 ∥ 是否有相关项；「无相关」亦须记）：现有自检只覆盖仓内自引——「**引文集 ↔ 标题集**：本批所引 `§N` 逐条实读在盘」（`2026-10-15-model-selection-pivot.md:77`） | 补调查证据行，逐库列出查过的公共源档与结论（含「无相关」），与自引对拍行分列 |
| 7 | Clarity | 🟡 | 两档单元测试档的留存口径自相抵：§2.4 写「两档**随批留存 · 用后即删**，不进集成测试树」（`2026-10-15-model-selection-pivot.md:49`），§2.24 第 10 行写「随批留存 · 不进集成测试树」（`thincoder/docs/desktop/design/SETTINGS.md:409`），而条目 2 又称该链为「desktop 会话选定写回 `defaultModel` 回归锁」（`2026-10-15-model-selection-pivot.md:27`）——留存与用后即删互斥 | 按在册惯例（批档本地用例随批留存 ∥ 不进集成测试树）统一措辞，删去「用后即删」或限定其适用范围 |
| 8 | Affected-file annotations | 🟡 | 现存单元测试档的预期变红未入账：§2.24 第 10 行只列「拟」新档（`thincoder/docs/desktop/design/SETTINGS.md:409`），而档内已落用例钉着改前闭集——「闭集对拍（`SECTIONS` 八段 ∥ `SETTINGS_GROUPS` 六名 ∥ `SCOPES`/`MODAL_READS` 十一）」（同档 `:493`）与收窄族「校验十一名宽容 pin」（`thincoder/docs/desktop/design/MENU.md:90`）改后必红；§2.4 却称「集成面零新增（本批零业务链改——`T-DSK27` 段序断言随正）」（`2026-10-15-model-selection-pivot.md:49`） | 把会变红的在册用例档补入文件账，或按在册先例（档头注 + 收口互指）显式披露，使「集成面零新增」与实际受影响面一致 |
| 9 | Acceptance criteria | 🔵 | 条目 2（会话选定写回 `defaultModel` 回归锁）无机检用例：桌面五用例（段闭集 ∥ `SCOPES` 十 ∥ `MODAL_READS` 七行 ∥ 分派支 ∥ 词键）皆不含写回径（`thincoder/docs/desktop/design/SETTINGS.md:481`、`2026-10-15-model-selection-pivot.md:49`），载体仅真机 T-DSK71 ②③ | 在批档单元测试档补一例覆盖写回链（含同值重选零写的负控），或在验收块注明该条只由真机承载及其理由 |
| 10 | Acceptance criteria | 🔵 | 负向断言锚未在册：`[data-section="model"]` 零在场是本批主判据之一（`thincoder/docs/desktop/design/SETTINGS.md:529`、`2026-10-15-model-selection-pivot.md:55`），但本档段级锚只见 `data-index="db"`（`thincoder/docs/desktop/design/SETTINGS.md:160`）∥ `[data-form="mcp"]`（同档 `:244`）等，`data-section` 未见别处 ⇒ 若该属性不存在，负向断言恒真（空判） | 先确认段节点锚属性实名；不成立则改锚既有段标识，并以已在册的「零空段壳」结构性断言作主判据 |
| 11 | Document ownership | 🔵 | 跨端决策单源落在桌面档：VSC 两件（banner 钮重指 ∥ VSC `saveAgentSettings` 载荷 `defaultModel` 支净删）的决策单源 = 桌面 `SETTINGS.md` KD-80 ⑤（`thincoder/docs/desktop/design/SETTINGS.md:31`）与 §2.24 项 5（同档 `:395`），VSC 档只落既成事实（`thincoder/docs/vsc/design/WEBVIEW.md:204`） | 在 VSC 侧承载面同记一行决策 + 理由（或加对位指针行明示「决策单源在桌面档」），使跨端读者不必外跳 |
| 12 | Methodology / Doc hygiene | 🔵 | §2 有两条状态行（`2026-10-15-model-selection-pivot.md:17` 与 `:20`，后条为 append 残留），同一段两条状态行使读者难辨权威句；模板占位行仍在（同档 `:18`，工具面合法） | 保留一条信息完整的状态行，另一条不再复用；占位行可留可清 |

计数：🔴 1 · 🟡 7 · 🔵 4（共 12 条）。

VERDICT: changes-required

### 轮次 2（评审子代理）

**轮次 2 复核**（评审对象 = 模型选择归位批 §2 设计 · 状态 = 待评审 · 只核前表修正项 1–11 + 12 父裁不动 · 复审面 = 批档 §2 ∥ `docs/desktop/design/SETTINGS.md` ∥ `docs/desktop/design/MENU.md` ∥ `docs/vsc/design/SETTINGS.md`）

修正项落点复核（逐条实读）：1 ✅（`SETTINGS.md:31` / `:395` / `:405` / `:413` / `:443` / `:486` 六处「八 ⇒ 七」已齐 ⇒ 十一 ⇒ 十）· 2 ⚠ 部分（`:26` `:89` `:114` `:121-122` `:131-132` `:174` `:303-304` `:491` `:498` 与 `MENU.md:86` `:89` `:90` `:145` 已改；漏 §1 KD-68 ④ `:24`「`SECTIONS`（视图单源，八段）」与档头 `:3`「设置面板（八段）」）· 3 ✅（§2.24 行 6 `store.mjs` **374 ⇒ 374**、行 10 locales **各 353 ⇒ ≈349**、全表统一「现行 ⇒ 预期」+ 口径句 `:399`）· 4 ⚠ 部分（口径已定死一处 = 内容行数；批档 §2.1 `:26` / §2.8 `:79` 原行未改，以 §2.9 更正为准）· 5 ✅（批档末「先例行」五行：实现坐标 ∥ 设计档节 ∥ 先例批次，含两条「偏航（有意）」+ 一条显式「无先例」）· 6 ✅（「调查证据行」：仓内公共源逐档实读 ∥ `index.publicRepos` 空 ∥ 结论「无相关外部公共源项」）· 7 ✅（`:413` / `:486` 措辞统一「用毕即删（零留存）」）· 8 ✅（新增行 12 = 本批触及在册机检族零留档 + 档头注 + 收口互指，沿 `MENU.md` §6 DJ ② 先例）· 9 ✅（行 11 + §4 增「写回链」用例 ⇒ desktop 六用例）· 10 ✅（`:416` 段节点锚 = `data-section` + 实读坐标）· 11 ✅（vsc `:33` / `:38` 决策单源 + 理由行）· 12 未动（父裁）。

| # | Category | Severity | Issue | Suggestion |
|---|----------|----------|-------|------------|
| 1 | Document ownership | 🟡 | 同档内计数相抵仍未收：§1 KD-68 ④ 写「`SECTIONS`（视图单源，八段）」（`thincoder/docs/desktop/design/SETTINGS.md:24`），而同句后半写「**校验面 `SCOPES` = 十名**（七段名 + `providerAdd` …）」、KD-80 ① 写「`SECTIONS` 八 ⇒ 七」（同档 `:31`）、§2.24 写「段闭集 **八 ⇒ 七**」（同档 `:393`）；本批随正面清单自称 KD-68 ③④ 已随正（`thincoder/docs/batches/2026-10-15-model-selection-pivot.md:36`），但 ④ 的「八段」半边未动 | 把该括注改为改后事实（七段）或明标 as-of 批前口径，使 KD-68 ④「源 ∥ 镜像」句与 KD-80 ① / §2.24 / §4 机检的七段同值 |
| 2 | Document ownership | 🟡 | 档头未随正：`thincoder/docs/desktop/design/SETTINGS.md:3` 仍写「设置面板（八段）」并把「模型」列为板块面，而本批后盘面/设计值 = 七段（同档 `:39` / `:433`）；该档头不在随正面清单（`2026-10-15-model-selection-pivot.md:36`）内 | 档头计数改为七段（板块面列同步），或明标该句为批前历史口径 |
| 3 | Affected-file annotations | 🟡 | 文件账未闭合：批档机制面点名 banner 钮重指的注入点 = `webview/chat-messages.js:156`（`2026-10-15-model-selection-pivot.md:44`），而 §2.24 受影响文件表十一行（`thincoder/docs/desktop/design/SETTINGS.md:401-414`）无该档行——要么缺行，要么该「注入点」不是改动点（二者与「单一开径零第二实现」的表述互斥，代码侧不可核） | 补该档行（现行行数 + 预期差），或按实读把改动点收敛到已登记档并撤去「注入点」措辞 |
| 4 | Document ownership | 🟡 | VSC 随正面落点与实读行对不上：清单记 VSC「§5 U-S15/U-S16」（`2026-10-15-model-selection-pivot.md:37`），而 `thincoder/docs/vsc/design/SETTINGS.md:685`（U-S15）述添加表单不设 model 控件、`:686`（U-S16）述 provider 词面，两行皆不含本批事实；本批改变事实的句实际落 `:12`（卡行）/ `:32` / `:33`（入口面 ∥ 决策单源）/ `:38`（载荷面）/ `:413`（发值面），VSC §5 无一行登记「默认模型行撤场 / 词键四退」 | 把该清单项改指实际改动的 §5 行，或在 §5 补一行登记撤场与词键四退（使清单与实际改动面逐条对齐） |
| 5 | Acceptance criteria | 🔵 | 用例数两值：desktop 单元测试档 = **六用例**（`thincoder/docs/desktop/design/SETTINGS.md:413` 行 11 ∥ `:486` §4），而 T-DSK71 机检列写「§4 本块**五**用例」（同档 `:534`）、批档 §2.4 亦作五用例（`2026-10-15-model-selection-pivot.md:49`） | 把 §2.24 行 11 ∥ §4 ∥ §5 T-DSK71 ∥ 批档 §2.4 四处用例数收成一个值 |
| 6 | Affected-file annotations | 🔵 | 批档侧旧数值/旧坐标仍在正文（append-only 裁定下以更正记录为准）：§2.3 项 2「`MODAL_READS` 八 ⇒ 七行」（`2026-10-15-model-selection-pivot.md:42`）、§2.4「`settings-providers.js` 194 ⇒ ≈140 ∥ `settings-panel-write.mjs` 224 ⇒ ≈216」（同档 `:48`）、§2.8「`:38 / :129`」（同档 `:79`）；更正记录只给了现行值 193 / 223（同档 `:125`），未给预期值（设计档为 ≈139 / ≈215——`thincoder/docs/desktop/design/SETTINGS.md:409-410`），亦未给 `settings.section.model` 的同语坐标（设计档作 `:38 ∥ :133`——同档 `:407`、批档 `:129`） | 在更正记录内补预期值与 `:133` 坐标两条，或给该段加 as-of 标记，使「以本记录为准」覆盖面完整 |
| 7 | Clarity | 🔵 | 留存口径与条目命名相抵未消：条目 2 自称「会话选定写回 `defaultModel` **回归锁**」（`2026-10-15-model-selection-pivot.md:27` ∥ `thincoder/docs/desktop/design/SETTINGS.md:56` 载体行），而其机检载体声明为「用毕即删（零留存）」（同档 `:413` / `:486`）⇒ 存档删除后「锁」只余 T-DSK71 ②③ 真机走查 | 指明哪件是耐久锁载体（沿用同档其余块的「随批留存」措辞，或把锁归到 T-DSK71 真机行），使「锁」与其载体口径一致 |
| 8 | Affected-file annotations | 🔵 | 「无变红面」结论的证据在域外：行 12 以 `thincoder-desktop/test/files.mjs` = 空清单与 `.thincoder/tmp/**` 不参与机检为据（`thincoder/docs/desktop/design/SETTINGS.md:414`），而同档 §4 多处记「已建成 · 3/3 绿」等已落用例族、§2.5 行 4 载体又含 VSC 侧「`thincoder-vscode/test/files.mjs` 清单内档」（同档 `:416`）——该两侧代码/测试树在本次评审面外（**unverified**，未核） | 把该结论的判据源指到具体清单读数（或在披露行内注明「按实施期实读复读」），并把 VSC 侧既有冒烟/机检档是否随批变红一并入账或披露 |
| 9 | Acceptance criteria | 🔵 | 条目 4（VSC banner 钮重指）只有一条正向判据（点钮 ⇒ 会话模型菜单在场 ⇒ 拾取 ⇒ 槽写 + 回写——`2026-10-15-model-selection-pivot.md:58`），无边界行：横幅本义 = `banner.notConfigured`（`thincoder/docs/vsc/design/SETTINGS.md` §2.16 ④ 词面），零已配渠 ⇒ 会话菜单零候选；原径 `openSettings` 不受此限（横幅触发态属代码面，**unverified**） | 补一条边界判据（零渠态点钮的预期：空菜单 ∥ 就地提示 ∥ 仍指配置面），或明记该态下重指径的处置理由 |

计数：🔴 0 · 🟡 4 · 🔵 5（共 9 条）。评审局限：本次上下文未提供文档地图与项目标准档 ⇒ Document ownership 判据降级为「同档自洽 + 与 Project Guide 相对照」；批档随正面所列 `IPC.md` / `COMPOSER.md` / `UI.md` / `E2E-TESTING.md` / `PROJECT.md` / `PACKAGING.md` / `WEB-QUICKCHECK.md` 与 VSC `WEBVIEW.md` 翻转、各代码行数与测试清单读数均在评审面外（未核，不计分）。

VERDICT: pass

## §4 用户批准（主 agent）
## §5 实施记录（eng-coder）

### §5 实施记录（eng-coder · 2026-10-16）

**交付摘要**：按设计单源 `docs/desktop/design/SETTINGS.md` §1 KD-80 ∥ §2.24 ∥ §4 落三件 —— ① desktop 撤设置页「模型」段（段闭集八 ⇒ 七）② VSC 撤设置面 Providers 卡「默认模型」行（行 ∥ 两函数 ∥ 绑定 ∥ 载荷支+探支）③ banner 动作钮重指**会话级模型菜单**（开径 = 模型钮同径，零第二实现）。既有会话选定写回链零动。**零新 IPC ∥ 零新推送 ∥ 零新载荷键 ∥ 零新变量 ∥ 零新 CSS。**

#### 改动面（`file:line`）

| # | 档 | 改动 |
|---|---|---|
| 1 | `thincoder-desktop/renderer/views/settings.mjs` | `SECTIONS` 去 `model` 项 ⇒ 现七段 `providers ∥ agent ∥ mcp ∥ env ∥ tools ∥ models ∥ team`（`:43-51`）；段体分派支去（`:281-297` 现零 `model` 支）；档头/段闭集注释「八段 ⇒ 七段」随正 |
| 2 | `thincoder-desktop/renderer/views/settings-sections.mjs` | `modelBody` 净删；保留 `modelIdOf` ∥ `modelHeadNode` ∥ `modelChoicesTree`（活消费者 = `views/onboarding.mjs:59` `settingsModel(state)` ⇒ `:180` 向导步 2 —— 非死投影） |
| 3 | `thincoder-desktop/renderer/mount-settings.mjs` | `MODAL_READS` 去 `model` 行（十一 ⇒ 十行）；`SCOPES` 随 `SECTIONS` 派生（十一 ⇒ 十）；三处注释随正 |
| 4 | `thincoder-desktop/renderer/mount-settings-exits.mjs:170` | `useModel` 失败串 scope 字面 `model` ⇒ `panel` |
| 5 | `thincoder-desktop/renderer/i18n-settings.mjs` | 两语净退 `settings.section.model`（键面实读 89 ⇒ 88；两语键集相等） |
| 6 | `thincoder-desktop/renderer/mount-settings-reads.mjs:90 ∥ :101` | **文件清单外**（见下表）：`report("model", …)` ⇒ `report("panel", …)` —— 同批同类点位（#4）漏改补齐 |
| 7 | `thincoder-vscode/webview/settings-providers.js` | 撤「默认模型」行 HTML + hint 节点 + `_setDefaultModel` + `_defaultModelMenu` + 绑定（194 ⇒ 144 行） |
| 8 | `thincoder-vscode/src/extension/settings-panel-write.mjs` | `saveAgentSettingsFromPanel` 的载荷 `defaultModel` 支 + 探支净删（224 ⇒ 212；**`probeDefaultModelChannel` 本体保留** —— `carryoverDefaultModel:199` 仍调用） |
| 9 | `thincoder-vscode/webview/ui.js` | `showBanner` `onChoose` 注释随正（行为面零改 —— 钮出口本就由第三参注入） |
| 10 | `thincoder-vscode/webview/chat-messages.js:156` | **文件清单外**（见下表）：注入点第三参 ⇒ `() => document.getElementById("model-btn")?.click()`；撤 `openSettings` 解构 + jsdoc（全档零 `openSettings` 残留） |
| 11 | `thincoder-vscode/locales/{en,zh}.json` | 退三键（`settings.defaultModel` ∥ `.defaultModelTitle` ∥ `settings.pickModelEmpty`）；各 350 行、两语键集相等；**`settings.pickModel` 保留**（父裁 —— 保留面两活消费者在册） |
| 12 | `docs/batches/2026-10-15-model-selection-pivot{,-vsc}.test.mjs` | 批内单测两档（新档；`node --test`；用毕即删） |

#### 文件清单外改动（机制必需 · 逐条给理由）

| # | 档 | 理由 |
|---|---|---|
| A | `thincoder-vscode/webview/chat-messages.js` | 设计 §2.24 项 6 文件表未列，但设计 §2.3 项 4 点名的「banner 钮注入点」**就是本档 `:156`** —— 表漏项、机制需改，按机制面落并披露 |
| B | `thincoder-desktop/renderer/mount-settings-reads.mjs` | #4 的同类点位（同名失效字符 `model`）；设计只点名了 exits 一处。行为等价（`report` 表外本就回落 `panel`，`mount-settings.mjs:127`），属零残件纪律下的随正 |
| C | `C:\Users\liwei\.thincoder\config.json`（**仓外 · 事故修复**） | 见「事故披露」——单测首跑误写该档，已按备份证据还原 |

#### 事故披露（`config.json`）

批内单测首跑时，desktop 用例 6 经 `thincoder-desktop/src/main/settings.mjs` 调 `carryoverDefaultModel` **写进了用户真档** `~/.thincoder/config.json`（该档 `defaultModel` 被写成测试值 `deepseek:chat`）。根因 = **模块实例分叉**：测试缝 `_setConfigPathForTest` 取直指档路径（`thincoder-core/config-io.mjs`），而被测档走裸包 `@thincoder/core/*` 解析 ⇒ 两个模块实例、缝不生效。
处置：① 测试档加 `registerHooks` 把 `@thincoder/core/*` 归一映射到 `thincoder-core/*`（同一实例），并在用例内加前置断言 `assert.equal(_configPath(), path, "测试缝未生效——禁止触真档")` 作硬闸；② 还原该键值。
**还原依据与不确定度**：三份在册备份（`config.json.bak-c2-cleanup-20261009` ∥ `.bak-20260920` ∥ `.bak2-20260920`）该键均为 `deepseek:deepseek-flash`，且 10-14 的会话日志记录该键当时在读面在场 ⇒ 还原为 `deepseek:deepseek-flash`。**该档原值无任何在册证据可逐字复核** ⇒ 若原值非此，请指出，一行即可改回。

#### 决策透明表

| 项 | 判断 | 依据 |
|---|---|---|
| VSC 词键退三键（非四） | 照父裁定案落：`settings.pickModel` 保留 | 批档「裁定（父侧）」段；保留面两活消费者 `settings-consult-dialog.js:79` ∥ `settings-models.js:124` |
| `store.mjs` **未改** | 实读 `:117` 已是改后事实（「七段名 + 三常量」十值闭集） | 设计 §2.24 行 6 记「十一 ⇒ 十随正」与盘面不符 ⇒ 无随正可做，属设计漂移（不自行改设计档） |
| banner 钮开径取「模型钮同径」 | 运行期 `document.getElementById("model-btn")` 取锚（点击时解析） | `ctx.modelBtn` 是静态骨架按钮、已被 `input.js` 移除 ⇒ 陈旧锚不可用；真钮监听在册（render-core `model-menu.mjs:345`） |
| 单测档不进 `test/` 收集面 | 两档住 `docs/batches/` | `test/run.mjs` 仅 `walk("test")`；与设计「不进集成测试树」一致 |

#### 审计与代码评审轮次 · 终态

- **内部发散审计（explore · 只读 · 1 轮）**：四类偏差（未实现验收点 / 静默简化 / 设计漂移 / 清单外改动）**均零发现**；逐条验收点实测在册。提出一处「欠项」= VSC 单测缺「两语键集相等 + `saveAgentSettings{defaultModel}` 零在场」机检 ⇒ 已补（见下 fix round）。
- **内部代码评审（advisor · code · 1 轮）**：`VERDICT: pass`（无 🔴）。3 🟡 + 2 🔵 —— 🟡①`mount-settings-reads.mjs:90/:101` 失效 scope 字面（= 本档 #6，已修）；🟡②VSC `src/extension/settings.mjs:172-173` 读面残件（`defaultModel` 快照键零消费者 + 注释失实）**未改**（档不在设计受影响表、属读面保留 —— 已列报告未处置项）；🟡③banner 重指在「候选为空」态可能开出零菜单（**unverified**，未跑真机 —— 已列报告）；🔵④⑤测试面（用例名与覆盖面不符 / 源形耦合）。
- **fix round（1 轮 · 已闭）**：① VSC 单测补两语键集相等 + 载荷支零在场 + `probeDefaultModelChannel` 在场断言（用例 1/2 内，仍三用例）② desktop 用例 6 补「会话选定 ⇒ 写回单点」接线锁（源面）③ 用例 4 档头注「源文扫描 · 形耦合」④ #6 两处 scope 字面随正。
- **终态：`clean`**（审计零偏差 · 评审无 🔴 · fix round 已闭 · 单测全绿）。

#### 读数行（本批验证）

- `node --test docs/batches/2026-10-15-model-selection-pivot.test.mjs docs/batches/2026-10-15-model-selection-pivot-vsc.test.mjs` ⇒ **tests 9 · pass 9 · fail 0**（desktop 六用例：段闭集七段 ∥ `SCOPES` 十 ∥ `MODAL_READS` 十行 ∥ 分派零 `model` 支 ∥ 词键零残 ∥ 写回链+触发接线；VSC 三用例：卡树零行 + 两语键集相等 ∥ 出口面 + 载荷支零在场 ∥ banner 开径）。
- 端侧机检：`thincoder-desktop` / `thincoder-vscode` 两侧 `npm test` 均报「test manifest is empty — zero tests = green」（在册机检族零变红面 —— 与设计行 12 披露一致）。
- 实测内容行数（口径 = 内容行数、文末换行不计）vs 设计「预期」：`settings.mjs` 452/≈452 ✅ ∥ `settings-sections.mjs` 96/≈96 ✅ ∥ `mount-settings.mjs` **307**/≈305 ∥ `mount-settings-exits.mjs` 312/312 ✅ ∥ `i18n-settings.mjs` 214/≈214 ✅ ∥ `settings-providers.js` **144**/≈139 ∥ `settings-panel-write.mjs` **212**/≈215 ∥ `ui.js` **255**/≈256 ∥ `locales/*.json` **350**/≈349（≈ 面差 = 注释/空行差，无实体面差）。
- **未跑真机**（`T-DSK71` ①⑤ 节点断言 ∥ `T-DSK64` VSC 对位）= 父侧收口面；**未跑集成面**（两侧在册集成清单为空）。

## §6 验证与收口（父代理）
