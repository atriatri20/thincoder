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

运行配置可向旧消费者派生 agent.engineering = (mode === "engineering")。这个派生值不参与通用 settings 写入，也不能被界面单独修改。

settings 的 agent.mode 写值只接受 minimal、normal、engineering。CLI、VSC、Desktop 共用同一键和值域，固定选项不使用自由文本。

配置保存的是新会话默认值；会话槽保存既有会话模式。恢复和运行期切换见 SESSION 与 PROMPT-SYSTEM。

## 6. 端侧适配

- CLI：TUI 设置、模型选择和命令。
- VSC：设置面板、宿主监视和旧宿主配置迁移。
- Desktop：复用 core 装载与渲染界面。
- 任一端都不能因为宿主差异改变共享配置的键语义。

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
