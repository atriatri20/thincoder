# Desktop 总体设计

> 需求 = `docs/desktop/requirements/PROJECT.md`。
> 最近先例：`docs/core/design/ARCHITECTURE.md` 的薄壳与 `docs/render-core/design/RENDER-CORE.md` 的共享渲染。对齐 = 不新建第四套机制。
> 勘察证据：已读进程、会话、UI、IPC、设置和发行分域。相关 = 当前 Electron 桌面端。

## 1. 架构

主进程使用 Node/ESM，直接调用 @thincoder/core，负责 agent、配置、会话、索引、团队和系统能力。

preload 用 CJS contextBridge 暴露白名单 IPC。renderer 无 Node，使用原生 ESM/DOM 与 @thincoder/render-core。

资源经当前 app:// 标准协议提供，Electron 与内置 Node 在启动时校验 core 所需能力。

## 2. 文档分域

- SHELL/IPC：宿主与通道。
- UI/CHAT/COMPOSER/ACTIVITY/RENDERER：界面与渲染。
- SESSIONS/SETTINGS/MENU：会话、设置和菜单。
- PACKAGING：发行。
- E2E-TESTING/WEB-QUICKCHECK：验证工具。

各专题只写桌面接入，core 机制引用对应 core 文档。

## 3. 横切约束

状态按键 `String(slot)` 分片；配置写经 core 原子写；历史从槽读取；digest/subagent 归档有记录；忙碌输入由宿主队列权威。

所有 IPC 载荷与回执必须真实，缺能力或失败显式可见，不能产生假按钮、假回合或假读数。

## 4. 验证

按用户入口做真 Electron 走查，辅以可注入纯函数测试。发布前运行当前打包检查和目标平台冒烟。
