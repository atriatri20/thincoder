# Thincoder Server · 读数面（webui/READINGS.md）

> 本档迁自 `webui/WEBUI.md` §2.3①–⑤ 及三表归位行（2026-10-11 域内拆分；as-of）。域总览与壳面 = `webui/WEBUI.md`。

## 1. 关键决策（本面）

| # | 决策 | 理由 | 被否候选与何故否 |
|---|---|---|---|
| KD-SV-29 | **可见面二轮 = 服务端聚合/代发 + 零依赖前端**：总览落 `#/admin/overview`（admin 默认页；`#/admin` 重定向同指）；图表 = 纯 CSS 柱（零依赖零构建——KD-SV-9 不变）；健康 = 前端三态轮询（30s——共享态 + `ctx.onHealth` 订阅）；导出 = 服务端 CSV（前端 blob 下载）；key 细节 = `memberView` 单源扩展 | 图表库/框架组件被否（违 KD-SV-9 零框架零构建）；健康并入 `/api/system` 轮询被否（探活语义单源 = `/healthz`——KD-SV-23）；服务端出图被否（新增图片/HTML 面——无谓）；独立排行组件被否（聚合降序即排行——两套视图徒增重复） | 图表库 ∥ 构建步骤（零依赖纪律）· 整页轮询（重渲闪烁）· 移动端适配（不做承诺不变） |

## 2. 机制

### 2.1 可见面二轮（六面机制——功能点 15；另含后批可见面：⑥ 功能点 25 ∥ ⑦ 功能点 26）

**① 向量服务可见面**：系统页向量卡（`webui/SYSTEM.md` §2.1——admin：**配置面（地址 ∥ 模型 ∥ key——可编辑 + 保存；重启生效；草稿探活）** ∥ 可达性 ∥ snippet ∥ 用法 ∥ 试跑）∥
  用户面 = 我的用量页顶部提示条（模型名 + snippet + 用法一句——**地址/探活/试跑 = admin 面**；模型名经 `/api/system` 的 `embedding.model` 下发；**缺段（`embedding.model = null`）⇒ 整条不渲染**——成员面不呈「未配置」态；2026-10-09 embed 解耦批）∥ 用量面 endpoint 区分：明细列（存量——`usageTable` 已有「端点」列）+ 端点过滤（两用量页同参数——下拉：全部/chat/embeddings）。

**② 用量看板升级**（`#/admin/usage`——明细表之上）：

- 过滤表单增「端点」下拉；查询 = 明细 + 报表同拍刷新（同过滤面）。
- **概览卡**：请求数 ∥ tokens 合计（`summary.totals`）。
- **时间趋势（按日）**：纯 CSS 柱状图（flex 柱列 + 高度百分比——零依赖；柱 `title` = 日期/请求数/tokens；轴标 = 首末日）；数据 = `summary.trend`（服务端零填充——前端只画）；空态 ⇒ 文案（零错）。
- **聚合与排行**：按模型 ∥ 按成员两表（序号 ∥ 名称 ∥ 请求数 ∥ tokens——降序即排行；聚合与排行同数据面，不设独立组件）。
- **导出**：`GET /api/usage/export`（同过滤面）——fetch ⇒ blob ⇒ 临时链接下载（400 经错误映射展示；不用裸链接导航——错误页不劫持 SPA）。
- **明细表**：key 列显示 **key 名称**（无名 ⇒ 回退提示形）；「我的·用量」同列表同判（`dom.mjs` `usageTable` 两页共用——2026-10-12 usage-key-name 笔）。

**③ 管理总览**（`#/admin/overview`——admin 落地页）：卡集六枚——今日请求 ∥ 今日 token ∥ 成员数（`GET /api/overview`）∥ 健康（共享态——⑤）∥ 更新提示（`state.system.update.latest`：在场 ⇒ 高亮提示 + 导流系统页；缺 ⇒ 「未发现新版本」）∥ 快捷入口（成员/provider/用量/审计/系统五链）。落地页变更：admin 登录 ⇒ `#/admin/overview`；`#/admin` 重定向同指；旧页书签直达。user 面不可达（`nav` `denied` + 服务端 403 双层）。

**④ 审计/安全面**（`#/admin/audit`）：过滤表单（类型下拉（全部 + **十四型**） ∥ 成员输入 ∥ 起止时间）+ 表（时间 ∥ 类型 ∥ 操作者 ∥ 对象（与操作者同名 ⇒ 「—」） ∥ 详情——按型模板渲染（IP ∥ 维度 ∥ key 提示形 ∥ 角色 ∥ `keys`（配置变更键名清单）
  ∥ `action`/`rule`（沙盒规则） ∥ `kind`（沙盒事件） ∥ `agent_event` 行 = 专用模板（`tool · subject · 成败 · 〔截断〕 · summary`——admin-agent-awareness 批：非裸 JSON；`bash` 命令原文/读文件路径可见）
  ∥ `project_event` 行 = 专用模板（`kind` 族 + sourceId/name/counts/trigger/username/level/projectId/displayName/address/memberCount 逐值——team-projects-permissions 批；`project_delete` 在列）——
  按型模板（五类：config 键 ∥ 沙盒规则 ∥ 沙盒事件 ∥ agent 行 ∥ project 行）= `webui/SANDBOX.md` §2.1⑥/`webui/CHAT.md` §2.1/本面 §2.1④））；空态文案；`GET /api/audit` 取数（倒序）。

**⑤ 健康可见**：前端健康轮询（`app.mjs`——登录后启动：立即一次 + `HEALTH_POLL_MS = 30000`；登出停止）；数据 = `GET /healthz` 直读（公开端点——不经 `api()` 封装：503 也携状态体）；三态：绿（200 `ok`）∥ 黄（503 `degraded`——DB 异常）∥ 红（请求失败——服务不可达）。
落点三处：侧栏 meta 槽状态灯（点 + 文案；元素 id = `nav-health`——轮询回调直更，无整页重渲）∥ 系统页健康块（`webui/SYSTEM.md` §2.1）∥ 总览健康卡；后两者经 `ctx.onHealth` 订阅（视图注册——路由切换清空）。失败静默（灯变红——不 flash 刷屏）。

## 3. 文件账（本面文件行 ∥ 键族登记）

| 档 | 行数（实读——设计估） | 职责 |
|---|---|---|
| `thincoder-server/public/views-usage.mjs`（已落盘） | **无 ⇒ 139**（实读 2026-10-06——设计估 ≈170；全队用量：过滤（+端点） ∥ 报表（概览卡 ∥ CSS 柱趋势 ∥ 聚合/排行两表） ∥ 导出（blob 下载） ∥ 明细表——本档 §2.1②）；实读 139（2026-10-07——本批零动：看板页不入壳） | 管理·用量看板 |
| `thincoder-server/public/views-overview.mjs`（已落盘） | **无 ⇒ 74**（实读 2026-10-06——设计估 ≈100；总览卡集六枚（今日/成员/健康/更新/快捷入口）——本档 §2.1③）；实读 74（2026-10-07——本批零动）**±0（me 用量图表化批：`statCard` 导出〔1 词改——函数体零改 ∥ 行数零增〕；实读 74——2026-10-07 本批落地后，±0 保持）** | 管理·总览 |
| `thincoder-server/public/views-audit.mjs`（已落盘） | **无 ⇒ 88**（实读 2026-10-06——设计估 ≈100；审计列表：过滤三轴 ∥ 按型模板渲染 ∥ 空态——本档 §2.1④）**⇒ ≈96（本批 +≈8 = 壳化）⇒ 实读 91 ⇒ 90 ⇒ 实读 91（2026-10-07）**（配额 v2 批落地：双标题收正——h3 删净（#995），±0）**⇒ ≈94（2026-10-09 配置控制台批：`config_update` 十型接 +≈3）⇒ 实读 **93**（2026-10-09 配置控制台批落地后）⇒ ≈97（admin-agent-chat 批：`agent_event` 型接 + 详情 `summary` 支 +≈4）⇒ ≈105（沙盒余面批：两新型模板 +≈8）⇒ 实读 144（2026-10-11 走查轮：沙盒两型 + `kind` 族详情渲染 +≈47；余面批项收编；2026-10-12 复核盘面 146——前读数少计 2 ⇒ `kind` 补四键 +4 ⇒ 实读 150）⇒ ≈**166**（admin-agent-awareness 批：agent 行详情模板 +≈16——非裸 JSON）⇒ ≈**178**（team-projects-permissions 批（B2）：`project_event` 型接 + 详情支 +≈12——`kind` 族；**2026-10-12 修订轮实测 = 165**——前链读数陈旧，本批预估以 165 为基 ⇒ ≈177；以实施实读为准）⇒ **实读 250**（2026-10-14 现读——sandbox-exec-rebuild 批实施末；含沙盒两型 `kind` 族 +10 映射；链上 ≈177 为陈估——以本读为准）** | 管理·审计 |

**面小计**：≈318（本面档行现读和——估值面，实施实读为准；域合计 = 各面之和——不单列）。

**键族登记**（自 `webui/WEBUI.md` §2.2 归位——逐字）：

- **二轮新增键族**（六面——两表逐键同步 ∥ en 零 CJK ∥ 占位符一致）：`health.*` ∥ `overview.*` ∥ `usageReport.*` ∥ `vector.*` ∥ `audit.*` ∥ `nav.page.admin.overview|audit` ∥ `me.keys.*`（维护增量 ≈87 键）。

## 4. 验收（本面 AC 行）

| 需求 | 设计级判据 | 载体 |
|---|---|---|
| AC-15（续·②–⑤） | ② 看板（概览卡 ∥ CSS 柱趋势 ∥ 聚合/排行两表 ∥ 导出 blob 下载——与 `/api/usage` 同一过滤面（数据源 = 预聚合日表；日对齐窗逐值相等——口径 = `metering/METERING.md` §4）∥ 空态无错）；③ 总览（admin 落 `#/admin/overview` ∥ `#/admin` 重定向同指 ∥ 卡集六枚 ∥ user 不可达）；④ 审计页（过滤三轴 ∥ 列 ∥ 类型文案 ∥ 空态）；⑤ 灯（`nav-health` 三态 ∥ 30s 轮询 ∥ 停服红/恢复绿——收口轮浏览器实走）；i18n 两表键集相等（新增 ≈87 键——en 零 CJK ∥ 占位符一致）∥ 档目随正——单源 = `webui/WEBUI.md` §1 ∥ `nav.mjs` 直测（我的 3 ⇒ **4**（team-projects-permissions 批——`webui/PROJECTS.md` §2.1）⇒ 5（沙盒余面批——`webui/SANDBOX.md` §2.2） ∥ 管理 7（代理回迁批后）⇒ **8**（沙盒运行面批——`webui/SANDBOX.md` §2.1①）⇒ **9**（admin-agent-chat 批——`webui/CHAT.md` §2.1）⇒ **11**（team-projects-permissions 批——`webui/PROJECTS.md` §2.2/§2.3） ∥ 重定向收正（含 `#/admin/proxy` ⇒ `#/admin/system`） ∥ 默认页收正） | 单元测试档 + 收口轮 |

## 5. 边界（本面不做面）

- 二轮不做面：图表库（趋势 = 纯 CSS 柱——KD-SV-29）∥ 告警推送（健康 = 可见灯 + 页内块——推送归外部）∥ 引擎起停（手动——需求 §4）∥ 总览图表（总览 = 数值卡）∥ key 管理表增列（二轮不加——`memberView` 数据已在）。

## 6. 上抛/余项

- 本面无独立上抛/余项。

## 变更记录

- 2026-10-14（**sandbox-exec-rebuild 批 · 收口修复轮（设计面）· eng-designer**——承批档 `docs/batches/2026-10-13-sandbox-exec-rebuild.md` §6 行账注）：§3 `views-audit.mjs` 行补实读 **250**（2026-10-14 现读——链上 ≈177 陈估收口）。**产品码零触（设计轮）。**

- 2026-10-11（**server-doc-split 批 · 域内拆分（迁移）· eng-designer**——承批档 `docs/batches/2026-10-11-server-doc-split.md` §2）：本档自 `webui/WEBUI.md` §2.3①–⑤ 及三表归位行逐字迁入（零语义；标题携原题逐字——「另含后批可见面 ⑥⑦」句保留，⑥⑦ 内容 = `webui/ME.md` §2.1/§2.2）；文内 § 引用改指（§2.1→`webui/SYSTEM.md` §2.1 ∥ §2.8⑥/§2.10 跨档形等）；AC-15 行三拆之 ②–⑤ 片段（+ 尾句）入本档；档目链去重 ⇒ 单源句（`webui/WEBUI.md` §1）；原址保位 stub 在 `webui/WEBUI.md`。**产品码零触。**
- 2026-10-11（**控制台实走修复轮（走查轮）· 主 agent 直接执行 · 可 revert**——承 `docs/batches/2026-10-11-console-walkthrough-round.md` §1 · 台账 #1299；用户 00:0x 原话「你到底记录哪些日志？连容器启停都没日志」）：§2.1④ 审计面两处落实现——① 类型下拉接沙盒两型（`sandbox_event` ∥ `sandbox_rule`——全十三型在册）；② 详情模板增沙盒 `kind` 族渲染（kind 文案 + name/containerId/image/volume/address/host 逐值——枚举外原值兜底）；行数随正（实读 144〔当轮口径〕；2026-10-12 复核盘面 146 ⇒ `kind` 补四键 +4 ⇒ 实读 150）。同源随动 = `webui/SANDBOX.md` §2.1（不做项销记） ∥ `webui/SYSTEM.md` §6（AC-28 口径）。
- 2026-10-12（**admin-agent-awareness 批 · 设计轮 · eng-designer**——承批档 `docs/batches/2026-10-12-admin-agent-awareness.md` §1 · 台账 #1310；功能点 43⑥ ∥ AC-43⑥）：§2.1④ 审计面落实现——`agent_event` 行接**专用详情模板**（`tool · subject · 成败 · 〔截断〕 · summary`——非裸 JSON；`bash` 命令原文/读文件路径可见）+ 按型模板计数收正（「三型模板」⇒ **四类**——`agent_event` 行随 admin-agent-chat 批入册时漏登，本批一并收）；行数随正（`views-audit.mjs` 实读 150 ⇒ ≈166）；同源随动 = `accounts/ACCOUNTS.md` §2.1（detail 扩字段） ∥ `webui/SYSTEM.md` §3（i18n 两表 +3 键） ∥ `agent/ADMIN-AGENT.md` §14.4。**产品码零触（设计轮）。**
- 2026-10-12（**team-projects-permissions 批（B2）· 设计轮 · eng-designer**——承批档 `docs/batches/2026-10-12-team-projects-permissions.md` §1 · 台账 #1216；需求 44 ∥ AC-44）：§2.1④ 审计面随正——类型下拉十三型 ⇒ **十四型**（`project_event` 入册）+ 详情模板增 `project_event` 专用支（`kind` 族 + sourceId/name/counts/trigger/username/level 逐值）+ 按型模板计数收正（四类 ⇒ **五类**）；§3 `views-audit.mjs` 行随正（⇒ ≈178——`project_event` 型接 + 详情支 +≈12）；§4 AC-15 行 nav 链随正（我的 4 ∥ 管理 11）。同源随动 = `accounts/ACCOUNTS.md` §2.1（`project_event` 行） ∥ `webui/PROJECTS.md` §3/§4 ∥ `gateway/API.md` §2.9。**产品码零触（设计轮）。**
- 2026-10-12（**team-projects-permissions 批（B2）· 设计修订轮（fix）· eng-designer**——承批档 `docs/batches/2026-10-12-team-projects-permissions.md` §3（评审 #277））：§2.1④ `project_event` 行详情模板补 `project_delete` 键（projectId/displayName/address/memberCount——R64；`kind` 族枚举外原值兑底不变）。**产品码零触（设计轮）。**
