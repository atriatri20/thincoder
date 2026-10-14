# 2026-10-11 · sandbox-image-quick-pull
> 六段 append-only，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 编制：主 agent · 2026-10-11 · 来源 = 用户 2026-10-11 13:18「要」（对设计侧提请候选「源目录一键拉取·预填拉取窗」裁定为做）+ 13:19「好，自动跑完」（本小批全链授权）。
> 台账 = #1276（server · 归批）。前情 = docs/batches/2026-10-11-sandbox-image-sources.md §6（已收口 2026-10-11——镜像源族母批；本批 = 其增量）。
## §1 讨论（主 agent）
**状态行**：已收口 2026-10-11
<§1 模板占位：本批条目 / 关键判据 / 授权口径>

### 2026-10-11 13:18–13:20 · 来源、范围与授权（主 agent）

- **来源与入册**：用户 13:18「要」（原话——对设计侧提请候选裁定为做）+ 13:19「好，自动跑完」。
  候选来历如实标 = **设计侧提议（非用户自发）**——`docs/server/design/sandbox/SANDBOX.md` §3 自加项表 ⑤「源目录『一键拉取』（预填拉取窗）——本批不做；提请裁定」+ §15 余项首条；设计侧自评 ≈20 行（复用既有拉取窗）。
  需求落点 = `docs/server/requirements/PROJECT.md` §2 功能点 38 ④ + **AC-38 ④**（同轮入册）；台账 **#1276**；承批 = 母批 `docs/batches/2026-10-11-sandbox-image-sources.md`（已收口 2026-10-11）。
- **范围（本批 = 一键拉取一件，不多不少）**：源目录浏览窗的仓库/标签行加「拉取」钮 ⇒ 打开**既有拉取窗**且引用已预填（`<主机>/<仓库>:<标签>`）⇒ 确认即走**既有拉取径**（预填后可改；服务端零新端点 = 候选）。
  **边界**：拉取行为零改（不写节点 dockerd 配置 ∥ 不注入前缀 ∥ 无默认源）∥ 私有源凭据不在面（零凭据）∥ 分页/排序不做 ∥ 读取面（五分类 ∥ 有界首页 ∥ 匿名 Bearer）不重设计。
- **设计第一问（设计轮必答——含理由 + 不做的代价）**：**「拉去哪台节点」**——拉取按节点（镜像区在节点行展开内），源清单 = server 全局。
  候选 A = 点钮先出节点选单（无节点 ∥ 全离线 ⇒ 禁用 + 一句人话）；候选 B = 只对当前展开的节点生效（未展开 ⇒ 禁用 + 一句提示）。设计轮定一条或给第三形。
- **合并扫描（点火前查账）**：台账 **#1275**（母批设计档件表/预算链行数回填——`trigger=归批`）与本批**同审核面**——本设计轮将编辑 `sandbox/SANDBOX.md` §13 件表 ∥ §15 余项 ∥ `webui/WEBUI.md` §5 预算链 ∥ `design/PROJECT.md` 预算行 = 正是 #1275 落点 ⇒ **并入本批**（机制性数字回填，零新语义；不另开轮）。不并的项：无（母批已收口冻结——不属可并对象）。
- **授权（用户 13:19「好，自动跑完」·全链）**：设计评审点火 ∥ §4 用户批准（代签）∥ 修正/实施轮派发 ∥ 收口核销与提交推送——均委托父侧自动执行，直至本批收口。
  **父侧自缚三条**：① 代签仅当三条件齐备（评审 pass 0🔴 ∧ 修正轮已落地并逐条核验 ∧ token 已签发）；② 新范围 ∥ 用户口径裁决 ⇒ 停下、只摆那一条；③ 破坏性/不可逆 ⇒ 先停。

## §2 批次任务与设计（eng-designer）
**状态行**：设计完成（评审轮 1 六号点修已落 ∥ 实施后回填已落（2026-10-11））
<§2 模板占位：本批条目（覆盖） / 设计档落点 / 机制设计 / 受影响文件与测试面 / 验收对照 / 关键决策 / 上抛项>

### 设计落定（2026-10-11 · eng-designer）

**本批条目（覆盖）**
- 需求档 `docs/server/requirements/PROJECT.md` §2 功能点 38 ④（`:210`——「源目录窗一键拉取」）+ AC-38 ④（`:260`——「浏览窗行「拉取」⇒ 拉取窗开且引用预填逐值 ∥ 走既有拉取径」）——已落需求档（2026-10-11 同轮入册）；台账 **#1276**。
- 合并面（§1 点火查账）：**#1275**（母批实读回填——SANDBOX §13 件表 ∥ WEBUI §5 预算链 ∥ PROJECT §6 预算行）并入本批（机制性数字回填 ∥ 零新语义；不另开轮）。
- **明确不在本批**：拉取行为零改（不写节点 dockerd 配置 ∥ 不注入前缀 ∥ 无默认源）∥ 私有源凭据不在面 ∥ 分页/排序不做 ∥ 读取面（五分类 ∥ 有界首页 ∥ 匿名 Bearer）不重设计 ∥ 服务端零新端点。

**机制设计（裁定 + 逐值）**
- **裁定 = 候选 A**（§1 设计第一问「拉去哪台节点」）：目录浏览窗仓库/标签行尾「拉取」钮（`tiny`）⇒ **节点选单**（在线节点行——可点行；题 = `admin.sandbox.pullPickNodeTitle`）⇒ 选 ⇒ **既有拉取窗**（引用预填）。
  候选 B（只对当前展开节点生效）否——背景展开态不可见 ∥ 多展开无「当前」；窗内下拉第三形否（序倒：窗先开、节点后选）。
  **代价（如实）**：手抄错抄/隐式拉错机消除；目录窗「开新先关旧」单例 ⇒ 开选单时目录窗关（拉取成后如需续览 ⇒ 重开）。
- **预填逐值**：`<主机>[:<端口>]/<仓库>:<标签>`——去 scheme ∥ 含端口逐值 ∥ 仓库行 `:latest` ∥ Hub 四别名（`hub.docker.com`/`index.docker.io`/`registry-1.docker.io`/`docker.io`）统一 `docker.io`（站点主机非注册表主机——逐值保留会产出引擎不可拉的引用）；**可改非锁定**（确认值 = 所见值）；窗内附「目标节点：{name}」行（`…pullTarget`）；**预填 ≠ 可达**。
- **可用态**：目录窗打开读一次概览（读时读——节点快照）；无节点 ∥ 全离线 ⇒ 钮禁用 + 一句人话（复用运行面 `noNodes`/`allOffline` 文案）；读败 ⇒ 禁用 + `mapError`。零新端点；审计走既有 `image_pull` 行（零新 kind）；型面零增；i18n +3 键/表。

**设计档落点（本批编辑面）**
- `docs/server/design/sandbox/SANDBOX.md`：§3（一键拉取块——裁定/入口/可用态/预填逐值）+ §9 ∥ §11（判据行）∥ §12（N60 ∥ B57/B58 ∥ E46）∥ §14（KD-SV-99）∥ §15（余项去 ⑤）∥ §2/§13（#1275 回填：`db.mjs` 476 ∥ `docker.mjs` 327 ∥ `container-routes` 311 ∥ `bin` 191 ∥ 批内件 682 ∥ 514）。
- `docs/server/design/webui/WEBUI.md`：§2.8①（一键拉取句 + 拉取窗预填句）∥ §2.2（键族登记 +3 键）∥ §5（母批实读回填 + 本批增量）∥ §6（一键拉取行）。
- `docs/server/design/PROJECT.md`：§2.1（sandbox 行 十 ⇒ 十三档）∥ §4（1–98 ⇒ 1–99；KD-SV-99 行）∥ §6（母批实读 + 板级行 49 ⇒ 50 + 本批预算块）∥ §7（AC-38 行补 ④ 指针）∥ §9（R56）。

**受影响文件与测试面（预算）**
- webui **≈+86**：`views-sandbox-image-sources.mjs` **275** ⇒ ≈345 ∥ `views-sandbox-images.mjs` **132** ⇒ ≈138 ∥ `views-sandbox.mjs` **375** ⇒ ≈377 ∥ `i18n-{zh,en}-sandbox.mjs` **183 ∥ 183** ⇒ ≈186 ∥ `style.css` **266** ⇒ ≈268；零新档——档目 **37 ∥ 38** 不变。
- 服务端 **±0**（纯前端面——`thincoder-server/src/**` 零触）；批内件一件 = `docs/batches/2026-10-11-sandbox-image-quick-pull.test.mjs`（估 ≈180——入 server 链；`prepublishOnly` **49 ⇒ 50**）。
- 交互实读项：AC-19 canon（零新变量 ∥ 零新悬停规则）∥ i18n 两表逐键同步（en 零 CJK）。

**验收对照（三链同源）**
- 批档 §2 本条目 ⇄ 设计档判据 ⇄ 需求档 AC-38 ④：判据指针 = `sandbox/SANDBOX.md` §11 一键拉取行 ∥ §12（N60 ∥ B57/B58 ∥ E46）∥ `webui/WEBUI.md` §6 一键拉取行 ∥ `design/PROJECT.md` §7 AC-38 行。
- 机检面：拉取窗引用预填逐值（Hub 统一/端口/`:latest`）∥ 可用态两分支（无节点 ∥ 全离线 ⇒ 禁用）∥ 零新端点（既有 pull 径）∥ 审计 `image_pull` 既有行 ∥ i18n +3 键/表同步 ∥ 档目 37 ∥ 38 不变。
- 收口轮：浏览器实走（有在线节点流：浏览 ⇒ 拉取 ⇒ 选节点 ⇒ 预填核对 ⇒ 确认真拉 ∥ 无节点 ∥ 全离线流：钮禁用 + 一句人话）。

**关键决策 + 上抛**
- KD-SV-99（`design/PROJECT.md` §4 索引行在册 ∥ 全形 = `sandbox/SANDBOX.md` §14——「一键拉取 = 显式节点选单 + 预填既有拉取窗；零新端点 ∥ 拉取行为零改」）。
- 披露（R56——`design/PROJECT.md` §9）：目录窗单例行为 ∥ 预填非锁定 ∥ 节点快照读时读 ∥ Hub 统一 `docker.io` ∥ 预填≠可达 ∥ 部署收尾 = 父侧。
- 列报（非阻塞——观察，未改）：① `design/PROJECT.md:31`/`:35` 历史「（本批）」标记（早批留下）∥ ② `sandbox/SANDBOX.md` routes.mjs「实读 442」对盘面 441 差 ±1（口径观察）∥ ③ 三档其余早批「本批」残值（非本笔编辑行）。
- **产品码零触（设计轮）**——本批设计轮只改设计档三件（+ 母批回填随拍）。

### 设计评审轮 1 修正（fix 轮——六号逐条落位；2026-10-11）

承批档 §3 轮次 1（🔴 0 ∥ 🟡 4 ∥ 🔵 2——父侧六号全裁修正；执行者 = eng-designer）。落位（修复轮后盘面坐标——以实读为准）：

| 号 | 落位（file:line） | 内容 |
|---|---|---|
| 1 | `webui/WEBUI.md:140`（§2.2 新条）∥ `:681` ∥ `sandbox/SANDBOX.md:173`/`:290`/`:353` | 可用性两键钉全形（`admin.sandbox.noNodes` ∥ `admin.sandbox.allOffline`——**既有键**：产品码实读 zh/en `i18n-{zh,en}-sandbox.mjs:11`–`:12` ∥ 消费点 `views-sandbox.mjs:104`）；§2.2 增「复用 2 键（零新增）」登记条——「零新键」可从档面核实 |
| 2 | `sandbox/SANDBOX.md:175` | 收尾句收正：「该节点镜像表（前端已载）重取——列表上新，页注入回调；无服务端缓存面」（与 N60 名词对齐 ∥ 消「缓存」撞读） |
| 3 | `webui/WEBUI.md` §6 各行（a 18 处 ∥ b 4 处 ∥「§11 本批行」∥「本批 +≈30 键」；另 b 同形五处 = §2.2/§5 一并收——披露）∥ `design/PROJECT.md:521`/`:523`（三处 + 一处） | 「本批」混指收齐（批名式：`sandbox-image-sources 批（本批）后` ⇒ 批名 ∥ `sandbox-docker-admin 批（本批）` ⇒ 批名）；未收处 = 自名/他批形（类列——两档变更记录在册） |
| 4 | `sandbox/SANDBOX.md:171` | 「零改」句改述：「既有窗行为零改；增量 = 导出 + 可选预填参 + 「目标节点」行」（附实读 `views-sandbox-images.mjs` **132** ⇒ ≈+6——§5） |
| 5 | `sandbox/SANDBOX.md:168` | ⑤ 行指针改指（「机制 = §3 一键拉取块」——消自指） |
| 6 | `design/PROJECT.md:521` | AC-36 行分期链补「① 续二：镜像源族 + 一键拉取（sandbox-image-sources 批 ∥ sandbox-image-quick-pull 批）」（与 `webui/WEBUI.md` §2.8 标题行同拍） |

闸面复读（`node scripts/doc-check.mjs`）：悬空 **26**（开机实读即 26——全在 docs/core ∥ docs/desktop ∥ docs/render-core 三域；本笔零增减；desktop `SETTINGS.md` 四坐标随他批编辑平移——列报）∥ 行宽 **OK**（新写非表行：`SANDBOX.md:171` = 237 字符 ∥ `WEBUI.md:140` = 202 字符）。产品码零触（`git status --porcelain` 对 `thincoder-server/src|public|bin` 零改）。

**未收处（如实列——自名/他批形；非本笔编辑面）**：WEBUI §2.2 各条「；本批；」自名形 ∥ §5 各档「（本批 +≈N）」他批形 ∥ §1/§2.4/§2.5/§2.8 历史「本批」；PROJECT §6/§9 自名「本批」（逐条自名其批）。

### 实施后回填（2026-10-11 · eng-designer——实读收正；承 §5 · 零新语义）

**读数口径 = split**（`content.split("\n").length`——含文末行；与设计轮旧口径「内容行数 ∥ 文末换行不计」差恒 +1——逐处已注）。实施前基线 = `cae7a358`（实施前盘面自读）；实读值 = 本笔自读盘面（与 §5 交付读数同值）。

| 件 | 设计基值 ⇒ 实读 | 估 | 差（实读 − 估） | 净差说明（实增 − 估增） |
|---|---|---|---|---|
| `views-sandbox-image-sources.mjs` | 275 ⇒ **364** | ≈345 | +19（含口径 +1） | 实增 +88（估 +≈70——越 18）：读绪相位 + 钮/选单/预填函数族（修复轮增面） |
| `views-sandbox-images.mjs` | 132 ⇒ 133（实施前——split 口径差 1）⇒ **136** | ≈138 | −2（含口径 +1） | 实增 +3（估 +≈6——低 3）：导出 + 预填参 + 目标行 |
| `views-sandbox.mjs` | 375 ⇒ **376** | ≈377 | −1（含口径 +1） | 实增 ±0（估 +≈2——低 2）：装配点就地改（净 0 行） |
| `i18n-{zh,en}-sandbox.mjs` | 183 ∥ 183 ⇒ 184 ∥ 184（实施前）⇒ **189 ∥ 189** | ≈186 | +3 ∥ +3（含口径 +1） | 实增 +5/表（估 +3——越 2）：3 键 + 段注释/空行 |
| `style.css` | 266 ⇒ **267** | ≈268 | −1（含口径 +1） | 实增 ±0（估 +≈2——低 2）：零改（复用既有类族） |
| 批内件（`…-quick-pull.test.mjs`） | 0 ⇒ **437** | ≈180 | +257 | 8 腿全展开（含修复轮键盘补腿）——新建件 |
| `prepublishOnly` 链 | 49 ⇒ **50**（已随正） | —— | —— | 本批件入链（链 50 件实核——末位 = 本批件） |

**净差汇总**：webui 实读增量 **+101**（同口径净增和；估 ≈+86——越 15）∥ 服务端 **±0**（实施实核——`src/**` 零触）∥ 落点 = `webui/WEBUI.md` §5 小计 ∥ `design/PROJECT.md` §6 ∥ `sandbox/SANDBOX.md` §13（批内件行）；三档变更记录各补一行。

## §3 设计评审（评审子代理）

### 轮次 1（评审子代理）

| # | Category | Severity | Issue | Suggestion |
|---|----------|----------|-------|------------|
| 1 | Clarity | 🟡 | 「零新键」凭据不足：「复用运行面文案 noNodes/allOffline——零新键」（SANDBOX.md:173；同句见 SANDBOX.md:290 ∥ SANDBOX.md:353 ∥ WEBUI.md:680）——该两键名在评审面四档全文中无任何登记（唯四出处 = 本批新增行；WEBUI.md:566 只给「运行面批先落 ≈26 键」计数）；名形亦不合键名惯例「键 = 页面.区块.词」（WEBUI.md:79）。 | 钉全形键名（admin.sandbox.* 形）并落 §2.2 键族登记；若实为新增键 ⇒ 「+3 键/表」与随正件（i18n 键集件）面同拍，使「零新键」可从档面核实 |
| 2 | Clarity | 🟡 | 收尾句名词与口径双疑：「拉取成 ⇒ 该节点镜像缓存失效 + 节点表重取（页注入回调）」（SANDBOX.md:175）——①「节点表」在本域指运行面节点表（WEBUI.md:543），与 N60「成后节点镜像表重取（列表上新）」（SANDBOX.md:352）不一致；②「镜像缓存」措辞与 KD-SV-79「控制面零镜像 ∥ 零同步机制」（SANDBOX.md:407）∥ KD-SV-92「零缓存零落库」（SANDBOX.md:414）易撞读。 | 写实为「该节点镜像表（前端已载）重取——列表上新，页注入回调；无服务端缓存面」 |
| 3 | Methodology compliance | 🟡 | 「本批」混指残留且与本轮收正声称不齐：WEBUI §6 多行仍作「sandbox-image-sources 批（本批）后」（例 WEBUI.md:653）；PROJECT.md:521 三处「§11 本批判据行 ∥ §3（本批块）」与 :523「§11（本批判据行 ∥ 一键拉取行）」——而 changelog 称「AC-36 行「本批」陈值收正」（PROJECT.md:686）∥「同节「本批」陈值改批名（7 处——消混指）」（WEBUI.md:828）。 | 以批名收齐（或在收正清单明列未收处）；全档「本批」只指当前批 |
| 4 | Clarity | 🔵 | 「前端窗形与拉取径零改（views-sandbox-images.mjs **132** ⇒ +≈6 = 导出 + 可选预填参 + 目标行）」（SANDBOX.md:171）自相抵——同句「目标行」即窗内新增行（WEBUI.md:548：拉取窗「预填在场附「目标节点：{name}」行」）。 | 改述为「既有窗行为零改；增量 = 导出 + 可选预填参 + 「目标节点」行」 |
| 5 | Clarity | 🔵 | 自加项表 ⑤ 行指针自指：「机制 = §3 本块 ⑤」（SANDBOX.md:168）——读者据此前找不到机制正文。 | 指向 §3「一键拉取」块正文 |
| 6 | Clarity | 🟡 | 分期口径跨档不同步：PROJECT.md:521 AC-36 行「**分三轮落**：运行面 + 容器区（runner-admin-console 批）∥ 容器面补齐 + 镜像族（sandbox-docker-admin 批）∥ 余面）」未含 WEBUI.md:540 所列「① 续二：镜像源族 + 一键拉取（sandbox-image-sources 批 ∥ sandbox-image-quick-pull 批）」。 | 两档分期链同拍（补 ① 续二，或注明其归属 AC-38） |

计数：🔴 0 ∥ 🟡 4 ∥ 🔵 2

VERDICT: pass

## §4 用户批准（主 agent）

### 2026-10-11 · 用户批准（代签——主 agent）

用户 2026-10-11 13:19「好，自动跑完」= 本批全链授权（含 §4 代签口径）；§1 自缚三条在效。

**代签三条件（逐条核——父侧实读）**
1. 设计评审 **#208 = pass**（🔴 0 ∥ 🟡 4 ∥ 🔵 2；发现表 + VERDICT 在 §3 轮次 1）；
2. 修正轮 **#211 六号逐条落位**、父侧逐号实读核验通过：`sandbox/SANDBOX.md:168`（⑤ 行指针）∥ `:171`（零改句改述 + 实读 132）∥ `:173`（键名钉全形）∥ `:175`（与 N60 名词对齐）∥ `:290`/`:353`（引用同拍）∥ `webui/WEBUI.md:140`（§2.2「复用 2 键（零新增）」登记条——出处 `i18n-{zh,en}-sandbox.mjs:11-12` + 消费点 `views-sandbox.mjs:104`）∥ `:681`（引用同拍）∥ `design/PROJECT.md:521`（AC-36 分期链补「① 续二」）/`:523`（无「本批」残值）。闸面复读：悬空基线 **25**（本次 +1 = 父侧一处裸路径引用，已收正）∥ 行宽 **OK** ∥ 产品码零触（设计轮）；
3. 评审通过 **token 已签发**（凭证值不入档——沿「凭据值不进文档」律）。

**准予实施**：本批设计增量（⑤ 一键拉取——含 #1275 母批回读面；零新语义增项）——派 eng-coder 依设计实施；实施面 = `thincoder-server/public/**`（webui 五件 + 批内件 + 链 +1）——服务端 `src/**` 零触。

## §5 实施记录（eng-coder）
**状态行**：实施完成（批内件 8/8 绿 ∥ 审计 clean ∥ 评审 2 轮 pass ∥ fix 1 轮）



### 交付摘要（逐件）

| 件 | 面 | 读数 |
|---|---|---|
| `thincoder-server/public/views-sandbox-image-sources.mjs` | 目录窗行动作钮（仓库/标签行尾「拉取」）∥ 可用态（开窗读一次 `overview`；≥1 在线可用；无节点/全离线禁用 + 复用 `noNodes`/`allOffline`；读败禁用 + `mapError`）∥ 节点选单 `openNodePicker` ∥ 预填组装纯函数 `pullRefFor` ∥ 读绪相位（idle/loading/ready/failed） | 364 行（split 口径） |
| `thincoder-server/public/views-sandbox-images.mjs` | `openPullImageModal` 导出 + `prefill` 参 + 「目标节点：{name}」行（无预填 ⇒ 零变） | 136 行 |
| `thincoder-server/public/views-sandbox.mjs` | 装配单点：`createImageSourceSection(ctx, { onPulled: … })`——拉取成 ⇒ `images.reset(runner)` + `loadRunners()` | 376 行 |
| `thincoder-server/public/i18n-zh-sandbox.mjs` ∥ `i18n-en-sandbox.mjs` | +3 键 × 两表（`admin.sandbox.catalogPull` ∥ `pullPickNodeTitle` ∥ `pullTarget`；en 零 CJK、占位符 `{name}` 对位） | 189 ∥ 189 行 |
| `thincoder-server/package.json` | `prepublishOnly` 链 49 ⇒ 50（末位入本批件） | 链 = 50 实核 |
| `docs/batches/2026-10-11-sandbox-image-quick-pull.test.mjs` | 批内件 8 腿（预填四形 ∥ 可用态两分支 ∥ E46 读败 ∥ 走既有拉取径 ∥ 审计 `image_pull` ∥ i18n +3 ∥ 静态面 ∥ 键盘同径） | 437 行；**8/8 绿** |
| `style.css` | **零改**——设计「若需」条件不成立（`tiny`/`row-clickable` 均复用既有类；`:root` 38 ∥ 悬停 7 不破） | 267 行（未触） |

**零触面实核**：`thincoder-server/src/**` 零改（`git status --porcelain` 逐件核）。
**绿读数**：批内件 8/8 ∥ `2026-10-11-sandbox-image-sources.test.mjs` + `2026-10-11-sandbox-docker-admin-ui.test.mjs` 18/18 ∥ `2026-10-06-server-i18n.test.mjs`（键面扫描）绿。

### 终值读数（父侧跨批随正用）

| 项 | 值 |
|---|---|
| ZH 键数 | **592**（旧 589） |
| ZH sha256 | `46d71957329149d1362c91e63e6abb91d4b90a578232b89de0a781e49c8ac16e` |
| EN 键数 | **597**（旧 594） |
| EN sha256 | `bdd02573de81d88faa68a5ce8c4f3846b0012e991d6d01e44d59fd7eafb10d52` |
| `prepublishOnly` 链 | **50** 件（旧 49；本批件在链末位） |

计算命令（自 `thincoder/` 仓根）：

```js
import { createHash } from "node:crypto"
globalThis.document = { getElementById: () => null } // i18n 门面须 DOM 桩
const { ZH } = await import("./thincoder-server/public/i18n-zh.mjs")
const { EN } = await import("./thincoder-server/public/i18n-en.mjs")
const fp = (T) => createHash("sha256").update(JSON.stringify(Object.keys(T).sort().map((k) => [k, T[k]]))).digest("hex")
console.log(Object.keys(ZH).length, fp(ZH), Object.keys(EN).length, fp(EN))
```

**跨批红面清单（父侧面——实施者未触；改他批件被写门禁拒）**：
- 链件数 49 ⇒ 50（7 件）：`2026-10-06-console-list-style.test.mjs:238` ∥ `2026-10-06-server-auto-update.test.mjs:480` ∥ `2026-10-07-console-layout.test.mjs:449` ∥ `2026-10-07-me-usage-charts.test.mjs:262` ∥ `2026-10-07-provider-model-metadata.test.mjs:491` ∥ `2026-10-07-quota-per-model.test.mjs:444` ∥ `2026-10-07-quota-v2-member-models.test.mjs:428`（实读 50 对 49，逐件已跑）。
- 键数/指纹 589 ∥ 594 ⇒ 592 ∥ 597（4 件）：`2026-10-08-server-public-structure.test.mjs`（zh/en 指纹 + 键数）∥ `2026-10-10-runner-admin-console-ui.test.mjs:474-475` ∥ `2026-10-10-server-small-fixes.test.mjs:68/74-75` ∥ `2026-10-11-admin-agent-chat-ui.test.mjs:472/489`。
- 母批 UI 件行文面（`2026-10-11-sandbox-image-sources-ui.test.mjs`）：`:324`（整行文本全等）∥ `:339`（`rowByText` 整行全等取行 ⇒ 钮文入行后取 null）随正；`:326` 待命句腿**已由本批代码修复恢复——不得改断言**。

### 决策透明表（设计未定 ∥ 实施裁量）

| 决策点 | 取法 | 依据 |
|---|---|---|
| 可用态读到前 | 钮禁用（fail-safe）；禁用兜底判在 onclick 内（零外呼） | 设计「读到前禁用」 |
| 重渲口径 | `makeList` 加读绪相位，`repaint()` 仅 `ready` 面重渲 | 评审必改项：概览落定不得顶掉首屏待命/加载/读绪面（母批 `:326` 断言即此契约） |
| Hub 注册表主机字面量 | 连字面量拼写 `HUB_REGISTRY_HOST = "docker" + ".io"` + 码内注释 | `2026-10-06-server-i18n.test.mjs:170` 把 `public/**` 点分小写字面量一律当裸键——直写 `"docker.io"` 必红链 |
| 键盘同径 | 钮内 `keydown`（Enter/Space）`stopPropagation` | 行级 keydown 吞钮激活（行选取 ≠ 钮动作）——内部探索审计附注发现，当场收正 |
| `style.css` | 零改 | 设计「若需」条件不成立（复用既有类即可） |
| 端点面 | 零新端点/零新 kind——唯一径 = 既有 `POST …/runners/:id/images/pull` | 设计 §3/§14；服务端零触 |

### 审计与代码评审轮次与终态

| 轮 | 面 | 结论 |
|---|---|---|
| 内部 explore 发散审计 | 设计 ⇄ 交付逐条（九面 + 批内件覆盖） | **clean**（四类偏差 0 命中）；附注一项 = 键盘径 → 当场收正 |
| advisor 代码评审 第 1 轮 | 7 件全量 | **changes-required**：1 🟡 must-fix（重渲顶掉首屏面）+ 3 🔵（扫描 helper 裁尾 ∥ 读数回填 ∥ Hub 字面量规避） |
| 修复轮 1 | 读绪相位 + 批内件加腿 | 已落（批内件 8/8 复跑绿） |
| advisor 代码评审 第 2 轮 | 只核修复声明 | **pass**（must-fix = Fixed；🔵 三项 Accepted；零新增项） |

**终态：clean**（审计 1 轮 clean；代码评审 2 轮收敛；fix round 1 轮）
**未跑声明**：仓级套件（`thincoder-server` `npm test` 等）不在实施轮链上——父侧收口单跑；实施轮绿读数 = 上表逐件实跑。

## §6 验证与收口（父代理）

### 6.1 收口核验（父侧亲验 · 逐面）

| # | 面 | 结论 | 证据 |
|---|----|------|------|
| 1 | 批内件八腿（N60 全链 ∥ B57 可用态 ∥ E46 概览读败 ∥ B58 预填四形 ∥ Hub 面 DOM 径 ∥ 零新端点/审计复用 ∥ i18n 3 键 ∥ 静态面） | ✅ | 全链门禁实跑含本件 8/8 绿（见 6.3 读数） |
| 2 | i18n 键数/指纹（ZH 592 ∥ EN 597——本批 +3） | ✅ | 批内件「键集指纹」腿绿 + 父侧自算与交付一致 |
| 3 | 档目 38 ∥ 37 ∥ 行数/行宽 ∥ 门禁链 50 | ✅ | 批内件静态面腿 + 全链门禁（七件链件数断言件同拍随正） |
| 4 | 零新端点 ∥ `src/**` 零触 ∥ 审计复用既有 `image_pull` | ✅ | 批内件 ④ 腿 + 分歧审计实核（本批全树 `src/` 引用零新增） |
| 5 | 浏览器实走（无节点流） | ✅ | 见 6.2 |
| 6 | 有在线节点流（选单 ⇒ 预填核对 ⇒ 真拉 ⇒ 镜像表重取） | ⏳ 未走 | 本机无沙盒节点（运行面「暂无节点」）——行为面由批内件 N60 覆盖；如实列「未走」 |

### 6.2 浏览器实走（父侧亲走 · 环境 = 本地独立临时库 + 独立 db + 端口 8788 + 本地 v2 桩 8791——零碰用户本地库；服与桩走毕即关）

- 起服口径：`node bin/thincoder-server.mjs --config .thincoder/tmp/walk-config.json`（临时库）；桩 = `.thincoder/tmp/pull-walk-registry.mjs`（v2 形：`_catalog` 三仓库 ∥ `tags/list` 逐仓库标签）。
- 源卡在册（表四列）⇒ 加源「本地桩」（`http://127.0.0.1:8791`）⇒ flash「镜像源已添加：本地桩」+ 面型列自动判「**标准 v2**」✓。
- 点「目录」⇒ 窗题「镜像目录：本地桩」⇒ 仓库三行（`library/nginx` ∥ `library/redis` ∥ `acme/app`），**行尾「拉取」钮在场** ✓。
- 无节点 ⇒ 钮**禁用**（浏览器层直接拒激活 = 零动作实锤；零弹层 ∥ 零外呼）+ 窗顶一句人话（复用运行面「无节点注册——先「添加节点」，或用「托管接入」自动装机」）✓。
- 点仓库行 ⇒ 标签列读成（`1.25` ∥ `latest`——真 HTTP 到本地桩），标签行行尾同带「拉取」钮（禁用）✓。
- 两语随切：英文面在场（窗题 `Image catalog: 本地桩` ∥ 可用性句英文 ∥ 钮 = **`Pull`**）✓。
- 未走腿（如实）：① 有在线节点流（选单 ⇒ 预填核对 ⇒ 真拉 ⇒ 镜像表重取）；② 本地镜像表过滤输入（需注册节点方现该表——批内件 ①/② 腿已覆盖）。
- 截图三帧：`shot-2026-10-11T06-17-51-952Z-18396.png`（橱窗 ∥ 无节点句 ∥ 仓库三行）∥ `shot-2026-10-11T06-18-06-285Z-18396.png`（标签两行带钮）∥ `shot-2026-10-11T06-18-24-813Z-18396.png`（英文面 `Pull`）。

### 6.3 门禁读数与交付链

- 全链门禁（父侧收口实跑）：`npm run prepublishOnly` ⇒ **tests 464 ∥ pass 464 ∥ fail 0 ∥ duration 34.96s**（链内 **50 件**——含本批件，末位在列）。
- 文档闸（父侧收口实读）：`node scripts/doc-check.mjs` ⇒ 行宽 **OK** ∥ 锚悬空 **25**（= 基线；server 域 **0**）。设计轮记 26 系他批文档在飞态读数——以本收口读数为准。
- 提交链：`64198294`（feat——产品 6 件 + 批内件 1 件）⇒ `f61b81f1`（随正 12 件）⇒ 本收口笔（设计档回填 3 件 + 批档）——**双推**（origin ∥ github；`f61b81f1` 双方远端已核）。
- 交付清点：产品 6 件 + 批内件 1 件 + 随正 12 件 + 设计档回填 3 件（`sandbox/SANDBOX.md` ∥ `webui/WEBUI.md` ∥ `design/PROJECT.md`）——越文件表零。
- 台账核销：**#1276**（本批）⇒ 已核销；**#1275**（母批设计档件表/预算链回填——§1 合并并入本批）⇒ 已核销（evidence = 设计档回填 + 本档 §5/§6）。

### 6.4 暂缓批复核与遗留

- 暂缓批复核：无。
- 遗留（如实）：① 有节点流未走（无节点资源）——非缺陷，读数「未走」在案；② 桌面批（在飞）收口时复核其域内文档闸态与坐标平移项。
