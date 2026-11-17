# 撞轮数墙可继续（TURN-CAP-CONTINUE）· 需求

> 设计 = `docs/core/design/TURN-CAP-CONTINUE.md`；主循环 = `AGENT-LOOP.md`。

## 1. 目标

耗尽当前段 maxTurns 时保留同一执行体、历史与改动，由有权者决定继续或停止，不重开任务。

## 2. 功能需求

| # | 需求 |
|---|---|
| F1 | 撞帽统一抛 ContinueError；继续以 resume:true 重入同一执行体 |
| F2 | 续跑不重新注入任务，保留 history、写序与当前工作状态 |
| F3 | 主 agent、子代理、escalate、consult 都有当前续跑或部分交付路径 |
| F4 | 拒绝、headless 或无法续跑时返回部分成果与明确 turn-cap 标记 |
| F5 | 用户 Stop/AbortError 优先，不弹继续卡、不自动续跑 |
| F6 | 同时撞帽的提示按当前会话队列串行；后台异步不直接弹用户卡 |
| F7 | 轮号跨段累计，显示当前段与累计读数，编号不倒退 |
| F8 | 异步族在段边界向父代理报请；AUTO 不自动批准续期 |
| F9 | 运行产物可自证实际 core 路径、版本与当前续跑接线 |
| F10 | 撞帽提示同时含本段轮数与累计轮数，不重复印等价 limit |

## 3. 执行体

| 执行体 | 预算配置 | 续跑决定 |
|---|---|---|
| 主 agent | agent.maxTurns | 用户；无人值守时部分收口 |
| 子代理/escalate | agent.subagentTurns | 异步由父 send/cancel；同步按用户卡 |
| consult | agent.consultTurns | 父检查点，续期重置当前 watchdog |

继续次数不设上限；每段仍受当前预算，停滞治理由用户 Stop 与看门狗负责。

## 4. 验收

- 续跑同 history、同改动、同累计轮号。
- 父未答、拒绝和中止都不会静默续跑。
- AUTO 不改变“需要裁定”的语义。
- 无父/headless 明确 partial。
- 打包产物缺当前检查点接线时发布检查失败。

## 5. 边界

不新增分段编号协议，不把零产出当自动续跑条件，不改变段内 maxTurns 判定。
