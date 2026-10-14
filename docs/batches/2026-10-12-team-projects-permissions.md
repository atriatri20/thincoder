# 2026-10-12 · 团队项目与权限（B2）
> 六段 append-only，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 编制：主 agent · 2026-10-12 · 来源 = 用户 2026-10-12 13:39「可以，B2启动吧」+ 台账 #1216（13 条裁定全在册；需求档功能点 44 ∥ AC-44 已落 2026-10-12）。
> 台账 = #1216（server · 归批）。前情 = docs/batches/2026-10-12-console-reasoning-levels.md §6（已收口 2026-10-12）。
## §1 讨论（主 agent）
**状态行**：已收口 2026-10-13
<§1 模板占位：本批条目 / 关键判据 / 授权口径>

### 1.1 批件（用户 2026-10-12 13:39「可以，B2启动吧」——对父侧「你说「起」我就起批」之答；台账 #1216）

**目标（人话）**：企业场景下把「团队项目」和 git 平台接起来——项目/仓从 git 源来，成员与可见性跟着平台走，本地只管「谁能看/谁能写」；个人单仓不挂这套。

**需求级条目**（功能点 44 ∥ AC-44——`docs/server/requirements/PROJECT.md`，2026-10-12 已落）：

| # | 面 | 内容（13 条裁定——逐条原话在台账 #1216） |
|---|---|---|
| ① | 仓与来源 | server 端一张 git 仓表（项目 ↔ 仓一对一）∥ 从 git 源**拉列表勾选批量添加**（手输保底）∥ 四类平台（gitee/github/gitlab/自建）多源并存 ∥ 凭据 PAT ∥ 列表可搜索 ∥ **只有 admin 能加** |
| ② | 权限与可见性 | 权限**三档**（只读 ∥ 读写 ∥ 管理）∥ **未授权即不可见**（默认关着）∥ 负责人 = 能加/减成员 + 改项目显示名；**改仓地址仅 admin**（仓地址 = 记账键） |
| ③ | 成员同步 | **单向**（git 平台为源，不做反向写回）∥ **能同步的同步**（有成员事件的平台走事件；无事件的走定时拉取）∥ **手动拉取钮永在** |
| ④ | 平台能力矩阵 | gitee：有成员表、**无成员事件** ∥ github：有表有事件 ∥ gitlab：有表、事件限付费档 ∥ 自建：有接口就拉、没有手输；**每平台一张角色映射表**（三档 ⇔ 平台角色） |
| ⑤ | **源表**（用户 13:38 补问——**需求档补笔待落**） | 一行 = 一个源：名字 ∥ 平台 ∥ PAT（加密、不回显）∥ 启用/停用 ∥ 同步方式 ∥ 上次同步时间+结果 ∥ **「立即拉取」**；拉列表 ∥ 成员同步 ∥ PAT 体检 ∥ 删源防护都挂它。**落笔 = 需求档功能点 44；当下冻结中（#269 评审在途）⇒ 解冻即补** |

**判据口径**：AC-44 八条（仓表 ∥ 拉列表批量 ∥ 多源 ∥ 三档 ∥ 负责人边界 ∥ 单向同步 ∥ 能同步的同步+手动钮 ∥ 角色映射表）；验证 = 批内件 + 收口轮浏览器实走。

**边界**：不做反向写回平台 ∥ 权限模型改造不做 ∥ 个人单仓不挂同步 ∥ 成员同步 = 企业项目才有的机制 ∥ **CI 集成（#1216 ③）= 单独一块、未谈，本批不含**（设计轮不得自行展开）。

**授权口径**：本批走**常规链**（设计 → 评审 → 用户批 → 实施）——逐段报备等点头，**不自动跑**（对比 #1310 = 全自动授权；用户对本批只说「启动」）。设计派发 = 报备后等点头。

**排期注**：与环境感知批（#1310）同触控制台成员/项目面（`public/nav.mjs` ∥ `public/i18n-*` ∥ 成员/项目页族）——本批设计轮可并行勘察，**实施轮须在 #1310 实施落定后**（串行防坐标漂移）。

**来源**：用户谈 2026-10-10 12:28 起（13 条裁定逐条在台账 #1216）+ 2026-10-12 13:39 起批令；平台调研（三家官方文档实读）= 台账 #1216 同录；需求档 = 功能点 44 ∥ AC-44（`docs/server/requirements/PROJECT.md`）。

### 1.2 全链自动授权（用户 2026-10-12 14:53「B2也跑完」）

- **授权射程**：本批全链自动跑——设计派发 ∥ 设计评审点火 ∥ §4 代签 ∥ 修正/实施派发 ∥ 收口核销提交（口径同 #1310 批）。
- **自缚三条（沿 #1310）**：① §4 代签仅在「评审 pass（无 🔴）∥ 修复轮全落且父侧核验 ∥ 新范围与口径裁决零项」三条件齐备时执行；② 出现新范围/口径裁决 ⇒ **停下只摆一条**（一题一报，不连问）；③ 破坏性动作（删数据 ∥ 力推 ∥ 撤销外部凭据）先停等令。
- **排期注解除**：#1310 已收口（2026-10-12 14:4x）⇒ 原「实施须待 #1310 后」的串行约束解除——本批可全速。
- **设计第一问（交设计轮）**：数据模型落点（仓表/源表/项目权限三件与既有 `accounts` 域的关系）+ 界面承载（控制台页族；三端可见性范围以需求档 44 为准、需求沉默处提请裁定）。

### 1.3 评审轮 3 结果与父侧处置（2026-10-12 16:1x）

- **轮 3（评审 #285）机读结果 = 未通过 · token 未签发**——系统回执原文「裁定非通过——token 未签发（review verdict is not pass；reason: changes-required; the echoed token was stripped）」；`design-slots` 实查佐证：本设计（`9c6bd105`）无在场槽位。评审席 §3 落档内文写「VERDICT: pass（🟡1）」——**按机读为准**；存差如实登记（§3 append-only 不改）。
- **核验结论**：#280 之 1/2/4/5（并 3）逐条已修 ✓（评审席全文核 + 父侧抽读复核）。
- **新增相抵 1 件（父侧受理）**：`docs/server/requirements/PROJECT.md:343` AC-44 ⑩「未登记/未生成密钥/非 github/过期时间戳 ⇒ 4xx 人话」与设计 §13 门面相抵（设计：未登记 ⇒ 404 ∥ 未生成密钥/缺签名/签名不符 ⇒ 401 ∥ 忽略面含 `poll` ⇒ 200 ∥ 明载「签名无时间戳」不做投递防重放）。两陈子句 = 父侧落笔时越界（非用户 15:20/15:21 授权原文「github ∥ 公开端点 ∥ 验签 ∥ 触发同步 ∥ 每源密钥」所出、非设计所载）。
- **处置与排期**：① 收正 `:343`（对齐设计单源）+ 变更记录一笔——**待 #287（定时批轮 2 评审）冻结窗解冻**（2026-10-12 16:18 试写被 D5 拒：「design review #287 is in flight over thincoder\docs\server\requirements\PROJECT.md」，拒文在案）② 落毕 ⇒ **B2 轮 4 复核**（设计评审再点——点火另需待 #289 设计轮解冲突：其声明档含 `store/STORE.md`）③ 过（token）⇒ §4 代签 ⇒ 发实施。

## §2 批次任务与设计（eng-designer）
**状态行**：设计完成（修订轮 2（fix）已落——评审 #280 之 #1/#2/#4/#5 处置；#3（需求档）= 父侧笔；余 R65–R70 待父侧）
<§2 模板占位：本批条目（覆盖） / 设计档落点 / 机制设计 / 受影响文件与测试面 / 验收对照 / 关键决策 / 上抛项>

**本批（B2——team-projects-permissions；台账 #1216；用户 2026-10-12 13:33 裁定收束 + 13:39 起批令）· 设计轮（eng-designer）**

**一、本批覆盖的需求条目（全数——功能点 44 ∥ AC-44 ①–⑨；需求档 = `docs/server/requirements/PROJECT.md` `:254–263` + 验收表 `:319`）**

| 需求条目 | 覆盖 | 设计落点（单源指针） |
|---|---|---|
| 44① 仓表（项目 ↔ 仓一对一；拉列表勾选批量 + 手输保底；重复挂仓拒；只 admin 能加） | ✅ | `project/PROJECTS.md` §5（加仓两径/归一/唯一）+ §3（admin 门）；`gateway/API.md` §2.9 `POST /api/admin/projects` 行 |
| 44② 权限三档 + 未授权即不可见 + 负责人边界（加/减成员 + 改显示名；改仓地址仅 admin）+ 成员表（username/项目/级别） | ✅ | `project/PROJECTS.md` §3（能力矩阵 + 判据句 1–8）+ §5（成员行）；`store/STORE.md` §2 v17 段 `project_members` |
| 44③ 成员同步（单向——那边加/减这边跟；能同步的同步；手动钮永在）+ 平台对接（四平台各 PAT 各源） | ✅ | `project/PROJECTS.md` §4（四平台矩阵 + 客户端口径）+ §5（同步机制/三径/锁）；`gateway/API.md` §2.9 sync/check/repos 三行 |
| 44④ 平台能力矩阵（拉列表/成员表/成员事件/角色）——父侧调研在册 | ✅ | `project/PROJECTS.md` §4（矩阵 + 角色映射表四张） |
| 44⑤ 源表（name/平台/PAT 加密存 + 不回显/启停/同步方式（事件 ∥ 定时可间隔）/上次同步时间+结果 + 「立即拉取」） | ✅ | `project/PROJECTS.md` §5（源生命周期/结果/体检/删源防护）；`store/STORE.md` §2 v17 段 `git_sources`；`webui/PROJECTS.md` §2.3（源表页七列五钮） |
| AC-44 ①–⑨ | ✅（逐条对位 = `project/PROJECTS.md` §9 表；机检 = 批内件 N1–N18 ∥ B1/B2 ∥ E1/E2（§10）；实走 = 收口轮浏览器） | —— |

**二、明确不在本批（批界 = 台账 #1216③ + 用户 13:33 收束）**：CI/钩子面（push/PR/tag 与仓变更同步）∥ #1215 面 ∥ 反向写回平台 ∥ 第三方依赖 ∥ 成员事件接收端（R63——字段/契约在册）∥ 项目删除（R64——缺项）∥ 三端端侧面（R65——需求沉默）∥ 仓级协作者同步（R66）∥ admin-agent 工具面（R68）。读写档独立写对象随 B3+（R67——机检 = 能力读数）。

**三、机制设计（单源 = 设计档——本节只列落点）**

- 域与文档：新立 **project 域**（KD-SV-115——代码 `thincoder-server/src/project/`；文档 `docs/server/design/project/PROJECTS.md`（新档）+ `docs/server/design/webui/PROJECTS.md`（新面档——KD-SV-124））。
- 数据（迁移 **v17**）：`git_sources` ∥ `projects` ∥ `project_members` 三表 + 审计 CHECK 再扩（十三 ⇒ **十四型**：`project_event`）——`store/STORE.md` §2 v17 段（单源）。
- 身份键（KD-SV-116）：统一用户名（大小写不敏感唯一；平台行 manual 优先；成员行不要求本地账号存在）。
- 可见性/分权（KD-SV-120/121）：未授权即不可见（列表零出现 ∥ 直取 404 不辨）；能力矩阵（三档 + 负责人 + admin；改仓地址仅 admin）。
- 平台接入（KD-SV-117/118/119）：四平台客户端（零反向——出站全 GET）∥ 成员同步 = 源级名册 → 源下全部项目（定时 + 手动；事件进路 = 字段在册、接收端随公网/钩子批）∥ PAT 加密 = 共享 `src/store/credential-crypto.mjs`（自 `sandbox/onboarding.mjs` 逐字抽出——零行为变）。
- 端点（**十四**）：成员面六（`/api/projects*`——会话 + 能力矩阵）+ 管理面八（`/api/admin/git-sources*` ∥ `POST /api/admin/projects`——requireAdmin）——`gateway/API.md` §2.9（单源）。
- 界面：三页（`#/me/projects` ∥ `#/admin/projects` ∥ `#/admin/git-sources`）——`webui/PROJECTS.md` §2；IA 随正（我的 3 ⇒ **4**；管理 9 ⇒ **11**）——`webui/WEBUI.md` §2/§6。

**四、设计档落点（已落盘）**：`project/PROJECTS.md`（新）∥ `webui/PROJECTS.md`（新）∥ `store/STORE.md` §1–§4 ∥ `gateway/API.md` §1/§2.9/§3/§5 ∥ `accounts/ACCOUNTS.md` §1/§2.1/§5/§6/§7 ∥ `webui/WEBUI.md` §1/§2/§3/§5/§6/§7/§8 ∥ `webui/I18N.md` §2.1/§3/§4 ∥ `webui/READINGS.md` §2.1④/§3/§4 ∥ `design/PROJECT.md` §1/§2.1/§3/§4/§6/§7/§9 ∥ 各档变更记录。**产品码零触（设计轮）。**

**五、受影响文件与测试面（预算）**：服务端 ≈**+1400**（新域七档 + v17 段 + 随动——逐档 = `project/PROJECTS.md` §8 单源）∥ webui ≈**+740**（三视图新档 + i18n project 两新档 + 随动——逐档 = `webui/PROJECTS.md` §3 单源）——全文 = `design/PROJECT.md` §6 本批预算块。批内件三档（`docs/batches/2026-10-12-team-projects-permissions.test.mjs` ∥ `…-sync.test.mjs` ∥ `…-ui.test.mjs`；入 server 链）；`prepublishOnly` 链 **58 ⇒ 61**。跨批守卫件随正 = `docs/batches/2026-10-08-server-public-structure.test.mjs`（PARTS/DOMAINS + `project` ∥ 指纹/键数 ∥ 新档入行数核清单）。其余随正件 = 各 nav 计数件/档目断言件（以实施当刻盘面为准——沿先例）。

**六、关键决策（全形 = 设计档 KD 节）**：KD-SV-115–123（`project/PROJECTS.md` §2）∥ KD-SV-124（`webui/PROJECTS.md` §1）。

**七、上抛项（R63–R70——父侧一题一报；全形 = `project/PROJECTS.md` §12 ∥ 板级 stub = `design/PROJECT.md` §9）**：R63 事件进路落地深度（甲维持 ∥ 乙本批补接收端——甲默认）∥ R64 项目删除缺项（甲维持不做 ∥ 乙 admin 可删）∥ R65 三端可见性（维持不做——提请确认）∥ R66 同步作用域（组织级 vs 仓级——维持本裁）∥ R67「读写能写」机检口径（能力读数——提请确认）∥ R68 admin-agent 工具面（缺项——维持不做）∥ R69 gitee 企业端点/自建协议（知会）∥ R70 **需求档计数回笔（主 agent 笔）**——我的 3 ⇒ 4 ⇒ 5 ∥ 管理 九 ⇒ 十一 ∥ 侧栏 十三 ⇒ 十五 ⇒ 十六 ∥ AC-12 链。

### 设计修订轮（fix）· eng-designer —— 承 §3 轮次 1（评审 #277：🔴0 ∥ 🟡8 ∥ 🔵3）+ 用户 2026-10-12 授权新范围两件（R63 乙案 ∥ R64 补面）

**一、逐条处置（号 → 改动 file:line）**

| 号 | 处置 | 改动落点 |
|---|---|---|
| 1 | ✅ | 三处读数收正：`project/PROJECTS.md` §8 行账（`bin/thincoder-server.mjs` **实读 192** ⇒ +≈8；`accounts/audit.mjs` **实读 116** ⇒ ≈118）∥ `webui/PROJECTS.md` §3 守卫件行（`2026-10-08-server-public-structure.test.mjs` **实读 163**）∥ `accounts/ACCOUNTS.md` §4（`audit.mjs` 109 ⇒ **116** ⇒ ≈118——陈读收正） |
| 2 | ✅ | `store/STORE.md` §4 `db.mjs` 行补 >500 软线复核：**判 = 维持 + 上限 700**（迁移段 append-only ∥ 单源一读到底；≈560 留 ≈240 余量 ⇒ ≈7 批以上；触发 = 实读 >700 ⇒ 起「迁移段外拆」轮——`migrations.mjs`（拟新增）纯搬移）；同指 = `project/PROJECTS.md` §8 ∥ `design/PROJECT.md` §6 |
| 3 | ✅ | KD-SV-119 收正：凭据外迁**并含键路径派生 `credentialKeyPath(config)`**——单一出处（两域同址、消第二份路径规则）；用例 **N23**；行账 ≈60 ⇒ ≈65 |
| 4 | ✅ | KD-SV-118 收正：**`event` = 事件触发 + 定时对账同跑（消死区）** ⟹ 模式不入同步判据；`event` 选单**平台门 = 仅 github 可选**（其余平台选中即禁 + 括注理由）；`webui/PROJECTS.md` §2.3 两值 + 括注随正 |
| 5 | ✅ | `project/PROJECTS.md` §5 手输载荷改**单源指针**（载荷逐字 = `gateway/API.md` §2.9——`{ address, displayName?, owner? }`；补 `owner?`） |
| 6 | ✅ | §10 增 **N19（列表搜索 `?q=`）**——匹配面/零命中/非成员视角三断言；§9 AC-44② 行用例挂 N19 |
| 7 | ⚠️ 提请（需求档笔） | 设计面无改——「能写」判定级口径已在 §12 R67 如实在册；**需求档 AC-44④ 措辞收正 = 父侧（主 agent）笔**（评审建议原文） |
| 8 | ✅ | §5 增**仓地址归一 = 跨形单键**（规范形 `host[:port]/path`；http/https/ssh/scp 同键 ⇒ 跨形重复同拒——AC-44①）；同拍 = `store/STORE.md` `projects.address` 注释 ∥ `gateway/API.md` repos 行 `known` 标 ∥ `webui/PROJECTS.md` §2.2 已在册标（服务端 `known` 读数） |
| 9 | ✅ | §12 R70 链头收正（**十二（现盘面）** ⇒ 十五 ⇒ 十六）+ 板档 `design/PROJECT.md` §9 R70 stub 同拍 |
| 10 | ✅ | `webui/PROJECTS.md` 两处措辞（本面三页**三表**入壳 ∥ 详情响应携 `can` 场） |
| 11 | ✅ | §12 R69 处置升级：**实施轮先实证 gitee 企业场景并回报；企业为常态 ⇒ 升提请裁定**（原「知会」不再自足） |

**二、用户授权新范围两件成章（R63 ∥ R64）**

- **R63（乙案——events 接收端）**：`project/PROJECTS.md` **§13**（KD-SV-127）= `POST /api/hooks/git-sources/:id`（公开；HMAC-SHA256 `X-Hub-Signature-256` + `timingSafeEqual`；验签败 401 + `log.warn`（不入审计）∥ 未知源 404；`member` 事件 ⇒ 异步触发一次全量对账（`trigger='event'` ∥ actor=`webhook`）+ 撞锁待跑旗合并；载荷不解析）；密钥 = 源新列 `hook_secret_cipher`（v17 内加列——不设 v18）+ `POST …/:id/hook-secret` 一次性明文（读面恒掩码）；界面 = 添编窗事件块（地址/密钥/登记步说明——登记手动 ⇒ 零反向出站）。
- **R64（补面——项目删除）**：**§14**（KD-SV-128）= `DELETE /api/admin/projects/:id`（载荷 `{confirm:true}`（缺 ⇒ 400 人话）；admin 专属 ∥ 不存在 404）；`project_members` 同事务随删；审计 `project_delete`；界面 = 详情弹窗删除钮 + 确认窗（`can.delete`）。删除 = 最终（不做回收站/恢复——审计行在册）。
- **随正**：端点面十四 ⇒ **十七**（成员六 ∥ 管理十 ∥ 接收一）——`gateway/API.md` §2.9 ∥ 审计 kind 十 ⇒ **十一**（`project_delete`）——`accounts/ACCOUNTS.md` §2.1 ∥ 用例 **N20–N22** + B3/E3/E4 ∥ `webui/READINGS.md` §2.1④ 模板补「项目删除」键 ∥ `webui/I18N.md` 键族 ≈+100 ⇒ ≈**+120/表**。

**三、本轮全部随正面（改动文件汇总）**：`project/PROJECTS.md`（§2–§6/§8–§12 随正 + §13/§14 新增）∥ `webui/PROJECTS.md` §2.1–§2.3/§3/§4/§5 ∥ `store/STORE.md` §2/§3/§4 ∥ `gateway/API.md` §1/§2.9/§3/§5 ∥ `accounts/ACCOUNTS.md` §2.1/§4 ∥ `webui/READINGS.md` §2.1④/§3 ∥ `webui/I18N.md` §2.1 ∥ `webui/WEBUI.md` §5 ∥ `design/PROJECT.md` §2.1/§3/§4/§6/§7/§9 ∥ 各档变更记录。**产品码零触（设计轮）。**

**四、预算随正**：服务端 ≈+1400 ⇒ **≈+1570**（新域七档 ≈1475 + `credential-crypto.mjs` ≈65）∥ webui ≈+740 ⇒ **≈+965**（按行和收正；R63/R64 增量在含）；`prepublishOnly` **58 ⇒ 61** 不变 ∥ 批内件三档不变。（单源 = `design/PROJECT.md` §6；两端 = `project/PROJECTS.md` §8 ∥ `webui/PROJECTS.md` §3。）

**五、门禁读数（2026-10-12 修订轮——`node scripts/doc-check.mjs`，仓根 `thincoder/`）**：**行宽 OK**（源域零 >300 字符单行——含父侧补项三行 + 本面自检出 `webui/READINGS.md:30` 一行的折行，仅拆行零改字）∥ 锚 = **25 悬空**（= 前任遗留基线；本面**零新增**——本轮 `src/store/migrations.mjs` 引用已标拟新增）∥ 行数面差异 6 条全在 `docs/desktop`（非本面）∥ 拟新增 70 ∥ 迁移期引文 339。

**六、未做 / 待外**：① 需求档 AC-44④ 措辞收正 = 父侧笔（发现 7）；② R70 需求档计数回笔 = 父侧（设计侧链头已收正）；③ R69 实证 = 实施轮；④ 陈旧读数已随正（`views-audit.mjs` 实测 **165**——`webui/READINGS.md` §3 行注，预估以 165 为基 ⇒ ≈177）。

### 设计修订轮 2（fix）· eng-designer —— 承 §3 轮次 2（评审 #280：🔴1 ∥ 🟡3 ∥ 🔵1——本面处置 #1/#2/#4/#5；#3 = 需求档父侧笔——父侧已落）

**一、逐条处置（号 → 改动 file:line）**

| 号 | 处置 | 改动落点 |
|---|---|---|
| 1 | ✅ 口径① | `gateway/API.md` §2.9 详情行（`:211`）：`my` 补 `admin` 布尔 + `can` 补 `delete`（六键逐值 = `project/PROJECTS.md` §3 判定函数）+ 增「详情 `my` 形」条目（渲法源口径）；`webui/PROJECTS.md` §2.1（`:25`）渲法源句收正（服务端 `my` 读数——`can` 六键 ∥ `admin` 布尔）+ §4 行（`:77`）随拍（`my` 读数显隐）。**裁定：`admin` 布尔随 `my` 下发**（admin 专属控件「更换负责人」无对应 `can` 键——渲法源须服务端读数；「删除项目」钮渲法源恒 = `can.delete`——webui §2.1 该句逐字不破）。否口径②（webui 按会话角色判——与「判权全在后端：控件显隐 = 服务端读数」口径相抵） |
| 2 | ✅ | `store/STORE.md` §2 v17 段（`:470-471`）kind 枚举补 `project_delete` + 计数「十一 kind」（逐值对齐 `accounts/ACCOUNTS.md` §2.1；口径 = 补全副本——否纯指针句：v11/v14 段同址均列 kind，保留索引体例，详面仍在 ACCOUNTS 单源） |
| 4 | ✅ | `webui/PROJECTS.md` §3 五随动行（`:57-61`）补现读（体例同守卫件行）：`nav.mjs` 实读 **99** ⇒ +≈4 ∥ `app.mjs` **197** ⇒ +≈7 ∥ `views-audit.mjs` **165** ⇒ +≈12 ∥ `i18n.mjs` **138** ⇒ +≈4 ∥ `style.css` **345** ⇒ +≈18 |
| 5 | ✅ | `project/PROJECTS.md` §13（`:222` 后）增「存储面与重启」句：锁与「待跑旗」= 进程内态（单实例部署——零持久化）；重启 ⇒ 清零——兜底 = 定时对账照跑（软状态——沿限流/登录锁先例） |

**二、本轮随正面（改动文件汇总）**：`gateway/API.md` §2.9 ∥ `webui/PROJECTS.md` §2.1/§3/§4 ∥ `project/PROJECTS.md` §13 ∥ `store/STORE.md` §2 v17 段 ∥ 四档变更记录。**产品码零触（设计轮）。**

**三、门禁读数（2026-10-12 修订轮 2——`node scripts/doc-check.mjs`，仓根 `thincoder/`）**：行宽 = 3 行超限，**全在非本轮文件**（`agent/ADMIN-AGENT.md:51`（360 字符）∥ `:75`（324）∥ `requirements/PROJECT.md:265`（355）——本刻同期旁路笔：server-wake-face 修订轮 ∥ B2 需求档两件；本轮四条触档零超限）∥ 锚 = 27 悬空（本轮基线 26 ⇒ +1 = `agent/ADMIN-AGENT.md:75`——同非本轮；本轮触档零新增）∥ 行数面差异 6 条（全在 `docs/desktop`——非本面）∥ 拟新增 70 ∥ 迁移期引文 339。

**四、未做 / 待外**：① #3 需求档两件 = 父侧笔（不在本轮——父侧已落 `requirements/PROJECT.md:265` 补面两件行）；② R65–R70 待父侧；③ 旁路观察入册（`agent/ADMIN-AGENT.md:51/75` ∥ `requirements/PROJECT.md:265` 行宽超限 + `:75` 悬空——非本面笔，同上「三」）。

## §3 设计评审（评审子代理）

### 轮次 1（评审子代理）

**设计评审——B2 团队项目与权限（`docs/server/design/project/PROJECTS.md` ∥ `docs/server/design/webui/PROJECTS.md` ∥ 需求 `docs/server/requirements/PROJECT.md` 功能点 44 + AC-44 ①–⑨；KD-SV-115–124；上抛 R63–R70）**

| # | Category | Severity | Issue | Suggestion |
|---|----------|----------|-------|------------|
| 1 | Affected-file size annotations | 🟡 | 随动文件现读行数不全：`project/PROJECTS.md:130` 仅「（已落盘）」+「+≈6」（`bin/thincoder-server.mjs` 实读 **192**）、`:131`「机械（门禁链 + 批内件三档）」（`package.json` 实读 **30**）、`webui/PROJECTS.md:58` 守卫件 `2026-10-08-server-public-structure.test.mjs`（实读 **163**）无现读/增量；且 `project/PROJECTS.md:129`「（已落盘 · 实读 109）」与 `accounts/audit.mjs` 实读 **116** 不符（差 7）。 | 三个文件补「现读行数 + 预期增量」；`audit.mjs` 读数收正 109 ⇒ 116（+1 型）。同值亦在 `accounts/ACCOUNTS.md` §4 行（随动面）。 |
| 2 | Affected-file size annotations | 🟡 | `project/PROJECTS.md:127`「（已落盘 · 实读 488）」+「≈+70（v17 段——三表 + 审计重建）」⇒ **≈560**，跨过 500 行档（>500 ⇒ 需主动拆分复核），设计未给拆分或维持口径（函数档未越线——v17 `up(db)` 段 ≈70 行）。 | 补一句拆分/维持判定（如迁移段外拆为独立段档，或明写维持理由与上限）。`store/STORE.md` §4 同载 ≈560——随动面同拍。 |
| 3 | Feasibility | 🟡 | `project/PROJECTS.md:23` 抽取件只含「`loadOrCreateCredentialKey` ∥ `encryptSecret` ∥ `decryptSecret` 三件自 `thincoder-server/src/sandbox/onboarding.mjs` 逐字抽出」，**不含键路径口径**——键路径由 `onboarding.mjs` 的 `dataDir(config)` 派生，而「本域反向依赖 sandbox 域」已被该 KD 否掉 ⇒ 本域无在册的键路径来源，易落成第二份路径规则（两份 `credentials.key`）。 | 把 `dataDir`（或 `credentialKeyPath(config)`）一并抽入共享件成单一出处，或在设计内写明键路径派生口径 + 断言。 |
| 4 | Requirements / Feasibility | 🟡 | `project/PROJECTS.md:93`「置 event ⇒ 定时不跑、手动照常」∧ 接收端本批不落 ⇒ 置 event 的源**零自动同步**（只剩手动），与 AC-44⑦「能同步的同步」相抵；且 `webui/PROJECTS.md:40` 同步方式选单对四平台都呈「事件（括注：接收端待接通）」，而 gitee/gitlab 无成员事件（`project/PROJECTS.md:59`/`:61`）。 | 接收端未接通前让 `poll` 兜底（event = 契约在位、调度照跑）；或按平台能力限定 event 可选项 + 该模式明示「未接通」。 |
| 5 | Document ownership | 🟡 | 手输加仓载荷两处不一：`project/PROJECTS.md:104`「② 手输保底（`{ address, displayName? }`——裸 git 仓/自建无接口）」vs `gateway/API.md:222`「`{ address, displayName?, owner? }`（手输保底——源缺省 NULL）」与 `webui/PROJECTS.md:32`「提交同端点（`{ address, displayName?, owner? }`）」——本域重述了端点单源已载的载荷且漏 `owner?`。 | §5 该句对齐端点单源（`gateway/API.md` §2.9）逐字，或收掉重复描述只留指针。 |
| 6 | Acceptance criteria | 🟡 | `project/PROJECTS.md:140` AC-44② 行的「项目列表 `?q=` 搜索」标「批内件」，但 §10 用例表（N1–N18/B1/B2/E1/E2）无对位用例 ⇒ 该机检判据无落点。 | §10 补 `?q=` 过滤用例（匹配面 = 显示名/地址 + 零命中），或该腿改指收口轮。 |
| 7 | Acceptance criteria | 🟡 | `project/PROJECTS.md:198`（R67）自承「AC-44④ 的「能写」暂为判定级」——需求档 AC-44④「读写能写」在本批无写对象（`project/PROJECTS.md:46` §3 判据 3 以 `can.write` 读数替代）⇒ 该 AC 中段端到端不可验。 | 维持本裁时同拍收正需求档 AC-44④ 判据措辞（注明「本批判定级、端到端随 B3+」），使「批内件」载体可核。 |
| 8 | Requirements | 🟡 | 仓地址唯一性按「归一两形各自为键」：`project/PROJECTS.md:104`「（https 与 ssh 两形各自为键——跨形重复未去重，登记在册）」——同仓可挂两条而仓地址 = 台账记账键（`docs/server/requirements/PROJECT.md:257`「（仓地址 = 台账的记账键，改了账对不上）」）⇒ 同仓两键；该「在册」无 §12 行（R63–R70 逐行已核）。 | 补跨形归一口径（或明写不做并在 §12 立行），与 AC-44①「重复挂仓拒」判据面说明一致。 |
| 9 | Doc/state | 🔵 | `project/PROJECTS.md:201`（R70）链基值与需求档不符：需求现盘面 =「侧栏合计 ⇒ **十二页**（现盘面——我的 3 + 管理 9）⇒ **十三页**（沙盒余面批——成员沙盒页 `#/me/sandbox`）」（`docs/server/requirements/PROJECT.md:65`），而 R70 记「侧栏合计 十三页」⇒ 十五页 ⇒ 十六（沙盒余面批）——链头应为十二（我的现盘面 3，已核 `public/nav.mjs:14-18`）。 | 链头收正 ⇒ 十二 ⇒ 十五（本批）⇒ 十六（沙盒余面批）。 |
| 10 | Clarity | 🔵 | 两处措辞：`webui/PROJECTS.md:77`「本面三页两表入壳判据随 `webui/STYLE.md` §2.2 口径——实施随正」（本面为三页三表）∥ `webui/PROJECTS.md:24`「（详情响应 §2 场）」句读不通（应为详情响应携 `can` 场）。 | 逐处收正措辞。 |
| 11 | Requirements | 🔵 | `project/PROJECTS.md:59` gitee 行「本批成员表走**组织**端点；企业成员端点 = 未接（本档 §12 余项）」——R69 处置档 = 知会（非提请），而需求 44④ 曾明列 gitee 企业成员接口在册；纯企业（无组织）结构下成员同步不可用（手加保底在）。 | 实施轮先实证 gitee 企业场景并回报；如企业为常态 ⇒ 把 R69 升为提请裁定行。 |

**计数**：🔴 0 ∥ 🟡 8 ∥ 🔵 3

**方法与边界说明**（随档）：本轮上下文未声明项目标准档与文档地图（Document ownership 判据降级——按 Project Guide + 设计档自身回指核）；评审仅读三个在审档 + 行数/指向实证（`src/store/db.mjs` 488 ∥ `src/sandbox/onboarding.mjs` 373 ∥ `src/accounts/audit.mjs` 116 ∥ `public/nav.mjs` 99 ∥ `public/app.mjs` 197 ∥ `public/views-audit.mjs` 165 ∥ `public/i18n.mjs` 138 ∥ `public/style.css` 345 ∥ `bin/thincoder-server.mjs` 192 ∥ `package.json` 30 ∥ 守卫件 163），未作 git diff / 历史考古。

VERDICT: pass

### 轮次 2（评审子代理）

**设计评审 · B2 轮 2（修订后复核）**——对象：① 评审 #277 十一条修复逐条核（1–6 ∥ 8–11 实证；7 = 需求档父侧笔）∥ ② 新范围复核（§13 事件接收端 R63 ∥ KD-SV-127 ∥ §14 项目删除 R64 ∥ KD-SV-128 ∥ 随动：端点 14⇒17 ∥ kind 10⇒11 ∥ 预算 ≈+1570/≈+965）∥ ③ 用户授权两件成章/新差异核。读档 = 六个在审档全读 + 行数实证（audit.mjs=116 ∥ bin=192 ∥ db.mjs=488 ∥ onboarding.mjs=373 ∥ package.json=30 ∥ 守卫件=163——逐值相符）。**核验摘要**：十一条修复全落（1 ✅ 四处读数收正+本评审实证 ∥ 2 ✅ db.mjs >500 软线复核在册 ∥ 3 ✅ credentialKeyPath 单源+N23 ∥ 4 ✅ event=事件+对账同跑+平台门 ∥ 5 ✅ 手输载荷单源指针 ∥ 6 ✅ N19 在册 ∥ 7 ✅ 需求档笔已落 ∥ 8 ✅ 跨形归一四档同拍 ∥ 9 ✅ R70 链头十二⇒十五⇒十六 ∥ 10 ✅ 两处措辞 ∥ 11 ✅ R69 升提请）；新范围随动三条齐（API.md §2.9 十七行 ∥ ACCOUNTS 十一 kind ∥ 预算 1475+95 / 965）——唯 STORE 侧 kind 副本滞后（发现 #2）。

| # | Category | Severity | Issue | Suggestion |
|---|----------|----------|-------|------------|
| 1 | Document ownership | 🔴 | 详情响应 `my.can` 键集两处不一：`gateway/API.md:211` 详情形列 `can: { view, write, manageMembers, rename, editAddress }`（五键、无 `delete`），`project/PROJECTS.md:33` 判定函数为 `can: { view, write, manageMembers, rename, editAddress, delete }`（六键）；`webui/PROJECTS.md:23` 明写「删除项目」钮「仅 `can.delete`（admin）渲染」、`webui/PROJECTS.md:25`「控件显隐 = 服务端 `can` 读数（详情响应携 `can` 场）」⇒ 按端点单源（API.md §2.9）实现则详情响应不携 `can.delete`，R64 删除钮无渲染源（同族：`my` 未列 `admin` 布尔，判定函数含之）。 | 三处择一收口：① `gateway/API.md` §2.9 `GET /api/projects/:id` 行 `can` 键集补 `delete`（与 `capabilitiesOf` 六键逐值同拍，并同拍定 `admin` 布尔是否随 `my` 下发）；或 ② `webui/PROJECTS.md` 删除钮渲法改按会话角色判（服务端仍 `requireAdmin`）。两口径取一，勿并存。 |
| 2 | Document ownership | 🟡 | `store/STORE.md:470` v17 段 kind 枚举仍十 kind（`kind 枚举：source_add ∥ source_update ∥ source_delete ∥ source_sync ∥ source_check ∥ project_add ∥ project_update`＋`:471` `member_add ∥ member_update ∥ member_remove`）——缺 `project_delete`；`accounts/ACCOUNTS.md:69` 已随正「**十一 kind**」（含 `project_delete`（+ projectId/displayName/address/memberCount）），`webui/READINGS.md:31` 亦在列——随正只落 ACCOUNTS 侧，STORE 副本滞后。 | `store/STORE.md` §2 v17 段 kind 枚举补 `project_delete`（十一 kind 逐值对齐；或该行收成纯指针句——单源 = `accounts/ACCOUNTS.md` §2.1）。 |
| 3 | Requirements | 🟡 | 用户授权两件在需求档无落笔：检索（`接收端 ∥ R63 ∥ R64 ∥ 项目删除 ∥ webhook`）无授权/判据记录；AC-44 行（`requirements/PROJECT.md:340`）第 ⑦ 项止于「⑦ **能同步的同步 + 手动钮永在**（有事件平台 = 事件进路；无事件平台 = 定时拉取；手动拉取随时可用）」泛句——无公开端点/验签/登记面判据，⑨ 源表行亦无「删项目」判据；设计侧已成章（§13/§14 + §9 两行 + §10 用例 + §11 边界），需求侧缺授权记录与验收行——需求—设计链缺一环。 | 需求档补两件落笔：授权记录一笔（变更记录）+ AC-44 判据行（或独立 AC）覆盖「公开端点（验签 ∥ 触发 ∥ 忽略面）」与「项目删除（admin 门 ∥ `confirm` ∥ 级联 ∥ 审计）」，与设计 §13/§14 对位。 |
| 4 | Affected-file size annotations | 🟡 | `webui/PROJECTS.md` §3 五随动行只有「（已落盘）」+ 增量、无现读行数：`nav.mjs`（`:57`「（已落盘） | +≈4」）∥ `app.mjs`（`:58`）∥ `views-audit.mjs`（`:59`）∥ `i18n.mjs`（`:60`）∥ `style.css`（`:61`）——#277 同类三处已补（`bin/thincoder-server.mjs` 实读 192 ∥ `package.json` 实读 30 ∥ 守卫件实读 163），此五处仍缺。 | 五处补「实读 N + 预期增量」逐行标注（实施实读为准），体例同一档守卫件行。 |
| 5 | Clarity | 🔵 | §13「待跑旗」与单源锁无落点/重启语义句：`project/PROJECTS.md:222`「单源锁在飞 ⇒ 置「待跑旗」（多次投递合并为一次）；在飞结束 ⇒ 旗在 ⇒ 续跑一次」未写存储面（进程内 ∥ 库）与重启口径（对照：限流/登录锁等均有「重启归零」在案句）。 | 补一句落点与重启口径（单实例 ⇒ 进程内旗/锁；重启 ⇒ 清零、由定时对账兜底——沿软状态先例）。 |

**计数**：🔴 1 ∥ 🟡 3 ∥ 🔵 1

VERDICT: changes-required

### 轮次 3（评审子代理）

**B2 设计轮 3（修复复核）· 发现表**（范围：#280 之 1/2/4/5 修复声明逐条核 + 相抵核查）

核验结论：#280 之 1（`my` 六键 + `admin` 布尔 + 形条目 ∥ webui 渲法源句）、2（STORE「十一 kind」含 `project_delete`）、3（需求档 ⑩⑪ 落笔——父侧笔）、4（webui 五现读——实读逐值相符：nav 99 ∥ app 197 ∥ views-audit 165 ∥ i18n 138 ∥ style 345）、5（§13 存储面句）= **全部已修**。本轮新增相抵一件（🟡——报而不阻）：

| # | Orig# | File | Severity | Status | Notes |
|---|---|---|---|---|---|
| 1 | (new) | `thincoder/docs/server/requirements/PROJECT.md:343` | 🟡 | New: AC-44 ⑩ 判据「未登记/未生成密钥/非 github/过期时间戳 ⇒ 4xx 人话」与设计门面相抵——设计 `E3`（`thincoder/docs/server/design/project/PROJECTS.md:190`「签名不符 ∥ 缺签名 ∥ 密钥未生成 ∥ 未知源 id」⇒ 401/401/401/404）无「非 github ∥ 过期时间戳」两门；`:226`「三忽略面：非 `member` 事件 ∥ 源停用 ∥ `sync_mode='poll'`」⇒ 200 忽略；`:197`「签名无时间戳——重放至多触发一次幂等同步，如实注（§13）」（明载不做投递防重放 ⇒「过期时间戳」判据不可满足） | 以设计为单源收正需求判据（删/改「非 github ∥ 过期时间戳」两条）；或反向补设计两门（与 §11 边界相抵——须先裁） |

**计数**：🔴 0 ∥ 🟡 1 ∥ 🔵 0（#280 五件核验全部已修）

VERDICT: pass

### 轮次 4（评审子代理）

**B2 设计轮 4（修复复核——承轮 3 机读未通过）：AC-44 ⑩ 收正核验**

| # | Orig# | File | Severity | Status | Notes |
|---|---|---|---|---|---|
| 1 | 轮3-相抵① | thincoder/docs/server/requirements/PROJECT.md:352 | 🔴 | Fixed | ⑩ 收正后：「未登记/未生成密钥/缺签名/签名不符 ⇒ 4xx 人话（404/401 逐值 = 设计 §13）；忽略面（非 `member` 事件 ∥ 源停用 ∥ `poll` 模式）⇒ 200 零副作用；github 平台门（事件模式仅 github 可选）」；两陈子句「非 github」「过期时间戳」已删；`:657` 收正记录在册；对位设计 §13 逐值同拍（`thincoder/docs/server/design/project/PROJECTS.md:219`「缺签名 ∥ 不符 ∥ 密钥未生成 ⇒ **401**（零细节）」／「未知源 id ⇒ 404（统一信封）」∥ `:226`「三忽略面：非 `member` 事件 ∥ 源停用 ∥ `sync_mode='poll'`」∥ `:197`「不做投递防重放机制**（签名无时间戳——重放至多触发一次幂等同步，如实注（§13））」）；全树 grep「过期时间戳」残余 = 仅收正记录自述一处（规范文本零残余） |

**相抵核查**：需求档 AC-44 ⑩ ↔ 设计 §13/§11（KD-SV-127） ↔ 变更记录 —— 三向零相抵；无新增相抵。

**计数**：🔴 0 ∥ 🟡 0 ∥ 🔵 0

VERDICT: pass

## §4 用户批准（主 agent）

**代签（主 agent · 2026-10-12 · 全链自动——用户 14:53「B2也跑完」）**

- **授权**：本批 §1.2 全链自动（设计派发 ∥ 评审点火 ∥ §4 代签 ∥ 修正/实施派发 ∥ 收口核销提交）；自缚三条在场（代签仅三条件齐备 ∧ 新范围/口径裁决停下只摆一条 ∧ 破坏性先停）。
- **三条件核**：① 设计评审 pass = 轮 4（#292 机读通过——token 已签发；轮 1–3 之 🟡/🔵 与相抵项均已修复/收正）✔ ② 修复轮全落并父侧核验（修订轮 1 十一条 ∥ 修订轮 2 五件〔`my` 六键+`admin` 布尔 ∥ STORE「十一 kind」∥ 需求档 ⑩⑪ ∥ webui 五现读 ∥ §13 存储面句〕∥ 轮 3 相抵 1 件〔AC-44 ⑩ 收正——已落 `requirements/PROJECT.md:352`，逐条实读核过〕）✔ ③ 新范围与口径裁决零项（R63/R64 = 用户授权成章；R65–R69 = 维持/实证制；R70 = 父侧书账笔，非裁决项）✔。
- **批准范围** = 本批设计（`project/PROJECTS.md` ∥ `webui/PROJECTS.md` ∥ `store/STORE.md` §2 v17 段 ∥ `gateway/API.md` §2.9（十七端点）∥ `accounts/ACCOUNTS.md`（十一 kind）∥ 需求档功能点 44 ∥ AC-44 ①–⑪）之实施——服务端 ≈+1570 ∥ webui ≈+965 ∥ 批内件三档（`prepublishOnly` 58 ⇒ 61）。
- **实施派发** = eng-coder（initial 轮 · 本日 · 按面分派：服务端面 ∥ webui 面——两域文件零重叠，并行）。

## §5 实施记录（eng-coder）

### §5 实施记录（eng-coder · webui 面 · team-projects-permissions 批（B2））

**交付摘要（行数实读——`split("\n")` 口径）**

- 新档三视图：`views-projects.mjs` **415**（我的·项目页 + 共用件两枚：详情弹窗 ∥ 添加仓对话框）∥ `views-admin-projects.mjs` **41**（管理·项目页）∥ `views-git-sources.mjs` **278**（Git 源页 + 添/编/删/确认四窗 + 事件块）。
- 新档 i18n 两部件：`i18n-zh-project.mjs` ∥ `i18n-en-project.mjs` 各 **169**（键各 **154**：`me.projects.*` 40 ∥ `admin.projects.*` 41（含 kind 族 11）∥ `admin.gitSources.*` 73（含六分类 6））。
- 随动：`nav.mjs` **101**（+3 项——我的末位 4 ∥ 管理「成员」后两页 11）∥ `app.mjs` **202**（三 import + 三 `PAGES` 行；`SHELL_PAGES` 零改——三页非壳）∥ `views-audit.mjs` **206**（+ `project_event` 型 + 详情支）∥ `i18n-{zh,en}.mjs` 各 **15**（+1 import + 装配）∥ `i18n-{zh,en}-shell.mjs` +3 键 ∥ `i18n-{zh,en}-system.mjs` +1 键 ∥ `style.css` **352**（+6 规则：结果点 ∥ 徽标两式 ∥ 表内人话行——零新变量 ∥ 零新悬停）。
- C 件：`docs/batches/2026-10-12-team-projects-permissions-ui.test.mjs`（7 测例——IA 直测 ∥ 键集/域界/en 零 CJK/键引用闭合 ∥ 静态零新 ∥ 三页在册 ∥ 三页行为形）。

**验证读数（实跑）**

- `node --test docs/batches/2026-10-12-team-projects-permissions-ui.test.mjs` ⇒ **7/7 绿**。
- `node --test docs/batches/2026-10-08-server-public-structure.test.mjs` ⇒ **6/6 绿**（父侧代改随正后）。
- 键数实读 **854 ∥ 859**（zh 854 = 前置基线 696 + 本批 +158 = 部件 154 + shell 3 + system 1——与守卫件同拍）；`:root` **58** 变量 ∥ `:hover` **8** 条（零新）。
- 未跑：仓套件（`prepublishOnly` 链）——**按纪律不在实施链内跑**，收口轮父侧唯一一次。

**决策透明表**

| 决策 | 依据 | 代价/披露 |
|---|---|---|
| 三页不入视口高壳（`SHELL_PAGES` 零改） | `webui/STYLE.md` §2.2 钉表五页不扩 + 面档 §4 AC-19/20「入壳判据随 §2.2 口径——实施随正」 | 无表头吸附/表尾计数；收口轮浏览器实走留意（评审 report-only 在册） |
| 源选单变更 ⇒ 旧列表作废（超设计字面） | 评审 🟡 硬化——提交体 `sourceId` 取现选中值，防「旧列表挂新源」错挂 | C 件加两断言覆盖（列表清空 + 计数复位） |
| 复制钮复用 `dom.mjs` `copyText`（三路回退单源） | 评审 🔵——同页两处复制面行为须一致 | **out-of-list**：`dom.mjs` 私有 `copyText` 改导出（+1 字，行数 118 不变）——已披露 |
| 六分类键名 camelCase（`errKind.scopeMissing` 等） | 服务端 kind 为 snake_case（`scope_missing`）；桥接映射单点（`readKindLabel`） | C 件逐值断言（六分类映射 + 枚举外原值兜底） |
| 详情弹窗档位修改 = 行内 `select`（非独立窗） | 设计「行内」字面；对话框共用件两枚（设计指定单源住 `views-projects.mjs`） | 默认档位取当前档（load-bearing） |
| 已添加行勾选「禁提交」= `disabled` 勾选 | 设计「标「已添加」且勾选禁提交」——语义可达 + 可断言 | 非「隐藏」——与「已在册标」并置可读 |

**审计与代码评审轮次与终态**

- 内审（explore 只读审计——读交付码 vs 面档/机制档/端点档逐件对位）：🔴 0 ∥ 🟡 0 ∥ 🔵 1（面档 §3 文件账「`i18n.mjs` +≈4」vs 实际装配落两门面——指针级，非行为差异）+ 边界零触（`src/**` ∥ `bin/**` ∥ `package.json` ∥ A/B 件零触）。
- 代码评审（advisor round 1，独立）：**VERDICT pass**——1 🟡（可选：源选单变更随动）+ 3 🔵（复制单源 ∥ 非壳判定 report-only ∥ C 件硬编码键数）。
- **fix round 1**（评审后，三处）：① 源选单 `change` 随动 + C 件两断言；② `dom.mjs` 导出 `copyText` + 源页复用（消单路 clipboard）；③ C 件头注「实读锚」（键数随正点）。复跑 = C 件 **7/7** ∥ 守卫件 **6/6** 绿。**终态 = clean**（评审后零未决 🔴/🟡-must）。

**上抛 / 父侧待办（本实施轮不可触）**

1. 跨批守卫件 `docs/batches/2026-10-08-server-public-structure.test.mjs` = **父侧代改**（跨批闸拒——已裁；落盘后 6/6 绿）。
2. **父侧扫尾清单 = 15 件其他批档面**（全在 `prepublishOnly` 链内，因本批 +5 档 / +158 键 / nav 3⇒4·9⇒11 而红，本实施轮跨批闸拒不可触）：
   - 档集断言 **11 件**（各缺五新档）：`2026-10-06-console-completeness-2` ∥ `-console-list-style` ∥ `-console-modals` ∥ `-console-provider-redo-runtime` ∥ `-console-providers` ∥ `-models-config` ∥ `-server-gateway-webui-deploy` ∥ `2026-10-11-console-tabs-component` ∥ `2026-10-11-sandbox-image-quick-pull` ∥ `2026-10-11-sandbox-pull-by-source` ∥ `2026-10-11-sandbox-volumes-ui`。
   - 指纹 **4 件**（696⇒854 ∥ 701⇒859）：`2026-10-10-server-small-fixes:74-75` ∥ `2026-10-10-runner-admin-console-ui:484` ∥ `2026-10-11-admin-agent-chat-ui:292` ∥ `2026-10-11-console-tabs-component:443-444`。
   - nav 列表 **4 件**（`-console-completeness-2:472-473` ∥ `-console-modals:390-391` ∥ `-console-providers:404-405`——加 `/me/projects` + 两管理页；`2026-10-06-server-i18n:125/164`——`JS_FILES` +3 视图档 ∥ labelKey 14⇒16）——前三件与档集件重叠。
3. 设计侧 drift（本档记录、不代改）：面档 §3 文件账只登记跨批件一件（`webui/PROJECTS.md:62`），未录上列 15 件；`i18n.mjs` 行应为「门面两档 `i18n-{zh,en}.mjs` +2 行」。
4. 估值面实读超线（无行为差异）：`views-projects.mjs` **415**（估 ≈220）∥ `views-git-sources.mjs` **278**（估 ≈300）∥ `views-audit.mjs` **206**（估 ≈177）∥ 新键 **158**（估 ≈120∶面档 §3 同注「实施实读为准」）∥ `style.css` +6 行（估 ≈18——判据 = 零新变量，行数非判据）。

**状态行**：实施完成

### §5 实施记录（eng-coder · 服务端面 · team-projects-permissions 批（B2））

**交付摘要（行数实读——`split("\n")` 口径）**

- 新域七档（`src/project/`）：`projects.mjs` **361** ∥ `platform-client.mjs` **268** ∥ `git-sources.mjs` **266** ∥ `sync.mjs` **239** ∥ `admin-routes.mjs` **223** ∥ `routes.mjs` **101** ∥ `webhooks.mjs` **63**（合计 **1521**；设计 §8 域小计 ≈1475——+46，逐档差以实读为准）。
- 新共享件：`src/store/credential-crypto.mjs` **56**（五导出 = 三件 + `credentialKeyPath` + `dataDir`）。
- 随动：`src/store/db.mjs` **488 ⇒ 558**（v17 段——三表 + 两索引 + 审计 CHECK 十四型重建；估 ≈+70 ✓；>500 软线裁定 = 维持 + 上限 700）∥ `src/sandbox/onboarding.mjs` **373 ⇒ 337**（三件外迁 + 同名再导出——导出面零变、调用方零改）∥ `src/accounts/audit.mjs` **116 ⇒ 119**（+`project_event`）∥ `bin/thincoder-server.mjs` **192 ⇒ 205**（三注册行 + 调度器 start/stop）∥ `package.json` 门禁链 **58 ⇒ 61**（含 C 件名）。
- 批内件：A 件 `…-permissions.test.mjs` **693**（18 腿）∥ B 件 `…-permissions-sync.test.mjs` **688**（13 腿）——设计 §10 用例 N1–N23 ∥ B1–B3 ∥ E1–E4 **三十用例全覆盖**（B2′ = 评审修复轮回归腿）。

**验证读数（实跑）**

- `node --test docs/batches/2026-10-12-team-projects-permissions.test.mjs` ⇒ **18/18 绿**。
- `node --test docs/batches/2026-10-12-team-projects-permissions-sync.test.mjs` ⇒ **13/13 绿**（含 B2′ 同趟重复行幂等 ∥ E2 三读面同形）。
- 装配冒烟（真起进程 + 真 HTTP）：`routes: 104` ∥ 管理面无会话 **401** ∥ 未知源接收 **404** ∥ 停机后端口关（进程退出）——三注册行 + 调度器接线在真装配面在场。
- 未跑：仓套件（`prepublishOnly` 链）——按纪律不在实施链内跑，收口轮父侧唯一一次（与 webui 面同）。

**决策透明表**

| 决策 | 依据 | 代价/披露 |
|---|---|---|
| 手输建仓携 owner ⇒ 自动落 `manage`/`manual` 成员行 | §2.9「负责人」语义 = 成员管理 + 改名；建仓即指派若无成员行则负责人无权可执行 | 与 PATCH owner 径不对称（该径须命中现存成员行）；A 件 N4 断言覆盖 |
| `displayName ≤200` ∥ 地址全空白拒 ∥ 非 github `syncMode=event` ⇒ 400 | §13「github 平台门（事件模式仅 github 可选）」+ 列宽自定 | A 件 N3/E1 覆盖（人话 + 库零变） |
| 基址仅自建平台落库（gitee/github/gitlab 给 `baseURL` 即丢） | §4 三平台基址恒址 | A 件 N3 覆盖 |
| 凭据共享件多导出 `dataDir` | 设计审查意见③「把 `dataDir` 一并抽入共享件成单一出处」——比 §8 行账字面（三件 + `credentialKeyPath`）多一名 | 单源收益 > 字面差；drift 登记见下 |
| 改址回同一键 ⇒ 零改动（撞库判据排自身） | 内审③：「撞」设计指他项目（`API.md` §2.9 :214），自撞未定 | A 件 N9 断言覆盖 |
| `scheduler` 必传（fail-closed） | 代码评审 🔵：缺省自建会让「三径共锁」（§5/§13）静默失效 | 装配面 + 两批内件均已注入；缺参 ⇒ 注册期抛 |
| 拉列表凭据不可解 ⇒ 归 `auth` 自含形 | 代码评审 🟡：三读动作「自含状态形」契约（§2.9/E2）应三面同形 | 修复前此径 500；B 件 E2 补三面同形腿 |
| `applyRoster` 随插随记账 ∥ 合并径（主 + 组织）同守 300 行上限 ∥ 删源括注改「先删项目再删源」 ∥ 成员面共享 `asHttpError` | 代码评审 🔵 四条（撞唯一约束 ⇒ 整趟 500 ∥ §4 仓列表 ≤300 行 ∥ 括注「改挂手输形」无对应端点 ∥ 域内同形助手两份） | B 件 B2′ + A 件 N10 随正；组织径自守 |

**审计与代码评审轮次与终态**

- 内审（explore 只读偏离审计——交付码 vs `project/PROJECTS.md` §2–§14 ∥ `gateway/API.md` §2.9 ∥ `store/STORE.md` §2/§3 ∥ `accounts/ACCOUNTS.md` §2.1 逐件对位）：**🔴 0 ∥ 🟡 2（低）∥ 🔵 1**（改址自撞未定 ∥ owner 自动成员行未载 ∥ `credential-crypto` 多导出 `dataDir`——后两条 = 设计档 drift）；越界 **零**（清单外零改，`public/**` 零触）。
- 代码评审（advisor round 1，独立）：**VERDICT pass**——🟡 3（v17 读点随正属父侧 ∥ 三读面凭据失败不同形 ∥ `db.mjs` 557 > 500 软线——设计已裁定维持）+ 🔵 6。
- **fix round 1**（评审后，七处）：① `sourceTokenOf` 归一（三读面同形）+ E2 补腿；② `applyRoster` 随插随记账 + B2′ 腿；③ 合并径 300 行上限；④ 成员面改引共享 `asHttpError`（去本地副本）；⑤ 删源括注改可达出路 + A 件 N10 随正；⑥ `scheduler` 必传（管理面 + 接收面两处）；⑦ 改址回同一键 ⇒ 零改动 + A 件 N9 断言。
- 复跑 = A **18/18** ∥ B **13/13** 绿；**终态 = clean**（评审后零未决 🔴 ∥ 🟡-must）。

**上抛 / 父侧待办（本实施轮不可触）**

1. **v17 读点随正（跨批闸拒——沿 webui 面 15 件同款）= 我面 13 件**（全在 `prepublishOnly` 链内，因 v17/十四型而红）：版本断言 **12 件**——`2026-10-06-server-gateway.test.mjs:167/186/205`（含失败探针段须 `v: 17` ⇒ `v: 18`）∥ `2026-10-06-console-completeness-2.test.mjs:152` ∥ `2026-10-07-me-keys-redo.test.mjs:120` ∥ `2026-10-07-provider-model-metadata.test.mjs:151` ∥ `2026-10-07-quota-per-model.test.mjs:150` ∥ `2026-10-07-quota-v2-member-models.test.mjs:167` ∥ `2026-10-09-server-console-config.test.mjs:383` ∥ `2026-10-09-server-gemini-openai-preset.test.mjs:263` ∥ `2026-10-10-runner-admin-console-agent.test.mjs:584` ∥ `2026-10-10-team-login-client-access.test.mjs:284` ∥ `2026-10-11-admin-agent-chat.test.mjs:640/641` ∥ `2026-10-11-sandbox-image-sources.test.mjs:598/599` ∥ `2026-10-12-console-reasoning-levels.test.mjs:256`；型面断言 **3 件**（十三 ⇒ 十四）——`2026-10-10-team-login-client-access.test.mjs:274` ∥ `2026-10-11-admin-agent-chat.test.mjs:689` ∥ `2026-10-09-server-console-config.test.mjs:734`（审计下拉「全部 + 十三型」⇒ 十四）。
2. 设计档 drift（本档记录、不代改）：§8 行账 `credential-crypto` 行未含多导出 `dataDir`；§8/§2.9 未载「建仓携 owner ⇒ 自动成员行」与「PATCH owner 须现存成员」两径；§8 估值 vs 实读（域小计 ≈1475 vs 1521）。
3. **R69（gitee 企业场景实证）**：无企业 PAT ⇒ **live 实测不可达（unverified）**；能做的是端点探针——`GET /api/v5/enterprises/<x>/members` ⇒ **401**（路由在服务、鉴权门在前）∥ 伪径 ⇒ **404** ∥ `/api/v5/orgs/<x>/members` ⇒ **404** ⇒「企业成员端点存在且须鉴权」已实证；「企业 vs 组织何为常态」待用户现实裁定。
4. 并批知会：其他在途批（`db.mjs` v18 ∥ 凭据件 v19 面）若并行写同档会撞——我按 v17 追加尾部段落位。

## §6 验证与收口（父代理）

**验证读数（父侧亲跑 · 2026-10-13 01:2x）**

- A 件 `docs/batches/2026-10-12-team-projects-permissions.test.mjs` ⇒ **18/18 绿**（收正后复跑——见下）∥ B 件 `docs/batches/2026-10-12-team-projects-permissions-sync.test.mjs` ⇒ **13/13 绿**。
- 装配冒烟（§5 在册复述）：routes 104 ∥ 管理面无会话 401 ∥ 未知源接收 404 ∥ 停机端口关 ✓。

**父侧收正（本笔 · 父侧直接执行 · 可 revert）**

- A 件 N1/N2 段号断言 `17` ⇒ **`≥ 17`**（4 处，`docs/batches/2026-10-12-team-projects-permissions.test.mjs:133/134/173/174`）：原因 = **v18 段（admin-chat-creds-merge 批 · 实施中）已落 `db.mjs`**，链尾 17 ⇒ 18；原断言钉死绝对值 ⇒ 每遇后续批必红——收成前向兼容后，「本批落地 17」的事实仍由 ≥17 + 三表列面/索引断言共同覆盖。复跑 = **18/18** ✓。

**收口清单（settlement sync）**

- 角色表 ✓（§1–§6 各作者在册）∥ 状态行随 `close` 置「已收口 2026-10-13」∥ 指针 ✓（§5 坐标可解析）∥ 计数以 §5 实读为准 ∥ 变更记录 ✓ ∥ 待办勾兑 = 台账 **#1216**（本批）✓ ∥ 前批遗留交叉核对 = 无挂账 ✓ ∥ 暂缓批复核 = **无** ✓ ∥ 设计槽终消费 ✓（designId 值不落档）。
- **遗留（非闸 · 已挂账）**：① 跨批扫尾 28 件（档集 11 ∥ 指纹 4 ∥ nav 4 ∥ 版本 12 ∥ 型 3）——**休眠态**：`prepublishOnly` 测试链已由用户 2026-10-12 裁定撤除 ⇒ 不入任何门；账 = **#1340**（扫平时机 = v18/v19 落定后一次性）∥ ② 设计档 drift 4 条（面档 §3/§8 登记欠项——后续触面随正）∥ ③ **R69**（gitee 企业场景 live 实证 = unverified——端点探针已确「存在且须鉴权」；「企业 vs 组织何者常态」待现实裁定）。

**结算**：收口（**2026-10-13**）——记录冻结；台账 **#1216 核销**；凭证链终消费 ✓（designId 值不落档——沿纪律）。
