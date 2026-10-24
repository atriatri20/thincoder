# 2026-10-20 · vsc-queue-band
> 六段 append-only，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 编制：主 agent · 2026-10-20 · 来源 = 用户令（2026-10-20 12:03「对呀，这是缺陷，要对齐桌面端」）：VSC 忙态排队面从流内气泡+待发送标记改为输入区上方待发送带（对齐桌面端 KD-31/KD-40），消费前流内零块。
> 台账 = #1718（VSC · 归批）。前情 = 无（独立批）。
## §1 讨论（主 agent）
**状态行**：已收口 2026-10-20
<§1 模板占位：本批条目 / 关键判据 / 授权口径>

## 讨论记录

**用户报告（2026-10-20 12:02）**：「为什么现在 vsc 端排队的消息会被插进会话流？整个处理跟 desktop 差距很大。」→ 12:03 裁定「**对呀，这是缺陷，要对齐桌面端。**」

**父侧实读（两端对照）**：

| | VSC（现状） | Desktop（对齐目标） |
|---|---|---|
| 受理回显 | **Echo FIRST**：先 postMessage `userMessage` 进 webview，再 `routeUserTurn`（`thincoder-vscode/src/extension/chat-panel.mjs:302`） | `msg:send` 交宿主任判；忙 ⇒ 回执 `{ok:true, queued:true}`，渲染面**不落块**（`docs/desktop/design/COMPOSER.md:26`） |
| 队列可见面 | **流内 user 气泡 + `pending` 标记**（`docs/vsc/design/WEBVIEW-INPUT.md:50` C-B2-6 ⑦；`webview/queued-mark.js` `markPending` / `clearPending` / `planBusyQueued`） | **输入区上方待发送带，非流内**（`COMPOSER.md:15` KD-31；`thincoder-desktop/renderer/views/chat-pending.mjs` 派生块：标签两形 + 逐条原文 + 超限尾标记） |
| 消费时刻 | 单条 ⇒ 清标保留气泡；多条 ⇒ 移除标记气泡 + 追加合并气泡 | 带项退场 + **流内恰一枚** user 块（`COMPOSER.md:34`） |
| 队列权威 | 扩展宿主（`susp.pendingInput` / `_busyQueued`），webview 镜像 `busyQueued` 快照 | 宿主主进程（`queued-input.mjs`），`ev:queue` 快照镜像 |

**性质 = 缺陷（不是可保留的端差）**：
- 跨端纪律：**用户可见端差 = 缺陷**，唯一例外 = 宿主能力面（须实证）。两端都能在输入区上方画带（共用件 `thincoder-render-core/flow/queued-mark.mjs` 已在），**无宿主能力理由**。
- 该差异**未登记**在 `docs/vsc/requirements/WEBVIEW.md` §4 端差表——两端各拿「形态各端自落」当口径，等于静默保留差异。
- 桌面端那套更晚，且依据用户走查原话（KD-31 理由栏「排队中的时候要先是在输入区的上面，不是在右边」）。

**本批范围**：
1. VSC 忙态排队面改**输入区上方待发送带**（派生块：标签两形 + 逐条原文 ≤3 行 + 超限尾标记；数据源 = `busyQueued` 快照）。
2. **消费前流内零块**：Echo FIRST 改为「只有真回合才出泡」；消费时刻流内恰一枚（单条 = 原文；多条 = 合并文本）。
3. 设计档随动：`WEBVIEW-INPUT.md` C-B2-6 ⑦ 重写、`WEBVIEW-PROTOCOL.md` §3.2 行 17 + 回显句（`:167`）收正；需求档新增 F-W22。
4. 共用件判断：`render-core/flow/queued-mark.mjs` 是否扩展/退役标记面（桌面端消费 `markPending` / `paintLabel`，改动须两端同时成立）。

**不做**：不改队列机制本体（容量 8 / 合并常量 / 五个消费点 / 满队拒收 / 步边界 pickup）· 不改附件留队语义 · 不改 CLI 面 · 桌面端零改 · 不改会话流渲染其余形态。

**已确认**：用户 2026-10-20 12:03 逐字「对呀，这是缺陷，要对齐桌面端」= 开批 + 批级放行；按 2026-10-19 裁定，本批全链自动跑完（评审照走）。

## §2 批次任务与设计（eng-designer）
**状态行**：设计完成 · 2026-10-20（评审 #32 修正轮十条已落（🔴2 · 🟡5 · 🔵3）· doc_check PASS（2 档）· 先例批批档号未勘得（已明写））
<§2 模板占位：本批条目（覆盖） / 设计档落点 / 机制设计 / 受影响文件与测试覆盖 / 验收对照 / 关键决策 / 上抛项>

**状态行**：设计完成（2026-10-20）

## 本批条目（覆盖）

| # | 条目 | 回指 | 状态 |
|---|---|---|---|
| 1 | 忙态排队面 = 输入区上方待发送带（派生 · 非流内；标签两形 + 逐条 ≤3 行 + 超限尾标记） | F-W22 ③⑤ | 覆盖 |
| 2 | 消费前流内零块（忙态提交零 user 气泡；宿主回显只走真回合） | F-W22 ①② | 覆盖 |
| 3 | 消费时刻 = 带项退场 + 流内恰一枚 user 块（单条 = 原文；多条 = 合并文本；五个消费点 + 窗内消费统一） | F-W22 ② | 覆盖 |
| 4 | 满队（第 9 条）零变（不出泡 + toast + 文本保留） | F-W22 ④ | 覆盖 |
| 5 | 共用件处置（核 `flow/queued-mark.mjs` 收窄；桌面零改） | 设计点 5 | 覆盖 |

**不在本批**：队列机制本体（容量 8 / 合并常量 / 五个消费点 / 满队拒收 / 步边界 pickup）零改 · 附件留队语义零改 · CLI 零改 · 桌面端零改 · 流内其余形态零改 · 提示词面零改 · 需求档 F-W22 只读。

## 设计档落点（已落）

- `docs/vsc/design/WEBVIEW-INPUT.md` §1 C-B2-6 ⑦ 重写（L50-62）+ 行 L21 / 细则② ⓪ / 细则③ / §7 U-I2 · U-I8 / §9 行 1 随动。
- `docs/vsc/design/WEBVIEW-PROTOCOL.md` §3 `busyQueued` 行 / §3.2 行 17 / §4.1 回显句 / §6.3 键表 / §7 D-P15 / §11 行 9 / §12 `busyQueued` 行 / §13 `queuedUserMessage` 行。

## 机制设计（摘要 · 单源 = 上述设计档小节）

1. **带形态**：`#pending-band` 装配期创建，`insertBefore` 到输入行（`composer.inputEl.parentElement`）之前——`#toolbar` 内贴输入上沿（机检 `band.nextElementSibling === 输入行`）；不在 `#messages`、不携 `data-block-kind`；判据空 ⇒ `hidden` 零高。子形对齐桌面 `chat-pending.mjs`（`.chat-pending-label` 两形 / `[data-pending-item][data-raw]` / `.chat-pending-body` clamp 3 / `[data-pending-more]` 量面）。
2. **数据源**：`busyQueued { pending, count, items, merged? }`；`text` 退役（webview 零读）；`items` = 两载体剩余项原文；`merged` = 本批消费文本（仅消费推送携）。
3. **回显时机**：宿主 `sendMessage` 回显门 = `!turnBusy()`（idle 直发保留；running ∨ susp ⇒ 零 post）；webview 核件 `hooks.onUserEcho` 同判据返回 `null`（核 composer 零改——桌面同件零改）。
4. **消费出块**：webview 依快照派生——`merged` 在场 ⇒ 带面按 `items` 重绘 + `addUser(ctx, merged)` 恰一枚；宿主零第二推送点。五个消费点均已在消费推送携 `merged`（`queued-pickup.mjs:41` · `suspension.mjs:166` / `:329` · `panel-turn-stages.mjs:242`），装载① 载体迁移（`:206`）不携 ⇒ 零出块。
5. **窗内受理**：`routeUserTurn` 在 `panel._chat(...)` 后补 `pushBusyQueued(panel)`（susp 窗内受理快照；idle 面幂等零副作用）。
6. **共用件**：核 `flow/queued-mark.mjs` 退役 `planBusyQueued` + 私有 `lastIndexOfRaw`（VSC 改后零消费；桌面不消费——KD-31 已登记）；**保留** `markPending` / `paintLabel`（桌面）与 `clearPending` / `QUEUED_MAX_ITEMS`（服务端两档 + 核 composer 消费——不是死码）。
7. **i18n**：VSC locales 增 `chat.pending.single|multi|more`（逐字同桌面 `i18n-views.mjs:65-67` / `:256-258`）；删 `queued.pending`（VSC 本地档；核容器键保留）。

## 受影响文件（当前行数 → 预计增量；单面 = VSC 排队面）

| 文件 | 当前行数 | 预计增量 | 改动 |
|---|---|---|---|
| `thincoder-vscode/src/extension/chat-panel.mjs` | 457 | +3/−2 | `sendMessage` 回显门 = `!turnBusy()` |
| `thincoder-vscode/src/extension/panel-messages.mjs` | 393 | +7/−5 | `pushBusyQueued` 载荷收正（`text` 退役）；`routeUserTurn` `_chat` 后补一拍 |
| `thincoder-vscode/webview/chat-messages.js` | 298 | +1/−1 | `case "busyQueued"` 改指 `pending-band.js` |
| `thincoder-vscode/webview/queued-mark.js` | 41 | −41（删档） | 标记壳整体退役 |
| `thincoder-vscode/webview/pending-band.js` | 0（新档） | +110 | 带构造 + 量面 + `applyBusyQueued` |
| `thincoder-vscode/webview/input.js` | 129 | +2/−1 | `onUserEcho` 忙态返回 `null` |
| `thincoder-vscode/webview/state.js` | 159 | +1 | `_busyQueuedItems` 镜像字段 |
| `thincoder-vscode/webview/chat.css` | 499 | +30 | `.chat-pending-*` 形态 |
| `thincoder-vscode/locales/zh.json` / `en.json` | 352 / 352 | +3/−1 各 | 新三键 / 删 `queued.pending` |
| `thincoder-render-core/flow/queued-mark.mjs` | 106 | −30 | 退役 `planBusyQueued` + `lastIndexOfRaw` |
| `thincoder-vscode/test/2026-10-20-vsc-queue-band.test.mjs` | 0（新档） | +180 | 本批单元档（八大用例） |
| `thincoder-vscode/test/files.mjs` | 8 | +1 | 登记新档 |
| `docs/vsc/design/WEBVIEW-INPUT.md` | 162 | +8 | ⑦ 重写 + 随动 |
| `docs/vsc/design/WEBVIEW-PROTOCOL.md` | 518 | +10/−6 | 协议行收正 |
| 合计 | — | 15 文件 | 源码 11（含 1 删 1 新）+ 测试 2 + 文档 2 |

**零改**：`panel-turn-stages.mjs`（247）· `suspension.mjs`（338）· `queued-pickup.mjs`（43）——三处消费推送已携 `merged` / 装载① 已不携；`thincoder-render-core/composer/panel.mjs`（485）· `webview/index.html`（133）· 桌面端 · `src/**` 其余 · 需求档。

## 验收对照（F-W22 ①–⑤ · DOM 级）

| 判定句 | 判法（happy-dom 驱真 webview 模块） |
|---|---|
| ① 忙态提交 ⇒ 流内零新增 | 提交前后 `#messages` 子节点数相等（零 `data-block-kind` 新增）；`#pending-band [data-pending-item]` 数 = `count` |
| ② 消费 ⇒ 带归零 + 恰一枚 | 消费快照后 `[data-pending-item]` = 0，`#messages .message.user` 末块文本 = `merged`，本拍新增恰 1 |
| ③ 带贴输入上沿 | `band.nextElementSibling === composer.inputEl.parentElement` ∧ `#messages.contains(band) === false`；短会话（1 条消息）band 顶 ≥ `#toolbar` 顶 |
| ④ 满队零变 | 第 9 条：`[data-pending-item]` = 8 ∧ toast 在场（`input.slotFull`）∧ `#input.value` 保留 ∧ `#messages` 零新增 |
| ⑤ 两形 + ≤3 行 + 尾标记 | 单条 = `chat.pending.single`；多条 = `chat.pending.multi` + 每条 `i. `；`data-raw` 逐字；`.chat-pending-body` CSS `-webkit-line-clamp: 3`；量面 stub（`scrollHeight/lineHeight > 3`）⇒ `[data-pending-more]` 非 hidden |

## 用例表（本批单元档 · 单入口 `node --test`）

| # | 用例 | 输入 | 期望 |
|---|---|---|---|
| 1 | 单条 | 忙态发 `a` | 流内零块；带 1 条；消费 ⇒ 带空 + 恰 1 块 `a` |
| 2 | 多条 | 忙态发 `a`,`b` | 带 2 条（编号）；消费 ⇒ 恰 1 块 = 合并文本 |
| 3 | 合并批 + 残项 | 快照 `{items:["c"], merged:"1. a\n2. b"}` | 带剩 `c`；流内恰 1 块合并文本 |
| 4 | 装载① 迁移 | 快照 `{items:[...], count:n}` 无 `merged` | 带原样；流内零新增 |
| 5 | 满队 | `count=8` 再提交 | 零出泡 + toast + 文本保留 + 带仍 8 |
| 6 | 冷启重推 | 握手快照（无 `merged`） | 带按 `items` 重建；流内零新增 |
| 7 | 会话中止 | 中止后 `{count:0, items:[]}` | 带 `hidden`；零块 |
| 8 | idle 直发 | 非忙发送 | 气泡照旧 +1（零回归） |

## 关键决策

| # | 决策 | 理由 |
|---|---|---|
| D-Q1 | 带面 = **派生**（`items` 纯函数重绘） | 判据消失即退场；零块序 / 零生命周期簿记；防悬空结构性成立 |
| D-Q2 | 出块由 **webview 依快照 `merged` 派生**（宿主零新推送） | 五个消费点已推快照；不新增协议消息 / 第二推送点；`merged` 只随消费推送 ⇒ 幂等重推零重复 |
| D-Q3 | 回显门 = `turnBusy()`（running ∨ susp） | 与两载体快照口径一致；桌面「全输入径零块」对齐；idle 直发零回归 |
| D-Q4 | `text` 退役；`merged` 语义收正为消费文本 | `text` webview 零读（死字段）；`merged` 已是消费批文本单源 |
| D-Q5 | 核件收窄 = 退役 `planBusyQueued`（+ `lastIndexOfRaw`） | VSC 改后零消费；桌面零改（不消费）；`clearPending` 仍被服务端两档 + 核 composer 消费 ⇒ 保留 |

## 边界

不改队列机制本体（容量 8 / 合并常量 / 五个消费点 / 满队拒收 / 步边界 pickup）· 不改附件留队语义 · 不改 CLI · 桌面端零改（含 `thincoder-desktop/**` 与核 `composer/panel.mjs`）· 不改会话流其余形态 · 提示词面零改。

**登记（不在本批）**：释放窗口（`_turnState==="susp"` ∧ 无会话）拒收径——回显抑制后该径为「warning + 文本已在提交时清空」；现形为「幽灵气泡 + warning」，两形都非本批语义面，按既有拒收语义保持（不在本批扩文本保留）。

## 上抛项

无（需求 F-W22 已落、设计与判定句一一对应；无待裁冲突）。

### 修正轮（设计评审 #32 · 轮次 1 · 十条全受理 · 2026-10-20）

**处置口径**：两条 🔴 按机制级收正（消费点成员收成一张表 + 行 16 与 §4.1 ∥ §13 同步），不软化措辞；三条 🔵 为文档卫生 / 定义补齐。

| # | 处置 | 改动落点 |
|---|---|---|
| 1 🔴 | 消费点成员收成正表；「窗内消费」定义 | `WEBVIEW-INPUT.md:67-75`（消费点表：五成员 / 载体坐标 / 携 `merged` / 出块 / 带面；③ 装载① 显式「零出块」）· `:77`（术语对齐：窗内消费 = ② driver 步骤 1；回合尾 = ③+④；卸载直发 = ⑤）· `:31`（原四处列名改为指表——成员单源一处） |
| 2 🔴 | 行 16 收正 + 坐标对齐 §13 | `WEBVIEW-PROTOCOL.md:107`（「本地气泡先行」⇒「忙态零本地气泡（`hooks.onUserEcho` 返回 `null`）；回显只走真回合」；发射 `composer/panel.mjs:352` ∥ 消费 `panel-messages.mjs:229`——与 §13:489 同值） |
| 3 🟡 | 补受影响文件表 | `WEBVIEW-INPUT.md:189-214`（18 行 / 19 文件；现行行数 = 本次实测；零改档标 ±0；最大档 `chat.css` 499 < 500 ⇒ 零拆分面） |
| 4 🟡 | 补桌面实现坐标 + 先例批 | `WEBVIEW-INPUT.md:53-55`（`pendingGroupNode` `:27` ∥ 逐条节点 `:40-45` ∥ `paintPendingOverflow` `:52-65` ∥ `ITEM_MAX_LINES:16` = 3 ∥ 标签键 `i18n-views.mjs:65-67` / `:256-258`；先例批号未勘得——明写不臆造） |
| 5 🟡 | 补勘源证据行 | `WEBVIEW-INPUT.md:51-52`（桌面 COMPOSER KD-31 ∥ KD-40「有相关」· 桌面 chat-pending.mjs「有相关」· CLI TUI-INPUT-BOX §4.1 ∥ TUI §7.5「有相关」· 核 queued-mark「有相关」· 仓外参考仓「无相关」） |
| 6 🟡 | `items` 统一必携 + 缺席语义 | `WEBVIEW-PROTOCOL.md:68`（`items` **必携**（可空数组）；缺 `items` 的旧载荷 ⇒ 带面保留原态、零重绘，`count` 照常更新）——与 `:108` 必携形一致 |
| 7 🟡 | 点名测试载体 + N-W5 缺口登记 | `WEBVIEW-INPUT.md:187`（载体 = `test/2026-10-20-vsc-queue-band.test.mjs`；登记 = `test/files.mjs` 追加；缺口消解路径 = 本批单元档自证；到期 = VSC 前端集成长出首个业务场景档时并入） |
| 8 🔵 | 键数漂移 + 缺行 | `WEBVIEW-PROTOCOL.md:272`（标题 28 ⇒ **31 键**，按表实重算：实测 31 行）· `:287`（`sub.awaitingApproval` 入表）· `:333`（原字面注收为「字面 = 本表行」，去重复单源） |
| 9 🔵 | 行 17 行尾多余空单元 | `WEBVIEW-PROTOCOL.md:108`（收掉 3 个空单元——5 列对齐，与 `:109` 续行同形） |
| 10 🔵 | 「平 node ∕ 零版式」定义 + 编号载体指名 | `WEBVIEW-INPUT.md:61-62`（取值对象 = `.chat-pending-body`；行数 = `max(1, round(scrollHeight / lineHeight))`；零版式 = `scrollHeight` ∕ `clientHeight` 非 number ∨ `lineHeight` 非有限正数 ⇒ 早返零写）· `:59`（编号载体 = `.chat-pending-body` 文本前缀，机检选择器 `[data-pending-item] .chat-pending-body`） |

**随动读数（本次实测，修正 §2 前文两处计数）**：`webview/state.js` = **160** 行（前文 159）；`test/files.mjs` = **9** 行（前文 8）。其余行数与受前面表一致。

**零改复核（口径未变）**：`thincoder-vscode/src/**` ∥ `webview/**` ∥ 产品代码 ∥ 需求档 F-W22 ∥ 桌面端 —— 本修正轮零触碰；本轮只改两份设计档。

**机检**：`doc_check(mode:"gate")` = **PASS**（2 档 · 0 命中；首轮 3 条行宽超限 → 同轮断行后复跑）。

**上抛项**：无。**余项**：先例批批档号未勘得（已在设计档明写，不臆造）；批档号入档非本批阻塞面。

### 设计档漂移收正（实施轮后 · 2026-10-20）

**触发**：§5「设计档漂移」项 2——`docs/render-core/design/RENDER-CORE.md` 八处仍描述已删 `thincoder-vscode/webview/queued-mark.js` 与已退役核 `planBusyQueued`。
**处置口径**：D8 失效表述删（不留「已删 ∕ 原 X 已改 Y」尸体）；D2 带面机制单源 = `docs/vsc/design/WEBVIEW-INPUT.md` §1 C-B2-6 ⑦，本档只收正构件层拆档表，不重述带面机制。

| # | 原坐标 | 改动（现坐标） |
|---|---|---|
| 1 | `:108` | 拆档表行 30 = `pending-band.js`（**端**——纯 DOM 与快照来源留端）⇒ `:108`；§3 计数 拆 8 ⇒ **7** · 端 33 ⇒ **34**（50 档不变）⇒ `:131` |
| 2 | `:156` | 逐机制对位行 16：VSC 承载 = `webview/pending-band.js`；核承载 = `flow/queued-mark.mjs` 四导出（`:15` ∥ `:18` ∥ `:26` ∥ `:34`）⇒ `:156` |
| 3 | `:265` | 桌面消费面 ②：`planBusyQueued` 不消费句删；`clearPending` 桌面不消费——消费面单源 = §9「对齐第二批」② ⇒ `:265` |
| 4 | `:373` | §6 删 `queued-mark.js` 计划行；表头 判定表 17 ⇒ **16** 档 · 拆 8 ⇒ **7** ⇒ `:354`（表头）/ 行删于 `:372-373` 之间 |
| 5 | `:402` | 口子清零二轮随动：删 `flow/queued-mark.mjs ≈110`（`planBusyQueued` 补丁面）一句 ⇒ `:401` |
| 6 | `:475` | R2 文件面删 `queued-mark.js` ⇒ `:473` |
| 7 | `:490` | §9 删「同文重项」①（补丁面退役，无「泡」可建）；余句收为「盘面零气泡处置 = 不适用」⇒ `:487` |
| 8 | `:501` | §9「对齐第二批」②：`clearPending` 桌面不消费 + 消费面 = `thincoder-server/public/views-chat-composer.mjs:16` / `:288` ∥ `views-me-chat-composer.mjs:28` / `:398` ⇒ `:497` |

**读数（落盘后实测）**：全文 `planBusyQueued` = **0** · `queued-mark.js` = **0**（`queued-mark.mjs` = 1，活档）· §3 行数 = **50** · §6 行数 = **16** · 非表格单行最大 = **284** 字符 · `doc_check(mode:"gate")` = **PASS**（1 档 · 0 命中）。
**零改**：产品代码 · `WEBVIEW-INPUT.md` · `WEBVIEW-PROTOCOL.md` · 需求档 · 本档 §1 ∕ §3 ∕ §4 ∕ §5 ∕ §6。

**余项（同档相邻漂移 · 未改 · 待裁）**：① `:499`「待发送气泡半件保持登记」——VSC 待发送面已无气泡（派生带），该登记面对象已不存在；② `:268`「核件所需 VSC 侧键（`queued.pending`）入宿主表，值逐字同 VSC locales」——VSC `locales/{zh,en}.json` 已删该键（grep 零命中），值源只剩桌面 `thincoder-desktop/renderer/i18n.mjs:211` / `:319`。两处均不在本轮八点清单内，未擅改。

### 同档相邻漂移两处收正（父侧受理 · 2026-10-20）

**触发**：上节「余项（同档相邻漂移 · 未改 · 待裁）」两处，父侧受理并随本批收正。
**处置口径**：D8 失效表述删（不留「已删 ∕ 原 X 已改 Y」尸体）；D2 带面机制单源 = `docs/vsc/design/WEBVIEW-INPUT.md` §1 C-B2-6 ⑦，本档只留构件层登记与取词归属。

| # | 原坐标 | 改动（现坐标） | 实件依据 |
|---|---|---|---|
| 1 | `docs/render-core/design/RENDER-CORE.md:268` | 原「核件所需 VSC 侧键（`sub.*` / `msg.*` / `queued.pending`）入宿主表，值逐字同 VSC locales」⇒ 拆两行：`:268` = `sub.*` / `msg.*` 入宿主表（值逐字同 VSC locales，沿 `msg.copy` / `msg.copied` 先例）；`:269` = `queued.pending`（核 `thincoder-render-core/flow/queued-mark.mjs:30` 取词）在 VSC 侧零键——值源 = 桌面表 `thincoder-desktop/renderer/i18n.mjs:211` / `:319` | VSC `locales/{zh,en}.json` 该键零命中（本批 +3/−1 删）；桌面两语键在场 |
| 2 | `docs/render-core/design/RENDER-CORE.md:499` | 原「⑤ 运行期可见面两件（待发送气泡 / 归档子 agent 块）——归档子 agent 块半件已消解 ∥ 待发送气泡半件保持登记（页读整置即失——有意行为）」⇒ `:500` = 「⑤ 运行期可见面 · 归档子 agent 块 = 已消解（块体入人读线记录 ∥ 页读重建）」——待发送气泡登记对象已不存在，按 D8 删；现形登记 = 拆档表 `:108` ∥ 逐机制对位 `:156` | VSC 待发送面 = 派生带 `thincoder-vscode/webview/pending-band.js`（120 行）；`webview/queued-mark.js` 已删、核 `planBusyQueued` 已退役 |

**读数（落盘后实测）**：`RENDER-CORE.md` = **523** 行（+1 = 第 1 项拆两行）· 全文 `queued.pending` = **1**（`:269` 归属句——VSC 侧零键 ∕ 值源桌面表）· 「待发送气泡」 = **0** · 非表格单行最大 = **284** 字符（≤300）· `doc_check(mode:"gate")` = **PASS**（1 档 · 0 命中）。

**零改**：产品代码 · `WEBVIEW-INPUT.md` · `WEBVIEW-PROTOCOL.md` · 需求档 · 本档 §1 ∕ §3 ∕ §4 ∕ §5 ∕ §6。

## §3 设计评审（评审子代理）

### 轮次 1（评审子代理）

**评审对象**：WEBVIEW-INPUT.md §1 C-B2-6 ⑦ + WEBVIEW-PROTOCOL.md §3 / §3.2 行 17 / §4.1 / §6.3 / §7 / §11–§13（F-W22 待发送带对齐）

| # | Category | Severity | Issue | Suggestion |
|---|----------|----------|-------|------------|
| 1 | Requirements ∕ 一致性 | 🔴 | 「五个消费点」成员两处不同：WEBVIEW-INPUT.md:31 列「五个消费点（**步边界 pickup** / driver 步骤 1 / 装载① 预填 splice / 装载② 归位 shift / **会话退出残余直发循环**）后 host 推实况（`count` / `items` / `merged`）」；:60 列「步边界 pickup · driver 步骤 1 · 装载② 归位 · 会话退出残余 · **窗内消费**同式」，且同句写「**装载① 载体迁移**（`panel-turn-stages.mjs:206`）不携 `merged` ⇒ 带面原样、零出块」。⑦ 自定义「携带 `merged` ⇔ 消费发生 ⇔ 出块」⇒ 装载① 是否出块两说相反（出块 ⇒ 违 F-W22 ②「恰一枚」；不出块 ⇒ 该点永不出块）。`窗内消费` 全档无定义（仅 :49 ∕ :61 以「装载① 窗内」近义出现），而 F-W22 边界句为「不改…五个消费点」 | ⑦ 内落一张消费点表：逐点列「载体 / 是否携 `merged` / 是否出块 / 是否重绘带面」，装载① 显式标「零出块」；在一处定义「窗内消费」或删去该词 |
| 2 | Document ownership ∕ 一致性 | 🔴 | 忙态本地气泡两处相反：WEBVIEW-PROTOCOL.md:107（§3.2 行 16 发射点栏）「（出口分流——本地气泡先行）」对比 :166「核件 `hooks.onUserEcho` 忙态返回 `null`（零本地气泡）」与 :489「**webview 流内零气泡**」；同格坐标亦漂（:107 记 `panel-messages.mjs:207` ∕ `panel.mjs:321`，:489 记 `:229` ∕ `:352`） | 本批同步收正行 16：删「本地气泡先行」或改注「忙态零本地气泡 ∕ idle 支先行」，并把发射 ∕ 消费坐标对齐 §13:489 |
| 3 | 结构机检（受影响面） | 🟡 | 无受影响文件表：INPUT:42-44 ∕ :55 的落点列 10 余个待改产物（`panel.mjs` · `panel-messages.mjs` · `panel-turn-stages.mjs` · `chat-panel.mjs` · `state.js` · `chat.js` · `chat-messages.js` · `image-handler.mjs` · `webview/pending-band.js` …）零现行数、零 `≤±N`、零拆分计划 | 补受影响文件表：现行数 + 预期增量（结构不变者注明），>500 行给主动拆分面、>800 行必拆 |
| 4 | 最近先例 | 🟡 | 先例行不全：INPUT:50 只给设计面坐标（`docs/desktop/design/COMPOSER.md:15` / `:26` / `:34` · KD-31 ∥ KD-40）+ 对齐句；桌面**实现坐标**仅 i18n 一处（PROTOCOL:326 `thincoder-desktop/renderer/i18n-views.mjs:65-67` 逐字同桌面），带面 DOM ∕ 超限量面实现坐标缺；先例批号缺 | 补桌面带面实现坐标（DOM 装配 + 超限量面 + 截断判据）与先例批号，或明写「带面实现坐标未勘得」 |
| 5 | 勘源证据 | 🟡 | 无勘源证据行：全档未见「查了哪些公开源档 ∥ 是否有相关」的记录（实际用到的桌面 COMPOSER KD-31/KD-40、CLI `TUI-INPUT-BOX.md` §4.1 ∥ `TUI.md` §7.5 均散见行内） | 加一行勘源证据：所查源档（桌面 ∥ CLI ∥ 外部参考仓）+「有 ∕ 无相关」结论 |
| 6 | Clarity ∕ 协议形态 | 🟡 | `items` 可选性两说：PROTOCOL:68「`{ pending, count, items?, merged? }`」vs :108「`{ pending:boolean, count:number, items:string[], merged?:string }`」与 INPUT:56 必携；且未定义 `items` 缺席时带面行为（带面 = `items` 纯函数重绘） | 统一为必携（或给缺席语义：保留 ∥ 清空），并写明缺 `items` 快照的带面处置 |
| 7 | 验收载体 | 🟡 | F-W22 无既有用例（新需求），设计只给机检谓词（如 `band.nextElementSibling === 输入行`），未点名新测试档 ∕ `test/files.mjs` 登记位；N-W5 要求「每条功能需求有既有用例」或登记例外（消解路径 + 到期条件） | 点名新测试档（用例表留测试层——承 D2），写明 `files.mjs` 登记；若留缺口按 N-W5 登记消解路径 + 到期条件 |
| 8 | 数字漂移 | 🔵 | §6.3 标题「28 键」（PROTOCOL:272）与表实 30 行不符；另 `sub.awaitingApproval`（:332「已实装」）表内无行 | 标题改 30 键（或按表实重算），`sub.awaitingApproval` 入表或注明不入表理由 |
| 9 | 文档卫生 | 🔵 | §3.2 行 17 行尾多出 4 个空单元（PROTOCOL:108-109），表为 5 列 | 收掉多余空单元 |
| 10 | Clarity | 🔵 | 带面超限量面措辞未定义：INPUT:55「平 node ∕ 零版式 ⇒ 早返零写」；多条 `i. ` 编号的载体元素未指名 | 落 `scrollHeight` ∕ `lineHeight` 取值对象与「零版式」判据；指名编号载体（机检选择器可写） |

**计数**：🔴 2 · 🟡 5 · 🔵 3（合计 10）

**VERDICT: changes-required**（🔴 #1、#2 未解）

**范围与佐证限制**：无项目标准档、无文档地图（Document ownership 判据降格——按 Project Guide + 本评判据判）；两份设计档内引用的实现行号与桌面 `COMPOSER.md` 坐标均为 `unverified`（本评只读三档，未读实现面 ∕ 桌面档）。

### 轮次 2（评审子代理）

**评审对象**：`WEBVIEW-INPUT.md` §1 C-B2-6 ⑦ + `WEBVIEW-PROTOCOL.md` 行 16 ∥ 行 17 ∥ §6.3（第 2 轮：复核十条修正）

| # | Orig# | File | Severity | Status | Notes |
|---|-------|------|----------|--------|-------|
| 1 | 1 | WEBVIEW-INPUT.md | 🔴 | Fixed | ⑦ 落表 `:69-75`（五行：① 步边界 pickup ∕ ② driver 步骤 1 ∕ ③ 装载① 载体迁移 ∕ ④ 装载② 归位 ∕ ⑤ 残余直发），列「携 `merged` ∕ 流内出块 ∕ 带面」；③ 明标「**否**」「**零出块**」。`:77` 术语对齐行定义「窗内消费」= 表 ②（需求档「回合尾」= ③ + ④、「卸载直发」= ⑤）；`:78` 明写装载① 不属消费送达、出块恒由实际取批点发生且每批恰一枚。`:31` 已改为「五个消费点（成员 / 携 `merged` / 出块 / 带面逐点 = 细则⑦ 消费点表——**成员单源在该表**）」，两处成员冲突消除；F-W22 边界「五个消费点」成员未变（窗内消费 = ②，非第六点） |
| 2 | 2 | WEBVIEW-PROTOCOL.md | 🔴 | Fixed | 行 16 已收正：`:107` = `thincoder-render-core/composer/panel.mjs:352`（出口分流——**忙态零本地气泡**：`hooks.onUserEcho` 返回 `null`；回显只走真回合）∥ `panel-messages.mjs:229` `case` → `routeUserTurn` 入槽——「本地气泡先行」已删，坐标与 `:490`（`:352` ∕ `:229`）及 `:166`「零本地气泡」三面一致 |
| 3 | 3 | WEBVIEW-INPUT.md | 🟡 | Fixed | §9.1 受影响文件表 `:193-212`（18 行：现行行数 + 预计增量 + 改动），`:190` 行数口径注（实测 ∕ 实施后回填），`:214` 拆分面句与合计（19 文件 = 源码 15 · 测试 2 · 文档 2，算术核过）。数值面残留两条见 New-1 ∕ New-2 |
| 4 | 4 | WEBVIEW-INPUT.md | 🟡 | Fixed | 先例行 `:53-55` 补桌面**实现坐标**：`thincoder-desktop/renderer/views/chat-pending.mjs` `pendingGroupNode`（`:27` 入口 ∕ `:47` 容器 ∕ `:40-45` 逐条节点）· 超限量面 `paintPendingOverflow`（`:52-65`）· `ITEM_MAX_LINES`（`:16` = 3）；标签键坐标 `i18n-views.mjs:65-67` ∕ `:256-258`；先例批 = 桌面「对齐第二批」（`docs/desktop/design/PROJECT.md` §2 KD-31 ∥ KD-40），批档号「**未勘得——明写，不臆造**」 |
| 5 | 5 | WEBVIEW-INPUT.md | 🟡 | Fixed | 勘源证据行 `:51-52`：桌面 `COMPOSER.md` KD-31∥KD-40 · 桌面 `chat-pending.mjs` · CLI `TUI-INPUT-BOX.md` §4.1 · `TUI.md` §7.5 · 核 `queued-mark.mjs`（均「有相关」）；**仓外参考仓 = 无相关**（带面形态源全在仓内两侧） |
| 6 | 6 | WEBVIEW-PROTOCOL.md | 🟡 | Fixed | `items` 必携三处统一：`:68`「`items` **必携**（可空数组）」+ 缺 `items` 旧载荷语义（带面保留原态、零重绘，`count` 照常更新）；`:108` = `items:string[]`；`WEBVIEW-INPUT.md:63` 同形。缺席分支不再无定义 |
| 7 | 7 | WEBVIEW-INPUT.md | 🟡 | Fixed | 用例载体 `:187`：`thincoder-vscode/test/2026-10-20-vsc-queue-band.test.mjs` + `test/files.mjs` 清单追加 + 缺口登记（八用例 / 消解路径 = 本批单元档自证 / 到期条件 = 首个业务场景档并入两条业务断言）；与 §9.1 测试两行（`+180` ∕ `+1`）一致 |
| 8 | 8 | WEBVIEW-PROTOCOL.md | 🔵 | Fixed | §6.3 标题改「**31 键**」（`:272`）；表实 31 行（`:279-309`），`sub.awaitingApproval` 已入表（`:287`），`:333` 审批态键句与表行互指 |
| 9 | 9 | WEBVIEW-PROTOCOL.md | 🔵 | Fixed | 行 17 行尾空单元已收：`:108` 尾仅留一个空「接收点」单元，`:109` 续行填 `webview/chat-messages.js` `case "busyQueued"` → `pending-band.js` `applyBusyQueued`——与行 15 ∕ 16 的续行形态同构（5 列齐） |
| 10 | 10 | WEBVIEW-INPUT.md | 🔵 | Fixed | 量面取值对象与判据落文 `:61-62`：`body` = 该条 `.chat-pending-body`；`body.scrollHeight` ∕ `Number.parseFloat(getComputedStyle(body).lineHeight)` ∕ `Math.max(1, Math.round(...))`；「零版式」判据 = 非 number ∨ 非有限正数 ⇒ 早返零写；编号载体指名 `:59`（`.chat-pending-body` 文本前缀 `${index + 1}. ` + 机检选择器） |
| 11 | (new) | WEBVIEW-INPUT.md | 🟡 | New | ⑤ 落点与新 §9.1 受影响面不符两处：`:42`「`webview/state.js`（`_busyQueuedPending` 镜像字段）· `webview/chat.js`（`case "busyQueued"`）」vs `:200`「`thincoder-vscode/webview/chat-messages.js` … `case "busyQueued"` 改指 `pending-band.js`」与 `:204`「`_busyQueuedItems` 镜像字段」；§12:397 亦记消费位 = `chat-messages.js:106`。建议 ⑤ 按 §9.1 ∕ §12（声明的「唯一读值」）收齐文件与字段名 |
| 12 | (new) | WEBVIEW-INPUT.md | 🔵 | New | 拆分面判据用**改动前行数**：`:214`「现行最大档 = `chat.css` 499 行（< 500）⇒ 本设计**零拆分面**」，而 `:205` 本批给 `chat.css` `+30` ⇒ 实施后 ≈529 行 > 500 建议线。建议写明既有档不受「新增档 ≤500」门，或把该档过 500 登记为建议面 |

**计数**：🔴 0 · 🟡 1（新）· 🔵 1（新）——前轮 10 条全数收口（Fixed 10）。

**VERDICT: pass**（无未解 🔴；🟡 1 + 🔵 1 为可选面，不阻塞）

## §4 用户批准（主 agent）

## 用户批准

**批准依据（批级放行，覆盖批准门）**：用户 2026-10-20 12:03 逐字「**对呀，这是缺陷，要对齐桌面端**」（开批 + 定方向）+ 12:05 逐字「**自动跑完**」（批级放行 = 批内全链自动跑完，评审照走）。按用户 2026-10-19 23:29 裁定（整批令覆盖批准门），本批不再单停批准门。

- 评审链完整：设计 #31 → 评审 #32（changes-required · 🔴2/🟡5/🔵3）→ 修正 #33（十条全 Fixed）→ 评审 #34（pass · 🔴0/🟡1/🔵1）→ 实施 #35 → 内部审计 + 代码评审（2 🔴 自修；1 项上抛 → **父裁 A**）→ 修正 #36（RENDER-CORE.md 漂移收正）。
- 无跳步；无 🔴 遗留。

## §5 实施记录（eng-coder）

**状态行**：实施完成（2026-10-20 · 审计 ∥ 评审 clean · 裁定 A 已落）

## 交付摘要

VSC 忙态排队面已从「流内气泡 + `pending` 标记」改为「输入区上沿待发送带」：忙态提交零流内块（宿主回显门 ∥ webview `onUserEcho` 同判据），消费时刻带项退场 + 流内恰一枚（`merged` 派生，宿主零第二推送点），`busyQueued.text` 退役，共用件 `flow/queued-mark.mjs` 收窄（退役 `planBusyQueued` + `lastIndexOfRaw`，保留 `QUEUED_MAX_ITEMS` ∥ `paintLabel` ∥ `markPending` ∥ `clearPending`）。

## 逐档实测（行数 = 落盘实读）

| # | 档案 | 预计 | 实测（行数 / 增量） | 落点读数 |
|---|---|---|---|---|
| 1 | `src/extension/chat-panel.mjs` | +3/−2 | 459 行 · +6/−3 | `sendMessage` 回显门 = `if (!this.turnBusy())`（`:305-307`） |
| 2 | `src/extension/panel-messages.mjs` | +7/−5 | 399 行 · +21/−14 | 载荷收正（`:113-122`——`text` 零发）；`routeUserTurn` 末补推（`:216`）；`webviewReady` 推点移位（`:360-363`） |
| 3 | `src/extension/panel-turn-stages.mjs` | ±0 | 247 行 · **+1/−1**（设计表口径收正——父裁 A） | 迁移推送先于 `splice`（`:206`） |
| 4 | `webview/chat-messages.js` | +1/−1 | 298 行 · +5/−4 | `case "busyQueued"` 改指 `pending-band.js`（`:114`）+ 清屏复位（`:133`） |
| 5 | `webview/queued-mark.js` | −41 | **删档** · −40 | 零残留（全树零 import） |
| 6 | `webview/pending-band.js` | +110 | **新档 120 行** | `ensureBand`（`:25` ∥ 装配期建 `:39`）+ `renderBand` + `paintPendingOverflow`（`:77`）+ `applyBusyQueued`（`:102`）+ `clearPendingBand`（`:115`） |
| 7 | `webview/input.js` | +2/−1 | 130 行 · +3/−1 | `onUserEcho` 仅 idle 出泡（`:106`） |
| 8 | `webview/state.js` | +1 | 161 行 · +6/−4 | `_busyQueuedItems` 新增（`:159`）；两既有字段零改 |
| 9 | `webview/chat.css` | +30 | 530 行 · +32/−0 | `#pending-band` ∥ `.chat-pending-*`（`:500-530`；clamp 3 在 `:526`）——**越 500 建议线**（< 800 硬限） |
| 10 | `locales/zh.json` | +3/−1 | 353 行 · +3/−1 | 三新键 `:19-21`；`queued.pending` 已删 |
| 11 | `locales/en.json` | +3/−1 | 353 行 · +3/−1 | 同形 |
| 12 | `thincoder-render-core/flow/queued-mark.mjs` | −30 | 38 行 · +7/−74 | 四导出保留（`:15` ∥ `:18` ∥ `:26` ∥ `:34`）；两退役符号零残留 |
| 13 | `test/2026-10-20-vsc-queue-band.test.mjs` | +180 | **新档 247 行** | 八用例（① `:106` ∥ ② `:140` ∥ ③ `:161` ∥ ④ `:176` ∥ ⑤ `:187` ∥ ⑥ `:206` ∥ ⑦ `:220` ∥ ⑧ `:235`）+ 夹具 |
| 14 | `test/files.mjs` | +1 | 8 行 · +1/−1 | 新档登记（`:8`） |

## 决策披露（清单外 / 增量偏差）

| # | 项 | 性质 | 理由 |
|---|---|---|---|
| 1 | `webview/ui.js:113` 注释一行 | 清单外改动（+1/−1，零行为） | 删档 `queued-mark.js` 后该注释成死指针；指向改为「核 composer `markPending` 原语 + VSC 带面在 `pending-band.js`」 |
| 2 | `webview/chat-messages.js` 增 `clearPendingBand()`（+1 行） | 超出预计增量 | 设计 ⑦「刷新」句：`clearMessages` ⇒ 带面复位（空带，随下一次快照重建） |
| 3 | `chat.css` 530 行 | 读数超设计预计 | 既有档不受「新增档 ≤ 500」门（评审轮 2 第 12 条可选面）；记 §5 供收口登记 |
| 4 | `pending-band.js` 120 行 | 超出预计 +110 | 含量面 ∥ 复位两导出与注释 |

## 设计内冲突处置（父裁 A · 2026-10-20）

- **冲突**：设计 ⑦ 消费点表行 ③ 要求装载① 载体迁移时带面「原样（`items` 实况——项仍在队）」，而同表要求 `panel-turn-stages.mjs` ±0；实件 `:205-206` 先 `splice(0)` 再推，且此刻 `panel._susp` 未建 ⇒ 快照恒空 ⇒ 带面被清空。两侧不可同真。
- **裁定**：父侧选 A——授权一行重排。落地 = `if (busyQueued.length > 0) pushBusyQueued(panel)` 移到 `const seeded = …splice(0)…` **之前**（`:206-207`）：快照读迁移前队列（`_busyQueued` 实况），带面零变化；随后照旧 `suspensionSession({ … pendingInput: seeded })`。
- **口径收正**：`panel-turn-stages.mjs` ±0 → **+1/−1**（设计表随父侧改）。

## 修复轮（审计 + 代码评审 · 终止态 clean）

| 轮 | 面 | 发现 | 处置 |
|---|---|---|---|
| 1 | 自查（对照设计） | `webviewReady` 握手重推先于 `openSessionContent`，后者内 `loadSession` 发 `clearMessages`（`panel-session.mjs:147`）⇒ webview 带面被抹掉 | 推点移到 `await openSessionContent(panel)` **之后**（`panel-messages.mjs:360-363`）——Reload 冷启按 `items` 重建带面（设计 ⑦ 推送点语义） |
| 2 | 内部 explore 审计（对设计逐条） | 🔵 带面懒建 vs 「装配期创建」；🔵 `ui.js` 注释越清单 | 带面改模块装配期创建（`pending-band.js:39`）；注释笔据实披露（决策披露 #1） |
| 3 | 内部 advisor 代码评审（`type=code`） | 🔴 #1 冷启重推被 `clearMessages` 抹掉；🔴 #2 装载① 推空快照 ≠ 行 ③「带面原样」；🟡 用例 ④∕⑥ 手工快照绕过真推点；🟡 `chat.css` 越 500 建议线；🔵 五项（`_busyQueuedItems` 只写 ∥ `clearPendingBand` 不复位镜像 ∥ 模块顶层可抛 ∥ `chat.css` 注释措辞 ∥ PROTOCOL 行号漂移） | 🔴 #1 同轮修（见上）；🔴 #2 上抛父裁 → 裁定 A → 同轮落（见上）；🔵 注释已收（`chat.css:501`）；其余处置见下方「遗留与登记」 |
| 4 | 复跑 | `npm test` ∥ `npm run lint` | 全绿（见机检读数） |

**终止态：clean**（两项 🔴 均已落地；🟡/🔵 或登记、或属设计档 owner 的余项）。

## 机检读数（2026-10-20 实施轮）

- `cd thincoder-vscode && npm test`（`node test/run.mjs`）：**11 tests / 11 pass / 0 fail**（本批 8 + 既有 3；duration ≈ 3.7 s）。
- `npm run lint`（`node scripts/check-syntax.mjs`）：`check-syntax: 141 JS files OK`。
- DOM 读数（happy-dom 驱真 webview 模块）：`band.parentElement === #toolbar` · `band.nextElementSibling === ctx.inputEl.parentElement` · `#messages.contains(band) === false` · 消费后 `[data-pending-item] = 0` 且 `.message.user` 恰 +1（`data-raw` = `merged`）· 满队第 9 条：零上行 / 文本保留 / toast 在场 / 带仍 8。
- 回显门读数：`chat-panel.mjs:305` `if (!this.turnBusy())` 才 post `userMessage`；`input.js:106` 仅 `_turnState === "idle"` 返回气泡、否则 `null`。
- 载荷退役：`panel-messages.mjs:113-122` 只发 `{ pending, count, items, merged? }`；webview 全树 `busyQueued.text` 零读。
- 共用件收窄：消费面解析仍成立（桌面 `chat-text.mjs:23` · `queue.mjs:15`；服务端两档 `:16` ∥ `:28`；核 `composer/panel.mjs:46`）。

## 遗留与登记（非本批改动面）

- 用例 ④∕⑥ 按设计用例表的「快照形输入」构造，宿主推送点顺序由本轮两项修复保证但无宿主级自动化（VSC 测试清单 = webview 单元档；宿主无测试台）——登记为验证边界。
- `S._busyQueuedItems` 为设计指定的镜像字段（宿主快照如实写，端侧当前无第二读者）；`clearPendingBand` 不复位镜像（宿主权威，下一次快照重建；复位计数会误清满队守卫）——均按设计保持。
- 释放窗口（`_turnState === "susp"` ∧ 无会话）拒收径 = 既有 `showWarningMessage` + 文本已清，批次 §2 边界已登记「不在本批」。

## 设计档漂移（本 diff 触及，非本 pen——请 owner 处置）

1. `docs/vsc/design/WEBVIEW-PROTOCOL.md:397` 消费位 `webview/chat-messages.js:106` 实为 `:114`（案行本批未移动）；`:490` `src/extension/panel-messages.mjs:229` 实为 `:232`（本批 +3 行所致）。
2. `docs/render-core/design/RENDER-CORE.md`（`:108` ∥ `:156` ∥ `:265` ∥ `:373` ∥ `:402` ∥ `:475` ∥ `:490` ∥ `:501`）仍描述 `planBusyQueued` 与已删 `webview/queued-mark.js`——核板随动欠账。
3. `docs/core/design/API-CONTRACT.md:2830` 生成区仍列 `planBusyQueued`（`:2826-2829` 行号亦漂）——需重跑生成器。
4. 代码注释遗留（禁改面，未触碰）：`thincoder-render-core/flow/block.mjs:91` 仍指 `queued-mark.js`；`thincoder-render-core/composer/panel.mjs:326` 忙分支注释「本地气泡先行」对 VSC 已不成立。

## 上抛项

无未决项（裁定 A 已落）。

**随动读数（交付前复读，修正上表一处）**：`test/2026-10-20-vsc-queue-band.test.mjs` = **245 行**（上表 247 = 删尾注前的读数；语义零变——八用例不变）；`panel-messages.mjs` = 399 行 · `chat.css` = 530 行（不变）。交付前最后一次 `npm test` = **11 tests / 11 pass / 0 fail**；`npm run lint` = `check-syntax: 141 JS files OK`。

## §6 验证与收口（父代理）

## 验证与收口

**交付核验（父侧复跑 · 2026-10-20 12:40）**

- `cd thincoder-vscode && node test/run.mjs`：**11 tests / 11 pass / 0 fail**（本批 8 例 / 50 断言 + 既有 3 例，≈3.7 s）——父侧重跑，与 #35 读数一致。
- `node scripts/check-syntax.mjs`：`check-syntax: 141 JS files OK`——父重跑。
- `doc_check(mode:"gate", docs=[两份 VSC 设计档 + 需求档 + API-CONTRACT])`：**PASS**（4 档 · 0 命中）；`RENDER-CORE.md` 单档 gate 亦 **PASS**（#37 读数）。
- 代码面父侧实读：`chat-panel.mjs:305` 回显门 `if (!this.turnBusy())` · `input.js:106` 仅 idle 出泡 · `panel-turn-stages.mjs:206` 推送先于 `splice` · `pending-band.js:102-115`（`applyBusyQueued` + `merged`⇒`addUser` + 复位）· `panel-messages.mjs:113` 载荷 · `flow/queued-mark.mjs` 38 行四导出 · `webview/queued-mark.js` 已删（GONE）。

**验收勾销（F-W22 ①–⑤）**

| # | 判据（需求档） | 读数 | 判定 |
|---|---|---|---|
| ① | 忙态提交后流内 user 气泡数不变、带条数 = 队列条数 | 用例 ①：`#messages` 子节点数零变；`[data-pending-item]` = 队列条数 | ✅ |
| ② | 消费后带项归零 + 流内恰新增一枚（合并批 = 合并文本） | 用例 ②③：`items` 重绘 + `addUser(merged)` 恰一枚；无 `merged` ⇒ 零块 | ✅ |
| ③ | 带面贴输入上沿、非流内、短会话不浮起 | `band.parentElement === #toolbar` · `nextElementSibling === 输入行` · `#messages.contains(band) === false`；判据空 `hidden` | ✅ |
| ④ | 满队（第 9 条）行为零变 | 用例 ⑤：零上行 / 文本保留 / toast / 带仍 8 | ✅ |
| ⑤ | 两形 + 逐条 ≤3 行 + 尾标记与桌面同形 | 用例 ①：`1. a` ∥ `2. b`；量面 5 行 ⇒ 摘 `hidden` + 行数词；CSS clamp 3 | ✅ |

**漂移处置（六条 · 全落）**：① `WEBVIEW-PROTOCOL.md:397/:490` 坐标收正（父侧小改：`:114` / `:232`）② `API-CONTRACT.md` 生成区重跑（`--write` → 4434 条；`--check` 零漂移）③ 零改面两注释收正（`flow/block.mjs:91` · `composer/panel.mjs:326`，父侧小改）④ `RENDER-CORE.md` 八处（#36）⑤ 同档两处（#37：`queued.pending` 归属改判 · 「待发送气泡」登记删）⑥ 父侧两处设计表小改（⑦ 行 ③ 实现条件 · §9.1 ±0→+1/−1）。

**父侧小改披露（可回退 · 无新语义）**：`WEBVIEW-INPUT.md` 两格（行 ③ 带面格、§9.1 `panel-turn-stages.mjs` 行）· `WEBVIEW-PROTOCOL.md` 两坐标 · `flow/block.mjs:91` 一行注释 · `composer/panel.mjs:326` 一行注释 · `API-CONTRACT.md` 生成区重跑（机械）。

**收口清单**

- doc_check 交付门（close 触发）：PASS（close 回执确认）。
- 暂缓批复核：无。
- 前批遗留横核：无（本批独立）。
- 用户文档面同步：无用户文档面变更。
- 台账：`#1718` 在途 → 待核销 → **已核销**。
- 设计令牌：链终消费（designId `04454814…`）。
- 新债：无（漂移六条全落；#35 §5「遗留与登记」三项均属验证边界 / 设计指定行为，不构成债务）。

**验证边界（登记）**：用例 ④∕⑥ 用设计用例表的快照形输入构造；宿主推送点顺序由 #35 两项修复保证，但 VSC 无宿主级测试台——此边界随 §5 登记在册，不另挂债。
