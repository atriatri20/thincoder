# TUI 会话视图与驱动 · 设计

> 需求 = `docs/cli/requirements/TUI.md`；持久化 = `docs/core/design/SESSION.md`。
> 最近先例：`SESSION.md` 的历史窗口与 `AGENT-LOOP-ASYNC-POOL.md` 的挂起。对齐 = 磁盘权威、恢复同 live。
> 勘察证据：已读恢复、懒加载、缓存、回合尾和显示预算。相关 = 当前 CLI 会话视图。

## 1. 恢复与分页

historyToLines 从 history 重建，不使用 display 快照。user/assistant/tool 与 `_kind` 按 live 同规则；机读提醒过滤。

restoreLines/createLoadOlder 从会话记录存储按绝对序号取首页和旧页。到顶加载、维护剩余标记并补偿 scroll。

三层缓存按当前全量、行和段键失效，新增旧页只计算新增段。

## 2. 回合

runAgentTurn 负责标签、processing、AbortController、工具回调、flushStream、错误/继续询问和 finally。

Ctrl+I 有消息时重建续跑；无消息中止停止。ContinueError 与 provider Retry 按当前用户/自动回合规则。

finally 清扫工具块、决定挂起、补标题、flush distill 并保存。队列由 planQueuedInput 取批，池 live 时进入 suspension-drive。

## 3. 生命周期记录

lifecycle-records 用同一实现生成 live 与恢复所需 digest/subagent 记录和行。恢复只重建已持久化终态，不恢复在飞态。

## 4. 显示预算

display-budget 定义当前行、参数、工具结果、输出环、子块、评审、流式缓冲和 `state.lines` 的字符上限。

core text-budget 提供 capText/appendCapped；syncLineBudget 对账并按最小需要裁头，保留当前保底行。行数与字符双维都生效，省略计数真实。

## 5. 验证

验证跨页标签、工具恢复、懒加载锚、缓存、Continue/Retry、挂起、digest/subagent 重建和裁剪不变式。
