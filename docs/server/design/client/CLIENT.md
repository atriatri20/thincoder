# Server 客户端接入 · 设计

> 总览 = `docs/server/design/PROJECT.md`；端侧 = `docs/core/design/TEAM.md`。
> 最近先例：accounts 具名 key 与 core 团队登录。对齐 = 一枚 token 兼作模型与团队凭据。
> 勘察证据：已读 login/logout/rotate/me 与派生 provider 边界。相关 = 当前 client。

## 1. Token

/api/client/login 校验用户名密码，签发具名 api_keys key，明文仅本次返回，密码不落盘。token 同时可访问 /v1 与 /api/client。

logout 吊销当前 token；rotate 仅吊销并重签当前一枚，标签不变，不影响其他端或工作区 key。

## 2. 端点

`POST /api/client/login` 公开并受登录守卫；`logout`、`rotate`、`me` 要 Bearer。无效/吊销 token 为 401，错误与全站一致。

客户端登录不使用网页 sessions 表。端侧登录成功写 token 并派生 server provider，退出关闭团队面；token 可在我的 key 中查看提示形和撤销。

## 3. 验证

验证登录成功/失败/锁定、token 散列、双命名空间可用、退出即失效、单把轮换与审计。
