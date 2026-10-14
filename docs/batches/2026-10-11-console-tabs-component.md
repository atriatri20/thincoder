# 2026-10-11 · console-tabs-component
> 六段 append-only，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 编制：主 agent · 2026-10-11 · 来源 = 用户 2026-10-11 21:05 原话（「对对对，我希望你准备好一个公共的标签页组件，以后很多功能会用到。」）——前置特征询 = 同轮 21:0x（「比如沙盒这里，我就想把运行面/镜像+镜像源分成标签页显示」＋「创建容器的时候，镜像好歹给做成下拉选择啊」）；需求档 = `docs/server/requirements/PROJECT.md` §2 功能点 39 ∥ AC-39；先例参照 = 公共弹窗组件（console-modals 批）。
> 台账 = #1286（server · 归批）。前情 = 无（独立批）。
## §1 讨论（主 agent）
**状态行**：已收口 2026-10-12
<§1 模板占位：本批条目 / 关键判据 / 授权口径>

**来源与授权**
- 用户 2026-10-11 21:00–21:05 两条：① 「另外，我希望你给服务器端认真的准备应该标签页组件，未来会有很多东西我希望改成标签页的。比如沙盒这里，我就想把运行面/镜像+镜像源分成标签页显示.」；② 「对对对，我希望你准备好一个公共的标签页组件，以后很多功能会用到。」——父侧先呈「立批计划」（组件 + 沙盒首个消费；四个岔口留设计轮呈选项），用户 21:05 点头。
- 授权口径 = 立批 + 设计（本批当前阶段）；**评审点火 ∥ 实施** = 依既有规矩（设计评审由用户点火；实施前 §4 点头）。
- 需求登记：`docs/server/requirements/PROJECT.md` §2 **功能点 39** + 验收表 **AC-39** + 注行射程 AC-31–38 ⇒ **AC-31–39** + 变更记录行（主 agent 笔，已落）；台账 **#1286**。

**范围（本块石头——用户口径）**
- 做：**一个公共标签页组件**（控制台共享件——沿公共弹窗组件先例：`public/` 新档 ∥ 零外部依赖 ∥ 复用 API）+ **首个消费 = 沙盒页**（运行面 ∥ 镜像+镜像源 分标签）。
- 不做（本批）：其余页面的标签化（用户后续逐页点名——**不预设铺开清单**）；既有页内「卡/区」体系的体系级改造（关系口径 = 设计轮呈选项）。
- 边界事实：沙盒页现为单页多卡（运行面 + 容器区 + 镜像区 + 镜像源卡——同页堆积）；「镜像+镜像源」= 用户原话分组（镜像区与镜像源卡同标签）。

**设计轮呈现项（父侧预告——用户已见，待设计轮落选项）**
- 标签选中态是否进地址栏（刷新/分享保持）∥ 与既有页内「卡/区」的关系（保留 ∥ 逐步替代）∥ 懒加载（切到才取数 ∥ 一次全取）∥ 键盘可达（左右键切页签）∥ 样式 canon（零新变量）。

**已知约束**
- 与在途批边界：`docs/batches/2026-10-11-server-doc-split.md`（执行轮后段 #240 在飞——其写面 = `design/PROJECT.md` + 九域档）；本批设计面将落 `webui/**`（壳面 `webui/WEBUI.md` + 沙盒面档 `webui/SANDBOX.md` ∥ 可能新面档）——**设计派单与 #240 的文件面错峰**（父侧调度）。
- 本轮次第：需求登记（已落）⇒ 设计（eng-designer）⇒ 评审点火（用户）⇒ §4 ⇒ 实施（eng-coder）⇒ 收口。

## §2 批次任务与设计（eng-designer）
**状态行**：设计完成（评审轮 1 修正已落——七条全数收正；产品码零触）
<§2 模板占位：本批条目（覆盖） / 设计档落点 / 机制设计 / 受影响文件与测试面 / 验收对照 / 关键决策 / 上抛项>

**批次任务（本批条目——覆盖）**

- 台账 #1286 · 需求 §2:39 ∥ AC-39 —— **控制台公共标签页组件**（用户 2026-10-11 21:05 原话「我希望你准备好一个公共的标签页组件，以后很多功能会用到」+ 同轮前例「比如沙盒这里，我就想把运行面/镜像+镜像源分成标签页显示」）：① 公共组件（`public/` 共享件——多面切换 ∥ 零外部依赖 ∥ 复用 API；沿弹窗组件先例）+ ② 首个消费 = 沙盒页分标签（运行面 ∥ 镜像+镜像源 可切换；两侧内容与现功能零回归）+ ③ 其余页面零改（未点名 = 不动）。
- 本批明确不做：其余页面标签化（用户后续逐页点名）∥ 页内「卡/区」体系改造 ∥ 沙盒 ②–⑥ 余面的标签归属（余面批点）∥ 组件嵌套/可关闭/拖拽页签（无需求）。

**设计档落点（本设计轮——产品码零触）**

| 档 | 动作 | 要点 |
|---|---|---|
| `docs/server/design/webui/TABS.md`（新档——公共组件面） | 建档（六节） | KD-SV-102（组件形） ∥ KD-SV-103（首消费 + 四岔口推荐基准）；§2.1 组件机制 ∥ §2.2 首消费 + **四岔口选项表** ∥ §3 文件账 ∥ §4 AC-39 行 ∥ §5 边界 ∥ §6 上抛 |
| `docs/server/design/webui/SANDBOX.md` | §1/§2.1/§3/§4/变更记录 | §2.1 形态 + ① 增「分标签归位」块（两标签逐件 ∥ 镜像区迁标签②（节点选单进）∥ 读时口径 ∥ 地址栏径 ∥ 零回归 ∥ 四岔口基准）；容器区/镜像区句收正；卡题去重；+2 键；四档读数随正 |
| `docs/server/design/webui/WEBUI.md` | §1/§2/§6/§7/§8/变更记录 | 静态面 + `tabs.mjs`（JS 37 ⇒ 38 档；档目链 39 ∥ 40 ⇒ 40 ∥ 41 ⇒ 余面批 42 ∥ 43）；§2 沙盒行 + 路由句（子段容许）；**§2.11 stub**；§6 增 AC-39 行 + AC-12 补子段腿；§7 KD 指针行；§8 边界指针 |
| `docs/server/design/webui/STYLE.md` | §2.1/§3/§5/变更记录 | ② 按钮族增「页签」型（五型 ⇒ 六型） ∥ ① 选中/活动句增页签落点 ∥ 新面登记段（`.tabs`/`.tab-list`/`.tab`/`.tab-panel`——零新变量 ∥ 零新悬停规则） ∥ `style.css` 行 296 ⇒ ≈314 |

**机制摘要（全文 = 指针）**

- **组件**（`webui/TABS.md` §2.1）：`createTabs(ctx, { tabs:[{id,labelKey,build}], initial, onChange, eager })` ⇒ `{ root, active() }`；DOM = `.tabs` > `.tab-list[role=tablist]`（`button.tab[role=tab]`）+ `.tab-panel[role=tabpanel]`（`hidden` 切换、建后保活）；键盘 ←/→ 循环 + Home/End（roving tabindex、焦点随激活）；`build` 首激活调用一次（懒——`eager` 可全建）；**组件零涉路由**（hash = 消费面接线）；零依赖零构建（仅取 `t`）；模块顶层零浏览器全局（node 可 import——沿 `modal.mjs` 口径）。
- **首消费**（`webui/SANDBOX.md` §2.1①）：沙盒页两标签（「运行面」= 提示条/两钮/节点表（展开 ⇒ 容器区）/装机任务区 ∥「镜像与镜像源」= 镜像卡 + 镜像源卡）；**镜像区迁出节点展开**（标签②节点选单进——列全部注册节点、缺省首节点）；卡题与标签同词者去重（运行面卡 h3 去）；节点清单 = 页级单源（两面板共读）；切换 = `history.replaceState`（不触发重渲——面板/弹窗保活）。
- **四岔口（呈选项 + 推荐——待用户裁；选项表全文 = `webui/TABS.md` §2.2）**：㈠ 标签选中态进地址栏 —— 推荐 A「进」（子段形 `#/admin/sandbox/<tab>`；刷新/分享保持；`nav.mjs` 子段容许 + `app.mjs` 三参 + 页内 replaceState）∥ B「不进」（纯页内；刷新回首标签）｜㈡ 与卡/区关系 —— 推荐 保留（标签 = 分组层 ∥ 卡 = 内容层零改）∥ 反案 逐步替代 ｜㈢ 懒加载 —— 推荐 切到才取数（面板首激活建）∥ 反案 一次全取（`eager`）｜㈣ 样式 canon —— 推荐 零新变量（悬停 `--hover` ∥ 选中 `--selected`/`--accent`）∥ 反案 新增 `--tab-*`。

**受影响文件（实施轮——预估）**

| 档 | 现读 ⇒ 估 | 笔 |
|---|---|---|
| `thincoder-server/public/tabs.mjs`（拟新增） | — ⇒ ≈120 | 组件新档 |
| `thincoder-server/public/views-sandbox.mjs` | 376 ⇒ ≈400 | 两标签装配 ∥ 节点选单 ∥ 子段读取/写回 ∥ 共享态调整 |
| `thincoder-server/public/views-sandbox-images.mjs` | 228 ⇒ ≈227 | `area()` 题行去重（−1）——接口零改 |
| `thincoder-server/public/views-sandbox-containers.mjs` | 313 ⇒ ±0 | 零触 |
| `thincoder-server/public/views-sandbox-image-sources.mjs` | 361 ⇒ ±0 | 零触 |
| `thincoder-server/public/nav.mjs` | 91 ⇒ ≈99 | 子段容许（岔口㈠-A 时） |
| `thincoder-server/public/app.mjs` | 197 ⇒ ≈199 | 三参透传（岔口㈠-A 时） |
| `thincoder-server/public/style.css` | 296 ⇒ ≈314 | 页签族（零新变量） |
| `thincoder-server/public/i18n-{zh,en}-sandbox.mjs` | 197 ∥ 197 ⇒ ≈200 ∥ ≈200 | +2 键/表（`tabImages` ∥ `imageNode`） |
| `docs/batches/2026-10-08-server-public-structure.test.mjs`（跨批件） | — | 键集指纹 + 键数 599 ∥ 604 ⇒ **601 ∥ 606** |

**测试面（实施轮笔——随本档）**：批内件 = 组件直测（`build` 时点/次数 ∥ `initial` 非法回落 ∥ 键盘/点按切换 ∥ ARIA/roving 随动）+ 沙盒分标签（两面板划分 ∥ 五族动作面零回归 ∥ 地址栏径（若 ㈠-A））+ i18n 两键两表同步；收口轮 = 浏览器实走（两标签切换 ∥ 刷新/分享直达 ∥ 弹窗保活 ∥ 键盘可达）。

**验收对照（AC-39 ① ② ③ → 机制判据）**：① 组件在册 = `webui/TABS.md` §4 行 ①；② 首消费 = `webui/SANDBOX.md` §4「沙盒页分标签」行 ∥ §2.1①（归位逐件）；③ 其余页面零改 = `webui/TABS.md` §4 行 ③ ∥ `webui/SANDBOX.md` §2.1①「其余页面零改」句。

**门读数（doc-check——交付前终跑）**：悬空 **25**（= 基线，零新增）∥ 行宽 **1**（`docs/server/design/sandbox/SANDBOX.md:61`——轻通道笔 3 在飞笔，非本批面——列报）∥ 行数面差异 **6**（= 基线）∥ 拟新增 **39**（= 基线 37 + 本批 `tabs.mjs` 两处列报——待实施建盘）。本批四档设计面：零悬空 ∥ 零超宽（首跑 5 行超宽已就地拆行——读回复验）。

**上抛项**：① **四岔口待裁**（§4 用户批准时裁——推荐基准 = ㈠ 进 ∥ ㈡ 保留 ∥ ㈢ 懒 ∥ ㈣ 零新变量；裁定后 = `webui/TABS.md` §1/§2.2 定稿 + 两档判据行随拍）；② 余项：`sandbox/SANDBOX.md` §14 未增本批指针（非本批写面——父侧排）；③ 列报：存量读数差两处（`views-sandbox-containers.mjs` 在册 296 vs 现读 313 ∥ `views-sandbox-images.mjs` 在册链 ≈181 vs 现读 228——已在本批 §3 行随正并标注）；④ **设计自决点亮明**（可裁）：运行面卡 h3 去重（面题入标签——同词不双题）∥ 标签②题「镜像与镜像源」（用户原话「镜像+镜像源」——文案可裁）∥ 镜像区改「节点选单进」（免复制节点表——若偏好节点行展开式 = 需回改）。

**定稿轮（fix · 2026-10-11——用户裁定落定）**

- 用户 2026-10-11 21:24 原话（「我觉得要进。卡保留，别的按你的建议都可以。」）⇒ 四岔口四项全取（㈠ 进 ∥ ㈡ 卡保留 ∥ ㈢ 懒 ∥ ㈣ 零新变量）+ 三默认点亮明（卡 h3 去重 ∥ 标签②题「镜像与镜像源」∥ 镜像区节点选单）按设计保留、收为定稿。
- 四档落点：`webui/TABS.md`（§1 KD-SV-103 收正 ∥ §2.1「与地址栏」句去条件、样式句随正 ∥ §2.2 读时/地址栏句收为定稿 + `eager` 能力留档句 ∥ 四岔口表收为裁定形（未取侧列与推荐列删——D8） ∥ §4 地址栏径收为三件机检 ∥ §5/§6 随正）；`webui/SANDBOX.md`（§2.1① 读时/地址栏/零回归句收为定稿 ∥ 容器区句 + 归位块半句随卷区落位同步（展开体 = 容器区 + 卷区——卷批同步项） ∥ §4「沙盒页分标签」判据行随正 ∥ §6 卷区同步登记销）；`webui/WEBUI.md`（§2 子段容许收为定稿 ∥ §6 AC-12 行子段容许腿随正）；`webui/STYLE.md`（㈣ 随裁定——文本零改）。四档变更记录各增本轮条目；历史行形式收正（零语义——原义保留）。
- 上抛处置：① 四岔口随本轮收；④ 三默认点亮明按裁收为定稿（其当轮文字保留为设计轮记录）；② `sandbox/SANDBOX.md` §14 指针仍待父侧排；③ 存量读数差两处维持列报。
- 门/扫描读数：悬空 25（= 基线零新增）∥ 超宽 0；四档残留扫描零残留（「未决」类条件式字样——已全数收正）；合理例外 = `eager` 句（机制面能力留档——组件 API 面，非条件句）。
- 列报：①「五族动作面」枚举句（`webui/TABS.md` §2.2 ∥ `webui/SANDBOX.md` §2.1① 各一处）是否随卷族扩为六族——未自决（非本轮裁定面）；② 扫描全目录时另有 `webui/ME.md:107`「名称不进管理表」无关命中（非标签面语句、非本批四档）。

**评审轮 1 修正（fix · 2026-10-11——评审 #247 七条落盘）**

- 评审 #247（§3 轮次 1——🔴 0 ∥ 🟡 4 ∥ 🔵 3）经父侧全数受理，七条逐条落盘：#1 档目链口径（`webui/WEBUI.md` §1：现盘面移回 **39 ∥ 40**；本批后态改标「console-tabs-component 批落定后 **40 ∥ 41**」；补列 sandbox-image-sources 批 +1 一步）∥ #2 §5 补行（`tabs.mjs` 拟新增行 ⇒ `webui/TABS.md` §3；`nav.mjs` 现读 91 ⇒ ≈99 ∥ `app.mjs` 现读 197 ⇒ ≈199）+ `webui/TABS.md` §3 账指订正（路由两档 ⇒ `webui/WEBUI.md` §5）∥ #3 机制句单源（读时/地址栏全文归 `webui/TABS.md` §2.2；`webui/SANDBOX.md` §2.1① 收为指针 + 本页消费值——「裁末段 + `sub` 回传 ∥ 不触发 hashchange ∥ 直打」三处细节归并单源）∥ #4 `sandbox/SANDBOX.md` §14 补 KD-SV-102/103 指针行（余项销）∥ #5 批名式（`webui/WEBUI.md` §2 沙盒行「本批分标签」⇒「console-tabs-component 批分标签」）∥ #6 `eager` 删净（组件 API ⇒ `{ tabs, initial, onChange }`；§1/§2.1/§2.2/§3 提及全删——无消费无直测，父侧裁定「用到再加」）∥ #7 悬停判据收为机检形（「零新悬停规则」⇒「行悬停声明清单不变 ∥ 钮族悬停 = ② 型表在册（页签取 `--hover` 底）」——`webui/TABS.md` ∥ `webui/SANDBOX.md` ∥ `webui/STYLE.md` 本批面同拍收为正）。
- 落点五档：`webui/TABS.md`（§1/§2.1/§2.2/§3/§4/§6）∥ `webui/SANDBOX.md`（§2.1①/§4）∥ `webui/WEBUI.md`（§1/§2/§5）∥ `webui/STYLE.md`（§2.1/§3/§5）∥ `sandbox/SANDBOX.md`（§14）；各档变更记录增本轮条目。**零新语义（评审发现直接导出项 + 父侧裁定）；产品码零触。**
- 并发注记：`webui/WEBUI.md` ∥ `webui/STYLE.md` 与在途对话页壳批（#1292）共面共写——本轮全部编辑内容锚定 + 改后逐档复读，其新插入内容零受影响；门读数终检为该共写态的当刻值。
- 门读数（修正后终跑——2026-10-11）：本批五档 **零悬空 ∥ 零超宽**（`webui/WEBUI.md` 档目链行首跑 306 字符——已拆行回落 285）。全库态：悬空 **27**（较设计轮记 25 增 2——`docs/server/requirements/PROJECT.md:225` 两处（`flow/block.mjs` ∥ `composer/panel.mjs`），需求档在飞面，非本批五档）∥ 超宽 **1**（同 `PROJECT.md:225`，682 字符——同上）∥ 行数面差异 6（= 基线报告态）∥ 拟新增 46（列报类）。
- 上抛处置：#4 = 补指针行（父侧裁定，终态）∥ #6 = 删 `eager`（父侧裁定，终态）。维持列报：①「五族/六族」枚举句未自决（前轮）；② 存量读数差两处（前轮）。

## §3 设计评审（评审子代理）

### 轮次 1（评审子代理）

评审对象：console-tabs-component 批 · 设计定稿（`webui/TABS.md` ∥ `webui/SANDBOX.md` 归位块 ∥ `webui/WEBUI.md` ∥ `webui/STYLE.md`）；触发 = 用户点火（2026-10-11 21:58）。验证边界：仅四档内核（需求档/批档/盘面码未读——相关声明标未验证；无文档地图与项目标准档——归属维度按降级口径）。

| # | Category | Severity | Issue | Suggestion |
|---|---|---|---|---|
| 1 | 文档状态一致性 | 🟡 | `webui/WEBUI.md:26` 把「（现盘面）」挂在本批后态「console-tabs-component 批后 40 ∥ 41」上，与同节 `:22`「（console-chat-align 批 +2——i18n core 两部件——现盘面）」（本批前 = 三十七档）互斥；`tabs.mjs` 仍「拟新增」（`:17`），本批自记 `:364` 亦作「档目链 39 ∥ 40（现盘面）⇒ **40 ∥ 41**（本批）」⇒ 现盘面应为 39 ∥ 40（档目 = JS+2 ∥ JS+3；锚 = `:26`「代理回迁批后 30 ∥ 31」对 `:22` 二十八档）。另 `:26` 链自「36 ∥ 37」直跳「console-chat-align 批后 39 ∥ 40」，中缺 sandbox-image-sources 批 +1 一步未列名。 | 按 `:359` 记的挂位规则把「（现盘面）」移回「39 ∥ 40」，本批后态改标「（console-tabs-component 批落定后）」；补列 sandbox-image-sources 批 +1 一步。 |
| 2 | 受影响档尺寸注解 | 🟡 | 本批改 `nav.mjs` ∥ `app.mjs`（TABS.md:49；规模句 = TABS.md:42「成本小（`nav.mjs` ∥ `app.mjs` 两处 ≈+10 行）」），但 `webui/WEBUI.md` §5 两行（`:131` ∥ `:134`）无本批现读+增量（链尾止于他批/余面批估值）；TABS.md:59 又把「路由两档」的账指到 `webui/SANDBOX.md` §3 ∥ `webui/STYLE.md` §3（两档无此两行——其账 = WEBUI §5）；§5 亦缺 `tabs.mjs`（拟新增）行（他批新档均有行，如 `:153`）。（「批档 §2 受影响档表」在四档外——未验证。） | §5 补 `tabs.mjs` 拟新增行（指针 = `webui/TABS.md` §3）与 `nav.mjs` ∥ `app.mjs` 现读 + 本批增量；订正 TABS.md:59 账指（路由两档 → `webui/WEBUI.md` §5）。 |
| 3 | 文档归属（重复） | 🟡 | 同组机制句在两档近逐字重复：TABS.md:36 ∥ `webui/SANDBOX.md`:37（读时口径）、TABS.md:37 ∥ SANDBOX.md:38（地址栏三件）；两档并互指同一段落为「机制全文/归位逐件」（TABS.md:30 ∥ SANDBOX.md:35）——重复面已现细差（SANDBOX 侧多「另一面板读同一状态」「不触发 hashchange」）。 | 择一定为机制单源、另侧留指针 + 消费差异段（或按 SANDBOX.md:7「本档不复制」标记显式声明）；保留双份时钉「一处改须同拍另一处」判据。 |
| 4 | 范围协同 | 🟡 | TABS.md:75「余项：`sandbox/SANDBOX.md` §14 未新增本批指针」——本批 KD-SV-102/103 在沙盒域 KD 登记面（同域先例 = `§14 KD-SV-100`，见 SANDBOX.md:99）无指针/登记裁定，落点悬空。 | 二选一收口：§14 补指针行（批名 + `webui/TABS.md` §1），或写「本批 KD 无需沙盒域登记」裁定句；使该项从余项转为在册/不做条目。 |
| 5 | 文档卫生 | 🔵 | `webui/WEBUI.md:48` 沙盒行「**本批分标签**」批名未具（常青 IA 表；同刻在途另有 sandbox-volumes 批自称「本批」，`:23`/`:365`）；先例收正 = `:354`「各行「本批」混指收齐」。 | 句面改批名式（「console-tabs-component 批分标签」）。 |
| 6 | 范围/可测性 | 🔵 | `eager` 为「机制面能力留档」（TABS.md:21），本批消费面 = 懒径（TABS.md:36），可测性直测面清单（TABS.md:27）与 AC-39（TABS.md:65）均不点名 ⇒ 无消费、无直测。 | 二选一：删 `eager`（用到再加），或补其直测行并与 AC-39 ① 的 API 逐项范围对齐。 |
| 7 | 验收判据措辞 | 🔵 | 判据句「零新悬停规则」（TABS.md:65「样式：零新 `:root` 变量 ∥ 零新悬停规则」；SANDBOX.md:100；STYLE.md:249）与 `webui/STYLE.md`:93「页签」行悬停列「`--hover` 底」（② 型表新增悬停值）并立；AC-19 续机检（STYLE.md:260）只钉「行悬停声明清单（`.nav-item:hover` ∥ `tbody tr:hover`——同取 `var(--hover)`；清单外零行悬停声明」——字面未区分行悬停与钮族逐型悬停。 | 判据句写成可机检形（如「行悬停清单不变；钮族悬停 = ② 型表在册——页签取 `--hover`」），消两种读法。 |

VERDICT: pass
计数：🔴 0 ∥ 🟡 4 ∥ 🔵 3。

## §4 用户批准（主 agent）

**批准（代签——用户全链自动授权：2026-10-11「发，并且其他任务也都点火，后续自动跑完」。自缚三条件齐备：① 评审 pass 0🔴 ✓（#247——4🟡+3🔵 全数受理）∥ ② 修正轮落地并逐条核验 ✓（七条全 Fixed：父侧抽核 TABS §2.1/API 形 ∥ WEBUI §1 档目链/§5 三行 ∥ sandbox/SANDBOX §14 KD 指针 ∥ 悬停判据机检形——并当场收净一处漏网残句 [`eager`——TABS §1 索引行，父侧直改随拍]）∥ ③ 令牌已签发 ✓（凭据零入档）。**

实施范围 = 本档 §2 文件表（`public/tabs.mjs`（新增）∥ `views-sandbox.mjs` ∥ `nav.mjs` ∥ `app.mjs` ∥ `style.css` ∥ i18n 两档 + 批内件 + 沙盒页分标签首消费）；实施轮 = eng-coder（设计 = `webui/TABS.md` 定稿；判据全文 = `webui/SANDBOX.md` §4 + `sandbox/SANDBOX.md` §14 指针行）。

**上抛/余项（实施轮转给 eng-coder 的已知项）**：① 与卷批同抢 `views-sandbox.mjs`——文件域冲突由调度器串行（先落者先提交）；② `eager` 残句已收净（见上）；③ 其余零。

## §5 实施记录（eng-coder）

**实施轮（eng-coder · 2026-10-11）**

**交付摘要（10 档——8 产品档 + 批内件 + 清单外 1 档）**：① `thincoder-server/public/tabs.mjs`（**新档 89 行**——组件全量：`.tabs` > `.tab-list[role=tablist]`（`button.tab[role=tab]`）+ 每页签 `.tab-panel[role=tabpanel]`（`hidden` 切换 ∥ 建后保活）∥ ARIA 成对（`aria-selected`/`aria-controls`/`aria-labelledby`）+ 模块级序号前缀（多实例唯一）∥ roving tabindex ∥ `←`/`→` 循环 + `Home`/`End` + 焦点随激活 ∥ `build` 首激活一次并缓存 ∥ 零路由零浏览器全局（node 可 import——批内件头位取件实证））；② `views-sandbox.mjs`（**499 行**——两标签装配 ∥ 镜像区迁标签②（节点选单 = `imageNode`：列全部注册节点 ∥ 缺省首节点 ∥ 无节点空态）∥ 卡题去重（运行面 h3 去 ∥ 镜像卡 h3 = `imagesTitle` ∥ 源卡 h3 保留）∥ 懒读触发（`started` 守卫——首激活面板触发）∥ 读势三态（`runnersPhase`/`tasksPhase`）∥ `onChange` ⇒ `history.replaceState`）；③ `views-sandbox-images.mjs`（228 行——`area()` 题行去重，接口零改）；④ `nav.mjs`（98 行——子段容许 + 登录面排除）；⑤ `app.mjs`（196 行——三参透传）；⑥ `style.css`（304 行——页签族 8 行，零新变量）；⑦⑧ `i18n-zh-sandbox.mjs` ∥ `i18n-en-sandbox.mjs`（各 200 行——+2 键）；⑨ `docs/batches/2026-10-11-console-tabs-component.test.mjs`（**新档 492 行**——9 腿）；⑩ `thincoder-server/package.json`（**清单外面**——门禁链尾追加本批件，理由见下）。

**实测读数（实施当刻）**：`public/` **41 档**（JS 38——`tabs.mjs` 落盘；批内件快照逐名相等）∥ i18n 键数 **601 ∥ 606**（+2——`tabImages` ∥ `imageNode`；en 零 CJK）∥ `:root` **38**（零新变量）∥ `:hover` **8**（七 + `button.tab:hover` 取 `--hover` 底）∥ 全档行宽 ≤300 ∥ 行数：`tabs.mjs` 89 ∥ `views-sandbox.mjs` 499 ∥ `views-sandbox-images.mjs` 228 ∥ `nav.mjs` 98 ∥ `app.mjs` 196 ∥ `style.css` 304 ∥ i18n 两档 200 ∥ 批内件 492。

**决策透明表（实施轮自决——依据源）**

| # | 决策 | 依据 |
|---|---|---|
| 1 | `tabs.mjs` = 独立部件（消费面只 import；组件零涉路由） | `webui/TABS.md` §2.1 落点 + 平行 `modal.mjs` 口径 |
| 2 | 子段容许全站通用（任一在册页 + 单截末段 ⇒ `sub`，页面自判/忽略） | `webui/TABS.md` §2.2 机制句「裁末段 + `sub` 回传」；机检面 = 批内件 ④ |
| 3 | 登录面（`LOGIN_PATH`）排除出子段容许 | 内部审计发现：原形 = 默认页回落，容许后会落到无表键（`PAGES` 无 `/login`）⇒ 一行守卫复原原形 |
| 4 | 标签②读势与节点表同口径（在途 ⇒ `common.loading` ∥ 败 ⇒ 人话 ∥ 无节点 ⇒ 空态句） | 读势单源 = `runnersPhase`（`webui/SANDBOX.md` §2.1①）；顾问评审 🟡#1 修正落地 |
| 5 | 面板 DOM 页渲染期构造、内容随建/随读渲染（`panels` 守卫） | 懒的判据 = 「首激活建 + 触发读取」（§2.2 读时口径）——DOM 构造零读取零副作用 |
| 6 | 页签族取值全取既有变量（② 型扩充 + ① 选中态） | ㈣ 裁定「零新变量」；`webui/STYLE.md` ②/① 型表 |

**内部偏差审计（explore · 只读）**：1 轮——六类判据逐条核（组件 API/DOM/ARIA ∥ 四岔口 ∥ 归位逐件 ∥ 零回归 ∥ 越面 ∥ 文档漂移）；产出 1 条四类内偏差（`#/login/<子段>` 边角回归——🟡，批内件未覆盖）+ 1 条记录面（§5 空）。处置：偏差**当场修**（`nav.mjs` 头注 + 一行守卫 + 批内件补两断言 `/login/images` ∥ `/login/x` ⇒ 默认页回落）；记录面 = 本笔落。其余 = 「未发现偏差」（半实现/静默简化/越面三类零命中）。

**顾问代码评审（advisor · code）**：1 轮——VERDICT **pass**（🔴 0 ∥ 🟡 2 ∥ 🔵 3）。处置表：

| # | 级 | 项 | 处置 |
|---|---|---|---|
| 1 | 🟡 可修 | 标签②把「节点清单在途」渲成「无节点」空态（`renderImages` 未判读势）——直打/分享 `#/admin/sandbox/images` 且 overview 未回时可达 | **Fixed**——`renderImages` 增 loading/failed 分支（与节点表同口径）；批内件补「直打标签② ⇒ loading 非 empty」腿（门控夹具先断言在途态、放行后断言表在册） |
| 2 | 🟡 列报 | 子段容许全站通用 ⇒ 设计句「既有 hash 形行为逐字不变」的逐字读强于实际 | **列报**（文档口径 = 设计面，不越面改档；实现与机制句一致） |
| 3 | 🔵 | `ensure()` 先记后建——`build()` 抛错 ⇒ 面板永久空且不再重试 | **维持**——判据原文 = 「`build` 首激活调用一次」，先记后建保证「恰一次」；抛错 = 消费面编程错（当前两 `build` 零抛点），同步冒泡即可见（fail-loud） |
| 4 | 🔵 列报 | 档-态滞后（`tabs.mjs` 仍作「拟新增」）+ 行数漂移（`views-sandbox.mjs` 499 vs 估 ≈400 ∥ `tabs.mjs` 89 vs 估 ≈120） | **列报**——设计档面 + 批档 §2 表；收口轮随正（见「待父侧」） |
| 5 | 🔵 | 批档 §5/§6 空 | **本笔落 §5**；§6 = 父侧收口轮 |

**验证读数（本单实跑——cwd = `thincoder/` 仓根）**：
- 批内件：`node --import ./thincoder-server/test/rc-resolve.mjs --test docs/batches/2026-10-11-console-tabs-component.test.mjs` ⇒ **9/9 绿**（① 组件基座 ∥ ② 切换/键盘/保活 ∥ ③ 两面板划分/懒/选单三态 ∥ ④ 地址栏径三件 ∥ ⑤ 五族零回归 + 弹窗保活 ∥ ⑥ i18n + 静态面（档目/行数/行宽/零外链/零 CJK/`t` 闭合/类名双向/canon/门禁链）×3）。
- 跨批件（父侧落笔后复跑）：`… --test docs/batches/2026-10-08-server-public-structure.test.mjs` ⇒ **6/6 绿**（zh **601** ∥ en **606** 值齐零漂——用户 ① 号复跑核对闭合，无需回报）。
- 文档门：`node scripts/doc-check.mjs` ⇒ 悬空 **25**（= 基线，零新增）∥ 行宽 **0**（本批面）。
- **全链首跑（53 件——`npm run prepublishOnly`，本批追加后）：487 例 ∥ 445 绿 ∥ 42 红**——42 红**全部 = 旧件随正**（既有档按本批新态变红；父侧面，逐件见下表）。

**旧件随正交接（42 腿 ∥ 25 档——本单不越清单，父侧收口轮落）**

| 类 | 档:腿（新态 → 旧断言） |
|---|---|
| 档目 +1 | console-completeness-2:433 ∥ console-list-style:208 ∥ console-modals:404 ∥ console-provider-redo-runtime:292 ∥ console-providers:401 ∥ models-config:216 ∥ me-keys-redo-ui:342 ∥ provider-model-metadata:462 ∥ quota-v2-member-models:728 ∥ runner-admin-console-ui:489 ∥ admin-agent-chat-ui:559 ∥ sandbox-docker-admin-ui:370 ∥ sandbox-image-quick-pull:402 ∥ sandbox-image-sources-ui:473 ∥ sandbox-pull-by-source:431 ∥ console-chat-align:406（41 ∥ 40 ⇒ 原 40 ∥ 39——含 `tabs.mjs` 入档集快照） |
| 键数 +2 | server-public-structure:65（**已父侧随正 ⇒ 绿**）∥ runner-admin-console-ui:462 ∥ server-small-fixes:68 ∥ admin-agent-chat-ui:514（601 ∥ 606 ⇒ 原 599 ∥ 604） |
| 悬停 +1 | console-list-style:114 ∥ console-layout:456 ∥ me-usage-charts-ui:339（悬停声明 8 条 ⇒ 原 7 条——行悬停清单二不变） |
| 门禁链 52⇒53 | console-list-style:240 ∥ server-auto-update:455 ∥ console-layout:447 ∥ me-usage-charts:259 ∥ quota-per-model:442 ∥ quota-v2-member-models:426 |
| 沙盒页结构（镜像区/源卡迁标签②——夹具需先激活标签②） | runner-admin-console-ui:170 ∥ sandbox-docker-admin-ui:280 ∥ sandbox-image-quick-pull:194/270/332 ∥ sandbox-image-sources-ui:205/282/307/389/421 ∥ sandbox-pull-by-source:348 |

**清单外面（1 档——已披露）**：`thincoder-server/package.json`——门禁链（`prepublishOnly`）尾追加本批件（链 52 ⇒ 53）；理由 = 批内件须随链跑（历批同法）；副作用 = 上表「门禁链」六腿变红（随正项）。

**上抛/知会**：ASK-1（跨批件 `2026-10-08-server-public-structure.test.mjs` 写权被批档守卫拦下）⇒ 父侧裁 **㈠（父侧直落）**——已复跑核值零漂（见上）。其余**零上抛**。

**待父侧（收口轮）**：① 旧件随正 42 腿 ∥ 25 档（上表）；② 设计档随正——`tabs.mjs`「拟新增」⇒「已落盘」+ 三档行数（`views-sandbox.mjs` **499**：≤500 建议线内、**余量 1 行**——在途卷批以 ≈400 为基的「≈403」估值失效，下一个触碰该档的批次前需先审拆分（如镜像卡/节点选单外拆）；`views-sandbox-images.mjs` 228 ∥ `tabs.mjs` 89）；③ §6 收口（含浏览器实走：两标签切换 ∥ 刷新/分享直达 ∥ 弹窗保活 ∥ 键盘可达）。

## §6 验证与收口（父代理）

**收口（2026-10-12 03:0x · 主 agent）**

**验证读数（一次全链）**：`npm run prepublishOnly` 全链 **501/501 绿**（56 件 · 37s）；本批件 `-console-tabs-component.test.mjs` 9/9 在链内（点按 ∥ ←/→ 循环 ∥ 子段直入 ∥ 弹窗保活 ∥ 键盘可达）。

**跨批随正（本收口轮内落——沙盒夹具「标签②进法」）**：`-sandbox-image-sources-ui.test.mjs` ∥ `-sandbox-pull-by-source.test.mjs` ∥ `-sandbox-image-quick-pull.test.mjs` ∥ `-sandbox-docker-admin-ui.test.mjs` ∥ `-runner-admin-console-ui.test.mjs` 五件的整页夹具补「标签②激活」步（`byText(mount, ZH["admin.sandbox.tabImages"]).fire("click")`）+ `globalThis.history` 桩 + 表取法由索引改按表头（`headersOf` 首列）+ 首读断言两件（源卡/镜像表 = 标签②懒读）+ 创建弹窗 `selects 1⇒2`（卷选单）。静态面口径随正：`public/**` **43 ∥ 42**（三档 +1：`tabs.mjs`/`views-chat-composer.mjs`/`views-sandbox-volumes.mjs`——**`tabs.mjs` 即本批新档**）+ 两件档目清单逐名收正。

**收口轮留存（明记）**：`views-sandbox.mjs` **499 行**（建议线 500 内 · 余量 1）——下一个触碰该档的批次前须先审拆分（联落于本档「实施待父侧」②）。

**部署**：提交 `8b9f7ea4` + `a1c74c9d` → 箱快进 `a1c74c9` → 镜像重建 `88a36574c5bc` → **Up (healthy)**；`tabs.mjs` 实读 200。

**未决（指针）**：真机走查（两标签切换 ∥ 刷新/分享直达 ∥ 弹窗保活 ∥ 键盘可达）= 用户面（`http://10.0.0.5:8787/#/admin/sandbox`）。

**结算依据**：全链 501/501 读数 + 部署探针读数 + 本档 §5 实施记录 + 台账 #1298。
