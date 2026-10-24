# TUI 工具输出（行间区块）· CLI 面 · 设计

> 板块 = **TUI 工具输出**——普通工具调用在 CLI 终端界面里的**行间区块**显示机制。
> 配对需求档 = `docs/cli/requirements/TUI-TOOL-OUTPUT.md`。
> 对位档 = **无**（VSC 侧无行间区块面——其工具面为 webview 卡片，非同机制；非同源镜像）。

## 1. 定位与边界

- **行间区块 = 普通工具输出的唯一形态**：工具执行时在对话区产出「标题行 + 执行中滚动内容 + 完成行」，随会话流滚动。
- 不存在「面板 / 行间」双轨。权威注在实现侧：`thincoder-core/agent/dispatch.mjs:258` · `:315`
  （`Panel area abolished — all tools now stream inline via onToolOutput`）。
- **区块是 UI 层预览**：完整结果始终落 history（需求 FR4）；模型从 history 读完整结果，不读区块。
- **本档只覆盖普通工具输出路径**；子 agent / advisor / subagent 活动由专用分支承载（见 §7）。

## 2. 区块格式与生命周期

```text
❯ bash npm test (in thincoder)   ← onToolCall：标题行（工具色；可读关键参数摘要）
│ line1                           ← onToolOutput：滚动内容（追加进工具载体 body）
│ …
│ …                               ← 溢出折叠标记
❯ bash — done (1200ms) → 345 tests passed   ← onToolResult：载体状态改 done（摘要进头部）
```

- **数据路径**：`onToolOutput` → 追加进该工具的单框载体 `_toolBlock.output`（受 `TOOL_OUTPUT_LINE_CAP` 行截断）
  → 载体随 `onToolResult` 定态。
- **颜色**：title 用工具色（bash = 黄 warn / verify = 青 tool / advisor = 亮绿——映射见 `tool-events.mjs` 的 `onToolCall` 色表）；内容 dim。
- **历史持久化**：完整工具结果按落盘 / 截断机制进 history（需求 FR4）——区块只是预览面。

## 3. `onToolOutput(name, chunk)` chunk 契约

`chunk` 两形态：

| 形态 | 载荷 | 使用方 |
|---|---|---|
| **对象形态**（正式契约） | `{ kind, text }`，`kind ∈ think \| text \| tool` | advisor 等工具（有序多块流——`think` ↔ `tool` 交替靠 kind 区分渲染） |
| **裸字符串**（兼容形态） | stdout / stderr 原文 | bash 等工具 |

- **消费端归一化**（单行兜底）：`typeof chunk === "string" ? { kind: "text", text } : chunk`——TUI 统一归一后再分发。
- **新工具应优先发对象形态**（kind 显式，渲染面才能分流）。

## 4. 参数可见性（`thincoder-cli/src/tui/tool-args.mjs`）

- **单源摘要**：`describeToolArgs(name, args)`（单源 = 核 `thincoder-core/tool-args.mjs:16`；本端 `:14` 同名转口）——按工具挑关键参数的可读单行
  （bash = 命令 + workdir；文件工具 = 路径 + offset/limit/edit 摘要；搜索 = pattern + path；未知 / MCP 工具 = 紧凑 JSON 80 截断）。
- **live 标题行**：`❯ name <可读摘要>`（`tool-events.mjs:158` 调用）。
- **恢复路径**：`[tool] name — <摘要>` 标题行 + **全量 pretty JSON 落 dim 行**（`toolArgsLines`，`:20-23`）——
  TUI 无悬停面，全量必须落行；超长由连续 dim 折叠收纳。畸形 args JSON 降级为原始串 dim 行，不崩。
- **两端对齐**：VSC 卡片头 name+args 截断 ≈ 标题行摘要；点击展开 body ≈ 全量 JSON dim 行。

## 5. 载体收尾与共享守卫

- **载体收尾语义分层**：普通工具结果落载体本体（`settleToolBlock(state, name, toolId, summary)`——`tool-display.mjs:105`）；
  **subagent / escalate / advisor** 的结果由专用分支承载（子 agent 冻结框 / 评审冻结框），但 dispatch 级载体仍需标 done
  ——统一收尾（否则回合清扫会把成功调用误标 `(interrupted)`）。
- **中断清扫**：`sweepToolBlocks(state)`（`tool-display.mjs:60`；agent-turn finally 调用，与 `freezeAllSubTasks` 并列）
  ——未 done 载体标 `done + interrupted` 并清计时。
- **`slimToolResultForDisplay(result, maxRows = 400)`**（`tool-display.mjs:82`，LIVE 与 RESTORE 共用）：
  ① `read_image` 等多模态结果剥离 base64 images 只留 text（模型侧图像走 multimodal 通道）；
  ② 超过 `maxRows` 截断（全文在 history）。恢复路径同函数。
- **工具块宽度的组件 `cols` 纪律**：工具块展开 / 折叠态的组件调用**必须传 `cols`**（漏传 = 组件按默认 80 wrap，生成中「左边一小块」）。
- **中断配对**（`thincoder-core/agent/dispatch.mjs` 工具执行）：工具执行中 Ctrl+I——已提交的 assistant tool_calls 先合成占位 tool 结果
  （`[Tool execution interrupted — results discarded]`）再注入中断消息，保证重试轮历史可配对（strict provider 否则 400）。

## 6. 具名输出上限常量

单源 = `thincoder-cli/src/tui/tool-display.mjs`（与 TUI 显示层额度族并列——`docs/cli/design/TUI-SESSION-VIEW.md` §5）：

| 常量 | 值 | 面 |
|---|---|---|
| `TOOL_OUTPUT_LINE_CAP` | 200 | 输出环条目数（`:24`） |
| `REMINDER_CAP` | 3 | 回合末提示行数上限（`:25`） |
| `REMINDER_PERSIST_TURNS` | 5 | 提示落盘节流（每 N 回合，`:26`） |
| 预览行数上限 | 8 | 子 agent 预览尾部行数（`SUBAGENT_PREVIEW_LINES` 族——归显示层额度族管辖） |
| 预览行宽 | 120 | 预览行字符上限（`PREVIEW_LINE_CHARS` 族） |

> 字符维度额度（行 / 载体字符双维）见 `docs/cli/design/TUI-SESSION-VIEW.md` §5（`thincoder-cli/src/tui/display-budget.mjs`）——本档不重述（D2）。

## 7. 边界划清：普通工具输出 vs 子 agent 活动

- 普通工具（bash / read / verify 等）走本档的行间区块路径（`onToolOutput` → 工具单框载体 `_toolBlock` → done 行），
  **不经过** `state.subTasks`。
- `subTasks` 只承载带 `role#id/` 前缀的子 agent 活动——两条路径的数据结构与渲染分支完全分离。
- 消费端分流（`thincoder-cli/src/tui/tool-events.mjs` 的 `onToolOutput`）：advisor 特判进 `_advisorBlocks`；
  带前缀的子 agent 输出经 `routeSubToolOutput` 进对应区块；其余进工具单框载体。
