# 2026-10-11 · sandbox-image-sources（镜像源族）
> 六段 append-only，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 编制：主 agent · 2026-10-11 · 来源 = 用户 2026-10-11 09:17 三点（镜像源管理 ∥ 源目录清单 ∥ 查找筛选）+ 09:19 补点（常用源预选）+ 09:20「开始吧，自动跑。」。
> 台账 = #1274（server · 归批）。前情 = docs/batches/2026-10-11-sandbox-docker-admin.md §6（已收口 2026-10-11；本批 = 其镜像面之外的源族补充）。
## §1 讨论（主 agent）
**状态行**：已收口 2026-10-11
<§1 模板占位：本批条目 / 关键判据 / 授权口径>

### 2026-10-11 09:17–09:20 · 需求讨论与授权（主 agent）

- **来源与入册**：用户 09:17 四点（① 镜像源管理 ② 列源上镜像目录 ③ 查找筛选 ④ 拉取走 proxy？）+ 09:19 一点（增源表单提供常用镜像源预选）；**④ 用户当场撤**（原话「走代理这个就算了」）⇒ 本批射程 = **①②③ + 预选**。需求落点 = `docs/server/requirements/PROJECT.md` §2:38 + AC-38（同轮入册：提交 `5e4979bb` ∥ `f4dfec48` 双推）；台账 **#1274**。
- **范围（本批 = 功能点 38，不多不少）**：① 控制台可管理远程镜像源清单（增/删/改/列 + 常用源预选；每源 = 名称 + 地址）∥ ② 对可达源列镜像目录（仓库 ∥ 标签）∥ ③ 本地镜像表与源目录的查找筛选。**边界**：拉取走代理不做；拉取行为本身不变（仍由节点引擎拉取）。
- **平台事实（本刻实测，设计不得超卖）**：Docker Hub 全站目录/搜索 API 官方关闭（对 Hub 至多「已知镜像的标签列表」——经代理实测 nginx tags 通，1339 条）；引擎内置 `images/search` 实测空回（已死不可作兜底）；自建 registry ∥ Harbor ∥ 云厂商 registry 按标准 v2 接口可达。
- **授权（用户 09:20 原话「开始吧，自动跑。」）**：本批**设计评审点火权** ∥ **§4 用户批准权（代签）** ∥ **修正/实施轮派发** ∥ **收口核销与提交**——均委托父侧自动执行，直至本批收口。**父侧自缚三条（本仓惯例·先例同形）**：① 代签仅当三条件齐备（评审 pass 0🔴 ∧ 修正轮已落地并逐条核验 ∧ token 已签发），每次代签在 §4 写明「父侧代签（用户 09:20 授权）+ 依据」；② 新范围 ∥ 用户口径裁决 ⇒ 停下、只摆那一条；③ 破坏性/不可逆 ⇒ 先停。

## §2 批次任务与设计（eng-designer）
**状态行**：设计完成（评审轮 1 修正（fix 轮）十号逐条落位（本段末块）——待父侧核验）
<§2 模板占位：本批条目（覆盖） / 设计档落点 / 机制设计 / 受影响文件与测试面 / 验收对照 / 关键决策 / 上抛项>

**设计轮交付（eng-designer · 2026-10-11）**

**批次**：sandbox-image-sources（沙盒镜像源族）· 台账 #1274 · 需求档 `docs/server/requirements/PROJECT.md` §2:38 + 验收表 AC-38 · 用户口径 2026-10-11 09:17（四点；其中「拉取经代理」一点用户当场撤回）+ 09:19（常用源预选）。

### 本批覆盖的需求条目（回指需求档）

1. **① 镜像源 CRUD + 常用预选**：控制台增/删/改/列远程镜像源（名 + 地址；名 ∥ 址**各自唯一**；地址归一 `[http(s)://]主机[:端口]`）+ 常用源预选六条（表单只回填名/址两字段）。
2. **② 源目录清单**：对可达源读**仓库目录**（v2 `_catalog`）+ **标签清单**（v2 `tags/list`；Hub 面走公开 API）；读绪**如实**（`timeout` ∥ `unreachable` ∥ `auth_required` ∥ `unsupported` ∥ `bad_response`）。
3. **③ 搜索/过滤**：本地镜像表过滤（名/标签）+ 源目录浏览窗两处过滤（仓库列表 ∥ 标签列表）——纯前端 ∥ 零新端点。
4. **预选清单**（用户 09:19 原话口径）：六条 = Docker Hub ∥ ghcr.io ∥ quay.io ∥ 阿里云 ACR ∥ 华为云 SWR ∥ DaoCloud 镜像（随设计轮维护）。
5. **边界（用户撤回项落纹）**：**拉取行为零改**——源不写节点 dockerd 配置 ∥ 不注入镜像前缀 ∥ 无默认源；「拉取经代理」已撤回 ⇒ 不入本批。

### 明确不在本批（清单全文 = `docs/server/design/sandbox/SANDBOX.md` §15 首条）

私有源凭据 ∥ 源目录「一键拉取」（预填拉取窗——**提请裁定**；裁定为可 ⇒ 实施轮随批落，≈20 行）∥ 源读取走 `proxy.uri`（**提请裁定**）∥ 分页/翻页/排序 ∥ 源写入节点配置 ∥ 默认源语义 ∥ 按节点源清单 ∥ 保存时探活预校验 ∥ 子路径源 ∥ 建容器表单镜像选择器（「清单下拉」——与源目录**非同一件**）。

### 设计落点（设计 8 项全落——落档，不在本段复述接口细节）

- 机制全文 = `docs/server/design/sandbox/SANDBOX.md` §3（本批块：做法与理由 ∥ 用例 ∥ 边界 ∥ 自加项逐条带理由）+ §11 判据行 ∥ §12 用例 ∥ §13 预算 ∥ §14 决策 ∥ §15 边界。
- 接口契约 = `docs/server/design/gateway/API.md` §2.5（镜像源七行 ∥ 读类 10s ∥ 自含状态形）；存储 = `docs/server/design/store/STORE.md` §2 v15 段/§3 v15/§4；审计 = `docs/server/design/accounts/ACCOUNTS.md` §2.1；控制台 = `docs/server/design/webui/WEBUI.md` §2.8①/§5/§6；决策索引 = `docs/server/design/PROJECT.md` §4/§5/§6/§7（AC-38 行）。
- **关键决策（三条新增）**：KD-SV-96（源清单 = server 全局配置表 v15 + 与拉取链路零耦合）∥ KD-SV-97（读取 = 标准 v2 + Hub 面 + 匿名 Bearer 挑战 + 有界首页 + 五分类如实报错）∥ KD-SV-98（UI = 沙盒页新卡 + 目录浏览弹窗 + 前端过滤）。
- **设计侧自加项**（逐条带理由，非用户口径）= 同档 §3 表五条：匿名 Bearer 挑战换取 ∥ 源清单 server 全局 ∥ 有界首页（`n` 1–1000 + `truncated`）∥ 浏览窗过滤纯前端 ∥ 「一键拉取」（列为不做项）。

### 受影响文件（产品码；行数 = 设计估；既有件读数 = 2026-10-11 现读）

| # | 文件 | 现状 | 本批 |
|---|---|---|---|
| 1 | `thincoder-server/src/sandbox/image-sources.mjs` | 拟新增 | ≈170 |
| 2 | `thincoder-server/src/sandbox/registry-client.mjs` | 拟新增 | ≈230 |
| 3 | `thincoder-server/src/sandbox/image-source-routes.mjs` | 拟新增 | ≈170 |
| 4 | `thincoder-server/src/store/db.mjs` | 458 | ⇒ ≈490（v15 段 +≈32） |
| 5 | `thincoder-server/bin/thincoder-server.mjs` | 189 | ⇒ ≈191（import + 注册行） |
| 6 | `thincoder-server/public/views-sandbox-image-sources.mjs` | 拟新增 | ≈230 |
| 7 | `thincoder-server/public/views-sandbox-images.mjs` | 118 | ⇒ ≈138（过滤输入） |
| 8 | `thincoder-server/public/views-sandbox.mjs` | 372 | ⇒ ≈380（挂载） |
| 9 | `thincoder-server/public/i18n-{zh,en}-sandbox.mjs` | 147 ∥ 147 | ⇒ ≈177/表（+≈30 键） |
| 10 | `thincoder-server/public/style.css` | 261 | ⇒ ≈265（零新变量） |
| 11 | 随正件 = 批内件两件 + `thincoder-server/package.json`（`prepublishOnly` **47 ⇒ 49**）+ 档目断言件 + i18n 键集件 | —— | 清单 = `docs/server/design/PROJECT.md` §6 本批行 |

服务端合计 ≈+604 ∥ webui 合计 ≈+272（逐项 = 上表 ∥ `docs/server/design/webui/WEBUI.md` §5 小计链）。

### 验收判据（逐条回指需求条目——机检面）

| 需求条目 | 判据 | 明细（单源） |
|---|---|---|
| ① CRUD + 预选 | 源清单四端点逐值（形校验 ∥ 名/址唯一 ∥ 400/404）+ 每动作一审计行 + 预选端点回六条 | `docs/server/design/sandbox/SANDBOX.md` §12 N57 ∥ B54 ∥ E43/E45 ∥ `docs/server/design/gateway/API.md` §2.5 镜像源五行 |
| ② 源目录 | v2 两读逐值（含 `Link` 截断）+ Hub 两读（裸名补 `library/`）+ 匿名 Bearer 逐跳 + 四态如实（超时/不可达/认证/不支持） | 同档 §12 N58/N59 ∥ B52/B53/B55 ∥ E44 |
| ③ 过滤 | 三处过滤生效（本地镜像表 ∥ 仓库列表 ∥ 标签列表）+ 无匹配空态句；零新端点 | `docs/server/design/webui/WEBUI.md` §6 镜像源族行 ∥ 同档 §3「控制台面」句 |
| 边界（拉取零改） | 拉取链路零触（`image-routes.mjs` ±0 ∥ `docker.mjs` ±0 ∥ 无前缀注入 ∥ 无默认源） | `docs/server/design/sandbox/SANDBOX.md` §3 首句 ∥ KD-SV-96 |
| 存储 | v15 段判据（空库直落 15 ∥ v14 升后 15 ∥ 幂等 ∥ 五列 ∥ 两 UNIQUE 拒重 ∥ 存量表零变） | `docs/server/design/store/STORE.md` §3 v15 行 |
| 审计 | 三 kind detail 键集逐值 + 型面计数零增（**十三型**） | `docs/server/design/accounts/ACCOUNTS.md` §2.1 `sandbox_event` 行 |
| 收口 | 浏览器实走（增/改/删源 + 源目录读取（自建 registry ∥ 公网源按可达性如实）+ 三处过滤）+ 批内件两件 | `docs/server/design/sandbox/SANDBOX.md` §11 本批行 |

### 闸面读数（设计轮——`node scripts/doc-check.mjs`）

- 行宽（≤300）：**0 条**（本批新写 11 行先超、已折行收净）。
- 锚点悬空：**25 条**——全在 `docs/core`（2）∥ `docs/desktop`（22）∥ `docs/render-core`（1）三域，**本批未触三域 ⇒ 非本批引入**；闸态 FAIL 由该 25 条构成（提请主代理裁）。
- 用例号悬空 0 ∥ 符号·窄悬空 0 ∥ 声明源缺位 0。
- **产品码零触（设计轮）。**

### 发现（列报——不静默修复项）

1. 需求档档目链需 +1：`docs/server/requirements/PROJECT.md` AC-12/AC-14 行「36 ∥ 37」⇒ 本批后应为「**37 ∥ 38**」∥ 余面批「39 ∥ 40」（**需求档笔属主代理**——本批未改）。
2. i18n 拆分**已执行**（盘上 `i18n-{zh,en}-sandbox.mjs` 各 147 行）而设计档原记「执行 = 实施轮」⇒ 本批读数收正（admin 174 ∥ 178）。
3. 读数差（设计估 vs 本批现读）：`db.mjs` ≈450 ⇒ **458** ∥ `views-sandbox.mjs` ≈355 ⇒ **372** ∥ `views-sandbox-images.mjs` ≈140 ⇒ **118**——逐项已在档行收正。

### 设计评审轮 1 修正（fix 轮——十号逐条落位；2026-10-11）

承批档 §3 轮次 1（🔴 0 ∥ 🟡 4 ∥ 🔵 6——父侧十号全裁修正；执行者 = eng-designer）。落位（修复轮后盘面坐标）：

| 号 | 落位（file:line） | 内容 |
|---|---|---|
| 1 | `sandbox/SANDBOX.md:343` ∥ `:362` | §13 routes 行批次名写实（sandbox-docker-admin 批 +3；本批 ±0）；与 §13 小计同口径 |
| 2 | `gateway/API.md:389` | 变更记录补本批条（§2.5 前括注 + 镜像源七行；同源随动 = SANDBOX/STORE/ACCOUNTS/WEBUI/design PROJECT——设计轮补记） |
| 3 | `webui/WEBUI.md:136`–`:137` | §2.2 补键族登记条（sandbox-image-sources 批——+≈30 键/表；零退役；表体量随文） |
| 4 | `sandbox/SANDBOX.md:334`（B56） ∥ `:276`（§11 行） | 补 B56（`bad_response`——远端 200 非 JSON/形不符）+ §11 判据句五分类对齐；用例链 B52–B56 随拍（`webui/WEBUI.md:674` ∥ `design/PROJECT.md:516`） |
| 5 | `webui/WEBUI.md:640` ∥ `design/PROJECT.md:475` ∥ §2 表下小计行 | 小计收正：webui **≈+322**（复算 = 分项和：230 + 20 + 8 + 30×2 + 4）——三处同拍 |
| 6 | `sandbox/SANDBOX.md:370`–`:371` ∥ §2 表 #11 行 | 批内件两件估 ≈420 ∥ ≈280（沿上批之例） |
| 7 | `sandbox/SANDBOX.md:357` | §13 audit 行 delta 清单值（**±0**——本批）+ 陈值来源注（托管接入批） |
| 8 | `sandbox/SANDBOX.md:145` | 「detail 键集 = §2.1」⇒ 全限定（`accounts/ACCOUNTS.md` §2.1） |
| 9 | `sandbox/SANDBOX.md:407` | §15 已否候选归位（默认源语义 ∥ 分页/排序——不排期，非待办） |
| 10 | `sandbox/SANDBOX.md:356` | §13 db 行补余量注（≈10——实施后复读；越 500 ⇒ 同轮补拆分预案） |

**记录收正三笔（本块取代 §2「受影响文件」表 #11 行 ∥ 该表下小计行 ∥「验收判据」表 ② 行对应表述）**：① webui 合计 **≈+322**（复算 = 分项和；三处同拍 = `webui/WEBUI.md` §5 ∥ `design/PROJECT.md` §6 ∥ 本段）；② 批内件两件估 **≈420 ∥ ≈280**（沿上批之例；`prepublishOnly` 47 ⇒ 49 不变）；③「验收判据」表 ② 行「四态如实（超时/不可达/认证/不支持）」⇒ **五分类**（+ `bad_response`——#4 同拍）。

四档变更记录各一笔（`sandbox/SANDBOX.md:435` ∥ `gateway/API.md:389` ∥ `webui/WEBUI.md:821` ∥ `design/PROJECT.md:677`）。**产品码零触（fix 轮）**。机检（doc-check 单跑）：行宽 OK（区带豁免在效——变更记录）∥ 锚悬空 25（全在 core/desktop/render-core 三域——本批未触，与设计轮基线同数；用例号悬空 0）。

## §3 设计评审（评审子代理）

### 轮次 1（评审子代理）

设计评审（sandbox-image-sources 批 · 射程 = SANDBOX.md §3 镜像源族块（本批）+ 随动五档 + 需求档 §2:38/AC-38）——发现表：

| # | 类别 | 级别 | 发现 | 建议 |
|---|------|------|------|------|
| 1 | 受影响文件标注 | 🟡 | SANDBOX.md §13 routes.mjs 行标「本批 +3 已入盘」（`sandbox/SANDBOX.md:342` ∥ `:361`），但本批小计（`:359`）与本批总账（`design/PROJECT.md:474`）均不含 routes.mjs——「本批」实指上一批（sandbox-docker-admin，其小计内含「routes ±≈3」），本批读者会误判 routes.mjs 需 +3 行 | 该行批次名写实（如「sandbox-docker-admin 批 +3 已入盘」）+ 补本批口径（±0）；行 ∥ 小计取同口径 |
| 2 | 方法论合规（随动） | 🟡 | 本批改了 `gateway/API.md` §2.5（`:119` 前括注 + `:139`–`:145` 七行），但本档变更记录无本批条目——末条 = admin-agent-chat 批（`gateway/API.md:388`）；前批 sandbox-docker-admin 有对应条目（`:387`） | 补一条 2026-10-11 变更记录（增镜像源七行 + 前括注 + 同源随动清单） |
| 3 | 文档归属（随动） | 🟡 | `webui/WEBUI.md` §2.2 键族登记链止于上一批（`:135` = sandbox-docker-admin 批），本批 +≈30 键/表无登记条；本批 changelog（`webui/WEBUI.md:818`）只列 §2.8/§5/§6；键量仅见 §5 行（`:630` ∥ `:636`）与 §6 行（`:672`） | 在 §2.2 补「键族登记（sandbox-image-sources 批——两表逐键同步）」条（镜像源卡/增改删弹窗/目录浏览窗/五分类读绪；sandbox 两部件 +≈30/表） |
| 4 | 验收判据 | 🟡 | 五分类错误有一类无用例：`bad_response`（`sandbox/SANDBOX.md:158` 列五 kind）在 §12 无专测——E44（`:335`）只断 `unreachable`/`timeout`/`auth_required`、B55（`:333`）断 `unsupported`；判据行亦只写「不可达/认证失败/不支持三态」（`:276`） | 补一条用例（远端 200 非 JSON/形不符 ⇒ `{ ok: false, error: { kind: "bad_response" } }`），或把声明收窄到有用例者 |
| 5 | 数值漂移 | 🔵 | webui 小计 ≈+272 与分项和不符：230（新档）+20+8+30×2+4 = 322（`webui/WEBUI.md:638` ∥ `design/PROJECT.md:475`——两处同值，故非跨档矛盾，是同一算式的错值） | 复算取齐（272 或 322 之一） |
| 6 | 受影响文件标注 | 🔵 | 本批两件批内件（`docs/batches/2026-10-11-sandbox-image-sources.test.mjs` ∥ `…-ui.test.mjs`）在射程档内无行数估：§13 批内件条目止于上一批（`sandbox/SANDBOX.md:366`–`:367` 估 ≈420/≈280），总账仅具名（`design/PROJECT.md:476`）；若估落批档 §2（§13 `:362` 声明「批内件预算 = 批档 §2」——该档不在本评审射程，未核） | 在 §13/总账补两件估（沿上批 ≈420/≈280 之例）或补指针句 |
| 7 | 文档卫生 | 🔵 | `sandbox/SANDBOX.md:356`（audit.mjs 行）delta 栏自相抵：`≈+3（托管接入：±0——五 kind 走 sandbox_event，非枚举）`；本批口径应为 ±0（`design/PROJECT.md:474`：`audit.mjs` ∥ `errors.mjs` ∥ `image-routes.mjs` ±0） | 该栏清成单值（±0）并注明陈值来源 |
| 8 | 清晰度（指涉） | 🔵 | `sandbox/SANDBOX.md:145` 写「detail 键集 = §2.1」——无档名限定（本档无 §2.1 节）；同族处均带档名（`:38` ∥ `:127` 用 `accounts/ACCOUNTS.md` §2.1） | 改成全限定指涉 |
| 9 | 需求覆盖（口径） | 🔵 | 需求把「默认源」形态委于设计轮（`requirements/PROJECT.md:207`）；设计裁定「无默认源」（`sandbox/SANDBOX.md:140` ∥ `:395` KD-SV-96 被否栏），但 §15 仍以「余项（本批不做）」同列（`:402`；分页/排序亦然——`:156` 已给「不翻页」裁定）——同一项两种处置口径（已否 ∥ 顺延） | 统一标记（如「已否候选——不排期」），免被读作待办 |
| 10 | 受影响文件标注（余量） | 🔵 | `db.mjs` 458 ⇒ ≈490（`sandbox/SANDBOX.md:355` ∥ `store/STORE.md:434`）——500 软线内但余量 ≈10 行；本批未附拆分预案（规则：>500 才须） | 实施轮复读；若落 ≥500 行，同轮补拆分预案 |

射程外注（不判级）：需求 §5:319 写「**已落：排空**（runner-admin-console 批）」与 `sandbox/SANDBOX.md:411` 余项表「节点禁用/排空」相抵——建议对账（不在本评审目标 = 需求档 §2:38/AC-38）。

核实通过项（不列级）：七端点计数四处同口径（SANDBOX `:140`/`:142`/`:276` ∥ API §2.5 `:119`/`:139`–`:145` ∥ design/PROJECT `:516`）；v15 DDL/两唯一约束（STORE `:390`–`:398`）∥ 三 kind（ACCOUNTS `:67`）∥ 型面十三型零增；预选六条两档逐值同（SANDBOX `:148`–`:149` ∥ API `:140`）；AC-38 三面逐条有设计落点；档目链 36 ∥ 37 ⇒ 37 ∥ 38 三档同链；文件体量全在 500 软线内（无越档）。

计数：🔴 0 ∥ 🟡 4 ∥ 🔵 6（合计 10）

VERDICT: pass

## §4 用户批准（主 agent）

### 用户批准（父侧代签——用户 2026-10-11 09:20「开始吧，自动跑。」授权）

- **代签依据（三条件齐备）**：① 设计评审 **pass**（#201 · 🔴 0 ∥ 🟡 4 ∥ 🔵 6——发现表/VERDICT = §3 轮次 1）✓；② 修正轮 #202 十号全落 + **父侧逐号核验**（读回修复后盘面 = SANDBOX `:334`/`:343`/`:356`/`:357`/`:362`/`:370`–`:371`/`:407` ∥ API `:389` ∥ WEBUI `:136`–`:137`/`:640` ∥ design/PROJECT `:475`/`:516`）✓；③ 凭据已签发（值不落档）✓。
- **父侧直执行小修一笔（可 revert）**：SANDBOX.md §15「源写入节点 dockerd 配置 ∥ 按节点源清单」两条自「余项」移入「已否候选——不排期」组（= #202 报告观察项之裁决——同 KD-SV-96 被否栏；零新语义、列表级）。
- **实施派发** = eng-coder（全量文件表 = 批档 §2；随正件（档目断言件 ∥ i18n 键集件 ∥ 门禁件数断言件七件 47 ⇒ 49 ∥ `package.json` `prepublishOnly` 47 ⇒ 49）= 父侧实施轮同拍落）。

## §5 实施记录（eng-coder）
**状态行**：实施完成（（13 件落盘：11 产品件 + 两批内件——两件实跑 13/13 ∥ 6/6 pass · 闸面零新增红 · 差异审计 1 轮零偏离 · 代码评审 1 轮（1🔴 父侧裁定归随正件 ∥ 1🟡 ∥ 3🔵）· 域内修复轮 1（址含凭据明拒）· 随正件五组实读清单见 5.4，交父侧同拍落））



### 5.0 交付面（本段 = 实施舱自写——不靠父侧转述）

**13 件落盘（11 产品件 + 2 批内件）；`src/sandbox/routes.mjs` ±0 ∥ `docker.mjs`/`image-routes.mjs` 零触 ∥ 设计档零触。**

| # | 件 | 动作 | 实读行数（设计估） | 内容一句话 |
|---|---|---|---|---|
| 1 | `thincoder-server/src/sandbox/image-sources.mjs` | 新 | 132（≈170） | 形校验（名 trim ≤40 ∥ 址 `[http(s)://]主机[:端口]` 归一——路径/查询/空白/凭据拒）∥ `kind` 按址派生（Hub 四别名，不入库）∥ 预选六条静态表 ∥ 列/取/增/改/删五函数（唯一冲突 ⇒ 人话） |
| 2 | `thincoder-server/src/sandbox/registry-client.mjs` | 新 | 225（≈230） | v2 两读（`_catalog` ∥ `tags/list`）∥ Hub 标签读（`page_size=min(n,100)`、裸名补 `library/`）∥ 匿名 Bearer 挑战（realm/service/scope ∥ token 键 `token\|access_token` ∥ 复读一次）∥ 有界首页（`n` 1–1000 缺省 200 + `truncated`）∥ 五分类 `RegistryError` |
| 3 | `thincoder-server/src/sandbox/image-source-routes.mjs` | 新 | 150（≈170） | 七端点注册（列/预选/增/改/删/目录/标签）∥ 读类自含状态形（成/败皆 200 + `ms`）∥ 三 kind 审计（add/update/delete——detail 键集逐值）∥ 形拒 400 零外呼 |
| 4 | `thincoder-server/src/store/db.mjs` | 改 | 476（458 ⇒ ≈490） | v15 增段（`image_sources` 建表——五列 + 两 UNIQUE + 注，与 `store/STORE.md` §2 v15 段逐字）+ 迁移行 `{ v: 15 }` |
| 5 | `thincoder-server/bin/thincoder-server.mjs` | 改 | 191（189 ⇒ ≈191） | import + `registerImageSourceRoutes(routes, { db })` 注册行（恰 +2；`routes.mjs` 零触——设计 `routes.mjs` ±0） |
| 6 | `thincoder-server/public/views-sandbox-image-sources.mjs` | 新 | 275（≈230） | 源卡（源表四列 + 面型文案派生 + 目录/改/删三钮 + 添加源钮）∥ 增/改弹窗（预选回填可再改）∥ 删除确认（后果句，非原生 confirm）∥ 目录浏览窗（v2 仓库⇒点行取标签 ∥ Hub 单输入按名查标签、目录 `unsupported` 人话呈 ∥ 两处过滤 + truncated 提示 + 空态/无匹配 ∥ 五分类读绪窗内就地呈不关窗） |
| 7 | `thincoder-server/public/views-sandbox-images.mjs` | 改 | 132（118 ⇒ ≈138） | 本地镜像表过滤（表上方关键词输入；tags 匹配；无匹配 ⇒ 空态句；零新端点） |
| 8 | `thincoder-server/public/views-sandbox.mjs` | 改 | 375（372 ⇒ ≈380） | 源卡挂载（import + `createImageSourceSection` + `mount.append(sources.card)`——全局面新卡） |
| 9 | `thincoder-server/public/i18n-zh-sandbox.mjs` | 改 | 183（147 ⇒ ≈177） | 键族 +34 键（沙盒面 169 键；源卡/弹窗/浏览窗/五分类/过滤） |
| 10 | `thincoder-server/public/i18n-en-sandbox.mjs` | 改 | 183（147 ⇒ ≈177） | 同键逐键对位（两表各 169 键、集相等；en 零 CJK） |
| 11 | `thincoder-server/public/style.css` | 改 | 266（261 ⇒ ≈265） | +2 规则 3 行（`.filter-row` ∥ `.filter-row input` ∥ `.browse-grid`）+ 段注；零新 `:root` 变量（38 不变）∥ 零新悬停（7 不变） |
| 12 | `docs/batches/2026-10-11-sandbox-image-sources.test.mjs` | 新 | 682（≈420） | 服务面 13 腿：N57–N59 ∥ B52–B56 ∥ E43–E45 ∥ v15 迁移六判据 ∥ 纯函数面（假 registry/Hub = 真 HTTP；Bearer 逐跳在案） |
| 13 | `docs/batches/2026-10-11-sandbox-image-sources-ui.test.mjs` | 新 | 514（≈280） | 前端面 6 腿：源卡 + 增/改弹窗 ∥ 删除确认 ∥ 目录浏览窗（v2 ∥ Hub）∥ 五分类读绪 ∥ 镜像表过滤 + i18n 34 键 ∥ 静态面（档目 38 ∥ 37 ∥ 行数/行宽 ∥ 零外链/零 CJK ∥ `t` 字面量闭合 ∥ 类名闭合 ∥ canon 38/7 ∥ 门禁链） |

### 5.1 验收读数（逐行对批档 §2「验收判据」表）

| 判据 | 读数 | 证据 |
|---|---|---|
| ① CRUD + 预选：（形校验 ∥ 名/址唯一 ∥ 400/404）+ 每动作一审计行 + 预选六条 | ✅ | 批内件 N57（行逐值/kind 派生/三 audit detail 键集逐值/预选六条两字段）+ B54（`n` 越界/非数 ∥ `name` 形非法 ⇒ 400 零外呼）+ E43（空名/超 40/撞名/撞址/路径/空白/凭据 ⇒ 400 库零变）+ E45（user 403 ∥ 匿名 401 ∥ 不存在 id 404） |
| ② 源目录：v2 两读逐值 + Link 截断 + Hub 两读（裸名补 `library/`）+ 匿名 Bearer 逐跳 + 五分类如实 | ✅ | N58 ∥ N59 ∥ B52（挑战⇒token⇒Bearer 复读逐跳 + scope 逐值 + 零 Basic）∥ B53（空目录 = 成 + 空表）∥ B55（405 ⇒ unsupported）∥ B56（200 非 JSON/形不符 ⇒ bad_response）∥ E44（不可达/超时/挑战不可解析/token 401/复读仍 401 ⇒ 三分类） |
| ③ 过滤：三处（本地镜像表 ∥ 仓库列表 ∥ 标签列表）+ 无匹配空态 + 零新端点 | ✅ | UI ④（名/标签匹配、无匹配句、`calls` 计数不变 ⇒ 纯前端）∥ UI ③（两列过滤 + 无匹配句、目录读仍一次）——**未做新端点**（七端点计数不变） |
| 边界（拉取零改） | ✅ | `bin` 仅 +2（import + 注册）；`image-routes.mjs`/`docker.mjs`/`registry.mjs` mtime 早于本批写窗；全 `src/` 对 `image_source*` 的引用仅三新件 + `db.mjs`（分歧审计实核） |
| 存储 v15 六判据 | ✅ | 批内件「v15 迁移」腿：空库直落 15 ∥ v14 升后 15 ∥ 幂等再开零变 ∥ 五列逐值 ∥ 两 UNIQUE 拒重 ∥ 存量表零变（增量恰 `image_sources` 一表） |
| 审计三 kind + 十三型零增 | ✅ | detail 键集逐值（add/update = kind+sourceId+name+address ∥ delete = kind+sourceId+name）；无审计 CHECK 重建（型面十三型不变） |
| 收口面（批内件两件） | ⏳ | 两件实跑全绿（服务面 13/13 ∥ UI 6/6）；**浏览器实走 = 收口轮（父侧）**；链内历史件随正件 = 父侧同拍落（见 5.4） |

**闸面读数（`node scripts/doc-check.mjs`——自 `thincoder/` 仓根）**：行宽 **OK**（源域全 `.md` 无 >300 单行）∥ 锚悬空 **25 条**（与本批基线同数——全在 `docs/core` ∥ `docs/desktop` ∥ `docs/render-core` 三域，本批未触）；**本批未写/未改任何 `.md` ⇒ 零新增红**。

### 5.2 决策透明表（实施舱内自决——逐条给依据）

| 号 | 决策点 | 选定 | 依据 | 备选 |
|---|---|---|---|---|
| 1 | 址归一裁量 | 尾 `/` **接受并归一去** ∥ 缺省端口归并（`:443` ⇒ 去）∥ 主机名小写 | 归一 = 单源 `address`（零漂移）；`URL` 标准归一化；形拒仍按 §3（路径/查询/空白） | 原样保址（留形状分歧 ⇒ 同源两形） |
| 2 | 址含凭据 | **明拒 ⇒ 400**（`url.username/password` 非空即拒，人话含"零凭据面"） | 形 = `[http(s)://]主机[:端口]`；本批零凭据面 ⇒ 静默丢弃会读作"已登记凭据"（advisor 🔵4 采纳） | 静默丢弃 userinfo（原实现，已改） |
| 3 | 预选第六名 | 「Docker Hub 镜像（DaoCloud）」⇒ `https://docker.m.daocloud.io` | 用户 09:19 口径 + §3 :148–149 两档逐值同 | 换址（超用户口径） |
| 4 | Hub 标签取值 | `results[].name` | Hub API 实测形；`next` 判 `truncated` | 取 `full_size`/`digest` 面（超设计） |
| 5 | token 端点边界 | 200 无 `token`/`access_token` ⇒ `auth_required`；文本 5 无凭据面 | 分族如实（私有源 ⇒ 需凭据）；不落 `bad_response`（形对、语义为认证） | 归 `bad_response`（会误导成"远端形不符"） |
| 6 | 非 2xx 分类 | 401/403 ⇒ `auth_required`；405/501 ⇒ `unsupported`；余 ⇒ `bad_response` | §3 五分类语义（实测 DaoCloud 目录 = 405 ⇒ B55 腿形） | 全归 `bad_response` |
| 7 | 审计 `target` 列 | 源名（add/update/删前名） | 先例同形（`image-routes.mjs` ∥ `container-routes.mjs` 皆 target = 对象名） | target = id 字串（与先例异形） |
| 8 | 读类预算口径 | **逐调用** 10s（挑战链最多 3 跳） | 节点面先例（`docker.mjs` 逐调用超时）；`readTimeoutMs` 注册参数可覆盖（批内件注 500ms） | 端到端共享 10s（改设计口径——未擅动） |
| 9 | 镜像表过滤面 | 只匹配 `tags`（无标签行不中） | tags = 表内唯一可见标识（`名:标签` 串）；id（sha256）界面不显示 ⇒ 匹配它 = 不可见的命中 | 并入 `image.id`（无可见价值） |
| 10 | 批内件不拆 | 两件到底（682 ∥ 514——超 500 建议线） | 设计件表 = **两件入链**（拆 ⇒ 链条目 49 ⇒ 51，改父侧计划）；先例 = 历史件 716 行 | 拆四件（动链计划，越设计） |

### 5.3 审计与代码评审（轮次 + 终态）

- **差异审计（explore · 1 轮 · 只读）**：四类偏离（部分实现 ∥ 静默简化 ∥ 与设计逐字偏离 ∥ 越出批准文件表）**逐类零命中**；§12 全 11 用例号（N57–N59 ∥ B52–B56 ∥ E43–E45）逐号有腿；`routes.mjs` ±0 实核（零引用 + mtime 早于写窗）；DDL 与 STORE §2 v15 段逐字一致；三 kind 键集逐值。审计另报读数差：`views-sandbox-image-sources.mjs` 275（估 ≈230）、`bin` 191（估 ≈191 ✓）、i18n 键实增 **34**（"≈+30"口径）。
- **代码评审（advisor · 1 轮 · sync）**：发现 = **1 🔴 + 1 🟡 + 3 🔵**。
  - 🔴 = 「v15 入链后，门禁链内 11 件历史批内件仍断言结构版本 14 ⇒ `prepublishOnly` 必红；且"v15 读点"未登记随正件」——**域外**（跨批档件 + `package.json`）；已上抛，**父侧裁定 ①**：五组随正件（含 v15 读点 11 件 + `-server-gateway` 标题句）由父侧同拍落 ⇒ 本 11 件归 §5.4 随正件（实现者零动，如实披露）。
  - 🟡 = 批内件两件越 500 建议线（越 800 才硬红）——处置见 5.2 #10（不拆 + 披露）。
  - 🔵 = ① 读类 10s 为逐调用口径（挑战链最坏 ≈30s）⇒ 处置见 5.2 #8（保逐调用，读数在此明写）；② 址含凭据静默丢弃 ⇒ **域内修复轮 1 采纳**（明拒 400 + 用例）；③ 镜像表过滤只中 tags ⇒ 处置见 5.2 #9（保现状 + 披露）。
- **域内修复轮 = 1**（🔵②）：`image-sources.mjs` 加 userinfo 明拒（+1 行 + 头注同句）+ 批内件加 3 断言（E43 一行为例 ∥ 纯函数面两例）∥ 尾斜杠归一正例同拍；修后两件重跑仍全绿（13/13 ∥ 6/6）。
- **终态**：`clean`（域内零必修、零未披露偏离；🔴 已由父侧裁定归随正件，不属于实施舱未决项）。

### 5.4 随正件（父侧实施轮同拍落——实读清单，行号 = 本批现读）

1. **档目计数** `[37, 36] ⇒ [38, 37]`（11 件）：`console-completeness-2:436` ∥ `console-list-style:206` ∥ `console-modals:406` ∥ `console-provider-redo-runtime:294` ∥ `models-config:218` ∥ `me-keys-redo-ui:391` ∥ `provider-model-metadata:482` ∥ `quota-v2-member-models:730` ∥ `runner-admin-console-ui:483` ∥ `admin-agent-chat-ui:518` ∥ `sandbox-docker-admin-ui:373`。
2. **档目全名名单 +1 档**（8 件）：`console-providers:426` ∥ `server-gateway-webui-deploy:274` ∥ `server-i18n:125`（`JS_FILES`）∥ `console-completeness-2:439` ∥ `console-list-style:209` ∥ `console-modals:409` ∥ `console-provider-redo-runtime:297` ∥ `models-config:221`——逐名名单插 `views-sandbox-image-sources.mjs`。
3. **i18n 键数** `555/560 ⇒ 589/594`（4 件）：`server-public-structure:67` ∥ `runner-admin-console-ui:475` ∥ `server-small-fixes:74` ∥ `admin-agent-chat-ui:489`。
4. **门禁链 47 ⇒ 49**（7 件 + `package.json`）：`console-list-style:238` ∥ `server-auto-update:480` ∥ `console-layout:449` ∥ `me-usage-charts:262` ∥ `provider-model-metadata:491` ∥ `quota-per-model:444` ∥ `quota-v2-member-models:428`。
5. **v15 读点**（11 件——14 ⇒ 15 + `-server-gateway` 标题句/`user_version=14` 字样）：`server-gateway:164/167/168` ∥ `admin-agent-chat:636/637` ∥ `console-completeness-2:152` ∥ `me-keys-redo:120/144` ∥ `provider-model-metadata:151/168` ∥ `quota-per-model:150/180` ∥ `quota-v2-member-models:167/184` ∥ `server-console-config:383/406` ∥ `server-gemini-openai-preset:263/279` ∥ `server-model-alias:408` ∥ `team-login-client-access:284/291`。

### 5.5 披露（越界/裁量——逐条给因）

- **越文件表**：零（13 件 = 批档 §2 表 11 项 + 两批内件；`routes.mjs` 未动——设计要求 ±0）。
- **读数超设计估**：`views-sandbox-image-sources.mjs` 275（≈230，+45——含五分类文案表 + 两列过滤块）；批内件 682 ∥ 514（≈420 ∥ ≈280——假 registry/Hub 真 HTTP + 全用例号腿）；`style.css` 266（≈265）；i18n 两表 183 ∥ 183（≈177；键 +34 vs "≈+30"——五分类文案 5 键 + 空闲句 1 键为设计句必要面）。产品码全在 500 软线内（`db.mjs` 476——余 24，免拆分预案）。
- **新增键 34**（非 30）：`sourcesTitle`…`imagesNoMatch`——两表逐键对位（集相等、占位符对位、en 零 CJK），批内件 UI ④ 直测。
- **读类预算口径**：逐调用 10s（见 5.2 #8/#5.3）——设计句"读类预算 10s"未指逐调用/端到端；本实现沿节点面先例取逐调用，读数在此明写，供设计/评审收正。
- **零新增红**：本批未写/未改任何 `.md`；doc-check 25 悬空 = 基线同数。

## §6 验证与收口（父代理）

### 6.1 收口核验读数（父侧实跑 · 2026-10-11 11:0x）

- **全链门禁**（父侧收口轮实跑）：`npm run prepublishOnly` ⇒ **tests 456 ∥ pass 456 ∥ fail 0 ∥ duration 30.4s**（链内 49 件）——本批终码（`9398153a`）实跑。
- **文档闸**：`node scripts/doc-check.mjs` ⇒ 行宽 **OK** ∥ 闸态悬空 **25**——逐条核 = 全在 core/desktop/render-core 域（17 条 = 桌面 `views/chat.mjs` 族），`docs/server/**` 闸态悬空 **0**；非本批面，已挂台账 **#1273**。
- **浏览器实走**（父侧亲走 · 环境 = 本地独立临时库 `.thincoder/tmp/walk-config.json` + 独立 db + 端口 8788——零碰用户本地库；服与浏览器走毕即关）：
  - 源卡在册（空态句 ∥ 添加源钮）✓；预选「阿里云 ACR」⇒ 名/址两字段精确回填 ✓；
  - 提交 ⇒ flash「镜像源已添加：阿里云 ACR」+ 行在册 ∥ 面型列派生「标准 v2」✓；
  - 目录读（ACR · 真实远端）⇒ 401 挑战 → 匿名换 token → 复读 401 ⇒ 五分类 `auth_required` 就地如实呈（含读址明细）✓；
  - Hub 源（面型「Hub 面」）目录读 ⇒ `unsupported`（官方关闭指引句）✓；按名查标签 `nginx` ⇒ `timeout`（本机不可达 hub —— 10s 实超）含读址 ∥ `page_size=100` 边界可见 ✓；
  - 删除 ⇒ 后果句确认（「只删清单行，不动镜像」）⇒ 「镜像源已删除」+ 行删 ✓。
  - 未走腿（如实）：本地镜像表过滤输入（需注册节点方现该表——UI 单元腿 6/6 已覆盖）；英文面逐句（English 钮在场，未逐句）。
  - 截图两帧：`shot-2026-10-11T02-15-43-357Z-18396.png`（卡片 ∥ 空态）∥ `shot-2026-10-11T02-16-58-323Z-18396.png`（Hub 目录窗 = unsupported ∥ timeout 双态）。

### 6.2 交付面与提交链

- 提交链：`8f929dc3`（设计 + 需求链）⇒ `e5e3489b`（评审修正 + §4 代签）⇒ `b79128e8`（随正 30 件）⇒ `9398153a`（feat 16 件）⇒ 本收口笔（§6）——**双推**（origin ∥ github）。
- 交付 = 13 件（产品 11 + 批内件 2，清单见 §5.0）+ 随正 30 件（§5.4 五组）——越文件表零。

### 6.3 角色表（段 ↔ 作者 ↔ 终态）

| 段 | 作者 | 终态 |
|---|---|---|
| §1 讨论/授权 | 主 agent | 已收口（本笔） |
| §2 设计与任务 | eng-designer（#200 ∥ 修正 #202） | 设计完成 |
| §3 评审 | 评审子代理（#201 · 轮 1） | 评审完成 · pass · 🔴 0 |
| §4 批准 | 主 agent（用户 09:20「开始吧，自动跑。」授权代签） | 已批准 |
| §5 实施 | eng-coder #203 | 实施完成（域内修复 1 轮） |
| §6 收口 | 主 agent | 本笔 |

### 6.4 偏差与裁量（汇总；细则见 §5.2 ∥ §5.5）

- 读数超设计估三处（275 ∥ 682 ∥ 514 行；键 +34 vs ≈+30）——设计估为约数，不阻塞，§5.5 已逐条明载。
- 读类预算口径 = **逐调用 10s**——设计句未指逐调用/端到端 ⇒ 父侧单句收正两处（`SANDBOX.md:151` ∥ `API.md:120`；父侧直改 · 可 revert）。
- 批内件两件越 500 建议线（682 ∥ 514）——裁定**不拆**（先例 716 行在册；拆则门禁链计划 49 ⇒ 51，代价 > 收益）。
- 实施 🔴（v15 门禁链 11 件历史断言必红）——父侧裁定 ① 归随正件，已落五组（§5.4）。

### 6.5 结算核对（逐项）

- 台账：**#1274**（本批唯一行）在途 ⇒ 待核销 ⇒ **已核销**（evidence = 提交链 + 门禁读数 + 本档 §6）。
- 状态行：§1 ⇒ 已收口（本笔）∥ §2 设计完成 ∥ §3 评审完成 ∥ §5 实施完成 ∥ 记录冻结。
- 计数对账：档目 37⇒38 ∥ i18n 键 555/560⇒589/594 ∥ 门禁链 47⇒49 ∥ 交付 13+30 件——§2 表 ∥ §5.4 ∥ 本案三处一致。
- 指针：`task_book` = 本档（台账在册）∥ 需求 = `docs/server/requirements/PROJECT.md` §2:38 + AC-38（在册）。
- **暂缓批复核：无**（本批无暂缓批）。
- 相邻项（列报 · 未处置）：需求 §5:319「已落：排空」与 `SANDBOX.md:411` 相抵——待用户裁。
- 相邻项（列报 · 未处置）：台账 #1228 前提（`docs/server` 存量红 悬空 2 + 行宽 1）本次读数 = 该面闸态零红 ⇒ 前提已消，追认核销随本笔。

### 6.6 残留与待用户一句话

- ① **一键拉取**（源行「拉取」动作）：用户未提、设计未含 ⇒ 本批不做（边界 = 源管理 ∥ 目录 ∥ 查找筛选三件）。如要 ⇒ 一句令另立小批。
- ② 源读取走代理：用户 09:17 已裁「走代理这个就算了」⇒ 不入册；现读 = 直连（活环境实证：ACR 直连通 ∥ Hub 直连超时如实呈）。
