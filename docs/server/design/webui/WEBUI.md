# Server WebUI · 设计

> 总览 = `docs/server/design/PROJECT.md`。
> 最近先例：VSC/Desktop 原生 ESM 与 render-core。对齐 = 零框架、零构建、自托管。
> 勘察证据：已读静态双根、hash 路由、页面分档、判权和多语言。相关 = 当前 WebUI 壳。

## 1. 静态与路由

public/index.html、app.mjs、nav.mjs、dom.mjs 和按页 views-* 组成原生前端；static.mjs 提供 public 与 /rc/*，防穿越、正确 MIME、no-cache。

hash 为 `#/<组>/<页>[/<子段>]`，nav.mjs 统一别名、角色默认、denied 和子段。我的面含 chat/keys/usage/account/projects/sandbox/ledger；管理面含 overview/chat/members/projects/providers/models/mcp/usage/audit/system/sandbox。

## 2. 安全与状态

后端始终执行会话、角色和资源判权，前端显隐不是安全门。401 回登录，403 显示无权限。

普通节点用 h/textContent；模型与工具文本只能经 render-core md 的全量转义路径。秘密不明文入列表。

## 3. 页面工艺

每页一档或按职责拆档，公共 modal/tabs、表格、表单、提示和 i18n 复用。页内读取和写失败就地显示，不能用假按钮或旧值冒充成功。

## 4. 验证

验证路由别名、角色导航、静态 MIME/逃逸、无外部资源、页面可键达和真实浏览器主流程。
