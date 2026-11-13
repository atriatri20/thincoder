# 模型规格表（MODEL-SPECS）· 设计

> 需求 = `docs/core/requirements/PROVIDER.md`；调用机制 = `PROVIDER.md`。
> 最近先例：`PROVIDER.md` 的五级窗口链与统一 chat。对齐 = 数据与机制分离、未知不伪造能力。
> 勘察证据：已读规格字段、匹配、effort/off、模态和预设章节。相关 = 当前代码行是模型取值真源。

## 1. 数据责任

thincoder-core/model-specs.mjs 的 MODEL_SPECS 是当前逐模型取值权威。本文不复制易过期的模型清单、版本快照或实测读数。

新增或修改一行时，逐字段记录当前一手来源或实测证据；不能从名字猜能力。未核实字段不声明。

## 2. 字段

当前字段包括 context、maxOutput、thinking、partialMode、prefixMode、multimodal、thinkApi、thinkEnabledValue、reasoningEcho、thinkAlwaysOn、reasoningEffortEnum、tempRange、noUsageStream 等。

multimodal 当前表示图像输入能力，不据此声明音频/视频。新模态只有在真实消费路径存在时才增加结构化字段。

## 3. 匹配

- 模型 ID 按 `/` 取最后一段并忽略大小写。
- 静态规格使用当前排序后的前缀匹配。
- modelContext 与列表 id 使用末段相等。
- 末段为空时未命中。
- 未知模型使用 DEFAULT_SPEC 并给一次性可见告警。
- 不设置会借能力给整族的泛前缀托底行。

## 4. effort 与 off

reasoningEffortEnum 保留服务端合法顺序。界面默认选择使用当前已存值、注册默认和中性档规则，不把首项 none 当成“开启”。

thinkOffPath/thinkOffShape 是关闭能力的单源。thinkAlwaysOn 表示不可宣称关闭的服务端族。

无 off 路径时 UI 不提供假 off；off 记号与枚举值按 PROVIDER 的请求规则装配。

## 5. 预设

PROVIDER_PRESETS 只承载已核实的 baseURL、format、头和请求默认值，不携模型或 models 清单。

未实测的请求字段不预设。自定义 OpenAI 兼容端点是长尾渠道入口。

## 6. 兼容与退役

旧模型名仍在服务端受理时，删除规格会改变窗口与能力，必须逐项评估。路由名与真实能力分别核实。

规格变化同步当前消费面、配置 UI、测试与说明，不把历史裁定表留在本档。

## 7. 验证

验证匹配、未知兜底、无泛族误配、字段消费、effort/off、图像门、窗口来源和预设不携模型。模型实测按具体变更执行并留当次记录。
