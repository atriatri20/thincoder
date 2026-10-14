# Thincoder Server · 管理面 agent（agent/ADMIN-AGENT）

> 板块 = server ∥ 本域 = agent（server 端 agent——管理面唯一 agent）；本档 = 域档。
> 口径单源 = `docs/server/requirements/PROJECT.md` §5「两个 chat 界面」（管理面 chat——功能点 37 ∥ 41 ∥ 43 ∥ 46）：载体 = server 进程内的 LLM agent（工具面 = 管理面八件 + 环境六族八件；能力逐步长）。
> 用户 2026-10-10 22:19–22:29 口径（逐字在批档 `docs/batches/2026-10-10-runner-admin-console.md` §1 口径补记 5/6）：工具面要有通用执行能力（bash/ssh 级——「不给bash/ssh会很麻烦」）∥ Docker 操作工具要给（「一些docker的操作工具不给他吗？」）∥ **唯一一个 agent**（「就是同一个agent，就是管里面的那个agent」——能力面 = 整个 server 管理面，逐步长）。
> 落点 = 控制台对话页 `#/admin/chat`（`webui/CHAT.md` §2.1）；核复用口径 = `PROJECT.md` §5 KD-SV-78。
> 建档：2026-10-10（批 `docs/batches/2026-10-10-runner-admin-console.md` §2 · 台账 #1237 + #1236）。

## 1. 形态与定位

- **一句话**：管理面 agent = **server 进程内的 LLM agent**——以**会话**为单位接收管理动作（管理面 chat），经工具面（管理面八件 ∥ 环境六族八件 ∥ MCP）执行、验证、报告。
- **唯一一个**（用户 22:29）：不为管理面另立第二个 agent；其余管理面能力（成员 ∥ provider ∥ 模型选择 ∥ 用量/配额 ∥ 审计 ∥ 沙盒各面）陆续入其工具面——「通过 agent 完成 thincoder server 的完整管理」（需求 §5 后续议题行 · 台账 #1254）。
- **载体**：server 进程内模块 `thincoder-server/src/agent/`（不做独立进程/通道）；执行面（runner）机器上零驻留——延续用户 19:52 口径。
- **核 = `@thincoder/core`**（KD-SV-78：依赖声明形照 CLI——钉版本；**无人值守档面裁剪 = 本档 §5**——该 KD 明文归 #1237 设计轮）。
- **驱动器 = 聊天式（唯一形态——§11）**：管理面 chat 会话（§11；需求 §5「两个 chat 界面」④）——同一审计面、同一模型出口面（§5——管理会话出口实现 = §16.2）。
- **与成员面 agent 的关系**：成员面 chat = 开发壳（#1215 起步块；16:04 裁「成员资源管理 = 同一个 chat 界面 + 开放工具」）——其 server 域工具与本体同源、面不同；**2026-10-13 member-face-chat 批起 = 独立档 `agent/MEMBER-AGENT.md`（第四壳——盒内核同件 + 最小壳；机制全文 = 该档 §3）；工具面归属经该批落定（下行句）。**
- **成员面 agent 的 server 域工具面归属** = `agent/MEMBER-AGENT.md` §2 KD-SV-159：范围 = 成员本人资源；动作集 = 写面同集——单源（创建 ∥ 启动 ∥ 停止 ∥ 销毁 + 拉仓）；管理面运维件（docker/主机/exec/provider）不入成员面；逐件清单与实施 = 实施批从实需反推。

## 5. 核复用与对话面裁剪（KD-SV-78 落实）

- **保留（取核面——件级）**：多轮工具循环语义 ∥ **工具调用协议（回灌形——§17.3 A1）** ∥ **上下文压缩（§17.3 A3）** ∥ provider 客户端（模型出口）∥ 审计挂钩；**环体（回合骨架）= 服务端自持**（宿主语义：DB 单源 ∥ NDJSON 帧 ∥ 无人值守裁剪 ∥ 网关记账出口——核内无对应缝；取核形全文 = §17，开放点 = §17.4）。
- **裁剪**：交互审批/问询面（无人值守——工具不弹问、不自锁）∥ TTY 假面 ∥ 与运维任务无关族（记忆 ∥ 台账 ∥ 子代理 ∥ 浏览器——按任务需要再逐族接）。
- **MCP 面（server-mcp 批——2026-10-13；台账 #1379）**：**管理会话（chat）挂载**（服务器级清单 ⇒ 工具随回合并入——机制全文 = `mcp/MCP.md`）。
- **模型出口**（server-wake-face 批修订轮——2026-10-12；用户 15:40/15:44）：**管理会话（chat）** = **本 server 网关链的进程内客户端**（loopback——本机监听地址 + 管理面 sk〔`admin-agent`〕；鉴权/派发/准入/记账全链逐字复用，零第二份——机制全文 = §16.2/§16.3）。
  出口代理旗随 provider 条目（复核点——`sandbox/SANDBOX.md` §16 R53③——as-of 2026-10-11）。

## 6. 本域文件与行数预算（本域族行）

| 档 | 行数（设计估） | 职责 |
|---|---|---|
| `thincoder-server/src/agent/run.mjs`（已落盘） | 实读 **150 ⇒ ≈90**（**本批（sandbox-onboarding-removal）**：任务面 `runAgentTask`/`buildModelExit` 删净；保留 = 预算常量 ∥ `loadCoreChat` ∥ `providerModelRefs`——chat 面复用） | 核装载共用件（chat 会话装配 ∥ 预算常量 ∥ `providerModelRefs`） |
| `thincoder-server/src/agent/tools.mjs`（已落盘） | 实读 **242 ⇒ ≈20**（**本批（sandbox-onboarding-removal）**：任务面五工具（`createOnboardingTools` ∥ `TOOL_NAMES` ∥ `STEP_IDS`）删净；**保留 = `maskSecrets`**——掩蔽单源（chat `exec` ∥ 主机凭据面共用）） | 掩蔽单源（`maskSecrets`——KD-SV-136 同件） |
| `thincoder-server/src/agent/chat.mjs`（已落盘——admin-agent-chat 批） | ≈300 ⇒ 实读 **498**（2026-10-11 本设计轮现读）⇒ ≈**600**（chat-shell-align 批：中止登记表 + 双通道检查点 ∥ `turn`/`usage` 帧 ∥ `end` 两可字段 ∥ notice 五值 ∥ images 落库/回放 + 详情 `imageCount`——净 ≈+100；实读 **575**——2026-10-12 本设计轮复读）⇒ ≈**585**（console-reasoning-levels 批：起跑读行携档位 ∥ `buildChatExit` 扩参（枚举内才携 `reasoningEffort`——未设/表外零字段）——净 ≈+10；越 500 软线：预案 = 档位小段随拆档审查；硬限 800 未越）⇒ 实读 **599**（console-reasoning-levels 批落地后）⇒ ≈**640**（admin-agent-awareness 批：环境块行装配 ∥ 工具面合并 ∥ `invoke` 携 ctx ∥ 审计详情扩字段——净 ≈+40；越 500 软线：拆档预案 = 库面段（现读 ≈93 行）抽 `chat-store.mjs`——触发 = 本档越 650 ∥ 下批再增 ≥40 行）⇒ 实读 **667**（本批装配落定）⇒ 实读 **587**（拆档 A——库面段 + `parseJson` + 两常量抽 `chat-store.mjs`；触发线 650 越线 ⇒ 本批执行）⇒ ≈**712**（修订轮：出口改道〔loopback + sk 装配〕∥ `_recordStore` 接线——净 ≈+22；累计 ≈+125 = 批 ≈+100 ＋ 修订 ≈+22；拆档预案触发线 720 贴线——实施落地实读越线即执行）⇒ 实读 **587**（2026-10-12 现读；口径 = 内容行 ∥ 文末换行不计）⇒ ≈**600**（admin-chat-creds-merge 批：审计 `subject` 取值规则放宽〔结果携 `subject` ⇒ 用之——管理族零携 ⇒ 零变；env 族同值〕∥ 简报行补凭据纪律句——净 ≈+12）⇒ 实读 **690**（2026-10-13 现读） | 聊天式驱动（§11）：会话装配（系统简报 + 历史重放）∥ 回合环（预算 ∥ 工具循环 ∥ 中止检查点）∥ 帧流编解码（五形 + `end` 两可字段）∥ 逐条落库 ∥ 终态收尾（五形） |
| `thincoder-server/src/agent/chat-routes.mjs`（已落盘——admin-agent-chat 批） | ≈120 ⇒ 实读 **105**（2026-10-11 本设计轮现读）⇒ ≈**150**（chat-shell-align 批：`PATCH …/:id` ∥ `POST …/:id/abort` 两端点 ∥ `images` 门（核 `parseDataUrl` + `isNonVisionModel`）——净 ≈+45；实读 **158**——2026-10-12 本设计轮复读）⇒ ≈**178**（console-reasoning-levels 批：PATCH 扩会话设置面（`{ model }` ∥ `{ reasoning }` 一次一件）+ 两校验支——净 ≈+20）⇒ 实读 **190**（console-reasoning-levels 批落地后）⇒ 实读 **196**（server-wake-face 批落地后——2026-10-13 现读；唤醒器装配 + 回合尾链尾接线——净 ≈+16） | 会话面**六**端点（§11——契约 = `gateway/API.md` §2.8）∥ 判权 ∥ 在途门 ∥ 重启恢复钩（running ⇒ idle + notice） |
| `thincoder-server/src/agent/chat-tools.mjs`（已落盘——admin-agent-chat 批） | 实读 **477 ⇒ 504**（2026-10-13 清账轮现读——creds 批落盘后；设计估 ≈540）⇒ ≈**540**（admin-chat-creds-merge 批：第八件 `exec`（主机行绑定 ∥ 参数/结果/错误形 ∥ 绑定解析改指 `registry.runnerByRef`）∥ `runners.revoke_credential` 动词 ∥ 描述面——净 ≈+63；越 500 软线——判 = 维持 + 上限 700〔先例 = `store/STORE.md` §4〕：触发 = 实读 >700 ⇒ 起拆档审查） | 管理面**八件**（§12）：members ∥ providers ∥ models ∥ usage ∥ audit ∥ runners ∥ docker ∥ exec——参数校验 ∥ 结果结构化 ∥ 审计包装（进程内直取域件） |
| `thincoder-server/src/agent/docker-ops.mjs`（已落盘——admin-agent-chat 批） | 实读 **91** | Docker 十动词执行器（自 `tools.mjs` 提取——任务面/聊天面两驱动单源；客户端 = `sandbox/docker.mjs`） |
| `thincoder-server/src/agent/chat-env.mjs`（已落盘——admin-agent-awareness 批） | 实读 **94** ⇒ ≈**96**（server-wake-face 批：能力段两行收正——`bash.async` 可用 ∥ timer 空闲唤醒）⇒ ≈**97**（admin-chat-creds-merge 批：能力段管理族句补 `exec`——±1 行） | 环境块装配（§14.1）：时空 ∥ 所在/身份 ∥ 所管现况一行（三活体——块级降级）∥ 能力与边界段（`CHAT_LIMITS_BLOCK`——系统简报第四块） |
| `thincoder-server/src/agent/chat-env-tools.mjs`（已落盘——admin-agent-awareness 批） | 实读 **229** ⇒ **231**（2026-10-12 15:0x 轻车道：撤超时上限 −1 ∥ 判据注释 +2 ∥ 上界守卫 +1——父侧机械）⇒ ≈**350**（server-wake-face 批 ≈330 ∥ 修订轮 +≈20：`read_history` 注册 ∥ `path` 拒 ∥ 过滤摘要 ∥ `_recordStore` 装配）⇒ 实读 **318**（2026-10-13 现读——估值偏高） | 环境工具面六族八件（§14.2/§14.3）：核件动载 ∥ ctx 适配 ∥ 结果归一 `{ ok, subject, summary, output }` ∥ `bash` 限幅（超时 ∥ 输出 ∥ 工作目录）∥ timer/后台任务垫片与投递汇（§15——唤醒器接线 ∥ 投递落库 ∥ 异步池宿主） |
| `thincoder-server/src/agent/chat-store.mjs`（已落盘——admin-agent-awareness 批） | 实读 **112** ⇒ ≈**160**（修订轮：`recordStoreOf` 库面适配——记录形映射 + 迭代器 ≈+48）⇒ 实读 **155**（2026-10-13 现读） | 库面单源（库面段 + `parseJson` + `CHAT_ROLES`/`CHAT_EXCERPT_MAX` 抽出；11 名重导出同引用 ∥ 零反引 `chat.mjs`——拆档 A〔父侧 2026-10-12 裁，触发线 650 越线〕） |
| `thincoder-server/src/agent/chat-wake.mjs`（已落盘——server-wake-face 批） | 实读 **141**（2026-10-13 现读——实施落定） | 唤醒器（§15.1）：会话键面闩表（核 `createTimerWatch` 复用——零第二套闩）∥ 空闲判定（会话行 `status` 单源）∥ 火策略（核 `fireTimerWake`）∥ 结算钩子（`_asyncWaiters`——先自再武装再评估）∥ 再武装三链尾 ∥ 零轮询 |

- 小计 **≈+872**（admin-agent-chat 批：新增四档 ≈960 ∥ `tools.mjs` −≈88 ⇒ 实读 **−46**〔288 ⇒ 242——原估偏大 42〕）；`bin/thincoder-server.mjs` 实读 **187 ⇒ ≈189**（import + 注册两行——本域首经 bin 注册点）；**chat-shell-align 批另计 ≈+145**（`chat.mjs` 498 ⇒ ≈600 ∥ `chat-routes.mjs` 105 ⇒ ≈150；零新档）
  **⇒ 本批（sandbox-onboarding-removal）另计 −≈280**（`tools.mjs` 242 ⇒ ≈20（掩蔽单源保留）∥ `run.mjs` ≈150 ⇒ ≈90（任务面段删净）；零新档 ∥ 零新端点）。
  ∥ **member-face-chat 批另计**（成员面五档 ≈940 ∥ 盒壳四档 ≈670——**档账入 `agent/MEMBER-AGENT.md` §5，本节不重计**；2026-10-13）
  ⇒ **console-reasoning-levels 批另计 ≈+30**（`chat.mjs` 实读 575 ⇒ ≈585 ∥ `chat-routes.mjs` 实读 158 ⇒ ≈178；零新档——值域桥件行账 = `gateway/API.md` §4）。
  ⇒ **admin-agent-awareness 批另计实读 +423**（`chat-env.mjs` 实读 94 ∥ `chat-env-tools.mjs` 实读 229 ⇒ **231**〔2026-10-12 轻车道：撤 600s 顶 +2 ∥ 上界守卫 +1〕 ∥ `chat-store.mjs` 实读 112〔拆档 A 产物〕 ∥ `chat.mjs` 实读 587 ⇒ 净 −12；零新端点 ∥ 零迁移 ∥ `bin` ±0）；
  单元测试档 1 档（`docs/batches/2026-10-12-admin-agent-awareness.test.mjs`——实读 **467**〔含轻车道 700000 受理形 ∥ 守卫两用例〕；**不入任何门**（2026-10-12 用户裁））。
  ⇒ **server-wake-face 批另计 ≈+342**（`chat-wake.mjs` 新增 ≈130 ∥ `chat-env-tools.mjs` ≈+100〔垫片扩面 + 投递汇 + 异步接线〕∥ `chat.mjs` ≈+100 ∥ `chat-routes.mjs` ≈+10 ∥ `chat-env.mjs` +2；零新端点 ∥ 零迁移）。
  单元测试档 1 档（`docs/batches/2026-10-12-server-wake-face.test.mjs`——≈380 行〔修订轮 +≈80：§16.4 四用例〕；**不入任何门**（2026-10-12 用户裁））。
  ⇒ **修订轮另计 ≈+154**：`chat-store.mjs` 112 ⇒ ≈160 ∥ `chat-env-tools.mjs` ≈350 ∥ `chat.mjs` ≈712 ∥ `thincoder-server/src/accounts/keys.mjs` 143 ⇒ ≈180 ∥ `thincoder-server/src/accounts/routes.mjs` 151 ⇒ ≈160 ∥ `thincoder-server/src/store/db.mjs` 488 ⇒ ≈502
  ∥ `thincoder-server/bin/thincoder-server.mjs` 现读 **192** ⇒ ≈198（`selfBaseUrl` 取数器）；零新档 ∥ 零新端点 ∥ 零迁移面 = `api_keys.key_plain`（v19——B2 批 v17 在占未落；批序定段号））。
  ⇒ **admin-chat-creds-merge 批另计 ≈+75**（`chat-tools.mjs` +≈63 ∥ `chat.mjs` +≈12 ∥ `chat-env.mjs` +1；零新档 ∥ 零新端点）；
  单元测试档 1 档（`docs/batches/2026-10-12-admin-chat-creds-merge.test.mjs`——≈420 行，含 chat `exec` 工具用例；**不入任何门**（2026-10-12 用户裁）；webui 面 = `webui/WEBUI.md` §5 ∥ sandbox 域 = `sandbox/SANDBOX.md` §13）。
  ⇒ **server-core-unification 批（设计轮——2026-10-13；台账 #1239；目标态 = 需求 `:601`；§17）另计 ≈+140 ⇒ 落地实读（批档 §5 同口径——含尾行差；本档内容行口径各 −1）**：`chat-compact.mjs` 新 ≈90 ⇒ **334**（压缩面 + 落库标记适配）；
  `chat.mjs` 690 ⇒ ≈705 ⇒ 实读 **692**（净 ≈+2——回灌形 ∥ 历史修复接线 ∥ 压缩调用）∥ `run.mjs` 137 ⇒ ≈142 ⇒ 实读 **150**（净 ≈+13——回灌形一处）∥ `chat-store.mjs` 155 ⇒ ≈185 ⇒ 实读 **247**（净 ≈+90——回放面迁入）；
  零新端点 ∥ 零迁移 ∥ `bin` ±0 ∥ `thincoder-server/package.json` ±0；
  **`chat.mjs` 拆档状态**：690 ⇒ ≈705 ⇒ 落地实读 **692**——**未越 720 拆档线**（距 28 ⇒ 未拆档）；越 500 软线——拆档预案 = 触发线 **720**，越线即执行 = 唤醒径整段抽 `chat-wake-turn.mjs`（预案先例 = server-wake-face 批 §2）；
  单元测试档 1 档（`docs/batches/2026-10-13-server-core-unification.test.mjs`——≈350 ⇒ **486** 行；**不入任何门**）；随正件/披露清单 = §13 R73；**产品码零触（设计轮）**。
  ⇒ **server-mcp 批（设计轮——2026-10-13；台账 #1379；mcp 域单源 = `mcp/MCP.md`）另计 ≈+15**：`chat.mjs` 692 ⇒ ≈704（MCP 面并面 + 按名路由泛化）∥ `run.mjs` 150 ⇒ ±0（`TRIMMED_FACES` 收正——行数零变）∥ `bin/thincoder-server.mjs` 244（as-of 2026-10-14）⇒ ≈247（注册行 + 停机收尾）；
  零新域档（本域零新档——`thincoder-server/src/mcp/` 自持）∥ 零新端点（五端点 = `thincoder-server/src/mcp/routes.mjs`（拟新增））∥ 零迁移（v24 = `store/STORE.md` §2 v24 段）；单元测试档 1 档（`docs/batches/2026-10-13-server-mcp.test.mjs`——≈420 行；**不入任何门**）；上抛 = §13 R86。
  ⇒ **model-test-tool 批（设计轮——2026-10-14；台账 #1390；机制 = §12.1）另计 ≈+190**：`thincoder-server/src/agent/model-test.mjs`（拟新增）≈150（执行器：探针请求 ∥ 流扫描 ∥ 读数归一）；
  `thincoder-server/src/agent/chat-tools.mjs` 实读 **504** ⇒ ≈535（`models` 动词 +1（`test`） ∥ schema 描述 ∥ 接线——净 ≈+31）∥ `thincoder-server/src/agent/chat.mjs` 实读 **692** ⇒ ≈697（装配缝两参——净 ≈+5）；
  `thincoder-server/src/gateway/forward.mjs` 实读 **208** ⇒ ≈238（`readBodyExcerpt` 提取导出——净 ≈+30；两调用点单源）∥ `thincoder-server/src/gateway/embedding-admin.mjs` 实读 **140** ⇒ ≈114（本档 `textExcerpt` 删——改引共享件；净 ≈−26）——**两件行账随正 ⇒ `gateway/API.md` §4**（gateway 域单源——跨域，随实施轮同拍）；
  零新端点 ∥ 零迁移 ∥ 零新审计型/kind ∥ `thincoder-server/src/agent/chat-env.mjs` 实读 **96** ±0（能力段零触）∥ `bin/thincoder-server.mjs` 244（as-of 2026-10-14）⇒ ±0 ∥ `thincoder-server/package.json` ±0；
  单元测试档 1 档（`docs/batches/2026-10-14-model-test-tool.test.mjs`（拟新增）——≈300 行；**不入任何门**）。
- `thincoder-server/package.json`（`@thincoder/core` 版本声明依赖——实读 `^0.10.4`）与**带核发布形**（版本对位口径）= 板档 `PROJECT.md` §2.3（2026-10-13 起单源；承台账 #1222——核先于/同拍发行）。
- sandbox 域件（`ssh.mjs` ∥ 主机凭据件）= `sandbox/SANDBOX.md` §13（本档不重复）；`bin/thincoder-server.mjs` **±0**（节点/凭据端点经 `thincoder-server/src/sandbox/routes.mjs` 转注册——装配行计入 sandbox 域预算）。

## 7. 验收判据（机检）

| 判据 | 载体 |
|---|---|
| 聊天式驱动（本批）：六端点判权三态（`user` ⇒ 403 ∥ 无会话 ⇒ 401 ∥ admin 200）∥ 流帧逐帧序（`delta`/`call`/`result`/`end`——假模型出口 ∥ 假工具）∥ 会话落库与重放（逐行在场 ∥ notice 回放滤除 ∥ 工具结果截断口径一致；压缩会话以标记行代覆盖段——§17.3 A3）∥ 在途门（`running` ⇒ 400 人话）∥ 重启收尾（`running` ⇒ `idle` + notice + `chat_stop` 行）∥ 管理面八件逐件（§12——假件下断言动词面与参数校验）∥ 每工具调用一条 `agent_event` 行（逐调用 ∥ 掩蔽）∥ chat 重置 ⇒ 既有域型零增（`password_reset` 零行——只 `chat_call` 行；§12 重置链助手边界）∥ 异常终态落库（模型错误 ∥ 预算超限）：已生成文本 ⇒ `assistant` 行如实落库（部分文本——回放逐字一致）；notice 行独立落行（回放滤除）；零文本 ⇒ 零 `assistant` 行 | 单元测试档（`…-admin-agent-chat.test.mjs` ∥ `…-admin-agent-chat-tools.test.mjs`） |
| 输入区四件后端 + 帧面（chat-shell-align 批）：PATCH 换模型（idle/running 两态——下回合生效 ∥ 在途零触；非法/不存在 ⇒ 400/404 库零变）∥ `images` 三门（非数组 ∥ 非栅格 ∥ 超单图阈 ⇒ 400；非视觉模型 ⇒ 400——库零变）∥ user 行 `imageParts` 逐值 + 回放 content 数组（模型出口入参断言）+ 详情仅 `imageCount` ∥ abort（在途 ⇒ 200 + 收尾三件（notice `"aborted"` ∥ `chat_stop` ∥ `end` failed）；idle ⇒ 400；两中止窗（调用间 ∥ 在途 signal）∥ 登记表清零）∥ 帧序 = `turn(n)` 前 ∥ `usage` 后（缺 usage ⇒ 零帧）∥ `end` 携 `durationMs`/`calls`（可字段——旧消费零破） | 单元测试档（`…-admin-agent-chat.test.mjs` 续——现读 715 行（2026-10-11）；本批续增用例段 ≈+250——本设计轮复读 **716** 行；越 500 软线：预案 = 用例段随拆档审查；硬限 800 未越） |
| 会话级思考档位（console-reasoning-levels 批——2026-10-12）：`GET /api/admin/providers` 行携 `modelReasoning`（稀疏 ∥ 键 = 上游真名 ∥ 值 = 核枚举；假 specLookup 注入）∥ `PATCH …/:id { reasoning }`（枚举内 ⇒ 200 落库 + 回执携值；表外/非串/同携 model ⇒ 400 库零变；判权三态）∥ 换模型 ⇒ `reasoning` 清 NULL（口径②）∥ 装配（行值 ∈ 当刻模型枚举 ⇒ 出口 `reasoningEffort`；未设 ∥ 表外 ⇒ 零键——假出口入参断言）∥ 结构（v16 零迁移：空库直落 16 ∥ 列面在场 ∥ 存量行 NULL） | 单元测试档（`…-console-reasoning-levels.test.mjs`） |

| 环境感知与环境工具面（admin-agent-awareness 批——2026-10-12；功能点 43 ∥ AC-43 ①–⑥） | ① 四块装配在场（三实况行逐值——注入 now ∥ 假 db ∥ 注入 cwd；简报含能力边界段——**对位断言** = 每件注册工具名 ∈ 能力段字面）∥ ② 值随实况（读源变更 ⇒ 下回合行变）＋ 块级降级（读败 ⇒ 该行缺席、回合 `succeeded`）∥ ③ 零新端点（两新档源零 `routes.add(` ∥ `chat-routes.mjs` 计数不变）∥ ④ 行形 = `[System reminder: ` 族前缀（三端同形——坐标逐块 = §14.1 表）∥ ⑤ 工具面六族八件在场（names/schemas——核真件〔仓内核直引〕——修订轮：七 ⇒ 八）＋ `get_current_time` 一次调用读数 ＋ `bash` 限幅三件（取值校验：仅拒非有限值/小于 1 ∥ cwd 生效）∥ ⑥ 每调用一审计行（逐调用——既有）＋ 详情扩字段（`subject` = 命令原文/路径 ∥ 成败 ∥ `truncated`）＋ 审计页按型渲染（agent 行模板——三文案键两表同步） | 单元测试档（`…-admin-agent-awareness.test.mjs`）＋ 收口轮（浏览器实走——问「现在几点/你管着几个节点」各一 ＋ 时间工具一次调用 ＋ 审计页一行） |

| 唤醒与投递面（server-wake-face 批——2026-10-12；台账 #1317 ∥ #1319） | ① **唤醒链**：设 timer ⇒ 到期（注入钟）⇒ 会话空闲 ⇒ 唤醒器 fire ⇒ 送达行**落库**（`user` 行 + `data.kind="reminder"`——行文 = 核件单源逐字）＋ **自动开一轮**（模型出口调用一次；域文本 = 核 `TIMER_TURN_DOMAIN` 逐字）＋ 助手回复落库 ∥ 出列幂等（不二投）∥ 未到期 ⇒ 零行零轮 ∥ 在途回合（`status = running`）⇒ 零动作（链尾再武装）∥ 零交付 ⇒ 零开轮 ∥ ② **异步链**：`bash.async:true` ⇒ 回执 `bash#N started (running) — log: …`（核件原文 ⇒ `tool` 行）∥ 结算 ⇒ 钩子触发唤醒轮 ⇒ 摘要行落库（`[System reminder: background bash#N finished …` 核件原文）∥ 帽 4（第 5 件 ⇒ 工具级错误人话）∥ `process action="kill" id:N` 两态（在途 ⇒ 杀树 + 确认；未知/已完成 ⇒ 人话）∥ ③ **中止面**：非 interrupt 中止 ⇒ 本回合在途后台任务杀树 + 丢弃提醒入汇（核件原文）+ 墓碑 ⇒ 零摘要投递 ∥ ④ **结构面**：零新端点（六端点计数不变）∥ 三 kind 审计面不扩 ∥ 唤醒器零轮询（源扫描零 `setInterval`）∥ 同源断言（导入面 = 核 `timers.mjs` 四件） | 单元测试档（`…-server-wake-face.test.mjs`）＋ 收口轮（部署实走） |
| 会话历史与出口改道（server-wake-face 批 · 修订轮——2026-10-12；需求 43⑤ 扩 ∥ 46⑤ ∥ AC-46⑥） | ① 登录发面（admin ⇒ `admin-agent` 在册携明文 ∥ 幂等 ∥ `user` 零行 ∥ 审计 `surface`）∥ ② 出口入参（外标 ∥ selfBase ∥ sk 明文——**不携** provider 凭据）∥ ③ 全链出账（真网关链 + 假上游：`usage` 行在场且可归因）∥ ④ `read_history` 本会话逐形（含 `path` 拒）＋ 审计 subject ∥ ⑤ 结构（六端点 ∥ 三 kind ∥ 核件零改 ∥ 能力段八件对位）——机检口径全文 = §16.4 | 单元测试档（`…-server-wake-face.test.mjs` 续）＋ 收口轮（浏览器实走） |
| `exec`（SSH）进 chat（admin-chat-creds-merge 批——2026-10-12；台账 #1326） | ① 工具在场（第八件——名/schema；绑定 = 主机表行：名 ∥ 地址两形命中；未在册 ⇒ 工具级错误）∥ ② 一轮 `exec`（假模型 + 假 ssh `execImpl`）：`call`/`result` 帧逐值 ∥ 结果**含四字段** `{ ok, exitCode, stdout, stderr }`（形全文 = §12 表）∥ 审计 `chat_call`（tool=`exec` ∥ subject=命令原文 ∥ resultCode=exitCode）；命令非零退出 ⇒ `ok:true`（退出码在结果内）∥ ③ 缺凭据/解密失败 ⇒ 工具级错误（回合不停、零 notice）∥ ④ 掩蔽：行凭据值（`secret`/`sudoSecret`）零入结果文本/摘要/subject/帧/审计（含 stdout 含秘密的构造用例）∥ ⑤ 临时私钥文件用毕即删（假件断零残留）∥ ⑥ 结构：工具面七 ⇒ 八（能力段对位断言）∥ `runners` 动词 + `revoke_credential`（撤销两径同效；**chat 径审计两行** = `chat_call` + `host_credential_revoke`——凭据类例外，KD-SV-91）；用例 = §8（N83 ∥ B79 ∥ E61）＋ `sandbox/SANDBOX.md` §12（N80 ∥ N82〔撤销两径用例〕 ∥ B77/B78） | 单元测试档（`…-admin-chat-creds-merge.test.mjs`）＋ 收口轮（浏览器实走——对话页录凭据 ⇒ `exec` 一条） |

| 与核取核形（server-core-unification 批——2026-10-13；台账 #1239；机制 = §17） | ① 件清单在场（§17.2——file 级逐件）∥ ② A1 回灌形（tool 轮 assistant 消息 = 核件构造：回声族携 `reasoning_content`〔缺值 ⇒ `""`〕∥ 非回声族零字段；`extra_content` 在场才带；落库 ∥ 回放逐值）∥ ③ A2 历史修复（断链 pair 注入 ⇒ 修复成对；常态零改）∥ ④ A3 压缩（阈值触发 ⇒ 标记行落库 ＋ 回放以标记代覆盖段 ＋ 压缩后上下文缩；3 连败〔= 核常量 `COMPRESS_FAILURE_LIMIT`——取件 = `@thincoder/core/context.mjs`〕⇒ 降级；摘要调用经出口——`usage` 行可归因）∥ ⑤ 缺核降级不阻断（环境族不注册 ∥ 档位退中性）∥ ⑥ 核面零改（核侧文件零动——git 面判） | 单元测试档（`…-server-core-unification.test.mjs`） |

| 模型测试（model-test-tool 批——2026-10-14；台账 #1390；机制 = §12.1） | ① 工具在场（`models` 动词 +1——`test`；名集八件不变 ∥ 能力段对位不破）∥ ② 通路（假自环出口 ＋ 假 fetch：请求形 = `POST <selfBase>/v1/chat/completions` ∥ `stream: true` ∥ sk 明文 Authorization；真链用例 ⇒ `usage` 行在场——member = 本回合发送者 ∥ key = `admin-agent`）∥ ③ 读数五件逐值（假 SSE 流注入时刻——注入钟〔§12.1③〕 ⇒ `status`／`totalMs`／`ttfbMs`／`tps`／`error`；`ttfbMs` = 首个非空内容增量——流首空壳块不计；`tps` = `usage.completion_tokens` ÷ 生成窗——usage 缺 ⇒ null）∥ ④ 分类五支（假出口逐形 ⇒ `ok`〔含空答——零内容增量亦归 ⇒ `ttfbMs:null`〕／`timeout`（携 `phase`）／`http_error`（携 HTTP 码 ＋ 原文原样）／`bad_response`／`broken_stream`〔含首内容增量前中断——零部分读数〕）∥ ⑤ 未配/草稿 ∥ 入参校验（`prompt` 逾 2000 字 ∥ `timeoutS` 非正/非数/越界〔>600〕）⇒ 工具级错误人话（零外呼 ∥ 除逐调用 `chat_call` 行外库零变——与「测试连接」草稿面（AC-18）划界句在）∥ ⑥ 结构（零新端点——路由计数不变 ∥ 零新审计型/kind——`chat_call` 逐调用一行 ∥ 零迁移） | 单元测试档（`docs/batches/2026-10-14-model-test-tool.test.mjs`） |

## 8. 用例（本域）

| # | 类 | 输入 | 预期输出 |
|---|---|---|---|
| N54 | 正常 | 假模型（一轮文本 + 一轮工具调用）+ 假工具：建会话 ⇒ 发消息（读 NDJSON 流） | 帧序 = `delta`… ∥ `call` ∥ `result` ∥ `end(succeeded)`；`agent_chat_messages` 逐行在场（`user` ∥ `assistant`（含 `toolCalls`）∥ `tool`）；审计 = `chat_start` + 每调用一条 `chat_call` |
| N55 | 正常 | 同一会话连发两轮（轮间重读详情） | 历史重放逐行（角色/序在场——notice 滤除）；模型上下文 = 前轮全量；会话 `status` 终态回 `idle` |
| B48 | 边界 | 流断/客户端断开（回合在途） | 回合照跑到终态（落库不依赖连接）；重读详情 = 全量在场；审计零缺行 |
| B49 | 边界 | 预算超限（假模型恒调工具）∥ 空回合（模型无文本无调用） | `end` 帧 `failed` + notice 行（「预算超限」人话）+ `chat_stop` 行 ∥ 同左（空回合人话） |
| E40 | 错误 | 无会话 ∥ `user` 角色 ∥ 会话不存在 ∥ 在途再发 ∥ 模型不可用（建会话） | 401 ∥ 403 ∥ 404 ∥ 400（「本会话正在执行」）∥ 400（「模型不可用」人话）——各自零副作用（在途门除外） |
| E41 | 错误 | 模型出口抛错（假模型）∥ 工具入参非法（如 `members.create` 缺 `username`） | `end` 帧 `failed` + notice（原因人话）+ `chat_stop` 行 ∥ 工具级错误回灌（`result` 帧 `ok:false`——回合不停，模型可自纠）；会话落库如实 |
| N64 | 正常 | 假模型（两轮：文本 + 工具调用）+ 假工具：发一条（读 NDJSON 流） | 帧序 = `turn(1)` ∥ `delta`… ∥ `usage{prompt,completion,cacheHit,cacheMiss}` ∥ `call`/`result` ∥ `turn(2)` ∥ `delta` ∥ `usage` ∥ `end(succeeded, durationMs, calls)`；usage 逐值 = 假模型 usage；零落库（帧面） |
| N65 | 正常 | PATCH 换模型两态（idle ∥ 回合在途）⇒ 下一回合 | 200 落库新 model；在途回合出口模型零变（当前回合跑完）；下回合出口 = 新 model（假出口入参断言）；历史零动 |
| N66 | 正常 | 图片随 POST（视觉模型位——假模型 + 假图 dataURL）⇒ 详情重读 | 200 流照常；user 行 `data_json.imageParts` 逐值；回放 ⇒ content = parts 数组（模型出口入参断言：text part + image_url part）；详情响应 user 行 `data` 仅 `imageCount`（dataURL 零下发） |
| N67 | 正常 | 在途 `POST …/abort`（假模型长回合） | `end(failed, aborted)` + notice 行（reason `"aborted"`）+ `chat_stop` 审计（reason `"aborted"`）+ 已生成文本 ⇒ assistant 行如实落库；会话回 idle；登记表清零 |
| B65 | 边界 | abort：idle 态 ∥ 不存在会话 ∥ `user` 角色 ∥ 两中止窗（模型调用间 ∥ 调用在途） | 400 人话（「本会话不在执行中」）∥ 404 ∥ 403——零副作用；两窗皆命中（① 下一检查点即停 ② 在途调用当即中断——核 `signal` 通道）；终态同 N67 |
| B66 | 边界 | `images` 拒形三（非数组 ∥ 非栅格 dataURL（svg）∥ 超单图阈） | 逐形 400 人话；库零变；流未起（信封形） |
| E50 | 错误 | 非多模态模型 + images（发送） | 400 人话（「当前模型不支持图片输入」——核 `isNonVisionModel` 判）；库零变；流未起 |
| E51 | 错误 | PATCH：模型不在注册表 ∥ 缺 model ∥ 不存在会话 | 400 ∥ 400 ∥ 404——库零变 |
| N71 | 正常 | PATCH `{ reasoning: "high" }`（模型枚举含 high）⇒ 发一条（假模型出口） | 200 回执 `chat.reasoning = "high"`；库列落值；回合出口 provider 入参携 `reasoningEffort: "high"`；`chatView`/列表/详情三面携 `reasoning` |
| B69 | 边界 | 未设档（NULL）∥ 表外存量值 ∥ 换模型（携/不携档）∥ v15 存量库 | 未设 ⇒ 出口零 `reasoningEffort` 键；表外 ⇒ 零字段（读侧容忍——装配不炸）；换模型 ⇒ `reasoning` 清 NULL；v15 库升 v16 ⇒ 存量行 NULL 零变 |
| E54 | 错误 | PATCH `{ reasoning }`：表外值 ∥ 非串 ∥ `{ model, reasoning }` 同携 ∥ 缺核规格源 | 逐形 400 人话；库零变 |

| N72 | 正常 | 假模型（一轮调 `get_current_time` ＋ 一轮纯文本）＋ 环境工具面核真件（仓内直引）＋ 假 db（一节点 ∥ 一成员 ∥ 一 provider） | 四块行在场（时间 ∥ 环境身份 ∥ 现况计数逐值）＋ 简报含能力段；`end(succeeded)`；`chat_call` 行 `tool="get_current_time"`、`resultCode=0`；工具结果含 `Date:` 读数；回放零含实况行（瞬态不落库） |
| N73 | 正常 | 同一会话连发两条；两条之间新增一个节点（库写） | 第二条现况行计数 +1（读源变更 ⇒ 下回合行变——值随实况） |
| B70 | 边界 | ① 现况读源抛错（替身抛）∥ ② timer 到期（设 1s 项 ⇒ 到期时空闲）∥ ③ timer 未到期 | ① 该行缺席、回合照跑 `succeeded`（块级降级——其余行在场）∥ ② 唤醒径（§15.1）：送达行落库（`user` 行 + `data.kind="reminder"`——行文 = `[System reminder: ⏰ timer — …]` 逐字）＋ 自唤醒一轮；出列幂等——只投一次 ∥ ③ 零 timer 行（在途保留） |
| B71 | 边界 | `bash`：`timeout` 非有限值/小于 1 ∥ `timeout: 700000`（撤顶后受理形）∥ `async:true`（受理形）∥ 输出超 4000 字 | 首形 ⇒ 工具级错误人话（`ok:false`，回合不停）；`async:true` ⇒ 受理 ⇒ 回执（`bash#N started (running) — log: <path>`——回执即工具结果）；`700000` ⇒ 调用完成（无上限——核件本无量程约束）；超长 ⇒ 落库形截断（≤4000 字含注记）＋ 审计行 `truncated:true` |
| E55 | 错误 | `read` 路径不存在 ∥ `grep` 非法正则 ∥ `bash` 非零退出（`node -e "process.exit(3)"`） | 前两形 ⇒ `ok:false` 人话回灌（回合不停）；非零退出 ⇒ 调用完成（`ok:true`——退出码在输出文本内 `(exit code 3)`）；三形各落 `chat_call` 行（`subject` = 路径/正则/命令原文） |

| N74 | 正常 | 假模型 + 假钟 + `timer` 真件：设 1s 项 ⇒ 到期 ⇒ 空闲（无在途回合） | 送达行落库（`user` 行 + `data.kind="reminder"` ∥ 行文 = `[System reminder: ⏰ timer — …]` 逐字）＋ 自动开一轮（模型出口一次；域文本 = `TIMER_TURN_DOMAIN` 逐字）＋ 助手回复落库；会话回 `idle`；同件不二投 |
| N75 | 正常 | 假模型 + `bash` 真件（`async: true` + 即退命令） | 回执 = `bash#N started (running) — log: <path>`（`tool` 行逐字）；结算 ⇒ 钩子触发唤醒轮 ⇒ 摘要行落库（核件原文 `[System reminder: background bash#N finished — … (exit code 0, …s) — full log: …]`）＋ 助手回复；池空 |
| B72 | 边界 | 闩到点但在途回合（`running`）∥ 未到期 ∥ 零交付（件已由回合边界投递） | 三者皆零动作（零投递 ∥ 零开轮）——回合尾链尾再武装；件不丢（下一回合边界兜底投递） |
| B73 | 边界 | 帽满（池 4 在途 ⇒ 第 5 件）∥ `timeout` 到点 ∥ `kill id:N` 两态 | 帽满 ⇒ 工具级错误人话（零起跑）；timeout ⇒ 杀树 + 摘要行（`killed: timeout`）；kill 在途 ⇒ 杀树 + 确认句（零摘要投递）∥ 已完成 ⇒ 人话错误 |
| B74 | 边界 | 进程重启（进程内态归零） | 闩表/池/汇面天然空（零恢复面——与核 `_pendingTimers` 同判）；在途回合收尾沿既有（`running` ⇒ `idle` + notice）；重启后零唤醒残留 |
| E56 | 错误 | 唤醒评估读会话行失败 ∥ 唤醒轮内模型不可用 | 前者 ⇒ 零动作（闩撤、零注入——不炸进程）；后者 ⇒ 唤醒轮按既有 `model_error` 收尾（零新形）；件留汇面，下一回合边界兜底投递 |
| E57 | 错误 | 同会话两条：首条起 `async` 且长跑 ⇒ 首条被 `POST …/abort` 中止 | 首回合 `end(failed, "aborted")` + notice（`"aborted"`）+ `chat_stop`；在途后台任务杀树 + 丢弃提醒入汇（核件原文）+ 墓碑 ⇒ 后续零摘要投递；次条起跑投递该提醒行（落库） |
| N76 | 正常 | 假模型 + 真库行：会话内 `read_history` 逐过滤（role ∥ keyword ∥ tool ∥ limit/direction） | 输出 JSON 条目逐值（`ts` = 行 `created_at` 毫秒 ∥ role ∥ content ≤500 字）；`chat_call` 审计行（tool=read_history ∥ subject=过滤摘要）；notice 行随全量出（role 原值） |
| B75 | 边界 | `read_history`：空会话 ∥ `path` 传参 ∥ 时间窗外 ∥ `limit` 越界 | `[]` ∥ 工具级错误人话（本会话作用域——零 schema 收窄）∥ `[]` ∥ 核件钳制（1 ∥ 200） |
| N83 | 正常 | 假模型 + 假 ssh：一轮 `exec`（含 sudo 径 + 输出含行凭据值的构造用例） | `call`/`result` 帧 ∥ 结果逐值 ∥ `chat_call` 行（subject=命令原文 ≤2000 ∥ resultCode=exitCode ∥ truncated）∥ 行凭据值零入四面（结果/摘要/subject/帧）∥ 私钥临时档用毕即删 |
| B79 | 边界 | `exec`：未登记凭据 ∥ 解密失败 ∥ 假件超时/不可达 | 工具级错误人话（回合不停 ∥ 零 notice）；零秘密入帧/审计 |
| E61 | 错误 | `exec`：命令空串/超长 ∥ `timeoutS` 非法 ∥ 主机名歧义（多命中） | 工具级错误人话；零 ssh 调用（假件断） |
| N77 | 正常 | 管理登录（admin）⇒ 再登录 ∥ `user` 登录 | `api_keys` 行（name=admin-agent ∥ `key_plain` 非空 ∥ active）+ `key_issue`（surface="admin_agent"）一次 ∥ 同行零重签 ∥ 零新行 |
| N78 | 正常 | 出口全链（真网关链 + 假上游 + 本机自环）：管理会话一轮 | 帧序逐帧（turn/delta/usage/end succeeded）；`usage` 行在场（member=本回合发送者〔缺位 ⇒ 会话 owner——2026-10-13 收正〕∥ key=admin-agent ∥ endpoint=chat）；出口入参 = 外标 ∥ selfBase ∥ sk 明文 |
| E58 | 错误 | 出口：sk 未在册（未登录/已吊销）∥ 网关拒（sk 在途吊销 ⇒ 401） | 皆 `model_error` 收尾（notice + `chat_stop`；人话含「重新登录」／网关错误原文）；零落库缺失 |

| N84 | 正常 | 假自环出口（假 fetch 返 SSE：空壳块 ＋ 三段内容增量 ＋ usage 帧）＋ 真装配：`models` ⟮op: `test`, provider, model⟯ | 结果 = `{ ok:true, status:"ok", model, totalMs, ttfbMs（首个内容增量时刻）, tps（completion ÷ 生成窗）, tokens, outputChars }`（键在场形 = §12.1③——`error` 缺席）；`call`/`result` 帧逐值；审计 `chat_call`（tool = `models` ∥ subject = 对外标识）；真链用例 ⇒ `usage` 行在场 |
| B80 | 边界 | ① 流首空壳块（role 声明——`ttfbMs` 不计它）∥ ② 流末无 usage 帧 ⇒ `tps:null`（不估）∥ ③ 空答（零内容增量）⇒ `status:"ok"` ＋ `ttfbMs:null` ∥ ④ `timeoutS` 小值触发首字节前超时 ∥ ⑤ 首内容增量前流中断 ⇒ `status:"broken_stream"`（零部分读数） | 逐形读数（④ 之 `phase` = `before_first_byte`）；零编造数字 |
| E62 | 错误 | ① 未配/草稿值（不在开放清单）∥ ② 网关 404（被禁用/未配）∥ ③ 上游不可达（502 透视）∥ ④ sk 缺位/自环基址缺位 ∥ ⑤ 未接线（缺缝）∥ ⑥ 入参校验（`prompt` 逾 2000 字 ∥ `timeoutS` 非正/非数/越界〔>600〕） | ②③ = 读数面（`http_error`——HTTP 码 ＋ 原文原样；回合不停）；①④⑤⑥ = 工具级错误人话（`{ok:false}`——回灌模型自纠；⑥ 零外呼 ∥ 除逐调用 `chat_call` 行外库零变）；各落 `chat_call` 行 |

## 9. 关键决策（本域）

| # | 决策 | 理由 | 被否候选与何故否 |
|---|---|---|---|
| KD-SV-82 | **管理面 agent = server 进程内（核 `@thincoder/core` + 最小壳）+ 对话面裁剪（§5）+ 无白名单围栏；唯一一个 agent（用户 22:29）；驱动器 = 聊天式（§11 ∥ KD-SV-88）** | 用户 22:19–22:29 口径 + KD-SV-78（从核引）；进程内 = 直取 server 域件（库/registry/docker 客户端）零 HTTP 回环；执行面机器零驻留延续 19:52 口径 | 独立进程/守护（另一套生命周期 + 通道——否）；自写第四份 agent（KD-SV-78 已否）；白名单围栏（15:02 用户已撤——否） |
| KD-SV-87 | **模型选择 = 会话级（建会话时选定——下拉源 = provider 注册表现有模型；不可用 ⇒ 建会话 400 人话）；会话内可换（明选即换 ∥ 下回合生效——KD-SV-108）** | 显式可见（零隐藏缺省）∥ 零新配置项（免「每配置项有 UI 写入口」新面）；会话内可换 = 用户 21:55「补后端一件不藏」直推（模型钮面原子已在——后端补齐） | 配置项 `agent.model`（新配置面 + UI 落点无自然位——否）；固定取首家 provider 首模型（静默任意——否）；会话内不换（被 21:55 裁定推翻） |
| KD-SV-88 | **聊天式驱动 = 管理面 chat 会话（§11——本批）**：① 会话（chat）= 模型选定（建会话时——KD-SV-87 同口径）× 消息序（库两表——KD-SV-89）；② 回合（turn）= 用户发一条 ⇒ agent 环跑到自然结束/预算封顶——**执行不依赖浏览器连接**（流 = 视图；断连照跑）；③ 流式通路 = `POST …/messages` 单请求 + `application/x-ndjson` 帧流（`delta` ∥ `call` ∥ `result` ∥ `end`；**chat-shell-align 批扩**：`turn` ∥ `usage` + `end` 两可字段——§11.3：浏览器 fetch + `ReadableStream` 逐行读）；④ 预算 = 每回合独立（20 分钟 ∥ 60 调用——`DEFAULT_MAX_CALLS`/`DEFAULT_MAX_DURATION_MS` 常量复用）；⑤ 判权 = `requireAdmin` 全族 | 需求 §5「两个 chat 界面」④（形态落点 = 本设计轮）+ 用户「浏览器流式会话通路」点名；单请求 POST = 写入与执行同跳（零孤儿流 ∥ 判权一次）；NDJSON = 每行一帧零壳（较 SSE `data:` + 空行双层无增益）；执行不依赖连接 = 与「读时单源」先例同拍（刷新/换设备不丢回合）；预算常量复用 = 同一环保险丝（常量单源 = 预算常量件） | `EventSource`（GET-only——不能 POST 报文体 ∥ 自动重连语义无用途）；SSE-over-fetch（可用——`data:` 帧 + 空行分隔 = 无增益壳）；WebSocket（双向机制超需求 ∥ 服务端需自持升级/hub——面外）；轮询（部分 token 不可达——违「流式」点名）；双请求（POST 起跑 + GET 挂流——孤儿流/二次判权面）；任务式复用（run 语义 = 单目标 + `report` 终态——chat 无 report，回合自然结束）；会话内存态（刷新即失——否） |
| KD-SV-89 | **会话持久化 = v14 两表 + OpenAI 消息形 + notice 行 + `status` 在途标记（重启如实收尾）**：`agent_chats`（`status` = `idle`/`running`——在途标记） + `agent_chat_messages`（`role` = `user`/`assistant`/`tool`/`notice` ∥ `content`（工具结果 = 模型可见形——按 chat 工具面口径截断 ≤4000 字（`CHAT_TOOL_CONTENT_MAX`）：回放逐字一致）∥ `data_json`（`toolCalls` ∥ `toolCallId`/名/摘要）∥ 序）；消息**逐条增量落库**；回放 = 库行装配为模型消息数组（notice 滤除；压缩会话以标记行代覆盖段——§17.3 A3）；**重启** ⇒ `running` ⇒ `idle` + notice 行 + `chat_stop` 审计（重启如实收尾口径） | 聊天上下文 = 长消息序（单列 JSON 每回合全量重写——写放大）；行式 = 逐条增量 + 读面直取；`role` 枚举落 CHECK（形单源）；在途标记落库 = 刷新/多标签页一致（进程内存态不作判据——KD-SV-80/86） | 单档 JSON 列（写放大 ∥ 并发回合难对齐）；纯内存会话（刷新即失/重启悬挂——否）；复用核会话档（KD-SV-78 引核面 = provider/环——server 专有存储自持；核 = 本地文件面）；复用 `sandbox_onboarding`（域错——沙盒任务 ≠ 管理面 chat）；消息删除/重命名/归档面（未裁——不做） |
| KD-SV-90 | **工具面扩展（管理面八件——§12）**：`members`（六动词）∥ `providers`（五）∥ `models`（五）∥ `usage`（`summary` ∥ `rows`）∥ `audit`（`query`）∥ `runners`（`list` ∥ `add` ∥ `remove` ∥ `revoke_credential`——KD-SV-136）∥ `docker`（十动词——**绑定 = 注册节点**：名∥地址经 `sandbox_runners` 查行；未在册 ⇒ 工具级错误回灌）；逐面回指控制台功能点（§12 表）；**进程内直取域件**（KD-SV-82 口径延续——零 HTTP 回环）；写链与路由**同函数**（provider/成员路由内联体提取共享助手——两调用点单源）；`exec`（SSH）**入 chat**（**绑定 = 主机表行**——凭据经录入弹窗录入，文本非通道；KD-SV-136）；节点排空/禁用随控制台同批长（未落——不发明） | 需求 §5「工具面 = 覆盖控制台既有全部管理面……能力逐步长」+ 用户 22:28「server 的管理能力也应该托管给 agent，比如成员管理，provider 管理，模型选择，用量等等」；「控制台与 agent 走同一套调用」口径镜像（docker 面）；进程内直取 = 判权/校验/审计单源（HTTP 回环 = 双判权 + 凭据面重造） | 任务五件直接复用（凭据/单主机绑定语义不合——否）；经 HTTP 打自家 admin 端点（双判权/回环——否，KD-SV-82 先例）；每动作一工具（工具数爆炸——面内动词沿 docker 先例）；docker 不接（机队/排障面缺口——否）；docker 任意地址（机队语义 + 误打面——否）；`exec` 不入 chat（用户 2026-10-12 裁撤——否） |
| KD-SV-91 | **审计型面 = 新 `agent_event`（v14 CHECK 扩型——十三型）**：kind = `chat_start`（会话创建）∥ `chat_call`（每工具调用——逐调用：工具名 ∥ 调用摘要 ∥ 结果码 ∥ 摘要；**读动作同落行**）∥ `chat_stop`（异常收尾：预算超限 ∥ 模型错误 ∥ 空回合 ∥ 重启中断 ∥ 手动中止）；正常回合终 = 无附加行（调用行 + 会话档已足）；**不双记**既有域型（agent 建成员 ⇒ 只 `chat_call` 行）；**凭据类例外**：`runners.revoke_credential`（chat 径）⇒ 域行照落（`host_credential_revoke`——凭据生命周期 = 安全面域审计，跨径不得缺）+ `chat_call` 行（**两行**；N82 用例）；detail 掩蔽口径 = 沿任务面（秘密掩蔽 + 摘要截断） | 跨域动作面（members/providers/models/usage/audit/runners 六域）——单一型 + kind 区分（既有型面逐域枚举扩不动）；「每次动作落审计行」= 用户口径（含读动作——沿任务面沙盒先例）；不双记 = 一动作一行（审计页可读性 + 计数诚实） | 复用 `sandbox_event`（名不符实——非沙盒动作）；逐域既有型（读动作/模型设置等无型可落——枚举爆炸）；不落审计（违用户口径——否）；turn 级行（每回合一行 = 噪声——调用行已足） |
| KD-SV-107 | **回合中止 = 协作式双通道**（chat-shell-align 批——用户 21:55「补后端一件不藏」）：进程内登记表 + ① AbortSignal 透传模型出口（核 `chat(..., { signal })`——`thincoder-core/provider/core.mjs:118`）∥ ② 环内检查点（每模型调用前 ∥ 每工具调用前）；终态 = 第五形 `"aborted"`（notice + `chat_stop` 审计 + `end` failed；部分文本如实落库）；`finally` 清登记（零泄漏）；重启天然空（零持久化）；idle 态 abort ⇒ 400 人话（零副作用） | 在途调用可当即中断（signal 通道 —— 核已在册——不自造）；工具循环内（检查点）；「执行不依赖连接」口径不破（登记表 = 进程内）；单条审计行（不双记） | 仅轮询检查点（长回复不可中断——手感差——否）；子进程/Worker 抢占式（超机制——否）；落库式中止位（重启后残留——否）；新建端点携带中止语义（职责混——否） |
| KD-SV-108 | **会话内换模型 = 明选即换（下回合生效）**——KD-SV-87 收正（chat-shell-align 批）：端点 = `PATCH /api/admin/agent/chats/:id { model }`（`requireAdmin` ∥ `assertChatModelAvailable` 同判 ⇒ 400）；库 = `agent_chats.model` 既有列（零迁移）；在途回合零触（`runChatTurn` 起跑读行——`thincoder-server/src/agent/chat.mjs:352`/`:414`）；零审计行（KD-SV-91 三 kind 不扩） | 用户 21:55「补后端一件不藏」——核模型钮面原子已在（控制台补齐后端）；明选即换 = 零新配置面；下回合生效 = 零历史改写；零迁移 = 最小面 | 「换 = 新建会话」（逐次新建碎片化——否）；在途回合改模（半回合换模型——不可解释——否）；新增审计 kind（三 kind 面已定——零行处置） |
| KD-SV-109 | **附件面 = 文本档零后端 + 图片随消息行存（视觉门在服务端）**（chat-shell-align 批）：文本档 = 纯客户端（核 `thincoder-render-core/composer/attach.mjs` 三限 + `withAttachedFiles` 内联——服务端零新面）；图片 = POST `images`（dataURL 列）⇒ 服务端核 `parseDataUrl`（栅格四型 ∥ ≤`IMAGE_MAX_BYTES` 15MB）+ 核 `isNonVisionModel` 视觉门（⇒ 400 人话）；库 = user 行 `data_json.imageParts`；回放 = content 数组（非视觉历史由核 `stripImagesForTextModel` 兜底——`thincoder-core/provider/core.mjs:133`；历史图预算 = 核 `capHistoryImages`——`:135`——服务端零重复）；详情仅 `imageCount`（dataURL 零下发） | 核件阀单源（15MB/30MB、四型——不自造）；服务端复校 = 不信任客户端（直 POST 同验）；零文件面 = 最小落法；详情零下发 = 体量面；两壳同形（VSC 同机制） | 新建上传端点/文件存储（新面——否）；客户端缩放/压缩（核件无——否）；存磁盘路径（新生命周期——否）；详情回传 dataURL（体量——否） |
| KD-SV-110 | **会话级思考档位 = 库列 + 设置路由 + 装配携值（三件一套）**（console-reasoning-levels 批——2026-10-12；功能点 42 ∥ AC-42；口径四条经用户 11:46 核准）：① **存储** = `agent_chats.reasoning TEXT`（v16 增段——列级 `ALTER`，表不重建；NULL = 未设）+ 换模型随写清；② **设置** = `PATCH /api/admin/agent/chats/:id` 扩为会话设置面——体一次一件（`{ model }` ∥ `{ reasoning }`；同携 ⇒ 400）——`reasoning` 值域 = 核同一枚举（`specForModel(上游).reasoningEffortEnum`——会话 `model` = 对外标识 ⇒ **先经别名反查解上游真名**（`providers.mjs` 别名索引——KD-SV-59）；表外 400 ∥ `null` = 清）；③ **装配** = 回合起跑读行（与 `model` 同点）⇒ 值 ∈ 枚举（解析径同 ②）⇒ provider 配置携 `reasoningEffort`（核载荷门单源消费）；未设 ∥ 表外 ⇒ 零字段（读侧容忍——沿核会话槽「表外串不动」先例，防规格表变更砖死存量会话） | 口径③（会话级——与模型同层存；切会话各自记住）+ 口径②（默认不设 + 换模型回中性）；**零迁移**（存量行 NULL = 今日行为逐字同）；核单源（值域/载荷门/off 语义全在核——服务端零第二份档位语义） | 新表/新会话档（两表语义重叠——否）；浏览器本地存（切设备/重开即失——违会话级）；逐条覆写（VSC per-message 参——口径③会话级，否）；复用 `model` 列拼值（解析歧义——否）；内存态（重启即失——违 KD-SV-89 落库口径，否）；统一兜底枚举（口径①驳回——无档必须中性）；别名模型档位面退中性（口径①——别名所指上游有档即给，驳回） |

| KD-SV-112 | **环境块装配 = 四块（三活体尾位瞬态行 ＋ 简报第四块）＋ 块级降级**（admin-agent-awareness 批——2026-10-12）：① 每回合（请求）造三活体行——时空 ∥ 所在/身份 ∥ 所管现况一行（域件进程内直取）；② **尾位**（历史与本轮消息之后——沿核 `thincoder-core/agent/setup.mjs:176-185` 前缀缓存理由）＋**瞬态**（不落库、不进回放——值随实况的直接后果）；③ 降级 = **块级略去**（该块任一读失败 ⇒ 整行缺席、回合不阻断；无半真值上屏）；④ 第四块「能力与边界」= 简报静态段 ＋ 活体面（`tools.schemas`）；⑤ timer 到期行随组同落 | 需求 43①②（值随实况 ＋ 读失败降级不阻断）；三端对位 = 核回合尾位注入/瞬态不落人读线（`pushEnvStateReminder` 先例）；瞬态 = 零迁移 ＋ 回放口径零破（KD-SV-89）；块级 = 「该块降级略去」字面读法 | 落库式（旧值冻结 ＋ 回放污染——否）；系统简报内逐回合拼动态串（简报 = 静态常量面——否）；逐字段降级（字面不符 ＋ 半真值——否）；注入 system 槽（核同判：瞬态行走 user 行——否） |
| KD-SV-113 | **环境工具面 = 核件复用（六族八件——原七件 + 修订轮 `read_history`）＋ 结果归一 ＋ 服务面限幅**（admin-agent-awareness 批——2026-10-12）：① 件 = `get_current_time` ∥ `process` ∥ `timer` ∥ `ls` ∥ `read` ∥ `grep` ∥ `bash` ∥ `read_history`（修订轮——§16.1）——**核工具对象原文复用**（实现 ∥ schema ∥ 描述三面同源；动载 `@thincoder/core/tools/*` ＋ `agent-tools/timer.mjs`——沿 `loadCoreChat` 先例）；② ctx 适配 = `{ cwd, signal, agent: timer 垫片, depth: 0 }`（`cwd` = `deps.cwd ?? process.cwd()`；`signal` = 回合中止信号透传 ⇒ bash 树杀）；③ 结果归一 = `{ ok, subject, summary, output }`（`ok` = 调用完成〔未抛错〕——命令退出码在输出文本内，不解析；`subject` = 主语原文——审计数据源）；④ 限幅三件（§14.3）：超时（缺省 120s = 核常量 ∥ **无上限**——仅拒非有限值/小于 1；自造 600s 顶已按用户 2026-10-12 15:00 裁撤）∥ 输出（工具层 200K 字/2MB 流 ⇒ 落库形 ≤4000 字〔KD-SV-89 单源〕⇒ 帧/审计摘要 ≤300 字）∥ 工作目录（无路径围栏——如实披露）；⑤ 端池参数处置 = `bash.async` 在册（§14.2/§15.1）∥ `process.kill` 的 `id` 靶 = 后台任务杀点；`kill pid` 在册（与 bash 等价） | 「对齐三端」= 同件同语义（自写一套 = 第二份漂移面——KD-SV-78 同判）；限幅 = 需求 43⑤ 明文，值取核内既有常量/惯例（零新口径）；结果归一 = chat 面既有 `{ ok, … }` 形；`subject` = 审计「命令原文/路径」的钱货（需求 43⑥） | 自写服务端工具（三端漂移——否）；核件 schema 收窄（第二份面——否，端池参数运行期处置）；JSON 形回文本（模型可见形失真 ＋ 耗预算——否）；解析退出码映射 `ok`（第二份输出格式语义——否） |
| KD-SV-114 | **工具动作审计 = 详情扩字段（`subject` ∥ `truncated`）＋ 审计页按型模板**（admin-agent-awareness 批——2026-10-12）：① 落面 = 既有 `chat_call` 行（KD-SV-91 面不扩——零新型/零新 kind）；`detail` 增 `subject`（主语原文 ≤2000 字——命令/路径；逾限截断并注记；**落库前与 `call` 同链过会话面掩蔽**——「原文」= 未经摘要重写的完整命令，非免掩蔽）∥ `truncated`（**结果可见形**被截断〔`capToolContent` 触发〕）；成败 = 既有 `resultCode`；② 页面 = `views-audit.mjs` 增 **agent 行详情模板**（`tool · subject · 成败 · 〔截断〕 · summary`——非裸 JSON）＋ 三文案键（`audit.agentOk` ∥ `agentFail` ∥ `agentTruncated`——两表同步） | 需求 43⑥（每次调用一行 ＋ 命令原文/路径 ＋ 成败 ＋ 截断态 ＋ 页面可读）；`detail` = JSON 面 ⇒ 零迁移零 CHECK 改；页面模板 = 沿沙盒 `kind` 族先例（按型渲染） | 裸 JSON 直显（需求明文禁——否）；新审计型/新 kind（枚举面不动——否）；command/path 塞进 `call` 串（页面要解 JSON——「非裸 JSON」的实义就是结构化字段——否）；`subject` 无上限（审计表体量失控——否） |

| KD-SV-125 | **唤醒面 = 一器两源（核闩复用 ＋ 结算钩子），空闲判定单源 = 会话行 `status`**（server-wake-face 批——2026-10-12；台账 #1319）：① 闩 = 核 `createTimerWatch`（`thincoder-core/agent/timers.mjs:79`——会话键面表 ∥ `getAgent` 活读垫片 ∥ `unref`）；② 第二源 = `pad._asyncWaiters` 钩子（核结算尾唤醒单点 `wakeAsyncWaiters`（`agent-tools/async-settle.mjs:324`）的兑现面——钩子**先自再武装再评估**，因核 splice 一次性消费）；③ 空闲判定 = `chatRowOr404(db).status === "running"`（**DB 单源**——与在途门/`claimChatTurn` 同判，不设进程内忙旗）；④ 火策略 = 核 `fireTimerWake`（`timers.mjs:102`：busy ⇒ `false` ∥ `deliver()` 纯判据非真 ⇒ `false` ∥ 真 ⇒ 开会话轮）；⑤ 再武装三链尾 = 用户回合尾 ∥ 唤醒回合尾 ∥ 结算钩子；**已到期不武装 0ms 闩**（交链尾消化——防自旋/惊群）；⑥ 重启 = 进程内（与核 `_pendingTimers` 同判——批档 §1 已核「非差异」） | 跨端用户可见差异 = 缺陷（用户 2026-10-12 15:07「为啥要有这些差异？我真服了。」）；核三件（闩/火/判据）三端已在用 ⇒ 复用 = 零第二套语义；空闲判定取 DB 单源 = 进程内忙旗与在途门必分叉（两处状态）；零轮询 = 沿三端先例（`unref` 一次性闩——`heap-watch` 同族） | 端口轮询（秒级 tick——CPU 空转 + 时延；否）· 独立调度进程/队列（宿主形态差——否）· 进程内忙旗（与 `status` 双源——否）· 定时器落库（核同判进程内——否）· 交付与开轮两个独立开关（唤醒来路已唯一——否） |
| KD-SV-126 | **异步面 = 核池原样 ＋ 会话垫片即宿主（零自造池），送达 = 汇面落库**（server-wake-face 批——2026-10-12；台账 #1317）：① `bash.async` 显式拒**删除**——核件（`thincoder-core/tools/bash.mjs`）按 `ctx.agent` 走 `launchBgTask`（`agent-tools/bash-async.mjs:100`——帽 4 ∥ 回执 ∥ 池 ∥ 结算 ∥ 杀单点全在核）；② 垫片为宿主 = 核载体字段面（池/pending/唤醒栓经核 API 落面：`ensureBgPool` ∥ `parkAsyncPending` ∥ `wakeAsyncWaiters`；`history` 数组为 carrier 回落——**零自造第二池**）；③ 送达 = 汇面（`pad.history`）⇒ **落库**（`user` 行 + `data.kind="reminder"`）⇒ 随历史进上下文（零二次注入）；④ 取消面 = `process action="kill" id:N`（核 `killBgTask`——杀树 + 出池 + 墓碑）；⑤ 中止面 = 池条目控制器链**当刻回合信号**（`_sessionSignal` 不设 ⇒ `buildChildSignal`（`agent-tools/async-settle.mjs:165`）回落 `ctx.signal`）∘ 非 interrupt 中止 ⇒ 回合尾 `discardAbortedBgTasks(pad)`（杀 + 提醒 + 墓碑——判据沿核 `run-stages.mjs:205-218`） | 核四端机制在盘（用户 14:58「我说的就是异步啊！」）——自造池 = 第二份漂移面；送达必须落库 = 机读线单源（VSC 先例：`thincoder-vscode/src/extension/timer-watch.mjs:11-12`「不落盘 = 下一次 run 读不到 = 静默丢」） | 自写任务池/进程管理器（三端漂移——否）· 同步长命令 + `timeout` 兜底（= 今日缺陷面——否）· 摘要仅瞬态不落库（下一回合读不到 = 静默丢——否）· 收窄核件 schema（端池参数运行期处置——否）· 会话级 Stop 语义（服务面无该物——§15.2「无对应物」行） |
| KD-SV-129 | **管理会话模型出口 = 本进程网关链的 loopback 客户端**（server-wake-face 批 · 修订轮——2026-10-12；用户 15:44「应该走我们自己的模型代理服务，这样才能确保用量统计的准确」· 台账 #1324）：① 目标 = `http://<本机监听地址>:<port>/v1`（`server.address()` 惰性读；通配 `0.0.0.0` ⇒ 拨 `127.0.0.1` ∥ `::` ⇒ `::1`；不经 nginx）；② 凭据 = 本回合发送者的 `admin-agent` sk（§16.3——KD-SV-130；唤醒/续跑轮随最近发送者、主人兜底——2026-10-13 收正）；③ 模型 = 会话行 `model`（**对外标识**——与会话创建/四端客户端同形）；④ **复用面 = 网关链全链逐字**（鉴权 ∥ 派发 ∥ 准入三件 ∥ 转发 ∥ 记账——零第二份）；⑤ 失败面沿既有五终态（sk 缺/网关拒 ⇒ `model_error`）；⑥ 唤醒回合同源（同装配）。**与 KD-SV-82「进程内直取」不冲突**：域件读 = 管理动作面（进程内），模型调用 = 对外契约面（走网关） | 账只能对在网关链（记账/配额/限流/判权四单源全在那）；loopback = 零网关重构（`thincoder-server/src/gateway/forward.mjs` 中继与路由解耦不做）；「跟客户端一样」字面达成（连核规格面同客户端既态——§16.2 差异三条已披露） | 进程内函数级复用（需把 `forward.mjs` 中继核心与 HTTP 解耦，或以第二份中继复制记账接缝——前者波及成员面回归、后者违「不造第二份」；且 sk 沦为装饰——否）· 继续直连（账对不上——用户否）· 拨 nginx/公网 URL（多一跳 + TLS 依赖——否）· 另开内部端点（新契约面 + 第二份记账——否） |
| KD-SV-130 | **管理面 sk = 成员级一枚（`admin-agent`）＋ 登录 ensure ＋ 明文落库面**（server-wake-face 批 · 修订轮——2026-10-12；用户 15:44「登陆时分配一个sk给管理会话用」）：① 归属 = 本回合发送者（成员级、跨会话稳定；唤醒/续跑轮随最近发送者、主人兜底——2026-10-13 收正）；② 触发 = `POST /api/login` 成功 ∧ `role = "admin"` ⇒ `ensureAgentKey`（幂等：在册 ⇒ 复用零重签；非 admin 零动作）；③ 名 = `admin-agent`（常量单源 = `thincoder-server/src/accounts/keys.mjs`）；④ 明文落面 = `api_keys.key_plain`（v19 增段——NULL = 常规 key；仅 `issueKey({ keepPlain: true })` 写；服务端即消费方——同沙盒工作区 `key_plain` 先例）；⑤ 审计 = 首发一条 `key_issue`（`detail = { keyHint, surface: "admin_agent" }`——`surface` 取值域扩，随正 = `accounts/ACCOUNTS.md` §2.1）；⑥ 免 20 上限（服务端签发面沿客户端/CLI 先例）；⑦ 生命周期沿 key 面（逐请求查库 ⇒ 吊销即断；轮转连带） | 「同客户端口径」= 用户原话；落 key 表 = 列表/吊销/用量归因全复用（零第二份凭据面）；ensure 幂等 ⇒ 登录路径零新状态；明文列 = loopback 每回合需真凭据（服务端即消费方——沙盒先例同判） | 收成配置项（`agent.modelApiKey`——新配置面 + 需 UI 写面 + 与「登录分配」原话不符——否）· 每会话一枚（会话面凭据爆炸 + 归因碎——否）· 非持久化（重启即断管理会话——否）· 明文入配置/文件面（生命周期第二份——否） |
| KD-SV-131 | **`read_history` 落法 = 核件原样 ＋ 库面 `_recordStore` 适配（本会话作用域）**（server-wake-face 批 · 修订轮——2026-10-12；用户 15:40「管理端目前没有查会话历史的工具，这个也需要打开。」· 台账 #1323）：① 件 = `thincoder-core/agent-tools/read-history.mjs` 原文复用（实现/schema/描述三面同源）；② 记录面 = `pad._recordStore = recordStoreOf(db, chatId)`（`chat-store.mjs` 新增导出——`iterate(direction)` 生成器；行 ⇒ 记录形：`ts` = `created_at` 毫秒；tool 行携 `name`/`tool_call_id`；assistant 携 `tool_calls` 重建形）；③ 作用域 = 本会话（`path` 非空 ⇒ 运行期拒——服务面无会话树）；④ notice 行在列（核件不校验 role）；⑤ 环境族第八件（第六族「会话」）；⑥ 审计沿 `chat_call`（`subject` = 过滤摘要） | 复用优先（核件已有 role/keyword/tool/时间窗/limit/direction 全套过滤与截断——自写 = 第二份语义）；`_recordStore` = 核自持注入缝（记录面单源 = KD-SV-89 库面）；跨会话在服务面无语义（一会话一行）⇒ 运行期拒（沿端池参数先例） | 自写服务端 history 工具（第二份过滤/截断语义——否）· 维护 `_fullHistory` 内存镜像（重启即失 + 双源——否）· 核件 schema 收窄（第二份面——否）· 放行 `path`（越会话作用域 ∥ 与用户原话相抵——否） |

| KD-SV-136 | **chat 工具面扩 = `exec`（主机表行绑定）＋ `runners.revoke_credential`（七 ⇒ 八）**（admin-chat-creds-merge 批——2026-10-12；用户裁：SSH 凭据进管理面 chat）：`exec(host, command, timeoutS?)`——绑定 = 主机表行（名 ∥ 地址经 `runnerByRef` 单源，与 `docker` 同判）；缺凭据 ⇒ 工具级错误（人话指向录入弹窗）；传输 = `sandbox/ssh.mjs` `createSshExecutor`（同件）∥ 凭据 = 行密列解密（既有加解密单源）∥ 审计 = `chat_call`（subject = 命令原文）∥ 掩蔽 = `maskSecrets` + **行凭据值**（输出/摘要/subject 同链）；`runners` 动词 += `revoke_credential`（主机表凭据零化 + `host_credential_revoke` 审计）；零新端点 ∥ 零新审计型 | 用户「进 chat」的落点 = 工具面（会话内可执行）；绑定沿 `docker` 先例（机队语义——不接任意地址）；三单源（传输/加解密/审计） = 零第二份；掩蔽含行凭据值 = 秘密纪律（KD-SV-114 同精神）；任务式面已退场（2026-10-14——装机 = chat 内动作） | 不接 `exec`（用户裁定推翻——否）· 任意地址 `exec`（机队语义/误打面——否）· 凭据作工具参传入（秘密入消息行/模型上下文——否）· 新审计型/新 kind（枚举面不动——否） |

| KD-SV-205 | **模型测试 = `models` 第六动词（`test`）——经网关链 loopback 单请求 ＋ 五读数**（model-test-tool 批——2026-10-14；台账 #1390；用户 00:19 提 ＋ 00:50 两句厘定）：① **形** = 面内动词（五 ⇒ 六；工具名集八件不变——沿 KD-SV-90「每动作一工具」被否栏口径）；对象 = **已配渠道点名**（`provider` ＋ `model`（上游名 ∥ 别名）——解析 → 对外标识）；② **通路** = 单次 `POST <selfBase>/v1/chat/completions`（本回合发送者的 `admin-agent` sk——装配同源 = `chatProviderOf`；§16.2/§16.3 ∥ `thincoder-server/src/agent/chat.mjs:360`）；经网关链全链 ⇒ **记账自动**（usage 行——member = 发送者 ∥ key = `admin-agent`；零第二份）；③ **读数五件** = `status`（闭集五支：`ok` ∥ `timeout`（携阶段）∥ `http_error`（携 HTTP 码）∥ `bad_response` ∥ `broken_stream`）∥ `error`（原文摘录——原样、帽 500 字）∥ `totalMs` ∥ `ttfbMs`（首个**非空内容增量**——流首空壳块不计）∥ `tps`（`usage.completion_tokens` ÷ 生成窗——usage 缺 ⇒ null，不估）；④ **预算** = `timeoutS`（缺省 60 ∥ 上界 600——值域形沿 `exec` 同面先例；非正/非数/越界 ⇒ 工具级错误人话；界值依据 = §12.1①；`AbortSignal.timeout` ＋ 回合中止信号透传）；⑤ **审计** = 既有 `chat_call`（零新 kind/型——KD-SV-91 面不扩）；⑥ **边界** = 不做草稿值试连（未配 ⇒ 工具级错误——与 AC-18「测试连接」草稿面划界）∥ 无控制台对位面 ∥ 成员面不做 ∥ 零新端点 ∥ 零迁移 | 用户 00:50 定案（「走网关链，记账」「首字节延迟和吞吐也需要」）；账只能对在网关链（KD-SV-129 同判）；读数五件逐条可机检（假 SSE 流注时刻）；面内动词 = 八件口径不破 | 进程内直调 `forward` 函数（需中继核心与 HTTP 解耦 = 第二份记账接缝——KD-SV-129 已否同形）· 复用核 `chat()` 客户端（核件带重试/续写 ⇒ 一次测试 ≠ 一请求——读数被多请求混合；且核无「首字节」观测点（只有 `onToken`）——否）· 裸探上游（不经网关——账对不上——否）· 新审计 kind（枚举面扩 ＋ 计数链随正——调用行已足——否）· 新端点（双面 + 契约面扩；本批只 chat 面——否，如要控制台钮另裁） |

## 10. 本域边界（不做的面）

- **权限模型/围栏改造**（admin 权限管理归用户——12:47 裁；本面只保证留痕：每次工具调用一审计行）。
- **路径围栏 ∥ 命令白名单**（不设——沿核口径：`resolveInCwd` 无边界断言 ∥ bash 无命令过滤；如实披露 = 任一 admin 成员可经对话页在服务器跑命令/读文件〔含密钥与库文件面〕——需求 43 风险在册）。
- **三端无对应物项**（git 上下文 ∥ 项目档注入 ∥ 同目录实例——需求 43 边界句；服务端无该物）；**cwd 在册**（②行 `cwd:` 字段 + §14.3 工作目录限幅）。
- **唤醒开关 ∥ 唤醒频率下限**（三端 `agent.timerWake` 键 = 端配置文件面，服务面无该面；频率下限/周期式样 = 兄弟批 `docs/batches/2026-10-12-timer-completeness.md` 设计面——§15.3 ②③）。
- **timer/后台任务的可视面**（控制台提醒行样式 ∥ 状态行段 ∥ 定时器与后台任务列表 ∥ 唤醒开关控件——新 UI 面，且 `views-chat.mjs` 已贴 500 软线〔台账 #1309〕；§15.3 ②）。
- **浏览器后台动作族（`browser.async`）**（本面八件无 browser 件 ⇒ 零对位面——§15.2）。
- **`wait_for` 工具**（核族件；本面八件口径不含——任务等待面 = 结算投递，§15.1）。
- **`read_history` 的跨会话面**（`path = 文件 ∥ cwd: ∥ all`——服务面无会话树；运行期拒——§16.1）；历史删除/编辑（不设）。
- **文件编辑族工具（write/edit/apply_patch）**（不入册——写入仍可经 `bash` 抵达，工具面如实；核 `bash` 描述指向 edit 族的指引在本面落空 = 核文案面发现项，§13 R62③）。
- **成员面 agent 的 server 域工具面归属** = `agent/MEMBER-AGENT.md` §2 KD-SV-159：范围 = 成员本人资源；动作集 = 写面同集——单源（创建 ∥ 启动 ∥ 停止 ∥ 销毁 + 拉仓）；管理面运维件（docker/主机/exec/provider）不入成员面；逐件清单与实施 = 实施批从实需反推。
- **chat 面不做（§11/§12）**：SSH 凭据经 chat **文本**输入（凭据入口 = 结构化弹窗——沙盒页节点行动作 ∥ 对话页钮，同一弹窗件；**文本非通道**：秘密零入消息行/模型上下文）∥ 会话删除/重命名/归档 ∥ 会话自动清理（保留口径未裁——不设清零）∥
  工具面机制确认门（破坏性动作先说明 = 提示词级纪律——如要机制门另裁）∥ 沙盒工作区/规则/待批/设置各面工具（随沙盒余面批同批长）∥ 节点排空/禁用工具（控制台侧未落——不发明）∥ **思考档位的逐条覆写/状态行段**（console-reasoning-levels 批——口径③④恒会话级；`✦reasoning` 零引用）。
- **多任务编排/队列**（任务式面已退场；独立编排器不加 ∥ 定时/事件触发 = chat 面 timer/唤醒——§15）。

## 11. 聊天式驱动（管理面 chat——本批）

- **形态**：管理面 chat = 管理面 agent 的驱动形态（唯一——2026-10-14 任务式退场）——浏览器侧 = 控制台页 `#/admin/chat`（`webui/CHAT.md` §2.1）；用途 = 运维/管理（机队 ∥ 成员与 provider ∥ 审查排障——**非开发用途**；需求 §5「两个 chat 界面」②）。工具面框架 = 管理面八件（§12）+ 环境六族八件（§14）；同一审计面、同一模型出口面（§5——管理会话出口实现 = §16.2：本机网关链 + 本回合发送者的 sk——谁用谁，2026-10-13 收正）。
- **会话（chat）**：`model`（建会话时选定——KD-SV-87 同口径；**会话内可换**——明选即换、下回合生效（chat-shell-align 批收正 = KD-SV-108））+ 消息序（库两表——KD-SV-89）；列表/详情 = 读时读（无后台常驻）。
- **回合（turn）**：用户发一条 ⇒ 装配 = 系统简报（管理面用途句 + 行动纪律句 + 能力边界段——§14.1 第四块）+ 历史重放（含图——KD-SV-109；压缩会话以标记行代覆盖段——§17.3 A3）+ 本轮消息 + **环境块**（三活体行 + timer 到期行——尾位瞬态、不落库；§14.1）⇒ agent 环（多轮工具循环）跑到自然结束（模型出口 = §16.2：本机网关链 loopback + 本回合发送者的 `admin-agent` sk——出账归因同点）。
  终止**五形**：① 模型无工具调用（自然结束——`succeeded`）；② 预算超限（20 分钟 ∥ 60 调用——**每回合独立计**）；③ 模型出口抛错；④ 空回合（无文本无调用）；⑤ 手动中止（chat-shell-align 批——`"aborted"`；KD-SV-107）。
  ②③④⑤ ⇒ notice 行（人话；`data.reason` 各点名：② `"budget"` ∥ ③ `"model_error"` ∥ ④ `"empty_turn"` ∥ ⑤ `"aborted"`；人话文本 = `content` 面）+ `chat_stop` 审计 + `end` 帧 `failed`；②③⑤ 下已生成文本 ⇒ `assistant` 行如实落库（部分文本——回放逐字一致；与 notice 行各自一行），零文本 ⇒ 零 `assistant` 行。
- **流式通路**（KD-SV-88）：`POST /api/admin/agent/chats/:id/messages` 单请求；响应 = `application/x-ndjson` 帧流（每行一帧）：`{"type":"delta","text"}`（模型文本增量——核 `onToken`）∥
  `{"type":"call","id","name","args"}`（工具调用开始——`args` = **字符串**（参数摘要——JSON 序列化 ⇒ 掩蔽后截断 ≤500 字；恒为字符串，非对象））∥ `{"type":"result","id","ok","summary"}`（结果摘要 ≤300 字）∥ `{"type":"end","status","reason"?}`（回合终态）∥ **chat-shell-align 批扩**：`turn` ∥ `usage` ∥ `end` 两可字段——**帧形全文 = §11.3**。
  **执行不依赖连接**（断连照跑——落库单源；页刷新/重开重读会话详情形即全量）。流前错误（判权/形/在途/不存在）= 统一信封；流中失败 = `end` 帧（headers 已发——不再走信封）。
- **在途门**：同会话 `status = running` 期间再发 ⇒ 400 人话（「本会话正在执行——等它结束」）；跨会话并发不设限（未裁——不发明）。
- **重启恢复**（重启如实收尾口径）：启动装配期 `running` ⇒ `idle` + notice 行（「server 重启——本轮中断」；`data.reason` = "restart"）+ `chat_stop` 审计行；已落库消息零动。
- **判权与审计**：六端点全 `requireAdmin`（界面显隐非判据）；审计 = `agent_event`（KD-SV-91——`chat_start` ∥ `chat_call` 逐调用 ∥ `chat_stop` 异常收尾）。
- **行动纪律句（系统简报内——提示词级，非机制门）**：先查后动（读数先于动作）∥ 结果用逐句人话 ∥ 破坏性动作（删节点 ∥ 吊销凭据 ∥ 重置密码 ∥ 删 provider ∥ 停模型）先说明将做什么、再执行 ∥ 凭据请求 = 指向主机凭据弹窗（**不要请用户把凭据发在聊天里**） ∥ 不确定 ⇒ 问用户。如需机制级确认门 ⇒ 另裁（本批不做——§10）。
- **测试注入缝**（§7 单元测试档判据依托）：模型出口 ∥ 工具面 = 模块级注入（setter ∥ 参数覆盖——默认 `null` ⇒ `??` 回落真件，生产行为不变；沿 `sandbox/SANDBOX.md` §13 `fetchImpl`/`execImpl` 注入面先例）；控制台面假流桩 = `webui/WEBUI.md` §6 本批行。

### 11.1 呈现面（console-chat-align 批——2026-10-11）

- **渲染面 = 复用渲染核**（本域零新增机制；用户 18:23 指出「第四套 chat」+ 18:30「改」）：管理面 chat 的呈现面（markdown ∥ 代码块高亮 ∥ 工具卡 ∥ 流式增量 ∥ 滚动行为）由 `thincoder-render-core` 承载（取件形 = 控制台静态面第二根 `/rc/*`）；对齐集与做/不做逐项 = `webui/CHAT.md` §2.1 ∥ 决策 = 该档 KD-SV-101。
- **本域零变化**：会话 ∥ 回合 ∥ 帧流四形 ∥ 消息 role 四值 ∥ 工具面 ∥ 审计面均不动（呈现面 = 控制台侧消费面）；**帧面/落库面无 reasoning 文本通道**（例外 = 落库面 tool 轮回声道——§17.3 A1；思考块 = 模型思考文本——与思考档位 `reasoningEffort`（请求参）无关，后者 = KD-SV-110） = 呈现面不做思考块的根因（加文本字段 = 本域面——余项，不在本批）。
- 工具卡呈现 = 核件 `renderToolCard` ∥ `finishToolCard`（失败判定 = 核 `isToolFailure`）；工具行语义面（§12 表）不变。
- **输入区全件翻做**（chat-shell-align 批）：面板 ∥ 控件行 ∥ 附件 ∥ 斜杠 ∥ 模型菜单五件均入呈现面；适配层与无源钮收窄 = `webui/CHAT.md` §2.1③；四件控件后端 = 本档 §11.2。

### 11.2 输入区四件后端（chat-shell-align 批——2026-10-11）

- **① 会话内换模型**（KD-SV-108——KD-SV-87 收正）：端点 = `PATCH /api/admin/agent/chats/:id`（体 `{ model }`——`requireAdmin`；模型校 = `assertChatModelAvailable` 同判 ⇒ 400 人话）；响应 = 200 `{ chat: { id, model, status, createdAt, updatedAt } }`（同建会话行形）。
  - 库 = `agent_chats.model` 既有列（零迁移）；语义 = **明选即换、下回合生效**（在途回合零触——`runChatTurn` 起跑读行（`thincoder-server/src/agent/chat.mjs:352`）∥ 出口于回合内装配（`:414`））；零审计行（KD-SV-91 三 kind 不扩——换模型 = 会话设置面；如要留痕另裁）。
- **② 附件**（KD-SV-109）：**文本档** = 纯客户端（核 `thincoder-render-core/composer/attach.mjs` 三限（单档 256KB ∥ 每回合 4 个 ∥ 合计 512KB——**值以核件为单源**）+ `withAttachedFiles` 内联进 `content` 文本）——**服务端零新面**；**图片** = 随 POST 体 `images`（dataURL 列）：
  - 服务端校验 = 核 `attachments.mjs` 单源：`parseDataUrl`（栅格四型 png/jpg/gif/webp ∥ 单图 ≤ `IMAGE_MAX_BYTES` 15,000,000）——不合 ⇒ 400 人话；视觉门 = 核 `isNonVisionModel(model)`（规格表单源）⇒ 非多模态 ⇒ 400 人话（「当前模型不支持图片输入」）；流未起（信封形）。
  - 落库 = user 行 `data_json.imageParts`（parts 形：`[{ type: "image_url", image_url: { url: dataURL } }]`——回放直取）；**详情响应仅 `imageCount`**（dataURL 零下发——体量面；`messageView` 收口）。
  - 回放 = `replayMessages` 重建 content 数组（`[{ type: "text", text }]` + parts——非多模态历史由核 `stripImagesForTextModel` 兜底（`thincoder-core/provider/core.mjs:133`）∥ 历史图预算由核 `capHistoryImages`（`:135`）——**服务端零重复实现**。
  - 边界：图片零文件面（无缩略图/下载/文件存储——dataURL 随行存；体量口径 = 披露）。
- **③ 回合中止**（KD-SV-107）：端点 = `POST /api/admin/agent/chats/:id/abort`（`requireAdmin`；`chatRowOr404`；会话非 `running` ⇒ 400 人话（「本会话不在执行中」）——零副作用）；响应 = 200 `{ ok: true }`（终态经流/详情呈——本响应只言「已请求」）。
  - 机制 = **进程内中止登记表**（`Set<chatId>`——`requestChatAbort` ∥ `isChatAbortRequested` ∥ `clearChatAbort`；`chat.mjs` 模块级——零持久化，重启天然空）+ **双通道生效**：① `AbortSignal` 透传模型出口（核 `chat(..., { signal })`——`thincoder-core/provider/core.mjs:118`；在途调用当即中断）② 环内检查点（每模型调用前 ∥ 每工具调用前——协作式，非抢占）。
  - 收尾 = 沿异常收尾径（notice `"aborted"` + `chat_stop` 审计 + `end` 帧 `failed`）+ `finally` 清登记（零泄漏）；审计行 = 一条（`chat_stop` reason `"aborted"`——中止请求本身零审计行，不双记）。
- **④ 斜杠命令表**（控制台装配——核 `composer/slash.mjs` 机制单源）：`/model`（⇒ 开模型菜单——同钮同函数）∥ `/new`（⇒ 新会话弹窗）∥ `/help`（⇒ `formatHelp` 行集就地打印）；别名 `/m` ∥ `/n` ∥ `/h`（CLI `SLASH_ALIASES` 键集内）；**表纪律** = 不得自创命令名（名 ⊆ CLI `SLASH_COMMANDS` 名集）；未知 ⇒ 核 `slash.unknown` toast（文本保留不发送）∥ 带参 ⇒ 核 `slash.args` toast。

### 11.3 帧面扩展与视图读数源（chat-shell-align 批——2026-10-11；console-chat-live-step 批收正——`turn` 帧双职：状态行 ＋ 活流分步界）

- **加性扩展**（既有消费零破——`end` 增可字段；新帧 = 新 type）：
  - `{ "type": "turn", "n": 1 }`——每模型调用前发（n = 本回合第 n 次调用）；**双职帧**：控制台状态行轮次 ＋ **活流分步界**（每到达 ⇒ 上一步收束、新步起——一步一块；消费面 = `webui/CHAT.md` §2.1——KD-SV-132）；
  - `{ "type": "usage", "prompt": N, "completion": N, "cacheHit": N, "cacheMiss": N }`——每次模型调用返回且 `turn.usage` 在场（缺 ⇒ 零帧——**有源才发**）；
    值 = 核 `usage.{prompt_tokens, completion_tokens, prompt_cache_hit_tokens, prompt_cache_miss_tokens}`（`thincoder-core/provider/core.mjs:306-312` 聚合形；核 usage 无 reasoning 计数 ⇒ 状态行 ✦ 段不做）；
  - `end` 帧 + `durationMs`（回合耗时）∥ `calls`（工具调用数）——可字段。
- **零落库**：帧面 = 视图面（读时单源 = 消息行不变——刷新后状态行清空重算）；状态行读数项表 = `webui/CHAT.md` §2.1④（消费面单源）。

### 11.4 会话级思考档位（console-reasoning-levels 批——2026-10-12）

- **归属与形**（口径③——用户 11:46「行」）：档位归**会话**（与 `model` 同层）——库列 `agent_chats.reasoning`（v16 增段；NULL = 未设）；`chatView` 行形携 `reasoning`（建会话回执 ∥ 列表 ∥ 详情 ∥ PATCH 回执四面同源）。
- **值域源 = 核单源**：`thincoder-core/model-specs.mjs` `specForModel(上游真名).reasoningEffortEnum`（前缀匹配 + 命名空间剥离同核）——服务端桥件 `thincoder-server/src/gateway/reasoning-levels.mjs`（已落盘——懒载 `@thincoder/core/model-specs.mjs` + 缓存；`levelsOf` ∥ `modelReasoningMap` 稀疏图）；
  **标识解析径**（会话 `model` = 对外标识——别名 ∥ `provider/model`；KD-SV-59）：**先解上游真名再取枚举**——反查 = `thincoder-server/src/gateway/providers.mjs` 别名索引（`createAliasIndex().lookup(外标)` ⇒ `{ provider, model: 上游真名 }`——「读面回映射」同源件，保存换表随动）；**源面行 ∥ PATCH 校验 ∥ 回合装配三处同经此解析**（别名模型 = 别名所指上游的枚举——不另退中性）；
  **零第二清单**（不落库档位词表）；**模型列表下发** = `GET /api/admin/providers` 每行 `modelReasoning`（键 = 上游真名——与 `settings`/`modelMeta` 同键空间；无档模型零键）；**缺核**（本开发机未装包——`thincoder-server/node_modules` 无 `@thincoder/core`）⇒ 空图 + 一条警告（档位面退中性；生产 = 核为声明依赖）。
- **设置路由**（口径②）：`PATCH /api/admin/agent/chats/:id` 扩为**会话设置面**——体一次一件（`{ model }` ∥ `{ reasoning }`；同携 ⇒ 400 人话）：`model` 在场 ⇒ 换模型 + **档位清 NULL**（换模型回中性——同一写）；`reasoning` 在场 ⇒ `null`（清）∥ 字面 ∈ 当刻模型枚举 ⇒ 落库，否则 400 人话；判权 = `requireAdmin` 沿用；**零审计行**（KD-SV-91 三 kind 不扩——沿 KD-SV-108）。
- **回合装配**：`runChatTurn` 起跑读行（与 `chat.model` 同点——在途回合零触；沿 KD-SV-108 口径）⇒ 行值 ∈ 当刻模型枚举 ⇒ `buildChatExit` 出口 provider 配置携 `reasoningEffort`（核 `thincoder-core/provider/core.mjs` 载荷门/枚举门/路由形守门单源消费）；**未设 ∥ 表外 ⇒ 零字段**（与今日行为逐字同）；表外 = 读侧容忍（不炸、不改行——沿核会话槽「表外串不动」先例）。
- **控制台面**（源下发消费 ∥ 钮面启用 ∥ 无档模型中性）= `webui/CHAT.md` §2.1③⑤（KD-SV-111）；**不做** = 本档 §10（逐条覆写 ∥ 状态行段）。

## 12. 工具面扩展（管理面八件——本批）

**口径**（KD-SV-90）：逐面回指控制台功能点 ∥ 进程内直取域件（零 HTTP 回环——KD-SV-82 延续）∥ 写链与路由同函数（单源）∥ 每次动作落审计行（读动作同落）∥ 无白名单围栏（KD-SV-82 口径不破）。

| 工具 | 形（动词） | 实现面（域件） | 回指（控制台面） |
|---|---|---|---|
| `members(op, …)` | `list` ∥ `create` ⟮username/name/role⟯ ∥ `reset_password` ⟮member⟯ ∥ `revoke_key` ⟮member/keyId⟯ ∥ `set_quota` ⟮member/quotas 键级合并⟯ ∥ `set_disables` ⟮member/disables 键级合并⟯ | `accounts/members.mjs`（`createMember` ∥ `setMemberPassword` ∥ `mergeMemberModelQuotas` ∥ `mergeMemberModelDisables`）∥ `accounts/keys.mjs`（`revokeKey`）∥ 重置链 = 改密 + 清计（`guard.clearUsername`——装配面注入 ∥ 与路由同效：共享助手边界 = **改密 + 清计**两件；审计写不随迁——`recordAudit` 各留调用侧既有面（路由侧 = `password_reset`（`accounts/ACCOUNTS.md` §2.1）∥ chat 侧 = 只 `chat_call` 行——KD-SV-91）） | 成员页/弹窗（功能点 15④ ∥ 23②）；端点 = `gateway/API.md` §3 |
| `providers(op, …)` | `list` ∥ `add` ⟮全字段⟯ ∥ `update` ⟮字段级（`settings` 键级合并）⟯ ∥ `remove` ⟮id⟯ ∥ `discover` ⟮baseURL/apiKey/providerId/proxy⟯ | `thincoder-server/src/gateway/provider-admin.mjs`（校验单源 `validateProviderEntry` ∥ 候选注册表 ∥ `runtime` 换表）——路由内联写链提取共享写函数（两调用点单源）；发现 = 同探针件 | Provider 页（功能点 18/AC-11；端点 = §2.2） |
| `models(op, …)` | `list` ∥ `enable` ⟮provider/model——加开放⟯ ∥ `disable` ⟮减项（退役可停）⟯ ∥ `settings` ⟮rpm/tpm/costIn/costOut/note/quotaTokens 键级合并⟯ ∥ `alias` ⟮设置/清除（含唯一性校验）⟯ ∥ **`test` ⟮provider/model/prompt?/timeoutS?——真实调用 ＋ 五读数（机制 = §12.1；model-test-tool 批）⟯** | 同上写链 + `settings` 合并件（`mergeProviderSettings`） ∥ `agent/model-test.mjs`（拟新增——模型测试执行器） | 服务模型页（功能点 17/29——A/C/D/E/F/G 面）；`test` 无控制台对位面（会话面专属——§12.1⑤） |
| `usage(op, …)` | `summary` ⟮member/model/endpoint/from/to⟯ ∥ `rows` ⟮同上 + limit ≤100⟯ | `thincoder-server/src/metering/report.mjs`（`usageSummary`）∥ `metering/usage.mjs`（`queryUsage`——与端点同过滤构建器） | 管理·用量页（功能点 15②；端点 = §3） |
| `audit(op, …)` | `query` ⟮type/member/from/to/limit⟯ | `accounts/audit.mjs`（`queryAudit`——与审计页同过滤件） | 审计页（功能点 15④——`accounts/ACCOUNTS.md` §2.1） |
| `runners(op, …)` | `list` ∥ `add` ⟮name/address——连通自检 + 落行⟯ ∥ `remove` ⟮id/containers（keep∥remove）/confirm⟯ ∥ `revoke_credential` ⟮id——主机表凭据零化 + 审计 `host_credential_revoke`；**凭据类例外**：域行 + `chat_call` 两行（KD-SV-91）⟯（`list` 行携 `ssh` 元数据——主机表；`sandbox/SANDBOX.md` §3） | `sandbox/registry.mjs`（`insertRunner` ∥ 读行）+ 删除链（容器处置 ∥ 承载确认 ∥ 工作区解绑 + 续放置——与控制台同函数同效） | 沙盒页·运行面（`webui/SANDBOX.md` §2.1①——最小切片；端点 = §2.5） |
| `docker(host, op, args?)` | 同任务面十动词（version ∥ info ∥ ps ∥ images ∥ pull ∥ create ∥ start ∥ stop ∥ rm ∥ logs）——**绑定 = 注册节点**（名 ∥ 地址经 `sandbox_runners` 查行；未在册 ⇒ 工具级错误回灌） | `sandbox/docker.mjs`（`createDockerClient`——与控制台容器面同一客户端）+ `thincoder-server/src/agent/docker-ops.mjs`（已落盘——admin-agent-chat 批；十动词执行器——两驱动单源） | 沙盒页·容器区（`webui/SANDBOX.md` §2.1①） |
| `exec(host, command, timeoutS?)` | **绑定 = 主机表行**（名 ∥ 地址——`registry.runnerByRef` 单源，与 `docker` 同判；未在册 ⇒ 工具级错误）；凭据 = 行密列（缺 ⇒ 工具级错误人话——指向主机凭据弹窗）；`timeoutS` = 正数秒数（缺省 = `SSH_COMMAND_TIMEOUT_S`——`thincoder-server/src/sandbox/ssh.mjs` 单源常量，60 s）；上界 **86 400**（24 小时；父侧 2026-10-13 裁）——越界 ⇒ 工具级错误人话「超时上限 24 小时」（回合不停 ∥ 零 ssh 调用 ∥ 库零变）；非正/非数 ⇒ 工具级错误（E61）。上界依据 = 86 400 000 ms ≪ Node 计时器量程 2 147 483 647 ms（逾量程被归 1 ms——即刻假超时）；单命令 24 h 以上超出本工具用途；结果 = `{ ok, exitCode, stdout, stderr, summary, subject }`（命令非零退出 ⇒ `ok:true`——退出码在结果内；传输级失败 ⇒ `ok:false` + 人话） | `sandbox/hosts.mjs`（已落——`execOnHost`——解密 + `sandbox/ssh.mjs` 传输 + 临时私钥用毕即删）+ `thincoder-server/src/agent/tools.mjs` `maskSecrets`（行凭据值入掩蔽面——同任务面口径） | 沙盒页·运行面（凭据弹窗录入——`gateway/API.md` §2.5 两端点）；对话页（同一弹窗件挂载） |

- **不入 chat 面**：任务面装机三件（`register`/`verify`/`report`）已随任务式退场删净（2026-10-14）；**装机（新主机）= chat 内动作**（`runners.add` 登记 + `exec` 装运行时/开监听——主机表凭据经弹窗录入；KD-SV-135）；chat 侧可读机队（`runners.list` ∥ `docker` 读数）。
- **随控制台同批长**（控制台侧未落——不发明）：节点排空/禁用 ∥ 沙盒工作区/规则/待批/设置各面工具（随沙盒余面批）。
- 工具结果形 = `{ ok, … }`（结构化；错误 ⇒ `ok:false` + 人话 message——回灌模型自纠，回合不停）。

### 12.1 模型测试（`models.test`——model-test-tool 批 · 2026-10-14；台账 #1390；功能点 55 ∥ AC-55 已入册（2026-10-14））

> 口径 = 用户 00:19「管理面会话缺一个模型测试工具，有时候需要知道模型服务的状态和性能。」＋ 00:50 两句厘定「走网关链，记账」「首字节延迟和吞吐也需要」。
> 一句话 = 对**已配渠道点名**做一次**真实调用**（经本进程网关链 loopback）并归一**五读数**——工具形 ∥ 计量 ∥ 读数 ∥ 审计 ∥ 边界五面见下。

**最近先例**（对齐 ∥ 偏离）：先例 = ① 同面动词扩展（`exec`——§12 表：值域形 ＋ 工具级错误分流）∥ ② 控制台三件诊断（向量服务探活/试跑 ∥ 代理连通测试 ∥ MCP 探活——皆自含状态、不落库不计量；需求档 §5 现状句）∥ ③ loopback 出口（§16.2——本进程网关链客户端）；对齐 = 单动词入列（名集八件不变）∥ 读数自含不落库；**偏离** = 本工具经网关链**记账并计配额/限流**（诊断三件 = 零计费）——依据 = 用户 00:50 裁「走网关链，记账」＋账只能对在网关链（全文 = §9 KD-SV-205）。

**① 工具形**（KD-SV-205——面内动词；工具名集八件不变）：
- 入参 = `models` ⟮op: `test`, provider（名 ∥ id）, model（上游名 ∥ 别名）, prompt?, timeoutS?⟯——对象 = **已配渠道点名**（解析 = `resolveProvider` ＋ `locateModel` 同源）。
- **未在开放清单 ⇒ 工具级错误**（零外呼）——草稿值不走本工具（试连草稿 = Provider 页「测试连接」面（AC-18））；message 带划界句。
- `prompt?` = 探针输入（缺省 = 内置探针句 `ping`——常量 `MODEL_TEST_PROBE_TEXT`，沿向量探针 `EMBEDDING_PROBE_TEXT` 同字面；帽 2000 字——逾 ⇒ 工具级错误人话）。
- `timeoutS?` = 探针预算（正数秒——非正/非数/越界〔>600〕 ⇒ 工具级错误人话；缺省 **60** ∥ 上界 **600**——**值域形**沿 `exec` 同面先例〔该先例上界 86 400 依据 = Node 计时器量程——与本值无涉〕；界值依据 = 设计轮定（单请求探针 10 分钟窗口——先于回合预算 20 min 收尾，超时读数可得））。
- 返回 = 结构化读数（§③）；**读数产出恒 `ok:true`**（服务坏 ≠ 工具失败——沿 `exec` 非零退出判例）；结果携 `subject`（= 对外标识——审计消费）＋ `summary`（人话一行）。判权 = 管理面 chat 全族（零新判权）。
- 落档两处：`thincoder-server/src/agent/model-test.mjs`（拟新增——执行器）∥ `thincoder-server/src/agent/chat-tools.mjs`（薄接线：动词分派 ＋ schema 描述）。

**② 计量落点（走链自动——零第二份）**：
- 通路 = 单次 `POST <selfBase>/v1/chat/completions`（`stream: true`）；出口装配**同源** = `chatProviderOf`（§16.2/§16.3——sk = 本回合发送者的 `admin-agent` 明文；谁用谁）。
- **两装配件关系**（§16.2 单源）：`chatProviderOf` = 出口 provider 描述子取件（出 `{ provider, upstream }`；两消费面 = 模型出口 ∥ 压缩垫片）——**本动词复用层**；`buildChatExit` = 出口装配（描述子 ＋ 核 `chat` 调用件；§16.2「装配」行所指）。本动词取描述子后**自持单请求**——不经核 `chat`（沿 §9 KD-SV-205 被否栏）。
- 经网关链全链（鉴权 ∥ 派发 ∥ 准入三件 ∥ 转发 ∥ 记账——逐字复用）⇒ **usage 行自动落**（member = 发送者 ∥ key = `admin-agent` ∥ endpoint = `chat`）；`stream_options.include_usage` 链侧注入（KD-SV-5）⇒ 上游 usage 原值可达。
- **TTFB/吞吐不落库**（读数 = 会话面结果——usage 表零列增 ∥ 零迁移）；测试**照常计配额/限流**（准入三件不豁免——被拒也是读数）。
- 中止 = 回合中止信号透传（`invoke` 第三参 `ctx` 通到管理族——本动词消费 `ctx.signal`；`AbortSignal.any([超时, signal])`）——中止即断开探针（沿 KD-SV-107 口径）。
- 与 KD-SV-82「进程内直取域件、零 HTTP 回环」不冲突——沿 §16.2 同判（**模型调用 = 对外契约面** ⇒ 走网关链；域件读仍进程内直取）。

**③ 读数归一（五件——逐条定义）**：
- `status`（**闭集五支**）：`ok`（2xx ＋ 流正常终结——零内容增量亦归〔空答 ⇒ `ttfbMs:null`〕）∥ `timeout`（预算耗尽——携 `phase`：`before_first_byte` ∥ `generating`）∥ `http_error`（响应非 2xx——携 `httpStatus` ＋ 原文）∥ `bad_response`（2xx 但不可用：非 SSE 形 ∥ 解析不出事件）∥ `broken_stream`（传输中断——首内容增量后携部分读数 ∥ 首内容增量前中断亦归〔零部分读数〕）。
- `error` = **原文摘录**（原样不重写；帽 500 字——逾限截断加注；有界读 8 KiB）。网关自产错误与上游透传错误**不可区分**（转发面原样透传 = 设计事实——如实一类 `http_error`，原文即据）。
- `totalMs` = 请求发出 ⇒ 流终结／失败时刻；`ttfbMs` = 请求发出 ⇒ **首个非空内容增量**（流首空壳块不计；零内容 ⇒ null）；`tps` = `usage.completion_tokens` ÷ 生成窗（首个内容增量 ⇒ 流终结；usage 缺 ⇒ null——**不估**）。
- 附 = `tokens`（上游 usage 三值原值）∥ `outputChars`（产出字符数）∥ `httpStatus`／`phase`（各按支）。读数含网关链全链耗时（loopback 一跳 ＋ 网关处理——端到端如实，不拆分归因）。
- **键在场形**（逐支——不适用 ⇒ 缺席〔键不落〕；有源缺值 ⇒ null）：恒在 = `ok`／`status`／`model`／`totalMs`／`outputChars`（零产出 = 0）；`ttfbMs`——无首内容增量 ⇒ null（含空答）；`tps`／`tokens`——usage 缺 ⇒ null（不估）；条件键 = `httpStatus` 仅 `http_error` ∥ `phase` 仅 `timeout` ∥ `error` 仅 `http_error`／`bad_response`（原文摘录）；余支缺席。
- **确定性**（机检）：`totalMs`／`ttfbMs`／`tps` 分母窗以**注入钟**读时（`now()` 注入口——沿 §14.1 取值源①）；假 fetch 按注入时刻吐 SSE 帧 ⇒ 用例**逐值相等**断言（零容差窗）。

**④ 审计** = 既有 `chat_call`（逐调用一行——tool = `models` ∥ `subject` = 对外标识 ∥ `call` = 入参串；成败沿既有口径）：**零新 kind/型**（KD-SV-91 三 kind 不扩 ∥ 审计型面十七型不扩）；读数为结果面（tool 行 ＋ `result` 帧），审计零新字段；测试非纯读（耗真 token）但沿「读动作同落行」口径——零双记、零域行。

**⑤ 边界（不做）**：草稿值试连（= AC-18 面）∥ 控制台页/钮（无 UI 对位面——会话面专属；如要另裁）∥ 成员面（不入成员面工具面）∥ 批量/全量巡检（未裁不加）∥ 新端点/新契约（复用 `/v1/chat/completions`）。
机检口径 = §7 本批行；用例 = §8（N84 ∥ B80 ∥ E62）；单元测试档 = `docs/batches/2026-10-14-model-test-tool.test.mjs`（拟新增；不入任何门）。

## 13. 上抛/余项（本域——自板档 §9 迁入；R54 逐字；as-of 2026-10-11）

> 板档 `design/PROJECT.md` §9 同类行 = 保位 stub（指向本节）。

| # | 项 | 类型 | 处置建议 |
|---|---|---|---|
| R54 | **admin-agent-chat 批（本批）——需求档回笔 + 随正件 + 披露**：① 需求档回笔（主 agent 笔——§5「两个 chat 界面」②④ 的落点与 AC）：§2 增**功能点 37（管理面 chat——草案：会话/回合模型 ∥ 流式通路 ∥ 工具面（草案七件——**落定八件**：`exec` 入列，`agent/ADMIN-AGENT.md` §9 KD-SV-136） ∥ 审计型 ∥ 不做单）** + **AC-37 行**（判据 = §7 本批行——机制/端点/控制台/存储/审计五面指针）+ 标题计数随正 + 变更记录 ∥ AC-28 审计型数随正（十二 ⇒ **十三型**——`agent_event`）∥ AC-12/AC-14 管理项数 8 ⇒ **9** + 静态档目 31∥32 ⇒ **32∥33**（余面批 ⇒ 34∥35）∥ §5 成员面 chat 归属句随正（**#1215**——2026-10-10 16:04 裁）∥ ② 随正件（父侧落——实施轮同拍）：`views-audit` 型面数断言件 ∥ nav 计数件（管理 8 ⇒ **9**）∥ 档目断言件（`views-chat.mjs` 入列表——31∥32 ⇒ **32∥33**）∥ 门禁件数断言件（42 ⇒ **45**——本批三件入链；以实施当刻盘面实读为准）+ `thincoder-server/package.json`（同基数；逐件登记 = §6 注⑲）∥ ③ 披露（不阻塞）：chat 不收 SSH 凭据（装机 = 任务式弹窗——KD-SV-84 不破）**〔2026-10-14 收正：任务式弹窗随退场删净——装机/主机运维 = 管理面 chat 内动作（`exec`/`docker`/`runners` + 主机表凭据）；承接 = `sandbox/SANDBOX.md` §16 R87〕**∥ 会话无删除/重命名/清理（保留口径未裁——不设清零）∥ 回合无中途中止钮（预算封顶）∥ 破坏性动作「先说明后执行」= 提示词级纪律（机制级确认门未做——如要另裁）∥ 节点排空/禁用工具 = 随控制台同批长（未落——不发明）∥ 跨会话并发未设限（未裁）∥ ④ 部署收尾（父侧执行）：镜像重建 + 重收敛 + 浏览器实走（建会话 ⇒ 发一条 ⇒ 帧流 ⇒ 工具调用行 ⇒ 刷新重读） | 披露（上抛——如无异议按设计实施；部署收口 = 父侧） | 评审/用户复核 |
| R60 | **chat-shell-align 批（本批）——需求档回笔 + 随正件 + 披露 + 部署**：① 需求档回笔（主 agent 笔）——**已闭合**（2026-10-11：功能点 41 ∥ AC-41 入册——`docs/server/requirements/PROJECT.md` :225/:230；该档变更记录 :565「R60① 闭合」） ∥ ② 随正件（父侧/实施轮——以当刻盘面实读为准）：`2026-10-11-admin-agent-chat-ui.test.mjs` 静态面用例上量（档目链单源 = `webui/WEBUI.md` §1；现读 **397** 行——2026-10-13 父侧现读，内容行口径；净变预算 ≤±50）+ 类名闭合用例 ∥ `2026-10-11-console-chat-align.test.mjs` 两用例收正——取件面白名单用例（本批新取件增列 `thincoder-render-core/flow/block.mjs` ∥ `thincoder-render-core/composer/panel.mjs`）∥ 「零 composer/reasoning 引用」口径（现读 **395** 行——2026-10-13 父侧现读；净变预算 ≤±20；**本体零触**——用例收正随实施轮）∥ `style.css`（五钮隐藏 + 别名块——`webui/STYLE.md`）∥ `views-chat.mjs` 拆档（新档入链）∥ 门禁件数断言（本批单元测试档）∥ `i18n-{zh,en}-admin` 行账（`webui/ADMIN.md` §3）∥ ③ 披露（不阻塞）：**R54 ③ 两项交付失效**（回合中止钮 ⇒ 已交付 = KD-SV-107 ∥ 会话内换模型 ⇒ 已交付 = KD-SV-108）∥ 图片随行存 dataURL（≤15MB/图 ∥ 30MB/回合——核阀单源；详情仅 `imageCount`）∥ 无源钮隐藏五枚（模式位/设置——无源实证；推理钮 ⇒ 已交付 = KD-SV-111）∥ `interrupt` 折法（中止 + 入队首——无注入通道）∥ 换模型零审计行（三 kind 不扩）∥ ④ 部署收尾（父侧）：镜像重建 + ECS 浏览器实走（四轴走查清单 = 批档 §2） | 披露（上抛——如无异议按设计实施；部署收口 = 父侧） | 评审/用户复核 |
| R61 | **console-reasoning-levels 批——披露 + 随正件 + 部署**：① 随正件（父侧/实施轮——以当刻盘面实读为准）：结构版本断言 **11 件**（设计轮枚举——**实盘收正 20 件**：+ `-console-modals` ∥ `-embedding-decouple` ∥ `-console-list-style` ∥ `-server-auto-update` ∥ `-console-layout` ∥ `-me-usage-charts` ∥ `-model-alias` ∥ `-runner-admin-console` ∥ `-runner-admin-console-agent` 九件——逐行坐标见批档 §5 ④；各一行 `SCHEMA_VERSION === 15` ⇒ `16`——数字就地收正 ⇒ 逐件行数 ±0；逐件现读：`…-server-gateway.test.mjs`（**495 行**——`:167`） ∥ `…-console-completeness-2`（**504 行**——`:152`） ∥ `…-me-keys-redo`（**370 行**——`:120`） ∥ `…-provider-model-metadata`（**494 行**——`:151`） ∥ `…-quota-per-model`（**447 行**——`:150`） ∥ `…-quota-v2-member-models`（**740 行**——`:167`） ∥ `…-server-console-config`（**795 行**——`:383`） ∥ `…-server-gemini-openai-preset`（**735 行**——`:263`） ∥ `…-team-login-client-access`（**305 行**——`:284`） ∥ `…-admin-agent-chat`（**716 行**——`:638`） ∥ `…-sandbox-image-sources`（**685 行**——`:599`））∥ `…-chat-shell-align.test.mjs:791`（隐藏用例六 id ⇒ 五 id）+ `:807`（零悬停扫描名单）∥ `…-admin-agent-chat.test.mjs:640`（`agent_chats` 列面五列 ⇒ 六列——`ORDER BY cid` 尾插）∥ 门禁件数（**56 ⇒ 57**——本批单元测试档入链）∥ ② 披露（不阻塞）：**开发机无 `@thincoder/core`** ⇒ 档位面退中性（`modelReasoning = {}` + 警告一条；生产镜像内核为声明依赖——若真缺核 ⇒ admin chat 回合本就不可用，同源失败、非本批引入）∥ **路由形模型名**（含 `/`）：核载荷门静默不发 `reasoning_effort`（VSC/桌面同态）——服务端/控制台不另立过滤（只读消费核单源）∥ 档位面零审计行（三 kind 不扩——沿 KD-SV-108）∥ `views-chat.mjs` 本批后 ≈498 ⇒ **实 500**（恰贴 500 软线；硬限 800 未越——拆档预案在案）∥ ③ 部署收尾（父侧）：镜像重建 + 浏览器实走（选档/换模型/切会话三径——批档 §2） | 披露（上抛——如无异议按设计实施；部署收口 = 父侧） | 评审/用户复核 |

| R62 | **admin-agent-awareness 批（本批）——需求档回笔 + 随正件 + 披露 + 部署收尾**：① 需求档回笔（主 agent 笔——**父侧已受理**：功能点 43③「（在线数）」与 43⑤ `process`「（看服务器进程——只读）」两括注收正——本设计轮上抛两条经父侧 2026-10-12 裁「均按设计倾向」；+ **43 边界句收正**——「环境行 `cwd:` 字段与 43⑤ 工作目录口径」入册（不做 = git 上下文 ∥ 项目档注入 ∥ 同目录实例〔三项以「cwd 锚定的项目」为前提〕；**cwd 本身在册**——②行 `cwd:` 字段 + ⑤工作目录限幅）——**经父侧 2026-10-12 裁**；落点 = `docs/server/requirements/PROJECT.md:250`）∥ ② 随正件（父侧落——实施轮同拍，以当刻盘面实读为准）：门禁件数断言件七件（**57 ⇒ 58**——本批单元测试档入链；注释/断言消息同拍）+ `thincoder-server/package.json`（`prepublishOnly` **57 ⇒ 58**——本批单元测试档入链；单行清单行数零变）；i18n 键集断言（system 两表 **+3 键/表**——等量 ⇒ 「键集相等」断言不破；如有计数断言 ⇒ 随正；以实施当刻盘面为准）；档目断言件 **±0**（零新档）；审计型面断言 **±0**（零新型/零新 kind）；旧断言件核（预计零——`chat-tools` 面零改：环境族 = 新档 `chat-env-tools.mjs`；待实施实读为界）∥ ③ 披露（不阻塞）：**核可达性结论 = §14.5**（依赖声明 ∥ registry 实核 0.10.4 ∥ 镜像两装径同经 npm 解析——前提 = 装机时 registry 可达，不可达 ⇒ 拒启 fail-loud）∥ **无路径围栏 ∥ 无命令白名单**（任一 admin 成员可经对话页在服务器跑命令/读文件——含密钥与库文件面；需求 43 风险在册）∥ **读文件内容不在掩蔽面内**（掩蔽只盖本轮入参敏感值；配置档内 apiKey 等可被读出——权限模型归用户）∥ `process.kill` 在册（含**杀 server 自身进程 = 操作者自伤面**——与 bash 等价）∥ `timer` 空闲唤醒在册（§15.1——到点空闲自唤醒一轮）∥ `bash` 非零退出不映射 `ok:false`（退出码在输出文本内——不解析）∥ 模型可见输出 ≤4000 字（`CHAT_TOOL_CONTENT_MAX`——读大文件用 offset/limit ∥ grep ∥ bash `filter` 收窄）∥ 核 `tool-docs/*.md` 指向本面不存在工具的指引（write/edit/git/repo_outline 族）落空——本批不改核文案（提示词单源；要改 = 主 agent 面另裁）∥ `chat.mjs` 越 500 软线续存（拆档预案 = §6）∥ ④ 部署收尾（父侧执行）：镜像重建 + 重收敛 + 浏览器实走（问「现在几点」「你管着几个节点」各一 + 时间工具一次调用 + 审计页看一行 `chat_call`——命令原文/路径可见） | 披露（上抛——如无异议按设计实施；部署收口 = 父侧） | 评审/用户复核 |
| R71 | **server-wake-face 批（本批）——需求档回笔建议 ＋ 开放点 ＋ 随正件 ＋ 披露 ＋ 部署收尾**：① 需求档回笔（主 agent 笔）——**已闭合**（主 agent 2026-10-12 15:4x 落笔：功能点 46 ∥ AC-46 在册；条目 ③④ 两件另落 = 功能点 43⑤ 扩（`read_history`） ∥ 功能点 46⑤ ∥ AC-46⑥——见批档 §1.3/§1.4；**修订轮续**：本档 §16 与上述同拍，三条链在册）∥ ② **开放点四条**（§15.3——身份与审计行 ∥ 消息形与呈现 ∥ 计费与制动 ∥ 防自激；**均附推荐与代价，请裁**；② 含控制台呈现面与唤醒开关两项新 UI 面，前置 = `views-chat.mjs` 拆分审查〔台账 #1309〕）∥ ③ 随正件（父侧落——实施轮同拍，以当刻盘面实读为准）：门禁件数断言**七件**（`docs/batches/2026-10-06-server-auto-update.test.mjs:480` ∥ `docs/batches/2026-10-06-console-list-style.test.mjs:252` ∥ `docs/batches/2026-10-07-console-layout.test.mjs:456` ∥ `docs/batches/2026-10-07-me-usage-charts.test.mjs:262` ∥ `docs/batches/2026-10-07-provider-model-metadata.test.mjs:491` ∥ `docs/batches/2026-10-07-quota-per-model.test.mjs:444` ∥ `docs/batches/2026-10-07-quota-v2-member-models.test.mjs:428`——七处皆 `assert.equal(batchFiles.length, 58, …)`；`prepublishOnly` **58 ⇒ 59**，注释/断言消息同拍） + `thincoder-server/package.json`（待补本批单元测试档入链）∥ 旧批单元测试档随正三处（`docs/batches/2026-10-12-admin-agent-awareness.test.mjs`：`:265-286`（timer 行「零落库」断言 ⇒ 落库口径）· `:323-325`（`async` 拒断言 ⇒ 回执断言）· `:353-355`/`:375`（同））＋ 修订轮追加：`docs/batches/2026-10-12-admin-agent-awareness.test.mjs:304-318`（用例④ 七件名单/计数/族覆盖 ⇒ 八件·六族）∥ `docs/batches/2026-10-11-admin-agent-chat.test.mjs:470-486`（⑧ 出口缺位用例——实现键由 provider 名 ⇒ `admin-agent` sk 明文；断言式修）∥ **③ 作废（2026-10-13）**：`prepublishOnly` 链已撤除（用户裁——批内件不入发布门）⇒ ③ 门禁计数句前提失效、无随正义务 ∥ ④ 披露（不阻塞）：**后台任务日志落在核 config 目录**（`<HOME>/.thincoder/tool-results/`——非 server 数据目录，运维面知悉；日志名 = `<时间戳>-bash-<id>.log`）∥ **跨回合在途任务不随后续回合中止而杀**（其控制器链在起跑回合的信号——三端为会话级 Stop，服务面无该物 ⇒ §15.2「无对应物」行）∥ 唤醒回合耗真 token（**修订轮改写**：经网关链计入本回合发送者 × `admin-agent`（缺位 ⇒ 会话 owner——2026-10-13 收正）——§16.2/§16.3；原「不计成员用量」口径作废——用户 15:44 裁）∥ **修订轮追加**：管理会话经本机环回 ⇒ 核规格面以外标为键（同四端客户端既态——§16.2 差异三条）∥ sk 明文落库（`api_keys.key_plain`——服务端即消费方）∥ 轮转连带吊销 sk（下次登录补发）∥ 唤醒回合的提醒行以 `user` 行落库（若不另作呈现面，控制台以用户消息样式显一——内容自带 `[System reminder: …]` 前缀，不误导语义）∥ ⑤ 部署收尾（父侧执行）：镜像重建 + 重收敛 + 实走（设 1 分钟 timer ⇒ 不动页面 ⇒ 到点回来看见提醒行与助手回复；`bash async` 一条长命令 ⇒ 回合结束 ⇒ 回来见摘要行）∥ **修订轮追加**：管理登录 ⇒ key 列表见 `admin-agent` ∥ 发一轮 ⇒ 用量面见账（归因 = admin-agent）∥ 问一句历史 ⇒ `read_history` 出条目∥ ⑥ **修订轮未随正清单**（父侧接续）：`gateway/API.md` §2.1 补内环消费方句（管理面 chat = 本面客户端、loopback——B2 修复轮 #283 占用中，未动）∥ 需求档 `docs/server/requirements/PROJECT.md:641` 坐标全限定（`thincoder-server/src/agent/chat.mjs:367-390`——doc-check 悬空 26 之一）∥ **任务式（run）出口同形缺口——已撤回**（admin-chat-creds-merge 批：run 退场路线在册——用户裁「将来并入 chat」⇒ 不再对 run 改道；`sandbox/SANDBOX.md` §3 KD-SV-135） | 披露（上抛——如无异议按设计实施；部署收口 = 父侧） | 评审/用户复核 |

| R73 | **server-core-unification 批（本批）——开放点 ＋ 需求档回笔建议 ＋ 随正件 ＋ 披露**：① **开放点三条**（§17.4——环体取核〔含宿主缝设计草案，供配套核批〕∥ 提示词场景槽 ∥ 会话面；均附路径与触发）∥ ② 需求档回笔建议（主 agent 笔）：§5 已裁口径（`:601`）补落地形句（件级取核 ∥ 环体自持 ∥ 核缝承接——设计 = 本档 §17）——是否入册 = 主 agent 择 ∥ ③ 随正件：`thincoder-server/README.md:13`「零依赖 ⇒ 装机无 install 步」句已失效（实读依赖两包——registry 核 ＋ `file:` 渲染核）——产品文案随正（实施轮 ∥ 发布面轮）∥ ④ 披露：环体自持 = 目标态未闭（配套核批承接）；压缩改写会话历史视图（标记行形——原行原文留存；控制台详情随观） | 披露（上抛——如无异议按设计实施；配套核批承接环体） | 评审/用户复核 |
| R86 | **server-mcp 批（本批）——agent 域面**：chat 工具面并 MCP 面（文本面路由 ∥ ctx 透传 ∥ 失败冷却）∥ `thincoder-server/src/agent/run.mjs:22` `TRIMMED_FACES` 收正（删 `"mcp"`）∥ 任务面维持不挂载；**全文 = `mcp/MCP.md` §12**（需求档回笔建议 ∥ 随正件 ∥ 披露 ∥ 待裁点 ∥ 部署收尾） | 披露（上抛——如无异议按设计实施） | 评审/用户复核 |

| R87 | **model-test-tool 批（本批）——需求档回笔 ＋ 随正件 ＋ 披露 ＋ 部署收尾**：① 需求档回笔（主 agent 笔）——**已入册（2026-10-14）**：功能点 55 = `docs/server/requirements/PROJECT.md` §2（`:372–379`）∥ AC-55 = 验收表（`:446`）∥ §5 行（`:550–552`）；AC-12/AC-28 链零动（无控制台页 ∥ 零新审计型）∥ ② 随正件（父侧落——实施轮同拍）：**零**（无门禁链——2026-10-12 裁；档目/计数件零涉——零新档 ∥ 零新端点 ∥ i18n 零涉）；单元测试档 1 档（`docs/batches/2026-10-14-model-test-tool.test.mjs`（拟新增）——随批留存、不入任何门）∥ ③ 披露（不阻塞）：测试耗真 token（计入发送者用量 × `admin-agent`——用户 00:50「记账」口径）∥ 读数含网关链全链耗时（loopback 一跳 ＋ 网关处理——如实，不复算分拆）∥ 网关自产错误与上游透传错误不可区分（如实一类 `http_error`——转发面「原样透传」设计事实）∥ `models.test` 无控制台对位面（回指口径例外——会话面专属）∥ SSE 流形假设（OpenAI 兼容——上游非 SSE 2xx ⇒ `bad_response`）∥ ④ 部署收尾（父侧执行）：镜像重建 ＋ 重收敛 ＋ 会话实走（点名一个已配模型 ⇒ `test` ⇒ 四读数在场 ⇒ 用量面见一行） | 披露（上抛——如无异议按设计实施；部署收口 = 父侧） | 评审/用户复核 |

## 14. 环境感知与环境工具面（admin-agent-awareness 批——2026-10-12；功能点 43 ∥ AC-43 ①–⑥）

> 口径 = 用户 2026-10-12 12:29「管理面的agent现在没有环境感知能力，我希望这一块要对齐cli/vsc和桌面。」+ 12:39（工具面）∥ 12:41（读文件族 + `bash`）∥ 12:47（审计 + 权限归用户）三句；单源 = 需求 `docs/server/requirements/PROJECT.md` §2 功能点 43。

### 14.1 四块装配（时空 ∥ 所在/身份 ∥ 所管现况一行 ∥ 能力与边界）

- **装配形**：每回合（= 每请求）在 `runChatTurn` 起跑段造**三活体行**（+ timer 到期行），**尾插**于历史与本轮消息之后（沿核 `thincoder-core/agent/setup.mjs:176-185` 理由：秒级新值不进前缀——缓存保持命中）；**瞬态不落库**（不进 `agent_chat_messages`、不进回放——值随实况的直接后果；校验 = 回放逐字零含实况行）。
- 三四块逐字形（`chat-env.mjs` 造；`[System reminder: ` 族前缀 = 三端同形标记）：

| 块 | 行形（本面——`{}` = 取值点） | 三端同源坐标（功能点 43 ④——逐块） |
|---|---|---|
| ① 时空 | `[System reminder: current time is {本地时间 sv-SE} (local; timezone {IANA 时区})].` | `thincoder-core/agent/setup.mjs:181-185`（每回合 time reminder——三端同调同核件） |
| ② 所在/身份 | `[System reminder: env: thincoder-server {版本}（{部署身份}）∥ host: {主机名} ∥ platform: {平台} {架构} ∥ node: {版本} ∥ pid: {pid} ∥ cwd: {工作目录} ∥ model: {会话模型} ∥ reasoning: {档位 ∥ 未设}].` | `thincoder-core/agent/setup-reminders.mjs:40-42`（env 行——端名/模型/槽；同族 = `pushEnvStateReminder`） |
| ③ 所管现况一行 | `[System reminder: 管理面现况：注册节点 {N}（active {A} ∥ disabled {D}）∥ 服务模型 {K} ∥ 成员 {M}].` | `thincoder-core/agent/setup-reminders.mjs:152`（`pushManifestStateReminder`——会话所操作对象的现况**单活体行**：值随实况 ∥ 读败保守） |
| ④ 能力与边界 | 系统简报静态段 `CHAT_LIMITS_BLOCK`（工具族清单 ∥ 限额 ∥ 边界——四块之一）+ 活体面 = 当回合 `tools.schemas`（能力清单的真体现） | `thincoder-core/prompts/`（人格/纪律槽——三端能力与边界 = 系统提示词面；本面 = 系统简报） |

- **取值源**：① `now()`（注入面）；② `process`/`os` 直读 + 版本 = `readPackageVersion()`（`thincoder-server/src/ops/update.mjs:46`——版本单源）；
  **部署身份** = 容器（`/.dockerenv` ∨ `/run/.containerenv` 在场）∥ systemd 服务（`INVOCATION_ID` 非空）∥ 独立进程（其余）——判据明列；三判据读取异常 ⇒ 按「独立进程」落值（探针非抛——②行无字段级略去，降级唯块级）；
  ③ 域件进程内直取（`listRunners` ∥ `modelEntriesOf(listProviderEntries(db))` ∥ `listMembers`——每回合三读，读数级）。
- **③ 在线性读面**（父侧 2026-10-12 裁）：v12 已撤心跳（`sandbox_runners.status` = active/disabled；「在线」只能读时逐节点探活——`thincoder-server/src/sandbox/routes.mjs:128-145` 每节点现打 `/info` 3s）
  ⇒ 不便宜且慢节点会误读离线 ⇒ 本行取**注册态分布**；**在线性/容器数走工具按需探**（`runners.list` / `docker version`——需求同句「明细仍走工具」）。
- **降级（需求 43② 字面）**：块级——该块任一读失败 ⇒ **整行略去**（无半真值上屏），其余行照常、回合不阻断（不抛、不 notice）。
- **timer 到期行**：随三行同落（行文 = 核件单源 `[System reminder: ⏰ timer — {消息}]`）——见 §14.4。
- **不做对位**：git 上下文 ∥ 项目档注入 ∥ 同目录实例（三端有、服务端无对应物——需求 43 边界句；三项以「cwd 锚定的项目」为前提）；**cwd 本身在册**（②行 `cwd:` 字段 + §14.3 工作目录限幅）。

### 14.2 环境工具面（六族八件——核件复用）

| 族 | 件 | 核件（单源） |
|---|---|---|
| 时间 | `get_current_time` | `@thincoder/core/tools/ops.mjs`（`getCurrentTimeTool`——`:140`） |
| 进程 | `process`（list ∥ kill） | 同件（`processTool`——`:51`） |
| 提醒 | `timer` | `@thincoder/core/agent-tools/timer.mjs`（`timerTool`） |
| 文件读取族 | `ls` ∥ `read` ∥ `grep` | `@thincoder/core/tools/search.mjs`（`lsTool` ∥ `grepTool`） ∥ `tools/file.mjs`（`readTool`） |
| 命令 | `bash`（限幅 = §14.3） | `@thincoder/core/tools/bash.mjs`（`bashTool`） |
| 会话（修订轮） | `read_history`（本会话——§16.1） | `@thincoder/core/agent-tools/read-history.mjs`（`readHistoryTool`） |

- **复用口径**（KD-SV-113）：实现 ∥ schema ∥ 描述三面同源——核工具对象**原文直用**（`execute(args, ctx)`），本面只做 `ctx` 适配与结果归一；**不收窄 schema**（端池参数运行期处置）。
- **载入**：动载（`loadCoreEnvTools()`——沿 `loadCoreChat` 先例）；单元测试档经 `coreTools` 注入口（真件亦可——**仓内核直引**：`thincoder-core/tools/*.mjs` ∥ `thincoder-core/agent-tools/*.mjs`——`DESC()` 经 `prompt-files.mjs` 按模块自身位置解析，仓内 `tool-docs/` 在场 ⇒ 开发机可用真件）。
- **ctx 适配**：`cwd` = `deps.cwd ?? process.cwd()`（相对路径基准——无围栏）；`signal` = 当回合中止信号（透传 ⇒ bash 树杀、模型调用中断同源）；`agent` = timer 垫片（§14.4）；`depth: 0`。
- **结果归一**：`{ ok, subject, summary, output }`——`ok` = 调用完成（未抛错；命令非零退出 ⇒ `ok:true`，退出码在输出文本内 `(exit code N)`——不解析，KD-SV-113 被否栏）；
  `output` = 核件文本原文（模型可见形经会话面 ≤4000 字截断——KD-SV-89 单源）；`subject` = 主语原文（审计数据源——§14.4）；
  `summary` = 人话单行（bash ⇒ 核件结果末行状态行；`get_current_time` ⇒ 首行 `Date:`；`timer` ⇒ 核件返回句；余 = 「工具名 + 主语」）。
- **端池参数处置**（server-wake-face 批——`bash.async` 在册，§15.1）：`bash.async:true` ⇒ 核件异步径（回执即工具结果；池/帽/结算全在核）；`process.kill` 的 `id` 靶 = 后台任务杀点（核 `killBgTask`——杀树 + 出池 + 墓碑；未知/已完成 ⇒ 核件人话）；
  `process.kill` 的 `pid` 靶**在册**（与 bash 等价——含杀 server 自身进程的操作者自伤面；R62②披露）；`timeout` 取值校验见 §14.3；
  **修订轮**：`read_history` 的 `path` 非空（文件路径 ∥ `cwd:<dir>` ∥ `all`）⇒ 工具级错误人话（本会话作用域——§16.1）。
- **描述面**：核 `tool-docs/*.md` 原文（三端同文）；其中指向本面不存在工具的指引（write/edit/git/repo_outline 族）落空 = 核文案面发现项（R62③——本批不改）。

### 14.3 限幅在册（`bash` 三件——需求 43⑤）

| 限 | 值 | 依据 |
|---|---|---|
| 超时 | 缺省 120_000 ms ∥ **无上限**（可指定任意 ≥1 的值；上界 = Node 计时器量程 2147483647 ms——逾之会被归 1 ms 立即触发，故显式拒；非有限值/小于 1 ⇒ 工具级错误——零静默） | 缺省 = 核 `BASH_TIMEOUT_MS`（`thincoder-core/tools/shared.mjs:26`）；自造 600s 顶 = **用户 2026-10-12 15:00 裁撤**（核件本无上限——`bash.mjs:285` 直传；`process` 列表/杀 + 中止杀树在册 ⇒ 跑飞可杀）——父侧机械落笔；上界句 = 评审 #275 🔵 收 |
| 输出上限 | 三层：工具层 200_000 字（核 `truncate`）+ 每流 2_000_000 字节缓冲（核 `MAX_STREAM_BUF`——`thincoder-core/tools/bash.mjs:15`）⇒ 落库/模型可见 ≤4_000 字（`CHAT_TOOL_CONTENT_MAX`——KD-SV-89 单源）⇒ 帧与审计摘要 ≤300 字 | 全为核件/会话面既有常量——零新口径 |
| 工作目录 | `deps.cwd ?? process.cwd()`（相对路径解析基准；**无路径围栏**——沿核「无边界断言」口径） | 需求 43⑤ 三限之一；围栏 = 权限模型面（12:47 归用户——§10 边界） |

### 14.4 审计与 timer 投递

- **审计（需求 43⑥——KD-SV-114）**：每次调用一 `agent_event`/`chat_call` 行（面不扩——KD-SV-91）；`detail` 增 `subject`（命令原文/路径——≤2000 字，逾限截断并注记；**落库前与 `call` 同链过会话面掩蔽**——「原文」= 未经摘要重写的完整命令，非免掩蔽）∥ `truncated`（结果可见形截断位）；成败 = 既有 `resultCode`。
  审计页 `views-audit.mjs` 增 **agent 行详情模板**（tool · subject · 成败 ·〔截断〕· summary——非裸 JSON）+ 三文案键（`audit.agentOk`/`agentFail`/`agentTruncated`——两表同步）。
- **timer/后台任务投递面**（机制全文 = §15——本行只留指针）：进程内按会话挂垫片（零持久化——重启天然空，与核 `_pendingTimers` 同判）；**到期件与后台任务结算皆经汇面落库投递**（`user` 行 + `data.kind="reminder"`——随历史进上下文）；**到点空闲即自唤醒一轮**（唤醒器 = §15.1；屏障 = 会话行 `status`）；不落库面 = 环境三活体行（§14.1）。
- **秘密面**：掩蔽口径沿会话面（入参敏感键 ∥ 本轮已见敏感值）；**文件内容不在掩蔽面内**（读文件/命令输出可含凭据——如实披露，R62②）。

### 14.5 核可达性（生产镜像——核实结论）

- 依赖声明在案（`thincoder-server/package.json:16` `@thincoder/core: ^0.10.4`）；registry 实核 = 该包在 npm 上（本设计轮 `npm view @thincoder/core version` ⇒ **0.10.4**，与仓内核版本一致）；包白名单含 `tools/` ∥ `agent-tools/` ∥ `tool-docs/`（`files` 面）+ `exports: { "./*": "./*" }` ⇒ 子路径直引可达。
- 镜像两装径同经 npm 解析该依赖：构建期（`thincoder-server/Dockerfile:25` `npm i -g ./thincoder-server/*.tgz …`）∥ 运行期（`thincoder-server/deploy/converge.mjs:79-90` `installVersion`——`npm i -g @thincoder/server@<target>`）——registry 不可达 ⇒ 装机失败 ⇒ 拒启（fail-loud，非静默）。**结论：核在镜像内可达**（前提 = 装机时 registry 可达）。
- 开发机（本仓 checkout）未装核 ⇒ 本面全族走动载 + 注入口（生产走真件；单元测试档走注入——真件亦可经仓内直引）。

## 15. 唤醒与投递面（server-wake-face 批——2026-10-12；台账 #1317 ∥ #1319）

> 口径 = 用户 2026-10-12 14:57「为啥给主agent bash的时候还加那么多限制，连异步都不支持？」+ 14:58「我说的就是异步啊！」⇒ 15:00「有process在，跑死了可以杀的，你没事加那么多限制干嘛！」⇒ 15:06「定时器server能用吗」+ 15:07「为啥要有这些差异？我真服了。」。
> **定性**（批档 §1.1——非新裁）= 跨端用户可闻差异 = 缺陷（唯一例外 = 宿主能力限制）；服务端常驻进程做调度不构成例外 ⇒ 本批 = **消差异**，不是加特性。
> 兄弟批接缝（周期/绝对时刻式样 = `docs/batches/2026-10-12-timer-completeness.md`）：其 §1 明写「不动唤醒器设计（归兄弟批）」——本 §15 的接口面（§15.1）即其引用面；低费式（只出提醒行、不开轮）若被采纳，本面已把「投递」与「开轮」两步分开，可分叉。

### 15.1 机制（一器两源 ＋ 投递汇 ＋ 唤醒回合）

- **唤醒器** = 新档 `thincoder-server/src/agent/chat-wake.mjs`（已落盘——实读 141 行；装配点 = `registerChatRoutes`——生产路径）。
  - **闩** = 核件复用 `createTimerWatch`（`thincoder-core/agent/timers.mjs:79`）：**会话键面表**（一会话一闩——同桌面 `thincoder-desktop/src/main/suspension-timers.mjs` 键面表形）+ `getAgent: () => pad`（活读、不捕获对象）+ `unref`（进程不因闩保活）。**零轮询**（无 `setInterval`、无秒级 tick）。
  - **两源**：① **到期** = 闩到点回调；② **结算** = 池结算尾唤醒面 `pad._asyncWaiters` 钩子（核 `wakeAsyncWaiters`（`agent-tools/async-settle.mjs:324`）splice 一次性消费 ⇒ 钩子**先自再武装、再评估**）。
  - **评估** = 核火策略复用 `fireTimerWake`（`timers.mjs:102`）：`busy: chatRowOr404(db, chatId).status === "running"`（**空闲判定单源 = 会话行 `status`**——与在途门/`claimChatTurn` 同判；不设进程内忙旗）
    ∥ `deliver: () => hasPendingDelivery(pad, now)`（**纯判据**：到期 timer ∨ `_pendingAsyncResults` 非空 ∨ 汇面留件——**零交付零开轮**）
    ∥ `openTurn: () => runChatWakeTurn(...)`。撞忙/零件 ⇒ 核返 `false`（零动作）⇒ 链尾再武装。
  - **再武装三链尾**：① 用户回合结束（`chat-routes.mjs` 回合尾）∥ ② 唤醒回合结束（唤醒器自持）∥ ③ 结算钩子。**已到期不武装 0ms 闩**（`pendingTimerDeadline(pad) <= now()` ⇒ 撤旧闩，交链尾/钩子消化——防自旋与惊群）。
- **投递汇** = `pad.history`（核三注入器唯一落点：timer 行 `injectTimerReminders` ∥ 后台摘要 `injectBgResult` ∥ 中止丢弃提醒 `async-discard.mjs:121`）——`deliverPending(chatId, { db, now, log, coreTools })`：
  ① timer 面出列（核 `deliverExpiredTimers`——幂等、零在途早退）；② 池在途结算逐件注入（核 `injectBgResult`——消费即墓碑；异常 role ⇒ 出列 + 墓碑 + 一条警告，防死循环）；③ 汇面逐行**落库**（`role: "user"` + `data: { kind: "reminder" }`）。
  **送达行入会话记录**——回放 ⇒ 模型在后续回合仍可见（依据 = VSC 端同判：`thincoder-vscode/src/extension/timer-watch.mjs:11-12`「不落盘 = 下一次 run 读不到 = 静默丢」）；落库失败 ⇒ 该行留汇、下次重试（零静默丢）。出 = 本次落库行数。
- **唤醒回合** = `chat.mjs` 内 `runChatWakeTurn({ db, chatId, source, deps, now, log })`（与用户回合**同环同面**——零第二套环）：
  - **无路由、无帧面**（`emit = null`——控制台页不订阅、帧无人消费；落库单源，用户下次读取即见）；
  - 起跑 = `claimChatTurn`（撞忙 ⇒ `{ status: "skipped" }`——不抛不炸）；**投递先于装配**（`deliverPending` ⇒ 行随历史进上下文，**零二次注入**）；交付 0 件 ⇒ 早退 `skipped`（零空转消费）；
  - **域文本** = 核常量（timer 源 ⇒ `TIMER_TURN_DOMAIN`（`thincoder-core/agent/helpers.mjs:469`）∥ 结算源 ⇒ `AUTO_TURN_DIGEST_DOMAIN`（`:477`））——**瞬态尾插**（不落库——沿 §14.1 口径；文案单源 = 核）；
  - 用户回合起跑同样调 `deliverPending`（**回合边界兜底**：唤醒被跳过/失败时件仍在下一回合送达——§14.4 既有口径不回退）。
- **异步面**（`bash.async`）：`chat-env-tools.mjs:137-142` 的 async 拒**删除** ⇒ 核件（`thincoder-core/tools/bash.mjs`）见 `ctx.agent` 走 `launchBgTask`（`agent-tools/bash-async.mjs:100`）：**回执即工具结果**（`bash#N started (running) — log: <path>` ⇒ `tool` 行 ⇒ 进上下文）；帽 4（第 5 件 ⇒ 工具级错误人话）；`timeout` 到点杀树。
  **垫片即宿主**（零自造池）：核载体字段面经核 API 落面（`ensureBgPool` ∥ `parkAsyncPending` ∥ `wakeAsyncWaiters`；`history` 数组 = carrier 回落）——逐字段以核件读取面为准（实施轮按 `launchBgTask`/`nextSubagentId` 实读补齐）。
- **看/管面**（对齐三端——三端亦无专用任务列表工具）：**看** = 回执（id + log 路径）+ `read`/`bash` 读日志 + `process action="list"`（OS 面——子进程在列）；**杀** = `process action="kill" id:N`（核 `killBgTask`——杀树 + 出池 + 墓碑 + 零摘要）。
- **中止面**（非 interrupt）：池条目控制器链**当刻回合信号**（`_sessionSignal` 不设 ⇒ `buildChildSignal`（`async-settle.mjs:165`）回落 `ctx.signal`）；回合中止 ⇒ 回合尾调 `discardAbortedBgTasks(pad)`（`async-discard.mjs:206`——杀树 + 丢弃提醒入汇 + 墓碑；判据沿核 `run-stages.mjs:205-218`）⇒ 提醒行（核件原文）由下一回合边界/唤醒面落库。
  **定义（非 interrupt 中止）** = 无 `reason.interrupt` 的全停式中止——对照 Ctrl+I 中断（`reason.interrupt` ⇒ 注入消息、回合续跑、池保留——核 `run-stages.mjs:197-198`）；服务面唯一中止径 = `POST …/abort`（E57）——无注入续跑通道。

### 15.2 对齐表（三端既有 ↔ 服务面本批——逐条）

| 面 | 三端既有（单源坐标） | 服务面处置 |
|---|---|---|
| timer 空闲唤醒 | 核三件 ＋ 各端一闩（`thincoder-core/agent/timers.mjs:79/102`；CLI `thincoder-cli/src/tui/timer-watch.mjs` ∥ 桌面 `thincoder-desktop/src/main/suspension-timers.mjs` ∥ VSC `thincoder-vscode/src/extension/timer-watch.mjs`） | **消**——同核件、同判据（§15.1） |
| 空闲判定 | 端面 busy（在飞回合 ∥ 挂起窗 ∥ 模态） | **消**——单源 = 会话行 `status`（服务面唯一在途表示；与在途门同判） |
| 到期投递形态 | 核 `injectTimerReminders` 行文 ＋ 入机读线 | **消**——同核件行文；入会话记录（落库） |
| 唤醒回合 | 核 `fireTimerWake` 策略 ＋ 端开轮（域文本 = 核常量） | **消**——同策略、同域文本；帧面 = 无人（§15.1） |
| 后台任务（池/帽/回执/结算/杀） | 核 `bash-async.mjs`（帽 4 ∥ 回执 ∥ 池 ∥ `killBgTask`） | **消**——核池原样，垫片即宿主 |
| 结算投递形态 | 核 `injectBgResult`（摘要 ＋ log 路径）⇒ 机读线 | **消**——同核件行文；入会话记录 |
| 待办可见面 | ack ＋ log 路径 ＋ `wait_for`（`bash id:N done`）＋ OS `process list` | **消（等价面）**——ack/日志/OS 进程面在册；`wait_for` 不在本面八件（族面口径另账——§10） |
| 唤醒开关 `agent.timerWake` | 端配置文件键（缺省开；关 ⇒ 零注册） | **留（提请）**——服务面无端配置文件面；默认态 = 开（与三端缺省逐字同判）；开关键面 = §15.3③ |
| 可见面（状态行 ∥ 定时器列表 ∥ 后台任务列表） | CLI 状态行段 ∥ `/timers`；桌面/VSC 各有呈现 | **留（提请）**——承载物 = 控制台（新 UI 面；含 `views-chat.mjs` 拆分前置——台账 #1309）；**触发落流一项 = 消**（唤醒回合的助手回复落库即见） |
| 会话级 Stop（关窗/退出 ⇒ 清池） | 端生命周期（进程退出即清） | **无对应物**——服务面进程常驻、无「会话关闭」动作；在途任务只经 `kill`/中止/进程退出消失（如实披露，R71④） |
| 浏览器后台动作（`browser.async`） | 核 `browser-async.mjs` | **无件可对**——本面八件无 browser（接 = 随 browser 件入册批） |

### 15.3 开放点（提请——不设默认动作）

| # | 项 | 我方推荐（附代价） | 备选 |
|---|---|---|---|
| ① | **唤醒回合的身份与审计行**：actor 取法 ∥ 是否新增一等审计行 | 推荐 = actor 沿会话 owner（`actorNameOf(chat.created_by)`——与用户回合同）；**审计面零扩**（三 kind 不动——KD-SV-91）：工具调用 `chat_call` 照落、异常 `chat_stop` 照落；唤醒标记 = 服务器日志一行（`chat_wake_turn`）＋（可加）`chat_stop.detail.wake` 布尔 | 落一条「唤醒已发生」审计行 ⇒ 需新 kind / 新 detail 形 ⇒ 连带审计页模板 + i18n + AC-28 审计型面计数（代价 = 三面 +1） |
| ② | **送达行的消息形与呈现**（含 timer 可见面） | 推荐 = 本批「落库（`user` 行 + `data.kind="reminder"`）＋ 呈现面另轮」——落库理由 = §15.1（机读线单源）；呈现面（提醒行样式 ∥ 状态行 ∥ 定时器与后台任务列表 ∥ 唤醒开关键）= 新 UI 面，前置 = `views-chat.mjs`（500 软线——台账 #1309）拆分审查 | 只落库不呈现（提醒行以用户消息样式显一——内容自带前缀，不误导语义）；或整包另批（拆分 + 状态行 + 列表 + 开关键） |
| ③ | **计费/制动口径** | **计费 = 已裁落**（用户 2026-10-12 15:44「应该走我们自己的模型代理服务，这样才能确保用量统计的准确」——台账 #1324）——管理面 chat（**含唤醒回合**）经网关链**出账**：usage 行归因 = 本回合发送者 × `admin-agent` key（缺位 ⇒ 会话 owner——2026-10-13 收正；机制 = §16.2/§16.3）；**制动**推荐 = 一个唤醒开关（服务配置键 + 系统页控件 + i18n 两键——产品常识：配置项须有 UI 写面） | 不做（对齐三端缺省态；暴露 = 模型自激循环耗平台 token——**今起出账可见**；制动 = 模型停/进程重起）；或加频率下限（属「新增限制」，与用户 15:00 口径相抵；周期式样 = 兄弟批设计面） |
| ④ | **防自激口径** | 推荐 = **不加限制**（对齐：三端唤醒回合内同样可再设 timer/再起后台任务；核既有门已够——在途 timer 帽 8 ∥ 池帽 4 ∥ 一次性闩 ∥ 到期批合并一轮） | 加「唤醒回合内禁再设 timer/再起 async」（= 新增限制面 ⇒ 须与兄弟批一并裁，否则两端行为分叉） |

### 15.4 机检口径（单元测试档 = `docs/batches/2026-10-12-server-wake-face.test.mjs`）

- **唤醒链**（假模型 + 假钟 + timer 真件）：到期 ⇒ 落库行（`user` + `kind`）∥ 自动开轮（域文本逐字）∥ 出列幂等 ∥ 未到期零行零轮 ∥ 忙零动作 ∥ 零交付零轮。
- **异步链**（假模型 + bash 真件 + 即退命令）：回执逐字（`bash#N started (running) — log: …`）∥ 结算 ⇒ 摘要行落库（核件原文前缀 `[System reminder: background bash#N finished`）∥ 帽 4 ∥ `process kill id` 两态。
- **中止面**：非 interrupt 中止 ⇒ 杀树 + 丢弃提醒（核件原文）+ 墓碑 ⇒ 零摘要投递。
- **结构面**：六端点计数不变 ∥ 三 kind 不扩 ∥ `chat-wake.mjs` 源零 `setInterval` ∥ 导入面（`@thincoder/core/agent/timers.mjs` 四件——同源断言）。
- **出口用例**（修订轮）：管理登录 ⇒ sk 在册 ∥ 管理会话一轮 ⇒ usage 行在场且可归因 ∥ `read_history` 本会话逐形——全文 = §16.4。

## 16. 会话历史查询与模型出口改道（server-wake-face 批 · 修订轮——2026-10-12；台账 #1323 ∥ #1324）

> 口径 = 用户 15:40「管理端目前没有查会话历史的工具，这个也需要打开。」⇒ **`read_history` 入内**（条目 ③）；15:44「这样不对，会让我们的帐和provider的帐对不上，应该走我们自己的模型代理服务，这样才能确保用量统计的准确，也应该跟客户端一样，登陆时分配一个sk给管理会话用。」⇒ **管理会话模型出口改道**（条目 ④）。
> 两侧同源**「同客户端口径」**：管理会话 = 本 server 网关链的**进程内客户端**——凭据面（sk）与历史面（本会话 `read_history`）一并收口。

### 16.1 会话历史查询（`read_history`——核件原样 ＋ 库面适配）

- **件 = 核件原文复用**（`thincoder-core/agent-tools/read-history.mjs`——实现 ∥ schema ∥ 描述三面同源，沿 §14.2 复用口径；该档 392 行、零改）：环境族**第八件**、第六族「会话」（§14.2 表）；`ENV_TOOL_NAMES` 七 ⇒ **八**。
- **作用域 = 本会话（写死）**：服务面无「会话树」概念（一会话 = 一行 `agent_chats`）⇒ 核件的跨会话各族（`path` = 文件路径 ∥ `cwd:<dir>` ∥ `all`）在服务面**运行期拒**（`path` 非空 ⇒ 工具级错误人话；缺省/空串 ⇒ 本会话——沿 §14.2 端池参数处置先例，**零 schema 收窄**）。
- **记录面 = 库面单源**（`pad._recordStore = recordStoreOf(db, chatId)`——新增导出，落 `thincoder-server/src/agent/chat-store.mjs`）：`iterate(direction)` 生成器逐行出行，映射为核记录形——
  `user`/`notice` ⇒ `{ role, content, ts }` ∥ `assistant`（携 `toolCalls` 时）⇒ `{ role, content, ts, tool_calls: [{ id, type: "function", function: { name, arguments } }] }` ∥ `tool` ⇒ `{ role, name, tool_call_id, content, ts }`。
  `ts` = 行 `created_at`（ISO 串）解析毫秒（解析失败 ⇒ 该键缺席）；`content` 原样（核件自截 ≤500 字）；notice 行在列（role 原值——核件不校验 role，过滤面枚举 = `user`/`assistant`/`tool`，notice 经全量/关键词/时间窗命中）。
- **审计**：沿用 `chat_call`（面不扩——KD-SV-91；KD-SV-114 口径）：`subject` = **过滤摘要**（`role=… keyword=… tool=… since=… until=… limit=… direction=…` 逐项、缺项不列）∥ 成败 = 既有 `resultCode` ∥ `truncated` 照旧。
- **能力段**（§14.1 第四块）：`CHAT_LIMITS_BLOCK` 补 `read_history（本会话历史查询——只读）`（对位断言 = 每件注册名 ∈ 能力段字面）。
- **不做**：跨会话检索（服务面无该面）；历史编辑/删除；核件关键词表加白（核件原样）。

### 16.2 模型出口改道 = 网关链 loopback（KD-SV-129）

- **决策**：管理会话的模型出口 = **本进程监听的网关 HTTP 面**（`http://<本机监听地址>:<port>/v1`）；凭据 = 本回合发送者的 `admin-agent` sk（§16.3——谁用谁；唤醒/续跑轮随最近发送者、主人兜底）；模型 = 会话行 `model`（**对外标识**——与会话创建面/四端客户端同形）。
- **复用点（逐字）** = 网关链全链：鉴权（key 验签）∥ 派发（外标 → provider）∥ 准入三件（模型禁用 ∥ 配额 ∥ 限流）∥ 上游转发 ∥ **记账（usage 行）**——零第二份。**与 KD-SV-82「进程内直取」不冲突**：域件读 = 管理动作面（进程内直取，如 `members`/`providers` 工具），模型调用 = **对外契约面**（走网关）。
- **装配**（`buildChatExit`——`thincoder-server/src/agent/chat.mjs`）：`baseURL = <selfBase>/v1`（`selfBase` = `deps.selfBaseUrl?.()` 惰性取数——`thincoder-server/bin/thincoder-server.mjs` 注入 `server.address()`；
  通配 `0.0.0.0` ⇒ 拨 `127.0.0.1`、`::` ⇒ `::1`、具名地址原样，IPv6 加括号；不经 nginx）∥ `apiKey = sk 明文` ∥ `model = ref`（外标）∥ `name` = provider 名（日志面）。
  **本地 registry 复检保留**（缺模型 ⇒ 会话可建面的既有判据不变）；`reasoningEffort` 装配不变（枚举源 = 上游真名）。
- **失败面**：sk 缺位（未登录/已吊销）⇒ 出口装配抛 ⇒ 既有 `model_error` 收尾（notice 人话含「重新登录控制台」）；网关侧拒（sk 在途吊销 ⇒ 401 ∥ 模型不可用 ⇒ 404）⇒ 网关错误形即模型出口错误 ⇒ 同径收尾。**五终态零新形**。
- **与今日的差（如实披露，三条）**：① 核规格面（`specForModel(provider.model)`）现以**外标**为键 ⇒ 别名/`provider/model` 外标在核规格表上**退中性**（`partialMode` 续写等核内调节面）——**与四端客户端既态逐点同形**（用户 15:44「跟客户端一样」的字面后果，非新增差异）；② 核载荷门 `isRouter`（外标含 `/` ⇒ 静默不发 `reasoning_effort`）——与 R61② 披露同门；③ 出口代理旗 = 网关侧消费，本面零重复。
- **唤醒回合同源**：`runChatWakeTurn` 与用户回合共用出口装配（零第二份）；凭据主体沿 §16.3 口径（唤醒/续跑轮随最近发送者、主人兜底——`senderId ?? chat.created_by`）。
### 16.3 管理面 sk（`admin-agent`——登录 ensure ∥ 免 20 上限；KD-SV-130）

- **归属** = **本回合发送者**（登录成员——成员级、每人一枚、跨会话稳定；谁用谁——用户 2026-10-13 16:39 裁）；**唤醒/续跑轮随最近发送者、主人兜底**（`senderId ?? chat.created_by`——上下文缺位 ⇒ 主人）；**触发** = `POST /api/login` 成功 ∧ `role = "admin"` ⇒ `ensureAgentKey(db, memberId)`（幂等：在册 ⇒ 复用、零重签）；**非 admin 登录零动作**（管理会话 = admin 面）。
- **命名** = `admin-agent`（常量单源 `AGENT_KEY_NAME`——`thincoder-server/src/accounts/keys.mjs`）；落 `api_keys.name`（列表可见、可吊销）。
- **明文落面** = `api_keys.key_plain`（**v19 增段**：`ALTER TABLE api_keys ADD COLUMN key_plain TEXT`；NULL = 常规 key（服务端不留明文）∥ 非空 = 服务端自持面）——写面唯一 = `issueKey({ keepPlain: true })`；**服务端即消费方**（同沙盒工作区 `key_plain` 先例——披露类不升级，R71④ 在册）。归属/生命周期全沿 key 面（逐请求查库 ⇒ 吊销即断）。
- **审计**：首发一条 `key_issue`（`detail = { keyHint, surface: "admin_agent" }`——`surface` 取值域扩，随正 = `accounts/ACCOUNTS.md` §2.1）；复用登录 ⇒ 零行。
- **口径**：不判 20 上限（沿客户端登录 ∥ CLI 先例——签发面不判，§1.1 判据只在自助面）；不计入「管理动作」审计型（`agent_event` 三 kind 不扩）。
- **已知摩擦（披露）**：① 管理成员「轮转」（`POST /api/me/keys/rotate` 全换）会连带吊销 sk ⇒ 管理会话转 `model_error`，下次登录补发；② 用量/导出面的 key 名恒为 `admin-agent`（归因可读——`usage.key_id` → `api_keys.name` join；单源 = `thincoder-server/src/metering/usage.mjs` 行 42）。

### 16.4 机检口径（单元测试档续——`docs/batches/2026-10-12-server-wake-face.test.mjs`）

- **登录发面**：admin 登录 ⇒ `api_keys` 行（`name = "admin-agent"` ∥ `key_plain` 非空 ∥ `status = "active"`）+ 一条 `key_issue`（`surface: "admin_agent"`）；重复登录 ⇒ 同行（零重签）；`user` 登录 ⇒ 零新行。
- **出口入参**（假出口 ∥ 真装配）：一轮 ⇒ 出口配置携 `{ baseURL: "<selfBase>/v1", apiKey: "<本回合发送者的 admin-agent 明文>", model: <外标> }`——**不携** provider `baseURL`/`apiKey`（结构用例）。
- **全链出账**（真网关链 + 假上游 + 本机自环）：管理会话一轮 ⇒ 帧序零变 + `usage` 行在场（member = 本回合发送者〔缺位 ⇒ 会话 owner——2026-10-13 收正〕∥ key = `admin-agent` ∥ endpoint = `chat`）。
- **历史面**：会话内（`user` ∥ `assistant`+`tool_calls` ∥ `tool` ∥ `notice` 行）⇒ `read_history` 逐过滤形（role/keyword/tool/since-until/limit/direction）＋ `ts` = `created_at` 毫秒；`path` 传参 ⇒ 工具级错误人话；审计 `chat_call`（`tool = read_history`、`subject` = 过滤摘要）。
- **结构用例**：六端点计数不变 ∥ 三 kind 不扩 ∥ `read-history.mjs` 零改（核件原文——导入即用）∥ 能力段对位（八件名 ∈ 段字面）。


## 17. 与核的取核形（server-core-unification 批——2026-10-13；台账 #1239）

> 目标态 = 需求 `docs/server/requirements/PROJECT.md:601`（用户 2026-10-10 16:40 裁：agent 循环 ∥ 会话 ∥ 审批 ∥ 提示词装配 = 取核；能力面 ∥ 工具集 = 管理面自己的）。
> 本批 = 取核形**设计落形**（实现列实施轮）——**核面实现零动**；核欠缝面 = §17.4 开放点（含宿主缝设计草案，供配套核批直接接）。

### 17.1 取核形（一句话）

- **件级取核**：共有机制取核**单件**（工具件 ∥ 计时与唤醒件 ∥ 会话历史件 ∥ provider 客户端 ∥ 模型规格件 ∥ 压缩件——逐件 = §17.2）；**环体（回合骨架）自持**——宿主语义（DB 单源 ∥ NDJSON 帧 ∥ 无人值守裁剪 ∥ 网关记账出口）在核内无对应缝（§17.4 ①）。
- **消费面接法**（沿既有先例）：动载（`import()` 懒载 + 缓存）+ 注入口（单元测试档替身）+ 缺核降级（环境族不注册 ∥ 档位退中性——回合不阻断）；**垫片即宿主**（核件以既有 `ctx`/`agent` 读面为准——§14.2/§15.1）。
- **最近先例**（对齐 ∥ 偏离）：先例 = 件级核件复用既有形（本档 §14.2 环境工具面六族八件 ∥ §16.1 `read_history` 核件原样 ＋ `recordStoreOf` 库面适配；先例批 = admin-agent-awareness ∥ server-wake-face ∥ admin-chat-creds-merge）；对齐 = 同法（动载 ∥ 注入口 ∥ 结果归一）；偏离 = A1 替换自建回灌形（理由 = §17.3 A1）∥ A3 标记行落法（理由 = §17.3 A3）。
- **核件原文复用**：实现 ∥ schema ∥ 描述三面同源——不收窄 schema、不二次包装（KD-SV-113 口径）。

### 17.2 引核件清单（file 级）

**在盘（15 件——已消费；本清单 = 「服务端消费哪些核件」单源；版本对位背书 = 板档 `PROJECT.md` §2.3）**：

| 核件 | 取用面（导出） | 服务面消费坐标 |
|---|---|---|
| `@thincoder/core/provider/index.mjs` | `chat` | `run.mjs`（任务出口——`:23`）∥ `chat.mjs`（会话出口——`:403` loopback 描述子） |
| `@thincoder/core/model-specs.mjs` | `specForModel` | `gateway/reasoning-levels.mjs`（档位枚举——`:38`） |
| `@thincoder/core/agent/timers.mjs` | `deliverExpiredTimers` ∥ `createTimerWatch` ∥ `fireTimerWake` | `chat-env-tools.mjs`（投递汇①）∥ `chat-wake.mjs`（唤醒器——闩 ∥ 火策略） |
| `@thincoder/core/agent-tools/timer.mjs` | `timerTool` | `chat-env-tools.mjs`（环境族·提醒） |
| `@thincoder/core/agent-tools/bash-async.mjs` | `injectBgResult` | 同上（投递汇②——后台任务送达） |
| `@thincoder/core/agent-tools/async-settle.mjs` | `writeTombstone` | 同上（异常件墓碑） |
| `@thincoder/core/agent-tools/async-discard.mjs` | `discardAbortedBgTasks` | 同上（中止收尾） |
| `@thincoder/core/agent-tools/read-history.mjs` | `readHistoryTool` | 同上（第六族·会话） |
| `@thincoder/core/tools/ops.mjs` | `getCurrentTimeTool` ∥ `processTool` | 同上（时间 ∥ 进程） |
| `@thincoder/core/tools/search.mjs` | `lsTool` ∥ `grepTool` | 同上（文件读取族） |
| `@thincoder/core/tools/file.mjs` | `readTool` | 同上 |
| `@thincoder/core/tools/bash.mjs` | `bashTool` | 同上（命令族） |
| `@thincoder/core/tools/shared.mjs` | `toOpenAISchema` | 同上（schema 形单源） |
| `@thincoder/core/agent/helpers.mjs` | 域文本面（`loadCoreTurnDomains`） | `chat-env-tools.mjs`（唤醒轮域文本） |
| `@thincoder/core/attachments.mjs` | `parseDataUrl` ∥ `isNonVisionModel` | `chat-routes.mjs`（图面两门——`:40`） |

**server-mcp 批采用（1 件——同清单同规则；机制全文 = `mcp/MCP.md` §4）**：

| 核件 | 取用面（导出） | 服务面消费坐标 |
|---|---|---|
| `@thincoder/core/mcp.mjs` | `connectMcpServer` ∥ `probeMcpServer` ∥ `closeAllMcp` ∥ `removeMcpTools` | 新档 `thincoder-server/src/mcp/face.mjs`（拟新增——工具面装配）∥ `thincoder-server/src/mcp/routes.mjs`（拟新增——探活 ∥ 删行关闭）∥ `bin/thincoder-server.mjs`（停机收尾） |

**本批新增（3 面——零核改可采纳件）**：

| 面 | 核件（取用导出） | 服务面落点 |
|---|---|---|
| A1 工具轮回灌形 | `@thincoder/core/model-specs.mjs` `assistantToolCallMessage`（`:355`）＋ `specForModel`（`:298`） | `chat.mjs` ∥ `run.mjs` 自建形替换；回声落库/回放 |
| A2 历史修复 | `@thincoder/core/agent/helpers.mjs` `repairHistory`（`:279`） | 回合装配期（回放段）施用 |
| A3 上下文压缩 | `@thincoder/core/context.mjs` `compressIfNeeded`（`:165`）∥ `compressFallback`（`:239`）∥ `COMPRESS_FAILURE_LIMIT` | 新档 `chat-compact.mjs`（压缩面 ＋ 落库标记适配） |

### 17.3 新增三面（机制与接法）

**A1 工具轮回灌形（取核——替换服务端自建形）**：tool 轮 assistant 消息改由核件构造（`assistantToolCallMessage(response, specForModel(<上游真名>))`——上游真名 = 别名反查后，沿 §11.4 解析单源）；
核件自动携带 `reasoning_content` 回声（`reasoningEcho:"required"` 族——deepseek/kimi/mimo；缺值回 `""`）与 `tool_calls[].extra_content`（思考签名——在场才带）。
配套三件（③ = 2026-10-14 缺陷修——轻通道轮）：① **回声道落库**（tool 轮 assistant 行 `data.reasoning`——回放回插 `reasoning_content`）∥ ② **签名落库**（`data.toolCalls[].extraContent`——回放重建）∥ ③ **`args` 落库 = 掩蔽原文**（JSON 有效——不截断；`≤500` 摘要只落 `call` 帧/审计面——截断残 JSON 回放撞严校验上游〔dashscope code 系〕400 实证；存量坏行 = 回放面净化兜底：非 JSON ⇒ `{}`，合法原样逐字）；
**非对象根（数组/标量）∥ 非法入参 ⇒ 落库 `{}`**（同判——评审 #122 收正）∥ **体量披露**：落库/详情 `args` 自此无 500 上限（随模型输出增长；帧/审计面仍 ≤500）。
理由 = 跨端语义单源（三端经核件同判）；被否 = 维持自建形（as-of 设计轮实证：`thincoder-server/src/agent/chat.mjs:591-595` ∥ `thincoder-server/src/agent/run.mjs:106-110` 两处自建形零携回声/签名——回声族「首个工具调用后思考断流」症状的复现面；**实施后读数**：该两处已改经核件构造，自建形现存 = `chat-compact.mjs:149-158`〔缺核回落位〕）。

**A2 历史修复（取核）**：回合装配期对回放段施用核 `repairHistory`——修断链 `tool_calls` ∥ 孤儿 `tool` 行（中止/重启窗病态形）；常态输入原样（零改）。
落点（实施落定）= 回放面（`replayEntriesOf`/`replayMessages`/`messageOfRow`——标记解析 `compactionCoversOf`）自 `chat.mjs` **迁入** `chat-store.mjs`（净 ≈+90——§6 行账）；`chat.mjs` 装配点施用（`repairTurnHistory`——缺核 ⇒ 原样）。被否 = 自修（第二份）。

**A3 上下文压缩（取核——消跨端差异）**：管理会话历史现盘无界（零压缩 ⇒ 长会话撞窗 ⇒ `model_error` 收尾）；本批落核压缩——

1. 时机 = 回合起跑段（本轮消息与投递落库后、模型调用前；安全点 = 历史以 user 结尾）；
2. 垫片 = **专用压缩垫片**（`{ history: <本次待发消息数组>, provider: <loopback 描述子>, config: { traces: { enabled: false } }, cwd }`——勿与 env 垫片混用）；**provider 取数 = 注入口** = `deps.compactProvider ?? modelExit.provider`（生产 = 出口同源；单测替身免真 HTTP）；
3. 调用 = `compressIfNeeded(垫片, 阈值, { onCompressStart }, { systemPrompt, tools }, signal)`——**摘要调用经同一出口**（loopback ⇒ 记账同链；`usage` 行可归因——用户 15:44 口径不破）；**可视面 = `onCompressStart` ⇒ 日志一条**（`chat_compact_start`——观察链，不产帧）；
4. **落库单源 = 压缩标记行**（`role="user"` ∥ `data.kind="compaction"` ∥ `data.covers=[seq首, seq尾]` ∥ 内容 = 压缩产物文本）：回放自标记解析——覆盖区间以标记行代（嵌套标记自然消解）；**原行不删**（审计面原文留存；模型视野 = 压缩后形——「回放逐字一致」= 对标记形成立）；覆盖区间 = 压缩前后差分求（首变点 ⇒ 尾重合段前沿——实施当刻以核 `applyCompression` 实读为准）；
5. 失败链 = 进程内计数 ＋ 达 `COMPRESS_FAILURE_LIMIT`（= 3——取件 = `@thincoder/core/context.mjs`）⇒ 降级 `compressFallback`（确定性截断——同落标记行）；阈值 = 核缺省镜像常量（`DEFAULT_COMPACT_THRESHOLD` = 100k——`thincoder-core/agent/setup.mjs:26`；核变同拍）。

被否 = 不压缩（跨端差异续存）∥ 就地删行改写（记录面丢原文）。

**缺核降级与警告面（三面共轨——承批档 §5）**：三面各自退中性（A1 自建形回落 ∥ A2 原样返回 ∥ A3 跳过）；核件成员级形校验（导出缺失 ∥ `COMPRESS_FAILURE_LIMIT` 非正整数 ⇒ 按缺核处置）＋ 核件运行期抛 ⇒ 自建形回落——**回合不阻断**。警告面 = 会话面（`log` 通道在位）：退中性面各一条 `chat_core_face_missing`。

### 17.4 开放点（不纳入本批——路径与触发已定）

- **① 环体取核（`runAgent`）——目标态未闭**：实读相抵——`thincoder-core/agent/setup.mjs:198-208`（depth 0 恒调 `assembleFamilyTools`）∥ `family-tools.mjs`（无宿主裁剪入参）⇒ 直用 `runAgent` 会带全家族矩阵（subagent ∥ ledger ∥ batch ∥ advisor…）＋ git/树/记忆/技能注入，与 §5 裁剪裁决相抵。
  **宿主缝设计草案（供配套核批——只设计不实施）**：候选 a）`assembleFamilyTools`/`prepareRun` 增**宿主面入参**（`hostFaces = { familyTools: false | [名单], injections: { git: false, tree: false, memory: false, skills: false } }`——缺省不改 ⇒ 三端逐字零变）；候选 b）宿主函子缝（`host = { familyTools(), reminders() }`——空 ⇒ 核默认）。**推荐 = a**（纯参数化 ∥ 面最小）。
  **切换判据** = 核批落地后：服务面 `chat.mjs` 环体替换（帧面 ∥ 落库 ∥ 中止面三适配）＋ 三端回归（零改）。触发 = 配套核批开批。
- **② 提示词装配（场景槽）**：核 `prompt-overlays.mjs` 场景表无管理面场景；简报内容 = 服务端产品文案（自持——「壳自持增量」形）。触发 = 需跨端提示词机制（槽 ∥ 降级链）复用的实需出现（届时核批增场景）。
- **③ 会话面（核 session-store）**：服务端 DB 单源（审计 ∥ 六端点 ∥ 控制台 ∥ 计量）⇒ 自持；核会话存储 = 文件面（`~/.thincoder/sessions`——改根仅测试缝，非生产面）。触发 = 核开会话存储正式注入缝 ＋ 产品理由出现。
- **审批腿（目标态四腿之一——已处置，非开放点）**：交互审批/问询面随无人值守裁剪（§5——工具不弹问、不自锁）；取核腿若涉环体批再议。

### 17.5 核面零改声明（本批）

- 本批取核件（§17.2 在盘 15 件 ＋ 新增 3 面）**全部为 `@thincoder/core@0.10.4` 既有导出**（逐件坐标 = §17.2/§17.3；实读 2026-10-13 本仓 checkout）；
- 本批与实施轮**核侧零文件 ∥ 零导出 ∥ 零行为改动**；核欠缝面（环体 ∥ 场景槽 ∥ 会话面）= §17.4 开放点——**配套核批承接**（不塞本批实施）。

### 17.6 版本对位与机检

- 版本对位口径（依赖形 ∥ 地板口径 ∥ 发布序——承台账 #1222）全文 = 板档 `PROJECT.md` §2.3。
- 机检（本批 → 实施轮）：§7 新增判据行「与核取核形」——载体 = 单元测试档（`docs/batches/2026-10-13-server-core-unification.test.mjs`）。

## 变更记录

- 2026-10-14（**sandbox-onboarding-removal 批 · 设计评审轮 1 修正（fix 轮）· eng-designer**——承批档 `docs/batches/2026-10-14-sandbox-onboarding-removal.md` §3 轮次 1（评审 #141；发现 3/4 落本档）：**run 任务面残句收正**——§16.2「任务式（run）出口 = 直连」行删 ∥ §17.3 A1 配套「任务面（run）规格取数 = `exit.spec`」行删 ∥ §17.3 缺核警告面句去 run 面静默半句；§13 R54③「装机 = 任务式弹窗」补收正注（承接 = 管理面 chat 内动作——`sandbox/SANDBOX.md` §16 R87）。**零新语义（评审发现直接导出项）；产品码零触（设计轮）。**

- 2026-10-14（**model-test-tool 批 · 设计评审轮 1 修正（fix 轮）· eng-designer**——承批档 `docs/batches/2026-10-14-model-test-tool.md` §3 轮次 1（评审 #129——VERDICT = pass）：① `ok`／`broken_stream` 定义收正（零内容增量亦归 `ok`；首内容增量前中断归 `broken_stream`）——§12.1③ ∥ §7 ④ ∥ §8 B80 三处同拍 ∥ ② 补入参校验腿（§8 E62⑥ ＋ §7 ⑤——工具级错误人话 ∥ 零外呼 ∥ 库零变）＋ `exec` 先例指针收窄（§12.1① ∥ §9 KD-SV-205④）∥ ③ AC-55 状态收正 = 已入册（2026-10-14）＋ 坐标改指实位（需求档 §2 `:372–379` ∥ 验收表 `:446` ∥ §5 `:550–552`）——§12.1 标题 ∥ §13 R87① ∥ 板档 §7/§9 同拍 ∥ ④ §12.1 增「最近先例（对齐 ∥ 偏离）」行 ∥ ⑤ 结果键在场形逐支钉死（§12.1③ ＋ §8 N84）∥ ⑥ §12.1② 补两装配件关系句（复用层 = `chatProviderOf`）∥ ⑦ §12.1③ 补确定性行（注入钟 ＋ 逐值相等断言）∥ ⑨ §6 本批块添 gateway 域行账随正指针（⇒ `gateway/API.md` §4）∥ ③补（评审后自发现收正——父侧 2026-10-14 裁 (a)）：§8 E62 预期列 ① 归类收正（②③ = 读数面；①④⑤⑥ = 工具级错误人话——对齐 §12.1① ∥ §7⑤ ∥ AC-55④）。同源随动 = `design/PROJECT.md`（§7 ∥ §9 ∥ 变更记录）。**零新语义（评审发现 ＋ 父侧裁决直接导出项）；产品码零触（设计轮）。**

- 2026-10-14（**管理面会话工具参数截断修复 · 轻通道轮 · 主 agent 直接执行 · 可 revert**——用户 01:15 报障（qwen3.7 系「模型调用失败」同 provider 的 deepseek 正常）+ 01:18「修」；批档 `docs/batches/2026-10-14-admin-chat-args-truncation-fix.md` ∥ 台账 #1396；根因实读 = `chat.mjs:596` 落库用帧口径 `argsTextOf`〔≤500 截断〕⇒ 回放残 JSON 撞 dashscope 严校验 400 实证）：§17.3 A1 配套件 ③——`args` 落库 = 掩蔽原文（JSON 有效不截断；≤500 只落帧/审计）+ 存量坏行回放净化（非 JSON ⇒ `{}`）。**产品码两档三处**（`chat.mjs` `argsFullOf` ∥ `chat-store.mjs` `replayArgsOf` 两调用点——父侧直笔）。

- 2026-10-14（**model-test-tool 批 · 设计轮 · eng-designer**——承批档 `docs/batches/2026-10-14-model-test-tool.md` · 台账 #1390；用户 00:19 提 ＋ 00:50 两句厘定）：§6 本批块（≈+190）∥ §7 判据行 ∥ §8 用例（N84 ∥ B80 ∥ E62）∥ §9 增 **KD-SV-205** ∥ §12 表 `models` 行 ＋ 动词 `test` ∥ **§12.1 新节**（机制五面）∥ §13 增 **R87**。同源随动 = 板档 `design/PROJECT.md`（§2.1 ∥ §3 ∥ §4 ∥ §7 ∥ §9 ∥ 变更记录）。**产品码零触（设计轮）。**

- 2026-10-14（**server-mcp 批 · 设计评审轮 1 修正（fix 轮）· eng-designer**——承批档 `docs/batches/2026-10-13-server-mcp.md` §3 轮次 1（范围外注记②——读数类）：§6 本批块 `bin` 读数刷新（192 ⇒ ≈195 ⇒ **244（as-of 2026-10-14）⇒ ≈247**——增量 ±0）。**零新语义（读数收正）；产品码零触（设计轮）。**

- 2026-10-14（**sandbox-onboarding-removal 批 · 设计轮 · eng-designer**——承批档 `docs/batches/2026-10-14-sandbox-onboarding-removal.md` §1 · 台账 #1383；用户 2026-10-14 裁「撤」——任务式装机（托管接入）退场）：**任务式面删净**——§2（任务模型）/§3（工具面五件）/§4（自主边界）删（段号留空档）；§1 形态/驱动器两句收正（驱动器 = 聊天式唯一）∥ 头部口径单源改指需求 §5「两个 chat 界面」 ∥ §5 题改「核复用与对话面裁剪」+ MCP/出口两句去 run 面 ∥ §6 `run.mjs` 行（150 ⇒ ≈90）与 `tools.mjs` 行（242 ⇒ ≈20——掩蔽单源保留）随正 + 小计另计 −≈280 ∥ §7 四条判据删 ∥ §8 N53/B47/E39 删 ∥ §9 KD-SV-82/87/88/89/136 五处收正（去 run 面） ∥ §10 两处收正（run 改道句删 ∥ 编排句收正） ∥ §11 形态/回合两处收正 ∥ §12「不入 chat 面」句收正。同源随动 = `sandbox/SANDBOX.md`（§3 接管块 + §14 KD-SV-135）∥ `webui/CHAT.md`。**产品码零触（设计轮）。**

- 2026-10-13（**server-mcp 批 · 设计轮 · eng-designer**——承批档 `docs/batches/2026-10-13-server-mcp.md` §1 · 台账 #1379；用户 23:0x 原话）：§5 增 MCP 面行（chat 挂载 ∥ run 不挂载）∥ §6 增本批预算块（`chat.mjs` ⇒ ≈704 ∥ `run.mjs` ±0 ∥ `bin` ⇒ ≈195）∥ §13 增 R86 ∥ §17.2 增采用件表（`mcp.mjs`——四导出）。同源随动 = `mcp/MCP.md`（新档）∥ `store/STORE.md` §2 v24 ∥ `bin/thincoder-server.mjs`。**产品码零触（设计轮）。**

- 2026-10-13（**chat-cred-sender 批 · 收尾设计归档（轻通道轮）· eng-designer**——承批档 `docs/batches/2026-10-13-chat-cred-sender.md` §1（笔 1 已落盘已上线——提交 `3e6682fe`）；用户 2026-10-13 16:36 走查 ∥ 16:39 裁「谁用谁」；台账 #1361）：管理面 sk 凭据主体口径收正 = **本回合发送者（登录成员）**——唤醒/续跑轮随最近发送者、主人兜底（`senderId ?? chat.created_by`）；同机制到面：§16.3 归属（`:450`）∥ §16.2 决策（`:438`）＋ 唤醒回合同源（`:445`）∥ §15.3③ 计费归因（`:409`）∥ §16.4 出口入参（`:460`）＋ 全链出账（`:461`）∥ §5 出口两行（`:202`/`:204`）∥ §8 N78 行（`:153`）∥ §9 KD-SV-129②（`:177`）＋ KD-SV-130①（`:178`）∥ §13 R71④ 归因句（`:286`）。同源随动 = `accounts/ACCOUNTS.md` §1 ∥ `metering/METERING.md` §1。**产品码零触（归档轮——实现面已落盘：`thincoder-server/src/agent/{chat,chat-routes,chat-wake}.mjs`）。**

- 2026-10-13（**server-core-unification 批 · 落地后回填（fix 轮）· eng-designer**——承批档 `docs/batches/2026-10-13-server-core-unification.md` §5（实施记录）＋父侧裁定（run 任务面缺核警告静默 ∥ 行账回填节拍））：① §6 行账回填（`chat-compact.mjs` 新 ≈90 ⇒ **334** ∥ `chat.mjs` 690 ⇒ ≈705 ⇒ **692**〔未越 720 拆档线——距 28 ⇒ 未拆档〕∥ `run.mjs` 137 ⇒ ≈142 ⇒ **150** ∥ `chat-store.mjs` 155 ⇒ ≈185 ⇒ **247**；批内件 ≈350 ⇒ **486**——口径 = 批档 §5 同值（含尾行差；本档内容行口径各 −1））∥ ② §17.3 补缺核降级与警告面句（run 任务面警告静默——run 面零 `log` 参数；接入 `log` 时同拍）∥ ③ §17.3 披露对位（回放面迁入 `chat-store.mjs` ∥ 垫片 provider 取数 = 注入口 `deps.compactProvider ?? modelExit.provider` ∥ 压缩可视面 = 日志 `chat_compact_start`——不产帧）∥ ④ §17.3 A1 补任务面 `exit.spec` 句（plumbing——属性追加非改道）。**零新语义**（实施披露 ＋ 父侧裁定直接导出项）；产品码零触（条文笔）；同轮批档 §2 append = 落地后补正块。

- 2026-10-13（**server-core-unification 批 · 设计评审轮 1 修正（fix 轮）· eng-designer**——承批档 §3 轮次 1 之 1–9（父侧逐条采纳）：① KD-SV-89 行 ＋ §11 装配句 ＋ §7 旧判据行补压缩标记指针（单源 = §17.3 A3）∥ ② 目标态坐标 `:600` ⇒ `:601`（本档 4 处——§6 块/§13 R73/§17 引/本记录）∥ ③ §17.1 补「最近先例」行 ∥ ④ §11.1 补落库面 tool 轮回声道例外指 ∥ ⑤ §6 本批块补 `chat.mjs` 拆档状态（触发线 720 ∥ 对象 = 唤醒径整段抽 `chat-wake-turn.mjs`）∥ ⑥ §17.3 A3 ＋ §7 ④ 补 `COMPRESS_FAILURE_LIMIT` 值源 ∥ ⑦ §17.4 补审批腿处置行。**零新语义**（评审发现直接导出项）；产品码零触（设计轮）。

- 2026-10-13（**server-core-unification 批 · 设计轮 · eng-designer**——承批档 `docs/batches/2026-10-13-server-core-unification.md` §1 · 台账 #1239；用户 2026-10-13「全做」（方向 = agent 面引核）；父侧同轮裁定（目标态 = 需求 `:601` ∥ 甲案 ∥ 核面零改 = 本批范围护栏，核欠缝列名 + 配套核批））：**增 §17**（取核形 ∥ 件清单 file 级 15 件 ＋ 新增 3 面 ∥ A1/A2/A3 机制 ∥ 开放点含宿主缝设计草案 ∥ 核面零改声明 ∥ 版本对位与机检）∥ §5 保留句精确化（取核面件级 + 环体自持）∥ §6 本批预算块（另计 ≈+140）＋ `package.json` 行收正（带核发布形 ⇒ 板档 §2.3 单源）∥ §7 增「与核取核形」判据行 ∥ §13 增 R73（开放点 ∥ 需求档回笔建议 ∥ 随正件 ∥ 披露）。同源随动 = 板档 `PROJECT.md` §1/§2.3/§4/§5/§6/§7/§9。**产品码零触（设计轮）。**

- 2026-10-13（**server-wake-face 批 · fix 轮（实施披露设计档漂移两处收正）· eng-designer**——承批档 `docs/batches/2026-10-12-server-wake-face.md` §5 未做清单 ③（实施席上抛 #2）＋ 父侧裁「两处皆收正」；**本档面** = §16.3 已知摩擦② 归因读法收正（`:446`）：`usage` 行 `key_name` ⇒ `usage.key_id` → `api_keys.name` join（单源 = `thincoder-server/src/metering/usage.mjs` 行 42）；同轮批档面 = §2.9 表补列两档（`chat-wake.mjs` ∥ `chat-routes.mjs`）。**产品码零触（条文笔）。**）
- 2026-10-13（**admin-chat-creds-merge 批 · fix 轮 2（`timeoutS` 上界判据）· eng-designer**——承批档 `docs/batches/2026-10-12-admin-chat-creds-merge.md` §3 轮次 2 #4（`timeoutS` 缺省值与取值范围未定——E61 腿无可机检锚点）＋ §5 fix round 清单 3（实施席上抛：`timeoutS` 极大 ⇒ `setTimeout` 毫秒溢出被 Node 钳到 ~1 ms ⇒ 即刻假超时）＋ 父侧 2026-10-13 裁定（上界 86 400 s = 24 小时；越界 ⇒ 工具级错误人话「超时上限 24 小时」＋库零变）：§12 `exec` 行补取值判据（缺省 = `SSH_COMMAND_TIMEOUT_S`（60 s）∥ 上界 **86 400**（24 小时）∥ 越界/非正/非数 ⇒ 工具级错误 ∥ 依据 = 86 400 000 ms ≪ Node 计时器量程 2 147 483 647 ms（逾量程被归 1 ms 立即假超时）＋单命令 24 h 以上超出本工具用途）；单源 = §12（`sandbox/SANDBOX.md` 侧「工具形/参数」指针句既有——零改）。**零新语义**（评审发现 ＋ 父侧裁定直接导出项）；产品码零触（设计条文笔）。

- 2026-10-13（**server-wake-face 批 · 设计评审轮 3 修正（fix 轮）· eng-designer**——承批档 `docs/batches/2026-10-12-server-wake-face.md` §3 轮次 3 之 1–6（父侧逐条采纳）＋ 父侧同轮裁定（db 段号批次互换）；依据 = 代码实读 `thincoder-server/src/store/db.mjs` 581–602 段——`migrate()` 读 `user_version` ⇒ 只执行 `v > 当前` 的段；段号 = 执行序，事后不可改）：① §7 行去「`async` 拒」（`:96`——`bash.async` 在册，§15.1 口径）∥ ② B71 `async:true` 支改「受理 ⇒ 回执」断言（`:130`）∥ ③ §9 KD-SV-113 ⑤ 改「`bash.async` 在册（§14.2/§15.1）∥ `process.kill` 的 `id` 靶 = 后台任务杀点」（`:165`）∥ ④ B70 预期改「唤醒径」（`:129`——送达行落库 ＋ 自唤醒一轮，§15.1）∥ ⑤ §15.1 中止面补「非 interrupt」定义（`:375` 续行——无 `reason.interrupt` 的全停式中止；服务面唯一中止径 = `POST …/abort`）∥ ⑥ §11 帧面清单「本批扩」⇒「chat-shell-align 批扩」（`:201`）∥ ⑦ 本档变更记录修订轮行同源随动清单收正（ACCOUNTS §4 项去——修订轮实落 = §1/§2.1/§3；METERING §3 ⇒ §1）∥ ⑧ 段号互换收正：本批段号 v18 ⇒ **v19**（`:78`/`:171`/`:443` 三处 ＋ 本记录修订轮行同拍）∥ ⑨ 连带读数口径：`keys.mjs` 144 ⇒ **143** ∥ `routes.mjs` 152 ⇒ **151**（内容行口径——fix 轮 #8 同例）。**零新语义**（评审发现直接导出项 ＋ 父侧裁定）；**产品码零触（设计轮）。**

- 2026-10-12（**server-wake-face 批 · 设计评审轮 1 修正（fix 轮）· eng-designer**——承批档 `docs/batches/2026-10-12-server-wake-face.md` §3 轮次 1 之 1–10；父侧逐条裁定采纳）：#1 §9 KD-SV-90 行收正 = 兄弟轮（admin-chat-creds-merge 修复轮）已在盘（核过零改） ∥ #2 §10/§15.2 三处「七件」⇒「八件」∥ #3 §6 两条「另计」按分项和收平（批 ≈+270 ⇒ ≈+342 ∥ 修订 ≈+140 ⇒ ≈+154）∥ #4/#5 板档面（详见 `design/PROJECT.md` 变更记录）∥ #6 `store/STORE.md` v14 段注补 `kind:"reminder"`（详见其变更记录）∥ #7 §13 R62③「`timer` 无空闲唤醒」句改指 §15.1 ∥ #8 §6 读数口径统一（内容行 ∥ 文末换行不计：`chat-store.mjs` 113 ⇒ 112 ∥ `chat-env-tools.mjs` 230 ⇒ 231 ∥ `chat.mjs` 588 ⇒ 587）+ `chat.mjs` 格补累计 ≈+125（批 ≈+100 ＋ 修订 ≈+22）∥ #9 `chat-tools.mjs` 行补 >500 软线判（维持 + 上限 700）∥ #10 评审面限制登记 = 批档 §2（本档零改）。**零新语义**（评审发现直接导出项）；产品码零触。

- 2026-10-12（**admin-chat-creds-merge 批 · 设计评审轮 1 修正（fix 轮）· eng-designer**——承批档 `docs/batches/2026-10-12-admin-chat-creds-merge.md` §3 轮次 1 之 1/2/6/9）：#1 §9 KD-SV-90 行按 KD-SV-136 实收（八件 ∥ `runners` 动词 + `revoke_credential` ∥ `exec` 入 chat——主机表行绑定；被否栏旧项「chat 内收 SSH 凭据」删 + 新项「`exec` 不入 chat（用户 2026-10-12 裁撤）」入——设计轮自述已收而未实收，本笔按实测补收）∥ #2 KD-SV-91 增凭据类例外（chat 径撤销两行）+ §12 runners 行注同拍 + §7 ⑥ 审计两行腿 ∥ #6 §7 ② 结果形收为「含四字段 + 指针」（形全文 = §12 表）∥ #9 §1 驱动器行 + §12 题「七件 ⇒ 八件」。**零新语义**（评审发现直接导出项）；产品码零触。

- 2026-10-12（**admin-chat-creds-merge 批 · 设计轮 · eng-designer**——承批档 `docs/batches/2026-10-12-admin-chat-creds-merge.md` §1 · 台账 #1326；**用户 2026-10-12 裁：SSH 凭据进管理面 chat ∥ 托管接入将来并入 chat ∥ 设主机表管 SSH 凭据**）：**收正面三处**（§9 KD-SV-90 行：`exec` 入 chat + 被否栏旧项删/新项入 ∥ §10 「SSH 凭据经 chat 文本输入」句收正（文本非通道——入口 = 弹窗） ∥ §12 「不入 chat 面」句改写（装机三件仍任务式 + 合并路线指针））∥ §9 增 **KD-SV-136**（`exec` 八件 ∥ 主机行绑定 ∥ 三单源 ∥ 掩蔽含行凭据值）∥ §12 表：`runners` 动词 + `revoke_credential`（`list` 行携 `ssh` 元数据）＋ 增 `exec` 行 ∥ §5 出口行 / §16.2 尾行 / §13 R71⑥ 三处**撤回注**（run 改道不再做——退场路线在册）∥ §7 判据行 ＋ §8 用例（N83 ∥ B79 ∥ E61）∥ §11 纪律句补「凭据请求 = 指向弹窗（不要请用户把凭据发在聊天里）」∥ §6 行账（`chat-tools.mjs` ⇒ ≈540 ∥ `chat.mjs` ⇒ ≈600 ∥ `chat-env.mjs` ⇒ ≈97 ＋ 本批另计 ≈+75 ＋ 批内件一件）。同源随动 = `sandbox/SANDBOX.md` §3/§14（KD-SV-133/134/135）∥ `webui/CHAT.md` §2.1 ∥ `webui/SANDBOX.md` §2.1① ∥ `design/PROJECT.md` §4（索引）。**产品码零触（设计轮）。**
- 2026-10-12（**server-wake-face 批 · 修订轮（fix 轮「加宽」）· eng-designer**——承批档 `docs/batches/2026-10-12-server-wake-face.md` §1.3/§1.4（条目 ③④ 入批）；用户 15:40「管理端目前没有查会话历史的工具，这个也需要打开。」∥ 15:44「这样不对，会让我们的帐和provider的帐对不上，应该走我们自己的模型代理服务，这样才能确保用量统计的准确，也应该跟客户端一样，登陆时分配一个sk给管理会话用。」；台账 #1323 ∥ #1324）：**新增 §16**（16.1 `read_history` = 核件原样 ＋ `recordStoreOf` 库面适配〔本会话作用域〕∥ 16.2 出口改道 = 网关链 loopback〔复用点逐字 ∥ 地址取数 ∥ 失败面 ∥ 差异三条披露〕∥ 16.3 管理面 sk〔登录 ensure ∥ v19 `key_plain` ∥ 审计 surface ∥ 披露两条〕∥ 16.4 机检五腿）∥ §5 出口行改写（两分：管理会话 = 网关链客户端 ∥ 任务式直连缺口在册）∥ §11 形态/回合两行同拍 ∥ §15.3③ 计费事实收正 ∥ §15.4 增出口腿指针 ∥ §6 行账（`chat.mjs` ⇒ ≈712 ∥ `chat-env-tools.mjs` ⇒ ≈350 ∥ `chat-store.mjs` ⇒ ≈161 ∥ `bin` 192 ⇒ ≈198 ∥ 修订轮另计 ≈+140）∥ §7 判据行 ∥ §8 用例 N76/N77/N78 ∥ B75 ∥ E58 ∥ §9 增 **KD-SV-129/130/131** ∥ §10 边界三条 ∥ §13 R71 收正（① 闭合 ∥ ③④⑤ 追加 ∥ ⑥ 未随正清单）∥ §14.2 六族八件（表 ＋ 载入 ＋ 端池 ＋ 描述面）＋ KD-SV-113 件单扩容 ＋ §1/§3 计数收正。同源随动 = `store/STORE.md` §1/§2（v19 `api_keys.key_plain`）∥ `accounts/ACCOUNTS.md` §1/§2.1/§3 ∥ `metering/METERING.md` §1（归因句）∥ `design/PROJECT.md` §4（索引）。**产品码零触（设计轮）。**

- 2026-10-12（**server-wake-face 批 · 设计轮 · eng-designer**——承批档 `docs/batches/2026-10-12-server-wake-face.md` §1 · 台账 #1317 ∥ #1319；用户 14:57「为啥给主agent bash的时候还加那么多限制，连异步都不支持？」∥ 14:58「我说的就是异步啊！」∥ 15:00「有process在，跑死了可以杀的，你没事加那么多限制干嘛！」∥ 15:06「定时器server能用吗」∥ 15:07「为啥要有这些差异？我真服了。」；定性 = 跨端用户可闻差异 = 缺陷）：**新增 §15 唤醒与投递面**（15.1 机制〔唤醒器 ∥ 投递汇 ∥ 唤醒回合 ∥ 异步面 ∥ 中止面〕∥ 15.2 对齐表十一行 ∥ 15.3 开放点四条 ∥ 15.4 机检口径）∥ §6 五档行账 + 新档 `chat-wake.mjs` 行 + 批内件行 + 另计行 ∥ §7 本批判据行 ∥ §8 用例 N74/N75 ∥ B72–B74 ∥ E56/E57 ∥ §9 增 **KD-SV-125/126** ∥ §10 边界随正（原两句剔除——其描述已失效；四项入）∥ §13 增 **R71** 行（需求档回笔建议 ∥ 开放点 ∥ 随正件 ∥ 披露 ∥ 部署收尾）∥ §14.2 端池参数处置行收正 ∥ §14.4 timer 投递面行指针化（机制归 §15——单一权威源）。**产品码零触（设计轮）。**

- 2026-10-12（**admin-agent-awareness 批 · 设计轮 · eng-designer**——承批档 `docs/batches/2026-10-12-admin-agent-awareness.md` §1 · 台账 #1310；用户 12:29/12:39/12:41/12:47 四句；功能点 43 ∥ AC-43 ①–⑥）：§1 驱动器行 + §3 尾句 + §11 两行随正（工具面 = 任务五件 + 管理面七件 + **环境五族七件 §14**；回合装配 + 环境块）∥ §6 增两新档行（`chat-env.mjs` ≈150 ∥ `chat-env-tools.mjs` ≈230）+ `chat.mjs` 预算行（599 ⇒ ≈640 + 拆档预案）+ 本批另计行 ∥ §7 增环境面判据行 ∥ §8 增用例（N72/N73 ∥ B70/B71 ∥ E55）∥ §9 增 **KD-SV-112/113/114**（四块装配 ∥ 工具面核件复用与限幅 ∥ 审计详情与页面模板）∥ §10 边界重写（server 本机族收正 + 五条不做面）∥ **增 §14（环境感知与环境工具面——四块装配/坐标表 ∥ 工具面五族七件 ∥ 限幅三件 ∥ 审计与 timer 投递 ∥ 核可达性结论）** ∥ §13 增 R62（含父侧两条裁决回笔 + 披露 + 部署收尾）。同源随动 = `accounts/ACCOUNTS.md` §2.1（`chat_call` detail 扩字段） ∥ `webui/READINGS.md` §2.1④/§3（审计页 agent 行模板 + 行数） ∥ `webui/SYSTEM.md` §3（i18n 两表 +3 键） ∥ `design/PROJECT.md` §2/§3/§4/§6/§7/§9。**产品码零触（设计轮）。**

- 2026-10-12（**admin-agent-awareness 批 · 设计评审轮 1 修正（fix 轮）· eng-designer**——承批档 `docs/batches/2026-10-12-admin-agent-awareness.md` §3 轮次 1 之 1/2/3/4/6；父侧受理全单）：#1 §13 R62① 补第三条登记（「环境行 `cwd:` 字段与 43⑤ 工作目录口径」入册——经父侧 2026-10-12 裁；落点 = `docs/server/requirements/PROJECT.md:250`）+ §14.1/§10 边界句同拍（不做 = git 上下文 ∥ 项目档注入 ∥ 同目录实例；cwd 在册）∥ #2 §14.1 部署身份探针非抛（三判据读取异常 ⇒ 按「独立进程」落值——无字段级略去、降级唯块级）∥ #3 KD-SV-114 与 §14.4 同拍补 `subject` 掩蔽句（落库前与 `call` 同链过会话面掩蔽——「原文」非免掩蔽）∥ #4 §6 三处行账翻正（`tools.mjs` 实读 **242** ∥ `chat-tools.mjs` 实读 **477**——已落盘 ∥ `docker-ops.mjs` 实读 **91**——已落盘；§12 同件标记同拍）∥ #6 §6 自名改批名三处。**零新语义**（评审发现直接导出项）。

- 2026-10-10（**runner-admin-console 批 · 托管接入（管理面 agent）设计 · eng-designer**——承批档 §2 · 台账 #1237/#1236；用户 22:19–22:29 四句 + 15:00/15:02 裁）：建档——形态（进程内 ∥ 核复用 KD-SV-78 ∥ 唯一一个）∥ 任务模型（run ∥ 预算 ∥ 读时轮询）∥ 工具面五件（exec/docker/register/verify/report——无围栏）∥ 自主边界与失败处置（硬点②）∥ 无人值守裁剪 ∥ KD-SV-82/87 ∥ 用例 N53/B47/E39。**产品码零触（设计轮）**。
- 2026-10-10（**runner-admin-console 批 · 设计评审轮 1 修正（fix 轮）· eng-designer**——承批档 `docs/batches/2026-10-10-runner-admin-console.md` §3 轮次 1 之 5/14）：#5 注册路径定——四端点经 `thincoder-server/src/sandbox/routes.mjs` 转注册（`bin` ±0——与 `sandbox/SANDBOX.md` §13 ∥ `PROJECT.md` §6 同拍）∥ #14 出口代理旗复核点指针写全（⇒ `PROJECT.md` §9 R53③）；同族：§6「构建/发布形」复核指针同拍。**零新语义**（评审发现直接导出项 + 同族指针收正）。
- 2026-10-11（**admin-agent-chat 批 · 设计轮 · eng-designer**——承批档 `docs/batches/2026-10-11-admin-agent-chat.md` §1 · 台账 #1254；需求 §5「两个 chat 界面」②④ + §1 后续议题；用户 2026-10-10 22:28 口径）：§1 驱动器行重写（两形——任务式 + 聊天式；本批落）∥ §1 成员面指针改指 **#1215** ∥ §6 预算表（`run.mjs`/`tools.mjs` 拟新增标记翻正实读 **137 ∥ 288**；+ 本批四新档 ≈960 ∥ `tools.mjs` −≈88）∥ §7 增聊天式判据行 ∥ §8 增用例 N54/N55 ∥ B48/B49 ∥ E40/E41 ∥ §9 增 **KD-SV-88/89/90/91**（聊天式驱动形 ∥ 会话持久化形 ∥ 工具面七件 ∥ 审计型 `agent_event`）∥ §10 边界随正（聊天式会话面条目删——成员面指针改指 #1215；+ chat 面不做条）∥ **增 §11（聊天式驱动——形态/回合/流式通路/在途门/重启恢复/判权审计/行动纪律句）与 §12（工具面扩展七件表——逐面回指）**。同源随动 = `store/STORE.md` §2 v14 段 ∥ `gateway/API.md` §2.8 ∥ `webui/WEBUI.md` §2.10 ∥ `accounts/ACCOUNTS.md` §2.1。**产品码零触（设计轮）**。
- 2026-10-11（**admin-agent-chat 批 · 设计评审轮 1 修正（fix 轮）· eng-designer**——承批档 `docs/batches/2026-10-11-admin-agent-chat.md` §3 轮次 1 之 1/2/9/10/11）：#1 §11 帧形钉死 `call` 帧 `args` = 字符串（参数摘要——JSON 序列化 ⇒ 掩蔽后截断 ≤500 字；非对象；与 `gateway/API.md` §2.8 逐字同拍）∥ #2 §12 成员行明写重置链共享助手边界（= 改密 + 清计；审计写不随迁——`recordAudit` 各留调用侧既有面）+ §7 补「chat 重置 ⇒ 既有域型零增」断言 ∥ #9 §1 指针收正（需求 §1 ⇒ §5 后续议题行）∥ #10 §11 回合行 + §7 补异常终态落库口径（部分文本 ⇒ `assistant` 行如实落库；notice 行独立；零文本 ⇒ 零 `assistant` 行——模型错误 ∥ 预算超限两径）∥ #11 增测试注入缝（§11——模型出口 ∥ 工具面模块级注入；默认 `null` ⇒ 回落真件）。**零新语义**（评审发现直接导出项）。
- 2026-10-11：闸面收净（doc-check 行宽/锚读数——本批面）——§11 回合/流式通路两行折行 ∥ §6 档表四行标记收正（「本批新增」⇒「拟新增——admin-agent-chat 批」）∥ §12 三处坐标收正（`thincoder-server/src/…` 全形——`:130`/`:132` 解析面 ∥ `:135` 补拟新增标记）。**零语义**。
- 2026-10-11（**admin-agent-chat 批 · 实施轮上抛回笔（fix 轮）· eng-designer**——承批档 `docs/batches/2026-10-11-admin-agent-chat.md` §6（实施轮上抛处置 + notice 补裁——④ 空回合单列 · 四值枚举））：§5/§9 KD-SV-87 行补机械读法（四处同词）∥ §11 回合行补 notice `data.reason` 各点名（② "budget" ∥ ③ "model_error" ∥ ④ "empty_turn"）+ 重启行点名 "restart"。**零新语义**（上抛裁决直接导出项）。
- 2026-10-11（**console-chat-align 批 · 设计轮 · eng-designer**——承批档 `docs/batches/2026-10-11-console-chat-align.md` §1 · 台账 #1282；用户 18:23 ①④ + 18:30「改」）：**增 §11.1 呈现面**（渲染面 = 复用 `thincoder-render-core`——取件形 = 控制台第二根 `/rc/*`；本域零变化（会话/回合/帧四形/role 四值/工具面/审计面不动）；帧面无 reasoning 通道 = 不做思考块的根因——余项）+ 工具卡呈现接线句（`renderToolCard`/`finishToolCard`——§12 语义面不变）。同源随动 = `webui/WEBUI.md` §2.10/§7 KD-SV-101 ∥ `design/PROJECT.md` §2.1/§4/§6/§9 R58。**产品码零触（设计轮）**。
- 2026-10-11（**server-doc-split 批 · 波 4（域档接收节 + 活面改指）· eng-designer**——承批档 `docs/batches/2026-10-11-server-doc-split.md` §2）：**增 §13「上抛/余项」**（板档 §9 迁入——R54 逐字；板档同类行 = 保位 stub）∥ §9 KD-SV-82 行并入驱动器两形句（与板档旧 §5 行对等）∥ 活面改指（webui 引用 ⇒ `webui/CHAT.md` §2.1 ∥ `webui/SANDBOX.md` §2.1①；R53③ 两处 ⇒ `sandbox/SANDBOX.md` §16——as-of）。**产品码零触。**
- 2026-10-11（**chat-shell-align 批 · 设计轮 · eng-designer**——承批档 `docs/batches/2026-10-11-chat-shell-align.md` §1 · 台账 #1292；用户 2026-10-11 21:55 裁「全套 ∥ 补后端一件不藏 ∥ VSC 式」；功能点 41 ∥ AC-41）：§6 两档预算随正（`chat.mjs` 498 ⇒ ≈600 ∥ `chat-routes.mjs` 105 ⇒ ≈150——零新档）+ 小计行补本批另计 ≈+145；§7 增四件后端 + 帧面判据行；§8 增用例（N64–N67 ∥ B65/B66 ∥ E50/E51）；§9 **KD-SV-87 收正**（会话内可换）+ 增 KD-SV-107/108/109（中止双通道 ∥ 换模型 ∥ 附件面）；§10 边界两项删（回合中止钮 ∥ 会话内换模型——D8）；§11 会话/回合/流式通路三行随正（第五形 `"aborted"` ∥ 帧面指针）+ **增 §11.2（输入区四件后端）与 §11.3（帧面扩展与状态行读数源）** + §11.1 补输入区翻做句；§13 增 R60（含 R54 ③ 两项交付失效句）；同源随动 = `webui/CHAT.md` §1/§2.1/§3/§4/§5/§6 ∥ `gateway/API.md` §1/§2.8/§4/§5/§7/§8 ∥ `webui/WEBUI.md` §1/§5/§6/§7 ∥ `webui/STYLE.md` §2.1/§3/§5 ∥ `store/STORE.md` §2 v14 段 ∥ `design/PROJECT.md` §4/§7/§9。**产品码零触（设计轮）。**
- 2026-10-11（**chat-shell-align 批 · 设计评审轮 1 修正（fix 轮）· eng-designer**——承批档 `docs/batches/2026-10-11-chat-shell-align.md` §3 轮次 1 之 1/2/3/5/9；父侧受理全单）：§13 R60① 需求档回笔标闭合（D8 删待办形）+ R60② 随正件补行（`…-console-chat-align.test.mjs` 两腿收正 ∥ 两测试件现读行数 + 增量注）∥ §7 批内件行补 `…-admin-agent-chat.test.mjs` 现读 715 行 + 增量注 ∥ §9 KD-SV-91 `chat_stop` 五值统一（+ 空回合 ∥ 手动中止）∥ §9 KD-SV-87 / §11.1 删修订式标记（「句删」两处）。**零新语义**（评审发现直接导出项）。
- 2026-10-11（**评审 #258 轮 2 残差 1 收正（🟡 文档卫生）· 父侧直改 · 可 revert**：KD-SV-87 / KD-SV-108 被否候选栏「原行」指针删去（保留否决事由）——规范面不携文档自身历史指针，历史归变更记录面）。
- 2026-10-12（**console-reasoning-levels 批 · 设计轮 · eng-designer**——承批档 `docs/batches/2026-10-12-console-reasoning-levels.md` §1 · 台账 #1303；用户 2026-10-12 11:45 走查 + 11:46 口径四条「行」核准；功能点 42 ∥ AC-42）：§6 两档预算实读复读（`chat.mjs` **575** ⇒ ≈585 ∥ `chat-routes.mjs` **158** ⇒ ≈178）+ 小计补本批另计 ≈+30；§7 增会话级思考档位判据行；§8 增用例（N71 ∥ B69 ∥ E54）；§9 增 **KD-SV-110**（会话级思考档位 = 库列 + 设置路由 + 装配携值——三件一套）；§10 边界补思考档位不做项（逐条覆写 ∥ 状态行段）；§11.1 本域零变化句收正（无 reasoning **文本**通道——与档位 `reasoningEffort` 两回事）；**增 §11.4（会话级思考档位——归属/值域源/设置路由/回合装配/控制台面）**；§13 增 R61（随正件 13 件坐标 + 披露三条 + 部署收尾）。同源随动 = `webui/CHAT.md` §1/§2.1/§3/§4/§5/§6 ∥ `gateway/API.md` §2.2/§2.8/§4/§8 ∥ `store/STORE.md` §1/§2/§3/§4 ∥ `design/PROJECT.md` §4。**产品码零触（设计轮）。**
- 2026-10-12（**console-reasoning-levels 批 · 设计评审轮 1 修正（fix 轮）· eng-designer**——承批档 `docs/batches/2026-10-12-console-reasoning-levels.md` §3 轮次 1 之 1–7；父侧受理全单）：§6 `chat.mjs` 行补拆分预案（越 500 软线——档位小段随拆档审查；800 硬限未越）∥ §7 批内件行补拆分预案（用例段随拆档审查）∥ §11.4 值域源条增**标识解析径**（对外标识 ⇒ 别名反查解上游真名——`providers.mjs`/KD-SV-59；源面行/PATCH 校验/装配三处同经）+ KD-SV-110 ②③ 同拍 + 被否栏补「别名退中性」驳回 ∥ §13 R60②③ 收正（`style.css` 五钮隐藏；无源钮隐藏五枚 + 推理钮 ⇒ 已交付 = KD-SV-111）∥ §13 R61① 结构版本断言 11 件逐件补现读（行数 ±0——数字就地收正）。**零新语义**（评审发现直接导出项）。
- 2026-10-12（**console-reasoning-levels 批 · 落地后回填 · 主 agent 直接执行 · 可 revert**）：§6 两档实读回填（`chat.mjs` **599** ∥ `chat-routes.mjs` **190**）；§13 R61① 结构版本断言枚举收正（11 件 ⇒ **实盘 20 件**——逐行见批档 §5 ④）+ R61② `views-chat.mjs` 实 500（恰贴软线）。
- 2026-10-12（**轻车道：撤 bash 自造 600s 超时上限 · 父侧机械 · 可 revert**——承批档 `docs/batches/2026-10-12-env-bash-cap.md` · 台账 #1318；用户 15:00「有process在，跑死了可以杀的，你没事加那么多限制干嘛！」）：§14.3 超时表行（核件本无上限——`bash.mjs:285` 直传；`process` 杀 + 中止杀树在册）∥ §9 KD-SV-113 ④ 同拍 + 被否栏「`bash` 无上限」删（该否已被用户 15:00 裁撤——D8）∥ §8 B71 收正（非有限值/小于 1 ⇒ 工具级错误；`700000` 受理形补）∥ §7 判据行同拍 ∥ §6 行账两处（`chat-env-tools.mjs` 229 ⇒ 230 ∥ 批内件 463 ⇒ 465）。评审 #273 导出项同笔。**产品码 = 仅 `chat-env-tools.mjs` 取值判据**（详批档）。
- 2026-10-12（**console-chat-live-step 批 · 设计轮 · eng-designer**——承批档 `docs/batches/2026-10-12-console-chat-live-step.md` §1 · 台账 #1325；用户 2026-10-12 15:58/16:02/16:03 三句；**AC-41 ② 缺陷收正**；KD-SV-132）：§11.3 标题与 `turn` 帧行收正（帧面 = 视图读数源——`turn` 帧**双职**：状态行轮次 ＋ 控制台活流分步界〔每到达 ⇒ 上一步收束、新步起〕——只写状态行一侧 = 误导源之一，本笔清理；控制台面机制 = `webui/CHAT.md` §2.1/KD-SV-132）。**服务端零改**（步界帧既有——`thincoder-server/src/agent/chat.mjs:499` 未动）；**产品码零触（设计轮）。**
- 2026-10-12（**console-chat-live-step 批 · 设计评审轮 1 修正（fix 轮）· eng-designer**——承批档 `docs/batches/2026-10-12-console-chat-live-step.md` §3 轮次 1 之 4）：端点族残留收正（§7 聊天式驱动行「四端点」⇒「六端点」＋「管理面七件逐件」⇒「八件」；§11 判权行「四端点」⇒「六端点」）；工具面/环境面两族计数经本设计轮实核 = **已在（兄弟轮）**（creds-merge fix #9「§1 驱动器行 + §12 题」∥ wake-face fix #2「§10/§15.2 三处」——零改）。**零新语义**（评审发现直接导出项）；产品码零触。
- 2026-10-13（**member-face-chat 批 · 设计轮 · eng-designer**——承批档 `docs/batches/2026-10-13-member-face-chat.md` §1 · 台账 #1215；用户 19:32/19:33；需求功能点 50 ∥ AC-50）：§1 关系句随正（成员面 = 独立档 `agent/MEMBER-AGENT.md`（第四壳）——#1215 归属经该批承接）∥ §10 边界行随正（成员面 server 域工具面归属 = KD-SV-153 分阶段）。同源随动 = `agent/MEMBER-AGENT.md`（新档） ∥ `webui/CHAT.md` §2.2 ∥ `sandbox/SANDBOX.md` §5/§8 ∥ `design/PROJECT.md` §2.1/§3/§4/§6/§7。**产品码零触（设计轮）。**
- 2026-10-13（**member-face-chat 批 · 设计评审轮 1 修正（fix 轮）· eng-designer**——承批档 `docs/batches/2026-10-13-member-face-chat.md` §3 轮次 1 之 1（🔴——父侧全采纳）：§1 关系句与 §10 边界行两处收正——成员面 server 域工具面归属 = `agent/MEMBER-AGENT.md` §2 **KD-SV-159**（范围 = 成员本人资源 ∥ 动作集 = 写面同集——单源；管理面运维件不入）；KD-SV-153 之「本批含读面四件 + `exec`」旧口径经该批收正。**零新语义**（评审发现直接导出项）；产品码零触。
- 2026-10-13（**member-face-chat 批 · 设计评审轮 2 修正（fix 轮 2）· eng-designer**——承批档 `docs/batches/2026-10-13-member-face-chat.md` §3 轮次 2 之 4）：#4 §6 小计行「member-face-chat 批另计」成员面五档 ≈920 ⇒ **≈940**（单源 = `agent/MEMBER-AGENT.md` §5 ∥ `design/PROJECT.md` §6）。**零新语义**（评审发现直接导出项）；产品码零触（设计轮）。
