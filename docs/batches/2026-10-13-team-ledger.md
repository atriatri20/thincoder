# 2026-10-13 · 团队台账首刀
> 六段 append-only，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 编制：主 agent · 2026-10-13 · 来源 = 用户 2026-10-13「全做」（清账轮短单第 8 项——团队协同首刀 = 团队台账；#1206 自标「首刀候选」）。
> 台账 = #1206（server · 归批）。前情 = 无（独立批）。
## §1 讨论（主 agent）
**状态行**：已收口 2026-10-13
<§1 模板占位：本批条目 / 关键判据 / 授权口径>

**本批条目**（用户 2026-10-13「全做」＝短单第 8 项 · 团队协同首刀——#1206 自标「首刀候选」）：**团队台账**。

**六条口径（全在需求档 §2:32 + AC-32，用户 2026-10-10 逐条裁定、原话在台账 #1206 evidence）**：① 两账独立（个人台账 = 本机账，未登录也在 ∥ 团队台账 = 服务端账，登录后可用；**不做「同一份账随登录换后端」**）；② 团队账键 = **git 源**（跨机同仓共享）；③ **全局编号**（服务端一号空间）；④ **无离线**（未登录 / 断网 ⇒ 团队账不可用；零离线缓存）；⑤ **显式上送**（agent 可把个人账条目记入 / 导入团队账——显式单向一次性；**禁自动映射 ∥ 禁双向 ∥ 禁合并**）；⑥ **界面维护管理**（列表 ∥ 按仓 / 状态 / 负责人筛 ∥ 新建 / 编辑 / 收口 / 撤回——动作集与承载面设计轮定）。

**纪律线**：本机台账离线可用不动（上送 = 异步旁路，不许变网络依赖）∥ 三端同批纪律（需求档 §3：任何端侧能力面同一批落齐三端 + 控制台页，**禁「先行后补」**——用户 2026-10-10 11:31 原话在册）。

**授权口径**：用户 2026-10-13「全做」= 建批放行（设计 → 评审 → 批准 → 实施）。**机制单源档** = `docs/server/requirements/PROJECT.md` §2:32 + AC-32（设计档落点由设计轮定——server 面新档 ∥ 或既有域档扩节）。

**父侧验收（设计交付 · 2026-10-13 12:2x）**：抽查核读通过——三新档结构齐（域档 KD-SV-139–147 全带被否候选 ∥ 面档 ∥ 核面档 `team_ledger` 五 action + 仓派生 + 登录态门）；五随正逐件有坐标；三链（§2 条目 = 设计档回指 = 需求 32 ∥ AC-32）同源；KD 号避让在途批（139–148 ∥ R74）属实。**父裁三条待裁**：① **判权读法 = 采 B2 能力矩阵读法**（读 = `can.view` ∥ 写 = `can.write`；未登记仓 ⇒ 拒写；「控制台全队」= 数据一本 + 权限过滤）——理由 = 需求 §1 前置件明令权限跨面统一；「全员无差别」读法即与前置件相抵，不采；② **装载位 = `#/me/ledger`**（成员可达；admin 同页全量）——与「界面维护管理 + 写时零门槛」相容；③ **端侧零独立面板 = 采**（工具面核单源 ⇒ 三端同批纪律以共享核件兑现，逐端面板 = 用户未点名面）。**知会两条转办**：① 需求档回笔（AC-12 页数链 ∥ AC-14 档目链 ∥ AC-28 审计型数十四 ⇒ 十五）——**暂缓至评审 #6 落地**（需求档在 #6 冻结窗内——D5）；② `docs/README.md` §1 档数（server 设计 22 ⇒ 24 ∥ 总 76 ⇒ 79）——**随全批收口扫一遍落**（多批并行落档中，避免反复改数）。**评审已送**（id 9）；设计席 #4 交付物冻结。

## §2 批次任务与设计（eng-designer）
**状态行**：设计完成（承评审轮次 1（pass 0/8/6）逐条修复 1–12 ∥ 14 范围声明·父侧留）
<§2 模板占位：本批条目（覆盖） / 设计档落点 / 机制设计 / 受影响文件与测试覆盖 / 验收对照 / 关键决策 / 上抛项>

**team-ledger 批 · 设计轮 · eng-designer · 2026-10-13** ∥ 台账 #1206 ∥ 需求面 = `docs/server/requirements/PROJECT.md` §2:32（功能点 32——六条）+ AC-32；用户 2026-10-13「全做」（端侧同批纪律 = 需求 §3）。

### 2.1 本批条目（覆盖——需求逐条对位）

| # | 条目（需求面） | 设计落点 |
|---|---|---|
| 1 | **两账独立**（团队账 ∥ 本机账——两本独立账本；本机账未登录可用 ∥ 零改） | `ledger/LEDGER.md` §1/§6（KD-SV-139/145） ∥ `docs/core/design/TEAM-LEDGER.md` §3（D-TL2——零跨账代码路径） |
| 2 | **团队账登录后可用**（三端 + 控制台同源；住服务端；未登录/断网 ⇒ 明示不可用） | `ledger/LEDGER.md` §1/§5 ∥ `gateway/API.md` §2.10 ∥ `TEAM-LEDGER.md` §2.3/§2.4（登录态门三态出词） |
| 3 | **编号全局唯一**（跨本引用可解析 ∥ 免「各本独立编号」） | `ledger/LEDGER.md` §3（单表自增——KD-SV-140） ∥ `store/STORE.md` §2 v20 段 |
| 4 | **写入直写服务端**（零门槛 ∥ 零去重拦截 ∥ 直写不脱机） | `ledger/LEDGER.md` §4（写路径） ∥ `webui/LEDGER.md` §2.1（新建/编辑弹窗） |
| 5 | **无离线缓存**（未登录/断网 ⇒ 该面不可用 ∥ 不做本地副本） | `TEAM-LEDGER.md` §2.3/§2.4/§6（AC-32⑤ 判据） ∥ `ledger/LEDGER.md` §12 边界 |
| 6 | **个人 ⇒ 团队仅显式上送**（用户授权下 ∥ 无自动映射/双向/合并） | `ledger/LEDGER.md` §6（KD-SV-145——零回写/零链接/零去重） ∥ `TEAM-LEDGER.md` §3（D-TL2）+ §4（承载分工） |
| 7 | **界面维护管理**（列表；按仓/状态/负责人筛；新建/编辑/收口/撤回） | `webui/LEDGER.md` §2.1/§4（KD-SV-148） ∥ `gateway/API.md` §2.10（四行端点） |
| 8 | **端侧同批纪律**（三端 + 控制台页同批落齐 ∥ 禁用「先行后补」） | `TEAM-LEDGER.md` §4（承载分工表——核工具单源 ⇒ 三端零逐端改动） ∥ `webui/LEDGER.md` §1 |
| 9 | **判权与可见性**（沿 §1 前置件统一判据——非成员不可见） | `ledger/LEDGER.md` §6（KD-SV-143——`can.view`/`can.write`；未授权即不可见） ∥ `project/PROJECTS.md` §3（`can.write` 首个端到端消费者——其 §12 R67 本批兑现） |

### 2.2 不在本批（边界——设计档「边界」段）

不做：离线缓存/本地副本 ∥ 分本（一仓一账） ∥ 逐端独立面板（CLI 状态行 ∥ VSC 面板 ∥ 桌面卡片） ∥ 看板/统计/趋势 ∥ 评论/附件/@提及/通知 ∥ 分页/导出/全文检索 ∥ 条目间依赖 ∥ 跨账迁移向导/导入器 ∥ 团队账 → 本机账回送 ∥ 权限模型改造 ∥ 服务端 admin agent 的团队账工具（其工具面裁剪面 += `team_ledger`）。

### 2.3 设计档落点（新档 3 ∥ 随正 6）

| 档 | 动作 | 内容 |
|---|---|---|
| `docs/server/design/ledger/LEDGER.md` | **新建**（域档） | 定位与形态 ∥ KD-SV-139–147 ∥ 数据形（单表/全局编号/仓标记/老化） ∥ 写路径 ∥ 读路径与端点摘要 ∥ 上送 ∥ 审计 ∥ 承载指针 ∥ 文件与行数预算 ∥ AC-32 ①–⑥ 对位 ∥ 用例（N1–N5 ∥ B1–B8 ∥ E1–E4） ∥ 边界 ∥ 上抛（§13 R74） |
| `docs/server/design/webui/LEDGER.md` | **新建**（面档） | KD-SV-148（承载 = `#/me/ledger`） ∥ 页面机制（三筛 ∥ 七列 ∥ 详情/编辑/新建弹窗 ∥ 收口/撤回非原生 confirm） ∥ 文件账 + 键族登记 ∥ 验收六行 ∥ 边界 |
| `docs/core/design/TEAM-LEDGER.md` | **新建**（端侧核面档） | 工具面（`team_ledger` 五 action ∥ 参数/出参） ∥ 仓标记派生（原文上送——服务端归一） ∥ 登录态门 ∥ 传输 ∥ 深度变体 ∥ D-TL1–D-TL6 ∥ 三端承载分工表 ∥ 文件与行数预算 ∥ 验收 ∥ 用例 |
| `docs/server/design/store/STORE.md` | 随正 | §1 结构版本 19 ⇒ **20** ∥ §2 标题随正（v2–v20）+ **v20 增段**（`team_ledger_items` 十列 + 两索引 + 审计 CHECK 再扩十四 ⇒ **十五型**）∥ §3 迁移链 v20 行（判据）∥ §4 `db.mjs` 行 +≈44 |
| `docs/server/design/gateway/API.md` | 随正 | §1 路由族表 +2 行 ∥ **§2.10 新节**（八行端点表）∥ §3 错误形注（零新码/404 不辨/未登记仓写 400）∥ §5 AC-32 判据行 |
| `docs/server/design/accounts/ACCOUNTS.md` | 随正 | §2.1 + `ledger_event` 行（四 kind）∥ 型面现状句（v20——十五型）∥ §1 型链补段 ∥ §4 `audit.mjs` 行 +1 型 ∥ 全档「十四型零增」表述随正为 **十五型**（§5 三行 ∥ §6 两行 ∥ §7 一行） |
| `docs/server/design/webui/WEBUI.md` | 随正 | §1 JS 链 47 ⇒ 50 ∥ i18n 部件 14 ⇒ 16 ∥ 档目链补本批段 ∥ §2 IA 表 + `#/me/ledger` 行 ∥ §5 `app.mjs`/`nav.mjs` 两行 ∥ §6 AC-12 行链（我的 4 ⇒ 5——as-of 盘面实读基线；在途两批各 +1） |
| `docs/server/design/webui/I18N.md` | 随正 | §2.1 拆表链增台账部件段（`i18n-{zh,en}-ledger.mjs`——域界 = `me.ledger.*` 前缀；七 ⇒ **八部件**）∥ §3 门面两行随正（+1 import——≈16/档） |
| `docs/server/design/PROJECT.md`（板档） | 随正 | §1 域数 10 ⇒ **11** ∥ §2.1 域表 + ledger 行 ∥ §3 文档地图 + `ledger/LEDGER.md` 行（+ `webui/TABS.md` 原漏登补；面档 9 ⇒ 11）∥ §4 索引 1–138 ⇒ **1–148** + ledger 行 ∥ §6 域账索引 + ledger 行 ∥ §7 验收索引 + ledger 行（AC-32）∥ §9 + R74 stub |

### 2.4 受影响文件与行数（产品码——设计估；实施实读为准）

**服务端**：`src/ledger/items.mjs`（新 ≈200）∥ `src/ledger/routes.mjs`（新 ≈120）∥ `src/ledger/client-routes.mjs`（新 ≈95）∥ `src/store/db.mjs`（631 ⇒ ≈675——v20 段 ≈+44）∥ `bin/thincoder-server.mjs`（209 ⇒ ≈213）∥ `src/agent/run.mjs`（实读 137 ⇒ **±0**——`TRIMMED_FACES` 表项同行扩；注释同拍）∥ `src/project/projects.mjs`（实读 360——±0：`normalizeAddress` 直引）∥ `src/accounts/audit.mjs`（实读 118 ⇒ ≈119——`AUDIT_TYPES` += `ledger_event`（十四 ⇒ 十五型）；头注计数同拍）。

**控制台**：`public/views-ledger.mjs`（新 ≈300）∥ `public/i18n-{zh,en}-ledger.mjs`（各新 ≈150——键 ≈120）∥ `public/nav.mjs`（101 ⇒ ≈103）∥ `public/app.mjs`（202 ⇒ ≈204）∥ `public/i18n-{zh,en}.mjs`（实读 15 ⇒ ≈17——+2：import + 展开项）∥ `public/i18n-{zh,en}-shell.mjs`（实读 78 ∥ 76 ⇒ 各 +1 键）∥ `i18n-{zh,en}-system.mjs`（实读 207 ∥ 207 ⇒ 各 +1 键）∥ `public/views-audit.mjs`（206 ⇒ ≈211）∥ 跨批守卫件 `docs/batches/2026-10-08-server-public-structure.test.mjs`（实读 167——随正 ∥ 实施轮执行）。

**核（端侧）**：`thincoder-core/team-ledger.mjs`（新 ≈180）∥ `thincoder-core/tool-docs/team_ledger.md`（新 ≈15）∥ `thincoder-core/agent/family-tools.mjs`（193 ⇒ ≈197）∥ `thincoder-core/team.mjs`（±0）。**三端（CLI ∥ VSC ∥ 桌面）零改动**（核单源——D-TL1）。

**测试**：单元测试档 `docs/batches/2026-10-13-team-ledger.test.mjs`（新 ≈300——实施轮落）。

### 2.5 验收对照（AC-32 ①–⑥）

| AC | 判据载体 |
|---|---|
| ① 两账独立（本机账未登录可用 ∥ 零改） | 单元测试档（用例 N1）+ 既有本机账回归零动 ∥ `TEAM-LEDGER.md` §6 |
| ② 团队账登录后可见（三端 + 周知面同源；未决/在途/老化/归属；仓写时自动） | 单元测试档（N2/N3/B2 ∥ `ledger/LEDGER.md` §11）+ 收口轮（三端实走 + 浏览器实走） |
| ③ 编号全局唯一（跨本可解析） | 单元测试档（N4） |
| ④ 直写服务端（零门槛 ∥ 零去重拦截） | 单元测试档（N5） |
| ⑤ 无离线缓存 | 单元测试档（B1/E1）∥ `TEAM-LEDGER.md` §6 |
| ⑥ 个人 ⇒ 团队仅显式上送（零自动映射/双向） | 单元测试档（E2/E3——两账互不影响）+ import 面机检（零跨账代码路径） |
| 需求 ⑥（界面维护管理） | 单元测试档 + 收口轮（浏览器实走——`webui/LEDGER.md` §4） |
| 需求 §3（端侧同批） | 三端零改动 + 核单源到齐；收口轮三端任一实走 |

### 2.6 关键决策（编号 as-of 2026-10-13——本批 KD-SV-139–148 ∥ D-TL1–D-TL6）

`ledger/LEDGER.md` §2：新立 ledger 域 ∥ 单表 + 全局编号 + 仓 = 归一地址 ∥ 六态/老化沿本机台账（存储独立）∥ 两面族端点共享域模块 ∥ 判权 = B2 能力矩阵（读 `view`/写 `write`）+ 未登记仓拒写 ∥ 端侧仓标记自动派生（服务端归一单源）∥ 上送 = 工具面组合（零跨账代码路径）∥ 审计 +1 型 `ledger_event`（v20 十五型）∥ 项目删除不级联。
`webui/LEDGER.md` §1：承载 = `#/me/ledger`（我的组末位——成员可达面；admin 同页全量）。
`TEAM-LEDGER.md` §3：核工具单源（三端零逐端改动——端侧同批结构性达成）∥ 子代理只读变体 ∥ 本批不做逐端独立面板。

### 2.7 设计新发现（随报——consistency surface 已当场修正，均在此列明）

1. 板档 §3 文档地图 webui 面档表**原漏登 `webui/TABS.md`**（在盘 11 档 ∥ 表列 9）——本批补登 + 计数收正（9 ⇒ 11）。
2. `ACCOUNTS.md` 全档「十四型零增」六处（§5 三 ∥ §6 两 ∥ §7 一）+ §6 KD-SV-28「现行 = 十四型」——随本批十五型逐处收正。
3. `WEBUI.md` §1 档目链尾（「沙盒余面批后 51 ∥ 52」）与盘面实读（50 ∥ 49）差 1–2 档（在途批未落齐）——本批按 as-of 实读基线记增量并标「实施当刻以盘面实读收正」；未自改他批在途值。
4. i18n 键数现读 **872 ∥ 877**（as-of 2026-10-13 实读）——本批 +≈122/表（ledger ≈120 + shell 1 + system 1）；总账随实施实读收正。
5. KD/R 号冲突在途避让：KD-SV-137/138 已被 server-core-unification 批占用 ⇒ 本批取 **139–148**；R73 已被该批占用 ⇒ 本批取 **R74**。
6. 观察项：`src/store/db.mjs` v20 后 ≈675（软线 500 已越、硬限 800 未触）——既定触发（实读 >700）未触，本批不触发。

### 2.8 上抛项（待裁——详 = `ledger/LEDGER.md` §13 R74 ∥ 板级 = `PROJECT.md` §9 R74）

1. **判权读法披露**：团队账可见/可写 = B2 项目能力矩阵（KD-SV-143）——「控制台全队」= 数据层一本 + 权限过滤；**且仓须先经 B2 登记**（加仓 = admin）⇒ 团队账不为未登记仓建档。如用户本意 = 全员无差别可见/可写（无需项目登记）⇒ 翻案点（与需求 §1 前置件裁定相抵面需重裁）。
2. **控制台装载位披露**：页落 `#/me/ledger`（我的组——成员可达；admin 同页全量）——非 `#/admin/*`（管理组 = 管理员专属，与成员写权相抵）。
3. **端侧零独立面板披露**：本批人机面 = agent 对话（核工具） + 控制台页；逐端面板（CLI 状态行 ∥ VSC 面板 ∥ 桌面卡片）未做（用户未点名）。
4. **需求档回笔建议**（主 agent 笔）：AC-12 页数链（我的 ⇒ 5）∥ AC-14 档目链随正 ∥ AC-28 审计型数（十四 ⇒ 十五型）。
5. **父侧笔随动件**：`docs/README.md` §1 档数（server 设计 22 ⇒ 24；总 76 ⇒ 79——沿 R1 先例）。

### 2.9 评审轮次 1 修复（fix 轮 · eng-designer · 2026-10-13）

承 §3 轮次 1（pass——🔴0 ∥ 🟡8 ∥ 🔵6）；父侧裁：1–12 修 ∥ 13 = 本席（§2 状态行）∥ 14 = 范围声明·父侧留。逐条落点：

| # | 落点 | 改动 |
|---|---|---|
| 1 | §2.4 服务端行 ∥ `ledger/LEDGER.md` §9 | `accounts/audit.mjs` 补行（实读 118 ⇒ ≈119——`AUDIT_TYPES` += `ledger_event`；取「文件确改」径——§2.3「行 +1 型」句不改为 CHECK-only） |
| 2 | §2.4 两行 ∥ `ledger/LEDGER.md` §9 两行 ∥ `webui/LEDGER.md` §3 四行 | 九件现状实读补实（run 137 ∥ projects 360 ∥ 门面 15/15 ∥ shell 78/76 ∥ system 207/207 ∥ 守卫件 167——内容行数口径）；run.mjs 增量顺带收正（+1 ⇒ **±0**——`TRIMMED_FACES` 表项同行扩） |
| 3 | §2.4 控制台行 ∥ `webui/LEDGER.md` §3 | nav/app 口径收一（101 ⇒ ≈103 ∥ 202 ⇒ ≈204；批档侧三值陈估「≈105/≈208/实读 197/≈199」删清） |
| 4 | §2.3 WEBUI 行 ∥ `PROJECT.md` §9 R70 stub ∥ `webui/WEBUI.md` §6 | 我的链一条（4 ⇒ 5——as-of 盘面实读基线；在途两批各 +1——序以实施当刻实读收正）；R70/注⑱ 重复步清算（注⑱「我的 3 ⇒ 4」= 沙盒批预记未落——实际落 = team-projects-permissions 批） |
| 5 | §2.3 头 + I18N 行 ∥ `ledger/LEDGER.md` §13 R74② ∥ `PROJECT.md` §9 R74 stub | `webui/I18N.md` 入随正集一处定音（随正 5 ⇒ 6；落 = 实施轮——沿 `STORE`/`ACCOUNTS` 同例） |
| 6 | `PROJECT.md` §7 | 补 ledger 域行（验收节 = `ledger/LEDGER.md` §10 ∥ `webui/LEDGER.md` §4 ∥ `docs/core/design/TEAM-LEDGER.md` §6；AC-32——域行 + 跨域块并存） |
| 7 | `gateway/API.md` §1 ∥ `ledger/LEDGER.md` §5 ∥ 头注 | 交叉引用三处改指（§6 ⇒ §2 KD-SV-143 ∥ KD-SV-142/141 ⇒ KD-SV-143 ∥ §6/§5 ⇒ §10/§6） |
| 8 | 三新档头注 | closest-precedent 行补（B2 能力矩阵 + 本机台账/工具面先例——对齐 ∥ 偏离逐条） |
| 9 | `gateway/API.md` §2.10 ∥ `TEAM-LEDGER.md` §2.1 ∥ `webui/LEDGER.md` §2.1 | `repoName` 定音 = 行不下发（显示名 = 控制台 `repos[]` 回填；端侧展示 = 归地址；缺（项目已删）⇒ 显归地址） |
| 10 | `webui/LEDGER.md` §3 | 键数算术收平（≈993 ∥ 998 ⇒ ≈994 ∥ ≈999 = 现读 + ≈122/表） |
| 11 | §2.6 头 ∥ `ledger/LEDGER.md` 变更记录 | KD 段号统一 139–148（变更记录陈值 139–145 ⇒ 139–147 顺带收正） |
| 12 | `ledger/LEDGER.md` §10 | 补条序映射行（需求分条 ①–⑥ ↔ AC-32 行序——一处定音） |
| 13 | 本段状态行 | 改「设计完成」（`batch` status 笔） |
| 14 | 范围声明 | 不修——父侧留（评审 #14：五随正仅两档核验 ∥ 仓级无文档地图入册——判据降级声明） |

**同轮连带（报告在册）**：① `webui/ADMIN.md` §4 AC-17 行 ∥ `webui/READINGS.md` §5 AC-15 行——「我的 3 ⇒ 4」归 沙盒批 陈值（另批面——本轮不触，列报）；② `webui/WEBUI.md` §5 增量链（nav ≈105 / app ≈208 槽位）= 链式估值（另例——本轮按 §3 表裁域未触）。零新语义（评审发现直接导出项 + 同类连带收正）；产品码零触。

**读数时效注（同轮复核 · 2026-10-13）**：§2.4/§2.9 各实读 = as-of 复读值（行数口径 = 文件总行数）；同轮再测显示部分件已被在途批并行实施写入移动——`public/nav.mjs` 101 ⇒ **102** ∥ `public/app.mjs` 202 ⇒ **204** ∥ `i18n-{zh,en}-shell.mjs` 78 ∥ 76 ⇒ **79 ∥ 77** ∥ `public/views-audit.mjs` 206 ⇒ **208**（`nav`/`app`/两 shell mtime = 2026-10-13T04:46Z = 再测前 4 分钟）；另 `store/db.mjs` ∥ `bin/thincoder-server.mjs` ∥ `core/agent/family-tools.mjs` 现读 **630 ∥ 208 ∥ 192**（±1——文件自昨未改，属口径差）。不逐件分裁、不改任何数值（避免与并行写入互相追逐）——最终值以实施当刻盘面实读收正（§2.4 头已明写此律）。

### 2.10 收口随正块（收口随正轮 · eng-designer · 2026-10-13）

**设计面随正 = 四档 + 核面档**：`gateway/API.md` §2.10 POST 行 + §3 行（建面三态——父裁原文；§2.10 尾 ∥ §5 AC-32 行用例链 B1–B9 同拍）∥ `ledger/LEDGER.md` §9 实读回填 + §11 B9 行 + §13 R74 逐项标注与收口回填句 ∥ `webui/LEDGER.md` §3 全行实读回填 + §4 AC-12 行 + §6 随动项标「已办」 ∥ 板档 `PROJECT.md` §9 R70 序落定（§7 AC-32 行链 B1–B9 同拍） ∥ 核面档 `docs/core/design/TEAM-LEDGER.md` §5 实读回填。**零新语义**（实读与父裁原文）；产品码零触。

**判权三态裁决已落**（2026-10-13 裁定）：仓不存 ⇒ 400 人话 ∥ 仓存而无 `can.view` ⇒ 404 不辨（措辞 = 「项目不存在或不可见」）∥ 可见而无 `can.write` ⇒ 403——实现 = `items.mjs` 三态分派；设计面 = `gateway/API.md` §2.10/§3 ∥ `ledger/LEDGER.md` §11 B9。

**实读回填汇总**（行数 = 盘面实读）：server 面 = `items.mjs` **309**（估 ≈200） ∥ `routes.mjs` **59**（估 ≈120） ∥ `client-routes.mjs` **59**（估 ≈95） ∥ 核 `team-ledger.mjs` **282**（估 ≈180） ∥ 批单测档 **1206**（估 ≈300；父侧手单记 706——盘面复核 1207 行/内容行口径 1206，以实读为准）。webui 面 = `views-ledger.mjs` **300** ∥ i18n-ledger 对 **84 ∥ 84**（**65 键/表**） ∥ `nav.mjs` **104** ∥ `app.mjs` **206** ∥ `views-audit.mjs` **238** ∥ shell **80 ∥ 78**（键 61 ∥ 61） ∥ system **208 ∥ 208**（键 185 ∥ 185） ∥ 门面 **16 ∥ 16**（键 **959 ∥ 964**） ∥ `public/` 档目 **54 ∥ 53** ∥ 我的 **6**（管理 11——侧栏 17）。

**跨批守卫件 = 已办（父侧）**：结构守卫（PARTS += `ledger` ∥ DOMAINS += `me.ledger` ∥ 指纹 zh `7ba6415a…f477a` ∥ en `3d1a4cc7…01c991` ∥ 键数 959∥964）复跑 6/6 绿；另七件复跑绿（runner-admin 余 1 红 = #1297 存量——非本批）。**需求档回笔 = 已办（主 agent——`docs/server/requirements/PROJECT.md:661` 变更记录行）**；`docs/README.md` 档数 = 父侧笔（收口轮落）。板档 §6 预算块 = 无（本批未添——不涉）。

**列报（本轮坐标外）**：① `webui/WEBUI.md` §6 AC-12 行（及 `sandbox/SANDBOX.md` §16 R73 行）仍载同链「**5 ∥ 6**（…序以实施当刻实读收正）」——建议收口扫尾同拍；② `docs/core/design/TEAM-LEDGER.md` §5 余三行（tool-docs ∥ family-tools ∥ team.mjs）未回填——未得手单值，列报。

## §3 设计评审（评审子代理）

### 轮次 1（评审子代理）

| # | Category | Severity | Issue | Suggestion |
|---|----------|----------|-------|------------|
| 1 | Affected-file annotations | 🟡 | 受影响文件表缺 `src/accounts/audit.mjs`：批档 §2.3 已声明本条改其型面——「§4 `audit.mjs` 行 +1 型」（`thincoder/docs/batches/2026-10-13-team-ledger.md:50`），而 §2.4 服务端清单（同档 `:56`，「`src/project/projects.mjs`（±0——`normalizeAddress` 直引）」为该行末项）与 `ledger/LEDGER.md` §9 逐档表（`thincoder/docs/server/design/ledger/LEDGER.md:98`）均无该件。先例二读：B2 批含「`accounts/audit.mjs` **实读 116** ⇒ ≈118（+1 型）」（`thincoder/docs/server/design/PROJECT.md:726`）、配置控制台批「`audit.mjs` 实读 **108** ⇒ ≈109——`config_update` 入 `AUDIT_TYPES`」（同档 `:456`）；另有「（`audit.mjs` ±0——型面扩走 CHECK）」（同档 `:515`）径 | 二径择一收正：audit.mjs 确有改动 ⇒ §2.4/§9 补行（现读 ⇒ ≈+N）；实为 CHECK 扩型、文件零改 ⇒ §2.3「行 +1 型」句收正并明写零改 |
| 2 | Affected-file annotations | 🟡 | 九件受影响件缺「现状行数」注：`src/agent/run.mjs`「实读待回填 ⇒ **+1**」（`ledger/LEDGER.md:97`；批档 `:56` 同）∥ `src/project/projects.mjs` 仅「±0」（`ledger/LEDGER.md:98`）∥ `public/i18n-{zh,en}.mjs`「（import + 展开项——实读待回填）」（`webui/LEDGER.md:38`）∥ shell / system 各两件仅「（已落盘）」（同档 `:39`/`:40`）∥ 守卫件「（已落盘） | 随正（PARTS/DOMAINS」（同档 `:42`）。除 `db.mjs`（631 ⇒ ≈675——「v20 落地后 ≈675（软线 500 已越、硬限 800 未触）」，`ledger/LEDGER.md:101`，无越档）外各件增量 ≤±2——无越档风险，但双注纪律未齐 | 各件补现状实读，或统一明写「实施当刻实读回填」并同拍标注 |
| 3 | Doc consistency | 🟡 | `nav.mjs`/`app.mjs` 行数注两处互不合：批档 §2.4「`public/nav.mjs`（101 ⇒ ≈105）∥ `public/app.mjs`（202 ⇒ ≈208；实读 197 ⇒ ≈199——as-of 盘面）」（`:58`）vs `webui/LEDGER.md` §3「101 ⇒ **≈103**」（`:35`）与「202 ⇒ **≈204**」（`:36`） | 择一收正（nav/app 各 +2 行口径与「+1 import +1 挂载行」自洽；另一侧三值陈估删清） |
| 4 | Doc consistency | 🟡 | 「我的」页数链两处互不合：批档 §2.3「§6 AC-12 行链（我的 5 ⇒ 6）」（`:51`）vs `webui/LEDGER.md` §3「我的 4 ⇒ **5**」（`:46`）与 `ledger/LEDGER.md` §13 R74「（我的 4 ⇒ 5；静态档目 +3）」（`:152`）；周边基数亦乱——板档 R70「我的 3 ⇒ 4（本批）⇒ 5」（`PROJECT.md:306`）与沙盒批注⑱「**我的 3 ⇒ 4**」（同档 `:662`）重记同一步 | 以盘面实读定一条链（4 ⇒ 5 ∥ 5 ⇒ 6 择一）三处同拍；顺带清算 R70/注⑱ 重复步 |
| 5 | Doc consistency | 🟡 | `webui/I18N.md` 随动归属四处不齐：批档 §2.3 标「### 2.3 设计档落点（新档 3 ∥ 随正 5）」（`:41`）未含 I18N；`ledger/LEDGER.md` §13 R74②「② 随动件（父侧/实施轮）：`store/STORE.md` §2 v20 段入盘」（`:152`）亦未含；而 `webui/LEDGER.md` §6 指名「`webui/I18N.md` §2.1 域界登记（`ledger` 新部件对）+ §3 行随正」（`:69`）、板档 R74 stub 又列「随动件（`STORE`/`API`/`ACCOUNTS`/`WEBUI`/`I18N` 五档」（`PROJECT.md:311`） | 随正集含否 I18N 一处定音，三档同拍 |
| 6 | Doc consistency | 🟡 | 板档 §7 域索引表缺 `ledger` 行：§4（`PROJECT.md:119`「| ledger | `ledger/LEDGER.md` §2（KD-SV-139–147） ∥ `webui/LEDGER.md` §1（KD-SV-148） |」）与 §6（同档 `:153`）均已补，§7 表止「| project | `project/PROJECTS.md` §9 |」（`:173`）∥「| agent | `agent/ADMIN-AGENT.md` §7/§8 |」（`:174`）；AC-32 仅落跨域块（`:217`）——AC-44 先例 = 域行 + 跨域行并存 | §7 补 ledger 域行（验收节 = `ledger/LEDGER.md` §10 ∥ `webui/LEDGER.md` §4；AC-32） |
| 7 | Clarity | 🟡 | 判权/验收交叉引用错位三处：① `gateway/API.md` §1 台账行判权括注「会话 + 项目能力矩阵（`ledger/LEDGER.md` §6）」（`thincoder/docs/server/design/gateway/API.md:23`）——§6 = 上送（判权 = §2 KD-SV-143）；② `ledger/LEDGER.md` §5 判权列「（KD-SV-142/141）」（`:62`）——142 = 两面族、141 = 状态机（应为 KD-SV-143）；③ `ledger/LEDGER.md` 头注「AC-32 判据 = 本档 §6 ∥ `webui/LEDGER.md` §4 ∥ `docs/core/design/TEAM-LEDGER.md` §5」（`:4`）——本档 §6 = 上送、TEAM-LEDGER §5 = 文件账（两处验收节实为 `ledger/LEDGER.md:103`「## 10. 验收判据（AC-32 ①–⑥ 对位）」与 `docs/core/design/TEAM-LEDGER.md:94`「## 6. 验收判据（AC-32 端侧面对位）」） | 三处逐项改指（单源指针档，错位会误导实施机检） |
| 8 | Methodology / Precedent | 🟡 | 未见 closest-precedent 行：批档 §2 与三新档均无「最近先例坐标（实现坐标 ∥ 对应档节 ∥ 先例批）+ 对齐 ∥ 偏离理由」的集中声明——先例引用散落（如 `docs/core/design/TEAM-LEDGER.md:57`「沿本机台账 `ledgerTool`/`ledgerReadTool` 先例」、`webui/LEDGER.md:11`「沿 `#/me/projects` 之例」） | 批档 §2 或新档头补一行：最近先例（疑 = B2 批 `project/PROJECTS.md` §3 能力矩阵 ∥ `webui/PROJECTS.md` ∥ KD-SV-115–128；及本机台账六态/老化）+ 对齐点 + 偏离点及理由 |
| 9 | Clarity | 🔵 | 行形字段面三处不齐：`gateway/API.md` §2.10 行携 `repoName`（`:244`「行 = `{ id, repo, repoName, status, title, detail, owner, createdBy, createdAt, updatedAt, closedAt, aged, canWrite }`」）∥ `docs/core/design/TEAM-LEDGER.md` §2.1 出参未列（`:35`「`closedAt` ∥ `aged` ∥ `canWrite`）+ `total`」）∥ 控制台渲染径 = `repos[]` 回填（`webui/LEDGER.md:19`「仓（`repos[]` 显示名回填地址）」）——`repoName` 存否/下发否未定音 | 端点单源定音后三处同拍（若端侧不下发 ⇒ 明写） |
| 10 | Doc hygiene | 🔵 | 键数算术不闭合：`webui/LEDGER.md` §3「本批 ⇒ **≈993 ∥ 998**（估算——以实施实读收正；守卫件指纹/键数同拍）」（`:45`）vs 批档 §2.7「本批 +≈122/表（ledger ≈120 + shell 1 + system 1）」（`:88`）——872+122=994 ∥ 877+122=999 | 按 994 ∥ 999 收平或明写取整口径 |
| 11 | Doc hygiene | 🔵 | KD 段号自述不一：批档 §2.6 头「本批 KD-SV-139–147 ∥ D-TL1–D-TL6」（`:77`）vs §2.7「本批取 **139–148**」（`:89`）——实际含 `webui/LEDGER.md` KD-SV-148（`PROJECT.md:119` 在册） | 统一为「139–148」 |
| 12 | Clarity | 🔵 | 两套编号（需求条序 ∥ AC-32 行序）同号异义且无映射：「两账独立」= 批档 §1 ①（`:11`）/ `ledger/LEDGER.md` §1「**两账独立**（需求 ③）」（`:11`）/ §10「AC-32① 两账独立（个人账本机照旧——未登录可用 ∥ 键 = 本地目录）」（`:107`）；「直写」= §1「**写时零门槛**（需求 ②）」（`:14`）/ §10「AC-32④ 写入 = 直写服务端（零门槛 ∥ 零去重拦截）」（`:110`） | 补一行「需求条序 ↔ AC-32 序号」映射，或统一引用族 |
| 13 | Methodology | 🔵 | 批档状态行占位残留（设计冻结 2026-10-13 12:19 后未更新）：§1「🔄 进行中」（`:6`）、§2「（eng-designer 写入时更新）」（`:18`） | 按状态行纪律更新为合法关键字（§2 = 设计完成） |
| 14 | Verification scope | 🔵 | 五随正仅两档在评审文件清单（API.md ∥ PROJECT.md）：`store/STORE.md` ∥ `accounts/ACCOUNTS.md` ∥ `webui/WEBUI.md` 随正内容本评审**未核验**（unverified）；且仓级无文档地图/标准档入册——文档归属与标准合规仅按板档 §3 与面内惯例判（判据降级） | 如需覆盖，三档列入评审清单另行核验 |

发现计数：🔴 0 ∥ 🟡 8 ∥ 🔵 6（共 14 项）。

VERDICT: pass

## §4 用户批准（主 agent）

**§4 批准（父侧代签——2026-10-13 12:58）**：依据 = 用户 2026-10-13 12:15「马上收口，别挂着」+ 12:16「自动跑，别等我」（全链授权：评审 ∥ 代签 ∥ 派实施全自动）。批准面 = 本批设计（评审 id 9 · 轮次 1 pass（🔴0/🟡8/🔵6）→ 修复轮（席 #13）12 条全落经父侧核读——三新档实读 + 单行位抽查 + `doc-check` 关涉档零新增）；父裁三条（判权读法 = B2 能力矩阵 ∥ 装载位 = `#/me/ledger` ∥ 端侧零独立面板）已并入设计；读数时效项按席默认（实施当刻实读收正）。实施 = eng-coder ×2（core+server 面 ∥ 控制台 UI 面——文件域拆分，UI 席 dependsOn 后端席；设计 token 已签发——凭据不入档）。

## §5 实施记录（eng-coder）
**状态行**：实施完成（后端面 11 件 + 单测 22/22 绿；审计 1 轮 clean ∥ 代码评审 2 轮 pass（父裁建面三态已落并核验；check-vsix 计数父侧已收正 51）；UI 面（public/**）归 UI 席）



**§5 实施记录（eng-coder · 后端面 · 2026-10-13）**

**交付面**：后端面 11 件（core 核工具 ∥ server 两端点族 ∥ store v20 ∥ 审计型面 ∥ 服务端 agent 裁剪面 ∥ 本批单测档）。**UI 面（`thincoder-server/public/**` 控制台页 / i18n / nav）= UI 席**——本席零触（单测档留 §C 占位）。

**落件（11 件——新建 5 ∥ 改动 6；行数 = 实读 ∥ 设计估）**

| 件 | 状态 | 关键点 |
|---|---|---|
| `thincoder-core/team-ledger.mjs` | 新 282 行（估 ≈180） | 五 action + 并集 schema / `ACTION_SPECS` 守卫；仓派生三步（`rev-parse --show-toplevel` ⇒ `config --get remote.origin.url` **原文**上送）；登录态门（未登录 ⇒ 明示 + **零 fetch**）；401 ⇒「登录已失效」∥ 不可达 ⇒「服务器不可达（零离线缓存）」（重试零旧值）；两变体导出 + `_setGitRunnerForTest` 注入缝 |
| `thincoder-core/tool-docs/team_ledger.md` | 新 9 行（估 ≈15） | DESC 文本单点（核 `tools/shared.mjs` DESC 加载面） |
| `thincoder-core/agent/family-tools.mjs` | 改 197→198 行 | depth-0 全量 + **全部 5 个 depth>0 段**（eng-coder ∥ eng-designer ∥ coder ∥ consult ∥ 兜底）只读变体（沿 `ledger` 先例） |
| `thincoder-server/src/ledger/items.mjs` | 新 303 行（估 ≈200） | 域逻辑单源：迁移表逐字沿本机台账 + 归档终态门 + aged + 能力矩阵判权（`can.view`/`can.write`）+ 四 kind 审计 |
| `thincoder-server/src/ledger/routes.mjs` | 新 59 行（估 ≈120） | 控制台四端点（cookie + `repos[]` = 可见项目 + canWrite + `surface:"console"`） |
| `thincoder-server/src/ledger/client-routes.mjs` | 新 59 行（估 ≈95） | 端侧四端点（Bearer + 仓原文归一 + 无 `repos[]` + `surface:"client"`） |
| `thincoder-server/src/store/db.mjs` | 改 675→676 行（估 675） | DDL_V20（十列 + 两索引 + 审计 CHECK 十五型重建）+ 迁移链 v20 行；零回填 ∥ 存量审计行逐值保形 |
| `thincoder-server/src/accounts/audit.mjs` | 改 119→120 行 | `AUDIT_TYPES` += `ledger_event`（十五型）+ 三处注释同拍 |
| `thincoder-server/src/agent/run.mjs` | 改 149→150 行（估 ±0） | `TRIMMED_FACES` += `team_ledger`（注释同行收正——保持 ±0） |
| `thincoder-server/bin/thincoder-server.mjs` | 改 208→213 行（估 208） | +2 import +1 注释 +2 注册行 |
| `docs/batches/2026-10-13-team-ledger.test.mjs` | 新 698 行（估 ≈300） | §A core 8 ∥ §B server 14 ∥ §C 占位（UI 席） |

**验证读数**

- `node --test docs/batches/2026-10-13-team-ledger.test.mjs`（仓根 `thincoder/`）⇒ **tests 22 ∥ pass 22 ∥ fail 0**（§A N1–N5/B1–B3/E1 ∥ §B N1–N5/B2–B8/E1/E4 ∥ KD-SV-147 不级联 ∥ E2/E3 两账独立 ∥ 两处 import 面机检）。
- `node --check` 十档全 OK（五新档 + 五改档）。
- 邻面回归自检（改动件 `family-tools.mjs` 的既有断言面）：`2026-10-05-ledger-unification` 18/18 ∥ `2026-10-08-manifest-agent-tool` 11/11 ∥ `2026-10-09-normal-work-management` 9/9 全绿。
- 已知越档读数（他批件——本席零触，报父侧随动）：`2026-10-10-team-login-client-access.test.mjs:274`（十四型）∥ `2026-10-12-server-wake-face.test.mjs:570`（v19）∥ `2026-10-12-team-projects-permissions.test.mjs:154`（十四型）——本批 v20 / 十五型使其断言必红。

**决策透明表**（设计留白处本席判读——逐条可逆）

| # | 留白 | 判读 | 依据 |
|---|---|---|---|
| 1 | 列表排序未定 | `ORDER BY id` | 沿本机台账 `ledger query` 先例（零语义面） |
| 2 | update 能否迁入归档态 | 允许（迁移表逐字）；归档后再动由终态门拒 | KD-SV-141「沿本机台账逐字读法」＋终态门为有意收窄 |
| 3 | update 面 `owner` 空值 | 400（「缺省 = 自己」为建面专属） | 建面/改面语义分列 |
| 4 | 已删项目旧账行 | admin 可见可写；非 admin 不可见（404 不辨） | KD-SV-147 |
| 5 | 权限位等级（`owner` ∥ `level=admin`） | 不计通过 | 沿 B2 `capabilitiesOf` 单源 |

**审计与代码评审轮次（终态 = clean）**

1. 内部 explore 偏差审计（read-only，12 条验收面）：全 ✅、无 🔴/🟡；1 项 🔵（单测缺 E2/E3 用例）⇒ 已修；1 项覆盖建议（审计 CHECK 直插断言）⇒ 已修。
2. 内部 advisor 代码评审（同步）：**VERDICT: pass**（无 🔴）；2 🟡（① `thincoder-vscode/scripts/check-vsix.mjs:37` 描述档计数需 50⇒51[父侧先例件，已上抛]；② 建面「无 view 仓 ⇒ 403」与「不可见 ⇒ 404 不辨（KD-SV-143）」的设计面张力，待父裁）+ 3 🔵（守卫两副本分叉 ∥ `db.mjs` 676 行 ∥ 单测档 698 行——裁决覆盖项/先例内，零动作）。

**fix round**（≤5，实走 1 轮）

- **R1**（审计后自修）：单测档 +2 用例——① E2/E3 两账互不影响（上送后改本机 ⇒ 团队行逐值零变；改/撤团队 ⇒ 本机行逐值零变）；② 审计 CHECK 表级直插断言（`ledger_event` 放行 ∥ 表外型拒——防目录与 DDL 漂移）。⇒ 复跑 22/22 绿。
- 评审后零改动（评审对象 = 交付对象；🔵 项为可选，不越评审冻结窗）。

**上抛**：[上抛·待裁] 无 view 仓建条目 403 ∥ 404 不辨（设计面留白——实现按 API.md §2.10 字面落地，未擅改）；[上抛·知会] `check-vsix.mjs:37` `EXPECT["tool-docs"]` 需 50⇒51（沿 #1098 父侧先例）。

**R2（父裁落地——建面判权三态）**：父裁 = 仓不存 ⇒ 400 人话 ∥ 仓存而无 `can.view` ⇒ **404 不辨**（措辞同 B2 项目面 `project/projects.mjs:106`）∥ 可见无 `can.write` ⇒ 403。落件 = `items.mjs` 三态分派（`:215` 400 ∥ `:217` 404 + 常量 `:56` `PROJECT_NOT_FOUND_MESSAGE` ∥ `:218` 403）+ `routes.mjs:6-7` 头注同拍 + 单测档三态用例（`:485` 403 ∥ `:489` 400 ∥ `:491-496` 404 不辨 + 两面同措辞 + 404 零落库）。校验 = write ⊆ view（`projects.mjs:91-92`）⇒ 新 404 门不误伤合法写者；调用点唯一（`routes.mjs:37` ∥ `client-routes.mjs:37`）。复跑 **22/22 绿**；轮次 2 advisor 代码评审 **VERDICT: pass**（0 🔴；1 主机引用告警 ⇒ 就地收正 `items.mjs:217` 注释措辞——零语义改，复跑仍 22/22）。残留 🔵 = `client-routes.mjs:33` 注释未载另两态（可选对齐；语义单源在 `items.mjs`，零阻塞）。设计档两处（`gateway/API.md` §2.10 ∥ `ledger/LEDGER.md`）由父侧收正——本席零触。

**§5 读数收正（R2 后）**：单测档实读 **707 行**（R2 三态用例 +≈9 行；上表「698 行」= R1 当刻读数，不改旧行）；「评审后零改动」句限 R1 当刻——R2 为父裁落地（见下），轮次 2 已复评 **pass**。终态 = **clean**（审计 1 轮 + 代码评审 2 轮 + fix 2 轮）。

### 2026-10-13 · 控制台 UI 面（eng-coder 席——UI 面派单；承本档 §2 与父侧任务书）

**① 交付摘要**：`#/me/ledger` 页（页头 + 三筛「即选即查」+ 表七列 + 空态两形 + 加载/错态 ∥ 行点击 ⇒ 详情/编辑弹窗 ∥ 行内收口/撤回 ∥ 新建弹窗）∥ IA 我的组末位 +1（`labelKey` 单源）∥ 装配 +1 import +1 `PAGES` 行 ∥ i18n 新部件对（域界 `me.ledger.*`，65 键/表）+ shell/system 各 +1 键 + 门面 +1 import ∥ 审计面型表 +1（`ledger_event`）+ 详情支（四 kind ∥ 两面）∥ `webui/I18N.md` 随正（§2.1 拆表链/覆盖范围/零 CJK 口径 ∥ §3 门面两行 ∥ §4 AC-14 行 ∥ 变更记录）∥ 单测档 §C 八用例（§A/§B 零动，仅追加；档头 §C 行随正）。
**禁面零触**：`src/**` ∥ `thincoder-core/**` ∥ 跨批守卫件 `2026-10-08-server-public-structure.test.mjs` ∥ `SHELL_PAGES` ∥ `style.css`（`:root` 58 变量 ∥ `:hover` 8 零动——单测机检）。

**② 落件（实读行数 ∥ 设计估）**：新 `public/views-ledger.mjs` **300** ∥ ≈300 ∥ 新 `i18n-zh-ledger.mjs` **84** ∥ ≈150 ∥ 新 `i18n-en-ledger.mjs` **84** ∥ ≈150 ∥ `i18n-{zh,en}.mjs` **16 ∥ 16** ∥ ≈17 ∥ `i18n-zh-shell.mjs` **80** ∥ `i18n-en-shell.mjs` **78**（各 +1 键）∥ `i18n-{zh,en}-system.mjs` **208 ∥ 208**（各 +1 键）∥ `nav.mjs` **104** ∥ ≈103 ∥ `app.mjs` **206** ∥ ≈204 ∥ `views-audit.mjs` **238** ∥ ≈211 ∥ 单测档 **1206 行**（§C 追加）∥ `webui/I18N.md` 84。
**键数**：ledger 部件 **65/表**（估 ≈120——实读收正）∥ 门面 **ZH 959 ∥ EN 964**（892 + 65 + 1 + 1 ∥ 897 + 65 + 1 + 1；估 ≈994 ∥ ≈999）。

**③ 决策透明表**
| # | 决策 | 依据 ∥ 理由 |
|---|---|---|
| 1 | 六态**线上值**自 zh 表取词（`V` 常量），本档零 CJK 字面量 | 域语汇为中文（沿本机台账——KD-SV-141）∧ 前端 JS 代码档「注释外零 CJK」口径（`webui/I18N.md` §2.1）相冲；唯一 CJK 载体 = zh 表 ⇒ 值取 zh 表词（与界面语言无关）、展示标签仍经 `t()` 随动；§C ⑧ 机检值集/迁移表 = 服务端 `src/ledger/items.mjs` 逐字（防两面漂移）。设计档随正登记（`webui/I18N.md` §2.1 域语汇注）。 |
| 2 | `ALLOWED_MIGRATIONS` 本地副本 | 浏览器面不可引服务端模块；副本逐字对齐 + 机检相等（§C ⑧）。 |
| 3 | 归档态（已核销/已废弃）状态选单仅当前值 | 「合法后继 ∪ 当前值」对归档态会诱导非法迁移；服务端终态门先行必 400 ⇒ 页面按服务端实际判罚同形（注释在案；建议设计档下次触档补句）。 |
| 4 | 非 `canWrite` 行零动作控件（操作列「—」）∥ 归档行仍渲动作 | 遵设计「行内动作仅 `canWrite` 渲」字面；点后由服务端 400 人话就地呈（是否前置禁用 = 后续产品判断）。 |
| 5 | 收口 400 = 行内状态行 ∥ 撤回 = 非原生 `confirmModal` + 后果句 | 设计 §2.1 两动作逐字；零原生 `confirm`（§C ⑥ 机检）。 |
| 6 | 首屏（首个列表响应前）「新建」禁用 | 可写项目未知 ⇒ 空选单空仓上送必 400；响应后按 `repos[]` 复算（code 评审 🔵#4）。 |
| 7 | 行内状态行失败呈文后补回 `cell-hint` 类 | `showNote` 重写类名 ⇒ `th,td` 全局 `nowrap` 下长文案不折行（`style.css` `.cell-hint` = 折行面）；§C ⑥ 断言（code 评审 🔵#3）。 |

**④ 验证**：`node --test docs/batches/2026-10-13-team-ledger.test.mjs`（自 `thincoder/` 仓根）⇒ **30/30 全绿**（§A 8 ∥ §B 14 ∥ §C 8）；各次写入/编辑随拍语法检查 OK；单测档 §C 机检面 = IA/键集/静态面/页行为/弹窗/行内动作/新建/审计+域一致性。

**⑤ 审计与代码评审（轮次 ∥ 终态）**
- 偏差审计（explore · 只读 · 1 轮）：代码面零 🔴 ∥ 零静默降级 ∥ 零越界 ∥ 禁面零触；🟡 唯一 = 文档披露类（实读收正未落 §5——即本节）；🔵×3（归档态选单建议补句 ∥ 测试档头注「占位」措辞 ∥ 归档行仍渲动作）。
- 代码评审（advisor · 1 轮）：**pass**（0 🔴；🟡×2 = 跨批守卫件随正未落 ∥ 本档记录面滞后；🔵×4 = `cell-hint` 覆写 ∥ 首屏竞态 ∥ `reload` 缺省陷阱 ∥ 设计档 §3/§4 数值未收正）。
- fix round（1 轮）：🔵 三条落码（`views-ledger.mjs:92` 初值禁用 ∥ `:193` 补类 ∥ `:217`/`:267` `reload` 缺省空函数）+ 单测加固（§C ⑥ 类名断言 ∥ §C ⑦ 首屏断言 ∥ 桩 `classList`⇄`className` 同步）；复跑 30/30 绿。
- 终态：**converged（clean）**——码内发现项全收口；余项 = 跨档件（⑥）与记录面（本节即其补记）。

**⑥ 已知越档读数（他批件——本席零触，报父侧随动）**
| 件 | 断言 | 现读 | 结论 |
|---|---|---|---|
| `docs/batches/2026-10-08-server-public-structure.test.mjs` | `PARTS` 七件（无 `ledger`，:42）∥ ① 键数 892 ∥ 897 + ANCHOR 指纹（:66-70）∥ ② 并集 = 门面全键（:90） | 门面 959 ∥ 964 | ①/② 必红；④/⑥ 抽档清单由 `PARTS` 派生 ⇒ 两新部件未纳静态直发/行数核。随正 = `PARTS` += `ledger` ∥ `DOMAINS` 补 `me.ledger` ∥ 键数/指纹收正 |
| `2026-10-10-runner-admin-console-ui.test.mjs:484` | [892, 897] | 959 ∥ 964 | 必红 |
| `2026-10-10-server-small-fixes.test.mjs:74-75` | 892 ∥ 897 | 同上 | 必红 |
| `2026-10-11-admin-agent-chat-ui.test.mjs:293` | [892, 897] | 同上 | 必红 |
| `2026-10-12-team-projects-permissions-ui.test.mjs:206/210/214/215` | shell 60 ∥ system 184 ∥ ZH 892 ∥ EN 897 | 61 ∥ 185 ∥ 959 ∥ 964 | 必红 |
| `2026-10-11-console-tabs-component.test.mjs:443-444` | 854 ∥ 859 | — | 先批在途已失配（本席零关，一并报） |
其余旧件（`2026-10-06-server-i18n.test.mjs` 等）扫描面 = 固定档目快照——本批零关。

**⑦ 余项（父侧）**：`webui/LEDGER.md` §3/§4 数值按实施实读收正（键数总账 **959 ∥ 964** ∥ 两新档实读 **84 行 ∥ 65 键** ∥ 页数链 5 ⇒ **6**；行数估现值 300/104/206/238 与实读逐值已对齐至 ±2 内）；`WEBUI.md` §1 静态档目随正 = 设计轮已落（本席零触）；§6 收口同拍。

## §6 验证与收口（父代理）

**收口 · 2026-10-13（主 agent）**——两腿交付 + 父侧核读 + 随正全办；本批闭环。

**① 交付面（两席）**：后端席（#19）11 件（`core/team-ledger.mjs` 282 ∥ `tool-docs/team_ledger.md` 9 ∥ `family-tools.mjs` 198 ∥ `src/ledger/items.mjs` 309 ∥ `routes.mjs` 59 ∥ `client-routes.mjs` 59 ∥ `store/db.mjs` 675 ∥ `accounts/audit.mjs` 120 ∥ `agent/run.mjs` 149 ∥ `bin/thincoder-server.mjs` 213 ∥ 批单测档）∥ UI 席（#20）16 件（`views-ledger.mjs` 300 ∥ `i18n-{zh,en}-ledger.mjs` 84 ∥ 84 ∥ 门面 16∥16 ∥ shell 80∥78 ∥ system 208∥208 ∥ `nav.mjs` 104 ∥ `app.mjs` 206 ∥ `views-audit.mjs` 238 ∥ `webui/I18N.md` 等）。

**② 核读读数（父侧复跑）**：批单测档 `node --test docs/batches/2026-10-13-team-ledger.test.mjs` ⇒ **30/30 全绿**（§A 8 ∥ §B 14 ∥ §C 8；实读 1206 行——原报 706 = R2 期读数，终态以 1206 为准）∥ 键数 **959 ∥ 964**（+67/表）∥ ledger 部件 **65 键/表** ∥ 静态档目 **54 ∥ 53** ∥ 页数链我的 **6**（末位 `#/me/ledger`）∥ 判权三态落 `items.mjs:204-222` ∥ v20 段 `db.mjs:565-602` 逐字 ∥ 核工具全文核读（五 action ∥ 只读变体 ∥ 仓派生三步 §2.2 ∥ 登录态门零 fetch ∥ 零跨账 import）。批内件 = 随批档归档（单元测试档；不入发布门——用户 2026-10-12 裁）。

**③ 判权裁决（本批唯一语义裁定——父裁 2026-10-13）**：建面三态——仓不存 ⇒ 400 人话 ∥ 仓存而无 `can.view` ⇒ **404 不辨**（措辞同 B2 项目面）∥ 可见而无 `can.write` ⇒ 403。落件 = `items.mjs` 三态分派 + 用例 + 设计档两处（`gateway/API.md:245` ∥ `ledger/LEDGER.md` §11 B9）。

**④ 跨批守卫随正（父侧直接执行 · 九件 · 全可 revert）**：`2026-10-08-server-public-structure`（`PARTS` += `ledger` ∥ `DOMAINS` += `me.ledger` ∥ 指纹两枚重算 ∥ 键数——复跑 **6/6**）∥ `2026-10-10-runner-admin-console-ui`（键数 + 档目——**7/8**：余 1 红 = `views-sandbox.mjs` 502 越顾问线 = **#1297 存量**）∥ `2026-10-11-admin-agent-chat-ui`（**7/7**）∥ `2026-10-12-team-projects-permissions-ui`（**7/7**）∥ `2026-10-06-server-i18n`（JS_FILES + `views-ledger.mjs` ∥ labelKeys 19——**6/6**）∥ `2026-10-10-server-small-fixes`（**8/8**）∥ `2026-10-13-sandbox-outbound-member-face-ui`（我的 6 ∥ 末位项——**8/8**）∥ `2026-10-10-team-login-client-access`（十五型 ∥ v20×2——**9/10**：余 1 红 = 「链自检」= prepublishOnly 链撤除死前提，非本批）∥ `2026-10-11-sandbox-image-sources`（v15 段——**13/13**）。`2026-10-11-console-tabs-component` 854∥859 = 先批在途失配（红族 #1354 备查，不触）。

**⑤ 需求档回笔（主 agent）**：`docs/server/requirements/PROJECT.md` 十二处 + 「在途」标记落定翻正（AC-12 链 ∥ §2:13/:14 ∥ AC-28 v20/十五型 ∥ AC-36 ⑧/③ ∥ 出站行 L1/L2 消歧 ∥ 成员面句 ∥ 待随正句结 ∥ 变更记录 `:661`）；README 补登（server 25 档 ∥ 总 79 ∥ core 实档 61 对账——`docs/README.md` §1/§4 + 变更记录）。

**⑥ 设计面收正（席 #23 · fix 轮 + 父侧扫尾）**：`gateway/API.md`（三态 ∥ §3 ∥ B1–B9）∥ `ledger/LEDGER.md`（§9 实读 ∥ B9 ∥ R74）∥ `webui/LEDGER.md`（§3 全行实读 ∥ 键族 65 ∥ 键数 959∥964 ∥ 页链 5⇒6 ∥ 档目 54∥53）∥ `design/PROJECT.md`（R70 序落定）∥ `docs/core/design/TEAM-LEDGER.md`（§5 实读）∥ 批档 §2 补正块；父侧扫尾五笔（`WEBUI.md` AC-12 行序落定 ∥ `SANDBOX.md` R73 键数随正 ∥ TEAM-LEDGER §5 两值回填 ∥ 折行——全可 revert）。

**⑦ 机检读数**：`node scripts/doc-check.mjs` ⇒ 悬空 **11**（存量集——无一本批档）∥ 行宽 **2**（`design/PROJECT.md:720` ∥ `webui/CHAT.md:202`——均存量）。

**⑧ 残余与观察项**：
- `runner-admin-console-ui` 余 1 红 = **#1297**（`views-sandbox.mjs` 502 越 500 顾问线——存量，非本批）。
- `team-login-client-access` 余 1 红 = 「链自检」（prepublishOnly 链撤除死前提——复跑勿误判）。
- 浏览器两语言实走 ∥ 三端实走 = **未跑**（本机无现成部署面；沿批际惯例 = 部署轮/用户侧 ECS 实走收；本批核读以 30/30 + 两面机检相等为准——UI 席 §5 决策表 #4「归档行仍渲动作」= 后续产品判断）。
- 六态值/迁移表两面机检逐字相等在册（§C ⑧——防两面漂移）。
- `.wt-head-probe` 孤儿树 = 仓外，待用户裁（本批零涉）。

**⑨ 结算**：台账 #1206 ⇒ **已核销**（evidence = 落件坐标 + 本 §6；两跳）；本批文档冻结（§1–§6）；designToken 消费。闭合。
