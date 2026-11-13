# 工程模式（ENGINEERING-MODE-V2）· 架构设计

> 需求 = `docs/core/requirements/ENGINEERING-MODE-V2.md`。
> 最近先例：`docs/core/design/ARCHITECTURE.md` 的共享核与端壳边界。对齐 = 工程机制进 core；偏离 = 本档只描述工程流程与模块关系。
> 勘察证据：已读当前工程需求、MANIFEST、PORTABILITY、TESTING 和工具角色契约。相关 = 当前角色、写门、批次和凭证关系。

## 1. 需求层

### 1.1 总体设计

工程模式把流程放在实际工具与记录结构中：批次档承载过程，角色限定产物，advisor 提供独立评审，designToken 将批准设计绑定到实施，verify 记录验证结果。

### 1.2 架构条目

| # | 条目 | 设计归属 |
|---|---|---|
| E1 | manifest、台账、批次 | MANIFEST · LEDGER · BATCH-RECORD |
| E2 | 文档层与声明 | DOC-SYSTEM · DOC-DISCIPLINE |
| E3 | 角色与写权 | 本档 · PROMPT-SYSTEM · AGENT-LOOP |
| E4 | 委派、验证和检查 | AGENT-LOOP-SUBAGENT · TESTING · DOC-CHECK |
| E5 | phase 与 round | MANIFEST · AGENT-LOOP-SUBAGENT |
| E6 | 设计凭证 | ENG-TOKEN-BINDING · DESIGN-TOKEN-SETTLEMENT |
| E7 | plan 排除 | 本档 · AGENT-LOOP |

### 1.3 非功能要求

规则可迁移、失败可见、模块独立验证、正常路径无多余等待。语义判断不伪装成机械检查。

### 1.4 边界

本档不复制各模块的字段、状态机和详细算法，不保存迁移清单或历史实施计划。

## 2. 设计层

### 2.1 技术选型

| 面 | 选择 | 理由 |
|---|---|---|
| manifest | JSON | 机器状态与 schema 校验 |
| 台账 | SQLite | 状态约束、查询和事务 |
| 批次 | Markdown | 人读讨论、评审和交付记录 |
| 提示词 | core 内产品文本 | 运行期单一正本 |
| 写权 | 机械门与角色纪律分层 | 路径和凭证可机判，语义责任由角色承担 |
| 文档检查 | core 单引擎 | 判据、范围和解析统一 |

### 2.2 模块划分

| 模块 | 当前职责 | 详细设计 |
|---|---|---|
| M1 manifest | 项目声明、读取、写入、情境 | `MANIFEST.md` |
| M2 ledger | 工作项、状态机、结算 | `LEDGER.md` |
| M3 batch | 批次生命周期和段写权 | `BATCH-RECORD.md` |
| M4 write gate | 目标面、写权和冻结窗口 | `PORTABILITY.md` · `BATCH-LEDGER-REVIEW-UNIFY.md` |
| M5 subagent | 角色、任务书、调度和凭证校验 | `AGENT-LOOP-SUBAGENT.md` |
| M6 advisor | 设计/代码评审与收敛 | `ADVISOR-CONVERGENCE.md` |
| M8 doc check | 文档检查与锚点图 | `DOC-CHECK.md` · `DOC-GRAPH.md` |
| M9 prompt | 提示词与工具描述 | `PROMPT-SYSTEM.md` |
| M10 testing | 单元、集成和发布验证 | `TESTING.md` |
| M11 plan exclusion | 工具、命令和模式状态 | 本档 E7 |

模块可以共享 core 接口，但不通过另一份配置或文本复制业务规则。

### 2.3 架构方案

#### E1 三类记录

manifest 是项目声明，ledger 是工作项，batch 是一轮过程。批次与台账在收口时通过同一工具事务结算；manifest 不携带当前批次指针。

#### E2 文档体系

docRoot 决定文档层和落点。需求、设计、标准和过程各自归属；文档地图只负责导航。

#### E3 角色架构

| 角色 | 输入 | 输出 | 结构约束 |
|---|---|---|---|
| 主 agent | 用户意图、项目事实 | 需求、派单、裁决、收口 | 管理与确认面 |
| eng-designer | 批次 §1、当前文档 | 设计与批次 §2 | 设计写权 |
| eng-coder | 批次 §2、designToken | 实现、验证、批次 §5 | 凭证与批次绑定 |
| advisor | 明确评审对象与证据 | 评审结论与批次 §3 | 只读代码与文档，限段写入 |
| explore | 结构化勘察任务 | 证据报告 | 只读 |

#### E4 规则架构

- 工程角色从批次 §2 获取任务书。
- 非工程角色使用 goal、knownFacts、scope、acceptance、reportFormat。
- files 用于冲突串行，dependsOn 用于结果依赖。
- 评审对象由参数与批次定义，不靠遍历仓库猜测。
- 写门使用 faceOf 与目标项目归属。
- 提示词与工具描述随规则变更同批更新。
- 测试与文档检查按当前业务面验证，不使用散文锚代替行为。

#### E5 情境架构

phase 由 manifest 保存。顶层工程会话通过 transient 情境行注入，保持幂等、单活体和压缩后恢复。

round 是工程角色 spawn 参数。fix 复用 designId 与 designToken，并在文档先行后处理评审发现。

#### E6 评审凭证

设计评审通过后，设计与会话槽中保存有效凭证。eng-coder spawn 校验 batchDoc、designId、designToken 和 round。

凭证缺失、不匹配、过期和已消费是不同状态。批次完成后消费凭证，后续工作需要新评审与新凭证。

#### E7 plan 面排除

| 面 | 当前设计 |
|---|---|
| 工具装配 | 工程模式不提供 plan；普通模式保留 |
| CLI 与 ACP | 工程模式进入 plan 时明确拒绝 |
| VSC | 面板禁用或拒绝，并回弹实际状态 |
| 状态恢复 | engineering=true 时清除 planMode 与未注入 plan 提示 |
| 子代理 | 工程角色与工程子会话同样不获得 plan |

### 2.4 模块依赖

```text
MANIFEST → 文档根、项目归属、phase
LEDGER ↔ BATCH-RECORD → 工作项与过程结算
ADVISOR → 设计评审 → design token
SUBAGENT → token + batchDoc → ENG-CODER
WRITE GATE → 目标面 + 在途工作项
DOC-CHECK / DOC-GRAPH → 当前文档与变更区
VERIFY → 实际验证声明
```

依赖通过 core 导出和工具参数表达，端侧只传宿主状态。

### 2.5 整体数据流

1. 主 agent 与用户确认需求并登记。
2. 开批并绑定工作项。
3. eng-designer 调查并写设计。
4. advisor 评审，必要时修复。
5. 用户批准或既有整批授权生效。
6. eng-coder 按设计与凭证实施。
7. 实施者审计、自修和验证。
8. 必要时进行代码评审与修复。
9. 主 agent 完成文档对账、用户确认、收口和结算。

### 2.6 关键技术决策

| # | 决策 | 理由 |
|---|---|---|
| KD1 | 三类记录分开 | 项目声明、待办和过程回答不同问题 |
| KD2 | 文档判据内置，路径声明外置 | 判据稳定，项目结构可迁移 |
| KD3 | 机械与行为责任分层 | 防止把语义责任交给路径检查 |
| KD4 | 提示词只有产品正本 | 避免运行期文本双源 |
| KD6 | 凭证绑定设计和会话 | 防止批准被复用到另一项工作 |
| KD8 | 工程模式卸载 plan | 避免与已有设计批准链竞争 |
| KD9 | 调度声明 files 与 dependsOn | 文件重叠和结果依赖由调度器处理 |

## 3. 验证

### 3.1 验收面

- 每类记录的作者、状态和写权。
- 设计评审、用户批准、凭证签发与消费。
- eng-coder 参数缺失、错误和过期。
- 批次收口与工作项结算的成功和失败回滚。
- 普通模式与工程模式的工具差异。
- plan 的工具、命令、面板和恢复行为。
- 文档检查只执行当前三项判据。

### 3.2 验证纪律

使用真实工具调用、结构化状态和可观察结果。不要用提示词某句存在、历史用例编号或一次计数作为当前机制正确的替代证据。
