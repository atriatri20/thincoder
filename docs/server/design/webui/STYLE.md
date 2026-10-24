# Thincoder Server · 样式与版式（webui/STYLE.md）

> 本档迁自 `webui/WEBUI.md` §2.5 ∥ §2.6 及三表归位行（域内拆分）。域总览与壳面 = `webui/WEBUI.md`。

## 1. 关键决策（本面）

| # | 决策 | 理由 |
|---|---|---|
| KD-SV-36 | **控制台样式族 = 变量单源 + 一套刻度 + 系统基线对齐**（功能点 19——用户 22:00/22:01）：族目 = ①列表 ②按钮 ③表单 ④间距 ⑤字排 ⑥色板状态 ⑦卡片 ⑧弹窗 ⑨空错态 ⑩码面（勘误：新增 ⑩ ∥ 变量单源重定位为底座）；一字族 ∥ 一字号 13px ∥ 行距 1.5 ∥ 零粗体（强调 = 色通道）；悬停底同值（列表行/中性面——`--hover`） ∥ 可点行 = 三件套（指针/焦点环/键盘） ∥ 收束不重设计（骨架/类名沿用——死类删净 ∥ 零新档零动画） | 用户 22:00「hover 行的背景色会不一样，有的还没有」+ 22:01 扩裁；系统基线 = 用户 2026-09-30 排版裁定（`docs/desktop/requirements/UI.md` D29 同口径——一字族/一字号/无粗体·颜色区分）；需求 §2:19 |
| KD-SV-150 | **隐藏切换语义 = 全局 `[hidden]` 兜底（`style.css`：`[hidden] { display: none !important; }`）+ 删按例补丁**（功能点 48②；机制与核对表 = 本档 §2.3） | 根因 = **类**非点：UA `[hidden]` 被任何作者 `display` 压过（作者样式优先于 UA——与特异性无关）；按例补丁已铺两处仍漏两处（实锤 = 基址 label ∥ github 事件块）——一次性闭合（铁律 2「撞错结构当场修，不叠最小补丁盖症状」）；`!important` 编码语义本身（`hidden` = 不渲染，布局不得复活——非覆盖布局）；净效果 = 增 1 行删 2 行 |
| KD-SV-37 | **控制台布局收正 = 数据表五页视口高壳 + 左对齐 + 弹窗列表表格化**（功能点 20）：壳面钉五页（`#/me/usage` 为「用量明细」= 我的·用量页；`#/admin/usage` 看板页排除——报表区无界）；两段壳（`.page-head`/`.page-area`）+ 高度链（`body.data-shell` ⇒ `100dvh` flex 链 ⇒ `.table-slot` ⇒ `.table-wrap` 滚区）+ `thead th` 吸附（限 `main`）；**表尾 tfoot「共 N 项」**（`common.rowCount`——吸附表底）；弹窗内表自滚（单滚动面伸缩链本档 §2.2⑤ + 表头吸附——2026-10-07 轻笔/走查收正）；回退 = ≤760px 宽 ∥ ≤600px 高 ⇒ 撤链整页滚；`main` 撤 auto；弹窗三列表 = 表格形（勾选表 = 列式五列——首格 `label`（勾选 + 模型名）；点题名同切换保持） | 用户 07:24–07:32 走查四条（需求 §2:20——父侧 07:4x 第五页裁定在案）；零新档 ∥ 零新端点 ∥ 零新变量（AC-19 canon 不破）；行计数纯前端派生 |

## 2. 机制

### 2.1 样式族规范（功能点 19——全控制台样式收束 · 2026-10-06）

用户 22:00 列表起意（「不同的列表样式会有区别，比如 hover 行的背景色会不一样，有的还没有，我希望你统一规划一下列表样式」）→ 22:01 扩裁（「还有哪些你觉得应该统一规划的样式也都一起规划一下」）⇒ 全控制台族目收束。落点 = `thincoder-server/public/style.css`（单档重排——**零新档**）+ 各视图档类串微改；**边界** = 版式/结构/数据/交互语义零动（骨架沿用）；与「系统基线统一」（一字族/一字号/无粗体·颜色区分）对齐。

**族目勘误（父侧拟十族目）**：① 列表面 ∥ ② 按钮族 ∥ ③ 表单控件 ∥ ④ 间距刻度 ∥ ⑤ 字排 ∥ ⑥ 色板与状态色 ∥ ⑦ 卡片/容器 ∥ ⑧ 弹窗内构 ∥ ⑨ 空/错/加载态——**九族维持**；**增「码面」= 第 10 族**（`code` 芯片 ∥ `snippet` 块 ∥ 密钥/标识字面量——现盘跨 ⑤⑦ 无主）；**「变量单源」由并列族重定位为底座**（全族值源——机制面）。

**口径（五条——族面通则）**：

① **变量单源**（底座）：`style.css` `:root` = 色/间距/圆角/字排/线宽/布局唯一值源；`:root` 块外零颜色字面量。
  **桥例外**：核件壳族变量名（`--fg`/`--muted`/`--input-bg`/`--red`/`--error-fg`/`--diff-del-bg`/`--shadow`/`--overlay`/`--hover-bg`/`--btn-*` 一族）入 `:root` **别名块**——逐键 = 既有控制台变量引用（零新值 ∥ 零颜色字面量；单源不破——值仍一处）；**必须 `:root` 级**（核件确认层/toast 挂 body 层，不可限 `#toolbar` 作用域）。
② **一套刻度**（④）：间距七级 ∥ 圆角三级（值表 = 下）；归位口径 = 就近取级、等距取小（保守——不放大）。
③ **系统基线对齐**（⑤）：**一字族 ∥ 一字号（13px） ∥ 行距 1.5 ∥ 自有文字零粗体**——强调 = 颜色通道；层级 = 结构通道（位置 ∥ 间距 ∥ 底色 ∥ 边框 ∥ 线宽）。**终端面例外**：终端窗内 cell 按 pty 语义渲染（`font-weight` 可用——仿真面，非「自有文字」）；其余面零粗体不变。
④ **态面齐备**（①⑨）：悬停/聚焦/禁用/空·错·加载态逐族在册；**悬停底同值——限定列表行/中性面**（`--hover`：表格数据行 ∥ 导航项；「有的还没有」收口）；钮/链接等交互件悬停取值逐型在表（②——非同值面）。
⑤ **收束不重设计**：类名骨架沿用（仅删死类 ∥ 新增态修饰 `.error`）；零动画/过渡；零依赖零构建不变（KD-SV-9）。

**散置/不一致清单（行号 = `thincoder-server/public/style.css`）**：

| # | 散置/不一致项 | 盘面实读 | 收束 |
|---|---|---|---|
| S1 | 悬停底分歧 + 零悬停面（用户原句） | `:27` `#eef1f5`（导航项）∥ `:129` `#f3f6fb`（可点行）∥ 非可点表行零悬停 | `--hover`（`#eef1f5`）列表行/中性面单值 |
| S2 | 表头/码底两值 | `:39` `#eef1f5` ∥ `:40` `:69` `#f0f2f5` | `--fill`（`#f0f2f5`） |
| S3 | 状态色重字面 | `:85` `:94` `#2e9e5b` ∥ `:86` `:95` `#d8a013` ∥ `:84` `#9aa3b0` | `--ok` ∥ `--warn` ∥ `--idle` |
| S4 | 白两写法 | `:43` `:44` `:78` `#fff` ∥ `:5` `--panel`＝`#ffffff` | 统一 `--panel` |
| S5 | 字号七档 | 12px（10 处）∥ 13px（12 处）∥ 15px（`:34`）∥ 18px（`:121`）∥ 20px（`:93`）∥ body 16（缺省）∥ h2 24（UA） | `--fs`（13px——全档单值） |
| S6 | 字重七处 600 + UA 粗体 | `:23` `:28` `:39` `:72` `:74` `:79` `:93`（600）∥ h2/h3/h4（UA 700） | 全 400（零粗体——强调走色） |
| S7 | 圆角四值 | `:104` 2 ∥ `:40` 3 ∥ `:26` 等 6 ∥ `:35` `:54` `:117` 8 | `--r-1..3` = 4/6/8 |
| S8 | 间距十三值 | 1 ∥ 2 ∥ 3 ∥ 4 ∥ 5 ∥ 6 ∥ 8 ∥ 10 ∥ 12 ∥ 14 ∥ 16 ∥ 18 ∥ 20（padding/margin/gap 全档散置） | `--sp-1..7` = 2/4/6/8/12/16/20 |
| S9 | 行高三值 | 缺省 `normal` ∥ `:73` 1.7 ∥ `:121` 1 | `--lh`（1.5——全档继承） |
| S10 | 聚焦环单处 + 控件走 UA 缺省 | `:130` 仅可点行有环；钮/输入/下拉零自定义环 | 统一环 2px `--accent`（控件外偏 2px ∥ 行内缩 −2px） |
| S11 | 钮族态面缺位 | `:43` 起零 `:hover`/`:focus-visible`/`:disabled` | 五型悬停在册 ∥ 禁用中性化（`--muted` 字 ∥ `--fill` 底） |
| S12 | 危险钮两形 | 主危（`:45` 仅改字/边——底仍 `:43` 蓝）∥ 次危（`:44`+`:45` 白底红字） | 危险 = 描边单形（面板底 ∥ 红边红字 ∥ 悬停 `--danger-fill`） |
| S13 | 活动/选中态两形 | `:28` 导航（底 `#e6efff` + 字 accent + 600）∥ `:79` 语言钮（边/字 accent + 600——零底） | `--selected` 底 + accent 边/字（600 撤） |
| S14 | 死类/死规则 | `stat`（`thincoder-server/public/views-usage.mjs:106` ∥ `views-overview.mjs:50` 传参——零规则）∥ `view`（`thincoder-server/public/app.mjs:248` `:259` 传参——零规则）∥ `.key-line`（`style.css:58` 规则——零消费者） | 删净（双向闭合口径 = 本档 §4 AC-19 续行） |
| S15 | 宽值重复 | 560（`:117` ∥ `:122`）∥ 200（`:21` ∥ `:31`） | `--modal-w` ∥ `--nav-w` |
| S16 | 三态同形（错不可辨） | 加载 ∥ 空 ∥ 错皆 `.hint`（`--muted`） | 加载/空 = `.hint`；错 = `.hint error`（`--danger` 字） |
| S17 | 强调线两宽 | `.tip-bar` 3px（`:113`）∥ 聚焦环 2px | `--bw-strong`（2px） |

**底座（⑩ 重定位）：变量族（`style.css` `:root`——单源）**：

| 组 | 变量 = 值 | 角色/消费面 |
|---|---|---|
| 底/面 | `--bg`＝`#f5f6f8` ∥ `--panel`＝`#ffffff` | 页底 ∥ 侧栏/卡/弹窗/钮底 |
| | `--fill`＝`#f0f2f5` ∥ `--hover`＝`#eef1f5` ∥ `--selected`＝`#e6efff` ∥ `--backdrop`＝`rgba(15, 23, 42, 0.45)` | 静态浅底 ∥ 悬停底 ∥ 选中/活动底 ∥ 弹窗遮罩 |
| 字/线 | `--text`＝`#1f2430` ∥ `--muted`＝`#6b7280` ∥ `--border`＝`#d9dee5` | 正文 ∥ 次级/禁用字 ∥ 结构线 |
| 主 | `--accent`＝`#2f6fed` ∥ `--accent-hover`＝`#2a63d4` ∥ `--accent-contrast`＝`#ffffff` | 主色 ∥ 主钮/链接悬停 ∥ 主钮字 |
| 状态 | `--ok`＝`#2e9e5b` ∥ `--warn`＝`#d8a013` ∥ `--danger`＝`#c2372f` ∥ `--idle`＝`#9aa3b0` | 成功 ∥ 警告 ∥ 危险 ∥ 中性（健康点） |
| 状态面 | `--danger-fill`＝`#fff5f5` ∥ `--warn-fill`＝`#fff4d6` ∥ `--warn-line`＝`#e5cf98` ∥ `--warn-ink`＝`#6b4b00` | 密钥面底/危险悬停 ∥ 提示条底 ∥ 提示条线 ∥ 提示条字 |
| 间距（④） | `--sp-1..7` ＝ 2 ∥ 4 ∥ 6 ∥ 8 ∥ 12 ∥ 16 ∥ 20（px） | 全档 padding/margin/gap |
| 圆角（⑦） | `--r-1..3` ＝ 4 ∥ 6 ∥ 8 | 微件（码芯片/柱顶） ∥ 控件 ∥ 容器/弹窗 |
| 字排（⑤） | `--font`＝系统 UI 栈（现值） ∥ `--mono`＝`ui-monospace, Consolas, "Courier New", monospace` ∥ `--fs`＝13px ∥ `--lh`＝1.5 | UI 唯一族 ∥ 码唯一族（⑩ 码面——登记例外） ∥ 唯一字号 ∥ 唯一行高 |
| 线宽 | `--bw`＝1px ∥ `--bw-strong`＝2px | 结构线 ∥ 强调线（提示条左规 ∥ 聚焦环） |
| 布局 | `--nav-w`＝200px ∥ `--modal-w`＝`clamp(560px, 78vw, 1200px)`（视口比例式三段：小屏保底 560 ∥ 比例段 78vw ∥ 大屏封顶 1200——2026-10-07 用户走查令） | 侧栏宽+内容缩进 ∥ 弹窗宽（三处口径） |
| 终端（第八组；登记例外） | `--term-bg`＝深底 ∥ `--term-fg`＝亮字 ∥ `--term-c0..c7`（ANSI 八色——常色系） ∥ `--term-c8..c15`（对应亮色系）——**共 18 枚**；落地值以实施实读为准 | 终端面调色板（`terminal-render.mjs` 消费；面内零颜色字面量——§2.1 ① 不破） |

**族值表 + 套用表（①–⑩——逐族；「随其落地」= #87/#88 新面，实施轮按当刻盘面并入）**：

**① 列表面**（数据表 ∥ 侧栏导航 ∥ key 清单）：

| 面 | 收束值 |
|---|---|
| 表容器 `.table-wrap` | 宽表横滚保留（结构零动） |
| 表头 `th` | 底 `--fill` ∥ 字 400 `--text` ∥ 线 `--bw solid --border` ∥ 内距 `--sp-3 --sp-4` |
| 表头吸附（壳内——本档 §2.2②） | `position: sticky` + `top: 0` + `z-index: 1`（滚区 = `.table-slot > .table-wrap`）；底色 = `--fill`（上行单源）；弹窗内表自滚（单滚动面伸缩链——本档 §2.2⑤）+ 表头吸附（2026-10-07 走查收正） |
| 单元格 `td` | 内距 `--sp-3 --sp-4` ∥ 线 `--bw solid --border` ∥ 行高 `--lh` |
| 行悬停（可点 ∥ 不可点——表格数据行） | `--hover`（`tbody tr:hover` 单一声明——表格数据行全覆盖） |
| key 表（`#/me/keys`） | 表格族 canon 同源（`.table-wrap > table`——本档 §2.2⑤ 同构 ∥ 行悬停 = `tbody tr:hover` 上行单一声明）；`ul.key-list`/`.key-item`/`.key-meta` 族随页重做**删净**（零死类——S14 口径） |
| 可点行 `.row-clickable` | `cursor: pointer` ∥ `:focus-visible` 行内环（−2px） ∥ 键盘可达（`tabindex` + Enter/Space——视图档口径现状保持） |
| 选中/活动 | `--selected` 底 + `--accent` 字（现落点 = 导航活动态 ∥ 语言钮 `.active` ∥ 页签活动态 `.tab.active`） |
| 导航项 `.nav-item` | 内距 `--sp-2 --sp-4` ∥ 圆角 `--r-2` ∥ 悬停 `--hover` |
| 空态 | `.hint`（⑨） |
| 套用面 | 侧栏导航 ∥ 成员表 ∥ Provider 表（#87——随其落地） ∥ 服务模型表（#88——随其落地） ∥ 用量明细/排行 ∥ 审计 ∥ 账户 ∥ key 表 |

**② 按钮族**（六型 + 态面——（console-tabs-component）增「页签」型）：

| 型 | 类（现名） | 常态 | 悬停 |
|---|---|---|---|
| 主 | `button` | `--accent` 底 ∥ `--accent-contrast` 字 ∥ `--r-2` ∥ 内距 `--sp-3 --sp-5` | 底/边 `--accent-hover` |
| 次 | `button.tiny` | `--panel` 底 ∥ `--border` 边 ∥ `--text` 字 ∥ 内距 `--sp-1 --sp-3` | `--hover` 底 |
| 危险 | `button.danger`（含 `.tiny.danger`） | `--panel` 底 ∥ `--danger` 边/字 | `--danger-fill` 底 |
| 链接 | `button.link` | 无边底 ∥ `--accent` 字 | 字 `--accent-hover` |
| 图符 | `.modal-close` | `--muted` 字 ∥ `--r-2` | `--hover` 底 + `--text` 字 |
| 页签 | `button.tab`（公共标签页组件 `tabs.mjs`（已落）） | 透明底 ∥ `--text` 字 ∥ `--r-2` ∥ 内距 `--sp-2 --sp-4`（活动态 = `--selected` 底 + `--accent` 字——① 选中/活动同款） | `--hover` 底 |

- 禁用 = `--muted` 字 ∥ `--fill` 底 ∥ `cursor: default`；聚焦 = 统一环（②③⑦ 同）。
- 语言钮收编：`.lang-switch button` 专用规则并入 `tiny`（padding 微差归刻度）；`.active` = `--selected` 底 + accent 边/字。
- 套用面：页首钮（新建成员 ∥ 添加）∥ 行内钮（测试/编辑/删除 = `tiny`/`tiny danger`）∥ 弹窗脚区（保存/创建 = 主 ∥ 取消/关闭 = 次 ∥ 重置密码/吊销/删除 = 危险）∥ 语言切换两枚 ∥ 退出登录（`link`）∥ 服务模型停用钮（#88——随其落地 = 危险族）∥ 公共标签页组件（`tabs.mjs`——拟新增——沙盒页首用）。

**③ 表单控件族**：

| 面 | 收束值 |
|---|---|
| `input`/`select` | 内距 `--sp-3 --sp-4` ∥ 线 `--bw solid --border` ∥ 圆角 `--r-2` ∥ 字继承（`--fs`） ∥ 聚焦环 |
| `input.tiny`（紧凑） | 内距 `--sp-1 --sp-3` |
| `input.quota`／`.provider-form input` | 宽/最小宽 = 尺寸字面（非刻度面——原值保留） |
| `label` | 距 `--sp-3` ∥ `--muted` |
| 勾选框 `checkbox` | 原生 + `accent-color: var(--accent)`（零自绘） |
| 表单容器 `.row-form`/`.stack`/`.provider-form`（竖排修饰 `.stacked`——`webui/SYSTEM.md` §2.1；变体实距 = `gap: --sp-2` ∥ `margin-bottom: --sp-3`——与基族 `--sp-4` 异值、均在刻度内） | 距 `--sp-4` |
| 套用面 | 登录 ∥ 改密 ∥ 配额 ∥ 过滤表单（用量/审计） ∥ 新建成员 ∥ #87 弹窗字段（名/baseURL/密钥/清除勾/候选勾选——随其落地） ∥ #88 配置输入（RPM/TPM/权重/说明——随其落地） |

**④ 间距刻度**：

| 面 | 收束值 |
|---|---|
| 刻度 | `--sp-1..7` ＝ 2/4/6/8/12/16/20 |
| 归位口径 | 就近取级 ∥ 等距取小（不放大） |
| 页节距 | `main` 外距 `--sp-7` ∥ 卡下距/内距 `--sp-6` ∥ 页题下距 `--sp-6` |
| 栅格间隔 | `.stat-grid`/`.grid-2` `--sp-5` ∥ `.detail-grid` `--sp-3 --sp-5` |
| 白名单 | `0`/`auto` 字面；尺寸类（width/height/max-*）不属刻度面 |

**⑤ 字排族**：

| 面 | 收束值 |
|---|---|
| 族 | `--font` 单栈（UI） ∥ `--mono`（码——⑩ 面） |
| 字号 | `--fs` 13px（全档唯一——含页题/卡题/KPI/表/钮/输入） |
| 行高 | `--lh` 1.5（全档继承——`.end-list` 1.7 ∥ 图符钮 1 撤） |
| 字重 | 全 400（零粗体——600 七处 ∥ UA 700 撤） |
| 层级 | 结构通道（位置 ∥ 间距 ∥ 底色 ∥ 边框 ∥ 色）——h2/h3 = `--text` ∥ h4 = `--muted` |
| 强调样例 | `.update-tip` = `--warn` 字；ok/degraded/down 状态文案 = 色 |
| 字距 | 零声明（现状即符——无 tracking） |

**⑥ 色板与状态色族**：值 = 底座色变量（上表）——语义分配：

| 面 | 收束值 |
|---|---|
| 提示条 `.flash` | `--warn-fill`/`--warn-line`/`--warn-ink`（单形——零严重度分色） |
| 提示条 `.tip-bar` | 卡 + 左 `--bw-strong` `--accent` 规 |
| 密钥面 `.secret` | 虚线 `--danger` 边 + `--danger-fill` 底 |
| 健康三态（灯 ∥ 系统块 ∥ 总览卡） | `--ok`/`--warn`/`--danger` ∥ 中性 `--idle` |
| KPI 三态（`.stat-value.ok/.degraded/.down`） | 同上单源 |
| 套用面 | 十页色面 + #87/#88（随其落地） |

**⑦ 卡片/容器族**：

| 面 | 收束值 |
|---|---|
| 基 `.card` | `--panel` ∥ `--bw solid --border` ∥ `--r-3` ∥ 内距 `--sp-6` ∥ 下距 `--sp-6` |
| 变体 | `.stat-grid .card`（网格内零下距） ∥ `.tip-bar`（左规） ∥ `.secret`（危险面） ∥ `.snippet`（码块——⑩） |
| 套用面 | 总览卡集 ∥ 用量看板卡 ∥ 系统四卡 ∥ 接入卡 ∥ 成员/Provider/模型列表卡（#87/#88 随其落地） ∥ 登录卡 ∥ 我的三页卡 |

**⑧ 弹窗内构族**：

| 面 | 收束值 |
|---|---|
| 壳 `dialog.modal` | `--panel` ∥ `--bw solid --border` ∥ `--r-3` ∥ 宽 `--modal-w` |
| 头/脚 `.modal-head`/`.modal-foot` | 内距 `--sp-5 --sp-6` ∥ 分隔线 `--bw` |
| 体 `.modal-body` | 内距 `--sp-5 --sp-6` ∥ max-height `min(70vh, --modal-w)`（公式未动；560 不再约束 ⇒ 桌面实际 = 70vh——2026-10-07 用户走查令） |
| 小节 h4 ∥ 详情栅格 `.detail-grid` | `--muted`（⑤） ∥ 栅距 `--sp-3 --sp-5` + 下距 `--sp-5` |
| 遮罩 `::backdrop` | `--backdrop` |
| 弹窗内表格（本档 §2.2⑤） | 全站表格族同源（`.table-wrap > table`）——勾选表 ∥ 预设模型表 ∥ 成员 key 表 ∥ 配额表；自滚（单滚动面伸缩链本档 §2.2⑤——短表保自然全高 ∥ 长表承缩自滚）+ 表头吸附（2026-10-07 走查收正） |
| 套用面 | 成员三态窗 ∥ 模型详情窗 ∥ #87 双弹窗（添加/详情——随其落地） ∥ #88 配置窗（随其落地） |

**⑨ 空/错/加载态族**：

| 面 | 收束值 |
|---|---|
| 加载 | `.hint`（静态文案——零动画零 spinner） |
| 空 | `.hint` |
| 错（页内） | `.hint error`（`--danger` 字——八处「加载失败」面：`views-admin.mjs:51` ∥ `views-me.mjs:233` `:234` ∥ `views-models.mjs:118` ∥ `views-usage.mjs:57` `:58` ∥ `views-audit.mjs:47` ∥ `views-providers.mjs:35`；+ 系统页诊断失败面：`views-system.mjs:92` 状态行 ⇒ `.error` ∥ `:115` 试跑行 ⇒ `.hint error`；+ 弹窗段内 3 处（`views-providers-modals.mjs`：候选发现失败 ∥ 窗内状态行×2〔添加窗 ∥ 详情窗——测试连接/保存/获取模型；2026-10-07 走查收正〕）） |
| 全局提示 | `.flash`（⑥ 单形） |
| 套用面 | 十页空/加载/错态 + #87/#88 新面（随其落地） |

**⑩ 码面族（新增）**：

| 面 | 收束值 |
|---|---|
| 芯片 `code` | `--mono` ∥ `--fs` ∥ `--fill` 底 ∥ 内距 `--sp-1 --sp-2` ∥ `--r-1` |
| 块 `.snippet` | `--mono` ∥ `--fill` 底 ∥ `--bw solid --border` ∥ `--r-2` ∥ 内距 `--sp-4` ∥ 横滚 |
| 块内芯片 | 底/内距清零（去重） |
| 密钥字面量 `.secret-value` | `word-break: break-all` ∥ `user-select: all`（可全选——保留） |
| 口径 | 码族 = **唯一族例外**（字面量对齐/可读——桌面排版先例同款：码面独立于 UI 族）；同号同重（一字号口径不破） |
| 套用面 | 表内标识/密钥提示形 ∥ 系统页/用量页 snippet ∥ 密钥明文区 ∥ #87 模型清单（随其落地） ∥ #88 快照值（随其落地） |

**#87/#88 接续标注**：本节 = 全域样式单源——**后续新增面按本节族表套用**；#87（Provider 重做——工具条 ∥ 添加/详情双弹窗 ∥ 候选勾选列表） ∥ #88（服务模型配置——配置四组 ∥ 停用流 ∥ 元数据行）之新面已列各族套用面并标「随其落地」——实施轮以当刻盘面为准并入；
两批产品面落地晚于本节 ⇒ 由其落地轮按本节套用（本节不代改其面）；#87 旧内联面撤除 ⇒ 其表单族类（`.provider-form`/`.key-clear`/`.stack-models`）随双弹窗复用——零死类（S14 零登记）；`.model-picks` 随布局收正批（本档 §2.2⑤）退役——规则与字面删净。

**me 用量图表化新面登记**：`.bar-stacked`/`.bar-seg`/`.bar-swatch`/`.chart-toggle`/`.bar-legend`/`.report-card`——按族套用（段色 = `--accent` 透明度阶梯〔⑥ 色板单源不破〕 ∥ 切换钮活动态 = `.lang-switch .active` 同形〔① 选中态〕 ∥ 内距/间距/圆角 ∈ 各族刻度；零新 `:root` 变量 ∥ 零新悬停规则）；实施轮以当刻盘面并入。

**标签页新面登记**：`.tabs`（标签容器） ∥ `.tab-list`（页签条） ∥ `.tab`/`.tab.active`（页签钮——② 型扩充） ∥ `.tab-panel`（面板——`hidden` 切换）——按族套用（悬停 `--hover` ∥ 选中 `--selected`/`--accent` ∥ 内距/圆角 ∈ 各族刻度；零新 `:root` 变量 ∥ 行悬停声明清单不变 ∥ 钮族悬停 = ② 型表在册（页签取 `--hover` 底））；实施轮以当刻盘面并入。

**对话页壳新面登记**：**核件发射类族**（核 `thincoder-render-core/flow/block.mjs`/`composer/` 发射——控制台补样式）：
  - 消息面：`.message`（`.user`/`.assistant`——平铺无底） ∥ `.msg-label`（`--accent` 字）∥ `.msg-time`（`--muted` 字）∥ `.bubble`（无底无框——VSC 平铺形）∥ `.message.pending`（待发泡：`--muted` 字）；
  - 输入区：`#toolbar`/`#input-row`/`#controls-row`/`#paste-bar`/`.paste-toast`（核 `composer.css` 命中，本档零覆写）；
  - 自持新增：`#status-line`/`.status-sep`（状态行——`--muted` 字 ∥ 段间距 ∈ ④ 刻度）∥ `.chat-bar`（会话条——sticky 顶 ∥ `--panel` 底 ∥ 下边 `--border`）∥ `.chat-thread`（文档流平铺）∥ 输入区 sticky 底；
  - **无源钮隐藏**（`#auto-btn`/`#advisor-btn`/`#eng-btn`/`#plan-btn`/`#settings-btn` = `display:none`——无源实证 = `webui/CHAT.md` §2.1③④；`#reasoning-btn` 经 KD-SV-111 出列——档位钮启用〔2026-10-13 收正——评审 #43 发现 1〕）；内距/间距/圆角 ∈ 各族刻度；零新悬停规则（AC-19 canon）；**别名桥 = §2.1① 桥例外**。

**实施面**：`style.css` 重排（值源化 + 态面 + 死规则删） ∥ `views-admin.mjs` ∥ `views-me.mjs` ∥ `views-models.mjs` ∥ `views-usage.mjs` ∥ `views-audit.mjs` ∥ `views-providers.mjs`（`.hint error` 共 7 处） ∥ `views-providers-modals.mjs`（#87 段内错误面 ⇒ `.hint error`——随其落地并入） ∥ `views-system.mjs`（诊断失败面 2 处——`.error` 修饰） ∥
  `views-overview.mjs` ∥ `app.mjs`（死类串删——`stat` 2 处 ∥ `view` 2 处）；`nav.mjs` ∥ `modal.mjs` ∥ i18n 两表 = 零触（零新文案）。

### 2.2 数据表页视口高壳与布局收正（功能点 20——2026-10-07）

用户 07:24–07:32 走查四条（表格适应视口高 ∥ 主内容左对齐 ∥ provider 弹窗模型列表表格化 ∥ 成员弹窗 key 列表表格化）⇒ 本条。**边界**：不动列/数据语义 ∥ 分页/筛选不入 ∥ 零依赖/零构建不变（KD-SV-9）。

**① 套用面（钉表）与排除面**：

- 壳面 = 数据表五页：成员 `#/admin/members` ∥ Provider `#/admin/providers` ∥ 服务模型 `#/admin/models` ∥ 审计 `#/admin/audit` ∥ 用量明细 `#/me/usage`（我的·用量页——父侧 07:4x 裁定）。
- 排除面：`#/admin/usage` 看板页（报表卡无界——与有界壳不相容；如需并入另轮）∥ 布局/信息表（系统页四表 ∥ 账户页表 ∥ 我的用量页报表卡（分模型表——随卡自滚；非壳表链））∥ key 表（页级——`#/me/keys`；非壳数据表——钉表五页不扩——入壳 = 另议）∥ 项目面两页（`#/admin/projects` 两标签 ∥ 其 Git 源面板——定论：非壳页；表格随页整页滚——沿 key 表非壳先例）。

**② 机制——两段壳与高度链（表尾计数 = 表内 tfoot）**：

- 壳结构 = `.page-head`（页题/工具条/过滤——固定）∥ `.page-area`（表卡——吃剩余高）；由 `ctx.dataShell(mount, { head, area })` 构建（两段挂载）。表卡内 = `.table-slot`（表 ∥ 空/错态）——直持 `.table-wrap`（滚区）；**行计数 = 表内 `<tfoot>`**（`table(…, { foot: true })` 或自建构建器同形——「共 N 项」，吸附表底）。
- `body.data-shell` = 壳页标记（`app.mjs` 路由按 `SHELL_PAGES` 五路径切换——登录/登出径清除）。
- 高度链（`style.css` 声明单源——本表）：

| 选择器 | 声明 |
|---|---|
| `body.data-shell .content` | `height: 100dvh; display: flex; flex-direction: column` |
| `body.data-shell main` | `flex: 1; min-height: 0; display: flex; flex-direction: column` |
| `body.data-shell main > section` | `flex: 1; min-height: 0; display: flex; flex-direction: column` |
| `.page-head` | `flex: none` |
| `.page-area` | `flex: 1; min-height: 0; display: flex; flex-direction: column; gap: var(--sp-6)`（多卡壳页——卡间距；单卡页零影响） |
| `.page-area > .card` | `flex: 1; min-height: 0; display: flex; flex-direction: column; margin-bottom: 0` |
| `.page-area > .card.report-card` | `flex: none; max-height: 55%; overflow-y: auto`（报表卡——自然高不承缩；上限 = 页区高 55%（超限卡内自滚——滚动条仅超限时出）；明细卡仍走上行承缩链、恒得剩余高。与本档 §2.2① 判否理由〔报表卡无界——与有界壳不相容〕对齐：本页报表卡经上限界定，入壳相容） |
| `.table-slot` | `flex: 1; min-height: 0; display: flex; flex-direction: column` |
| `.table-slot > .table-wrap` | `flex: 1; min-height: 0; overflow-y: auto` |
| `body.data-shell main thead th` | `position: sticky; top: 0; z-index: 1` |
| `body.data-shell main tfoot td` | `position: sticky; bottom: 0; z-index: 1; background: var(--fill); color: var(--muted)` |

- 吸附口径：表头吸附在滚区上沿、**表尾 `tfoot` 吸附滚区下沿**（底色 = `--fill`——① 族单源）；**弹窗内表 = 自滚 + 表头吸附**（壳吸附选择器限 `main` 不命中弹窗；弹窗侧规则 = 2026-10-07 走查收正——本档 §2.2⑤）。
- 挂载前提①（弹窗挂载点——壳吸附不命中弹窗可核）：`<dialog>` 直属 `document.body`（`modal.mjs` 实读——`document.body.append(root)`；不在 `main` 内）⇒ 吸附选择器 `body.data-shell main thead th` 不命中弹窗内表。
- 挂载前提②（壳挂载点——高度链落点）：视图根 `<section>` 直属 `main#app`（`app.mjs` 路由实读——`h("section")` ⇒ `appEl.replaceChildren(mount)`；`index.html` `<main id="app">`）——`ctx.dataShell` 的 `mount` = 该 section ⇒ 高度链 `main > section` 命中视图根。
- 回退：`@media (max-width: 760px), (max-height: 600px)` ⇒ `body.data-shell .content { height: auto }`——撤高度链（整页滚；吸附随壳失效）；阈值 = 设计取值。
- 零新 `:root` 变量 ∥ 零新悬停规则——本档 §2.1 canon 不破（新声明全数纳入其判据）。

**③ 表尾行计数（tfoot）**：「共 N 项」（`common.rowCount`）——值 = 渲染行数（纯前端派生：随表同建——每次取数渲染即随行集现算；**空/错态 = 无表（hint）⇒ 无 tfoot**）。刷新对 = 全部重渲路径（过滤提交 ∥ 弹窗操作后 reload ∥ 语言重渲同拍）。零新端点。

**④ 主内容区左对齐**：`main` 撤 `margin: 0 auto` ⇒ `margin: 0`（左靠；`max-width: 1100px` 沿用——不加戏）。

**⑤ 弹窗内列表 = 表格形**（风格随全站表格族——`.table-wrap > table` 同构 ∥ 既有表样式零新族；**清单序 = 名称升序**〔候选 ∥ 预设清单〕——2026-10-07 走查收正：长清单可找）：

- **Provider 详情弹窗·勾选段**：**列式表五列**（表头 = `admin.models.colModel` ∥ `admin.providers.colDisplayName` ∥ `colContext` ∥ `metaVision` ∥ `colStatus`）——首格 = `label`（勾选 + 模型名）⇒ 点题名同切换保持（交互零改）；
  逐格 = `hint` span（缺则空、零占位；退役格 = `hint error`——有则示；功能点 24 = `webui/ADMIN.md` §2.1④）；空态 = `.hint` ∥ 加载 = `.hint`（`candidatesLoading`）∥ 发现失败 = `.hint error`（`webui/ADMIN.md` §2.1④ 不变量）。
- **添加弹窗·预设信息段**：模型清单 = 单列表（表头 = `admin.models.colModel`——行 = `code` 芯片）；地址行与 apiKey 面零动。
- **成员详情弹窗·key 表**：四列 = 密钥（`code` hint） ∥ 最后使用（本地化 ∥ `neverUsed`） ∥ 近 30 天（`windowTokensCell`——既有窗口口径） ∥ 操作（表头 `admin.members.colActions`；吊销钮行内）；空态 = `.hint`（`admin.members.noKeys`）。
- **弹窗内表自滚**（2026-10-07 走查收正 ∥ 同日实测修正——主信息不随表滚 ∥ **单滚动面**：伸缩链 = `.modal-body` flex 列 ⇒ **内容盒（`.modal-body > div`——modal.mjs 整只 append 的调用层盒）** flex 列 `min-height: 0` ⇒ 固定块 `flex: none` ∥ 清单区（`.pick-box`）`flex: 1 1 auto; min-height: 0` 自滚 ∥
直挂表区（`.modal-body > div > .table-wrap`——成员 key 表 ∥ 配额表）`flex: 1 1 auto; min-height: min-content`——短表（成员 key 表）保自然全高不缩 ∥ 长表（配额表）承缩自滚 + 下限（`.modal-body > div > .quota-table` `min-height: 140px` ≈ 三行——再挤 ⇒ 体滚兜底）；
外层 `overflow-y: auto` 仅极端兜底；Edge headless 同构实测红→绿在案）+ 表头吸附（`.modal-body .table-wrap thead th` sticky——同壳口径）。
- `.model-picks` 退役——规则与字面删净（S14 零登记口径）。

### 2.3 隐藏切换语义（`hidden` 兜底规则；功能点 48② ∥ AC-48 ④⑤）

**规则（KD-SV-150）**：`style.css` 底座区增一条 **`[hidden] { display: none !important; }`** ——全站隐藏语义单源；**原两处按例补丁（`.sidebar[hidden]` `:71` ∥ `.tab-panel[hidden]` `:126`）删净**（职能被全局规则吸收——不留冗余）。边界：`!important` 全档**仅此一条**（可点名机检）；组件侧零改（`hidden` 切换写法不动——修的是 CSS 侧）。

**核对表（全控制台 `hidden` 切换点——逐处核对 `display`）**：

| # | 切换点（实读） | 元素 | 作者 display 源 | 判定 |
|---|---|---|---|---|
| 1 | `views-git-sources.mjs:223`（基址门） | `<label>`（`field()` 产物） | `label` `:102` ∥ `.provider-form > label` `:144` ∥ `.provider-form.stacked > label` `:150` | **受压——修**（全局规则接管） |
| 2 | `views-git-sources.mjs:228`（github 事件块） | `div.stack-box` | `.stack-box` `:235` | **受压——修** |
| 3 | `thincoder-server/public/app.mjs:154/168`（侧栏） | `aside.sidebar` | `.sidebar` `:70` | 受压——原补丁 `:71` 已覆（删补丁，全局规则接管） |
| 4 | `tabs.mjs:38/60`（标签面板） | `div.tab-panel` | `.tab-panel` `:125` | 受压——原补丁 `:126` 已覆（同接管） |
| 5 | `thincoder-server/public/dom.mjs:115/117`（提示条） | `p.flash` | 无（`.flash` 无 `display`） | 结构性安全 |
| 6 | 余各档（`hidden` 字面全扫——`thincoder-server/public/dom.mjs:57` ∥ `modal.mjs` ∥ `host-credential.mjs` ∥ `views-admin.mjs` ∥ `views-chat.mjs` ∥ `views-ledger.mjs` ∥ `views-me.mjs` ∥ `views-me-sandbox.mjs` ∥ `views-models.mjs` ∥ `views-projects.mjs` ∥ `views-providers-modals.mjs` ∥ `views-sandbox*.mjs`（四档）∥ `views-system*.mjs`（两档）） | `p/span.hint`·`.error`·`.secret`·无类 div | 无（族值规则无 `display`） | 结构性安全（面上全列；「安全」= 命中规则集内无 `display` 声明，非逐点实测） |

**机检形（单测档）**：① `[hidden]` 覆盖规则在册（含 `display: none` 与 `!important`）∥ ② `style.css` 全文 `!important` 计数 = 1 ∥ ③ `.sidebar[hidden]`/`.tab-panel[hidden]` 字面零残留（旧补丁零残留）∥ ④ 弹窗源码：非自建平台 ⇒ `hidden` 真值切换（不手写内联 display） ∥
  ⑤ **核对表穷尽性（集合断言）**：`public/**` 全目录扫描含 `hidden` 字面档集 ⊆ 核对表第 6 行在册档集（漏列即红——「面上全列」机械化）。**视觉终判** = 收口轮浏览器实走（建源弹窗两平台两态——非自建 ⇒ 基址不可见）。

## 3. 文件账（本面文件行 ∥ 键族登记）

| 档 | 行数（实读） | 职责 |
|---|---|---|
| `thincoder-server/public/style.css`（已落盘） | ≈**398**（终端面增补：调色盘 18 变量入 `:root` ∥ 终端面类族 ≈+22 ∥ 粗体例外登记） | 系统字体 ∥ 表格/表单 ∥ 桌面优先（宽表横滚） |

**面小计**：**358**（本面档行现读和；域合计 = 各面之和——不单列）。

**键族登记**：本面零键族行（i18n 两表 = 零触——零新文案）。

## 4. 验收（本面 AC 行）

| 需求 | 设计级判据 | 载体 |
|---|---|---|
| AC-19（功能点 19——样式族总体统一；`docs/server/requirements/PROJECT.md` 验收表） | 本档 §2.1 在册：口径五条 ∥ 散置/不一致清单（改前实读——S1–S17） ∥ 变量族底座（`:root` 单源——色/间距/圆角/字排/线宽/布局） ∥ 族值表 + 逐族套用表（①列表 ②按钮 ③表单 ④间距 ⑤字排 ⑥色板 ⑦卡片 ⑧弹窗内构 ⑨空错态 ⑩码面——含 #87/#88 新面「随其落地套用」） ∥ 可点行/不可点行判据 ∥ 空/错/加载态 | 单元测试档 + 收口轮 |
| AC-19（续·机检口径） | `thincoder-server/public/style.css`：`:root` 块外零颜色字面量（hex/rgba） ∥ 行悬停声明清单（`.nav-item:hover` ∥ `tbody tr:hover`——同取 `var(--hover)`；清单外零行悬停声明；`li.key-item:hover` 随 ul 清单退役删净） ∥ padding/margin/gap 取值 ∈ `--sp-*` ∪ {0, auto} ∪ 布局组变量（`--nav-w`——S15 ∥ 底座布局行；尺寸类白名单除外） ∥ `font-weight` 全 ≤400（**终端面除外**——§2.1 ③ 例外登记：终端面 cell 按 pty 语义；`webui/TERMINAL.md` §2.4） ∥ `font-size` 全 = `var(--fs)`（缺省撤销） ∥ 聚焦环单形（`--bw-strong solid var(--accent)`） ∥ 类名双向闭合（档面字面类 ⊆ `style.css` 类选择器 ∥ `style.css` 类选择器 ⊆ 档面字面类 ∪ 态类）；视觉收口轮浏览器实走（悬停/聚焦/空·错·加载态/弹窗/两语言） | 单元测试档 + 收口轮 |
| AC-20（功能点 20——控制台布局收正；`docs/server/requirements/PROJECT.md` 验收表） | ① 视口高壳在册：壳面五页钉表（成员 `#/admin/members` ∥ Provider `#/admin/providers` ∥ 服务模型 `#/admin/models` ∥ 审计 `#/admin/audit` ∥ 用量明细 `#/me/usage`——本档 §2.2①）；页头固定 ∥ 表头吸附 ∥ 行区滚动 ∥ 表尾行计数（tfoot——吸附表底；声明表 = 本档 §2.2②）∥ 矮视口回退整页滚 ∥ ② 表尾行计数在册（表内 tfoot「共 N 项」= 渲染行数真值——空/错 = 无表无 tfoot；纯前端派生 ∥ 零新端点） ∥ ③ 内容左对齐（`main` 无 auto 居中——`max-width` 沿用） ∥ ④ 弹窗内列表 = 表格形（Provider 勾选 ∥ 预设信息段模型清单 ∥ 成员 key 表——本档 §2.2⑤）；排除面在册（`#/admin/usage` 看板页 ∥ 布局/信息表 ∥ key 表页级（非壳——本档 §2.2① 在案）） | 单元测试档 + 收口轮（浏览器实走） |
| AC-20（续·机检口径） | 单元测试档用例：`dom.mjs`——`dataShell` 在册（`.page-head`/`.page-area` 两段）+ 表尾计数在册（`table(…, { foot: true })` 与三自建构建器 tfoot 同形 + `common.rowCount` 引用） ∥ `app.mjs`——`SHELL_PAGES` 五路径逐条钉表 ∥ `route()` 切换 `data-shell`（登录/登出径清除） ∥ 五页逐档 `dataShell(` 调用 + 表内 tfoot 计数（成功 = 行数 ∥ 空/错 = 无表） ∥ `style.css`——高度链声明表逐条在册 ∥ `position: sticky` + `top: 0`（表头）∥ `bottom: 0`（tfoot）在册 ∥ 回退媒体查询在册（`height: auto`） ∥ `main` 规则 margin 无 `auto` ∥ 弹窗三处表格形（结构/列头/空错态不变量——含勾选表 `label` 形） ∥ `.model-picks` 零残留（规则与字面两向） ∥ AC-19 canon 不破（零新 `:root` 变量 ∥ 零新悬停规则 ∥ 内距 ∈ 刻度 ∥ 类名双向闭合） ∥ 档目随正——单源 = `webui/WEBUI.md` §1 ∥ 门禁清单添布局收正批单元测试档（十八——以实施盘面为准） ∥ 旧件随正：stub ctx 补 `dataShell` 三件 + 门禁计数两件 | 单元测试档 + 收口轮 |
| AC-48 ⑤（功能点 48——同族扫描闭合；样式侧） | 本档 §2.3 在册：核对表逐点（全控制台 `hidden` 切换点 ∥ 受压者 = 基址 label + github 事件块 + 原两处补丁位） ∥ 全局规则 `[hidden] { display: none !important; }` 在册 ∥ `!important` 计数 = 1 ∥ 旧两处按例补丁零残留 ∥ 零新 `:root` 变量 ∥ 零新悬停规则（AC-19 canon 不破） | 单元测试档 + 收口轮（浏览器实走：建源弹窗两平台两态） |
| 容器终端（样式侧；功能点 51） | 终端调色板 **18 枚变量入 `:root`**（登记例外——§2.1 底座表「终端」行；面内零颜色字面量） ∥ 终端面类族五枚（`.terminal-modal`/`.terminal-surface`/`.terminal-row`/`.terminal-cursor`/`.terminal-status`）∥ **粗体例外登记**（§2.1 ③——终端面 cell 按 pty 语义；全局 `font-weight ≤400` 判据在本面留白、余面不破） ∥ 零动画零过渡 ∥ 零新悬停规则（面内无悬停态） ∥ 行悬停声明清单不变 ∥ 内距 ∈ 刻度；判据全文 = `webui/TERMINAL.md` §2.4/§4 ∥ `webui/SANDBOX.md` §2.1① | 单元测试档 + 收口轮（浏览器实走：终端面/光标/滚动） |

## 5. 边界（本面不做面）

- 样式族不做面：版式/结构重设计（骨架沿用——卡片/表格/侧栏/弹窗结构零动）∥ 类名体系改名（沿用——仅删死类 ∥ 新增 `.error` 态修饰）∥ 动画/过渡（零——保持零依赖零动画）∥ 主题化/暗色（不做——未裁）∥ 自绘控件（checkbox 等原生 + `accent-color`）∥ 移动端适配（不做承诺不变——窄屏单条媒体查询保持）。
- 布局收正不做面：`#/admin/usage` 看板页入壳（报表区无界——另轮如需）∥ 布局/信息表与 key 清单（页级）壳化 ∥ 弹窗内表吸附/分页/筛选 ∥ 分页/虚拟滚动 ∥ 主题化/暗色（不变）。
- 标签页不做面（console-tabs-component——样式侧）：零新 `:root` 变量 ∥ 行悬停声明清单不变 ∥ 钮族悬停 = ② 型表在册（页签取 `--hover` 底） ∥ 不改版式/结构（页签族 = ② 型扩充 + ① 选中态复用）；其余不做面 ⇒ 见 `webui/TABS.md` §5。
- 对话页壳不做面（chat-shell-align——样式侧）：核件样式（`composer.css`/`model-menu.css`——核内单源，控制台零覆写；其自带过渡/动画 = 核件行为，非本档新动画）∥ 控制台自有档零动画（KD-SV-36 不破）∥ 别名块不引入新值（逐键 `var(--既有)`——AC-19 ① canon 不破）；其余不做面 ⇒ `webui/CHAT.md` §5。

## 6. 上抛/余项

- 本面无独立上抛/余项。

