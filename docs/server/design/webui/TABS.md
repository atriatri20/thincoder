# Thincoder Server · 公共标签页组件（webui/TABS.md）

> 本档 = webui 域·公共组件面（控制台公共标签页组件——需求 §2 功能点 39）。域总览与壳面 = `webui/WEBUI.md`；首个消费（沙盒页分标签）页级归位 = `webui/SANDBOX.md` §2.1①；先例 = 公共弹窗组件（`webui/ADMIN.md` §2.1①——KD-SV-31）。

## 1. 关键决策（本面）

| # | 决策 | 理由 |
|---|---|---|
| KD-SV-102 | **控制台公共标签页组件 = `tabs.mjs`（容器 + 面板 ∥ 复用 API `createTabs`）**：一页多面时以页签切换；DOM = `.tabs` > `.tab-list[role=tablist]` > 页签钮（`button.tab`） + 面板（`.tab-panel[role=tabpanel]`——`hidden` 切换、建后保活）；选中态 = 组件闭包单源（类 `active` + `aria-selected` 同拍）；键盘 = ←/→ 循环 ∥ Home/End 首末（焦点随激活 ∥ roving tabindex）；面板首激活建（懒）；`onChange(id)` 接线口 + `active()` 读取口；**组件零涉路由**（hash 与否 = 消费面接线）；零依赖零构建（仅取 `i18n.mjs` 的 `t`——KD-SV-9 不破） | 用户点名公共组件（「以后很多功能会用到」——复用面广 ⇒ 通用形：零页面知识、零路由知识）；ARIA 原生语义（`role=tablist/tab/tabpanel` + `aria-*` + roving tabindex）= 键盘/读屏可达零自造；懒建 = 与既有懒读先例同族（「读时读」口径）；沿弹窗组件先例（`public/` 共享件 ∥ 复用 API ∥ 关闭/收口语义自持——KD-SV-31） |
| KD-SV-103 | **首个消费 = 沙盒页分标签（`#/admin/sandbox`）**：标签①「运行面」= 可用性提示 ∥ 添加节点钮 ∥ 节点表（展开 ⇒ 容器区 + 卷区）；标签②「镜像与镜像源」= 镜像卡（节点选单 + 所选节点镜像表 + 拉取/过滤）∥ 镜像源卡；**镜像区迁出节点展开**（节点选单进——选单 = 全部注册节点、缺省首节点）；卡题与标签同词者去重；**四岔口（用户裁——四项全取）：㈠ 进地址栏（子段形）∥ ㈡ 卡壳保留 ∥ ㈢ 切到才取数 ∥ ㈣ 零新变量** | 用户原话（「比如沙盒这里，我就想把运行面/镜像+镜像源分成标签页显示」）；「镜像区迁出」= 标签②需要节点上下文 ⇒ 节点选单收口（免复制节点表）；四岔口裁定依据逐项 = 本档 §2.2 裁定表 |

## 2. 机制

### 2.1 公共标签页组件（功能点 39——console-tabs-component）

- **定位**：控制台共享件——一页多面时以页签切换；**落点 = `thincoder-server/public/tabs.mjs`（已落——`public/` 共享件）**；与 `modal.mjs` 平行（互不 import）；与页面 IA/路由零耦合（复用面 = 任意页任意处）。
- **复用 API**：`createTabs(ctx, { tabs, initial = null, onChange = null })` ⇒ 句柄 `{ root, active() }`。
  - `tabs` = `[{ id, labelKey, build }]`：`id` = 稳定标识（页内唯一——用作 DOM 标识与地址栏子段）；`labelKey` = 文案表键（组件经 `t()` 取——组件零自持文案键）；`build` = 面板构建函数（返回节点；**首激活调用一次**——结果缓存，重切不重建）。
  - `initial` = 初始激活 id（不在集内 ∥ 缺省 ⇒ 首项——非法外部值静默回落，零炸）。
  - `onChange(id)` = 每次激活变更回调（页面接线点——地址栏镜像等；激活未变则零回调）。
- **DOM 形**：`.tabs`（容器）> `.tab-list[role="tablist"]`（页签钮 `button.tab[role="tab"]`——`type=button`） + 每页签一节 `.tab-panel[role="tabpanel"]`（非激活 `hidden`；**建后保活**——面板内状态/滚动不丢）。
- **ARIA/键盘**：`aria-selected` ∥ `aria-controls`/`aria-labelledby` 成对（DOM 标识 = 模块内自增序号前缀——多实例唯一）；roving tabindex（激活页签 `0`、余 `-1`）；`←`/`→` = 循环切换（焦点随激活）∥ `Home`/`End` = 首/末；点按 = 激活（同链）。激活语义 = 焦点即激活（WAI-ARIA 惯例——轻面板）。
- **选中态归属**：组件闭包单源（`activeId`）——类 `active` 与 `aria-selected` 同拍；页签文案 = 消费面键、值随语言（页面重渲即新值——沿控制台语言切换口径）。
- **与地址栏**：**组件零读零写 hash**——地址栏径 = 页面经 `initial` + `onChange` 接线（组件保持路由无关；消费面按此接线——本档 §2.2）。
- **与弹窗/既有件边界**：`modal.mjs`——平行公共件（互不 import）；面板保活 ⇒ 在场弹窗/表单不受切换影响；路由切换收口（`closeActiveModal`）口径不变（标签切换非路由切换）。
- **可测性**：模块顶层零浏览器全局（node 可 import——API 形断言）；DOM 仅 `createTabs` 内（沿 `modal.mjs` 口径）；经 `ctx.h` 注入建节点（不直触 `document`）；单元测试档直测面 = `build` 时点/次数 ∥ `initial` 回落 ∥ 键盘/点按切换 ∥ ARIA/roving 随动。
- **样式**：页签族类（`.tabs`/`.tab-list`/`.tab`/`.tab-panel`）——全取既有底座值（悬停 `--hover` ∥ 选中 `--selected` 底 + `--accent` 字 ∥ 内距 `--sp-2 --sp-4` ∥ 圆角 `--r-2` ∥ 线 `--bw solid --border`）；零新变量 ∥ 行悬停声明清单不变 ∥ 钮族悬停 = ② 型表在册（页签取 `--hover` 底）；落点 = `webui/STYLE.md` §2.1（② 按钮族「页签」型 + ① 选中/活动句）。

### 2.2 首个消费 = 沙盒页分标签（`#/admin/sandbox`——console-tabs-component；归位逐件 = `webui/SANDBOX.md` §2.1①）

- **页形**：页题「沙盒」+ 标签条（两标签）+ 面板；标签①「运行面」（题 = `admin.sandbox.runnersTitle`）∥ 标签②「镜像与镜像源」（题 = 新键 `admin.sandbox.tabImages`）。
- **归位逐件**（现页件 → 新位）：可用性提示条 ∥「添加节点」∥ 节点表 ∥ 容器区（节点行展开） ⇒ **标签①**；镜像区 ⇒ **标签②**（节点选单进）；镜像源卡 ⇒ **标签②**。
  **卡题去重**：运行面卡 h3 去（面题入标签——同词不双题）；镜像源卡 h3 保留；标签②镜像卡 h3 = `imagesTitle`。
- **镜像区迁出**：节点行展开 = 容器区 + 卷区；标签② = 节点选单（label = 新键 `admin.sandbox.imageNode`——列全部注册节点；缺省 = 首节点；无节点 ⇒ 空态句）+ 所选节点镜像表（拉取/删除/过滤逐件零改）。
- **读时口径（裁定：切到才取数）**：节点清单 = 页级单源（两面板共读同一状态——首激活面板触发读取）；镜像源清单 ∥ 镜像表随其面板首激活读。
- **地址栏（裁定：进）**：子段形 `#/admin/sandbox/<tab>`（`runners` ∥ `images`）——`nav.mjs` 子段容许（裁末段 + `sub` 回传）+ `app.mjs` 三参透传 + 页内 `history.replaceState`（不触发 hashchange——零重渲）；刷新/分享/直打 ⇒ 落该标签；非法子段 ⇒ 首标签回落。
- **四岔口裁定表（用户裁定——四项全取）**：

| # | 岔口 | 裁定 | 理由 |
|---|---|---|---|
| ㈠ | 标签选中态进地址栏 | 进：`#/admin/sandbox/<tab>`（刷新/分享/直打保持；切换 = `history.replaceState`——页内零重渲 ∥ 浏览器前进/后退不逐标签回退） | hash 路由先例（KD-SV-20 保刷新/书签）；运维台刷新频次高；分享直达利排障协作；成本小（`nav.mjs` ∥ `app.mjs` 两处 ≈+10 行）且被 nav 纯函数直测覆盖 |
| ㈡ | 与页内「卡/区」关系 | 保留：标签 = 分组层 ∥ 卡 = 内容层（零改造） | 收束不重设计（KD-SV-36 ⑤）；零回归风险小 |
| ㈢ | 懒加载 | 切到才取数：面板首激活建（数据随建读） | 标签立意 = 首屏轻；沿节点展开/目录窗懒读先例；加载态口径已有（`.hint` 静态文案） |
| ㈣ | 样式 canon | 零新变量：全取既有底座值（悬停 `--hover` ∥ 选中 `--selected`/`--accent`） | AC-19 canon（零新变量 ∥ 零新悬停规则）；现有变量全覆盖页签值需求 |

- **零回归**：五族动作面（节点/容器/镜像/镜像源/卷）零改；弹窗全族零改；`closeActiveModal` 路由收口口径不变（切换不重渲 ⇒ 不误关窗）；`views-sandbox-containers.mjs` ∥ `views-sandbox-image-sources.mjs` 零触。
- **其余页面零改**：未点名页面零标签化；其 hash/视图/文案零动（子段容许只加路由宽容量——既有 hash 形行为逐字不变）。
- **产品面（实施轮）**：`tabs.mjs` 新档 ∥ `views-sandbox.mjs`（分标签装配 + 地址栏径）∥ `views-sandbox-images.mjs`（area 题行去重）∥ `style.css`（页签族）∥ i18n 两档（+2 键）∥ `nav.mjs` + `app.mjs`（地址栏径）；受影响档表 = 本档 §2。

### 2.3 消费面登记（第二消费面 = 管理·项目页）

- **消费面①** = 沙盒页分标签（`#/admin/sandbox`——KD-SV-103 ∥ 本档 §2.2）。
- **消费面②** = 管理·项目页两标签（`#/admin/projects`——标签「项目」∥「Git 源」；子段 `projects` ∥ `git-sources`；机制逐件 = `webui/PROJECTS.md` §2.3）。口径零新（四岔口沿 §2.2）；差异两点：① **旧址别名**（`#/admin/git-sources` ⇒ `/admin/projects/git-sources`——`ROUTE_ALIASES` 静态别名 + `app.mjs` 重定向带子段）；
  ② 标签词复用既有 nav 键（`nav.page.admin.projects` ∥ `nav.page.admin.gitSources`——零新增键）。
- **组件侧零改**：`tabs.mjs` 零触（`{ root, active() }` API ∥ DOM/ARIA/键盘/懒建逐件不变）；`sub` 非法值静默回落首项 = 既有口径（消费面②非法子段回落标签①）。

## 3. 文件账（本面文件行）

| 档 | 行数 | 职责 |
|---|---|---|
| `thincoder-server/public/tabs.mjs`（已落） | ≈**120**（档头 ∥ `createTabs` 壳 ∥ ARIA/键盘 ∥ 懒建 ∥ `onChange`/`active`；零依赖——仅取 `i18n.mjs` 的 `t`） | 公共标签页组件（§2.1） |

**面小计**：≈120（域合计 = 各面之和——不单列）。

**消费面文件账**（沙盒页四档 + 路由两档 + 样式 + i18n 两档）：沙盒页四档 + i18n 两档 ⇒ `webui/SANDBOX.md` §3 ∥ 样式 ⇒ `webui/STYLE.md` §3 ∥ 路由两档（`nav.mjs` ∥ `app.mjs`）⇒ `webui/WEBUI.md` §5（本档不复制）。

## 4. 验收（本面 AC 行）

| 需求 | 设计级判据 | 载体 |
|---|---|---|
| AC-39（功能点 39——控制台公共标签页组件；已落需求档——`docs/server/requirements/PROJECT.md` 验收表） | ① 公共组件在册（`thincoder-server/public/tabs.mjs` 拟新增——`public/` 共享件 ∥ 多面切换（点按 ∥ ←/→ ∥ Home/End）∥ 零外部依赖（仅取 `t`——零第三方 ∥ 零 CDN）∥ 复用 API（`createTabs`——本档 §2.1 逐项）∥ 模块顶层零浏览器全局——node 可 import；沿弹窗组件先例）∥ ② 首个消费 = 沙盒页分标签（两标签在册——归位逐件 = `webui/SANDBOX.md` §2.1①；切换可用（点按/键盘）；两侧内容与现功能零回归（五族动作面逐件））∥ ③ 其余页面零改（`SHELL_PAGES` 五路径不动 ∥ `PAGES` 表其余行零改 ∥ 其余视图档 ∥ i18n 其余部件零改 ∥ nav 组/项零改）∥ 地址栏径（裁定「进」——nav 子段容许 + app 三参 + 页内 replaceState 三件机检）∥ 样式：零新 `:root` 变量 ∥ 行悬停声明清单不变 ∥ 钮族悬停 = `webui/STYLE.md` §2.1 ② 型表在册（页签取 `--hover` 底） ∥ i18n：+2 键两表同步（en 零 CJK）∥ 档目随正——单源 = `webui/WEBUI.md` §1 | 单元测试档 + 收口轮（浏览器实走） |

## 5. 边界（本面不做面）

- 其余页面标签化（用户后续逐页点名——不预设铺开清单；**第二消费面已点名** = 管理·项目页（本档 §2.3）；其余页仍不预设）；页内「卡/区」体系改造（㈡ 裁定「保留」）；沙盒 ②–⑥ 余面的标签归属（余面批点——不预设）。
- 组件不做：嵌套页签 ∥ 可关闭/拖拽重排页签 ∥ 组件级文案键 ∥ 路由感知（hash 读写 = 消费面）∥ 动画/过渡（沿 canon 零动画口径）。
- 本档 = 设计轮（产品码零触）；实施 = 实施轮（受影响档表 = 本档 §2）。

## 6. 上抛/余项

- KD 指针：KD-SV-102/103 在册 = `sandbox/SANDBOX.md` §14 指针行（指向本档 §1）。
