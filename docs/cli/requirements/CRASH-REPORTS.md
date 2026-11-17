# 崩溃捕获与取证 · 需求

> 设计 = `docs/cli/design/CRASH-REPORTS.md`。

## 1. 证据

- **F1**：JS 异常写 crash JSON；V8 fatal 写 Node 诊断报告；启动在当前时间窗提示最近异常，并尽可能带 uptime/cwd。
- **F2**：TUI 包装父进程把子 stderr 同时写终端和日志。
- **F3**：diagnostics.heapSnapshot=true 时武装近堆上限对象快照；默认关闭，TUI 与 headless 落点按当前 Node 能力。
- **F4**：diagnostics.heapWatch 默认开启，false 关闭；按 heap_size_limit 比例跨档预警，stderr/TUI/事件日志可见，只看不治。
- **F5**：TUI 子进程非零或信号退出时父进程补发终端恢复序列；正常退出与 spawn error 不补发。

## 2. 非功能

取证失败不得阻断业务。快照可能很大并同步阻塞，默认 opt-in，不调整堆上限。

取证文件按当前期限清理；heap snapshot 与正常 stderr 日志不能单独触发“上次异常终止”。

测试用注入缝验证武装、阈值和恢复，不在常规测试制造真 OOM 或快照。
