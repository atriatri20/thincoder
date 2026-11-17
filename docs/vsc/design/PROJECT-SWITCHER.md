# VSC 当前项目切换 · 设计

> 需求 = `docs/vsc/requirements/PROJECT.md`。
> 最近先例：`docs/core/design/WORKSPACE.md` 的项目锚与 `SESSION.md` 的 cwd 隔离。对齐 = 单 cwd 入口、显式选择。
> 勘察证据：已读 override、锚记忆、无工作区守卫和恢复。相关 = 当前 multi-root 面板。

## 1. cwd

_cwd() 使用当前 override 或 workspaceFolders[0]。setProjectFolder 只接受工作区成员；运行中拒绝切换。

projectInfo/pushProject/applyProjectSwitch/onProjectChanged 统一项目快照、会话认领、索引和 UI 刷新。

thincoder.projectFolder 记最后成功显式选择；恢复时校验成员。未选定时回退首根并标未选定。followActiveEditor 只在空闲且跨根时切换。

## 2. 无工作区

hasWorkspaceFolder 是唯一判据。无工作区时，面板、发送、命令、回合、会话认领/管理和索引入口按当前守卫拒绝并提示，不把 process.cwd() 当项目。

workspaceGuard 推送 active，webview 显示 toast/占位符；Open Folder 使用 vscode.openFolder。

工作区转空时清 override、agent 和 slot；转非空时重新 openSessionContent。override 根被移除时清 override 并换项目。

@ 补全使用 VS Code 工作区只读 API，不按 cwd 写盘。

## 3. 验证

验证单根隐藏、显式/自动切换、busy 拒绝、锚恢复、无工作区零槽零 agent 零项目文件和空↔非空恢复。
