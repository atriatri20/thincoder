# Design Token 生命周期（ENG-TOKEN-BINDING）· 需求

> 板块 = 流程凭证语义、格式、TTL、跨模式与恢复。
> 设计 = `docs/core/design/ENG-TOKEN-BINDING.md`；持久化与封印 = `DESIGN-TOKEN-SETTLEMENT.md`。

## 1. 总体定位

designToken 是防止 agent 跳过设计评审的流程凭证，不是防人或防仿冒的密码学边界。

## 2. 功能需求

| # | 需求 |
|---|---|
| FR1 | 默认 TTL 七天；agent.engTokenTtlMs 可配，有限正数有效，非法回退默认 |
| FR2 | 格式为 uuid:expiresAt；畸形、过期、值不等或不存在均拒绝 |
| FR3 | 有效 token 跨工程模式开关和重启存活；/new 会话切换清理 |
| FR4 | 恢复、进入工程模式和 spawn 过期拒绝时清理过期项； mismatch 不误删 |
| FR5 | 会话槽是权威持久面，内存是运行态，两者按当前结算与恢复协议一致 |
| FR6 | 只有完整评审、有效回显、VERDICT pass、§3 落地和封印可算才签发 |
| FR7 | 错误、中断、截断或陈旧不错误作废其他有效槽，也不产生新授权 |
| FR8 | 无回显、截断回显、裁定失败和落盘失败都有可见标记 |

## 3. 非功能需求

- 不添加 HMAC 或签名因子来伪装成安全边界。
- 各端使用同一生命周期语义。
- 旧合法槽按当前兼容规则恢复。
- 内容版本由 DESIGN-TOKEN-SETTLEMENT 的评审封印负责，不在本档另立 hash 机制。

## 4. 边界

不通过模式切换强制重评，不允许过期授权，不把凭证写入状态文档。
