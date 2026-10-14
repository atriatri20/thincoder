# 2026-10-12 · timer-completeness
> 六段 append-only，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 编制：主 agent · 2026-10-12 · 来源 = 用户 2026-10-12 15:13 原话「我还希望提供更完备的定时功能，比如到指定的时钟时间，或者周期定时，比如每隔15分钟，或者每天几点。」。
> 台账 = #1321（server · 归批）。前情 = docs/batches/2026-10-12-server-wake-face.md（在途——同面接缝：唤醒器归彼批，本批只设触发式样）。
## §1 讨论（主 agent）
**状态行**：已收口 2026-10-12
<§1 模板占位：本批条目 / 关键判据 / 授权口径>

### 1.1 本批范围与落点建议（父侧 · 2026-10-12 15:1x）

**来源（原话）**：15:13「我还希望提供更完备的定时功能，比如到指定的时钟时间，或者周期定时，比如每隔15分钟，或者每天几点。」+ 15:1x「我想知道实现这些有没有难度，是不是特别复杂，如果不复杂的话，我希望加上。」

**父侧复杂度实读（给用户的话的底稿）**：机制差异只在一个数——「下一次什么时候」。核条目已有 `expiresAt`（到点时刻）；周期 = 条目扩一字段 + 到点后重排下一拍（重排点宜在核出列件（`thincoder-core/agent/timers.mjs`——现为 `filter(t => t.expiresAt > now)` 式出列）⇒ 三端与服务面零改或微改）；绝对时刻 = 设置时换算（零新机制）。**不复杂 ⇒ 用户明示加上。**
**真正的设计面（非代码）**：① 频率下限与费用口径（每 15 分钟一投 ≈ 96 唤醒回合/日，回合耗 token；「只出提醒行、不拉起模型回合」的低费式取舍）② 错过时点口径（重启/断档 ⇒ 补投 ∥ 跳过）③ 帽 8 在周期下的语义（占坑 ∥ 豁免）④ 周期项可见/可取消（父侧补项——请裁）⑤ 时区口径（沿服务器本地时区先例 = METERING KD-SV-6）。

**落点建议 = 核**（四端同得）；落服务面独有 ⇒ 跨端差异 = 缺陷通道（须硬理由，设计轮若主张须上抛）。
**接缝**：周期提醒在服务面要用唤醒面 ⇒ 实施排期在 `docs/batches/2026-10-12-server-wake-face.md`（在途）落地之后；设计轮其唤醒接口引彼批设计（父侧已以 `dependsOn` 挂序）。
**边界**：不做 cron 全语法 ∥ 不做条件触发 ∥ 不动唤醒器设计（归兄弟批）。

### 1.2 落点裁定（用户 · 2026-10-12 15:25）

**用户原话**：「定时设计要四端都做。」——落点 = **核**（CLI ∥ VSC ∥ 桌面 ∥ 服务端四端同得），**已判、不再作开放问题**；设计直接按核级落点成章（若确遇核级不可行面 ⇒ 硬理由 + 上抛父侧，勿自行改判）。
**与总原则的关系**（用户 15:24 关联裁定「先把服务器搞定，客户端怎么用…先不要莽撞」）：总原则管**客户端「怎么用」的交互/用法面**（不推）；**核级共享机制面例外**——本题 = 共享机制 ⇒ 落核、四端同得为要。

### 1.3 授权（自动跑 · 用户 2026-10-12 15:48）

用户 15:48「后续都自动跑」= 本批**全链自动**（设计评审代点火 ∥ §4 代签 ∥ 修正/实施派发 ∥ 收口核销提交双推 token 终消费）+ **自缚三条**（代签仅三条件齐备——评审 pass ∧ 修正落地并父侧逐条核验 ∧ token 已签发 ∥ 新范围/口径裁决停下只摆一条 ∥ 破坏性先停）。默认全自动，用户随时可打断。

**父侧笔落定（2026-10-12）**：§2.8「范围外（提请 · 未动）」项已办——`docs/cli/requirements/TUI.md:38`（F17）陈句收正到位（取消面 = 模型工具 `cancel`/`list` ∥ VSC / 桌面对位 = 已接——阶段 2 批）+ 该档变更记录补 2026-10-12 一笔。

## §2 批次任务与设计（eng-designer）
**状态行**：设计完成 · 2026-10-12（fix 轮 1（评审 #282 十条逐条处置）＋ fix 轮 2（实施席 #294 上抛：at 标记位 ∥ T-TW50 随兄弟批）落地；落点 = 核（四端同得）；设计档 = AGENT-LOOP-ASYNC-POOL.md §6.30.18；开放点四条按 §4 推荐值落；机检 = 本档零新增（读数见 §2.9）；明细 = §2.8 ∥ §2.9）
<§2 模板占位：本批条目（覆盖） / 设计档落点 / 机制设计 / 受影响文件与测试面 / 验收对照 / 关键决策 / 上抛项>

### §2.1 本批覆盖的需求条目（三链同源——批档条目 = 设计验收 = 需求档条目）

| 需求条目 | 指针 | 本批处置 |
|---|---|---|
| 功能点 45 ①–⑤ | `docs/server/requirements/PROJECT.md:266-275` | **全覆盖**——① 绝对时钟时刻（含过时点即时口径）② 固定间隔（「每 N 分钟」）③ 日历式（「每天 HH:MM」本地时区）④ 一次性倒计时零变 ⑤ 周期项可见 ∕ 可取消 |
| AC-45 | 同档 `docs/server/requirements/PROJECT.md:341` | 对位验收 = A-TW14–A-TW19（设计档 §6.30.18） |
| 台账 | #1321 | 本批闭环对象（收口 = §6） |

**落点裁定（已定——不重开）**：落点 = **核**（用户 2026-10-12 15:25 裁「定时设计要四端都做」）——CLI ∥ VSC ∥ 桌面 ∥ 服务面经核件同得，端面零专属实现。需求原文与用户原话见 §1。

### §2.2 设计锚点（全文 = `docs/core/design/AGENT-LOOP-ASYNC-POOL.md` §6.30.18——单一权威源，本节只列锚）

- **载体扩展（增量可选 · 零迁移）**：条目形扩两**可选**字段 `everyMs`（毫秒 · 固定间隔）∥ `daily`（`"HH:MM"` · 日历式）；一次性条目形 `{ id, expiresAt, message }` **逐字零变**；`at` 条目携 `at: true`（**来源标记位**——非载重，显示面判形用；时刻单源 = `expiresAt`）。载体纯进程内（D-TW3），零盘面格式迁移。
- **重排（新 · 出列＋重排原子）**：`takeExpiredTimers`（`thincoder-core/agent/timers.mjs:38-44`）出列到期项时，对携 `everyMs`/`daily` 者同 id 克隆回插新 `expiresAt = nextFireAt(t, now)`（严格 `> now`）；一次性 ∥ 绝对时刻照旧被消费。**为什么在 take 内**：take 是全部消费面（回合边界 ∥ 空闲闩 ∥ 挂起窗 ∥ 服务面垫片）的公共读点 ⇒ 一处改动、四端零改获得续投。
- **`nextFireAt(entry, now)`**（新纯函数 · 出核）：固定间隔 `base + k × everyMs`（`k = max(1, floor((now − base) / everyMs) + 1)` · `base` = 首设刻 ⇒ **零漂移** · 错过拍**跳过不补投**）；日历式 = 宿主本地**严格 `> now`** 的下一 occurrence（秒位归零）；无两字段 ⇒ `null`。`TIMER_MIN_EVERY_MS` = 60000 常量同档出。
- **工具面**（`thincoder-core/agent-tools/timer.mjs`）：新参 `at`（`YYYY-MM-DDTHH:MM[:SS]` 本地 · 严格正则＋日历回读校验 · **过时点 ⇒ `expiresAt` = 所给刻（即时投递）**）∥ `every`（秒 · 下限 60s · **首投 = 设时 + N**）∥ `daily`（`HH:MM` · 过刻 ⇒ 明日）∥ `cancel`（按 id）∥ `list`（只读）；`{seconds, at, every, daily}` 至多一（互斥违例显式拒）；校验逐条显式抛错（不静默钳制）；id 唯一化 = `Date.now()` 撞号 +1 递增。
- **返回文案**（新增式逐字；**一次性式逐字零变**且不携 id）：四条设置式返回 + `cancel` 一条 + `list` 空 ∥ 非空逐行形 —— 逐字见设计档 §6.30.18。
- **可见 ∥ 取消面**：模型面 = `list` 动作（四端同得）；`/timers`（`thincoder-cli/src/tui/cmd-timers.mjs`）逐条行插 kind 段（`每 <N>m` ∥ `每天 <HH:MM>` ∥ `于 <YYYY-MM-DD HH:MM>`——**一次性行逐字零变**）；取消 = **模型工具 `cancel` 动作**（四端同得——**不设端专属取消 UI**：CLI `/timers cancel` 子命令等 = 新跨端差异 = 不许）；`/timers` 保持**只读**；状态行 `⏰N` ∥ VSC ∥ 桌面投影 = 零改。
- **帽 8 = 占坑语义**：周期项 1 条 = 1 坑；重排净零不触帽；`cancel` 释放坑。
- **口径（AC-45③ 明示）**：时区 = 宿主本地（先例 = METERING KD-SV-6）；跨日 = `Date` 日历运算承载（无特例代码）；重启 = 周期项随进程消失（D-TW3 既有语义）。
- **接缝（接口零增）**：兄弟批 `docs/batches/2026-10-12-server-wake-face.md` §2 ∥ `docs/server/design/agent/ADMIN-AGENT.md` §15——四端投递皆经核 `deliverExpiredTimers`（服务面同件 = 其 §15.1）⇒ 周期重排**免费搭车**；其再武装读 `pendingTimerDeadline`（重排后自动落新到期点）⇒ 唤醒器 ∥ 挂起窗 ∥ 空闲闩零改。本批**只引不重设计**；实施排期 = 彼批落地后（同片 `chat-env-tools.mjs` 串行）。
- **服务面审计面（微增量）**：`subjectOf("timer", …)`（`thincoder-server/src/agent/chat-env-tools.mjs:172-176`）按单一 `seconds` 派生主语 ⇒ 新式与 `cancel`/`list` 会出错误主语——随正 = 按分支各出主语（一次性式逐字零变）；排兄弟批之后。
- **关键决策**：D-TW9–D-TW17（设计档 §6.30.18 全表——含被否面）；D-TW7 行收正（取消面 = 模型工具 `cancel`）；§6.30.3 三处收正（写点句 = 工具 ＋ 出列重排面（原 `timer.mjs:59` 死坐标收正）· 帽注指针 · schema 句限本批）。

### §2.3 本批不做（明示边界）

cron 全语法 ∥ 条件触发（「当 X 发生时」——非定时）∥ 持久化 ∥ 重启存续（D-TW3 既有语义）∥ 端专属取消 UI ∥ 唤醒器设计（兄弟批）∥ 一次性 `seconds` 语义 ∥ 文案零变 ∥ **低费式**（只出提醒行不开轮——提请项，见 §2.6）∥ 子代理 timer 面（读对象 = 主 agent——既有构造性边界）。

### §2.4 受影响文件（现读 = 2026-10-12 设计轮实测）

| 文件 | 现读 | 增量 | 说明 |
|---|---|---|---|
| `thincoder-core/agent/timers.mjs` | 113 | +≈50 | `TIMER_MIN_EVERY_MS` ∥ `nextFireAt` ∥ take 重排 ∥ 档头「唯一写点」句收正 |
| `thincoder-core/agent-tools/timer.mjs` | 46 | +≈75 | 五参 ∥ 互斥 ∥ 校验 ∥ `cancel`/`list` ∥ 返回文案 |
| `thincoder-core/tool-docs/timer.md` | 6 | +≈8 | 描述面四式（逐字 = 父侧定稿） |
| `thincoder-cli/src/tui/cmd-timers.mjs` | 33 | +≈8 | kind 段 ＋ 档头取消面句收正 |
| `thincoder-server/src/agent/chat-env-tools.mjs` | 232 | +≈12 | `subjectOf` timer 分支（同片串行——排兄弟批后；坐标按届盘实读） |
| `docs/batches/2026-10-12-timer-completeness.test.mjs` | —— | 新 ≈320 | 批内件（拟新增 · 实施轮落）——**不入 server 门禁链**（先例 = `timer-wake-delivery` 批件不在链） |
| `docs/core/design/AGENT-LOOP-ASYNC-POOL.md` | 1141 | +≈150 | §6.30.18 ＋ 变更记录一行 ＋ D-TW7 ∥ §6.30.3 收正 |
| `docs/core/design/TOOLS.md` | 1362 | +1 | §6.7 `timer` 行扩述 |
| `docs/cli/design/TUI.md` | 937 | +≈6 | §7.6 行形态 ＋ 取消面句收正 |

**零改面（明示）**：`thincoder-core/agent/post-turn.mjs` ∥ 三端 `timer-watch.mjs` ∥ 三端 `suspension*.mjs` ∥ `thincoder-desktop/src/main/agent-host.mjs` ∥ `thincoder-vscode/src/extension/panel-callbacks.mjs` ∥ `thincoder-cli/src/tui/render-frame.mjs` ∥ `thincoder-cli/src/tui/agent-turn.mjs` ∥ `thincoder-cli/src/tui/tool-events.mjs`。

### §2.5 验收（逐条机检——判据行）

- **A-TW14–A-TW19**：对位验收表见设计档 §6.30.18（需求 ①–⑤ 逐条对位 ∥ AC-45 实走形 ∥ 一次性零回归 ∥ 四端同得 ∥ 口径明示 ∥ 机检零新增）。
- **批内件**（拟新增 · 实施轮落）：`docs/batches/2026-10-12-timer-completeness.test.mjs`——T-TW40–T-TW49（T-TW50 随兄弟批）；恒假钟 ∥ 直驱 · 零真实等待；跑法 = 仓根 `node --test docs/batches/2026-10-12-timer-completeness.test.mjs`。
- **回归腿**：`docs/batches/2026-10-01-timer-wake-delivery.test.mjs` 复跑全绿（一次性语义 ∥ 文案 ∥ 帽 ∥ 投递形态逐条零变）。
- **收口实走（父侧）**：设 1 分钟间隔 ⇒ 两投 ⇒ `cancel` ⇒ 零再投（AC-45 判据）；服务面随兄弟批部署收口。
- **doc-check 基线**（2026-10-12 设计轮实测）：悬空 25 ∥ 行宽 0 ∥ 行数面 18 报告；判据 = 本批四档逐档零新增（阈值不超基线）。

### §2.6 开放点（提请用户裁——均附推荐与代价）

① **频率下限**（D-TW16）：推荐 `every` 下限 60s 硬拒（AC 判据以 1 分钟实走 ⇒ 下限 ≤ 60s；更低 ⇒ 回合风暴）；被否：无下限 ∥ 30s ∥ 静默钳制。
② **低费式可做性**（D-TW17）：本批不做（现语义 = 到点自唤醒 + 开轮；quiet 化 = 语义分叉）——接口缝已在（`thincoder-core/agent/timers.mjs:105` `fireTimerWake({ busy, deliver, openTurn })`）；代价 = 「到点自动看/续」语义分叉。
③ **帽语义**（D-TW15）：推荐占坑（周期 1 条 1 坑 · 重排净零）；被否：周期豁免（最贵一类反被豁免）。
④ **可见面承载**：推荐 = 模型 `list` ＋ `/timers` kind 段；更富端面 UI = 各端新面（本批不做面）。

### §2.7 设计轮落档（本轮实际写盘）

`docs/core/design/AGENT-LOOP-ASYNC-POOL.md`（新 §6.30.18 ＋ §6.30.3 三处收正 ＋ D-TW7 行收正 ＋ 变更记录一行）∥ `docs/core/design/TOOLS.md`（§6.7 `timer` 行扩述 ＋ 变更记录一行）∥ `docs/cli/design/TUI.md`（§7.6 两条收正 ＋ 变更记录一行）。机检读数 = §2.5 末行。设计评审（advisor）+ 用户批准 = 后续段（§3 ∥ §4）。

### §2.8 fix 轮落档（评审 #282 十条逐条处置 · 2026-10-12）

**处置面**：十条全处置（#1 阻断收正）；改动档 = `docs/core/design/AGENT-LOOP-ASYNC-POOL.md` ∥ `docs/cli/design/TUI.md`；`docs/core/design/TOOLS.md` 本轮零改（§6.7 `timer` 行已含四式——无落点）；描述档未改（`thincoder-core/tool-docs/timer.md` 逐字文本仍待父侧定稿）。

| # | 处置 → 落点（fix 后现盘行号） |
|---|---|
| 1🔴 | TUI.md §7.6 对位行收正 = 「已接线（阶段 2）」（⇒ AGENT-LOOP §6.30.10–§6.30.11；原「本批不接」句删）——同节同族残留自查 = 零 |
| 2🟡 | AGENT-LOOP §6.30.9 边界 3（`:554`）∥ §6.30.15 边界 2（`:701`）挂阶段限定（schema 句——扩五参见 §6.30.18） |
| 3🟡 | 周期项 × awaiting 口径 = **有意语义**——三处同拍：AGENT-LOOP §6.30.18（`:848–849`）∥ TUI.md §7.1（`:554`）∥ TUI.md §7.2（`:573`） |
| 4🟡 | 默认 `message` 逐式表——AGENT-LOOP §6.30.18（`:839–840`）＋ T-TW40/41/43/44 预期并入（`:891–895`） |
| 5🟡 | 工具面时钟缝 = `ctx.now ?? Date.now()`——§6.30.18（`:826–827`）＋ 用例表头注（`:887`）；缺省生产零变 |
| 6🟡 | §6.30.18 开放点落文口径注（`:918`）——推荐值已入册 · 待裁 |
| 7🔵 | `<dur>` 定形（`<mm:ss>` ∥ `<h:mm:ss>`）＋ 非整分 `每 <N>s`——AGENT-LOOP `list` 行（`:836`）∥ §6.30.18 可见面行（`:844`）∥ TUI.md §7.6（`:692`）；T-TW49 补臂（`:900`） |
| 8🔵 | §6.30.18 接缝句（`:851`）⇒ 「皆经 `takeExpiredTimers`（或其在各端的转口 ∕ 直调——服务面直调 = `thincoder-server/src/agent/chat-env-tools.mjs:224`）」 |
| 9🔵 | §6.30.3 D-TW8 契约句锚（`:450`）⇒ `thincoder-core/tool-docs/timer.md:4`；**同族增补一处**：同节开关③理由句（`:445`）描述面锚 ⇒ `thincoder-core/tool-docs/timer.md:2-4`（同缺陷类——报备） |
| 10🔵 | §6.30.18 描述面行（`:841–842`）＋ 预算读数（收口轮复跑 `node scripts/tool-schema-size.mjs` 登记读数随动） |

**发现 3 裁定句（口径 ＋ 理由）**：口径 = 周期项在途 ⇒ 恒不计 awaiting（§7.1 除外恒生效）；理由 = 与一次性项同谓词同读法——除外理由 =「自动续跑在途」，周期项 = 持续自动续跑在途，无特判必要；退出径 = `cancel`（释放坑）∥ `agent.timerWake` 关。
**发现 6 待裁收正点（裁定 ≠ 推荐值时）**：D-TW16 异值 ⇒ `TOOLS.md` §6.7 下限句 ∥ AGENT-LOOP §6.30.18 校验句 ∥ T-TW42 ∥ A-TW15；D-TW15 异值 ⇒ `TOOLS.md` §6.7 帽句 ∥ AGENT-LOOP §6.30.3 帽注；D-TW17 ∥ ④ = 另轮面（未落文）。
**受影响面表随补（两行）**：`thincoder-core/agent-tools/timer.mjs` 行补「时钟缝（`ctx.now`）」· `thincoder-cli/src/tui/cmd-timers.mjs` 行补「`<dur>` 格式」——§6.30.18 表同拍。
**机检（仓根 `node scripts/doc-check.mjs`）**：fix 前 = 悬空 27 ∥ 行宽 7（均在他档）；fix 后 = 悬空 26 ∥ 行宽 0——**本批改动零新增**（我两档悬空 0 ∥ 行宽 0；悬空差额 −1 = 他档在途收正，非本批）；一轮自纠 = 首稿 5 行超宽（本档）⇒ 折行收正（终态零）。
**范围外（提请 · 未动）**：`docs/cli/requirements/TUI.md:38` 同族陈旧句（「VSC / 桌面对位 = 不接」＋「取消面不做」）——父侧笔。

### §2.9 fix 轮落档 2（实施席 #294 上抛 · 父侧裁定 · 2026-10-12）

**处置面**：两条裁定逐条落（**零新语义**——裁定 = 最小标记位 + 用例归属）。改动档 = `docs/core/design/AGENT-LOOP-ASYNC-POOL.md`（`:804` ∥ `:836` ∥ `:844-845` ∥ `:888-889` ∥ 变更记录 `:1274`）＋ 本档 §2 本体行就地收正（§2.2 锚 ∥ §2.5 批内件句）。

**裁定面（父侧 · 逐条）**：
① **`at` 条目携 `at: true`**（纯来源标记位——非载重；时刻单源 = `expiresAt`；机制面零变；显示面判形 = `entry.at` 在场 ⇒ at 段）——原载体句「一次性 ∕ 绝对时刻条目形 `{ id, expiresAt, message }` 逐字零变」与显示面判形相抵（at 类无可辨字段 ⇒ 规范句成死文），随正；一次性条目形零变保持。
② **T-TW50 不入本件、随兄弟批**（服务面 `subjectOf` 片本实施轮显式排除 · 同片串行，排 `docs/batches/2026-10-12-server-wake-face.md`）；**本实施轮用例 = T-TW40–T-TW49（T-TW50 随兄弟批）**。

| # | 面 | 现 ⇒ 新 | 落点 ∥ 读回（fix 后现盘） |
|---|---|---|---|
| 1 | 载体句（裁定①） | 设计档「一次性 ∕ 绝对时刻条目形 = `{ id, expiresAt, message }` 逐字零变」⇒「一次性条目形 = 同形逐字零变；`at` 条目携 `at: true` 来源标记位（非载重——显示面判形用；时刻单源 = `expiresAt`；机制面零变）」 | 设计档 `:804`（读回在盘） |
| 2 | 判形句（裁定① · 显示面） | `list` kind ∥ `/timers` kind 段各补判形 = `at` 在场 ⇒ at 段（余式沿字段）；`:844` 微调随折行 | 设计档 `:836` ∥ `:844-845`（读回在盘） |
| 3 | 用例归属（裁定②） | 本档 §2.5「——T-TW40–T-TW50（恒假钟…）」⇒「——T-TW40–T-TW49（T-TW50 随兄弟批）」；设计档用例表表头同拍（T-TW40–T-TW49 落批内件 ∥ T-TW50 随兄弟批）——**报备**：设计档表头处置枚举未列，按三链同拍 | 本档 `:80` ∥ 设计档 `:888-889`（读回在盘） |
| 4 | 批档锚同拍（裁定①） | §2.2 载体锚「一次性 ∥ 绝对时刻条目形 `{ id, expiresAt, message }` 逐字零变」⇒ 与 `:804` 同读法（一次性零变 ＋ `at` 携标记位） | 本档 `:45`（读回在盘） |

**零触面（明示）**：设计档 `:903`（T-TW50 用例行——定义面，无归属句）∥ `:1268`（设计轮变更记录——冻结历史）；`docs/cli/design/TUI.md:692`（只读核——`于` 段判形与标记位读法一致；未写）。
**机检（仓根 `node scripts/doc-check.mjs`）**：fix 后 = 悬空 28 ∥ 行宽 0——**本批四档零新增**（悬空均在他档：桌面族 `views/*` ∥ `mount-settings-team.mjs` 等文件移动在途；我两档悬空 0）。
**读回核**：四条逐号落 + 读回在盘（上表「落点 ∥ 读回」列）；三链读法逐处一致（标记位 = `:804` ∥ `:836` ∥ `:844-845` ∥ §2.2；用例归属 = §2.5 ∥ `:888-889`）。
**状态行随拍**（fix 轮 2 两条 · 修正块 = §2.9）。

## §3 设计评审（评审子代理）

### 轮次 1（评审子代理）

**评审对象**：timer-completeness 批设计（功能点 45 + AC-45 · 台账 #1321）——设计全文 = `AGENT-LOOP-ASYNC-POOL.md` §6.30.18 ∥ `TOOLS.md` §6.7 ∥ `TUI.md` §7.6（对象状态 = 待评审）。
**实核面（只读抽检，作证据用）**：`thincoder-core/agent/timers.mjs`（113 行 · `takeExpiredTimers:38-44` 逐字命中）· `thincoder-core/agent-tools/timer.mjs`（46 行 · 默认文案 `:34` · `Date.now()` 直取 `:33` · `id: Date.now()` `:42`）· `thincoder-core/tool-docs/timer.md`（6 行）· `thincoder-cli/src/tui/cmd-timers.mjs`（33 行 · 档头「取消面不做」句 `:6`）· `thincoder-core/agent/post-turn.mjs:21` · `thincoder-server/src/agent/chat-env-tools.mjs`（232 行 · `subjectOf` `:172-176` · `takeTimerLines` 出列 `:224`）——受影响文件表代码档行数逐档相符（判据 8 合规：无 >500 越档 · 无拆分义务）。
**局限**：无文档地图 · 无项目标准档 ⇒ 文档归属 / 方法论按 Project Guide + 仓内既有惯例判；兄弟批（server-wake-face）档与 `ADMIN-AGENT.md` §15 未读（unverified）。

| # | Category | Severity | Issue | Suggestion |
|---|----------|----------|-------|------------|
| 1 | Document ownership（机制级两处不同述） | 🔴 | `docs/cli/design/TUI.md:703` 现文「**VSC / 桌面对位**：本批不接（判据 = `docs/core/design/AGENT-LOOP-ASYNC-POOL.md` §6.30.5——唤醒面不具备或成本高）」与 §6.30.5 表相抵：`:475`「| 桌面 | ✅（阶段 2）」· `:476`「| VSC | ✅（阶段 2） | …+ 自有驱动第三兑现态 + 可见面（状态行 `⏰N` + 触发落行）」；§6.30.14 `:545`（A-TW4）同判「**阶段 1 原样 · 阶段 2 已接线**：同表两行改 ✅」。两处为同一机制（timer 面对 VSC/桌面的支持面）的活体描述，方向相反；本批恰在改 §7.6（kind 段 `:692` + 取消面句 `:693`），变更记录 `TUI.md:939` 亦自称该节收正，独遗留此行未收。按 R1 例外 / R7e 例外（机制级描述错配须收口后方可过）不降格 | 把 `:703` 收正为现态（改指 §6.30.10–§6.30.11 的端面接线块，或标注该句被阶段 2 取代）——一行量级；同拍核 CLI 需求档同句（见报告末「范围外注」） |
| 2 | Doc ownership / Doc-state（边界句滞后） | 🟡 | 本批扩五参（`AGENT-LOOP-ASYNC-POOL.md:822`）与同档两条边界句相抵：`:554`「参数 schema 零变（timer 工具参数面）」· `:701`「timer 参数 schema 零改」；设计已对 §6.30.3 同位句做「schema 句限本批」处理（变更记录 `:1254`），两条边界句未同拍——且同档先例 = `:552` 边界 1 已挂「阶段 2 批已接线」注 | 按 `:552` 同法给两条边界句挂批次限定（「阶段 1 / 阶段 2 边界——timer-completeness 批扩五参，见 §6.30.18」），消读者把失效边界读成活约束 |
| 3 | Requirements coverage / 设计缺口 | 🟡 | 周期项与 awaiting 除外限定的交互未判：`TUI.md:573` 置位谓词排除「**在途 timer ∧ 唤醒会武装**（主 agent `_pendingTimers` 非空 ∧ `agent.timerWake` 开）」+ `:554`（§7.1 表 awaiting 行）；周期项（尤其 `daily`）落地后 `_pendingTimers` 恒非空 ⇒ 该除外**永久生效**，「不计 awaiting」由一次性瞬态变会话常态，而设计 `:840` 对状态行 ∕ attention 面声明「零改」，未判该后果 | 在 §6.30.18 与 §7.1/§7.2 同拍登记该口径（明示「周期项在途 ⇒ 恒不计 awaiting」为有意语义，或给除外限定加界——如仅一次性项 ∕ 到期窗内），使 §7.1 除外行与 `userNeededAtTurnEnd` 判据对周期项有唯一读法 |
| 4 | Clarity / 默认文案 | 🟡 | 新式未定形默认提醒文案：现默认 `thincoder-core/agent-tools/timer.mjs:34` 逐字内插秒数（`⏰ Time's up (${seconds}s)…`），而 `at` ∥ `every` ∥ `daily` 不携 `seconds`（设计 `:822-833` 只定返回文案与 `seconds` 语义，未给新式默认 `message`）；批内件 T-TW40 ∥ T-TW41 ∥ T-TW43 ∥ T-TW44 均不传 `message` ⇒ 实现与用例对同一路径无可照文案 | 在 §6.30.18 补「默认 `message` 逐式」表（或声明新式一律要求显式 message / 缺省文案由父侧定稿），并把该行并入 T-TW40–T-TW44 的预期 |
| 5 | Acceptance criteria / 可测性 | 🟡 | 用例表声明「恒假钟 ∥ 直驱 · 零真实等待」（`:877`）且 T-TW40 ∥ T-TW42 以假钟直驱**工具面**（`timer { at/every … }`），但工具面时钟现为硬取（`thincoder-core/agent-tools/timer.mjs:33` `Date.now()`），设计未给工具面时钟缝；可注入 `now` 者仅 `takeExpiredTimers(agent, now)` ∥ `nextFireAt(entry, now)`（`:806` ∥ `:811`）⇒ 「首投 = 设时 + 60s」（`:883`）类断言在工具段落墙上时钟，易成墙钟脆测 | 定形时钟缝（参数覆盖 + `?? Date.now` 默认回落——缺省 ⇒ 生产行为零变；用例 finally 复位）或声明「工具段只断言 `expiresAt - 捕获刻 ∈ [N, N+ε]`」的容差判据，二选一并写进用例表 |
| 6 | Scope coordination（协调项，非缺陷） | 🟡 | 四个开放点（`:906`）实施前无裁定，其中 D-TW16（`every` 下限 60s）已按推荐值落成规范文（`TOOLS.md:241`「下限 60s」· §6.30.18 校验 `:824` · A-TW15 实走形 = 1 分钟两投）；若裁定另值，四档同拍收正；另 D-TW15（占坑）已落 `TOOLS.md:242` ∥ §6.30.3 `:444` | 实施前把四条开放点的裁定逐条入批档（D-TW16 裁定 ≠ 60s 时同拍收正 TOOLS §6.7 ∥ §6.30.18 ∥ T-TW42 ∥ AC-45 实走形）——按协调项登记，不作缺陷 |
| 7 | Clarity（可见面单位 ∕ 长时长格式） | 🔵 | 同一数据两套单位无换算口径：模型 `list` kind = `every <N>s`（`:835`）对照 CLI `/timers` kind = `每 <N>m`（`TUI.md:692`）——`every` 非整分（如 90s）时 `每 <N>m` 无定形；且 `list` 的 `next <mm:ss>`（`:835`）对 `daily` ∥ `at` 可达数千分钟 | 定形单位与格式（非整分 ⇒ 秒形 ∕ 长时长 ⇒ `h:mm:ss`，或声明四舍入口径），两行同拍 |
| 8 | Clarity（接缝措辞） | 🔵 | `:842` 断言「四端投递皆经核 `deliverExpiredTimers`（服务面同件 = §15.1 行）」与现盘服务面消费路径不符：`thincoder-server/src/agent/chat-env-tools.mjs:224` 经 `core.takeExpiredTimers(pad, now())` + `injectTimerReminders` 直调（该档头 `:17-18` 自述同形）；周期重排免改的结论不依赖该措辞（单点 = take，`:808` 已同判），但「皆经 deliver」句面失准；兄弟批 §15.1 未读（unverified） | 把该句改为「四端投递皆经核 `takeExpiredTimers`（或其在各端的转口 ∕ 直调）」——与 `:808` 同口径 |
| 9 | Doc hygiene（死坐标残留） | 🔵 | §6.30.3 D-TW8 句仍把「the reminder fires at the deadline」契约句锚在 `thincoder-core/agent-tools/timer.mjs:16-27`（`:21`）（`:450`），而该句现址 = `thincoder-core/tool-docs/timer.md:4`（timer.mjs 该区间实为 parameters schema）；本批已在 §6.30.3 收正别的死坐标（原 `timer.mjs:59`，`:1254`）且正改该描述档（`:837`） | 同拍把该锚改指 `thincoder-core/tool-docs/timer.md:4`（与 `:837` 同址） |
| 10 | Methodology（描述面读数） | 🔵 | 本批扩描述档 `thincoder-core/tool-docs/timer.md`（6 ⇒ ≈14 行，`:852`），未登记描述面预算读数面（`TOOLS.md:265` 指向 `PROMPT-SYSTEM.md` §6.11「预算表唯一权威处」+ 机检 `scripts/tool-schema-size.mjs` 报告态；先例 = 读数随动入 §5）；单档帽 ≤8,000 字（`PROMPT-SYSTEM.md:329`）无触顶风险（该项正文未逐读，unverified） | 收口轮复跑 `node scripts/tool-schema-size.mjs` 登记读数随动（或在批档明示「报告态零触」），与既有先例同形 |

**范围外注（不赋严重级）**：同一支持面陈旧句亦在 `docs/cli/requirements/TUI.md:38`（F17「VSC / 桌面对位 = 不接（理由在册）」+「取消面不做——登记后续项」）——该档不在本评审声明域，仅作发现 1 的同族证据记录。

计数：🔴 1 · 🟡 5 · 🔵 4（共 10 条）。

VERDICT: changes-required —— 1 项 🔴 阻断（发现 1：`TUI.md:703` 与 §6.30.5 同机制两处相反表述，按 R1/R7e 例须先收正）。

### 轮次 2（评审子代理）

## 修复复核（轮 2 · 承 #282 十条 ＋ 两处报备增补）

**核面**：仅核 #282 发现 1–10 修复声明（🔴1 `TUI.md:703` 已接线 ⟹ ∥ 2–10 逐条）＋ 报备 `:445` 同族锚 ∥ `:844` 格式第三处；不新开发现面。四档本轮实读（`PROJECT.md` ∥ `AGENT-LOOP-ASYNC-POOL.md` ∥ `TOOLS.md` ∥ `TUI.md`）＋ 抽读在盘坐标（`timers.mjs` ∥ `agent-tools/timer.mjs` ∥ `tool-docs/timer.md` ∥ `dispatch-run.mjs` ∥ `chat-env-tools.mjs`）。

| # | Orig# | File | Severity | Status | Notes |
|---|-------|------|----------|--------|-------|
| 1 | 1 | docs/cli/design/TUI.md | 🔴 | Fixed | `:703` 现文 =「**VSC / 桌面对位**：**已接线（阶段 2）**（`docs/core/design/AGENT-LOOP-ASYNC-POOL.md` §6.30.10–§6.30.11——核件 opt-in timer 面 ＋ 端面空闲闩 ∕ 窗内兑现 ∕ 可见面）；各端取本表同语义、各自实现（非 byte-identical）」——原「本批不接（判据 = §6.30.5——唤醒面不具备或成本高）」句已删；与 §6.30.5 ∥ §6.30.14 现态对齐（复读 §7.6 全节：同族残留 = 零） |
| 2 | 2 | docs/core/design/AGENT-LOOP-ASYNC-POOL.md | 🟡 | Fixed | `:554` =「参数 schema 零变（timer 工具参数面）——**阶段 1 边界**（timer-completeness 批扩五参——见 §6.30.18）；不触 #442 已收口面…」∥ `:701` =「timer 参数 schema 零改——**阶段 2 边界**（timer-completeness 批扩五参——见 §6.30.18）；**不新增机械门**…」——两条同法挂批次限定 ✔ |
| 3 | 3 | TUI.md ∥ AGENT-LOOP-ASYNC-POOL.md | 🟡 | Fixed | 三处同拍登记：TUI `:554`（§7.1 表 awaiting 行：「**周期项在途 ⇒ 除外恒生效——有意语义**（持续自动续跑在途；timer-completeness 批 2026-10-12——…§6.30.18）」）∥ TUI `:573`（§7.2 置位谓词同句）∥ TUI `:674`（§7.6 指针）＋ AGENT-LOOP `:848-849`（「attention 面口径（周期项 × awaiting 除外——评审轮 1 #3 收正）」＋「裁定 = 有意语义」＋「同拍 = `docs/cli/design/TUI.md` §7.1 ∥ §7.2」）——单源互指、读法唯一 ✔ |
| 4 | 4 | docs/core/design/AGENT-LOOP-ASYNC-POOL.md | 🟡 | Fixed | `:839-840`「**默认 `message`（`message` 未传时——逐式 · 评审轮 1 #4 收正）**」逐式表落位；一次性槽 `${seconds}s` 与现盘 `thincoder-core/agent-tools/timer.mjs:34` 逐字相符（零回归可检）✔；T-TW40 ∥ T-TW41 ∥ T-TW43 ∥ T-TW44 期望均已引用「默认表」✔ |
| 5 | 5 | docs/core/design/AGENT-LOOP-ASYNC-POOL.md | 🟡 | Fixed | `:827`「**时钟缝（评审轮 1 #5 收正）**：工具面取时单点 = `const now = ctx.now ?? Date.now()`…」；本轮实读 `thincoder-core/agent/dispatch-run.mjs:97-109` = `toolCtx` 字面量（键 = cwd ∕ agent ∥ depth ∥ signal ∥ callbacks ∥ `_toolCallId` ∥ onOutput ∥ onQuestion ∥ onPermissionRequest——**无 `now`**）⇒ 缺省回落 = 生产零变（设计句成立）；`:887` 用例表 ∥ T-TW42「（`ctx.now` 假钟——精确断言）」同形 ✔ |
| 6 | 6 | docs/core/design/AGENT-LOOP-ASYNC-POOL.md | 🟡 | Fixed | `:918` 新增「**落文口径（评审轮 1 #6——推荐值已入册 · 待裁）**」——①/③ 落文点逐处列名（TOOLS §6.7 ∥ §6.30.3 帽注 ∥ 校验句 ∥ T-TW42 ∥ A-TW15）＋「裁定异值 ⇒ 相应档同拍收正（收正点清单 = 批档 §2 fix 轮块 + 报告）」；②/④ 未落文如实标 ✔ |
| 7 | 7 | AGENT-LOOP-ASYNC-POOL.md ∥ TUI.md | 🔵 | Fixed | 三处单位/格式同形：`:836`（模型 `list`——`<dur>` = `<mm:ss>`（< 1h）∥ `<h:mm:ss>`（≥ 1h））∥ `:844`（`/timers`——kind = `每 <N>m`（整分）∕ `每 <N>s`（非整分））∥ TUI `:692`（同形逐处）——报备「`:844` 格式第三处」与另两处一致 ✔ |
| 8 | 8 | docs/core/design/AGENT-LOOP-ASYNC-POOL.md | 🔵 | Fixed | `:851` 接缝句收正 =「四端投递皆经核 `takeExpiredTimers`（或其在各端的转口 ∕ 直调——服务面直调 = `thincoder-server/src/agent/chat-env-tools.mjs:224`）」；本轮实读 `chat-env-tools.mjs:224` = `const lines = core.injectTimerReminders(pad, core.takeExpiredTimers(pad, now()))` ⇒ 坐标与措辞双双相符 ✔ |
| 9 | 9 | docs/core/design/AGENT-LOOP-ASYNC-POOL.md | 🔵 | Fixed | `:450` 锚改指 `thincoder-core/tool-docs/timer.md:4`（在盘逐字 = 「Returns the set confirmation — the reminder fires at the deadline.」）✔；报备「`:445` 同族锚」= `tool-docs/timer.md:2-4`（`:2` 到点自醒承诺句 ∥ `:4` 契约句在区间内）——实读正确 ✔ |
| 10 | 10 | docs/core/design/AGENT-LOOP-ASYNC-POOL.md | 🔵 | Fixed | `:842`「**预算读数（评审轮 1 #10）**：扩档 ⇒ **收口轮复跑 `node scripts/tool-schema-size.mjs` 登记读数随动**（先例 = 读数随动入 §5；预算表唯一权威处 = `docs/core/design/PROMPT-SYSTEM.md` §6.11——链 = `docs/core/design/TOOLS.md` §6.9）」✔ |
| 11 | 9 残留 | docs/core/design/AGENT-LOOP-ASYNC-POOL.md | 🔵 | New（同族残留——非本轮修复引入；不阻断） | `:452` 合同句条仍写「对应段 = `thincoder-core/agent-tools/timer.mjs:22-25`」——该区间现文实读 = `},` ∕ `required: [],` ∥ `},` ∥ `readonly: true,`（非合同句）；合同句现行文 = `thincoder-core/tool-docs/timer.md:5`（逐字在盘：「Delivery: while a turn is running it lands at the next step boundary… the idle wake is available on the CLI / VSC / desktop foregrounds and suspension windows (headless is structurally unsupported); other paths keep the step-boundary behavior.」）。建议随实施轮改指（与 `:450` 同法） |

**修复轮登记核**（记录面）：`AGENT-LOOP-ASYNC-POOL.md:1268` ∥ `TUI.md:941` 两条「设计评审轮 1 修正（fix）」变更记录在册、逐条对位本轮复读实况；TOOLS 无修复轮改动（档长零变——与清单相符）✔。

计数：🔴 0 · 🟡 0 · 🔵 1（前 10 项全部 Fixed；第 11 项 = #9 同族残留，非阻断）

VERDICT: pass

## §4 用户批准（主 agent）

**代签（主 agent · 2026-10-12 · 全链自动模式）**

- **授权**：用户 2026-10-12 15:48「后续都自动跑」（本批 §1.3 自缚三条在场：代签仅三条件齐备 ∧ 新范围/口径裁决停下只摆一条 ∧ 破坏性先停）。
- **三条件核**：① 设计评审 pass = 轮 2（#293 复核）——🔴 0 ∥ 🟡 0 ∥ 🔵 1（`:452` 同族死锚残留——非阻断，随实施轮改指）✔ ② 修复轮全落并父侧逐条核验 = 十条（§2.8 + 轮 2 表逐条 Fixed，实读核过）✔ ③ token 已签发（定时批设计槽——机读实查在场）✔。
- **批准范围** = 本批设计 `docs/core/design/AGENT-LOOP-ASYNC-POOL.md` §6.30.18 之实施——`thincoder-core/agent/timers.mjs` ∥ `thincoder-core/agent-tools/timer.mjs` ∥ `thincoder-core/tool-docs/timer.md` ∥ `thincoder-cli/src/tui/cmd-timers.mjs` ∥ 批内件 `docs/batches/2026-10-12-timer-completeness.test.mjs`；**服务面 `thincoder-server/src/agent/chat-env-tools.mjs` 一片除外**（同片串行——排兄弟批 server-wake-face 落地后，§2.4）。
- **开放点处置**：四条（§2.6）按设计推荐值实施（D-TW16 = 60s 硬拒 ∥ D-TW15 = 占坑 ∥ ④ = 模型 `list` + `/timers` kind 段 ∥ ② 低费式本批不做）；用户若裁异值 ⇒ 按 §2.8 末段收正点清单同拍收正。
- **实施派发** = eng-coder（initial 轮 · 本日）。

## §5 实施记录（eng-coder）

**状态行**：实施完成 · 2026-10-12（背离审计 clean ∥ 内部代码评审 pass；T-TW50 ＋ 服务面一片显式排除在册（§5.5 ∥ §5.6））

### §5.1 交付摘要（逐件动作 · 现盘实读）

| # | 件 | 动作 | 结果 |
|---|---|---|---|
| 1 | `thincoder-core/agent/timers.mjs` | `TIMER_MIN_EVERY_MS` 常量 ∥ `nextFireAt`（固定间隔零漂移 ∥ 日历式严格 `> now` ∥ 守卫返 `null`）∥ `takeExpiredTimers` 出列＋重排原子（同 id 克隆回插）∥ 档头收正 | 113 → **164** 行 |
| 2 | `thincoder-core/agent-tools/timer.mjs` | 五参（`at`/`every`/`daily`/`cancel`/`list`）∥ 互斥 ∥ 逐条显式校验 ∥ 时钟缝 `ctx.now ?? Date.now()` ∥ 首投 = 设时 + N ∥ id 撞号 +1 ∥ 帽占坑 ∥ 返回文案逐字 ∥ 默认 `message` 逐式 ∥ `at` 来源标记位 | 46 → **220** 行 |
| 3 | `thincoder-core/tool-docs/timer.md` | 父侧定稿逐字落档（12 行；旧 6 句逐字保留） | 6 → **12** 行 |
| 4 | `thincoder-cli/src/tui/cmd-timers.mjs` | kind 段（`每 <N>m` ∥ `每 <N>s` ∥ `每天 <HH:MM>` ∥ `于 <YYYY-MM-DD HH:MM>`）∥ `<dur>` 定形（`<mm:ss>` ∥ `<h:mm:ss>`）∥ 档头取消面句收正（`/timers` 保持只读） | 33 → **66** 行 |
| 5 | `docs/batches/2026-10-12-timer-completeness.test.mjs` | 批内件新增：T-TW40–T-TW49（10 用例 · 恒假钟 ∥ 直驱 ∥ 零真实等待） | **263** 行 · 10/10 绿 |
| 6 | `thincoder-server/src/agent/chat-env-tools.mjs` | **零改**（本实施轮显式排除——§5.6①） | 0 |

### §5.2 测试跑分（实施轮自跑 · 逐条）

- 批内件（T-TW40–T-TW49）：**10/10 pass · 0 fail · 0 skip**（`node --test docs/batches/2026-10-12-timer-completeness.test.mjs`）。
- 回归腿（T-TW36–T-TW39）：**6/6 pass**（`docs/batches/2026-10-01-timer-wake-delivery.test.mjs`——一次性语义 ∥ 文案 ∥ 帽 ∥ 投递形态零变）。
- 改动面定向单测：`docs/batches/2026-10-12-admin-agent-awareness.test.mjs`（核真件 timer 工具经 `deps.coreTools` 注入）**10/10 pass**。
- 冻结基线档（非门禁）：`docs/batches/2026-09-29-tools-carryover-t2.test.mjs` **4/6**——F2/F3 红，见 §5.4 #5。
- 未跑全仓套件（收口轮归父侧）；仓内 `test/` 树实读零 timer 断言（`thincoder-core` ∥ `thincoder-cli` ∥ `thincoder-server` 的 `test/*.mjs` 逐档无命中）。

### §5.3 机检读数（仓根）

- `node scripts/doc-check.mjs`：**行宽 0** ∥ 悬空 26（逐条在盘：全在他档；本批改动面零 `docs/*.md`——scanDirs = `docs`，核件 ∥ CLI ∥ 描述档与批内件 .mjs 皆在扫描域外）⇒ 本批零新增。
- `node scripts/tool-schema-size.mjs`（报告态）：49 档 · **121,086** 字符（builtin 62,952 ∥ gated 1,372 ∥ meta 46,295 ∥ instance 10,467）；超单档 8,000 = browser（11,959）∥ subagent（14,629）——均非本批面。

### §5.4 决策透明表（实施轮处置——含偏离与取代）

| # | 项 | 处置 | 理由 |
|---|---|---|---|
| 1 | `at` 条目携 `at: true` 来源标记位 | 按父侧裁回落码（设计 §6.30.18 条目形句处正随同一设计修复轮） | 两面 kind（`:836` `at <刻>` ∥ `:844` `于 <...>`）需可判来源；字段非载重（时刻单源 = `expiresAt`；消费面只读 id/expiresAt/message） |
| 2 | T-TW50（服务面审计主语）不入本件 | 移「本未做」（§5.6①） | 靶 = 服务面 `chat-env-tools.mjs`（本实施轮显式排除，排兄弟批 server-wake-face）；禁占位 skip 臂（父侧裁回 2） |
| 3 | `list` 第三槽「到期未投 ⇒ `due now`」落法 | 取「整体替换 `next <dur>`」读法 | 设计 `:836` 该句为 `<dur>` 槽定义（`due now` 非时长形）；背离审计判非背离 |
| 4 | `/timers` `<dur>` 定形对 ≥1h 一次性行同样生效 | 取设计 `:844` 行级 `<dur>` 定形；「一次性行零变」限 kind 段（破折注 =「段仅非一次性项插入」） | 背离审计判非背离；属设计自身定形后果 |
| 5 | 存量冻结基线档 F2/F3 转红 | 不修该档（批面冻结档在册）；提请收口轮登记取代 | 该件锚 2026-09-29 迁移期描述/schema 基线（`…-baseline.json`），本批按设计扩描述＋扩五参 ⇒ 断言被取代；**不入任一机检门禁**（`thincoder-core/test/run.mjs` 收集面 = `test/<name>.test.mjs` 单层） |
| 6 | 核重排面新增「基准非有限 ⇒ `null`」守卫 | 落码（同族守卫的防御性超集） | 防 NaN 回插成僵尸在途项（`pendingTimerDeadline` 跳过非有限值 ⇒ 不可见）；工具面为唯一生产者 ⇒ 生产不可达 |

### §5.5 审计与评审轮次（终态 = clean）

- **背离审计**（explore · 只读 · 1 轮）：结论 **clean**——PARTIAL ∥ SILENT-SIMPLIFICATION ∥ DOC-DRIFT ∥ OUT-OF-LIST 四类均零；非阻断观察 4 条（批档 §5 空档（本轮已落）∥ 设计档 as-of 坐标漂移 ∥ 行数增量估算偏小 ∥ 未定形边缘三条：`{list:false}` 落缺省一次性 ∥ `every` 数字串经 `Number` 强转 ∥ `message:""` 回落缺省）。
- **内部代码评审**（advisor · type=code · 1 轮）：**pass**——🔴 0 ∥ 🟡 2（**非阻滞**：核档头条目形句滞后 ∥ `at` 标记位与设计条目形句相抵 = 父侧裁定授权）∥ 🔵 5（`/timers` 非有限 `expiresAt` ⇒ `剩余 NaN:NaN` 无守卫 ∥ `{list:false}` 静默落缺省 180s ∥ CLI 臂墙钟脆测（无时钟缝）∥ T-TW50 延后留痕 ∥ 描述档中段句数「五句」与在盘 12 行（3+6+3）不符——逐字文本未可核）。
- **fix round**：2 次自纠——① 首跑后测试作者笔误（90s 时长形误写 `00:01:30` ⇒ 正 `01:30`）；② 评审后落码（`thincoder-core/agent/timers.mjs:10-11` 档头补 `at` 标记位句）。终态复跑：批内件 10/10 ∥ 回归腿 6/6。
- **未决**：描述档逐字文本句数（父侧确认项）∥ 设计档锚点漂移（父侧/设计面）∥ 桌面 `timer-watch.mjs` 档头陈旧句（§5.7②）。

### §5.6 本未做（显式清单）

① **服务面 `thincoder-server/src/agent/chat-env-tools.mjs` 一片**——含 `subjectOf("timer", …)` 五式主语（现仍按单一 `seconds` 派生 ⇒ 新式与 `cancel`/`list` 会出错误主语）与 **T-TW50**：本实施轮显式排除（同片串行——排兄弟批 `docs/batches/2026-10-12-server-wake-face.md` 落地后随正）。
② 低费式（只出提醒行、不开轮）= 设计 D-TW17 提请项——维持设计：本批不做。
③ 设计边界面：cron 全语法 ∥ 条件触发 ∥ 持久化 ∥ 重启存续 ∥ 端专属取消 UI（`/timers` 无取消子命令）——均未做（符合设计）。

### §5.7 域外注（提请父侧 / 设计面后续轮）

① **设计档死坐标**（描述档扩容 +6 行所致）：§6.30.3 `:450` 把契约句锚在「`tool-docs/timer.md:4`」∥ `:452` 写「对应段 = `timer.md:5`」——现址 = `:10`（契约句）∥ `:11`（Delivery 句）；`:445` 的 `timer.md:2-4` 区间同拍复核（该区间现含新增句）。
② **桌面 `thincoder-desktop/src/main/timer-watch.mjs:7`「唯一写点 = timer 工具」句**随本批重排落为不精确（`takeExpiredTimers` 亦回插）；该档在设计零改面内（本批未触）——提请后续轮收正（CLI ∥ VSC 同族档头实读无此句）。
③ **受影响文件表增量估算 vs 实读**：`timer.mjs` 46→220（估 +≈75）∥ `cmd-timers.mjs` 33→66（估 +≈8）∥ `timers.mjs` 113→164（估 +≈51 ✓）∥ `timer.md` 6→12 ✓——收口轮登记实读（均 < 500 建议线，无拆分义务）。

## §6 验证与收口（父代理）

**结论**：timer-completeness 批（台账 #1321）验证通过、收口（2026-10-12 · 主 agent）。

**核验读数**（父侧实跑/实读）：
- 批内件 `docs/batches/2026-10-12-timer-completeness.test.mjs`：**10/10**（T-TW40–49）∥ 回归腿 `docs/batches/2026-10-01-timer-wake-delivery.test.mjs`：**6/6**——父侧复跑，与实施席读数一致。
- **核件层真钟实走 PASS**（父侧脚本 `.thincoder/tmp/2026-10-12-timer-realclock-walkthrough.mjs`，195.3s）：设 `every 60` ⇒ 两投（+60.0s ∥ +120.0s，同 id 续投）⇒ `cancel` ⇒ 零再投（+125s 后 pending=0；待到 +195s 无第三投）；`history=2`。补机器腿（假钟）未覆盖的真实时钟路径。
- 三档实读逐点对设计核过（`timers.mjs` 164 ∥ `timer.mjs` 220 ∥ `cmd-timers.mjs` 66——重排出列原子 ∥ `nextFireAt` 零漂移 ∥ 四式互斥显式校验 ∥ `at` 标记位 ∥ kind 段——均与 §6.30.18 一致）。
- `doc-check`：**本批零新增**（悬空均存量、在册 #1311/#1314/#1273 跟踪；行宽 0；报告面迁移期引文不入闸）。
- `tool-schema-size` 读数（描述面预算随动）：49 档 · 121,086 字符；基线 103,529 ⇒ 1.17——存量超线面（非本批引入；超单档 8,000 两档 = browser ∥ subagent，存量）。
- cli `npm test` = 空套件（2026-09-28 全清后零测试，exit 0）——本批实质门 = 批内件 + 回归腿 + 本表诸读数。

**收口处置**：
- **死锚随正**（描述档 +6 行连带）：`AGENT-LOOP-ASYNC-POOL.md` §6.30.3 三锚 `:4→:10` ∥ `:5→:11` ∥ `:2-4→:2 ∥ :10`——主 agent 直接执行 · 可 revert（变更记录在册）。
- **被取代登记**：`docs/batches/2026-09-29-tools-carryover-t2.test.mjs` F2/F3 红 = 存量冻结基线（锚 2026-09-29 迁移期描述/schema）被本批设计取代——**非缺陷、不修**（该件不在 prepublishOnly 链）；判定在此登记。
- **「五句」问询答复**（实施席 §5 提问）：描述档中段**无五句版**——12 行（3+6+3，父侧定稿）即终形；盘面无「五句」措辞待正。
- **CLI 侧观感眼验** = 可选（需新进程；核件层实走已 PASS）。
- **遗留（已入台账）**：#1329（`/timers` NaN 守卫）∥ #1330（`{list:false}` 静默缺省）∥ #1331（CLI 臂时钟缝）∥ #1332（桌面注句）∥ #1333（服务面片 + T-TW50，随 server-wake-face 批）——均「归批」态。
- **暂缓批复核**：无。
- **核销**：#1321（本批）。
