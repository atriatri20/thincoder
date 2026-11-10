# 桌面端（DESKTOP）· 菜单体系（应用菜单 + 窄通道）

> 面 = **应用菜单面**——五组双语原生菜单 + 菜单 ↔ 渲染面两条窄通道（命令下行 `ev:menu` ∥ 勾选态回读 `theme:state`）；本档是该面的单源设计。
> 需求侧 = 需求分卷（本域卷 = `docs/desktop/requirements/MENU.md`——**D36 ∥ D38**；查卷口 = `docs/desktop/requirements/PROJECT.md` §4 **D 表索引**）；
> 总览 ∥ 跨域决策 ∥ 索引 = `docs/desktop/design/PROJECT.md`；通道面 = `docs/desktop/design/IPC.md` §1 `ev:menu` 行 ∥ §2 `theme:state` 行；宿主面 = `docs/desktop/design/SHELL.md` §1 树行 + §2 菜单行；界面总则 = `docs/desktop/design/UI.md`。
> **行数纪律（500 建议 ∕ 800 硬限）只对代码档**（`.mjs` ∥ `.cjs` ∥ `.css` 等）；纯 `.md` 设计档不受限（档长按内容需要；设计档读者面 = 人）。

## 1. 关键决策（KD-65）

| # | 决策 | 理由 |
|---|---|---|
| KD-65 | **桌面菜单体系（D36）= 五组双语原生菜单 + 菜单 ↔ 渲染面两条窄通道（命令下行 `ev:menu` ∥ 勾选态回读 `theme:state`）**：① **菜单树（五组）**——文件[新建会话 `CmdOrCtrl+N` → `ev:menu{newSession}` ∥ 打开工作目录… `CmdOrCtrl+O` → `ev:menu{openProject}`（渲染面 `openDir` 单一实现——原生选择框同径）∥ 最近工作目录▸（`recentDirs()` 前 10——`thincoder-desktop/src/main/projects.mjs` 数据面既有、零改；项 label = cwd 全路径；空表 ⇒ 单枚禁用占位项）∥ 现状 close ∥ quit（显式双语 label）] ∥ 编辑[现状 role 组（显式双语 label——role 默认文案 = Electron 英文硬编码，直采即 en-only 债）+ 查找… `CmdOrCtrl+F` → `ev:menu{find}`] ∥ 视图[现状 role 组 + 主题▸（跟随系统 ∥ 亮色 ∥ 暗色——**序 = `renderer/theme.mjs` `THEMES` 闭集序**={`system`,`light`,`dark`}；**当前生效主题带勾**——`type: "checkbox"` + `checked` 逐项判等（单源 = 主进程回读缓存；恰一真 ∥ 报告未达 = 全假——零误勾））→ `ev:menu{theme, value}`] ∥ 设置[设置… ⇒ 现有设置页 ∥ **六组项** ⇒ 组弹窗∥ 两子组（维护▸ ∥ 关于与快捷键▸）（单源 = 本档 §1 **KD-67**）] ∥ 帮助[检查更新… → 主进程更新面（`host("update")`——状态机 label；单源 = `docs/desktop/design/PACKAGING.md` §2.8.1）∥ 命令与快捷键… → `ev:menu{help}` ∥ 关于 ThinCoder… → 主进程 `app.showAboutPanel()`（内容 = `app.setAboutPanelOptions`：应用名 ThinCoder ∥ `app.getVersion()` ∥ 版权行——建窗时一次设置）]；**窗口组（minimize/zoom）不入菜单**（D36；窗口操作走系统标题栏）；**菜单结构出档** = `thincoder-desktop/src/main/menu-words.mjs`（扩至全菜单词表：组名五 + 条目 + role 标签 + 主题/最近/关于词——zh/en 双值 + en 回落）∥ `thincoder-desktop/src/main/app-menu.mjs`（新档 · `menuTemplate({ words, edit, recent, theme, onAction, onNative })` 纯函数——`onNative(action)` = 宿主自办四项 `gc` ∥ `index` ∥ `about` ∥ **`update`**（末项 = 桌面发布·阶段二批 +1）——不经 `ev:menu`；零 `electron` ⇒ 平 node 直测；`THEME_VALUES` 三值闭集同导出（主进程报告校验面共用——零第二份）；先例 = `context-menu.mjs` 两纯函数）；`window.mjs` = 宿主面落子（`Menu.buildFromTemplate` + `win.setMenu` + 关于面 + `refreshMenu` + `setMenuTheme`（勾选态缓存——表外值零变更 + 记错））。② **菜单 ↔ 渲染面 = 两条窄通道**——**命令下行 = `ev:menu`**（主→渲染单向；`EVENT_CHANNELS` **+1**）：载荷 `{ action, path?, value? }`——`action` 闭集**六值** `newSession` / `openProject` / `find` / `theme` / `help` / `openSettings`（**打开项目亦经渲染面**——`openDir` 单一实现 + 会话面/轨面随动所需；`openSettings` 单源 = 本档 §1 **KD-67**——需求卷 D36 动作集同值）；`path` 仅 `openProject` 携（最近项）；**`value` 携主二**——`theme`（三值闭集）∥ `openSettings`（组名——菜单发出闭集六名（= `SECTIONS` 名序去「团队」）∥ 渲染面校验 `SCOPES` 十名——设置页对齐超集；缺 ⇒ 开设置面）；**不携 `key`**（非会话面——沿 `ev:config` 例外句）；发送 = `window.mjs`（`win.webContents.send` + `isDestroyed` 守卫）；接收 = `events-subscribe.mjs` 窄口 `onMenu`（纯信号、归约面零写者——沿 `onConfig` 先例）⇒ `thincoder-desktop/renderer/app.mjs` 接线 ⇒ **`thincoder-desktop/renderer/menu-actions.mjs`（新档）** 分派：`newSession` → `createSession()`（mount-sessions 单一实现）∥ `openProject` → `openDir(path?)`（`thincoder-desktop/renderer/app.mjs` 单一实现）∥ `find` → 搜索面 `openSearch()`（核件 `createSearch` 返回面——R6 端壳现刻零消费点 ⇒ 本注接线；**幂等开径** ⇒ 与核件 Ctrl+F 键径双触发零害——核件键径 = 开非 toggle）∥ `theme` → 设置面出口 `setTheme`（→ `theme.mjs` 单写者 + 切片写）∥ `help` → `composer.printHelp()`（`/help` 流内打印口——mount-composer face 暴露；单实现）∥ `openSettings` → 设置页 `openSettings()`（缺组——现有页零动）∥ 组弹窗 `openSettingsModal(group)`（单源 = `docs/desktop/design/SETTINGS.md` §1 **KD-68**）——**勾选态回读 = `theme:state`**（渲染→主单向——**仅携 `{ theme }`**（三值闭集）；发送 = 渲染面两写作点（装配初值 ∥ 设置面出口落地——单写者 `theme.mjs` 的两调用位）；接收 = 主进程缓存 + `refreshMenu()`（`window.mjs` `setMenuTheme`；表外值 ⇒ 零变更 + 记错 + `{ ok:false, reason:"invalid-theme" }`）；**新 invoke 白名单项 +1**；主进程零直读渲染面存储 ∥ 零轮询）。③ **词表单源**——应用菜单词值只住 `menu-words.mjs`；编辑四值（剪切/复制/粘贴/全选）复用 `contextMenuLabels(locale)` 读取（值单源 = 渲染面 `HOST_DICT` `menu.edit.*`——两菜单同词面，零第二份）；与 `HOST_DICT` 零重叠键。④ **菜单重建时机（最近项目读取 ∥ 语言随动 ∥ 主题勾随动）** = 菜单构建时读 + 重建点**六处**（启动建窗 ∥ `project:open` 成功径（`ipc.mjs` `refreshMenu()`）∥ **语言写径**（`config:write` 成功径 ⇒ `refreshMenu()`——`ipc-relays.mjs` `configWriteChannel`；`window.mjs` 单向 import——零环）∥ **主题态报告径**（`theme:state` 到达 ⇒ 缓存 + `refreshMenu()`——`ipc.mjs` 处理体转口 `setMenuTheme`）∥ 窗口 `focus`（外部盘面漂移兜底）∥ **更新面状态迁移径**（更新状态迁移 ⇒ `refreshMenu()`——`setUpdateFace` 转口；实读 `window.mjs` 的更新面转口一带——桌面发布·阶段二批））——`win.setMenu(buildMenu())` 幂等重建。⑤ **键位** = 新增三件（`CmdOrCtrl` N/O/F）+ 其余 role 默认加速键保留（reload/forceReload/devTools/zoom 三/全屏）；零冲突实读（渲染面 `ctrlKey` 零既有绑定——唯核件 Ctrl+F 同径收敛）。⑥ **关于面** = 原生 `app.setAboutPanelOptions` + `showAboutPanel()`（无平台限注）；版本 = `app.getVersion()`（`thincoder-desktop/package.json` 现 0.10.1）。⑦ **边界** = 托盘 ∥ 自绘菜单 ∥ 全量快捷键体系 ∥ 语言切换进菜单（设置面单源）（检查更新：单源 = `docs/desktop/design/PACKAGING.md` §2.8.1）∥ 菜单项选中态 = 唯主题▸带勾（当前生效主题；命令下行 + 状态回读 `theme:state`——**限度**：回读经渲染面报告缓存（主进程零直读渲染面存储）∥ 报告未达窗 = 全零勾（fail-open，零误勾）∥ 零双向协议 ∥ 零热更 ∥ 其余条目零选中态）∥ 核 ∥ `thincoder-render-core` ∥ CLI ∥ VSC 零触 | 需求 D36（用户 2026-10-02 09:37 提出 + 09:40「可以啊，先做了我看看」= 四默认定案：双语 ✓ ∥ 主题▸ ✓ ∥ 关于=原生+版本 ✓ ∥ 最近项目 ✓）；现状实读 = `window.mjs` 的 `buildMenu()`（五组 · 词面经 `menu-words.mjs` 投影——模板单源 = `app-menu.mjs`）；出档判由 = 结构机检需平 node 可测（`window.mjs` 载 `electron` 不可直测——沿 D27「模板出档」同判） |
| KD-67 | **设置组改造（D38 ∥ D39 菜单侧）= 顶级「维护」改名「设置」+ 组内「设置…」入口 + **六组项** ⇒ 弹窗（KD-68）+ 维护 ∕ 关于与快捷键两子组**（需求卷 **D38** ∥ **D39**）：① **菜单树（五组序不变）**——顶级组 = **设置**（词键 `settings`「设置」/「Settings」（**词键 `maintenance` 保留**（值「维护」/「Maintenance」不变——现役 = 子组标签））；组内 = **「设置…」**（`settingsOpen` → `ev:menu{openSettings}`〔缺 `value`〕⇒ **现有设置页** `openSettings()`——零动）∥ sep ∥ **六组项**（渠道… ∥ agent 参数… ∥ MCP… ∥ 运行环境… ∥ 工具与服务… ∥ 会诊与审查…——序 = 渲染面 `thincoder-desktop/renderer/views/settings.mjs` `SECTIONS` 段序**去「团队」**；组项集 = 六——「模型」段随 `docs/desktop/design/SETTINGS.md` §1 **KD-80** 撤场（模型选择归输入面板）；label = HOST_DICT `settings.section.*` 投影 + 「…」后缀（菜单形）→ `ev:menu{openSettings, value:组名}` ⇒ **组弹窗**（KD-68））∥ sep ∥ **维护▸**〔清理会话数据… → `host("gc")` ∥ 重建会话索引 → `host("index")`——**行为零改**（原生对话框，不经通道）〕∥ **关于与快捷键▸**〔命令与快捷键… → `emit("help")` ∥ 关于 ThinCoder… → `host("about")`——**行为零改**；**帮助组零动**——本组 = 同二项之**第二入口**（上抛 DI ③）〕。② **窄通道动作集 = 六**（+`openSettings`；**`value` 携主二**——`theme`（三值闭集）∥ `openSettings`（组名——菜单发出闭集六名（= `SECTIONS` 名序去「团队」）∥ 渲染面校验 `SCOPES` 十名宽容（设置页对齐——零改）；缺 ⇒ 开设置面）；其余载荷面零改；**零新通道**——事件 **26** ∥ 白名单 **55** ∥ preload ∥ `ipc-registry.mjs` 零触）。③ **词面**——`menu-words.mjs` +三键（`settings` ∥ `settingsOpen` ∥ `aboutShortcuts`「关于与快捷键」/「About & Shortcuts」；键集 = 43）+ 新读器 `settingsSectionLabels(locale)`（HOST_DICT `settings.section.*` 投影——沿 `contextMenuLabels` 先例，零第二份；**投影枚举 = 菜单六组名**（与组项集对齐）；en 回落 ∥ 缺键 ⇒ 键名终态）。④ **动作落径**——`openSettings`（缺组）→ 现有设置页（零动）；`openSettings`+组 → 组弹窗（KD-68）；`gc` ∥ `index` ∥ `about` → `onNative` 零改；`help` → `emit("help")` 零改。⑤ **重建时机零新**（五处不动——设置组项全静态）。⑥ **边界** = 独立设置窗口（B 案——用户明令不做）∥ 帮助组（零动；「移动」= 需求变更级——本设计不做）∥ 托盘 ∥ 自绘菜单 ∥ 全量快捷键体系。 | 需求 D38 ∥ D39（用户 2026-10-02 15:13 提出 + 15:19「先按照a做吧」= A 案应用内模态）；现盘实读 = `thincoder-desktop/src/main/app-menu.mjs`（维护组两项）∥ `menu-words.mjs`（`maintenance:"维护"`）∥ `renderer/menu-actions.mjs`（六动作分派）；弹窗体面 = `docs/desktop/design/SETTINGS.md` §1 **KD-68** |

## 2. 界面形态与交互

1. **菜单树（五组）**（逐组一条规则）：
   - **文件**：新建会话 `Ctrl+N` · 打开工作目录… `Ctrl+O` · 最近工作目录▸（前 10 · 项 label = cwd 全路径 · 空表 ⇒ 单枚禁用占位项）· close · quit。
   - **编辑**：role 组 + 查找… `Ctrl+F`。
   - **视图**：role 组 + 主题▸（跟随系统 ∥ 亮色 ∥ 暗色——序 = `thincoder-desktop/renderer/theme.mjs` `THEMES` 闭集序；**需求档字面序保持**（实现序 = `THEMES` 闭集序）；**当前生效主题带勾**）。
   - **设置**：设置… ⇒ 现有设置页 · **六组项** ⇒ 组弹窗 · 两子组（维护▸ ∥ 关于与快捷键▸）（单源 = 本档 §1 **KD-67**）。
   - **帮助**：检查更新…（首项 = `host("update")` 主进程更新面；单源 = `docs/desktop/design/PACKAGING.md` §2.8.1）· 命令与快捷键… · 关于 ThinCoder…。
   - **词面与边界**：组名与条目双语（词表单源 = `thincoder-desktop/src/main/menu-words.mjs`；role 默认文案 = Electron 英文硬编码 ⇒ 显式双语 label 覆写——防 en-only 债）；**窗口组（minimize/zoom）不入菜单**（窗口操作走系统标题栏）。
2. **交互落径（每项 = 既有单一实现）**：新建会话 → 会话创建出口 ∥ 打开项目 ∥ 最近项 → `openDir`（原生选择框同径）∥ 查找 → 搜索面 `openSearch()`（与核件 `Ctrl+F` 键径**同径收敛**——开语义幂等，双触发零害）∥ 主题 → 设置面出口 `setTheme`（`theme.mjs` 单写者 + 切片写；**落地值回读主进程**——`theme:state` ⇒ 菜单勾随动）∥ 命令与快捷键 → `/help` 流内打印口 ∥ 关于 → 原生面板（版本 = `app.getVersion()` 动态）。
3. **键盘可达**：三新增键位（`Ctrl+N` ∥ `Ctrl+O` ∥ `Ctrl+F`——菜单加速键；**记法注**：macOS 上 = Cmd——实现取 `CmdOrCtrl`；需求档字面 `Ctrl` 保持）；其余等于 role 默认加速键保留；零冲突实读（渲染面 `ctrlKey` 零既有绑定）。
4. **判据**：机检 = 单元测试档（菜单体系族——五用例：树形（含带勾态）∥ 双语回落 ∥ 动作闭集 ∥ 词表纪律 ∥ 通道双表（含 `theme:state` 白名单））；真机 = **T-DSK57**（走查：五组双语在场 ∥ 五入口 ∥ 三键 ∥ 关于面板含版本 0.10.1 ∥ 主题勾随动）。
5. **边界**：菜单项选中态 = 唯主题▸带勾（命令下行 + 状态回读 `theme:state`——限度 = 报告缓存；其余条目零选中态）∥ 托盘 ∥ 自绘菜单 ∥ 全量快捷键体系 ∥ 语言切换进菜单（设置面单源）（检查更新：单源 = `docs/desktop/design/PACKAGING.md` §2.8.1）；零触面 = `context-menu.mjs`（D27）∥ `thincoder-desktop/src/main/projects.mjs`。

## 3. 文件账

### 3.1 文件账（菜单族行）

| 文件 | 行数面 | 说明 |
|---|---|---|
| `thincoder-desktop/src/main/menu-words.mjs`（新档） | — | **应用菜单词表**（zh/en 常量对 + `menuLabels(locale)` 纯函数；零 `electron` ⇒ 平 node 直测；zh = 语义直译值 ∕ en = 回归现值） |
| `thincoder-desktop/src/main/app-menu.mjs`（已落） | — | 应用菜单模板纯函数（`menuTemplate({ words, edit, recent, theme, onAction, onNative })`——五组 ∥ 条目 ∥ role/加速键 ∥ 主题▸/最近▸ 子菜单 ∥ 主题勾选态（`checked` 判等；`THEME_VALUES` 导出）∥ `onAction` ∥ `onNative` 两接缝（`onNative(action)` = 宿主自办**四项** `gc` ∥ `index` ∥ `about` ∥ `update`——不经 `ev:menu`）；零 `electron` ⇒ 平 node 直测；决策单源 = 本档 §1 **KD-65**） |
| `thincoder-desktop/renderer/menu-actions.mjs`（已落） | — | 菜单动作落面（`ev:menu` 六动作 → 各既有单一实现分派；注入缝 ⇒ 平 node 直测；决策单源 = 本档 §1 **KD-65**） |

## 4. 验收回指（需求卷 D36）

**菜单体系（验收 · 2026-10-02）**：

- **需求回指**：**D36**（五组扩充 ∥ 双语 ∥ 窄通道 ∥ 四默认定案）。
- **设计单源**：本档 §1 **KD-65** ∥ `docs/desktop/design/SHELL.md` §2 菜单行 ∥ `docs/desktop/design/IPC.md` §1 `ev:menu` 行 ∥ §2 `theme:state` 行 ∥ 本档 §2。
- **机检 = 单元测试档**（菜单体系族——五用例）：
  - ① **菜单树结构**（五组序 ∥ 逐组条目 ∥ 三加速键 ∥ 主题子菜单三值序 = `THEMES` 闭集序 + **带勾态**（`theme` 给定 ⇒ 恰一枚 `checked`；缺省 ⇒ 全假）∥ 最近子菜单 ≤10 + 空表占位禁用）
  - ② **双语 ∥ 回落**（zh/en 词值 + 未知 ∕ 缺 locale ⇒ en 回落）
  - ③ **动作闭集**（六动作 `onAction` 派发正确 ∥ 未知 action ⇒ 零动作 + 记错）
  - ④ **词表纪律**（`menuLabels` 键集 = 预期集 ∥ Edit 四值 = `contextMenuLabels` 同源读取）
  - ⑤ **通道面**（`preload.cjs` `EVENT_CHANNELS` ∧ `events-subscribe.mjs` `CHANNELS` 双表含 `"ev:menu"` 且等值；**回读面**——`preload.cjs` `CHANNELS` 含 `"theme:state"`（+1——随正）∧ `ipc-registry.mjs` `HANDLERS` 含同项）
  - 随批留存 · 不进集成测试树。
- **真机**：**T-DSK57**（走查十一项）——
  - 五组双语在场 ∥ 新建会话 ∥ 打开项目 ∥ 最近项 ∥ 查找 ∥ 主题切换 ∥ `/help` 打印 ∥ 关于面板含版本 0.10.1 ∥ `CmdOrCtrl+N/O/F` 三键（macOS = Cmd）。
  - **主题勾随动**：切主题 ⇒ 当前生效主题带勾——设置面 ∥ 菜单两径。
  - **边界两查**：空最近表 ⇒ 单枚禁用占位；未配 locale ⇒ en 回落。
- **离线不可产面**（真菜单 ∥ 原生关于面板 ∥ 系统对话框）= 人工走查 + 父侧真跑闭合（D16 义务）；测试文件随修随加——不占设计条目（2026-09-27 裁定）。

**设置菜单升级（验收 · 菜单半 · 2026-10-02 · 需求 D38 ∥ D39）**：

- **需求回指**：**D38**（改名 ∥ 设置… 入口 ∥ 维护子组零改）∥ **D39**（菜单组项六 ⇒ 组弹窗）。
- **设计单源**：本档 §1 **KD-67** ∥ `docs/desktop/design/SETTINGS.md` §1 **KD-68**。
- **机检 = 单元测试档**（设置菜单升级族——**波 1 用例**）：
  - ① 菜单树（组名设置 ∥ 条目序 = 设置… ∥ sep ∥ 六组项（序 = `SECTIONS` 去「团队」）∥ sep ∥ 维护▸ 两项 ∥ 关于与快捷键▸ 两项 ∥ 六项 emit 值 = 组名闭集——**跨面闭集一致性**：`SETTINGS_GROUPS`（主）≡ `SECTIONS` 名序（渲染——`SCOPES` 同源派生）源扫）
  - ② 词表纪律（键集 32 ∥ `settingsSectionLabels` HOST_DICT 投影 + en 回落）
  - ③ 动作闭集六（`openSettings` 两形派发 ∥ 表外 ⇒ 记错）
  - 随批留存 · 不进集成测试树。
- **真机**：**T-DSK59**（用例行 = `docs/desktop/design/SETTINGS.md` §5——两波合一走查）。
- **离线不可产面**（原生菜单 ∥ 原生对话框 ∥ 原生面板）= 人工走查 + 父侧真跑闭合（D16 义务）；测试文件随修随加——不占设计条目（2026-09-27 裁定）。

**设置菜单组项收窄（验收 · 菜单半 · 2026-10-02 · 需求 D39 收正）**：

- **需求回指**：**D39**（菜单组项 = 六——「模型」不入菜单；设置页面七段零动）。
- **设计单源**：本档 §1 **KD-67** ∥ `docs/desktop/design/SETTINGS.md` §1 **KD-68** ④（闭集关系）。
- **机检 = 单元测试档**（设置菜单组项收窄族——三用例）：
  - ① 六项集（条目序 = 设置… ∥ sep ∥ 六组项（序 = `SECTIONS` 去「团队」）∥ sep ∥ 维护▸ 两项 ∥ 关于与快捷键▸ 两项；六项 emit 值 = 组名闭集；「模型」零在场）
  - ② 跨面闭集一致性（`SETTINGS_GROUPS`（主）≡ `SECTIONS` 名序去「团队」（渲染）源扫；读取面键序同值）
  - ③ 弹窗仍达六组（逐组开 ⇒ 切片写 + 读取链）+ 校验十名宽容（表外 ⇒ 拒）
  - 随批留存 · 不进集成测试树。
- **真机**：**T-DSK59**（条目面随正 = `docs/desktop/design/SETTINGS.md` §5——六组项）。
- **离线不可产面**（真菜单）= 人工走查 + 父侧真跑闭合（D16 义务）；测试文件随修随加——不占设计面条目（2026-09-27 裁定）。

## 5. 用例

| 用例 | 场景 | 输入 | 预期输出 | 机检 / 落点 |
|---|---|---|---|---|
| T-DSK57 | 正常 / 边界 · 菜单体系（D36 · 真 Electron） | 真 Electron（三启程）：① 默认家（含历史项目）——逐项走查（**十一项**清单 = 本档 §4）；② 空最近表家（无记录）；③ 未配 locale 家（config 无 `locale` 键） | ① 十一项逐条：五组双语在场（zh ∥ en 各一轮）∥ 新建会话 ∥ 打开项目 ∥ 最近项（≤10 · label = cwd 全路径）∥ 查找 ∥ 主题切换（序 = `THEMES` 闭集序）∥ **主题勾随动**（切主题（设置面 ∥ 菜单两径）⇒ 当前生效主题带勾随动——`data-theme` 值与菜单勾位一致）∥ `/help` 打印（流内）∥ 关于面板含版本 `0.10.1` ∥ `CmdOrCtrl+N/O/F` 三键真触发（记法 = macOS Cmd）∥ 边界两查（空最近表 ⇒ 单枚禁用占位〔不可点〕；未配 locale ⇒ en 回落〔零空白 ∥ 零混排〕）；**离线不可产面**（真菜单 ∥ 原生关于面板 ∥ 系统对话框）= 人工走查 + 父侧真跑闭合（D16 义务） | 机检 = 单元测试档（菜单体系族——五用例；随批留存 · 不进集成测试树）；用例号自铸披露 = §6 **DG** |

**菜单体系批注（验收 · 2026-10-02）**：机检 = 单元测试档（菜单体系族——五用例——逐条 = 本档 §4）；真机 = **T-DSK57**（走查十一项——清单 = 本档 §4；用例行 = 本表）；用例行随测试文件修加——不进设计面条目（2026-09-27 裁定）。

**设置菜单升级批注**：真机用例 = **T-DSK59**（全文 = `docs/desktop/design/SETTINGS.md` §5——菜单 ∥ 弹窗两波合一走查）；机检用例 = 本档 §4（波 1 三用例）+ `docs/desktop/design/SETTINGS.md` §4（波 2 三用例）。

**设置菜单组项收窄批注（验收 · 2026-10-02）**：真机用例 = **T-DSK59**（条目面随正——六组项；全文 = `docs/desktop/design/SETTINGS.md` §5）；机检用例 = 本档 §4（三用例）。

## 6. 上抛与登记（DG）

| 行 | 内容 | 状态 | 单源 |
|---|---|---|---|
| DG | **`T-DSK57` 用例号自铸披露 + 菜单体系上抛四项**（沿 T-DSK37–T-DSK56 先例——菜单体系批自铸；若实施批 ∥ 并行批占用同号 ⇒ 请父侧并号裁定）：① 用例行随测试文件修加——不进设计面条目（2026-09-27 裁定）；② **窄通道动作数披露**——`ev:menu` 动作闭集 = **六**（`newSession` ∥ `openProject` ∥ `find` ∥ `theme` ∥ `help` ∥ `openSettings`——单源 = 本档 §1 **KD-65** ②）；③ **窗口组（minimize/zoom）去留披露**——D36 ∥ §1 ∥ 台账三处枚举均无它，设计按五组落 = 该组退场；如需保留 = +1 组；④ **关于版权文案取值**（内容权 = 主 agent）——提案 = `© 2026 Shanghai Xinbo Technology Co., Ltd.`（源 = D32 签名主体）；版本 = `app.getVersion()` 动态；⑤ **冻结邻接披露**——`mount-composer.mjs` 增 face 暴露 `printHelp` 一行（slash 批存量文件——UI.md ∥ RENDERER.md 同为其「零写」清单档；按派单触其非 slash 区，slash 区零动）；若裁冻结面绝对零触 ⇒ help 另径求助（现无零触替代） | 登记（自铸披露 + 上抛四项——**已裁（引需求档 D36 行内收正句 ∥ 变更行——动作集收正 + 窗口组退场确认）**） | 单源 = 本档 §1 **KD-65** |
| DI | **`T-DSK59` 用例号自铸披露 + 设置菜单升级五披露**（沿 T-DSK37–T-DSK58 先例——自铸；若实施批 ∥ 并行批占用同号 ⇒ 请父侧并号裁定）：① 用例行随测试文件修加——不进设计面条目（2026-09-27 裁定）；② **「设置…」落面判定**——设计取「现有设置页」（D38 字面「打开设置面」+ D39「现有设置页保留」）；备选 = 总览弹窗（未采——若父侧本意备选 ⇒ 裁，改动面小）；③ **「关于与快捷键」= 第二入口**（帮助组零动——D36 保持；若父侧裁「移动（帮助组退场）」⇒ 需求变更级，本设计不擅动）；④ **需求侧同值登记**（主 agent 笔面——已落）：D36 动作集 = **六**（+`openSettings`）——引需求卷 `docs/desktop/requirements/MENU.md` 的 D36 行内收正句 ∥ 变更行；⑤ **D39「多子菜单」读法登记**——设计读法 = 「六组项平铺（渠道 ∥ agent 参数 ∥ MCP ∥ 运行环境 ∥ 工具与服务 ∥ 会诊与审查）+ 维护 ∥ 关于与快捷键两枚真子菜单」（细目设计定之内——沿 ② 先例）；若父侧原意「每组一条子菜单」⇒ 属 U1 同族细化，请裁。设置半披露 = `docs/desktop/design/SETTINGS.md` §6 **DI（设置半）** | 登记（自铸披露 + **五**披露） | 单源 = 本档 §1 **KD-67** |
| DJ | **设置菜单组项收窄二择项裁定**：① **弹窗校验面 = 支 A（宽容面 = `SCOPES`——现值十名）**——菜单不发「模型」∥「团队」，零改 `SCOPES`；**读器投影枚举 = 六名**（与组项集对齐）——两裁明写 = 本档 §1 **KD-67** ③ ∥ `docs/desktop/design/SETTINGS.md` §1 **KD-68** ④；② **T-DSK59 条目面随正（六组项——同号复用，不新铸）** | 登记（裁定二 + 随正一） | 单源 = 本档 §1 **KD-67** |

