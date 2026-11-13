# 撞轮数墙可继续（TURN-CAP-CONTINUE）· 设计

> 需求 = `docs/core/requirements/TURN-CAP-CONTINUE.md`。
> 最近先例：`AGENT-LOOP-UPSTREAM.md` 的 ask/send 与 `AGENT-LOOP.md` 的 resume。对齐 = 同一执行体、父侧裁定。
> 勘察证据：已读 ContinueError、四执行体、检查点和跨段编号。相关 = 当前子代理不自动续期。

## 1. 统一语义

runTurnLoop 段内 `turn < maxTurns`；耗尽抛 ContinueError。

runWithContinue 捕获后调用 askContinue；允许则以 resume:true 重入同一 child，拒绝走 onDeclined 与 TURN_CAP_MARK。

signal.aborted/AbortError 优先于 ContinueError 处理。

## 2. 检查点

异步子代理、escalate、consult 撞帽时 registerTurnCapCheckpoint 在当前条目记录段数、累计轮数和挂起点，并推送父侧 ask。

父用 send 续期并可附新段指令，用 cancel 停止。settleTurnCheckpoint/settleConsultCheckpoint 兑现当前登记。

同步族由用户卡处理；AUTO 不对 continue 自动放行。无父或无 handler 时 partial。

段边界挂起不 settle、不重派 child，因此 history 与工作状态保留。

## 3. 编号

_turnSeq 在链起点复位，每轮递增；resume 不复位。_continueSegments 首段为一，续段递增。

turnFrame 使用链内累计值和当前段预算生成显示。撞帽提示直接读 ContinueError.turn 与 agent._turnSeq，分别表示本段与累计。

状态、status/observe、上行载荷和宿主提示使用同一计数源，不用缺省零伪造未跟踪读数。

## 4. 实现面

- turn-loop.mjs：抛点与计数。
- run-start.mjs：链起点/续段状态。
- spawn-child.mjs：续跑骨架。
- checkpoint.mjs：检查点登记与兑现。
- subagent-actions.mjs：send/cancel 接线。
- consult.mjs：串行队列与 watchdog 重置。
- 各端 turn 驱动：用户卡和提示。

## 5. 运行面自证

宿主启动诊断记录实际 core 实体路径与版本；读取失败给 unresolved 诊断，不把诊断面变成授权门。

VSIX 等打包检查确认 checkpoint 与 subagent-run 当前接线进入产物。缺文件或缺符号时检查失败。

## 6. 关键决策

| # | 决策 | 理由 |
|---|---|---|
| D-TC1 | 续跑次数不设上限 | 每段有预算，用户/父侧可停止 |
| D-TC12 | 段边界挂起 | 保留同一执行体 |
| D-TC13 | 复用 send/cancel | 不新建裁定协议 |
| D-TC15 | AUTO 不自动续期 | 自动批准会绕过裁定 |
| D-TC18 | 撞帽检查不按产出豁免 | 段预算是唯一触发点 |
| D-TC19 | 启动诊断 + 打包检查 | 防止运行旧构建而不可知 |

## 7. 验证

验证首段、续段、拒绝、中止、AUTO、headless、异步父子、consult watchdog、跨段编号、提示两个读数和产物接线。
