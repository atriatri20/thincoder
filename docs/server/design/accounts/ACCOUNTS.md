# Server 账号与审计 · 设计

> 总览 = `docs/server/design/PROJECT.md`；客户端 token = `../client/CLIENT.md`。
> 最近先例：core 的凭据零回显与 server 单库。对齐 = key 与网页会话分族、逐请求鉴权。
> 勘察证据：已读 key、scrypt、会话、防爆破、禁用与审计。相关 = 当前 accounts。

## 1. Key

sk-tc 随机明文仅签发时显示，常规 key 只存 SHA-256。自助签发接收可选名称，trim 后最长 40 字符，空名按该成员累计签发数生成 key-N；active 上限 20，名称非法或超限零写。逐把吊销按 id 校验本人所有权，他人与不存在同为 404；吊销是软删，下一请求因逐次查库而 401。

`POST /api/me/keys/rotate` 当前是全换：先把该成员全部 active key 置为 revoked，再新签一枚。新行仍属同一 memberId，旧 key 全部失效；新 key 使用默认名，不保留任何旧标签。该端点没有事务，吊销成功而新签失败时不会恢复旧 key，因此原子性和旧标签保留都是明确的未实现缺口，不得写成已交付。客户端单把轮换另归 `../client/CLIENT.md`，不与本全换端点混述。

客户端登录、管理 agent 和工作区 scoped key 复用同一校验；全换不区分这些 key 族。确需服务端自用的明文只在专列按设计保存，普通列表不回显。

## 2. 登录与会话

成员 username 唯一，scrypt 散列，admin/user 角色。tc_session 为 HttpOnly、SameSite=Strict、绝对过期 cookie，库存 token 散列。

登录失败不区分不存在/错密码，双维防爆破，超限 429+Retry-After。改密保留当前会话并吊销其他会话，admin 重置给一次性临时密码并吊销目标会话。

## 3. 权限与禁用

所有管理端点服务端 requireAdmin；用户越权 403，无会话 401。成员模型禁用随鉴权行，派发前 404，models 同步滤除，优先于配额。

## 4. 审计

recordAudit 持久化域事件、actor/target 名快照和受限 detail；登录、key、密码、配置、沙盒、agent、项目、ledger、member、MCP 与 security 各有当前事件族。

审计与 usage 按同一保留窗清理；密钥、token、密码、证书私钥和终端内容不得入审计。

## 5. 验证

验证签发/吊销/轮换、所有权、登录防枚举、角色拒绝、改密/重置、禁用和每类实际写点的审计。
