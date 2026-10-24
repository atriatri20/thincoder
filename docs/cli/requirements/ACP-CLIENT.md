# ACP 客户端协议接入（`thincoder acp`）· CLI 面 · 需求

> 板块 = **ACP 协议**（编辑器接线）——`thincoder acp` 子命令在 stdio 上通过 Agent Client Protocol（schema v1）暴露 agent。
> 配对设计档 = `docs/cli/design/ACP-CLIENT.md`。
> 层归属 = **CLI 面**（P2——VSC 仓无 ACP 实现，结构性不对称）。

## 1. 总体需求

`thincoder acp` 子命令在 **stdio 上通过 Agent Client Protocol（schema v1）暴露 thincoder agent**，
使 Zed / JetBrains AI Chat / Paseo 等 ACP 客户端可直接驱动。项目已有专有 VS Code 扩展；
ACP 一次实现即可接通多家编辑器（桌面 + Web + 移动自托管编排器）——补上「编辑器接线」生态位。

**核心体验（要什么）**

- **编辑器上下文自动注入**（打开文件 / 光标 / 选区，无需手动 `@`）；
- **agent 编辑以 IDE 原生 diff 应用**（fs 反向 RPC）；
- **工具审批弹在 IDE 内**（`request_permission`）；
- **登录态 / 会话复用**（一次终端登录、多表面可用）。

**协议权威**：`agentclientprotocol/agent-client-protocol` 仓库的 `schema/v1` 下 `schema.json`
（稳定协议版本 **1**；方法名 / 事件类型以 schema 为准）。**注意**：`@agentclientprotocol/sdk` 的版本号是 **SDK 包版本**、不是协议版本。

## 2. 功能性需求

| # | 需求 | 说明 |
|---|---|---|
| **F1** | 协议接入（schema v1 方法覆盖） | agent 侧 `initialize` / `authenticate` / `session/{new,load,resume,list,delete,prompt,cancel,close,set_mode,set_config_option}` 全接通；`logout` 不做（无账号体系）；unstable 扩展不做 |
| **F2** | 事件流与工具桥 | agent 输出以 `session/update` 事件块流式送达；**写路径走 IDE**（`fs/write_text_file`）——agent 编辑以 IDE 原生 diff 应用；edit 的判定委派本地单一权威（双通道同语义） |
| **F3** | 审批弹在 IDE | 工具审批经 `session/request_permission`；响应缺失 / 取消 / 未知 → 拒绝（安全优先） |
| **F4** | 登录态与会话复用 | 复用终端配置（`~/.thincoder/config.json`）；会话存档按槽位 load / resume / list / delete；每回合末存档；**并提供 `thincoder acp --login` 入口**（判定句见下） |
| **F5** | **headless 通道不提供不存在的交互能力** | 见下判定句 |
| **F6** | **TUI 显示路由信号零进 ACP 客户端可见面** | 见下判定句 |
| **F7** | **核事件 token（`⟦ev⟧…`）零进 ACP 客户端可见面** | 见下判定句 |
| **F8** | **ACP v1 契约形状合规（外部编排器可挂可用）** | 见下判定句 |

**F5 判定句（通道裁剪——question 工具）**

- **R-A1.1**：ACP 会话的工具集**不含** question 工具——装配期剔除（模型 schema 不可见、不可调用、零必错回合）。
  可验判据：以 ACP 会话剔除参数装配出的工具名集合与 schema 均不含 `question`。
- **R-A1.2**：question 工具的描述文本不得对无交互面的上下文作**无条件承诺**——须显式说明
  「无交互面（headless / 子代理上下文）时返回错误，问题放正文回复」。
- **R-A1.3**：通道裁剪对位——VSC 端 question 工具有原生 UI 兜底（非 ACP 面、无此缺陷）；
  CLI 侧其余无 UI 上下文（`thincoder chat`、子代理 children）的同类缺陷为**登记项**（设计档 §9）。

**F6 判定句（relay 前缀收敛）**

- **R-A2.1**：子代理 relay 前缀 `role#id/`（含任意嵌套深度）**零进入** ACP 客户端可见面：
  `agent_message_chunk` 文本、`agent_thought_chunk` 文本、`tool_call.title`、`session/request_permission` 的请求文本与 `toolCall.title`。
- **R-A2.2**：剥离**不得**改变内部配对语义——工具 id FIFO 配对键保持前缀原样
  （同名不同子代理互不错配；call 与 result 以同一原样名配对）。
- **R-A2.3**：relay 前缀文法 = **单一权威模块**（非 TUI 模块；生成侧再导出）——
  TUI 块路由与 ACP 剥离消费同一解析实现（防第二套平行正则再漂移）。
- **R-A2.4**：`onToolOutput`（工具输出流式增量）**明示缺**——ACP 不转发流式输出（父工具与子代理工具同口径）；
  工具卡承载参数与最终结果（能力缺口条款见设计档）。

**F7 判定句（核事件 token 剥离——形态判据）**

- **R-A3.1**：核事件 token（形态 `⟦ev⟧<事件名>\x1e<payload>`）**零进入** ACP 客户端可见面（面同 R-A2.1 所列）——
  识别 = **形态判据**（ASCII 小写事件名 + 终止符 `\x1e`），**不得**用事件名枚举白名单（枚举 = 漏项发生器：
  新增事件名静默泄漏——`queued` / `cancelled` 已在发射面而旧六名白名单未跟，经 `agent_message_chunk` 泄漏）。
- **R-A3.2**：剥离**不得**误伤正文——载荷含 `⟦ev⟧` 而**无** `\x1e` 终止符 ⇒ 仍转发（判据要求终止符同现）。
- **R-A3.3**：判据与**既有形态判据对齐**（VSC 宿主消费面 `panel-callbacks.mjs:44,85` 的形态兜底）——核生成侧
  `thincoder-core/agent/spawn-child.mjs:99-101` 系**枚举**放行判据；不自造第三套文法（relay 前缀文法单源见 R-A2.3）。
- **R-A3.4**（可验判据）：带 `queued` / `cancelled` 事件名（含 relay 前缀形态）驱动的通道用例**零可见面文本**（零 `agent_message_chunk`；结构化子代理事件增量见 R-A5.11）；
  载荷含 `⟦ev⟧` 无终止符的用例**照常转发**；既有 T9 信号 token 用例不退红。

**F4 判定句（登录入口 · R-A4）**

- **R-A4.1**：`thincoder acp --login` = 终端认证流程入口（`initialize.authMethods` 的 `terminal` 项 `args = ["--login"]` 即指向它）：进入设置向导 → 校验并补齐 `defaultModel` → 成功 **exit 0**；
  失败或非交互终端 ⇒ stderr 一行可行动文案 + **非 0 退出**（不静默挂死）。
- **R-A4.2**：`--login` **不进 stdio 服务模式**；不带 `--login` 的 `thincoder acp` 行为零变。
- **R-A4.3**：CLI `USAGE` 列出该入口（`thincoder acp --login` + 一句用途）。

**F8 判定句（契约形状合规 · R-A5）**

- **R-A5.1**：`initialize` 响应**只**含契约字段（`protocolVersion` / `agentCapabilities` / `authMethods` / `agentInfo` / `_meta`）；能力面**如实声明**
  （`loadSession` + `sessionCapabilities{list,resume,delete,close}`；不虚报 image / audio / embeddedContext；未实现的 `mcpCapabilities` / `additionalDirectories` 不声明）。
- **R-A5.2**：`protocolVersion` 按「支持则回同版本、否则回最新支持」协商（当前支持集 = `{1}`）。
- **R-A5.3**：`authMethods` = **对象数组**（`id` / `name` 齐备）；含 `terminal` 项 **⟺** `clientCapabilities.auth.terminal === true`（契约 MUST）。
- **R-A5.4**：会话方法响应形状——`session/new` 含 `sessionId`（**= 持久槽位号字符串**）；`session/list` 条目含 `sessionId` + `cwd`；`configOptions` 条目含 `id` + `name` + **判别键 `type`**（`select` 另含 `currentValue` + `options`；`boolean` 含 `currentValue`）；
  `set_config_option` 响应含**全量 `configOptions`**；`session/prompt` 入参取自 `params.prompt`。
- **R-A5.5**：`fs/*` 反向 RPC 发出前必过客户端能力位（`readTextFile` / `writeTextFile`）；未宣告 ⇒ 回落本地（不得干等超时）。
- **R-A5.6**：认证语义 = **凭据即时判据**（无跨调用闩锁）：`authenticate` 是**可选确认动作**（成功返回 `{}`；契约**禁止**客户端以 `terminal` 方法调它）；
  凭据不可解析 ⇒ `-32000` 且文案可行动（门失败**单档** = 无 provider/key ⇒ 指向 config 与 `--login`；持 key 而 `defaultModel` 不可解析 ⇒ **放行**，不作门失败——统一解析口径见 `doc:PROVIDER.md:§6.22`）。
- **R-A5.7**（可验判据）：无 TTY 的脚本化 stdio 客户端**全程不发 `authenticate`** 可完成 `initialize → session/new → session/prompt`（`stopReason:"end_turn"`）；
  非 TTY 下 `thincoder acp --login` **不挂死**（快速退出码非 0）。
- **R-A5.8**：`usage_update` 含 `used` + `size` 齐备（契约 required——`size` = 模型上下文窗）；`session/list` 条目 `updatedAt` = **ISO 8601 字符串**（非 epoch 数）。
- **R-A5.9**：会话身份 = **持久槽位号字符串**（单一命名空间）——`session/new` 返回的 `sessionId` **必现**于随后 `session/list`；`session/load` / `resume` 以客户端原 id 保续（后续 `prompt` / `cancel` / `close` / `set_*` 命中该会话）；两处状态通知字段名按契约（`currentModeId` ∥ 全量 `configOptions`）。
- **R-A5.10**：`session/prompt` 基线内容块面含 **`resource_link`**（`file://` 文件引用降级为文本内容块——含行选区间；上限 ∥ 二进制 ∥ 不存在三类降级标记可见、不静默）。
- **R-A5.11**：**结构化子代理事件 = `_meta` 扩展契约**——带 relay 前缀的事件 token（`⟦ev⟧<名>\x1e` 形态）经 `session/update` 的 `session_info_update` 变体**增量发射**（`update._meta["thincoder.dev/subagent"]` = `{role,id,state,progress?,detail?}`；现发射集 8 态、开集容忍）；
  **文本面剥离语义零改**（零 `agent_message_chunk`）；对不认本扩展的客户端**忽略即合规**；协议版本 ∥ `initialize` 形状 ∥ 方法面零动。契约全文 = `docs/cli/design/ACP-CLIENT.md` §12。
- **R-A5.12**：**协议面零提示 = 设计行为**——「fallback 放行」（R-A5.6）态在协议面**不产生任何提示信号**（唯一全客户端可见通道 = 对话文本）；重启条件 = 出现**协议感知客户端消费者**。

## 3. 非功能性需求

| # | 维度 | 标准 |
|---|---|---|
| **N1** | 性能 | ACP 层**零缓冲透传**——流式事件逐块转发不做缓冲合并；超长会话加载有可见延迟（协议无批量通道）——v1 接受 |
| **N2** | 兼容性 | 协议以 schema v1 为准；最低客户端 = 支持 `initialize` 版本协商的任何 ACP v1 客户端 |
| **N3** | 可维护性 | ACP 模块与 agent 核心解耦（可插拔点默认空实现）；协议细节收敛在 `thincoder-cli/src/acp/**` 下，TUI / CLI 其余面不感知 |
| **N4** | 会话资源 | 每 `session/new` 一个 agent 实例；v1 不设上限 |
| **N5** | 零语义改动面 | TUI 块路由 / 渲染语义零改——文法抽出为纯搬迁 + 再导出 |
| **N6** | 可验证性 | 新增断言档锁定三面——前缀零泄漏 / question 不在 ACP 工具集 / 文法单一权威 |
| **N7** | 无回归 | 既有 TUI 用例文件零修改通过；ACP 工具 id 配对（FIFO）语义不变 |
| **N8** | 无 TTY 可驱动 | 认证路径不依赖交互终端：脚本化 stdio 客户端（不发 `authenticate`、无 TTY）可完成 `initialize → session/new → session/prompt`；`thincoder acp --login` 在非 TTY 下快速退出（非 0）而非挂死 |

## 4. 不做项（明确裁剪）

| 不做 | 理由 |
|---|---|
| `logout` | 无账号体系 |
| terminal 反向 RPC | shell 本地执行 |
| `question` 工具（向用户提问） | ACP 无提问通道（不接通 elicitation）；会话装配期剔除该工具——模型不可见 |
| `onToolOutput`（工具输出流式增量） | **明示缺**（裁剪）——最终结果已送达；流式面自有设计面 |
| unstable 扩展（`elicitation/*` / auth-configuration / buffer sync / inline-edit 预测等） | 正常客户端流程不依赖 |
| audio prompt | 无音频输入通道 |
| ACP 会话写存档由客户端管理生命周期 | 存档由会话层每回合末写；客户端只负责连接生命周期 |
| 依赖官方 SDK（TS / Rust / Kotlin 等） | 零依赖哲学；自写层可测（schema v1 是唯一权威） |

## 5. 范围边界（不做）

- **不改 ACP 协议面**——不接通 elicitation / 不新增提问通道 / **不新增方法或变体**。（**形状合规 ≠ 协议面变更**：响应字段按 schema v1 收敛，落在 F8 / R-A5；**`_meta` 扩展契约面 = 例外通道**——R-A5.11 结构化子代理事件〔标准变体承载体 ∥ 扩展元数据——忽略即合规〕。）
- 不改 TUI 消费面语义（`routeSub*` / 渲染 / 事件文法零改——文法搬迁 = 纯迁移）。
- 不改 VSC 仓（无 ACP 镜像面）。
- 不做「子代理事件整体过滤」与「onToolOutput 流式补齐」（两者为登记候选——需用户裁定 / 独立设计面）。
