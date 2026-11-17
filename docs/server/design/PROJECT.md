# ThinCoder Server · 设计总览

> 需求 = `docs/server/requirements/PROJECT.md`。
> 最近先例：`docs/core/design/ARCHITECTURE.md` 的模块边界与 `CORE-UNIFICATION.md` 的核复用。对齐 = 服务端专有域自持、共有 agent/render 件取核。
> 勘察证据：已读十二域责任、双主链、core 依赖与演进断点。相关 = 当前 server 架构。

## 1. 架构

单进程 ESM，node:http/https 与 node:sqlite，无构建。路由注册、顺序迁移和域目录支持增量演进。

gateway 提供 OpenAI 面、控制台 API 与静态面；accounts 鉴权；metering 计量配额；store 迁移；webui 页面；ops 配置部署；client 端登录；project 权限同步；ledger 团队账；sandbox 执行；agent 管理/成员会话；mcp 服务接入。

聊天链：团队 key 鉴权 → 模型解析 → 配额/限流 → 上游 SSE → usage tap → usage 与派生计数同事务。

控制台链：登录 cookie → 后端角色/资源判权 → 自助或管理 API；前端隐藏不代替后端拒绝。

## 2. core 边界

字节中继、DB、账号、配额、控制台和沙盒自持。agent 与 web 会话按清单复用 @thincoder/core，消息呈现复用 @thincoder/render-core。

依赖版本覆盖实际导出，发布时核包先于或同拍可用；缺核明确失败。服务端不复制 core 的会话、MCP 或渲染状态机。

## 3. 文档地图

| 域 | 权威档 |
|---|---|
| 板级 | `PROJECT.md`、`EVOLUTION.md` |
| gateway | `gateway/API.md`、`gateway/PUBLICNET.md` |
| accounts/store/metering | `accounts/ACCOUNTS.md`、`store/STORE.md`、`metering/METERING.md` |
| ops/client | `ops/OPS.md`、`client/CLIENT.md` |
| project/ledger/mcp | `project/PROJECTS.md`、`ledger/LEDGER.md`、`mcp/MCP.md` |
| sandbox | `sandbox/SANDBOX.md`、`sandbox/EXECUTION.md` |
| agent | `agent/ADMIN-AGENT.md`、`agent/MEMBER-AGENT.md` |
| webui | `webui/WEBUI.md`、`ADMIN.md`、`ME.md`、`READINGS.md`、`SYSTEM.md`、`STYLE.md`、`I18N.md`、`TABS.md`、`CHAT.md`、`TERMINAL.md`、`PROJECTS.md`、`LEDGER.md`、`SANDBOX.md`、`MCP.md` |

各域档拥有机制、端点、存储与验收；本总览不复制其细目。
