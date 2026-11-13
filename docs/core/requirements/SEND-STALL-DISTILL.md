# 轮末探索蒸馏时序（SEND-STALL-DISTILL）· 需求

> 设计 = `docs/core/design/SEND-STALL-DISTILL.md`；蒸馏本体 = `CONTEXT-COMPACTION.md`。

## 1. 目标

回合最终回答完成后立即恢复输入，不让轮末蒸馏阻塞 onComplete；同时保留下一轮使用压缩版机读线和完整全史。

## 2. 功能需求

| # | 需求 |
|---|---|
| FR1 | onComplete 先于蒸馏；蒸馏异步挂起，不阻塞回合返回 |
| FR2 | 下一轮在 push 用户输入之前 await 上一轮蒸馏 |
| FR3 | 实际替换 history 后触发 onDistilled 保存，失败/no-op 不保存 |
| FR4 | 失败保留原始探索结果，不影响已完成回答，并处理 rejection |

## 3. 非功能需求

- 蒸馏替换与下一轮输入互斥。
- 会话保存使用槽位守卫，切会话不串写。
- 用户 Stop 不取消蒸馏；面板销毁或会话切换使用独立生命周期 signal。
- CLI 退出给予当前有界 flush，不提前摘除 pending。
- 只在 depth-0 触发。

## 4. 验收

验证快速连发、最终保存、失败、no-op、Stop、切会话、退出 flush 和子代理不触发。
