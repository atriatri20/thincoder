# VSC 产品定性 · 需求

> 共享产品边界 = `docs/core/requirements/PROJECT.md`；webview = `WEBVIEW.md`。

## 1. 产品形态

VS Code 扩展经 extension.mjs activate 启动，主界面为隔离 Webview，使用 HTML/CSS/vanilla JS 与 postMessage。扩展宿主调用 core agent/provider，不复制 core 机制。

## 2. 本端需求

- autoApprove 是会话字段，默认关闭，AUTO 在运行中读取并即时生效；界面与权限承接 = `docs/vsc/design/WEBVIEW.md`「AUTO 与会话模式」，消息载荷 = `docs/vsc/design/WEBVIEW-PROTOCOL.md` 的 autoApprove 行。
- 模型规格与 provider 传输来自 core；端侧只使用当前声明增补。
- 会话标题在首条消息后生成，失败按当前回退。
- 模型选择使用 provider 列表与 hover 模型子菜单。
- 权限、AUTO 警告和聊天/git 历史保持可见，不另建平行的命令沙箱或审计协议。
- Multi-root 使用显式选定锚；未选定按当前 folders[0] 回退并标未选定。
- 无工作区文件夹时拒绝启动 agent 并提示，不落 process.cwd()。
- UI 文本使用当前中英 locale 与 i18n 注入。

## 3. 工程约束

VSC 测试按当前单入口与慢例归册；源码档位按 CODE-TIER 在对应时点实读，结构拆分保持导出与调用契约。
