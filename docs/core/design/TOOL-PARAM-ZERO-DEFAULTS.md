# 工具参数默认值（TOOL-PARAM-ZERO-DEFAULTS）· 设计

> 需求 = `docs/core/requirements/TOOLS.md`。
> 最近先例：`DOC-CHECK.md` 的显式 target 与 `AGENT-LOOP-SUBAGENT.md` 的显式 async。对齐 = 缺参不造业务决定。
> 勘察证据：已读定位参数、四式 timer、observe recent、async 与 verify 声明。相关 = 当前必填门。

## 1. 判据

缺参时若代码必须自行选择一个改变结果的对象、身份、预算或授权，就必须显式拒绝并点名参数。

真正从配置取全集、缺省不改变业务结果的可选项不属于该问题。描述必须写清 optional 的实际语义，不把省略说成代码造值。

## 2. 当前契约

- doc_check/manifest 的 target 必填；会话锚只作相对路径基根。
- timer 的 seconds/at/every/daily 至少一种，list/cancel 走各自面。
- subagent observe 的 recent 必填并受当前范围。
- 顶层 spawn/advisor 的 async 必填，子层同步规则不变。
- 有代码改动时 verify 的 verification 必填，缺省时 _verifyPassed=false。
- consult models 省略表示使用当前配置全池，不是代码造默认对象。

## 3. 表达

schema 能表达时使用 required；互斥条件由运行门面校验。schema、tool-docs、执行错误和实际行为同轮一致。

相对定位缺锚时拒绝，不落 process.cwd() 隐式兜底。

## 4. 验证

逐参数验证缺、null、空串、合法值与当前 depth/mode 负例，确认拒绝发生在业务动作之前。
