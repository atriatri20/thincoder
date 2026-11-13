# ACP schema v1 合规核对 · 设计

> 通道机制权威 = `docs/cli/design/ACP-CLIENT.md`；本档只保留字段核对清单。

## 1. initialize 与认证

- protocolVersion 使用当前支持集协商。
- 响应只含 schema 字段；loadSession 与 sessionCapabilities 如实声明。
- authMethods 为对象数组，terminal 只在客户端声明时出现。
- authenticate 成功返回 `{}`，不作为脚本化客户端强制前置。

## 2. 会话形状

- sessionId 是持久槽位号字符串，new 返回值能在 list 中找到。
- list 条目含 sessionId/cwd/title；updatedAt 合法时为 ISO 字符串，非法时省略，不写 epoch 0。
- set_config_option 响应含全量 configOptions。
- select 项含 type/currentValue/options；boolean 项含 type/currentValue。
- current_mode_update 使用 currentModeId；config_option_update 使用全量 configOptions。
- usage_update 同时含 used/size。

## 3. prompt 与扩展

text 与 resource_link 是基线输入；resource/image/audio 等未支持形状不虚报。

resource_link 的文件与选区降级规则由 ACP-CLIENT 的 resource-link 机制负责。

子代理 `_meta` 是可选扩展，不改变协议版本和标准字段。

## 4. 验证方法

以官方 schema v1 和脚本化客户端逐字段解析响应；负例包含缺能力、无 authenticate、非法 updatedAt、未知 session 和不支持内容块。
