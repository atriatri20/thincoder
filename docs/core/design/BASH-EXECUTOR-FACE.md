# bash 执行器身份（BASH-EXECUTOR-FACE）· 设计

> 需求 = `docs/core/requirements/TOOLS.md`；提示词注入 = `PROMPT-SYSTEM.md`。
> 最近先例：`PROXY.md` 的运行时配置与 `PROMPT-SYSTEM.md` 的字符串注入。对齐 = 实际执行链与描述同源。
> 勘察证据：已读 shell-identity、Executor 注入和 hint 门。相关 = 当前 bash-terminal-face。

## 1. 身份解析

resolveShellIdentity(configShell) 按当前 spawn 链取 config.shell、平台对应环境和实际默认字面，返回 raw/name/kind/known。

kind 当前为 cmd/powershell/posix/unknown。识别依据 raw 的已知尾段，不从平台名猜用户配置。

未知执行器使用中性说明，不伪造语法承诺。

## 2. 描述注入

端装配层为 bash-terminal-face 提供 executorLine 产生的字符串。tool-docs/bash.md 只说明 Executor 行是当前身份来源，不硬编码 shell 名。

VSC 的可见终端参数说明与隔离子进程执行器说明分开。

## 3. 配置变化

描述文本按当前进程/装配时点生成；设置 UI 对 shell 标明当前生效时机。逐执行 hint 按配置值使用当前 memo/重探规则。

posixSyntaxHint 仅在 kind=cmd 时给 cmd 专属提示，其他族不误导。

## 4. 验证

验证 cmd、Windows PowerShell、pwsh、POSIX、未知、空配置、描述无死写、hint 门与各端注入。
