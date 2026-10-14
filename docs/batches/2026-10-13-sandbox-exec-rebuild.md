# 2026-10-13 · 沙盒执行面重做
> 六段 append-only，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 编制：主 agent · 2026-10-13 · 来源 = 用户 2026-10-13 20:5x「那应该先把重做批跑了」+ 21:08「开，自动跑」；承 2026-10-10 19:52–20:01 执行面形态裁定（server 直调 Docker API ∥ 主机侧两件走 SSH ∥ 节点零驻留）；归批项汇编 = #1248/#1249 ∥ #1351 ∥ P14 ∥ v11 列面 ∥ KD-SV-72 ∥ 写门实时化。
> 台账 = #1373（sandbox · 归批）。前情 = docs/batches/2026-10-10-server-exec-sandbox.md ∥ docs/batches/2026-10-10-runner-admin-console.md（同链前两批——执行面初建 ∥ 随正轮）。
## §1 讨论（主 agent）
**状态行**：已收口 2026-10-14
<§1 模板占位：本批条目 / 关键判据 / 授权口径>

**2026-10-13 · 沙盒执行面重做（Docker API 直调 ∥ 主机侧两件走 SSH ∥ 盒内运行时通道）**

- **来源**：用户 2026-10-13 20:5x「那应该先把重做批跑了，」+ 21:08「开，自动跑」——父侧批件提案（范围汇编 + 块序 + 跑法）获准。承 2026-10-10 19:52–20:01 执行面形态裁定（原话要点：「runner = 远程 Docker API 节点」——控制面直调 Docker API；主机侧两件〔出站闸 ∥ 磁盘限额〕= SSH；机器上不驻留我们的进程；守护进程面「废了，不要留着」）。台账 **#1373**（sandbox）。
- **病灶（as-of 2026-10-10）**：现执行面 = 节点驻留守护进程形——用户裁定整体重做；旧设计 `sandbox/RUNNER.md` 已整档删（执行面设计随重定退场）；`2026-10-10-runner-admin-console.md:59` 明载「重做批**未点火**（用户闸门）」——本批即该重做的落点。
- **范围（五块）**：① **执行面本体**：盒生命周期（建/起/停/毁/轮换/快照）经 **Docker API 直调**；动作/队列机制定形（占位句 = `gateway/API.md:162`「入 `sandbox_tasks` 队列（执行机制随重做批定形）」）；② **盒内 agent 运行时通道**（核 `@thincoder/core` 同件 + 最小壳——16:36 裁；回灌核缝草案 = `agent/MEMBER-AGENT.md` §3.2 ∥ R76）——**成员面（#1215）实施前置**；③ **主机侧件**：出站闸本体/下发器 + 磁盘限额（SSH 面）+ 写门实时化（现静态判据「存在 active 节点」⇒ 实时门——`sandbox/SANDBOX.md:61`）；④ **归批小件**：#1351（网段带入失败窗口）∥ v11 两表列面实现收正（`store/STORE.md:270/:305/:341`）∥ P14（读数面 SKIP 前置——`sandbox/SANDBOX.md:430`）∥ KD-SV-72（执行面共用——沙盒与 CI）∥ OPS 网络面细形（`ops/OPS.md:250`）；⑤ **真机复证收口面**：#1248/#1249（主机侧闸本体/下发器 + 探针执行器随本批——`sandbox/SANDBOX.md:430/:433/:434`）∥ 红队探针**执行器**（判据表在册——`:411/:633/:655④`）。
- **块序（建议——设计轮可调）**：① 执行面本体（功能先能用）→ ② 盒内运行时通道 → ③ 主机侧件 → ④ 真机复证 + 探针。依据 = 用户 2026-10-11「功能先能用、安全面排后」裁。
- **依赖 ∥ 关联**：成员面（#1215）实施前置 = 本批②块（其 §4 已代签——批准不堵、派发待本批落）；与 #1366/#1367（索引面）零关；写门实时化与 `sandbox/SANDBOX.md` §5/§8 同源。
- **边界**：不做 = 公众平台式防护面（内部自用工具——用户 2026-10-10 19:48–19:50 裁）；旧守护进程形态零保留；#1366/#1367 已裁面零改。
- **授权（自动跑 · 用户 2026-10-13 21:08）**：用户原话「开，自动跑」⇒ 本批**设计评审点火权 ∥ §4 用户批准权（代签）∥ 修正/实施轮派发 ∥ 收口核销与提交（双推）∥ 令牌终消费**——均委托父侧自动执行，直至本批收口。**父侧自缚三条（本仓惯例·先例同形）**：① 代签仅当三条件齐备（评审 pass 0🔴 ∧ 修正轮已落地并逐条核验 ∧ token 已签发），每次代签在 §4 写明「父侧代签（用户 21:08 授权）+ 依据」；② 新范围/口径裁决 ⇒ 停下、只摆那一条；③ 破坏性/不可逆 ⇒ 先停。默认全自动，用户随时可打断。

**2026-10-13 21:32 · 用户裁定（底座可换 = 完整功能进本批）**：用户原话「底座那个做完整功能吧」——父侧呈报二择（① 契约就位 + 完整功能另石 ∥ ② 完整功能进本批）之选择 = **②**。⇒ 本批范围增补（设计面）：**工作区盒「底座可换」完整功能**——管理员可选定自定义底座镜像，我方组件（核 + 壳）叠加上去，端到端可用（含节点侧构建/派生流 ∥ 私有仓凭据 ∥ 控制台选择面）；**缺省 = 现标准镜像（零行为变化）**。标准方案（2026-10-10 现行）不变；复杂度/威胁模型按「自己人用」定。底座前提二档（自带 Node ≥24 = 甲 ∥ Node 随包带 = 乙）由设计轮定形并呈裁（父侧推荐甲为基线）。落点 = 设计修订轮（EXECUTION §8 镜像契约 + 关联档），随本批评审。

**2026-10-13 22:38 · 用户裁定（底座前提 = 乙）**：用户原话「乙」——父侧呈报二择（甲 = 底座自带 Node ≥24 ∥ 乙 = Node 随包带〔glibc 系通用；musl/Alpine 如实拒〕——**父侧推荐乙**：现成镜像绝大多数不含 Node，甲 = 让用户先自烤带 Node 的底座，「完整功能」落空）之选 = **乙**。⇒ 设计面收正（呈裁项消解——乙 = 选定形；甲档历史归记录面，规范面按 D8 收正）；落点 = `sandbox/EXECUTION.md` §8/§15（设计席落）+ 需求档功能点 52/AC-52（父侧落）。

**2026-10-13 22:43 · 用户裁定（runner 连接面：明文保持缺省 + TLS 可选增补）**：用户原话「我其实很喜欢现在这种方式，靠安全组控制，使用简单方便，不过，我也想加上B，只是TLS证书认证，让用户可选。」——父侧三择呈报（A 维持 ∥ B TLS 证书 ∥ C SSH 隧道）之选 = **A 保缺省 + B 增为可选档**（C 不取）。⇒ 本批**范围增补 #2**（台账 #1377→归批本批）：连接面 = **节点级二择**（明文〔缺省——现行零行为变化，安全组控制照旧〕∥ TLS 客户端证书〔用户可选——「想用时可以开」〕）。落点 = 设计修订轮（EXECUTION §2.1/节点面 + API/OPS/STORE/关联档）+ 需求侧入册（父侧——功能点/AC 待设计落定随拍）。附带：ECS 指南（`docs/TEST-ENV-ECS.md`）节点侧 dockerd TLS 配置步骤 = 随正件（父侧/实施轮）。

**2026-10-13 23:3x · 实施上抛两裁（父侧——#106 底座舱两问；均已 send 双舱）**

- **① 舱界（N72 建盒腿落点）**：`box.mjs`（④ 镜像就位步）∥ `workspace-routes.mjs`（`baseImage` 读写两处）= **执行面舱（#104）写面**——#106 交付四档 + 导出接口四件（`ensureDerivedImage` ∥ `customBaseOf` ∥ `authForImageRef` ∥ `registerRegistryCredRoutes`）；N72 建盒腿/B75 端点腿 = 消费舱覆盖 + **跨舱集成腿归父侧收口轮联跑**。已 steer：#104（补 ④ 步 + `baseImage` 两处）∥ #106（归他舱确认 + 接口四件）。
- **② `registry_credentials` 更新时间（文档相抵）**：裁 **B**——增 `updated_at TEXT`（**七列**）。落法：`store/STORE.md` 两处（§2 v22 段 DDL + 判据「列面六行」⇒「七行」）= **父侧直接执行**（可 revert；变更记录一行在册）；`migrations.mjs` DDL 列 = steer #104；写面维护（update 径刷新 `updated_at`）= #106；`gateway/API.md` §2.5 ∥ `webui/SANDBOX.md` §2.1① 两处已含 `updatedAt`——零动。

**2026-10-13 23:5x · 收口随正（父侧——终端批先落）**：① `2026-10-08-server-public-structure.test.mjs` 已随正（当刻实读 1033 ∥ 1038——含本批已落 i18n 键〔conn/base/cred 族〕；**本批 i18n 面全部落齐后终随正**）⇒ 6/6 绿；② `2026-10-13-sandbox-container-actions.test.mjs` 已随正（七钮 ∥ 行闩七钮 ∥ `:root` 76）⇒ 5/5 绿。终端批收口与批冲突面（`bin`/`i18n-system`/`i18n-sandbox`）= 本批在飞三档落笔后合并提交。

**2026-10-13 23:4x · 底座舱（#106）交付上抛处置**

- ① **凭据四端点零注册点**（`registerRegistryCredRoutes` 全仓零调用）⇒ 已 steer 装配舱（#108——边界内：bin 注册链，连工作区四路由/终端路由一并核齐）；不接线则控制台凭据卡 404（功能点 52③）。
- ② **DDL 相抵**（落盘 `updated_at TEXT` 可空 vs `STORE.md` v22 段 `NOT NULL`）⇒ 收口轮随正（两写径恒写值——行为零差；对齐取「DDL ⇒ NOT NULL」或「文档 ⇒ 可空」之一，收口定点）。
- ③ **旧件断言过期**（`2026-10-11-sandbox-docker-admin.test.mjs:394` `image_pull` detail 无 `auth` 键）⇒ 收口轮随正（非门禁）。
- ④ 行数实读 vs §14 预算（`derive` 243/≈200 ∥ `creds` 174/≈130 ∥ `cred-routes` 95/≈110 ∥ `image-routes` 144/≈150 ∥ 批内件 543/≈320）⇒ 设计档 §14 回填随收口轮。

## §2 批次任务与设计（eng-designer）
**状态行**：设计完成（评审轮 1/2 修复 + 乙档 + 增补 #2 已落（2026-10-13）；收口修复轮 B/D/E/F + 回填已落（2026-10-14））
<§2 模板占位：本批条目（覆盖） / 设计档落点 / 机制设计 / 受影响文件与测试覆盖 / 验收对照 / 关键决策 / 上抛项>

## 第 2 段 · 批次任务与设计（sandbox-exec-rebuild 批 · 设计轮 · eng-designer）

**批锚**：批 = `2026-10-13-sandbox-exec-rebuild` ∥ 台账 #1373 ∥ 轮次 = 初始（设计轮）∥ 用户口径 = 2026-10-10 19:52–19:56 ∥ 16:28/16:32/16:36 + 2026-10-13 本批范围五块（执行面重做 ∥ 卷 = 主机路径 ∥ DNS 闸 ∥ 写门实时化 ∥ v22 收正 + 探针 + 迁移拆案）。**产品码零触（设计轮）**。

**设计落点**（新增 1 档 + 随正 8 档）：

- **新建** `docs/server/design/sandbox/EXECUTION.md`（执行面**单源**——§1–§17 + 变更记录；sandbox-exec-rebuild 批建档）。
- 随正：`sandbox/SANDBOX.md`（§2/§4/§5/§6/§8/§9/§11/§12/§13/§14/§15/§16） ∥ `store/STORE.md`（§1/§2/§3/§4） ∥ `gateway/API.md`（§2.5） ∥ `ops/OPS.md`（§5.10/§6/§7） ∥ `accounts/ACCOUNTS.md`（§2.1） ∥ `agent/MEMBER-AGENT.md`（§3.2/§3.10/§5/§6） ∥ `design/PROJECT.md`（§1/§2.1/§3/§4/§6/§7/§9） ∥ `docs/README.md`（§1）。

### 2.1 本批覆盖的要求项 → 设计落点 → 判据（机检）

| # | 要求项（本批） | 设计落点 | 判据（单元测试档——机检） |
|---|---|---|---|
| ① | 执行面重定：三腿（Docker API 直调 ∥ SSH 主机侧 ∥ 盒出向）+ 三证（无 daemon ∥ 无心跳 ∥ 无领取方） | `sandbox/EXECUTION.md` §1/§2 ∥ `sandbox/SANDBOX.md` §1/§4 | EXECUTION §12（三腿逐腿可测）+ §13 N65（缺腿即起不了盒） |
| ② | **队列退场**：`sandbox_tasks` 删表；动作 = 请求内幂等直调链（409/占用 ⇒ 采用读回；失败停 + 行留 + 重试续链） | EXECUTION §3 ∥ `store/STORE.md` §2 v22 段（删表）∥ `gateway/API.md` §2.5（动作行） | N65/N66 ∥ B67 ∥ E50 ∥ E54（v21 库升后表消 + 存量行保形） |
| ③ | 卷 = **主机路径绑定** `<workspaceRoot>/<ws-id>`（卷族并存不代管） | EXECUTION §3/§4 ∥ SANDBOX §2/§5/§15 | N65（`mkdir/chown` 逐条）∥ E51（SSH 失败零半态） |
| ④ | 主机侧配额：项目配额优先 ∥ loopback 备选 ∥ 皆不可 ⇒ 建盒停（前置，fail-closed） | EXECUTION §4 ∥ OPS §5.10（三件前提） | B67（配额不可用 ⇒ 零建盒） |
| ⑤ | 出站闸本体 + 下发：nft 全量重算幂等（`iifname "tcws*"` 锚；位次 L1 → 内置允许 → 显式 deny → 显式 allow → 种子 deny → 默认拒）；就位检查 fail-closed | EXECUTION §5 ∥ SANDBOX §4 强制面 ⑦ | N67（位次逐行断言 ∥ 重复下发同结果）∥ B73（删行即生效 ∥ 盒零重建） |
| ⑥ | **域名闸 = server 进程内 UDP 53 DNS 应答器**（盒 `resolv.conf` → server；持答 ≤60s；裁定后**先下发再应答**；L1/显式 deny 零挂起；求值复用 `rules.mjs evaluateEgress`） | EXECUTION §6 ∥ SANDBOX §6 | N68（三径）∥ B71（零挂起/非盒源忽略/超时）∥ B72（解析空 REFUSED；部分拒回落子集） |
| ⑦ | 写门实时化：实时探活（3s、零缓存、不降级）；无可用节点 ⇒ 503 `sandbox_unavailable` | EXECUTION §7 ∥ SANDBOX §4 生效句 | B68（未绑 403 ∥ 满 503 ∥ 离线「等待放置」） |
| ⑧ | 快照 = Docker `archive` 全量存档（上限 = 工作区 `diskMb` 配额）；恢复 = 停 + 清 + 解 + 起；销毁不拍；空闲信号 = `last_active_at`（动作 + 网关流量）、墙钟 = 引擎 `StartedAt`、ticker 30s | EXECUTION §3 ∥ SANDBOX §5 | N66 ∥ N69（三定时器）∥ B69（越上限中止零行）∥ B70（恢复两径） |
| ⑨ | 盒运行时通道 = 核同件 + 最小壳（缝 = 核既有导出写面即契约；**核码零改**——解 `agent/MEMBER-AGENT.md` §6 R76） | EXECUTION §8 ∥ MEMBER-AGENT §3.2/§3.10/§6 | EXECUTION §12（通道判据；shell 面机检 = member-face 批） |
| ⑩ | 存储收正：v22 段（`sandbox_workspaces` 重建去 `required_labels_json` + 增 `stop_reason`；`sandbox_tasks` 删表）∥ 迁移段外提 `src/store/migrations.mjs`（触发线 700 越；命名单源）∥ #1351 登记带入单事务 | EXECUTION §9 ∥ STORE §2 v22 段/§3/§4 | E54（升库逐值保形 + 幂等）∥ E52（带入事务回滚） |
| ⑪ | 探针执行器 `deploy/sandbox-probe.mjs`（P1–P14；一次性容器径、零 `docker exec`）+ #1248/#1249 闭环 | EXECUTION §10 ∥ SANDBOX §11 探针表/闭环边界 | E55（SKIP 如实 + 退出码；零假 PASS）；**真机收口 = 父侧**（ECS `.5`/`.6`） |
| ⑫ | 放置 = 在线 active 中最少绑定者 + `maxBoxesPerRunner`(8)；两新设置键（`maxBoxesPerRunner` ∥ `workspaceRoot`）各带 UI 写入口 | EXECUTION §3 ∥ SANDBOX §8 ∥ API §2.5 settings 行 | N70（补放置）∥ B68（满） |

### 2.2 关键决策（KD-SV-160…174——全形 = `sandbox/EXECUTION.md` §15）

| # | 决策（一行） |
|---|---|
| KD-SV-160 | 执行面 = 三腿形态 + 三证（零驻留；不装 daemon/不发心跳/无领取方） |
| KD-SV-161 | 队列退场：`sandbox_tasks` 删表，动作 = 请求内幂等直调链（消费面随销） |
| KD-SV-162 | 工作区卷 = 主机路径绑定 `<workspaceRoot>/<ws-id>`（与卷族并存不代管） |
| KD-SV-163 | 配额前置：项目配额 ∥ loopback ∥ 皆不可 ⇒ 建盒停（fail-closed） |
| KD-SV-164 | 出站闸下发 = 全量重算幂等（位次 L1 → … → 默认拒；`iifname "tcws*"` 锚） |
| KD-SV-165 | 域名闸 = server 进程内 DNS 应答器（持答 ≤60s；先下发再应答） |
| KD-SV-166 | 写门实时化（实时探活、零缓存、不降级） |
| KD-SV-167 | 快照 = `archive` 全量存档；上限 = 工作区 `diskMb` 配额（不设独立常量） |
| KD-SV-168 | 空闲/墙钟判据 = `last_active_at`（动作 + 网关流量）∥ 引擎 `StartedAt`；ticker 30s |
| KD-SV-169 | 放置 = 在线 active 最少绑定者 + `maxBoxesPerRunner`；未绑 ⇒ 先放置 |
| KD-SV-170 | 盒运行时通道 = 核同件 + 最小壳；**缝 = 核既有导出写面即契约**（核码零改——解 R76） |
| KD-SV-171 | v22 段 = `sandbox_workspaces` 重建（去 `required_labels_json`、增 `stop_reason`）+ `sandbox_tasks` 删表 |
| KD-SV-172 | 迁移段外提 `src/store/migrations.mjs`（触发线 700 越；命名单源——弃 `schema.mjs` 旧称） |
| KD-SV-173 | 探针执行器 = `deploy/sandbox-probe.mjs`（一次性容器径；零 `docker exec`；PASS/FAIL/SKIP + 退出码） |
| KD-SV-174 | #1351：登记带入 = 单事务（带入行与登记行同拍，失败零残留） |

（各条被否候选与理由 = `sandbox/EXECUTION.md` §15 全形。）

### 2.3 受影响文件表（源/测试；现读 = 2026-10-13 实读；预算以实施当刻实读为准）

**新档（7）**：`thincoder-server/src/sandbox/box.mjs` ≈280 ∥ `…/quota.mjs` ≈120 ∥ `…/egress.mjs` ≈220 ∥ `…/dns-gate.mjs` ≈220 ∥ `…/workspace-routes.mjs` ≈190（工作区面自 `routes.mjs` 拆出）∥ `thincoder-server/src/store/migrations.mjs` ≈430（迁移段链自 `db.mjs` 外提——纯搬移）∥ `thincoder-server/deploy/sandbox-probe.mjs` ≈320（探针执行器）。

**改档（5）**：`sandbox/registry.mjs` 564 ⇒ ≈380（队列/心跳死件删净）∥ `sandbox/routes.mjs` 477 ⇒ ≈340 ∥ `sandbox/docker.mjs` 333 ⇒ ≈430（+networks/archive/状态读）∥ `store/db.mjs` 688 ⇒ ≈300 ∥ `bin/thincoder-server.mjs` 214 ⇒ ≈226（ticker ∥ DNS 闸装配 ∥ 路由注册）。

**契约面（落地归他批）**：`deploy/sandbox/Dockerfile` 现读 19——本档定契约（EXECUTION §8），+≈13（核装 + 壳 COPY）归 member-face 批账。

**单元测试档（2 件——本批，入批档）**：`docs/batches/2026-10-13-sandbox-exec-rebuild.test.mjs` ≈620（动作链/参数集/放置/定时器/实时门/v22 迁移/#1351 事务/拆案读判）∥ `docs/batches/2026-10-13-sandbox-exec-rebuild-egress.test.mjs` ≈330（规则文本位次/下发幂等/DNS 闸三径/解析过滤/临时集回收）。

### 2.4 用例表（全形 = `sandbox/EXECUTION.md` §13）

- **正常 N65–N70**：N65 创建工作区全链（假 Docker + 假 SSH——逐条命中 + 参数集逐值）∥ N66 六动作链（启动/停止/轮换/快照/恢复/销毁）∥ N67 闸下发位次逐行 + 重复下发同结果 ∥ N68 DNS 闸三径（白名单域/纯 CIDR 域/新域 ⇒ 持答 ⇒ 裁定）∥ N69 三定时器（空闲/墙钟/周期快照）∥ N70 放置 + 补放置。
- **边界 B67–B73**：B67 建盒链任一步失败（闸/配额 ⇒ 零建盒）∥ B68 未绑/满员/全离线 ∥ B69 快照越 `diskMb` 上限 ∥ 容器不在 ∥ B70 恢复两径（缺快照/`archive put` 拒 ⇒ SSH 备径）∥ B71 DNS 闸零挂起（L1/显式 deny/非盒源/超时）∥ B72 解析空 ⇒ REFUSED ∥ 部分拒 ⇒ 子集 ∥ B73 规则删行即生效、盒零重建。
- **错误 E50–E55**：E50 节点不可达（逐动作 502；行/卷零半态）∥ E51 SSH 失败（认证/指纹/超时 ⇒ 停 + 人话）∥ E52 #1351 带入事务回滚 ∥ E53 确认门/越权（400/403/401）∥ E54 v21 ⇒ v22 升库（存量保形 + 表消 + 幂等）∥ E55 探针无节点/缺前置 ⇒ SKIP 如实（零假 PASS）。

### 2.5 上抛 / 知会

- **[上抛·待裁] 需求档回笔五处（主 agent 笔）**：① `requirements/PROJECT.md:615`「执行通道 = `exec` 指令面」与 2026-10-10 19:52 口径相抵（本批执行面 = Docker API 直调 + 盒内壳；无该实现面）⇒ 请收正；② `:608`「保护降级两边界（非 git 跳过 ∥ >200 MiB 跳过）」随快照形式收正（非 git 同覆盖；单份上限 = 工作区 `diskMb` 配额）；③ 控制链史句（runner 长轮询/心跳/指令队列）如仍在活面 ⇒ 随正（已废）；④ 两新设置键（`maxBoxesPerRunner` ∥ `workspaceRoot`）在资源行登记；⑤ AC-36 ⑦ 探针句补「执行器 + SKIP 如实」。
- **[上抛·知会] 部署与真机收口 = 父侧**：ECS `.5`/`.6` 复跑探针套件 + 建盒/快照/恢复全链实走（本批设计轮零真机触）。
- **[上抛·知会] 披露五件（不阻塞）**：nft 漂移窗（下发与规则变更之间）∥ DNS 闸只 UDP 53（TCP 53 不答）∥ 快照 = 全量存档（配额内）∥ ticker 30s 粒度 ∥ 探针 SKIP 如实登记。

### 2.6 跨批件随正清单（父侧/实施轮——以当刻盘面实读为准）

① `docs/TEST-ENV-ECS.md`（节点前置 = dockerd 监听 TCP + 工作区根目录——沿 R52②）；② 档目两件（`docs/README.md` §1 + `design/PROJECT.md` §1/§2.1/§3）——**已随本设计轮落**；③ 旧单元测试档引用 `sandbox_tasks`/队列者（实施轮随实施随正）；④ `thincoder-server/package.json` = 零触（门禁链已撤，不增链）。

### 2.7 读回 + 机检（设计轮已跑）

- **读回**：随正各档逐处回读（写入回执 + 行上下文逐条核）；终态行数——`sandbox/EXECUTION.md` 255 ∥ `sandbox/SANDBOX.md` 717 ∥ `store/STORE.md` 718 ∥ `gateway/API.md` 535 ∥ `ops/OPS.md` 411 ∥ `accounts/ACCOUNTS.md` 269 ∥ `agent/MEMBER-AGENT.md` 249 ∥ `design/PROJECT.md` 888 ∥ `docs/README.md` 167。
- **机检**：`node scripts/doc-check.mjs --root D:\teamcode\thincoder` ⇒ 悬空 44 → **34**、行宽 33 → **29**（本批新增项清零——新档路径全带「（拟新增）」标记；余量 = 既有存量面）。首轮机检命中本批新增 14 处（悬空 10 + 超宽 4）——已全部修正（ACCOUNTS §2.1 三行拆分 ∥ OPS §5.10 两行拆分 ∥ SANDBOX 前注拆分 ∥ 各新档路径补标记）。

### 2.8 边界（本批不做）

三端沙盒/工作区面（登记随 #1215 成员会话面）∥ Swarm 集群 ∥ 端口映射/网络面 ∥ 节点禁用/排空 ∥ TLS ∥ 盒镜像内容治理 ∥ 卷族↔工作区卷代管（并存不代管）∥ 成员面写面（member-face 批开）∥ 队列回退（无队列——队列本身退场）∥ 真机收口（父侧）。

### 2.9 三链一致自查

批次条目（§2.1 ①–⑫） = 设计档判据（`sandbox/EXECUTION.md` §12 ∥ `sandbox/SANDBOX.md` §11/§12/§13） = 需求档条目（§5 沙盒块 + AC-36 ⑦ + 本批范围五块）——同源；需求档差异五处已列 §2.5（笔 = 主 agent，设计不代笔）。

### 增补块（2026-10-13 · 设计修订轮 —— 底座可换；用户 21:32「底座那个做完整功能吧」）

**批范围增补**：工作区盒「底座可换」完整功能 = ① 工作区级底座绑定（`sandbox_workspaces.base_image`——NULL = 标准 `settings.image`；写面 = PATCH `baseImage` 键，`null` = 恢复标准；生效 = 下次建盒/重建）② 派生构建（节点侧 `POST /build`；上下文 = 单 Dockerfile tar——零源码上传/零网络；tag = `thincoder-sandbox:base-<hash12>` 内容寻址；就位四步 = 读底座（缺⇒拉取携凭据）⇒读标准镜像（缺⇒停）⇒tag 探（在场⇒采用）⇒build（超时 10 分钟；失败两形皆收））③ 私有仓凭据（server 全局表 `registry_credentials` + 四端点；拉取注入 `X-Registry-Auth`；密列零回显）④ 控制台两卡（底座卡 + 私有仓凭据卡——标签②；`views-sandbox-base.mjs`）⑤ 审计四 kind（`workspace_base`／`image_derive`／`registry_credential_set`／`registry_credential_revoke`）+ `image_pull` 增 `auth` 键（仅实构才落）。

**受影响文件**（全形 = `sandbox/EXECUTION.md` §14；webui 面 = `webui/WEBUI.md` §5）：

- 服务端新增：`src/sandbox/derive.mjs`（≈200）∥ `src/sandbox/registry-creds.mjs`（≈130）∥ `src/sandbox/registry-cred-routes.mjs`（≈110）
- 服务端改动：`src/sandbox/image-routes.mjs`（实读 132 ⇒ ≈150——拉取凭据注入 + 审计 `auth` 键）∥ `src/sandbox/workspace-routes.mjs`（`baseImage` 读/写两处）∥ `src/sandbox/box.mjs`（建盒链增「④ 镜像就位」——仅自定义底座；缺省零新增调用）∥ `src/sandbox/docker.mjs`（构建面）∥ `bin/thincoder-server.mjs`（端点注册）∥ `src/store/migrations.mjs`（430 ⇒ ≈470）
- 前端新增：`public/views-sandbox-base.mjs`（≈260）
- 前端改动：`public/views-sandbox.mjs`（≈511 ⇒ ≈515——两卡挂载）∥ `public/i18n-{zh,en}-sandbox.mjs`（+≈26 键/表）∥ `public/i18n-{zh,en}-system.mjs`（kind 四键）
- 单元测试档（随批留存——批目录）：`docs/batches/2026-10-13-sandbox-exec-rebuild-base.test.mjs`（≈320）∥ `docs/batches/2026-10-13-sandbox-exec-rebuild-base-ui.test.mjs`（≈220）
- 文档：`sandbox/EXECUTION.md`（§3/§8/§12–§17）∥ `sandbox/SANDBOX.md`（§2/§3/§8/§9/§11/§13–§16）∥ `store/STORE.md`（v22 段）∥ `gateway/API.md` §2.5 ∥ `accounts/ACCOUNTS.md` §2.1 ∥ `ops/OPS.md` §5.10 ∥ `webui/SANDBOX.md`（§2.1①/§3/§4）∥ `webui/WEBUI.md`（§1/§5）∥ `design/PROJECT.md`（§2.1/§4/§7/§9）

**用例（增补——全形 = `sandbox/EXECUTION.md` §13）**：N71/N72（正常——派生构建全链/凭据 CRUD）∥ B74/B75（边界——缓存命中零构建／无绑定腿零行为变化）∥ E56/E57（异常——底座缺且拉取败／构建失败两形）。

**验收对照（三链同源 = 需求档（拟入册——主 agent 笔） ∥ 批档本段 ∥ 设计档判据）**：

- 功能点 52 ∥ AC-52（**拟入册**——`sandbox/SANDBOX.md` §16 R74①）：① 底座绑定在册（含「恢复标准」与生效时机）② 派生构建在册（缓存/重建两径 + 失败两形人话）③ 私有仓凭据在册（零回显/零回填 + 拉取注入；未命中匿名）④ 缺省腿零行为变化（参数集逐值不变 ∥ 调用计数不变 ∥ 零新审计行）⑤ 审计四 kind + `auth` 键（成事才落）。
- 判据落点 = `sandbox/SANDBOX.md` §11 底座可换行 ∥ §12 用例 ∥ `webui/SANDBOX.md` §4 行 ∥ `sandbox/EXECUTION.md` §15（KD-SV-184…191）。

**机检读数（修订轮收口 · `node scripts/doc-check.mjs --root D:\teamcode\thincoder`）**：锚面悬空 **35**——逐条核对，无一出自本轮改动行（存量旧账）；行宽面 **69 ⇒ 25 行超 300 字符**——本轮自改 9 行已折行清零；另修一处结构缺陷（`sandbox/SANDBOX.md` 缺 `## 变更记录` 标题 ⇒ 其换行记录约 40 行未入豁免区带，标题补入后入带）。本段新增零悬空、零超宽。

**上抛/待裁与余项**：① 前提二档呈裁（甲 = 自带 Node ≥24（推荐基线）∥ 乙 = `COPY --from=node:24-slim`（glibc 系限定））；② 需求档回笔 = 功能点 52 ∥ AC-52 入册（主 agent 笔）；③ `TEST-ENV-ECS.md` 派生前置随正（父侧）；④ `views-sandbox.mjs` 越 500 软线为既有状态（处置另裁——本笔列报）；⑤ 真机派生依赖 member-face 批件位契约（`/opt/thincoder/app`——机检不受阻）；⑥ 构建器 legacy/BuildKit 同形为设计口径（实施当刻核实）。

## 第 2 段 · 修复轮（设计评审轮 1 · 评审 #91——14 条逐号落 · eng-designer · 2026-10-13）

**依据**：本档 §3 轮次 1（14 条：2🔴/8🟡/4🔵——父侧逐条采纳零驳回）。**逐号处置**（号 → 改动 `file:line`；行号 = 当刻 2026-10-13）：

| # | 级 | 处置 | 改动坐标 |
|---|---|---|---|
| 1 | 🔴 | 落：`input` 基线链（同锚 `iifname "tcws*"`、同盒链同位次——盒 → 宿主自身方向）+ 位次/复核/判据腿/真机腿同拍 | `sandbox/EXECUTION.md`:106（规则文本）∥ :113（下发）∥ :114（就位复核）∥ :180（§10 判据腿）∥ :210（§13 N67 两链断言）∥ `sandbox/SANDBOX.md`:333（§4① 两方向）∥ :482（§11 P2「input 链腿」） |
| 2 | 🟡 | 落：未绑 403 ⇒ 503 两处（单源 503）；人话两因分列（因一「先放置」= 未绑 ∥ 因二「待人放」= 无候选） | `EXECUTION.md`:79（§3 放置）∥ :215（§13 B68）∥ :272（§15 KD-SV-171）∥ `gateway/API.md`:167（§2.5 动作行单源括注同拍） |
| 3 | 🟡 | 落：`last_active_at` 取数源明写 = 派生读两源（源一 = `usage` 键索引 `idx_usage_key_ts` ∥ 源二 = 审计动作行 `detail.workspaceId`）——零新列（v22 段后列面零动） | `EXECUTION.md`:83-85（§3 定时器）∥ :270（§15 KD-SV-169） |
| 4 | 🟡 | 落：启动确保链 = ①→②→⑤→⑥→⑦ ∥ 轮换重建 = 删容器 → ①→② → ⑥ → ⑦（② 配额就位步句同拍） | `EXECUTION.md`:54 ∥ :57 ∥ :93（§4 取值句） |
| 5 | 🟡 | 落：读数收平（同一基准、小计 = 分项和）——migrations ≈470 ∥ box ≈315 ∥ workspace-routes ≈280 ∥ docker 333（陈读 327 收正）∥ bin ≈229；小计 ≈**+1866**（实施段 ≈+1180 ∥ 增补 ≈+686）；增 `image-routes` 行 | `EXECUTION.md`:242-254（§14）∥ `SANDBOX.md`:608 ∥ :620 ∥ :625 ∥ :626 ∥ :630 ∥ :631 ∥ :633（小计）∥ :650（增补和）∥ `agent/MEMBER-AGENT.md`:195（Dockerfile 18 ⇒ **19**、预算 ≈30 ⇒ **≈32**） |
| 6 | 🟡 | 落：`views-sandbox.mjs` 拆案（首选 = 托管接入件外拆 `views-sandbox-onboarding.mjs`（拟新增））+ 触发句 + 行为上限句；实读 502 收正 | `webui/SANDBOX.md`:81（件行尾注）∥ :100-101（拆案句） |
| 7 | 🟡 | 落：段号按结构单源收正（v22 ⇒ **v23**）+ 拆案归属 = 本批实施 + 读数收正 | `agent/MEMBER-AGENT.md`:62 ∥ :193 ∥ :169（§3.10 镜像行——前笔声明未落，同拍补）∥ `store/STORE.md`:674 |
| 8 | 🔵 | 落：补「最近先例（三坐标）」行（镜像族拉取径 ∥ 主机凭据面 ∥ 节点侧构建流——对齐/偏离逐条 + 实现坐标） | `EXECUTION.md`:7-12（头注） |
| 9 | 🔵 | 落：`design/PROJECT.md` §3 补 `sandbox/EXECUTION.md` 行（域行 12 ⇒ 13 与标题/§1 取齐）+ webui 行「面档 11」⇒ **12**（枚举 12 名在行）同拍 ∥ `docs/README.md` server 部分终值照实收平（设计 **27** ∥ 部分 **28 档**）+ 六部分总档数 81 ⇒ **82**（+ `agent/MEMBER-AGENT.md` 补登——member-face-chat 批） | `design/PROJECT.md`:98 ∥ :94 ∥ `docs/README.md`:17 |
| 10 | 🔵 | 落：跨批排序约束在册（前置 = `deploy/sandbox/Dockerfile` 件位契约就绪；未就绪 ⇒ 真机腿如实 SKIP——零假 PASS） | `EXECUTION.md`:299（§17） |
| 11 | 🔵 | 落：`parseImageRef` 补实现坐标 | `EXECUTION.md`:149（§8） |
| 12 | 🔵 | 落：host 用途面补「④ 恢复清卷（`rm -rf <path>/*`）」+「§3.6」⇒「§3 恢复行」 | `EXECUTION.md`:38（§2.2） |
| 13 | 🔵 | 落：桥名落地机制（`networks/create` 载荷 `Options.com.docker.network.bridge.name`）+ 读回复核（不符 ⇒ 停） | `EXECUTION.md`:49（§3 底座） |
| 14 | 🔵 | 落：甲档前提补「基底须可执行 `RUN`（含 shell）」+ 校验层/B74 同拍 | `EXECUTION.md`:156 ∥ :159 ∥ :229（§13 B74） |

**同拍条目（一致性面——发现即修同报，非评审 14 条内）**：① `design/PROJECT.md`:94「面档 11」⇒ 12（枚举 12 名在行——终批批随正未落）；② `agent/MEMBER-AGENT.md`:62「（v22——」⇒ v23（§3.2 段号——前笔声明未落）；③ `agent/MEMBER-AGENT.md`:169 §3.10 镜像行补现读 19 + 件位契约指针（前笔声明未落）；④ `docs/README.md` server 部分 / 六部分总档数照实收平（`agent/MEMBER-AGENT.md` 首次登记——设计 25 ⇒ 27 ∥ 81 ⇒ 82）；⑤ `EXECUTION.md`:272 KD-SV-171 词面「等待放置」⇒「待人放」（一词一事）；⑥ `SANDBOX.md`:625/:630 两行同类基准收正（bin ≈229 ∥ workspace-routes ≈280——与 box 同族，父侧清单外同类邻行）。

**读回（D6——八档逐项断言全 PASS）**：`hook input` 在 ∥ 「等待放置」清零 ∥ `403 \`sandbox_unavailable\`` 清零 ∥ 小计 ≈+1866 在 ∥ `idx_usage_key_ts` 在 ∥ `image-routes` 行在 ∥ §17 跨批约束在 ∥ 「§3.6」陈指针清零（余一处在本档变更记录引文——记录面）∥ 桥名载荷在 ∥ 甲档 shell 句在 ∥ 先例段在；`SANDBOX.md`：327 陈读清零 ∥ ≈+1180 ∥ ≈+686 ∥ P2 input 腿 ∥ 强制面两方向；`STORE.md`：v23 段号 ∥ 「现读 ≈760」投影清零；`MEMBER-AGENT.md`：675 清零 ∥ 688 现读 ∥ §3.2 v23；`API.md`：两因分列；`PROJECT.md`：§3 表行 15（板 2 + 域 13）∥ 面档 12；`webui/SANDBOX.md`：拆案句；`README.md`：⇒ 82。

**机检读数**（`node scripts/doc-check.mjs --root D:\teamcode\thincoder`——修复轮两读）：行宽 **32 ⇒ 25 条**（本批编辑引入的 7 处已全部修平——`EXECUTION.md`:8/9/46/80/143/152 ∥ `webui/SANDBOX.md`:100；余 25 条 = 存量他批行，未动）；锚面 悬空 **35 条**（与编辑轮前同值——逐条核过，无一落本批编辑行；本批触行的 `（拟新增）` 族 = 列报 · 不入闸）；行数面 **78 条**（**报告态 · 非闸**——回填工单，清单即该面输出）。

**注**：行号 = 当刻（2026-10-13）；产品码零触（设计轮）。八档变更记录已逐档落一行（`sandbox/EXECUTION.md` ∥ `sandbox/SANDBOX.md` ∥ `store/STORE.md` ∥ `agent/MEMBER-AGENT.md` ∥ `gateway/API.md` ∥ `design/PROJECT.md` ∥ `webui/SANDBOX.md` ∥ `docs/README.md`）。需求档回笔 = 主 agent 笔（未动）。

**2026-10-13 · 乙档落定（fix 轮——呈裁消解；用户 22:38 裁「乙」）**

**依据**：批档 §1「2026-10-13 22:38 · 用户裁定（底座前提 = 乙）」（用户原话「乙」；父侧推荐乙）⇒ 呈裁项消解：**乙 = 选定形**；甲档历史归记录面（本档 §1），规范面按 D8 收正。变更源 = 用户裁定（非评审表）；执行者 = 本轮派发（eng-designer）。需求档 = 父侧笔（功能点 52 前提行 + AC-52 ⑥ 已收正——本席只核未动，`:345`/`:410` 实读在册）。

**设计面收正（点 → 改动 `file:line`；行号 = 当刻 2026-10-13 读回）**：

| 点 | 处置 | 改动坐标 |
|---|---|---|
| ① | §8 前提句 = 乙选定形：**node 件随派生像自带**——取件段（`COPY --from=<标准镜像>` 补 node 运行件 `/usr/local/bin/node`）+ 校验层与 `CMD` 同指取件件（绝对路径——零 PATH 依赖）+ glibc 系限定（musl/Alpine ⇒ 校验层失败如实拒 + 人话）+ 节点前置写死 = 标准镜像在节点（供体即标准镜像——零新增前置） | `sandbox/EXECUTION.md`:160-162（前提句三段）∥ :156-157（派生 Dockerfile 行随正——取件段 ∥ 校验层语义 ∥ 件位段 ∥ CMD）∥ :155（就位②人话「先备供体镜像」+ 供体定义） |
| ② | §15 KD-SV-187 收正（决策 = 乙；甲入被否列——D8；供体择定理由在行） | `sandbox/EXECUTION.md`:281 |
| ③ | §13 B74 换乙档失败形（musl/Alpine 取件不可执行 ∥ 无 shell ∥ 供体不在节点（= 标准镜像）∥ 未绑定；处置句随正「glibc 系」）+ N71 补 node 取件行逐值 | `sandbox/EXECUTION.md`:229（N71）∥ :231（B74） |
| ④ | 「基底须可执行 `RUN`（含 shell）」前提句保留 | `sandbox/EXECUTION.md`:161 |
| ⑤ | 同源随动 = `sandbox/SANDBOX.md`（§3 块 ①/④ ∥ §11 判据行 ∥ §14 指针行——二档句全清） | `sandbox/SANDBOX.md`:146 ∥ :149 ∥ :470 ∥ :713 |
| ⑥ | §16 边界行「乙档实现（前提裁「乙」前不做——甲基线）」失效句**删除**（无剩余乙档余项——node 随包带即本设计形） | `sandbox/EXECUTION.md`:292 |

**同拍补充（一致性面 · 表外一处——发现即修同报）**：`design/PROJECT.md`:118（域 KD 枚举行「前提二档」⇒「前提（乙——Node 随包带）」——与 SANDBOX §14 指针行同类收正）。**其余面零触（实读核过无二档句）**：`store/STORE.md` ∥ `ops/OPS.md` ∥ `gateway/API.md` ∥ `accounts/ACCOUNTS.md` ∥ `webui/**` ∥ `agent/MEMBER-AGENT.md`（`node:24-slim` 残留 = 标准镜像基座句——合法，非前提句）。

**供体择定与理由（择一写死 = 标准镜像）**：① **零新增前置**——标准镜像本就必在节点（镜像就位四步 ② 既有前置「404 ⇒ 停」）；`node:24-slim` 供体须另备一像 + 部署文档加一条前置；② **node ≥24 由构造保证**——标准镜像基座 = `node:24-slim`（实读 `thincoder-server/deploy/sandbox/Dockerfile:10` = `FROM node:24-slim`）；③ **件位同源**——核/壳件（`/opt/thincoder/app`）与 node 件自同一像取，零第二供体源（「核与 server 同源钉住」契约自然延伸到 node 件）。

**读回（D6——逐项断言，过）**：`sandbox/EXECUTION.md`——规范面「甲档/甲（基线）/乙（扩展）/乙档实现/先备镜像」清零（残 = 变更记录 :307/:309 记录面，按史留存）∥「先备供体镜像」三处（:155/:162/:231）∥ `/usr/local/bin/node` 四处（:156/:157/:160/:229）∥ §8 三段前提句在（:160-162）∥ B74 换形在（:231）；`sandbox/SANDBOX.md`——§3 两行（:146/:149）∥ §11 行（:470）∥ §14 指针行（:713）∥ 本批记录行（:804）读回在；`design/PROJECT.md`:118 读回在。**产品码零触（设计轮）。**

**机检读数**（`node scripts/doc-check.mjs --root D:\teamcode\thincoder`——改前/改后两读对比）：**悬空 35 → 35**（同值；本批编辑行零新增——sandbox 域触行全为「拟新增 / 迁移期引文——列报 · 不入闸」族）∥ **行宽 25 → 25**（同值；`sandbox/SANDBOX.md`:406/:418/:641 三条 = 存量旧账，前后逐值同（302/406/305），非本笔）∥ 行数面 = 报告态（非闸）。**本批域零新增闸红（③ 达标）。**

### 增补 #2（2026-10-13 · 连接面 TLS 档——用户 22:43 范围增补；fix 轮 · eng-designer）

**来源**：§1「2026-10-13 22:43 · 用户裁定」——用户原话「我其实很喜欢现在这种方式，靠安全组控制，使用简单方便，不过，我也想加上B，只是TLS证书认证，让用户可选。」⇒ 范围 = A 保缺省（明文 + 安全组，零行为变化）∥ **B 增为可选档**（TLS 客户端证书——节点级二择）∥ C（SSH 隧道）不取。

**本轮任务（点 ①–⑦ 全落，设计面）**：
1. **形态** = 地址 scheme 单源（`http://` 明文缺省 ∥ `https://` TLS；**不设 mode 列**；裸 host 按档补 scheme + 缺省端口 2375/2376；档与显式 scheme 相抵 ⇒ 400；不携档 = 明文零行为变化）。
2. **传输** = `node:https` 适配件（fetch 形最小件；`ca`/`cert`/`key` 逐值入选项；插既有 `fetchImpl` 缝；`requestImpl` 假件缝；**明文路径恒用注入 `fetchImpl`**——否决 undici：非 Node 公共导出，实测 `ERR_MODULE_NOT_FOUND`）。
3. **材料** = 三件（CA ∥ 客户端证书 ∥ 客户端私钥）用户自备（不自建 PKI）；私钥 AES-256-GCM（复用 `credential-crypto.mjs`）；**零回显 / 零回填**（只进不出）；不变量 `https` ⇔ 三件齐；**关 TLS = 原子**（地址回 `http` + 材料清零——同事务）。
4. **写面两端点** = `POST …/runners` 体扩 `connection`/`tls` + 新 `PUT …/runners/:id/connection`（**全列覆写**；**先自检后落库**——失败 ⇒ 库零变）。
5. **存储** = v22 段 `ALTER sandbox_runners` 四列（`tls_ca`/`tls_cert`/`tls_key_cipher`/`tls_updated_at`——列级加性；存量行 NULL ⇒ 明文档零回填）。
6. **审计** = 新 kind `runner_connection`（detail = kind+runnerId+address+tls——零秘密；既有节点面 kind 逐枚核过不覆盖）+ `runner_add` detail 增 `tls` 布尔键；切换自检失败沿 `runner_selfcheck_failed`。
7. **控制台** = 添加节点弹窗连接段 + 节点行「连接」动作 + 连接方式编辑窗（新档 `views-sandbox-connection.mjs`（拟新增）≈150；`views-sandbox.mjs` +≈15）。

**范围外（逐项）**：材料轮换/续期机制 ∥ 材料查看/导出 ∥ 节点侧 TLS 服务端配置（dockerd 侧——在机）∥ 配对/信任链管理 ∥ 按节点代理链 ∥ 托管接入面 TLS（装机径 = `:2375` 明文不变——登记后经「连接」编辑面切档）。

**落点（本轮设计修订——9 档）**：`sandbox/SANDBOX.md`（§2 v22 句+列面/审计块 ∥ §3 连接方式块 ∥ §9 端点句 ∥ §11 判据行 ∥ §13 四行 delta+`docker.mjs` 越线拆案句+件清单 ∥ §14 KD 指针 ∥ §15 三处 ∥ §16 R74 ∥ 变更记录）∥ `sandbox/EXECUTION.md`（§1 ∥ §2.1 传输落点 ∥ §9 ③ ∥ §12 ∥ §13 N73/B76 ∥ §14 件/delta/小计/测试档 ∥ §15 KD-SV-192…195 ∥ §16 ∥ §17 R74 ∥ 变更记录）∥ `store/STORE.md`（§1 版本链 ∥ §2 v22 段 ⑤ ∥ §3 v22 判据 ∥ §4 预算）∥ `gateway/API.md` §2.5（改 POST 行 + 增 PUT 行）∥ `accounts/ACCOUNTS.md` §2.1（`runner_connection` + `runner_add` 增键 + 写入点）∥ `ops/OPS.md` §5.10（TLS 句收正 + 增条）∥ `webui/SANDBOX.md`（§2.1① 弹窗/行钮/编辑块 ∥ §3 件行/读数/键族登记/拆案块收正 ∥ §4 AC 行 ∥ 变更记录）∥ `webui/WEBUI.md`（§1 静态面/档目链/指向表）∥ `design/PROJECT.md`（§2.1 ∥ §3 ∥ §4 1–195 ∥ §7 AC-53 ∥ §9 R74）。

**随正件（实施轮 / 父侧；以当刻盘面实读为准）**：`docs/batches/2026-10-10-runner-admin-console.test.mjs`（E34 语义随正（https 400 因 = 档相抵/缺三件）+ **列面断言 +四列**）∥ `docs/batches/2026-10-10-runner-admin-console-ui.test.mjs`（添加弹窗体增 `connection` ∥ 行钮 +1 ∥ 键集 +≈16）∥ `docs/batches/2026-10-08-server-public-structure.test.mjs`（档目 +2 名：`docker-tls.mjs` ∥ `views-sandbox-connection.mjs`；键集指纹随正）∥ `docs/TEST-ENV-ECS.md`（节点侧 dockerd TLS 配置步骤 + 证书自备句）。

**批内单元测试档（拟新增——入批档存；不入任何门）**：`docs/batches/2026-10-13-sandbox-exec-rebuild-tls.test.mjs` ≈180（三件形校验/加密往返 ∥ 适配件选项逐值（假 `https.request`）∥ 连接端点两腿 ∥ 明文零行为变化腿）∥ `…-tls-ui.test.mjs` ≈140（添加窗连接段 ∥ 行「连接」钮 ∥ 编辑窗 ∥ i18n 键集）。

**验收（判据回指）**：功能点 53 ∥ **AC-53（拟入册——主 agent 笔**；建议 + 全形指针 = `sandbox/SANDBOX.md` §16 R74「增补 #2」）——判据面：形态（`sandbox/SANDBOX.md` §3 连接方式块 ∥ §11 行）∥ 传输（`sandbox/EXECUTION.md` §2.1/§13）∥ 存储（`store/STORE.md` §2 v22 段 ⑤ ∥ §3 v22 判据）∥ 审计（`accounts/ACCOUNTS.md` §2.1）∥ 端点（`gateway/API.md` §2.5 两行）∥ 控制台（`webui/SANDBOX.md` §4 连接面行）；用例 = `sandbox/EXECUTION.md` §13（**N73** ∥ **B76**）+ KD-SV-192…195（`sandbox/EXECUTION.md` §15）；真机收口 = ECS `.6` 节点侧 TLS 就位 ⇒ 自签三件 ⇒ 切档 ⇒ 自检过 ⇒ 全谱可用 ⇒ 切回明文（材料清零）。

**机检读数（本笔末——`node scripts/doc-check.mjs --domain server` 后读）**：**锚 = 0 悬空 ✓** ∥ **行宽 OK ✓**（区带豁免在效）∥ 行数面 = **报告态 79 条**（既有基线；本笔新增一条 = `webui/SANDBOX.md:87 views-sandbox-connection.mjs（盘无档）`——拟新增档行，同「底座可换」`views-sandbox-base.mjs` 先例形式）。**产品码零触（设计轮）。**

**上抛**：① **[上抛·知会]** `views-sandbox.mjs` 拆案——托管接入外拆**实测 ≈190** ≠ 预案估 ≈75+（超本期体量）⇒ 本轮不落，**触发句保留**（触发 = 下一触碰该档的批；估值收正入 `webui/SANDBOX.md` §3 拆案块）② **[上抛·知会]** 需求档功能点 53 ∥ AC-53 = 主 agent 笔（本轮只出建议 + 全形指针）③ **[上抛·知会]** `docs/TEST-ENV-ECS.md` 节点侧 TLS 步骤 = 父侧/实施轮 ④ **[上抛·知会]** `docker.mjs` 投影 ≈515 越 500 软线——拆案首选 = 镜像族三法外拆（触发 = 下一触碰该档的批；`sandbox/SANDBOX.md` §13 句在册）。

## 第 2 段 · 修复轮（设计评审轮 2 · 评审 #100——四条逐号落 · eng-designer · 2026-10-13）

**依据**：本档 §3 轮次 2（4 条：1🔴/2🟡/1🔵——父侧裁定「四条全数采纳，逐号执行」）。**逐号处置**（号 → 改动 `file:line`；行号 = 当刻 2026-10-13 读回）：

| # | 级 | 处置 | 改动坐标 |
|---|---|---|---|
| 1 | 🔴 | 落：§3 连线口径行按增补 #2 单源收正（**按档补 scheme**——明文档缺协议补 `http://`、缺端口补 `2375`；TLS 档缺协议补 `https://`、缺端口补 `2376`；**显式 scheme 与档相抵 ⇒ 400**）；同族 E34 措辞同拍（400 因 = 「空 ∥ 相抵 ∥ 缺件」——不再为「scheme 拒」） | `sandbox/SANDBOX.md`:54 ∥ :541 |
| 2 | 🟡 | 落：iptables 备径补**两向同挂**（`FORWARD` + `INPUT` 各一跳入 `TC-EGRESS`——同锚 `-i tcws+`、同序 = 盒链位次照上；缺 `INPUT` 跳 ⇒ 盒 → 宿主自身方向裸奔） | `sandbox/EXECUTION.md`:116 |
| 3 | 🟡 | 落：增补 #2 分项/小计取**同一基准**收平——处数一致（六处）∥ 逐项值两档逐字同值（`routes` +≈55 ∥ `registry` +≈30 ∥ `docker` +≈25 ∥ `migrations` +≈10 ∥ 容器/镜像/卷/终端四路由（各 +≈3）≈12 ∥ 盒链 `config` 透传 +≈3）∥ 小计 = 分项和（六处 delta ≈135 + `docker-tls.mjs` ≈220 ⇒ 本增补 #2 ≈**+355**；总小计 ≈+1866 ⇒ **≈+2221** = ≈+1180 + ≈+686 + ≈+355） | `sandbox/EXECUTION.md`:264 ∥ `sandbox/SANDBOX.md`:670 |
| 4 | 🔵 | 落：词面残留「等待放置」⇒「待人放」（一词一事） | `sandbox/SANDBOX.md`:404 |

**同源句扫描（① 全扫——逐处列报）**：

- **已收（活动面）**：`sandbox/SANDBOX.md`:54（本笔）∥ :541 E34（本笔）。
- **在册且已同拍（活动面——实读核过，零改）**：`sandbox/SANDBOX.md`:62（节点侧前置 TLS 档可选）∥ :325（形态 = 地址 scheme 单源）∥ :328（不变量 `https` ⇔ 三件齐）∥ :329（写面两端点——形非法 ⇒ 400 零外呼）∥ :438（§9 连接面端点句）∥ :488（§11 判据行）∥ :753/:755/:757（§15 收口/余项——TLS 档已落）∥ `sandbox/EXECUTION.md`:36（地址归一按档）∥ :209（§12 判据行）∥ :294（KD-SV-192）∥ `gateway/API.md`:135/:139（端点行——按档补 scheme + 相抵/缺件 ⇒ 400）∥ `requirements/PROJECT.md`:350（需求侧——父侧笔）。
- **留（记录面——dated 历史语句，按史留存）**：`sandbox/SANDBOX.md`:53（runner-admin-console 批「本批射程……不做 TLS」——该批用户 19:59 令）∥ :80（§3 提议表 ①「不做 TLS」——父侧提议 + 代价栏；收口指针 = :753「TLS 档已落……§3 提议① 以节点级可选档兑现」）∥ :767（R53④ 披露行——该批）∥ :800（变更记录——2026-10-11 scheme 判定收严）∥ `sandbox/EXECUTION.md`:320（变更记录——该轮小计 ≈+390 的当时值；本笔新条目 :318 已记过渡）∥ 本档 §2 旧块（`:48`「离线「等待放置」」——§2 append-only，旧行不改，本块列报）。
- **留（他批/本笔清单外——报父侧定夺）**：`docs/batches/2026-10-10-runner-admin-console.md`:180（该批 §2 设计句「地址归一 `http://<host>:<port>`……`https:` 拒」——其规范源 = `sandbox/SANDBOX.md` §3，本笔已收正）∥ 同档 :529 披露①（`normalizeDockerAddress` 主机名形被拒——实现面缺陷）∥ `docs/batches/2026-10-10-runner-admin-console.test.mjs`:221–233（E34 断言「https: ⇒ 400」——**已登记随正件**（本档增补 #2 随正件「E34 语义随正」），留实施轮）。

**读回（D6——当刻实读）**：`SANDBOX.md`——:54 按档方案句在 ∥ :404「待人放」在（全仓同词余 = 记录面：本档 :783 变更记录 + 本档 §2 旧块 + §3 评审引文）∥ :541 E34 措辞在 ∥ :670 六处 delta ≈135 ∥ 分项和 ≈+355 在 ∥ :783 新变更记录行在；`EXECUTION.md`——:116 两向同挂在 ∥ :264 小计 ≈+2221 在 ∥ 六处 delta ≈135 在 ∥ :318 新变更记录行在。行数（读回口径）——`sandbox/EXECUTION.md` 329 ∥ `sandbox/SANDBOX.md` 831。

**机检读数**（`node scripts/doc-check.mjs --root D:\teamcode\thincoder`——改前/改后两读）：**悬空 35 → 35** ∥ **行宽 26 → 26**（同值；sandbox 域三条存量 = `SANDBOX.md`:419/:431/:658——前后逐值同（302/406/305），非本笔）∥ 候选面随新增文字 +11（62516 → 62527——非闸）。**本轮新增闸红 = 0。**

**本轮不做（明写）**：① 需求档（`requirements/PROJECT.md`——父侧笔）零触（实读 :350 已同拍）；② 清单外档零触（`gateway/API.md` ∥ `ops/OPS.md` ∥ `store/STORE.md` ∥ `webui/**` ∥ `design/PROJECT.md`——实读同源句已同拍）；③ 产品码/测试档零触（E34 断言随正 = 已在册随正件，实施轮）；④ 他批批档零触（列报见上）；⑤ 零新语义（四条 = 评审发现直接导出项；小计收平 = 同一基准复算）。

### 收口修复轮（设计面）——挂单 B/D/E/F + 回填落定 · eng-designer · 2026-10-14

**依据**：本档 §6 挂单（:654 A–I 处置表——本轮射程 = B/D/E/F + 回填；A/G/I 已闭环）+ 父侧派发（全量口径与坐标勘定）；父侧 2026-10-14 两次更新（API.md D5 冻结 → 解除 ⇒ 照落）。**产品码零触（设计轮）**——`git status` 实读 = 改动全为设计档（九档）+ 他批在途件。

**B（补放置失败审计——补 kind）**：kind = **`placement_failed`**（循 `_failed` 族形 + 设计词面「放置」；detail 键集 = `kind`+`workspaceId`+`runnerId`+`reason`（截 300 字）——沿 `quota_apply_failed` 同形）。设计落点 = `accounts/ACCOUNTS.md` §2.1 增补块增行（:75）+ 变更记录（:226）∥ `sandbox/EXECUTION.md` §3 放置句补 kind 名（:84-85）+ §13 N70 同拍（:222）+ 变更记录（:330）。**实施面连带（一次落全）**：① `src/sandbox/box.mjs:662-664` catch 补 `auditBox`（kind/target/detail 如上行；`deps.log` 行保留）；② `public/views-audit.mjs` `SANDBOX_KIND_KEYS` +1（键 `audit.sandboxKind.placement_failed`）；③ `public/i18n-{zh,en}-system.mjs` +1 键/表（zh「放置失败」/ en "Placement failed"）；④ 计数链 = `webui/SANDBOX.md` §3 复算块（已落）。

**D（dirty 删键）**：设计面逐处收正——`sandbox/EXECUTION.md`:59 ∥ `sandbox/SANDBOX.md`:335/:371（两处）/:383/:502/:684 ∥ `agent/MEMBER-AGENT.md`:34/:126/:157 ∥ `webui/SANDBOX.md`:58/:75/:133/:159 区 ∥ `webui/WEBUI.md`:61 ∥ `gateway/API.md`:169/:187（**冻结解除后照落**——:169 读数句去 dirty、:187 行形去 dirty 键）。**实施面连带**：盒读数形去 `dirty`（`registry.mjs:331-336` ∥ `box.mjs:274/291`）∥ 消费两路去键（`routes.mjs:391` ∥ `workspace-routes.mjs:75`）∥ 销毁门报文去 `dirty=` 段（`workspace-routes.mjs:271`）∥ 成员视图列删（`views-me-sandbox.mjs:84/91`——表五列）∥ i18n 三键退役（`me.sandbox.colDirty`/`dirtyYes`/`dirtyNo`——me 两表）。**缺省容受** = 视图去列后零引用（实施轮核）。**留项（需求档——主 agent 笔）**：`docs/server/requirements/PROJECT.md`:496/:504/:506 含 `dirty`（:504 且「六列」）——上抛随正（不在本席写域）。

**E（`config_update` 写点入表）**：`accounts/ACCOUNTS.md` §2.1（:69）补沙盒设置写入点（`sandbox/routes.mjs` PATCH /api/admin/sandbox/settings——变更才落、同值零行；target `sandbox_settings`）。零键增/零型面动。

**F（非 IPv4 ⇒ fail-closed）**：落 = `sandbox/EXECUTION.md` §3 **链前置**（:82——建盒/启动确保/轮换重建三链停 + 人话）+ §5 内置允许句（:112）+ §12 判据（:202）+ §13 B77（:244）∥ `sandbox/SANDBOX.md` §4 段值推导句补盒链停（:322-323）。**三链同判**（同一陷阱面：内置允许与盒 DNS 同源同缺——不拆分）；收窄至单链如需 = 一句话可缩。

**回填**：`sandbox/EXECUTION.md` §14——补本批触碰档七行（`chat-tools.mjs` 504 ∥ `chat.mjs` 692 ∥ `hosts.mjs` 134 ∥ `ssh.mjs` 229 ∥ `container-routes.mjs` 324 ∥ `volume-routes.mjs` 103 ∥ `terminal-routes.mjs` 342 ⇒ 362（TLS 终端腿 +20））+ probe **679** / `-tls` 单测 **711** / bin **243** 入行 + 收口实读行（:278）∥ `webui/READINGS.md` §3 views-audit 实读 **250**（:43）∥ `webui/SANDBOX.md` §3 kind 族链收平（30 ⇒ 40；B +1 ⇒ 41；托管退役 −5 ⇒ **36 = §2.1 列数**）+ 新档/视图/i18n 实读（base 236 ∥ connection 148 ∥ views-sandbox 519 ∥ i18n 300 ∥ 300 行 · 269 ∥ 269 键）∥ `webui/ME.md` 两 i18n 行 실读 89 ∥ 90 + −3 键随动。**行数口径**：内容行（doc-check 同径）；与 #1385/§6 的 668/711（read 口径）差 ±1 在案。

**机检读数**（`node scripts/doc-check.mjs --root d:\teamcode\thincoder`）：**悬空 27**（存量·全仓其他域——本批零新增）∥ **行宽 2**（存量：`core/design/MEMORY.md:854` ∥ `webui/SANDBOX.md:104`——本批修复后回基线；本轮自产 4 条已折行清零）∥ 行数面 82 条（报告态·回填工单）∥ 锚面 ✗ 全部「列报·不入闸」——**本批域零新增红**。

**计数复算**：ACCOUNTS §2.1 kind 列数 = **36**（复算：35 例举 + 本轮 `placement_failed`；托管接入五件已删不在列）∥ webui 收正后终值 = **36**（本批 +10 ⇒ 40；B +1 ⇒ 41；托管退役 −5 ⇒ 36）——**两读数收平**。

**披露 / 上抛**：① [知会] 勘定记录——任务书「R85 件表」= 本批触碰档入 §14 缺行（#104 点名 `chat-tools`/`chat.mjs` 两行——本轮入七行全）；② [待裁] 实现面相抵（B 邻面）：设计句「失败 ⇒ 行留未绑」（§3:85 ∥ D5 报告）vs 实现（`registry.mjs:318` 绑定先行、`box.mjs` catch 零解绑）⇒ 失败后行持绑定；二择（① 实现补解绑——行回补放置池、下一轮重试自愈 ∥ ② 设计句收正）；③ [知会] `docker.mjs` 实读 422 < 投影 ≈515——`sandbox/SANDBOX.md` §13 拆案句（越线触发）随复读；④ [知会] §6 回填外发现：`sandbox/EXECUTION.md` §10 探针「宿主读数 = SSH」句 vs 实况（容器 + 只读挂载——§5 报告载「父侧收口轮随正」）——本轮未触。

**勘误（同轮）**：上段 `webui/ME.md` 行内「실读」= 「实读」（单字符误植——append-only 段内不改旧行，此条为更正）。

## §3 设计评审（评审子代理）

### 轮次 1（评审子代理）

## 评审（sandbox-exec-rebuild 批 · 设计评审——执行面重做 + 底座可换增补）

对象：`docs/server/design/sandbox/EXECUTION.md` + 同批随动（`sandbox/SANDBOX.md` ∥ `gateway/API.md` ∥ `webui/SANDBOX.md` ∥ `ops/OPS.md` ∥ `store/STORE.md` ∥ `accounts/ACCOUNTS.md` ∥ `agent/MEMBER-AGENT.md` ∥ `design/PROJECT.md` ∥ `requirements/PROJECT.md`）。限：未声明根级文档地图与项目标准件——文档归属按 `design/PROJECT.md` §3 判，方法学按 AGENTS.md + 各档自持惯例判。

| # | Category | Severity | Issue | Suggestion |
|---|----------|----------|-------|------------|
| 1 | Feasibility / Requirements | 🔴 | 出站闸只挂 `hook forward`（EXECUTION.md:96「基线链 `hook forward`，仅 `iifname "tcws*"` 跳入盒链」）；盒 → 节点宿主自身地址（P2 的宿主 22 口）为本机投递路径、不经 forward ⇒ §5 规则集挡不住该方向。SANDBOX.md:482 却记 P2「已修【§4 强制面 ①–⑥；主机侧 = `sandbox/EXECUTION.md` §5——本批复证】」；SANDBOX.md:333 以 P2 为「全协议/全端口」门位绑定证据。 | 同表另挂 `input` 基线链（同 `iifname "tcws*"` 锚、同位次），或写明盒→宿主方向的拒绝机制；并补该方向真机判据腿。 |
| 2 | Document ownership | 🔴 | 同一码两说：EXECUTION.md:73「**未绑工作区的动作 ⇒ 403 `sandbox_unavailable` 人话**（先放置再走链）」+ EXECUTION.md:203（B68 同形）vs 单源 gateway/API.md:167「未绑定工作区 ⇒ 503（待人放）」、API.md:315「503 `sandbox_unavailable`（无可用节点——**一码新增**）」、SANDBOX.md:412「`sandbox_unavailable`（503——无可用节点）」。 | 二者只能留一：按端点/响应形单源（503）对齐 EXECUTION 两处，或改单源并在三处同拍。 |
| 3 | Clarity | 🟡 | 空闲判据输入 `last_active_at` 无落点：v22 DDL 十列（STORE.md:570 起）无该列，EXECUTION.md:76/257 却以它作判据（`now - last_active_at ≥ idleTtlMinutes`）。 | 写明取数源（usage 记账点 + 工作区动作行的派生读，或新增列 + 迁移），与对象模型/DDL 同拍。 |
| 4 | Clarity | 🟡 | `diskMb`「生效 = 建盒/重建」（EXECUTION.md:83）与重建/启动链相抵：启动确保链 = ⑤→⑥→⑦、轮换重建 = 删容器 → ⑥ → ⑦（EXECUTION.md:47/50）皆不含 ② 配额就位/① 卷目录准备；容器缺失时 ⑥ 以 root 建卷目录（同档 :69 成立理由）。 | 重建/确保链补 ①②，或把生效句收窄为「建盒」。 |
| 5 | Affected-file annotations | 🟡 | 判据 8 抽查不闭合：`migrations.mjs` ≈430（EXECUTION.md:237）vs ≈470（STORE.md:674）；`box.mjs` ≈280（SANDBOX.md:626）vs ≈315（EXECUTION.md:226）；`docker.mjs` 现读 327（SANDBOX.md:608）vs 333（EXECUTION.md:236 ∥ SANDBOX.md:633）；`Dockerfile` 18（MEMBER-AGENT.md:195）vs 19（EXECUTION.md:240）；EXECUTION.md:241 小计「≈+1970 = ≈+1210 ∥ ≈+630」算术不合（和 ≈1840），增补分项未计 `image-routes.mjs` +≈18（SANDBOX.md:649）与迁移段 +≈40。 | 以同一基准收平各档读数与分项和（小计 = 分项和）。 |
| 6 | Afect-file size / Structure | 🟡 | `views-sandbox.mjs` ≈515 越 500 软线（本增补仍触该档 +≈4），行内仅「越软线既有——本笔列报」（webui/SANDBOX.md:81），无拆案或豁免处置。 | 补拆案（或写明豁免理由与行为上限）。 |
| 7 | Doc-state | 🟡 | v22/v23 段号对调未随正到位：MEMBER-AGENT.md:193 仍载「v22 段 ≈+70 ⇒ 越 700 触发线——同批拆案」+ `db.mjs` 675；STORE.md:674 链内亦留「member-face-chat 批：**v22** 段」——与 STORE.md:665-668（v22 = 沙盒收正段 ∥ v23 = 成员面）相抵，拆案执行批 = 本批。 | 按结构单源收正两处段号、读数与拆案归属。 |
| 8 | Methodology（判据 9） | 🟡 | 设计档缺「最近先例」行：EXECUTION.md（含 §8 底座可换块）无先例坐标（实现坐标 ∥ 对应设计节 ∥ 先例批次）+ 对齐/偏离说明；本仓他档有该行（MEMBER-AGENT.md:5 ∥ webui/SANDBOX.md:23）。 | 补一行（最近先例 = 镜像族拉取径 ∥ 主机凭据面 ∥ 拉取凭据注入）+ 偏离理由。 |
| 9 | Doc-state | 🟡 | `design/PROJECT.md` §3 文档地图缺 `sandbox/EXECUTION.md` 行：:84 标题「板 2 + 域 13」、:13 计数 13 档、:887 变更记录称已加行，而 §3 表内域行仅 12 条。 | 补该行（或改计数），与 R74② 的 `docs/README.md` 档目同拍。 |
| 10 | Coordination（R5） | 🟡 | 底座可换真机闭环前置 = 另一批落 `deploy/sandbox/Dockerfile` 件位契约（`/opt/thincoder/app`——EXECUTION.md:141），本批收口判据含「选定底座 ⇒ 派生 ⇒ 建盒 ⇒ 壳起」（EXECUTION.md:284）；AC-52/需求档回笔 + TEST-ENV-ECS/README 档目仍为在册上抛。 | 登记为跨批排序约束（前置 = 件位契约就绪）。 |
| 11 | Clarity | 🔵 | EXECUTION.md:139 以 `parseImageRef` 为底座引用形校验单源，该符号无坐标（本档他处引实现带档名/行）。 | 补实现坐标或改指实现档。 |
| 12 | Clarity | 🔵 | 恢复链两处未闭：§2.2 host 径用途面枚举（EXECUTION.md:32）未含恢复清卷步（`rm -rf <path>/*`——EXECUTION.md:52）；§2.2 引「§3.6」而本档无 §3.6（实载 §3 恢复行）。 | 收正坐标并把清卷步归入 host 径用途面。 |
| 13 | Clarity | 🔵 | 锚名落地机制未写：`tcws<id>` 桥名（EXECUTION.md:42）是 §5 规则唯一锚点，`networks/create` 载荷/`Options` 未列；若落引擎缺省名 ⇒ 锚零命中 ⇒ 规则全表不生效，而就位复核（EXECUTION.md:104）只记 apply 成败。 | 写明桥名设定（bridge.name 类选项）或把「锚命中」纳入就位复核。 |
| 14 | Clarity | 🔵 | 甲档前提（EXECUTION.md:148 KD-SV-187）只要求底座自带 Node ≥24，校验层为 `RUN`（EXECUTION.md:145）——无 shell 类底座在该层失败未列。 | 前提句补「基底须可执行 RUN（有 shell）」或写明该失败形。 |

**计数**：🔴×2 ∥ 🟡×8 ∥ 🔵×4（共 14）。**范围外一处（不设级）**：`terminal-core.mjs`（拟新增 ≈520 越 500 软线、无拆案句）= sandbox-container-terminal 批的面，非本批判据对象。

**VERDICT: changes-required**

### 轮次 2（评审子代理）

## 评审（sandbox-exec-rebuild 批 · 设计评审——轮 2：核验评审 #91 十四条修复 ∥ 乙档落定 ∥ 连接面 TLS 增补 #2）

对象 = 批档 §2（修复轮 ∥ 乙档落定 ∥ 增补 #2 三块）+ 声明文档集当刻实读（`sandbox/EXECUTION.md` ∥ `sandbox/SANDBOX.md` ∥ `gateway/API.md` ∥ `store/STORE.md` ∥ `agent/MEMBER-AGENT.md` ∥ `design/PROJECT.md` ∥ `webui/SANDBOX.md` ∥ `ops/OPS.md` ∥ `accounts/ACCOUNTS.md` ∥ `requirements/PROJECT.md`）。产品码零触（设计评审）。

**轮 1 十四条核验 = 14/14 已落（逐条实读）**：#1 两基线链在（`EXECUTION.md:109`「基线链两条 = `hook forward` + `hook input`」∥ `SANDBOX.md:346`「两方向 = `forward` ∥ `input` 两条基线链」∥ `:499` P2「盒 → 宿主方向 = `input` 链腿」）∥ #2 未绑 503 两处（`EXECUTION.md:83`/`:222`）+ 单源同拍（`API.md:168`「未绑定工作区 ⇒ 503 `sandbox_unavailable`（人话两因分列……」）；全仓「403 `sandbox_unavailable`」零命中）∥ #3 派生读两源 + 索引在（`EXECUTION.md:86-89` ∥ `STORE.md:111`「CREATE INDEX IF NOT EXISTS idx_usage_key_ts ON usage(key_id, ts);」）∥ #4 链条补位（`EXECUTION.md:57`「确保链 = ①→②→⑤→⑥→⑦」∥ `:60`「重建 = 删容器 → ①→② → ⑥ → ⑦」∥ `:96` 生效句）∥ #5 读数收平（`EXECUTION.md:264` 小计 ≈+1866 = ≈+1180 + ≈+686——分项和闭；`SANDBOX.md:625`/`:643`/`:647`/`:648`/`:667` 同拍；`MEMBER-AGENT.md:195` Dockerfile 19/≈32）∥ #6 拆案 + 触发 + 行为上限在（`webui/SANDBOX.md:105-107`）∥ #7 段号 v23 + 读数 + 拆案归属（`MEMBER-AGENT.md:193` ∥ `STORE.md:679`「拆案本批实施」）∥ #8 最近先例三坐标在（`EXECUTION.md:7-12`）∥ #9 文档地图行在（`design/PROJECT.md:98`）∥ #10 跨批排序约束在册（`EXECUTION.md:314`）+ AC-52/53 入册（`requirements/PROJECT.md:420-421`）+ 需求档回笔五项已落（`:737`）∥ #11 `parseImageRef` 坐标（`EXECUTION.md:152`）∥ #12 恢复清卷 + 「§3 恢复行」（`:41`）∥ #13 桥名 Options + 读回复核（`:52`）∥ #14 shell 前提（`:164` ∥ `:236`）。

| # | Category | Severity | Issue | Suggestion |
|---|----------|----------|-------|------------|
| 1 | Document ownership / Clarity | 🔴 | 同一机制两说（增补 #2 修复轮未扫净）：`sandbox/SANDBOX.md:54`「地址 = `http://<host>:<port>`（登记输入归一：缺协议补 `http://`、缺端口补 `2375`；`https:` 拒）」——https 被定为非法形；而同档新块与单源作：`:62`「**TLS 档可选（本增补 #2——§3 连接方式块：缺省明文不变；`https://` 地址才走 TLS；证书 = 用户自备）**」∥ `:325`「裸 host ⇒ 按档补 scheme + 缺省端口 2375/2376」∥ `:488` 判据行 ∥ `gateway/API.md:135`「地址归一 = 按档补 scheme + 缺省端口 2375/2376——缺协议/端口补全」。照 :54 实现 ⇒ TLS 档永远登不进来（特性归零）。同族未收正：`SANDBOX.md:541` E34「地址形非法（`https:` ∥ 空）」措辞（R74② 已认其语义须随正——https 400 因 = 档相抵/缺三件，不再为「scheme 拒」）。 | 二者只能留一：按增补 #2 单源收正 `:54`（归一改「按档补 scheme——明文 `http://`/TLS `https://`；缺省端口 2375/2376」）并同拍 E34 措辞；或翻案（如不做 TLS）——不得两说并存。 |
| 2 | Feasibility / Requirements | 🟡 | 备径两向未明（轮 1 #1 修复只及 nft 路）：`sandbox/EXECUTION.md:116`「无 ⇒ iptables 备径：`TC-EGRESS` 链 flush + 重建，`-i tcws+`」——未言该链挂哪条 hook（`forward` ∥ `input`）；而 `sandbox/SANDBOX.md:346` 门位绑定句 = 「全协议/全端口」+ 两方向（P2 证据）——无 nft 节点上盒 → 宿主方向（P2）按现文可复现漏口。 | 备径句补「两向同挂（FORWARD + INPUT 各一跳入 `TC-EGRESS`——同锚同序）」，或写明备径的盒 → 宿主拒绝机制 + 真机腿同覆盖。 |
| 3 | Affected-file annotations | 🟡 | 增补 #2 小计/分项跨档不合（轮 1 #5「小计 = 分项和」口径未覆盖新增块）：`sandbox/EXECUTION.md:264`「`docker-tls.mjs` ≈220 + 六处 delta ≈170——`routes` +55 ∥ `registry` +30 ∥ `docker` +25 ∥ `migrations` +10 ∥ 容器/镜像/卷/终端四路由 + 盒链 `config` 透传 ≈12」（列值 ≈132，与 ≈170/「六处」不自洽）vs `sandbox/SANDBOX.md:670`「五处 delta（`routes.mjs` +≈55 ∥ `registry.mjs` +≈30 ∥ `docker.mjs` +≈25 ∥ `migrations.mjs`（v22 段）+≈10 ∥ 容器/镜像/卷/终端四路由 + 盒链 `config` 透传各 ±≈3）」（推导 ≈135——与 ≈170 两说）。 | 以同一基准收平：小计 = 分项和（行数/处数/逐项值取一读；`docker-tls.mjs` ≈220 + delta 一项给闭式）。 |
| 4 | Doc hygiene | 🔵 | 词面残留（修复轮读回自称「「等待放置」清零」未达成）：`sandbox/SANDBOX.md:404`「**动作 = 直调链**（幂等语义 ∥ 「等待放置」态明示 ∥ 销毁确认门携 dirty/快照读数——机制 = `sandbox/EXECUTION.md` §3）」，全仓同词仅此一处。 | 「等待放置」⇒「待人放」（一词一事；同拍 `EXECUTION.md:83`/`API.md:168` 用词）。 |

**计数**：轮 1 十四条 = Fixed 14/14（无 Unfixed）∥ 本轮新增 = 🔴×1 ∥ 🟡×2 ∥ 🔵×1（共 4）。

**VERDICT: changes-required**

### 轮次 3（评审子代理）

## 评审（sandbox-exec-rebuild 批 · 设计评审——轮 3：核验轮 2 四条修复）

对象 = 批档 §2 末块「修复轮（设计评审轮 2 · 评审 #100——四条逐号落）」+ 声明文档集当刻实读（`sandbox/EXECUTION.md` ∥ `sandbox/SANDBOX.md` ∥ `gateway/API.md` ∥ `scripts/doc-check.mjs`）。产品码零触（设计评审）。

**轮 2 四条核验 = 4/4 已落（逐条实读）**：

| # | 级 | 核验项 | Status | 证据（本轮实读） |
|---|---|---|---|---|
| 1 | 🔴 | `sandbox/SANDBOX.md:54` 连线口径按增补 #2 单源收正（+ `:541` E34 措辞同拍） | Fixed | `:54`「地址 = `[http://\|https://]<host>:<port>`（登记输入归一：**按档补 scheme**——明文档（缺省）缺协议补 `http://`、缺端口补 `2375`；TLS 档（本增补 #2）缺协议补 `https://`、缺端口补 `2376`；**显式 scheme 与档相抵 ⇒ 400**——§3 连接方式块）」∥ `:541` E34「添节点：重名 ∥ 地址形非法（空 ∥ 显式 scheme 与档相抵 ∥ TLS 档缺件——§3 连接方式块）」——「`https:` 拒」清零；全档 https 命中逐处核过（:62 ∥ :325 ∥ :328 ∥ :488 ∥ `gateway/API.md`:135/:139 同拍） |
| 2 | 🟡 | `sandbox/EXECUTION.md:116` iptables 备径两向同挂 | Fixed | `:116`「无 ⇒ iptables 备径：`TC-EGRESS` 链 flush + 重建，**两向同挂**——`FORWARD` + `INPUT` 各一跳入 `TC-EGRESS`（同锚 `-i tcws+`、同序 = 盒链位次照上；缺 `INPUT` 跳 ⇒ 盒 → 宿主自身方向裸奔）」 |
| 3 | 🟡 | `sandbox/EXECUTION.md:264` ↔ `sandbox/SANDBOX.md:670` 增补 #2 分项/小计同一基准收平 | Fixed | `EXECUTION.md:264`「**本增补 #2 ≈+355**（`docker-tls.mjs`（拟新增）≈220 + 六处 delta ≈135——`routes` +≈55 ∥ `registry` +≈30 ∥ `docker` +≈25 ∥ `migrations` +≈10 ∥ 容器/镜像/卷/终端四路由（各 +≈3）≈12 ∥ 盒链 `config` 透传 +≈3」+ 小计 **≈ +2221** = ≈+1180 + ≈+686 + ≈+355（算术闭合）∥ `SANDBOX.md:670`「六处 delta（`routes` +≈55 ∥ `registry` +≈30 ∥ `docker` +≈25 ∥ `migrations`（v22 段）+≈10 ∥ 容器/镜像/卷/终端四路由（各 +≈3）≈12 ∥ 盒链 `config` 透传 +≈3——合计 ≈135）⇒ **本增补 #2 分项和 ≈+355**（`docker-tls.mjs` ≈220 + delta ≈135）」——两档逐项同值 |
| 4 | 🔵 | `sandbox/SANDBOX.md:404` 「等待放置」⇒「待人放」 | Fixed | `:404`「**动作 = 直调链**（幂等语义 ∥ 「待人放」态明示 ∥ 销毁确认门携 dirty/快照读数——机制 = `sandbox/EXECUTION.md` §3）」——全仓同词余 = 记录面（本档 :783 变更记录；批档 §2 旧块） |

**计数**：轮 2 四条 = Fixed 4/4（无 Unfixed）∥ 本轮新发现 = 0（🔴×0 ∥ 🟡×0 ∥ 🔵×0）。

注：声明面 `scripts/doc-check.mjs` 已实读（机检引擎——锚/行宽/行数面）；本轮无 exec 工具 ⇒ 修复轮机检读数（悬空 35→35 ∥ 行宽 26→26——报告在册）未能独立复跑（非闸红）。批档 §3 轮次 2 表在册 ∥ 修复轮报告 = §2 末块（在册）。

**VERDICT: pass**

## §4 用户批准（主 agent）

**§4 用户批准（主 agent 代签 · 2026-10-13 23:2x）**

- **授权依据**：用户 2026-10-13 21:08「开，自动跑」（§1 授权块——设计评审点火权 ∥ §4 用户批准权〔代签〕∥ 修正/实施轮派发 ∥ 收口核销与提交〔双推〕∥ 令牌终消费）。
- **条件齐备（三条）**：① 评审 **pass**——§3：轮次 1 = changes-required（14 条）→ 修正轮全落 → 轮次 2 = changes-required（新 4 条）→ 修复轮逐号落 → **轮次 3 = pass（新发现 0）**；② 修正/落定逐条落地并经父侧核读——修正轮（#93 · 十四条）∥ 乙档落定（#96）∥ 增补 #2 设计（#99）∥ 修复轮（#101 · 四条——含 `SANDBOX.md:54/:541` 与 `EXECUTION.md:116/:264` 逐点对位）；③ 令牌已签发（在槽——运行态凭据，值不落档；出档记为「评审通过」）。
- **批准范围** = 本批实施（§2 受影响文件全表——服务端执行面 ∥ store 迁移外提 ∥ gateway 行账 ∥ bin 装配 ∥ webui 面；批内件随批）。
- **随批备注**：① 需求档回笔已落（功能点 52/53 + AC-52/53——父侧笔）；② 实施派发 = **按面拆舱**（16 档跨服务端多族 + webui，单舱超限——拆分与依赖序由父侧按 §2.3 实施表定，各舱同令牌 + 同任务书）；③ 收口随正件（README 档数 ∥ `docs/TEST-ENV-ECS.md` TLS 步骤 ∥ E34 断言随正件 ∥ `check-vsix` 类先例件）随收口轮办。
- **依据登记** = §2 ∥ §3；父侧代签（用户 21:08 授权）；可撤回。

## §5 实施记录（eng-coder）
**状态行**：实施完成（收口修复轮 B/C/D/F 落——exec-rebuild 26/26 ∥ -tls 14/14 ∥ 邻件全绿；跨批两件写门拒归父侧；终态 clean）



**实施摘要（eng-coder · 底座舱 #106）**

**舱界（父侧 2026-10-13 裁定）**：本舱 = 底座可换服务面四档 + 导出接口四件（`ensureDerivedImage` ∥ `customBaseOf` ∥ `authForImageRef` ∥ `registerRegistryCredRoutes`）；建盒链 ④ ∥ 工作区 `baseImage` PATCH ∥ derive 端点 = 执行面舱（#104）写面；跨舱集成腿（N72 建盒腿 ∥ B75 端点腿）随父侧收口轮联跑，本舱批内件只测舱内面。

**落件（实读行数 = 本次实施末）**

| 档 | 实读 | 设计预算（EXECUTION §14） | 变更 |
|---|---|---|---|
| `thincoder-server/src/sandbox/derive.mjs` | **243** | ≈200 | 新增 |
| `thincoder-server/src/sandbox/registry-creds.mjs` | **174** | ≈130 | 新增 |
| `thincoder-server/src/sandbox/registry-cred-routes.mjs` | **95** | ≈110 | 新增 |
| `thincoder-server/src/sandbox/image-routes.mjs` | **144** | 132 ⇒ ≈150 | 改（拉取凭据注入 ∥ 审计 `auth` 键 ∥ `config`/`requestImpl` 两参透传） |
| `docs/batches/2026-10-13-sandbox-exec-rebuild-base.test.mjs` | **543** | ≈320 | 新增（批内单测件） |

**决策透明（设计未写处的实施择定）**

1. `X-Registry-Auth` 编码 = **base64url**：首轮误用标准 base64，内部偏离审计发现后按设计（`gateway/API.md` §2.5）收正；外部核实 = Docker 官方解码 `DecodeAuthConfig` 即 base64url（RFC4648 §5）。
2. 引用守卫（`derive.mjs` `assertRefSafe`）拒空白 + 控制字符（设计只到 `parseImageRef` 同判——Dockerfile 注入防线加严，零外呼语义不变）。
3. `deriveFailure` 非预期错兜底 = 502（沿 `container-routes.mjs` `dockerFailure` 同形——不把服务端异常报成客户端错）。
4. 拉取后复读仍空 ∥ 镜像读数缺 `Id` ⇒ 域错人话（设计未写该护栏——不静默）。
5. 凭据面小护栏：端口 1–65535 ∥ `updated_at` 缺值回落 `created_at` ∥ 空提交改 ⇒ 400 ∥ 引用主机段形异常 ⇒ 匿名回落（密文坏 ⇒ 抛，不静默匿名）。
6. `image-routes.mjs` 的 `config`/`requestImpl` 透传 = 增补 #2（TLS）在册行（§14 小计），本舱随改档一并落（与容器/卷/终端三路由同形）——如实登记为跨增补行。

**fix round（内部两轮，已收敛）**

- R1（偏离审计 · explore）：唯一偏离 = `X-Registry-Auth` 编码口径（实现标准 base64 vs 设计 base64url）⇒ 收正实现（`toString("base64url")`）+ 单测解码同拍 + 补字母表/非 ASCII 往返断言。
- R2（代码评审 · advisor）：VERDICT = **pass**（无 🔴）。两条 🟡 可选 + 一条 🔵：🟡① `registryHostOfImage` 判主机段前未剥标签（`nginx:latest` ⇒ 归一抛 ⇒ `authForImageRef` 静默匿名）⇒ **已修**（先剥标签再判 + 三条用例：单段带标签 ∥ 带标签主机引用 ∥ 含端口主机段+标签）；🔵 批内件头注 DDL 声明收正（列集同形 · 可空性以迁移链为准）⇒ **已修**；🟡② 批内件 543 行超设计预算 ≈320 ⇒ **不修**（如实登记读数——预算收平归父侧收口轮）。

**验证读数（本次实施末）**

- `node --test docs/batches/2026-10-13-sandbox-exec-rebuild-base.test.mjs` ⇒ tests 11 ∥ pass 11 ∥ fail 0（≈1.1s）。
- `node --check` 四档全绿（`Syntax OK`）。
- tar 独立解析：bsdtar 3.7.7 `tar -tf` 读出 `Dockerfile` + 正文逐行（真实解包器实证 ustar 合形；临时件已清理）。
- 缺省腿：无凭据 ⇒ 零 `x-registry-auth` 头（假传输实测）；未命中 ⇒ 审计 `auth:false`。
- 未做（边界）：跨舱真腿（建盒链 ④ ∥ derive 端点 ∥ `baseImage` PATCH）随父侧收口轮；integration 全谱未跑（本舱无集成面）。

**披露（不阻塞）**

- **`registerRegistryCredRoutes` 全仓零调用点**（装配面 = 他舱）：沙盒路由聚合（`routes.mjs`）与入口（`bin/thincoder-server.mjs`）均未注册凭据四端点 ⇒ 控制台凭据卡在生产面会 404；本舱批内件自建路由表（真链断言可行）故测不出——请收口轮逐条核（设计 §14 把该注册记在 `bin`）。
- `registry_credentials` DDL 相抵（report-only）：落盘 `updated_at TEXT`（可空尾列）vs `STORE.md` §2 v22 段 `updated_at TEXT NOT NULL`（`created_at` 后）——本舱两写径恒写值（insert 同拍 ∥ update 刷新），行为零差；归属 = store 面/父侧定夺。
- 旧批内件 `2026-10-11-sandbox-docker-admin.test.mjs:394` 精确断言 `image_pull` detail（无 `auth` 键）⇒ 随本批设计过期（非门禁；随正与否归父侧）。
- `image_derive` 审计 `runnerId`/`workspaceId` 由消费面传入（本舱不产值——本舱测试以假值逐值断言）。

**实施摘要（eng-coder · 执行面主体舱 #104）**

**舱界**：本舱 = 执行面主体——建盒链 ∥ 六动作 ∥ 参数集 ∥ 放置/补放置 ∥ 三定时器 ∥ 实时写门 ∥ 出站闸下发 ∥ DNS 闸 ∥ 工作区面六端点 ∥ v22 迁移 + #1351 登记带入单事务。他舱（底座/凭据/TLS）函数一律**消费不重实现**（`ensureDerivedImage` ∥ `customBaseOf` ∥ `authForImageRef` ∥ `requireSandboxAvailable` ∥ `probeRunner` ∥ `boxStateOf`）。

**落件（实读行数 = 本舱实施末）**

- 新增：`src/sandbox/box.mjs` 649 ∥ `src/sandbox/quota.mjs` 119 ∥ `src/sandbox/egress.mjs` 355 ∥ `src/sandbox/dns-gate.mjs` 349 ∥ `src/sandbox/workspace-routes.mjs` 314 ∥ `src/store/migrations.mjs` 711
- 改动：`src/store/db.mjs` 155 ⇒ 37（收薄为开库/PRAGMA + 再导出 `MIGRATIONS`/`SCHEMA_VERSION`/`migrate`/`readVersion`——旧批件引用名保留）∥ `src/sandbox/routes.mjs` 378（挂工作区面注册 + #1351 单事务 + 规则增删改 ⇒ `pushEgress` + 裁定 ⇒ `deps.dnsGate.notifyDecision`）∥ 超清单两处：`src/sandbox/hosts.mjs` 135 ∥ `src/sandbox/ssh.mjs` 230（各加 `stdin` 透传——sudo 口令行 + 载荷体）
- 单元测试档（本批——入批档 · 住 `docs/batches/` · 不入仓套件）：`2026-10-13-sandbox-exec-rebuild.test.mjs` 785（23 例）∥ `2026-10-13-sandbox-exec-rebuild-egress.test.mjs` 279（7 例）

**测试与实证**（自 `thincoder/` 仓根 · node --test）

- 本舱两档：23/23 全绿 ∥ 7/7 全绿（合 30 例）
- 邻舱/旧批批内件复跑（核我的 store/routes 改动是否波及他面）：`-base` ∥ `-tls` ∥ `-tls-ui` ∥ `-base-ui` ∥ `-container-terminal` ∥ `-server-core-unification` ⇒ 全绿
- 旧批两件红（断言 = 旧链尾读数，本批 v22 段随正归父侧）：`2026-10-11-sandbox-image-sources.test.mjs:598/:599/:623`（20 ⇒ 22）∥ `2026-10-10-runner-admin-console.test.mjs:477/:487`（17 ⇒ 22）——各 1 例红；**跨批写门拒绝本舱改他批档**（证据：写门报 `cross-batch batch-record write`），随正留父侧
- 旧批 `2026-10-13-sandbox-outbound-member-face.test.mjs:349` 红（502）——根因 = 创建工作区现走完整建盒链（新契约），该件假主机面未登记 SSH 凭据 ⇒ ① 步即停；**属新契约下的旧断言**，随正归父侧
- 旧批 `2026-10-11-sandbox-docker-admin.test.mjs:376` 红——`image_pull` 审计新增 `auth` 键（= 底座舱 `image-routes.mjs`，非本舱写面）

**自测暴露的真缺陷（本舱自修 · 四件）**

1. 建盒/启动/轮换的 ⑦ 启动步以容器**名**调 `startContainer`——引擎假件按 id 查 ⇒ 幂等判定失据（第二次启动仍非 noop）：改「读回 `Id` 优先、名兜底」（Docker API 两名皆收，但 id 才闭合幂等判定）
2. DNS 闸就位复核未透传 `resolveImpl` ⇒ 就位核以真 DNS 求值 ⇒ 白名单域被误判「闸内缺」而 REFUSED：`createDnsGate` → `ensureEgressApplied` 增透传
3. 允许集覆盖判原按字面相等 ⇒ CIDR 条目（`198.51.100.0/24`）不覆盖其成员 IP ⇒ 纯 CIDR 白名单域被误拒：增 `allowCovers`（IP 精确 ∥ CIDR 语义）
4. `ip_deny` 且过闸子集空原落「待批」⇒ 与显式拒语义相抵：改 REFUSED（显式拒不得以待批代替）

**决策透明表（实施轮自决项——无设计授权缺口，逐项披露）**

| # | 决策 | 依据 / 口径 | 影响面 |
|---|---|---|---|
| 1 | 审计 kind 收正为 ACCOUNTS §2.1 十键：`workspace_create`／`workspace_limits`／`workspace_destroy`(+`volumeDeleted`)／`box_start`／`box_stop`(+`stopReason`)／`checkpoint`／`checkpoint_fail`／`quota_apply_failed` | 设计档 §2.1 单源；初稿自造 `workspace_start`/`workspace_snapshot` 名 | 审计面全链 |
| 2 | 轮换/恢复复用 `box_start` kind + `rotate:true` / `checkpointId` 键（不新增 kind） | §2.1 十键为闭集（新增 kind ⇒ 越单源）；该两链语义 = 重建后启动 | 审计筛选器按 kind 的读数 |
| 3 | `workspace_limits` 审计在 PATCH 行内发（limits 面）；`baseImage` 走 `workspace_base`（他舱 kind） | kind 语义边界；`workspace_base` = 底座舱四 kind 之一 | 底座卡审计读数 |
| 4 | 恢复 = 停 + 清卷 + 解包 + 起；`archive put` 拒 ⇒ SSH `tar xzf -` 备径（`stdin` 喂存档字节） | EXECUTION §3/§8 恢复两径；备径需 `stdin` 透传（超清单第 3 处） | 恢复链 |
| 5 | 快照 blob = `<dataDir>/sandbox-checkpoints/<wsId>-<stamp>.tar.gz`（gzip），上限判按**压缩后**字节 vs `diskMb` | 设计只写「全量存档 + 上限 = 工作区 `diskMb` 配额」；判点取压缩后（落盘占量） | 快照必超上限时 `skipped` + `checkpoint_fail` |
| 6 | 空闲信号 = 派生读两源（usage 键行 + 审计动作行 `detail.workspaceId`，取 max）——零新列 | R 条 steer（`:155` 条目 3） | 空闲定时器 |
| 7 | 工作区面六端点**拆档** `workspace-routes.mjs`（`routes.mjs` 零残留 + 一处 `registerWorkspaceRoutes` 调用） | TLS 舱改 `routes.mjs` 时删了工作区面未补回 ⇒ 拆档落位（拆案读判用例在册） | 路由注册面 |
| 8 | 创建/动作路由的链错误 ⇒ `HttpError("upstream_error")`（502）+ 引擎侧人话；`HttpError` 原样透传 | E50「逐动作 502；行/卷零半态」 | 失败面 |
| 9 | 销毁确认门 = body `confirm: true`（缺 ⇒ 400 人话） | 设计「销毁确认门」未订形；取 body 布尔（不改端点形） | 控制台销毁按钮需带 `confirm` |
| 10 | `ensureEgressApplied` / `dispatchEgressAll` 增 `resolveImpl` 透传缝（生产缺省 `null` = 真 DNS） | 自修 #2 的根因收口；测试注入假解析（零真 DNS 外呼） | 出站闸 + DNS 闸 |
| 11 | 基线两链（`hook_forward` ∥ `hook_input`）同锚 `iifname "tcws*"`、同位次、同一跳 | R1 条（`:153` 条目 1：盒 → 宿主自身方向） | 闸本体 |
| 12 | `migrations.mjs` = v1–v22 全链（纯搬移 + v22 段：workspaces 重建去 `required_labels_json`／增 `stop_reason`+`base_image`、DROP `sandbox_tasks`、建 `registry_credentials` **七列**含 `updated_at`、runners TLS 四列） | STORE §2 v22 段 + R 条 steer「七列」 | 存储面 |

**未做 / 边界（如实）**

- 真机面零触：无 Docker/SSH 真机执行（全部假件）；loopback 配额径（`truncate`/`mkfs`/`mount -o loop`）**无真机验证**——仅假件下单（B67 覆盖失败分支）
- DNS 闸：只 UDP 53（设计披露项）；TCP 53 不答
- `bin/thincoder-server.mjs` 装配（ticker 起跑 / DNS 闸监听 / 新路由注册）= 他舱/父侧收口件——本舱未触 `bin/`（若无人接 ⇒ 起跑面缺口，随报告上抛）

**实施摘要（eng-coder · 控制台舱（webui 面）——增补 #2（连接面 TLS 档）+ 增补（底座可换））**

**舱界（派发当刻）**：本舱 = 控制台面——标签②两卡（底座卡 ∥ 私有仓凭据卡）+ 节点行「连接」动作 + 连接方式编辑窗 + 添加节点弹窗连接段；**服务端码零触 ∥ 设计档零触**（本舱写面仅五档：两新档 + `views-sandbox.mjs` + 两 i18n 档）。批内件两件 = `docs/batches/2026-10-13-sandbox-exec-rebuild-base-ui.test.mjs` ∥ `…-tls-ui.test.mjs`。

**落件（实读行数 = 本舱实施末）**
- 新档 `thincoder-server/public/views-sandbox-base.mjs`（**236 行**——设计估 ≈260）：`createBaseSection` → `{ baseCard, credCard }`（件建即取数——读时口径）；设底座弹窗（PATCH `baseImage` / `null` 两径同窗）；构建钮（在飞禁用 + 进度句；成 ⇒ flash 两形（tag ∥ 缓存命中）；败 ⇒ `ctx.fail` 红条原文；未绑 ⇒ 钮禁用 + 一句人话）；凭据增/改/删（密文零回显零回填——改径留空不携 `secret` 键 = 键级应用）。
- 新档 `thincoder-server/public/views-sandbox-connection.mjs`（**148 行**——设计估 ≈150）：`connectionSchemeOf`（地址 scheme 单源）∥ `createConnectionSection`（二择 + 三件 textarea + 当刻态标；出 `{ node, kind, materials, missingKey }`——添加窗与编辑窗两处共用一件）∥ `openConnectionModal`（PUT 全列覆写；切回明文 = 二次确认顶替窗——与 `host-credential.mjs` 撤销径同形）。
- 改档 `views-sandbox.mjs`（502 ⇒ **519 行**——设计处置「维持」在册）：头注 + 两 import；标签②追加两卡（镜像卡 → 镜像源卡 → 底座卡 → 凭据卡）；地址格 http/https 徽标（`.badge` 中性类——零新样式零新变量）；行钮序 = 展开 ∥ SSH 凭据 ∥ 连接 ∥ 删除；添加窗连接段装配 + 按档携 `connection`/`tls`（缺省档不携键——零行为变化）。
- 两 i18n 档：各 **+49 键**（连接族 17 ∥ 底座/凭据族 32）⇒ **269 ∥ 269 键**（设计投影 ≈262——差 +7，收口回填项）。

**决策透明表（本舱裁量项——依据在册）**

| 项 | 裁定 | 依据 |
|---|---|---|
| 连接档 = 地址 scheme 单源（无 `mode` 列 ∥ 编辑窗无地址输入） | 按设计 | `sandbox/SANDBOX.md` §3 连接方式块 ∥ `gateway/API.md` §2.5（`address?` 缺省径 = 保留主机 + 按目标档补 scheme/缺省端口——服务端负责） |
| PUT 体两形：`{ connection:"plain" }` ∥ `{ connection:"tls", tls:{ ca, cert, key } }` | 全列覆写 | `gateway/API.md` §2.5 PUT 行（`{ address?, connection, tls? }`） |
| 三件恒零回填（含当刻已 TLS 的节点） | 只进不出 | `webui/SANDBOX.md:48`「当前态只回「已设（时间）/未设」——零回填」 |
| TLS 档提交必填三件（换材料 = 重新提交三件） | 缺件 ⇒ 窗内门 | `webui/SANDBOX.md:16/48`（缺件/相抵 ⇒ 窗内就地人话） |
| 行徽标 = 中性 `.badge` + `http`/`https` 文本 | 零新样式零新键 | `webui/STYLE.md` §2.1 canon（AC-19：零新变量 ∥ 零新悬停规则） |
| 设底座窗**不设**目标行 | 删（不自创） | 设计未列该行——偏离审计修正项（原复用 `hostCredTarget`「主机：{name}」对工作区错词） |

**验证**
- 批内件两件（自 `thincoder/` 仓根）：`node --test docs/batches/2026-10-13-sandbox-exec-rebuild-base-ui.test.mjs` = **7/7 绿** ∥ `…-tls-ui.test.mjs` = **7/7 绿**（零网络零真浏览器）。
- 件内静态机检：键集两表逐键相等 ∥ en 零 CJK ∥ 占位符对位 ∥ 零色字面量 ∥ 零新 `:root` 变量（76 = 实施当刻实读）∥ 新档 ≤500 行 ∥ 两卡读时口径（标签未激活零读）。
- 内部偏离审计（explore · 轮 1）：四类偏差 **0**（PARTIAL/SILENT-SIMPLIFICATION/DOC-DRIFT 逐类无；OUT-OF-LIST 由 `git status` 复核）；采纳修正 1 项 = 设底座窗错词目标行删除（见上表末行）。
- 内部代码评审（advisor · type=code · 轮 1）：**pass**（0 🔴；🟡 两条均标**可选**——① `views-sandbox.mjs` 519 行 = 既有「维持」态；②「恢复标准」脚区钮在飞期未上闩（连点可发两 PATCH——服务端幂等、影响低））。
- 邻舱复跑（核本舱面零波及）：`-base` 11/11 ∥ `-tls` 12/12 ∥ `-egress` 7/7 ∥ 主体件 23/23 —— 全绿。

**披露 / 上抛（收口轮账）**
- **★跨批随正件（归父侧收口轮——本舱非其写面；以父侧终随正时刻实读为准）**：`2026-10-08-server-public-structure.test.mjs`（档目 +2 名 ∥ 键集指纹——**本舱 i18n 面已全落齐** ⇒ 终随正现可执行；本舱实测：键 zh **1033** ∥ en **1038**，指纹 zh `b483310a…` ∥ en `89e83b02…`；在途他批仍在加键）∥ `2026-10-10-runner-admin-console.test.mjs`（E34 语义随正 + 列面 +四列——非本舱域）∥ `…-runner-admin-console-ui.test.mjs`（行钮 +1 ∥ 添加窗体 +`connection` ∥ 键集；实测读数 1033 ∥ 1038 ∥ 档目 62 ∥ 61——**该件当刻红**）∥ `docs/TEST-ENV-ECS.md`（TLS 步骤）。
- 设计面零触的 [知会]：① 设底座窗无「工作区：{name}」目标行（设计未列——他日补 = 新键一条 + 两表同拍）；② `webui/SANDBOX.md:15` 操作列枚举（展开 ∥ 删除 ∥ 连接）与 `:47`「与『SSH 凭据』并列」相抵——实现沿 `:47`（设计席收口收正）；③ `gateway/API.md:135` overview 行元素枚举未含 `connection`/`tls`，`:136` 却述含（服务端实发）——文档面滞后；④ 自定义端口节点经「连接」窗重存 ⇒ 缺省地址径按档补缺省端口 2375/2376（自检不过 ⇒ 库零变，fail-safe；本窗无地址输入 = 设计既定）。
- 他舱面（复述以明依赖，已由 #106 steam）：`registerRegistryCredRoutes` 全仓零注册点 ⇒ 凭据卡生产面 404（装配舱 #108 ∥ 父侧收口核）。
- 边界如实：真机 TLS 全链（自签三件 ⇒ 切档 ⇒ 自检 ⇒ 全谱 ⇒ 切回明文）＝父侧收口轮；本舱零触服务端 ⇒ `runner.tls`/`connection` 行形依赖服务端舱落地（现读 `-tls`/`-base`/`-egress` 全绿）。

### §5 实施记录（eng-coder · 节点连接舱——连接面 TLS 档 ∥ 写门实时化/放置/两新设置键 ∥ 队列心跳死件删净 ∥ 探针执行器）

**交付摘要（本舱面——末次实读行数）**

| 件 | 结果 |
|---|---|
| `thincoder-server/src/sandbox/docker-tls.mjs`（新，133 行） | 三件形校验 ∥ 材料存取（AES-256-GCM 复用 `credential-crypto.mjs`；CA/证书原文档列）∥ 连接元数据视图（`connection`/`tls{state,updatedAt}`——零材料）∥ `httpsFetchOf(tls,{requestImpl})`（fetch 形最小件；`ca`/`cert`/`key` 逐值入 `node:https` 选项） |
| `thincoder-server/src/sandbox/docker.mjs`（422 行） | `networks`(create/inspect/delete) ∥ `archive`(get/put) ∥ `containerState` ∥ `buildImage`/`imageDetail` ∥ `pullImage(…,{auth})` ∥ 地址归一按档（显式 scheme 相抵 ⇒ 抛；拒路径/查询/凭据——零静默截断）∥ `clientForRunner`/`selfCheckDocker` 两参透传（**明文行恒注入 `fetchImpl`——零行为变化**） |
| `thincoder-server/src/sandbox/registry.mjs`（419 行） | 队列/心跳死件删净（`TASK_KINDS`/`enqueueTask`/`claimTasks`/`reportTask`/`sweepStuckTasks`/`lastTaskView`/`normalizeBoxes`/`boxPayload`/心跳块）∥ 写门实时化 `requireSandboxAvailable`（3s 并发轻探、零缓存、不降级）∥ **新增 `requireRunnerAvailable`**（§7 绑定面节点门——父侧 2026-10-14 裁令；helper 在本档，消费面一行切换归执行面舱）∥ 放置（在线 active 最少绑定者 + `maxBoxesPerRunner` 8）∥ 设置键 +2/−1 ∥ 行形 `connection` + `tls{state,updatedAt}` |
| `thincoder-server/src/sandbox/routes.mjs`（413 行——含他舱并发行） | 工作区面拆出（零残留；六端点归 `workspace-routes.mjs`）∥ POST 体扩 `connection`/`tls` ∥ 新 `PUT …/runners/:id/connection`（全列覆写；先自检后落库⇒失败库零变；关 TLS 单语句原子；**缺 `connection` ∥ `null` ⇒ 400 零静默关 TLS**）∥ 审计 `runner_add`（+`tls` 布尔）∥ `runner_connection` |
| `thincoder-server/deploy/sandbox-probe.mjs`（新，679 行） | P1–P14 驱动 ∥ 一次性容器径（**零 `docker exec`**）∥ PASS/FAIL/SKIP + 退出码 0/1/2 ∥ 探针用毕即删（含 P12/P13 失败路径 try/finally）∥ 宿主读数 = 容器 + 宿主文件只读挂载（父侧已裁；条件 a 落于 P1/P2/P9 的「读不到 ⇒ 如实 SKIP」） |
| `docs/batches/2026-10-13-sandbox-exec-rebuild-tls.test.mjs`（新，627 行） | 13 腿（T1–T13）全绿：明文零行为变化（假件计数 + 传输同一性）∥ 适配件选项逐值 ∥ 连接端点两腿 ∥ 写门零缓存 ∥ 放置 ∥ 盒读数 ∥ 死件机检 ∥ 探针脚本 vm 编译 ∥ 绑定节点门 |
| out-of-list（已披露，父侧 2026-10-14 认可） | `container-routes.mjs`(324)/`volume-routes.mjs`(103)/`terminal-routes.mjs`(342)/`agent/chat-tools.mjs`(504)（+`agent/chat.mjs`(692) 1 行）：`config`/`requestImpl` 透传 |

**验收实测**：`node --test docs/batches/2026-10-13-sandbox-exec-rebuild-tls.test.mjs` ⇒ **13/13 全绿** ∥ 触档 `node --check` 全 OK ∥ 死件机检零命中（T11：注释剥离后队列/心跳/标签放置标识 + 零 `setInterval`）∥ 明文行零涉机检（T2 假件调用计数 + T11）。
**设计预算对照**：`docker-tls` 133（预算 ≈220）∥ `docker` 422（≈455）∥ `registry` 419（≈410）✓ ∥ `probe` 679（≈320——超，已随交付报告登记）∥ `-tls` 单测 627（≈180——超，同上）。

**决策透明表（本舱自主处置 ∥ 已报事项）**

| # | 决策 | 依据 |
|---|---|---|
| 1 | 工作区面自 `routes.mjs` 删除、新档 `workspace-routes.mjs` 归他舱 | 设计拆案首选执行（§14 表）；父侧 2026-10-14 回裁「批内中间态 = 正常」 |
| 2 | 探针宿主读数 = 容器 + 宿主文件只读挂载（非 SSH） | 跑法无 SSH 参；父侧 2026-10-14 裁「接受」+ 条件 a/b（b = `EXECUTION.md` §10 句由父侧收口轮随正——本舱零触设计档） |
| 3 | 地址归一追加拒路径/查询/凭据 | 与同函数「零静默推断」同口径（零静默截断）；评审核查采纳 |
| 4 | 关 TLS 面 `connection` 缺键 ∥ `null` ⇒ 400 | API §2.5 该键无 `?`；「静默关 TLS」不可接受（评审核查采纳） |
| 5 | `dirty` 恒 `false` 如实（不伪造） | 心跳面已退场（无源）；设计侧「dirty 注记」句待随正（报父侧，未自裁） |
| 6 | 补放置失败无审计 | 设计句（§3「逐工作区失败 ⇒ 审计」）与审计 kind 十键闭集相抵 ⇒ 相抵上抛（未自裁） |

**审计/评审轮次与终态**

- 内部偏航审计（explore · 轮 1）：4 类发现——探针容器失败路径泄漏（**已修**：P12/P13 try/finally）∥ PUT 缺键静默切档（**已修**：400 + 腿）∥ `#1351` 事务 400/502 口径（他舱行，列报）∥ TLS 终端面（跨舱，上抛）。
- 内部代码评审（advisor · 轮 1 + 轮 2）：轮 1 表 10 行（1🔴/6🟡/3🔵）⇒ 修正：探针失败路径 ∥ `docker.mjs` 头注按档收正 ∥ 地址拒路径/查询/凭据 ∥ 删死导入 `recordAudit` ∥ 新增 `requireRunnerAvailable` + T13/T1 两腿；轮 2 复核：上述全部落地，另出 1 新发现（`connection: null` ⇒ **已修** + T7 腿）。
- **终态 = 收敛中带 1 条 🔴 待裁（非 stalled）**：TLS 节点「终端」面升级腿不走 TLS —— `docker-exec.mjs:78` `startExecTransport({…httpRequestImpl = httpRequest…})`（缺省 `node:http`；`:99-101` 只给 host/port/path、零材料）+ `terminal-routes.mjs` 该腿只透传 `httpRequestImpl` ⇒ `https://…:2376` 行 = 明文 HTTP 打 TLS 口 ⇒ 会话必死；而设计要求「生效面全谱含终端」（`SANDBOX.md` §3/§11 ⑤）——与该舱预算「终端四路由 +≈3」（`EXECUTION.md` §14）不匹配（设计假定透传两参即够，实际差一条 TLS 感知升级传输）。二择（① 我在 `terminal-routes.mjs` 按行注入材料感知 `httpRequestImpl` ≈15 行 + 腿 ∥ ② 路由终端舱或收正设计 + 披露）已上抛父侧（2026-10-14），**未答前不做**（不静默降级）。
- 遗留报告项（非 must-fix，报父侧）：补放置失败无审计 ∥ `dirty` 设计句 ∥ `EXECUTION.md` §14 受影响文件表缺 `chat-tools.mjs`/`chat.mjs` 两行 ∥ `probe`/`-tls` 两档超 500 软线（预算对照见上）。

**随正/披露（本舱报出——写门拒改跨批件）**

- 跨批件随正（父侧/他批）：`2026-10-10-runner-admin-console.test.mjs`（列面断言 +四列 ∥ 链尾读数 17⇒22 ∥ E34 语话术）∥ `2026-10-08-server-public-structure.test.mjs`（档目 +`docker-tls.mjs` 名）∥ `2026-10-06-server-gateway.test.mjs`（表列断言含已删 `sandbox_tasks`）。
- 面外：`bin` 终端 hub 装配缺 `config`（装配舱已闭——父侧确认）∥ `workspace-routes.mjs` 绑定面门消费切换一行（执行面舱另派；调用形与坐标见交付报告）∥ `routes.mjs` #1351 事务块 400 vs 设计 502（他舱行）。

**审计与代码评审轮次与终态（本舱自跑）**

**轮 1 · 内部分歧审计（read-only explore——对批档 §2 + `sandbox/EXECUTION.md` 等设计档逐判据比对）**：终态 `divergent`（13 条：🟡×6 ∥ 🔵×7——PARTIAL 8 ∥ SILENT-SIMPLIFICATION 1 ∥ DOC-DRIFT 3 ∥ OUT-OF-LIST 1；判据层 ①⑩符合 ∥ ②③④⑤⑥⑦⑧⑨分歧；零 🔴）。审计实读证据与我 §5 首段的落件口径一致；超清单两处（`hosts.mjs`/`ssh.mjs`）判为「已披露 = 可接受」。

**轮 2 · 自修（本舱已落 · 逐条对账）**

| 审计号 | 处置 | 落法 |
|---|---|---|
| D1 销毁门读数缺 dirty | ✅ 已修 | `workspace-routes.mjs:271` 门报文 = 盒态 ∥ `dirty`（源 = `boxStateOf`，心跳源已退场 ⇒ 恒 false——如实不伪造）∥ 快照数（三件齐） |
| D2 规则变更下发非同步且响应零告警 | ✅ 已修 | `routes.mjs:61-75` `pushEgress` 改 **await** + 出 `egressState`；三端点（增/改/删）响应携 `egressState`，失败附 `warning`（「下发未就位」——不反噬已落库事实） |
| D3 临时集到点无重算触发 | ✅ 已修 | `egress.mjs` 增 `tempFingerprintOf`/`tempSetsNeedRepush` + `ensureEgressApplied` 增「临时集指纹变了 ⇒ 旧就位过期」判；`box.mjs` `tickBoxes` 首步 = 到点 ⇒ `dispatchEgressAll`（tempKey 到点消解 ⇒ 重算） |
| D4 绑定面写门探「任一 active」 | ✅ 已修（父侧收尾核对 steer） | `registry.mjs:273` `requireRunnerAvailable`（#105 已落）⇒ `workspace-routes.mjs:17` 入 import ∥ `:242` 消费点逐字（绑定节点离线 ⇒ 503 人话）；创建面 `:104` 仍 `requireSandboxAvailable`（探任一——§7 两门成对）；未绑 503 两因分列在 `:232-240` |
| D5 补放置只落绑定、建盒驱动成死件 | ✅ 已修 | `routes.mjs:163-172` 登记成功后 `void placePendingWorkspaces(...)`（绑定 + 建盒链；`box.mjs:632` 驱动不再死件；失败 ⇒ 行留未绑 + 读数） |
| D6 `registry_credentials.updated_at` 可空/列序与 STORE 相抵 | ⏳ 上抛（不自行裁） | 两侧：STORE §2 v22「`updated_at TEXT NOT NULL`（`created_at` 后）」vs 父侧 steer 原句「增 `updated_at TEXT`（七列）」。本舱按 steer 落（可空、列序在 `created_by` 后）；两写径恒写值 ⇒ 行为零差。**请父侧裁**：改 DDL 对齐 STORE（须顾 #106 写面 INSERT 形）∥ 或 STORE 行随 steer 收正 |
| D7 #1351 回滚路径状态码 400 vs 设计 502 | ✅ 已修 | `routes.mjs:158-161`：`HttpError` 原样（输入形非法仍 400）∥ 非 `HttpError`（内部面炸）⇒ 502 `upstream_error` + 人话「登记事务回滚（零残留）」 |
| D8 网段重读缺 `config`/`requestImpl` 透传 | ✅ 已修 | `dns-gate.mjs:124` 工厂签名补 `requestImpl = null`；`:155` 透传两参（TLS 节点网段重读可达） |
| D9 `config_update` 新增写入点未入 ACCOUNTS §2.1 | ⏳ 上抛（知会） | 写入点坐标 = `routes.mjs`（settings PATCH——键名清单 detail 同形）；单源行（`ACCOUNTS.md:69`）只列 `gateway/config-admin.mjs`。**请父侧/设计侧补写入点行** |
| D10 非 IPv4 `config.host` ⇒ `Dns`/内置允许双缺（条件化实现） | ⏳ 上抛（知会） | `box.mjs:74-78`/`:156` 与 `egress.mjs:46-49` —— 代码自注「不猜」；设计参数表无条件。生产以 IP 部署时为零触分支；**请裁**：非 IPv4 部署是否应当建盒失败（fail-closed）还是维持现状 |
| D11 头注「余型 ⇒ 空答」与行为不符 | ✅ 已修 | `dns-gate.mjs:216-219`：非 A（`type !== 1`）⇒ NOERROR 空答（不伪造他型记录）；用例 N68 覆盖 |
| D12 链径就位复核失败零 `egress_apply_failed` 审计 | ✅ 已修 | `box.mjs:308-317` `stepEgress`（③ 步三处消费）失败 ⇒ `markEgressFailed` + 审计 `egress_apply_failed`（键集 = kind+runnerId+reason）+ 抛；`dns-gate.mjs:183-186` 门径只标未就位不重审计（避逐问刷屏） |
| D13 超清单两处（stdin 透传） | ✅ 披露齐备 | 见本段首部披露 + 报告 |

**轮 2 附带自修（测试暴露的真缺陷 · 3 件）**

- `markEgressFailed` 的 `now` 参数形不一致（函数 ∥ 值两形混用）⇒ **失败路径自身抛「now is not a function」**，掩盖真实下发错误（`egress.mjs:302-306` 已收两形）
- 就位缓存早退判漏临时集指纹 ⇒ 新增临时放行后不重下发（`egress.mjs:290-292` 已补）
- 审计 `box_destroy` 缺件（ACCOUNTS §2.1 盒面三 kind 含它）⇒ `box.mjs:567-568` 销毁链两行（`workspace_destroy` + `box_destroy`）

**轮 3 · 复跑读数（自 `thincoder/` 仓根）**

- 本舱两档：`2026-10-13-sandbox-exec-rebuild.test.mjs` ⇒ tests 24 / pass 24 / fail 0 ∥ `…-egress.test.mjs` ⇒ tests 9 / pass 9 / fail 0（合 33 例；新增 B68b 绑定节点门、N67c 同步下发 + 告警、临时集到点判据）
- 邻舱批内件复跑（回归——全绿）：`-base` 11 ∥ `-tls` 13 ∥ `-base-ui` 7 ∥ `-tls-ui` 7 ∥ `-container-terminal` 12 ∥ `sandbox-volumes` 6 ∥ `server-core-unification` 10

**终态**：本舱实施 + 自修收敛（`clean` 于本舱写面——残留三条 = 上抛待裁/知会，均在**非本舱写面**：D6 DDL 归属、D9 单源补行、D10 部署口径；本舱两档 33 例全绿）。

**轮 4 · 内部代码评审（advisor `type=code` · 同步单轮）**：判 `changes-required`（🔴×1 ∥ 🟡×9 ∥ 🔵×4——对象 = 本舱 12 档，`registry/docker/derive/rules/bin` 作证据面引用）。逐条处置：

| 级 | 发现 | 处置 | 落法 / 去向 |
|---|---|---|---|
| 🔴 | `dns-gate.mjs` 网段表「重启后按需重读」= 死代码：调 `client.networks.inspect`，而客户端成员为平铺 `inspectNetwork`（`docker.mjs:311`）⇒ 进程重启后旧盒查问恒 `ignored`（设计 `EXECUTION.md:123` 未达标；连带 D8「已修」声明落空） | ✅ 已修 + 补用例 | `dns-gate.mjs:156-157` ⇒ 判 `typeof client.inspectNetwork !== "function"` + 直调 `inspectNetwork`；新增用例 **N68b**（表空进程 ⇒ 查问自触发重读 ⇒ `inspectNetwork` 被调（假传输记 `/networks/tc-ws-1`）⇒ 即答）——该腿原为零覆盖 |
| 🟡 | 同 host 重问 ⇒ 等待表被覆盖 + 旧 timer 反删新条目（裁定可整体丢失） | ✅ 已修 + 补用例 | `dns-gate.mjs:255-266`（超时回调只撤自条目 ∥ 重登前旧条目退位并回 REFUSED）；`notifyDecision` 先摘条目再判态；新增用例 **N68c**（两问一条目 ∥ 旧问 REFUSED ∥ 裁定后新问答成） |
| 🟡 | iptables 备径「逐条」实为单命令 `; ` 拼接 ⇒ 中间失败被吞、半成品链可被判就位（fail-open 窗） | ✅ 已修 | `egress.mjs:223` ⇒ `&&` 失败即断（两条 hook 在其后 ⇒ 失败即抛、未挂 hook ⇒ 链未引用）；`L1` 注释标「判据单源 = `HARD_DENY_CIDRS`」 |
| 🟡 | `tickBoxes` 临时集步在装配面失效（`bin:212` 只传 `{config, log}` ⇒ `execOf` 恒 null） | ⏳ 装配面（他舱写面） | 落点 = `bin/thincoder-server.mjs:212`（`hostExec` 实例在 `:181` 已有）——归 #108/父侧收口轮；本舱不写他舱文件 |
| 🟡 | `migrations.mjs` `updated_at` 可空/列序 vs `store/STORE.md:592` `NOT NULL` | ⏳ 上抛（同轮 2 D6） | 父侧收口轮二择；写面按列名 INSERT（`registry-creds.mjs:114`）⇒ 列序变更零阻 |
| 🟡 | `box.mjs` 667 行 > 500 软线（预算 ≈315） | ⏳ 报告（拆案候选） | 候选：主机命令面 ∥ 快照-恢复族 ∥ 定时器族 外拆；或设计档 §14 写「维持 + 行为上限」 |
| 🟡 | `migrations.mjs` 710 行 > 500 软线，且越 STORE §4「>700 ⇒ 起外拆轮」触发线（拆案产物再越线） | ⏳ 报告（设计席裁） | 二择：迁移段再分档 ∥ 明文豁免句（append-only 链维持 + 硬线 800 监控） |
| 🟡 | 批内件 800 行（= 硬限边界，预算 ≈620） | ⏳ 报告 | 随正设计 §14 预算读数；拆档候选（按腿分组） |
| 🟡 | 补放置失败零审计 vs `EXECUTION.md:83`「逐工作区失败 ⇒ 审计」（同轮 2 D9 同族） | ⏳ 上抛（设计席裁） | ① 设计句收正 ∥ ② 补 kind 入 ACCOUNTS §2.1 |
| 🟡 | 销毁门 `dirty` 恒 false 伪读数 vs `EXECUTION.md:59` | ⏳ 上抛（设计席裁） | 删键 ∥ 保留 + 文档写明「无源」；本舱已按「如实不伪造」实现（源 = `boxStateOf` 恒 false） |
| 🔵 | `parseDnsQuery` 头注「多问题 ⇒ null」vs 行为 | ✅ 已修 | `dns-gate.mjs:42` ⇒ `qdcount !== 1` 即 null（与头注/单问题面同口径） |
| 🔵 | `placePendingWorkspaces` 空值次序（`workspace.runner_id` 先取后判） | ✅ 已修 | `box.mjs:655-658` ⇒ 行缺/未绑先 `continue`，再取节点行 |
| 🔵 | B71 超时腿依赖墙钟（1300ms sleep）——慢机易 flaky | ⏳ 保留并披露 | 真 timer + 真窗为设计面行为；假时钟化需给闸加时钟注入缝（非本轮范围） |
| 🔵 | 未放置创建径零审计（行 + key 落库而 `sandbox_event` 零行） | ⏳ 报告 | 设计席裁：未放置径也落 `workspace_create`（detail 标 `runnerId:null`）∥ 明写「零审计」为口径 |
| 🔵 | `bin` ticker 未注入 `host`/`execOf` | ⏳（同 🟡 第 4 行） | 见上——装配面 |

**轮 4 复跑（自 `thincoder/` 仓根 · node --test）**：本舱两档 ⇒ **24 + 11 = 35 例全绿**；邻舱/邻批回归全绿：`-base` 11 ∥ `-base-ui` 7 ∥ `-tls` 14 ∥ `-tls-ui` 7 ∥ `container-terminal` 12 ∥ `container-actions` 5 ∥ `sandbox-volumes` 6 ∥ `server-core-unification` 10。旧批四件红（`outbound-member-face`（新契约下旧断言——创建工作区现走建盒链）∥ `sandbox-docker-admin`（base 舱 `auth` 键）∥ `runner-admin-console`（链尾 17 ⇒ 22）∥ `image-sources`（20 ⇒ 22））——**均非本舱写面**，随正归父侧（我舱改他批档被写门拒：`cross-batch batch-record write`）。

**终态**：`clean`（本舱写面）。🔴 清零；🟡/🔵 余项 = 3 条设计席/父侧待裁（D6 DDL 归属 ∥ D9 审计 kind ∥ dirty 语义）+ 2 条装配面待接（`bin` ticker 注入）+ 3 条档位报告（box 667 ∥ migrations 710 ∥ 批内件 800 行）+ 2 条 🔵 保留披露（B71 墙钟 ∥ 未放置零审计）。**本舱两档 35 例全绿；改动能落的本轮全落（🔴×1 + 🟡×3 + 🔵×2 = 6 处代码/用例）**。

### §5 实施记录（eng-coder · TLS 终端面修轮——exec 升级腿按行注入材料感知传输）

**起因**：承本 §5 节点连接舱终态所载 1 条 🔴——TLS 节点「终端」会话路径死（`docker-exec.mjs:78` `startExecTransport` 缺省 `httpRequestImpl = node:http`；`terminal-routes.mjs` 只透传缺省 ⇒ `https://…:2376` 行 = 明文打 TLS 口 ⇒ 会话必死）；设计判据 = `sandbox/SANDBOX.md` §3 连接方式块 ∥ §11 ⑤ ∥ §16 R74④（TLS「生效面全谱」含终端族）⇒ 实现缺口。父侧裁决 = 二择 ①「按行注入材料感知 `httpRequestImpl`」（本轮落地）。

**落件（实读行数 = 本修轮末）**

| 档 | 实读 | 变更 |
|---|---|---|
| `thincoder-server/src/sandbox/terminal-routes.mjs` | **342 ⇒ 362 行**（+20——升级腿函数 12 + 接线 2 ≈15 口径 ∥ 头注/导入/漂移栏 ≈5） | 新导出 `execUpgradeTransportFor`（:85-89——明文行 ⇒ 透传既有注入、未注入 ⇒ `undefined`（`startExecTransport` 缺省 `node:http`）∥ TLS 行 ⇒ `tlsMaterialsOf` 按行解密 + `ca`/`cert`/`key` 逐值入 `https.request`）∥ hub 接线（:328-330）∥ 头注（:11-12）∥ 导入（`node:https` ∥ `docker-tls.mjs` 两导出） |
| `docs/batches/2026-10-13-sandbox-exec-rebuild-tls.test.mjs` | **627 ⇒ 711 行**（+84） | 新腿 **T14**（:661-711——明文行 ⇒ 同一引用透传 ∥ 缺省不注入；TLS 行 ⇒ 三件逐值交 `https.request`（经 `createExecOps.start` 真消费为证）；缺件 ⇒ 抛——零静默降级）∥ 升级形假件 `fakeUpgradeRequest`（:169-195）∥ 射程头 + 导入两行 |
| 零触（如实） | — | `docker-exec.mjs`（内容实读无 TLS 面 ∥ 本修轮零写）∥ `docker-tls.mjs`（只消费导出）∥ 设计档/需求档 ∥ 其它面 |

**验收读数（自 `thincoder/` 仓根实跑）**

- ① `node --test docs/batches/2026-10-13-sandbox-container-terminal.test.mjs` ⇒ **12/12**（明文基线零回归）。
- ② `node --test docs/batches/2026-10-13-sandbox-exec-rebuild-tls.test.mjs` ⇒ **14/14**（盘面基线实读 **13** 腿（T1–T13）——任务书载 12 = 陈旧计数；+T14 ⇒ 14；计数出入如实，待父侧随正）。
- ③ 两档 `node --check` = `Syntax OK`。
- ④ 明文零变化机检：明文行（无注入）⇒ 选择值 `undefined` ⇒ `startExecTransport` 缺省 `node:http.request`（`docker-exec.mjs` 零改）；明文行（有注入）⇒ 同一引用透传（T14 断言）；hub 全链明文腿 = `-container-terminal` 12/12（真 HTTP 假引擎 + 真升级劫持——该批零注入 `httpRequestImpl`）。

**新腿红绿对（活跑读数——临时监听，零落档）**

- **红**（修前装配形——TLS 行无按行传输 ⇒ 缺省 `node:http`）：TLS 行升级腿以**明文 HTTP** 抵达明文监听（`POST /v1.44/exec/exec-red/start` 到达 +1）——对真 TLS 口即会话必死。
- **绿**（修后装配形——按行材料感知）：同一 TLS 行零明文到达（+0）∥ `https.request` 缝记账 1（`ca`/`cert`/`key` = 按行解密逐值、端口 2376、路径逐值）。
- 对照：明文行缺省选择 `undefined` ∥ https 缝不参与。

**审计 / 评审轮次与终态**

- 内部偏离审计（explore · 轮 1）：四类（PARTIAL ∥ SILENT-SIMPLIFICATION ∥ DOC-DRIFT ∥ OUT-OF-SCOPE）**零偏差**；材料复用（零第二套 crypto）∥ 缺件抛（零静默降级）逐项核过；1 处措辞精度（头注「恒缺省」）指出即收正（:12 ⇒ 「恒现状（透传既有注入；未注入 ⇒ `node:http`）」）。
- 内部代码评审（advisor · 轮 1 + 轮 2）：轮 1 = **pass**（0🔴；3🟡 均标「可选、非阻塞」∥ 2🔵）。处置：🔵① 冗余自证断言 ⇒ **已删**；🔵② 选项字段与 `httpsFetchOf` 同拍漂移栏 ⇒ **已补**（:82）。🟡① hub 层缺 `httpsRequestImpl` 注入缝（TLS 行 hub 级端到端腿暂不可写）⇒ 接受（超本腿；任务口径 = 「选了哪条传输」级——T14 已达）；🟡② 材料失败落点 101 后 + 同行材料解密两遍 ⇒ 接受（与 :313 同判据先行抛、第二抛点实际不可达；fail-closed 不变）；🟡③ 测试档越 500 软线 ⇒ 接受（在册）。轮 2 = **pass**（2 修项逐条核过、3 接受理由成立、零新发现）。
- **终态 = clean（收敛）**。

**未落 / 边界（如实）**

- hub 级 TLS 端到端腿（WebSocket + 升级假引擎 + `httpsRequestImpl` 缝）= **未做**（需测试基建扩展，超本腿；已随 🟡① 报父侧）。
- 真机 TLS 全链（自签三件 ⇒ 切档 ⇒ 终端可用）= 父侧收口轮（ECS `.6`；R74④「全谱可用（读数/容器/镜像/终端）」含本腿）。
- 预算差：设计 §14 记终端档 +≈3（四路由透传行口径）；本腿实读 +20（342 ⇒ 362）——设计档行随父侧收口轮随正（本席零触设计档）。

### §5 实施记录 · 装配舱（eng-coder）

**交付摘要（声明面 4 档）**
- `bin/thincoder-server.mjs`（243 行）：装配收口——① 盒 ticker 30s（`setInterval` + `unref` + 停机/启动失败两路清理）；② DNS 闸（`createDnsGate` 建 ⇒ `start()` 随 listen ⇒ `error` 事件如实落 `dns_gate_bind_failed`，不吞、不阻服务 ⇒ `stop()` 解绑两路）；③ 路由族注册（`registerRegistryCredRoutes` 四端点——全仓唯一调用点 ∥ `registerSandboxRoutes` 携 `deps.dnsGate`——建盒网段登记 + 待批裁定回填靠此注入）；④ 终端 hub 装配补 `config`（TLS 档材料解密所需）；⑤ ticker 补 `host: hostExec`（④ 临时集到点重算步接线——实例 = 同档 `:181`，与 DNS 闸共用）。
- `public/i18n-{zh,en}-system.mjs`（各 221 行）：审计 kind 键 **+10/表**——父侧指派 5（`workspace_base` ∥ `image_derive` ∥ `registry_credential_set` ∥ `registry_credential_revoke` ∥ `runner_connection`）+ 评审 r1 must-fix 5（`workspace_destroy` ∥ `checkpoint` ∥ `checkpoint_fail` ∥ `egress_apply_failed` ∥ `quota_apply_failed`）；段注释型面计数收正（十三 ⇒ 「本表十五型在册；型面十七型——两待落」）。两表 197 键同拍。
- `public/views-audit.mjs`（250 行）：`SANDBOX_KIND_KEYS` **+10 行**（同上 10 kind）——映射面 ↔ i18n 键面 40↔40 全集闭合，零死映射。
- 全仓读面：服务端实发 kind（`box.mjs` ∥ `egress.mjs` ∥ container 面动态 kind）全数有映射 ⇒ 「服务端实发全量对齐」。

**机检 / 冒烟读数（逐条实跑）**
- `node --check` 四档全绿；双表 197∥197 且键集逐名相等；en 值面零 CJK（CJK 仅注释面）。
- `sandboxKindLabel` 10 枚 × 两档逐值人话、零原始串、枚举外兜底不变（`nope_unknown_kind` ⇒ 原值）。
- ④ 步红/绿对照（探针）：`tempSetsNeedRepush = true` 下——无 host（修复前形）`out.egress = undefined`（空转）；有 host（现形）`out.egress = [{"runnerId":1,"ok":true,"mechanism":"iptables","rulesRev":0}]` + 5 次外呼（注入 exec 被消费）。
- 全链生命周期冒烟（进程内驱 `run()` + 自建 log）：ready=1 ∥ startup_failed=0 ∥ 凭据族 401 ∥ 工作区族 401 ∥ ticker 30s 节拍命中（`box_tick_failed`——节点不可达如实记）∥ 无临时项时 `egress_*` 日志 = 0（④ 步正确零动）∥ DNS 闸绑定成功（零 error 事件）∥ `SIGTERM` ⇒ shutdown/stopped/exitCode 0 ∥ UDP 53 停后可再绑（闸已解绑）。

**决策透明表**
| 决策 | 依据 | 备注 |
|---|---|---|
| DNS 闸绑定失败「如实报错不吞、不阻服务」 | 设计 §6「闸非强制点（强制点 = nft）」 | `error` 事件 ⇒ `log.error("dns_gate_bind_failed", {port, code, message})` |
| ticker 传 `host: hostExec`（对象形）而非 `execOf` 函数形 | `box.mjs:590` 两形皆收、`:112 hostOf` 取 `deps.host`；tick 的停/快照步透传 deps（`:617/:624/:632`）⇒ 一并补上停机链 host 侧件 | 父侧 steer「补传 hostExec」 |
| views-audit 超清单 +5 映射行 | 评审 r1 must-fix：服务端实发 kind 无映射 ⇒ 审计页回退原值串（走查轮 2026-10-11 同款先例） | 父侧指派 5 + 评审 5 = 10 行 |
| 段注释计数「十五型在册」 | ACCOUNTS §2.1 型面链 + 本表实载 15 枚 `audit.type.*`（`member_event`/`mcp_event` 全仓零发射点） | 沿 admin-agent-awareness 批同款先例 |

**审计与代码评审轮次与终态**
- 内部 explore 分歧审计 1 轮：四类偏差 0 条 ∥ 域外单列 1 条（当时 = `views-audit.mjs` 无消费者 ⇒ 父侧裁归本舱 ⇒ 已落 10 行）。
- advisor 代码评审 r1：**changes-required**（must-fix：执行面 5 kind 无键无映射；另 6 条 🔵）⇒ 处置完毕（2 修 ∥ 5 报告项）。
- advisor 代码评审 r2（修复核验）：**pass**。
- 后置 pen（父侧 steer 未落项 A，r2 后落）：`bin:212` 补 `host: hostExec`——验证 = 红/绿对照探针 + 全链冒烟（读数见上）；**该 pen 未再过评审轮**（如实披露）。
- **终态：clean**（r2 pass；其后仅父侧 steer 的 1 行补线，已机械 + 行为双验）。

**未落 / 报告项（父侧收口面）**
- `views-audit.mjs:5` 头注「型面十五型——全型收编」vs ACCOUNTS §2.1 十七型（`member_event`/`mcp_event` 两批未落）——待其落地同拍（含 `audit.type.*` 键与详情支）。
- 键族计数链未收平：`webui/SANDBOX.md` `:143` `kind 族 34 ⇒ **35**` / `:147` `30 ⇒ **34**` 未随本笔 40 收正；批档 §2 仍作「kind 四键」（实为 +10 键 + 10 映射）。
- 行账：bin 实读 243（设计 §14 ≈229）；views-audit 实读 250。
- 跨批聚合守卫 `2026-10-08-server-public-structure.test.mjs:70/71`（`1033`/`1038` 两锚）需收口轮复跑/重锚——本轮只读未跑（unverified，不作 pass 依据）。
- 装配三件（ticker ∥ DNS 闸 ∥ 注册链）无持久断言（本批批内件属他舱写面）——建议收口轮登记。

### §5 实施记录 · 收口修复轮（eng-coder · B/C/D/F 工具侧四条落码）

**起因**：父侧 §6 补挂裁定 B/C/D/F（设计面 = eng-designer 已落）；目标 = 收口（提交/部署/真机）无悬留。本修轮只动四条面 + 其批内测试（禁全量重勘、零新语义扩面）。

**落件（实读坐标 = 本修轮末）**

| 面 | 落法 | 坐标 |
|---|---|---|
| **B** 补放置失败 ⇒ 审计 | `placement_failed`（沿 `_failed` 族：target = 工作区名、detail = `{kind, workspaceId, runnerId, reason(截 300)}`、ts = 注入钟）；`box_place_create_failed` 日志行保留；catch 不解绑 ⇒ **行留（绑定保留）** | `src/sandbox/box.mjs:675-682` ∥ `public/views-audit.mjs:228` ∥ `i18n-zh-system.mjs:218`「放置失败」∥ `i18n-en-system.mjs:218` "Placement failed" |
| **C** DDL 收正 | `registry_credentials` DDL 逐字对齐 `store/STORE.md` §2 v22 单源：`updated_at TEXT NOT NULL`（`created_at` 后、`created_by` 前）；「NULL = 未改过」注释删净；写面两径恒写值（`registry-creds.mjs:114` INSERT 携 ∥ `:138` UPDATE 刷新）⇒ 行为零差 | `src/store/migrations.mjs:642-650` |
| **D** `dirty` 删键 | 读/消费/报面全链去净：`boxStateOf` 基对象四键 ∥ `readBoxStatesOf` 两基对象 ∥ 成员行 ∥ `workspaceView` ∥ 销毁门报文（`boxState=… ∥ 快照 N 份`）∥ 成员视图五列 ∥ me 两表三键退役（`colDirty`/`dirtyYes`/`dirtyNo`）；全仓同词零残留（余 = `terminal-core.mjs`/`terminal-render.mjs` 终端脏行机制——名同物异） | `registry.mjs:336` ∥ `box.mjs:275/292` ∥ `routes.mjs:385-393` ∥ `workspace-routes.mjs:73-75` + `:270` ∥ `views-me-sandbox.mjs:84/87-94` ∥ `i18n-zh-me.mjs:69-85` / `i18n-en-me.mjs:70-86` |
| **F** 三链链前置（fail-closed） | `assertServerAddress`（`node:net` `isIPv4`；抛 `BoxStepError("链前置", …)` 人话「内置允许与盒 DNS 注入同源，双缺 ⇒ 盒静默断网（改 IPv4 后重试）」）——建盒/启动确保/轮换重建三链**首句**调用 = 零步执行（先于一切 Docker/SSH 调用）；停止/快照/恢复/销毁零触（设计三链口径） | `src/sandbox/box.mjs:323-329` ∥ 调用 `:336` / `:359` / `:407` |

**批内测试随拍**
- `docs/batches/2026-10-13-sandbox-exec-rebuild.test.mjs`（实读 **847** 行）——+B 腿（`:532-553`：键集/两 id/target/ts/日志行/行留逐断言）∥ +B77 腿（`:631-656`：域名 ∥ IPv6 × 三链——步名/人话/处置句 + 零 SSH/零 Docker + 行保留 + 修正后重试照跑）∥ C 断言收正（`:730-732`：七列顺序 + `updated_at` `notnull=1`）。
- `docs/batches/2026-10-13-sandbox-exec-rebuild-tls.test.mjs:566`——T10 盒读数断言去 `dirty`（随 D 面）。
- 跨批两件（`2026-10-13-sandbox-outbound-member-face.test.mjs` ∥ `…-ui.test.mjs`）写门机械拒（`cross-batch batch-record write`——本子代理绑定本批档）⇒ D 面使两件断言过期、**随正归父侧**（同 §5 前舱先例）。

**实跑读数（自 `thincoder/` 仓根 · node --test；逐件）**
- 本批六件全绿：`-exec-rebuild` **26/26** ∥ `-tls` **14/14** ∥ `-base` **11/11** ∥ `-base-ui` **7/7** ∥ `-egress` **11/11** ∥ `-tls-ui` **7/7**。
- `node --check` 改动 11 档全绿（Syntax OK）。
- 跨批两件当刻读数（归父侧随正）：`-face.test.mjs` 9/10（唯一红 = `:500` 行形键集含 `dirty`）∥ `-face-ui.test.mjs` 5/8（② 六列表头 ∥ ⑦ `colDirty` 缺键 ∥ ⑧ `:root` 58 vs 实读 **76**——存量过期、修前即红）。
- i18n 键数推（按在册读数算术）：D 面退 3 键/表 ⇒ 1033/1038 ⇒ **1030/1035**（父侧指纹件 `2026-10-08-server-public-structure.test.mjs` 重锚）。

**决策透明表**

| # | 决策 | 依据 |
|---|---|---|
| 1 | B 审计 target = 工作区名、ts = `(deps.now ?? Date.now)()`、reason 截 300 | 沿 `quota_apply_failed` 同形（设计句「与 `_failed` 族同形」+ ACCOUNTS §2.1 键集） |
| 2 | 链前置 = `BoxStepError("链前置", …)`（步名 + 人话） | 设计句用词（EXECUTION §3「链前置（fail-closed）」）；沿链步错误形 |
| 3 | 前置判以严格 `isIPv4` 为准；`dnsServerOf`/`serverIpOf` 宽正则零改 | 裁令点名 `isIPv4`；宽正则收而严格拒者（本环境实测 `isIPv4("999.1.1.1")=false`）⇒ 链首停 = fail-closed 收窄；正则改动 = 越面（零新语义） |
| 4 | C 注释逐字取 STORE 单源块 | 任务书「DDL 收正与该单源逐字一致」 |
| 5 | `-tls` 件 :566 随 D 面收正 | 同批件（写门内）；断言对象 = `boxStateOf` 出形 |
| 6 | 跨批两件不作绕过尝试（写门拒 = 终） | 授权 ≠ 闸越（写门 prevails）；同 §5 前舱先例归父侧 |

**审计 / 评审轮次与终态**
- 内部偏离审计（explore · 轮 1）：**四类偏差 0**（PARTIAL ∥ SILENT-SIMPLIFICATION ∥ DOC-DRIFT ∥ OUT-OF-LIST 逐类无）；唯一 PARTIAL = 本 §5 留档未落（= 本段，已落）。
- 内部代码评审（advisor · type=code · 轮 1）：**pass**（0🔴 ∥ 2🟡 均标可选 ∥ 2🔵）——响应表见下；无必修项 ⇒ 无需修复轮，直接收敛。
- fix round：自修 1 处（box.mjs 注释重排编辑残留块——syntax check 即捕即清，复跑复绿）；审计轮无代码修项；**终态 = clean**（本修轮写面）。

**响应表（advisor 发现逐条处置）**

| # | 级 | 发现 | 处置 |
|---|---|---|---|
| 1 | 🟡（可选） | 建盒链 ①⑤⑥⑦ 失败零审计 vs 设计句「任一步失败 ⇒ 停 + 人话（步名 + 原文）+ 审计」（`EXECUTION.md:56`）；kind 闭集无对应（与 B 同族张力） | **不修**（超本轮四条 mandate——禁新语义扩面）⇒ **[上抛·待裁]**：① 设计句收窄（明写审计 = ②③ + placement）∥ ② 扩 `_failed` 族 kind（沿 B 裁先例） |
| 2 | 🟡（可选） | F 前置接受 `0.0.0.0` ∥ `127.0.0.1`（本环境实测 `isIPv4` 皆 `true`）⇒ wildcard/回环 = 盒静默断网同类残留（F 裁字面范围外） | **不修**（F 裁 = 非 IPv4 字面量；扩面 = 新语义）⇒ **[上抛·知会]**：扩面候选一句（`host` ∈ {`0.0.0.0`, 回环} ⇒ 链首停）——如需 = 另笔 |
| 3 | 🔵 | `views-audit.mjs:5` 头注「型面十五型——全型收编」vs `ACCOUNTS.md` §2.1 十七型 | 不改（在册遗留——本批 §6 已挂「待其落地同拍」） |
| 4 | 🔵 | E 行 detail `keys` = 提交键名（`routes.mjs:366`）vs `ACCOUNTS.md:69`「变更键名清单」措辞 | 不改（超 mandate；代码 = 既有形 ∥ E 裁 = 零键增；措辞精度归设计席一句随正） |

**未落 / 边界（如实）**
- 真机面零触（提交/推送/部署 = 父侧）；跨批两件随正 ∥ 指纹件重锚 ∥ 需求档 `dirty` 残句（`requirements/PROJECT.md:496/504/506`）= 父侧/主 agent 面。
- 本修轮实际改动面 = 11 档产品码 + 2 档批内测试（跨批两件 = 拒；其余零触）。

**补记（同修轮末 · 随正观测）**：跨批两件已由父侧随正（本舱写门拒之后），复跑读数全绿——`2026-10-13-sandbox-outbound-member-face.test.mjs` **10/10** ∥ `…-ui.test.mjs` **8/8**（含 ⑧ `:root` 76 收正；行形/键数与 D 面逐条对齐）。⇒ 上表「跨批两件当刻读数（红，归父侧）」= 随正前 as-of 记录，留史；终局 = 全批八件全绿。另：`…-base-ui.test.mjs:135` fixture 仍携 `dirty: false`（惰性占位——视图零消费，复跑 7/7 绿；留报不触）。

## §6 验证与收口（父代理）

### 收口清单（父侧 · 暂存 2026-10-14 00:05 —— 收口轮执行，逐项核销）

**舱核读状态**：#104 执行面（收尾续段中）∥ #105 连接面 ✅（13/13；终态收敛）∥ #106 底座 ✅（11/11；clean）∥ #107 控制台 ✅（7/7 ∥ 7/7；clean）∥ #108 装配（在跑——5 kind 入 `views-audit.mjs` 映射）∥ #110 TLS-终端腿修复（在跑——上抛 ① 裁决落地）。

**跨批随正件（收口轮执行）**：① `docs/batches/2026-10-10-runner-admin-console.test.mjs`（列面 +四列 ∥ 列数 17⇒22）∥ ② `docs/batches/2026-10-08-server-public-structure.test.mjs`（档目 +`docker-tls.mjs` ∥ 键集/键数指纹终值——在途批写手全停后复读）∥ ③ `docs/batches/2026-10-06-server-gateway.test.mjs`（`sandbox_tasks` 表列断言）∥ ④ `docs/batches/2026-10-10-runner-admin-console-ui.test.mjs`（行钮 +1 ∥ 添加窗体 +`connection` ∥ 键集）。

**设计档回填（收口轮——父侧机械 + 设计席两裁）**：`sandbox/EXECUTION.md` §14 补 `chat-tools.mjs`/`chat.mjs` 两行（两档越 500 软线在册）∥ 行数实读回填（`probe 679`/≈320 ∥ `-tls` 单测 627/≈180 ∥ 终端腿 +≈15〔设计记 +≈3〕）∥ `EXECUTION.md:59` 销毁行 dirty 注记无源（如实恒 false——设计席裁）∥ `EXECUTION.md` §3「逐工作区失败 ⇒ 审计」vs 审计 kind 十键闭集相抵（设计席裁）。

**杂项**：`#1351` 事务块 400 vs 设计 502（他舱行——列报）∥ `bin` 终端 hub `config` = 已闭 ∥ 绑定面写门切换（`requireRunnerAvailable` 消费）= #104 在办 ∥ 「恢复标准」钮闩 = 台账 #1382（归批）。

**真机/集成轮**：ECS `.5`/`.6` 探针套件 + 建盒/快照/恢复全链 + 底座可换全链 + TLS 全链（含终端）——父侧唯一集成测试轮。

**补挂（控制台舱 #107 上抛·知会四条）**：① `webui/SANDBOX.md:15` 操作列枚举（展开 ∥ 删除 ∥ 连接）与 `:47`「与『SSH 凭据』并列」相抵——实现沿 `:47` ⇒ 收口轮收正 `:15` 枚举（父侧机械）∥ ② `gateway/API.md:135` overview 行元素枚举未含 `connection`/`tls`（`:136` 已述，服务端实发）⇒ 收口轮补枚举（父侧机械）∥ ③ 自定义端口节点经「连接」窗重存按档补缺省端口（fail-safe，库零变）= 设计既定，零动作 ∥ ④ 设底座窗无「工作区：{name}」目标行（设计未列不自创）——**登记为将来面候选**（他日补 = 新键一条 + 两表同拍；不排期）。

**补挂（执行面舱 #104 交付 · 2026-10-14 00:1x——未落项与上抛逐项处置）**：**A** `tickBoxes` 临时集装配未接线 ⇒ `bin:212` 补传 `hostExec`（实例 `:181`）——已 steer 装配舱 #108。**B** 补放置失败零审计（设计句 vs kind 闭集相抵）——裁向 lean = **补 kind**（审计失败记录有价值——设计句原意；计数链随正），收口设计轮落定。**C** `registry_credentials.updated_at` 可空/列序 vs `store/STORE.md:592` `NOT NULL`——裁：**STORE 为单源** ⇒ 迁移 DDL 收正（写面按列名 INSERT ⇒ 列序变更零阻）；随收口修复轮。**D** 销毁门 `dirty` 恒 false（无源伪读数——心跳面已随本批退场）——裁：**删键**（伪读数不留）+ 设计句收正 + 消费面核缺省容受；随收口修复轮。**E** `config_update` 新写点补入 `accounts/ACCOUNTS.md` §2.1（设计笔）——收口轮。**F** 非 IPv4 host ⇒ `Dns`/内置允许双缺——裁向 lean = **fail-closed**（建盒拒 + 人话；理由 = 静默退化网络 = 陷阱）；设计句随收口设计轮（牵连过大 ⇒ 二择呈父侧）。**G** 档位超线登记：`migrations.mjs` 711（越 STORE §4「>700 起外拆轮」线）∥ `box.mjs` 668 ∥ 批内件 796——台账挂行（#1385）。**I** 旧批四件红逐件读数（随正归收口轮）：`outbound-member-face:349` ∥ `sandbox-docker-admin:376` ∥ `runner-admin-console:477` ∥ `image-sources:598`。

**补挂（TLS-终端腿修轮 #110 交付 · 2026-10-14 00:2x）**：① **设计档预算随正**——`terminal-routes.mjs` 342 ⇒ **362**（+20 vs 设计 §14 记 +≈3；函数+接线 ≈14、余为头注/导入/注释）⇒ 设计回填轮一笔。② **hub 级 TLS 端到端腿**未做（需 `httpsRequestImpl` 缝 + WS/升级测试基建——评审 🟡 接受登记）⇒ 台账挂行（#1387）。③ 真机 TLS 全链（自签三件 ⇒ 切档 ⇒ 终端可用）= 收口轮 ECS 真机谱（R74④ 含终端——在册）。附：`-tls` 件基线实读 13（任务书载 12 为陈旧计数——修轮如实列报，坐实 14/14 全绿）。

**收口（父侧 · 2026-10-14 01:3x）**

## 一、复验读数（父侧亲跑）

- **批内件**（#120 自跑八件全绿，父侧复跑核心两件）：`-exec-rebuild` **26/26** ∥ `-tls` **14/14** ∥ `-base` 11/11 ∥ `-base-ui` 7/7 ∥ `-egress` 11/11 ∥ `-tls-ui` 7/7 ∥ `-face` 10/10 ∥ `-face-ui` 8/8（零 fail）。
- **跨批守卫两件**（父侧随正 + 复跑）：`2026-10-08-server-public-structure` 6/6 ∥ `2026-10-10-runner-admin-console-ui` 14/14——键数实读 **[1041, 1046]**（B 审计 kind +1/表 ∥ D `me.sandbox.*` 退三键——净 −2/表）；指纹重锚 zh `3c49a89b…` ∥ en `2d7fd0a6…`。
- **收口修复轮（#120）四条**：B 补 `placement_failed` 审计（`box.mjs:675-682` + 映射 + 双语）∥ C DDL 收正（`migrations.mjs:642-650`——`updated_at NOT NULL` 在 `created_by` 前）∥ D `dirty` 全链删净（`routes.mjs:391` 起，全仓同词零残留）∥ F 链前置 `assertServerAddress`（`box.mjs:323-329`——非 IPv4 ⇒ 三链链首停）。

## 二、部署（.5 真机 · 实跑）

- 提交 `2aad32d9`（45 档 +9802/−1444）→ .5 `git pull` ⇒ `docker build -f thincoder-server/Dockerfile`（新像 **`f7dc78014a1f`**）⇒ `docker compose up -d --force-recreate` ⇒ **Up ∥ `/healthz` 200**。
- **容器内核九读数**（docker exec 实读）：`PRAGMA user_version = 22`（v22 迁移已跑）∥ `replayArgsOf` 3 处 ∥ `argsFullOf` 2 处（管理面 chat 修复已上箱）∥ `placement_failed` 3 处 ∥ `assertServerAddress` 4 处 ∥ **`routes.mjs` `dirty` 0 处** ∥ `registry_credentials` DDL 在 ∥ `views-audit` 审计键在。
- **HTTP 面**：`/healthz` 200 ∥ `/views-me-sandbox.mjs` 200 ∥ `/views-sandbox-terminal.mjs` 200（终端档已上箱）∥ `/api/me/sandbox/workspaces` 401 ∥ `/api/admin/agent/chats` 401（鉴权门在位）。
- **事故披露（如实）**：本轮部署首次误用盒镜像档（`deploy/sandbox/Dockerfile`——其 CMD = `sleep infinity`）覆盖 `thincoder-server:0.1.0` 标签 ⇒ 容器 Up 假活（健康探针失败）**约 6 分钟**；随即按正确档（`thincoder-server/Dockerfile`——三处文档一致）重建恢复。**文档面零缺陷**（错在父侧命令执行——OPS §5.1/§5.7 ∥ TEST-ENV-ECS §3 ∥ README 三处命令均正确）；数据面零损（`/app/data` 卷独立）；回滚锚 `thincoder-server:pre-*` 历代在册。

## 三、遗留（在册 · 不静默）

- **#1397**（归批）：建盒链 ①⑤⑥⑦ 步失败零审计 vs 设计句 `EXECUTION.md:56`「任一步失败 ⇒ … + 审计」泛写——句面收窄 ∥ 扩 `_failed` 族 kind 二择（执行面余项批）。
- **#1398**（归批）：F 链前置边角——`0.0.0.0` ∥ `127.0.0.1` 过 `isIPv4`（裁字面面之外；同类静默断网残留）。
- **#1248/#1249**（在途——条件未达）：P2/P3 ∥ P1/P8 真机复证 = `deploy/sandbox-probe.mjs` 全跑（**需管理会话凭据**——留用户带 admin 登录跑一条命令；前置 = 一在线节点 + 闸下发）。
- 跨批写门拒（#120 上抛·知会）：`-face` ∥ `-face-ui` 两跨批件 = 父侧随正代落（10/10 ∥ 8/8 已绿——机制边界非授权问题）。
- #1377（Docker runner TLS）：归批本批——B 档（TLS 客户端证书，可选）已落（`docker-tls.mjs` + 连接行二择）；#1377 → 已核销。

## 四、结算

- **#1373** 沙盒执行面重做（本批）→ 已核销——依据 = 本 §6 ∥ 提交 `2aad32d9` ∥ 部署读数（healthz 200 ∥ v22 ∥ 九读数）∥ 批内件八件绿。
- **#1377**（Docker runner TLS 二择——归批本批）→ 已核销——TLS 档已落（`-tls` 14/14 绿 ∥ 设计 §16 收正）。
- **#1248/#1249** = 真机复证后另结（条件行在册）。
- 收口轮次 = 修复轮 1（#120——四条全落 ∥ 内审零偏差 ∥ 代码评审 pass）+ 父侧复验轮（两守卫重锚 + 部署探针）——**终态 clean**。
