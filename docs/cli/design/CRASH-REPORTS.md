# 崩溃捕获与取证 · 设计

> 需求 = `docs/cli/requirements/CRASH-REPORTS.md`。
> 最近先例：`LOGGING.md` 的诊断事件与 `TUI.md` 的终端清理。对齐 = 同步尽力取证、业务不阻断。
> 勘察证据：已读 prepareCrashReporting、heap watch、stderr 包装与恢复。相关 = 当前 CLI 入口。

## 1. 入口与文件

prepareCrashReporting 预建 crash-reports，设置 process.report.directory/reportOnFatalError，并按配置武装快照。

writeCrashRecord 同步写异常、uptime、argv、cwd、内存与 Node 信息。recentCrashHint 从当前时间窗记录生成提示，坏记录降级而不阻断。

purge 按当前期限清理 crash/report/tui-stderr/Heap 文件；提示只判断异常记录与 Node 报告。

## 2. TUI 包装

wrapped-spawn 在脚本路径前注入 --diagnostic-dir，并把子 stderr tee 到终端和日志。

子进程非零/信号退出时，在 finish 前写一次 RECOVERY_SEQUENCE；exit/close/兜底共享幂等守卫。code 0 与 spawn error 不写。

## 3. 堆快照

heapSnapshot 仅在配置严格 true 时调用 v8.setHeapSnapshotNearHeapLimit(1)。快照体积、阻塞与额外内存由 Node/V8 决定，失败独立捕获。

## 4. 看门狗

startHeapWatch 支持 sample/heapLimit/timer 注入，按当前比例阈值边缘触发并 unref。

onHeapWarn 输出 stderr，TUI 订阅写警示行，core log 写 heap-warn。diagnostics.heapWatch=false 时不启动。

## 5. 验证

验证目录、异常字段、清理集合、TUI tee、恢复幂等、快照开关、阈值一次性和采样失败。
