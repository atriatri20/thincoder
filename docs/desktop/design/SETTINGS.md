# 桌面端（DESKTOP）· 设置域（SETTINGS）

> 板块 = **桌面端设置域**——设置面板（七段） / 首启向导 / 渠道族形态 / agent 参数 / MCP ∥ env ∥ 工具与服务 ∥ 模型清单段 / 样式收正（D37）——本域设计单源档。
> 需求侧 = 需求分卷（本域卷 = `docs/desktop/requirements/SETTINGS.md`；查卷口 = `docs/desktop/requirements/PROJECT.md` §4 **D 表索引**；功能点 ∥ 验收 ∥ 依赖面——**范围数随需求卷现文**；本域回指 = 总览 §3.3 首启链 ∥ **D16** ∥ **D37** ∥ **D39** ∥ **D24**（住 `docs/desktop/requirements/UI.md`））。
> 同部分相关档：总览 / 决策 / 受影响文件 / 发行 / 验收 = `docs/desktop/design/PROJECT.md` · 宿主适配层 = `docs/desktop/design/SHELL.md` · 主 ↔ 渲染通道契约 = `docs/desktop/design/IPC.md` · 界面形态与交互 = `docs/desktop/design/UI.md` · 渲染面实现工艺 = `docs/desktop/design/RENDERER.md`。
> 域档：会话域 = `docs/desktop/design/SESSIONS.md` · 输入区域 = `docs/desktop/design/COMPOSER.md` · 活动池与消化面域 = `docs/desktop/design/ACTIVITY.md` · 对话流域 = `docs/desktop/design/CHAT.md`。
> 域档续：菜单体系 = `docs/desktop/design/MENU.md` · 打包与发行 = `docs/desktop/design/PACKAGING.md` · 端到端测试基建 = `docs/desktop/design/E2E-TESTING.md` · web 快筛 = `docs/desktop/design/WEB-QUICKCHECK.md`。
> 核机制面（配置 / 供应商与模型 / MCP / 会话）**只住核**——本档只做**接入面**设计，不重述核语义（单一权威源）。
> **行数纪律（500 建议 ∕ 800 硬限）只对代码档**（`.mjs` ∕ `.cjs` ∥ `.css` 等）；纯 `.md` 设计档不受限（档长按内容需要；设计档读者面 = 人）。

## 1. 关键决策记录（本域行）

| # | 决策 | 理由 |
|---|---|---|
| KD-10 | 设置面写路径 = **核唯一执行体**（`writeConfigAtomic`——`stat → read → mutate → 原子写`四步住核）；端侧零自写盘、零 provider 形状构造 | 原子性 / mtime 冲突 / `.bak` 留现场与 CLI 同源一处；值面（preset 展开 · key 落位 · 激活渠道保护）全在核变更子，端侧只给 `mutate` |
| KD-11 | **探活口径有意分歧**：`provider:verify` 探不通**仍可保存**（只出读数，`reason` 闭集 `timeout` / `malformed` / `unavailable`）∥ `mcp:save` 探活失败 ⇒ **零写盘** | 渠道 key 的可用性不只在探测当下（离线 / 代理不得阻断首启）；MCP 服务器配错必连不上（先例 = `thincoder-cli/src/tui/cmd-mcp.mjs`）——卡面须明示「未校验通过」 |
| KD-12 | 首启向导：闸 = **配置档存在性**（读数 = `config:read` 回执 `configured`——`thincoder-core/config-io.mjs:39`；口径差有意：CLI `isConfigured` = key 可解析、更严，**勿统一**）；三步 = 选 preset → 填 key（`provider:verify` 真调一次）→ 选目录（`project:open`）；表单出口**复用设置面导出面**（单一 owner）；配置坏 ⇒ 不静默重置（设置面可进 + 明示不可读） | 需求 §3.3 逐字（已配 ⇒ 跳过）；零副本 ⇒ 向导与设置面同源同形 |
| KD-13 | `locale` = **端无关偏好键**（任一端写、他端读；非属主型状态）⇒ 本端 `config:write` 为**首写者**；切换即时生效（`config:write` 成功**同回带** `{ locale, dict, configured }` ⇒ `initDict` 重刷词表——**免二跳重调**，**零新事件通道**） | 核无 locale 持久化写点（`thincoder-core/i18n.mjs` 全档）；§6.2 A2「不增跨端共享可变字段」针对属主型状态——本键无写竞争 |
| KD-44 | **模型菜单一级扇出面 = 主进程（A 案）**：全渠扇出住主进程（`thincoder-desktop/src/main/settings.mjs` `modelCatalog()`）——结构对位 VSC（探针窗口族住宿主面、webview 零探针；`thincoder-vscode/src/extension/provider-probe-window.mjs` 全族 + `thincoder-vscode/src/extension/settings.mjs:341` `fullStatus`） | 单次往返；探针 ∕ 代理 ∕ 落账单源（核 `probeChannelModels` + `probeTargetOf`）；密钥面沿用现状（零入渲染面） |
| KD-45 | **新通道 `model:catalog`**（不扩 `model:list` 语义）：契约纯增 ∥ 操作单一（无载荷全渠扇出）∥ 回执单形 `{ ok, models, unavailable }` | B8 `model:list` 行 #19 零动（既有行不重写）；两既有消费者（`mount-settings-reads.mjs` ∕ `mount-settings-segments-models.mjs`——恒传 `provider`）零影响；失败诊断天然承载 `unavailable` |
| KD-46 | **探针单源 = 核 `probeChannelModels` + `probeTargetOf`**（含代理 + 落账）；`model:list` 同径对齐——回执行逐字零变 | 逐渠探针单源 ∕ 代理 ∕ 落账三面一致（对位 VSC `_probeChannelInto` 同径）；`hostBusy` 档 = **消（补做——欠做，非能力缺失）**：宿主忙采样器 = 新档 `loop-sampler.mjs` + `failure` 键贯链（同拍 = 本档 §6 **CG**） |
| KD-49 | **`settings:agent` 通用保存 = patch 显式清除面 + slot 权威键拒写**：① patch 值 = `null` ⇒ **删键**（沿核 `_checkKnownKeyValue`「null = 显式清除」语义——S10 槽清空 ∕ S11 中性档两径即用）；② `agent.advisor.guard` ∕ `agent.engineering` = **会话槽权威键**（唯一写面 = `session:flags` 槽写——跨端同槽）⇒ 通用保存**拒写**（拒码 `slot-authority` + 零写；拒位先于值校验 ∕ 混合 patch 整拒）；guard 设置面开关写经 `session:flags`（回执后 `ev:flags` 随动） | 拒写依据 = VSC 侧同裁（`agent.engineering` 白名单删项 ∕ `agent.advisor.guard` 非 payload 字段——`thincoder-vscode/src/extension/settings-panel-write.mjs`）+ #475「通用保存不可达该键」先例；`null = 删除` = 核侧既有语义 ⇒ 「patch 表达不了删键」旧口径消解（单源 = `docs/desktop/design/IPC.md` §2 设置族注项 10） |
| KD-66 | **设置面样式收正（D37）= 全七段按 VSC 形态收正——渠道两行卡为锚**（需求卷 **D37**）：① **范围与口径**——收正 = 形态 ∥ 密度 ∥ 断行 ∥ 层次（值源 = VSC 实读）；功能面不删 ∥ 七段信息架构保持（段集 ∥ 段序零改）∥ 布局面零动（48rem 居中列）；② **渠道行 = 两行卡列**（锚）——主行 = 名 + 钥面 + 当前标 + 动作簇（修改 ∥ ✕ ∥ 校验 ∥ 移除名——四件全保留、序恒定 = 现盘序保持；VSC 对位 = 前两件同序，`thincoder-vscode/webview/settings-providers.js:183-186`；**保留裁定**：行级「校验」钮保留——差异在位置不在能力（VSC 对位方向 = 行内校验，如需）；位置类端差，登记）；副行 = `模型 · URL` + 代理开关；条件第三行 = 不可用原因；断行恒定 = nowrap + 中段单点省略；编辑态 = 行内换形（输入 + 存/消）；**校验反馈就地化（轮六）**——`verify` 结果携行名：匹配行 ⇒ 本行呈现（校验钮态短形「校验通过」∕「校验失败」+ 本行明细行）；无行渲出结果（名不在列表 ∥ kind 表外）⇒ 段末回退（单源 = 本档 §2.12）；③ **行族通则**——`.settings-row` nowrap + `.settings-row-value` 省略四件 + 动作簇 `~` 零化（修多钮各自 auto 散开）；**补则**——**MCP 展开面 = 全显豁免**：`.settings-mcp-detail` 域内值面（工具行描述 ∥ params ∥ 回执词行）恢复自然折行（`white-space: normal` + `overflow-wrap: anywhere`）——豁免独立成则，行族通则本体零动（折叠面摘要行 ∥ 工具行名零动）；④ **复选 = 拨杆形**（VSC `.switch` 照搬；文本输入细边 = D24 保留面零动）；⑤ **卡界 = VSC 实形**——1px 描边（`--line`）+ 圆角 6px（`thincoder-vscode/webview/settings.css:155-159`；卡底零独立填充；用户裁「尽量跟 VSC 一致」——D24 描边归零基线全局零动 ∥ 仅本卡界让位）；⑥ **零新变量 ∥ 零新断点**（D24 ∥ D29 基线）；⑦ **拆档**——渠道族出档 `thincoder-desktop/renderer/views/settings-sections-providers.mjs`（D37 拆档产出 · 已落；re-export 面零改）；⑧ **边界** = 交互语义 ∥ 功能增删 ∥ IA ∥ 布局面 ∥ 核 ∥ VSC 零触。值面 ∥ 判据 ∥ 端差明细单源 = 本档 §2.5「批注（设置面样式收正 · D37）」。 | 需求 D37（用户「我希望至少跟 vsc 端样式上对齐」+ 锚样本实拍）；VSC 值 = `thincoder-vscode/webview/settings-providers.js:178-193`（两行卡）∥ `thincoder-vscode/webview/settings.css:155-203`（卡值）∥ `thincoder-vscode/webview/settings.css:222-257`（拨杆）；桌面现状 = `thincoder-desktop/renderer/settings.css:145-154`（单行 wrap）∥ `thincoder-desktop/renderer/views/settings-sections.mjs:129-153`（单行内联 5–7 件）；D24 ∥ D29 ∥ 扁平化基线在册 |
| KD-68 | **设置弹窗化（D39 ∥ A 案）= 每菜单组项 ⇒ 应用内模态弹窗（单组 · 复用链指名 ∥ 现有页零动并存）**（需求卷 **D39**）：① **面形（沿 `settings-confirm` 先例）**——背板（`document.body` 直挂 ∥ `fixed inset 0` ∥ z-**20** ∥ `--overlay`）+ 居中卡（`fixed` 居中 ∥ z-**21** ∥ `width: min(48rem, calc(100vw - 2*var(--gap)))` ∥ `max-height: calc(100vh - 2*var(--gap))` ∥ 内 `overflow: auto` ∥ `--bg-raised` + 1px `--line` 描边 + `--shadow`；**头行粘顶（轮六）**——卡内滚 ⇒ `header.settings-head` sticky 常驻（`top: 0` + 底 `--bg-raised` + `z 1`——标题 ∥ ✕ 不随体滚出）；**页 ∥ 向导面同径（轮六）**——整层滚 ⇒ `.settings-head, .wizard-head` 同法（`position: sticky` ∥ `top: 0` ∥ `z-index: 1` ∥ 底 `--bg`——页底同色；弹窗专指规则（`.settings-modal .settings-head`）专指度更高、不受影响）；单源 = 本档 §2.12）；**z 族** = 设置面 10 < 弹窗 20/21 < 确认弹层 40/41（确认盖弹窗——删除确认族零改）< 引导层 200；**零新变量 ∥ 零新断点**（D24 ∥ D29 基线）；**新档 `thincoder-desktop/renderer/settings-modal.css`（新档 · 已落）**（不进 `settings.css`——在册越线档零结构触碰；`index.html` 链序 = settings.css 后）。② **卡结构** = `header.settings-head`（标题 = 组名（`settings.section.*` 段名）+ ✕（`.settings-close` 形复用；`data-action="settings:modalClose"`；aria-label = `settings.close`））+ `div.settings-modal-body`（失败串（`notice.scope` = 本组 ∨ `panel`）+ 段态词 + 段体——段标题不复述）。③ **单组内容 = 复用链（指名）**：组 → 段体组件 → 读取链 → 出口链（= 同一 `exits.handlers` 全表注入——视图 `data-action` 同域，零第二份；**七行**：providers → `providersBody`（`views/settings-sections-providers.mjs`）→ `loadProviders()` → providerSegments+exits 表；agent → `agentBody`（`-agent.mjs`）→ `loadAgent()` → agentSegments 表；mcp → `mcpBody`（`-sections-mcp.mjs`）→ `loadMcp()` → segments 表 MCP 族；env → `envBody`（`-sections-env.mjs`）→ `loadEnv()` → segments 表 env 族；tools → `toolsBody`（`-sections-tools.mjs`）→ `loadTools()` → segments 表工具族；models → `modelsBody`（`-sections-models.mjs`）→ `loadAgent()`（models 块——R7 同拍）→ modelSegments 表；team → `teamBody`（`views/settings-sections-team.mjs`（已落））→ `loadTeam()`（团队状态读）→ 同 `exits.handlers` 全表）——**零第二实现 ∥ 零值面语义改**（读写 ∥ 确认 ∥ 失败链与页同源）。④ **状态 ∥ 开合**——`settings.modal`（store 切片 +1：`null ∥ 十值闭集`（七段名 + `providerAdd` ∥ `mcpForm` ∥ `consultAdd`（§2.18）= 校验面 `SCOPES`；菜单侧发出集 = 六名）；重绘走既有 `SETTINGS_KEYS`）；开（`openSettingsModal(group)`）= `SCOPES` 闭集验证（**既有**——定义位 = `thincoder-desktop/renderer/mount-settings.mjs:48`，自视图 `SECTIONS`（`thincoder-desktop/renderer/views/settings.mjs:35`）派生——同源单份零双抄；表外 ⇒ 记错零动作）→ 向导占槽期拒（`occupies`——沿设置族占槽口径，记错）→ 切片写 + `notice:null` + **本组面态复位**（providers → `edit/probe/draft/keyDraft`；mcp → `form`——沿 `openSettings` 同口径限本组）→ **本组读取链**；关（`closeSettingsModal()`）= 切片清 + 本组面态复位 + `closeSettingsConfirm()`（子确认同清——沿 `closeSettings` 同形）；`closeSettings()` 同拍清 `modal`；**闭集关系（源 ∕ 镜像）**——`SECTIONS`（视图单源，七段）→ `SCOPES`（装配面派生——设置页对齐）∥ `SETTINGS_GROUPS`（菜单侧镜像闭集同导出——`thincoder-desktop/src/main/app-menu.mjs`；主 ∕ 渲染分层无直 import，先例 = `THEME_VALUES`）——**菜单发出闭集 = 六名**（= `SECTIONS` 名序**去「团队」**——「团队」不入菜单）；**校验面 `SCOPES` = 十名**（七段名 + `providerAdd`（§1 **KD-75**）∥ `mcpForm` ∥ `consultAdd`（§2.18）；菜单侧不发「团队」——支 A 原旨保持）；漂移检测 = 单元测试档跨面源扫（`SETTINGS_GROUPS` ≡ `SECTIONS` 名序**去「团队」**）。⑤ **重绘 ∥ 草稿保真**——弹窗体 = **第二闸**（沿 #604 同形：卡片根捕获 ∕ 重建 ∥ 复填；**独立残件变量** `modalResidue`；失效集（#652）一次性同滤两捕获、整轮末清）；`refreshSettings` 在场判据 +`settings.modal != null`（外档写盘 ⇒ 弹窗在场同复读）。⑥ **交互 ∥ 键盘**——关三路：背板点击 ∥ ✕ ∥ 卡内 Esc（**`stopPropagation`**——不连带触 F-Esc 关页；`mount-settings-exits.mjs` 键面闸增 `modal != null` 守卫）；初始焦点 = ✕（+50ms，沿确认件先例）；键盘全可达（原生控件序）；**零焦点陷阱**（边界）；`role="dialog"` + `aria-modal="true"` + `aria-label` = 组名。⑦ **双面并存**——现有设置页**零动**（「设置…」⇒ 页）；两面可同开（弹窗盖顶；关弹窗不动页）；**面态归属 = 单树共享**（`settings.providers` 族 `edit/probe/draft/keyDraft` ∥ `settings.mcp.form`——页 ∥ 弹窗同源一份，零第二份）⇒ 开 ∥ 关的**本组面态复位 = 两面同效**（页侧同组未提交编辑态同清——**明示接受**；接受由 = 单树复用零第二份 ∥ 复位限本组、不动他组）；⑧ **边界** = 七段值面语义 ∥ 现有页 ∥ 核 ∥ `thincoder-render-core` ∥ CLI ∥ VSC 零触；独立设置窗口（B 案）不做。 | 需求 D39（用户裁 A「先按照a做吧」）；先例 = `thincoder-desktop/renderer/settings-confirm.mjs`（背板 + 弹框 + 挂 `document.body` + Esc 拦截 + 默认焦点）；页零动判据 = D39「现有设置页保留（升级件并存——验收 OK 后再议撤）」；z 值 = `thincoder-desktop/renderer/settings.css:16`（10）∥ `renderer/chrome.css:170-175`（backdrop 40）∥ `:176-181`（confirm 41） |

| KD-75 | **provider 添加 = 专用弹窗（骑 D39 弹窗宿主）+ 单表对齐 VSC 源（字段序 ∥ 走 proxy 开关 ∥ 探面同判定）**：① **入口 ∥ 载体**——渠道段体尾「+ 添加」钮（新词键 `settings.addProvider`）⇒ `openSettingsModal("providerAdd")`（弹窗值集 **七 ⇒ 八**；`MODAL_READS` +1 行 = `loadProviders`；卡体 = 单表（`channelFormTree` 内容演进——名不换）——第二闸草稿保真 ∥ 背板 ∥ Esc ∥ z 族 20/21 全复用 ∥ 零新 CSS）；② **单表形态** = 类型 `select name="preset"`（预设项 + `custom`）+ 预设信息行 + 条件块 A（名称 ∥ baseURL ∥ 格式）+ key + 「走 proxy」复选（拨杆形 ∥ 同词键 `settings.proxyRow`）+ 条件块 B（拉取行 ∥ 模型）+ 保存 ∥ 取消——**原双表（`addPreset`/`addCustom` 常显内联）退场**；`active` 复选从设置面表单退场（激活面 = 向导模型步「采用」∥ 会话选定写回——设置页「模型」段随本档 §1 **KD-80** 撤场）；向导步 1 `activeDefault` 复选随 2026-10-09 清除批退场（`active` 参退场 ⇒ 死控——无 active 写路；等价路径 = 向导模型步「采用」——设置面「模型」段随 **KD-80** 撤场）；③ **字段序 = 用户填写序**（名称→baseURL→格式→API key→走 proxy→拉取→模型——VSC 源逐元素对齐；逐元素表 = 本次设计面）；④ **写面**——`provider:save` 载荷 + `proxy`（勾选 ⇒ `true`）；核 `addProviderEntry` 迁受 `proxy`（条目同批落 `proxy:true`；缺 ∥ 非真 ⇒ 零键）；行开关（`provider:setProxy`——`true` 写 ∕ `false` 删键）零改——同一字段；⑤ **探面同判定（缺陷修复并入）**——`provider:models` = 探面同判定（核 `probeTargetOf` 同判定；`thincoder-desktop/src/main/providers.mjs:276-288`——目标 `:281`；勾选 ⇒ 逐渠判定（`proxy: true` ∧ `uri`——2026-10-08 去全局闸）；未勾 ∥ 缺省 ⇒ 直连）；载荷 + `proxy`（可选）；口径落点 = `docs/core/design/PROVIDER.md` §6.19（单源 = `docs/core/design/PROXY.md` §4）∥ 核 `thincoder-core/provider-flows.mjs:79-90`；⑥ **边界** = 行族 ∥ 行开关 ∥ 探针落账 ∥ 七段值面 ∥ 核运行期代理语义 ∥ VSC ∥ CLI 零触（CLI 共三条 = 本次同径表） | 用户 2026-10-07 18:10「桌面端的配置界面为啥要别出心裁搞个不一样的」（逐字 = 本次设计面）+ 18:07 三端令；VSC 源实读 = `thincoder-vscode/webview/settings-providers.js:200-224`；D39 宿主 = 本档 §1 **KD-68**（面形 ∥ 交互 ∥ 第二闸全复用） |
| KD-76 | **MCP 表单 env ∥ headers = 行式键值编辑器（两端同形 · 本次定形）**（MCP 键值行式输入批 · 2026-10-07）：① **形**——三组各一份行集（stdio `env` ∥ http `headers` ∥ ws `headers`——与 VSC 三容器同形），行 = 键格 + 值格 + ✕，行集下「添加行」钮；**零项 ⇒ 零行**（存量回显 ∥ 新增态起手同判——起手三组皆零行，行由「添加行」钮落）；标签 ∥ 钮 ∥ 占位词两端逐字同值（新键 4 + 值改 2——计数 = 本档 §2.17 项 6）。② **提交四判据**——键 ∥ 值 trim；空键 ∥ 空值行不提交（空值 = 旧 `k=` 删项语义延续）；重复键后行胜；全空 ⇒ 字段删除；**值 = 字面**（逗号 ∥ 等号 ∥ 引号 ∥ 空格原样——旧串式的成对引号剥离退场，口径变化点明示）。③ **粘贴 = 零解析**（不引「按换行分行」——取舍 = 本次设计面 KD-4）；值格 = 单行 `input`（值内换行不可录入——边界）。④ **桌面行令牌态** = `form.kv = { env ∥ headers ∥ wsHeaders: [{ t, k, v }] }`——令牌单调递增、**永不复用**（草稿闸按 `id` 定位——`renderer/view-state.mjs:168-174`；索引键会在删行后把残值灌进新行）；行件携 `data-draft`；加删出口与类型切换出口同拍同步行集；`readMcpForm` 草稿快照**不采行件**。⑤ **拆档（先拆后改）**——MCP 族出口出档 `thincoder-desktop/renderer/mount-settings-segments-mcp.mjs`（已落 · **327** 行；缝 = 同形工厂 `create*Exits(deps)`；装配点 `mount-settings-exits.mjs` 装配即合并、单一 `handlers` 表对外零改；触发 = 本档 §3.1 在册预案「MCP 族再出一档」——本次 = MCP 族结构性触碰）；VSC 侧同拍拆档（`webview/settings-mcp.js`——硬限所迫，详 `docs/vsc/design/SETTINGS.md` §2.10）。⑥ **零新 CSS ∥ 零新变量 ∥ 零新断点**（复用 `.settings-field-row` ∥ `.settings-field` ∥ `.settings-row-action` ∥ `.settings-submit`——避触本档 `settings.css` 在册越线拆分窗口）；落盘形 ∥ 通道载荷零改（`{name, config}`；`env` ∥ `headers` 仍对象）。 | 用户「3开小批now」；病征 = VSC 表单逗号串（值含逗号即坏——`webview/settings-tools.js:66 ∥ :389-404`）+ 桌面同形同病（`renderer/views/settings-sections-mcp.mjs:92-96` ↔ `renderer/mount-settings-segments.mjs:30-44`）；源对齐 doctrine = VSC 为准、桌面逐元素对齐（本仓现行） |
| KD-77 | **添加入口统一 = 表单类添加 ⇒ 弹窗（骑 D39 宿主）；本端三面落形**（添加入口弹窗统一批 · 2026-10-07）：① **MCP 表单 ⇒ 新组弹窗 `mcpForm`**——段体（页 ∥ 组弹窗两面）不再常驻表单（`mcpBody` = 行族 + 「+ Add Server」入口钮（新键 `settings.mcpAdd`——值逐字同 VSC）——读链不遮入口）；表单（新增 ∥ 编辑同框复用——标题逐态 `settings.mcp.addTitle` ∥ `settings.mcp.editTitle`；编辑态 name 只读 ∥ 预填）+ **新增态补取消钮**（词 `settings.cancel`）；弹窗值集 八 ⇒ 九；`MODAL_READS` +1 = `loadMcp`；`resetFacets("mcpForm")` = `form` 清（开 = 新增态；**编辑态 = 开径后写 `form.editing`（先开后写）**）；提交成功径（add ∥ update）= 切片复位 + `closeModal()`（沿 KD-75 ⑥）；取消 = 关弹窗（切片复位随关）。② **会诊添加 ⇒ 新组弹窗 `consultAdd`**——两 select（provider ∥ model——选型面照现）+「+ Add consult model」提交（词 `settings.consultAdd` 既有）；入口钮（段尾；同词）在 consult 行数 ≥ 5 ⇒ `disabled`（对齐「行未满才可用」；提交守卫同判据——清假可供性）；成功 ⇒ `closeModal()`；**取消 = `settings.cancel` 钮（与 `mcpForm` 同形）= 关弹窗（切片复位随关）**；弹窗值集 九 ⇒ 十；`MODAL_READS` +1 = `loadAgent`；`resetFacets("consultAdd")` = `models.picker` 复位。③ **页脚「Add provider…」直开**——`composer-wire` 映射 `addProvider` ⇒ `openSettings?.(ADD_MODAL_GROUP)`（`app.mjs` 双口提升同供 `menuActions` + `attachComposer`；常量自 `thincoder-desktop/renderer/views/settings.mjs` 引——单源）。④ **模态体段态词恰一（同笔收正）**——`settingsModalTree` 去非 add 支叠渲件（修前 loading 态双「Loading…」——六组同病）。⑤ **零新 CSS ∥ 零新变量 ∥ 零新断点**（D39 全套复用）；通道 ∥ 载荷零改；边界 = 段集 ∥ 段序 ∥ 现有页 ∥ 核 ∥ VSC ∥ CLI 零触 | 用户 2026-10-07 22:01 判据句（本次设计面——「添加也在弹窗里」+ 全仓扫面统一）；上游先例 = KD-75（providerAdd——同宿主同链）；D39 宿主 = 本档 §1 **KD-68**（面形 ∥ 第二闸全复用）；VSC 源 = `docs/vsc/design/SETTINGS.md` §2.17 |
| KD-79 | **首启向导保存面收正 = 保存钮提级（`.wizard-save`）+ ②③ 合并成一条「保存并继续」+ ④ 完成未配置不静默退场（就地护栏）**（首启向导保存面收正批 · 2026-10-11；需求 = 需求卷 `docs/desktop/requirements/SETTINGS.md` D11 判据补「首启配置三保真」）：① **保存钮提级**——向导步 1 唯一写盘钮改新控件族成员 `.wizard-save`（强调形——与 `.wizard-next` / `.wizard-finish` 同 accent 框；控件族 8 ⇒ 9 = 次级 6 + 强调 3；`channelFormTree` +`submitClass` 参——缺省 `settings-submit` ⇒ 弹窗径零变）；② **②∥③ 合并**——步 1 前向唯一径 = 「保存并继续」（`submitKey: "wizard.saveAndNext"`；步 1 尾控件「下一步」退场）；逐态：key 空 ⇒ 零写前进（无数据可丢——「零输入可走」性质保持）∥ key 非法（校验未过）⇒ 照存 + 前进（KD-11 零动）∥ 已存过 ⇒ 同路重发（核保存语义零动；会话内「已存过 ⇒ 回步 1」不可达——无回退径）∥ 未存但非空 ⇒ 先存后进（写败 ⇒ 原地留步 + 失败串零静默）；③ **完成护栏**——未配置点「完成」⇒ 不退场 + `wizard.finishBlocked` 旗（`patchSettings` 直写——`store.mjs` 零改）⇒ 就地护栏（提示句 + 「去保存渠道」（步 1 + 清旗）∥「仍要退出」（复用 `dismissWizard`——锚 `settings:close` 单一实现））；退路 = ✕（恒在场）∥ 零 Esc ∥ 零背板（沿现行为）；旗随任意步写收束（`setStep` 单点） | 网友报障（原话 = 本次设计面：唯一写盘钮 = 次级形 ∥ 「下一步」零提交 ∥ 未配置照退场）+ 用户 2026-10-11 13:24 裁「都做」；闸 = 配置档存在性（`configured`）= 零写盘 ⇔ 未配置 ⇒ 护栏只在真丢数据前拦 |

| KD-80 | **模型选择归位 = 撤设置页「模型」段 · 会话面为唯一来路**（用户 2026-10-15 23:34 走查「设置页上不应该出现模型选择，模型选择应该归会话界面，放在设置页上很别扭」+ 23:53「认可」）：① **范围**——desktop 撤设置页「模型」段（`thincoder-desktop/renderer/views/settings.mjs` `SECTIONS` 八 ⇒ 七 ∥ 段体分派支删 ∥ `renderer/views/settings-sections.mjs` `modelBody` 净删）∥ VSC 撤设置面同款「默认模型」行（`thincoder-vscode/webview/settings-providers.js` 行 ∥ `_setDefaultModel` ∥ `_defaultModelMenu` ∥ 绑定；`thincoder-vscode/src/extension/settings-panel-write.mjs` 载荷 `defaultModel` 支随消费归零净删）；② **写面零新**——`defaultModel` 三写点不变：**会话选定写回**（既有 · 判据句 6——`thincoder-desktop/src/main/agent-host.mjs` `setPrefs` ⇒ `carryoverDefaultModel`）∥ **向导模型步「采用」**（`renderer/mount-settings-exits.mjs` `useModel`——设置页消费面撤场后唯一视图出口）∥ 迁移（核）；**零新 IPC ∥ 零新推送 ∥ 零新载荷键**；③ **读写链保留（消费面收窄 ≠ 链拆）**——`loadModels` ∥ `settings.model` 切片 ∥ 激活渠道投影照旧（消费 = 向导步 2 + agent 段子代理模型槽候选 ∥ advisor 档枚举）；④ **闭集随动**——`SCOPES` 十一 ⇒ 十（自 `SECTIONS` 派生 + 三添加弹窗组常量；`renderer/mount-settings.mjs:59`）、`MODAL_READS` 十一 ⇒ 十行（同档 `:66-76` 逐组指名表——去 `model` 行）；`SETTINGS_GROUPS` 六名零动 ⇒ 漂移检测句改「≡ `SECTIONS` 名序去「团队」」；⑤ **VSC 派生一件**——banner 动作钮「选择默认模型」重指**会话级模型菜单**（`webview/ui.js` `showBanner` `onChoose`；`docs/vsc/design/WEBVIEW.md` §4.8 现行句「钮不开会话级模型菜单」随本批翻转）；⑥ **边界** = 咨询顾问 ∥ 子代理模型槽（角色配置）∥ 首启向导模型步 ∥ `session:prefs` 三值居所语义 ∥ 核 ∥ CLI ∥ webui 零触。 | 用户原话（上引）+ 认可（= 对默认方案的确认）；CLI 先例 = `thincoder-cli/src/tui/cmd-model.mjs:8`「选定实变即同拍写回 `config.defaultModel`」（判据句 6）；写回端侧落点两端已在册（desktop = `docs/desktop/design/IPC.md` §2「会话级偏好注」项 8；VSC = `docs/vsc/design/WEBVIEW.md` §4.10）；否决备选 = ① 保留设置页模型段仅补写回（用户明言设置页不应有该面）② 并撤向导模型步（向导非设置页；首启无会话 ⇒ 会撤掉首启唯一模型选定面） |

## 2. 界面形态与交互（本域行与批注块）

### 2.1 设置面（行）

| 面 | 形态 |
|---|---|
| 设置面 | **形态 = 窗口级覆盖层面**（挂载根 = `index.html` 单容器 `[data-slot="settings"]`）· **开** = 输入区控件行出口（`openSettings`——`#settings-btn` 核件面板控制行（`thincoder-render-core/composer/controls.mjs:51`）；接线 = `thincoder-desktop/renderer/mount-composer.mjs:90` ∕ `:160`）· **关** = 面板内控件 `data-action="settings:close"`（退场 = 清空容器 ⇒ 主 UI 可用）；**面头语言控件** = 面板头内、`settings:close` 左侧（en ↔ zh 切换按钮 · 锚 `data-action="settings:lang"`——沿开 / 关锚命名）；点按 ⇒ `config:write`（`locale`）⇒ **同回带** `{ locale, dict, configured }` ⇒ `initDict` 重刷（**免二跳**）；标签 = 词表键（两语各一键 · 随当前语言出串）；**语言非新段**——**七段**闭集不动（团队段 = B1 批增；「模型」段随 §1 **KD-80** 撤场）；**保留裁定**：本控件保留——桌面独立 app 无宿主语言面（VSC 语言面 = 宿主 `vscode.env.language`）——宿主能力类端差（登记）；**主题切换（D33）**：面头三态钮族（语言控件邻位——`data-action="settings:theme"`）——`docs/desktop/design/UI.md` §1「批注（主题切换 · D33）」；**Esc 关闭（对齐第三批）**：`document` 级 `keydown` ⇒ Escape ⇒ 关闭（经既有 `settings:close` 出口——单一实现；对位 = VSC Esc 关设置面；向导态不在本项——既有键盘面 = 审批卡根 `keydown`（`thincoder-desktop/renderer/views/approval.mjs`）与会话控制面选择器（`docs/desktop/design/SESSIONS.md` §2.1）两处）；面 = **七段**（渠道 / agent 参数 / MCP / env（proxy ∕ shell） / tools（embedding ∕ websearch 两 key + 索引状态行） / models（consult ≤5 ∕ advisor 两 picker） / 团队（登录与接入——B1 批增）——R7 落；「模型」段随 §1 **KD-80** 撤场——模型选择归输入区控件行）；**该段写面 = 全局 config**（`settings:agent`——设置面默认值）；**会话级切换在输入区控件行**（`docs/desktop/design/COMPOSER.md` §2——**模型选择唯一入口面**：模型钮 + `/model` 斜径，选定 ⇒ `defaultModel` 同拍写回（本档 §1 **KD-80** ∥ §2.24）），各段**三态**（未配 / 载入中 / 已配），供给未落 ⇒ 零节点（禁止假造）；写面全经核唯一执行体 `writeConfigAtomic`（端侧零自写盘——本档 §1 KD-10）；失败面可见（零静默）；通道面 = `docs/desktop/design/IPC.md` §2 设置族与项目级信息族注（项 8——`FORMATS` 端侧枚举判定 · `defaultModel` 两写口）· **外壳降噪（D24）**：同规则带上（结构框归零 + 次级键四值族 + 行族卡界让位（升底让位 ∥ 1px 描边 + 圆角 6px——随 D37 收正））——`docs/desktop/design/UI.md` §1「批注（外壳视觉降噪 · D24）」项 5；**对齐第三批**：类型加工（三控型）/ agent 具名控件 + 即改即存 / Esc 关闭——本档 §2.3（P14 / P15）∥ §2.4（F-Esc）；**设置面余面**：渠道行控件族（密钥设 ∕ 改 ∕ 删三路 · 渠级代理复选 · sub 行）· 删除确认门（四门）· MCP 编辑 ∕ 重连与结构化表单 · agent 段（子代理模型槽六件 ∕ advisor 档枚举 ∕ guard 开关）· index 空态（`no-key`）——形 / 锚 / 判据 = 本档 §2.2；S3 端差（行标未携 `failure` 分档）= **消（补做三件）**——同注项 7；**样式收正（D37）**：本档 §2.5 |

### 2.2 设置面余面 + 首屏引导门（注）

**批注（设置面余面 + 首屏引导门）**：本注只述端侧形态与锚；语义、载荷与回执**单源 = `docs/desktop/design/IPC.md` §2**（设置族与项目级信息族注 ∕ 白名单面），不在此重述。

1. **渠道行控件族（S1 ∕ S4 ∕ S5）**——行内三路：设 ∕ 改钥钮与删钥钮（**静止 ∕ 编辑两态**——编辑态 = 密码输入 + 存 ∕ 消）；渠级代理**行内复选**（行 `proxy` 投影随动）；**sub 段** = `baseURL` 非空才显（空值 ⇒ 零节点——禁假造）；渠道条目不携模型。
2. **渠道校验（S2）**——探针 + 状态行三态；**模型输入件 ∥ `datalist` 退场**（渠道单值模型）；探针不落盘；探果重挂 ⇒ `draft` 快照回填未落盘输入。
3. **预设项标签形（S7）**——`name — desc`（值直取核 `PROVIDER_PRESETS`——端侧零表；缺段不落空分隔符）。
4. **删除确认门（S6）**——不可复得类删除前置确认弹层：四门 = 渠移除 ∕ 删钥 ∕ 密钥行删除 ∕ MCP 移除；驳回（否 ∕ 背板 ∕ 框内 Escape）⇒ **零写**；构件 = **新档** `thincoder-desktop/renderer/settings-confirm.mjs`（`.auto-confirm` 族复用——**零新 CSS**；`onConfirm` = 开框时捕获闭包）；关面 ∕ 开面同清。
5. **MCP 段（S8 ∕ S9）**——行补**编辑**钮（表单预填 = 现值；名只读）与**重连**钮（先断后连——失败面在场）；增表单 = 结构化三型字段组 + token ∕ headers（对位 VSC 同族）。
6. **agent 段（S10 ∕ S11 ∕ S14b）**——子代理模型槽六件 = `select` + 复合候选 + 占位（清空 ⇒ 删键）；advisor 推理档 = 选项控件（Auto + off + 逐模型枚举）；guard 开关 = `session:flags` 槽写（值 = `sessionFlags` 投影；未知 ⇒ `disabled`——禁假造）；
   **slot 权威键 `agent.engineering`** = 会话槽面键——**设置面零行**（泛化编辑器全消；写面 = `session:flags` 槽写 ∥ 输入区模式钮）；写面归属 ∕ 拒码 = 本档 §1 **KD-49**。
7. **S3 端差处置（消）**——行标面补 VSC `failure` 分档（hostBusy ⇒「宿主繁忙」+ 抑制失败句）：原「能力缺失」不成立（欠做）⇒ 补做三件 =
   ① 新档 `thincoder-desktop/src/main/loop-sampler.mjs`（port ≈45 行——源 = `thincoder-vscode/src/extension/loop-sampler.mjs:67-76`）
   ② 行面 `failure` 键贯链（`thincoder-desktop/src/main/providers.mjs:105-107` → 通道 → 渲染——渲染档点名 = `thincoder-desktop/renderer/views/settings-sections.mjs`）
   ③ 词键（落 `renderer/i18n-settings.mjs`）；判据 = 同宿主忙态两端行面同词 + 同抑制形。上抛行 = 本档 §6 **CG**（同拍定形）。
8. **首屏引导门（R1）**——`data-boot` 补渲染消费：`≠ "ok"` 期间引导层在场；`"error"` ⇒ 错误面（可读原因）；`"ok"` ⇒ 撤（**零残留**）；写者单点零改（`thincoder-desktop/renderer/dom.mjs`）。
   **CJ 裁定落**：`error` 态 = **顶部横幅非模态**（载原因不覆盖交互——`inset: 0 0 auto` ∕ `pointer-events: none` ∕ z 序（9）低于设置面（10））⇒ 设置面可进可出 ∧ 原因可见；`ok` ∕ `loading` 两态零改；真机复读 = 父侧（D16）。
9. **index 空态（S12）**——embedding key 缺 ⇒ `no-key` 态（提示词 + 构建钮禁用——对位 VSC `settings-tools.js:337-341` 同判）；有 key ⇒ 既有 built ∕ not-built 两态零变。
10. **计数（D3）**——通道 **0** 新（六出口 = 既有设置族）；段集七段零改；**新档 3**（`settings-confirm.mjs` ∕ `mount-settings-segments-providers.mjs` ∕ `mount-settings-segments-agent.mjs`）；判据 = 单元测试档 + 真机（父侧闭合）。

### 2.3 对齐第三批 · 设置面两件（P14 · P15）

14. **设置面·类型加工**——控件型按 `field.kind` 三值（`string` ⇒ `text` ∥ `number` ⇒ `number` ∥ `boolean` ⇒ `checkbox`）；
    出值规范化 = 数值 ⇒ `Number(v)`（空 / 非数 ⇒ **零发送**——不写盘 · 零乐观改 · 控件回退现值）· 布尔 ⇒ `.checked`。落点 = `thincoder-desktop/renderer/views/settings-agent.mjs`（`namedFieldNode`——具名行控型）+ `thincoder-desktop/renderer/mount-settings-segments-agent.mjs`（`namedOut`——出值面）。
    端差登记 = **VSC 删键（`Number(v) || undefined` 径）∕ 桌面零发送**（父侧裁定；消解路 = 主侧写链 + 核清除形扩族——另批）。
15. **设置面·agent 形态**——**对齐形 = 具名控件区**（键集 ∥ 词键 ∥ 表定控型三面单源 = `NAMED_FIELDS`——**二十一键**（P15 十键 + R7 `autoThink` + B10 W3 七键 + 注入开关三键 `agent.injectProjectRules` ∥ `agent.injectDocs` ∥ `agent.injectMemories`——#1420 · #1465 · 2026-10-15）；词键标签 + 表定控型 + 锚 `data-field-name`）
    + **即改即存**（`change` ⇒ 单键 patch 直发；回执 ⇒ 就地刷新；失败 ⇒ 回退 + 可见失败面——零保存键）；**表外标量键 = 不再行面呈现**（泛化编辑器全消：兜底行 ∥ 保存键 ∥ 只读行族整体退役；桌面同 VSC = 纯具名）。
    落点 = `thincoder-desktop/renderer/views/settings-agent.mjs`（`agentBody` ∥ `NAMED_FIELDS`——经 `views/settings-sections.mjs` re-export 面）+ `thincoder-desktop/renderer/mount-settings-segments-agent.mjs`（单键 patch 写路）
    + `thincoder-desktop/renderer/i18n-views.mjs`（词面：`settings.agent.*` 键实驻 views 字典——`i18n-views.mjs:202`）。

### 2.4 对齐第三批 · 设置面 / 向导 Esc 关闭（F-Esc）

- **设置面 / 向导·Esc 关闭**（对位面 = VSC Esc 关设置面）：`document` 级 `keydown` ⇒ Escape ⇒ 关闭（经既有 `settings:close` 出口——单一实现；向导态不在本项）；其余浮层族（下拉 / 菜单 / 中断模式）桌面零对位面 ⇒ 零动。
  判据：**机检** = 真 Electron 面——真点设置入口（输入区控件行出口）⇒ `keyboard.press("Escape")` ⇒ `[data-slot="settings"]` 清空（T-DSK43 ⑤）；**真机复核** = 人工走查。

### 2.5 设置面样式收正批注（D37）

**批注（设置面样式收正 · D37）**：桌面设置面**样式面对齐 VSC 端**（锚 = 渠道段实拍对比；用户走查「设置界面的样式很凌乱」+「我希望至少跟 vsc 端样式上对齐」；需求卷 **D37**）。
决策单源 = 本档 §1 **KD-66**。本注只述端侧形态 / 落点 / 判据 / 边界——值源 = VSC（两行卡 = `thincoder-vscode/webview/settings-providers.js:178-193` + `thincoder-vscode/webview/settings.css:155-203`；拨杆 = `thincoder-vscode/webview/settings.css:222-257`）。

1. **收正四则（全七段通则）**——① **断行恒定**：行族 = `flex-wrap: nowrap`（`.settings-row`）；行内中段可变内容 = 单点省略（`min-width: 0` + `overflow: hidden` + `text-overflow: ellipsis` + `white-space: nowrap`——泛用面 = `.settings-row-value`；不可用原因句豁免 = `[data-unavailable-reason]` 档保 `white-space: normal`）。
   **补则（代码评审 · 2026-10-02）——MCP 展开面 = 全显豁免**：`.settings-mcp-detail` 域内值面 `white-space: normal` + `overflow-wrap: anywhere`——行族通则本体 ∥ 折叠面摘要行零动。
   ② **动作紧凑右对齐**：动作钮全集 = 行尾单簇（簇首 `margin-left: auto` 既有；簇内续钮 `margin-left: 0`——`~` 兄弟规则）。
   ③ **卡界 = VSC 实形**：行 = 1px 描边（`--line`）+ 圆角 6px（`thincoder-vscode/webview/settings.css:155-159`——`border: 1px solid var(--border)` ∥ `border-radius: 6px`；卡底零独立填充；用户 2026-10-02 10:27 裁「尽量跟 VSC 一致」——D24 描边归零基线全局零动 ∥ 仅本卡界让位）。
   ④ **层次/密度**：行内层次 = 主行（名 + 钥面）∥ 副行（muted 元数据）∥ 条件第三行（提示句）；密度 = 两行间距 4px ∥ 卡内边距 6px 8px（保持）。
2. **渠道段（锚点首段）= 两行卡列**——行根（`[data-provider]`）纵排：**主行**（`.settings-row-main`）= 名 + 钥面（masked ∥ 未设词）+ 当前标 + **动作簇**；**副行**（`.settings-row-sub`）= `模型 · baseURL`（串形照 VSC——缺段不落空分隔符）+ 不可用标 + 行尾代理开关。
   **动作簇 = 桌面动作全集**（功能面不删：修改/设钥 ∥ ✕删钥 ∥ 校验 ∥ 移除名——四件全保留、**序恒定 = 现盘序保持**）；**编辑态**（钥行编辑中）= 行内换形（沿 VSC `keyRowEdit`）：主行 = 名 + 钥面 + 输入（伸缩）+ 存 ∥ 消；代理 ∥ 移除 ∥ 校验暂撤（取消即回——既有行为零改）；**第三行**（条件）= 不可用原因句（`!hostBusy` 时——S3 分档保持；色 = `--accent`，对齐 VSC 失败句红系语义）。
   「不采用」（端差）：**状态点**（VSC `●`——键面已载配置态，加 = 净增密度）。
3. **其余五段——行族通则带上（逐段点清）**：agent 参数（字段行 nowrap；复选换拨杆）· MCP（行 = 名 + 形词 + 摘要省略中段 + 五动作右簇；展开面工具行 = 竖排三段 + 缩进 24px——VSC `.mcp-tool-row` 同形）· env（字段行 nowrap；两复选拨杆；测试行 nowrap）· 工具与服务（键行 ∥ 索引行 nowrap + 动作右簇）· 模型清单（consult ∥ advisor 行 nowrap + 省略 + 动作右）。
4. **复选控件 = 拨杆形**（源 = VSC `.switch`）：`input.settings-field[type="checkbox"]` ⇒ `appearance: none` + 轨道 30×16（圆角 8px · 底 `--line`）
   + 圆钮 12px（`#fff` 字面——两主题同值，沿 VSC）+ 选中轨道 `--accent` + 钮右移（`left: 16px`）。**文本输入 ∥ 下拉细边保持（D24 保留面零动）**——仅复选子域换形。
5. **端差登记（逐条给由 · 不追）**：① 圆角——VSC 6px 族（实读 `thincoder-vscode/webview/settings.css` 八处——卡仅一例）∥ 桌面 `--radius: 0`（扁平化定版）；**卡界（`.prov-row`）例已随用户 10:27 裁定同形**（项 1 ③）——余域不追；② 状态点不采用（项 2）；③ 字级——VSC 12px/600 ∥ `--fs` 14px/400（D29 基线）；④ 表单标位——VSC 标上行 ∥ 桌面标左（`flex: 0 0 6rem`——48rem 列宽域；本次保持）。
6. **判据**——机检 = 单元测试档（**已建成 · 219 行 · 五组用例 · 9 用例**：行结构断言 ∥ 断行恒定源扫 ∥ 样式纪律（零新变量 ∥ 零新断点）∥ 拨杆四规则 ∥ 卡界源扫（`1px solid var(--line)` + 圆角 6px））；真机 = **T-DSK58**（用户实拍可比）。测试文件随修随加——不占设计面条目。
7. **边界**——交互语义 ∥ 功能增删 ∥ 七段信息架构（段集 ∥ 段序）∥ 布局面（48rem 居中列——零动）· 核 ∥ `thincoder-render-core` ∥ CLI ∥ VSC 侧零触 · 主题变量表 ∥ 断点 ∥ D29 基线零改（**零新变量 ∥ 零新断点**）。
8. **计数（D3）**——收正段 **7** · 渠道卡结构件（两行 + 一条件行）· 端差 **4** · 新增变量 **0** · 新断点 **0** · 词键 **0**（零新文案）· 新档 **1**（拆档产出）。

### 2.6 启动态 ∥ 首启向导（行）

| 面 | 形态 |
|---|---|
| 启动态 | 无当前项目 ⇒ 打开目录入口 = 会话控制面**项目钮**（`project:open`——恒在场，词面经 `aria-label`）· **中区引导面在场**（`data-guide="no-project"`——落点 = 对话流挂载根；见 `docs/desktop/design/UI.md` §1「首启空白态引导注」项 1）· **首屏引导门**：`data-boot ≠ "ok"` 期间引导层在场 ∕ `"error"` ⇒ 错误面（可读原因）∕ `"ok"` ⇒ 撤——形 / 锚 = 本档 §2.2 项 8 |
| 首启向导 | 闸 = `config:read` 回执 `configured` 假 ⇒ 冷启动进向导（已配 ⇒ 跳过）；**容器 = 同设置面**（`[data-slot="settings"]` 单容器——两树互斥 · `configured` 假 ⇒ 向导占槽）；**首屏两路**：路由屏两卡（团队卡「登录团队服务器」（说明 = 团队句）∥ 本地卡「配置本地 provider」（说明 = 本地句）——两语各四句）+「以后再说」——都不预选；团队卡 ⇒ 同屏换团队表单（三字段 + 登录钮 + 失败四句 + 「← 换一种方式」）∥ 本地卡 ⇒ 既有步 1（同款回退）；本地路 = 选 preset → 填 key（`provider:verify` 真调一次 ⇒ **结果就地可见**——钮态短形 + 明细行；单源 = **§2.23**）→ **「保存并继续」**（步 1 唯一写盘钮 ∥ 前向唯一径——非空先存后进 ∥ 空零写前进；单源 = **§2.23**）→ 模型 → 选目录（`project:open`）；团队路 = 核 `teamLogin` ⇒ 进模型步（既有链）；**「完成」未配置 ⇒ 不静默退场**（就地护栏——「去保存渠道」∥「仍要退出」；单源 = **§2.23**）；**零终端可完成**；**退场 = 清空容器**（主 UI 可用）· **幂等可重入**（中途退出 / 配置仍缺 ⇒ 下次冷启动再进）；**档不可读（畸形）⇒ 向导不进 · 容器空 + 设置面可进 + 明示不可读**（错误串直传 · **不静默重置**——本档 §1 KD-12；`data-boot` 保持 `error`）；表单出口**复用设置面导出面**（单一 owner · 零副本）；形态 = 纯描述符树 + 薄挂载（`docs/desktop/design/RENDERER.md` §1.1）；**步界 / 步体闭集**（单源）= `step` 闭集 **`"route"` ∥ `"team"` ∥ 1–3**（表外值回落 `"route"`——`thincoder-desktop/renderer/views/onboarding.mjs`；路由 / 团队两屏零步标）；回退 / 换路保真 = 已填保留 ∥ 密码恒清（**§2.22**） |

### 2.8 重建保真 · 设置 ∕ 向导草稿保真（#604）

1. **设置 ∕ 向导草稿保真（#604）**——任一 settings 切片写落地不得清未提交草稿：`paintSettings` 单闸（`thincoder-desktop/renderer/mount-settings.mjs:207-222`——两树唯一重绘点）捕获 ∕ 复填；捕获域 = 携 `[data-draft]` 申报控件；非申报控件取新模型值（负向锁）；真机 P1（设置 + 向导两径）。
2. **两用例重锚**——渠道两形表单入 `providerAdd` 弹窗体且单形渲染 ⇒ 波 1 机检两用例重锚：用例一 = 弹窗体富形（`addShape:"custom"`）+ 页槽（工具 key ∥ env shell）两宿主两轮重绘保真；
用例二 = 弹窗卡根在途窗（`mcpForm` 跨 `loading`）携带（草稿 ∕ 焦点 ∕ 光标 ∥ 卡滚位）。机检件 = 重建保真 M604 单元测试档（验收 = 8/8 全绿）；重锚设计 ∥ 「两形同刷」覆盖缺口与去处 = 残渣清扫批。**受影响文件（含本项机检件行）小表 = 本档 §2.19**。

### 2.9 半行指针（本域半边在其本档）

- **设置面头主题控件半**：主题主条 = `docs/desktop/design/UI.md` §1「主题」行 ∥ §1「批注（主题切换 · D33）」；本域半边 = 本档 §2.1（面头三态钮族）。
- **空态 ∥ 启动态「引导向导」半**：空态 ∥ 启动态主条 = `docs/desktop/design/CHAT.md` §2（空态）/ 本档 §2.6（启动态）；引导面全形 = `docs/desktop/design/UI.md` §1「首启空白态引导注」。
- **会话级三值 ↕ 设置面默认值半**：会话级主条 = `docs/desktop/design/UI.md` §1「会话面四件注」项 1 ∥ `docs/desktop/design/COMPOSER.md` §2（输入区行）；本域半边 = 本档 §2.24（模型选择归位——设置面默认值面随 **KD-80** 撤场）。

### 2.10 设置菜单升级批注（D39 ∥ D38）

**批注（设置菜单升级 · D39 ∥ D38）**：**设置弹窗化（A 案）**——设置菜单七组项 ⇒ **应用内模态弹窗**（单组 ∥ 读写 ∥ 确认 ∥ 失败链全复用）；**现有设置页零动并存**（升级件——验收 OK 后再议撤，D39）。决策单源 = 本档 §1 **KD-68**；菜单侧（组树 ∥ 通道 ∥ 词面）= `docs/desktop/design/MENU.md` §1 **KD-67**。

1. **弹窗体（形 ∥ 交互）**——背板（z-20）+ 居中卡（z-21；宽 ≤48rem；高 ≤视口；内滚）；三关 = 背板 ∥ ✕ ∥ 卡内 Esc（stopPropagation）；初始焦点 = ✕；`role="dialog"` + `aria-modal`；零焦点陷阱（边界）。
2. **复用链（表 · 指名；**KD-80** 后 = 六组 + 团队）**——渠道 ∥ agent 参数 ∥ MCP ∥ 运行环境 ∥ 工具与服务 ∥ 会诊与审查 ∥ 团队：
  段体组件（`providersBody` ∥ `agentBody` ∥ `mcpBody` ∥ `envBody` ∥ `toolsBody` ∥ `modelsBody` ∥ `teamBody`）+ 读取链（`loadProviders` ∥ `loadAgent` ∥ `loadMcp` ∥ `loadEnv` ∥ `loadTools` ∥ `loadAgent` ∥ `loadTeam`）+ 出口链（同一 `exits.handlers` 全表）——逐行全名 = 本档 §1 **KD-68** ③（**KD-80** 后「模型」行撤场）。
3. **开合 ∥ 状态**——`settings.modal` 切片（`null ∥ 组名`）；开 = 验证（`SCOPES`——`SECTIONS` 派生，定义位 = `thincoder-desktop/renderer/mount-settings.mjs:48`）→ 占槽拒（向导期）→ 切片写 + 本组复位 + 本组读取；关 = 清 + 本组复位 + 确认同清；`closeSettings()` 同清。
4. **重绘 ∥ 草稿保真**——第二闸（沿 #604 同形）+ 独立残件 + 失效集同滤；`refreshSettings` 在场判据 +`modal`。
5. **判据**——机检 = 单元测试档（波 2 三用例——本档 §4）；真机 = **T-DSK59**（本档 §5）；零新词键（复用段名 + `settings.close`）。
6. **边界**——现有页 ∥ 七段值面语义 ∥ 独立窗口（B）∥ 核 ∥ `thincoder-render-core` ∥ CLI ∥ VSC 零触；确认族叠序保留（40/41 在弹窗上）。

### 2.11 设置菜单组项收窄批注（D39）

**批注（设置菜单组项收窄）**：菜单组项集 **七 ⇒ 六**——「模型」不入菜单（模型选择归输入面板——用户 2026-10-02 16:53 走查裁）；**设置页面七段零动**。
本次**设置域（渲染面）零触**——弹窗校验面（`SCOPES`）= **十名**（菜单不发「模型」∥「团队」——零改，支 A 裁定；**现值十名**：三端对齐批（2026-10-07）增 `providerAdd`（§1 **KD-75**）∥ 添加入口弹窗统一批（2026-10-07）增 `mcpForm` ∥ `consultAdd`（§2.18）∥ B1 批（2026-10-10）增 `team`（§2.21）∥ 模型选择归位批撤「模型」段 −1（§2.24））；
`settings.modal` 切片 ∥ 复用链（本档 §2.10 项 2）∥ `MODAL_READS`（定义位 = `thincoder-desktop/renderer/mount-settings.mjs:65`）= **十组**（**KD-80** 后去 `model` 行——§2.24）；
设置页对齐；菜单可达面 = 六组弹窗）。决策单源 = 本档 §1 **KD-68** ④（闭集关系句）∥ 菜单侧 = `docs/desktop/design/MENU.md` §1 **KD-67**。

### 2.12 轻通道轮六批注（走查续调六）

**批注（轻通道轮六）**：两笔走查续调（源 = 用户走查）。

1. **渠道校验反馈就地化（笔一）**——`verify` 结果携行名（`name`）；**匹配行 ⇒ 本行呈现**（校验按钮态短形：`ok` ⇒「校验通过」∥ `fail` ⇒「校验失败」+ 锚 `data-verify-state`；结果明细行 = 既有 `verifyNode` 形落于本行）；**无行渲出结果**（名不在列表 ∥ kind 表外）⇒ 段末回退（`fallbackVerifyNode`）。
   **向导步 1 = 同一明细件的第二消费面**：单钮面零行匹配 ⇒ **直取 `verifyNode`**（`fallbackVerifyNode` = 无行回退件——向导径不用）；明细件 owner 不变（同档 `verifyNode` 出导出面）。
   **编辑态 = 校验钮 ∥ 结果明细行同撤**（校验暂撤口径含明细；取消即回——`settings-sections-providers.mjs:162` `|| editing` 径）。**结果跨开面留存 = 有意**（语义 = 「上次校验读数」：提交成功 ∥ 移除 ∥ 下次校验起手均已清（`mount-settings-exits.mjs:85 ∥ :117 ∥ :98`）；开面不清——零实现改）。
   **落档四**：`thincoder-desktop/renderer/mount-settings-exits.mjs:102 ∥ :105`（结果携 `name: target`——零增行）∥ `thincoder-desktop/renderer/views/settings-controls.mjs:127`（`verifyControl` 三参——`state` 缺省零变 ⇒ 向导径原位）；
   `thincoder-desktop/renderer/views/settings-sections-providers.mjs:42 ∥ :133 ∥ :136 ∥ :162 ∥ :190`（`fallbackVerifyNode` 定义 ∥ `providerRowNode` 四参 ∥ 本行态 ∥ 本行明细）∥
   `thincoder-desktop/renderer/i18n-settings.mjs:67-68 ∥ :132-133`（+2 键 × 两语：`settings.providers.verify.okShort` ∥ `.failShort`）。**零契约 ∥ 零通道 ∥ 零 store 形改**（`verify` 对象 +1 字段）。
2. **弹窗头行粘顶（笔二）**——卡内滚 ⇒ `.settings-modal .settings-head` sticky 常驻（`position: sticky` ∥ `top: 0` ∥ `z-index: 1` ∥ 不透明底 = `--bg-raised`——标题 ∥ ✕ 不随体滚出）。落档一：`thincoder-desktop/renderer/settings-modal.css:37-43`（零新变量 ∥ 零新断点）。
   **页 ∥ 向导面同径（轮六）**——整层滚（`[data-slot="settings"]` `overflow: auto`）⇒ `.settings-head, .wizard-head` 同法
   （`position: sticky` ∥ `top: 0` ∥ `z-index: 1` ∥ 不透明底 = `--bg`——页底同色；标题 ∥ ✕ 不随体滚出）；落档一：`thincoder-desktop/renderer/settings.css:43-57`（+7 = 注释 3 + 声明 4）。
   **a11y 补 = 两滚动层 `scroll-padding-top`**——页层（`settings.css` `[data-slot="settings"]`）∥ 弹窗层（`settings-modal.css` `.settings-modal`）各增一行：
   `scroll-padding-top: calc(var(--fs) * var(--lh) + 2 * var(--gap));`（≈ 42.2px = 头行 27.2px + 余量——沿粘顶批同形）；**效 = 键盘 Tab ∥ 焦点滚入 ⇒ 目标件不被粘顶头遮挡**；滚动手势零介入（`scroll-padding` 只改滚入对位——鼠标观感零变；**无媒体钩 ⇒ 不可只键盘态补**）。
   弹窗面专指规则（上半）不受影响（专指度更高——真机复核：弹窗头底色仍 `--bg-raised`）。
3. **两面同效**——渠道段体 = 页 ∥ 弹窗共用单源（本档 §2.10 项 2 ∥ §1 **KD-68** ③——零第二实现）⇒ 笔一在两面向同效；笔二 = 弹窗体起手；页 ∥ 向导面同径承接（项 2 下半）。
4. **判据 ∥ 测试**——笔一（触及可执行行为面）：单元测试档（已建成——三径：匹配行本行态 ∥ 无行渲出结果段末回退 ∥ 空态零节点）+ 真机走查；笔二（视觉细部）：真机走查读数（走查即验收读数本——亮 ∥ 暗；卡内滚终态）。验收回指 = 本档 §4 本块；用例 = §5 随动（T-DSK58 ① ∥ T-DSK59 ③）。
5. **边界**——零契约 ∥ 零通道 ∥ 零 store 形改 ∥ 零新变量 ∥ 零新断点；段集 ∥ 段序 ∥ 其余交互语义 ∥ 核 ∥ `thincoder-render-core` ∥ CLI ∥ VSC 零触。

### 2.13 P1 读数端面消费批注（KD-69 · 桌面侧）

**批注（P1 读数端面消费 · KD-69 · 桌面侧）**：本次定形桌面设置面「工具与服务」段两读上屏（库大小行 ∥ 逐 origin 行数行——KD-69 ② 桌面半）；决策单源 = `docs/desktop/design/PROJECT.md` §2 **KD-69**（本注 = 该行 ⑤ 入档行）；见本档 §3.1。

1. **词键（两语同增）**——`settings.indexDbSizeLabel`（行面名键——名 ∕ 值两列式；组成式 ≠ VSC 同名键 `settings.indexDbSize` 整行模板）∥ `settings.indexOriginCounts`（计数片段——两语值逐字同 VSC `locales` 同名键）；落点 = `thincoder-desktop/renderer/i18n-views.mjs`。
2. **形**——库大小行 = `div.settings-row` 带 `data-index="db"`（名 ∥ 值两列）；逐 origin 行 = 每 origin 一行 · `data-index="origin"`（名 = origin 原样；值 = 计数片段）；落点 = `thincoder-desktop/renderer/views/settings-sections-tools.mjs`（`dbSizeRowNode` ∥ `originRows`——段体尾）。
3. **缺位 ⇒ 零节点**（禁假造）——`dbBytes` 非有限 ∥ 负 ⇒ 库大小行不落；`origins` 缺 ∥ 非数组 ∥ 空 ⇒ 零行；字节归一 = `formatBytes`（B ∥ KB ∥ MB ∥ GB 一位小数）。
4. **刷新拍** = 与既有索引读数同拍（设置面加载 ∥ 构建后推送——**零新通道 ∥ 零新计时器**；KD-69 ④）；供给链 = `thincoder-desktop/src/main/index-status.mjs`（`readIndexCounts` 回执透传——端侧零 SQL）→ `thincoder-desktop/src/main/settings.mjs`（`indexStatus()` 回执透传）。

**边界**：常驻状态栏段不做（状态行段集闭集——KD-69 ⑤）。

### 2.14 首跑渠道提示批注

- **来源**：用户走查（已配渠道+key 仍提示「未配置 API 密钥」）+ 裁「A+B」（终形 = 词面-only）；契约面 = `docs/desktop/design/IPC.md` §2；词面 = `docs/desktop/design/COMPOSER.md` §2 批注。
- **`defaultModel` 写入面 = 视图出口 ∥ 选定写回**（单源 = `docs/desktop/design/IPC.md` §2 注 8①）。
- **向导收尾（`finishWizard`）**：完成径 = 复读 `configured` ⇒ **已配** ⇒ 落槽 + 退场/重进（零改）∥ **未配 ⇒ 不静默退场**（就地护栏：「去保存渠道」∥「仍要退出」；单源 = 本档 §2.23）；不设「默认模型」守卫——
  守卫态（渠道非空 ∧ `defaultModel` 缺）的提示 = 输入区发送失败行（词 `composer.send.noDefaultModel`——`docs/desktop/design/COMPOSER.md` §2 批注）；
  判由 = 模型步候选同源零候选（见下「边界 ∥ 上抛」bullet）。
- **向导模型步「采用」接线**：`createWizard` 增注入 `useModel`（单一实现 = 出口族 `onUseModel`；注入点 = `thincoder-desktop/renderer/mount-settings.mjs`）——步 2 候选行「采用」可操作（U-2 裁定纳入——步 2 可操作面闭合）。
- **本域相关边界 ∥ 上抛**：**向导模型步**候选（设置面「模型」段随 **KD-80** 撤场 ⇒ 本项消费面 = 向导步）——皆按**激活渠道**取数（`renderer/mount-settings-reads.mjs:33-39` / `:74-78`——激活渠道 ∥ 「当前模型」两读数由 `defaultModel` 复合串直读（渠道条目不携模型）；
  向导步入径 = `renderer/mount-onboarding.mjs:55-58`）——`defaultModel` 缺失态两处**同零候选**（向导步「采用」钮判据三件含 `model.provider !== null`——`renderer/views/settings-sections.mjs:70-72`）
  ∥ 渠道行族无「设为当前」动作（`renderer/views/settings-sections-providers.mjs:133-165`）⇒ 该态 config 级补设路径缺失（**候选消解 = 见 §2.15**）。
- **判据 ∥ 边界**：D11 不抵触（向导完成径零改）；`provider:setKey` ∥ `delKey` ∥ `setProxy` ∥ `settings:agent` 写语义零改；配置档 ∥ 设置页 ∥ 弹窗面零结构改；机检 = 单元测试档 T3 / T4 ∥ 源码判据。

### 2.15 缺激活渠道态补设路径

- **修法 = 全渠扇出补设（复用既有通道——零新 IPC ∥ 零新写面）**：`loadModels` 于 `provider` 空时改取 **`model:catalog`**（无载荷全渠扇出——白名单位次 39；单源 = `docs/desktop/design/IPC.md` §2「模型清单注」）
  ⇒ 候选行族 = `{ provider, id }`（全渠——渠失败零行沿 catalog 口径）；行「采用」经**既有出口** `onUseModel(provider, id)`（`renderer/mount-settings-exits.mjs` `useModel`——写 `settings:agent { patch: { defaultModel } }`）
  ⇒ 写后 `loadProviders` 回读 ⇒ 激活渠道出现、段转常规面。**写面 / 载荷 / 白名单零新**（两条既有通道）。
- **视图形**：`modelChoicesTree` / `modelRowNode`（`renderer/views/settings-sections.mjs`）候选行扩**带渠形**——行显示 `provider · id`（对齐 consult 行族先例 `views/settings-sections-models.mjs:54`）；
  「采用」判据由「激活渠非空」改「**行自带渠非空**」（全渠态下每行自携 provider）；当前项判定 = `current === "<provider>:<id>"`；空态 / 失败面沿既有（零候选 ⇒ 空态词；catalog 失败 ⇒ 段 `none` + `report`——零静默）。
- **投影档穿透（表外件①）**：候选行渠字段经 `thincoder-desktop/renderer/views/settings.mjs` 投影透传（`:162-163` 保留 `{ id, provider }`——行自带渠的前提；缺 ⇒ 视图形不可达）。
- **向导模型步同源**：向导步 2 复用 `modelChoicesTree`（单一 owner），且候选复读 = **同一注入引用** `loadModels`（注入点 = `mount-settings.mjs:214`；调用点 = `mount-onboarding.mjs:59-62` 步入步 2）；
  「采用」同经同一 `onUseModel` 出口——**同链 ⇒ #842 修法在向导态自然同效、向导死端同消解**（零向导档改动）。**断言** = T-DSK71 ④（向导用例——同链推证）。
- **消费面（收窄）**：设置页「模型」段随 **KD-80** 撤场 ⇒ 本注消费面 = **向导步 2**（唯一视图出口）∥ **输入区模型钮**（全渠菜单自持 `model:catalog`；选定 ⇒ 会话槽写 + `defaultModel` 同拍写回）；**读写链零改**。
- **边界**：渠道行不加「设为当前」动作（写面须先有模型，两步合成「采用」单步已足）；输入区指路句（`docs/desktop/design/COMPOSER.md` §2 批注「本态零候选 ⇒ 不作指路」）——指路随正候选（登记；随该域下次触碰）。

### 2.16 provider 添加弹窗批注 · 扩面随动

**批注（三端 provider 配置面对齐）**：**桌面渠道添加 = 专用弹窗 + 单表照 VSC 源**（用户三端令「不许另搞一套」+「点了添加不弹窗」）。
决策单源 = 本档 §1 **KD-75**；VSC 源 = `docs/vsc/design/SETTINGS.md` §2.16；逐元素对齐表 ∥ 字段序三端表 = 本次设计面；探面同判定口径落点 = `docs/core/design/PROVIDER.md` §6.19（单源 = `docs/core/design/PROXY.md` §4）∥ `docs/desktop/design/IPC.md` §2。

1. **面形（弹窗体）**——骑 D39 宿主（零新基建）：`settings.modal` 值 + `"providerAdd"`（`SCOPES` **八**——定义位 = `thincoder-desktop/renderer/mount-settings.mjs:48`；`MODAL_READS` +1 行 = `loadProviders`）；
卡 = `header.settings-head`（标题 = `settings.addProviderTitle`）+ `div.settings-modal-body`（失败串（scope = `providers` ∥ `panel`）+ 段态词 + 单表）；
开 ∥ 关 ∥ Esc ∥ 背板 ∥ 初始焦点 = 首控件（源对齐——KD-68 ⑥「焦点落 ✕」之表单例外，登记）∥ 第二闸草稿保真（#604）∥ z 族 20/21 = 沿 KD-68 全套；**零新 CSS ∥ 零新变量 ∥ 零新断点**。
`resetFacets("providerAdd")` = `providers` 面态复位（`addShape` 回 `"preset"` ∥ `probe` ∥ `draft` 清）。
2. **入口（渠道段体）**——`providersBody`（`renderer/views/settings-sections-providers.mjs:179-194`）尾「+ 添加」钮（词键新增 `settings.addProvider`——两语 "+ Add" ∥ "+ 添加"，逐字同 VSC；锚 `data-action="settings:addProvider"`）；段体 = 行族 + 校验回退 + 添加钮（页 ∥ 七组弹窗两面同效——单源段体）。
3. **单表（`channelFormTree` 内容演进——落点 `renderer/views/settings-controls.mjs`；名不换 ⇒ 调用面零改）**——节序 = 类型 `select name="preset"`（标签 `settings.providers.presetLabel`；预设项 = `presetLabel` 串形 `name — desc`；末项 `settings.providers.customChoice`（新键））
+ 预设信息行（`data-preset-info`；`baseURL`，缺段不落空分隔符——D37 口径）+ 条件块 A（`name="name"` ∥ `name="baseURL"` ∥ `name="format"`（`formats` 闭集））
+ `name="key"` + `name="proxy"`（拨杆形——D37；词 ∥ title = `settings.proxyRow` ∥ `.proxyRowTitle` 同键）+ 条件块 B（拉取行（既有 `fetchRowNode`）——渠道校验钮；`name="model"` 输入件退场）
+ 提交（`settings.save`；`data-action` 按形出锚 `settings:addCustom` ∥ `settings:addPreset`——锚名不碎）+ 取消（`settings.cancel`；`data-action="settings:modalClose"`）；形状唯一源 = `providers.addShape` 切片（`"preset"` 缺省），切换 = 重绘（第二闸复填在编输入——**系统值面**（模型预填等）；**用户草稿不跨形携带**＝「换形净起步」，沿 `M-604b·作用域锁`）；
**弹窗体三件（类型切换接线 ∥ 自定末项 ∥ 预设信息行）随 `onAddShape` 在场、取消钮随 `onCloseModal` 在场——条件渲染**（`thincoder-desktop/renderer/views/settings-controls.mjs:97 ∥ :114 ∥ :122 ∥ :126 ∥ :183`）；向导步 1 不携两 handler ⇒ 保持预设单选（**设计字面，非静默发散**——项 5）。
4. **字段序**——自定形 = `preset→[info]→name→baseURL→format→key→proxy→[拉取]`；预设形 = `preset→[info]→key→proxy`（逐元素表 = 本次设计面 §2.4）。
5. **`active` 退场**——设置面表单不设「当前渠道」（VSC 无此元素）；等价路径 = 向导模型步「采用」（同一 `modelRowNode`——**KD-80** 后设置页无「模型」段）；
  向导步 1 表单（`thincoder-desktop/renderer/views/onboarding.mjs`）`activeDefault` 复选退场（无 active 写路；等价路径 = 向导模型步「采用」）；
表单构建器该复选条件渲染随同退场（`activeDefault` 参删——设置弹窗 ∥ 向导全径零节点）；**向导步 1「走 proxy」在场（明写）**——`proxy` 件无条件渲染 ⇒ 向导步 1 同在场（未勾 ⇒ 提交零键——项 6 读法）；
**向导步 1 预设单选 = 设计字面（明写）**——弹窗体三件随 handler 在场（项 3）；向导不携两 handler ⇒ 选型无回环（信息行必失真）∥ 无弹窗宿主（取消钮无动作）⇒ 条件化渲染、零死控；**非静默发散**。
6. **写面（`providers[].proxy` 同一键）**——`provider:save` 载荷 + `proxy`（勾选 ⇒ `true`）⇒ `addProviderEntry` 迁受（同批落条））；行开关（`provider:setProxy`）语义零改；表单初值 = 未勾（新条目无旗）；向导步 1 提交同携 `proxy`（`submitChannel` 共用——读 `data.get("proxy") !== null`）。
7. **探面同判定（缺陷修复并本次——父裁）**——现读链 = 渲染面 `mount-settings-segments-providers.mjs:137`（`ask("provider:models", { baseURL, apiKey, format, ...proxy })`——勾选 ⇒ 携 `{ proxy: true }`（`:130`）；未勾 ∥ 缺省 ⇒ 缺位）
⇒ 主面 `thincoder-desktop/src/main/providers.mjs:276-288`（目标 = `probeTargetOf({ name: "", baseURL, apiKey, format, proxy: payload?.proxy === true })`——`:281`；同判定（条目 `proxy` ∧ 代理 `uri` 在案 ⇒ `proxy.uri`——逐渠独立，2026-10-08）；缺省 ∥ 未勾 ⇒ 直连）
⇒ `probeChannelModels("", target)`（`:282`）；回执行 ∥ 落账（名传空串）零改。
8. **判据**——机检 = 单元测试档四件（按舱拆）：CLI（**127**）∥ VSC（**412**）∥
桌面（**377**）∥ VSC 测试台公档（**210**——非测试文件）
（树面：单表节序 ∥ 条件块随 `addShape` ∥ 段体无表单节点 + 添加钮；
导出面：`channelFormTree` 节点序；主面：`providerSave` 携 proxy 落条 ∥ `providerModels` 目标带 `proxyUri`（逐渠判定 ∥ 直连两径）；开径：添加钮 `data-action="settings:addProvider"` click ⇒ `openSettingsModal("providerAdd")`）；
真机 = 人工走查（弹窗四径 ∥ 字段序 ∥ 勾选落盘 + 行面勾选随动 ∥ 拉取随勾选 ∥ 向导步 1「走 proxy」在场 + 勾选落盘）。用例号 = 拟 **T-DSK65**（并号裁定归号）。
9. **计数（D3）**——词键 +3（`settings.addProvider` ∥ `settings.addProviderTitle` ∥ `settings.providers.customChoice`）− 2（`settings.providers.addCustom` ∥ `.addPreset`——设置面退场后无消费者，随实现净删）；
通道 +0（复用 `provider:save` ∥ `provider:models`——载荷增字段）；弹窗值集 七 ⇒ 八；store 切片 +1 键（`providers.addShape`——非结构性，消解窗口顺延）；
新档 0；导出面 ±0（`channelFormTree` 演进——名不换）；**扩面随动**：词值改 6 键（`settings.providers.keyLabel` ∥ `.noKey` ∥ `settings.addKey` ∥ `settings.deleteKey` ∥ `model.setKey` ∥ `composer.send.noProvider`——「API Key」形统一，键数不变）；
#1031 ∥ #1032 ∥ #1033 本端零改（手输+datalist = 源基线 ∥ 无「选择模型…」元素 ∥ 表单串皆入表；明细 = 本档 §2.16 尾）。

**扩面随动（#1031–#1035）**：① **#1031 零改**——本端自定形 model 已 = 手输 + 探果 datalist（`renderer/views/settings-controls.mjs:88-91`）∥ 保存不依赖拉取（**源对齐基线**——VSC 向本形看齐）；
② **#1032 无此元素**——桌面无「选择模型…」行（模型选择 = 模型段候选行；差异登记）；
③ **#1033 零改**——本端表单串皆经 `t()`；
④ **#1035 词值统一**（实体名 = 「API Key」——zh 保留英文形）：`settings.providers.keyLabel`（en "API key" ⇒ "API Key" ∥ zh「API 密钥」⇒「API Key」）∥ `settings.providers.noKey`（"No API key" ⇒ "No API Key" ∥「未配置密钥」⇒「未配置 API Key」）∥
`settings.addKey`（"Add Key" ⇒ "Add API Key" ∥「添加 Key」⇒「添加 API Key」）∥ `settings.deleteKey`（"Delete key" ⇒ "Delete API Key" ∥「删除密钥」⇒「删除 API Key」）∥
`model.setKey`（`renderer/i18n-composer.mjs`——zh「设置密钥…」⇒「设置 API Key…」+ en 同拍）∥
`composer.send.noProvider`（`renderer/i18n-views.mjs`——zh「未配置 API 密钥…」⇒「未配置 API Key…」）；键数不变（值级改写）。

**边界**：行族 ∥ 行开关 ∥ 探针落账 ∥ 七段信息架构 ∥ 现有设置页 ∥ 核运行期代理语义（`injectProxy`）∥ `thincoder-render-core` ∥ CLI ∥ VSC 零触；独立弹层基建设不做；#1034 = A（删除符 = `✕`——**本端 `✕` 不动**（删钥）；VSC 渠道行 `−` ⇒ `✕`）∥ #1036（MCP env 串）批外另立。

### 2.17 MCP 键值行式输入批注

**批注（MCP 表单 env ∥ headers = 行式键值 · 两端）**：VSC 为准、桌面逐元素对齐（本仓现行源对齐 doctrine）；决策单源 = 本档 §1 **KD-76**；VSC 面 = `docs/vsc/design/SETTINGS.md` §2.4 ∥ §5 **U-S17**。

1. **行件形**——三组各一份行集（stdio `env` ∥ http `headers` ∥ ws `headers`，与 VSC 三容器同形）：行 = `.settings-field-row` + 键格 ∥ 值格（`.settings-field`；占位 `settings.mcp.kvKey` ∥ `.kvValue`）+ ✕（`.settings-row-action`；`aria-label = settings.mcp.kvRemove`）；
行集下「添加行」钮（`.settings-submit`；词 `settings.mcp.kvAdd`）；**零项 ⇒ 零行**；**零新 CSS**（复用列出的既有类——避触本档 `settings.css` 在册越线的拆分窗口）。
2. **行令牌态（切片）**——`settings.mcp.form.kv = { env ∥ headers ∥ wsHeaders: [{ t, k, v }] }`（表单开时自 config 生成、随 `form` 生命周期复位—— `resetFacets` 现径同拍）；令牌 `t` = 表单内单调递增、**永不复用**（草稿闸按 `id = mcp-<group>-<k|v>-<t>` 定位——`renderer/view-state.mjs:168-174`；索引键会在删行后把残值灌进新行）；行件携 `data-draft`（#604 两闸捕获 ∥ 复填保输入）。
3. **两出口**——`onMcpKvAdd(group)` ∥ `onMcpKvRemove(group, t)`：先自读 DOM 行集（无 DOM ⇒ 空转——同 `readMcpForm` 退化式）→ 写切片 → 重挂；**类型切换出口**同拍同步当前组行集（**行值捕获径 = 与加删出口同一「自读 DOM 行集」面**——不采 `readMcpForm` 快照；切换不丢手——沿 `draft` 先例）；`readMcpForm` 草稿快照**不采行件**（重复 `name` 单值槽会塌缩——行值保真归令牌 + 草稿闸两层）。
   **现读面**：`mcpFormNode()` = 文档序末位 `[data-form="mcp"]`（页体 ∥ 组弹窗体两宿主同判——弹窗体挂 `body` 尾 ⇒ 在场即交互面）；加删 ∥ 类型切换两出口与 `readMcpForm` 同一读面（`thincoder-desktop/renderer/mount-settings-segments-mcp.mjs:85-90`）。
4. **提交**—— `mcpConfigFrom` 自 FormData 按 DOM 序配对（`getAll("<group>-k")` ∥ `getAll("<group>-v")`）：trim；空键 ∥ 空值行不提交；重复键后行胜；全空 ⇒ 字段键缺席（`env` ∥ `headers` 删除——沿现判）。
5. **拆档**——MCP 族出档 `thincoder-desktop/renderer/mount-settings-segments-mcp.mjs`（已落 · **327** 行；沿 `-models.mjs` / `-providers.mjs` / `-agent.mjs` 先例；缝 = 同形工厂 `create*Exits(deps)`；装配点 `mount-settings-exits.mjs` 装配即合并——单一 `handlers` 表对外零改）；触发 = 本档 §3.1 该行在册预案（「MCP 族再出一档」——MCP 族结构性触碰）。
6. **计数（D3）**——词键 +4（`settings.mcp.kvAdd` ∥ `.kvRemove` ∥ `.kvKey` ∥ `.kvValue`）∥ 值改 2（`.env` ∥ `.headers`——去「comma-separated」形）；通道 0 新（`mcp:save` ∥ `mcp:update` 载荷形零改——仍 `{name, config}`，env ∥ headers 仍为对象）；store 键 +1（`settings.mcp.form.kv`——表单面态内部形，非切片新族）；新档 1；CSS 0。
7. **判据**——机检 = 单元测试档（L1 构树 ∥ L2 出口配对四态 ∥ L3 VSC 真 webview ∥ L4 词面源扫）；真机 = 人工走查（设置页 ∥ 弹窗两态：值含逗号 token 存取 ∥ 加删行 ∥ 类型切换保真 ∥ 保存后重开回显逐字同）。

### 2.18 添加入口弹窗统一批注

**批注（MCP 表单 ∥ 会诊添加 ⇒ 弹窗；页脚直开）**：统一判据 = 表单类添加 ⇒ 弹窗（单例 ∥ 五路关：保存（守卫通过才发 + 关）∥ 取消 ∥ 背板 ∥ Esc ∥ `closeSettings()` 同清；开框重置；初始焦点 = 首控件）；单字段就地编辑 ⇒ 行内；首启 ∥ 宿主原生专面 ⇒ 各守其面。决策单源 = 本档 §1 **KD-77**；VSC 面 = `docs/vsc/design/SETTINGS.md` §2.17。

1. **面形（两新组）**——`mcpForm`（MCP 表单模态——新增 ∥ 编辑两态共用；标题逐态 `settings.mcp.addTitle` ∥ `settings.mcp.editTitle`）∥ `consultAdd`（会诊添加模态）。
两卡 = `header.settings-head` + `div.settings-modal-body`（失败串（scope = 本组）+ 段态词恰一 + 体件）；开 ∥ 关 ∥ Esc ∥ 背板 ∥ 初始焦点 = 首控件（`data-initial-focus="field"` 声明——源对齐）∥ 第二闸草稿保真 ∥ z 族 20/21 = 沿 D39 全套；**零新 CSS**。
2. **入口（段体）**——MCP 段体（`views/settings-sections-mcp.mjs`）：行族 + 「+ Add Server」钮（新键 `settings.mcpAdd`——值逐字同 VSC `settings.mcpAdd`；锚 `settings:mcpAddOpen`）；原常驻表单出段体 ⇒ 改由弹窗体分支渲出（导出面 +`mcpFormBody`——`sectionBody("mcpForm")` 复用同件，零第二份）。
会诊：模型段尾「+ Add consult model」钮（词 `settings.consultAdd` 既有；锚 `settings:consultAddOpen`；`consult.length >= 5` ⇒ `disabled`）；原表单块改由弹窗体分支渲出（导出面 +`consultAddBody`）。**MCP 入口钮恒在场（loading 态亦然——读链不遮入口，沿 `providersBody` 先例）**。
3. **开合 ∥ 写径**——mcpForm：开 = `openSettingsModal("mcpForm")`（`resetFacets` 清 `form` ⇒ 新增态——三组行集零行（「零项 ⇒ 零行」同判 ∥ 两端同值））；**编辑态 = 开径后写 `form.editing`（先开后写——`openSettingsModal` 内复位会覆盖先写值）**；
add ∥ update 成功 ⇒ 切片复位（`form: null`）+ `if (store.get().settings?.modal === MCP_FORM_MODAL_GROUP) closeModal()`（沿 KD-75 ⑥）；取消（两态同名钮 `settings:mcpCancel`——**新增态补钮**）= 关弹窗。
consultAdd：开 = `openSettingsModal("consultAdd")`（`resetFacets` 复位 `models.picker`——`provider: ""` ∥ `rows: []` ∥ `model: null`）；`consultAdd` 成功 ⇒ `closeModal()`；**取消 = 钮（词 `settings.cancel`；锚 `settings:consultCancel`——与 `mcpForm` 同形）= 关弹窗（切片复位随关）**。**关（`closeSettingsModal`）** = 切片清 + 本组面态复位（两新组同径）。
4. **页脚直开（本端）**——`composer-wire.mjs` `case "addProvider"` ⇒ `openSettings?.(ADD_MODAL_GROUP)`（`ADD_MODAL_GROUP` 自 `thincoder-desktop/renderer/views/settings.mjs` 引——单源）；
`app.mjs` 双口提升 `openSettings(group?)` 同供 `menuActions` + `attachComposer`（现 `:68` 单口 ⇒ 双口——沿 `:76` 同形）；`mount-composer.mjs` 两处 dep 转口（`:160` ∥ `:196`）。`removeProvider` ∥ `setKey` 两映射零改（设置面事）。
5. **段态词恰一**——`thincoder-desktop/renderer/views/settings.mjs` `settingsModalTree` 对非 add 组叠渲段态词（段体自带一件 + 支内再供一件）⇒ 去叠渲件（修前设计轮实测：`env` 组 loading = 2 节点 ∥ `providerAdd` = 1）。
6. **计数（D3）**——词键 +4（`settings.mcpAdd` ∥ `settings.mcp.addTitle` ∥ `settings.mcp.editTitle`（i18n-settings.mjs）∥ `settings.consultAddTitle`（i18n-views.mjs）——两语）；弹窗值集 **八 ⇒ 十**（+`mcpForm` ∥ `consultAdd`——`SCOPES` 派生随动）；
`MODAL_READS` 八组 ⇒ 十组（+2 行）；`store.mjs` 闭集注释 八值 ⇒ 十值（注释级）；通道 0 新（`mcp:save` ∥ `mcp:update` ∥ `settings:agent` 载荷形零改）；新档 0；CSS 0。
7. **判据**——机检 = 单元测试档（**已落 · 5/5**——树面：两新组卡 ∥ 段体零表单 + 两入口钮 ∥ 焦点声明；出口面：入口 ⇒ `openSettingsModal` 两值 ∥ 成功径 ⇒ `closeModal` ∥ 取消 ⇒ 关框；页脚：`addProvider` ⇒ `openSettings(ADD_MODAL_GROUP)`；词面：四新键两语在场）；
真机 = 人工走查（MCP 新增 ∥ 编辑两态：五路关 ∥ 开框重置 ∥ 拒径不关框 ∥ 提交成功后列表随动；会诊：入口满 5 禁用 ∥ 提交成功关框；页脚直开）。
8. **边界**——MCP 字段集 ∥ 型组 ∥ kv 行式机制 ∥ 探测 / 重连语义零改；会诊行渲染 ∥ effort 档 ∥ advisor 面零改；七段值面其余语义 ∥ 现有页 ∥ 核 ∥ `thincoder-render-core` ∥ CLI ∥ VSC 零触。

### 2.19 段出口密钥现读宿主无关化

**来源** = 组弹窗体宿主经菜单径可达：`src/main/app-menu.mjs:36` 六名 ⇒ `openSettingsModal` ⇒ 段体入卡（`thincoder-desktop/renderer/views/settings.mjs:378`）。
**修 = 宿主无关现读**（文档序末位 = 交互面——沿 `mcpFormNode` 先例；`keySave` `renderer/mount-settings-segments.mjs:102` ∥ `saveProviderKey` ∥ `cancelKeyEdit` `renderer/mount-settings-segments-providers.mjs:61 ∥ :52`）。
**边界**：`verifyChannel` 无名径 `presetValue(slot)`（`renderer/mount-settings-exits.mjs:124`）= 向导占槽径（槽内表单即正确宿主）——保持。**判据** = 单元测试档（两组弹窗径 + 页槽径回归 + **源面锁**）。
**源面锁（判据第三用例 · 定义）**：扫描域 = 本修两件（`renderer/mount-settings-segments.mjs` ∥ `renderer/mount-settings-segments-providers.mjs`）；判据形状 = ① 负向——槽作用域现读形（选择器模板串含 `${slot}` 插值）零残留；② 正向——`document.querySelectorAll` 末位取件形在每个现读点在场；③ 三读点逐点断言（`keySave` ∥ `saveProviderKey` ∥ `cancelKeyEdit`）。
**同族出口覆盖（点名 + 结论）**：现读点全集 = 上述三件（扫描域内）；**删钥径**（`keyDelete` `renderer/mount-settings-segments.mjs:133` ∥ `deleteProviderKey` `renderer/mount-settings-segments-providers.mjs:95`）= 零 DOM 现读（按名发送）⇒ **非同面 · 零改**；其余出口无槽作用域现读（`fetchModels` = `FormData(formOf(event))` 直读——宿主无关形）；向导占槽径 = 上句边界保持。

**受影响文件（内容行数口径（文末换行不计））**：

| # | 文件 | 行数 |
|---|---|---|
| 1 | `thincoder-desktop/renderer/mount-settings-segments.mjs` | **164** |
| 2 | `thincoder-desktop/renderer/mount-settings-segments-providers.mjs` | **161** |
| 3 | `thincoder-desktop/renderer/mount-settings-exits.mjs` | **312** |
| 4 | `thincoder-vscode/webview/settings-models.js` | **217** |
| 5 | 重建保真 M604 单元测试档 | **529** |

全量（含设计档自身行账）= 本域文件账。

### 2.20 `env.proxy` 两键形批注

**来源** = `#1090`（`model` 键退场 ⇒ 「三键形」残渣清）；单源 = `docs/core/design/PROXY.md` §4（代理面语义 ∥ 写径）+ `docs/desktop/design/IPC.md` §2 `settings:env` 行（投影）。
**面**：`env.proxy` 形 = **两键**（`{ uri, web }`）——三面同拍：
1. **种子**：`thincoder-desktop/renderer/store.mjs`—— `env.proxy` 切片种子 = `{ uri: "", web: true }`（`model` 键零残）。
2. **投影**：`thincoder-desktop/renderer/views/settings.mjs`——投影两键（`model` 键零残）；`env` 段体 `settings-sections-env.mjs`（proxy ∥ shell 两子节）形面零改。
3. **写径归一**：`thincoder-cli/src/tui/cmd-config.mjs`——`seturi` **写即归一**（两键重建 `{ uri: newUri, web }`——不再「原样保留」⇒ 残键随写清零）；`toggleweb` 径照旧（归一态两键）；**两径读回同形**。
**判据**（AC-1090/1–5）：① 种子两键 ② 投影行零命中 ③ `cmd-config` 两写径读回同形（残键清零）④ M604 夹具零 `model` 字面 ⑤ 单元测试档 T8 覆盖 `store` / `views` 两档（零残断言在场——实跑绿）。
**边界**：proxy 语义 ∥ 通道 ∥ 载荷 ∥ 白名单零改（形面只涉「未配置投影」与「写径归一」两处）；`env.proxy.model` 键退场 = 残留面清。

### 2.21 团队段批注（登录与接入）

- **机制单源** = `docs/core/design/TEAM.md` §2；通道面 = `docs/desktop/design/IPC.md` §2（`team:status` ∥ `team:login` ∥ `team:logout`——三通道）。
- **段形**：设置面第 7 段「团队」（`SECTIONS` 追加序尾——**KD-80** 撤「模型」段后页 = 七段）——未登录 = 表单（地址 ∥ 用户名 ∥ 密码 + 登录钮）+ 提示行「未登录——登录后可用」；已登录 = 状态行（server ∥ 成员 ∥ 端标签）+ 「退出登录」钮。
- **闭集随动**：团队入 `SECTIONS` ⇒ `SCOPES` 派生（**KD-80** 后 = 十名——校验宽容面，菜单侧不发）；`MODAL_READS` +1 行（`team → loadTeam`——读件 = 团队段读，经装配并入 `reads` 检索面）；**菜单不发**（`SETTINGS_GROUPS` 六名不动——`app-menu.mjs` 零改）；闭集关系 ∥ 漂移检测排除句单源 = 本档 §1 **KD-68** ④。
- **写面**：段出口调 `team:login` / `team:logout` → 主进程处理体（`thincoder-desktop/src/main/team.mjs`（已落））→ 核 `thincoder-core/team.mjs`（已落——`writeConfigAtomic` 单写者）；
  **成 ⇒ 回执后渲染面复读**（零新推送通道——写经 `writeConfigAtomic` ⇒ `ev:config` 自写抑制沿既有）：`team:status` 复读（段转登录态）+ provider 列表复读（`loadProviders()` 既有读链——派生条目随动）+ **输入区候选面刷新**（`onProvidersChanged()` ⇒ `composer.refreshCandidates()` 全渠重取 `model:catalog`——登录成 ⇒ 候选含 team 派生条目；机制单源 = `docs/core/design/TEAM.md` §2.8）
  ——调用点 = `thincoder-desktop/renderer/mount-team.mjs` `login()`（写成功径；`loadProviders` ∥ `onProvidersChanged` 两注入面 = `thincoder-desktop/renderer/mount-settings.mjs`）。
- **登录入口逐径**：状态段就地面板径（`thincoder-desktop/renderer/mount-team.mjs` `login()` `:120`）= 刷新落点（成 ⇒ `onProvidersChanged()` ⇒ 输入区候选面全渠重取 `model:catalog`）；
  **首启向导团队表单径**（`thincoder-desktop/renderer/mount-onboarding.mjs:182` `team:login`）= **不经 `login()`**——成拍随动 = `loadProviders()`（`:191`）+ 进步 2 自带取数链（`loadModels`——§2.23 项 2 ⇒ 候选含 team 派生条目）；
  向导期主界面输入区不在用 ⇒ 刷新落点该径不适用（零改；逐径清点单源 = `docs/core/design/TEAM.md` §2.8）。
- **回执形与一次性提示**：`team:login` 回执 `{ ok, reason?, notice? }` ∥ `team:logout` 回执 `{ ok, revokeDelivered? }`（形单源 = `docs/desktop/design/IPC.md` §2 团队族行）；
  `notice` 在场（`"manual-name-conflict"`）⇒ 段内就地提示「已存在同名 provider「team」——未自动添加；请改名或删除后重登」（登录当刻）∥ `revokeDelivered === false`（缺席 = true）⇒ 段内就地提示「服务端吊销未达」（退出当刻）——两句逐字同句（`docs/core/design/TEAM.md` §2.5）；
  两提示 = 一次性事件（登录/退出当刻就地显示）——`team:status` 复读不带提示字段。
- **草稿保真（#604 口径）**：地址/用户名现存值重建保留；**密码恒不保真**（重建即清空——安全面有意）；写失败 ⇒ 就地错误行（网络不可达——请检查地址与端口 ∥ 用户名或密码错误 ∥ 登录尝试过于频繁 ∥ 本机配置写入失败——四句逐字同——`TEAM.md` §2.5）。

### 2.22 团队入口补全批注（首启两路 + 卡降管理面）

**批注（团队入口补全）**：**首启两路与团队卡降格**——用户裁定链（首屏两路；形态 = 图形端两卡并排 ∥ 终端列表；都不预选；「以后再说」第三态保留；换取同屏 + 「← 换一种方式」；设置卡降管理面 label ∥ 详情——登/退移主界面直达）；
需求 = 本档 **D11** ∥ `docs/desktop/requirements/PROJECT.md`；机制单源 = `docs/core/design/TEAM.md` §2.5 ∥ §2.6。VSC ∥ CLI 对位 = `docs/vsc/design/WEBVIEW.md` §4.11 ∥ `docs/cli/design/TUI-COMMANDS.md` §3.1。

1. **路由屏（形 · 锚）**——`div.wizard-routes`（两卡并排）+ 两卡：团队卡 = 标题「登录团队服务器」+ 说明「用团队发的账号登录——模型由服务器提供，不用自己填 key」+ 行动钮（词 = `settings.team.login`）；
   本地卡 = 标题「配置本地 provider」+ 说明「自己填 API key，不依赖团队服务器」+ 行动钮；卡锚 = `[data-route="team"]` ∥ `[data-route="local"]`；「以后再说」钮 = `[data-wizard-later]`；**都不预选**（零默认选中 ∥ 零自动前进）；两屏（route ∥ team）零步标（步标只在 1–3 显）。
2. **团队表单（同屏换取）**——三字段（服务器地址 ∥ 用户名 ∥ 密码——`fieldPair` 复用（单一 owner：`settings-sections-team.mjs`——**`fieldPair` 入导出面**（实读现非导出）））+ 登录钮；失败四句就地（`settings.team.reason.*` 词键——逐字同）；
   `notice`（同名冲突）⇒ 表单区就地提示（登成当刻——逐字同句；一次性事件）；**且：成功径同拍进步 ⇒ 该提示并入步 2 载面**（步 2 头行渲染同一 `team.notice`；
   **消费即清 = 离步 2 ∥ 退场时清**——非渲染即清，防「就绪替换表单区」把提示压成一帧（不可见即静默））；「← 换一种方式」= 回路由屏；
   登录成 ⇒ `loadProviders()` 复读 + 进步 2（模型——候选 = `loadModels` 链（激活渠 = `model:list`；缺渠 = `model:catalog`——同 §2.15；登录成 ⇒ 候选含 team 派生条目）；采用 ⇒ `defaultModel`）——后续步 3 与既有完成链零改。
3. **保真（回退 / 换路）**——已填保留（地址 ∥ 用户名 ∥ provider 字段——`[data-draft]` 域，沿 #604）；**密码恒不保留**（回退即清——沿 B1 密码不保真口径）。
4. **退出 / 跳过**——「以后再说」⇒ 既有 `dismissWizard`（`wizard.dismissed` 真——主 UI 可用）；状态段团队入口（未登录态）在场（**零会话例外**——`docs/desktop/design/UI.md` §1「批注（团队登录态段 · 登录面补全）」项 1）⇒ 空态下登录路仍可达；**零第二引导面**。
5. **卡降管理面（收正）**——`views/settings-sections-team.mjs` 拆 `teamAdminBody`：label（`settings.team.labelLabel`）+ 详情三行（server ∥ member ∥ label）；**零登/退控件**（登/退 = 状态段面板 ∥ 首启两路）；**「轮换」控件**（已登录在场——确认一步 + 结果行；机制单源 = `docs/core/design/TEAM.md` §2.7）。段体旧两态形（登录表单 ∥ 登出态）迁 `teamBody`（就地面板消费——单一实现）。
6. **接线**——`thincoder-desktop/renderer/mount-onboarding.mjs` +`chooseRoute` ∥ `backToRoute` ∥ 团队提交（`team:login`——成/败两径）；`thincoder-desktop/renderer/mount-team.mjs`（已落——`docs/desktop/design/UI.md` §1「批注（团队登录态段 · 登录面补全）」项 3）；`mount-settings.mjs` 团队读数注入改指新档；`mount-settings-team.mjs` 净删。
7. **判据（机检 ∥ 真机）**——机检 = 单元测试档（路由屏两卡树 ∥ 零预选 ∥ 换取（点团队卡 ⇒ 团队表单在场 ∧ 路由屏退场——同屏不叠层）∥ 回退（route 在场 ∧ 已填保留 ∧ 密码格空）∥ 本地路逐字等价（负控）∥ `teamAdminBody` 零按钮）；真机 = **T-DSK69**（§5）；通道 **+1**（`team:verify`——白名单 **+1**；单源 = `docs/desktop/design/IPC.md` §2）。
8. **边界**——不改既有步 1–3 语义（本地路零改）∥ 不改 `team login` argv 面 ∥ 不改核 ∥ 通道 **+1**（`team:verify`——白名单 **+1**；单源 = `docs/desktop/design/IPC.md` §2）∥ 零新变量 ∥ 零新断点 ∥ 样式落点 = `settings.css`（路由屏两卡 ∥ 就地面板两族）。

### 2.23 首启向导保存 ∥ 校验面收正批注

**批注（首启向导保存面收正）**：**首启向导「首配保存面」四项 + ⑤ 校验面一项**（#207 上抛——向导步 1「校验」钮读数零渲出面）；来源 = 网友报障 + 父侧核因实据；
需求 = 需求卷 `docs/desktop/requirements/SETTINGS.md` **D11** 判据补「首启配置三保真」（① 点得着 ∥ ② 存得下 ∥ ③ 不退空 ∥ ④ 校验看得见）；决策单源 = 本档 §1 **KD-79**（保存面四项）∥ 本注**项 8**（校验面）；通道 ∥ 载荷 ∥ 核语义零新（下述皆既有面收正）。

1. **① 保存钮提级（唯一写盘钮显著可辨）**——向导步 1 表单提交钮改类 `.wizard-save`（新控件族成员 = 强调形：`border-color: var(--accent)` ∥ `color: var(--accent)`——与 `.wizard-next` / `.wizard-finish` 同形）；
   `channelFormTree` 钮两参定形：**词键** = 既有注入位 `form.submitKey`（`thincoder-desktop/renderer/views/settings-controls.mjs:154`——缺省 `settings.save`；向导步 1 传 `wizard.saveAndNext`）∥ **钮类** = `submitClass`（本次增——缺省 `settings-submit` ⇒ 弹窗径零变）；
   落点 = `thincoder-desktop/renderer/views/settings-controls.mjs`（参）∥ `thincoder-desktop/renderer/views/onboarding.mjs`（步 1 调用点）∥ `thincoder-desktop/renderer/settings.css`（基形组 `:75-89` ∥ 强调组 `:96-100` ∥ cursor 组 `:101-110` ∥ `align-self` `:259`——各 +1 选择器）；
   **控件族 = 9**：**次级 6** ＋ **强调 3**（`.wizard-next` ∥ `.wizard-finish` ∥ **`.wizard-save`**）——逐件点名 = `docs/desktop/design/UI.md` §1「批注（外壳视觉降噪 · D24）」项 5（同拍随正）。**不发填充形**。

2. **②③ 合并钮「保存并继续」（步 1 前向唯一径）**——表单提交钮词键 = `wizard.saveAndNext`（zh「保存并继续」∥ en "Save & continue"）；**②∥③ 关系 = 合并**：合并后 ② 的保证「已填不丢」由构造成立。逐态行为：

   | 态 | 「保存并继续」行为 |
   |---|---|
   | key 空 | **零写前进**（无「已填」可丢——② 判据不触发；「零输入可走」性质保持；未配置结局由 ④ 兜底） |
   | key 非法（校验未过） | **照存 + 前进**（KD-11：探不通仍可保存——口径零动） |
   | 已存过 | **同路重发**（核保存语义零动；注：会话内「已存过 ⇒ 回步 1」不可达——向导无回退径，护栏回跳仅在零写盘时出现） |
   | 未存但非空 | **先存后进**：写成功 ⇒ 进模型步；写败 ⇒ **原地留步** + 失败串（零静默、零乐观前进） |

   接线 = `thincoder-desktop/renderer/mount-onboarding.mjs` `submitAndContinue`（自读表单 `key`：空 ⇒ 直进 ∥ 非空 ⇒ `submitChannel` ⇒ 返回 `true` 才进）；
   `submitChannel` 成功径 `return true`（`thincoder-desktop/renderer/mount-settings-exits.mjs` 唯一 +1 行为行；弹窗径 `void` 消费零变）；步 1 尾控件「下一步」退场（`footNode` 步判 `step < 3` ⇒ `step === 2`；步 2「下一步」零改）；`nextStep()` 步 1 支删（不可达——防双径漂移）。

3. **④ 完成护栏（未配置不静默退场）**——`finishWizard` 复读 `configured`：**已配** ⇒ 照退（零改）∥ **未配** ⇒ 不退场 + 就地护栏：
   - 状态 = `settings.wizard.finishBlocked` 旗（布尔；`patchSettings` 直写——沿 `wizard.notice` 先例，`store.mjs` 零改；旗随任意步写收束 = `setStep` 单点清）；
   - 形 = `div.wizard-finish-guard`（锚 `[data-finish-guard]`；提示语行承失败面色彩语汇——`.wizard-notice` 同值组并入 + `flex-direction: column`）+ 两钮：
     **「去保存渠道」**（`data-action: "wizard:guardBack"` ⇒ 步 1 + 清旗）∥ **「仍要退出」**（`data-action: "settings:close"`——复用既有 `dismissWizard` 出口，单一实现）；
   - 词 = `wizard.finishGuard`（zh「尚未保存任何配置——请先保存渠道，或选择『仍要退出』稍后再配置」∥ en "Nothing has been saved yet — save a provider first, or exit and configure later."）；
     钮词 = `wizard.finishGuardGo`（zh「去保存渠道」∥ en "Save a provider"）∥ `wizard.finishGuardExit`（zh「仍要退出」∥ en "Exit anyway"）；
   - 退路：**✕（恒在场）∥ 零 Esc ∥ 零背板**（沿现行为——向导零 Esc 绑定——实读 `thincoder-desktop/renderer/views/onboarding.mjs` 档头句）；
   - 与「以后再说」出口（§2.22 项 4）的关系：**「以后再说」= 显式退场（零改）**——④ 只收「完成」的静默退场径，不撤任何既有出口；护栏「仍要退出」= 与 ✕ / 以后再说 同语义（`dismissWizard`），差异仅在时机（被拦后二次确认）。

4. **词表**——`thincoder-desktop/renderer/i18n.mjs`：删 `wizard.save`（两语——消费归零 ⇒ 键面随退，零残键）；增 4 键 × 两语 = `wizard.saveAndNext` ∥ `wizard.finishGuard` ∥ `wizard.finishGuardGo` ∥ `wizard.finishGuardExit`（净 +3——合并表 **349**）；
   en 零 CJK；`settings.save`（多面共用词）零动；**校验面（⑤ · #1278）零新键**——复用既有五键（`settings.providers.verify` ∥ `.ok` ∥ `.fail` ∥ `.okShort` ∥ `.failShort`——实读 `thincoder-desktop/renderer/i18n-settings.mjs:65-69`）⇒ 链不变（**349**）。

5. **判据（机检 ∥ 真机）**——机检 = 单元测试档（拟——**六用例**：构树 ∥ 逐态接线 ∥ 护栏 ∥ 弹窗负控 ∥ 词表 ∥ **校验消费**（项 8——树面四径 + 投影对拍 + 共序负控））；真机 = **T-DSK70**（§5——含 ⑧⑨ 校验用例）。

6. **边界**——首启两路（团队 ∥ 本地）的路由与流程结构 ∥ 设置页其余段（七段值面语义）∥ `provider:verify` 探活口径（KD-11）∥ 核 ∥ CLI ∥ VSC ∥ IPC 通道与载荷（零新通道）∥ `.settings-submit` 次级族本体（弹窗 ∥ 行内 ∥ 路由屏各径）零动；**⑤ 校验面另列**——设置面既有校验反馈本体零动（向导 = 同源复用，非复制）∥ 零新通道 ∥ 零新词键 ∥ 零新 CSS ∥ 零新状态（不立独立「校验中」面——在飞窗落 `null` 值）∥ 零行名匹配（向导单钮面——见项 8）。

7. **登记 ∥ 上抛（如实）**——① 向导步 1「校验」钮读数无渲出面（`settings.verify` 切片在向导树零消费——实读 `thincoder-desktop/renderer/views/onboarding.mjs:154` `verifyControl(null, handlers)` ∥ `wizardModel` 不含 `verify`）——**已裁入本次**（用户 2026-10-11 13:41「校验也修」）：落形 = 本注**项 8**（向导树消费 `verify` 切片——结果就地可见）。

8. **⑤ 校验看得见（向导步 1「校验」结果就地可见）**——接线 = 向导树消费既有 `settings.verify` 切片（**零第二份状态**）：
   `thincoder-desktop/renderer/views/onboarding.mjs` `wizardModel` 携 `verify` 投影（同源 = `thincoder-desktop/renderer/views/settings.mjs:172`——取值即 `settings.verify` 对象，缺 ⇒ `null`）；`channelBody` 以该投影归一态值（`"ok"` ∥ `"fail"`；kind 表外 ⇒ `null`——零假造），
   实参形 = `verifyControl(null, handlers, verifyState)`（第三参 = 轮六态参——`views/settings-controls.mjs:170`，**核件零改**）；钮后渲结果明细行（下）。
   **三态逐值（与设置面渠道段同源——单源 = 本档 §2.12 项 1）**：① **未校验** = `null`——钮词「校验」（`settings.providers.verify`）；**含「校验中」窗**（点后旧读数先清、新读数未落——`mount-settings-exits.mjs:133` 先写 `verify: null` 再发；**不立独立「校验中」面**）∥
   ② **已成** = `"ok"`——钮词短形「校验通过」（`.okShort`）+ 锚 `data-verify-state="ok"` + 明细行（`.ok`——「校验通过 · N 个模型」）∥ ③ **已败** = `"fail"`——钮词短形「校验失败」（`.failShort`）+ 锚 + 明细行（`.fail`——「校验失败：原因」，原因经 `reasonWord`）。
   **同源复用（非复制）**：明细行 = 渠道段 **`verifyNode`**（`views/settings-sections-providers.mjs:37`——出**导出面**供向导取用（零行为改）；锚 `[data-verify]` + `.settings-verify` 既有样式 `thincoder-desktop/renderer/settings.css:198-201`；**单源 = §2.12 项 1**——该条含向导径消费面句）；
   **`fallbackVerifyNode` 不用**（无行回退件——绑定 `section.rows` 匹配，向导单钮面零行域 ⇒ 不适用）；向导径**零行名匹配**（读切片即渲）。
   **切预设后旧读数 = 保留**（显式口径；语义 = 「上次校验读数」，沿 §2.12 留存口径——归属最近一次「校验」动作，不随渠切换失效）：① 切预设 ⇒ 旧读数照留（零实现改）∥ ② 起手点校验 ⇒ 先清后落（`verify: null` 在飞窗）∥ ③ 保存成 ⇒ 同拍清（`mount-settings-exits.mjs:120` 零改）∥ ④ 保留态直点「保存并继续」⇒ 不拦写（零互锁）。
   **与「保存并继续」共存序（裁定）**：两条径**零互锁**——校验只出读数、不拦写（KD-11 延伸）：校验在飞 ∧ 点「保存并继续」⇒ 保存照走自身径（空 key 零写直进 ∥ 非空先存后进）；
   保存成 ⇒ 既有成功径同拍清读数（`mount-settings-exits.mjs:120`——零改）；在飞校验晚回 ⇒ 读数照落切片（无渲出面时零显——「上次校验读数」语义，零新增清理）。
   **接线零改面**：`mount-onboarding.mjs` 零改（`verifyChannel` 注入 `:44` ∥ `onVerify` 接线 `:172`）∥ `mount-settings-exits.mjs` 零改（`verifyChannel` 既有 `:125-141`）∥ `store.mjs` 零改（切片初形 `:122`）∥ 重绘随既有订阅（`SETTINGS_KEYS` 含 `settings`——`mount-settings.mjs:52 ∥ :264-269`）。
   **判据**：正常 = 点「校验」⇒ 态转（短形词 + 锚）+ 明细行就地可见 ∥ 边界 = 在飞重复点 ⇒ 同路重发（零守卫——完成序末写者胜；同源零改）∥ 错误 = 探不通 ⇒ fail 读数（原因句在）+ **保存零阻**（KD-11）；
   机检 = 单元测试档**用例六**（树面四径 + 投影对拍 + 共序负控）；真机 = **T-DSK70 ⑧⑨**（§5）。
   **边界**：零新通道 ∥ 零新载荷 ∥ 零新词键 ∥ 零新 CSS ∥ 零新状态 ∥ 探活口径零动（KD-11）∥ 设置面既有校验反馈本体零动；`presets` 空（无渠可选）径 = 既有表单门（`report` ⇒ 占槽期落 `wizard.notice`——实读 `mount-settings.mjs:126`）+ 零切片写（钮零变化——既有面，非本增量引入）。

### 2.24 模型选择归位批注

**批注（模型选择归位）**：用户 2026-10-15 23:34 走查「设置页上不应该出现模型选择，模型选择应该归会话界面，放在设置页上很别扭」+ 23:53「认可」。
决策单源 = 本档 §1 **KD-80**；需求回指 = 需求卷 `SETTINGS.md` **D37** ∥ **D39**（信息架构）∥ `docs/desktop/requirements/COMPOSER.md` **D6**（会话选定写回）；契约面 = `docs/desktop/design/IPC.md` §2「会话级偏好注」项 8 ∥ `docs/desktop/design/COMPOSER.md` §2 批注（会话选定写回）。

1. **面形（撤场）**——设置页段闭集 **八 ⇒ 七**：`SECTIONS` 去 `model` 行（`thincoder-desktop/renderer/views/settings.mjs:45`）；段体分派支去（`views/settings.mjs:287`）；`modelBody` 净删（`views/settings-sections.mjs:99-101`——**向导不经本函数**）；`settings.section.model` 词键两语净退（`renderer/i18n-settings.mjs`——消费面归零 ⇒ 零残键）。
   **保留面（点名）**：`modelHeadNode` ∥ `modelChoicesTree` ∥ `modelRowNode` ∥ `modelIdOf` ∥ `useModel` 出口 ∥ `loadModels` ∥ `settings.model` 切片 ∥ `SETTINGS_KEYS`——全在（向导步 2 + agent 段候选面共用）。
2. **闭集随动**——`SCOPES`（`renderer/mount-settings.mjs:59`）自 `SECTIONS` 派生：十一 ⇒ **十**；`MODAL_READS`（同档 `:66-76` 十一行）去 `model` 行：十一 ⇒ **十行**；`settings.modal` 闭集十值（`store.mjs` 注释级随正）；菜单闭集 `SETTINGS_GROUPS` 六名零动（`src/main/app-menu.mjs` 零改）。
3. **写面（零新机制）**——`defaultModel` 写入面三处：**会话选定写回**（`src/main/agent-host.mjs` `setPrefs` ⇒ `src/main/settings.mjs` `carryoverDefaultModel`——既有）∥ **向导「采用」**（`renderer/mount-settings-exits.mjs:165` `useModel`——失败串 scope 字面由 `model` 改 `panel`：段名已不存在）∥ 迁移（核）。**零新通道 ∥ 零新载荷 ∥ 零新推送**。
4. **UI 决策（全部落定）**——① 设置页**零「模型」段**（无残留标题 ∥ 无空段）；② 模型选择入口 = 输入区控件行模型钮（两级菜单）+ `/model` 斜径（与钮同菜单同一函数——`docs/desktop/design/COMPOSER.md` §2）；③ 选定 ⇒ 同拍写回 `defaultModel`（会话槽写照旧——新会话起点随最后一次显式选定）；④ 向导步 2 ∥ agent 段子代理模型槽 ∥ advisor 档枚举形态零动；⑤ **零新变量 ∥ 零新断点 ∥ 零新 CSS**（纯减面）。
5. **VSC 对位（同处置）**——设置面 Providers 卡「默认模型」行撤场（`thincoder-vscode/webview/settings-providers.js:53-59 ∥ :63-88 ∥ :109-119 ∥ :158`）；
  词键三退 × 两语（`settings.defaultModel` ∥ `.defaultModelTitle` ∥ `settings.pickModelEmpty`——`locales/{en,zh}.json`；`settings.notConfigured` 保留 = 渠道行/弹窗在用；
  **`settings.pickModel` 保留** = 保留面消费者在册：会诊添加弹窗选模型钮 ∥ 模型槽钮文案（`thincoder-vscode/webview/settings-consult-dialog.js:79` ∥ `thincoder-vscode/webview/settings-models.js:124`）——按 §1 **KD-80** ⑥「咨询顾问 ∥ 子代理模型槽零触」；删则两处渲染裸键名）；
  `saveAgentSettings` 载荷 `defaultModel` 支净删（`src/extension/settings-panel-write.mjs:169-172` + `:177` 探——消费面唯一生产者已撤）；
  **banner 动作钮重指会话级模型菜单**（`webview/ui.js:88-96` `onChoose`——`WEBVIEW.md` §4.8 `:207`「钮不开会话级模型菜单」句已翻转；由 = 撤设置面模型面后原指向成死端，而用户的定音即「模型选择归会话界面」）；会话选定写回链零动（`src/extension/panel-messages.mjs:234-266` ⇒ `carryoverDefaultModel`）。
6. **受影响文件（口径 = 内容行数——文末换行不计；实读 2026-10-16）**：

| # | 文件 | 现行 ⇒ 预期 |
|---|---|---|
| 1 | `thincoder-desktop/renderer/views/settings.mjs` | **454 ⇒ ≈452**（−导入 `modelBody` ∥ −`model` 分派支 ∥ 注释随正——含档头「八段」⇒「七段」） |
| 2 | `thincoder-desktop/renderer/views/settings-sections.mjs` | **101 ⇒ ≈96**（`modelBody` 净删） |
| 3 | `thincoder-desktop/renderer/mount-settings.mjs` | **306 ⇒ ≈305**（`MODAL_READS` −1 行 ∥ 注释随正） |
| 4 | `thincoder-desktop/renderer/mount-settings-exits.mjs` | **312 ⇒ 312**（`useModel` 失败 scope 字面改 `panel`） |
| 5 | `thincoder-desktop/renderer/i18n-settings.mjs` | **216 ⇒ ≈214**（`settings.section.model` 两语净退——两语各 −1 键；实读 `:38` ∥ `:133`） |
| 6 | `thincoder-desktop/renderer/store.mjs` | **374 ⇒ 374**（结构不变 · `settings.modal` 闭集注释十一 ⇒ 十随正——实读 `:117`） |
| 7 | `thincoder-vscode/webview/settings-providers.js` | **193 ⇒ ≈139**（行 HTML + hint 节点 ∥ `_setDefaultModel` :53-59 ∥ `_defaultModelMenu` :63-88 ∥ 绑定 :158 ∥ 注释全退） |
| 8 | `thincoder-vscode/src/extension/settings-panel-write.mjs` | **223 ⇒ ≈215**（载荷支 :169-173 + 探支 :177 净删——消费面唯一生产者已撤） |
| 9 | `thincoder-vscode/webview/ui.js` | **255 ⇒ ≈256**（`onChoose` 出口重指 + 注释随正） |
| 10 | `thincoder-vscode/locales/en.json` ∥ `zh.json` | 各 **353 ⇒ 350**（−3 键 × 两语——`settings.pickModel` 保留；两语键集相等机检） |
| 11 | 单元测试档（两档 · 拟） | desktop（**六用例**：段闭集七段 ∥ `SCOPES` 十 ∥ `MODAL_READS` 十行 ∥ 分派零 `model` 支 ∥ 词键零残 ∥ 写回链——会话选定 ⇒ `defaultModel` 同拍在场 ∥ 同值重选 ⇒ 零写（负控））∥ VSC（三用例：卡树零 `#prov-defaultmodel-row` ∥ `_defaultModelMenu` 零在场 ∥ banner `onChoose` 指向会话菜单）；**用毕即删（零留存）** · 不进集成测试树 |
| 12 | 触及的在册机检族（设置族 ∥ 设置菜单组项族） | 零留存纪律下**无留档**（`thincoder-desktop/test/files.mjs` = 空清单——2026-09-28 全清重置；盘上仅 `.thincoder/tmp/**` 暂存副本，不参与机检）⇒ 无「变红面」，与「集成面零新增」不抵；实施期按当期实读重建（档头注 + 收口互指——沿 `docs/desktop/design/MENU.md` §6 **DJ** ② 先例） |

7. **判据（机检 ∥ 真机）**——机检 = 上表第 11 行两档单元测试档（树面 ∥ 导出面 ∥ 源面锁）；**段节点锚 = `data-section`**（实读 = `thincoder-desktop/renderer/views/settings.mjs:264` `props: { class: "settings-section", "data-section": section.name, "data-state": section.state }` ⇒ `[data-section="model"]` 零在场断言非空判——锚实名在册）；
  真机 = **T-DSK71**（§5）∥ VSC 侧机检 + 冒烟（`thincoder-vscode/test/files.mjs` 清单内档——单源 = `docs/vsc/design/SETTINGS.md` §2.2 ∥ `docs/vsc/design/WEBVIEW.md` §4.8）；
  **离线不可产面**（真渲染视觉 ∥ 真 provider 往返）= 人工走查 + 父侧真跑闭合（D16 义务）。
8. **边界**——咨询顾问 ∥ 子代理模型槽（角色配置——非选择面）∥ 首启向导模型步 ∥ `session:prefs` 三值居所语义 ∥ `loadModels` 读写链 ∥ 核 ∥ `thincoder-render-core` ∥ CLI ∥ webui ∥ 迁移面零触；零新通道 ∥ 零新载荷 ∥ 零新变量 ∥ 零新 CSS。

## 3. 文件账（本域）

### 3.1 本端文件清单与行数预算（设置族行）

| 文件 | 行数 | 说明 |
|---|---|---|
| `thincoder-desktop/src/main/settings.mjs` | **297** | 设置写面（`config:write`——键白名单仅 `locale`）+ 模型面（`model:list`——**逐模型元素投影 `{ id, effortEnum, thinkOff }`**：主进程引核 `specForModel(model).reasoningEffortEnum` / `thinkOffPath(spec)` = 零副本，KD-18；**模型菜单全渠**：`modelCatalog()` 全渠扇出处理体（`hasKeyOf` 渠滤 + `Promise.allSettled` 逐渠核探针 + `unavailable` 诊断项）+ `modelList` 探针径对齐（U1——过代理 ∕ 落账；回执行逐字零变）；单源 = `docs/desktop/design/IPC.md` §2「模型清单注」）+ agent 参数面板（`settings:agent`）——三面共用核 `loadConfig` / `writeConfigAtomic`（零自写盘）；patch 清除面（`null` ⇒ 删键）· slot 权威键拒（`slot-authority`）· advisor 档 helper 单源（`applyAdvisorEffort`）；`indexStatus()` 回执透传 `dbBytes` ∥ `origins`（核只读出口——端侧零 SQL） |
| `thincoder-desktop/src/main/providers.mjs` | **311** | provider 族**八通道**（`provider:list` / `save` / `remove` / `verify` + **四增**：`setKey` / `delKey` / `models` / `setProxy`——值面住核，端侧零形状构造；S3 写后探单点）；`provider:save` 补写支（`defaultModel` 仅缺失——设计面 KD-5） |
| `thincoder-desktop/src/main/mcp-servers.mjs` | **262** | MCP 族**六通道**（`mcp:list` / `save` / `remove` / `tools` + **两增**：`update`（原位替换——仅落盘） ∕ `reconnect`（先断后连）——探活失败 ⇒ 零写盘） |
| `thincoder-desktop/src/main/settings-values.mjs` | **106** | 设置族值面 ∕ 遮罩族（`MASK = MASKED`（**核单源**——S13 import 核 `thincoder-core/agent-tools/settings.mjs`）∕ 叶展平 ∕ 点分路径写——自 `settings.mjs` 拆出） |
| `thincoder-desktop/src/main/config-watch.mjs` | **41** | config.json 外部写盘感知落子壳（事件源；去抖 ∕ 自写抑制在核件） |
| `thincoder-desktop/src/main/index-status.mjs` | **72** | 语义索引面处理体（`index:build` ∕ `index:status` 两通道）；**#697**：`readIndexCounts` 透传 `dbBytes` ∥ `origins`（KD-69） |
| `thincoder-desktop/src/main/settings-env.mjs` | **93** | 主侧 env 族处理体（`settings:env` 读 ∕ 写 ∕ TestProxy 三支——写经核 `writeConfigAtomic`；**S17**：shell 候选 = 核单源 `thincoder-core/shell-candidates.mjs` 薄壳 re-export） |
| `thincoder-desktop/src/main/settings-tools.mjs` | **79** | 主侧 tools 族处理体（`settings:tools` 读 ∕ 写两支——密钥值零下发） |
| `thincoder-desktop/renderer/views/settings.mjs` | **454 ⇒ ≈452** | 设置面七段（**KD-80**：八 ⇒ 七——「模型」段撤场；段体族住 `thincoder-desktop/renderer/views/settings-sections*.mjs`；模型候选消费随 `model:list` 元素形——逐项 `.id`，随动一行；控件族 ∕ 空态 ∕ 确认门 ∕ 拒码词键——形单源 = 本档 §2.2「批注（设置面余面 + 首屏引导门）」） |
| `thincoder-desktop/renderer/views/settings-sections.mjs` | **101 ⇒ ≈96** | 设置面段体面（渠道 / MCP 两体 + 出档段体 re-export（**KD-80**：`modelBody` 净删——两导出面保留）——自 `thincoder-desktop/renderer/views/settings.mjs` 拆出〔拆分落形 · 300 行层 · 零语义变化〕；导出 `modelHeadNode` / `modelChoicesTree` 供首启向导第二步复用（单一 owner）——零 import 反向〔无环〕） |
| `thincoder-desktop/renderer/views/settings-agent.mjs` | **193** | 设置面 agent 段体（具名控件表 `NAMED_FIELDS` + `agentBody`——**纯具名**（泛化编辑器全消——#635① · 2026-10-04：桌面同 VSC）；子代理模型槽六件 ∕ advisor 档枚举 ∕ guard 开关） |
| `thincoder-desktop/renderer/views/settings-controls.mjs` | **193** | 设置面两导出面（`channelFormTree` ∕ `verifyControl`——渠道段与向导第二步共用单 owner；拉取模型控件 ∕ 预设标签形） |
| `thincoder-desktop/renderer/views/settings-sections-env.mjs` | **129** | 设置面 Environment 段体（proxy ∕ shell 两子节 + TestConnection） |
| `thincoder-desktop/renderer/views/settings-sections-mcp.mjs` | **261** | 设置面 MCP 段体（行 + Tools ∕ Test 两展开面 + 编辑 ∕ 重连钮与结构化三型表单；**#1036**：env ∥ headers = 行式键值行件——§2.17） |
| `thincoder-desktop/renderer/views/settings-sections-models.mjs` | **186** | 设置面 Consultation & Advisor 段体（consult 行族 ≤5 + advisor 两 picker） |
| `thincoder-desktop/renderer/views/settings-sections-providers.mjs` | **212** | 设置面渠道段体（`providersBody` + 行族：两行卡 ∥ 动作簇 ∥ 编辑态 ∥ 第三行——自 `thincoder-desktop/renderer/views/settings-sections.mjs` 出档；决策单源 = 本档 §1 **KD-66**） |
| `thincoder-desktop/renderer/views/settings-sections-tools.mjs` | **208** | 设置面「工具与服务」段体（embedding ∕ websearch 键行 + 索引状态行 + **S12** index 空态（`no-key`））；**#697**：索引状态行增两读（库大小 ∥ 逐 origin 行数——缺位 ⇒ 零节点） |
| `thincoder-desktop/renderer/views/onboarding.mjs` | **307** | 首启向导（无终端可完成；闸 = `config:read` 回执 `configured`（配置档存在性）——形态单源 = `docs/desktop/design/UI.md` §1 首启向导行；**登录面补全** 首屏两路——§2.22） |
| `thincoder-desktop/renderer/mount-settings.mjs` | **306** | 设置面 / 向导接线出档（自 `app.mjs` 拆出——拆分落形；通道接线与表单装配，视图构树住 `thincoder-desktop/renderer/views/settings.mjs` / `thincoder-desktop/renderer/views/onboarding.mjs`；读数供给 ∕ 出口 ∕ 段出口三族另档 = 下行四行；**模型菜单全渠**：`onProvidersChanged` 注入转口；**KD-80**：`MODAL_READS` 十一 ⇒ 十行 ∥ `SCOPES` 派生十） |
| `thincoder-desktop/renderer/mount-settings-reads.mjs` | **210** | 设置面七段读数供给族（各段 load 面 + 激活渠道投影）——候选改由 `model:list` 切片派生（设计 +≤8 预算未用） |
| `thincoder-desktop/renderer/mount-settings-exits.mjs` | **312** | 设置面出口族 + 写路辅助（形式取值 ∕ Esc 关闭绑定；**模型菜单全渠**：deps 解构 + 两写成功点调用——`provider:save` ∕ `provider:remove` ⇒ `onProvidersChanged`；渠道段出口出行——见 `mount-settings-segments-providers.mjs`） |
| `thincoder-desktop/renderer/mount-settings-segments-mcp.mjs` | **327** | 设置面 MCP 段出口族（增 ∕ 改 ∥ 编辑 ∥ 类型切换 ∥ 移除 ∥ 工具 ∥ 探活 ∥ 重连 + **kv 行令牌两出口**——自 `mount-settings-segments.mjs` 出档；缝 = 同形工厂 `create*Exits(deps)`；装配点 `mount-settings-exits.mjs` 装配即合并——单一 `handlers` 表对外零改） |
| `thincoder-desktop/renderer/mount-settings-segments.mjs` | **164** | 设置面段出口族（env ∥ 工具与服务；**#1036**：MCP 族出档 `mount-settings-segments-mcp.mjs`） |
| `thincoder-desktop/renderer/mount-settings-segments-models.mjs` | **192** | 设置面 models 段出口族（consult ∕ advisor 八出口） |
| `thincoder-desktop/renderer/mount-settings-segments-providers.mjs` | **161** | 设置面渠道段出口族（S1 ∕ S2 ∕ S5 六出口——自 `mount-settings-exits.mjs` 按族续拆，债注③预案落形；两形提交 ∕ 钥存 ∕ 取消径三处声明缝） |
| `thincoder-desktop/renderer/mount-settings-segments-agent.mjs` | **98** | 设置面 agent 段出口族（S10 ∕ S11 ∕ S14b 出口与单键 patch 写路——**即改即存**（零保存键：泛化批净删；写面 = `namedOut` 单键 patch）） |
| `thincoder-desktop/renderer/settings-confirm.mjs` | **80** | 设置面删除确认件（不可复得类四门前置确认——`.auto-confirm` 族复用 · 零新 CSS；`onConfirm` = 开框时捕获闭包；形对位 VSC `settings-widgets.js:77-105`） |
| `thincoder-desktop/renderer/settings-modal.mjs` | **70** | 设置组弹窗宿主（背板 z-20 ∥ 居中卡 z-21；挂 `document.body`——沿 `settings-confirm.mjs` 先例；决策单源 = 本档 §1 **KD-68**） |
| `thincoder-desktop/renderer/settings-modal.css` | **51** | 设置组弹窗样式（不进 `settings.css`——在册越线档零触） |
| `thincoder-desktop/renderer/mount-onboarding.mjs` | **235** | 向导接线族（自 `thincoder-desktop/renderer/mount-settings.mjs` 拆出——`presetValue` / `pickDir` / `nextStep` / `finishWizard` / `wizardHandlers`；共享项 `submitChannel` / `verifyChannel` / `loadModels` 留原档 ⇒ deps 注入）；通道面 = `docs/desktop/design/IPC.md` §2 设置族注；形态单源 = `docs/desktop/design/UI.md` §1 首启向导行 |
| `thincoder-desktop/renderer/settings.css` | **357** | 设置面板 / 向导样式（分档理由 = `styles.css` 284 贴 300 层——沿 `chat.css` / `pool.css` 先例）；**主题钮族（D33）带上**——次级键族成员（计数镜随 #713 收口以 `docs/desktop/design/UI.md` §1 为单源） |
| `thincoder-desktop/renderer/views/settings-sections-team.mjs` | **143** | 设置面团队段体 —— 卡降管理面（label ∥ 详情；零登/退）；登/退形（`teamBody`）迁就地面板（`mount-team.mjs` 消费） |
| `thincoder-desktop/src/main/team.mjs` | **46** | 团队通道主进程处理体（核 `team.mjs` 转口；+verify 转口） |
**行数面机检**：`checkConfig.lineCounts`（`PROJECT-MANIFEST.json`，运行根单读）**逐条声明节域——本表为其一**（本域值行单源）；后续本域新档由落盘批在本表补值行，`docs/desktop/design/PROJECT.md` §4.1 同拍补指针行（沿 §4.1 纪律）。

## 4. 验收回指（本域需求条目 · 判据全文）

| 需求 | 机检判据（点回需求卷） | 验证 |
|---|---|---|
| **D7** | provider 增删 + key 校验 + preset 三协议 + i18n 两语各往返（`provider:*` 四通道 + `config:write` 的 `locale` 键） | T-DSK8 |
| **D8** | 索引状态读数可达（`index:status` 读数 + `index:build` 构建两通道，核只读出口 `memoryStatus()` 随落；本端不直读核内表——单源 = `docs/desktop/design/IPC.md` §2 该两行）；记忆 / 检索**只经 agent 工具面**（无 UI 搜索框） | T-DSK9 |
| **D9** | MCP 服务器增删后工具入口状态随动（`mcp:*` 三通道 + 探活失败 ⇒ 零写盘） | T-DSK10 |
| **D11** | 无 config 时向导可完成并进入主界面；有 config 时跳过向导（闸 = 配置档存在性（读数 = `config:read` 回执 `configured`）；**入口 = 输入面板控制行 `#settings-btn`**（核件面板——`thincoder-render-core/composer/controls.mjs:51`；出口 = `openSettings`）） | T-DSK13 / T-DSK32 |
| **D16** | 两态引导在场（`no-project` ⇒ 含 `button[data-action="project:open"]` · `no-session` ⇒ 含 `button[data-action="session:create"]`）+ 控件在场 ⟺ 句柄在场（零假按钮）+ 空态分态（`none` ⇒ 零块节点 + 引导节点〔`data-guide`〕· `no-message` ⇒ 复用既有空态节点）——判据四值 = `chatModel.guide`；单源 = `docs/desktop/design/UI.md` §1「首启空白态引导注」；机检 = 随批单元证据 | T-DSK32 |
| **D37** | 设置面样式对 VSC 端对齐——收正全七段；功能面不删 ∥ 七段信息架构 ∥ 布局面零动——判据 = 本档 §2.5；真机 = 本档 §5 `T-DSK58` | T-DSK58 |
| **D24**（设置面面） | 外壳视觉降噪——设置面映射 9 面（6 改 + 3 保留）；主条 = `docs/desktop/design/UI.md` §1「批注（外壳视觉降噪 · D24）」；本档半边 = §2.1（外壳降噪句）+ §2.5 项 1 ③（卡界让位） | 本档 §2 各节 |

**设置面样式收正批（验收 · 需求 D37）**：需求回指 = **D37**（设置面样式对 VSC 端对齐——收正全七段；功能面不删 ∥ 七段信息架构 ∥ 布局面零动）；设计单源 = 本档 §1 **KD-66** ∥ 本档 §2.5。
机检 = 单元测试档（**已建成 · 219 行 · 五组用例 · 9 用例**：① 行结构断言（渠道行平 node 直测：两行结构 ∥ 动作簇四件序 = 修改 ∥ ✕ ∥ 校验 ∥ 移除名（现盘序——本档 §1 KD-66 ②））；
② 断行恒定（`thincoder-desktop/renderer/settings.css` 源扫：`.settings-row` `nowrap` ∥ 省略四件 ∥ 原因句豁免（`[data-unavailable-reason]`——置位 = `thincoder-desktop/renderer/views/settings-sections-providers.mjs:81`）保 `white-space: normal`；
补则——MCP 展开面豁免（`.settings-mcp-detail` 域值面 `white-space: normal`——行族通则本体零动））；
③ 样式纪律（零新变量（`--` 定义数 0）∥ 零 `@media`（零新断点））；④ 拨杆形四规则在位；⑤ 卡界源扫（`.settings-row` = `1px solid var(--line)` 描边 + 圆角 `6px` 在位——用户 2026-10-02 10:27 直裁形落））；随批留存 · 不进集成测试树。
真机 = **T-DSK58**（用户实拍可比：渠道两行卡 ∥ 长 URL 省略不折 ∥ 窄窗恒定 ∥ 编辑态 ∥ 拨杆——亮 ∥ 暗两模式 ∥ 全七段行族零参差折行）；**离线不可产面**（真渲染视觉）= 人工走查 + 父侧真跑闭合（D16 义务）；测试文件随修随加——不占设计条目。

**设置菜单升级（验收 · 设置半 · 需求 D39 ∥ D38）**：需求回指 = **D39**（A 案弹窗 ∥ 七组读写/确认/失败链复用 ∥ 现有页保留 ∥ 边界三不做）；设计单源 = 本档 §1 **KD-68** ∥ §2.10（菜单侧 = `docs/desktop/design/MENU.md` §1 **KD-67**）。
机检 = 单元测试档（已建成——**波 2 用例**：④ 弹窗树结构（背板 ∥ 卡 `role=dialog`+`aria-modal` ∥ 头锚 ∥ 组体恰一组（段体平 node 直测——注入桩）∥ notice 过滤（本组 ∨ panel 显 ∥ 他组隐）∥ Esc/背板/✕ 接线在场）
  ⑤ 复用链（七组 → 段体 ∥ 读取 ∥ 出口映射在场；`settings.modal` 闭集验证；表外组 ⇒ 记错零动作；**占槽拒**——向导占槽期开 ⇒ 拒 + 记错 + 零动作）
  ⑥ 样式 ∥ 链序（`settings-modal.css`：z 20/21 ∥ 零 `--` 定义 ∥ `settings.css` 零触 ∥ `index.html` 链在 settings.css 后））；随批留存 · 不进集成测试树；
真机 = **T-DSK59**（用例行 = 本档 §5——两波合一走查）；**离线不可产面**（真渲染视觉 ∥ 真交互）= 人工走查 + 父侧真跑闭合（D16 义务）；测试文件随修随加——不占设计条目。

**模型选择归位批（验收 · 设置半）**：需求回指 = 需求卷 `SETTINGS.md` **D37** ∥ **D39**（信息架构——设置页段闭集）∥ `docs/desktop/requirements/COMPOSER.md` **D6**（会话选定写回）；设计单源 = 本档 §1 **KD-80** ∥ §2.24。
机检 = 单元测试档（拟——**六用例**：段闭集七段（`SECTIONS` 名序 = `providers ∥ agent ∥ mcp ∥ env ∥ tools ∥ models ∥ team`）∥ `SCOPES` 十 ∥ `MODAL_READS` 十行 ∥ 段体分派零 `model` 支 ∥ 词键零残（`settings.section.model` 两语零命中）∥ 写回链（会话选定 ⇒ `defaultModel` 同拍在场 ∥ 同值重选零写——负控））；**用毕即删（零留存）** · 不进集成测试树；
真机 = **T-DSK71**（§5）＋ **T-DSK64** 消费面收窄（① 项由「开设置面模型段」改「入向导步 2」——单源 = 本档 §5 该行）；**离线不可产面**（真渲染视觉 ∥ 真 provider 往返）= 人工走查 + 父侧真跑闭合（D16 义务）；测试文件随修随加——不占设计面条目。

（§6.1 本域行迁讫（D7 ∥ D8 ∥ D9 ∥ D11 ∥ D16 全文；D24 主条住 `docs/desktop/design/UI.md`——本档半边列上）。）

**设置菜单组项收窄（验收 · 设置半 · 需求 D39）**：需求回指 = **D39** 收正句（菜单组项 七 ⇒ 六；设置页面七段零动）；本次设置域零触——校验面 `SCOPES` 十名宽容（支 A 裁定——零改）；决策单源 = 本档 §1 **KD-68** ④。
机检 = 单元测试档（已建成 · 3/3 绿）用例③（弹窗仍达六组 + `model` 宽容受理——单源 = `docs/desktop/design/MENU.md` §3.4 ∥ §4）；真机 = **T-DSK59**（条目面随正——六组项）；**离线不可产面**= 人工走查 + 父侧真跑闭合（D16 义务）；测试文件随修随加——不占设计面条目。

**轻通道轮六（验收 · 设置半）**：需求回指 = **D7**（key 校验面——反馈呈现）+ **D37**（渠道段行形态——校验钮态）+ **D39**（弹窗体——头行粘顶）；设计单源 = 本档 §1 **KD-66** ② ∥ **KD-68** ① ∥ §2.12。
机检 = 单元测试档（已建成——笔一三径：匹配行本行态（`data-verify-state` ∥ 本行明细）∥ 无行渲出结果段末回退 ∥ 空态零节点）；真机 = **T-DSK58**（① 行结构——校验钮态）+ **T-DSK59**（③ 弹窗体——头行粘顶）；**离线不可产面**（真渲染视觉 ∥ 真交互）= 人工走查 + 父侧真跑闭合（D16 义务）；测试文件随修随加——不占设计面条目。

**团队段验收**：需求回指 = `docs/server/requirements/PROJECT.md` §2:31 + AC-31（跨板锚——本域机制单源 = `docs/core/design/TEAM.md` §2）；
  判据 = 本档 §2.21（段形 ∥ 闭集随动 ∥ 写面 ∥ 草稿保真）+ 单元测试档（团队登录客户端接达族（已落）——段结构 ∥ 通道三件套结构机检 ∥ 核直调 ∥ 闭集对拍（`SECTIONS` 七段 ∥ `SETTINGS_GROUPS` 六名 ∥ `SCOPES`/`MODAL_READS` 十））；
  真机 = 收口轮（登录 → 模型可用 → 退出 三段实走）；**离线不可产面**（真渲染视觉）= 人工走查 + 父侧真跑闭合；测试文件随修随加——不占设计面条目。

**登录面补全——设置域验收**：需求回指 = **D11**（首启向导两路——团队 / 本地）∥ D11 原条（闸 ∥ 零终端可完成 ∥ 幂等可重入）；设计单源 = 本档 §2.6（行）∥ §2.22（八项）。
判据 = 本档 §2.22 项 7（机检）∥ 单元测试档（团队登录入口族（拟）——路由屏两卡树 ∥ 零预选 ∥ 换取（同屏不叠层）∥ 回退（已填保留 ∧ 密码清）∥ 本地路逐字等价（负控）∥ `teamAdminBody` 零按钮）；
真机 = **T-DSK69**（§5 本次行）；**离线不可产面**（真渲染视觉 ∥ 真网络）+ 真机走查 = 人工走查 + 父侧真跑闭合（D16 义务）；测试文件随修随加——不占设计面条目。

**首启向导保存 ∥ 校验面收正批（验收）**：需求回指 = **D11** 判据「首启配置三保真」（① 点得着 ∥ ② 存得下 ∥ ③ 不退空）+ **④ 校验看得见**（需求卷 `docs/desktop/requirements/SETTINGS.md:15`）；设计单源 = 本档 §1 **KD-79** ∥ §2.23（项 1–4 = 保存面四项；项 8 = 校验面）。
机检 = 单元测试档（拟——六用例：构树 ∥ 逐态接线 ∥ 护栏 ∥ 弹窗负控 ∥ 词表 ∥ 校验消费）；随批留存 · 不进集成测试树；
真机 = **T-DSK70**（§5——①–⑦ 保存用例 + ⑧⑨ 校验用例）；**离线不可产面**（真渲染视觉 ∥ 真 provider 探活）= 人工走查 + 父侧真跑闭合（D16 义务）；测试文件随修随加——不占设计面条目。

## 5. 用例（本域）

| 用例 | 场景 | 输入 | 预期输出 | 机检 / 落点 |
|---|---|---|---|---|
| T-DSK8 | 正常 · 设置与凭据 | 新增 provider + 填 key（真调校验）→ 切换语言 | 校验通过后可用；语言切换后界面文案随动；key 落共享配置文件 | — |
| T-DSK9 | 正常 · 记忆与检索 | 让 agent 调一次记忆检索 | 工具卡显示检索结果；**界面无独立搜索框**（D8 边界） | — |
| T-DSK10 | 正常 · MCP | 添加一个 stdio MCP 服务器 | 服务器列表出现该条；其工具入口随动可见 | — |
| T-DSK13 | 边界 · 首启分叉 | ① 无共享 config ② 已有共享 config | ① 进向导并在完成后可用 ② 跳过向导直接进主界面 | — |
| T-DSK64 | 正常 / 边界 · 缺激活渠道态补设（#842） | ① `defaultModel` 缺 ∧ 双已配渠 ⇒ 入向导步 2（另例：输入区模型钮全渠菜单——设置页「模型」段已随 **KD-80** 撤场）② 行「采用」点击 ③ catalog 失败（探针不可达） ④ 无已配渠 ⑤ 缺激活渠道态入向导步 2（同链推证） | ① 段 `ready` + 全渠候选行（`provider · id`） ② `settings:agent` 写 `defaultModel=<provider>:<id>` ⇒ 回读后段转常规（激活渠出现） ③ 段 `none` + 失败面（零静默）+ 零假造候选 ④ 候选空 + 空态词（禁假造——既有） ⑤ 向导候选面 = 全渠（同一 `loadModels` 注入引用）∧「采用」⇒ 落 `defaultModel` | 单元测试档（#842 用例四：全渠候选 ∥ 采用写盘 ∥ 空 / 失败态 ∥ 向导同链） |
| T-DSK32 | 正常 · 首启空态引导（真 Electron） | 空 fixture 家（无 config ⇒ 无项目 / 无会话；另**预置**会话槽族档一枚〔`cwd` = 项目根——resume 开页落点〕）——新装首启 | ① 向导退场后：`[data-guide="no-project"]` 在场（含 `button[data-action="project:open"]`）∧ 输入框 `disabled` ② **真点**会话控制面项目钮（`button.session-project`——对话框夹具 `PROJ`，照 `docs/desktop/design/E2E-TESTING.md` §3.5 第 6 步）⇒ `[data-guide="no-message"]` ∧ 输入框非 `disabled` ③ 键入 + Enter ⇒ 输入值保留 ∧ `data-blocks="0"` ∧ console 出 `[composer] msg:send failed: `（不静默丢文本） | 机检 = 单元测试档惯例（原集成测试档 `first-run-smoke.test.mjs` 随 2026-09-28 全清重置退场——重建时按 §4.1 登记）；十序断言单源 = `docs/desktop/design/E2E-TESTING.md` §3.5 |
| T-DSK43 ④⑤ | 正常 · 小修族（设置面面 · 对齐第三批） | 设置面 agent 段具名控件 + `change` 即改即存；设置面开 ⇒ `Escape` ⇒ 关闭 | ④ 设置面 agent 段 = 具名控件 ∧ `change` ⇒ 即改即存（回执后回读同值）——离线可产；⑤ 设置面开 ⇒ `Escape` ⇒ 关闭（`[data-slot="settings"]` 清空）——离线可产（**F-Esc 判据**） | 判据载体 = 本档 §2.4；单源行（T-DSK43 全行）= `docs/desktop/design/PROJECT.md` §7（混装行——留原址） |
| T-DSK58 | 正常 / 边界 · 设置面样式收正（D37 · 真 Electron） | 真 Electron（fixture 家 `{"locale":"en"}`——`isConfigured` = 档存在）⇒ 启动 ⇒ 开设置面（`[data-slot="settings"]`） | ① 渠道段每行 = 两行卡（主行：名 + 钥面 + 动作簇（修改 ∥ ✕ ∥ 校验 ∥ 移除名）∥ 副行：`模型 · URL` + 代理开关）（**轮六**：校验钮触发 ⇒ 该行按钮 = 态短形（校验通过 ∥ 校验失败——锚 `data-verify-state`）+ 该行明细行；无行渲出结果（名不在列表 ∥ kind 表外）⇒ 段末回退）；② 长名 ∥ 长 URL ⇒ 省略不折、动作簇恒右对齐（窄窗拖至 ~800px 结构不变）；③ 钥编辑态 = 输入 + 存/消（代理 ∥ 移除 ∥ 校验暂撤——取消即回）；④ 复选控件 = 拨杆形（选中 `--accent`——亮 ∥ 暗两模式）；⑤ 全七段行族零参差折行；⑥ 全程零 `pageerror` | 机检 = 单元测试档（已建成 · 219 行 · 五组用例 · 9 用例；随批留存 · 不进集成测试树）；用例号自铸披露 = 本档 §6 **DH**（在册） |
| **T-DSK66** | 正常 / 边界 · MCP 键值行式输入（#1036 · 真 Electron） | 真 Electron：设置页 ∥ 弹窗两态——① stdio 新增：env 加两行（① `A=1` ② `TOKEN=va,lue`）⇒ 保存 ⇒ 重开编辑 ② http 新增：headers 加一行（`Authorization=Bearer x`——值含空格）∥ ✕ 删一行 ∥ 加空行不填 ∥ 类型切 http↔ws↔stdio 来回 | ① 值含逗号逐字存活（config.json `env.TOKEN === "va,lue"`）；重开回显 = 两行两格逐字 ② headers 值含空格存活；✕ ⇒ 行即摘；空行保存后消失（不落盘）；切换来回 ⇒ 已输入行不丢（令牌不复用 ⇒ 无残值复活）；零 `pageerror` | 机检 = 单元测试档（已落（实读 2026-10-10） · 四用例；随批留存 · 不进集成测试树）；用例号裁归（T-DSK66——并号裁定归号） |
| **R1** | 正常 · 一级全渠与选取（真机） | 配 ≥2 有 key 渠（含自定义） | 菜单一级行数 = 渠数 ∧ 行序 = 配置序 ∧ 每渠悬停列模型 ∧ 选取 ⇒ 槽写生效（跨端同槽复核） | 真机（父侧收口 · 桌面 + VSC 同配置对拍） |
| **R2** | 正常 · 跨端集合对照（真机） | 桌面 ∥ VSC 同 config | 桌面一级行集合 = VSC 一级行集合（集合相等——按 provider 键取集合，勿按显示文本：桌面分组标题 = 渠名 ∕ VSC = `providerLabel`） | 真机（父侧收口） |
| **R3** | 错误 · 失败渠诊断（真机） | 一渠 key 作废 | 该渠零行、零崩、控制台零静默（核落账失败项在） | 真机（父侧收口） |
| **R4** | 正常 · 会话切换随动（真机） | 会话 A/B 同渠不同模型 ⇒ 切换 | 模型钮随会话（同值回写不报错） | 真机（父侧收口） |
| **R5** | 正常 · 外部改档随现（真机） | 外部改 config（CLI 加渠） | 菜单随现（免重启） | 真机（父侧收口） |
| **R6** | 正常 · 设置面加渠随现（真机） | 设置面加渠 ⇒ 回输入区 | 菜单随现（免重启） | 真机（父侧收口） |
| **R7** | 边界 · 已配渠集 → 空（真机） | 设置面逐渠删至零 | 菜单保持现状（旧行驻留——有意边界；零崩、控制台零静默）；重新配渠 ⇒ 随推送复现（免重启） | 真机（父侧收口） |
| T-DSK59 | 正常 / 边界 · 设置菜单升级（D38 ∥ D39 · 真 Electron） | 真 Electron（fixture 家已配）⇒ 逐项走查（两波合一） | ① 菜单「设置」组在场（组名双语；条目序 = 设置… ∥ **六组项**（渠道 ∥ agent 参数 ∥ MCP ∥ 运行环境 ∥ 工具与服务 ∥ 会诊与审查——收窄（#820））∥ 维护▸（两项）∥ 关于与快捷键▸（两项））② 「设置…」⇒ **现有设置页**开（`[data-slot="settings"]` 非空——零动）③ **六组项**逐开：弹窗在场（背板 + 居中卡 + 组名标题 + ✕）∥ 内容 = 该组段（态词 ∥ 行 ∥ 表单）∥ 真操作一面（如渠道段展开编辑态 ⇒ 存/消在）∥ 渠道段校验触发 ⇒ 本行按钮态短形 + 本行明细（**轮六**）∥ **头行粘顶（轮六）**：卡内滚 ⇒ 标题 ∥ ✕ 不随体滚出④ 关三路：Esc ∥ 背板 ∥ ✕（各关后 DOM 零残留；**页未被连带关**——同开场景）⑤ 键盘：开后焦点 = ✕ ∥ Tab 可达组内控件 ∥ 卡内 Esc 不冒（页保持开）⑥ 主题切换（亮 ∥ 暗）∥ 语言切换（en ∥ zh）⇒ 弹窗随动 ⑦ 维护两项 = 原生对话框零改 ∥ 关于 = 原生面板零改 ∥ 命令与快捷键 = `/help` 流内打印零改 ∥ 帮助组零改 ⑧ 现有页两入口（⚙ ∥ footer）零改 ⑨ 全程零 `pageerror` | 机检 = 单元测试档（已建成 · 六用例；随批留存 · 不进集成测试树）；用例号自铸披露 = 本档 §6 **DI（设置半）** |
| **T-DSK68** | 正常 / 边界 · 团队段（B1 · 真 Electron） | 真 Electron（未登录态）⇒ **登录入口补全收正**（卡内登/退退场）：登/退经状态段就地面板（未登录段 ⇒ 面板三字段 + 登录钮；已登录段 ⇒ 面板详情 + 退出钮）；设置面团队段 = 管理面（label ∥ 详情——零登/退；§2.22 项 5） | ① 登录成 ⇒ `config.json` `team.token` 在场 ∧ `providers[]` 见 `team` 条目（`derived:true`） ② 面板详情行逐值（server ∥ 成员 ∥ 端标签） ③ 面板退出 ⇒ token 摘除 ∧ 条目 `apiKey` 摘 ∧ `derived` 保留 ④ 面板未登录态重开 ⇒ 密码格空（地址/用户名保留） ⑤ 错凭据 ⇒ 就地错误行（逐字同句）+ 零写盘；全程零 `pageerror` | 机检 = 单元测试档（段结构 ∥ 核直调）；真机 = 收口轮（**用例号 = T-DSK68**——并号裁定归号） |
| **T-DSK69** | 正常 / 边界 · 首启两路 + 登/退直达（真 Electron） | 真 Electron（空 fixture 家——无 config ⇒ 向导占槽）⇒ ① 路由屏两卡并排（零预选；「以后再说」在场）② 点团队卡 ⇒ 同屏换团队表单（不叠弹层）③ 错凭据 ⇒ 四句之一就地 + 停留可重试 ④ 「← 换一种方式」⇒ 回路由屏（已填保留 ∥ 密码格空）⑤ 正确登录 ⇒ 进模型步；收尾后 ⇒ 状态段 = 成员名（悬停 = 服务器）⑥ 点段 ⇒ 就地面板 ⇒ 退出 ⇒ 段回转 ⑦ 设置面团队段 = 管理面（label ∥ 详情；**零登/退控件**）⑧ 吊销桩（服务端撤 token）⇒ 重启/开面板 ⇒ 段转「已失效——重新登录」⑨ 「以后再说」用例（另跑 · 空 fixture 家——向导 ⇒ 「以后再说」退场）⇒ 主 UI 空态（无项目 ∥ 无会话）下 `team` 段在场（未登录入口——**零会话例外**；`docs/desktop/design/UI.md` §1「批注（团队登录态段 · 登录面补全）」项 1）⑩ 全程零 `pageerror` | 机检 = 单元测试档（§4 本块）；真机 = 收口轮（**用例号 = T-DSK69**——并号裁定归号） |
| **T-DSK70** | 正常 / 边界 / 错误 · 首启向导保存 ∥ 校验面（① 点得着 ②③ 保存并继续 ④ 完成护栏 ⑤ 校验看得见 · 真 Electron） | 真 Electron（空 fixture 家——无 config ⇒ 向导占槽）⇒ ① 路由屏点本地卡 ⇒ 步 1：写盘钮 = 强调形（accent 边框）+ 词「保存并继续」∧ 步 1 尾控件零「下一步」② 选 preset + 填 key ⇒ 点「保存并继续」⇒ 进模型步 ∧ `config.json` 在场（providers 含该渠）③ 另跑（空家）：不填任何输入 ⇒ 点「保存并继续」⇒ 直接进模型步（`config.json` 仍缺——零写）④ 一路到步 3 ⇒ 点「完成」⇒ 向导不退场 ∧ `[data-finish-guard]` 在场（提示句 + 两钮）⑤ 点「去保存渠道」⇒ 回步 1（护栏退场）⑥ 重走（空家）：步 3「完成」⇒ 护栏 ⇒ 「仍要退出」⇒ 向导退场（主 UI 可用——同「以后再说」语义）⑦ 已配置负控：② 保存成后直点「完成」⇒ 照常退场（零护栏）⑧（步 1 内插——① 后）选渠 ⇒ 点「校验」⇒ 钮词转短形（校验通过 ∥ 校验失败——锚 `data-verify-state`）+ 明细行就地可见（`[data-verify]`）⑨ 另跑（空家）：选渠 + 空 ∥ 错 key ⇒ 点「校验」⇒ 钮词「校验失败」+ 明细行（原因句）⇒ 点「保存并继续」⇒ 照存 + 进模型步（校验失败不拦写——KD-11）⑩ 全程零 `pageerror` | 机检 = 单元测试档（拟——六用例，含校验消费用例）；真机 = 收口轮（**用例号 = T-DSK70**——并号裁定归号） |

| **T-DSK71** | 正常 / 边界 · 模型选择归位（真 Electron） | 真 Electron：① fixture 家已配双渠 ⇒ 开设置面（`[data-slot="settings"]`）② 输入区点开模型钮 ⇒ 逐级选一条目 ③ 随后切会话（另例：同值重选） ④ 另跑（空 fixture 家）⇒ 向导步 2 点一行「采用」⑤ 设置面内搜「模型」段 | ① 段序 = `providers,agent,mcp,env,tools,models,team`（**七段**——零「模型」段；段节点 `[data-section="model"]` 零在场）② 选定后 `config.json` `defaultModel = "<provider>:<model>"` 同拍在场（同拍复扫槽档与配置档）③ 会话槽模型随会话（回写门不误伤——系统回声零写）④ 向导行「采用」⇒ `defaultModel` 落盘（既有 `useModel` 同链）⑤ 零 `[data-section="model"]` 节点 ∧ 零空段壳（验段闭集）⑥ 全程零 `pageerror` | 机检 = 单元测试档（§4 本块五用例）；真机 = 收口轮（**用例号 = T-DSK71**——并档裁定归号）；单源 = 本档 §2.24 |

（本域用例全文迁讫（T-DSK8 ∥ 9 ∥ 10 ∥ 13 ∥ 32 ∥ 58 + **R1–R7**——真机条目，模型菜单全渠）；
  批注齐平 = **模型菜单全渠注**（机检 = 单元测试档（**300** 行 · 9 用例——handler 面（真核探针径 + 本地回环 HTTP 桩）· 通道四件套结构机检 · store 纯动作 · 触发六径）；
  **不新增 T-DSK 用例号**——真机收口面，沿 flow 批「真机走查面登记」先例；**离线不可产面**（真 provider 往返 ∥ 真机交互）⇒ 人工走查 + 父侧真跑闭合（D16 义务））。
（T-DSK27（E2E 域）∥ T-DSK43 余项（外围混装）∥ T-DSK16–19 留 `docs/desktop/design/PROJECT.md` §7 原址。）

## 6. 上抛（本域）

| 行 | 项 | 类型 | 处置建议 |
|---|---|---|---|
| **CG** | **S3 行标面未携 VSC `failure` 分档**（hostBusy ⇒「宿主繁忙」+ 抑制失败句） | **裁 = 消（补做）**：桌面无宿主采样器 = **欠做**（非能力缺失）；补做三件 = `loop-sampler.mjs`（port ≈45 行）· `failure` 键贯链 · 词键（`i18n-settings.mjs`） | 单源 = 本档 §2.2 项 7（同拍收正）；判据 = 同宿主忙态两端同词 + 同抑制形 |
| **CH** | **`agent.engineering` 泛化行读面形未裁**（S14a 只裁写面——写必拒 `slot-authority` 而读面仍呈可编辑泛化行） | **裁：读面收窄**（假可供性消除；泛化行整体退役——设置面 agent 段纯具名，本项闭合） | 写面判据 = 本档 §1 **KD-49** |
| **DH** | **`T-DSK58` 用例号自铸披露 + 设置面样式收正批两项已裁**（沿 T-DSK37–T-DSK57 先例——本次自铸；若实施批 ∥ 并行批占用同号 ⇒ 请父侧并号裁定）：① 用例行随测试文件修加——不进设计面条目；② **卡界载体 = 已裁**——按 VSC 实形收（1px 描边 + 圆角 6px——`thincoder-vscode/webview/settings.css:155-159`；D24 描边归零基线全局零动——仅本卡界让位；用户裁定）；③ **拨杆形 = 已裁**——保留（**零改**限定对象 = 值面照搬 VSC（`thincoder-vscode/webview/settings.css:222-257`）；**相对现盘 = 新增四规则**（现盘复选无形——`thincoder-desktop/renderer/settings.css:213` 仅 `align-self`）；形变可逆——单点回退：删四规则还原原生复选）；**附 · 原则句**：跨端差异项后续变更两端保持同步（用户裁定「以后要改一起改」——本裁定 = 首例） | **已裁（自铸披露在册 · ②③ 两裁落）** | 单源 = 本档 §1 **KD-66**。 |
| **DM** | **需求卷设置页段数口径**：需求卷 `SETTINGS.md` D37 ∥ D39 记「设置面全**七**段」（D39 并写「设置页面七段零动」），而设计档现值与盘面均为**八段**（含「模型」段）——**两档计数相抵（改前即在）**；撤「模型」段后面页 = 七段，仅当需求句「七段」原义 = 「不含模型段的其余各段」时两档自洽 | **前抛（需求档笔 = 主 agent）**：请主 agent 核口径并回笔（若「七段」非此义 ⇒ 需求卷需收正）；本席不写需求档。本档侧：页面七段 = **KD-80** 落定 | 单源 = 本档 §1 **KD-80** ∥ §2.24 |
| **DN** | **VSC banner 动作钮「选择默认模型」重指会话级模型菜单** = **派生裁定**（已落设计：`docs/vsc/design/WEBVIEW.md` §4.8 `:204/:207` 翻转 ∥ `webview/ui.js` `onChoose`）——由 = 撤设置面模型面后原指向（`openSettings`）成死端；用户的定音即「模型选择归会话界面」（原句「显式默认口 ∥ 不依赖会话在场」由 = VSC 面板恒有会话，不成立） | **知会（已裁·可撤）**：如需保留「钮不开会话模型菜单」旧口径 ⇒ 另一路 = 罢钮（提示句留存）——请父侧裁；本席按 KD-80 ⑤ 落形 | 单源 = 本档 §1 **KD-80** ⑤ ∥ `docs/vsc/design/WEBVIEW.md` §4.8 |
| **DI（设置半）** | **设置菜单升级批设置侧披露**（菜单半 = `docs/desktop/design/MENU.md` §6 **DI**）：① 弹窗体 z 20/21（确认族 40/41 保留其上——删除确认叠序零改）；② 零焦点陷阱 = 边界（Tab 可出卡——沿确认件 ∥ 现状零陷阱）；③ 双面并存（页 ∥ 弹窗可同开；关弹窗不动页）；④ `settings.css` **≤500 ⇒ 免拆**（新样式入新档）；⑤ **需求侧已收正**：D36 动作集「五」⇒ **六**（+`openSettings`）——引需求卷 `docs/desktop/requirements/MENU.md:12` D36 行内收正句 ∥ `:19` 变更行 | 登记（披露） | 单源 = 本档 §1 **KD-68**。 |

（本域涉行（CG ∥ CH ∥ DH ∥ **DM ∥ DN**）已迁讫。）

