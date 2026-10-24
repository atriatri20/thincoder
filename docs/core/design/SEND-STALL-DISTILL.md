# 轮末探索蒸馏的时序（SEND-STALL-DISTILL）· 上下文板块

> 板块 = **轮末探索蒸馏的时序**——「何时等待 / 是否等待」（蒸馏的**何时**面）。
> 本档 = 该时序面的**唯一权威**（会话级挂载点 / 三段时序 / 中止面 / 失败路径 / 双端坐标）。
> **蒸馏本体不属本档**：替换规则与静默语义 = `docs/core/design/CONTEXT-COMPACTION.md` §6.9（探索结果语义摘要——单一权威源，本档不复制）。
> 相邻权威 = `docs/core/design/AGENT-LOOP.md`（主循环轮末）· `docs/core/design/SESSION.md`（保存面）。
> 需求侧 = `docs/core/requirements/SEND-STALL-DISTILL.md`（FR1–FR4 / N1–N5）。

## 2. 现行机制（时序）

**总纲**：`onComplete` **先行** → 蒸馏异步在途（挂 `pending`）→ **下一轮开头 await** → 落位后 **`onDistilled` 保存回调**。

### 2.1 轮末：`onComplete` 先行 + 发射蒸馏（FR1）

仅顶层（`depth === 0`）触发：先发 `onComplete` 释放前端，再把蒸馏 promise 化挂起、**不 await**，立即返回回合内容。

- 发射函数 = `fireEndOfRunDistill`（VSC `thincoder-vscode/src/agent/run-stages.mjs:261`；核侧同语义调用点 = `thincoder-core/agent/turn-loop.mjs:177-179`）。
- **depth 守卫**：子轮（`depth > 0`）不得创建蒸馏——否则先创建者晚 resolve 会 clobber 历史（竞态）。
- 落位时 **原地改保持 history 引用**（同一数组），并失效 token 基线（机器行形状变了）；随后调 `onDistilled`。
- 蒸馏本体 = `summarizeRunExplorations`（VSC `thincoder-vscode/src/explore-distill.mjs:29`；核 `thincoder-core/explore-distill.mjs:141`）——
  两档为**同名同源模块**（各端自持、语义同源）；现体消费 = `thincoder-vscode/src/agent/run-stages.mjs` 直引 VSC 蒸馏本体；核侧 re-export 见 `thincoder-core/context.mjs:392`。

### 2.2 下一轮开头 await（FR2 / N1）

`runAgent` 开头、**push 本轮输入之前** await 上一轮蒸馏——压缩后的机器行是本轮起点，先落定再 push，否则新输入被压缩替换清掉。

- 核侧：`thincoder-core/agent/run-start.mjs:21-25`（`_pendingDistill` 取出 → 置 null → await；字段声明 `thincoder-core/agent.mjs:79` 注释直引本机制）。
- VSC 侧：`runAgent` 内同款 await，**另**在 `runPanelChat` 级有一处同因 await（`thincoder-vscode/src/extension/panel-chat.mjs:170-172`）——
  面板每轮从磁盘**重建** history 数组，若只在 `runAgent` 内 await，缩掉的会是上一轮那根**已脱离**的数组、本轮仍从陈旧未压缩行开始。
  两层互不冲突。
- resume 场景（`ContinueError` 后 continue）：重建运行参数时 pending 已清——幂等。

### 2.3 保存回调（FR3）

蒸馏实际替换历史后触发 `onDistilled` → 再保存一次（`onComplete` 保存的是未压缩版）。

- VSC：`thincoder-vscode/src/extension/panel-callbacks.mjs:242-245`（`onDistilled`：槽位守卫 `panel._slot !== distillSlot` 即返回；随后 `panel._saveLines(..., distillSlot)`；失败静默）。
- CLI：`thincoder-cli/src/tui/tool-events.mjs:402`（`buildToolCallbacks` 提供 `onDistilled` → 复用现有保存逻辑 `saveSessionImpl`，try/catch 静默；
  callbacks 由 `src/tui/agent-turn.mjs` 传入 `runAgent`）。**仅在实际替换成功时**触发（失败 / no-op 不调——历史保持原样）。
- **槽位快照**：`distillSlot` = 回合开头、任何 await **之前**捕获的面板槽位（经 `ensureSlot` 而非裸读——裸读会把 null 冻进快照、使槽守卫恒拒绝）。
- **工程字段复用**：`onComplete` 时捕获的 agent state 随闭包携带，供异步的 `onDistilled` 保存复用（VSC `panel-callbacks.mjs:115-116`）。

### 2.4 中止面（N3——与运行 signal 分离）

- VSC 挂载点 = `panel._distillState ??= { pending: null }`（`thincoder-vscode/src/extension/panel-chat.mjs:157`，跨回合存活）；
  中止器 = `panel._distillController`（`:161-162`，**每面板生命周期一个、不复用 / 不随轮次重置**——快速连发下不得取消在途蒸馏）；
  传入运行参数见 `:403`。
- **abort 点**（运行 signal 之外的独立中止）：面板 dispose / 视图销毁 · 会话切换（新建 / 删除 / 加载）。
- 运行 signal 只用于 abort **运行中**的回合——**不再传导到蒸馏**：用户 Stop 不影响蒸馏。
- 核侧对照：`_pendingDistill` 的会话退出 flush（`thincoder-core/agent.mjs:79` 注释：awaited at next run start / **TUI exit flush**）。

### 2.6 CLI 退出前 flush 蒸馏（FR3 补强 · CLI 专有面）

进程退出（TUI 关闭 / Ctrl+C 二次确认退出）前，给在途蒸馏一个**有界等待窗口**再执行最终保存：
窗口值 = `ctx.distillFlushTimeoutMs ?? DISTILL_FLUSH_TIMEOUT_MS`（默认 **5s**——`thincoder-cli/src/tui/agent-turn.mjs:29`；
flush 点 = 每轮 `runAgentTurn` 的 finally——`:286-287`，render 已先行、退出场景自然覆盖）。

关键点：flush **不摘除** `_pendingDistill`（`:282` NOTE）——蒸馏窗口内新一轮提交 / 退出，下一轮 `runAgent` 开头的 await 仍能看到在途蒸馏并先 await（N1）；否则用户在蒸馏窗口内退出会丢摘要。

### 2.5 失败路径（FR4）

- 蒸馏失败 → 返回 null → 不替换、**不调** `onDistilled`（无变化无需保存）→ 下一轮 await 立即通过。行为与现状一致。
- 用户 Stop → 运行 signal aborted → 蒸馏继续完成、`onDistilled` 正常触发。
- 面板 dispose / 会话切换 → 蒸馏 signal aborted → promise reject 被吞掉 → 不替换、不保存。
- **双保险**：发射侧 `.catch(() => null)`（核侧同款 `.catch(() => {})` —— `thincoder-core/agent/turn-loop.mjs:177`），防 unhandled rejection。

## 3. 实现坐标汇总（双端）

| 面 | 核 / CLI | VSC |
|---|---|---|
| 轮末发射 | `thincoder-core/agent/turn-loop.mjs:170-180`（depth 守卫 + `summarizeRunExplorations(...).catch(() => {})` + `_pendingDistill = distill`） | `thincoder-vscode/src/agent/run-stages.mjs:261`（`fireEndOfRunDistill`）· `:267`（`onDistilled` 调用） |
| 跨轮挂载点 | `thincoder-core/agent.mjs:79`（`_pendingDistill`——字段声明随档面收窄） | `thincoder-vscode/src/extension/panel-chat.mjs:150`（`_distillState`） |
| 下一轮 await | `thincoder-core/agent/run-start.mjs:21-25` | `thincoder-vscode/src/agent.mjs`（runAgent 内）· `panel-chat.mjs:170-172` |
| 蒸馏本体 | `thincoder-core/explore-distill.mjs:141` | `thincoder-vscode/src/explore-distill.mjs:29` |
| re-export | `thincoder-core/context.mjs:392` | 现体消费 = `thincoder-vscode/src/agent/run-stages.mjs` |
| 保存回调 | `thincoder-cli/src/tui/tool-events.mjs:402`（`onDistilled` → `saveSessionImpl` 静默保存；callbacks 由 `src/tui/agent-turn.mjs` 传入） | `thincoder-vscode/src/extension/panel-callbacks.mjs:242-245` |
| 退出 flush | `thincoder-cli/src/tui/agent-turn.mjs:33`（`DISTILL_FLUSH_TIMEOUT_MS = 5000`）· `:286-287`（finally 内有界等待）· `:282`（不摘除 `_pendingDistill`） | —（面板生命周期中止面替代——见 §2.4） |
| 中止器 | —（会话退出 flush） | `panel-chat.mjs:161-162` · `chat-panel.mjs`（dispose）· `panel-session.mjs`（会话切换） |

## 4. 关键决策记录

| # | 决策 | 理由 |
|---|---|---|
| D-SD1 | `onComplete` **先行**、蒸馏**异步**在途 | send 按钮恢复不得等一次额外 LLM 调用 |
| D-SD2 | 挂载点在**会话 / 面板侧**（跨回合存活），经运行参数传入 | 每轮重建 agent 对象 ⇒ 挂 agent 上必丢 |
| D-SD3 | 下一轮 **push 输入之前** await | 先 push 会被压缩替换清掉（N1 竞态） |
| D-SD4 | 蒸馏**原地替换** history（保引用） | 面板持有同一数组 ⇒ 后续保存天然拿到压缩版 |
| D-SD5 | 蒸馏完成后再保存一次（`onDistilled`） | 异步化后磁盘会留住未压缩版 |
| D-SD6 | 中止面 = **独立 signal**（panel 生命周期），运行 signal 不传导 | 用户 Stop 不该杀掉在途蒸馏 |
| D-SD7 | 中止器**不随轮次重置**、快速连发不取消在途蒸馏 | 连发下第二条消息会误杀第一条的蒸馏（竞态） |
| D-SD8 | `depth === 0` 守卫 | 子轮创建蒸馏会 clobber 历史 |
| D-SD9 | 槽位快照用 `ensureSlot` 而非裸读 | 首个回合可先于状态解析——裸读会把 null 冻进快照、槽守卫恒拒绝 |
| D-SD10 | 失败静默（返回 null，不替换不保存） | 蒸馏是体验优化面——失败不得影响回合结果与历史 |

