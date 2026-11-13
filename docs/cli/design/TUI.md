# TUI 界面核心 · 设计

> 需求 = `docs/cli/requirements/TUI.md`。
> 最近先例：`docs/render-core/design/RENDER-CORE.md` 的显示宽度和 core 的队列机制。对齐 = 纯渲染、宿主薄壳。
> 勘察证据：已读输入管线、状态、帧布局、模态、滚动与回合收尾。相关 = 当前 ANSI TUI。

## 1. 管线

stdin 经 input-face 做 UTF-8 流式解码、鼠标剥离、bracketed paste 与 Shift+Enter 翻译；key-handler 按当前模态优先级分派。

状态由 tui-state 创建；render-frame 装配 header、会话、子代理、task、输入和状态栏；render-loop 做节流与行 diff。

退出统一保存会话、关闭 MCP 并恢复终端。

## 2. 渲染

行对象用 `_kind` 标识 thinking/text/tool 等来源，live 与恢复共用判定。文本经安全清理、math/markdown、表格和显示宽度换行。

fold-block 统一折叠、tail、展开与块内滚动。三层缓存按当前全量键、行级和段级失效。

滚动状态 `_followTail` 与 scroll 补偿保证新内容跟随、上滚锚定和回底恢复。

## 3. 模态与中断

permission/question/search/interruptPrompt/picker/wizard/secretPrompt 按当前优先级独占；每个分支消费后返回。

掩码输入在场时，搜索的键路由和显示面让位，避免明文泄露。

Ctrl+C 区分 picker 取消、当前回合中止、全停武装和空闲退出。Ctrl+I 携消息中断并续跑；无消息中止不续跑。

provider 错误显示脱敏原因、Provider/Model 和 Retry；重入清当前流式缓冲。

## 4. 状态栏与活动

状态栏组合模式、耗时、usage、上下文、标题、timer、团队态与当前 busy/队列提示；所有读数缺失时不伪造。

attention 由审批、提问和回合结束派生。子代理运行块在底部，终态冻结入流；普通工具块使用 TUI-TOOL-OUTPUT。

## 5. 队列与历史数值

队列与合并的数值所有者是 core `queued.mjs`，TUI `queued-merge.mjs` 只转口。`QUEUED_MAX_ITEMS=8`，processing 与挂起两径共用 `state.pendingInput`；第 9 条拒绝、提示并保留输入框文本。模态或斜杠提交不进入普通文本队列。

`MAX_MERGE_ITEMS=8`，`MAX_MERGE_CHARS=2000`。字符预算作用于 `formatMergedMessages` 的完整格式化串，不是原文简单相加。连续非斜杠文本在双上限内攒批；超限截当前批，余项下轮重算。单条原文超过 2000 字符时独立直发，斜杠逐条保序，批内任一条携图时取项退化为一条。

TUI 历史分页数值所有者是 `tui/startup.mjs`：`INITIAL_HISTORY_MESSAGES=200`，`HISTORY_PAGE_MESSAGES=20`。首页取最新 200 条；每次到顶加载向前 20 条，更新 `_historyLoaded/_historyTotal/_hasOlder` 并补偿滚动位置。存储页可携前后各一条边沿用于工具结果与回合标签配对，边沿不计入可见加载量。

TUI 的 20 条旧页步长不等于 core `history-window.mjs` 的 `HISTORY_PAGE_SIZE=200`；后者是 VSC/Desktop 的分页机制，不得拿它覆盖 TUI 常量。

## 6. 验证

用纯函数验证宽度、布局、模态优先级、attention、滚动和状态行；验证第 9 条拒绝、8 条与 2000 字符双边界、超长/斜杠/携图退化和首页 200/旧页 20。真 TTY 验证粘贴、鼠标、Ctrl+C/Ctrl+I、恢复与清理。
