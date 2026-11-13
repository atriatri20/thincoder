# 轨迹存储（TRACES）· 设计

> 需求 = `docs/core/requirements/TRACES.md`。
> 最近先例：`LOGGING.md` 的脱敏与 `TOOL-OUTPUT-LIMITS.md` 的有界文本。对齐 = 诊断不改业务、全文有预算。
> 勘察证据：已读 chat 采集、双层额度、在途上限与清理。相关 = 当前 traces.enabled 默认关。

## 1. 采集与落盘

recordChatTrace 在 chat() 出口收集完整响应。记录含 ts、session、cwdHash、role/depth/turn、provider/model、stage、续写标记、messages/content/reasoning/toolCalls/usage/finishReason/error。

写入 ~/.thincoder/traces/YYYY-MM-DD/<sessionKey>-<seq>.jsonl，fire-and-forget。

## 2. 序列化与额度

serializeRecord 在单遍序列化时调用 redactSecret。

单消息超过当前 64K 时头尾截断；整记录超过当前 4M 时 messages 降为带实数的 stub，其他元数据保留。

pending 写计数达到 TRACE_PENDING_MAX 时丢弃当前记录并增加 _dropped，饱和段有可见提示。

seqCache 进程内预留序号；多进程同文件 append，不覆写已有内容。

## 3. 清理

cleanupTraces 按日目录三段处理：

1. 整个日目录超过 retention 且只含 jsonl 时整删。
2. 日目录尚不可能过期时跳过。
3. 其他目录逐文件检查，非 jsonl 不动。

maybePruneTraces 使用当前节流窗与在飞合并。scheduleTraceCleanup 在会话型命令的启动窗外延迟执行；version/help 等一次性信息命令不调度。

## 4. 配置与失败

traces.enabled 与 retentionHours 在当前设置面可见。默认关。

写失败、清理失败和索引序号竞争不改变模型结果。轨迹不是会话或业务事实源。

## 5. 验证

验证采集、字段、脱敏、两层截断、pending 丢弃、重复序号不覆写、目录三分支、非日期目录、节流和延迟清理。
