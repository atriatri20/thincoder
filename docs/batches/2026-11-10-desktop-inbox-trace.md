# 2026-11-10 · desktop-inbox-trace
> 六段，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 每段只有一个作者：作者的段可 `append` 加内容、可就地改（`edit`）；非作者一概拒。
> 编制：主 agent · 2026-11-10 · 来源 = 用户 2026-11-10 00:15「为啥不做桌面端啊！」——裁定桌面端也要做，独立成批。
> 台账 = #2254（desktop · 归批）。前情 = 2026-11-09-inbox-watch-rearm（进行中）· 本批是它的桌面端补齐。
## §1 讨论（主 agent）
**状态行**：已收口 2026-11-10
<§1 模板占位：本批条目 / 关键判据 / 授权口径>

## 缘由与父侧自纠（2026-11-10 00:15）

**用户原话：「为啥不做桌面端啊！」**

**我上一轮的裁定是「不做」，理由三条**：① 交付目标不一致（这条是「闩不再哑」，桌面行痕是渲染面新功能）· ② 改动面 9 档且落点踩在 2026-10-05 修过的「行永不消失」bug 区域 · ③ 桌面无 Electron，做了也只能记「已接未验」。

**用户一句话点出问题。我自纠两处**：

- **②③ 都是真代价，但「代价大」不是「不做」的理由**——它只决定「值得花多少工夫、怎么验」，不决定「要不要」。**桌面端没有这条通道 = 那两端有人能看见、这一端永远哑**，而「哑」正是这批要治的病。
- **更硬的一处自相矛盾**：我**放行了 VSC**（同样缺宿主、同样只能记「已接未验」），却**卡住桌面**。**同一条理由在两端给出相反结论，就不是理由，是借口。**

**裁定（本批）= 桌面端照做，但独立成批**：不与「闩不再哑」混（那是另一条交付目标，且已进入实施），本批只做桌面 `ev:inbox` 行痕第四员。

## 已实读的改动面（实施席上抛，父侧采信其逐档证据）

**9 档，缺一不可**（缺了就是「零显示」或「永不消失」）：

1. `thincoder-desktop/src/preload/preload.cjs` —— `EVENT_CHANNELS` 白名单（表外名 throw ⇒ 不加则渲染面根本收不到）
2. `renderer/events-subscribe.mjs` —— `CHANNELS`
3. `renderer/events.mjs` —— 分派
4. `renderer/events-wake.mjs` —— 归约 `onInbox`（与 `onTimer` 同档同形）
5. `renderer/store.mjs` —— 切片 `inboxNotice` + `clearTurnTraces` **第四员**（不加 = 行永不再消失，正是 2026-10-05 修掉的那个 bug）
6. `renderer/frame-dispatch.mjs` —— `CHAT_KEYS`（不加 = 切片变了不重绘）
7. `renderer/page-read.mjs` —— 首屏门（切会话不残留）
8. `renderer/views/chat-model.mjs` —— 投影
9. `renderer/views/chat-chrome.mjs` —— 行组 + 锚

**跨层计数**：`preload.cjs` 的 `ev:*` 白名单 = **25 条**，与 `docs/desktop/design/PROJECT.md` §10 BE 行同源 ⇒ 加一条 = **25 → 26**。

**三份设计档要同轮补**（同一规则每层同轮改）：`docs/desktop/design/IPC.md` §1 · `RENDERER.md` §1.6（行痕族三员 → 四员）· `PROJECT.md` §10（25 → 26）。

## 验证面（写清，免得到时候含糊）

桌面端无 Electron ⇒ 真机行可见性 **验不了**。本批能证的是：契约层（通道登记、白名单、切片、清点时机）走单测与结构机检；**行在真机上出现 / 消失**这一条如实记「未验」。

**这不是免责声明，是范围**：不做真机验的部分要写清哪几条没验，不许用「已接」两个字糊过去。

## §2 批次任务与设计（eng-designer）
**状态行**：设计完成（修复轮 6 · 入窗撤闩三处旧态收正 + 宿主行数收正（134 ∥ 126 ∥ 341））
<§2 模板占位：本批条目（覆盖） / 设计档落点 / 机制设计 / 受影响文件与测试覆盖 / 验收对照 / 关键决策 / 上抛项>

### 本批覆盖

台账 #2254 · 一条：**桌面补 `ev:inbox` 行痕第四员**（跨实例取件面两条行上屏）。本批全做，含出站面。

### 设计落点（原列三处，一处是空指针）

| 落点 | 实况 |
|---|---|
| `docs/desktop/design/IPC.md` §1 | 有该节 —— 新增 `ev:inbox` 表行 + §1「取件行注」 |
| `docs/desktop/design/RENDERER.md` §1.6 KD-74 | 有该行 —— 行痕族三员 → 四员 |
| `docs/desktop/design/PROJECT.md` §10 BE 行 | **该节不存在** —— 全档章节 = §1 / §2 / §3 / §4 / §5 / §6 / §7 / §8 / §9 / §11，无 §10，且全文零处记事件通道计数 |

事件通道计数的实际落点 = `IPC.md` §1 四处 + §3.1 preload 行 · `RENDERER.md` §1.1 两处 + §5.1 两处 · `SHELL.md` §1 目录树两处 · `CHAT.md` §1 一处。本批按这五档同轮改（D11：一条规则每层同轮）。

### 机制设计 —— 两项判断（本席裁定）

**判断 A：`ev:inbox` 不照抄 `onTimer` 的单槽同键替换，改「一类一槽」。**

- **实况**：`onTimer` 的切片是 `timerNotice[key] = { text }` —— 单槽同键替换（依据 `thincoder-desktop/renderer/events-wake.mjs`「同键就地替换——**最近一次交付**」）。
- **两个生产者**：核 `instance-inbox-watch.mjs` 各导出一条行文 —— `inboxTakeLostLine` ∥ `inboxBlockedLine`。
- **两条会不会同时来**：会。受阻行每跨一个 `INBOX_BLOCKED_MS` 重发一条（`ms` 增长）；丢失行在 `onTake` reject 时发。同一会话一生可先后都有。
- **单槽的后果**：后到者盖掉先到者。`blocked` 盖掉 `lost` ⇒ 丢失的 msgId 列表在桌面侧无处可查（核只记 `ev:inbox-watch-take-lost` 日志，不上面）。
- **裁定**：切片形 = `inboxNotice[key] = { lost?, blocked? }` —— 同类新行替换本类旧行，**异类互不覆盖**。
- **为什么不是排优先级**：「lost 更重要 ∥ blocked 更新」两种排法都说得通，选哪个都是猜。一类一槽是结构事实，不需要猜。

**判断 B：行的消失 = 与停止痕同一时机，`clearTurnTraces` 第四员。**

- **理由一（用户动作就是陈旧点）**：两行说的都是**取件面的上一次结果**，不是持续态。用户发下一条消息 ⇒ 旧痕不复述。
- **理由二（受阻行不靠旧行站着）**：受阻仍在持续时，闩每跨一阈自己重发新行（`ms` 增长）⇒ 旧行没有「替它保持在场」的职责。
- **理由三（不清就是那个 bug 原样复发）**：行痕族的定义句 = 运行期痕 · 两门清点。留一员在门外 = 行永不再消失 —— 2026-10-05 修掉的正是 `timerNotice` 漏在清点面外这一处。
- **落地**：`renderer/store.mjs` `clearTurnTraces` 摘 `inboxNotice[key]`（两槽一条摘键动作）；`renderer/page-read.mjs` 首屏门由五清变**六清**。
- **不选的方案**：留到下次同类事件覆盖。否决 = 它把「消失」押在「还会再来一条」上，不来就留一条永久痕。

### 载荷与拒绝面

| 项 | 定形 |
|---|---|
| 载荷 | `{ key, kind, text }` —— `kind` 闭集 = `lost` ∥ `blocked`；`text` = 核拼串逐字 |
| 零写门 | `kind` 表外 ∥ `text` 非非空串 ⇒ **零写**（禁假造空行，沿 `onTimer` 同句） |
| 行文单源 | `docs/core/design/MULTI-INSTANCE-COLLAB.md` §5.4 两条逐字锚 —— 桌面档只引不重写 |
| 出站两径 | `onTake` reject ⇒ `kind:"lost"`；`onBlocked(ms, pending)` ⇒ `kind:"blocked"` |
| 串嗅探 | 禁 —— `kind` 由出站面点名，端侧不读行文内容判类 |

### 受影响文件（15 档源档）

**本表 = 落地口径**：声明面 11 档（第 1–11 行）+ 表外 4 档（第 12–15 行）。原列 9 档 = 显示链，**出站面漏 2 档**（上抛项 2：缺这两档 = 通道登记了没人发 = 零显示）；实施期又落出 4 档表外消费面（评审轮 3-1 判成立）。

| # | 文件 | 改动 |
|---|---|---|
| 1 | `thincoder-desktop/src/preload/preload.cjs` | `EVENT_CHANNELS` 25 → 26 |
| 2 | `thincoder-desktop/renderer/events-subscribe.mjs` | `CHANNELS` 表增一条 |
| 3 | `thincoder-desktop/renderer/events.mjs` | `reduce` 分派增 `case "ev:inbox"` |
| 4 | `thincoder-desktop/renderer/events-wake.mjs` | 增 `onInbox`（与 `onTimer` 同档同形，切片换成一类一槽） |
| 5 | `thincoder-desktop/renderer/store.mjs` | `inboxNotice` 切片 + `clearTurnTraces` 第四员 |
| 6 | `thincoder-desktop/renderer/frame-dispatch.mjs` | `CHAT_KEYS` 增 `inboxNotice`（不加 = 切片变了不重绘） |
| 7 | `thincoder-desktop/renderer/page-read.mjs` | 首屏门五清 → 六清 |
| 8 | `thincoder-desktop/renderer/views/chat-model.mjs` | 投影 `inbox`（空 ⇒ `null`） |
| 9 | `thincoder-desktop/renderer/views/chat-chrome.mjs` | 行组 `[data-inbox]` + 帧尾刷 + 插点锚 |
| 10 | `thincoder-desktop/src/main/suspension-timers.mjs` | 出站两径：`onTake` reject ∥ `onBlocked` |
| 11 | `thincoder-desktop/src/main/timer-watch.mjs` | `createInboxWatch` 形参增 `onBlocked` 并补键透传核闩 |
| 12 | `thincoder-desktop/renderer/views/chat-tree.mjs` | **表外增**：构树径补 `inboxGroupNode`——换会话 ∕ 整置的重建帧不掉行组 |
| 13 | `thincoder-desktop/renderer/views/compress-status.mjs` | **表外增**：`compressAnchorOf` 链首插 `[data-inbox]`——压缩行恒居取件行组之前 |
| 14 | `thincoder-desktop/renderer/views/chat-digest-rows.mjs` | **表外改**：两处「运行期痕五清之四」→「六清之四」 |
| 15 | `thincoder-desktop/renderer/views/chat.mjs` | **表外改**：头注镜像收正（尾组族内序 ∥ 根子序 ∥ `syncChrome` 面列 ∥ 模型形 ⑤ 补 `inbox`） |

**表外四档的理由（本席逐档实核源档，判皆该动）**：

- 第 12 · 13 行是「不加则该行为零」的数据路：`chat-tree.mjs` 缺 ⇒ 重建帧丢行组（实施席按面红实测：撤该行 A7 红、恢复绿）；`compress-status.mjs` 缺 ⇒ 到期组不在时压缩行越过取件行组（族首失效，A7b 同法实测）。
- 第 14 · 15 行是同一计数 ∕ 同一族内序的第二、第三处表述（D11：一条规则每层同轮改）。

**还缺不缺档（本席实校）**：以兄弟员 `timerNotice` 的消费档集为尺 —— 全仓提到 `timerNotice` 的档 = `events-wake.mjs` ∥ `events.mjs` ∥ `frame-dispatch.mjs` ∥ `page-read.mjs` ∥ `store.mjs` ∥ `views/chat-model.mjs` ∥ `views/chat.mjs`，与 `inboxNotice` 的档集**逐档全等**（七档）⇒ 切片消费面无缺档。

**tier 结论**：15 档源档，无一新增越层，无拆分方案。`renderer/store.mjs` 383 行为**既有在册**越层档（拆档预案在册，不改变其既判）；其余十四档皆在软线下。读数口径 = `doc_check(lines)` 内容行数，逐档读数见 `docs/desktop/design/RENDERER.md` §5.1（渲染面十二档）∥ `docs/desktop/design/SHELL.md` §5.1（宿主两档）。

### 验收对照

每条都能红：读到的人能指出哪一条不成立。

| # | 判据 | 读法 |
|---|---|---|
| A1 | 名集三处同源：`preload.cjs` `EVENT_CHANNELS` ∥ `events-subscribe.mjs` `CHANNELS` ∥ IPC.md §1 表行 = 同一名集，计数 26 | 三处读名集比对 |
| A2 | 同类替换、异类不覆盖：依次投 `blocked` → `lost` → `blocked` ⇒ 两槽同时在场，`blocked` 槽 = 末条 | 归约纯函数平 node 直测 |
| A3 | 表外 `kind` ∥ 空 `text` ⇒ 状态树原引用（零写） | 同上 |
| A4 | 回合起跑门摘两槽：置两槽 ⇒ `clearTurnTraces` ⇒ 无该键，且 `stopHold[key]` 为真 | 同上 |
| A5 | 首屏门摘两槽：`applyPage(before = null)` ⇒ 无该键 | 同上 |
| A6 | 切片变即重绘：`CHAT_KEYS` 含 `inboxNotice` | 表读名 |
| A7 | 行组在场 ∥ 退场：模型非空 ⇒ `[data-inbox]` 在场且行数 = 槽数；空 ⇒ 摘除 | 描述符树断言（纯构树） |
| A8 | 行文逐字：行元素文本 = 核 `inboxTakeLostLine(...)` ∥ `inboxBlockedLine(...)` 的返回值，非端侧新拼串 | 单元档断言 |
| A9 | 出站两径：注入 `onTake` reject ⇒ 恰一帧 `kind:"lost"`；`onBlocked(ms, pending)` ⇒ 恰一帧 `kind:"blocked"` | 宿主面注入假 `post` |
| A10 | 未验面如实记：桌面无 Electron ⇒ 真机「行出现 ∥ 消失」**未验** | 收口行点名 |

### 关键决策（含否决项）

| 号 | 决策 | 否决的替代与理由 |
|---|---|---|
| D-IB1 | 一类一槽（`{ lost?, blocked? }`） | 单槽同键替换：`blocked` 会盖掉 `lost` 的 msgId 列表，而那是端侧唯一留痕 |
| D-IB2 | `inboxNotice` 并入行痕族两门清点 | 留到下次同类覆盖：把消失押在「还会来一条」上，不来即永久痕 |
| D-IB3 | 不复用 `ev:timer` | 同键替换会覆盖；且该通道语义 = 到期交付，一名两义 |
| D-IB4 | 不按内容派生 key | `key` = 会话键面单源；派生第二套键 = 一条规则两个源，退场面跟着派生键走 |
| D-IB5 | 携 `kind`，不嗅探行文 | 嗅探 = 端侧读核文案判类，第二判据；行文归核，端侧只搬运 |

### 上抛项

1. **[上抛·待裁] 任务书第三条落点是空节**：`PROJECT.md` 无 §10，全文零处记事件通道计数。已按实数落点改（`IPC.md` §1 四处 + §3.1 preload 行 · `RENDERER.md` §1.1 两处 + §5.1 两处 · `SHELL.md` §1 目录树两处 · `CHAT.md` §1 一处）。是否另立 PROJECT.md §10 记该计数 —— 归父侧。
2. **[上抛·知会] 9 档清单漏出站面两档（评审判成立）**：`suspension-timers.mjs` ∥ `timer-watch.mjs`。证据 = `timer-watch.mjs`「无受阻可读面」∥ `suspension-timers.mjs`「`onBlocked` 同理不接」，且 `createInboxWatch` 形参无 `onBlocked`。本席按 11 档设计（不补这两档 = 通道登记了没人发）。
3. **[上抛·知会] 桌面集成层未建立**：`test/RTM.md` 桌面列全 `缺`。本批集成 delta = 破 0 ∥ 冗余 0 ∥ 缺 1（取件行痕用例）；编号登记与用例落地归父侧——`test/RTM.md` 属产品面，本席不写。

### 本轮实改档（含声明表外四档）

| 档 | 改了什么 |
|---|---|
| `IPC.md` | 新增 `ev:inbox` 表行 + §1「取件行注」七条 + 事件映射段一条 + 计数四处 25 → 26 + 两处绝对读数改关系句 |
| `RENDERER.md` | KD-74 三员 → 四员（`inboxNotice` 第四员 · 首屏门六清（逐名六项）· 计数句「不入六清」）+ KD-74 第四员理由段 + §1.1「跨实例取件行」条 + 计数五处 |
| `PROJECT.md` | **无计数可改**（无 §10）。改两处死锚：Electron 上游源路径 → 「上游 `menu-item-roles` 源」· 裸名类型档 → 全路径 |
| `SHELL.md`（表外） | §1 目录树两处计数 25 → 26；一处 digest 旧档名死锚改指盘上实名 `chat-digest-rows.mjs` |
| `CHAT.md`（表外） | §1 计数一处 25 → 26；同款上游源路径死锚（与 PROJECT 那处同一写法） |
| `ACTIVITY.md`（表外） | 行痕族员数三员 → 四员 + 「五清家族」→「六清家族」（含 `inboxNotice`） |

**为什么要动表外三档**：D11（一条规则每层同轮）+ 交付门对「本会话写过的档」整档判。一条计数留在别处 = 同一事实两个值，而这一轮之前已经三次栽在「改一处、漏另一处」。

### 门检读数（本席实跑）

- `doc_check(mode:"gate")` 射程 7 档（上述六档 + 本批档）⇒ `DOC-CHECK GATE: PASS`，0 段有问题。
- 计数机检：五档 `二十五` 命中 0 处；`二十六` = IPC 4 · RENDERER 5 · SHELL 2 · CHAT 1 · PROJECT 0 · ACTIVITY 0（该档只记员数不记通道数）。
- 死锚机检：RENDERER 两处外部组名档 · PROJECT 与 CHAT 各一处 Electron 上游源路径 · SHELL 一处 digest 旧档名 —— **五处全修**，故这五处是清账不是新增债。

### 未做 / 未验（如实）

- **代码零改**（设计席不写实现）；真机「行出现 ∥ 消失」**未验**（桌面无 Electron）——A10 把这条记进验收面，收口时如实写。
- 请求白名单 54 ↔ 实 55 **未改**（上抛项 3）。
- 行文案**未在本档重写**（引 `docs/core/design/MULTI-INSTANCE-COLLAB.md` §5.4）。

### 修复轮 1（评审十三条 + #2255 · 全落）

**逐条处置**：号 → 改笔 → 落点。评审的号与本节同号。

| # | 处置与改笔 | 落点 |
|---|---|---|
| 1 | 已修：清点面逐名点出 `inboxNotice[key]`（两槽一并摘），计数写「六清」；「键集零动」删去，限义为「清点机具本体零改——六项各一支纯动作（`clearInboxNotice` 与既有五支同形），不设清点机具」 | `RENDERER.md` §1.6 KD-74① |
| 2 | 已修：补「集成设计（delta · 自 `test/RTM.md` 起步）」块——破 0 ∥ 冗余 0 ∥ 缺 1，缺行逐项点名交互 ∥ 断言 ∥ 用户入口 ∥ 服务需求；验收增 A11 ∥ A12 两行 | `RENDERER.md` §1.6 KD-74 第四员；本段「验收对照」 |
| 3 | 已修：载荷键集补 `ev:inbox { key, kind, text }` 与 `ev:secret` 两条逐键列（原 24 条 → 26 条） | `IPC.md` §1「载荷键集」段 |
| 4 | 已修四处：① KD-74③ 明写 `inboxNotice` 入 `CHAT_KEYS`；② 尾组族内序与根子序补取件行组；③ 落点由 `syncTimer` 改 `syncInbox`；④ 归约者点名 `events-wake.mjs` `onInbox`，树面三切片 → 四切片 | `RENDERER.md` §1.6 KD-74③ ∥ §1.1 两处 ∥ §1.1 取件行条；`SHELL.md` §1 树 |
| 5 | 已修：§5.1 补两档行数行；§1 树补 `suspension-timers.mjs` 条目、`timer-watch.mjs` 增 `onBlocked` 透传职责；补越层结论句（宿主族 ∥ 渲染面两处各一表） | `SHELL.md` §5.1 ∥ §1；`RENDERER.md` §5.1 |
| 6 | 已修：两径各给逐字行文（`依据` 引核档原文）+ 复现路径 + 跨端形（VSC ∥ CLI 均已有呈现面；桌面形差 = 两门清点） | `IPC.md` §2「取件行注」项 7 子弹六条 |
| 7 | 已修：补最近先例行——VSC 同族两档坐标 + 对齐二面 + 偏离三面（两槽并存的理由写在偏离二内） | `RENDERER.md` §1.6 KD-74 第四员「最近先例」 |
| 8 | 已修：补出处勘查行——核 `MULTI-INSTANCE-COLLAB.md` §5.4 ∥ VSC 同族两档，相关项 = 有 | 同上「出处勘查」 |
| 9 | 已修：四名各给三问答案——`inboxNotice` = none found ∥ `clearTurnTraces` = existing ∥ `syncInbox` = existing but unusable（三处接不住）∥ `[data-inbox]` = none found | 同上「三问」 |
| 10 | 已修：补生命期边界句——门只摘在场旧痕，门后到达照写照显；同判 KD-74⑥；`stopHold` 只服 `stopped` | 同上「生命期边界」 |
| 11 | 已修：`ev:inbox` 行细目改指 §2「取件行注」（注实体所在），并明写本表只定通道名与一行语义 | `IPC.md` §1 `ev:inbox` 行 |
| 12 | 判成立：按数据路扩 11 档；引注改为发出点 + 档名，原注释文本只作「为何缺」的证据 | `IPC.md` §2 项 7 末条；本段「受影响文件」 |
| 13 | 已修：行数读数为单尺（`doc_check(lines)` 内容行数），并写明「本档各表与本表不一致时一律以本表为准」；`preload.cjs` 94 → 95 就地校正 | `RENDERER.md` §5.1 ∥ `IPC.md` §3.1 preload 行 |
| #2255 | 已修（数与枚举同轮）：白名单 54 → 55 + 补 `provider:setModelContext` 表行 + 位次 55 + 两处计数 | `IPC.md` §2 表行 ∥「白名单面」∥ 位次 55 ∥ §3.1；`CHAT.md` §1 计数 |

**复核读数（本轮实读，非转述）**：`preload.cjs` 的 `CHANNELS` 实为 55 项且含 `provider:setModelContext`——该档头注点名该名；数组 `CHANNELS` 逐项数点 = **55**（本轮实点，非转述），位次 1–55 与 `IPC.md` §2「白名单面」逐位对得上。行数八档实读见 `RENDERER.md` §5.1 表，宿主两档见 `SHELL.md` §5.1；两处合计 11 档，零越软线。

**验收对照补两行**（本批验收面，与前表同表续）：

| # | 判据 | 读法 |
|---|---|---|
| A11 | 改动面单测档点名在册：A2 ∥ A3 ∥ A4 ∥ A5 四条纯函数判据 + A9 出站两径，同跑一档 | `node --test docs/batches/2026-11-10-desktop-inbox-trace.test.mjs` |
| A12 | 集成 delta 可读可判：破 ∥ 冗余 ∥ 缺 三数与缺行的四件（交互 ∥ 断言 ∥ 入口 ∥ 需求）齐备 | 读 `RENDERER.md` §1.6 该块，四件缺一即不成立 |

**本轮未做**：代码零改；`test/RTM.md` 未写（产品面，归父侧）；真机「行出现 ∥ 消失」未验（桌面无 Electron）。

### 修复轮 2（实施评审三条 + §5 漂移三条 + 轮 2 遗留 N1–N5 · 全落）

**逐条处置**：号 → 改笔 → 落点。

| # | 处置与改笔 | 落点 |
|---|---|---|
| ① | 已修：受影响文件表 11 档 → **15 档源档**（补 `chat-tree.mjs` ∥ `compress-status.mjs` ∥ `chat-digest-rows.mjs` ∥ `chat.mjs`）+ 表外理由段 + 「还缺不缺档」实校 | 「本批覆盖」后的受影响文件一节；`RENDERER.md` §5.1 越层表八行 → 十二行 · §5.2 新批块 |
| ② | **已删**：项 7 末条（「两源档注释现文本（出站面为何缺）」）——它是过程句（当时为何缺），且以批档档号为指针（批档整档可删，该指针必死）；现行状态由项 7 主句承载。连带：`SHELL.md` §5.1 两行同句「原注「…」即此处缺」一并收正为现行状态句 | `IPC.md` §2「取件行注」项 7；`SHELL.md` §5.1 两行说明 |
| ③ | 已修：`suspension-timers.mjs` 112 → **121** ∥ `timer-watch.mjs` 120 → **126**（同尺 `doc_check(lines)`），越层结论句两个数同轮改 | `SHELL.md` §5.1 两行 + 越层结论 |
| ④ | 已收正：信号点**零改**——KD-74② 改明写「两处 `call("msg:send")` 前沿**既有**同笔调 `clearTurnTraces`（该档零改）」；§5.2 零触面行同句 | `RENDERER.md` §1.6 KD-74② ∥ §5.2 |
| ⑤ | 已留档（两处实现决定，不改语义）：槽值形 = 行文串本身 ⇒ 项 2 增句；组内行序 = `kind` 闭集枚举序、不随到达序漂 ⇒ §1.1 该条增句 | `IPC.md` §2 项 2 ∥ `RENDERER.md` §1.1 跨实例取件行条 |
| N1 | 已修：越层表**不入** `composer-wire.mjs`（该档零改，入表即读成「改了」）；KD-74② 明写既有调，读者不再读成「信号点要改」 | `RENDERER.md` §1.6 KD-74② ∥ §5.2 零触面行 |
| N2 | 已修：§1 渠道族「八通道」→「**九通道**」并补 `setModelContext`——与 `IPC.md` §2 该行「处理体 = `providers.mjs`」同源 | `SHELL.md` §1 目录树 |
| N3 | 已修：三问补两答——`clearInboxNotice` = `none found:`（首屏清点现五支，无取件支）∥ `onInbox` = `existing but unusable: onTimer(state, ev)`（单槽同键替换接不住两槽两行） | `RENDERER.md` §1.6 KD-74 第四员「三问」 |
| N4 | 已修：两域 §5.2 各立本批批块，「测试 ∕ 探针」行点名单测档 `docs/batches/2026-11-10-desktop-inbox-trace.test.mjs`（A1–A9 + A7b · 十一例 · 收口删） | `RENDERER.md` §5.2 ¶ `SHELL.md` §5.2 |
| N5 | 已修：「事件面单源」两处不同址去重——§1.1 该条留「通道名行 = `IPC.md` §1 `ev:inbox` 行」，语义单源仍 `IPC.md` §2「取件行注」 | `RENDERER.md` §1.1 |
| 轮3-1 | 判成立并已落：改动面口径改 15 源档（同 ①）；评审所点两处（`compress-status.mjs` ∥ `chat-digest-rows.mjs`）现皆在表 | 受影响文件表第 13 · 14 行 |
| 轮3-2 | 实现面已自修（§5 自修 2），本席只补它进改动面表（第 15 行） | 受影响文件表第 15 行 |
| 轮3-4/5 | 测试面写法，不归设计面：实施席已改 `setImmediate`、删冗余断言 | §5「审计 / 评审轮次」 |
| 轮3-6 | 在册债不再登记：桌面集成层未建立 = `test/RTM.md` 桌面列全 `缺`（RTM 属产品面，归父侧） | 本段上抛项 3 |

**复核读数（本席实跑，命令 + 结论）**：

- `doc_check(mode:"gate")` 射程 = 本会话所改三批档 ⇒ 见交付报告首行。
- 行数单尺 = `doc_check(lines)`：渲染面十二档 ∥ 宿主两档，两处读数与 `RENDERER.md` §5.1 ∥ `SHELL.md` §5.1 同数。
- 档面齐备校：`timerNotice` 七档消费档集 ≡ `inboxNotice` 七档（逐档全等）⇒ 无缺档。
- 表外四档实核：`chat-tree.mjs`「children.push(inboxGroupNode(model.inbox))」· `compress-status.mjs`「root.querySelector("[data-timer]") ?? root.querySelector("[data-inbox]") ?? root.querySelector("[data-stopped]")」· `chat-digest-rows.mjs` 两处「运行期痕六清之四」· `chat.mjs` 头注「**取件行组**（`[data-inbox]` —— 行痕族第四员 · 跨实例取件面）」。

**本轮未做 / 上报**：

- **代码零改**（设计席不写实现）；真机「行出现 ∥ 消失」**未验**（桌面无 Electron）——A10 归 §6 收口行。
- **删 ② 的连带账**：`suspension-timers.mjs` ∥ `timer-watch.mjs` 两档旧注释的原文，此前以 `IPC.md` 项 7 末条为「保留它」的理由（引注断则门红）。该项既删，该理由失效 ⇒ 两处注释已是产品面上的过期陈述，建议随下批收正为现行状态句（本席不改产品面）。
- `test/RTM.md` 缺行登记与用例落地仍归父侧（产品面）；本席只给设计侧 delta（破 0 ∥ 冗余 0 ∥ 缺 1）。

### 修复轮 3（父侧裁定：平掉一处变更痕迹 · 全落）

**裁定来源 = 父侧本轮明示**：「KD-74① 的「五清 → 六清」改成「六清」+ 逐名枚举（删掉「五清 →」这个变更痕迹）。只改一处。」

**为什么平掉**：评审轮 1 #1 要的是「清点面点名取件行 + 计数对得上」——「六清」+ 逐名已满足；`五清 →` 是写的人留下的前后对照，属设计档不该有的历史面（设计档 = 长存状态面，读者要的是「现在清几个、哪几个」）。

| 号 | 处置与改笔 | 落点 |
|---|---|---|
| 1 | 已改：`applyPage` `before == null` **六清**——逐名 = `stopMark` ∥ `timerNotice` ∥ `compress` ∥ `helpLines` ∥ `digest` ∥ `inboxNotice`（两槽一并摘）；「清点机具本体零改」限义句同句收正为「六项各一支纯动作（`clearInboxNotice` 与既有五支同形），不设清点机具」（原句「与既有四支同形」是旧计数，同句一并校正为五支——依据 `thincoder-desktop/renderer/page-read.mjs` 实有六支清点项：`clearStopMark` ∥ `clearTimerNotice` ∥ `clearInboxNotice` ∥ `clearCompress` ∥ `clearHelpLines` ∥ `clearDigest`） | `RENDERER.md` §1.6 KD-74① |
| 2 | 已同步：§2 处置行引原句处（轮 1 #1 行 ∥ 「本轮实改档」`RENDERER.md` 行）随改笔同步，口径 = 「六清」+ 逐名；残留「五清」字样的两处皆为**改笔差量列**（受影响文件表第 7 行「首屏门五清 → 六清」），记的是当时改了什么，是 §2 的过程面，按父侧口径保留 | 本段前述两表 |

**复核读数（本席实跑）**：

- `doc_check(mode:"gate")` 射程 = 本会话所改档（`RENDERER.md` + 本批档）⇒ 见交付报告首行。
- 「五清」在 `RENDERER.md` 命中 = 0；「六清」在该档命中 = 3（KD-74① ∥ KD-74③「不入六清」∥ §5.2 现有文件改动 · `chat-digest-rows.mjs` 行「运行期痕六清之四」）。

**本轮未做 / 上报**：

- **代码零改**（设计席不写实现）；真机「行出现 ∥ 消失」**未验**（桌面无 Electron）——A10 归 §6 收口行。
- **[上抛·待裁] 两处同源残留不在本席本轮射程**：① `docs/desktop/design/COMPOSER.md` §3.2 现有文件改动 · `page-read.mjs` 行「**293**（+`clearHelpLines`——运行期痕**五清**）」与同档 §5 用例 · `T-DSK56` 行「重开会话 ⇒ 行族失（首屏门**五清**——负判）」——同一计数仍是旧值（D11：一条规则每层同轮）；② `RENDERER.md` §1.6「三问」`clearInboxNotice` 条写「现五支…无取件面一支 ⇒ 新建」——那是设计时刻的先例答案，与现盘六支并存读起来像现状，是否改写为现态句归父侧定。两处都等父侧裁，本席未动。

### 修复轮 4（父侧裁定：两处同源残留 · 全落）

**裁定来源 = 父侧本轮明示**：「你报的两处残留都要修——同一计数的第二、第三个落点，正是 D11 说的『一层落下，别的层还是旧值』」；边界 = 只动这两档，不碰代码，不派实施、不发评审。

| # | 处置与改笔 | 落点 |
|---|---|---|
| 1 | 已改：「**293**（+`clearHelpLines`——运行期痕**五清**）」→「**298**（+`clearHelpLines`——运行期痕**六清**）」。计数改「六清」；行数按单尺复测就地校正（见下「行数读数」） | `docs/desktop/design/COMPOSER.md` §3.2「桌面 slash 命令 `/help` 增量行」第 11 行 |
| 2 | 已改：`T-DSK56` 预期输出「重开会话 ⇒ 行族失（首屏门**五清**——负判）」→「重开会话 ⇒ 行族失（首屏门**六清**——`clearHelpLines` 在清点列，负判）」 | 同档 §5 用例 · `T-DSK56` 行 |
| 3 | 已改：「`none found:` 首屏清点列…**现五支**（…），无取件面一支 ⇒ 新建，形沿**既有**五支」→ 明写为判定底数：「**判定当时**首屏清点列…五支（逐名）…⇒ 新建，形沿**当时**五支…；**现行清点列为六支**——逐名 = 本档 §1.6 KD-74①」 | `docs/desktop/design/RENDERER.md` §1.6「三问」`clearInboxNotice` 条 |

**第 2 行的负判可红核查（父侧点名要核）**：

- 该负判读的是 `[data-help]` 行族**在不在场**，不读清点项总数 ⇒ 计数五 → 六不改变它的红 ∕ 绿；它的红路 = 首屏门缺 `clearHelpLines` 那一支。
- 实跑双侧读数（探针形 = 本批单测档同形钩子；纯函数 + 构树，未起 Electron）：

```text
未清状态（= 该清点项缺席时的样子） : {"rows":1,"nodes":1}
首屏门后（before == null）        : {"rows":null,"nodes":0}
回填门（before = 20，不该清）     : {"rows":1,"nodes":1}
```

- ⇒ 同一探针在不同事实上读出 0 与 1（回填径 = 该门不跑 ⇒ 行族在场）——红面可达，不是「怎么读都绿」的形状。**结论 = 判据仍可红；计数只是旁注，而旁注会漂，故本轮把该负判所读的清点项点了名。**

**行数读数（单尺 = `doc_check(lines)`；本轮实跑）**：`thincoder-desktop/renderer/page-read.mjs` = **298**。`COMPOSER.md` §3.2 原写 **293** = `/help` 批当时读数，`clearInboxNotice` 落地后过期，且与 `docs/desktop/design/RENDERER.md` §5.1 该档行（**298**）互相矛盾。**父侧裁定只点两处「五清」；此数与第 1 行同行，故一并收正，在此逐条报备（可撤）。**

**计数机检（尺 = 内置 grep · 字面 · 命中行数）**：`COMPOSER.md`「五清」**0** ∥「六清」**2**；`RENDERER.md`「五清」**0** ∥「六清」**2**。`RENDERER.md` 那 2 行 = KD-74① 段（「**六清**」与「不入六清」同段）∥ §5.1 `chat-digest-rows.mjs` 行的「运行期痕六清之四」。

**本轮未做**：代码零改（设计席不写实现）；`test/RTM.md` 未写（产品面，归父侧）；真机「行出现 ∥ 消失」未验（桌面无 Electron）——A10 归 §6 收口行。

### 修复轮 5（父侧裁定：到期条件已成立 · 可见行改三端同形 · 全落）

**裁定来源 = 父侧本轮明示**：「到期条件成立了，那条该改写」+「`MULTI-INSTANCE-COLLAB.md` 的 §5.8 判据 ④ 与 §5.9 里，凡写着「桌面不接 / 只到 CLI ∥ VSC / 桌面侧只有日志面」的句子，逐处对齐到现态。别只改我点名那一处」。边界 = 只动这一份档，不碰桌面设计档 / 代码 / 派实施 / 发评审。

**为什么现在改（本轮实读源档，非转述）**：该条自立到期条件 = 「桌面宿主两径接上 `ev:inbox` 那一轮，届时本条改写为三端同形」。现状：

- 出站 lost 径在：`thincoder-desktop/src/main/suspension-timers.mjs`「`post("ev:inbox", { key, kind: "lost", text: inboxTakeLostLine(messages) })`」
- 出站 blocked 径在：同档「`onBlocked: (key, ms, pending) => post("ev:inbox", { key, kind: "blocked", text: inboxBlockedLine(ms, pending) })`」
- 键透传在：`thincoder-desktop/src/main/timer-watch.mjs`「`onBlocked: typeof onBlocked === "function" ? (ms, pending) => onBlocked(key, ms, pending) : null`」
- 渲染面在：`renderer/events-wake.mjs` `onInbox` → `renderer/views/chat-chrome.mjs` `syncInbox` ∥ `inboxGroupNode`（`"[data-inbox]": ""`）

且该条所引的两句代码注释（「`onBlocked` 同理不接」∥「无受阻可读面」）已在实施注释收正轮删去 ⇒ 引用已无原文可指。

**逐处处置（号 → 原句要点 → 现句要点 → 落点）**：

| # | 落点 | 原句要点 → 现句要点 |
|---|---|---|
| 1 | §5.4「两条可见行」标题 | 「逐字锚 · CLI ∥ VSC 同形 · N-MI2 对拍」→「逐字锚 · **三端同形** · N-MI2 对拍」 |
| 2 | §5.4 落地端条 | 「落地端 = CLI ∥ VSC…两端文案逐字」→「落地端 = **CLI ∥ VSC ∥ 桌面**；行文唯一构造点 = 核 `inboxTakeLostLine` ∥ `inboxBlockedLine`（三端只调不算）；呈现面各端自持——桌面 = `ev:inbox`（`{ key, kind, text }`）→ `onInbox` → `[data-inbox]` 行组」 |
| 3 | §5.4「桌面端本批不接这两行」整条 | 改为「**端差（同形 ≠ 同实现）**」：行文与触发同源；消散面各端自持——桌面是行痕族第四员、服从两门清点（逐名六项，两槽一并摘）；CLI ∥ VSC 按各自呈现面既有行为，本条不新增消散规则 |
| 4 | §5.8「已接」判据头 | 「④ 只到 CLI ∥ VSC」→「**④ 覆盖三端**」 |
| 5 | §5.8 判据 ④ | 「（CLI ∥ VSC）…桌面两条可见行不接、本判据不覆盖桌面」→「（**三端**）…桌面注入同两种失败 ⇒ 出站恰两帧 `ev:inbox`、`text` 逐字 = 核两函数返回值（端侧零构造）、行组行数 = 槽数」 |
| 6 | §5.8 受影响文件 · 渲染落点 | 只列 CLI ∥ VSC → 补桌面三段：出站两径（`suspension-timers.mjs` ∥ `timer-watch.mjs` 补键透传）· 渲染面（`onInbox` → `inboxGroupNode` ∥ `syncInbox`）· 切片清点（`store.mjs` `clearTurnTraces` 第四员 ∥ `page-read.mjs` `clearInboxNotice`） |
| 7 | §5.8 端装配表 Desktop 行 | 到期条件（宿主两径接上时连同撤闩面收口）**已到、撤闩面未收口** ⇒ 改为「对齐 = `open`（裁定权 = 桌面面：撤掉入窗撤闩 ∥ 认定为例外并把上界写死在 §5.9；裁定前按 §5.9 上界执行）」 |
| 8 | §5.9 桌面入窗条 | 「桌面本批不接两条可见行 ⇒ 那一次失败只有日志面、用户无可见行」→ 现态：入窗不取件 ⇒ 丢失行不产生；受阻行在闩在位且 `busyOf` 把入窗算作在飞、跨 `INBOX_BLOCKED_MS` 时产生并照 §5.4 上屏 ⇒ 两条失败面均有可见行 |

**口径（父侧原话落在此处）**：「同形」= 行文逐字一致 + 同一两种失败面触发，**不是三套实现一样**。过程缘由（本批先不做桌面、后另批补齐）不进状态档，留在批档。

**本轮未动（实核后判定不改，附依据）**：§1 与 §3.1 / §5.3 / §7 的「CLI + VS Code 双端」「两壳同得」——内置 grep 射程 `thincoder-desktop/src`（`.mjs`）对 `assembleBuiltinTools` ∥ `peer_instances` ∥ `instance_send` ∥ `pushPeerReminder` ∥ `peerInstances` **零命中** ⇒ 桌面端无感知面 / 工具面 ⇒ 那几处的双端口径仍是现态；改它等于写一条我没有证据的事实。

**复核读数（本席实跑，命令 + 结论）**：

- `doc_check(mode:"gate", docs:["docs/core/design/MULTI-INSTANCE-COLLAB.md"])` ⇒ `DOC-CHECK GATE: PASS`（0 段有问题）。两次跑（改笔前 ∥ 末两处一致性收正后）同值。
- 残留机检（内置 grep 射程本档，pattern = `只到 CLI|CLI ∥ VSC 同形|两径未接|同理不接|无受阻可读面|不接这两行|只有日志面|桌面端本批`）⇒ **0 处**。
- 现态机检（同尺，pattern = `三端同形|CLI ∥ VSC ∥ 桌面|④ 覆盖三端`）⇒ **3 处**（§5.4 标题 ∥ §5.4 落地端条 ∥ §5.8 判据头）。

**本轮未做**：代码零改（设计席不写实现）；桌面设计档零改（`IPC.md` / `RENDERER.md` / `SHELL.md` 本轮未动——它们记的已是三端现态）；`test/RTM.md` 未写（产品面，归父侧）；真机「行出现 ∥ 消失」未验（桌面无 Electron）——A10 仍归 §6 收口行。

**[上抛·待裁] 一处随本轮连带浮出**：§5.8 Desktop 行与 §5.9 那条的到期条件（「桌面宿主两径接上时连同撤闩面一并收口」）触发事件已成立，而**撤闩面（入窗撤闩）本批零改** ⇒ 该条不是「已收口」而是「到期已到、裁定未给」。本席按状态面写成 `open` + 裁定权 + 上界，未替桌面面下裁定；若父侧要按其它口径收口，此处待裁。

### 修复轮 6（父侧裁定：入窗撤闩已实施落地 · 三处旧态收正 + 行数收正 · 全落）

**裁定来源 = 父侧本轮明示**：入窗撤闩裁「修」，实施已落地（单测 12/12，新增 A13）；本席把三处旧态收正，**按实读写**。边界 = 只动设计档，不碰代码 / 渲染面，不派实施、不发评审。

**改笔依据（本席本轮实读源档，非转述）**：

- `thincoder-desktop/src/main/suspension-timers.mjs`「const disarmTimer = (key) => watch.disarm(key)」（唯一一处定义）
- 同档「disarm: (key) => { const had = disarmTimer(key); inbox.disarm(key); forgetIfIdle(); return had }」
- 同档「disarmAll: () => { watch.disarmAll(); inbox.disarmAll(); forgetIfIdle() }」
- `thincoder-desktop/src/main/suspension-drive.mjs`「timers.disarmTimer(key) // 入窗 ⇒ 只撤空闲闩」
- 同档 `abort` 走 `timers.disarm(key)` ∥ `abortAll` 走 `timers.disarmAll()`
- 入窗期判忙一支：`thincoder-desktop/src/main/suspension-timers.mjs`「busyOf: (key) => busyOf(key) === true || inWindow(key)」

**逐处改笔（号 → 落点 → 改笔）**：

| # | 落点 | 改笔 |
|---|---|---|
| 1 | `docs/core/design/MULTI-INSTANCE-COLLAB.md` §5.4 自续闩条 | 「**例外两处**…VSC 转空工作区、桌面入窗（后者对齐 = `open`，上界见 §5.9）」→「**例外一处**…VSC 转空工作区的撤闩」；连带「它们是各端…属各端那一轮」→「它是该端…属 VSC 那一轮」 |
| 2 | 同档 §5.8 端装配表 Desktop 行 · 撤闩列 | 「三处 `timers.disarm(key)` 一并撤取件闩（入窗 · 会话清除面 · 切项目级联）」+「对齐 = `open`（裁定权 = 桌面面…）」→ **撤闩分族**：取件闩只三撤点（会话清除 ∥ 面板销毁，两路同走 `disarm` ∥ 切项目级联 `disarmAll`）；**入窗走 `disarmTimer`**（`disarmTimer` 一处定义，`disarm` = 该支 + 取件闩）；对齐 = **已对齐**（`open` 与裁定权句一并删）；入窗期只出受阻行、不取件 |
| 3 | 同档 §5.9 | 整条重写：「**桌面入窗会撤一次取件闩**（对齐 = `open`）…裁定权 = 桌面面」→「**桌面入窗期不取件，但取件闩在位**」：入窗只撤 timer 闩 + `busyOf` 把入窗算作在飞 ⇒ 只出受阻行、不取件，取件在出窗后同一批闩拍；上界不变；**保留父侧点名那句边界**——「闩在位」不等于「入窗期能取件」 |
| 4 | `docs/desktop/design/SHELL.md` §5.1 | `suspension-timers.mjs` **121 → 134**；说明补「撤点分族」三入口；越层结论两档 → **三档**逐名逐读数（134 ∥ 126 ∥ 341） |
| 5 | 同档 §5.2 批块 · 第 1 行 | 同一档同读数第二落点：**121 → 134** |
| 6 | `docs/desktop/design/ACTIVITY.md` §4.1（表外） | `suspension-drive.mjs` **340 → 341** · `suspension-timers.mjs` **75 → 134** · `timer-watch.mjs` **76 → 126** · `events-wake.mjs` **105 → 130** 且「三切片」→「四切片」（补 `ev:inbox`） |
| 7 | `docs/desktop/design/COMPOSER.md` §3.2（表外） | 同一档同读数第三落点：`suspension-drive.mjs` **340 → 341** + 构成句补「入窗支只撤 timer 闩」 |

**父侧交本席判的那条 —— `suspension-drive.mjs` 进不进 `SHELL.md` §5.1 的行数表：判「不进」。**

- 该档的行数账已在 `docs/desktop/design/ACTIVITY.md` §4.1（挂起域）有行；再进 §5.1 = 同一文件两个读数、两份表各记一值。`suspension-timers.mjs` 此前正是这样长出 121 ∥ 75 两个值（真值 134）——加第二个位置就是把刚收正的账重新掰开。
- **给位置的形** = SHELL §5.1 越层结论里点名该档、写明「行数账住 ACTIVITY §4.1，本档不设第二读数」，并给出它的读数与免拆结论（越层结论仍覆盖它）。
- 若父侧要它进 §5.1，则须同时从 ACTIVITY §4.1 撤该行：一个文件只留一处读数。

**复核读数（本席实跑，命令 + 结论；绝对读数只在命令输出与本段，不进设计档）**：

- `doc_check(mode:"report", lines:[…])`（单尺）⇒ `suspension-timers.mjs` **134** · `suspension-drive.mjs` **341** · `timer-watch.mjs` **126** · `events-wake.mjs` **130** · `chat-digest-rows.mjs` **288**。
- 旧值机检（内置 grep 射程 `docs`，pattern = `**121**|**340**|**76**|**105**|例外两处`）⇒ **本批四档相关处零残留**。余下命中逐处点名（皆未动，附理由）：
  - `docs/core/design/AGENT-LOOP-ASYNC-POOL.md` §6.30.5 端支持面表「`thincoder-desktop/src/main/timer-watch.mjs`（已落 · 实读 **76**——2026-09-29 收正）」——**同一档的旧读数**，且形为带日期的时点句；改数而不改该句的时点框是半修，**不在本轮射程，留给计数审计轮**。
  - 别的档目：`compress-status.mjs` **75**（`CHAT.md` ∥ `COMPOSER.md` ∥ `RENDERER.md`）· `chat-subagent.mjs` **75**（`UI.md` 两处 09-29 实读）· `views-chat-messages.mjs` ≈**105** ∥ `nav.mjs` **105**（`docs/server/design/webui/`）——本轮未复测。
- 旧态机检（同尺射程本档，pattern = `例外两处|对齐 = **`open`**`）⇒ **0 处**；现态机检（`撤闩分族|入窗不撤取件闩|入窗期不取件`）⇒ **3 处**（§5.8 行 ∥ §5.9 条）。
- `doc_check(mode:"gate")` 射程 = 本会话所改四档 ⇒ 见交付报告首行。

**本轮未做 / 上报**：

- 代码零改（设计席不写实现）；渲染面零改；`test/RTM.md` 未写（产品面，归父侧）；真机「行出现 ∥ 消失」**未验**（桌面无 Electron）——A10 仍归 §6 收口行。
- **表外两档为本席自判并已落**（ACTIVITY §4.1 ∥ COMPOSER §3.2）：四行读数与本轮所改同档同尺，留着就是同一文件两个值（D11）；父侧裁定面只点名「三处 + 两数」，这两档可撤。
- **`ACTIVITY.md` §4.1 全表未逐行复测**：本轮只实读本批相关的五行，其中四行是旧值 ⇒ 该表整体偏旧，但不在本轮裁定面。复测口径 = `doc_check(mode:"report", lines:[该表全部文件])`，归父侧决定是否独开一轮。

## §3 设计评审（评审子代理）
**状态行**：评审通过（上轮 2🔴 全修；新增 4🟡 + 1🔵 皆报告项）



### 轮次 1（评审子代理）

| # | 严重度 | 状态 | 证据（指针） |
|---|---|---|---|
| 1 | 🔴 | 待修 | `docs/desktop/design/RENDERER.md` §1.6 KD-74① 「`before == null` 六清——`thincoder-desktop/renderer/page-read.mjs` 的键集零动」 × 同档「KD-74 第四员」句「`inboxNotice[key]` 与另三员同两门清点」——同一机制两处描述互斥 |
| 2 | 🔴 | 待修 | 四档无自 `test/RTM.md` 起步的集成设计段；现有唯一相关句 = `docs/desktop/design/CHAT.md` §3.2「集成测试不写 ∥ 不改 ∥ 不跑」；本批验收未点名改动面单元测试档 |
| 3 | 🟡 | 待修 | `docs/desktop/design/IPC.md` §1「**载荷键集（单源 = 本段）**：**二十六通道**一律携 `key`」——逐通道字段集无 `ev:inbox` 条（亦无 `ev:secret` 条） |
| 4 | 🟡 | 待修 | 四处未随第四员对齐：KD-74③「`stopHold` 不入 `CHAT_KEYS`」未言 `inboxNotice` 是否入表 ∥ RENDERER「尾组族内序 = 到期触发行组 → 停止痕 → **帮助行族**」 ∥ RENDERER 跨实例取件行条落点写 `syncTimer`（同条上句为 `syncInbox`） ∥ `docs/desktop/design/SHELL.md` §1 树「宿主唤醒面三切片归约（`ev:susp` ∕ `ev:digest` ∕ `ev:timer`）」且四档未点名 `inboxNotice` 归约档 |
| 5 | 🟡 | 待修 | 准则 8：四档无本批改动面的越层结论句；`thincoder-desktop/src/main/suspension-timers.mjs` ∥ `thincoder-desktop/src/main/timer-watch.mjs` 无文件账行，前者不在 `docs/desktop/design/SHELL.md` §1 模块树；两档实际行数本轮未核（源档在评审面外） |
| 6 | 🟡 | 待修 | 准则 6b：`docs/desktop/design/IPC.md` §2「取件行注」项 7「`onTake` reject ⇒ `kind:"lost"`；`onBlocked(ms, pending)` ⇒ `kind:"blocked"`」——两分支只给发出点，无逐字观察、无复现路径、无 VSC ∥ CLI 同形句 |
| 7 | 🟡 | 待修 | 准则 9：四档无最近先例行；最近先例须散读 KD-74⑥「**timer 员并入（2026-10-05）**」与「与 `[data-timer]` 同族」 |
| 8 | 🟡 | 待修 | 准则 10：四档无出处勘查行（查了哪些对外源档 ∥ 是否有相关项） |
| 9 | 🟡 | 待修 | 准则 11：`inboxNotice` ∥ `clearTurnTraces` ∥ `syncInbox` ∥ `[data-inbox]` 四名无「existing: ∥ none found: ∥ existing but unusable:」三问答案 |
| 10 | 🟡 | 待修 | `docs/desktop/design/IPC.md` §2「取件行注」项 1「`lost`（取件后开轮没成）」落在起跑门同刻，而只剩 KD-74⑥「晚到 `ev:timer`…照写照显」与④ 晚到 `stopped` 丢弃两先例，本员无对应句 |
| 11 | 🔵 | 可后修 | `docs/desktop/design/IPC.md` §1 `ev:inbox` 行「细目 = 本档 §1「取件行注」」——该注实体居 §2（沿同档他注旧例） |
| 12 | 🔵 | 判成立 | 扩面成立：IPC「落点 = `suspension-timers.mjs`；闩表透传 `onBlocked` = `timer-watch.mjs`」＋ `ev:timer` 行「宿主空闲闩（`timer-watch.mjs`——到点交付…）」⇒ 两档皆在 `kind` 两径数据路上；两源档注释原文本轮未核（源档在评审面外） |
| 13 | 🔵 | 可后修 | 既有数值漂移：`thincoder-desktop/renderer/views/chat-chrome.mjs` 292 ∥ 214 ∥ 213、`store.mjs` 374 ∥ 302 ∥ 332、`page-read.mjs` 286 ∥ 235 ∥ ≈152（三档三值） |

计数：🔴 2 · 🟡 8 · 🔵 3（共 13）

VERDICT: changes-required

### 轮次 2（评审子代理）

| # | 严重度 | 状态 | 证据（节号 ∥ 符号 ∥ 逐字句） |
|---|---|---|---|
| 1 | 🔴→已修 | 已修 | `docs/desktop/design/RENDERER.md` §1.6 KD-74①「`before == null` **五清 → 六清**——新增清点项 `inboxNotice[key]`（两槽一并摘）」；「清点机具本体零改」已限义 |
| 2 | 🔴→已修 | 已修 | 同档「集成设计（delta · 自 `test/RTM.md` 起步）」段：破行 0 ∥ 冗余行 0 ∥ 缺行 1 ＋ 所评交互 ∥ 断言 ∥ 用户入口 ∥ 服务需求（RTM 行归父侧，沿父裁定 a） |
| 3 | 🟡→已修 | 已修 | `docs/desktop/design/IPC.md` §1「载荷键集（单源 = 本段）」补「`ev:inbox { key, kind, text }`」与「`ev:secret { … }`」，枚举 = 26 |
| 4 | 🟡→已修 | 已修 | `docs/desktop/design/RENDERER.md` §1.6 KD-74③「**`inboxNotice` 入 `CHAT_KEYS`**」· §1.1「尾组族内序 = 到期触发行组 → **取件行组** → 停止痕」· `docs/desktop/design/SHELL.md` §1「宿主唤醒面四切片归约」 |
| 5 | 🟡→已修 | 已修 | `docs/desktop/design/SHELL.md` §5.1 两行（112 ∥ 120）＋「越层结论（本批改动面 · 宿主族）：两档皆**免拆**」 |
| 6 | 🟡→已修 | 已修 | `docs/desktop/design/RENDERER.md`「分支出处」段（两径各携逐字行文与复现路径）· `docs/desktop/design/IPC.md` §2「取件行注」项 7「跨端形 · VSC」∥「跨端形 · CLI」 |
| 7 | 🟡→已修 | 已修 | `docs/desktop/design/RENDERER.md`「最近先例（对齐 ∥ 偏离）」段：对齐一 ∥ 对齐二 ∥ 偏离一/二/三 |
| 8 | 🟡→已修 | 已修 | 同档「出处勘查」行「相关项 = 有：§5.4 两行逐字锚 + VSC append-only 对位」 |
| 9 | 🟡→已修 | 已修 | 同档「三问（本批新名的既有面）」四答（`inboxNotice` ∥ `clearTurnTraces` ∥ `syncInbox` ∥ `[data-inbox]`） |
| 10 | 🟡→已修 | 已修 | 同档「生命期边界（起跑门同刻的清 ∥ 写）」段「判据 = 本员**零丢弃机制**：门只摘已在场的旧痕，门后到达的行照写照显」 |
| 11 | 🔵→已修 | 已修 | `docs/desktop/design/IPC.md` §1 `ev:inbox` 行「细目 = 本档 §2「取件行注」」——注实体确在 §2 |
| 12 | 🔵 | 接受 | 扩面判据 = 数据路（`docs/desktop/design/IPC.md` §2「取件行注」项 7 × §1 `ev:timer` 行「宿主空闲闩」）；同注「扩面判据 = 数据路，非注释」已成句 |
| 13 | 🔵→已修 | 已修 | `docs/desktop/design/RENDERER.md` §5.1「本档各表与本表不一致时，一律以本表为准」＋读数口径行 |
| 14 | #2255→已修 | 已修 | `docs/desktop/design/IPC.md` §2「`provider:setModelContext`（位次 55 · 已落）」· §2「白名单 = **55 项**（**`provider:setModelContext`（末位 55）· 已落**」 |
| N1 | 🟡 | 待办 | `docs/desktop/design/RENDERER.md` §5.1「越层结论（本批改动面 · 渲染面）：八档皆**免拆**」表内无 `composer-wire.mjs`，而 KD-74② 点名「信号点 = `composer-wire.mjs` 的 `sendDirect` ∥ `sendQueued`」 |
| N2 | 🟡 | 待办 | `docs/desktop/design/SHELL.md` §1「渠道族八通道」八名枚举无 `provider:setModelContext`；`docs/desktop/design/IPC.md` §2 该行「处理体 = `providers.mjs`」 |
| N3 | 🟡 | 待办 | 三问之外仍两名无答：KD-74①「本批只增清点项一支 `clearInboxNotice`」· `docs/desktop/design/SHELL.md` §1「归约者 `onInbox`」 |
| N4 | 🟡 | 待办 | 本批验收只有「断言 = 业务可见结果：两行在场 ∥ 下一回合门后摘除」；`docs/desktop/design/RENDERER.md` §5.2 与 `docs/desktop/design/SHELL.md` §5.2 均无本批批块「测试 ∕ 探针」行 ⇒ 改动面单元测试档未点名 |
| N5 | 🔵 | 待办 | `docs/desktop/design/RENDERER.md` §1.1「跨实例取件行」条内「事件面单源」出现两次且址不同：`docs/desktop/design/IPC.md` §1 ∥ §2「取件行注」 |

计：19 行 = 上轮 14 项（13 已修 + 1 接受）＋ 新增 5 项（🟡 4 ∥ 🔵 1）；本轮遗留 🔴 = **0**。

VERDICT: pass

### 轮次 3（评审子代理）

### 实施评审（第四员落地 · 12 档口径）

| # | 严重度 | 状态 | 证据（指针） |
|---|---|---|---|
| 1 | 🟡 | 待处置（报告项） | 改动面计数与实际不符：批次档「受影响文件（11 档）」+ 会话「12 档」，实改 14 源档 —— `views/compress-status.mjs` `compressAnchorOf` 含 `root.querySelector("[data-inbox]")`；`views/chat-digest-rows.mjs`「运行期痕六清之四」；两处未入任何清单 |
| 2 | 🟡 | 待处置（报告项） | `renderer/views/chat.mjs` 头注镜像过期：「族内序 = 消化行族 → 到期触发行组 → 停止痕」与 `RENDERER.md` §1.1「取件行组」不符；根子序 ∥ syncChrome 面列 ∥ 模型形 ⑤ 亦无 `inbox` |
| 3 | 🟡 | 待处置（报告项） | 批次档 `## §5 实施记录（eng-coder）` 空 —— A10「未验面如实记」无载体，交付证据只在 §3 与会话 |
| 4 | 🔵 | 待处置（建议） | 单元档 `settle = (ms = 10) => new Promise(...setTimeout...)` 墙钟等待（A9 两径） |
| 5 | 🔵 | 待处置（建议） | 单元档 `LOST.includes("turn failed")` 系于核文案字面 —— 与「逐字锚」同源，改核文案即红 |
| 6 | 🔵 | 待处置（知会） | 桌面单测清单 `thincoder-desktop/test/files.mjs` = `export default []`；本批单测档「收口删」⇒ 收口后本族零回归网 |

已核通过（无 🔴）：

- 名集：`preload.cjs` `EVENT_CHANNELS` ∥ `events-subscribe.mjs` `CHANNELS` 皆 26 且同序。
- 归约：`onInbox` 一类一槽 + 零写门（表外 kind ∥ 空 text ⇒ 原引用）。
- 清点：`clearTurnTraces` 第四员、首屏六清、`CHAT_KEYS` 在册。
- 视图：投影 ∥ 行组 ∥ 锚链族内序（到期 → 取件 → 停止）。
- 出站两径：`turn-driver.mjs` `runTurn: executeTurn` × `turn-face.mjs` `async function executeTurn` ⇒ 同步抛面不可达，「开轮没成」必出 lost 行。

计：🔴 0 · 🟡 3（皆报告项，非必改） · 🔵 3

VERDICT: pass

## §4 用户批准（主 agent）

## 用户批准（2026-11-10）

- **用户原话**：「**为啥不做桌面端啊！**」（00:15）——直接推翻了父侧「本批不做桌面」的裁定。
- **父侧自纠两处（记档）**：①「代价大」不是「不做」的理由，只决定怎么验；② **放行 VSC（同样缺宿主、同样只能记「已接未验」）却卡住桌面**——同一条理由两端相反结论，那不是理由，是借口。
- **需求侧依据（父侧事后查证）**：`docs/desktop/requirements/PROJECT.md` §3.6「功能面全量对位」——「**VSC 端已有的一切用户可见功能 ⇒ 桌面必须有——缺项 = 缺陷**」，原话「我不想再出现什么 vsc 端有的功能 desktop 没实现的。——一次处理」。**桌面缺这条行痕就是缺项，就是缺陷。**
- **另接一桩挂账**：`#2255`（`IPC.md` 请求表 54 → 55 缺 `provider:setModelContext` 行）随本批同轮修（用户 00:24「**#2255 别挂着，开工处理掉**」）。

## §5 实施记录（eng-coder）
**状态行**：实施完成（修复轮 2（入窗不撤取件闩）已落 · A13 先红后绿 · 全档 12 例绿 · 终态 clean）



### 实施对照（§2 验收面 · 一条一行）

| # | 判据 | 结果 | 落点 / 读数 |
|---|---|---|---|
| A1 | 名集三处同源 = 26 | ✅ | `preload.cjs` `EVENT_CHANNELS` 26 ∥ `events-subscribe.mjs` `CHANNELS` 26，同序；单测 A1 = 订阅面收到的名集 ≡ 桥面表（deepEqual） |
| A2 | 同类替换、异类不覆盖 | ✅ | `events-wake.mjs` `onInbox`；单测 A2（blocked→lost→blocked ⇒ 两槽在场、blocked 槽 = 末条；跨键分槽；同值原引用） |
| A3 | 表外 `kind` ∥ 空 `text` ⇒ 零写 | ✅ | 同档两门卫；单测 A3（表外 / 空串 / 缺键 / 非串，四形皆原引用） |
| A4 | 回合起跑门摘两槽 + 置闩 | ✅ | `store.mjs` `clearTurnTraces` 第四员（整键摘，两槽一并）；单测 A4（四员同摘 + `stopHold` 真 + 幂等） |
| A5 | 首屏门摘两槽 | ✅ | `page-read.mjs` `clearInboxNotice`（仅 `before == null` 支）；单测 A5（首屏摘 / 回填门零动） |
| A6 | `CHAT_KEYS` 含 `inboxNotice` | ✅ | `frame-dispatch.mjs`；单测 A6 |
| A7 | 行组在场 ∥ 退场 | ✅ | `chat-model.mjs` `inboxOf` ∥ `chat-chrome.mjs` `inboxGroupNode` ∥ `chat-tree.mjs` 构树径；单测 A7（行数 = 槽数 · 空 ⇒ 摘 · 别键不上屏） |
| A8 | 行文逐字 = 核拼串 | ✅ | 单测 A8（行元素文本 ≡ `inboxTakeLostLine` ∥ `inboxBlockedLine` 返回值，端侧零拼串） |
| A9 | 出站两径各恰一帧 | ✅ | `suspension-timers.mjs` 两径 ∥ `timer-watch.mjs` 透传并补键；单测 A9（假 `post`：lost 一帧 · blocked 一帧 · 起算拍零帧） |
| A10 | 未验面如实记 | ⚠️ | 见下「未验（如实）」三行——收口行归 §6 |
| A11 | 改动面单测档点名在册 | ✅ | `docs/batches/2026-11-10-desktop-inbox-trace.test.mjs`（A1–A9 + A7b，11 例） |
| A12 | 集成 delta 可读可判 | ⚠️ | 设计侧块（破 0 ∥ 冗余 0 ∥ 缺 1）已在 `RENDERER.md` §1.6；`test/RTM.md` 行归父侧（§2 上抛项 3），本席不写产品面 |

### 改动面（源档 15 + 单测 1）

| # | 文件 | 改了什么 |
|---|---|---|
| 1 | `thincoder-desktop/src/preload/preload.cjs` | `EVENT_CHANNELS` 末位增 `ev:inbox`（25 → 26）+ 头注计数与两张注解表收正 |
| 2 | `thincoder-desktop/renderer/events-subscribe.mjs` | `CHANNELS` 末位增 `ev:inbox`；四注 25 → 26 + 本通道一条 |
| 3 | `thincoder-desktop/renderer/events.mjs` | `reduce` 增 `case "ev:inbox"`；头注「三切片 → 四切片」「二十三 → 二十四通道」 |
| 4 | `thincoder-desktop/renderer/events-wake.mjs` | 新增 `onInbox` + `INBOX_KINDS`；头注三面 → 四面 |
| 5 | `thincoder-desktop/renderer/store.mjs` | `initialState` 增 `inboxNotice`；`clearTurnTraces` 第四员；三处计数/员数收正 |
| 6 | `thincoder-desktop/renderer/frame-dispatch.mjs` | `CHAT_KEYS` 增 `inboxNotice`（次于 `timerNotice`） |
| 7 | `thincoder-desktop/renderer/page-read.mjs` | 新增 `clearInboxNotice` + 首屏支接入（五清 → 六清）；两处计数收正 |
| 8 | `thincoder-desktop/renderer/views/chat-model.mjs` | 新增 `inboxOf` 投影 `inbox`（空 ⇒ `null`，行序 = `kind` 枚举序） |
| 9 | `thincoder-desktop/renderer/views/chat-chrome.mjs` | 新增 `inboxGroupNode` / `syncInbox`；`blockAnchor` ∥ `timerAnchorOf` 补位，新增 `inboxAnchorOf`；族内序注释 |
| 10 | `thincoder-desktop/src/main/suspension-timers.mjs` | 出站两径（`onTake` reject 前同笔发 lost ∥ `onBlocked` 发 blocked）+ 头注四件 |
| 11 | `thincoder-desktop/src/main/timer-watch.mjs` | `createInboxWatch` 增 `onBlocked` 形参并**补键透传**核闩（核回调只给 `(ms, pending)`） |
| 12 | `thincoder-desktop/renderer/views/chat-tree.mjs` | **表外增**：构树径补 `inboxGroupNode`（重建帧不掉组） |
| 13 | `thincoder-desktop/renderer/views/compress-status.mjs` | **表外增**：`compressAnchorOf` 链首插入 `[data-inbox]`（压缩行恒居取件行组之前） |
| 14 | `thincoder-desktop/renderer/views/chat-digest-rows.mjs` | **表外改**：两处「五清之四」→「六清之四」（同一计数同轮改） |
| 15 | `thincoder-desktop/renderer/views/chat.mjs` | **表外改**：头注镜像收正（四尾组 ∥ 根子序 ∥ `syncChrome` 面列 ∥ 模型形 ⑤ 补 `inbox`） |
| 16 | `docs/batches/2026-11-10-desktop-inbox-trace.test.mjs` | 本批单测档（收口删；不入源档计） |

**表外四档的理由**：①②③ 是「不加则该行为零」的数据路——`chat-tree.mjs` 缺 ⇒ 换会话/整置的重建帧丢行组（撤该行 A7 红，恢复绿，已实测）；`compress-status.mjs` 缺 ⇒ 到期组不在时压缩行越过取件行组（族首失效）；`chat-digest-rows.mjs` 与 `chat.mjs` 是同一计数/同一族内序的第二、第三处表述（D11：一条规则每层同轮）。

`renderer/composer-wire.mjs` 在声明面内，**零改**：两处 `call("msg:send")` 前沿本就同笔调 `clearTurnTraces`，第四员在纯动作内新增 ⇒ 信号点无需动。

### 实现决定（设计未钉死、本席取定，均不改语义）

| # | 决定 | 理由 |
|---|---|---|
| 1 | 槽值形 = 行文串本身（`{ lost?: string, blocked?: string }`） | 设计只钉「一类一槽」与槽名；行组直读切片、行文逐字 ⇒ 文本入槽最短路径，零再包一层 |
| 2 | 组内行序 = `kind` 闭集枚举序（`lost` → `blocked`） | 到达序会因替换而漂；固定序是结构事实，取自 §2「`kind` 闭集两值 = `lost`…∥ `blocked`」的枚举序 |
| 3 | 两档旧注释以「原注「…」随本批接上」的形保留原文 | `IPC.md` §2 项 7 末条以这两句原文为 `依据` 引注；删字即令该引注断（`doc_check` 引缺）。保留原句 + 明写已接上，与 `events.mjs`「原「下回合起清出」口径退场」同形 |

依据 `thincoder-desktop/renderer/events-wake.mjs`「const record = { ...kept, [ev.kind]: ev.text }」
依据 `thincoder-desktop/src/main/suspension-timers.mjs`「post("ev:inbox", { key, kind: "lost", text: inboxTakeLostLine(messages) })」

### 验证读数（本席实跑，命令 + 结论）

| 面 | 命令 | 读数 |
|---|---|---|
| 契约层 11 例 | `node --test docs/batches/2026-11-10-desktop-inbox-trace.test.mjs` | `pass 11 · fail 0`（连跑 3 次同值；约 300ms） |
| **红基线（先红后绿）** | 同上，实施前 | A1 `25 !== 26` · A2/A3/A4/A5/A7 `onInbox is not a function` · A6 `false !== true` · A8 无 `inboxGroupNode` · A9 `0 !== 1` |
| 按面红 · 构树径 | 撤 `chat-tree.mjs` 那一行后跑 A7 | 红：`构树径带行组（换会话 / 整置的重建帧不掉组）`；恢复后逐字节相同 + 绿 |
| 按面红 · 压缩行锚 | 撤 `compressAnchorOf` 的 `[data-inbox]` 后跑 A7b | 红：`压缩行恒居取件行组之前（族首不失效）`；恢复后逐字节相同 + 绿 |
| 底座套件 | `node test/run.mjs`（cwd = `thincoder-desktop`） | `test manifest is empty — zero tests = green`，exit 0 |
| 渲染面真浏览器 | `node tools/web-quickcheck/run.mjs` | `segments=9/9 failed=0 unstubbed=0 pageerrors=0 console-errors=0`（真 DOM 下模块装配与构树径零错） |

### 未验（如实 · 不用「已接」糊过去）

1. **真机「行出现 ∥ 消失」未验**：本环境无 Electron ⇒ `[data-inbox]` 在真窗口的可见性、及「发下一条消息后消失」的眼见读数，本席没有。
2. **`syncInbox` 的 DOM 换代分支未直测**（A7 读法 = 描述符树纯构树）：`node.replaceWith` / `insertBefore` 两径只有静态读，无假 DOM 用例。
3. **集成用例未建**：`test/RTM.md` 属产品面，缺行 1（取件行痕）登记与落地归父侧。

### 审计 / 评审轮次与终态

| 轮 | 内容 | 处置 | 状态 |
|---|---|---|---|
| 内部审计 1 | 只读 explore 对 §2 A1–A9 + 四问（旧形残留 ∥ 漏改消费面 ∥ 出站失败出口 ∥ 表外档） | 判 3 真偏差：出站 lost 单出口（后经证据判**不可达**：`executeTurn` 为 `async` ⇒ 同步抛面不存在）· `compressAnchorOf` 漏接（已修）· 四处「五清」（已修） | 已处置 |
| 自修 1 | 上述三处 + 新增 A7b 锚链用例 | 单测 10 → 11 例 | 绿 |
| 代码评审 1 | advisor `type=code`，射程 = 14 源档 + 单测档 | VERDICT: pass（🔴 0 · 🟡 3 · 🔵 3） | 通过 |
| 自修 2 | 🟡2 `chat.mjs` 镜像过期（已修）· 🔵4 用例墙钟依赖（改 `setImmediate`）· 🔵5 冗余断言行（删） | 连跑 3 次 11/11 绿 | 绿 |

**计数口径**：评审 §3 记「实改 14 源档」——那是自修 2 之前（`chat.mjs` 尚未收正）；收口口径 = **15 源档 + 单测 1**（见上表第 1–15 行 + 第 16 行）。

**终态 = `clean`**。评审留下的 🟡1（清单 12/11 档 vs 实改 14 源档）与 🟡3（本节即其载体）、🔵6（收口后零回归网 ⇒ RTM 归父侧）为**报告项**，不改代码即可收口。

### 上报父侧：设计档漂移（设计席之笔，本席不动）

| # | 漂移 | 建议落点 |
|---|---|---|
| 1 | §2「受影响文件（11 档）」缺三档：`renderer/views/chat-tree.mjs` ∥ `renderer/views/compress-status.mjs` ∥ `renderer/views/chat-digest-rows.mjs`（另 `views/chat.mjs` 头注随改） | §2 文件表补行 + `RENDERER.md` §5.1 越层表补位次 |
| 2 | `SHELL.md` §5.1 两档行数漂：`suspension-timers.mjs` 记 112（实 120）· `timer-watch.mjs` 记 120（实 126） | 按 `doc_check(lines)` 同尺复测改写 |
| 3 | `IPC.md` §2「取件行注」项 7 末条是过程句（记「出站面为何缺」的旧注释）；本批接上后该条应改判或删除 | 设计席文档轮处置 |

依据 `thincoder-desktop/renderer/views/chat-tree.mjs`「if (Array.isArray(model.inbox) && model.inbox.length > 0) children.push(inboxGroupNode(model.inbox))」

### 注释收正轮（两档过期陈述 → 现状句 · 零行为改动）

**父侧指令**：`thincoder-desktop/src/main/suspension-timers.mjs` ∥ `thincoder-desktop/src/main/timer-watch.mjs` 两处旧注释已是假话，改成现状句；只动注释，不碰逻辑 ∥ 设计档 ∥ 别的档。

**为什么它们成了过期陈述**：两句写的都是「当时为什么缺」（宿主 `onBlocked` 径未接），而宿主两径在上一实施轮已接上。此前保留它们的唯一理由 = 给 `docs/desktop/design/IPC.md` 的一条引注当依据；该引注已在设计修复轮删去 ⇒ 根断，附着在它上面的原文一并走。

| 档 | 删去（过期陈述 · 逐字） | 改为（现状句） |
|---|---|---|
| `suspension-timers.mjs` | 原注「`onBlocked` 同理不接」随本批接上（行组 `[data-inbox]` 已落）——上两径即其接上形。 | 两径均接（端侧行组 `[data-inbox]` 上屏）：`onTake` reject ⇒ `kind:"lost"` ∥ `onBlocked` ⇒ `kind:"blocked"`。 |
| `timer-watch.mjs` | 原注「无受阻可读面」随本批接上（端面已建行组 `[data-inbox]`）。 | 生产接法 = `suspension-timers.mjs` 的 `onBlocked` ⇒ `ev:inbox` `kind:"blocked"`（端侧行组 `[data-inbox]` 上屏）。 |

**同一注释块内另收一处笔误（如实记）**：`suspension-timers.mjs` 该块「rendering 面既有行组」→「渲染面既有行组」。理由 = 该词全仓只此一处（内置 grep 射程 `thincoder-desktop` 实读），是「渲染面」的散字；它正落在本轮所改那段的现状句里，留着就是让现状句读成半英半中。零行为改动。

**验证读数（本席实跑，命令 + 结论）**：

| 面 | 命令 | 读数 |
|---|---|---|
| 语法 | `node --check` 两档 | 两档皆无输出（OK） |
| 契约层 11 例 | `node --test docs/batches/2026-11-10-desktop-inbox-trace.test.mjs` | 改前 = `tests 11 · pass 11 · fail 0`；改后 = 同值——只动注释，行为面零读数变化 |
| 旧句残留 | 内置 grep 射程 `thincoder-desktop/src`：「同理不接」∥「无受阻可读面」 | 改前 2 处（就是这两档）⇒ 改后 0 处 |

依据 `thincoder-desktop/src/main/suspension-timers.mjs`「两径均接（端侧行组 `[data-inbox]` 上屏）：`onTake` reject ⇒ `kind:"lost"` ∥ `onBlocked` ⇒ `kind:"blocked"`」

**未做**：逻辑零改（两径实现未动）；设计档零改；别的档零改。**终态仍 = `clean`**。

### 上报父侧：设计档漂移（本席不动设计档）

`docs/core/design/MULTI-INSTANCE-COLLAB.md` 的「两条可见行」族内仍有一条写着「**桌面端本批不接这两行**」，理由列的是宿主两径未接，并以本批这两处注释的原文为证。

该条自立到期条件 = 「桌面宿主两径接上 `ev:inbox` 那一轮，届时本条改写为三端同形」。现状：两径已接、端侧行组 `[data-inbox]` 已落 ⇒ 到期条件成立；本轮又删去被引的两句原文 ⇒ 该条既过期，其引用也已无文本可指。

处置归设计席（状态档改写为三端同形，过程缘由留批档）。本席按边界未动设计档。

### 修复轮 2（父侧裁定：入窗不撤取件闩 · 全落）

**裁定来源 = 父侧本轮明示**：「入窗不该杀取件闩」——D-MI31 的理由句是「撤闩 + 指望别处重臂 = 把门能不能开挂在另一段代码有没有跑到」，而入窗撤闩、靠出窗结算 `sync` 重臂正是这个形状；且桌面本轮已有可见行，闩哑的后果不再只是「日志里少一条」，是消息躺在 inbox 里没人取、用户以为发到了。

**改笔（一处定义，别处只调）**：

| # | 档 | 改了什么 |
|---|---|---|
| 1 | `thincoder-desktop/src/main/suspension-timers.mjs` | 新增只撤 timer 的入口 `disarmTimer`；`disarm` 改为组合（`disarmTimer` + 取件闩 + 名册清理）；`disarmAll` 语义不变（两族同撤）；头注 ∥ 两处 `disarm` 注收正为「撤点分族」 |
| 2 | `thincoder-desktop/src/main/suspension-drive.mjs` | 入窗支由 `timers.disarm(key)` 改 `timers.disarmTimer(key)`；三处注释收正为现状句 |
| 3 | `docs/batches/2026-11-10-desktop-inbox-trace.test.mjs` | 增 A13（先红后绿），12 例 |

**撤点现状（三撤点，与本轮裁定一致）**：会话清除（`abort` → `disarm`）∥ 项目级联（`abortAll` → `disarmAll`）∥ 面板销毁（同走 `dispose` → `abort`）。**入窗不再是撤点**——它只走 `disarmTimer`。

**红基线（改前实跑，先红后绿）**：

```text
node --test docs/batches/2026-11-10-desktop-inbox-trace.test.mjs
✖ A13 入窗只撤 timer 闩：取件闩仍在位且照跑；会话清除仍两族同撤
  AssertionError [ERR_ASSERTION]: 取件闩仍在位（入窗撤它 ⇒ 门能不能开挂在出窗结算跑没跑到上）
  0 !== 1
ℹ pass 11 · fail 1
```

红点落在**入窗那一格**（`armed()` 读 0），而同一格的未入窗前读数 = 1——同一探针在两事实上读出两个值，不是「怎么读都绿」的形状。

**绿读数（改后实跑）**：

| 面 | 命令 | 读数 |
|---|---|---|
| 契约层 12 例 | `node --test docs/batches/2026-11-10-desktop-inbox-trace.test.mjs` | `tests 12 · pass 12 · fail 0`（连跑 3 次同值） |
| 原有 11 例不退红 | 同上 | A1–A9 + A7b 全绿 |
| 语法 | `node --check` 两档 | 两档皆无输出（OK） |
| 底座套件 | `node test/run.mjs`（cwd = `thincoder-desktop`） | `test manifest is empty — zero tests = green`，exit 0 |

**A13 四段断言**：① 池空 ⇒ 未入窗，取件闩在位（`armed()` = 1）② 池活 ⇒ 入窗，`drive.size()` = 1 ∧ `timerLatches()` = 0 ∧ `armed()` 仍 = 1 ③ 入窗期间闩照跑：待取非空、跨阈 ⇒ 恰一帧 `kind:"blocked"` ④ 两撤点照撤：`abort` ⇒ `armed()` = 0；别键只装取件闩后 `abortAll` ⇒ `armed()` = 0。

**未验（如实）**：

1. 真机「行出现 ∥ 消失」仍验不了（本环境无 Electron）——A10 那条本轮同样未验。
2. **「能取件」本轮只证到「闩在位 ∥ 有拍」**：入窗期取件仍被 `busyOf` 的 `inWindow(key)` 一支挡着（既有设计，非本轮所改）⇒ 入窗期该闩只出受阻行、不取件；取件发生在出窗之后的同一批闩拍上。本轮改的是「闩不再被撤」，不是「入窗期能取件」。

**上报父侧：设计档漂移（本席不动设计档）**：

| # | 落点 | 现态与新事实的差 |
|---|---|---|
| 1 | `docs/core/design/MULTI-INSTANCE-COLLAB.md` §5.4 | 「例外两处，均在 §5.8 端装配表里点名」的例外之一 = 桌面入窗，随本轮裁定消失（现只剩 VSC 转空工作区一处） |
| 2 | 同档 §5.8 Desktop 行 | 记「三处 … 一并撤取件闩（入窗 · 会话清除面 · 切项目级联）」且对齐 = `open`；现态 = 入窗只撤 timer，该对齐可收口 |
| 3 | 同档 §5.9 「桌面入窗会撤一次取件闩」条 | 前提已不成立（入窗不撤）；该条后半句「受阻行在闩在位 … 跨 `INBOX_BLOCKED_MS` 时产生」现为真——原档两句互相打架，本轮之后只剩后半句成立 |
| 4 | `docs/desktop/design/SHELL.md` §5.1 ∥ `docs/desktop/design/ACTIVITY.md` §4 | 行数读数随本轮变化：单尺 `doc_check(lines)` = `suspension-timers.mjs` **134** ∥ `suspension-drive.mjs` **341**（SHELL §5.1 记 121 两处 · ACTIVITY §4 记 75 ∥ 340） |

**本批单测档**：`docs/batches/2026-11-10-desktop-inbox-trace.test.mjs`（A1–A9 + A7b + A13，12 例；收口删）。

依据 `thincoder-desktop/src/main/suspension-drive.mjs`「timers.disarmTimer(key) // 入窗 ⇒ 只撤空闲闩」

依据 `thincoder-desktop/src/main/suspension-timers.mjs`「const disarmTimer = (key) => watch.disarm(key)」

依据 `thincoder-desktop/src/main/suspension-timers.mjs`「disarm: (key) => { const had = disarmTimer(key); inbox.disarm(key); forgetIfIdle(); return had }」

## §6 验证与收口（父代理）

## 验证与收口（父侧）

### 验收读数（父侧亲自跑）

- `node --test docs/batches/2026-11-10-desktop-inbox-trace.test.mjs` ⇒ **`tests 12 · pass 12 · fail 0`**（该档收口删除，读数留此）。
- `doc_check(mode:"gate")` ⇒ **`PASS`**。
- 实施席另跑：`node tools/web-quickcheck/run.mjs` ⇒ `segments=9/9 failed=0 unstubbed=0 pageerrors=0 console-errors=0`（真 DOM 下模块装配与构树径零错）。

### 失败面（先红后绿，逐项）

- **首次实施前**：A1 `25 !== 26` · A2–A5/A7 函数不存在 · A6 `false !== true` · A8 无组件 · A9 `0 !== 1`。
- **按面红**：撤 `chat-tree.mjs` 那一行 ⇒ A7 红；撤 `compressAnchorOf` 的 `[data-inbox]` ⇒ A7b 红；恢复后**逐字节相同**且绿。
- **入窗撤闩修正**：A13 改前 `0 !== 1`（入窗后 `armed()` 读 0），改后 12/12 连跑 5 轮同值。

### 落地核对

- **通道 → 订阅 → 归约 → 两门清点 → 帧键 → 投影 → 行组 → 出站两径** 全链打通；行文取核拼串（`inboxTakeLostLine` ∥ `inboxBlockedLine`），**端侧零构造**。
- **一类一槽**：`inboxNotice[key] = { lost?, blocked? }`，异类不覆盖（`blocked` 盖 `lost` 会丢掉端侧唯一留痕的 msgId 列表）。
- **两门清点**：首屏门 **五清 → 六清**（新增 `clearInboxNotice`）· 回合起跑门 `clearTurnTraces` 第四员（两槽一并摘）。**清点机具本体零改，只增清点项。**
- **出站两径**：`onTake` reject ⇒ `kind:"lost"` ∥ `onBlocked` ⇒ `kind:"blocked"`；`timer-watch.mjs` 补键透传。
- **撤闩分族（本批新裁）**：`disarmTimer(key)` = 唯一一处定义，只撤 timer 闩；`disarm` 改组合。**取件闩只在三个撤点死：会话清除 ∥ 项目级联 ∥ 面板销毁**；**入窗只撤 timer 闩**。

### 改动面（15 档源档 + 单测）

声明面 11 档全改；**表外 4 档**（各带「不加会怎样」）：`views/chat-tree.mjs`（构树重建径，不加则换会话后行组丢）· `views/compress-status.mjs`（`compressAnchorOf` 链首缺 `[data-inbox]`，到期组缺席时压缩行越过取件行组）· `views/chat-digest-rows.mjs`（「五清之四」→「六清之四」）· `views/chat.mjs`（头注镜像过期）。实施席另做全仓兄弟员比对（`timerNotice` 七档 ∥ `inboxNotice` 七档**逐档全等**）⇒ **切片消费面无缺档**。

### 设计档收正（六轮）

1. 13 条评审（2🔴 + 8🟡 + 3🔵）全落 + `#2255`（请求表 54→55 并补 `provider:setModelContext` 行）。
2. `chat-tree.mjs` 补进越层表；批档 §2 文件表 11 → **15 档**。
3. `IPC.md` 项 7 过程句**删**（它引的两句旧注释已不成立，且以批档档号为指针——批档可删，指针必死）。
4. `SHELL.md` 行数收正（同尺实读）：`suspension-timers.mjs` **134**、`timer-watch.mjs` **126**；`ACTIVITY.md` §4.1 五行、`COMPOSER.md` §3.2 同步。
5. `KD-74①` 平掉变更痕迹（「五清 → 六清」→「六清 + 逐名」）。
6. 三端同形收口：`MULTI-INSTANCE-COLLAB.md` §5.4 / §5.8 ④ / §5.9 由「CLI ∥ VSC」改为**三端**；`open` 取掉（入窗撤闩已修）。

### 已知边界（明写，不留白）

- **「闩在位」≠「入窗期能取件」**：入窗期 `busyOf` 的 `inWindow(key)` 一支仍把该键判作在飞 ⇒ **只出受阻行、不取件**；取件发生在出窗之后同一批闩拍上。本批改的是「闩不再被撤」，不是「入窗期就能取件」。
- **真机「行出现 ∥ 消失」未验**：本环境无 Electron；`syncInbox` 的 DOM 换代分支未直测。**如实记未验，不用「已接」糊过去。**
- **桌面集成层未建立**：`node test/run.mjs`（desktop）= `test manifest is empty`。缺的那条用例已挂账 `#2256`（被五仓测试树全清令挡着）。

### 集成测试面

- 本批**未新增用例**（集成树受全清令）；缺口已登记在设计 delta + 台账 `#2256`。

### 台账

- 本批行 `#2254` / `#2255` 走完 `在途 → 待核销 → 已核销`。
- `#2256`（桌面取件行痕缺一条集成用例）条件触发，转下一批。

### 收口扫描

- **延后批复核**：无。
- **文档检查门**：`PASS`。
- **遗留**：`#2256`（集成用例，被全清令挡）· `ACTIVITY.md` §4.1 整表偏旧（另批复测）· `AGENT-LOOP-ASYNC-POOL.md` §6.30.5 一条带日期的时点行仍是旧读数（未修，理由见 §5）。
