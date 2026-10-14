# 2026-10-13 · server 与核统一
> 六段 append-only，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 编制：主 agent · 2026-10-13 · 来源 = 用户 2026-10-13「全做」（清账轮短单第 3 项——按父侧建议方向 = agent 面引核）。
> 台账 = #1239（server · 归批）。前情 = 无（独立批）。
## §1 讨论（主 agent）
**状态行**：已收口 2026-10-13
<§1 模板占位：本批条目 / 关键判据 / 授权口径>

**本批条目**（用户 2026-10-13「全做」＝短单第 3 项）：**server 与核统一——agent 面引 `@thincoder/core`**（免第四份 agent 实现）。

**背景（如实）**：KD-SV-2（`docs/server/design/PROJECT.md` `:14` ∥ `:71` ∥ `:96` ∥ `:177`）三条理由 = **中继面专属**——用户 2026-10-10 15:23 指正「所有那些都是只适用于中继服务的内容，跟 server 上的其他功能有啥关系？」⇒ 全树禁令无据（论证射程 < 禁令射程）；三选（维持不引写清理由 ∥ agent 面引核 ∥ 逐面复核）在册待裁 —— 本次「全做」= 按父侧建议方向取 **agent 面引核**。

**设计要点（首裁）**：① agent 面引核范围（`agent/chat.mjs` ∥ `agent/run.mjs` 消费核哪些件——最小集）；② **带核发布形**（server `dependencies: {}` × 引核 ⇒ 依赖形与版本对位；与 #1222 发布序同题）；③ 逐面理由（中继面维持不引——理由写清；存储 / 账号 / 控制台面逐面复核）。**禁**：本批不动 `gateway` 中继面语义。

**机制单源档** = `docs/server/design/PROJECT.md`（§1 ∥ §2.3 ∥ §5 KD-SV-2 行）∥ `docs/server/design/agent/ADMIN-AGENT.md`；需求侧 = `docs/server/requirements/PROJECT.md`（若涉需求面收正由设计轮标出）。

**父侧裁定与更正（2026-10-13 12:0x · 答设计席 #2 上抛）**：① §1「已知事实」两处**失效更正**（设计席实读）：server `package.json` 现**已声明** `@thincoder/core ^0.10.4` 并已在 6 档消费（非 `dependencies:{}`）；KD-SV-2 行 2026-10-10 已限定**网关面**（非全树禁令）——设计按实况落。② 相抵裁决：需求档 `docs/server/requirements/PROJECT.md:600`（用户 2026-10-10 16:40「循环 ∥ 会话 ∥ 审批 ∥ 提示词装配 = 取核」）= **目标态**；父侧「核面零改」护栏让步 ⇒ 本批口径 = **不改核实现**、核面若需开缝则**列名 + 供配套核批**。③ 方向采**甲**（件级取核 + 环体自持 + 开放点），并加要求：「核开宿主裁剪缝」写为 §2 开放点下的**设计草案级提案**（供后续核批承接），环体切换不在本批。

**父侧更正注（评审轮次 1 发现 2/6 之 §1 侧 · 2026-10-13 12:3x）**：① 本 §1 引「`docs/server/design/PROJECT.md` `:14` ∥ `:71` ∥ `:96` ∥ `:177`」四坐标与现盘不符（KD-SV-2 全形现于 `design/PROJECT.md:131`）⇒ **以现盘为准**（复核时点 = 2026-10-13 12:0x）。② 目标态坐标：需求档 **`:601`**（16:40 管理面裁句——「agent 循环 ∥ 会话 ∥ 审批 ∥ 提示词装配 = 取核」）；`:600` = 盒内（成员面）agent 句。本 §1 各引「`:600`」处以 `:601` 为准；§2 与设计档侧由修复轮（席 #12）收正。

## §2 批次任务与设计（eng-designer）
**状态行**：设计完成（评审轮次 1 修复落毕（2026-10-13——修复表见段末）；开放点三条待裁（ADMIN-AGENT.md §17.4））
<§2 模板占位：本批条目（覆盖） / 设计档落点 / 机制设计 / 受影响文件与测试覆盖 / 验收对照 / 关键决策 / 上抛项>

**§2 批次任务与设计（eng-designer · 2026-10-13）**

**本批覆盖条目（台账 #1239——§1 设计要点三件 + 收正件一件，逐条落点）**

1. **agent 面引核范围（最小集——file 级）** → 设计落点 = `agent/ADMIN-AGENT.md` §17.2：**在盘 15 件**（`provider/index.mjs` ∥ `model-specs.mjs` ∥ `agent/timers.mjs` ∥ `agent-tools/{timer,bash-async,async-settle,async-discard,read-history}.mjs` ∥ `tools/{ops,search,file,bash,shared}.mjs` ∥ `agent/helpers.mjs` ∥ `attachments.mjs`——逐件取用面 + 服务面消费坐标在表）+ **本批新增 3 面**（A1 工具轮回灌形 = `model-specs.mjs` `assistantToolCallMessage`；A2 历史修复 = `agent/helpers.mjs` `repairHistory`；A3 上下文压缩 = `context.mjs` `compressIfNeeded`/`compressFallback`/`COMPRESS_FAILURE_LIMIT`）；消费面接法（动载 ∥ 注入口 ∥ 缺核降级 ∥ 垫片即宿主）= §17.1。
2. **带核发布形（版本对位口径 ∥ 依赖形；同题 = 台账 #1222）** → 设计落点 = `design/PROJECT.md` §2.3（新增条）：依赖形 = `@thincoder/core` 版本声明（registry——实读 `^0.10.4`，与渲染核 `file:` 形两分）∥ 地板口径 = pin 覆盖件清单（§17.2 背书；新采纳 ⇒ 同提交升 pin）∥ 发布序 = 核先于/同拍随 server 发行 ∥ 装机三径 fail-loud ∥ 发布动作 = 发布面轮；KD-SV-138。
3. **逐面理由表（中继面维持不引 ∥ 存储/账号/控制台等逐面复核）** → `design/PROJECT.md` §2.3 逐面条重写：中继面（网关 provider 层）= 不引（三条理由）∥ agent ∥ provider 客户端 ∥ 模型规格 = 引 ∥ 存储 ∥ 记账 ∥ 账号 ∥ 控制台 ∥ 沙盒 ∥ 运维 = 自持（账号面复核 = 核内为客户端登录侧、方向相反）。
4. **KD-SV-2 全树禁令收正为逐面判据（可机检）** → `design/PROJECT.md` §5 KD-SV-2 行收正 = 「**中继面（网关 provider 层）不引 `thincoder-core/*`**（范围限定 = 网关面；全域口径 = KD-SV-78；逐面复核表 = §2.3）」+ §2.3 逐面表；KD-SV-78 行按实况收正（件级落形 + 环体开放点）；**新增 KD-SV-137**（agent 面取核形）。

**本批明确不做（边界）**：核侧零改（核面实现零动；核欠缝面 = 开放点，配套核批承接——**不塞本批**）；本批不写实现（实施轮另派）；不动需求档（回笔建议列 R73②）；不动 gateway 中继语义；不动 `run` 任务面出口（#1326 撤回在册）。

**设计落点（三链同源）**：需求档 = `docs/server/requirements/PROJECT.md:600`（用户 2026-10-10 16:40 裁——目标态，本批不写）∥ 批档 §2（本条）∥ 设计档 = `design/PROJECT.md` §1/§2.3/§4/§5/§6/§7/§9 + `agent/ADMIN-AGENT.md` §5/§6/§7/§13/§17（新增）。

**受影响文件（实施轮——设计估）**：`thincoder-server/src/agent/chat-compact.mjs`（**新** ≈90——压缩面 + 落库标记适配）∥ `chat.mjs`（实读 690 ⇒ ≈705）∥ `run.mjs`（实读 138 ⇒ ≈143）∥ `chat-store.mjs`（实读 155 ⇒ ≈185）；`thincoder-server/package.json` ±0（声明已对位）；单元测试档 1 档（`docs/batches/2026-10-13-server-core-unification.test.mjs`——≈350 行；**不入任何门**）；**产品码零触（设计轮）**。

**关键决策（全文 = 设计档 §5）**：KD-SV-137（agent 面取核形 = 件级取核 + 环体自持——被否：全环取核不加缝 ∥ 全树自持）∥ KD-SV-138（带核发布形 = 版本声明 + 地板口径 + 发布序——被否：`file:` 直连核 ∥ 不声明依赖）。

**验收（实施轮机检口径 = `agent/ADMIN-AGENT.md` §7 新增行）**：① 件清单在场（file 级逐件）∥ ② A1 回灌形（回声族携 `reasoning_content`〔缺值 ⇒ `""`〕∥ 非回声族零字段；`extra_content` 在场才带；落库 ∥ 回放逐值）∥ ③ A2 修复（断链 pair 注入 ⇒ 修复成对）∥ ④ A3 压缩（阈值触发 ⇒ 标记行落库 + 回放以标记代覆盖段 + 上下文缩；3 连败 ⇒ 降级；摘要调用经出口——`usage` 行可归因）∥ ⑤ 缺核降级不阻断 ∥ ⑥ 核面零改（核侧文件零动）。

**上抛项**：[上抛·待裁] 开放点三条（`agent/ADMIN-AGENT.md` §17.4——① 环体取核〔含宿主缝设计草案：`assembleFamilyTools`/`prepareRun` 宿主面入参；推荐 = 参数化形；触发 = 配套核批开批〕∥ ② 提示词场景槽 ∥ ③ 会话面）。[上抛·知会] 前期两条失效实况（spawn 书「server 现 `dependencies: {}`」陈——实读 `thincoder-server/package.json:16-17` 已声明核 + 渲染核；「KD-SV-2 全树禁令」陈——2026-10-10 已限网关面）；需求档回笔建议（R73②）∥ 随正件：`thincoder-server/README.md:13`「零依赖 ⇒ 装机无 install 步」句已失效（产品文案——实施轮 ∥ 发布面轮）。

**自检**：① 需求五要素（需求档 :600 已载——本批不改）✓ ∥ ② 受影响文件 + 行数（上）✓ ∥ ③ 验收指向（§7 新增行——六条机检）✓ ∥ ④ UI/交互决策：本批零 UI 面（压缩标记行为数据面；控制台呈现随观 = R73④）✓。

**评审轮次 1 修复（设计席 · 2026-10-13——承 §3 轮次 1 之 1–9；父侧逐条采纳）**

| # | 处置 | 落点（file:line——现盘） |
|---|---|---|
| 1 🔴 | 回放口径单源 = §17.3 A3（压缩会话以标记行代覆盖段）——三种旧表述各补指针 | `agent/ADMIN-AGENT.md:94`（§7 ④ 判据行）∥ `:161`（KD-SV-89 行）∥ `:202`（§11 回合装配句） |
| 2 🟡 | 目标态坐标 `:600` ⇒ `:601`——七处全收正（16:40 管理面裁句所在） | `agent/ADMIN-AGENT.md:81`/`:286`/`:466`/`:549` ∥ `design/PROJECT.md:134`/`:737`/`:858` |
| 3 🟡 | §17.1 补「最近先例」行（先例坐标 = §14.2 ∥ §16.1；先例批三；对齐 = 同法；偏离 = A1/A3 附理由指） | `agent/ADMIN-AGENT.md:473` |
| 4 🟡 | §11.1 补落库面 tool 轮回声道例外指（§17.3 A1） | `agent/ADMIN-AGENT.md:217` |
| 5 🔵 | `run.mjs` 两处收平 = **实读 137 ⇒ ≈142**（内容行口径——与 `agent/ADMIN-AGENT.md:60` 同值；+5 增量不变） | 本表（前文 `:36` 所载「138 ⇒ ≈143」以本条为准） |
| 6 🔵 | 四坐标（`design/PROJECT.md` `:14`/`:71`/`:96`/`:177`）设计档侧全扫 = 零同形引用（唯一命中 = 旧批变更记录内自指行——非同形）；§1 侧更正注已在册 | ——（复核范围 = `docs/server/design/**`） |
| 7 🔵 | `chat.mjs` 拆档状态复述入 §6 本批块（触发线 **720** ∥ 现距 ≈15 ∥ 对象 = 唤醒径整段抽 `chat-wake-turn.mjs` ∥ 预案先例 = server-wake-face 批） | `agent/ADMIN-AGENT.md:82` |
| 8 🔵 | `COMPRESS_FAILURE_LIMIT` 值源（= 3——取件 = `@thincoder/core/context.mjs`）——机制文 + 验收句双落 | `agent/ADMIN-AGENT.md:105` ∥ `:522` |
| 9 🔵 | 审批腿处置行（目标态四腿之一——已处置，非开放点；取核腿若涉环体批再议） | `agent/ADMIN-AGENT.md:533` |

**本 §2 前文坐标收正**（批档 append-only——前文不删行，以本表为准）：① `:36` ∥ `:46` 引「需求档 `:600`」⇒ **`:601`**（`:600` = 盒内成员面句）；② `:36`「`run.mjs`（实读 138 ⇒ ≈143）」⇒ **137 ⇒ ≈142**；③ `:36`「`chat.mjs`（实读 690 ⇒ ≈705）」＝在案（拆档状态 = #7）。§1 侧（`:17`）父侧更正注已在册（`:19`）；§3 `:57` 行 = 评审节历史记录（保留）。

**机检读数**（`node scripts/doc-check.mjs`——仓根 `thincoder/`；交付前终态）：锚 = **悬空 11**——关涉两档（`agent/ADMIN-AGENT.md` ∥ `design/PROJECT.md`）**零命中**（11 条分布 = `docs/core` 2 ∥ `docs/desktop` 6 ∥ `docs/server/design` 另两域 3）；行宽 = **2 行超 300**——`design/PROJECT.md:719`（346——本批笔迹外：该行 = admin-agent-awareness 预算块，在途批改笔）∥ `webui/CHAT.md:202`（307——非本批档）；本批新增规范面行全部 ≤300（变更记录区带内豁免）。〔上抛·知会〕上述 11 + 2 为在途/历史现状——归批处置请父侧裁。

**变更记录**：设计档侧各落一条（`agent/ADMIN-AGENT.md` 变更记录首行 = `:547` ∥ `design/PROJECT.md` 变更记录末行 = `:860`）。**零新语义**（评审发现直接导出项）；产品码零触（条文笔）。

**落地后补正块（fix 轮——承 §5 实施记录；append-only——前文「受影响文件（实施轮——设计估）」句〔`:38`（前引 `:36` 行号收正）〕设计估由本块接管）**

**① 文件账回填（估 ⇒ 落地实读——§5 同口径，含尾行差；内容行口径各 −1）**

| 件 | 设计估（`:38`） | 落地实读 | 净变（§5） |
|---|---|---|---|
| `chat-compact.mjs`（新） | ≈90 | **334** | 新档 |
| `chat.mjs` | ≈705（基数 690） | **692**（未越 720 拆档线——距 28 ⇒ 未拆档） | ≈+2 |
| `run.mjs` | ≈142（基数 137） | **150** | ≈+13 |
| `chat-store.mjs` | ≈185（基数 155） | **247**（回放面迁入） | ≈+90 |
| 批内件 `docs/batches/2026-10-13-server-core-unification.test.mjs` | ≈350 | **486** | 新档 |

- 读数时点 = 2026-10-13 13:2x（回填当刻，与父侧实读一致）。〔知会〕`run.mjs` 13:23:53 起被他批改笔（`TRIMMED_FACES` 增 `team_ledger`——team-ledger 批在途）⇒ 现读 151——本批回填值不动（= 实施落点读数；该批/下一回填轮接管）。

**② run 任务面缺核警告静默（父侧裁——与 §5「一面一条警告」句同拍收正）**：run 面零 `log` 参数——无警告通道；降级不阻断已保证；run 面接入 `log` 时同拍补警告。§5 该句按此读 = 会话面退中性面各一条（`chat_core_face_missing`）∥ run 任务面静默。

**③ 设计档侧落点（同轮——`agent/ADMIN-AGENT.md`）**：§6 行账回填（四件 + 批内件）∥ §17.3 披露对位四条（回放面迁入 `chat-store.mjs` ∥ `exit.spec` plumbing〔调用语义零变〕∥ 垫片 provider 取数 = 注入口 `deps.compactProvider ?? modelExit.provider` ∥ 压缩可视面 = 日志 `chat_compact_start`——不产帧）∥ §17.3 补缺核降级与警告面句 ∥ 变更记录一行。

## §3 设计评审（评审子代理）

### 轮次 1（评审子代理）

**评审限制**：未声明 Project Standards 档与 Document Map——方法学合规 / 文档归属按评审准则 + 仓内结构证据（板/域/档三层、KD 归属、节归属）判定；`thincoder-core/*` 核件与产品源码坐标超出本次文档评审范围（设计自述「实读」，未逐点复核）。

| # | Category | Severity | Issue | Suggestion |
|---|---|---|---|---|
| 1 | Document ownership | 🔴 | 回放机制两处表述互异：`agent/ADMIN-AGENT.md:160`（KD-SV-89）载「回放 = 库行装配为模型消息数组（notice 滤除）」；本批新增 `agent/ADMIN-AGENT.md:519`（§17.3 A3 第 4 条）载「回放自标记解析——覆盖区间以标记行代（嵌套标记自然消解）」并注「模型视野 = 压缩后形」——压缩会话下两者给出的模型视野相异；KD-SV-89 行未随本批收正/加指针（同缺 = `agent/ADMIN-AGENT.md:201` 装配句「历史重放（含图——KD-SV-109）」∥ `:93` 旧判据行「会话落库与重放（逐行在场 ∥ notice 回放滤除 ∥ 工具结果截断口径一致）」）。 | 在 KD-SV-89 行（及 §11 装配句、旧判据行）补压缩标记语义的收正/指针（覆盖区间以标记行代——§17.3 A3），使「回放」口径单源后再实施。 |
| 2 | Doc-state（坐标） | 🟡 | 目标态坐标 `docs/server/requirements/PROJECT.md:600` 多处引用（批档 `:17`/`:34`/`:44`；`agent/ADMIN-AGENT.md:81`/`:285`/`:465`/`:544`；`design/PROJECT.md:134`/`:737`/`:858`），但现盘 `:600` 为盒内（成员面）agent 句「能力面（工具 ∥ 会话 ∥ 提示词 ∥ 模式）一律取自核」，所引 16:40 管理面裁定「agent 循环 ∥ 会话 ∥ 审批 ∥ 提示词装配 = 取核」实居 `:601`——坐标错位且跨射程（`:601` 边界句注「16:36 硬口径只辖盒内（成员面）agent」）。 | 上述各处 `:600` 收正为 `:601`（或改引 `:601` 的 (a)(b) 双句）。 |
| 3 | Closest-precedent | 🟡 | 未见成形的「最近先例」行（先例坐标 = 实现坐标 ∥ 设计档节 ∥ 先例批；+ 对齐 ∥ 偏离理由）：`agent/ADMIN-AGENT.md:471` 的接法句只写「沿既有先例」、无坐标；先例/偏离材料散见（`design/PROJECT.md:134` KD-SV-137 被否栏携核件坐标 ∥ `agent/ADMIN-AGENT.md:509` A1 被否栏携现盘实证坐标）。 | 补一行：先例 = 件级核件复用既有形（`agent/ADMIN-AGENT.md` §14.2 ∥ §16.1；先例批 = admin-agent-awareness ∥ server-wake-face ∥ admin-chat-creds-merge）；对齐 = 同法（动载/注入口/结果归一）；偏离 = A1 替换自建回灌形 ∥ A3 标记行落法（理由在册）。 |
| 4 | Doc-state（状态句） | 🟡 | `agent/ADMIN-AGENT.md:216`（§11.1）载「帧面/落库面无 reasoning 文本通道」，本批 A1 新增 `agent/ADMIN-AGENT.md:508` 的「回声道落库」（tool 轮 assistant 行 `data.reasoning`）——落库面将出现模型思考文本字段；该句未随正、亦未入 R73 随正清单。 | §11.1 句补指（tool 轮回声道除外——§17.3 A1）或将句登入 R73 随正件清单。 |
| 5 | Affected-file annotations | 🔵 | `run.mjs` 实读两处不一：批档 `:36`「`run.mjs`（实读 138 ⇒ ≈143）」vs `agent/ADMIN-AGENT.md:60`「实读 **137**」。 | 以当刻现读为准收平两处（本批 ≈+5 的基数同拍）。 |
| 6 | Doc-state（坐标） | 🔵 | 批档 `:11` 引「`docs/server/design/PROJECT.md` `:14` ∥ `:71` ∥ `:96` ∥ `:177`」四坐标现盘均不落 KD-SV-2 内容（KD-SV-2 全形现于 `design/PROJECT.md:131`），且未标 as-of。 | 坐标收正到现盘位置（或显式标注复核时点）。 |
| 7 | Affected-file annotations（拆档） | 🔵 | `chat.mjs` 本批估 ≈705（已越 500 软线）；批档 `:36` 未携拆档预案/触发状态——「拆档预案触发线 720」仅存于 `agent/ADMIN-AGENT.md:62` 行史，且越线后可执行的拆档内容无现载。 | 在本批行/§6 批块复述触发线与拆档对象（现估 705，距 720 余 ≈15）。 |
| 8 | Acceptance | 🔵 | `agent/ADMIN-AGENT.md:104`（④）含「3 连败 ⇒ 降级」，机制文 `agent/ADMIN-AGENT.md:520` 只引 `COMPRESS_FAILURE_LIMIT` 未载其值——机检数值来源不可对。 | 机制文补值来源，或验收句改「达核常量（`COMPRESS_FAILURE_LIMIT`，取件 = `@thincoder/core/context.mjs`）」。 |
| 9 | Requirements | 🔵 | 目标态四腿「agent 循环 ∥ 会话 ∥ 审批 ∥ 提示词装配 = 取核」（`docs/server/requirements/PROJECT.md:601`）中三腿有处置（§17.4 开放点①/②/③），「审批」腿无处置句（§5 仅载「交互审批/问询面（无人值守——工具不弹问、不自锁）」裁剪，未与目标态关链）。 | 在 §17.4 或边界处补一行处置指针（审批腿 = 随无人值守裁剪；取核腿若涉环体批再议）。 |

VERDICT: changes-required

计数：🔴 1 ∥ 🟡 3 ∥ 🔵 5

### 轮次 2（评审子代理）

**轮次 2（修复核验——承轮次 1 之 1–9；只验修复声明，未搜新问题面；四份在审档已通读现盘）**

| # | 轮1 判级 | 状态 | 核验证据（现盘逐条） |
|---|---|---|---|
| 1 | 🔴 | Fixed | 三处补指针、单源 = §17.3 A3：`agent/ADMIN-AGENT.md:161`「（notice 滤除；压缩会话以标记行代覆盖段——§17.3 A3）」∥ `:202`「（含图——KD-SV-109；压缩会话以标记行代覆盖段——§17.3 A3）」∥ `:94`（§7 旧判据行同指）；定义面 = `:521`——轮 1 之两说互异已消。 |
| 2 | 🟡 | Fixed | 七处收正 `:601`：`agent/ADMIN-AGENT.md:81`/`:286`/`:466`/`:549` ∥ `design/PROJECT.md:134`/`:737`/`:858`（均「目标态 = 需求 `:601`」形）；需求档现盘复核：`:600` = 盒内成员面句 ∥ `:601` = 16:40 管理面裁句。批档侧 = append-only 更正注（§1 `:19` ∥ §2 `:62`「前文不删行，以本表为准」）。 |
| 3 | 🟡 | Fixed | `agent/ADMIN-AGENT.md:473` 成形「最近先例」行：先例 = 件级核件复用既有形（§14.2 ∥ §16.1）∥ 先例批 = admin-agent-awareness ∥ server-wake-face ∥ admin-chat-creds-merge ∥ 对齐 = 同法 ∥ 偏离 = A1/A3 附理由指。 |
| 4 | 🟡 | Fixed | `agent/ADMIN-AGENT.md:217` §11.1 补指：「（例外 = 落库面 tool 轮回声道——§17.3 A1；…）」。 |
| 5 | 🔵 | Fixed | `agent/ADMIN-AGENT.md:60` = 「实读 **137**」；批档 §2 修复表 `:56` = 「实读 137 ⇒ ≈142（内容行口径——与 `agent/ADMIN-AGENT.md:60` 同值；+5 增量不变）」＋ `:62` 覆盖前文「138 ⇒ ≈143」；`:81` 分项 `≈+5` 同拍（137＋5＝142）。 |
| 6 | 🔵 | Accepted | §1 `:19` 更正注 = 「以现盘为准（复核时点 = 2026-10-13 12:0x）」——「显式标注复核时点」支成立；设计档侧全扫零同形引用（修复表 `:57`）。 |
| 7 | 🔵 | Fixed | `agent/ADMIN-AGENT.md:82` 拆档状态复述：「拆档预案 = 触发线 **720**（现距 ≈15），越线即执行 = 唤醒径整段抽 `chat-wake-turn.mjs`（预案先例 = server-wake-face 批 §2）」。 |
| 8 | 🔵 | Fixed | 值源双落：`agent/ADMIN-AGENT.md:105`「3 连败〔= 核常量 `COMPRESS_FAILURE_LIMIT`——取件 = `@thincoder/core/context.mjs`〕」∥ `:522`「（= 3——取件 = `@thincoder/core/context.mjs`）」。 |
| 9 | 🔵 | Fixed | `agent/ADMIN-AGENT.md:533`「**审批腿（目标态四腿之一——已处置，非开放点）**：交互审批/问询面随无人值守裁剪（§5——工具不弹问、不自锁）；取核腿若涉环体批再议」；§17.4「开放点三条」计数不变（不冲突）。 |

**残留字面（非未决）**：批档 §1 `:17` ∥ §2 `:36`/`:46` 旧字面 `:600`、`:38` 旧值「138 ⇒ ≈143」——append-only 体制下由覆盖注 `:19`/`:56`/`:62` 逐条接管，已在册且指向正确。

**新问题**：零（修复均为指针/值源补笔——未见新矛盾、新缺口或新 🔴）。

VERDICT: pass

计数：轮 1 遗留 9/9 核销（🔴 1 = Fixed ∥ 🟡 3 = Fixed ∥ 🔵 5 = Fixed 4 ＋ Accepted 1）；新 🔴 = 0。

## §4 用户批准（主 agent）

**§4 批准（父侧代签——2026-10-13 12:40）**：依据 = 用户 2026-10-13 12:15「马上收口，别挂着」+ 12:16「自动跑，别等我」（全链授权：评审 ∥ 代签 ∥ 派实施全自动）。批准面 = 本批设计（评审轮次 1 changes-required（🔴1）→ 修复轮（席 #12）落毕 → **轮次 2 核验 pass（9/9 修复核销）**——token 已签发）；实施派单 = eng-coder（随本段落笔后当日派；凭据不入档）。

## §5 实施记录（eng-coder）

**§5 实施记录（eng-coder · 2026-10-13）**——批 `2026-10-13-server-core-unification` · 台账 #1239 · 设计 = `docs/server/design/agent/ADMIN-AGENT.md` §17（评审轮 2 pass）

**交付摘要**
- **A1 工具轮回灌形（取核）**：新档 `thincoder-server/src/agent/chat-compact.mjs`（`assistantTurnOf`）——tool 轮 assistant 消息由核件 `assistantToolCallMessage` 构造（回声族携 `reasoning_content`〔缺值 ⇒ `""`〕；`extra_content` 在场才带）；落库 `data.reasoning` ∥ `data.toolCalls[].extraContent`，回放逐值重建。**两 face 共用**：`chat.mjs:587`（会话面）∥ `run.mjs:121`（任务面——规格随出口 `exit.spec`，`run.mjs:52`）。
- **A2 历史修复（取核）**：`chat.mjs:463` 装配期对回放段施用 `repairHistory`（核件原文；常态返回同一数组）；缺核 ⇒ 原样。
- **A3 上下文压缩（取核）**：`chat.mjs:519-541` 回合起跑段（本轮消息与投递落库后、模型调用前）；专用垫片（`traces` 关 ∥ `tasks: []` ∥ `_lastCompressInfo` 复位辨缩减路径）；标记行落库 `role="user"` + `data.kind="compaction"` + `data.covers=[首,尾]`；回放面 = `chat-store.mjs`（覆盖段以标记代；嵌套消解）；覆盖区间 = 压缩前后差分求（并入支：原内容为尾段 ∥ 空内容 ⇒ 调用面逐值同）；失败链 3 连败（核 `COMPRESS_FAILURE_LIMIT`）⇒ `compressFallback` 同出标记面；阈值 100_000 = 核缺省镜像；摘要调用经出口（`modelExit.provider` ⇒ `usage` 行可归因）；可视面 = `onCompressStart` ⇒ 一条日志（不产帧）。
- **缺核降级**：三面各自退中性（自建形回落 ∥ 修复跳过 ∥ 压缩跳过），一面一条警告；**核件成员级形校验**（导出缺失/常量非正整数 ⇒ 按缺核处置）＋ 核件运行期抛 ⇒ 自建形回落——回合不阻断。
- **随正件**：`thincoder-server/README.md:13`「零依赖 ⇒ 装机无 install 步」句随正（现文 = 装机随包解析依赖 `@thincoder/core` ∥ `@thincoder/render-core`）。

**改动清单（实读）**：`chat-compact.mjs` 新档 **334** 行 ∥ `chat.mjs` **692**（净 ≈+2）∥ `chat-store.mjs` **247**（净 ≈+90——回放面迁入）∥ `run.mjs` **150**（净 ≈+13）∥ `README.md` ±1 句 ∥ 批内件 `docs/batches/2026-10-13-server-core-unification.test.mjs` **486** 行；`package.json` ±0（设计同拍）。

**决策透明表**

| # | 决策 | 理由与代价 |
|---|---|---|
| 1 | 回放面（`replayEntriesOf`/`replayMessages`/`messageOfRow`）由 `chat.mjs` **迁入** `chat-store.mjs` | 设计「落点（实施定）= chat-store 回放面 ∥ chat.mjs 装配点」允许；迁出 ≈40 行使 `chat.mjs` 停 692（设计 720 拆档线距 28 未越——**未拆档**）。代价 = 设计估 `chat-store` +30 ⇒ 实 +90（行账差见披露） |
| 2 | `buildTurnMessages` 删除 | 唯一调用点被新装配（A2/A3 感知）替换；全树 grep 零消费——免两条装配路径并存 |
| 3 | `run.mjs` `buildModelExit` 出口挂 `exit.spec` 属性 | A1 任务面需核规格（§17.2 明列 `run.mjs` 自建形替换）；`exit` 调用语义零变（仅增属性）——「run 任务面出口零触」按「改道/行为」解读（内部审计同判） |
| 4 | 自建回落形空文本归 `null` | 与核件同式（`model-specs.mjs:358`）⇒「有核 ∥ 缺核」两形同判；既有测试零断言该位 |
| 5 | `extraContent` 假值按「不在场」归一（现场 ∥ 落库 ∥ 回放三面同判） | 核件按真值判（`model-specs.mjs:362`）；原按 null 判 ⇒ 假值角「落库 ∥ 回放逐值」不成立（评审 🟡#2 采纳） |
| 6 | 压缩垫片 provider = `deps.compactProvider ?? modelExit.provider` | 生产 = 出口同源 loopback（`chatProviderIndex`）；注入口供单测（免真 HTTP） |

**机检读数**
- 本批单测档：`node --test docs/batches/2026-10-13-server-core-unification.test.mjs` ⇒ **10/10 绿**（① 件清单 ∥ ② A1 三腿 ∥ ③ A2 ∥ ④ A3 三腿 ∥ ⑤ 缺核 ∥ ⑥ 取件面）。
- 既有相关件回归：`admin-agent-chat` ∥ `admin-agent-awareness` ∥ `server-wake-face` ∥ `admin-chat-creds-merge` ⇒ 同批跑 **71/71 绿**；UI 腿 `admin-agent-chat-ui` ∥ `chat-shell-align-ui` ∥ `console-chat-live-step` ∥ `chat-shell-align` ∥ `async-delivery-formalize` ∥ `timer-completeness` 均绿。
- 核侧零改（⑥）：`git status --porcelain -- thincoder-core/model-specs.mjs thincoder-core/agent/helpers.mjs thincoder-core/context.mjs thincoder-core/token-window.mjs thincoder-core/compress-form.mjs` ⇒ **零输出（零 diff）**。
- 预存红（**非本批引入**——断言对象均非本批改动件：库版本 ∥ `package.json` 链目 ∥ 工具件计数）：`console-reasoning-levels`（`buildChatExit` 直调缺 `createdBy` + v16↔v19 库版本）∥ `runner-admin-console-agent`（库版本 + `prepublishOnly` 链目）∥ `admin-agent-chat-tools`（七↔八件）∥ `console-chat-align`（档目 50↔51）。旧件不扫绿。

**审计与代码评审轮次与终态**
- **内部背离审计（explore，只读）**：轮 1 ⇒ `DEVIATIONS`——🟡 差分并入支空内容角（覆盖区间多含尾首行 ⇒ 回放丢工具对）∥ 🔵 `onCompressStart` 未落地 ∥ 🟡 文档回填 + 备注（`replayMessages` 未用导入）。
- **fix round 1**（自修，全采纳）：并入支补空内容结构判（该角新增机检腿，红→绿）∥ `onCompressStart` 落地 ∥ 未用导入删 ∥ 本段 §5 + 行账回填。
- **内部代码评审（advisor，独立只读）**：轮 1 ⇒ **VERDICT: pass**（🔴 零；🟡 2 项可选 + 🔵 5 项 + 🔵 报告面 2 项）。
- **fix round 2**（采纳评审可修项）：核件**成员级形校验** + 运行期抛 ⇒ 自建形回落（🟡#1）∥ `extraContent` 假值归一（🟡#2）∥ 机检 leg① 改「动态 import 形」判据 ∥ leg⑤ 计数断言解耦环境（🔵#8/#9）。
- **终态 = `clean`**：全部发现处置或如实登记，无未决 🔴；残余项 = 观察/建议面（随交付报告披露）。

**未做/不纳入（如实登记）**
- 环体取核（`runAgent`）∥ 提示词装配 ∥ 会话面 = 设计 §17.4 开放点（配套核批承接）——本批不做（设计范围）。
- 核件占位行不入库的残差（同回合机器线含核件合成占位 ∥ 次回合回放线无该行——形状差、无协议影响；评审 🔵#6）。
- `run.mjs` 无 `log` 透传（任务面缺核警告静默——评审 🔵#5）——未改（涉 run 面签名面，留父侧裁）。
- 环体/设计档行账回填（`chat-compact.mjs` 334 vs 估 ≈90 ∥ `chat-store.mjs` 247 vs 估 ≈185 ∥ `chat.mjs` 692 vs 估 ≈705 ∥ 单测档 486 vs 估 ≈350）= eng-designer 面，本席未改（评审 🟡#4）。

**上抛/知会**：无未决上抛（两项留父侧裁：`run.mjs` 签名面 `log` 透传 ∥ 设计档行账回填节拍）。

## §6 验证与收口（父代理）

**§6 验证与收口（父代理 · 2026-10-13 13:3x）**

**角色表**：设计 = eng-designer（§2 + 收正轮 #22）∥ 实施 = eng-coder #15 ∥ 评审 = 本档 §3（pass——实施凭批准设计 token 派发在案）∥ §4 = 父侧代签 ∥ 收口 = 父侧。

**实施核读（父侧）**：`chat-compact.mjs` 全文对位（A1 回灌 + 缺核自建回落 ∥ A2 修复 ∥ A3 压缩/降级/标记面 ∥ 懒载缓存 + 成员级形校验 ∥ 缺核三面退中性）；接线对位（`chat.mjs:43`/`:461` ∥ `chat-store.mjs:159-234`（标记解析 + 覆盖段回放） ∥ `run.mjs:10`/`:14`）；批内件 **10/10**（父侧复跑）；**核面零改** = `git status --porcelain` 五件（`model-specs` ∥ `agent/helpers` ∥ `context` ∥ `token-window` ∥ `compress-form`）**零输出** ✓。

**设计收正轮（#22 · fix）**：五条全落并核读——§6 行账回填（`ADMIN-AGENT.md:81-85`——334/692/150/247/486 ∥ 拆档句：未越 720）∥ §17.3 缺核降级与警告面句（`:529`——run 任务面警告静默）∥ 四披露对位（`:513` exit.spec plumbing ∥ `:517` 回放面迁入 `chat-store.mjs` ∥ `:522` 垫片 provider 注入口 ∥ `:523` 压缩可视面 = 日志不产帧）∥ 批档 §2 补正块（`:68-84`）∥ 变更记录（`:552`）。机检前后同基线：悬空 **11** ∥ 行宽 **2**（三档零新增）。

**父侧机械收正（直接执行 · 可 revert）**：`ADMIN-AGENT.md:514` 证据句 as-of 标注 + 实施后改指（自建形现存 = `chat-compact.mjs:149-158`〔缺核回落位〕）；板档 `PROJECT.md:738-741` 行账回填（agent ≈+140 ⇒ 实读 **≈+439**；批内件 ≈350 ⇒ **486**）+ 738 折行（行宽回基线）。复跑：批内件 **10/10** ∥ `doc-check` 悬空 11 ∥ 行宽 2。

**上抛处置（四条全闭）**：① §17.3 A1 证据坐标因实施落定而陈旧 → as-of 标注 + 改指（父侧机械）；② 板档行账回填 → 已落（父侧机械）；③ `run.mjs` 并发改笔（`TRIMMED_FACES` 增 `team_ledger`——team-ledger 批在途）→ 知会（本批回填值 = 实施落点读数，不动）；④ 批档 §2 自引行号 `:36` ⇒ `:38` → 已由 #22 收正。

**台账结算**：#1239 —— **追认核销**（待设计 ⇒ 已核销；依据 = 本 §6——行态遗留补结算）。关联行（#1282 ∥ #1325 ∥ #1326 ∥ #1224）不动（各自批次面）。**#1353**（发布/装机自洽——归批）在案。

**范围外（父侧路由）**：`.wt-head-probe`（仓外孤儿探针树——已报用户待裁）∥ 批内件陈旧值漂移（台账 #1354——含本批报的预存红 4 件：`console-reasoning-levels` ∥ `runner-admin-console-agent` ∥ `admin-agent-chat-tools` ∥ `console-chat-align`）。

**冻结**：本档全段冻结；后续改动走新批新档。
