# VSC 输入与消息渲染 · 设计

> 需求 = `docs/vsc/requirements/WEBVIEW.md`。
> 最近先例：`docs/render-core/design/RENDER-CORE.md` 的 composer/md 与 core queued。对齐 = 共享键面、宿主权威队列。
> 勘察证据：已读 Enter 五态、busyQueued、待发送带与 inline。相关 = 当前 VSC 输入面。

## 1. Enter 与历史

composer/panel 先处理 IME，再让位 @ 下拉；无工作区显示守卫；busy 提交进入 queuedUserMessage。

↑↓ 依次按 IME、@、历史态、单行、多行边界处理，navigateInputHistory 恢复草稿并移动光标到末尾。

## 2. busy 队列

host routeUserTurn 统一用户入口，队列是 _busyQueued 或 susp.pendingInput，容量取 core 常量。busyQueued 快照含 pending/count/items/merged。

待发送带按 items 全量重绘，超过当前行数显示尾标记；merged 只在真实消费时出现并生成一个用户块。载体迁移不等于消费。

步边界、driver、idle 归位和退出残余按当前路径取批；图片批按当前逐条/降级规则。

## 3. Markdown

render-core/md 的 inline 是唯一内联引擎。esc-first，代码段占位先于 Markdown 替换，恢复顺序固定；代码内容不二次 esc。

原始 HTML 全转义，URL 经 safeUrl。md/mdInline 同契约。

## 4. 验证

验证 IME、@、五态、满队、消费出块、载体迁移、图片、代码占位恢复和危险 URL。
