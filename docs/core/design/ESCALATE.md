# 飞刀（ESCALATE）· 设计

> 需求 = `docs/core/requirements/ESCALATE.md`。
> 最近先例：`AGENT-LOOP-SUBAGENT.md` 的 coder 与 `AGENT-LOOP-ASYNC-POOL.md` 的 other 池。对齐 = 同一动作面与结算。
> 勘察证据：已读候选池、权限、异步结算和撞帽。相关 = 当前顶层异步参数门。

## 1. 参数与准入

subagent action=escalate，task 必填，model 为 consultModels 候选，async 遵循当前 depth 规则。

depth>0、工程模式或空池明确不可用。候选 effort 按模型枚举钳制。

## 2. 执行

executeEscalateAction/launchEscalateAsync 创建 role=coder 子代理，使用 resolveChildProvider 与正常写权限。

活动流使用当前 escalate 标识，宿主负责呈现。

## 3. 结算

- done：mergeChildMutations，重叠在报告中警告。
- error：按父侧重叠与当前 partial 规则处理，不宣称完整交付。
- cancelled：不 merge，不生成成功报告。
- abort：按统一清池与 discarded 规则。

报告进入统一 pending/digest。合并后父 verify/advisor 状态按当前规则失效或重置。

## 4. 轮数与中止

使用 subagentTurns、provider 超时与用户 Stop。异步撞帽走父检查点；同步机制只存在当前允许的子层场景。

## 5. 验证

验证准入、候选、写权、池、三种结算、父守卫、撞帽与 Stop。
