# Server 公网入口 · 设计

> 需求 = `docs/server/requirements/PROJECT.md` 的 TLS 与公网入口；路由 = `API.md`。
> 最近先例：server 配置校验、固定窗限流与审计。对齐 = 内置 TLS、无前置反代依赖。
> 勘察证据：已读证书、重定向、限流、cookie 与轮换。相关 = 当前公网面。

## 1. TLS

createGatewayServer 在 tls.enabled 时用 node:https，证书启动读取并可建安全上下文，失败拒启。可配置 HTTP 308 重定向，Location 使用 publicHost/publicPort，不信任 Host。

SIGHUP 重读并 setSecureContext；失败保留旧上下文并记审计。容器健康检查在 TLS 开启时使用 HTTPS。

## 2. 限流与 cookie

登录与公开 webhook 在路由前按 IP×类别固定窗限流，429+Retry-After，同窗聚合 security_event；/v1 使用自身鉴权/配额/限流。

trustProxy 的 IP 解析复用 accounts 规则。TLS 连接上的会话 cookie 附 Secure，HttpOnly/SameSite=Strict 保持。

## 3. 配置与审计

tls/rateLimits 有控制台写面，子键合并、写前证书预检、原子落盘，重启生效；非法配置零写。

security_event 记录 TLS 生命周期与限流异常，不记录秘密；普通匿名请求由日志承载，不逐行写审计。

## 4. 验证

验证无 TLS 兼容、HTTPS 登录、坏证书拒启、重定向方法保形、限流、SIGHUP 成败和 Secure 条件。
