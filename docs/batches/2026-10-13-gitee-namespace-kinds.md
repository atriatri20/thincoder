# 2026-10-13 · gitee-namespace-kinds
> 六段 append-only，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 编制：主 agent · 2026-10-13 · 来源 = 用户 2026-10-13 18:47 报障（gitee 企业源拉列表失败：「我在项目那里添加了一个gitee的git源，但是拉取不了项目列表，你检查一下，测试一下。」）+ 18:54 裁定（「用户知道自己是个人/组织/企业，你选择器分一下」——选择器显式分三态）；根因 = 箱上实测（组织端点 404 ∥ 企业端点可用但未接线）。
> 台账 = #1365（server · 归批）。前情 = 无（独立批——承台账 #1365 ∥ 设计档 `project/PROJECTS.md` §12 R69）。
## §1 讨论（主 agent）
**状态行**：已收口 2026-10-13
<§1 模板占位：本批条目 / 关键判据 / 授权口径>

**2026-10-13 · gitee 源范围三态（个人 ∥ 组织 ∥ 企业）**

- **来源**：用户 18:47 报障原话「我在项目那里添加了一个gitee的git源，但是拉取不了项目列表，你检查一下，测试一下。」+ 18:54 裁定原话「别这么麻烦，用户知道自己是个人/组织/企业，你选择器分一下。用户又不是傻子，用gitee你以为是农民吗？？」。台账 **#1365**。
- **根因（箱上实测——.5 容器内·真令牌复现；全程只读，令牌不出进程）**：
  - 源行实况 = `git_sources` id=2（name=shanghai-xinbo ∥ platform=gitee ∥ scope=shanghai-xinbo ∥ enabled=1 ∥ mode=poll ∥ token_state=unknown ∥ 无同步记录）；令牌有效（`GET /user` ⇒ 帐号 `eprom` ✓）。
  - 拉列表两击 = 10003ms（打满 10s 超时）∥ 5340ms——`listRepos` 对 scope 只走 `/orgs/{scope}/repos`；`shanghai-xinbo` 实为 **gitee 企业**：`/orgs/shanghai-xinbo(repos)` ⇒ **404「Group」** ∥ `/enterprises/shanghai-xinbo(repos)` ⇒ **200（70 仓）** ∥ `/enterprises/shanghai-xinbo/members` ⇒ **200（13 人、208ms）**。
  - 两侧行形：**企业仓行与现行 `repoRowOf` 兼容**（`full_name`/`html_url`/`ssh_url`/`private` 全在）；**企业成员行不兼容** = 嵌套 `user.login` + 顶层 `role`（现行解析器读顶层 ⇒ 会空）。
  - 超时余量：`/user/repos` 实测 4.8–5.4s（三连测一致）——10s 预算不足（用户首击即撞线）。
  - 设计缺口 = 在册 `project/PROJECTS.md` §12 **R69**（「gitee 企业成员端点未接……实施轮先实证 gitee 企业场景并回报；企业为常态 ⇒ 本行升提请裁定」）——本次实况 = 其裁定时刻：**升 = 修**（用户 18:54 裁定）。
- **范围（本批）**：① 源弹窗 gitee 显式选范围类型（个人 ∥ 组织 ∥ 企业——**禁自动探测回退**）；② 类型路由：组织 ⇒ `/orgs/{scope}/…` ∥ 企业 ⇒ `/enterprises/{scope}/…`（仓列表 + 成员表同源）；③ 企业成员行解析分支（嵌套形）；④ 源行存范围类型（新列/迁移 = 设计定）；⑤ gitee 读类超时放宽（10s ⇒ 20s）；⑥ 既有源零回归 + 旧行迁移口径。
- **验收**：见需求档 `requirements/PROJECT.md` **AC-44 ⑬**（企业源拉列表 70 仓 ∥ 成员同步 13 人 ∥ 组织/个人零回归 ∥ 超时 20s）；单元测试档 + 收口轮（.5 实走——用户源 id=2 修后可直接工作）。
- **边界**：其它平台零动（github/gitlab 语义不触）∥ 反向写回不做（沿 AC-44 ⑥）∥ 需求档回笔 = 已落（功能点 44 ⑫ + AC-44 ⑬ + 变更记录行）。
- **授权**：用户 18:47 报障 + 18:54 裁定 = 修复方向授权；流程 = 设计 → 用户点火评审 → 批准 → 实施 → .5 部署。

**18:57 用户追问「github 和 gitlab 是不是也有类似的个人/组织/企业的情况？」——父侧实核，本批边界不变（其它平台零动）：**

- **GitHub**：无「企业命名空间」——官方 OpenAPI 说明书（rest-api-description `api.github.com.json` 13.5MB 原档）实核 = `/enterprises/{enterprise}` 路由族在场但 `enterprises/{enterprise}/members` ∥ `enterprises/{enterprise}/repos` **均不在册**（企业 = 管理壳；仓/人挂组织/用户名下）；`orgs/{org}/members` 在册 ✓。现行 github 通路（个人不填 ⇒ affiliation 一次拉全 ∥ 组织 scope ⇒ `/orgs/{scope}/repos` + 名册两级）**已完备**。注意项 = 一企业多组织 ⇒ scope 一次填一组织（现状口径）。
- **GitLab**：「企业版」= 自管部署（已在「自建平台」类——`base_url`）或 SaaS 档位，**非命名空间**；命名空间 = 个人/组，组**可嵌套**（组/子组）——路由实测：`/groups/gitlab-org%2Fcharts` ⇒ 200 ∥ 未编码 `/groups/gitlab-org/charts/…` ⇒ 404 ∥ 编码 members/all ⇒ 401（路由在、需鉴权）；**现行代码已正确编码**（`platform-client.mjs:212` `encodeURIComponent(scope)`）——无缺口。存疑如实：自管 GitHub 企业版（GHES）说 GitHub 协议、不在「自建 = GitLab 兼容」列——设计已登记（非兼容 ⇒ 人话报错 + 手输保底）。
- **判定**：gitee 为唯一「企业」真命名空间平台 ⇒ 本批仅 gitee 分工（其余平台零动，边界不变）。

**2026-10-13 19:08 用户裁定（老源完成路径）**：原话「不要管迁移，我删了重建就完了。评审吧。」——① 用户老源（id=2）不依赖迁移完成路径（**删除重建**——新弹窗直选「企业」）；② 迁移段照设计保留（对升级库零猜测兜底——一 ALTER + 一 UPDATE；不改设计）；③ 「评审吧」= 设计评审点火（父侧已发）。

**2026-10-13 19:14 · 设计评审轮 1 收官 = pass（🔴 0 ∥ 🟡 3 ∥ 🔵 3——§3 落档在盘）；父侧逐条对账：六条全数受理**（① 最近先例行 ∥ ② 跨态清空/不携定形 ∥ ③ 用例坐标收口 ∥ ④ §9→§6 坐标与 :747 指针 ∥ ⑤ i18n 行数注 ∥ ⑥ 小计随正）——**fix 轮派发**（eng-designer，round=fix）；修毕父侧核读 → §4 批准门。

**2026-10-13 · 用户授权（自动跑）**：用户原话「自动跑」（20:09）⇒ 本批**收口核销与提交（双推）∥ 令牌终消费**——委托父侧自动执行，直至本批收口（设计/评审/批准/实施各步同日先行已完成）。**父侧自缚三条（本仓惯例·先例同形）**：① 代签（如有）仅当三条件齐备；② 新范围/口径裁决 ⇒ 停下、只摆那一条；③ 破坏性/不可逆 ⇒ 先停。用户随时可打断。收口轮实走读数 = 用户面。

## §2 批次任务与设计（eng-designer）
**状态行**：设计完成
<§2 模板占位：本批条目（覆盖） / 设计档落点 / 机制设计 / 受影响文件与测试覆盖 / 验收对照 / 关键决策 / 上抛项>

### 2.0 本批条目（覆盖 ∥ 不在本批）

**覆盖**（需求档 = `docs/server/requirements/PROJECT.md` 功能点 44 ⑫（`:269`）∥ AC-44 ⑬（`:367`）——已入册，父侧笔，本席只读核；批档 §1 · 台账 #1365；用户 2026-10-13 18:47 报障 + 18:54 裁定「用户知道自己是个人/组织/企业，你选择器分一下」）：

- **T1 = 三态显式选择器**（44 ⑫）：建源/编辑弹窗仅 gitee 显「个人 ∥ 组织 ∥ 企业」；个人 ⇒ 范围不显 ∥ 组织/企业 ⇒ 范围必填；**禁自动探测回退**。
- **T2 = 源行存范围类型**：新列 `scope_kind` + 迁移 v21 + 旧行迁移口径（覆盖 id=2 这类现存企业源）。
- **T3 = 类型路由两径**：组织 ⇒ `/orgs/{scope}/…` ∥ 企业 ⇒ `/enterprises/{scope}/…`（仓列表 + 成员表同源；企业仓行与现行 `repoRowOf` 兼容——实测）。
- **T4 = 企业成员行解析**：嵌套 `user.login` + 角色映射判据（实测 `role:"member"` ⇒ 只读底线；admin 档字样未实证 ⇒ 缺 ⇒ 只读）。
- **T5 = gitee 读类超时 20s**（余平台 10s——平台口径单点，实测 `/user/repos` 4.8–5.4s）。
- **T6 = 不符报错**（声明与实况不符 ⇒ 明确人话 + 出站零另一径——不静默改走他径）。
- **T7 = R69 升裁定=修收口**（设计档 §12 R69 ⇒ 已办——企业两径接线 + 实证在案）。

**不在本批（边界）**：其它平台零动（github/gitlab/自建——语义与超时口径零变）∥ 反向写回不做（沿 AC-44⑥）∥ 源表列面零动（不加类型列——载体 = 弹窗内）∥ 企业 webhook 不做（能力门照旧）∥ 需求档零触（父侧笔）∥ 三端零触。

### 2.1 设计档落点

- **主落点 = `docs/server/design/project/PROJECTS.md`**：§2 增 **KD-SV-151** ∥ §4 平台矩阵/角色映射 gitee 行收正 + 客户端口径（三态路由/成员行嵌套解析/不符报错）+ scope 条 + 超时条 ∥ §5 算法 2 ∥ §8 五行行账 ∥ §9 增 AC-44 ⑬ 行 ∥ §10 用例 N24–N29/B4/E5 ∥ §11 不做面 ∥ §12 R69 已办。
- **随动**：`store/STORE.md`（§1 链 + §2 标题 + **增 v21 增段** + §3 链 + §4 db 行）∥ `gateway/API.md` §2.9（源三行形增 `scopeKind` ∥ 拉列表行超时/三态路由/不符报错 + preamble 条）∥ `webui/PROJECTS.md`（§2.4 弹窗三态 + 不符报错显示条 ∥ §3 行账/键族 +8 ∥ §4 AC-44 ⑬ 行 ∥ §5 不做面）∥ `design/PROJECT.md`（§3 行 + §4 索引 1–151 + §7 AC-44 ⑬ + §6 本批预算块 + 变更记录）。
- 需求档 = 父侧笔（本席零触——44 ⑫ ∥ AC-44 ⑬ 已入册）。

### 2.2 机制设计

**① 三态语义表**（KD-SV-151——选择器三值由用户声明；`scope_kind` = 源行单源）：

| 范围类型 | 范围名（scope） | 仓列表（gitee） | 成员表（gitee） |
|---|---|---|---|
| 个人 `personal` | 不带（必空） | 仅 `GET /user/repos` | 不可用（`scope_missing` 人话「个人范围无成员表——成员同步仅组织/企业可用」） |
| 组织 `org` | 必填 | `/user/repos` + `GET /orgs/{scope}/repos` 去重 | `GET /orgs/{scope}/members`（现行行形） |
| 企业 `enterprise` | 必填 | `/user/repos` + `GET /enterprises/{scope}/repos` 去重（实测 70 仓） | `GET /enterprises/{scope}/members`（嵌套行——实测 13 人） |

（非 gitee 平台：`scope_kind` 恒 NULL；github/gitlab/自建的 scope 语义与路由零变。）

**② 列/迁移形**（细段单源 = `store/STORE.md` §2 v21——本批 = **v21 段**〔现链尾 v20〕）：

- 列 = `ALTER TABLE git_sources ADD COLUMN scope_kind TEXT CHECK (scope_kind IN ('personal','org','enterprise'))`（NULL 放行——非 gitee 恒 NULL；尾插列序）；审计 CHECK 零动（十五型不变）。
- **回填（仅 gitee——零猜测）**：scope 在场 ⇒ `org`（沿现行路由语义——组织零回归）∥ scope 空 ⇒ `personal`；非 gitee 行零动（`WHERE platform = 'gitee'`）。
- **id=2 完成路径 = 编辑窗改选「企业」保存一次**（改后拉列表 70 仓 ∥ 同步 13 人）。迁移不代用户声明（禁自动探测裁定的直接导出）；被否案 = 旧行全判「企业」（见 2.5）。

**③ 形门**（`git-sources.mjs`——建/改源；全形错 ⇒ 400 人话 库零变，沿 E1）：

- gitee ⇒ `scopeKind` 必填三值（缺/表外 ⇒ 400）；个人 ⇒ scope 必空（带范围名 ⇒ 400）∥ 组织/企业 ⇒ scope 必填（缺 ⇒ 400）。
- 非 gitee ⇒ 携 `scopeKind` 非空 ⇒ 400（「范围类型仅 gitee 适用」）；scope 照旧可选。
- 改源 = 键级（`scopeKind` 入键面；不携 ⇒ 沿行值）；`sourceView` 增 `scopeKind` 键（端形 = `gateway/API.md` §2.9）。
- **跨态清空形**（改源）：`scope: ""`/`null` ⇒ 置 NULL（组织/企业 ⇒ 个人的清空径）；平台（携值 ∥ 行值）非 gitee ⇒ `scope_kind` 落 NULL——携非空 ⇒ 400 ∥ 不携/携空 ⇒ NULL（平台切出 gitee 时旧值随清——「非 gitee 恒 NULL」）；用例腿 = N25（清空两形成 ∥ 落 NULL）∥ E5（残留提交 ⇒ 400 库零变）。

**④ 端点路由表**（gitee——`platform-client.mjs`；构造 `scope` 段 = `enterprise ? "enterprises" : "orgs"`）：

| 径 | kind=personal | kind=org | kind=enterprise | kind 缺（防御） |
|---|---|---|---|---|
| 仓列表 | `/user/repos` | + `/orgs/{scope}/repos` | + `/enterprises/{scope}/repos` | 沿现行（组织径） |
| 成员表 | `scope_missing` | `/orgs/{scope}/members` | `/enterprises/{scope}/members` | 沿现行（组织径） |
| 体检 | `/user`（无范围径——三态同） | 同 | 同 | 同 |

- **不符报错**：范围径 404 ⇒ `PlatformError("http_error")` + 人话（「{scope}」在 {组织|企业}端点不存在——请核对范围类型/编辑源改选）；**不静默改走他径**（机检 = 出站记录零另一径请求）。
- 仓列表合并径不变（主径 + 范围径去重、300 行上限、`truncated` 如实——组织径逐字零变）。

**⑤ 企业成员行解析**（`rosterRowOf` gitee 支——实测行形 `{url,active,remark,role,outsourced,enterprise,user}`）：

- 用户名 = `raw.login ?? raw.username ?? raw.user?.login ?? raw.user?.username`（**顶层先行——组织行零变**；企业行取嵌套 `user.login`）；缺 ⇒ `bad_response`（现行口径）。
- 角色 = 现行三谓词（`is_admin === true` ∥ `admin === true` ∥ `role === "admin"`）；实测企业行 `role:"member"` ⇒ 只读底线；**admin 档字样未实证 ⇒ 缺 ⇒ 只读**（沿现行口径——不揣测）；`active`/`outsourced`/`enterprise` 等余字段不消费（语义未实证）。
- 企业仓行 = 零解析分支（`full_name`/`html_url`/`ssh_url`/`private` 齐——`repoRowOf` 现行同形，用例 B4）。

**⑥ 超时口径**（`platform-client.mjs` 单点）：`readTimeoutOf(platform)` = gitee **20000** ∥ 余平台 **10000**；`listRepos`/`fetchRoster`/`checkToken` 缺省按平台解析（`timeoutMs ?? readTimeoutOf(platform)`）；调用面（`admin-routes.mjs` 拉列表行 ∥ `sync.mjs` 同步/体检两径）改传 `deps.timeoutMs`（缺省 ⇒ 平台解析；**注入面恒胜**——单元测试档沿用 `deps.timeoutMs`）。

**⑦ 弹窗（`views-git-sources.mjs`）**：类型选单（仅 gitee 显——四平台其余隐）∥ 创建态无默认（占位「请选择」）+ 必选门 ∥ 个人 ⇒ 范围输入隐 + 附注行 ∥ 组织/企业 ⇒ 范围输入显 + 必填（label「组织名 / 企业名」；企业占位专键）∥ 编辑态逐值回填；**跨态切换**：切「个人」⇒ 范围输入清空并提交（`scope: ""`——清除形）∥ 切非 gitee ⇒ `scopeKind` 不携/置空（清空形——不撞「仅 gitee 适用」400）。**不符报错显示**：拉列表窗内分类人话 + 服务端原文（`readErrorNodes` 既有面）；源表同步结果列 ⇒ `result.message` 优先于分类词。i18n +8 键/表（zh/en 对位——名册 = `webui/PROJECTS.md` §3）。控制台用例 = U1（选择器/范围门/跨态切换）∥ U2（编辑态回填/不符报错显示面）。

### 2.3 受影响文件与测试覆盖

| 档 | 现读（2026-10-13 实读） | 预期 Δ | 改法 |
|---|---|---|---|
| `thincoder-server/src/store/db.mjs` | 675 | ≈+14 | v21 段（ALTER + 回填 UPDATE + 迁移链行） |
| `thincoder-server/src/project/git-sources.mjs` | 265 | ≈+25 | `SCOPE_KINDS`/`normalizeScopeKind` 形门 + 建/改源校验 + `sourceView.scopeKind` |
| `thincoder-server/src/project/platform-client.mjs` | 267 | ≈+40 | `readTimeoutOf` + 三态路由 + 不符报错 + 嵌套行解析 |
| `thincoder-server/src/project/sync.mjs` | 238 | ≈+3 | `fetchRoster`/`checkToken` 携 `scopeKind` + 超时口径 |
| `thincoder-server/src/project/admin-routes.mjs` | 222 | ≈+2 | 拉列表行携 `scopeKind` + 超时口径 |
| `thincoder-server/public/views-git-sources.mjs` | 278 | ≈+30 | 三态选择器 + 范围门 + 结果列 message 优先 |
| `thincoder-server/public/i18n-{zh,en}-project.mjs` | 169（键 154） | +8 行/档 | 8 新键（名册 = `webui/PROJECTS.md` §3） |
| 批内单测两档（新建） | —— | —— | `docs/batches/2026-10-13-gitee-namespace-kinds.test.mjs`（服务端：N24–N29/B4/E5）∥ `…-ui.test.mjs`（控制台：U1/U2）；**不入任何门** |

### 2.4 验收对照（AC-44 ⑬ → 设计级判据，逐条）

| AC-44 ⑬ 条 | 设计级判据 | 载体 |
|---|---|---|
| 选择器三态显式 | 弹窗三态选单（仅 gitee 显 ∥ 创建无默认 + 必选门 ∥ 跨态切换两形）∥ 用例 U1/U2 | 单测档 + 收口轮 |
| 个人 ⇒ 范围不显；组织/企业 ⇒ 范围必填 | U1（范围输入 hidden 真值切换 ∥ 提交必填门）+ N25（服务端形门同判——含改源清空两形）+ E5（残留提交 ⇒ 400 库零变） | 单测档 |
| 企业源拉列表成（实测底据 70 仓） | N26（企业径出站 + 并集去重逐值）+ 收口实走（id=2 改选「企业」⇒ 70 仓） | 单测档 + 收口轮 |
| 企业成员同步成（13 人；嵌套行解析） | N27（嵌套行逐值 + 落行）+ B4（仓行兼容） | 单测档 + 收口轮 |
| 组织/个人源零回归 | N24（回填逐值）∥ N26/N27（组织径逐字）∥ 三平台零动（零改面） | 单测档 |
| gitee 读类超时放宽 20s | N29（`readTimeoutOf` 两值 + 挂起假件模拟时钟快进 ⇒ `请求超时（20000ms）`；不适配 ⇒ 值断言 + 调用点接线实读为退路） | 单测档 + 收口轮 |
| 禁自动探测（不符 ⇒ 人话、不静默改走他径） | N28（404 ⇒ `http_error` 人话 + 出站零另一径） | 单测档 |
| R69 状态随正 | 设计档 §12 R69 已办行 + §2 KD-SV-151（文档面机检） | 文档 |

### 2.5 关键决策（本批——KD-SV-151）

- **KD-SV-151**（全形 = `project/PROJECTS.md` §2）：三态显式（用户声明）+ 迁移零猜测 + 超时平台口径。**被否四案**：㈠ 自动探测/回退（用户明拒 + 双倍出站 + 误判面）∥ ㈡ 旧行全判「企业」（id=2 零编辑可用，但组织旧源路由被改写 ⇒ 现可用变 404——违「组织零回归」∧ 迁移代用户声明）∥ ㈢ 超时全局 20s（拖慢余平台失败判定——无实测依据）∥ ㈣ 第四态「自动」（违三态显式）。
- 超时形 = **平台常量单点**（`readTimeoutOf`——被否：三调用面各自常量 = 漂移面；全局放宽见㈢）。
- 迁移回填 = **同段 UPDATE**（加列 + 回填单段单事务——被否：零回填留 NULL（gitee 读路径多一条防御支 + 旧源仍走组织径，等价于㈡ 的保守变体但状态更浑））。

### 2.6 上抛项（跨批件清单——本席零触；父侧直笔）

- **[上抛·待裁] 跨批件随正清单**（本批使其在现绿基础上转红——逐件）：
  1. `docs/batches/2026-10-12-team-projects-permissions.test.mjs`：`:137`（`git_sources` 列面 deepEqual ⇒ 尾插 `"scope_kind"`）；`:194`（gitee 建源 ⇒ 补 `scopeKind: "org"`——否则 N3 腿 400 转红）；`:224`（事件门消息断言 ⇒ 同补——否则先撞类型门）；`:216`/`:222`/`:594–596`（期望 400 者补 `scopeKind` 保原错因——可选）；`:200` 行元组随 `:194` 修复自动绿。
  2. `docs/batches/2026-10-12-team-projects-permissions-ui.test.mjs`：`:520–523`（`selects[1]` = 同步方式选单——新增类型选单后位次后移 ⇒ 改按 option 值定位）；`:161-163` fixture 建议补 `scopeKind`（编辑态回填保真——可选）。
  3. `docs/batches/2026-10-13-project-sources-merge.test.mjs`：`:375–376`（project 部件键数 154 ⇒ **162**）。
  4. `docs/batches/2026-10-08-server-public-structure.test.mjs`：`:59–71`（门面键数 **962 ∥ 967 ⇒ 970 ∥ 975**；指纹 zh/en 两枚重算——父侧直笔）。
- **[上抛·知会] 观察项两件**：① `db.mjs` 实读 675 ⇒ ≈690——既定触发线 700 余 ≈10 行（下一迁移批大概率触发「迁移段外拆」轮）；② `sync.mjs` 测试件的 `deps.timeoutMs` 注入面恒胜——本批超时改动对既有件零红（已实读核）。

**同轮自校注（D6 读回 + 一致性面随正——逐条报）**：

1. **§1 追加段核对（2026-10-13 18:57 github/gitlab 追问——父侧实核）**：实测结论 = gitee 为唯一「企业」真命名空间平台（github 无 `enterprises/{ent}/repos`+`members` 路由 ∥ gitlab 组可嵌套非企业）⇒ 本设计「仅 gitee 分工、其余平台零动（语义与超时口径零变）」边界与之**逐字一致**；github 一企业多组织 ⇒ scope 一次填一组织（现状口径，零改）；gitlab scope 编码现行正确（`encodeURIComponent`——零改）。**本批设计零改因应**（边界不变）。
2. **形门措辞收正（建 vs 改）**：建源 = gitee 必携 `scopeKind`（缺 ⇒ 400）；改源 = 键级（不携 ⇒ 沿行值；gitee 行值/解析结果为空 ⇒ 400——迁移后不可达的防御句）。两档措辞已同拍（`project/PROJECTS.md` §2 KD-SV-151 行 ∥ `gateway/API.md` §2.9 PATCH 行）。
3. **读回核（grep 实读）**：五档 `KD-SV-151` 均在册；`project/PROJECTS.md` 旧面字面（「企业成员接口在册」∥「R69 升提请裁定」∥「超时 10s/调用」）**零残留**；github 行 `scope 在场 ⇒ 并 /orgs/…` 仍在（该平台零改——合规）。
4. **本批零触面复核**：需求档（父侧笔——44 ⑫ ∥ AC-44 ⑬ 已入册，本席只读核）∥ 产品码零触（设计轮）∥ `webui/WEBUI.md` 零触（无 IA/nav/页集变化）∥ `accounts/ACCOUNTS.md` 零触（审计 CHECK 十五型不变）。

**2026-10-13 · 设计评审轮 1 修正（fix 轮——六条，父侧全数受理）**：① 最近先例落 `project/PROJECTS.md` §2（一处——实现坐标 ∥ 设计节 ∥ 先例批；对齐 ∥ 偏离两条）；② 跨态清空形定形（`gateway/API.md` §2.9 增/改源两行 ∥ 本档 §2.2 ③/⑦ ∥ `webui/PROJECTS.md` §2.4——用例腿 N25/E5 ∥ U1/U2）；③ 用例坐标收口（`gateway/API.md` 两处枚举 ⇒ N1–N29 ∥ B1–B4 ∥ E1–E5 ∥ `project/PROJECTS.md` §10 头注补本批两档 ∥ `webui/PROJECTS.md` §4 ⑬ 行补 U1/U2）；④ 坐标/指针（本档 §2.1「§9 本批预算块」⇒「§6 本批预算块」 ∥ `design/PROJECT.md` §6 块指针写全 = 批档 §2.6——「−③」残标删）；⑤ i18n 行数注（`webui/PROJECTS.md` §3 两行 ⇒ ≈+8）；⑥ 两小计随正（`project/PROJECTS.md` §8 ⇒ ≈1545 ∥ 共享件 ≈+109；`webui/PROJECTS.md` §3 ⇒ ≈1172；`design/PROJECT.md` §6 块 webui 净 ⇒ ≈+46——分项和收正）。**零新语义**（评审发现直接导出项）；产品码零触（设计轮）。

## §3 设计评审（评审子代理）

### 轮次 1（评审子代理）

**审查范围**：批档 §2 全段 ∥ `project/PROJECTS.md` §2/§4/§5/§8/§9/§10/§11/§12 ∥ `store/STORE.md` §1/§2 v21/§3/§4 ∥ `gateway/API.md` §2.9 ∥ `webui/PROJECTS.md` §2.4/§3/§4/§5 ∥ `design/PROJECT.md` §3/§4/§6 本批块/§7/变更记录；需求档 44 ⑫（`:269`）∥ AC-44 ⑬（`:367`）只读核（逐条覆盖已对位）。产品码按声明零触——行数注核 = 五档内部一致（675 ∥ 265 ∥ 267 ∥ 238 ∥ 222 ∥ 278 ∥ 169/154 逐值同拍），盘面实读不在本轮范围。

| # | Category | Severity | Issue | Suggestion |
|---|----------|----------|-------|------------|
| 1 | 方法论（最近先例） | 🟡 | 本批设计（批档 §2 全段 + 五档落点）零「最近先例」行——批档全文「先例/precedent」grep 零命中；项目惯例 = 本批块/头注载「最近先例 = 坐标 ∥ 对齐 ∥ 偏离」（实证：`docs/server/design/ledger/LEDGER.md:6`「> 最近先例 = `project/PROJECTS.md` §3（B2 能力矩阵——KD-SV-115–128）」；`docs/server/design/webui/SANDBOX.md:153`「#1 §2.1① 本批块补「最近先例」行（同档两先例 + 沿/偏 + 重启门「无直系先例——设计拍」显式声明）」——该行 = 历轮评审发现 → fix 轮补入，可作先例） | 在本批落点（`project/PROJECTS.md` KD-SV-151 行侧 ∥ §4 客户端口径条）或批档 §2 补一行「最近先例 = 实现坐标 ∥ 对应设计节 ∥ 先例批 + 对齐 ∥ 偏离（偏离写理由；无直系先例 ⇒ 显式声明）」——本批可引 = gitee 组织径并集（B2 §4）∥ 掩码三态（provider apiKey 口径）∥ 列级 ALTER 段（v6/v16）∥ 读类超时（镜像源 10s） |
| 2 | 清晰度（编辑态边界） | 🟡 | 跨态切换的「清空/不携」定形缺失：形门要求「个人 ⇒ scope 必空（带范围名 ⇒ 400）」（批档:75）∥「非 gitee ⇒ 携 `scopeKind` 非空 ⇒ 400」（批档:76），而改源 = 键级「不携 ⇒ 沿行值」（`gateway/API.md:224`）、弹窗仅「个人 ⇒ 范围输入隐 + 附注行」（批档:98 ∥ `webui/PROJECTS.md:54`）——未定：① 编辑窗由 组织/企业 改选 个人 时 scope 的清空形（无清空径 ⇒ 服务端 400 且 UI 无可达修法）；② 平台由 gitee 改非 gitee 时隐藏态 `scopeKind` 的残留提交（撞 400「范围类型仅 gitee 适用」） | 形门/PATCH 行明写 scope 清除形（如 `scope: ""`/null ⇒ NULL）+ 弹窗切换行为（切 个人 ⇒ scope 置空并提交；切非 gitee ⇒ `scopeKind` 不携/置空），并各补 N25/E5 一条腿 |
| 3 | 验收（用例坐标滞后） | 🟡 | 本批新增用例未在支配档收口：`gateway/API.md:236`「用例 = `project/PROJECTS.md` §10（N1–N23 ∥ B1–B3 ∥ E1–E4）」与 `gateway/API.md:315`「判据全文 = `project/PROJECTS.md` §9/§10（N1–N23 ∥ B1–B3 ∥ E1–E4）」仍为旧枚举（`project/PROJECTS.md:188-202` 已增至 N24–N29/B4/E5）；`project/PROJECTS.md:161`「**A 件 = `docs/batches/2026-10-12-team-projects-permissions.test.mjs`（服务端核心）**」未指本批新档（实落 = 批档:111）；U1/U2 仅批档:111/:117 命名、`webui/PROJECTS.md` §4 ⑬ 行未落用例号 | API.md 两处枚举补 N24–N29 ∥ B4 ∥ E5（或改「用例 = §10」不收枚举）；§10 头注补本批两档（`…gitee-namespace-kinds.test.mjs` ∥ `…-ui.test.mjs`）；webui §4 ⑬ 行补 U1/U2 |
| 4 | 文档卫生（坐标/指针） | 🔵 | 两处坐标不精确：① 批档:52「§7 AC-44 ⑬ + §9 本批预算块 + 变更记录」——实落 = §6（`design/PROJECT.md:746` 本批块在 §6 段内；`:873`「§6 添本批预算块（服务端 净 ≈+84 ∥ webui 净 ≈+38；零新档；db v21——触发线余 ≈10 行）」）；② `design/PROJECT.md:747`「跨批件随正清单（父侧笔）= 批档 §2（−③）」指针形不明（同族 = 前批「= 批档 §2.6（…两件）」） | 批档 §2.1 坐标收正为「§6 本批预算块」；`PROJECT.md:747` 指针写全（§2.6，释「−③」或删括注） |
| 5 | 行账（行数注） | 🔵 | `webui/PROJECTS.md:69`/`:70` 两 i18n 行（「（键 154 ⇒ **162**——gitee-namespace-kinds 批 +8 键；估 ≈140）」）未注行数 Δ——同表其余本批行皆带「⇒ ≈+N」（批档:110 有「+8 行/档」） | 两行补「⇒ ≈+8」（或注明以实施实读为准） |
| 6 | 行账（小计） | 🔵 | 小计行未随本批增量随正：`project/PROJECTS.md:140`「域小计 = 服务端七档行和 **≈1475**」（本批五行 ≈+84 未折入）∥ `webui/PROJECTS.md:78`「**面小计**：≈965（设计行和）⇒ 实施实读 **≈1126**」（本批 +≈38 未折入） | 按行和随正两小计，或显式注「以实施后回填为准」 |

**发现计数**：🔴 0 ∥ 🟡 3 ∥ 🔵 3（🔴 零——无阻塞项）。

VERDICT: pass

## §4 用户批准（主 agent）

**2026-10-13 19:31 · 用户「批准」**——gitee 三态批（台账 #1365）获准进入实施。

- **依据（三条件齐备）**：① 设计评审通过（0🔴 ∥ 3🟡 ∥ 3🔵——发现表 = §3 轮次 1）；② 修正轮（#69）六条逐条落地并经父侧核读（最近先例 `project/PROJECTS.md:32` ∥ 清空形 `gateway/API.md:224` + 用例 N25/E5 ∥ 用例枚举 `API.md:236/:315` ⇒ N1–N29/B1–B4/E1–E5 ∥ §6 坐标（本档 `:151`）+ `design/PROJECT.md:747` 指针写全 ∥ i18n 行数注 `webui/PROJECTS.md:69/:70` ∥ 小计 ≈1545/≈1172——随正两件（webui +46 漏计 ∥ db.mjs 口径拆分）亦登记）；③ 设计令牌已签发（**值不入档**）。
- **批准范围** = §2 全量（三态路由 ∥ 形门 ∥ 企业嵌套行解析 ∥ 读类超时 20s ∥ v21 迁移 ∥ 弹窗选择器 + 跨态清空 ∥ 双语 i18n +8 键 ∥ 批内单测两档）。实施面 = §2.3 十档；跨批件随正四件（§2.6）= 父侧直笔（实施后随正）。
- **实施派发** = eng-coder（round=initial）——令牌随派发参数（运行态）。

## §5 实施记录（eng-coder）

**状态行**：实施完成 2026-10-13（分歧审计 0 偏差 + 代码评审 pass；fix round 1 轮；终态 clean；两件单测 9/9 ∥ 3/3 绿）

### 5.1 交付摘要

**十档落盘**（逐件 = 声明面内；产品码八档 + 新建批内单测两档；**零超文件面**）：

| 档 | 现读（自 `thincoder/` 仓根实读） | Δ（对 §2.3 估值） | 落点 |
|---|---|---|---|
| `thincoder-server/src/store/db.mjs` | 675 ⇒ **687** | +12（估 ≈+14） | `DDL_V21`（ALTER 加列 CHECK 三值 + 同段回填 UPDATE）+ 迁移链 `{ v: 21 }` 行 |
| `thincoder-server/src/project/git-sources.mjs` | 265 ⇒ **300** | +35（估 ≈+25） | `SCOPE_KINDS` ∥ `normalizeScopeKind` ∥ `checkGiteeScope` ∥ 建源形门 ∥ 改源键级 + 跨态清空 ∥ `sourceView.scopeKind` ∥ 键面 `scopeKind` |
| `thincoder-server/src/project/platform-client.mjs` | 267 ⇒ **312** | +45（估 ≈+40） | `GITEE_READ_TIMEOUT_MS`/`readTimeoutOf` ∥ `readJSON`/`readPages` 的 `notFoundMessage` ∥ `giteeScopeSegment`/`giteeScopeNotFound` ∥ 两径三态路由 ∥ `rosterRowOf` 嵌套链 ∥ 三读函数 `timeoutMs ?? readTimeoutOf(platform)` |
| `thincoder-server/src/project/sync.mjs` | 238 ⇒ **238** | 0（估 ≈+3） | 两行改（`fetchRoster` 携 `scopeKind` ∥ `timeoutMs = deps.timeoutMs ?? null`）+ 撤 `READ_TIMEOUT_MS` import —— **净零行** |
| `thincoder-server/src/project/admin-routes.mjs` | 222 ⇒ **222** | 0（估 ≈+2） | 两行改（`listRepos` 携 `scopeKind` ∥ `timeoutMs` 口径）+ 一行注释随正 —— **净零行** |
| `thincoder-server/public/views-git-sources.mjs` | 278 ⇒ **310** | +32（估 ≈+30） | 三态选单 + 范围门（含 label/占位换键）+ 跨态切换 + 必选门 + 提交体 `scopeKind` 条件携 + 结果列 `failedText` |
| `thincoder-server/public/i18n-zh-project.mjs` | 169 ⇒ **178** | +9（估 +8 行/档） | 8 新键 + 1 注行 |
| `thincoder-server/public/i18n-en-project.mjs` | 169 ⇒ **178** | +9（估 +8 行/档） | 同上（en 零 CJK） |
| `docs/batches/2026-10-13-gitee-namespace-kinds.test.mjs` | 新建 **545** | —— | 服务端件 9 例（N24–N29 ∥ N29′ ∥ B4 ∥ E5） |
| `docs/batches/2026-10-13-gitee-namespace-kinds-ui.test.mjs` | 新建 **356** | —— | 控制台件 3 例（键族 ∥ U1 ∥ U2） |

行数读数法 = 按 `\n` 切分并去末尾空行；i18n 两档 +9 中 1 行为段注（键数逐值 +8 = 设计所定，行数「以实施实读为准」= §3 评审发现⑤ 的口径）。

**两处行数超估的说明**（非功能面）：`git-sources.mjs` +35（估 ≈+25）——多出部分为两新函数的签名注 + 三处形门注释（`checkGiteeScope` 供建/改两处复用）；`platform-client.mjs` +45（估 ≈+40）——多出部分为 `giteeScopeSegment`/`giteeScopeNotFound` 两小函数的文档注。均为项目「实现坐标 + 口径注」体例，无冗余代码。

### 5.2 决策透明表（实现面——设计未定序或需注明的取法）

| # | 决策点 | 取法 | 依据 / 理由 |
|---|---|---|---|
| 1 | 形门落点 | 建/改形门全在 `git-sources.mjs`（纯形面）抛 `Error`；端点层只做 HTTP 400 映射 | 设计 §2.2③「全形错 ⇒ 400 人话 库零变，沿 E1」 |
| 2 | 归一序：值先于平台门 | 非 gitee 携**表外**值（如 `'team'`）⇒ 报「范围类型非法」而非「范围类型仅 gitee 适用」（两皆 400） | 设计未定序；本取法 = 先暴露真问题（值本身非法）。E5 腿按**合法值**（`'org'`）判「仅 gitee 适用」，与该序不冲突 |
| 3 | 非 gitee 改源的落值 | `else { 携非空 ⇒ 400；next.scopeKind = null }`——即「平台（携值 ∥ 行值）非 gitee」无条件落 NULL（库内既有非 gitee 脏值亦被清） | 设计 §2.2③「平台（携值 ∥ 行值）非 gitee ⇒ `scope_kind` 落 NULL」「非 gitee 恒 NULL」——恒 NULL 是不变量，清理脏值是其直接导出 |
| 4 | 404 人话单点 | `giteeScopeNotFound(scopeKind, scope)` 一函数；仓列表径 ∥ 名册径同句 | 设计 §2.2④ 给一句（「{scope}」在{组织\|企业}端点不存在——请核对范围类型/编辑源改选）；单点防两径漂移 |
| 5 | 404 专用消息的注入形 | `readJSON`/`readPages` 加**可选参** `notFoundMessage`（缺省 null ⇒ 逐字零变）；仅 gitee 范围径传值 | 设计 §2.2④；非 gitee 与主径零变 ⇒ 既有件零回归（`…-sync.test.mjs` 13/13 实跑绿） |
| 6 | 超时缺省的关键取法 | 两调用面 `deps.timeoutMs ?? null`（**非** `?? READ_TIMEOUT_MS`），客户端三读函数 `timeoutMs ?? readTimeoutOf(platform)` | 设计 §2.2⑥「注入面恒胜」——`?? READ_TIMEOUT_MS` 会让「未注入」与「注入 10s」不可区分，gitee 20s 缺省永不可达 |
| 7 | 弹窗跨态两形 | 切「个人」⇒ `scope.value = ""`（提交体走 `scope.trim() \|\| null` ⇒ `scope: null` = 清除形）；切非 gitee ⇒ `body.scopeKind` **仅在** `platform === "gitee"` 时写入（不携 ⇒ 沿行值/随清） | 设计 §2.2⑦「切「个人」⇒ 范围输入清空并提交（清除形）∥ 切非 gitee ⇒ `scopeKind` 不携/置空」 |
| 8 | 结果列原文优先 | `failedText(result)`：`result.message` 为非空字符串 ⇒ 直呈原文；缺 ⇒ `readKindLabel(result.kind)` 分类人话 | 设计 §2.2⑦「源表同步结果列 ⇒ `result.message` 优先于分类词」；兜底句可达（旧行无 `message`） |
| 9 | 拉列表窗原文面 | **零触** `views-projects.mjs`（`readErrorNodes` 既有面在盘） | 设计 §2.2⑦ 声明该面为「既有面」；§2.3 文件表未列此档 ⇒ 零触为正解 |
| 10 | N29 的「模拟时钟快进」 | `node:test` 的 `t.mock.timers.enable({ apis: ["setTimeout"] })`：挂起假件（仅按 abort 收口）+ 快进 19999ms（断言未收口）→ 1ms（断言 `请求超时（20000ms）`） | 设计 §2.4「挂起假件模拟时钟快进」的可执行实现（Node 24 原生，零第三方）；实测可行（1.5ms 跑完，无需真等 20s） |
| 11 | N29′ 两调用面接线 | 经 `routes.resolve("GET", …)` 直取 handler（伪 `req`/`res` + 真会话 cookie）在模拟时钟下直测 admin-routes 径；`scheduler.checkPat` 直测 sync 径 | 模拟时钟下 HTTP 往返不可控（请求未达即 tick）⇒ 直取调用点；两径各证「缺省 ⇒ gitee 20000ms 消息」 |
| 12 | 桩 DOM 的浏览器语义补 | U1 里对 `<select>` 显式 `selectFirst()`（首项置值并触发 change）；断言注释注明「真浏览器首项即选中」 | 桩 DOM 不自动同步 select 缺省值——非产品码问题；补法 = 测试夹具补语义，产品码零改 |

### 5.3 自跑读数（实跑；命令 cwd = `thincoder/` 仓根）

**本批两件（全绿）**：

- `node --test docs/batches/2026-10-13-gitee-namespace-kinds.test.mjs` ⇒ **9/9 pass**（2.2s）：N24（v21 迁移/回填四行：gitee 有范围 ⇒ `org` ∥ NULL ⇒ `personal` ∥ 空白 ⇒ `personal` ∥ github ⇒ NULL；列面尾插；余列逐值保形；CHECK 表外拒写；再升幂等）∥ N25（三值各一落库 + 六拒形 400 + 改源键级沿行值 + 类型换档 + 跨态清空两形）∥ E5（六拒 + 残留提交 400 + 行集逐值零变）∥ N26（org/enterprise/personal 三态出站路径逐条 + 并集去重 152 行 + 零另一径出站）∥ N27（org 径向零回归 + 企业嵌套 13 行逐值 + 三谓词 + 缺名 `bad_response` + personal `scope_missing` + **同步落行 13 人逐值**（12 只读 / 1 管理；`synced_role='admin'`））∥ N28（org 径 404 / 企业名册径 404 ⇒ `http_error` + 人话逐字 + 出站零另一径）∥ N29（`readTimeoutOf` 两值 + 挂起假件模拟时钟 19999/1ms 逐值 + 注入面恒胜）∥ N29′（拉列表/同步**两调用面**缺省 ⇒ `请求超时（20000ms）`）∥ B4（企业仓行 `repoRowOf` 逐值 + 址回退链 + 缺址分类）
- `node --test docs/batches/2026-10-13-gitee-namespace-kinds-ui.test.mjs` ⇒ **3/3 pass**（0.7s）：① 键族（project 两部件键集逐键对位含插入位 ∥ +8 新键两表在盘 ∥ en 零 CJK ∥ zh 八键逐字）∥ U1（选单三值 + 创建无默认 + 必选门两腿 + 组织/企业显隐与 label/占位专键 + 切个人清空 + 切非 gitee 不携 + 三提交体逐值）∥ U2（企业/个人/github 三态回填逐值 + 编辑提交体携 `scopeKind` + 结果列原文优先/分类兜底）

**同域存量件（零回归）**：`node --test docs/batches/2026-10-12-team-projects-permissions-sync.test.mjs` ⇒ **13/13 pass**（10.3s；含 N15 拉列表分页/截断 ∥ N17 出站全 GET ∥ E2 自含形三面 ∥ B3 撞锁合并 ∥ E3 验签门）——本批改动对该件零红。

**跨批转红读数（本批使其转红；归因 = 断言值 ≥ 962 或 ≥ v20 链尾；父侧直笔随正——批档 §2.6）**：

| 件 | 读数 | 转红点（实跑） |
|---|---|---|
| `2026-10-12-team-projects-permissions.test.mjs` | 16/18 | N1 `:135`（`git_sources` 列面 deepEqual ⇒ 尾插 `scope_kind` 差一）；N3 `:194`（gitee 建源 400「须选范围类型」）——N3 于 `:194` 早断，§2.6 预判的 `:224` 事件门断言**未达**（修 `:194`/`:216`/`:222` 后需复跑确认） |
| `2026-10-12-team-projects-permissions-ui.test.mjs` | 5/7 | ② `:214`（门面 zh 键数 970 ≠ 962）；⑦ `:524`（`selects[1]` 位次后移——新类型选单插在平台选单之后 ⇒ 取到 `null` ⇒ TypeError） |
| `2026-10-13-project-sources-merge.test.mjs` | 5/7 | ⑤ `:328`（同「`selects[1]` 位次」⇒ 事件块两态断言：实得 `hidden=true` 期望 `false`——**同族第 2 例，§2.6 未列**）；⑦ `:375`（project 部件键数 162 ≠ 154） |
| `2026-10-08-server-public-structure.test.mjs` | 5/6 | ① `:68`（zh 指纹漂移）——**新基线值**（供父侧直笔）：zh 键数 **970** 指纹 `1450fc92fb4fae0b344fd11c356067575b5e076c50d7541835ba8443557b01b8`；en 键数 **975** 指纹 `9c69b66cdbc34d4fca6da964176a52341a4affb1eace4b67469ba5fe91206bcc`（旧 = 962 `3a3cdf31…` ∥ 967 `1d8e1612…`） |
| `2026-10-13-team-ledger.test.mjs` | 27/30 | §B N1 `:338`（链尾 21 ≠ 20）；§B N2 `:370`（升后 21 ≠ 20）；§C ② `:911`（门面 970 ≠ 962） |
| `2026-10-10-runner-admin-console-ui.test.mjs` | 6/8 | ⑦ `:484`（键数 `[970,975]` ≠ `[962,967]`）；**另 `:504` 为既有红**（`views-sandbox.mjs` 502 行越 500 顾问线——本席零触该档） |
| `2026-10-11-admin-agent-chat-ui.test.mjs`（需 `--import ./thincoder-server/test/rc-resolve.mjs`） | 6/7 | ⑧ `:293`（键数 `[970,975]` ≠ `[962,967]`） |
| `2026-10-10-server-small-fixes.test.mjs` | 7/8 | 腿 A `:74`（zh 键数 970 ≠ 962） |
| `2026-10-10-team-login-client-access.test.mjs` | 8/10 | `:284`（「链尾 v20」⇒ 21 ≠ 20）；**另 `:303` 门禁清单 0 ≠ 61 为既有红**（清单面，非本批） |
| `2026-10-11-sandbox-image-sources.test.mjs` | 12/13 | `:598`（空库直落 20 ⇒ 21 ≠ 20） |
| `2026-10-12-server-wake-face.test.mjs` | 12/13 | `:570`（v20 ⇒ 21 ≠ 20） |

**既有红（与本批无关——归因法：① 断言字面值早于本批（v16/v17 ⇒ 早于 v20 链尾，本批前即红）∥ ② 本席 diff 零触该面（键面 ∥ 审计型表 ∥ 档目清单 ∥ 门禁清单面）；未做「回退基线实跑」——工作树含他席在飞改动，stash 有互扰风险，故不作）**：

`2026-10-06-console-completeness-2.test.mjs` 3/6（`:152` 17≠21 ∥ `:234` 审计行数 20≠19 ∥ `:436` 档目 54≠48）∥ `2026-10-06-server-gateway.test.mjs` 11/13（`:167` 16≠21 ∥ `:214` EPERM 临时目录清理——环境面）∥ `2026-10-07-me-keys-redo.test.mjs` 5/7（`:120` 17≠21 ∥ `:262` 键行集多一 admin 行）∥ `2026-10-07-provider-model-metadata.test.mjs` 4/6（`:151` 17≠21 ∥ `:482` 档目 54≠48）∥ `2026-10-07-quota-per-model.test.mjs` 5/7（`:150` 17≠21 ∥ `:444` 门禁清单 0≠61）∥ `2026-10-07-quota-v2-member-models.test.mjs` 9/12（`:167` ∥ `:428` ∥ `:730`）∥ `2026-10-09-server-console-config.test.mjs` 21/24（`:383` ∥ `:406` ∥ `:734` 审计型数 16≠15）∥ `2026-10-09-server-gemini-openai-preset.test.mjs` 17/19（`:263` ∥ `:279`）∥ `2026-10-12-console-reasoning-levels.test.mjs` 5/9（`:256` 17≠21 ∥ 另三例 `管理会话模型凭据缺位` error——agent 凭据面）∥ `2026-10-06-server-i18n.test.mjs` 5/6（`--import` 钩子下；`:164` labelKey 18≠19——nav 面零触）。

### 5.4 验收对照（§2.4 八条 → 判定 + 证据）

| §2.4 条 | 判定 | 证据（本批侧坐标 / 用例腿） |
|---|---|---|
| 选择器三态显式 | **已实现** | `views-git-sources.mjs:187-190`（选单三值 + 占位）∥ `:237-257`（仅 gitee 显 + 跨态两形）；用例 U1 |
| 个人 ⇒ 范围不显；组织/企业 ⇒ 范围必填 | **已实现** | U1（`hidden` 真值切换 + 提交门两腿）∥ N25（服务端形门同判 + 改源清空两形）∥ E5（残留提交 400 + 行集零变） |
| 企业源拉列表成（70 仓底据） | **已实现（单测侧）** | N26（企业径出站 + 并集去重 152 行 + 零另一径出站）；「收口实走 id=2 ⇒ 70 仓」= 父侧面，不在本席 |
| 企业成员同步成（13 人；嵌套行解析） | **已实现** | N27（嵌套 13 行逐值 + 同步落行 13 人：12 只读 / 1 管理 + 三谓词 + 缺名分类）∥ B4（企业仓行兼容） |
| 组织/个人源零回归 | **已实现** | N24（回填四行逐值 + 存量余列逐值保形 + 幂等）∥ N26/N27（组织径逐字）∥ 三平台零动（`reposQuery`/`rosterPath`/`levelOfRole` 非 gitee 支逐行核 + 404 消息仅 gitee 传值） |
| gitee 读类超时放宽 20s | **已实现** | N29（`readTimeoutOf` 两值 + 挂起假件模拟时钟 19999/1ms 逐值 + 注入面恒胜）∥ N29′（**两调用面**缺省 ⇒ `请求超时（20000ms）`） |
| 禁自动探测（不符 ⇒ 人话、不静默改走他径） | **已实现** | N28（仓列表 404 / 名册 404 双面人话逐字 + 出站零另一径）；实现面单径构造无回退分支（`platform-client.mjs:186-199`） |
| R69 状态随正（文档面机检） | **已落（设计轮——eng-designer 笔）** | `project/PROJECTS.md:227`「已办」行在盘 ∥ 旧面字面（「企业成员接口在册」/「超时 10s/调用」）零残留（分歧审计复核）——非本席笔，只读核 |

### 5.5 审计与代码评审轮次（内部收敛——终态 **clean**）

**轮 1 · 分歧审计（explore 只读子代理）**：四类偏差（未实现 ∥ 静默简化 ∥ 设计档漂移 ∥ 超文件面）**逐类 0 条**；核过面 = §2.2①–⑦ 七机制（7/7 合）∥ §2.3 文件面（10/10 在场，零超面；`views-projects.mjs` 等零触以 mtime + 机械清单核）∥ §2.4 八条（8/8）∥ 重点核查 41 条。报回三条**低权观察**：

1. `webui/PROJECTS.md:76` 守卫行自述「本批零改（零新档 ∥ 键集零动 ⇒ PARTS/DOMAINS/键数/指纹逐件零动）」，与本批 +8 键（同档 `:69`/`:70` 键 154 ⇒ 162）+ §2.6 #4（962∥967 ⇒ 970∥975）不相容 —— **设计档卫生项（eng-designer 笔，本席零触；上抛报告）**。
2. `project/PROJECTS.md:32`「最近先例」的实现坐标随本批 +46 行位移后失准（`platform-client.mjs` `:161-180` 今 = `:170-210` ∥ `:206` 今 = `:237` ∥ `:14` 今 = `:17`）—— **设计档卫生项（同上）**。
3. 本档 §5 盘上未写（审计时点）—— **本段即其补写**。

**轮 1 · 代码评审（advisor · type=code · 十档 + 五档文档）**：**VERDICT: pass**。在评发现 5 条：

| # | 级别 | 发现 | 处置 |
|---|---|---|---|
| 1 | 🟡（顾问线，不阻塞） | `db.mjs` 687 行 > 500 顾问线——但项目裁定在案（`store/STORE.md:637`「判 = 维持 + 上限 700」「触发 = 实读 >700 ⇒ 起「迁移段外拆」轮」），本批 +12 后余 ≈13 行未触线 | **无动作**（下一步迁移批按既定触发线外拆；§2.6② 已登记观察项） |
| 2 | 🟡（顾问线，不阻塞） | 批内件 `…-kinds.test.mjs` 545 行 > 500 顾问线（≤800 未触）；同族既有批内件同形（`2026-10-12-team-projects-permissions.test.mjs` ≥596 行） | **无动作**（项目批内测试件惯例面） |
| 3 | 🔵 | N25 同一测试内计数标签不一致（题名/注「五拒形」，用例六条 + 收口断言「六拒形」） | **已修**（见 5.6） |
| 4 | 🔵 | `platform-client.mjs:62` 私有 `readJSON` 缺省仍 `timeoutMs = READ_TIMEOUT_MS`（10s）——平台单点未闭合到函数级；当前三读函数皆显式传值故不可达（后续直呼者会静默落 10s） | **按设计保留 + 记观察**：设计 §2.2⑥ 只要求「三读函数缺省按平台解析 + 两调用面接线」，改 `readJSON` 签名为设计外加固（越设计面）——上抛父侧裁量 |
| 5 | 🔵 | `platform-client.mjs:158-159` `reposQuery` 的 `orgOnly` 死参/死分支（两调用点 = `:177` 与字面 `:192`，永为 false）——**存量零触**（本批未改该函数） | **不做**（非本批面；记观察） |

**评审限制（如实）**：两轮皆为只读装配（无执行面）——§5.3 的实跑读数与门面指纹值未由评审侧复跑/复算，按实施记录采信；评审侧另做静态核（两件 `node --check` 通过 ∥ 键数增量 +8/+8 与两表新增键数自洽 ∥ 逐档 mtime 扫描确认零超面）。

### 5.6 fix round（1 轮）

- **触发**：代码评审 🔵#3（N25 同测试内「五拒形/六拒形」自相矛盾）。
- **改**（单档两处，`docs/batches/2026-10-13-gitee-namespace-kinds.test.mjs`）：题名「五拒形 400」⇒「**六拒形 400（设计「五形」+ §2.2③ 表外腿）**」（`:213`）；行内注「五拒形（库零变）」⇒「**六拒形（库零变——含表外类型腿）**」（`:223`）——与既有收口断言「六拒形库零变」（`:238`）同拍。语义零变（六腿本就全跑全断言）。
- **复跑**：服务端件 **9/9 绿**（1724ms）∥ 控制台件 **3/3 绿**（612ms）。
- **未修两条 🔵 的理由**：见 5.5 表 #4/#5（一为设计外加固、一为非本批存量面）——如父侧裁量要做，属下一轮改动面。
- **终态**：**clean**（无 🔴 ∥ 无 must-fix 项 ∥ 两轮皆 pass）。遗留上抛 = 两条设计档卫生项（5.5#1/#2，eng-designer 笔）+ 一条父侧协调项（§2.6 随正清单少列 `2026-10-13-project-sources-merge.test.mjs:328`——本档 §5.3 已如实披露，直笔时请一并纳入）。

## §6 验证与收口（父代理）

**收口 2026-10-13**（设计→评审→批准→实施→部署→用户实走，同日报闭环）。

- **用户面验收**（AC-44 ⑫⑬）：用户 20:12 原话「gitee企业源添加成功了，我已经能够拉下来项目了。」——企业源添加成功 ✓ ∥ 仓列表已拉下 ✓（成员同步读数 = 13 人：§5.2 实测在档；用户面未逐句报——控制台「同步」一键可复读）。
- **父侧核验**：批内两档 9/9 + 3/3 绿（复跑）∥ 同域存量 13/13 绿 ∥ **跨批随正 9 件全绿**（结构守卫指纹/键数 970 ∥ 975 实跑验证 ∥ `team-projects-permissions` 18/18 ∥ `team-ledger` 链尾 21 等）∥ **既有红 2 处**（`views-sandbox.mjs` 502 行顾问线 ∥ 门禁清单 0 件——本批前既有、非本批成因，§5.3 在档）+ 他批遗留红族（§5.3 归因在档）。
- **部署**：`a9b50928` 双推（gitee ∥ github）；`.5` 新像 `ca3ba3baf388` ∥ 容器重建 ∥ `healthz {"status":"ok"}`。
- **结算对照**：角色表（§5 = eng-coder ∥ §6 = 父侧）✓ ∥ 状态行 ✓ ∥ 计数（键数 970 ∥ 975；行数实读 = §5.1——两处偏差已释〔注释体例〕）✓ ∥ 指针（设计五档修订 + R69 结）✓ ∥ 变更记录（五档 + 需求档）✓ ∥ 台账 #1365 核销 ✓ ∥ 跨批随正 9 件在档 ✓ ∥ **令牌终消费** ✓。
- **暂缓批复核**：无（#1207 复核条件未触）。
- **遗留（各在台账/在档）**：#1368（doc-check 示例名误报·归批）∥ #1369（`readJSON`/`orgOnly` 代码卫生·归批）∥ 两既有红（非本批面——要清另令）。设计档/批档提交 = 随下一笔 docs 提交（设计档与 #1215 面同档交叠，待其链稳定一并）。

**前情指针**：无（独立批）。
