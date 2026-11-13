# ThinCoder 项目文档地图

本目录是项目级文档层。本图只登记当前文档的归属和入口；执行过程由 `batches/` 承载，历史版本由 git 承载。

下表中的路径均相对本目录。检索与检查范围以 `PROJECT-MANIFEST.json` 的 `docRoot` 声明为准。

## 1. 查找顺序

1. 先按板块定位需求文档，确认目标、边界和验收条件。
2. 再读同主题设计文档，确认机制、接口和实现归属。
3. 需要核对验收资产时，进入 `test/RTM.md` 及其分册。
4. 需要了解某次修改过程时，再读 `batches/` 中的过程记录；过程记录不作为当前规则的权威来源。

## 2. 文档层

| 层 | 位置 | 回答的问题 |
|---|---|---|
| 需求 | `<板块>/requirements/` | 产品或机制现在必须做到什么 |
| 设计 | `<板块>/design/` | 当前机制如何实现，边界和理由是什么 |
| 标准 | `core/standards/` | 跨主题共用的工程与方法标准 |
| 发布 | `RELEASE.md` | 各发布单元如何验证和发布 |
| 测试环境 | `TEST-ENV-ECS.md` | 内部测试机器如何访问、部署和自检 |
| 批次 | `batches/` | 一轮工作如何设计、实施、评审和收口 |
| 集成追溯 | `../test/RTM.md` · `../test/rtm/` | 业务故事由哪些集成用例覆盖 |

项目台账不在工作树内，通过 `ledger` 工具查询。提示词的唯一副本在 `thincoder-core/prompts/`，不是本目录的文档层。

## 3. 总体与治理入口

| 主题 | 权威文档 |
|---|---|
| 项目目标与范围 | `core/requirements/PROJECT.md` |
| 产品与工程原则 | `core/requirements/PHILOSOPHY.md` |
| 总体架构 | `core/design/ARCHITECTURE.md` |
| 核心统一与模块关系 | `core/requirements/CORE-UNIFICATION.md` · `core/design/CORE-UNIFICATION.md` |
| 文档体系需求与落点 | `core/requirements/DOC-SYSTEM.md` · `core/design/DOC-SYSTEM.md` |
| 文档体系诊断 | `DOC-SYSTEM-ASSESSMENT.md`（带日期的诊断报告，不作当前规范） |
| 文档写作与失效处置 | `core/design/DOC-DISCIPLINE.md` |
| 文档机械检查 | `core/requirements/DOC-CHECK.md` · `core/design/DOC-CHECK.md` |
| 文档引用图 | `core/requirements/DOC-GRAPH.md` · `core/design/DOC-GRAPH.md` |
| 文档与代码 reconciliation | `core/design/DOC-CODE-RECONCILE.md` |
| 方法与协作标准 | `core/standards/METHODOLOGY.md` |
| 代码结构分档标准 | `core/standards/CODE-TIER.md` |

## 4. core 文档索引

### 4.1 总体、工作区与可移植性

| 主题 | 需求 | 设计 |
|---|---|---|
| 核心统一 | `core/requirements/CORE-UNIFICATION.md` | `core/design/CORE-UNIFICATION.md` |
| 普通模式 | `core/requirements/NORMAL-MODE.md` | — |
| 可移植性 | `core/requirements/PORTABILITY.md` | `core/design/PORTABILITY.md` |
| 结构债务 | `core/requirements/STRUCTURE-DEBT.md` | `core/design/STRUCTURE-DEBT.md` |
| 仓库合并 | `core/requirements/TWO-REPO-MERGE.md` | `core/design/TWO-REPO-MERGE.md` |
| 工作区约定 | `core/requirements/WORKSPACE.md` | `core/design/WORKSPACE.md` |
| 文案与本地化 | `core/requirements/I18N.md` | `core/design/I18N.md` |
| 日志 | `core/requirements/LOGGING.md` | `core/design/LOGGING.md` |
| 轨迹 | `core/requirements/TRACES.md` | `core/design/TRACES.md` |
| 会话可观测性 | — | `core/design/SESSION-OBSERVABILITY.md` |

### 4.2 文档、测试与工程流程

| 主题 | 需求 | 设计 |
|---|---|---|
| 文档体系 | `core/requirements/DOC-SYSTEM.md` | `core/design/DOC-SYSTEM.md` |
| 文档检查 | `core/requirements/DOC-CHECK.md` | `core/design/DOC-CHECK.md` |
| 文档图 | `core/requirements/DOC-GRAPH.md` | `core/design/DOC-GRAPH.md` |
| 文档纪律 | — | `core/design/DOC-DISCIPLINE.md` |
| 文档与代码对账 | — | `core/design/DOC-CODE-RECONCILE.md` |
| 锚点债务修复 | — | `core/design/ANCHOR-DEBT-REPAIR.md` |
| 测试体系 | `core/requirements/TESTING.md` | `core/design/TESTING.md` |
| 工程模式 | `core/requirements/ENGINEERING-MODE-V2.md` | `core/design/ENGINEERING-MODE-V2.md` |
| 工程系统优化 | `core/requirements/ENGINEERING-SYSTEM-OPTIMIZATION.md` | — |
| 批档结构 | `core/requirements/ENGINEERING-MODE-V2-SPEC-BATCH-SEGMENT.md` | `core/design/BATCH-RECORD.md` |
| 批档、台账与评审统一 | — | `core/design/BATCH-LEDGER-REVIEW-UNIFY.md` |
| 检查单移除 | `core/requirements/ENGINEERING-MODE-V2-SPEC-CHECKLIST-REMOVAL.md` | — |
| 跨仓写 | `core/requirements/ENGINEERING-MODE-V2-SPEC-CROSS-REPO-WRITE.md` | `core/design/CROSS-REPO-WRITE.md` |
| 委派 | `core/requirements/ENGINEERING-MODE-V2-SPEC-DELEGATION.md` | — |
| 台账规格 | `core/requirements/ENGINEERING-MODE-V2-SPEC-LEDGER.md` | `core/design/LEDGER.md` |
| 机械检查规格 | `core/requirements/ENGINEERING-MODE-V2-SPEC-MACHINE-CHECK.md` | — |
| 项目声明规格 | `core/requirements/ENGINEERING-MODE-V2-SPEC-MANIFEST.md` | `core/design/MANIFEST.md` |
| 提示词管线规格 | `core/requirements/ENGINEERING-MODE-V2-SPEC-PROMPT-PIPELINE.md` | — |
| 评审凭证规格 | `core/requirements/ENGINEERING-MODE-V2-SPEC-REVIEW-CREDENTIAL.md` | — |
| 工程 token 绑定 | `core/requirements/ENG-TOKEN-BINDING.md` | `core/design/ENG-TOKEN-BINDING.md` |
| 测试纪律规格 | `core/requirements/ENGINEERING-MODE-V2-SPEC-TEST-DISCIPLINE.md` | — |
| 写门规格 | `core/requirements/ENGINEERING-MODE-V2-SPEC-WRITE-GATE.md` | — |
| 设计凭证结算 | `core/requirements/DESIGN-TOKEN-SETTLEMENT.md` | `core/design/DESIGN-TOKEN-SETTLEMENT.md` |
| 台账自含 | — | `core/design/LEDGER-SELF-CONTAINED.md` |
| 验证工具 | `core/requirements/VERIFY-REDESIGN.md` | `core/design/VERIFY-REDESIGN.md` |
| 回合上限与续跑 | `core/requirements/TURN-CAP-CONTINUE.md` | `core/design/TURN-CAP-CONTINUE.md` |

### 4.3 提示词、agent 与协作

| 主题 | 需求 | 设计 |
|---|---|---|
| 提示词系统 | `core/requirements/PROMPT-SYSTEM.md` | `core/design/PROMPT-SYSTEM.md` |
| 提示词夹具 | — | `core/design/PROMPT-FIXTURE.md` |
| agent 主循环 | `core/requirements/AGENT-LOOP.md` | `core/design/AGENT-LOOP.md` |
| 异步代理池 | — | `core/design/AGENT-LOOP-ASYNC-POOL.md` |
| 子代理 | — | `core/design/AGENT-LOOP-SUBAGENT.md` |
| 上游请求循环 | — | `core/design/AGENT-LOOP-UPSTREAM.md` |
| agent 参数 | `core/requirements/AGENT-PARAMS.md` | `core/design/AGENT-PARAMS.md` |
| 上下文压缩 | `core/requirements/CONTEXT-COMPACTION.md` | `core/design/CONTEXT-COMPACTION.md` |
| 发送停滞提炼 | `core/requirements/SEND-STALL-DISTILL.md` | `core/design/SEND-STALL-DISTILL.md` |
| 超时与 digest | — | `core/design/TIMEOUT-DIGEST.md` |
| 评审收敛 | `core/requirements/ADVISOR-CONVERGENCE.md` | `core/design/ADVISOR-CONVERGENCE.md` |
| 评审守护 | — | `core/design/ADVISOR-GUARDS.md` |
| 会诊 | `core/requirements/CONSULTATION.md` | `core/design/CONSULTATION.md` |
| 飞刀 | `core/requirements/ESCALATE.md` | `core/design/ESCALATE.md` |
| 多实例协作 | `core/requirements/MULTI-INSTANCE-COLLAB.md` | `core/design/MULTI-INSTANCE-COLLAB.md` |

### 4.4 工具、模型与状态

| 主题 | 需求 | 设计 |
|---|---|---|
| 工具系统 | `core/requirements/TOOLS.md` | `core/design/TOOLS.md` |
| 补丁工具 | — | `core/design/APPLY-PATCH.md` |
| bash 执行面 | — | `core/design/BASH-EXECUTOR-FACE.md` |
| 浏览器工具 | `core/requirements/BROWSER-TOOL.md` | `core/design/BROWSER-TOOL.md` |
| 检查点 | `core/requirements/CHECKPOINT.md` | `core/design/CHECKPOINT.md` |
| 编辑工具 | — | `core/design/EDIT.md` |
| 编辑辅助 | — | `core/design/EDIT-HELPERS.md` |
| 哈希行编辑 | — | `core/design/HASHLINE-EDIT.md` |
| 插入工具 | — | `core/design/INSERT-AFTER.md` |
| 写入工具 | — | `core/design/WRITE.md` |
| 工具输出限制 | — | `core/design/TOOL-OUTPUT-LIMITS.md` |
| 工具参数零默认值 | — | `core/design/TOOL-PARAM-ZERO-DEFAULTS.md` |
| MCP | `core/requirements/MCP.md` | `core/design/MCP.md` |
| provider | `core/requirements/PROVIDER.md` | `core/design/PROVIDER.md` |
| 模型基准 | — | `core/design/MODEL-BENCH.md` |
| 模型规格 | — | `core/design/MODEL-SPECS.md` |
| 代理 | — | `core/design/PROXY.md` |
| 配置 | `core/requirements/CONFIG.md` | `core/design/CONFIG.md` |
| 记忆 | `core/requirements/MEMORY.md` | `core/design/MEMORY.md` |
| 会话 | `core/requirements/SESSION.md` | `core/design/SESSION.md` |
| 设置工具 | `core/requirements/SETTINGS-TOOL.md` | `core/design/SETTINGS-TOOL.md` |
| 路径解析 | — | `core/design/PATH-RESOLUTION.md` |
| 团队客户端 | — | `core/design/TEAM.md` |
| 团队台账客户端 | — | `core/design/TEAM-LEDGER.md` |

## 5. CLI 文档索引

| 主题 | 需求 | 设计 |
|---|---|---|
| 功能总览 | `cli/requirements/FEATURES.md` | — |
| TUI | `cli/requirements/TUI.md` | `cli/design/TUI.md` |
| TUI 命令 | — | `cli/design/TUI-COMMANDS.md` |
| TUI 输入框 | — | `cli/design/TUI-INPUT-BOX.md` |
| TUI 会话视图 | — | `cli/design/TUI-SESSION-VIEW.md` |
| TUI 工具输出 | `cli/requirements/TUI-TOOL-OUTPUT.md` | `cli/design/TUI-TOOL-OUTPUT.md` |
| ACP 客户端 | `cli/requirements/ACP-CLIENT.md` | `cli/design/ACP-CLIENT.md` |
| ACP 协议符合性 | — | `cli/design/ACP-PROTOCOL-COMPLIANCE.md` |
| CLI 入口 | — | `cli/design/CLI-ENTRY.md` |
| CLI 债务 | — | `cli/design/CLI-DEBT.md` |
| 崩溃报告 | `cli/requirements/CRASH-REPORTS.md` | `cli/design/CRASH-REPORTS.md` |
| 数据读取接口 | `cli/requirements/READ-DATA-INTERFACE.md` | `cli/design/READ-DATA-INTERFACE.md` |

## 6. VSC 文档索引

| 主题 | 需求 | 设计 |
|---|---|---|
| 项目需求 | `vsc/requirements/PROJECT.md` | — |
| Webview | `vsc/requirements/WEBVIEW.md` | `vsc/design/WEBVIEW.md` |
| Webview 输入 | — | `vsc/design/WEBVIEW-INPUT.md` |
| Webview 协议 | — | `vsc/design/WEBVIEW-PROTOCOL.md` |
| 设置 | — | `vsc/design/SETTINGS.md` |
| 项目切换 | — | `vsc/design/PROJECT-SWITCHER.md` |
| 迁移 | `vsc/requirements/VSC-MIGRATION.md` | `vsc/design/VSC-MIGRATION.md` |
| 技术债务 | — | `vsc/design/VSC-DEBT.md` |

## 7. Desktop 文档索引

| 主题 | 需求 | 设计 |
|---|---|---|
| 项目 | `desktop/requirements/PROJECT.md` | `desktop/design/PROJECT.md` |
| 活动区 | `desktop/requirements/ACTIVITY.md` | `desktop/design/ACTIVITY.md` |
| 聊天 | `desktop/requirements/CHAT.md` | `desktop/design/CHAT.md` |
| 输入与附件 | `desktop/requirements/COMPOSER.md` | `desktop/design/COMPOSER.md` |
| IPC | — | `desktop/design/IPC.md` |
| 菜单 | `desktop/requirements/MENU.md` | `desktop/design/MENU.md` |
| 打包 | `desktop/requirements/PACKAGING.md` | `desktop/design/PACKAGING.md` |
| 面板读回 | — | `desktop/design/PANEL-READBACK.md` |
| 渲染器 | — | `desktop/design/RENDERER.md` |
| 会话 | `desktop/requirements/SESSIONS.md` | `desktop/design/SESSIONS.md` |
| 设置 | `desktop/requirements/SETTINGS.md` | `desktop/design/SETTINGS.md` |
| 外壳 | `desktop/requirements/SHELL.md` | `desktop/design/SHELL.md` |
| UI | `desktop/requirements/UI.md` | `desktop/design/UI.md` |
| 端到端测试 | — | `desktop/design/E2E-TESTING.md` |
| Web 快速检查 | — | `desktop/design/WEB-QUICKCHECK.md` |

## 8. render-core 文档索引

| 主题 | 需求 | 设计 |
|---|---|---|
| 宿主无关渲染核 | `render-core/requirements/RENDER-CORE.md` | `render-core/design/RENDER-CORE.md` |

## 9. Server 文档索引

| 主题 | 需求 | 设计 |
|---|---|---|
| 项目与功能总览 | `server/requirements/PROJECT.md` | `server/design/PROJECT.md` |
| 演进 | — | `server/design/EVOLUTION.md` |
| 账号 | — | `server/design/accounts/ACCOUNTS.md` |
| 管理端 agent | — | `server/design/agent/ADMIN-AGENT.md` |
| 成员端 agent | — | `server/design/agent/MEMBER-AGENT.md` |
| 客户端接入 | — | `server/design/client/CLIENT.md` |
| 网关 API | — | `server/design/gateway/API.md` |
| 公网访问 | — | `server/design/gateway/PUBLICNET.md` |
| 团队台账 | — | `server/design/ledger/LEDGER.md` |
| MCP | — | `server/design/mcp/MCP.md` |
| 计量 | — | `server/design/metering/METERING.md` |
| 运维与部署 | — | `server/design/ops/OPS.md` |
| 项目管理 | — | `server/design/project/PROJECTS.md` |
| 沙箱 | — | `server/design/sandbox/SANDBOX.md` |
| 执行 | — | `server/design/sandbox/EXECUTION.md` |
| 存储 | — | `server/design/store/STORE.md` |
| 管理控制台 | — | `server/design/webui/ADMIN.md` |
| Web 聊天 | — | `server/design/webui/CHAT.md` |
| 控制台国际化 | — | `server/design/webui/I18N.md` |
| 台账界面 | — | `server/design/webui/LEDGER.md` |
| MCP 界面 | — | `server/design/webui/MCP.md` |
| 成员界面 | — | `server/design/webui/ME.md` |
| 项目界面 | — | `server/design/webui/PROJECTS.md` |
| 读数界面 | — | `server/design/webui/READINGS.md` |
| 沙箱界面 | — | `server/design/webui/SANDBOX.md` |
| 样式 | — | `server/design/webui/STYLE.md` |
| 系统界面 | — | `server/design/webui/SYSTEM.md` |
| 标签页 | — | `server/design/webui/TABS.md` |
| 终端界面 | — | `server/design/webui/TERMINAL.md` |
| WebUI 总体 | — | `server/design/webui/WEBUI.md` |
