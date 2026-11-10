# 2026-11-10 · inbox-latch-carrier
> 六段，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 每段只有一个作者：作者的段可 `append` 加内容、可就地改（`edit`）；非作者一概拒。
> 编制：主 agent · 2026-11-10 · 来源 = 用户 2026-11-10 01:18「VSC 端为什么收到消息不会立刻响应」+ 01:21「开」。
> 台账 = #2263（core · 归批）。前情 = 无（独立批）。
## §1 讨论（主 agent）
**状态行**：已收口 2026-11-10
<§1 模板占位：本批条目 / 关键判据 / 授权口径>

## 讨论与路由（主 agent）

### 来源与授权

- **用户报障（原话）**：「**VSC 端为什么收到消息不会立刻响应，我问他的时候，他还说没收到，然后会话一结束就收到了。**」
- **用户纠正父侧误判（原话）**：「**但实际情况是当时没有会话在活动，VSC 端是在空闲的状态，但是并没有在收到消息的时候拉起。**」——父侧先前判「轮次在跑才跳过」，**该前提作废**。
- **开批授权（原话）**：「**开**」·「**自动跑完**」（2026-11-10 01:21 / 01:22）——本批全程自动推进。

### 库内 = 已查

- 核 `instance-inbox-watch.mjs` 取件段：`const agent = getAgent?.()` 后 `if (agent == null) return false`。
- VSC `timer-watch.mjs`：`getAgent: () => panel?._agent`；`panel._agent` 两个赋值点全在 `panel-turn-loop.mjs` 的回合装配路径，`chat-panel.mjs` 五处置空。
- 桌面 `timer-watch.mjs`：`sync` 里 `if (!agent) { disarm(key); return null }`。
- CLI `index.mjs`：`createInboxWatch({ agent, … })` 的 agent 取自 `startTUI(agent, opts)` 入参。
- `agent-tools/` 全目录 grep `inbox` **零命中** ⇒ **agent 没有任何工具能看见待取消息**，它答「没收到」是真话。

### 库外 = B 类

`库外 = B 类：改动面 = 核 instance-inbox-watch.mjs + 三端 timer-watch 接线 + 核设计档；外部断言 = 零`（不新增依赖、不调外部 API、不对第三方行为下结论）。

### 已定决定（父侧裁定，逐条记档）

- **已定决定**：判据改为「端壳 `ready()` 探针」，核闩不再读 `agent` 对象 · 依据：VSC 的 `onTake: (_agent, messages)` 已把它丢成下划线，核却拿它当门，这道闸对 VSC 是白设 · 时间：2026-11-10 01:26
- **已定决定**：不就绪时**必须出声**，并入既有受阻行（两因共用一计数器、同一逐字串，`reason` 进日志），**不新增第三条可见行** · 时间：2026-11-10 01:26
- **已定决定**：CLI 冻结捕获**不进本批**——`getAgent` 与 `createTurnFace({ agent })` 同一闭包，CLI 无「只换 agent 不重建回合面」的路径 · 时间：2026-11-10 01:26

### 父侧一处判断被设计席收窄（记档）

父侧曾对设计席说「桌面端会**连闩都不建、连受阻拍都没有**」。

设计席实读后收窄：`registerInstance` 与 `armInbox` 在 `turn-driver.mjs` 里相邻 ⇒ **项目从未起过会话时连名册都不登记**，发送方拿到的是「无此会话」的当场报错，**不是静默**。

⇒ 桌面那个 `if (!agent)` 是**无场景分支**，本批按「规则一致性修复」记，**不记作用户可见故障**。**父侧接受该更正。**

### 本批不做什么（边界）

- 不改「一轮一取」口径（跨实例消息不进 `state.pendingInput`、不挂 `consumeQueuedInput`）。
- 不给 agent 加「查 inbox」的工具——那解决「说没收到」，不解决「不拉起」，另议。
- 不做轮内注入——与「打不断当前轮」相反，须另裁。
- 不新建 VSC / CLI 的端侧 timer 设计档——盘上无此档，取件面的单源就是核档端取件表两行。

## §2 批次任务与设计（eng-designer）
**状态行**：设计完成（收正轮五处已落盘、⑥按父侧指令跳过；第 2 轮评审已 pass，待父侧收口）
<§2 模板占位：本批条目（覆盖） / 设计档落点 / 机制设计 / 受影响文件与测试覆盖 / 验收对照 / 关键决策 / 上抛项>

### 2.1 本批条目（覆盖）

台账 `#2263` 一条：**取件闩的「载体就绪」判据在三端语义不一**。用户报的现象（原话）：「VSC 端为什么收到消息不会立刻响应，我问他的时候，他还说没收到，然后会话一结束就收到了。」补正：「当时没有会话在活动，VSC 端是在空闲的状态，但是并没有在收到消息的时候拉起。」

复核后的三端现状（本席自读源码，逐字见 2.4）：

- **VSC**：核闩 `thincoder-core/instance-inbox-watch.mjs` 的 `if (agent == null) return false`（注释逐字：「载体未就绪（端壳懒装配）⇒ 下一拍再看（闩已在位）」）拿 `panel._agent` 当门。`_agent` 只在回合装配路径上被赋值，而 VSC 的 `onTake` 把核闩递来的 agent 一下划线就丢——开轮靠 `runPanelChat` 自造 ⇒ **面板开着、一轮没跑过，闩就每秒空转，不取件、不报错、不出任何行**。用户「问了他说没收到、会话一结束就收到」正是这条。
- **桌面**：`thincoder-desktop/src/main/timer-watch.mjs` 的 `sync(key, agent)` 写 `if (!agent) { disarm(key); return null }` ⇒ 空载体当撤闩理由，撤了就没有拍，**连受阻行都没有来源**（且与 D-MI31「撤闩 = 靠别人再把你叫醒」同族反面）。
- **CLI**：`agent` 是 `startTUI` 入参、开轮面 `turn` 与闩取同一闭包 ⇒ 不进这个状态。**冻结捕获不进本批**（判定见 2.6 K4）。

### 2.2 设计档落点（单源）

- **单源 = `docs/core/design/MULTI-INSTANCE-COLLAB.md`**：§5.4「就绪判据（D-MI34）」「判据同源」「`ready` 必填」「门开不了要出声（D-MI33 ∥ D-MI35）」；§5.6 失败可见行；§5.8 核三档块 · 端取件表 VSC / Desktop 两行 · 已接判据 ⑤ 改指、⑦ 新增；§5.9 新增边界条；§8 决策表 D-MI34 ∥ D-MI35；§5.10 delta 增 ⑦。**本批不新建档、不另立第二套机制描述。**
- **`docs/desktop/design/SHELL.md` 与 `docs/desktop/design/IPC.md` 零改**：行组与出站通道不变（可见行仍两种、`kind` 仍两值），本批只动判据与日志字段 ⇒ 两档现有文本仍然为真，不产生第二说。
- **`docs/vsc/design/WEBVIEW-PROTOCOL.md` 零改**：`inbox` 消息载荷 `{ text }` 不变、条数仍三十六。
- **声明文件表里那两条端档路径实读不存在**（下列两段，VSC / CLI 的设计目录里均无此档）：

```text
docs/vsc/design/TIMER.md
docs/cli/design/TIMER.md
```

  两端的取件面本来就没有端档承载，单源即核档端取件表两行 ⇒ 本批不新建这两档（新建 = 凭本批某一轮的需要造层，而它现在没有需要承载的内容）。

### 2.3 机制设计

1. **就绪判据归端壳（D-MI34）**：核闩不再读 `agent` 对象。`createInboxWatch({ ready, isBusy, onTake, onBlocked, timer, clear })`——`ready()` 回答「这一端此刻能不能开一轮」，`onTake(messages)` 只收消息，载体由端壳自持。「有没有 agent 对象」是 VSC 一家实现形态，被当成三端规则就是本批的病根。
2. **判据同源**：端壳开轮面有早退条件（VSC = `hasWorkspaceFolder()`，正是 `runPanelChat` 无工作区守卫取的那个判定），`ready()` 必须与它**同一谓词**——两处各写一份等价判断，就一定有分叉的那天。**且探针零副作用**：`ready()` 每秒跑一次，不许调会弹提示的 `blockOnNoWorkspace`（它每拍弹一次框并置去重标志），只取它的判定侧。
3. **`ready` 必填、无缺省**：缺了就是「端壳没答这个判据」，核闩不许替它猜（猜真 = 空转取件，猜假 = 永不取件，两个都不报错）。装配即抛，点名缺的参数。
4. **空载体不是撤闩理由**：桌面那条 `if (!agent) disarm` 删除；撤闩清单不变（仍三撤点）。载体缺席 = 这一拍打不开门，不是「这个会话不该有人来取」。**VSC 转空工作区同族**（修正轮取乙，见 2.8 K6）：那一支只销毁载体、不撤取件闩，撤闩点收为 `dispose` / view 销毁两处。
5. **不就绪要出声（D-MI35）**：取不上件两因（在飞 ∥ 不就绪）共用一个计数器与**同一条**受阻行（`inboxBlockedLine` 逐字不变），诊断进 `ev:inbox-watch-blocked` 的 `reason`（`"busy"` ∥ `"carrier"`）。`ms` = 连续取不上件的总时长，理由中途换了不重算。
6. **`onTake` 缺省 = 不就绪**：没人能开轮 ⇒ 取了就是静默丢 ⇒ 与 `ready()` 返假同义，核里那个 `if (typeof onTake !== "function") return false` 并入同一支，不再各自静默。
7. **不造第二套排队**：跨实例消息仍**不进** `state.pendingInput`、不挂 `consumeQueuedInput`——本批零改这条（设计 §5.4 原条不动）。

### 2.4 受影响文件与测试覆盖（tier 结论：无一档跨层，无拆分方案）

| # | 档 | 改什么 |
|---|---|---|
| 1 | `thincoder-core/instance-inbox-watch.mjs` | 签名换 `ready` / `onTake(messages)`；删 `getAgent` 早退支；不就绪并入受阻计数；`ev:inbox-watch-blocked` 加 `reason`；头注按新契约重写（`getAgent` 的说明整个删除） |
| 2 | `thincoder-cli/src/tui/timer-watch.mjs` | 转口改 `ready: () => true`（理据 = 核档 §5.9 新条）；`onTake` 去首参 |
| 3 | `thincoder-cli/src/tui/index.mjs` | `onTake(_agent, messages)` → `onTake(messages)` |
| 4 | `thincoder-vscode/src/extension/timer-watch.mjs` | `ready` = 面板在场 ∧ 工作区在场（与 `runPanelChat` 无工作区早退支同一谓词）∧ 未销毁；`onTake` 去首参；头注 |
| 5 | `thincoder-desktop/src/main/timer-watch.mjs` | `sync(key, agent)` 删空载体 `disarm` 支；`ready` = 该键闩槽有载体；`onTake(key, messages)` 从槽里取 agent 交给 `runTurn` |
| 6 | `thincoder-desktop/src/main/suspension-timers.mjs` | `onTake` 形参去 agent（从槽取）；头注 |
| 7 | `test/integration/fixtures/cross-instance-harness.mjs` | 跟进新签名 + 假端 `ready` 注入位 |
| 8 | `test/integration/cross-instance-message.test.mjs` | CLI 46-1 增第 ⑦ 步（见 2.5） |
| 9 | `docs/batches/2026-11-10-inbox-latch-carrier.test.mjs` | 单元档（与本批档同名，收口删） |
| 10 | `thincoder-vscode/src/extension/chat-panel.mjs`（修正轮新增） | 转空支删 `disarmInboxWatch(this)` 一行：载体仍置空、timer 闩照撤，取件闩留着 |
| 11 | `thincoder-vscode/src/extension/panel-session.mjs`（修正轮新增） | `loadSession` 头注一句更正（只改注释、零行为）：设计把切槽定为重臂，不是撤闩点 |

`test/RTM.md` 与 `test/rtm/tooling.md` **不新增行**（delta 见核档 §5.10：破 0 · 冗余 0 · 改 1 行 = CLI 46-1）。

### 2.5 验收对照（逐条指回需求）

| # | 判据（可红） | 指向 |
|---|---|---|
| AC-1 | 假 VSC 端（面板在场 ∧ 工作区在场，`_agent` 为 `null`）⇒ 一拍内取件恰一次、起轮恰一次；现码下同一场景零动作（这条写出来就是红的） | 设计 §5.4「就绪判据（D-MI34）」+ §5.8 端表 VSC 行 |
| AC-2 | 假端 `ready: () => false` + inbox 非空 + `nowFn` 推过 `INBOX_BLOCKED_MS` ⇒ `onBlocked` 恰一次、`ev:inbox-watch-blocked` 恰一条且 `reason === "carrier"`、可见行逐字等于 `inboxBlockedLine(ms, pending)`；`ready` 转真 ⇒ 计数归零、下一拍取件恰一次 | 设计 §5.4「门开不了要出声」+ §5.8 已接判据 ⑦ |
| AC-3 | `sync(key, 空载体)` 之后闩仍在位（`size()` 不减）、拍照跑；待取非空跨阈 ⇒ 出一条受阻行 | 设计 §5.8 端表 Desktop 行「空载体不是撤闩理由」 |
| AC-4 | `createInboxWatch` 不传 `ready` ⇒ 装配即抛，报文点名 `ready` | 设计 §5.4「`ready` 必填参数，无缺省」 |
| AC-5 | 三端 `onTake` 首参不再收 agent；CLI 46-1 的第 ⑦ 步与盘上 ①–⑥ 同跑全绿 | 设计 §5.4 交接契约 + §5.10 delta |
| AC-6 | `inboxBlockedLine` 的逐字串一字未变（跨端对拍仍按旧锚） | 设计 §5.4 两条可见行逐字锚 |

失败侧都是现码：AC-1 现码零取件、AC-2 现码零行零事件、AC-3 现码闩被撤、AC-4 现码无该参数（装配成功但永不就绪）。**没有一个判据靠真机才有意义**——真机（VS Code / Electron）只用于收口轮的人工复看，不是判据。

### 2.6 关键决策

- **K1 `ready` 探针取代 `getAgent` 对象判据**（= 设计 D-MI34）。理由：三端对 agent 的用法各不相同，核闩却拿它当门——一个端的需求当了三个端的规则；VSC 更是把那个对象直接丢掉，门判的对象没人用。**候选**：给核闩加一个 `isReady` 而保留 `getAgent` 作载荷——否决：同一个问题两个源，两处判据必然分叉一次，而分叉时没有任何东西会报。
- **K2 不就绪共用受阻行、诊断入日志**（= 设计 D-MI35）。**候选**：新增第三条可见行（`inboxNotReadyLine`）——否决：多一种行 = 多一组端侧槽位（桌面 `kind` 第三值 · 渲染面行组清点 · VSC 协议第 37 项 · IPC 表）与一组跨端逐字对拍面，换来的信息只在排障时用；而人读线要说的那句「有人在等你、取不上」两种因完全一样。
- **K3 空载体不撤闩**（桌面）：与 D-MI31 同族——撤闩等于把「门能不能开」挂在「另一段代码跑到没跑到」上。**候选**：保留 `disarm` 并在撤闩处出一条行——否决：撤闩之后没有拍，行从哪来。
- **K4 CLI 冻结捕获不进本批**：`getAgent: () => agent` 与 `createTurnFace({ agent, … })` 是同一份闭包捕获；CLI 没有「只换 agent、不重建回合面」的路径，换会话 = 重建回合面，闩同点重建 ⇒ **无场景**。按「无场景的分支不进设计」记为不做（写进核档 §5.9，作当前事实而非待办）。
- **K5 不新建那两条声明过的端档**（见 2.2 末）：盘上无此档，两条端面事实（VSC 的 `ready` 谓词来源、CLI 恒就绪）都已住在核档 §5.8 / §5.9，没有独立内容要承载 ⇒ 为一次轮次需要造层是反的。

### 2.7 上抛项与范围外

- **[上抛·知会] §1 仍是模板占位**（`<§1 模板占位：本批条目 / 关键判据 / 授权口径>`，状态行「🔄 进行中（…）」）。本席的输入 = 台账 `#2263`（board core · 归批 · task_book 指本批）+ 本轮父侧来讯（现象原话与已查事实）。**§1 由主 agent 补**，本席未动（非本席写面）。
- **[上抛·知会] 声明文件表与盘不符**：见 2.2 末那两段路径。
- **范围外未记**：本轮只读本批改动面与核档 §5 / §8 / §5.9 一带；其他在册行（`#2258` ∥ `#2262` 等）与本批无一重合，未动、未记。

### 2.8 修正轮（§3 九条 · 逐条处置）

评审 verdict = changes-required（🔴2 · 🟡4 · 🔵3），九条全收。两条红线按父侧倾向取**乙**（见下 K6），甲否决。

| # | 处置 | 落点 |
|---|---|---|
| 1 | 取乙：转空工作区不撤取件闩。§5.4「例外一处」整句删除，改为「无例外 + 三条子项」；`ready` 三合取项里「工作区在场」不再对上任何撤点 | 设计 §5.4 · §5.8 VSC 行 · §5.9 |
| 2 | 撤闩点收为 `dispose` / view 销毁两处；落地轮次写死 = 本批（不再有「属 VSC 那一轮」第二句）；新增判据 ⑨ 盖住「转空再回来」这一路 | 设计 §5.8 VSC 行 + 判据 ⑨ |
| 3 | 46-1 行「怎么算通过」格补 ⑦，与 §5.10 bullet 的 ⑦ 同义 | 设计 §5.10 |
| 4 | 新增「已接」判据 ⑧：`timer-watch.mjs` 三断言扫描（`hasWorkspaceFolder` ≥1 命中 ∥ `blockOnNoWorkspace` / `notifyNoWorkspace` 零命中），换守卫形即红；并写明为何落扫描不落端级 spy | 设计 §5.8 ⑧ |
| 5 | §5.1 三问答补两条：`ready` = `existing but unusable`（`hasWorkspaceFolder` 可用 ∥ `blockOnNoWorkspace` 带副作用）；`"busy"` / `"carrier"` 住既有事件的新字段，不新增事件名 | 设计 §5.1 |
| 6 | 两因仍共用一条行；「人读线不表达处置差异」写进 D-MI35 决策行并给依据（该端守卫面已出动作提示） | 设计 §8 D-MI35 |
| 7 | §5.6 成本行补「每拍一次内存就绪判据」 | 设计 §5.6 |
| 8 | §5.1 补本批两决策的最近先例（对齐 ∥ 偏离：`busyOf` / `inWindow` 带缺省、`ready` 无缺省）与调研面（`PROJECT-SWITCHER.md` §4.1 · `IPC.md` §2「取件行注」） | 设计 §5.1 |
| 9 | ⑦ 失败侧改锚**行为三条**（零 `onBlocked` ∥ 零 `ev:inbox-watch-blocked` ∥ 零取件），用现码自己的口子 `getAgent: () => null` 驱动；不再拿 API 形状当红线 | 设计 §5.8 ⑦ |

**修正轮新增验收（2.5 续）**：

| # | 判据（可红） | 指向 |
|---|---|---|
| AC-7 | `thincoder-vscode/src/extension/timer-watch.mjs` 扫描：`hasWorkspaceFolder` ≥1 命中 ∧ `blockOnNoWorkspace` / `notifyNoWorkspace` 零命中；把谓词换成守卫形即红 | 设计 §5.8 ⑧ + §5.4「判据不取守卫形」 |
| AC-8 | 同一面板 `ready` 真→假→真、中间一次不调 `syncInboxWatch`：转假期零取件且跨阈出恰好一条受阻行；转真后下一拍取件恰一次、起轮恰一次。现码转空支撤闩 ⇒ 转真那一拍零取件（写出来就是红的） | 设计 §5.8 ⑨ + VSC 行「转空不撤取件闩」 |

**关键决策（2.6 续）**：

- **K6 转空工作区不撤取件闩**（修正轮裁定，取乙）。**甲** = 保留转空撤闩、点名「自始无工作区」为唯一 carrier 场景：甲下「工作区先移除再回来」这一路没有任何重臂面（面板创建一次性 ∥ 切槽 ∥ 回合尾，三处都不触发），而拍内探测器结构上看不见「没有拍」——正是 D-MI31 的失败类换到工作区维度。**乙** = 删转空撤闩、门交给 `ready()`：不需要任何新重臂路径，且与 D-MI34「空载体不撤闩」同一条规则。

**上抛**：

- [上抛·知会] §1 仍是模板占位（`<§1 模板占位：…>`）：§1 非本席写面，本席未动。
- [上抛·知会] 桌面不进 carrier 那一支：置空载体的闩槽在生产路上不存在（闩槽只在拿到载体后建——设计 §5.9 桌面那条）⇒ 判据 ⑦ 与 AC-8 的载体场景由 VSC 一侧承担，桌面只作规则一致性。
- [上抛·知会] `thincoder-vscode/src/extension/panel-session.mjs` 的 `loadSession` 头注逐字称「§5.8 把 `loadSession` 当撤闩点是把 timer 闩的语义抄了过来（两档不一致，已报设计席）」——本轮实读：设计把切槽定为**重臂**、不在撤闩列，该句反向不成立（过时注释）。已列 2.4 第 11 行，实现轮只改注释、零行为。

### 2.9 收正轮（实施落地后的文档漂移 · 五处落、一处跳过）

父侧来讯逐条处置；**改动面只有设计档一档**——代码 ∥ RTM ∥ 端档零改，未派实施、未发评审。

| # | 处置 | 落点（设计档） |
|---|---|---|
| ① | 桌面就绪判据收成一处说法：删掉「删支后 `ready` 在桌面恒真」，改为「就绪判据 = 该键闩槽有载体」（与实现同句 `ready: () => slot.agent != null`）+ 生产路里「有闩槽而无载体」不存在 ⇒ 实际运行中恒就绪，但判据本身按槽判、空载体如实返假 | §5.9 桌面那条 |
| ② | §5.6 成本格重写：一拍三件事点明 = ① inbox 目录 stat（**唯一的 IO**）② `ready()` 判据（内存读）③ 闩重臂（内存、`unref`）；删掉与同格前半矛盾的「三项皆内存读、零 IO」 | §5.6 成本行 |
| ③ | 删掉「§1 已定」（本档 §1 只有定位与边界四条，无此定论）；理由就地写明 = 闩槽只在拿到载体后建，坐标 `thincoder-desktop/src/main/turn-driver.mjs` 的 `ensureSession`（`if (agent) { … suspension?.armInbox(key, agent) }`） | §5.9 桌面那条（D-MI35 决策行仍引 §5.9，落点仍成立） |
| ④ | 「无例外：撤闩点只有「退出 / 面板销毁」」收成概括句 = 「该端会话 / 面板不在的那几处」，并点明逐端数目（CLI 一 · VSC 两 · 桌面三）；§5.8 桌面行里引作 D-MI31 原话的半句改为引「自续闩形态」 | §5.4 自续闩条 + §5.8 桌面行 |
| ⑤ | 取乙（降强度）：守则名「探针零副作用」→「判据不取守卫形」，并写明射程 = ⑧ 证的是「取件接线里没走守卫形」，探针体里另写提示 ∥ 埋点不在其射程内（本批不另立判据）；⑧ 条名同步改名，「为何落扫描」末句由「扫掉两枚符号即扫掉副作用」改为「即证没走守卫形 + 射程到此为止」 | §5.4 判据条 + §5.8 ⑧ 条名 ∥ 理由条 |
| ⑥ | **跳过（父侧指令）**：`docs/desktop/design/IPC.md` 不属本席写面，未动 | — |

**判据（文档面 · 可红）**：读者只读 §5.9 桌面那条、§5.6 成本行、§5.4 自续闩条 ∥ 判据条、§5.8 ⑧ 的两条，逐处回答「这一句说的是现在的事实吗」；任一处仍读到「恒真 ∥ 三项皆内存读 ∥ 只有两件 ∥ 探针零副作用」即红。

**上抛**：

- [上抛·知会] 代码注释引了已改名的守则：`thincoder-vscode/src/extension/timer-watch.mjs` 第 97 行注释逐字「**探针零副作用**（§5.4）」，而 §5.4 现在叫「判据不取守卫形」（射程更窄）。复现 = 对该档 grep `探针零副作用` ⇒ 1 命中。**本席不写代码**，实现轮顺手改注释即可（零行为）。
- [上抛·知会] `doc_check` 交付门同时报「登记未命中 4 条」——工程清单 `index.docCheckExemptions` 里有 4 条豁免登记的原文已不在判集；豁免表由父侧维护，复核后删与不删由父侧定。

## §3 设计评审（评审子代理）
**状态行**：评审通过（第 2 轮验修：上轮 2🔴 + 4🟡 + 3🔵 全落；新增 4 条均提示级（1🟡+3🔵），不阻断）



### 轮次 1（评审子代理）

设计评审（D-MI34 ∥ D-MI35）· 评审对象 = `docs/core/design/MULTI-INSTANCE-COLLAB.md`

| # | 严重度 | 状态 | 证据 |
|---|---|---|---|
| 1 | 🔴 | 未决 | §5.9「VSC 面板无工作区…闩仍在位、每拍问一次 `ready()`」 vs §5.8 VSC 行「转空工作区三处与 `timerWatch.disarm()` 同点」∥ D-MI34「空载体不撤闩」 |
| 2 | 🔴 | 未决 | §5.4「例外一处…VSC 转空工作区的撤闩」；重臂面只有武装点「面板创建」+ 切槽 `loadSession` + 回合尾补位，无名中「工作区回来」的重臂路径 |
| 3 | 🟡 | 未决 | §5.10「本批再增 ⑦」 vs 46-1 行「怎么算通过」格止于 ⑥ |
| 4 | 🟡 | 未决 | §5.4「探针零副作用」无对应判据；§5.8 ⑦ 只喂假 `ready: () => false` |
| 5 | 🟡 | 未决 | §5.1「其余新词」列 `createInboxWatch` / `onTake` / `onBlocked` / `takeInbox` / `sweepInbox`，不含 `ready` 与 reason 字面 `"busy"` / `"carrier"` |
| 6 | 🟡 | 未决 | §5.4「两因共用一条可见行」+ 行「pickup blocked {ms}ms: {pending} pending」+「`reason` = 本刻那一支」 |
| 7 | 🔵 | 未决 | §5.6 成本行「空闲期 = 每秒一次 inbox 目录 stat」未含每拍 `ready()` 判据 |
| 8 | 🔵 | 未决 | §5.1「最近先例」「调研面（已查）」只覆盖投递通道与闩族，未覆盖本轮两项新决策 |
| 9 | 🔵 | 未决 | §5.8 ⑦「失败侧 = 现码：现码 `getAgent() == null ⇒ return false`」——代码层本轮不在审，未验证 |

VERDICT: changes-required
计数：🔴 2 · 🟡 4 · 🔵 3 · 合计 9

### 轮次 2（评审子代理）

轮次块（设计评审 · 第 2 轮 · 验修）：对象 = `docs/core/design/MULTI-INSTANCE-COLLAB.md` · D-MI34 ∥ D-MI35

| # | 严重度 | 状态 | 证据 |
|---|---|---|---|
| 1 | 🔴 | 已修 | §5.4「**无例外**：撤闩点只有「退出 / 面板销毁」」+ §5.8 VSC 行「`dispose` / view 销毁**两处**…**转空工作区仍撤 timer 闩、但不撤取件闩**」+ §5.9「两条复现路」——`ready` 的「工作区在场」假侧不再对上任何撤闩点，carrier 分支有场景 |
| 2 | 🔴 | 已修 | §5.4「**不需要「工作区回来」的重臂面**：闩从未撤，`ready()` 转真那一拍就是恢复点」+ 判据 ⑨「工作区转空不撤取件闩」及其失败侧 |
| 3 | 🟡 | 已修 | §5.10 46-1 行「怎么算通过」格已含「⑦ 假端 `ready() === false`…」 |
| 4 | 🟡 | 已修 | 判据 ⑧ 三断言（`hasWorkspaceFolder` ≥1 ∥ `blockOnNoWorkspace` 零 ∥ `notifyNoWorkspace` 零）+ ⑧ 失败侧 + ⑧ 为何落扫描；三符号均实在 `workspace-guard.mjs` |
| 5 | 🟡 | 已修 | §5.1「**`ready` = `existing but unusable`**」与「**`"busy"` / `"carrier"` = 新字面，住既有事件的新字段**」 |
| 6 | 🟡 | 已修（附新 10） | D-MI35「**已知代价（写在此处，不留在推论里）**」；VSC 腿有据（`NO_WORKSPACE_MESSAGE` 逐字命中），桌面腿所引「§1 已定」落空（见 10） |
| 7 | 🔵 | 已修 | §5.6 成本行已含「+ 一次内存就绪判据 `ready()`」（附新 11） |
| 8 | 🔵 | 已修 | §5.1「**最近先例（本批两决策 · D-MI34 ∥ D-MI35）**」与「**本批两项新决策的调研面（已查）**」 |
| 9 | 🔵 | 已修 | 判据 ⑦「**⑦ 失败侧锚在行为三条**」——红线锚行为，不锚 API 形状；设计席对「多传的键被丢弃、不会抛」的更正按记录逻辑成立（依赖「现码不校验未知键」这一未验证前提） |
| 10 | 🟡(新) | 未决 | §5.9「其空载体支无场景（§1 已定）」——§1 只有定位 ∥ 不做 ∥ 投递面 ∥ 判断标准四条，无此陈述 |
| 11 | 🔵(新) | 未决 | §5.6「（三项皆内存读、零 IO、「`unref` 闩））」 vs 同格「每秒一次 inbox 目录 stat」——目录 stat 不是内存读，且「三项」无先行项 |
| 12 | 🔵(新) | 未决 | §5.4「无例外：撤闩点只有「退出 / 面板销毁」」 vs §5.8 Desktop 行「取件闩只三个撤点撤——会话清除面 ∥ 面板销毁…∥ 切项目级联」——措辞过紧（细节面在 §5.8，机制不变） |
| 13 | 🔵(新) | 未决 | 判据 ⑧ 射程 = 符号扫描（「⑧ 为何落扫描而不落端级 spy」）——证明的是「没走守卫形」，不是 §5.4 写的「探针零副作用」 |

计数：🔴 未决 0 · 🟡 已修 4 / 未决 1（可选）· 🔵 已修 3 / 未决 3（提示级）· 新 4

VERDICT: pass

## §4 用户批准（主 agent）

## 用户批准（2026-11-10）

- **报障原话**：「**VSC 端为什么收到消息不会立刻响应，我问他的时候，他还说没收到，然后会话一结束就收到了。**」
- **纠正父侧误判（原话）**：「**但实际情况是当时没有会话在活动，VSC 端是在空闲的状态，但是并没有在收到消息的时候拉起。**」——父侧先前判「轮次在跑才跳过」，**该前提作废**。
- **开批授权（原话）**：「**开**」（01:21）。
- **全链自动推进授权（原话）**：「**自动跑完**」（01:22）——覆盖本批从设计、评审、修复、实施到收口的全程；父侧仅在四种情况停（不可修 🔴 / 实施须偏离已批设计 / 用户叫停 / 范围变化）。**本批全程未触发这四种。**

## §5 实施记录（eng-coder）
**状态行**：实施完成（审计 1 轮 + 代码评审 1 轮（pass）已收敛；真机面未验，见 §5.6）



### 5.1 交付面（逐档改了什么）

| # | 档 | 改动 |
|---|---|---|
| 1 | `thincoder-core/instance-inbox-watch.mjs` | 签名换 `createInboxWatch({ ready, isBusy, onTake, onBlocked, … })`；`ready` 必填（非函数 ⇒ `TypeError` 点名 `ready`）；删 `getAgent` 早退支；不就绪（`ready() !== true` ∨ 无 `onTake`）并入受阻计数，`ev:inbox-watch-blocked` 加 `reason`（`"busy"` ∥ `"carrier"`）；`onTake(messages)`；`sync()` 无条件在位；`isBusy()` 改真值判据（真值即忙）；头注按新契约重写 |
| 2 | `thincoder-cli/src/tui/timer-watch.mjs` | 转口 `ready: () => true`（理据入头注：`agent` 是 `startTUI` 入参、开轮面 `turn` 与闩同一闭包）；去掉未用的 `agent` 形参 |
| 3 | `thincoder-cli/src/tui/index.mjs` | `onTake(_agent, messages)` → `onTake(messages)`；不再传 `agent` |
| 4 | `thincoder-vscode/src/extension/timer-watch.mjs` | `ready: () => panel?._panel != null && hasWorkspaceFolder()`（import 判定侧、不取守卫侧）；`onTake(messages)`；头注按两处撤闩 / 转空不撤 / 切槽重臂重写 |
| 5 | `thincoder-vscode/src/extension/chat-panel.mjs` | 转空工作区支删 `disarmInboxWatch(this)`（载体仍置空、timer 闩照撤）；登记点注释与 import 头注同步 |
| 6 | `thincoder-vscode/src/extension/panel-session.mjs` | `loadSession` 头注更正为「切槽 = 重臂，不在撤闩列」（零行为） |
| 7 | `thincoder-desktop/src/main/timer-watch.mjs` | 删 `sync(key, agent)` 的空载体 `disarm` 支；`ready: () => slot.agent != null`；`onTake(key, messages)`；新增 `agentOf(key)` 载体读面 |
| 8 | `thincoder-desktop/src/main/suspension-timers.mjs` | `onTake(key, messages)` 从 `inbox.agentOf(key)` 取载体；头注补 D-MI34 |

未动（声明清单内，经实读确认无需改）：`thincoder-cli/src/tui/agent-turn.mjs`（链尾只调无参 `sync()`）、`panel-turn-stages.mjs`（补位点调用形不变）、`suspension-drive.mjs`（`sync(key, agent)` 契约不变）、`turn-driver.mjs`（`armInbox(key, agent)` 契约不变）。

### 5.2 验收对照

| AC | 判据 | 读数 | 状态 |
|---|---|---|---|
| AC-1 | 假 VSC 端（面板 ∧ 工作区在场、`_agent` 为 `null`）⇒ 一拍取件一次、起轮一次 | 单测 `AC-1`：`took.length === 1`、inbox 零残留 | ✅ |
| AC-2 | `ready` 假 + 待取非空 + 推过阈值 ⇒ `onBlocked` 一次、事件一条 `reason="carrier"`、行逐字；转真恢复取件 | 单测 `AC-2` / `AC-2b`；集成 46-1 第 ⑦ 步（日志 `carrier` 恰一条、`pending=1`） | ✅ |
| AC-3 | `sync(key, 空载体)` 后闩在位（`size()` 不减）、拍照跑、跨阈出受阻行 | 单测 `AC-3`（真桌面表壳）：`size()===1`、一行受阻行、载体就位后取件一次 | ✅ |
| AC-4 | 不传 `ready` ⇒ 装配即抛、点名 `ready` | 单测 `AC-4`（`TypeError` + `/ready/`） | ✅ |
| AC-5 | 三端 `onTake` 首参不再收 agent；46-1 ①–⑦ 同跑全绿 | 单测 `AC-5`（唯一实参 = 消息数组）；46-1 整档 pass | ✅ |
| AC-6 | 两条可见行逐字未变 | 单测 `AC-6`（两个逐字串硬比对） | ✅ |
| AC-7 | VSC 取件接线：`hasWorkspaceFolder` ≥1 ∧ 守卫形符号零命中 | 单测 `AC-7`（射程收敛到 `syncInboxWatch` 函数体） | ✅ |
| AC-8 | 同面板 `ready` 真→假→真、中间不 `sync`：转假零取件 + 一条受阻行；转真下一拍取件一次 | 单测 `AC-8` + `AC-8b`（转空支不撤闩的静态锁，撤闩调用点恰两处） | ✅ |

### 5.3 失败侧读数（改动前跑出来的，非事后补写）

- **判据 ⑦ / AC-2**：现码 `createInboxWatch({ getAgent: () => null, … })` + inbox 非空 + 假钟推过 `INBOX_BLOCKED_MS` 两次 ⇒ `onBlocked` 0 次、`ev:inbox-watch-blocked` 0 条、`ev:inbox-watch-blocked-empty` 0 条、待取仍在盘 1 条（零取件）。三条行为同时成立，与设计 §5.8 ⑦ 的失败侧一致。
- **判据 ⑧ / AC-7**：现码 `thincoder-vscode/src/extension/timer-watch.mjs` 全文扫描 ⇒ `hasWorkspaceFolder` 0 命中（第一条断言即红），`blockOnNoWorkspace` / `notifyNoWorkspace` 也 0。
- **AC-4**：现码无 `ready` 参数，传与不传都装配成功（判据要的是「缺了就抛」，现码没有这条）。
- **AC-3**：把设计点名的旧形态 `if (!agent) { disarm(key); return null }` 加回取件闩表的 `sync` 后运行 ⇒ `sync("k1", null)` 之后 `size() === 0`（AC-3 的第一条断言变红：RED）。
- **AC-8b**：把 `disarmInboxWatch(this)` 加回转空支后运行 ⇒ 撤闩调用点 3 处、转空支含撤闩（RED）。工作树当前值 = 2 处 / 转空支不含（GREEN）。

### 5.4 命令与结果

- `node --test docs/batches/2026-11-10-inbox-latch-carrier.test.mjs` ⇒ tests 10 · pass 10 · fail 0
- `node --test test/integration/cross-instance-message.test.mjs`（CLI 46-1，含新增第 ⑦ 步）⇒ tests 1 · pass 1 · fail 0
- `cd thincoder-vscode && node test/run.mjs` ⇒ tests 38 · pass 38 · fail 0
- `cd thincoder-desktop && node test/run.mjs` ⇒ 清单为空（零用例即绿，2026-09-28 全清重置后的既存状态，非本批改动）
- `cd thincoder-cli && node test/run.mjs` ⇒ 本包无单测集（提示集成集住仓根），故 CLI 面只到模块装载检查 + 46-1

### 5.5 声明清单之外的改动（逐条理由）

| 档 | 理由 |
|---|---|
| `test/integration/fixtures/cross-instance-harness.mjs` | §2.4 第 7 行。它是被改签名（去 `getAgent`、加必填 `ready`、`onTake` 去首参）的**直接调用面**——不跟改，整个集成夹具装配即抛。另加 `{op:"ready"}` 假端注入位与日志目录缝（读 `reason` 用） |
| `test/integration/cross-instance-message.test.mjs` | §2.4 第 8 行 + §5.10 的 ⑦。另把 `t.after` 的 `rmSync` 改成重试式：夹具新增日志面后，Windows 上子进程句柄释放与删根盘会撞 EPERM，而 teardown 崩会把真断言盖掉（重试 20 拍后仍失败照旧抛，不吞） |
| `test/rtm/tooling.md` | §5.10 声明的「改 1 行 = CLI 46-1」：46-1 的「怎么算通过」格补 ⑦（不新增行、不改「怎么做」） |

### 5.6 未验 / 无法验（如实登记）

- **真机未跑**：VS Code 扩展宿主与 Electron 本机都起不来（无宿主/TTY 依赖）。故 VSC 与桌面的**端级**行为只到「契约层同形假端 + 静态锁」两件；真机复看属收口轮父侧事项。
- **桌面端在本 checkout 无法冒烟**：`thincoder-desktop/node_modules/@thincoder/core` 是**旧物化副本**（缺 `instance-inbox.mjs` / `instance-registry.mjs` / `instance-inbox-watch.mjs` 三档），直接 import 端壳 `ERR_MODULE_NOT_FOUND`；`scripts/dev-link.mjs` 对 materialized 类按 RELEASE.md §5.3 跳过不替换。单测档因此用测试进程内的解析钩子（先例 = `thincoder-desktop/test/rc-resolve.mjs` 的 `/rc/` 钩子）把 `@thincoder/core/*` 指到仓内核——测的仍是盘上真端壳。产品侧由 `prepackage`（`scripts/materialize-deps.mjs` 从 `../thincoder-core` 复制）重建，属环境面。
- **单测档收口删**：`docs/batches/2026-11-10-inbox-latch-carrier.test.mjs`（10 例）按纪律由父侧收口轮删除。

### 5.7 评审轮次与收敛（终态 clean）

- **库内分叉审计（explore，第 1 轮）**：3 条 —— ① `test/rtm/tooling.md` 的 46-1 行缺 ⑦（§5.10 声明的「改 1 行」未落盘）；② AC-8 缺「转空支撤闩」的红侧（判据驱动核闩、不加载 `chat-panel.mjs`）；③ 死指针：VSC 头注「单元档 A10 锁」指向 2026-11-09 批已删的单测档。三条**当轮全部修掉**（补 RTM ⑦、新增 AC-8b 静态锁并取红读数、删死指针）。
- **advisor 代码评审（第 1 轮）**：`VERDICT: pass`，1🟡 + 4🔵，无阻断。
  - 🟡 `isBusy?.() === true` 严格相等：猜「不忙」是把消息注入在飞回合（F-MI10 禁止形）。⇒ 改为真值判据 `if (isBusy?.()) return "busy"`，并把「两谓词方向都朝安全侧」写进函数注与 `@param`。
  - 🔵 核件路径错（`thincoder/core/` → `thincoder-core/`）⇒ 已改。
  - 🔵 AC-1 的「旧形态零行」断言跑不到旧码、且靠 `advance` 先后维持绿 ⇒ 删该断言，旧码读数只留本段 5.3，单测只断言它能证的「读对象当门 ⇒ 零取件」。
  - 🔵 AC-7 / AC-8b 的扫描射程与锚 ⇒ AC-7 收窄到 `syncInboxWatch` 函数体（设计 §5.8 ⑧ 原话「扫描本档的取件接线」），AC-8b 把字面锚换成 `onDidChangeWorkspaceFolders` 之后的 `hasWorkspaceFolder()` 定位。
  - 🔵 `pendingCount` 读失败折成 0（「读不动」与「确实没人在等」不可分）——**既有面、非本批引入、本批不改**，建议父侧录一条台账（可选改进：读失败另记事件并仍走 `onBlocked`）。
- **终态：clean**（审计 1 轮 + 评审 1 轮，全部处置完毕，复跑全绿）。

### 5.8 设计面漂移（交父侧路由，未擅改设计档）

- **§5.9「删支后 `ready` 在桌面恒真」** vs **§5.8 Desktop 行「就绪判据 = 该键的闩槽有载体」**：本轮按 §5.8 实现（按槽判载体，空载体如实报不就绪、出受阻行——这正是 AC-3 要的读数）；§5.9 那句读作「生产路里闩槽恒有载体（`armInbox` 只在拿到 agent 后调用）」才为真，按实现形态读则不真。建议设计席收成一句。
- **§5.6 成本行**「+ 一次内存就绪判据 `ready()`（三项皆内存读、零 IO）」与同格「每秒一次 inbox 目录 stat」并列，且「三项」无先行项——§3 轮次 2 的第 11 条已开此口，至今未落。

### 5.9 收正轮跟随（实现轮 · 一处注释改名，零行为）

§2.9 上抛「代码注释引了已改名的守则」按父侧本轮回讯落地：改动面 = 一档一处注释。

| 档 | 改动 |
|---|---|
| `thincoder-vscode/src/extension/timer-watch.mjs` | 取件闩头注第三段：守则名「探针零副作用」→「**判据不取守卫形**」，并补射程一句（机检 = 判据 ⑧ 扫本档取件接线：`hasWorkspaceFolder` ≥1 ∥ `blockOnNoWorkspace` · `notifyNoWorkspace` 零命中；探针体里另写的提示 ∥ 埋点不在其射程内，本批不另立判据） |

理由两条。一是旧名在设计档 §5.4 已不存在，下一人按名 grep 会空手。二是「零副作用」承诺的比档里现在敢写的多一格：守着旧注释写探针体的人，会以为埋点没事，或反过来以为埋点也禁——两边都是猜，而档里 §5.4「射程如实登记」与 §5.8 ⑧「射程到此为止」两句已经把边界写死了。改后逐字对齐这两句，不改设计档。

零行为：只改注释文本。`syncInboxWatch` 的逻辑、签名、`ready` 谓词、断言面一字未动。

**验证**（本轮回读 + 重跑）

- `node --check thincoder-vscode/src/extension/timer-watch.mjs` ⇒ exit 0
- `cd thincoder-vscode; node test/run.mjs` ⇒ tests 38 · pass 38 · fail 0（与改动前同数；只改注释而动出变化，就等于动了行为）
- 退役名扫描（一次扫净）：`探针零副作用` 在 `thincoder-vscode/src/extension/timer-watch.mjs` 改前 1 命中、改后 0 命中。产品面零残留；其余命中全落在批档（§2 的第 2.3 节原决策句 · §2.9 的改名记录 · §3 评审表）与批档同名单测档的 AC-7 用例标题里——前者是设计席写面的历史过程记录，后者随收口删档。三处都非本席写面，未动。

**未验 / 未做（如实登记）**：真机（VS Code 扩展宿主）未跑——本轮零行为，端级复看仍在父侧收口轮；本轮未重发库内分叉审计与 advisor 代码评审（§5.7 那两轮覆盖的是代码改动，本轮只动注释文本），若父侧认为需要，可按同一交付面复跑。

## §6 验证与收口（父代理）

## 验证与收口（父侧）

### 验收读数（父侧亲跑，2026-11-10 01:54）

- `node --test docs/batches/2026-11-10-inbox-latch-carrier.test.mjs` ⇒ **`pass 10 · fail 0`**（该档收口删除，读数留此）。
- `node --test test/integration/cross-instance-message.test.mjs` ⇒ **`pass 1 · fail 0`**（CLI 46-1 ①–⑦）。
- 实施席另跑：`cd thincoder-vscode; node test/run.mjs` ⇒ **38 / 38 pass**。

### 失败面（三条先红，各取自不同的面）

```text
判据 ⑦  现码 getAgent: () => null        ⇒ 零 onBlocked ∥ 零 ev:inbox-watch-blocked ∥ 消息仍在盘
判据 ⑧  现码 hasWorkspaceFolder           ⇒ 0 命中（接线里没有这枚符号）
判据 ⑨  把撤闩行加回                      ⇒ 撤闩调用点 3 处（应为 2）
```

### 落地核对

- **核**：`createInboxWatch({ ready, isBusy, onTake, onBlocked, timer, clear })`——`ready` **必填无缺省、缺了装配即抛点名**；删 `getAgent` 早退支；不就绪并入受阻计数 + `reason`（`busy` ∥ `carrier`）；`onTake(messages)` 不再收 agent。
- **VSC**：`ready = 面板在场 ∧ hasWorkspaceFolder() ∧ 未销毁`；**转空工作区只销毁载体、不撤取件闩**；撤闩面 = `dispose` ∥ view 销毁两处。
- **桌面**：删「空载体即撤闩」支；三撤点不变（会话清除 ∥ 面板销毁 ∥ 切项目级联）。
- **CLI**：`ready: () => true`，理据入注（agent 是入参、开轮面与闩同一闭包）。

### 设计档收正（三轮）

1. **第 1 轮评审 2🔴**：`carrier` 分支场景与「转空工作区撤闩」互斥、例外撤闩后无重臂路径 ⇒ **两刀一并解决 = 删掉该撤闩点**（`ready()` 转真那一拍即恢复点，不需要新的重臂面），并新增判据 ⑨ 把这条变成可红端级断言。
2. **第 2 轮评审 pass** + 4 条提示级（§5.9 引「§1 已定」落空 · §5.6「三项皆内存读」与目录 stat 矛盾 · §5.4「无例外」对桌面过紧 · 判据 ⑧ 射程窄于守则名）。
3. **收正轮**：桌面就绪判据两说收成一（以实现为准，理由 = 闩槽由 `armInbox` 拿到载体后才建）· 成本格改成能读懂的三件事 · 删空引用并就地给理由 · 撤闩点改概括句 + 逐端数目（CLI 一 ∥ VSC 两 ∥ 桌面三）· **守则降强度**：「探针零副作用」→「**判据不取守卫形**」并登记射程边界。

### 一处父侧核过才没删的东西（记档）

`doc_check` 门每次附「**登记未命中 4 条（复核后删）**」。父侧**没有照删**，先单跑 `test/rtm/tooling.md` 复核：

```text
DOC-CHECK GATE: PASS · 豁免 14 条（alpha.txt ∥ beta.txt ∥ gamma.txt ∥ docs/design/notes.txt，均为 CLI 41/42 期望回执内联的夹具档名）
```

⇒ **4 条豁免全部在场且都在用**，「登记未命中」那行是误报。**照「复核后删」的字面删掉，tooling.md 立刻从 PASS 变 REFUSED。**

### 已知边界（明写，不留白）

- **AC-8 端级那一半未跑**：本机无 VS Code 宿主。核闩层行为三条（真→假→真：零取件 ∥ 一条受阻行 ∥ 转真恢复）已验；**端级的转空支红侧改用静态锁**（撤闩调用点恰 2 处 + 转空支零撤闩），**静态锁 ≠ 端级验证**。
- **真机「空闲时收到即拉起」未验**：VS Code 宿主与 Electron 本机都起不来。**这条只能由用户在真机发一条跨实例消息确认，父侧替不了。**
- **桌面端本 checkout 无法冒烟**：`thincoder-desktop/node_modules/@thincoder/core` 是旧物化副本（缺 `instance-inbox*` 三档），`scripts/dev-link.mjs` 对 materialized 类按 RELEASE.md §5.3 跳过不替换；产品侧由 `prepackage` 重建。**属环境面，非本批改动。**

### 集成测试面

- `CLI 46-1` 改一格（「怎么算通过」补 ⑦），不新增行；集成集总量不变。

### 台账

- 本批行 `#2263` 走完 `在途 → 待核销 → 已核销`。

### 收口扫描

- **延后批复核**：无。
- **文档检查门**：`PASS`（设计档 ∥ 批档 ∥ `test/rtm/tooling.md`）。
- **遗留（另账）**：`#2253` 集成集越窗口 · `#2257` 桌面行数表偏旧 · `#2258`–`#2262` 跨实例对账五条。
