# 会诊（CONSULTATION）· 需求

> 设计 = `docs/core/design/CONSULTATION.md`；评审 = `ADVISOR-CONVERGENCE.md`；实现升级 = `ESCALATE.md`。

## 1. 目标

agent.consultModels 配置多个候选模型。consult_start 对同一问题并行收集只读意见，主 agent 在全量 digest 到达后自行核实和采纳。

## 2. 行为

- 顶层立即返回 id 与 models，不等待顾问完成。
- models 可从当前池选择子集；无匹配明确报错。
- 每个顾问使用独立 provider/model/effort 和只读工具。
- main_history 按需读取主会话失败轨迹，有界且不包含图片原文。
- 所有顾问回复或失败后形成一次 digest；部分结果不提前注入。
- consult_stop 取消在飞项并丢弃该次 digest。
- 会话跨 turn；仅当前会话全停等规则终止。
- 意见不是业务门或已验证事实。

## 3. 配置与资源

候选池最多当前上限；consultTurns 与 consultTimeoutMs 控制每顾问预算。配置 UI 提供池与预算编辑。

digest 使用统一 pending、投递和销账机制。顾问活动块在各宿主可见。

## 4. 边界

不让顾问写文件，不做顾问间通信，不自动执行建议，不设置 consult_check 轮询工具。
