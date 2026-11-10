# 2026-11-09 · inbox-watch-rearm
> 六段，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 每段只有一个作者：作者的段可 `append` 加内容、可就地改（`edit`）；非作者一概拒。
> 编制：主 agent · 2026-11-09 · 来源 = 用户 2026-11-09 23:42「取件侧响应的事儿你办一下」——跨实例收件在真实使用中静默失效。
> 台账 = #2252（core · 归批）。前情 = 2026-11-09-cross-instance-message §6（已收口 2026-11-09）。
## §1 讨论（主 agent）
**状态行**：已收口 2026-11-10
<§1 模板占位：本批条目 / 关键判据 / 授权口径>

## 现场（父侧实读，2026-11-09 23:41–23:44）

- **症状**：跨实例消息**收得到、回不去，且后续消息再也收不到**。
- **证据一（在盘）**：`%USERPROFILE%\.thincoder\inbox\27052-1794238039155-32ulwl\` 有两条未取消息（`1794238715164-22752-b16da0.json` 23:38:35 · `1794238780546-22752-30b30a.json` 23:39:40），都来自 `22752-1794238059129-5z3rsd`（vscode · cwd `d:\repos`）。
- **证据二（取件语义）**：取件 = rename → 删除。**仍在盘上 ⇒ `takeInbox` 一次都没跑过**。
- **证据三（无报错）**：`agent-2026-11-09.log` 内**零** `ev:inbox-watch-err` ⇒ `fire()` 没抛，**不是报错死的**。
- **证据四（曾经好过）**：23:28:27（进程重启 = 会话起点）第一条消息**成功送达** ⇒ 会话起点武装点有效。
- **目录内无 `.tmp` 残留** ⇒ 取件不是半途 rename 中断。

## 已定决定

- **已定决定**：本批**只修「取件闩静默变哑」**，不夹带其他改动；身份族核查的撤除已在 `2026-11-09-cross-instance-message` 重开轮内进行，**两批不合并** · 用户原话：「**你再开个批档不就完了，何必非要塞进一批呢？**」 · 时间：2026-11-09 23:45

## 父侧初判（待实施席复现证实或推翻）

`fire()` 在飞回合时 `isBusy` ⇒ `return false`，**既不取件也不重臂**（设计意图 = 在飞回合零 stat），重臂全靠 `agent-turn.mjs` 的回合链尾；而链尾那处套了**从定时唤醒面借来的守卫** `timerRearmBlocked(...)`（四条件：`_timerRearmRevoked` ∥ `_suspAborted` ∥ `abortTrigger === "stop"` ∥ `_sessionAbort.signal.aborted`）。

**推断**：该守卫在注入轮为真 ⇒ 链尾整段 `sync()` 被跳过 ⇒ 闩永不回武装，**且没有任何东西会告诉任何人**（零日志、零提示）。

**这一条的形态**：定时唤醒面的守卫语义（用户刚全停 ⇒ 别自动起一轮）被套到取件面（不自动起轮 ≠ 门可以哑）。**同一道守卫，两处后果不同。**

## §2 批次任务与设计（eng-designer）
**状态行**：设计完成
<§2 模板占位：本批条目（覆盖） / 设计档落点 / 机制设计 / 受影响文件与测试覆盖 / 验收对照 / 关键决策 / 上抛项>

### 条目（覆盖）

- **R1 取件闩自续**（设计 `MULTI-INSTANCE-COLLAB` §5.4「自续闩」· D-MI31）：一拍**先重臂**（无条件不变式：落在一切可抛调用之前、不进 `try`）**再试取件**（`inFlight` 防重入 + **`onTake` 交接契约**：resolve = 这一轮已登记为在飞——口径 = 该端判忙谓词自此刻读到真、直到回合结束；其余没开成轮的情形一律 reject，**失败单源**，闩不拿 `isBusy()` 的一次读数判死）；回合起点不撤闩；回合尾 / 模态关闭两处 `sync()` 降级为幂等补位、零存活职责；`timerRearmBlocked` 只包 `timerWatch`；**取件开轮恒 `resume=false`**（走 resume 则消息离盘又不落库 = 静默丢）。三端同规（CLI / VSC / Desktop）。
- **R2 开轮没成当场明说**（§5.4「开轮没成 ⇒ 当场明说」· D-MI32）：`onTake` 的开轮面 reject ⇒ `ev:inbox-watch-take-lost`（带 msgId 列表）+ 端壳可见行（落地端 = CLI ∥ VSC；桌面本批只记事件、不出行），逐字锚 = 设计 §5.4 两条可见行之一（`[cross-instance message · turn failed: {n} lost ({msgIds})]`）。
- **R3 闩受阻要出声**（§5.4「门开不了要出声」· D-MI33）：`isBusy()` 连续为真每跨一个 `INBOX_BLOCKED_MS`（默认 5 min）做一次目录 stat；待取非空 ⇒ `ev:inbox-watch-blocked` + 端壳 `onBlocked(ms, pending)` 可见行（落地端 = CLI ∥ VSC；桌面只记事件、不出行）（逐字锚 = `[cross-instance message · pickup blocked {ms}ms: {pending} pending]`）。**名字不叫 stall**——`stall` 在本仓已指 advisor 零产出看门狗 / 静默轻显形 / 子代理环路三件事（设计 §5.1 三问答）。
- **不在本批**：身份族撤除（另一批进行中）· 名册心跳（设计 §5.9 已登记的已知局限，本批不动）。

### 独立失效路径（先列全，再挑处置）

用户可见结果都是「消息躺在 inbox、没人取、没人说」，但成因分开——只修一条，另外四条照旧。

- **P1 链尾守卫（父侧初判，成立）**：`thincoder-cli/src/tui/agent-turn.mjs` 的 `runAgentTurnInner` `finally` 里，`timerRearmBlocked(ctx?.state, ctx?.agent)` 为真 ⇒ `timerWatch.sync()` 与 `inboxWatch.sync()` **一起跳过**。守卫四条件任一条为真即命中，其中 `state._timerRearmRevoked` 是粘滞位，只在下一链链头复位 ⇒ 用户按一次 Ctrl+C 全停之后，只要不再起一轮，闩永久不回来。**零日志零提示**。
- **P2 在飞分支不重臂**：核 `createInboxWatch` 的 `fire()` 首行 `if (isBusy?.() === true) return false`——不取件，**也不重臂**。于是「这一拍落在回合里」就等价于「闩从此不在位」，能不能回来全看 P1 那一行有没有跑到。P1 与 P2 是同一条链上的两个断点。
- **P3 开轮没成也没人知道**：CLI `onTake` 是 `void turn(...)` 后**同步返回 true** ⇒ `started=true` ⇒ 闩不重臂；而消息在 `takeInbox` 时已从盘上删掉。开轮面若是 reject（或根本没跑起来），结果 = 消息丢了 + 闩哑了 + 两边都以为送到了。
- **P4 VSC 懒装配（第二条独立的哑路径，与 P1 无关）**：`thincoder-vscode/src/extension/timer-watch.mjs` 的 `isBusy` 写作 `!panel?._agent || Boolean(panel.turnBusy?.())`——**「还没有载体」被算成「忙」**。核 `fire()` 先判 `isBusy` 再判载体，于是「面板开着、一轮都没跑过」的实例：首拍判忙 ⇒ 不重臂 ⇒ 只有回合链尾能救，而它永远不会跑回合 ⇒ 永久哑。核里那条「载体未就绪 ⇒ 下一拍再看」的分支在 VSC 侧根本走不到。
- **P5 门在位但门不开**：`isBusy` 为真也可能是长期态——CLI 的 `state.suspended` / `_suspPending`、卡住不退的模态、`state.processing` 未复位的异常径。闩在位、每秒判忙、永不取件：用户看到的与 P1 一样，且同样零提示。

处置：P1–P4 由 R1 结构性消掉（闩不再需要「别人叫醒」，也不再依赖 `isBusy` 承担「未就绪」语义）；P5 由 R3 报出来。R2 补 P3 的**消息已丢**那一半——那一半 R1 救不回来（消息已经离盘），只能明说。

### 复现（① 已实跑 · ②③ 为代码路径判定）

沙箱 = 两处目录缝 `_setInstanceDirForTest` / `_setInboxDirForTest` 指向临时目录（构造 watch 会跑一次 `sweepInbox` / `sweepInstances`——不注入就碰真实 `~/.thincoder`）。**两侧都跑了**：同脚本 `isBusy` 恒真 / 恒假各一组。

**① 实测读数（真模块 · 沙箱目录 · 2026-11-09 23:55 前后）**：

```text
BUSY_TICK   {"armedBefore":1,"armedAfterTick":0}
IDLE_TICK   {"armedBefore":1,"armedAfterTick":1}
```

- 判读：在飞一拍之后 `armedAfterTick` 0（闩不再在位），空闲一拍之后 1（仍在位）⇒ **P2 实锤**：闩的存亡取决于「那一拍是不是落在回合里」，复活全靠回合链尾（P1）。
- 改后期望：`BUSY_TICK {"armedBefore":1,"armedAfterTick":1}`（自续形态下在飞一拍也重臂）。
- 命令形态 = `execute` 内联：`import` 两档目录缝 → `createInboxWatch({ getAgent, isBusy: () => true ∥ false, onTake: () => true, timer: 假队列, clear })` → `sync()` → 取一拍 `await f()` → 60 ms 后数队列长度。

```text
# ① P2：在飞一拍之后，闩还在不在（改前期望 QUEUED 0，改后期望 1）
node --input-type=module -e "import {createInboxWatch} from './thincoder-core/instance-inbox-watch.mjs'; const q=[]; const t=(f)=>{q.push(f);return {}}; const c=()=>{}; const w=createInboxWatch({getAgent:()=>({}),isBusy:()=>true,onTake:()=>true,timer:t,clear:c}); w.sync(); const f=q.shift(); await f(); await new Promise(r=>setTimeout(r,50)); console.log('QUEUED_AFTER_BUSY_TICK', q.length)"

# ② P1：守卫为真时，链尾是否连 inboxWatch 一起跳过（改前：两次 sync 都不调用；改后：timerWatch 不调、inboxWatch 调）
#    读代码即可判——runAgentTurnInner 的 finally 只有这一行：
#    if (!timerRearmBlocked(ctx?.state, ctx?.agent)) { ctx?.timerWatch?.sync(); ctx?.inboxWatch?.sync() }

# ③ P4：VSC 面板无载体时的判忙形态（改前：isBusy 恒真 ⇒ fire 早退且不重臂）
#    读 thincoder-vscode/src/extension/timer-watch.mjs 的 syncInboxWatch 传入的 isBusy 表达式
```

**②③ 是读代码判的，不是跑出来的**——如实记：②③ 只实读了代码。① 的读数见上。

### 受影响文件与测试覆盖

| 文件 | 改动 |
|---|---|
| `thincoder-core/instance-inbox-watch.mjs` | 自续拍（先重臂——在一切可抛调用之前、不进 `try`——再试取件）· `inFlight` 防重入 · `onTake` 交接契约（promise：resolve = 已登记为在飞 / 其余一律 reject）· `sync()` 幂等 · 去掉 `fire()` 内的 `sync()` 依赖 · 受阻计数 + `INBOX_BLOCKED_MS` + `onBlocked` · 新增 `ev:inbox-watch-blocked` / `ev:inbox-watch-blocked-empty` · 两条可见行的拼串 |
| `thincoder-cli/src/tui/agent-turn.mjs` | 回合起点不撤闩；链尾 `inboxWatch.sync()` 移出 `timerRearmBlocked` 守卫（守卫只包 `timerWatch`） |
| `thincoder-cli/src/tui/index.mjs` | 传 `onBlocked`（落 `pushLine`，逐字锚）；`onTake` 改返回 promise：起轮后自查 `state.processing` 为真才 resolve，否则 reject（入口抛 / 未登记为在飞 = 失败单源）；reject 分支记 `ev:inbox-watch-take-lost` + 逐字丢失行 |
| `thincoder-vscode/src/extension/timer-watch.mjs` | `isBusy` 去掉 `!panel?._agent`；传 `onBlocked`（面板可见行，逐字锚）；`onTake` 改返回 promise：`_publishTurnState("running")` 已置才 resolve，无工作区早退 / 入口抛 ⇒ reject（失败单源）+ 丢失行 |
| `thincoder-vscode/src/extension/panel-chat.mjs` | 回合起点不撤闩（`disarmInboxWatch` 调用点撤除） |
| `thincoder-desktop/src/main/suspension-timers.mjs` · `thincoder-desktop/src/main/timer-watch.mjs` | 同规：键面闩自续、`busyOf` 不承担「未就绪」语义、`onTake` 失败单源（reject）；**`onBlocked` 与本端两条可见行不在本批**——桌面渲染面对未登记通道原引用（post 过去也零显示）⇒ 桌面侧两种失败只有日志面，接渲染通道另立一轮 |
| `docs/batches/2026-11-09-inbox-watch-rearm.test.mjs` | 单元档（收口删） |
| `test/integration/cross-instance-message.test.mjs` | CLI 46-1 改一格：「怎么做」增一步；「怎么算通过」①–④ 保留 + 增 ⑤⑥；「异常」列不动（见设计 §5.10） |

- **tier 结论：零文件跨层，无拆分方案。** 改动均为挂点级（核一档重写各出口、三端接线一两行、测试档新建）。

### 验收对照（每条都能判，且都能红）

| # | 判据 | 怎么判（失败侧） |
|---|---|---|
| A1 | 在飞回合之后闩仍在位（P2 消） | 假 timer + `isBusy` 恒真走 3 拍 ⇒ 队列非空；旧形态第 1 拍后即空 |
| A2 | 补位点一次都不调用也照取件（P1 消） | 自会话起点装闩后**从不**调 `sync()`，inbox 放一条、`isBusy` 转假 ⇒ 下一拍取走并 `onTake` 恰一次；旧形态永不取 |
| A3 | 在飞回合零 stat | `isBusy` 恒真期间 `takeInbox` 计数 = 0（注入模块缝） |
| A4 | 无载体不算忙（P4 消） | `getAgent` 先返 null 后返对象 ⇒ 前者零动作、后者一拍取件；VSC 侧静态断言 `isBusy` 不含 `_agent` 判据 |
| A5 | 开轮失败留痕（R2） | 注入 `onTake` reject ⇒ 恰一条 `ev:inbox-watch-take-lost`（其 `msgIds` 恰含那枚 id）+ 恰一行可见文本且逐字等于设计 §5.4 丢失行；此时 inbox 已空（不重投）；开轮成功的一拍零事件零行 |
| A6 | 受阻跨阈出声（R3） | `isBusy` 恒真 + inbox 非空 + 注入 `nowFn` 推过 `INBOX_BLOCKED_MS` ⇒ `onBlocked` 恰一次、`ev:inbox-watch-blocked` 恰一条且 `{ms, pending}` 与实际相符、可见行逐字等于设计 §5.4 受阻行；再跨一阈 ⇒ 第二次（每阈一次）；inbox 空 ⇒ 零行（只记 `-blocked-empty`）；`isBusy` 转假后计数归零、再次受阻重新报 |
| A7 | 集成业务面不被打破 | CLI 46-1 全六步绿（①–④ 原意保留，⑤⑥ 为本轮新增；见设计 §5.10「怎么算通过」条） |
| A8 | 交接不误判（#13 消） | 短轮（一轮在一拍内起完）⇒ 零 `ev:inbox-watch-take-lost`、零丢失行、下一拍照常取件；审批悬挂（`isBusy()` 为真）⇒ 零丢失行、起轮次数 = 1；`onTake` reject ⇒ 恰一条事件 + 一行（同 A5）。旧「一次未翻真即判死」形态下前两条都红：短轮红在「报丢失」，审批悬挂红在「报丢失 + 起第二轮」 |
| A9 | 一拍抛出不影响下一拍（设计 §5.8 已接判据 ⑤：「重臂不进 try」的可红面） | 注入 `getAgent` 抛错 ∥ `takeInbox` 抛错 ⇒ 本拍记一条 `ev:inbox-watch-err`、闩仍在位，下一拍照常取走件；旧形态（重臂放进 `try` ∥ 重臂落在可抛调用之后）下一拍队列空 |
| A10 | 切槽点不把取件闩撤死（设计 §5.8 VSC 行 · D-MI31） | `panel-session.mjs` 的 `loadSession` 函数体内零 `_inboxWatch?.disarm()`——撤了就没人再装（武装点只有面板创建与回合尾）；旧形态下面板一打开闩就死到首轮结束 |

### 关键决策

- **选自续而不是「链尾无条件 sync」**：后者只补 P1，P2 的断点还在（任何一条没跑到链尾的回合都重新把它变哑），而 P4 与 VSC 完全不在那条链上。自续把「门还能不能开」与「哪段代码跑到没跑到」解耦，P1–P4 一起消。
- **代价明记**：在飞回合每秒一次内存判据（零 fs）。换来的是闩不可能被遗忘——这是「静默失效」与「每秒一次空转」之间的一次取舍，取前者。
- **R2 不重投**：重投 = 替目标存着 = 已被否决的持久待取队列。消息已离盘 ⇒ 只能明说。

### 上抛项

- **[上抛·知会] 复现分两半**：① 已实跑（读数见上，P2 实锤）；②③ 是代码路径判定，不是跑出来的。实施轮第一步重跑 ① 确认同一读数——若改前读到的不是 `armedAfterTick 0`，说明形态与本文不符，先停下回报，别按本文改。
- **[上抛·知会] 本轮顺手修的一处档内不一致**：设计 §5.8 原写注入缝 `_setInstanceDirsForTest`（名册 / inbox 合缝，复数）——核里不存在这个名字，实际是 `_setInstanceDirForTest`（名册档）+ `_setInboxDirForTest`（inbox 档）两缝，已就地改正（一致性面、在设计档写域内）。

- **[上抛·知会] #13（评审轮 2 新 🔴「已交出标志判死口径」）处置 = 方案 (a)：失败单源 = `onTake` reject。** 删掉「已交出标志」与「一次未翻真即判死」那条口径（两者互斥：既承认 `isBusy()` 翻真时序不可知，就不能拿一次未翻真判死），改成：`onTake` 返回 promise，**resolve 口径 = 该端自己的判忙谓词自这一刻读到真、直到本回合结束**；其余一切「没开成轮」的情形 reject。落地零新增管道——CLI 侧依据 `thincoder-cli/src/tui/agent-turn.mjs`「state.processing = true」（在 `runAgentTurnBody` 的同步前缀内、首个 `await` 之前）⇒ `turn()` 返回时即可读；VSC 对位点 = `thincoder-vscode/src/extension/panel-chat.mjs`「_publishTurnState("running")」。判据补在设计 §5.8「已接判据」⑥（短轮 / 审批悬挂两条误判面，各自可红）与 ⑨（只有 reject 一条路走到丢失出口）。
- **[上抛·知会] 实施轮必须同改的两处（不属红线设计面，属落地形态）**：① 集成夹具 `test/integration/fixtures/cross-instance-harness.mjs` 的 `onTake` 现为同步 `return true` —— 按新契约这读作「没开成轮」，须改返回 promise；② §2 验收表 A7 原写「全五步」与设计 §5.10 已改的 ①–④ + ⑤⑥ 不符，本轮就地改成「全六步」（一致性面、本节写域内）。

### 设计档收正（本批终态 · 2026-11-10）

实施席交办三处，已按代码实读收正；另附一条证据更正与一条上抛。

- **§5.4 两条可见行 + §5.8 已接判据 ④ = 两端**：落地端写明 CLI ∥ VSC（CLI `pushLine` / VSC `thincoder-vscode/webview/chat-messages.js` 的 `addInboxLine`），桌面两条可见行明写「不接」，④ 改为「CLI ∥ VSC 逐字一致」并声明不覆盖桌面。理由 = 桌面渲染面对未登记的通道原引用（post 过去零显示）⇒ 渲染面登记之前写「三端同形」就是一句假话。
- **§5.8 VSC 行切槽点 = 撤旧立新（重臂）**：武装点增「切槽重臂（`thincoder-vscode/src/extension/panel-session.mjs` 的 `loadSession` 调 `syncInboxWatch(panel)`）」，撤闩列删掉 `loadSession` 那一格并写明原因（timer 闩按在途 timer 现算、撤与不撤等价；取件闩撤了就没人再装）。与 D-MI31「只有退出 / 面板销毁撤得掉」对齐；判据 = 本表 A10。
- **`docs/vsc/design/WEBVIEW-PROTOCOL.md` §3.2 / §12 / D-P11：三十五项 → 三十六项**：新增 `inbox` 行（host → webview；`{ text }` = 核逐字串；发射 = `thincoder-vscode/src/extension/timer-watch.mjs` 的 `syncInboxWatch` 两处；消费 = `addInboxLine`）。三处计数同改（节标题 · 纪律句「行 1–36」· D-P11）。
- **§5.8 Desktop 行拆成两件事**：撤闩面 = `thincoder-desktop/src/main/suspension-drive.mjs` 三处 `timers.disarm(key)`（入窗 · 会话清除面 · 切项目级联 `disarmAll`），该端 `suspension-timers.mjs` 的 `disarm` 内含 `inbox.disarm(key)`；回合起点**无**撤闩面。
- **§5.8 分层结论的行数同步**：VSC 接线由「三处」改为「六处（武装三 · 撤闩三）」——切槽重臂与转空工作区两处原表未计。

- **证据更正（父侧交代里的一处读数）**：
  - 原话「CLI `inboxWatch` 穷举 4 处、无任何 `.disarm()` 调用点」。
  - 实读 `thincoder-cli/src/tui/index.mjs` 有 `process.on("exit", () => { turnCtx.inboxWatch?.disarm(); unregisterInstance() })`。
  - ⇒「无任何 `.disarm()` 调用点」不成立；结论「CLI 无切槽撤闩」仍成立（该点在退出钩子，不是切槽）。§5.8 CLI 行按实读写，行为未因这条读数改动。

- **[上抛·待裁] 桌面入窗处也撤取件闩**：
  - 事实：`thincoder-desktop/src/main/suspension-drive.mjs` 的入窗分支调 `timers.disarm(key)`，而该端 `suspension-timers.mjs` 的 `disarm` 内含 `inbox.disarm(key)` ⇒ 入窗把取件闩一并撤掉。
  - 重臂要等出窗结算的 `sync` 跑到，而入窗不是会话死亡。
  - 与 D-MI31「装上之后只有退出 / 面板销毁撤得掉」不是同一句话；症状与 VSC 切槽点同族（闩死到下一次结算）。
  - 已在本档 §5.8 桌面行标 `open`；裁定权在桌面面那一轮，本批不改桌面代码。

### 评审轮 7 处置（2026-11-10 · 设计席 · 文档小形项当轮修）

七条全落地、零留待。一条（🔵#8）的**前提被实读推翻**，按真形态写、不按交代的措辞写——见上抛项。只改设计档，未动产品面。

| # | 严重度 | 处置 | 改在哪 + 改后的原话 |
|---|---|---|---|
| 2 | 🟡 | 已修 | `WEBVIEW-PROTOCOL.md` §3.2：第 35 ∥ 36 项之间的空行已删，两项现同表连排。计数无须改——标题「三十六项」与纪律句「行 1–36」本来就对，坏的是表块被一个空行截断（另 35 项之间都是连排） |
| 1 | 🟡 | 已修（两处） | ① `MULTI-INSTANCE-COLLAB.md` §5.4 自续闩条：「**例外两处，均在 §5.8 端装配表里点名**：VSC 转空工作区、桌面入窗（后者与 D-MI31 的对齐 = `open`，上界见 §5.9）」② 同档 §5.9 新增条「**桌面入窗会撤一次取件闩**」，带上界（入窗期间消息不被取走 ⇒ 出窗结算后 ≤ `INBOX_POLL_MS` 取走；此间开轮失败则桌面只有日志面、无可见行）与到期条件。转空工作区按交代只补限定、不重开 |
| 3 | 🟡 | 已修 | 同档 §5.8 核三档清单的 `thincoder-core/instance-inbox-watch.mjs` 行补两名：「**inboxTakeLostLine(messages) / inboxBlockedLine(ms, pending)**（§5.4 两条可见行的**唯一构造点**——三端只调不算，N-MI2 逐字对拍因此可机检）」 |
| 4 ∥ 5 | 🟡 | 已修 | `WEBVIEW-PROTOCOL.md` §3.2 表后新增「**第 36 项 `inbox` 的落点依据**」：最近先例 = 第 19 项 `timer`，对齐三项（方向 / 落法 / 发射点）· 偏离三项各有据（载荷只 `{text}` · 渲染零裁行 · 文本源由核构造）；调研面写明查了 `docs/vsc/design/` 全目录（`落流行` ∥ `addTimerLine` ∥ `系统行` 零命中）+ 本档 §12 收面表 + 设计 §5.4 两条模板 ⇒「无通用系统落流行既有件」落字 |
| 6 | 🟡 | 已修 | 同档第 36 项载荷格：「**既有件候选 = `existing but unusable: timer`**（同键 `type` 覆盖 + timer 专族载荷 `status:"fired"`）」；表后三问答（何处住 · 逐字名 `inbox` · 谁用 = `syncInboxWatch` 两径 / `addInboxLine`） |
| 7 | 🟡 | 已修（含一次量法） | 设计 §5.8「受影响文件与分层结论」增「**两条可见行的渲染落点**（CLI `thincoder-cli/src/tui/index.mjs` 的 `pushLine` 调用点；VSC `thincoder-vscode/webview/chat-messages.js` 新增 `case "inbox"` + `addInboxLine`）」；tier 结论行补「渲染落点……已连同接线档按下方量法一并量过，未越软线」。量法 = `doc_check({mode:"report", lines: 10 档})` ⇒ 越硬限 0 · 越软线 0（最大 = `agent-turn.mjs` 434 行；`chat-messages.js` 319 行）⇒ **无拆分方案**，不必停手 |
| 8 ∥ 9 | 🔵 | 已修（前提被推翻） | 同档 §5.4 桌面那半句重写：删「原引用」；事实改为「**通道本身已登记**：`docs/desktop/design/IPC.md` 的 `ev:inbox { key, kind, text }`，渲染面消费 = `[data-inbox]`（`renderer/events-wake.mjs` ∥ `renderer/views/chat-chrome.mjs` 的 `syncInbox`）——缺的是宿主发射面，不是渲染面」；到期条件随之改为「宿主两径接上 `ev:inbox` 那一轮，届时本条改写为三端同形」；同轮把 §5.8 Desktop 行的 `open` 到期条件对齐成同一句（原文「桌面渲染 / 撤闩面那一轮收口」在两处并存时会把「登记」与「出线」混为一谈） |

### 上抛项（本轮新增）

- **[上抛·待裁] 🔵#8 的措辞交代与实读冲突，未按交代写。** 交代要求改成「桌面渲染面对未登记的通道**零消费**（post 过去也零显示）」；实读三处与之矛盾：
  - `docs/desktop/design/IPC.md` 已登记该通道（原文「`ev:inbox` | **跨实例取件面行痕（行痕族第四员）**」）。
  - `thincoder-desktop/renderer/events-wake.mjs` 已在消费（原文「`ev:inbox`——跨实例取件行切片（按会话 `key` 分槽 · **一类一槽**）」），`renderer/views/chat-chrome.mjs` 已有 `syncInbox`。
  - 未接的是**宿主发射面**：`thincoder-desktop/src/main/suspension-timers.mjs` 与 `timer-watch.mjs` 两处注释实读为「`onBlocked` 同理不接」∥「无受阻可读面」。
  - ⇒ 照交代写会落一句假话，我写了真形态。**待裁的只有一点**：桌面两条可见行「本批不接」这个结论是否照旧成立——我认为成立（差的是接线，不是登记），若你要的是「按原措辞写」，请指明。
- **[上抛·知会] manifest 的 `index.docCheckExemptions` 有 4 条登记未命中**（`doc_check` 两次报告均报「登记未命中 4 条（原文已变或已不在判集，复核后删）」）。manifest 属主 agent 写域，本轮未动。

### 本轮自检（交付门读数）

```text
doc_check gate（本档 + WEBVIEW-PROTOCOL 两档，整档判）      ⇒ DOC-CHECK GATE: PASS（0 命中）
WEBVIEW §3.2 表块自检（node 行扫描）                          ⇒ rows=36 seq_ok=true first=1 last=36 · count_phrases=3
doc_check report（lines = 10 档源档）                          ⇒ 越硬限 0 · 越软线 0
```

- 引用 ↔ 标题：本轮新写的 `§5.4` / `§5.8` / `§5.9` / `§3.2` / `§12` 全部在盘，无悬空引用。
- 表行 ↔ 计数：§3.2 = 36 行、序列 1–36、三处计数句（节标题 · 纪律句 · D-P11）一致。
- 断言 ↔ 实测：上表「未越软线」是`doc_check` 本轮的读数，不是预算；「通道已登记」是 `IPC.md` / `renderer` / 主进程三处的实读原文。
- 未改：产品面零改动；未派实施、未发评审（按交代，由父侧收口）。

## §3 设计评审（评审子代理）
**状态行**：评审通过



### 轮次 1（评审子代理）

| # | 严重度 | 状态 | 证据 |
|---|---|---|---|
| 1 | 🔴 | 未处置 | `docs/core/design/MULTI-INSTANCE-COLLAB.md` §5.8「判据（测试层 · 单元档…）」①–⑧ 与「已接判据（三端同形）」①②③ 均无 `ev:inbox-watch-take-lost` ∥ `ev:inbox-watch-stall` ∥ `onStall` 断言；§5.6「失败可见」只作陈述「四条失败面都有人说话」 |
| 2 | 🔴 | 未处置 | 同档 §5.10「delta（本轮）」＝「破 **0** 行 · 冗余 **0** 行 · **改 1 行**」；所定行 46-1 的「怎么算通过」①–⑤ 无 stall ∥ take-lost 断言，且未声明这两条新可见失败面为何无需用例 |
| 3 | 🟡 | 未处置 | D-MI33 理由「「门在位但门不开」…与「门没了」对用户是同一个结果」；但其判据「一条内存计数器 + 每阈一次 stat」住在拍的循环内 ⇒ 无拍则无探测器，"门没了"类无探测器 |
| 4 | 🟡 | 未处置 | §5.4「一拍 = **先重臂、再试取件**（`inFlight` 标志防重入：上一拍还没跑完 ⇒ 本拍跳过，定时器照常走下一拍）」；D-MI31「只要进程在、闩就在」未写成无条件不变式（重臂不得落在任何可抛分支之内） |
| 5 | 🟡 | 未处置 | §5.4「只在目标没有在飞一轮时取件」+「**`isBusy` 的定义域 = 「有活干」**」；「取走」与「在飞回合成为真」之间的次序无规定 ⇒ 该窗口内新到一条可起第二轮 |
| 6 | 🟡 | 未处置 | §5.4「落法」条「核 `prepareRun` 在 `!resume` 时无条件把这一串落成 user 消息」；取件开轮是否恒为 `resume=false` 未写，`resume=true` 时取走即静默 |
| 7 | 🟡 | 未处置 | §5.10「现盘故事号 CLI 1–45」与盘上 `test/RTM.md`「| CLI 46 | 跨实例发消息：一条消息送进另一实例并起一轮，回程带请求号 |」及 `test/rtm/tooling.md`「## CLI 46.」不符；盘上 46-1「异常」列有「同档末段 = 目标不可达」断言，本档 §5.10 行该列为「无」 |
| 8 | 🟡 | 未处置 | §5.1 自引「其它注入面（用户排队消息 / peer 提醒 / stall / goal / task 提醒）**零唤醒面**」⇒ 既有 stall 面在册；D-MI33 ∥ `onStall` ∥ `INBOX_BUSY_STALL_MS` 无三问答（何处住 · 逐字名 · 谁） |
| 9 | 🟡 | 未处置 | §5.9 只登记 pid 复用面「回执仍说「已送达」」；D-MI32 的 take-lost 只到「目标端可见行」，发送方回执不更新、该边界未登记 |
| 10 | 🟡 | 未处置 | §5.4「源壳 `onStall(ms, pending)` 可见行」无逐字锚、无端渲染形态——与 §3.2 ∥ §4.3 ∥ §4.4.4 的逐字契约体例不一致 ⇒ N-MI2 跨端对拍不可机检 |
| 11 | 🔵 | 未处置 | §6「config.json 原子写（F5）」之下直接为「### 6.2」，无 6.1 |
| 12 | 🔵 | 未处置 | 规范面留改期标记：§3.1「**探测束与有界形态（2026-09-18 · F-MI7）**」· §3.2「**异步形态（TUI 假死 · 2026-09-18）**」 |

四项核查结论：① 自续闩对 P1–P4 类是结构性消除（D-MI31 删掉「靠别人重臂」这条依赖，非逐条打补丁），但不变式表述缺两处（#4 / #5）；② R2 出口能兑现「目标侧有人说话」，发送侧不兑现且该边界未登记（#9），`resume` 一路是真静默丢（#6）；③ R3 只覆盖「在拍但不取件」，覆盖不到「无拍」（#3），三端同规不可机检（#10）；④ 对照需求档 N-MI8「不阻塞 ∥ 不打断 ∥ 失败可见」三腿仍成立，缺口即 #9。
tier 抽查：§5.8「受影响文件与分层结论」结论「一个文件都不跨层」与实测相符（所抽既有档与新三档均未越软线）。

VERDICT: changes-required

计数：🔴 2 · 🟡 8 · 🔵 2（共 12）

### 轮次 2（评审子代理）

### 第 2 轮 · 上轮 12 条逐条核对 + `onBlocked` 改名成立性

| # | 严重度 | 状态 | 证据（指针） |
|---|---|---|---|
| 1 | 🔴 | 已修 | §5.8「判据（续 · 本批两条新可见面，各自可红）」⑨「开轮失败留痕」+ ⑩「受阻跨阈」各带可红断言；§5.8「「已接」判据（三端同形）」由三条改「**五条断言**」，新增 ④「两条可见行三端逐字一致」· ⑤「一拍抛出不影响下一拍」 |
| 2 | 🔴 | 已修 | §5.10「怎么算通过」条「其后**增 ⑤⑥**」+ 同节「为什么 ⑤⑥ 进集成用例、而不是只在单元档」 |
| 3 | 🟡 | 已修 | §5.4「这个探测器的覆盖边界（写明，不冒充全覆盖）」+ D-MI33「**覆盖边界**：探针住拍内 ⇒ 只覆盖「在拍但不取件」」·「残留 = 宿主事件循环被独占 ∥ `unref` 闩被误退，两者无探测器（本批不加）」 |
| 4 | 🟡 | 已修 | §5.4「**重臂是无条件不变式**（不是「通常先做」）…且重臂本身不进 `try`」；判据 = 已接 ⑤ |
| 5 | 🟡 | 已修 | §5.4「**取出之后的交接契约**…不指望 `isBusy()` 及时翻真…靠闩自己的标志」（该修复自身带出新缺陷 = 本轮 #13） |
| 6 | 🟡 | 已修 | §5.4「**取件开轮恒为 `resume=false`**…端壳若在取件路径上拿到 `resume=true`，按「开轮没成」出口处理」 |
| 7 | 🟡 | 已修 | §5.10「现盘故事号 **CLI 1–46**」+「逐格说清哪格动、哪格不动」+「异常」列「盘上「目标不可达」那条**保留不动**」；盘上 `test/RTM.md`「| CLI 46 |」与 `test/rtm/tooling.md`「## CLI 46.」下 46-1 行逐格相符 |
| 8 | 🟡 | 已修 | §5.1「新造词三问答（D-MI31 ∥ D-MI32 ∥ D-MI33 的新可见面）」三支齐；`blocked` 理由所举三处既有 `stall` 逐条带符号，实核均在盘 |
| 9 | 🟡 | 已修 | §5.9「**开轮没成的样子只落在目标侧**（D-MI32 的边界）…**不回送、不更新回执**」 |
| 10 | 🟡 | 已修 | §5.4「**两条可见行（逐字锚 · 三端同形 · N-MI2 对拍）**」两条模板 + 四个占位定义 + 已接 ④ 逐字对拍 |
| 11 | 🔵 | 已修 | §6 补齐「### 6.1 双管齐下（D-F5a + D-F5b）」；外部引用者 `docs/core/design/SETTINGS-TOOL.md`「语义权威 = `MULTI-INSTANCE-COLLAB.md` §6.2」在新编号下正指「writeConfigAtomic 语义」 |
| 12 | 🔵 | 已修 | §3.1「**探测束与有界形态（F-MI7）**」· §3.2「**异步形态（消 TUI 假死）**」——改期括注去净（全文 `2026-` 仅剩 D-MI27 理由内的用户口径时间戳） |
| 13 | 🔴 | 新 | §5.4「假而标志仍在 ⇒ 开轮没成为真，走 D-MI32 出口并清标志」对「下一拍」只做一次 `isBusy()` 观察即判死，而同条又写「不指望 `isBusy()` 及时翻真」；叠加 §5.4「起的轮 = 普通用户回合**（`autoTurn:false`）**：手动态照常走审批面」⇒ 审批未批 / 短轮皆被判丢失 |

**改名判定：成立。** 逐条依据：

- 三处既有 `stall` 实核在盘：`thincoder-core/advisor/run.mjs`「onStallRound: callbacks?.onStall」。
- 第二处：`thincoder-core/i18n.mjs`「停滞轻显形」。
- 第三处：`thincoder-core/agent-tools/subagent-scheduler.mjs`「export function detectStall(parent)」。
- 设计档内新名一致：`onBlocked` / `INBOX_BLOCKED_MS` / `ev:inbox-watch-blocked` / `-blocked-empty`。
- 旧名零残留：`INBOX_BUSY_STALL_MS` ∥ `ev:inbox-watch-stall` ∥ `onStall(ms, pending)` 全仓零命中（仅本批 §3 轮次 1 证据格引用旧名 = 历史记录）。
- 代码层残留未核（声明排除）。

**四项核查：**

- ① 自续闩为结构性消除（删掉「靠别人重臂」这条依赖），无条件重臂已写成不变式并有判据。
- ② R2 出口两端可见（目标侧行 + 事件），发送侧不更新回执已在 §5.9 登记，`resume` 一路已堵。
- ③ R3 只覆盖「在拍但不取件」，边界已写明、残留已登记但无探测器。
- ④ 需求档 N-MI8「不阻塞 ∥ 不打断 ∥ 失败可见」三腿仍成立。
- 新缺 = #13（交接标志的判死口径）。附加：本轮 §3 状态行不签——verdict 非 pass。

VERDICT: changes-required

计数：🔴 1（新）· 🟡 0 · 🔵 0；上轮 12 项全部落地。

### 轮次 3（评审子代理）

本轮范围 = #13 一条 🔴 修复验证 + 三条一致性面 + 挂死边界的可接受性判定。上轮 12 条按对象声明不重判，状态沿用「已修」（本轮仍逐条核过在位）。

| # | 严重度 | 状态 | 证据（指针） |
|---|--------|------|--------------|
| 1 | 🔴 | 已修 | §5.8「判据（续 · 本批两条新可见面，各自可红）」⑨「开轮失败留痕」+ ⑩「受阻跨阈」各带可红断言 |
| 2 | 🔴 | 已修 | §5.10「其后**增 ⑤⑥**」+「为什么 ⑤⑥ 进集成用例、而不是只在单元档」条 |
| 3 | 🟡 | 已修 | §5.4「这个探测器的覆盖边界（写明，不冒充全覆盖）」∥ D-MI33「覆盖边界」 |
| 4 | 🟡 | 已修 | §5.4「**重臂是无条件不变式**（不是「通常先做」）」+ 已接判据 ⑤ |
| 5 | 🟡 | 已修 | §5.4「取出之后的交接契约：失败只有一个真源 = `onTake` reject」 |
| 6 | 🟡 | 已修 | §5.4「**取件开轮恒为 `resume=false`**」+ 拿到 `resume=true` 走同一出口 |
| 7 | 🟡 | 已修 | §5.10「现盘故事号 **CLI 1–46**」·「改 1 行」·「「异常」…保留不动」 |
| 8 | 🟡 | 已修 | §5.1「新造词三问答」+ `blocked` 与三处既有 `stall` 的逐条区分 |
| 9 | 🟡 | 已修 | §5.9「**开轮没成的样子只落在目标侧**（D-MI32 的边界）」 |
| 10 | 🟡 | 已修 | §5.4「**两条可见行（逐字锚 · 三端同形 · N-MI2 对拍）**」两条模板 + 占位定义 |
| 11 | 🔵 | 已修 | §6 已有「### 6.1 双管齐下（D-F5a + D-F5b）」，6.2 接「writeConfigAtomic 语义」 |
| 12 | 🔵 | 已修 | §3.1「**探测束与有界形态（F-MI7）**」· §3.2「**异步形态（消 TUI 假死）**」日期括注去净 |
| 13 | 🔴 | 已修 | §5.4「闩**不拿 `isBusy()` 的一次读数推断失败**」+「失败只有一个真源 = `onTake` reject」；§5.8 已接判据由五扩六，⑥「两条「不是失败」的状态」逐条点红两种旧形态；「已交出」全档零命中，D-MI31 与模块行均写「resolve = 已登记为在飞，reject = 开轮没成」 |
| 14 | 🟡 | 新的（建议） | §5.4「**边界（写明，不冒充覆盖）**」只写到「闩不再取件」，未写后果：待取累积 / 无可见行 / 24 h 清扫才记 logEvent / 重启即清 |
| 15 | 🔵 | 新的（建议） | §5.4「resolve ⇒ 下一拍 `isBusy()` 为真」与已接 ⑥「下一拍 `isBusy()` 已回假」需读成条件句（短轮除外） |

挂死边界判定：**可接受**。拒绝理由成立（开没开成无从判定，硬判死会复引入本轮刚拆掉的误判路；D-MI33 只盯 `isBusy()`，如实标「不给挂死新增探测器」）；但后果只写到闩侧，未写到用户侧（见第 14 行）。

三条一致性面：① 交接契约已改成失败单源 = `onTake` reject，原「假而标志仍在」句全档零命中（已删，非标注作废）；② 已接判据五扩六，⑥ 能分别点红「短轮」（报丢失）与「审批悬挂」（报丢失 + 起第二轮）；③ 已交出标志无残留，新契约与 D-MI32 的 reject 口径不打架（D-MI31 写「失败单源」，⑨ 写「只有 `onTake` reject 一条路走到这里」）。

VERDICT: pass

计数：🔴 0 · 🟡 1（建议）· 🔵 1（建议）。上轮 #13 已修，无新增 🔴。

### 轮次 4（评审子代理）

> 状态行重置：第 4 轮打回（changes-required）· 上一轮状态行 = 评审通过 → 进行中 · 2026-11-10

> 本轮对象 = **实施代码**（eng-coder 自包含交付协议的内部代码评审轮），不是 §2 设计文本的重判：上三轮设计结论沿用。

| # | 严重度 | 状态 | 证据（指针） |
|---|---|---|---|
| 1 | 🔴 | 待处置 | 设计 §5.4「两条可见行（逐字锚 · 三端同形 · N-MI2 对拍）」＋ §5.8 已接判据 ④ ＋ 批档 §2 受影响文件行「`onBlocked` 出面（逐字锚）」 vs `thincoder-desktop/src/main/suspension-timers.mjs` `createSuspensionTimers` 注释「**本端两条可见行不做**（本轮范围裁定）」——父侧裁定只在会话与代码注释里，设计档与 §2 仍写三端 |
| 2 | 🟡 | 待处置 | `docs/vsc/design/WEBVIEW-PROTOCOL.md` §3.2 纪律句「新增 / 变更一律入本节登记表」 vs `thincoder-vscode/src/extension/timer-watch.mjs` 新增 `type: "inbox"`（§3.2 行 1–35 与 §12 收面全量对表均无该行） |
| 3 | 🟡 | 待处置 | 设计 §5.8 已接判据 ⑤「一拍抛出不影响下一拍」在批档 §2 验收对照 A1–A8 与单元档里都无对应条（槽位静默缺失，未声明不收） |
| 4 | 🟡 | 待处置 | `thincoder-vscode/src/extension/timer-watch.mjs` 注释「`panel-session.mjs` `loadSession`）与 `timerWatch.disarm()` 同点」（设计 §5.8 表同列三点） vs `panel-session.mjs` 只调 `panel._timerWatch?.disarm()`，无 `disarmInboxWatch` |
| 5 | 🔵 | 待处置 | 单元档 A4b 以 `src.split("\n").find((l) => l.includes("isBusy:"))` 作静态判据——注释措辞一变即假红 |
| 6 | 🔵 | 待处置 | `inboxTakeLostLine([])` 被单元档锁成「0 lost ()」；核在 `messages.length === 0` 时提前返回 ⇒ 该形态生产不可达 |
| 7 | 🔵 | 待处置 | 行数读数本轮未取得（`doc_check` 报 `toolPromise?.catch is not a function`）——超软线 / 硬线档位属既有债，不随本批判 |

VERDICT: changes-required

计数：🔴 1 · 🟡 3 · 🔵 3（共 7）

### 轮次 5（评审子代理）

第 4 轮 = 实施轮内部代码评审核修复声明（对象 = 代码，非 §2 设计）。上轮 7 条逐条复读当前文件。

| # | 严重度 | 状态 | 证据（指针） |
|---|--------|------|--------------|
| 1 | 🔴 | 未处置 | 设计 §5.4「两条可见行（逐字锚 · 三端同形 · N-MI2 对拍）」句「（CLI `pushLine` / VSC 面板行 / 桌面键面行）」+ §5.8 已接判据 ④「三端各注入一次 `onTake` reject 与一次跨阈受阻」+ 批档 §2 受影响文件行「`onBlocked` 出面（逐字锚）」 vs `createSuspensionTimers` 注释「**本端两条可见行不做**（本轮范围裁定）」 |
| 2 | 🟡 | 未处置 | `WEBVIEW-PROTOCOL.md` §3.2 纪律句「新增 / 变更一律入本节登记表」 vs `syncInboxWatch` 的 `postMessage({ type: "inbox"`（§3.2 与 D-P11「三十五项」均无该行，全档 `inbox` 零命中） |
| 3 | 🟡 | 已修 | 单元档新增 `test("A9 一拍抛出不影响下一拍（已接判据 ⑤：「重臂不进 try」的可红面）"` |
| 4 | 🟡 | 已修 | `loadSession` 内 `panel._inboxWatch?.disarm()` 已接线 |
| 5 | 🔵 | 已修 | A4b 改为锚定 `createInboxWatch(` … `onTake:` 参数段并去行末注释 |
| 6 | 🔵 | 已修 | 「逐字锚」用例只锁 1/2 条形态，空列表形态已删 |
| 7 | 🔵 | 未处置 | 行数读数仍未取得（doc_check `execution_error`：`toolPromise?.catch is not a function`）——既有债，不升级 |
| 8 | 🔴 | 新 | `loadSession` 撤闩后无同点重臂：武装点全仓只有 `syncInboxWatch(this)`（面板创建）与 `finalizeTurn` 的 `syncInboxWatch(panel)`，而面板打开即经 `openSessionContent` 走 `loadSession` ⇒ 闩死到首轮结束 | 证据 = `panel._inboxWatch?.disarm()` ∥ 注释「存活不靠补位点」∥ 「名册条目不随切槽删」 |
| 9 | 🔵 | 新 | 单元档头注仍写「判据 = 批次档 §2「验收对照」A1–A6 ∥ A8」，A9 未登记进 §2「验收对照」（末行为 A8） |

修复方向（新 8）：撤闩点后同点补 `syncInboxWatch(panel)`（核允许空载体武装），或撤掉该第三点并在 §5.8 表回到两点。

计数：🔴 2 · 🟡 2 · 🔵 3（共 9 行；已修 4 · 未处置 3 · 新 2）

VERDICT: changes-required

### 轮次 6（评审子代理）

第 6 轮 = 评审轮 3（对象 = 轮 2 新 🔴#8「VSC 切槽点闩死窗口」修复验证；声明排除项照登、不重裁）。

| # | 严重度 | 状态 | 证据（指针） |
|---|--------|------|--------------|
| 1 | 🔴 | 已受理（父侧裁定 · 交办设计席） | 声明排除项：设计 §5.4 / §5.8 ④ 桌面行改动属写域父侧，代码不动 |
| 2 | 🟡 | 已受理（同上） | 声明排除项：`WEBVIEW-PROTOCOL.md` §3.2 登记行 |
| 3 | 🟡 | 已修 | 单元档 `test("A9 一拍抛出不影响下一拍…")` 在位，断言 `ft.armed()` 仍 1 |
| 4 | 🟡 | 已修 | `loadSession` 改为 `syncInboxWatch(panel)`（父侧裁定 = 重臂），A10 静态锁同点 |
| 5 | 🔵 | 已修 | A4b 锚 `createInboxWatch(` … `onTake:` 参数段 + 去行末注释 |
| 6 | 🔵 | 已修 | 「逐字锚」用例只锁 2 条形态，空列表形态已删 |
| 7 | 🔵 | 已受理 | 声明：行数读数已取（13 档，越硬限 0 · 越软线 0） |
| 8 | 🔴 | 已修（本轮目标） | `loadSession` 内 `syncInboxWatch(panel)`；核 `sync` = 「撤旧装新」且「载体暂时缺席也照装」⇒ 切槽后闩在位、死窗口闭合；A10「切槽点不得把取件闩撤死」防回归 |
| 9 | 🔵 | 未处置 | 单元档头注仍「A1–A6 ∥ A8」；批档 §2「验收对照」末行仍 A8（无 A9 / A10 行） |
| 10 | 🟡 | 新（非阻断） | `timer-watch.mjs` 注释仍把撤闩点写成含 `panel-session.mjs` `loadSession`，与 `syncInboxWatch(panel)` 的重臂相反；`disarmInboxWatch` 注仍「面板销毁 / 切槽 / 转空工作区三点」 |

VERDICT: pass

计数：🔴 未处置 0 · 🟡 新 1（非阻断）· 🔵 未处置 1（共 10 行；已修 5 · 已受理 3 · 新 1 · 未处置 1）

### 轮次 7（评审子代理）

**核对结论（三处收正 + 上抛两件）**
① `docs/core/design/MULTI-INSTANCE-COLLAB.md` §5.4「两条可见行」与 §5.8「已接」判据 ④ 均已写「CLI ∥ VSC」，两处都写明桌面不接且给了理由（未登记通道 ⇒ post 过去零显示）——已对齐。
② `docs/core/design/MULTI-INSTANCE-COLLAB.md` §5.8 VSC 行：`loadSession` 已落武装列（「**切槽重臂**……**不在撤闩列**」），撤闩列明写「**切槽不在此列**」——已对齐。
③ `docs/vsc/design/WEBVIEW-PROTOCOL.md` §3.2 标题、纪律句、D-P11 均作「三十六项」，`inbox` 行齐发射 ∥ 消费 ∥ 载荷，§12 亦在册；两份档「三十五」零命中——内容已对齐（登记表的**形式**见 #2）。
(a) CLI 行按实读写：撤闩面只写退出钩子 `process.on("exit")`，并写明「无切槽撤闩面（回合起点不撤）」⇒ 与「退出才撕」口径一致，无须改。
(b) 桌面入窗撕取件闩：判**不归本批代码面**（`open` 已带裁定权 + 到期条件 = 桌面渲染 / 撤闩面那一轮），但 §5.4 的不变式句须带这条例外——见 #1。

| # | 严重度 | 状态 | 证据 |
|---|---|---|---|
| 1 | 🟡 | 待处置 | `docs/core/design/MULTI-INSTANCE-COLLAB.md` §5.4「只有「退出 / 面板销毁」撤得掉它」 vs §5.8 VSC 撤闩列「`dispose` / view 销毁 / 转空工作区三处」+ Desktop 行「对齐 = **open**」 |
| 2 | 🟡 | 待处置 | `docs/vsc/design/WEBVIEW-PROTOCOL.md` §3.2：空行在 35 项后闭合表格，第 36 项 `inbox` 落在表外；纪律句仍写「行 1–36」 |
| 3 | 🟡 | 待处置 | `docs/vsc/design/WEBVIEW-PROTOCOL.md` §3.2 第 36 项「核 `inboxTakeLostLine(messages)` ∥ `inboxBlockedLine(ms, pending)`」——`docs/core/design/MULTI-INSTANCE-COLLAB.md` §5.8 核三档清单里两导出零命中 |
| 4 | 🟡 | 待处置 | `docs/vsc/design/WEBVIEW-PROTOCOL.md` §3.2 第 36 项无最近先例句；最接近先例 = 同表第 19 项 `timer`（host → wv append-only 落流行），对齐 ∥ 偏离未写 |
| 5 | 🟡 | 待处置 | `docs/vsc/design/WEBVIEW-PROTOCOL.md` 全档「调研」零命中——第 36 项这条增量无调研面证据句 |
| 6 | 🟡 | 待处置 | `docs/vsc/design/WEBVIEW-PROTOCOL.md` §3.2 第 36 项无新消息名 `inbox` 的三问答（既有件候选 = `timer` 通道） |
| 7 | 🟡 | 待处置 | `docs/core/design/MULTI-INSTANCE-COLLAB.md` §5.8「受影响文件与分层结论」未列渲染落点 `thincoder-vscode/webview/chat-messages.js`（`addInboxLine`）⇒「tier 结论：一个文件都不跨层」不覆盖它（本轮档围外，尺寸 unverified） |
| 8 | 🔵 | 待核 | `docs/core/design/MULTI-INSTANCE-COLLAB.md` §5.4「桌面渲染面对未登记的通道原引用」——grep 侧见 `docs/desktop/design/IPC.md` 已登记桌面 inbox 通道，该前提可能已被后批改写（unverified，本轮档围外） |
| 9 | 🔵 | 待处置 | `docs/core/design/MULTI-INSTANCE-COLLAB.md` §5.4 同句「原引用」读不通（应作「原样引用」/「未登记即不复用」） |

VERDICT: pass

计数：🔴 0 · 🟡 6 · 🔵 2（🟡/🔵 不阻断）

## §4 用户批准（主 agent）

## 用户批准（2026-11-09 · 2026-11-10）

- **起因（用户原话）**：「**刚才那边又给你发了条消息，咋你这边没收到？**」——跨实例消息**收得到首条、后续收不到**，且回程发不出去。
- **本批范围（用户原话）**：「**取件侧响应的事儿你办一下**」（2026-11-09 23:42）。
- **父侧范围裁定**：本批**只修「取件闩静默变哑」**；身份族核查的撤除在另一批（`2026-11-09-cross-instance-message` 重开轮）内进行——**两批不合并**。依据 = 用户 23:45「**你再开个批档不就完了，何必非要塞进一批呢？**」
- **对「桌面两条可见行不做」的裁定与后续纠正**：父侧先裁「不做」（九档 + 跨层计数 + 无 Electron 无法真验），**用户 2026-11-10 00:15 一句「为啥不做桌面端啊！」推翻**——父侧自纠两处：①「代价大」不是「不做」的理由，只决定怎么验；② **放行 VSC（同样缺宿主、同样只能记「已接未验」）却卡住桌面，同一条理由两端相反结论 = 是借口不是理由**。桌面行痕第四员**另开批** `2026-11-10-desktop-inbox-trace` 承接（台账 `#2254`），本批的「桌面不接」是**范围**，不是缺陷。

## §5 实施记录（eng-coder）

### 实施摘要（2026-11-09 轮 · 实施子代理）

**本体 = R1 自续闩 + R2 / R3 两条可见面**：核 `instance-inbox-watch.mjs` 重写 + 三端接线。核心形状（对 §2 与设计 §5.4）逐条如下。

- **拍序**：`fire()` 第一行 `sync()`——在 `isBusy` / `getAgent` / 取件 / `onTake` 之前、**不进 `try`**；随后 `inFlight` 防重入。
- **取件段**（`attempt()`）：判忙（真则只维护受阻计数、零 fs）→ 判载体 → 取件 → `await onTake`。
- **交接**：resolve = 已登记为在飞；reject = 开轮没成 → `ev:inbox-watch-take-lost`，消息已离盘、不重投。
- **受阻**：`INBOX_BLOCKED_MS = 5 min`，每跨一阈一次目录 stat；待取非空 → `ev:inbox-watch-blocked` + `onBlocked(ms, pending)`，空 → `-blocked-empty` 不出行。
- **文案单源**：两条可见行由核导出 `inboxTakeLostLine(messages)` / `inboxBlockedLine(ms, pending)`，三端只调不算（杜绝三份手抄）。

| # | 条目 | 状态 | 落点 |
|---|---|---|---|
| R1 | 取件闩自续（先重臂再试取件 · `inFlight` · `onTake` 交接契约 · 回合起点不撤 · 补位点幂等 · `timerRearmBlocked` 只包 timer 闩 · 取件开轮恒 `resume=false` · 三端同规） | ✅ 三端已落 | 核 + CLI（`agent-turn.mjs` 链尾移出守卫；`index.mjs` 接线与退出撤闩）+ VSC（`timer-watch.mjs` 判忙去掉「还没有载体」；`panel-chat.mjs` 撤回合起点撤闩；`panel-session.mjs` 切槽点改重臂）+ 桌面（`timer-watch.mjs` promise 透传；`suspension-timers.mjs` 交接面；`turn-driver.mjs` 撤回合起点调用并删 `disarmInbox` 入口） |
| R2 | 开轮没成当场明说（`ev:inbox-watch-take-lost` + 逐字丢失行） | ✅ CLI / VSC；❌ 桌面（父侧裁定本轮不做） | 核记事件（`msgIds` 落逗号串）；CLI `pushLine`；VSC host `postMessage` + webview `addInboxLine` |
| R3 | 闩受阻跨阈出声（`ev:inbox-watch-blocked` + 逐字受阻行） | ✅ CLI / VSC；❌ 桌面（同上） | 核 `noteBlocked()`；CLI `onBlocked` → `pushLine`；VSC → webview 行 |
| A1–A10 | 验收对照 | ✅ 全部有可红判据 | 单元档 12 条（A1 · A2 · A3 · A4 · A4b · A5 · A6 · A8 · A9 · A10 · 逐字锚 · cleanup）+ 集成档 ⑤⑥ |

### 决策与披露（做了什么 / 为什么 / 影响）

1. **桌面两条可见行不做**（父侧 2026-11-09 裁定「不放行桌面端」）。本端**不 post 未登记通道**——桌面渲染面 `reduce` 对未登记通道「原引用」，post 了也是零显示，等于写了个谎；`onBlocked` 亦不接。桌面保留 R1 本体。**影响**：桌面侧两条失败面只有日志面，无用户可见行；另批 `2026-11-10-desktop-inbox-trace` 承接渲染面那一族（9 档 + 跨层计数 25→26），本批不碰桌面渲染面。
2. **VSC 新增 host→webview 消息类型 `{ type: "inbox", text }`**（host 一行 + webview `addInboxLine`）。VSC 没有通用系统落流行（`timer` 行是 timer 专族、同键覆盖），故按「新增一族」落地，形同 `addTimerLine`（append-only、零 state 槽）。**尚未登记进 `docs/vsc/design/WEBVIEW-PROTOCOL.md` §3.2 / D-P11「三十五项」表**——设计档写域不在实施席，已交办。
3. **两条行文案住在核**。三端只调用不拼串，N-MI2 跨端逐字对拍因此可机检；`{n}` 由 `msgIds` 列表长度现算，两个数不会互相打脸。
4. **`ev:inbox-watch-take-lost` 的 `msgIds` 落成逗号串**而非数组。`logEvent` 只收串 / 数 / 布尔，数组会被整字段丢弃（读 `thincoder-core/log.mjs` 的 `logEvent` 字段分支）；丢了它，这条事件只剩「有人丢了一条」，点不出是哪条。
5. **`onTake` 不再接受同步 `true`**；「已登记为在飞」的判读锚点各端不同，三处均**本轮实读确认（非推断）**。CLI 读 `state.processing`（`runAgentTurnBody` 同步前缀已置、首个 `await` 之前）；VSC 读 `panel._turnState === "running"`（`_publishTurnState` 首句 `this._turnState = state`，调用点在 `runPanelChatImpl` 首个 `await` 之前）；桌面读 `busyOf(key)`（`executeTurn` 同步前缀 `flights.set(key, controller)`）。三处都不拿判忙谓词的一次读数判死，判的是「开轮面有没有把这一轮登记进在飞表」。
6. **VSC 切槽点 = 撤旧立新（重臂），不是撤闩**（父侧 2026-11-10 放行）。`loadSession` 由 `panel._inboxWatch?.disarm()` 改为 `syncInboxWatch(panel)`。

   理由 = 两档冲突的原文：D-MI31「**闩的在位不依赖任何别的代码路径**——装上之后，只有「退出 / 面板销毁」撤得掉它」 vs 设计 §5.8 端装配表把 `loadSession` 列进撤闩点「与 `timerWatch.disarm()` 同点」。

   **§5.8 那一格是把 timer 闩的语义抄了过来**：timer 闩按「在途 timer」现算，切槽撤掉与不撤等价；取件闩撤了就**没人再装**（全仓武装点只有面板创建与回合尾两处），而名册条目不随切槽删 ⇒ 发送方拿到「已送达」、消息躺在 inbox 无人取。**这是设计档要修的地方**（§5.8 那一格与 D-MI31 不对齐），设计档不动，已交办设计席。
7. **集成夹具加假钟 + 假定时器**（`_setPeerMessageTestImpl({ nowFn, timer, clear })`）。原来 `tick` 直呼 `watch.fire()`，闩死没死在读数上看不出；改成「跑掉队里那一拍」= 真宿主同形，`armed` 才能作 A1 / ⑤ 的可红读数；假钟让 `{ms}` 逐字可断言（不靠真实等待跨 5 分钟）。
8. **`disarmInbox` 入口整个撤除**（桌面 `suspension-timers.mjs` 返回值 + `turn-driver.mjs` 唯一调用点）。回合起点不撤闩是本批裁定，留一个没人调的入口 = 下一位读者以为它还该被调；全仓复扫 `disarmInbox` 零命中。
9. **CLI 退出钩子补 `disarm()`**（`process.on("exit", () => { turnCtx.inboxWatch?.disarm(); unregisterInstance() })`）。设计 §5.8 CLI 行写「退出流程撤闩并删名册条目」，原代码只删名册条目；闩是 `unref` 一次性定时器，进程走它也走 ⇒ 行为等价，此处补的是该行的字面形态，不是行为修复。
10. **`panel-turn-stages.mjs` 一句注释改正**（越清单）。原注释「回合起点撤闩在 `panel-chat.mjs`」描述的是本批已撤除的契约。

### 越清单改动（不在 spawn 声明表内，逐档一句）

- `thincoder-vscode/src/extension/panel-session.mjs`：切槽点撤闩 → 重臂（父侧 2026-11-10 放行，见决策 6）。
- `thincoder-vscode/src/extension/panel-turn-stages.mjs`：旧注释改正（决策 10）。
- `thincoder-vscode/webview/chat-messages.js`：新增 `case "inbox"` + `addInboxLine`（决策 2 的渲染面半）。
- `thincoder-desktop/src/main/turn-driver.mjs`：撤回合起点 `disarmInbox` 调用点（删入口必须同改调用面）。
- `docs/batches/2026-11-09-inbox-watch-rearm.test.mjs`：本段所属单元档（声明表内）。

### 交办设计席（实施席不写设计档）

- `docs/core/design/MULTI-INSTANCE-COLLAB.md` §5.4「两条可见行」条 + §5.8「已接」判据 ④：注明本批 = **CLI + VSC 两端**，桌面两条可见行另批（`2026-11-10-desktop-inbox-trace`）。
- 同档 §5.8 端装配表 VSC 行的撤闩点：`loadSession` 一格改成「撤旧立新（重臂）」，与 D-MI31 对齐（决策 6）。
- `docs/vsc/design/WEBVIEW-PROTOCOL.md` §3.2 登记表 + D-P11 计数（三十五项 → 三十六项）：新增 `inbox` 行（host → webview；`{ text }` = §5.4 两条逐字行；发射点 `thincoder-vscode/src/extension/timer-watch.mjs`；消费点 `webview/chat-messages.js` 的 `addInboxLine`）。
- `thincoder-vscode/src/extension/timer-watch.mjs` 两处注释仍写「切槽 / `loadSession`」为撤闩点（`syncInboxWatch` 头注、`disarmInboxWatch` 注）：代码行为已是重臂，注释待同批删正（属代码注释，可由实施席在下一轮一并做）。

### 审计与评审轮次（终态 = `clean`）

| 轮 | 类型 | 结论 | 处理 |
|---|---|---|---|
| 1 | 内部偏离审计（explore · 只读） | 七条结构判据全「符合」；报 3 处 doc-drift（越清单 3 档、`panel-turn-stages.mjs` 旧注释、§2 桌面行 vs 裁定） | 旧注释当场改；越清单档进本段披露；§2 桌面行交父侧 |
| 2 | 代码评审 round 1 | 🔴1（设计 §5.4/§5.8 ④ 与 §2 桌面行 vs 代码）、🟡3、🔵3；changes-required | 可动面即修：补 A9（设计已接判据 ⑤ 原无用例）、A4b 改锚、删生产不可达的空列表逐字锚；对 🟡#4 提出反证——`panel-session.mjs` 实有 `panel._inboxWatch?.disarm()`（评审只搜包装名 `disarmInboxWatch` 故漏） |
| 3 | 代码评审 round 2（只核修复声明） | 🟡#3/#4/#5/#6 已修；🔴#1、🟡#2 判未处置（写域父侧）；🟡#7 行数读数工具报错未取；**新 🔴#8** = 切槽点撤闩后无同点重臂 ⇒ 面板打开 / 切槽后闩死到首轮结束 | #8 需动 VSC 第三档，父侧交代过「冒出第三档立刻停手报我」⇒ 上抛待裁；父侧 2026-11-10 放行后按 D-MI31 改重臂 |
| 4 | 代码评审 round 3（只核 #8 修复） | 🔴#8 已修（`syncInboxWatch(panel)` + A10 静态锁）；#1 / #2 / #7 按父侧裁定「认可不修 / 读数已给」收口；余 🔵#9（A9 / A10 未登进 §2 表）与 🟡#10（注释旧口径）不阻断 | **VERDICT: pass** ⇒ 终态 `clean`（代码评审 3 轮 · 修复 2 轮） |

### 验证读数（命令 + 结果；读数只在本段，规格面不搬数）

```text
# 改前形态（本档未入 git，旧版按本会话开头实读的原文重建到临时档后跑，跑完即删）
OLD(改前) BUSY_TICK {"armedBeforeTick":1,"armedAfterTick":0}   IDLE_TICK {"armedBeforeTick":1,"armedAfterTick":1}
NEW(改后) BUSY_TICK {"armedBeforeTick":1,"armedAfterTick":1}   IDLE_TICK {"armedBeforeTick":1,"armedAfterTick":1}

node --test docs/batches/2026-11-09-inbox-watch-rearm.test.mjs      ⇒ pass 12 / fail 0
node --test test/integration/cross-instance-message.test.mjs        ⇒ pass 1  / fail 0（CLI 46-1 ①–⑥ + 末段）
node --check（13 档改动源档）                                        ⇒ 全部 Syntax OK
doc_check gate（test/rtm/tooling.md）                               ⇒ DOC-CHECK GATE: PASS
doc_check report（lines = 13 档）                                   ⇒ 越硬限 0 · 越软线 0（最大 434 行）
```

### 未完成（如实记）

- **桌面两条可见行 = ❌ 未做**：父侧裁定本轮不做；另批 `2026-11-10-desktop-inbox-trace` 承接。
- **VSC 两条可见行 = `⚠️ 已接未验`**：无 Electron / 无 VS Code 宿主可起，`type: "inbox"` 的渲染形态与 `panel._turnState` 的读取时序只有代码级判据（A4b / A10 静态断言 + 本轮实读），无真机读数。
- **桌面自续闩 = `⚠️ 已接未验`**：同上无真机；核侧 A1–A10 覆盖闩本体，桌面接线只有代码级判据。
- **三处设计档行未写**：交办设计席（见上）。
- **评审轮 3 的 🟡#10（`timer-watch.mjs` 两处旧口径注释）已在同轮改正**：两处注释现写「切槽点不是撤闩点，是撤旧立新（重臂）」并点名 `panel-session.mjs` 的 `loadSession` 调 `syncInboxWatch`（A10 锁），与代码一致。

## §6 验证与收口（父代理）

## 验证与收口（父侧）

### 验收读数（父侧亲自跑）

- `node --test docs/batches/2026-11-09-inbox-watch-rearm.test.mjs` ⇒ **`tests 12 · pass 12 · fail 0`**（该档收口删除，读数留此）。
- `node --test test/integration/cross-instance-message.test.mjs` ⇒ **`tests 1 · pass 1 · fail 0`**（`CLI 46-1` ①–⑥ + 末段）。
- `doc_check(mode:"gate")` ⇒ **`PASS`**。

### 失败面（本批最硬的一条读数）

先把**旧版**按本会话开头实读的原文重建、跑同一夹具，跑完即删：

```text
OLD  BUSY_TICK  armedAfterTick 0     ← 在飞一拍之后闩不在位
NEW  BUSY_TICK  armedAfterTick 1     ← 改后仍在位
IDLE_TICK       armedAfterTick 1     ← 两版都成立（空闲不变哑）
```

**「0 → 1」这一格就是本批的全部意义**：闩的存亡不再取决于「这一拍落在不在回合里」。

### 落地核对（核 + 三端）

- **核**：`fire()` 第一行**无条件重臂**（在任何可能抛出的调用之前、**不进 `try`**）⇒ `inFlight` 防重入 ⇒ 判忙 ⇒ 判载体 ⇒ 取件 ⇒ `await onTake`。
- **交接契约**：`onTake` 返回 promise，**resolve = 该轮已登记为在飞，其余一律 reject** ⇒ 记 `ev:inbox-watch-take-lost`。失败**只有一个真源**。
- **CLI**：回合起点不再撤闩；链尾 `inboxWatch.sync()` 移出 `timerRearmBlocked`（守卫只包 timer 闩）；退出钩子撤闩。
- **VSC**：`isBusy` 去掉 `!panel?._agent`（「还没有载体」不算忙）；**切槽点由撤闩改为重臂**（`panel-session.mjs` 一行）；两条可见行经新 `type:"inbox"` + `addInboxLine`。
- **桌面**：自续闩 + 交接契约；两条可见行**本批不做**（另批 `#2254` 承接），**未 post 未登记通道**。

### 设计档收正（三轮）

1. **§5.8 端装配表 VSC 行与 D-MI31 打架**：原写撤闩含 `loadSession`「与 `timerWatch.disarm()` 同点」，而 D-MI31 写「只有退出 / 面板销毁撤得掉」。**成因 = timer 闩按在途 timer 现算（撤与不撤等价），取件闩撤了就没人再装**。已收正为「切槽重臂（撤旧立新，不在撤闩列）」。
2. **可见行改「CLI ∥ VSC」**：桌面不接（另批），判据 ④ 同步。
3. **评审 6🟡 + 2🔵 当轮修**：§3.2 登记表被一个空行截断（36 项落表外）；两条行文的构造点 `inboxTakeLostLine` / `inboxBlockedLine` 在原核清单里零命中（已补）；先例句 ∥ 调研面证据句 ∥ 三问答补 `existing but unusable: timer`；受影响文件清单补渲染落点 `chat-messages.js`（量后 **319 行**，未越软线）；§5.4「原引用」措辞改正。

### 设计席对父侧一次错误指令的裁定（记档）

父侧曾要求把 §5.4 写成「桌面渲染面对未登记的通道**零消费**」。设计席实读后**拒绝照写并上抛**——`docs/desktop/design/IPC.md` 已登记该通道、渲染面已有 `onInbox` / `syncInbox`；**缺的是宿主发射面，不是渲染面**。照写会落一句假话。

**父侧裁定 = 设计席对**：本批「桌面不接」的准确含义是**宿主不发射**，不是渲染面不认识；到期条件改为「宿主两径接上 `ev:inbox` 那一轮」。

### 已知边界（明写，不留白）

- **桌面入窗会撤一次取件闩**（`suspension-drive.mjs` 入窗分支 → `timers.disarm` 内含 `inbox.disarm`），重臂要等出窗结算；与 D-MI31 的对齐 = **`open`**，裁定权在桌面面，到期条件 = 桌面渲染 / 撤闩面那一轮收口。已写进设计 §5.9。
- **端侧入口既不 resolve 也不 reject（挂死）⇒ `inFlight` 永真、闩不再取件**：本批不加探测器（「一次未翻真即判死」正是本批删掉的那条误判路）。

### 真机验证（如实）

CLI 侧未跑真 TTY；VSC / 桌面无宿主可起（无 VS Code / 无 Electron）⇒ **行渲染与状态读取时序只有代码级判据**。桌面两条可见行**本批根本不做**。

### 集成测试面

- 未新增用例；`CLI 46-1` 改一格（①–④ 原意保留，⑤ 自续补位、⑥ 两条可见面新增）。集成集总量不变。

### 台账

- 本批行 `#2252` 走完 `在途 → 待核销 → 已核销`。

### 收口扫描

- **延后批复核**：无。
- **文档检查门**：`PASS`。
- **遗留**：无（本批范围内）。跨批残差 → `#2254`（桌面行痕，进行中）· `#2250`（名册清扫，认账不排期）。
