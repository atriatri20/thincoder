# 诊断日志（LOGGING）· 设计

> 需求 = `docs/core/requirements/LOGGING.md`。
> 最近先例：`SESSION-OBSERVABILITY.md` 的槽事件与 `AGENT-LOOP-ASYNC-POOL.md` 的异步账。对齐 = 单入口、字段有界。
> 勘察证据：已读 logEvent、事件面、脱敏和失败降级。相关 = 当前本地日志面。

## 1. 通道

log.mjs 的 logEvent(kind, fields) 组装 ts/ev/seq 和白名单字段，追加到 ~/.thincoder/logs/agent-YYYY-MM-DD.log。

每进程每日首次写时按当前保留窗清理。append 小写，失败置当前死旗，业务不等待、不报错。

## 2. 事件面

- turn:start/end。
- llm:start/done/error，统一在 chat() 覆盖各内部阶段。
- tool:call/done/error，在 dispatch 实际执行点。
- child:spawn/done/error 与 settle/cancel/stop。
- susp/digest、unsettled、finish-missing 等异步诊断。
- err:internal/provider 与其他当前宿主事件。

事件在现有节点发出，不建立第二总线。pre-gate 未执行的调用不冒充 tool 执行。

## 3. 摘要与隐私

llm done 的 head 和 tool result head 使用当前上限；错误使用当前上限。redactSecret 先处理字段和密钥形态。

敏感字段名精确匹配并忽略大小写；工具不记参数值，URL 不进事件。seq 是进程内序号，跨进程以 ts 等字段定位。

## 4. 测试

NODE_TEST_CONTEXT 与 _setLogsDirForTest 隔离真实目录。故障注入使用不可写父路径等可移植方式。

验证失败侧：非法字段/密钥不落盘，写失败不阻断业务，清理不删保留窗文件。
