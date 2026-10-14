# 2026-10-13 · server-mcp
> 六段 append-only，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 编制：主 agent · 2026-10-13 · 来源 = 用户 2026-10-13 23:0x 原话「应该能够支持mcp，这样管理会话能够实现web搜索等能力，如果也给成员侧会话用就更好。」+ 23:10「开」——MCP 支持开批（需求档 §5 待讨论行 ∥ 台账 #1379）；第一块石头 = 管理会话解裁 + 最小配置面（成员侧搭 #1215）。
> 台账 = #1379（server · 归批）。前情 = 无（独立批）。
## §1 讨论（主 agent）
**状态行**：已收口 2026-10-14
<§1 模板占位：本批条目 / 关键判据 / 授权口径>

**2026-10-13 · server 会话面 MCP（管理面先行——第一块石头）**

- **来源**：用户 2026-10-13 23:0x 原话「应该能够支持mcp，这样管理会话能够实现web搜索等能力，如果也给成员侧会话用就更好。」+ 23:10「开」。台账 **#1379**（2026-10-13 提出——当日立案）。
- **现状锚**：服务器 agent 裁掉 `mcp` 面（`thincoder-server/src/agent/run.mjs:22` TRIMMED_FACES 含 `mcp`）；核侧 `thincoder-core/mcp/` 模块现成（CLI 面已用——三传输 + 工具动态展开 + 探活）；管理面 agent 架构 = `agent/ADMIN-AGENT.md`。
- **范围（第一块石头——父侧派单口径）**：① 解裁（管理会话接核 MCP 客户端）∥ ② 最小配置面（MCP 服务器清单可管可探活）∥ ③ 核件复用零第二实现 ∥ ④ 安全/审批/审计按现状裁决并明写 ∥ ⑤ 成员侧预留（随 #1215——不在本刀）。
- **边界**：不做逐用户 MCP 配置 ∥ 不做 MCP 市场/目录 ∥ 不造新协议件 ∥ 成员侧本刀不做。
- **授权**：23:10「开」= 立案 + 设计派发授权；**评审点火 = 用户**（本批未见「自动跑」授权——父侧核读通过后报用户点火）。
- **依赖/关联**：与 #1373（执行面重做——实施中）零文件冲突（mcp 域 + 管理面）；成员侧会话 = #1215（修订中——预留接口随其时落）。
- **需求档回笔**（主 agent 笔）：功能点 54 ∥ AC-54 已入册（2026-10-13）；AC-12 管理 10 ⇒ 11 ∥ AC-28 审计型 v20/十五 ⇒ v24/十七。

- **2026-10-14 00:07 · 用户授权（自动跑）**：用户「其他自动跑」⇒ 本批**全链自动**（设计评审点火 ∥ §4 代签 ∥ 修正/实施派发 ∥ 收口核销提交双推）+ **自缚三条**（代签仅三条件齐备——评审 pass 0🔴 ∧ 修正轮已落地并逐条核验 ∧ token 已签发 ∥ 新范围/口径裁决停下只摆一条 ∥ 破坏性/不可逆先停）。设计评审已点火（2026-10-14 00:08——两新档：`mcp/MCP.md` ∥ `webui/MCP.md`）。

- **2026-10-14 00:1x · 设计评审轮 1 裁决（评审 #112）**：发现表 = §3（🔴×1 ∥ 🟡×3 ∥ 🔵×6 + 范围外注记两条）；VERDICT = changes-required（令牌未发）。父侧裁决 = **十行全采纳**（无驳回/无保留）——关键 🔴（`accounts/audit.mjs` 未入受影响表）经父侧独立核读属实（`audit.mjs:18` 闭集 ∥ `:46` 硬校验）。修正轮 = eng-designer #115（round=fix——按号点修；两条注记：① 板档 AC-54 对位收一 ② `ADMIN-AGENT.md:89` 读数刷新随拍）；修正落地并父侧逐条核验后复评（轮 2）。

## §2 批次任务与设计（eng-designer）
**状态行**：设计完成
<§2 模板占位：本批条目（覆盖） / 设计档落点 / 机制设计 / 受影响文件与测试覆盖 / 验收对照 / 关键决策 / 上抛项>

**批任务与设计（server-mcp 批——设计轮 · eng-designer · 2026-10-13）**

注：本 §2 承 spawn 简报（批档 §1 现为骨架占位——主 agent 笔；台账 #1379）。

**本批条目**（覆盖五问逐问出案——各带被否候选）：

| # | 要求项 | 设计落点 | 机检判据 |
|---|---|---|---|
| 1 | ① 解裁形——MCP 面在管理会话可用 | `mcp/MCP.md` §2（KD-SV-196） | 源扫断言（`TRIMMED_FACES` 零 `mcp` ∥ chat 面装配含 MCP 面）+ §8 N1 |
| 2 | ② 配置面——清单可管可探活 | `mcp/MCP.md` §3（KD-SV-197/198）∥ `store/STORE.md` §2 v24 ∥ `gateway/API.md` §2.13 ∥ `webui/MCP.md` | 迁移判据（STORE §3 v24）∥ 端点用例（N2/N3/E1）∥ 控制台判据（`webui/MCP.md` §4） |
| 3 | ③ 核件复用——零第二实现 | `mcp/MCP.md` §4（KD-SV-199）∥ `agent/ADMIN-AGENT.md` §17.2（件 +1） | 引件表 + §8 用例（核件注入假件） |
| 4 | ④ 安全/审批/审计 | `mcp/MCP.md` §5（KD-SV-200） | `mcp_event` 三 kind ∥ 调用面 = `chat_call` 零扩 ∥ 零秘密扫描 |
| 5 | ⑤ 成员侧预留（本刀不做） | `mcp/MCP.md` §6（KD-SV-201） | 预留三条在册 + 边界明写 |

**设计档落点**（新档——最近先例行逐条在内）：`docs/server/design/mcp/MCP.md`（**新域 mcp**——最近先例 = CLI/VSC/桌面 MCP 面 + 服务器 agent 核件复用形，对齐/偏离逐条）∥ `docs/server/design/webui/MCP.md`（面档 13——KD-SV-202 控制台面形）。

**受影响文件**（实读 + 增量；全表 = `mcp/MCP.md` §10）：新增三服务端档 ≈430（`src/mcp/{store,face,routes}.mjs`）∥ `views-mcp.mjs` ≈320 ∥ i18n 两部件 ≈150 ∥ 单元测试档 ≈420（不入门）；改动 `chat.mjs` 692 ⇒ ≈704 ∥ `run.mjs` 150 ±0 ∥ `migrations.mjs` ≈480 ⇒ ≈500（拆案未先行 ⇒ 落 `db.mjs`）∥ `bin/thincoder-server.mjs` 192 ⇒ ≈195 ∥ `nav/app/i18n 门面` 小增。>500 软线复核全在案（`views-mcp.mjs` 越 300 先例线——拆档预案在册；`chat.mjs` 720 拆档线未越）。

**关键决策**：KD-SV-196–201（`mcp/MCP.md` §9）∥ KD-SV-202（`webui/MCP.md` §1）——逐条带被否候选；号段避让在途批（sandbox-exec-rebuild 至 195）。

**同步随动**（本设计轮已落笔）：`store/STORE.md`（§1/§2 v24/§3/§4）∥ `gateway/API.md`（§1 族表行 + §2.13）∥ `accounts/ACCOUNTS.md` §2.1（`mcp_event`——十七型）∥ `agent/ADMIN-AGENT.md`（§5/§6/§13 R86/§17.2）∥ `ops/OPS.md` §5.11 ∥ `webui/WEBUI.md`（§1/§2/§5/§6）∥ `webui/I18N.md`（§2.1/§3/§4）∥ 板档 `PROJECT.md`（§2.1/§3/§4/§6/§7/§9）。

**上抛/余项**（全文 = `mcp/MCP.md` §12 R86）：① 需求档回笔建议（主 agent 笔）：**功能点 54 ∥ AC-54 拟入册** ∥ AC-12 管理 10 ⇒ 11 ∥ AC-28 审计型十六 ⇒ 十七；② 随正件（档目/清单断言件族 ≈18 件 + nav 计数件——实施轮同拍）；③ 披露九条（stdio 本机命令 ∥ 远端出网新目的地 ∥ 第三方内容面 ∥ `command`/`args` 明文可含秘密 ∥ 工具数无上限 ∥ 冷却进程内 ∥ `kill -9` 残留 ∥ 探活不落审计）；④ **待裁点**：机制级确认门（审批）= 本刀不加（无人值守口径）——如需另裁；⑤ 部署收尾（父侧）：真实 MCP 服务器实走。

**机械检查**：`node scripts/doc-check.mjs --root D:\teamcode\thincoder`——读数随交付报告（同轮）。

**产品码零触（设计轮）。**

**设计评审轮 1 修正（fix 轮——2026-10-14 · eng-designer；承批档 §3 十发现 + 两注记 · 评审 #112 · 十行全采纳）**

| # | 发现 | 处置 → 改动 file:line |
|---|---|---|
| 1 🔴 | 受影响全表缺 `accounts/audit.mjs` | `mcp/MCP.md` §10 增行（`:154`——实读 121 ⇒ ≈122；`AUDIT_TYPES` += `mcp_event`；头注/计数注释同拍（十六 ⇒ 十七））+ 小计随正（`:166`） |
| 2 🟡 | 读数三处与盘面不符 | `mcp/MCP.md` §10：`migrations.mjs` 行改「已落盘——实读 711（as-of 2026-10-14）⇒ ≈731」+「备（拆案未先行）」支删 + `db.mjs` 37（`:152`）∥ `bin` 244 ⇒ ≈247（`:153`）∥ >500 软线段补 migrations 立场（越线 ∥ 距 800 硬限余 ≈69——`:167`） |
| 3 🟡 | shell 部件两档未入账 | `mcp/MCP.md` §10 增 `i18n-{zh,en}-shell.mjs` 行（`:158`/`:159`——80 ∥ 78 ⇒ +1）∥ `webui/MCP.md` §3 增同两行（`:53`/`:54`）+ 行合计 ≈470 ⇒ ≈472（`:57`） |
| 4 🟡 | 探活体口径相抵（行内 `{id}` 按字面应 400） | `mcp/MCP.md` §3.2 探活行收正（`:65`——`transport?`；`id` 在场 ⇒ 缺席字段（含非秘密）一律回落库内行）+ `gateway/API.md` §2.13 同步（`:323`）——行内 `{id}` 径可 200 |
| 5 🔵 | 审计面三档未随正 | 父裁随正：`mcp/MCP.md` §10 增三行（`:160`–`:162`——`views-audit.mjs` 251 ⇒ ≈252 ∥ `i18n-{zh,en}-system.mjs` 各 220 ⇒ ≈221——`audit.type.mcp_event` 键） |
| 6 🔵 | N2 缺 DELETE 支 | `mcp/MCP.md` §8 N2 流程末补「⇒ DELETE ⇒ GET」（`:122`——`server_remove` 随落） |
| 7 🔵 | 探活/关闭替身缝未指名 | `mcp/MCP.md` §2.2 补 `deps.mcpProbeImpl ?? null` ∥ `deps.mcpCloseImpl ?? null`（`:42`——缺省 null = 生产零变） |
| 8 🔵 | 坐标错指 | `webui/MCP.md` §5 改指 §2.2 ∥ §3.3（`:68`） |
| 9 🔵 | 需求锚陈化 + 状态并存 | `mcp/MCP.md` §1 锚 `:523` ⇒ `:540`（`:4`）+「拟入册」⇒ **已入册（2026-10-13）**（`:5`——证据 = 需求档 `:436`/`:759` + 批档 §1「已入册」）+ §11 同拍（`:173`）+ R86① 翻「已办」（`:179`）；同族扫面 = `webui/MCP.md:4` ∥ `design/PROJECT.md:105`/`:183`/`:224` |
| 注① | 板档 :224 vs §11 对位 | 定 = **§11 补运维面**「`ops/OPS.md` §5.11」（`mcp/MCP.md:173`；该节 = 本批设计轮已落同步面）；板档行不动（`design/PROJECT.md:224` 只随状态） |
| 注② | `ADMIN-AGENT.md` 读数陈化 | `agent/ADMIN-AGENT.md` §6 本批块 `bin` 刷新（`:59`——192 ⇒ ≈195 ⇒ **244（as-of 2026-10-14）⇒ ≈247**——增量 ±0）；评审坐标 `:89` 与内容不符——实位 = `:59`（逐字对位） |

**§10 重算**：全表重算后 **小计 ≈ +946**（新增 ≈900 ∥ 存量改 ≈+46 = 逐行和；原 ≈941 与逐行和差 1——本笔收正）；本域行账 18 行。**机检**：`node scripts/doc-check.mjs --root D:\teamcode\thincoder`——本批域零新增红（域属红仅「拟新增/符号·宽」报告面类——与设计轮前态同款；全仓 FAIL = 27 悬空 + 2 行宽——存量，非本批）。**零新语义；零代码/测试；产品码零触（设计轮）。** 各档变更记录已落（`mcp/MCP.md` ∥ `webui/MCP.md` ∥ `gateway/API.md` ∥ `agent/ADMIN-AGENT.md` ∥ `design/PROJECT.md`）。

**设计评审轮 2 修正（fix 轮——2026-10-14 · eng-designer；承批档 §3 轮次 2 · 评审 #117——VERDICT = pass；🟡×1 ∥ 🔵×3 四条建议全落）**

| # | 发现 | 处置 → 改动 file:line |
|---|---|---|
| 1 🟡 | MCP 面「服务器 × 服务器」重名未入防御面（核件去重集逐 `buildTools` 调用新建——只护单 server 内；`sanitizeToolName` 归一非字母数字 ⇒ 同形可撞） | `mcp/MCP.md` §2.2 命名面扩面（`:38–:39`——合并前扫描面 = 静态两面（管理 ∥ 环境）∪ **MCP 面既往件名集**；相撞 ⇒ 该件（后到者）不挂 + 日志一条——零静默、先者留存；续行 = 何故扩面（核件原理 + 同形两源））∥ §8 B2 补相撞用例（`:128`——两服务器 sanitize 同形（`web.search` ∥ `web search`）；裁 = 并入 B2 不新行） |
| 2 🔵 | §11 未列 AC-54 ⑤∥⑥ 对位 | `mcp/MCP.md` §11（`:175`——补「成员侧预留（⑤）= §6 ∥ 待裁点（⑥）= §12 R86④」两指针；AC-54 ①–⑥ 逐项对齐；判据语义零改） |
| 3 🔵 | `POST` 体 `enabled?` 缺省值两档未写 | `mcp/MCP.md` §3.2（`:63`）∥ `gateway/API.md` §2.13（`:320`）明写「`enabled` 缺省 = 启用」（v24 DDL `DEFAULT 1`（`store/STORE.md:641`）∥ 控制台缺省勾（`webui/MCP.md:31`）同拍）；`webui/MCP.md` 内容零改（依据句原位——三档口径已同） |
| 4 🔵 | 三处读数 spot-check 差 1（注记） | 父侧口径澄清 = **split 计行**（`migrations.mjs` 711 ∥ `bin` 244 ∥ `audit.mjs` 121 现盘复读逐值一致）⇒ 数值零改；`mcp/MCP.md` §10 加复核注记（`:169`——「复核未动（as-of 2026-10-14）」；内容行读数逐值 −1 = 既有口径差） |

**机检**：`node scripts/doc-check.mjs --root D:\teamcode\thincoder`——本批域零新增红（域属红仅「拟新增/符号·宽」报告面类——与设计轮前态同款）。全仓 = 悬空 28 ∥ 行宽 2（存量）：其中 **+1 悬空 = 他批并发写动**（`agent/ADMIN-AGENT.md`（model-test-tool 批设计块）新增 `agent/chat.mjs`（`:62`）——非本批笔、本批未触）；本批曾引入 1 条行宽超线（`mcp/MCP.md:38`）——同轮拆两行收正（现 0）。§10 三读数未动 ⇒ 小计 ≈+946 未触（逐行和 = 新增 ≈900 ∥ 存量改 ≈+46）。**零新语义（评审发现直接导出项——🟡 扩面 = 评审建议原文实施；⑤⑥ 指针不改判据语义）；产品码零触；需求档零触（笔 = 父侧）；他批文档零触。** 各档变更记录已落（`mcp/MCP.md` ∥ `gateway/API.md` 各 +1 行）。

## §3 设计评审（评审子代理）

### 轮次 1（评审子代理）

**评审对象**：`docs/server/design/mcp/MCP.md` ∥ `docs/server/design/webui/MCP.md`（设计评审——server-mcp 批）。核查方式 = 两档全文通读 + 判据 8 行账定点抽查（核读被标注档与同批旁证档）。

| # | Category | Severity | Issue | Suggestion |
|---|---|---|---|---|
| 1 | Affected-file annotations（判据 8） | 🔴 | 受影响全表缺 `thincoder-server/src/accounts/audit.mjs`——`mcp_event` 落库必经该档：`audit.mjs:18` `export const AUDIT_TYPES = Object.freeze([`（闭集十五型）∥ `audit.mjs:46` `if (!AUDIT_TYPES.includes(type)) throw new Error(`（硬校验）；本档 §5 承诺「写入点 = `thincoder-server/src/mcp/routes.mjs`（拟新增）三处（成事才落）」（`mcp/MCP.md:95`），同批 `accounts/ACCOUNTS.md` 亦记「写入口 = `thincoder-server/src/accounts/audit.mjs`」；改型先例 = team-ledger 批把该档列入受影响表（`docs/batches/2026-10-13-team-ledger.md:59`「`AUDIT_TYPES` += `ledger_event`（十四 ⇒ 十五型）」）。按 §10 实施 ⇒ 三写入点必抛「审计类型非法」（配置变更审计落空） | §10 增行：`thincoder-server/src/accounts/audit.mjs`（实读 121 ⇒ ≈122——`AUDIT_TYPES` += `mcp_event`；头注/计数注释同拍（十六 ⇒ 十七）），§10 小计随正（≈+941 ⇒ ≈+942） |
| 2 | Affected-file annotations（判据 8） | 🟡 | 行账抽查三处与盘面不符：`mcp/MCP.md:152` 记 `src/store/db.mjs`「（实读 688）」——盘面 **37**（拆案已落：`db.mjs:5`「迁移链已外提 `src/store/migrations.mjs`」）；同行 `migrations.mjs` 记「拟新增」「≈480 ⇒ ≈500」——盘面已落盘、**实读 711**（同批 `store/STORE.md:697` 已记「本档实读 37」与「实读 **711**」）；`mcp/MCP.md:153` 记 bin「实读 **192**」——盘面 **244**。（抽查相符 = `run.mjs` 150 ∥ `nav.mjs` 106 ∥ `app.mjs` 206 ∥ i18n 门面 16 ∥ `chat.mjs` 692≈693） | 按盘面刷新并注 as-of：db.mjs 实读 37（删「备（拆案未先行）」支——不可再达）；migrations.mjs 改「已落盘——实读 711 ⇒ ≈731（v24 +≈20）」；bin 改 244 ⇒ ≈247；「>500 软线复核」段补 migrations.mjs 立场（>500 软线越线；距 800 硬限余 ≈70） |
| 3 | Affected-file annotations（判据 8） | 🟡 | `nav.page.admin.mcp` 宿主两档未入行账：`webui/MCP.md:54` 明记「`nav.page.admin.mcp` 键入 **shell 部件**（导航族）」，而 `webui/MCP.md:50-52` ∥ `mcp/MCP.md:154-156` 只列新 mcp 部件与门面——`i18n-zh-shell.mjs`（盘面 80）∥ `i18n-en-shell.mjs`（盘面 78）零行（nav 键区现 = `i18n-zh-shell.mjs:47-57` ∥ `i18n-en-shell.mjs:49-59`） | 两表各处增行：`i18n-{zh,en}-shell.mjs`（80 ∥ 78 ⇒ ≈+1——`nav.page.admin.mcp` 键）；`webui/MCP.md:55`「面文件行合计 ≈470」随正 |
| 4 | Clarity | 🟡 | 探活体契约与调用面不一致：`mcp/MCP.md:65` 体列 `transport`（无 `?`）+ 回落句仅写敏感字段（"`id` 在场 ∧ 敏感字段缺席 ⇒ **回落库内行该字段**（编辑窗/行内探活）"）；而通话面三处体 = `{id}`：`webui/MCP.md:26`「探测 = `POST /api/admin/mcp/probe` 体 `{ id }`」∥ `webui/MCP.md:10`「行内「探活」= 体 `{id}`」∥ `mcp/MCP.md:123`「探活两径：行内（体 `{id}`）∥ 新建草稿（体 = 全量）」。按 §3.2 字面（transport 必填、回落仅敏感字段）行内径应 400，与 N3 期望（ok:true）相抵 | §3.2 补口径：`id` 在场 ⇒ 缺席字段（含非秘密：transport/command/url…）一律回落库内行；`transport` 标 `?`（仅无 `id` 的草稿态必填）；同口径同步 `gateway/API.md` §2.13 探活行（契约面），使行内径 `{id}` 可 200 |
| 5 | Affected-file annotations（判据 8） | 🔵 | 控制台审计面三档未随正：`public/views-audit.mjs`（盘面 251——类型枚举十五型，`:16-32`）∥ `public/i18n-zh-system.mjs:177` ∥ `i18n-en-system.mjs:177`（`audit.type.*` 键区）——沿「全型收编」先例（header 记 team-ledger 批 + `ledger_event`）应 + `mcp_event` + `audit.type.mcp_event` 键；页面有原值兜底（`views-audit.mjs:88-92`）⇒ 非阻塞 | 三档随正（+1 行/档：类型枚举 + 两语键）；若不随正，在 §12 R86 披露「审计页筛选/文案暂缺 mcp_event（原值兜底）」 |
| 6 | Acceptance criteria | 🔵 | N2 断言「`mcp_event` 三 kind 行逐值」（`mcp/MCP.md:122`），但流程（POST ⇒ GET ⇒ PATCH ⇒ GET）缺 DELETE 支——`server_remove` 无出口 | N2 流程末补「⇒ DELETE ⇒ GET」（或注明 remove kind 的覆盖归其他用例） |
| 7 | Clarity | 🔵 | 注入缝只给建连：`mcp/MCP.md:42`「`deps.mcpConnectImpl ?? null`（建连替身——沿 `deps.execImpl` 先例）」——N3 的「（替身）」与 N5 的「假 stdio 件」（`mcp/MCP.md:123`/`:125`）未指名探活/关闭两径的可注入面 | 按同款补替身名（如 `deps.mcpProbeImpl ?? null`——缺省 null = 生产零变），使 N3/N5 不依赖真件 |
| 8 | Clarity | 🔵 | `webui/MCP.md:66`「探活读数只给计数——机制 = `mcp/MCP.md` §2.2」——计数读数形实为 §3.3（`mcp/MCP.md:71`「读数形 = `{ ok, toolCount, latencyMs }`」）；§2.2 仅管「无逐个开关」 | 坐标改指 §3.3（或并列 §2.2+§3.3） |
| 9 | Clarity | 🔵 | 需求锚坐标陈化：`mcp/MCP.md:4` 引「需求 `docs/server/requirements/PROJECT.md:523` 待讨论行」——盘面 MCP 待讨论块在 `:540-542`（`:523` = 沙盒域名规则行）；需求档 `:542` 已记「已立案——2026-10-13 23:10 用户「开」」，与「拟入册」表述并存 | 坐标收正（`:523` ⇒ `:540`）+ 状态按 `:542` 对齐（拟入册 = 尚待正式入册步骤则明注） |

范围外注记（无严重级）：① `design/PROJECT.md:224`（板档 AC-54 行）含「运维面 = `ops/OPS.md` §5.11」一面，`mcp/MCP.md:167` §11 未列（R86⑤ 只含部署收尾）——OPS.md 是否本批随动待确认；② `agent/ADMIN-AGENT.md:89` 仍记 as-of「chat.mjs 692 ⇒ ≈704 ∥ … bin 192 ⇒ ≈195」——同款陈化在 agent 面存在。

VERDICT: changes-required

计数：🔴×1 ∥ 🟡×3 ∥ 🔵×6。

### 轮次 2（评审子代理）

**复核结论（评审轮 2——承轮 1（#112）十项修正）**：十项逐条落盘核对通过——需求锚 `docs/server/requirements/PROJECT.md:540` ∥ 状态「已入册 2026-10-13」∥ §2.2 三注入缝（`deps.mcpConnectImpl`/`mcpProbeImpl`/`mcpCloseImpl`，缺省 null）∥ §3.2 探活体（`transport?`；`id` 在场 ⇒ 缺席字段一律回落库内行）∥ §8 N2 流程含「⇒ DELETE ⇒ GET」∥ §10 六新行 + 三读数刷新 + 小计 ≈+946 ∥ §11 运维面（`ops/OPS.md` §5.11）∥ §12 R86① 已办；同拍面 = `webui/MCP.md` ∥ `gateway/API.md` §2.13 ∥ `agent/ADMIN-AGENT.md` §6 ∥ `design/PROJECT.md` §3/§7。**关键事实核读**：`TRIMMED_FACES` 全仓唯一命中 = `thincoder-server/src/agent/run.mjs:22`（含 `"mcp"`）；`thincoder-server/src` 内除该行零 `mcp` 命中；`thincoder-server/src/agent/chat.mjs:304-312`/`:316-338`/`:470-473`/`:630-638` 四处坐标逐条对得上；核件导出坐标（`probeMcpServer:97` ∥ `connectMcpServer:236` ∥ 幂等/指纹 `:244-256` ∥ `closeAllMcp:280` ∥ `removeMcpTools:296` ∥ `buildTools:146-155`）与 `thincoder-core/package.json:37-53`（`files` 含 `"*.mjs"`/`"mcp/"`）、`:31-33`（`exports "./*"`）逐条对上；先例坐标（`thincoder-cli/src/cli/make-agent.mjs:58`/`:87-101` ∥ `thincoder-cli/src/tui/cmd-mcp.mjs:132-137` ∥ `thincoder-core/agent/assemble.mjs:105`）逐条对上。

| # | Category | Severity | Issue | Suggestion |
|---|----------|----------|-------|------------|
| 1 | 稳健性（命名面） | 🟡 | MCP 面内「服务器 × 服务器」重名未入防御面：`mcp/MCP.md:38` 只写「跨面重名防御 = 合并前扫静态两面（管理 ∥ 环境）名集」，并把核件能力限定为「单 server 内碰撞已自防」；实读核件 `thincoder-core/mcp.mjs:148-155` 的去重集逐 `buildTools` 调用新建（仅单 server 内），`sanitizeToolName` 把非字母数字统一归 `_`（`thincoder-core/mcp/helpers.mjs:49-51`）⇒ 两名 sanitize 同形（如 `web.search` ∥ `web search`）或前 64 字符截断同形 ⇒ 合并面出现重名件，按名路由静默命中先者（与「零静默」口径相抵）。 | 合并前扫描面扩为「静态两面 ∪ MCP 面既往件名集」——相撞 ⇒ 该件不挂 + 日志一条（沿用既有规则形；B2 判据同拍）。 |
| 2 | 判据对位 | 🔵 | `mcp/MCP.md:173` §11 判据表未列 AC-54 ⑤（成员侧预留）∥ ⑥（待裁点）的对位行（内容在 §6 ∥ §12 R86④ 在册；板档 `design/PROJECT.md:224` 已列 §6）。 | §11 补 ⑤⇒§6、⑥⇒§12 R86④ 两指针，与需求档 AC-54 ①–⑥ 逐项对齐（不改判据语义）。 |
| 3 | 清晰度（端点体） | 🔵 | `POST /api/admin/mcp` 体 `enabled?` 缺省值两档均未写（`mcp/MCP.md:62` ∥ `gateway/API.md:320`）；控制台只写表单「缺省勾」（`webui/MCP.md:31`）⇒ 非控制台调用方（curl/单测档）无从判缺省，B2/E1 判据缺锚。 | 明写缺省（如 `enabled` 缺省 = 启用）并与 v24 DDL 缺省值同拍。 |
| 4 | 读数 spot-check（注记） | 🔵 | 受影响文件读数抽核（口径 = 内容行 ∥ 文末换行不计）：`chat.mjs` 692 ✓ ∥ `run.mjs` 150 ✓ ∥ `i18n-zh.mjs` 16 ✓；`migrations.mjs`（标 711）∥ `bin/thincoder-server.mjs`（标 244）∥ `src/accounts/audit.mjs`（标 121）三处本地逐行读数各短 1（三档末行后均现一空行——疑含文末空行计数；低置信）。 | 三处按同一「内容行」口径复读；对行账小计与拆档线判定无实质影响（三档皆远低于 500/800 线）。 |

范围外注记（不判严重度）：`ops/OPS.md` §5.11 一号两义——`OPS.md:257` 现为「MCP 服务器」（server-mcp 批新增），而 `OPS.md:37` ∥ `:101` ∥ `:104` ∥ `:160` ∥ `:200` 五处「告警 webhook／watchdog 机制全文 = §5.11」指向已暂缓的可靠性批（`docs/batches/2026-10-10-server-reliability.md` §1 状态行 = 暂缓）；两句日后同落必撞号，处置（本批换号 ∥ 清残留引用）待定。

VERDICT: pass

计数：🔴×0 ∥ 🟡×1 ∥ 🔵×3；范围外注记×1。

## §4 用户批准（主 agent）

**批准（父侧代签 · 2026-10-14 · 用户 00:07「其他自动跑」授权内 ∥ 01:39「能点火的都点火自动跑吧」加固）**

- **三条件齐备**：① 评审 **pass**（§3 轮次 2——🔴×0 ∥ 🟡×1 ∥ 🔵×3；轮 1 十项全采纳且逐条核读在册）；② 修正轮两轮（#115 十项 ∥ #118 四条）落地并核读；③ 令牌已签发（在槽——运行态凭据，值不落档；出档记为「评审通过」）。
- **批准范围 = 本批实施**（§2 受影响文件表——服务端三新档 + 随正件 ∥ webui 三新档 + 随正件；零触面见 §2）。
- **派发** = 两舱（服务端面 ∥ 控制台面——同令牌并行；文件域互不相交）；服务端舱因与 member-face-chat 批文件重叠（`migrations.mjs`/`bin`/`gateway/server.mjs`）由调度器排队后发——**v23（member）先落 ≺ v24（本批）后落**（版序保证）。

**用户批准（2026-10-14）**：随版放行——用户 09:02「发版」+ 09:05「含」。两舱（服务端 #130 ∥ 控制台 #131）已交付、父侧复跑在案（10/10 ∥ 10/10）。

## §5 实施记录（eng-coder）

**状态行**：实施完成（承 §2 含两轮修正块；批内件 10 腿全绿；审计轮 1 两发现收（跨批 ctx 恢复承父侧裁）；行数与两边界披露见段内）

### 交付摘要（逐条对 §2 验收）

- **落地**：新档三件 `thincoder-server/src/mcp/{store,face,routes}.mjs`（339 ∥ 196 ∥ 136 行——split 计行，as-of 2026-10-14）∥ 改档 `src/agent/chat.mjs`（`mergeToolFaces` 泛化为多面路由 + MCP 面并面 + 文本面名集路由）∥ `src/agent/run.mjs`（`TRIMMED_FACES` 去 `mcp`）∥ `src/store/migrations.mjs`（v24 段：`mcp_servers` 建表 + 审计 CHECK 十七型重建 + 两索引）∥ `src/accounts/audit.mjs`（`AUDIT_TYPES` + `mcp_event`）∥ `bin/thincoder-server.mjs`（`registerMcpRoutes` 注册行 + 停机 `closeMcpConnections` 收口）；批内件 `docs/batches/2026-10-13-server-mcp.test.mjs`（566 行——10 用例）。
- **验收实读**：`cd thincoder && node --test docs/batches/2026-10-13-server-mcp.test.mjs` ⇒ `tests 10 ∥ pass 10 ∥ fail 0`（N1–N3 ∥ B1–B2 含相撞腿 ∥ E1 ∥ N4 ∥ N5 全绿）；`node --check` 全改档绿（批内件 T2 逐档跑）∥ 新档 ≤500 软线守（339/196/136）∥ 迁移三径（空库直落 24 ∥ v23 升 24 ∥ 幂等 ∥ 列面 11 名 + `name` 唯一 + `transport` 枚举逐值 ∥ 存量审计行保形 + 两索引 ∥ `mcp_event` 可写、表外型拒）∥ 源扫腿（`TRIMMED_FACES` 零 `mcp` ∥ chat 面装配含 MCP 面 ∥ bin 注册/收口接线）。
- **行数披露（承父侧 2026-10-14 裁定）**：`chat.mjs` 现读 **733**（split 计行——越设计阈 720；缘由 = 基数漂移〔他批已落 +10 ⇒ 703〕＋本舱净 +30）∥ `migrations.mjs` 现读 **796**（split；HEAD 711 ＋ 他批未提交 v23 段 +41 ＋ 本舱 v24 段 +44——距 800 硬限余 **4** 行、越拆线 700）。**两拆案均另案：台账 #1405**（父侧裁：本舱不拆、按原设计交付；下一迁移触碰批前必拆）。
- **跨批相抵恢复**：`chat.mjs` 合并路由管理族支补回 `ctx`（`base.invoke(name, args, ctx)`）——承 `docs/batches/2026-10-14-model-test-tool.md` §5「两族同携」语义（该改动在并发合并中丢，非其虚报）；父侧 2026-10-14 裁「按倾向补回」，本舱落地。
- **两处已知边界（披露）**：① **零工具服务器**（`tools/list` 空）——核件关闭两导出一律以工具表为判据（`thincoder-core/mcp.mjs:280` `closeAllMcp` ∥ `:296` `removeMcpTools`），无件可作关闭靶 ⇒ 删行/停用不关会话、停机收尾亦扫不到（`face.mjs` 诚实返回 `false`、零谎报；修复面在核件能力，落「核面零改」护栏内 = 不修）。② **改名**（PATCH `{name}`）——核件会话以 name 为键且指纹不含 name ⇒ 改名后按新名再建一条会话（同命令双实例），旧名会话存续至停机。
- **文件域外改动披露**：`src/mcp/routes.mjs`/`face.mjs` 新增 `deps.mcpRemoveImpl` 单服务器关闭替身缝（评审轮 1 修复所需之回归断言面；缺省 `null` = 核真件，生产零变）；其余零域外文件、零核面改。
- **未覆盖腿（如实记）**：E2「缺核 ⇒ MCP 面不挂载 + 警告」——核真件在场（仓内可载）⇒ 降级径无注入点（`face.mjs` 模块私有缓存），行为面由 T6（不挂载 + 日志）∥ T3/T7（回合照跑）等价覆盖；批内件档头同记。

### 决策透明表

| # | 决策 | 依据（可核） |
|---|---|---|
| 1 | 敏感三键「空串/空对象 = 不变」（非清）——清空唯一入口 = 显式 `null` | 设计 N4 判据「编辑窗留空秘密 ⇒ 秘密列不变」＋控制台口径「留空 = 不变」；providers `apiKey: ""` 先例不沿用（防控制台空串提交静默清凭据）——代码评审轮 1 发现 3 收口 |
| 2 | 袋值未变 ⇒ 密文列原值直取（不重加密） | AES-256-GCM iv 随机 ⇒ 重加密必改密文；N4 判据「库内密文逐值」；顺带免无谓写 |
| 3 | 关闭靶先取后清 + 空靶诚实 `false` | 背离审计轮 1 发现 1（取靶后清 = 靶空 ⇒ 会话不关）——修复；核件能力面残余见上「已知边界①」 |
| 4 | 第四注入缝 `deps.mcpRemoveImpl` | 评审轮 1 建议（回归断言面）；缺省 `null` = 生产零变 |
| 5 | 管理族 `ctx` 补回（跨批恢复） | 父侧 2026-10-14 裁；恢复 `ADMIN-AGENT.md` §12.1② 语义 |
| 6 | 两拆案不拆（chat.mjs 733 ∥ migrations.mjs 796） | 父侧 2026-10-14 裁：另案 #1405、按原设计交付 |

### 审计与代码评审（轮次 ∥ 终态）

- **发散审计轮 1**（只读 explore）：`DEVIATIONS` ——发现 1 🔴（关闭靶取靶后清：`latestByServer.delete` 先于取靶 ⇒ `removeMcpTools` 零命中、函数仍返 `true`）**已修**；发现 2 🔴（跨批相抵：合并路由管理族支丢 `ctx`）**上抛父侧 → 裁定补回 → 已落**；三条文档漂移只报不改（STORE §3「列面十行」vs DDL 11 列 ∥ 批档 §5 空缺 ∥ §10 三新档行账估值差）。
- **代码评审轮 1**（advisor · code）：`pass`（🟡×4 ∥ 🔵×2 ∥ 协调项×1）→ 修复轮：留空语义收正（②）∥ 关闭靶诚实化 + 注释收正（③⑥）∥ 冷却清守卫（④）∥ 补 T9/T10 腿（⑤）。
- **代码评审轮 2**（advisor · code——只核修复声请）：`pass`——五条声请逐条成立（① 三参透传兼容 ∥ ② 语义 + 密文保值 ∥ ③ 先取后清 + 空靶 `false` ∥ ④ 字符串名守卫 ∥ ⑤ 用例落盘）；旧账 Fixed×4 ∥ Accepted×2（零工具服务器 ∥ 改名——理由成立）∥ 协调项×1 未决（§5 文本，本段即落）；**新面零命中（零新增 🔴/🟡）**。
- **终态 = clean**。

### 值序与文档面

- 版序：结构版本 = **24**（`store/STORE.md` §2 v24 段；v23 段先于本舱落盘、本舱仅衔接）。

### 控制台面舱（UI 席）· 实施记录（eng-coder · 2026-10-14）

**状态行（控制台面舱）**：实施完成（页件 + 随正件 + 批内件 `-ui` 档 10 腿全绿；发散审计 1 轮 + 代码评审 2 轮——终态 clean；两处设计缺口/外部披露在段内）

#### 交付摘要（逐条对 §2 验收）
- **落地**（控制台面——与服务端面舱文件域互不相交）：新档三件 `thincoder-server/public/views-mcp.mjs`（实读 **250**——split 计行）∥ `i18n-zh-mcp.mjs`（**55**）∥ `i18n-en-mcp.mjs`（**55**）；随正九档 `public/{i18n-zh.mjs, i18n-en.mjs, i18n-zh-shell.mjs, i18n-en-shell.mjs, i18n-zh-system.mjs, i18n-en-system.mjs, views-audit.mjs, nav.mjs, app.mjs}`；文档随正 `webui/WEBUI.md`（§1/§5 + 变更记录 +1 行）∥ `webui/I18N.md`（§2.1/§3 + 变更记录 +1 行）；批内件 `docs/batches/2026-10-13-server-mcp-ui.test.mjs`（10 用例）。
- **验收实读**（AC-54 ①–⑧ 逐条）：`cd thincoder && node --import ./thincoder-server/test/rc-resolve.mjs --test docs/batches/2026-10-13-server-mcp-ui.test.mjs` ⇒ **tests 10 ∥ pass 10 ∥ fail 0**（T1 页形/五列逐值/空态 ∥ T2 探活行内三态（含在飞断言）+ 体 `{ id }` ∥ T3 启停成/败两态 ∥ T4a 新建（POST 体逐值 ∥ 败草稿不丢 ∥ KV 非法零请求）∥ T4b 编辑（秘密零回填 + 清除 ⇒ 显式 `null` + 草稿探活携 `id` + 探活败就地）∥ T4c 传输切换（字段组 + 状态行复位）∥ T5 删除（后果句 + 取消零请求）∥ T6 键面（40 键/表 ∥ en 零 CJK ∥ 占位符对位 ∥ shell/system 各 +1 ∥ 审计枚举 +1 ∥ 消费闭合）∥ T7 接线（管理 11 ∥ denied ∥ app ∥ 非壳页五路径零动 ∥ 三新档在盘 ∥ 档目链）∥ T8 静态（`node --check` 全改档 ∥ ≤500 线 ∥ 零 CJK 代码段 ∥ 零 `innerHTML`/外链 ∥ 类双向闭合））。
- **键面**：`admin.mcp.*` = **40 键/表**（设计估 ≈55——实施收正）；`nav.page.admin.mcp` 入 shell 两表；`audit.type.mcp_event` 入 system 两表；门面两档各 +1 import（16 ⇒ 17 行/档）。
- **接线**：`nav.mjs` 管理组 10 ⇒ **11**（「MCP 服务器」插入模型后）；`app.mjs` +1 import +1 `PAGES`（非壳页五路径零动）；`views-audit.mjs` 枚举 +1（`mcp_event`——CJK 注释同拍「本表十六型在册」）。
- **文件域外改动披露**：**零**（本舱改档全部在任务书点名面内；服务端面 `/rc/*` 缝件 ∥ `views-me-chat*` ∥ `i18n-*-me*` ∥ 他批 `*.test.mjs` 零触）。
- **未覆盖/披露项（如实记）**：① 编辑窗 `args` 恒空（清单行只下发 `target`——旧 args 不可见、留空 = 不变）= **设计缺口**（`webui/MCP.md` §2.1 ∥ `mcp/MCP.md` §3.2 均无 args 回填口径——发散审计复核属实）；② `member_event` 在 `views-audit.mjs` 枚举/i18n-system 仍缺（他批登记「待落」——本舱仅 +`mcp_event`，不改）；③ 兄弟批「档目/清单断言件族」（readdirSync 计数/键数终值类 ≈18 件）加三新档后必红 = 设计 R86② 在册的「实施轮同拍随正件」，**不在本舱文件域**（未触——请父侧路由）；④ `webui/MCP.md` §3 文件账（≈320 ∥ ≈75/≈75 ∥ 行合计 ≈472 ∥ shell ≈81/≈79）与 §4 载体栏（只指服务舱测试档）未随实施轮收正——面档非本舱随正范围（`WEBUI.md`/`I18N.md` 已随正）= 文档状态滞后（评审 🟡 report-only——无在册不修理由，本舱不闭合）。

#### 决策透明表
| # | 决策 | 依据（可核） |
|---|---|---|
| 1 | 单档 `views-mcp.mjs`（不预拆 `views-mcp-modals.mjs`） | 实读 250 < 300 页分档线——设计「越线预案」条件未触发（`webui/MCP.md` §3 预案句） |
| 2 | 隐藏态行（读数行/窗内状态行）= 节点 + `hidden` 属性，不用 `style.display` | 沿 `views-ledger.mjs` 先例；`style.css` `[hidden] { display: none !important; }` 兜底（KD-SV-150） |
| 3 | 传输三择 = 域语汇线值直示（`stdio`/`http`/`ws`） | 行面「传输」列同源（`webui/MCP.md` §2.1 表「`transport`（域语汇三值）」）；沿 team-ledger 六态值直示先例 |
| 4 | 清除勾 ⇒ 三秘密列（`token`/`headers`/`env`）整体显式 `null` | 设计「「清除」勾（勾 ⇒ 显式 `null` 清空）」+ 键面「清除已保存凭据」语义；T4b 逐值断言 |
| 5 | 窗内「测试」编辑态携 `id`（缺席字段服务端回落库内行） | `mcp/MCP.md` §3.2 探活径收正（设计评审轮 1 发现 4）；T4b 断体逐值 |

#### 审计与代码评审（轮次 ∥ 终态）
- **发散审计轮 1**（只读 explore，核读 15 档）：AC-54 ①–⑧ 逐条 = 一致；重点核查 8 条全过（行数 248 < 300 ⇒ 拆档预案自然消解 ∥ args 缺口属实 ∥ 秘密零回填真零（全档 `.value` 写点唯传输选单）∥ 类双向闭合 14/14 ∥ 消费闭合零悬空 ∥ 文档实读逐值与盘面一致 ∥ 越界面零证据 ∥ 测试腿真覆盖）；四类偏差（PARTIAL ∥ SILENT-SIMPLIFICATION ∥ DOC-DRIFT ∥ OUT-OF-LIST）= **none**；1 条 🔵 记录面计数（变更记录「五行 ⇒ 七行」）当轮已修。
- **代码评审轮 1**（advisor · code）：**pass**（🔴×0；🟡×2 = `webui/MCP.md` §3 文件账滞后 ∥ §4 载体未含本舱件，均 report-only；🔵×3 = I18N 覆盖页数 17 vs 盘面 18 ∥ 批内件消费闭合扫描面窄（`field()`/弹窗选项/三元共 13 键逃逸）∥ 传输切换不重置窗内状态行）。
- **修复轮（本舱 3 处 + 1 处不修）**：① `views-mcp.mjs` `renderBody` 加状态行复位（+2 行 ⇒ 实读 250）；② 批内件扫描面改「全字面量取键」（实读 43 键 ⊆ 门面）+ 广度下限 30 ⇒ 43 + **新腿 T4c**；③ `I18N.md` 覆盖范围 17 ⇒ **18**（盘面实读，变更记录收正）。**不修** = `webui/MCP.md` §3/§4（面档非本舱随正范围——见披露 ④）。
- **代码评审轮 2**（advisor · code——只核修复声请）：**pass**（三处修复逐条成立；旧 🟡×2 归文档状态面不阻塞；新面 🔵×2 = `WEBUI.md` §5 `views-mcp.mjs` 实读 248 ⇒ 应 250（修复轮 +2 所致，report-only）∥ 广度下限贴边（43 vs ≥43，advisory））。**机检注**：轮 2 报告引用坐标经宿主引用机检 = 0/11（标「file unreadable」——引用路径形与宿主解析口径不符；事实面由本舱直读复核在案，下轮起引用统一带仓前缀）。
- **终态 = clean**（🔴 零；🟡 全 report-only；修复三处落盘并经批内件 10 腿复核）。

#### 值序与文档面（控制台面）
- 无结构版本变更（v24 = 服务端舱面；控制台面无迁移面）。
- 文档随正两档：`webui/WEBUI.md`（§1：`views-mcp.mjs` 拟新增 ⇒ 已落 ∥ JS 链 ⇒ 65 档实读 ∥ i18n 部件 16 ⇒ 18 档 ∥ 档目链补本批段 = 盘面实读 67 ∥ 68；§5 七行随正：三 mcp 行「拟新增 ⇒ 已落」+ 实读 248∥55∥55、`app.mjs` 实读 209、`nav.mjs` 实读 107、shell 两行实读 82∥80；变更记录 +1 行）∥ `webui/I18N.md`（§2.1：九部件 + 40 键/表 + 覆盖范围 18 页；§3：门面 16 ⇒ 17 行/档 + 面小计补 +110；变更记录 +1 行）。

## §6 验证与收口（父代理）

**验证与收口（2026-10-14 · 父侧）**：① 验证 = 两舱复跑 10/10 ∥ 10/10 在案（含跨批 ctx 相抵恢复 `chat.mjs:334` 已实核）；集成（真 MCP 服务器连拉 + 控制台走查）= 发布后走查（随 release 收尾）；② 结算同步 = 披露随正件挂账（#1415 STORE/MCP/API 行账 ∥ #1417 member_event 渲染 ∥ #1418 编辑窗 args 设计缺）；③ 台账 = #1379（管理会话先行面**已交付**；成员侧会话 MCP = 随后，在途保持，evidence 已追加）；④ 收口 = 本记录冻结。
