# Desktop 菜单 · 设计

> 需求 = `docs/desktop/requirements/MENU.md`。
> 最近先例：`SHELL.md` 的宿主原生面与 `SETTINGS.md` 的组弹窗。对齐 = 原生菜单、窄 IPC。
> 勘察证据：已读 menuTemplate、menu-actions、theme:state 和重建时机。相关 = 当前五组菜单。

## 1. 菜单

app-menu.mjs 以 menuTemplate 生成文件/编辑/视图/设置/帮助，menu-words.mjs 提供中英词值。

设置组包含设置页、当前配置组弹窗和维护/关于快捷键；帮助含更新、help 和关于。

## 2. 动作

ev:menu 动作闭集为 newSession/openProject/find/theme/help/openSettings。menu-actions 调 createSession/openDir/openSearch/setTheme/printHelp/openSettings/openSettingsModal 的现有实现。

gc/index/about/update 由主进程 onNative 处理，不绕经渲染。

## 3. 勾选与重建

theme:state 仅携 system/light/dark，主进程缓存并 refreshMenu；未收到报告时不错误勾选。

菜单在启动、项目/语言/主题/更新变化和 focus 时按当前规则重建；最近目录有界，空时禁用占位。

## 4. 验证

验证树、双语、动作闭集、组名一致、主题勾选、最近空态和原生入口。
