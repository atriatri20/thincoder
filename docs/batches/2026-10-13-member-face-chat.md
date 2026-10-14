# 2026-10-13 · member-face-chat
> 六段 append-only，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 编制：主 agent · 2026-10-13 · 来源 = 用户 2026-10-13 19:32 提（「成员面的会话是不是可以做起来了？我希望能够考虑周全点，界面跟vsc和桌面基本一致。」）+ 19:33「开」——第三步「服务端开发」立案。
> 台账 = #1215（server · 归批）。前情 = 无（独立批——承台账 #1215 ∥ 需求档 §5「工作区内的开发」行〔骨架六条 + 待裁五题〕）。
## §1 讨论（主 agent）
**状态行**：已收口 2026-10-14
<§1 模板占位：本批条目 / 关键判据 / 授权口径>

**2026-10-13 · 成员面会话（服务端开发——第四壳）设计**

- **来源**：用户 19:32 原话「成员面的会话是不是可以做起来了？我希望能够考虑周全点，界面跟vsc和桌面基本一致。」+ 19:33「开」。台账 **#1215**（2026-10-10 12:16 提出——本日立案）。
- **已裁骨架（逐条在册——需求档 §5「工作区内的开发」行）**：盒内每工作区 agent（16:28 裁）∥ 盒内 = `@thincoder/core` 同件 + 最小壳（16:36 裁）∥ 浏览器 ⇄ server ⇄ 盒、盒只对 server 出向（16:29/19:52 裁）∥ 盒内 agent 作 server 客户端、server 相接两侧（16:32 裁）∥ 模型调用 = 盒内 → server 网关、盒内零真密钥（16:30 在册）∥ 公网化必要且走正规模式（16:47/16:50 裁）∥ 空闲休眠/卷恒留/快照（16:19/16:20 裁）∥ 词面 = 成员面「工作区」（16:16 裁）。
- **待裁五题（设计轮逐题出案——用户 19:32「考虑周全」= 含被否理由）**：① 会话单源在 server（盒可弃、会话不弃——父侧提案待裁）∥ ② 流转发协议（长轮询 ∥ SSE ∥ WS）+ 盒侧凭据形 ∥ ③ 首次进入所见 + 拉仓流程 ∥ ④ 成员权限 + 每成员工作区数上限（#1216 ② 挂账）∥ ⑤ 移动端接口形。
- **对齐面（用户点名）**：界面与 VSC/桌面 **基本一致**——沿 render-core 复用纪律（管理面 chat 已走通 = 先例）；「流式按步交错」等最新交互同基准（实走对照终判）。
- **依赖**：实施前置 = **沙盒执行面重做批**（盒内 agent 运行时通道——**设计可先行**）；拉仓 = git 源面（功能点 44——gitee 三态在修）。
- **边界**：不建第五面 ∥ 穿透/中转类不做 ∥ 公网化三件前置（#1243）不在本批 ∥ 移动端壳不做 ∥ 执行面本体不在本批。
- **授权**：19:33「开」= 立案 + 开批 + 设计派发授权（走法 19:32 已报备）。

**2026-10-13 · 用户追裁（记忆面——范围收窄）**：原话「memory部分先压一下，我希望服务端成员面走团队记忆，就不用实现客户端的那种本地记忆了。」——① 记忆面**压后**（本批设计不展开）；② 方向在册 = 成员面走**团队记忆**（**不实现客户端式本地记忆**——personal/project 本地层与本地索引不落成员面）；③ 团队记忆本体 = 需求档 §1 四面 ②『团队记忆与知识库（team 层重规划）』（另面另批）。父侧已向设计席（#72）发追加条（steer——设计内按「压后 + 方向一句」落，不展开）。

**2026-10-13 · 用户追裁（记忆面——客户端侧补全）**：原话「客户端将来需要本地记忆和团队记忆都支持。」——**客户端（三端 CLI/VSC/桌面）将来 = 本地记忆 + 团队记忆双支持**；与上一笔合成完整图：**成员面只走团队记忆 ∥ 客户端 本地 + 团队都要**。落点 = 需求档 §1 四面 ② 行补句；**本批零设计变更**（成员面范围不变——设计席 #72 不重复发条）。

**2026-10-13 · 用户授权（自动跑）**：用户原话「自动跑」（20:09）⇒ 本批**设计评审点火权（父侧核读通过后）∥ §4 用户批准权（代签）∥ 修正/实施轮派发 ∥ 收口核销与提交（双推）∥ 令牌终消费**——均委托父侧自动执行，直至本批收口。**父侧自缚三条（本仓惯例·先例同形）**：① 代签仅当三条件齐备（评审 pass 0🔴 ∧ 修正轮已落地并逐条核验 ∧ token 已签发）——每次代签在 §4 写明「父侧代签（用户 20:09 授权）+ 依据」；② 新范围/口径裁决 ⇒ 停下、只摆那一条；③ 破坏性/不可逆 ⇒ 先停。默认全自动，用户随时可打断。

**2026-10-13 23:2x · 用户裁定（待裁五题 · 题一——会话单源）**

- **用户原话**：「题一我的想法不太一样，会话里大多是垃圾，太多太杂了，盒子都丢了，还留着会话干嘛？时间长了把服务器都搞脏了。而且，直接留在盒内应该代码跟原来一样吧，都不用改了。」
- **裁定 = KD-SV-152 翻转：会话真源 = 盒内**（核原生会话文件——零改造）；**盒去会话随去**；**服务端零会话落库**（不建 `member_sessions`/`member_session_messages` 两表——服务器只管中转与工作区）；零上送 ∥ 零回灌（回灌缝 R76 随之消解——核侧协作需求消失）；动机（用户明示）= 服务器卫生（不积垃圾）+ 盒内代码零改。
- **连带修订面（设计修订轮）**：§3.2（上送∥回灌）∥ §3.3 `sync` 差量口径 ∥ v23 两表段 ∥ 会话生命周期/读回各句 ∥ AC-50 ①/⑤ 判据 ∥ 测试面；**会话管理面（列表/删除——盒内原生能力）出案**。
- **代价呈报（父侧如实摊开 · 用户已知悉接受）**：① 读史（浏览器/移动端）须盒在跑——停盒先启、销毁即失；② 换机/重建 ⇒ 会话不随（git 工作区随）；③ 跨设备看史 = 仅当该盒活着。收益 = 服务器零会话垃圾 ∥ 盒内零改造 ∥ 服务器侧机制大减。
- **过程**：并入其余四题（二–五）用户裁定后，**一轮设计修订**（eng-designer fix 轮）→ 复评 → 代签 → 派发（实施仍待 #1373 前置）。

**2026-10-13 23:2x · 用户裁定（待裁五题 · 题二——盒接入协议 + 盒侧凭据）**

- **用户原话**：「我认为可以。」= **KD-SV-153 ∥ KD-SV-154 照案采纳**。
- **① 协议** = SSE 下行（`GET /api/box/events`：hello/run/abort/pull/ping）+ NDJSON 上行四口（`sync` ∥ `sessions/:id/turns` ∥ `commands/:cmdId/result` ∥ `ping` 应答）；在线判据 = 连接在 ∧ ping 应答 ≤3 周期（60s）；被否三案（WS ∥ 长轮询 ∥ 单连接全双工）维持。
- **② 凭据** = 复用每工作区 key（第二门 `/api/box/*`；零新秘密）；被否（另发会话凭据 ∥ 成员登录 token 代盒）维持。
- **③ 轮换口径（父侧建议随案入册）**：key 轮换 ⇒ **下次盒启动生效**（最简形）；「轮换即断旧连接」未选（后改另裁）。
- **④ 题一连带收正（修订轮落形——题一已裁会话住盒内）**：上送落库 ∥ 回灌差量（`sync` 握手/差量口）随消——协议收敛为「**纯中转 + 控制**」；读史/列表 = 向盒取指令（读指令形 = 修订轮出）。

**2026-10-13 23:3x · 用户裁定（待裁五题 · 题三——首次进入 + 拉仓）**

- **用户原话**：「我听着可以，挺有道理的，就是不明白为啥首次拉要管理员放行，这个很没道理，管理员把他添加为项目成员就已经是放行了，为啥还要再放行一次？」
- **裁定 = 主体照案 + 拉仓出站改「登记即放行」**：① 题三主体（四相引导 ∥ 可见项目选择制 ∥ 目标目录缺省仓名 ∥ 凭据按次下发 ∥ 不设门 ∥ 空清单兜底文案 ∥ 待批可见腿）照案；② **登记仓 ⇒ 该仓域名自动入出站放行名单**（来源标注 = 项目登记；管理员可见、可撤——拉仓直通、日常 `git fetch/push` 直通；不再走人工待批）；③ 非拉仓的裸出站（盒内 agent 自撞陌生域名）仍走待批（防意外外联——不动）；④ 连带修订面：§3.6 拉仓链 + 出站约束句 + AC-50② 判据 +（沙盒侧）DNS 闸「预授权条目（来源 = 项目登记）」一小条——随修订轮出，评审覆盖面含该条。
- **用户判据（在册）**：「成员被加为项目成员/仓被登记 = 放行已完成」——重复放行 = 冤枉路。

**2026-10-13 23:3x · 用户裁定（题三 · 补——拉仓凭据来源）**

- **用户原话**：「用户拉git要用自己的凭证，不能用平台凭证。」
- **裁定 = 拉仓凭据改「成员本人凭据」**（不再用平台级 git 源 PAT）；平台 PAT 保留角色 = 仓清单/登记面（B2）∥ 服务端侧操作（不进盒）。
- **连带收正（修订轮落）**：① KD-SV-155 凭据句（「源 PAT 经盒下行」⇒「**成员凭据**经盒下行」）；② 成员凭据落形：绑定处（成员设置页**绑定一次复用**〔父侧建议〕∥ 按次输入）+ 存储（加密、零回显——同凭据族）+ 经盒按次、用毕即清、审计行——机制不变、只换来源；③ 「按项目只读凭据」加强面随之**消解**（本人凭据自带权限 scope——平台那边记的也是谁拉的）；④ 公开仓零凭据腿不变。
- **挂账（默认——用户未提，不阻塞）**：盒内 `git push/fetch`（改完推回）的凭据面 = 现状设计未覆盖（本批只拉仓）——如用户裁「一并做」则并入本批，否则另说。

**2026-10-13 23:3x · 用户裁定（题三 · 补二——推送面，挂账撤销）**

- **用户原话**：「改完推当然是盒内git工具推啊！这个不是什么问题。」
- **裁定 = 盒内 `git push/fetch` 走盒内 git 工具直用**（核家族 git 工具全套本就在盒内——**不另设机制、不新增面**）；凭据 = 成员本人凭据（承上一条）。
- **收口句（修订轮一句带过）**：成员凭据在盒内的可用形（拉取/推送共用——如 git credential helper ∥ env 形，择一写死）；上文「盒内 git push 挂账」**撤销**。

**2026-10-13 23:4x · 用户裁定（待裁五题 · 题四——成员权限与上限）**

- **用户原话**：「题四我觉得没问题，你考虑得挺周到。」= **KD-SV-156 照案采纳**。
- **① 动作面** = 本人资源自管（创建 ∥ 启动 ∥ 停止 ∥ 销毁〔确认门 + dirty/快照读数〕+ 拉仓；承载 = 对话页就地形 + 工作区页动作列 + 会话内 agent 工具）；**② 上限** = `memberWorkspaceLimit` 缺省 **3**（设置键 + 控制台写入口；越限 400 人话含数字）；**③ 越权形** = 列表零出现 + 直取 404（不辨存在性）；**④ 父侧建议随案**：「按人覆写上限」先不做（登记——条件触发）。

**2026-10-13 23:4x · 用户裁定（待裁五题 · 题五——移动端接口形）**

- **用户原话**：「题五没问题，也很周到，就这么做。」= **KD-SV-157 照案采纳**。
- ① 鉴权 = Bearer 成员 key + cookie 双门同判权（同套凭据/同套判权）∥ ② 端点与页面同源（零副本——单端点族/单帧面）∥ ③ 流形 = 普通 HTTP 流式（NDJSON 逐行帧——任何 HTTP 客户端可消费）∥ ④ 页面专属物（渲染 ∥ 文案 ∥ DOM）不入协议（app 自带界面）∥ ⑤ 本批零移动端工作（移动壳不做；公网化 #1243 另批——真正跑 app 的前置）。
- **五题全裁齐（2026-10-13 23:3x–23:4x）**：题一 = 翻案（会话住盒内 ∥ 盒内核原生零改造 ∥ 服务器零会话落库 ∥ 两表不建 ∥ 上送/回灌随消）∥ 题二 = 照案（SSE 下行 + NDJSON 上行四口 ∥ 每工作区 key）∥ 题三 = 照案 + 拉仓「登记即放行」（登记仓域名自动入出站放行名单、来源标注可撤）+ 拉仓凭据 = **成员本人凭据**（不用平台 PAT）+ 推送 = 盒内 git 工具直用 ∥ 题四 = 照案（本人自管四动作 + 拉仓；每人缺省 3 上限可配；越权 404 不辨）∥ 题五 = 照案。
- **下一步（候令）**：一轮 eng-designer 修订轮全落五题裁定 + 连带修订（KD-SV-152 翻案改写 §3.2/§3.3 sync 口 ∥ v23 两表段删 ∥ KD-SV-155 凭据句收正 ∥ 拉仓出站句 + 沙盒侧 DNS 闸预授权条目 ∥ AC-50 判据回填）→ 复评（用户点火）→ 代签 → 派发（实施仍待 #1373 前置）。

- **2026-10-14 00:07 · 用户授权（自动跑）**：用户「其他自动跑」⇒ 本批**全链自动**（修订轮落地后：复评点火 ∥ §4 代签 ∥ 实施派发（排重做批落地后）∥ 收口核销提交双推）+ **自缚三条**（代签仅三条件齐备 ∥ 新范围/口径裁决停下只摆一条 ∥ 破坏性/不可逆先停）。修订轮（eng-designer #109）在写。

- **2026-10-14 00:1x · 修订轮核读 + R80 收正（父侧）+ R79 判**
  - **核读**（eng-designer #109 交付，落点 = §2「裁定修订轮」段）：五题逐条有落点 ✓；`member_event` **保留**（六 kind——审计型链十六型不动 ⇒ AC-28/需求档链无需回笔）✓；v23 = `member_git_credentials` 凭据表 + 审计十六型，两会话表不建 ✓；本批域机检零红（其读数）。
  - **R80 收正（父侧笔）**：上文题一「代价呈报」句②「换机/重建 ⇒ 会话不随」按机制收正——**快照 = 卷全量（含会话）⇒ 会话随快照回（截至快照时点）**；「不随」仅指无快照的重建/换机。用户论断（23:2x）不受影响（其当场语境 = 常规销毁/换机）。
  - **R79 判**：会话删除钮——v1 **不做**（沿管理面先例：管理 chat 在册「不做：会话删除/重命名」）；**登记为将来面**（用户若要 = 一句话加——盒内原生零新机制）。已呈报用户（默认不做——不阻塞复评）。
  - **复评排法**：等 #111（onboarding 撤除设计）落笔后点火——两批同写 `sandbox/SANDBOX.md`/`EXECUTION.md`/`store/STORE.md` 等档，先到先写、后审（避 D5 冻结窗与写门相撞）。

## §2 批次任务与设计（eng-designer）
**状态行**：设计完成（裁定修订轮（五题裁定落笔）2026-10-13；R79/R80 待裁）

### 2.1 本批条目（覆盖——逐条挂需求）

- **功能点 50 ∥ AC-50（六项 ①–⑥；逐项判据 = `agent/MEMBER-AGENT.md` §6——单源）**：
  ① 界面一致 + 入口（`#/me/chat`——我的组首位；四轴沿 `webui/CHAT.md` §2.1（同款核件消费/帧读/状态行/notice 映射）+ 成员差异六条（取数面 ∥ 工作区维度 ∥ 盒态动作 ∥ 无源钮收窄 ∥ notice+1 `box_lost` ∥ 档位面））；
  ② 拉仓（可见项目选择制 ∥ 目标目录缺省 = 仓名 ∥ 凭据按次下发 ∥ 出站待批联动）；
  ③ 访问路径（浏览器 ⇄ server ⇄ 盒三段；盒只出向；runner 零入向端口；零 web 直连盒）；
  ④ 核同件（盒内 = `@thincoder/core` 同件 + 最小壳；**本批核面零改**）；
  ⑤ 一盒一工作区 + 生命周期（起停 ⇒ 在线态随动；停盒/重启 ⇒ 收尾三径；卷恒留沿沙盒；快照不含会话）；
  ⑥ 待裁判据 = 呈案集 **KD-SV-152–157**（六决策 ↔ 五题——② 含协议 + 凭据两案；158/159 = 已定登记：记忆面压后 ∥ 工具面归属收正）；裁定后回填（本表预留位在册）。
- **不在本批**：三端（CLI/VSC/桌面）工作区/会话面（R75——单列出案待裁）∥ 移动壳（接口形声明在册）∥ 公网化三件（#1243）∥ 执行面本体（依赖 = 沙盒执行面重做批）∥ 记忆面本体（用户 19:35 追裁：压后；方向 = 团队记忆，零本地记忆）。

### 2.2 设计档落点（本批）

- **新档** = `docs/server/design/agent/MEMBER-AGENT.md`（agent 域第二档）：§1 定位与形态 ∥ §2 KD-SV-152–159（五题出案 + 工具面归属 + 记忆面） ∥ §3 机制十节 ∥ §4 端点索引 ∥ §5 预算 ∥ §6 AC-50 对位 ∥ §7 用例 ∥ §8 边界 ∥ §9 上抛（R75–R78）。
- **随动八档（逐处）**：`gateway/API.md`（§1 路由两行 + 盒族 `ping`（**新 §2.12 五行**） ∥ **新 §2.11（十一行）** ∥ §2.5 设置键 `memberWorkspaceLimit` ∥ §3 两新码 ∥ §5 AC-50 行 ∥ §4 两行账 + 小计 **+≈9**）∥ `accounts/ACCOUNTS.md`（§1 型链 15 ⇒ **16 型** ∥ §2.1 增 `member_event` 行 ∥ 型面现状 v20 ⇒ **v22/十六型**）∥ `store/STORE.md`（§1 版本 22 ∥ §2 **v22 段**（两表 + 审计 CHECK 十六型） ∥ §3 v22 判据 ∥ §4 触发线 700 越线 ⇒ 拆案执行）∥ `webui/CHAT.md`（标题两面化 ∥ **新 §2.2** ∥ §3 三档 + 面小计 ≈830 + 键族 ∥ §4 ∥ §5 ∥ §6⑦）∥ `webui/WEBUI.md`（§1 档链 +3 ∥ §2 IA 首位行 ∥ §5 ∥ §6 ∥ §7 壳族两表 +1/表）∥ `sandbox/SANDBOX.md`（§5 接线 + 设置键行 ∥ §8 成员写面翻本批 ∥ §14 KD-SV-138 同拍 ∥ §15 ∥ §13 拆档）∥ `agent/ADMIN-AGENT.md`（§1/§10 归属收口 = KD-SV-159 ∥ §6 不重计注）∥ `docs/server/design/PROJECT.md`（§1/§2.1/§3/§4/§6/§7/变更记录）。

### 2.3 机制设计（要点八条——全文 = MEMBER-AGENT §3）

1. **会话单源 = server**（KD-SV-152）：库两表 `member_sessions`/`member_session_messages`（v22；形沿 `agent_chats`）；**上送 = 帧驱动**（壳零核文件读路径）；**回灌 = `lastSeq` 差量 sync**（主径 = 核正式缝；缝未落前保底 = 核导出写面函数重建——R76 登记）。
2. **盒接入协议 = SSE 下行 + NDJSON 上行**（KD-SV-153）：下行 `GET /api/box/events`（hello/run/abort/pull/ping）；**上行四口** = `sync` ∥ `sessions/:id/turns`（`begin` + 六帧词表）∥ `commands/:cmdId/result` ∥ `ping` 应答（`POST /api/box/ping` ⇒ 204）；**在线判据 = 连接在 ∧ 最近 ping 应答 ≤3 周期（60s）**；浏览器杆 = POST-NDJSON（沿管理面）；被否 = WS/长轮询/全双工。
3. **盒侧凭据 = 复用每工作区 key**（KD-SV-154——第二门 `/api/box/*`；零新秘密）；盒 env 新 `TC_SERVER_URL`（基址显式；凭据仍读 `OPENAI_API_KEY`）。
4. **成员权限 = 本人资源自管**（KD-SV-156）：四动作（创建/启动/停止/销毁——确认门）+ 拉仓；**上限 = `memberWorkspaceLimit` 缺省 3**（设置键 + 最小写面）；越权 = 过滤/404 不辨。
5. **生命周期接线**：盒起 ⇒ 壳连挂 ⇒ sync；停盒/掉线 ⇒ 在途回合收尾（notice + `end.reason:"box_lost"`）；服务端重启 ⇒ `running` 清扫；**无看门狗**（收尾三径在册）；空闲回收/卷恒留/快照沿沙盒面。
6. **首次进入四相 + 拉仓**（KD-SV-155）：无工作区 ⇒ 建 ∥ 盒未运行 ⇒ 启 ∥ 空卷 ⇒ 拉仓引导 ∥ 直聊；拉仓 = 可见项目 + 目录缺省仓名 + 凭据按次（用毕即清 + 审计）。
7. **模型/档位面**：建会话缺省 = 开放清单首个；`PATCH` 换模型/设档（值域 = 开放清单/核枚举——表外 400）；回合携 `reasoningEffort`（未设 ⇒ 零字段）。
8. **记忆面 = 压后**（KD-SV-158——方向 = 团队记忆；零本地记忆件，机检断言在册）。

### 2.4 受影响文件与测试覆盖

- **服务端**（agent 域——档账 = MEMBER-AGENT §5）：新五档 ≈**940**（`member-relay.mjs` ≈220 ∥ `member-routes.mjs` ≈250 ∥ `box-routes.mjs` ≈200 ∥ `member-store.mjs` ≈140 ∥ `member-pull.mjs` ≈130）∥ `store/db.mjs` +≈70（v22——**越触发线 700 ⇒ 迁移段外拆 `src/store/migrations.mjs` 本批先行**）∥ `sandbox/{routes,registry}.mjs` +≈60（写面 + 上限；**routes 越 500 ⇒ 工作区面拆档**）∥ `bin` 装配一行 ⇒ 服务端净 ≈**+1071**。
- **gateway 域**（行账 = `gateway/API.md` §4）：`errors.mjs` 64 ⇒ ≈**70**（两新码 `workspace_offline`/`workspace_limit_reached` +≈4） ∥ `server.mjs` 192 ⇒ ≈**197**（路由级流式体读例外 +≈5）——本域小计 ⇒ **+≈9**。
- **盒壳**（新）：`deploy/sandbox/member-shell/{index,protocol,core-run,pull}.mjs` ≈670 + `Dockerfile` 18 ⇒ ≈30（核装 + 壳 COPY + CMD）。
- **webui**：三新档 ≈830（`views-me-chat.mjs` ≈380 ∥ `…-messages.mjs` ≈140 ∥ `…-composer.mjs` ≈310）∥ 两 i18n me 表 +≈40/表（键族 `me.chat.*`）∥ shell 两表 +1/表（≈75/≈73 ⇒ ≈76/≈74）∥ `app.mjs` +≈4 ∥ `nav.mjs` +1 ∥ `style.css` ≈+15（净 ≈**+932**）；档目链 53 ∥ 52 ⇒ **56 ∥ 55**。
- **测试**（单元测试档三档——**不入任何门**）：`docs/batches/2026-10-13-member-face-chat.test.mjs` ∥ `…-ui.test.mjs` ∥ `…-box.test.mjs`（合计 ≈900；覆盖 = MEMBER-AGENT §7 用例 N71–N78 ∥ B69–B72 ∥ E54–E56）。

### 2.5 验收对照（三链）

- **需求链** = 功能点 50 ∥ AC-50 六项 ⇒ 设计判据 = MEMBER-AGENT §6（机检行 + 机制行七 + 边界行）⇒ 批档 §2.1（本条）——三链同源。
- **用例链** = **成员面** N71–N78 ∥ B69–B72 ∥ E54–E56（盒内 + 端面 + 页面；面别限定——与管理面 `agent/ADMIN-AGENT.md` §8 同号项区分；页面腿 = `webui/CHAT.md` §4 本批行）。
- **收口轮** = 用户实走对照 VSC/桌面（「基本一致」逐项）；镜像重建 + 真机盒（拉仓 + 会话续聊）。

### 2.6 关键决策（本批——**呈案六项「待裁·出案」**（152–157）；158/159 已定；裁定后逐项收正）

KD-SV-152 会话单源 ∥ 153 盒协议（SSE+NDJSON）∥ 154 盒凭据（工作区 key 第二门）∥ 155 首次进入四题 + 拉仓 ∥ 156 权限与上限 ∥ 157 移动端同族 ∥ 158 记忆面压后（已定） ∥ 159 工具面归属（本档——已定：范围 = 成员本人资源 ∥ 动作集 = 写面同集——单源；管理面运维件不入）。全形（决策/理由/被否）= MEMBER-AGENT §2（单一权威源）。

### 2.7 上抛项

- **R75** 三端工作区/会话面 —— **待裁·出案**（不在本批；代价 = 登记续悬或改指后续端侧批）。
- **R76** 回灌核缝 —— 依赖·登记（核批协作；保底形在册）。
- **R77** 成员面 server 域工具逐件 —— 登记（实施批从实需反推）。
- **R78** 需求档回笔（主 agent 笔）：AC-28 审计型 十五 ⇒ 十六（`member_event`）∥ AC-12 我的 6 ⇒ 7 + 档目链随正 + 角色默认页（若裁）∥ AC-50 ⑥ 五题判据回填（裁定后）。
- **披露（不阻塞）**：拉仓凭据经盒按次（环内威胁模型如实）；`db.mjs`/`routes.mjs` 两处越线拆案本批先行；成员页适配层与管理页同构自持（抽取 = 登记另轮）；`end.reason` 第六值 `box_lost` 为本面新增。

**产品码零触（设计轮）。**

**修正轮 1（承 §3 轮次 1 之 18 条——父侧全采纳）· eng-designer · 2026-10-13**

逐号处置（号 → 改动 `file:line`）：

| # | 处置 → 改动 |
|---|---|
| 1 🔴 | 工具面归属收正 = `agent/MEMBER-AGENT.md` §2 **KD-SV-159**：`docs/server/design/agent/ADMIN-AGENT.md:16-17`（§1 关系句改指 159 ＋ 归属句 = 范围 = 成员本人资源 ∥ 动作集 = 写面同集——单源）∥ `:196`（§10 边界行同句）∥ `:597`（变更记录追加）∥ `agent/MEMBER-AGENT.md:149`（§3.7 同拍） |
| 2 🟡 | 两新码行账：`gateway/API.md:334`（`errors.mjs` 64 ⇒ ≈70——+≈4）∥ `:335`（本域小计 ±0 ⇒ **+≈9**）∥ `:320`（`server.mjs` 192 ⇒ ≈197）∥ 批档 §2.4 增 gateway 域行（本节 §2.4 第 58 行） |
| 3 🟡 | 会话行形含 `reasoning`：`gateway/API.md:269`（列表行）∥ `:270/:271/:275`（三处 ⇒「行形 = 列表行同源」）∥ `:281`（新增**会话行形单源句**——建/列表/详情/PATCH 四处同源，与 §2.8 对齐） |
| 4 🟡 | 审计型登记单源：`accounts/ACCOUNTS.md:29`（型链 15 ⇒ **16 型**）∥ `:75`（§2.1 增 `member_event` 行——四 kind ＋ detail 键集 ＋ 写入点）∥ `:77-78`（型面现状 v20 ⇒ **v22/十六型**）∥ 本节 §2.2（随动档 7 ⇒ **8 档**） |
| 5 🟡 | `sandbox/SANDBOX.md:614`（KD-SV-138 零写控件 ⇒ 写面 = member-face-chat 批开）∥ `:633-634`（§15 成员面余项随正）；`:350`（§8 成员写面）原已一致——零改 |
| 6 🟡 | 呈案射程收窄：本节 §2.1⑥（呈案集 = **KD-SV-152–157**——六决策 ↔ 五题；158/159 = 已定登记）∥ §2.6 标题＋尾句（158/159 标「已定」） |
| 7 🟡 | 目录冲突检出点：`gateway/API.md:278`（删请求期 400 ⇒ **盒侧检出**——`git clone` 失败分类 ⇒ 结果面 `failed`）∥ `agent/MEMBER-AGENT.md` §3.6 同拍 |
| 8 🟡 | 体读口径：`gateway/API.md:289`（`turns` 体读 = 流式——路由级例外；`server.mjs` 随正）∥ 同档 §4 `server.mjs` 行 +≈5 ∥ `agent/MEMBER-AGENT.md` §3.3 |
| 9 🟡 | 端点名收正：`agent/MEMBER-AGENT.md:30/:128`（`/api/me/projects` ⇒ **`GET /api/projects?q=`**） |
| 10 🟡 | 在线/掉线判据：新增上行 **`POST /api/box/ping`**（体 `{t}` ⇒ 204，保活应答帧）——`agent/MEMBER-AGENT.md` §3.3/§3.4 ＋ KD-SV-153（上行三 ⇒ **四口**）∥ `gateway/API.md` §2.12（新增行 ＋ `events` 行判据「连接在 ∧ ping 应答 ≤3 周期」）∥ 同档 §1 路由族行 |
| 11 🟡 | 先例段实现坐标补三处（管理面 chat 栈 ∥ 成员面读面先例 `routes.mjs:440` ∥ key 签发 `routes.mjs:268`）＋ 偏离③理由句（盒非浏览器客户端、无 cookie 面 ⇒ 单门不适用）——`agent/MEMBER-AGENT.md:5–:9` |
| 12 🟡 | 设置键单源两处：`gateway/API.md:165`（settings 行 + `memberWorkspaceLimit`）∥ `sandbox/SANDBOX.md:342-343`（逐键 ↔ 卡面对照 ＋ 成员面行）∥ 本节 §2.2（API §2.5） |
| 13 🔵 | 保底形核坐标：`agent/MEMBER-AGENT.md:61`（`thincoder-core/session.mjs:113`（saveSession）∥ `:55-57`（重导出）∥ `session-slots.mjs:154`（writeSessionFile）；**重建序 = 实施期探明**）＋ R76 同处登记 |
| 14 🔵 | 随正件行账：`agent/MEMBER-AGENT.md` §5 九处标「（拟新增）」＋ 现读注（`app.mjs` 206 ⇒ ≈210 ∥ `nav.mjs` 104 ⇒ ≈106 ∥ `style.css` 358 ⇒ ≤±30 ∥ shell 两表 ≈75/≈73 ⇒ +1/表）∥ `webui/WEBUI.md:184/:191`（两表 +1/表） |
| 15 🔵 | 展示形统一：`agent/MEMBER-AGENT.md:88/:103`（`args` ≤500 ∥ 摘要 ≤300——与 `gateway/API.md:199` 同口径） |
| 16 🔵 | 预算复算收平：`docs/server/design/PROJECT.md:750-753`（940 ∥ 服务端净 **+1070** ∥ webui 净 **+932**——分项和 = 830+80+2+4+1+15）∥ 本节 §2.4 两处同拍 |
| 17 🔵 | 面别限定：`agent/MEMBER-AGENT.md` §7 标题句 ＋ 用例面别「**成员面** N71–N78 ∥ B69–B72 ∥ E54–E56」∥ `gateway/API.md:284/:361` 同拍 ∥ 本节 §2.5 |
| 18 🔵 | **父侧承接**（模式旗三枚出案——批准材料 ＋ 收口轮走查清单保留该条）；本席零改 |

**附带一致性修（非 18 号内——同批、同类形态修复，机制面零变，报告在案）**：`webui/CHAT.md:145-147` 三行新档标「（拟新增）」（= #14 同类——新档路径须带标记否则计悬空）∥ `store/STORE.md:690` 同款一处 ∥ `docs/server/design/PROJECT.md:751` 同款一处。

**边界**：本轮**零新语义**——全部改动 = 评审 18 条直接导出项（含 #4/#12 的随动补登、#16 的分项和复算）；无新增设计内容、无口径自裁；未动需求档（回笔 = 主 agent 笔）、未动产品码。**产品码零触（设计轮）。**

**读回**：`node scripts/doc-check.mjs --root D:\teamcode\thincoder` ⇒ 悬空 **49 ⇒ 34**（−15 = MEMBER-AGENT 十处 ＋ 附带一致性修五处〔`webui/CHAT.md` ×3 ∥ `store/STORE.md` ×1 ∥ `docs/server/design/PROJECT.md` ×1〕）；超宽 **30 ⇒ 29**（PROJECT.md:750 复算时折行）。触及档残留超宽/悬空项均为**既往存量**（未新增）；本轮触及档 = 设计八档 ＋ 批档一件（`accounts/ACCOUNTS.md` 为本批新增随动档 = 第八档）。

**修正轮 2（承 §3 轮次 2 之 6——父侧逐条裁定：#1–#5 采纳 ∥ #6 = 限制登记、零改）· eng-designer · 2026-10-13**

逐号处置（号 → 改动 `file:line`）：

| # | 处置 → 改动 |
|---|---|
| 1 🟡 | 呈案射程收窄（与同档 §6 `:212` 单一读法取齐）：`docs/server/design/agent/MEMBER-AGENT.md:26`——句收为「带「待裁·出案」= 本批向用户呈案（五题逐题——KD-SV-152–157）；158/159 = 已定登记——不入呈案集」 |
| 2 🟡 | `docs/server/design/accounts/ACCOUNTS.md:71`——§2.1 `sandbox_event` 行主体列补「∥ 成员（member-face-chat 批成员写面行——随 KD-SV-156 裁定同拍）」∥ detail 列尾补「成员写面动作行（member-face-chat 批）：detail 携 `by:"member"`」 |
| 3 🟡 | 七档变更记录补笔（内容 = 承 §3 轮次 1 逐号要点）：`docs/server/design/gateway/API.md:533`（之 2/3/7/8/10/12/17）∥ `docs/server/design/accounts/ACCOUNTS.md:263`（设计轮＋轮 1——一笔含）+ `:264`（轮 2——#2 同笔）∥ `docs/server/design/store/STORE.md:691`（之 4 连带）∥ `docs/server/design/webui/CHAT.md:267`（之 14 连带）∥ `docs/server/design/webui/WEBUI.md:417`（之 14）∥ `docs/server/design/sandbox/SANDBOX.md:694`（之 5/12）∥ `docs/server/design/PROJECT.md:883`（之 16 连带）+ `:884`（轮 2） |
| 4 🔵 | 闭式收平（分项和取一口径 = 1071）：`docs/server/design/PROJECT.md:750`（≈+1070 ⇒ ≈**+1071**）∥ `docs/server/design/agent/ADMIN-AGENT.md:72`（成员面五档 ≈920 ⇒ ≈**940**）∥ 本节 §2.4（`:57`——本节直笔，同轮 1 先例；服务端净 ≈+1070 ⇒ ≈**+1071**）；`PROJECT.md:882` 记录面旧数按史留存（零动）。同轮记录补笔：`docs/server/design/agent/MEMBER-AGENT.md:248` ∥ `docs/server/design/agent/ADMIN-AGENT.md:598` |
| 5 🔵 | `docs/server/design/agent/MEMBER-AGENT.md:200`——§5 随正件行 `thincoder-server/bin/thincoder-server.mjs` 补「现读 **213** ⇒ ≈**+1**——装配一行」（现读 = 当刻实读） |

**边界**：修正轮 · **零新语义**——全部改动 = §3 轮次 2 之 1–5 直接导出项（含 #3 之「触及即记」补笔、#4 之同源记录补笔）；未动需求档/产品码/其它批档；#6 限制登记按裁定零改；评审未点名面零动（`ADMIN-AGENT.md:72` 之既往超宽存量、`ACCOUNTS.md` 型面表述残点 = 随见另列、零触）。

**读回**（D6——逐处实读在位）：`MEMBER-AGENT.md:26/:200/:248` ∥ `ACCOUNTS.md:71/:263/:264` ∥ `gateway/API.md:533` ∥ `store/STORE.md:691` ∥ `webui/CHAT.md:267` ∥ `webui/WEBUI.md:417` ∥ `sandbox/SANDBOX.md:694` ∥ `PROJECT.md:750/:883/:884` ∥ `ADMIN-AGENT.md:72/:598` ∥ 本节 `:57`。

**机检**：`node scripts/doc-check.mjs --root D:\teamcode\thincoder` ⇒ 悬空 **34**（改前 34——零增）∥ 超宽 **29**（改前 29——零增）；本批两档（`agent/MEMBER-AGENT.md` ∥ 批档）不新增悬空/超宽；触及面新增行全落「变更记录」区带/表行豁免（唯一闸态命中 = `ADMIN-AGENT.md:72` 既往超宽存量 362 字符——改前同值）。

**随见（待父侧裁——本轮零触）**：`ACCOUNTS.md` 六处型面表述未随 v22 十六型收正（`:149` ∥ `:151` ∥ `:152`「十五型零增」 ∥ `:165`「现行 = 十五型」 ∥ `:167` ∥ `:206`）——沿该档历批「全档表述随正」惯例（team-ledger 批先例）应为十六型；本轮按「评审未点名面零动」零触，登记待裁。

### 裁定修订轮（2026-10-13 · eng-designer · fix 轮）——五题裁定落笔

**来源** = §1（用户 2026-10-13 23:3x–23:4x 五题裁定）。**性质** = 设计修订（零产品码）：裁定全文落进设计档 + 端点面 + 键面 + 行账/索引同拍。
**裁定五题（照 §1 原话口径）**：① 题一**翻案**——会话真源在盒内（零落库/零上送/零回灌；`member_sessions`/`member_session_messages` 两表不建；`sync` 口随消）∥ ② 题二照案——SSE 下行 + NDJSON 上行 ∥ ③ 题三**照案 + 补**——登记即放行（`source='project'`；裸出站仍待批）∥ ④ 题四**翻正式**——成员本人 git 凭据（盒内 credential helper 拉/推共用；`GET/PUT/DELETE /api/me/git-credentials`；推送 = 盒内直推、零服务器审计——如实披露）∥ ⑤ 题五**翻正式**——成员 agent = 盒内长驻 agent，会话流本地、落盘 = 核原生，服务器不代写（页面 = 开发用途）。

#### 落点（逐档一行——本轮新增/改动）

| # | 档 | 落点 |
|---|---|---|
| 1 | `agent/MEMBER-AGENT.md` | §2 KD 翻转（152–157 翻正）+ 新增 **KD-SV-203/204** ∥ §3.2（会话源/盒指令/零回灌不变量）§3.3（+`cmd` ∥ +凭据口）§3.4 §3.5 §3.6（凭据 helper ∥ 登记即放行）§3.7–§3.10 ∥ §4 端点索引 §5 行账 §6 判据（AC-50 ①–⑥）§7 用例（E54–E57）§8 边界 §9（R79/R80）∥ 变更记录 |
| 2 | `store/STORE.md` | v23 段重写：**凭据表 `member_git_credentials`**（member_id×host 唯一）+ 审计 CHECK（`member_event` **十六型**——含 credential_set/credential_revoke）；两会话表不建 ∥ §1/§3/§4 行链 ∥ 变更记录 |
| 3 | `accounts/ACCOUNTS.md` | `member_event` **六 kind** ∥ sandbox_rule 带入 ∥ 型面句 ∥ 变更记录 |
| 4 | `sandbox/SANDBOX.md` | §4 预授权块（登记即放行）∥ §5 接线 ∥ §6 零挂起 ∥ §8 凭据面 ∥ §13 `rules.mjs` ≈518 越线拆案 ∥ 变更记录 |
| 5 | `sandbox/EXECUTION.md` | §6 预授权条目直通 ∥ §8「会话读写面（零回灌）」∥ §15 KD-SV-170 同拍 ∥ KD-SV-173 计数收正（「+70」⇒「增量」）∥ 变更记录 |
| 6 | `gateway/API.md` | §1 路由族两行（-sync +credential +cmd）∥ §2.11 **十四行**（+凭据三行；列表扇出；读/管理/新建/改走盒指令，**盒离线 ⇒ 409**）∥ §2.12 **五行**（-sync +credential；`cmd` 事件）∥ §2.11 审计六 kind ∥ §5 AC-50 行 ∥ 变更记录 |
| 7 | `webui/CHAT.md` | §2.2 差异②（列表 = 盒内清单）+ **差异⑦（会话源 = 盒内）** ∥ 不做面（删除 = 出案 R79；重命名不做）∥ 变更记录 |
| 8 | `webui/WEBUI.md` | §2 IA `#/me/chat` 行（会话源句）∥ §5 `views-me.mjs` 指针 as-of 2026-10-13 ∥ 变更记录 |
| 9 | `webui/ME.md` | **$\2.3 新增「账户页 Git 凭据卡」**（定位/卡形/数据面/边界）∥ §3 行账（`views-me.mjs` ⇒ ≈355；两 i18n 表 ⇒ ≈137/≈138）∥ §5 边界 ∥ 变更记录 |
| 10 | `webui/I18N.md` | §3 面小计（+≈96 ⇒ ≈415）∥ 变更记录 |
| 11 | `design/PROJECT.md` | §2.1 agent 行（真源在盒内 ∥ `cmd` ∥ 登记即放行 ∥ 凭据）∥ §3 文档地图 MEMBER-AGENT 行 ∥ §4 索引 **1–202 ⇒ 1–204** ∥ §6 本批预算重算（服务端 ≈+1026 ∥ 盒壳 ≈730+16 ∥ webui ≈+1008）∥ 变更记录 |

#### 关键设计点（裁定落形——单源在各档）

- **会话真源在盒内**：服务器零会话落库；`cmd` 下行四指令（`sessions.list`/`session.read`/`session.create`/`session.update`）+ `commands/:cmdId/result` 回呈；会话 id = 复合形 `<workspaceId>:<槽号>`；**读/管理盒离线 ⇒ 409**（读也须盒在跑）。
- **登记即放行**：`sandbox_rules` 行 `source='project'`（`ensureProjectAllow`——注册/拉仓点带入；可改可删即撤）；**非拉仓裸出站仍待批**；`rules.mjs` 越 500 软线 ⇒ 拆案触发。
- **凭据（KD-SV-204）**：落形 = 盒内 git credential helper（写死、拉/推共用）+ 成员绑定一次复用；`POST /api/box/credential` 取件（值零回显零日志）；**推送 = 盒内直推（零服务器审计——如实披露）**；`pull` 事件不携凭据。
- **端点两面不合并**：`commands/:cmdId/result` ∥ `sessions/:id/turns`（回合纯转发零落库）。
- **会话管理面**：列表落定；**删除 = 出案（R79——待裁）**；重命名不做。

#### 验收判据（回指——三链同源）

- **AC-50 判据面**（`gateway/API.md` §5）：双鉴权同判权 ∥ 恒本人 ∥ 在途门 = 工作区级 ∥ 读指令族 ∥ 回合流帧形（纯转发零落库）∥ 凭据三端点（密文零回显）∥ 盒离线 409（读/管理同）∥ 在线判据 ∥ 连接发起方 = 盒。
- **单元测试档**：`docs/batches/2026-10-13-member-face-chat.test.mjs` ∥ `…-ui.test.mjs` ∥ `…-box.test.mjs`（随批档归档；**不入任何门**）。
- **机检读数**（`node scripts/doc-check.mjs --root D:\teamcode\thincoder`，本轮实跑）：行宽 4 ⇒ **2**（余两行 = `docs/core/design/MEMORY.md:854` ∥ `docs/server/design/webui/SANDBOX.md:104`——**均批外域**，列报）∥ 悬空 28 ⇒ **27**（余 27 全在 core/desktop 域——**批外**，列报）；**本批域零红**（MEMBER-AGENT.md:68 拆行 ∥ SANDBOX.md:341 拆行 ∥ MEMBER-AGENT.md:70 裸路径补全——三处本轮收正）。

#### 未决/呈裁

- **R79**：会话删除露钮与否（本席建议 = 做；待裁）。
- **R80**：§1 代价句②「换机/重建 ⇒ 会话不随」与「快照 = 卷全量（含会话）」相抵——按机制 = 会话随快照回；**§1 句面待父侧裁**。

**产品码零触（设计轮）；批档 §2 本段 = 修订轮落笔（§1 未动）。**

**收口前设计回笔（四项——承 §5 盒壳舱终态实读）· eng-designer · 2026-10-14**

**逐项处置（项 → 改动 `file:line`；行号 = 改后）**：

| 项 | 改动 |
|---|---|
| ① 词表回笔（`end.reason` 四扩展值） | `agent/MEMBER-AGENT.md:109`（§3.3 增补句：+ 盒自产扩展四值 `save_failed` ∥ `busy` ∥ `not_found` ∥ `internal`）∥ `:125`–`:128`（§3.4：notice 句收正 + **新条「终态取值面」**——设计词表内三值 + 盒自产扩展四值逐值语义 + `message` 加性字段 + `chat_stop` 直传句） |
| ② KD-SV-158 边界 | `agent/MEMBER-AGENT.md:41`–`:47`（§2 表后 **KD-SV-158 注**：①取证实况 ②裁定句 ③边界读法）∥ `:184`（§3.9 边界句收为「**零新增**」）∥ `:242`（§6 机制行（记忆面）同拍） |
| ③ 行账随正 | `agent/MEMBER-AGENT.md`: `:206`（§5 前言补实读口径句）∥ `:217`（盒壳五档 **1011**）∥ `:218`（`Dockerfile` 19 ⇒ **39**）∥ `:219`（**`.dockerignore` 行新增** +4/−1）∥ `:225`（测试 **五档** 实件）∥ `:190`（§3.10 镜像句现读 39） |
| ④ 审计键集（`accounts/ACCOUNTS.md:79`） | **未落——D5 冻结窗**（该档在被审清单——撤除批设计评审 #141）；父侧窗闭后另行安排。同根拟稿两处在案：`pull` detail key set ⇒ `kind`+`projectId`+`dir`+`ok`（失败另携 `reason`——实现 = `thincoder-server/src/agent/member-pull.mjs:74`）∥ `chat_stop` reason 句 ⇒ **八值**（盒端 `end.reason` 直传七 + server 合成 `box_lost`）；其变更记录行同持（本席零写入——未触写门） |
| ⑤ 变更记录 | `agent/MEMBER-AGENT.md:272`（一行）；ACCOUNTS 行未落（随 ④ 冻结） |

**③ 行账细则（换行计数——`node` 实读；先前 `Get-Content .Count` 少计 10–26 行口径作废）**：

- 盒壳五档 = `protocol.mjs` **167** ∥ `core-run.mjs` **321** ∥ `index.mjs` **323** ∥ `pull.mjs` **114** ∥ `git-cred.mjs` **86**——合计 **1011**（设计预算 ≈730 ⇒ **+38%**）。
- `deploy/sandbox/Dockerfile` **39**（git 基线 18——净 +21；设计行旧记 19〔split 口径〕∥ 记录行旧记 29——两值均与实读不合，以 39 为准）。
- 仓根 `.dockerignore` **+4/−1**（`!thincoder-core` 两行 + 白名单注释两行改一；批档 §5 旧记 +5/−1——复读收正）。越设计 §5 声明域——如实入账。
- 测试实件 **五档**（2026-10-14 02:28 实读）：`…test.mjs` **758**（server 修复轮在途——读数时点）∥ `…-ui.test.mjs` **613** ∥ `…-box.test.mjs` **497** ∥ `…-box-core.test.mjs` **471** ∥ `…-harness.mjs` **347**；旧形「三档 ≈900」/「730 + 484 + 451」随正。
- **§2.4 旧形随正（本注为准）**：新五档名 = `member-relay` ∥ `member-routes` ∥ `box-routes` ∥ **`member-cred`**（原记 `member-store` 作废）∥ `member-pull`；`db.mjs` **±0**（v23 段入 `src/store/migrations.mjs`——原记「db.mjs +≈70」作废）；测试 = 五档实件（原记「三档」作废）。**服务端五档 / 页面三档实读值 = 留收口轮（server/webui 舱在途——不抢先回填）。**

**② 取证要点（实落码——盒壳五档零触）**：盒内核**实际激活**记忆面 = `createMemory` 恒开库建文件（`thincoder-core/memory/schema.mjs:80-82`——`<HOME>/.thincoder/memory.db`；盒内 HOME=/workspace/home ⇒ 落盒卷）∥ 装配即同步项目层（`thincoder-core/agent/assemble.mjs:86-89`）∥ 工具面含 `memory`（六 action）+ `code_search`/`doc_search`/`repo_outline`（`thincoder-core/tools/index.mjs:70-74`）∥ 回合装配期注入读本地库（`thincoder-core/agent/setup.mjs:99-159`）。

**裁定句（原文——落点 `agent/MEMBER-AGENT.md:45`）**：「**合规豁免（带理由）**：盒内本地记忆面 = 核件原样携带（**零本批新增件、零新增接线**）——不在『实现客户端式本地记忆』之列（19:35 为范围句：成员面不新增本地记忆设计）；『关面』须改盒侧核行为——与『核默认行为零改造』（KD-SV-152 裁定理由）∥『核家族全件·不减项』（KD-SV-159）两裁相抵 ⇒ 如裁『关』= 另轮另裁。」（依据 = 用户已裁三句 19:35/16:36/15:57；本席导出——非用户新句。）

**披露（不阻塞——逐条列报）**：

- 同词表另两处未随正（**批外档**）：`gateway/API.md:307`（「本面增补 = `begin` 帧 + `end.reason` 新值 `box_lost`」——未携四扩展值）∥ `webui/CHAT.md:131`/`:181`/`:196`/`:247`（「notice 映射 = 管理面五值 + `box_lost` 第六值」四处——页面映射表实为 5+1；四扩展值走「枚举外 ⇒ 原值兜底」——`views-me-chat-messages.mjs:37-55` 在案）。归属 = gateway/webui 舱收口面。
- `src/agent/member-relay.mjs:125` 代码注释仍载「reason 六值：管理面五 + `box_lost`」——与实传行为（盒扩展四值直传——`:71`/`:134`）不合；**产品码面（在途修复轮）——零触，列报**。
- 测试主件与 `member-relay.mjs` 在本轮期间仍在增长（729 ⇒ 758 ∥ 300 ⇒ 310）——本档不引其终值（收口轮回填）。
- `.dockerignore` ∥ `Dockerfile` 旧记录值差（+5/−1 vs +4/−1 ∥ 29 vs 39）= 量具混用残留——已按实读收正。

**边界**：**零新语义**——①③ = 实落事实回写（词表/行账）；② = 边界裁定（依据 = 用户已裁三句明确在册——本席导出）；⑤ = 变更记录；④ 未落（冻结）。产品码/测试码零触；需求档零触；盒壳五档零触；只动设计一档（`agent/MEMBER-AGENT.md`）+ 本档 §2。

**机检**（`node scripts/doc-check.mjs --root D:\teamcode\thincoder`——2026-10-14 02:3x 实跑）：**行宽 = 唯一命中 = 本席改中行 `MEMBER-AGENT.md:109`（313 字符）⇒ 同轮折行收正 ⇒ 复跑 OK（0 条）**；**锚 = 悬空 42（闸态——逐条归属 core/desktop/render-core 域 + server 域一条 `agent/ADMIN-AGENT.md:580`——本席零触、归属列报）；本席本轮改动面零闸红**（`MEMBER-AGENT.md` 仅两条「符号·宽——报告面，不入闸」既往存量）；行数面差异 83 条 = 报告态（回填工单另属）。

**产品码零触（设计轮）。**

**收口前设计回笔 ④ 补落 + 词表批外两处收正（fix 轮）· eng-designer · 2026-10-14**

**来源** = 父侧派发（承本档 §2「收口前设计回笔」④（D5 冻结窗未落——窗闭后补）+ 该段披露「同词表另两处未随正」——父侧路由回笔）。**性质** = 设计档收正（零产品码 · 零新语义）。

**逐项处置（项 → 改动 `file:line`；行号 = 改后）**：

| 项 | 改动 |
|---|---|
| ④ 键集（`pull`） | `docs/server/design/accounts/ACCOUNTS.md:79`——detail 键集列补 `projectId?`/`dir?`/`ok?`；`pull` 子项补「detail 键集 = `kind`+`projectId`+`dir`+`ok`（失败另携 `reason`——实现 = `thincoder-server/src/agent/member-pull.mjs:74`）」 |
| ④ 同根（`chat_stop`） | 同行——reason 六值 ⇒ **八值**（盒端 `end.reason` 直传七（`aborted`/`budget`/`model_error`/`save_failed`/`busy`/`not_found`/`internal`）+ server 合成 `box_lost`）；原列「空回合 ∥ 重启中断」系管理面专有（盒不发）随正删（D8） |
| 词表批外 ① | `docs/server/design/gateway/API.md:307`——本面增补句补 `end.status/reason` 限定 + `box_lost`（server 合成）+ 盒自产扩展四值 `save_failed` ∥ `busy` ∥ `not_found` ∥ `internal`（语义 = `agent/MEMBER-AGENT.md` §3.4） |
| 词表批外 ② | `docs/server/design/webui/CHAT.md:131`/`:181`/`:196`/`:247`——「第六值」序数表述 ⇒ **`end.reason` 六值面**（管理面五值 + `box_lost`）口径四处同拍；盒自产扩展四值枚举外 ⇒ 原文兜底在册（§2.2⑤ = 本面单源句） |
| 变更记录 | 三档各一行（沿体例）：`accounts/ACCOUNTS.md:285` ∥ `gateway/API.md:571` ∥ `webui/CHAT.md:274` |

**口径登记（②「六值面」读法）**：照父侧原文落形——「六值面」= **页面映射面**（管理面五值 + `box_lost`；页面实件 = `views-me-chat-messages.mjs:37-55`——六键 + 枚举外原文兜底）；`end.reason` 帧面全量 = **八值**（单源 = `agent/MEMBER-AGENT.md` §3.4——见 ④）。两说为面别之分（映射集 ⊆ 帧面），非冲突。

**边界**：**零新语义**（④ = 实落键面/词表回写；①② = 词表口径随正）；未动 `agent/MEMBER-AGENT.md`（已收口）∥ 未动 `member-relay.mjs` 代码注释（产品码——在飞修复轮）∥ 需求档零触 ∥ 其余档零触。

**机检**（`node scripts/doc-check.mjs --root D:\teamcode\thincoder`——改前/改后实跑）：改前 = 悬空 **42** ∥ 行宽 **0** ∥ 行数面差异 **82**（报告态）∥ 候选 63144；本席改后即时 = 悬空 **42** ∥ 行宽 **0** ∥ 候选 63174——**本席三档零新增红**（✗ 行 = 既往存量三项：`ACCOUNTS.md:74`/`:273` ∥ `gateway/API.md:535`——「拟新增/迁移期引文——列报 · 不入闸」；改前同项同字）。
**并发他写注记（列报）**：本席改后即时读数与末次复读之间，仓内另有在飞批写入 ⇒ 全仓行宽 0 ⇒ **1**（`docs/server/design/webui/SANDBOX.md:107`——347 字符——`sandbox-onboarding-removal` 批面）；**非本席改动面**（本席其间零写入），归该批/父侧。

**读回**（D6——逐处实读在位）：`ACCOUNTS.md:79`/`:285` ∥ `gateway/API.md:307`/`:571` ∥ `webui/CHAT.md:131`/`:181`/`:196`/`:247`/`:274`。

**产品码零触（设计轮）。**

## §3 设计评审（评审子代理）

### 轮次 1（评审子代理）

| # | Category | Severity | Issue | Suggestion |
|---|----------|----------|-------|------------|
| 1 | Document ownership（机制描述相抵） | 🔴 | 同一机制两处相抵（且指错决策号）：`docs/server/design/agent/ADMIN-AGENT.md:195`「**成员面 agent 的 server 域工具面**（2026-10-13 起 = `agent/MEMBER-AGENT.md` §2 KD-SV-153——分阶段：本批含读面四件 + `exec`；写面工具族随后续——本档 16:04 口径经该批承接）」，`:16` 同句「其 server 域工具面归属随该批（该档 §2 KD-SV-153——分阶段）」；而 `docs/server/design/agent/MEMBER-AGENT.md:34`（KD-SV-159）载「动作集 = 写面同集——单源」且「管理面运维件（docker/主机/exec/provider）不入成员面」（`:143` 同）——工具集取向与 `exec` 含否两说相反；归属决策号 = KD-SV-159（153 = 盒接入协议，同档 `:28`） | 取单一读法收正（ADMIN-AGENT 两处指向改 KD-SV-159 并按 MEMBER-AGENT 口径改写，或把「读面四件 + exec」的阶段句落进 MEMBER-AGENT §3.7 后两档同拍）——实施前须闭合 |
| 2 | Affected-file annotations | 🟡 | 两新码的落点缺行账且与 §4 相抵：`docs/server/design/gateway/API.md:309`「**两新码**——409 `workspace_offline`…∥ 400 `workspace_limit_reached`」按先例落在 gateway 域错误形件（同档 `:331` `errors.mjs` 行；沿同处「`sandbox_unavailable` +≈2」之例 ⇒ 两码 +≈4），但同档 `:332` 记「±0（member-face-chat 批：成员面/盒面端点 = agent 域档组——本表不列）」，且 `agent/MEMBER-AGENT.md` §5（`:194`）与批档 §2.4 受影响文件表均未列该档 | 补 `errors.mjs` 行账（现读 ⇒ ≤±N，含两码）＋ §4 小计随正；若两码确不经该件，在 §2.11 前言写明落点 |
| 3 | Clarity（契约面） | 🟡 | 成员面会话行形缺 `reasoning`：`gateway/API.md:269` 列表行 = `{ id, workspaceId, workspaceName, model, status, excerpt, agentOnline, updatedAt }`；`:271` 详情 `session` 行形未列、`:275`「`PATCH` … ⇒ 200 `{ session }`」未定形；而管理面同款行形已含（`:196`「`{ id, model, reasoning, status, createdAt, updatedAt }`」）。成员页档位面 = 「开机」态且按 KD-SV-111 同口径需切会话推送回读（钮字随会话档位）（`webui/CHAT.md:131`）——无该读数则档位面不可兑现（AC-50① 差异清单第⑥条） | 成员面会话行形（列表/详情/PATCH 回执三处同源）补 `reasoning`，与 §2.8 对齐 |
| 4 | Document ownership（覆盖） | 🟡 | 新审计型 `member_event` 的登记单源未入随动清单：`store/STORE.md:590`「② audit_events 表重建（十五型 ⇒ 十六型：+ member_event——步序与 v10/v11/v14/v17/v20 同构）」∥ `gateway/API.md:281`「审计：`member_event`（`chat_start` ∥ `chat_call` ∥ `chat_stop` ∥ `pull`——四 kind）」；型/kind 登记单源 = `accounts/ACCOUNTS.md` §2.1（沿 `store/STORE.md:545` v20 段同款句），但批档 §2.2（`docs/batches/2026-10-13-member-face-chat.md:42`「**随动八档（逐处）**」）实列 7 档、未含该档（档数计数亦差一） | 随动清单补 `accounts/ACCOUNTS.md` §2.1 一条（十六型 + 四 kind + detail 键集）并收正档数 |
| 5 | Document ownership（状态相抵） | 🟡 | 同档状态相抵：`sandbox/SANDBOX.md:350`「**成员写面**（member-face-chat 批——本批开）：创建 ∥ 启动 ∥ 停止 ∥ 销毁（确认门）+ 拉仓」vs `:632`「**成员面余项（不做——本批）**：成员写面（启动/停止/销毁/轮换——随 #1216 ② 权限模型）」＋同句「本批只落读面 + 待批提示」；`:614` KD-SV-138 亦载「零写控件（写面随 #1216 ②）」（KD-SV-156 = 待裁·出案） | §15 与 KD-SV-138 随正（写面 = 本批开；轮换/快照恢复仍管理面），或标注「待 KD-SV-156 裁定后收正」 |
| 6 | Methodology（状态一致性） | 🟡 | 「待裁·出案」射程两说不一：批档 `:68` 起「### 2.6 关键决策（本批——**全部「待裁·出案」，裁定后收正**）」列举 152–159 全八项；`agent/MEMBER-AGENT.md:23`「带「待裁·出案」= 本批向用户呈案（五题逐题 + 归属 + 记忆面）」——但表内仅 `:27`–`:32`（152–157）带标，`:33`（KD-SV-158，注「方向已裁」）与 `:34`（KD-SV-159）无标 | 定单一读法（补 158/159 标或收正批档「全部」句），并同拍 AC-50⑥ 回填面/批准射程 |
| 7 | Clarity（判据源） | 🟡 | 拉仓「目标目录冲突」判据无取数面：`gateway/API.md:278`「目标目录冲突 ⇒ 400 人话」∥ `agent/MEMBER-AGENT.md:129`「缺省 = 仓名（`/workspace/<名>`；冲突 ⇒ 人话拒）」——未写冲突检出点（server 无盒卷目录读通道/端点；§3.6 步骤 5 的失败分类在盒结果面） | 定形检出点（明写冲突 = 盒执行 failed 分类回呈并收正 400 出处，或给出预检取数面及其上行形） |
| 8 | Feasibility/Clarity | 🟡 | 盒上行回合流的体读面对位未写：`gateway/API.md:287`「流形 = 下行 SSE…+ 上行 NDJSON（流式请求体）」；现盘 `server.mjs` = 「body 读限（32 MiB）」（`:317`）且写端点走「JSON 型门」（`:264` 等）——「server 边收边落库 + 转发浏览器流」（`agent/MEMBER-AGENT.md:85`）所依赖的请求体增量消费面未见写明（谁提供/路由级例外/上限） | 机制节与 §2.12 明写体读口径及所需随正件（如涉 `src/gateway/server.mjs` 则补行账） |
| 9 | Clarity（指针） | 🟡 | 拉仓清单端点指到不存在的名：`agent/MEMBER-AGENT.md:30`（KD-SV-155「清单 = `/api/me/projects` 复用」）∥ `:128`「选项目 = `GET /api/me/projects`」；现盘成员项目面 = `/api/projects`（`gateway/API.md:20` 路由族表 ∥ `:218` `GET /api/projects?q=`） | 收正为 `GET /api/projects?q=`；若确为新增端点，补 §2.11 行与判权面 |
| 10 | Clarity（机制面） | 🟡 | 盒在线/掉线判据缺对端确认回路：`agent/MEMBER-AGENT.md:78`「在线 = 连接在 ∧ ping 未欠 3 周期」∥ `:100`「掉线（SSE 断 ∨ ping 欠）」；事件表（`:70`–`:76`；`:76`「| `ping` | `{}` | 保活（缺省 20s——设计值） |」）仅下行 ping、无上行 ack/pong——「未欠」无取数面（AC-50⑤ 在线态与 `box_lost` 收尾依赖之） | 明写 liveness 实现面（上行确认帧 ∨ 写失败/TCP 错误计数），或收正判据为可实现表述 |
| 11 | Closest-precedent | 🟡 | 最近先例段（`agent/MEMBER-AGENT.md:5`–`:9`）三坐标含「设计档节 + 先例批」，缺实现坐标（代码 file:line）；偏离③（key 第二门）理由 = 「token 两用先例 = `client/CLIENT.md` §2 兼作 `/v1` 凭据」（`:8`）——系支持性先例，未明写「既有形为何不适用」 | 补实现坐标（管理面 relay/帧面与壳两件的件坐标）并补偏离③的理由句 |
| 12 | Affected-file annotations（配置面） | 🟡 | 新设置键未入键集单源：`agent/MEMBER-AGENT.md:142`「`memberWorkspaceLimit`（`sandbox_settings` 键——缺省 **3**）…写面 = 控制台沙盒页设置区最小件」∥ `:31` KD-SV-156；而 `gateway/API.md:165` settings 行键枚举（`cpus`…`tmpfsMb` ∥ `image`）无该键、`sandbox/SANDBOX.md:342`「`sandbox_settings` 逐键 ↔ 卡面对照」亦无（批档 API 随动面未含 §2.5） | 键集单源两处补 `memberWorkspaceLimit`（形/范围校验 + UI 写入口对照），或随动清单明列 §2.5/§8 对照表随正 |
| 13 | Feasibility（依赖·未验证） | 🔵 | 回灌保底形缺核坐标：`agent/MEMBER-AGENT.md:61`「缝未落前保底 = 用核导出写面函数重建（仍属「取自核」）」——`agent/ADMIN-AGENT.md` §17.2（`:480` 起，「本清单 = 「服务端消费哪些核件」单源」）未见会话重建/写面件；该断言在本评审面不可核（unverified——核件在产品码面，本轮零触） | 补保底形核件坐标或标为实施期探明项，与 R76（`MEMBER-AGENT.md:234`）同处登记 |
| 14 | Affected-file annotations | 🔵 | 随正件行未逐件标现读/增量：`agent/MEMBER-AGENT.md:194`（现读「——」、预算「小」）列 `style.css`（无增量值）与 shell 两表（增量 = +1/表——批档 `:59`，但 `webui/WEBUI.md:184`/`:191` 两行未随本批） | 按顺批口径补「现读 ⇒ ≤±N」注并随正 `webui/WEBUI.md` §5 两行 |
| 15 | Clarity | 🔵 | 展示形截断口径两值：管理面 `call.args` = 掩蔽后截断 ≤500 字（`gateway/API.md:199`）∥ 成员面「按管理面同款掩蔽/截断（展示形 ≤300）」（`agent/MEMBER-AGENT.md:88`；`:103` 同）——「同款」与数值不一 | 统一单值或写明 `args` 例外 |
| 16 | Numeric drift | 🔵 | 预算合数与分项和不闭合（沿「小计 = 分项和」复算纪律）：批档 `:57` 与 `PROJECT.md:750` 两处「新五档 ≈920」，其分项 220+250+200+140+130 = 940；同处「服务端 净 ≈+1000」与 920+70+60 = 1050 不合；「webui 净 ≈+870」与其分项（830 ＋ 两表 +≈40/表 ＋ shell 两表 +1/表 ＋ 小量 ⇒ ≥≈912）不合 | 三处按分项和复算收平（单一闭式） |
| 17 | Clarity（用例号） | 🔵 | 用例号全域相撞且未面别限定：`agent/MEMBER-AGENT.md` §7 的 N71–N78 ∥ B69–B72 ∥ E54–E56 与 `agent/ADMIN-AGENT.md` §8（`:130` 起）既有同号用例逐号重合；本仓先例 = 跨面重号须「面别限定」（`webui/CHAT.md:262` 同款修正） | 加面别限定（如「成员面用例 N71…」）或让号续 ADMIN-AGENT 尾号 |
| 18 | Requirements（出案可见性） | 🔵 | 模式旗三枚（计划/自动批准/工程模式）v1 = 随五枚隐藏（`webui/CHAT.md:129`「补齐 = 出案——用户「跟 VSC 基本一致」射程内，收口轮实走可裁」）——「界面基本一致」射程内的显式出案项 | 在批准材料与收口轮走查清单保留该条，避免收口阶段漏判 |

VERDICT: changes-required

计数：发现 18 条 = 1🔴 + 11🟡 + 6🔵；阻塞项 = #1（机制级描述相抵 + 决策错号指针，须先闭合）。审查面：批档 + 新档 + 随动七档共 9 档全文（需求档/产品码按 review-object 声明排除）。

### 轮次 2（评审子代理）

核验（修正轮 1（#78）落地——承轮次 1 之 18 条，逐条实读）：#1（🔴）已闭合——`agent/ADMIN-AGENT.md:16-17`/`:196` 与 `agent/MEMBER-AGENT.md:149` 三处同指 KD-SV-159、口径单源；「读面四件 + exec」规范面残留零（仅记录面按史留存，`:597` 已记收正）。#2–#17 逐条落位（两新码行账：`gateway/API.md:334`/`:335`/`:320`；会话行形含 `reasoning`：`:269`/`:281`；`ping` 上行与在线判据：`agent/MEMBER-AGENT.md:80`/`:91`/`gateway/API.md:293`/`:297`；先例段实现坐标与偏离理由：`agent/MEMBER-AGENT.md:5-11`；设置键单源：`gateway/API.md:165` ∥ `sandbox/SANDBOX.md:343`；审计型登记：`accounts/ACCOUNTS.md:29`/`:75`/`:77-78`；九处「（拟新增）」标记；面别限定：`agent/MEMBER-AGENT.md:221`/`:223-225`；预算复算见下表 #4）。#18 = 父侧承接待续（本面无落点可验，unverified）。残留 6 条：

| # | Category | Severity | Issue | Suggestion |
|---|----------|----------|-------|------------|
| 1 | Methodology（状态一致性——#6 未收尽） | 🟡 | `agent/MEMBER-AGENT.md:26`「带「待裁·出案」= 本批向用户呈案（五题逐题 + 归属 + 记忆面）」仍把归属/记忆面归入呈案，与同档 `:212`「158（方向已裁）/159（归属落定）= 已定登记——不入呈案集」相抵（批档 §2.1⑥/§2.6 已收窄；表内 KD-SV-158/159 行零标） | 该句收窄为「（五题逐题——KD-SV-152–157）」或把 158/159 改列已定登记（定单一读法） |
| 2 | Document ownership（登记覆盖） | 🟡 | `accounts/ACCOUNTS.md:71` 的 `sandbox_event` 行（actor = admin（名快照））未载本轮成员写面写入形——`gateway/API.md:283` 与 `agent/MEMBER-AGENT.md:217` 两处载「工作区动作 = `sandbox_event` 行（kind 沿既有枚举，detail 携 `by:"member"`）」，该 `by` 键与成员为 actor 未入单源行 | §2.1 `sandbox_event` 行补成员写入形注（actor/`by:"member"`——随 KD-SV-156 裁定同拍） |
| 3 | Methodology（文档规范——记录面缺轮） | 🟡 | 本轮（设计评审轮 1 修正）仅 `agent/ADMIN-AGENT.md:597` ∥ `agent/MEMBER-AGENT.md:247` 两档在「变更记录」留条目；另七档（`gateway/API.md` ∥ `accounts/ACCOUNTS.md` ∥ `store/STORE.md` ∥ `webui/CHAT.md` ∥ `webui/WEBUI.md` ∥ `sandbox/SANDBOX.md` ∥ `docs/server/design/PROJECT.md`）零本轮条目（`accounts/ACCOUNTS.md` 连设计轮条目亦缺）——与既往「触及即记」惯例不合；后果实例 = `gateway/API.md:531`（记录面「增 §2.12（四行…）」「§4 小计行补本批 ±0 注」）与现规范面（`:361`「§2.12 **五行**」∥ `:335`「⇒ **+≈9**」）不同拍且无本轮记录作桥 | 逐档补「设计评审轮 1 修正（fix 轮）」变更记录一条 |
| 4 | Numeric drift（#16 复算残） | 🔵 | ① `docs/server/design/PROJECT.md:750` 与批档 §2.4 闭式「940 + 70 + 60 + 1」= 1071 ≠ 标称「≈+1070」（gateway 域 +≈9 未并入该口径——批档 §2.4 单列）；② `agent/ADMIN-AGENT.md:72` 仍载「成员面五档 ≈920」（现盘单源 = 940：`agent/MEMBER-AGENT.md` §5 ∥ `PROJECT.md:751`）；③ `PROJECT.md:882`（记录面）旧数 ≈+1000/≈+870 按史留存 | ①按分项和收平（1071 ∥ 1070 取一）；②同拍 940；③如需单一闭式宜注记 |
| 5 | Affected-file annotations | 🔵 | `agent/MEMBER-AGENT.md` §5 随正件行「`thincoder-server/bin/thincoder-server.mjs`（装配一行）」未携现读/增量注（同批其余随正件均已补现读） | 补「现读 ⇒ ≈+1」 |
| 6 | Note（评审面限制——如实登记） | 🔵 | ① 批档 §2.12 doc-check 读数（悬空 49 ⇒ 34 ∥ 超宽 30 ⇒ 29）与机械结论本评审面不可复算（无脚本执行面——unverified）；② 第 18 条父侧承接面（批准材料/收口轮走查清单）无落点可验（§4 未着笔——unverified）；③ 未获项目 standards 文档与 document map（Document ownership 维度降级判） | 无需改动——限制登记（机械闭环 = 收口轮 doc-check 复读） |

VERDICT: pass

计数：发现 6 条 = 0🔴 + 3🟡 + 3🔵；18 条核验：17 条落地（#1 🔴 已闭合）+ 1 条父侧承接待续；阻塞项 = 无。

## §4 用户批准（主 agent）

**§4 用户批准（主 agent 代签）**——用户 2026-10-13 20:09「自动跑」（授权口径 = §1 末段）。

- **条件齐备**：① 评审 **pass**（§3 轮次 1——10 条全采纳；轮次 2——计数 = 🔴0 ∥ 🟡3 ∥ 🔵3；残余 5 条采纳、1 条限制登记）；② 修正轮 1（#78 · 18 条）∥ 修正轮 2（#84 · 5 条 + 记录面）落地并核读（父侧 2026-10-13 21:0x）＋ 计数随正（`accounts/ACCOUNTS.md` 六处「十五型」⇒「十六型」——父侧直接执行 · 可 revert，沿 team-ledger 批先例）；③ 令牌已签发（在槽——运行态凭据，值不落档；出档记为「评审通过」）。
- **批准范围** = 本批实施（§2 受影响文件表全表——服务端五新档 ∥ webui 三新档 ∥ 盒壳四档 ∥ 随正件 ∥ 用例三档；零触面见 §2）。
- **随批备注**：① 实施派发时序按用户 2026-10-13 裁（「先把重做批跑了」——父侧 A/B 问之答）：**成员面实施前置 = 沙盒执行面重做批**（§1「实施前置」句 ∥ 需求档 `docs/server/requirements/PROJECT.md` §5）——批准不堵、派发待前置落；② KD-SV-152–157 五题呈案待裁（呈案材料 = 父侧呈案单）；③ #18（模式旗三枚）承接 = 父侧批准材料/收口走查清单。
- **依据登记** = §2 ∥ §3；父侧代签（用户 2026-10-13 20:09 授权）；可撤回。

**用户批准（2026-10-14）**：随版放行——用户 09:02「发版」+ 09:05「含」（发布计划确认）。本批全部舱位已交付、父侧逐件复验在案（webui 11/11 ∥ 掩蔽点修 19/19 ∥ 回笔 #140/#144 全落）；未逐项复述（证据 = §5 各段）。

## §5 实施记录（eng-coder）

**范围（eng-coder · 盒壳舱 · 2026-10-14）**：本批三舱并行（server ∥ webui ∥ **盒壳**），本舱 = 盒内件（`member-shell/**` + 盒镜像 Dockerfile）；声明档 4 档（protocol/core-run/index/pull），**实交 5 档**（多 `git-cred.mjs`——设计 §3.6/KD-SV-204 要求盒内 git 凭据助手；超出 spawn 档单，如实披露）。

**落盘（实读行数——实施当刻）**：

| 件 | 行数 | 职 |
|---|---|---|
| `thincoder-server/deploy/sandbox/member-shell/protocol.mjs` | 157 | 帧编解码（SSE 六事件 ∥ NDJSON begin+六帧+end；纯函数腿） |
| `thincoder-server/deploy/sandbox/member-shell/core-run.mjs` | 291 | 核回合驱动（装配/施槽/runAgent/落槽；会话读写投影） |
| `thincoder-server/deploy/sandbox/member-shell/index.mjs` | 304 | 进程入口（SSE 连挂 ∥ 上行 NDJSON ∥ 重连退避 ∥ 指令/拉仓分发） |
| `thincoder-server/deploy/sandbox/member-shell/pull.mjs` | 98 | `git clone` 执行 + 失败分类（dir_conflict/auth/network/other） |
| `thincoder-server/deploy/sandbox/member-shell/git-cred.mjs` | 71 | git credential helper（`get` ⇒ 取件；`store`/`erase` 零操作） |
| `thincoder-server/deploy/sandbox/Dockerfile` | 19 ⇒ 29 | 核 pack+装到 `/opt/thincoder/app` ∥ 壳 COPY ⇒ `shell/` ∥ 助手登记 ∥ CMD |
| `.dockerignore`（仓根） | +5/−1 | 放行 `thincoder-core`（构建上下文 = 仓根 ⇒ 必需） |
| `docs/batches/2026-10-13-member-face-chat-box.test.mjs` | 846 | 盒腿单元测试 31 例（实跑 31/31 绿） |

**行账 vs 设计 §5 预算**：设计 ≈730 行（protocol≈160 ∥ index≈250 ∥ core-run≈200 ∥ pull≈90 ∥ git-cred≈60）；实交 ≈921 行（+26%，主因 = 头注/注释密度与防御面分支；功能面零缺——审计「PARTIAL 0 ∥ SILENT-SIMPLIFICATION 0」）。预算行账的正式回填 = 设计档（非本舱笔），漂移在此登记。

**测试实跑**（唯一跑法——本批目标件）：
`cd thincoder && node --test docs/batches/2026-10-13-member-face-chat-box.test.mjs` ⇒ `tests 31 ∥ pass 31 ∥ fail 0`。
覆盖 = §7 成员面 B69–B72 盒内部分（C6 掉线/服务端重启 ∥ C5 在途单飞 ∥ B8 换机零本地态）∥ E56 盒内部分（C7 退避重连）∥ 协议腿形逐字（A1–A5）∥ 核接口面（B1–B7）∥ 指令/拉仓/凭据（C8–C10 ∥ D1–D2 ∥ E1–E3）∥ Dockerfile 语法可构建性（栈内检查，不实建——F1/F2）∥ 壳零 agent 循环（F3 import 面断言）。

**决策透明表**：

| # | 决策 | 依据 | 面 |
|---|---|---|---|
| 1 | 壳经 `core-run.mjs` 单点接核（`assembleAgent`/`runAgent`/`applySession`/`saveSession`/`loadSlotFile`/`listSlots`/`newSession`/`setSlotPrefs`），零自持循环/提示词/工具表 | §3.10「最小壳」＋ AC-50④ | 设计内 |
| 2 | **核接口假设①（自定形）**：配置桥 = 核 `loadConfig()` 全默认 + 覆写 provider 面（单渠道 `server`，`OPENAI_BASE_URL`/`OPENAI_API_KEY`；`providers[].model` 不设——渠道单值模型 2026-10-09 退场） | 核 `loadConfig` 不读 env；盒无 config.json ⇒ 全默认 | 实施自定，已上抛 |
| 3 | **核接口假设②（自定形）**：会话行形 `{ id, model, reasoning, status, excerpt, updatedAt }`（`id` = 槽号；复合 `.id` 由 server 拼） | 设计未钉行形；server `sessionRowOf`（`member-routes.mjs:61-74`）逐字段同形 | 与 server 面已对齐 |
| 4 | `end` 帧 `reason` = 短值（aborted/budget/model_error）＋盒自产扩展 save_failed/busy/not_found/internal；人话明细进**加性字段** `message` | §3.4 显式写 `end{failed, reason:"aborted"}`；§11.3「加性扩展（end 增可字段）」 | 设计内 + 加性 |
| 5 | 事件 token 剥离（relay 前缀 + `⟦ev⟧…` + `[model]`）后**零转发**（帧词表无 subagent 框） | 沿 ACP 桥判据（`thincoder-core/agent/subagent-event.mjs` 单源） | 实施自定，已登记 |
| 6 | 在途单飞 = 盒侧兜底（第二 `run` ⇒ 立即 `failed/busy` 流）；服务端在途门为正门 | §3.4 在途门粒度 = 工作区 | 设计内 |
| 7 | 拉仓：clone **前**去 URL userinfo（设计写「clone 后 remote 去凭据」——等价更严形：凭据一步不落盘） | §3.6 步骤 4 | 等价形（审计判可接受） |
| 8 | 盒内 `cwd` = `/workspace`；相对 `dir` 解析到 `/workspace/<dir>`（server 发送相对形） | §3.6 ＋ server `member-pull.mjs:28-34` | 与 server 面已对齐 |

**审计与代码评审轮次与终态**：内部 explore 分歧审计 **1 轮**（findings=5：真分歧 1 ∥ 需上抛 3 ∥ 可接受 1；PARTIAL 0/SILENT 0）⇒ fix round 1（真分歧收口 + 词表收窄，31/31 复跑绿）⇒ advisor 代码评审 **1 轮**（结论随末行补记）⇒ 终态随末行补记。

**fix round 1（响应审计）**：
- 真分歧 #1（溢出行为·轻微）：`abort` 事件携的 cmdId = **回合** cmdId（server `pending` 表只登记 `runCommand`/`sendPull`）⇒ 原「abort 结果回呈」POST 恒被 400。**收口 = 删除该 POST**（终态回呈 = 该回合流的 `end{failed, aborted}`，§3.4）；测试 C4 同改（断言「零 `/commands/` 上行」）。
- 词表 #2（DOC-DRIFT）：`provider_invalid` 归并入 `model_error`（少一扩展值）；可达扩展值 = save_failed/busy/not_found/internal，逐值在此登记；`protocol.mjs:149-152` 注释同源改写。
- #3（掩蔽未落）/#4（记录面）/#5（等价形）= 上抛/记录项，见下。

**上抛与披露**：
- `[上抛·知会]` 跨面 #3：设计 §3.3/§3.4 写「转发浏览器前按管理面同款掩蔽/截断」，server 面 `member-relay.mjs:79-84` 只 cap（args ≤500 ∥ summary ≤300）**未掩蔽**（`maskSecrets` 仅存 `chat.mjs`/`tools.mjs`/`hosts.mjs`），且 `result.content` 原样透传；盒侧无掩蔽表（`protocol.mjs` 头注明），**盒不越权、未做掩蔽** ⇒ 归属 server 舱。
- `[上抛·知会]` 跨面 #6：`hello.redeliver` 清单已发但 server **零重派实现**（`member-relay.mjs:160-164` 只列 cmdId；`sendPull` 无超时）⇒ 盒掉线时未收尾的 pull 在 server 悬置。盒侧按 §3.4「重连零对齐」零动作——如裁「盒应补」，另单开。
- `[上抛·知会]` 越声明域：改仓根 `.dockerignore`（+5/−1）——原白名单不含 `thincoder-core`，而本批盒镜像构建上下文 = 仓根（`EXECUTION.md` §8）⇒ 必需；同批 `thincoder-server/Dockerfile` 零触。
- `[上抛·知会]` 核接口假设①②（表 #2/#3）——server 面已落盘对齐；核侧运行时装载未在本机验证（镜像内才可解析；开发机无 `node_modules/@thincoder/core`）。

**fix round 2（响应 advisor 代码评审第 1 轮：verdict = changes-required——2🔴 ∥ 2🟡 ∥ 7🔵）**：

- 🔴#1（入口判据未解析变体——真机符号链接形下取件链静默死）+ 🟡#3（同根因第二处）：两档收正为仓内已锁形式 `pathToFileURL(realpathSync(process.argv[1]))`（KD-SV-53 · `ops/OPS.md` KD-SV-53 行 · 先例 `bin/thincoder-server.mjs:245`），凡不可解析 ⇒ 抛（显式，不静默）。**新证据**：`git-cred.mjs:81` 与 `index.mjs:317` 判据行；测试同批加两条——`E4`（镜像内调用形：助手经符号链接跑 ≡ 直跑，**本机实跑绿**——旧形必红）∥ `F4`（#1114 字面锁：`realpathSync(process.argv[1])` 在案 ∥ 未解析变体零残留）。
- 🔴#2（单档 871 行越 800 硬限）：按腿拆两档——`…-box.test.mjs` = **484 行**（协议码 A ∥ 壳连挂 C ∥ 拉仓执行 D）∥ `…-box-core.test.mjs` = **451 行**（核接口面 B ∥ 凭据助手 E ∥ 镜像面 F）；用例逐条保真（31 → **34**：新增 E4 ∥ F4 ∥ B9，原例编号与断言不变）。拆档 = 超出设计 §2.4「测试三档」清单的第四档，如实披露（依据 = 仓内文件行限与 me-keys 拆档先例）。
- 🔵#5（记录面漂移）：本段即回填——**实施当刻实读行数**：`protocol.mjs` 157 ∥ `core-run.mjs` 294 ∥ `index.mjs` 305 ∥ `pull.mjs` 102 ∥ `git-cred.mjs` 72（五档合计 **930**，设计预算 ≈730 ⇒ +27%）∥ `Dockerfile` 29 ∥ 仓根 `.dockerignore` +5/−1 ∥ 测试 484 + 451（合计 935）。上表旧读（846 ∥ ≈921）作废，以本段为准。
- 🔵#6 响应码留痕 / 🔵#7 重连退避归一（去掉 200ms 快径——「接受即断」不再成无增长快环，退避 1s→30s 封顶恒一径）/ 🔵#8 拉仓目标围栅（`..` 逃逸 ∥ 工作区外绝对路径 ⇒ `failed`/`other`，不落区外）/ 🔵#9 SSE 解码尾字符收尾 flush / 🔵#11 excerpt 按核单源 `isRealUserMsg` 跳过 `[System reminder:` 行——**五项已修**，各带测试（D2 追加围栅例 ∥ B9 新增）。
- 🔵#10（`session.update` 双携容忍）：**不改**——设计侧 `gateway/API.md` 定「双携 ⇒ 400」由 server 门把守（`member-routes.mjs:230-232` 已实现），盒侧再立第二判据 = 双源；已写入 `core-run.mjs` 出口注释口径。
- 🟡#4（`end.reason` 扩展值 save_failed/busy/not_found/internal 越出设计 §3.4 词表）：**非本舱单方改**——已收敛（provider_invalid 归并 model_error），余四值在 `protocol.mjs:149-153` 逐值登记 + 本段在册；待设计层回笔或另裁（报告项）。

**复审读数**（fix round 2 后实跑）：
`node --test docs/batches/2026-10-13-member-face-chat-box.test.mjs` ⇒ `tests 17 ∥ pass 17 ∥ fail 0`；
`node --test docs/batches/2026-10-13-member-face-chat-box-core.test.mjs` ⇒ `tests 17 ∥ pass 17 ∥ fail 0`（含 E4 符号链接腿实跑 ∥ F4 字面锁）。

**终态**：内部 explore 分歧审计 1 轮 → fix round 1 → advisor 代码评审 1 轮（changes-required）→ fix round 2 → advisor 复审（结论随交付报告）。

## 服务端面舱（eng-coder · 本舱实施记录）

**状态行**：实施完成

### 交付摘要

- **新档（`thincoder-server/src/agent/`）**：`member-relay.mjs`（relay：SSE 下行六事件 ∥ 上行对位 ∥ 在途态与收尾 ∥ 帧面掩蔽截断）∥ `member-routes.mjs`（成员面 14 端点）∥ `box-routes.mjs`（盒接入 5 端点）∥ `member-cred.mjs`（git 凭据）∥ `member-pull.mjs`（拉仓编排 + 状态读数）。
- **随正件**：`src/store/migrations.mjs`（v23 段：`member_git_credentials` 七列 + `(member_id,host)` 唯一索引 + audit_events 十六型重建；**会话两表不建**）∥ `src/sandbox/registry.mjs`（`memberWorkspaceLimit` 缺省 3 + 正整数校验）∥ `src/gateway/errors.mjs`（409 `workspace_offline` ∥ 400 `workspace_limit_reached`）∥ `src/gateway/server.mjs`（`POST /api/box/sessions/:id/turns` 路由级流式 NDJSON 体读例外）∥ `src/accounts/audit.mjs`（`AUDIT_TYPES` +`member_event` 十六型——父侧授权的最小改，档内计数注释同拍翻新）∥ `bin/thincoder-server.mjs`（装配 import + 注册两行；设计记「一行」——实读 +1，如实披露）。
- **测试（开发期件，随批档）**：`docs/batches/2026-10-13-member-face-chat.test.mjs`（730 行 · 17 例）∥ `docs/batches/2026-10-13-member-face-chat-harness.mjs`（348 行 · 仅夹具/假件——为守 800 行硬限单列）。

### 验证读数（本舱实跑）

- `node --test docs/batches/2026-10-13-member-face-chat.test.mjs` ⇒ **17 tests / 17 pass / 0 fail**（≈1.8s）。
- 13 档 `node --check` 全绿（11 服务端档 + 两测试档）。
- 装配实证（真起服、临时 config、端口 8899）：`ready`（routes=140）∥ `GET /api/me/chat/sessions` ⇒ 401 `unauthorized` ∥ `GET /api/me/chat/models`（坏 Bearer）⇒ 401 `invalid_api_key` ∥ `GET /api/box/events`（坏工作区 key）⇒ 401 `invalid_api_key` ∥ 凭据/拉仓读数口 ⇒ 401（临时烟测档已删）。
- 迁移链回归（同批兄弟档只读跑 4 档：`sandbox-exec-rebuild` ∥ `container-terminal` ∥ `admin-agent-chat` ∥ `team-ledger`）⇒ 87 tests / 81 pass / 6 fail：其中 3 fail = 本批 v23 追加的**版本钉读数**（`22 ≠ 23` ×1 ∥ `21 ≠ 23` ×2——历史批钉「链头段号 = 本批落地段」）；另 3 fail 属并行他舱改动（i18n 键数 ∥ `style.css` 变量 ∥ 导航项数）。按「旧测试档不扫绿」未动他人档。

### 决策透明表（设计未钉 → 本舱钉定；均经舱审计独立复核）

| # | 决策点 | 取形 | 依据/披露 |
|---|---|---|---|
| 1 | 盒壳上行/下行 detail 形 | 列表 `detail.sessions[]` ∥ 详情 `{session,messages}` ∥ 新建 `detail.id`（槽号）∥ 改 `detail.session`；失败 `state:"failed"` + `detail.notFound` ⇒ 404 不辨 | 设计只给形骨架；跨舱接口由本舱钉——须与盒壳舱对齐（已披露） |
| 2 | 拉仓门序 | 项目可见性 404 **先于**盒态 409（零泄露序） | 设计未钉序；舱审计复核判真（无泄露） |
| 3 | `POST …/turns` 响应与收口 | 成事 ⇒ `{ok:true}`；体异常 ⇒ try/finally 统一收口（首帧缺 begin ∥ 行非 JSON ∥ 断流三径回收在途态）；`begin` 对位失败径（未知 cmdId/会话不符）**零副作用** | 防「在途态残留 ⇒ 工作区级门恒闭」；评审 #3/#12 两轮收敛 |
| 4 | 掉线/中断补帧 | 掉线 = `notice` + `end{failed,box_lost}`（设计明载）∥ 体中断 = `end{failed,model_error,detail}`（本舱钉，加性键） | 设计未钉后者；`reason` 沿既有六值枚举 |
| 5 | 成员工作区动作审计 | 本舱另落一行（`sandbox_event` + `detail.by:"member"`）；链本体同拍另有行 ⇒ 同动作两行 | `src/sandbox/box.mjs` 域外未改；ACCOUNTS §2.1 已登记成员写面行 ⇒ 非缺陷；残项（同动作列表双行）待父侧一行裁定 |
| 6 | 仓树域外零写 | `src/sandbox/routes.mjs` ≡ 0 改（写面落 `agent/member-routes.mjs`） | 沿设计 §5 修订轮落点 |
| 7 | 未落项 | 登记即放行（`sandbox/rules.mjs` `ensureProjectAllow` 面） | 父侧裁定②「本舱不落、另批承接」——报告单列 |

### 审计与代码评审轮次 · 终态

1. **舱内分歧审计（explore 子代理 · 1 轮 · 只读）**：R1 登记即放行零实现 = 父裁②未落项（非本舱缺）；R2 `call.args` 只截断未掩蔽 ∥ R3 `pulls/:pullId` 无归属判 ⇒ **已修**（改走 `argsTextOf` 同款掩蔽；`stateOf(pullId, {workspaceId})` 归属判 + 冲突不辨）；R4 §5 未写 = 本记录补；R5/R7（批档 §2.4 ∥ SANDBOX §13 文档面残差）⇒ 上报父侧/设计席；R6 行数超预算（五新档 ≈ +214，无软/硬线越线）⇒ 披露。
2. **advisor 代码评审 第 1 轮**：判 **changes-required**（10 项）——🔴1（测试档 999 行越 800 硬限）⇒ **已拆**（730 + 348，两件 < 800）；🟡（`call.args` 掩蔽 ∥ turns 在途态漏 ∥ audit 计数注释 ∥ migrations 752 > 500 在册债务 ∥ 成员动作双行）⇒ 修 3、披露 2；🔵4（tick 超窗自锁 ∥ 测试墙钟依赖 ∥ ACCOUNTS 键集登记 ∥ 缩进混排）⇒ 修 3、文档面 1。
3. **advisor 代码评审 第 2 轮（复核修复主张）**：判 **pass**——🔴 闭合；#3/#4/#6/#7/#9 核为实修；#2/#5/#8/#10 披露成立；新增两条 🟡（均显式**非 must-fix**）：测试档 730 仍越 >500 顾问线（建议按用例族再拆或登记在册）∥ `turns` 回收兜底射程曾比申报宽 ⇒ **同轮已收窄**（`claimed` 旗标）。
4. **终态 = clean**（3 修复轮，未触 5 轮上限；无未决 must-fix）。残留披露：两条非 must-fix 顾问项 ∥ 文档面两项（ACCOUNTS §2.1 `pull` 键集、批档 §2.4 行账——归父侧/设计席）∥ 父裁②未落项。

**advisor 复审（第 2 轮）与收口**：

- **verdict = pass**（上轮 2🔴 均已修复并实证 ∥ 🟡#3 收正 ∥ 🟡#4 与 🔵#10 为有理有据的 Accepted 非修 ∥ 🔵#6/#7/#9/#11 已修）；**无 🔴 存留**，新增两项皆非阻塞：🔵（`core-run.mjs:36` 注释仍列已归并的 `provider_invalid`）、🟡 协调项（拆档产生设计 §2.4「测试三档」清单外的第四档——上文 fix round 2 段已如实披露，设计笔回填/父侧协调）。
- 两项已收口：① `core-run.mjs:36` 注释改齐（明记 `provider_invalid` 已归并 `model_error`）；② `updateSession` 出口注释补「双携（model+reasoning）由 server 门把守、盒侧不立第二判据」——本段补写使上文记录成真（原记录称已写而实未写，如实更正）。
- 复审残余（非阻塞，如实留册）：🔵 argv 强化未做（`pull.mjs:106` `git clone` 无 `--` 哨兵——url 来自下行事件，防御面）；🔵 重连「接受即断」对端因连接成功后 `backoff` 复位成恒定 1s 环（速率较原 200ms 降 5×，注释「指数增长」对该径略超前）。

**行数读数口径更正（重要）**：上文（含 fix round 2 段）的「实读行数」用 `Get-Content .Count` 量得，该口径在本机系统性少计 10–26 行 ⇒ **全部作废**；权威读数 = 换行计数（`node` 实读，与 read 工具行号一致，即评审面所见口径）。**修后终值**：`protocol.mjs` **167** ∥ `core-run.mjs` **321** ∥ `index.mjs` **323** ∥ `pull.mjs` **114** ∥ `git-cred.mjs` **86**（五档合计 **1011**，设计预算 ≈730 ⇒ +38%）∥ `Dockerfile` 29 ∥ 测试 `…-box.test.mjs` **497** ∥ `…-box-core.test.mjs` **471**（合计 968；两档均 <500 硬线内）。

**终态：收敛（`clean`）**——内部 explore 分歧审计 1 轮 → fix round 1 → advisor 代码评审 1 轮（changes-required）→ fix round 2 → advisor 复审 **pass**；两测试档实跑 `17/17 ∥ 17/17` 全绿（含 E4 符号链接腿 ∥ F4 #1114 字面锁）。

### webui 舱 · 成员面对话页 `#/me/chat`（eng-coder）

**交付摘要（实读）**：三新档 `thincoder-server/public/views-me-chat.mjs` **498 行** ∥ `views-me-chat-messages.mjs` **106** ∥ `views-me-chat-composer.mjs` **324**；两 i18n me 表 `me.chat.*` **46 键/表**（zh 135 行 ∥ en 136 行）；shell 两表 `nav.page.me.chat` **+1/表**；`app.mjs` **+2**（import + PAGES 行）；`nav.mjs` 我的组首位项 +1（头注计数 6 ⇒ 7）；`style.css` **+6**（段注 + `.chat-ws` / `.chat-guide` 两规则，零新变量 ∥ 零新悬停）。批内件 = `docs/batches/2026-10-13-member-face-chat-ui.test.mjs`（**11 例**——N76 结构/四相/会话条/状态行/拉仓流/档位拾取/新会话 ∥ N77 活流同形与 `box_lost` ∥ 键族/接线/结构腿）。

**实跑读数**（自 `thincoder/` 仓根）：`node --import ./thincoder-server/test/rc-resolve.mjs --test docs/batches/2026-10-13-member-face-chat-ui.test.mjs` ⇒ **tests 11 / pass 11 / fail 0（exit 0）**；`node --check` 十档（三新档 + 四 i18n + app/nav + 批内件）全绿。曾生调试输出件 `.tmp-test-out.txt` —— **已删**（现盘零残留）。

**决策透明表**

| 项 | 设计/任务书口径 | 实况 | 处置 |
|---|---|---|---|
| 图片通道 | 成员面零图片通道（帧面 `run` 体裁 content-only） | 组装器不入 `payload.images`（按 content-only 落） | 照设计实现（本舱零改动面）——登记 |
| i18n 键数 | `webui/CHAT.md:181` ≈**35 键**/表 ∥ 批档 §2.4 +≈40/表 | **46 键/表** | 在设计 ≈ 内但超估 ⇒ 设计档键账回填归父侧 |
| 三新档行数 | ≈380 / ≈140 / ≈310（Σ≈830；设计句「以实施当刻实读为准」） | **498 / 106 / 324（Σ928）** | 设计档 §3 行账回填归父侧 |
| `style.css` / `app.mjs` | ≈+15 ∥ +≈4 | **+6** ∥ **+2** | 父侧随正 |
| 档目链 | 53 ∥ 52 ⇒ 56 ∥ 55 | 实盘 65 ∥ 64（含并行批件）；**本舱 +3 档** | 父侧重锚（并行批同窗件一并） |
| 公共适配层抽取 | 登记不做（新档自持——不改不导 `views-chat*`） | 照办（三新档零 `views-chat*` 导入） | 照设计（另轮） |
| 非壳页 | `SHELL_PAGES` 五路径不动 | 照办 | 照设计 |

**审计与代码评审轮次与终态**

- 内部 explore 分歧审计（1 轮，只读）：六差异 ∥ 四相 ∥ 四轴 ∥ 端点体形 ∥ 键面 ∥ 接线 ∥ 样式逐条对位——**四类偏差零发现**（唯一 OUT-OF-LIST = 上述调试输出件，现盘零残留）。
- advisor 代码评审 **3 轮**：轮 1 判 **changes-required**（1🔴 ∥ 1🟡 ∥ 4🔵）；轮 2 判 **pass**（🔴 复验已修 ∥ 2🔵 修复 ∥ 1🔵 理由成立销项 ∥ 1🔵 以注释落口径；🟡 与 1🔵 非阻塞结转；新增 1🔵 窄边界）；轮 3 判 **pass**（该窄边界「一处取齐」修复已验）。**终态 = clean**。

**fix round（轮 1 后）**

- 🔴（`views-me-chat.mjs`）：PATCH 回执只写 `detail.session`，而 `activeRow()` 列表行优先 ⇒ 换模型/设档后钮面字回退。修 = `applyReceipt()` 把回执并入列表行（`sessions.map` 按 id）+ 详情 id 卫，两调用点（`onSelectModel` ∥ `onSelectReasoning`）取齐；补回归腿「N76 · 档位拾取」（**红→绿实证**：缺陷态钮面字 actual `低` ≠ expected `高`）。
- 🔵：拉仓腿墙钟依赖 ⇒ `withFastPoll` 定时接管（`≥ PULL_POLL_MS` 臂 ⇒ 0ms；零真实 2s 等待）；滚动监听重渲累积 ⇒ `detachScrollFace` 收口（核 `createPinWatch.detach` + `removeEventListener`）；引导块相②口径 ⇒ 注释落档（相②判据 = 盒态；「未连接」态启动动作 = 会话条承载）。
- 非阻塞结转（披露，非修）：测试档 **639 行** 越 500 顾问线（未越 800 硬限）；键账/行账回填（父侧）。

**域外披露（本舱未动，交父侧）**：`docs/batches/2026-10-08-server-public-structure.test.mjs` 键数断言（1041 ∥ 1046 ⇒ 实读 **1088 ∥ 1093**——本舱 +47/表）与静态面档目断言；三个兄弟批测试档的「我的 6」nav 断言（team-ledger ∥ project-sources-merge ∥ sandbox-outbound-member-face-ui）——设计 §6⑦ 归「父侧/实施轮」。

**本批件与集成面**：单元件 = 上述 `…-ui.test.mjs`（随批档留档，11 例）；集成场景 = 未跑（端到端由父侧收口轮执行）。

## 点修轮（eng-coder · 服务端面 · 2026-10-14）——`result.content` 掩蔽补缺 + F1 随裁

**授权**：父侧点修简报（只此一缺口、不重开探索）+ 三裁：T1 版本钉前向兼容（≥23）∥ F1 随裁补行（summary 值掩蔽——原禁令前提被审计推翻后失锁）∥ 计数裁（T16b 独立成例——19 例）。

**改动（号 → file:line）**：

| # | file:line | 改动 |
|---|---|---|
| 1 | `thincoder-server/src/agent/member-relay.mjs:80-85` | 新增 `callSecretsOf`——秘密值 = 该 `call` 帧 args 敏感键值（`parseToolArgs` + `secretValuesOf`，管理面同源） |
| 2 | `member-relay.mjs:87-95` | `cappedFrame` result 支：`content = maskSecrets(…, secrets)`（值掩蔽、**保全文**——不套截断）∥ `summary = capSummary(…, secrets)`（F1 随裁） |
| 3 | `member-relay.mjs:269/:273/:276-277` | `feedTurn`：`call` 帧登记 secrets；result 帧取用（浏览器径 + 审计径同取值面）；注释同拍（:80/:87-90/:269） |
| 4 | `docs/batches/2026-10-13-member-face-chat.test.mjs:733/:757` | T16 题注/注释随正（`summary` 无秘密值 ⇒ 恒等透传；携秘密值 = T16b） |
| 5 | `…test.mjs:760-786` | 新增 T16b——summary 携秘密值 ⇒ 转发帧 ∥ 审计行 `detail.summary` 均掩蔽（含零泄漏判） |
| 6 | `…test.mjs:47/:48/:57` | T1 版本钉 `==23` ⇒ `>=23` 前向兼容（父裁；v23 结构断言零弱化，实读）——归因 = 并行 server-mcp 批 v24 落地 + 形式收正 |

**复跑读数（实跑）**：
- `node --test docs/batches/2026-10-13-member-face-chat.test.mjs` ⇒ **tests 19 ∥ pass 19 ∥ fail 0**（17 原例 + T16 + T16b）。
- 红绿实证（T16b 有牙）：F1 未落态实跑 ⇒ 红（`actual 'TOKEN=sk-summary-7x9y2z 已泄漏'` vs `expected 'TOKEN=*** 已泄漏'`）；落 F1 ⇒ 复跑绿（上读数）。
- `node --check thincoder-server/src/agent/member-relay.mjs` ⇒ OK（lint 实跑；测试档语法随 node --test 通过）。

**零扩面声明**：产品码 = 单档（`member-relay.mjs`）；批内件 = 单档（`…test.mjs`）；零碰盒侧 ∥ 零改设计档 ∥ 零碰其它批档/他件。声明外发现 = T1 版本钉外因撞（已裁并入本表 #6）。

**决策透明表**：

| # | 决策 | 依据 | 面 |
|---|---|---|---|
| 1 | content 掩蔽取值面 = 该 `call` 帧 args 敏感键值 | 设计「按管理面同款掩蔽」；管理面唯一 content 掩蔽点 = `chat.mjs` `maskSecrets(rawText, secrets)`，secrets = `secretValuesOf(args)` | 设计内（同款） |
| 2 | content 保全文（不套截断） | 设计截断口径只列 args ≤500 ∥ 摘要 ≤300；盒侧契约 `protocol.mjs:15`「`result.content` 携全文」；已在码内成文（:88-89）+ T16 钉（:756） | 设计内（口径读法） |
| 3 | summary 值掩蔽随 F1 同轮落 | 父裁；单源 = `gateway/API.md:204`「掩蔽后」+ 档头「秘密掩蔽后」 | 父裁 |
| 4 | T16b 独立成例（19 例） | 父裁②（T9b/T14b 同式——失败隔离） | 父裁 |
| 5 | T1 版本钉 ≥23 | 父裁（链头递升必红——外批 v24 落地）+ 先例同式 | 父裁 |
| 6 | 无 content 的 result 帧转发归一 `content: ""` | `String(frame.content ?? "")`——与盒侧帧形一致（恒带 content）；content 字段内归一、零外溢 | 实施自定（披露） |

**审计与代码评审轮次与终态**：
1. **内部 explore 分歧审计 1 轮**：真分歧 1（F1——summary 掩蔽空转；预存/面外）⇒ 上抛父裁 = ① 随轮落；余核读全清（PARTIAL 0 ∥ SILENT 0；T1 外因判「非本改责任」）。
2. **advisor 代码评审第 1 轮 = pass**（3🟡 非 must-fix：F1 边界协调 ∥ reason 六值注释滞 ∥ 测试档顾问线；3🔵：双掩蔽开销 ∥ 设计回笔 ∥ 缩进混排）。响应：F1 由父裁闭合 + 落点核实；余项记录零触（在册）。
3. **advisor 复审第 2 轮（复核修复主张）= pass**——F1 落点（:93 ∥ :273/:276-277 ∥ 注释 :80/:88/:269）∥ T16 题注随正 ∥ T16b 两断言均核实；**新引入问题 0**。
4. **终态 = clean**（修复轮 1 枚落地；无未决 must-fix）。

**上抛/披露**：
- `[上抛·知会]` 归属设计席/收口轮：`reason` 六值注释滞（`:12`/`:125`——单源收正已在册）∥ 设计 §3.3 口径回笔 ∥ 批档 §5 前段读数随收口轮回填（现读 786 行 · 19 例）。
- `[上抛·知会]` 在册非阻塞：双掩蔽开销（:276/:277）∥ 测试档 786 行 >500 顾问线 ∥ 注释缩进混排。

## §6 验证与收口（父代理）

**验证与收口（2026-10-14 · 父侧）**：① 验证 = 三舱复跑在案（webui 11/11 ∥ relay 19/19 含 T16b 红绿实证 ∥ 回笔实核 `ACCOUNTS.md:79`）；② 结算同步 = §5 披露全部挂账（#1411 序数表述 ∥ #1412 拟新增随正 ∥ #1413 行账/指纹/nav ∥ #1417 member_event 渲染）∥ 需求档 AC-50 回笔已落；③ 台账 = #1215（伞需求——本批 = 第一里程碑；在途保持，evidence 已追加）；④ 收口 = 本记录冻结。
