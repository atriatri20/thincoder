# MCP 客户端（MCP）· 设计

> 需求 = `docs/core/requirements/MCP.md`。
> 最近先例：`TOOLS.md` 的原生工具面与 `CONFIG.md` 的原子配置。对齐 = 无网关、失败隔离。
> 勘察证据：已读展开、三传输、探活、配置和生命周期。相关 = 当前 mcp.servers。

## 1. 展开

connectMcpServer 建连后读取 tools/list，以 `{server}_{tool}` 注册。sanitizeToolName 清非法字符、限制长度并去重。

inputSchema 保留；description 非字符串时有可读回退。execute 调 tools/call，resp.error 与 result.isError 都显式失败。

extractMcpText 序列化 content，truncateMcpOutput 按当前上限截断。

## 2. 会话

_sessions 按 name 保存 configFingerprint、transport 和 tools。指纹一致复用，变更关闭旧连接再建。

每轮工具装配看到当前注册表；closeAllMcp 在宿主退出清理。连接失败进 _mcpWarnings，并在下一用户输入可见。

## 3. 传输

- stdio：JSON-RPC 子进程，退出按当前平台树杀。
- HTTP：Streamable POST/SSE，Mcp-Session-Id 随请求；404 会话过期单飞重建并重试一次。
- WS：检查 OPEN，Bearer 使用当前 subprotocol 方式。

sendWithSignal 将上层中止传到 pending。postOnly 不因没有 SSE 流误判死亡。

## 4. 探活与配置

probeMcpServer 独立 initialize + tools/list，finally close，不进 sessions。

宿主配置表单编辑 name/endpoint/token/headers/env 等当前字段。持久化用 writeConfigAtomic/persistRaw；探活失败无 save-anyway。

## 5. 验证

验证命名、schema、错误、中断、输出、复用/重建、警告、探活清理、三传输和配置冲突。
