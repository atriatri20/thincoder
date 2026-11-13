# Desktop 对话流 · 设计

> 需求 = `docs/desktop/requirements/CHAT.md`。
> 最近先例：`docs/render-core/design/RENDER-CORE.md` 的块构件与 `RENDERER.md` 的流模型。对齐 = 共享块形、真实受理。
> 勘察证据：已读用户块、工具卡、审批提问、文件链接与复制。相关 = 当前对话流域。

## 1. 块与事件

msg:send 成功受理后写用户块；busy 时只在 ev:queue.delivered 到达后写，失败退流并保留稿。

token/reasoning 续写尾块，tool-call 收束流式游标，done/stopped/error 按当前回合尾规则清点。stopped 将未结算工具标 interrupted。

工具卡使用 formatToolSummary/isToolFailure，运行输出展开，错误展开并显示耗时/状态；恢复块序与 live 一致。

## 2. 卡片与操作

审批和提问使用 promptId，回执 ok 才清除。提问回执失败、拒绝或 invoke 抛错时保留同卡、id 和草稿，重试只重新调用 `question:respond`；挂载签名不含输入控件值，重挂不得清空草稿。

错误详情可展开。错误横幅的重试是独立路径：取最后一个用户块文本，经正常 `msg:send` 直发径重发，不能与提问同 id 重试混用。

代码块复制使用 render-core attachCopyButtons。右键编辑菜单由主进程按 Chromium role 与 locale 构造。

文件链接由宿主验存，渲染用 linkifyPaths，file:open 经当前编辑器探测或 shell.openPath。

## 3. 验证

验证受理/失败、队列出块、流式清点、工具失败、卡片 id、重试、复制和文件打开。
