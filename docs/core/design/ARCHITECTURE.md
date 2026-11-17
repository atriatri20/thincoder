# ThinCoder 架构总览（ARCHITECTURE）

> 本档是仓级模块地图、硬约束和模块接口速览的权威入口。机制正文各归所属板块文档，本档不复制。
> 需求与原则 = `docs/core/requirements/PROJECT.md` · `docs/core/requirements/PHILOSOPHY.md`。
> 最近先例：`docs/README.md` 的板块归属。对齐 = 模块地图与文档地图使用同一组板块；偏离 = 本档只保留架构关系，不保存模块清单读数。
> 勘察证据：已读 `PROJECT-MANIFEST.json` 的文档根、`docs/README.md` 的当前板块索引和根 `README.md` 的包布局。相关 = 当前模块与文档归属；未使用外部公共源。

## 1. 定位与硬约束

本档回答：ThinCoder 由哪些模块构成，各模块如何分工，读者应到哪里找到详细设计。

### 1.1 硬约束

| # | 约束 | 核验入口 |
|---|---|---|
| 1 | 产品与共享包以纯 ESM `.mjs` 为主，不经过 TypeScript 或转译；需要 CommonJS 的宿主引导使用 `.cjs` | 各包 `package.json` 与入口文件 |
| 2 | 不引入通用构建步骤，源码直接运行；桌面和扩展的产物打包不属于源码转译 | 各包 scripts 与发布文档 |
| 3 | CLI 与 core 的 Node 下限由最低宿主决定；使用标准库 API 时必须满足该下限 | 两包 `engines.node` 与 `thincoder-cli/bin/node-version-gate.cjs` |
| 4 | 运行期优先使用 Node 标准库和第一方包；第三方运行期依赖需要明确理由 | 各包 `dependencies` |
| 5 | 共享逻辑位于 core，宿主无关呈现位于 render-core，端侧只保留宿主适配 | 各包 import 面与本文模块地图 |
| 6 | Desktop 主进程使用 ESM，沙箱预载按宿主约束使用 CJS，渲染面不直接使用 Node | `docs/desktop/design/PROJECT.md` · `docs/desktop/design/SHELL.md` |
| 7 | Server 自持网关、存储和控制台机制，部署形态不与客户端包混同 | `docs/server/design/PROJECT.md` · `docs/server/design/ops/OPS.md` |

## 2. 设计原则

1. 先用标准库和既有模块，新增依赖必须说明收益与代价。
2. 接口与归属先于实现，跨模块变化同步所有调用方。
3. 每个里程碑都必须实际运行验证，不交付只写未跑的实现。
4. 信息完整和语义准确优先于篇幅。
5. 代码是待核对象，不是必须模仿的答案。
6. 提示词和界面默认面向全球用户，不把中文环境当作唯一运行条件。

## 3. 模块地图

```text
thincoder/
├── bin/                         仓根引导
├── docs/                        项目需求、设计、标准与过程记录
├── scripts/                     仓级维护与验证脚本
├── test/                        集成测试、runner、RTM
├── bench/                       模型与工具调用评估
├── thincoder-core/              共享 agent 运行时
├── thincoder-render-core/       宿主无关渲染核
├── thincoder-cli/               终端产品
├── thincoder-vscode/            VS Code 扩展
├── thincoder-desktop/           Electron 桌面产品
└── thincoder-server/            团队服务端与 Web 控制台
```

### 3.1 core

| 模块 | 职责 | 设计入口 |
|---|---|---|
| `agent/` 与 `agent.mjs` | 主循环、装配、回合阶段和完成判定 | `docs/core/design/AGENT-LOOP.md` |
| `agent-tools/` | 元工具、子代理、评审、批档和台账工具面 | `docs/core/design/TOOLS.md` · `docs/core/design/BATCH-RECORD.md` |
| `advisor/` | 独立评审执行与收敛 | `docs/core/design/ADVISOR-CONVERGENCE.md` |
| `tools/` | 文件、搜索、git、Web、执行和工具写门 | `docs/core/design/TOOLS.md` |
| `provider/` | 模型 transport、重试、限流和响应归一 | `docs/core/design/PROVIDER.md` |
| `memory/` | 记忆、代码和文档索引 | `docs/core/design/MEMORY.md` |
| `mcp/` | MCP 客户端 | `docs/core/design/MCP.md` |
| `traces/` | 运行轨迹存储 | `docs/core/design/TRACES.md` |
| `prompts/` | 运行期提示词唯一正本 | `docs/core/design/PROMPT-SYSTEM.md` |
| `tool-docs/` | 模型可见工具描述 | `docs/core/design/PROMPT-SYSTEM.md` |
| 会话、配置和上下文模块 | 会话槽位、配置读写、压缩和 token 预算 | `docs/core/design/SESSION.md` · `docs/core/design/CONFIG.md` · `docs/core/design/CONTEXT-COMPACTION.md` |

### 3.2 render-core

`thincoder-render-core/` 提供浏览器原生 DOM 构件和纯函数，包括会话流、卡片、子块、输入面板、Markdown、搜索和本地化原语。

它不包含宿主句柄、端侧出站协议或宿主主题配置。详细边界 = `docs/render-core/design/RENDER-CORE.md`。

### 3.3 CLI

- `thincoder-cli/bin/thincoder.mjs`：命令分发。
- `src/tui/`：终端界面、命令和交互。
- `src/cli/`：启动与装配。
- `src/acp/`：ACP 协议桥。
- 崩溃报告、升级和进程诊断位于相应壳模块。

设计入口 = `docs/cli/design/CLI-ENTRY.md` · `docs/cli/design/TUI.md` · `docs/cli/design/ACP-CLIENT.md`。

### 3.4 VSC

| 面 | 职责 | 设计入口 |
|---|---|---|
| `extension.mjs` 与 `src/extension/` | 激活、面板、命令、会话和宿主适配 | `docs/vsc/design/WEBVIEW.md` |
| `src/agent/` | 端侧 agent 装配与回合驱动 | `docs/core/design/AGENT-LOOP.md` |
| `src/tools/` | 宿主增强工具 | `docs/core/design/TOOLS.md` |
| `webview/` | 隔离界面、消息协议和用户输入 | `docs/vsc/design/WEBVIEW-PROTOCOL.md` · `docs/vsc/design/WEBVIEW-INPUT.md` |
| 设置与 provider 流 | 配置、预设和渠道管理 | `docs/vsc/design/SETTINGS.md` |

### 3.5 Desktop

| 面 | 职责 | 设计入口 |
|---|---|---|
| `src/main/` | 主进程、窗口、协议供给和 IPC | `docs/desktop/design/SHELL.md` · `docs/desktop/design/IPC.md` |
| `src/preload/` | 沙箱窄桥 | `docs/desktop/design/IPC.md` |
| `renderer/` | 原生 ESM 与手写 DOM 界面 | `docs/desktop/design/RENDERER.md` · `docs/desktop/design/UI.md` |
| `scripts/` | 安装包和产物校验 | `docs/desktop/design/PACKAGING.md` |
| `test/` | 包级检查与桌面驱动支持 | `docs/desktop/design/E2E-TESTING.md` |

### 3.6 Server

| 面 | 职责 | 设计入口 |
|---|---|---|
| `src/gateway/` | 网关入口、错误和公共协议 | `docs/server/design/gateway/API.md` |
| `src/accounts/` | 账号、成员、密钥和审计 | `docs/server/design/accounts/ACCOUNTS.md` |
| `src/agent/` | 服务端 agent 会话与任务 | `docs/server/design/agent/ADMIN-AGENT.md` · `docs/server/design/agent/MEMBER-AGENT.md` |
| `src/project/` 与 `src/sandbox/` | 项目、执行环境和远端工作区 | `docs/server/design/project/PROJECTS.md` · `docs/server/design/sandbox/SANDBOX.md` |
| `src/store/` | SQLite 存储与迁移 | `docs/server/design/store/STORE.md` |
| `src/webui/` 与 `public/` | 控制台业务与前端 | `docs/server/design/webui/WEBUI.md` |
| `deploy/` | 部署、容器和运行环境 | `docs/server/design/ops/OPS.md` |

## 4. 模块接口速览

| 模块 | 关键接口或对象 | 用途 | 详细设计 |
|---|---|---|---|
| agent | `createAgent` · `runAgent` | 创建并运行 agent 回合 | `docs/core/design/AGENT-LOOP.md` |
| provider | transport 族 | 模型请求、响应、重试与限流 | `docs/core/design/PROVIDER.md` |
| tools | `builtinTools` · `assembleBuiltinTools` | 工具注册和实例绑定 | `docs/core/design/TOOLS.md` |
| context | 压缩与估算接口 | 控制上下文预算 | `docs/core/design/CONTEXT-COMPACTION.md` |
| memory | 记忆与检索接口 | personal、project、team 和代码文档索引 | `docs/core/design/MEMORY.md` |
| config | `loadConfig` · `writeConfigAtomic` | 配置读取、迁移与原子写入 | `docs/core/design/CONFIG.md` |
| session | 槽位与历史接口 | 跨端会话持久化和恢复 | `docs/core/design/SESSION.md` |
| advisor | 评审入口 | 设计与代码评审 | `docs/core/design/ADVISOR-CONVERGENCE.md` |
| mcp | MCP 工具展开 | 将外部工具并入工具面 | `docs/core/design/MCP.md` |
| traces | 轨迹读写 | 运行记录与清理 | `docs/core/design/TRACES.md` |
| checkpoint | git 快照 | 破坏性操作前保存可恢复状态 | `docs/core/design/CHECKPOINT.md` |
| render-core | DOM 构件与纯函数 | 跨端共享呈现机制 | `docs/render-core/design/RENDER-CORE.md` |
| CLI TUI | `startTUI` | 终端用户入口 | `docs/cli/design/TUI.md` |
| ACP | ACP 桥 | IDE 客户端协议连接 | `docs/cli/design/ACP-CLIENT.md` |
| Server | HTTP、存储与控制台接口 | 团队网关和协同服务 | `docs/server/design/PROJECT.md` |

## 5. 跨模块机制

- 工具注入范围、子代理权限和异步池由 agent 与工具设计共同约束。
- 配置、会话和记忆的用户数据目录由 core 统一解析，端侧不另造根目录。
- 文档检索、机械检查和引用图使用 manifest 声明，不在各端硬编码另一套根。
- 集成测试从用户入口贯穿端与共享核，core 和 render-core 不另设平行集成体系。
- 提示词和工具描述是产品代码，文档层不保存第二份运行期正本。

详细机制分别归 `docs/core/design/AGENT-LOOP.md`、`TOOLS.md`、`SESSION.md`、`MEMORY.md`、`DOC-SYSTEM.md` 和 `TESTING.md`。
