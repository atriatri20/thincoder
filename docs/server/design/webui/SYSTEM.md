# Thincoder Server · 系统页（webui/SYSTEM.md）

> 本档迁自 `webui/WEBUI.md` §2.1 ∥ §2.7 及三表归位行（2026-10-11 域内拆分；as-of）。域总览与壳面 = `webui/WEBUI.md`。

## 1. 关键决策（本面）

| # | 决策 | 理由 | 被否候选与何故否 |
|---|---|---|---|
| KD-SV-60 | **代理设置与连通测试 = 系统页「服务配置」卡内**（功能点 30——代理回迁批；台账 #1199；用户 2026-10-10 08:22 令「服务器的代理设置还是放回系统设置页面。」+ 08:41「测试要保留。」）：`proxy.uri` = 服务配置卡第四写控件（保存体四键——白名单零变）；测试 = `POST /api/admin/proxy/test`（`proxyFetch` 真打 ∥ 表单明传 uri ∥ 目标可填 + 预填首个 provider baseURL ∥ 自含读数 `{ ok, status ∥ error{kind}, ms }` ∥ 预算 10s ∥ 零落库零计费）∥ 旧链 `#/admin/proxy` ⇒ `#/admin/system`（重定向——旧书签可达） | 用户令回迁（测试保留——零功能损失）；卡内块 = 零新机制（KD-SV-9/20 不破；两表单同卡）；真打 = 同 `proxyFetch` 同判定（读数真诚实）；明传 = 所见即所测 + 草稿先验（KD-SV-54/57 同源） | 独立页/侧栏项（用户 2026-10-10 令回迁）· 测试打运行配置值（须保存→重启→测试——与先验相抵）· uri 空回落（与删段语义相抵）· 目标必填无缺省（一键性失）· 测试入记账/审计路径（诊断面污染） |

## 2. 机制

### 2.1 系统页与 meta 槽（版本/更新 ∥ 成员接入 ∥ 向量服务 ∥ 服务配置 ∥ 服务健康）

- **meta 槽**（侧栏底部——全角色）：健康状态灯（`webui/READINGS.md` §2.1⑤——`/healthz` 轮询；点 + 文案）∥ 版本一行（`GET /api/system`——启动装配时取一次；失败 ⇒ 留空静默）∥ 语言切换器 ∥ 退出登录。
- **`#/admin/system` 五节**：
  - **版本与更新**：当前版本 ∥ 更新档位（`mode`：`false`/`notify`/`auto`）∥ 最近自检（`lastCheckAt`——本地化时间；`null` = 未检）∥ 更新提示（`latest` 在场 ⇒ 「有新版本可用：vX.Y.Z（升级见部署文档）」；不在场 ⇒ 「未发现新版本」——自检失败同面，静默口径 = `gateway/API.md` §2.3）。
  - **成员接入卡**：baseURL（`location.origin` + `/v1`——运行时装配）∥ 团队 API Key 提示（`sk-tc-…` 形——签发 = `#/me/keys`）∥ 四端示例（CLI ∥ VSC ∥ 桌面 ∥ 其他 OpenAI 兼容——字段 = name/baseURL/model/apiKey；model = `provider/model` 形）∥ curl 冒烟一行（`GET /v1/models`）。
  - **向量服务**（admin——`webui/READINGS.md` §2.1①）：**配置面**（引擎地址 ∥ 模型 ∥ API Key 三输入——值 = 文件面（`GET /api/admin/config`）；保存 ⇒ `PATCH /api/admin/config`（重启生效）；API Key 掩码回显（`env:` 保形 ∥ 明文 ⇒ `…`+末 4）——**提交/探活三态 = 未编辑 ⇒ 不携 `apiKey`（保存 = 不变 ∥ 探活 = 运行配置回落） ∥ 编辑 ⇒ 明传 ∥ 清除勾 ⇒ 显式空（`""`）**——掩码/引用回显形恒不作明传值）
    ∥ 可达性状态（渲染自动探活 + 「重新检测」——`POST /api/admin/embedding/test`——**按表单草稿值探活**（标量三项明传优先——KD-SV-54 口径镜像；未保存亦可先验；**掩码/引用字段未编辑 ⇒ 不携——落运行配置回落**））∥ `/v1/embeddings` 调用 snippet ∥ 用法一句 ∥ 试跑（短文本 ⇒ 维度 ∥ 耗时——不落库不计量）。
    ∥ **未配置态（2026-10-09 embed 解耦批——缺 `embedding` 段）**：三输入空 ∥ 状态行 = 「未配置」（**不自动探活**——无值可探）∥ 提示句在册（填写并保存后启用——重启生效）；**「用法」行随段显隐**（未配置态不渲染——「填为 {model}」无值可填；显隐实现零新键——2026-10-09 alias 批 · #1151）；填写后「重新检测」/试跑按草稿照常（未保存亦可先验）；保存 = 创建段（同一 PATCH——缺段合并建段）。
  **服务配置**（admin——配置控制台；定则 = 用户「任何配置项必须有配置界面」——台账 #1139）：**只读行** = 监听地址（host） ∥ 端口（port） ∥ 数据库（db）——部署拓扑项（改端口 = 自断连接 ∥ 改库 = 迁移动作）；**只读展示 + 注「改动需编辑配置档并重启」——定则例外显式说明** ∥
  **可写行** = 更新档位（autoUpdate——三档 select：关 ∥ 通知 ∥ 自动） ∥ 信任反代 IP 头（trustProxy——勾选） ∥ 用量/审计保留天数（usageRetentionDays——正整数 ∥ 「不限」勾选） ∥ 上游代理地址（`proxy.uri`——第四写控件；空 = 不启用 ∥ 空串 ⇒ 删段——2026-10-10 代理回迁批） ∥
  **指针行** = providers（首启种子——常态管理 = Provider 页） ∥ bootstrap（引导账号——一次性（建号后失效）；口令永不回显） ∥ 保存 = `PATCH /api/admin/config`（可写四项提交——所见即所存）⇒ flash「已保存——重启服务后生效」；非法 ⇒ 就地提示（前端先行 ∥ 服务端复核 400）；值渲染 = 文件面（缺省值回填展示——有效值）。**全部可写项统一标「重启生效」**（配置文件不热载——`ops/OPS.md` §10 不破）。
  **计数口径**：卡面可写四 = 配置面白名单五键 − 向量卡 `embedding`；面级计数 = 五（需求 AC-28 同源）。
  **排版 = 逐项竖排**（`.provider-form.stacked`——三规则 = 块级（`display: block`） ∥ label 列形（标题行 + 控件成对） ∥ `.key-clear` 行形还原（勾选型项 = 勾选框 + 文案同行）；保存钮 = 表单块流末行（后随重启注 ∥ 指针行表）——2026-10-09 走查收正：原横排折行致标签/输入错位）。
  **连通测试块（卡内第二表单——2026-10-10 代理回迁批）**：目标输入（缺省预填首个 provider `baseURL`）+「测试」钮 + 读数行（真打 ∥ 所见即所测——机制全文 = 本档 §2.2）。
  - **服务健康**：状态（`ok`/`degraded`）∥ DB ∥ 运行时长 ∥ 最近检查（本地化时间）——数据 = 前端健康共享态（`webui/READINGS.md` §2.1⑤；30s 自动刷新）。
- **角色面**：更新提示 ∥ 向量服务 ∥ 服务健康 = admin 面（`#/admin/system`）；meta 槽（状态灯 ∥ 版本行）= 全角色；`requirements/PROJECT.md` §2:12③「更新可用提示」按可动作方收窄——在案。
- 落点：接入卡 = admin 面（供分发给成员）；成员面 = `#/me/keys` 页接入卡（同源复用——me-keys 批）+ README「成员接入」节；
  文案 = 多语言表键引用（`webui/I18N.md` §2.1——各卡各件同表收编）；渲染沿 `h`/`textContent`（零拼串）——配置卡（新档 `views-system-config.mjs`）同规；配置面数据 = `GET /api/admin/config`（文件面） ∥ 写 = `PATCH /api/admin/config`（契约 = `gateway/API.md` §2.4 ∥ 机制全文 = `ops/OPS.md` §1）。

### 2.2 代理设置与连通测试（系统页「服务配置」卡内——功能点 30 · 2026-10-10）

- **承载面**（KD-SV-60）：`#/admin/system`「服务配置」卡内——**代理行** = 同一保存表单第四写控件（`proxy.uri`——与 autoUpdate/trustProxy/usageRetentionDays 同提交；本档 §2.1） ∥ **连通测试块** = 卡内第二表单（目标输入 +「测试」钮 + 读数行）；
  独立页/侧栏入口零承载（旧链 `#/admin/proxy` ⇒ `#/admin/system` 重定向——旧书签可达；`nav.mjs` `ROUTE_ALIASES`）；卡内两块判权沿既有 admin 面（`user` ⇒ `denied` 块 ∥ 服务端 403——判据仍在服务端）。
- **代理行（写面）**：值 = 文件面 `GET /api/admin/config` 的 `proxyUri`（有效值——空 = 不启用）；保存 = `PATCH /api/admin/config` 携四键（`{ autoUpdate, trustProxy, usageRetentionDays, proxyUri }`——所见即所存；空串 ⇒ 删 `proxy` 段——服务端既有语义零变）⇒
  flash（复用 `system.cfgSaved`）+ 卡内错态（`mapError`）；重启生效注 = 复用 `system.cfgRestartNote`；排版 = `provider-form stacked`（竖排形——沿 2026-10-09 走查收正口径）。
- **连通测试块（卡内第二表单）**：目标输入（可填）+「测试」钮 + 读数行（在飞 =「测试中……」静态 hint + 钮禁用（KD-SV-46 口径）∥ 成功 =「代理连通——HTTP {status}（{ms} ms）」∥ 失败 = 就地错态 `.hint error`）。
  - **测试目标**：可填 + 缺省预填 = 首个 provider 的 `baseURL`（`GET /api/admin/providers` 库序首条——既有端点；零 provider ∥ 取数失败 ⇒ 空输入，用户自填）；空 ⇒ 前端先行提示（`proxy.targetRequired`——不提交）。
  - **真打（判定与生产同链）**：`POST /api/admin/proxy/test` 服务端代打——体 `{ uri, target }` 双必传（`uri` = 表单当前值）；经 `proxyFetch(target, { method: "GET", signal }, uri)` 发真实请求（同传输 ∥ 同 loopback 旁路）——读数 = 生产链行为如实镜像；契约 = `gateway/API.md` §2.4。
  - **uri 口径 = 表单明传（所见即所测）**：草稿先验（与 KD-SV-54/57 同源——未保存亦可先验）∥ 简化 = 明文输入无掩码 ⇒ 零三态；空 = 就地拒绝（**不回落运行配置**——保存语义中空 = 删段，回落读法反致歧义）。
  - **读数**：成功 = 收到任一 HTTP 响应（**含非 2xx**——照实回读）⇒ `status` + `ms`；失败 = 传输层（连不上 ∥ CONNECT 拒 ∥ TLS 败 ⇒ `unreachable`（message 携底层诊断）∥ 超预算 ⇒ `timeout`）；**预算 = 10s**（沿探活/发现家族——诊断面自有界；生产超时族 = KD-SV-55 不变）。
  - **零落库零计费**：不经记账/配额/审计路径；失败仅 `log.warn` 一行（沿向量探活先例）。
  - 已知边缘（在案）：重定向 = 直连径跟随（fetch 缺省）∥ 经代理径单请求不跟随（3xx 原样回读）——生产同链同行为，不改传输。
- **文案面**：在册代理键 15（`proxy.*`——system 部件）+ 退役 3 键（`nav.page.admin.proxy` ∥ `proxy.title` ∥ `proxy.settingsTitle`）；`useProxy` 改值（清册 = `webui/I18N.md` §2.1）。
- **不做**：代理池/多代理 ∥ 代理认证 ∥ 测试历史/存档 ∥ 测试经生产计量路径 ∥ 目标协议白名单（http(s) 即收——非探针准入）。

## 3. 文件账（本面文件行 ∥ 键族登记）

| 档 | 行数（实读——设计估） | 职责 |
|---|---|---|
| `thincoder-server/public/views-system.mjs`（已落盘） | **无 ⇒ 15 ⇒ 59 ⇒ 60 ⇒ ≈150 ⇒ 168**（实读——本 fix 轮复核 2026-10-06；#962 骨架（设计估 ≈30）；#963 +44 = 两节填充——版本/更新 ∥ 接入卡（本档 §2.1）；i18n 叠加 +1 = 文案键化；二轮 +≈90 = 向量卡 ∥ 健康块）**⇒ 实读 172（2026-10-07——配额批零动）⇒ ≈178（me-keys 批：接入卡件导出/参数化 +≈6——admin 面行为零改）⇒ 实读 175（2026-10-09——本设计轮复读）⇒ ≈230（本批：向量卡配置面（三输入 + 保存 + 草稿探活）+ 配置卡挂载 +≈55）⇒ ≈245（2026-10-09 embed 解耦批：缺段「未配置」态 +≈15——自动探活跳过）**⇒ 实读 222（2026-10-09 配置控制台批落地后——embed 批前值） | 系统页 |
| `thincoder-server/public/views-system-config.mjs`（已落盘） | **无 ⇒ ≈130**（设计估——「服务配置」卡（本档 §2.1）：只读三行 ∥ 可写四项（卡面） ∥ 保存/重启注 ∥ `GET`/`PATCH /api/admin/config` 接线；零 CJK（注释外））**⇒ 实读 105（2026-10-09 配置控制台批落地后）⇒ 实读 106（2026-10-09 走查收正笔：头注一行）⇒ ≈96（代理页批：去 proxy.uri 行/标签/保存键——可写四项（卡面）⇒ **三写控件**）⇒ 实读 103（2026-10-09 代理页批落地后：106 ⇒ 103——净 −3）⇒ 实读 **166**（2026-10-10 代理回迁批：代理行回归 + 连通测试块——+63） | 系统页·服务配置卡 |
| `thincoder-server/public/views-proxy.mjs`（迁移期引文——已退役删档（2026-10-10 代理回迁批）——档不在盘（原读数 119 · as-of）；逻辑并入 = `views-system-config.mjs`（代理行 + 连通测试块——本档 §2.2）） | —— | —— |
| `thincoder-server/public/i18n-zh-system.mjs`（已落盘） | **≈118**（键 103 + 注释 6 + ≈9；`system.*`/`vector.*`/`health.*`/`overview.*`/`usageReport.*`/`audit.*`）**⇒ 实读 122**（2026-10-09——结构轮落地后首读）**⇒ 实读 153**（2026-10-09——配置控制台批落地后）**⇒ ≈155（2026-10-09 embed 解耦批：+2 键——本档 §3）⇒ ≈170（2026-10-09 代理页批：+17 键 −2 键——本档 §3）⇒ 实读 172（2026-10-09 代理页批落地后：155 ⇒ 172）⇒ 实读 **170**（2026-10-10 代理回迁批：退役 2 键 −2）⇒ ≈174（沙盒余面批：审计两型 +≈4 键）**⇒ 实读 **201**（2026-10-12 admin-agent-awareness 批设计轮复读——前批估值链未回填）⇒ ≈**204**（本批：审计 agent 行三键 +3/表）** | 文案表·zh·系统与看板面 |
| `thincoder-server/public/i18n-en-system.mjs`（已落盘） | **≈118**（键 103 + 注释 6 + ≈9）**⇒ 实读 122**（2026-10-09——结构轮落地后首读）**⇒ 实读 153**（2026-10-09——配置控制台批落地后）**⇒ ≈155（2026-10-09 embed 解耦批：+2 键——本档 §3）⇒ ≈170（2026-10-09 代理页批：+17 键 −2 键——本档 §3）⇒ 实读 172（2026-10-09 代理页批落地后：155 ⇒ 172）⇒ 实读 **170**（2026-10-10 代理回迁批：退役 2 键 −2）⇒ ≈174（沙盒余面批：审计两型 +≈4 键）**⇒ 实读 **201**（2026-10-12 同上）⇒ ≈**204**（本批：+3 键/表）** | 文案表·en·系统与看板面 |

**面小计**：≈736（本面档行现读和——估值面，实施实读为准；域合计 = 各面之和——不单列）。

**键族登记**（自 `webui/WEBUI.md` §2.2 归位——逐字）：

- **键族登记（配置控制台批——两表逐键同步；本批）**：新增 ≈29 键（`i18n-{zh,en}-system` 部件）——`system.*` 配置族 ≈23（`configTitle` ∥ `configHint` ∥ `cfgHost`/`cfgPort`/`cfgDb` ∥ `cfgTopologyNote` ∥ `cfgAutoUpdate` + 三档选项（`cfgAutoUpdateOff`/`Notify`/`Auto`） ∥
  `cfgTrustProxy` ∥ `cfgRetention`/`cfgRetentionUnlimited`/`cfgRetentionInvalid` ∥ `cfgProxyUri`/`cfgProxyUriPh` ∥ `cfgProvidersRow`/`cfgProvidersValue` ∥ `cfgBootstrapRow`/`cfgBootstrapValue` ∥ `cfgSaved`/`cfgLoadFailed`）∥
  `vector.*` 四键（`apiKey`/`apiKeyPh`/`clearApiKey`/`draftNote`）∥ `audit.*` 两键（`type.config_update`/`keys`）；
  **改值 1 键**——`admin.providers.useProxy`（提示改向「系统 → 服务配置」——界面文案不得指向界面外入口）；表体量：`i18n-zh-system` 122 ⇒ ≈151 ∥ `i18n-en-system` 122 ⇒ ≈151（+29/表）；`i18n-{zh,en}-admin` 138 ∥ 142 ⇒ ±0（逐值改——实施实读为准）。
- **键族登记（embed 解耦批——两表逐键同步；本批）**：新增 2 键（`i18n-{zh,en}-system` 部件）——`vector.unconfigured`（「未配置」/「Not configured」） ∥ `vector.unconfiguredHint`（「嵌入引擎未配置——填写并保存后启用（重启生效）」/ 英文同义）；**退役 1 键/表**——`admin.models.embedNote`（嵌入行退场——零消费者删净；`i18n-{zh,en}-admin` 部件）；表体量：system 两部件 +2/表 ∥ admin 两部件 −1/表（实施实读为准）。
- **键族登记（代理页批——两表逐键同步；本批；2026-10-09）**：新增 **18 键**——`nav.page.admin.proxy`（「代理」/"Proxy"——shell 部件） ∥ `proxy.*` 17 键（system 部件——`i18n-{zh,en}-system.mjs`）：
  `proxy.title`（页题「代理」） ∥ `proxy.settingsTitle`（「代理设置」） ∥ `proxy.uriLabel`（「上游代理地址」） ∥ `proxy.uriPh`（`http://host:port`——留空 = 不启用） ∥ `proxy.hint`（经代理的请求范围句） ∥
  `proxy.testTitle`（「连通测试」） ∥ `proxy.testHint`（真打说明——不落库不计量） ∥ `proxy.targetLabel`（「测试目标」） ∥ `proxy.targetPh` ∥ `proxy.testBtn`（「测试」） ∥ `proxy.testing`（「测试中……」） ∥
  `proxy.testOk`（「代理连通——HTTP {status}（{ms} ms）」） ∥ `proxy.testFail`（「不可达（{kind}）：{message}」） ∥ `proxy.uriRequired` ∥ `proxy.targetRequired` ∥ `proxy.kind.timeout`（「超时」） ∥ `proxy.kind.unreachable`（「不可达」）；
  **退役 2 键**（system 部件）——`system.cfgProxyUri` ∥ `system.cfgProxyUriPh`（迁「代理」页——零消费者删净）；**改值 1 键**——`admin.providers.useProxy`（「系统 → 服务配置」⇒「代理」页；admin 部件逐值改）；
  表体量：system 两部件 **+15/表** ∥ shell 两部件 **+1/表** ∥ admin 两部件 ±0（实施实读为准）。
- **键族登记（代理回迁批——两表逐键同步；本批；2026-10-10）**：退役 **3 键**——`nav.page.admin.proxy`（shell 部件——侧栏项退场） ∥ `proxy.title`（页题） ∥ `proxy.settingsTitle`（卡题）（system 部件——零消费者删净）；**在册代理键 15**（= 原在册 18 − 退役 3——居中系统页服务配置卡）；**改值 1 键**——`admin.providers.useProxy`（指向 ⇒「系统」页服务配置卡——admin 部件逐值改）；
  表体量：shell 两部件 **−1/表** ∥ system 两部件 **−2/表** ∥ admin 两部件 ±0。
- **键族登记（admin-agent-awareness 批——两表逐键同步；本批；2026-10-12）**：新增 **3 键**（`i18n-{zh,en}-system` 部件）——`audit.agentOk`（「完成」/"Done"） ∥ `audit.agentFail`（「失败」/"Failed"）
  ∥ `audit.agentTruncated`（「结果截断」/"Result truncated"）；表体量：system 两部件 201 ∥ 201 ⇒ ≈204 ∥ ≈204（实施实读为准）；消费面 = `views-audit.mjs`（agent 行详情模板——`webui/READINGS.md` §2.1④）。

## 4. 验收（本面 AC 行）

| 需求 | 设计级判据 | 载体 |
|---|---|---|
| AC-13③④（功能点 12——版本/更新可见 ∥ 成员接入卡；已落需求档——`docs/server/requirements/PROJECT.md` 验收表） | `#/admin/system` 五节在册（版本/更新 ∥ 接入卡 ∥ 向量服务（含配置面） ∥ 服务配置 ∥ 服务健康——本档 §2.1）；meta 槽版本（`/api/system`）；更新提示接 `latest`（更新提示 = admin 面 ∥ 版本行 = 全角色——角色面收窄在案）；接入卡含 baseURL（运行时 origin） ∥ 四端示例 ∥ curl；零外部引用断言随正（不增档）；`nav.mjs` 结构直测不破 | 单元测试档 |
| AC-15（功能点 15——控制台可见面六面；已落需求档——`docs/server/requirements/PROJECT.md` 验收表） | ① 向量卡（**配置面（配置控制台批——本档 §2.1：三输入 + 保存 → `/api/admin/config`——重启生效；草稿探活）** ∥ **缺段「未配置」态（不自动探活；填写保存即创建——2026-10-09 embed 解耦批）** ∥ 试跑回维度+耗时 ∥ 失败分类文案 ∥ 用户面提示条（模型名——零地址；缺段 ⇒ 不渲染——2026-10-09 embed 解耦批））+ endpoint 列/过滤（两用量页控件）； | 单元测试档 + 收口轮 |
| AC-28（功能点 28——server 配置控制台；已落需求档——`docs/server/requirements/PROJECT.md` 验收表；定则 = 用户「任何配置项必须有配置界面」） | ① 系统页显示全部配置项（服务配置卡：host/port/db 只读 ∥ autoUpdate/trustProxy/usageRetentionDays/`proxy.uri` 可写（四写控件） ∥ 连通测试块 ∥ providers/bootstrap 指针行；向量卡：embedding 三字段可写——2026-10-10 代理回迁批，本档 §2.2）∥ ② 值渲染 = 文件面（有效值——缺省回填）∥ ③ 保存 ⇒ 文件落盘（保未知键 ∥ 原子 rename）+ flash「已保存——重启生效」；非法 ⇒ 400 且文件与运行态零变 ∥ ④ 生效标注统一「重启生效」（文件不热载——`ops/OPS.md` §10 不破）∥ ⑤ 密钥面零泄漏（掩码：`env:` 保形 ∥ 明文 ⇒ `…`+末 4；bootstrap 口令面零列）∥ ⑥ 探活/试跑按表单草稿（标量三项明传优先——KD-SV-54 口径镜像）∥ ⑦ 审计事件在册（`config_update`——v10；detail = 键名清单、值零入）∥ ⑧ provider「走代理」勾选框文案改向「系统」页服务配置卡（2026-10-10 代理回迁批） ∥ ⑨ 缺段创建（向量卡「未配置」态 ⇒ 保存即建段；缺段档 PATCH 他键过门——2026-10-09 embed 解耦批） | 单元测试档 + 收口轮（浏览器实走） |
| AC-28（续·机检口径） | `views-system-config.mjs`——三只读行 ∥ **四写控件**（select ∥ checkbox ∥ number+「不限」 ∥ 代理地址输入——保存体四键（`autoUpdate` ∥ `trustProxy` ∥ `usageRetentionDays` ∥ `proxyUri`）；卡内第二表单 = 连通测试块（目标输入 + 测试钮 + 读数行——测试体 `{uri, target}` 双必传 ∥ 空值就地拒）） ∥ 保存路径 `PATCH /api/admin/config` ∥ 零 CJK（注释外——AC-14 扫描面入册） ∥ `views-system.mjs`——向量卡三输入 + 保存 ∥ 草稿探活（探活/试跑携表单值）∥ 缺段「未配置」态（不自动探活；**「用法」行不渲染**）∥ `views-audit.mjs`——十三型表接（`config_update` 键 ∥ 详情模板 `keys` 支 ∥ 沙盒两型 + `kind` 族模板（已落——走查轮 2026-10-11）——`webui/SANDBOX.md` §2.1⑥ ∥ agent 行模板（admin-agent-awareness 批——`tool`/`subject`/成败/`truncated`——`webui/READINGS.md` §2.1④））∥ i18n 键集（+29 两表同步 ∥ `useProxy` 逐值改）∥ `config-admin.mjs` 在册（白名单 ∥ 合并助手 ∥ 原子写助手——导出直测）∥ 档目随正——单源 = `webui/WEBUI.md` §1 ∥ 旧件随正（档目断言件 ∥ nav 计数件 ∥ 配置批 F1/F4 件 ∥ 门禁件数件——十五档清单 = `design/PROJECT.md` 历史段·原 §6 代理回迁批行（迁移前）） | 单元测试档 |
| AC-30（功能点 30——代理设置与连通测试（服务配置卡内）+ 旧链重定向；已落需求档——`docs/server/requirements/PROJECT.md` 验收表） | ① 承载：`views-system-config.mjs` 在册（服务配置卡 = 四写控件 + 连通测试块（卡内两表单：保存表单 ∥ 测试表单））∥ `views-proxy.mjs` 不在盘（档目断言——单源 = `webui/WEBUI.md` §1）∥ `nav.mjs` 管理 7 项（直测）∥ `app.mjs` 零 `views-proxy` import ∥ `PAGES` 零代理行 ∥ 旧链 `#/admin/proxy` ⇒ `#/admin/system`（`ROUTE_ALIASES` 直测——旧书签可达）∥ `GET`/`PATCH /api/admin/config` 白名单零变（`proxyUri` 在册——导出直测）∥ ② 测试功能：真打（读数 = `status` + `ms`——假代理命中即证经代理 ∥ 不可达 ⇒ 就地错态 ∥ 超时 ⇒ `kind=timeout`）∥ 空值就地拒（空 uri ∥ 空目标——不提交 ∥ 不回落运行配置）∥ 零落库零计费（usage 行零增 ∥ 审计零行）∥ ③ 语义零变：保存 ⇒ 文件面（四键提交 ∥ 重启生效注在册）∥ 「走代理」旗随动（Provider 两窗零回归）∥ `proxy.mjs` 零触（KD-SV-55 不变） | 单元测试档 + 收口轮（浏览器实走） |
| AC-30（续·机检口径） | `views-system-config.mjs`——四写控件（select ∥ checkbox ∥ number+「不限」 ∥ 代理地址输入——第四写控件）∥ 保存体四键（`autoUpdate` ∥ `trustProxy` ∥ `usageRetentionDays` ∥ `proxyUri`）∥ 测试块（目标输入 + 测试钮 + 读数行——测试体 `{uri, target}` 双必传 ∥ 空值就地拒）∥ 零 CJK（注释外——AC-14 扫描面入册）∥ `nav.mjs`——管理 7 项（零 `proxy` 项）∥ 旧链 `#/admin/proxy` ⇒ `#/admin/system`（`ROUTE_ALIASES` ∥ `resolveRoute` 直测——重定向＋路径归一）∥ `app.mjs`——零 `views-proxy` import ∥ `PAGES` 零代理行 ∥ `views-proxy.mjs` 不在盘（档目断言）∥ i18n 键集（退役 3 键 ∥ `useProxy` 改值——两表同步 ∥ en 零 CJK）∥ 档目随正——单源 = `webui/WEBUI.md` §1 ∥ 旧件随正（档目断言件 ∥ nav 计数件 ∥ 配置批 F1/F4 件 ∥ 门禁件数件——清单/行数注 = `design/PROJECT.md` 历史段·原 §6 代理回迁批行（迁移前）） | 单元测试档 |

## 5. 边界（本面不做面）

- embed 解耦批不做面（2026-10-09；台账 #1147 ∥ #1148）：引擎进程起停管理（手动——不变）∥ 控制台删除/清空 `embedding` 段（缺段 = 编辑配置文件；界面仅创建/改值）∥ 嵌入模型在通用清单的任何展示位（`/v1/models` 与模型页皆零行——单独命名空间）。
- 配置控制台批不做面（2026-10-09）：配置文件热载/运行态注入（生效 = 统一重启——`ops/OPS.md` §10 不破）∥ `host`/`port`/`db` 写面（部署拓扑项——只读；定则例外显式说明）∥ 配置版本史/回滚 ∥ 写前 `.bak` 备份 ∥ 多实例并发写（部署模型 = 单写者）∥ `providers[]`/`bootstrap` 写面（各有其面：Provider 页 ∥ 账号面）。
- 代理面不做面（2026-10-10 代理回迁批——KD-SV-60）：代理池/多代理 ∥ 代理认证（沿 `gateway/API.md` §8）∥ 测试历史/存档 ∥ 测试经生产计量/审计路径 ∥ 目标协议白名单（http(s) 即收——非探针准入）。

## 6. 上抛/余项

- 本面无独立上抛/余项。

## 变更记录

- 2026-10-11（**server-doc-split 批 · 域内拆分（迁移）· eng-designer**——承批档 `docs/batches/2026-10-11-server-doc-split.md` §2）：本档自 `webui/WEBUI.md` §2.1 ∥ §2.7 及三表归位行逐字迁入（零语义）；文内 § 引用改指（§2.7→§2.2 ∥ §2.3①⑤→`webui/READINGS.md` §2.1①⑤ 等）；AC 行内档目链去重 ⇒ 单源句（`webui/WEBUI.md` §1）；全局键数链删（设计口径——机检断言承载）；AC-15 行三拆之 ① 片段入本档；§2.13#10 两处改形（`:711`/`:714` 引冻结段行名 ⇒ 「历史段·原 §6 代理回迁批行（迁移前）」）；原址保位 stub 在 `webui/WEBUI.md`。**产品码零触。**
- 2026-10-12（**admin-agent-awareness 批 · 设计轮 · eng-designer**——承批档 `docs/batches/2026-10-12-admin-agent-awareness.md` §1 · 台账 #1310）：§3 i18n 两档行数链补实读（**201 ∥ 201**——前批估值链未回填）+ 本批增量（≈204 ∥ ≈204——审计 agent 行三键）+ 增本批**键族登记**条（`audit.agentOk`/`agentFail`/`agentTruncated`）+ §4 AC-28 机检口径行 `views-audit.mjs` 枚举补 agent 行模板；同源随动 = `webui/READINGS.md` §2.1④/§3 ∥ `accounts/ACCOUNTS.md` §2.1 ∥ `agent/ADMIN-AGENT.md` §14.4。**产品码零触（设计轮）。**
