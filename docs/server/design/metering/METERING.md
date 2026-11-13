# Server 计量与配额 · 设计

> 总览 = `docs/server/design/PROJECT.md`；转发 = `../gateway/API.md`。
> 最近先例：SQLite 事务与 core 的 usage 原值。对齐 = usage 真源、派生可重算、准入不预估。
> 勘察证据：已读三写、三级配额、报表、导出与对账。相关 = 当前 metering。

## 1. 记账

recordUsage 在请求终结后同一事务写 usage、usage_daily 和 quota_counters。上游 token 原值保存，缺 usage 为 NULL，不估算。

usage 保存成员/key/provider/model/endpoint/ts/status/duration；内部真名分列，读面按当前别名映射。日/月键由行 ts 推导。

## 2. 配额

成员×模型覆盖 > 平台模型默认 > 不限，自然月、total_tokens。仅 chat 在派发后转发前检查，超限 429 quota_exceeded，他模型不受影响。

有额度时从 quota_counters 唯一点查，无额度零 SQL；单笔可越顶，下一笔拒绝。成员禁用由 accounts 先判。

## 3. 查询与保留

明细和导出读 usage，趋势/汇总/key 窗读 usage_daily。本人端点固定本人，admin 可全队筛选；过滤、零填充、CSV 转义按当前契约。

usageRetentionDays 控制 usage、派生和审计同窗清理，启动与周期调度按 ops。CLI reconcile 可从真源重算，--fix 在写事务内修复。

## 4. 验证

验证事务回滚、NULL usage、跨月、三级配额、点查、本人隔离、导出、保留窗与对账。
