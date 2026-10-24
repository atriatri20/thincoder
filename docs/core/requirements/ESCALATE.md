# 飞刀（ESCALATE）· 需求

> 板块 = **飞刀**——把实现任务交给更强模型**亲自操刀**（`subagent` 工具动作 `action:"escalate"`）。
> 本档 = 该机制的**需求层权威**（F-E1–F-E5 / N-E1–N-E4 判定句）。
> 设计侧 = `docs/core/design/ESCALATE.md`（术语 / 候选池 / 工具契约 / async 机制 / 双端接线）。
> 相邻需求档 = `docs/core/requirements/CONSULTATION.md`（会诊——互补机制）· `docs/core/requirements/AGENT-LOOP.md`（异步化与池面）。

## 1. 总体定位

主模型遇到**自己干不动**的复杂实现任务时，请能力更强的模型**亲自操刀**——专家到场、亲自手术、术后交回病历、离场；
**缺省后台异步**（发起 ack → 回合收尾 → 完成报告自动到达），改动**并入父级守卫**——飞刀不能绕过父级门。

## 2. 功能性需求

| # | 需求 | 判定句（可机器验证） | 范围边界（不做） |
|---|---|---|---|
| **F-E1** | **强模型亲自操刀（可写）**：`subagent` 动作 `escalate` 召唤 `role: "coder"` 子代理（写路径复用：权限门 / 追踪）；候选池 = `agent.consultModels`；产物 = 术后报告 | 产出可写子代理（活动流经 `sub:escalate <label> #N` relay 上屏）；ask 模式经父面板弹卡带归属、AUTO 直通；报告含改动清单 / 理由 / 验证 + touched files | 不做独立 `escalateTool`；不做 UI 直连 |
| **F-E2** | **缺省 async（后台飞刀）**：发起返回 ack → other 池飞行；settle **三分类**（done = merge-all + 重叠警告；error = partial merge 决策；cancelled 不入 pending）；报告经 pending 单容器 digest 自动注入 | ack 为可解析 JSON（`{id, role:"escalate", status}`）；settle 即出池；报告**自动到达**；cancelled → 零 merge；async **不弹**继续面板 | `async:false` 仅机制参数（depth>0 平台规则）；不恢复轮询式 check |
| **F-E3** | **同步路径保留**：`async:false` → 同步执行；撞轮数上限经 question 通道「继续?」（`resume:true` 续跑，history / mutations 保留） | `async:false` 显式同步零回归；撞墙继续语义保持；顶层缺省异步（同步不成为缺省） | 不把同步设为缺省；不引入第三执行形态 |
| **F-E4** | **约束面**：depth-0 only；工程模式禁用（fail-closed——实现走 eng-coder）；空池不可用（不注册）；effort 越界钳制；无墙钟看门狗（轮数上限 + 单次调用超时 + Stop 直传） | depth>0 → 明确错误；工程模式 → 明确错误并指向 eng-coder 路径；池空 → 模型不可见（不误调）；max-effort 慢手术不被墙钟误杀 | 全自动升级不做（触发权 = 主 agent 判断 + 用户）；飞刀专用独立模型配置不做 |
| **F-E5** | **与会诊分工（互补不重叠）**：consult = 多模型并行**只读**意见；escalate = 一个强模型**亲自执行**（可写，走正常权限门） | 两机制工具面独立（两工具 start / stop vs 单动作）；权限面差异在位（escalate 可写经权限门） | 不合并两机制；不做「并行操刀」（一个手术台一位主刀） |

## 3. 非功能性需求

| # | 维度 | 标准（含度量） |
|---|---|---|
| **N-E1** | 改动并入父级守卫 | 子代理 mutations 合并 + 重置父级 verify / advisor 收敛预算——飞刀不绕过父级门 |
| **N-E2** | 活动流上屏 | relay `sub:escalate <label> #N` → 面板（冻结入流同 subagent / consult） |
| **N-E3** | 双端语义一致 | 分工 / 缺省 async / 约束面双端同源；**各端独立实现**（同结果、异载体） |
| **N-E4** | 可机判 | VSC 侧用例 = `thincoder-vscode/test/child-permission.test.mjs`（sync + async 接线 / 取消与 Stop 两路释放 / 角色域）等族；`npm test` 全绿、档名在册 |

## 4. 范围边界（不做）

- 不设硬边界（何时出手交模型判断）；不做机制化挂钩触发（verify 耗尽 / stall 不用于飞刀）。
- 飞刀再飞刀不做（depth 封顶）；多模型并行操刀不做；飞刀专用独立模型配置不做；全自动升级不做。
