# 2026-11-14 · inbox-pickup-window
> 六段，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 每段只有一个作者：作者的段可 `append` 加内容、可就地改（`edit`）；非作者一概拒。
> 编制：主 agent · 2026-11-14 · 来源 = 用户 2026-11-14 报告「隔壁会话发的消息没收到」；主 agent 查到消息已在盘上、取件面长期判忙。用户随后给出行为要求并裁定「草稿不算忙」。。
> 台账 = #2416（core · 归批）。前情 = docs/batches/2026-11-14-tiny-knowledge-pointer.md（已收口 2026-11-14）。
## §1 讨论（主 agent）
**状态行**：已收口 2026-11-14
批起 sha = 99aeb7435f414378e5434caa03c27c6387e63fab

取窗说明：本批与 `#2415`（knowledge 检索）共用同一工作树，`#2415` 的 90 档在 `23578bb7` 才离树。收口前置门的「改动面」= 本会话写盘触达账 ∪ 提交 diff，故 `#2415` 的三档会落在本批改动面内；处置 = 由设计席在 §2 六 机读清单为这三档补行（读数按批起快照记），并注明非本批改面。批起 sha 不变。

### 本批做什么

让跨实例消息在「本端空闲」时一定被取走，无论有没有子代理在跑；本端有一轮在飞时不打断它，改在状态栏给出待取提示，轮末自动取走起轮。

### 已定决定

- **已定决定**：取件判据改为「已有一轮在飞」，挂起窗（等后台子代理结果）不再算忙 · 用户原话：「**主agent空闲，无论是否有子代理在运行，我都希望能收到投递。主会话在执行中，我不希望当前会话被打断，但是我希望状态栏能有消息提示。**」 · 时间：2026-11-14 14:2x
- **已定决定**：输入框里有草稿、未回车，不算忙（消息可以起一轮，草稿被输出顶掉属可接受代价）· 用户原话：「**不算，**」 · 时间：2026-11-14 14:28

### 现状机制（主 agent 实读）

- 消息确实到了：`~/.thincoder/inbox/25756-…/1794636686689-23716-eafe1f.json` 在盘，14:11:26 写入，至今仍是 `.json`（取走会改名再删）。
- 取件面持续判忙：日志 `ev:inbox-watch-blocked {ms: 900841, pending: 1, reason: "busy"}`，受阻计数从 14:00:41 起算，早于消息到达，从未归零。
- CLI 谓词：`thincoder-cli/src/tui/timer-watch.mjs` 的 `isBusy: () => Boolean(state?.processing || state?.suspended || state?._suspPending || modalOpen(state))`。
- `state.suspended` 由 `suspension-drive.mjs` 在整个 `suspensionSession` 生命周期内置真——**只要有后台子代理在跑就为真**，与「有回合在飞」不是一回事。
- 核心闩头注自述「只在目标没有在飞一轮时取件」，与 VSC 端一致，与 CLI ∥ Desktop 相反：三端对「忙」各答一遍。
- 结构性缺口：挂起窗内 timer 有投递路（`timerFace.deliver`），inbox 没有对应面，于是挂起窗内消息结构上不可达。
- 取件闩自续每秒一拍（`INBOX_POLL_MS`），挂起不停止轮询——**谓词一放开即可取件，不需要另加投递通道**。
- 输入通道现成：`state.pendingInput` 已作为 `inputQueue` 交给 `suspensionSession`，`takeTurnInput` 负责起轮。

### 边界（本批不做）

- 不改 `knowledge` 检索面（`#2415` 在途，另批）。
- 不改消息落盘格式 ∥ 名册 ∥ `instance_send` 事务语义。
- 不新增“读自己收件箱”的工具面入口（用户未要求；如需另开）。
- 不改 timer 的投递路径与射程。

### 勘察

- **库内 = 已查**：`thincoder-core/instance-inbox-watch.mjs`（闩本体）、`thincoder-cli/src/tui/timer-watch.mjs`（CLI 谓词）、`thincoder-cli/src/tui/suspension-drive.mjs`（挂起窗装配面）、`thincoder-desktop/src/main/timer-watch.mjs` ∥ `suspension-timers.mjs`（桌面谓词）、`thincoder-vscode/src/extension/timer-watch.mjs`（只认在飞回合，是对的）、`docs/core/design/MULTI-INSTANCE-COLLAB.md` §5.4 ∥ §5.6、`docs/core/requirements/MULTI-INSTANCE-COLLAB.md` §5。
- **库外 = B 类**：改动面全在本仓取件面与文档；外部断言 = 零。
- **悬空引用（本批顺手处理）**：`INBOX_POLL_MS` 的注释引「§5.6 延迟上界」，而设计档那一节只有「忙碌时不读 inbox；空闲时按当前间隔取件。」，没有任何上界数字。

### 授权

- 用户 2026-11-14 14:2x 给出行为要求（见已定决定），14:28 回答最后一处待裁项（草稿不算忙）。
- **自动推进**：本批全链（设计修 → 评审 → 实施 → 验证 → 收口）不需逐步确认。

### 上抛

- 无。

### 覆盖账

覆盖账 = #2416

### 设计席交付后 · 父侧裁决（送评审前）

**两条上抛的处置**：

- VSC 待取条数面：本批不做，挂台账行（需求 §4 那半句在 VSC 无落点，是**需求已要求、实现未覆盖**的缺口，不能只在批档里知会了事）。
- 代码注释里对 `MULTI-INSTANCE-COLLAB` §5.x 的悬空节引用：本批改面内的随实施轮改指节名；改面外的（`instance-inbox.mjs` ∥ `instance-registry.mjs` ∥ `run-stages.mjs` ∥ `agent-tools/index.mjs` ∥ VSC 两档）挂同一台账行，不并入本批。

**四处交评审一并看的缺陷（我实读所见）**：

1. §2 残留两行骨架占位 `<§2 模板占位：…>`（「本批条目（覆盖）…」与「机读清单 = …」两条指令原文）。它们在盘上就是噪声，且让 §2 的「有内容」判据失真。
2. §2「五、集成 delta」标题写「对 `test/RTM.md` 的 CLU 46 行」：`CLU` 是 `CLI` 的笔误；用例行不在 `test/RTM.md`（那是索引）而在 `test/rtm/tooling.md`。
3. **判据可能打空**：`test/rtm/tooling.md` 的 `CLI 46` 夹具前提写明「`busy` = 在飞回合」——夹具把 `isBusy` 当**输入**喂给核闩。若新增 `CLI 46-2` 同样由该夹具驱动，它验的是「核闩在 isBusy 为假时会取件」，而本批要治的是 **CLI 真实谓词把挂起算成忙**。判据必须打到 `thincoder-cli/src/tui/timer-watch.mjs` 的真实 `isBusy`（`state.suspended` 真时仍返回假），否则修不修都能绿。
4. 模态从 `isBusy` 挪进 `ready` 的可见后果没写：`blockedReason()` 先判 `isBusy` 再判 `ready`，故面板开着时阻塞因由 `busy` 变 `carrier`。这个字符串会进 `ev:inbox-watch-blocked` 的 `reason` 与受阻行，设计档须写明改后读法，或改判「面板在场仍记 busy」。

### 设计评审第 1 轮裁决（VERDICT: changes-required · 🔴 1 · 🟡 13 · 🔵 3）

全部采纳。1 🔴 与 #2 是同一件事的两面（判据打不到真谓词），合并处理：

- **#1 🔴 + #2 🟡**：§2 四补一条判据，直接读真实谓词——`thincoder-cli/src/tui/timer-watch.mjs` 的 `isBusy` 在 `state.suspended === true` 时须为假；桌面 `busyOf` 在窗口在场时须为假。同时给桌面三档（`timer-watch.mjs` ∥ `suspension-timers.mjs` ∥ `suspension-drive.mjs`）各一行判据：入窗队列、唤醒、残项回填。
- **#3 🟡**：`CLU` → `CLI`，用例行属 `test/rtm/tooling.md`，`test/RTM.md` 是索引，按节名逐字写。
- **#4 🟡**：`CLI 46-2` 号先落 `test/rtm/tooling.md` 再写用例标题。
- **#5 🟡**：`46-2` 行补「组件交互」与「进入口」，与 46-1 节注同形。
- **#6 🟡**：设计 §8 补需求 §5 的五项（批量探测 · 软提示不阻断 · claims 续约与过期 · 非阻塞 · 一次性取件）。
- **#7 🟡**：设计档给每个符号挂模块（`peerInstances` · `peerWriteTargets` · `recordPeerWrites` · `createInboxWatch` · `writeConfigAtomic` 等）。
- **#8 🟡**：四处「按当前…」改成点名归属（节 ∥ 符号），「明确死亡条件」要写出条件本身。
- **#9 🟡**：§6 签名补 `sessionId`，写明 `onPending` 是否取代 `onBlocked(ms, pending)` 的第二参。
- **#10 🟡**：写出面板在场时改后的 `reason` 读法（`carrier`）。
- **#11 🟡**：`TUI.md` 节名改「状态栏与活动」，并把该档列入受影响清单。
- **#12 🟡**：改动面内的引用随实施轮改指；面外约 30 处挂台账行，不并入本批。
- **#13 🟡**：§2 六补一行函数档结论（CODE-TIER §3 先函数后文件）。
- **#14 🟡**：删 §2 两条骨架占位。
- **#15 ∥ #16 ∥ #17 🔵**：§2 补先例与勘察行（点名档）；§6 引事故日志原文；常量给值或点归属。

约束：本批不改产品代码；结论必须能指出「不改就红」的判据——这是第 1 轮的病根。

### 第 1 轮修面后的两条裁定（主 agent）

**裁定 一 · `suspension-drive.mjs` 的函数档**

我自己量了一遍（`git show 99aeb74` 逐行括号配平）：`createSuspensionDrive` 从定义行到收尾 **305** 内容行，越 `CODE-TIER.md` §3 的 300 硬线。**越档成立，不是误判。**

处置 = **本批不拆**。理由：那 305 行是挂起驱动的核（载体 ∥ 回合 ∥ 钩子 ∥ 队列），拆它要另立设计并重审，塞进一个取件谓词的修复批会把它正在修的行为和拆分搅在一起。已挂台账 **#2418**，条件 = 本批收口后独立开批。

`§2 六` 那句「拆分列为上抛第 3 条（裁定方 = 父侧…）」改成已裁形态：点名 #2418 与条件，不再留待裁字样。

**裁定 二 · 「本批不改产品代码」的射程**

`§1` 那句约束说的是**设计轮的笔域**——设计席不写产品代码，判据必须能被"不改就红"地验到。**不是全批约束**：实施轮按 `§2 六` 改那七个源档，那是本批的正事。

`§2` 若在别处把它读成"本批为纯设计批"，按本条改正。

### 设计评审判定与父侧裁决（pass · 2026-11-14）

- 评审判定 **pass**：🔴 0 · 🟡 8 · 🔵 5。**13 项全部采纳**，无一驳回。凭证已签发，token 绑定受审字节。
- **8 条 🟡 的落点一律在实施交付之后**：受审四档（设计 ∥ 需求 ∥ `TUI.md` ∥ `IPC.md`）此刻冻结——改一个字节 token 即失效，实施席会被门拒。它们不改本批要写的代码，实施席按 §2 四 的判据表动工。
- 其中两条与实施轮直接相关，先点名，免得在档面读到旧句：
  - 设计 §7「行迹文案与位置归各端显示档」的射程只到**待取条数**那一行；`lost` ∥ `blocked` 的文案仍由核生成（`inboxTakeLostLine` ∥ `inboxBlockedLine`），别去端档找。
  - 设计 §6「CLI 恒真（回合面与会话同建同毁）」指的是**载体恒有**，不是 ready 恒真；CLI 的 `ready` = 无面板在场（`modalOpen` 为假），面板在场记 `carrier`。
- **实施面补一行**：`test/integration/cross-instance-message.test.mjs` —— `CLI 46-2` 的落点（`test/rtm/tooling.md` 的 46 表末列已点名）。§2 六 机读清单漏列此档，评审 #7 已记。档位读数按量法取批起快照：`99aeb74` = **255** 内容行（工作树现值 340，含新增 46-2），不越 500，无拆分方案。
- 收口时一并结的账：#2418（`createSuspensionDrive` 305 行越函数档，本批收口后独立开批）· 改面外的约 30 处悬空节引用 · VSC 待取条数缺口。

### 实施席上抛处置（2026-11-14 15:1x）· 桌面待取帧补显示面

**事实（实施席上抛，父侧复核成立）**：`thincoder-desktop/renderer/events-wake.mjs` 的 `INBOX_KINDS` 是闭集 `["lost","blocked"]`，零写门对表外 kind 直接丢弃 ⇒ `suspension-timers.mjs` 出的 `pending` 帧到渲染面即消失。而 `IPC.md` 本批已把它写成事实、需求 §4「等待期在状态栏可见待取条数」无端别限定、§2 六 也要求桌面出这一帧。不收 = 档/码不一致。

**裁定 = 扩到渲染面（选项 a）**。理由：设计档与 `IPC.md` 描述的显示必须真的出现；`§2 八` 的边界只排除了 VSC，没排除桌面。

**扩面（六个文件）**：`renderer/events-wake.mjs`（`INBOX_KINDS` 加 `pending`）· `renderer/store.mjs`（待取槽随帧替换、收到 0 摘键）· `renderer/views/chat-chrome.mjs` ∥ `chat-model.mjs` ∥ `chat.mjs`（`{ lost?, blocked?, pending? }` 一槽）· 实施席指定的那一处 CSS（类名 `chat-inbox-pending`，路径由它报入 §5）。

**档位读数（父侧现跑 `countContentLines`）**：`events-wake.mjs` 130 · `store.mjs` 383 · `views/chat-chrome.mjs` 249 · `views/chat-model.mjs` 128 · `views/chat.mjs` 208。最大 383 < 500 ⇒ 无拆分方案；CSS 不计档。

**显示形**：`text` 仍是条数原文（`IPC.md` 的字段语义不动），渲染面出「待取 N 条消息」，不输出裸数字——与 CLI「已排队 N 条消息」同一脉。裸 `3` 判为显示形缺陷。

**未动面**：`lost` ∥ `blocked` 的既有行与其核生成文案（`inboxTakeLostLine` ∥ `inboxBlockedLine`）不动；零写门本身不动；VSC 不动；受审四档冻结。

**透明披露**：本次 spawn 的 `files` 声明按 §2 六 机读清单给，未含这六个文件（清单漏列显示面，与评审 #7 同类）。该域无别的席在写，无竞态；收口在 §6 记「越出 §2 六 清单的补列」。

**环境修复（准）**：`thincoder-desktop/node_modules/@thincoder/core` 是物化副本 0.11.1、缺 `instance-*.mjs`，桌面主面连 `suspension-timers.mjs` 都 import 失败。准其实施席按 `scripts/dev-link.mjs --force --win32-only` 修成 junction；node_modules 不入 git，属环境修复非产品改动，报告须给出命令与输出。

### 实施已交付 · 修面任务书（设计席 fix 轮）

父侧已独立跑过判据（批内单测 11 ∥ 集成 46-1 + 46-2 ∥ 桌面 14 ∥ 全量 217 例 215 绿 2 红，两红 = `CLI 43-1` ∥ `43-2`，归 #2404）。实施席交付的七源档 + 六个渲染面 + 集成档与夹具均在盘。

现落评审那 8 条 🟡 的文档侧收正。**只动文档，不碰代码**；每条以「当前文档说的」对比「实施后真是什么」为准，不得为了让旧句自洽而改判据。

1. 设计 §7「行迹文案与位置归各端显示档」射程收到**待取条数**那一行；`lost` ∥ `blocked` 的文案归属按 `IPC.md` 的「核生成整行」写（`inboxTakeLostLine` ∥ `inboxBlockedLine`）。
2. 设计 §6「CLI 恒真（回合面与会话同建同毁）」拆成两句：载体恒有 ∥ `ready` = 无面板在场（`modalOpen` 为假）。
3. 设计 §5 补回执语义（`delivered-to-inbox` 只表示落盘）∥ `requestId`／`re` 用于对账、不形成待办；§1 把 `pid`／`end`／`sessionId`／`slots` 四个字段名逐字写出。
4. 设计 §7 点名待取条数的承载端（CLI ∥ Desktop）与 VSC 的已知缺口，并指向台账行（见 8）。
5. §2 二 的「逐节动」改成重写口径，写清代价（旧节号与 D-MI 决策行整体消失，面外约 30 处引用改指挂台账 #2417）。
6. §2 五 的 `CLI 46-2` 块补一行「服务的需求 = 需求 §4 ∥ §5」。
7. §2 六 机读清单补 `test/integration/cross-instance-message.test.mjs`（256）∥ 六个渲染面档（`events-wake.mjs` 130 ∥ `store.mjs` 383 ∥ `views/chat-chrome.mjs` 249 ∥ `views/chat-model.mjs` 128 ∥ `views/chat.mjs` ∥ CSS 无此档）∥ 夹具 `test/integration/fixtures/cross-instance-window-harness.mjs`；并说明清单当初漏列显示面的原因。
8. §2 四 首行「inbox 目录零 stat」与设计「在飞期一拍 = 一次判据 + 一次待取条数 stat」冲突且不可观测 —— 改成可观测的三条（`onTake` 零调用 ∧ 消息仍在盘 ∧ 该拍照报条数）。

### 实施交付后的父侧裁决（2026-11-14 15:30）

**我的读数**（仓根独立复跑，不采信实施报告）：批内单测 11 pass · 跨实例集成 2 pass（46-1 原例与 46-2 新例）· 桌面套件 14 pass · 全量 217 例 / 215 绿 / 2 红（红 = `CLI 43-1` ∥ `43-2`，归 #2404，与本批无交集）。判据打的是真谓词：单测直接 import `timer-watch.mjs` ∥ `status-line.mjs` ∥ `suspension-timers.mjs`，未用夹具代答 `isBusy`。

**四条上抛的处置**：

1. **§2 四 首行「inbox 目录零 stat」** —— 采纳。该行与设计「在飞期一拍 = 一次判据 + 一次待取条数 stat」冲突，且「零 stat」不可观测。判据口径改为可观测三条：`onTake` 零调用 ∧ 消息仍在盘 ∧ 该拍照报条数。落点 = 设计席本轮修面（§2 属其笔域）。
2. **渲染面零自动化判据** —— 挂 #2422（浏览器 import map 让平 node 载入必失败，需先造可载入缝，属结构改动）。
3. **`createSuspensionDrive` 返面缺 `armInbox`** —— 实施席在本批修了（`suspension-drive.mjs` 现返 `armInbox: (key, agent) => timers.armInbox(key, agent)`，`turn-driver.mjs` 一直在调），属既有缺陷、本批顺带修复，收口记入 §6。
4. **桌面 `executeTurn` 的 flights 置位 ∥ 释放点未查** —— 不改结论，按 `unverified` 记 §6；它只影响「同形窗口是否也存在」这一延伸判断，不影响本批判据。

**本批新债**：#2421（VSC 缺等待期待取条数半句）· #2422（桌面渲染面无线判据）。

### 收尾修面（两条 · 父侧裁定 2026-11-14 15:32）

设计席上抛 1 ∥ 3 均成立，各改一处；上抛 2（任务书「（见 8）」文义不通）属实——是我写错，按唯一对题的 VSC 那半句处置，无需再动。

1. **设计 §7 删掉台账行号 `#2421`**：文档纪律 D10 把台账行号列为会死的指针，不进交付档。改法 = 只留边界事实「VSC 那半句尚无落点，已记账」，行号留在台账里。这是我上一轮任务书里「指向台账行」的写法引出来的，不是设计席笔误。
2. **设计 §1「缓存有界」给值或点名归属**（评审 🔵 #10）：读 `thincoder-core/peer-instances.mjs` 的缓存上限符号与值，逐字写进设计档；读不到就写「缓存按该档常量封顶」并点名符号，不凭记写数。

两条都不改产品代码，不改变已交付实现所依赖的任何语义（`#2421` 只出现在文档正文；缓存上限是既有常量）。改完只跑 `doc_check` gate 与读回。

### 修面任务书 · 收口门唯一拒项（父侧 2026-11-14）

**只做一件事**：在 §2 六「受影响文件（机读清单）」末尾补三行，值照下表逐字，不另加数、不写增量。

```text
| 档 | 分拆方案 | 行数 |
|---|---|---|
| thincoder-core/prompt-files.mjs | — | 177 |
| thincoder-core/tools/knowledge.mjs | — | 60 |
| test/integration/knowledge-search-bounded.test.mjs | — | 新 |
```

表后补一段「性质」，写清三点。

1. 这三档属 `#2415`（knowledge 检索四改，已收口并提交 `23578bb7`），**不是本批改面**。
2. 它们落在本批改动面里，是因为两批共用同一工作树，而收口前置门的改动面 = 本会话写盘触达账 ∪ 提交 diff。
3. 读数按本批批起快照 `99aeb74` 记：`prompt-files.mjs` 177 ∥ `knowledge.mjs` 60；该快照上没有 `knowledge-search-bounded.test.mjs`，故记 `新`。

「档位结论（文件）」那句同时说明：新增三行不改变最大值（仍是 383），也不进本批的拆分判断。

**不做**：不改判据、不改设计档、不碰代码、不动 `§2` 其余各节；§2 六 之外一律零改。

**为什么不改基准了事**：门的改动面取「触达账 ∪ 提交 diff」，下移 `批起 sha` 仍留在触达账里，故唯一合规处置是补行。父侧已在 §1 记下这段原因。

## §2 批次任务与设计（eng-designer）
**状态行**：设计完成


### 一、本批条目（覆盖 #2416）

- 需求 §4「忙碌 = 已有一轮在飞。等待后台子代理结果不算忙碌，取件不因它推迟。」⇒ 设计 §6 的 isBusy 条 ∥ ready 条。
- 需求 §4「目标忙碌时消息留在 inbox，当前轮结束后由下一拍起新轮；等待期在状态栏可见待取条数。」⇒ 设计 §6 的延迟上界条 ∥ 挂起窗取件条 ∥ onPending 条 + §7 的等待期提示段。
- 需求 §4「取件一次性，开轮失败和长期受阻必须在目标端可见。」⇒ 设计 §6 的 onTake 落定两条 ∥ §7 的取走即删条（判据未变，本批只把「落定」写成分两种）。
- 需求 §5 验收新增项「挂起窗内照常取件」⇒ 本档四、验收对照的「挂起窗取件 · CLI 入窗队列与唤醒」∥「挂起窗取件 · Desktop 入窗队列与唤醒」∥「挂起窗取件 · Desktop 残项回填」三行；真谓词打靶 = 同表「CLI 真谓词：挂起不算忙」∥「CLI 真谓词：面板在场记 `carrier`」∥「Desktop 真谓词：窗在场不算忙」三行。

### 二、设计档落点

`docs/core/design/MULTI-INSTANCE-COLLAB.md` 是**重写**，不是逐节改：设计席按主题整档重排，旧节号（`§2a.2` ∥ `§3.1` ∥ `§4.4` ∥ `§5.2`–`§5.5` ∥ `§5.8`）与 `D-MI` ∥ `F-MI` ∥ `N-MI` 决定号整体消失，现档 §1–§8 一段一主题、无子节、无决定号表。

**代价**：改面外约 30 处代码注（`instance-inbox.mjs` ∥ `instance-registry.mjs` ∥ `run-stages.mjs` ∥ `agent-tools/index.mjs` ∥ VSC 两档 ∥ 集成档头注）仍引旧节号与决定号，本批只改改面内的，面外由台账行 #2417 承接。

重写时逐主题落到纸上的内容：

- §1–§5：补源码坐标与常量归属（`peerInstances` ∥ `peerWriteTargets` ∥ `recordPeerWrites` ∥ `peerCollabNote` ∥ `writeConfigAtomic` ∥ `writeSessionFile` ∥ `listLiveInstances` ∥ `sweepInstances` ∥ `sweepInbox` ∥ `instanceSendTool`），常量给值与出处（`PEER_PROBE_TTL_MS` ∥ `SYNC_PROBE_MS` ∥ `HOT_WINDOW_MS` ∥ `CLAIM_TTL_MS` ∥ `CLAIM_RENEW_FLUSH_MS` ∥ `INSTANCE_STALE_MS` ∥ `INBOX_STALE_MS`）；§4「明确死亡条件」写成条件本身，§2 claims 过期写成 `expiresAt` 判据，§3 权限处理点到 `mode: 0o600` ∥ `chmod` 那一行。
- §6 取件闩：签名补 `sessionId`；isBusy 收成「已有一轮在飞」并挂三端装配点；就绪判据改由端壳答（含交互面板在场）；面板场景的 `reason` 读法写成 `carrier`；onTake 落定写成两种；补延迟上界、挂起窗取件与宿主落点、`onPending` 与 `onBlocked` 第二参的分工；引事故观测原文。
- §7 消息落法：等待期提示段点名两端显示档（CLI = `docs/cli/design/TUI.md`「4. 状态栏与活动」，Desktop = `docs/desktop/design/IPC.md` 的 `ev:inbox` 行新增 `pending`），并钉住「状态栏常驻面」与「受阻行一次性面」两件事不互替。
- §8 验证：补齐需求 §5 的五项（批量探测 ∥ 软提示不阻断 ∥ claims 续约与过期 ∥ 非阻塞 ∥ 一次性取件）。

### 三、机制设计（摘要；细则以设计 §6 ∥ §7 为准）

1. **判据分家**：核闩只认两问——「有没有一轮在飞」（isBusy）与「这一端此刻能不能开一轮」（ready，必填无缺省）。端壳各答自己那一问。
   CLI：isBusy 只留 `state.processing`，模态挪进 ready（`modalOpen` 在场即不就绪）；Desktop：取件闩的 `busyOf` 去掉 `inWindow`；VSC 现状即正，零改。
2. **挂起窗投递路**：窗在等子代理结果时 isBusy 为假 ⇒ 下一拍照常取件。取件后消息进窗口输入队列（宿主与驱动同一数组——CLI `state.pendingInput` ∥ Desktop `entry.pending`），并调核句柄 `wake()` 让窗口在步边界起轮。窗口先退出 ⇒ 残项回填宿主队列（既有兜底面），零丢失。
3. **待取提示**：核闩每拍把待取条数交给 `onPending(n)`；端壳持在状态栏（CLI 状态行 ∥ Desktop `ev:inbox` 既有行组），归零即摘除。受阻行（跨阈一次性）不动。

### 四、验收对照（需求 §5 ⇒ 判据）

判据口径：每条打到本批要改的那个**真谓词**或那个**真装配点**。把 `isBusy` 当入参喂给核闩的用例只验闩、验不到端壳——故「CLI 真谓词」两行与「Desktop 真谓词」一行一律走真端壳转口 ∥ 真装配式，不改就红。

| 需求验收项 | 判据（都能被读者判对错） |
|---|---|
| 忙碌（一轮在飞）不取件 | 单测：核闩 `isBusy` 为真的一拍，`onTake` 零调用、消息仍在盘、该拍照报的待取条数不变（三面都可观测） |
| **CLI 真谓词：挂起不算忙** | 单测：直接调 `thincoder-cli/src/tui/timer-watch.mjs` 导出的 `createInboxWatch`（真端壳转口，不经夹具喂 `isBusy`），`state = { suspended: true, processing: false }`、inbox 留 1 条 ⇒ 一拍内 `onTake` 收到 1 条并起一轮。现状 `state.suspended` 进 isBusy ⇒ 该拍零调用 = 红 |
| **CLI 真谓词：面板在场记 `carrier`** | 单测：`state.picker` 在场 ⇒ 一拍内 `onTake` 零调用；`nowFn` 推过 `INBOX_BLOCKED_MS` 后受阻日志 `reason === "carrier"`（现状记 `busy` = 红）；面板关闭后下一拍取件恰一次 |
| **Desktop 真谓词：窗在场不算忙** | 单测：`thincoder-desktop/src/main/suspension-timers.mjs` 装配后，`inWindow(key) === true` ∧ `busyOf(key) === false` 的一拍取到消息。现状装配式 `busyOf(key) === true ∥ inWindow(key)` ⇒ 零取件 = 红 |
| 挂起窗取件 · CLI 入窗队列与唤醒 | 单测：CLI 有活窗口（`state.suspended` 真）时 `onTake` 把消息推进 `state.pendingInput` 且调用 `state._suspWake()`，`turn()` 零调用（现状调 `turn()` = 红） |
| 挂起窗取件 · Desktop 入窗队列与唤醒 | 单测：`suspension-timers.mjs` 的 `onTake` 走窗口路由时，消息落进 `entry.pending` 同一数组，`wake()` 恰一次 |
| 挂起窗取件 · Desktop 残项回填 | 单测：窗先退出（非中止径）⇒ `resumeResidual` 把 `entry.pending` 里那条以普通回合续发一次，零丢弃 |
| 等待期状态栏可见待取条数 | 单测：`onPending` 收到非零条数、取尽后收到 0；CLI 状态行（`thincoder-cli/src/tui/status-line.mjs`）在 `state.processing` 为真且待取非零时出一段条数、归零即消失 |
| 取件一次性 ∥ 开轮失败可见 | 沿用既有判据（reject ⇒ `ev:inbox-watch-take-lost` + 逐字丢失行，不重投），本批不改 |
| 延迟上界 | 单测：空闲且闩在位，消息在下一拍可见于 `onTake`——不超过一拍（`INBOX_POLL_MS`） |
| 长期受阻出声 | 沿用既有判据（跨过 `INBOX_BLOCKED_MS` 一次），本批不改 |

### 五、集成 delta（对 `test/rtm/tooling.md`「CLI 46. 跨实例发消息：一条消息送进另一实例并起一轮，回程带请求号」一节）

`test/RTM.md` 是索引，用例行在 `test/rtm/tooling.md`。

- 改写：无。
- 删除：无。
- 新增：`CLI 46-2`，标题「挂起窗里取走消息：有子代理在跑时消息照常取走并起轮，在飞回合不插队」。编号已落 `test/rtm/tooling.md` 的 `CLI 46` 表（46-2 行在位，节注已补该行的交互组件与进入口），用例标题逐字同号。
  - 本行评估的组件交互 = 端壳取件谓词（CLI `thincoder-cli/src/tui/timer-watch.mjs` 的 `isBusy` ∥ Desktop `thincoder-desktop/src/main/suspension-timers.mjs` 的 `busyOf`）⟷ 取件闩（`thincoder-core/instance-inbox-watch.mjs`）⟷ 挂起窗输入队列与唤醒（CLI `state.pendingInput` + `_suspWake` ∥ Desktop `entry.pending` + `wake`）⟷ 状态栏待取提示。
  - 进入口 = 一个真 node 进程先起后台子代理进窗，再由另一实例 `instance_send` 投递；断言只到业务可观测面（消息被取走并起了一轮；在飞时该轮不被打断）。
  - 服务的需求 = 需求 §4「忙碌 = 已有一轮在飞。等待后台子代理结果不算忙碌，取件不因它推迟。」∥ 需求 §5「挂起窗内照常取件」。
- 理由：本批治的就是「有子代理在跑时收不到消息」这条生产问题，属「生产真的出过的问题」那一入口。
- 与 46-1 的界线：46-1 由夹具把 `busy` 当输入喂闩（验的是闩在入参下的行为）；46-2 必须从真端面谓词进，夹具不得再替端壳答 `isBusy`。

### 六、受影响文件与档位结论

**受影响文件（机读清单）**

```text
| 档 | 分拆方案 | 行数 |
|---|---|---|
| thincoder-core/instance-inbox-watch.mjs | — | 250 |
| thincoder-cli/src/tui/timer-watch.mjs | — | 94 |
| thincoder-cli/src/tui/index.mjs | — | 305 |
| thincoder-cli/src/tui/status-line.mjs | — | 205 |
| thincoder-desktop/src/main/timer-watch.mjs | — | 133 |
| thincoder-desktop/src/main/suspension-timers.mjs | — | 138 |
| thincoder-desktop/src/main/suspension-drive.mjs | — | 341 |
| docs/batches/2026-11-14-inbox-pickup-window.test.mjs | — | 新 |
| test/integration/cross-instance-message.test.mjs | — | 255 |
| test/integration/fixtures/cross-instance-window-harness.mjs | — | 新 |
| thincoder-desktop/renderer/events-wake.mjs | — | 130 |
| thincoder-desktop/renderer/store.mjs | — | 383 |
| thincoder-desktop/renderer/views/chat-chrome.mjs | — | 249 |
| thincoder-desktop/renderer/views/chat-model.mjs | — | 128 |
| thincoder-desktop/renderer/views/chat.mjs | — | 208 |
| thincoder-core/prompt-files.mjs | — | 177 |
| thincoder-core/tools/knowledge.mjs | — | 60 |
| test/integration/knowledge-search-bounded.test.mjs | — | 新 |
```

量法 = `countContentLines`（末行换行不计），取数 = 批起快照 `99aeb74` 的 `git show <sha>:<档>` 过该尺。

**补列三行的性质**

- 这三档属 `#2415`（knowledge 检索四改，已收口并提交 `23578bb7`），**不是本批改面**。
- 它们落在本批改动面里，是因为两批共用同一工作树，而收口前置门的改动面 = 本会话写盘触达账 ∪ 提交 diff。
- 读数按本批批起快照 `99aeb74` 记：`prompt-files.mjs` 177 ∥ `knowledge.mjs` 60；该快照上没有 `test/integration/knowledge-search-bounded.test.mjs`，故记 `新`。

**档位结论（文件）**：逐档读数见上表，最大 = 383（`thincoder-desktop/renderer/store.mjs`），无一越过 500 ⇒ 本批无文件拆分方案。

补列的三行是 `#2415` 的档，不改变上面的最大值（仍是 383），也不进本批的拆分判断。单测档收口即删，不入稳态。

显示面无 CSS 档：`thincoder-desktop/renderer/**/*.css` 十三档内 `chat-inbox` 零命中，`chat-inbox-pending` 与两位兄长（`chat-inbox-lost` ∥ `chat-inbox-blocked`）同形（类名产出、无样式）。

**清单当初漏列显示面的原因**：这份清单按设计轮的改面写（核闩 ∥ 两端取件谓词 ∥ 两份显示档），而显示面六档是实施期父侧裁定「扩到渲染面（选项 a）」才进改动面的；`test/integration/cross-instance-message.test.mjs` 与夹具同理，是 `CLI 46-2` 的编号在 RTM 落定后才定位到落点档。三处越出均已在 §5「清单外补列」逐档记明。

**档位结论（函数）**：CODE-TIER §3 要求先看函数再看文件。读数 = 批起快照 `99aeb74` 上逐档最长函数跨度（node 行扫描，同一把尺）：

`instance-inbox-watch.mjs` 112 · CLI `timer-watch.mjs` 10 · `index.mjs` 207 · `status-line.mjs` 101 · Desktop `timer-watch.mjs` 41 · `suspension-timers.mjs` 110 · `suspension-drive.mjs` **305**（`createSuspensionDrive`）。

前六档均在 300 的硬线之下；`suspension-drive.mjs` 305 ≥ 300 ⇒ 越函数档。处置（已裁 · 父侧 2026-11-14）：本批不拆，只在该档加一个注入缝（与骨干/细节划分无重叠）；拆分挂台账 #2418，条件 = 本批收口后独立开批。理由：那 305 行是挂起驱动的核（载体 ∥ 回合 ∥ 钩子 ∥ 队列），拆它要另立设计并重审，塞进取件谓词的修复批会把正在修的行为与拆分搅在一起。

**文档改动（两处，本轮已落盘）**：

- `docs/cli/design/TUI.md`「4. 状态栏与活动」：写上待取提示行的文案与位置（沿「已排队 N 条消息」一脉），并写明它与受阻行不互替。
- `docs/desktop/design/IPC.md` 的 `ev:inbox` 行：kind 由 `lost` ∥ `blocked` 扩为三值，新增 `pending`（待取条数帧；同 kind 新帧替换旧帧，收到 0 ⇒ 渲染面摘除该行）。

**改动内容（逐档一句）**：

- `thincoder-core/instance-inbox-watch.mjs`：加 `onPending` 形参（可选，缺省 null 与 `onBlocked` 同形）；受阻因两分延续（在飞 ∥ 不就绪），两因语义按设计 §6 收正；头注里指向 §5.x 的引用改指节名（本档属本批改面）。
- `thincoder-cli/src/tui/timer-watch.mjs`：isBusy 去掉挂起两态，模态挪进 `ready`；`onPending` 透传。
- `thincoder-cli/src/tui/index.mjs`：onTake 分两支——有活窗口（`state.suspended` 真）入 `state.pendingInput` 并调 `state._suspWake?.()`，否则照旧 `turn(...)`；`onPending` 落到状态面。
- `thincoder-cli/src/tui/status-line.mjs`：在飞且待取非空 ⇒ 出一段待取条数；归零即消失。
- `thincoder-desktop/src/main/timer-watch.mjs`：取件闩表透传 `onPending`。
- `thincoder-desktop/src/main/suspension-timers.mjs`：`busyOf` 去掉 `inWindow`（窗在场不再算忙）；onTake 分两支（窗在场 ⇒ 入窗队列 + 唤醒）；`onPending` ⇒ `ev:inbox` 行组新增 `pending` 帧（同 kind 新帧替换旧帧，收到 0 ⇒ 渲染面摘除）。
- `thincoder-desktop/src/main/suspension-drive.mjs`：给取件面一个窗缝（读窗载具 + 唤醒），形态照既有 `reloadSlot` 注入缝。

### 七、关键决策与被否方案

- **两个谓词各答一件事**（在飞 ∥ 能不能开一轮），不合并成一个「忙」：合并后分不出「等它」与「它坏了」，本批的事故就是三种含义挤在一个字里。
- **模态不进 isBusy、进 ready**：需求把「忙碌」定义成「一轮在飞」，模态在场不是回合；但它确实是「此刻别插一轮」。行为与改前一致，语义归位。
- **onTake 的 resolve 加第二种**：挂起窗内消息进的是一个活窗口的队列——窗口在步边界起轮，窗口先退出则残项回填宿主队列，两条去路都在，算「已有着落」。没有去路的（无载体 ∥ 无开轮面 ∥ 窗口已没了）仍 reject。
- **不加新投递通道**：闩自续每秒一拍，窗口不停止轮询；谓词一放开即可取件。另造 inbox 专用投递面 = 把 timer 面已有的一路再建一遍。
- **被否**：把挂起窗算忙（即现状）——「有子代理在跑就永远收不到消息」，正是本批要治的形态。
- **被否**：让 onPending 必填（与 `ready` 同等待遇）——三端装配面都得同步改，含本批不改的 VSC 面；代价是 VSC 暂不显示条数（见上抛第 1 条）。

### 八、边界（本批不做）

- VSC 的待取条数面不做（VSC 的忙碌判据本来就对，消息照常取走；缺的只是状态栏那半句）。
- 不改消息落盘格式 ∥ 名册 ∥ `instance_send` 事务语义 ∥ timer 的投递路径与射程（同 §1 边界）。
- 不改受阻行阈值 `INBOX_BLOCKED_MS` 与其文案。

### 九、上抛

1. **[上抛·知会]** VSC 的「等待期状态栏待取条数」本批不落（需求 §4 那半句在 VSC 尚无落点）。父侧已裁决：挂台账行，不并入本批。
2. **[上抛·知会]** 代码注释里对 `MULTI-INSTANCE-COLLAB` §5.2 ∥ §5.4 ∥ §5.6 ∥ §5.8 ∥ §5.9 的引用在文档重写后已无对应节（现档 §5 = 发送）。父侧已裁决：改面内的随实施轮改指节名，改面外（约 30 处）挂同一台账行。
3. **[上抛·知会]** 函数越档已裁（父侧 2026-11-14）：`thincoder-desktop/src/main/suspension-drive.mjs` 的 `createSuspensionDrive` 305 行 ≥ CODE-TIER §3 的 300 —— 本批不拆，挂台账 #2418（条件 = 本批收口后独立开批），本批只加注入缝。细则见 §2 六 的函数档结论。
4. **[上抛·知会]** §1「约束：本批不改产品代码」的射程已裁（父侧 2026-11-14）：那句说的是**设计轮的笔域**（设计席不写产品代码，判据必须能被「不改就红」地验到），不是全批约束；实施轮按 §2 六 改那七个源档是本批的正事，本批不是纯设计批。

### 十、先例与勘察

- **先例**：`docs/core/design/MULTI-INSTANCE-COLLAB.md` §6 的 `ready` 必填缝（缺了装配即抛）——本批的 `onPending` 走同一家族的「端壳可选注入、缺省零动作」形态；Desktop 的窗缝照 `thincoder-desktop/src/main/suspension-drive.mjs` 既有 `reloadSlot` 注入缝。
- **勘察**：已查 `docs/core/design/MULTI-INSTANCE-COLLAB.md` ∥ `docs/core/requirements/MULTI-INSTANCE-COLLAB.md` ∥ `docs/core/standards/CODE-TIER.md` ∥ `docs/cli/design/TUI.md`「4. 状态栏与活动」∥ `docs/desktop/design/IPC.md` 的 `ev:inbox` 行 ∥ `test/rtm/tooling.md`「CLI 46」∥ `test/RTM.md`（索引）；代码七档与两端装配面见 §2 六。
- **勘察结论**：三端对「忙」各答一遍，VSC 的判据本来就正；缺的是 CLI ∥ Desktop 两端的真谓词与挂起窗的取件落点。

## §3 设计评审（评审子代理）
**状态行**：评审通过



### 轮次 1（评审子代理）

评审对象 = `docs/core/design/MULTI-INSTANCE-COLLAB.md` ∥ `docs/core/requirements/MULTI-INSTANCE-COLLAB.md`（全档实读）；档位 ∥ 先例 ∥ 勘察 ∥ 集成 delta 四项按 `docs/batches/2026-11-14-inbox-pickup-window.md` §2 核（该 §2 自述本批只改设计 §6 ∥ §7，与盘上设计档逐句相符）。

| # | 严重度 | 状态 | 证据（指针） |
|---|---|---|---|
| 1 | 🔴 | 未处置 | §2 四「挂起窗内照常取件」行把 isBusy 当**输入**喂核心闩（「isBusy 为假的一拍，onTake 收到消息」），而本批真改的是 §2 六「`thincoder-cli/src/tui/timer-watch.mjs`：isBusy 去掉挂起两态」与桌面 `busyOf` 去掉 `inWindow`——真实谓词未改时这些判据照样全绿 |
| 2 | 🟡 | 未处置 | §2 四 无一行打到桌面三档（§2 六列 `thincoder-desktop/src/main/timer-watch.mjs` ∥ `suspension-timers.mjs` ∥ `suspension-drive.mjs`），`onPending` 透传与入窗队列零判据 |
| 3 | 🟡 | 未处置 | §2 五「对 `test/RTM.md` 的 CLU 46 行」：`CLU` 为 `CLI` 笔误，且 CLI 46 故事节与 46-1 行实在 `test/rtm/tooling.md` |
| 4 | 🟡 | 未处置 | 46-2 号未在 RTM 落定（`test/rtm/tooling.md` 只有「## CLI 46. 跨实例发消息…」与 46-1 行，无 46-2），而 §2 五 自述「编号先在 RTM 落定再写用例标题」 |
| 5 | 🟡 | 未处置 | §2 五 新增用例只给标题 ∥「消息被取走并起了一轮」；缺「本行评估的组件交互」与「进入口」两栏 |
| 6 | 🟡 | 未处置 | 设计 §8「验证缓存与三态…来源标记」缺需求 §5 的「批量探测」「软提示不阻断」「claims 续约/过期」「非阻塞」「一次性取件」 |
| 7 | 🟡 | 未处置 | 设计通篇零源码坐标（`peerInstances` ∥ `peerWriteTargets` ∥ `recordPeerWrites` ∥ `peerCollabNote` ∥ `createInboxWatch` ∥ `writeConfigAtomic` 均无落点）；同类档都有（`CONFIG.md`「原子读写 ｜ `thincoder-core/config-io.mjs`」、`PATH-RESOLUTION.md`「实现 = `thincoder-core/path-resolve.mjs`」） |
| 8 | 🟡 | 未处置 | 「按当前惰性清理」「配置包含凭据，权限处理按当前安全规则」「残留按当前龄期与明确死亡条件清理」「按当前 TTL」——四处都不带坐标；「明确死亡条件」断言的条件全档未写 |
| 9 | 🟡 | 未处置 | 设计 §6 签名 `createInboxWatch({ready,isBusy,onTake,onBlocked,onPending,timer,clear})` 缺 `sessionId`（`thincoder-core/instance-inbox-watch.mjs` 实有），且未说 `onPending(n)` 与既有 `onBlocked(ms, pending)` 第二参谁承载待取条数 |
| 10 | 🟡 | 未处置 | 模态入 `ready` 后受阻因由 `busy` 变 `carrier`（闩内 `if (ready() !== true) return "carrier"`）；§7 点了 busy ∥ carrier 两名，未写这处改后读法 |
| 11 | 🟡 | 未处置 | 设计 §7「CLI = `docs/cli/design/TUI.md` 状态行节」：该档节名是「## 4. 状态栏与活动」，无「状态行」节；且 TUI.md 不在 §2 六 受影响清单 ⇒ 新可见行文案无归属档改动 |
| 12 | 🟡 | 未处置 | 锚点漂移：约 30 处代码注与 `test/integration/cross-instance-message.test.mjs` 头注引 §2a.2 ∥ §3.1 ∥ §4.4 ∥ §5.2–§5.5 ∥ §5.8 与 D-MI ∥ F-MI ∥ N-MI 号，重写后设计档无对应节、需求档无对应号 |
| 13 | 🟡 | 未处置 | §2 六 档位结论只判文件长度；CODE-TIER §3「先检查函数」未判（读数抽查相符：`status-line.mjs` 末行 205、`suspension-drive.mjs` 末行 341） |
| 14 | 🟡 | 未处置 | §2 两条 `<§2 模板占位：…>` 仍在盘上作为记录正文 |
| 15 | 🔵 | 未处置 | 「最近先例」∥「勘察证据」在档头，§2 无对应行；勘察行只点主题不点档名 |
| 16 | 🔵 | 未处置 | 设计 §6「本机制最初的事故形态」未引观测；记录 §1 有原文 `ev:inbox-watch-blocked {ms: 900841, pending: 1, reason: "busy"}` |
| 17 | 🔵 | 未处置 | 数值无值：`INBOX_POLL_MS` ∥ `CLAIM_RENEW_FLUSH_MS` ∥ `CLAIM_TTL_MS`、缓存界；同类 `TUI.md` 写 `QUEUED_MAX_ITEMS=8` |

计数：🔴 1 · 🟡 13 · 🔵 3

VERDICT: changes-required

### 轮次 2（评审子代理）

| # | 严重度 | 状态 | 证据 |
|---|---|---|---|
| 1 | 🔴 | New — 未处置 | `prompts/knowledge/normal-coding-workflow.md`「Good example」条教 `Closest precedent: <path>:<line>`；`prompts/knowledge/evidence-discipline.md`「A line number is never the citation — cite the item itself」与「a path with a line number after it」、`prompts/knowledge/documentation-evaluation.md` 11「Citation form — cite as `doc:section`」给出相反答案 |
| 2 | 🔵 | New — 未处置 | 同一条内「coordinates in path form / placeholders only」与 `<path>:<line>` 自相矛盾 |
| 3 | 🟡 | Unfixed — 本轮未验 | 前一轮 17 项全部落在 `docs/core/design/MULTI-INSTANCE-COLLAB.md` ∥ 其需求档 ∥ `docs/batches/2026-11-14-inbox-pickup-window.md` §2，均不在本轮评审面；本轮未收到响应表 ⇒ 零条可判 |

计数：🔴 1 · 🟡 1 · 🔵 1（前一轮 17 项按「未验 ⇒ Unfixed」计入第 3 行）

VERDICT: changes-required

### 轮次 3（评审子代理）

评审对象 = `docs/core/design/MULTI-INSTANCE-COLLAB.md` ∥ `docs/core/requirements/MULTI-INSTANCE-COLLAB.md` ∥ `docs/cli/design/TUI.md` ∥ `docs/desktop/design/IPC.md`（四档全读）。档位 ∥ 先例 ∥ 勘察 ∥ 集成 delta 按本记录 §2 核。

| # | 严重度 | 状态 | 证据（指针） |
|---|---|---|---|
| 1 | 🟡 | New | 需求 §4「回执 delivered-to-inbox 只表示落盘，不表示已读或已处理」∥「requestId 与 re 用于对账，不形成任务从属或待办」∥「不提供离线持久队列、广播、订阅或跨机器投递」在设计 §5 无对应句（§5 只写「失败不排队」）；需求 §1「字段仅 pid/end/sessionId/slots」在设计 §1 只作「白名单字段」 |
| 2 | 🟡 | New | 设计 §7「（现为 `{ key, kind, text }`，kind = `lost` ∥ `blocked`）新增第三个 kind `pending`」= 修订体；IPC.md `ev:inbox` 行已是「kind 为 `lost`、`blocked` 或 `pending`」⇒ 同一面两处读法不同 |
| 3 | 🟡 | New | 设计 §7「行迹文案与位置归各端显示档」把 lost ∥ blocked 两行一并派给端显示档，而 IPC.md 同条写「`lost` ∥ `blocked` 的 text 为核生成的整行（`inboxTakeLostLine` ∥ `inboxBlockedLine`）」⇒ 读者按设计去 TUI.md ∥ IPC.md 找那两句文案会落空 |
| 4 | 🟡 | New | 设计 §6「两端落点：CLI 恒真（回合面与会话同建同毁），面板经 `modalOpen` 进 ready」与同节「ready 由宿主提供、必填、无缺省」互斥；§2 三 1 的读法是「模态挪进 ready（`modalOpen` 在场即不就绪）」 |
| 5 | 🟡 | New | 设计 §7「端壳在状态栏显示待取条数」为通句，而同档 §6 写「`onPending` … 可选形参」且 §2 九 1 裁「VSC 本批不落」⇒ 三端之一无落点，设计档未写哪几端承载；该推迟未给台账行号（对比 §2 九 3 的 #2418） |
| 6 | 🟡 | New | §2 二「逐节动，每节改的都是本轮评审裁决落到纸上的那一处」与 §2 九 2「文档重写后已无对应节（现档 §5 = 发送）」自述相反；改面的真实规模 = 重写，代价是约 30 处面外引用悬空（实测 `test/integration/cross-instance-message.test.mjs` 头注仍引「§5.3 回执 / §5.4 投递与取件 / §5.5 可达性四态 / §5.10 集成行」） |
| 7 | 🟡 | New | §2 六 机读清单八行不含 `test/integration/cross-instance-message.test.mjs`，而 §2 五 新增的 CLI 46-2 行末列就写这个文件（RTM 实测在位）；本席实测该档 256 内容行 ⇒ 档位结论未覆盖本批新用例的落点文件 |
| 8 | 🟡 | New | §2 五 的 46-2 块给了「组件交互」「进入口」「理由」，无「服务的需求」一项（对照 RTM 46 节注的「回指 = 需求 …」与同批 §2 一 的需求映射） |
| 9 | 🔵 | New | 设计 §6「探针住拍内 ⇒ …「没有拍」由无条件重臂变成不可达态，本计数器不兜它」句法无主语，读者无法判对错 |
| 10 | 🔵 | New | 设计 §1「缓存有界」既无值也无归属档（同类常量都写了值或点名文件）；§2 六 未收这一项 |
| 11 | 🔵 | New | 设计 §6「在飞期一拍 = 一次判据 + 一次待取条数 stat」以 `onPending` 已传为前提，同节又写「不传 … 也不花那次 stat」 |
| 12 | 🔵 | 已裁 · 待守 #2418 | `createSuspensionDrive` 305 内容行 ≥ `CODE-TIER.md` §3 的 300 = 越函数档；§2 六 ∥ §2 九 3 已显式呈现并挂 #2418，收口面须核该行仍在册 |
| 13 | 🔵 | New | §2 十 勘察行只点本仓档；「库外」答案实在 §1 勘察（「库外 = B 类…外部断言 = 零」）⇒ §2 未自带该答 |

计数：🔴 0 · 🟡 8 · 🔵 5

VERDICT: pass

## §4 用户批准（主 agent）

批准面 = 需求三行（忙碌 = 一轮在飞 ∥ 挂起窗照常取件 ∥ 等待期待取条数可见）+ 设计档 §6 ∥ §7 + `§2` 任务书。逐条原话：

- 行为要求：**「主agent空闲，无论是否有子代理在运行，我都希望能收到投递。主会话在执行中，我不希望当前会话被打断，但是我希望状态栏能有消息提示。」**（2026-11-14 14:2x）
- 草稿口径：**「不算，」**（2026-11-14 14:28）——输入框有草稿不算忙。
- 开工词：**「开工」**（本批设计席由此派出）。
- 全链授权：`§1`「授权」段的**自动推进**——设计修 → 评审 → 实施 → 验证 → 收口不需逐步确认。

据此，实施席的派出、以及对实施席「桌面待取帧扩到渲染面」的裁定（选项 a），都在这条授权之内，不另取批准。

## §5 实施记录（eng-coder）

### 实施摘要

按 §2 三 的机制（判据分家 · 挂起窗投递路 · 待取提示）改七个源档，并按父侧裁定扩到渲染面五档；VSC 端零改动。

| 档 | 落地 |
|---|---|
| `thincoder-core/instance-inbox-watch.mjs` | 加 `onPending(n)` 形参（可选，缺省 null）+ `pendingOfTick` 一拍一次 stat 缓存 + `reportPending`；受阻跨格出声与报数共用同一读数；头注按设计「取件闩」「发送」「名册」「消息落法」节名改指（本档无 §5.x 节了） |
| `thincoder-cli/src/tui/timer-watch.mjs` | `isBusy` 只认 `state.processing`；`ready` = `!modalOpen(state)`；`onPending` 透传；新增导出 `createInboxTake`（有活窗口 ⇒ `state.pendingInput` + `_suspWake`；否则普通回合；无去处 ⇒ 逐字丢失行 + reject） |
| `thincoder-cli/src/tui/index.mjs` | `onTake: createInboxTake({ state, turn, pushLine })`；`onPending` 落 `state.inboxPending` 并在值变时 `render()` |
| `thincoder-cli/src/tui/status-line.mjs` | `state.processing && inboxPending > 0` ⇒ 状态段出一段 `待取 N 条消息`；归零 / 非在飞 ⇒ 零注入（整行逐字节等价） |
| `thincoder-desktop/src/main/timer-watch.mjs` | 取件闩表透传 `onPending`（核闩形参无键 ⇒ 本层补键 `(key, n)`） |
| `thincoder-desktop/src/main/suspension-timers.mjs` | `busyOf` 去掉 `inWindow`；`onTake` 两条去路（`windowTake` 真 ⇒ resolve；否则 `runTurn`）；`onPending` ⇒ `ev:inbox {kind:"pending", text: String(n)}` |
| `thincoder-desktop/src/main/suspension-drive.mjs` | 新增 `windowTake(key, text)` 注入缝（`queue.accept` 入 `entry.pending` 同数组 + `entry.handle.wake()`）；补出 `armInbox` 出口（见披露 ③） |
| `thincoder-desktop/renderer/events-wake.mjs` | `INBOX_KINDS` 加 `pending`；条数 ≤ 0 ⇒ 只摘 `pending` 槽（槽空则整键摘除），`lost` ∥ `blocked` 不动 |
| `thincoder-desktop/renderer/{store,views/chat-chrome,views/chat-model,views/chat}.mjs` | 槽注释三值；`inboxOf` 闭集序加 `pending`；`inboxLineText` 出「待取 N 条消息」（不出裸数字） |

### 决策披露（清单外改动与实施期判断）

| # | 项 | 理由 |
|---|---|---|
| ① | `createInboxTake` 提为 `timer-watch.mjs` 的导出（§2 六 说「index.mjs：onTake 分两支」） | 分支体住在 `index.mjs` 的 `startTUI` 闭包里则**无法单测**（§2 四 点名「单测」）。行为与 §2 六 同，装配点仍在 `index.mjs`；这样单测打的是真分支而不是它的复制品 |
| ② | 渲染面五档（`events-wake` ∥ `store` ∥ `views/chat-chrome` ∥ `views/chat-model` ∥ `views/chat`） | 父侧 2026-11-14 裁定「扩到渲染面（选项 a）」：不收这一帧，桌面待取面就是「一个没有消费者的帧」，而 IPC.md 已把渲染行为写成事实 |
| ③ | `suspension-drive.mjs` 补出 `armInbox` 出口 | 实施期发现的**既有缺陷**：调用面 `turn-driver.mjs` 的 `ensureSession` 一直在叫 `suspension?.armInbox(key, agent)`，而 `createSuspensionDrive` 的返回面没有这个键 ⇒ 桌面会话起点必然抛 `TypeError`、取件面从不武装（叠加当时 desktop 的 `@thincoder/core` 物化副本过期，桌面主面连 import 都失败，所以一直没人看见）。不补则本批桌面整条链是死的 |
| ④ | 新增夹具档 `test/integration/fixtures/cross-instance-window-harness.mjs` | 46-2 要「生产取件谓词 + 真进程」，而 46-1 的夹具是**核闩端壳**（它替端壳答 `ready`/`busy`，正是 46-2 禁止的形态）。故另起一夹具：真件 = CLI `createInboxWatch` ∥ `createInboxTake` + 核三档，只替宿主状态位（`state.processing` ∥ `state.suspended` ∥ `pendingInput` ∥ `_suspWake`） |
| ⑤ | 无 CSS 改动（父侧扩面六项里的「那一处 CSS」） | 实测**不存在**：`thincoder-desktop/renderer/**/*.css` 十三个档里 `chat-inbox` 零命中——`chat-inbox-lost` ∥ `chat-inbox-blocked` 同样无规则。故 `chat-inbox-pending` 与两位兄长同形（类名产出、无样式）。要加样式等于新定视觉，属界面决定，不自行发明 |
| ⑥ | `windowTake` 不做容量拒（`pushInput` 有 `QUEUED_MAX_ITEMS` 门） | 取件消息**已离盘**：拒了就是丢。用户输入能再按一次 Enter，跨实例消息不能。判据 = §2 三 2「取件后消息进窗口输入队列」；容量门留给人输入面 |
| ⑦ | `pending` 帧 `text` = 条数原文（`String(n)`），显示形在视图面 | IPC.md「`text` = 条数」逐字；「待取 N 条消息」由 `chat-model.mjs` 出（父侧裁定 ③「字段语义不当文案」） |
| ⑧ | `D-MI*` ∥ `F-MI*` 决定号保留未改 | 父侧裁定只到「`MULTI-INSTANCE-COLLAB` §5.x 悬空节引用」——改面内的已全部改指节名（本批七档 + 一个集成档）。决定号在需求档 ∥ 设计档都没有对应项，无可改指之处；面外约 30 处仍在，删一半只会让两个面读成两套词汇 |
| ⑨ | 集成档 `test/integration/cross-instance-message.test.mjs`（§2 六 机读清单漏列，评审 #7 已记） | 46-2 的落点档（`test/rtm/tooling.md` 46 表末列点名）。实测 256 内容行，不越 500 |

### 验收读数（命令 + 结论）

- 单测：`node --test docs/batches/2026-11-14-inbox-pickup-window.test.mjs` ⇒ **10 例全过**（核闩在飞不取件 + 报数；CLI 真谓词挂起不算忙；CLI 真谓词面板记 `carrier`；Desktop 真谓词窗在场不算忙 + 走窗缝；Desktop drive 级入窗起轮；Desktop 残项回填；待取条数 + CLI 状态行；取件后报 0 + 延迟上界一拍；CLI 开轮面两条去路 + 开轮没成）。
- **失败侧（不改就红）**：把 CLI `isBusy` ∥ `ready` 与 Desktop `busyOf` 临时改回改前形态再跑同一档 ⇒ **5 例红**，报文分别是「挂起窗不算忙 ⇒ 该拍取件」`0 !== 1`、`reason` 读 `['busy']` 而非 `['carrier']`、Desktop 两例 `0 !== 1`；恢复后两个档的 sha256 与改前逐字节相同（`timer-watch.mjs` `C9933359…A349` ∥ `suspension-timers.mjs` `C98B5F2C…BA28`），`OLD-PROBE` 标记零残留。
- 集成：`node --test test/integration/cross-instance-message.test.mjs` ⇒ **2 例全过**（46-1 原例仍绿；46-2 新增：窗在场下一拍取走 + 恰一次唤醒 + 宿主 `turn` 零直接调用；在飞期再投一条 ⇒ 该轮回合数不变、消息留 inbox；窗带残项退出 ⇒ 续发恰一次）。失败侧：把 CLI `isBusy` 改回旧形态再跑 ⇒ 46-2 红在「窗在场不算忙 ⇒ 该拍取走并由窗口起一轮」`0 !== 1`，46-1 仍绿。
- 桌面套件：`thincoder-desktop && node test/run.mjs` ⇒ **14 例全过**（渲染面 `state.mjs` ∥ `store.mjs` 改动的邻接面）。
- 语法：本批 15 档逐档 `node --check` 全过。
- 环境修复（父侧批准的）：`node scripts/dev-link.mjs --force --win32-only` ⇒ 五链终态 5 规范 ∕ 0 未收敛；修复前 `thincoder-desktop/node_modules/@thincoder/core` 是 0.11.1 物化副本（缺 `instance-*.mjs`），桌面主面 `import suspension-timers.mjs` 直接 `ERR_MODULE_NOT_FOUND`；修复后同命令返回 `OK [ 'createSuspensionTimers' ]`。node_modules 不入 git，属环境修复不属产品改动。

### 落地核对

设计档逐句仍成立 ⇒ 无漂移。（本批没有让 `docs/core/design/MULTI-INSTANCE-COLLAB.md` ∥ `docs/desktop/design/IPC.md` ∥ `docs/cli/design/TUI.md` 的任何一句变假：签名 ∥ 两端谓词 ∥ 落点 ∥ 三帧 ∥ `text = 条数` ∥ 归零摘除逐条对得上。）

另记两处**判据面**（非设计档）的读数，供收口裁：

- §2 四 首行「`onTake` 零调用、inbox 目录零 stat」的**后半句与设计冲突**：设计「取件闩」写「在飞期一拍 = 一次判据 + 一次待取条数 stat」，代码按设计走——生产装配（CLI ∥ Desktop 都传 `onPending`）下在飞一拍**必有一次 stat**。且该子句目前**不可观测**（无 stat 计数缝，`readdirSync` 是模块级具名导入）。本批的单测断言的是可观测的那半句：在飞一拍 `onTake` 零调用、消息仍在盘、该拍照报条数；另加一例覆盖「不传 `onPending` 时同样不取件」。
- §2 四 首行另半句「inbox 目录零 stat」若要留下，需要一个可数的读面；本批不新增该缝。

### 审计与代码评审轮次

- **内部偏差审计（explore，只读）**：1 轮完成，`VERDICT: findings`（🔴 0 · 🟡 4 · 🔵 3）。已修 3 条：
  - 🟡 #1「`createInboxTake` 单测零调用」⇒ 补两例（有活窗口 ⇒ 入窗队列 + 唤醒 + 宿主 `turn` 零调用；无窗 ⇒ 开普通回合 resolve；开轮没成 ⇒ reject + 逐字丢失行）。
  - 🟡 #2「『零 stat』判据与交付相反」⇒ 判据子句记入上「落地核对」，单测补上「不传 `onPending` 同样不取件」的可观测侧。
  - 🟡 #4「§5 空」⇒ 本段。
  - 未修（据实披露，非缺陷整改项）：🟡 #3「CSS 未交付」= 该处 CSS 本不存在（见披露 ⑤）；🔵 #5/#6/#7 = 清单外改动，见披露 ②③④ 与本节末「清单外改动」。
- **代码评审（advisor `type:"code"`）**：见下一条追加。

### 代码评审（advisor `type:"code"`）与修正轮

评审 1 轮：🔴 1 · 🟡 6 · 🔵 2。逐条处置：

| # | 严重度 | 评审所指 | 处置 |
|---|---|---|---|
| 1 | 🔴 | CLI `createInboxTake` 的窗判据只认 `state.suspended`，而「释放窗口」（上一轮尾部仍在跑：标题生成 ∥ 蒸馏 flush ≤5 s ∥ 落盘，`processing` 已假、`suspended` 尚未置位、`_suspPending` 真）不在其列 ⇒ 该拍的消息被当顶层回合插进去，两个 `runAgent` 循环同写一份 history（`_suspPending` 本就是为挡这个设的；同仓 `key-handler-busy.mjs` ∥ `key-handler-edit.mjs` 对该窗口用的是 `suspended ∥ _suspPending` 双判据） | **已修**：窗判据改成 `state?.suspended === true \|\| state?._suspPending === true`（与 Enter 入队同形；`_suspWake` 缺位时可选调用，消息留在队列由会话启动后按输入优先消费）。补单测一例：`{ suspended:false, _suspPending:true, processing:false }` ⇒ 宿主 `turn` 零调用、消息进队列、唤醒一次；`_suspWake` 为 null 时同样零丢 |
| 2 | 🟡 | 核档头注「跨实例消息**不进** `state.pendingInput`」与本批新增的入窗去路相反 | **已修**：改成「不另开排队通道（不挂 `consumeQueuedInput`、不进一步一取的循环头），只借用既有队列作**落法**」 |
| 3 | 🟡 | 核档 `isBusy` 形参注释「真 ⇒ 本拍零取件零 stat」与同档常量注释「在飞期一拍 = 一次判据 + 一次待取条数 stat」相反 | **已修**：形参注释改成同一口径（零取件，只报待取条数；传了 `onPending` 才有那一次 stat） |
| 4 | 🟡 | `store.mjs` 回合起跑门注释仍写「两槽…`{ lost?, blocked? }`」 | **已修**：改三值 |
| 5 | 🟡 | 批档 §2 四 首行判据「inbox 目录零 stat」与设计冲突且不可观测 | **不自行改**（§2 是设计席笔域）：已记入上「落地核对」，请收口轮改判据口径 |
| 6 | 🟡 | 桌面渲染面（`pending` 帧 ∥ 归零摘槽 ∥ 显示形）零自动化判据 | **不修（据实披露）**：该 import 链经渲染面的浏览器 import map 取 render-core（`renderer/views/chat-scroll.mjs` 的 `/rc/scroll.mjs` ∥ `renderer/subagent-reduce.mjs` 的 `/rc/subblocks/state.mjs`），平 node 解析成 `D:\rc\…` ⇒ `ERR_MODULE_NOT_FOUND`（已实测）。要覆盖需先给该面一个可载入的缝，属结构改动，不并入本批 |
| 7 | 🔵 | `pending` 槽随回合起跑门（`msg:send`）整键摘 ⇒ 常驻面每次发言瞬断 ≤1 拍 | **不改**：与行痕族四员的既有清点门一致（KD-74 两门），下一拍 `onPending` 自愈；已在 §7 的语义与实现差异上留痕于本表 |
| 8 | 🔵 | `suspension-drive.mjs` 注释错字「撒闩」且「该入口已随本批撤除」未点名入口 | **已修**：错字改「撤闩」；后半句删去（本批无此动作，属误述） |
| 9 | 🔵 | 桌面是否同形存在「上一轮尾部在跑、`busyOf` 已转假」的窗口 | **unverified**：本轮未查到 `executeTurn` 的 `flights` 置位 ∕ 释放点（`turn-driver.mjs` 只见到 `hold()` 占位径与 `interrupt` 径）。按父侧「不再开新查证」的指示，此条留在册，供收口轮或后续批次核 |

**修正轮次**：1 轮（上表 1∥2∥3∥4∥8 同轮改完 + 补两例），改后全绿，无回退。

### 最终读数

- 单测：`node --test docs/batches/2026-11-14-inbox-pickup-window.test.mjs` ⇒ **11 例全过**（新增第 11 例 = 释放窗口）。
  - 新增那一例的失败侧未再跑探针：旧判据 `state?.suspended === true` 在该状态位下必假 ⇒ 必落 `turn()` ⇒ `turn: 零调用` 断言必红，按构造成立而非按实测（探针面已在 5 例上实测过，见上「验收读数」）。
- 集成：`node --test test/integration/cross-instance-message.test.mjs` ⇒ **2 例全过**（46-1 ∥ 46-2）。
- 桌面套件：`thincoder-desktop && node test/run.mjs` ⇒ **14 例全过**。
- 语法：本批 16 档逐档 `node --check` 全过。
- 终态：**clean**（审计 1 轮 + 代码评审 1 轮 + 修正 1 轮，末轮全绿）。

### 清单外补列（§2 六 机读清单漏列，逐档）

| 档 | 性质 |
|---|---|
| `thincoder-desktop/renderer/events-wake.mjs` | 父侧扩面裁定（a）——`INBOX_KINDS` 加 `pending` + 归零摘槽 |
| `thincoder-desktop/renderer/store.mjs` | 同上——槽注释三值 ∥ 清点门注释三值 |
| `thincoder-desktop/renderer/views/chat-chrome.mjs` | 同上——`data-inbox-kind` 三值 + 行文来源 |
| `thincoder-desktop/renderer/views/chat-model.mjs` | 同上——`inboxOf` 闭集序三名 ∥ `inboxLineText` 出「待取 N 条消息」 |
| `thincoder-desktop/renderer/views/chat.mjs` | 同上——模型形 `inbox` 注释三值 |
| `test/integration/cross-instance-message.test.mjs` | 46-2 落点档（评审 #7 已记，§1 实施面补一行批准） |
| `test/integration/fixtures/cross-instance-window-harness.mjs` | 新档：46-2 的生产端壳夹具（§2 五 只约束「夹具不得替端壳答忙」，未列该档） |
| （CSS） | **无此档**：`renderer/**/*.css` 十三档内 `chat-inbox` 零命中——`chat-inbox-pending` 与 `chat-inbox-lost` ∥ `chat-inbox-blocked` 同形（类名产出、无样式）。要加样式属界面决定，本批不做 |

## §6 验证与收口（父代理）

### 一、父侧复跑读数（不采信报告，逐条自己跑）

| 面 | 命令 | 结果 |
|---|---|---|
| 批内单测 | `node --test docs/batches/2026-11-14-inbox-pickup-window.test.mjs` | **11 pass**（删除前跑） |
| 跨实例集成 | `node --test test/integration/cross-instance-message.test.mjs` | **2 pass**（46-1 原例仍绿 ∥ 46-2 新例） |
| 桌面套件 | `thincoder-desktop` → `node test/run.mjs` | **14 pass** |
| 全量集成 | `D:\teamcode\thincoder` → `node test/run.mjs` | **217 例 / 215 绿 / 2 红** |

两条红 = `CLI 43-1` ∥ `CLI 43-2`（`doc-anchor-graph.test.mjs`），归台账 `#2404`（DOC-GRAPH 重写遗留），与本批改动面无交集；本批新增的 `CLI 46-2`、既有 `CLI 46-1`、他批 `CLI 53-1` 均绿。

### 二、判据打没打到真谓词（本批的病根）

- 单测 import 面实读：直接 import `thincoder-cli/src/tui/timer-watch.mjs`、`status-line.mjs`、`thincoder-desktop/src/main/suspension-timers.mjs`，**不经夹具伪造 `isBusy`**。这正是第 1 轮评审 #1 要的「不改就红」。
- 失败侧（实施席跑，父侧采信其读数）：把 CLI `isBusy` ∥ `ready` 与桌面 `busyOf` 改回改前形态 ⇒ **5 例红**，受阻因由读回 `busy` 而非 `carrier`，`46-2` 亦红；恢复后两档 sha256 与改前逐字节相同、探针标记零残留。

### 三、顺带修掉的既有缺陷

`thincoder-desktop/src/main/suspension-drive.mjs` 的返回面**缺 `armInbox`**，而 `turn-driver.mjs` 一直在调 `suspension?.armInbox(key, agent)` ⇒ 桌面取件面从不武装。此前因 `node_modules/@thincoder/core` 物化过期一直没暴露（环境链已按 `scripts/dev-link.mjs --force --win32only` 修为 junction）。本批已补出该出口。

### 四、落地核对

设计档与落地不一致的句子共两处，均已处置：

- 设计 §7「行迹文案与位置归各端显示档」射程过宽 ⇒ 已收窄到「待取条数那一段」，并补写 `lost` ∥ `blocked` 由核生成整行（`inboxTakeLostLine` ∥ `inboxBlockedLine`）。
- §2 四 首行判据「inbox 目录零 stat」与设计相反且不可观测 ⇒ 已改成可观测三条（`onTake` 零调用 ∥ 消息仍在盘 ∥ 该拍照报条数不变）。

其余无：代码与受审设计档逐条相符。

### 五、越界与补列

§2 六 机读清单原按设计轮改面写；实施期父侧裁定「桌面待取帧要真显示」（选项 a）后，渲染面六档与集成档、新夹具档进入改面，已在 §2 六 补列并写明漏列原因。无并发席在写该域，无竞态。

### 六、本批新债 4 条

| 行 | 内容 | 条件 |
|---|---|---|
| `#2417` | 代码注释里约 30 处 `§5.x` ∥ `D-MI…` 引用在文档重写后无对应节（改面外） | 下次动到相关文件 ∥ 专项注释清理批 |
| `#2418` | `createSuspensionDrive` 305 行 ≥ CODE-TIER §3 的 300 | 本批收口后独立开批 |
| `#2421` | VSC 缺「等待期在状态栏可见待取条数」半句（需求 §4 无落点） | 下次动 VSC 取件面或状态栏 |
| `#2422` | 桌面渲染面无自动化判据（import map 使平 node 载入必报 `ERR_MODULE_NOT_FOUND`） | 给该面开出可载入缝时一并补用例 |

### 七、文档门与单测档清退

- `doc_check(mode:"gate")` 覆盖本轮改动的 `.md`：**PASS**。
- 批内单测档 `docs/batches/2026-11-14-inbox-pickup-window.test.mjs` 已删（delete on use）；读数留在上表，不留可执行件。

### 八、结算与提交

- 台账 `#2416` 在途 → **已核销**（与本收口同笔）。
- 设计凭证已消费。
- 提交形态：与 `#2415`（knowledge 检索四改）**一笔提交**。理由：`test/rtm/tooling.md` 同时含 `53-1`（检索）与 `46-2`（取件）两行，按路径拆不出干净两笔；提交信息里分列两批内容与各自读数。
