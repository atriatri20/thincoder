# 2026-10-17 · admin-approval-cards
> 六段 append-only，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 编制：主 agent · 2026-10-17 · 来源 = 用户 2026-10-17 00:23 报「thincoder server 的会话里是不是没有做审批处理器啊？那边 agent 说任何需要审批的操作都会失败」+ 00:26 逐字裁定「必须上审批卡啊」⇒ 管理面（控制台会话）审批卡面落地。
> 台账 = #1596（sandbox · 归批）。前情 = `docs/batches/2026-10-17-sandbox-quota-chattr.md`（同域相邻批，独立）。
## §1 讨论（主 agent）
**状态行**：已收口（17/17 亲跑（含起跑窗 ∥ oneByOne 断流两例，先红后绿）∥ 部署 5b486188 在跑（ready·routes 142·healthz 200）∥ 浏览器真机走查绿：弹卡⇒批准⇒执行（approval-card-ok, exit 0）⇒回合续跑轮次 2）
<§1 模板占位：本批条目 / 关键判据 / 授权口径>

**症状（用户 2026-10-17 00:23 逐字）**：「thincoder server 的会话里是不是没有做审批处理器啊？那边 agent 说任何需要审批的操作都会失败。」；**裁定（00:26 逐字）**：「**必须上审批卡啊**」。

**父侧实证（读列明）**：① 管理面装配 `thincoder-server/src/agent/` **零 `onPermissionRequest`** ✗（grep 全目录 ✓）⇒ 核权限门挡（`thincoder-core/agent/dispatch.mjs:177-231`）判 `no permission handler configured` ⇒ **写类工具全拒** ✗ —— 与用户转述的 agent 自述吻合 ✓。② 设计档现文 = `docs/server/design/agent/ADMIN-AGENT.md:21`「**裁剪**：交互审批/问询面（无人值守——工具**不弹问**、**不自锁**）」✗ + `:604`「审批腿……已处置」✗ —— **「不弹问也不自锁」的设计意图与「全拒 = 自锁」的现状本就相悖** ✗。③ 成员面 = 完整先例 ✓（`MEMBER-AGENT.md:47` KD-SV-217：四类 ask ⇒ 页卡 ⇒ 应答端点 ⇒ 下行 answer ⇒ 盒壳结算；`always` ⇒ 置槽 `autoApprove` ✓）。④ `docs/server/design/mcp/MCP.md:129` 已写「审批接线落前 = 全拒 ∥ 落地后 = 审批卡」✓ 同向 ✓。

**本批条目**：管理面（控制台会话）**审批卡面落地**——取代 `:21` / `:604` 的「裁剪 / 已处置」表述 ✓；机制**照成员面同形** ✓（不得以「自动放行」替代卡片面 ✗）；页面面「面无源 / 五钮隐藏」句（`webui/CHAT.md:49` ∥ `:80` ∥ `:235`）随动收正 ✓。

**关键判据（可机检）**：卡弹出 ⇒ 批 ⇒ 工具执行 ✓ ∥ 拒 ⇒ 不执行且回合继续 ✓ ∥ `always` ⇒ 同工具不再弹 ✓ ∥ 断线 / 中止 ⇒ 兜底拒值 ✓；差异表（与成员面逐面 ✓ 无差异也显式写 ✓）。

**授权口径**：用户 00:26「必须上审批卡啊」= 本次裁定（B 案：同成员面机制 ✓）；**需求层条目**由主 agent 另落 ✓（父侧笔 ✓，不在设计席范围 ✗）。

## §2 批次任务与设计（eng-designer）
**状态行**：设计完成（修订轮毕——评审十条点修 + 父裁同族四号点修（见 §2 追加点修节））
<§2 模板占位：本批条目（覆盖） / 设计档落点 / 机制设计 / 受影响文件与测试覆盖 / 验收对照 / 关键决策 / 上抛项>

### §2 批次任务与设计（eng-designer 笔——2026-10-17）

**来源**：用户 2026-10-17 裁「必须上审批卡啊」（管理面 chat 审批卡面——现状 = **零审批卡面**，欠账实存）。父侧裁定三点在册：① 管理面工具直调、不挂核环（「全拒 / `no permission handler configured`」串属盒壳面——管理面现状口径 = 零卡面）；② 盒镜像重建/盒重造/server 包重装归他批（不进本批）；③ 按原任务书交付。

**覆盖需求条目（本批做）**
1. **写类门挡**：管理面 chat 回合环内，写类工具调用逐次弹审批卡（单件 `permission` ∥ 同回合多件聚批 `batch`）；读类零弹。判类单源 = 工具面 `readonlyOf(name,args)` 扩缝（环境族 = 核 `readonly` 旗逐字；管理族 = 逐动词只读表；MCP 件恒写类；未声明面/缺缝 ⇒ 读类——既有消费零破）。
2. **ask 回路**：`ask` 帧（既有 NDJSON 流）⇒ 页卡（核 `renderApprovalCard`/`renderBatchApprovalCard`）⇒ 应答 `POST /api/admin/agent/chats/:id/asks/:promptId`（体 `{ verdict }`；词表/校验自 `member-relay.mjs` 导入——零第二份）⇒ 结算续跑；`always` ⇒ 会话行 `auto_approve`（v25 增列）+ `PATCH …/:id { autoApprove }` 第三键（一次一件三键互斥）。
3. **拒执行形**：拒 ⇒ 不执行 + `call`/`result` 帧 + 工具行（`{ok:false, message:"用户拒绝——未执行"}`）+ `chat_call` 审计（resultCode −1）；回合续跑。
4. **兜底三径**：回合收尾（finally）∥ 中止（`requestChatAbort`）∥ 流断（res close）⇒ 未决 ask 全量拒值；无流（唤醒轮）⇒ 写类即时拒。
5. **收窄**：question/secret 两 kind 不接（无源：无 `question` 工具 ∥ 凭据 = 结构弹窗——KD-SV-136「文本非通道」）。
6. **结构件**：新档 `agent/chat-asks.mjs` ∥ 新档 `public/views-chat-cards.mjs` ∥ `run.mjs` `TRIMMED_FACES` 删 `"approval"` ∥ `chat.mjs` 触面 Δ ≤15（超出先拆——KD-SV-228）∥ v25 迁移段（`migrations.mjs` 795 ⇒ ≈804 越 800 硬限 ⇒ 先拆后落同判）。

**不在本批（显式）**
- 盒镜像重建（父侧今晚已做）∥ 盒重造（#1595）∥ server 包重装（#1600）——他批。
- `#auto-btn` 钮位面（模式位读出/写/推送三段——留隐，出列候裁）∥ 在决 ask 状态行读数段 ∥ 卡面 diff 预览 ∥ question/secret 卡。
- 成员面零触（词表/卡件全导入复用）。

**影响文件（笔后实读 → 预估；实施轮以当刻盘面实读为准）**
- 改·设计五档（本设计轮已落——笔后实读）：`agent/ADMIN-AGENT.md` **651** ∥ `webui/CHAT.md` **284** ∥ `mcp/MCP.md` **243** ∥ `gateway/API.md` **489** ∥ `store/STORE.md` **720**。
- 改·码五档（实施轮）：`agent/chat.mjs` **736** ⇒ ≤**751**（Δ≤15——超 ⇒ 先拆，KD-SV-228）∥ `agent/chat-routes.mjs` **196** ⇒ ≈**235** ∥ `agent/chat-tools.mjs` **562** ⇒ ≈**590** ∥ `agent/chat-env-tools.mjs` **328** ⇒ ≈**336** ∥ `agent/run.mjs` **33** ⇒ ≈**34**。
- 新·码两档：`agent/chat-asks.mjs` ≈**220** ∥ `public/views-chat-cards.mjs` ≈**110**。
- 迁移：`store/migrations.mjs` **795** ⇒ ≈**804**（拆案 = DDL 段常量外拆 `migrations-ddl.mjs`——纯搬迁零语义）。
- 测试：`…-admin-approval-cards.test.mjs`（拟新增）+ 结构版本断言件 24 ⇒ 25 + 列面用例六 ⇒ 七列（清单 = 机制档 §13 R91②）。

**验收标准（机检——每条回指需求）**
1. 门挡五步（判类/单件/批/拒/兜底三径）——用例 N86–N88 ∥ B82–B84 ∥ E64（机制档 §8）。
2. `always` ⇒ 行 `auto_approve`=1；PATCH 三键互斥（N88）。
3. 拒 ⇒ 零执行 + resultCode −1 + 回合续跑（B82）。
4. 兜底三径 ⇒ 拒值；无流即时拒（B83）。
5. 应答四错形 ⇒ 400 零副作用（E64）。
6. 结构：七端点计数 ∥ 零新审计型/kind ∥ 核面零改 ∥ `readonlyOf` 缺席面零破（既有测试全绿）。
7. 本批**新增行** ≤300（终检 = 0 处超 300；余 9 处 >300 全为既有超宽行的 fragment 级修改——非本批引入）。
8. 壳面卡挂/摘/重挂（N75 ∥ B72 ∥ E57——CHAT.md §4）。

**设计指针**：机制全文 = `agent/ADMIN-AGENT.md` §11.5（+ KD-SV-224–228）；契约 = `gateway/API.md` §2.8；壳面 = `webui/CHAT.md` §2.1；存储 = `store/STORE.md` §2 v25 段；R 项 = 机制档 §13 R91。
**上抛**：无待裁（父侧裁定已到——[上抛·知会] 因果纠正已采纳，本批口径 = 「零审批卡面」欠账补）。

### §2 修订轮（评审十条点修——eng-designer 笔，2026-10-17）

**来源** = 本档 §3 评审轮次 1（🔴0 ∥ 🟡5 ∥ 🔵5；VERDICT: pass）；十条全收，逐号点修（无全量重勘）。

**逐号处置**（file:line = 改后坐标）：
1. **#1** MCP.md:236（AC-54⑤ 行）：「门挡：接线前全拒 ∥ 接线后 = 卡」+「批前 = 门挡全拒腿，非失败」⇒ 删净，改写「门挡 ⇒ 审批卡」（同 MCP.md:129 口径）；MCP.md:243（R87④）：同删「批序：成功调用腿后置——审批接线落线后；批前 = 门挡全拒腿」。
2. **#2** ① ADMIN-AGENT.md:35 补 `chat-asks.mjs` §6 行（≈220——宿主 ∥ `ask` 帧构造 ∥ 结算 ∥ 置库）；② MCP.md:198/:200 补本批 Δ（+`readonlyOf` ≈ +1–3）；③ ADMIN-AGENT.md:65 审批卡行补测试档估值（`…-admin-approval-cards.test.mjs`——拟新增，≈280 行）。
3. **#3** `ask` 帧补入 §11.3（ADMIN-AGENT.md:227）⇒ :192 ∥ API.md:209 ∥ CHAT.md:111 三处「帧形全文 = §11.3」自洽；帧枚举同步 = ADMIN-AGENT.md:133（KD-SV-88）/:192 ∥ API.md:196。
4. **#4** CHAT.md:47 §2.1 ⑩ 审批卡条移入「做」列表；CHAT.md:49 不做列表处收为「问询/计划/subagent 卡 + 已落指针」。
5. **#5** §11.5 补「最近先例（对齐 ∥ 偏离）」行（ADMIN-AGENT.md:244——先例 = 成员面审批批 ∥ `member-relay.mjs` ∥ `MEMBER-AGENT.md` §3.11(2)；对齐 = 单源导入；偏离 = 兜底/收窄/载体三条）。
6. **#6** §11.5 补「公开源档核查」行（ADMIN-AGENT.md:245——外部源「无相关」显式记录；仓内核查面列明）。
7. **#7** 差异表 ①⑥ 补成员面侧坐标（ADMIN-AGENT.md:256/:258——`MEMBER-AGENT.md` §3.11(2)：在途表 = relay 内存 ∥「页面去留」卡挂 `.chat-thread` 尾）。
8. **#8** 实读收正：`run.mjs` = **33**（MCP.md:202——原 150 作废；换行计数）∥ `admin-tools.mjs` = **222**（MCP.md:200/:218 ⇒「+226 = 222 + 4」）；ADMIN-AGENT.md:621 死坐标（`run.mjs:106-110`）改自洽（任务环已随任务式退场删净——现读 33 行；chat 侧承接 = `chat.mjs:632`）；#8 扫描键附带 = admin-tools「（拟新增）」全收正（MCP.md:200 ∥ ADMIN-AGENT.md:36/:156/:275/:333）。
9. **#9** 「重挂」双义分写 = **流断重挂面**（服务端；成员面有 ∥ 管理面无）vs **卡面重挂（remount）**（页内；两面对有）——ADMIN-AGENT.md:163/:256 ∥ CHAT.md:115/:282。
10. **#10** STORE.md:24 收正：「（model-alias 批）」批属注明 + 删「结构版本保持 **10**」（与 §1「当前 = 25」不再相抵）。

**同族一并**（#4 直接后果）：CHAT.md:208 不做项机检重划（「卡族引用」⇒「问询/计划/subagent 卡引用」）。

**复扫读数（五档收正后）**：「接线前全拒」0 ∥「批前 = 门挡全拒腿」0 ∥「接线后 = 卡」0 ∥ admin-tools「（拟新增）」0。

**范围声明**：代码零触 ∥ `scripts/**` 零触 ∥ 需求档零触 ∥ `doc-check` 未跑；落笔 = 本设计五档 + 本 §2。

**未决/上抛**：① MEMBER-AGENT.md:391（「对表批 #1 落前全拒 ∥ 落线后 = 卡」+「批序：成功调用腿后置」——#1 同族旧句，该档在五档外 ⇒ 报父侧裁）；② 余「（拟新增）」家（`model-test.mjs`/`face.mjs`/`routes.mjs`/`views-mcp.mjs`/`i18n-*-mcp.mjs` 等已落盘件仍标拟新增——非本批点名，建议另清轮）；③ 帧计数句（「帧四形/五形」与现七型帧族不一致——另轮统一）。

### §2 追加点修（父裁同族收正——eng-designer 笔，2026-10-17）

**来源** = 本 §2 修订轮未决①上抛父侧（裁 = 改）+ 父侧复扫追加一处（`mcp/MCP.md:191`）+ 口径澄清（「其余不动」仅指非本族——本族见一处收一处）。

**逐号处置（file:line = 改后坐标；改前 → 改后）**
1. **#1** `agent/MEMBER-AGENT.md:391`（AC-54⑤ 行）：「（对表批 #1 落前全拒 ∥ 落线后 = 卡）」→ 删净，收正「`readonly:false` ⇒ 核门挡 ⇒ 审批卡」；末列「——批序：成功调用腿后置」→ 删净。行其余不动（改后行宽 **283** ≤300；改前 312）。「对表批 #1」= 成员面 parity 批项 #1（写类工具审批接线——`docs/batches/2026-10-15-member-face-parity.md:15`）。
2. **#2** `mcp/MCP.md:191`（KD-SV-214 行）：「审批随核门挡（审批接线前置）」→「审批随核门挡」（改后 **294** ≤300；取删括注——指针式将越 300）。
3. **#3** `mcp/MCP.md:127`（§6.3 节标题）：「（写类门挡——审批接线为前置）」→「（写类门挡 ⇒ 审批卡）」（父裁指定口径；终态行宽 23）。
4. **#4（扫出·一并）** `mcp/MCP.md:221`：「——审批接线批在飞另计」→ 删净；「实读 **334**——+13：」→ 实测收正「实读 **654**——」（当刻盘面实读；654 含取表并面 + 降级 + 审批接线——符号在场实证 `onPermissionRequest`×2 ∥ `onBatchPermissionRequest`×1 ∥ `askPermission`×3）。同族成立：审批接线已落（10-16 源码 ∥ 今晚盒镜像重建已做）。

**复扫读数（改后·本族全键）**：`MEMBER-AGENT.md`：「全拒」0 ∥「落前」0 ∥「批序」0 ∥「前置」0。`MCP.md`：「全拒」0 ∥「落前」0 ∥「批序」0 ∥「前置」0 ∥「在飞」0 ∥「落线」0 ∥「接线前」0 ∥「接线后」0。设计树全档外扫：本族零其他残留（他档命中均他域正当义——「全成或全拒」= 批量原子性 ∥「在飞」= 忙态义）。

**范围声明**：写面 = 上述两档 + 本 §2（三档）；余零触；代码零触 ∥ `scripts/**` 零触 ∥ 需求档零触 ∥ `doc-check` 未跑。`git status` 实读：17 M + 1 untracked（基线 16 M + 1 ⇒ Δ 仅 +`MEMBER-AGENT.md`）。

**未决/上抛**：需求档 `docs/server/requirements/PROJECT.md:348`（「可用性前置 = 三端对表批写类工具审批接线」）∥ `:433`（「前置 = 对表批审批接线」）——近邻同族式（接线已落 ⇒ 前置已满足）；需求档非本席笔面 ⇒ 只上抛（待主 agent 裁）。

## §3 设计评审（评审子代理）

### 轮次 1（评审子代理）

【管理面审批卡面设计评审——五档核查】🔴0 ∥ 🟡5 ∥ 🔵5

声明核查速览：裁剪句=已收正（ADMIN-AGENT.md:21-22 ∥ :31 ∥ :159④）；ask 回路四件=齐（帧=API.md:205 ∥ 卡=CHAT.md:114-116 ∥ 端点=API.md:198 ∥ 结算/兜底=§11.5 ∥ KD-SV-227）——帧形指针失真见 #3；差异表六条=齐（两条成员面侧坐标待补，见 #7）；用例表=可机检（N86–N88/B82–B84/E64 ∥ N75/B72/E57）；「D8 旧句」所指在五档+无历史面内不可识别——同族旧句逐类扫描结果见 #1/#4。

| # | 类别 | 严重度 | 问题 | 改法 |
|---|------|--------|------|------|
| 1 | 文档卫生（五档收正核查） | 🟡 | 「落前全拒」类错链未删净：MCP.md:236 仍携「接线前全拒 ∥ 接线后 = 卡」与「批前 = 门挡全拒腿，非失败」；MCP.md:243（R87④）仍携「批前 = 门挡全拒腿」。而成员面 ask 回路已按交付口径在册（CHAT.md:143「卡族四件」含应答端点；ADMIN-AGENT.md:245「两表自 `member-relay.mjs` 导入——零第二份」）⇒「接线前全拒／批前全拒腿」为已失效中间态表述，仍挂在 AC 判据行与上抛行（规范面）——声明的「删净」未达成 | 删去两处「接线前全拒／批前 = 门挡全拒腿，非失败」并改写为现行机制（门挡 ⇒ 卡）；中间态事实如需留存，移至记录面（历史/批记录） |
| 2 | 受影响档行数注记 | 🟡 | 本批受影响档未注全：① 新档 `chat-asks.mjs`（ADMIN-AGENT.md:251「新档 `chat-asks.mjs`（宿主 ∥ 帧构造 ∥ 结算 ∥ 置库）」）无 §6 行与行数估值（§6 表十档独缺；对照 CHAT.md:157 `views-chat-cards.mjs` ≈110 ∥ MCP.md:200 `admin-tools.mjs` ≈180 均有估值）；② §11.5 点名的 `mcp/face.mjs` ∥ `mcp/admin-tools.mjs`（MCP.md:198 ∥ :200 行）无本批 +`readonlyOf` 的 Δ 注记；③ §7 行（ADMIN-AGENT.md:64）点名的审批卡新测试档无行数估值 | 补 §6 新档行（≈N 行）＋ 两 MCP 档 Δ 注记 ＋ 新测试档估值——沿 `views-chat-cards.mjs`/`admin-tools.mjs` 行例 |
| 3 | 清晰度（帧形单源） | 🟡 | 「帧形全文 = §11.3」指针失真：ADMIN-AGENT.md:191 与 API.md:209「帧形全文 = `agent/ADMIN-AGENT.md` §11.3」均指 §11.3，但 §11.3（ADMIN-AGENT.md:220-227）只列 `turn`/`usage`/`end` 扩展、无 `ask` 帧；`ask` 帧形实落 API.md:205 与 §11.5。CHAT.md:111 亦以「NDJSON 帧 = `agent/ADMIN-AGENT.md` §11.3：」起头而列 `ask` | 将 `ask` 帧补入 §11.3，或把两处指针收正为「§11.3 ＋ §11.5」；ADMIN-AGENT.md:190 与 API.md:196 的帧枚举同步 |
| 4 | 文档卫生（旧挂位） | 🟡 | CHAT.md:48 的「**不做（逐项理由）**」列表仍含「⑩ **审批卡（单件 ∥ 批）**——本批落」——条目文已收正、从属列表仍是「不做」族（读者会按不做项复开） | 将该条移入「做」列表（或在不做列表处改为纯指针），与「已落面」表述同拍 |
| 5 | 最近先例 | 🟡 | §11.5 无「最近先例（对齐 ∥ 偏离）」行——同域同批段均有（ADMIN-AGENT.md:282（§12.1）／:318（§12.2）「**最近先例**（对齐 ∥ 偏离）：」同形）；差异表含偏离理由但先例坐标未成行 | 补一行最近先例（先例坐标 = 成员面审批批 ∥ `member-relay.mjs` ∥ `MEMBER-AGENT.md` §3.11(2)；对齐 = 单源导入；偏离 = 兜底/收窄/载体三条），或注明「无先例」声明 |
| 6 | 源档核查（survey） | 🔵 | 五档无「公开源档核查」行（全档未见 参考系/公开源/调研 字样）——本批有无外部源档被查、「无相关」与否均未记录 | 补一行源档核查（含「无相关」的显式记录） |
| 7 | 与成员面差异表 | 🔵 | 六条齐（ADMIN-AGENT.md:252-254）；②③⑤ 可对证（API.md:281 ∥ :284 ∥ :295），① 的「成员面 = 挂起待重挂」与 ⑥ 的「成员面 = 卡区尾」两处成员面侧无本次范围内坐标——与「逐条实证——宿主差异保留；无实证即改」口径相抵 | 为 ①⑥ 补成员面侧坐标（`agent/MEMBER-AGENT.md` 相应节）或注明实证落在该档 |
| 8 | 数值漂移 | 🔵 | 同路径两值：`thincoder-server/src/agent/run.mjs` = ADMIN-AGENT.md:31「实读 **33**」vs MCP.md:202「实读 **150**」（且 ADMIN-AGENT.md:617 引 `run.mjs:106-110` 与「33」相抵）；`mcp/admin-tools.mjs` = MCP.md:200「（拟新增）」≈**180** vs MCP.md:218「实读 **223**」 | 以当刻盘面实读收正各行（run.mjs 行 ∥ admin-tools 行） |
| 9 | 清晰度（用语双义） | 🔵 | 「重挂」双义并用：§11.5 差异①「管理面零重挂面」（KD-SV-227 理由「无重挂面 ⇒ 断即拒」）vs CHAT.md:115「重读装配 ⇒ 在决卡重挂区尾」与 §3 `remount`——一为流断后服务端重挂（管理面无）、一为页内卡重挂（管理面有） | 分写为「流断重挂面」vs「卡面重挂（remount）」，或在 CHAT.md 处注明两义关系 |
| 10 | 文档卫生（STORE §1） | 🔵 | STORE.md:24「**零结构变更**（别名落 `models_json` 元素——JSON 文本内演进；无新列/新表/新段——结构版本保持 **10**）。」与 STORE.md:10「当前 = **25**」并存——历史批注悬于现状段 | 为该行注明批属收正为历史注，或移入 §3 迁移链段 |

范围限制：项目标准档未声明、文档地图不可核（按五档内互引与 Project Guide 判归属——五档均就地修正、零新开档，主题各归其位）；需求档回笔（R91①/CHAT.md:280）不在五档内——未核。

VERDICT: pass

计数：🔴0 ∥ 🟡5（#1–#5）∥ 🔵5（#6–#10）。

## §4 用户批准（主 agent）

**用户批准（2026-10-17 00:26 / 19:14 / 19:29）**：用户逐字「必须上审批卡啊」+「昨晚那些都批准，自动跑完」+「都在，都自动跑，你要扩大」⇒ 本批批准 + 全链自动（实施 → 修复轮 → 部署 → 真机走查 → 收口）。

## §5 实施记录（eng-coder）
**状态行**：实施完成（fix 轮（起跑窗断连竞态）——17/17 pass；审计 1 轮 + 顾问 2 轮，终态 clean）



### §5 实施记录（eng-coder 笔——2026-10-17）

**结论**：按 §2 任务书 + 设计五档落码，验收 1–6 条落齐并经批内单测（15 例）自证；验收 7（新增行 ≤300 字宽）经逐行扫描为 0 处超宽；验收 8（壳面卡挂/摘/重挂）落码但只做静态核对（浏览器实走归父侧收口）。**新发现 1 处残余竞态未修**（见「未闭合」），其余审计/评审项已处置。

**一、落码清单（本批触面）**
- 新 `thincoder-server/src/agent/chat-asks.mjs`（223 行）：宿主（`preflight`/`admit`/`rejectRest`/`answer`/`settleAll`/`markStreamClosed`/`close`）∥ 帧构造（`permission`/`batch`）∥ 兜底三径结算 ∥ `setAutoApprove` ∥ 应答/结算/流断三入口。
- 改 `thincoder-server/src/agent/chat.mjs`（736 ⇒ **745**，Δ **+9** ≤15）：开宿主/关宿主、`preflight` 一调用、`admit` 一调用、拒执行形（`rejected`）、中止检查点先落拒行、`requestChatAbort` 同拍结算、`mergeToolFaces` 透传 `readonlyOf`。
- 改 `thincoder-server/src/agent/chat-routes.mjs`（196 ⇒ **216**）：ask 应答端点（第七端点）∥ `res` close ⇒ `closeChatAskStream` ∥ `PATCH` 第三键 `{ autoApprove }`（三键互斥）∥ 建/列表/详情/PATCH 四端行形携 `autoApprove`。
- 改 `thincoder-server/src/agent/chat-store.mjs`（+1 行，**表外**）：`chatView` 加 `autoApprove: row.auto_approve === 1`（四端行形同源所需；设计依据 = `gateway/API.md:193`/`:200`）。
- 改 `chat-tools.mjs`（562 ⇒ 580，`CHAT_READONLY_OPS` + `readonlyOf`）∥ `chat-env-tools.mjs`（328 ⇒ 333，核 `readonly` 旗逐字）∥ `mcp/face.mjs`（+3，恒写类）∥ `mcp/admin-tools.mjs`（222 ⇒ 227，`mcp.list` 免；**表外**，设计依据 = `ADMIN-AGENT.md:255`）。
- 改 `thincoder-server/src/agent/run.mjs`：`TRIMMED_FACES` 删 `"approval"`（33 行不变）。
- 改 `thincoder-server/src/store/migrations.mjs`（795 ⇒ **799** ≤800）：v25 段 = `ALTER TABLE agent_chats ADD COLUMN auto_approve INTEGER NOT NULL DEFAULT 0;`（与 `STORE.md:654` 逐字）。
- 新 `thincoder-server/public/views-chat-cards.mjs`（76 行）：两 kind 核卡适配 + 应答单点（`verdictOfEmit` 自成员面导入）+ `append`/`clear`/`remount`。
- 改 `thincoder-server/public/views-chat.mjs`（440 ⇒ **459**，设计估 ≈465）：ask 帧分发、`end`/切会话清卡、切会话 cancel 读流（服务端同拍拒值）、重读后 `remount`、应答回焦输入区（**表外**，设计依据 = `CHAT.md:156`/`:114`）。
- 新 `thincoder-server/test/2026-10-17-admin-approval-cards.test.mjs`（15 例）。

**二、关键取舍（决策透明）**
1. **migrations 越限处置** = 取设计给的第二案「v25 段压缩 ≤5 行」（实 +4 行 ⇒ 799），未外拆 `migrations-ddl.mjs`；理由 = 只差 1 行，纯搬迁的收益不足，且拆档会动既有导出引用面。
2. **`rejectRest`（中止径拒行）** 走 `chat-asks.mjs` 自持写面（`appendMessage` + 注入的 `auditCall`/`textNames`），chat.mjs 只多一次一行的调用——保 Δ≤15 与审计形单源。
3. **流断语义 = 状态而非一次性事件**：`closeChatAskStream` 把宿主降为「无问面」（后续写类即时拒），再结算未决（修审计 F2）。
4. **`always` 语义** = 会话级免问（`auto_approve`=1 + 当回合即时免问），非「仅同工具」——与设计 §11.5/差异表③ 一致；已在交付表按「与 §1 判据措辞的宽窄差」如实披露。

**三、验证读数（本批定向）**
- `cd thincoder-server && node --test --test-timeout=20000 test/2026-10-17-admin-approval-cards.test.mjs` ⇒ **tests 15 ∥ pass 15 ∥ fail 0**（覆盖 N86–N88 ∥ B82–B84 ∥ E64 ∥ v25 结构 ∥ 七端点 ∥ `readonlyOf` 四缝 ∥ 合并面真装配）。
- `node --check` 逐档：chat-asks / chat / chat-routes / chat-store / chat-tools / chat-env-tools / run / mcp-face / mcp-admin-tools / migrations / views-chat / views-chat-cards 全 **OK**。
- 行数实读：chat.mjs 745（Δ9）∥ chat-asks 223 ∥ chat-routes 216 ∥ chat-tools 580 ∥ chat-env-tools 333 ∥ migrations 799 ∥ views-chat 459 ∥ views-chat-cards 76。
- 宽度终检（>300 字）：本批 13 个触面档逐行扫描 ⇒ 仅 `chat-tools.mjs:552`（307 字，**既有行**，非本批引入）。
- `git status` 本批触面 = 10 M + 3 untracked（两新码档 + 新测试档）；两临时读数档已删。核面（`thincoder-core/**`）本批零触。
- 表外件及理由：`chat-store.mjs`（行形键）∥ `mcp/face.mjs` ∥ `mcp/admin-tools.mjs`（设计 §11.5 结构件点名）∥ `public/views-chat.mjs`（设计 `CHAT.md` 文件表点名）——均报而不隐。

**四、审计与代码评审轮次**
- 内部 explore 偏差审计（1 轮）：4 条 → **F1（中止径缺工具行/审计）已修并加断言**／**F2（断线后再弹卡吊死）已修并加回归例**／F3（表外件）= 本节披露处置／F4（`chat-store` §6 行缺 Δ 注记）= 设计档层，未改，上抛。
- 内部 advisor 代码评审（1 轮，VERDICT: changes-required）：2 条须修/建议 + 7 条 🔵 → **未及处置**（轮次预算耗尽）。其中第 1 条为残余竞态，见下。

**五、未闭合（如实，交父侧裁）**
1. **[上抛·待裁] 流断竞态残余**：`res` close 在「宿主尚未登记」窗内（宿主建于 `chat.mjs:591`，之前有 `deliverPending`/`buildChatToolFace`〔含 MCP 建连〕/`buildChatExit`/`compactTurnHistory` 等 await）会丢事件，此后首个写类调用会等一张无人应答的卡 ⇒ 会话挂到手动 `/abort`。修法（顾问建议）：模块级 `closedStreams` 集合在 `closeChatAskStream` 无条件落集、建宿主时读集；或宿主登记提前到首个 await 之前。**未实施、未验证**。
2. **[上抛·知会] 模块环**：`chat.mjs → chat-asks.mjs → member-relay.mjs → chat.mjs`（新引入）；建议词表/体校验下沉叶子档（`ask-vocab.mjs`）。未改。
3. **[上抛·知会] 设计档随正项无法随**：`ADMIN-AGENT.md:35`/`CHAT.md:157`「（拟新增）」；`STORE.md:701`「列面七列」与实读 **8 列**不符；`CHAT.md:281` 点名的 `2026-10-11-admin-agent-chat.test.mjs` 在盘面不存在（`test/` 仅本批件 + `rc-resolve.mjs`）——故「结构版本断言 24⇒25 ∥ 列面用例六⇒七」两件**无可改载体**，未随正；设计档非本角色笔，未编辑。
4. **[上抛·知会] 浏览器实走未做**（设计归父侧收口）：卡弹/批/always/拒四径只到单测 + 静态核对。

### §5 实施记录（fix 轮——起跑窗断连竞态；eng-coder 笔，2026-10-17）

**范围**：任务书 round = fix——只修「起跑窗（宿主未登记）断流 ⇒ 首个写类调用等无人应答卡」一条 + 回归断言；未重开探索、未重构、未动其他面。上轮 §5「未闭合①（流断竞态残余——未实施、未验证）」本轮处置 = **已修并验证**。

**一、修法（选支 = 模块级 `closedStreams`；为何选它 + 清理时机）**
- 落法（`chat-asks.mjs`）：`closedStreams: Map<chatId, 流 token>`（token = 本请求 `emit`）。`closeChatAskStream(chatId, { message, stream })`：宿主在册 ⇒ `markStreamClosed`（原径）；宿主不在册（起跑窗）⇒ 按 token 落集。`createChatAskHost({ …, stream })`：建宿主时 `get` + `delete`（消费即删），本回合同流 ⇒ `streamAlive=false` ⇒ `preflight` 写类即时拒。路由侧 = `chat-routes.mjs` 把 `emit` 定义上移，close 监听改 `closeChatAskStream(row.id, { stream: emit })`；`chat.mjs` 建宿主传 `stream: emit`（一参）。
- **为何选它**：另一支「宿主提前登记」需把工具面装配（含 MCP 建连）挪到建宿主之前，`tools`/`textNames` 依赖装配顺序 ⇒ 改动面更大且更难判等价；`closedStreams` 不动装配顺序、只补「事件丢失」一面。可测性 = 用 `deps.mcpConnectImpl` 闸门精确撑开「宿主未登记」窗（普通注入延迟即可复现）。
- **集合清理时机（防泄漏）**：唯一删除点 = 同会话下一次建宿主（`closedStreams.delete(id)`，每会话至多一枚）；落集侧同步收窄为「仅异常流断」——路由判 `res.writableEnded !== true`（正常收尾不登记 ⇒ 不按回合累积、不误伤下一回合；异流残留因 token 不同不生效）。跨库 chatId 复用同由 token 同一性挡住。
- **评审补修（同一条判定口径）**：弹卡口加流断守卫——`askPermission` ∥ `askBatch` 见 `streamAlive !== true` 即返回 `{ verdict:"reject", message: ASK_NO_STREAM_MESSAGE }`（零卡即时拒）。起因 = 顾问评审发现 `admit` 的 `oneByOne` 逐件径在「批卡答复后、余件弹卡前」断流仍会造无人应答的卡（挂到 `/abort`），正落在「流断后任意时刻零等待」口径内。

**二、新用例断言点（原 15 ⇒ 17；红→绿均已实跑）**
- `B83①补二 起跑窗（宿主未登记）流断 ⇒ 随后写类零卡即时拒、回合照跑完`（test:363）逐条：① `until(windowEntered)` 后 `model.calls.length === 4`（模型未调用 ⇒ 宿主未登记）；② 断流 + 100ms 后仍 `=== 4`（仍在窗内）；③ 放闸后 `until(status idle)`（2s 上限 = 不挂死判据）；④ `model.calls.length === 6`（回合跑完）；⑤ 第 3 回合工具行摘要 = `ASK_NO_STREAM_MESSAGE`（零卡）；⑥ 审计 resultCode −1；⑦ 清理面：前两正常回合计两卡、`answerChatAsk === true`、两行 `data.ok === true`（不污染下一回合）。
- `B83①补三 批卡 oneByOne 后断流 ⇒ 余件零卡即时拒、回合照跑完`（test:426）逐条：① 批卡 `oneByOne`；② 首件 `once` + 执行闸内 `invoked.length === 1`；③ 首件执行中断流 + 放闸；④ `until(idle)`（不挂死）；⑤ `invoked === ["bash"]`（余件零执行）；⑥ 余件工具行 = `ASK_NO_STREAM_MESSAGE`；⑦ 审计 `[0, −1]`。
- **红证**：撤 `closedStreams.set` ⇒ 补二 `等待超时：回合收尾`（6.5s 挂死）；撤弹卡口守卫 ⇒ 补三 `等待超时：回合收尾`（6.6s 挂死）。恢复后两例均绿 ⇒ 用例区分修复前后，非空跑。

**三、读数**
- `cd thincoder-server && node --test --test-timeout=20000 test/2026-10-17-admin-approval-cards.test.mjs` ⇒ tests **17** ∥ pass **17** ∥ fail 0。
- `node --check`：`chat-asks.mjs` ∥ `chat-routes.mjs` ∥ `chat.mjs` ∥ 测试档 全 exit 0。
- 行数（node 实读）：`chat-asks.mjs` **243** ∥ `chat.mjs` **746** ∥ `chat-routes.mjs` **223** ∥ 测试档 **670**——两硬限档均 ≤800。
- 触面：`chat-asks.mjs`（untracked 新档）+ `chat-routes.mjs`（close 判 `writableEnded` + token + 注释）+ `chat.mjs`（`stream: emit` 一参）+ 本测试档；判类单源 / PATCH / v25 / 页面面 / 设计档 均零触。两处临时读数脚本（debug-window.mjs）已删。

**四、审计与评审轮次**
- 内部 explore 偏差审计（1 轮）：无 🔴；findings = §5 未落（本轮即落）+ 4 条 🔵（条目留存上界 ∥ 在册宿主径无 token 校验 ∥ 图片请求 close 监听窗口 ∥ 100ms 固定等待）。
- 内部 advisor 代码评审（2 轮）：R1 = `changes-required`（🔴1 = `admit` 逐件径可造无人应答卡；🟡2 = 在册宿主径无 token 校验 / 正常收尾落集；🟡1 = 测试清理面断言不足；余 🔵）⇒ 已修：弹卡口双守卫 + 路由 `writableEnded` 门 + 清理面断言强化 + 补三用例；R2 = **pass**（上轮各项 Fixed/Accepted，无新 🔴）。
- 终态：**clean**（无未处置须修项；余为文档层 report-only 与 🔵 建议）。

**五、上抛**
- [上抛·知会] 图片请求的 close 窗口（既有面，本轮未动）：`res.on("close")` 在 `await assertChatImages` 之后才挂 ⇒ 携图请求首次装载核件期间断流会丢事件（同族、窗更窄）。建议另轮（监听前移或建宿主前判 `res.destroyed`）。
- [上抛·知会] 文档层滞后（另账）：本档 §5 上轮行仍写「未实施、未验证」/15 例；`ADMIN-AGENT.md:35`「（拟新增）≈220」（实读 243）、`:252` 未载起跑窗 token 机制——设计/记录档非本角色笔，报而不改。
- [上抛·知会] 测试档 670 行越 500 软线（设计估 ≈280）；两处 100ms 固定等待属 R4 建议项（顾问 🔵，未改——改断言同步点归另轮）。

## §6 验证与收口（父代理）

**验证与收口（父侧 · 2026-10-17 20:2x）**

**验证读数（父侧亲跑/亲走）**：

- **定向单测（修复轮后）**：`cd thincoder-server && node --test --test-timeout=20000 test/2026-10-17-admin-approval-cards.test.mjs` ⇒ **tests 17 · pass 17 · fail 0**（含新增两例：起跑窗断流 ∥ `oneByOne` 余件断流）。
- **红→绿实证（采信实施报告）**：撤 `closedStreams.set` ⇒ 起跑窗例「等待超时：回合收尾」（6.5s 挂死）；撤弹卡口守卫 ⇒ `oneByOne` 例同形挂死（6.6s）——恢复后两例绿 ⇒ 非空跑。
- **部署**：提交 `5b486188` 推 origin ⇒ server pull → 镜像重建 → compose 重建 ⇒ `ready`（routes 142）· `/healthz` 200 · 盒侧 `/api/box/ping` 204 ✓；v25 迁移（`auto_approve`）由单测结构例与真机写卡共同证成。
- **浏览器真机走查（需求 8，父侧亲走 · headless Chromium @ `10.0.0.5:8787`）**：
  1. 管理面 `#/admin/chat` 发「用 bash 工具执行：echo approval-card-ok」；
  2. **审批卡弹出**：卡面「ThinCoder 想要执行 bash」+ 参数 `{"command":"echo approval-card-ok"}` + 三钮（批准 bash ∥ 全部批准 ∥ 拒绝 bash）✓；
  3. 点「批准 bash」⇒ 工具执行 ⇒ 回读 `bash: (exit code 0)` · `[stdout]: approval-card-ok` ✓；
  4. **回合续跑**至第 2 轮并给出自然语言结论 ✓ —— 「无人值守 ⇒ 全拒」的旧症结解除。

**上抛处置（`#84` 三条）**：

| # | 项 | 处置 |
|---|---|---|
| 1 | 携图请求 `res.on("close")` 挂载晚于 `await assertChatImages` ⇒ 同族窄窗 | **挂账 `#1617`**（同族、窗更窄；另轮处置） |
| 2 | 文档层滞后（批档 §5 旧行写「未实施」；`ADMIN-AGENT.md:35` 写 ≈220 实读 243；`:252` 未载起跑窗 token） | **并入 `#1614`** ✓（设计档漂移族，与其它三处同拍收正） |
| 3 | 测试档 670 行越 500 软线 | **接受·不改** ✓（批内档收口随批删，零留存；不是常驻件） |

**收口**：代码面 = 完成（17/17 · 真机走查绿 · 部署在跑）；批档冻结；台账 `#1596` 核销；设计槽 `8a1ebc59` 收口后 consume。
