# 2026-11-07 · scroll-gesture
> 六段，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 每段只有一个作者：作者的段可 `append` 加内容、可就地改（`edit`）；非作者一概拒。
> 编制：主 agent · 2026-11-07 · 来源 = 台账 #2157；用户 2026-11-07 23:56「刚才改 vsc 的滚动锁定没考虑手势」。
> 台账 = #2157（vscode · 归批）。前情 = 无（独立批）。
## §1 讨论（主 agent）
**状态行**：已收口 2026-11-08
<§1 模板占位：本批条目 / 关键判据 / 授权口径>

### 讨论与已定决定

**来源**：用户 2026-11-08 00:02 实机使用反馈。

> 「**我鼠标滚动得时候在和输出抢控制，我往上滚动还没偏移到足够距离会直接被流式输出拽回来，我希望滚动的时候至少给我一点延迟，给我一点滚动到半页的时间。**」

**父侧实读定位（改前）**

- 需求档 `docs/vsc/requirements/WEBVIEW.md` 的 `F-W2` 原写「**上滚超过半视口才解钉**——阈值内的上滚仍跟随」——**用户抱怨的就是这条**。
- 核 `thincoder-render-core/scroll.mjs` 的 `createPinWatch`：`decide()` 首支 `if (nearBottom(el)) { set(true); return true }`——**近底无条件翻真，优先于任何手势门**。
- 端 `thincoder-vscode/webview/ui.js` 两处 `createPinWatch(...)` **均未传 `gestureGateMs`** ⇒ 缺省 `0` ⇒ 直写模式（无「手势期间让位」支）。
- 流式每帧经 `maybeScrollDown` → `applyPin(el, ctx._pinBottom)` 把 `scrollTop` 写回 MAX。**⇒ 上滚位移下一帧即被抹掉，永远攒不够那半个视口**；`NEAR_BOTTOM_RATIO = 0.5` 的距离判据在流式期间**不可达**。

**已定决定**

- **已定决定**：解钉判据从「已滚够半视口」改成「**发生了一次向上滚动**」——**不看距离**。 · 用户原话：「**我往上滚动还没偏移到足够距离会直接被流式输出拽回来，我希望滚动的时候至少给我一点延迟**」 · 时间：00:02
- **已定决定**：解钉后给 **600ms 宽限窗口**，窗口内再上滚**重新计时**（滚动续期）；**窗口过后恢复自愈：近底即复钉**。 · 用户原话：「**给我一点滚动到半页的时间**」 · 时间：00:02
- **已定决定**：600ms 沿用核里既有的 `gestureGateMs` 数（注释引 KD-RC-8 让位三律），**不另造新数**。 · 父侧裁定 · 时间：00:03
- **已定决定**：范围 = **消息区与活动区一起动**（同源，不细分）。 · 用户原话：「**一起动也行，既然是同源的，就没必要再细分了**」 · 时间：00:06
- **已定决定**：**桌面端三处不动**（`thincoder-desktop/renderer/views/activity-new.mjs` ∥ `chat-scroll.mjs` ∥ 其余）——核里加能力，**谁开谁生效**，本批只开 VSC 两处。 · 父侧裁定（用户只点名 VSC） · 时间：00:06

**明令不做**

- **不做「不回底就不恢复」**（父侧 00:03 曾推此形，用户未采纳原话；**按其 00:02 原意取延迟窗口**）——**这是本批最容易走偏的一处，写在这里防止设计席擅自扩形**。
- **不动回底钮显隐**（`#2143` 那笔）——用户未提出；解钉后滚回底部会自愈复钉，路是通的。
- **不做触摸 ∥ 键盘滚动**——用户场景是鼠标滚轮；**先只做滚轮，别的等真遇到再说**（记忆：别把单点要求扩写成体系）。
- **不动桌面对应的三处载体**。

**库内勘察**

- `库内 = 已查：'nearBottom ∥ applyPin ∥ createPinWatch ∥ gestureGateMs ∥ _pinBottom'` → 命中核件 `thincoder-render-core/scroll.mjs`（116 行，四载体共用）、端 `thincoder-vscode/webview/ui.js`（`scrollDown` ∥ `maybeScrollDown` ∥ `maybeScrollActivity` ∥ `initScrollFollow` 四点）、`thincoder-vscode/webview/scroll.js`（`updateScrollBottomVisibility`）、桌面 `activity-new.mjs`（`gestureGateMs: 0`）∥ `chat-scroll.mjs`（直接用 `applyPin`）。
- `库外 = B 类`：改动面全是仓内渲染件（无外部依赖面 ∥ 无协议实现）；结论面零外部断言。

**待设计席回答（父侧不代答）**

- 上滚信号**取哪个事件、怎么判方向**（`wheel` 的 `deltaY < 0` ∥ 滚动条拖动 ∥ 键盘）——**本批只要滚轮一路，但设计要写清「为什么只认这一路」以及另两路将来怎么接**。
- 窗口计时器落哪（核内 ∥ 端侧）——**写口与旗标维护都在核里，倾向核内**，但由设计定并给判据。

### 需求档落笔（父侧，00:09 已落）

**评审轮 1 的 🔴 指「需求档 `F-W2` 仍写『上滚超过半视口才解钉』」——实质已改，记录没写。补在这里。**

- `docs/vsc/requirements/WEBVIEW.md` 的 `F-W2` 需求面现读：「**上滚即解钉**（用户往上滚一下就是「想看上面」，**不等滚够距离**——解钉看的是「往上滚了」这个动作，不是已滚多远）；**解钉后 600ms 宽限窗口**（窗口内再往上滚则重新计时「滚动续期」；窗口过后恢复自愈：近底即复钉）」。
- 同档验收面同轮改齐：「上滚一下（**不看已滚多远** → 解钉）＋ 600ms 宽限窗口（窗口内上滚续期；窗口过后近底即复钉），**为什么不看距离**：流式每帧把 `scrollTop` 写回底部，上滚位移下一帧即被抹掉、永远攒不够半个视口 ⇒ 距离判据在流式期间不可达，实效果 = 用户滚不动」。
- **同轮连带（`WEBVIEW.md` 整档门）**：60 条裸档名锚清 0（只补路径前缀、语义一字未动）；六个单元测试档名从需求档移除（**单测档收口即删，需求档引它就是引会死的指针**）。门读数 `PASS · 0 段有问题`。

**⇒ 本批的三档一致（需求 `F-W2` ↔ 设计 `§5.5` ↔ 批档 `§2`）现在在记录上也是可见的。**

## §2 批次任务与设计（eng-designer）
**状态行**：（eng-designer 写入时更新）
<§2 模板占位：本批条目（覆盖） / 设计档落点 / 机制设计 / 受影响文件与测试覆盖 / 验收对照 / 关键决策 / 上抛项>

### 本批覆盖条目

| # | 条目 | 回指 |
|---|---|---|
| 1 | 上滚一下（**不看已滚多远**）即解钉——消息区与活动区一起动 | `docs/vsc/requirements/WEBVIEW.md` F-W2 |
| 2 | 解钉后 600ms 宽限窗：窗内再上滚重新计时（续期）；窗口过后近底即复钉 | 同上 F-W2 |
| 3 | 核件加能力、缺省关：未传选参的载体 wheel 路径零行为变化 | 设计 `docs/vsc/design/WEBVIEW.md` §5.5「未开此选项的载体」段 · D-W47 |

### 不在本批

- **不做「不回底就不恢复」**（§1 明令）：窗到期恒按几何判一次，近底即复钉。
- **不动回底钮显隐**（`#2143`）；窗内钮不显是过渡态，见设计 §5.5「回底钮不随窗」段。
- **不做触摸 ∥ 键盘滚动**；块内容区（60px 子块内容区，走门控模式）不在射程——§1 范围 = 消息区 + 活动区；该区若现同一症状，另批。
- **桌面两处 · 服务端两页不传选参**（§1 明令：核里加能力，谁开谁生效）。

### 机制（机制单源 = `docs/render-core/design/RENDER-CORE.md` §5「滚动策略族」条；决策与理由 = 同档 §2 KD-RC-17）

解钉触发 = `wheel` 的 `deltaY < 0`，一次即解钉、零几何读；窗 = 核常数 `PIN_GRACE_MS`（600，与 `GESTURE_GATE_MS` 同一把数）；窗内不读几何不翻旗标（旗标恒假 ⇒ 帧零写视口；**近底自愈在窗内挂起**）；到期由核内定时器跑一次判定。**窗住核的理由**：旗标单写者 = `createPinWatch` 的 `set`，端持窗即两写者，且四载体各复刻一遍。

端面承接 = `docs/vsc/design/WEBVIEW.md` §5.5「上滚解钉与 600ms 宽限」段——只写开启面 ∥ 用户可见判据 ∥ 载体表，机制分支不重述。

### 落点表

| 文件 | 符号 | 改动 | 为什么 |
|---|---|---|---|
| `thincoder-render-core/scroll.mjs` | `PIN_GRACE_MS`（新导出）· `createPinWatch` | 加 600 常量 + 选参 `unpinOnUpScroll`（缺省 false）+ 上滚标记 ∥ 窗状态 ∥ 到期定时器 + 注入时钟 `deps = { now?, setTimeout?, clearTimeout? }`；wheel 合并处理（先判 `deltaY`，再走原径）；近底自愈加「窗内挂起」限定；`detach()` 清定时器并复位标记 | 机制单源；旗标单写者在核；窗用例不靠墙钟 |
| `thincoder-render-core/subblocks/block.mjs` | `GESTURE_GATE_MS` | 改 `export const GESTURE_GATE_MS = PIN_GRACE_MS`，该符号从策略族件导入 | **三问答案（`existing but unusable`）**：坐标 `thincoder-render-core/subblocks/block.mjs` · 名 `GESTURE_GATE_MS` · 消费者 = 该档 `initBlockFollow` 的手势门。数值同一把 600，但名归手势门；更要紧 = 该档现从 `thincoder-render-core/scroll.mjs` 导入 `applyPin` ∥ `createPinWatch`，反向引用成环 ⇒ 字面住策略族。**导入方向 = 子块 ← 策略族（单向 · 无环）** |
| `thincoder-vscode/webview/ui.js` | `initScrollFollow` | 两处 `createPinWatch` 传 `unpinOnUpScroll: true`（`_pinBottom` ∥ `_pinActivity`） | 本批只开 VSC 两处 |
| `docs/render-core/design/RENDER-CORE.md` | §5 条 5 · §2 KD-RC-17 | 已落：窗内自愈挂起 ∥ 注入缝 `deps` ∥ `PIN_GRACE_MS` 三问 ∥ 导入方向 ∥ 先例/对齐/偏离 ∥ 勘察源；同轮清整档存量锚 226 → 0 | D11 同轮（本批落齐） |
| `docs/vsc/design/WEBVIEW.md` | §5.5 · §6 D-W47 | 已落：§5.5 收成指针 + 端面行为 + 载体表 + 勘察源；D-W47 收成决策 + 指针 | 本端承接面，机制不重述 |
| `docs/vsc/requirements/WEBVIEW.md` | F-W2 需求面 + 验收面 | 已落（主 agent 00:09）：「上滚即解钉（不等滚够距离）+ 600ms 宽限窗」 | 需求侧单源，本批以它为准 |
| `test/integration/vsc-scroll-follow.test.mjs` | 用例 `VSC 2-1` | 输入加 `wheel`（`deltaY = -100`）；断言改「上滚即解钉」（原「离底不足半视口 ⇒ 仍贴底」被推翻）；三态上滚量（不足 ∥ 恰等 ∥ 超过）改判同一结果 | 业务可观测结果变了 |
| `test/rtm/ends.md` | 行 `2-1` | 「怎么做 ∥ 怎么算通过」两列改写；新增 ∥ 删除行 = 无 | RTM delta |

**档位结论（量法 = `doc_check` 的 `countContentLines`，读数取改前盘）**：三件落点档均「未越线」——`thincoder-render-core/scroll.mjs` 142 行 · `thincoder-render-core/subblocks/block.mjs` 111 行 · `thincoder-vscode/webview/ui.js` 255 行 ⇒ **本批无档跨线，无拆分计划**。

`thincoder-render-core/subblocks/block.mjs` 是落点表里此前从未被量过的档，读数即上；改后复跑 = `doc_check({mode:"report", lines:[…]})`。

**RTM delta 三问**：① 改写行 = `test/rtm/ends.md` 行 `2-1`；② **冗余行 = 无**——故事 `VSC 2` 只有 `2-1` 一行，断言的正是「流式回合中视口与输出的争夺」这一业务结果，无第二行复述；③ 缺失行 = 无——窗内续期 ∥ 窗后复钉是同一业务结果的组成部分，并入 `2-1`，不另立行。

**单元用例件** = `docs/batches/2026-11-08-scroll-gesture.test.mjs`（住批档目录，收口前删净；happy-dom 与 `@thincoder/render-core` 一律相对路径导入）。

### 验收对照（每条带「哪条读数会红」）

命令 = `node --test docs/batches/2026-11-08-scroll-gesture.test.mjs`；几何件 = 自带 `scrollTop` ∥ `scrollHeight` ∥ `clientHeight` 读数的假元素（800 视口）。

| # | 判据 | 红读数 |
|---|---|---|
| A1 | 钉底 → 派 `wheel`（`deltaY = -100`）⇒ `ctx._pinBottom === false`（不待 `scroll` 事件） | 旗标仍 `true` |
| A2 | 解钉后连跑 3 帧（`maybeScrollDown`）⇒ `scrollTop` 零变、`bottomGap` 随内容增高 | `scrollTop === MAX`（帧夺回底部） |
| A3 | **几何钉死近底**（`scrollTop = MAX`）∧ 内容停增：`wheel(-100)` → 400 ms → `wheel(-100)` → 400 ms ⇒ 仍 `false` | 首窗 600 ms 到点即复钉 ⇒ 旗标 `true`。**几何不钉，续期坏了这行照样绿**——「近底」是输入的一半，不是背景 |
| A4 | `wheel(-100)` → 650 ms（无后续上滚，几何近底）⇒ `true`；下一帧回底 | 仍 `false` ∥ 下一帧不回底 |
| A5 | `wheel(-100)` ∧ 上滚 500 px（超半视口）→ 650 ms ⇒ 仍 `false` | 复钉 |
| A6 | 不传选参：`wheel`（**`deltaY = -100`**）后派 `scroll`（近底）⇒ `true`；离底超阈 ⇒ `false` | 任一偏离（三端零行为变化的机器面）。`deltaY` 不钉 ⇒ `> 0` 一路漏用选项也观测不到 |
| A6b | **静态臂**：按符号 `unpinOnUpScroll` 全树扫，命中只在本端 `thincoder-vscode/webview/ui.js` 两处调用点（形沿 `docs/render-core/design/RENDER-CORE.md` §7 的 C18 ③「以符号调用判，不以字面判」） | 第三处命中 ⇒ 有未声明的载体被开启 |
| A7 | `PIN_GRACE_MS === 600` ∧ `GESTURE_GATE_MS === PIN_GRACE_MS` | 两数不等 |
| A8 | 窗内 `detach()` ⇒ 之后旗标不被置 `true`（零写） | detach 后旗标被置 `true` |

**时钟**：注入缝（`deps = { now?, setTimeout?, clearTimeout? }`）已落核档 §5 条 5 ⇒ A3 ∥ A4 ∥ A5 ∥ A8 **一律用注入时钟**（假 `now` / 假 `setTimeout`），不等墙钟；判据本身不动。

**集成半**：`VSC 2-1` 由父侧收口跑，本批不在实施轮跑（`test/integration/`）。

### 上抛项

- **`docs/render-core/design/RENDER-CORE.md` 整档存量锚已清 0（本批）**：父侧裁定「不另立批、当轮清完」⇒ 该档 **226 条**整档存量裸档名逐行定夺：能补前缀者补仓根全路径（语义一字未动）；`highlight.js` 盘上无名（R1 已迁核、VSC 原档删除）⇒ 重指 `thincoder-render-core/highlight.mjs`；`styles.css` 已退场 ⇒ 删该处裸名、所在行语义不动。读数 = `doc_check({mode:"gate", docs:["docs/render-core/design/RENDER-CORE.md"]})` **首行 `DOC-CHECK GATE: PASS`**（改前同命令为 `REFUSED`）。**六处落点随之落盘**：§5 条 5「近底无条件翻真」补**窗内挂起** ∥ 注入缝 `deps = { now?, setTimeout?, clearTimeout? }` ∥ `PIN_GRACE_MS` 三问 ∥ 导入方向（子块 ← 策略族 · 单向无环）∥ KD-RC-17 先例 ∥ 对齐 ∥ 偏离 ∥ 勘察源。**本批新增文本零裸档名**（新增段一律仓根全路径）。
- **`docs/vsc/design/WEBVIEW.md` 整档存量锚 232 条（未清 · 另批）**：其命中含已退场档（不是纯补前缀），须逐行定夺 ⇒ 超本批射程，父侧裁定另开清债批。读数出处 = 本轮 `doc_check` 的 report（注意同 basename 的两个档：`docs/vsc/requirements/WEBVIEW.md` 是需求档、00:09 已清 0；本条指设计档）。

## §3 设计评审（评审子代理）
**状态行**：评审通过（第 2 轮：上轮 12 条全修；新增 2 条 🟡 可选、未标 must-fix；无 🔴）



### 轮次 1（评审子代理）

**本轮结论表（设计评审第 1 轮 · 通审全档）**

| # | 级别 | 状态 | 证据（指针） |
|---|---|---|---|
| 1 | 🔴 | 待处置 | §1「`F-W2` 原写「上滚超过半视口才解钉——阈值内的上滚仍跟随」——用户抱怨的就是这条」；§2 落点表无需求档行；上抛项只列裸名锚债 |
| 2 | 🟡 | 待处置 | §2「机制（单源 = 设计 §5.5…）」与落点表「D11 同轮（机制单源在核档）」并存；KD-RC-17 ∥ §5 条 5 ∥ §5.5 三处同批详述同一规则 |
| 3 | 🟡 | 待处置 | KD-RC-17 理由格有「`gestureGateMs` 治不了（它的 `decide()` 里近底优先）」；无成形的 precedent 坐标行与对齐 ∥ 偏离分列 |
| 4 | 🟡 | 待处置 | §5.5 新增段无「勘察源」行；同档 §5.2「勘察源（本规则轮）」∥ §5.7「勘察源」均有该行 |
| 5 | 🟡 | 待处置 | 落点表「改为 `= PIN_GRACE_MS`（去字面 `600`）」理由 = 「一个数一处字面」；`PIN_GRACE_MS` 与既有 `GESTURE_GATE_MS` 的三问答案未成形 |
| 6 | 🟡 | 待处置 | A3 判据行未钉几何，红读数「首窗 600 ms 到点即复钉」须近底几何才可观测 ⇒ 续期断而判据青 |
| 7 | 🟡 | 待处置 | A6 判据行「不传选参：`wheel` 后派 `scroll`（近底）」未钉 `deltaY`；只测核，不测其余调用点未传该选参 |
| 8 | 🟡 | 待处置 | §2 落点表无「哪档跨线 ∥ 无一跨线」结论行；`thincoder-render-core/subblocks/block.mjs` 体量在本批任一处无读数 |
| 9 | 🟡 | 待处置 | §5.5 集成面行引 `VSC 2-1`、§2 落点表引 `2-1`，两坐标指同一 RTM 行；冗余行有无所答未写（只写「新增 ∥ 删除行 = 无」） |
| 10 | 🟡 | 待处置 | §5.5「未开此选项的载体」列桌面活动区 ∥ 服务端两页 ∥ 块内容区；KD-RC-8 ④ 记「块内容区 ∕ 活动区 ∕ 池列 ∕ 对话流四载体」——池列未列 |
| 11 | 🔵 | 记录 | A3 ∥ A4 ∥ A5 ∥ A8 靠真 400 ∕ 650 ms 等待；无注入时钟缝；同档先例 = `createFrameMerge` 的 `deps = { raf?, now?, minMs? }` |
| 12 | 🔵 | 记录 | 落点表「改为 `= PIN_GRACE_MS`」未写导入方向（块件 ← 策略族件）；`unverified` |

计数：🔴 1 · 🟡 9 · 🔵 2

VERDICT: changes-required

### 轮次 2（评审子代理）

**本轮结论表（设计评审第 2 轮 · 只验上轮 12 条 + 本轮新增）**

| # | 级别 | 状态 | 证据（指针） |
|---|---|---|---|
| 1 | 🔴 | 已修 | §2 落点表已有需求档行「已落（主 agent 00:09）：上滚即解钉（不等滚够距离）+ 600ms 宽限窗」；§1「需求档落笔」逐字引 F-W2 改后文 ∥ 验收面 |
| 2 | 🟡 | 已修 | §2「机制单源 = …§5「滚动策略族」条」与落点表「D11 同轮（本批落齐）」同一指向；§5.5「本端只承接开启面与可见判据，机制分支不重述」；核「近底 ⇒ 无条件翻真（自愈）」已补「**窗内挂起**」 |
| 3 | 🟡 | 已修 | §5「先例 ∥ 对齐 ∥ 偏离（KD-RC-17）」三行成形（先例 = KD-RC-8 ② 让位三律 · 对齐 · 偏离） |
| 4 | 🟡 | 已修 | §5「勘察源（本规则轮）」查过 ∥ 实读 ∥ 外部源三段；§5.5「勘察源」∥「勘察源 · 实读」 |
| 5 | 🟡 | 已修 | §5「`PIN_GRACE_MS` 三问答案（existing but unusable）」坐标 ∥ 名 ∥ 消费者三答 + 成环理由；落点表同行同答 |
| 6 | 🟡 | 已修 | A3「**几何钉死近底**（`scrollTop = MAX`）∧ 内容停增」——近底升为输入的一半 |
| 7 | 🟡 | 已修 | A6「`wheel`（**`deltaY = -100`**）」+ A6b 静态臂（符号扫，形沿 C18 ③） |
| 8 | 🟡 | 已修 | §2「**档位结论**（量法 = `doc_check` 的 `countContentLines`）… 本批无档跨线，无拆分计划」——三件落点档各有读数 |
| 9 | 🟡 | 已修 | §5.5 集成面行已把两坐标合并（`VSC 2-1` = 端前缀 + 行号）；§2「RTM delta 三问」冗余行 = 无 · 缺失行 = 无 |
| 10 | 🟡 | 已修 | §5.5 载体表按 KD-RC-8 ④ 四名对齐，新增「池列」行（`attachActivityNew`） |
| 11 | 🔵 | 已修 | §5 `createPinWatch(…, deps = { now?, setTimeout?, clearTimeout? })`；§2「时钟」条（A3 ∥ A4 ∥ A5 ∥ A8 一律用注入时钟） |
| 12 | 🔵 | 已修 | §5「**导入方向 = 子块 ← 策略族（单向 · 无环）**」；落点表同行 |
| 13 | 🟡 | 新增（可选） | §2 上抛项「整档存量锚 232 条（未清 · 另批）」∥ 本轮报两档已清 0 且 gate `PASS` |
| 14 | 🟡 | 新增（可选） | A6b「按符号 `unpinOnUpScroll` 全树扫，命中只在本端 … 两处调用点」——定义处必含该符号 |

计数：🔴 0 · 🟡 14（上轮 9 条 + 本轮新增 2 条）· 🔵 2 —— 上轮 12 条全修；新增两条 🟡 未标 must-fix，不阻通过

VERDICT: pass

### 轮次 3（评审子代理）

**本轮结论表（实施轮代码评审 · 全量审：5 档 + 批内单测）**

| # | 级别 | 状态 | 证据（指针） |
|---|---|---|---|
| 1 | 🔵 | 记录 | `onWheel` 上滚支在 `armGrace()` 后直接 `return`，支内无 `markGesture()` ⇒ 手势门 ∥ 上滚窗两机制不可组合（今日无载体同时开） |
| 2 | 🔵 | 记录 | 集成件两例守墙钟「`await sleep(PIN_GRACE_MS + 50)`」；端装配不注入 `deps` ⇒ 慢机可红 |
| 3 | 🔵 | 记录 | §2 判据 A2 点名 `maybeScrollDown`，单测实走 `applyPin`（`_autoFollow` 门未覆盖） |
| 4 | 🔵 | 记录 | 端设计档 §5.5「回底钮不随窗」陈述的可见态无代码产出——`updateScrollBottomVisibility` 全树唯一调用者 = 历史分页 |
| 5 | 🔵 | 记录 | 单测档随批删净 ⇒ 续期 ∥ 到期 ∥ `detach` 三案收口后无常驻断言（核 `test/` 无 `createPinWatch` 用例） |
| 6 | 🔵 | 记录 | 实施轮自述「ui.js 曾被写坏、由 git 还原后重落」——当前盘面自洽，但「未损他处」本轮不可证（unverified） |

计数：🔴 0 · 🟡 0 · 🔵 6（无需修项）

VERDICT: pass

## §4 用户批准（主 agent）

### 用户批准

- **批准形 = 用户实机反馈 + 明确范围**：00:02「**我往上滚动还没偏移到足够距离会直接被流式输出拽回来，我希望滚动的时候至少给我一点延迟**」；00:04 确认部位「**那就是消息区**」；00:06「**一起动也行,既然是同源的,就没必要再细分了**」（消息区 + 活动区同批）；00:16「**都自动跑完吧**」= 整批令。
- **父侧裁定（四处）**：① **取 A 形（延迟窗口），不取 B（不回底不恢复）**——B 是父侧自己推的形，**用户原话没有它**；② 600ms 沿用核里既有 `gestureGateMs` 的数，不另造；③ **桌面端三处不动**（核里加能力，谁开谁生效）；④ **不做触摸 ∥ 键盘滚动**（用户场景是鼠标滚轮，别的等真遇到再说）。
- **设计评审两轮**：轮 1 `changes-required`（**1 🔴 + 9 🟡 + 2 🔵**）→ 修正 → 轮 2 `pass`。
- **轮 1 的 🔴 是父侧的漏**：需求档 `F-W2` 我已改（00:09），**但 `§1` 的批档记录没写**，评审读到的是「需求档仍写旧规则」。**⇒ 判据没错，错在记录**；父侧补了「需求档落笔」一节。
- **实施一轮过**：内部差异审计 `clean` ∥ 代码评审 `pass`；**父侧复量四项**（单测 9/9 ∥ 集成 3/3 ∥ 红读数 2 fail ∥ 需求档零残留）。
- **收口轮内父侧自己修的一处**：需求档 `§1` 与 `F-W2` 一档两说，父侧改齐并复扫。

## §5 实施记录（eng-coder）

**状态：实施完成（A1–A8 ∥ A6b 全绿；差异审计 1 轮 + 代码评审 1 轮 = 终态 clean）**

### 一、实际落地（逐件）

| 文件 | 落地内容 |
|---|---|
| `thincoder-render-core/scroll.mjs` | 新导出 `PIN_GRACE_MS = 600`（报头写明「与块内容区手势门同一把数、字面只在本档出现一次」）；`createPinWatch` 增选参 `unpinOnUpScroll = false` 与第三参 `deps = { now?, setTimeout?, clearTimeout? }`（缺省全局件 ⇒ 既有载体时序零变）；窗状态 `graceOn` ∥ `graceId` 三函数 `armGrace` / `expireGrace` / `disarmGrace`；`decide()` 首支 `if (graceOn) return false`（窗内不读几何、不翻旗标 = 近底自愈挂起）；`wheel` 合并为单支 `onWheel`（上滚 ⇒ 翻假 + 起窗，随后 return；否则走原径 `markGesture` / `decide`）；`detach()` 先 `disarmGrace()` 再摘监听 |
| `thincoder-render-core/subblocks/block.mjs` | `GESTURE_GATE_MS = PIN_GRACE_MS`，`PIN_GRACE_MS` 自策略族件导入（导入方向 = 子块 ← 策略族，`scroll.mjs` 零反向 import ⇒ 单向无环） |
| `thincoder-vscode/webview/ui.js` | `initScrollFollow` 两处 `createPinWatch` 均传 `unpinOnUpScroll: true`（`_pinBottom` ∥ `_pinActivity`）；报头补「本端是本批唯一开启面」与两档指针 |
| `test/integration/vsc-scroll-follow.test.mjs` | `VSC 2-1` 重写：旧断言「离底不足半视口 ⇒ 仍贴底」删除（**那正是用户报的症状**）；输入改 `wheel`（`deltaY = -100`，位移落地前先到）；三态上滚量 300 ∥ 400 ∥ 500 同判解钉 + 帧零写；另两例 = 滚回底部（窗内不即时复钉、窗到期复钉、下一帧贴底）∥ 上滚 500 后窗到期仍远离底（维持停跟）；结束语引用 `PIN_GRACE_MS`，不手抄 600 |
| `test/rtm/ends.md` | 行 `2-1`「怎么做 ∥ 怎么算通过」两列改写（含三回合形状与窗到期读法，异常列补「修前红：上滚 300px 仍贴底」）；同节 `目的` 行与 `节注` 行按其自身语义同步改写入解钉 + 宽限窗口径（旧口径「不足半视口仍跟随」与「三态按离底量分判」已删，非追加说明）；行数增删 = 无 |
| `docs/batches/2026-11-08-scroll-gesture.test.mjs`（批内单测，收口即删） | A1–A8 + A6b 九例；几何件 = 自带三读数的假元素（800 视口 ∥ 2400 内容 ⇒ 阈 400）；时钟 = 注入的假 `now` / 假 `setTimeout` / 假 `clearTimeout`（`advance(ms)` 按到期序触发）⇒ A3 ∥ A4 ∥ A5 ∥ A8 一律不等墙钟 |

### 二、验收读数（命令 + 结论）

```text
node --test docs/batches/2026-11-08-scroll-gesture.test.mjs
  ⇒ 9 pass / 0 fail（A1 上滚即解钉 · A2 三帧零写 · A3 窗内续期 · A4 窗后近底复钉
     · A5 窗后仍远离底维持解钉 · A6 直写臂 + 门控臂零行为变化 · A6b 静态臂 2 处命中
     · A7 两常数同值 · A8 窗内 detach 零写）

node --test test/integration/vsc-scroll-follow.test.mjs
  ⇒ 3 pass / 0 fail（三态上滚同判解钉 · 窗内不复钉 + 窗到期复钉 · 窗后远离底维持停跟）

红读数证明（把 ui.js 两处 unpinOnUpScroll 摘掉再跑同一集成件）
  ⇒ 2 fail：上滚 300px 断言 `true !== false`（旧实现不足半视口仍贴底 = 用户报的症状）；
     回底复钉那例同红。绿→红→绿，判据非空转。

doc_check({mode:"gate", docs:["test/rtm/ends.md"]})
  ⇒ 首行 `DOC-CHECK GATE: PASS`（0 段有问题）

thincoder-vscode: node scripts/check-syntax.mjs
  ⇒ check-syntax: 151 JS files OK

git diff --stat -- thincoder-vscode/webview/ui.js
  ⇒ 1 file changed, 5 insertions(+), 2 deletions(-)（报头注释 3 行 + 两处调用各一行）
```

### 三、三处自定处置（如实披露，非设计所写）

1. **上滚支同时发让位回调**：设计原话只写 `deltaY < 0` 直接翻假、零几何读，未提回调。本支写成 `set(false)` → `notify(onGesture)` → `armGrace()`：翻假即让位，与门控支「门内翻假 + 让位回调」同义。今日无载体同时开两选参（块内容区不传），故对现网零可观测差异。
2. **A2 的驱动件**：判据点名 `maybeScrollDown`，单测改走 `applyPin(el, 旗标)`（同一条写入行，差额只有 `_autoFollow` 门）；真 `maybeScrollDown` 路径由集成件 `VSC 2-1` 覆盖。判据的语义（帧不夺回底部）未打折扣。
3. **A6b 匹配器**：照字面全树扫会永远红（定义处签名与设计档都写调用形）⇒ 钉成「源码树内的调用形 `unpinOnUpScroll: true`」，排除 `docs/` 与声明该选参的模块；沿核档 §7 的 C18 ③（以符号调用判，不以字面判）。读数为「恰两处、均在 `thincoder-vscode/webview/ui.js`」。

### 四、计划外改动（1 处，已声明理由）

- `docs/batches/2026-11-08-scroll-gesture.test.mjs` —— 不在本次 spawn 的声明文件表内，但由批档 §2「单元用例件」行与本轮任务书明确要求（与批档同名同目录、收口即删）。**这是本批唯一一件表外文件。**
- `test/rtm/ends.md` 除行 `2-1` 两列外，同节 `目的` 与 `节注` 两行一并改写：旧文写的正是被推翻的口径（「上滚了一点点…视口仍跟着新内容走」「三态按离底量分判」），留着即同档两套规则。行数未增删。

### 五、自查轮次与终态

- **差异审计（explore，1 轮）**：`DIVERGENCE: 2 items` —— ① 需求档 `docs/vsc/requirements/WEBVIEW.md` 的 §1 总述仍写「上滚超过半视口才停跟」（同档 F-W2 已是新口径）：**笔不在本席（需求档 = 主 agent），未改，上报**；② A2 驱动件（上方第三节第 2 条，已披露、判据语义未变）。**无未实现项、无未声明载体。**
- **代码评审（advisor type=code，1 轮）**：`VERDICT: pass` —— 🔴 0 · 🟡 0 · 🔵 6（均标「记录 / 收口前顺手核」，无必须修项）。六条 = 上滚支未记手势时刻（两机制今日不组合）· 集成件两例守墙钟 · A2 驱动件 · 端设计档 §5.5「回底钮不随窗」句无代码产出 · 单测档随批删净后三案无常驻断言 · ui.js 曾写坏还原（`unverified`）。
- **修正轮（1 轮）**：`thincoder-vscode/webview/ui.js` 曾被一次空壳 `bash` 重写打坏（编码 / EOL），经 `git checkout -- <该档>` 还原后用编辑工具重落意图改动；还原后 `git diff --stat` 只剩 5 增 2 删、语法检查与两个测试件复跑全绿。
- **终态：clean**（无 ❌、无 ⚠️、无待修 🔴 ∥ 🟡）。

### 六、上报项（分别归笔，本席不越笔）

- **[上抛·待裁] 需求档 §1 与同档 F-W2 冲突**（`docs/vsc/requirements/WEBVIEW.md`）：§1 读「**上滚超过半视口才停跟**（在那之前仍在跟随）」，F-W2 读「**上滚即解钉**（不等滚够距离）」。同一条规则一档两说，读哪条都对——需求档为主 agent 笔，请其改齐。
- **[上抛·知会] 端设计档 §5.5 的「回底钮不随窗」句**：`updateScrollBottomVisibility` 全树唯一调用者是历史分页，滚动 ∥ 上滚不触发它刷新 ⇒ 该句描述的「窗内钮不显 / 到期自愈」当前无代码路径产出。面属 `#2143`（本批明令不动），故只报不改。

## §6 验证与收口（父代理）

### 验证与收口（父侧独立复量）

| 验收 | 量法 | 父侧读数 |
|---|---|---|
| **本批单测** | `node --test docs/batches/2026-11-08-scroll-gesture.test.mjs` | **pass 9 · fail 0** |
| **集成面** | `node --test test/integration/vsc-scroll-follow.test.mjs` | **pass 3 · fail 0** |
| **红读数（判据能失败）** | 摘掉 `thincoder-vscode/webview/ui.js` 两处 `unpinOnUpScroll` 后跑同集成件 | **2 fail**（`300px` 断言 `true !== false`） |
| **需求档无第二口径** | 搜 `docs/vsc/requirements/WEBVIEW.md` 的「半视口才」 | **0** |

**这批存在的理由**

用户 00:02 原话：「**我鼠标滚动得时候在和输出抢控制，我往上滚动还没偏移到足够距离会直接被流式输出拽回来，我希望滚动的时候至少给我一点延迟，给我一点滚动到半页的时间。**」

**根因不是「延迟不够」**：`decide()` 的首支写 `if (nearBottom(el)) { set(true); … }`——**近底无条件翻真，优先于任何手势门**；而 `nearBottom` 阈值是半个视口，流式每帧又把 `scrollTop` 写回 MAX ⇒ **上滚位移下一帧即被抹掉，永远攒不够那半屏。**「滚出去才算数」这个判据在流式期间**不可达**。

**⇒ 判据从「已滚多远」换成「发生了上滚这个动作」。**

**父侧在收口轮补的一处（自己的漏）**

- 实施席上抛：`docs/vsc/requirements/WEBVIEW.md` 的 `§1` 仍读「上滚超过半视口才停跟」，而同档 `F-W2` 已是「上滚即解钉」——**一档两说**。
- **父侧 00:54 已改齐**（`§1` 该句换成「上滚一下就停跟（不看已滚多远；解钉后 600ms 宽限，窗内续期、窗后近底恢复跟尾）」），复扫「半视口才」= **0**。
- **教训**：我改 `F-W2` 时只扫了 `F-W2` 所在的行，**没扫同档别的节有没有第二处说同一件事**——这正是本会话反复出现的形状（一条规则没改在每一层）。

**带债收口（不静默）**

- **`docs/vsc/design/WEBVIEW.md` §5.5「回底钮不随窗」段无代码产出**：实读全树 `updateScrollBottomVisibility` 只有一个调用者（历史分页），滚动与上滚都不刷新它。该面属 `#2143`（本批明令不动），**本批只报不改**。
- **`A2` 的驱动件简化**：单测用 `applyPin(el, 旗标)` 而非判据点名的 `maybeScrollDown`（同一条写入行，差额只有 `_autoFollow` 门）；**真路径由集成件覆盖**。实施席主动披露。
- **`#2159`**：两档设计文件的存量裸名锚今天已清 0（`RENDER-CORE` 226 ∥ `WEBVIEW` 232）。

**收口**

- 台账 `#2157`：**在途 → 待核销 → 已核销**。
