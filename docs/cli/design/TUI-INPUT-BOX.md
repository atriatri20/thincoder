# TUI 输入框 · 设计

> 需求 = `docs/cli/requirements/TUI.md`；busy 机制 = `docs/core/design/AGENT-LOOP-ASYNC-POOL.md`。
> 最近先例：`TUI.md` 的模态分派。对齐 = 单一输入状态、后台不写输入框。
> 勘察证据：已读 codepoint、竖移、历史、多行和 busy 队列。相关 = 当前输入键面。

## 1. 状态

input 是 codepoint 数组，cursor 有界；historyIndex=-1 表示未导航；_draft 保存首次进入历史前的草稿。

question 自由文本与 interruptPrompt 使用各自当前数组/光标模型。Inject 保持单行。

layoutInput 是纯函数，返回可视行、光标与行首；宽度、最大可见行和滚动按当前布局。

## 2. 键面

字符、退格/删除、左右/Home/End、Ctrl+U、Tab、Ctrl+V、Alt+V、PgUp/PgDn 按当前编辑表。

Shift+Enter、Alt+Enter 与 Ctrl+J 按终端能力插入换行；普通 Enter 提交或 busy 入队。

↑↓ 规则：历史导航中始终翻历史；否则优先按显示列竖移；上边界可进入历史，下边界无动作。processing 禁止历史切换但允许编辑。

## 3. busy 与挂起

只有 processing、无模态、非 slash、非空且队列未满时入队。成功清框并入历史；队满保留文本。

普通 busy 与挂起内 busy 使用同一 pendingInput。挂起空闲的非 slash 文本也入该队并唤醒；斜杠在 busy 时不执行。

消费使用 core planQueuedInput 的当前条数/字符合并计划；步边界优先，回合尾、driver 与退出兜底。中止残余转回普通队列，不静默丢失。

## 4. 验证

验证 codepoint/emoji、列保持、草稿、模态、busy 五条件、队满、合并、挂起和中断通道。
