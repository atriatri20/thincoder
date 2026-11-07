# 2026-11-07 · vsc-scroll-lock-threshold
> 六段，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 每段只有一个作者：作者的段可 `append` 加内容、可就地改（`edit`）；非作者一概拒。
> 编制：主 agent · 2026-11-07 · 来源 = 台账 #2141；用户 2026-11-07 15:58 报告。
> 台账 = #2141（vscode · 归批）。前情 = 无（独立批）。
## §1 讨论（主 agent）
**状态行**：已收口 2026-11-07
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
| 跨端消费 | `thincoder-desktop/renderer/views/chat-scroll.mjs` 再出口 `NEAR_BOTTOM_PX as FOLLOW_PX`；`thincoder-render-core/subblocks/block.mjs` 再出口；`thincoder-server/public/views-chat.mjs` ∥ `thincoder-server/public/views-me-chat.mjs` 直接用 `nearBottom` | **同一数值源被三端消费、四个载体**（消息区 ∥ 活动区 ∥ 块内容区 ∥ 池列）——**改它即三端同变，不可能只动一端** |

### 已定决定

**阈值按视口高度算，不按固定像素**：偏离底部**不到视口高度的一半**不锁。· 用户原话：「**至少偏离底部到视口高度的一半再锁定**」· 时间：2026-11-07 15:58

### 边界（这一批不做什么）

- **「回底钮」与本批同源收口（原「不动 120」已作废）**——设计席实测：`thincoder-vscode/webview/scroll.js` 的 `updateScrollBottomVisibility` 自持 **120**，而 pin 阈改到半视口后，**800px 视口下 120–400px 区间变成「钮在、但还在跟」**（点它没反应）。**这个区间是本批造出来的，不是旧账** ⇒ 钮显隐改直取 `nearBottom`（核 `nearBottomThreshold`），自持的 120 退场。
- **不改判据的形**（`nearBottom` 仍是一条比较），只改阈值怎么算。
- **跨端必须同变**：核的 `nearBottomThreshold` 是**三端四个消费载体**（消息区 ∥ 活动区 ∥ 块内容区 ∥ 池列）的唯一算式源；**只改一处就是用户可见的跨端差异**（默认应消除，例外须给 host-capability 证据）。原常量 `NEAR_BOTTOM_PX` 本批退役——它不再是像素常量。

### 库外 = B 类

改动面 = `thincoder-render-core/**` 与 `thincoder-vscode/webview/**`（纯本地渲染逻辑）；**外部断言 = 零**（不断言任何第三方行为），故不联网查证。

## §2 批次任务与设计（eng-designer）
**状态行**：设计完成（评审 14 条全处置：验收表重算（A4 拆两半 · A5 ∥ A7 ∥ A8 gap 修正 · 新增 A11）· RTM 定行 VSC 2-1 · 落点坐标改正 · 算式收敛单源 · 补先例 ∥ 勘察 ∥ 三问 · 档层补查法 · 边界输入改述 · A9/A10 补跑法 · 测试载体定普通对象 · 需求侧 F-W2 归父侧 · 整档门 REFUSED 保留）
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

- `metricsOf` 的归一形 = `Number.isFinite(value) ? value : 0`（`thincoder-render-core/scroll.mjs`）⇒ `NaN` ∥ `±Infinity` ∥ 缺键归一为 0；**负数不是非有限数，原样通过**——由 `max` 兜住（`nearBottomThreshold(-100)` = `max(24, -50)` = 24）。
- 故 `nearBottomThreshold` 自己按同一判据归一一遍，返回值恒为有限正数 ≥ 24：`0` ∥ `NaN` ∥ `Infinity` ∥ `-100` 四档皆 24（验收 A11）。
- **归一归属 = 函数自己（两路取一，取此路；评审 16）**：`nearBottomThreshold` 入参自带归一；`nearBottom` 的 `metricsOf` 归一不动（两者对有限数幂等，不互相替代）。**落点已落盘 = `docs/render-core/design/RENDER-CORE.md` §2 KD-RC-16 判据行 ∥ §5 条 5 导出面**——两处均写明 `nearBottomThreshold` 入参自带归一（非有限数归 0、负数交 `max` 兜住），实施以单源档 ∥ 验收 A11 为准。判由：`nearBottomThreshold` 是导出件（算式单源 + 单测算术入口），契约须对自己的入参成立；若只在 `nearBottom` 归一则直接调用 `nearBottomThreshold(NaN)` 得 `NaN`，每个未来消费方都得自兜。另一路（A11 判域收到 `nearBottom` 上）被否——那等于把「导出函数对非法入参无定义」写成规范。
- 算式无除法 ⇒ 除零不可达；归一后无 `NaN` ∥ `Infinity` 返回 ⇒ 无 NaN 传播。

**⑦ 回底钮与 pin 同源，不留第二把尺**

- `thincoder-vscode/webview/scroll.js` 的 `updateScrollBottomVisibility` 改为直取核 `nearBottom` 判非近底，自持的 120 退场。
- 理由：pin 阈抬到半视口后，自持 120 会造出「钮已显示、视图仍在跟」的区间（800px 视口下 120–400px）——**这个不一致是本批改阈造出来的，不是旧账**；留着就是把本批引入的判据漂移记到下一批账上。判据漂移在本仓已有罚则（KD-RC-8 ④ 之三：判据漂移 = 缺陷）。
- 范围只到判据：钮的**刷新时机**（仍只在历史页应用后重算）不动——那是「什么时候算」，与「用哪把尺算」是两件事。

### 二·补：最近先例 ∥ 勘察证据 ∥ 新名三问（评审 5 ∥ 6 ∥ 7）

**最近先例行**

- `existing: docs/render-core/design/RENDER-CORE.md §5「滚动策略族」（`thincoder-render-core/scroll.mjs`，2026-09-29 留端清算收进核）· name: "滚动策略族" · consumers: thincoder-vscode/webview/ui.js ∥ thincoder-desktop/renderer/views/chat-scroll.mjs ∥ thincoder-render-core/subblocks/block.mjs ∥ thincoder-server/public/views-chat.mjs 与 views-me-chat.mjs`
- **对齐** = 同形单源（判据住核、端 = 工厂消费、四个载体同一函数）+ 同归属（本批不搬实现，只在原处换算式）。
- **偏离** = 本批改的是判据的**输入算式**（固定像素 ⇒ 视口比例），不是把新的实现搬进核；故不新增文件名 ∥ 不新增导出档，只在原导出面里换件。

**勘察证据行**

- 查过：`docs/` 下本仓文档权威面（`doc_search` 查「近底阈值 滚动跟随 nearBottom 视口比例」→ 命中 `docs/desktop/design/RENDERER.md` §3 ∥ `docs/vsc/design/WEBVIEW.md` §5.5 ∥ `docs/render-core/design/RENDER-CORE.md` §7 ∥ `docs/cli/design/TUI.md` §6.5 ∥ `docs/server/design/webui/CHAT.md`）+ 仓根 `test/RTM.md` + 核档源码实读。
- 相关者三条：`docs/desktop/design/RENDERER.md` §3（复述了算式字面，本批收敛为指针）· `docs/vsc/design/WEBVIEW.md` §5.5（同）· `docs/server/design/webui/CHAT.md`（把阈写成「近底 24px」——**本批不改，归 `#2142` 清账批**：该档存量裸名锚 72 条，改一笔即被整档门拒、零字节落盘。读数 = `doc_check` 门态量该档，首行 `REFUSED（锚 72 条）`）。
- **工作树内无独立文档仓** ⇒ 公开源档面无外部对象可查，该面无相关项。

**新名三问（评审 7）**

- `NEAR_BOTTOM_RATIO`：`none found: 全树 .mjs 检索「RATIO」在 scroll 面零命中`——比例常量此前不存在（原常量是像素值）。
- `NEAR_BOTTOM_MIN_PX`：`none found: 全树 .mjs 检索「MIN_PX」零命中`——下限常量此前不存在（原 24 无下限语义，它就是唯一阈）。
- `nearBottomThreshold`：`existing but unusable: thincoder-render-core/scroll.mjs · name: "NEAR_BOTTOM_PX" · failed on: 契约面——它是常量（单一像素值），承载不了「按视口现算」的算式与「下限」两条语义；同名改成函数会让检索分辨不出「读到常量」与「调到函数」的旧引用`。
- `nearBottom` ∥ `applyPin` ∥ `createPinWatch` ∥ `createUnreadCounter` 四个既有导出名保持逐字不动——本批不换名。

### 三、受影响文件清单

| 文件 | 改动 | 层级结论 |
|---|---|---|
| `thincoder-render-core/scroll.mjs` | 常量退役 + 三新导出 + `nearBottom` 内算阈 | 不跨层 |
| `thincoder-render-core/subblocks/block.mjs` | 删再出口一行 | 不跨层 |
| `thincoder-desktop/renderer/views/chat-scroll.mjs` | 删再出口一行（`FOLLOW_PX`） | 不跨层 |
| `thincoder-vscode/webview/scroll.js` | `updateScrollBottomVisibility` 非近底判据改取核 `nearBottom`，自持 120 退场 | 不跨层 |
| `thincoder-vscode/webview/ui.js` | 零改（经链接读到核改动） | 不跨层 |
| `thincoder-server/public/views-chat.mjs` ∥ `thincoder-server/public/views-me-chat.mjs` | 零改（只用 `nearBottom`） | 不跨层 |
| `docs/batches/2026-11-07-vsc-scroll-lock-threshold.test.mjs`（本批判定档 · 新建 · 用毕即删） | A1–A9 ∥ A11 在判据档；A10 = 结构读数（§5 在册） | 不跨层（住批档目录，不进任何包） |

- **层级结论：无文件跨层。**
- **查法（评审 8）**：`doc_check(mode:"report", lines:[<第三节受影响文件表逐档>])`——尺子 = `countContentLines`（唯一尺子），逐档读数落批档实施段。**结论：越硬限 0 档 ∥ 拆分 0 处**——逐档改动皆在原档内（常量退役 ∥ 删再出口一行 ∥ 改一处判据），无硬限触发。
- `thincoder-vscode/node_modules/@thincoder/render-core/scroll.mjs` 实测为指向 `thincoder-render-core/scroll.mjs` 的链接（不是副本）⇒ VSC webview 直接看到核改动，无需同步动作。
- **设计档落点 = 已落盘**：单源 = `docs/render-core/design/RENDER-CORE.md`（§2 KD-RC-16 判据行 · §5 条 5 导出面 · §7 条 C18 机检行）；消费面 = `docs/desktop/design/RENDERER.md`（§3 跟滚判据 ∥ 让位三律 ∥ 工厂化 · §4 借用清单第 1 ∥ 第 6 行）、`docs/vsc/design/WEBVIEW.md`（§3 文件结构 `scroll.js` 行 · §5.5 出生可见性 ∥ RTM 行 · §8 U-W2）与 `docs/desktop/design/ACTIVITY.md`（§2 批注（块跟滚让位修复）第 2 条让位收窄 ∥ 第 6 条边界归属——两处阈值表述换指单源 KD-RC-16，本端不自持像素常量）。

### 四、验收判据（可跑形）

- 判定文件 = 本批单元测试档 `docs/batches/2026-11-07-vsc-scroll-lock-threshold.test.mjs`（用毕即删）。
- 命令 = `node --test docs/batches/2026-11-07-vsc-scroll-lock-threshold.test.mjs`。

| # | `scrollHeight` | `scrollTop` | 视口（`clientHeight`） | 实算 gap | 阈 | 期望 | 旧实现（阈恒 24） |
|---|---|---|---|---|---|---|---|
| A1 | 2400 | 2000 | 400 | 0 | 200 | true | true（不变） |
| A2 | 2400 | 900 | 1200 | 300 | 600 | **true** | **false —— 旧实现下必红** |
| A3 | 2400 | 599 | 1200 | 601 | 600 | false | false（不变） |
| A4a | 2400 | 1600 | 400 | 400 | 200 | **false** | false（不变） |
| A4b | 2400 | 800 | 1200 | 400 | 600 | **true** | **false —— 旧实现下必红** |
| A5 | 2400 | 1800 | 400 | 200（恰等阈） | 200 | **false**（严格小于） | false（不变） |
| A6 | `nearBottom(null)` | — | — | 0（零读数） | 24 | true | true（不变） |
| A7 | 100 | 38 | 40 | 22 | 24 | **true** | true（不变） |
| A8 | 100 | 36 | 40 | 24（恰等阈） | 24 | **false** | false（不变） |
| A11 | 视口输入 `0` ∥ `NaN` ∥ `Infinity` ∥ `-100` | — | — | — | 24（四档同值） | `nearBottomThreshold` 四档皆 24 | 无此函数 |
| A9 | 钮判据同源（结构性读数，不在输入表上）：`thincoder-vscode/webview/scroll.js` 的 `120` 阈值字面零命中 ∧ `updateScrollBottomVisibility` 的非近底判据取核 `nearBottom` | 两半成立 | 旧实现自持 `< 120`——两半皆不成立 |
| A10 | 档面同源（结构性读数）：`docs/desktop/design/ACTIVITY.md` §2 批注（块跟滚让位修复）第 2 ∥ 第 6 条换指单源 KD-RC-16；同档「可滚 ∕ 溢出」类判据差分为空 | 两半成立：两处无固定像素阈 ∧ 指向 `docs/render-core/design/RENDER-CORE.md` §2 KD-RC-16；可滚判据零改 | 旧档两处皆自持像素阈（第 2 条 `近底（< 24px）` ∥ 第 6 条 `近底 24px`）——第一半不成立 |

- **A11 同时是下限支的场景名（评审 13）**：下限支只在「视口读数不可信」时生效——未挂载 ∥ 隐藏 ∥ 零高（`nearBottom(null)` 的既有语义即此）；视口 40px 的 A7 ∥ A8 是同一支的算术见证，不是另一条产品场景。视口 ≥ 48px 时阈恒等于「视口的一半」，下限不参与。
- **gap 列 = 三读数实算**（`scrollHeight − scrollTop − clientHeight`），全表逐行复算自洽。判据 = gap 严格小于阈。
- A2 ∥ A4b 是本批的判别用例。A2 在旧实现下必红（gap 300 ≥ 24）；A4 把「同一个 gap 400、不同视口给出相反判定」写成断言——400 视口判 false（阈 200）∥ 1200 视口判 true（阈 600），而旧实现的阈恒为 24 ⇒ 两半都返回 false，答不出 A4b 那一半。
- A7 ∥ A8 判下限：视口压到 40px 时阈仍是 24（裸比例会是 20）——gap 22 判近底、gap 24 不判。**两条同时成立的实现只能取 24**；取 20 则 A7 翻 false。
- A5 ∥ A8 判严格小于：gap 恰等阈不判近底（旧语义逐字保留）。
- **「红在旧实现」的判法**：把 A2 ∥ A4b 的三读数喂给现行 `nearBottom`（`thincoder-render-core/scroll.mjs`），两条都返回 false（旧阈恒 24）。
- **测试载体（评审 11）**：用例输入 = 自带三读数的普通对象 `{ scrollTop, scrollHeight, clientHeight }`，不喂 DOM 元素。判由：`nearBottom` 只经 `metricsOf` 读这三个数；VSC 测试底座 happy-dom 不排版，真元素 `clientHeight` 恒 0 ⇒ 喂真元素会把 A2 ∥ A4b 全部塌成阈 24，两条判别用例同时失效。
- **A9（结构读数 · 钮判据同源）**：`thincoder-vscode/webview/scroll.js` 的 `updateScrollBottomVisibility` 非近底判据取核 `nearBottom`。命令 = `grep -n "nearBottom\|clientHeight" thincoder-vscode/webview/scroll.js`；判法两半 = ① 该档引入核 `nearBottom` 且该函数内以核调用判非近底；② 该档内不再出现 `scrollHeight - … - clientHeight` 形式的自算比较。**第一半以符号判，不以字面判**——该档另有 `40` ∥ `150` ∥ `10` 等合法字面，`120` 字面零命中只作旁证。
- **A10（结构读数 · 档面同源）**：`docs/desktop/design/ACTIVITY.md` §2 批注（块跟滚让位修复）第 2 ∥ 第 6 条换指单源 KD-RC-16。命令 = `grep -n "KD-RC-16\|24px\|近底" docs/desktop/design/ACTIVITY.md`；判法 = 两条内无固定像素阈且指向 `docs/render-core/design/RENDER-CORE.md` §2 KD-RC-16；同档「可滚 ∕ 溢出」类判据零改。

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

1. **`docs/desktop/design/ACTIVITY.md` §2 批注（块跟滚让位修复）第 2 ∥ 第 6 条两处阈值表述已并入本批**（用户 2026-11-07 裁定）。
   - 判由：同一条判据在四个载体上各写一个数、改三留一 ⇒ 下一个人按留下的那个改就会改错；一条判据在同一档里出现两个值即缺陷，见到就改，不等清单。
   - 改法：两处换指单源 `docs/render-core/design/RENDER-CORE.md` §2 KD-RC-16，本端不自持像素常量；同档「可滚 ∕ 溢出」类判据一字未动——那个数判「能不能滚」，与「离底多远」是两件事，合并了可滚判定会随阈值漂。
2. **[上抛·知会] 四份设计档的整档文档门仍读 REFUSED——存量裸名锚债归清账批。**
   - 量法 = `doc_check` 整档判（`mode: "gate"`）。本轮实量 = **四档合计 538 条锚命中**，其中 `docs/render-core/design/RENDER-CORE.md` 单独读数 **226**，其余三档合计 **312**（`docs/desktop/design/ACTIVITY.md` ∥ `docs/desktop/design/RENDERER.md` ∥ `docs/vsc/design/WEBVIEW.md`）。
   - **本批改动区新增 = 0**：新增与改写的行只引用仓根全路径且逐条在盘（`docs/render-core/design/RENDER-CORE.md` ∥ `docs/vsc/design/WEBVIEW.md` ∥ `test/RTM.md` ∥ `docs/vsc/requirements/WEBVIEW.md`）。
   - 四档只动判据表述（旧 24px ∥ 再出口行 ∥ 借用行 ⇒ 视口比例阈），不碰裸名存量。`docs/desktop/design/ACTIVITY.md` 本轮**改了两处**（§2 批注（块跟滚让位修复）第 2 ∥ 第 6 条：`近底（< 24px）` ∥ `近底 24px` ⇒ 换指 `docs/render-core/design/RENDER-CORE.md` §2 KD-RC-16）；实体量法 = `git diff -- docs/desktop/design/ACTIVITY.md`（workdir = 仓根）。改动行只换判据表述 ⇒ 裸名锚存量零增减。
3. **RTM：本批新增一行（VSC 端故事 2 · 行 `VSC 2-1`），编号先定、用例标题由实施轮落。**
   - 判由：用户 2026-11-07 15:58 报的就是生产上真出过的症状（流式输出轻微偏移就把跟随停掉）——RTM 长行的两个入口之一成立，故不适用「无行可加」。
   - 既有行影响 = **不破坏、不冗余**：`test/RTM.md` 现无一行断言跟滚几何（VSC 端仅「VSC 1 归档块重开」，属册 `ends`）。
   - **四样内容**（写进设计档 = `docs/vsc/design/WEBVIEW.md` §5.5；实施轮照此落 `test/integration/**` 用例）：
     - **评哪几个组件的交互**：流式帧应用（核 `thincoder-render-core/flow/stream.mjs` 的帧尾） × pin 观察（核 `createPinWatch` 的更新点） × 近底判据（核 `nearBottom`）。
     - **断言哪条业务可观测结果**：活回合中，视口离底不足半视口 ⇒ 下一帧输出后视口仍贴底；离底达到 ∥ 超过半视口 ⇒ 解钉、后续帧不再拉底。
     - **从哪个用户入口进**：VSC 聊天面板消息区，一次流式回合进行中（用户上滚动作为输入）。
     - **追到哪条需求**：`docs/vsc/requirements/WEBVIEW.md` F-W2（流式跟随与滚动）。
   - **几何在这层可观测**：驱动真 webview 模块 + 自带 `scrollHeight` ∥ `scrollTop` ∥ `clientHeight` 读数的元素即足——不需真排版。「要真排版」与「这层测不了」是两件事。

## §3 设计评审（评审子代理）
**状态行**：评审通过



### 轮次 1（评审子代理）

**轮次结论（设计评审 · 目标 = 批档 §2 ＋ 四档渲染侧改动面）**

| # | 严重程度 | 状态 | 证据（指针） |
|---|---|---|---|
| 1 | 🔴 | 未处置 | §2 七 3「RTM 无行可加」——所给理由 =「需活 webview DOM，不在现有集成层能力内」，同段又自陈「本批的业务可观测面（流式输出中视口是否仍贴底）」；`test/RTM.md` 故事索引表 VSC 端仅「VSC 1」一故事，且该档明写「本端集成层按故事设立」 |
| 2 | 🔴 | 未处置 | §2 四 A7 输入「100 ∕ 60，视口 40（gap 40」——按三读数实算 gap = 0 ⇒ 期望「false」与所给输入相反；A5「2400 ∕ 1600，视口 400（gap 恰 200）」实为 gap 400；A8 ∥ A4 后半同病（A4 后半换视口 1200 后 gap = −600，判别力随之消失） |
| 3 | 🟡 | 未处置 | §2 三落点「§1.2 档表 `scroll.js` 行」「§11 U-W2」——`docs/vsc/design/WEBVIEW.md` 无 §1.2；`scroll.js` 行在 §3 文件结构，U-W2 在 §8 UI/交互决策落档。「ACTIVITY §1 让位收窄条 ∥ 边界归属条」实在 §2 批注（块跟滚让位修复）第 2 ∥ 第 6 条 |
| 4 | 🟡 | 未处置 | 算式字面并列三处：`docs/render-core/design/RENDER-CORE.md` §5 条 5「唯一算式源」「别处不得另算」对 `docs/desktop/design/RENDERER.md` §3「max(24, clientHeight × 0.5)」、`docs/vsc/design/WEBVIEW.md` §5.5「max(24px, 视口高 × 0.5)」、`docs/vsc/requirements/WEBVIEW.md` F-W2 同一字面 |
| 5 | 🟡 | 未处置 | §2 无「最近先例」行——先例坐标（实现坐标 ∥ 匹配设计档节 ∥ 先例批）与对齐 ∥ 偏离理由均未写；文内只有 KD-RC-8 ④ 的罚则引用 |
| 6 | 🟡 | 未处置 | §2 无「勘察证据」行（查过哪些公开源档 ∥ 有无相关）；§1「库外 = B 类」只述不联网查证，不构成该行 |
| 7 | 🟡 | 未处置 | 新名 `NEAR_BOTTOM_RATIO` ∥ `NEAR_BOTTOM_MIN_PX` ∥ `nearBottomThreshold` 无三问答案（existing ∥ none found ∥ existing but unusable）；§2 ③ 只给「`NEAR_BOTTOM_PX` 退役」的理由 |
| 8 | 🟡 | 未处置 | §2 三「无文件跨层」只有结论、无查法（命令）；本批判定档（单元测试档）不在受影响文件表内。评审实量 = `thincoder-render-core/scroll.mjs` 127 ∥ `thincoder-render-core/subblocks/block.mjs` 115 ∥ `thincoder-desktop/renderer/views/chat-scroll.mjs` 109 ∥ `thincoder-vscode/webview/scroll.js` 35 ∥ `thincoder-vscode/webview/ui.js` 256 行 ⇒ 结论成立 |
| 9 | 🟡 | 未处置 | §2 六「`clientHeight` 为 0 ∥ 负数 ∥ `NaN` ∥ 缺 ∥ `Infinity` ⇒ `metricsOf` 归一为 0」——`thincoder-render-core/scroll.mjs` 实为「Number.isFinite(value) ? value : 0」⇒ 负数不归一（阈值结论仍由 max 兜住，所述路径不成立）；`NaN` ∥ `Infinity` ∥ 负数亦无验收行 |
| 10 | 🟡 | 未处置 | §2 四只给 `node --test` 一条命令；A9 ∥ A10 属结构读数（`120` 字面零命中 ∥ 档面差分）而无跑法，且 A9 以一个数字字面立判（同档另有 `40` ∥ `150` ∥ `10` 字面） |
| 11 | 🟡 | 未处置 | §2 四未定测试载体：`nearBottom` 只读三读数（`thincoder-render-core/scroll.mjs` 的 `metricsOf`），而 VSC 端 DOM 底座 = happy-dom 无排版 ⇒ 真元素 `clientHeight` 恒 0，A2 ∥ A4 会塌成阈 24 |
| 12 | 🟡 | 未处置 | `docs/vsc/requirements/WEBVIEW.md` F-W2 需求列「上滚解钉（阅读历史不被打断）」对 §2 五「上滚不足半视口、流式仍在出字 ⇒ 视口被拉回底部」——同一档内两说，需求列未加限定 |
| 13 | 🔵 | 未处置 | 下限支（`clientHeight` < 48）无场景名：依据只有用户原话「至少偏离底部到视口高度的一半再锁定」与既有 A6（`nearBottom(null)`） |
| 14 | 🔵 | 未处置 | §2 七 2 自陈四档整档文档门仍 REFUSED、`docs/desktop/design/ACTIVITY.md` 存量裸名锚 26 条 ∕ 零增减——已登记归清账批 |

**计数**：🔴 2 · 🟡 10 · 🔵 2（共 14 行）

VERDICT: changes-required

### 轮次 2（评审子代理）

**轮次 2 结论（验证轮 1 的 14 条 + 修复引入的新问题 · 目标 = 批档 §2 ＋ 四档改动面）**

| # | 原# | 严重程度 | 状态 | 证据（指针） |
|---|---|---|---|---|
| 1 | 1 | — | 已验 | §2 七 3「RTM：本批新增一行（VSC 端故事 2 · 行 `VSC 2-1`）」+「四样内容」；`docs/vsc/design/WEBVIEW.md` §5.5「集成面（`test/RTM.md` 行 `VSC 2-1` · 故事「VSC 2 · 流式输出中视口贴底」）」；「几何在本层可观测」已撤销能力理由 |
| 2 | 2 | — | 已验 | 验收表逐行复算自洽：`A7` 100 ∕ 38 ∕ 40 ⇒ gap 22；`A5` 2400 ∕ 1800 ∕ 400 ⇒ gap 200（恰等阈）；`A4a/A4b` 同 gap 400 两判相反；`A8` gap 24；`A11` 四档皆 24 |
| 3 | 3 | 🟡 | 未处置 | A10 行仍写「`docs/desktop/design/ACTIVITY.md` §1 让位收窄条 ∥ 边界归属条换指单源 KD-RC-16」——该两条在 §2 批注（块跟滚让位修复）第 2 ∥ 第 6 条（同段跑法句已改正为 §2） |
| 4 | 4 | 🟡 | 未处置 | `docs/vsc/requirements/WEBVIEW.md` F-W2 仍持「近底阈 = `max(24px, 视口高 × 0.5)`」，对 `docs/render-core/design/RENDER-CORE.md` §5 条 5「需求档只写面向用户的判据（半视口为下限），任何一档都不再抄 `max(…)` 形」；设计侧三档已收敛（RENDERER §3 ∥ WEBVIEW §5.5 均「本端不写算式」） |
| 5 | 5 | — | 已验 | §2 二·补「最近先例行」在（坐标 + 对齐 + 偏离） |
| 6 | 6 | — | 已验 | §2 二·补「勘察证据行」在（查过面 + 相关者三条 + 无独立文档仓不适用） |
| 7 | 7 | — | 已验 | §2 二·补「新名三问」在（`none found` ∥ `existing but unusable` 逐名） |
| 8 | 8 | 🟡 | 未处置 | 查法 ∥ 判定档行已补，但设计档内落下 as-of 读数「本轮实量 = `thincoder-render-core/scroll.mjs` 126」——结论 + 命令即足，读数会漂 |
| 9 | 9 | — | 已验 | §2 六改述「**负数不是非有限数，原样通过**——由 `max` 兜住」+ A11 四档覆盖 `0` ∥ `NaN` ∥ `Infinity` ∥ `-100` |
| 10 | 10 | — | 已验 | A9 ∥ A10 均给命令；A9「**第一半以符号判，不以字面判**」 |
| 11 | 11 | — | 已验 | §2 四「测试载体（评审 11）：用例输入 = 自带三读数的普通对象」 |
| 12 | 12 | — | 已验 | F-W2 需求列已加限定「上滚（**上滚超过半视口才解钉**——阈值内的上滚仍跟随，越过之后阅读历史才真正不被打断）」 |
| 13 | 13 | — | 已验 | A11 注句「**A11 同时是下限支的场景名（评审 13）**」 |
| 14 | 14 | 🔵 | 已记 | §2 七 2 仍自陈整档门 REFUSED（「四档合计 538 条锚命中」），归清账批——知会项 |
| 15 | (new) | 🟡 | 新 | ACTIVITY 改动面三说互斥：七 1「第 2 ∥ 第 6 条两处阈值表述已并入本批」对 七 2「`docs/desktop/design/ACTIVITY.md` 全档无字面改动（两处原本已指向 KD-RC-16）」对 A10 旧实现列「旧档自持 `近底（< 24px）`」 |
| 16 | (new) | 🟡 | 新 | A11 要「`nearBottomThreshold` 自己按同一判据归一一遍」，而单源档只记 `max(NEAR_BOTTOM_MIN_PX, clientHeight × NEAR_BOTTOM_RATIO)` 且归一住 `nearBottom(el)`——照单源档实施则 A11 红 |
| 17 | (new) | 🔵 | 新 | `docs/render-core/design/RENDER-CORE.md` §7 C18「ⓒ」仍以「`120` 阈值字面零命中」立判，与 §2 A9「以符号判」不齐 |
| 18 | (new) | 🔵 | 新 | `docs/vsc/requirements/WEBVIEW.md` §1「上滚阅读不被打断」未随 F-W2 限定收窄 |
| 19 | (new) | 🔵 | 新 | `test/RTM.md` 故事索引表仍只有「VSC 1」——预留编号 `VSC 2` 未登记 |

**计数**：🔴 0 · 🟡 5 · 🔵 4（共 19 行；原 14 条中 10 条已验关闭、3 条 🟡 残余（3 ∥ 4 ∥ 8）、1 条 🔵 知会（14）；新 5 条 = 15 ∥ 16 🟡 + 17 ∥ 18 ∥ 19 🔵）

VERDICT: pass

### 轮次 3（评审子代理）

> 状态行重置：第 3 轮打回（changes-required）· 上一轮状态行 = 评审通过 → 进行中 · 2026-11-07

**代码评审（实施面 · 目标 = 批 §2：核算式换视口比例 ∥ 两处再出口退役 ∥ VSC 回底钮同源 ∥ A1–A11 判据档 ∥ RTM VSC 2-1 集成用例）**

| # | 严重程度 | 状态 | 证据（指针） |
|---|---|---|---|
| 1 | 🔴 | 未处置 | `docs/server/design/webui/CHAT.md` 三处仍持「近底 24px 判据单源」（其中一处住在 KD-SV-101 对齐机检⑤格内），对 `docs/render-core/design/RENDER-CORE.md` §5 条 5「算式只在本条写一次」；同一机制两处活描述互斥（固定 24px 对 视口比例阈），而服务端 `thincoder-server/public/views-chat.mjs` 与 `thincoder-server/public/views-me-chat.mjs` 已随核 `nearBottom` 同变 ⇒ 档面即错。批 §2 二·补 既定「`docs/server/design/webui/CHAT.md`（把阈写成「近底 24px」，本批随之收正）」——未落，且 §2 三受影响文件表亦未列该档 |
| 2 | 🟡 | 未处置 | 批 §2 三「A1–A11 全在此档」对判据档头「A10（档面同源）不在此档」；又 §5 实施记录段空（`## §5 实施记录（eng-coder）` 直邻 `## §6 验证与收口（父代理）`）⇒ A10 读数 ∥ 逐档行数读数无落点。A10 实体已实读成立：`docs/desktop/design/ACTIVITY.md` §2 批注第 2 ∥ 第 6 条皆指 KD-RC-16 且无固定像素阈 |
| 3 | 🔵 | 未处置 | 判据档 A9 旁证 `assert.equal(/120/.test(body), false)` 的 `body` = 自函数头切至档尾 ⇒ 未来在档尾追加任何含 `120` 的行即红而无行为意义（档头自陈「只作旁证」） |
| 4 | 🔵 | 未处置 | `test/integration/vsc-scroll-follow.test.mjs` 的 `clock += 60` 对核 `thincoder-render-core/flow/stream.mjs` 的 `STREAM_RENDER_MIN_MS = 50` 只余 10ms 余量——墙一抬则四例同红且与业务无关 |

VERDICT: changes-required

计数：🔴 1 · 🟡 1 · 🔵 2（共 4 行）

### 轮次 4（评审子代理）

收敛轮（代码评审 · 只核两条修订）

| # | 严重程度 | 状态 | 证据（指针） |
|---|---|---|---|
| 1 | 🔴 | 已关闭（笔域路由：设计档非实施席笔域，父侧收正） | `docs/server/design/webui/CHAT.md` 三处 `24px 判据单源` 与单源档「算式只在本条写一次」互斥；缺陷实体仍在档面，按笔域 + 已上抛路由关闭，非否认 |
| 2 | 🟡 | 已关闭（笔域路由：批档 §2 单作者） | 判据档 `A10（档面同源）不在此档` 对 §2 三 `A1–A11 全在此档`；A10 实体实读成立（ACTIVITY.md 两条批注皆指 KD-RC-16、无像素阈） |
| 3 | 🔵 | 已修 | `const body = src.slice(start, src.indexOf("\n}", start) + 2)` —— 切片收到函数闭合行，档尾未来出现 `120` 不再无故翻红 |
| 4 | 🔵 | 已修 | `clock += STREAM_RENDER_MIN_MS + 1` 且由核导入 `STREAM_RENDER_MIN_MS`（核 `export const STREAM_RENDER_MIN_MS = 50`）—— 手抄常数已退场 |

VERDICT: pass

计数：🔴 0 · 🟡 0 · 🔵 0（新增 0）；两条修订皆落地，前轮两条 🔴/🟡 按笔域路由关闭

## §4 用户批准（主 agent）

### 用户批准

- **批准形 = 用户口述 + 整批令**：15:58 报告症状并给出判据「**至少偏离底部到视口高度的一半再锁定**」；16:21 确认口径「**滚动超过一半以后才停**」——**这是对设计方向（A 案：放大阈值）的明确选择**，也排除了手势门方案（B ∥ C）。14:33 的整批令「自动跑完」覆盖批内全链。
- **父侧裁定四处**：① 空串 `root` 一类不收（不属本批）；② 回底钮 `120` **本批同源收口**（`§1` 边界原写「不动」，实测那 120–400px 死带是本批造的，改判）；③ 手势门**不并入**（用户口径已定为「超过一半才停」，且四条风险未验）；④ 集成用例落点**按在盘契约**放 `test/integration/`（父侧原指定的包内目录会让整包测试变红）。
- **设计评审两轮**：轮 1 `changes-required`（2 🔴 · 10 🟡 · 2 🔵，两条 🔴 = 验收表算错 ∥ RTM 以能力不足拒加行）→ 修正轮 → **轮 2 `pass`** 并签凭证；轮 2 另报 2 条「修复引入的」🟡 → 修正轮 → 实施。
- **`A8`-类判断由父侧做**：无。本批收口判定 = 读数对表（判据档 ∥ 集成档 ∥ 四载体 ∥ 零回归）。

## §5 实施记录（eng-coder）

**实施结论**：核近底判据由「固定 24px」改为「视口比例 + 24px 下限」，两处再出口退役，VSC 回底钮与 pin 同源；判据档 A1–A11（13 例）与集成用例 `VSC 2-1`（4 例）全绿。实施面收敛；两项档面/记录面项非本席笔域，已上抛父侧路由（见末）。

### 一、改动面（§2 三 逐档 + 越出声明面一档）

| 档 | 改动 |
|---|---|
| `thincoder-render-core/scroll.mjs` | `NEAR_BOTTOM_PX` 删除；新增 `NEAR_BOTTOM_RATIO = 0.5` ∥ `NEAR_BOTTOM_MIN_PX = 24` ∥ `nearBottomThreshold(clientHeight)`（入参自带归一：`Number.isFinite` 归一 0、负数交 `max` 兜住）；`nearBottom(el)` 改用它，严格小于保留；头注随正 |
| `thincoder-render-core/subblocks/block.mjs` | 删掉 `NEAR_BOTTOM_PX` 的再出口行（`export { NEAR_BOTTOM_PX }` 一行）及其注释 |
| `thincoder-desktop/renderer/views/chat-scroll.mjs` | 删掉 `NEAR_BOTTOM_PX as FOLLOW_PX` 再出口行；头注随正（常量单源只剩 `BACKFILL_PX` ∥ `SMOOTH_MS` ∥ `MAX_RENDER_BLOCKS`） |
| `thincoder-vscode/webview/scroll.js` | `updateScrollBottomVisibility` 非近底判据改取核 `nearBottom`（`scrollBottomBtn.classList.toggle("visible", scrollable && !nearBottom(el))`）；自持 120 退场；`scrollable = el.scrollHeight > el.clientHeight + 40`（可滚判定）**原样分离** |
| `thincoder-vscode/webview/ui.js` ∥ `thincoder-server/public/views-chat.mjs` ∥ `thincoder-server/public/views-me-chat.mjs` | 零改（经核同变） |
| `docs/batches/2026-11-07-vsc-scroll-lock-threshold.test.mjs`（新建 · 用毕即删） | A1–A9 ∥ A11 判据档（13 例，含 A9 行为面） |
| `test/integration/vsc-scroll-follow.test.mjs`（新建 · **越出本席 spawn 声明面**） | 集成用例 `VSC 2-1`（4 例） |
| `test/RTM.md` ∥ `test/rtm/ends.md` | 故事索引加 `VSC 2`（属册 `ends`，矩阵 VSC = 有）；分册加故事节 + 用例行 `2-1` |

- **越界档理由**：父侧原指定的落点 = 该扩展包的 `test/` 目录下（与本题同名的集成用例档），照落会同时撞三条在盘契约——该包 `run.mjs` 的 fail-closed 清单门（包内 `test/` 树出现未登记的 `.test.mjs` 即直接失败，整包测试变红）、该包 `files.mjs` 自陈「集成档 = 业务设立…不在本清单」、以及 `test/RTM.md` 导读「本表只登记仓根 `test/integration/**` 的集成用例」（§2 七 3 亦写 `test/integration/**`，VSC 1 先例同住仓根）。故落 `test/integration/vsc-scroll-follow.test.mjs`，仓根 `test/run.mjs` 的单层收集面直接收；父侧原指定目录**未建**。

### 二、改码前基线（先取读数，再动码）

- **旧实现判别读数**（改码前实调 `thincoder-render-core/scroll.mjs` 的 `nearBottom`）：A1 `true` · **A2 `false`** · A3 `false` · A4a `false` · **A4b `false`** · A5 `false` · A7 `true` · A8 `false` · A6 `true`。⇒ A2 ∥ A4b 两条「旧实现必红」实测成立（期望 true，旧给 false）。
- **doc 面基线**（`doc_check` 报告态，判 `test/RTM.md` ∥ `test/rtm/ends.md`）：「命中 0 条（锚 0 · 文字太长，难于阅读 0 · 行太长 0）· 行号坐标 0 处」。
- §2 无 `AC-2` 编号（该编号属 `docs/core/design/DOC-CHECK.md` §6）；父侧口径按「本轮多写的档面零回归」执行，基线取上条，改后同命令同清单逐字比（见第八节）。

### 三、验收读数（命令 = `node --test docs/batches/2026-11-07-vsc-scroll-lock-threshold.test.mjs`）

`tests 13 · pass 13 · fail 0`。逐条：

| # | 断言读数 |
|---|---|
| A1 | gap 0 ∥ 视口 400（阈 200）⇒ `true` |
| A2 | gap 300 ∥ 视口 1200（阈 600）⇒ `true`（旧实现 `false`） |
| A3 | gap 601 ∥ 视口 1200 ⇒ `false` |
| A4 | 同 gap 400：视口 400 ⇒ `false`（阈 200）∥ 视口 1200 ⇒ `true`（阈 600） |
| A5 | gap 恰 200 ∥ 视口 400 ⇒ `false`（严格小于） |
| A6 | `nearBottom(null)` ⇒ `true`；`nearBottomThreshold(undefined)` ⇒ 24 |
| A7 | gap 22 ∥ 视口 40 ⇒ `true`（阈 24，裸比例会是 20） |
| A8 | gap 恰 24 ∥ 视口 40 ⇒ `false` |
| A11 | `0` ∥ `NaN` ∥ `Infinity` ∥ `-100` ⇒ 阈皆 24（另加「缺」档 `undefined` ⇒ 24，同 §2 六 归一支） |
| 算式表 | 视口 400⇒200 · 1200⇒600 · 40⇒24 · 0⇒24；两常量值逐值 |
| 退役面 | `"NEAR_BOTTOM_PX" in scrollModule === false` |
| A9 结构 | 该档引入核 `nearBottom` 在场 ∧ 函数体内 `nearBottom(el)` 在场 ∧ 函数体内无 `scrollHeight - … - clientHeight` 自算比较 ∧ 函数体内 `120` 字面零命中（旁证） |
| A9 行为 | 视口 1200：gap 0 ⇒ 钮不显 · gap 300 ⇒ 不显（旧 120 阈下会显）· gap 599 ⇒ 不显 · gap 600 ⇒ 显 · gap 700 ⇒ 显 |

- **A10（档面同源 · 结构读数，不入判据档）**：`docs/desktop/design/ACTIVITY.md` §2 批注（块跟滚让位修复）第 2 条 = 「近底（< 视口比例阈，单源 = `docs/render-core/design/RENDER-CORE.md` §2 KD-RC-16）无条件复跟」∥ 第 6 条 = 「滚动策略族契约同源（近底阈 = 视口比例，单源 = `docs/render-core/design/RENDER-CORE.md` §2 KD-RC-16；旗标门 + 清账三路——端 = 适配器）」⇒ **两半皆成立**（两条内无固定像素阈、皆指向单源）。同档 `24px` 字面全档零命中；该档本轮 diff 仅这两行一进一出 ⇒ 「可滚 ∕ 溢出」类判据零改。**不入判据档的理由**：它断的是设计档措辞，措辞一改就红而不证明任何行为（行为断言禁读非测试档）。

### 四、四载体读数（同一组三读数：gap 300 ∥ 视口 1200，阈 600）

| 载体 | 驱动件 | 读数 |
|---|---|---|
| 消息区 | `thincoder-vscode/webview/ui.js` 的 `initScrollFollow` + `maybeScrollDown` | scroll 后 `_pinBottom = true`，帧尾写后 gap 0 |
| 活动区 | 同档 `maybeScrollActivity` | scroll 后 `_pinActivity = true`，帧尾写后 gap 0 |
| 块内容区 | 核 `thincoder-render-core/subblocks/block.mjs` 的 `initBlockFollow` + `maybeScrollBlock` | scroll 后 `_pinFollow = true`，帧尾写后 gap 0 |
| 池列 | 桌面 `thincoder-desktop/renderer/views/activity-new.mjs` 的取件对（核 `createPinWatch` + `applyPin`） | scroll 后 `_poolPin = true`，帧尾写后 gap 0 |

对照：同一读数在旧实现（阈恒 24）下判 `false`（离底）⇒ 四载体同变、无跨端差异。

### 五、退役面零残留

`grep`（`**/*.{mjs,js,cjs}`，全树）：`NEAR_BOTTOM_PX` ∥ `FOLLOW_PX` 在源码面**零命中**；唯一命中在判据档自身的断言串（`assert.equal("NEAR_BOTTOM_PX" in scrollModule, false)`）。VSC 包内 `node_modules/@thincoder/render-core/` 是指向核的链接 ⇒ VSC 直接看到核改动，无副本要同步。

### 六、集成面（命令 = `node --test test/integration/vsc-scroll-follow.test.mjs`）

`tests 4 · pass 4 · fail 0`：离底 300（不足半视口 400）⇒ 钉仍真、下一帧后 gap 0；离底 500 ⇒ 解钉、后续两帧零写（离底 500→900 只随内容增高）；离底恰 400 ⇒ 解钉；回底 ⇒ 复钉 + 下一帧贴底。驱动面 = 真 `thincoder-vscode/webview/ui.js` 装配 + 核 `thincoder-render-core/flow/stream.mjs` 帧尾（`raf` ∥ `now` 注入 ⇒ 帧确定可复现；降频墙步进取核导出的 `STREAM_RENDER_MIN_MS`，不手抄常数）。

### 七、行数读数（尺子 = `doc_check` 的 `countContentLines`）

`thincoder-render-core/scroll.mjs` 142 · `thincoder-render-core/subblocks/block.mjs` 111 · `thincoder-desktop/renderer/views/chat-scroll.mjs` 106 · `thincoder-vscode/webview/scroll.js` 37 · `thincoder-vscode/webview/ui.js` 255 · 判据档 158 · 集成档 140 ⇒ **越硬限 0 档 ∥ 越软线 0 档 ∥ 未越线 7 档**。

### 八、零回归读数（改后同清单同命令）

改后：「命中 0 条（锚 0 · 文字太长，难于阅读 0 · 行太长 0）· 行号坐标 0 处」——与改码前基线**逐字相同，差 0 字节**。

### 九、内部回路（审计 ∥ 代码评审 ∥ 自修）与终态

- **偏差审计 1 轮**（只读 explore，对照 §2 与在盘源码）：判据面 A1–A11 全覆盖、§2 三 逐档一致、无静默简化；提 3 条 = ① `docs/server/design/webui/CHAT.md` 仍持「近底 24px 判据单源」（🟡）② A10 读数无落点（🟡，本段即其落点）③ §2 三 受影响文件表未列本批三个测试档（🔵）。
- **代码评审 2 轮**（advisor · code）：轮 1 = `changes-required`，4 条（🔴 `CHAT.md` 三处 24px；🟡 §2 三 句 ∥ 判据档头「A10 不在此档」+ §5 空；🔵 A9 旁证切片越界到档尾；🔵 集成档手抄 60ms 对降频墙只余 10ms）；轮 2 = `pass`，两条 🔵 逐条验为已修，两条 🔴 ∥ 🟡 按笔域路由关闭（理由成立：实施席在批档内可写面仅 §5，设计档与 §2 各有单作者）。
- **自修 1 轮**：两条 🔵 当场修净后复跑（13/13 ∥ 4/4 全绿）；🟡 的 §5 部分由本段兑现。
- **终态 = `clean`**（实施面收敛、评审 pass）；两项档面路由项在册于第十节，非本席笔域。

### 十、上抛项

1. **[上抛·待裁] `docs/server/design/webui/CHAT.md` 三处仍写「近底 24px 判据单源」**（其中一处是对齐机检判据格），与 `docs/render-core/design/RENDER-CORE.md` §5 条 5「算式只在本条写一次」及现行核算式互斥；而 §2 二·补 既定本批收正该档。本席笔域不含 `docs/**` ⇒ 请设计席 ∥ 父侧一次改净（三处换指 KD-RC-16、删 `24px` 字面），并把该档补进 §2 三 受影响文件表。
2. **[上抛·待裁] §2 三「A1–A11 全在此档」与判据档头「A10（档面同源）不在此档」互斥**；A10 是档面结构读数（读设计档措辞），按「行为断言禁读非测试档」的口径不宜进判据档 ⇒ 请 §2 作者把该格改为「A1–A9 ∥ A11 在判据档；A10 = 结构读数（§5 在册）」。
3. **[上抛·知会] 设计档漂移（本席 diff 触及面）**：`docs/core/design/TESTING.md` §11.18.8 的故事→族→册映射表 `ends` 行仍只有「CLI 33 · VSC 1」，本批新增 `VSC 2` 后应随之补；该档非本席笔域。
4. **[上抛·知会] 集成用例落点偏离父侧指定目录**（理由见第一节）：已落 `test/integration/vsc-scroll-follow.test.mjs`，`test/RTM.md` ∥ `test/rtm/ends.md` 的证据格与此同址。

## §6 验证与收口（父代理）

### 验证与收口

**父侧独立复量（本进程实跑）**

| 验收 | 量法 | 父侧读数 |
|---|---|---|
| **判据档全绿** | `node --test docs/batches/2026-11-07-vsc-scroll-lock-threshold.test.mjs` | **`tests 13 · pass 13 · fail 0`** |
| **集成用例** | `node --test test/integration/vsc-scroll-follow.test.mjs` | **`tests 4 · pass 4 · fail 0`** |
| **算式与归一** | `nearBottomThreshold(1200)` ∥ `nearBottom(gap 300, 视口 1200)` ∥ `A11` 四档 | **`600` · `true` · `[0, NaN, Infinity, -100] ⇒ 24 24 24 24`** |
| **旧常量零残留** | 全树源码扫 `NEAR_BOTTOM_PX` ∥ `FOLLOW_PX` | **仅判据档自身断言串两行**（收口删档即清），源码面 **0** |
| **`TESTING.md` 映射表三面相等** | 映射表条数 ∥ `test/RTM.md` 索引行数 ∥ 六册实读故事节 | **`37 = 37 = 37`**，四项差集全空（`EQUALS = true`） |
| **交付门（本批自撰与修复的档）** | `doc_check` 判批档 ∥ `TESTING.md` ∥ `test/RTM.md` | **`PASS`** |

**一处必须明写的：需求档整档门仍 `REFUSED`，且不是本批造成的**

`docs/vsc/requirements/WEBVIEW.md` 判 `REFUSED（锚 60 条）`——**全部是该档存量裸名锚**（`settings-env.js` ∥ `ui.js` ∥ `panel-messages.mjs` 一类，分布 line 25–35 ∥ 40 ∥ 66–137）。**本批只改第 11 行与第 19 行，两处都带仓根全路径，新增 0 条。**

**⇒ 门判的是整档，所以这份档在任何一轮都会红；但它红的原因不是这批的改动。** 已立台账 **`#2147`**（与 `#2137` ∥ `#2142` 可并作一次清账批）。**这条没有隐去、没有记成"通过"**——收口读者要能看到：整档门红、红的来源、以及它归谁。

**本批越出 `§2` 声明面的档面修正（三处，逐处有据）**

① `docs/desktop/design/ACTIVITY.md` §2 批注第 2 ∥ 第 6 条（阈值表述，`#16` 落）· ② `test/RTM.md` + `test/rtm/ends.md` 的 `VSC 2` 登记（集成面，`#23` 落）· ③ `docs/core/design/TESTING.md` §11.18.8 映射表两格（`ends` 补 `VSC 2` ∥ `guard` 补 `CLI 36`，`#29` ∥ `#31` 落）。**三处都是本批改动带出来的连锁面**（换了阈值 ⇒ 三端表述要跟；加了故事 ⇒ 索引与映射表要跟），不是顺手扩大。

**本批不做、理由写死**

- **`docs/server/design/webui/CHAT.md` 三处「近底 24px」未改**：该档存量裸名锚 **72 条**（父侧 `doc_check` 实量），改一笔即被整档门拒、零字节落盘 ⇒ 归 **`#2142`**。`§2` 里原写"本批收正"的句子已改成归清账批——**写着做了而没做，就是给下一轮留一句假话**。
- **`index.mjs` 行数**：`#2139` 已记（越软线、未越硬限，拆点与触发条件写明）。
- **回底钮显隐的刷新时机**（只在历史页应用后重算）⇒ **`#2143`**，属另一件事（刷新时机，不是阈值）。
- **`RENDER-CORE.md` §9「滚动不入核」与 §5 自相矛盾** ⇒ **`#2144`**。
- **本批零单元测试档留存**：`docs/batches/**` 下那份判据档按零留存口径**整档删除**。

**这批存在的理由**

一个固定像素当近底阈，任何几十像素的渲染抖动都会被当成「用户离开了底部」——**输出还在继续，视图却停了**。用户的原话是「滚动超过一半以后才停」，改完之后判据与视口成比例，**并且回底钮与它同源**——原来那两处各持一个数（24 与 120），改完只剩一个。

**收口**

- 台账 `#2141`：**在途 → 待核销 → 已核销**。
- 另立 `#2147`（VSC 需求档 60 条裸名锚），`trigger = 条件`，不随本批核销。
