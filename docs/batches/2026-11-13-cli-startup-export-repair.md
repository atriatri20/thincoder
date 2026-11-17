# 2026-11-13 · cli-startup-export-repair
> 六段 append-only，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（主 agent）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（实施者：主 agent ∥ coder）· §6 验证与收口（父代理）。
> 编制：主 agent · 2026-11-13 · 来源 = 用户报告 thincoder 启动闪退并确认修复；crash-1794580398712-28884.json 指向 cmd-advisor 的旧 writeSessionFile 导入。
> 台账 = #2394（core · 归批）。前情 = 无（独立批）。
## §1 讨论（主 agent）
**状态行**：已收口 2026-11-13
<§1 模板占位：本批条目 / 关键判据 / 授权口径>

症状 = 当前工作树 CLI 启动闪退，全局旧版可执行 --version。自动崩溃记录给出精确栈：cmd-advisor.mjs 从 cmd-eng.mjs 导入已删除的 writeSessionFile，TUI 动态装载 command-interactive 时实例化失败。

证据 = crash-1794580398712-28884.json 与两份同刻 tui-stderr 日志；正确原子写原语由 @thincoder/core/session.mjs 导出。

## §2 批次任务与设计（主 agent）
**状态行**：设计完成（公共写面与真实模块装载回归）
<§2 模板占位：本批条目（覆盖） / 设计档落点 / 机制设计 / 受影响文件与测试覆盖 / 验收对照 / 关键决策 / 上抛项>

**设计** = 将 cmd-advisor 的旧相对导入改到 core session 公共写面，不恢复重复 helper。新增 CLI 50-3，直接装载真实 tui.mjs 模块图，覆盖旧回归未经过的模块实例化。

**最近先例** = core session.mjs 的 writeSessionFile 转口；最小改动保持 advisor 守卫持久化逻辑不变。

**勘察证据** = 已读 core session.mjs、真实崩溃栈和 TUI 模块装载链；无相关外部公共源。

**受影响文件（机读清单）**

| 档 | 分拆方案 | 行数 |
|---|---|---|
| thincoder-cli/src/tui/cmd-advisor.mjs | — | 292 |
| test/integration/minimal-mode.test.mjs | — | 166 |

结构不变；cmd-advisor 仅替换导入行，minimal-mode 回归档预计增量 ≤±10 行。

**集成增量** = CLI 50 增加 50-3：从真实 tui.mjs 装载完整模块图，断言 startTUI 可用；业务追溯 = CRASH-REPORTS F-CR1 及本次真实启动 SyntaxError。

**验收** = 实现期用真实 tui.mjs 装载烟测覆盖原崩溃；CLI 50-3 与 minimal-mode 集成回归在收口链末执行一次。

## §3 设计评审（评审子代理）

### 轮次 1（评审子代理）

| # | Category | Severity | Issue | Suggestion |
|---|----------|----------|-------|------------|
| 1 | Affected-file size | 🟡 | 受影响文件表只标注了 292 / 166 行，未给本批预期增减量或“structure unchanged”（D:\teamcode\thincoder\docs\batches\2026-11-13-cli-startup-export-repair.md:25、D:\teamcode\thincoder\docs\batches\2026-11-13-cli-startup-export-repair.md:26）。本次评审范围不含这两份源码/测试档，故未对行数读数作盘上抽查。 | 为两档分别补 `≤±N` 或“structure unchanged”，并保持设计时行数为批前口径。 |
| 2 | Survey evidence | 🟡 | §2 记录了最近先例，但没有公共来源勘察证据行，也未明确记录“无相关公源”（D:\teamcode\thincoder\docs\batches\2026-11-13-cli-startup-export-repair.md:19）。 | 补记检查过的公共来源及相关性；若此类内部导入修复无相关公源，明确写 `none relevant` 及已查来源。 |
| 3 | Acceptance / test layering | 🟡 | 验收把 CLI 50-3 与 `minimal-mode` 集成档全档回归直接列为验收，未区分实现期检查和链末集成验收（D:\teamcode\thincoder\docs\batches\2026-11-13-cli-startup-export-repair.md:30；D:\teamcode\thincoder\test\rtm\tooling.md:175）。 | 实现期验收保留真实 TUI 装载烟测或改动面单元测试；将 CLI 50-3 / `minimal-mode` 集成跑标为收口时链末恰一次。 |
| 4 | Integration traceability | 🟡 | 50-3 挂在“三档模式切换、极简提示词与知识查询”故事下，节注回溯 PROMPT-SYSTEM / CONFIG / SESSION，但启动导入回归与这些业务需求的追溯关系未说明（D:\teamcode\thincoder\test\rtm\tooling.md:166、D:\teamcode\thincoder\test\rtm\tooling.md:169、D:\teamcode\thincoder\test\rtm\tooling.md:175）。 | 在 50-3 或节注补启动业务需求/生产事故追溯；若它不属于故事 50，调整到启动业务故事，并继续先在 RTM 固定用例编号。 |
| 5 | Doc state | 🟡 | 评审对象声明为“已实现”，但批档 §5 实施记录与 §6 验证收口仍为空，§1 也仍是进行中（D:\teamcode\thincoder\docs\batches\2026-11-13-cli-startup-export-repair.md:6、D:\teamcode\thincoder\docs\batches\2026-11-13-cli-startup-export-repair.md:37、D:\teamcode\thincoder\docs\batches\2026-11-13-cli-startup-export-repair.md:38）。 | 按实际实施与验证结果补录 §5 / §6，并在完成收口链后更新 §1 状态。 |

计数：🔴 0 · 🟡 5 · 🔵 0
VERDICT: pass

## §4 用户批准（主 agent）

用户在根因、公共 core 导入和真实启动回归方案后回复「确认」。

## §5 实施记录（实施者：主 agent ∥ coder）

实现 = cmd-advisor.mjs 改用 @thincoder/core/session.mjs 的 writeSessionFile，advisor 守卫持久化逻辑未变。CLI 50-3 直接导入真实 tui.mjs 模块图；独立代码评审首轮发现 command-interactive 动态加载造成假阳性，已修正并复核通过。

## §6 验证与收口（父代理）

验收 = CLI 50 集成档 3/3 通过；CLI 50-3 直接装载真实 tui.mjs，能覆盖原 SyntaxError。隔离配置的真实 TUI 进程不再出现旧导入错误，非 TTY 环境下按预期停在 TTY 提示。lint 与 RTM doc_check 通过。

评审 = 设计评审通过；代码评审首轮发现测试假阳性，修正后第二轮通过。范围外事项未纳入，本批无新债。
