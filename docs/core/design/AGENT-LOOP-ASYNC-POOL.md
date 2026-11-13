# 后台异步池与消化（AGENT-LOOP-ASYNC-POOL）· 设计

> 需求 = `docs/core/requirements/AGENT-LOOP.md`。
> 最近先例：`AGENT-LOOP.md` 的 run/finally 骨架。对齐 = settle 单点、投递与销账分离。
> 勘察证据：已读挂起、分域池、评审实例、消化账和两时点章节。相关 = 容器、队列、唤醒与回退面。

## 1. 挂起与 digest

startSuspension 是 CLI、VSC、Desktop 共用驱动。宿主注入 carrier、runTurn、abortSignal 和呈现 hooks。

用户输入优先。池项 settle 后进入 pending，空闲时开启交付轮。池空、无 pending、无上行和无 timer 时退出。

无挂起驱动的 headless、ACP、直连 runAgent 使用当前回退投递，不丢结果。

## 2. 用户排队输入

用户回合的步边界只消费排队用户消息。当前工具完成后再消费，不中断在飞工具。

队列与合并数值的唯一所有者是 core `queued.mjs`：

| 常量 | 当前值 | 语义 |
|---|---|---|
| `QUEUED_MAX_ITEMS` | 8 条 | 会话无挂起载体与挂起输入载体按端合计；第 9 条拒绝、提示、不回显，端侧保留文本。 |
| `MAX_MERGE_ITEMS` | 8 条 | 一次合并消费最多取 8 条连续普通文本。 |
| `MAX_MERGE_CHARS` | 2000 字符 | 上限作用于 `formatMergedMessages` 产生的完整编号注入串。 |

`planQueuedInput` 在双预算内规划连续普通文本；预算超限截当前批，余项下轮重新规划。单条原文超过 2000 字符时独立直发，不截断也不与邻条合并。斜杠命令逐条保序，不进入合并缓冲。

`takeQueuedBatchItem` 每次只消费计划首动作；批内任一条携 `images` 时退化为单条消费，保留附件元数据。多条无图合并取头条元数据并替换为编号注入文本。Ctrl+I 的中断注入与该通道不同。

历史分页不属于本队列常量面：TUI 首页/旧页数值由 `docs/cli/design/TUI.md`「队列与历史数值」承接，VSC/Desktop 使用 core `history-window.mjs` 的 200 条页大小。

## 3. 分域池

agent.poolLimits 包含 engCoder、other、advisor。默认各域按当前常量限流，非法值回退默认。

子代理按域排队；advisor 独立池，异 scope 池满排队，同 type+scope 运行中拒发。出队时再次检查同 scope。

后台 bash/browser 使用自己的当前任务面，但复用统一 pending 与 digest 结果容器。

## 4. 统一 settle

settleAsyncEntry 负责：

- done/cancelled/discarded 状态与墓碑。
- 统一日志和 pending 单容器。
- parentAborted 守卫。
- 唤醒挂起等待者。
- 释放槽并补位。
- 通过 onAccounting 执行 advisor 或 escalate 特有结算。

getAsyncPool 吸收不同池与宿主 carrier。buildChildSignal 统一会话与调用信号。

## 5. 后台评审

### 5.1 可观测与控制

subagent status 覆盖评审 role、reviewType、round、elapsed 和状态；单查还可读 pending/升级账。

wait_for advisor settled 以真实 running/queued 池为准，但常规工作应等自动报告而非阻塞轮询。

cancel 支持 running 与 queued。queued 直接出队，不伪造运行期 settle；重复取消幂等。

observe/send 不为 advisor 开放，返回真实指引。

### 5.2 评审实例

_advisorRuns 按 reviewId 保存 round、prior、stale、historyAnchorIdx、batchDoc 与文档集。

启动和消息构建按本实例取值，避免并发串台。实例关闭后释放大字段，当前回收规则防止无界增长。

settle 时判 stale、写 §3、签发凭证和置覆盖；不完整或 stale 不授权。

### 5.3 对象声明与严重度

每轮机械注入 Review-object declaration，内容来自 object 参数。

评审判定遵循当前提示词的严重度：实现偏离设计和机制矛盾是阻断项；过程协调、格式与可读性不得冒充机制缺陷。

## 6. 中止丢弃

discardAbortedPool 与 advisor 对应面只清符合当前 parentAborted 判据的已死条目。

每条写 discarded 墓碑并出池，整批一次提醒和事件。依赖方看到 cancelled 类终态，不得当成成功。

## 7. timer

timer 到期件通过核 timers 模块出列。支持空闲唤醒的宿主在空闲时开 timerTurn；headless 结构性无空闲面，不伪造。

timerWake 默认按当前配置。到期合并、消费幂等、在途数量和 maxTurns 继续生效。

## 8. 消化账务

### 8.1 三阶段

- delivery：报告注入历史，条目仍留 pending。
- accounting：消化轮输出逐条 digest-ack。
- settlement：覆盖后离容器并释放；未覆盖增加 missRounds。

报告只首投一次。注入失败未标 delivered时可重试；已投递未签收不重复投放。

### 8.2 账目

`[digest-ack #id] digested — …` 或 deferred。机械检查只确认标记和 id 覆盖，不判断处理质量。

只有会话态的消化轮执行销账；用户、上行和 timer 轮不替代消化账。

### 8.3 升级

达到 DA_MISS_LIMIT 后，条目进入 _unsettledDigests，发可见提醒与事件，并通过原注入器做终局披露。

完整正文可通过当前报告落盘路径读取。披露失败时账本、提醒和 status 仍保留，其他条目继续处理。

### 8.4 可见性

status 展示 awaiting-digest、unaccounted、unsettled。宿主消化残余行使用同一计数与字典。

### 8.5 结束信号

provider 归一 finishReason。干净结束却缺停因时提醒并留痕；纯空白响应进入空响应重试，不静默成功。

## 9. 两种投递时点

### 9.1 规则

| 时点 | 内容 |
|---|---|
| 用户回合步边界 | 仅排队用户消息 |
| 空闲交付轮轮首 | 子上行、结算报告、后台工具返回、timer |

用户新回合不夹带异步结果。交付轮内的后续步不继续插入异步结果。

### 9.2 空闲与竞态

空闲 = 无用户回合、无可消费用户输入、无模态阻塞。挂起窗先尝试用户输入，再开交付轮。

判定后到达的用户输入按 busy 入队，交付轮不中断，结束后优先处理。

### 9.3 回退与退出

!suspDriven 保留当前回退投递。退出清场的残余注入是防丢件兜底，不改变正常两时点规则。

## 10. 验证

验证池容量、同 scope、补位、取消、pending 单容器、digest 覆盖、升级、回退、timer、两时点和用户优先。使用假 carrier/runTurn/hooks，不靠真实等待。
