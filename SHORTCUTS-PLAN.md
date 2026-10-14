# 快捷键可重绑能力——后续版本计划（2026-10-12 探查定稿）

> **当前裁定（2026-10-12 · 用户明令）**：「先保留硬编码吧，不把事情做复杂」——**编辑面不做**，键位继续硬编码；
> 本档留档备将来（阶段一 ∕ 二落点全部经源码实读，坐标即 `codex-ui` HEAD `c7d16272`）。
>
> **已交付（本批）**：① 设置页「快捷键」**只读参考页**（`c7d16272`——导航伪段 + 搜索 + 分组键帽表，ZCode 只读面对位）；
> ② **菜单加速键宿主修复**（`ccd8615e`——`setMenu(null)` 摘掉加速键宿主，全批菜单加速键曾全灭，见 §1.3）。

> 层 = 计划档（`what to build`）。参照系 = ZCode（`C:\Users\18749\AppData\Local\Temp\zcode-ref` v3.14.3 源码快照）。

## 0. 结论速览

「快捷键可编辑」在本仓**不是加个按钮**，而是**架构前提缺失**：ZCode 全部快捷键走**同一执行内核**（命令注册表 +
匹配 ∕ 录制 ∕ 冲突模块，菜单与渲染端同源取值）；本仓键位**分居两层、零注册表**：

| 层 | 宿主 | 现状 | 可编辑化成本 |
|---|---|---|---|
| ① 主进程菜单加速键 | Electron `Menu`（`src/main/app-menu.mjs`） | 显式 accelerator 3 枚 + 角色默认键若干 | **低**——菜单每窗重建（`window.mjs` `refreshMenu`），改为「读配置再 build」即得 |
| ② 渲染端 keydown | `thincoder-render-core`（composer ∕ search ∕ model-menu ∕ atmenu）+ 桌面 `renderer/`（preview ∕ approval ∕ sidebar ∕ chat-tool） | 各档**硬编码键判** | **高**——三档住 render-core（**与 VSC 共用**）⇒ 改判据须两端同拍 |

⇒ 分两阶段：**阶段一**（只做①，收益大、不碰 render-core、不影响 VSC）；**阶段二**（②全量，须 VSC 对齐）。
**当前用户裁定 = 都不做**（保留硬编码），本档仅存计划。

## 1. 现状盘点（实测）

### 1.1 层①：菜单加速键（可配置化候选面）

- 显式 accelerator 三枚：`CmdOrCtrl+N`（新会话 · `app-menu.mjs:80`）· `CmdOrCtrl+O`（打开项目 · `:81`）· `CmdOrCtrl+F`（查找 · `:100`）。
- 角色默认键（Electron 内置）：`undo` ∕ `redo`（`:92-93`）· `reload` ∕ `forceReload` ∕ `toggleDevTools`（`:107-109`）·
  `resetZoom` ∕ `zoomIn` ∕ `zoomOut`（`:111-113`）· `toggleFullscreen`（`:115`）· 剪切 ∕ 复制 ∕ 粘贴 ∕ 全选（Edit 组）。
  角色键的 accelerator **由 Electron 赋默认值**（zoomIn = `CommandOrControl+Plus`——实测 `Ctrl+Shift+=` 生效），
  要改键须把 role 换写成显式 `accelerator` + `click`（自实现行为，或保留 role 并覆写 accelerator）。
- 重建点：`window.mjs:117` `refreshMenu()`（六处调用：启动建窗 ∕ 切项目 ∕ 语言写 ∕ 主题报告 ∕ 窗口 focus ∕ 更新态迁移）。
  **注意**：`app-menu.mjs` 的模板是每次现建（`buildMenu()`），accelerator 取值点集中 ⇒ 接配置只需在 build 时查表。

### 1.2 层②：渲染端 keydown（全量面，逐条实读）

| 档 | 键位 | 坐标 |
|---|---|---|
| composer 面板 | Enter 发送 ∕ Shift+Enter 换行 ∕ Ctrl+C 停止（无选区 ∧ 运行中）∕ Ctrl+I 中断注入 ∕ Ctrl+U 清空 ∕ ↑↓ 历史与多行边界 ∕ 中断态 Enter ∕ Esc | `render-core/composer/panel.mjs:133-200` |
| @ 提及菜单 | Esc 关 ∕ ↑↓ 导航 ∕ Enter ∕ Tab 接受 | `render-core/composer/atmenu.mjs:97-131` |
| 模型菜单 | Esc 关（文档级 capture）· 过滤框 ↑↓ ∕ Enter | `render-core/composer/model-menu.mjs:142` ∕ `:227-260` |
| 会话内查找 | Ctrl+F 开（文档级）· Enter ∕ Shift+Enter ∕ ↑↓ 跳转 ∕ Esc 关 | `render-core/search.mjs:185-190` ∕ `:148-157` |
| 图片预览 | Esc 关（window capture）· ←→ 切换 | `renderer/image-preview.mjs:86-95` |
| 审批卡 | 逐项 1/2/3（允许一次 ∕ 始终允许 ∕ 拒绝）· 批 1/2/3（全部 ∕ 拒绝 ∕ 逐项） | `renderer/views/approval.mjs:33-44` `SHAPE_ACTIONS` |
| 侧边栏 | 右键菜单 Esc 关 · 改名 Enter 提交 ∕ Esc 取消 | `renderer/mount-sidebar.mjs:619-660` |
| 工具卡 | 文件链接 Enter 打开 | `renderer/views/chat-tool.mjs:298` |

### 1.3 已修的前置缺陷（加速键宿主 · `ccd8615e`）

`refreshMenu()` 原为 `Menu.setApplicationMenu(buildMenu())` + `activeWin.setMenu(null)`（注释误记「加速键恒活」）。
Windows/Linux 上**应用菜单就是窗口菜单**，`setMenu(null)` 把菜单整只摘掉 ⇒ **全部菜单加速键失效**（真机实测：
Ctrl+N 不建会话 ∕ Ctrl+R 不重载；渲染端自绑的 Ctrl+F 照常 = 判别式）。修 = `setMenuBarVisibility(false)`。
**任何后续「改菜单键位」的改动都必须走这条路径**（回归闸 = `docs/batches/2026-10-12-menu-accelerators.test.mjs`）。
测试方法学：**加速键必须用真实按键验**（PowerShell `WScript.Shell` AppActivate + SendKeys）——CDP 注入的键走渲染进程，
触发不了原生窗口菜单加速键，会得到假阴性。

## 2. 参照系：ZCode 的可重绑实现（源码实读）

- **数据模型**（`packages/shared` `SHORTCUT_COMMANDS` + `packages/ui/src/shortcuts/*`）：命令注册表（含默认键）+
  持久化**稀疏覆盖** `settings.shortcutBindings`（`commandId → string[]`）；生效值 = `resolveEffectiveShortcutBindings(overrides)`（默认 ⊕ 覆盖）。
  ⇒ 「全部恢复默认」= 删覆盖条目（极轻）。
- **一命令多绑定**：一行多组键帽（ZCode 截图「打开命令中心」= Ctrl K 与 Ctrl Shift P），每条可录制替换 ∕ 删除；命令级「+」追加。
- **录制内核**（`shortcuts/bindings.ts`）：IME 组合态（`isComposing` ∕ `Process` ∕ `Dead` ∕ `keyCode 229`）与长按 `repeat`
  一律不匹配不录制；`event.code → 规范键名` 映射（布局无关）；系统保留键拒收。
- **冲突检测 ∕ 抢绑**（`shortcuts/conflicts.ts`）：跨命令同一**物理键**即冲突（含等价 `Ctrl+M ≡ CmdOrCtrl+M`）⇒ 提示占用者 +
  二次确认抢绑（从占用命令移除该键）；**「恢复默认」同判**（默认键被占 ⇒ 提示且不落盘，只提示不自动清占用方）。
- **作用域列**（`ShortcutSettingsSection` 表头「作用域」= 全局）；少数命令注册但不列出（`openOnboarding` ∕ `toggleInterfaceMode`）。
- **按键搜键**（`useShortcutKeySearch`）：搜索框可按一组键反查命令（与冲突检测同一物理等价口径）。
- **垃圾桶语义**：清空该命令全部绑定 = **未分配**（显式空数组，不回退默认）；与录制态 Backspace「恢复默认」是两个语义。

## 3. 阶段一：菜单加速键可编辑（推荐先做 · 若将来解冻）

**范围**：只做层①（Ctrl+N ∕ Ctrl+O ∕ Ctrl+F + 重载 ∕ 缩放三键 ∕ 全屏 + 编辑族）。层②保持硬编码。

1. **核新增** `thincoder-core/shortcut-registry.mjs`：命令 id 表（`newSession` ∕ `openProject` ∕ `find` ∕ `reload` ∕ …）
   + 各命令默认 accelerator + `resolveShortcuts(overrides)`（纯函数 · 零 I/O）；沿用 `model-specs.mjs` 的模块级
   `setX/getX` 注册先例（`specForModel` 无 config 入参 ⇒ 覆写走模块级注册，同源手法）。
2. **配置键**：`shortcuts.bindings`（顶层；形 = `{ [commandId]: string[] }`，空数组 = 未分配）；`config.mjs` `DEFAULTS` 补键 +
   `loadConfig` 装配时 `setShortcuts(merged.shortcuts?.bindings)`（**写后重注册**同 `refreshOverrides()` 先例）。
3. **主进程接线**：`app-menu.mjs` `buildMenu()` 的 accelerator 取值改为查注册表（显式三枚直改；role 项须转「显式 accelerator +
   `click` 自实现」或保留 role 覆写 accelerator）；改键后调 `refreshMenu()` 重建（已有通道）。
4. **UI（现有参考页扩展）**：行尾加「编辑（录制）」钮（录制态 = 捕获下一组键 ⇒ 写配置 ⇒ 重建菜单 ⇒ 段体重绘）；
   「全部恢复默认」；冲突检测（同物理键占用 ⇒ 提示 + 抢绑二次确认，语义照 ZCode）；**作用域列/标注**：仅菜单类行可编辑，
   其余行标「固定」（避免「看起来都能改」的假象）。
5. **测试**：核注册表单测（解析 ∕ 覆盖 ∕ 冲突）· 批档机检（禁 `setMenu(null)` 回归闸已在位）· **真机须用真实按键**验改键生效（§1.3）。
6. **风险**：低（不碰 render-core ∕ 不影响 VSC ∕ CLI）。唯一注意 = role 项改键需自实现行为（zoom ∕ reload 有现成 API：
   `webContents.setZoomLevel` ∕ `reload()` ∕ `toggleDevTools()` ∕ `setFullScreen()`）。

## 4. 阶段二：渲染端全量可重绑（须 VSC 对齐 · 建议独立批次）

1. 把 `render-core` 三档（`composer/panel.mjs` ∕ `search.mjs` ∕ `composer/model-menu.mjs`）的硬编码键判改为「查注册表」
   （`atmenu.mjs` ∕ 审批 ∕ 预览 ∕ 侧栏同批）。
2. **VSC 端同拍**：render-core 为两端共用 ⇒ 键位语义改动必须 VSC 同步验收（否则两端分叉）；VSC 侧若有自持键位表需转口。
3. **CLI 语义边界**：`Ctrl+C 停止` ∕ `Ctrl+I 中断注入` ∕ `Ctrl+U 清空` 是 **CLI 对齐语义**（`panel.mjs` 注释明写 CLI parity）——
   可重绑后须保留「默认值 = CLI 同键」的不变量，且 CLI 端是否跟随（CLI 有自持 TUI 键位）需单列裁定。
4. **风险**：中高（跨包 + 两端 + 审批安全键「1/2/3 的置焦最安全键」语义与可重绑的交互需重新设计——`approval.mjs`
   `safe: true` 的置焦判据依赖固定键位）。

## 5. 边界（不做的事）

- **不做半开编辑**：若只让菜单类可编辑，UI 必须显式标注「固定」行，否则用户会以为输入区键位也能改（点了没反应 = 体验倒退）。
- **不引入第二套键位表**：任何编辑化都必须先有单一注册表；否则重蹈「两层各自硬编码」的老路。
- **不在渲染端直接改 Electron 加速键**：菜单是主进程面（`menu:popup` ∕ `refreshMenu` 单源）。

## 6. 变更记录

- **2026-10-12**：探查定稿（用户对照 ZCode 设置页「键盘快捷键」提出）。同批交付 = 只读参考页（`c7d16272`）+ 加速键宿主修复（`ccd8615e`）。
  **用户裁定：保留硬编码，编辑面不做**（本档留档）。参考页名录 = 实读值（43 行 6 组，逐条对实现档）。
