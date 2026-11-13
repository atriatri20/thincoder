# TUI 工具输出 · 设计

> 需求 = `docs/cli/requirements/TUI-TOOL-OUTPUT.md`。
> 最近先例：`TUI.md` 的行类型与 `TOOL-OUTPUT-LIMITS.md` 的全史。对齐 = UI 预览与模型结果分离。
> 勘察证据：已读 onToolOutput、载体 settle、恢复与分流。相关 = 当前 `_toolBlock`。

## 1. 生命周期

onToolCall 创建 `_toolBlock` 和标题；onToolOutput 追加 output；onToolResult 通过 settleToolBlock 标 done 和摘要。

sweepToolBlocks 在回合收尾将未结束载体标 interrupted。subagent/advisor 有专用块，但 dispatch 载体也要收尾。

slimToolResultForDisplay 为 live/restore 共用当前行数与多模态剥离规则，完整结果仍在 history。

## 2. 内容

chunk 支持 `{kind,text}` 与裸字符串，消费端归一。kind 当前为 think/text/tool。

describeToolArgs 生成单行摘要；恢复时 toolArgsLines 给当前参数行，畸形 JSON 可读降级。

输出环、提示行和预览有当前常量；字符预算由 TUI-SESSION-VIEW 管理。

## 3. 分流

普通工具进入 `_toolBlock`；带 role#id 前缀的子代理输出进 subTasks；advisor 进入 `_advisorBlocks`。普通工具不写 subTasks。

组件必须接收当前 cols，避免按默认宽度错位。

## 4. 验证

验证两种 chunk、增量输出、done/interrupted、特殊工具收尾、恢复一致、参数畸形、宽度和 history 保真。
