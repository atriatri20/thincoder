# 2026-10-11 · sandbox-volumes
> 六段 append-only，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 编制：主 agent · 2026-10-11 · 来源 = 用户 2026-10-11 21:18–21:22 实走对话（卷字段困惑 ⇒ 三件点名 + 21:22「先按不考虑加挂的原方案开批吧」）。
> 台账 = #1291（server · 归批）。前情 = 无（独立批）。
## §1 讨论（主 agent）
**状态行**：已收口 2026-10-12
<§1 模板占位：本批条目 / 关键判据 / 授权口径>

**来源与授权**
- 用户 2026-10-11 21:18 原话：「我有些糊涂，不是目录路径的话，这个存储区是要创建的吗？那在哪里创建，已经创建的有哪些，是不是该有个列表，卷输入是不是应该改成下拉选择更好？」；21:19「那可以给已经建立的容器添加数据卷吗？」；21:22 裁：「我明白了，那先按不考虑加挂的原方案开批吧。」= **立批放行**（本批 = 原三件；加挂不做）。
- 父侧同轮实答（事实澄清——非本批范围）：卷 = Docker 命名卷，**首用即建**（不必先创建）；列表 = 控制台当前不显示（缺口 = 本批 ①）；已建容器**不能原位补挂**卷（Docker 语义）⇒ 补挂只能「带数据重建」（= 本批外单列）。

**范围（逐项：实现什么 + 来源）**

| # | 实现什么（对用户意味着什么） | 来源 |
|---|---|---|
| ① 卷列表 | 沙盒页看得见节点上有什么卷（名 ∥ 建的时间 ∥ 删除） | **用户** 21:18「是不是该有个列表」 |
| ② 建容器卷下拉 | 建容器时从已有卷里选（选定 = 复用该卷里的数据）；想新的 ⇒ 「新建卷（手输）」 | **用户** 21:18「卷输入是不是应该改成下拉选择更好」 |
| ③ 删卷防护 | 删卷 = 数据一起没（二次确认 + 后果句）；正被容器用着的卷拒删（引擎拒 ⇒ 译人话） | 设计侧提议（防手滑——用户上一轮未见反对；本批落到设计轮呈细节） |

**不做（明示）**
- **带数据重建（给已建容器补挂卷）**——用户 21:22 裁「先按不考虑加挂的原方案」⇒ 本批不做；如后续要 ⇒ 单列提议。
- 卷大小/使用量查看 ∥ 卷内浏览 ∥ 跨节点迁移——未点，不做。

**已知约束**
- 节点面既有读法 = 引擎 `GET /volumes`（我方新增读端点——沿镜像族端点先例）；建容器体已含 `Binds`（现输入 = 卷名手输）——本批只改入口形态，引擎请求形零改。
- 与在途批错峰：`console-tabs-component`（#241 设计已落——其写面含 `webui/SANDBOX.md`；本批设计面同含该档 ⇒ 以在盘现状为基（标签页归位块逐字保留）；标签页定稿轮排在后面）。

## §2 批次任务与设计（eng-designer）
**状态行**：设计完成（6 档落盘（sandbox ∥ webui/SANDBOX ∥ gateway ∥ accounts ∥ webui/WEBUI ∥ design/PROJECT）；产品码零触；门读数：悬空 25（零新增）∥ 行宽 OK ∥ 拟新增 43；待设计评审）
<§2 模板占位：本批条目（覆盖） / 设计档落点 / 机制设计 / 受影响文件与测试面 / 验收对照 / 关键决策 / 上抛项>

### §2 批次任务与设计（eng-designer）
**状态行**：设计完成（2026-10-11）

**一、本批覆盖的需求条目**（需求 40 ∥ AC-40——需求档已落；批档 §1 三件 + 21:22 裁）

| # | 条目 | 来源 | 本批落点 |
|---|---|---|---|
| ① | 卷列表（沙盒页看得见节点上有什么卷——名 ∥ 建的时间 ∥ 删除） | 用户 2026-10-11 21:18「是不是该有个列表」 | `sandbox/SANDBOX.md` §3 卷族块 ∥ §8① 卷区句 ∥ §11 卷族行 ∥ §12（N62/B63–B65）∥ `gateway/API.md` §2.5 两行 ∥ `webui/SANDBOX.md` §2.1① 卷区句 + §3 新档行 + §4 行 |
| ② | 建容器卷下拉（已有卷可选 ∥ 「新建卷（手输）」保底） | 用户 21:18「卷输入是不是应该改成下拉选择更好」 | `sandbox/SANDBOX.md` §3（选单形 ∥ `Binds` 形零改）∥ §11 ∥ §12（N63/B63–B65）∥ `webui/SANDBOX.md` §2.1① 创建弹窗句 + §4 行 |
| ③ | 删卷防护（二次确认 + 后果句；在用卷拒删译人话） | 设计侧提议（批档 §1 在案——用户未见反对） | `sandbox/SANDBOX.md` §3（409 ⇒ 400 人话 + 处置句）∥ §12（N62/E48/E49）∥ `gateway/API.md` §2.5 ∥ `accounts/ACCOUNTS.md` §2.1（`volume_delete`）∥ `webui/SANDBOX.md` §4 |
| ④ | **不做**：带数据重建（给已建容器补挂卷）——用户 21:22 裁「先按不考虑加挂的原方案开批」 | 用户 | `sandbox/SANDBOX.md` §15 卷族余项行（零入口）∥ §11 边界句 |

**二、设计档落点（6 档同拍——已落盘）**
`sandbox/SANDBOX.md`（§2 卷不落表句 ∥ §3 卷族块 ∥ §8① 卷区 ∥ §9 端点句 ∥ §11 判据行 ∥ §12 用例七条 ∥ §13 预算 ∥ §14 KD-SV-104/105 ∥ §15 余项清 + 卷族余项行 ∥ §16 R59）∥ `webui/SANDBOX.md`（§2.1① 两处 ∥ §3 新档行 + 读数 ∥ §4 卷族判据行 ∥ §6 同步登记）∥ `gateway/API.md`（§2.5 前括注句 + 两行 ∥ §4（errors ∥ 小计）±0 ∥ §5 卷族判据行）∥ `accounts/ACCOUNTS.md`（§2.1 `volume_delete` kind + 写入点）∥ `webui/WEBUI.md`（§1 静态面/JS 链/档目链 ∥ §6 AC 行）∥ `design/PROJECT.md`（§2.1 两行 ∥ §3 SANDBOX 文档地图行 ∥ §4 索引 1–105 ∥ §7 两行 ∥ §9 R59 stub）。

**三、机制设计（摘要——全文 = `sandbox/SANDBOX.md` §3 卷族块）**
- 端点两件（读时读 ∥ 直调——引擎即真源）：`GET …/runners/:id/volumes`（读类 3s ⇒ `{ volumes: [{ name, driver, createdAt }] }`；零审计）∥ `DELETE …/runners/:id/volumes/:name`（动作类 15s；名形前置校验 ⇒ 400 零外呼；204 ⇒ 200 + 审计 `volume_delete`；引擎 404 ⇒ 404；**409（在用卷）⇒ 400 人话 + 处置句**；余 ⇒ 502）。
- 建容器卷字段 = 选单（节点已有卷 + 「新建卷（手输）」逃逸——选定回填可再改；读败/空 ⇒ 手输照常）；`Binds` 请求形零改 ∥ 零隐式建卷（首用即建归引擎）。
- 卷区 = 节点行展开（容器区之后——归属标签①「运行面」）；删除 = 确认窗 + 后果句（非原生 `confirm`）；在用卷拒删 = 服务端 400 就地在窗内呈（可重试）；容器动作后卷区随取。
- 真机探针（2026-10-11 · 10.0.0.6:2375 · Docker 29.1.3 · API v1.44——探针已清）：`GET /volumes` 字段零 `UsageData`（v1.44/v1.52 `?size=1` 皆核）∥ 在用卷删 409（`remove <名>: volume is in use - [<容器id>]`）∥ 无此卷 404 ∥ 成 204 ∥ 建卷 201；**首用即建 = 容器创建即建**（不必启动；删容器不删卷）。

**四、受影响文件与测试面**（产品码改动 = 拟——本轮设计轮，产品码零触）

| 文件 | 现读 | 设计增量（拟） | 备注 |
|---|---|---|---|
| `thincoder-server/src/sandbox/volume-routes.mjs` | 无 | ≈110 | 两端点 + `volumeView` 逐值 + 名形校验（自持）+ 头注 |
| `thincoder-server/src/sandbox/docker.mjs` | 327 | +≈8 | `volumes` 列表 ∥ `removeVolume` 删除两法 + 头注句 |
| `thincoder-server/src/sandbox/routes.mjs` | 442 | +2 | import + 转注册（余量 ≈56——500 软线内） |
| `thincoder-server/src/sandbox/container-routes.mjs` | 现读 313 ∥ 内容行 312 | ±0 | 卷族独立成档——本档零触 |
| `thincoder-server/public/views-sandbox-volumes.mjs` | 无 | ≈130 | 卷区件（卷表 + 删除确认窗） |
| `thincoder-server/public/views-sandbox-containers.mjs` | 现读 313 | +≈12 | 建容器弹窗卷字段 = 选单 + 手输保底（选定回填/读败/空三支） |
| `thincoder-server/public/views-sandbox.mjs` | 现读 376 | +≈3 | 卷区装配 + 容器动作后随取接线 |
| `thincoder-server/public/i18n-zh-sandbox.mjs` ∥ `i18n-en-sandbox.mjs` | 197 ∥ 197 | +7 键/表 ⇒ ≈210 | 跨批件指纹/键数 601 ∥ 606 ⇒ **608 ∥ 613** |
| `thincoder-server/package.json` | —— | 父侧落（实施轮同拍） | `prepublishOnly` 链 **52 ⇒ 54**（本批两件入链——沿近批先例）+ 门禁件数断言件随正 |
| `thincoder-server/public/style.css` | —— | ±0 | 复用既有类（零新变量/悬停规则） |

测试面：批内件两件——`docs/batches/2026-10-11-sandbox-volumes.test.mjs`（服务面 ≈220：卷两路由（假 Docker：`GET /volumes` 样件 ∥ `DELETE` 204/404/409 三形映射） ∥ 名形校验零外呼 ∥ 审计行 ∥ 列表零审计）∥ `docs/batches/2026-10-11-sandbox-volumes-ui.test.mjs`（前端面 ≈300：卷区渲染 ∥ 删除确认窗（取消零调用） ∥ 建容器卷选单两腿 ∥ i18n 键集 ∥ 档目）；**均入 server 链**。用例 = `sandbox/SANDBOX.md` §12（N62/N63 ∥ B63–B65 ∥ E48/E49）。

**五、验收对照（三链同源）**
批档条目 ①②③ ⟺ 需求 40 ∥ AC-40 ⟺ `sandbox/SANDBOX.md` §11 卷族行 ∥ `webui/SANDBOX.md` §4 卷族行 ∥ `gateway/API.md` §5 卷族行；判据全文 = `sandbox/SANDBOX.md` §3 卷族块 ∥ §12 用例 ∥ §14 KD-SV-104/105；真机（收口轮——ECS `.6`：在用卷拒删如实呈（`test-data` 类场景） ∥ 建容器选卷/手输两腿 ∥ 卷表列/删全链）。

**六、关键决策（全文 = `sandbox/SANDBOX.md` §14）**
KD-SV-104（卷族 = 引擎即真源 + 只改入口形 + 删卷防护）∥ KD-SV-105（卷区 = 节点行展开 · 容器区之后——归属标签①「运行面」）。自加项六条（§3 卷族块表——逐条带理由）报审。

**七、上抛/待裁项**（全文 = `sandbox/SANDBOX.md` §16 R59）
① 披露（不阻塞；如无异议按设计实施）：在用卷拒删 = 引擎行为（我方不预检）∥ 删卷不可逆（确认窗 + 后果句）∥ 「新建卷（手输）」建卷成功与否归引擎 ∥ 列表面字段 = 引擎如实（驱动恒 `local` 不入列；用量引擎不携）。② 同步项（登记——非本批改）：`webui/SANDBOX.md` §2.1① 分标签归位块『（展开 ⇒ 容器区）』半句与容器区句『展开体只余容器区』——卷区落位后应含卷区；本批按令逐字保留 ⇒ 随标签页定稿轮（console-tabs-component）同步。③ 部署收尾（父侧）：镜像重建 + 重收敛 + 浏览器实走 + 真机。④ 报告项（列报）：板档 §4 索引 1–101 陈值（KD-SV-102/103 前批未折——本笔折入 ⇒ **1–105**）∥ 板档 §7 webui 行 AC-39 漏登（本笔折入 ⇒ AC-39 ∥ AC-40）∥ `webui/SANDBOX.md` §3 `views-sandbox-containers.mjs` 存量读数差（现读 313 vs 在册 296——tabs 批已列报；本批以现读为基）∥ gateway/accounts 两域 §7 行未含沙盒族 AC 号（沿旧陈值——本批未改，列报）。

## §3 设计评审（评审子代理）

### 轮次 1（评审子代理）

沙盒卷族批（sandbox-volumes——台账 #1291）· 设计评审：六档全读（`sandbox/SANDBOX.md` ∥ `webui/SANDBOX.md` ∥ `webui/WEBUI.md` ∥ `gateway/API.md` ∥ `accounts/ACCOUNTS.md` ∥ `design/PROJECT.md`）；受改文件行数实读抽查（routes.mjs 442 ∥ docker.mjs 328〔口径 −1〕∥ views-sandbox.mjs 376 ∥ views-sandbox-containers.mjs 313 ∥ views-sandbox-images.mjs 228 ∥ views-sandbox-image-sources.mjs 361 ∥ i18n-{zh,en}-sandbox 197 ∥ db.mjs 477〔口径 −1〕∥ container-routes.mjs **313**〔在册 311——Δ2〕）；需求面读数仅作 fit 核（需求档不在评审对象内）。

| # | Category | Severity | Issue | Suggestion |
|---|----------|----------|-------|------------|
| 1 | 文档一致性（分期链/轮数） | 🟡 | 「分四轮落」计数与链不自洽：`webui/SANDBOX.md:11` ∥ `:102` 列五段（① / ① 续 / ① 续二 / ① 续三：拉取认源 / ① 续四：卷族）却标「分四轮落」（沿段数计数先例 = `design/PROJECT.md:758`「六面分三轮 ⇒ 分四轮」）；同族三处未随本批同步：`webui/WEBUI.md:97`（§2.8 stub 标题链缺 ① 续四——邻批先例 = `webui/WEBUI.md:356` 曾补 ① 续三）+ `webui/WEBUI.md:101`（全节枚举缺「卷族」）+ `design/PROJECT.md:32`（「六面分四轮」）+ `design/PROJECT.md:199`（AC-36 行链缺 ① 续四） | 四处同拍：计数 ⇒ 五轮；WEBUI.md §2.8 stub（`:97`/`:101`）与 PROJECT.md AC-36 行链补「① 续四：卷族（sandbox-volumes 批）」 |
| 2 | 文档一致性（跨档状态） | 🟡 | R59② 同步项已陈：`sandbox/SANDBOX.md:531` 仍载「本批按令逐字保留其句 ⇒ 随标签页定稿轮（console-tabs-component）同步」，而 `webui/SANDBOX.md:35` 现句已为「节点表（展开 ⇒ 容器区 + 卷区）」、`webui/SANDBOX.md:120` 变更记录载「容器区句与归位块半句随卷区落位同步（展开体 = 容器区 + 卷区）」且「§6 卷区同步登记销」、`webui/SANDBOX.md:111` 回指 R59——两档对同一项状态不合 | R59② 翻转「已办/销」（以 webui 侧现句为准；「逐字保留」句 = 陈） |
| 3 | 验收（用例覆盖） | 🟡 | AC-40① 腿「读败 ⇒ 人话」无用例腿：判据在 `sandbox/SANDBOX.md:345`（「名/驱动/创建时间；读败 ⇒ 人话」），而用例集（`:418`–`:423`）中 B63 仅覆盖建容器窗选单支（`:420`）、E49 的 502 腿属删卷——卷区表读败无机检腿 | 补一腿（如 B65：卷表读败 ⇒ 行内人话 + 页内不反噬）或并入既有腿 |
| 4 | Requirements（回笔登记） | 🟡 | R59 未登记需求档回笔项：需求侧 AC-36 ⑥ 分期链止于「⇒ 拉取认源（sandbox-pull-by-source 批）」（`docs/server/requirements/PROJECT.md:270`——需求面证据），缺本批「① 续四：卷族」；同档 §5「① 续」不做清单仍载「卷删除（另批——判据 = `sandbox/SANDBOX.md` §15）」（`:336`）——本批交付面。设计侧链已含 ① 续四（`webui/SANDBOX.md:11` ∥ `:102`） | R59 补一项 = 需求档回笔（AC-36 ⑥ 链 +1 步 ∥ §5 不做清单「卷删除」⇒ 已落 / 判据改指 §11） |
| 5 | 设计缺口（卷族↔工作区卷） | 🟡 | 卷族同族句「卷 = 节点上的 Docker **命名卷**——引擎即真源」（`sandbox/SANDBOX.md:44`）与 §5「**卷**：节点本地盘 `<workspaceRoot>/<ws-id>`」（`:253`）形态关系未写；卷区删卷走通用确认窗（`:216`/`:229`）——无工作区感知，而工作区销毁口径 = 「控制台示 dirty 与快照态」（`:251` ∥ KD-SV-67）；工作区↔容器映射为余项（`:515`） | 登记关系（卷区是否可见工作区卷 ∥ 删卷防护是否需工作区感知/提示）——落 §15 余项或工作区面设计轮；本批不阻塞 |
| 6 | 档案账（键族） | 🔵 | i18n 复用键清单漏列 `admin.sandbox.colActions`：`webui/SANDBOX.md:91` 载「复用 3 键」，而卷表列 = 名 ∥ 创建时间 ∥ 操作（`:21`），同族容器表列头已用该键（`views-sandbox-containers.mjs:71` ∥ `i18n-zh-sandbox.mjs:24`） | 复用清单 3 ⇒ 4 键（或明写操作列无列头）；键账同拍 |
| 7 | 档案账（读数回填） | 🔵 | `container-routes.mjs` 在册「已落盘 **311**——2026-10-11 sandbox-docker-admin 落地后现读」（`sandbox/SANDBOX.md:432`）vs 现读 **313**（轻通道笔 3「`Cmd` 恒携」一行 + 注落地后未回填——`:553`；Δ2 越尾空行口径） | 该行读数收正（本批 ±0 结论不受影响） |
| 8 | 档案账（§5 行） | 🔵 | `webui/WEBUI.md` §5 未补本批新档行：`views-sandbox-volumes.mjs`（§1 `:16` 已列；同族 拟新增 档 egress/me-sandbox 均有 §5 行——`:153`/`:154`）；同族前批 `tabs.mjs`（`:17` 已列）亦缺 §5 行——列报 | 补两行（委派指针形：⇒ `webui/SANDBOX.md` §3 ∥ ⇒ `webui/TABS.md` §3） |

计数：🔴 0 ∥ 🟡 5 ∥ 🔵 3。抽查结论：受改文件行数注解齐（含 `≤±N` 口径）；四落点均改在既有单源档（零新档、零归属碎片化）——无 🔴。

VERDICT: pass

## §4 用户批准（主 agent）

**批准（代签——用户全链自动授权：2026-10-11「发，并且其他任务也都点火，后续自动跑完」。自缚三条件齐备：① 评审 pass 0🔴 ✓（#248——5🟡+3🔵 全数受理）∥ ② 修正轮落地并逐条核验 ✓（八条全 Fixed：五轮计数/链三处 ∥ R59② 翻已办 ∥ B65 补腿 ∥ R59 增需求档回笔项 ∥ 卷↔工作区卷登记 ∥ 键 3⇒4 ∥ 读数 313 ∥ §5 补行——父侧抽核在盘；另 #253 微轮补批档 §2 同拍五处）∥ ③ 令牌已签发 ✓（凭据零入档）。**

实施范围 = 本档 §2 文件表（`src/sandbox/volume-routes.mjs`（新增）∥ `docker.mjs` ∥ `routes.mjs` ∥ `views-sandbox-volumes.mjs`（新增）∥ `views-sandbox-containers.mjs` ∥ `views-sandbox.mjs` ∥ i18n 两档（+7 键）∥ `package.json` 链注册 52⇒54 + 链件数断言件随正 ∥ 批内件两件）；实施轮 = eng-coder（设计 = `sandbox/SANDBOX.md` §3 卷族块；判据 = §12 N62/N63 ∥ B63–B65 ∥ E48/E49）。

**上抛/余项（实施轮注意）**：① 与标签页批同抢 `views-sandbox.mjs` 与 i18n 两档——调度器串行（顺序 = 标签页先落：键数链 601∥606 ⇒ 608∥613 依赖此序）；② 需求档回笔（R59④）= 父侧笔；③ 五族 ⇒ 六族枚举（台账 #1293）归本批收口随正；④ 部署收尾（R59③）= 父侧收口轮（镜像重建 + 重收敛 + 浏览器实走 + 真机）。

## §5 实施记录（eng-coder）

**状态行**：实施完成（审计 1 轮（2 偏差全修）+ Advisor 评审 1 轮（pass，0🔴）；跨批件随正归父侧（写门拒））

**交付摘要**：沙盒卷族（本批——台账 #1291；功能点 40 ∥ AC-40 ①②③）全部落盘：服务面两端点（列表 = 读时读 ⇒ `{ volumes: [{name, driver, createdAt}] }`，`Volumes` 缺/null ⇒ `[]`，零审计 ∥ 删除 = 动作直调 204 ⇒ 200 + 审计 `volume_delete`（detail = kind+runnerId+volume）；名形前置校验 `[A-Za-z0-9][A-Za-z0-9_.-]*` ⇒ 400 零外呼；引擎 404 ⇒ 404 `not_found`；409（在用卷）⇒ 400 人话 + 处置句 + 携引擎原文；余 ⇒ 502）∥ 控制台节点行展开内卷区（容器区之后：表（名 ∥ 创建时间 ∥ 操作）+ 空态 + 读败行内人话 + 收起失缓存 ⇒ 再展开重取）∥ 删窗（`confirmModal` + 后果句；在用卷 400 就地在窗内呈、窗不关可重试）∥ 建容器卷字段 = 节点已有卷选单 + 「新建卷（手输）」保底（选定回填可再改；读败/空表手输照常；留空 ⇒ 省略键）∥ 容器动作后卷区随取（页装配层重置缓存）。AC-40④（给已建容器补挂）按设计不做——卷区与容器详情面零补挂入口（实读核）。

落盘 11 档（+2 新档）：`src/sandbox/volume-routes.mjs`（新，101 行）∥ `src/sandbox/docker.mjs`（+2 法——`volumes`/`removeVolume`；332 行）∥ `src/sandbox/routes.mjs`（+2 行——import + 注册；444 行）∥ `public/views-sandbox-volumes.mjs`（新，76 行）∥ `public/views-sandbox-containers.mjs`（+13 行：卷选单 + 回填 + 监听 + 转出口；326 行）∥ `public/views-sandbox.mjs`（净 +1——import 并合既有行 ∥ 工厂声明并入既行 ∥ 展开体两区 ∥ 收起失缓存 ∥ 容器 reload 包 reset；499 内容行 / split 500 压线）∥ i18n 两档（各 +7 键、209 行）∥ `package.json`（链 +2 ⇒ **55** 件）∥ 批内件两件（服务面 6 腿 336 行 ∥ 控制台面 5 腿 413 行）。

**实跑读数（终态）**：`node --test docs/batches/2026-10-11-sandbox-volumes.test.mjs` = **6/6 pass** ∥ `node --test docs/batches/2026-10-11-sandbox-volumes-ui.test.mjs` = **5/5 pass**（自 `thincoder/` 仓根；`read.path` 实读 `/v1.44/volumes`——协商版本，断言按实读收正）。

**决策透明表**：

| # | 决策 | 缘由与披露 |
|---|---|---|
| 1 | 卷区件经 `views-sandbox-containers.mjs` **转出口**取件（1 行 `export { createVolumeSection } …`），页内 import 并入既有行 | `views-sandbox.mjs` ≤500 硬线压线（页净增 ≤+1）——父侧中途指令（页净增预算），非设计原形；机械可行、单点取件；**披露于交付报告** |
| 2 | 收起节点 ⇒ 卷区失缓存（toggle 一行内 `volumes.reset`） | B65「再展开重取可重试」；容器区行为不动（零回归） |
| 3 | 列表面失败映射借 `dockerFailure`（沿 `image-routes.mjs:18` 先例）；卷族 → 容器族 1 处 import | 族内既有形；评审 🔵② 受理为「不动」——抽中性档属设计面调用 |
| 4 | canon 机检守「不缩」（`:root ≥38 ∥ 悬停 ≥7`），绝对计数不判 | 本批零 CSS 触面（文件表无 `style.css`），并行批同期在改 CSS ⇒ 绝对数不可判；零新增 = 本批文件面事实 |
| 5 | 档目快照 43 ∥ 42（含并行批新档 `views-chat-composer.mjs`）；悬停盘面 8、`:root` 盘面 50 | 落笔当刻实读（并行批在飞） |
| 6 | 跨批件随正（结构件指纹/键数 ∥ 链件数 7 处 ∥ 三处陈旧 599/604 ∥ `runner-admin-console-ui` `selects 1⇒2`）**未落地** | 写门拒（非本批档——「parent agent handles other batch records」）；所需值逐项列于交付报告，**归父侧** |

**审计与代码评审轮次与终态**：

- 独立分歧审计（explore 只读）1 轮：判决 DEVIATIONS 2（🟡 §5 未落笔 ∥ 🔵 UI 件缺 B63「空表」腿）+ 低级观测 4。
- **自修 round 1**（全数落地）：① §5 = 本条（审计后落笔）∥ ② UI 件补 B63 空表腿（`volumes: []` ⇒ 选单只余逃逸项）+ 卷区空态（`volumesEmpty`）渲染断言 ∥ ③ 头注 42∥41 ⇒ 43∥42 ∥ ④ 服务件 `read.path` 由 `endsWith` 收紧为逐值 `/v1.44/volumes`；另修 ⑤ 文档行头「悬停 7」⇒「盘面 8」。
- 内部 Advisor 代码评审 1 轮：**VERDICT: pass**（0🔴）；1🟡（协调项——跨批件目标值陈旧：链 52⇒54 实为 55、键数 608∥613 已被并行批漂移；非本批缺陷、非 must-fix，父侧收口以当刻实读回填）+ 4🔵（列表面映射借容器族映射器 ∥ 档目快照全集合等值脆弱 ∥ canon 降为「不缩」 ∥ 设计档行数读数待回填 ≈403⇒499）。四条 🔵 受理：③④ 保留原形（族先例/零 CSS 面）并记见上表；⑤ 归设计回填轮；② 保留（改法属设计面）。
- **终态：clean**（🟡/🔵 全数受理；无未收敛项）。

**fix round 计数**：自修 1 轮（审计后）；评审后 0 轮（pass、无 must-fix）——合计 ≤5 轮上限内。

**跨批/并行实况（报告重点）**：并行批 chat-shell-align 与本批同期在落 i18n（core/admin 两族 **+49 键**）与新档 `views-chat-composer.mjs`（public/ 42 ⇒ 43）；本批跨批件同步值 = **落笔当刻实读**（`ZH 657 ∥ EN 662` + 指纹 `7b398d…`/`aada41…`；链 **55**）。键数/指纹/档目三类随正件 + 三处陈旧 599/604 + `selects 1⇒2` 均归父侧（写门拒依部署约束）。设计档回笔（R59④）与行数读数回填同归父侧/设计面。

## §6 验证与收口（父代理）

**收口（2026-10-12 03:0x · 主 agent）**

**验证读数（一次全链）**：`npm run prepublishOnly` 全链 **501/501 绿**（56 件 · 37s）；本批件 `-sandbox-volumes.test.mjs` 6/6 ∥ `-sandbox-volumes-ui.test.mjs` 5/5 在链内。

**跨批随正（本收口轮内落）**：① 键数/指纹三类随正（**686 ∥ 691** + 结构件 ANCHOR 重算——与 chat-shell-align 批同轮同拍）；② 创建弹窗 `selects 1⇒2` 断言（卷选单——`-runner-admin-console-ui.test.mjs` ④）；③ 单时间线笔（日志窗 `[操作]` 标记 + 引擎 `timestamps=1` + 并流）已落提交 `4b6f8dab`，其断言在 `-sandbox-docker-admin-ui.test.mjs` ② 腿（14/14 绿）+ `-sandbox-docker-admin.test.mjs`（14/14 绿）。④ 五件沙盒/runner 夹具的「标签②进法」随正（tabs 批 §6 同拍）。

**部署**：提交 `8b9f7ea4` + `a1c74c9d` → 箱快进 `a1c74c9` → 镜像重建 `88a36574c5bc` → **Up (healthy)**；`views-sandbox-volumes.mjs` 实读 200。

**未决（指针）**：① 真机走查（卷管理面）= 用户面；② 「建容器命令字段」甲/乙待用户裁（台账挂账）；③ `walk-logtest` 测试容器清理（用户面）。

**结算依据**：全链 501/501 读数 + 部署探针读数 + 本档 §5 实施记录 + 台账 #1297 组内条目。
