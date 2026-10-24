# MEMBER-AGENT.md —— 成员面 agent（第四壳 · 会话面）

> 域 = agent（第二档——与 `agent/ADMIN-AGENT.md` 同域两面）。
> 需求单源 = `docs/server/requirements/PROJECT.md` §2 功能点 50 ∥ AC-50 ∥ §5「工作区内的开发」行——本档不复述需求。
> **最近先例（五坐标）**：
> ① **管理面 chat**（`agent/ADMIN-AGENT.md` §11 ∥ `gateway/API.md` §2.8 ∥ `webui/CHAT.md` §2.1；实现坐标 = `thincoder-server/src/agent/chat.mjs` ∥ `chat-routes.mjs` ∥ `chat-store.mjs`（回合环 ∥ 帧面 ∥ 库面） ∥
>   `thincoder-server/public/views-chat.mjs` ∥ `views-chat-composer.mjs`（页面壳两件））——对齐 = 会话两表形 ∥ 六帧词表 ∥ POST-NDJSON 流 ∥ 在途门 ∥ 重启收尾 ∥ 页面四轴与核件消费；偏离 = 盒在进程外且只出向（§3.3/§3.4 增补——理由 = 已裁骨架）。
> ② **沙盒成员面**（`sandbox/SANDBOX.md` §8 成员面 ∥ `webui/SANDBOX.md` §2.2；实现坐标 = `thincoder-server/src/sandbox/routes.mjs:440`（`GET /api/me/sandbox/workspaces`） ∥ `thincoder-server/public/views-me-sandbox.mjs`）
>   ——对齐 = 本人过滤 ∥ 词面「工作区」；偏离 = 写面开启四动作（理由 = 会话可用性死锁，§3.7）。
> ③ **盒内凭据**（`sandbox/SANDBOX.md` §7；实现坐标 = `thincoder-server/src/sandbox/routes.mjs:268`（建工作区处 key 签发落行））——对齐 = 每工作区 key ∥ 盒内零真密钥；偏离 = key 第二门（会话面）。
>   理由 = 既有形不适用：盒非成员浏览器客户端——无 cookie 面，且须以「工作区」身份判权（非「成员」）⇒ 成员面单门覆盖不到；单密钥两用先例 = `client/CLIENT.md` §2（token 兼作 `/v1` 凭据）。
> ④ **账户页凭据卡**（实现坐标 = `thincoder-server/public/views-me.mjs:337` 起 ∥ `webui/ME.md` §2.3）——对齐 = 同 `PUT` 端点 ∥ `me.gitCred.*` 键族 ∥ 零回显族 ∥ 兼容重导出；
>   偏离 = 入径改拉取窗内（先绑后拉 = 使用不便——已裁）∥ 保存后自动续拉（「保存并继续拉取」= 语义本身）∥ 主机只读（host 由项目地址派生 = 真源——防误绑他主机）。
> ⑤ **两壳（VSC ∥ 桌面——三端对齐面）**（实现坐标 = VSC `thincoder-vscode/webview/{permission,chat-messages,secret-input,session-bar,streaming}.js` ∥ 桌面 `thincoder-desktop/renderer/{mount-cards,secret-prompt}.mjs` + `thincoder-desktop/renderer/views/{session-control,statusline-segments}.mjs`）
>   对齐 = 核件直用（卡族/子代理栈/流式/搜索）+ 行形对齐（会话条行形 ∥ 四旗读写 ∥ 状态行段表）；
>   偏离 = 盒壳 ask 回路（盒在进程外——卡状态零服务端落（在途表 = relay 内存）、帧即转发即弃；理由 = 盒只出向 + 零落库——§3.11(2)）。
> 注：五题裁定已落（照案四处、翻案一处；见 §2/§6）；AC-50 ⑥ 判据已回填。

## 1. 定位与形态

一句话：成员 web 登录后，与**盒内 agent**（`@thincoder/core` 同件 + 最小壳）对话完成开发——浏览器 ⇄ server ⇄ 盒三段全链；**会话真源在盒内**（核原生会话文件——盒去会话随去；服务器只管中转与工作区）。

- **参与体四件**：① 浏览器（成员控制台新页 `#/me/chat`——第四消费面，界面与 VSC/桌面 基本一致）∥ ② server（鉴权 ∥ 两杆相接（纯中转 + 控制——零会话落库）∥ 工作区——本档主体）∥ ③ 盒（工作区容器——壳随容器起、出向连 server）∥ ④ 网关链（盒 → server `/v1` 模型调用——既有面零改）。
- **两条杆**：浏览器杆（cookie ∥ Bearer——POST-NDJSON 回合流，沿管理面形）∥ 盒杆（SSE 下行 + NDJSON 上行——盒发起出向；runner 零入向端口）。
- **与执行面关系**：盒生命周期（起停/休眠/重建/快照/销毁）沿沙盒面；**会话流不借执行面**（已裁在册——执行面管盒生命周期与 exec，且 runner = 可替换执行节点）。
- **与核关系**：盒内 = 核同件（第四壳不透支——能力面一律取自核；**会话文件/槽机制即核原生面**）；核面零改（零缝需求——回灌缝随题一裁定消解，§3.2）。
- **与沙盒词面**：同物 1:1——成员面「工作区」∥ 管理面「沙盒」（已裁）；本档即用「工作区」。

## 2. 关键决策（KD-SV-152–159 ∥ 203/204 ∥ 215–223）

> 编号接续全域序列（151 在册）。**152–157 五题已经用户裁定（照案四处、翻案一处）；158/159 = 已定登记**；本节 = 裁定后收正版（203/204 = 翻案与题三补导出的两条落形）。

| # | 决策 | 理由 |
|---|---|---|
| KD-SV-152 | （**已裁——用户翻案**）**会话真源 = 盒内**：核原生会话文件（槽——`<configDir>/sessions/<cwd-hash>.json.<槽号>`；核零改造）；**盒去会话随去**；**服务器零会话落库**（`member_sessions`/`member_session_messages` 两表不建）∥ **零上送 ∥ 零回灌**（回灌缝 R76 随之消解）；读史/列表/管理 = **向盒取指令**（`cmd` 下行 + `commands/:cmdId/result` 回呈——§3.2/§3.3；会话管理面 = KD-SV-203） | 用户裁定原话（服务器卫生 ∥ 盒内零改造）：「会话里大多是垃圾……时间长了把服务器都搞脏了。而且，直接留在盒内应该代码跟原来一样吧，都不用改了。」 |
| KD-SV-153 | （**已裁——用户照案** ＋ 题一连带收正）**盒接入协议 = SSE 下行 + NDJSON 上行**：下行 `GET /api/box/events`（盒发起、单连接）；事件 = `hello`（含**未收尾**命令重派——已收尾件不入清单）∥ `run` ∥ `abort` ∥ `pull` ∥ **`cmd`**（读/管理指令——`sessions.list` ∥ `session.read` ∥ `session.create` ∥ `session.update`）∥ `ping`；**上行三口** = `sessions/:id/turns`（回合帧流——纯转发零落库）∥ `commands/:cmdId/result`（命令结果——拉仓 + 指令回呈）∥ `ping` 应答（`POST /api/box/ping`——在线判据取数面）。浏览器杆 = POST-NDJSON（沿管理面）；**掉线 ⇒ 在途命令同款收尾**（拉取 = 记录面 `failed` ＋ `member_event` 审计 ∥ 指令 = 400 人话；单点 = `src/agent/member-relay.mjs` `settleCommands`——三调用点 = 判掉线 ∥ `detach` ∥ 停机 `closeAll`；§3.4 ②） | 零第三方 + `node:http` 原生可达（SSE = 普通 chunked 响应）；与「非页面客户端」形同源（移动端同读）；会话住盒后协议收敛为「**纯中转 + 控制**」（原 `sync` 差量口随题一裁定消解——读/管理改走 `cmd` 指令） |
| KD-SV-154 | （**已裁——用户照案** ＋ 轮换口径随案）**盒侧凭据 = 复用每工作区 key**（`OPENAI_API_KEY` 同值——第二门 `/api/box/*`；零新秘密、零新生命周期；**射程扩：第三门 `/api/me/sandbox/*`**——盒内工具面：键 → 工作区 → 负责人；作用域 = 本工作区（建 = 新工作区 ∈ 负责人 ∥ 启停/销毁 = 本工作区）；成员全权面不开）；**key 轮换 ⇒ 下次盒启动生效**（最简形——「轮换即断旧连接」不做） | 单秘密单生命周期（签发/轮换/吊销全沿 `sandbox/SANDBOX.md` §7 既有）；作用域 = 工作区（「工作区作用域凭据」逐字）；token 两用先例（client token 兼作 `/v1` 凭据） |
| KD-SV-155 | （**已裁——用户照案** ＋ 同轮两补）**首次进入 = 四相**（无工作区 ⇒ 建引导 ∥ 盒未运行 ⇒ 就地启动 ∥ 盒运行、零会话 ⇒ 建会话引导（「新会话」主钮 +「拉取」次钮；不设门） ∥ 有事可做 ⇒ 直聊）；**拉仓 = 可见项目选择制**（清单 = `GET /api/projects?q=` 复用）+ 目标目录缺省 = 仓名 + **凭据 = 成员本人凭据**（盒内 git 凭据助手按次向 server 取件、用毕即清 + 审计行；绑定入径 = 拉取流内就地绑（KD-SV-215——账户页卡 = 管理面保留；缺/无效 ⇒ 同窗更新重拉）——§3.6/KD-SV-204） | 首次进入必须有下一步动作（不许空屏）；环内威胁模型下「凭据经盒」如实披露、按次最小化；凭据来源 = 成员本人（用户明示「不能用平台凭证」） |
| KD-SV-156 | （**已裁——用户照案**）**成员权限 = 本人资源自管**：动作集四件 = 创建 ∥ 启动 ∥ 停止 ∥ 销毁（确认门 + 快照读数）；拉仓同权。**上限 = 每成员缺省 3 个**（设置项 `memberWorkspaceLimit`——写面随实施批最小件）；越权 = 列表零出现 + 直取 404 | 会话可用性死锁（无工作区/盒停 ⇒ 无 agent 可谈——页面必须能建/能启）；裁「成员资源管理走 chat + 工具」——本动作集为其先行件（工具面 = §3.7） |
| KD-SV-157 | （**已裁——用户照案**）**移动端 = 同一端点族**（非页面客户端形固化）：鉴权 = `Authorization: Bearer`（成员 key——客户端登录面既有）与控制台 cookie 双门；流 = HTTP chunked NDJSON（零 EventSource/cookie/页面依赖）；页面专属物（渲染核 ∥ i18n ∥ DOM）不入协议 | 「app = 又一个客户端壳」（已裁）；单端点族 = 单判权/单帧面（副本端点 = 漂移源） |
| KD-SV-158 | **记忆面（压后——用户裁定）**：方向 = 成员面走**团队记忆**（服务端侧共享记忆）；**不实现客户端式本地记忆**（personal/project 本地层与本地索引不落成员面）；团队记忆本体 = 另面（需求 §1 四面 ②「团队记忆与知识库」，另批） | 用户裁定逐字 |
| KD-SV-159 | **成员面 agent 工具面归属 = 本档**（裁「成员资源动作走 chat + 工具」的落点）：盒内 = 核家族全件（开发面——「不减项」）+ **server 域成员件**（范围 = 成员本人资源；动作集 = 写面同集——单源）；逐件清单与实施 = 实施批从实需反推；管理面运维件（docker/主机/exec/provider）不入成员面 | 归属悬置（`agent/ADMIN-AGENT.md` §1/§10 两处在册）——已落定；「同源、面不同」（已裁） |
| KD-SV-203 | **会话管理面 = 盒内原生**（题一翻案导出——收正）：**列表** = 核盘面实读（`listSlots`）；**删除** = 核 `deleteSlot`（盒内原生——零跨面风险）落钮（会话条删除 + 确认门——R79 收口）；**重命名** = 核 `renameSlot`（`thincoder-core/session-rename.mjs`）落钮（沿「两面有 = 欠账直补」） | 会话真源已住盒（KD-SV-152）⇒ 列表/删除/重命名 = 核既有导出件直用（盒壳经 `cmd` 转发），服务器零语义 |
| KD-SV-204 | **成员 git 凭据 = 成员本人（题三补）**：绑定一次复用（我的·账户页——`PUT/DELETE /api/me/git-credentials`）＋ 加密零回显（`credential-crypto.mjs` 族 ∥ 密列零回显）＋ **经盒按次**（盒内 git 凭据助手（写死——拉取/推送共用）按次向 server 取件：`POST /api/box/credential`——工作区 key 判权）＋ 用毕即清（只驻进程内存——零落盘零 env 持久化）＋ 审计行（`credential_set` ∥ `credential_revoke`；拉仓 = `pull` 行） | 用户明示「用户拉git要用自己的凭证，不能用平台凭证」；权限 scope 由平台自带（谁拉的 = 平台侧可见）；凭据家族先例（主机/私有仓凭据——加密 ∥ 零回显 ∥ 成事才审计） |
| KD-SV-215 | **凭据录入口径 = 拉取流内就地绑**（需求功能点 50 ⑨ ∥ AC-50 ⑦）：提交前页面侧预检（`GET /api/me/git-credentials` 清单——host = 所选项目 address 首段小写）；缺 ⇒ **拉取窗内就地揭示凭据区**（主机只读 ∥ 用户名 ∥ 令牌（口令类——零回显沿族））——保存（`PUT`）成功 ⇒ **自动续拉**（无需二次点击）；**绑定无效**（盒判 `kind:"auth"`）⇒ 同区更新 ⇒ 重拉；**无凭据可跳过**（公开仓直拉）；预检失败 ⇒ 降级直 POST；**项目选择变更 ⇒ 复位态 A + 清用户/密字段**（防密文绑错 host）。**零新端点零新错误码**（复用清单/存件/拉仓三既有面；服务端语义零改）；**自加守卫五枚**（设计未列——逐形 = §3.6） | 「绑一次复用」不变（成功即记住——二次拉取零表单）；入径 = 拉取流本身（账户页卡 = 管理面保留）；凭据经页面 `PUT` 与账户页同链（同一端点） |
| KD-SV-216 | **帧面统一扩展 = 一族一次接线**（用户「跟 vsc/desktop 差不多」）：上行增补**七型**（`reasoning` ∥ `toolOutput` ∥ `sub` ∥ `ask` ∥ `tasks` ∥ `compress` ∥ `wait`）+ `usage` 扩两字段（`reasoning` ∥ `timers`）+ 下行增补 `answer` 事件 ∥ `abort` 扩 `key`——帧表/源/消费逐行 = §3.11(1)；盒壳 `thincoder-server/deploy/sandbox/member-shell/protocol.mjs` 帧构造器单点，页面经核件消费 | 逐项打补丁 = 帧面漂移源；一帧表 = 单源（词形 ∥ 掩蔽/截断口径一个点）——盒壳回调面本就在（核 `runAgent` callbacks 十一件，`core-run.mjs` 原只接五件） |
| KD-SV-217 | **审批/问询/秘密 = 核卡件直用 + ask 回路**：上行 `ask` 帧（kind 四值：`permission` ∥ `batch` ∥ `question` ∥ `secret`）⇒ 页面卡（单件 ∥ 批 ∥ 问询 = 核 `thincoder-render-core/cards/*`；秘密卡 = 页内件——核无此卡，两壳先例同族）⇒ 应答 `POST /api/me/chat/sessions/:id/asks/:promptId` ⇒ 下行 `answer` ⇒ 盒壳结算核回调承诺。裁决词表沿桌面（`ITEM_VERDICTS` `once/always/reject` ∥ `BATCH_VERDICTS` `approveAll/deny/oneByOne`）；映射单点 = 盒壳（`once`/`always` ⇒ `true`、`reject` ⇒ `false`；`always` 另置槽 `autoApprove`——同桌面「always」语义） | 用户「开发用途、有人值守」——管理面「无人值守裁剪」的排除理由在成员面不成立 ⇒ 卡族全补；核卡件已在两壳在役（只读消费——零 fork）；aria/键盘/IME 门随核件 |
| KD-SV-218 | **模式旗四枚 = 会话槽字段（盒内真源）**：`autoApprove` ∥ `planMode` ∥ `engineering` ∥ `advisorGuard` 住核槽（既有写面四件 `setSlotAutoApprove`/`setSlotPlanMode`/`setSlotEngineering`/`setSlotAdvisorGuard`——`thincoder-core/session-slot-write.mjs:146-165`；读面 = 核 `applySession`——`session-lifecycle.mjs:118-137`）；写径 = `PATCH …/:id`（一次一件）⇒ `session.update` 指令；**生效 = 回合装配**（槽 ⇒ agent——核语义，零盒壳逻辑）；ENG⇒PLAN 互斥沿核；mid-turn 追改不做（下回合生效——沿 PATCH 口径；呈报 = §9） | 会话级归属与 model/reasoning 同层（KD-SV-111 同口径）；四旗写/读面核件齐备（零核改）——盒壳只转发 |
| KD-SV-219 | **子代理面 = 核 subblocks 栈直用 + 停单件**：relay token **停止剥离**（原 `onToken` 剥前缀后当主文转发 = 泄漏面源）⇒ `sub` 帧 ⇒ 页面核件链（`subblocks/relay.mjs` `relayEventToSubPatch`/`relaySubContentChunk` ⇒ `subblocks/state.mjs` `subBlocksReduce` ⇒ `thincoder-render-core/subblocks/block.mjs` `renderSubBlock`/`renderSubagentChunk`）；**停单个** = `POST …/abort` 体 `{ key }` ⇒ 下行 `abort { cmdId, sessionId, key }` ⇒ 盒壳按池条目中止；**等待审批态** = `ask` 帧携 `owner`（relay 前缀头——`parseRelayPath`）⇒ 块头审批写点；**跨回合池延续 = 端面约束**（盒每回合新装配 agent——§9 呈报） | 两壳先例 = VSC 扩展侧 / 桌面主进程同栈消费（`relaySubContentChunk` 双消费件）；核件零改 = 只读消费 |
| KD-SV-220 | **状态行 = 段表全段对齐**（「timer/团队/标题等」并入）：段表逐行 = §3.11(4)（19 段：源 ∥ 缺省 ∥ 处置）；新增段源 = 帧面七型 + `usage` 扩字段 + 会话行字段；**判定项两枚**（台账标记 ∥ 团队登录态——同物在成员面无参照物，逐条呈报 §9） | 管理面「读数项 ⊆ 有源」同律；核件无状态行族 ⇒ 本页自持渲染（沿 §2.1④）——段源全对齐、零假读数 |
| KD-SV-221 | **会话条 = 自绘下拉 + 行内控件**（承载四欠账）：原生 `<select>` 换自绘下拉（形制对齐 VSC `session-bar.js:31-86`）——行 = **位标**（● 运行中 ∥ ⏸ 待审批——源 = 行 `status` + relay 在途 ask 读数 `awaitingApproval`）∥ **标题**（槽 `title` ∥ excerpt 顶行）∥ **meta**（工作区 · provider · N msgs · 日期——源 = 行 `count`（盒槽 history 长）+ provider 自 id 派生）∥ **✎ 重命名** ∥ **✕ 删除**（确认门；>1 时在场）∥ **📁 工作区钮**（切换当刻工作区——本人工作区清单）+ 承接**账本注记位**（判定项——§9）；成员条自有钮（重读 ∥ 启动 ∥ 拉取 ∥ 工作区读数行）保留不动 | 行内控件必须自绘容器（原生 option 单行不可承载）；两壳行形对照 = §3.11(6) 表 |
| KD-SV-222 | **盒内工具面清单落定**（R77 收口）：① **核家族全件**随装配在册（开发面——「不减项」；装配单点 = `assembleAgent`）；② **server 域成员件四件**（`workspace_create` ∥ `workspace_start` ∥ `workspace_stop` ∥ `workspace_destroy`——动作集 = 写面同集 KD-SV-156）入盒壳注入件 `deploy/sandbox/member-shell/member-tools.mjs`，经核既有缝 `runAgent(..., { extraTools })`（`thincoder-core/agent/setup.mjs:218`——`agent.tools → 家族段 → extraTools`）注入；**拉仓 = 既有能力登记（盒内 `git` 工具 + 凭据助手）——不另立工具**；四件经工作区 key 调 `/api/me/sandbox/*`（第三门——键 → 工作区 → 负责人；作用域 = 本工作区；KD-SV-154 射程扩）；管理面运维件（docker/主机/exec/provider）不入 | KD-SV-159 归属句落件；核注入缝既有（零核改）；「同源、面不同」 |
| KD-SV-223 | **在途门 = 会话级（跨会话放开——对齐两壳）**（用户纠正：原「工作区级在途门」= 设计侧自加（无用户裁据）⇒ 归欠账）：门粒度 = **会话**（同会话二回合 ⇒ 400 零副作用）；**跨会话并行可达**（同工作区两会话可并行——VSC 多面板 ∥ 桌面多标签同形；同 cwd 并行 = 与两壳同风险面，不另设门）；实现 = relay `turns` 表自 **工作区键 ⇒ 回合键**（`cmdId`/`sessionId`）+ `busy(workspaceId, sessionId)`；盒壳 `state.running` 单飞变量 ⇒ **会话键表**（`runningSlot` 读表键集；`abort` 随 `sessionId` 对位）；`busy` 值语义 = 「同会话第二回合」 | 真约束 = **同会话**并发（槽历史写夺 + 槽争用——核面事实，两壳同律）；跨会话 = 无真约束（原理由「盒 = 共享资源」= 设计侧自加，无用户裁据）；盒内并发数无上限（容器配额即上限——呈报 §9 R90） |

> **KD-SV-158 注（实施取证 + 裁定）**
> ① **取证实况（实落码）**：盒内 = 核同件、配置全默认（盒无 config.json）⇒ 核默认记忆面随装配生效——`createMemory` 恒开库建文件（`thincoder-core/memory/schema.mjs:80-82` ⇒
> `<HOME>/.thincoder/memory.db`；盒内 HOME=/workspace/home ⇒ **落盒卷**）∥ 装配即同步项目层目录（`thincoder-core/agent/assemble.mjs:86-89`）∥ 工具面含 `memory`（六 action）+
> `code_search`/`doc_search`/`repo_outline`（`thincoder-core/tools/index.mjs:70-74`；盒内装配单点 = `thincoder-server/deploy/sandbox/member-shell/core-run.mjs:291`）∥ 回合装配期注入读本地库（`thincoder-core/agent/setup.mjs:99-159`）。
> ② **裁定（本席——依据 = 用户已裁三句：「不用实现」·「核同件」·「不减项」）= 合规豁免（带理由）**：盒内本地记忆面 = 核件原样携带（**零新增件、零新增接线**）——
> 不在「实现客户端式本地记忆」之列（范围句：成员面不新增本地记忆设计）；「关面」须改盒侧核行为——与「核默认行为零改造」（KD-SV-152 裁定理由）∥「核家族全件·不减项」（KD-SV-159）两裁相抵 ⇒ 如裁「关」= 另轮另裁。
> ③ **边界 = 零新增**（§3.9/§6 同拍）；实况边界 = 记忆数据仅随盒卷（销毁随卷去 ∥ 快照随卷回）；服务器侧零记忆面（零表零端点）。

## 3. 机制

### 3.1 全链三段（访问路径）

```text
[1] 浏览器杆（成员控制台）：
    `#/me/chat` 页 —— 鉴权 = cookie（控制台会话）∥ `Authorization: Bearer`（成员 key——移动端同门，§3.8）
    取数 = `/api/me/chat/*`（七端点——§4）：列表 ∥ 建 ∥ 详情 ∥ 模型清单 ∥ 发消息（NDJSON 流）∥ 中止 ∥ 换模型/设档；
    工作区动作与拉仓 = `/api/me/sandbox/*` 成员面扩（清单 = §4）。
    判权 = 恒本人（会话 ∈ 本人；工作区 ∈ 本人）。

[2] server ⇄ 盒杆（盒只出向——runner 零入向端口）：
    盒内壳 —— `GET /api/box/events`（SSE 下行）+ 上行三口 + 凭据口（§3.3）；连接发起方 = 盒（凭据 = 工作区 key）。
    server 内把两杆相接：浏览器消息 ⇒ 下行 `run`；盒帧 ⇒ 转发浏览器流（**零落库**）；读/管理 = 下行 `cmd` + 结果回呈。

[3] 盒 → server 网关（模型调用——既有面零改）：
    `OPENAI_BASE_URL` + `OPENAI_API_KEY`（每工作区 key——`sandbox/SANDBOX.md` §7）。
```

**不借执行面**：本链零 `docker exec`、零 runner 指令队列（已裁）；**零 web 直连盒路径**（盒无入向端口——AC-50③ 判据 = 路由/连接发起方核读）。

### 3.2 会话单源 = 盒内（核原生）

- **真源 = 盒内核原生会话**（槽文件——`<configDir>/sessions/<cwd-hash>.json.<槽号>`，`configDir = join(homedir(), ".thincoder")`（`thincoder-core/config-io.mjs:32`）；盒 env `HOME=/workspace/home` ⇒ 落盒卷（§3.10）；**核默认行为零改造**）。
- **服务器零会话落库**：`member_sessions`/`member_session_messages` 两表**不建**（v23 段零此两表）；服务器侧会话态 = 仅**内存在途态**（重启即清——§3.4）。
- **会话 id = 盒内槽号**（该盒 = 该工作区独有 ⇒ 盒内唯一）；端点间 = **复合形 `<workspaceId>:<槽号>`**（服务器据此路由到盒——只校验归属与形态，零语义）。
- **零上送 ∥ 零回灌**：回合帧（`turns` 上行）= 纯转发（§3.3）——服务器不落一行；原回灌核缝（R76）随题一裁定消解（核批零涉）。
- **读/管理 = 向盒取指令**（读指令形——`cmd` 下行 ∥ `commands/:cmdId/result` 回呈）：
  - **列表** = 核盘面实读投影（`listSlots`——`thincoder-core/session-slots.mjs:191`）；
  - **读史** = 核槽文件投射（`loadSlotFile`/`applySession`——`thincoder-core/session.mjs:55-57` 重导出）；
  - **新建** = 核全新槽分配（`newSession`/`allocateFresh`——`thincoder-core/session-slots.mjs`；槽文件随首回合落——未开始即弃 = 零留存）；
  - **改**（换模型/设档）= 核槽字段更新（`session.update`；核槽自携 `activeProvider`/`activeModel`/`effort`——§3.4）。
- **盒去会话随去**：停盒/重启（同机）⇒ 卷恒留 ⇒ 会话在；销毁（删卷）⇒ 会话随去；换机重建 ⇒ 恢复最近 WIP 快照 ⇒ 会话随快照回（截至快照时点——§3.5）。
- **会话管理面**（KD-SV-203 收正）：列表 ∥ **删除**（核 `deleteSlot`——`thincoder-core/session-slots.mjs:219`）∥ **重命名**（核 `renameSlot`——`thincoder-core/session-rename.mjs`）三件全落；`cmd` 族 `session.delete`/`session.rename` 两 kind（形 = 回呈 `{ state, detail }`——沿族）。
- **对齐不变量**：服务器库零会话表/零会话行（真源断言）；盒内槽文件 = 唯一事实；停止盒 ⇒ 读/列/聊不可达（页面就启动引导——非静默）。

### 3.3 盒接入（下行 SSE ∥ 上行三口 + 凭据口）

**下行（server → 盒）**：`GET /api/box/events`——SSE（`node:http` 原生 chunked 响应，零第三方）。事件表：

| 事件 | 体 | 说明 |
|---|---|---|
| `hello` | `{ serverTime, redeliver: [cmdId…] }` | 连上确认 + **未收尾**命令重派清单（server 内存态——已收尾件（成/败/中止/掉线）不再入清单）；**`redeliver` = 连接替换窗残余**（换连/重启窗口内的未收尾件），非主径——主径 = 活连上 `run`/`cmd` 即时下行 |
| `run` | `{ cmdId, sessionId, content, images? }`（`images` = dataURL 列；视觉门同 §3.11(6)） | 执行一回合（`sessionId` = 槽号；内容落盒内槽文件） |
| `abort` | `{ cmdId, sessionId }` | 中止在途回合 |
| `pull` | `{ cmdId, url, dir }` | 拉仓（**凭据不随命令**——盒内 git 凭据助手按次自取，§3.6） |
| `cmd` | `{ cmdId, kind, args }` | 读/管理指令（kind = `sessions.list` ∥ `session.read` ∥ `session.create` ∥ `session.update` ∥ `session.delete` ∥ `session.rename` ∥ `files.list`——全表单源 = `gateway/API.md` §2.12）——结果经 `commands/:cmdId/result` 回呈 |
| `ping` | `{}` | 保活（缺省 20s——设计值）；盒收即回 `POST /api/box/ping`（应答——在线判据取数面，§3.3 上行表） |
| `answer` | `{ promptId, kind, verdict? ∥ answer? ∥ values? }` | ask 应答回程（浏览器 ⇒ `POST /api/me/chat/sessions/:id/asks/:promptId` ⇒ relay 下行；在途表 = relay 内存） |

单工作区单连接（新连接顶旧连接——盒重启即重连形）；**在线判据** = SSE 连接在 ∧ 最近一次 `ping` 应答 ≤ 3 周期（60s——超窗 ⇒ 判掉线，§3.4②）；页面「已连接」态读此。

**上行（盒 → server）**：

| 端点 | 形 | 说明 |
|---|---|---|
| `POST /api/box/sessions/:id/turns` | **流式 NDJSON 体**：`begin { cmdId }` ⇒ 六帧词表 + 增补七型 ⇒ `end`（帧表 = §3.11(1)） | 一次回合；**纯转发**——server 边收边转浏览器流（**零落库**） |
| `POST /api/box/commands/:cmdId/result` | 体 `{ state, detail }` | 命令结果（拉仓成/败；读/管理指令回呈——`detail` 形按 kind：列表/读史 = 行集 ∥ 新建 = `{ id }`） |
| `POST /api/box/ping` | 体 `{ t }` ⇒ 204 | 保活应答（收 `ping` 即回——在线判据取数面；与 SSE/余端点同判权） |
| `POST /api/box/credential` | 体 `{ host }` ⇒ `{ username, password }` | git 凭据取件（盒内助手按次调用——§3.6/KD-SV-204；密值零回显零日志） |

- **帧词表单源 = `agent/ADMIN-AGENT.md` §11/§11.3**（本档增补 = `begin` 帧 + `end.status/reason` 新值 `box_lost`（server 合成）+ 盒自产扩展四值 `save_failed` ∥ `busy` ∥ `not_found` ∥ `internal`——语义 = §3.4；**增补集 = 七型 + `usage` 两扩字段 + 下行 `answer`/`abort.key`——帧表全文 = §3.11(1)**）。
- **加宽两字段分治**：`call.args` ≤500（管理面同源常量；`ask.args` 同源同口径）∥ `result.summary` ≤300（沿用）∥ `result.content` = 全文口径（截断 = 核 `capText` 64 KiB 单源——活流与回读同径，§3.11(6)）；转发浏览器前按管理面同款掩蔽；**服务器零落库**——帧即转发即弃。
- **体读口径**（`turns` 端点）：**流式 NDJSON 体读**——逐行边收边消费（不经通用整段 JSON 体门——路由级例外）；上限沿既有体读常量（32 MiB）；随正件 = `gateway/API.md` §4 `server.mjs` 行。
- 掉线 = SSE 断 ⇒ server 按 §3.4「掉线径」收尾。

### 3.4 回合模型（在途门 = 会话级 ∥ 中止 ∥ 收尾三径）

- **发消息**：浏览器 `POST /api/me/chat/sessions/:id/messages` ⇒ server 校验（本人 ∥ 盒在线 ∥ **会话级在途门**）⇒ 下行 `run` ⇒ 浏览器流当场响应（NDJSON headers 先发）、帧随盒来（**零落库**——user 内容落盒内槽文件）。
  - 盒不在线 ⇒ 409 `workspace_offline`（人话 + 页面「启动工作区」就地动作——§3.6②）。
  - 在途门粒度 = **会话**（KD-SV-223——跨会话并行可达，同工作区两会话各跑一回合 = 与 VSC 多面板 ∥ 桌面多标签同形）；同会话在跑 ⇒ 400 人话（「该会话正在执行另一回合」）。
- **会话模型/档位面（盒内槽字段）**：核槽自携 `activeProvider`/`activeModel`/`effort`；`PATCH` ⇒ `session.update` 指令（值域 = 开放清单/核枚举——server 先校验，表外 400；盒离线 ⇒ 409）；换模型 ⇒ 档位清；回合装配携 `reasoningEffort?`（未设 ⇒ 零字段——核载荷门同源）。
- **中止**：`POST …/abort` ⇒ 下行 `abort` ⇒ 盒中止该回合 ⇒ 上送 `end { status:"failed", reason:"aborted" }`；非 running ⇒ 400 零副作用（沿管理面）。**体 `{ key? }`**：`key`（`<role>#<id>`）在场 = **停单个子代理**（盒按池条目中止——不终回合；`abort` 下行同携 key；非在跑 key ⇒ 400 零副作用）。
- **收尾三径**（盒侧在途回合的终结源）：
  ① `end` 帧（正常/失败/中止）；
  ② **掉线**（SSE 写失败/连接关 ∨ `ping` 应答欠 3 周期）⇒ server 判 `box_lost`：浏览器流补 notice 帧 + `end { failed, box_lost }`（零行可补——无落库面）；
  **在途命令一并收尾**（单点 = `src/agent/member-relay.mjs` `settleCommands`——三调用点 = 判掉线 ∥ `detach` ∥ 停机 `closeAll`）：拉取件 ⇒ 记录面 `state:"failed"` + `detail.message` = 常量 `BOX_LOST_CMD_MESSAGE`（人话「工作区连接已断开——命令未完成（工作区恢复后重试）」——单一出处 = `src/agent/member-relay.mjs`）；
  并落 `member_event`（`kind:"pull"` ∥ `ok:false` ∥ `reason` = 同常量）；指令件 ⇒ 回呈同形 ⇒ 路由面 `valueOf` 抛 400 人话（盒侧失败同码——零 `valueOf` 改）；收尾后 `hello.redeliver` 不再携该件（防重复执行）；
  盒侧对称——上行失败即中止本地回合，重连后**零对齐动作**（真源在盒——槽文件即事实）；
  ③ **服务端重启**：在途态 = 纯内存（零行可扫）——浏览器流自断重连；重派 = `hello.redeliver`（server 内存清单——重启后清空，如实）；盒内槽文件零损。（`redeliver` = 连接替换窗残余径——非主径；主径 = 活连下行。）
  **无独立看门狗**（回合预算沿核；卡死兜底 = 生命周期动作——停/重启工作区 ⇒ 掉线径收尾）。
- **落点（零服务器落库）**：user 内容与回合产出 = 盒内槽文件（核保存语义）；帧 = 转发即弃；展示形截断两字段分治（`args` ≤500 ∥ `summary` ≤300 沿用；`content` = 核 `capText` 64 KiB——活流/回读同径，§3.11(6)）；notice = 流内帧（收尾三径② 合成——`reason:"box_lost"`；活流唯一呈现径，重读不含，如实）。
- **`end.reason` 终态取值面（盒可达）**：设计词表内（管理面五值之三）= `aborted`（中止）∥ `budget`（预算超限——核 `ContinueError`）∥ `model_error`（模型错误——含 provider 未就绪）；`empty_turn`/`restart` = 管理面专有（盒不发）。
- **盒自产扩展四值** = `save_failed`（回合跑完但核槽保存失败——`succeeded` 翻 `failed`）∥ `busy`（同会话第二回合——盒侧兜底立即回失败流；正门 = 服务端会话级在途门）∥ `not_found`（目标槽不存在——跑/读/改同判）∥ `internal`（未分类错误兜底）；`box_lost` = server 合成（② 径）。
- **人话明细** = 加性字段 `message`（帧词表加性扩展——既有消费零破）；审计面 = `chat_stop` 行 `reason` 直传同值（单源 = `accounts/ACCOUNTS.md` §2.1）。
- **浏览器断连**：回合照跑（盒侧继续执行并保存槽文件；重连 ⇒ 重读详情 = 向盒取指令——终态全量）——沿「执行不依赖连接」。

### 3.5 生命周期接线（休眠 ∥ 重建 ∥ 快照 ∥ 销毁）

- **起盒**（含休眠后启动）：容器起 ⇒ 壳起（镜像 CMD）⇒ 连挂 `hello`（§3.3）⇒ 在线。页面对位 = **盒状态与壳连接两读数分离**（运行中 ≠ 已连接——重建窗口可见）。
- **休眠**（空闲 30min ∥ 墙钟 24h——沿沙盒）：停盒 ⇒ 连接断 ⇒ 在途回合按掉线径收尾；**会话零损**（真源在盒——卷恒留 ⇒ 槽文件在场；下次启动即读）。
- **重建**（同 runner 停/重启 = 重建盒；跨机换机 = git 克隆 + 快照恢复）：同机重建 ⇒ 卷恒留 ⇒ 会话在场；换机 ⇒ 新盒恢复最近 WIP 快照 ⇒ **会话随快照回**（截至快照时点；周期窗内增量 = 旧节点卷内——如实在册）。
- **快照**：沿沙盒（卷全量存档——`/workspace` 含 `HOME` 下核会话文件）：**会话随快照**（恢复即回——时间点态）。
- **销毁**：工作区行消、卷删 ⇒ **会话随卷去**（确认门 = 显式删卷项——门面读数含快照；会话随卷同门，如实）；再建新工作区 = 新盒新卷（零会话）。
- **与 TTL 交互**：在途回合 = 模型/代理流量 ⇒ 不计空闲（沿沙盒空闲判据）；墙钟到点可截中途（接受——收尾沿掉线径）。

### 3.6 首次进入与拉仓

**首次进入四相**（页面空态/引导形——文案人话）：

| 相 | 所见 | 动作 |
|---|---|---|
| ① 无工作区 | 空态「还没有工作区」 | 创建（名称可选，缺省「工作区 N」；§3.7 动作集） |
| ② 盒未运行/未连接 | 会话可用性提示 + 状态可见（启动中/就绪） | 「启动工作区」就地动作（start——§3.7）；就绪后消息可发 |
| ③ 盒运行、零会话 | 「该工作区还没有会话——点『新会话』开始对话（仓库还没拉取就先『拉取』）」 | 「新会话」主钮 +「拉取」次钮；**不设门**——仓库未拉亦可先建会话对话 |
| ④ 有事可做 | 直接对话 | —— |

**拉仓流程（页面径——私仓主径）**：

1. 选项目 = `GET /api/projects?q=` 本人可见清单（B2 权限面复用；含搜索）。
2. 目标目录缺省 = 仓名（`/workspace/<名>`）；**目录冲突 = 盒侧检出**（`git clone` 目标非空 ⇒ 失败分类，检出点 = 盒结果面——步骤 5/6；请求期不预检）。
3. **提交前凭据预检**：`GET /api/me/git-credentials` 清单对 host（= 所选项目 address 首段小写——与 `member-pull.mjs` 的 `hostOfAddress` 同判）；缺 ⇒ 窗内就地揭示凭据区（主机只读 ∥ 用户名 ∥ 令牌）——保存成功 ⇒ **自动续拉**（即步骤 4，无需二次点击）；**跳过**钮在场（公开仓——不录直拉）；预检失败（网络/服务）⇒ 降级直进步骤 4。
4. `POST /api/me/sandbox/workspaces/:id/pulls { projectId, dir? }` ⇒ server 组装 `pull` 命令（url + dir）经盒下行——**凭据不随命令**（盒内助手按次自取，下条）。
5. 壳执行 `git clone`（凭据 = 盒内 git 凭据助手按次向 server 取件（`POST /api/box/credential`——工作区 key 判权）——只驻进程内存、用毕即清；clone 后 remote 地址去凭据）⇒ `POST /api/box/commands/:cmdId/result`。
6. 页面对位：拉取中 ∥ 成功（目标目录人话）∥ 失败（分类人话——含目录冲突；＋重试）。**失败且盒判 `kind:"auth"`**（凭据缺失/无效——盒消息已为就地措辞）⇒ **同窗就地揭示凭据区**（用户名按已取清单预填；重试钮在场）——更新保存后自动续拉（收口同步骤 3）。

**自加守卫五枚（设计未列；取值实读）**：页面径三枚（`public/views-me-chat-pull.mjs`）——① **目标变更守卫**（搜索重铺致所选换 host ⇒ 复位态 A 重预检——`:154-156`）∥ ② **在飞守卫**（`submitBtn.disabled` 为在飞旗——提交（`:149`）∥ 跳过（`:177`）两径同门；双击零双发）∥ ③ **预检回执复核**（预检在飞期选择变更 ⇒ 回执弃置——`:125`/`:130`）；
  盒件两枚（`deploy/sandbox/member-shell/pull.mjs`）——④ **目标目录围栅**（绝对路径 ∥ `..` 逃逸 ⇒ 拒，不落工作区外——`:94-99`）∥ ⑤ **clone 前先去凭据**（步骤 5「clone 后 remote 地址去凭据」的更严等价形——凭据文本一步不落盘——`:103-106`）。

- **出站面**：拉仓出站 = 直通（无闸面）。
- **公开仓（无凭据）**：页面径 = 凭据区「跳过」直拉（步骤 3 同链）；会话径 = 盒内 agent bash 直接 `git clone`（核家族工具）。
- **推送（盒内直推）**：改完 `git push` = 盒内**核家族 git 工具直用**（零新机制、零新面）；凭据 = 成员本人凭据（同助手按次取件——**拉取/推送共用单形**）；推送动作服务器零感知（零审计行——如实披露）。
- **凭据绑定**（**入径 = 拉取流内就地绑**——KD-SV-215；管理面 = 我的·账户页）：`PUT /api/me/git-credentials { host, username, secret }`（加密存储 ∥ 密文零回显 ∥ 审计 `credential_set`）∥ 撤销 `DELETE`（`credential_revoke`）；**缺凭据/无效 ⇒ 拉取窗内就地录入**（不再以「指回账户页」为主径——账户页卡保留于管理面）。
- **凭据披露（如实）**：成员凭据经盒按次（助手取件、用毕即清、零落盘）——环内威胁模型（自己人）下接受；权限 scope 由平台侧自带（谁拉的 = 平台侧可见）。

### 3.7 权限与上限

- **资源域**：工作区 ∈ 本人（`owner_member_id` 既有列）；**盒内会话 ∈ 本人**（归属随工作区传染；服务器零会话态——只校验复合 id 的归属与形态）。列表恒本人过滤；直取他人 ⇒ 404（不区分存在性）。
- **成员动作集（写面——已开）**：创建 ∥ 启动 ∥ 停止 ∥ 销毁（确认门——沿管理面：`confirm` 缺 ⇒ 400；快照读数先行）∥ 拉仓。**不另开管理面**（已裁）：承载 = 对话页就地形 + 工作区页动作列（同端点）+ 会话内 agent 工具（末条）；快照恢复/轮换 = 管理面（登记）。
- **上限**：`memberWorkspaceLimit`（`sandbox_settings` 键——正整数，缺省 **3**；设置行 = `gateway/API.md` §2.5 ∥ 卡面对照 = `sandbox/SANDBOX.md` §8）；创建校验 = 归属成员现存工作区行数 ≥ 上限 ⇒ 400 `workspace_limit_reached`（人话含数字）；写面 = 控制台沙盒页设置区最小件（实施批同拍——「每配置项有 UI 写入口」不破）；每成员覆写 = 登记（条件 = 差异化需求出现）。
- **成员面 agent 的 server 域工具面归属 = 本档**（§2 KD-SV-159——裁「成员资源动作走 chat + 工具」的落点）：范围 = 成员本人资源；动作集 = 写面同集——单源（创建 ∥ 启动 ∥ 停止 ∥ 销毁 + 拉仓）；管理面运维件（docker/主机/exec/provider）不入成员面；逐件清单与实施 = 实施批从实需反推。
  盒内 agent 另携核家族全件（开发面——「不减项」）；server 域成员件经工作区 key 调 `/api/me/sandbox/*`（**第三门**——键 → 工作区 → 负责人；作用域 = 本工作区；KD-SV-154 射程扩）。
- **MCP 工具面**（服务器级清单挂载；机制全文 = `mcp/MCP.md` §6）：盒逐回合取表（`GET /api/box/mcp`——零秘密）⇒ 桩件入 `extraTools`（装配点 = `core-run.mjs` `runTurn`）；调用 = `POST /api/box/mcp/call` ⇒ server `face.mjs` 执行（**工作区 key 第二门**——同盒族；与上款第三门分置）；失败降级 ⇒ 回合不阻断；子代理不携（顶层径）。
- **判权单源**：成员面端点守卫（cookie/Bearer ⇒ 成员身份 ∥ 归属校验）；工作区动作与既有 `requireAdmin` **同守卫点换判据**（`sandbox/SANDBOX.md` §4 接口已留）；盒内工具面 = **工作区 key 第三门**（键 → 工作区 → 负责人——§3.11(7)）。

### 3.8 移动端接口形（声明——app 壳本次不做）

1. **鉴权** = `Authorization: Bearer`（成员 key——`client/CLIENT.md` 客户端登录面既有）+ 控制台 cookie **双门同判权**。
2. **端点族** = 与页面同源（`/api/me/chat/*` + `/api/me/sandbox/*`）——零 cookie 专用逻辑、零页面专用物（**会话源 = 盒内**——盒离线 ⇒ 读/聊不可达 + 启动引导，与页面同判）。
3. **流形** = HTTP chunked + NDJSON 逐行帧（与页面同帧词表）——任意 HTTP 客户端可消费；不依赖 EventSource/WS。
4. 页面专属物（render-core 渲染 ∥ i18n 键 ∥ DOM）**不入协议**——app 自带渲染。
5. 待做面（登记）：移动壳自身体验（流式渲染 ∥ 推送 ∥ 审阅）+ 公网化三件——零涉。

### 3.9 记忆面（压后）

- **方向（用户裁定）**：成员面走**团队记忆**（服务端侧共享记忆）；**不实现客户端式本地记忆**（personal/project 本地层与本地索引那套不落成员面）。
- **边界**：不设计本地记忆 ∥ **零新增**盒内本地索引接线（本地记忆那套层与索引）；件零记忆面——核同件携带的核默认面随核生效（`memory.db` 落盒卷 ∥ `memory` 工具随核家族——实况与裁定 = §2 KD-SV-158 注）。
- 团队记忆本体 = 另面（需求 §1 四面 ②「团队记忆与知识库」——另批）；届时成员面接入 = 随该批。

### 3.10 盒内壳与核（最小壳 ∥ 镜像 ∥ env）

- **形态**：壳 = 最小进程（连 server ∥ 驱核回合 ∥ 执行拉仓命令）——**不是第二套 agent**（循环/会话/提示词/工具 = 核件；判据 = 壳源零 agent 循环自实现）。
- **镜像**（`deploy/sandbox/Dockerfile`——现读 **46**；件位契约 = `/opt/thincoder/app`——`sandbox/EXECUTION.md` §8；行账 = §5）：node:24-slim + git/curl + **核（构建期装——pin = server 依赖同版；KD-SV-138 装机三径①）** + 壳件（COPY——含 git 凭据助手）+ 助手登记（构建期入 PATH——git `credential.helper` 按名解析）+ CMD = 壳起（容器起即连）。
- **env（盒）**：既有 = `OPENAI_BASE_URL` / `OPENAI_API_KEY`（模型链；**不复制第二键名**——壳凭据取 `OPENAI_API_KEY`）+ 新 `TC_SERVER_URL`（server 基址——显式，零推导）。
- **会话落点**：核会话文件落盒卷（HOME=/workspace/home——核默认行为零改）；**会话 id 即核槽号**（无映射档）。
- **取核形**：`@thincoder/core` 件（会话/循环/工具/提示词——会话文件/槽机制即核原生面）；核批坐标零涉（回灌缝消解）；核面零改。

### 3.11 三端对齐面（用户「跟 vsc/desktop 差不多」＋「缺的 = 欠账，直接补」＋「哪有什么合理差异」）

**口径**：本节 = 逐项补齐的机制面（覆盖 = 两表 23 项 + 低优先两件 + 控件行余钮判定）；**不设「合理差异」栏**；真端面约束单项呈报（§9）。成员面 = 开发用途、有人值守——管理面「无人值守裁剪」的排除理由（`webui/CHAT.md` §2.1 对齐集⑩）在成员面不成立（KD-SV-217）。

#### (1) 帧面统一扩展（KD-SV-216——一族一次接线）

上行（盒 → server → 浏览器；`turns` NDJSON 流；base = `agent/ADMIN-AGENT.md` §11.3 六帧 + `begin`）：

| 帧 | 形 | 源（核回调——盒壳接线） | 页面消费（核件优先） |
|---|---|---|---|
| `reasoning` | `{ type, text }` | `onReasoning`（主面） | 核 `renderReasoning`（推理块——默认展开；改判条见下）+ `createStreamRenderer`（`markReasoning` ⇒ `paintReasoningTarget`） |
| `toolOutput` | `{ type, id, name, text, kind? }` | `onToolOutput(name, chunk, id)`（chunk 非串 ⇒ 取 `.text`——VSC 归一同式） | 核 `appendToolOutput(卡结果区, text)`（O(1) 追加原语——核 KD-RC-9） |
| `sub` | `{ type, token, ev, face?, args?, text? }` | 核 token 面的 relay 前缀 token（`onToken`/`onReasoning`/`onToolCall`/`onToolOutput`——**停止剥离**；`ev` = 事件 token 判位） | `ev:true` ⇒ 核 `relayEventToSubPatch` ⇒ `subBlocksReduce`；内容 ⇒ 核 `relaySubContentChunk` ⇒ `renderSubagentChunk`；块装配 = 核 `renderSubBlock` |
| `ask` | `{ type, kind, promptId, … }`（kind 四值——表见 (2)） | `onPermissionRequest`/`onBatchPermissionRequest`/`onQuestion`/`onSecretInput` | 卡族（(2) 表）；应答 = `POST …/asks/:promptId` |
| `tasks` | `{ type, done, inProgress, pending, total }` | `onTaskUpdate` | 状态行「任务」段 |
| `compress` | `{ type, status, tokensFreed?, elapsedMs?, error? }`（`start`/`done`/`fallback`/`failed`） | `onCompressStart`/`onCompress`/`onCompressFail` | 状态行「压缩」段 |
| `wait` | `{ type, info }`（相位词单源 = 核 `provider/wait-status.mjs`） | `onWait` | 状态行状态文本段（限流/过载/配额） |

**推理块默认态（2026-10-19 改判）**：`reasoning` 帧的块 = **默认展开**——原判「默认折叠」（#875 · 2026-10-04）推翻。
理由 = 折叠态在界面上等同「没有活动」，看不出模型在跑还是在卡（用户 2026-10-19 14:23）；同一核件不设无理由的端差——成员面与 VSC ∥ 桌面同默认（用户 2026-10-19 14:26「体验要一致」）。
机制与消费面 = `docs/render-core/design/RENDER-CORE.md` §5；回读径同拍（核 `buildAssistantRestore` 携 `open`）。

扩字段（既有帧）：`usage` += `reasoning`（核 `usage.reasoning_tokens`——`✦` 段源）+ `timers { count, expired }`（盒内 `agent._pendingTimers` 活读投影——`⏰` 段源）。

下行（server → 盒 SSE）：

| 事件 | 形 | 语义 |
|---|---|---|
| `answer`（增补） | `{ promptId, kind, verdict? ∥ answer? ∥ values? }` | ask 应答回程（浏览器 ⇒ `POST …/asks/:promptId` ⇒ relay 下行） |
| `abort`（扩） | `{ cmdId, sessionId, key? }` | `key`（`<role>#<id>`）在场 = 停单个子代理（停单件）；缺 = 中止整回合（沿既有） |

掩蔽口径：`ask.args` 与 `call.args` 同源（`member-relay.mjs` `cappedFrame` 单点——`argsTextOf` ⇒ ≤500）；`ask` 秘密载荷（`fields`）零值（描述面）+ 应答 `values` 值零入上下文零落盘（页 → 盒直通）。**拒改口径**：帧面单源 = 盒壳 `protocol.mjs` 构造器 ∥ server `member-relay.mjs` 单点转发。

#### (2) ask 回路与卡族（KD-SV-217）

**时序**（一个回合内）：盒跑工具 ⇒ 核回调 await ⇒ 盒壳发 `ask` 帧（上行流）⇒ server relay 登记在途表（promptId → 回合）+ 转发浏览器（同流）⇒ 页面挂卡 ⇒ 用户应答 ⇒ `POST /api/me/chat/sessions/:id/asks/:promptId` ⇒ relay 发下行 `answer` ⇒ 盒壳结算核承诺（工具继续）⇒ 后续帧照流。

**ask 帧四形**（kind ∥ 体 ∥ 卡 ∥ 应答体）：

| kind | 体（`ask` 帧） | 卡 | 应答体 |
|---|---|---|---|
| `permission` | `{ promptId, tool, args, diff?, owner? }` | 核 `renderApprovalCard`（diff 预览内建——**两形**：`{patch}` 统一 diff 文本 ∥ `{old,new,path}` 旧/新全文；`view-diff` ⇒ 页内弹窗全量 patch——判类/差分走核件 `patchLineType`/`lineDiff`） | `{ verdict: "once" ∥ "always" ∥ "reject" }` |
| `batch` | `{ promptId, count, tools: [名…] }` | 核 `renderBatchApprovalCard` | `{ verdict: "approveAll" ∥ "oneByOne" ∥ "deny" }` |
| `question` | `{ promptId, question, options }` | 核 `renderQuestionCard` | `{ answer: <串> ∥ null }` |
| `secret` | `{ promptId, kind?, sessionId?, host?, user?, port?, fields, keys }`（七键白名单——桌面 `askSecret` 同形） | 页内件（核无此卡——VSC `secret-input.js` ∥ 桌面 `secret-prompt.mjs` 同族）：`fields` 逐项（masked ⇒ 口令框 ∥ prefill ∥ required）+ 提交/取消 | `{ values: {<name>:<值>} ∥ null }` |

**盒壳映射单点**（`answer` ⇒ 核回调返回值）：`once`/`always` ⇒ `true`（`always` 另经 `setSlotAutoApprove` 置槽 + 回推行 `flags`——同桌面「always」）；`reject` ⇒ `false`；批门三值直传；问询 = 串 ∥ `null`（取消）；秘密 = 值对象 ∥ `null`。**零值入上下文**：秘密值只经应答体直达核回调（同 `onSecretInput` 契约——核工具自身保证值不入消息）。

**兜底结算**（收尾径——盒壳 + relay 双侧同拍）：`end` 帧 ∥ 中止 ∥ 掉线 ⇒ 未决 ask 全量收口（单件 = 拒 ∥ 批 = `deny` ∥ 问询 = 取消 ∥ 秘密 = 取消）；relay 在途表随回合清（后到应答 ⇒ 400 零副作用）；页面随 `end` 摘除残留卡。

**页面去留**：卡挂 `#messages`（`.chat-thread`）尾 + `scrollIntoView`；应答 ⇒ 摘除；回合收尾 ⇒ 清卡；`owner` 在场 ⇒ 卡头归属段（子代理门——核件 `perm-owner` 面）。

#### (3) 模式旗四枚（KD-SV-218）

- **四旗** = `autoApprove` ∥ `advisorGuard` ∥ `engineering` ∥ `planMode`——**住核槽**（盒内真源——KD-SV-152 同口径）；写径 = `PATCH …/:id`（一次一件）⇒ `session.update` 指令 ⇒ 盒壳调核写面四件（`setSlotAutoApprove`/`setSlotPlanMode`/`setSlotEngineering`/`setSlotAdvisorGuard`——`thincoder-core/session-slot-write.mjs:146-165`）；
  读径 = 列表/详情行携 `flags`（盒读槽四字段）；**生效** = 回合装配（核 `applySession`——`session-lifecycle.mjs:118-137`；ENG⇒PLAN 互斥随核，盒零逻辑）。
- **页面**：核控件行四钮解隐藏（适配层 `state.flags()` 由恒假改读当刻会话行）——AUTO 内联确认 ∥ ENG×PLAN 互斥 ∥ advisor 守卫（三态行为 = 核件 `composer/controls.mjs` 逐字——零自持）。
- **解隐藏落法 = 适配层开关**（成员 composer 容器自建点挂 `data-flags="live"`——`views-me-chat-composer.mjs:104`；`style.css` 作用域覆写 `#toolbar[data-flags="live"]` 下四模式钮 + 设置钮 `display: inline-flex`（核 `.ctrl-btn` 同值——`thincoder-render-core/composer/composer.css:207`）；全局收窄五 id 规则零动 ⇒ 管理面五枚仍隐、AC-19 canon 不破）。
- **口径**：会话级 + 下回合生效（沿 PATCH）；`always` 审批 ⇒ 置 AUTO（同桌面）；mid-turn 追改不做（呈报 §9 R84）。

#### (4) 状态行段表（KD-SV-220——全段对齐）

段序 = 现有段 ∪ 桌面段表（`thincoder-desktop/renderer/views/statusline-segments.mjs` 段序）；`{ text, warn }` 形不变（本页自持渲染——核无状态行族）：

| # | 段 | 源 | 处置 |
|---|---|---|---|
| 1 | 运行中… | 客户端回合态 | 保持 |
| 2 | 工具: <名> | `call`/`result` 帧 | 保持 |
| 3 | ↑N ↓N | `usage` 累加 | 保持 |
| 4 | ✦N | `usage.reasoning` | 补 |
| 5 | hit N% | `usage` 累加 | 保持 |
| 6 | context N% | 末次 `usage.prompt` ÷ 快照规格 | 保持 |
| 7 | 轮次 n | `turn` 帧 | 保持 |
| 8 | 耗时 Ns | 客户端时钟 ∥ `end.durationMs` | 保持 |
| 9 | 已静默 Ns | 客户端时钟（≥10s——三端同阈） | 保持 |
| 10 | 计划模式 | 会话行 `flags.planMode` | 补 |
| 11 | 等待审批 | 页内在决 ask 表 | 补（注意力段——桌面 `attentionSegment` 同义） |
| 12 | 挂起 N/M | 子代理块列表计数（running+queued ∥ settled） | 补（回合内——跨回合呈报 R83） |
| 13 | 任务 N/M | `tasks` 帧 | 补 |
| 14 | ⏰N | `usage.timers.count`（`expired>0` ⇒ 警示色） | 补 |
| 15 | 压缩中… ∥ 已压缩 | `compress` 帧 | 补 |
| 16 | 状态文本（限流/过载/配额） | `wait` 帧（核词键单源） | 补 |
| 17 | 会话标题 | 会话行 `title` ∥ excerpt | 补（行字段——KD-SV-221） |
| 18 | 队列 N / Enter 提示 | 页内队列（`composer.queueCount`） | 补（薄） |
| 19 | 台账标记 ∥ 团队登录态 | —— | **判定项**（同物在成员面无参照物——§9 R85/R86 呈报） |

#### (5) 子代理面（KD-SV-219）

- 帧 ⇒ 核件链（见 (1) `sub` 行）；块态机/效果表 = 核 `subblocks/*`（出生/接管/冻结/归档四迁 + 队列/逐轮帧/审批态写点）——**页侧执行核件效果表**（born/takeover/fold/awaiting/archive/remove/refresh；`connectedOf`/`regionOf` 注入 = 页内 DOM 事实——核 `state.mjs` 端接线注）。
- **等待审批态**：子代理门 `ask` 帧携 `owner`（`parseRelayPath(name).head`——`<role>#<id>`）⇒ 核块头审批写点（`status:"approval"` + `tool`——`subBlocksReduce` patch 面）。
- **停单个**：块 ⏹（`CANCELABLE_ROLES` 门——核 `activity-view.mjs:18`）⇒ `POST …/abort { key }` ⇒ 下行 `abort{…,key}` ⇒ 盒壳按池条目中止（核既有控制面）。
- **活动区**：`#subagent-activity` 区（核 `configureActivityView` 尾行数）+ 归档入流（`#messages` 边界/尾追——核效果表）。
- **跨回合**：盒每回合新装配 agent ⇒ 池条目回合内可达（回合外 = 端面约束——§9 R83）。

#### (6) 会话条与页面小件（KD-SV-221 + 逐项）

| 欠账 | 落法 |
|---|---|
| 会话行位标（运行中 ∥ 待审批） | 自绘下拉行首位标——源 = 行 `status`（盒读）+ `awaitingApproval`（relay 在途 ask 读数——列表合并时注入） |
| 行 meta 补全 | 行 = 标题 + `工作区 · provider · N msgs · 日期`——`count` = 盒槽 history 长（`rowOf`/`slotFacts` 读面扩）；`title` = 槽 `title`；provider = 页 `providerOf(model)`（既有） |
| 项目/工作区钮（📁） | 工作区选择弹层（本人工作区 + 盒态读数）⇒ 过滤会话选择器 + 新会话预选；启停仍走「启动工作区」钮 |
| 重命名 | ✎ ⇒ 行内输入 ⇒ `PATCH …/:id { title }` ⇒ `session.rename` 指令 ⇒ 核 `renameSlot`（`{ok,reason}` 面 ⇒ 400 人话） |
| 删除 | ✕（>1 时）⇒ 确认弹层 ⇒ `POST …/:id/delete { confirm: true }`（缺 confirm ⇒ 400——沿沙盒确认门口径）⇒ `session.delete` ⇒ 核 `deleteSlot` |
| 会话内搜索 | 核 `createSearch({ root: .chat-thread })`（Ctrl+F 注册随核件工厂——零端侧副本）+ 核 `search.css` `<link>` + `search.*` 键（核件词面段） |
| 复制钮（条件 = TLS） | 核 `attachCopyButtons`（消息面新内容挂钮）+ **降级形**：`navigator.clipboard` 不可用（http 无安全上下文）⇒ 页捕获阶段拦截 `.code-copy-btn` 点击 ⇒ toast「复制不可用（需要 HTTPS）」（核 catch 面零反馈 ⇒ 页补）；TLS 后（#1243）拦截自动失效（零改） |
| 图片通道 | 取「补通道」：`POST …/:id/messages` 体 + `run` 事件扩 `images`（dataURL 列）——服务端校验 = 核 `parseDataUrl` + `isNonVisionModel` 视觉门（400 人话——管理面同源）；盒壳 `runTurn` 携 parts；页 composer `post` 放行 `payload.images`；**零静默丢**（门拒 ⇒ 就地人话 + 草稿保留） |
| `@` 文件引用 | 适配层桥 `atComplete` ⇒ `GET /api/me/chat/files?workspaceId=&q=`（盒 `cmd files.list`——workspace 根遍历，忽略 `node_modules`/`.git`，上限 50 行）⇒ `atResults` ⇒ 核 `atmenu.showAtDropdown`（`{name,path}` 两列） |
| 工具结果全文 | 活流：`result.content`（全文）入卡（`finishToolCard` 文本 = `content` ∥ 摘要）；回读：tool 行 `data` 携 `content`（截断 = 核 `MAX_TOOL_OUTPUT` 64 KiB 单源——`capText`），页同径 |
| 设置钮（⚙） | 判定 = 成员面可配面 = **我的·账户**（Git 凭据卡 ∥ 改密）；⚙ ⇒ 路由 `#/me/account`（零新弹层、零第二份表单）；就地弹层 = 另裁（成本在册） |
| 自动标题 ∥ 压缩读数 | 自动标题：`title` 字段入行（槽 `title`——重命名落件后可用）；**生成器不做**（核无自动生成件——展示面落、生成器另批）；压缩面：`compress` 帧 + 段 15（落） |

#### (7) 工具面清单落定（R77 收口——KD-SV-222）

| 件 | 落法 |
|---|---|
| 核家族全件 | `assembleAgent` 默认装配（在册——开发面「不减项」） |
| `workspace_create` ∥ `workspace_start` ∥ `workspace_stop` ∥ `workspace_destroy` | 新档 `deploy/sandbox/member-shell/member-tools.mjs`——核工具形（`{ name, description, parameters, execute }`）；动作 = `POST /api/me/sandbox/*`（工作区 key **第三门**——键 → 工作区 → 负责人；作用域 = 本工作区；`Authorization: Bearer <OPENAI_API_KEY>` 同值）；经 `runAgent(..., { extraTools })` 注入（核 `thincoder-core/agent/setup.mjs:218` 缝——零核改） |
| 拉仓 | 既有能力登记（盒内 `git` 工具 + 凭据助手）——**不另立工具** |
| MCP 工具（服务器级清单） | 盒件 `deploy/sandbox/member-shell/mcp-tools.mjs`（已落盘——逐回合取表 ⇒ 桩件 `extraTools` 并面；零缓存 ∥ 降级 ∥ 防撞）；执行侧 = 桥两端点（`GET /api/box/mcp` ∥ `POST /api/box/mcp/call`——`thincoder-server/src/mcp/member-bridge.mjs`）⇒ `thincoder-server/src/mcp/face.mjs`（复用零改）；机制全文 = `mcp/MCP.md` §6 |

## 4. 端点摘要（表为索引——单源 = `gateway/API.md` §2.11 ∥ §2.12）

| 族 | 端点 | 判权 | 单源 |
|---|---|---|---|
| 成员面会话（浏览器/移动端） | `GET/POST /api/me/chat/sessions` ∥ `GET /api/me/chat/sessions/:id` ∥ `GET /api/me/chat/models`（开放清单 + 档位枚举） ∥ `POST …/:id/messages`（NDJSON 流）∥ `POST …/:id/abort`（体 `{ key? }`——停整回合 ∥ 停单件）∥ `PATCH …/:id`（换模型 ∥ 设档 ∥ 四旗 ∥ 标题——一次一件）∥ `POST …/:id/asks/:promptId`（ask 应答——§3.11(2)）∥ `POST …/:id/delete`（确认门）∥ `GET /api/me/chat/files`（@ 候选） | 本人（cookie ∥ Bearer 双门） | `gateway/API.md` §2.11 |
| 成员面工作区扩（写面） | `POST /api/me/sandbox/workspaces`（建——上限校验）∥ `POST …/workspaces/:id/:action`（`start` ∥ `stop` ∥ `destroy`——确认门）∥ `POST …/workspaces/:id/pulls` ∥ `GET …/workspaces/:id/pulls/:pullId` | 本人 ∥ **盒内工具面 = 工作区 key 第三门**（键 → 工作区 → 负责人——KD-SV-154 射程扩） | `gateway/API.md` §2.11 |
| 成员 git 凭据（我的·账户） | `GET/PUT /api/me/git-credentials` ∥ `DELETE /api/me/git-credentials/:host`（加密零回显 ∥ 审计行） | 本人 | `gateway/API.md` §2.11 |
| 盒接入（盒出向） | `GET /api/box/events`（SSE——含 `cmd` 指令下行 ∥ `answer` 应答下行 ∥ `abort` 携 `key`）∥ `POST /api/box/sessions/:id/turns`（流式体——纯转发；帧集 = §3.11(1) 增补后全表）∥ `POST /api/box/commands/:cmdId/result` ∥ `POST /api/box/ping`（保活应答）∥ `POST /api/box/credential`（git 凭据取件）∥ `GET /api/box/mcp`（MCP 工具表——零秘密）∥ `POST /api/box/mcp/call`（MCP 调用） | 工作区 key（第二门——KD-SV-154） | `gateway/API.md` §2.12 |

## 5. 本域文件与行数预算（成员面）

> 服务端件拟新增于 `thincoder-server/src/agent/`（域内拆分）；盒壳件于 `thincoder-server/deploy/sandbox/member-shell/`（镜像构建上下文；档账入本档，`sandbox/SANDBOX.md` §13 不重计）。**行数 = 预算（以实施当刻实读为准）**；**实读口径 = 换行计数**（`\n` 个数；带末尾换行的档比 read 工具末行号少 1）。

| 件 | 现读 | 预算 | 角色 |
|---|---|---|---|
| `src/agent/member-relay.mjs` | **410** | ≈220（设计） | 盒连接登记 ∥ 下行队列 ∥ 回合状态机（在途门/收尾三径——**内存态**）∥ 在线态 ∥ ask 在途表 |
| `src/agent/ask-vocab.mjs` | **37** | ≈30（设计） | 应答词表叶子（**零 import**）：`ASK_KINDS` ∥ `ITEM_VERDICTS` ∥ `BATCH_VERDICTS` ∥ `askAnswerBodyOf`——`member-relay.mjs` 以 import + 重导出同源（公共面零变） |
| `src/agent/member-routes.mjs` | **557** | ≈250（设计） | 成员面会话端点（读/建/改 = 盒指令转发）+ 工作区扩四端点 + git 凭据三端点（ask/delete/files 三端点 = 已外迁 `member-asks.mjs`） |
| `src/agent/member-asks.mjs` | **69** | ≈90 | ask/delete/files 三端点（自 `member-routes.mjs` 外迁——越线拆案） |
| `src/agent/box-routes.mjs` | **172** | ≈220（设计） | 盒三口 + SSE 下行 + 凭据取件口 + MCP 两口 |
| `src/agent/member-cred.mjs` | **118** | ≈90（设计） | 成员 git 凭据行存取（`credential-crypto.mjs` 复用 ∥ 密列零回显） |
| `src/agent/member-pull.mjs` | **104** | ≈130（设计） | 拉仓：项目/源解析 ∥ 命令组装与结果对位（凭据不随命令） |
| `src/store/db.mjs` | **36** | **±0**——v23 段入 `migrations.mjs` | —— |
| `src/store/migrations.mjs` | **795** | ≈**745**（+≈35——v23 段：凭据表 + 索引 + 审计 CHECK 重建（十六型）+ 迁移段） | 迁移链（v23 = 成员面段） |
| `deploy/sandbox/member-shell/{index,protocol,pull,git-cred,bootstrap}.mjs` | **1306**（370 ∥ 318 ∥ 114 ∥ 86 ∥ 418——index ∥ bootstrap 为本轮实测，余三件沿既有读数） | ≈730（设计） | 壳：连挂/读指令族 ∥ 帧编解码 ∥ 拉仓执行 ∥ git 凭据助手 ∥ 版本化引导（自取/自换/回退） |
| `deploy/sandbox/member-shell/core-run.mjs` | **490** | < 500（咨询线） | 核回合驱动（回合装配 ∥ 十一回调 ∥ 落槽；纯件已外提 `core-run-util.mjs`） |
| `deploy/sandbox/member-shell/core-run-util.mjs` | **179** | ≈180（设计） | 纯件叶子（八常/类 + 八纯函数；`core-run.mjs` re-export 原 11 名——import 面零改） |
| `deploy/sandbox/member-shell/member-tools.mjs` | **125** | ≈180 | 盒内 server 域四件（`workspace_{create,start,stop,destroy}`——KD-SV-222） |
| `deploy/sandbox/member-shell/mcp-tools.mjs` | **106** | ≈130 | 盒侧 MCP 桩件（取表/建桩/防撞——机制全文 = `mcp/MCP.md` §6.1） |
| `deploy/sandbox/Dockerfile` | **46** | ≈35（设计） | 核装 + 壳 COPY（含 git 凭据助手）+ 助手登记 + CMD（件位契约 = `/opt/thincoder/app`——`sandbox/EXECUTION.md` §8） |
| `.dockerignore`（仓根） | **+4/−1** | —— | 盒镜像构建上下文 = 仓根 ⇒ 核 pack 取件必需（白名单三包——`ops/OPS.md` §5.1） |
| `public/views-me-chat.mjs` | **499** | ≈380（拆后） | 成员对话页壳（四轴沿 `webui/CHAT.md` §2.1 + 成员差异：工作区维度/盒态动作/拉仓引导） |
| `public/views-me-chat-sessions.mjs` | **280** | ≈220 | 会话条（自绘下拉/行内控件——§3.11(6)） |
| `public/views-me-chat-cards.mjs` | **180** | ≈190 | ask 卡族（核件直用装配——§3.11(2)） |
| `public/views-me-chat-subs.mjs` | **162** | ≈200 | 子代理面（核 subblocks 栈消费——§3.11(5)） |
| `public/views-me-chat-pull.mjs` | **218** | ≈180 | 拉取弹窗（项目选择/目录 ∥ 四态轮询 ∥ **凭据就地绑**（预检/表单/自动续拉/无效更新——KD-SV-215）∥ 纯件两枚（`pullStateLabel` ∥ `pullDetailText`）∥ 自加守卫三枚（§3.6）） |
| `public/views-me-chat-messages.mjs` | **124** | ≈130 | 消息面（帧面纯函数 ∥ 回读装配——沿管理面同形） |
| `public/views-me-chat-composer.mjs` | **456** | ≈390 | 输入区与状态行（核件全件消费适配层——沿管理面同构；四旗读面/出站 + 状态行段扩 + `images` 放行 + `atComplete` 桥 + **钮可见性适配层开关**（`#toolbar` 挂 `data-flags="live"`）） |
| `public/i18n-{zh,en}-me.mjs` | **184 ∥ 185** | 各 ⇒ ≈200 ∥ ≈200 | 文案表·me 部件扩键 |
| 随正件 | —— | 小 | `public/app.mjs`（**209**） ∥ `nav.mjs`（**107**） ∥ `views-me.mjs`（**398**——账户页「Git 凭据」卡；行账 = `webui/ME.md` §3） ∥ `style.css`（**445**——卡族/下拉/搜索/子代理块类名 + 钮可见性作用域覆写；行账 = `webui/STYLE.md` §3） ∥ shell 两表（+1/表——键 `nav.page.me.chat`） ∥ `src/sandbox/routes.mjs` ∥ `registry.mjs`（写面判据点 + 上限） ∥ `bin/thincoder-server.mjs`（**241**） |
| 测试（单元测试档——**不入任何门**；随批收口用后即删——零留存） | —— | —— | 用例 = §7（成员面 N71–N87 ∥ B69–B76 ∥ E54–E61） |

## 6. 验收（AC-50 对位——机检）

| 行 | 判据（机检 = 单元测试档；实走 = 收口轮） |
|---|---|
| AC-50① 界面一致 + 入口 | `nav.mjs` 直测（我的 **7** 项——含 `#/me/chat`；角色默认页随裁）；页面结构用例（`#toolbar`/`#status-line` 各恰一；核件消费清单逐件）；帧消费（假流桩：六帧 ⇒ 分步交错形态签名——**与管理面页同形/同判据**）；无源钮零可见；会话读/列 = 盒指令转发（盒离线 ⇒ 就启动引导——不静默）；收口轮 = 用户实走对照（浏览器 vs VSC/桌面） |
| AC-50② 拉仓 | 端形用例（项目解析 ∥ 目录缺省/冲突 ∥ 命令组装 ∥ 结果对位）；收口轮 = 可见项目拉取成仓（真机） |
| AC-50③ 访问路径 | 路由核读（盒端点族 = 出向面：连接发起方 = 盒；服务端零「拨盒」路径）；页面取数域核读（无盒地址）；壳侧出向核读 |
| AC-50④ 核同件 | 镜像构建件核读（核 pin 在场 ∥ 版本对位 = KD-SV-138）；壳源零 agent 循环自实现（import 面断言）；「盒内另有一套」= 违规 |
| AC-50⑤ 一盒一工作区 + 生命周期 | attach 态与盒状态对位（读数分离）；停盒 ⇒ 掉线收尾（notice + `box_lost`）+ 会话不可达（启动引导）；重启盒 ⇒ 会话在（卷恒留——槽文件在场）；换机 ⇒ 快照恢复 ⇒ 会话随回（截至快照时点）；销毁 ⇒ 会话随卷去（确认门）；卷恒留沿沙盒（不复测） |
| AC-50⑥ 五题判据（152–157 逐条——裁定已落） | **152** 服务器零会话（`sqlite_master` 无两表 ∥ 端到端零落行——帧转发即弃）∥ 盒内槽文件在场（核默认路径）∥ 停盒不可达 + 引导 ∥ 重启盒会话在。**153** 假盒桩：SSE 六事件型逐形（含 `cmd`）+ 上行三口 + 凭据口回执；在线判据（ping 应答 ≤3 周期）；零落库断言。**154** 工作区 key 第二门（无 key ⇒ 401 ∥ 工作区作用域）；轮换 ⇒ 下次盒启动生效。**155** 四相脚本；拉仓端形（项目解析 ∥ 目录缺省/冲突 ∥ 命令组装）；凭据 = 成员本人（未绑定/无效 ⇒ 窗内就地录入（KD-SV-215）；绑定后按次取件——审计行）。**156** 四动作 + 拉仓；上限 400（含数字）；越权 404 不辨；设置键写入口。**157** 双门同判权；NDJSON 逐行；端点族零页面专属物 |
| AC-50⑦ 拉取缺凭据 ⇒ 流内当场录入 | 页面用例（N79 ∥ B73 ∥ E58）：预检缺 ⇒ 窗内表单（主机 = 项目 host 只读）⇒ 保存 ⇒ `PUT` 恰一 + 自动续拉（POST 恰一）⇒ 复用（二次拉取零表单）；公开仓跳过 ⇒ 零 `PUT`；预检失败 ⇒ 降级直 POST；auth 失败 ⇒ 同窗更新 ⇒ 重拉（用户名预填 ∥ 重试钮）；项目选择变更 ⇒ 表单复位 + 用户名/密字段清空 + 零 `PUT`（防误绑他 host）；账户页卡零改（`views-me.mjs` 卡在 ∥ 端点零增）；盒消息不再指账户页（`pull.mjs` 句断言——§3.6/§9 R81）；**自加守卫腿**（目标变更 ∥ 在飞竞态（含回执弃置） ∥ 双击零双发——盒件两枚 = §3.6 登记） |
| 机制行（会话源） | 读指令族逐形（列表/读史/新建/改——假盒桩回呈）；真源断言（server 零会话表/行——`sqlite_master` + 零落行核读）；壳零核文件直读写（经核导出件）；复合 id 路由（`<workspaceId>:<槽>`） |
| 机制行（在途/收尾） | **会话级**在途门（同会话并发二发 ⇒ 400 零副作用；跨会话并行可达——KD-SV-223）∥ 中止径（含停单件 `{key}`）∥ 掉线/重启收尾（流内 notice + end 帧——零行） |
| 机制行（模型/档位） | 建会话缺省模型 ∥ `PATCH` ⇒ `session.update`（双携 ⇒ 400；值域 = 开放清单/核枚举——表外 400；盒离线 ⇒ 409）∥ 回合携 `reasoningEffort`（未设 ⇒ 零字段） |
| 机制行（鉴权/判权） | 双鉴权（cookie ∥ Bearer 同判权）；越权（他人会话/工作区 ⇒ 404 零泄露）；上限（超限 ⇒ 400 `workspace_limit_reached`） |
| 机制行（审计） | `member_event` **六 kind** 落行（`chat_start` ∥ `chat_call` ∥ `chat_stop` ∥ `pull` ∥ `credential_set` ∥ `credential_revoke`）；盒动作 = `sandbox_event` 行（detail 携 `by:"member"`） |
| 机制行（记忆面） | 本机制零新增记忆面件/零新增盒内本地索引接线（断言）：服务端零记忆表/零端点；盒内 = 核默认面随核同件（非本机制件——§2 KD-SV-158 注） |
| 成员面三端对齐（用户「跟 vsc/desktop 差不多」；功能点 50①） | ① **帧面**：七型 + `usage` 两扩字段 + 下行 `answer`/`abort.key`（假盒桩逐帧形；盒壳 `protocol.mjs` 构造器单点）；② **卡族**：ask 回路端到端（ask 帧 ⇒ 卡 → `POST …/asks/:promptId` ⇒ `answer` ⇒ 结算；单件/批/问询/秘密四形；核件直用断言）；③ **模式旗**：四旗写读（PATCH ⇒ `session.update` ⇒ 槽四字段 ⇒ 行 `flags`）∥ 回合装配生效（核 `applySession`）∥ **钮可见性**两侧同测（成员面四模式钮可见 ∥ 管理面五枚仍隐）；④ **状态行**：段表全段（19 段——源 ⊆ 表）；⑤ **子代理**：`sub` 帧 ⇒ 核栈（归约/效果表）∥ 停单件（`abort { key }`）；⑥ **会话条**：自绘下拉（位标/meta/✎/✕/📁）+ 重命名/删除端形；⑦ 页面小件（搜索/复制降级/@ 菜单/图片/toolOutput/全文/⚙） | 单元测试档 + 收口轮（用户实走对照 VSC/桌面） |
| ask 回路与收尾兜底（KD-SV-217） | 假盒桩：ask 帧逐形（四 kind）→ 页应答恰一 `POST` → relay `answer` 下行恰一 → 盒侧结算；兜底：`end`/中止/掉线 ⇒ 未决 ask 全量收口（单件拒 ∥ 批 deny ∥ 问询/秘密取消）∥ 后到应答 ⇒ 400 零副作用 ∥ 秘密值零入上下文（消息面扫描）∥ 非本人会话 ⇒ 404 不辨 | 单元测试档 |
| 成员面 MCP 工具挂载（AC-54⑤；机制全文 = `mcp/MCP.md` §6） | 分面判据：装配面 = §3.7/§3.11(7)（逐回合取表 ⇒ `extraTools` 并面 ∥ 失败降级回合不阻断）∥ 清单面 = 两端点响应零秘密 ∥ 审批面 = `readonly:false` ⇒ 核门挡 ⇒ 审批卡∥ 审计面 = `chat_call` 帧源落行 ∥ 命名面 = 核单源 + 盒侧防撞拒挂 + 日志；载体 = `mcp/MCP.md` §11 AC-54⑤ 行 ∥ 用例 N6/B4/E3 | 单元测试档 + 收口轮（成员会话实调一轮） |
| 边界行 | 不做面零出现（移动壳/公网化/穿透/三端面——路由与页面核读） |

## 7. 用例（本域——**成员面用例**：跨面重号以面别限定；同号 = `agent/ADMIN-AGENT.md` §8（管理面）∥ `webui/CHAT.md` §4（壳面）等，各面自持）

- **成员面 N71** 读指令族回呈（列表/读史/新建/改——假盒桩逐形）∥ **N72** relay 状态机（attach ⇒ run ⇒ 帧流 ⇒ end；掉线；重启——零落库断言）∥ **N73** 端点判权与门（双鉴权/本人过滤/**会话级**在途门/上限/码）∥ **N74** 拉仓（解析/组装/结果对位/凭据经助手取件）∥
  **N75** 盒协议编解码（下行六事件 + `answer` ∥ 上行三口 + 凭据口 + 帧表增补七型——纯函数腿）∥ **N76** 页面结构（四轴件/键集/无源钮）∥ **N77** 页面帧消费（假流桩 ⇒ 形态签名）∥ **N78** 凭据（存取/取件响应逐形/用毕即清断言）。
- **成员面 N79** 拉取凭据就地绑（预检缺 ⇒ 窗内表单（主机 = 项目 address 首段小写）⇒ 保存 ⇒ `PUT` 恰一 ⇒ 自动续拉（POST 恰一）∥ 复用腿：二次拉取零表单 ∥ 预检缺时表单揭示前 POST 零发 ∥ 复位腿：项目选择变更 ⇒ 表单复位 + 用户名/密字段清空 + 零 `PUT`）。
- **成员面 B69** 盒掉线（在途 ⇒ 收尾；空闲 ⇒ 在线态翻转）∥ **B70** 服务端重启（在途态清 + 流断重连）∥ **B71** 会话级在途门（同会话并发二发 ⇒ 400；跨会话并行可达——同工作区两会话并行腿）∥ **B72** 换机（快照恢复 ⇒ 会话随回续聊；无快照 ⇒ 如实）∥ **B73** 公开仓径（缺凭据 ⇒ 跳过 ⇒ 零 `PUT` 直拉 ∥ 预检失败 ⇒ 降级直 POST——两腿）。
- **成员面 E54** 上限拒（数字人话）∥ **E55** 越权拒（404 零泄露）∥ **E56** 盒离线拒（409 + 启动动作在场）∥ **E57** 凭据未绑定（拉取 ⇒ 窗内就地表单——主机只读/用户名/令牌在场 ∥ 跳过钮在场）∥ **E58** 绑定无效（auth 失败 ⇒ 同窗更新重拉——用户名预填 ∥ 更新后自动续拉 ∥ 重试钮在场）。
- **成员面 N80** ask 回路（假盒桩：单件/批/问询/秘密四形——卡造 ⇒ 应答恰一 `POST` ⇒ `answer` 下行恰一 ⇒ 结算 ∥ `always` ⇒ 槽 `autoApprove` 置真 + 行 `flags` 回推 ∥ 体与 kind 不符 ⇒ 400 零副作用（在途表零改））∥
  **N81** 卡族渲染（核件直用断言：`renderApprovalCard`/`renderBatchApprovalCard`/`renderQuestionCard` 类名序；`view-diff` ⇒ 弹窗全量 patch；秘密卡 masked/prefill/required 三面）。
- **成员面 N82** 子代理面（`sub` 帧逐形 ⇒ 核 `relayEventToSubPatch`/`subBlocksReduce` 归约 ⇒ 效果表执行；块头审批写点（`owner` ask）；停单件 `abort { key }`）∥ **N83** 模式旗（四旗写读：PATCH ⇒ `session.update` ⇒ 槽四字段 ⇒ 行 `flags`；ENG×PLAN 互斥；回合装配 `applySession` 生效；钮可见性两侧同测——成员面四模式钮可见（作用域覆写命中）∥ 管理面五枚仍隐）。
- **成员面 N84** 状态行全段（19 段逐源：假帧桩 ⇒ 段集 ⊆ 表；缺源 ⇒ 零段）∥ **N85** 会话条（自绘下拉行形：位标/meta/`count`；✎ 重命名 ⇒ `session.rename`；✕ 确认门 ⇒ `session.delete`）∥ **N86** 页面小件（搜索挂载（核 `createSearch`）∥ 复制降级（`navigator.clipboard` 缺 ⇒ toast）∥ `@` 菜单（`atComplete` ⇒ `GET …/files`）∥ 图片（`images` 体/门））。
- **成员面 N87** 推理块（`reasoning` 帧 ⇒ 核 `renderReasoning`——默认展开（2026-10-19 改判——理由见 §3.11(1)）；无推理 ⇒ 零块）∥ 工具面四件（`workspace_{create,start,stop,destroy}` 在表——假桩断言；拉仓 = 既有 `git` 工具登记——零新工具）∥ 📁 工作区切换（选择 ⇒ 列表范围随 + 新会话预选随；零残留选择）∥ ⚙ 路由（点击 ⇒ `#/me/account`）∥ 自动标题展示（`title` 非空用 `title` ∥ 空 ⇒ excerpt 顶行）。
- **成员面 B74** ask 兜底（`end`/中止/掉线 ⇒ 未决 ask 全量收口；后到应答 ⇒ 400 零副作用；页残留卡清）∥ **B75** 回合内池态边界（停单件 vs 停整回合；非在跑 key ⇒ 400）∥ **B76** 工具输出边界（`toolOutput` 截断（核 `appendToolOutput` `_capped`）∥ `result.content` 全文/回读 `MAX_TOOL_OUTPUT` 口径）。
- **成员面 E59** 审批拒（`reject`/`deny` ⇒ 核拒绝径照旧——工具拒执行 + 消息面照旧）∥ **E60** 秘密取消（`values: null` ⇒ 核工具「未提供」径）∥ **E61** 删除/重命名端形（缺 confirm ⇒ 400；`renameSlot` `{ok:false}` ⇒ 400 人话零改）。

## 8. 本域边界（不做的面）

- 移动壳不做（接口形声明在册——§3.8）∥ 公网化三件（#1243）不做 ∥ 内网穿透/中转类不做。
- 三端（CLI ∥ VSC ∥ 桌面）工作区/会话面 = 不做（单列提议——R75）。
- 会话删除/重命名 = 已落（KD-SV-203 收口——行内钮 + 确认门；§3.11(6)）；会话清理 = 不做（沿管理面保留口径）；跨工作区会话迁移 ∥ 会话分享/协办 = 不做（功能点 35 另批）。
- 无回合看门狗（收尾三径在册——§3.4）；会话随卷/随快照（如实——§3.5）。
- 管理面对成员会话的读/干预面 = 不设；成员面零本地记忆（压后——§3.9）。

## 9. 上抛/余项（本域）

| # | 项 | 类型 | 处置 |
|---|---|---|---|
| R75 | **三端工作区/会话面**（`sandbox/SANDBOX.md` §8 登记「随 #1215」）：出案 = **不做**（三端本地开发面已在；服务端工作区消费 = 新端侧能力面，须按「端侧同批」三端 + 控制台同批落齐）——单列提议待裁（代价 = 登记续悬或改指后续端侧批） | 待裁·出案 | 用户/父侧 |
| R76 | **回灌核缝**——题一裁定后**消解**（会话住盒、零回灌；核批零涉）——本条关闭 | 已消解 | —— |
| R77 | **成员面 agent server 域工具逐件清单**（KD-SV-159）：实施批从实需反推（域/权限已定） | 登记 | 实施批 |
| R78 | **需求档回笔**（主 agent 笔）：AC-28 审计型 十五 ⇒ **十六**（`member_event`——类型不随表去；kind 四 ⇒ 六：+ `credential_set`/`credential_revoke`）∥ AC-12 我的 **6 ⇒ 7** + 静态档目链随正 + 角色默认页（若裁）∥ **AC-50 ⑥ 五题判据回填**（判据文本 = 本档 §6 ⑥ 行——152–157 逐条） | 回笔 | 主 agent |
| R79 | **会话管理面删除/重命名露钮**（KD-SV-203——**已收口**）：落钮（行内控件 + 确认门；§3.11(6)） | 已收口 | —— |
| R80 | **§1 代价句②澄清**（如实呈报——报父侧）：§1「换机/重建 ⇒ 会话不随」与卷/快照机制相抵（快照 = 卷全量存档——含会话 ⇒ 按机制 = 会话随快照回，截至快照时点）；本档 §3.5 按机制落，§1 句面 = 主 agent 笔 | 上抛·待裁 | 父侧/用户 |
| R81 | **盒镜像随动**（改件 `deploy/sandbox/member-shell/pull.mjs` 住镜像内）：部署 = 盒镜像重建；旧盒在途期旧措辞（行为零差——纯文案面）；收口轮实走以新盒复读为判 | 部署 | 收口轮 |
| R83 | **跨回合面真端面约束**（呈报——为什么+代价）：盒壳**每回合新装配 agent**（`core-run.mjs:291`）⇒ 池/timer/挂起窗等**回合间态**不可达（VSC/桌面 = 常驻进程）。可达面 = 回合内（帧面七型全在）；跨回合延续 = **默认补法（成本在册）**：盒壳改常驻 agent 或回合间态落盘/内存表——动盒壳生命周期（与「回合驱动 = 核既有」设计相抵）——未裁前不做 | 上抛·呈报 | 父侧/用户 |
| R84 | **模式旗 mid-turn 追改**（呈报）：PATCH 口径 = 下回合生效（沿 KD-SV-111/108）；VSC `_autoApprove` = mid-turn live（审批门读当刻值）。默认补法 = 审批门改读「页面最近一次旗值」（需下行旗面事件——+1 帧）；成本小——未裁前不做。**属真端面约束**（why = 审批门在盒内（核回调）——页面旗值到门须下行帧新通道（盒只出向、帧即转发即弃）；两壳门在进程内 ⇒ 可 mid-turn live，成员面不可） | 上抛·呈报 | 父侧/用户 |
| R85 | **台账标记段**（呈报——成员面无同物）：两壳源 = **本地账本**态（VSC `ctx._ledger`）；成员面零本地账本（KD-SV-158/§3.9）⇒ 段无源。默认补法 = 下拉首行注记**服务端团队台账**未决计数（源 = `GET /api/ledger` `total`——零新端点；语义重定义「台账 N 条未决」）；未裁前不造 | 上抛·呈报 | 父侧/用户 |
| R86 | **团队登录态段**（呈报——无参照物）：桌面段源 = 宿主登录面（未登录/失效/已登录三态）；成员面 = 恒登录（页面即成员会话）⇒ 三态无参照。如要对表显示成员名 ⇒ 一行取数（控制台会话面既有）；未裁前不造 | 上抛·呈报 | 父侧/用户 |
| R87 | **页件拆档合并序**：拆 `views-me-chat.mjs`（500 越线）为四件；拉取件外拆 `views-me-chat-pull.mjs` 同拍——合并序 = 父侧路由 | 路由 | 父侧 |
| R88 | **盒镜像随动**（改件 `deploy/sandbox/member-shell/{protocol,core-run}.mjs` + `member-tools.mjs` 住镜像内）：部署 = 盒镜像重建；旧盒在途期旧帧面（新页兼容旧盒：未知帧零处理、`ask` 缺 ⇒ 工具拒照旧）；收口轮实走以新盒复读为判 | 部署 | 收口轮 |
| R89 | **测试链随正**（清单单源）：① `2026-10-13-member-face-chat-ui.test.mjs` ⇒ 拆档重指新档三件；② `2026-10-13-member-face-chat.test.mjs` ⇒ 帧词表/端点面用例随正；③ `2026-10-08-server-public-structure.test.mjs` ⇒ 键数就地收正 + 指纹 sha256 重算；④ `2026-10-11-console-tabs-component.test.mjs` ⇒ `PUBLIC_SNAPSHOT` +新档三件（档目/键数就地收正）；⑤ `2026-10-10-runner-admin-console-ui.test.mjs` ⇒ 键数/档目就地收正；⑥ `2026-10-12-team-projects-permissions-ui.test.mjs` ⇒ 键数就地收正（越 500 软线——仅数字收正、拆分不做）；⑦ 单元测试档（用例 = §7 N80–N87 ∥ B74–B76 ∥ E59–E61） | 随正 | 实施轮 |
| R90 | **盒内并发回合资源面**（呈报·知会——无真约束、无门）：跨会话并行放开后盒内并发数**不设上限**（容器配额 = 事实上限——KD-SV-223）；如要限流/排队 ⇒ 新机制（另裁）；同会话二发已封（会话级门） | 上抛·知会 | 父侧/用户 |
