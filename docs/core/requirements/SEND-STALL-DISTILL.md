# 轮末探索蒸馏的时序（SEND-STALL-DISTILL）· 需求

> 板块 = **轮末探索蒸馏的时序**——「何时等待 / 是否等待」。
> 本档 = 该时序面的**需求层权威**（FR1–FR4 / N1–N5 判定句）。
> **蒸馏本体需求不属本档**：机制本体（替换规则与静默语义）= `docs/core/requirements/CONTEXT-COMPACTION.md`（单一权威源，本档不复制）。
> 设计侧 = `docs/core/design/SEND-STALL-DISTILL.md`（三段时序 / 中止面 / 失败路径 / 双端坐标）。

## 1. 总体定位

一轮会话最后一段输出渲染完成后，UI 仍僵持数秒到十几秒才恢复输入（send 按钮不出现）。根因 = 轮末探索蒸馏在最终回复之后、
`onComplete`（前端恢复按钮的唯一信号）之前**同步阻塞**执行——一次静默的第二次 LLM 调用。

目标：`onComplete` **先于**蒸馏发出、蒸馏异步完成、按钮立即恢复——**同时**保持蒸馏语义不变、磁盘会话仍为压缩版、失败仍静默。

## 2. 功能性需求

| # | 需求 | 判定句（可机器验证） |
|---|---|---|
| **FR1** | 输入按钮立即恢复 | `onComplete` 在蒸馏**之前**发出、蒸馏不阻塞回合结束——发射点 VSC `thincoder-vscode/src/agent/run-stages.mjs:232`（`fireEndOfRunDistill`）由轮末调用且**不 await**（核侧同语义：`thincoder-core/agent.mjs:342-347`） |
| **FR2** | 蒸馏语义不变 | 蒸馏 promise 在**下一轮 push 用户输入之前**被 await——摘要必在下一轮 LLM 调用前就位（核 `thincoder-core/agent.mjs:99-101`；VSC `thincoder-vscode/src/extension/panel-chat.mjs:170-172`） |
| **FR3** | 磁盘仍为压缩版 | 蒸馏**实际替换历史后**触发保存回调（哨兵 = `onDistilled`）——VSC `thincoder-vscode/src/extension/panel-callbacks.mjs:187-189`（含槽位守卫）；核侧 = 会话退出 flush（`thincoder-core/agent.mjs:84` 注释） |
| **FR4** | 失败路径不变 | 蒸馏失败静默、原始探索结果保留、不影响回合结果与历史——失败 = 返回 null ⇒ 不替换、不触发保存；发射侧 `.catch(() => null)` 防 unhandled rejection（核 `.catch(() => {})`——`thincoder-core/agent.mjs:346`） |

## 3. 非功能性需求

| # | 维度 | 标准（含度量） |
|---|---|---|
| **N1** | 竞态安全 | 蒸馏替换历史与下一轮 push 输入**互斥**——await 必须在 push 输入之前，否则新输入被压缩替换清掉 |
| **N2** | 数据一致性 | 会话文件最终为压缩版；快速连发下一条消息不丢输入、不丢摘要；切换会话不串写（槽位守卫） |
| **N3** | 可中止（与运行 signal 分离） | 蒸馏使用**面板生命周期专用**中止信号——**仅面板 dispose / 会话切换时 abort**；用户 Stop（中止运行 signal）不影响蒸馏。中止器每生命周期一个、**不随轮次重置**（VSC `panel-chat.mjs:161-162`）。**CLI 侧形态**：由下一轮开头 await 与**退出 flush（≤5s）兑底**；Stop 只中断回合本身 |
| **N4** | 双端一致 | 同一时序（结束信号 → 异步蒸馏 → 保存回调）与同一挂载点语义（会话 / 面板侧 `pending`）。语义同源、**实现形态各端自持** |
| **N5** | 可测试 | 竞态时序（连发消息）/ 保存回调触发 / 槽位守卫 / 失败静默均有测试 |

## 4. 范围边界（不做）

- 不改蒸馏本体（替换规则 / 静默语义 / 摘要提示词）——归 `CONTEXT-COMPACTION.md`。
- 不改回合末 `onComplete` 的既有载荷与前端消费面。
- 不为子轮（`depth > 0`）开蒸馏。
