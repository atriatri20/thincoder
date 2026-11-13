# Desktop 对话流 · 需求

> 设计 = `docs/desktop/design/CHAT.md`。

## 1. 对话

- **D3**：受理后的用户消息进入对话流，流式正文、推理、工具卡、错误、耗时与中断可见；说话人标签与回放一致。
- busy 排队项位于输入区上方待发送带，消费时才形成一个真实用户块。
- 子代理终态折叠并归档入流，不能在消化后消失。
- 发送受理即更新忙态，失败保留输入并显示原因。

## 2. 审批与模式

- **D5**：逐项/批审批提供当前 once/always/reject 与 approveAll/deny/oneByOne；AUTO、PLAN 与三档 MODE 可见并与会话凭证一致。MODE 使用 minimal/normal/engineering，PLAN 的既有互斥只在 engineering 下生效。
- 提问卡支持选项、自由文本和取消，回执成功才退场。失败时保留同一张卡、promptId 和草稿，重试只重新调用 `question:respond`，不重发末条用户消息。错误横幅的重试才走末条用户消息的正常发送路径。

## 3. 渲染对齐

- **D19**：Markdown、代码块复制、工具卡、推理、文件链接和帧容器使用 render-core 当前构件。
- 用户文本使用当前 mdInline，助手与推理由全量 md 路径呈现；活流与恢复保持块序和工具终态。
- 文件链接验存并可打开；大 diff 按当前摘要降级，不伪造内建编辑器。
