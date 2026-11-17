# 会诊（CONSULTATION）· 设计

> 需求 = `docs/core/requirements/CONSULTATION.md`。
> 最近先例：`AGENT-LOOP-ASYNC-POOL.md` 的 pending/digest 与 `AGENT-LOOP-SUBAGENT.md` 的 role 工具面。对齐 = 只读子代理、全 settle 一次报告。
> 勘察证据：已读 consult_start/stop、main_history、会话状态与消费。相关 = 当前自动 digest。

## 1. 发起

consult_start 从 agent.consultModels 过滤 models 子集，创建 _consultSessions 条目并启动独立 controller 的顾问。

返回 {id,models}。每个 child 通过 resolveChildProvider 装配，effort 越出模型枚举时按当前规则丢弃。

## 2. 顾问

role=consult，只读工具 + main_history。main_history 返回主会话尾部窗口，文本/工具调用有界，图像替换占位。

consultTurns 与 consultTimeoutMs 分别控制轮数与墙钟；撞帽按 TURN-CAP-CONTINUE 的当前父检查点处理。

## 3. 会话结算

Session 记录 controllers、replies、pending、failed、terminated、stopped、total/received。

所有成员回复或失败后，将完整报告放入统一 pending。报告逐模型标成功或失败；全失败也 settle。

consult_stop abort 剩余并标 cancelled，不产生 digest。未知或已结束 id 明确报错。

## 4. 消费

报告经统一空闲交付轮和 digest-account 处理。主 agent 读取后用普通工具核实，不把意见直接写成事实。

各端活动块在会话消费或停止时按当前冻结规则归档。

## 5. 验证

验证池子集、空池、只读、历史预算、全失败 digest、stop 无 digest、跨 turn、撞帽、pending 不重复与宿主活动块。
