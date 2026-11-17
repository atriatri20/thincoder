# verify 通用验证门禁（VERIFY-REDESIGN）· 设计

> 需求 = `docs/core/requirements/VERIFY-REDESIGN.md`。
> 最近先例：`ADVISOR-GUARDS.md` 的声明/证据分离。对齐 = 机械判声明，不伪造运行事实。
> 勘察证据：已读 verification 参数、doc-only、guard 与 goal 分支。相关 = basis 仅提示。

## 1. 参数

```text
verification: { status: passed|failed|skipped, command?, summary?, basis? }
workdir?
```

summary 在 skipped 时必填。basis 是可选判据来源，不做语义机检。command 只是声明，不由 verify 执行。

## 2. 判定

| 输入 | 结果 |
|---|---|
| passed | 放行 |
| failed | 阻断，_verifyPassed=false |
| skipped + 非空 summary | 放行 |
| skipped 无理由 | 阻断 |
| 缺失/未知 status | 阻断 |

doc-only 且无显式声明时走快路径；显式 failed 先于快路径。

passed/skipped 缺 basis 时报告提示；failed 和已阻断分支不叠提示。

## 3. 报告与引导

报告包含当前 git diff 文件、task 和自审清单。JS/MJS 可提供 node --check 软提示，不据此改变判定。

阻断引导点名项目 AGENTS.md，让调用者自行选择并实际运行验证。

## 4. 完成守卫

completion.mjs 在 verifyGuard 开启且非工程流程时处理未验证、失败和重试耗尽。耗尽后必须诚实披露，不自动改成 passed。

goal.mjs 的 complete 在有文件改动但未 verify 时拒绝。

## 5. 验证

覆盖 passed、failed、skipped 两态、缺失、未知、doc-only、doc-only+failed、basis 提示、guard 和 goal 拒绝。
