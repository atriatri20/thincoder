# Thincoder Server · 控制台前端（webui/WEBUI）

> 板块 = server ∥ 本档 = webui 域（页面路由 ∥ HTML ∥ 静态资源）；板总览 = `PROJECT.md`（文档地图 = §3）。
> 本域回指 = `PROJECT.md` §7（非功能·前端自洽 = 本档 §6）。
> 面档（2026-10-11 域内拆分——§2 各节正文随面）：沙盒面 = `webui/SANDBOX.md` ∥ 管理面对话 = `webui/CHAT.md` ∥ 系统页 = `webui/SYSTEM.md` ∥ 读数面 = `webui/READINGS.md` ∥ 我的面 = `webui/ME.md` ∥ 管理数据面 = `webui/ADMIN.md` ∥ 样式与版式 = `webui/STYLE.md` ∥ 多语言 = `webui/I18N.md`（§2 各节原位保位 stub——正文随面）。
> 建档：2026-10-06（批 `docs/batches/2026-10-06-server-gateway.md` 设计轮；同日补轮——B 案织入 + 三层结构）。

## 1. 静态面

- 落点 = `thincoder-server/public/`（已落盘；本批 IA 重排——§2）：`index.html`（壳——侧栏容器 + 挂载点 + 模块入口）∥ `app.mjs`（入口：路由分派 ∥ fetch 封装 ∥ 会话态 ∥ 启动装配）∥ `dom.mjs`（渲染助手 + 提示条——结构轮拆）∥ `health.mjs`（健康轮询——结构轮拆）∥ `nav.mjs`（IA 单源——组/项数据 + 路由解析纯函数）∥ `style.css`。
- 视图档（按页分档——§2）：`views-auth.mjs`（登录）∥ `views-me.mjs`（我的三页）∥ `views-admin.mjs`（成员管理）∥ `views-usage.mjs`（已落盘——全队用量 + 看板——`webui/READINGS.md` §2.1②）∥ `views-overview.mjs`（已落盘——管理总览——`webui/READINGS.md` §2.1③）∥
  `views-audit.mjs`（已落盘——审计——`webui/READINGS.md` §2.1④）∥ `views-providers.mjs`（Provider——列表 + 双弹窗编排；`webui/ADMIN.md` §2.1④）∥ `views-providers-modals.mjs`（Provider 弹窗件——添加流 ∥ 详情流；`webui/ADMIN.md` §2.1④）∥
  `views-system.mjs`（系统——版本/更新 ∥ 接入卡 ∥ 向量服务 ∥ 服务健康；`webui/SYSTEM.md` §2.1）∥ `views-system-config.mjs`（系统配置卡——含代理设置 ∥ 连通测试块；`webui/SYSTEM.md` §2.1 ∥ §2.2）∥
  `views-models.mjs`（已落盘——服务模型：列表 + 详情/配置弹窗——`webui/ADMIN.md` §2.1③）∥ `model-specs-snapshot.mjs`（已落盘——展示元数据快照——`webui/ADMIN.md` §2.1③）∥
  `views-sandbox.mjs`（已落盘——运行面批；沙盒页：运行面卡 + 容器区/镜像区（本批续扩；余五面随沙盒余面批）——`webui/SANDBOX.md` §2.1①）∥ `views-sandbox-containers.mjs` ∥ `views-sandbox-images.mjs`（sandbox-docker-admin 批新建——容器面/镜像族件——`webui/SANDBOX.md` §2.1①）
   ∥ `views-sandbox-volumes.mjs`（已落——卷族件——sandbox-volumes 批——`webui/SANDBOX.md` §2.1①） ∥ `views-sandbox-connection.mjs`（拟新增——**本增补 #2**（连接面 TLS 档）——`webui/SANDBOX.md` §2.1①）
   ∥ `views-sandbox-egress.mjs`（拟新增——沙盒出站规则/待批/审计件——`webui/SANDBOX.md` §2.1）∥ `views-me-sandbox.mjs`（拟新增——**本批新建**（sandbox-outbound-member-face 批）——我的·工作区——`webui/SANDBOX.md` §2.2）
  ∥ `views-chat.mjs`（admin-agent-chat 批新建——管理面对话页——`webui/CHAT.md` §2.1）∥ `views-chat-composer.mjs`（chat-shell-align 批新建——对话页输入区适配层 ∥ 状态行 ∥ 斜杠表——`webui/CHAT.md` §3）∥ `views-chat-messages.mjs`（已落——对话页消息面（帧面纯函数 ∥ 回读装配）——console-chat-live-step 批——`webui/CHAT.md` §3）
  ∥ `views-me-chat.mjs` ∥ `views-me-chat-messages.mjs` ∥ `views-me-chat-composer.mjs`（member-face-chat 批新建——成员面对话页三件——`webui/CHAT.md` §2.2）
  ∥ `views-projects.mjs`（已落——我的·项目 + 共用构建器（项目详情弹窗 ∥ 添加仓对话框）——team-projects-permissions 批——`webui/PROJECTS.md` §2.1）
  ∥ `views-admin-projects.mjs`（已落——管理·项目**两标签壳**（项目 ∥ Git 源）——2026-10-13 project-sources-merge 批——`webui/PROJECTS.md` §2.2/§2.3）∥ `views-git-sources.mjs`（已落——**Git 源面板**（标签②——页题 h2 撤）——`webui/PROJECTS.md` §2.4）；
  `terminal-core.mjs` ∥ `terminal-render.mjs` ∥ `terminal-link.mjs` ∥ `views-sandbox-terminal.mjs`（拟新增——**本批新建**（sandbox-container-terminal 批）——终端核三件（解析/网格 ∥ DOM 渲染 ∥ WS 传输）+ 控制台消费件——`webui/TERMINAL.md` §2/§3 ∥ `webui/SANDBOX.md` §2.1①）；
   `views-mcp.mjs`（已落——server-mcp 批——MCP 页（清单 ∥ 探活读数 ∥ 增/改/删弹窗）——`webui/MCP.md` §2）；
  公共组件 = `modal.mjs`（已落盘——弹窗 + 窗体助手四件（sandbox-docker-admin 批迁入）——`webui/ADMIN.md` §2.1①）∥ `tabs.mjs`（已落——公共标签页组件——`webui/TABS.md` §2.1）。
- 原 `views.mjs`（三视图单档）**退役拆档**——缘由 = 新页（provider ∥ IA 重排）叠加后单档将破 300 软线；拆分 = 按页归档（每档 ≤300）。
- 直发 = `thincoder-server/src/webui/static.mjs`（已落盘）：`node:http` 读发 `public/`——mime 表（`.mjs` ⇒ text/javascript） ∥ 防路径穿越 ∥ `Cache-Control: no-cache`（内部工具——改版即见）。
- 路由：`GET /` ⇒ `index.html`；其余静态档按名直发（同源）；`/v1/*` 与 `/api/*` 优先于静态面（分派 = `gateway/API.md` §1）。
- 形态钉死（用户 2026-10-06 08:09）：**零框架 ∥ 零构建 ∥ 零外部资源**（无 CDN ∥ 无外链字体——内网自洽）；先例 = 本仓 webview（`thincoder-vscode/webview/`）的 vanilla 口径。
- JS = **二十八 ⇒ 三十二档**（历批叠加：沙盒运行面批 +1 ∥ admin-agent-chat 批 +1 ∥ sandbox-docker-admin 批 +2）**⇒ 三十四档**（i18n 拆分（#1270）+2）**⇒ 三十五档**（sandbox-image-sources 批 +1）**⇒ 三十七档**（console-chat-align 批 +2——i18n core 两部件——现盘面）**⇒ 三十八档**（本批（console-tabs-component）+1——`tabs.mjs`（已落））
  **⇒ 三十九档**（sandbox-volumes 批 +1——`views-sandbox-volumes.mjs`（已落））
  **⇒ 四十档**（chat-shell-align 批 +1——`views-chat-composer.mjs`）**⇒ 四十一档**（console-chat-live-step 批 +1——`views-chat-messages.mjs`（已落））**⇒ 四十六档**（team-projects-permissions 批 +5——`views-projects.mjs` ∥ `views-admin-projects.mjs` ∥ `views-git-sources.mjs` + i18n project 两部件）
  **⇒ 四十七档**（sandbox-outbound-member-face 批 +1——`views-me-sandbox.mjs`（本批））；**⇒ 五十档**（team-ledger 批 +3——`views-ledger.mjs` + i18n ledger 两部件）
  **⇒ 五十三档**（member-face-chat 批 +3——成员对话页三件（`views-me-chat.mjs` ∥ `views-me-chat-messages.mjs` ∥ `views-me-chat-composer.mjs`）；i18n 部件零新档——`me.chat.*` 入 me 两表）
   **⇒ 五十九档**（本批（sandbox-container-terminal）+6——`terminal-core.mjs` ∥ `terminal-vt.mjs`（拆案） ∥ `terminal-codec.mjs`（拆案） ∥ `terminal-render.mjs` ∥ `terminal-link.mjs` ∥ `views-sandbox-terminal.mjs`）
   **⇒ 六十档**（本增补（sandbox-exec-rebuild 批 · 修订轮——底座可换）+1——`views-sandbox-base.mjs`（拟新增——`webui/SANDBOX.md` §2.1①））
   **⇒ 六十一档**（本增补 #2（连接面 TLS 档）+1——`views-sandbox-connection.mjs`（拟新增——`webui/SANDBOX.md` §2.1①））
  **⇒ 六十五档**（本批（server-mcp）实施落定——+3：`views-mcp.mjs` + i18n mcp 两部件（`i18n-{zh,en}-mcp.mjs`）；盘面实读收正——链上前值 61 与盘面差 1（陈链在途口径差，在案））
  `modal.mjs` ∥ `i18n.mjs` ∥ `i18n-zh.mjs` ∥ `i18n-en.mjs` ∥ i18n 部件**十八档**（`i18n-{zh,en}-{shell,me,admin,sandbox,system,core,project,ledger,mcp}.mjs`——`webui/I18N.md` §2.1 拆表） ∥ `model-specs-snapshot.mjs`）+ `style.css`；行标 = ≤500 软线；逐档实读与叠加链 = §5。
- **档目链（UI 代码档 ∥ 含 favicon 全目录——AC 行口径）单源 = 本节**：i18n 批后 12 ∥ 13 ⇒ 二轮批后 15 ∥ 16 ⇒ 弹窗批后 17 ∥ 18 ⇒ provider 重做批后 18 ∥ 19 ⇒ 配置面批后 19 ∥ 20 ⇒ 结构轮后 29 ∥ 30 ⇒ 配置控制台批后 30 ∥ 31 ⇒ 代理页批后 31 ∥ 32 ⇒ 代理回迁批后 30 ∥ 31 ⇒
  沙盒运行面批后 31 ∥ 32 ⇒ admin-agent-chat 批后 32 ∥ 33 ⇒ sandbox-docker-admin 批后 34 ∥ 35 ⇒ i18n 拆分（#1270）后 36 ∥ 37 ⇒ sandbox-image-sources 批后 37 ∥ 38 ⇒ console-chat-align 批后 39 ∥ 40（现盘面）
  ⇒ console-tabs-component 批落定后 40 ∥ 41 ⇒ sandbox-volumes 批后 **41 ∥ 42** ⇒ **chat-shell-align 批后 42 ∥ 43** ⇒ **console-chat-live-step 批后 43 ∥ 44**（现盘面）⇒ **team-projects-permissions 批后 48 ∥ 49**
  ⇒ **沙盒成员面（`#/me/sandbox`——sandbox-outbound-member-face 批）落定后 49 ∥ 50**（本批 +1——`views-me-sandbox.mjs`）⇒ 沙盒余面批后 **51 ∥ 52**（§6 各 AC 行链 2026-10-11 域内拆分时收口至此——链不复述）。
  ⇒ **team-ledger 批 +3**（`views-ledger.mjs` + i18n ledger 两部件）——as-of 盘面实读基线 **50 ∥ 49** ⇒ **53 ∥ 52**（链上「沙盒余面批后 51 ∥ 52」与盘面差 1–2 档 = 在途批未落齐；**实施当刻以盘面实读收正**——登记 = `ledger/LEDGER.md` §13 R74）。
  ⇒ **member-face-chat 批 +3**——链上 **53 ∥ 52 ⇒ 56 ∥ 55**（三新档：`views-me-chat.mjs` ∥ `views-me-chat-messages.mjs` ∥ `views-me-chat-composer.mjs`；2026-10-13；实施当刻以盘面实读收正）。
   ⇒ **本批（sandbox-container-terminal）+6**——链上 56 ∥ 55 ⇒ **62 ∥ 61**（六档——含拆案两档：`terminal-core.mjs` 越线实拆 `terminal-vt.mjs` ∥ `terminal-codec.mjs`；2026-10-13 实施回填收正）。
   ⇒ **本增补（sandbox-exec-rebuild 批 · 修订轮——底座可换）+1**——链上 62 ∥ 61 ⇒ **63 ∥ 62**（`views-sandbox-base.mjs`——拟新增；**实施当刻以盘面实读收正**）⇒ **本增补 #2（连接面 TLS 档）+1**——链上 63 ∥ 62 ⇒ **64 ∥ 63**（`views-sandbox-connection.mjs`——拟新增；**实施当刻以盘面实读收正**）。
  ⇒ **server-mcp 批 +3**（`views-mcp.mjs` ∥ `i18n-{zh,en}-mcp.mjs`）——**盘面实读收正：UI 代码档 67 ∥ 含 favicon 全目录 68**（链上前值 64 ∥ 63 = 设计轮链推值；差 1–3 档 = 历批在途口径差，在案）。
- **静态面双根（console-chat-align 批）**：`public/`（本根）+ **`/rc/*` → `@thincoder/render-core` 包目录**（渲染核供给根——`static.mjs` 前缀表；两先例同形 = 桌面 `app://` 双根 ∥ VSC 相对径）。
- 此后实读（2026-10-08 结构轮后）：`views-admin.mjs`（实读 331） ∥ `views-providers-modals.mjs`（实读 367）；`app.mjs` 与 i18n 双表两越线条目已由本结构轮拆解（读 = §5）。

## 2. 控制台 IA 与视图（哈希路由——KD-SV-20）

- **形态（本批定稿——用户 16:13 令）**：**左侧栏**分组导航 + 内容区；hash 路由扩展为 `#/<组>/<页>`；一页一职责（原「管理」单页堆叠拆开——成员/用量分页）。

| 组 | 页（hash） | 职责 | 角色 |
|---|---|---|---|
| 我的 | `#/me/chat` | 对话（成员面 agent——开发：工作区绑定会话 + 流式对话区 + 工具调用行 + 输入区全件；工作区选择/盒态动作（启动/拉仓）；**会话源 = 盒内**（离线 ⇒ 就启动引导）——`webui/CHAT.md` §2.2；非壳页） | 全体 |
| 我的 | `#/me/keys` | API Key 表（名称 ∥ API Key ∥ 签发时间 ∥ 最后使用 ∥ 近 30 天 ∥ 操作——多把并存；`webui/ME.md` §2.1） ∥ 签发新 API Key（弹窗 ∥ 新明文一次性区带复制钮） ∥ 逐把吊销（弹窗） | 全体 |
| 我的 | `#/me/usage` | 本人用量看板（`webui/ME.md` §2.2——概览卡行 ∥ 筛选行 ∥ KPI 行 ∥ 按日主图（维度切换 端点/模型）∥ 分模型区 ∥ 明细表）+ 向量服务提示条（模型名 ∥ snippet——`webui/READINGS.md` §2.1①；缺 `embedding` 段 ⇒ 不渲染——2026-10-09 embed 解耦批） | 全体 |
| 我的 | `#/me/account` | 基本信息（展示名/用户名/角色）+ 自助改密 | 全体 |
| 我的 | `#/me/projects` | 我的·项目：可见项目表（显示名 ∥ 仓地址 ∥ 源 ∥ 我的权限 ∥ 负责人——搜索 ∥ 行点击 ⇒ 项目详情弹窗（权限感知：成员表 ∥ 加成员 ∥ 改显示名/地址/负责人——按能力显隐）；team-projects-permissions 批——`webui/PROJECTS.md` §2.1） | 全体 |
| 我的 | `#/me/sandbox` | 我的工作区：本人工作区状态（盒状态（含回收原因） ∥ 快照 ∥ 所属 runner ∥ 待批提示——`webui/SANDBOX.md` §2.2；只读） | 全体 |
| 我的 | `#/me/ledger` | 团队台账：列表（编号 ∥ 仓 ∥ 标题 ∥ 状态（+老化标） ∥ 负责人 ∥ 更新 ∥ 操作）∥ 三筛（仓/状态/负责人）∥ 新建/编辑/收口/撤回——team-ledger 批——`webui/LEDGER.md` §2.1 | 全体 |
| 管理 | `#/admin/overview` | 总览（落地页）：今日请求/token ∥ 成员数 ∥ 健康 ∥ 更新提示 ∥ 快捷入口（`webui/READINGS.md` §2.1③） | admin |
| 管理 | `#/admin/chat` | 对话（管理面 agent——运维/管理：机队 ∥ 成员与 provider ∥ 审查排障；会话列表 + 流式对话区 + 工具调用行——`webui/CHAT.md` §2.1；非壳页） | admin |
| 管理 | `#/admin/members` | 成员表（行点击 ⇒ 详情弹窗——模型表直显（逐行已用 ∥ 禁用勾选） ∥ 设额度（分模型） ∥ 重置密码 ∥ 逐 key 吊销；新建成员弹窗——`webui/ADMIN.md` §2.1②） | admin |
| 管理 | `#/admin/projects` | 项目（**两标签：项目 ∥ Git 源**——一页两标签；旧址 `#/admin/git-sources` ⇒ 本页 Git 源标签）：面板① 全量项目表（显示名 ∥ 仓地址 ∥ 源 ∥ 负责人 ∥ 成员数——搜索 ∥「添加仓」（源选单 + 拉列表勾选批量 + 手输保底）∥ 行点击 ⇒ 详情弹窗（admin 能力面全显））∥ 面板② 源表（名字 ∥ 平台 ∥ PAT 掩码 ∥ 状态 ∥ 同步方式 ∥ 上次同步 ∥ 操作（立即同步 ∥ 拉列表 ∥ 体检 ∥ 编辑 ∥ 删除））+ 添/编/删弹窗——team-projects-permissions 批 ∥ 合并 = 2026-10-13 project-sources-merge 批——`webui/PROJECTS.md` §2.2/§2.3/§2.4） | admin |
| 管理 | `#/admin/projects/<tab>` | 子段形（`projects` ∥ `git-sources`）——刷新/分享/直打落对应标签；切换 = 页内 `replaceState`（零重渲）——`webui/TABS.md` §2.2 四岔口（第二消费面） | admin |
| 管理 | `#/admin/providers` | Provider 列表（行点击 ⇒ 详情弹窗：基本信息 ∥ 服务模型勾选）∥ 页首「添加」⇒ 添加弹窗（预设/自定义两径；数据源 = providers ∥ presets 端点——契约 = `gateway/API.md` §2.2；`webui/ADMIN.md` §2.1④） | admin |
| 管理 | `#/admin/models` | 服务模型：开放清单（`/v1/models` 同源——provider 派生）∥ 列表配额列 ∥ 详情/配置弹窗（A/C/D/E + 配额 F——`webui/ADMIN.md` §2.1③） | admin |
| 管理 | `#/admin/mcp` | MCP 服务器清单（表：名 ∥ 传输 ∥ 目标 ∥ 启用 ∥ 操作（探活/改/删））∥「添加」弹窗（三传输字段 ∥ 秘密零回填）∥ 行内探活读数行——`webui/MCP.md` §2；server-mcp 批 | admin |
| 管理 | `#/admin/usage` | 全队用量：过滤 + 趋势/聚合/排行 + 导出（`webui/READINGS.md` §2.1②） | admin |
| 管理 | `#/admin/audit` | 审计事件列表（过滤：类型/成员/时段——`webui/READINGS.md` §2.1④） | admin |
| 管理 | `#/admin/system` | 版本与更新 ∥ 成员接入 ∥ 向量服务 ∥ 服务配置（含代理设置 ∥ 连通测试块——`webui/SYSTEM.md` §2.2） ∥ 服务健康（数据 = `/api/system` ∥ `webui/SYSTEM.md` §2.1） | admin |
| 管理 | `#/admin/sandbox` | 沙盒：运行面 ∥ 工作区 ∥ 出站规则 ∥ 待批队列 ∥ 资源与 TTL ∥ 审计可查（六面——`webui/SANDBOX.md` §2.1；非壳页；**console-tabs-component 批分标签**：运行面 ∥ 镜像与镜像源 两标签（子段形——`webui/TABS.md` §2.2）） | admin |

- 登录 = `#/login`（无侧栏——登录卡）；`#/` ∥ 未知 ⇒ 角色默认页（admin ⇒ `#/admin/overview` ∥ user ⇒ `#/me/keys`）。
- **旧链迁移**：`#/me` ⇒ `#/me/keys` ∥ `#/admin` ⇒ `#/admin/overview` ∥ `#/admin/proxy` ⇒ `#/admin/system` ∥ **`#/admin/git-sources` ⇒ `#/admin/projects/git-sources`**（2026-10-13 project-sources-merge 批——Git 源并入项目页标签②；重定向带子段——`app.mjs` 拼回 ⇒ 落点/刷新/直打均达；旧书签可达；`#/admin/members` 等页路径仍直达）。
- **路由解析 = `nav.mjs` 纯函数**（`resolveRoute(path, role)`——无 DOM、单元测试档直测）：**解析序 = 别名先行、子段裁分在其后**（别名目标再走裁分 ⇒ `sub` 回传——`#/admin/git-sources` ⇒ `/admin/projects` + `sub: "git-sources"`；2026-10-13 project-sources-merge 批）；别名重定向 ∥ 角色默认 ∥ admin 面 `denied`（页面级「无权限」块——判据仍在服务端，§3）。
  **子段容许（console-tabs-component 批——2026-10-11 裁定「进」）**：`#/<组>/<页>/<子段>`——裁末段试前缀（在册 ⇒ 记 `sub` 供页面消费 ∥ 未在册 ⇒ 照旧默认页回落）；既有 hash 形行为逐字不变（`webui/TABS.md` §2.2）。
- **导航渲染**：侧栏 = 品牌 ∥ 组标题 + 项（活动态高亮）∥ 底部（meta 槽（健康状态灯（`webui/READINGS.md` §2.1⑤） ∥ 版本——`/api/system`，全角色） + 语言切换器 + 退出登录）；admin 组仅 admin 渲染。
- **窄屏**：`≤760px` 侧栏降级为顶条（单条媒体查询——非移动端适配承诺）。
- **文案面（多语言——`requirements/PROJECT.md` §2:13）**：全量文案单源 = 文案表（`i18n-zh.mjs` ∥ `i18n-en.mjs`）；`nav.mjs` 数据持 `labelKey`（键——非字面量）；页档/助手经 `t()` 取值——机制全文 = `webui/I18N.md` §2.1。
- 数据全经 `/api/*`（契约 = `accounts/ACCOUNTS.md` §3 ∥ `metering/METERING.md` §3 ∥ `gateway/API.md` §2.2）；`GET /` 公开（页面壳零数据）。

- **数据表页视口高壳（功能点 20——`webui/STYLE.md` §2.2）**：数据表五页（成员 ∥ Provider ∥ 服务模型 ∥ 审计 ∥ 用量明细 `#/me/usage`）= 壳面；`#/admin/usage` 看板页不入壳；机制全文 = `webui/STYLE.md` §2.2。

### 2.1 系统页与 meta 槽（版本/更新 ∥ 成员接入 ∥ 向量服务 ∥ 服务配置 ∥ 服务健康）

⇒ 见 `webui/SYSTEM.md` §2.1（as-of 2026-10-11）。

### 2.2 多语言（中文 ∥ English——需求 §2:13）

⇒ 机制 = `webui/I18N.md` §2.1 ∥ 键族登记 = 各面档「文件账·键族登记」节（`webui/SANDBOX.md` §3 ∥ `webui/CHAT.md` §3 ∥ `webui/ME.md` §3 ∥ `webui/SYSTEM.md` §3 ∥ `webui/ADMIN.md` §3）（as-of 2026-10-11）。

### 2.3 可见面二轮（六面机制——功能点 15；另含后批可见面：⑥ 功能点 25 ∥ ⑦ 功能点 26）

**① 向量服务可见面** ⇒ `webui/READINGS.md` §2.1①（as-of 2026-10-11）。
**② 用量看板升级** ⇒ `webui/READINGS.md` §2.1②（as-of 2026-10-11）。
**③ 管理总览** ⇒ `webui/READINGS.md` §2.1③（as-of 2026-10-11）。
**④ 审计/安全面** ⇒ `webui/READINGS.md` §2.1④（as-of 2026-10-11）。
**⑤ 健康可见** ⇒ `webui/READINGS.md` §2.1⑤（as-of 2026-10-11）。
**⑥ 「我的·key 与签发」页重做** ⇒ `webui/ME.md` §2.1（as-of 2026-10-11）。
**⑦ 「我的·用量」页图表化** ⇒ `webui/ME.md` §2.2（as-of 2026-10-11）。

### 2.4 弹窗机制与成员/服务模型/Provider 面（功能点 16 ∥ 17 ∥ 18）

**① 公共弹窗组件** ⇒ `webui/ADMIN.md` §2.1①（as-of 2026-10-11）。
**② 成员弹窗（三态：查看 ∥ 编辑 ∥ 新建）** ⇒ `webui/ADMIN.md` §2.1②（as-of 2026-10-11）。
**③ 服务模型页与配置面** ⇒ `webui/ADMIN.md` §2.1③（as-of 2026-10-11）。
**④ Provider 管理面（列表 + 双弹窗）** ⇒ `webui/ADMIN.md` §2.1④（as-of 2026-10-11）。

### 2.5 样式族规范（功能点 19——全控制台样式收束 · 2026-10-06）

⇒ 见 `webui/STYLE.md` §2.1（as-of 2026-10-11）。

### 2.6 数据表页视口高壳与布局收正（功能点 20——2026-10-07）

⇒ 见 `webui/STYLE.md` §2.2（as-of 2026-10-11）。

### 2.7 代理设置与连通测试（系统页「服务配置」卡内——功能点 30 · 2026-10-10）

⇒ 见 `webui/SYSTEM.md` §2.2（as-of 2026-10-11）。

### 2.8 沙盒页（管理——`#/admin/sandbox`；server-exec-sandbox 批——**分五轮落：① 运行面 + 容器区（runner-admin-console 批）∥ ① 续：容器面补齐 + 镜像族（sandbox-docker-admin 批）∥ ① 续二：镜像源族 + 一键拉取（sandbox-image-sources 批 ∥ sandbox-image-quick-pull 批）∥ ① 续三：拉取认源（sandbox-pull-by-source 批）∥ ① 续四：卷族（sandbox-volumes 批）∥ ②–⑥ 余面（沙盒余面批）**）

**① 运行面** ⇒ `webui/SANDBOX.md` §2.1①（as-of 2026-10-11）。

⇒ 全节（形态 ∥ ②–⑥ 余面 ∥ 镜像源族 ∥ 一键拉取 ∥ 拉取认源 ∥ 卷族）见 `webui/SANDBOX.md` §2.1（as-of 2026-10-11）。

### 2.9 我的·工作区（`#/me/sandbox`——成员面；14:56 裁）

⇒ 见 `webui/SANDBOX.md` §2.2（as-of 2026-10-11）。

### 2.10 管理面对话（`#/admin/chat`——admin-agent-chat 批建档 ∥ console-chat-align 批对齐渲染面；机制全文 = `agent/ADMIN-AGENT.md` §11）

⇒ 见 `webui/CHAT.md` §2.1（as-of 2026-10-11）。

### 2.11 控制台公共标签页组件（功能点 39——console-tabs-component 批；机制全文 = `webui/TABS.md` §2.1）

⇒ 见 `webui/TABS.md` §2.1（as-of 2026-10-11）。

### 2.12 团队项目与权限面（`#/me/projects` ∥ `#/admin/projects`（两标签：项目 ∥ Git 源）——team-projects-permissions 批（B2）∥ 合并 = 2026-10-13 project-sources-merge 批；机制全文 = `project/PROJECTS.md`）

⇒ 见 `webui/PROJECTS.md` §2（as-of 2026-10-12）。

## 3. 判权与安全

- **判权全在后端**（会话 + 角色——`accounts/ACCOUNTS.md` §3）：前端仅显隐与表单；`user` 直打管理端点 ⇒ 403——页面不是判据；管理组导航仅 admin 渲染 ∥ admin hash 由 `nav.mjs` 判 `denied` 落「无权限」块（含 provider 管理面——服务端为准）。本批新增 admin 端点（总览 ∥ 向量服务 ∥ 审计 ∥ 用量报表）同门；`/healthz` = 公开（轮询零凭据——在案）。
  项目面（`/api/projects*`）= 会话 + 能力矩阵（`project/PROJECTS.md` §3——`user` 可达可见面，控件按 `can` 显隐；管理面与 Git 源面仍 admin 门）。
- 会话在 HttpOnly cookie（前端零令牌存储）；`401` ⇒ 回 `#/login`（会话过期即回登录）；`403` ⇒ 提示无权限。
- 渲染与转义（**console-chat-align 批收窄**）：控制台自有节点 = `h`/`textContent`（零**手拼** HTML 串）；**含模型/用户/工具内容的文本面 = 核 `md()` 单源渲 HTML 入 `innerHTML`**（注入点 = 页面唯一；核内输入先全量转义——对照表 = `webui/CHAT.md` §2.1）。

## 4. 视觉与自托管

- 系统字体 ∥ 表格 + 表单 ∥ 桌面优先（宽表横滚）；全自托管（无外部资源引用）；侧栏分组导航（§2）∥ 窄屏降级 = §2 末条。

## 5. 本域文件与行数预算（本域族行）

| 档 | 行数（实读——设计估） | 职责 |
|---|---|---|
| `thincoder-server/src/webui/static.mjs`（已落盘） | **78**（实读 2026-10-06——设计估 ≈70）**⇒ ≈110（console-chat-align 批：第二根 `/rc/*`——根表/前缀序/各根逃逸门）⇒ 实读 114（2026-10-11——实施落盘；估 ≈110——差 +4）** | `public/` 直发 ∥ mime ∥ 防穿越 ∥ no-cache ∥ **`/rc/*` → 核包目录（第二根——`@thincoder/render-core`）** |
| `thincoder-server/public/index.html`（已落盘） | **20**（实读 2026-10-06——设计估 ≈26；#962 壳重排实读零增） | 前端壳（挂载点 + 模块入口） |
| `thincoder-server/public/app.mjs`（已落盘） | **219**（实读 2026-10-06——设计估 ≈190；#962 IA 路由表接线 ∥ 视图装配；#963 +10 = `/api/system` 取用 ∥ meta 填充）**⇒ 240 ⇒ 299**（i18n 叠加 +21 = `initLang` 接线 ∥ 错误映射 ∥ 格式化本地化 ∥ `Retry-After` 捕捉 ∥ `rerender` 口 ∥ title 随动；二轮 +59 = 健康轮询（30s ∥ 三态 ∥ 视图监听） ∥ 两新页接线）**⇒ ≈301**（弹窗批 +≈2 = `views-models` 接线；provider 重做批 ±0——接线面不变）**；实读 300（2026-10-07）⇒ ≈316（本批 +≈16 = `dataShell` ∥ `SHELL_PAGES` ∥ 路由 `data-shell` 切换 ∥ `viewCtx` 接线——本批增量 = 接线面）⇒ 实读 317 ⇒ ≈320（配额批：`fmtModelQuotas` 新增 ∥ `fmtQuota` 退役——±3）**；实读 **321**（2026-10-07——配额批/配额 v2 批落地后）**⇒ ≈346（me-keys 批：`showSecret` 复制钮 + 三路回退 +≈25）⇒ 实读 350（2026-10-08——结构轮设计轮复读）⇒ 拆分后 ≈192（本结构轮：渲染助手 + `flash` 迁 `dom.mjs` ∥ 健康轮询迁 `health.mjs`）⇒ ≈193（2026-10-09 代理页批：import ∥ `PAGES` 行 +≈2）⇒ 实读 192（2026-10-09 代理页批落地后：190 ⇒ 192——import ∥ `PAGES` 行 +2）**⇒ 实读 194（2026-10-10——行为残渣批 #979：`closeActiveModal` import ＋ `route()` 起点调用 = +2）⇒ 实读 **192**（2026-10-10 代理回迁批：去 `views-proxy` import ∥ `PAGES` 行 −2）⇒ ≈195（沙盒运行面批：import ∥ `PAGES` 行 +≈3——`webui/SANDBOX.md` §2.1①）⇒ ≈197（admin-agent-chat 批：import ∥ `PAGES` 行 +≈2——`webui/CHAT.md` §2.1）⇒ ≈199（沙盒余面批：成员页 +≈2——`webui/SANDBOX.md` §2.2）⇒ **实读 197**（2026-10-11——设计轮现读）⇒ ≈**199**（本批（console-tabs-component）：三参透传 +≈2——`webui/TABS.md` §2.2）⇒ ≈**206**（team-projects-permissions 批：三 import + 三 `PAGES` 行 +≈7）⇒ **≈208**（team-ledger 批：+1 import +1 `PAGES` 行）**⇒ ≈212**（sandbox-outbound-member-face 批：import ∥ 路由行 +≈4；两在途批序以实施当刻盘面实读为准）⇒ **实读 206**（2026-10-13 设计轮实核——在途批落地后盘面）⇒ ≈**204**（2026-10-13 project-sources-merge 批：删 `renderGitSources` import + `PAGES` 行 −2 ∥ 重定向带子段（同行改））⇒ ≈**210**（member-face-chat 批：import ∥ `PAGES` 行 ∥ 路由带子段（同行改）+≈4——以实施实读为准）⇒ **实读 209**（server-mcp 批：+1 import +1 `PAGES` 行；实施收正） | 入口：路由分派 ∥ fetch 封装 ∥ 会话态 ∥ 启动装配 |
| `thincoder-server/public/dom.mjs`（已落盘） | **≈120**（设计估——渲染助手自 `app.mjs` 逐字外拆：`h` ∥ `table` ∥ `fmtTs`/`fmtValue`/`fmtModelQuotas` ∥ `showSecret`/`copyText` ∥ `usageTable` ∥ `dataShell` ∥ `flash`（携 `flashEl`/计时器））**⇒ 实读 118**（2026-10-09——结构轮落地后首读） | 渲染助手 ∥ 格式化 ∥ 提示条 |
| `thincoder-server/public/health.mjs`（已落盘） | **≈62**（设计估——健康轮询自 `app.mjs` 外拆：`HEALTH_POLL_MS` ∥ 三态文案键 ∥ `healthSnapshot` ∥ `onHealth` ∥ 灯直更 ∥ `pollHealth` ∥ 启停 ∥ 订阅清零口）**⇒ 实读 62**（2026-10-09——结构轮落地后首读） | 健康轮询（`webui/READINGS.md` §2.1⑤ 三落点共源） |
| `thincoder-server/public/nav.mjs`（已落盘） | **无 ⇒ 82 ⇒ 87**（实读 2026-10-06——#962 设计估 ≈70；组/项数据 ∥ `resolveRoute` 纯函数 ∥ 侧栏渲染；#963 +1 = meta 槽版本行；i18n 叠加 ±0 = `label` ⇒ `labelKey` 收编 ∥ 切换器挂 meta 槽；二轮 +5 = 总览/审计两项 ∥ `/admin` 重定向收正 ∥ 默认页收正 ∥ 灯位）**⇒ ≈90**（弹窗批 +≈3 = 服务模型项；`webui/ADMIN.md` §2.1③）；provider 重做批 ±0（labelKey 不变——值改 = 文案表）；实读 88（2026-10-07——本批零动）⇒ ≈89（2026-10-09 代理页批：+1 管理项）⇒ 实读 89（2026-10-09 代理页批落地后：88 ⇒ 89）⇒ 实读 **88**（2026-10-10 代理回迁批：−1 管理项 ∥ 别名 +1 行——净 −1）⇒ ≈89（沙盒运行面批：+1 项（管理「沙盒」）——`webui/SANDBOX.md` §2.1①）⇒ ≈90（admin-agent-chat 批：+1 项（管理「对话」——置于总览后）——`webui/CHAT.md` §2.1）⇒ ≈91（沙盒余面批：我的 +1——`webui/SANDBOX.md` §2.2）⇒ **实读 91**（2026-10-11——设计轮现读）⇒ ≈**99**（本批（console-tabs-component）：子段容许（裁末段 + `sub` 回传）+≈8——`webui/TABS.md` §2.2）⇒ ≈**103**（team-projects-permissions 批：+3 项——`#/me/projects` ∥ `#/admin/projects` ∥ `#/admin/git-sources`——+≈4 行）**⇒ ≈105**（team-ledger 批：+1 项——`#/me/ledger`——末位）**⇒ ≈106**（sandbox-outbound-member-face 批：+1 项——`#/me/sandbox`；两在途批序以实施当刻盘面实读为准）**⇒ 实读 104**（2026-10-13 设计轮实核——在途批落地后盘面）**⇒ 净 ±0**（2026-10-13 project-sources-merge 批：−1 项（管理 11 ⇒ **10**——`#/admin/git-sources` 并入项目页两标签）∥ +1 别名行——别名目标再走子段裁分（`sub` 回传）系现成解析序，零额外改；以实施实读为准）⇒ ≈**106**（member-face-chat 批：+1 项——`#/me/chat`（我的组首位））⇒ **实读 107**（server-mcp 批：+1 项——`#/admin/mcp`；实施收正） | IA 单源（§2 ∥ §2.1） |
| `thincoder-server/public/views-auth.mjs` | ⇒ `webui/ME.md` §3（as-of 2026-10-11） | —— |
| `thincoder-server/public/views-me.mjs` | ⇒ `webui/ME.md` §3（as-of 2026-10-13——+≈60：账户页「Git 凭据」卡——member-face-chat 批裁定修订轮） | —— |
| `thincoder-server/public/views-admin.mjs` | ⇒ `webui/ADMIN.md` §3（as-of 2026-10-11） | —— |
| `thincoder-server/public/views-providers.mjs` | ⇒ `webui/ADMIN.md` §3（as-of 2026-10-11） | —— |
| `thincoder-server/public/views-providers-modals.mjs` | ⇒ `webui/ADMIN.md` §3（as-of 2026-10-11） | —— |
| `thincoder-server/public/views-system.mjs` | ⇒ `webui/SYSTEM.md` §3（as-of 2026-10-11） | —— |
| `thincoder-server/public/views-system-config.mjs` | ⇒ `webui/SYSTEM.md` §3（as-of 2026-10-11） | —— |
| `thincoder-server/public/views-proxy.mjs`（迁移期引文——已退役删档） | ⇒ `webui/SYSTEM.md` §3（as-of 2026-10-11） | —— |
| `thincoder-server/public/views-usage.mjs` | ⇒ `webui/READINGS.md` §3（as-of 2026-10-11） | —— |
| `thincoder-server/public/views-overview.mjs` | ⇒ `webui/READINGS.md` §3（as-of 2026-10-11） | —— |
| `thincoder-server/public/views-chat.mjs` | ⇒ `webui/CHAT.md` §3（as-of 2026-10-11） | —— |
| `thincoder-server/public/views-chat-composer.mjs`（chat-shell-align 批新建） | ⇒ `webui/CHAT.md` §3（as-of 2026-10-11） | —— |
| `thincoder-server/public/views-chat-messages.mjs`（已落——console-chat-live-step 批） | ⇒ `webui/CHAT.md` §3（面小计本批行） | —— |
| `thincoder-server/public/views-audit.mjs` | ⇒ `webui/READINGS.md` §3（as-of 2026-10-11） | —— |
| `thincoder-server/public/views-models.mjs` | ⇒ `webui/ADMIN.md` §3（as-of 2026-10-11） | —— |
| `thincoder-server/public/model-specs-snapshot.mjs` | ⇒ `webui/ADMIN.md` §3（as-of 2026-10-11） | —— |
| `thincoder-server/public/views-sandbox.mjs` | ⇒ `webui/SANDBOX.md` §3（as-of 2026-10-11） | —— |
| `thincoder-server/public/views-sandbox-containers.mjs` | ⇒ `webui/SANDBOX.md` §3（as-of 2026-10-11） | —— |
| `thincoder-server/public/views-sandbox-images.mjs` | ⇒ `webui/SANDBOX.md` §3（as-of 2026-10-11） | —— |
| `thincoder-server/public/views-sandbox-image-sources.mjs` | ⇒ `webui/SANDBOX.md` §3（as-of 2026-10-11） | —— |
| `thincoder-server/public/views-sandbox-volumes.mjs`（已落——sandbox-volumes 批） | ⇒ `webui/SANDBOX.md` §3（as-of 2026-10-11） | —— |
| `thincoder-server/public/views-sandbox-base.mjs`（拟新增——本增补（sandbox-exec-rebuild 批 · 修订轮——底座可换）） | ⇒ `webui/SANDBOX.md` §3（as-of 2026-10-13） | —— |
| `thincoder-server/public/views-sandbox-connection.mjs`（拟新增——本增补 #2（sandbox-exec-rebuild 批 · 连接面 TLS 档）） | ⇒ `webui/SANDBOX.md` §3（as-of 2026-10-13） | —— |
| `thincoder-server/public/views-sandbox-egress.mjs`（拟新增——沙盒余面批） | ⇒ `webui/SANDBOX.md` §3（as-of 2026-10-11） | —— |
| `thincoder-server/public/views-me-sandbox.mjs`（拟新增——**本批新建**（sandbox-outbound-member-face 批）） | ⇒ `webui/SANDBOX.md` §3（as-of 2026-10-11） | —— |
| `thincoder-server/public/modal.mjs` | ⇒ `webui/ADMIN.md` §3（as-of 2026-10-11） | —— |
| `thincoder-server/public/tabs.mjs`（已落——console-tabs-component 批） | ⇒ `webui/TABS.md` §3（as-of 2026-10-11） | —— |
| `thincoder-server/public/terminal-core.mjs`（拟新增——本批（sandbox-container-terminal）） | ⇒ `webui/TERMINAL.md` §3（as-of 2026-10-13） | —— |
| `thincoder-server/public/terminal-render.mjs`（拟新增——本批（sandbox-container-terminal）） | ⇒ `webui/TERMINAL.md` §3（as-of 2026-10-13） | —— |
| `thincoder-server/public/terminal-link.mjs`（拟新增——本批（sandbox-container-terminal）） | ⇒ `webui/TERMINAL.md` §3（as-of 2026-10-13） | —— |
| `thincoder-server/public/views-sandbox-terminal.mjs`（拟新增——本批（sandbox-container-terminal）） | ⇒ `webui/SANDBOX.md` §3（as-of 2026-10-13） | —— |
| `thincoder-server/public/views.mjs`（迁移期引文——已退役拆档（2026-10-06）——档不在盘（原读数 244 · as-of）） | —— | —— |
| `thincoder-server/public/style.css` | ⇒ `webui/STYLE.md` §3（as-of 2026-10-11） | —— |
| `thincoder-server/public/i18n.mjs` | ⇒ `webui/I18N.md` §3（as-of 2026-10-11） | —— |
| `thincoder-server/public/i18n-zh.mjs` | ⇒ `webui/I18N.md` §3（as-of 2026-10-11） | —— |
| `thincoder-server/public/i18n-zh-shell.mjs`（已落盘） | **≈69**（设计估——键 54 + 段注释 6 + 档头/包裹 ≈9；壳族：`app.*`/`common.*`/`col.*`/`denied.*`/`nav.*`/`lang.*`/`login.*`/`err.*`）**⇒ 实读 73**（2026-10-09——结构轮落地后首读）**⇒ ≈74（2026-10-09 代理页批：+`nav.page.admin.proxy`）⇒ 实读 74（2026-10-09 代理页批落地后：73 ⇒ 74）⇒ 实读 **73**（2026-10-10 代理回迁批：`nav.page.admin.proxy` 退役 −1）⇒ ≈74（沙盒运行面批：+`nav.page.admin.sandbox`；`err.upstream_error` 逐值改——±0）**⇒ ≈**75**（sandbox-outbound-member-face 批：+`nav.page.me.sandbox`；陈链后历批增键未入本行——实施当刻以实读收正）⇒ ≈**76**（member-face-chat 批：+1——`nav.page.me.chat`）⇒ **实读 82**（server-mcp 批 +1——`nav.page.admin.mcp`；陈链后历批增键未入本行——实施当刻实读收正） | 文案表·zh·壳族 |
| `thincoder-server/public/i18n-zh-me.mjs` | ⇒ `webui/ME.md` §3（as-of 2026-10-11） | —— |
| `thincoder-server/public/i18n-zh-admin.mjs` | ⇒ `webui/ADMIN.md` §3（as-of 2026-10-11） | —— |
| `thincoder-server/public/i18n-zh-sandbox.mjs` | ⇒ `webui/SANDBOX.md` §3（as-of 2026-10-11） | —— |
| `thincoder-server/public/i18n-zh-system.mjs` | ⇒ `webui/SYSTEM.md` §3（as-of 2026-10-11） | —— |
| `thincoder-server/public/i18n-zh-core.mjs` | ⇒ `webui/CHAT.md` §3（as-of 2026-10-11） | —— |
| `thincoder-server/public/i18n-en.mjs` | ⇒ `webui/I18N.md` §3（as-of 2026-10-11） | —— |
| `thincoder-server/public/i18n-en-shell.mjs`（已落盘） | **≈68**（键 54 + 注释 5 + ≈9）**⇒ 实读 71**（2026-10-09——结构轮落地后首读）**⇒ ≈72（2026-10-09 代理页批：+`nav.page.admin.proxy`）⇒ 实读 72（2026-10-09 代理页批落地后：71 ⇒ 72）⇒ 实读 **71**（2026-10-10 代理回迁批：−1）⇒ ≈72（沙盒运行面批：+`nav.page.admin.sandbox`；`err.upstream_error` 逐值改——±0）**⇒ ≈**73**（sandbox-outbound-member-face 批：+`nav.page.me.sandbox`；陈链后历批增键未入本行——实施当刻以实读收正）⇒ ≈**74**（member-face-chat 批：+1——`nav.page.me.chat`）⇒ **实读 80**（server-mcp 批 +1——同键；实施收正） | 文案表·en·壳族 |
| `thincoder-server/public/i18n-en-me.mjs` | ⇒ `webui/ME.md` §3（as-of 2026-10-11） | —— |
| `thincoder-server/public/i18n-en-admin.mjs` | ⇒ `webui/ADMIN.md` §3（as-of 2026-10-11） | —— |
| `thincoder-server/public/i18n-en-sandbox.mjs` | ⇒ `webui/SANDBOX.md` §3（as-of 2026-10-11） | —— |
| `thincoder-server/public/i18n-en-system.mjs` | ⇒ `webui/SYSTEM.md` §3（as-of 2026-10-11） | —— |
| `thincoder-server/public/i18n-en-core.mjs` | ⇒ `webui/CHAT.md` §3（as-of 2026-10-11） | —— |
| `thincoder-server/public/views-projects.mjs`（已落——team-projects-permissions 批） | ⇒ `webui/PROJECTS.md` §3（as-of 2026-10-12） | —— |
| `thincoder-server/public/views-admin-projects.mjs`（已落——team-projects-permissions 批） | ⇒ `webui/PROJECTS.md` §3（as-of 2026-10-12） | —— |
| `thincoder-server/public/views-git-sources.mjs`（已落——team-projects-permissions 批） | ⇒ `webui/PROJECTS.md` §3（as-of 2026-10-12）；2026-10-13 project-sources-merge 批：**转面板件**（页题 h2 撤 ∥ 导出名不变）——`webui/PROJECTS.md` §2.4 | —— |
| `thincoder-server/public/i18n-zh-project.mjs`（已落——team-projects-permissions 批） | ⇒ `webui/PROJECTS.md` §3（as-of 2026-10-12） | —— |
| `thincoder-server/public/i18n-en-project.mjs`（已落——team-projects-permissions 批） | ⇒ `webui/PROJECTS.md` §3（as-of 2026-10-12） | —— |
| `thincoder-server/public/views-mcp.mjs`（已落——server-mcp 批；实读 **248**） | ⇒ `webui/MCP.md` §3（as-of 2026-10-13） | —— |
| `thincoder-server/public/i18n-zh-mcp.mjs`（已落——server-mcp 批；实读 **55**） | ⇒ `webui/MCP.md` §3（as-of 2026-10-13） | —— |
| `thincoder-server/public/i18n-en-mcp.mjs`（已落——server-mcp 批；实读 **55**） | ⇒ `webui/MCP.md` §3（as-of 2026-10-13） | —— |
| **小计** | **≈680 ⇒ 558 ⇒ 943**（#962 实读）**⇒ 1006**（#963 实读：+63 = views-system +44 ∥ app +10 ∥ nav +1 ∥ style +8）**⇒ 1545**（i18n 实读：+539 = i18n 三档 +505 = 113 + 198 + 194 ∥ app +21 ∥ views-auth +2 ∥ views-me +1 ∥ views-admin +2 ∥ views-providers +1 ∥ views-system +1 ∥ style +6；nav ±0）**⇒ ≈2247**（二轮估：+≈702 = 新三档 ≈370 ∥ app +35 ∥ nav +12 ∥ views-me +35 ∥ views-admin −49 ∥ views-system +90 ∥ style +35 ∥ i18n 两表 +174）**⇒ ≈2646**（弹窗批估：+≈399 = modal 新 ≈110 ∥ views-models 新 ≈110 ∥ views-admin +≈110 ∥ style +≈30 ∥ i18n 两表 +≈34 ∥ nav +≈3 ∥ app +≈2）**⇒ ≈2840**（provider 重做批估：+≈195 = 弹窗体新 ≈260 ∥ 页面 214 ⇒ ≈110 ∥ style +≈25 ∥ i18n 两表 ≈−2（净 ≈−1/表）；app/nav ±0）**⇒ ≈3154**（服务模型配置面批估：+≈314 = views-models **77 ⇒ ≈235** ∥ model-specs-snapshot 新 ≈80 ∥ style +≈26 ∥ i18n 两表 +≈50；modal/app/nav ±0）**⇒ ≈3180**（样式族批估：style +≈26 ∥ 余档 ±0——类串微改行数零变；单元测试档另计）**⇒ 3000（实读 2026-10-07——全表实读和 = public 19 档 2922 + `static.mjs` 78）⇒ ≈3112（布局批估 +≈112）⇒ ≈3233（配额分模型批估 +≈121 = views-admin +≈70 ∥ views-models +≈19 ∥ views-me +≈4 ∥ app +≈3 ∥ i18n 两表 +≈20 ∥ style +≈5；modal/nav/快照等零动）⇒ 实读 3170（本设计轮——public 19 档 3092 + `static.mjs` 78；配额批落地后）⇒ ≈3245（配额 v2 批 +≈75 = views-admin +≈50 ∥ views-models +≈9 ∥ views-audit −1 ∥ i18n-zh ±0 ∥ i18n-en +7 ∥ i18n.mjs +≈10；app/modal/style 零动）⇒ **实读 3269（2026-10-07——配额 v2 批落地后；public 19 档 3191 + `static.mjs` 78；+99——越估 ≈24）**⇒ ≈3290**（模型元数据批 +≈45 = 视图件 +≈35 ∥ i18n 两表 +5/+5；以 v2 落定实读为基）**⇒ 实读 3345（2026-10-07——模型元数据批落地后；Δ+76 = views-providers-modals +65 ∥ i18n 两表 +5/+6）⇒ 实读 3350（2026-10-07——列式收正批落地后；public 19 档 3272 + `static.mjs` 78；上链 3345 复算 = 3344——差 1 在案）**⇒ ≈3505（me-keys 批 +≈155 = views-me +85 ∥ app +25 ∥ views-system +6 ∥ i18n 两表 +44 ∥ style −5；零新档——档目 19 ∥ 20 不变）⇒ ≈3626（me 用量图表化批 +≈121 = views-me +≈85 ∥ style +≈22 ∥ i18n 两表 +≈14 ∥ views-overview ±0；零新档——档目 19 ∥ 20 不变）⇒ 实读 3619（2026-10-07——本批落地后；public 19 档 3541 + `static.mjs` 78；对链上 ≈3626 差 7——me-keys ∥ 本批实读累计估差收口）**⇒ ≈3696（2026-10-08 结构轮：i18n 表族拆表 +≈53（zh +26 ∥ en +27——八部件档头物化） ∥ `app.mjs` 三拆 +≈24（350 ⇒ ≈192 + ≈120 + ≈62）——实读回填）**⇒ ≈3705（2026-10-09 控制台测试 key 修复批：`views-providers-modals.mjs` +9；余档 ±0）⇒ ≈3728（2026-10-09 代理批：`views-providers-modals` +≈19 ∥ i18n 两表 +≈2/表；余档 ±0）⇒ ≈3978（2026-10-09 配置控制台批：+≈250 = `views-system-config.mjs` 新 ≈130 ∥ `views-system.mjs` +≈55 ∥ i18n 两表 +≈58 ∥ `views-audit.mjs` +≈3 ∥ `style.css` +≈4；零退役——档目 29 ∥ 30 ⇒ **30 ∥ 31**）⇒ ≈3987（2026-10-09 embed 解耦批：+≈9 = `views-system` +≈15 ∥ `views-models` −≈8 ∥ i18n system 部件 +2/表 ∥ admin 部件 −1/表；零新档——档目 30 ∥ 31 不变）⇒ 实读增量 **+217**（2026-10-09 配置控制台批落地后——逐档实读见上表）⇒ ≈4036（2026-10-09 alias 批：+≈49 = `views-models` +≈31 ∥ `views-providers-modals` +≈10 ∥ i18n 两表 +4/表；零新档——档目 30 ∥ 31 不变）⇒ ≈4171（2026-10-09 代理页批：+≈135 = `views-proxy.mjs` 新 ≈110 ∥ `views-system-config.mjs` −≈10 ∥ `nav.mjs` +1 ∥ `app.mjs` +2 ∥ i18n system 两部件 +15/表 ∥ shell 两部件 +1/表；`style.css` ±0——档目 30 ∥ 31 ⇒ **31 ∥ 32**）⇒ 实读增量 **+4**（2026-10-09 走查收正笔：`style.css` 229 ⇒ 233——逐档实读见上表）⇒ 实读增量 **+155**（2026-10-09 代理页批落地后：`views-proxy.mjs` **119** 新 ∥ `views-system-config.mjs` **−3** ∥ `nav.mjs` **+1** ∥ `app.mjs` **+2** ∥ i18n system 两部件 **+17/表** ∥ shell 两部件 **+1/表**；`style.css` ±0——逐档实读见上表）⇒ 实读增量 **−65**（2026-10-10 代理回迁批落地后：`views-proxy.mjs` **−119**（删档） ∥ `views-system-config.mjs` **+63** ∥ `nav.mjs` **−1** ∥ `app.mjs` **−2** ∥ i18n system 两部件 **−2/表** ∥ shell 两部件 **−1/表**；`i18n-{zh,en}-admin` ±0（`useProxy` 逐值改）——逐档实读见上表）⇒ ≈+275（沙盒运行面批（runner-admin-console）：`views-sandbox.mjs` 新 ≈210 ∥ `nav.mjs` +1 ∥ `app.mjs` +3 ∥ i18n admin 两部件 +≈26/表 ∥ shell 两部件 +1/表 ∥ `style.css` +≈7；档目 30 ∥ 31 ⇒ **31 ∥ 32**）⇒ ≈+141（托管接入增补：`views-sandbox.mjs` +≈75 ∥ i18n admin 两部件 +≈30/表 ∥ `style.css` +≈6；档目 31 ∥ 32 不变）⇒ ≈+558（沙盒余面批：`views-sandbox-egress.mjs` 新 ≈240 ∥ `views-me-sandbox.mjs` 新 ≈120 ∥ `nav.mjs` +1 ∥ `app.mjs` +2 ∥ i18n admin 两部件 +≈34/表 ∥ i18n me 两部件 +≈14/表 ∥ i18n system 两部件 +≈4/表 ∥ `views-audit` +≈8 ∥ `style.css` +≈5；档目 ⇒ **36 ∥ 37**——承 sandbox-docker-admin 批后 **34 ∥ 35**（admin-agent-chat 批后 **32 ∥ 33**））⇒ ≈+449（sandbox-docker-admin 批：`views-sandbox-containers.mjs` 新 ≈300 ∥ `views-sandbox-images.mjs` 新 ≈140 ∥ `views-sandbox.mjs` −≈139（外拆）∥ `modal.mjs` +≈38 ∥ i18n admin 两部件 +≈50/表 ∥ `style.css` +≈10；档目 **34 ∥ 35**——承 admin-agent-chat 批后 **32 ∥ 33**）⇒（i18n 拆分定义（#1270）：`i18n-{zh,en}-sandbox.mjs` 拟新增 +2 档——沙盒族 135 键外拆；admin 两部件实读 **316 ∥ 320** ⇒ 拆后 ≈**175 ∥ ≈179** ∥ 新两档 ≈**148 ∥ 148**；执行 = 实施轮——批档 §2）⇒ 沙盒拆分已执行（2026-10-11 现读：admin **174 ∥ 178** ∥ sandbox **147 ∥ 147**）⇒ ≈+322（sandbox-image-sources 批：`views-sandbox-image-sources.mjs` 新 ≈230 ∥ `views-sandbox-images.mjs` +≈20 ∥ `views-sandbox.mjs` +≈8 ∥ i18n sandbox 两部件 +≈30/表 ∥ `style.css` +≈4；档目 **36 ∥ 37** ⇒ **37 ∥ 38**（+ 件一档——承 i18n 拆分（#1270）后））⇒ **实读增量 +369**（sandbox-image-sources 落地后——逐档实读见上表；对链上 ≈+322 越 47）⇒ ≈+86（本批（sandbox-image-quick-pull）：`views-sandbox-image-sources.mjs` +≈70 ∥ `views-sandbox-images.mjs` +≈6 ∥ `views-sandbox.mjs` +≈2 ∥ i18n sandbox 两部件 +3/表 ∥ `style.css` +≈2；零新档——档目 **37 ∥ 38** 不变）⇒ **实读增量 +101**（sandbox-image-quick-pull 落地后——同口径净增和；对链上 ≈+86 越 15；逐档实读见上表）⇒ ≈+53（本批（sandbox-pull-by-source）：`views-sandbox-images.mjs` +≈45 ∥ `views-sandbox-image-sources.mjs` +≈2 ∥ i18n sandbox 两部件 +3/表；`style.css` ±0；零新档——档目 **37 ∥ 38** 不变；复算——分项和 45 + 2 + 3×2）⇒ ≈+154（console-chat-align 批：`views-chat.mjs` **399 ⇒ ≈430** ∥ `static.mjs` **78 ⇒ ≈110**（第二根） ∥ `style.css` **267 ⇒ ≈310**（核类名族样式：码面/`pre.code-block`/`.tk-*`/工具卡族——零新变量 ∥ 零新悬停规则） ∥ i18n core 两新档 ≈24/档 ∥ `package.json` 增 `file:` 声明 ±1；档目 **37 ∥ 38** ⇒ **39 ∥ 40**）⇒ **实读增量 +116**（console-chat-align 落地后——同口径净增和；对链上 ≈+154 差 −38；逐档实读见上表）⇒ ≈**+447**（chat-shell-align 批（本批）：`views-chat.mjs` **421 ⇒ ≈330** ∥ `views-chat-composer.mjs` 新 ≈300 ∥ 两 i18n core **14 ⇒ ≈62**/档 ∥ `style.css` **296 ⇒ ≈420**（别名块 + 消息族 + 状态行族 + 会话条/输入区 sticky + 六钮隐藏） ∥ i18n admin 两部件 +9/表；档目 **41 ∥ 42** ⇒ **42 ∥ 43**）⇒ ≈+965（team-projects-permissions 批：`views-projects.mjs` 新 ≈220 ∥ `views-admin-projects.mjs` 新 ≈120 ∥ `views-git-sources.mjs` 新 ≈300 ∥ i18n project 两新档 ≈140/档 ∥ `nav.mjs` +≈4 ∥ `app.mjs` +≈7 ∥ `views-audit.mjs` +≈12 ∥ `i18n.mjs` +≈4 ∥ `style.css` +≈18；档目 **42 ∥ 43** ⇒ **47 ∥ 48**——修订轮按行和收正、R63/R64 增量在含）⇒ **≈−161**（sandbox-onboarding-removal 批：`views-sandbox.mjs` −≈95（托管接入块（⑤ 弹窗 ∥ ⑥ 任务区）删） ∥ i18n admin 两部件 −≈30/表 ∥ `style.css` −≈6——**分项和复算**；**删量两说未取齐（本行 ≈95 ∥ `webui/SANDBOX.md` §3 拆案块 ≈190）——以实施轮实读一次记平（两档同值）；本轮不预设值**；零新档——档目 **47 ∥ 48** 不变） | —— |
（2026-10-11 域内拆分：本行 = 域合计——**冻结为历史**；此后各面档自持「面小计」——本域合计 = 各面之和，不单列。）

## 6. 验收判据（机检）

| 需求 | 设计级判据 | 载体 |
|---|---|---|
| 非功能 · 前端自洽 | `public/**` 零外部引用（无 `http(s)://` 外链 ∥ 无 CDN ∥ 无外链字体——扫描断言，扫描面 = 全量新档）；静态直发 mime 正确 ∥ 路径穿越拒；档目断言随正（口径 = UI 代码档 ∥ 含 favicon 全目录——单源 = `webui/WEBUI.md` §1；链不复述；`-webui-deploy` 件） | 单元测试档 |
| AC-11（控制台 provider 面——判据全文 = `gateway/API.md` §5 AC-11 行） | ⇒ `webui/ADMIN.md` §4（as-of 2026-10-11） | —— |
| AC-12（功能点 14——控制台 IA；已落需求档——`docs/server/requirements/PROJECT.md` 验收表） | `nav.mjs` 直测：组/项结构（我的 3 ⇒ **4**（team-projects-permissions 批——`webui/PROJECTS.md` §2.1）⇒ **5**（sandbox-outbound-member-face 批——`webui/SANDBOX.md` §2.2；2026-10-13）⇒ **6**（team-ledger 批——`webui/LEDGER.md` §2.1；2026-10-13——实读）⇒ **7**（member-face-chat 批——`webui/CHAT.md` §2.2；2026-10-13） ∥ 管理 6（二轮批后）⇒ **7**（弹窗批后——§2）⇒ **8**（代理页批——`webui/SYSTEM.md` §2.2）⇒ **7**（代理回迁批——`webui/SYSTEM.md` §2.2 回迁）⇒ **8**（沙盒运行面批——`webui/SANDBOX.md` §2.1①）⇒ **9**（admin-agent-chat 批——`webui/CHAT.md` §2.1）⇒ **11**（2026-10-12 team-projects-permissions 批——项目 ∥ Git 源两页；`webui/PROJECTS.md` §2.2）⇒ **10**（2026-10-13 project-sources-merge 批——Git 源并入项目页两标签；KD-SV-149）⇒ **11**（server-mcp 批——`webui/MCP.md` §2；2026-10-13） ∥ admin 组仅 admin） ∥ 重定向（`#/me` ⇒ `#/me/keys` ∥ `#/admin` ⇒ `#/admin/overview` ∥ `#/admin/proxy` ⇒ `#/admin/system` ∥ `#/admin/git-sources` ⇒ `#/admin/projects/git-sources`（2026-10-13——重定向带子段）） ∥ 角色默认 ∥ admin 面 `denied` ∥ 子段容许（console-tabs-component 批：`#/<组>/<页>/<子段>` 裁末段 + `sub` 回传——`webui/TABS.md` §2.2）；静态档目随正（单源 = `webui/WEBUI.md` §1——链不复述）∥ 管理页拆分（成员/用量/总览/审计/服务模型各一页——单页堆叠消失） | 单元测试档 |
| AC-13③④（功能点 12——版本/更新可见 ∥ 成员接入卡） | ⇒ `webui/SYSTEM.md` §4（as-of 2026-10-11） | —— |
| AC-14（功能点 13——控制台多语言） | ⇒ `webui/I18N.md` §4（as-of 2026-10-11） | —— |
| AC-15（功能点 15——控制台可见面六面；三拆） | ⇒ ① = `webui/SYSTEM.md` §4（as-of 2026-10-11） ∥ ②–⑤ = `webui/READINGS.md` §4（同刻） ∥ ⑥ = `webui/ME.md` §4（同刻） | —— |
| AC-16（功能点 16——控制台弹窗交互） | ⇒ `webui/ADMIN.md` §4（as-of 2026-10-11） | —— |
| AC-17（功能点 17——服务模型页 ∥ 配置面） | ⇒ `webui/ADMIN.md` §4（as-of 2026-10-11） | —— |
| AC-17（续·机检口径） | ⇒ `webui/ADMIN.md` §4（as-of 2026-10-11） | —— |
| AC-18（功能点 18——Provider 管理面重做） | ⇒ `webui/ADMIN.md` §4（as-of 2026-10-11） | —— |
| AC-19（功能点 19——样式族总体统一） | ⇒ `webui/STYLE.md` §4（as-of 2026-10-11） | —— |
| AC-19（续·机检口径） | ⇒ `webui/STYLE.md` §4（as-of 2026-10-11） | —— |
| AC-20（功能点 20——控制台布局收正） | ⇒ `webui/STYLE.md` §4（as-of 2026-10-11） | —— |
| AC-20（续·机检口径） | ⇒ `webui/STYLE.md` §4（as-of 2026-10-11） | —— |
| AC-21（功能点 21——配额配置面） | ⇒ `webui/ADMIN.md` §4（as-of 2026-10-11） | —— |
| AC-23（功能点 23——成员模型面 v2） | ⇒ `webui/ADMIN.md` §4（as-of 2026-10-11） | —— |
| AC-23（续·机检口径） | ⇒ `webui/ADMIN.md` §4（as-of 2026-10-11） | —— |
| AC-24（功能点 24——上游模型元数据留存与展示） | ⇒ `webui/ADMIN.md` §4（as-of 2026-10-11） | —— |
| AC-24（续·机检口径） | ⇒ `webui/ADMIN.md` §4（as-of 2026-10-11） | —— |
| AC-25（功能点 25——「我的·key 与签发」页重做） | ⇒ `webui/ME.md` §4（as-of 2026-10-11） | —— |
| AC-25（续·机检口径） | ⇒ `webui/ME.md` §4（as-of 2026-10-11） | —— |
| AC-26（功能点 26——「我的·用量」页图表化） | ⇒ `webui/ME.md` §4（as-of 2026-10-11） | —— |
| AC-26（续·机检口径） | ⇒ `webui/ME.md` §4（as-of 2026-10-11） | —— |
| AC-28（功能点 28——server 配置控制台） | ⇒ `webui/SYSTEM.md` §4（as-of 2026-10-11） | —— |
| AC-28（续·机检口径） | ⇒ `webui/SYSTEM.md` §4（as-of 2026-10-11） | —— |
| AC-29①（功能点 29——配置形：控制台编辑面） | ⇒ `webui/ADMIN.md` §4（as-of 2026-10-11） | —— |
| AC-30（功能点 30——代理设置与连通测试） | ⇒ `webui/SYSTEM.md` §4（as-of 2026-10-11） | —— |
| AC-30（续·机检口径） | ⇒ `webui/SYSTEM.md` §4（as-of 2026-10-11） | —— |
| 镜像源族（sandbox-image-sources 批——AC-38） | ⇒ `webui/SANDBOX.md` §4（as-of 2026-10-11） | —— |
| 一键拉取（sandbox-image-quick-pull 批——AC-38 ④） | ⇒ `webui/SANDBOX.md` §4（as-of 2026-10-11） | —— |
| 拉取认源（sandbox-pull-by-source 批——AC-38 ⑤） | ⇒ `webui/SANDBOX.md` §4（as-of 2026-10-11） | —— |
| 沙盒页（server-exec-sandbox 批——AC-36） | ⇒ `webui/SANDBOX.md` §4（as-of 2026-10-11） | —— |
| 管理面 agent 会话页（admin-agent-chat 批） | ⇒ `webui/CHAT.md` §4（as-of 2026-10-11） | —— |
| 成员面（我的·工作区——AC-36 ⑧） | ⇒ `webui/SANDBOX.md` §4（as-of 2026-10-11） | —— |
| 管理面 chat 对齐（console-chat-align 批——KD-SV-101） | ⇒ `webui/CHAT.md` §4（as-of 2026-10-11） | —— |
| 对话页壳面对齐（chat-shell-align 批——功能点 41 ∥ AC-41 ∥ KD-SV-106/107/108/109） | ⇒ `webui/CHAT.md` §4（as-of 2026-10-11） | —— |
| 控制台公共标签页组件（console-tabs-component 批——功能点 39 ∥ AC-39） | ⇒ `webui/TABS.md` §4（as-of 2026-10-11） | —— |
| 卷族（sandbox-volumes 批——AC-40） | ⇒ `webui/SANDBOX.md` §4（as-of 2026-10-11） | —— |
| AC-44（功能点 44——团队项目与权限；控制台面） | ⇒ `webui/PROJECTS.md` §4（as-of 2026-10-12） | —— |
| AC-48（功能点 48——项目面单入口 + 基址门；控制台面） | ⇒ `webui/PROJECTS.md` §4 ∥ `webui/STYLE.md` §4（as-of 2026-10-13） | —— |
| 成员面对话页（member-face-chat 批——功能点 50 ∥ AC-50①；2026-10-13） | ⇒ `webui/CHAT.md` §4（as-of 2026-10-13） | —— |

## 7. 关键决策（本域）

| # | 决策 | 理由 | 被否候选与何故否 |
|---|---|---|---|
| KD-SV-9 | **控制台前端 = vanilla 静态面**（`public/` 静态档组——`node:http` 直发）；零框架 ∥ 零构建 ∥ 零外部资源；哈希路由（IA = §2 ∥ KD-SV-20）；判权全在后端 | 用户 08:09 钉死（先例 = 本仓 webview vanilla 口径）；静态档零依赖贴合内网自洽；视图交互维护性 | 单文件内嵌 HTML（视图/表单增长后难维护）· 前端框架（违零依赖/零构建）· CDN ∥ 外链字体（内网不达）· 构建步骤（bundler——违零构建） |
| KD-SV-20 | **控制台 IA = 侧栏分组导航 + 一页一职责**：组 = 我的（key/用量/账户设置/**项目**/**工作区**/**团队台账**）∥ 管理（总览/**对话**/成员/**项目**（两标签：项目 ∥ Git 源——KD-SV-149）/**Provider**/服务模型/用量统计/审计/系统/**沙盒**）；hash 路由 `#/<组>/<页>`；旧链重定向；解析 = `nav.mjs` 纯函数；窄屏降级顶条 | 用户 16:13 令（单页堆叠被判不专业）；侧栏 = 分组扩展面（系统/文案/后续协同面挂点）；纯函数解析 = 机检可达；零框架零构建不变（KD-SV-9） | 顶栏分区（横向空间有限——中英文案翻倍更挤 ∥ 分组层级浅）· 不重排（被用户否）· 框架路由（违 KD-SV-9）· 服务端路径路由（静态直发面破——hash 保刷新/书签） |
| KD-SV-26 ∥ KD-SV-44 ∥ KD-SV-51 | ⇒ `webui/I18N.md` §1（as-of 2026-10-11） | —— | —— |
| KD-SV-29 | ⇒ `webui/READINGS.md` §1（as-of 2026-10-11） | —— | —— |
| KD-SV-31 ∥ KD-SV-32 ∥ KD-SV-33 ∥ KD-SV-34 ∥ KD-SV-41 ∥ KD-SV-43 ∥ KD-SV-45 ∥ KD-SV-46 | ⇒ `webui/ADMIN.md` §1（as-of 2026-10-11） | —— | —— |
| KD-SV-36 ∥ KD-SV-37 | ⇒ `webui/STYLE.md` §1（as-of 2026-10-11） | —— | —— |
| KD-SV-47 ∥ KD-SV-49 | ⇒ `webui/ME.md` §1（as-of 2026-10-11） | —— | —— |
| KD-SV-52 | **`app.mjs` 拆三档**（结构轮——#993 断点落地）：渲染助手 + `flash` ⇒ `dom.mjs` ∥ 健康轮询 ⇒ `health.mjs`（+ 订阅清零口）∥ `app.mjs` 收窄为入口 | 实读 350 越 300 软线且随批续增；注册预案（健康块单独拆）按当刻实估不回线内（`350−50+1 ≈ 301`——`50` = 删除行数；新档 `≈62` = 删除 50 + 档头/导入 ≈12——§5 同源）；本批随正面已含全部目录断言（边际改点 ≈ 零）；逐字搬移 + 门禁/走查双验 | 不拆（越线续存——裁点 = 用户批准面；代价 = 续增 + 下次触碰重估）· 仅拆健康块（删除 ≈50 行 ⇒ ≈301——不回线内）· 再拆 api/会话块（更碎——随动面增；余量已足） |
| KD-SV-54 | ⇒ `webui/ADMIN.md` §1（as-of 2026-10-11） | —— | —— |
| KD-SV-60 | ⇒ `webui/SYSTEM.md` §1（as-of 2026-10-11） | —— | —— |
| KD-SV-101 | ⇒ `webui/CHAT.md` §1（as-of 2026-10-11） | —— | —— |
| KD-SV-102 ∥ KD-SV-103 | ⇒ `webui/TABS.md` §1（as-of 2026-10-11） | —— | —— |
| KD-SV-106（页面侧；107/108/109 = agent 域——`agent/ADMIN-AGENT.md` §9） | ⇒ `webui/CHAT.md` §1（as-of 2026-10-11） | —— |
| KD-SV-124 | ⇒ `webui/PROJECTS.md` §1（as-of 2026-10-12） | —— | —— |
| KD-SV-181 ∥ KD-SV-182 ∥ KD-SV-183 | ⇒ `webui/TERMINAL.md` §1（as-of 2026-10-13——终端核三件/可复用边界 ∥ 渲染与调色板 ∥ 能力表 v1；sandbox-container-terminal 批） | —— | —— |

## 8. 本域边界（不做的面）

- 独立客户端管理台（不做——需求 §4；管理面 = 内嵌网页）∥ 前端框架 ∥ 构建步骤 ∥ CDN/外部资源 ∥ 移动端适配（桌面优先——窄屏不做承诺）。（成员面接入卡 ∥ 文档面多语言 ∥ 服务端消息/日志语言 ∥ 第三语言 ⇒ 见 `webui/ME.md` §5 ∥ `webui/I18N.md` §5（as-of 2026-10-11）。）
- 二轮不做面 ⇒ 见 `webui/READINGS.md` §5（as-of 2026-10-11）。
- 弹窗批不做面 ⇒ 见 `webui/ADMIN.md` §5（as-of 2026-10-11）。
- Provider 重做批不做面 ⇒ 见 `webui/ADMIN.md` §5（as-of 2026-10-11）。
- 服务模型配置面批不做面 ⇒ 见 `webui/ADMIN.md` §5（as-of 2026-10-11）。
- embed 解耦批不做面（2026-10-09；台账 #1147 ∥ #1148） ⇒ 见 `webui/SYSTEM.md` §5（as-of 2026-10-11）。
- server-model-alias 批不做面（2026-10-09——KD-SV-59） ⇒ 见 `webui/ADMIN.md` §5（as-of 2026-10-11）。
- 样式族批不做面 ⇒ 见 `webui/STYLE.md` §5（as-of 2026-10-11）。
- 布局收正批不做面 ⇒ 见 `webui/STYLE.md` §5（as-of 2026-10-11）。
- 配额分模型批不做面 ⇒ 见 `webui/ADMIN.md` §5（as-of 2026-10-11）。
- 配额 v2 · 成员模型面批不做面 ⇒ 见 `webui/ADMIN.md` §5（as-of 2026-10-11）。
- Provider 模型元数据批不做面 ⇒ 见 `webui/ADMIN.md` §5（as-of 2026-10-11）。
- me-keys 批不做面 ⇒ 见 `webui/ME.md` §5（as-of 2026-10-11）。
- me 用量图表化批不做面 ⇒ 见 `webui/ME.md` §5（as-of 2026-10-11）。
- 结构轮批不做面（2026-10-08）：`style.css` ∥ `index.html` 零触 ∥ `thincoder-server/src/**` 零触（服务端语义零改）∥ 批外档零触（域外发现只报——如 `docs/core/design/API-CONTRACT.md` 坐标）∥ i18n 语义面（键值 ∥ 回退链 ∥ 复数取形）零改 ∥ 门面外消费面（`i18n.mjs` ∥ 视图件 `t()` 面）零改。
- 视图取件面核实（2026-10-08 grep 实读）：`views-*` 十档零 `app.mjs` import——渲染助手/`t`/`flash` 等全经 `ctx` 注入（`viewCtx()` 单点装配）；i18n 表族 = `i18n.mjs` 单点取件 ⇒ `dom.mjs`/`health.mjs` 拆分与门面保留下视图面零触（零触承载面 = `ctx` 注入）。
- 控制台测试 key 修复批不做面（2026-10-09） ⇒ 见 `webui/ADMIN.md` §5（as-of 2026-10-11）。
- server 代理批不做面（2026-10-09） ⇒ 见 `webui/ADMIN.md` §5（as-of 2026-10-11）。
- 配置控制台批不做面（2026-10-09） ⇒ 见 `webui/SYSTEM.md` §5（as-of 2026-10-11）。
- 代理面不做面（2026-10-10 代理回迁批——KD-SV-60） ⇒ 见 `webui/SYSTEM.md` §5（as-of 2026-10-11）。

- 管理面 chat 渲染面不做项（console-chat-align 批——理由逐项 = `webui/CHAT.md` §2.1 对齐集 ⑥⑦⑧⑩⑪） ⇒ 见 `webui/CHAT.md` §5（as-of 2026-10-11）。
- 公共标签页组件批不做面（console-tabs-component 批） ⇒ 见 `webui/TABS.md` §5（as-of 2026-10-11）。
- 团队项目与权限批（team-projects-permissions——B2）不做面 ⇒ 见 `webui/PROJECTS.md` §5（as-of 2026-10-12）。

## 变更记录

- 2026-10-14（**sandbox-onboarding-removal 批 · 设计评审轮 1 修正（fix 轮）· eng-designer**——承批档 `docs/batches/2026-10-14-sandbox-onboarding-removal.md` §3 轮次 1（评审 #141；发现 5 落本档）：§5 小计链本批增量分项和复算（−≈131 ⇒ **≈−161** = −95 −30×2 −6）+ 删量两说取齐注（本行 ≈95 ∥ `webui/SANDBOX.md` §3 ≈190——以实施轮实读一次记平）。**零新语义（评审发现直接导出项）；产品码零触（设计轮）。**

- 2026-10-14（**sandbox-exec-rebuild 批 · 收口修复轮（设计面）· eng-designer**——承批档 `docs/batches/2026-10-13-sandbox-exec-rebuild.md` §6 挂单 D 裁）：§1 站点表「我的」行去 `dirty`（成员工作区列随正——删键）。**产品码零触（设计轮）。**

- 2026-10-14（**sandbox-onboarding-removal 批 · 设计轮 · eng-designer**——承批档 `docs/batches/2026-10-14-sandbox-onboarding-removal.md` §1 · 台账 #1383；用户裁「撤」）：站点表·对话页行用途去「托管接入」∥ §2.8 沙盒页清单去「托管接入」∥ §5 小计链补本批增量（−≈131——`views-sandbox.mjs` −≈95 ∥ i18n admin 两部件 −≈30/表 ∥ `style.css` −≈6）。UI 面清面全文 = `webui/SANDBOX.md` §2.1①（待重做批收口闭后落——批档 §2）。**产品码零触（设计轮）。**

- 2026-10-13（**server-mcp 批 · 设计轮 · eng-designer**——承批档 `docs/batches/2026-10-13-server-mcp.md` §1 · 台账 #1379）：§1 视图档列表 + `views-mcp.mjs`（拟新增）+ JS 档链 59 ⇒ **62 档** + 档目链 **62 ∥ 61 ⇒ 65 ∥ 64** ∥ §2 IA 表 + 管理·MCP 页行（模型后顺位）∥ §5 指向表 + 三行（页件 + i18n 两部件）∥ §6 AC-12 行（管理 10 ⇒ **11**）。同源随动 = `webui/MCP.md`（新档）∥ `webui/I18N.md` §2.1/§3。**产品码零触（设计轮）。**

- 2026-10-13（**sandbox-exec-rebuild 批 · 范围增补 #2（连接面 TLS 档——fix 轮）· eng-designer**——承批档 `docs/batches/2026-10-13-sandbox-exec-rebuild.md` §1「2026-10-13 22:43 · 用户裁定」）：§1 静态面视图档链 58 ⇒ **59 档**（+`views-sandbox-connection.mjs`——拟新增）+ 档目链 **61 ∥ 60 ⇒ 62 ∥ 61** + 指向表增一行。同源随动 = `webui/SANDBOX.md` §2.1①/§3/§4。**产品码零触（设计轮）。**

- 2026-10-06：建档（批 `docs/batches/2026-10-06-server-gateway.md` 设计轮；同日补轮按三层结构 + B 案织入）——webui 域：静态面 ∥ 三视图 ∥ 判权/自托管约束；KD-SV-9。
- 2026-10-06：fix 轮（评审轮次 1 #1）——管理视图数据源句补记：成员表行含各成员 key 清单（提示形 + id——`GET /api/members` 行内；契约 = `accounts/ACCOUNTS.md` §3）。
- 2026-10-06：实施后回填轮（fix）——§1 JS 行与 §5 行数按实读回填（小计 ≈680 ⇒ 558；管理视图未出档）。
- 2026-10-06：控制台 provider/模型管理 + IA 设计轮（批 `docs/batches/2026-10-06-console-providers.md`——需求 §2:11 ∥ §2:14 ∥ 台账 #962/#966）——§1 静态面九档重排（`views.mjs` 退役拆档）∥ §2 重写为「控制台 IA 与视图」（侧栏分组 ∥ 七页 ∥ 旧链重定向 ∥ `nav.mjs` 纯函数 ∥ 窄屏降级 ∥ 首版完备化/多语言面挂点）∥ §3/§4 随正 ∥ §5 预算（小计 558 ⇒ ≈1009）∥ §6 判据补 AC-11/AC-12 行 ∥ §7 增 KD-SV-20（KD-SV-9 行随正：计数句去「三视图」）∥ §8 增多语言留白句。
- 2026-10-06：fix 轮（评审轮次 1 五条——批 `docs/batches/2026-10-06-console-providers.md` §3）：#1 §2 provider 页行/§6 AC-11 行补预设列表端点 ∥ #2 §6 AC-12 行标记收正（已落需求档）∥ #3 §6 前端自洽行档目口径统一（UI 代码档 9 ∥ 含 favicon 全目录 10）。
- 2026-10-06：首版完备化设计轮（批 `docs/batches/2026-10-06-first-release-completeness.md`——需求 §2:12③④ ∥ 台账 #963）——§1 视图档句随正 ∥ §2 系统页行/导航渲染句（meta 槽）随正 ∥ §2.1 增（系统页两节 ∥ meta 槽 ∥ 接入卡 ∥ 文案口径）∥ §5 预算（views-system ⇒ ≈130 ∥ app ⇒ ≈200 ∥ nav ⇒ ≈75 ∥ style ⇒ ≈115；小计 ≈1144）∥ §6 补 AC-13③④ 候补行 ∥ §8 边界补成员面卡句；数据面 = `gateway/API.md` §2.3 ∥ 更新状态 = `ops/OPS.md` §5.4(g)/KD-SV-24。
- 2026-10-06：控制台多语言设计轮（批 `docs/batches/2026-10-06-server-i18n.md`——需求 §2:13 ∥ 台账 #965）——§1 JS 档句（十档）∥ §2 文案面句重写 ∥ §2.1 文案句收编 ∥ 增 §2.2（多语言机制：检测/切换器/文案表/错误映射/覆盖/边界）∥ §5 预算（i18n 三档拟新增；小计 ≈1144 ⇒ ≈1774）∥ §6 补 AC-14 候补行 + 档目口径随正（12 ∥ 13）∥ §7 增 KD-SV-26 ∥ §8 边界随正（留白句已设计化；文档面/服务端语言/第三语言入册）。
- 2026-10-06：fix 轮（评审轮次 1 #1——批 `docs/batches/2026-10-06-first-release-completeness.md` §3）：§2.1 补角色面注句（更新提示 = admin 面 ∥ 版本行 = 全角色——`requirements/PROJECT.md` §2:12③ 按可动作方收窄在案）∥ §6 AC-13③④ 行同拍。
- 2026-10-06：fix 轮（评审轮次 1 #1/#2/#7——批 `docs/batches/2026-10-06-server-i18n.md` §3）：§2.2 增「可测性」条（`i18n.mjs` 模块顶层零浏览器全局——检测输入参数注入）∥ 增「零 CJK 机检口径」条（扫描面 = 前端 JS 代码档——排除 `i18n-zh.mjs` ∥ `i18n-en.mjs` ∥ `index.html`；三档口径；`index.html` 两处静态 CJK = 装配前缺省豁免）∥ 切换器条补自称名规则（`lang.zh`/`lang.en` 固定取 zh 表）∥ 文案表形条补键集口径（除自称名族）∥ §6 AC-14 行同拍。
- 2026-10-06：AC-13③④/AC-14 行候补标记收正（父侧直接执行 · 机械 · 可 revert——已落需求档验收表）。
- 2026-10-06：实施后回填轮（R14——批 `docs/batches/2026-10-06-console-providers.md`）：§5 九档实读收正（小计 558 ⇒ **943**）∥ `views.mjs` 行改退役形（迁移期引文——原读数 244 · as-of）∥ 叠加链同拍（#963/i18n 结果值随 re-base——增量 +135/+630 不动）。
- 2026-10-06：实施后回填轮（R16——批 `docs/batches/2026-10-06-first-release-completeness.md`）：§5 四档实读收正（views-system **59** ∥ app **219** ∥ nav **82** ∥ style **83**；小计 ⇒ **1006**；i18n 叠加链随正）∥ §2.1 接入卡字段收正（`apiKey`）。
- 2026-10-06：实施后回填轮（R18——批 `docs/batches/2026-10-06-server-i18n.md`）：§5 i18n 三档实读翻正（**113** ∥ **198** ∥ **194**）∥ 接线增量实读（app +21 ∥ nav ±0 ∥ views-auth +2 ∥ views-me +1 ∥ views-admin +2 ∥ views-providers +1 ∥ views-system +1 ∥ style +6）∥ 小计 ⇒ **1545**（叠加链随正）∥ §2.2「拟新增」标记随正。
- 2026-10-06：控制台可见面二轮设计轮（批 `docs/batches/2026-10-06-console-completeness-2.md`——需求 §2:15 ∥ 台账 #972）——§1 视图档句重写（+3 档）/ JS 档数（十三档）∥ §2 表增总览/审计两页 + 默认页收正（admin ⇒ `#/admin/overview`）+ 旧链重定向同指 + key/用量/系统行随正 ∥ §2.1 重写（四节：+ 向量服务卡 ∥ 服务健康块；meta 槽 + 状态灯）∥ §2.2 覆盖范围随正 + 新增键族句（≈87 键——拆表断点）∥ 增 §2.3（六面机制：向量/看板/总览/审计/健康/key 细节）∥ §3 判权句随正 ∥ §5 预算（新三档 ∥ 逐档增量；小计 ⇒ ≈2247）∥ §6 补 AC-15 行 + AC-12/AC-13 行随正 ∥ §7 增 KD-SV-29 ∥ §8 边界随正。
- 2026-10-06：fix 轮（评审 #69——批 `docs/batches/2026-10-06-console-completeness-2.md` §3 十项，本档面）：KD-SV-20 管理列举补「总览/审计」∥ AC-12 行删残留（原「管理 4」语句随正）∥ 档目行补「本批后 ⇒ 15 ∥ 16」注（§6 三处口径对齐——12/13 = i18n 后基线）。
- 2026-10-06：控制台弹窗批设计轮（批 `docs/batches/2026-10-06-console-modals.md`——需求 §2:16 ∥ §2:17 ∥ 台账 #973/#974）——§1 视图档句/JS 档数（十五档）随正 ∥ §2 表增服务模型页 + 成员行随正 ∥ §2.2 覆盖（十页）+ 本批键族（≈17 键）+ 表体量句（拆表登记）∥ §2.3⑥ 管理表列面注随正 ∥ 增 §2.4（弹窗机制 ∥ 成员弹窗三态 ∥ 服务模型页）∥ §5 预算（新两档 ∥ 逐档增量；小计 ⇒ ≈2646）∥ §6 补 AC-16/AC-17 行 + AC-12/AC-14/AC-15 行随正（17 ∥ 18 ∥ 管理 7）∥ §7 增 KD-SV-31/32 ∥ §8 边界随正；KD-SV-20 十页。
- 2026-10-06：fix 轮（评审轮次 1 第 2/6 项——批 `docs/batches/2026-10-06-console-modals.md` §3）：§5 六处实读收正（`app.mjs` **299** ⇒ ≈301 ∥ `i18n-zh.mjs` **292** ⇒ ≈309 ∥ `i18n-en.mjs` **288** ⇒ ≈305 ∥ `nav.mjs` **87** ⇒ ≈90 ∥ `style.css` **≈122** ⇒ ≈152 ∥ `views-admin.mjs` **≈100** ⇒ ≈210）+ `app.mjs` 越 300 软线拆分预案 ∥ §2.2 表体量句（双表——≈309 ∥ ≈305）∥ §2.4① 机制名删（策略句保留）。
- 2026-10-06：Provider 管理面重做设计轮（批 `docs/batches/2026-10-06-console-provider-redo.md`——需求 §2:18 ∥ 台账 #980；裁定 21:36 无手填 ∥ 21:40 A 保留服务模型页）——§1 视图档句/JS 档数（十六档）随正 ∥ §2 providers 行重写 ∥ §2.2 键族登记（改值 2 ∥ 新增 ≈13 ∥ 退役 ≈14；表体量 ⇒ ≈311 ∥ ≈307）∥ §2.4 标题 + ④（列表 + 双弹窗 ∥ 勾选机制 ∥ 退役生命周期 ∥ 发现失败径）∥ §5 预算（拆分两档 + style/i18n 增量；小计 ⇒ ≈2840）∥ §6 AC-18 行 + AC-11 行随正 + 档目 18 ∥ 19 五处随正 ∥ §7 增 KD-SV-33 ∥ §8 边界随正；机制全文 = §2.4④。
- 2026-10-06：服务模型配置面设计轮（批 `docs/batches/2026-10-06-models-config.md`——需求 §2:17 ∥ 台账 #981；裁定 21:39「ACDE」∥ 21:40「A 保留」）——§1 静态面（+ `model-specs-snapshot.mjs`；JS 十七档；触面「拟新增」标记随实读收正五处）∥ §2.2 映射集扩 `rate_limited` + 键族登记（净 ≈+26 键）∥ §2.4③ 重写（配置四组 ∥ 停用流 ∥ 退役语义 ∥ 零探针 ∥ 保存/取消 ∥ 与 Provider 页协同）∥ §5 预算（views-models **77 ⇒ ≈235** ∥ 快照新 ≈80 ∥ i18n/style 增量；小计 ⇒ ≈3154）∥ §6 AC-17 行重写（+续行）+ 档目 18 ∥ 19 ⇒ **19 ∥ 20** 五处随正 ∥ §7 增 KD-SV-34 ∥ §8 边界随正；机制全文 = §2.4③；KD-SV-35 = `gateway/API.md` §6。
- 2026-10-06：样式族统一设计轮（批 `docs/batches/2026-10-06-console-list-style.md`——需求 §2:19 ∥ 台账 #982；用户 22:00/22:01）——§2.5 新增（口径五条 ∥ 散置/不一致清单 S1–S17 ∥ 变量族底座 ∥ 族值表 + 逐族套用表 ①–⑩（勘误：+ 码面族 ∥ 变量单源重定位为底座） ∥ 可点行判据 ∥ 空/错/加载态 ∥ #87/#88 接续标注） ∥ §5 预算（style ⇒ ≈216 三批叠加口径；小计 ⇒ ≈3180） ∥ §6 补 AC-19 两行 ∥ §7 增 KD-SV-36 ∥ §8 边界随正；机制全文 = §2.5。
- 2026-10-06：fix 轮（评审 #94——批 `docs/batches/2026-10-06-console-provider-redo.md` §3 九条；本档面）：§6 AC-18 行补错误径（发现失败 ⇒ 提示 +「刷新候选」重试可达候选 ∥ 失败态保存草稿无损；预设拉取失败 ⇒ 提示 + 自定义径照常）∥ §2.4④ 删「收正项」残留 +「测试连接」补 discover 复用句 + 旧表单族类随双弹窗复用（零死类）∥ §2.5 接续标注同句 ∥ §5/§2.2 i18n 净增量口径统一（净 ≈−1/表）∥ §6 删空行回归单表块。
- 2026-10-06：fix 轮（评审 #95——批 `docs/batches/2026-10-06-models-config.md` §3；本档面）：§2.2 映射集改述（可达码 + 预留——`rate_limited` 仅 /v1 面产生）∥ §2.4③ 保存线形明写（键 = 上游名 ∥ 值 = 全字段对象；草稿初值 = GET 行）∥ §5 四档实读收正（拟新增 ⇒ 已落盘：views-usage **139** ∥ views-overview **74** ∥ views-audit **88** ∥ modal **68**）∥ §5 两处「本批」改批名（二轮——views-me/views-system 行）∥ §6 AC-17（续）补 settings 线形机检。
- 2026-10-06：fix 轮（评审 #96——批 `docs/batches/2026-10-06-console-list-style.md` §3 七条；本档面）：§1 行标句收正（越线在册）∥ §2.5 口径④/S1/① 表/⑨ 表/实施面收正（悬停清单制 ∥ ul 清单行纳入 ∥ 系统页诊断失败面补列）∥ §5 三档实读收正（views-me **117** ∥ views-admin **169** ∥ views-system **168**）∥ §6 AC-19 续机检口径同拍 ∥ §7 KD-SV-36 悬停句收正。
- 2026-10-07：布局收正设计轮（批 `docs/batches/2026-10-07-console-layout.md`——需求 §2:20 ∥ 台账 #985）——§2 增壳指针句 ∥ §2.2 键族登记（+5 键） ∥ §2.4②④ 表格形指针 ∥ §2.5 三处随正（`.model-picks` 退役等） ∥ 增 §2.6（机制全文——五页钉表 ∥ 高度链 ∥ 页脚计数 ∥ 回退 ∥ 左对齐 ∥ 弹窗表格形） ∥ §5 预算实读回填 + 本批增量 ∥ §6 补 AC-20 两行 ∥ §7 增 KD-SV-37 ∥ §8 边界随正。
- 2026-10-07：fix 轮（评审 #112——批 `docs/batches/2026-10-07-console-layout.md` §3 四条；本档面）：§5 `app.mjs` 行补「本批不触发拆分」理由 + 重估时点 ∥ §2.2 补登 `admin.members.colActions`（本批 6 键）∥ §2.6⑤ 同拍 ∥ §1 越线三值随 §5 实读收正 ∥ §2.6② 增两条挂载前提（弹窗 ∥ 壳）。
- 2026-10-07：轻笔（用户 08:26「你是不会用tfoot吗？」——批 `docs/batches/2026-10-07-console-tfoot.md`）：§2.6② 三段壳 ⇒ **两段壳** + 高度链表 `.page-foot` 行 ⇒ `body.data-shell main tfoot td`（吸附表底） ∥ §2.6③ 表尾行计数（tfoot——空/错 = 无表无 tfoot） ∥ §6 AC-20 两行同拍（页脚行计数 ⇒ 表尾行计数）。
- 2026-10-07：走查续笔（用户 08:34「弹窗里主细表是一起滚动的」+「provider 的模型列表连顺序都不排」——同轮）：§2.6⑤ 补「**清单序 = 名称升序**」（候选 ∥ 预设清单）+「**弹窗内表自滚**」（`.modal-body .table-wrap` 上限 40vh + 表头吸附——主信息不随动）。
- 2026-10-07：走查续笔二（用户 08:45「出了内外两道垂直滚动条」——40vh 上限行与 `.modal-body` 自身滚并存所致）：§2.6⑤ 弹窗自滚改**伸缩链**（单滚动面——固定块 `flex: none` ∥ 清单区 `min-height: 0` 自滚；外层仅极端兜底）——取代 40vh 上限。
- 2026-10-07：滞账收正（评审 #116 半程信号 + 本笔自纠——滞账四处同拍）：§7 KD-SV-37（:439）「三段壳/`.page-foot`/页脚」「弹窗内吸附（面外）」⇒ 两段壳 + 表内 tfoot + 弹窗自滚带表头吸附；§2.5 :207/:293 与 §2.6② :350「弹窗内表不吸附」⇒ 同拍收正。
- 2026-10-07：**实测修正**（用户 08:53「把表格的滚动给干掉了」——链未接通所致）：伸缩链漏「内容盒」层（`.modal-body > .stack-models` 选择器命不中——真结构 = `.modal-body > div > .stack-models`，`modal.mjs:36` 整只 append 调用层盒）；Edge headless 同构试验台红→绿（V0 复现现场：体滚/表不滚；修正后：表滚/体不滚/短内容贴合——探针在 `.thincoder/tmp`）⇒ §2.6⑤ 选择器全链下钻一层 + `modal-body > div` 承链。
- 2026-10-07：走查收正三（用户 08:58「在弹窗里点测试连接，结果在弹窗外面显示了响应」）：§2.4④ 详情弹窗「测试连接」结果 = 同窗结果行（`testNote`——进行中/成功/失败段内；失败走 `mapError`；原 flash 在弹窗外——AC-18「测试同窗」的落实收正）；随正件 = `-console-provider-redo.test.mjs:443`（断言从 flash 改同窗行 + 零 flash）。
- 2026-10-07：走查收正四（承三 + 父侧常识定则——**弹窗开着 ⇒ 一切反馈落窗内；窗关 ⇒ 页面 flash**）：§2.4④ 两窗同拍——获取模型（空地址/失败 ⇒ 窗内状态行；成功 flash 删——候选即反馈）∥ 保存（未选类型/失败 ⇒ 窗内；401 仍踢登录）∥ 刷新候选 flash 删；窗关后动作 flash 保持。随正件 = `-console-provider-redo.test.mjs` 四处 + `-console-list-style.test.mjs` ④ 计数 12。
- 2026-10-07：修正轮（评审 #119——批 `docs/batches/2026-10-07-console-tfoot.md` §1 补记七；本档面）：「≤40vh」残留三处（:207/:293/:440）⇒「单滚动面伸缩链（§2.6⑤）」∥ §2.5⑨ 错误面坐标四处收正（`views-admin.mjs:45` ∥ `views-me.mjs:67` ∥ `views-models.mjs:79` ∥ `views-providers.mjs:35`）∥ §2.4③ 列表序 = `id` 升序（`views-models.mjs:26`）。
- 2026-10-07：行宽收正（父侧机械折行——§2.6⑤ 363 字符行 ⇒ 折两行；doc-check 行宽闸读数）。**零语义**。
- 2026-10-07：配额分模型批设计轮（批 `docs/batches/2026-10-07-quota-per-model.md`——需求 §2:21 ∥ §2:22 ∥ 台账 #990/#991/#992）——§2 IA 三行随正（成员/服务模型/我的用量）∥ §2.2 键族登记（改值 1 ∥ 新增 ≈10）∥ §2.4② 重写（成员弹窗：分模型覆盖面两态 ∥ 覆盖计数列 ∥ 键级合并提交）∥ §2.4③ 增 F 组（配置区四组 ⇒ 五组；嵌入行注同拍）∥ §5 预算（views-admin 185 ⇒ ≈255 ∥ views-models 199 ⇒ ≈218 ∥ views-me 122 ⇒ ≈126 ∥ app 317 ⇒ ≈320 ∥ i18n 两表 ⇒ ≈344/≈340 ∥ style 223 ⇒ ≈228；小计 ⇒ ≈3165）∥ §6 增 AC-21 行 + AC-17 行随正 ∥ §7 增 KD-SV-41 ∥ §8 边界随正；机制全文 = §2.4②/③；存储/检查 = `store/STORE.md` §2 v5 段 ∥ `metering/METERING.md` §2。
- 2026-10-07：fix 轮（评审 #126——批 `docs/batches/2026-10-07-quota-per-model.md` §3 十项，本档面）：§5 小计复算收正（public 19 档和 **2854 ⇒ 2922**——改前漏计 `modal.mjs` 68；全表 **2932 ⇒ 3000** ∥ 两估随正 ≈3044 ⇒ ≈3112 ∥ ≈3165 ⇒ ≈3233）∥ §6 AC-15 行看板句与 `metering/METERING.md` §4 同拍（同一过滤面；日对齐窗逐值相等）∥ §6 AC-17 行「配置四组」⇒「配置五组」（计数随列举）。
- 2026-10-07：配额 v2 · 成员模型面批设计轮（批 `docs/batches/2026-10-07-quota-v2-member-models.md`——需求 §2:23 ∥ 台账 #1002/#1003/#1004 + 并入 #1001/#994/#995/#988）——§2 两行随正（成员/服务模型）∥ §2.2 增计数复数形（KD-SV-44）+ 键族登记（+2 ∥ −2 ∥ `.one` 7）∥ §2.4② 重写（查看态模型表直显 5 列 ∥ 禁用勾选即时写；编辑态/刷新口径/不做随正）∥ §2.4③ 列表配额列 + 同源口径句 ∥ §5 六行实读回基 + 小计 ⇒ ≈3245（实读 3170）∥ §6 AC-21 ② 重写 + AC-17 ① 随正 + 增 AC-23 两行 ∥ §7 增 KD-SV-43/44 ∥ §8 边界随正；机制全文 = §2.4②（控制台面）∥ `accounts/ACCOUNTS.md` §2.2（禁用）∥ `gateway/API.md` §2.1（执行）。
- 2026-10-07：fix 轮（评审轮次 1——批 `docs/batches/2026-10-07-quota-v2-member-models.md` §3 六发现，本档面）：§6 AC-23 行「候补」标记收正（已落需求档——沿 AC-13/AC-14 先例）∥ §1 越线清单随 §5 实读链收正（`app.mjs` 实读 317 ⇒ ≈320 ∥ i18n 双表 实读 345 ⇒ ≈345 ∥ 341 ⇒ ≈348）+ 补 `views-admin.mjs` 越线条目（行宽守界折行）∥ §5 `views-providers-modals.mjs` 读数链收正（实读 272 ⇒ 300——盘面复核；小计 3170 零随动）∥ §2.4② 注行补离表禁用键口径句（计 N ∥ 列示 ∥ 恢复路径——消歧；裁据 = `accounts/ACCOUNTS.md` §7 B26）。
- 2026-10-07：Provider 模型元数据批设计轮（批 `docs/batches/2026-10-07-provider-model-metadata.md`——台账 #1005 + 并入 #984；用户 12:05/12:23 令）——§1 越线清单随 §5 收正（i18n 双表 ⇒ ≈350/≈353 + 补 `views-providers-modals.mjs` 越线条目）∥ §2.2 键族登记（+5 键）∥ §2.4④ 勾选段重写（候选行富信息 ∥ 上游退役提示 ∥ 加载态 ∥ 保存线形；添加弹窗探针同拍）∥ §2.6⑤ 行形句随正 ∥ §5 预算（视图件 300 ⇒ ≈335 越线在册 + 拆分预案细化 ∥ i18n 两表 ∥ 小计 ⇒ ≈3290）∥ §6 增 AC-24 两行 ∥ §7 增 KD-SV-45/46 ∥ §8 边界随正；机制全文 = §2.4④（展示面）∥ `gateway/API.md` §2.2（数据面）。
- 2026-10-07：fix 轮（评审轮次 1——批 `docs/batches/2026-10-07-provider-model-metadata.md` §3 九发现，本档面）：§2.4④ 保存线补合并优先级（**发现值优先 ∥ 存储补齐**——与显示线同源措辞）+ 添加窗写线明写携 `modelMeta`（探针所得；无探针 ⇒ 省略键）∥ §6 AC-24 行「候补」标记收正（已落需求档——沿 AC-13/AC-14 先例）。
- 2026-10-07：文档清账批（fix 轮——承批档 `docs/batches/2026-10-07-doc-cleanup.md` §2 · 台账 #983）：§5 触面实读收正 +「拟新增」标记随正（`views-providers` **61** ∥ `views-providers-modals` **365** ∥ `model-specs-snapshot` **103** ∥ i18n 两表 **350 ∥ 353**）∥ §2.2 键族登记补清账批复读（行 350 ∥ 353；键 **306 ∥ 311**）。**零语义**。
- 2026-10-07：Provider 候选表列式收正（收口链第一段·设计档形式化——轻通道笔 #1 已成事实入档；批 `docs/batches/2026-10-07-provider-picks-columns.md` · 台账 #1020；用户 15:15「列」令）：§2.4④ 勾选段/候选行富信息收正为**列式**（五列 = 模型 ∥ 展示名 ∥ 上下文 ∥ 视觉 ∥ 状态——首格 `label`；缺则空、零占位） ∥ §2.6⑤ 行形句随正 ∥ §2.2 键族登记重排（净 7 键——+3 列头键 ∥ 删死键 `metaContext` ∥ `metaVision` 转列头）∥ §5 三档实读回填（`views-providers-modals` 367 ∥ i18n 两表 352 ∥ 355）+ 小计 ⇒ 实读 3350 ∥ §6 AC-24 两行随正 ∥ §7 KD-SV-37/45 随正 ∥ §1 越线读数随正。
- 2026-10-07：弹窗宽度收正（收口链第二段·设计档形式化——轻通道笔 #2 已成事实入档；批 `docs/batches/2026-10-07-provider-picks-columns.md` · 台账 #1020；用户 15:24「弹窗宽度都检查一下」令）：§2.5 底座布局行收正（`--modal-w`＝`clamp(560px, 78vw, 1200px)`——视口比例三段式） ∥ §2.5 ⑧ 族 `.modal-body` 行随正（560 不再约束 ⇒ 桌面实际 = 70vh） ∥ 四窗几何（2560×1440：1200×464 ∥ 1200×570 ∥ 1200×929 ∥ 1200×173）；零新变量（AC-19 canon 不破）。
- 2026-10-07：弹窗内双表收缩链收正（收口链第一段·设计档形式化——轻通道笔 #1 已成事实入档；批 `docs/batches/2026-10-07-member-modal-tables.md` · 台账 #1022；用户 15:57 走查报「key 清单被压得看不见」令）：§2.6⑤ 直挂表区句收正为多表收缩口径（`style.css:177-178`——短表〔成员 key 表〕保自然全高（`min-height: min-content`）∥ 长表〔`.quota-table`〕承缩自滚 + 下限 `min-height: 140px` ≈ 三行——再挤 ⇒ 体滚兜底）∥ §2.5⑧ 弹窗内表格行随正（列 + 收缩链）∥ 红绿试验台 = `.thincoder/tmp/2026-10-07-member-keys-walk.mjs`（修前 key 表 h=187/226 切行 ⇒ 修后 h=226=natural ∥ 配额 504/655 自滚 ∥ 体无外滚；560 极端 = key 全高 ∥ 配额 140 触底 ∥ 体滚兜底）。
- 2026-10-07：me-keys 批设计轮（批 `docs/batches/2026-10-07-me-keys-redo.md`——需求 §2:25 ∥ 台账 #1023；用户 16:06 走查 + 16:08「可以」+ 附加两令）——§2 路由表 me/keys 行重写 ∥ §2.3⑥ 重写为「我的·key 与签发页重做」全文（六列密钥表 ∥ 双弹窗 ∥ 复制钮全局随动 ∥ 接入卡成员面同源复用 ∥ 轮换页面下架+端点保留 ∥ 非壳页口径）∥ §2.1 成员面落点句随正 ∥ §2.2 键族登记（+25 ∥ −2 ∥ 改值 4）∥ §2.5① ul 清单行 ⇒ key 表行 + 套用面随正 ∥ §2.6① 排除面句随正 ∥ §5 六行预算 + 小计 ⇒ ≈3505 ∥ §6 增 AC-25 两行 + AC-15⑥/AC-19 续/AC-20 行随正 ∥ §7 增 KD-SV-47 ∥ §8 边界随正；同源随动 = `accounts/ACCOUNTS.md`（端点/命名/上限）∥ `store/STORE.md` v8 段 ∥ `design/PROJECT.md` §4/§7。
- 2026-10-07：fix 轮（评审 #43——批 `docs/batches/2026-10-07-me-keys-redo.md` §3 七号落修；本档面 = #4/#7/#8）：§5 两表行净增口径收正（净 ≈+22 ⇒ **≈+23**——+25 ∥ −2；行数估不动，终值以实施实读为准）∥ §2.2 键族登记补「复用 1 键」条（`me.keys.neverUsed`——「从未使用」）+ §2.3⑥ 表句登记同拍 ∥ §2.5④ 悬停枚举删「ul 清单行」（随 ul 清单退役——与 AC-19 续「行悬停声明 = 2 条」同拍）。
- 2026-10-07：术语定音随正（用户 16:41「惯例都叫apikey」+ 16:43 取 B——批 `docs/batches/2026-10-07-me-keys-redo.md` §1.3 术语门）：me 页新文案实体名「密钥」⇒「API Key」（zh 保留英文原形 ∥ en = "API key"）——§2 路由行 ∥ §2.2 键族登记（改值 `me.keys.listTitle`/`me.keys.empty`）与词汇口径条 ∥ §2.3⑥（页形/表/空态/吊销流）∥ §6 AC-15⑥/AC-25 行 ∥ §7 KD-SV-47；既有四面（nav/管理/审计/接入卡）零触——统一 = 另笔（台账 #1025）。
- 2026-10-07：me 用量图表化批设计轮（批 `docs/batches/2026-10-07-me-usage-charts.md`——用户 22:03 令 ∥ 台账 #1055）——§2 路由行随正（`#/me/usage` = 本人用量看板）∥ §2.2 键族登记（+8 ∥ −1）∥ §2.3 增 ⑦「我的·用量页图表化」全文（页形 ∥ 元素对照表 ∥ 数据面 ∥ 导出判否 ∥ 不做单）∥ §2.5 新面登记 ∥ §2.6② 链 +2 行 ∥ §5 预算（views-me 实读 194 ⇒ ≈280 ∥ views-overview +1 ∥ style 实读 218 ⇒ ≈240 ∥ i18n 两表 375/378 ⇒ ≈382/≈385；小计 ⇒ ≈3630）∥ §6 增 AC-26 两行 ∥ §7 增 KD-SV-49 + KD-SV-29 否决栏随正（「我的用量页趋势/聚合」条目删——改判在 KD-SV-49）∥ §8 边界随正（二轮不做面条目删 + 本批不做面增）；同源随动 = `metering/METERING.md` §3/§4/§5/§6/§7/§8 ∥ `design/PROJECT.md` §4/§6/§7/§9。
- 2026-10-07：fix 轮（评审轮次 1——批 `docs/batches/2026-10-07-me-usage-charts.md` §3 八发现〔🟡1–3 ∥ 🔵4–8〕，本档面 = 🟡1–3 ∥ 🔵4/7/8）：§5 views-me 句收正为条件式（194+85≈279 未越——不拆为实；越线预案在册）+ 算术平（`views-overview` ±0 ∥ i18n 两表 +≈14 ∥ 小计 ≈3626）∥ §2.3⑦ 报表卡上限口径收正（上限 = 页区高 55% + 卡内自滚——明细卡恒得剩余高）+ 殿后行 × `endpoint` 过滤口径明写 ∥ §2.6② 链行同拍 ∥ §2.6① 排除面残留名随正（「我的用量摘要表」⇒「我的用量页报表卡·分模型表」）∥ §6 AC-26 两行随拍；同源随动 = `metering/METERING.md` §3/§4/§5 ∥ `design/PROJECT.md` §6/§9。
- 2026-10-07：轮 2 残余小收正（主 agent 直接执行 · 可 revert——评审轮次 2 残余 ①③）：§1 i18n 增量 +≈22 ⇒ **+≈23**（与 §5/:614 同拍）∥ §2.3 节题补后批面归属（⑥ 功能点 25 ∥ ⑦ 功能点 26）。
- 2026-10-07：实施后回填轮（me 用量图表化批——批 `docs/batches/2026-10-07-me-usage-charts.md`）：§5 五档实读收正（`views-me` **295**（估 ≈279——越估 16，软线内，拆分预案未触发） ∥ `style.css` **228**（估 ≈240——低于估 12） ∥ i18n 两表 **382 ∥ 385**（在估） ∥ `views-overview` **74**（±0 保持））+ 小计按实读平账（**3619** = public 19 档 3541 + `static.mjs` 78——对链上 ≈3626 差 7，累计估差收口）∥ §2.2 键族表体量实读收正 ∥ §2.5 新面登记补 `.bar-legend`（与实装清单同拍）；同源随动 = `metering/METERING.md` §5 ∥ `design/PROJECT.md` §6/§9。
- 2026-10-08：结构轮设计轮（批 `docs/batches/2026-10-08-server-public-structure.md`——台账 #976 ∥ #993；用户 2026-10-08 10:51「还有那些能开的，都开吧」令）——§1 档目/越线清单随正（二十七档；越线余额 = 另两档）∥ §2.2 增「拆表」条 + 零 CJK 口径随正 ∥ §5 七行随正 + 十新行（i18n 八部件 + `dom.mjs`/`health.mjs`）+ 小计 ⇒ ≈3696 ∥ §6 档目链七处随正 + 批面括注 ∥ §7 增 KD-SV-51/52 ∥ §8 边界随正；同源随动 = `design/PROJECT.md` §4/§6/§9 ∥ `requirements/PROJECT.md` AC-12/AC-14（主 agent 笔）；随正件 = **十六件**门禁断言件 + `package.json`（门禁 26 ⇒ 27）。
- 2026-10-08：fix 轮（设计评审轮 1 修正——批 `docs/batches/2026-10-08-server-public-structure.md` §3 八发现：🔴×1 ∥ 🟡×6 ∥ 🔵×1）：§6 AC-14 行收正（排除面前缀式（门面 + 十部件） ∥ 三档措辞族式 ∥ 三新档 ⇒ 十新档直发——机制零动）∥ §7 KD-SV-52 否决栏算术收正（`350−50+1 ≈ 301`——`50` = 删除行数 ∥ 新档 `≈62` = 删除 50 + 档头/导入 ≈12——§5 同源）∥ §2.2 拆表条折行（三段——零语义）∥ §8 增视图取件面核实句（grep 实读：视图零 `app.mjs` import——`ctx` 注入）∥ §7 KD-SV-51 门面引注收正（合一写法 ⇒ `i18n-zh.mjs` ∥ `i18n-en.mjs` 两档名）∥ 随正件件数收正（十四 ⇒ **十六**——四处同拍）。
- 2026-10-08：fix 轮（设计评审轮 2 修正——批 `docs/batches/2026-10-08-server-public-structure.md` §3 复评新发现：🟡×2）：§6 四处档目注补「⇒ 结构轮后 **29 ∥ 30**」（`:528` ∥ `:536` ∥ `:540` ∥ `:542`——零语义补链）。
- 2026-10-08：实施后回填轮（父侧直接执行 · 机械 · 可 revert——批 `docs/batches/2026-10-08-server-public-structure.md`）：§6 AC-20 续机检口径行落点收正（`app.mjs`——`dataShell` 在册 ⇒ 拆面 **`dom.mjs`**——`dataShell` 在册 ∥ `app.mjs`——`SHELL_PAGES` 五路径逐条钉表——与实施实读同拍）。**零语义**（落点收正）。
- 2026-10-09：控制台测试 key 缺陷修复批设计轮（批 `docs/batches/2026-10-09-server-console-testkey-fix.md`——台账 #1120；用户 11:38/11:40 裁定）——§2.4④ 详情弹窗两处调用点 key 口径收正（测试连接 ∥ 刷新候选 = 草稿 key：明填 ⇒ `apiKey` 明传 ∥ 留空 ⇒ `providerId` 回落 ∥ 清除勾 ⇒ 显式空 `apiKey: ""`）∥ §6 AC-18 行补机检子句 ∥ §7 增 KD-SV-54 ∥ §8 增本批不做面句 ∥ §5 一行行数随正（实读 367 ⇒ ≈375）；零新档零新键（文案零动——契约/架构零改）。
- 2026-10-09：fix 轮（评审轮次 1 #3——批 `docs/batches/2026-10-09-server-console-testkey-fix.md` §3）：§2.4④ 机制行补清除勾优先序（清除勾 ⊃ 明填——另填值 ∧ 清除勾 ⇒ 以清除为准；保存同式）∥ §6 AC-18 行点名两调用点（「测试连接」∥「刷新候选」——含首开自动拉取）。
- 2026-10-09：实施回填收正（控制台测试 key 修复批——批 `docs/batches/2026-10-09-server-console-testkey-fix.md`）：§5 `views-providers-modals.mjs` 行 ≈375 ⇒ **实读 376**（+9——实施落地）∥ §5 小计行 ≈3704 ⇒ ≈3705 同拍；父侧直接执行 · 机械计数 · 可 revert。
- 2026-10-09：预设面处置登记（随正——批 `docs/batches/2026-10-09-provider-default-model-purge.md` · 台账 #1122；评审轮 2 观察 #9）：§2.4④ 添加弹窗预设径补句——预设形 `models` 缺省 = **空**（服务端预设表零 `model` 键——2026-10-09 清除批）⇒ 模型清单表 = 空表；勾选走「模型发现」（详情弹窗「刷新候选」——§2.4④）。**零新语义**（数据源失落随正登记）。
- 2026-10-09：server 代理批设计轮（批 `docs/batches/2026-10-09-server-gemini-openai-preset.md`——台账 #1128 ∥ #1129；用户 13:45/13:5x 两令）——§2.4④ 两窗增「走代理」勾选（添加 ∥ 详情——保存变更才携 ∥ 测试/刷新探针随携）∥ §6 AC-18 行补勾选子句 ∥ §8 增不做面句 ∥ §5 两档行数随正（`views-providers-modals` 376 ⇒ ≈395 ∥ i18n 两表 +1 键）；机制全文 = `gateway/API.md` §6 KD-SV-55。**产品码零触（设计轮）**。
- 2026-10-09：配置控制台设计轮（批 `docs/batches/2026-10-09-server-console-config.md`——台账 #1139 ∥ #1138 ∥ #1123；用户 15:51–15:57 三连）——§1 静态面（+ `views-system-config.mjs`——JS 二十八档）∥ §2 IA 表系统行 ∥ §2.1 五节重写（+ 服务配置卡（只读三行/可写四项/指针两行/保存——重启生效） ∥ 向量卡配置面（三输入/保存/草稿探活——KD-SV-54 口径镜像））∥ §2.2 键族登记（+29 键 ∥ `useProxy` 改值）∥ §2.3① 随正 ∥ §2.4④ 勾选框文案改向 ∥ §5 预算（新档 ≈130 ∥ views-system ⇒ ≈230 ∥ i18n 两表 ⇒ ≈151/表；小计 ⇒ ≈3975）∥ §6 增 AC-28 两行 + 档目链随正（**30 ∥ 31**）∥ §8 增不做面；#1123 复核 = 盘面十行（`dom.mjs` ∥ `health.mjs` ∥ i18n 八部件）实读在场、零「拟新增」残留（翻正动作 = 无）。机制全文 = `ops/OPS.md` §1（配置写面）+ §8 KD-SV-56 ∥ 端点 = `gateway/API.md` §2.4。
- 2026-10-09：设计修正轮（fix——批 `docs/batches/2026-10-09-server-console-config.md` §3 评审发现 3/4/5/10/11，本档面）：§2.3④ 审计类型下拉随正（全部 + **十型**）+ 详情模板补 `keys` 支 ∥ §2.1 向量卡补提交/探活三态（未编辑 ⇒ 不携 ∥ 编辑 ⇒ 明传 ∥ 清除勾 ⇒ `""`——掩码/引用回显形不作明传值）∥ §5 `views-audit.mjs` 行补本批增量（≈94）+ 小计算术配平（≈3975 ⇒ **≈3978**——分项闭式）∥ §6 AC-15① 删「配置真值行」（无设计落点元素——配置面 + 草稿探活替代读法） + AC-28 续「清单」指针改指 `design/PROJECT.md` §6 注⑬（实际落点）。**零新语义**（评审发现直接导出项）。
- 2026-10-09：embed 解耦批设计轮（批 `docs/batches/2026-10-09-server-embedding-decouple.md`——台账 #1147 ∥ #1148；用户 17:24 两条之 1/2）——§2.1 向量卡补「未配置」态（缺段 ⇒ 不自动探活；保存即创建）∥ §2.2 键族登记（+2 ∥ −1）∥ §2.4③ 列表派生去引擎行 + 详情弹窗嵌入行退场 + 不做面随正 ∥ §5 三行预算随正（views-system ⇒ ≈245 ∥ views-models ⇒ ≈208；小计 ⇒ ≈3987）∥ §6 AC-15①/AC-17①/AC-23② 补缺段与退场判据 + AC-28 补 ⑨ 缺段创建 ∥ §8 增 embed 解耦批不做面。**产品码零触（设计轮）**。
- 2026-10-09：设计修正轮（fix——批 `docs/batches/2026-10-09-server-embedding-decouple.md` §3 评审发现 1/2/3/4/7，本档面）：§7 KD-SV-32 列表组成去 `embedding.model`（嵌入引擎模型退场——与 KD-SV-58 同拍）∥ §2.4③ 配额列死支「嵌入行 ⇒「—」」删净 ∥ §2 路由表 `#/me/usage` 行 + §2.3① + §6 AC-15① 补缺段用户面提示条「不渲染」口径 ∥ §5 i18n 四部件行并「实读 ⇒ 本批增量」注（system 实读 153 ⇒ ≈155 ∥ admin 实读 138 ∥ 142 ⇒ ≈137 ∥ 141）+ `views-admin.mjs` ±0 注 ∥ §6 AC-26/AC-28 两行「候补」标记收正（已落需求档）。**零新语义**（评审发现直接导出项）。
- 2026-10-09（**server-model-alias 批 · 设计轮 · eng-designer**——承批档 `docs/batches/2026-10-09-server-model-alias.md` §2 · 台账 #1153 + 并入 #1010 ∥ #1151；需求 §2:29 + AC-29；用户 20:32/20:36 令）：§2.1 向量卡追加「用法」行随段显隐（#1151）∥ §2.2 键族登记（+4 键——admin 部件）∥ §2.4② 成员弹窗模型列随正（对外标识）∥ §2.4③ 列表/详情/配置六组（**增 G · 别名**）/保存线 ∥ §2.4④ 勾选段补富项分列句（#1010③）+ 脚区条目保形 ∥ §5 五处行数随正（`views-models` ⇒ ≈240 ∥ `views-providers-modals` ⇒ ≈395 ∥ i18n 两表 ⇒ ≈141/≈145；小计 ⇒ ≈4035）∥ §6 AC-17 六组/AC-21 键形/AC-23 列随正 + **增 AC-29① 行** + AC-28 续行「用法」句 ∥ §8 增本批不做面句。**产品码零触（设计轮）**。
- 2026-10-09：设计修正轮（fix——批 `docs/batches/2026-10-09-server-model-alias.md` §3 评审发现 1/4/5①/6②，本档面）：§6 AC-17 行判据指针收正（「AC-29⑤ 行」⇒ **AC-29① 行**——与 §6 AC-29① 判据行同指）∥ §2.4③ A 行明写停用径载荷形（PATCH `models` 全量数组——其余条目按名匹配保形携带（别名不丢）；§6 AC-17 行同拍）∥ G 组占位口径收正（占位 = 静态文案——`admin.models.aliasPh`；§6 AC-29① 行同拍）∥ §5 小计算术配平（+≈48 ⇒ **+≈49** ∥ ≈4035 ⇒ **≈4036**——分项闭式；同源随动 = `design/PROJECT.md` §6）。**零新语义**（评审发现直接导出项）。明细 = 批档 §2 修复轮块。
- 2026-10-09（**console-proxy-page 批 · 设计轮 · eng-designer**——承批档 `docs/batches/2026-10-09-console-proxy-page.md` §2 · 台账 #1158；需求 §2:30 + AC-30；用户 21:06 令「代理设置要放在单独的标签里，另外，应该有测试功能。」）：§1 静态面（+ `views-proxy.mjs`——JS 二十九档）∥ §2 路由表增代理行 ∥ §2.1 服务配置卡去 proxy.uri（可写三项）∥ §2.2 键族登记（+18 ∥ −2 ∥ `useProxy` 改值）+ 拆表域界补 `proxy.*`（system 部件）∥ §2.4③ 管理 8 随正 ∥ §2.4④ 勾选文案改指「代理」页 ∥ **增 §2.7（代理页全文——KD-SV-60）** ∥ §5 预算（新档 ≈110 ∥ views-system-config ≈96 ∥ nav/app/i18n 随动；小计 ⇒ ≈4171）∥ §6 档目链随正（**31 ∥ 32**）+ AC-28 续行三写控件随正 + **增 AC-30 两行** ∥ §7 增 KD-SV-60 + KD-SV-20 枚举补「代理」 ∥ §8 增不做面；同源随动 = `gateway/API.md` §2.4 ∥ `ops/OPS.md` §1。**产品码零触（设计轮）**。
- 2026-10-09：服务配置卡排版收正（收口链第一段·设计档形式化——轻通道笔 #1154 已成事实入档；批 `docs/batches/2026-10-09-console-cfg-layout.md` · 台账 #1154；用户 20:48 走查令）：§2.1 服务配置卡增「**排版 = 逐项竖排**」句（`.provider-form.stacked` 三规则 = 块级流 ∥ label 列形 ∥ `.key-clear` 行形还原——`style.css:115-118` ∥ `views-system-config.mjs:9/:92`——笔时行号；现盘 `:9/:90`〔代理页批随动——2026-10-10 收口复核 #3〕）∥ §2.5③ 表单容器行登记 `.stacked` 修饰（引 §2.1）∥ §5 `style.css` 行补记（实读 229 ⇒ **233**——走查收正笔 +4；小计同拍）∥ 走查读数 = ECS 实机逐项竖排成对（2026-10-09 21:02）；零语义（字段集合 ∥ 提交体 ∥ 文案零变——纯排版面）。
- 2026-10-09：设计修正轮（fix——批 `docs/batches/2026-10-09-console-proxy-page.md` §3 评审发现 6，本档面）：§6 AC-15 行「配置面（本批——…）」⇒「配置面（配置控制台批——…）」（批名式——消「本批」误读）∥ §5 `views-system-config.mjs` 行补「可写四项 ⇒ **三写控件**」注（代理页批口径——与 §2.1 ∥ §6 AC-28 续行同拍）。**零新语义**（评审发现直接导出项）。明细 = 批档 §2 修复轮块。
- 2026-10-09：实施后回填轮（代理页批——批 `docs/batches/2026-10-09-console-proxy-page.md` · eng-designer）：§5 `views-proxy.mjs` 行「拟新增」翻正（**实读 119**）∥ 七触面行实读回填（`views-system-config.mjs` **103** ∥ `nav.mjs` **89** ∥ `app.mjs` **192** ∥ i18n system 两部件 **172 ∥ 172** ∥ shell 两部件 **74 ∥ 72**）+ 小计实读增量 **+155** ∥ §6 档目口径实读（**31 ∥ 32**）。**零语义**（读数 ∥ 标记）。
- 2026-10-10：清账轮簇Ⅱ server 面小收批（批 `docs/batches/2026-10-10-server-face-residues.md` · 台账 #1161 + 并入 #1162 ∥ #1169 ∥ #1170；2026-10-10 实施轮）：§2.1 服务配置卡补计数口径句（卡面可写三 = 白名单五键 − 代理页 `proxyUri` − 向量卡 `embedding`；面级计数 = 五——#1170）∥ §5 `views-system-config.mjs` 行两处「可写四项」补「（卡面）」作用域词（#1170）∥ 快照档 `model-specs-snapshot.mjs` 命名空间兜底取末段 + 注两处机制句收正（#1169——行表零动）。**句面**（计数口径澄清 ∥ 语义零变）。
- 2026-10-10（**桌面行为残渣批 · 实施轮 · eng-coder**——承批档 `docs/batches/2026-10-10-desktop-behavior-residues.md` §2 · 台账 #979）：§2.4① 公共弹窗组件条增两行——**清单例窗** `closeActiveModal()`（幂等单源）+ **路由收口**（`route()` 起点调用 ⇒ 路由切换后零弹窗残留；覆盖 `rerender()` ∥ `boot()` hashchange 径）∥ §5 两行实读回填（`modal.mjs` **68 ⇒ 77** ∥ `app.mjs` **192 ⇒ 194**）。**零新语义**（行为面 · 读数）。明细 = 批档 §5。
- 2026-10-10：清账轮簇Ⅱ server 面小修/清账批（批 `docs/batches/2026-10-10-server-small-fixes.md` · 台账 #1025；2026-10-10 实施轮）：§2.3⑥ 页题「我的 key」⇒ **「我的 API Key」** ∥ §2.6⑤ 成员表列「key 数」⇒ **「API Key 数」** ∥ §2.2 键族登记「词汇口径（一名两形——登记）」⇒ **统一现状句**（四面 + 新页统一 = 「API Key」——14 键值统一：nav/管理表题与四列/审计三型/接入卡与团队行（枚举外延 +1——父侧 2026-10-10 本刻裁定：同实体不留半清）/页题/秘密标签/用量报表键列；provider 凭证三键 ∥ `vector.clearApiKey` = 异实体零触）。**句面**（文案口径收正 ∥ 键集零变 389 ∥ 394）。
- 2026-10-10（**console-proxy-back 批 · 设计形式化轮 · eng-designer**——承批档 `docs/batches/2026-10-10-console-proxy-back.md` §2 · 台账 #1199；需求 §2:30 + AC-30 回改；用户 2026-10-10 08:22「服务器的代理设置还是放回系统设置页面。」+ 08:41「测试要保留。」）：§1 静态面（`views-proxy.mjs` 退役——JS 二十九 ⇒ **二十八档**；`views-*` 十二 ⇒ **十一档**）∥ §2 路由表代理行删（系统行补「服务配置含代理 ∥ 连通测试块」）+ 旧链 `#/admin/proxy` ⇒ `#/admin/system` ∥ §2.1 服务配置卡（代理行 = 第四写控件 ∥ 连通测试块 = 卡内第二表单；计数口径 = 卡面可写四）∥ §2.2 键族登记（退役 3 键 ∥ 在册代理键 15 ∥ `useProxy` 改值——键数 **386 ∥ 391**）∥ §2.4③ 管理 7 随正 ∥ §2.4④ 勾选文案改指「系统」页 ∥ **§2.7 重写**（服务配置卡内——回迁形）∥ §5 `views-proxy.mjs` 行转退役形 + 七触面实读回填（`views-system-config.mjs` **166** ∥ `nav.mjs` **88** ∥ `app.mjs` **192** ∥ i18n system **170 ∥ 170** ∥ shell **73 ∥ 71**）+ 小计实读增量 **−65** ∥ §6 档目链随正（**31 ∥ 32 ⇒ 30 ∥ 31**）+ AC-12/15/28 行随正 + AC-30 两行重写 ∥ §7 KD-SV-60 重写（回迁形）+ KD-SV-20 枚举去代理 ∥ §8 不做面随正；同源随动 = `gateway/API.md` ∥ `ops/OPS.md` ∥ `design/PROJECT.md`。**产品码零触**（形式化轮——码已落）。
- 2026-10-10（**runner-admin-console 批 · A 批最小切片设计 · eng-designer**——承批档 `docs/batches/2026-10-10-runner-admin-console.md` §1 · 台账 #1252；用户 19:59 令）：§1 静态面（`views-sandbox.mjs` 拟新增 ⇒ **本批新建**——运行面卡 + 容器区）∥ §2.2 键族登记补分两轮口径 + `err.upstream_error` 值改（携 `{detail}`——人话可见）∥ §2.8 定形（两轮分落 + **① 运行面重写**（节点表/三弹窗/容器区——逐控件）∥ 数据面可达码随正）∥ §5 预算（`views-sandbox.mjs` ≈210 ∥ nav +1 ∥ app +3 ∥ i18n admin +≈26/表 ∥ shell +1/表 ∥ style +≈7；小计 ⇒ ≈+275）∥ §6 档目链随正（**31 ∥ 32**——运行面批）+ 沙盒/成员面两行分轮 + AC-12/15/17 管理 8 归运行面批 ∥ 同源随动 = `sandbox/SANDBOX.md` §3/§8 ∥ `gateway/API.md` §2.5。**产品码零触（设计轮）**。
- 2026-10-10（**server-exec-sandbox 批 · 设计轮 · eng-designer**——承批档 `docs/batches/2026-10-10-server-exec-sandbox.md` §2 · 台账 #1224；需求 §5 沙盒块 + 用户 14:00 两平面裁定 + 14:08 必交面行）：§1 静态面（+ `views-sandbox.mjs` ∥ `views-sandbox-egress.mjs`——JS 二十八 ⇒ **三十档**；`views-*` 十一 ⇒ **十三档**）∥ §2 路由表增沙盒行 + **增 §2.8（沙盒页全文——六面 ∥ 每配置项有 UI 写入口 ∥ 非壳页）** ∥ §2.2 键族登记（+≈62 键）∥ §5 预算（两新档 + 六触面；小计 ⇒ ≈+682）+ 档目链随正（**32 ∥ 33**）∥ §6 档目链七处随正 + **增沙盒 AC 行**（建议编号 AC-36）+ AC-12/15/17 管理 8 随正 + AC-28 续审计型面句 ∥ 同源随动 = `sandbox/SANDBOX.md` §8 ∥ `gateway/API.md` §2.5。**产品码零触（设计轮）**。
- 2026-10-10（**server-exec-sandbox 批 · 设计评审轮 1 修正（fix 轮）· eng-designer**——承批档 `docs/batches/2026-10-10-server-exec-sandbox.md` §3 轮次 1 之 1/2/7/8 + 用户 14:56 直令）：§1 静态面（+ `views-me-sandbox.mjs` 拟新增——JS 三十 ⇒ **三十一档**；`views-*` 十三 ⇒ **十四档**）∥ §2 路由表增我的·工作区行 ∥ §2.2 错误映射集补 `sandbox_unavailable` + 覆盖范围页数随正（十二页）+ 键族登记（沙盒批 ⇒ ≈78 键：admin ≈60 ∥ me ≈14 ∥ shell +2 ∥ system +2）∥ §2.3④ 审计型面十 ⇒ **十二型**（两新型模板入册）∥ §2.8 ① 运行面补加入流程三件（可复制命令 ∥ 有效期 ∥ join 失败审计行）+ ② 工作区写入口 = 每工作区覆写（资源/TTL）+ ⑤ 覆写指针 + 每配置项句随正 + 数据面补成员面指针 ∥ **增 §2.9**（我的·工作区）∥ §5 预算（`views-me-sandbox` 新 ≈120 ∥ nav +2 ∥ app +5 ∥ i18n me 两部件 +≈14/表；小计 ⇒ ≈+833）+ 档目链随正（**33 ∥ 34**）∥ §6 档目链随正 + 沙盒/成员面两行 + 运行面三件句 + AC-12 我的 4 ∥ §7 KD-SV-20 组面随正。**零新语义**（评审发现直接导出项 + 用户直令）。
- 2026-10-10（**server-exec-sandbox 批 · 残差对齐（fix 轮）· eng-designer**——承评审 #143 交卷点出的同族残留；父侧裁定：换依据不删观点）：§7 KD-SV-34 行「D 直引核件（KD-SV-2）」⇒「D 直引核件（引核口径 KD-SV-78）」（KD-SV-2 范围 = 网关（provider 层）面——`design/PROJECT.md` §5）；同族收正 = `ops/OPS.md` §1/§8 三处。**零新语义**（KD-SV-78 裁定的残差对齐）。
- 2026-10-10（**runner-admin-console 批 · 设计档随正 · eng-designer**——承批档 `docs/batches/2026-10-10-runner-admin-console.md` §1 · 台账 #1252；用户 2026-10-10 19:52–19:56 口径「runner = 远程 Docker API 节点」）：§2.8① 运行面重写（节点清单 = 名/地址/状态/版本/自检读数；写入口 = 添加/删除节点（连通自检）；排空等随设计轮）∥ §2.8⑤ 读数句随正 ∥ §6 沙盒页行随正。**产品码零触**。
- 2026-10-10（**runner-admin-console 批 · 托管接入（管理面 agent）设计 · eng-designer**——承批档 §2 · 台账 #1236/#1237；用户 22:19–22:29 四句 + 15:00/15:02 裁）：§2.8① 增托管接入块（钮 ∥ 弹窗八字段 ∥ 装机任务区三态 + 读数展开 + 撤销钮；在途 3s 轮询）∥ §2.2 键族登记补托管接入 ≈30 键 ∥ §5 预算（`views-sandbox.mjs` ≈210 ⇒ ≈285 ∥ i18n admin 两部件 +≈30/表 ∥ `style.css` +≈6；小计 ⇒ ≈+141）∥ §6 沙盒页行补托管接入机检口径（档目 31 ∥ 32 不变）；同源随动 = `sandbox/SANDBOX.md` §3/§8① ∥ `gateway/API.md` §2.5。**产品码零触（设计轮）**。
- 2026-10-10（**runner-admin-console 批 · 设计评审轮 1 修正（fix 轮）· eng-designer**——承批档 `docs/batches/2026-10-10-runner-admin-console.md` §3 轮次 1 之 6/13）：#6 §2.2 键族登记补托管接入 ≈30 键一步（新增 ≈108 键 ∥ admin ≈90；表链 ⇒ ≈167/≈171 ⇒ ≈197/≈201 ⇒ ≈231/≈235——与 §5 链取齐）∥ #13 §2.8① 托管接入弹窗字段单补 S5 预告知句（既有容器短暂中断）。**零新语义**（评审发现直接导出项）。
- 2026-10-11（**admin-agent-chat 批 · 设计轮 · eng-designer**——承批档 `docs/batches/2026-10-11-admin-agent-chat.md` §1 · 台账 #1254；需求 §5「两个 chat 界面」②④）：§1 静态面（+ `views-chat.mjs`——JS 二十九 ⇒ **三十档**；`views-*` 十二 ⇒ **十三档**；`views-sandbox.mjs` 拟新增标记翻正）∥ §2 IA 表增对话行（管理组第 2 位——总览后）+ §2.3④ 审计型面十二 ⇒ **十三型** + 详情模板补 `summary` 支 ∥ §2.2 覆盖范围页数随正（十三页）+ 键族登记（+≈33 键）∥ §2.8⑥ 审计页随动句随正 ∥ **增 §2.10（管理面对话页全文——流式读取/新会话弹窗/四形渲染/不做单）** ∥ §5 预算（`views-chat.mjs` 新 ≈300 ∥ nav +1 ∥ app +2 ∥ i18n admin 两部件 +≈32/表 ∥ `views-audit.mjs` +≈4 ∥ `style.css` +≈10；小计 ⇒ ≈+380）+ 档目链随正（**32 ∥ 33**；余面批 ⇒ 34 ∥ 35）∥ §6 档目链七处随正 + **增管理面 agent 会话页行** + AC-12/15/17 管理 9 随正 + AC-28/30 续型面数随正 ∥ §7 KD-SV-20 组面随正（管理组增「对话」）。同源随动 = `agent/ADMIN-AGENT.md` §11/§12 ∥ `store/STORE.md` §2 v14 段 ∥ `gateway/API.md` §2.8 ∥ `accounts/ACCOUNTS.md` §2.1。**产品码零触（设计轮）**。
- 2026-10-11（**admin-agent-chat 批 · 设计评审轮 1 修正（fix 轮）· eng-designer**——承批档 `docs/batches/2026-10-11-admin-agent-chat.md` §3 轮次 1 之 6/8）：#6 §2.10 新建会话缺省模型口径统一到 KD-SV-87（「最近一次成功所用」——两档同词）∥ #8 §2.2 两行归属收正（代理回迁批「表体量」行归位本条目；admin-agent-chat 批键数 468 ∥ 473 明写组成 = 实读基线 386 ∥ 391 + 沙盒两批新增 +82）。**零新语义**（评审发现直接导出项）。
- 2026-10-11（**sandbox-docker-admin 批 · 设计轮 · eng-designer**——承批档 `docs/batches/2026-10-11-sandbox-docker-admin.md` §1 · 台账 #1265；用户 04:36/04:39 两族同批）：§1 静态面（+ `views-sandbox-containers.mjs` ∥ `views-sandbox-images.mjs`——`views-*` 十三 ⇒ **十五档**（本批 +2）⇒ 十七档（余面批）；`modal.mjs` 标记随正（窗体助手四件迁入））∥ §2.2 增键族登记一条（+≈50 键——容器详情/日志/用量/镜像族；表链随正）+ 表体量链随正 ∥ §2.8 标题/形态行改「分三轮落」+ ① 容器区续扩（详情/日志窗 + 镜像区）+ 拆档缘由句 ∥ §5 预算（`views-sandbox.mjs` 实读 494 ⇒ 本批拆档 ≈355 ∥ `views-sandbox-containers.mjs` 新 ≈300 ∥ `views-sandbox-images.mjs` 新 ≈140 ∥ `modal.mjs` ⇒ ≈115 ∥ i18n admin 两部件 +≈50/表 ∥ `style.css` ⇒ ≈266；小计 ⇒ ≈+449）+ 档目链随正（**34 ∥ 35**；余面批 ⇒ 36 ∥ 37）∥ §6 档目链各处随正（本批 +2）+ 沙盒页行分轮随正；**链补登**：i18n admin 两部件链补 admin-agent-chat 批一步（+≈32 键——前批漏登；AC-29① 档目链同拍补一步）。同源随动 = `sandbox/SANDBOX.md` §3/§11 ∥ `gateway/API.md` §2.5 ∥ `accounts/ACCOUNTS.md` §2.1。**产品码零触（设计轮）**。
- 2026-10-11（**sandbox-docker-admin 批 · 设计评审轮 1 修正（fix 轮）· eng-designer**——承批档 `docs/batches/2026-10-11-sandbox-docker-admin.md` §3 轮次 1 之 4/8）：#4 §2.2 沙盒批表链注明链计法（只累沙盒族键——不含同期其它批；档绝对终值随 §5）——消「≈231 vs ≈313」两说 ∥ #8 §2.8「本批」混指两处改批名（`运行面批落定` ∥ `托管接入增补`——消同节混指）。**零新语义**（评审发现直接导出项）。
- 2026-10-11（**sandbox-docker-admin 批 · 评审 #8 同族收尾 · 主 agent 直接执行 · 可 revert**）：§2.8 文案行/§6 沙盒页行同族「本批」残留两处改批名（`runner-admin-console 批`——消同节混指）。**零语义**。
- 2026-10-11（**admin-agent-chat 批 · 实施轮上抛回笔（fix 轮）· eng-designer**——承批档 `docs/batches/2026-10-11-admin-agent-chat.md` §6（实施轮上抛处置 + notice 补裁——④ 空回合单列 · 四值枚举））：§2.10 增 notice 行文案映射句（四值 ⇒ 四键 `noticeInterrupted`/`noticeBudget`/`noticeModelError`/`noticeEmpty` + 枚举外/缺位原文兜底；en 面零 CJK 判据 = 枚举命中前提）∥ 新建会话缺省机械读法随拍（四处同词）∥ §2.2 键族登记与 §2.10 页形行 notice 三形 ⇒ **四形**（一致性面同拍——列报）。**零新语义**。
- 2026-10-11（**sandbox-docker-admin 批 · 记录收正（fix 轮）· eng-designer**——父侧裁定（#194 + #1270））：§2.8① 容器表钮面随正（**六钮**——详情/启动/停止/重启/日志/删除；与 `sandbox/SANDBOX.md` §8① 取齐）∥ §2.2 沙盒族再拆登记（**拆分定义**——`i18n-{zh,en}-sandbox.mjs`；执行 = 实施轮）∥ §5 i18n admin 两部件实读回填（**316 ∥ 320**）+ 新两档行（拟新增）+ 小计链随拍。**产品码零触。**
- 2026-10-11（**sandbox-image-sources 批 · 设计轮 · eng-designer**——承批档 `docs/batches/2026-10-11-sandbox-image-sources.md` §1 · 台账 #1274；用户 09:17 四点（④ 撤）+ 09:19 预选）：§2.8 标题随正（① 续二：镜像源族）+ 增镜像源卡句（源表/两弹窗/目录浏览窗/五分类读绪）+ 本地镜像表过滤句；§5 预算随正（+ `views-sandbox-image-sources.mjs` 拟新增 ≈230；`views-sandbox-images.mjs` 118 ⇒ ≈138；`views-sandbox.mjs` 372 ⇒ ≈380；i18n sandbox 两部件 147 ∥ 147 ⇒ ≈177 ∥ ≈177；`style.css` 261 ⇒ ≈265；小计链补本批 ≈+272；i18n sandbox 拆分执行读数收正（admin 174 ∥ 178 ∥ sandbox 147 ∥ 147））；§6 档目链随正（各处 36 ∥ 37 ⇒ **37 ∥ 38**（现盘面）⇒ 余面批 **39 ∥ 40**）+ **增镜像源族行**（AC-38 控制台面）+ 沙盒页行分轮随正。**产品码零触（设计轮）**。
- 2026-10-11（**sandbox-image-sources 批 · 设计评审轮 1 修正（fix 轮）· eng-designer**——承批档 `docs/batches/2026-10-11-sandbox-image-sources.md` §3 轮次 1 之 3/5）：#3 §2.2 增键族登记一条（镜像源族 +≈30 键/表——镜像源卡 ∥ 增/改/删弹窗（预选下拉） ∥ 目录浏览窗（两列表 + 过滤） ∥ 五分类读绪；零退役；表体量随文）∥ #5 §5 小计链收正（本批 **≈+322**——复算 = 分项和：230 + 20 + 8 + 30×2 + 4；同拍 = `design/PROJECT.md` §6）∥ §6 镜像源族行用例链随拍（B52–**B56**）。**零新语义**（评审发现直接导出项）。
- 2026-10-11（**sandbox-image-quick-pull 批 · 设计轮 · eng-designer**——承批档 `docs/batches/2026-10-11-sandbox-image-quick-pull.md` §1 · 台账 #1276；用户 13:18 裁「要」）：§2.8 标题随正（① 续二：镜像源族 + 一键拉取）+ §2.8① 增「一键拉取」句（入口/可用态/节点选单/预填逐值/零新端点）+ 拉取窗句补可选预填与「目标节点」行；§2.2 增键族登记（+3 键——sandbox 两部件 183 ⇒ ≈186）；§5 母批实读回填（#1275——`views-sandbox-image-sources.mjs` **275** ∥ `views-sandbox-images.mjs` **132** ∥ `views-sandbox.mjs` **375** ∥ i18n sandbox **183 ∥ 183** ∥ `style.css` **266**；小计实读增量 **+369**）+ 本批增量（≈+86）；§6 增一键拉取行 + 沙盒页行分轮随正；同节「本批」陈值改批名（7 处——消混指；列报）。**产品码零触（设计轮）**。
- 2026-10-11（**sandbox-image-quick-pull 批 · 设计评审轮 1 修正（fix 轮）· eng-designer**——承批档 `docs/batches/2026-10-11-sandbox-image-quick-pull.md` §3 轮次 1 之 1/3）：#1 §2.2 增「复用 2 键（零新增）」条（`admin.sandbox.noNodes` ∥ `admin.sandbox.allOffline`——运行面批已落；两表在盘 `i18n-{zh,en}-sandbox.mjs`（zh `:11`–`:12` ∥ en `:11`–`:12`）；消费点 `views-sandbox.mjs:104`）+ §6 一键拉取行引用钉全形键名（另三处 = `sandbox/SANDBOX.md` §3/§11/§12——同拍）∥ #3 §6 各行「本批」混指收齐（「sandbox-image-sources 批（本批）后」⇒「sandbox-image-sources 批后」（18 处）∥「sandbox-docker-admin 批（本批）」⇒ 批名（9 处——含 §2.2/§5 同形五处）∥ 镜像源族行「§11 本批行」⇒「§11 sandbox-image-sources 批判据行」∥ 沙盒页行「本批 +≈30 键」⇒「sandbox-image-sources 批 +≈30 键」）；未收处（如实列——自名/他批形，非本笔编辑面）：§2.2 各条「；本批；」自名形 ∥ §5 各档「（本批 +≈N）」他批形 ∥ §1/§2.4/§2.5/§2.8 历史「本批」（逐条自名其批——以当刻盘面为准）。**零新语义**（评审发现直接导出项）。
- 2026-10-11（**sandbox-image-quick-pull 批 · 实施后回填轮 · eng-designer**——承批档 `docs/batches/2026-10-11-sandbox-image-quick-pull.md` §5 · 台账 #1276）：§5 本批逐档实读收正（`views-sandbox-image-sources.mjs` **364** ∥ `views-sandbox-images.mjs` **136** ∥ `views-sandbox.mjs` **376** ∥ i18n sandbox 两部件 **189 ∥ 189** ∥ `style.css` **267**（零改；实施前口径差 1 见行注））+ 小计实读增量 **+101**（同口径净增和；对链上 ≈+86 越 15）；**零语义**（读数）。
- 2026-10-11（**sandbox-pull-by-source 批 · 设计轮 · eng-designer**——承批档 `docs/batches/2026-10-11-sandbox-pull-by-source.md` §1 · 台账 #1281；用户 2026-10-11 18:15 裁「A」+ 18:17 令（UX 反问））：§2.8 标题/沙盒页行分轮链补「① 续三：拉取认源（sandbox-pull-by-source 批）」（分三轮 ⇒ **四轮**）+ §2.8① 拉取窗句增「经由源」选单（控件形/组装/认源态/可用态两分支/拉取不阻断）+「单输入」改「引用输入」；§2.2 增键族登记（+3 键——sandbox 两部件 189 ⇒ ≈192；复用 `admin.sandbox.sourcesEmpty`）；§5 本批增量（≈+53——`views-sandbox-images.mjs` ≈**181** ∥ `views-sandbox-image-sources.mjs` ≈**366** ∥ i18n sandbox ≈**192 ∥ ≈192**）；§6 增拉取认源行 + 沙盒页行分轮随正；同源随动 = `sandbox/SANDBOX.md` §3/§9/§11/§12/§13/§14/§15 ∥ `design/PROJECT.md` §2.1/§4/§5/§6/§7/§9。**产品码零触（设计轮）**。
- 2026-10-11（**console-chat-align 批 · 设计轮 · eng-designer**——承批档 `docs/batches/2026-10-11-console-chat-align.md` §1 · 台账 #1282；用户 18:23 指出「第四套 chat」+ 18:30「改」）：§2.10 重写（呈现面 = 复用 `thincoder-render-core`——复用形（同源第二根 `/rc/*` ∥ `file:` 声明 ∥ 镜像双装打包径 ∥ 转义/CSP 三列对照）∥ 对齐集 ①–⑤ 做 + ⑥–⑪ 不做（逐项理由）∥ 壳面归属 ∥ 核件词面 i18n ∥ ECS 走查清单指针）；§1 静态面（双根句 + i18n 部件十 ⇒ **十二档**；JS 链 34 ⇒ 35（sandbox-image-sources 批 +1——补链）⇒ **37**（本批 +2））；§2.2 增键族登记一条（+2 档 ∥ 5 键——键 = 核件原名，值逐字同 VSC locales）+ 核件词面部件域界定义；§3 渲染转义句收窄（「不拼 HTML 串」自加句退场——用户 08:09 原话半句不动）；§5 预算（`views-chat.mjs` 399 ⇒ ≈430 ∥ `static.mjs` 78 ⇒ ≈110（双根） ∥ `style.css` 267 ⇒ ≈310（核类名族样式） ∥ + 两新档 ≈24/档；小计链补本批 ≈+154）；§6 档目链随正（**37 ∥ 38**（现盘面）⇒ **39 ∥ 40**（本批落定后）；余面批 ⇒ **41 ∥ 42**）+ **增本批行**（复用形/对齐集/走查判据）；§7 增 KD-SV-101（复用形 + 纪律句）；§8 边界增不做项；同源随动 = `agent/ADMIN-AGENT.md` §11 ∥ `design/PROJECT.md` §2.1/§4/§6/§9。**产品码零触（设计轮）**。
- 2026-10-11（**sandbox-pull-by-source 批 · 设计评审轮 1 修正（fix 轮）· eng-designer**——承批档 `docs/batches/2026-10-11-sandbox-pull-by-source.md` §3 轮次 1 之 3/5 + 用户 2026-10-11 18:33 裁定（P1 ∥ P2 采纳））：§6 拉取认源行「提交 = 输入原文」收正（= 输入框当刻文本（组装后可见值））∥ §2.8① 拉取窗句（「目标节点」行恒显（P1）∥ 选单记忆预选（P2——预选态非自动改写）∥ 一键拉取句随拍）∥ §2.2 `pullTarget` 行注收正（恒显行）∥ §5 本批增量复算收正（≈+50 ⇒ **≈+53**——分项和 45 + 2 + 3×2）；**语义 = 评审发现直接导出项 + 用户 18:33 裁定落定**。
- 2026-10-11（**console-chat-align 批 · 设计评审轮 1 修正（fix 轮）· eng-designer**——承批档 `docs/batches/2026-10-11-console-chat-align.md` §3 轮次 1 之 1–12）：#1 §2.10 增「node 侧同缝」子条（`thincoder-server/test/rc-resolve.mjs` 钩子 + `prepublishOnly` 链行 `--import` 预载——沿桌面 `test/rc-resolve.mjs` 先例）+ 既有件随正登记（`docs/batches/2026-10-11-admin-agent-chat-ui.test.mjs`）+ §6 本批行补批内件腿可执行口径 ∥ #2 转义/CSP 列收窄（「零内联」作用面 = 控制台自有档 + 核件内联状态色后果句——桌面 `style-src 'self'` 同态）∥ #3 §5 两门面行补实读 14 ⇒ ≈15（+1 import）∥ #4 核件词面域界改「核件 `t()` 发射段集——本批消费面 ∪ 预留（现读 ≈21 段）+ 扫描机检」 ∥ #5 §2.10 Dockerfile 行补实读 39 ⇒ 回填注 ∥ #6 部署随正补 README 构建上下文两行 ∥ 仓根 `.dockerignore` ∥ npm 装机径声明（判据 = 缺包 fail-loud） ∥ #7 §3 删两退场式分句（历史 = 本节）∥ #8 值逐字同 VSC locales ⇒ 批内件逐键相等断言 ∥ #9 `setStrings` 注册改「装配期 + 每次语言切换重注册」 ∥ #10 「（现盘面）」挂位收正（§6 十七行 + 本节：**37 ∥ 38**（现盘面）⇒ **39 ∥ 40**（本批落定后））+ i18n 部件十 ⇒ 十二（§2.2 两处）；同源随动 = `design/PROJECT.md` §2.1/§2.3/§6/§9/变更记录。**零新语义**（评审发现直接导出项）。
- 2026-10-11（**console-chat-align 批 · 实施后回填轮记录补笔 · 主 agent 直接执行 · 可 revert**——原笔 = eng-designer #237；承批档 `docs/batches/2026-10-11-console-chat-align.md` §5.1 实读）：§5 七行实读回填（`static.mjs` **114** ∥ `views-chat.mjs` **421** ∥ `style.css` **296** ∥ 两门面 **15 ∥ 15** ∥ 两 i18n core **14 ∥ 14**）+ 小计实读增量 **+116**；§2.10 Dockerfile 行 **实读 41**。**零语义**（读数）。
- 2026-10-11（**常用源预选表补第 7 条（实走修正 · 轻通道）· 主 agent 直接执行 · 机械 · 可 revert**——承轻通道轮 `docs/batches/2026-10-11-light-walkthrough-fixes.md` §1 pen1；用户 20:14 实走发现）：§2.10 增/改弹窗句 + §6 镜像源族行 预选下拉 六 ⇒ **七条**（+ `Docker Hub 镜像（1ms.run）`——`docker.1ms.run`）。同源随动 = `sandbox/SANDBOX.md` §3 ∥ `gateway/API.md` §2.5 ∥ 代码表 `SOURCE_PRESETS`。零新语义。
- 2026-10-11（**console-chat-align 批 · §2.2 登记行收正 · 主 agent 直接执行 · 机械 · 可 revert**——实施轮上抛①导出）：`:144` 「零退役；`admin.chat.*` 31 键」⇒「**四键退役**（§2.7-1 裁决）；`admin.chat.*` **27 键**留 admin」（与 §2.7-1 裁决对齐）。零新语义。
- 2026-10-11（**server-doc-split 批 · 域内拆分（迁移）· eng-designer**——承批档 `docs/batches/2026-10-11-server-doc-split.md` §2）：§2.1–§2.10 按面外拆八档（`webui/SANDBOX.md` ∥ `webui/CHAT.md` ∥ `webui/SYSTEM.md` ∥ `webui/READINGS.md` ∥ `webui/ME.md` ∥ `webui/ADMIN.md` ∥ `webui/STYLE.md` ∥ `webui/I18N.md`——逐字迁入，零语义）；§2/§5/§6/§7/§8 原位保位 stub（粒度 = 节 ∥ 文件行 ∥ AC 号 ∥ KD 号 ∥ 段）+ 文内 § 引用改指（跨档 `webui/新档` 带档名形）；§1 增档目链单源句（§5/§6/§7 行内链删——收口 §1）∥ §1 静态面清单句面随面档；§5 小计冻结为历史（各面自持面小计）；档头增面档导航；超宽行仅拆行（母行 `:144`/`:151`/`:587`/`:591`——拆后落各面档）。**产品码零触。**
- 2026-10-11（**console-tabs-component 批 · 设计轮 · eng-designer**——承批档 `docs/batches/2026-10-11-console-tabs-component.md` §1 · 台账 #1286；用户 2026-10-11 21:05 原话；功能点 39 ∥ AC-39）：§1 静态面（公共组件句增 `tabs.mjs`（已落）；JS 链 37 ⇒ **38**（本批 +1——`tabs.mjs`）；档目链 39 ∥ 40（现盘面）⇒ **40 ∥ 41**（本批）⇒ 42 ∥ 43（余面批））；§2 沙盒页行增分标签句 + 路由解析句增子段容许（当轮呈用户）；**增 §2.11 stub**（公共标签页组件——⇒ `webui/TABS.md` §2.1）；§6 增本批 AC-39 行 + AC-12 行补子段容许腿；§7 增 KD-SV-102 ∥ KD-SV-103 指针行；§8 增本批不做面指针。同源随动 = `webui/TABS.md`（新档） ∥ `webui/SANDBOX.md` §1/§2.1①/§3/§4 ∥ `webui/STYLE.md` §2.1/§3。**产品码零触（设计轮）。**
- 2026-10-11（**sandbox-volumes 批 · 设计轮 · eng-designer**——承批档 `docs/batches/2026-10-11-sandbox-volumes.md` §1 · 台账 #1291；用户 2026-10-11 21:18 三件 + 21:22 裁「先按不考虑加挂的原方案开批」；需求 40 ∥ AC-40）：§1 静态面（+ `views-sandbox-volumes.mjs`（已落——卷族件）；JS 链 38 ⇒ **39**（本批 +1）；档目链 40 ∥ 41（现盘面）⇒ **41 ∥ 42**（本批）⇒ 43 ∥ 44（余面批））；§6 增本批行（AC-40 ⇒ `webui/SANDBOX.md` §4）。**产品码零触（设计轮）。**
- 2026-10-11（**chat-shell-align 批 · 设计轮 · eng-designer**——承批档 `docs/batches/2026-10-11-chat-shell-align.md` §1 · 台账 #1292；用户 21:55 裁「全套 ∥ 补后端一件不藏 ∥ VSC 式」；功能点 41 ∥ AC-41）：§1 静态面（+ `views-chat-composer.mjs`（已落——输入区适配层）；JS 链 39 ⇒ **40**（本批 +1）；档目链 41 ∥ 42（sandbox-volumes 现盘面）⇒ **42 ∥ 43**（本批）⇒ 44 ∥ 45（沙盒余面批））；§5 预算（`views-chat.mjs` 421 ⇒ ≈330 ∥ `views-chat-composer.mjs` 新 ≈300 ∥ 两 i18n core 14 ⇒ ≈62/档 ∥ `style.css` 296 ⇒ ≈420 ∥ i18n admin 两部件 +9/表；小计链补本批 ≈+390）+ 增行（`views-chat-composer.mjs` → `webui/CHAT.md` §3）；§6 增本批行（AC-41 ⇒ `webui/CHAT.md` §4）；§7 增 KD-SV-106 指针行（107/108/109 = agent 域——`agent/ADMIN-AGENT.md` §9）。同源随动 = `webui/CHAT.md` §1/§2.1/§3/§4 ∥ `webui/STYLE.md` §2.1/§3/§5 ∥ `agent/ADMIN-AGENT.md` §6/§11 ∥ `gateway/API.md` §1/§2.8 ∥ `design/PROJECT.md` §4/§7。**产品码零触（设计轮）。**
- 2026-10-11（**console-tabs-component 批 · 设计定稿轮（fix）· eng-designer**——承批档 `docs/batches/2026-10-11-console-tabs-component.md` §2 ∥ 用户 2026-10-11 21:24 裁定（四项全取）：§2 路由解析句子段容许收为定稿（裁定「进」——与 `webui/TABS.md` §2.2/§4 同拍）；§6 AC-12 行子段容许腿随正（批名式）；变更记录历史行形式收正（零语义）。**零新语义；产品码零触。**
- 2026-10-11（**console-tabs-component 批 · 设计评审轮 1 修正（fix 轮）· eng-designer**——承批档 `docs/batches/2026-10-11-console-tabs-component.md` §3 轮次 1 之 1/2/5（父侧受理）：#1 档目链口径随正（「（现盘面）」移回 console-chat-align 批后 **39 ∥ 40**；本批后态改标「console-tabs-component 批落定后 **40 ∥ 41**」；补列 sandbox-image-sources 批 +1 一步）∥ #2 §5 补行（`tabs.mjs` 拟新增行 ⇒ `webui/TABS.md` §3 ∥ `app.mjs` 现读 **197** + 本批 ≈+2 ∥ `nav.mjs` 现读 **91** + 本批 ≈+8——`webui/TABS.md` §2.2）∥ #5 §2 沙盒行「本批分标签」⇒「console-tabs-component 批分标签」（批名式）。**零新语义（评审发现直接导出项）；产品码零触。**
- 2026-10-11（**sandbox-volumes 批 · 设计评审轮 1 修正（fix 轮）· eng-designer**——承批档 `docs/batches/2026-10-11-sandbox-volumes.md` §3 轮次 1 之 1/8（父侧受理）：#1 §2.8 stub 标题分期链计数收正（分四轮 ⇒ **五轮**）+ 补「① 续四：卷族（sandbox-volumes 批）」；同节全节枚举补「卷族」∥ #8 §5 补本批新档行（`views-sandbox-volumes.mjs` ⇒ `webui/SANDBOX.md` §3；同族 `tabs.mjs` 行现盘已在——他轮已补）。**零新语义（评审发现直接导出项）；产品码零触。**
- 2026-10-11（**chat-shell-align 批 · 设计评审轮 1 修正（fix 轮）· eng-designer**——承批档 `docs/batches/2026-10-11-chat-shell-align.md` §3 轮次 1 之 6 + 发现 1 连带；父侧受理全单）：§5 本批小计复算收正（≈+390 ⇒ **≈+447**——分项和 −91 + 300 + 48×2 + 124 + 18）∥ §5 管理面 chat 渲染面不做项范围随正（⑥–⑪ ⇒ ⑥⑦⑧⑩⑪——发现 1 连带）。**零新语义**（评审发现直接导出项）。
- 2026-10-12（**team-projects-permissions 批（B2）· 设计轮 · eng-designer**——承批档 `docs/batches/2026-10-12-team-projects-permissions.md` §1 · 台账 #1216；需求 44 ∥ AC-44）：§1 静态面（+ 三视图档（`views-projects.mjs` ∥ `views-admin-projects.mjs` ∥ `views-git-sources.mjs`——拟新增）+ i18n project 两部件；JS 链 40 ⇒ **45**（本批 +5）；档目链 42 ∥ 43 ⇒ **47 ∥ 48** ⇒ 沙盒余面批 49 ∥ 50）；§2 IA 表增三行（我的·项目（`#/me/projects`——置于账户后）∥ 管理·项目 ∥ 管理·Git 源（置于成员后））+ 增 §2.12 stub；§3 判权句补项目面（会话 + 能力矩阵）；§5 预算（三视图新档 ∥ i18n project 两新档 ∥ nav/app/views-audit/i18n.mjs/style.css 随动；小计链补本批 ≈+740）+ 增五行；§6 增 AC-44 行 + AC-12 行链随正（我的 3 ⇒ 4 ⇒ 5 ∥ 管理 9 ⇒ **11**）；§7 KD-SV-20 组面随正（两面增项）+ 增 KD-SV-124 指针行；§8 增本批不做面指针。同源随动 = `webui/PROJECTS.md`（新档） ∥ `project/PROJECTS.md`（新档） ∥ `webui/I18N.md` §2.1/§3 ∥ `webui/READINGS.md` §2.1④/§3 ∥ `design/PROJECT.md` §1–§7。**产品码零触（设计轮）。**
- 2026-10-12（**team-projects-permissions 批（B2）· 设计修订轮（fix）· eng-designer**——承批档 `docs/batches/2026-10-12-team-projects-permissions.md` §3（评审 #277）∥ 用户 2026-10-12 授权两件）：§5 小计链本批段随正（≈+740 ⇒ **≈+965**——三视图新档 220/120/300 ∥ i18n project 两新档 ≈140/档 ∥ `style.css` +≈18；按行和收正）。**产品码零触（设计轮）。**
- 2026-10-12（**console-chat-live-step 批 · 设计轮 · eng-designer**——承批档 `docs/batches/2026-10-12-console-chat-live-step.md` §1 · 台账 #1325；**AC-41 ② 缺陷收正**；KD-SV-132）：§1 静态面（+ `views-chat-messages.mjs`（已落——对话页消息面）；`views-chat-composer.mjs` 标记收正（拟新增 ⇒ chat-shell-align 批新建）；JS 链 40 ⇒ **41**（本批 +1）；档目链 chat-shell-align 批后 42 ∥ 43 ⇒ **本批后 43 ∥ 44**（现盘面）——后续链随正 +1）∥ §5 增本批文件行（⇒ `webui/CHAT.md` §3）。同源随动 = `webui/CHAT.md` §1/§2.1/§3/§4/§5/§6/变更记录 ∥ `agent/ADMIN-AGENT.md` §11.3 ∥ `design/PROJECT.md` §2.1/§4/§6。**产品码零触（设计轮）。**
- 2026-10-13（**sandbox-outbound-member-face 批 · 设计轮 · eng-designer**——承批档 `docs/batches/2026-10-13-sandbox-outbound-member-face.md` §1 · 台账 #1233/#1234；用户 2026-10-13「全做」）：§1 静态面（`views-me-sandbox.mjs` 拟新增 ⇒ **本批新建**；JS 链 46 ⇒ **47**（本批 +1）；档目链 team-projects-permissions 批后 48 ∥ 49 ⇒ **本批后 49 ∥ 50**（现盘面）——后续链随正 +1）∥ §2 路由表我的·工作区行补「所属 runner」列 ∥ §6 AC-12 行链随正（我的 ⇒ **5**——本批落）。同源随动 = `webui/SANDBOX.md` §2.2/§3/§4/§5/变更记录 ∥ `sandbox/SANDBOX.md` §8/§11/§13/§14/§16 ∥ `gateway/API.md` §2.7。**产品码零触（设计轮）。**
- 2026-10-13（**team-ledger 批 · 设计轮 · eng-designer**——承批档 `docs/batches/2026-10-13-team-ledger.md` §1 · 台账 #1206；功能点 32⑥ ∥ AC-32）：§1 静态面（JS 链 47 ⇒ **50**（本批 +3——`views-ledger.mjs` + i18n ledger 两部件）；i18n 部件 14 ⇒ **16**；档目链补本批段（as-of 盘面实读基线 50 ∥ 49 ⇒ **53 ∥ 52**——链上「沙盒余面批后 51 ∥ 52」与盘面在途差在案））∥ §2 IA 表增我的·团队台账行（`#/me/ledger`——末位）；§5 预算（`app.mjs` ⇒ ≈208 ∥ `nav.mjs` ⇒ ≈105）∥ §6 AC-12 行链随正（我的 5 ⇒ **6**——本批）。同源随动 = `webui/LEDGER.md`（新档） ∥ `design/PROJECT.md` §1–§7 ∥ `webui/I18N.md` §2.1/§3（本批随动项）。**产品码零触（设计轮）。**
- 2026-10-13（**sandbox-outbound-member-face 批 · 设计评审轮 1 修正（fix 轮）· eng-designer**——承批档 `docs/batches/2026-10-13-sandbox-outbound-member-face.md` §3 轮次 1 之 8/9）：§1 静态面 `views-me-sandbox.mjs` 两处口径统一（`:16`/`:171`——「拟新增——沙盒余面批」⇒「拟新增——**本批新建**（sandbox-outbound-member-face 批）」；`:404` 变更记录已同口径）∥ §5 四行补本批段（`app.mjs` ⇒ ≈212 ∥ `nav.mjs` ⇒ ≈106 ∥ 两 i18n shell ⇒ ≈75/≈73——本批 +1/表；两在途批序以实施当刻盘面实读为准）∥ 随正件明列（逐件现读 = 批档 §2 修复节 + `sandbox/SANDBOX.md` §16 R73②）。**零新语义**（评审发现直接导出项）；产品码零触。
- 2026-10-13（**team-ledger 批 · 设计评审轮 1 修复（fix 轮）· eng-designer**——承批档 `docs/batches/2026-10-13-team-ledger.md` §3 轮次 1 之 4）：§6 AC-12 行链收正（我的 4 ⇒ **5 ∥ 6**——as-of 盘面实读基线 4；在途两批各 +1，序以实施当刻实读收正——设计轮陈写「⇒ 5 ⇒ 6」随本条收正）。**零新语义**（评审发现直接导出项）；产品码零触（设计轮）。
- 2026-10-13（**project-sources-merge 批 · 设计轮 · eng-designer**——承批档 `docs/batches/2026-10-13-project-sources-merge.md` §2 · 功能点 48 ∥ AC-48；用户 2026-10-13 16:07 两条）：§1 静态面（`views-admin-projects.mjs` 转两标签壳 ∥ `views-git-sources.mjs` 转面板件——页题 h2 撤；**零新档** ∥ 文件集/档目链/JS 链不变）；§2 IA 表两行合一行（项目——两标签）+ 增子段行 stub + 旧链迁移句补 `#/admin/git-sources` ⇒ `#/admin/projects/git-sources`；§2.12 标题随正；§5 `nav.mjs` 行补本批净 ±0（管理 11 ⇒ 10）∥ `views-git-sources.mjs` 行补转面板件；§6 AC-12 行随正（管理 ⇒ **10** + 别名腿）；§7 KD-SV-20 管理枚举收正（项目 = 两标签）。同源随动 = `webui/PROJECTS.md` §1/§2.2/§2.3/§2.4/§3/§4/§5 ∥ `webui/STYLE.md` §1/§2.3/§3/§4 ∥ `webui/TABS.md` §1/§2.2/§5。**产品码零触（设计轮）。**
- 2026-10-13（**project-sources-merge 批 · 设计评审轮 1 修复（fix 轮）· eng-designer**——承批档 `docs/batches/2026-10-13-project-sources-merge.md` §3 轮次 1 之 1/2/4/6）：§2 路由解析句补解析序（别名先行 ∥ 别名目标再走子段裁分 ⇒ `sub` 回传）∥ §5 nav/app 两行链尾收正（实读 **104** ⇒ 净 ±0 ∥ 实读 **206** ⇒ ≈**204**）∥ §6 AC-12 管理链补「⇒ **11**」一步（team-projects-permissions 批）+ **增 AC-48 行**（⇒ `webui/PROJECTS.md` §4 ∥ `webui/STYLE.md` §4）∥ §7 KD-SV-20 我的组枚举补「**团队台账**」。**零新语义**（评审发现直接导出项）；产品码零触。
- 2026-10-13（**member-face-chat 批 · 设计轮 · eng-designer**——承批档 `docs/batches/2026-10-13-member-face-chat.md` §1 · 台账 #1215；用户 19:32/19:33；需求功能点 50 ∥ AC-50①）：§1 静态面（+ 成员对话页三件（`views-me-chat.mjs` ∥ `views-me-chat-messages.mjs` ∥ `views-me-chat-composer.mjs`——拟新增）；JS 链 50 ⇒ **53**；i18n 部件零新档；档目链 **53 ∥ 52 ⇒ 56 ∥ 55**）∥ §2 IA 表增我的·对话行（`#/me/chat`——首位）∥ §5 `app.mjs`/`nav.mjs` 两行补本批段 ∥ §6 AC-12 行链随正（我的 6 ⇒ **7**）+ **增本批行**（AC-50① ⇒ `webui/CHAT.md` §4）。同源随动 = `webui/CHAT.md`（本档——§2.2 新增） ∥ `agent/MEMBER-AGENT.md`（新档） ∥ `webui/ME.md` §3 ∥ `design/PROJECT.md` §1–§7。**产品码零触（设计轮）。**
- 2026-10-13（**sandbox-container-terminal 批 · 设计轮 · eng-designer**——承批档 `docs/batches/2026-10-13-sandbox-container-terminal.md` §1 · 台账 #1374）：§1 视图档清单 + 四新档（终端核三件 + 控制台消费件——JS 档 53 ⇒ **57** ∥ 档目链 **56 ∥ 55 ⇒ 60 ∥ 59**）∥ §5 增四行（各指 `webui/TERMINAL.md` §3 ∥ `webui/SANDBOX.md` §3）∥ §7 增 KD-SV-181/182/183 行。**产品码零触（设计轮）。**
- 2026-10-13（**member-face-chat 批 · 设计评审轮 1 修正（fix 轮）· eng-designer**——承批档 `docs/batches/2026-10-13-member-face-chat.md` §3 轮次 1 之 14）：#14 §5 两 shell 文案表行补现读/增量注（`i18n-zh-shell.mjs` ⇒ ≈76 ∥ `i18n-en-shell.mjs` ⇒ ≈74——各 +1 键 `nav.page.me.chat`）。**零新语义**（评审发现直接导出项）；产品码零触（设计轮）。
- 2026-10-13（**member-face-chat 批 · 裁定修订轮（fix 轮）· eng-designer**——承批档 `docs/batches/2026-10-13-member-face-chat.md` §1（用户裁定：题一翻案——会话真源在盒内））：§2 IA 行`#/me/chat` 补**会话源 = 盒内**句（离线 ⇒ 启动引导）∥ §5 `views-me.mjs` 行指针改 as-of 2026-10-13（+≈60——账户页 Git 凭据卡）。**产品码零触（设计轮）。**
- 2026-10-13（**sandbox-exec-rebuild 批 · 设计修订轮增补（底座可换）· eng-designer**——承批档 `docs/batches/2026-10-13-sandbox-exec-rebuild.md` §1 「2026-10-13 21:32 · 用户裁定」）：§1 视图档链 57 ⇒ **58 档**（+`views-sandbox-base.mjs`——拟新增）∥ 档目链 **60 ∥ 59 ⇒ 61 ∥ 60** ∥ §5 增 `views-sandbox-base.mjs` 指向行（⇒ `webui/SANDBOX.md` §3）。**产品码零触（设计轮）。**
- 2026-10-14（**server-mcp 批 · 实施轮（UI 席随正）· eng-coder**——承批档 `docs/batches/2026-10-13-server-mcp.md` §2 ∥ 父侧任务书「`WEBUI.md` 随正 = UI 席」；台账 #1379）：§1 静态面（`views-mcp.mjs` 拟新增 ⇒ **已落**；i18n 部件 16 ⇒ **18 档**（+`i18n-{zh,en}-mcp.mjs`）；JS 链 ⇒ **65 档**（实读）；档目链补本批段——盘面实读 **67 ∥ 68**（UI 代码档 ∥ 含 favicon；链上前值 64 ∥ 63 = 设计轮链推，差 1–3 档 = 历批在途口径差，在案））∥ §5 **七行**随正（三 mcp 行「拟新增 ⇒ 已落」+ 实读 248 ∥ 55 ∥ 55；`app.mjs` ⇒ 实读 **209**；`nav.mjs` ⇒ 实读 **107**；两 shell 行 ⇒ 实读 **82 ∥ 80**——陈链历批增键未入本行，实施当刻实读收正）。**本档 = 随正（改动面 = 批档 §5 实施记录）。**
