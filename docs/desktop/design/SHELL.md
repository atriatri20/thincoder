# Desktop 宿主适配 · 设计

> 需求 = `docs/desktop/requirements/SHELL.md`；IPC = `IPC.md`。
> 最近先例：`docs/core/design/CORE-UNIFICATION.md` 的壳装配与 `PORTABILITY.md` 的平台边界。对齐 = 主进程唯一 Node 面。
> 勘察证据：已读进程树、协议、预载、装配和右键菜单。相关 = 当前 Electron 壳。

## 1. 进程与资源

main.mjs 负责单实例、app://、窗口前恢复和启动自检。window.mjs 创建隐窗、最大化、显示、菜单和右键。

protocol.mjs 只服务包内资源并阻止路径逃逸。preload.cjs 以 contextBridge 暴露 window.thincoder 白名单。

renderer 不 import node: 或 @thincoder/core；node-safe 词表等被主进程装载的文件不得使用仅 app:// 可解析的静态别名。

## 2. core 装配

agent-host/agent-assemble 调 core assemble，注入 cwd、slot、工具表、prompt injections 与回调桥。

session-io 负责槽 IO，turn-driver/turn-face 负责单回合，suspensions 负责 approval/question/secret 挂起。

provider/MCP/config/settings 均通过 core 写路径；无第二份配置、会话或工具实现。

## 3. 宿主交互

context-menu 按 isEditable/selectionText/editFlags 生成菜单，角色由主进程执行，文案按 locale。

第二实例弹原因并唤醒主窗口；启动 Node 与 node:sqlite 失败明确退出。

## 4. 验证

验证渲染静态闭包、协议逃逸、白名单、装配、窗口最大化、右键剪贴板和启动失败。
