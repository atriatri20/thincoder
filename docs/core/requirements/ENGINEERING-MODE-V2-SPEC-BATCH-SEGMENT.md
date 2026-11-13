# Function Spec · M3 批次档六段

> 当前设计 = `docs/core/design/BATCH-RECORD.md`；批次—台账—评审联动 = `BATCH-LEDGER-REVIEW-UNIFY.md`。

## ① 模块目标

批次档是一轮工作的过程记录。六段各有作者，工具保证写段、状态、凭证剥除、生命周期和结算规则。

## ② 功能点

1. **六段骨架**：§1 讨论，§2 设计与任务，§3 评审，§4 用户批准，§5 实施，§6 验证与收口。
2. **作者**：工程模式由主 agent、eng-designer、advisor、eng-coder 分写；普通模式席位按 NORMAL-MODE 折叠。
3. **batch 工具**：create、attach、append、edit、status、close、supersede、check。
4. **段写权**：越段拒绝；子代理目标档由 spawn 或评审实例绑定，depth-0 可显式 path。
5. **段内编辑**：作者可 append 或 edit 自己段；状态行只由 status/close 等生命周期动作改值。
6. **冻结**：已收口档不回改；重开需要理由并追加记录。
7. **路径**：create、读面、评审门和 spawn 门使用统一解析；create 必须落在声明批次基底内。
8. **凭证**：写批次时剥除凭证；designToken 只通过参数与槽传递。
9. **评审记录**：§3 每轮写结论表、VERDICT 和计数；工具生成轮次并维护状态行。
10. **实施门**：§5 需要当前评审通过与最新轮次 pass。
11. **收口**：正常批检查链完整性，使用 completed 与 closeEvidence 结算；全归档批可按条件补关。
12. **被取代**：supersede 结算已完成行并退回未完成行，不伪造未发生的评审或批准。
13. **一致性**：check 只读报告批次与台账半状态，不自动修复。

## ③ 边界

- 不做评审内容质量判断。
- 不把批次正文当作长期状态规则。
- 不让子代理选择或创建另一批次。
- 不把 files 调度清单当作授权。
- 不把历史批次视为不可删除的长期规范。

## ④ 验收

| # | 判据 |
|---|---|
| AC-M3-1 | 越段、越档、越身份写入被拒绝 |
| AC-M3-2 | create 产生六段骨架和合法状态行 |
| AC-M3-4 | 已收口档回改拒绝；合法重开可恢复 |
| AC-M3-5 | 各调用点使用同一路径解析，不二次拼接 |
| AC-M3-6 | 项目根、子目录、工作区、相对与绝对路径按当前规则处理 |
| AC-M3-7 | 状态行恰一条才可读；多条时拒绝并给修复路径 |
| AC-M3-8 | append/edit 过同一文档与凭证安全门 |
| AC-M3-9 | §3 裁定、工具置位、§5 门和凭证签发一致 |
| AC-M3-10 | close、status、supersede、补关和 check 的台账结果可验证 |

## ⑤ 依赖

- MANIFEST：docRoot.batches 与项目归属。
- LEDGER：批次行、状态和结算。
- PATH-RESOLUTION：统一路径候选与判态。
- ADVISOR：评审绑定、凭证与结算。
- DOC-CHECK：写门与收口文档检查。
