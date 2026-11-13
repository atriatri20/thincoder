# VSC Webview 结构与活动区 · 设计

> 需求 = `docs/vsc/requirements/WEBVIEW.md`。
> 最近先例：`docs/render-core/design/RENDER-CORE.md` 的共享构件与 core 的 SESSION。对齐 = UI 薄壳、核件直用。
> 勘察证据：已读布局、活动块、工具卡、模型与恢复。相关 = 当前 VSC webview。

## 1. 边界

extension host 持有 agent、provider、会话和工具；webview 持有 UI 状态 S 与 DOM ctx，经 postMessage 交互。

chat.js 装配，chat-messages.js 分发，ui/streaming/activity/history/input 等模块负责各面。共享渲染使用 @thincoder/render-core，端侧 shim 不复制算法。

## 2. 布局与滚动

grid 顺序为 session/messages/subagent-activity/panels/toolbar。活动区空时 :empty 隐藏，live 有界，归档插 #messages。

render-core scroll 提供 nearBottom/applyPin/createPinWatch；消息与活动区独立 pin。历史 applyHistoryPage prepend 后按 scrollHeight 差补偿。

## 3. 活动与工具

subagent 状态经 activity.js 更新 live 块，awaitingDigest 后归档，recordAppend 写 subagent 快照。出生、终态与同名接管按身份幂等，取消保留角色/id 校验。

工具卡由 render-core 构件创建和完成；isToolFailure 识别当前 Error/exit/killed/spawn 形态，formatToolSummary 统一摘要。

## 4. 模型与恢复

模型/推理按钮不被 busy 禁用；显式写位高于槽与 seed，回合尾 saveLines 不覆盖新选择。

@file 恢复用 stripAtRefs 保持简洁显示。未归档 live 块不跨 reload 伪造，已归档由 record 重建。

## 5. AUTO 与会话模式

autoApprove 是会话槽字段，不是 VS Code settings 配置。面板构造默认 false；`loadSession` 读取 `activeData(panel)?.autoApprove ?? false` 并推 `autoApprove { value }`，`_setAutoApprove` 同时更新面板 live 旗和槽。槽写失败时 live 旗仍只负责当前回合，不伪造持久化成功。

逐项和批权限门在每次询问时读取 `panel._autoApprove`，所以 AUTO 或 approveAll 在回合中翻转后立即影响后续询问，不必等新回合。`continue` 是例外：即便 AUTO 开启也强制提问。

AUTO 控件开启方向先显示确认 popover，确认才发 `setAutoApprove { value:true }`；关闭方向直接发 false。approveAll 先释放当前及其余逐项审批，再开启 AUTO 并推 `autoApprove { value:true }`。

MODE、PLAN、ADVISOR 与 AUTO 都从会话槽或活值镜像到控件。MODE 使用 minimal/normal/engineering 三选项，不再维护独立 ENG 布尔状态；只有 engineering 与 PLAN 保持既有互斥。agentSettings、mode 与 planMode 推送复用同一快照链，不另建平行状态。

## 6. 验证

验证布局、空区、跟滚、prepend、活动身份、记录归档、工具失败、模型保存和恢复。另验证 AUTO 默认关闭、会话切换回填、回合中即时生效、continue 强制提问、三档 MODE 恢复及 engineering×PLAN 互斥。
