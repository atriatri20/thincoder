# Agent 运行参数（AGENT-PARAMS）· 设计

> 需求 = `docs/core/requirements/AGENT-PARAMS.md`。
> 最近先例：`SETTINGS-TOOL.md` 的装载/热应用与 `TURN-CAP-CONTINUE.md` 的段预算。对齐 = 单源默认、下一消费点生效。
> 勘察证据：已读 advisor timeout、maxTurns、subagentTurns 读取链。相关 = promoted 视图与配置 UI。

## 1. 默认值

- REVIEW_TIMEOUT_MS 是 advisor 墙钟默认值。
- DEFAULT_MAX_TURNS 是主 agent 默认值。
- DEFAULT_SUBAGENT_TURNS 是子代理与 escalate 默认值。
- consultTurns 与 goalTurns 由各自配置默认和当前常量提供。

## 2. 读取

### 2.1 advisor

loadConfig 通过 promoteAgentViews 生成 config.advisor；advisor loop 读取 agent.config.advisor.timeoutMs。

```js
const timeoutMs = Number.isFinite(value) && value > 0 ? value : REVIEW_TIMEOUT_MS
```

settings set 写 agent.advisor 子键、null 删除或整段赋值时复用同一 promote 规则。

### 2.2 主 agent

prepareRun 使用 `overrideTurns ?? config.agent.maxTurns ?? DEFAULT_MAX_TURNS`。

### 2.3 子代理

spawn 与 escalate 读取 parent.config.agent.subagentTurns，explore 不附加更低硬帽。

## 3. 配置呈现

设置 UI 展示并编辑这些键。auto/派生值与显式值分开标识；非法输入在写面拒绝。

CLI、VSC、Desktop 等只负责各自呈现与持久化接线，默认值仍由 core 提供。

## 4. 验证

验证默认、显式覆盖、null 删除、非法手写回退、settings 热应用、配置 UI 读写和各执行体预算独立。
