# 桌面端（DESKTOP）· 设计

> 板块 = **桌面端设计总览档（索引 ∥ 跨域 ∥ 总表面）**——索引（§1 ∥ §2 ∥ §3 ∥ §5 ∥ §8 ∥ §9 ∥ §11）· 跨域 ∥ 总表面（§4 文件账残面 ∥ §6 验收总表 ∥ §7 用例总表）；分档详情见 §3 / §9 / §11 的指针。
> 本部分 = **十四档**：本档 · `docs/desktop/design/SHELL.md`（宿主适配层——进程与目录形态 · 宿主面职责 · 与核的接口面 · 壳装配第三份）· `docs/desktop/design/IPC.md`（主 ↔ 渲染通道契约）。
> 另四档 = `docs/desktop/design/UI.md`（界面形态与交互 · 活动池与状态位）· `docs/desktop/design/RENDERER.md`（渲染面实现工艺——有界渲染窗口 / 回填与跟滚）· `docs/desktop/design/E2E-TESTING.md`（端到端测试基建——真 Electron 驱动 · 家目录隔离 · 固定落点截图；并入单入口）· `docs/desktop/design/WEB-QUICKCHECK.md`（渲染面 web 快筛——开发期回路；不作验收判据）。
> 域拆分七档 =  `docs/desktop/design/MENU.md`（菜单体系——应用菜单五组双语 ∥ 菜单 ↔ 渲染面窄通道）· `docs/desktop/design/PACKAGING.md`（打包与发行——打包链 ∥ Windows 安装包 ∥ 官网托管）。
> 域档续：`docs/desktop/design/ACTIVITY.md`（活动池与消化面域）· `docs/desktop/design/COMPOSER.md`（输入区域）· `docs/desktop/design/CHAT.md`（对话流域）· `docs/desktop/design/SESSIONS.md`（会话域——会话端标识 ∥ 控制面 ∥ 列表读面 ∥ 标题链 ∥ 重启自动重开）· `docs/desktop/design/SETTINGS.md`（设置域——设置面板七段 ∥ 首启向导 ∥ 样式收正 D37）。
> 需求侧 = 需求分卷（`docs/desktop/requirements/`——查卷口 = `docs/desktop/requirements/PROJECT.md` §4 **D 表索引**；功能点 = 九域卷 + 总览 D14 ∥ 验收 ∥ 依赖面 = 总览 §7 ∥ §8——**范围数随需求卷现文**）；产品族三端关系与跨产品共享契约 = `docs/core/requirements/PROJECT.md` §3。
> 核机制面（agent 主循环 / 工具 / 记忆 / 配置 / 会话）**只住核**——本档只做**接入面**设计，不重述核语义（单一权威源）。
> 文档体系落点（第四部分）判别与命名 = `docs/core/design/DOC-SYSTEM.md`；全仓模块地图与硬约束 = `docs/core/design/ARCHITECTURE.md`。
> **行数纪律（500 建议 ∕ 800 硬限）只对代码档**（`.mjs` ∕ `.cjs` ∕ `.css` 等）；纯 `.md` 设计档不受限（档长按内容需要；设计档读者面 = 人）。
> 本注 = **只设计**：无产品代码、无打包动作——`thincoder-desktop/` 实体目录与产物留实施批。

## 一、索引（导航 · 地图 · 总览）

> 本节区 = 总览与导航面（§1 ∥ §2 ∥ §3 ∥ §5 ∥ §8 ∥ §9 ∥ §11）；跨域 ∥ 总表面 = 次节区（§4 ∥ §6 ∥ §7）。

## 1. 方案与理由

### 1.1 模块目标

给不想 / 不能用 VS Code 的人一个**独立桌面入口**：同一个 agent、同一份配置与会话、比终端更宽的会话与活动视图。本设计（本部分十四档）回答三件事：

- **怎么接核**（接口面）= `docs/desktop/design/SHELL.md` §3 · `docs/desktop/design/IPC.md`；
- **怎么长**（前端与壳装配形态）= `docs/desktop/design/SHELL.md` §1 / §4 · `docs/desktop/design/UI.md` · `docs/desktop/design/RENDERER.md`；
- **怎么发**（三平台发行链）= `docs/desktop/design/PACKAGING.md` §2。

### 1.2 总体形态（三条）

1. **进程内第四壳，不是新核**——机制面全部经 `@thincoder/core` 引用，桌面端只持接入面（宿主适配 + 前端 + 壳装配第三份）。
2. **三层进程分工**——主进程（Node / ESM：核 · 会话 · 配置 · 进程树）∥ 预载（窄桥）∥ 渲染（无 Node，纯 DOM 前端）。渲染面能力面 = 浏览器原生，能力缺口一律经 IPC 回主进程。
3. **发行 = 宿主随产物分发**——Electron 作为宿主平台随安装包走；体积 / 供应链 / 三平台打包链成本落本端发行面（需求档 §2 已定性）。

### 1.3 与另两端的对位（一句话差）

CLI = 裸 ANSI 终端 + 单会话前台；扩展端 = VS Code 宿主内的 Webview 面板；桌面端 = 自带宿主的窗口应用 + **会话标签页**（多会话并行可见）+ 随会话的活动池。三端机制同源，接入面各自独立（不镜像、不互引代码）。

## 2. 关键决策记录

| # | 决策 | 理由 |
|---|---|---|
| KD-1 | 宿主 = Electron（需求档已定，本条记工程含义） | 宿主自带 Node ⇒ 核可在同进程内直用，无侧车进程、无 IPC 协议自研；窗口 / 菜单 / 系统主题面齐全 |
| KD-2 | 渲染资源经**自定义标准协议**（`app://`）供给，不直载 `file://` | 官方 API 实读：`protocol.registerSchemesAsPrivileged`（**ready 前 · 仅一次**）+ `protocol.handle`（ready 后）；注册为 standard + secure + supportFetchAPI ⇒ 相对 URL 可解析、web storage 可用（官方档明记：非标准 scheme 二者皆不可）、渲染面获**真实 origin**（CSP 与同源判据可用） |
| KD-3 | 预载 = **沙箱 CJS 窄桥**（`contextBridge`），渲染面零 Node | 官方 ESM 档实读：**沙箱预载不支持 ESM import**（`require("electron")` 可用）；预载脚本忽略 `type: module` ⇒ 取 `.cjs` 扩展名；`contextIsolation: true` 为官方前置 |
| KD-4 | 前端**零构建**：原生 ESM + 手写 DOM，不引打包器 | 与仓内「无构建步骤」硬约束同支；官方档明记渲染器 ESM 不接 Node 内置与 `node_modules` ——本端正好都不需要 |
| KD-5 | → `docs/desktop/design/SESSIONS.md` §1 | — |
| KD-6 | → `docs/desktop/design/PACKAGING.md` §1 | — |
| KD-7 | 宿主下限 = **Electron ≥ 44.x**，且以**启动自检**为准 | 核依赖 `node:sqlite`（免 flag 需 Node ≥ 22.13）⇒ 宿主须带够版本的内置 Node（Electron 44 内置 Node **24.21.0**；本端下限取 **Node 24 主版本底线**——需求面 = 需求档 §8 P1）。设计**不把下限压在外部档上**：启动时断言 `process.versions.node` 与 `node:sqlite` 可加载，不满足 ⇒ 显式报错退出（自检本身 = 判据） |
| KD-8 | → `docs/desktop/design/CHAT.md` §1 | — |

| KD-9 | → `docs/desktop/design/SESSIONS.md` §1 | — |

| KD-10 | → `docs/desktop/design/SETTINGS.md` §1 | — |
| KD-11 | → `docs/desktop/design/SETTINGS.md` §1 | — |
| KD-12 | → `docs/desktop/design/SETTINGS.md` §1 | — |
| KD-13 | → `docs/desktop/design/SETTINGS.md` §1 | — |
| KD-14 | → `docs/desktop/design/CHAT.md` §1 | — |
| KD-15 | → `docs/desktop/design/SESSIONS.md` §1 | — |
| KD-16 | → `docs/desktop/design/SESSIONS.md` §1 | — |

| KD-17 | → `docs/desktop/design/COMPOSER.md` §1 | — |
| KD-18 | → `docs/desktop/design/COMPOSER.md` §1 | — |
| KD-19 | → `docs/desktop/design/COMPOSER.md` §1 | — |
| KD-20 | **状态栏占用读数 = 回合尾事件推**（`ev:usage` 载荷 `{ key, ctxPct }`）；**未至 / 非正数 ⇒ 零节点**（禁假造）；归约面按会话 `key` 写切片（**唯一写者**），切标签取活动键值随动 | 需求档 §3.1:52「活动会话的上下文占用（实时读数）」+ §3.2 项 4「回合收尾：状态栏上下文占用更新」——两处皆指回合尾为更新时点；渲染面不复算（第二判据源 = 与真实用量分叉）；载荷与显示门判据单源 = `docs/desktop/design/IPC.md` §1 `ev:usage` 行 |
| KD-21 | → `docs/desktop/design/COMPOSER.md` §1 | — |
| KD-22 | → `docs/desktop/design/CHAT.md` §1 | — |
| KD-23 | → `docs/desktop/design/CHAT.md` §1 | — |
| KD-24 | → `docs/desktop/design/CHAT.md` §1 | — |
| KD-25 | **状态行 = 对齐 CLI 口径**：段集逐项裁定（**2026-09-28 屏面为准重审后 = 承载 18 / 旁置 1 / 不适用 1 行**——重审定形 = KD-30；表住 `docs/desktop/design/UI.md` §1「批注（对齐重定位）」项 1）；承载四项（耗时 / 令牌 / 计时 / 回合 N/M）**已落（R3a）**——读数槽四住 `thincoder-desktop/renderer/events.mjs`，载荷扩 = `ev:usage` 两键（单源 = `docs/desktop/design/IPC.md` §1） | 用户走查第 1 点 + D17（零静默省略）；键位组不适用 = **提示不入段**（`/:` 命令面已在册；单源 = `docs/desktop/design/UI.md` §1 表行 15） |
| KD-26 | → `docs/desktop/design/ACTIVITY.md` §1 | — |
| KD-27 | → `docs/desktop/design/RENDERER.md` §1.6 | — |
| KD-28 | → `docs/desktop/design/SESSIONS.md` §1 | — |
| KD-29 | **内容面 / 会话面板视觉对齐 VSC（D21）**：值以 VSC webview 实值为源（三律 = 宿主主题色角色对位 · 语义常量值照搬 · 盒层单层律）；值表分处单源——内容面 **21 面** 住 `docs/render-core/design/RENDER-CORE.md` §5 · 会话面板面 **9 面** 住 `docs/desktop/design/UI.md` §1「批注（D21 · 会话流 / 会话面板视觉对齐 · 两项）」项 2；**结构零动**（外壳 / 主题体系 / 左列 + 标签条结构 / 行族结构不动）；新增变量 **14**（内容面 12 + 会话面板面 2——单源 = 主题表 `thincoder-desktop/renderer/theme.css`）；端差 **3** 项已全部处置 | 用户 2026-09-28 04:42 走查（① 会话流「样式与 VSC 区别很大」② 会话面板「与 vsc 端完全不同，我之前要求过对齐的」）+ 需求卷 **D21**；核产出件两端同形优先（推理内代码块——核档 §9 端差②） |
| KD-30 | **状态栏对齐 = 「屏面为准」重审**：标尺 = 屏面可见行为——**banner 四态（PLAN / AUTO / ADVISOR / ENG）上状态行行首**（与 CLI 同段位 / 同语义；「PLAN / ADVISOR 本端无该两态」旧裁不实——两态随会话槽恢复可为真）+ 静息状态词（就绪——**入状态词闭枚举**；词形来源 = CLI 静息值 `Ready`，核 i18n 无同源词）与输入提示段（Enter: send）补落 + 键位尾四件逐件坐实；段集 **18** | 用户 2026-09-28 05:34 / 05:38 走查裁定（「对齐」= 屏面为准；「旁置 / 不适用」等账面打折项逐项重审）；两态可为真实证 = `thincoder-core/session-lifecycle.mjs:111-134`（槽恢复）+ 桌面无该两态呈现面；「同一事实一处」在四态上状态行后落成（两态只住状态行一处——CLI 同理） |
| KD-31 | → `docs/desktop/design/COMPOSER.md` §1 | — |
| KD-32 | → `docs/desktop/design/ACTIVITY.md` §1 | — |
| KD-33 | → `docs/desktop/design/ACTIVITY.md` §1 | — |
| KD-34 | → `docs/desktop/design/ACTIVITY.md` §1 | — |
| KD-35 | → `docs/desktop/design/ACTIVITY.md` §1 | — |
| KD-36 | → `docs/desktop/design/ACTIVITY.md` §1 | — |

| KD-37 | → `docs/desktop/design/CHAT.md` §1 | — |
| KD-38 | **台账读数出站 = 启动拍 + 周期拍（`ev:ledger`；`REFRESH_MS` = 120s）** | VSC 两拍（端自持周期注册——间隔常数 = 核 `REFRESH_MS`）对位 = 桌面**启动拍 + 周期拍**（120s；直消费核 `startLedgerSurface`——单源 = `docs/desktop/design/IPC.md` §1 `ev:ledger` 行；项目级读数复读同点 = 开项目成功链） |
| KD-39 | → `docs/desktop/design/CHAT.md` §1 | — |
| KD-40 | → `docs/desktop/design/COMPOSER.md` §1 | — |
| KD-41 | → `docs/desktop/design/SESSIONS.md` §1 | — |
| KD-42 | **对齐审计强制输入 = 核档头「留端」清单 + 核注入缝登记表（两清单逐项对账 · 缺一项即红）**：此后任何以「对齐 ∕ 端差 ∕ 缺口清点」为名的审计（设计轮 ∕ 评审轮 ∕ 走查）**开审前**须以两份权威输入逐项对账——① 核档头 `留端：` 头注（全仓现读：`thincoder-render-core/**` 与核内相关档；**项级一行**）；② 核注入缝登记表（**每审现读原档**；设计面单源 = `docs/core/design/CORE-UNIFICATION.md` §2.13.3（函数面注入位表）＋ §2.13.4（④裁决行对照）；**对账面 = 设计面记录 ＋ 届盘复核**）**并补扫域外缝**（登记表未列者并行对账；**对账保持人工**——机械并扫命名族 `(configure\|reset\|set)[A-Z]` 会撞功能性 setter ⇒ 假阳性；先例 = `thincoder-core/prompt-files.mjs:92` 的 `configurePromptInjections`）。**判定三态**：复用 ∕ 上提 ∕ 真端差（三件齐 = 结构性不对称 + 证据 + 裁定）；**举证不足 ⇒ 消除**。**对账节载体**：每批设计内「对账节」在册。 | — |

| KD-43 | **右键编辑菜单 = 宿主面职责（Chromium role + 词表显式文案）**：① 机制 = `win.webContents.on("context-menu", …)` ⇒ 按 `params`（`isEditable` / `selectionText` / `editFlags`）构模板 ⇒ `Menu.popup({ window })`；条目集 = 可编辑 ⇒ 剪切 ∕ 复制 ∕ 粘贴 ∕ 全选（`enabled` 取 `editFlags`——缺键不禁用）· 非编辑 ∧ 选中 ⇒ 复制 ∕ 全选 · 非编辑 ∧ 空选 ⇒ **零菜单**；② 行为 = Chromium role 四件（执行径 = 主进程 `webContents` 方法——`contextIsolation` / `sandbox` 下成立）；③ 文案 = **显式 `label` 取词表**（`menu.edit.*` 四键两语；主进程 `loadConfig().locale` **现读**——`thincoder-desktop/src/main/attachments.mjs` 先例）——**不采 role 默认文案**（Electron v44.4.5 `lib/browser/api/menu-item-roles.ts`：默认文案 = 英文硬编码字面 ⇒ 直采即 `#533` 式 en-only 债）；④ 落点 = 新档 `thincoder-desktop/src/main/context-menu.mjs`（两纯函数 · 零 `electron`）+ `window.mjs` 落子 | 用户 02:59 走查（「vsc是可以选中文字然后用鼠标右键复制的……desktop端……不能用右键复制粘贴」）+ 需求 D27；VSC 侧右键 = VS Code 宿主自带（扩展零代码）⇒ 对齐面 = 本端宿主层 |

| KD-44 | → `docs/desktop/design/SETTINGS.md` §1 | — |
| KD-45 | → `docs/desktop/design/SETTINGS.md` §1 | — |
| KD-46 | → `docs/desktop/design/SETTINGS.md` §1 | — |
| KD-47 | → `docs/desktop/design/ACTIVITY.md` §1 | — |
| KD-48 | → `docs/desktop/design/RENDERER.md` §1.6 | — |
| KD-49 | → `docs/desktop/design/SETTINGS.md` §1 | — |
| KD-50 | → `docs/desktop/design/RENDERER.md` §1.6 | — |
| KD-51 | → `docs/desktop/design/COMPOSER.md` §1 | — |

| KD-52 | → `docs/desktop/design/COMPOSER.md` §1 | — |
| KD-53 | **桌面堆遥测与冻结取证**：① 遥测武装 = 新档 `thincoder-desktop/src/main/heap-watch.mjs`（本注新档）——**隔离形 = 策略面零 `electron` 顶层 import（禁令）**：electron 原语全经注入缝（点名 = `sample` ∕ `snapshot` ∕ `log` 三缝 + 冻结 ∕ 恢复动作原语）；装配住 `thincoder-desktop/src/main/main.mjs`（先例 = KD-35 `notify.mjs`）——60s 采样（注入缝 ⇒ 平 node 直测；先例 = CLI `thincoder-cli/src/heap-watch.mjs:41-79`）+ 双档阈值 70% ∕ 85%（与 CLI 同值）+ warn 行**带进程标签**（主进程自读 `process.memoryUsage()` ∕ `v8.getHeapStatistics()`；子进程读数 = `app.getAppMetrics()`——逐进程 type ∕ pid ∕ workingSet ∕ cpu）；② 快照双径 = 主进程 `v8.setHeapSnapshotNearHeapLimit(1)`（近上限自动落盘；CLI 先例 `thincoder-cli/src/crash-reports.mjs:87-89`）+ 渲染进程按需 `webContents.takeHeapSnapshot(path)`（**触发 = 健康期阈值（主进程自读堆比 `heapUsed ∕ heap_size_limit` ≥ 85% ∨ 渲染面 `workingSet` ≥ 800MB〔定值 = 两冻结案实测下沿 933MB × 0.85 ≈ 793 ⇒ 圆整；另一案读 = 2,926MB〕∧ ping 正常）∥ 冻结自复（`responsive` ≤ 宽限）——冻结阻塞期不可得（渲染主线程不可达，实测）**；once + 体积门 + native `Notification` 预告——零新 IPC；收正单源 = §2.11 D8）；③ 冻结门族 = `win.webContents` `unresponsive`（+ `responsive` 恢复记；主侧 ping 兜底——**定值 = 间隔 15s ∕ 超时 8s ∕ 连超 2**——**ping 径同序**：连续 2 次超时 ⇒ 落现场 ⇒ 宽限 ⇒ 恢复动作；grace ∕ once ∕ 5min 三守卫同施）∥ `render-process-gone` ⇒ 落 `~/.thincoder/crash-reports/`（与 CLI 同目录契约：现场 JSON〔双进程读数 + CPU + 动作序〕+ stderr 可见行）；**恢复动作（两径同）= 宽限 15s 持续不响应（`unresponsive` 未复 ∨ ping 续超时）⇒ `forcefullyCrashRenderer()` + `reload()`（换新渲染进程——官方恢复序；once ∕ 5min 节流；先落现场；在飞显示段暂缺至收尾重读——取舍在册 = §2.11 D9）**；**重载后补 = 活跃会话自动接续**（渲染侧 boot 补启：`project.cwd` 非空 ⇒ 自动一次 `session:resume`——既有单路 ∕ 零新通道 ∕ 主进程零改）；④ 配置键 = `diagnostics.heapWatch` ∕ `diagnostics.heapSnapshot` | — |
| KD-54 | → `docs/desktop/design/RENDERER.md` §1.6 | — |
| KD-55 | → `docs/desktop/design/ACTIVITY.md` §1 | — |
| KD-56 | → `docs/desktop/design/SESSIONS.md` §1 | — |
| KD-57 | **桌面排版基线（D29）= 一种字体 ∥ 一个字号 ∥ 行高 1.3 ∥ 字距 `normal` ∥ 自有文字零粗体**：① **统一值**（建议值——用户 ∥ 批准面裁）：字族 = `--mono` 等宽栈（`--font: var(--mono)` 一处切换——全栈同族：外壳 ∥ 内容面 ∥ 工具卡 ∥ 状态行 ∥ 面板 ∥ 核件消费面）；字号 = **14px**（`--fs`——= 现值 body ∥ 内容面同值；除基值外另见 8 ∥ 10 ∥ 11 ∥ 12 ∥ 13 ∥ 15 ∥ 16 ∥ 18px 八级全数归基线）；行高 = **1.3**（`--lh`——撤 1 ∥ 1.4 ∥ 1.45 ∥ 1.55 ∥ 1.6 ∥ 1.7 六值）；字距 = **`normal`**（`--ls`——撤 0.3px ∥ 0.5px ∥ 0.04em 三处 tracking；落位 = `theme.css` body 面 `letter-spacing: var(--ls)` 独立一行〔`font` 简写不载字距〕——全栈唯一声明点 ∥ 与验收判据同字）；变量单源 = `thincoder-desktop/renderer/theme.css`。② **自有文字零粗体**——自有三面 `font-weight` 全归 400（撤 500 ∥ 600 ∥ 700 三档——逐处 = §2 清册）；强调改**颜色通道**（既有色位承担——逐项 = `docs/desktop/design/UI.md` §1「批注（排版统一 · D29）」项 2）；**markdown 标记豁免**（`strong` 700 ∥ `h1–h6` ∥ `th`——用户「除了 markdown 里标了的」）。③ **markdown = 基线 + 修饰层**（不得自成独立体系）：正文族 ∥ 号 ∥ 行高 = 基线；修饰只许**相对（em）或非尺度通道**（粗体 ∥ 斜体 ∥ 色 ∥ 底 ∥ 边框）；**绝对 px 岛清零**（语言条 10px ∥ 复制钮 11px ∥ 推理族 12px ⇒ 基线）；值表单源 = `docs/render-core/design/RENDER-CORE.md` §5「排版统一覆盖」块（内容面）∥ `docs/desktop/design/UI.md` §1 批注表（外壳面）。④ **D21 关系**：排版通道（族 ∥ 号 ∥ 行高 ∥ 字距 ∥ 字重强调通道）以 D29 为准（D21「值以 VSC 实值为源」在排版通道被覆盖）；**结构 ∥ 盒值 ∥ 色面仍随 VSC**（D21 三律余域零改）。⑤ **核件零触**：`thincoder-render-core/**`（含 `composer/composer.css` 逐字锁）∥ VSC 侧零改；核件消费面（输入面板 ∥ 模型菜单 ∥ 搜索条）经**桌面覆盖段**（`thincoder-desktop/renderer/chat-composer.css`——特征度提升选择器）收敛。⑥ **回退配方**（用户否决统一值时）：`--font` 值复原系统 UI 栈 + 内容面族声明改指 `var(--font)`（逐点 = §2）。⑦ **边界**：功能 ∥ 布局零动；块外边距（含件级内边距）非本注射程——现值随轻通道轮四间距归一（单源 = `docs/desktop/design/CHAT.md` §2「批注（流内竖向间距）」）；markdown 语义保留（只动「自成体系」部分）；零通道 ∥ 零词键 ∥ 零 JS。 | 需求卷 **D29**（用户走查两条：「一种字体，一个字号，行间距字间距也都一样」∥「markdown…基于我们系统选定的字体和字号，再在这个基础上做格式修饰，不要弄出一个完全跟系统没关系的独立体系」）；既有在案 = `--mono` 正文等宽族（用户未否）+ 主阅读面现值 14px（「系统选定字号」最简解） |
| KD-58 | → `docs/desktop/design/ACTIVITY.md` §1 | — |

| KD-59 | **窗口重启最大化 = 启动序「隐建 → maximize → show」（「永远」语义——零窗口态记忆）**：① **落点** = `thincoder-desktop/src/main/window.mjs` `createWindow()`（窗口创建面单点——全仓唯一 `new BrowserWindow`）：`show: true ⇒ false` 隐建 ⇒ `win.maximize()` ⇒ `win.show()`（插点 = 构造函数后 ∥ `setMenu` 前）；② **时机判由（先 maximize 后 show）** = `maximize()` 官方语义「Maximizes the window. This will also show (but not focus) the window if it isn't being displayed already.」（`electron.d.ts:3105-3108` ∥ `:5897-5900`——宿主 = Electron 44.4.5）⇒ 隐藏窗上调用 ⇒ **首次显形即最大化态**（结构性防「默认尺寸闪一帧」）——**推论待真机证**：官方文本未声明「显形即最大化 ∥ 无中间尺寸帧」、本仓无 Electron 原生实现可读面 ⇒ 判径 = §7 **T-DSK53** 首帧用例（`show()` 当刻读 `isMaximized()` ∥ 首帧录屏 ∕ 截图走查）；实测否 ⇒ 序收正（候选 = `show()` 后补 `maximize()`；判据用例随动）；`show()` 官方语义「Shows and gives focus to the window.」（`:3620-3622`）⇒ 补「显形 + 聚焦」（maximize 顺带 show **不聚焦**——不补则启动窗首显不聚焦）；③ **「永远」语义** = 每次启动无条件 maximize——**零窗口态读写**（不读 `isMaximized` ∥ 不落存储 ∥ 不判上次态）：手动缩小 ∥ 最大化 ∥ 最小化后退出皆同归启动最大化（用户字面确认）；**运行期零干预**（用户手动缩放不回夺——射程 = 「重启 ⇒ 打开即最大化」）；④ **平台面**（三平台皆取原生最大化语义）：Windows = 最大化（占满工作区）· macOS = 原生 zoom（`zoomToPageWidth` 默认 false ⇒ 到屏宽——非全屏；如欲全屏 = `setFullScreen`）· Linux = WM 最大化；⑤ **既有窗口逻辑交互（全零改）**：尺寸常量（1200×800 · 下限 800×600）退为**还原尺寸**（un-maximize 回原尺寸；min 约束不变）· 单实例（非主实例零窗口——零 maximize 面）· 记忆面（本端零窗口态存储既有——保持零）· `--smoke`（同经 `createWindow` ⇒ 冒烟窗同最大化——探针 ∥ 引导位读数零影响；冒烟 JSON 字段闭集零改） · **fail-open 档**（平台忽略 maximize ⇒ `show()` 兜底 ⇒ 窗口仍显形、不最大化；不悬窗 ∥ 零告警 ∥ 零重试——可接受降级）；⑥ **边界** = 窗口态记忆（位置 ∥ 尺寸 ∥ 最大化态）不做 · 最小化 ∥ 全屏 ∥ 置顶不做 · 核 ∥ `thincoder-render-core` ∥ 渲染面 ∥ 通道 ∥ preload ∥ `thincoder-desktop/src/main/main.mjs` 零触 | 需求 D31 逐字（「重启 ⇒ 打开即最大化」+「永远」字面确认）；判由 = **首帧序须结构性防闪**——「隐建 → maximize → show」序由官方 API 语义直接支持；「保留 `show: true` + 后补 maximize」（含 show 后 maximize）之别：开窗即可见 ⇒ 尺寸切换的可视帧无契约保证（平台 ∥ 时序相关——概率面非结构面） |

| KD-60 | → `docs/desktop/design/ACTIVITY.md` §1 | — |
| KD-61 | **主题三态 = 渲染面 `data-theme` 状态（用户值）覆写系统缺省**：① **状态载体** = `data-theme` 属性——闭集 `system` ∥ `light` ∥ `dark`（缺省 `system`）；**单写者 = `thincoder-desktop/renderer/theme.mjs`**（`initTheme` / `setTheme`——`documentElement.dataset.theme` 唯一写径）；「跟随系统」= 状态值一枚（非零态）：媒体缺省 + `light-dark()` 随系统解析（系统翻转零 JS）；② **值面**（`thincoder-desktop/renderer/theme.css`）= 原「亮缺省块 + `@media` 暗块」收敛为**单块 `light-dark(亮, 暗)` 值对**（色值对 24——暗值逐字保原；`--error-fg` 同值单列）+ `color-scheme` 三态覆写；`@media (prefers-color-scheme: dark)` 退场；**D29 基线四值零动**；③ **切换面** = 设置面板头三态钮族（`data-action="settings:theme"` + `data-theme` 目标值 + `data-active` / `aria-pressed` 当前态；序 = 跟随系统 ∥ 亮色 ∥ 暗色）；④ **持久化** = 渲染面 `localStorage`（键 `thincoder.desktop.theme`——三值闭集串）——端自有 UI 态类（先例 = `poolWidth` ∥ VSC `modelPrefs`@`workspaceState`「非会话文件」；`app://` standard+secure ⇒ Web Storage 持久）；读 = 装配期一次 ∥ 写 = 点按即刻；读 ∥ 写皆捕获 + `console.error`，读失败 ∥ 表外值 ⇒ `system`（降级），写失败 ⇒ 会话内照常（fail-soft）；⑤ **store 镜像** = 顶层切片 `theme`（装配播种 ∥ 出口写；`SETTINGS_KEYS` 增 `theme`——设置面重绘径；`dataset.theme` 应用仍在 `theme.mjs`——同步不经帧）；⑥ **边界** = 窗口画布色 ∥ 原生面（菜单 ∥ 对话框 ∥ 标题栏）仍随系统（主进程不以用户值驱动原生面——`resolveTheme()` 零改；唯菜单勾选态显示缓存一枚——**KD-65** ②）· 主题换肤（色板 ∥ 自定义）不做 · 核 ∥ `thincoder-render-core` ∥ CLI ∥ VSC 零触 · 通道 ∥ preload 零新面 | D33 逐字（亮 ∥ 暗 ∥ 跟随系统 + 记住（重启恢复））+ D30 同族（用户偏好持久化——`localStorage` 先例） |
| KD-62 | → `docs/desktop/design/ACTIVITY.md` §1 | — |
| KD-63 | → `docs/desktop/design/RENDERER.md` §1.6 | — |
| KD-64 | → `docs/desktop/design/PACKAGING.md` §1 | — |
| KD-65 | → `docs/desktop/design/MENU.md` §1 | — |
| KD-66 | → `docs/desktop/design/SETTINGS.md` §1 | — |
| KD-67 | → `docs/desktop/design/MENU.md` §1 | — |
| KD-68 | → `docs/desktop/design/SETTINGS.md` §1 | — |

| KD-69 | **P1 读数端面消费 = `dbBytes` + 逐 origin 行数上屏（桌面索引段 ∥ VSC 设置面）**：① **数据面已就绪**——核只读出口 `memoryStatus()` 回执携 `dbBytes`（库文件 `statSync`）∥ `origins`（逐 origin code ∥ doc 行数、按名排序；`thincoder-core/memory-status.mjs:48-49`）；② **桌面** = `readIndexCounts` 回执扩两键（`dbBytes` ∥ `origins` 透传——端侧零 SQL 纪律保持；`thincoder-desktop/src/main/index-status.mjs:31-44`）+ 设置面「工具与服务」段增两读（库大小行 + 逐 origin 行数行；词键 ∥ 形 = 实施轮定）；③ **VSC** = `pushIndexStatus` 载荷扩两键（`thincoder-vscode/src/extension/panel-index.mjs:43-56`——取值 = 核出口透传，不另造 SQL）+ `#index-status` 区增两读（`thincoder-vscode/webview/settings-tools.js` `renderIndexStatus` 族）；④ **刷新拍** = 与既有索引读数同拍（设置面加载 ∥ 构建后推送——零新通道、零新计时器）；⑤ **呈现位边界** = 不做常驻状态栏段（状态行 = CLI 对齐段集闭集——零增）；**入档 = 桌面侧详文已回填 `docs/desktop/design/SETTINGS.md` §2.13；VSC 侧已落 `docs/vsc/design/SETTINGS.md` §2.5** | 核出口回执档头实读（`memory-status.mjs:11-20`）；端侧零 SQL 纪律 |

| KD-70 | **桌面 MCP 警告消费 = 装配后入 `_pendingReminders`（会话内提醒 · CLI 同形）**：① **裁定 = 补消费**（备选②收窄句 ∥ ③认账不排期 = 否）；② **落点** = 桌面装配尾（`thincoder-desktop/src/main/agent-host.mjs` `assembleAndLoad`；**写点 = `agent-assemble.mjs:121`——定义档 ∥ 转口档（同名 re-export）关系沿本档 §4 装配面行；实施轮首步现读钉定**）——`agent._mcpWarnings` 非空 ⇒ 构造提醒入 `agent._pendingReminders`（核消费点 = 下一条 user 消息注入——`thincoder-core/agent/setup.mjs:170-174`；装配一次推送一次，同 key 复用不重推——CLI 同形）；③ **词面** = 首两段逐字同 CLI（计数 + 逐条；单源 = `thincoder-cli/src/command-interactive.mjs:151-155`），末行指路 = **桌面可达出口**（设置面 MCP 段重连——CLI 的 `/mcp connect` 桌面不存在，逐字照搬即误导；语义 = 指路可达出口；词面 ∥ 载体（既有键拼装 ∥ 字面串 ∥ 新键）∥ 语言口径 = 实施轮落词前现读钉定——若需新键 ⇒ ④ 随正）；④ **可见面** = 会话内系统提醒（与 CLI 同面——零新 UI ∥ 零新词键）；⑤ **边界** = VSC 第三面未并（端差在册——列报）；`.mcp.json` ∥ 连接 ∥ 管理面语义零触；核档 `docs/core/design/MCP.md` §6.4 消费面句同拍（已落） | 实读：写点 `thincoder-desktop/src/main/agent-assemble.mjs:121`、全仓消费点仅 CLI；核档 `docs/core/design/MCP.md` §6.4 句对桌面原不成立 |

| KD-71 | → `docs/desktop/design/PACKAGING.md` §1 | — |
| KD-72 | → `docs/desktop/design/PACKAGING.md` §1 | — |
| KD-73 | → `docs/desktop/design/PACKAGING.md` §1 | — |
| KD-74 | → `docs/desktop/design/RENDERER.md` §1.6 | — |
| KD-75 | → `docs/desktop/design/SETTINGS.md` §1 | — |
| KD-76 | → `docs/desktop/design/SETTINGS.md` §1 | — |
| KD-77 | → `docs/desktop/design/SETTINGS.md` §1 | — |
| KD-78 | → `docs/desktop/design/COMPOSER.md` §1 | — |
| KD-79 | → `docs/desktop/design/SETTINGS.md` §1 | — |

### 2.1 宿主下限读数

- 宿主下限的**具体版本号**：Electron 内置 Node = `"24.21.0"`（Electron 44.4.5）；阈值面 = `thincoder-desktop/src/main/host-floor.mjs:9`（`MIN_NODE = "24.0.0"`）⇒ KD-7 下限（Electron ≥ 44.x）成立。

### 2.2 挂起窗键面路由注

→ 见 `docs/desktop/design/ACTIVITY.md` §3。

## 3. 架构与接口契约（分档导航）

各面按板块分档落定（单一权威源——本节每面只留一行指针，不留正文副本）：

### 3.1 进程与目录形态

→ 见 `docs/desktop/design/SHELL.md` §1（三层进程 · 目录树 · 分层铁律）。

### 3.2 主 ↔ 渲染 IPC 契约（窄面）

→ 见 `docs/desktop/design/IPC.md` §1（主 → 渲染事件表）· §2（渲染 → 主请求表）。

### 3.3 与核的接口面逐项点名（七面）

→ 见 `docs/desktop/design/SHELL.md` §3（七面表 + 「不改核」行）。

### 3.4 壳装配第三份

→ 见 `docs/desktop/design/SHELL.md` §4（`agent-host.mjs` 五项职责 + 装配序上提核件与余端差行）。

### 3.5 活动池与状态位（需求档 §3.5 三项落定）

→ 见 `docs/desktop/design/UI.md` §2（三项处置表 + 旁证行）。

## 5. 打包链与发行面（需求卷 D12 ∕ D32）

→ 见 `docs/desktop/design/PACKAGING.md` §2（打包链与发行面——配置契约 ∥ 构建序列 ∥ 签名就绪 ∥ 图标资产 ∥ 产物校验 ∥ 失败面 ∥ 其余面 ∥ **自动更新（§2.8）** ∥ **官网桌面面（§2.9）** ∥ 发布窗承接（§2.10））。

## 8. 边界（不做）

- **（设置面样式收正 · D37）不做**：交互语义 ∥ 功能增删（渠道四动作 ∥ masked 钥 ∥ 当前标全保留——无新增动作）· 七段信息架构（段集 ∥ 段序）· 布局面（48rem 居中列）· 圆角（非卡余域）∥ 600 字重 ∥ 标上行表单（端差登记——沿 D24 ∥ D29 ∥ 扁平化基线）· 主题变量表 ∥ 断点（零新变量 ∥ 零新断点）· 核 ∥ `thincoder-render-core` ∥ CLI ∥ VSC 零触。

- **不做**需求档 §5 所列：文件视图 / 编辑器本体 / 内置 diff（暂缓三件——「打开」已由 D19 ∕ KD-39 解） · 常驻多项目面板 / 项目切换器 · 云服务 / 工作流引擎 · 复制核机制 · 另立存储格式 · ACP 面之外的新协议面 · 通用编辑器 / IDE。
- **贯穿不做**：改核**机制语义**（纯加法三处，授权在案）；**留档批例外（在案）**：`thincoder-core/history-window.mjs` 记录直通 opt-in 一条——纯加法 ∥ 默认径逐字等价）· 需求档与提示词面。
- **本轮不做**（设计面明确排除）：更新通道扩展（beta/alpha ∥ 回滚 ∥ 降级安装——自动更新 = **桌面发布·阶段二批落**（`docs/desktop/design/PACKAGING.md` §2.8））· **公证执行**（mac 面——阶段二；**代码签名 = 就绪形**——证书在位即实签、未签版 = 明示测试形——单源 = `docs/desktop/design/PACKAGING.md` §2.3）· 多窗口 · 全局快捷键。
- **（装配桥批）不做**：`msg:*` 的 UI 输入区与中断键（视图批）· MCP 连接（设置批）· 工程模式 manifest 附着（`docs/desktop/design/SHELL.md` §4 端差注）· 审批卡 `changes` 摘要供给（核侧缺该键 ⇒ 卡面无摘要行——`docs/desktop/design/IPC.md` §1）· 多实例协作面。
- **（设置面批）不做**：`memory:status` 通道与索引状态面板（`index:build` ∕ `index:status`）· 端侧直读核内表（不授权）· 打包与发行 · 主题切换面。
- **（会话级偏好 / 档位枚举化 / 占用读数 / 附件与复制）不做**：斜杠命令（需求档 §3.5 边界裁定——需求卷 **D34**）·
  真代码块面（围栏切分 / 语言高亮 / 代码块级出口——`docs/render-core/design/RENDER-CORE.md` §2 KD-RC-4 / §4 行 11）· 端侧自建落盘与图片指针格式（落盘径 = 核）· 主题 / 通知面 · 用量面板（状态栏读数以外）· CI 接线（随三平台 CI 批）。
- **（追加轮）不做**：真实模型回路下的发送成功面（空 fixture 家 ⇒ 无凭据 ⇒ 断言只覆盖失败可见面：文本保留 + `console.error`）· 引导面另立样式档（沿现盘 `.chat-empty`）· 需求档补条目 ⇒ **已落**（需求档 **D16** = 首启空态引导；本档 §6.1 D16 行同源）。
- **（对话面板）不做**：斜杠命令 · 模型 / provider 切换 · 推理档位 · 上下文占用读数 · 附件与导出 · 文件树 / diff / 终端（需求档 §5）——后四项中前四者与附件 / 导出同归会话面。
- **（桌面端 E2E 基建批）不做**：web 快筛与 Electron 一致性核（判据④——Electron = 唯一权威面）（**状态注**：web 快筛工具已落形——`docs/desktop/design/WEB-QUICKCHECK.md`（开发期回路 ∥ 不作验收判据）；一致性核维持不做）· CI 接线（随三平台 CI 批）· 第二 runner / 测试框架（`@playwright/test` 等——`node --test` 单入口不变）· 视觉 / 像素回归（只断言 PNG 存在 + magic）
  · 错误 / 边界用例三条（`T-DSK27b` / `T-DSK27c` / `T-DSK27d`）· 产品码改动（`thincoder-desktop/src/**` / `thincoder-desktop/renderer/**` 零改）——单源 = `docs/desktop/design/E2E-TESTING.md` §6 / §7 / §8。
- **（可见面修复批）不做**：#426 窄窗左列折叠**交互**（**R13 后无对象**——左列裁撤退场；窄窗残留 = 池面窄窗态（本档 §1「open」行））· #440 真代码块面（围栏切分 / 语言高亮——`docs/render-core/design/RENDER-CORE.md` §4 行 11）· 核（`thincoder-core/**`）零触碰。
- **（对齐重定位批）不做**：CLI 代码面（D17 = 语义对位——零触碰）· 核化滚动 / 回填 / 窗口裁剪（各端在册机制不动——核档 §4 行 13–15）· 提示词面与需求档（笔权在父侧）。
- **（残余批 · D17 / D19）不做**：状态行段集 / 段判据（R3a 在册）· 视觉面· VSC 侧零改 · 核机制语义（除 §6.24 只读出口一处）——`tokens` / `timers` 等 12 段不属播种面（单源 = `docs/desktop/design/UI.md` §1「批注（D17 / D19 · 残余补齐）」项 1）。
- **（重启自动重开）不做**：会话恢复逻辑改动（核 ∥ 渲染面零改——渲染面 boot 接续门既有）· 最近目录列表 UI· 「打开成功但接续未达」窄窗的显式写点（须新存储面——KD-56；窄窗 fail-soft 自愈）· 多项目并行面（需求 §5.1）· 另两端记录（`.cli` ∕ `.vscode`）零读写 · 多实例协作机制本体（单实例锁既有）。
- **（右栏宽度拖动 · D30）不做**：键盘调整 ∥ 双击复位（均未入需求）· 空池 ∕ 有池自动宽度（单一权威 = 用户值）· 未拖过态窄窗挤压（默认 36rem 零变——UI「open」行残留项保持）· 核 ∥ `thincoder-render-core` ∥ 主进程 ∥ 通道面 ∥ preload 零触（纯渲染面面内设施）· 左列 ∥ 中列 ∥ 池内容行为零改。
- **（窗口重启最大化 · D31）不做**：窗口态记忆（位置 ∥ 尺寸 ∥ 最大化态——「永远」语义已裁：每次启动恒最大化 ∥ 零读写）· 运行期窗口干预（用户手动缩放不回夺——射程 = 重启 ⇒ 打开即最大化）· 最小化 ∥ 全屏 ∥ 置顶 · 核 ∥ `thincoder-render-core` ∥ 渲染面 ∥ 通道 ∥ preload ∥ `thincoder-desktop/src/main/main.mjs` 零触。
- **（主题切换 · D33）不做**：窗口画布色 ∥ 原生面（菜单 ∥ 对话框 ∥ 标题栏）随系统（主进程不以用户值驱动原生面——需跨进程载波；唯菜单勾选态显示缓存一枚——**KD-65** ②）· 主题换肤（色板 ∥ 自定义主题 ∥ 导入导出）·
  跟随系统的 OS 级联动面（`themeSource`）· markdown 排版基线（D29——零动）·
  CLI ∥ VSC 两端零触 · 核 ∥ `thincoder-render-core` ∥ 通道表 ∥ preload 零改。
- **（斜径命令面 · D34）不做**：补全（Tab——Web 焦点键）· 携参直切（`slash.args` 拒）· CLI 27 条中未落者（不做 9）· VSC 命令面（零接缝）；**命令表归端** ∥ 核共享层缝 = **纯加法可选**（不传 `deps.slash` ⇒ 现行为零变——VSC 零接缝）∥ CLI ∥ VSC ∥ `thincoder-core` 零触。
- **（桌面打包发布 · 阶段一）不做**：自动更新（升级 = 手动下载覆盖——**桌面发布·阶段二批落** · `docs/desktop/design/PACKAGING.md` §2.8）· 免安装包 ∥ macOS ∥ Linux 产物 ∥ 应用商店（Windows 商店 ∥ Snap）∥ 公证 = 阶段二
  · `src/**` ∥ `renderer/**` 产品码零改（打包链 = 构建期面）· 站点仓零写（规格 = `docs/desktop/design/PACKAGING.md` §2.9——执行 = 主 agent 轮）· 未签版不阻断测试形（签名跳过 = 明示非失败——发布版须已签）。
- **（菜单体系 · D36）不做**：托盘区 ∥ 自绘菜单 ∥ 全量快捷键体系 ∥ 检查更新（`docs/desktop/design/PACKAGING.md` §2.8）∥ 语言切换进菜单（设置面单源）∥ **菜单项选中态 = 唯主题▸带勾**（命令下行 + 状态回读 `theme:state`——限度 = 报告缓存（零直读）；其余条目零选中态）
  ∥ 窗口组回复（minimize/zoom——按五组枚举退场；如需保留 = 加一组即可）· `context-menu.mjs`（D27）∥ `projects.mjs` ∥ 核 ∥ `thincoder-render-core` ∥ CLI ∥ VSC 零触。
- **（设置菜单升级 · D38 ∥ D39）不做**：独立设置窗口（B 案——用户明令）∥ 帮助组改动（零动——「关于与快捷键」= 第二入口）∥ 设置页撤除（**保留并存**）∥ 七段值面语义（读写 ∥ 确认 ∥ 失败链全复用）∥ 全量快捷键 ∥ 托盘 ∥ 自绘菜单 · 核 ∥ `thincoder-render-core` ∥ CLI ∥ VSC 零触。

- **（桌面发布 · 阶段二 · 自动更新 ∥ 官网桌面面）不做**：beta/alpha 通道 ∥ 回滚 ∥ 降级安装 ∥ 周期拍 ∥ 应用内更新进度 UI ∥ 渲染面更新面（须新 IPC 通道）· macOS ∥ Linux ∥ 应用商店 ∥ 免安装包 = 阶段二余片 · 站点仓零写（规格 = `docs/desktop/design/PACKAGING.md` §2.9——实现 = 父侧轮）· 核 ∥ CLI ∥ VSC ∥ `thincoder-render-core` 零触（更新面全主进程）。

## 9. 界面形态落定（UI / 交互决策）

→ 见 `docs/desktop/design/UI.md` §1（形态与交互面 **21 行**；计法 = §1 表行条目数）· `docs/desktop/design/RENDERER.md` §2 / §3（工艺面 2 行：有界渲染窗口 / 回填与跟滚）——合计 **23 行**。

## 11. 范本借用清单（UI 范式勘察落档）

→ 见 `docs/desktop/design/UI.md` §3（形态面 5 行 · 第 7–11 项 · 清单前言单源）· `docs/desktop/design/RENDERER.md` §4（实现工艺面 6 行 · 第 1–6 项）。

## 二、跨域段

> 本节区 = 各域迁出后的跨域 ∥ 总表面——§4 受影响文件清单（域档分持后的残面：指针表 ∥ 测试三分 ∥ 判不决块留原址）· §6 验收总表 · §7 用例总表；判不决块 ∥ 测试三分 ∥ 留驻行 = 跨域内容（原址保留——域内容已迁者 = 一行指针）。

## 4. 受影响文件清单

### 4.1 本端文件清单与行数预算

本表 = **逐档指针索引**（行数预算**值行单源** = 各域表「文件账」节——本表不复制值；`docs/desktop/design/SHELL.md` §1 树不复制预算列）；**新档落盘随批登记**（此后新档：值行由落盘批在所属域表补行，本表同拍补指针行）——行数口径 = 内容行数（文末换行不计）；**行数面机检 = `checkConfig.lineCounts` 声明（`PROJECT-MANIFEST.json`）——doc-check 行数族**。

| 文件 | 预估行数 | 说明 |
|---|---|---|
| `thincoder-desktop/package.json` | → `docs/desktop/design/PACKAGING.md` §3.1 | — |
| `thincoder-desktop/electron-builder.yml`（本注落） | → `docs/desktop/design/PACKAGING.md` §3.1 | — |
| `thincoder-desktop/.gitignore` | → `docs/desktop/design/E2E-TESTING.md` §9.1 | — |
| `thincoder-desktop/src/main/main.mjs` | → `docs/desktop/design/SHELL.md` §5.1 | — |
| `thincoder-desktop/src/main/host-floor.mjs` | → `docs/desktop/design/SHELL.md` §5.1 | — |
| `thincoder-desktop/src/main/window.mjs` | → `docs/desktop/design/SHELL.md` §5.1 | — |
| `thincoder-desktop/src/main/context-menu.mjs` | → `docs/desktop/design/SHELL.md` §5.1 | — |
| `thincoder-desktop/src/main/menu-words.mjs`（新档；菜单体系扩键） | → `docs/desktop/design/MENU.md` §3.1 | — |
| `thincoder-desktop/src/main/app-menu.mjs` | → `docs/desktop/design/MENU.md` §3.1 | — |
| `thincoder-desktop/renderer/menu-actions.mjs` | → `docs/desktop/design/MENU.md` §3.1 | — |
| `thincoder-desktop/src/main/protocol.mjs` | → `docs/desktop/design/SHELL.md` §5.1 | — |
| `thincoder-desktop/src/main/ipc.mjs` | → `docs/desktop/design/IPC.md` §3.1 | — |
| `thincoder-desktop/src/main/ipc-relays.mjs` | → `docs/desktop/design/IPC.md` §3.1 | — |
| `thincoder-desktop/src/main/agent-host.mjs` | → `docs/desktop/design/SHELL.md` §5.1 | — |
| `thincoder-desktop/src/main/turn-driver.mjs`（R3 拆点落形 · 新档） | → `docs/desktop/design/SHELL.md` §5.1 | — |
| `thincoder-desktop/src/main/suspension-drive.mjs` | → `docs/desktop/design/ACTIVITY.md` §4 | — |
| `thincoder-desktop/src/main/suspension-guard.mjs` | → `docs/desktop/design/ACTIVITY.md` §4.1 | — |
| `thincoder-desktop/src/main/suspension-timers.mjs`（消化面留档批拆分产 · 新档） | → `docs/desktop/design/ACTIVITY.md` §4 | — |
| `thincoder-desktop/src/main/timer-watch.mjs`（timer-wake 阶段 2 新档） | → `docs/desktop/design/ACTIVITY.md` §4.1 | — |
| `thincoder-desktop/src/main/notify.mjs`（本注新档） | → `docs/desktop/design/ACTIVITY.md` §4.1 | — |
| `thincoder-desktop/src/main/turn-face.mjs`（在册预案落形档） | → `docs/desktop/design/SHELL.md` §5.1 | — |
| `thincoder-desktop/src/main/turn-chain.mjs`（在册预案落形） | → `docs/desktop/design/SHELL.md` §5.1 | — |
| `thincoder-desktop/src/main/queued-input.mjs`（「回合中插入」批新档） | → `docs/desktop/design/COMPOSER.md` §3.1 | — |
| `thincoder-desktop/src/main/window-queue.mjs`（在册预案落形 · 合并实施轮新档） | → `docs/desktop/design/COMPOSER.md` §3.1 | — |
| `thincoder-desktop/src/main/agent-assemble.mjs`（状态栏对齐批新档） | → `docs/desktop/design/SHELL.md` §5.1 | — |
| `thincoder-desktop/src/main/agent-bridge.mjs` | → `docs/desktop/design/SHELL.md` §5.1 | — |
| `thincoder-desktop/src/main/suspensions.mjs` | → `docs/desktop/design/SHELL.md` §5.1 | — |
| 会话族六行（`session-io.mjs` ∥ `session-slots.mjs` ∥ `session-maintenance.mjs` ∥ `session-actions.mjs` ∥ `sessions.mjs` ∥ `projects.mjs`） | → `docs/desktop/design/SESSIONS.md` §3 | — |
| `thincoder-desktop/src/main/settings.mjs` | → `docs/desktop/design/SETTINGS.md` §3.1 | — |
| `thincoder-desktop/src/main/providers.mjs` | → `docs/desktop/design/SETTINGS.md` §3.1 | — |
| `thincoder-desktop/src/main/mcp-servers.mjs` | → `docs/desktop/design/SETTINGS.md` §3.1 | — |
| `thincoder-desktop/src/main/project-info.mjs` | → `docs/desktop/design/UI.md` §4.1 | — |
| `thincoder-desktop/src/main/attachments.mjs` | → `docs/desktop/design/COMPOSER.md` §3.1 | — |
| `thincoder-desktop/src/main/file-links.mjs`（对齐第三批新档） | → `docs/desktop/design/CHAT.md` §3.1 | — |
| `thincoder-desktop/src/main/file-refs.mjs`（@ 文件引用对齐批新档） | → `docs/desktop/design/COMPOSER.md` §3.1 | — |
| `thincoder-desktop/src/main/at-complete.mjs`（R1 输入面板移植新档） | → `docs/desktop/design/COMPOSER.md` §3.1 | — |
| `thincoder-desktop/src/main/exec-run.mjs`（R3 新档） | → `docs/desktop/design/SHELL.md` §5.1 | — |
| `thincoder-desktop/src/main/prompt-injections.mjs`（R4 新档） | → `docs/desktop/design/SHELL.md` §5.1 | — |
| `thincoder-desktop/src/main/loop-sampler.mjs`（口子清零二轮新档） | → `docs/desktop/design/SHELL.md` §5.1 | — |
| `thincoder-desktop/src/main/heap-watch.mjs`（桌面堆取证修复批 · 新档） | → `docs/desktop/design/SHELL.md` §5.1 | — |
| `thincoder-desktop/src/main/settings-values.mjs`（R7 拆档产出） | → `docs/desktop/design/SETTINGS.md` §3.1 | — |
| `thincoder-desktop/src/main/config-watch.mjs`（R8 落子壳） | → `docs/desktop/design/SETTINGS.md` §3.1 | — |
| `thincoder-desktop/src/main/index-status.mjs`（R2 新档） | → `docs/desktop/design/SETTINGS.md` §3.1 | — |
| `thincoder-desktop/src/main/session-flags.mjs`（R1 输入面板移植新档） | → `docs/desktop/design/SESSIONS.md` §3.1 | — |
| `thincoder-desktop/src/main/settings-env.mjs`（R7 拆档产出） | → `docs/desktop/design/SETTINGS.md` §3.1 | — |
| `thincoder-desktop/src/main/settings-tools.mjs`（R7 拆档产出） | → `docs/desktop/design/SETTINGS.md` §3.1 | — |
| `thincoder-desktop/src/preload/preload.cjs` | → `docs/desktop/design/IPC.md` §3.1 | — |
| `thincoder-desktop/renderer/index.html` | → `docs/desktop/design/UI.md` §4.1 | — |
| `thincoder-desktop/renderer/theme.css`（R13 四拆分产） | → `docs/desktop/design/UI.md` §4.1 | — |
| `thincoder-desktop/renderer/chrome.css`（R13 四拆分产） | → `docs/desktop/design/UI.md` §4.1 | — |
| `thincoder-desktop/renderer/session-list.css` | → `docs/desktop/design/SESSIONS.md` §3 | — |
| `thincoder-desktop/renderer/skin.css`（R13 四拆分产） | → `docs/desktop/design/UI.md` §4.1 | — |
| `thincoder-desktop/renderer/chat.css` | → `docs/desktop/design/CHAT.md` §3.1 | — |
| `thincoder-desktop/renderer/pool.css` | → `docs/desktop/design/ACTIVITY.md` §4.1 | — |
| `thincoder-desktop/renderer/app.mjs` | → `docs/desktop/design/RENDERER.md` §5.1 | — |
| `thincoder-desktop/renderer/events.mjs` | → `docs/desktop/design/RENDERER.md` §5.1 | — |
| `thincoder-desktop/renderer/events-blocks.mjs` | → `docs/desktop/design/RENDERER.md` §5.1 | — |
| `thincoder-desktop/renderer/events-slices.mjs` | → `docs/desktop/design/RENDERER.md` §5.1 | — |
| `thincoder-desktop/renderer/events-status.mjs`（R4 拆档产出） | → `docs/desktop/design/RENDERER.md` §5.1 | — |
| `thincoder-desktop/renderer/events-wake.mjs`（R5 拆档产出） | → `docs/desktop/design/ACTIVITY.md` §4 | — |
| `thincoder-desktop/renderer/events-flags.mjs`（输入面板移植拆档产出） | → `docs/desktop/design/RENDERER.md` §5.1 | — |
| `thincoder-desktop/renderer/questions.mjs`（残余批拆档产出） | → `docs/desktop/design/CHAT.md` §3.1 | — |
| `thincoder-desktop/renderer/events-subscribe.mjs` | → `docs/desktop/design/RENDERER.md` §5.1 | — |
| `thincoder-desktop/renderer/page-read.mjs`（对齐第二批拆分产出） | → `docs/desktop/design/CHAT.md` §3 | — |
| `thincoder-desktop/renderer/subagent-reduce.mjs`（对齐第二批拆分产出） | → `docs/desktop/design/ACTIVITY.md` §4.1 | — |
| `thincoder-desktop/renderer/queue.mjs`（对齐第二批拆分产出） | → `docs/desktop/design/COMPOSER.md` §3.1 | — |
| `thincoder-desktop/renderer/badges.mjs`（残余批拆分产出） | → `docs/desktop/design/RENDERER.md` §5.1 | — |
| `thincoder-desktop/renderer/mount-pool.mjs` | → `docs/desktop/design/ACTIVITY.md` §4.1 | — |
| `thincoder-desktop/renderer/pool-width.mjs` | → `docs/desktop/design/ACTIVITY.md` §4.1 | — |
| `thincoder-desktop/renderer/theme.mjs` | → `docs/desktop/design/UI.md` §4.1 | — |
| `thincoder-desktop/renderer/search.mjs`（R6 落） | → `docs/desktop/design/UI.md` §4.1 | — |
| `thincoder-desktop/renderer/heartbeat.mjs`（R10 落） | → `docs/desktop/design/RENDERER.md` §5.1 | — |
| 会话族三行（`mount-sessions.mjs` ∥ `session-wire.mjs` ∥ `views/session-control.mjs`） | → `docs/desktop/design/SESSIONS.md` §3 | — |
| `thincoder-desktop/renderer/dom.mjs` | → `docs/desktop/design/RENDERER.md` §5.1 | — |
| `thincoder-desktop/renderer/view-state.mjs` | → `docs/desktop/design/RENDERER.md` §5.1 | — |
| `thincoder-desktop/renderer/i18n.mjs` | → `docs/desktop/design/UI.md` §4.1 | — |
| `thincoder-desktop/renderer/i18n-views.mjs`（对齐第三批拆分产出） | → `docs/desktop/design/UI.md` §4.1 | — |
| `thincoder-desktop/renderer/i18n-composer.mjs`（输入面板上提批拆档产出） | → `docs/desktop/design/UI.md` §4.1 | — |
| `thincoder-desktop/renderer/i18n-settings.mjs`（i18n 拆分批产出） | → `docs/desktop/design/UI.md` §4.1 | — |
| `thincoder-desktop/renderer/store.mjs` | → `docs/desktop/design/RENDERER.md` §5.1 | — |
| `thincoder-desktop/renderer/views/chat.mjs` | → `docs/desktop/design/CHAT.md` §3.1 | — |
| `thincoder-desktop/renderer/views/chat-tree.mjs`（消化面留档批拆分产 · 新档） | → `docs/desktop/design/CHAT.md` §3.1 | — |
| `thincoder-desktop/renderer/views/chat-model.mjs`（更新纪律收核批 · 拆分产出） | → `docs/desktop/design/CHAT.md` §3.1 | — |
| `thincoder-desktop/renderer/frame-dispatch.mjs`（更新纪律收核批） | → `docs/desktop/design/RENDERER.md` §5.1 | — |
| `thincoder-desktop/renderer/views/chat-chrome.mjs`（对齐第三批拆分产出） | → `docs/desktop/design/CHAT.md` §3 | — |
| `thincoder-desktop/renderer/views/chat-digest-rows.mjs` | → `docs/desktop/design/ACTIVITY.md` §4 | — |
| `thincoder-desktop/renderer/views/chat-pending.mjs`（对齐第二批新档） | → `docs/desktop/design/CHAT.md` §3.1 | — |
| `thincoder-desktop/renderer/views/chat-subagent.mjs`（对齐第二批新档） | → `docs/desktop/design/CHAT.md` §3.1 | — |
| `thincoder-desktop/renderer/views/chat-stream.mjs` | → `docs/desktop/design/CHAT.md` §3.1 | — |
| `thincoder-desktop/renderer/views/chat-scroll.mjs` | → `docs/desktop/design/CHAT.md` §3.1 | — |
| `thincoder-desktop/renderer/views/chat-tool.mjs` | → `docs/desktop/design/CHAT.md` §3.1 | — |
| `thincoder-desktop/renderer/views/approval.mjs` | → `docs/desktop/design/CHAT.md` §3.1 | — |
| `thincoder-desktop/renderer/views/chrome.mjs` | → `docs/desktop/design/UI.md` §4.1 | — |
| `thincoder-desktop/renderer/views/activity.mjs` | → `docs/desktop/design/ACTIVITY.md` §4.1 | — |
| `thincoder-desktop/renderer/views/pool-subagents.mjs`（R5 拆档产出） | → `docs/desktop/design/ACTIVITY.md` §4.1 | — |
| `thincoder-desktop/renderer/views/activity-new.mjs`（R10 新档） | → `docs/desktop/design/ACTIVITY.md` §4.1 | — |
| `thincoder-desktop/renderer/views/pool-tree.mjs`（让位修复批拆档产出） | → `docs/desktop/design/ACTIVITY.md` §4.1 | — |
| `thincoder-desktop/renderer/views/settings.mjs` | → `docs/desktop/design/SETTINGS.md` §3.1 | — |
| `thincoder-desktop/renderer/settings-modal.mjs` | → `docs/desktop/design/SETTINGS.md` §3.1 | — |
| `thincoder-desktop/renderer/settings-modal.css` | → `docs/desktop/design/SETTINGS.md` §3.1 | — |
| `thincoder-desktop/renderer/views/settings-sections.mjs` | → `docs/desktop/design/SETTINGS.md` §3.1 | — |
| `thincoder-desktop/renderer/views/settings-agent.mjs`（R8 拆档产出） | → `docs/desktop/design/SETTINGS.md` §3.1 | — |
| `thincoder-desktop/renderer/views/settings-controls.mjs`（R7 拆档产出） | → `docs/desktop/design/SETTINGS.md` §3.1 | — |
| `thincoder-desktop/renderer/views/settings-sections-env.mjs`（R7 拆档产出） | → `docs/desktop/design/SETTINGS.md` §3.1 | — |
| `thincoder-desktop/renderer/views/settings-sections-mcp.mjs`（R7 拆档产出） | → `docs/desktop/design/SETTINGS.md` §3.1 | — |
| `thincoder-desktop/renderer/views/settings-sections-models.mjs`（R7 拆档产出） | → `docs/desktop/design/SETTINGS.md` §3.1 | — |
| `thincoder-desktop/renderer/views/settings-sections-providers.mjs` | → `docs/desktop/design/SETTINGS.md` §3.1 | — |
| `thincoder-desktop/renderer/views/settings-sections-tools.mjs`（R2 拆档产出） | → `docs/desktop/design/SETTINGS.md` §3.1 | — |
| `thincoder-desktop/renderer/views/onboarding.mjs` | → `docs/desktop/design/SETTINGS.md` §3.1 | — |
| `thincoder-desktop/renderer/views/question.mjs` | → `docs/desktop/design/CHAT.md` §3.1 | — |
| `thincoder-desktop/renderer/views/plan.mjs` | → `docs/desktop/design/CHAT.md` §3.1 | — |
| `thincoder-desktop/renderer/views/goal.mjs`（R5 新档） | → `docs/desktop/design/CHAT.md` §3.1 | — |
| `thincoder-desktop/renderer/mount-settings.mjs` | → `docs/desktop/design/SETTINGS.md` §3.1 | — |
| `thincoder-desktop/renderer/mount-settings-reads.mjs`（R8 拆档产出） | → `docs/desktop/design/SETTINGS.md` §3.1 | — |
| `thincoder-desktop/renderer/mount-settings-exits.mjs`（R8 拆档产出） | → `docs/desktop/design/SETTINGS.md` §3.1 | — |
| `thincoder-desktop/renderer/mount-settings-segments.mjs`（R7 拆档产出） | → `docs/desktop/design/SETTINGS.md` §3.1 | — |
| `thincoder-desktop/renderer/mount-settings-segments-models.mjs`（R7 拆档产出） | → `docs/desktop/design/SETTINGS.md` §3.1 | — |
| `thincoder-desktop/renderer/mount-settings-segments-mcp.mjs` | → `docs/desktop/design/SETTINGS.md` §3.1 | — |
| `thincoder-desktop/renderer/mount-settings-segments-providers.mjs`（拆出档） | → `docs/desktop/design/SETTINGS.md` §3.1 | — |
| `thincoder-desktop/renderer/mount-settings-segments-agent.mjs`（拆出档） | → `docs/desktop/design/SETTINGS.md` §3.1 | — |
| `thincoder-desktop/renderer/settings-confirm.mjs`（新档 · 确认门） | → `docs/desktop/design/SETTINGS.md` §3.1 | — |
| `thincoder-desktop/renderer/mount-onboarding.mjs`（拆档） | → `docs/desktop/design/SETTINGS.md` §3.1 | — |
| `thincoder-desktop/renderer/mount-composer.mjs` | → `docs/desktop/design/COMPOSER.md` §3.1 | — |
| `thincoder-desktop/renderer/composer-wire.mjs` | → `docs/desktop/design/COMPOSER.md` §3.1 | — |
| `thincoder-desktop/renderer/composer-sync.mjs` | → `docs/desktop/design/COMPOSER.md` §3.1 | — |
| `thincoder-desktop/renderer/mount-cards.mjs`（批 A 修正轮） | → `docs/desktop/design/CHAT.md` §3.1 | — |
| `thincoder-desktop/renderer/attach.mjs` | → `docs/desktop/design/COMPOSER.md` §3.1 | — |
| `thincoder-desktop/renderer/views/chat-guide.mjs`（追加轮） | → `docs/desktop/design/CHAT.md` §3.1 | — |
| `thincoder-desktop/renderer/views/statusline.mjs`（R3a） | → `docs/desktop/design/UI.md` §4.1 | — |
| `thincoder-desktop/renderer/views/statusline-segments.mjs`（R4 拆档产出） | → `docs/desktop/design/UI.md` §4.1 | — |
| `thincoder-desktop/renderer/views/statusline-banner.mjs`（状态栏对齐批新档） | → `docs/desktop/design/UI.md` §4.1 | — |
| `thincoder-desktop/renderer/mount-status.mjs`（R3a） | → `docs/desktop/design/UI.md` §4.1 | — |
| `thincoder-desktop/src/main/subagent-face.mjs`（R3b） | → `docs/desktop/design/ACTIVITY.md` §4.1 | — |
| `thincoder-desktop/renderer/views/chat-text.mjs`（R3c） | → `docs/desktop/design/CHAT.md` §3.1 | — |
| `thincoder-desktop/renderer/views/chat-text-segments.mjs`（E4-JS 支） | → `docs/desktop/design/CHAT.md` §3.1 | — |
| `thincoder-desktop/renderer/views/chat-segment-reveal.mjs`（尾行收口批新档） | → `docs/desktop/design/CHAT.md` §3.1 | — |
| `thincoder-desktop/renderer/views/chat-cards.mjs`（R3c） | → `docs/desktop/design/CHAT.md` §3.1 | — |
| `thincoder-desktop/renderer/views/compress-status.mjs`（R4 新档） | → `docs/desktop/design/CHAT.md` §3.1 | — |
| `thincoder-desktop/renderer/core.css`（R3c） | → `docs/desktop/design/UI.md` §4.1 | — |
| `thincoder-desktop/renderer/chat-cards.css`（「桌面处理流 · VSC 对齐」批拆档产出） | → `docs/desktop/design/CHAT.md` §3.1 | — |
| `thincoder-desktop/renderer/chat-fixes.css`（拆档产出） | → `docs/desktop/design/CHAT.md` §3.1 | — |
| `thincoder-desktop/renderer/core-markdown.css` | → `docs/desktop/design/UI.md` §4.1 | — |
| `thincoder-desktop/renderer/settings.css` | → `docs/desktop/design/SETTINGS.md` §3.1 | — |
| `thincoder-desktop/renderer/chat-composer.css` | → `docs/desktop/design/COMPOSER.md` §3.1 | — |
| `thincoder-render-core/flow/block.mjs`（核共享面 · E2 实测命中档） | → `docs/desktop/design/RENDERER.md` §5.1 | — |
| `thincoder-desktop/scripts/check-dist.mjs` | → `docs/desktop/design/PACKAGING.md` §3.1 | — |
| `thincoder-desktop/scripts/materialize-deps.mjs`（本注新档） | → `docs/desktop/design/PACKAGING.md` §3.1 | — |
| `thincoder-desktop/scripts/win-sign.mjs`（本注新档） | → `docs/desktop/design/PACKAGING.md` §3.1 | — |
| `thincoder-desktop/scripts/make-icon.mjs`（本注新档） | → `docs/desktop/design/PACKAGING.md` §3.1 | — |
| `thincoder-desktop/build/icon.ico`（本注新档 · 二进制） | → `docs/desktop/design/PACKAGING.md` §3.1 | — |
| `thincoder-desktop/CHANGELOG.md` | → `docs/desktop/design/PACKAGING.md` §3.1 | — |
| `thincoder-desktop/tools/web-quickcheck/serve.mjs` | → `docs/desktop/design/WEB-QUICKCHECK.md` §9.1 | — |
| `thincoder-desktop/tools/web-quickcheck/host-shim.mjs` | → `docs/desktop/design/WEB-QUICKCHECK.md` §9.1 | — |
| `thincoder-desktop/tools/web-quickcheck/run.mjs` | → `docs/desktop/design/WEB-QUICKCHECK.md` §9.1 | — |
| `thincoder-desktop/test/run.mjs` · `thincoder-desktop/test/files.mjs` | → `docs/desktop/design/E2E-TESTING.md` §9.1 | — |
| 用例模块 | → `docs/desktop/design/E2E-TESTING.md` §9.1 | — |

**测试三分落点**（对回上表用例模块行）：

- **自动**（本端单入口 `thincoder-desktop/test/run.mjs`）：`host-floor` 启动下限自检 T-DSK15 · `guard-closure` 渲染面静态闭包守卫 T-DSK16 · `session-contract` 会话族与跨端接续 T-DSK3 / T-DSK12 · `store` 状态树与增量渲染 T-DSK17–T-DSK20 · `views` 左列三态与词表（T-DSK1 / T-DSK2 / T-DSK3 的渲染面 + 中区外壳结构面 T-DSK20 / T-DSK3 标签条语义行——U45–U52）。
  - 批 6 补两档：`views-chat` 对话流三态与工具卡（U58–U62）· `views-chat-scroll` 滚动面三事纯函数（U63–U67）。
  - 批 7 补两档：`views-approval` 审批卡面两形与降级（U68–U70）· `views-activity` 池面三态与折叠两读数（U72–U73）；`views-chat` / `store` / `host-floor` 三档**原址补例**（U75 / U74）；实施期拆档两档：`views-chat-frame`（U71 帧面自 `views-chat`）· `views-locks`（U52 零回归自 `views-chrome`）。
  - 批 8 补**五档**：`agent-host` 主侧面（装配 / 桥九映射 / 挂起表 / 回合驱动——U76–U86）· `events-reduce` 归约面与值面写者（U87–U89）· `events-page` 页回执与订阅面（U90–U92）· `history-page` 页转口与元（U93–U94）· `session-io` 槽装载与回合尾落盘（U96–U97）；`host-floor` 原址补例（U74 计数随动 13 · U95 显形）。
  - 设置面补**六档**：`settings`（设置族——U98–U102）· `providers`（渠道族——U103–U107（含 U107b））· `mcp-servers`（MCP 族——U108–U110）· `project-info`（项目级信息族——U111–U113）；
    视图两档 `views-settings` / `views-onboarding` **零 U 号**（档名面入 U51 零 CJK 扫描清单——落 `thincoder-desktop/test/views-chrome.test.mjs`）。
    - **U95 分支（`host-floor`）口径**：判据 `≤500` **含线上**（**284**）——依据 = 规则线本身（「无文件 >500 行」），非余量口径；
      **覆盖范围** = `fresh` 清单十八档（十二 + 六个用例文件）+ 在册例外面（`mount-settings.mjs`）+ `thincoder-desktop/renderer/app.mjs` + 宿主档源面零 `electron`；
      其余新档（主进程四源档 · `settings.css` · 视图三档 · `views-harness.mjs`）行数面 = §4.1 值列表（分支清单随动 = 码面池）；
      批 A 新档七档（`thincoder-desktop/renderer/views/{tabbar,question,plan}.mjs` · `thincoder-desktop/renderer/mount-composer.mjs` · `thincoder-desktop/renderer/mount-cards.mjs`（批 A 修正轮） ·
      `thincoder-desktop/test/{views-question,views-tabbar-close}.test.mjs`）行数面 = 同路（§4.1 值列表 / 分支清单随动 = 码面池）。
    - **`fresh` 清单口径**：`host-floor` 的 `fresh` 清单只收目录文件名读数——**越层档不入清单**（`mount-settings.mjs` **426** 不入）；六档补入 = 码面池（父侧分支清单随动项）。
    - **覆盖缺口两件**：① 设置面 **Esc 键**明示不覆盖（零 Esc 绑定 = 裁定项——`docs/desktop/design/UI.md` §1 设置面行）；② `settings:agent` **保存出口判据**挂 T-DSK7 / T-DSK8——真面缺口（保存出口端侧路径判据未单列）。
  - 批 A 拆档一档 + 增档一档：`thincoder-desktop/test/views-tabbar-close.test.mjs`（确认面族 U55 自 `views-tabbar` 拆出）· `thincoder-desktop/test/views-question.test.mjs`；`views-tabbar` 原址**改例**（⑤ 换机制——既有 `inert` 断言件改「两控件 `tabindex` 两态」+ 点按两向——T-DSK20 / T-DSK25）；
    **T-DSK26（关标签页随动）= 第 ⑥ 件机检** = `thincoder-desktop/test/views-tabbar-close.test.mjs`（页随动**五例**：关活动 ⇒ 邻位页 ∕ 关唯一 ⇒ 关页 `none` 态（零块节点 + 引导节点 `data-guide="no-session"`）∕ 关非活动 ⇒ 零动作 ∕ 待确认按取消 ⇒ 零动作 ∕ 已关会话迟到回执零写）
    + `thincoder-desktop/test/views-locks.test.mjs` 原址补例（关闭尾接线锚 ⇒ 值列实施后回填）。
  - 中区外壳面读作 **静态树面 + 常量驻留**（常量机检折进 U48）；运行时横滚 / 渐隐 / **标签点按切换与加速键**归人工走查。
- **自动 · 项目面**：`projects` = T-DSK1 / T-DSK2（核 `_setSessionsDirForTest` 指临时目录 + 手写 `<40hex>.json` 族——零新核缝）。
- **CI 冒烟**：产物与启动 = T-DSK14（矩阵见 `docs/desktop/design/PACKAGING.md` §2）。
- **人工交互面**（人工走查）：键位 / 焦点 / 拖拽类 = T-DSK21（含本注卡面「同 `prompt-id` 重挂不夺焦」幂等条）；实机交互类（宿主内实跑 + 真实后端回路）= T-DSK4 / T-DSK5 / T-DSK6 / T-DSK7 / T-DSK8 / T-DSK9 / T-DSK10 / T-DSK11 / T-DSK13。

## 6. 验收判据回指需求

### 6.1 功能点 D1–D27 · D34 · D35

| 需求 | 机检判据（点回需求卷） | 验证 |
|---|---|---|
| D1 | → `docs/desktop/design/SESSIONS.md` §4 | — |
| D2 | → `docs/desktop/design/SESSIONS.md` §4 | — |
| D3 | → `docs/desktop/design/CHAT.md` §4 | — |
| D4 | → `docs/desktop/design/ACTIVITY.md` §5 | — |
| D5 | → `docs/desktop/design/CHAT.md` §4 | — |
| D6 | → `docs/desktop/design/COMPOSER.md` §4 | — |
| D7 | → `docs/desktop/design/SETTINGS.md` §4 | — |
| D8 | → `docs/desktop/design/SETTINGS.md` §4 | — |
| D9 | → `docs/desktop/design/SETTINGS.md` §4 | — |
| D10 | **台账读数与批次相位读数出现**（项目级信息，不随会话走：`ledger:read` / `batch:status` 载荷不携会话 `key`；台账可见载体 = 状态行段 11 常驻标记 ∥ tooltip） | T-DSK11 |
| D11 | → `docs/desktop/design/SETTINGS.md` §4 | — |
| D12 | → `docs/desktop/design/PACKAGING.md` §4 | — |
| D13 | → `docs/desktop/design/COMPOSER.md` §4 | — |
| D14 | 真 Electron 启停 + 交互驱动 + 固定落点截图（批 E2E 落 = T-DSK27；单入口 · 每用例隔离临时家 · devDep `playwright-core`——单源 = `docs/desktop/design/E2E-TESTING.md` §3.3 / §6） | T-DSK27 / T-DSK32 |
| **D15**（§3.1:52 · 需求 §3.5 项 7） | 状态栏上下文占用读数（活动会话 · 回合尾更新）：`ev:usage` 有效读数 ⇒ 读数节点在场；未至 / 非正数 ⇒ 零节点（禁假造）——KD-20 | T-DSK29 |
| D16 | → `docs/desktop/design/SETTINGS.md` §4 | — |
| **D17**（需求卷 D17） | 状态行对齐 CLI：**18 段逐项裁定表**在册（承载 18 / 旁置 1 / 不适用 1 行；零静默省略）；承载段逐段有节点判据与数据源（承载四项〔耗时 / 令牌 / 计时 / 回合 N/M〕**已落（R3a）**——读数槽四住 `thincoder-desktop/renderer/events.mjs`）；未至 / 非正 ⇒ 零节点（禁假造）——KD-25 / KD-30；单源 = `docs/desktop/design/UI.md` §1「批注（对齐重定位）」项 1 + 「批注（状态栏对齐 · 屏面为准）」 | T-DSK33 / T-DSK38 |
| D18 | → `docs/desktop/design/SESSIONS.md` §4 | — |
| D19 | → `docs/desktop/design/CHAT.md` §4 | — |
| D20 | → `docs/desktop/design/ACTIVITY.md` §5 | — |
| **D21**（需求卷 D21） | 会话流**内容面** + **会话面板**（桌面会话控制面）视觉对齐 VSC：内容面 **21 面** / 会话面板面 **9 面** **逐面映射表在册**（VSC 实值带 `file:line` × 桌面落法——单源 = `docs/render-core/design/RENDER-CORE.md` §5 ∥ `docs/desktop/design/UI.md` §1「批注（D21 · 会话流 / 会话面板视觉对齐 · 两项）」项 2）；**结构零动**（外壳 / 主题体系 / 左列 + 标签条结构不改）；端差 **3** 项已全部处置（核档 §9 同拍）；值面落点 = `thincoder-desktop/renderer/core.css` + 主题表 `thincoder-desktop/renderer/theme.css`（新增变量 **14**）——KD-29 | T-DSK21 / T-DSK37（原址补例） |
| **D22**（需求卷 D22） | 状态栏对齐（屏面为准 · 走查裁定）：**18 段**逐项裁定表在册（banner 四态承载 / 静息词 / 输入提示段 / 键位尾逐件——单源 = `docs/desktop/design/UI.md` §1「批注（状态栏对齐 · 屏面为准）」）；四项重审判据句在册；模式位供面 = `history:page` 回执 `flags`（单源 = `docs/desktop/design/IPC.md` §2「模式位投影注」） | T-DSK39 |
| D23 | → `docs/desktop/design/SESSIONS.md` §4 | — |
| **D24**（需求卷 D24） | 外壳视觉降噪（对照 mock 选定帧 02-chrome）：**静息描边归零**（容器 3 · 骨架线（现值唯输入区上线——显形保留）· 控件族 3 选择器 · 池条目 1——保位式 `border-color: transparent` ⇒ 零几何位移）+ **交互态显形**（hover / 按下 / 聚焦 + 设置活动行）+ 滚动条皮肤 4 规则 + **设置面映射** 9 面（6 改 + 3 保留）；**保留面负向锁**（两值列——accent 值列 = `.permission-prompt` / `.question-card`；`--line` 值列 = 核件面板输入行 `#input-row` / `.plan-card`；`.block` 消息块壳移出——R12 F1 ① 消除径）+ 零新变量 / 零新依赖 / 零新文件；内容面零动 · 布局与信息层级零动（守 D21 值源）；单源 = `docs/desktop/design/UI.md` §1「批注（外壳视觉降噪 · D24）」 | 验收三件：① 静息描边机检锁（随批单元证据）② 真机 hover · 聚焦读数（真机 = 人工走查 + 父侧真跑闭合）③ 改前 / 改后对照（走查） |
| D25 | → `docs/desktop/design/COMPOSER.md` §4 | — |
| D26 | → `docs/desktop/design/SESSIONS.md` §4 | — |
| **D27**（需求卷 D27） | 右键编辑菜单（宿主面）：可编辑 ⇒ 剪切 ∕ 复制 ∕ 粘贴 ∕ 全选四件（`enabled` 随 `editFlags`）；非编辑 ∧ 选中 ⇒ 复制 ∕ 全选；非编辑 ∧ 空选 ⇒ 零菜单；文案 = `HOST_DICT` 两语现读（`locale` 现读即随动）——单源 = 本档 §2 **KD-43** ∕ `docs/desktop/design/CHAT.md` §2「批注（复制面对齐 VSC）」 | T-DSK47 + 两纯函数平 node 直测口径（`context-menu.mjs`——**单元测试档随批留存**（不入集成测试树——全清令：集成测试不写 ∕ 不改 ∕ 不跑）） |
| **D34** | → `docs/desktop/design/COMPOSER.md` §4（设计单源）∥ 用例 T-DSK56 | T-DSK56 |
| **D35** | → `docs/desktop/design/ACTIVITY.md` §2 | — |

### 6.2 验收 A1–A4 与依赖面 P1–P4

| 项 | 本设计与它的关系 |
|---|---|
| A1 | §6.1 每行皆机检判据（用例号登记于 §7） |
| A2 | 三端共享契约零回归：配置 / 会话面全部经核入口（`docs/desktop/design/SHELL.md` §3），端侧只加 `END = "desktop"` 单写者文件（不增跨端共享可变字段——照核 NF1 语义）；`locale`（首写者）= **端无关偏好键**（任一端写、他端读，非属主型状态 ⇒ 不属本条禁增范围——§2 KD-13） |
| A3 | 三平台 CI 矩阵 = `docs/desktop/design/PACKAGING.md` §2 CI 行；本机 Windows 实跑 + 另两平台 CI——**分期：阶段一 = 本机 Windows 实跑；另两平台 CI 随阶段二**（同源 = `docs/desktop/design/PACKAGING.md` §2.7「目标（分期）」行） |
| A4 | 核 / CLI / 扩展三包测试零回归：本端**不改核机制语义**、不触另两端源码（纯加法三处，授权在案；`docs/desktop/design/SHELL.md` §3「不改核」行 + §8 边界）；**对齐重定位批例外（在案）**：`thincoder-vscode/webview/**` 接核改造 + 核包新增（净 = 换实现不换行为——`docs/render-core/design/RENDER-CORE.md` §8 / §9）；**残余项**：核只读出口（`docs/core/design/SESSION.md` §6.24）；**留档批例外（在案）**：核 `thincoder-core/history-window.mjs` 记录直通 opt-in（`{ records: true }` ∥ `kindOf` 认 `kind` 键——纯加法一条；默认径逐字等价——负控用例） |
| P1 | 落判 = KD-7（下限取 Electron ≥ 44.x，判据 = 启动自检实测）；**Node 24 专属 API 使用面** = 实施批逐点核（本端新增代码不主动用高于宿主内置版本的 API） |
| P2 | 落定 = §1.2 第 2 条 + KD-3 / KD-4 + `docs/desktop/design/SHELL.md` §1 前端目录形态 + `docs/desktop/design/UI.md` §1 交互决策全落（长会话渲染与回填本注落定——`docs/desktop/design/RENDERER.md` §2 / §3） |
| P3 | 落定 = `docs/desktop/design/SHELL.md` §4（序 + 团队层取值已上提核件；余端差在册） |
| P4 | 落定 = `docs/desktop/design/PACKAGING.md` §2 CI 行 |

### 6.3 批级判据

| # | 判据 | 落点 |
|---|---|---|
| ① | 四部分落点与命名规则可机检 | `docs/core/design/DOC-SYSTEM.md` §4 部分表 + §8 射程行 |
| ② | 本档给出可验证验收 | §6.1 / §6.2 / §7 |
| ③ | 三平台打包链明确形态 | `docs/desktop/design/PACKAGING.md` §2（工具 / 产物 / 验证 / CI 矩阵） |
| ④ | 与核接口面逐项点名、不改核机制语义（纯加法三处——授权在案） | `docs/desktop/design/SHELL.md` §3 七面表 + 「不改核」行 |

## 7. 用例表

| 用例 | 场景 | 输入 | 预期输出 | 机检 / 落点 |
|---|---|---|---|---|
| T-DSK1 | → `docs/desktop/design/SESSIONS.md` §5 | — | — | — |
| T-DSK2 | → `docs/desktop/design/SESSIONS.md` §5 | — | — | — |
| T-DSK3 | → `docs/desktop/design/SESSIONS.md` §5 | — | — | — |
| T-DSK4 | → `docs/desktop/design/CHAT.md` §5 | — | — | — |
| T-DSK5 | → `docs/desktop/design/ACTIVITY.md` §6 | — | — | — |
| T-DSK6 | → `docs/desktop/design/CHAT.md` §5 | — | — | — |
| T-DSK7 | → `docs/desktop/design/COMPOSER.md` §5 | — | — | — |
| T-DSK8 | → `docs/desktop/design/SETTINGS.md` §5 | — | — | — |
| T-DSK9 | → `docs/desktop/design/SETTINGS.md` §5 | — | — | — |
| T-DSK10 | → `docs/desktop/design/SETTINGS.md` §5 | — | — | — |
| T-DSK11 | 正常 · 项目级信息 | 打开有台账 / 批次的目录 | 段 11 台账标记（开项目成功链——核 `marker`）出现；切会话时**不随会话变** |
| T-DSK12 | → `docs/desktop/design/SESSIONS.md` §5 | — | — | — |
| T-DSK13 | → `docs/desktop/design/SETTINGS.md` §5 | — | — | — |
| T-DSK14 | → `docs/desktop/design/PACKAGING.md` §5 | — | — | — |
| T-DSK15 | 错误 · 宿主下限不满足 | 以低于下限的宿主运行 | 启动自检报错并显式退出（不静默降级、不崩栈） |
| T-DSK16 | 错误 · 渲染面越界 | 渲染面试图 import `node:` 内置或 `@thincoder/core` | 静态闭包守卫测试红（照扩展端守卫先例） |
| T-DSK17 | 边界 · 长会话渲染窗口 | 单会话累计块数 > 150 | DOM 只保留尾部 150 块；更早部分呈「摘要块」且可一键回填；块数有界（不做虚拟化） |
| T-DSK18 | 正常 · 历史回填 | 于流顶附近上滚（scrollTop ≤ 40px） | 取更早一页（页量按核 `historyWindow` 缺省 200 条——条 ≠ 块）且插入后视口不跳（scrollTop 按 scrollHeight 增量修正）；有在途请求时不重入 |
| T-DSK19 | 正常 · 跟滚与药丸 | 先上滚停跟 → 期间到达新块 → 点药丸 | 新块到达时视口不动（停跟）；出现药丸；点击回底并复跟；平滑滚动 420ms 窗内不抢占 |
| T-DSK20 | → `docs/desktop/design/SESSIONS.md` §5 | — | — | — |
| T-DSK21 | → `docs/desktop/design/CHAT.md` §5 | — | — | — |
| T-DSK22 | → `docs/desktop/design/COMPOSER.md` §5 | — | — | — |
| T-DSK23 | → `docs/desktop/design/COMPOSER.md` §5 | — | — | — |
| T-DSK24 | → `docs/desktop/design/CHAT.md` §5 | — | — | — |
| T-DSK25 | → `docs/desktop/design/SESSIONS.md` §5 | — | — | — |
| T-DSK26 | → `docs/desktop/design/SESSIONS.md` §5 | — | — | — |
| T-DSK27 | 正常 · E2E 设置面（真 Electron） | 空 fixture 家（唯一预置 `<临时家>/.thincoder/config.json` = `{"locale":"en"}`）· 无项目 | boot `ok`；入口在；点按后面板 `open`；段序 `providers,agent,mcp,env,tools,models,team`（七段）；态 `ready,ready,ready`（前三段夹具定形；后四段随 E2E 重跑补记）；PNG 落固定落点（存在 + magic）；关闭后 `closed` 且子节点 0；机检 = 单元测试档惯例；形态与九步断言单源 = `docs/desktop/design/E2E-TESTING.md` §3.3 / §6 |
| T-DSK28 | → `docs/desktop/design/COMPOSER.md` §5 | — | — | — |
| T-DSK29 | 正常 · 状态栏占用读数 | ① 活动会话跑完一回合（核发有效 `ev:usage`）② 核不发 / `ctxPct` ≤ 0 ③ 切标签 | ① 状态栏读数节点在场且值 = 活动会话读数 ② **零读数节点**（禁假造）③ 随活动键取值换读数（非活动会话读数不串场） |
| T-DSK30 | 正常 · 附件与复制（D13） | ① 输入区粘贴一张图 ⇒ 发送（视觉模型）② 同例换非视觉模型 ③ 清空附件条 ④ 点含围栏代码块内的 Copy 钮 ⑤ 消息块尾 ∕ 输入区尾查控件 | ① 附件条出现缩略图 + 文件名 + 移除控件；`msg:send` 载荷携 `images`（**dataURL 串数组**）；`ok` 真 ⇒ 清条 ② 先落盘 + 降级跑者：降级成功 ⇒ 用户消息文本携描述注文（`[图片 … 描述: …]`，回执零码）；降级未成（失败 ∥ 落盘 0 件）⇒ 回执携 `degraded:"non-vision"` ⇒ 提示行在场 + 文本尾说明行（不静默丢图）；超限 / 落盘失败项 ⇒ `"partial"` ③ 附件条**零节点** ④ 剪贴板收代码文本逐字（核件 Copy 钮；词两态 `msg.copy` → `msg.copied`；超时自动复位）⑤ **零复制控件** |
| T-DSK32 | → `docs/desktop/design/SETTINGS.md` §5 | — | — | — |
| T-DSK33 | 正常 · 状态行十八段（D17） | 活动会话（另有非活动标签）逐态：忙态（含工具在跑）· 任务有项 · `ev:activity` turn（turn ∕ maxTurns）· 有效 `ev:usage`（`ctxPct` + `usage`）· 计时在途 · 台账超阈 · 队列 ≥1 · 位标含 `approval` | 承载 18 段各节点在场且源正确：banner 四态 / 状态词（两态）/ 当前工具 / 耗时 / ✓n/m / turn N/M / 令牌 / context% / 台账超阈位 / ⏰N / 会话标题 / 输入提示段 / 注意力提示；旁置 1 段（滚动位零节点）· 键位组零节点；未至 / 非正数 ⇒ 对应段零节点（禁假造） | 机检 = 单元测试档惯例 |
| T-DSK34 | → `docs/desktop/design/SESSIONS.md` §5 | — | — | — |
| T-DSK35 | → `docs/desktop/design/CHAT.md` §5 | — | — | — |
| T-DSK36 | → `docs/desktop/design/ACTIVITY.md` §6 | — | — | — |
| T-DSK37 | → `docs/desktop/design/CHAT.md` §5 | — | — | — |
| T-DSK38 | 正常 · 恢复态播种 + 用户块 md 深度（真 Electron） | 探针式 fixture 家（既有会话槽：`tasks` 2 条在场 · 读数可算）——resume 该会话 | ① resume 后状态行段 6（`tasks`）在场——槽数据直取（非空时）；空 / 缺 ⇒ 零节点 ② 段 9（`context`）在场——打开态读数 `> 0`；未至 / ≤ 0 ⇒ 零节点 ③ 用户块块级构件零节点（围栏 / 标题）∥ assistant 同文本块级在场 | 机检 = 单元测试档惯例 |
| T-DSK39 | 正常 · 状态栏对齐（真 Electron · 打开态对表） | fixture 家（`{"locale":"en"}` + **另建第二枚临时目录作项目根**（记 `PROJ`）+ 会话槽族档〔`cwd` = `PROJ`；形单源 = 核写面物化形——沿 T-DSK32 夹具先例〕——**两分支**（夹具按可达态）：主分支槽档 = `autoApprove: true` / `advisor: { guard: true }` / `engineering: true` / `planMode: false`（四真不可达——`engineering: true` ⇒ 核恢复点 `clearPlanMode` 令 `planMode` 恒 false）；第二分支槽档 = `planMode: true` / `engineering: false` + `autoApprove: true` / `advisor: { guard: true }` 同值（另盖 `plan` 点亮）；两分支皆 `tasks` 2 条 + `title` 一条 + 读数可算；清理 = 两枚临时目录） | ① 真点**会话控制面项目钮**（`button.session-project[data-action="project:open"]`——对话框夹具 `PROJ`，照 `docs/desktop/design/E2E-TESTING.md` §3.5 第 6 步；与 T-DSK32 同一产品路）⇒ `openDir` 成功链 ⇒ 自动一次 `session:resume` 开页（点开即续——`docs/desktop/design/IPC.md` §2 项目面注项 3）；主路未开页（续失败）⇒ 备路 = 点会话控制面选择器开下拉 ⇒ 点条目〔`.session-item[data-slot]`——`session:switch` 同一开页尾〕 ② 状态行在场段 ⊆ 18 码闭集 ∧ 相对序 = 闭集序 ∧ 假 / 缺 ⇒ 零节点（**主分支**亮点三段 = `auto` / `advisor` / `eng` 在场 + **`plan` 零节点**（负断言）；**第二分支** = `plan` 在场 + `eng` 零节点；两分支保留在场 = `state` / `tasks` / `context` / `title` / `enter`）③ `state` 段词 = `Ready`（locale = en）④ `enter` 段词 = `Enter: send` ⑤ `tasks` 段词 = `✓0/2` ⑥ 截图 PNG 落 `thincoder-desktop/test/artifacts/statusline-align.png`（父侧 CLI 同刻对照面）；机检 = 单元测试档惯例 |
| T-DSK40 | → `docs/desktop/design/SESSIONS.md` §5 | — | — | — |
| T-DSK42 | → `docs/desktop/design/CHAT.md` §5 | — | — | — |
| T-DSK43 | 正常 · 小修族（外围面 · 对齐第三批） | fixture 家（同上）——**离线可产断言**：设置面类型加工 / Esc 关闭 · **离线不可产**（真回合面）：审批卡两增量 / 提问卡键焦 / 忙态两钮可点 / 中断键两态 | ① 子代理门审批卡首行含 owner 段（`<owner> · <tool>`）∧ diff 节点在场（`apply_patch` 门——`diff-preview` 类名）——**离线不可产**；② 提问卡填入 ⇒ Enter ⇒ 卡退场 ∧ 回焦 `[data-input="text"]`——**离线不可产**；③ 回合在飞 ⇒ 输入区模型 ∕ 推理钮**可点** ∧ 中断键可点（**非在飞 ⇒ 键隐**——核件两态 = 显 ∕ 隐）——**离线不可产**；④ 设置面 agent 段 = 具名控件 ∧ `change` ⇒ 即改即存（回执后回读同值）——离线可产；⑤ 设置面开 ⇒ `Escape` ⇒ 关闭（`[data-slot="settings"]` 清空）——离线可产（**F-Esc 判据**）；⑥ 审批卡出现即 `document.activeElement` = 卡内 `[data-autofocus="1"]`——**离线不可产**（**F-置焦 判据**）；**离线不可产面 = 人工走查 + 父侧真跑闭合**；机检 = 单元测试档惯例 | ✅ 做（对齐第三批 · 拟新增） |

| T-DSK46 | → `docs/desktop/design/SESSIONS.md` §5 | — | — | — |
| T-DSK47 | 正常 / 边界 · 右键编辑菜单（D27） | 真 Electron：① 流内选中一段文本 ⇒ 右键 ⇒ 点「复制」② 输入框右键（空输入 ∕ 有内容两况）③ 非编辑区空选右键 ④ 输入框粘回验证往返 ⑤ `locale` = zh 重跑 ① | ① 菜单弹出（原生 Menu）且含「复制」项 ⇒ 点按后剪贴板 = 选中文本逐字（**往返** = 粘回输入框可见）② 四件在场（剪切 ∕ 复制 ∕ 粘贴 ∕ 全选；`enabled` 随 `editFlags`——空输入 ⇒ 剪切 ∕ 复制禁用 · 粘贴可用）③ **零菜单**（不弹）④ 往返成立 ⑤ 文案 = zh 四字（`locale` 现读随动）；机检 = 随批单元证据（`context-menu.mjs` 两纯函数三语境 + 两语词值——**单元测试档随批留存**（不入集成测试树——全清令：集成测试不写 ∕ 不改 ∕ 不跑））；真机 = 父侧真跑闭合（D16 义务） |
| T-DSK48 | → `docs/desktop/design/COMPOSER.md` §5 | — | — | — |
| T-DSK49 | → `docs/desktop/design/ACTIVITY.md` §6 | — | — | — |
| T-DSK50 | → `docs/desktop/design/SESSIONS.md` §5 | — | — | — |
| T-DSK51 | 正常 / 边界 · 排版统一（D29 · 真 Electron） | 真 Electron 启动 ⇒ 逐面走查（对话流〔含 md 修饰：粗体 ∥ 标题 ∥ 代码块 ∥ 引用 ∥ 表格〕· 工具卡 · 状态行 · 活动池 · 设置面 · 首启向导 · 输入区 · 搜索条 · 模型菜单）+ 亮 ∥ 暗两模式切换 | ① 文本元素 computed `font-size` = 14px（修饰白名单除外——白名单与期望值 = §2）② `font-weight <= 400`（markdown 标记除外：`strong` ∥ `h1–h6` ∥ `th`）③ 全栈族 = mono 栈（`ui-monospace…`）④ `line-height` = 18.2px（= 14 × 1.3；**`select` 本体除外**——Blink 固定其 computed `normal`，CSS 不可达）∧ `letter-spacing` = `normal` ⑤ md 修饰层语义可辨（粗 ∥ 标题 ∥ 码 ∥ 引用 ∥ 表）⑥ 亮 ∥ 暗同值；机检 = 单元测试档两档（源扫描 + 真机 computed 扫描；随批留存 · 不进集成测试树——全清令）；真机 = 父侧真跑闭合（D16 义务） |
| T-DSK52 | → `docs/desktop/design/ACTIVITY.md` §6 | — | — | — |
| T-DSK53 | 正常 · 窗口重启最大化（D31 · 真 Electron · 两启程） | 程 1：正常启动（`npm start` ∥ 打包产物）⇒ 观察窗口态；随后**手动缩小**（取消最大化 ∥ 拖动改尺寸）⇒ 关窗退出；程 2 = 再启动 | ① 程 1 启动后窗口 = **最大化态**（**判据主面 = 目视 ∥ PNG**——目视 = 占满工作区；机读径 = 主进程 `isMaximized()` = true——**载体 = 父侧走查即时读数**（走查当刻读，辅助提示 ∥ 零新增探针档）；**不采 `--smoke` 字段**（给由 = 冒烟字段闭集契约零动——KD-59 ⑤））；② 程 2 启动后**仍最大化**（「永远」语义——零窗口态记忆：手动缩小过的情形亦取）；③ **首帧用例**（KD-59 ② 推论真机证面）= `show()` 当刻 `isMaximized()` = true ∥ 首帧录屏 ∕ 截图无「默认尺寸帧」；④ 全程零 `pageerror`；PNG 落 `thincoder-desktop/test/artifacts/window-maximize.png`；机检 = 单元测试档惯例（已建成 · 83 行——三用例；随批留存 · 不进集成测试树）；真机 = 父侧真跑闭合（D16 义务） |
| T-DSK54 | 正常 / 边界 · 主题切换（D33 · 真 Electron · 两启程） | 程 1：fixture 家（`{"locale":"en"}`——`isConfigured` = 档存在）⇒ 启动 ⇒ 开设置面 ⇒ 点「Dark」（`[data-slot="settings"] [data-action="settings:theme"][data-theme="dark"]`）⇒ 关窗退出；程 2 = 同一家再启动；负控 = 另家（未切过）启动 | ① 点「Dark」后 `document.documentElement.dataset.theme === "dark"` ∧ `getComputedStyle(document.body).backgroundColor` = `rgb(21, 23, 28)`（#15171c）∧ 根 `color-scheme` computed = `dark` ∧ `localStorage["thincoder.desktop.theme"] === "dark"` ∧ 面上「Dark」钮 `data-active` 在场（恰一）；② **程 2 主题在**（重启恢复——`dataset.theme === "dark"` + 同底色读数）；③ 点「Light」⇒ 强制亮（底色 `rgb(247, 248, 250)`）；④ 点「System」⇒ `dataset.theme === "system"` ∧ 底色 = 媒体态值（`matchMedia("(prefers-color-scheme: dark)").matches` 两值对判）；⑤ 负控 = `dataset.theme === "system"` ∧ 存储键零写入；⑥ 全程零 `pageerror`；PNG 落 `thincoder-desktop/test/artifacts/theme-switch.png`；机检 = 单元测试档惯例（已建成 · 267 行——六用例；随批留存 · 不进集成测试树）；真机 = 父侧真跑闭合（D16 义务） |
| T-DSK55 | → `docs/desktop/design/PACKAGING.md` §5 | — | — | — |
| T-DSK56 | → `docs/desktop/design/COMPOSER.md` §5 | — | — | — |
| T-DSK57 | → `docs/desktop/design/MENU.md` §5 | — | — | — |
| T-DSK58 | → `docs/desktop/design/SETTINGS.md` §5 | — | — | — |
| T-DSK59 | → `docs/desktop/design/SETTINGS.md` §5 | — | — | — |
| **T-DSK60** | → `docs/desktop/design/PACKAGING.md` §5 | — | — | — |
| **T-DSK61** | → `docs/desktop/design/PACKAGING.md` §5 | — | — | — |
| **T-DSK62** | → `docs/desktop/design/PACKAGING.md` §5 | — | — | — |
| **T-DSK63** | → `docs/desktop/design/PACKAGING.md` §5 | — | — | — |
| **T-DSK64** | → `docs/desktop/design/SETTINGS.md` §5 | — | — | — |
| **T-DSK65** | → `docs/desktop/design/SETTINGS.md` §5 | — | — | — |
| **T-DSK66** | → `docs/desktop/design/SETTINGS.md` §5 | — | — | — |
| **T-DSK67** | → `docs/desktop/design/COMPOSER.md` §5 | — | — | — |
| **T-DSK68** | → `docs/desktop/design/SETTINGS.md` §5 | — | — | — |
| **T-DSK69** | → `docs/desktop/design/SETTINGS.md` §5 | — | — | — |
| **T-DSK70** | → `docs/desktop/design/SETTINGS.md` §5 | — | — | — |
| **R1** | → `docs/desktop/design/SETTINGS.md` §5 | — | — | — |
| **R2** | → `docs/desktop/design/SETTINGS.md` §5 | — | — | — |
| **R3** | → `docs/desktop/design/SETTINGS.md` §5 | — | — | — |
| **R4** | → `docs/desktop/design/SETTINGS.md` §5 | — | — | — |
| **R5** | → `docs/desktop/design/SETTINGS.md` §5 | — | — | — |
| **R6** | → `docs/desktop/design/SETTINGS.md` §5 | — | — | — |
| **R7** | → `docs/desktop/design/SETTINGS.md` §5 | — | — | — |
