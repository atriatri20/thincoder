# 会话可观测性（SESSION-OBSERVABILITY）· 设计

> 需求 = `SESSION.md` 与 `DESIGN-TOKEN-SETTLEMENT.md`；日志通道 = `LOGGING.md`。
> 最近先例：`LOGGING.md` 的 logEvent 与 `SESSION.md` 的槽写护栏。对齐 = 单通道、字段闭集、业务不阻断。
> 勘察证据：已读槽事件、凭证离开计数和状态栏单行化。相关 = 当前凭证按槽持久化。

## 1. 槽事件

slot:rotate、slot:allocate、slot:new、slot:refuse 记录当前写时点。

字段只含槽号、前一槽、原因、via、bak 等闭集值，不含标题、用户输入、消息、路径、cwd 或 token。

logEvent fire-and-forget；失败不影响会话。只读列表和状态查询不产生写事件。

## 2. 凭证离开可见性

resetSessionState 与 restoreEngTokens 返回 droppedDesignTokens，统计本次离开当前生效集的未过期凭证 id，不用集合大小差。

applySession 中继 switched 与 droppedDesignTokens。宿主在会话行重建后给一条非模态提示；零丢弃不输出。

持久化槽仍保存各自有效凭证；离开当前运行面不表示从原槽删除。恢复仍受 token-ttl 与设计槽位规则约束。

## 3. 标题单行

状态栏入口、回退标题和最终写出口使用同一 singleLineTitle 规则。控制换行逐字符替换为空格，不做会改变宽度账的空白折叠。

标题生成与持久化值不因 CLI 状态栏清洗而改变。

## 4. 验证

验证四类事件及隐私字段、写失败不阻断、离开集在目标槽也有凭证时仍正确、过期项不计、零丢弃无提示和状态栏单行。
