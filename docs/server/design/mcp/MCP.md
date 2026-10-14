# Thincoder Server · MCP 面（mcp/MCP）

> 板块 = server ∥ 本域 = mcp（MCP 服务器清单 ∥ 管理会话工具面挂载 ∥ 探活）；板总览 = `PROJECT.md`（文档地图 = §3）。
> 口径来源 = 用户 2026-10-13 23:0x 原话「应该能够支持mcp，这样管理会话能够实现web搜索等能力，如果也给成员侧会话用就更好。」（台账 #1379；需求 `docs/server/requirements/PROJECT.md:540` 待讨论行）；
> **功能点 54 ∥ AC-54 = 已入册（2026-10-13——需求档验收表在册）**。
> 核侧基座 = `thincoder-core/mcp.mjs`（CLI/VSC/桌面三端在用；核侧参考设计 = `docs/core/design/MCP.md`）。
> 本刀范围 = 第一块石头：管理会话解裁 ＋ 最小配置面（清单可管可探活）；成员侧随 #1215（形预留 = §6）。
> 建档：2026-10-13（批 `docs/batches/2026-10-13-server-mcp.md` 设计轮）。

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

- **事实核读（裁剪的实际形态）**：`thincoder-server/src/agent/run.mjs:22` `TRIMMED_FACES` 含 `"mcp"`——**该常量全仓零代码消费 ∥ 零测试断言**（实读：唯一命中 = 定义行；另在需求档/设计档数处作文本引用）。裁剪的真实落点 = **chat 面工具面装配不含 MCP 件**（`thincoder-server/src/agent/chat.mjs:316-338` `buildChatToolFace` 只并管理面与环境族两面）。
- **原理由核读（在案）**：裁剪批档 `docs/batches/2026-10-10-runner-admin-console.md` **零 `mcp` 命中**；`agent/ADMIN-AGENT.md` §5 裁剪句未点名 mcp（所点族 = 审批/TTY/记忆/台账/子代理/浏览器）⇒ mcp 归入兜底条款「与运维任务无关族……按任务需要再逐族接」（**推定——如实登记**：当时 admin agent = 任务式沙箱装机，MCP 无角色）。
- **解裁落点 = 管理会话（chat）面**：MCP 工具随回合并入 chat 工具面（§2.2）——用户点名的「管理会话 web 搜索」由此兑现。
- **`TRIMMED_FACES` 收正**：删 `"mcp"`（该常量 = 管理面 agent 裁剪族清单；mcp 经本批挂载 ⇒ 移出——`thincoder-server/src/agent/run.mjs:22` 一行 + 注释同拍）。
- **任务面（run）维持不挂载**：任务面 = 沙箱装机专用五件（`thincoder-server/src/agent/tools.mjs`——`thincoder-server/src/sandbox/onboarding.mjs:190` 装配）；环境族同等裁决在先（`agent/ADMIN-AGENT.md` §3 尾句「任务面不含 server 本机族」——同族口径）；且 run 退场路线在册（合并进 chat）。**被否**：两面同挂（无实需 ＋ 与既有「两形工具面不同」状态相抵）。

### 2.2 挂载接法（装配点核读）

- **装配点** = `thincoder-server/src/agent/chat.mjs:469-473`：注入面（测试）优先；否则 `buildChatToolFace`（`:316-338`）造面——管理面八件（`chat-tools.mjs`）＋ 环境族八件（`chat-env-tools.mjs`）——本批 **＋ MCP 面**（新件 `thincoder-server/src/mcp/face.mjs`（拟新增））。
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
- 列面：`name`（唯一）∥ `transport`（`stdio`/`http`/`ws` 三值 CHECK）∥ `command`/`args_json`（stdio）∥ `url`（http）/`ws_url`（ws）∥ `secret_cipher`（密文——AES-256-GCM；`{ token?, headers?, env? }` 合一；NULL = 零敏感字段）∥ `enabled` ∥ 两时间列。
- **存库不落 config.json**：理由 = 服务器存储先例（providers/runners 等皆库单源）＋ 控制台 CRUD 须服务端校验/审计（文件写 = 第二路径）；**被否**：沿 CLI `mcp.servers` 配置文件形（服务器容器内无该文件的管界面先例 ＋ 多 admin 共享面须零回显——不达）。
- **凭据形**：`token` ∥ `headers` 值 ∥ `env` 值 = 敏感类 ⇒ 入密文列（`src/store/credential-crypto.mjs` 既有件——沿主机凭据/私有仓凭据先例）；**零回显**（列表/详情响应只携 `hasSecrets` 布尔）；编辑 = 字段缺席 ⇒ 不变（providers PATCH 先例）、显式 `null` ⇒ 清空；`${env:VAR}` 引用透传（核 `env-ref.mjs` 建连期解析——`env` 面 = server 进程环境）。
- **明文列可含秘密的如实边界**：`command`/`args` 明文（如把 key 写进参数——用户自担；指引 = 凭据走 `token`/`env`）——披露项。

### 3.2 端点（契约 = `gateway/API.md` §2.13）

- 族 = `/api/admin/mcp*`（`requireAdmin`——`user` ⇒ 403 ∥ 无/过期会话 ⇒ 401）；错误形 = §3 全码沿用（零新码；探活例外——自含状态，沿 `proxy/test` 先例）。
- 五端点：

| 方法 + 路径 | 语义 |
|---|---|
| `GET /api/admin/mcp` | 清单（库序）：`{ servers: [{ id, name, transport, target, enabled, hasSecrets, createdAt, updatedAt }] }`（`target` = 非秘密寻址形——command ∥ url/wsUrl；零秘密） |
| `POST /api/admin/mcp` | 新增：`{ name, transport, command?, args?, url?, wsUrl?, headers?, token?, env?, enabled? }`（`enabled` 缺省 = 启用——与 v24 DDL 缺省值 ∥ 控制台缺省勾同拍）⇒ 200 `{ id }`；形非法（名空/重名/传输三择/必填缺/类型错）⇒ 400（库零变） |
| `PATCH /api/admin/mcp/:id` | 改（**字段缺席 = 不动**——providers 先例；敏感字段缺席 = 不变 ∥ `null` = 清）；`{ enabled }` 切换走本端点；形非法 ⇒ 400 库零变；不存在 ⇒ 404 |
| `DELETE /api/admin/mcp/:id` | 删（硬删——providers 先例）＋ 关闭该服务器会话；不存在 ⇒ 404 |
| `POST /api/admin/mcp/probe` | 探活（零副作用）：体 = `{ id?, name?, transport?, command?, args?, url?, wsUrl?, headers?, token?, env? }`——`id` 在场 ⇒ 缺席字段（含非秘密：`transport`/`command`/`url`…）一律**回落库内行**（编辑窗/行内探活）；`transport` 仅无 `id` 草稿态必填；全量草稿（新建窗）亦可 ⇒ 200 `{ ok, toolCount?, latencyMs?, error? }`（自含状态——`ok:false` 仍 200，沿 `proxy/test` 口径） |

- **添加不强制探活**（先落库后探活——可达性非配置成立条件；**被否**：沿 runners「先自检后落库」fail-closed（MCP 服务器可后起——封死预配置））；探活 = 显式动作（窗内「测试」＋ 行内「探活」）。

### 3.3 探活（核件复用）

- 件 = 核 `probeMcpServer`（`thincoder-core/mcp.mjs:97`——零副作用：不进 `_sessions` ∥ 不动工具面 ∥ `finally close`）；读数形 = `{ ok, toolCount, latencyMs }` ∥ `{ ok:false, error }`。
- 超时 = 核 `INIT_TIMEOUT_MS`（30s——`thincoder-core/mcp/helpers.mjs:5`）；核件自持，服务端零第二套超时。
- 读数呈现（控制台）= 对齐 CLI `/mcp test` 形（`thincoder-cli/src/tui/cmd-mcp.mjs:132-137`）：`✓ {toolCount} tools, {latencyMs}ms` ∥ `✗ {error}`。
- 探活零落库零审计（诊断面——沿 `proxy/test` ∥ `embedding/test` 先例）。

### 3.4 控制台落点（一页一职责）

- **新页 `#/admin/mcp`**（管理组 +1——**被否**：并入系统页（系统页 = 服务自身配置（host/port/autoUpdate…）；MCP 清单 = 资源清单管理（多行 CRUD + 探活）——与 Provider/镜像源同族，属「一页一职责」的资源页）；并入 Provider 页（对象不同族））。
- 页形 ∥ 键族 ∥ 最近先例 = `webui/MCP.md`（机制全文——本档只定落点）。

## 4. 核件复用与装配（问题③）

- **引核件（file 级——本批 +1 件）**：`@thincoder/core/mcp.mjs`——取用导出 = `connectMcpServer`（`:236`）∥ `probeMcpServer`（`:97`）∥ `closeAllMcp`（`:280`）∥ `removeMcpTools`（`:296`）；
  随件子面（内部依赖——同包发布）：`thincoder-core/mcp/helpers.mjs` ∥ `mcp/transport-stdio.mjs` ∥ `mcp/transport-http.mjs` ∥ `mcp/transport-ws.mjs` ∥ `thincoder-core/env-ref.mjs`（`${env:VAR}` 解析——建连/探活/重连同享）。
- **发布可达**：核 `package.json` `files` 含 `"*.mjs"` 与 `"mcp/"`（`thincoder-core/package.json:37-53`）＋ `exports "./*"`（`:31-33`）⇒ 子路径直引可达；
  版本地板 = 板档 `PROJECT.md` §2.3 ∥ **件清单单源 = `agent/ADMIN-AGENT.md` §17.2（本批 +1 件 ⇒ 同拍增行）**——核先于/同拍发行（KD-SV-138③）；件龄早于依赖地板 `^0.10.4` ⇒ **pin 零升**。
- **零第二实现声明**：协议握手 ∥ 三传输 ∥ 工具命名 ∥ 探活 ∥ 重连/退避 ∥ 输出截断（32KB）∥ 结果提取——全在核件；本域件只做 **清单行 → 核 config 形** 映射 ＋ **工具面归一/审计** ＋ **失败冷却**。
- **建连参形**（`store.mjs` 映射）：`{ name, command, args, env }` ∥ `{ name, url, headers, token }` ∥ `{ name, wsUrl, headers, token }`（核 `mcp.mjs:3` 头注 + `:70-87` 分派）；`headers`/`env`/`token` 自密文列解出后传入（核再解 `${env:VAR}`——两层各司其职）。
- **结果归一**（沿 KD-SV-113 四字段）：`{ ok, subject, summary, output }`——`output` = 核件文本（模型可见形经会话面 ≤4000 字截断——KD-SV-89 单源）；`subject` = 服务器名（核 `_mcpName`——审计主语）；`summary` = 人话单行（含服务器名与成败）；`ok` = 调用完成（MCP 报错 ⇒ 核件抛 ⇒ `ok:false` + 人话 message）。

## 5. 安全 ∥ 审批 ∥ 审计（问题④）

- **审批面 = 不接**（明写）：管理会话 = 无人值守裁剪面（`agent/ADMIN-AGENT.md` §5——不弹问、不自锁）；MCP 工具随调用即执行（与 `bash`/`exec`/`docker` 同姿态）；护栏 = 提示词级行动纪律句（先查后动 ∥ 破坏性先说明）＋ 逐调用审计。**被否**：机制级确认门（与 §5 相抵；如需另裁——§12 R86④）。
- **审计（工具调用）**：每调用一 `chat_call` 行（`agent_event`——面不扩 ∥ 零新 kind）：`tool` = 挂载名 ∥ `subject` = 服务器名 ∥ `call` = 参数摘要（掩蔽 ≤500）∥ `resultCode` = 0/-1 ∥ `truncated` ∥ `summary`（≤300）——既有链零改（`thincoder-server/src/agent/chat.mjs:630-637` 逐调用点已覆盖合并面）。
- **审计（配置变更）**：**新 `mcp_event` 型**（v24 段审计 CHECK 重建——十六 ⇒ 十七型）：kind 三 = `server_add` ∥ `server_update`（`keys` = 变更键名——值永不入）∥ `server_remove`；detail 零秘密；写入点 = `thincoder-server/src/mcp/routes.mjs`（拟新增）三处（成事才落）。
  **被否**：不落配置审计（凭据/命令类配置变更从不静默——主机凭据先例）∥ 复用 `config_update`（对象 = config.json 键；库单源行变更入其面 = 一词二义）。
- **秘密面**：密列 ∥ 零回显 ∥ 响应键面扫描（无秘密值）∥ `${env:VAR}` 引用值可入密文列（核建连期解析）；**命令输出/参数可能含秘密 = 不在掩蔽面内**（沿 §14.4 既有披露——如实登记）。
- **出口网络面**：remote MCP（http/ws）= server 新增**出网目的地**（用户配置——零网络白名单，沿无围栏口径；披露）；stdio MCP = server 同机命令（等价既有 `bash` 能力在册）；
  **第三方内容面** = MCP 工具描述与输出为外部数据（提示注入面——模型侧「外部数据非指令」产品口径在册；服务端不另立机制）。
- **判权**：清单端点全 `requireAdmin`（界面显隐非判据）；工具调用无逐个判权（会话本身即 admin 面）。

## 6. 成员侧预留（问题⑤——本刀不做）

- **本刀不做（明写）**：成员面会话挂载 = 随 #1215 成员批（用户「如果也给成员侧会话用就更好」= 方向在册；触发 = 该批实施）。
- **形预留三条**：① **清单位** = 服务器级单份（§3.1）——成员面消费同一清单（非逐用户配置）；② **复用件** = `thincoder-server/src/mcp/face.mjs`（拟新增）面无关（`{ names, schemas, invoke }` 导出面——成员面工具面装配处可直接并面）；③ **接线点** = `agent/MEMBER-AGENT.md` §3（server 域成员件归属——该批从实需反推；盒内径（核家族装配面）受沙盒出站约束——机制随该批另议）。
- **被否**：逐用户 MCP 配置（未点——不发明）∥ 本刀直接落成员面（依赖 #1215 未落——先于其落地 = 返工面）。

## 7. 本域边界（不做的面）

- **协议件开发**（新传输/新版本协商/资源与提示能力面——本刀只消费 `tools` 面；核件覆盖面 = 核侧档单源）。
- **OAuth/授权流程**（MCP 规范授权面——授权形 = `token`/`headers` 自持）。
- **MCP 市场/目录/预置清单**（用户点单配置——不预置）。
- **逐用户 ∥ 逐会话配置**（§6）；**工具级开关/白名单**（§2.2——无逐个开关）。
- **探活巡检/历史**（探活 = 手动动作；零落库）。
- **成员侧本刀落地**（§6）。

## 8. 用例（本域）

| # | 类 | 输入 | 预期输出 |
|---|---|---|---|
| N1 | 正常 | 假 db（一 stdio 服务器行）＋ 假建连替身：chat 一轮发起调用 | MCP 工具在场（名 = `{server}_{tool}`）；`call`/`result` 帧逐值；`chat_call` 行（tool=挂载名 ∥ subject=服务器名）；结果 ≤4000 字落库；预算计数含本次 |
| N2 | 正常 | 真库 + 假 MCP 件（核真件仓内直引改替身）：POST 新增 ⇒ GET 列表 ⇒ PATCH `{enabled:false}` ⇒ GET ⇒ DELETE ⇒ GET | 行逐值（`hasSecrets` 布尔——零秘密）；停用后下回合工具面不含该服务器件；`mcp_event` 三 kind 行逐值 |
| N3 | 正常 | 探活两径：行内（体 `{id}`）∥ 新建草稿（体 = 全量） | `{ ok:true, toolCount, latencyMs }` 逐值（替身）；库零变 ∥ 核 `_sessions` 零增（零副作用断言） |
| N4 | 正常 | 编辑窗留空秘密 + 改 url ⇒ PATCH；「清除」勾 ⇒ PATCH `{token:null}` | 秘密列不变（库内密文逐值）∥ 清除后 `hasSecrets=false` |
| N5 | 正常 | 停机收尾（假 stdio 件） | 停机路径调 `closeAllMcp`（假件断） |
| B1 | 边界 | 建连失败（替身抛）＋ 冷却窗内第二回合 | 首回合跳过 + 日志；第二回合零连接尝试（假件计数）；窗满重试；探活成功 ⇒ 清冷却 |
| B2 | 边界 | 名碰撞（服务器名使工具名撞静态面件 ∥ 两服务器 sanitize 同形件——`web.search` ∥ `web search`）∥ 空清单 | 该件（后到）不挂 + 日志（其余照常——先者留存）∥ MCP 面 = 空面（工具面逐字 = 既有 16 件） |
| B3 | 边界 | 编辑体缺字段 ∥ 显式 `null` ∥ 传输切换缺必填 | 缺席 = 不变（库逐值）∥ `null` = 清 ∥ 400 库零变 |
| E1 | 错误 | 形非法五形（名空 ∥ 重名 ∥ 传输表外 ∥ 必填缺 ∥ `args` 非字符串数组） | 逐形 400（人话）；库零变 |
| E2 | 错误 | 探活失败（替身抛）∥ 缺核件 | `{ ok:false, error }`（200 自含）∥ MCP 面不挂载 + 警告（回合照跑） |

## 9. 关键决策（本域——KD-SV-196–201）

| # | 决策 | 理由 | 被否候选与何故否 |
|---|---|---|---|
| KD-SV-196 | **解裁形 = 管理会话（chat）面挂载 ＋ `TRIMMED_FACES` 删 `mcp`；任务面（run）维持不挂载**（问题①） | 用户点名「管理会话」（原话）；chat 面装配点空位（`thincoder-server/src/agent/chat.mjs:316-338`）；常量 = 描述性（零消费）——收正到与实况一致；任务面 = 装机专用（环境族同族裁决先例）+ run 退场路线 | 两面同挂（无实需 + 与两形差异状态相抵——否）；只改常量不挂载（工具面空转——否） |
| KD-SV-197 | **清单 = `mcp_servers` 库表（server 全局单份）＋ 五端点 ＋ 控制台新页 `#/admin/mcp`**（问题②） | 服务器存储先例（providers/runners 皆库单源）；控制台 CRUD 须服务端校验/审计；一页一职责（资源清单族：Provider/镜像源同族） | config.json 文件面（服务器容器内无该面管界面先例 + 多 admin 零回显不达——否）；并入系统页（对象不同族——否）；并入 Provider 页（异对象——否） |
| KD-SV-198 | **凭据 = 密文列（`token`/`headers`/`env` 合一——AES-256-GCM）＋ 零回显 ＋ `${env:VAR}` 透传**（问题②） | 主机凭据/私有仓凭据同一密列纪律（本 server 多 admin 共享面）；核 `env-ref` 解析在件（零第二实现）；编辑「留空 = 不变」沿 providers 先例 | 明文列（providers `api_key` 先例——但对象 = 共享面凭据，零回显纪律优先——否）；`key_plain` 明文自持面（其消费方 = 本 server；MCP 凭据消费方 = 第三方服务器——否） |
| KD-SV-199 | **挂载形 = 核件原文复用 ＋ 逐回合装配（读时读）＋ 失败冷却 ＋ 文本面路由（ctx 透传）**（问题③） | 核建连/命名/重连/截断全在件（零第二实现——KD-SV-113 同精神）；逐回合 = 常驻进程下清单可热改的读法（零缓存 = 零失效面）；冷却 = 防死服务器每回合拖慢（核 `INIT_TIMEOUT_MS` = 30s）；文本面 = 核 MCP 结果即文本（KD-SV-113 被否栏同判） | 进程内常驻清单镜像（双源 + 失效面——否）；缓存工具面跨回合（配置变更失效面——否）；无冷却（每回合 30s 级时延风险——否）；管理族挂法（丢 `ctx.signal`——否） |
| KD-SV-200 | **审计 = 工具调用走 `chat_call`（零新 kind）＋ 配置变更新 `mcp_event` 型（十七型——三 kind）**（问题④） | 工具调用面 = KD-SV-91 单源（零扩）；配置变更 = 凭据/命令类变更从不静默（主机凭据先例）——`mcp_event` = 域自持型（sandbox/project/ledger 同法） | 不落配置审计（凭据类先例相抵——否）；复用 `config_update`（对象不符——否）；工具调用新 kind（面不扩口径——否） |
| KD-SV-201 | **成员侧 = 形预留（本刀不做）**（问题⑤） | 用户「更好」= 方向在册；依赖 = #1215 成员批（先于其落地 = 返工面）；留口三条（§6）零新机制 | 逐用户配置（未点——否）；本刀直接落成员面（依赖未落——否） |

## 10. 本域文件与行数预算（本域族行）

| 档 | 行数（实读——设计估） | 职责 |
|---|---|---|
| `thincoder-server/src/mcp/store.mjs`（拟新增） | ≈**130** | 行读写（增删改查） ∥ 形校验 ∥ 核 config 形映射（`toCoreConfig`） ∥ 密文列读写（`credential-crypto.mjs`） |
| `thincoder-server/src/mcp/face.mjs`（拟新增） | ≈**150** | 工具面装配（逐回合：读行 ⇒ 核建连 ⇒ 归一 `{ ok, subject, summary, output }` ∥ 失败冷却 ∥ 跨面重名防御 ∥ 会话关闭出口——面无关（成员面复用面）） |
| `thincoder-server/src/mcp/routes.mjs`（拟新增） | ≈**150** | 五端点（清单四 + 探活一） ∥ 判权 ∥ `mcp_event` 三写入点 |
| `thincoder-server/src/agent/chat.mjs`（已落盘） | 实读 **692** ⇒ ≈**704**（+≈12——MCP 面并面 + 路由泛化）——拆档线 720 未越（距 16 行） | 聊天式驱动（§11——机制单源 = `agent/ADMIN-AGENT.md`） |
| `thincoder-server/src/agent/run.mjs`（已落盘） | 实读 **150** ⇒ **±0**（`TRIMMED_FACES` 一行收正——行数零变） | 任务面装配 |
| `thincoder-server/src/store/migrations.mjs`（已落盘——**sandbox-exec-rebuild 批拆案产物**） | 实读 **711**（as-of 2026-10-14）⇒ ≈**731**（v24 段 +≈20——建表 + 审计 CHECK 重建） | 迁移链（开库/PRAGMA/语句封装 = `db.mjs`——实读 **37**，拆案已落） |
| `thincoder-server/bin/thincoder-server.mjs`（已落盘） | 实读 **244**（as-of 2026-10-14）⇒ ≈**247**（注册行 + 停机收尾） | 装配/启动/停机 |
| `thincoder-server/src/accounts/audit.mjs`（已落盘） | 实读 **121** ⇒ ≈**122**（+≈1——`AUDIT_TYPES` += `mcp_event`；头注/计数注释同拍（十六 ⇒ 十七）） | 审计事件目录 ∥ 落库/查询/清理（§5 三写入点必经） |
| `thincoder-server/public/views-mcp.mjs`（拟新增） | ≈**320**（按页分档线 300 越线——预案 = 弹窗体抽 `views-mcp-modals.mjs`，先例 = providers） | MCP 页（清单表 ∥ 探活读数 ∥ 增/改/删弹窗） |
| `thincoder-server/public/i18n-zh-mcp.mjs` ∥ `i18n-en-mcp.mjs`（拟新增） | ≈**75** ∥ ≈**75**（`admin.mcp.*` ≈55 键/表 + 档头） | 文案表·mcp 部件（域界 = 键二级前缀） |
| `thincoder-server/public/i18n-zh.mjs` ∥ `i18n-en.mjs`（已落盘） | 实读 **16** ⇒ ≈**17**（+1 import——门面展开合体） | 文案表·聚合门面 |
| `thincoder-server/public/i18n-zh-shell.mjs`（已落盘） | 实读 **80** ⇒ ≈**81**（+1——`nav.page.admin.mcp` 键） | 文案表·zh·shell 部件（导航族） |
| `thincoder-server/public/i18n-en-shell.mjs`（已落盘） | 实读 **78** ⇒ ≈**79**（+1——同键） | 文案表·en·shell 部件（导航族） |
| `thincoder-server/public/views-audit.mjs`（已落盘） | 实读 **251** ⇒ ≈**252**（+1——类型枚举增 `mcp_event`） | 审计页（类型枚举——全型收编先例） |
| `thincoder-server/public/i18n-zh-system.mjs`（已落盘） | 实读 **220** ⇒ ≈**221**（+1——`audit.type.mcp_event` 键） | 文案表·zh·system 部件（审计键区） |
| `thincoder-server/public/i18n-en-system.mjs`（已落盘） | 实读 **220** ⇒ ≈**221**（+1——同键） | 文案表·en·system 部件（审计键区） |
| `thincoder-server/public/nav.mjs`（已落盘） | 实读 **106** ⇒ ≈**107**（+1 项） | 导航单源（`webui/WEBUI.md` §2） |
| `thincoder-server/public/app.mjs`（已落盘） | 实读 **206** ⇒ ≈**209**（+1 import + 1 `PAGES` 行） | 入口/路由分派 |

- **小计 ≈ +946**（新增五档 ≈900 ∥ 存量改 ≈+46）；**单元测试档 1 档**（`docs/batches/2026-10-13-server-mcp.test.mjs`——≈420 行；**不入任何门**）。
- >500 软线复核：三新服务端档皆 ≈150 内；`views-mcp.mjs` ≈320（预案在案——§上表）；`chat.mjs` 692 ⇒ ≈704（拆档线 720 未越）；`migrations.mjs` 实读 711 ⇒ ≈731（>500 软线越线；距 800 硬限余 ≈69——拆案 = sandbox-exec-rebuild 批已落产物，本批只 +v24 段 ≈20）。
- **复核（设计评审轮 2 fix 轮）**：三处实读现盘复读**未动**——`migrations.mjs` 711 ∥ `bin` 244 ∥ `src/accounts/audit.mjs` 121（split 计行口径——内容行读数逐值 −1 = 既有口径差；as-of 2026-10-14）。
- **口径声明（父侧 2026-10-14 裁——应 fix 轮上抛）**：本表行数沿 **split 计行口径**为主；个别行为**内容行口径**（as-of 各批现读时点——±1 之差在案，不逐行收）；`i18n-{zh,en}-system.mjs` 标 220 = 2026-10-14 00:1x 内容口径值，**现盘 = 221 内容 ∥ 222 split**（重做批 B 连带 +1 先行落地）——本批增量（+1 键）照加。`webui/MCP.md` 零改（其「缺省勾」= 依据句——缺省明写已落本档 §3.2 ∥ `gateway/API.md` §2.13 两契约档，足）。

## 11. 验收判据（机检）

| 需求 AC | 设计级判据 | 载体 |
|---|---|---|
| AC-54（功能点 54——已入册 2026-10-13） | 分面判据：解裁面 = chat 面挂载 + `TRIMMED_FACES` 零 `mcp`（源扫断言）+ 任务面零 MCP 件 ∥ 存储面 = `store/STORE.md` §3 v24 判据 ∥ 端点面 = `gateway/API.md` §2.13 五行 ∥ 工具面 = §8 N1/N2/B2/E2（核件注入假件）∥ 探活 = N3（零副作用）∥ 审计 = N1（`chat_call`）+ N2（`mcp_event` 三 kind）+ 零秘密扫描 ∥ 运维面 = `ops/OPS.md` §5.11 ∥ 控制台面 = `webui/MCP.md` §4 ∥ 成员侧预留（⑤）= §6（三条形预留——本刀不做）∥ 待裁点（⑥）= §12 R86④（机制级确认门 = 本刀不加） | 单元测试档（`docs/batches/2026-10-13-server-mcp.test.mjs`）+ 收口轮（浏览器实走：加一个真实 MCP 服务器 ⇒ 探活 ✓ ⇒ 管理会话问一句 ⇒ 工具被调用 ⇒ 审计页可见） |

## 12. 上抛/余项（R86）

| # | 项 | 类型 | 处置建议 |
|---|---|---|---|
| R86 | **server-mcp 批（本批）——需求档回笔建议 ＋ 随正件 ＋ 披露 ＋ 待裁点 ＋ 部署收尾**：① 需求档回笔（主 agent 笔——**已办（2026-10-13）**）：**功能点 54 ∥ AC-54** 已入册（需求档验收表在册）；**AC-12 管理 10 ⇒ 11**；**AC-28 审计型 十六 ⇒ 十七（`mcp_event`）**（均已随正）；② 随正件（实施轮同拍——以当刻盘面实读为准）：`docs/batches/*.test.mjs` 档目/清单断言件族（`readdirSync(PUBLIC_DIR)` 命中 ≈18 件 + nav 计数断言件——新增 `views-mcp.mjs` + i18n 两部件 ⇒ 逐件清单/键集随正；起始坐标 = `2026-10-06-server-i18n.test.mjs:125` ∥ `2026-10-10-runner-admin-console-ui.test.mjs:489-501` ∥ `2026-10-11-admin-agent-chat-ui.test.mjs:322-341`）∥ `docs/README.md` 档数（server 设计 +2——父侧笔）∥ ③ 披露（不阻塞）：stdio = server 同机命令（等价 `bash` 在册）∥ 远端 MCP = server 新出网目的地（零白名单）∥ 第三方内容面（描述/输出 = 外部数据）∥ `command`/`args` 明文可含秘密 ∥ 工具数无上限 ∥ 冷却 = 进程内（重启清零）∥ `kill -9` 残留 stdio 子进程 ∥ 探活不落审计 ∥ ④ **待裁点**：机制级确认门（审批）= 本刀不加（无人值守口径）——如需另裁；⑤ 部署收尾（父侧执行）：镜像重建 + 重收敛 + 浏览器实走（加真实 MCP 服务器（web 搜索类）⇒ 探活 ✓ ⇒ 管理会话实调一轮 ⇒ 审计页一行） | 披露（上抛——如无异议按设计实施；部署收口 = 父侧） | 评审/用户复核 |

## 变更记录

- 2026-10-14（**server-mcp 批 · 设计评审轮 2 修正（fix 轮）· eng-designer**——承批档 `docs/batches/2026-10-13-server-mcp.md` §3 轮次 2（评审 #117——pass；🟡×1 ∥ 🔵×3——四条建议全落）：§2.2 命名面扩面（合并前扫描面 = 静态两面 ∪ **MCP 面既往件名集**——核件单 server 内外同形件在此收口）+ §8 B2 补两服务器 sanitize 同形相撞用例；§3.2 `enabled` 缺省 = 启用明写（v24 DDL ∥ 控制台缺省勾同拍）；§11 补 AC-54 ⑤⇒§6 ∥ ⑥⇒§12 R86④ 对位；§10 三处读数复核未动注记。同源随动 = `gateway/API.md` §2.13。**零新语义（评审发现直接导出项）；产品码零触（设计轮）。**

- 2026-10-14（**server-mcp 批 · 设计评审轮 1 修正（fix 轮）· eng-designer**——承批档 `docs/batches/2026-10-13-server-mcp.md` §3 轮次 1（评审 #112：🔴×1 ∥ 🟡×3 ∥ 🔵×6 + 范围外注记两条——十行全采纳）：§1 需求锚收正（`:523` ⇒ `:540`）+ 状态「拟入册」⇒ **已入册（2026-10-13）**；§2.2 注入缝补 `deps.mcpProbeImpl`/`deps.mcpCloseImpl`（缺省 null = 生产零变）；§3.2 探活体口径收正（`transport?`；`id` 在场 ⇒ 缺席字段（含非秘密）一律回落库内行）；§8 N2 流程补「⇒ DELETE ⇒ GET」；§10 增六行（`accounts/audit.mjs` ∥ `i18n-{zh,en}-shell.mjs` ∥ 审计面三档）+ 三读数刷新（`db.mjs` 37 ∥ `migrations.mjs` 711 ⇒ ≈731 ∥ `bin` 244 ⇒ ≈247——as-of 2026-10-14）+ 小计 ≈+946；§11 补运维面（`ops/OPS.md` §5.11——板档对位收一）+ 状态同拍；§12 R86① 翻「已办」。同源随动 = `webui/MCP.md` ∥ `gateway/API.md` §2.13 ∥ `agent/ADMIN-AGENT.md` §6 ∥ `design/PROJECT.md`。**零新语义（评审发现直接导出项）；产品码零触（设计轮）。**

- 2026-10-13（**server-mcp 批 · 设计轮 · eng-designer**——承批档 `docs/batches/2026-10-13-server-mcp.md` §1 · 台账 #1379；用户 23:0x 原话）：建档——§1 定位（三件/拓扑/最近先例逐条）∥ §2 解裁与挂载（`TRIMMED_FACES` 收正 ∥ chat 面接法 ∥ 失败冷却 ∥ 生命周期）∥ §3 配置面（v24 表 ∥ 五端点 ∥ 探活 ∥ 控制台落点）∥ §4 核件复用（引件 +1）∥ §5 安全/审批/审计（`mcp_event` 新型）∥ §6 成员预留 ∥ §7 边界 ∥ §8 用例（N1–N5 ∥ B1–B3 ∥ E1–E2）∥ §9 KD-SV-196–201 ∥ §10 行账 ∥ §11 AC-54 判据 ∥ §12 R86。**产品码零触（设计轮）。**
