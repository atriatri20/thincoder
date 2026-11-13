# Desktop 界面与视觉 · 设计

> 需求 = `docs/desktop/requirements/UI.md`。
> 最近先例：`docs/render-core/design/RENDER-CORE.md` 的视觉/构件与 CLI 状态行。对齐 = 同核件、桌面布局。
> 勘察证据：已读布局、状态段、卡片、主题与空态。相关 = 当前桌面 UI。

## 1. 布局与状态

主区为会话控制和对话流，右侧活动池可折叠并记忆宽度，底部状态行跨列。

状态行由当前段集构成，数据来自 flags、tasks、usage、turns、timers、ledger、queue、team 和位标。状态词使用当前闭集；无有效读数不渲染。

## 2. 对话与卡片

flow 使用 data-state/data-blocks/data-hidden/data-following 描述状态。块包括 user/assistant/reasoning/tool/error/subagent，正文由 render-core Markdown/构件呈现。

审批、提问、task、goal、digest 等使用各自锚和 promptId/记录，卡退场由真实回执或终局事件决定。

空态按 no-project/no-session/no-message 给实际入口，输入禁用仍由活动会话决定。

## 3. 视觉与主题

颜色和构件值优先 render-core；桌面 CSS 负责布局、状态栏、活动池和宿主差。

theme.mjs 是 data-theme 单写者，支持 system/light/dark 并持久化。排版使用当前统一变量，Markdown 修饰保留语义。

## 4. 验证

验证段数据、块序、卡片键盘操作、空态、主题恢复、宽度和真机视觉。
