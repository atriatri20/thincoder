# Server 对话页 · 设计

> 管理机制 = `../agent/ADMIN-AGENT.md`；成员机制 = `../agent/MEMBER-AGENT.md`；渲染核 = `docs/render-core/design/RENDER-CORE.md`。
> 最近先例：VSC/Desktop 会话页。对齐 = 四轴同形、核件直用、无源控件不伪造。
> 勘察证据：已读管理/成员布局、消息、composer、状态和审批。相关 = 当前对话页。

## 1. 共同呈现

页由会话条、文档流、状态行和输入区组成。md/highlight/block/tool-card/live-md/scroll/composer/subblocks 均从 /rc/* 取核，页面只写宿主适配。

turn 帧划分活流步，文本与工具嵌当步块；回读按 assistant/tool 记录装同形。end 后重读真实会话。

## 2. 输入与状态

模型、逐模型 reasoning、附件、中止、斜杠和排队有真实后端。工作模式使用共享 tiny/normal/engineering 三档控件，读写同一盒内会话槽；/tiny 在 tiny↔normal、/eng 在 engineering↔normal、/normal 恒 normal。PLAN 与 engineering 的互斥沿用 core，其他管理或成员按钮按当前能力显隐。

状态行仅显示真实 turn/usage/end/会话数据；缺源不显示。语言切换重注册核词表。

## 3. 管理面

#/admin/chat 仅 admin，使用管理 NDJSON、审批卡和主机凭据公共弹窗。审批失败不乐观清卡，结束/切换时服务端兜底拒。

## 4. 成员面

#/me/chat 绑定本人工作区，提供首次引导、启动、拉仓、盒内会话列表/改名/删除、模式、提问/秘密、子代理、搜索和 @。

盒离线给启动路径；会话真源在盒内。成员凭据与管理工具不混入成员面。

## 5. 验证

验证活流/回读同形、四轴、控件后端、审批、状态真值、两角色边界和真实浏览器对照。
