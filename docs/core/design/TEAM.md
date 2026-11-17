# 团队客户端（TEAM）· 设计

> 服务协议 = `docs/server/design/client/CLIENT.md`；配置 = `CONFIG.md`；provider = `PROVIDER.md`。
> 最近先例：`PROVIDER.md` 的派生条目与 `MULTI-INSTANCE-COLLAB.md` 的原子配置写。对齐 = 单写者、同拍一致。
> 勘察证据：已读登录、退出、轮换、teamVerify 和派生 provider。相关 = 当前 team.token 登录态。

## 1. 配置

team.server/member/label/token 是当前登录面。token trim 非空表示本地已登录。

派生 provider = `{name:"team",baseURL:"<server>/v1",apiKey:<token>,derived:true}`。它由 core 登录流程唯一写入，端壳不复制写盘。

明文密码只用于登录请求，不落盘。token 属敏感配置，日志和设置读出遮罩。

## 2. 登录

teamLogin 收集 server/username/password，生成端名@主机名标签并调用当前 login 端点。

成功后通过一次 writeConfigAtomic 同时写 team 与派生条目。失败按 network/credentials/rate_limited/write_failed 分类，零假成功。

已有同名手工 team 时不覆盖；登录可成功并返回 manual-name-conflict，但不伪造派生候选。

## 3. 退出

teamLogout 先尽力请求服务端吊销，再于一次本地写中移除 team.token 和派生 apiKey。

条目与 derived 保留；无 key 时不参与 provider 解析，并在列表隐藏。吊销未达要提示，但本地退出仍完成。

## 4. 状态校验

teamVerify 调用当前 me 端点，返回 valid/invalid/unreachable。只有 401 判 invalid，网络失败不冒充吊销。

校验在启动、团队面开合和显式 status 等当前时点触发，不建周期轮询。logout 或 token 缺席清 verify。

## 5. 轮换

teamRotate 需要当前确认门，取消时零请求零写。成功后一次写新 team.token 与派生 apiKey，并清 verify。

401 返回 invalid；网络失败不写；本地写失败返回 write_failed，下一次校验可发现旧 token 已失效。

## 6. 宿主接线

CLI/VSC/Desktop 各自提供登录、退出、状态与轮换入口。设置面用于管理，主界面提供当前直达入口。

登录和退出成功后刷新当前 provider/model 候选；失败不刷新出假状态。登录不自动改 defaultModel 或切换会话。

## 7. 验证

验证一次原子写、密码不落盘、失败分类、同名不覆盖、退出吊销未达、三态校验、轮换确认与写失败、派生隐藏和候选刷新。
