# Server MCP · 设计

> 总览 = `docs/server/design/PROJECT.md`；核机制 = `docs/core/design/MCP.md`。
> 最近先例：三端 core MCP 装配与 server 凭据管理。对齐 = 核协议单源、服务端清单单源。
> 勘察证据：已读 chat 挂载、CRUD、探活、审批与成员桥。相关 = 当前 MCP。

## 1. 管理会话

createMcpToolFace 每回合读启用清单，用 core connect/probe/close，合并名称/schema/invoke；失败跳过并冷却，重名显式丢弃后到件。

stdio 在 server 同机执行，http/ws 由 server 出向。停用/删除和停机关闭会话。

## 2. 配置

mcp_servers 库存 name/transport/target/enabled/secret_cipher，token/headers/env 加密且零回显。管理 CRUD 和 probe 需 admin，非法零写。

编辑敏感字段缺席不变，null 清除；探活支持库行或草稿，返回真实工具/时延/错误，不伪造成配置保存条件。

## 3. 审批与审计

管理会话的 `createMcpToolFace.readonlyOf` 恒为 false，因此每个 MCP 件都按写类进入管理 agent 的审批宿主。用户拒绝、无问面、回合收尾、中止或流断时均未决拒值，不调用 MCP；逐调用进入 chat_call，配置变更进入 mcp_event，秘密不入结果、日志或审计。

管理 agent 的 mcp 工具复用 store/face 提供列、增、改、删、探活，不复制实现。

## 4. 成员桥

盒每回合从 /api/box/mcp 取无秘密工具表，桥桩将每个工具标为 `readonly:false`，经盒内核写类门和 autoApprove 判定后才调用 /api/box/mcp/call。审批由盒内核发起，Server 只转发 ask/answer；应答端点以 cookie 或 Bearer 解析成员，并校验会话所属工作区归本人。Server 桥本身没有另一套审批门、admin 审批身份或按成员/工具授权表，工作区 key 只证明调用属于该工作区。

用户拒绝时盒内核生成 `Error: permission denied by user` 并写入盒内会话历史，不发起桥 HTTP 调用。当前拒绝分支不触发 onToolResult，所以没有对应 result 帧或 member_event/chat_call 结果行；不得把它写成 Server 桥返回了拒绝响应。桥内未知工具、无可用面或 MCP 执行错误以 HTTP 200、`ok:false` 和 message 返回，盒桩转成 Error 回模型；鉴权等 HTTP 非 2xx 由盒桩转成带状态码的调用错误。

浏览器中止经 Server 下行到盒，盒将回合 signal 与 15 秒超时合流到桥请求；Server 在桥响应半途 close 时中止自己的 AbortController，并传入 MCP execute。盒不持 MCP 连接或秘密；实际结果帧进入 member_event 审计。

## 5. 验证

验证 CRUD 负例、探活、冷却、重名、审批拒绝、停机、秘密零泄漏和成员桥。
