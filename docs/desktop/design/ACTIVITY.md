# Desktop 活动池与消化 · 设计

> 需求 = `docs/desktop/requirements/ACTIVITY.md`。
> 最近先例：`docs/render-core/design/RENDER-CORE.md` 的 subblocks/scroll 与 core suspension。对齐 = 核状态机、宿主薄胶水。
> 勘察证据：已读活动块、startSuspension、digest/subagent 记录和池宽。相关 = 当前活动域。

## 1. 活动块

ev:subagent/subchunk 按键和 role/id 归约。renderSubBlock/refreshBlock/renderSubagentChunk 负责显示，状态含 started/queued/approval/done/settled/cancelled 等当前闭集。

终态折叠并 archiveBlock 入流，表项保留墓碑处理迟到事件。停止经 subagent:stop 定向取消。

核 scroll 原语在追加、挂载和帧尾调用；手势才解钉，近底复跟，停跟显示回底钮。池体本身可滚动。

## 2. 挂起与消化

`suspension-drive` 调 `startSuspension`，`hooks` 只装三枚：`onCounts`（计数 ⇒ `ev:susp` + 自愈扫拍）∥ `reclaim`（回收 ⇒ 兜底幂等补发 + 自愈扫拍）∥ `freezeAll`（冻结 ⇒ 残项逐条补发）。`inputQueue` ∥ `abortSignal` ∥ `runTurn` ∥ `takeInput` ∥ `injectResidual` ∥ `timerFace` 是 `startSuspension` 的同级选项，不在 `hooks` 里。

核件 `hooks.onDigest` 是**备用面**（非 Abort 失败径不出 `end` ⇒ 不可作主取点），本档不注册该钩 —— **零双帧**；边界帧与留档的单点住 §2.1 窗内回合档的 `driveTurn`。

起跑时对本轮驻留补发 `done`（归属 = §2.1 窗内回合档的起跑支）；`reclaim` 幂等兜底（归属 = 建窗档登记的核件钩子）。

digest start/cap/end 追加独立行，n=0 不产计数/终态行；end 不改写起跑行，unsettled 可追加残余行。

### 2.1 挂起驱动的内部分工

`createSuspensionDrive` 只做装配：持有五件状态、把注入缝分给四块语义档、交出对外面。语义住在四档里，档与档之间不互持状态。

| 档 | 工厂 | 管什么 | 交出 | 不管什么 |
|---|---|---|---|---|
| `thincoder-desktop/src/main/suspension-resident.mjs` | `createResidentFace({ post })` | 驻留条目的读面与四个出口：起跑快照 `pendingSnapshot`、补发 `done` `reemitDone`（含 consult 子块展开）、自愈扫读 `sweepDigestedStuck`、退出残余注入 `injectResidual` | 四个出口 + 读面 `resident(agent)`（驻留条目枚举——扫读判据、`freezeAll` 取快照、`abort` 落冻结快照三处共用这一处） | 不判何时补发：时机三落点 = 窗内回合档的起跑支（`reemitDone(key, pendingSnapshot(agent))`）· 建窗档登记的两枚核件钩子（`reclaim` ∥ `freezeAll`）· 驻留档自愈扫读 `sweepDigestedStuck`。不碰窗表与输入队列 |
| `thincoder-desktop/src/main/suspension-window-turn.mjs` | `createWindowTurn({ post, notify, runTurn, reloadSlot, hold, queue, resident, windows })` | 窗内输入与回合：取件窗缝 `windowTake`（受理 + 核件唤醒）、取项缝 `takeQueuedInput`、单回合 `driveTurn`、步边界取批 `stepBoundaryPickup`、提示面 `turnDone` | `windowTake` ∥ `takeQueuedInput` ∥ `driveTurn` ∥ `stepBoundaryPickup` ∥ `turnDone` | 不建窗、不结算出窗；不持闩面与中止代次；窗表只读——`windowTake` ∥ `stepBoundaryPickup` 各一处 `windows.get(key)`，写窗表仍只有 §2.2 的两点 |
| `thincoder-desktop/src/main/suspension-window-open.mjs` | `createWindowOpen({ post, windows, timers, resident, turn, onExit })` | 建窗入口 `start`：同键判重、池判真、装核件手柄与 hooks、挂会话控制器、登记出窗结算 | `start`；计数帧 `postSusp`（`ev:susp {active:true}`）的唯一定义点，经 `onCounts` 钩子发出 | 不做出窗结算本身（`onExit` 交 close 档）；不续发残值；不碰窗队投影 |
| `thincoder-desktop/src/main/suspension-window-close.mjs` | `createWindowClose({ post, windows, timers, queue, resident, runTurn, turnDone, hold, latches, onRestart })` | 出窗收束面：`closeWindow` 摘窗与出窗帧、残值续发 `resumeResidual`、会话中止 `abort`、切项目全停 `abortAll` | `closeWindow` ∥ `resumeResidual` ∥ `abort` ∥ `abortAll`；出窗帧 `postSuspEnd`（`ev:susp {active:false}`）的唯一定义点，经 `closeWindow` 发出；两族闩件的唯一写点（`resuming.add` ∥ `resuming.delete` ∥ `abortTombstones.add` ∥ `abortTombstones.has` ∥ `abortTombstones.delete`，经 `latches` 缝拿到，定义见 §2.2） | 不建窗（重启经 `onRestart` 回建窗档）；不改核件注入器 |

建窗档签名里还收一个 `queue`（装配档照传）—— 体内零读点：`queue.clear` 住出窗档，本档不碰窗队投影。它不是建窗档的语义缝，故不进上表。

`turnDone` 只有一个定义，在回合档（体内 `notify?.turnDone?.({ key, agent }) ?? false`），所以 `notify` 是回合档的注入缝。它有两个调用点，都在回合语义里：窗内用户回合完成（`driveTurn` 的 `!autoTurn` 支）与残值续发回合完成（`resumeResidual` 逐批成功径）。后者住出窗档，因此出窗档收的是**回合档交出的那个 `turnDone`**（装配档原样注入），不是自己重建一份——重建就是第二个定义。

为什么这样切：`docs/core/standards/CODE-TIER.md` §3 要求越档函数拆成「可复述的骨干与细节」，并规定按概念和可独立验证性切分、不为满足数字而切碎连续逻辑（档位数值与判法归该档，本设计不复制一份）。四块的分界取的是「谁能单独说出它做什么、在哪几处被调用、不做什么」，不是把总行数四等分。

### 2.2 状态归属与零第二写者

- 五件状态（窗表 `windows` ∥ 续发期键集 `resuming` ∥ 中止墓碑 `abortTombstones` ∥ 窗队件 `queue` ∥ 闩面件 `timers`）全由装配档持有，按引用原样注入；单元内不建第二份。
- `latches` = 上述两族闩件打成一包 `{ resuming, abortTombstones }`，只注入出窗档：`abort` 读 `resuming.has` ∥ 写 `abortTombstones.add`，`resumeResidual` 读 `abortTombstones.has` ∥ `delete` 并在收尾 `resuming.delete`。两件仍归装配档持有，出窗档拿到的是同一对象，不是副本。
- 窗表写点只有两处：`start` 置入、`closeWindow` 摘除。单元之间零互持——建窗档要出窗只经 `onExit`，出窗档要重启只经 `onRestart`。
- `onExit(entry, failure)`：`entry` 由建窗档的 `start` 传——它就是窗表里那个载体对象，`controller` 在 `entry.controller`（出窗判中止、与 `_sessionAbort` 比对都只读这一处）；`failure` = `null`（兑现）∥ 错误对象（拒绝）；调用点 = `handle.done` 的兑现 ∥ 拒绝两个回调。
- `onRestart(key, agent, { cwd })`：与 `start` 形参逐字同形；出窗档按载体的 `entry.key` ∥ `entry.agent` ∥ `entry.cwd` 传。装配档注入的不是 `start` 本身，而是一条读后绑绑定的转发件 `(key, agent, opts) => late.restart(key, agent, opts)`，实参逐字透传、不改形；`onExit` 同形 `(entry, failure) => late.exit(entry, failure)`。转发件是后绑的机械产物：两个方向都要等四档建齐才绑，直传会读到未绑状态。
- 载体对象归窗表（装配档持有），各档只按实参拿到它，不各建第二份。三个名字各指什么：
  - `entry` = 窗表里的那条载体 `{ key, agent, cwd, controller, frozen, handle, pending }`，由建窗档的 `start` 建成并 `windows.set` 置入；读它的是四个语义档与装配档的四条对外面（`pushInput` ∥ `active` ∥ `inputSnapshot` ∥ `size`）。
  - `controller` = `start` 建的 `new AbortController()`，落 `entry.controller`，同时挂 `agent._sessionAbort` ∥ `agent._sessionSignal`；读它的两处：出窗档 `closeWindow`（`controller.signal.aborted` 判会话中止）与回合档 `driveTurn`（作 `sessionSignal` 传 `runTurn`）。
  - `handle` = 核件 `startSuspension(…)` 的返回值，`start` 在它返回后赋给 `entry.handle`；读它的是 `pushInput` ∥ `windowTake` 的 `entry.handle.wake()`，以及 `start` 内登记的 `handle.done` 两个回调。
- `entry.pending` 仍是单一数组：受理、取项、消费、倾出、清队五处同数组，零第二写者。
- 缝分两类。**必填** = 单元真要用的能力：缺项在构造期抛错并点名该参数。这一形不是新裁 —— `suspension-drive.mjs` 入口早已如此：`[suspension-drive] post required (out-bound channel)` ∥ `[suspension-drive] runTurn required (single-turn face)`。四个语义档沿用同一形：
  - 驻留档必填：`post`。
  - 回合档必填：`post` ∥ `runTurn` ∥ `queue` ∥ `resident` ∥ `windows`；可选：`notify` ∥ `reloadSlot` ∥ `hold`。
  - 建窗档必填：`post` ∥ `onExit` ∥ `windows` ∥ `timers` ∥ `resident` ∥ `turn`（签名另收一个零读点的 `queue`，见 §2.1 表下）。
  - 出窗档必填：`post` ∥ `runTurn` ∥ `turnDone` ∥ `onRestart` ∥ `windows` ∥ `timers` ∥ `queue` ∥ `resident` ∥ `latches`；可选：`hold`。
- **可选** = 缺省即零动作的策略面，带 `null` 缺省：`notify`（无提示面）∥ `reloadSlot`（不重装槽）∥ `hold`（不占位）。装配档对外面的既有缺省维持原样 —— `post` ∥ `runTurn` 必填，其余十一项带缺省（`busyOf` 缺省恒假、`timer` ∥ `clear` ∥ `now` 缺省取宿主时钟），因为那是对外面的一部分，不是新档的缝。

### 2.3 边界

- 不改行为、不改帧面（`ev:susp` ∥ `ev:digest` ∥ `ev:subagent`）与文案。
- 不改 `thincoder-desktop/src/main/suspension-timers.mjs` ∥ `thincoder-desktop/src/main/window-queue.mjs` ∥ `thincoder-desktop/src/main/suspension-guard.mjs` 的行为，只消费它们既有的面。真需要动 ⇒ 停下上抛。
- 对外面不变：`createSuspensionDrive` 的返回键集逐字不动 —— `start` ∥ `turnDone` ∥ `stepBoundaryPickup` ∥ `pushInput` ∥ `active` ∥ `inputSnapshot` ∥ `abort` ∥ `abortAll` ∥ `armInbox` ∥ `size` ∥ `timerLatches`（11 键）。
- 形参键集同判，逐名不变（13 键）：`post` ∥ `runTurn` ∥ `reloadSlot` ∥ `notify` ∥ `busyOf` ∥ `takeOver` ∥ `postQueue` ∥ `prepare` ∥ `degrade` ∥ `hold` ∥ `timer` ∥ `clear` ∥ `now`。其中 `post` ∥ `runTurn` 必填，其余十一项带缺省。增删或改名任一键即不成立。

## 3. 布局与通知

pool-width 拖柄即时写 --pool-w，松手读回并持久化，CSS clamp 控制上下限。

notify 仅在窗口失焦且用户回合完成时发系统通知，点击聚焦窗口。

## 4. 验证

验证块身份、取消、跟滚、起跑补发、digest 自然追加、记录重建、池宽与通知门。

结构面也照这条查：驱动内部分档只搬位置、不搬语义——`createSuspensionDrive` 的形参键集与返回键集逐字不变（键名见 §2.3），每档头注与 §2.1 的表一一对上；增删一个键即不成立。
