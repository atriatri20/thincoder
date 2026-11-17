# designToken 生命周期（ENG-TOKEN-BINDING）· 设计

> 需求 = `docs/core/requirements/ENG-TOKEN-BINDING.md`。
> 最近先例：`DESIGN-TOKEN-SETTLEMENT.md` 的多槽权威持久面。对齐 = 同一格式与 TTL；分工 = 本档不管落盘细节。
> 勘察证据：已读当前 eng-coder spawn、design-slots 与 consume-design 契约。相关 = 显式凭证、多槽和消费。

## 1. designToken 是什么

它是“设计评审已经完成”的流程凭证。agent 能看到生成因子，因此不把它当密码学安全边界。

三条规则：

1. 格式校验与 TTL 构成基本有效性。
2. 凭证绑定会话，跨模式存活。
3. 会话槽权威持久面与内存运行态共同服务恢复，结算细节由 DESIGN-TOKEN-SETTLEMENT 定义。

## 2. 格式与配置

格式 = `${uuid}:${expiresAt}`。tokenExpiryMs 与 tokenExpired 是格式和过期判定单源。

默认 `TOKEN_TTL_DEFAULT_MS = 7 * 24 * 3600 * 1000`。agent.engTokenTtlMs 仅接受有限正数，非法回退默认。

validateDesignToken 对畸形和过期 fail-closed。

## 3. 生命周期

| 事件 | 行为 |
|---|---|
| 完整设计评审通过 | 经全部签发门后入槽 |
| 工程 ON→OFF | 不清 |
| 工程 OFF→ON | 有效槽继续，不强制重评 |
| 重启/恢复 | TTL 过滤并水合 |
| 进入工程模式 | 清过期，保留有效 |
| spawn 过期 | 拒并删该过期槽 |
| spawn mismatch/畸形 | 拒，不误删其他槽 |
| /new | 清当前会话凭证 |
| 收口/消费 | 按 DESIGN-TOKEN-SETTLEMENT 删除并落盘 |

## 4. 结算判定

### 4.1 必要合取

签发需要：有效 token 回显、VERDICT pass、无 changes-required、评审完整、§3 记录合格、批归属和封印可持久化。

任何一步失败都不产生新授权。已有其他 designId 槽不被连坐。

### 4.2 回显

全串回显与当前允许的 uuid 截断形由 settleDesignReview 判定；槽始终保存完整 token。

无回显、截断、裁定失败和落盘失败使用各自可见标记。stripDesignTokenEcho 统一清理回显残片，避免未注册凭证进入报告或 prior。

### 4.3 裁定行

verdictGateFailure 先识别 changes-required，再要求 pass。缺行、并现或非字符串都拒签。

裁定行只是受控协议信号，不等于宿主解析整篇自然语言评审。§3 工具状态与最新轮次继续独立把关。

## 5. 写权与 spawn

eng-coder 必须显式携带 designId 与 designToken。designId 不是凭据，不能仅凭它自动授权。

resolveDesignSlot 处理槽定位，gateDesignToken 再校验严格相等、TTL、批归属和封印。

普通模式没有这条工程凭证门。

## 6. 多端

core 提供生成、校验、结算、TTL、恢复、spawn 与消费语义。VSC 等宿主可每 run 重建 agent，但必须先水合槽再判门。

## 7. 关键决策

| # | 决策 | 理由 |
|---|---|---|
| D-E1 | 无签名流程凭证 | 目标是流程约束，不是密码学边界 |
| D-E3 | 跨模式存活 | 开关模式不代表设计失效 |
| D-E4 | 槽持久化 | 重启恢复是业务需求 |
| D-E5 | 只有格式合法项才做 TTL 过期判定 | 避免把畸形与过期混同 |
| D-E7 | 签发与校验集中 | 防止第二签发点 |
| D-E8 | 截断回显按当前规则容忍并标记 | 保留批准信号且槽存全串 |
| D-E9 | 失败恒定标记 | 防止静默无授权 |

评审版本封印属于当前结算设计，不与“无签名流程凭证”矛盾。

## 8. 边界

不新增 HMAC，不把凭证写进状态文档，不让模式切换代替 TTL 与消费，不让内容版本校验在本档形成第二实现。
