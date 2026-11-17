# 飞刀（ESCALATE）· 需求

> 设计 = `docs/core/design/ESCALATE.md`；子代理 = `AGENT-LOOP-SUBAGENT.md`。

## 1. 定位

escalate 是 subagent 的动作，把复杂实现交给 agent.consultModels 中更强的一个模型，以 coder role 亲自修改并运行验证。

consult 只读给意见；escalate 可写并交付，两者不合并。

## 2. 功能需求

- 仅 depth-0 普通模式可用；工程模式实现走 eng-coder。
- 空候选池不注册。
- task 必须含目标、约束、入口与验收；model 可选，缺省当前首候选。
- 顶层显式异步，立即返回 running/queued ack。
- 报告自动到达，包含改动、理由、验证和 touched files。
- 改动合并父级守卫，重置相关验证/评审状态。
- done/error/cancelled 按当前合并与投递规则，取消不合并。
- Stop/AbortError 传播，无专属固定墙钟误杀。

## 3. 验收

验证写权限仍过父门、池调度、报告、重叠警告、部分改动、取消、工程拒绝、depth 拒绝和 effort 钳制。
