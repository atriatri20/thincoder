# Thincoder Server · 读数面（webui/READINGS.md）

> 域总览与壳面 = `webui/WEBUI.md`。

## 1. 关键决策（本面）

| # | 决策 | 理由 |
|---|---|---|
| KD-SV-29 | **可见面二轮 = 服务端聚合/代发 + 零依赖前端**：总览落 `#/admin/overview`（admin 默认页；`#/admin` 重定向同指）；图表 = 纯 CSS 柱（零依赖零构建——KD-SV-9 不变）；健康 = 前端三态轮询（30s——共享态 + `ctx.onHealth` 订阅）；导出 = 服务端 CSV（前端 blob 下载）；key 细节 = `memberView` 单源扩展 | 图表库/框架组件被否（违 KD-SV-9 零框架零构建）；健康并入 `/api/system` 轮询被否（探活语义单源 = `/healthz`——KD-SV-23）；服务端出图被否（新增图片/HTML 面——无谓）；独立排行组件被否（聚合降序即排行——两套视图徒增重复） |

## 2. 机制

### 2.1 可见面二轮（六面机制——功能点 15；另含可见面：⑥ 功能点 25 ∥ ⑦ 功能点 26）

**① 向量服务可见面**：系统页向量卡（`webui/SYSTEM.md` §2.1——admin：**配置面（地址 ∥ 模型 ∥ key——可编辑 + 保存；重启生效；草稿探活）** ∥ 可达性 ∥ snippet ∥ 用法 ∥ 试跑）∥
  用户面 = 我的用量页顶部提示条（模型名 + snippet + 用法一句——**地址/探活/试跑 = admin 面**；模型名经 `/api/system` 的 `embedding.model` 下发；**缺段（`embedding.model = null`）⇒ 整条不渲染**——成员面不呈「未配置」态）∥ 用量面 endpoint 区分：明细列（存量——`usageTable` 已有「端点」列）+ 端点过滤（两用量页同参数——下拉：全部/chat/embeddings）。

**② 用量看板升级**（`#/admin/usage`——明细表之上）：

- 过滤表单增「端点」下拉；查询 = 明细 + 报表同拍刷新（同过滤面）。
- **概览卡**：请求数 ∥ tokens 合计（`summary.totals`）。
- **时间趋势（按日）**：纯 CSS 柱状图（flex 柱列 + 高度百分比——零依赖；柱 `title` = 日期/请求数/tokens；轴标 = 首末日）；数据 = `summary.trend`（服务端零填充——前端只画）；空态 ⇒ 文案（零错）。
- **聚合与排行**：按模型 ∥ 按成员两表（序号 ∥ 名称 ∥ 请求数 ∥ tokens——降序即排行；聚合与排行同数据面，不设独立组件）。
- **导出**：`GET /api/usage/export`（同过滤面）——fetch ⇒ blob ⇒ 临时链接下载（400 经错误映射展示；不用裸链接导航——错误页不劫持 SPA）。
- **明细表**：key 列显示 **key 名称**（无名 ⇒ 回退提示形）；「我的·用量」同列表同判（`dom.mjs` `usageTable` 两页共用）。

**③ 管理总览**（`#/admin/overview`——admin 落地页）：卡集六枚——今日请求 ∥ 今日 token ∥ 成员数（`GET /api/overview`）∥ 健康（共享态——⑤）∥ 更新提示（`state.system.update.latest`：在场 ⇒ 高亮提示 + 导流系统页；缺 ⇒ 「未发现新版本」）∥ 快捷入口（成员/provider/用量/审计/系统五链）。落地页变更：admin 登录 ⇒ `#/admin/overview`；`#/admin` 重定向同指；旧页书签直达。user 面不可达（`nav` `denied` + 服务端 403 双层）。

**④ 审计/安全面**（`#/admin/audit`）：过滤表单（类型下拉（全部 + **十四型**） ∥ 成员输入 ∥ 起止时间）+ 表（时间 ∥ 类型 ∥ 操作者 ∥ 对象（与操作者同名 ⇒ 「—」） ∥ 详情——按型模板渲染（IP ∥ 维度 ∥ key 提示形 ∥ 角色 ∥ `keys`（配置变更键名清单）
  ∥ `sandbox_rule` 行 = 专用模板（`动作词 · 允许/拒绝 · target[:port]`——`action`/`rule` 枚举外原值兜底；纯函数 `sandboxRuleDetailText`） ∥ `kind`（沙盒事件） ∥ `agent_event` 行 = 专用模板（`tool · subject · 成败 · 〔截断〕 · summary`——非裸 JSON；`bash` 命令原文/读文件路径可见）
  ∥ `project_event` 行 = 专用模板（`kind` 族 + sourceId/name/counts/trigger/username/level/projectId/displayName/address/memberCount 逐值；`project_delete` 在列）——
  按型模板（五类：config 键 ∥ 沙盒规则 ∥ 沙盒事件 ∥ agent 行 ∥ project 行）= `webui/SANDBOX.md` §2.1⑥/`webui/CHAT.md` §2.1/本面 §2.1④））；空态文案；`GET /api/audit` 取数（倒序）。

**⑤ 健康可见**：前端健康轮询（`app.mjs`——登录后启动：立即一次 + `HEALTH_POLL_MS = 30000`；登出停止）；数据 = `GET /healthz` 直读（公开端点——不经 `api()` 封装：503 也携状态体）；三态：绿（200 `ok`）∥ 黄（503 `degraded`——DB 异常）∥ 红（请求失败——服务不可达）。
落点三处：侧栏 meta 槽状态灯（点 + 文案；元素 id = `nav-health`——轮询回调直更，无整页重渲）∥ 系统页健康块（`webui/SYSTEM.md` §2.1）∥ 总览健康卡；后两者经 `ctx.onHealth` 订阅（视图注册——路由切换清空）。失败静默（灯变红——不 flash 刷屏）。

## 3. 文件账（本面文件行 ∥ 键族登记）

| 档 | 行数（实读） | 职责 |
|---|---|---|
| `thincoder-server/public/views-usage.mjs`（已落盘） | **139**（全队用量：过滤（+端点） ∥ 报表（概览卡 ∥ CSS 柱趋势 ∥ 聚合/排行两表） ∥ 导出（blob 下载） ∥ 明细表——本档 §2.1②） | 管理·用量看板 |
| `thincoder-server/public/views-overview.mjs`（已落盘） | **74**（总览卡集六枚（今日/成员/健康/更新/快捷入口）——本档 §2.1③） | 管理·总览 |
| `thincoder-server/public/views-audit.mjs`（已落盘） | **271**（审计列表：过滤三轴 ∥ 按型模板渲染 ∥ 空态——本档 §2.1④） | 管理·审计 |

**面小计**：484（口径 = 本面表内逐行值之和；域合计 = 各面之和——不单列）。

**键族登记**（自 `webui/WEBUI.md` §2.2 归位——逐字）：

- **二轮新增键族**（六面——两表逐键同步 ∥ en 零 CJK ∥ 占位符一致）：`health.*` ∥ `overview.*` ∥ `usageReport.*` ∥ `vector.*` ∥ `audit.*` ∥ `nav.page.admin.overview|audit` ∥ `me.keys.*`（维护增量 ≈87 键）。

## 4. 验收（本面 AC 行）

| 需求 | 设计级判据 | 载体 |
|---|---|---|
| AC-15（续·②–⑤） | ② 看板（概览卡 ∥ CSS 柱趋势 ∥ 聚合/排行两表 ∥ 导出 blob 下载——与 `/api/usage` 同一过滤面（数据源 = 预聚合日表；日对齐窗逐值相等——口径 = `metering/METERING.md` §4）∥ 空态无错）；③ 总览（admin 落 `#/admin/overview` ∥ `#/admin` 重定向同指 ∥ 卡集六枚 ∥ user 不可达）；④ 审计页（过滤三轴 ∥ 列 ∥ 类型文案 ∥ 空态）；⑤ 灯（`nav-health` 三态 ∥ 30s 轮询 ∥ 停服红/恢复绿——收口轮浏览器实走）；i18n 两表键集相等（新增 ≈87 键——en 零 CJK ∥ 占位符一致）∥ 档目随正——单源 = `webui/WEBUI.md` §1 ∥ `nav.mjs` 直测（我的 **7**（`webui/SANDBOX.md` §2.2） ∥ 管理 **11**（`webui/PROJECTS.md` §2.2/§2.3） ∥ 重定向（含 `#/admin/proxy` ⇒ `#/admin/system`） ∥ 默认页收正） | 单元测试档 + 收口轮 |

## 5. 边界（本面不做面）

- 二轮不做面：图表库（趋势 = 纯 CSS 柱——KD-SV-29）∥ 告警推送（健康 = 可见灯 + 页内块——推送归外部）∥ 引擎起停（手动——需求 §4）∥ 总览图表（总览 = 数值卡）∥ key 管理表增列（二轮不加——`memberView` 数据已在）。

## 6. 上抛/余项

- 本面无独立上抛/余项。
