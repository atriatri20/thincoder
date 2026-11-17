# CLI 命令入口 · 设计

> 需求 = `docs/cli/requirements/FEATURES.md`。
> 最近先例：`PORTABILITY.md` 的平台判定与 `READ-DATA-INTERFACE.md` 的严格机器输出。对齐 = 薄分发、核行为。
> 勘察证据：已读 shim、argv、命令树与补全。相关 = 当前 CLI 入口。

## 1. 启动门

bin/thincoder.cjs 在任何 ESM import 前调用 node-version-gate，要求 package.json engines 当前 Node 下限；版本不可解析也失败。

diskRootGateError 在 argv 解析后拦截磁盘根下的默认/TUI/chat/acp 会话。-v/--help/memory/upgrade/completion/session 等当前信息维护面放行，无强开旗。包装父子进程各自判定。

## 2. 分发

bin/thincoder.mjs 解析命令并转交 command-table/command-interactive 与各命令模块。命令行为由对应专题档负责。

当前词面包括：默认/tui、chat、acp、memory、sync、reindex、distill、session、ledger、upgrade、completion、team、help/version。

ledger list 的 JSON 参数由 READ-DATA-INTERFACE 定义；session/ledger 其他行为由 core 负责。

## 3. 补全

printCompletion 为 bash/zsh/fish 生成脚本，覆盖当前命令、子命令和旗标。模板中的 shell `$`、分派和插值按各 shell 真实语法，不用 JS 转义破坏输出。

测试以临时 HOME/USERPROFILE 驱动入口，避免写真实 crash-reports。

## 4. 验证

验证 Node 版本边界、磁盘根正负例、argv 分发、USAGE/补全一致和三 shell 输出语法。补全的未覆盖项只在 CLI-DEBT 登记。
