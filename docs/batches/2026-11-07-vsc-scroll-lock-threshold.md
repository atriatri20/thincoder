# 2026-11-07 · vsc-scroll-lock-threshold
> 六段，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 每段只有一个作者：作者的段可 `append` 加内容、可就地改（`edit`）；非作者一概拒。
> 编制：主 agent · 2026-11-07 · 来源 = 台账 #2141；用户 2026-11-07 15:58 报告。
> 台账 = #2141（vscode · 归批）。前情 = 无（独立批）。
## §1 讨论（主 agent）
**状态行**：🔄 进行中（…）
<§1 模板占位：本批条目 / 关键判据 / 授权口径>

### 需求：滚动锁定阈值按视口高度，不按固定像素

**用户原话（逐字）**：「vsc端有个小问题，**滚动锁定开启过早**，稍微偏离一点底部就激活锁定了，导致有时候正常输出会导致一点偏移，于是滚动就停止了，**我希望放大一点，至少偏离底部到视口高度的一半再锁定**。」

**症状链**：输出时轻微偏移（渲染高度变化 ∥ 增量插入）⇒ 判定「用户离开了底部」⇒ **自动跟随解 pin** ⇒ 后续输出不再跟随。**用户读到的现象 = 滚动停了。**

**勘察记录（主 agent 本轮实读，给设计席起手）**

| 件 | 位置 | 现状 |
|---|---|---|
| **pin 判据（本批要改的那一个）** | `thincoder-render-core/scroll.mjs` 的 `NEAR_BOTTOM_PX` = **24**，`nearBottom(el)` 用 `scrollHeight - scrollTop - clientHeight < NEAR_BOTTOM_PX` | **固定 24 像素**——任何 24px 以上的偏移即解 pin |
| pin 消费者 | `thincoder-vscode/webview/ui.js` 的 `initScrollFollow` → `createPinWatch(..., { flagKey: "_pinBottom" })` | 直写模式（`gestureGateMs = 0`），事件 `wheel` ∥ `touchmove` ∥ `scroll` |
| 另一处阈值（**不是本批对象**） | `thincoder-vscode/webview/scroll.js` 的 `updateScrollBottomVisibility` | 硬编码 `120`，只决定「回底钮」显不显 |
| 跨端消费 | `thincoder-desktop/renderer/views/chat-scroll.mjs` 再出口 `NEAR_BOTTOM_PX as FOLLOW_PX`；`thincoder-render-core/subblocks/block.mjs` 再出口 | **同一数值源被桌面端消费**——改它即两端同变 |

### 已定决定

**阈值按视口高度算，不按固定像素**：偏离底部**不到视口高度的一半**不锁。· 用户原话：「**至少偏离底部到视口高度的一半再锁定**」· 时间：2026-11-07 15:58

### 边界（这一批不做什么）

- **不动「回底钮」那处 120**——它判的是「按钮显不显示」，与本批的「跟随解不解 pin」是两件事；**一并改会把两件事混成一个数**。
- **不改判据的形**（`nearBottom` 仍是一条比较），只改阈值怎么算。
- **跨端必须同变**：`NEAR_BOTTOM_PX` 是两端共用的唯一数值源；**只改一端就是用户可见的跨端差异**（默认应消除，例外须给 host-capability 证据）。

### 库外 = B 类

改动面 = `thincoder-render-core/**` 与 `thincoder-vscode/webview/**`（纯本地渲染逻辑）；**外部断言 = 零**（不断言任何第三方行为），故不联网查证。

## §2 批次任务与设计（eng-designer）
**状态行**：设计完成（三档已落盘（RENDER-CORE：KD-RC-16 ∥ §5 条 5 ∥ §7 C18 · RENDERER：§3 ∥ §4 · WEBVIEW：§1.2 ∥ §5.5 ∥ §11）；回底钮与 pin 同源 = (a) 已定）
<§2 模板占位：本批条目（覆盖） / 设计档落点 / 机制设计 / 受影响文件与测试覆盖 / 验收对照 / 关键决策 / 上抛项>

### 一、本批覆盖条目（覆盖 ∕ 不覆盖）

| # | 条目 | 覆盖 |
|---|---|---|
| 1 | 跟随解 pin 的近底阈值按视口高度算（偏离底部不到视口高一半不解 pin） | ✅ 本批 |
| 2 | 算式保留下限 24px；视口未挂载 ∕ 隐藏时仍给有限正数 | ✅ 本批 |
| 3 | 阈值常量退役与导出面换名（连带两处再出口） | ✅ 本批 |
| 4 | 三个消费端同变，无跨端差异 | ✅ 本批 |
| 5 | 「回底钮」显隐判据与 pin 同源（`thincoder-vscode/webview/scroll.js` 的 `updateScrollBottomVisibility` 直取核 `nearBottom`，自持的 120 退场） | ✅ 本批（(a) 已定——理由见第二 ⑦） |
| 6 | 判据的形状（仍是一条严格小于比较） | ❌ 不改（§1 边界） |

### 二、设计决策（六问逐条）

**① 算式 = `max(24, clientHeight × 0.5)`**

- 导出三件：`NEAR_BOTTOM_RATIO = 0.5` ∥ `NEAR_BOTTOM_MIN_PX = 24` ∥ 纯函数 `nearBottomThreshold(clientHeight)`。
- 留 24px 下限理由一：用户原话是「**至少**偏离底部到视口高度的一半再锁定」——一半是下限，而一个下限自己不能再被视口压小。
- 理由二：`nearBottom` 现有语义含「缺件 ∥ 未挂载 ⇒ 零读数 ⇒ 判近底」（`metricsOf` 把非数归一为 0）；这种输入下算式必须仍给出有限正数，`max` 正好给了它。
- 实测值：视口 400px ⇒ 阈 200px；视口 1200px ⇒ 阈 600px；视口 40px ⇒ 阈 24px。

**② 谁算 = 核内算**

- 由 `nearBottom(el)` 内部算，调用方不传阈值。
- 理由：本仓有四个消费载体（见第三节）。任一处改成「调用方传阈值」都会让四处各算一套；算在核内则一次改动、四端同变，消费面一行不改。

**③ 名字：`NEAR_BOTTOM_PX` 退役，不做「改名保有」**

- 它现在是两个常量加一个函数；名字里的 PX 与「常量」都不再成立，留着就是一句谎。
- 连带面已实测（全树 `.mjs` 检索，无第三方 importer）：`thincoder-render-core/subblocks/block.mjs` 再出口、`thincoder-desktop/renderer/views/chat-scroll.mjs` 再出口（`FOLLOW_PX` 别名）随本批一并退出。
- `nearBottomThreshold` 同时充当单测的算术入口。

**④ 跨端 = 同变，不给 host-capability 例外**

- 阈住在核内，三端共用同一函数 ⇒ 结构上不可能只改一端。
- 同时纠正 §1 勘察表的枚举：消费载体是**四个**，不是两个——`thincoder-vscode/webview/ui.js` ∥ `thincoder-desktop/renderer/views/chat-scroll.mjs` ∥ `thincoder-render-core/subblocks/block.mjs` ∥ 服务端 `thincoder-server/public/views-chat.mjs` 与 `thincoder-server/public/views-me-chat.mjs`。
- 服务端两个文件只用 `nearBottom`（不用常量），故它们本来就随本批变——这一条要写明，否则会有人以为服务端需另改。

**⑤ 回归推演（改阈会推进哪几条既有律）**

- **律①「近底无条件翻真」被显著推宽**：阈从 24px 变成半视口（800px 视口 ⇒ 400px）。带内的滚动事件一律翻真，下一帧 `applyPin` 把视口拉回底部。
- 由此的**用户可见后果**：上滚不足半视口、流式仍在出字 ⇒ 视口被拉回底部。「上滚即停跟」在带内不再成立。
- 这不是实现缺陷，是用户逐字要求的直接后果，故写进边界，不打补丁。
- **律②（块内容区 · 手势门 600ms）门槛同步变宽**：让位需离开半视口。与律①同源同式，随族同收。
- **严格小于保留**：恰等于阈不判近底——旧语义逐字不变（边界用例 = 第四节 A5）。
- **「回底钮」判据随之同源**：钮那处不再自持 120，非近底判据直取核 `nearBottom`（见 ⑦）——800px 视口下 120–400px 那个「钮已显示、视图仍在跟」的区间不会出现。

**⑥ 边界输入**

- `clientHeight` 为 0 ∥ 负数 ∥ `NaN` ∥ 缺 ∥ `Infinity` ⇒ `metricsOf` 归一为 0 ⇒ 阈 = `max(24, 0)` = 24，判据不变。
- 算式无除法 ⇒ 除零不可达；归一后无负数 ∥ `NaN` 返回 ⇒ 无 NaN 传播。

**⑦ 回底钮与 pin 同源，不留第二把尺**

- `thincoder-vscode/webview/scroll.js` 的 `updateScrollBottomVisibility` 改为直取核 `nearBottom` 判非近底，自持的 120 退场。
- 理由：pin 阈抬到半视口后，自持 120 会造出「钮已显示、视图仍在跟」的区间（800px 视口下 120–400px）——**这个不一致是本批改阈造出来的，不是旧账**；留着就是把本批引入的判据漂移记到下一批账上。判据漂移在本仓已有罚则（KD-RC-8 ④ 之三：判据漂移 = 缺陷）。
- 范围只到判据：钮的**刷新时机**（仍只在历史页应用后重算）不动——那是「什么时候算」，与「用哪把尺算」是两件事。

### 三、受影响文件清单

| 文件 | 改动 | 层级结论 |
|---|---|---|
| `thincoder-render-core/scroll.mjs` | 常量退役 + 三新导出 + `nearBottom` 内算阈 | 不跨层 |
| `thincoder-render-core/subblocks/block.mjs` | 删再出口一行 | 不跨层 |
| `thincoder-desktop/renderer/views/chat-scroll.mjs` | 删再出口一行（`FOLLOW_PX`） | 不跨层 |
| `thincoder-vscode/webview/scroll.js` | `updateScrollBottomVisibility` 非近底判据改取核 `nearBottom`，自持 120 退场 | 不跨层 |
| `thincoder-vscode/webview/ui.js` | 零改（经链接读到核改动） | 不跨层 |
| `thincoder-server/public/views-chat.mjs` ∥ `thincoder-server/public/views-me-chat.mjs` | 零改（只用 `nearBottom`） | 不跨层 |

- **层级结论：无文件跨层。**
- `thincoder-vscode/node_modules/@thincoder/render-core/scroll.mjs` 实测为指向 `thincoder-render-core/scroll.mjs` 的链接（不是副本）⇒ VSC webview 直接看到核改动，无需同步动作。
- **设计档落点 = 已落盘**：单源 = `docs/render-core/design/RENDER-CORE.md`（§2 KD-RC-16 判据行 · §5 条 5 导出面 · §7 条 C18 机检行）；消费面 = `docs/desktop/design/RENDERER.md`（§3 跟滚判据 ∥ 让位三律 ∥ 工厂化 · §4 借用清单第 1 ∥ 第 6 行）与 `docs/vsc/design/WEBVIEW.md`（§1.2 档表 `scroll.js` 行 · §5.5 出生可见性 · §11 U-W2）。
- `docs/desktop/design/ACTIVITY.md` §1 另有两处阈值表述仍写 24px，本批未改（不在本轮改判面内——第七节第 1 条）。

### 四、验收判据（可跑形）

- 判定文件 = 本批单元测试档 `docs/batches/2026-11-07-vsc-scroll-lock-threshold.test.mjs`（用毕即删）。
- 命令 = `node --test docs/batches/2026-11-07-vsc-scroll-lock-threshold.test.mjs`。

| # | 输入（`scrollHeight` ∕ `scrollTop`，视口） | 期望 | 旧实现 |
|---|---|---|---|
| A1 | 2400 ∕ 2000，视口 400（gap 0） | true | true（不变） |
| A2 | 2400 ∕ 900，视口 1200（gap 300） | **true**（阈 600） | **false —— 旧实现下必红** |
| A3 | 2400 ∕ 599，视口 1200（gap 601） | false | false（不变） |
| A4 | 1000 ∕ 400，视口 400（gap 400） | **false**（阈 200）；同 gap 换视口 1200 ⇒ **true** | false ∥ false —— 旧实现答不上 |
| A5 | 2400 ∕ 1600，视口 400（gap 恰 200） | **false**（严格小于） | false |
| A6 | `nearBottom(null)` | true（零读数判近底） | true（不变） |
| A7 | 100 ∕ 60，视口 40（gap 40，阈 = `max(24,20)` = 24） | **false** | false（不变） |
| A8 | 100 ∕ 80，视口 40（gap 20） | true（阈 24） | true（不变） |
| A9 | 钮判据同源（结构性读数，不在输入表上）：`thincoder-vscode/webview/scroll.js` 的 `120` 阈值字面零命中 ∧ `updateScrollBottomVisibility` 的非近底判据取核 `nearBottom` | 两半成立 | 旧实现自持 `< 120`——两半皆不成立 |

- A2 ∥ A4 是本批的判别用例。A2 在旧实现下必红（300 ≥ 24）；A4 把「同一个 gap、不同视口给出不同判定」写成断言——恒定 24px 的实现无法同时满足 A4 的两半。
- A7 ∥ A8 判下限：视口压到 40px 时阈仍是 24，不是 20。
- **「红在旧实现」的判法**：把 A2 ∥ A4 的输入喂给 `thincoder-render-core/scroll.mjs` 现行 `nearBottom`，两条都返回 false（旧阈恒为 24）。

### 五、关键决策记录（含被否方案）

- **被否：阈值做成 `createPinWatch` 的 `opts`**——调用方传阈看着灵活，实则四处各算一套，判据立刻分裂（本仓已因判据漂移立过 KD-RC-8 ④ 的罚则）。
- **被否：只改 VSC 端、桌面 ∥ 服务端留 24px**——用户可见的跨端差异，且无 host-capability 证据可依：三端都是浏览器引擎几何，能力相同。
- **被否：给消息区加手势门（`gestureGateMs = 600`）代替改阈**——它挡得住「非手势位移误判」，但在半视口阈下完全无效：`decide()` 先判近底，带内一律翻真，手势门没机会生效；若把阈留在 24px 则违背用户逐字口径。两条路都答不上这一问。
- **被否：`NEAR_BOTTOM_PX` 留着改成函数**——同名不同义（常量变函数）比换名更容易被误用；退役加新名，检索会立刻点出旧引用。

### 六、边界（本批不做）

- 不动回底钮的**刷新时机**（仍只在历史页应用后重算，滚动 ∥ 流式期间不重算）——那是「什么时候算」，与「用哪把尺算」是两件事（尺已同源，第二 ⑦）。
- 不改判据形状，不引入「手势意图」第二通道。
- 不修带内「上滚被拉回底部」——那是用户所要求语义的固有后果；要恢复「上滚即停跟」须另立批（手势通道 ∥ 双阈）并由用户裁定。
- 不动服务端两文件的任何一行。

### 七、设计与实现问题（上抛项）

1. **[上抛·待裁] `docs/desktop/design/ACTIVITY.md` §1 两处阈值表述仍写 24px，不在本轮三档清单内。**
   - 实测：`grep -n "24" docs/desktop/design/ACTIVITY.md` 命中 §1 让位收窄条「近底（< 24px）无条件复跟」∥ §1 边界归属条「滚动策略族契约同源（近底 24px + 旗标门 + 清账三路）」。
   - 两处描述的都是本批改的那条判据 ⇒ 与单源 `docs/render-core/design/RENDER-CORE.md` §2 KD-RC-16 矛盾；改法 = 同式换「近底阈（视口比例，KD-RC-16）」，两笔、零语义增量。
   - 未动：本轮改判面 = 三档（`docs/render-core/design/RENDER-CORE.md` ∥ `docs/desktop/design/RENDERER.md` ∥ `docs/vsc/design/WEBVIEW.md`）；第四档须裁定后并入。
2. **[上抛·知会] 三份设计档的整档文档门仍读 REFUSED——存量裸名锚债归清账批。**
   - 量法 = `doc_check` 整档判（逐档命中数与改动前后对比在本轮报告给出）。
   - 本批三档只动判据表述（旧 24px ∥ 再出口行 ∥ 借用行 ⇒ 视口比例阈），不碰裸名存量。
3. **[上抛·知会] §1 首条边界已被本轮 (a) 裁定推翻。**
   - §1 边界首条写着「不动「回底钮」那处 120——改它会把「按钮显不显」与「跟随解不解」混成一个数」，与本轮 (a)（钮显隐与 pin 同源）相反。
   - §1 不是我的笔 ⇒ 请主 agent 就地改该条，否则 §1 ∥ §2 自相矛盾。
4. **[上抛·知会] RTM 无行可加。**
   - `test/RTM.md` 现有故事里没有一行断言跟滚几何（VSC 端仅「VSC 1 归档块重开」一条）⇒ 本批**不破坏、不冗余**任何 RTM 行。
   - 本批的业务可观测面（流式输出中视口是否仍贴底）需活 webview DOM，不在现有集成层能力内 ⇒ 不新设行，也不把单元用例伪装成集成用例。此为 VSC 端集成层覆盖缺口，如实报告。

## §3 设计评审（评审子代理）
## §4 用户批准（主 agent）
## §5 实施记录（eng-coder）
## §6 验证与收口（父代理）
