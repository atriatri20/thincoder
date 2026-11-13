# VSC 文档归属 · 设计

> 通用机制 = `docs/core/design/DOC-SYSTEM.md`；需求 = `docs/vsc/requirements/VSC-MIGRATION.md`。

## 1. 归属映射

- Webview、设置、项目切换等 VSC 宿主面：本目录同名专题。
- Agent、provider、session、memory、工具与工程流程：core 对应专题。
- 渲染共享：render-core；VSC 只写装配、消息和宿主差异。

## 2. 引用与维护

使用仓根相对路径、文档章节和代码符号。跨层引用指到实际负责文档，不写裸旧名或持久行号。

修改机制时先确认权威文档，再同步 VSC 接入文档；端侧不复制 core 的完整规则。

## 3. 验证

用文档地图、doc_search 和 doc_check 检查主题归属、路径与段长；用语义阅读检查章节和跨层一致性。
