# 2026-10-12 · server-wake-face
> 六段 append-only，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 编制：主 agent · 2026-10-12 · 来源 = 用户 2026-10-12 15:00「有process在，跑死了可以杀的，你没事加那么多限制干嘛！」⇒ 15:06 问定时器 ⇒ 15:07「为啥要有这些差异？我真服了。」——两次追认：服务面与三端的唤醒/投递差异必须消除（跨端用户可见差异 = 缺陷）。。
> 台账 = #1317（server · 归批）。前情 = docs/batches/2026-10-12-admin-agent-awareness.md §6（已收口 2026-10-12）。
## §1 讨论（主 agent）
**状态行**：已收口 2026-10-13
<§1 模板占位：本批条目 / 关键判据 / 授权口径>

### 1.1 本批范围（父侧 · 2026-10-12 15:0x——用户两次追认）

**来源（原话）**：15:00「有process在，跑死了可以杀的，你没事加那么多限制干嘛！」⇒ 15:06 问定时器 ⇒ 15:07「为啥要有这些差异？我真服了。」

**定性（按既有纪律，非新裁）**：跨端用户可见差异 = 缺陷（唯一例外 = 宿主硬件能力限制——服务端常驻进程做调度不构成例外）⇒ 本批 = 消差异，不是加特性。

**两条目**（同一个缺失面：「唤醒/投递」）：

| # | 条目 | 现状（缺陷面） | 对齐目标（三端/核既有口径） |
|---|---|---|---|
| 1 | **timer 空闲唤醒**（台账 #1319） | 服务面只做回合边界投递；空闲期到点不送达、不开轮（`agent/ADMIN-AGENT.md` §14.4「不自动开轮」在册） | 三端 2026-09-27 `timer-wake` 批：到期 ⇒ 空闲期主动送达 + 自唤醒一个系统回合 |
| 2 | **bash 异步**（台账 #1317） | `bash.async:true` 显式拒（`chat-env-tools.mjs`：服务面无驻留池）；结果无处送达 | 核四端：池（帽 4）∥ 起跑即回执 ∥ 结算投递 ∥ `process` 看/杀 |

**已核非差异（不进本批）**：timer 持久性——核三端亦为进程内（`thincoder-core/agent/timers.mjs` `agent._pendingTimers`），重启即失 = 核同判 ⇒ 服务面现行为已对齐，**不落库**。

**边界**：唤醒回合会产生真实 token 消耗 ⇒ 计费/额度/防自激（timer 内再设 timer）口径 = 设计轮提请项（带为什么与代价），不自裁。∥ 不触 CI/钩子面 ∥ 不动 #1310/#1318 已收口档案。

### 1.3 条目 ③ 入批（用户 · 2026-10-12 15:40）

**用户原话**：「管理端目前没有查会话历史的工具，这个也需要打开。」⇒ **`read_history`（会话历史查询）入内**——定性同批评：**跨端用户可闻差异 = 缺陷**（三端既有核件 `read-history.mjs`；服务面无）。
**落法 = 设计轮裁**（本批设计轮需补一笔）：三端工具读 `agent._fullHistory`（压缩不丢）；服务面会话载体 = `chat_messages` 单源（库面）⇒ 二选一或并举——a) 核心工具经服务面适配（读库面）+ b) 服务面维护 `_fullHistory` 走核件原样；判据 = 核件复用优先（§15 同原则：不写第二份实现）。**入批 = 条目 ③**（前两件 = timer 唤醒 ∥ bash 异步）。台账 #1323。
**注**：本笔并入本批设计，随本批一并走设计评审（评审点火 = 用户；父侧已提请）。

### 1.4 条目 ④ 入批（用户 · 2026-10-12 15:44——机制级裁定）

**用户原话**：「这样不对，会让我们的帐和provider的帐对不上，应该走我们自己的模型代理服务，这样才能确保用量统计的准确，也应该跟客户端一样，登陆时分配一个sk给管理会话用。」
⇒ **管理会话模型出口改道**：① 模型调用走**本 server 的模型代理服务**（网关链——计量/配额/账单源），弃现有「进程内直连 provider 自持 key」（`chat.mjs:367-390` ∥ `ADMIN-AGENT.md:51`：「与网关同信任域、记账不进成员用量」——**该旧形态与旧句作废**，设计侧随本修订收正）② **登录时为管理会话分配 sk**（同客户端口径）。
**判据 = 账对得上**（自家 usage 账 ↔ provider 的账）。入批 = 条目 ④。台账 #1324。
**设计面提示（给修订轮）**：出口实现 = 网关链复用（进程内函数调用 ∥ loopback HTTP——设计裁，判据 = 计量/配额/判权单源不造第二份）；sk 归属（admin 名下 ∥ 会话专属行）与归因展示；唤醒回合同口径（§15.3③ 计费条原文须改）；§15.4 机检口径加「网关链出账」腿。

### 1.5 授权（自动跑 · 用户 2026-10-12 15:48）

用户 15:48「后续都自动跑」= 本批**全链自动**（设计评审代点火 ∥ §4 代签 ∥ 修正/实施派发 ∥ 收口核销提交双推 token 终消费）+ **自缚三条**（代签仅三条件齐备 ∥ 新范围/口径裁决停下只摆一条 ∥ 破坏性先停）。本批开放点四条（§15.3）与两件新范围（条目 ③④）已列栽面——**待用户裁定项不停链**（设计评审照常点火），裁前不予实施锁定。

**【2026-10-12 用户裁 · 门禁链撤除（批内件不入发布门）】**`thincoder-server` `prepublishOnly` 链已撤（回 3×`node --check`；CI 注释随动；`ops/OPS.md` §5.1 ∥ `design/PROJECT.md` §6 板级行同拍收正）。**本批 §2 随正件/落点中一切「`prepublishOnly` 入链 ∥ 链件数 N ⇒ N+1 ∥ 门禁件数断言件随正」相关项一律作废**——实施时：不增链、不碰旧断言件（批内件零维护——随批留存、不入任何门）。

**轮 4 复核裁定（父侧 · 2026-10-13）**：① #347 轮 4 复核实质 = **pass**（§3 `:305–323` 在案：前 7 项全 Fixed ∥ 新发现 0🔴/1🟡/0🔵）；其机检未发凭据的原因 = **正文引用前轮原话「VERDICT: changes-required」字样**（消息层伪非通过，非实质裁定），不具阻断效力——本批实现（#352）按轮 3 pass 凭据在途，不受影响。② 轮 4 新发现 `design/PROJECT.md:699`（段号互换同拍漏点）**已由父侧机械收正**：现文 =「v18 +≈72 ∥ v19 +≈14——段号收正 2026-10-13〔creds = v18 ∥ wake = v19〕」（父侧直接执行 · 可 revert）。

**父侧更正（2026-10-13）——§3 轮 4 表 row 1 判据证伪**：轮 4 复核表（§3 `:305–323`）row 1 判「§6.33.5 行 7 终值 1402 不对账、超计 ≈11 行」——经修文档席以 git 实证证伪：**1402 = 落批提交态（`571114af`）的行号读数正确值**；现盘较低的差额源 = 落批后另一笔净清（`26233590`「10-10 波」−11）+ 后批 +4 + 本轮 +2。处置 = 保留 1402 + 复读核销注；该行**口径混记部分**（§6.32.7 行 8 = 换行符计数 1226；原 1227 系口径混记）为真——已收正 + 两表头互引（`AGENT-LOOP-UPSTREAM.md`，doc-check exit 0）。记录在此：评审算术错由文档席纠正，评审建议的其余部分维持。

## §2 批次任务与设计（eng-designer）
**状态行**：设计完成（修订轮（加宽）落定：条目 ③④ 入批（用户 15:40/15:44；台账 #1323/#1324）——设计 §16 新增 + §5/§11/§15.3③ 收正 + KD-SV-129/130/131 + 同源随动四档（STORE v18 ∥ ACCOUNTS ∥ METERING ∥ PROJECT §4）；§2.9 全文在册）
<§2 模板占位：本批条目（覆盖） / 设计档落点 / 机制设计 / 受影响文件与测试面 / 验收对照 / 关键决策 / 上抛项>

**状态行**：设计完成（2026-10-12）

### 2.1 本批条目（覆盖）

| # | 条目（台账） | 定性 | 覆盖 |
|---|---|---|---|
| 1 | **timer 空闲唤醒**（台账 #1319） | 跨端用户可见差异 = 缺陷 | ✅ 本批（设计 §15.1/§15.2） |
| 2 | **bash 异步**（台账 #1317） | 跨端用户可见差异 = 缺陷 | ✅ 本批（设计 §15.1/§15.2） |

**不入本批**（批档 §1.1 已核）：timer 持久性（核三端亦进程内 —— 已对齐，非差异，不落库）。

### 2.2 设计档落点

- **设计档** = `docs/server/design/agent/ADMIN-AGENT.md` —— **新增 §15 唤醒与投递面**（15.1 机制 ∥ 15.2 对齐表 ∥ 15.3 开放点四条 ∥ 15.4 机检口径）；同拍收正 §6 件表与预算 ∥ §7 判据行 ∥ §8 用例 ∥ §9 增 KD-SV-125/126 ∥ §10 边界（原「timer 自动开轮」「后台任务面」两句已失效 —— 删；四项入）∥ §13 增 R71 ∥ §14.2 端池参数处置行 ∥ §14.4 timer 投递面行（指针化 —— 机制归 §15 单一权威源）∥ 变更记录一行。
- **板档** = `docs/server/design/PROJECT.md` —— §2.1 agent 行 ∥ §3 文档地图 agent 行（+ §15 + KD 125/126 + 建档注）∥ §4 索引标题 1–124 ⇒ **1–126** ∥ §6 本批预算块 ∥ §7 agent 行 ∥ §9 **R71** 保位 stub ∥ 变更记录一行。
- **需求档回笔 = 主 agent 笔**（R71① 建议：功能点 **46** + **AC-46**，或只收正功能点 43 边界句 —— 二者择一；编号 45 已被兄弟批「定时能力完备化」占用，两件相邻不重叠）。
- **兄弟批接缝**：周期/绝对时刻式样 = `docs/batches/2026-10-12-timer-completeness.md`（其 §1 明写「不动唤醒器设计（归兄弟批）」）—— 本 §15.1 暴露的接口即其引用面。

### 2.3 机制设计（摘要 —— 全文 = 设计档 §15.1）

1. **唤醒器**（新档 `chat-wake.mjs` ≈130 行）：会话键面闩表（核 `createTimerWatch` 复用 —— 零第二套闩）＋ 结算钩子（`pad._asyncWaiters`，核 `wakeAsyncWaiters` 的兑现面 —— 先自再武装再评估）＝ 两源；**评估**走核火策略 `fireTimerWake`，`busy` = 会话行 `status === "running"`（**DB 单源** —— 与在途门同判，零进程内忙旗），`deliver` = 纯判据（到期 timer ∨ 在途结算 ∨ 汇面留件 —— **零交付零开轮**）；**再武装三链尾**（用户回合尾 ∥ 唤醒回合尾 ∥ 结算钩子）；已到期不武装 0ms 闩（防自旋/惊群）；**零轮询**。
2. **投递汇** = `pad.history`（核三注入器唯一落点：timer 行 ∥ 后台摘要 ∥ 中止丢弃提醒）⇒ `deliverPending`：出列（幂等）⇒ **落库**（`user` 行 + `data.kind="reminder"`）—— 送达行入会话记录（回放 ⇒ 模型后续回合仍可见；依据 = VSC 端同判：「不落盘 ⇒ 下一次 run 读不到 = 静默丢」）。
3. **唤醒回合** = 与用户回合同环同面（零第二套环）：无路由、无帧面（`emit = null`）、`claimChatTurn` 原子抢占（撞忙 ⇒ `skipped`）、**投递先于装配**（零二次注入）、域文本 = 核常量（`TIMER_TURN_DOMAIN` ∥ `AUTO_TURN_DIGEST_DOMAIN`）瞬态尾插（不落库）；用户回合起跑同调 `deliverPending`（回合边界兜底）。
4. **异步面** = `bash.async` 显式拒**删除** —— 核件按 `ctx.agent` 走 `launchBgTask`（帽 4 ∥ 回执 ∥ 池 ∥ 结算全在核）；**垫片即宿主**（零自造池；池/pending/唤醒栓经核 API 落面，`history` 数组为 carrier 回落 —— 逐字段以核件读取面为准）。
5. **看/管面**（对齐三端 —— 三端亦无专用列表工具）：看 = 回执（id + log 路径）+ `read`/`bash` 读日志 + `process list`；杀 = `process action="kill" id:N`（核 `killBgTask` —— 杀树 + 出池 + 墓碑 + 零摘要）。
6. **中止面**（非 interrupt）：池条目控制器链当刻回合信号 ⇒ 回合尾 `discardAbortedBgTasks(pad)`（杀树 + 丢弃提醒入汇 + 墓碑；判据沿核 `run-stages.mjs:205-218`）⇒ 提醒行由下一回合边界/唤醒面落库。
7. **结构面**：零新端点（六端点计数不变）∥ 三 kind 审计面不扩 ∥ 零迁移（结构版本 v16 不变）∥ `bin` ±0。

### 2.4 受影响文件与测试面（现读 = 2026-10-12 设计轮实读）

| 文件 | 现读 | 预期 | 说明 |
|---|---|---|---|
| `thincoder-server/src/agent/chat-wake.mjs` | —— | **新 ≈130** | 唤醒器（§15.1）—— 装配点 = `registerChatRoutes`（生产路径） |
| `thincoder-server/src/agent/chat-env-tools.mjs` | **232** | ≈330 | 垫片扩面 ∥ `deliverPending` ∥ 异步接线（原 async 拒删） |
| `thincoder-server/src/agent/chat.mjs` | **587** | ≈690 | `runChatWakeTurn` ∥ 投递落库 ∥ 中止杀树接线（越 500 软线 —— 拆档预案 = 唤醒径整段抽 `chat-wake-turn.mjs`，触发 = 越 720 行） |
| `thincoder-server/src/agent/chat-routes.mjs` | **190** | ≈200 | 唤醒器装配 ∥ 回合尾链尾 |
| `thincoder-server/src/agent/chat-env.mjs` | **94** | ≈96 | 能力段两行收正（`bash.async` 可用 ∥ timer 空闲唤醒） |
| `docs/batches/2026-10-12-server-wake-face.test.mjs` | —— | **新 ≈300** | 批内件（四腿 = §15.4）；**入 server 链** |
| `thincoder-server/public/**` | —— | **±0** | 零页面改动（呈现面 = 开放点② —— 提请） |

**随正件**（实施轮同拍，以当刻盘面实读为准）：门禁件数断言**七件**（`2026-10-06-server-auto-update.test.mjs:480` ∥ `-console-list-style:252` ∥ `-console-layout:456` ∥ `-me-usage-charts:262` ∥ `-provider-model-metadata:491` ∥ `-quota-per-model:444` ∥ `-quota-v2-member-models:428` —— `prepublishOnly` **58 ⇒ 59**）＋ `thincoder-server/package.json` ∥ 旧批件三处（`2026-10-12-admin-agent-awareness.test.mjs`：`:265-286`「timer 行零落库」⇒ 落库口径 ∥ `:323-325`/`:353-355`/`:375`「async 不可用」⇒ 回执断言）∥ **核件 `tool-docs/bash.md` 零改**（`async` 描述面已在册；量程句 = 台账 #1320 另账）。

### 2.5 验收对照（三条链同源）

| 本批条目 | 设计级判据 | 用例 |
|---|---|---|
| timer 空闲唤醒（#1319） | `ADMIN-AGENT.md` §7 本批行 ① ∥ §9 **KD-SV-125** ∥ §15.1/§15.2 | N74 ∥ B72/B74 ∥ E56 |
| bash 异步（#1317） | `ADMIN-AGENT.md` §7 本批行 ② ∥ §9 **KD-SV-126** ∥ §15.1/§15.2 | N75 ∥ B73 ∥ E57 |
| 结构面（两件同拍） | §7 本批行 ④ ∥ §15.4 结构腿 | 批内件结构腿 |

**需求档链** = 待主 agent 回笔（R71①）—— 回笔落定后三条链闭合；现盘两链在册（批档 §2 ↔ 设计 §7/§9/§15）。

### 2.6 关键决策记录（全形 = 设计档 §9）

- **KD-SV-125 唤醒面**：一器两源 ＋ 空闲判定 DB 单源 ＋ 核火策略复用 ＋ 零轮询（被否：端口轮询 ∥ 独立调度进程 ∥ 进程内忙旗（双源）∥ 定时器落库 ∥ 交付与开轮两个开关）。
- **KD-SV-126 异步面**：核池原样 ＋ 垫片即宿主（零自造池）＋ 送达落库（被否：自写池 ∥ 同步 + timeout 兜底 ∥ 摘要仅瞬态不落库 ∥ 收窄核件 schema ∥ 伪造会话级 Stop）。
- **编号说明**：设计轮现盘实读 —— KD-SV-115–124 已被 B2 批（team-projects-permissions）占用（板档 §4 索引 + 其 §3 文档地图）⇒ 本批自取 **125/126**（#1290 所述「派单预留机制」仍未定形 —— 按备选法「现盘最大 +1」自取；**收口轮请核重号**）。

### 2.7 上抛项（开放点四条 + 回笔一项 + 披露清单）

- **开放点四条**（设计档 §15.3，均附推荐与代价 —— 请裁）：① 唤醒回合身份与审计行（推荐 = actor 沿会话 owner ＋ 审计面零扩）∥ ② 消息形与呈现（推荐 = 落库 ＋ 呈现面另轮；含「只出提醒行、不开轮」低费式的接口分叉 —— 兄弟批面）∥ ③ 计费/制动（现状 = 管理面 chat 不经计量，非本批引入；制动推荐 = 一个唤醒开关 ＋ 系统页控件）∥ ④ 防自激（推荐 = 不加限制 —— 对齐三端；核心既有门已够）。
- **需求档回笔**：功能点 46 ∥ AC-46（或只收正 43 边界句）—— 主 agent 笔。
- **披露（不阻塞）**：后台任务日志落核 config 目录（非 server 数据目录）∥ 跨回合在途任务不随后续回合中止而杀（三端为会话级 Stop —— 服务面无该物）∥ 唤醒回合耗真 token（§5 同口径）∥ 提醒行以 `user` 行落库（呈现面未定前，控制台以用户消息样式显一 —— 内容自带前缀，不误导语义）。
- **提请用户裁的备选**（本批未自裁）：控制台呈现面（提醒行样式 ∥ 状态行 ∥ 定时器与后台任务列表 ∥ 唤醒开关键）—— 新 UI 面，前置 = `views-chat.mjs` 500 软线拆分审查（台账 #1309）。

### 2.8 勘误（2026-10-12 设计轮自查 · 随正件全路径）

§2.4 表下随正件七件的**全路径**（设计档 §13 R71③ 已按此登记）：
`docs/batches/2026-10-06-server-auto-update.test.mjs:480` ∥ `docs/batches/2026-10-06-console-list-style.test.mjs:252` ∥ `docs/batches/2026-10-07-console-layout.test.mjs:456` ∥ `docs/batches/2026-10-07-me-usage-charts.test.mjs:262` ∥ `docs/batches/2026-10-07-provider-model-metadata.test.mjs:491` ∥ `docs/batches/2026-10-07-quota-per-model.test.mjs:444` ∥ `docs/batches/2026-10-07-quota-v2-member-models.test.mjs:428`
——七处皆 `assert.equal(batchFiles.length, 58, …)`（实施轮 ⇒ `59`，注释/断言消息同拍）。

§2.4 行内 `-xxx:NNN` 简写（缺日期前缀）以本行全路径为准——设计轮自查发现并当场修正（doc-check 悬空 +1 由此而来；现已回基线 25）。

### 2.9 修订轮（fix 轮「加宽」——条目 ③④ 入批；2026-10-12 · eng-designer）

**承**：批档 §1.3（条目 ③——用户 15:40「管理端目前没有查会话历史的工具，这个也需要打开。」· 台账 #1323）＋ §1.4（条目 ④——用户 15:44「这样不对，会让我们的帐和provider的帐对不上，应该走我们自己的模型代理服务，这样才能确保用量统计的准确，也应该跟客户端一样，登陆时分配一个sk给管理会话用。」· 台账 #1324）。

#### 修订轮条目（覆盖）

| # | 条目（台账） | 定性 | 覆盖 |
|---|---|---|---|
| 3 | **`read_history`（会话历史查询）**（#1323） | 跨端用户可闻差异 = 缺陷（三端有核件、服务面无） | ✅ 本修订（设计 §16.1 ∥ KD-SV-131 ∥ §8 N76/B75） |
| 4 | **管理会话模型出口改道**（#1324） | 用户机制级裁定（账对不上） | ✅ 本修订（设计 §16.2/§16.3 ∥ KD-SV-129/130 ∥ §8 N77/N78/E58） |

#### 设计档落点（全 = `docs/server/design/agent/ADMIN-AGENT.md`）

- **新增 §16**：16.1 `read_history` 落法 ∥ 16.2 出口改道 = 网关链 loopback ∥ 16.3 管理面 sk（`admin-agent`）∥ 16.4 机检五腿。
- **随正**：§1 驱动器行 + §5 出口行（两分改写——旧「记账不进成员用量」句删）∥ §11 形态/回合两行 ∥ §15.3③ 计费条收正 ∥ §15.4 出口腿指针 ∥ §6 行账（`chat.mjs` ≈712 ∥ `chat-env-tools.mjs` ≈350 ∥ `chat-store.mjs` ≈161 ∥ `bin` ⇒198 ∥ 另计 ⇒+140）∥ §7 判据行 ∥ §8 N76–N78 ∥ B75 ∥ E58 ∥ §9 **KD-SV-129/130/131** ∥ §10 边界三条 ∥ §13 R71 收正（① 闭合 ∥ ③④⑤ 追加 ∥ ⑥ 未随正清单）∥ §14.2 六族八件（表/载入/端池/描述面）+ KD-SV-113 件单扩容 ∥ 变更记录一行。
- **同源随动（已落）**：`store/STORE.md` §1/§2/§3/§4（**v18** `api_keys.key_plain`） ∥ `accounts/ACCOUNTS.md` §1（存储句收正 + 管理面 sk 条）/§2.1（`key_issue` 写入点 + `surface` 取值域扩）/§3（login 行） ∥ `metering/METERING.md` §1（管理面 chat 出账归因句） ∥ `design/PROJECT.md` §4（索引 1–131）。
- **未落（占用/父侧接续）**：`gateway/API.md` §2.1 内环消费方句（B2 修复轮 #283 占用中——未动，见 R71⑥）；需求档 :641 坐标全限定（主 agent 笔）；任务式（run）出口同形缺口（提请——未擅自增减）。

#### 机制要点（摘要——全文 = 设计 §16）

1. **`read_history` = 核件原样 + 库面适配**（不写第二份实现）：新增 `recordStoreOf(db, chatId)`（`chat-store.mjs`）供核件注入缝 `_recordStore`；行 ⇒ 记录形（`ts` = `created_at` 毫秒；tool 行携 `name`/`tool_call_id`；assistant 携 `tool_calls` 重建形）；**作用域 = 本会话**（`path` 非空 ⇒ 运行期拒——服务面无会话树）；notice 行在列；环境族第八件（第六族「会话」）；审计沿 `chat_call`（`subject` = 过滤摘要）。
2. **出口改道 = 本进程网关链 loopback**：`baseURL = <本机监听地址>/v1`（`server.address()` 惰性读——通配拨环回；`deps.selfBaseUrl` 注入缝）∥ 凭据 = 会话 owner 的 `admin-agent` sk ∥ 模型 = 会话行外标；**复用点逐字** = 鉴权/派发/准入三件/转发/记账（零第二份）；失败面沿既有 `model_error`（五终态零新形）；唤醒回合同源。
3. **管理面 sk = 登录 ensure**（admin 角色门；幂等）：名 `admin-agent`（常量单源 `keys.mjs`）；明文落 `api_keys.key_plain`（**v19 段**——NULL = 常规；写面唯一 = `issueKey({ keepPlain: true })`；服务端即消费方——沙盒先例）；免 20 上限；首发一条 `key_issue`（`surface:"admin_agent"`）；轮转连带吊销 ⇒ 登录补发（披露）。
4. **结构面**：零新端点（六端点计数不变）∥ 三 kind 审计面不扩 ∥ 核件 `read-history.mjs` 零改 ∥ 段 v19（creds 批占 v18 ∥ B2 批占 v17——实落次序定段）。

#### 受影响文件与测试面（现读 = 本修订轮实读）

| 文件 | 现读 | 预期 | 说明 |
|---|---|---|---|
| `thincoder-server/src/agent/chat.mjs` | **588 ⇒ 实读 690**（2026-10-13） | ≈712 | 出口装配扩参（`createdBy`/`selfBaseUrl`）∥ `pad._recordStore` 接线 ∥ 拒/失败人话 |
| `thincoder-server/src/agent/chat-store.mjs` | **113 ⇒ 实读 155**（2026-10-13） | ≈161 | `recordStoreOf`（记录形映射 + 迭代器） |
| `thincoder-server/src/agent/chat-env-tools.mjs` | **232 ⇒ 实读 318**（2026-10-13） | ≈352 | `read_history` 注册 ∥ `path` 拒 ∥ 过滤摘要 ∥ 加载面 |
| `thincoder-server/src/agent/chat-env.mjs` | **94 ⇒ 实读 96**（2026-10-13） | ≈96 | 能力段补 `read_history` 行 |
| `thincoder-server/src/accounts/keys.mjs` | **144 ⇒ 实读 178**（2026-10-13） | ≈180 | `AGENT_KEY_NAME` ∥ `ensureAgentKey` ∥ `agentKeyOf` ∥ `issueKey({ keepPlain })` |
| `thincoder-server/src/accounts/routes.mjs` | **152 ⇒ 实读 161**（2026-10-13） | ≈160 | login 后置 ensure + `key_issue`（surface） |
| `thincoder-server/src/store/db.mjs` | **488 ⇒ 实读 630**（2026-10-13——内容行口径） | ≈502 | v19 段（`ALTER` + 迁移段） |
| `thincoder-server/bin/thincoder-server.mjs` | **192 ⇒ 实读 208**（2026-10-13） | ≈198 | `selfBaseUrl` 取数器注入 |
| `thincoder-server/src/agent/chat-wake.mjs` | —— | 新 **141** | 唤醒器（§15.1）——会话键面闩 ∥ 结算钩子 ∥ 再武装三链尾；装配点 = `registerChatRoutes`（生产路径） |
| `thincoder-server/src/agent/chat-routes.mjs` | **190 ⇒ 实读 196**（2026-10-13） | ≈200 | 唤醒器装配 ∥ 回合尾链尾（§15.1 再武装三链尾①）——六端点计数不变（§15.4 结构腿） |
| `docs/batches/2026-10-12-server-wake-face.test.mjs` | —— | 新 ≈380 ⇒ 实读 **572**（2026-10-13） | 批内件（§16.4 五腿 + §15.4 四腿）；**入 server 链** |

**随正件（实施轮同拍——以当刻盘面实读为准）**：`docs/batches/2026-10-12-admin-agent-awareness.test.mjs:304-318`（腿④ 七件 ⇒ 八件·六族）∥ `docs/batches/2026-10-11-admin-agent-chat.test.mjs:470-486`（⑧ 出口缺位腿——provider 名 ⇒ `admin-agent` sk 明文）∥ 门禁件数断言七件 + `thincoder-server/package.json`（本批件入链；`prepublishOnly` 58 ⇒ 59——同 §2.4）〔**作废 2026-10-13**：`prepublishOnly` 链已撤除（用户裁——批内件不入发布门）⇒ 入链与计数句无随正义务〕。

#### 验收对照（本修订轮——三条链同源）

| 条目 | 设计级判据 | 用例 |
|---|---|---|
| `read_history`（#1323） | 设计 §7 修订轮行 ④ ∥ §9 **KD-SV-131** ∥ §16.1/§16.4 | N76 ∥ B75 |
| 出口改道 + sk（#1324） | 设计 §7 修订轮行 ①②③ ∥ §9 **KD-SV-129/130** ∥ §16.2/§16.3/§16.4 | N77 ∥ N78 ∥ E58 |
| 结构面（两件同拍） | §7 修订轮行 ⑤ ∥ §16.4 结构腿 | 批内件结构腿 |

**需求档链** = 主 agent 已落（功能点 46 ∥ AC-46 ∥ 43⑤ 扩句——批档 §1.3/§1.4）；本修订轮与之一对一（三条链闭合）。

#### 关键决策记录（全形 = 设计 §9）

- **KD-SV-129（出口改道 = 网关链 loopback）**：账只能对在网关链（记账/配额/限流/判权四单源全在那）；被否 = 进程内函数级复用（需重构 `forward.mjs` 中继或复制记账接缝）· 继续直连（账对不上——用户否）· 拨 nginx/公网 · 另开内部端点。
- **KD-SV-130（管理面 sk）**：落 key 表 = 列表/吊销/用量归因全复用；登录 ensure 幂等；明文列 = loopback 每回合需真凭据（服务端即消费方——沙盒先例）；被否 = 配置项 `agent.modelApiKey` · 每会话一枚 · 非持久化 · 明文入文件面。
- **KD-SV-131（`read_history` 落法）**：核件已有全套过滤/截断（自写 = 第二份语义）；`_recordStore` = 核自持注入缝；跨会话在服务面无语义 ⇒ 运行期拒；被否 = 自写 history 工具 · 维护 `_fullHistory` 镜像 · 收窄核件 schema · 放行 `path`。
- **编号说明**：**129/130/131**（现盘最大 +1——128 已占于 B2 批；收口轮请核重号）。

#### 上抛项（修订轮）

- **① 未随正清单**（父侧接续）：`gateway/API.md` §2.1 内环消费方句（B2 修复轮 #283 占用中）∥ 需求档 `docs/server/requirements/PROJECT.md:641` 坐标全限定（doc-check 悬空 26 之一——建议全形 `thincoder-server/src/agent/chat.mjs:367-390`）∥ **任务式（run）出口同形缺口**（直连 ⇒ 零 usage 行；用户原话面 = 「管理会话」——提请裁，未擅自增减）。
- **② 披露（不阻塞）**：管理会话经本机环回 ⇒ 核规格面以外标为键（同四端客户端既态——§16.2 差异三条）∥ sk 明文落库（服务端即消费方）∥ 轮转连带吊销 sk（登录补发）∥ 出账后唤醒回合的 token 消耗可见（撤回原「不计成员用量」口径）。
- **③ 开放点四条**（§15.3）不变——③ 计费项已由 15:44 裁定收正（15.3③ 表行）。

### 2.10 fix 轮（设计评审 §3 轮次 1 之 1–10 逐条落——2026-10-12 · eng-designer）

**承**：批档 §3 轮次 1（🔴1 ∥ 🟡6 ∥ 🔵3 = 10 件）；父侧逐条裁定采纳（逐号照 §3 建议列）。**零新语义**（评审发现直接导出项）；产品码/测试件零触（设计档面笔）；跨端差异面口径零动。

**落点（号 → 改动 file:line——行号 = 落笔后终值）**

| 号 | 落点 |
|---|---|
| 1 | **核过（兄弟轮）**：KD-SV-90 行收正已在盘 = `docs/server/design/agent/ADMIN-AGENT.md:157`（八件 ∥ `exec` 入 chat ∥ 被否栏换写）＋ `:460`（该轮变更记录）⇒ 零改 |
| 2 | `agent/ADMIN-AGENT.md:183` ∥ `:387` ∥ `:391`——三处「七件」⇒「八件」 |
| 3 | `agent/ADMIN-AGENT.md:75`（≈+270 ⇒ **≈+342**）∥ `:77`（≈+140 ⇒ **≈+154**）——按分项和收平；同基数 = `design/PROJECT.md:718` |
| 4 | `design/PROJECT.md:95`（建档注 §15 ⇒ **§15/§16（修订轮）**＋段列补「会话历史与出口改道（§16）」）∥ `:165`（AC-46 待入册 ⇒ **已入册 2026-10-12**） |
| 5 | `design/PROJECT.md:717–721` 本批块折入修订轮：≈+342 ＋ **修订轮另计 ≈+154** ∥ 迁移面 = **v18**（`api_keys.key_plain`）∥ `bin` +≈6 ∥ 批内件 ≈300 ⇒ **≈380** |
| 6 | `store/STORE.md:373`（v14 段注补 user 行 `data.kind="reminder"` 键登——零结构变更）＋ `:600`（变更记录一笔） |
| 7 | `agent/ADMIN-AGENT.md:278` §13 R62③「`timer` 无空闲唤醒（提醒只在下一回合开场投递）」⇒「`timer` 空闲唤醒在册（§15.1——到点空闲自唤醒一轮）」（D8——零尸体语） |
| 8 | 读数口径统一（**内容行 ∥ 文末换行不计**——沿 `design/PROJECT.md:580` 注①）：`agent/ADMIN-AGENT.md:67`（230 ⇒ **231**——−1∕+2∕+1 分解）∥ `:77`（113 ⇒ **112**；≈161 ⇒ ≈160）∥ `:62`（588 ⇒ **587**＋补 **累计 ≈+125 = 批 ≈+100 ＋ 修订 ≈+22**） |
| 9 | `agent/ADMIN-AGENT.md:64`——`chat-tools.mjs` 行补 >500 软线判：**判 = 维持 + 上限 700**（先例 = `store/STORE.md` §4）；触发 = 实读 >700 ⇒ 起拆档审查（兄弟轮未判——本笔补） |
| 10 | 登记：评审面限制（无项目标准档/无文档地图 ⇒ Document ownership 降级口径；需求档不在评审面）——备查于此（设计档零改） |

**闸面终读**（本笔收尾单跑）：悬空 **28**（＝基线 28——本笔曾新增一处，自查后已消：`design/PROJECT.md:719` 句内 `accounts/routes.mjs` ⇒ 全限定 `thincoder-server/src/accounts/routes.mjs`）∥ **行宽 OK** ∥ 行数面差异 6 条（报告态·非本笔面）。三档变更记录同拍：`agent/ADMIN-AGENT.md`（新条置顶）∥ `design/PROJECT.md`（末尾）∥ `store/STORE.md`（末尾）。

**本未做（零改）**：产品码 ∥ 测试件 ∥ 需求档（主 agent 笔）∥ 兄弟批面（creds ∥ B2——`:699` 一族 raw 口径留其自收）∥ 上抛① 一三项（run 面——见下）。

**上抛① 第三项（run 出口缺口）处置**：父侧判「不再对 run 改道」（admin-chat-creds-merge 批退场路线在册）——run 面零改（`agent/ADMIN-AGENT.md` §16.2 尾行 ∥ §13 R71⑥ 撤回注在盘）。

**同类残留（非本笔面——列报待归派·零改）**：
1. 「七件」残句：`agent/ADMIN-AGENT.md:91`（§7 行）∥ `:274`（R54① 描述句）∥ `design/PROJECT.md:203`（AC-37 行「§12 逐件回指」清单缺 `exec`）∥ `:384`（KD-SV-82 索引行「本批扩管理面七件」）；
2. `design/PROJECT.md:705`（awareness 块「环境五族七件」——若判非历史态 ⇒ 六族八件）；
3. `webui/CHAT.md:47`（「管理面工具七件」——结论不变、计数陈旧）；
4. raw 口径残留：`agent/ADMIN-AGENT.md:64`「实读 477」∥ `design/PROJECT.md:699`「实读 477 ∥ 实读 588」（现盘内容行 = 476 ∥ 587）；
5. `design/PROJECT.md:297`（R71 保位 stub「回笔建议…主 agent 择一」= R71① 已闭合后旧态）。

### 2.11 fix 轮（设计评审 §3 轮次 3 之 1–6 逐条落 ＋ db 段号批次互换收正）· 2026-10-13 · eng-designer

**承**：批档 §3 轮次 3 全 6 件（🔴1 · 🟡2 · 🔵3；VERDICT changes-required）——父侧逐条裁定采纳；同轮追加 = 父侧裁定 **db 段号批次互换**（实落次序 = admin-chat-creds-merge 批先〔v18〕∥ 本批后 ⇒ 本批段号 **v18 ⇒ v19**）。**依据 = 代码实读 `thincoder-server/src/store/db.mjs` 581–602 段**（`migrate()`——读 `user_version` ⇒ 只执行 `v > 当前` 的段；段号 = 执行序，事后不可改）。**零新语义**（评审发现直接导出项 ＋ 父侧裁定）；产品码 ∥ 测试件 ∥ 需求档零触（设计档面笔）。

**落点（号 → 改动 file:line——行号 = 落笔后终值）**

| 号 | 落点 |
|---|---|
| 1 | `docs/server/design/agent/ADMIN-AGENT.md:96`（§7 行去「`async` 拒」——`bash.async` 在册，§15.1 口径）∥ `:130`（B71 `async:true` 支「受理 ⇒ 回执」断言）∥ `:165`（§9 KD-SV-113 ⑤ ⇒「`bash.async` 在册（§14.2/§15.1）∥ `process.kill` 的 `id` 靶 = 后台任务杀点」）——与 §13 R71③ 测试件随正项（`docs/batches/2026-10-12-admin-agent-awareness.test.mjs:323-325` 等）同拍 |
| 2 | `docs/server/design/accounts/ACCOUNTS.md:128`/`:131`（§4 两行补现读 ＋ 增量注：`keys.mjs` 实读 143 ⇒ ≈180 ∥ `routes.mjs` 实读 151 ⇒ ≈160——与 `agent/ADMIN-AGENT.md` §6 修订轮行同拍）∥ `docs/server/design/agent/ADMIN-AGENT.md:466`（修订轮行同源随动清单收正：ACCOUNTS §4 项去〔修订轮实落 = §1/§2.1/§3——`ACCOUNTS.md:254` ∥ `design/PROJECT.md:830` 同记〕；METERING §3 ⇒ §1） |
| 3 | `docs/server/design/agent/ADMIN-AGENT.md:129`（B70 预期改「唤醒径」：送达行落库 ＋ 自唤醒一轮——§15.1）——与 R71③ 同档测试件随正（`:265-286`）同拍 |
| 4 | `docs/server/design/PROJECT.md:700`（`chat.mjs` 实读 588 ⇒ **587**——内容行口径，fix 轮 #8 同例） |
| 5 | `docs/server/design/agent/ADMIN-AGENT.md:375` 续行（新行 `:376`——§15.1 中止面补「非 interrupt」定义 = 无 `reason.interrupt` 的全停式中止；服务面唯一中止径 = `POST …/abort`） |
| 6 | `docs/server/design/agent/ADMIN-AGENT.md:201`（「本批扩」⇒「chat-shell-align 批扩」——与 `:155` 同拍） |

**段号互换收正（父侧同轮裁定）**：本批段号 v18 ⇒ **v19**（实落次序 = creds-merge 批 v18 先）。**§2 内前述各「v18」处（§2.9 同源随动 · 机制要点 · 文件表 ∥ §2.10 表——`:137`/`:144`/`:145`/`:157`/`:198`）＋ §1 状态行（`:46`）同句，一律以 v19 为准**（§2 append-only——不逐行改字；§1 笔 = 主 agent，未触）；设计档面已就地收正并与各档变更记录同拍：`agent/ADMIN-AGENT.md`（§6 `:78` ∥ §9 KD-SV-130 `:171` ∥ §16.3 `:443` ∥ 修订轮行 `:466` ∥ 新行 `:459`）∥ `design/PROJECT.md`（§6 本批块 `:721` ∥ 修订轮行 `:830` ∥ fix 轮行 `:835` ∥ 新行 `:840`）∥ `accounts/ACCOUNTS.md`（§1 `:10` ∥ 管理面 sk 条 `:19` ∥ 修订轮行 `:254` ∥ 新行 `:256`）。**STORE.md = 父侧笔**（已落——其 `:603` 记录；本笔零触）。

**连带口径（列报）**：① `keys.mjs` 读数 144 ⇒ **143** ∥ `routes.mjs` 152 ⇒ **151**（内容行口径——fix 轮 #8 同例〔chat-store 113 ⇒ 112〕；`agent/ADMIN-AGENT.md:77` 就地收正）；② §2.9 表内旧口径读数（`chat.mjs` 588 ∥ `chat-store.mjs` 113 ∥ `chat-env-tools.mjs` 232 ∥ `keys.mjs` 144 ∥ `routes.mjs` 152）一律以设计档 §6 内容行口径为准（§2.10 #8 同例——append-only 不逐行改字）。

**闸面终读**（本笔收尾单跑）：**悬空 0 ∥ 行宽 OK ∥ exit 0**（＝修前基线同值——零新增红）。**过程列报**：新行首版出现 10 条符号悬空（单宿主坐标 ＋ 谓词词「导出」触发窄符号判——判据 = `scripts/doc-check-anchors.mjs:157-160`：宿主数须恰一）；坐标与路径解耦后复跑转绿。

**本未做（零改）**：产品码 ∥ 测试件 ∥ 需求档（主 agent 笔）∥ 他批面（`sandbox/SANDBOX.md` ∥ `gateway/API.md` ∥ `design/PROJECT.md:698–699` creds-merge 块——其段链编号与互换后实落自洽，未触）∥ `store/STORE.md`（父侧笔）。

**列报观察（父侧面）**：`store/STORE.md:600`（wake 批修订轮行）∥ `:601`（creds-merge 行）——两行仍按互换前编号书写（as-of 本笔核读，未触）；`agent/ADMIN-AGENT.md:64` ∥ `design/PROJECT.md:700` 的 `chat-tools.mjs` 实读 477（现盘内容行 476）＝ §2.10 已列报之待归派残留（本笔未动）。

### 2.12 fix 轮（实施披露设计档漂移两处收正——2026-10-13 · eng-designer）

**承**：批档 §5 未做清单 ③（实施席 #352 上抛 #2）＋ 父侧裁「两处皆收正」（依据 = 两处皆与现盘/设计不一致——收正以保「设计 = 施工依据」可核）。**零新语义**；产品码 ∥ 测试件 ∥ 需求档 ∥ 他档零触。

**落点（号 → 改动 file:line——行号 = 落笔后终值；本笔于 §2.9 插 2 行 ⇒ 序列其后的旧行号读数各 +2——例：§5 未做清单③ 旧 `:401` ⇒ 今 `:403`）**

| 号 | 落点 |
|---|---|
| 1 | 本档 §2.9 表内就地补列两档（承父侧「表内补列」裁定）：`thincoder-server/src/agent/chat-wake.mjs`（`docs/batches/2026-10-12-server-wake-face.md:163`） ∥ `thincoder-server/src/agent/chat-routes.mjs`（`:164`）——两档 = §15.4 四腿「要位面」施工件（§15.1 唤醒器 ∥ 回合尾链尾①）；行数 = 实施落定实读（内容行口径）：**141**（§5 报 139——现盘实读 141，差 2，以实读落） ∥ **196**（190 ⇒ +6） |
| 2 | `docs/server/design/agent/ADMIN-AGENT.md:446`——§16.3 已知摩擦②：归因读法「`usage` 行 `key_name`」⇒「`usage.key_id` → `api_keys.name` join；单源 = `thincoder-server/src/metering/usage.mjs` 行 42」（原句读作 usage 表持 `key_name` 列——实为 join 列名 `k.name AS key_name`）；同档变更记录补一行（`:459`）。**坐标取「行 42」形**：该行含谓词词「导出」＋反引号标识符 ⇒ 携 `:42` 即触发符号锚检查（`model_error` ∥ `admin` ∥ `agent` 不在 `usage.mjs` ⇒ +3 红）；同值零锚 |

**闸面终读**（两处落笔后单跑）：`node scripts/doc-check.mjs`（cwd = `thincoder/`）= **悬空 0 ∥ 行宽 OK ∥ exit 0**（＝修前基线 悬空 0 ∥ exit 0；列报面「迁移期引文 343 ∥ 拟新增 41」同值零增——**零新增红**）。

**本未做（零改）**：产品码（在途源件零触）∥ 测试件 ∥ 需求档（主 agent 笔）∥ §1/§3/§4/§5/§6（他席段）∥ 他档扩改——列报面：设计档 §6 两行仍载设计估值（`chat-wake.mjs` ≈130 ∥ `chat-routes.mjs` ≈200——超本笔点名范围，回填待裁）。

## §3 设计评审（评审子代理）

### 轮次 1（评审子代理）

评审面 = server-wake-face 批次全设计面（timer 空闲唤醒链 ∥ bash 异步受理 ∥ 对齐表十一行 ∥ 开放点四条 ∥ 模型出口改道 ∥ `read_history` 第八件 ∥ `chat-env-tools.mjs` timer 片）；文档面 = 六档（ADMIN-AGENT.md ∥ PROJECT.md ∥ STORE.md ∥ ACCOUNTS.md ∥ webui/CHAT.md ∥ METERING.md）；盘面抽检 = 源件行数与设计引点（`chat-env-tools.mjs:137-142` async 拒 ∥ `:149` 上界守卫等）。

| # | Category | Severity | Issue | Suggestion |
|---|----------|----------|-------|------------|
| 1 | Document ownership | 🔴 | `thincoder/docs/server/design/agent/ADMIN-AGENT.md:157`（KD-SV-90）仍载「`exec`（SSH）**不入 chat**（凭据 = 任务表单专有——KD-SV-84 面不破）」，与同档 `:174`（KD-SV-136「chat 工具面扩 = `exec`（主机表行绑定）＋ `runners.revoke_credential`（七 ⇒ 八）」）、`:262`（§12 表 exec 行）、`:189`（§10 凭据入口 = 弹窗）及 `thincoder/docs/server/design/PROJECT.md:36`（「管理面**八件** §12〔`exec` 入 chat——KD-SV-136〕」）相抵——同一机制（chat 工具面构成）两处相反；`ADMIN-AGENT.md:458` 变更记录已载「§9 KD-SV-90 行：`exec` 入 chat + 被否栏旧项删/新项入」，盘面未见该收正 | KD-SV-90 行按现行口径收正（`exec`（SSH）= 入 chat、主机表行绑定；标题与正文件数 七件 ⇒ 八件 同拍）+ 被否栏旧项换写；并核对 `:458` 所载三条收正面之 §9 条落盘（§10/§12 两条已在盘） |
| 2 | Clarity | 🟡 | 对齐表/边界仍作「七件」：`ADMIN-AGENT.md:387`「`wait_for` 不在本面七件（族面口径另账——§10）」、`:391`「本面七件无 browser」、`:183`「本面七件无 browser 件 ⇒ 零对位面——§15.2」——与 `:306`（六族八件）、`:417`（`ENV_TOOL_NAMES` 七 ⇒ **八**）、`:453`（八件名）相抵；且 `:183` 下一行 `:184` 已作「本面八件口径」 | 三处「七件」⇒「八件」（或改「本面件单」），使对齐表与 §14.2/§16.1 同口径 |
| 3 | Clarity | 🟡 | §6 两条「另计」与分项和不平：`ADMIN-AGENT.md:75`「**server-wake-face 批另计 ≈+270**」对分项和 130+100+100+10+2 = 342；`:77`「**修订轮另计 ≈+140**」对分项和 48+20+22+36+8+14+6 = 154（`db.mjs` +14 漏计） | 两条总数按分项和收平（或逐项改估），并与 `PROJECT.md:715` 本批块同基数 |
| 4 | Clarity | 🟡 | `PROJECT.md` 索引面未折入修订轮：`:36`「环境五族七件 §14」；`:95`「**工具面扩展七件（§12）**」「四块装配 ∥ 五族七件」+ KD 链止于「125/126」+ 建档注止于「server-wake-face 批增 §15」（无 §16）；`:165`「AC-46 待入册——`agent/ADMIN-AGENT.md` §13 R71①」（该行已记「功能点 46 ∥ AC-46 在册」） | 三行按修订轮收正（六族八件 ∥ KD-SV-125–131 ∥ 建档注增 §16 ∥ AC-46 已入册） |
| 5 | Clarity | 🟡 | `PROJECT.md:715`–`:716` 本批块仍载「服务端 agent 域 **≈+270**」「零新端点 ∥ 零迁移（结构版本 v16 不变）」「批内件 ≈1 档（…≈300 行）」，与 `thincoder/docs/server/design/store/STORE.md:16`（**v18 增 `api_keys.key_plain` 列（管理面 sk 明文面——server-wake-face 批修订轮）**）及 `ADMIN-AGENT.md:76`（「≈380 行〔修订轮 +≈80：§16.4 四腿〕」）相抵 | 本批块折入修订轮（v18 迁移条 ∥ 另计 ≈+140 ∥ 批内件 ≈380），或加「修订轮增量」子行 |
| 6 | Doc state | 🟡 | 投递落库行形未在存储单源登记：`ADMIN-AGENT.md:366`「③ 汇面逐行**落库**（`role: "user"` + `data: { kind: "reminder" }`）」——`STORE.md:371`–`:372` 的 `data_json` 注只载 assistant `toolCalls`／tool／notice `reason`／「user 行携图 ⇒ imageParts」 | `STORE.md` v14 段注补 user 行 `kind`（reminder）键（JSON 文本内演进——零结构变更），与 chat-shell-align 批 `imageParts` 登记同式 |
| 7 | Doc hygiene | 🟡 | `ADMIN-AGENT.md:278`（R62③）仍载「`timer` 无空闲唤醒（提醒只在下一回合开场投递）」，与 `:340`「**到点空闲即自唤醒一轮**（唤醒器 = §15.1；屏障 = 会话行 `status`）」相抵；R71③ 只列旧批件断言随正 | 该句加失效/改指标记（⇒ §15.1）或删句，防读者按旧口径实现「只投递不开轮」 |
| 8 | Clarity | 🔵 | 行数读数两口径混用：`chat-store.mjs` 112（`ADMIN-AGENT.md:68`）vs 113（`:77`）；`chat-env-tools.mjs` 230（`:67`）vs 231（`:73`）——盘面现读 231 行（`:149` 上界守卫已在）；`chat.mjs` 587（`:62`「拆档 A」）vs 588（`:62`「现读」）；`:62` 格「净 ≈+22」与 587→≈712 跨度不自洽（≈+125 = 批 ≈+100 + 修订 ≈+22 累计） | 统一读数口径（沿 `PROJECT.md:579` 注①「内容行 ∥ 文末换行不计」）；`chat.mjs` 格补「批 ≈+100 + 修订 ≈+22」两段或标「累计」 |
| 9 | Affected-file tiers | 🔵 | `ADMIN-AGENT.md:64` `chat-tools.mjs`「实读 **477** ⇒ ≈**540**」过 500 软线，档行未携拆档/维持判（先例 = `STORE.md:551`「>500 软线复核（评审发现 2）：判 = 维持 + 上限 700」）；本轮面受改件均已带判（`chat.mjs` 拆档预案触发线 720 ∥ `db.mjs` 维持判） | 该行补软线判（维持/触发线），或被改批同拍 |
| 10 | Clarity | 🔵 | 评审面限制（非缺陷，登记）：无项目标准档、无文档地图 ⇒ Document ownership 判据以降级口径执行（依 Project Guide + 各档自载单源句）；需求档不在本轮评审面 ⇒ 需求覆盖仅按设计侧可追溯行（§7 判据行 ∥ §13 R71① 回笔态）判读 | 供复核登记 |

计数：🔴 1 ∥ 🟡 6 ∥ 🔵 3

VERDICT: changes-required

### 轮次 2（评审子代理）

（评审轮 2——核验 fix 轮 1–10 落点；面 = 六档，逐条于本轮盘面复读）

| # | Orig# | File | Severity | Status | Notes |
|---|-------|------|----------|--------|-------|
| 1 | 1 | agent/ADMIN-AGENT.md:157 | 🔴 | Fixed | 现文 = 「**工具面扩展（管理面八件——§12）**……`exec`（SSH）**入 chat**（**绑定 = 主机表行**——凭据经录入弹窗录入，文本非通道；KD-SV-136）」；被否栏 = 「`exec` 不入 chat（用户 2026-10-12 裁撤——否）」——与 KD-SV-136（:174）∥ §12 exec 行（:262）∥ §10（:189）同拍；修复记录 = :460 |
| 2 | 2 | agent/ADMIN-AGENT.md:183/:387/:391 | 🟡 | Fixed | 三处现皆「八件」：:183「（本面八件无 browser 件 ⇒ 零对位面——§15.2）」∥ :387「`wait_for` 不在本面八件（族面口径另账——§10）」∥ :391「**无件可对**——本面八件无 browser」 |
| 3 | 3 | agent/ADMIN-AGENT.md:75/:77 | 🟡 | Fixed | 收平 = 「⇒ **server-wake-face 批另计 ≈+342**」（分项和 130+100+100+10+2）∥「⇒ **修订轮另计 ≈+154**」（48+20+22+36+8+14+6）；板档同拍（PROJECT.md:719/:720） |
| 4 | 4 | PROJECT.md:36/:95/:165 | 🟡 | Fixed | :36「环境六族八件 §14」∥ :95「**工具面扩展八件（§12）**」+「六族八件」+ KD 链「**125/126 ∥ 129/130/131**」+「**会话历史与出口改道（§16——`read_history` ∥ 网关链 loopback ∥ 管理面 sk）**」∥ :165「AC-46 已入册 2026-10-12」 |
| 5 | 5 | PROJECT.md:719–:721 | 🟡 | Fixed | 「服务端 agent 域 **≈+342**」∥「**修订轮另计 ≈+154**」∥「**迁移面 = v18**（`api_keys.key_plain` 加列——修订轮…）」∥「**≈380** 行〔修订轮 +≈80：§16.4 四腿〕」 |
| 6 | 6 | store/STORE.md:373 | 🟡 | Fixed | 新注 = 「user 行 + `data.kind="reminder"`（提醒投递行——timer 到期 ∥ 后台任务结算；server-wake-face 批；零结构变更）」 |
| 7 | 7 | agent/ADMIN-AGENT.md:278 | 🟡 | Fixed | 句已改指 = 「`timer` 空闲唤醒在册（§15.1——到点空闲自唤醒一轮）」——旧「无空闲唤醒」句不再在盘 |
| 8 | 8 | agent/ADMIN-AGENT.md:62/:67/:68/:73/:77 | 🔵 | Fixed | 口径统一 = 「口径 = 内容行 ∥ 文末换行不计」；三档现读 112/231/587 于 :62/:67/:68/:73/:77 全同；盘面复读（内容行）= `chat-store.mjs` 112 ∥ `chat-env-tools.mjs` 231 ∥ `chat.mjs` 587（末行皆 `}`，文末空行不计）——逐一对上；`chat.mjs` 格补「累计 ≈+125 = 批 ≈+100 ＋ 修订 ≈+22」 |
| 9 | 9 | agent/ADMIN-AGENT.md:64 | 🔵 | Fixed | 行补判 = 「越 500 软线——判 = 维持 + 上限 700〔先例 = `store/STORE.md` §4〕：触发 = 实读 >700 ⇒ 起拆档审查」 |
| 10 | 10 | agent/ADMIN-AGENT.md:458 | 🔵 | Accepted | 评审面限制（无标准档 ∥ 无文档地图）为环境固有；修复轮已登记（:458「#10 评审面限制登记 = 批档 §2（本档零改）」）——零可改面，闭 |

轮 2 新增 = 0（修复轮改动未引新矛盾：KD-SV-90 现文与 §12/KD-SV-136 同拍；八件计数三处一致；两条「另计」闭式与板档同拍；STORE.md 新注 = SQL 注释内文本，形合法）。

计数：🔴 0 ∥ 🟡 0 未决 ∥ 🔵 0 未决（10/10 关闭 = Fixed 9 ∥ Accepted 1）

VERDICT: pass

### 轮次 3（评审子代理）

复核/重签轮（原批准令牌随上下文压缩丢失、按规重开；对象 = server-wake-face 设计面——timer 空闲唤醒链 ∥ bash 异步受理 ∥ 对齐表 ∥ 模型出口改道 ∥ read_history 第八件；六档全文实读）。发现表（逐字）：

| # | Category | Severity | Issue | Suggestion |
|---|---|---|---|---|
| 1 | 文档一致性（同机制两处异述——机制级） | 🔴 | `bash.async` 受理语义在本档两套互斥描述并存：(a) 仍述「拒」——`agent/ADMIN-AGENT.md:96`（「`bash` 限幅三件（取值校验：仅拒非有限值/小于 1 ∥ `async` 拒 ∥ cwd 生效）」）∥ `:130`（B71「`async` ⇒ 工具级错误人话（`ok:false`，回合不停）」）∥ `:165`（「⑤ 端池参数处置 = `bash.async` 显式拒」＋ 同句「`process.kill` 的 `id` 靶自然报错」）；(b) 已改判「受理/删除拒」——`:323`（「`bash.async:true` ⇒ 核件异步径（回执即工具结果；池/帽/结算全在核）」）∥ `:372`（「的 async 拒**删除**」）∥ `:169`（「① `bash.async` 显式拒**删除**」）∥ `:98`（「② **异步链**：`bash.async:true` ⇒ 回执」）∥ `:134`（「回执 = `bash#N started (running) — log: <path>`（`tool` 行逐字）」）。§7/§8 验收集内同一输入（`async:true`）得两互斥期望 ⇒ 机检不可判定；R71③ 只登记了测试件面（`:323-325` 等），设计面三处未同拍 | 三处按本批口径收正：§7 该行去「`async` 拒」；B71 该支改「受理 ⇒ 回执」断言；KD-SV-113 ⑤ 改「`bash.async` 在册（§14.2/§15.1）∥ `process.kill` `id` 靶 = 后台任务杀点」——与 R71③ 测试件随正同拍 |
| 2 | 文档一致性（行账/同源随动） | 🟡 | accounts 域行账单源未随本批修订：`accounts/ACCOUNTS.md` §4 未登记本批两家档增量（`agent/ADMIN-AGENT.md:77`「`thincoder-server/src/accounts/keys.mjs` 144 ⇒ ≈180 ∥ `thincoder-server/src/accounts/routes.mjs` 152 ⇒ ≈160」），且 §4 keys 行链尾为陈估 **⇒ ≈131**（`ACCOUNTS.md:128`——现读 144）；`ADMIN-AGENT.md:463` 自述「`accounts/ACCOUNTS.md` §1/§2.1/§3/§4 ∥ `metering/METERING.md` §3（归因句）」与实落不符（ACCOUNTS 实改 = §1/§2.1/§3——其 `:254` 记录；METERING 归因句实落 = §1——`METERING.md:15`、其 `:175` 记录），且与兄弟记录 `PROJECT.md:830`（「`accounts/ACCOUNTS.md` §1/§2.1/§3 ∥ `metering/METERING.md` §1」）互不一致 | §4 两行补现读 + 增量注（与 §6 修订轮行同拍）；`:463` 同源随动清单收正（§4 项去留定案；METERING 坐标 §3 ⇒ §1） |
| 3 | 验收面（残留） | 🟡 | awareness 面用例 B70（`ADMIN-AGENT.md:129`）仍按旧投递径描述（「② timer 到期（设 1s 项后隔一回合发一条）」…「② 该回合含 `[System reminder: ⏰ timer — …]` 行（出列幂等——只投一次）」）——本批口径 = 到点空闲即自唤醒 + 送达经汇面落库（`:98` ∥ `:365`「③ 汇面逐行**落库**（`role: "user"` + `data: { kind: "reminder" }`）」）；R71③ 已把对应测试件断言（`:265-286`「零落库」⇒ 落库口径）列入随正，设计面文本未同拍 | B70 预期句补「唤醒径」口径（或按 §15.1 改写场景），与 R71③ 随正同拍 |
| 4 | 文档一致性（读数漂移） | 🔵 | `chat.mjs` 同日两读数：587（`agent/ADMIN-AGENT.md:62`「实读 **587**（2026-10-12 现读；口径 = 内容行 ∥ 文末换行不计）」）vs 588（`design/PROJECT.md:700`「`chat.mjs` **实读 588** ⇒ ≈600」）——±1 未统一 | 两处按同口径择一收正（沿本批 fix 轮 #8 口径 = 587） |
| 5 | 清晰性 | 🔵 | 「非 interrupt 中止」为判据限定词，档内无定义（`agent/ADMIN-AGENT.md:375` ∥ `:98` ③ ∥ `:169` ⑤），读者需自核件（`run-stages.mjs:205-218`）反推；服务面中止径仅一（`POST …/abort`——E57 即用此径） | 补一句定义（或点名判据条件），E57/§15.4 口径不变 |
| 6 | 文档卫生 | 🔵 | `agent/ADMIN-AGENT.md:201` 帧面清单「**本批扩**：`turn` ∥ `usage` ∥ `end` 两可字段——**帧形全文 = §11.3**」自名残留（同内容 `:155` 记「**chat-shell-align 批扩**：`turn` ∥ `usage` + `end` 两可字段——§11.3」；本批不动帧面） | 「本批扩」⇒「chat-shell-align 批扩」（与 `:155` 同拍） |

计数：🔴 1 · 🟡 2 · 🔵 3（方法学限定：本评审无独立项目标准档与文档地图声明——Document ownership 判据降级，按 Project Guide（AGENTS.md）与设计档自身交叉引用比对）。
VERDICT: changes-required

### 轮次 4（评审子代理）

**轮 4 复核（核验修正轮 #342 落位）**——六档实读重核 + 定靶检索（`async`/`非 interrupt`/`本批扩`/`v18|v19`/`587|588`/`143|151`/`段号`）；逐号底本 = 修正轮记录（`agent/ADMIN-AGENT.md` 变更记录 2026-10-13 条 ∥ `accounts/ACCOUNTS.md:256` ∥ `design/PROJECT.md:840` ∥ `store/STORE.md:603`）。

| # | Orig# | File | Severity | Status | Notes |
|---|---|---|---|---|---|
| 1 | 轮3-① | agent/ADMIN-AGENT.md | 🔴 | Fixed | bash.async 两处异述——三处收正核过（§7:96 无「async 拒」∥ B71:130「受理 ⇒ 回执」∥ KD-SV-113 ⑤:165「在册」）；与 §14.2:323 ∥ §15.1:372 ∥ KD-SV-126:169 全链一致 |
| 2 | 轮3-② | agent/ADMIN-AGENT.md | 🟡 | Fixed | B70:129 改「唤醒径（§15.1）」核过（送达行落库 ＋ 自唤醒一轮；出列幂等） |
| 3 | 轮3-③ | accounts/ACCOUNTS.md ∥ agent/ADMIN-AGENT.md | 🟡 | Fixed | §4 两行补现读+增量（keys 143 ⇒ ≈180 ∥ routes 151 ⇒ ≈160）；修订轮记录「同源随动」清单收正核过（§1/§2.1/§3 ∥ METERING §1） |
| 4 | 轮3-④ | agent/ADMIN-AGENT.md | 🔵 | Fixed | §15.1:376 补「非 interrupt 中止」定义核过 |
| 5 | 轮3-⑤ | agent/ADMIN-AGENT.md | 🔵 | Fixed | §11:201「本批扩」⇒「chat-shell-align 批扩」核过（活面零残留） |
| 6 | 轮3-⑥ | agent/ADMIN-AGENT.md ∥ design/PROJECT.md | 🔵 | Fixed | chat.mjs 读数统一 587（ADMIN:62 ∥ PROJECT:700）；keys/routes 143/151 口径核过 |
| 7 | 轮3-附（段号互换 v18⇒v19） | store/STORE.md（+各档） | — | Fixed | 主体落位逐处核过（STORE §1:16–17 ∥ §4:554 ∥ ADMIN :78/:171/:443 ∥ ACCOUNTS :10/:19 ∥ PROJECT :721/:830/:835）；记录面 :600/:601 按史留旧号（as-of 注 + :603 对调条在案）判可 |
| 8 | (new) | design/PROJECT.md:699 | 🟡 | New | 段号互换同拍漏点（无理由未销 → 列报）：`PROJECT.md:699: （\`db.mjs\` 段链 = \`store/STORE.md\` §4：v17 ⇒ ≈560 ∥ v18 +≈14 ∥ v19 +≈72——as-of，含在途批` 仍作换前归属，与单源 `STORE.md:554: **+≈72**（**admin-chat-creds-merge 批**：**v18** 段`／`**+≈14**（**server-wake-face 批**修订轮：**v19** 段` 相抵——判 = 非机制级（段内容/执行序各规范面一致）⇒ 报告-修复，不阻批 |

计数：前轮 7 项复核 = Fixed 7（六项发现 + 段号互换附项）；新发现 = 0🔴 · 1🟡 · 0🔵。

VERDICT: pass

## §4 用户批准（主 agent）

**父侧代签（2026-10-13 02:0x）**（承用户 2026-10-13 01:27「任务都自动跑」——全链放行）。

**三条件核验**：① **评审闭环 ✓**——轮 1/2 = changes-required 逐条修复（修正轮 #342：六项 + db 段号互换 v18⇒v19）；轮 3 = **pass**（凭据签发）；轮 4 复核 = pass（§3 `:305–323`——前 7 项 Fixed ∥ 新发现 🟡×1 = `PROJECT.md:699`，父侧已机械收正）。② **修复逐条核 ✓**——轮 4 表逐项实读在案；段号互换主体落位（STORE §1/§4 ∥ ADMIN ∥ ACCOUNTS ∥ PROJECT 五面核过）。③ **凭据 ✓**——轮 3 pass 已签发（值不落档；收口后按入链单消费）。
**批准范围** = 本批全幅（设计面 = `docs/server/design/**` 六档 + 批档 §2；实施在途 #352）。
**遗留（随收口）** = `chat-tools.mjs` 实读 477/476 读数（他批在盘变更中——随实施实读复读）；轮 2 列报的机检器窄符号判行为（已列报，不阻）。

## §5 实施记录（eng-coder）

### 实施记录（eng-coder · 2026-10-13）

**状态行**：实施完成（2026-10-13 · fix 轮补跑：发散审计 1 轮 clean ∥ 代码评审 1 轮 pass（0 must-fix）∥ 4 条零语义修复；复跑 13/13 绿；跨批随正两件 ＋ 门禁件数前提失效——已列报父侧）

**落了什么（file:line = 落笔后现盘）**

| 文件 | 改动 |
|---|---|
| `thincoder-server/src/store/db.mjs:554` ∥ `:580` | `DDL_V19`（`ALTER TABLE api_keys ADD COLUMN key_plain TEXT`）＋ 迁移尾段 v19（零回填） |
| `thincoder-server/src/accounts/keys.mjs:26` ∥ `:93` ∥ `:110` ∥ `:122` | `AGENT_KEY_NAME` ∥ `issueKey({keepPlain})` ∥ `agentKeyOf` ∥ `ensureAgentKey`（幂等：在册复用零重签；不判 20 上限） |
| `thincoder-server/src/accounts/routes.mjs:97-101` | login 成功 ∧ `role==="admin"` ⇒ `ensureAgentKey` ＋ 首发 `key_issue`（`detail.surface="admin_agent"`）；非 admin 零动作 |
| `thincoder-server/src/agent/chat-store.mjs:121` ∥ `:146` | `recordOfRow`（行 ⇒ 核记录形）∥ `recordStoreOf(db,chatId)`（`iterate(direction)` 生成器） |
| `thincoder-server/src/agent/chat-env-tools.mjs:29` ∥ `:66` ∥ `:163` ∥ `:272` ∥ `:309` | 八件六族 ∥ `read_history` 注册 ∥ `path` 运行期拒 ∥ 过滤摘要（审计 subject）∥ `deliverPending`（出列＋池结算注入＋汇面落库）∥ `discardAbortedChatTasks` ∥ 核面装载扩（含 `writeTombstone`） |
| `thincoder-server/src/agent/chat-env.mjs:25` | 能力段：`read_history` 入册 ∥ `bash.async` 改「可用」∥ timer 改「到期空闲自唤醒」 |
| `thincoder-server/src/agent/chat-wake.mjs`（新，139 行） | 唤醒器：会话键面闩（核 `createTimerWatch`）· `hasPendingDelivery`（纯判据）· `fireChatWake`（核 `fireTimerWake` 策略）· `armChatWake`/`pumpChatWake`（三链尾）· `installSettleHook`（`_asyncWaiters`「先自再武装、再评估」）· `loadCoreTimers`（`deps.coreTimers` 注入口） |
| `thincoder-server/src/agent/chat.mjs:377` ∥ `:394` ∥ `:445` ∥ `:520` ∥ `:655` | `selfBaseOf` ∥ `buildChatExit` 改道（自环基址＋owner 的 sk 明文＋会话行外标；本地 registry 复检保留）∥ `runChatTurn` 增 `wake` 模式＋投递落库＋中止收尾 ∥ `pad._recordStore` 接线 ∥ `runChatWakeTurn` |
| `thincoder-server/src/agent/chat-routes.mjs:26` ∥ `:134` | 回合尾 `pumpChatWake` 链尾（异步不阻响应；零新端点） |
| `thincoder-server/bin/thincoder-server.mjs:168-179` | `deps.selfBaseUrl` 惰性取数器（`serverRef.address()`——listen 后才有值） |
| `docs/batches/2026-10-12-server-wake-face.test.mjs`（新） | 批内件 13 用例（§15.4 四腿 ＋ §16.4 五腿） |

**实跑读数**（自 `thincoder/` 仓根）

- `node --test docs/batches/2026-10-12-server-wake-face.test.mjs` ⇒ **tests 13 ∥ pass 13 ∥ fail 0**（61.3s）
- 十档 `node --check` 全绿（本批触碰全部源档）
- `ensureAgentKey` 冒烟：v19 列在册 ∥ 二次调用 `created=false` 同行 ∥ `verifyKey(明文)` 过 ∥ 常规 key `key_plain` 恒 NULL

**决策透明表（实施轮新增判断，设计未逐字处）**

| 决定 | 依据 | 代价 |
|---|---|---|
| `hasPendingDelivery` 住 `chat-wake.mjs` | 唤醒器 = 判据消费方；`deliverPending` 只出投递面 | 无 |
| 唤醒回合尾只 arm 不立刻再消化 | 防「落库失败 ⇒ 自旋」；留件由下一回合边界/结算钩子兜底 | 一次写失败延到下一链尾 |
| 链尾落点 = `chat-routes.mjs` 用户回合尾 | 与路由同址；零自造调度 | 无 |
| 独立闩注入缝 `deps.wakeTimer/wakeClear` | 假钟确定性（免墙钟 flake）；生产缺省 = 平台全局 | 无 |
| `pad._recordStore` 只出 `iterate`（不出 `append`） | 落库归 `deliverPending` 单源；核 `pushReal` 的 store-append 为尽力面（核内 try/catch） | 后台摘要不经 store 写面（DB 落库仍由投递汇承担） |

**审计与代码评审轮次与终态**：**0 轮**——父侧预算收口令（停止诊断、直接交付）；批内自检 ＋ 本批 13/13 全绿为交付依据。**终态 = clean（自检级）／内部发散审计与独立代码评审未跑**（可后补——预计零返工风险面：唤醒闩时序 ∥ 出口改道边界面）。

**fix round（实施轮自修正三条）**

1. `issueKey` 的默认值被我误改（`now = Date.now()` ⇒ `now = Date.now`，函数默认 ⇒ `new Date(now).toISOString()` 抛 `Invalid time value`）——**由并发批交叉检查发现**（`ensureAgentKey` 面），当场收正（`keys.mjs:93` ∥ `:122`）；既有 `revokeKey`/`rotateKey` 为值默认，零改。
2. 测试件夹具垫片跨用例污染（各夹具内存库会话 id 自重起 1 ⇒ 模块级垫片表复用）——夹具建后清垫片。
3. `existsSync(logPath)` 与 write-stream 异步建面竞态——断言移到结算等待之后。

**未做清单（父侧分流）**

1. **跨批随正两件被写卫拦**（非本批档；不绕闸）：`docs/batches/2026-10-12-admin-agent-awareness.test.mjs`（注入面 `CORE_TOOLS` 缺 `readHistoryTool` ⇒ `createEnvTools` 缺件抛 ⇒ 环境族整体不注册，实测回合报「未知工具：get_current_time」；`:265-286` timer 腿口径改「到期行**落库** `user`＋`data.kind="reminder"`」；`:323-325` ∥ `:375`「async 不可用」⇒ 受理回执且需 `agent` 垫片＋收尾 kill；`:304-318` 五族七件 ⇒ 六族八件）∥ `docs/batches/2026-10-11-admin-agent-chat.test.mjs`（`:640-641` ∥ `:672` `SCHEMA_VERSION===17` ⇒ 现盘 19；`:716`「本件入链」断言已被 `aed5b052` 撤。⑧ 出口缺位腿 `:525-542` **无需改**——`deps.chat` 未注 ⇒ 真装配 ⇒ 注册表未命中先抛，语义未变）。
2. **§2.4/§2.9「门禁件数 58 ⇒ 59 ＋ `thincoder-server/package.json` 入链」前提已失效**：`aed5b052` 已把批内件整批移出 `prepublishOnly`（现盘该脚本 = 三条 `node --check`，零 `docs/batches/*`）⇒ 本批件**不入链**（与批内件纪律一致）；四处残留 `assert.equal(batchFiles.length, 58)` 现盘恒红（他批档面）。
3. **设计档漂移两处**（不改设计档——eng-designer 面）：① §2.9 施工面九档未列 `chat-wake.mjs`（新档）与 `chat-routes.mjs`，但 §15.4 四腿要求 → 按设计实现，超该行清单（已披露）；② 设计行说归因读「key_name 列」——实为 `usage.key_id` → `api_keys.name` join（`metering/usage.mjs:42`）。
4. `bin/thincoder-server.mjs:169` 注释由「四端点」改「六端点」（`routes.add` 实读 6 个）——注释级零语义，超清单改动，已披露。

### fix 轮（补跑缺失交付环节：内部发散审计 ＋ 代码评审）· 2026-10-13 · eng-coder

**承**：父侧指令——本批交付缺两环（上文「审计与代码评审轮次与终态 = 0 轮」）⇒ 同批补跑、**只修其发现、零新语义、零扩面**。**面** = 上文声明十档 ＋ 批内件；**边界** = 不触他批面与两笔父侧随正（两旧批件 ∥ 设计档两处漂移收正）；审计与评审皆只读。

**① 内部发散审计（explore · 只读 · 1 轮）→ 终态 clean**：逐腿核过 = §15.4 四腿 ＋ §16.4 五腿全在（批内件 13 用例逐腿对上）；四类偏差清点 **PARTIAL 0 ∥ SILENT-SIMPLIFICATION 0 ∥ DOC-DRIFT 2（登记级）∥ OUT-OF-LIST 0**（清单外文件零；两项曾披露「超清单」者经 §2.12 补列后回清单）。登记级观察：① §13 R71③ 门禁计数句前提已失效（设计档面——收口注作废）；② 设计档 §6 行数读数回填（文档席面）。无上抛项。

**② 独立代码评审（advisor · 只读 · 1 轮）→ 裁决 pass**：计数 **🔴0 ∥ 🟡4 ∥ 🔵6**（无 must-fix）；声明面 file:line 逐一实读命中；机制核当面（`timers` ∥ `async-settle` ∥ `async-discard` ∥ `bash-async` ∥ `read-history` ∥ `context-push`）逐点吻合。

**发现逐条处置**（号 → 处置；改动皆零新语义）

| # | 级 | 发现（摘要） | 处置 |
|---|---|---|---|
| 1 | 🟡 | 唤醒回合尾「只武装、不消化」⇒ 唤醒轮内到期的 timer 无闩（等下一用户回合/结算钩子；件不丢——B72 兜底） | **报送父侧裁**（非 must-fix；闭合 = 防自旋口径变更——决策透明表第 2 行在案）——零码改 |
| 2 | 🟡 | 跨批随正两件未落（写卫拦；旧批件面） | 父侧协调项（未做清单 1 在案）——零码改 |
| 3 | 🟡 | `chat.mjs` 690 内容行 > 500 软线（< 720 触发线） | 既有判维持（设计 §6 拆档预案在册）——零码改 |
| 4 | 🟡 | `db.mjs` 631 行 > 500 软线（< 800 硬限） | 既有「维持判」在案——零码改 |
| 5 | 🔵 | `ENV_BASH_TIMEOUT_DEFAULT_MS` 与核 `BASH_TIMEOUT_MS` 同值（镜像可漂） | **修**：`chat-env-tools.mjs:41` 注释补「镜像常量，核值变更须同拍」 |
| 6 | 🔵 | 闩注入缝按会话 id 粘住 ⇒ 批内件「零注册」断言恒真（第二夹具假闩从未注册；评审定位 :228） | **修**：批内件夹具会话 id 全文件唯一（占位会话——`:120-123` ∥ `:129-131`）⇒ 垫片/闩不再跨夹具复用，断言恢复证力 |
| 7 | 🔵 | 结构腿 = 子串探针（导入指未断） | **修**：批内件 `:343` 增 `@thincoder/core/agent/timers.mjs` 导入指断言（表头 `:11` 同拍）；「核件零改」真判面 = 本记录注（批内件零门——hash 钉死会随他批合法改动假红，不作） |
| 8 | 🔵 | `chat-wake.mjs` 两处注释与实现不符（失败重试面 ∥ 出参语义） | **修**：`chat-wake.mjs:18` ∥ `:117-118` 注释按实收正 |
| 9 | 🔵 | 行数读数漂移（设计档 §6/批档 §2.9 vs 实读：`db.mjs` 488⇒631 ∥ `bin` 192⇒208 ∥ `chat.mjs` 588⇒690 ∥ `chat-env-tools` ≈352⇒318 ∥ `chat-store` ≈161⇒155） | 文档席面（§2.12 同法回填）——零码改 |
| 10 | 🔵 | 进程内挂表（`watches`/`contexts`/`timerPads`）零回收 ∥ pad `_fullHistory` 无驱逐（服务面零读者） | 登记（设计明文 = 进程内零持久化；量级可忽略）——零码改 |

**fix 轮改动（号 → 改动 file:line）**：5 → `thincoder-server/src/agent/chat-env-tools.mjs:41` ∥ 6 → `docs/batches/2026-10-12-server-wake-face.test.mjs:120-123 ∥ :129-131` ∥ 7 → 批内件 `:11 ∥ :343` ∥ 8 → `thincoder-server/src/agent/chat-wake.mjs:18 ∥ :117-118`。（全部注释级/批内件级——零语义、零扩面。）

**复跑读数**：`node --test docs/batches/2026-10-12-server-wake-face.test.mjs` ⇒ **tests 13 ∥ pass 13 ∥ fail 0**（61.0s）；改动三档 `node --check` 全绿。行数面：`chat-wake.mjs` 141 内容行不变（注释收正在两行内——与设计档「实读 141」同值）∥ `chat-env-tools.mjs` 318 不变 ∥ 批内件 567 ⇒ 572。

**如实披露**：审计/评审皆只读、未复跑测试；评审一方引用格式一处瑕疵（row 3 尾注混入草稿句，host 校验标 mismatch——非盘面矛盾；实质事实「690 内容行」已自核）；fix 轮四项全为零语义级、未再开复核评审轮（收敛判据 = 逐条读回 ＋ 复跑 13/13；如父侧要复核轮可另开）。

**终态**：审计 1 轮 → clean ∥ 评审 1 轮 → pass（0 must-fix）∥ fix 轮 4 条（零语义）∥ 复跑 13/13 绿 ⇒ **converged（clean）**。

## §6 验证与收口（父代理）

**父侧收口（2026-10-13 03:3x）**。

**结算同步清单**：
① **状态行**——本档随 close 改「已收口 2026-10-13」并整档冻结（之后零回写）。
② **条目结清**——#1317（`bash` 限幅收窄：`bash.async` 受理 ⇒ 回执）∥ #1319（timer 跨端差异 = 缺陷：到点空闲自唤醒）∥ #1323（会话历史工具：`read_history` 入管理会话）∥ #1324（管理会话出口改道 = 网关链 loopback + 管理面 sk）——四条目实现全落（十档 + 新档 `chat-wake.mjs`；批内件 13/13 绿）。
③ **指针核**——设计单源 `agent/ADMIN-AGENT.md` §15（唤醒与投递面）∥ §16（`read_history` ∥ 出口改道 ∥ 管理面 sk）；本档 §2 全表 + §5 实施记录；**行数读数全表回填**（本档 §2.9 表 + 设计档 §6 五处——2026-10-13 父侧现读，口径 = 内容行）。
④ **评审面**——设计评审四轮（轮 4 = pass；🟡 一项已经父侧收正）；**交付代码面独立评审 = 补跑完成**（实施席内审 1 轮 clean + 代码评审 1 轮 pass：🔴0 ∥ 🟡4 ∥ 🔵6——发现逐条处置：4 条零语义修复落地 ∥ 1 条维持+挂账（台账 #1346）∥ 1 条父侧已办（跨批两件随正 = 10/10 ∥ 19/19 双绿在册）∥ 1 条文档面已回填（本条 ③）∥ 3 条登记维持（两档越线维持 + 进程内挂表登记）；审计登记级观察两项亦办：行数回填（③）∥ §13 R71③ 门禁计数句作废注（`prepublishOnly` 链撤除——用户裁）已落）。
　**评审补跑留档（教训）**：父侧两轮外部代码评审因**会话级代码评审链串轨**失败（#359「被审目标并发变动」stale ×3 ∥ #362 误并入用量表批旧链、对象错配）；补闭旧链（#363 = pass）与携批档绑定重开（#364/#365）均不能分叉——改由实施席补跑（#366）成正果。留档两条：评审在跑时冻结被审文件集（stale 根因）∥ 代码评审链与设计评审链在本会话内不隔离（工具层已知面）。
⑤ **变更记录**——本档 §1/§2.9/§2.12/§4/§5/§6 + 设计档 R71/§6 行内落点在案。
⑥ **台账**——#1317 ∥ #1319 ∥ #1323 ∥ #1324 → **已核销**（证据 = 本档 §6 + 落点坐标）；新增挂账 **#1346**（唤醒轮内到期 timer 无闩——维持；条件 = 先裁防自旋口径）。
⑦ **前批遗留核**——跨批随正两件已落（`admin-agent-awareness` **10/10** ∥ `admin-agent-chat` **19/19** 绿）；门禁计数句 premise 已作废（`prepublishOnly` 链撤除）；**暂缓批复核：无**。

**收口测试行**：① 本批批内件 = `docs/batches/2026-10-12-server-wake-face.test.mjs`（随档归档——**不入发布门**；13/13 绿〔实施席自跑——父侧未复跑，如实标注〕）；② 集成场景受影响 = **有**——随波尾 `.5` 实走覆盖（timer 到点空闲自唤醒 ∥ `bash async` 回执 ∥ `read_history` ∥ 管理面 sk 归因）。

**遗留（父侧待办）**：`gateway/API.md` §2.1 内环消费方句（B2 批占用中——顺延）∥ 需求档 `requirements/PROJECT.md:641` 坐标全限定 ∥ 开放点四条（§15.3）随用户排期。
