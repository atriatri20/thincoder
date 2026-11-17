# 团队台账客户端（TEAM-LEDGER）· 设计

> 服务机制 = `docs/server/design/ledger/LEDGER.md`；登录 = `TEAM.md`；本机账 = `LEDGER.md`。
> 最近先例：`LEDGER.md` 的五动作与 `TEAM.md` 的 team.token。对齐 = 两账独立、当前仓自动派生。
> 勘察证据：已读 team_ledger 参数、登录门、repo 派生与子代理变体。相关 = 当前服务端一本账。

## 1. 工具

team_ledger 支持 query/count/add/update/close。query/count 可用 scope/status/owner；写动作使用当前 title/detail/owner/id/status 参数。

返回服务端行与 total。depth>0 只读 query/count；主 agent 才可写。

## 2. 仓身份

从当前项目根经 git 取 remote.origin.url 原文并上送，由服务端归一。无 git 或无 origin 时明确失败，零请求。

工具没有 repo 选择参数；scope=repo 使用当前仓，scope=team 跨仓。

## 3. 登录与网络

teamStatus().loggedIn 是唯一登录门。未登录零网络并提示，本机账不受影响。

请求使用 team.server 当前 client ledger 端点、Bearer team.token 和当前超时。401 提示重新登录；不可达明确失败，无离线缓存或旧值回读。

## 4. 边界

不 import 本机 ledger 实现，不自动同步两账。控制台维护面由 server 文档负责，端侧不另建平行面板。

## 5. 验证

验证五动作、只读变体、repo 派生、无 origin、未登录零请求、401、网络失败无缓存和两账代码隔离。
