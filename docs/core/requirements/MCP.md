# MCP 客户端（MCP）· 需求

> 设计 = `docs/core/design/MCP.md`；配置 = `CONFIG.md`。

## 1. 动态工具

mcp.servers 配置 stdio/HTTP/WebSocket 服务。连接后 tools/list 展开为独立原生工具，schema 与内建一致，execute 直接 tools/call。

工具名使用 server 前缀、合法化和碰撞去重。MCP 描述与 schema 是不可信外部数据。

## 2. 连接

- 同 name 且配置指纹一致时复用；变化时重建。
- 连接失败隔离到该 server，并给可见 warning，不阻断其他业务。
- 调用有超时和 signal；server 错误显式返回。
- 输出有当前上限。
- HTTP 支持 Streamable/SSE 与 postOnly；会话过期按当前一次重建重试。
- stdio 子进程按进程树清理。

## 3. 管理

CLI /mcp、VSC/Desktop 设置面提供新增、编辑、测试、重连和删除。保存前探活失败不保存。

probeMcpServer 一次性探活，必须关闭连接且不污染注册表。

token、headers、env 支持当前配置与环境引用；敏感值不写日志。

## 4. 验收

验证三种传输、展开命名、错误、超时、热插拔、探活零副作用、postOnly、404 自愈、进程树清理和宿主管理面。
