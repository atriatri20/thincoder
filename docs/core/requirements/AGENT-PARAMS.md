# Agent 运行参数（AGENT-PARAMS）· 需求

> 设计 = `docs/core/design/AGENT-PARAMS.md`；配置总面 = `CONFIG.md`。

## 1. 参数面

| 参数 | 配置键 | 当前默认 |
|---|---|---|
| 主 agent 段轮数 | agent.maxTurns | 200 |
| 子代理与 escalate 段轮数 | agent.subagentTurns | 100 |
| consult 段轮数 | agent.consultTurns | 40 |
| goal 模式预算 | agent.goalTurns | 200 |
| advisor 整体墙钟 | agent.advisor.timeoutMs | 600000 ms |

explore 使用 subagentTurns，不另设角色硬帽。

## 2. 功能需求

- F-AP1：advisor timeoutMs 在下一检查点生效，默认值足够覆盖长评审。
- F-AP2：手写的非有限数、零和负数回退默认，不能禁用或立即触发超时。
- F-AP3：子代理统一读取 subagentTurns。
- F-AP4：主 agent 统一读取 maxTurns，配置显示与运行值同源。
- F-AP5：这些配置项都有当前设置 UI；无需重启的项在下一消费点生效。

## 3. 非功能需求

- 默认值只有一个代码来源，配置层不复制出第二套默认。
- settings set 对已知键做类型与值域校验。
- 加载期 promoted 视图与设置写回保持同一规则。
- 各宿主读同一 core 配置语义。

## 4. 边界

不把不同执行体的预算合并，不用轮数上限替代停滞治理，不靠手写配置作为常规入口。
