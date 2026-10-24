# 桌面端（DESKTOP）· 渲染面实现工艺

> 板块 = **桌面端渲染面（前端）实现工艺**——零框架 DOM 层 · 单状态树 `store` · 渲染粒度与流式缝合 · 有界渲染窗口 · 回填与跟滚。
> 需求侧 = 需求分卷（`docs/desktop/requirements/`——查卷口 = `docs/desktop/requirements/PROJECT.md` §4 **D 表索引**；本域无专卷——D 号散落各域卷；功能点 = 九域卷 + 总览 D14 ∥ 验收 ∥ 依赖面 = 总览 §7 ∥ §8——范围数随需求卷现文）。
> 同部分相关档：进程与目录形态（渲染面目录与模块注）= `docs/desktop/design/SHELL.md` §1 · 通道与载荷 = `docs/desktop/design/IPC.md` · 界面形态与交互 · 借用清单形态面 = `docs/desktop/design/UI.md` · 逐文件预算（§4.1）= `docs/desktop/design/PROJECT.md`。
> 域档（按域拆分后 · 均 `docs/desktop/design/` 下）：`CHAT.md` ∥ `COMPOSER.md` ∥ `ACTIVITY.md` ∥ `SESSIONS.md` ∥ `SETTINGS.md` ∥ `MENU.md` ∥ `PACKAGING.md` ∥ `E2E-TESTING.md` ∥ `WEB-QUICKCHECK.md`——逐域单源；文件账 = 本档 §5。
> 核机制面（agent 主循环 / 工具 / 记忆 / 配置 / 会话）**只住核**——本档只做**接入面**设计，不重述核语义（单一权威源）。

## 1. 渲染面工艺形态（索引）

本表 = **工艺索引**（形态一行 + 落点）：目录树逐行注住 `docs/desktop/design/SHELL.md` §1，逐文件预算住 `docs/desktop/design/PROJECT.md` §4.1——本表不重复其内容。

| 面 | 形态 | 落点 |
|---|---|---|
| 零框架零构建 | 原生 ESM + 手写 DOM；不引框架、不引打包器、无构建步骤 | `docs/desktop/design/PROJECT.md` §2 KD-4 |
| DOM 层 | `dom.mjs` 手写 DOM 工具 | `docs/desktop/design/SHELL.md` §1 |
| 视图面形态 | 视图档 = 纯函数构描述符树 + 薄挂载（机检可脱 DOM；文案一律经 `t()`） | 本档 §1.1 |
| 接线形通则 | handlers 给 ⇒ 落 `onClick` 且**无** `disabled`；缺省 ⇒ `disabled: true` + `data-action`（**诚实非死控**——树形只随 handlers 变）· **键盘面** = 挂载面自挂 `keydown`（审批卡根 / 标签条加速键 `Ctrl/Cmd+1..9`——文档级 · 命中才 `preventDefault`） | 本档 §1.1 |
| 单状态树 | `store.mjs` 单状态树 + 订阅（会话 / 标签页 / 活动池 / 待审批 / 设置 / 项目级信息 + `questions` / `tasks` 两切片 + 队列面（`pending` 切片 = `ev:queue` 镜面；单源 = `docs/desktop/design/PROJECT.md` §2 **KD-40**）；会话开合 ∕ 换形态归 `thincoder-desktop/renderer/mount-sessions.mjs` 面内记账（活动会话单源 = `activeSession`）＋ **面内态变更 ⇒ 即时手动重挂（先于帧径数据刷——反馈不候帧）**；`usage` 切片），由 IPC 事件驱动 | `docs/desktop/design/SHELL.md` §1 · `docs/desktop/design/IPC.md` §1 |
| 渲染粒度 · 流式缝合 | 流面按**作业结算**（新块到达 ⇒ 追加 ∥ 窗口滑 ⇒ 按数摘 ∥ 回填 ⇒ 整置（删档 + 新写——记录序重放）——作业单 = `state.flowOps`；结算纯件 = `thincoder-desktop/renderer/views/chat-stream.mjs` `flowStep`）；**尾块文本面增量 md**（冻结切点 + 热区换代；单源 = `docs/render-core/design/RENDER-CORE.md` §2 KD-RC-10） | `docs/desktop/design/SHELL.md` §1 · `docs/desktop/design/PROJECT.md` §4.1 |
| 更新纪律（帧合并 · 收核） | 触发源 = store 变更 ⇒ 核帧合并件 `mark`；单飞 rAF + `FRAME_MIN_MS`(50) 间隔；每帧每面至多绘一次 + 布局节俭 + 帧尾动作；帧内组合（就地改 + 追加）自然同帧（结算步两动作——本档 §1.2 ②） | 本档 §1.2 · `docs/render-core/design/RENDER-CORE.md` §2 KD-RC-9 |
| 设置面 / 向导 | 两形构树（`thincoder-desktop/renderer/views/settings.mjs` / `thincoder-desktop/renderer/views/onboarding.mjs`）+ 薄挂载出档（`thincoder-desktop/renderer/mount-settings.mjs`）；**零新事件通道**（请求通道）；向导闸 = `config:read` 回执 `configured` | 本档 §1.1 · `docs/desktop/design/UI.md` §1 设置面 / 首启向导行 |
| 提问与计划卡 · 输入区 | 提问卡 / 计划卡 = 流内非块节点，纯构树（`thincoder-desktop/renderer/views/question.mjs` / `thincoder-desktop/renderer/views/plan.mjs`——零 `store` import）· 输入区 = 中区底行挂载出档（`thincoder-desktop/renderer/mount-composer.mjs`，自 `app.mjs` 拆出）· 卡族挂载与出站 = `thincoder-desktop/renderer/mount-cards.mjs`（`question:respond` 出站 + 清本键 `questions` 切片 + 清位标） | 本档 §1.1 · `docs/desktop/design/UI.md` §1 输入区 / 提问呈现 / 计划面行 |
| 挂起窗与消化轮（桌面空闲唤醒） | 宿主挂起驱动（消费核件）= 空闲子任务 settle ⇒ 自唤醒消化轮；两事件面 `ev:susp`（计数：状态行段 3 第三态）· `ev:digest`（流内消化行族）；挂起空闲输入开放；块归档（**起跑窗**——消化起跑点（`ev:digest start` 发帧点）对本轮将消费驻留条目逐条补发 `done`（consult 会话条目 ⇒ 按其 `childIds` 逐子块补发；`hooks.reclaim` = **兜底幂等**；**三端同形**——VSC ∥ CLI 各起跑点补发同形、各 `reclaim` 兜底幂等（对位 VSC `thincoder-vscode/src/extension/suspension.mjs:112-119` ∥ CLI `thincoder-cli/src/tui/suspension-drive.mjs:212`））；退出 freeze = 兜底同型（`ev:susp {active:false}` 径）；**待消化块来源 = 全族 settle**——非挂起态亦发 `settled`） | 本档 §1.1 · `docs/desktop/design/PROJECT.md` §2 KD-34–36 · `docs/desktop/design/IPC.md` §1 |
| 有界渲染窗口 | 见本档 §2 | 本档 |
| 回填与跟滚 | 见本档 §3 | 本档 |
| 右栏宽度拖动（chrome 级直写 · D30） | 拖柄三段交互 + 内联 `--pool-w` 直写（rAF 合帧）· 界 = CSS `clamp` 单落点 · 持久化 = `localStorage`（端自有 UI 态） | 本档 §1.3 · `docs/desktop/design/UI.md` §1「批注（右栏宽度拖动 · D30）」 |
| 主题三态（chrome 级状态 · D33） | `data-theme` 状态（单写者 `theme.mjs`）+ 单块 `light-dark()` 值对 + `localStorage` 持久化 · 零 IPC | 本档 §1.4 · `docs/desktop/design/UI.md` §1「批注（主题切换 · D33）」 |
| 后台态与渲染停摆 | 窗口后台（遮挡∥失焦）不停摆——`backgroundThrottling: false`：后台期照常出帧与交换 ⇒ 无「停摆—复显」相变（无可见性迟滞窗 ∥ 无集中偿付） | 本档 §1.5 |

### 1.1 视图面形态：纯描述符 + 薄挂载

- **两层分家**：视图档（`thincoder-desktop/renderer/views/*.mjs`）分两层 —— ① **纯构树**（`xxxModel(state)` → 态对象；`xxxTree(model)` → **结构描述符树**）；② **薄挂载**（`mountXxx(root, state)` = `clear` + `build` + `append`——**建树面单点**）。
  视图档 **DOM 触面四处** = 建树（本条）· 接线（下条）· 帧尾态刷（`syncChrome`——本档 §1.1）· 帧尾滚动作（`settleFrame` ∕ 池面 `mountPool` 尾——本档 §3）。
- **接线面（第二形）**：事件 / 状态机型视图档（如滚动面）以 **`attachXxx(root, deps)`** 落形——`deps` = 出口回调集（`on*` 键：回填 / 复跟 / 停跟 / **滚动拍**）+ **只读口** `guards?()`（缺 ⇒ 恒假），程序化滚动作经返回 handle 出（不占 `deps` 键）；
  阈值常量与事件订阅（`scroll` 用 `passive`）收口于该档（常量单源声明 = 档头）；判定与算式一律纯函数（`scrollAction` / `compensateTop` / `nextWindow` / `smoothWindowOpen`）。
- **接线面依赖面（测试缝）**：`attachXxx` 的 DOM 依赖 = root 三读数（`scrollTop` / `scrollHeight` / `clientHeight`）+ `addEventListener` / `scrollTo` ⇒ **假 root 可注入**（接线面入自动面：直调出口 + 断言 store 读数）；**真实事件触发（用户真滚）仍归人工走查**。
- **事件归约面**：`ev:*` **二十五通道** → 切片写者**单源** = `thincoder-desktop/renderer/events.mjs`——`reduce(state, ev)` 纯函数（零 DOM ⇒ 平 node 直测）+ `applyPage(state, receipt)`（页回执 → 首屏 / 回填两径）
  + `applyFlags(state, key, flags)`（`sessionFlags` 切片写者——页读 / 出站回执**两径同点**）+ `blockOfMessage(msg)`（核 message → 块五型：用户 / 助手 / 推理 / 工具 / 错误——**页读域**；
  **块总集 = 六型**：+ `subagent`（归档子 agent 块——**留档块**：**页读域第六型**——六型全员入页读域；「对齐第二批」项 5））；
  订阅接线拆出 `thincoder-desktop/renderer/events-subscribe.mjs`——`attachEvents({ on, store, invoke, onTurnTail })`（二十五通道订阅 · 退订句柄在场 · 回合尾标题刷新**存续**）· 单向依赖归约档（无环）。
  写者与读者键面同源 = `key`（`docs/desktop/design/IPC.md` §1 会话键面）。
  **两通道归约**：`ev:question` / `ev:task` 由「直返 `state`」改**写切片**（`state.questions` / `state.tasks`——同 `key` 就地替换零叠条，**不入 `pool`**）；队列面写者 = `ev:queue` 归约（权威 = 宿主 ∕ 渲染面 = 镜面；单源 = `docs/desktop/design/PROJECT.md` §2 **KD-40**）。
  **一通道归约**：`ev:usage` 写 `usage` 切片（按会话 `key` · 同键就地替换 · 首写自种——**归约面唯一写者**；未至 / 非正数 ⇒ 零节点——KD-20，单源 = `docs/desktop/design/PROJECT.md` §2 KD-20 行）。
  **桌面空闲唤醒：两通道归约 + 消化行族**：`ev:susp` 写 `susp` 切片（按会话 `key` · 同键就地替换——计数四值 + `active`；`active:false` ⇒ 段回落两态词，**禁假造**）；
  `ev:digest` 写 `digest` 切片（按会话 `key` · **全轮累积**——`start` ⇒ **追加本轮**（切片 = […旧轮, 本轮]——旧轮行**出即留**（零清理机器））·
  `cap` ∕ `end` **就末轮更新**（cap 事实跨 `end` 存续；无轮 ⇒ 零写——**防守档**（**可达面 = 起跑帧未及**（轮在飞时渲染面新接入——其后 `cap` ∥ `end` 帧零写）；渲染面自该轮起跑帧在连 ⇒ 不可达——归属规则（活流侧优先）保运行期未结轮跨首屏存续；VSC 死游标零动作只系 `end`））；
  **记录 ∥ 显示两面**：轮事件三型（`start` ∕ `cap` ∕ `end`）**全量**逐条入**人读线记录**（`pushReal` 同面追加——不入机器线）；**显示 = 自然形**（行出即留——起跑行 ∥ 计数行 ∥ cap 行 ∥ 终态行：不改 ∥ 不删 ∥ 不退场；行 = 流内事件——出生 = 到达序）；
  切片清点（`clearDigest`——未结末轮保（余整清——其内容随首屏记录重建））+ 并入（`withFoldedDigest`——**未结轮归属（活流侧优先）**：运行期未结轮在场 ⇒ 折叠未结末轮**不并入**（唯一副本 = 运行期轮）∥
  运行期未结轮缺 ⇒ 折叠未结末轮照并入（照现）；**同轮 ∥ 异轮不可判**（零跨侧去重键）——所失面 = 异轮 + 活轮记录未及投影窗（旧未结轮暂不并入——随后续落盘投影、下次首屏复现））
  + 折叠（`foldDigest`——**复列全量**（未结轮照现——可证面（扫描结束仍 `open`——处置口径钉定同字）；位次门：`at` 不可得 ⇒ 零产）——记录位次原位）；
  **流内消化行族** `[data-digest]` = **行元素 · 流内就地**（流内普通项——沿两端实形；**行出即留**——行 = 流内事件：出生 = 到达序（当刻流末）；不改 ∥ 不删 ∥ 不退场（零清理机器）；
  零搬移（无搬移机器——结构事实）、随流滚动；不占块序 ∥ 不计 `data-blocks`（沿两端实形——VSC 裁集不含消化行 ∥ CLI 行非块）；
  **行集 = 全轮**（每轮 = [起跑标签行（ask 档行文 = `digest.turnLabelAsk` 携 `from` ∕ `msg`；余 = `digest.turnLabel`；恒在）] +
  [`n > 0` 计数行（**起跑文 = `digest.start`**（携 `n`——「正在消化 N 份后台报告…」；对位 VSC `chat-status.js:82-88`）——**终态不换文**）] +
  [**cap 行（锚 `data-digest-cap`；`mode === "stop"` ⇒ 并 `.digest-cap-stop`；行文 = `digest.capStop` ∕ `digest.capAuto`）**] +
  [**终态行（锚 `data-digest-end`）**——`end` ⇒ **追加一条新行**（词键 `digest.done` ∕ `digest.aborted` 直取——零新键；**不动原 digesting 行**）] +
  [**残余行（锚 `data-digest-residue`）**——`end` 且携 `unsettled > 0` ⇒ 追加（词键 `digest.residue`——核字典直取）；`= 0` ⇒ 零行（机制 = `docs/core/design/AGENT-LOOP-ASYNC-POOL.md` §6.31）]；`n = 0` 轮零计数行 ∥ **零终态行**（守句——禁幻影行；三端同守））；
  行形单源 = `thincoder-vscode/webview/chat-status.js:69-122`；**行族形态（收正——对位 VSC 实形）：无轮容器**——行元素 = 流内并列兄弟（逐行直挂、不做每轮包裹元素；对位 VSC `chat-status.js:72-89` 逐行 `appendChild`）；
  **cap 行 ∥ 终态行 = 到达序追加——两径并存为设计**：**活流径** = 帧到达于**流末**追加（随流尾追——其位可与其族本体不相邻；对位 VSC `chat-status.js:97-105` 到达即 `appendChild`）∥
  **重建径** = **族内紧邻**（`digestRows` 出 [标签行, 计数行?, cap 行?, 终态行?]——重建按记录（族内压缩 = 在册白名单——本档「消化行入流与重放规则」条）；对位 VSC 复列——`docs/vsc/design/WEBVIEW.md` §5.7）；**记录面 = 行族入人读线 `digest` 记录（全量在档）**）；
  **流内压缩状态行** `[data-compress]` = 非块节点组同侧单元素四态（start ∕ done ∕ fallback ∕ failed——形 / 在场 / 生命期 = `docs/desktop/design/IPC.md` §1 `ev:compress` 行；构树面 = `thincoder-desktop/renderer/views/compress-status.mjs`）；**定位 = 流元素冻结点**（单源 = 本档 §1.1 插入点纪律条）
  · **卡序闭集 += `goal`（尾位）**（核件 `renderGoalPanel` 直取；卡序单源 = `thincoder-desktop/renderer/mount-cards.mjs` `CARD_ORDER`）· **`ledgerDetail` 行**（`ev:ledger` `detailLines` 切片 ⇒ 状态行段 11 tooltip 载波，非块节点）；
  **在场 / 出现 / 更新 / 退场路径**：在场 ⟺ 轮集非空（**全轮在流**——行出即留）；
  出现 = 各帧到达即建行于**当刻流末**（`start` ⇒ 新轮起跑——标签行 + `n > 0` 计数行追加（旧轮行留置）；`cap` ⇒ cap 行；`end` ⇒ 终态行追加；起跑后常规新块随流居其下；归档块随到达入流）∥
  行族缺 ∧ **运行期轮**在场 ⇒ 帧内补建（出生点 = 当刻流末；重建径采纳既有行——零重建；**位次轮缺行 ⇒ 回填整置径承接**——记录序复列）∥
  更新 = 零（行出生即定型——**零就地换文**）∥ 退场 = 零（**零清理机器**——行随流上浮；重挂 ∕ 首屏 ∕ 回填整置 = 树面重建——重建轮按记录位次复列（全轮）∥ 未结轮 = 流末）；
  **行元素不占块序 ∥ 不计 `data-blocks`**（重建径在场面 = 记录位次落于已渲染块区——窗口即窗口，同块之退窗）**；插入点 / 根子序与帧尾态刷成员 = 本档 §1.1 两条纪律（两处皆本族点名）；
- **消化行入流与重放规则（消化行 = 流内普通项——到达即入流 ∥ 窗口即窗口 ∥ 记录照留、常规重放 ∥ 行出即留（零清理机器））**：
  **零专用机**——消化行零专设身份 ∥ 落位 ∥ 复列设施（座次类 ∥ 锚类 ∥ 位次类 ∥ 族键类 ∥ 例外条 ∥ 专设步序皆无存——**复入窗**（回填使位次轮入区）**归整置径**（删档 + 新写——记录序重放；零专设身份 ∥ 零寻位 ∥ 零位置存储））。**① 入流 = 到达序**（两端同形：VSC 到达即 `appendChild` ∥ CLI 到达即 `pushLine`）——起跑帧建行于**当刻流末**（起跑后常规新块随流居其下）；
  **同帧批内新到流项按到达序**（起跑帧先发 ∥ 补发后发——`thincoder-desktop/src/main/suspension-drive.mjs:146`（post `ev:digest`）→ `:150`（`reemitDone`））⇒ 起跑窗 [行族][归档块]（用户 01:48 面）；
  **② 新轮 = 追加**（`digest` `start` ⇒ 新轮入模型 · 新行当刻流末建——**旧轮行留置原位**（零摘除））；
  **③ 行 = 流内事件 · 出即留**（出生 = 到达序——`start` ⇒ 起跑两行 ∥ `cap` ⇒ cap 行 ∥ `end` ⇒ **终态行（追加——不动原 digesting 行）**；**零就地换文 ∥ 零标签退场 ∥ 零换代删旧**）；
  **④ 重建 = 记录序重放**（**序判据句（全流层）**：**恢复序 ≡ 记录序**——重放 ∥ 重挂所得序 ⇔ 记录序，记录 = 唯一参照；机检形 = 单元测试档用例 7；
  **白名单两档（合法偏移——穷举登记）** = ① 族内压缩（`digest` `cap`/`end` 记录折入行族——重建径）∥ ② 跨页丢终态（起跑未载的 `cap` ∥ `end` 记录零产——`foldDigest` `open` 闸，防并轮错位；起跑侧照现 = 可证面——重建径）；
  重建径 ∥ 回填整置径全载页域内逐位对账成立——**验收以记录序为唯一参照**；
  **复入窗（前插回填使位次轮入区）⇒ 整置径**（回填 ⇒ 删档 + 新写；缺行者随整置落其记录位次——零位置机具：零寻位 ∥ 零搬移 ∥ 零算术）；重建轮于其记录位次复列（**复列全量（未结轮照现）**——记录位次原位；位次落于已渲染块区之外 ⇒ 零复列——窗口即窗口）；运行期未结轮 = 流末；归档块 = 普通块——记录位次原位出（零配对）；**障碍面在册（上抛）** = 页读域窗口化——跨页丢终态段（`page-read.mjs` `foldDigest` `open` 闸）。
  **⑤ 记录面照留**（轮事件三型全量——零动；折叠 ∥ 清点 ∥ 落盘节律单源 = 本档「留档记录」条）；**⑥ 懒加载径（回填 = 整置——删档 + 新写）**：滚动到顶 ⇒ 加载更早一页 ⇒ **整置重放（记录序）** ⇒ 序不乱（恢复序 ≡ 记录序换窗后仍成立）∥ 行族与其归档块相对序不变 ∥ **零位置机具**（零寻位 ∥ 零搬移 ∥ 零算术——行族随整置按记录序全量复列；视口锚定 = 帧出口补偿算式承接）。
  **承载件身份**：帧管线 ∥ 块管线本体 ∥ 记录面 = 承载面（保留；改承载件 ≠ 拆前提——单源 = 本档 §3 六步序步①：入流步）。
  **块归档面**（**起跑窗**：消化起跑点（`ev:digest start` 发帧点）= 对本轮将消费驻留条目（起跑快照）逐条补发 `ev:subagent { status: "done" }`（复用 `reemitDone`——consult 会话条目 ⇒ 按其 `childIds` 逐子块补发；
  `thincoder-desktop/src/main/suspension-drive.mjs` 起跑支——**主面**；`hooks.reclaim` = **兜底幂等**；**三端同形**——
  VSC ∥ CLI 各起跑点逐条补发同形、各 `reclaim` 兜底幂等（对位 VSC `thincoder-vscode/src/extension/suspension.mjs:112-119` 逐条补发 ∥ CLI `thincoder-cli/src/tui/suspension-drive.mjs:212` reclaim → `freezeReclaimDigestedBlocks`））——
  `settled` 待消化块（**含非挂起态 settle**）归档入流（落位 = **随到达入流**——本档 §1.1「消化行入流与重放规则」条）；
  退出 freeze = 兜底同型（`ev:susp {active:false}` 径——对位 VSC `thincoder-vscode/src/extension/suspension.mjs:132-135` freeze 消息）；迟来 `done`（族已离流末）⇒ 随到入流（退化档沿））；
  状态行段 3 三态与词键 = `docs/desktop/design/IPC.md` §1「挂起 ∕ 消化词键注」。
- **池切片清点口径**：池条目入池 = `ev:tool-call`（开始）、`ev:tool-result` 只收束 `status`——**清点 = 全量在场**（收束不摘除 ⇒ 长会话池切片单调增长）；
  **窗限 / 归档 = open**（登记 = `docs/desktop/design/UI.md` §2 项 1）；**队列族** = **零写者 · 席位保留**（用户排队消息改宿主单源 + `pending` 镜面；单源 = `docs/desktop/design/UI.md` §1「批注（回合中插入 · 步边界 pickup）」项 2）。
- **回合尾三径**：回合尾 = `ev:activity`（无 `fields`）的 `done` ∨ `stopped` ∨ **`ev:error`**（宿主错误结算——`ev:error` 行单源 = `docs/desktop/design/IPC.md` §1）；三径**同判据**（谓词 `isTurnTail` 住 `thincoder-desktop/renderer/events.mjs`）：**谓词入参形（点名）** = 吃**两通道形**——
  `ev:activity`〔**无** `fields`〕∧ `event ∈ {done, stopped}` ⇒ 真 ∥ `ev:error`（单形载荷 `{ key, message }`——单源 = `docs/desktop/design/IPC.md` §1）⇒ 真 ∥ 余 ⇒ 假（两通道**同调此谓词**——消费面 = 回合尾标题刷新（「回合中插入」批后）；谓词体吃 `ev:activity` ∥ `ev:error` 两形）：错误径 ⇒ 本键 `running` 清 + 位落 `done`（落点 = 归约面 `onError`）；
  消费面两处：回合尾标题刷新（`thincoder-desktop/renderer/events-subscribe.mjs`——判据命中即刷）· `stopped` 兼清本键提问项（本档「卡面在场与随动」条）；**输入区 flush 携行退场（`onTurnTail` 窄口存续——标题刷新消费面不动）**
  （队列消费 = 宿主驱动——步边界注入 ∕ 回合尾送达；**`ev:queue` 归约两形** = 状态形 ⇒ 镜面整置 ∕ 消费回执形 ⇒ 镜面整置 + `delivered` ⇒ 用户块入流 + `degraded` ⇒ 提示面；单源 = `docs/desktop/design/PROJECT.md` §2 KD-40）。
- **回填接线口径（接线态）**：`onBackfill` 出口与只读口 `guards()` 两读数**同刻接线**——`hasOlder` 源 = `history.hasOlder`（页回执落态）· `inFlight` = 回填在途（`beginBackfill` / `endBackfill` 置清）；触发三步判据 = 本档 §3；摘要块在场仍以 `data-hidden` 为判据（`guards` 不参与树形）。
- **描述符规格**：`{ tag, props, children }` —— `tag` 必填；`props` = 属性 / 事件（`on*` 键 = 监听器；`true` = 布林属性；`false` / `null` / `undefined` = 不落）；`children` = 子描述符 / 裸串（裸串 = 文本节点；`null` = 空位跳过）。**唯一构造点** = `thincoder-desktop/renderer/dom.mjs` 的 `build(node)`（递归；入参面与同档 `el()` 同形）。
- **接线形通则**：视图档收 handlers 面的控制项**两态落形**——handlers 给 ⇒ 落 `onClick`（携带本项键）、**不落** `disabled`；缺省 ⇒ `disabled: true` + `data-action` 机读锚（**诚实非死控**：不落假接线、不留死控件）——树形**只随 handlers 变**，不随状态另定形。
- **键盘面（接线第二口径）**：挂载面可自挂 `keydown`（既有 = 审批卡根（`thincoder-desktop/renderer/views/approval.mjs`）；设置面 Esc 关闭 = `docs/desktop/design/UI.md` §1「批注（对齐第三批 · 小修族）」F-Esc；会话控制面选择器 = `thincoder-desktop/renderer/views/session-control.mjs`）——**命中才** `preventDefault`；形态单源 = `docs/desktop/design/UI.md` §1 交互行。
- **页生命周期（接线第三口径）**：页键写者**单源** = `openSession`（`thincoder-desktop/renderer/events.mjs`：键 `null` ⇒ 关页 · 开页清本键 `done` 位标）；开页路 = `openPage` / `activateSession` / `createSession`（`thincoder-desktop/renderer/mount-sessions.mjs`——共用尾 `openResult`）——会话键（`String(slot)`）与页键 `activeSession` **同刻随动**。
- **删会话 ⇒ 页随动（零新路）**：出口**共用尾** —— 删**活动**会话 ⇒ **邻位接管**（同位置行，越界取末行 ⇒ `session:switch` 同一路）；
  列表空 ⇒ `openSession(state, null)` 关页（中区 `none` 态 = **零块节点**〔不新造空态视觉〕+ 引导节点（`data-guide`——形态单源 = `docs/desktop/design/UI.md` §1「首启空白态引导注」项 1））；删**非活动** / 拒收（末项门 ∕ 槽缺）⇒ **零动作**（键未变 ⇒ 页不动）。
- **删除会话（左列行控件）⇒ 同源出口**：`session:delete` 回执 `ok` ⇒ 键面 `closeTab(本键)` + 上条关闭尾（活动 ⇒ 邻位接管 · 唯一 ⇒ 关页）；`ok:false`（核拒）⇒ 零动作（**不造死标签**——已删键的 `session:switch` 必拒）。
- **幽灵更新（已覆盖 · 零新增机制）**：块面 / 页写既有键过滤（`ev.key === state.activeSession`）⇒ 关页后已关会话的到达事件零入块面；`sessionMeta` / `tabBadges` 仍写已关键，而标签条只遍历 `tabs` ⇒ 零可见影响（登记为观察，不新增过滤）。
- **页窗暂留（登记 · 非新增）**：页键变更至邻位页回执落之间，屏上暂留前页块（既有口径：页数据随 `history:page` 回执整置）；消解需第三态「载入中」= 新词键 / 新形态 ⇒ 新需求面，不落。
- **判据**：纯构树**零 DOM** ⇒ 视图行为可在平 node 直测（断言描述符树：机器读面用 `data-*` 承载，不依赖 DOM 实现）；挂载函数不进自动面（DOM 面随人工走查）。
- **文案纪律**：视图档内面向用户字符串**一律经 `t()`**（词表面）——档内零硬编码文案（含英文；机检 = 词表键哨兵 / 源扫描）。
- **流面作业单（事件自带——谁变谁写）**：结构变更由**发生点**带上作业（`state.flowOps` 有序单；写口单点 = `thincoder-desktop/renderer/store.mjs` `withFlowOp`——与 `blocks` 写同笔）：`{ kind: "build" }`（整置——页回执首屏 ∥ **回填页并入** ∥ 换会话 ∥ 关页 ∥ 退流清空（本地先行回声摘空 ⇒ 空态引导面复现））·
    `{ kind: "insert", index }`（按位插入——座次位）· `{ kind: "cut", index }`（退流——本地先行回声按引用摘）；
  **新块到达零作业**（追加为常规路径——由账自明，见下条）。
  **清账 = 两径同清（构造径亦清 ∥ 结算径亦清）**——消 `build` 作业粘滞；**root 缺位 ⇒ 不清**——未消费不退账。
- **流面结算步（判据）**：每帧以**账**（上帧 DOM 所覆盖块列 + 隐藏数）对本帧模型窗做**整数结算**——纯件 = `flowStep({ account, model, ops })`（落点 = `thincoder-desktop/renderer/views/chat-stream.mjs`）：项位次 = 账位 + 作业回放（`insert` ⇒ 位次 ≥ 索引者后移 ∥ `cut` ⇒ 命中摘除 ∥ 其后前移——纯加减）；
  留判 = 落于目标窗；**摘 = 按数**（头段越位项）∥ **造 = 给没有节点的内容造节点**（窗位缺账项者——头段此前插 ∥ 尾段此追加 ∥ 中洞此就位；插点锚 = 其后首账项，无 ⇒ 尾插点 `blockAnchor`）∥
  **刷 = 就地**（留位且块对象变者——`refreshNode`）。**无逐位配对判定 ∥ 无全或无判决**（每项各自留 ∥ 摘 ∥ 造 ∥ 刷——结算必达）。
- **建（构造径——给没有节点的内容造节点）**：同一构造面（`mountChat`：清 ∥ 建树 ∥ 快照复填）覆盖三触发——**首帧**（无账）· **整置**（页回执首屏 ∥ **回填页并入** ∥ 换会话 ∥ 关页（唯一会话删除 ∥ 列表空，`openSession(state, null)` 同笔带作业；`none` 态引导面由本径承接）∥ 退流清空（本地先行回声摘空 ⇒ 空态引导面复现）——承载 = `{ kind: "build" }` 作业）· **词面变**（`locale` 变 ⇒ 内容须换词面——判据 = 帧内单标量比对）。
  三触发同径同形；滚动 ∥ 焦点 ∥ 草稿保真 = 快照族承担（本档 §1.1 快照复填条）。
  **`project` 键承接 = 刷面**（键变 ⇒ 帧尾态刷条 `syncGuide` 原位换——`no-project` ↔ `no-session`；建 = 本条构造面；零重挂 ∥ 零静默丢失）。
- **帧尾态刷（刷新面单点）**：每帧末尾一处 `syncChrome(root, model)`（帧尾态刷出档 = `thincoder-desktop/renderer/views/chat-chrome.mjs`——帧尾调用点 = `thincoder-desktop/renderer/views/chat.mjs` `settleFrame` ③；
  构造径调用点 = `thincoder-desktop/renderer/app.mjs`（两处构造支）· 幂等 · 与结算面解耦——`none` 帧同刷 = 无帧豁免）⇒ 根锚四（语义单源 = 本档 §2 / `docs/desktop/design/UI.md` §1 对话流行）+ 两控件（摘要块 `hidden > 0` · 药丸 `!following`）
  + **消化行族**（`[data-digest]`——**全轮行族（行出即留——零清理） · 流内就地**（无轮容器——行元素并列兄弟）；**入流 = 到达序**（同帧批内行族出生先于补发块——单源 = 本档 §1.1「消化行入流与重放规则」条）；
  在场 ∕ 出现 ∕ 更新 ∕ 退场 = 本档 §1.1 归约面条）——
  **待发送带不在流内**（住输入区上方带：消费面 = `thincoder-desktop/renderer/mount-composer.mjs` `paintNotices`；数据源 = `pending` 镜面非空判据——两源：忙态队 ∪ 挂起窗输入队）
  + **帮助行族**（`[data-help]`——当次打印行族（单枚进场 · 重印换代同枚——零搬移）· **尾组槽位**；构树 ∥ 帧刷 ∥ 锚单源 = `renderer/views/chat-chrome.mjs`；「slash 面增量（`/help`）」）
  + **引导节点**（判据 = `model.guide` 空否——`none` / `empty` 帧由重挂面建 · `flow` 帧由本刷面摘）在场与文本随判据；`none` 态零块节点不破（只摘不插）。
- **插入点纪律**：块节点插入点 = 首个**尾组** ∕ 卡节点之前——**常规新块随流居消化行元素之下**（消化行 = 流内普通项，不入插点链——新块随流自然落其下）（流内就地序 = CLI `docs/cli/design/TUI.md` §6.9 ∥ VSC `thincoder-vscode/webview/ui.js:102`）；
  **归档块（`kind: "subagent"`）落位 = 随到达入流（当刻流末）**（用户 2026-10-01 01:48「放在已消化1份后台报告那一行后面」——与 18:49 起跑窗 = 同一体两面；**三端同形**：VSC ∥ CLI 随正（VSC 对位 `thincoder-vscode/webview/activity.js:104-110`——其端自持形；本端 = 到达序））：
  **规则 = 当刻流末**（行族在流末时即「放族后」；迟到 ⇒ 随到入流；**零存储 ∥ 零界锚设施 ∥ 零到达序标**——单源 = 本档「消化行入流与重放规则」条）；
  模型 ∥ DOM 同判（常规块插入点）⇒ 文档序 [.. 块][行族][归档块][行内后产块 ..]（起跑窗内成立——**同帧批内新到流项按到达序落位**（起跑先 ∥ 补发后）——单源 = 本档「消化行入流与重放规则」条）、本档 §2 不变式（DOM ≡ `visible`）零破（帧径 = **流面结算步**承接——单源 = 本档 §1.1「流面结算步」条）；
  尾组族内序 = 到期触发行组 → 停止痕 → **帮助行族**（消化行族元素恒居尾组之前）；压缩行 = 流元素冻结点，**不在块插入点上**（VSC D-C3 append-once——创建点定位后新块随流居其下；其后创建的族员 ∕ 卡 ∕ 药丸自然落其后）；
  **卡四类** = `[data-card="approval"]` / `[data-card="question"]` / `[data-card="task"]` / `[data-card="goal"]`，卡间 DOM 次序固定 = 待审批 → 提问 → 计划 → **目标**（缺者跳过）；无尾组无卡 ⇒ `[data-pill]` 之前；两锚皆缺 ⇒ 末位；
  根子序（构树 ∕ 重建）= [摘要块?] → **流序**（块序列 × 消化行族——**记录序重放**：重建轮于其记录位次复列（未结轮照现）∥ 运行期未结轮 = 流末；活流 = 到达序就地）→
  [压缩行?] → [到期触发行组?] → [停止痕?] → [帮助行族?] → [卡序列?] → [药丸?]（**活流序 = 就地**——各帧行落流末、随流居其位；
  重建径 = 记录序重放（复列 = **全量**（未结轮照现；记录位次原位））；**待发送带不在流内**——住输入区上方带；重建 ⇒ 压缩行重植于块序列之后 = 该时刻新冻结点，其下新内容随流——VSC「重建即清」对位 = 桌面常驻重植，生命期单源 = `docs/desktop/design/IPC.md` §1 `ev:compress` 行）。
- **引导节点（非块节点）**：无活动会话 ∥ 零块 ⇒ 引导节点 `div.chat-empty[data-guide]`——`none` 帧 = 根**唯一子** · `empty` 帧 = **首子**（在块序列 / 卡序列之前）· `flow` 帧 = 不在场；零 `data-block-id` ⇒ **不入块序**（上条根子序与 `data-blocks` 不变式不受其影响）。
  判据（模型 `guide` 字段）= 无活动会话 ⇒ `cwd` 缺 ? `no-project` : `no-session`；有活动会话 ∧ 可见块 0 ⇒ `no-message`；否则 `null`。
  构树 = `thincoder-desktop/renderer/views/chat-guide.mjs`（流内非块节点构树）；**动作控件在场 ⟺ 句柄在场**（`onOpenDir` / `onNewSession` 缺 ⇒ 整控件缺席——比接线形通则更严：零假按钮）；
  引导面随项目变（**`project` 键承接 = 刷面**——单源 = 本档 §1.1「建」条；零重挂）；形态单源 = `docs/desktop/design/UI.md` §1「首启空白态引导注」项 1 / 2。
- **卡面在场与随动（帧尾态刷）**：卡节点 `[data-card="approval"]` / `[data-card="question"]` / `[data-card="task"]` / `[data-card="goal"]` 的在场与文本随帧内判据刷（形态单源 = `docs/desktop/design/UI.md` §1 审批呈现 / 提问呈现 / 计划面 / 目标面板四行）；`question` 卡**退场非乐观**（回执 `ok` 真 ⇒ 清除；失败 ⇒ 卡留可重试 + `console.error`——出口口径见该行；
  **中断径** = `msg:interrupt` ⇒ 本键各门按取消结算 ⇒ 终局 `stopped` ⇒ **事件面摘本键提问项** + 清位标（**清码判据 = 全族皆清**（审批 ∥ 提问 ∥ 凭据三族）——单源 = `docs/desktop/design/UI.md` §2 项 2）——判据 = 终局事件面，非回执（单源 = 本档「回合尾三径」条））；
  **四卡**皆**非块节点** ⇒ 不入块序不变式（本档 §2），块面比较对与 `data-blocks` 语义不受其影响。
- **流内非块节点族**：**消化行族** `[data-digest]`（**全轮行族 —— 行出即留 · 流内普通项**——无轮容器（行元素 = 流内并列兄弟）；行集 = 全轮（起跑标签行 + `n > 0` 计数行 + cap 行（锚 `data-digest-cap`）+ **终态行（锚 `data-digest-end`）**——**cap 行 ∥ 终态行 = 到达序追加**（两径差异 = 在册行为——单源 = 本档 §1.1 流内消化行族条））；
  落点 = **流内就地**（活流行 = 各帧落流末 ∥ 位次轮 = 整置径记录序复列——单源 = 本档「消化行入流与重放规则」条；归档块落位 ∕ 常规新块序 = 本档 §1.1 插入点纪律条）；在场 / 更新 / 退场 = 本档 §1.1 事件归约面条）；
  **帮助行族** `[data-help]`：**当次打印行族（单枚进场 · 重印换代同枚——零搬移）· 尾组槽位**（卡序列之前；锚 = `helpAnchorOf`（`[data-card] ?? [data-pill]`）——`renderer/views/chat-chrome.mjs`）；
  行集 = `{ kind, text }` 行集逐行（`label` ∥ `group` ∥ `cmd`——`data-help-line` + `data-help-kind`）；**非块节点**（零 `data-block-id` ⇒ 不占块序 ∥ 不动 `data-blocks` 不变式）；
  在场 ⟺ 本键 `helpLines` 切片在场（内容逐行等价 ⇒ 零写）；**运行期痕 · 清点两门**（首屏页读整置即失——`clearHelpLines` ∥ **回合起跑门** = `msg:send` 出站即清——`clearTurnTraces`；单源 = 本档 §1.6 **KD-74**）；写者 = 端装配面 `printHelp` 口（`renderer/mount-composer.mjs`——行文 = 表本体经核 `formatHelp`；经 store 纯动作 `setHelpLines`）；
  **归档子 agent 块**（`data-block-kind="subagent"`——**是块节点**（入块序 / 计 `data-blocks`；壳 = 零边距透传容器 + 内嵌核件元素）——**留档块**：入**页读域**（计 `data-hidden` ∥ 可回填 ∥ 退窗折摘要块）；记录形 `{ kind: "subagent", meta, rows }`（与活流归档同一形状）。
- **留档记录**：记录**形 ∥ 写缝 ∥ 读缝契约 ∥ 重建义务 ∥ 容差登记**单源 = `docs/core/design/SESSION.md` §6.26（跨端单源——本档不复述）。
  **本端承接面**：产读两面同上核节——产 = 宿主发帧点**同点双动作**（`cap` 帧点 = `thincoder-desktop/src/main/turn-face.mjs:139` ∥ `:140`）∥ 渲染面归档派生点经 `record:append` 通道（快照含非活动键）；
  读 = 页读直通（核 `historyWindow` opt-in `{ records: true }`）+ **折叠重建**（`digest` 记录 ⇒ **复列全量**（逐轮携位次 `at` = 起跑记录全局 `idx`——记录位次原位；**未结轮照现**（可证面 = 轮间 ∥ 末页（扫描结束仍 `open`——处置口径钉定同字））+ **位次门**（`at` 不可得 ⇒ 该轮零产）；
  跨页截断 ⇒ 起跑未载的 `cap` ∥ `end` 记录零产——容差①）；`subagent` 记录 ⇒ 留档块（`blockOfMessage` 同形——**记录位次原位**（重放序——零配对））；
  **他端记录读面归一**：CLI ∥ VSC 记录读入 ⇒ 留档块同形（缺位字段补形）——落点 = `thincoder-desktop/renderer/page-read.mjs`（`blockOfMessage` subagent 支）；判据 = `docs/core/design/SESSION.md` §6.26 读面归一义务。
  **落盘节律** = 与消息同节律（人读线段即时 ∥ 槽文件回合尾投影）；
  **`end` 记录写点前移**（结算序先于槽落盘——消「收束后即时重载末轮痕缺」；
  落点 = `thincoder-desktop/src/main/turn-face.mjs` `emitDigestEnd` `:168-175` ∥ 两径结算前调用 `:178` ∥ `:183` ∥ `thincoder-desktop/src/main/suspension-drive.mjs` 收尾移出 `:130-140`）；
  **写面薄壳（端核契约 · 登记）** = 端 `appendRecord`（`thincoder-desktop/src/main/session-io.mjs`）现行 = 复用核 `pushReal` 半提取载体形（字段面 `_fullHistory` ∥ `_recordStore` ∥ `_historyWindow` = 隐式契约；行为面钉守 = 单元测试档用例 1a）——**消解路径** = 端壳下次触碰改调核 `pushRecord` 单点（行为等价）；
  **边界** = 记录不入机器线 ∥ 重建径置位规则与活流同一套（随到入流 ∕ 记录序重放 ∥ `blockAnchor` 复用——**该名 = 端面现行导出名；零动作**）∥
  **容差（2 · 桌面侧状态）** = 同 `docs/core/design/SESSION.md` §6.26 容差登记 ①/②（桌面侧特异半句 = ① 页界落于轮记录之间；② 快照产生面「渲染面异步出站」——下一落盘承接）。
- **到期触发行**：`ev:timer` ⇒ 归约写 `state.timerNotice[key]` 切片 ∧ `thincoder-desktop/renderer/views/chat.mjs` 流内行组（非块节点 · 不入块序——**与 `[data-digest]` 行同族**）；行文 = 交付原文（显示裁 ≤3 行 + `…`）；
  在场 / 退场路径 = **两门**（**首屏门** = 随页读整置即失——沿 `[data-stopped]` 先例；**回合起跑门** = `msg:send` 出站即清；晚到（出站后到期）照写照显 · 留至下一回合门）；
  落点 = `thincoder-desktop/renderer/page-read.mjs` ∕ `views/chat-chrome.mjs` `syncTimer`（幂等 ∕ 换代原位换 ∕ 缺席摘）；清点面单源 = 本档 §1.6 **KD-74**；事件面单源 = `docs/desktop/design/IPC.md` §1。
- **池面挂载（键控差分 · 壳原位领用）**：**三径** = ① `none` / `empty` ⇒ `clear` + 零节点（无滚动件）② 壳缺位（首挂 ∕ 换代后）⇒ 建树全挂 ③ **壳在位 ∧ `pool` ⇒ 原位领用**——
  **头 = 逐件就地差分**（件面 = 标题 ∥ `[data-read]` 读数 ∥ 折叠控件——就地更新；旁挂计数钮 `.activity-new-btn` **身份存续**）；待审批族 ∥ 队列族 = **键控差分**（条目按 `promptId` ∥ 标题复用）；
  **子 agent 族容器（含 `[data-pool-body]` 祖先链）零摘离 ∕ 零移动**（块内容区位 ∕ 池自身滚动位跨帧**保真**——链不稳定则位面归零）；
  **子 agent 族按 key 复用元素**（`el._subMeta === model` 判据：同 key 跨帧同一元素——内容追加 / 折叠态 / ⏹ 全走核函数，**不重建**）；
  **帧触发判据 = 触碰块换对象引用**（`archiveIntoFlow` 按核 `effects` 键集对被触碰块**换新引用**——未触碰块保原引用 ⇒ 帧比较对逐位引用即定触发，沿本档 §2 帧面分派同源）；
   形态单源 = `docs/desktop/design/UI.md` §1「批注（对齐第二批 · 六件）」项 3（KD-32 同裁 = `docs/desktop/design/PROJECT.md` §2）。
- **键域与换代**：元素复用键域 = **会话内**（容器跨帧常驻不承旧账——同键重现于另一会话 ⇒ 元素账复位 ∕ 换代，禁沿用旧会话行账——relay id 按 agent 实例自 1 起计，同键跨会话重现属常态）；**换元素径**（新代接管）须**挂载后末刷**（⏹ 门控读 `isConnected`——与首见径同序）。
- **1s 拍面**：`thincoder-desktop/renderer/heartbeat.mjs`——拍体 = 在飞块逐块核件 `refreshBlock`（封装 = `refreshLiveBlocks`）+ 状态行重挂（`paintStatus`——装配单点 = `thincoder-desktop/renderer/app.mjs:269-276`）；**判据三件同序** = `_subMeta` 在场 ∧ `!frozen` ∧ 在连（逐值同 VSC `thincoder-vscode/webview/activity.js:149-153`）。
- **设置面与向导形**：两形构树（`thincoder-desktop/renderer/views/settings.mjs` 四段面〔渠道 / 模型 / agent 参数 / MCP〕· `thincoder-desktop/renderer/views/onboarding.mjs` 三步向导——纯描述符 + 薄挂载，形态单源 = `docs/desktop/design/UI.md` §1）· 接线出档 = `thincoder-desktop/renderer/mount-settings.mjs`（自 `app.mjs` 拆出）；
  **零新事件通道**——读数 / 写入全走请求通道：写成功**同回带** `{ locale, dict, configured }` ⇒ `initDict` 重刷 + 向导闸随新档态（**免二跳重调**）；填 key 经 `provider:verify` 真调一次；**闸 = `configured`**（档存在性——向导不进 / 设置面可进 + 明示不可读；零静默重置）。
  **容器面**：挂载根 = `index.html` 单容器 `[data-slot="settings"]` 自身（窗口级覆盖层面——设置树 / 向导树**互斥**占槽：`configured` 假 ⇒ 向导树占位；退场 = `clear` 清空容器 ⇒ 主 UI 可用）。
  **退场口径（子节点面 ∥ 属性面）**：退场 = `clear` 清空容器（子节点面）**+ 薄挂载属性应收**——挂载期所加宿主属性须有复位回路；判据 = **退场后宿主属性集 ⊆ 挂载前属性集**（只增不减 ⇒ 判据不达）；**回路已落 · 单源 = `thincoder-desktop/renderer/views/settings.mjs` `syncHostProps`**（复位表 = `root` → 上次薄挂载所落属性名集 · 未再声明者摘除 · 骨架属性零动）——三挂载共用（设置 / 向导 / 信息行）。
  `removeAttribute` 两命中 = `thincoder-desktop/renderer/views/chat.mjs:227`（`data-streaming` 摘除）+ `thincoder-desktop/renderer/views/settings.mjs:281`（复位表摘除）；**长驻两面** = `thincoder-desktop/renderer/views/{chat,activity}.mjs`（:134 / :167）**无复位回路 ⇒ 码面池**（属性名集常量〔`chromeProps` 四名 · 池树两名〕⇒ 跨重绘不增 ⇒ 现值零残留）。

- **用户块（写者与出泡时刻）**：活流 `user` 块两写者 = **发送面**（`msg:send` 回执 `ok` 真——直发径本地先行）+ **排队消费回执**（`ev:queue.delivered`——**五时刻**：步边界注入 ∕ 回合尾续发 ∥ **窗步边界消费** ∕ **窗内消费 ∕ 残续发**）；
  裁决与边界 = `docs/desktop/design/PROJECT.md` §2 KD-23 / KD-40）+ **挂起窗径抑制面**：窗内提交零本地块（`onUserEcho` 判据 = `busyOf ∨ suspActiveOf`）⇒ 块唯一来源 = 消费回执；直发径「回执言队形」（含窗内受理）⇒ 本地块**退流**（终态 = 消费前流内零块）；
  失败径 ⇒ 本地块退流（零块）+ 失败行 + 稿留输入历史；**键门**（回执键 = 现刻 `activeSession`，非活动 ⇒ 零写；
  **在飞回合内切回** ⇒ 本回合用户块随回合尾落盘后、于下次页读在场——页读 = `thincoder-desktop/src/main/session-slots.mjs:123` / `:145`；槽落盘在回合尾 = `thincoder-desktop/src/main/agent-host.mjs:214` / `:219`）；
  块形 = `{ kind: "user", text, ts? }`（**与 `blockOfMessage` 回放块同形**——无 `id` ⇒ 键域回落位序，同回放；`ts` = 提交 ∕ 入队现刻——「对齐第二批」项 4 载波，非有限数 ⇒ 键缺席）·
  写入走 `appendBlock`（**既有**纯动作——`thincoder-desktop/renderer/store.mjs:73` 导出，归约面 `thincoder-desktop/renderer/events.mjs:21` / `:97` / `:105` / `:220` 四处已消费；`pendingNew` 语义同源）· 二十五通道零 `user` 通道（写入时刻 = 受理时刻 ⇒ 活流块 ⟺ 已受理）。
- **流式游标清点**：清点两族 = ① 回合尾三径（`done` / `stopped` ∨ `ev:error`）② **段界**（`ev:tool-call` 入场 ⇒ 助手文本段收束）；
  清点**须落块面引用**（新块对象 ⇒ `blocks` 键变 ⇒ 帧触发 ⇒ 就地更新摘 `data-streaming` 锚——旁路态无刷新路径 = 缺陷成因面）· 辅助与两族调用点住归约面（`thincoder-desktop/renderer/events.mjs`）· 游标语义 = **末块追加态**（形态单源 = `docs/desktop/design/UI.md` §1「批注（可见面修复 · 四件）」项 3 · 裁决 = `docs/desktop/design/PROJECT.md` §2 KD-24）。
- **文本段行形态通则**：行内 ≥2 文本段（flex 行：`gap` ∨ `space-between`）⇒ **逐段包元素**（`span[data-seg="<段码>"]`；段缺席 ⇒ 零节点——空段仍占 flex 项 ⇒ 假间隔）；
  **裸串不得直作 flex 行子**（相邻文本节点合为单一匿名项 ⇒ `gap` / `space-between` 静默失效）；逐处段码与取舍 = `docs/desktop/design/UI.md` §1「批注（可见面修复 · 四件）」项 4。
- **重建保真族**：重建面位 ∕ 焦点保真**二分修形**——**身份保真 = 键控差分**（同一元素跨帧复用：会话控制条条目按会话键 ∕ 池两族按 `promptId` ∕ 条目 `title`——治跨帧点按丢击 ∕ 原生控件开态被销毁）；
  **改名草稿面（会话条）**：键控差分下输入节点跨帧存续（值 ∕ 光标 ∕ 焦点 ∕ 草稿四项皆保）；
  **位置 ∕ 状态保真 = 快照复填**（`thincoder-desktop/renderer/view-state.mjs`：`captureView(root)` ∕ `restoreView(root, snap)`——`snap = { scrolls, drafts, focus }`；focus 键回退链 = `id` → `data-field` → `data-action` → 结构路径兜底）。
  **对话流构造径**（首帧 ∥ 整置 ∥ 词面变——本档「建」条）：构造前捕 `root.scrollTop` + 归档块展开集（`[data-block-id]` 键）——`following` 真 ⇒ `stickToBottom(root)`；假 ⇒ 复原 scrollTop + 展开集（`open` 回真，不强制关闭）；其余四面（会话条 ∕ 状态行 ∕ 池 ∕ 卡面）以 `captureView` ∕ `restoreView` 包重建。
  **两处滚位例外**：池（`mount-pool.mjs`）滚位复填仅未跟底（`_poolPin === false`）时执行（跟底帧尾钉底已写位——复填会夺位）；卡面（`mount-cards.mjs`）滚位不复填（挂载根 = 对话流共享滚动容器——滚位归对话流面帧尾律）。
  **设置面草稿保真闸**（挂闸单点 = `paintSettings`（`thincoder-desktop/renderer/mount-settings.mjs:111-114`）⇒ 设置 ∕ 向导两树一闸）：挂载前捕获草稿、重建后复填（值 ∕ `checked` ∕ 焦点 ∕ 光标区间 ∕ 根 scrollTop）；
  捕获域 = 携 `[data-draft]` 标记的表单控件（键 = 控件 `id`，无 `id` ⇒ 标记取值）——非申报控件 ⇒ 取新模型值（负向锁）；`thincoder-desktop/renderer/views/settings.mjs` ∕ `thincoder-desktop/renderer/views/onboarding.mjs` 零改（越线档零增行）。
  **机制扩展三件**：① 未落件（残件）跨**在途**重绘携带（树定型即弃——免陈值复活）② 草稿作用域 `data-draft-scope`（表单身份换 ⇒ 旧草稿不复填——免 add→edit 串值）③ 同键多例捕获位序 `nth` 消歧（设置树两表单 `id` 重复）。三件皆加法、皆在同一重绘单点内，无新重绘径。
  **弱项两件**：归档块重放（`views/chat-subagent.mjs` `echoOf` 重建）⇒ 展开集复填覆盖（`fillSubagentEcho` 幂等保持）；提示带重建（`composer-sync.mjs:122-136` `paintNotices`）⇒ **行集等价零写门**（行签名同 ⇒ 零写；变 ⇒ 原位改文本 ∕ 最小重建）。判据 = M-604 a–c ∕ M-606 a–c + 真机 P1–P5。

### 1.2 更新纪律：帧合并

**把 VSC 已付的轮子收核、桌面消费：**触发源 = store 变更 · 更新纪律收核**。机制单源 = `docs/render-core/design/RENDER-CORE.md` §2 **KD-RC-9**；本档只落接入面。

- **帧出口唯一化**：`store` 订阅 ⇒ `frame.mark(changedKeys)`（**O(1) 脏键集**——订阅回调零渲染）；帧触发后按键集分派五面（会话控制条 ∕ 状态行 ∕ 对话流 ∕ 池区 ∕ 卡面）——**每面每帧至多一次**（分派件 = `thincoder-desktop/renderer/frame-dispatch.mjs`；**帧时刻现读 `store.get()`**——禁 mark 时刻取态快照）。
- **帧合并件 = 核 `flow/frame.mjs` `createFrameMerge`**（脏标记 ∕ 帧合并 ∕ 应用器契约）：单飞 rAF + `FRAME_MIN_MS`（50——与核 `createStreamRenderer` 同值同意）；
  `flush()` = 同步尾帧（消费点 = 回底顺序保真（app 侧回底入口 `returnToLatest`——`thincoder-desktop/renderer/app.mjs:152`；内调 store 纯动作 `returnToBottom`——`thincoder-desktop/renderer/store.mjs:160`）+ 测试 ∕ 探针确定性）。
- **应用器契约**（KD-RC-9）：① 增量更新为默认（尾块就地 ∕ O(1) 追加 ∕ 面内差分；整面重挂仅判据命中）② 布局节俭（读数仅帧内、按档裁剪——禁逐 chunk 强制布局）③ 帧尾动作（滚动 ∕ 钉底 ∕ gating）落各面尾段、每帧至多一次 ④ 每 chunk 同步成本禁 ∝ 累计文本。
- **逐面落点**：会话流正文 ∕ 推理 = 帧界 + 尾块就地 md 重渲（核 `paintStreamTarget` ∕ `paintReasoningTarget`——帧内至多一次）；工具卡 = **就地更新**（头行分段刷 + 结果区核 `appendToolOutput` O(1) 追加——零重建）；状态行 = 帧界 + 面内差分门（模型等价 ⇒ 零写）；池区 = 帧界（壳原位领用 = 让位修复批在册面）；卡面 ∕ 会话条 = 帧界（低频键面）。
- **尾块增量 md 与帧内组合**：① 尾块文本面（正文 ∕ 推理）重渲 = 核**增量 md 画件**（冻结前缀零重渲 + 热区换代——机制单源 = `docs/render-core/design/RENDER-CORE.md` §2 **KD-RC-10**；桌面 `views/chat-text.mjs` 调用点零改——`paintStreamTarget` 同签名）；
  ② **帧内组合（就地改 + 追加）**：结算步天然同帧两动作（`flowStep` 刷项 + 尾段造项——`settleFrame` 同帧执行）——每新块边界的全面构造消（构造只余三触发——本档 §1.1「建」条）。

### 1.3 chrome 级直写面：右栏宽度拖动（D30）

- **面判定**：本面 = **chrome 级直写**（不落 store 切片 ∥ 不进帧分派面表 ∥ 零 IPC）——先例 = 滚动面（直写 DOM ∥ 事件自持）；**零 `store` ∥ 零 `events` 依赖**（宽度零自动源——机检负控用例）。
- **模块缝**（已落 `thincoder-desktop/renderer/pool-width.mjs`）：注入缝 `{ doc, win, storage, root }`（缺省 = `document` / `window` / `localStorage` ∕ 锚查询）⇒ 平 node 直测；纯函数 = 值解析（非正有限数 ⇒ `null`）；
  导出 = `initPoolWidth`（装配入口：读存储 ⇒ 内联 `--pool-w` ⇒ 拖柄接线）∥ `refreshResizerLabel`（`t("pool.resize")` ⇒ `aria-label`）；**写径 = CSSOM**（`documentElement.style.setProperty("--pool-w", …)` 变量写；**`style` 属性写径列禁径**——平台行为未核）。
- **装配两点**（`thincoder-desktop/renderer/app.mjs`）：① 装配期一次 `initPoolWidth()`——**先于首绘可及面**（引导层在场期完成 ⇒ 零可见跳变）；② 帧分派 `locale` 支一调 `refreshResizerLabel()`（词表到位 ∥ 语言切换随动——单点）。
- **交互三段**（形态 ∥ 判据单源 = `docs/desktop/design/UI.md` §1「批注（右栏宽度拖动 · D30）」）：`pointerdown`（记起始宽 + 起始 x · `setPointerCapture` · `preventDefault` · `body.pool-resizing`）⇒
  `pointermove`（相对算式 ⇒ 内联 `--pool-w` 写（**写径 = CSSOM**）；**rAF 合帧**——每帧至多一写）⇒ `pointerup` / `pointercancel`（**落定前置（刷一拍）**：rAF 待写在场 ⇒ 撤帧 + 同步落待值（末次 move 位）⇒ 再**读回实宽** ⇒ 归一写回 + 存储写入 + 撤类——落定后零迟到写）。
- **界 = CSS 单落点**（`thincoder-desktop/renderer/chrome.css` 栅格行 `clamp`）：窗口 resize 零 JS（随窗重算）；模块侧零界常量（禁双实现）。
- **持久化**（`localStorage` 键 `thincoder.desktop.poolWidth` · 整数 px）：读 ∥ 写皆捕获 + `console.error`（零静默）；读失败 ∥ 非法值 ⇒ 视同未拖过（零内联写）；写时机 = 仅落定一刻。

### 1.4 主题三态面：`data-theme` 状态（D33）

- **面判定**：本面 = **chrome 级状态直写**（渲染面 · 零 IPC ∥ 零 `events` 依赖 ∥ 主进程零行为面）——先例 = §1.3（宽度面）+ `dataset.locale` 帧写径；**与 §1.3 差异 = 持 store 镜面（设置面重绘键）；`dataset.theme` 写仍同步不经帧**；**用户值覆写系统缺省**（`system` = 缺省态——非零态）。
- **模块缝**（已落 `thincoder-desktop/renderer/theme.mjs`）：注入缝 `{ doc, storage }`（缺省 = `document` / `localStorage`）⇒ 平 node 直测；
  导出 = `initTheme`（装配入口：读存储 ⇒ 归一 ⇒ 写 `documentElement.dataset.theme` ⇒ 返值）∥ `setTheme(value)`（出口：三值闭集校验 ⇒ 应用 + 落存储 ⇒ 返落地值；表外 ⇒ `null` + `console.error`）；常量 = 键 `thincoder.desktop.theme` ∥ `THEMES`（三值闭集——控件序单源）。
- **装配两点**（`thincoder-desktop/renderer/app.mjs` / `thincoder-desktop/renderer/mount-settings-exits.mjs`）：① 装配期一次 `initTheme()` ⇒ `store.set({ theme })`（切片播种——先于首绘可及面，同 `initPoolWidth` 位）；② 设置面出口 `onSetTheme`（`setTheme` ⇒ 切片写——重绘触发键 = `mount-settings.mjs` `SETTINGS_KEYS` 增 `theme`）。
- **值面**（`thincoder-desktop/renderer/theme.css`）：单块 `light-dark()` 值对（色值对 **24**；`--error-fg` 同值单列）+ `color-scheme` 三态（`light dark` 缺省 ∥ 两枚 `:root[data-theme]` 覆写）；`@media (prefers-color-scheme: dark)` 退场。非色变量（`--mono`）暗块同值重声明随块消解——单块单留；不入 `light-dark()`。
  值对函数支持面 = Chromium 123+（宿主 = Electron 44.4.5 ∕ Chromium 152.0.7977.130——`releases.electronjs.org`）。
- **持久化**（`localStorage` 键 `thincoder.desktop.theme` · 三值闭集串）：读 = 装配期一次 ∥ 写 = 点按即刻；读 ∥ 写皆捕获 + `console.error`——读失败 / 表外 ⇒ `system`（降级）；写失败 ⇒ 会话内照常（fail-soft）。
- **单写者纪律**：`documentElement.dataset.theme` 写径全仓仅 `theme.mjs` 一处（机检负控用例）；任一 `theme` 切片写入须先经 `theme.mjs`。

### 1.5 窗口不节流（后台期照常渲染）

- **修复面**：`thincoder-desktop/src/main/window.mjs` 窗口装配（`:127-132`）`webPreferences` 增 `backgroundThrottling: false`（单行开关）——
  **逐字引文**（宿主实装类型 `thincoder-desktop/node_modules/electron/electron.d.ts:19430-19437`——引文两句 = `:19431-19434`）：「frames will be drawn and swapped for the whole window」+「This also affects the Page Visibility API」；运行期同义属性 `:18805-18809`（同句）⇒ 关闭后台节流 = 后台期照常出帧与交换。
- **边界与代价**：用户可见行为零改（遮挡期不可见；可见期行为逐字同）；
  代价 = 后台期照常渲染——枚举 = ① 有在飞工作时 = 与可见期同量（事件驱动 ⇒ 空闲期零帧）② **1s 拍面**（`thincoder-desktop/renderer/heartbeat.mjs:16` `HEARTBEAT_MS = 1000` ∥ `:37-48` `createHeartbeat`——定时器节流关掉后后台期照常走拍：在飞块逐块刷 + 状态行重挂）；**代价可实测** = 后台期三项读数（遮挡期 Tab CPU ∥ rafGaps 计数 ∥ 帧量）；
  渲染规模 ∥ 软合成 ∥ 摄取热路径 = 零动。
- **验收口径**：父侧真机复现 + 一行读数（停摆窗 ∥ longtask）。

### 1.6 关键决策

| 号 | 决策 | 依据 |
|---|---|---|
| KD-27 | **会话流经共享渲染核**（D19）：文本面 = 核 Markdown（**「零 Markdown」改判**）；真代码块 / 复制 / 推理块 = 核件分件消费（渲染逻辑单源：`md` / `attachCopyButtons` / `renderReasoning`〔结构同形〕）；帧容器 / 工具卡族 / 卡族 = 桌面外壳留存（否「整件替换核 DOM」）；**文件链接承载**（「对齐第三批」D19 收正——宿主验存链 + 核包裹 + `file:open`；单源 = `docs/desktop/design/CHAT.md` §1 **KD-39**）；核落点 / 加载形 = `docs/render-core/design/RENDER-CORE.md` | 用户走查第 3 点 + D19「经共享渲染核」；同核 ⇒ 「基本对齐」结构性成立 |
| KD-48 | **桌面接装更新契约 = 帧合并件 + 每帧每面至多一次 + 帧内增量**：① 触发源 = `store` 订阅 ⇒ 核 `createFrameMerge` `mark(changedKeys)`（O(1) 脏集；**帧时刻现读 `store.get()`**——禁 mark 时刻取态；`flush` 消费点 = `returnToLatest`（app 侧回底入口——`thincoder-desktop/renderer/app.mjs:152`）回底顺序保真）；② 分派 = `renderer/frame-dispatch.mjs`（键集 → 五面：会话控制条 ∕ 状态行 ∕ 对话流 ∕ 池区 ∕ 卡面——每面每帧至多一次）；③ 对话流帧内 = 结算步（`flowStep`——摘 ∥ 造 ∥ 刷；尾段先于读数、头段入补偿区间）+ 尾块就地（工具卡头行分段刷 + 结果区核 `appendToolOutput` O(1) 追加——节点身份不变）+ 读数按径裁剪；④ 状态行 = 帧界 + **面内差分门**（模型等价 ⇒ 零写——`blocks` 保持入键：工具段更新点随块面）；⑤ **不并入**：池壳 ∕ 重建面位焦族 ∕ 设置面草稿面（#603 在飞 ∕ #606 ∕ #604——排后）；⑥ 复制钮 gating = 随尾节点着装（重挂全根一次 + 尾段逐新节点——禁帧级全根扫）。`thincoder-desktop/renderer/views/chat.mjs` 越 300 消解：模型族七件出档 `views/chat-model.mjs` | 用户报障 + 真机实锤（线性成本）+ #190 会诊（三笔 VSC 未付账：状态行逐 chunk 全量重建 ∕ 逐 chunk 多扫 ∕ 合成布局）；VSC 已付轮子直取（rAF 节流 ∕ O(1) 追加 ∕ 帧尾动作 ∕ 布局节俭）；机制单源 = 核档 §2 **KD-RC-9** |
| KD-50 | **尾块增量 md + 帧内组合（就地改 + 追加）**：① 尾块文本面（正文 ∕ 推理）重渲 = 核**增量 md 画件**（冻结切点 + 热区换代——三段定界 ∕ 增量单元 = 段落 ∕ 块；机制单源 = 核档 §2 **KD-RC-10**；桌面 `views/chat-text.mjs` 调用点零改）；② **帧内组合（就地改 + 追加）** = 结算步天然同帧两动作（`flowStep` 刷项 + 尾段造项——`thincoder-desktop/renderer/views/chat.mjs` `settleFrame` 同帧执行）——每新块边界的全面构造消（单源 = `docs/desktop/design/RENDERER.md` §1.1） | 真机实测：80KB 帧 p95 **15.4ms** ∕ 密文（markdown 密度 ≈2×）**31.8ms**（全量 md 口径——8ms 预算不达根因）+ **每新块边界一次全量重挂**（帧合并使「尾块就地改 + 新块追加」同帧 ⇒ `streamDelta` reset ∧ 尾位不入重合判 ⇒ 全窗重建——前批上抛在册） |
| KD-54 | **桌面堆累积收敛 = 诊断先行 + 对靶两用例**：① 诊断用例 = 堆快照钉点（渲染 ∕ 主双进程——读数表 + 按构造器分组快照差落单元测试档；**候选面在册（实读坐标）**——渲染 JS 侧：`thincoder-desktop/renderer/store.mjs:93` ∕ `:128-132`（块树仅增不裁）· `renderer/views/chat-scroll.mjs:28`（150 仅 DOM 侧）· `:52-57`（窗限只增）· 块载荷无上限（`renderer/events-blocks.mjs:64` ∕ `:92` ∕ `:107`；宿主原样全量 `src/main/agent-bridge.mjs:230-236`）· 子代理 rows 无上限（`renderer/subagent-reduce.mjs:151`）· digest 按轮累积（`renderer/events-wake.mjs:50-57`）· 池族容器摘离引用（`renderer/views/activity.mjs:121`）∥ 主进程侧：装配表无驱逐（`src/main/agent-host.mjs:105`——清点仅 `session:delete` ∕ 切项目）· `turnEpochs` 无清除（`src/main/turn-driver.mjs:55`）∥ DOM 侧：巨块单段（#649 R-7 余账——`docs/render-core/design/RENDER-CORE.md:372` C10）∥ **核共享面（实测命中 · E2 命中分支兑现——2026-09-30）**：`thincoder-render-core/flow/block.mjs` 逐 chunk 文本节点追加（`advisor-text` ∕ `toolOutput` 续写支——`:63-66` ∥ `:47-49`；文本节点洪峰 ≈102K）⇒ 并入末文本节点修法（desktop ∥ VSC 共享面））；② 对靶用例 = 钉点命中面收敛（**留存上界 + 释放 ∕ 重取路径**——缺一不可）+ 未命中面零动作（在册不盲修）；③ 巨块策略 = 渲染 ∕ 布局夹层（CSS `contain` ∕ `content-visibility` 先行——零语义（先例 = #649 候 A②）；**属性表点名 = `contain: layout style paint`（不含 `size`——高度确定性保持）∥ 备选 `content-visibility: auto`——须携 `contain-intrinsic-size` 且过「回填 ∕ 跟滚不跳」用例方采**；**JS 分段挂载 = 实施径**——CSS 支受控 A/B 实测不可及（无材料性收益 · 2026-09-30 父裁点火）：巨块渲染文本 > 24K 字符 ⇒ **12K 字符 ∕ 段**切分（`splitText` + `<span data-seg>` 包壳）· 窗 = 视口段 ±1 · 切换 = `display:none`（文本恒在 DOM——等价门 ∥ 搜索命中面完整）· `patchTextBlock` ∥ 核画件调用点零改（分段 = 挂载径初窗 + 帧尾窗步）· 回滚 = 常量开关 ∥ 整块直挂；**核 `live-md` 零触**——跨端共享面）**＋ H1 节流缺口支（归档回放 ∕ 心跳两径——回放分片 ∕ 拍体裁剪；候选在册 = §2.11；分支输入 = 1d 分判读数）**；④ 硬边界 = **呈现语义零改动**——射程 = 150 窗语义不动 ∥ 滚动上翻所见逐字同 ∥ **受损面在册**（选区 ∥ 复制（可见段为限——巨块全量选择 ∕ 复制不完整）——原生行为受损面，如实登记；接受口径随批准 ∕ 收口面落档）＋ **查找跳转已修（2026-10-10 · 尾行收口批 · #711②）**——核缝 `deps.reveal` + 桌面披露助手 `thincoder-desktop/renderer/views/chat-segment-reveal.mjs`；判据 = 内存上界断言 + 快照差 + 探针（long-task 计数 ∕ 帧成本 ∕ 文本逐字等价 ∕ **回填 ∕ 跟滚不跳**〔同判据 = T-DSK18 ∕ T-DSK19〕） | 【依据】本档 §2（机制 ∕ 判据单源 = 桌面堆取证修复批）；候选坐标全部实读在册；**现盘活体读数**：渲染进程 723 → 1,046 MB WS（2026-09-30 00:1x → 00:21 · ≈40–46MB/min 增长 ∥ 主进程 253–264MB 稳）⇒ 累积面在渲染侧为主嫌疑（实施期由 KD-53 武装读数钉死）；**E4 二刀实读（2026-09-30 · §5.7）**：CSS 支受控 A/B 三值（无夹层 18,948ms ∥ `contain` 19,460ms ∥ `cv-auto` 21,182ms——同噪声带）＋成本归因（`md()` 6ms ∥ `innerHTML` 1ms ∥ attach+强制布局 **≈21.8s**；CJK 超线性 60K=206ms → 600K=23.8s；同尺寸 ASCII 83ms）；§1.3 第二冻结（CPU 风暴 ∕ 堆 <1GB）= 双假设并行（H1 计算 ∕ H2 堆）——E2 ∕ E4 两用例分对位 |
| KD-63 | **桌面流面 = 作业单自带 + 结算步**：① **事件自带**——结构变更由发生点带作业（`state.flowOps`；写口单点 = `thincoder-desktop/renderer/store.mjs` `withFlowOp`——与 `blocks` 写同笔）：`build`（整置——页回执首屏 ∥ **回填页并入（回填落位批 · 2026-10-04）** ∥ 换会话 ∥ 关页 ∥ 退流清空（本地先行回声摘空 ⇒ 空态引导面复现））∥ `insert`（按位插入——座次位，#765 面）∥ `cut`（退流）；**新块到达零作业**（追加为常规路径——由账自明）；**清账 = 两径同清（构造径亦清 ∥ 结算径亦清）**——消 `build` 粘滞；**root 缺位 ⇒ 不清**——未消费不退账；② **结算步**——每帧以账（上帧窗块列 + 隐藏数）对模型窗整数量结算（纯件 `flowStep`：摘（按数）∥ 造（给没有节点的内容造节点——头段前插 ∥ 尾段追加 ∥ 中洞就位）∥ 刷（块对象变者就地））；③ **建 = 构造径**（首帧 ∥ 整置 ∥ 词面变——同径同形；`mountChat` + 快照复填）；④ **承载件保留**（帧写序 ∥ `t0` ∥ `t1` 双读数 ∥ 快照复填 ∥ 建树面）；⑤ **禁词一族（新面零命中）** = 八词；机制明细单源 = 本档 §1.1「流面作业单」条 ∥「流面结算步」条 ∥「建」条 | 用户 2026-10-01 05:37–05:59 六斥（「过度设计」∥「已生成的 dom 元素」∥「只有最后那个块可能插」∥「修修补补」∥「换代重建」∥「虚幻假设」）+ 父侧实证（全量换新 100% 出自 `thincoder-desktop/renderer/app.mjs:181` 一处判决径）；幻影审计 = 「挂载面与目标可能失配」不可达（渲染面 = 流面唯一写者 ∥ 游标 = 帧自己的账 ∥ 无静默丢通道） |
| KD-74 | **行痕族三员（帮助行 ∥ 停止痕 ∥ 到期触发行）清点时机 = 双门**：① **首屏门保留**（`applyPage` `before == null` 五清——`thincoder-desktop/renderer/page-read.mjs:265-278` 键集零动）；② **新增回合起跑门** = `msg:send` 出站即清（信号点 = `thincoder-desktop/renderer/composer-wire.mjs` `sendDirect` `:90` ∥ `sendQueued` `:165` 的 `call("msg:send")` 前沿同笔 → 纯动作 `clearTurnTraces`（新增住 `store.mjs`——摘 `helpLines[key]` ∥ `stopMark[key]` ∥ `timerNotice[key]`（timer 员并入） + 置闩 `stopHold[key]`））；③ **两门 = 幂等并集**（删键动作可交换；闩 = 门簿记**不入五清**；`stopHold` 不入 `CHAT_KEYS`——零渲染依赖）；④ **竞态 = 晚到 `stopped` 丢弃**（闩开窗内〔出站起、本键**回合首帧**前——`turn` 事件 ∧ 此前非 running，与 `turnStarts` 起刻同判〕到达的 `stopped` **只弃痕写**——`withStopMark` 单点门；回合尾其余结算〔位标 ∥ 清扫 ∥ 提问项 ∥ 池 ∥ 游标〕零触；依据 = 同键回合串行——宿主单驱动 `flights` 按键隔离）；⑤ **端差 = VSC 零触**（流尾行痕在 VSC 不存在——其 `[stopped]` = 消息内嵌注记 `thincoder-vscode/webview/streaming.js:142-143`，注记不入 `currentRaw`、历史重建即失、无尾组钉悬形态；用户可见退场面天然成立；判反 ⇒ 翻转对齐须另裁）；⑥ **timer 员并入（2026-10-05）**：`timerNotice[key]` 同门摘（出站即清）；**晚到 `ev:timer`（出站后到期）照写照显**——零丢弃机制（与 `stopped` 晚到分道：timer = 会话级独立事实、无「属上一回合」语义；显示期 = [到达，下一回合门)）；端差 VSC ∥ CLI 零触（VSC = 无尾组钉悬形态 · 载体系举证；CLI = 滚回 append-only 宿主能力差——翻转条件在册） | 用户 2026-10-04 20:55 走查（帮助行 ∥ 黄色 stopped 痕「再也不会消失」）+ 21:00 四选一裁定「下一回合开始即清」；信号点判据 = 「**发出**下一条消息」字面（出站 = 用户动作同步时刻、直发 ∥ 忙态队两径全收）；晚到判据 = 同键串行 ⇒ 闩开窗内 `stopped` 必属上一回合；timer 员 = 2026-10-05 21:42 报障（停在流尾不消失）+ 21:59 点火（快车道）裁定并入（沿同语义） |


## 2. 有界渲染窗口

- **MAX_RENDER_BLOCKS = 150**：只渲染尾部窗口，更早块折**「摘要块」**（可一键回填，回填后仍守窗口）；**不做虚拟化**（DOM 块数有界即达标——虚拟化不列入本版）。**值 = VSC `MAX_MESSAGE_BLOCKS`（`thincoder-vscode/webview/ui.js:204`）逐值对齐**。
- **窗限增量**：窗限 = 视图侧计数（初值 150）——回填收束沿（无在途 ⇒ 页并入）⇒ 限 + **本页归约后实际块数**（页量 = 核 `historyWindow` 缺省 200 **条**——**条 ≠ 块**，渲染面不写死页量），以宽窗容纳并入的更早页；未渲染更早块数落根锚 `data-hidden`（判据函数 = `nextWindow`——落点 = `thincoder-desktop/renderer/views/chat-scroll.mjs`）。`hasOlder ∧ data-hidden === 0` ⇒ 零摘要块（回填只经滚顶触发）。
- **留档块记账**：`kind === "subagent"`——留档块（页读域第六型）计入块序 / `data-blocks` / 尾窗渲染；**退出尾窗 ⇒ 计入 `data-hidden` ∥ 折摘要块 ∥ 可回填**（留档件——页读有源）⇒ 摘要块判据（`hidden > 0`）与回填触发（`hasOlder`）含留档块，与五型块同规。
- **流面结算步（非构造帧帧尾固定步 · 机制单源 = 本档 §1.1「流面结算步」条）**：账 = 上帧 DOM 所覆盖块列 + 隐藏数（帧层记账 `chatFrame`）——结算 = `flowStep`（纯件 · 平 node 直测）⇒ `{ drop, build, refresh, head }`：摘（头段越位——按数）∥ 造（窗位缺账项——头段前插 ∥ 尾段追加 ∥ 中洞就位，插点单源 = §1.1 插入点纪律）∥ 刷（留位且块对象变——就地；`refreshNode` = 文本族刷 ∥ 工具卡刷 ∥ 型变节点换）。
- **头段 / 尾段（分段规则）**：头段 = 保持段之前者（摘 ∥ 造）⇒ 帧尾读数区间内（§3 六步④）；尾段（追加 ∥ 中洞 ∥ 刷 ∥ 退流摘）⇒ 先于读数（§3 六步①）。
- **两条效果**：饱和追加 ⇒ 按数摘最旧守窗口（DOM 块节点数有界）；回填帧（页并入 ⇒ 限增——判据 `nextWindow` 零改）⇒ **构造径整置**（并入页块可见——记录序重放）；结算不随帧类型分面（`history` 帧同走）。
- **不变式（结算后）**：DOM 块节点序 ≡ 模型窗（逐位同块）⇒ 根锚 `data-blocks` = 窗长 = DOM 块节点数；构造帧同断言（`mountChat` 按窗建树）。
- **巨块分段窗（机制 ∕ 参数单源在册）**：巨块（渲染文本 > 24K 字符）按 **12K 字符 ∕ 段**切分——文本节点级 `splitText` + 行内续跑 `<span data-seg>` 包壳（顶层块节点即单元）；
  窗 = **视口段 ± 1 段**（可见 ≤4 段）；切换 = `display:none` 置 ∥ 清（**文本恒在 DOM**——`textContent` 等价 ∥ 搜索命中面完整）；每帧段状态变更 ≤ 2；
  初窗住挂载径（`dressNode` ∥ `mountChat`——先于一切读数步）· 滑动住帧尾第 ⑦ 步（内容帧 ∥ 滚动拍 `segView` 信号）；**与块窗两级叠加**——块窗管块序（本节各条零改），段窗管块内。**换代件判据 = 核画件热区桶 `_liveMd.hot`**（端**只读**——核侧零公开读面；跨核边界读私有 = 在册披露）：热件不切（换代节点自然隔断）。

## 3. 回填与跟滚

- 回填 = 滚至顶 **≤ 40px** ∧ 有更早页 ∧ 无在途 ⇒ 取一页（页量 = 核 `historyWindow` 缺省 200 条——渲染面不写死页量；**条 ≠ 块**），并入后按 `scrollHeight` 增量修 `scrollTop`（视口不跳）——三出口判定与补偿算式 = 纯函数 `scrollAction`（`backfill` / `follow` / `unfollow`）· `compensateTop`。
- **回填 = 整置（删档 + 新写——记录序重放）**：回填帧 ⇒ 构造径（`mountChat`——行族随树按记录序复列）；视口锚定 = 帧出口补偿（`compensateTop` 单源——非跟滚 ⇒ 取 `t0` ∕ `t1`；
  读数裁剪不破：仅回填收束帧（帧身份 = 上帧在飞 ∧ 本帧坍落 ∥ 非跟滚）· 写门 = 高度净增 ΔH ≠ 0 才读 ∥ 才写——详式在册）；跟滚 ⇒ 贴底覆盖；
   **零位置机具**（零寻位 ∥ 零搬移 ∥ 零算术）。
- **回填受理径同步落帧**：取页受理动作 ⇒ 受理帧（`inFlight: true`）**同步落账**（`thincoder-desktop/renderer/app.mjs` `onBackfill` 包装 = 动作 + `frame.flush()`）⇒ 随后回执帧成「上帧在飞 ∧ 本帧坍落 ∧ 非跟滚」**收束帧** ⇒ 读门 ∥ 写门 ∥ 补偿算式**逐字零改**（收束帧判据保位）；不 flush ⇒ 两态并入同帧 ⇒ 收束帧不可判（视口补偿漏）。
- 跟滚 = 近底 **24px** 复跟（判据 = 核工厂 `nearBottom`——严格小于：恰 24px 不判近底；`FOLLOW_PX` = 工厂 `NEAR_BOTTOM_PX` 再出口保名）。
  上滚即停跟；**药丸单判据 = `!following`**（「可滚 ∧ 非近底 ⇒ 显」与此**等价**——上滚即停跟；文本两态 = 未读数 > 0 ⇒ `chat.pill.new`（`${n}`），否则 `chat.pill.bottom`）；点击回底复跟；程序化平滑滚动互斥窗 **420ms**（判据 = `smoothWindowOpen(now, lastAt)`）。
- **滚动作落面**（DOM 写面点名）：跟滚追加 ⇒ **瞬时贴底**（写 `scrollTop`——先例 `thincoder-vscode/webview/ui.js:428`）· 药丸回底 ⇒ **程序化平滑**（`scrollTo({ top: scrollHeight, behavior: "smooth" })` + 记 `lastAt`）· `scroll` 订阅先过 `smoothWindowOpen(now, lastAt)` 门——**窗内不派发**（该判据真 ⇒ 窗已过期、可派发；程序化平滑的滚动回波不算用户动作）。
- **帧尾滚动作（补偿消费点）**：非构造帧末尾 `settleFrame(root, model, scroll, handlers, account)`（落点 = `thincoder-desktop/renderer/views/chat.mjs` · `paintChat` 调用）——六步序 = ① **尾段**（刷 ∥ 尾段造 ∥ 退流摘 ∥ 行族出生——**新到流项按到达序**：行族出生先于同帧补发块；皆**先于读数**）② 读数 `t0` ③ `syncChrome` ④ **头段**（摘 ∥ 造——按数；位次步 ④′ 保留）⑤ 读数 `t1` ⑥ 写（下两条）。
- **尾段步（第 ① 步）**：造项（尾段 ∥ 中洞）逐枚挂（插点单源 = §1.1 插入点纪律）；刷项就地（文本 + `data-streaming` 锚 ∥ 工具卡）；型变 ⇒ 单块节点换；同帧「刷 + 造」= 帧内组合（就地改 + 追加）本然。
- **帧尾三写（第 ⑥ 步）**：帧后跟滚 ⇒ `stickToBottom`（瞬时贴底——**写超值不读 `scrollHeight`**（浏览器鉗底），幂等）；非跟滚 ∧ 头段动数 > 0 ⇒ `compensate`（`compensateTop` 算式——`prevTop` = `t0.scrollTop`、`prevHeight` = `t0.scrollHeight`、`nextHeight` = `t1`）；其余 ⇒ **零写**。
- **补偿单权源**：`.flow` 置 `overflow-anchor: none`（`chat.css` 面）——头侧变更的视口锚定只由 `compensate` 显式承担，免浏览器自动锚定叠算。
- **读数区间记账**：区间 = [`t0`, `t1`] 跨头侧变更（摘 / 插 + 摘要块在场与文本）；尾侧（尾段挂载 / 就地更新 / 药丸——单行 `nowrap` 定高，`chat.css`）在区间外或零高度增量 ⇒ ΔH = `t1 - t0` = 头侧净增量。
- **瞬时写不记窗**：`lastAt` 只由程序化平滑（滚动面 handle 方法 `returnToBottom()`——`thincoder-desktop/renderer/views/chat-scroll.mjs:78`）记；`stickToBottom` / `compensate` 不记 `lastAt`——其滚动回波读数即真态（同值 `setFollowing` 归原态）。
- **读数按档裁剪**：跟滚帧 ⇒ 帧尾两读数免读（贴底 = 写超值）；非跟滚帧 ⇒ 头动作 > 0（补偿径）才读 `t0` ∕ `t1`——即每帧读数 ≤2 且仅在补偿径（禁逐 chunk 强制布局；单源 = 核档 §2 KD-RC-9）。
- **块内容区跟滚（核原语直消费）**：子 agent 块内容区（`.advisor-content`）跟滚 = 核件原语 `initBlockFollow` ∕ `maybeScrollBlock`（`thincoder-render-core/subblocks/block.mjs`；落点 = `thincoder-desktop/renderer/views/pool-subagents.mjs`）。
  **接线四点** = ① 出生 ∕ 接管（`subElementOf`）· ② 内容增量（`replayRows` 追加后）· ③ 挂载补钉（`createSubBlock` `family.append` 后）· ④ 接管径补钉（`replaceWith` 后）——① 挂 `initBlockFollow`，余三点 = `maybeScrollBlock` 应用；
  **帧尾复核** = `mountPool` 尾逐块 `applySubBlockFollow(family)`（族级扫描——`views/pool-subagents.mjs` 新导出；VSC `streaming.js:31` 脏集对位：任何位面被抹 ⇒ 下一帧自愈）——**应用时机契约** = 核档 §2 KD-RC-8（应用点清单：追加后 ∕ 挂载后 ∕ 帧尾复核；“端只在宿主时刻调用核应用器”；端侧遗漏应用点 = **违约缺陷**）。
  判据 = `内容区._pinFollow`（**让位三律** = 近底 < 24px **无条件翻真** ∕ 远离底仅凭**用户手势门**（`wheel` ∕ `touchmove` ∕ `pointerdown` · 600ms）翻假 ∕ 非手势位移（复位回波 ∕ 程序写 ∕ 布局）**不改旗标**；`false` ⇒ **零写**——不夺阅读位）；
  让位期出口钮 `sub-follow-btn`（核件自持：`open ∧ 非冻结 ∧ 可滚` ⇒ 可见；两态 `sub.follow.new` ∕ `sub.follow.bottom`；点击 ⇒ 回底 + 复跟）——单源 = `docs/render-core/design/RENDER-CORE.md` §2 **KD-RC-8**；
  折叠（`open=false`）∕ 已移除 ⇒ no-op；写超值不读 `scrollHeight`；桌面帧 = **store 变更排帧**（核帧合并件——单飞 rAF + ≥50ms 间隔 + 脏键集；触发源 = store 变更——本档 §1.2 ∕ 核档 §2 KD-RC-9）。
  **键盘位移**（键盘滚动——无手势标记）不改旗标（非手势位移同路）；可达性 unverified（需真机核）⇒ **残余登记**（单源 = `docs/render-core/design/RENDER-CORE.md` §2 KD-RC-8）。**手势窗内以手势为准**（窗内非手势位移按手势期计——有意取舍）。
- **池区帧尾钉底**：`views/activity.mjs` `mountPool` 尾 `maybePinPool(root)`（`views/activity-new.mjs`——`_poolPin !== false` ⇒ 写 `scrollTop`；VSC `webview/streaming.js:32` `frameEnd` 对位）；
  旗标维护 = `attachActivityNew` `scroll` 订阅（工厂 `createPinWatch` 消费——`gestureGateMs = 0`）；未钉底 ⇒ 零写。
  **池位保真**：池位跨帧保真由领用径承担（池面挂载条）——`_poolPin=false` 时新 chunk 不再拽回顶（churn 消）；`_poolPin` 语义零改（有界自纠结论保持）；**区钉底判据 ∕ 清账路 = 滚动策略族同源**（核档 §2 KD-RC-8 ④——端 = 工厂消费（`maybePinPool` ∕ `nearBottom` 改工厂调用——`_poolPin` 保持）；判据漂移 = 缺陷）。
  **对拍机检用例** = 批次本地机检件（**须新增**）。
- **池区旗标窗口登记**：`_poolPin` 三写者（点击 ∕ `scroll` ∕ 世代重置）+ 帧尾写守 `_poolPin !== false` 早退 ⇒ 极端窗口（上滚与帧尾写同刻）可夺回一次上滚 = **有界自纠**（非持续失效）——裁 = 维持现态；若真机走查再现夺回 ⇒ 再立小修。
- **滚动策略族工厂化（机制单源 = `docs/render-core/design/RENDER-CORE.md` §2 KD-RC-8 ④ ∕ §5）**：策略族四件（判据 ∕ 写门 ∕ 旗标维护 ∕ 计数簿记）抽核件 `thincoder-render-core/scroll.mjs`（已落）；桌面持载两档改**工厂消费**——
  `views/chat-scroll.mjs`（`FOLLOW_PX` = 工厂 `NEAR_BOTTOM_PX` 再出口保名；跟随判据 → 工厂 `nearBottom`；贴底写 = 工厂 `applyPin`）· `views/activity-new.mjs`（`maybePinPool` ∕ `nearBottom` 改工厂——`_poolPin` 保持）——**零行为变更**；块内容区两导出（`thincoder-render-core/subblocks/block.mjs`）同改薄包；
  对拍用例升级 = **工厂单源 + 消费面断言**（判据漂移 = 缺陷——载体 = 单元测试档）。
- **巨块段窗滚动作（帧尾第 ⑦ 步）**：段窗挂 ∥ 卸的视口补偿 = 帧尾补偿纪律**新消费方**（单权源 `overflow-anchor: none` 不动）：只计**视口顶锚之上的净高变化**（挂上 ⇒ `scrollTop += h`；卸下 ⇒ `scrollTop -= h`——先读后卸；锚下变更零补偿）；
  跟滚帧零读（底窗直取 + 贴底写覆盖）；执行点 = `settleFrame` 六步**之后**（独立显式补偿——与 [t0, t1] 区间互不叠算）；触发 = 内容帧尾 ∥ 滚动拍（`attachScroll` deps `onScrollTick` ⇒ `frame.mark(["segView"])`）。
  **面序结算**：多面同帧 ⇒ 逐面按面序（= `mounted` 上帧 DOM 文档序）结算——复读径面（视口顶跨面）取**取代式**（本面自担量 = 复读位移 − 已结算前序合计；前序面位移不入后序面 delta）；算式径面（锚不可测）照旧并账自身量。
- **边界**：本两条只覆盖**块内容区 ∕ 池区**——会话流主跟滚面单源保持（回填 ∕ 跟滚 ∕ 药丸 ∕ 帧尾三写 ＋ **巨块段窗滚动作**）。

## 4. 范本借用清单（实现工艺面）

清单前言（落形列 = 单源 · 全项只用浏览器原生能力 ⇒ **零框架零构建**（`docs/desktop/design/PROJECT.md` §2 KD-4）成立 · 证据级别两档 · 计数）住 `docs/desktop/design/UI.md` §3——本表不重复。

| # | 借用项 | 本端落形（本档 §2 / §3 规则行） | 来源坐标 | 级别 |
|---|---|---|---|---|
| 1 | 跟滚状态机 | 近底 24px 复跟 · 上滚即停跟（§3） | `thincoder-vscode/webview/ui.js:460-468`（`_pinBottom` 判定 `< 24`） | 本仓实读 |
| 2 | 新消息药丸 + 平滑互斥 | `!following` ⇒ 药丸（文本两态 = 未读数 / 无未读）· 点击回底复跟 · 420ms 平滑窗互斥（§3） | kimi-web `ConversationPane.vue`（419 状态机 · 501 平滑互斥 420ms · 1503-1512 药丸元素） | 外部转引 |
| 3 | 回填触发与补偿 | 顶 ≤ 40px ∧ hasOlder ∧ 无在途 ⇒ 取更早页（页量 = 核 `historyWindow` 缺省 200 条——渲染面不写死页量；条 ≠ 块）；按 `scrollHeight` 增量修 `scrollTop`（§3） | `thincoder-vscode/webview/history.js:79-88`（触发 + 防重入；先例阈值 40px）· `:57-61`（插入 + 高度补偿） | 本仓实读 |
| 4 | 首屏（补行） | 首屏页 = 追加 + 回底；恢复出的非空首屏先摘空态页，不残留（规则落点 = 本表本行）；页应用口径 = 非空首屏摘空态页 + 块面整置 + 回底（`following = true` / `pendingNew = 0`；块归约单源 = `thincoder-desktop/renderer/events.mjs`） | `thincoder-vscode/webview/history.js:43-46`（空态页摘除）· `:62-65`（追加 + 回底） | 本仓实读 |
| 5 | 有界渲染（不虚拟化） | 窗口 150 块 + 更早折「摘要块」（§2） | `thincoder-vscode/src/extension/history-window.mjs:12`（窗口算法 = 核单源转口）· kimi-web `ConversationPane.vue`（75 惰性页 prop） | 本仓实读 + 外部转引 |
| 6 | 回底按钮 | 与药丸**同一元素**（单元素两态——§3 药丸单判据）；回底 = **程序化平滑**（`scrollTo` + 记 `lastAt`——§3 滚动作落面） | `thincoder-vscode/webview/scroll.js:29-34`（`< 120` 非近底 · `> 40` 可滚） | 本仓实读 |

计数：**工艺面 6 行（第 1–6 项；第 4 行 = 首屏面补行，非独立借用项）** + 形态面 5 行（第 7–11 项，住 `docs/desktop/design/UI.md` §3）= **11 行 = 10 项借用 + 1 补行**；外部档引用 = 参考仓文件名 + 行号（参考仓非本仓，不展开路径）。

## 5. 文件账（本域）

### 5.1 本端文件清单与行数预算

| 文件 | 预估行数 | 说明 |
|---|---|---|
| `thincoder-desktop/renderer/app.mjs` | **346** | 引导与会话 / 对话流接线（会话族接线与刷新 · 对话流槽接线与流式拉取——`paintChat`）；接线拆出（落形）：池面拆出（`mount-pool.mjs`）· 设置面 / 向导接线拆出（`mount-settings.mjs`——见 `docs/desktop/design/SETTINGS.md` §3.1 行）· 输入区接线拆出（`thincoder-desktop/renderer/mount-composer.mjs`）· 卡族挂载与出站（`thincoder-desktop/renderer/mount-cards.mjs`——`session:rename` / `session:delete` 两通道出口（invoke + 回执 `ok` 真 ⇒ 列表刷新；删除 ⇒ 邻位接管随动）· 提问卡出口引调· 计划卡零出口）· 会话族接线（`thincoder-desktop/renderer/mount-sessions.mjs`）· 对话流构树引调 `onOpenDir` / `onNewSession` 两接线 + `CHAT_KEYS` 增 `"project"`（首启引导面动作出口——单源 = `docs/desktop/design/UI.md` §1 追加注）；`onConfig` 增线 ⇒ `composer.refreshCandidates()` + `attachSettings` deps 增键 `onProvidersChanged`（迟绑定） |
| `thincoder-desktop/renderer/events.mjs` | **287** | 事件归约面：`ev:*` **二十五条**通道 → 切片写者单源（`reduce` 纯函数 · `applyPage` 回执两径 · `blockOfMessage` 页→块归约 · `ev:question` / `ev:task` 写切片 `questions` / `tasks`——零 DOM ⇒ 平 node 直测（`ev:question` 同处按**同码闭集**置本键 `approval` 位标——与 `onApproval` 同形；置位面点名 = `docs/desktop/design/UI.md` §1 提问呈现行）；形态单源 = 本档 §1.1）；两新切片归约拆 `thincoder-desktop/renderer/questions.mjs`；回合终局三径（`ev:activity`〔无 `fields`〕`done` / `stopped` ∨ `ev:error`——`isTurnTail` **吃两通道形**，错误径清本键 `running` + 位落 `done`（`onError`）；单源 = 本档 §1.1 回合尾三径条）；`ev:usage` 归约（按会话 `key` 写切片——唯一写者 · 未至 / 非正数 ⇒ 零节点——KD-20） |
| `thincoder-desktop/renderer/events-blocks.mjs`（拆档产出） | **135** | 块面归约径 + 块面原语（推理 ∕ 正文流式续写 ∕ 工具块三径；`reduce` 分派面留主档） |
| `thincoder-desktop/renderer/events-slices.mjs`（拆档产出） | **149** | 读数与切片归约径（读数槽族 + goal ∥ queue ∥ ledger 切片） |
| `thincoder-desktop/renderer/events-status.mjs`（拆档产出） | **87** | 状态面切片归约（`ev:statusText` ∕ `ev:compress` 两切片） |
| `thincoder-desktop/renderer/events-flags.mjs`（拆档产出） | **48** | 模式位切片归约（`applyFlags` 纯动作——页读 ∕ 回执 ∕ `ev:flags` 三径同点） |
| `thincoder-desktop/renderer/events-subscribe.mjs` | **103** | 订阅接线出档（自 `events.mjs` 拆出）：二十五条通道表 + `attachEvents({ on, store, invoke, onTurnTail })`（退订句柄 · 回合尾标题刷新——`sessions:list` 复用零新通道）；单向依赖归约档（无环——形态单源 = 本档 §1.1） |
| `thincoder-desktop/renderer/badges.mjs`（拆分产出） | **44** | 共用件出档（`BADGES` / `badgeStamps`——events / questions / secret-prompt 单一实现；三族判据 `hasPendingFor` = 审批 ∥ 提问 ∥ 凭据；自 `thincoder-desktop/renderer/events.mjs`） |
| `thincoder-desktop/renderer/secret-prompt.mjs`（新档） | **323** | 凭据 / 秘密输入卡（弹窗体：`secretPrompt` 切片消费 —— 字段族（掩码输入 + 提交 / 取消出口）+ 三清径之一 `clearSecret`（清码判据 = 全族皆清——单源 = `docs/desktop/design/UI.md` §2 项 2）；形态单源 = 核 `docs/core/design/TOOLS.md` §6.22 ⑧ ∥ `docs/desktop/design/IPC.md` §1 `ev:secret` 行） |
| `thincoder-desktop/renderer/heartbeat.mjs` | **48** | 1s 拍面：拍体 = 在飞块逐块核件 `refreshBlock`（封装 = `refreshLiveBlocks`）+ 状态行重挂（`paintStatus`——装配单点 = `thincoder-desktop/renderer/app.mjs:269-276`）；判据三件同序（`_subMeta` ∕ `!frozen` ∕ 在连——单源 = 本档 §1.1 拍面条） |
| `thincoder-desktop/renderer/view-state.mjs` | **294** | 快照族：`captureView` ∕ `restoreView` ∕ `dropDrafts`（滚位 ∕ 草稿 ∕ 焦点；消费 = 挂载面重建保真；单源 = 本档 §1.1） |
| `thincoder-desktop/renderer/store.mjs` | **374** | 单状态树 + 订阅（`settings`〔渠道 / 模型 / 参数 / MCP 四组 + 三态〕· `projectInfo`〔台账计数 + 相位〕· `questions` / `tasks` + 队列面（`pending` 切片 = `ev:queue` 镜面——权威 = 宿主，单源 = `docs/desktop/design/COMPOSER.md` §1 **KD-40**）· 会话开合 ∕ 换形归 `thincoder-desktop/renderer/mount-sessions.mjs` 面内记账）；`usage` 切片（回合尾读数按会话 `key`）· `settings` 切片模型候选随 `model:list` 元素形（逐项 `.id`）；切片形 `{ models, unavailable }` + 纯动作 `setModelCandidates(state, models, unavailable)`（同引用才回原态）；`visibleWindow` 含留档块（留档块计 `data-hidden` ∥ 可回填——与五型同规） |
| `thincoder-desktop/renderer/frame-dispatch.mjs` | **53** | 帧分派纯件（键集 → **五面**映射；面回调注入 ⇒ 平 node 直测） |
| `thincoder-desktop/renderer/dom.mjs` | **69** | DOM 工具（渲染工艺单点：`dom.build()` = 本档 §1.1 唯一 DOM 构造点） |
| `thincoder-render-core/flow/block.mjs`（核共享面） | **154** | 顾问 ∕ 子代理块内容面（`appendAdvisorChunk`——文本 ∕ 推理 ∕ toolOutput 续写支）；**E2 命中分支** = 续写改并入末文本节点（语义等价）（单源 = 本档 §5.2） |
**行数面机检**：`checkConfig.lineCounts`（`PROJECT-MANIFEST.json`，运行根单读）**逐条声明节域——本表为其一**（本域值行单源）；后续本域新档由落盘批在本表补值行，`docs/desktop/design/PROJECT.md` §4.1 同拍补指针行（沿 §4.1 纪律）。

### 5.2 现有文件改动 · 批块

**更新纪律收核批行**（机制 ∕ 判据单源 = `docs/render-core/design/RENDER-CORE.md` §2 **KD-RC-9** · **KD-48**（本档 §1.6） ∥ 本档 §1.2：

| 文件 | 行数（构成） | 批 |
|---|---|---|
| `thincoder-render-core/flow/frame.mjs`（核新档） | **69**（帧合并件：脏标记 ∕ 单飞 rAF ∕ `FRAME_MIN_MS` ∕ `flush` ∕ 应用器契约注） | 已落 |
| `thincoder-render-core/flow/stream.mjs` | **135**（+`appendToolOutput`） | 已落 |
| `thincoder-render-core/test/run.mjs` | **82**（零改——帧归并用例住单元测试档；全清令） | 已落 |
| `thincoder-vscode/webview/chat-messages.js` | **262**（toolOutput 支改指核件——零行为变更） | 已落 |
| `thincoder-desktop/renderer/app.mjs` | **299**（贴线 ≤300；帧接装：进口 ∕ 构造 ∕ 订阅改 `mark` ∕ 分派引调 ∕ `returnToLatest`（app 侧回底入口）flush 点；分派体出档） | 已落 |
| `thincoder-desktop/renderer/frame-dispatch.mjs`（新档） | **55**（键集 → 六面分派纯件——回调注入） | 已落 |
| `thincoder-desktop/renderer/views/chat-model.mjs`（拆分产出） | **104**（模型族七件出档——越 300 消解） | 已落 |
| `thincoder-desktop/renderer/views/chat.mjs` | **284**（机械面就地化：工具支零重建 ∕ 扫描收敛 ∕ gating；拆分后——越 300 消解） | 已落 |
| `thincoder-desktop/renderer/views/chat-tool.mjs` | **299**（贴线 ≤300；结果区增量刷新助手——`appendToolOutput` 消费 + 记账） | 已落 |
| `thincoder-desktop/renderer/views/chat-chrome.mjs` | **292**（零改——帧内锚查询实测 ≈0.32ms/帧 ⇒ 无功能必要；**贴层**登记仍有效） | 已落 |
| `thincoder-desktop/renderer/views/chat-scroll.mjs` | **103**（`stickToBottom` 写超值不读 + 读数裁剪助手） | 已落 |
| `thincoder-desktop/renderer/views/statusline.mjs` | **205**（面内差分门——模型等价 ⇒ 零写） | 已落 |
| 测试 ∕ 探针 | 单元测试档两档 = 更新纪律收核批件（平 node 机检）+ `-probe.mjs`（真机计时扩面）；集成测试不写 ∕ 不改 ∕ 不跑（射程 = 五仓测试树：core ∕ cli ∕ vsc ∕ desktop ∕ render-core） | 已落 |
| `docs/render-core/design/RENDER-CORE.md` + `docs/desktop/design/{RENDERER,UI,PROJECT}.md` | 本档设计落定（KD-RC-9 + KD-RC-8③ 收正 ∕ 本档 §1.2 ∕ 同句域两处收正 ∕ 本档 §1.6 KD-48 + 本档 §5.2（本块））——需求档性能行阈值与测法 = 父侧落笔 | 已落 |
**性能尾账批行**（机制 ∕ 判据单源 = `docs/render-core/design/RENDER-CORE.md` §2 **KD-RC-10** · **KD-50**（本档 §1.6） ∥ 本档 §1.2 ∕ §2 ∕ §3：

| 文件 | 行数（构成） | 批 |
|---|---|---|
| `thincoder-render-core/flow/live-scan.mjs`（核新档——实施拆档） | **351**（冻结切点扫描器 `liveCut`；**≤500 ⇒ 免拆**） | 已落 |
| `thincoder-render-core/flow/live-md.mjs`（核新档） | **179**（分片画件 `paintLiveMd`；`liveCut` 经其再出口保签名——三段定界 ∕ 保守律 ∕ 分片全绘 ∕ 热区换代 ∕ 兜底复位） | 已落 |
| `thincoder-render-core/flow/stream.mjs` | **135**（`paintStreamTarget` 改走画件——签名 ∕ 兜底语义不变；`paintReasoningTarget` 同签名随动——委托净零） | 已落 |
| `thincoder-render-core/test/run.mjs` | **82**（零改——用例住单元测试档；全清令） | 已落 |
| `thincoder-desktop/renderer/views/chat-stream.mjs` | **101**（`streamDelta` 增 `patch-append` 档 + 广义追加；`alignPlan` combo 支（`patchAt` + 守卫）；`paintPlan` 携 `appended`） | 已落 |
| `thincoder-desktop/renderer/views/chat.mjs` | **290**（`patchTail` 携 `patchAt` + `settleFrame` combo 支——**< 300 未触越层预案**；结构不变） | 已落 |
| `thincoder-desktop/renderer/app.mjs` | **299**（`alignPlan` 调用点一行形改——零净增） | 已落 |
| 零触面 | `thincoder-vscode/webview/**`（调用点零改——核件同签名）· 核 `subblocks/*`（子代理内容面 = 纯文本拼接非 md——不在射程）· `md.mjs`（单源不动）· 两端集成测试树（全清令） | 已落 |
| 测试 ∕ 探针 | 单元测试档两档 = 性能尾账批件（平 node——C12 ∕ C13 + VSC 复证对拍）+ `-probe.mjs`（真机扩面——R-1 ∕ R-6 ∕ R-7 ∕ R-8 ∕ R-9”；集成测试不写 ∕ 不改 ∕ 不跑（全清令——五仓测试树） | 已落 |
| `docs/render-core/design/RENDER-CORE.md` + `docs/desktop/design/{RENDERER,PROJECT}.md` | 本档设计落定（KD-RC-10 + KD-RC-9 口径收正 ∕ 本档 §1 两行 ∕ 本档 §1.2 增条 ∕ 本档 §2 对齐判据 ∕ 本档 §3 尾段挂载 ∕ 本档 §1.6 KD-50 + 本档 §5.2（本块））——需求档性能行收正 = 父侧落笔 | 已落 |
**桌面流面对账面重写行**

| # | 档 | 行数（构成） | 面 |
|---|---|---|---|
| 1 | `thincoder-desktop/renderer/views/chat-stream.mjs` | **72**（重写——留 `blockKey` + 结算纯件 `flowStep`） | 结算面 |
| 2 | `thincoder-desktop/renderer/app.mjs` | **299**（`paintChat`：两径 = 构造（首帧 ∥ 整置 ∥ 词面变）∥ 结算（作业单消费 + 结算后清）；帧记账 `chatFrame` 增 `hidden`；**≤500 ⇒ 免拆**） | 装配 ∥ 帧出口 |
| 3 | `thincoder-desktop/renderer/views/chat.mjs` | **204**（`settleFrame` 改结算式（签 = `(root, model, scroll, handlers, account)`）；`patchTail` 泛化 `refreshNode`；头段 = 摘 ∥ 造按数；**④′ 位次步 ∥ `_blockAt`/`_blockSeat` 记账保留零动**） | 帧尾面 |
| 4 | `thincoder-desktop/renderer/store.mjs` | **332**（+`flowOps` 切片 ∥ `withFlowOp` 纯动作——**≤500 ⇒ 免拆**） | 状态树 |
| 5 | `thincoder-desktop/renderer/page-read.mjs` | **235**（两作业点：首屏 `build` ∥ 回填 `prepend`） | 页读面 |
| 6 | `thincoder-desktop/renderer/subagent-reduce.mjs` | **258**（零作业点；**≤500 ⇒ 免拆**） | 归约面 |
| 7 | `thincoder-desktop/renderer/composer-wire.mjs` | **262**（退流一作业点 `cut` + 摘空并 `build`） | 输入区 |
| 7b | `thincoder-desktop/renderer/session-wire.mjs` | **202**（关页一作业点 `build`——mid-life 关页（唯一会话删除 ∥ 列表空）同笔 `withFlowOp`；`none` 态引导面由构造径承接） | 会话族接线面 |
| 8 | 单元测试档 | 桌面流面对账面重写族（**已建成 · 804 行 · 六用例（6/6 绿）**；用例集 = 修复轮 1 ∥ 修复轮 2 修正块：用例 1 结算纯件八例（含混帧——`prepend` + `cut` 同帧；关页例——`build` 作业承 `none` 态：引导节点唯一子）∥ 用例 2 同尺复测（全量换新 = 0）∥ 用例 3 滚动补偿 ∥ 用例 4 序 / 内容（含构造径终态对拍）∥ 用例 5 禁词 + 写点白名单（五作业点）；随批留存 · 不进集成测试树） | 全批 |
| 9 | 设计档 | `docs/desktop/design/RENDERER.md` §1 索引两行 + §1.1（作业单 ∥ 结算步 ∥ 建 ∥ 帧尾态刷条 ∥ 快照族条）+ §1.2 ② + §2 四条 + §3 两条 · 本档 §1.6 **KD-63** ∥ **KD-48③** ∥ **KD-50②** ∥ `docs/desktop/design/PROJECT.md` §4.1 `chat-stream.mjs` 行 ∥ 本档 §5.2 本块（含修复轮 2 补行 7b） · `docs/desktop/design/UI.md` §1 追加注项 2（修复轮 2） | 全批 |
零触面：`renderer/views/chat-scroll.mjs` ∥ `renderer/frame-dispatch.mjs`（`flowOps` 不入面键集）∥ `renderer/views/chat-chrome.mjs` ∥ `renderer/views/chat-model.mjs` ∥ 核包 ∥ CLI ∥ VSC ∥ 宿主面 ∥ 记录面 ∥ **消化面（座次步 ∥ 归档面零触）**。


