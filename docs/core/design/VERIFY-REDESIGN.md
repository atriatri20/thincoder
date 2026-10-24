# verify 通用验证门禁（VERIFY-REDESIGN）· 工具系统板块

> 板块 = **工具系统（verify 元工具）**——通用验证门禁的交互契约、判定门与双端一致。
> 本档 = verify 机制设计的**唯一权威**（契约 / 判定 / 坐标）。
> 工具契约要点 = `docs/core/design/TOOLS.md`（§6.7 verify 行 · 元工具族）；`verify` 与 coding 语境的边界 = `docs/core/design/AGENT-LOOP.md`；本档不复制其内容（D2）。
> 双端：CLI `thincoder-core/agent-tools/verify.mjs` · VSC `thincoder-vscode/src/agent-tools/verify.mjs`（同机制、各自实现）。
> 需求侧 = `docs/core/requirements/`（根层**无**对应档）；CLI 树需求档 `thincoder-cli/docs/requirements/VERIFY-REDESIGN.md`（部分面已由 `TOOLS.md` D-V5 快路径接管）。

## 1. 定位

**现行定位**：verify = **语言 / 框架 / 项目无关的完成前门禁**。它**不替模型跑任何测试/验证命令**，只对模型的**声明**做机械裁定。

## 2. 交互契约（声明式）

模型调用 verify 时**声明验证状态**（`verification` 参数，`thincoder-core/agent-tools/verify.mjs:82`–`:92`）：

```text
verification: { status: "passed" | "failed" | "skipped", command?, summary?, basis? }   // status 必填；basis 可选（「根据」维）
```

- `command` / `summary` 可选；**`summary` 在 `skipped` 时为必填**（须给具体理由）。
- **`basis`（可选）**：判据源 ∥ 实读坐标（`file:line`）∥ 显式 `unverified`——「根据」维**声明式**（格式零校验 · 零机检）。`passed` / `skipped` 缺 `basis` ⇒ 报告附**提示行**（advisory——不阻断 · 不改判定）；`failed` 面零提示（已阻断）；`skipped` 无 `summary` 的打回支同零提示（阻断面不叠加——提示仅随放行面出现）。
- verify **不执行** `command`——它是模型的自述证据。
- 参数面保留 `workdir`（定位项目根 / doc-only 判定）。
- 参数面无 `full` / `testNamePattern` / `filter` 及其拒绝分支（无「自动跑测试」后语义消亡）。

## 3. 判定门与打回引导

| 声明 | 行为 |
|---|---|
| `passed` | 放行（结合语法结果） |
| `failed` | 打回（`_verifyPassed = false`，不能声明 done） |
| `skipped` + `summary` | 放行 |
| `skipped` 无 `summary` | 打回（空跳过不允许——防假装跑过） |
| 未声明 | 打回并要求声明 |

- **打回引导**（`thincoder-core/agent-tools/verify.mjs:62` · `:166`）：打回消息列出改动的源文件，并引导「参考项目 `AGENTS.md` 声明的验证方式决定补什么验证」——不空泛说「没验证」。
- **doc-only 快路径**：全部改动为文档 → 早退（无需验证）；**但不得吞显式 `failed`**——模型显式声明 `verification.status = "failed"` 时**恒打回**（双端同）。
- **可选语法提示**：仅改动为 `.js` / `.mjs` 且 node 存在时给 `node --check` **软提示**（**不进门禁**）。
- 另报：改动文件清单（git diff）、task 清单、自审 checklist。
- **`basis` 与判定零耦合**：三判定行为逐字不变——`basis` 仅为报告附加维（缺失 ⇒ 提示；`skipped` 的 `summary` 必填判据不因 `basis` 替代）。

## 4. 完成守卫（guard）与 goal 门禁

verify 的强制面住在完成路径，不住 verify 本体：

- **completion guard**（`thincoder-core/agent/completion.mjs:73`–`:74`）：**opt-in**（`agent.verifyGuard === true`）且**排除工程模式**（工程模式走流程驱动评审，不做逐回合机械推回）。
  - G1 未验证 → 推回提醒（`:76` · `:81`）；
  - G2 已声明但未通过 → 重试推回（`:89` · `:94`），上限 `MAX_VERIFY_RETRIES`；
  - G3 重试耗尽 → 一次性诚实声明提醒（`:100` · `:109`）。
  - 三条文案均**不称**「test failures」——`_verifyPassed === false` 可能是 failed / 无理由 skipped / 未声明（`:87`–`:88` 注释即此判据）。
- **goal 门禁**（`thincoder-core/agent-tools/goal.mjs:52`–`:54`）：本 run 改过文件却未 verify → 拒绝 complete。

## 5. 双端一致与提示词面

- **双端一致（硬要求）**：同输入同判定（通过 / 打回同结果）。VSC 侧对位：

| 面 | CLI | VSC |
|---|---|---|
| guard 首闸 | `thincoder-core/agent/completion.mjs:81` | `thincoder-vscode/src/agent/run-stages.mjs:86` |
| guard 重试 | `thincoder-core/agent/completion.mjs:94` | `thincoder-vscode/src/agent/run-stages.mjs:99` |
| guard 耗尽 | `thincoder-core/agent/completion.mjs:109` | `thincoder-vscode/src/agent/run-stages.mjs:113` |
| code-mutations 层 | `thincoder-core/agent/completion.mjs:80`（`hasCodeMutations`） | `thincoder-vscode/src/agent/run-helpers.mjs:71` |
| 打回报告 | `thincoder-core/agent-tools/verify.mjs` | `thincoder-vscode/src/agent-tools/verify.mjs:142`（`rejectionReport`） |
| goal 门禁 | `thincoder-core/agent-tools/goal.mjs:52` | `thincoder-vscode/src/agent-tools/goal.mjs:38` |

- **提示词面**：测试执行职责**在模型**——模型从项目 `AGENTS.md` 读验证方式，自决跑哪一层（迭代期只跑本任务面单元测试；全量 ∕ 集成 = 收口恰一次、父侧——见 `requirements/TESTING.md` §2 F1–F4），verify 只**收声明**。提示词 = `thincoder-core/prompts/**`（唯一副本；本档只留机制边界，D2）。
- **测试纪律不进 verify 代码**：纪律靠 `AGENTS.md` / 提示词自然语言指导，不硬编码进工具。

## 6. 机制面（现状路径）

### 6.1 实现坐标

| 面 | 落点 | 状态 |
|---|---|---|
| 工具对象 / 描述派生 | `thincoder-core/agent-tools/verify.mjs:75`（`verifyTool`）· `:78`（description） | 在位 |
| `verification` schema | `thincoder-core/agent-tools/verify.mjs:82`–`:92` | 在位 |
| doc-only + 显式 failed 铁判 | `thincoder-core/agent-tools/verify.mjs:152`–`:167` | 注释 + 分支在位 |
| 判定门写入点 | `thincoder-core/agent-tools/verify.mjs:183` · `:226` · `:235` · `:241` · `:247` · `:253` · `:260` | 在位 |
| 未知 status 拒 | `thincoder-core/agent-tools/verify.mjs:258` | 在位 |
| guard 强制端 | `thincoder-core/agent/completion.mjs:73`–`:74`（opt-in）· `:81` · `:94` · `:109` | 在位 |
| goal 完成门 | `thincoder-core/agent-tools/goal.mjs:52` | 在位 |

### 6.2 用例（现行）

| 组 | 覆盖 |
|---|---|
| T-V1–V4 | 声明四态：passed 放行 / failed 打回 / skipped+理由放行 / skipped 无理由打回 |
| T-V5 | doc-only 快路径放行 |
| T-V6 · T-V6b | 打回消息含改动文件 + 引 AGENTS.md；未声明 → 打回并要求声明 |
| T-V8 | doc-only + 显式 failed → 打回（G10 双端同） |
| VSC 对位 | VSC 侧同名单元测试档（端专属面 = 编辑器诊断段与可 Stop 中断执行） |

## 7. 关键决策记录

| # | 决策 | 理由 |
|---|---|---|
| D-V1 | verify 收**声明**（`verification`），不代跑命令 | 通用 agent 不得锁死 JS/npm 生态；模型自述证据 + 机械门 |
| D-V2 | `skipped` **须带理由** | 无理由跳过 = 假装跑过 |
| D-V3 | 打回消息**给引导**（列改动文件 + 引 AGENTS.md） | 只说「没验证」模型无从下手 |
| D-V4 | 删 `MODULE_TO_TEST` / 模块映射 / related-tests / `npm test` 自动跑 / 无测试拦 done | 项目私有逻辑不得进通用工具（测试一变即悬空，已实证） |
| D-V5 | **保留** doc-only 快路径 + 语法软提示 + task/checklist + git diff 报告 | 这些是语言无关的机械面；语法提示**不进**门禁（避免锁生态） |
| D-V6 | 双端**同输入同判定** | 门禁语义分叉会让同一模型行为在两个壳里结果不同 |
| D-V7 | 参数清理：删 `full` / `testNamePattern` / `filter`，留 `workdir` | 无自动跑测试后这些参数语义消亡 |
| D-V8 | doc-only 快路径**不吞**显式 declared failed | 快路径是省事通道，不是绕过模型明示失败的通道 |
| D-VR9 | **「根据」维 = 声明式（`basis` 可选字段 + 缺省提示），零机检** | 判定「一句有没有根据」需语义理解 ⇒ 硬机检必假阳；`basis` 可选 ⇒ 向后兼容（老会话零破）；提示不阻断（`passed` / `skipped` 放行语义零变）。 |
