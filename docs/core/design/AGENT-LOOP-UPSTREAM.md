# 子代理上行通道（AGENT-LOOP-UPSTREAM）· 设计

> 需求 = `docs/core/requirements/AGENT-LOOP.md`。
> 最近先例：`AGENT-LOOP-SUBAGENT.md` 的 send 边界与 `AGENT-LOOP-ASYNC-POOL.md` 的交付轮。对齐 = 非阻塞、复用队列与回复通道。
> 勘察证据：已读 notify_parent、唤醒、零产出提醒和标识章节。相关 = ask/note、队列门和投递时点。

## 1. 通道

notify_parent 是 depth>0 的子到父在飞通道。consult 和 depth-0 不装配。

子调用立即返回，继续不受影响的工作。父在交付窗读取；答复复用 subagent send。

## 2. 数据与装配

parent-channel.mjs 提供 parentChannelTool、pushChildUpstream、drainChildUpstream 和队列常量。

消息 = `{seq, from, kind, message, ts}`，进入父 carrier 的 _childUpstream；_childUpstreamSeq 单调递增。

upstreamHolder 统一父字段与 history 载体，保证不同宿主读到同一队列。

spawn/escalate 的子代理在创建时写 _upstream = `{parent, label, sync}`。嵌套时 parent 是上一层子代理。

## 3. 语义流程

1. 子调 notify_parent({kind, message})。
2. 工具同步入队并返回 position。
3. 子继续其他工作，受影响部分待答。
4. 父在交付轮轮首 drain，合并为一条 user 消息。
5. 父需要答复时 send 给运行中异步子代理。

无答复到终态时，受影响部分不做并报告。已 settle/cancel 子代理的队列消息仍投递，并附真实状态注脚。

同步子代理只能单向通知；父被阻塞时 send 不可达，后续用新任务书重派。

## 4. 射程与门

只有答案改变下一步且材料中查不到时才 ask。前提失效、要求冲突、授权边界和会作废既有工作的选择可问；命名、事实查询和求安心不可问。

机械门：

- kind = ask/note。
- message 非空且不超过 UPSTREAM_MSG_MAX。
- 同一子代理未 drain 的 ask 至多一条。
- 父队列不超过 UPSTREAM_QUEUE_MAX。
- depth-0 或无上游明确报错。

未 drain 是队列窗口，不声称能机判“已答复”。

## 5. 投递时点与唤醒

### 5.1 投递

驱动面只在空闲交付轮轮首 drain；用户回合步边界不投子上行。回退面按当前不丢件路径处理。

note 不唤醒，留到下一 settle/ask/timer 交付轮。

### 5.2 ask 唤醒

ask 入队后调用 wakeAsyncWaiters。startSuspension 的开轮条件除 pending 外还包括 upstreamWaiting。

upstreamTurn 标记让宿主选择“有子代理等待决策”的域文本，不使用“无人等待”的普通 digest 文案。

唤醒和开轮缺一不可：只唤醒而 pool 仍 live 会继续等待。

### 5.3 竞态

drain 后 upstreamWaiting 变假，避免自旋。子先 settle 时消息仍投，但 send 不可达。

宿主未执行 drain 时不能假定队列已清；错误必须可见。

## 6. 零产出看门狗

### 6.1 子代理

eng-designer/eng-coder 连续 ZERO_WRITE_ALERT_ROUNDS 轮写序不推进时推 note。

判据使用 _mutationSeq，不用去重的 _touchedFiles。同文件重复编辑算写；失败写入、只读、bash/git/batch/file_ops 不按该口径算写。

resume 保留连续计数；写后重臂。缺字段或非整数时不伪造零。

### 6.2 异步评审

advisor 连续同阈值轮无评审文本时推 note。文本产出复位；每次运行至多一条。

同步评审无父处置窗，不接该提醒。

### 6.3 处置

提醒包含 from、轮数、要检查的停滞风险和 observe/status → steer/cancel 的下一步。

它只提醒，不自动取消、转向或重派。自动源无父通道时跳过并留当前日志面。

## 7. 标识

drainChildUpstream 机械映射：

- ask → `[上抛·待裁]`
- note → `[上抛·知会]`

机读 kind 与日志保持原值。未知 kind 原样显示，不丢消息。

父转述或入档时保留标识，并另行标明用户原话、用户裁定、父侧处置或仍待裁。子报告中的待决/知会项也使用相同标识。

## 8. 验证

验证 ask/note、队列上限、单 ask 窗口、无上游、同步不可答、settle 后投递、ask 唤醒、note 不唤醒、零产出阈值、写后重臂和标识映射。

使用假 carrier 和假 runTurn，不靠真实等待或模型输出判断业务状态。
