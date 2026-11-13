# Function Spec · 提示词落地面

> 当前权威 = `docs/core/requirements/PROMPT-SYSTEM.md` 与 `docs/core/design/PROMPT-SYSTEM.md`。

## ① 模块目标

运行期提示词唯一副本位于 thincoder-core/prompts。规则语义先进入负责的机制文档，再由有写权的实现者修改对应提示词。

## ② 功能点

1. 角色 persona、纪律、语言和工具说明按当前装配链组合。
2. 提示词是产品代码，不是另一份需求或设计规范。
3. 提示词不引用外部规范文档来解释句子含义；执行坐标按 PROMPT-SYSTEM 规则保留。
4. 修改机制时同步检查相关提示词、工具描述和测试，不要求机械逐字复制机制文档。
5. 提示词落点不读取退役的 promptsLanding 或 checkConfig。
6. 设计取舍与先例检查按当前方法论，不在本规格另设“禁止候选对比”等规则。

## ③ 边界

- 不用 cp 或脚本代替语义更新。
- 不把本仓目录约定硬编码为其他项目的规则。
- 不在状态文档保存提示词文件数量或历史迁移过程。

## ④ 验收

| # | 判据 |
|---|---|
| AC-M9-1 | 运行期提示词只从 core 单一副本装配 |
| AC-M9-2 | 机制变更与提示词、工具描述同步核对 |
| AC-M9-3 | 规范引用禁则与执行坐标例外可区分 |
| AC-M9-4 | 无退役 promptsLanding 依赖 |

## ⑤ 依赖

PROMPT-SYSTEM、MANIFEST、TESTING。
