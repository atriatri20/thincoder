# Thincoder Server · MCP 面（mcp/MCP）

> 板块 = server ∥ 本域 = mcp（MCP 服务器清单 ∥ 管理会话工具面挂载 ∥ 探活）；板总览 = `PROJECT.md`（文档地图 = §3）。
> 口径来源 = 用户 2026-10-13 23:0x 原话「应该能够支持mcp，这样管理会话能够实现web搜索等能力，如果也给成员侧会话用就更好。」；
> **功能点 54 ∥ AC-54 = 已入册**。
> 核侧基座 = `thincoder-core/mcp.mjs`（CLI/VSC/桌面三端在用；核侧参考设计 = `docs/core/design/MCP.md`）。
> 本刀范围 = 第一块石头：管理会话解裁 ＋ 最小配置面（清单可管可探活）；成员侧随 #1215（形预留 = §6）。

## 1. 定位与形态

- **一句话**：MCP 面 = **服务器级 MCP 服务器清单**（库单源）＋ **管理会话工具面挂载**（逐回合读清单 ⇒ 核建连 ⇒ 工具并入）＋ **探活**（核零副作用探活）——三件一套（清单可管 ∥ 工具可用 ∥ 连通可验）。
- **拓扑**：MCP 服务器由 **server 进程**建连——stdio = server 同机子进程（`spawn`——同容器环境）；http/ws = server 出向。执行者 = server；盒与浏览器零涉。
- **形态**：进程内直取（清单行读 = 库；建连/探活 = 核件）——零 HTTP 回环（沿 KD-SV-82 口径）。
- **最近先例（对齐 ∥ 偏离）**：
  先例① = **CLI/VSC/桌面 MCP 面**（核单源装配）：`thincoder-cli/src/cli/make-agent.mjs:58`（读 `config.mcp.servers`）+ `:87-101`（`connectMcpServer` 逐服务器 + 并集入 `agent.tools` + 失败仅 warnings 不抛）；
  `thincoder-vscode/src/extension/panel-mcp.mjs:53-67`（allSettled + 逐条 warning）+ `thincoder-vscode/src/agent/tool-table.mjs:178-184`（并集）；`thincoder-desktop/src/main/agent-assemble.mjs:32-52`（同形）；装配缝单源 = 核 `thincoder-core/agent/assemble.mjs:105`（`toolsFinalize`）。
  先例② = **服务器 agent 核件复用形**（`agent/ADMIN-AGENT.md` §14.2/§16.1——实现 ∥ schema ∥ 描述三面同源；动载 + 注入口 + 缺核降级；KD-SV-113）。
  **对齐** = 核件原文复用（协议/传输/命名/探活全在核——零第二实现）＋ 建连失败不阻断回合；**偏离** = ① 逐回合装配（三端 = 进程/会话一次性装配；服务端常驻——清单读时读，§2.2）；② 清单 = 库单源（三端 = `config.json` 文件）；③ 失败冷却（三端一次性装配无重复成本；服务端逐回合须防死服务器拖慢每回合，§2.2）；④ 凭据 = 密列零回显（三端 = 明文配置文件；服务端多 admin 共享面，沿主机凭据先例）。

## 2. 解裁与挂载（管理会话面——问题①③）

### 2.1 解裁形

- **事实核读**：`thincoder-server/src/agent/run.mjs:17` `TRIMMED_FACES`——**该常量全仓零代码消费 ∥ 零测试断言**（实读：唯一命中 = 定义行；另在需求档/设计档数处作文本引用）；挂载真实落点 = **chat 面工具面装配**（`thincoder-server/src/agent/chat.mjs:346` `buildChatToolFace`——并三面：管理面 ＋ 环境族 ＋ MCP 面；§2.2）。
- **原理由核读（在案）**：裁剪文件对 `mcp` **零命中**；`agent/ADMIN-AGENT.md` §5 裁剪句未点名 mcp（所点族 = TTY/记忆/台账/子代理/浏览器）⇒ mcp 归入兜底条款「与运维任务无关族……按任务需要再逐族接」（**推定——如实登记**：当时 admin agent = 任务式沙箱装机，MCP 无角色）。
- **解裁落点 = 管理会话（chat）面**：MCP 工具随回合并入 chat 工具面（§2.2）——用户点名的「管理会话 web 搜索」由此兑现。
- **`TRIMMED_FACES` 收正**：删 `"mcp"`（该常量 = 管理面 agent 裁剪族清单；mcp 经挂载 ⇒ 移出——`thincoder-server/src/agent/run.mjs:17` 一行 + 注释同拍）。
- **任务面（run）维持不挂载**：任务面 = 沙箱装机专用五件（`thincoder-server/src/agent/tools.mjs`——`thincoder-server/src/sandbox/onboarding.mjs:190` 装配）；环境族同等裁决在先（`agent/ADMIN-AGENT.md` §3 尾句「任务面不含 server 本机族」——同族口径）；且 run 退场路线在册（合并进 chat）。

### 2.2 挂载接法（装配点核读）

- **装配点** = `thincoder-server/src/agent/chat.mjs:514-515`：注入面（测试）优先；否则 `buildChatToolFace`（`:346`）造面——管理面九件（`chat-tools.mjs` 八件 ＋ 管面 `mcp`——`thincoder-server/src/mcp/admin-tools.mjs`；§12.2）＋ 环境族八件（`chat-env-tools.mjs`）—— **＋ MCP 面**（新件 `thincoder-server/src/mcp/face.mjs`）。
- **面形**（与环境族同形——`{ names, schemas, invoke }`）：`createMcpToolFace({ db, log, now })` ⇒ 工具名表/schema 表 + `invoke(name, args, ctx)`。
- **按名路由（`mergeToolFaces` 泛化——`thincoder-server/src/agent/chat.mjs:304-312`）**：文本面 = 环境族 ∪ MCP 面（`invoke` 携 `ctx`——中止信号透传核件 `ctx?.signal`；模型可见形 = **文本原文**——非 JSON 壳，沿 KD-SV-113）；其余 = 管理面（两参 ∥ JSON 出——既有零变）。
- **逐回合装配 = 读时读**：每回合读 `mcp_servers`（enabled 行）⇒ 逐服务器 `connectMcpServer`（核 `_sessions` 幂等——同 name 同指纹命中 = 零握手直取缓存工具；指纹变更 ⇒ 核自动重建，`thincoder-core/mcp.mjs:244-256`）；**失败降级 = 跳过该服务器 + 日志一条**（回合不阻断——对齐三端 warnings 口径）；核件缺失 ⇒ MCP 面不挂载 + 一条警告（沿 §17.3 缺核降级共轨）。
- **失败冷却（进程内）**：建连失败 ⇒ 记 `name → failedAt`；冷却窗 60s 内跳过该服务器（零连接尝试——防死服务器每回合拖慢装配至核 `INIT_TIMEOUT_MS` = 30s）；窗满重试；**探活成功/手动探活 ⇒ 清冷却**；零持久化（重启清零——与核 `_sessions` 同判）。
- **命名面**：`{server}_{tool}` = 核单源（`thincoder-core/mcp.mjs:146-155`——sanitize + 碰撞 `_N` 后缀）；**跨面重名防御** = 合并前扫「静态两面（管理 ∥ 环境）∪ MCP 面既往件名集」——相撞 ⇒ 该件（后到者）不挂 + 日志一条（零静默）。
  **何故扩面**：核件去重集逐 `buildTools` 调用新建——只护单 server 内 ∥ `sanitizeToolName` 归一非字母数字（`thincoder-core/mcp/helpers.mjs:49-51`），`web.search` ∥ `web search` ∥ 64 字符截断可同形 ⇒ 服务器 × 服务器重名在此收口（先者留存）。
- **工具数**：无上限、无逐个开关（对齐三端；配置面自担——披露项，§12 R86③）。
- **生命周期**：删行/停用 ⇒ 关闭该服务器会话（核导出面 `removeMcpTools`（`:296`）/`closeAllMcp`（`:280`）——零自造关闭链；`face.mjs` 持最近工具表为关闭靶）；
  **停机收尾** ⇒ `closeAllMcp`（`bin/thincoder-server.mjs` 停机路径一行——stdio 子进程（POSIX `detached`）不随父进程自然退出，须显式杀树；`kill -9` 残留 = 披露项）。
- **测试注入缝**：`deps.mcpConnectImpl ?? null`（建连替身——沿 `deps.execImpl` 先例）∥ `deps.mcpProbeImpl ?? null`（探活替身——N3 两径）∥ `deps.mcpCloseImpl ?? null`（关闭替身——N5 停机收尾）；三缝缺省 `null` = 生产零变；核件真件亦可（仓内直引）。

## 3. 配置面（问题②）

### 3.1 存储（库单源）

- **清单 = `mcp_servers` 表**（v24 增段——DDL 全文 = `store/STORE.md` §2 v24 段；判据 = 其 §3 v24 行）：**server 全局单份**（非逐用户 ∥ 非逐会话——用户原话「成员侧随后同享」⇒ 单份清单）。
- 列面：`name`（唯一）∥ `transport`（`stdio`/`http`/`ws` 三值 CHECK）∥ `command`/`args_json`（stdio——`args_json` = 参数字符串数组；**UI 行形 = 每行一条**，提交按行拆分并过空行 ⇒ 数组，空 ⇒ `[]`）∥ `url`（http）/`ws_url`（ws）∥ `secret_cipher`（密文——AES-256-GCM；`{ token?, headers?, env? }` 合一；NULL = 零敏感字段）∥ `enabled` ∥ 两时间列。
- **存库不落 config.json**：理由 = 服务器存储先例（providers/runners 等皆库单源）＋ 控制台 CRUD 须服务端校验/审计（文件写 = 第二路径）。
- **凭据形**：`token` ∥ `headers` 值 ∥ `env` 值 = 敏感类 ⇒ 入密文列（`src/store/credential-crypto.mjs` 既有件——沿主机凭据/私有仓凭据先例）；**零回显**（列表/详情响应只携 `hasSecrets` 布尔）；
  **编辑三态** = 字段缺席 ⇒ 不变 ∥ 显式 `null` ⇒ 清空 ∥ **空串/空对象 ⇒ 不变**（编辑窗「留空」= 未改动；**清空唯一入口 = `null`**——providers「空串 = 清」先例**不沿用**，防控制台空串提交静默清凭据——实作 = `src/mcp/store.mjs` 敏感三键归一段）；`${env:VAR}` 引用透传（核 `env-ref.mjs` 建连期解析——`env` 面 = server 进程环境）。
- **明文列可含秘密的如实边界**：`command`/`args` 明文（如把 key 写进参数——用户自担；指引 = 凭据走 `token`/`env`）——披露项。

### 3.2 端点（契约 = `gateway/API.md` §2.13）

- 族 = `/api/admin/mcp*`（`requireAdmin`——`user` ⇒ 403 ∥ 无/过期会话 ⇒ 401）；错误形 = §3 全码沿用（零新码；探活例外——自含状态，沿 `proxy/test` 先例）。
- 五端点：

| 方法 + 路径 | 语义 |
|---|---|
| `GET /api/admin/mcp` | 清单（库序）：`{ servers: [{ id, name, transport, target, enabled, hasSecrets, createdAt, updatedAt }] }`（`target` = 非秘密寻址形——command ∥ url/wsUrl；零秘密） |
| `POST /api/admin/mcp` | 新增：`{ name, transport, command?, args?, url?, wsUrl?, headers?, token?, env?, enabled? }`（`enabled` 缺省 = 启用——与 v24 DDL 缺省值 ∥ 控制台缺省勾同拍）⇒ 200 `{ id }`；形非法（名空/重名/传输三择/必填缺/类型错）⇒ 400（库零变） |
| `PATCH /api/admin/mcp/:id` | 改（**字段缺席 = 不动**；敏感字段**三态** = 缺席 ⇒ 不变 ∥ `null` ⇒ 清 ∥ **空串/空对象 ⇒ 不变**（清空唯一入口 = `null`——防控制台空串提交静默清凭据））；`{ enabled }` 切换走本端点；形非法 ⇒ 400 库零变；不存在 ⇒ 404 |
| `DELETE /api/admin/mcp/:id` | 删（硬删——providers 先例）＋ 关闭该服务器会话；不存在 ⇒ 404 |
| `POST /api/admin/mcp/probe` | 探活（零副作用）：体 = `{ id?, name?, transport?, command?, args?, url?, wsUrl?, headers?, token?, env? }`——`id` 在场 ⇒ 缺席字段（含非秘密：`transport`/`command`/`url`…）一律**回落库内行**（编辑窗/行内探活）；`transport` 仅无 `id` 草稿态必填；全量草稿（新建窗）亦可 ⇒ 200 `{ ok, toolCount?, tools?, latencyMs?, error? }`（自含状态——`ok:false` 仍 200，沿 `proxy/test` 口径；`tools` = 工具名数组——非空字符串） |

- **添加不强制探活**（先落库后探活——可达性非配置成立条件）；探活 = 显式动作（窗内「测试」＋ 行内「探活」）。

### 3.3 探活（核件复用）

- 件 = 核 `probeMcpServer`（`thincoder-core/mcp.mjs:97`——零副作用：不进 `_sessions` ∥ 不动工具面 ∥ `finally close`）；读数形 = `{ ok, toolCount, tools, latencyMs }` ∥ `{ ok:false, error }`（`tools` = 工具名数组——名非字符串/空名剔除）。
- 超时 = 核 `INIT_TIMEOUT_MS`（30s——`thincoder-core/mcp/helpers.mjs:5`）；核件自持，服务端零第二套超时。
- 读数呈现（控制台）= 两形同件（`probeReadoutText`——`thincoder-server/public/views-mcp.mjs:58-63`；行内 ∥ 弹窗两入口同形）：**具名形**
  `✓ {toolCount} 个工具：{tools}，{latencyMs}ms`（i18n `admin.mcp.probeOkNamed`）∥ **计数形**回落 `✓ {toolCount} 个工具，{latencyMs}ms`
  （`tools` 缺失/空——零工具 ∥ 旧核响应；i18n `admin.mcp.probeOk`）；败 = `✗ {error}`。CLI `/mcp test` 形 = 计数形来源（`thincoder-cli/src/tui/cmd-mcp.mjs:132-137`）。
- 探活零落库零审计（诊断面——沿 `proxy/test` ∥ `embedding/test` 先例）。
- **发行链（补丁入镜径）**：服务器镜像内核 = npm 声明依赖（非仓内副本）⇒ 核侧补丁须随**核发行波**入镜（挂下个常规核发行波——发行钩子 = `thincoder-core/CHANGELOG.md` `[Unreleased]` 行）；发行前生产读数 `tools` = 空 ⇒ 显示回落计数形。

### 3.4 控制台落点（一页一职责）

- **新页 `#/admin/mcp`**（管理组 +1）。
- 页形 ∥ 键族 ∥ 最近先例 = `webui/MCP.md`（机制全文——本档只定落点）。

## 4. 核件复用与装配（问题③）

- **引核件（file 级——+1 件）**：`@thincoder/core/mcp.mjs`——取用导出 = `connectMcpServer`（`:236`）∥ `probeMcpServer`（`:97`）∥ `closeAllMcp`（`:280`）∥ `removeMcpTools`（`:296`）；
  随件子面（内部依赖——同包发布）：`thincoder-core/mcp/helpers.mjs` ∥ `mcp/transport-stdio.mjs` ∥ `mcp/transport-http.mjs` ∥ `mcp/transport-ws.mjs` ∥ `thincoder-core/env-ref.mjs`（`${env:VAR}` 解析——建连/探活/重连同享）。
- **发布可达**：核 `package.json` `files` 含 `"*.mjs"` 与 `"mcp/"`（`thincoder-core/package.json:37-53`）＋ `exports "./*"`（`:31-33`）⇒ 子路径直引可达；
  版本地板 = 服务端设计档 `PROJECT.md` §2.3 ∥ **件清单单源 = `agent/ADMIN-AGENT.md` §17.2（同拍增行）**——核先于/同拍发行（KD-SV-138③）；件龄早于依赖地板 `^0.10.4` ⇒ **pin 零升**。
- **零第二实现声明**：协议握手 ∥ 三传输 ∥ 工具命名 ∥ 探活 ∥ 重连/退避 ∥ 输出截断（32KB）∥ 结果提取——全在核件；本域件只做 **清单行 → 核 config 形** 映射 ＋ **工具面归一/审计** ＋ **失败冷却**。
- **建连参形**（`store.mjs` 映射）：`{ name, command, args, env }` ∥ `{ name, url, headers, token }` ∥ `{ name, wsUrl, headers, token }`（核 `mcp.mjs:3` 头注 + `:70-87` 分派）；`headers`/`env`/`token` 自密文列解出后传入（核再解 `${env:VAR}`——两层各司其职）。
- **结果归一**（沿 KD-SV-113 四字段）：`{ ok, subject, summary, output }`——`output` = 核件文本（模型可见形经会话面 ≤4000 字截断——KD-SV-89 单源）；`subject` = 服务器名（核 `_mcpName`——审计主语）；`summary` = 人话单行（含服务器名与成败）；`ok` = 调用完成（MCP 报错 ⇒ 核件抛 ⇒ `ok:false` + 人话 message）。
- **管面（agent 侧）**：管理会话经工具 `mcp`（`list ∥ add ∥ update ∥ remove ∥ probe`）消费本域——**复用面 = `store.mjs`（CRUD ∥ 探活体解析 ∥ 视图）＋ `face.mjs`（关闭 ∥ 核装载 ∥ 冷却清理）**（零第二实现）；机制全文 = `agent/ADMIN-AGENT.md` §12.2（本域不重复）；用面/管面分置（成员面复用面仍 = `face.mjs`——§6）。

## 5. 安全 ∥ 审批 ∥ 审计（问题④）

- **审批面 = 管理面写类门挡覆盖**：MCP 件恒 `readonly:false`（核 `thincoder-core/mcp.mjs:160`）⇒ 管理面逐调用弹审批卡（`permission` kind——机制 = `agent/ADMIN-AGENT.md` §11.5；2026-10-17 用户裁）；与 `bash`/`exec`/`docker` 同姿态（写类 = 问）；护栏双层 = 提示词级纪律句（先查后动 ∥ 破坏性先说明）＋ 卡面机制；逐调用审计不动。
- **审计（工具调用）**：每调用一 `chat_call` 行（`agent_event`——面不扩 ∥ 零新 kind）：`tool` = 挂载名 ∥ `subject` = 服务器名 ∥ `call` = 参数摘要（掩蔽 ≤500）∥ `resultCode` = 0/-1 ∥ `truncated` ∥ `summary`（≤300）——既有链零改（`thincoder-server/src/agent/chat.mjs:675-682` 逐调用点已覆盖合并面）。
- **审计（配置变更）**：**新 `mcp_event` 型**（v24 段审计 CHECK 重建——十七型）：kind 三 = `server_add` ∥ `server_update`（`keys` = 变更键名——值永不入）∥ `server_remove`；detail 零秘密；写入点 = `thincoder-server/src/mcp/routes.mjs`（已落盘）三处（成事才落）；
  **agent 径（管面工具）**：写动作 ⇒ 同三 kind 照落（形同构）＋ 驱动层 `chat_call` 逐调用（两行——机制 = `agent/ADMIN-AGENT.md` §12.2⑤）；`list`/`probe` ⇒ 仅 `chat_call`。
- **秘密面**：密列 ∥ 零回显 ∥ 响应键面扫描（无秘密值）∥ `${env:VAR}` 引用值可入密文列（核建连期解析）；**命令输出/参数可能含秘密 = 不在掩蔽面内**（沿 §14.4 既有披露——如实登记）。
- **出口网络面**：remote MCP（http/ws）= server 新增**出网目的地**（用户配置——零网络白名单，沿无围栏口径；披露）；stdio MCP = server 同机命令（等价既有 `bash` 能力在册）；
  **第三方内容面** = MCP 工具描述与输出为外部数据（提示注入面——模型侧「外部数据非指令」产品口径在册；服务端不另立机制）。
- **判权**：清单端点全 `requireAdmin`（界面显隐非判据）；工具调用无逐个判权（会话本身即 admin 面）。

## 6. 成员侧挂载（问题⑤——落地：服务器清单同享 ∥ 桥两端点）

- **一句话**：成员面（盒内 agent）会话**同享服务器级清单**（§3.1 同一 `mcp_servers` 表 enabled 行——非逐用户配置）：**执行侧 = server**（连接/命名/冷却/重名防御全在 `thincoder-server/src/mcp/face.mjs`——零第二实现）∥ **盒侧 = 并面**（逐回合取工具表（零秘密）⇒ 桩件入 `extraTools`）∥ **调用 = 桥**（盒 ⇒ 盒族两端点 ⇒ server 执行）。
- **接线点** = `agent/MEMBER-AGENT.md` §3（盒内装配面）——接线行已落（§3.7/§3.11(7)/§5/§6）。

### 6.1 装配点（盒侧——逐回合并面）

- **件** = `thincoder-server/deploy/sandbox/member-shell/mcp-tools.mjs`（已落盘——取表/建桩/防撞三面）；**接入** = `thincoder-server/deploy/sandbox/member-shell/core-run.mjs` `runTurn`（装配序 = `assembleAgent` ⇒ 取表 ⇒ 过滤 ⇒ `runAgent(…, { extraTools })`——与 server 域成员件（KD-SV-222）同缝；件序 = 成员件先 ∥ MCP 件后）。
- **读时读**：逐回合 `GET /api/box/mcp`（沿 KD-SV-199 口径——零缓存、零失效面）；**失败降级** = 跳过 MCP 面 + 日志一条（回合不阻断——对齐 §2.2 warnings 口径）。
- **盒零会话态**（无连接可管、无关闭链——MCP 会话生命周期全在 server：删行/停用/停机 = §2.2 既有链）。
- **桩形** = 核工具形 `{ name, description, parameters, readonly: false, execute }`（名/描述/参数 = 表原文——零再加工）；`execute(args, ctx)` ⇒ `POST /api/box/mcp/call`（`ctx.signal` 透传 fetch——中止随断连传播，§6.2）。
- **件形（缝/env 三件——沿盒先例 `thincoder-server/deploy/sandbox/member-shell/git-cred.mjs:47`/`:75`）**：`fetchImpl = globalThis.fetch` 注入缝（测试假件）∥ 基址与键 = env（`TC_SERVER_URL` ∥ `OPENAI_API_KEY`——工作区 key）∥ 超时 = `AbortSignal.timeout`（`ctx.signal` 在场 ⇒ `AbortSignal.any` 合流——中止随断连传播，§6.2）。
- **子代理面 = 不携 MCP 件**（`extraTools` 缝只达顶层回合；子代理工具面 = 核角色矩阵自持——如实登记，如需对齐另裁）。

### 6.2 清单消费（桥两端点——盒出向；判权 = 工作区 key（第二门，沿 `/api/box/*`））

- `GET /api/box/mcp` ⇒ 200 `{ tools: [{ name, description, parameters }] }`——**零秘密**（密文列解出只在 server 侧建连用，明文不出服务器）；清单空 ∥ 全部冷却跳过 ⇒ `{ tools: [] }`。
- `POST /api/box/mcp/call`（体 `{ name, args }`——`args` 原文转核件）⇒ 200 `{ ok, subject, summary, output?, message? }`（沿 KD-SV-113 四字段；`ok:false` 仍 200——自含状态，沿探活先例）；未知件名 ∥ 冷却中 ⇒ `ok:false` 人话；请求断连 ⇒ 中止上游（AbortController ⇒ `face.invoke` 的 `ctx.signal` 透传核件 `sendWithSignal`）。
- **服务端执行** = `createMcpToolFace`（`thincoder-server/src/mcp/face.mjs`——**复用零改**）：两请求各建面一次（核 `_sessions` 幂等 ⇒ 存活命中直取缓存工具；冷却/重名防御/日志全在件）；桥件 = `thincoder-server/src/mcp/member-bridge.mjs`（已落盘——两处理器 + schema 映射 + 中止接线）；注册 = `thincoder-server/src/agent/box-routes.mjs`（盒族同文件——判权/体读沿族）。
- **日志零秘密**（参数/输出零入日志——沿 §5 既有纪律）。

### 6.3 审批面（写类门挡 ⇒ 审批卡）

- **MCP 件恒 `readonly:false`**（核 `thincoder-core/mcp.mjs:160`）⇒ 逐调用吃核权限门挡（`thincoder-core/agent/dispatch.mjs:177-231`）⇒ **审批卡**（`permission` kind；ask 回路 = `agent/MEMBER-AGENT.md` §3.11(2) ∥ KD-SV-217——本域零专属机制）。
- **零 MCP 专属门**：词表（`once`/`always`/`reject`）、批门、`always` ⇒ 槽 `autoApprove` 短路——全沿核语义；卡面 = 挂载名（`{server}_{tool}`）+ 参数（掩蔽 = 帧面单点）。

### 6.4 审计面（零新 kind）

- **逐调用 = `member_event`/`chat_call` 行**（帧面单源——`thincoder-server/src/agent/member-relay.mjs:274-277`：`result` 帧对位 `call` 帧落行——`tool` = 挂载名 ∥ `resultCode` ∥ `summary`）；拒执行（门挡）调用同落行（`ok:false`）。
- **配置变更 = `mcp_event` 三 kind 不变**（admin 侧——成员面零配置面）；**取表不审计**（读面——沿既有）；本域**零新审计型/kind**（AC-28 计数零动）。

### 6.5 工具命名与展开（核单源 + 盒侧防撞）

- **名** = 核单源（`thincoder-core/mcp.mjs:146-155`——`{server}_` 前缀 + sanitize + 同 server 内 `_N` 后缀）；跨 server 同形 = `face.mjs` 收口（先者留存 + 日志——§2.2）；**盒零再加工**（名原文直用）。
- **展开** = 每次取表随核会话现状（`tools/list` 全量——服务器侧工具增删随核重连可见；沿既有口径）。
- **盒侧跨面防撞**：合并前扫「装配后基集（`agent.tools`）∪ 注入件名集（member-tools/pull）」——相撞 ⇒ **该 MCP 件不挂 + 日志一条**（后到者失位——对齐 §2.2 先者留存）。
  **家族段名集 = 核 §2.3F 注入方义务域**（`thincoder-core/agent/setup.mjs:217`）——盒不核家族名（与三端同律；披露在案；默认补法 = 盒经核件 `assembleFamilyTools` 同参现算一名集——成本一小调用，未裁不做）。

### 6.6 边界与披露

- **秘密零出服务器**（对比 git 凭据经盒 = 成员本人凭据；MCP 凭据 = 服务器级共享——盒永不见明文；§6.2）。
- **协议面盒零涉**：stdio 子进程/http/ws 出向全在 server 容器（盒不跑 MCP 命令、不建传输）；**被否**：盒内直连核件（秘密出服务器 ∥ `face.mjs` 不可复用 ⇒ 二实现面 ∥ 盒镜像命令/资源面复本——否）。
- **工具数/开关**：无上限、无逐件开关、无逐成员清单（= §2.2/§3.1 同判——「非逐用户配置」逐字）。
- **第三方内容面**：工具描述与输出 = 外部数据（提示注入面沿 §5 口径）；命令输出/参数可能含秘密 = 不在掩蔽面内（沿 §5 披露）。
- **管面 admin 专属不变**：`thincoder-server/src/mcp/admin-tools.mjs`（`mcp` 工具——agent 侧管理）不入成员面复用面（复用件仍 = `face.mjs`）。
- **退役/部署**：盒零态（server 侧 = §2.2 既有链）；盒镜像重建 = 新件入镜判据（收口轮实走）。

## 7. 本域边界（不做的面）

- **协议件开发**（新传输/新版本协商/资源与提示能力面——本刀只消费 `tools` 面；核件覆盖面 = 核侧档单源）。
- **OAuth/授权流程**（MCP 规范授权面——授权形 = `token`/`headers` 自持）。
- **MCP 市场/目录/预置清单**（用户点单配置——不预置）。
- **逐用户 ∥ 逐会话配置**（§6）；**工具级开关/白名单**（§2.2——无逐个开关）。
- **探活巡检/历史**（探活 = 手动动作；零落库）。
- **成员面配置/探活面**（成员会话 = 消费侧：零配置面、零探活钮、零逐件开关——清单与凭据全在管理面；§6）。
- **管面（agent 侧）不做**：草稿试连（= 控制台新建窗面）∥ 逐服务器工具开关/白名单（§2.2——无逐个开关）∥ 成员面（§6）——设计 = `agent/ADMIN-AGENT.md` §12.2⑥。

## 8. 用例（本域）

| # | 类 | 输入 | 预期输出 |
|---|---|---|---|
| N1 | 正常 | 假 db（一 stdio 服务器行）＋ 假建连替身：chat 一轮发起调用 | MCP 工具在场（名 = `{server}_{tool}`）；`call`/`result` 帧逐值；`chat_call` 行（tool=挂载名 ∥ subject=服务器名）；结果 ≤4000 字落库；预算计数含本次 |
| N2 | 正常 | 真库 + 假 MCP 件（核真件仓内直引改替身）：POST 新增 ⇒ GET 列表 ⇒ PATCH `{enabled:false}` ⇒ GET ⇒ DELETE ⇒ GET | 行逐值（`hasSecrets` 布尔——零秘密）；停用后下回合工具面不含该服务器件；`mcp_event` 三 kind 行逐值 |
| N3 | 正常 | 探活两径：行内（体 `{id}`）∥ 新建草稿（体 = 全量） | `{ ok:true, toolCount, tools, latencyMs }` 逐值（替身）；库零变 ∥ 核 `_sessions` 零增（零副作用断言） |
| N4 | 正常 | 编辑窗留空秘密 + 改 url ⇒ PATCH；「清除」勾 ⇒ PATCH `{token:null}` | 秘密列不变（库内密文逐值）∥ 清除后 `hasSecrets=false` |
| N5 | 正常 | 停机收尾（假 stdio 件） | 停机路径调 `closeAllMcp`（假件断） |
| B1 | 边界 | 建连失败（替身抛）＋ 冷却窗内第二回合 | 首回合跳过 + 日志；第二回合零连接尝试（假件计数）；窗满重试；探活成功 ⇒ 清冷却 |
| B2 | 边界 | 名碰撞（服务器名使工具名撞静态面件 ∥ 两服务器 sanitize 同形件——`web.search` ∥ `web search`）∥ 空清单 | 该件（后到）不挂 + 日志（其余照常——先者留存）∥ MCP 面 = 空面（工具面逐字 = 既有 16 件） |
| B3 | 边界 | 编辑体缺字段 ∥ 显式 `null` ∥ 传输切换缺必填 | 缺席 = 不变（库逐值）∥ `null` = 清 ∥ 400 库零变 |
| E1 | 错误 | 形非法五形（名空 ∥ 重名 ∥ 传输表外 ∥ 必填缺 ∥ `args` 非字符串数组） | 逐形 400（人话）；库零变 |
| E2 | 错误 | 探活失败（替身抛）∥ 缺核件 | `{ ok:false, error }`（200 自含）∥ MCP 面不挂载 + 警告（回合照跑） |
| N6 | 正常 | 成员面桥（假 db 一启用行 ＋ 假建连替身；盒桩取表 ⇒ 并面 ⇒ 调一件） | `GET /api/box/mcp` 零秘密（名/描述/参数逐值）∥ `POST /api/box/mcp/call` 恰一 ⇒ `{ ok, subject, summary, output }` 逐值 ∥ 桩件入 `extraTools`（顶层）∥ `chat_call` 行（tool = 挂载名）随帧落 |
| B4 | 边界 | 取表失败（替身抛）∥ 清单空 ∥ 件名撞基集 ∥ 请求断连 | 跳过 ＋ 日志（回合照跑；工具面零 MCP 件）∥ `{ tools: [] }`（桩零）∥ 该件不挂 ＋ 日志（先者留存）∥ 上游中止（假件断） |
| E3 | 错误 | `call` 得 `ok:false`（未知件 ∥ 核件抛）∥ 盒侧 HTTP 失败 | 桩件抛（模型见 `Error:` 人话——回合不停）∥ 同判（同径） |

## 9. 关键决策（本域——KD-SV-196–201）

| # | 决策 | 理由 |
|---|---|---|
| KD-SV-196 | **解裁形 = 管理会话（chat）面挂载 ＋ `TRIMMED_FACES` 删 `mcp`；任务面（run）维持不挂载**（问题①） | 用户点名「管理会话」（原话）；chat 面装配点空位（`thincoder-server/src/agent/chat.mjs:316-338`）；常量 = 描述性（零消费）；任务面 = 装机专用（环境族同族裁决先例）+ run 退场路线 |
| KD-SV-197 | **清单 = `mcp_servers` 库表（server 全局单份）＋ 五端点 ＋ 控制台新页 `#/admin/mcp`**（问题②） | 服务器存储先例（providers/runners 皆库单源）；控制台 CRUD 须服务端校验/审计；一页一职责（资源清单族：Provider/镜像源同族） |
| KD-SV-198 | **凭据 = 密文列（`token`/`headers`/`env` 合一——AES-256-GCM）＋ 零回显 ＋ `${env:VAR}` 透传**（问题②） | 主机凭据/私有仓凭据同一密列纪律（本 server 多 admin 共享面）；核 `env-ref` 解析在件（零第二实现）；编辑「留空 = 不变」沿 providers 先例 |
| KD-SV-199 | **挂载形 = 核件原文复用 ＋ 逐回合装配（读时读）＋ 失败冷却 ＋ 文本面路由（ctx 透传）**（问题③） | 核建连/命名/重连/截断全在件（零第二实现——KD-SV-113 同精神）；逐回合 = 常驻进程下清单可热改的读法（零缓存 = 零失效面）；冷却 = 防死服务器每回合拖慢（核 `INIT_TIMEOUT_MS` = 30s）；文本面 = 核 MCP 结果即文本（KD-SV-113 同判） |
| KD-SV-200 | **审计 = 工具调用走 `chat_call`（零新 kind）＋ 配置变更新 `mcp_event` 型（十七型——三 kind）**（问题④） | 工具调用面 = KD-SV-91 单源（零扩）；配置变更 = 凭据/命令类变更从不静默（主机凭据先例）——`mcp_event` = 域自持型（sandbox/project/ledger 同法） |
| KD-SV-201 | **成员侧 = 同清单挂载**（问题⑤——落地：形预留三条 ⇒ 落地三条：① 清单位 = 服务器级单份（§3.1 同表）；② 执行侧 = `face.mjs` 单源（复用零改——`{names, schemas, invoke}` 由桥消费）；③ 接线 = 盒内装配点（`extraTools` 并面 ＋ 桥两端点——§6）） | 用户「如果也给成员侧会话用就更好」= 动因（触发已发未承接——清账复核补挂）；秘密零出服务器（密列纪律）；协议/命名/冷却全在 server（零第二实现）；盒零会话态（生命周期归 §2.2 既有链） |
| KD-SV-214 | **成员侧挂载形 = 桥（server 执行 ＋ 盒并面）**（问题⑤机制全文 = §6）：盒逐回合取工具表（`GET /api/box/mcp`——零秘密）⇒ 桩件 `extraTools` 并面；调用 `POST /api/box/mcp/call`（工作区 key）⇒ `face.mjs` 执行；审批随核门挡；审计 = `chat_call` 零新 kind；命名 = 核单源 ＋ 盒侧防撞；子代理不携（顶层径） | 秘密零出服务器（§6.2）；复用零改（连接/冷却/命名全在件）；读时读沿 KD-SV-199；「同一清单」逐字；盒零态（无关闭链） |

## 10. 本域文件与行数预算（本域族行）

| 档 | 行数（实读——设计估） | 职责 |
|---|---|---|
| `thincoder-server/src/mcp/store.mjs` | 实读 **339** | 行读写（增删改查） ∥ 形校验 ∥ 核 config 形映射（`toCoreConfig`） ∥ 密文列读写（`credential-crypto.mjs`） |
| `thincoder-server/src/mcp/face.mjs` | 实读 **196**（本批 +`readonlyOf` ≈ +1–3） | 工具面装配（逐回合：读行 ⇒ 核建连 ⇒ 归一 `{ ok, subject, summary, output }` ∥ 失败冷却 ∥ 跨面重名防御 ∥ 会话关闭出口——面无关（成员面复用面）） |
| `thincoder-server/src/mcp/routes.mjs` | 实读 **137** | 五端点（清单四 + 探活一） ∥ 判权 ∥ `mcp_event` 三写入点 |
| `thincoder-server/src/mcp/admin-tools.mjs` | 实读 **222**（本批 +`readonlyOf` ≈ +1–3） | 管面工具执行器（`mcp` 五动词）：寻址 ∥ 形校验转 `store.mjs` 单源 ∥ `mcp_event` 三写入点 ∥ 探活（核件装载 ＋ 冷却清理）∥ 关会话（删/停用） |
| `thincoder-server/src/agent/chat.mjs`（已落盘） | 实读 **737**（**拆档线 720 已越**；处置 = `agent/ADMIN-AGENT.md` §9 KD-SV-208） | 聊天式驱动（§11——机制单源 = `agent/ADMIN-AGENT.md`） |
| `thincoder-server/src/agent/run.mjs`（已落盘） | 实读 **33** | 核装载共用件（预算常量 ∥ `loadCoreChat` ∥ `providerModelRefs` ∥ 裁剪面清单——任务式环已退场删净） |
| `thincoder-server/src/store/migrations.mjs`（已落盘） | **795/796**（v24 段 +≈20——建表 + 审计 CHECK 重建；越 800 硬限余 ≈4 行——拆案在案，见 `sandbox/SANDBOX.md` §13） | 迁移链（开库/PRAGMA/语句封装 = `db.mjs`——实读 **36/37**，拆案已落） |
| `thincoder-server/bin/thincoder-server.mjs`（已落盘） | ≈**247**（注册行 + 停机收尾） | 装配/启动/停机 |
| `thincoder-server/src/accounts/audit.mjs`（已落盘） | ≈**122**（+≈1——`AUDIT_TYPES` += `mcp_event`） | 审计事件目录 ∥ 落库/查询/清理（§5 三写入点必经） |
| `thincoder-server/public/views-mcp.mjs`（已落盘） | ≈**320**（按页分档线 300 越线——预案 = 弹窗体抽 `views-mcp-modals.mjs`，先例 = providers） | MCP 页（清单表 ∥ 探活读数 ∥ 增/改/删弹窗） |
| `thincoder-server/public/i18n-zh-mcp.mjs` ∥ `i18n-en-mcp.mjs`（已落盘） | ≈**75** ∥ ≈**75**（`admin.mcp.*` ≈55 键/表 + 档头） | 文案表·mcp 部件（域界 = 键二级前缀） |
| `thincoder-server/public/i18n-zh.mjs` ∥ `i18n-en.mjs`（已落盘） | ≈**17**（+1 import——门面展开合体） | 文案表·聚合门面 |
| `thincoder-server/public/i18n-zh-shell.mjs`（已落盘） | ≈**81**（+1——`nav.page.admin.mcp` 键） | 文案表·zh·shell 部件（导航族） |
| `thincoder-server/public/i18n-en-shell.mjs`（已落盘） | ≈**79**（+1——同键） | 文案表·en·shell 部件（导航族） |
| `thincoder-server/public/views-audit.mjs`（已落盘） | ≈**252**（+1——类型枚举增 `mcp_event`） | 审计页（类型枚举——全型收编先例） |
| `thincoder-server/public/i18n-zh-system.mjs`（已落盘） | **219**（实读 2026-10-16——含 `audit.type.mcp_event` 键） | 文案表·zh·system 部件（审计键区） |
| `thincoder-server/public/i18n-en-system.mjs`（已落盘） | **219**（实读 2026-10-16——同键） | 文案表·en·system 部件（审计键区） |
| `thincoder-server/public/nav.mjs`（已落盘） | ≈**107**（+1 项） | 导航单源（`webui/WEBUI.md` §2） |
| `thincoder-server/public/app.mjs`（已落盘） | ≈**209**（+1 import + 1 `PAGES` 行） | 入口/路由分派 |

- **小计 ≈ +946**（新增五档 ≈900 ∥ 存量改 ≈+46）。
- **server-mcp-admin-tools 批 另计 ≈+190（落地实读 **+226** = 222 + 4）**：`thincoder-server/src/mcp/admin-tools.mjs` 实读 **222** ∥ `thincoder-server/src/agent/chat.mjs` 净 **+4**（实读 737——微触；拆档评估 = `agent/ADMIN-AGENT.md` §9 KD-SV-208）；零新端点 ∥ 零迁移；
  **单元测试档 1 档**（实读 **423** 行；**不入任何门**）。
- **成员面挂载批 另计 ≈+245 ⇒ 落地实读 +195**：`thincoder-server/src/mcp/member-bridge.mjs`（已落盘｜实读 **70**——取表/调用两处理器 ∥ schema 映射 ∥ 中止接线）∥ `thincoder-server/src/agent/box-routes.mjs`（实读 **172**——+6：单行 import ∥ 两注册行 ∥ 头注/jsdoc 同拍；两处理器在桥件 70 内计）。
  盒侧：`thincoder-server/deploy/sandbox/member-shell/mcp-tools.mjs`（已落盘｜实读 **106**——取表/建桩/防撞）∥ `thincoder-server/deploy/sandbox/member-shell/core-run.mjs`（实读 **654**——取表并面 + 降级 + 审批接线）。
  **复用零改**：`thincoder-server/src/mcp/face.mjs`（实读 **196**）∥ `thincoder-server/src/mcp/store.mjs`（实读 **339**）；零迁移 ∥ 盒族 +2 端点；部署 = 盒镜像重建。
  **单元测试档 1 档**（已落盘｜实读 **428** 行；**不入任何门**）。
- >500 软线复核：三新服务端档实读 **339 ∥ 196 ∥ 137**（>500 软线均未越）；`views-mcp.mjs` ≈320（预案在案——§上表）；`chat.mjs` 实读 **737**（**拆档线 720 已越**；处置 = `agent/ADMIN-AGENT.md` §9 KD-SV-208）；
  `migrations.mjs` **795/796**（>500 软线越线；距 800 硬限余 ≈4 行——拆案在案，见 `sandbox/SANDBOX.md` §13）。
- **口径声明**：本表行数沿 **split 计行口径**为主；个别行为**内容行口径**（±1 之差在案，不逐行收）；`i18n-{zh,en}-system.mjs` 标 220 = 内容口径值，**现盘 = 221 内容 ∥ 222 split**——增量（+1 键）照加。`webui/MCP.md` 零改（其「缺省勾」= 依据句——缺省明写已落本档 §3.2 ∥ `gateway/API.md` §2.13 两契约档，足）。

## 11. 验收判据（机检）

| 需求 AC | 设计级判据 | 载体 |
|---|---|---|
| AC-54（功能点 54——已入册 2026-10-13） | 分面判据：解裁面 = chat 面挂载 + `TRIMMED_FACES` 零 `mcp`（源扫断言）+ 任务面零 MCP 件 ∥ 存储面 = `store/STORE.md` §3 v24 判据 ∥ 端点面 = `gateway/API.md` §2.13 五行 ∥ 工具面 = §8 N1/N2/B2/E2（核件注入假件）∥ 探活 = N3（零副作用）∥ 审计 = N1（`chat_call`）+ N2（`mcp_event` 三 kind）+ 零秘密扫描 ∥ 运维面 = `ops/OPS.md` §5.11 ∥ 控制台面 = `webui/MCP.md` §4 ∥ 成员侧（⑤）= §6（落地形——装配/清单/审批/审计/命名五面）∥ 待裁点（⑥）= §12 R86④（机制级确认门 = 本刀不加） | 单元测试档 + 收口轮（浏览器实走：加一个真实 MCP 服务器 ⇒ 探活 ✓ ⇒ 管理会话问一句 ⇒ 工具被调用 ⇒ 审计页可见） |

| AC-56（功能点 56——MCP 管理工具；已入册 2026-10-14——`docs/server/requirements/PROJECT.md` 验收表 `:458`） | 分面判据：工具面 = `agent/ADMIN-AGENT.md` §12.2（五动词 ∥ 寻址 ∥ 引件表 ∥ 结果形）∥ §7 对应判据行 ∥ §8（N85 ∥ B81 ∥ E63） ∥ 复用面 = 本档 §4 管面句（零第二实现——`store.mjs`/`face.mjs` 引件） ∥ 审计面 = 本档 §5（`mcp_event` 三 kind ＋ 驱动层 `chat_call`） ∥ 凭据面 = §3.1 密文列纪律（只写零回显） ∥ 控制台面 = 零触（`webui/MCP.md` 既有） | 单元测试档 + 收口轮（会话实走：列/探/增一条真实服务器） |

| AC-54⑤（成员侧挂载） | 分面判据：装配面 = §6.1（逐回合取表 ⇒ `extraTools` 并面 ∥ 失败降级回合不阻断）∥ 清单面 = §6.2（两端点形——响应零秘密扫描）∥ 审批面 = §6.3（`readonly:false` ⇒ 门挡 ⇒ 审批卡）∥ 审计面 = §6.4（`chat_call` 帧源落行）∥ 命名面 = §6.5（核单源 + 盒侧防撞拒挂 + 日志） | 单元测试档 + 收口轮（成员会话实调一轮 MCP 工具——新盒） |

## 上抛/余项（R86）

| # | 项 | 类型 | 处置建议 |
|---|---|---|---|
| R86 | **server-mcp 批 — 需求档回笔建议 ＋ 随正件 ＋ 披露 ＋ 待裁点 ＋ 部署收尾**：① 需求档回笔（主 agent 笔——**已办**）：**功能点 54 ∥ AC-54** 已入册（需求档验收表在册）；**AC-12 管理 10 ⇒ 11**；**AC-28 审计型 十六 ⇒ 十七（`mcp_event`）**（均已随正）；② 随正件（实施轮同拍——以当刻盘面实读为准）：档目/清单断言件族（`readdirSync(PUBLIC_DIR)` 命中 ≈18 件 + nav 计数断言件——新增 `views-mcp.mjs` + i18n 两部件 ⇒ 逐件清单/键集随正）∥ `docs/README.md` 档数（server 设计 +2——父侧笔）∥ ③ 披露（不阻塞）：stdio = server 同机命令（等价 `bash` 在册）∥ 远端 MCP = server 新出网目的地（零白名单）∥ 第三方内容面（描述/输出 = 外部数据）∥ `command`/`args` 明文可含秘密 ∥ 工具数无上限 ∥ 冷却 = 进程内（重启清零）∥ `kill -9` 残留 stdio 子进程 ∥ 探活不落审计 ∥ ④ **待裁点（已裁——已落）**：机制级确认门（审批）= 管理面写类门挡 + 审批卡（2026-10-17 用户裁；`agent/ADMIN-AGENT.md` §11.5）；⑤ 部署收尾（父侧执行）：镜像重建 + 重收敛 + 浏览器实走 | 披露（上抛——如无异议按设计实施；部署收口 = 父侧） | 评审/用户复核 |
| R87 | **成员面挂载——随正/回笔/披露/部署**：① 随正件（已落）：`agent/MEMBER-AGENT.md`（§3.7 接线 ∥ §3.11(7) 工具面表 ∥ §5 行账 ∥ §6 验收）∥ `gateway/API.md` §2.12（盒族 +2 端点行）∥ 板档 `docs/server/design/PROJECT.md`（档行 ∥ AC-54 行——「成员侧预留」随正为落地五面）；② 需求档回笔（主 agent 笔）：功能点 54 ⑤ 收正（成员侧 ⇒ 同清单落地；判据 = 本档 §11 行）+ AC-54 判据行随正；③ 披露：盒内直连被否（§6.6）∥ 家族段名集盒不核（§2.3F——默认补法在案）∥ 子代理不携 MCP（顶层径）∥ 工具数无上限/无逐件开关 ∥ 取表不审计；④ 部署（父侧）：盒镜像重建（新件入镜）+ 收口轮成员会话实调一轮；⑤ 单元测试档 1 档 | 随正/部署（收口轮） | 父侧/本席 |
