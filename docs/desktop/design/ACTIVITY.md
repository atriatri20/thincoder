# Desktop 活动池与消化 · 设计

> 需求 = `docs/desktop/requirements/ACTIVITY.md`。
> 最近先例：`docs/render-core/design/RENDER-CORE.md` 的 subblocks/scroll 与 core suspension。对齐 = 核状态机、宿主薄胶水。
> 勘察证据：已读活动块、startSuspension、digest/subagent 记录和池宽。相关 = 当前活动域。

## 1. 活动块

ev:subagent/subchunk 按键和 role/id 归约。renderSubBlock/refreshBlock/renderSubagentChunk 负责显示，状态含 started/queued/approval/done/settled/cancelled 等当前闭集。

终态折叠并 archiveBlock 入流，表项保留墓碑处理迟到事件。停止经 subagent:stop 定向取消。

核 scroll 原语在追加、挂载和帧尾调用；手势才解钉，近底复跟，停跟显示回底钮。池体本身可滚动。

## 2. 挂起与消化

suspension-drive 调 startSuspension，hooks 负责计数、digest、reclaim、冻结和输入。起跑时对本轮驻留补发 done，reclaim 幂等兜底。

digest start/cap/end 追加独立行，n=0 不产计数/终态行；end 不改写起跑行，unsettled 可追加残余行。

digest 与 subagent 快照写人读线，record:append 只承载当前记录族；historyWindow records opt-in 重建，未结轮按活流优先规则。

## 3. 布局与通知

pool-width 拖柄即时写 --pool-w，松手读回并持久化，CSS clamp 控制上下限。

notify 仅在窗口失焦且用户回合完成时发系统通知，点击聚焦窗口。

## 4. 验证

验证块身份、取消、跟滚、起跑补发、digest 自然追加、记录重建、池宽与通知门。
