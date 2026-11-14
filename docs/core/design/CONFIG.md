# 配置系统（CONFIG）· 设计

> 需求 = `docs/core/requirements/CONFIG.md`。
> 最近先例：`docs/core/design/SETTINGS-TOOL.md` 的原子写和热应用。对齐 = 同一配置文件、同一写链；偏离 = 本档负责装载与迁移，不复制 settings 工具契约。
> 勘察证据：已读当前 CONFIG / SETTINGS-TOOL 文档，并核对 `manifest-schema.mjs` 与配置工具描述的现行键面。相关 = 配置分层与声明边界。

## 1. 模块归属

| 面 | 实现 |
|---|---|
| 装载与归一 | `thincoder-core/config.mjs` |
| 默认值 | `thincoder-core/config-defaults.mjs` |
| 原子读写 | `thincoder-core/config-io.mjs` |
| 迁移 | `thincoder-core/config-migrate.mjs` |
| Provider 预设 | `thincoder-core/config-presets.mjs` |
| settings 工具 | `thincoder-core/agent-tools/settings.mjs` |
| 家目录展开 | `thincoder-core/expand-home.mjs` |
| 代理 | `thincoder-core/proxy.mjs` |
| 团队登录 | `thincoder-core/team.mjs` |

端侧负责设置界面、宿主监视、宿主旧配置迁移和交互流程，不复制装载器。

## 2. 装载与持久化

### 2.1 装载管线

1. 定位共享配置文件。
2. 读取并解析 JSON。
3. 执行受支持的迁移。
4. 合并默认值与已知配置域。
5. 展开需要路径归一的字段。
6. 形成 provider、agent、advisor 等当前消费视图。

读取期的展开与归一不写回用户原文。需要保存时由明确写动作执行。

### 2.2 原子写

`writeConfigAtomic` 在写前读取最新磁盘状态，只修改当前动作的目标，检测并发冲突并原子替换。

失败时不得让调用方认为写入和热应用已经成功。默认值不应因为一次点改被无条件固化到磁盘。

### 2.3 派生视图

`agent.advisor` 等嵌套配置可形成顶层运行视图。settings 写入时必须同步对应派生视图，同时保留运行期会话级值。

## 3. 路径与环境引用

### 3.1 家目录

`expand-home` 处理 `~`、`~/x` 和 Windows 分隔符。`~user`、路径中间的 `~` 和非字符串不猜测展开。

展开只作用于声明支持它的字段。消费相对路径时使用当前项目或配置约定的基根。

### 3.2 `${env:VAR}`

实现位于 `thincoder-core/env-ref.mjs`，提供字符串、键值对象、provider 和 MCP 形状适配。

支持整值和内嵌引用。变量未设、为空或引用形态非法时，消费点明确报错。非字符串原样通过，解析产物不再次递归解析。

生效面包括当前支持的 provider、MCP、websearch、embedding 敏感值。引用原文留在磁盘，解析结果只进入请求或连接，不回显、不回写。

## 4. 配置通道

| 通道 | 用途 |
|---|---|
| 配置键 | 用户可配置行为 |
| 工具 CLI 参数 | bench 等独立工具 |
| 测试 setter seam | 隔离日志、轨迹和输出目录 |
| 显式 argv | 子进程与测试入口 |

不得为同一行为再添加隐式环境变量回退。操作系统、CI 和外部工具约定的环境变量仍按其外部契约处理。

## 5. 专题键面

### 5.1 并发池

`agent.poolLimits` 包含 engCoder、other、advisor。各池在运行读取点校验正整数并使用当前默认值。

subagent 与 advisor 可以有各自读取器，但默认值与界面展示必须同源。评审轮次不受池容量键影响。

### 5.2 团队登录

team 段由 `team.mjs` 的登录和退出流程写入。通用 settings 不写它。登录态使用当前团队契约中的 token 判据。

### 5.3 网络后端

`websearch.backend` 与 `fetch.backend` 支持 auto / local：

- auto 允许按当前资格规则选择可用后端。
- local 跳过 DeepSeek 后端，继续使用当前本地或其他搜索链。
- 两键不解析环境引用，也不新增隐式 env 配置。

### 5.4 互斥工作模式

DEFAULTS.agent.mode = normal。装载器先读取合法 agent.mode；只有该键缺席时，才把旧 agent.engineering 布尔值迁移为 engineering 或 normal。

旧值 `minimal` 是 `tiny` 的历史写法：`resolveWorkMode` 与 `resolveSessionWorkMode` 读到它返回 `tiny`，不因为不在枚举内而回落 `normal`。写入面只产 `tiny`，不再把 `minimal` 当合法值。

归一只在读取面发生，读取路径不写盘。理由 = 一次「打开会话」不该变成一次磁盘写入：历史读面只读，槽文件在多实例下还可能被另一进程同时写，读取时改写会制造一处谁先写的竞争。而不改写不累积成本——归一是一次字符串比较，每轮读一次归一次——磁盘上的旧字面留到该会话下一次写 mode（模式命令、宿主控件或设置写入）时才换成 `tiny`。

运行配置可向旧消费者派生 agent.engineering = (mode === "engineering")。这个派生值不参与通用 settings 写入，也不能被界面单独修改。

settings 的 agent.mode 写值只接受 tiny、normal、engineering。CLI、VSC、Desktop 共用同一键和值域，固定选项不使用自由文本。

档名在这三档的每个称谓面同写：枚举值与槽值、斜杠命令名、状态栏横幅、i18n 键与英文值、用户可见的英文选项文案（设置页标签、命令说明、CLI 设置里的档位选项）、源码注释里陈述值域与命令名的行、以及代码里以档名命名的标识符（`thincoder-core/prompt-files.mjs` 的 `expandKnowledgeTopics` 档位选项一形）。旧名 `minimal` 只作为读兼容的输入值存在，不作第二称谓。

只改键不改值，用户看见的仍是旧名：键与值是同一件事的两半，改名时两者同轮改。

配置保存的是新会话默认值；会话槽保存既有会话模式。恢复和运行期切换见 SESSION 与 PROMPT-SYSTEM。

## 6. 端侧适配

- CLI：TUI 设置、模型选择和命令。
- VSC：设置面板、宿主监视和旧宿主配置迁移。
- Desktop：复用 core 装载与渲染界面。
- 任一端都不能因为宿主差异改变共享配置的键语义。
- 读到旧字面 `minimal` 的各端在各自读取口归一为 `tiny`（值域与时机见 §5.4）。以下五处现行各自定义模式字面、不 import 核，故各面就地实现同一句映射，语义以 §5.4 为源、互不 import：`thincoder-desktop/renderer/events-flags.mjs` · `thincoder-render-core/composer/controls.mjs` · `thincoder-server/public/views-me-chat-composer.mjs` · `thincoder-server/src/agent/member-routes.mjs` · `thincoder-server/deploy/sandbox/member-shell/core-run-util.mjs`。
- 另两面走核归一、不另写映射：`thincoder-desktop/src/main/session-flags.mjs` 读槽 mode 走 `@thincoder/core/config.mjs` 的 `resolveSessionWorkMode`，其本地 `MODES` 数组只作写入校验；`thincoder-vscode/src/extension/panel-session-write.mjs` 在槽写回前以 `@thincoder/core/config-migrate.mjs` 的 `normalizeWorkMode` 归一 `extra.mode ?? existing.mode`，旧槽的 `minimal` 因此不会被原样写回。
- 新会话默认档的选项表直接列出三个新值、不列 `minimal`：
  - `thincoder-desktop/renderer/views/settings-agent.mjs` 的 `modeOptions`
  - `thincoder-vscode/webview/settings-agent.js` 的 `agentCardHtml`
  - `thincoder-vscode/webview/index.html` 的 `#mode-select`
- VSC 那一面的输入已由核归一：`thincoder-vscode/src/extension/settings.mjs` 的 `loadAgentSettings` 以 `mode: resolveWorkMode(a)` 产出该值，`agentSettings` 把它下发为 `defaultMode`，所以 `minimal` 到不了这三张选项表。一面若可能收到旧字面，按上一条在读取口归一，不在选项表里留旧值。
- 档位选项的标签由值派生（`settings.agent.mode${Mode}` 一形），故 i18n 键随值改：`toolbar.modeMinimal` → `toolbar.modeTiny`、`settings.agent.modeMinimal` → `settings.agent.modeTiny`、`slash.desc.minimal` → `slash.desc.tiny`。推理强度的 `reasoning.minimal` 是另一个值域，键名与同面的英文值 `Minimal` 都不动。
- 英文值随档名走：`settings.agent.modeTiny` 显示 `Tiny`，`slash.desc.tiny` 是 `toggle tiny ↔ normal work mode`；非词表的内联说明同改，共两处：`thincoder-cli/src/tui/slash-commands.mjs` 的 `/tiny` 行，以及 `thincoder-cli/src/tui/cmd-config.mjs` 的档位选项文案 `tiny — compact prompts with on-demand knowledge`（同项的 `action` 也是值域取值）。
- 源码注释里陈述值域的写法同改（`thincoder-core/config-defaults.mjs` 的一行、`thincoder-render-core/composer/controls.mjs` 的一行、`thincoder-cli/src/tui/cmd-eng.mjs` 的文件头注）：注释不改也跑得过测试，改后它教的是旧名。
- 档位按钮缩写 `toolbar.modeTiny` 的值保持 `MIN`：它与 `NORMAL` ∥ `ENG` 同排，是宽度缩写，随排版而不随档名。
- 中文值不动（`极简`）。

## 7. 关键决策

| # | 决策 | 理由 |
|---|---|---|
| D-CF1 | core 统一默认值与装载 | 防止各端配置含义漂移 |
| D-CF2 | 读取归一不写回 | 保留用户原文与跨机器可移植性 |
| D-CF3 | 原子写检测并发 | 防止多实例覆盖彼此修改 |
| D-CF4 | 环境变量只作显式值引用 | 避免隐式全局配置与凭据回退 |
| D-CF5 | 团队登录独立写面 | 凭据不进入通用配置工具 |
| D-CF6 | 配置界面与工具共用语义 | 不让手动入口和 agent 入口产生两种结果 |

## 8. 验证

验证覆盖装载、缺省、迁移幂等、原子写冲突、路径展开、环境引用失败、派生视图和端侧共享语义。敏感值验证同时检查输出与磁盘原文。
