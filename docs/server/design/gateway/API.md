# Thincoder Server · 接口契约（gateway/API）

> 板块 = server ∥ 本档 = gateway 域（http 服务/路由注册 ∥ OpenAI 三面 ∥ 转发 ∥ sse-tap ∥ providers ∥ 错误形）；板总览 = `PROJECT.md`（文档地图 = §3）。
> 需求单源 = `docs/server/requirements/PROJECT.md`（功能点 2 ∥ 3 ∥ 6）；本域回指 = `PROJECT.md` §7（AC-2 ∥ AC-6 判据 = 本档 §5）。
> 建档：2026-10-06（批 `docs/batches/2026-10-06-server-gateway.md` 设计轮；同日补轮——B 案织入 + 三层结构）。

## 1. 路由面（三族 + 兜底）

| 族 | 方法 + 路径 | 鉴权 | 详表 |
|---|---|---|---|
| OpenAI 面 | `POST /v1/chat/completions` ∥ `GET /v1/models` ∥ `POST /v1/embeddings` | 团队 key（`Authorization: Bearer`——唯一接受形） | 本档 §2 |
| provider 管理面 | `GET/POST/PATCH/DELETE /api/admin/providers*` | admin 会话（服务端判定——`user` ⇒ 403） | 本档 §2.2 |
| 账号/自助/管理面 | `/api/*`（成员/用量族——provider 管理面另列） | 会话 cookie + 角色判定 | `accounts/ACCOUNTS.md` §3 ∥ `metering/METERING.md` §3（用量/配额端点） |
| 系统面 | `GET /healthz`（公开——零鉴权只读探活） ∥ `GET /api/system`（会话——版本/更新状态） | 无 ∥ 会话 | 本档 §2.3 |
| 客户端数据面 | `POST /api/client/login` ∥ `POST /api/client/logout` ∥ `GET /api/client/me`（骨架——B1 批） | 登录 token（`Authorization: Bearer`——与 /v1 同校验单源） | `client/CLIENT.md` §2 |
| 控制台数据面 | `GET /api/overview`（管理总览读数） ∥ `GET /api/admin/embedding` ∥ `POST /api/admin/embedding/test`（向量服务面——探活/试跑） ∥ `GET/PATCH /api/admin/config`（配置面——读写 config.json；`ops/OPS.md` §1） ∥ `POST /api/admin/proxy/test`（代理连通测试——真打；`webui/SYSTEM.md` §2.2） | admin 会话（服务端判定——`user` ⇒ 403） | 本档 §2.4 |
| 沙盒控制台面 | `GET/POST/PUT/PATCH/DELETE /api/admin/sandbox/*`（runner ∥ 工作区 ∥ 规则 ∥ 待批 ∥ 设置——`sandbox/SANDBOX.md` §8） | admin 会话（服务端判定——`user` ⇒ 403） | 本档 §2.5 |
| 沙盒成员面 | `GET /api/me/sandbox/workspaces`（本人工作区读数——`sandbox/SANDBOX.md` §8 成员面） | 会话（本人——admin/user 恒本人过滤） | 本档 §2.7 |
| 管理面 agent 面 | `POST/GET/PATCH /api/admin/agent/chats*`（会话 + 换模型 + 回合 NDJSON 流） ∥ `POST /api/admin/agent/chats/:id/abort`（回合中止——chat-shell-align 批） | admin 会话（服务端判定——`user` ⇒ 403） | 本档 §2.8 |
| 项目面（成员） | `/api/projects*`（可见项目列表/详情/成员增删改/项目改——可见性三档） | 会话 + 能力矩阵（`project/PROJECTS.md` §3） | 本档 §2.9 |
| 项目管理面（admin） | `/api/admin/git-sources*`（源 CRUD ∥ 立即同步 ∥ 体检 ∥ 拉列表 ∥ webhook 密钥生成） ∥ `/api/admin/projects*`（加仓——批量/手输 ∥ 项目删除） | admin 会话（服务端判定——`user` ⇒ 403） | 本档 §2.9 |
| 项目接收面（公开） | `POST /api/hooks/git-sources/:id`（github webhook 接收——验签门；`project/PROJECTS.md` §13） | 无会话（每源密钥 HMAC-SHA256 验签） | 本档 §2.9 |
| 团队台账面（控制台） | `GET/POST /api/ledger*`（列表/新建/编辑/收口撤回——四行） | 会话 + 项目能力矩阵（`ledger/LEDGER.md` §2——KD-SV-143） | 本档 §2.10 |
| 团队台账面（端侧） | `GET/POST /api/client/ledger*`（同四行——端侧核工具消费） | 登录 token（Bearer——与 /v1 同校验单源） | 本档 §2.10 |
| 成员面对话面（成员 · 移动端） | `/api/me/chat/*`（会话七行——列表/建/详情/模型清单/发消息 NDJSON 流/中止/换模型设档）+ 成员面工作区写面（建/启停/销毁/拉仓——`/api/me/sandbox/*` 扩）+ 成员 git 凭据（三行——`/api/me/git-credentials*`） | 会话 cookie ∥ 登录 token（Bearer——**双门同判权**；恒本人） | 本档 §2.11 |
| 盒接入面（盒出向） | `GET /api/box/events`（SSE 下行——含 `cmd` 指令） ∥ `POST /api/box/sessions/:id/turns`（流式体） ∥ `POST /api/box/commands/:cmdId/result` ∥ `POST /api/box/ping`（保活应答） ∥ `POST /api/box/credential`（git 凭据取件） | 每工作区 key（`Authorization: Bearer`——与 /v1 同校验单源；第二门） | 本档 §2.12 |
| MCP 管理面（server-mcp 批——2026-10-13） | `GET/POST/PATCH/DELETE /api/admin/mcp*` ∥ `POST /api/admin/mcp/probe`（清单 CRUD + 探活——机制全文 = `mcp/MCP.md`） | admin 会话（服务端判定——`user` ⇒ 403） | 本档 §2.13 |
| 前端静态面 | `GET /` ∥ `public/**`（`app.mjs` ∥ `nav.mjs` ∥ `views-*`（档单 = `webui/WEBUI.md` §1） ∥ `style.css`） | 公开（页面壳零数据） | `webui/WEBUI.md` §1 |
| 其余 | —— | —— | 404（JSON 错误形 = §3） |

- 分派 = `thincoder-server/src/gateway/server.mjs`（已落盘）注册行制——新端点 = 注册一行（断点列 = `EVOLUTION.md` §1-G1）。
- 团队 key 面全部走 `Authorization: Bearer <key>`（OpenAI 兼容工具默认形——唯一接受形）。

## 2. OpenAI 三面

| 方法 + 路径 | 鉴权 | 语义 |
|---|---|---|
| `POST /v1/chat/completions` | 团队 key | 上游聊天转发（流式 SSE ∥ 非流式 JSON 均透传）；记账；派发命中后过**成员模型禁用准入**（404 `model_not_found`——§2.1/KD-SV-42）与配额准入（429 `quota_exceeded`——§2.1/KD-SV-38）与模型限流准入（429 `rate_limited`——§2.1） |
| `GET /v1/models` | 团队 key | 模型清单（chat 清单——`id` = **对外标识**：配别名 ⇒ 别名 ∥ 未配 ⇒ `provider/model` 前缀名（2026-10-09 alias 批；机制 = §6 KD-SV-59）；**嵌入引擎模型不入本清单**（单独命名空间——嵌入派发面 = §2；2026-10-09 embed 解耦批；机制 = §6 KD-SV-58）；**运行时注册表派生**：开放清单 = 库内 `providers.models`，保存即换表——§2.2；**成员禁用随动滤除**——调用者禁用集不在列（§2.1/KD-SV-42）） |
| `POST /v1/embeddings` | 团队 key | 内网引擎转发（响应透传）；记账；**缺 `embedding` 段 ⇒ 404 `model_not_found`（消息明示未配置——嵌入面禁用态；2026-10-09 embed 解耦批）** |

### 2.1 转发与计量行为（三面共用）

- **派发 = 对外标识精确匹配**（注册表查表——装配期构建 ∥ 保存即换表（§2.2）；**对外标识 = 配了别名 ⇒ 别名 ∥ 未配 ⇒ `provider/model`**（`provider/model` 形 = 首斜杠切分：首段 = provider ∥ 余段 = 上游模型名（可含斜杠）；两段非空）；
  **配了只认别名**（旧 `provider/model` 名（该模型已配别名）⇒ 404 `model_not_found`——消息明示含别名 ∥ 非别名裸名 ⇒ 404 同形）；未命中 ⇒ 404 `model_not_found`；**别名全服唯一**——撞 ⇒ 拒启 ∥ 保存 400（KD-SV-59）∥ **同 provider 内重名 ⇒ 拒启**）——KD-SV-4/59（§6）；
  **解析 = server 面自持**（不沿用核 `parseModelRef` 冒号家族——两套面：仓内他面锚 `provider:model` ∥ 本面锚 `provider/model`）。
- **配额准入（功能点 21——KD-SV-38）**：派发命中后、转发前（与限流准入并列——准入前拒打不落用量不变）；三级解析（成员×模型覆盖 ⇒ 平台 `settings.quotaTokens` ⇒ 不限——覆盖随鉴权行、平台值随运行时快照）；不限 ⇒ **零 SQL 短路**；命中 ⇒ 计数表点查（O(1)——表 = `store/STORE.md` §2 v5 段；维护 = 记账同事务——`metering/METERING.md` §1）。
  超限 ⇒ 429 `quota_exceeded`（message 含模型外标 + 已用/额度；他模型不受累）；**仅 chat**——嵌入面零涉（用户 09:31 裁；旧总额检查已移除）。
- **成员模型禁用准入（功能点 23③——KD-SV-42）**：派发命中后、**配额准入前**检该成员禁用集（随鉴权行——零查询）；被禁 ⇒ 404 `model_not_found`（消息明示「已对该成员禁用」——**零新码**）；**禁用优先于配额**（被禁即拒，不涉配额判定）；`/v1/models` 同判随动（输出 = 开放清单 − 调用者禁用集）；**仅 chat**——嵌入面零涉；机制全文 = `accounts/ACCOUNTS.md` §2.2（存储/写面/与配额关系/审计口径）。
- **模型限流准入（功能点 17 C——KD-SV-35）**：派发命中后、转发前检 per-model RPM/TPM（配额准入之后——同一位点；进程内存 60s 定窗；通过 ⇒ 计次 +1；token 于用量到达计入——失败/断开计次不计 token）；超限 ⇒ 429 `rate_limited` + `Retry-After`（秒——距窗尾）；限值源 = provider `settings`（空 = 不限）；热生效 = 换表链随动；重启归零（软状态）；嵌入面零涉（引擎模型非 provider 模型——配置面 = 系统页）。
- **上游出口代理（逐渠——KD-SV-55）**：条目标 `proxy: true` ∧ 顶层 `proxy.uri` 在案 ⇒ 该渠上游请求（**chat 转发 ∥ 模型发现探针——同判定**）经代理；缺省 ∥ 非真 ∥ 无 uri ⇒ 直连；loopback 目标恒直连（NO_PROXY 语义——D-PX9）；**无全局闸**（逐渠独立——D-PX1）；嵌入 ∥ 更新自检零涉；实现 = `thincoder-server/src/gateway/proxy.mjs`（自持 std——零第三方；TLS 全量）。配置 = `ops/OPS.md` §1；全文 = §6 KD-SV-55。
- **SSE 逐块透传**：中继字节面原样 `pipe`（零改）；客户端断连 ⇒ 中止上游（记 `status='aborted'`）。
- **流式计量注入**：`stream === true` 且未带 `stream_options.include_usage: true` ⇒ 置 true（显式 false 亦覆盖——计量完整性优先）——KD-SV-5（§6）。
- **usage 提取**：旁路 tap 只读扫描 `data:` 行 JSON（行缓冲 ∥ 单行上限 1 MiB ∥ BOM 剥除 ∥ CRLF 容错）——KD-SV-10（§6）；记录面（落库形 ∥ 写入时点）= `metering/METERING.md` §1。
- 含 usage 的帧对消费方无扰（四端核 `readSSE` 对 usage 帧直取后跳）。
- 上游配置（provider 库单源 ∥ `embedding` 段）= `ops/OPS.md` §1 ∥ §2.2。

### 2.2 provider 管理面（控制台——仅 admin）

（端点族 = `/api/admin/providers/*`；判权 = `accounts/ACCOUNTS.md` §3 `requireAdmin` 口径——`user` ⇒ 403 ∥ 无/过期会话 ⇒ 401；错误形 = §3 全码沿用——无新码；写端点 JSON 型门同 §1 前言）

| 方法 + 路径 | 语义 |
|---|---|
| `GET /api/admin/providers` | 列表 `{ providers: [{ id, name, baseURL, apiKey, models, settings, modelMeta, modelReasoning, proxy, createdAt, updatedAt }] }`——`settings` = 模型设置映射（见下）；`modelMeta` = 上游模型元数据留存图（见下「模型元数据」）；`apiKey` = 回显形（掩码——见下） |
| `POST /api/admin/providers` | 新增 `{ name, baseURL, apiKey?, models?, modelMeta?, proxy? }` ⇒ `{ ok, id }`；校验不过 ∥ 重名 ⇒ 400（库与运行时零变）；`modelMeta` = 期望图（见下「模型元数据」）；`proxy` = 上游代理旗（缺省 `false`；非布尔 ⇒ 400——见下「上游代理旗」） |
| `PATCH /api/admin/providers/:id` | 修改（字段缺省 = 不动；`apiKey: ""` = 清除；可含 `env:` 引用；`settings` = 模型设置局部映射——键级合并，见下；`modelMeta` = 期望图——过滤 + 与提交 `models` 求交，见下；`proxy` = 布尔直写，缺省 = 不动）；不存在 ⇒ 404 |
| `DELETE /api/admin/providers/:id` | 删除（硬删——用量行零触）；不存在 ⇒ 404 |
| `POST /api/admin/providers/discover` | 模型发现（草稿可用）`{ baseURL, apiKey?, providerId?, proxy? }` ⇒ `{ models: [...], modelMeta: { "<id>": {…} } }`（留存集——见下「模型元数据」）；失败 ⇒ 502 `upstream_error`；`proxy` = 代理判定明传（**明传优先 ∥ `providerId` 条目旗兜底 ∥ 皆无 ⇒ 直连**——与 chat 转发同判定，见 §2.1） |
| `GET /api/admin/providers/presets` | 预设清单（只读——「从预设快速添加」数据源）`{ presets: [{ preset, name, baseURL, models: [] }] }`——全表（起步 21 家；**2026-10-09 清除批：零 `model` 键；`models` = 空清单保留**——模型清单表 = 空表，勾选走「模型发现」）；缺省展开 = `expandProviderEntry`（`thincoder-server/src/ops/presets.mjs`——KD-SV-17）；**表零密钥**——响应无 `apiKey` 字段 |

- **存储 = 库单源**：`providers` 表（`store/STORE.md` §2 v2 段）；`config.json` 的 `providers[]` 降为一次性种子（矩阵 = `ops/OPS.md` §1）。
- **保存即热生效**（用户 2026-10-06 16:01 令）：装配期建 provider 运行时（箱内持注册表）；保存路径 = ① 校验（单源 = `thincoder-server/src/ops/config.mjs` 导出——与配置种子同规）→ ② 建候选注册表（`env:` 解析——缺位 ⇒ 400 不落库）→ ③ 落库 → ④ `runtime.set(候选)`（原子换表）；HTTP 面（`/v1/models` ∥ 派发）读 `runtime.get()`——**零重启**。
- **在途请求口径**：派发时快照（转发闭包持当时 provider 对象）——换表只影响**后续**请求；删除/改名不断在途流。
- **密钥回显形**（永不回明文）：空 ⇒ `""`；`env:` 引用 ⇒ 原文（引用非秘密）；明文 ⇒ `…` + 末 4 字符。密钥值**永不入日志**（日志只带 provider 名/id 与动作）。
- **思考档位（`modelReasoning`——console-reasoning-levels 批；机制 = `agent/ADMIN-AGENT.md` §11.4）**：稀疏 map（键 = 上游真名 ∥ 值 = 该模型 `reasoningEffortEnum` 数组；**无档模型零键**——控制台呈中性）；源 = 核 `thincoder-core/model-specs.mjs` `specForModel`（运行期直读——零第二清单）；
  缺核 ⇒ `{}` + 一条警告（档位面退中性——生产 = 核为声明依赖）；写面 = §2.8 `PATCH …/chats/:id { reasoning }`（值域同源——跨域单源）。
- **上游代理旗（`proxy`——台账 #1129）**：条目布尔字段（存储 = v9 列——`store/STORE.md` §2）；写面 = POST/PATCH ∥ 种子条目（两形同携——`ops/OPS.md` §1）；读面 = GET 行 `proxy`；判定与消费 = §2.1 条（**无全局闸**——逐渠独立）；控制台面 = 两窗勾选（`webui/ADMIN.md` §2.1④）；非布尔 ⇒ 400（校验单源 = `thincoder-server/src/ops/config.mjs`）；保存即热生效（构建期注入 `proxyUri` ⇒ 换表——在途照旧）。
- **模型发现**：`GET {baseURL}/models`（Authorization 条件同转发——key 空不发）；**代理条件同转发**（明传 `proxy` ∥ `providerId` 条目旗——同判定；出口 = `proxyFetch`）；超时 10s（常量可覆盖——实现注入口径）；解析 = `data[].id` 字符串集（去重）+ **保留集元数据**（`modelMeta`——见下「模型元数据」条；同响应同集、去重首见）；
  不可达 ∥ 超时 ∥ 非 JSON ∥ 无 `data` ⇒ 502 `upstream_error`（可读消息——控制面提示 + 重试；**无手填兜底**——用户 2026-10-06 21:36 裁定，批 `console-provider-redo`；服务端语义零改）；草稿键经 body 传入**不落库**。
- **模型元数据（留存图——功能点 24：上游富字段保留 + 展示）**：保留集 = **白名单四字段**（用途先行——用户 2026-10-07 12:11 裁「只取有用途字段、不建机制、缺就空着」）——
  `displayName`（展示名；**源 = `display_name` 优先**（在场且 trim 非空）——缺位 ∥ 非字符串 ∥ 空白串 ⇒ **回落 `name`**；两源过同一洁净面（≠ 模型名 ∥ ≤200 字符，沿 settings `note` 先例）——洁净面不过 ⇒ 略（**不再二次回落**）；存储 = 原文（判定用 trim——不回写））∥ `contextWindow`（上下文窗口；来源 `context_window` ∥ `context_length` ∥ `max_model_len`——正整数）∥
  `vision`（图片输入；来源 `supports_image_in === true` ∥ `input_modalities` 含 `image`——仅收 `true`）∥ `status`（上游状态原文；**仅命中退役词表**（`shutdown` ∥ `retired` ∥ `deprecated` 子串——大小写无关）才收，供退役提示）。
  未收录不采（推理档位族 `effort`/`think_efforts`/`thinking_type`/`supports_reasoning` ∥ `supports_video_in` ∥ `max_output_tokens` ∥ `modalities`/`limit`（方向/形未明）∥ 噪声族——无展示/动作面，不堆砌）；形不符 ∥ 缺 ⇒ 略（零兜底值、零占位）。
  形 = `{ "<上游模型名>": { displayName? ∥ contextWindow? ∥ vision? ∥ status? } }`——**≥1 字段才入键**；只含开放清单（`models`）模型。
  写面 = POST/PATCH body `modelMeta`：**键在场 = 期望图**（白名单过滤 + 形不符即略 + 与提交 `models` 求交落库）；**键缺省 = 现存图按 `models` 求交**（删项随之滑落——零孤儿）；非对象 ⇒ 400（库与运行时零变）。
  **撤销面口径**（2026-10-09 补记）：上游不再报某字段 ⇒ 存储值**不被带落**（控制台保存期望图 = 存储 ∪ 发现——发现值优先 ∥ 存储补齐）；**UI 无逐字段清空径**——字段清空仅随 `models` 减项求交滑落。
  读面 = GET 行 `modelMeta`（恒在场——未存 ⇒ `{}`）；发现 = discover 响应 `modelMeta`（与 `models` 同集）。
  落点 = `providers.model_meta_json`（v7——`store/STORE.md` §2）；**圈界** = 纯展示数据：转发 ∥ 派发 ∥ `/v1/models` ∥ 校验单源（`thincoder-server/src/ops/config.mjs`）零涉；不建元数据同步/校验/仲裁机制（用户 12:11 裁）。
- **开放清单 = `models` 字段**（勾选区；**条目两形 = 字符串（无别名）∥ 对象 `{ name, alias }`（配别名）**——`alias` 缺省/空（`null` ∥ `""`）⇒ 归一无别名；数字/布尔/对象/数组 ⇒ 400（§5 AC-29 行）；语义全文 = §6 KD-SV-59）：`/v1/models` 逐项 = **对外标识**（别名 ∥ `provider/model`）；派发只命中开放清单（未开放 ⇒ 404——选择性中继口径保持）。
- **模型设置（`settings`——功能点 17 配置面；用户 21:39/21:40 裁 A/C/D/E；功能点 21 扩配配额）**：形 = `{ "<上游模型名>": { rpm ∥ tpm（正整数 ∥ null） ∥ costIn ∥ costOut（≥0 数 ∥ null） ∥ note（≤200 字 ∥ null） ∥ quotaTokens（≥0 整数 ∥ null——每人每月默认用量） } }`——`null`/缺省 = 未设。
  键 = 上游模型名（与 `models` 同空间；不在 `models` 的键合法——设置随名保留，停用不丢）；`quotaTokens` 消费 = 配额平台层默认（`metering/METERING.md` §2——KD-SV-38）。
  写面 = PATCH 键级合并（请求 `settings` 出现的键 = 整对象替换（值 `null` ⇒ 删键）；未出现键 = 不动——沿 PATCH「字段缺省 = 不动」口径）；**提交线形 = 键 = 上游模型名 ∥ 值 = 该模型完整对象**（全子字段在册；未设字段显式 `null`；清空 = 显式 `null`；草稿初值来源 = GET 行 `settings` 该键值）。
  控制台弹窗 = 单键提交——部分字段保存恒以全对象提交（同键其余字段不丢）；读面 = GET 行内 `settings` 全图；**存储 = `providers.settings_json`（v4——`store/STORE.md` §2/§3）**。
  校验单源 = `thincoder-server/src/ops/config.mjs`（`validateProviderEntry`/`validateProviderEntries` 扩 settings——未知子字段 ∥ 非法值 ⇒ 400，库与运行时零变）；**保存即热生效** = 既有四步链（候选注册表携带 settings ⇒ 换表 ⇒ 限流行取新值——KD-SV-35）；**配置种子零 settings 字段**（控制台单一面——`config.json` `providers[]` 段载入缺省 `{}`）。
- **预设快速添加（通道 = 预设列表端点）**：`GET /api/admin/providers/presets` ⇒ 表单预填（`name`/`baseURL`——用户补 `apiKey` 并经「模型发现」勾选）⇒ 保存走 **POST 全字段路径**；列表端点只读（写路径零新语义）——**预填不豁免校验**（单源 = `thincoder-server/src/ops/config.mjs` 导出；重名 ∥ 非法 ∥ `env:` 缺位照 400）；预设名不进写路径（写入体无 `preset` 字段——无未知预设错误面）；错误 = 401 ∥ 403（同族判权——零新码）。
- 装配接线：gateway 注册行装配期引导运行时（种子导入 → 构建）并返回；provider 管理面注册行接收**同一实例**（换表两族同见）。

### 2.3 系统面（探活 ∥ 版本可见——首版完备化①③）

| 方法 + 路径 | 鉴权 | 语义 |
|---|---|---|
| `GET /healthz` | 无（公开——探针入口；零鉴权只读） | 探活：`{ status, version, uptime, db }`——`status` = `"ok"` ∥ `"degraded"`；`version` = 运行树版本（同 `ready` 行——`ops/OPS.md` §5.4(g)）；`uptime` = 进程运行秒数；`db` = `"ok"` ∥ `"error"`（`SELECT 1` 一探）。正常 ⇒ 200；db 探活失败 ⇒ **503**（同形——`status:"degraded"` ∥ `db:"error"`）。`Cache-Control: no-store`；**不走统一错误信封**（探活响应自含状态）；仅注册 GET（HEAD ∥ POST ⇒ 404）。 |
| `GET /api/system` | 会话（两角色） | 版本与更新状态（控制台数据源——`webui/SYSTEM.md` §2.1）：`{ version, update: { mode, lastCheckAt, latest }, embedding: { model } }`——`mode` = 生效档位（`false` ∥ `"notify"` ∥ `"auto"`——钉版抑制后；未就位 ⇒ `null`）；`lastCheckAt` = 最近自检时刻（unix ms ∥ `null` = 未检）；`latest` = 已见新版号 ∥ `null`（无新版 ∥ 未检——自检失败静默同面，`ops/OPS.md` §5.4(a)）；`embedding.model` = 嵌入引擎模型名（调用所需非机密——**地址不在本端点**，admin 面 = §2.4）；**缺 `embedding` 段 ⇒ `null`**（未配置态——控制台向量卡「未配置」；2026-10-09 embed 解耦批）。无 ∥ 过期会话 ⇒ 401 `unauthorized`（同族口径）。 |

- 优先级：两路径均注册路由（分派先于静态兜底——§1）；与 `/v1` ∥ `/api` 族互不重叠。
- 更新状态 = 更新器进程内状态（`thincoder-server/src/ops/update.mjs`——`getStatus()` 导出；入口惰性注入——路由注册先于更新器创建）；自检成功 ⇒ 更新状态（有新 ⇒ 置版号 ∥ 无新 ⇒ 清 `null`）；失败 ⇒ 保前值（静默口径同面）。
- `embedding` 字段 = 配置真值（装配注入——源 `config.embedding.model`；**缺配判据单源 = 运行时 accessor**（`providerRuntime.get().engineModel()`——派发面同判，构建点注入同源等价——2026-10-09 alias 批随正 · 台账 #1152））；**地址不下发**（`baseURL` 归 admin 面——§2.4；用户面只需模型名）；缺段 ⇒ `null`（未配置态——2026-10-09 embed 解耦批）。

### 2.4 控制台数据面（管理总览 ∥ 向量服务——功能点 15①③）

（端点族 = `/api/overview` ∥ `/api/admin/embedding*` ∥ `/api/admin/config` ∥ `/api/admin/proxy/test`；判权 = `requireAdmin` 口径——`user` ⇒ 403 ∥ 无/过期会话 ⇒ 401；错误形 = §3 全码沿用——无新码；写端点 JSON 型门同 §1 前言）

| 方法 + 路径 | 语义 |
|---|---|
| `GET /api/overview` | 管理总览读数（`webui/READINGS.md` §2.1③）：`{ today: { requests, totalTokens }, members: { count } }`——`today` = 服务器本地自然日窗（界 = 当日 00:00；与用量报表**同源**——同一聚合函数）；`requests` = 行数（含 error/aborted）∥ `totalTokens` = `SUM(total_tokens)`（NULL 不计）。健康/更新两卡不走本端点（前端共享态——`webui/READINGS.md` §2.1⑤） |
| `GET /api/admin/embedding` | 引擎配置真值：`{ baseURL, model }`（= `config.embedding`——逐值同源）；**`apiKey` 不出响应**（密钥面零下发）；**缺段 ⇒ `{ baseURL: null, model: null }`**（未配置态——2026-10-09 embed 解耦批） |
| `POST /api/admin/embedding/test` | 探活/试跑（单端点——**服务端代发**；引擎 key 代持——浏览器零涉）：body `{ text?, baseURL?, model?, apiKey? }`（缺省 = 内置短探针文本；**标量三项 = 明传优先（草稿口径——KD-SV-54 口径镜像）：在场 ⇒ 按明传值探活（未保存亦可先验）∥ 缺省 ⇒ 运行配置回落**（**掩码/引用回显形（`…`+末 4 ∥ `env:X`）不作明传值**——`apiKey` 探活三态 = 未编辑 ⇒ 不携（落「运行配置回落」） ∥ 编辑 ⇒ 明传 ∥ 清除勾 ⇒ `""`；提交口径 = §2.4 PATCH 行）；`env:` 引用按字面值探发——引用解析面 = 保存/载入）；成功 ⇒ 200 `{ ok: true, dimensions, ms }`（`dimensions` = `data[0].embedding.length` ∥ `ms` = 用时）；失败 ⇒ 200 `{ ok: false, error: { kind, message }, ms? }`——`kind` ∈ `timeout` ∥ `unreachable` ∥ `http_error` ∥ `bad_response`；**不走统一错误信封**（诊断自含状态——沿 `/healthz` 先例）；超时 10s（沿发现家族）；**不落库不计量**（不经 usage 记账路径 ∥ 不查配额）；**缺配且无草稿（三项皆缺省）⇒ 400 `invalid_request_error`**（消息明示嵌入未配置——携草稿（`baseURL` + `model`）⇒ 照常探活；未保存亦可先验；2026-10-09 embed 解耦批） |
| `GET /api/admin/config` | 配置文件面读（文件不热载——生效 = 重启；机制全文 = `ops/OPS.md` §1）：`{ config: { host, port, db, autoUpdate, trustProxy, usageRetentionDays, proxyUri, embedding: { baseURL, model, apiKey } ∥ null, bootstrap: { username } ∥ null } }`——值为**有效值**（文件在场值 ∥ 缺省回填）；密钥面 = `apiKey` 掩码（`env:` 保形 ∥ 明文 ⇒ `…`+末 4 ∥ 空 ⇒ `""`——规则 = §2.2）；`bootstrap.password` 面零列（永不回显）；读档失败 ⇒ 500 |
| `PATCH /api/admin/config` | 配置写（白名单五键——`autoUpdate` ∥ `trustProxy` ∥ `usageRetentionDays`（正整数 ∥ null） ∥ `proxyUri`（`http:` URL ∥ `""` = 清除该段） ∥ `embedding: { baseURL, model, apiKey }`（**子键级 = 缺省 = 不动 ∥ 明填 = 替换——`apiKey: ""` = 显式空**；**掩码/引用回显形（`…`+末 4 ∥ `env:X`）不作明传值**——`apiKey` 三态 = 未编辑 ⇒ 不携（= 不变） ∥ 编辑 ⇒ 明传 ∥ 清除勾 ⇒ `""`））：出现的键 = 应用（未出现 = 不动；未知键 ∥ 空提交 ⇒ 400）；合并原档**保未知键** ⇒ 门 = `resolveEnvRefs` + `validateConfig`（**载入面等价两跳**——写入的文件必可载入；不过 ⇒ 400 原报文 + 文件零变）⇒ **原子写**（同目录 tmp ⇒ `rename` 覆盖；失败 ⇒ 文件零变 + 500）⇒ 审计 `config_update`（detail = 变更键名清单——值永不入）；⇒ `{ ok: true }`；**缺 `embedding` 段 ⇒ 子键合并自动建段**（控制台从无到有创建——缺段档 PATCH 他键照常过门；部分子键 ⇒ 400；2026-10-09 embed 解耦批）∥ **`embedding: null` ⇒ 400**（清空段 = 不做——禁用 = 编辑配置文件）；生效 = 重启（统一标注——`ops/OPS.md` §1） |
| `POST /api/admin/proxy/test` | 上游代理连通测试（控制台系统页「服务配置」卡·连通测试块——**真打**；`webui/SYSTEM.md` §2.2）：body `{ uri, target }`（**双必传**——trim 非空；`uri` 须 `http:` URL（口径沿 `validateProxyConfig`——`ops/OPS.md` §1 单源复用）；`target` 须 http(s) URL；缺 ∥ 非法 ⇒ 400 `invalid_request_error`）；服务端经 `proxyFetch(target, { method: "GET", signal }, uri)` 发真实 GET（同传输 ∥ 同 loopback 旁路判定）；成功（收到任一 HTTP 响应——**含非 2xx**）⇒ 200 `{ ok: true, status, ms }`；传输层失败 ⇒ 200 `{ ok: false, error: { kind, message }, ms }`——`kind` ∈ `timeout` ∥ `unreachable`（message 携底层诊断）；**不走统一错误信封**（诊断自含状态——沿 `/healthz`/向量探活先例）；超时 10s（`PROXY_TEST_TIMEOUT_MS`——注册参数可覆盖）；**不落库不计量**（不经 usage/配额/审计路径——失败仅 `log.warn`）；判权 = `requireAdmin`（user ⇒ 403 ∥ 无/过期会话 ⇒ 401） |

- **装配接线**：gateway 注册行一条（同 provider 管理面——`bin/thincoder-server.mjs` 一行注册）。

### 2.5 沙盒控制台面（admin——server-exec-sandbox 批；机制全文 = `sandbox/SANDBOX.md` §3/§8）

（端点族 = `/api/admin/sandbox/*`；判权 = `requireAdmin` 口径——`user` ⇒ 403 ∥ 无/过期会话 ⇒ 401；错误形 = §3 全码 + `sandbox_unavailable`；**节点/容器面（runner-admin-console 批）**：引擎失败 ⇒ 502 `upstream_error`（消息 = 逐句人话 + 引擎原文）∥ 容器/节点不存在 ⇒ 404 ∥ 形非法/重名/镜像缺/名占用 ⇒ 400（零新码）；
**容器面补齐/镜像族（sandbox-docker-admin 批增补——#1265）**：读三件（详情/日志/用量）读类 3s ∥ 重启/强杀动作类 15s ∥ 拉取超时 10 分钟；强杀未运行（409）∥ 拉取失败（非 2xx ∥ 流内 `error` 两形）∥ 镜像被引用（409）⇒ 400（零新码）；
**卷族（sandbox-volumes 批增补——#1291）**：两端点（列 ∥ 删）——列 = 读类 3s ∥ 删 = 动作类 15s；名形先校验（400 **零外呼**）∥ 引擎 404 ⇒ 404 ∥ **在用卷（引擎 409）⇒ 400 人话 + 处置句** ∥ 余 ⇒ 502（零新码）；列表零审计 ∥ 删卷审计 `volume_delete`（detail 键集 = `accounts/ACCOUNTS.md` §2.1）；
**接入面（2026-10-14 起）**：手工登记 = `POST /api/admin/sandbox/runners`（直填 Docker API 地址 + 连通自检）；装机/主机运维 = 管理面 chat 内动作（`exec`/`docker`/`runners`——零新端点；机制全文 = `sandbox/SANDBOX.md` §3 接入面）；**任务式装机（托管接入）四端点已退场**（2026-10-14 裁「撤」——表 `sandbox_onboarding` 停机留史）；
**镜像源族（sandbox-image-sources 批增补——#1274）**：源清单五端点（列/预选/增/改/删）= 统一信封（400/404——零新码）∥ 目录/标签两端点 = **自含状态形**（成 ⇒ `{ ok: true, … }`；败 ⇒ `{ ok: false, error: { kind, message }, ms }`；
  远端事实分类不套信封；沿 `POST /api/admin/proxy/test` 先例）∥ 读类预算 10s（跨公网——逐调用；非节点面 3s）∥ 匿名 Bearer 挑战 = 零凭据（私有源 ⇒ 如实 `auth_required`）∥ 零涉沙盒可用性门（源面与节点无关））

| 方法 + 路径 | 语义 |
|---|---|
| `GET /api/admin/sandbox/overview` | 运行面读数（**读时探活**——每节点现打 `GET …/info`，3s ∥ 并发）：`{ status: "available" ∥ "unavailable", reason?, runners: [{ id, name, address, status, online, version, containers: { total, running } ∥ null, selfCheck, createdAt, ssh: { user, port, authKind, credential: { state, updatedAt } } }] }`——无节点注册 ∥ 节点全部不可达 ⇒ `unavailable` + 原因；`online=false` ⇒ `version`/`containers` = `null`（离线读数不外推）；**节点面（添加/删除）恒可用** |
| `POST /api/admin/sandbox/runners` | 添加节点：`{ name, address }`（地址归一 = 按档补 scheme + 缺省端口 2375/2376——缺协议/端口补全；**连接面 TLS 档（本增补 #2）：体增 `connection`（`"plain"` ∥ `"tls"`；缺省 plain——不携键零行为变化）∥ `tls`（`{ ca, cert, key }` 三件——仅 `"tls"` 档在场；私钥加密落库（AES-256-GCM）——**响应/审计零材料字段**；不变量 `https` ⇔ 三件齐——缺件/明文档携件/与显式 scheme 相抵 ⇒ 400 零外呼））⇒ **连通自检**（`GET …/version`——读版本 + 协商 API 版本 `max(1.44, MinAPIVersion)`，须 ≤ `ApiVersion`；TLS 档 ⇒ 三件入 `https.request` 选项）⇒ 通过 ⇒ 200 `{ runner }`（行形含 `ssh` 元数据 + `connection`/`tls` 元数据（state/updatedAt——零材料）——同 `overview` 行元素形）+ 审计行（`runner_add`——detail 增 `tls` 布尔键）；失败（不可达 ∥ 超时 ∥ 非 Docker API ∥ 版本不兼容）⇒ 502 `upstream_error` + **零落库** + 审计行（`runner_selfcheck_failed`）；重名/形非法 ⇒ 400 |
| `DELETE /api/admin/sandbox/runners/:id` | 删除节点：`{ containers: "keep" ∥ "remove" }`——有容器未给处置 ⇒ 400；`keep` ⇒ 只删登记 ∥ `remove` ⇒ 逐删 `DELETE …/containers/{id}?force=1`，任一失败 ⇒ 502 + 登记行保留（消息携失败清单）；无容器 ⇒ 直接删；**节点不可达 ⇒ 仅 `keep` 可过**；有承载工作区 ⇒ `confirm: true`（现行为）；不存在 ⇒ 404；审计行（`runner_delete`——detail 携 kept/removed） |
| `PUT /api/admin/sandbox/runners/:id/credential` | 主机凭据设/改（admin-chat-creds-merge 批——#1326）：`{ sshPort?, sshUser, auth: { kind: "key" ∥ "password", secret }, sudoSecret? }` ⇒ 200 `{ runner }`（行形——**响应零秘密字段**）；密文落行密列（AES-256-GCM——机制 = `sandbox/SANDBOX.md` §3）；形非法（缺 `sshUser` ∥ `auth.kind` 表外 ∥ `secret` 空 ∥ `sshPort` 越界 0/70000）⇒ 400（逐形人话——库零变）；不存在 ⇒ 404；审计 `host_credential_set`（detail 键集 = `accounts/ACCOUNTS.md` §2.1——零秘密） |
| `DELETE /api/admin/sandbox/runners/:id/credential` | 主机凭据撤销（server 侧清密列——只及存留；目标机账号须到机处置）：密列零化 + `credential_state='revoked'` ⇒ 200 + 审计 `host_credential_revoke`；**无凭据在留 ⇒ 400**；不存在 ⇒ 404 |
| `PUT /api/admin/sandbox/runners/:id/connection` | 连接方式编辑（sandbox-exec-rebuild 批 · 增补 #2——机制全文 = `sandbox/SANDBOX.md` §3 连接方式块）：`{ address?, connection: "plain" ∥ "tls", tls?: { ca, cert, key } }`——**全列覆写**（改地址/切档/换材料同径；先自检后落库——自检失败 ⇒ 502 + **库零变**）；不变量 `https` ⇔ 三件齐；**关 TLS = 原子**（地址回 `http` + 材料清零——同事务）；形非法/相抵/缺件 ⇒ 400（库零变）；不存在 ⇒ 404；审计 `runner_connection`（detail = `kind`+`runnerId`+`address`+`tls` 布尔——零秘密）；响应 `{ runner }`（行形——**零材料字段**；`tls.state` 只回 none/sealed + `updatedAt`） |
| `GET /api/admin/sandbox/runners/:id/containers` | 容器列表（读时读 `GET …/containers/json?all=1`）：`{ containers: [{ id, name, image, state, status }] }`（名去前导 `/`）；节点不可达 ⇒ 502 |
| `POST /api/admin/sandbox/runners/:id/containers` | 创建容器（四件）：`{ name, image, volume?, command? }` ⇒ `POST …/containers/create?name=<名>`（体 = `{ Image, Cmd: <命令>, HostConfig: { Binds: ["<卷>:/workspace"] } }`——**待命命令缺省恒携**（盒语义，缺它 ⇒ 无长驻进程的镜像一亮即退；轻通道笔 3）；`command` 给了 ⇒ 该值按空格切分入 `Cmd`（**可覆写**——轻通道笔 10）；显式空串 ⇒ 400；卷缺 ⇒ 省略 `HostConfig`）⇒ 200 `{ container: { id, name, image, state: "created" } }` + 审计行（`container_create`）；引擎 404（无此镜像）∥ 409（名占用）⇒ 400（含引擎原文）；不可达 ⇒ 502 |
| `POST /api/admin/sandbox/runners/:id/containers/:containerId/start` ∥ `…/stop` | 启动 ∥ 停止：`POST …/containers/{id}/start` ∥ `…/stop`（`t` 不带 = 引擎缺省 10s）——204 ⇒ 200 `{ ok: true, id }`；**304（已启/已停）⇒ 幂等成功**；404 ⇒ 404 `not_found`；余 ⇒ 502；审计行（`container_start` ∥ `container_stop`） |
| `DELETE /api/admin/sandbox/runners/:id/containers/:containerId` | 删除容器：`DELETE …/containers/{id}?force=1`（运行中强停强删；**卷不随删**）——204 ⇒ 200；404/502 同上；审计行（`container_delete`） |
| `GET /api/admin/sandbox/runners/:id/containers/:containerId` | 容器详情（读时读 `GET …/containers/{id}/json`）：`{ container: { id, name, image, state, status, created, startedAt, finishedAt, restartCount, command: { entrypoint, cmd }, env, mounts: [{ type, source, destination, mode, rw }], ports: [{ port, hostIp, hostPort }] } }`（端口未映射 ⇒ hostIp/hostPort = null）；引擎 404 ⇒ 404 `not_found`；不可达 ⇒ 502；**零审计**（读动作） |
| `GET /api/admin/sandbox/runners/:id/containers/:containerId/logs?tail=N` | 容器日志：`tail` 缺省 200（范围 1–2000；越界/非数 ⇒ 400）⇒ 引擎 `logs?stdout=1&stderr=1&timestamps=1&tail=N`（非 TTY = 8 字节帧头多路复用 ⇒ 解复用后输出；**行首时标在场**（走查轮 2026-10-11——日志窗单时间线并流排序单源）；文本截断 256 KiB）⇒ `{ logs, truncated, tail }`；404/502 同上；零审计（读动作） |
| `POST /api/admin/sandbox/runners/:id/containers/:containerId/restart` | 重启：`POST …/containers/{id}/restart`（`t` 不带 = 引擎缺省 10s）⇒ 204 ⇒ 200 `{ ok: true, id }`；404 ⇒ 404；余 ⇒ 502；审计行（`container_restart`） |
| `POST /api/admin/sandbox/runners/:id/containers/:containerId/kill` | 强杀（SIGKILL）：`POST …/containers/{id}/kill` ⇒ 204 ⇒ 200；**引擎 409（未运行）⇒ 400 人话**（非幂等成功——≠ stop 的 304）；404 ⇒ 404；余 ⇒ 502；审计行（`container_kill`） |
| `GET /api/admin/sandbox/runners/:id/containers/:containerId/terminal`（**WebSocket 升级**——sandbox-container-terminal 批） | 容器终端（真 pty——`Upgrade: websocket` 握手 ⇒ 101 后双向帧）：**101 前判权** `requireAdmin`（无会话 ⇒ 401 ∥ `user` ⇒ 403）+ 同源 `Origin` 门（异源 ⇒ 403）；节点不存在 ⇒ 404（均无 101）；**101 后**帧面 = 二进制帧（pty 字节双向）+ 文本帧 JSON 控制（下行 `ready`/`exit`/`error`/`pong` ∥ 上行 `resize`/`ping`）；就绪前 resize = 挂起（就绪后施加）∥ `h`/`w` 逐值（合法域 cols 1–500 ∥ rows 1–300——越界忽略）；**in-band 错误码四条**（`container_not_running` ∥ `engine_unreachable` ∥ `exec_failed` ∥ `session_closed`——非新错误形：帧内 `code` + 可选 `detail`，文案归前端）；心跳/收口/停机/审计 = `sandbox/SANDBOX.md` §3 容器终端块（单源——本行不复制） |
| `GET /api/admin/sandbox/runners/:id/containers/:containerId/stats` | 用量（读时读两并发）：`stats?stream=false&one-shot=true`（CPU/内存）+ `json?size=1`（磁盘）⇒ `{ usage: { cpuPercent, memUsed, memLimit, diskRw, diskRoot, sampledAt } }`（`cpuPercent` = `cpuΔ/systemΔ × 在线 CPU 数 × 100`；一次采样基线不足 ⇒ null）；404/502 同上；零审计 |
| `GET /api/admin/sandbox/runners/:id/images` | 镜像列表（读时读 `GET …/images/json`）：`{ images: [{ id, tags, size, created }] }`（`RepoTags` 缺/null ⇒ `[]`）；不可达 ⇒ 502；零审计 |
| `POST /api/admin/sandbox/runners/:id/images/pull` | 拉取：`{ image }`（形 = `名[:标签]`——缺省 `latest`；含 `@` ⇒ 400）⇒ `POST …/images/create?fromImage=<名>&tag=<标签>`（**超时 10 分钟**）⇒ 200 `{ ok: true, image, tag }`；**私有仓凭据（底座可换增补——KD-SV-188）：引用主机命中凭据表 ⇒ 携 `X-Registry-Auth`（base64url(`{username,password,serveraddress}`)；Hub 特例 `serveraddress=https://index.docker.io/v1/`；未命中 ⇒ 匿名——现状零改）**；失败（引擎非 2xx ∥ 200 流内 `error`）⇒ 400 携引擎原文；不可达/超时 ⇒ 502；审计行（`image_pull`——detail 增 `auth` 布尔键） |
| `DELETE /api/admin/sandbox/runners/:id/images` | 删除镜像：`{ ref, force? }`（`ref` = 镜像 id 或 `名:标签`——含空白/`?`/`#`/`%` ⇒ 400；**走请求体**——引用字符集含 `/`/`:`）⇒ `DELETE …/images/<ref>?force=<0|1>`（缺省 0）⇒ 200 `{ ok: true, ref }`；404（无此镜像）⇒ 404；**409（被容器引用/多标签）⇒ 400 人话 + 处置句**；余 ⇒ 502；审计行（`image_delete`——detail 携 force） |
| `GET /api/admin/sandbox/runners/:id/volumes` | 卷列表（sandbox-volumes 批——#1291；读时读 `GET …/volumes` 3s）：`{ volumes: [{ name, driver, createdAt }] }`（引擎 `Volumes` 缺/null ⇒ `[]`——字段如实取 `Name`/`Driver`/`CreatedAt`）；不可达 ⇒ 502；零审计 |
| `DELETE /api/admin/sandbox/runners/:id/volumes/:name` | 删除卷（动作类 15s；sandbox-volumes 批——#1291）：名形先校验（字母/数字起头 + `[A-Za-z0-9_.-]` 续——非法 ⇒ 400 **零外呼**，防路径段穿越）⇒ `DELETE …/volumes/<名>` ⇒ 204 ⇒ 200 `{ ok: true, name }` + 审计行（`volume_delete`——detail 键集 = `accounts/ACCOUNTS.md` §2.1）；不存在 ⇒ 404；**在用卷（引擎 409）⇒ 400 人话 + 处置句**（引擎原文如实携）；余 ⇒ 502 |
| `GET /api/admin/sandbox/image-sources` | 镜像源列表（sandbox-image-sources 批——#1274）：`{ sources: [{ id, name, address, kind, createdAt }] }`（`kind` = 按地址派生 `hub` ∥ `hub-mirror` ∥ `v2`——Hub 四别名 ∥ Hub 镜像两主机；派生不入库）；零审计（读动作） |
| `GET /api/admin/sandbox/image-sources/presets` | 常用源预选（静态表——server 端单源）：`{ presets: [{ name, address }] }`（七条——Hub ∥ `ghcr.io` ∥ `quay.io` ∥ ACR ∥ SWR ∥ DaoCloud ∥ 1ms.run）；表单只回填名 + 址；零审计 |
| `POST /api/admin/sandbox/image-sources` | 增源：`{ name, address }`（名 ≤40 ∥ 址 = `[http://\|https://]主机[:端口]`——缺 scheme 补 `https://`；含路径/查询/空白 ⇒ 400）⇒ 200 `{ source }` + 审计行（`image_source_add`——detail 键集 = `accounts/ACCOUNTS.md` §2.1）；撞名/撞址 ⇒ 400（库零变） |
| `PATCH /api/admin/sandbox/image-sources/:id` | 改源：`{ name?, address? }`（键级——出现键 = 应用）⇒ 200 `{ source }` + 审计行（`image_source_update`）；不存在 ⇒ 404；撞名/撞址 ⇒ 400 |
| `DELETE /api/admin/sandbox/image-sources/:id` | 删源 ⇒ 200 `{ ok: true }` + 审计行（`image_source_delete`）；不存在 ⇒ 404 |
| `GET /api/admin/sandbox/image-sources/:id/catalog` | 源仓库目录（server 直连源——读类 10s；`n` 缺省 200 ∥ 1–1000）：v2 = `GET <base>/v2/_catalog?n=<n>`；`kind=hub` ⇒ `unsupported`（Hub 无全站目录 API）；成 ⇒ 200 `{ ok: true, kind, repositories, truncated, ms }`（`truncated` = `Link: …rel="next"` 在场）∥ 败 ⇒ 200 `{ ok: false, error: { kind, message }, ms }`（`timeout` ∥ `unreachable` ∥ `auth_required` ∥ `unsupported` ∥ `bad_response`）；零审计 |
| `GET /api/admin/sandbox/image-sources/:id/tags?name=<仓库>&n=<n>` | 源标签清单（读类 10s）：v2 = `GET <base>/v2/<name>/tags/list?n=<n>`（`name` 形非法 ⇒ 400 **零外呼**）∥ `kind=hub` ⇒ `GET https://hub.docker.com/v2/repositories/<ns>/<repo>/tags?page_size=<min(n,100)>`（裸名补 `library/`）；读形同上行（`truncated` = v2 `Link` ∥ Hub `next`）；401 + `WWW-Authenticate: Bearer` ⇒ 匿名换 token 后携 `Bearer` 复读一次（scope = `registry:catalog:*` ∥ `repository:<name>:pull`）；零审计 |
| `GET/POST /api/admin/sandbox/workspaces` | 列表（名/负责人/绑定节点/盒状态/`stopReason`（停因注记——sandbox-exec-rebuild 批）/快照/资源覆写/**`baseImage`（底座绑定——NULL = 标准；底座可换增补）**）∥ 创建 `{ name, ownerMemberId, limits? }` ⇒ 放置 + 绑定节点 + key 签发 + 建盒链（卷目录 ⇒ 配额就位 ⇒ 闸复核 ⇒ **镜像就位（仅自定义底座——新建工作区恒无绑定 ⇒ 缺省跳过）** ⇒ 网络 ⇒ 容器 ⇒ 起——控制面直调 Docker API；链路/幂等/失败处置 = `sandbox/EXECUTION.md` §3；`limits` = 初始覆写——缺省 `{}`）；无可用节点 ⇒ 503（写门实时化） |
| `PATCH /api/admin/sandbox/workspaces/:id` | 资源档覆写 + 底座绑定（至少一键）：`limits`（`{ cpus ∥ memMb ∥ pids ∥ diskMb ∥ idleTtlMinutes ∥ wallclockTtlHours }`——键级合并（出现键 = 应用；值 `null` = 删键回落全局默认））∥ **`baseImage`（底座可换增补——字符串 = 归一引用（`名[:标签]`——缺标签补 `latest`；含 `@` ⇒ 400）；`null` = 恢复标准；生效 = 下次建盒/重建；审计 `workspace_base`——detail 键集 = `accounts/ACCOUNTS.md` §2.1）**；校验不过 ⇒ 400（库零变）；**生效 = 下次建盒/重建**（运行中盒零触——容器旗不可热改）；不回队指令 |
| `POST /api/admin/sandbox/workspaces/:id/derive` | 派生构建（底座可换增补——KD-SV-185；**同步请求**——最坏 ≈20 分钟（拉取 10 + 构建 10））：对绑定节点确保当刻底座的**派生镜像**（镜像就位四步：读底座（缺 ⇒ 拉取——携凭据）⇒ 读标准镜像 ⇒ 派生 tag 探（在场 ⇒ 采用）⇒ `POST …/build?t=<tag>`）⇒ 200 `{ ok: true, base, tag, cached, pulled, ms }`；**无自定义底座 ∥ 未绑定节点 ∥ 标准镜像不在节点** ⇒ 400 人话（库/盒零变）；节点不可达/超时 ⇒ 502；**实构才审计 `image_derive`**（缓存命中 ∥ 失败不落）；（无 `:id` 的全局 derive = 不做——派生永远是「某工作区在某节点」）；表/机制 = `sandbox/EXECUTION.md` §8 |
| `GET/POST /api/admin/sandbox/registry-credentials` | 私有仓凭据列 ∥ 增（底座可换增补——KD-SV-188）：列表 `{ credentials: [{ id, host, username, createdAt, updatedAt }] }`——**响应零秘密字段**；增 `{ host, username, secret }`（`host` 归一（小写；Hub 别名归 `docker.io`）∥ 形非法（含 scheme/路径/空白 ∥ `secret` 空）⇒ 400 零外呼 ∥ 撞主机 ⇒ 400）⇒ 200 `{ credential }` + 审计 `registry_credential_set`（detail 键集——零秘密） |
| `PATCH /api/admin/sandbox/registry-credentials/:id` | 改凭据（键级：`{ host?, username?, secret? }`——出现键 = 应用；`secret` 重设 ⇒ 密文重写）⇒ 200 `{ credential }` + 审计 `registry_credential_set`；不存在 ⇒ 404；形非法/撞主机 ⇒ 400 |
| `DELETE /api/admin/sandbox/registry-credentials/:id` | 删凭据（只删 server 侧存留——已拉镜像不受影响）⇒ 200 `{ ok: true }` + 审计 `registry_credential_revoke`；不存在 ⇒ 404 |
| `POST /api/admin/sandbox/workspaces/:id/:action` | 动作：`start` ∥ `stop` ∥ `destroy`（二次确认旗——读数携盒态/快照数）∥ `rotate-key` ∥ `restore`（快照恢复——`checkpointId` 可选，缺省最近）——**直调链**（请求内逐步入；响应 = `{ ok, action, … 动作读数 }`；幂等 = 目标态已成立 ⇒ 200 noop）；未绑定工作区 ⇒ 503 `sandbox_unavailable`（人话两因分列——因一「先放置」= 未绑 ∥ 因二「待人放」= 无候选）；机制 = `sandbox/EXECUTION.md` §3/§7 |
| `GET /api/admin/sandbox/workspaces/:id/checkpoints` | 快照列表（读面）：`{ checkpoints: [{ id, createdAt, size, note, latest }] }`——恢复动作选参用；零审计（sandbox-exec-rebuild 批） |
| `GET/POST/PATCH/DELETE /api/admin/sandbox/rules*` | 出站规则增删改（校验 = 两类形/通配单层左/显式 deny 先；保存 ⇒ `rulesRev` +1 + 审计 `sandbox_rule`） |
| `GET /api/admin/sandbox/pending` ∥ `POST /api/admin/sandbox/pending/:id/resolve` | 待批表 ∥ 裁定 `{ decision: "once" ∥ "remember" ∥ "deny" }`（remember ⇒ 规则入表 source=approval；**裁定后先下发节点闸再回填 DNS 闸持答**（once = 临时放行窗）；审计 `sandbox_event`——机制 = `sandbox/EXECUTION.md` §6） |
| `GET/PATCH /api/admin/sandbox/settings` | 设置读写（全局默认——值 = JSON 文本）：`cpus`（数） ∥ `memMb`/`pids`/`diskMb`/`idleTtlMinutes`/`wallclockTtlHours`/`checkpointEveryMinutes`/`checkpointKeep`/`pendingTimeoutSeconds`/`tmpfsMb`（正整数） ∥ **`maxBoxesPerRunner`（正整数——单节点盒数上限，缺省 8） ∥ `workspaceRoot`（字符串——节点侧工作区根路径，缺省 `/var/lib/thincoder/workspaces`；重启生效）**（sandbox-exec-rebuild 批） ∥ **`memberWorkspaceLimit`（正整数——每成员工作区上限，缺省 3；member-face-chat 批）** ∥ `image`（字符串）；PATCH 逐键（键级合并——值 = 整键替换；形/范围校验不过 ⇒ 400 库零变）⇒ `rulesRev` +1（即生效）；**「默认单」非本表键**（= `sandbox_rules` 种子行——上行）；**每键有 UI 写入口**——`webui/SANDBOX.md` §2.1 |

- 用例 = `sandbox/SANDBOX.md` §12。

### 2.7 沙盒成员面（本人——server-exec-sandbox 批；机制全文 = `sandbox/SANDBOX.md` §8 成员面）

（端点族 = `/api/me/sandbox/*`；判权 = 会话（本人——admin/user 恒本人过滤）；错误形 = §3 全码 + `sandbox_unavailable`）

| 方法 + 路径 | 语义 |
|---|---|
| `GET /api/me/sandbox/workspaces` | 本人工作区读数：`{ workspaces: [{ id, name, runnerName, boxState, stopReason?, checkpointCount, pending }] }`（`runnerName` = 所属 runner 名 ∥ `null`（未绑定——sandbox-outbound-member-face 批；端侧呈「未绑定」）；`boxState` = `running` ∥ `stopped`——`stopReason` 取值 `idle_ttl` ∥ `wallclock_ttl` ∥ `manual`；`pending` = 最近 open 待批 `{ host, since }` ∥ `null`）——恒本人过滤（`owner_member_id` = 会话成员）；`pending` 端侧渲染「等待管理员批准」提示（不得静默——`webui/SANDBOX.md` §2.2）；不可用 ⇒ 503 `sandbox_unavailable` |

- 写面零端点（成员对工作区的动作随 #1216 ② 权限模型——`sandbox/SANDBOX.md` §8 成员面）。

### 2.8 管理面 agent 会话面（控制台——仅 admin；机制全文 = `agent/ADMIN-AGENT.md` §11）

（端点族 = `/api/admin/agent/*`；判权 = `requireAdmin` 口径（`user` ⇒ 403 ∥ 无/过期会话 ⇒ 401）；错误形 = §3 全码沿用——**零新码**；写端点 JSON 型门同 §1 前言）

| 方法 + 路径 | 语义 |
|---|---|
| `POST /api/admin/agent/chats` | 建会话 `{ model }` ⇒ 200 `{ chat: { id, model, reasoning, status, createdAt, updatedAt } }`（`reasoning` = `null`——未设）；`model` 不在开放清单 ⇒ 400 `invalid_request_error`（人话——「模型不可用」；KD-SV-87 同判）；库零变 |
| `PATCH /api/admin/agent/chats/:id` | **会话设置面（一次一件——体不得双携 `model`/`reasoning`）**：`{ model }` ∥ `{ reasoning }` ⇒ 200 `{ chat: { id, model, reasoning, status, createdAt, updatedAt } }`（行形同建会话 + `reasoning`）；`{ model }` = 换模型（**明选即换、下回合生效**——在途回合零触；KD-SV-108）+ **档位清 `null`**（换模型回中性——口径②）；`{ reasoning }` = 设档（值 ∈ 该会话当刻模型枚举——核同源；会话 `model` = 对外标识 ⇒ 先解上游真名再判（别名反查 = KD-SV-59）；`null` = 清）；两键同携 ⇒ 400；不存在 ⇒ 404 ∥ 模型不在开放清单 ∥ 档位表外值/非串 ⇒ 400（库零变）——机制 = `agent/ADMIN-AGENT.md` §11.4 |
| `GET /api/admin/agent/chats` | 会话列表（倒序）：`{ chats: [{ id, model, reasoning, status, createdAt, updatedAt, excerpt }] }`（`reasoning` = 会话级思考档位——`null` = 未设；`excerpt` = 首条用户消息截断 ≤40 字；无消息 ⇒ 空串） |
| `GET /api/admin/agent/chats/:id` | 会话详情：`{ chat, messages: [{ seq, role, content, data, createdAt }] }`（`role` = `user`/`assistant`/`tool`/`notice`；`data` = 附加形——assistant 的 `toolCalls` ∥ tool 的 `toolCallId`/`name`/`ok`/`summary` ∥ notice 的 `reason`（**五值枚举**——重启收尾 `"restart"` ∥ 预算超限 `"budget"` ∥ 模型错误 `"model_error"` ∥ 空回合 `"empty_turn"` ∥ **手动中止 `"aborted"`**（chat-shell-align 批）；人话文本 = `content` 面）∥ **user 行携图 ⇒ `data` 仅 `{ imageCount }`**（dataURL 零下发——KD-SV-109；`data` 缺省 = null）；序 = `seq` 升序）；不存在 ⇒ 404 `not_found` |
| `POST /api/admin/agent/chats/:id/messages` | 发一条（一轮）：`{ content, images? }`（`images` = dataURL 列——核 `parseDataUrl` 四型/单图阈 ∥ `isNonVisionModel` 视觉门 ⇒ 400——KD-SV-109）⇒ **NDJSON 流**（`application/x-ndjson`——帧 = `delta` ∥ `call` ∥ `result` ∥ `turn` ∥ `usage` ∥ `end`；见下）；不存在 ⇒ 404 ∥ `content` 空/非字符串 ⇒ 400 ∥ 会话 `status = running` ⇒ 400（「本会话正在执行——等它结束」）∥ 模型不可用 ⇒ 400（流未起——信封形） |
| `POST /api/admin/agent/chats/:id/abort` | 请求中止在途回合（KD-SV-107）⇒ 200 `{ ok: true }`（终态经流/详情形呈）；会话非 `running` ⇒ 400 `invalid_request_error`（「本会话不在执行中」——零副作用）；不存在 ⇒ 404 |

- **会话行形（四端点同源——console-reasoning-levels 批）**：`{ id, model, reasoning, status, createdAt, updatedAt }`（详情响应 `{ chat, messages }` 的 `chat` 同形）；`reasoning` = 会话级思考档位（`null` = 未设 ∥ 字面 ∈ 该模型核枚举）；机制 = `agent/ADMIN-AGENT.md` §11.4；控制台消费 = `webui/CHAT.md` §2.1⑤。
- **流帧**（每行一帧 JSON；headers = `Content-Type: application/x-ndjson; charset=utf-8` ∥ `Cache-Control: no-store`；流中失败 = `end` 帧——headers 已发，不再走信封）：
  - `{ "type": "delta", "text": "…" }`——模型文本增量（核 `onToken`）；
  - `{ "type": "call", "id": "…", "name": "…", "args": "…" }`——工具调用开始（`args` = **字符串**（参数摘要——JSON 序列化 ⇒ 掩蔽后截断 ≤500 字；恒为字符串，非对象））；
  - `{ "type": "result", "id": "…", "ok": true, "summary": "…" }`——工具结果摘要（≤300 字——掩蔽后）；
  - `{ "type": "turn", "n": 1 }`——每次模型调用前（n = 本回合第 n 次调用——chat-shell-align 批）；
  - `{ "type": "usage", "prompt": N, "completion": N, "cacheHit": N, "cacheMiss": N }`——每次模型调用返回且核 `usage` 在场（**缺 ⇒ 零帧**）；源 = 核 `usage` 四读；
  - `{ "type": "end", "status": "succeeded" | "failed", "reason": "…"?, "durationMs": N, "calls": N }`——回合终态（`failed` 原因 = 人话：预算超限 ∥ 模型错误 ∥ 空回合 ∥ 手动中止）；`durationMs`/`calls` = **可字段**（既有消费零破——chat-shell-align 批）。
  **帧形全文 = `agent/ADMIN-AGENT.md` §11.3**（本行为其契约面）。
- **执行不依赖连接**（断连照跑到终态——落库单源；重读详情即全量）；重启恢复（`running` ⇒ `idle` + notice + 审计）在装配期执行（无端点）。
- 审计 = `agent_event` 逐调用（`accounts/ACCOUNTS.md` §2.1）；用例 = `agent/ADMIN-AGENT.md` §8；不做面 = 其 §10。

### 2.9 项目面（成员 · 管理）——team-projects-permissions 批（B2）；机制全文 = `project/PROJECTS.md`

（端点族 = `/api/projects*`（会话——能力矩阵三档）+ `/api/admin/git-sources*` ∥ `/api/admin/projects*`（`requireAdmin`——`user` ⇒ 403）+ `POST /api/hooks/git-sources/:id`（**公开**——验签门）；共 **十七行**（成员面六 ∥ 管理面十 ∥ 接收面一）；错误形 = §3 全码沿用——**零新码**；
可见性口径 = 未授权即不可见（列表零出现 ∥ 直取 404 不辨——KD-SV-120）；同步/体检/拉列表三读动作走**自含状态形**（成 ⇒ `{ ok: true, … }`；败 ⇒ `{ ok: false, error: { kind, message }, ms }`——
 `kind` 六值：`auth` ∥ `scope_missing` ∥ `unreachable` ∥ `timeout` ∥ `http_error` ∥ `bad_response`；沿代理测试/镜像源先例）；写端点 JSON 型门同 §1 前言）

- 读类超时 = 平台口径（**gitee 20s** ∥ 余平台 10s——KD-SV-151）；**gitee 范围三态**（`scope_kind`——个人/组织/企业）路由、不符报错（不自动改走他径）与成员行嵌套解析（`user.login`）= `project/PROJECTS.md` §4（单源）。

| 方法 + 路径 | 语义 |
|---|---|
| `GET /api/projects?q=` | 可见项目列表：admin ⇒ 全量 ∥ 其余 ⇒ 成员行 ∪ 负责人命中集（恒过滤——非成员零出现）；`q` = 显示名/地址子串过滤；行 = `{ id, displayName, address, source: { id, name, platform } ∥ null, owner, level, memberCount }` |
| `GET /api/projects/:id` | 详情：`{ project: {…行形}, members: [{ username, level, origin, syncedRole }], my: { level, owner, admin, can: { view, write, manageMembers, rename, editAddress, delete } } }`——非成员（非 admin/负责人）⇒ **404 `not_found`**（消息「项目不存在或不可见」——两态不辨） |
| `PATCH /api/projects/:id` | 项目改（一次一件）：`{ displayName? }`（负责人 ∥ admin）∥ `{ address? }`（**仅 admin**——归一 + 唯一；非 admin ⇒ 403「改仓地址仅管理员」；撞 ⇒ 400 库零变）∥ `{ owner? }`（**仅 admin**——须命中现存成员；非 admin ⇒ 403）；逐件审计 `project_update`（detail = 键名 + 值） |
| `POST /api/projects/:id/members` | 加成员 `{ username, level }`（负责人 ∥ 档位 manage ∥ admin——其余 403）：username 形校验（trim 非空 ∥ ≤64 ∥ 无 `/`）；同名已在 ⇒ 400；⇒ 200 `{ member: { username, level, origin, syncedRole } }` + 审计 `member_add` |
| `PATCH /api/projects/:id/members/:username` | 改档 `{ level }`（同权——负责人保护：目标 = 负责人 ∧ 非 admin ⇒ 403）；不存在 ⇒ 404 ∥ 枚举外 ⇒ 400；审计 `member_update` |
| `DELETE /api/projects/:id/members/:username` | 移除成员（同权；负责人保护同）；不存在 ⇒ 404；审计 `member_remove`（manual 行移除 = 永久 ∥ sync 行随下次同步按平台态回写——设计在册） |
| `GET /api/admin/git-sources` | 源列表：`{ sources: [{ id, name, platform, baseURL, scope, scopeKind, token: { set, hint }, hookSecret: { set, hint }, enabled, syncMode, intervalMinutes, lastSyncAt, lastSyncResult, tokenState, tokenCheckedAt, createdAt }] }`（`scopeKind` = gitee 范围三态 `personal ∥ org ∥ enterprise`；非 gitee `null`——KD-SV-151）——`token`/`hookSecret` 恒掩码（`…`+末 4——永不回显原文）；零审计（读动作） |
| `POST /api/admin/git-sources` | 增源 `{ name, platform, baseURL?, scope?, scopeKind?, token, enabled?, syncMode?, intervalMinutes? }`（名 ≤40 ∥ 平台四值 ∥ 自建须基址 ∥ 间隔 5–1440 ∥ **gitee 须携 `scopeKind`——三值；组织/企业须携 `scope`，个人不带；非 gitee 携 `scopeKind` 非空 ⇒ 400（空/`null` = 清空形——同判不携）**）⇒ 200 `{ source }` + 审计 `source_add`；撞名/形错 ⇒ 400 库零变 |
| `PATCH /api/admin/git-sources/:id` | 改源（键级：出现键 = 应用——键面含 `scopeKind`（gitee 三值——校验同 POST；不携 ⇒ 沿行值 ∥ 解析结果为空 ⇒ 400——迁移后不可达的防御句）；**跨态清空形**：`scope: ""`/`null` ⇒ 置 NULL ∥ 平台（携值 ∥ 行值）非 gitee ⇒ `scope_kind` 落 NULL——携非空 ⇒ 400（「范围类型仅 gitee 适用」） ∥ 不携/携空 ⇒ NULL（旧值随清——「非 gitee 恒 NULL」）；`token` 明填 = 替换 ∥ 缺省 = 不动——掩码三态沿 provider apiKey 口径）；不存在 ⇒ 404；审计 `source_update`（detail = 键名——值零入；`token`/`hookSecret` 键只记「已替换」） |
| `DELETE /api/admin/git-sources/:id` | 删源：**还挂项目 ⇒ 400**（消息「尚有 N 个项目挂此源」——删源防护；库零变）∥ 零挂 ⇒ 200 `{ ok: true }` + 审计 `source_delete`；不存在 ⇒ 404 |
| `POST /api/admin/git-sources/:id/sync` | 立即同步（成员同步即触发——**手动钮永在**）：进行中 ⇒ 400（「该源正在同步中」）∥ 否则自含形（成 ⇒ `{ ok: true, ms, counts: { projects, roster, added, updated, removed }, truncated? }`；败 ⇒ 分类；`auth` ⇒ `token_state='invalid'`）+ `last_sync_*` 随写 + 审计 `source_sync`（trigger=manual） |
| `POST /api/admin/git-sources/:id/check` | PAT 体检：自含形（成 ⇒ `{ ok: true, ms }` + `token_state='ok'`；败 ⇒ 分类 + `auth` ⇒ `invalid`）+ `token_checked_at` + 审计 `source_check`；不存在 ⇒ 404 |
| `GET /api/admin/git-sources/:id/repos` | 拉列表（读类 = **gitee 20s** ∥ 余平台 10s——自含形）：成 ⇒ `{ ok: true, repos: [{ fullName, address, private, known }], truncated, ms }`（≤300 行——`truncated` 如实；`known` = **跨形归一命中在册项目** ⇒ 界面「已添加」标 + 禁提交）；**gitee 范围三态路由**（KD-SV-151——个人 ⇒ 仅 `/user/repos` ∥ 组织 ⇒ + `/orgs/{scope}/repos` ∥ 企业 ⇒ + `/enterprises/{scope}/repos`）；范围径 404 ⇒ `http_error` + 人话（核对范围类型/编辑源改选）——**不自动改走他径**；败 ⇒ 分类；零审计 |
| `POST /api/admin/git-sources/:id/hook-secret` | 生成/轮换 webhook 密钥（事件进路）：⇒ 200 `{ hookSecret: { plain } }`（**一次性明文**——此后读面恒掩码；轮换 ⇒ 旧密钥即刻失效）；审计 `source_update`（keys 含 `hookSecret`——值零入）；不存在 ⇒ 404 |
| `POST /api/admin/projects` | 加仓（两形一件）：`{ sourceId, repos: [{ address, displayName? }] }`（批量——勾选提交）∥ `{ address, displayName?, owner? }`（手输保底——源缺省 NULL）；校验逐条（地址形/归一/唯一 ∥ 负责人须现存成员）；**全成或全拒**（撞 ⇒ 400 列重复项、零落库）；每项目一行审计 `project_add`（detail = sourceId） |
| `DELETE /api/admin/projects/:id` | 项目删除（仅 admin——`can.delete`）：载荷 `{ confirm: true }`（缺/非真 ⇒ 400 人话）；`project_members` 同事务随删（零孤儿）+ 审计 `project_event`/`project_delete`（detail = projectId/displayName/address/memberCount）；不存在 ⇒ 404——机制 = `project/PROJECTS.md` §14 |
| `POST /api/hooks/git-sources/:id` | **事件接收端（公开）**：门 = `X-Hub-Signature-256` HMAC-SHA256（raw body ∥ 该源密钥——`timingSafeEqual`）；`X-GitHub-Event: member` ⇒ 200 `{ ok: true, triggered: true }` + 异步触发该源一次同步（`trigger='event'` ∥ actor=`webhook`；载荷不解析）；忽略面（非 member ∥ 源停用 ∥ `poll` 模式）⇒ 200 `{ ok: true, ignored: true }`；验签败 ⇒ 401 + `log.warn`（不入审计）；未知源 ⇒ 404——机制 = `project/PROJECTS.md` §13 |

- **详情 `my` 形**（`GET /api/projects/:id`）= 判定函数逐值（`project/PROJECTS.md` §3）：`{ level, owner, admin, can }`；`can` 六键（含 `delete`——「删除项目」钮渲法源）；`admin` 布尔随 `my` 下发（「更换负责人」控件渲法源）；控制台渲法源口径 = `webui/PROJECTS.md` §2.1。
- 调度器（定时成员同步——装配期接线）：判据与算法 = `project/PROJECTS.md` §5（**两模式同跑**——`event` 源照跑 = 对账兜底）；审计 actor = `scheduler` ∥ 事件触发 = `webhook`（后两者无 actorId）。
- 用例 = `project/PROJECTS.md` §10（N1–N29 ∥ B1–B4 ∥ E1–E5）；控制台消费 = `webui/PROJECTS.md` §2。

### 2.10 团队台账面（控制台 · 端侧）——team-ledger 批；机制全文 = `ledger/LEDGER.md`

（端点族 = `/api/ledger*`（控制台——会话 + 项目能力矩阵）+ `/api/client/ledger*`（端侧——登录 token Bearer）；共 **八行**（控制台四 ∥ 端侧四——同一域模块的薄适配两面）；
错误形 = §3 全码沿用——**零新码**；写端点 JSON 型门同 §1 前言；未授权即不可见（列表零出现 ∥ 直取 404 不辨——沿 §2.9 口径）；仓 = 归一地址（`projects.address` 同形——未登记仓 ⇒ 写 400 人话）
∥ 追认核销（自 `待讨论`/`待设计` ⇒ `已核销`）须 `detail` 非空（否则 400）。）

| 方法 + 路径 | 鉴权 | 语义 |
|---|---|---|
| `GET /api/ledger?repo=&status=&owner=` | 会话（`can.view`） | 列表：`{ items: [行…], repos: [{ address, displayName, canWrite }], total }`——行 = `{ id, repo, status, title, detail, owner, createdBy, createdAt, updatedAt, closedAt, aged, canWrite }`（零 `repoName`——显示名 = 控制台 `repos[]` 回填；端侧展示 = 归地址）；三筛（仓/状态/负责人——`repo` 归一后精确匹配 ∥ `status` 枚举外 ⇒ 400 ∥ `owner` 用户名精确匹配）；可见性 = 能力矩阵过滤（非成员零出现）；`repos[]` = 可见项目 + 写权读数（筛选/新建选单/行写权的渲法源单源） |
| `POST /api/ledger` | 会话（`can.write`） | 新建 `{ repo, title, detail?, owner? }`（`status` 恒 `待讨论`）⇒ 200 `{ item }`；**建面三态**（2026-10-13 裁定）= 仓不存 ⇒ 400 人话（加仓 = admin 专属）∥ 仓存而无 `can.view` ⇒ 404 不辨（措辞 = 「项目不存在或不可见」——同项目面口径）∥ 可见而无 `can.write` ⇒ 403；`owner` 缺省 = 会话主体；审计 `ledger_event`/`create`（`surface:"console"`） |
| `PATCH /api/ledger/:id` | 会话（`can.write`） | 编辑 `{ title?, detail?, owner?, status? }`（`status` 值域 = 迁移表合法后继——非法 ⇒ 400 人话 ∥ 仓不可改——KD-SV-140）；不可见 ⇒ 404 不辨；审计 `edit` |
| `POST /api/ledger/:id/close` | 会话（`can.write`） | 收口/撤回 `{ status }`（∈ `已核销` ∥ `已废弃`）；已归档 ⇒ 400；审计 `close`/`withdraw` |
| `GET /api/client/ledger?repo=&status=&owner=` | 登录 token（`can.view`） | 同上同形（**无 `repos[]`**——端侧仓标记自动派生）；`repo` 收**原文**（服务端归一——KD-SV-144） |
| `POST /api/client/ledger` | 登录 token（`can.write`） | 同上（`repo` = 端侧 origin 原文）；审计同型（`surface:"client"`） |
| `PATCH /api/client/ledger/:id` | 登录 token（`can.write`） | 同上 |
| `POST /api/client/ledger/:id/close` | 登录 token（`can.write`） | 同上 |

- 视图默认当前仓 = **端侧默认**（工具 `scope` 缺省——`docs/core/design/TEAM-LEDGER.md` §2.1）；控制台 = 全队 + 按仓筛（`repo` 缺省不过滤）。
- 判权 = `project/PROJECTS.md` §3 能力矩阵（读 `view` ∥ 写 `write`）；**未登记仓 ⇒ 写 400**（加仓 = admin 专属——AC-44①）。
- 用例 = `ledger/LEDGER.md` §11（N1–N5 ∥ B1–B9 ∥ E1–E4）+ `docs/core/design/TEAM-LEDGER.md` §7；控制台消费 = `webui/LEDGER.md` §2。

### 2.11 成员面对话面（成员 · 移动端）——member-face-chat 批；机制全文 = `agent/MEMBER-AGENT.md`

（端点族 = `/api/me/chat/*`（会话——**双鉴权**：控制台 cookie ∥ 登录 token `Authorization: Bearer`——双门同判权）∥ 成员面工作区写面扩（`/api/me/sandbox/*`——建/启停/销毁/拉仓）∥ 成员 git 凭据（`/api/me/git-credentials*`——KD-SV-204）；
错误形 = §3 全码沿用 + **两新码**（409 `workspace_offline` ∥ 400 `workspace_limit_reached`）；写端点 JSON 型门同 §1 前言；判权 = **恒本人**（他人资源 ⇒ 列表零出现 ∥ 直取 404 不辨——沿族口径）；
在途门 = **工作区级**（同工作区任一会话在跑 ⇒ 发消息 400 人话——`agent/MEMBER-AGENT.md` §3.4）；会话详情行携 `agentOnline`（盒连接存续读数——非落库）。
**会话真源在盒内**（题一裁定）：会话 id = **复合形 `<workspaceId>:<槽号>`**；列表/读史/新建/改 = **盒指令转发**（`cmd`——盒离线 ⇒ 409 `workspace_offline`；读也须盒在跑）。

| 方法 + 路径 | 鉴权 | 语义 |
|---|---|---|
| `GET /api/me/chat/sessions` | 本人（cookie ∥ Bearer） | 列表（**按本人工作区扇出**——逐在线盒 `cmd sessions.list` 合并（离线盒的会话不列）；倒序）：`{ sessions: [{ id, workspaceId, workspaceName, model, reasoning, status, excerpt, agentOnline, updatedAt }] }` |
| `POST /api/me/chat/sessions` | 本人 | 建 `{ workspaceId, model? }` ⇒ `session.create` 指令（**盒离线 ⇒ 409**；工作区 ∈ 本人 ⇒ 否则 404 不辨；模型缺省 = 开放清单首个——清单空 ⇒ 400 人话）⇒ 200 `{ session }`（行形 = 列表行同源） |
| `GET /api/me/chat/sessions/:id` | 本人 | 详情 = 向盒 `session.read`（**盒离线 ⇒ 409**）⇒ `{ session, messages: [行…] }`（`session` 行形 = 列表行同源；消息行形 = §2.8 同形——role 四值、`data` 按 role 同 §2.8）；404 `not_found` |
| `GET /api/me/chat/models` | 本人 | 开放模型清单：`{ models: [{ id, reasoning: [档…] }] }`（源 = 开放清单 + `modelReasoning` 桥同源——零 provider 内部细节） |
| `POST /api/me/chat/sessions/:id/messages` | 本人 | 体 `{ content }` ⇒ **NDJSON 流**（帧词表 = §2.8 同源）；流前门：盒离线 ⇒ 409 `workspace_offline`（人话含启动指引）∥ 在途门 ⇒ 400 人话 ∥ content 空 ⇒ 400；404 |
| `POST /api/me/chat/sessions/:id/abort` | 本人 | 中止 ⇒ 200 `{ ok: true }`；非在途 ⇒ 400 零副作用；404 |
| `PATCH /api/me/chat/sessions/:id` | 本人 | 会话设置面（一次一件）⇒ `session.update` 指令（**盒离线 ⇒ 409**）：`{ model }`（∈ 开放清单——否则 400；换模型 ⇒ 档位清 `null`）∥ `{ reasoning }`（值 ∈ 该模型核枚举——表外 400；`null` = 清）；双携 ⇒ 400；下回合生效；⇒ 200 `{ session }`（行形 = 列表行同源） |
| `GET /api/me/git-credentials` | 本人 | 清单：`{ credentials: [{ host, username, updatedAt }] }`（**零秘密**——密文永不回显） |
| `PUT /api/me/git-credentials` | 本人 | 绑定/更新 `{ host, username, secret }`（host 归一（小写）；加密存储——`credential-crypto.mjs`；成事 ⇒ 审计 `member_event`/`credential_set`）⇒ 200 `{ credential }`（零秘密）；形非法 ⇒ 400 |
| `DELETE /api/me/git-credentials/:host` | 本人 | 撤销（无该行 ⇒ 404）⇒ 200 `{ ok: true }`；成事 ⇒ 审计 `member_event`/`credential_revoke` |
| `POST /api/me/sandbox/workspaces` | 本人 | 建工作区 `{ name? }`（缺省名「工作区 N」）——**上限校验**（归属成员现存行数 ≥ `memberWorkspaceLimit` ⇒ 400 `workspace_limit_reached`，message 含上限数）⇒ 200 `{ workspace }`（绑定节点 ∥ 签发每工作区 key ∥ 建盒——沿 §2.5 建面） |
| `POST /api/me/sandbox/workspaces/:id/:action` | 本人 | `start` ∥ `stop` ∥ `destroy`（`confirm` 缺 ⇒ 400——沿 §2.5）；404 |
| `POST /api/me/sandbox/workspaces/:id/pulls` | 本人 | 拉仓 `{ projectId, dir? }`（项目 ∈ 本人可见 ⇒ 否则 404 不辨；盒离线 ⇒ 409）⇒ 200 `{ pullId }`（**目标目录冲突 = 盒侧检出**——`git clone` 失败分类 ⇒ 结果面 `failed`；非请求期 400） |
| `GET /api/me/sandbox/workspaces/:id/pulls/:pullId` | 本人 | 拉取状态：`{ state: queued ∥ running ∥ done ∥ failed, detail }`（进程内存读数；服务端重启 ⇒ `failed` 携「结果未知——重试」句） |

- **会话行形（建/列表/详情/PATCH 四处同源——含 `reasoning`；与 §2.8 对齐）**：`{ id, workspaceId, workspaceName, model, reasoning, status, excerpt, agentOnline, updatedAt }`——`reasoning` = 会话级思考档位（`null` = 未设 ∥ 字面 ∈ 该模型核枚举——KD-SV-111 同口径；切会话推送回读之读源）；`agentOnline` = 盒连接存续读数（非落库——§2.12 在线判据）。

- 审计：`member_event`（`chat_start` ∥ `chat_call` ∥ `chat_stop` ∥ `pull` ∥ `credential_set` ∥ `credential_revoke`——**六 kind**）；工作区动作 = `sandbox_event` 行（kind 沿既有枚举，detail 携 `by:"member"`）。
- 机制全文 = `agent/MEMBER-AGENT.md` §3（会话源 §3.2 ∥ 回合模型 §3.4 ∥ 权限与上限 §3.7 ∥ 凭据 §3.6）；用例 = 该档 §7（**成员面** N71–N78 ∥ B69–B72 ∥ E54–E57）。

### 2.12 盒接入面（盒出向）——member-face-chat 批；机制全文 = `agent/MEMBER-AGENT.md` §3.3

（端点族 = `/api/box/*`；鉴权 = **每工作区 key**（`Authorization: Bearer`——与 `/v1` 同校验单源 `verifyKey`；键 → `sandbox_workspaces.key_id` 行 → 工作区 + 负责人；吊销 ⇒ 401 即断）；**连接发起方恒为盒**（server 零拨盒路径——AC-50③ 判据）；
流形 = 下行 SSE（`text/event-stream`——chunked）+ 上行 NDJSON（流式请求体）；**`turns` 体读 = 流式（逐行 NDJSON 边收边消费——路由级例外；`server.mjs` 随正 ⇒ §4）**；错误形 = §3 全码沿用——**零新码**。）

| 方法 + 路径 | 语义 |
|---|---|
| `GET /api/box/events` | SSE 下行：`hello`（含未收尾命令重派清单） ∥ `run` ∥ `abort` ∥ `pull` ∥ **`cmd`**（读/管理指令——`sessions.list` ∥ `session.read` ∥ `session.create` ∥ `session.update`） ∥ `ping`（缺省 20s——设计值）；单工作区单连接（新连接顶旧连接）；**在线判据 = 连接在 ∧ 最近一次 `ping` 应答 ≤3 周期（60s）** |
| `POST /api/box/credential` | git 凭据取件：体 `{ host }` ⇒ `{ username, password }`（盒内助手按次调用——用毕即清；**密值零回显零日志**） |
| `POST /api/box/sessions/:id/turns` | 回合流（流式 NDJSON 体）：`begin { cmdId }` ⇒ 六帧词表（§2.8 同源——两处加宽 `call.args`/`result.content`；**纯转发零落库**）⇒ `end`；会话 ∉ 本工作区 ⇒ 404 |
| `POST /api/box/commands/:cmdId/result` | 命令结果 `{ state, detail }`（拉仓成/败；读/管理指令回呈——`detail` 形按 kind：列表/读史 = 行集 ∥ 新建 = `{ id }`）；未知/已了结 cmdId ⇒ 400 零副作用 |
| `POST /api/box/ping` | 保活应答（收 `ping` 即回）：体 `{ t }` ⇒ 204（值回显窗）——**在线判据取数面**；与余端点同判权（每工作区 key） |

- 帧词表单源 = `agent/ADMIN-AGENT.md` §11/§11.3（本面增补 = `begin` 帧 + `end.status/reason` 新值 `box_lost`（server 合成）+ 盒自产扩展四值 `save_failed` ∥ `busy` ∥ `not_found` ∥ `internal`——语义 = `agent/MEMBER-AGENT.md` §3.4）；机制全文 = `agent/MEMBER-AGENT.md` §3.3/§3.4。

### 2.13 MCP 管理面（server-mcp 批——2026-10-13；机制全文 = `mcp/MCP.md`）

（端点族 = `/api/admin/mcp*`；判权 = `requireAdmin` 口径（`user` ⇒ 403 ∥ 无/过期会话 ⇒ 401）；错误形 = §3 全码沿用——**零新码**；写端点 JSON 型门同 §1 前言；探活例外——**自含状态**（沿 `proxy/test` 先例））

| 方法 + 路径 | 语义 |
|---|---|
| `GET /api/admin/mcp` | 清单（库序）：`{ servers: [{ id, name, transport, target, enabled, hasSecrets, createdAt, updatedAt }] }`（`target` = 非秘密寻址形——`command` ∥ `url`/`wsUrl`；凭据零下发） |
| `POST /api/admin/mcp` | 新增：`{ name, transport, command?, args?, url?, wsUrl?, headers?, token?, env?, enabled? }`（`enabled` 缺省 = 启用）⇒ 200 `{ id }`；形非法（名空/重名/传输三择/必填缺/类型错）⇒ 400 `invalid_request_error`（库零变）＋ 审计 `mcp_event`（`server_add`） |
| `PATCH /api/admin/mcp/:id` | 改（**字段缺席 = 不动**；敏感字段缺席 = 不变 ∥ `null` = 清）；`{ enabled }` 切换走本端点 ⇒ 200 `{ ok: true }`；形非法 ⇒ 400（库零变）；不存在 ⇒ 404 `not_found`；成事 ⇒ 审计 `server_update`（`keys` = 变更键名——值永不入） |
| `DELETE /api/admin/mcp/:id` | 删（硬删）＋ 关闭该服务器会话（核 `removeMcpTools`）⇒ 200 `{ ok: true }`；不存在 ⇒ 404；成事 ⇒ 审计 `server_remove` |
| `POST /api/admin/mcp/probe` | 探活（零副作用——不进会话 ∥ 不动库 ∥ 不落审计）：体 = `{ id?, name?, transport?, command?, args?, url?, wsUrl?, headers?, token?, env? }`——`id` 在场 ⇒ 缺席字段（含非秘密）一律回落库内行；`transport` 仅无 `id` 草稿态必填；全量草稿亦可 ⇒ 200 `{ ok, toolCount?, latencyMs?, error? }`（`ok:false` 仍 200——自含状态） |

- 清单存储/凭据形/探活机制 = `mcp/MCP.md` §3（本表为其契约面）；控制台消费 = `webui/MCP.md` §2；用例 = `mcp/MCP.md` §8（N2/N3/E1）。

## 3. 错误形（全码单源）

- 统一形：`{ "error": { "message": "…", "type": "…", "code": "…" } }`。
- 本服务自产：401 `invalid_api_key`（无 key ∥ 未知 ∥ 吊销——不区分，防信息泄露）· 404 `model_not_found`（未配置模型 ∥ 该成员已禁用——消息区分）· 429 `quota_exceeded`（模型超额——message 含模型外标 + 已用/额度值；机制 = `metering/METERING.md` §2）· 429 `rate_limited`（per-model 限流——message 含模型/限值；`Retry-After` 秒头——沿 `too_many_attempts` 先例；机制 = §6 KD-SV-35）·
  400 `invalid_request_error`（body 非 JSON ∥ 缺 model）· 413 `payload_too_large`（请求体超上限——上限常量 32 MiB）· 502 `upstream_error`（上游不可达）。
- 500 `internal_error`（兜底——处理函数自身异常）。
- 账号面（`/api/*`——同形）：401 `unauthorized`（无 ∥ 过期会话）· 401 `invalid_credentials`（登录失败 ∥ 旧密错误——同措辞同耗时）· 403 `forbidden`（角色不足）· 404 `not_found`（成员 ∥ key 不存在）· 429 `too_many_attempts`（登录锁定期——`Retry-After` 头（秒）；两维同文案——`accounts/ACCOUNTS.md` §2）。
- 客户端面（`/api/client/*`——同形）：401 `invalid_api_key`（无/无效 token——三态不区分）· 401 `invalid_credentials` ∥ 429 `too_many_attempts`（登录——沿账号面同码）；**零新码**（全码单源不变——机制 = `client/CLIENT.md` §1/§2）。
- 沙盒面（`/api/admin/sandbox/*` ∥ `/api/me/sandbox/*`——同形前置）：503 `sandbox_unavailable`（无可用节点——**一码新增**）；余码沿用族口径（`user` ⇒ 403）。
- 项目面（`/api/projects*` ∥ `/api/admin/git-sources*` ∥ `/api/admin/projects*` ∥ `/api/hooks/*`——同形前置）：**零新码**（400/403/404/401 沿用；「不可见」直取 = 404 不辨——KD-SV-120）；同步/体检/拉列表三读动作 = **自含状态形**（不成统一信封——沿代理测试/镜像源先例）；接收面 = 验签败 401（零细节）+ `log.warn`（不入审计）∥ 忽略/受理 200 两形。
- 团队台账面（`/api/ledger*` ∥ `/api/client/ledger*`——同形前置）：**零新码**（400/403/404 沿用；「不可见」直取 = 404 不辨 ∥ 未登记仓写 ⇒ 400 人话）；**写面三态 = 仓不存 ⇒ 400 人话 ∥ 仓存而无 `can.view` ⇒ 404 不辨（措辞 = 「项目不存在或不可见」）∥ 可见而无 `can.write` ⇒ 403**（详 = §2.10——2026-10-13 裁定）；两面同码同措辞（同一域模块）。
- 成员面对话面 ∥ 盒接入面（`/api/me/chat/*` ∥ `/api/me/sandbox/*` 写面扩 ∥ `/api/box/*`——同形前置）：**两新码**——409 `workspace_offline`（盒未运行/未连接——人话含启动指引）∥ 400 `workspace_limit_reached`（工作区数达上限——message 含上限数）；余码沿用族口径（404 不辨 ∥ 400 人话 ∥ 401）。
- **上游已到达的错误**（4xx/5xx）：状态码与 body **原样透传**（不包不改）；仍记 error 行（token 未知记 NULL）。
- **消息语言口径**：服务端消息 = 中文单语（机器面零改——CLI/curl 消费方口径不变）；控制台按 `code` 前端映射本地化（中文 ∥ English——机制 = `webui/I18N.md` §2.1）；上游透传错误照原样（控制台原文回显）。

## 4. 本域文件与行数预算（本域族行）

| 档 | 行数（实读——设计估） | 职责 |
|---|---|---|
| `thincoder-server/src/gateway/server.mjs`（已落盘） | **192 ⇒ ≈197**（实读 2026-10-06——设计估 ≈140；服务模型配置面批 +≈5 = `failRequest` 置 `Retry-After` 头）**⇒ 实读 192（2026-10-07——清账批复读）⇒ ≈197**（member-face-chat 批：路由级流式体读例外 +≈5——盒上行回合流）**⇒ 实读 243（2026-10-13 现读——在途批落地后；链上 ≈197 为陈估）⇒ 本批（sandbox-container-terminal）+≈12**（`upgrade` 挂点——`server.on("upgrade", …)`：未匹配 ⇒ 404 后断开）**⇒ ≈255** | http 服务 ∥ 注册行分派 ∥ body 读限（32 MiB） ∥ 请求日志 ∥ **升级路挂点（本批）** |
| `thincoder-server/src/gateway/ws.mjs`（拟新增——本批（sandbox-container-terminal）） | ≈**260**（设计估——最小 WebSocket 服务端：握手（`Sec-WebSocket-Accept`） ∥ 帧编解码（掩码/两档长度/分片/控制帧） ∥ ping/pong ∥ close ∥ 上界（1 MiB/帧 ∥ 4 MiB 缓冲）；机制 = `sandbox/SANDBOX.md` §3；零依赖） | 升级面传输件（可复用——非沙盒专用） |
| `thincoder-server/src/gateway/routes.mjs`（已落盘） | **86 ⇒ ≈100**（实读 2026-10-06——设计估 ≈240；#962 +5 = 读运行时（`runtime.get()`）；服务模型配置面批 +≈14 = 限流准入接线（check + 用量回收口串联））**⇒ 实读 101 ⇒ ≈115**（配额分模型批：配额准入位移（体读前 ⇒ 派发后/转发前） ∥ 两字段传账 ∥ 嵌入面检查移除）**⇒ 实读 104 ⇒ ≈112 ⇒ 实读 111（2026-10-07）**（配额 v2 批落地：禁用准入条 ∥ `/v1/models` 过滤）**⇒ ≈117**（2026-10-09 embed 解耦批：缺配 404 支 ∥ 注释 +≈6——实读待回填） | chat ∥ models ∥ embeddings 三处理 |
| `thincoder-server/src/gateway/forward.mjs`（已落盘） | **185 ⇒ ≈191**（实读 2026-10-06——设计估 ≈190；服务模型配置面批 +≈6 = `onUsage` 回调（用量到达即计入限流窗））**⇒ 实读 196 ⇒ ≈204**（本批：`provider`/`model` 两字段入账 +≈8）**⇒ 实读 201（2026-10-07——清账批复读）⇒ 实读 208**（2026-10-09 代理批：`proxyUri` 参 ∥ 出口换 `proxyFetch`——实读） | 上游 fetch ∥ 流式/非流式透传 ∥ tap 接线 ∥ 断连中止 ∥ 记账号 |
| `thincoder-server/src/gateway/proxy.mjs`（已落盘） | **实读 267**（2026-10-09——本批新增；自持 std 传输；零第三方） | 上游代理传输：`proxyFetch`（fetch-like——无 uri ⇒ 原生 fetch 直连 ∥ https ⇒ CONNECT 隧道 ∥ http ⇒ 经典转发；loopback 旁路；超时族；响应适配）；KD-SV-55 |
| `thincoder-server/src/gateway/sse-tap.mjs`（已落盘） | **90**（实读 2026-10-06——设计估 ≈80） | `data:` 行增量扫描 ∥ usage 提取 ∥ 有界缓冲 |
| `thincoder-server/src/gateway/providers.mjs`（已落盘） | **146 ⇒ ≈165**（实读 2026-10-06——设计估 ≈70；#962 +91 = 行→条目 ∥ 注册表构建（`env:` 解析） ∥ 运行时箱 ∥ 装配引导；服务模型配置面批 +≈19 = `settings` 解码 ∥ 注册表携设置 ∥ `settingsFor`）**⇒ 实读 167 ⇒ ≈175**（模型元数据批：`rowToEntry` 解码 `model_meta_json`）**⇒ 实读 177（2026-10-07——清账批复读）⇒ 实读 184**（2026-10-09 代理批：`proxy` 解码 ∥ 注册表 `proxyUri` 注入 ∥ 种子列——实读）**⇒ 实读 183**（2026-10-09 embed 解耦批：`modelList` 引擎行删——实读）**⇒ ≈208**（2026-10-09 alias 批：条目归一助手 ∥ 别名索引（正/反查）∥ 注册表 ref/派发/清单 +≈25——实读待回填） | provider 注册 ∥ 模型派发 ∥ 派发失败形 ∥ 运行时（§2.2） |
| `thincoder-server/src/gateway/provider-admin.mjs`（已落盘） | **197 ⇒ ≈225**（实读 2026-10-06——#962 设计估 ≈220；行 CRUD ∥ 掩码回显 ∥ 模型发现 ∥ 管理端点注册——§2.2；服务模型配置面批 +≈28 = GET 行 `settings` ∥ PATCH 键级合并 + 校验接线）**⇒ 实读 220 ⇒ ≈258 ⇒ 实读 284（2026-10-07）**（模型元数据批：`extractModelMeta` ∥ `filterModelMeta` ∥ discover 出图 ∥ GET 行 ∥ POST/PATCH 收 meta——§2.2）**⇒ 实读 305**（2026-10-09 代理批：discover `proxy` ∥ GET/POST/PATCH 面 ∥ 出口换——实读）**⇒ ≈322**（2026-10-09 alias 批：别名唯一性集（保存径） ∥ `filterModelMeta` 名字面 ∥ 保存线 +≈17——实读待回填）⇒ 实读 **349**（2026-10-12 本设计轮复读）⇒ ≈**362**（console-reasoning-levels 批：GET 行 `modelReasoning`（桥件注入 ∥ 缺核退化）+≈13） | provider 管理面（控制台——仅 admin） |
| `thincoder-server/src/gateway/reasoning-levels.mjs`（已落——console-reasoning-levels 批） | ≈**45**（设计估——档位值域桥：懒载 `@thincoder/core/model-specs.mjs` + 缓存 ∥ `levelsOf(model)`（枚举 ∥ `[]`）∥ `modelReasoningMap(models)`（稀疏——空档零键）∥ 缺包 ⇒ 抛（调用侧退化 + 一条警告——模块级旗））⇒ 实读 **88**（2026-10-12 本批落地后） | 档位值域单源桥（核 `model-specs.mjs`——服务端零第二清单；消费 = `provider-admin` GET ∥ `chat-routes` PATCH 校验 ∥ `chat.mjs` 装配过滤） |
| `thincoder-server/src/gateway/ratelimit.mjs`（已落盘） | **≈90**（设计估）**⇒ 实读 64（2026-10-07——清账批复读）**（进程内 60s 定窗计数（`check` ∥ `record`） ∥ `Retry-After` 计算 ∥ 纯函数可直测；§6 KD-SV-35） | 模型限流（per-model RPM/TPM） |
| `thincoder-server/src/gateway/system.mjs`（已落盘） | **无 ⇒ 55 ⇒ ≈60**（实读 2026-10-06——设计估 ≈70；探活 handler ∥ `/api/system`（版本/更新状态；二轮 +≈5 = `embedding` 字段） ∥ 注册——§2.3）**⇒ 实读 57（2026-10-07——清账批复读）** | 系统面（healthz ∥ system） |
| `thincoder-server/src/gateway/embedding-admin.mjs`（已落盘） | **≈110**（设计估）**⇒ 实读 96（2026-10-07——清账批复读）⇒ 实读 110（2026-10-09——配置控制台批落地后：草稿三项明传优先）**（引擎配置读（真值 ∥ 零密钥） ∥ 探活/试跑单端点（代发 ∥ kind 四归类 ∥ 超时） ∥ 注册——§2.4）**⇒ ≈118**（2026-10-09 embed 解耦批：GET 缺段 null 容形 ∥ 探活缺配 400 +≈8——实读待回填） | 向量服务面（控制台——仅 admin） |
| `thincoder-server/src/gateway/config-admin.mjs`（已落盘） | **无 ⇒ ≈160**（设计估——配置面：GET 文件面读（有效值 ∥ 密钥掩码） ∥ PATCH 白名单合并/校验门/原子写/审计 ∥ 助手导出（合并 ∥ 原子写——单元测试档直测）；§2.4）**⇒ 实读 182**（2026-10-09 配置控制台批落地后——实读） | 配置面（控制台——仅 admin） |
| `thincoder-server/src/gateway/proxy-admin.mjs`（已落盘——2026-10-09 代理页批） | **无 ⇒ 实读 81**（2026-10-09 代理页批落地后——设计估 ≈95；代理测试（§2.4）：判权 ∥ 入参轻校验（`validateProxyConfig` 单源复用） ∥ 代打（`proxyFetch` 注入） ∥ kind 二分类 ∥ 自含形；零落库不计量） | 代理连通测试（控制台——仅 admin） |
| `thincoder-server/src/gateway/overview.mjs`（已落盘） | **≈70 ⇒ 实读 28 ⇒ ≈30**（本批：今日合计读源 = `report.mjs`（`usageTotals` 迁址）——口径零变）**⇒ 实读 27（2026-10-07——清账批复读）** | 管理总览读数（控制台——仅 admin） |
| `thincoder-server/src/gateway/errors.mjs`（已落盘） | **56 ⇒ ≈65**（实读 2026-10-06——设计估 ≈50；#963 +1 = `too_many_attempts` 码；服务模型配置面批 +≈9 = `rate_limited` 码 ∥ `HttpError`/`sendError` 可选 headers（`Retry-After`））**⇒ 实读 63（2026-10-07——清账批复读）⇒ 实读 64（2026-10-10——本设计轮现读；旧读收正 1）⇒ ≈66（server-exec-sandbox 批：`sandbox_unavailable` +≈2——实施后回填）⇒ **±0（runner-admin-console 批——零新码；节点/容器面映射沿族）⇒ sandbox-volumes 批 ±0**（零新码——卷族沿族映射）⇒ **≈70**（member-face-chat 批：两新码 `workspace_offline`/`workspace_limit_reached` +≈4） | 错误形构造 ∥ 发送助手（含账号面码） |
| **小计** | **≈770 ⇒ 658 ⇒ 951**（#962 实读：+293）**⇒ 1007**（#963 实读：+56 = system 新 55 ∥ errors +1——口径 = #962 后）**⇒ ≈1192**（二轮 +≈185 = embedding-admin 新 ≈110 ∥ overview 新 ≈70 ∥ system +≈5）**⇒ ≈1363**（服务模型配置面批估）**⇒ ≈1385**（配额分模型批：routes +≈14 ∥ forward +≈8；overview 实读回填）**⇒ ≈1393**（配额 v2 批：routes +≈8）**⇒ ≈1439**（模型元数据批：providers +≈8 ∥ provider-admin +≈38；以 v2 落定实读为基）**⇒ 实读 1362（2026-10-07——清账批逐档复读和）⇒ ≈1605（2026-10-09 代理批：proxy 新档 ∥ forward ∥ providers ∥ provider-admin 四档）⇒ 实读 1664**（2026-10-09——本批四档实读和：proxy 267 ∥ forward 208 ∥ providers 184 ∥ provider-admin 305）⇒ ≈1836（配置控制台批：+≈172 = `config-admin.mjs` 新 ≈160 ∥ `embedding-admin.mjs` ≈+12；余档零动）⇒ 实读增量 **+196**（2026-10-09 配置控制台批落地后：`config-admin.mjs` **182** 新 ∥ `embedding-admin.mjs` **110**）⇒ ≈1847（2026-10-09 embed 解耦批：+≈11 = routes +≈6 ∥ embedding-admin +≈8 ∥ providers −≈3）**⇒ 实读净收正 ≈1845**（embed 批三档实读：routes **114** ∥ providers **183** ∥ `embedding-admin` **117**）**⇒ ≈1889**（2026-10-09 alias 批：+≈44 = providers ≈208 ∥ provider-admin ≈322 ∥ forward ≈210——实读待回填）⇒ ≈1984（2026-10-09 代理页批：+≈95 = `proxy-admin.mjs` 新 ≈95；余档零动——在途批链值以实施实读为准）⇒ 实读增量 **+81**（2026-10-09 代理页批落地后：`proxy-admin.mjs` **81** 新——设计估 ≈95；余档零动）⇒ 沙盒批 +≈2（`errors.mjs`；sandbox 域档组预算 = `sandbox/SANDBOX.md` §13——本表不列）⇒ ±0（admin-agent-chat 批：会话面四端点 = agent 域档组——`agent/ADMIN-AGENT.md` §6；本表不列）⇒ ±0（sandbox-volumes 批：卷族两端点 = sandbox 域档组——`sandbox/SANDBOX.md` §13；本表不列）⇒ ±0（chat-shell-align 批：`PATCH …/:id` ∥ `POST …/:id/abort` 两端点 = agent 域档组——`agent/ADMIN-AGENT.md` §6；本表不列）⇒ **+58**（console-reasoning-levels 批：本域新档一（`reasoning-levels.mjs` ≈45）∥ `provider-admin.mjs` +≈13——本表已列）⇒ **+≈9**（member-face-chat 批：`errors.mjs` 两新码 +≈4 ∥ `server.mjs` 流式体读 +≈5；成员面/盒面端点 = agent 域档组——不重计）⇒ **+≈277**（本批（sandbox-container-terminal）：`ws.mjs`（拟新增）≈260 ∥ `server.mjs` 升级路挂点 ≈+12；`errors.mjs` ±0（in-band 四码为帧内码——非错误形新增）；沙盒面两新档 = `sandbox/SANDBOX.md` §13） | —— |

## 5. 验收判据（机检）

| 需求 AC | 设计级判据 | 载体 |
|---|---|---|
| AC-2（功能点 2） | SSE **逐块**：mock 上游两帧间隔——客户端先收帧 1 再等帧 2（证明非整段缓冲）∥ 帧字节逐值一致 ∥ `[DONE]` 透传；**收口轮四端任一实跑一轮**（真机） | 单元测试档 + 收口轮 |
| AC-6（功能点 6） | mock 引擎（断言流量命中引擎 `baseURL` 的 `/embeddings`）⇒ 响应体透传（维度/条数逐值不变）+ 记账 `endpoint='embeddings'`；**缺 `embedding` 段 ⇒ 服务照起**（载入通过 + 警告一条）**⇒ `/v1/embeddings` ⇒ 404 `model_not_found`（消息明示未配置——零新码）；引擎模型不入 `/v1/models`**（chat 清单零引擎行——派发面零动；2026-10-09 embed 解耦批——用例 = §7 N33/N34/B24/E25） | 单元测试档 |
| AC-11（功能点 11——控制台 provider/模型管理；已落需求档——`docs/server/requirements/PROJECT.md` 验收表） | admin 三态（`user` ⇒ 403 ∥ 无会话 ⇒ 401 ∥ admin 200）∥ **保存即热生效**（POST 后 `/v1/models` 立含 + mock 上游完成一次请求；PATCH 改 `baseURL` ⇒ 下一请求命中新地址；DELETE ⇒ 下一请求 404——零重启；在途流照常收尾）∥ 密钥面（列表掩码不含明文 ∥ 日志零明文 ∥ `env:` 引用原样回显）∥ 发现（mock `/models` ⇒ 清单去重；不可达 ∥ 超时 ∥ 非 JSON ⇒ 502 + 控制面提示/重试——**无手填兜底**（本批收正——用户 21:36 裁定；需求档回笔 = `design/PROJECT.md` §9 R28））∥ 校验单源（非法条目 ∥ 重名 ∥ `env:` 缺位 ⇒ 400 且库与运行时零变）∥ 预设列表（`GET /api/admin/providers/presets` ⇒ 21 家 ∥ 响应零 `apiKey` / 零 `model` 键（`models` = 空清单保留——2026-10-09 清除批）；预填 = 表单起手，写入仍走 POST 全字段 + 单源校验） | 单元测试档 |
| AC-13（功能点 12——首版完备化①③；已落需求档——`docs/server/requirements/PROJECT.md` 验收表） | ① `/healthz`：无鉴权 GET ⇒ 200 `{ status:"ok", version, uptime（数）, db:"ok" }`（`no-store`）∥ db 故障（注入口径）⇒ 503 `degraded` ∥ HEAD/POST ⇒ 404 ∥ 探针不触会话/团队 key 面；③ `/api/system`：无会话 ⇒ 401 ∥ 会话 ⇒ 200 `{ version, update:{ mode, lastCheckAt, latest }, embedding:{ model } }`（假 registry 自检后 `latest`/`mode` 随实况——`"notify"` 可见不自装） | 单元测试档 |
| AC-15①③（功能点 15——向量服务面 ∥ 管理总览；已落需求档——`docs/server/requirements/PROJECT.md` 验收表） | ① mock 引擎：探活/试跑 ⇒ `ok:true` + `dimensions` 逐值（两维向量 ⇒ 2） ∥ **不落库不计量**（usage 行数零增 ∥ 配额零涉） ∥ 不可达 ∥ 超时 ∥ HTTP 非 2xx ∥ 响应形不符 ⇒ `ok:false` + `kind` 四值分类 ∥ `GET /api/admin/embedding` = 配置真值且零 `apiKey` 字段 ∥ `/api/system` 含 `embedding.model`（两角色）且零地址字段；③ `/api/overview`：注入行集 ⇒ `today` 数值逐值 = 用量报表同日窗（同源断言）∥ 空集 ⇒ 0（零错）∥ admin 三态（user ⇒ 403 ∥ 无会话 ⇒ 401）；**缺段面**（2026-10-09 embed 解耦批）：`/api/system` 两角色 `embedding.model = null` ∥ `GET /api/admin/embedding` 两值 `null` ∥ 探活无草稿 ⇒ 400（消息明示）∥ 携草稿 ⇒ 照常 | 单元测试档 |
| AC-17（功能点 17——模型限流面 ∥ 停用径；已落需求档——`docs/server/requirements/PROJECT.md` 验收表） | 派发命中 + 超限 ⇒ 429 `rate_limited` + `Retry-After`（秒 ≥1——距窗尾）∥ 额内 ⇒ 放行 ∥ 窗滚 ⇒ 恢复 ∥ 计数口径（通过即计次 +1；token 于用量到达计入；失败/断开计次不计 token）∥ 保存即热生效（PATCH `settings` ⇒ 下一请求按新限——零重启）∥ 非法限值 ⇒ 400 库与运行时零变 ∥ 重启归零（软状态——在案）∥ 停用径 = PATCH `models` 减项 ⇒ `/v1/models` 随动 + 派发 404 ∥ 嵌入面零涉 | 单元测试档 |
| AC-21（功能点 21——网关配额检查面；已落需求档——`docs/server/requirements/PROJECT.md` 验收表） | 派发命中后/转发前：三级解析（覆盖 ⇒ 平台 ⇒ 不限）∥ 不限 ⇒ 零 SQL（计数探针）∥ 超限 ⇒ 429 `quota_exceeded` + message 含模型/已用/额度 ∥ 额内 ⇒ 放行 ∥ 他模型不受累 ∥ 嵌入零检查 ∥ 计数与记账同事务（明细可重算对账）∥ 保存即热生效（PATCH `settings` ⇒ 下一请求按新值；成员覆盖改行即改）∥ 旧 quota 端点已退役（404）（判据全文 = `metering/METERING.md` §4 AC-21 行） | 单元测试档 |
| AC-23（功能点 23③——成员模型禁用执行面；已落需求档——`docs/server/requirements/PROJECT.md` 验收表） | 被禁模型（成员×模型）⇒ 404 `model_not_found`（消息明示「已对该成员禁用」）且**零用量行**（准入前拒打）∥ 未禁 ⇒ 200 ∥ 禁用先于配额（被禁 ∧ 超额 ⇒ 404 非 429）∥ 他成员不受累 ∥ 即时生效（写后下一请求——无缓存）∥ `/v1/models` 随动滤除（禁后不含 ∥ 恢复后含）∥ 嵌入面零涉 ∥ 零新错误码 | 单元测试档 |
| AC-24（功能点 24——上游模型元数据留存与展示；已落需求档——`docs/server/requirements/PROJECT.md` 验收表） | ① discover 响应 `modelMeta`（保留集逐形：deepseek（`context_window`+`input_modalities`+`name`）∥ kimi 族（`context_length`+`supports_image_in`+`display_name`）∥ vLLM（`max_model_len`）三形直测；经典四件 ⇒ `{}`）∥ ② 保存求交（携 `modelMeta` ⇒ GET 行逐值、非开放模型不入库；仅 `models` ⇒ 现存图按求交滑动）∥ ③ 形不符 ⇒ 逐项略（零兜底）；`modelMeta` 非对象 ⇒ 400 库与运行时零变 ∥ ④ `/v1/models` ∥ 派发 ∥ 校验单源零涉（全回归） | 单元测试档 |
| 上游代理（台账 #1129——KD-SV-55） | 判定与同判定（chat ∥ discover 两链）：假代理（进程内 CONNECT 替身）命中 + 经代理完成请求 ∥ 无旗 ∥ 无 uri ∥ loopback ⇒ 直连（假代理零命中）∥ SSE 逐块经代理透传（非整段缓冲——mock 两帧间隔）∥ 代理不可达 ⇒ 502 `upstream_error` ∥ 代理路径断连 ⇒ 中止上游 + 记 `status='aborted'`（§2.1 契约零回归）∥ 启动 warn 两条（明文 `http:` ∥ 旗 `true` 缺 uri——触发/文案 = §6 KD-SV-55）∥ `proxy` 字段往返（POST/PATCH/GET ∥ 非布尔 400 库与运行时零变）∥ 热生效（PATCH 旗 ⇒ 下一请求随动；在途照旧） | 单元测试档 |
| AC-29（功能点 29——服务模型别名；已落需求档——`docs/server/requirements/PROJECT.md` 验收表） | ① 配置形：`models` 条目两形（字符串 = 无别名 ∥ 对象 `{name, alias}` = 配别名）；`alias` 缺省/空（`null` ∥ `""`）⇒ 无别名（归一）；非对象非字符串条目 ∥ `name` 缺/空 ∥ `alias` 数字/布尔/对象/数组 ∥ 含 `/` ∥ 首尾空白 ⇒ 400（保存——库与运行时零变）∥ 拒启（种子/载入）∥ ② 对外别名生效（`/v1/models` `id` = 别名 ∥ 请求 `model=别名` ⇒ 命中且转发上游真名（mock 上游 `body.model` 逐值）∥ 旧 `provider/model` 名 ⇒ 404 `model_not_found` 消息含别名；清别名 ⇒ 外标回落 `provider/model`——当即生效）∥ ③ 唯一性（别名撞别名——跨 provider ∥ 含新增项：载入 ⇒ 拒启 ∥ 保存 ⇒ 400 库与运行时零变；别名撞带前缀名——形上不相交（别名无斜杠 ∥ 前缀名恒含斜杠），唯一可能撞法 = 别名含 `/` ⇒ 形校验拒）；用例 = §7 N35/B25/E26 | 单元测试档 + 收口轮 |
| AC-30（功能点 30②——代理连通测试；已落需求档——`docs/server/requirements/PROJECT.md` 验收表） | 真打（mock 假代理 + mock 目标 ⇒ `ok:true` + `status`/`ms` 逐值 ∥ 假代理命中即证经代理）∥ 代理不可达（死端口）⇒ `ok:false` + `kind=unreachable` ∥ 超时（注入 `timeoutMs`）⇒ `kind=timeout` ∥ loopback 目标 ⇒ 直连（假代理零命中——旁路与生产同判）∥ 非 2xx 照实回读（`ok:true` + 状态值）∥ 入参（缺/空 `uri` ∥ `uri` 非 `http:` ∥ 缺/非法 `target` ⇒ 400 `invalid_request_error`——文件与运行态零变）∥ 判权三态（user ⇒ 403 ∥ 无会话 ⇒ 401 ∥ admin 200）∥ **零落库零计费**（usage 行零增 ∥ 配额零涉 ∥ 审计零行）∥ 自含形（结果 200 体——不走统一错误信封） | 单元测试档 |
| 沙盒（server-exec-sandbox 批——台账 #1224；需求 §5 沙盒块 + 14:00 裁定；AC-36——已落需求档） | 端点面机检（判权三态：`user` ⇒ 403 ∥ 无会话 ⇒ 401 ∥ 成员面恒本人过滤——§2.7）∥ 无可用节点 ⇒ 503 `sandbox_unavailable` ∥ 规则校验（两类型 ∥ 通配单层左 ∥ 显式 deny 恒先）∥ 待批三态 ∥ 资源覆写（PATCH ⇒ 建盒载荷逐值——§2.5）；**最小切片（节点/容器——§2.5 前七行；runner-admin-console 批）**：添/删节点 ∥ 容器四动作（502/404/400 映射 ∥ 幂等 304 语义 ∥ 连删失败行保留）= `sandbox/SANDBOX.md` §3 ∥ 用例 §12（N40 ∥ N46–N48 ∥ B41–B43 ∥ E34–E36）；判据全文 = `sandbox/SANDBOX.md` §11（执行面判据随重做批） | 单元测试档 + 收口轮 |
| 管理面 agent 会话面（admin-agent-chat 批——台账 #1254） | 判据全文 = `agent/ADMIN-AGENT.md` §7 聊天式行 ∥ §8（N54/N55 ∥ B48/B49 ∥ E40/E41）；端点面机检 = 本节 §2.8（四端点三态码 ∥ 帧形逐帧 ∥ 流前信封/流中 `end` 帧分界 ∥ 会话/在途门/重启收尾） | 单元测试档 |
| 对话页壳面对齐（chat-shell-align 批——台账 #1292；功能点 41 ∥ AC-41） | 端点面机检 = 本节 §2.8 六端点（新增 `PATCH …/:id` ∥ `POST …/:id/abort`——三态码：`user` ⇒ 403 ∥ 不存在 ⇒ 404 ∥ idle 态 abort ⇒ 400；`images` 三门 ∥ 非视觉模型 ⇒ 400）∥ 帧序（`turn(n)` 前 ∥ `usage` 后 ∥ `end` 两可字段——缺 usage ⇒ 零帧）∥ 详情 user 行仅 `imageCount`；判据全文 = `agent/ADMIN-AGENT.md` §7 本批行 ∥ §8（N64–N67 ∥ B65/B66 ∥ E50/E51）∥ 网页面 = `webui/CHAT.md` §4 | 单元测试档 + 收口轮 |
| 卷族（sandbox-volumes 批——台账 #1291；用户 2026-10-11 21:18 三件 + 21:22 裁；AC-40——已落需求档；表 = §2.5 卷族两行） | 列表逐值（`{ volumes: [{ name, driver, createdAt }] }`——`Volumes` 缺/null ⇒ `[]`；零审计）∥ 删名形校验（`../x` ∥ 含空格 ⇒ 400 **零外呼**）∥ 引擎 404 ⇒ 404 ∥ **409（在用卷）⇒ 400 人话 + 处置句**（零新码）∥ 204 ⇒ 200 + 审计 `volume_delete`（detail 键集 = `accounts/ACCOUNTS.md` §2.1）∥ 502 不可达 ∥ 判权三态（`user` ⇒ 403 ∥ 无会话 ⇒ 401）∥ 建容器卷字段 = 只改入口形（`Binds` 逐值零改——§2.5 创建容器行零动）；判据全文 = `sandbox/SANDBOX.md` §11 卷族行 ∥ §12（N62/N63 ∥ B63–B65 ∥ E48/E49）∥ §14 KD-SV-104/105 | 单元测试档 + 收口轮（真机） |
| AC-44（功能点 44——团队项目与权限；已落需求档——`docs/server/requirements/PROJECT.md` 验收表；team-projects-permissions 批（B2）——表 = §2.9 **十七行**（成员面六 ∥ 管理面十 ∥ 接收面一）） | 端点面机检：仓表一对一（重复挂仓 400 零落库——**跨形归一单键** ∥ 只 admin 能加——`user` ⇒ 403）∥ 三档权限（能力读数 + 动作面 403/404）∥ 负责人边界（改仓地址 ⇒ 非 admin 403）∥ 单向同步（名册减人 ⇒ sync 行落掉 ∥ 零反向出站 = 出站全 GET——登记步手动）∥ 手动钮 + 定时（两模式同跑）+ 事件接收端（§13——验签/忽略面/撞锁合并）∥ 单源锁 ∥ 源表七字段 + 掩码 + 删源防护 + webhook 密钥面 ∥ 项目删除（§14）；判据全文 = `project/PROJECTS.md` §9/§10（N1–N29 ∥ B1–B4 ∥ E1–E5） | 单元测试档 + 收口轮（浏览器实走） |
| AC-28（功能点 28——配置控制台写面；已落需求档——`docs/server/requirements/PROJECT.md` 验收表） | GET = 文件面值（有效值回填 ∥ 密钥掩码零泄漏 ∥ `bootstrap.password` 面零列）∥ PATCH：白名单（未知键 ⇒ 400）∥ 合并保未知键 ∥ 校验门（非法值 ∥ `env:` 缺位 ⇒ 400 且文件字节零变）∥ 原子写（tmp 零残留 ∥ rename 覆盖）∥ 审计 `config_update`（detail = 键名 ∥ 值零入）∥ 并发（同步段单写者）∥ 写后 GET 回读逐值（round-trip）∥ 草稿探活（test 端点明传优先——缺省回落）∥ **缺段创建**（缺 `embedding` 段 ⇒ PATCH 建段 ⇒ 门通过 ∥ 缺段档 PATCH 他键过门；2026-10-09 embed 解耦批） | 单元测试档 |
| AC-32（功能点 32——团队台账；已落需求档——`docs/server/requirements/PROJECT.md` 验收表；team-ledger 批——表 = §2.10 **八行**（控制台四 ∥ 端侧四）） | 端点面机检：两面同形（同域模块）∥ 判权三态（非成员 ⇒ 列表零出现/直取 404；`read` 档写 ⇒ 403；无会话/无 token ⇒ 401）∥ 仓归一（跨形同键：`git@host:org/repo.git` ∥ `https://host/org/repo` ⇒ 同键）∥ 未登记仓写 ⇒ 400 零落库 ∥ 全局编号（跨仓两建 ⇒ 不重）∥ 零去重（同题两条皆落）∥ 状态机（迁移表逐值 ∥ 追认须 detail ∥ 终态 400）∥ 老化（`now` 注入——30 天边界）∥ 审计 `ledger_event` 四 kind；判据全文 = `ledger/LEDGER.md` §10/§11（N1–N5 ∥ B1–B9 ∥ E1–E4）∥ 端侧面 = `docs/core/design/TEAM-LEDGER.md` §6/§7 ∥ 控制台面 = `webui/LEDGER.md` §4 | 单元测试档 + 收口轮（浏览器实走 + 三端实走） |
| AC-50（功能点 50——成员面会话；已落需求档——`docs/server/requirements/PROJECT.md` 验收表；member-face-chat 批——表 = §2.11 **十四行** ∥ §2.12 **五行**） | 端点面机检：双鉴权同判权（cookie ∥ Bearer 同权）∥ 恒本人（他人 ⇒ 列表零出现/直取 404 不辨）∥ 在途门 = 工作区级（并发二发 ⇒ 400 零副作用）∥ 盒离线 ⇒ 409 `workspace_offline`（读/管理同） ∥ 上限 ⇒ 400 `workspace_limit_reached` ∥ 拉仓四态（项目可见性门 /**目录冲突（盒侧检出）** /待批联动/结果对位）∥ 模型/档位（缺省模型 ∥ PATCH 两形 ∥ 回合 `reasoningEffort`）∥ 凭据三端点（绑定/撤销/清单——密文零回显）∥ 盒面：key 校验单源（吊销 ⇒ 401 即断）∥ **读指令族（列表/读史/新建/改——盒指令转呈）** ∥ 回合流帧形（`begin` + 六帧 + `end`；纯转发零落库）∥ 在线判据（`ping` 应答 ≤3 周期）∥ 连接发起方 = 盒（server 零拨盒路径）；判据全文 = `agent/MEMBER-AGENT.md` §6/§7（**成员面** N71–N78 ∥ B69–B72 ∥ E54–E57） | 单元测试档 + 收口轮（浏览器实走 + 真机盒） |

## 6. 关键决策（本域）

| # | 决策 | 理由 | 被否候选与何故否 |
|---|---|---|---|
| KD-SV-4 | **模型派发 = 对外标识精确匹配（配了别名 ⇒ 别名 ∥ 未配 ⇒ `provider/model` 复合键；按 provider 各持 `models` 列表）**——非策略路由 | 多 provider 支持的正确性最小面；**配了只认别名**（一名一形——旧前缀名 404 明示）；**同名模型跨 provider 并存且各自可达**；未命中（含非别名裸名）⇒ 404 `model_not_found`；**同 provider 内重名 ⇒ 拒启**；`/v1/models` = 对外标识清单（别名入面后随正——KD-SV-59） | 前缀通配路由（引入规则语言——越「不做」线）· 单上游写死（不满足「各 provider 的端点」）· 按请求头/参数选 provider（新增客户端契约——四端须改，违「baseURL 指入即用」）· **裸名兜底解析 ⇒ 否（无隐式解析）** |
| KD-SV-5 | **流式计量 = 请求注入 `stream_options.include_usage: true`** + 旁路 tap | OpenAI 兼容端点的流式 usage 只有被请求时才回传；不注入 ⇒ 流式请求全部无 token（AC-3 失效）。规则：`stream === true` 且 `stream_options.include_usage !== true` ⇒ 置 true（显式 false 亦覆盖——计量完整性优先；该字段只附加用量帧）；非流式不动。消费方容忍实证 = 四端核 `readSSE` 对 usage 帧（`choices: []`）直取后跳（`thincoder-core/provider/sse.mjs`） | 不注入 + 流式无计量（AC-3 不达）· 整段缓冲后再解析（违逐块透传）· 请求侧加 `stream:false` 改写（改变客户端语义） |
| KD-SV-10 | **SSE tap = 有界只读扫描**（行缓冲 ∥ 单行上限 1 MiB ∥ BOM 剥除 ∥ CRLF 容错） | 中继字节面原样 `pipe`（零改）；tap 只旁路解析 `data:` 行 JSON 取 `usage`；单行上限防病态膨胀（超限弃该行扫描——中继不受影响） | 全量缓冲解析（违逐块）· 正则抠 `usage`（脆弱——JSON 解析稳）· 无上限缓冲（恶意流可撑内存） |
| KD-SV-30 | **向量服务面 = 配置真值经 admin 端点 + 服务端代探/代试**：`GET /api/admin/embedding`（地址/模型——零密钥）∥ `POST /api/admin/embedding/test`（服务端 `/embeddings` 最小调用——探活与试跑单端点；成败自含形（沿 `/healthz` 先例）；不落库不计量）；`/api/system` 仅下发 `embedding.model`（两角色）——地址不下发用户面 | 引擎地址 = infra 面（admin 全量 ∥ 用户面 = 模型名 + snippet）；浏览器不持引擎 key（代发必需——密钥面零涉）；诊断自含形 = UI 直接渲染失败分类（四 kind——不吞细节）；探活 = 真实调用（`/models` 不保证存在——Ollama/TEI 各异） | 浏览器直连引擎（key 落浏览器——否）· `GET /models` 探活（引擎面不保证——形不符）· 探活并入 `/healthz`（热路径重探 ∥ 语义膨胀）· 探活走 `/v1/embeddings` 记账路径（诊断耗度——不落库不计量在案） |
| KD-SV-35 | **C = per-model 限流（RPM/TPM）**：检查点 = 派发命中后/转发前；窗口 = 进程内存 60s 定窗（通过即计次 +1；token 于用量到达计入）；超限 ⇒ 429 `rate_limited` + `Retry-After`（秒）；限值源 = `settings`（空 = 不限）；热生效 = 换表链（零独立机制）；重启归零（软状态）；计数口径 = 失败/断开计次不计 token | 需求 §2:17 C；单进程（KD-SV-1）下内存计数最简且精确；TPM 用实际用量（token 预估 = 不做项——§8）；429 形沿 `too_many_attempts` 先例（`Retry-After` 秒头）；限值面复用 settings（零新端点/零新存储面——KD-SV-34） | 滑动窗（复杂度无收益——内部工具）· 持久窗/跨重启（软状态即可——重启归零在案）· 并发/连接数限（C 口径 = RPM/TPM）· 跨进程限流（多实例 = 触发项）· 预估式 TPM 准入（违「token 预估」不做项）· 复用 `quota_exceeded` 码（语义不同——月度额度 ≠ 速率） |
| KD-SV-55 | **上游代理 = 逐渠 `proxy` 旗 + 顶层 `proxy.uri`（无全局闸）；实现 = 自持 std 传输（零第三方）**：判定 = 条目标旗 ∧ uri 在案 ⇒ chat 转发 ∥ 模型发现同经代理（loopback 旁路 ∥ 无旗/无 uri ⇒ 直连）；实现 = `thincoder-server/src/gateway/proxy.mjs`（node:http/https 内建 + 自建 CONNECT——std；每请求独立连接；TLS 默认全量校验；超时族 = CONNECT 15s ∥ 头阶段 600s（所沿先例 = 客户端 provider 面 `fetchTimeoutMs` 600s——`docs/core/design/PROVIDER.md:114`；传输面 `opts._headerTimeoutMs` 默认 60s 非所沿）∥ body 空闲 120s；断连中止 = 客户端断连（`opts.signal`）⇒ `proxyFetch` 拆除代理 socket（CONNECT 隧道 ∥ 经典转发两径同）⇒ 上游中止 + 记 `status='aborted'`——§2.1 契约零回归）；配置面 = `ops/OPS.md` §1（顶层段——uri 射程 = `http:` 仅：非对象 ∥ 非法 uri ∥ scheme 非 `http:` ⇒ 拒启）+ provider 条目字段（v9 列 ∥ 管理面 ∥ 种子）；启动 warn 两条（载入期触发——文案 = 中文单行）：① 明文 `http:` uri ⇒「proxy.uri 为明文 http——上游密钥经代理外发（确认代理可信）」；② 任一条目旗 `true` 而 `uri` 缺位 ⇒ 直连 +「条目 proxy: true 而顶层 uri 缺位——该渠直连（旗未生效）」；生效 = 旗随保存热生效 ∥ 顶层 uri 随重启 | 用户 2026-10-09 13:5x 令（「server端也有需要proxy支持，并且provider可以分别指定走不走proxy」——台账 #1129）；语义 = 客户端逐渠旗镜像（D-PX1——API key 经代理可见 ⇒ 默认不得外送）；零第三方红线（沿客户端 std 先例）——不自写 HTTP/1.1 解析（node:http 内建解析健壮：chunked ∥ 边界 ∥ 流式） | 全局闸 ∥ 双门槛（沿客户端否决面）· 第三方代理库（违红线）· 手写解析完整镜像（≈330 行复制——内建面已足；回退在册：组合不可行时退自写解析——同零第三方） |
| KD-SV-58 | **引擎模型退出通用清单（单独命名空间——2026-10-09 embed 解耦批；台账 #1148——用户 17:24）**：`/v1/models` = chat 前缀名清单（零引擎行——`modelList` 删引擎条目）；控制台服务模型页同源派生随之（`deriveModels(providers)` 零引擎行——嵌入行死支删净）；派发面零动（嵌入判据 = 引擎模型单独命名空间——既有）；`/api/system.embedding.model` 仍下发模型名（用户面提示条——非「模型列表」面） | 用户 17:24「嵌入式模型也不应该跟其他provider提供的服务混在一起，模型列表里不要包含嵌入模型」；清单 = 对外服务面（引擎模型不能 chat——派发面本就 404，列 = 死条目）；控制台与 `/v1/models` 同源（单源不改） | 清单保留引擎行 + `owned_by` 标记（用户裁「不要混在一起」——语义仍混）· 嵌入面整体退役（用户裁 = 只剔列表——转发/记账/试跑零涉）· 新端点 `/v1/embeddings/models`（引擎模型单值面已在配置/系统面——零需求） |
| KD-SV-59 | **服务模型别名 = 对外标识可配（2026-10-09 alias 批；台账 #1153——用户 20:32/20:36 令）**：① 配置形 = `models` 条目两形（字符串 = 无别名 ∥ 对象 `{name, alias}`——`alias` 缺省/空（`null` ∥ `""`）⇒ 归一无别名）；别名非空、不含斜杠、无首尾空白（形不符 ⇒ 拒）；② 对外 = 配了只认别名（`/v1/models` `id` ∥ 请求 `model=` 名；旧前缀名 ⇒ 404 消息含别名）；③ 唯一性 = 别名全服唯一（别名 vs 别名——校验层三径：单条内 ∥ 全量批量 ∥ 保存径对既有集；撞 ⇒ 拒启/400）；别名 vs 带前缀名 = 形上不相交（别名无斜杠 ∥ 前缀名恒含斜杠——唯一可能撞法 = 别名含 `/` ⇒ 形校验拒）；④ 内部真名不动（转发 ∥ 存储两字段 ∥ 计数键）；成员面随动 = 配额/禁用键与记账对外标识统一别名形（读面回映射——`metering/METERING.md` §2.3）；⑤ 编辑面 = 控制台服务模型页详情弹窗「别名」字段（`webui/ADMIN.md` §2.1③）；嵌入面零涉；不做别名历史/迁移（改别名 = 当即生效） | 用户 20:32「服务模型需要加一个别名字段，如果配置了，对外模型名称用别名」+ 20:36「别名当然需要唯一，不允许重名……嵌入面不相干」；对象条目 = 库内 JSON 列零迁移（`store/STORE.md` §2 v2 段——旧字符串行天然兼容）；只认别名 = 消「一名两形」歧义；唯一性 = 派发表正确性前提；真名不动 = 转发/记账/对账零涉（回映射 = 读面一处） | 别名与真名并存解析（一名两形——歧义；用户裁 ②）· 别名族带斜杠（与前缀名相撞面）· 新表/新列存别名（单列 JSON 已足——迁移零增）· 别名历史/迁移（用户边界句）· 别名级独立配额/限流配置（键随对外标识自然随动）· 嵌入模型别名（用户裁「嵌入面不相干」） |

## 7. 用例（本域）

| # | 类 | 输入 | 预期输出 |
|---|---|---|---|
| N1 | 正常 | 有效 key + 流式 chat（mock 上游回两帧文本 + 末帧 usage） | 200 SSE 透传；usage 行落库（token = 上游值） |
| N2 | 正常 | 有效 key + 非流式 chat（mock 回 `usage`） | 200 JSON 透传；记账同 N1 |
| N3 | 正常 | 有效 key + embeddings（mock 引擎回 2 条向量） | 200 透传（维度/条数不变）；记账 `endpoint='embeddings'` |
| N4 | 正常 | 有效 key + `GET /v1/models` | 200 列表 = 配置的全部 chat 模型（`provider/model` 前缀形）——**零引擎行**（2026-10-09 embed 解耦批） |
| B1 | 边界 | 客户端已带 `stream_options.include_usage: true` | 不重复注入 ∥ 不改写其它字段；透传照常 |
| B3 | 边界 | 客户端中途断开 | 中止上游请求；记 `status='aborted'`（token 通常 NULL） |
| B5 | 边界 | 流首 BOM ∥ CRLF 行尾 | tap 容错（剥 BOM ∥ trim）——usage 照常提取；透传字节不变 |
| B6 | 边界 | 单行 > 1 MiB（病态流） | tap 弃该行扫描（中继不受影响）；usage 记 NULL |
| E3 | 错误 | 请求 model 不在配置清单 | 404 `model_not_found` |
| E4 | 错误 | body 非 JSON ∥ 缺 `model` | 400 `invalid_request_error` |
| E5 | 错误 | 上游 4xx/5xx | 状态与 body**原样透传**；记 error 行 |
| E6 | 错误 | 上游不可达（连不上/超时） | 502 `upstream_error`；记 error 行 |
| E7 | 错误 | 请求体 > 32 MiB | 413 `payload_too_large`（不转发） |
| N16 | 正常 | admin 会话：`POST /api/admin/providers`（mock 上游）⇒ 立即 `GET /v1/models` 立含新模型 ∥ 经新 provider 完成一次请求 | 零重启生效；记账 ok |
| N17 | 正常 | admin 会话：`POST /api/admin/providers/discover`（mock 上游 `/models` 回 3 个 id） | `{ models:[…], modelMeta:{} }`（去重；经典四件上游 ⇒ `modelMeta` = `{}`——与 §2.2/N27 同形）；勾选集保存后清单/派发按开放清单 |
| N18 | 正常 | admin 会话：`PATCH` 改 `baseURL` 指第二 mock ∥ `DELETE` 一 provider | 下一请求命中新上游 ∥ 被删者下一请求 404（用量行零触） |
| B14 | 边界 | 在途流式请求进行中删除其 provider | 流照常收尾（`ok` 记账）；后续请求 404 |
| B15 | 边界 | 种子四格：空库+段 ⇒ 导入（`env:` 保形）∥ 非空库+段 ⇒ 忽略 + 警告 ∥ 两空 ⇒ 允许起 + 警告 | `/v1/models` 随格：含种子 ∥ 不变 ∥ 空清单（chat 404） |
| E14 | 错误 | `user` ∥ 无会话 ∥ 非法条目 ∥ 重名 ∥ `env:` 缺位 ∥ 不存在 id | 403 ∥ 401 ∥ 400（库与运行时零变）∥ 404 |
| E15 | 错误 | 发现：不可达 ∥ 超时 ∥ 非 JSON | 502 `upstream_error`（可读消息——控制面提示 + 重试；无手填兜底） |
| N19 | 正常 | 无鉴权 `GET /healthz`（正常态） | 200；`{ status:"ok", version, uptime, db:"ok" }`；`no-store` |
| N20 | 正常 | 会话 `GET /api/system`（假 registry 自检报新版后） | 200；`update.latest` = 假版号 ∥ `mode` = 生效档位 |
| B16 | 边界 | `GET /healthz`（db 探活失败——注入口径） | 503；`status:"degraded"` ∥ `db:"error"` |
| E16 | 错误 | `POST /healthz` ∥ `HEAD /healthz` | 404（未注册形——单一探针） |
| E17 | 错误 | 无会话 `GET /api/system` | 401 `unauthorized` |
| N21 | 正常 | admin + `POST /api/admin/embedding/test`（mock 引擎回两维向量） | 200 `{ ok:true, dimensions:2, ms≥0 }`；usage 行零增；`GET /api/admin/embedding` 回配置真值（零 `apiKey`） |
| N22 | 正常 | admin + `GET /api/overview`（注入今日两行） | `{ today:{ requests:2, totalTokens:和 }, members:{ count } }`——与 `/api/usage/summary` 同日窗同源 |
| B17 | 边界 | 引擎不可达 ∥ 超时 ∥ 非 2xx ∥ 响应无 `data[0].embedding` | `ok:false` + `kind` 四值（`unreachable`/`timeout`/`http_error`/`bad_response`）；服务照常 |
| E18 | 错误 | user ∥ 无会话 ⇒ 三端点（overview ∥ embedding 两） | 403 `forbidden` ∥ 401 `unauthorized` |
| N23 | 正常 | admin：PATCH `models` 减项（停用径）⇒ 立即 `GET /v1/models` 不含该模型 ∥ 派发 ⇒ 404 | 零重启随动；退役径同（服务端口径不涉发现） |
| N24 | 正常 | admin：PATCH `settings`（rpm=1）⇒ 第 1 请求通过 ∥ 第 2 请求 ⇒ 429 `rate_limited` + `Retry-After`（秒 ≥1）∥ 注时钟滚窗 ⇒ 放行 | 热生效（零重启）；定窗计数 |
| N25 | 正常 | admin：PATCH `settings`（tpm）⇒ 用量到达后计入 ∥ 累计超 TPM ⇒ 429 | token 于用量到达计入口径 |
| B18 | 边界 | 失败/断开请求（上游不可达 ∥ 中途断开）；rpm 计数含之；token 不计 ∥ 进程重启 ⇒ 计数归零 | 计次口径；软状态（重启归零在案） |
| E19 | 错误 | `settings` 非法（rpm=0 ∥ costIn=−1 ∥ note 超长 ∥ 未知子字段）⇒ 400 库与运行时零变 ∥ 裸名/未命中 ⇒ 404（派发先于限流） | 校验单源；错误序 |
| N26 | 正常 | 有效 key（成员已禁 `mock/mock-chat`）⇒ 派发该模型 ∥ 派发他模型 ∥ `GET /v1/models` | 404 `model_not_found`（消息含「禁用」）+ 零用量行；他模型 200；清单不含该模型（恢复后回列） |
| B19 | 边界 | 被禁 ∧ 配额已超（同日）⇒ 派发该模型 ∥ 配额已超但未禁 ⇒ 派发 | 404（禁用优先——非 429）；429 `quota_exceeded`（未禁面不变） |
| N27 | 正常 | admin：discover（mock 上游 `/models` 回富字段——`context_window` 1048576 ∥ `input_modalities: ["text","image"]` ∥ `name`） | 200 `{ models, modelMeta }`——`modelMeta[id]` 逐字段 = `{ displayName, contextWindow: 1048576, vision: true }`；经典四件上游 ⇒ `modelMeta: {}` |
| N28 | 正常 | admin：PATCH `models` + `modelMeta`（期望图）⇒ GET 行；再 PATCH 仅 `models` 减项 | 首次 ⇒ 行 `modelMeta` 逐值（非开放模型不入库）；二次 ⇒ 现存图按求交滑动（未减项零动） |
| B20 | 边界 | discover：`context_window: "1M"` ∥ `status: "online"`（未命中词表）∥ `display_name` 超长 ∥ `vision` 非布尔 | 逐项略（该字段不出；`modelMeta` 零占位、零兜底） |
| E20 | 错误 | PATCH `modelMeta` 非对象（数组 ∥ 字符串） | 400 `invalid_request_error`；库与运行时零变 |
| N29 | 正常 | admin：POST provider（`proxy: true`）+ 顶层 `proxy.uri` 在案 + 假代理 + mock 上游 ⇒ chat ∥ discover | 两链均经代理（假代理命中 CONNECT + 请求）；`GET /api/admin/providers` 行 `proxy: true` |
| N30 | 正常 | admin：PATCH `proxy`（false ⇒ true）再发 chat | 下一请求经代理（热生效——零重启）；在途流照旧 |
| B21 | 边界 | baseURL = loopback（`http://127.0.0.1:*` mock）+ 旗 ∥ uri 在案 | 直连（假代理零命中——NO_PROXY 语义） |
| B22 | 边界 | 旗 `true` + 顶层 `proxy` 段缺位 | 直连（零代理——镜像语义；启动 warn 一条在案） |
| E21 | 错误 | 条目 `proxy` 非布尔（`"yes"` ∥ 数组 ∥ 数字）∥ 顶层 `proxy` 非对象（数组 ∥ 数字）∥ 顶层 `proxy.uri` 非法（非字符串 ∥ 空串 ∥ 非 URL ∥ 裸串形 ∥ scheme 非 `http:`——仅 `http:` 收） | 400（保存径——库与运行时零变）∥ 拒启（配置径——fail-closed） |
| E22 | 错误 | 假代理不可达 ∥ CONNECT 拒（非 200） | 502 `upstream_error`（chat ∥ discover 同）；服务照常 |
| N31 | 正常 | admin：`GET /api/admin/config`（文件在场）⇒ `PATCH`（autoUpdate ∥ proxyUri）⇒ 再 `GET` | GET 逐值 = 文件（密钥掩码）∥ PATCH ⇒ `{ ok: true }` ∥ 回读逐值 = 新值 ∥ 未托管键原样保形（保未知键） ∥ 落盘形 = 2 空格缩进 + 末尾换行 ∥ 审计一行（detail = 键名 × 值零入） |
| B23 | 边界 | 文件缺 `autoUpdate`/`usageRetentionDays`（GET）；`usageRetentionDays: null`；`proxyUri: ""` | GET ⇒ 有效值回填（`notify` ∥ 90）∥ null ⇒ 不限（原样）∥ `""` ⇒ `proxy` 段删净（再 GET ⇒ `proxyUri: null`） |
| E23 | 错误 | PATCH：未知键（顶层 ∥ `embedding` 子键）∥ 非法值（`autoUpdate:"yes"` ∥ `usageRetentionDays:0` ∥ `proxyUri:"https://x"` ∥ `embedding.baseURL` 非法） | 400（原报文；文件字节零变；运行态零变） |
| E24 | 错误 | PATCH `embedding.apiKey: "env:NO_SUCH_VAR"`；写盘失败（fs 注入口径） | 400（环境变量缺位——文件零变）∥ 写入失败 ⇒ 500（文件零变 ∥ tmp 零残留） |
| N33 | 正常 | 有效 key：引擎模型在场（`embedding` 段在案）⇒ `GET /v1/models` ∥ `POST /v1/embeddings`（引擎模型名） | 清单 = 仅 chat 前缀名（零引擎行）；嵌入派发照常 200 透传 + 记账（两命名空间互不涉） |
| N34 | 正常 | 配置缺 `embedding` 段（∥ 显式 `null`）⇒ 起服 ∥ 有效 key `POST /v1/embeddings` ∥ 会话 `GET /api/system` ∥ admin `GET /api/admin/config` ⇒ PATCH `{ embedding: { baseURL, model } }` | 服务照常起（`/healthz` 200）；`/v1/embeddings` ⇒ 404 `model_not_found`（消息明示嵌入未配置）；`embedding.model = null`；GET ⇒ `embedding: null` ⇒ PATCH ⇒ 200 ⇒ 回读逐值（从无到有创建——重启生效） |
| B24 | 边界 | 缺配 + admin `POST /api/admin/embedding/test`（无草稿）∥ 同端点携草稿（`baseURL` + `model`——未保存） | 无草稿 ⇒ 400 `invalid_request_error`（消息明示未配置）；携草稿 ⇒ 照常探活（mock 引擎 ⇒ `ok:true` + `dimensions`） |
| E25 | 错误 | PATCH：`embedding: { baseURL }` 缺 `model` ∥ 缺段档 PATCH `trustProxy` ∥ `embedding` 非对象（字符串 ∥ 数组）∥ `embedding: null`（显式清空） | 缺子键 ⇒ 400（文件零变）∥ 缺段档他键 ⇒ 200（门容缺段）∥ 非对象 ⇒ 400 ∥ `null` ⇒ 400（清空段 = 不做——禁用 = 编辑配置文件） |
| N35 | 正常 | admin：PATCH `models` 携对象条目（`{ name:"mock-chat", alias:"fast" }`）⇒ `GET /v1/models` ∥ 有效 key 请求 `model:"fast"` | 清单 `id` = `fast`；请求 200——mock 上游收到 `body.model` = `mock-chat`（上游真名）；GET 行 `models` 保形（对象条目在场） |
| B25 | 边界 | 别名清空（PATCH ⇒ 字符串条目）∥ 未配别名（现形） | 外标当即回落 `provider/model`（清单与派发同拍——零缓存）；未配 = 现形零改 |
| E26 | 错误 | 旧 `provider/model` 名（该模型已配别名）∥ 别名撞别名（POST/PATCH——跨 provider）∥ 种子别名撞 ⇒ 载入 ∥ 别名含 `/` ∥ 条目 `{ name:"" }` ∥ 非对象非字符串条目 | 404 `model_not_found`（消息含别名——明示）∥ 400（库与运行时零变）∥ 拒启（fail-closed）∥ 400/拒启（形校验） |
| N36 | 正常 | admin：`POST /api/admin/proxy/test`（假代理在案 + 目标 mock 回 200） | 200 `{ ok:true, status:200, ms≥0 }`；假代理命中（真打）；usage 行零增 ∥ 审计零行 |
| B26 | 边界 | 目标 = loopback（本机 mock）∥ 非 2xx（404）∥ 代理死端口 ∥ `timeoutMs` 注入口径缩短 | 直连（假代理零命中——NO_PROXY 语义）∥ `ok:true` + `status:404`（照实回读）∥ `ok:false` + `kind=unreachable` ∥ `ok:false` + `kind=timeout` |
| E27 | 错误 | 缺 `uri` ∥ `uri` 空串 ∥ `uri` 非 `http:`（如 `https://…`）∥ 缺 `target` ∥ `target` 非法 URL ∥ user ∥ 无会话 | 400 `invalid_request_error`（消息明示）∥ 400 ∥ 400 ∥ 400 ∥ 400 ∥ 403 `forbidden` ∥ 401 `unauthorized` |

- 沙盒面用例 = `sandbox/SANDBOX.md` §12（列全案，此处不复制）。
- 管理面 agent 会话面用例 = `agent/ADMIN-AGENT.md` §8（N54/N55 ∥ B48/B49 ∥ E40/E41 ∥ **N64–N67 ∥ B65/B66 ∥ E50/E51**（chat-shell-align 批）——端点面逐条覆盖）。

## 8. 本域边界（不做的面）

- 非 OpenAI 协议翻译 ∥ 策略路由（别名 = 标识面已入——KD-SV-59；通配/规则路由仍不做） ∥ 上游重试（失败原样返回——重试语义留给客户端）∥ 并发/连接数限流（C = per-model RPM/TPM 速率限——KD-SV-35；配额 = 额度式双轨在案）∥ 跨进程/多实例限流（计数 = 单进程内存——多实例 = 触发项 `EVOLUTION.md` §2）∥ 限流窗口持久化（重启归零——软状态在案）∥ token 预估（TPM 计数 = 实际用量）∥ 请求体/响应的内容加工（压缩、改写、脱敏——纯透传）∥ CORS（消费方均为服务端工具）。
- 嵌入引擎管理面（引擎起停手动——需求 §4）；多实例/横向扩展 = 触发项（`EVOLUTION.md` §2）。嵌入配置缺位 = 禁用态（404 `model_not_found` 消息明示——零新码；2026-10-09 embed 解耦批）；引擎模型不入通用清单（单独命名空间——KD-SV-58）；控制台删除/清空 `embedding` 段 = 不做（编辑配置文件；界面仅创建/改值）。
- provider 管理面不做：本机 CLI 面（控制台 = 单一面——需求点名）∥ URL 白名单/出口限制（admin 权限自担——内网工具面）∥ 变更历史/回滚（行即现值——无版本化）∥ 渠道/灰度/多版本并存（沿更新面不做项——`ops/OPS.md` §10）。
- 模型元数据面不做：元数据同步/校验/仲裁机制（用户 12:11 裁）∥ 上游状态自动停用/自动勾选 ∥ 保留集外字段（推理档位/视频/输出上限等——无用途不堆砌）∥ 对外 `/v1/models` 元数据带出（须论证 + 点名方可议） ∥ 元数据参与转发/计费（纯展示）。
- 健康/系统面不做：metrics/Prometheus ∥ 深度依赖探活（仅 db 一探） ∥ `unhealthy` 自动处置（外部工具面） ∥ `/api/system` 写面（只读）。
- 控制台数据面不做：引擎试跑历史/存档（一次性读数） ∥ 总览图表（总览 = 数值卡——趋势归用量页） ∥ 引擎地址下发非 admin 面（用户面 = 模型名 + snippet——`webui/READINGS.md` §2.1①）。
- 代理测试不做（KD-SV-60——`webui/WEBUI.md` §7）：测试历史/存档 ∥ 测试经记账/配额/审计路径（零落库零计费） ∥ 代理池/多代理 ∥ 代理认证（沿本档 §8 上游代理面） ∥ 目标协议白名单/探针准入（http(s) 即收）；传输语义（KD-SV-55）零变——`proxy.mjs` 零触。
- 成员模型禁用面不做：新错误码（404 复用——消息明示） ∥ 定时/条件禁用 ∥ 嵌入面禁用（零涉） ∥ 禁用变更审计（零增——`accounts/ACCOUNTS.md` §2.2）；禁用状态的成员可见面（只出清单与拒形）。
- 上游代理面不做：全局代理闸 ∥ 环境变量回落（`HTTPS_PROXY` 一族——显式配置面）∥ `insecureTls` opt-in 通道 ∥ 代理认证（`Proxy-Authorization`——如内网代理需认证 ⇒ 停报另议）∥ 代理连接复用/连接池（每请求独立连接）∥ 按目标分层代理（单一 uri）∥ 嵌入面代理（零涉）。
- 别名面不做（2026-10-09 alias 批——KD-SV-59）：别名历史/迁移（改别名 = 当即生效）∥ 别名级独立限流/配额配置（键随对外标识自然随动）∥ 一名多模型/一组多名 ∥ 嵌入面别名（用户裁「嵌入面不相干」）∥ 成员键的存在性/别名交叉校验（键形校验 = 形状面单源——`accounts/ACCOUNTS.md` §2.2）。
- 配置面不做（2026-10-09 配置批）：配置文件热载/运行态注入（生效 = 重启——`ops/OPS.md` §1）∥ `host`/`port`/`db` 写面（部署拓扑项）∥ 配置版本史/回滚 ∥ 写前备份 ∥ 多实例并发写（单写者部署模型）∥ `providers[]`/`bootstrap` 写面（各有其面）。
- 沙盒面不做（server-exec-sandbox 批——`sandbox/SANDBOX.md` §15）：执行面细节 ∥ 盒内协议 ∥ 配额机制——本档零复述。
- 管理面 agent 会话面不做（`agent/ADMIN-AGENT.md` §10）：SSH 凭据经 chat 文本输入 ∥ 会话删除/重命名/自动清理 ∥ 节点排空/禁用工具 ∥ 沙盒其余面工具——本档零复述；图片文件面（缩略图/下载/文件存储——KD-SV-109 边界）∥ 无源钮功能补齐（模式位/设置）∥ 思考档位的逐条覆写/状态行段（console-reasoning-levels 批——口径③④）∥ 跨会话并发/多标签同步（未裁）。

## 变更记录

- 2026-10-14（**sandbox-onboarding-removal 批 · 延迟三档落地轮（fix 轮）· eng-designer**——承批档 `docs/batches/2026-10-14-sandbox-onboarding-removal.md` §2「不在本批（承接/延迟）」；重做批收口闭 ⇒ 延迟条件消解；用户 2026-10-14 裁「撤」）：§2.5 前括注「托管接入面」条 ⇒ 「接入面」承接句（手工登记 + 管理面 chat 内动作——KD-SV-135；四端点退场 ∥ 表停机留史）∥ **四端点行删**（起 ∥ 列表 ∥ 详情 ∥ 撤销凭据）∥ §5 托管接入判据行删。**产品码零触（设计轮）。**

- 2026-10-14（**server-mcp 批 · 设计评审轮 2 修正（fix 轮）· eng-designer**——承批档 `docs/batches/2026-10-13-server-mcp.md` §3 轮次 2（评审 #117 之 3）：§2.13 `POST /api/admin/mcp` 行明写 `enabled` 缺省 = 启用（与 `mcp/MCP.md` §3.2 ∥ v24 DDL 缺省值同拍）。**零新语义（评审发现直接导出项）；产品码零触（设计轮）。**

- 2026-10-14（**sandbox-exec-rebuild 批 · 收口修复轮（设计面）· eng-designer**——承批档 `docs/batches/2026-10-13-sandbox-exec-rebuild.md` §6 挂单 D 裁；D5 冻结解除后照落）：§2.5 销毁动作句读数去 `dirty` ∥ §2.7 成员行形去 `dirty` 键（删键——伪读数不留）。**产品码零触（设计轮）。**

- 2026-10-14（**server-mcp 批 · 设计评审轮 1 修正（fix 轮）· eng-designer**——承批档 `docs/batches/2026-10-13-server-mcp.md` §3 轮次 1（评审 #112 之 4）：§2.13 探活行体收正（`transport?`；`id` 在场 ⇒ 缺席字段（含非秘密）一律回落库内行——行内 `{id}` 径可 200；与 `mcp/MCP.md` §3.2 同拍）。**零新语义（评审发现直接导出项）；产品码零触（设计轮）。**

- 2026-10-13（**server-mcp 批 · 设计轮 · eng-designer**——承批档 `docs/batches/2026-10-13-server-mcp.md` §1 · 台账 #1379）：§1 族表增「MCP 管理面」行 + §2.13（五端点——清单 CRUD + 探活；契约单源）。同源随动 = `mcp/MCP.md` §3 ∥ `store/STORE.md` §2 v24 ∥ `webui/MCP.md` §2。**产品码零触（设计轮）。**

- 2026-10-13（**sandbox-exec-rebuild 批 · 范围增补 #2（连接面 TLS 档——fix 轮）· eng-designer**——承批档 `docs/batches/2026-10-13-sandbox-exec-rebuild.md` §1「2026-10-13 22:43 · 用户裁定」）：§2.5 `POST /runners` 行改（体增 `connection`/`tls`；地址归一按档（2375/2376）；自检按档走；行形含 `connection`/`tls` 元数据；审计 `runner_add` 增 `tls` 键）+ **增 `PUT …/runners/:id/connection` 行**（全列覆写 ∥ 先自检后落库 ∥ 关 TLS 原子 ∥ 响应零材料字段）。同源随动 = `sandbox/SANDBOX.md` §3 连接方式块/§9/§12 ∥ `sandbox/EXECUTION.md` §2.1 ∥ `accounts/ACCOUNTS.md` §2.1。**产品码零触（设计轮）。**

- 2026-10-06：建档（批 `docs/batches/2026-10-06-server-gateway.md` 设计轮；同日补轮——B 案织入 + 三层结构）——gateway 域：路由族表 ∥ OpenAI 三面 ∥ 转发与计量行为 ∥ 错误形（全码单源）；KD-SV-4/5/10；用例 N1–N4 ∥ B1/B3/B5/B6 ∥ E3–E7。
- 2026-10-06：实施后回填轮（fix）——§3 补 `internal_error`（500 兜底——处理函数自身异常入表）；§4 行数按实读回填（小计 ≈770 ⇒ 635）。
- 2026-10-06：模型标识口径变更（用户 10:27–10:28）——KD-SV-4 修订（`provider/model` 复合键派发 ∥ 同名跨 provider 并存 ∥ 同 provider 内重名 ⇒ 拒启 ∥ 无隐式解析）；§2 表 `/v1/models` 行与 §2.1 派发行随正。
- 2026-10-06：小收尾轮（fix）——§4 行数实读再收正（providers 40 ⇒ 55 ∥ routes 75 ⇒ 81 ∥ forward 183 ⇒ 185——模型标识 fix 轮随动；小计 ≈770 ⇒ 658）。
- 2026-10-06：控制台 provider/模型管理设计轮（批 `docs/batches/2026-10-06-console-providers.md`——需求 §2:11 ∥ 台账 #962）——§1 路由族表增 provider 管理面行 + 静态面五档 ∥ §2 `/v1/models` 行随正（运行时注册表派生）∥ §2.1 派发行随正 ∥ §2.2 增「provider 管理面」（端点表 ∥ 保存即热生效 ∥ 在途口径 ∥ 密钥回显形 ∥ 模型发现）∥ §4 预算（providers 55 ⇒ ≈150 ∥ routes 81 ⇒ ≈95 ∥ provider-admin 拟新增 ≈220）∥ §5 补 AC-11 候补判据行 ∥ §7 增 N16–N18 ∥ B14/B15 ∥ E14/E15 ∥ §8 增 provider 管理面不做项；决策 = KD-SV-19（`ops/OPS.md` §8）。
- 2026-10-06：fix 轮（评审轮次 1 五条——批 `docs/batches/2026-10-06-console-providers.md` §3）：#1 §2.2 增预设列表端点（`GET /api/admin/providers/presets`——「从预设快速添加」通道：请求/响应/错误形/校验单源衔接）∥ #2 §5 AC-11 行标记收正（已落需求档）。
- 2026-10-06：首版完备化设计轮（批 `docs/batches/2026-10-06-first-release-completeness.md`——需求 §2:12 ∥ 台账 #963）——§1 路由族表增系统面行 ∥ §2.3 增（healthz 探活 ∥ `/api/system` 版本/更新状态）∥ §3 账号面补 429 `too_many_attempts` ∥ §4 预算（system 拟新增 ≈70 ∥ errors +1；小计叠加 ≈1058）∥ §5 补 AC-13 候补行（①③ 面）∥ §7 增 N19/N20 ∥ B16 ∥ E16/E17 ∥ §8 增健康/系统面边界；决策 = KD-SV-23/24（`ops/OPS.md` §8）。
- 2026-10-06：控制台多语言设计轮（批 `docs/batches/2026-10-06-server-i18n.md`——需求 §2:13 ∥ 台账 #965）——§3 增「消息语言口径」行（服务端消息中文单语零改 ∥ 控制台 `code` 映射——机制 = `webui/WEBUI.md` §2.2）；错误形/码面零改。
- 2026-10-06：fix 轮（评审轮次 1 #6——批 `docs/batches/2026-10-06-first-release-completeness.md` §3）：§2.2 删「推翻式」残留（保「用户 2026-10-06 16:01 令」出处）。
- 2026-10-06：AC-13 行候补标记收正（父侧直接执行 · 机械 · 可 revert——已落需求档验收表）。
- 2026-10-06：实施后回填轮（R14——批 `docs/batches/2026-10-06-console-providers.md`）：§4 行数按实读收正（routes **86** ∥ providers **146** ∥ provider-admin **197**（新档）；小计 658 ⇒ **951**）；叠加链同拍（#963 结果值随 re-base）。
- 2026-10-06：实施后回填轮（R16——批 `docs/batches/2026-10-06-first-release-completeness.md`）：§2.3 `mode` 枚举补「未就位 ⇒ `null`」形 ∥ §4 行数按实读收正（system **55**（标记翻正） ∥ errors **56**；小计 ⇒ **1007**）。
- 2026-10-06：控制台可见面二轮设计轮（批 `docs/batches/2026-10-06-console-completeness-2.md`——需求 §2:15 ∥ 台账 #972）——§1 路由族表增控制台数据面行 ∥ §2.3 `/api/system` 行补 `embedding.model`（两角色——地址不下发）+ 随注 ∥ 增 §2.4（管理总览 ∥ 向量服务：三端点语义 ∥ 探活/试跑单端点 kind 四归类 ∥ 不落库不计量）∥ §4 预算（system ⇒ ≈60 ∥ embedding-admin/overview 新档；小计 ⇒ ≈1192）∥ §5 补 AC-15①③ 候补行 ∥ §7 增 N21/N22 ∥ B17 ∥ E18 ∥ §8 边界随正。
- 2026-10-06：fix 轮（评审 #69——批 `docs/batches/2026-10-06-console-completeness-2.md` §3 十项，本档面）：§5 AC-13③ 行响应形补 `embedding`（`{ model }`——两角色下发 ∥ 零地址字段——与 §2.3 同源）。
- 2026-10-06：控制台 Provider 重做设计轮（批 `docs/batches/2026-10-06-console-provider-redo.md`——需求 §2:18）——§2.2 模型发现行收正（失败 ⇒ 提示/重试——无手填兜底，用户 21:36 裁定；服务端语义零改）∥ §5 AC-11 行同拍；端点表零改（零新端点——勾选集经 PATCH `models` 单写）。
- 2026-10-06：服务模型配置面设计轮（批 `docs/batches/2026-10-06-models-config.md`——需求 §2:17 ∥ 台账 #981；裁定 21:39「ACDE」）——§2 chat 行 + §2.1 增模型限流准入（429 `rate_limited` + `Retry-After`）∥ §2.2 增「模型设置（`settings`）」（形/写面/读面/存储/校验/热生效）+ GET/PATCH 两行随正（零新端点）∥ §3 增码 ∥ §4 预算（`ratelimit.mjs` 拟新增 ≈90；routes/forward/providers/provider-admin/errors/server 增量；小计 ⇒ ≈1363）∥ §5 增 AC-17 行 ∥ §6 增 KD-SV-35 ∥ §7 增 N23–N25 ∥ B18 ∥ E19 ∥ §8 边界随正（RPM/并发限流句重写——C 入面）；机制全文 = §2.1 ∥ §6。
- 2026-10-07：配额分模型批设计轮（批 `docs/batches/2026-10-07-quota-per-model.md`——需求 §2:21 ∥ §2:22 ∥ 台账 #990/#991/#992）——§2 chat 行随正（配额准入 = 派发命中后/转发前）∥ §2.1 增配额准入条（三级 ∥ 短路 ∥ 点查 ∥ 429 形；限流条补位点次序）∥ §2.2 settings 形补 `quotaTokens` ∥ §3 `quota_exceeded` 消息补模型外标 ∥ §4 预算（routes 101 ⇒ ≈115 ∥ forward 196 ⇒ ≈204；小计 ⇒ ≈1385）∥ §5 增 AC-21 行 ∥ §8 边界随正（配额 = 额度式双轨在案）；机制全文 = `metering/METERING.md` §2。
- 2026-10-06：fix 轮（评审 #94——批 `docs/batches/2026-10-06-console-provider-redo.md` §3；本档面）：§7 E15 行收正（发现失败 = 提示 + 重试 ∥ 无手填兜底——废止表述删净；与 §2.2/§5 同拍）∥ §1 静态面行档数收正（`views-*` 八档 ⇒ 十档——三档单源）。
- 2026-10-06：fix 轮（评审 #95——批 `docs/batches/2026-10-06-models-config.md` §3；本档面）：§2.2「模型设置」补提交线形（键 = 上游模型名 ∥ 值 = 完整对象——未设/清空 = 显式 `null`；草稿初值 = GET 行 `settings`）∥ §4 两处「本批」改批名（二轮——system 行 ∥ 小计行）。
- 2026-10-07：配额 v2 · 成员模型面批设计轮（批 `docs/batches/2026-10-07-quota-v2-member-models.md`——需求 §2:23 ∥ 台账 #1002/#1003/#1004 + 并入 #1001）——§2 chat 行与 `/v1/models` 行随正（禁用准入 ∥ 成员滤除）∥ §2.1 增禁用准入条（位点/错误形/禁用优先于配额/列表随动）∥ §3 404 行括注（禁用消息区分）∥ §4 routes 实读回基 + 小计 ⇒ ≈1393 ∥ §5 增 AC-23 行 ∥ §7 增 N26/B19 ∥ §8 边界随正；机制全文 = `accounts/ACCOUNTS.md` §2.2。
- 2026-10-07：fix 轮（评审轮次 1——批 `docs/batches/2026-10-07-quota-v2-member-models.md` §3 六发现，本档面）：§5 AC-23 行「候补」标记收正（已落需求档——沿 AC-13/AC-14 先例）。
- 2026-10-07：Provider 模型元数据批设计轮（批 `docs/batches/2026-10-07-provider-model-metadata.md`——台账 #1005 + 并入 #984；用户 12:05/12:23 令）——§2.2 端点表四行随正（GET/POST/PATCH/discover——`modelMeta`）+ 增「模型元数据（留存图）」条 ∥ §4 预算（providers 167 ⇒ ≈175 ∥ provider-admin 220 ⇒ ≈258；小计 ⇒ ≈1439）∥ §5 增 AC-24 候补行 ∥ §7 增 N27/N28 ∥ B20 ∥ E20 ∥ §8 边界随正（存储同拍 = `store/STORE.md` §2 v7 段；展示 = `webui/WEBUI.md` §2.4④）。
- 2026-10-07：fix 轮（评审轮次 1——批 `docs/batches/2026-10-07-provider-model-metadata.md` §3 九发现，本档面）：§2.2 `displayName` 补长度上限（≤200 字符——沿 settings `note` 先例）+「仅 ≠ 模型名」范围明写（两来源皆适用）∥ §5 AC-24 行「候补」标记收正（已落需求档——沿 AC-13/AC-14 先例）∥ §7 N17 预期输出补 `modelMeta`（经典四件 ⇒ `{}`——与 §2.2/N27 同形）。
- 2026-10-07：文档清账批（fix 轮——承批档 `docs/batches/2026-10-07-doc-cleanup.md` §2 · 台账 #983）：§4 逐档实读收正（十一档；`ratelimit` **64** ∥ `embedding-admin` **96** ∥ `overview` **27**——三档「拟新增」标记随正（已落盘））；小计 ⇒ **实读 1362**（逐档复读和）。**零语义**。
- 2026-10-09（**provider-default-model-purge 批 · 设计评审轮 1 修正（fix 轮）· eng-designer**——承批档 `docs/batches/2026-10-09-provider-default-model-purge.md` §3 轮次 1 · 台账 #1122）：批内注记名统一「2026-10-09 清除批」（§2.2 预设端点行 ∥ §5 AC-11 行）。**零新语义**（注记名收正）。明细 = 批档 §2 修复轮块。
- 2026-10-09（**provider-default-model-purge 批 · 实施期发现收正（fix 轮）· eng-designer**——承批档 `docs/batches/2026-10-09-provider-default-model-purge.md` §2 · 台账 #1122；实施期上抛经父侧裁定：端点半形状保留 `models`（空清单））：§2.2 预设端点行样本补 `models: []` + 两键区分半句（`model` 键退场 ∥ `models` 空清单保留）∥ §5 AC-11 行措辞消歧同拍。**零新语义**（响应线形收正——样本漏笔，与实装对齐）。明细 = 批档 §2 补记。
- 2026-10-09（**server-gemini-openai-preset 批 · 设计轮 · eng-designer**——承批档 `docs/batches/2026-10-09-server-gemini-openai-preset.md` §2 · 台账 #1128 ∥ #1129；用户 13:45/13:5x 两令）：§2.1 增**上游出口代理**条（逐渠判定 ∥ 同判定 ∥ loopback 旁路 ∥ 无全局闸；机制全文 = §6 KD-SV-55）∥ §2.2 增「上游代理旗」条 + GET/POST/PATCH/discover 四行字段随正 + presets 行 20 ⇒ **21 家** ∥ §4 预算（`proxy.mjs` 拟新增 ≈200 ∥ forward/providers/provider-admin 增量）∥ §5 增代理判据行 + AC-11 行 21 家随正 ∥ §6 **增 KD-SV-55** ∥ §7 增 N29/N30/B21/B22/E21/E22 ∥ §8 增代理面不做句。**产品码零触（设计轮）**。明细 = 批档 §2。
- 2026-10-09：设计修正轮（fix——批 `docs/batches/2026-10-09-server-gemini-openai-preset.md` §3 评审发现 1/2/6/7，本档面）：§6 KD-SV-55 补两启动 warn（触发/文案）∥ 断连中止契约句（`opts.signal` ⇒ socket 拆除 ⇒ 记 `aborted`）∥ 头阶段 600s 先例钉定（客户端 provider 面 `fetchTimeoutMs`——`docs/core/design/PROVIDER.md:114`）∥ uri 射程（`http:` 仅）；§5 代理行补两 warn 与断连腿；§7 E21 补非对象形态与射程。**零新语义**（评审发现直接导出项）。
- 2026-10-09：配置控制台批设计轮（批 `docs/batches/2026-10-09-server-console-config.md`——台账 #1139；用户 15:51–15:57 三连）——§1 路由族表控制台数据面行增 `GET/PATCH /api/admin/config` ∥ §2.4 端点族随正 + 增两端点行（文件面读 ∥ 白名单写/载入面等价校验门/原子写/审计）+ test 行草稿三项明传优先 ∥ §4 预算（`config-admin.mjs` 新 ≈160 ∥ embedding-admin ⇒ ≈108；小计 ⇒ ≈1844）∥ §5 增 AC-28 行 ∥ §7 增 N31/B23/E23/E24 ∥ §8 增配置面不做项；机制全文 = `ops/OPS.md` §1 + §8 KD-SV-56。**产品码零触（设计轮）**。
- 2026-10-09：设计修正轮（fix——批 `docs/batches/2026-10-09-server-console-config.md` §3 评审发现 4/7，本档面）：§2.4 PATCH 行明写 `embedding` 子键级语义（缺省 = 不动 ∥ 明填 = 替换——`apiKey: ""` = 显式空）+ 掩码/引用回显形提交三态（未编辑 ⇒ 不携 ∥ 编辑 ⇒ 明传 ∥ 清除勾 ⇒ `""`）∥ test 行补探活侧同口径（不作明传值——三态与 PATCH 同）∥ §4 小计算术配平（+≈180 ⇒ +≈172 = 160 + 12 ∥ ≈1844 ⇒ **≈1836**——分项闭式 ∥ 同源随动 = `design/PROJECT.md` §6）。**零新语义**（评审发现直接导出项）。
- 2026-10-09：embed 解耦批设计轮（批 `docs/batches/2026-10-09-server-embedding-decouple.md`——台账 #1147 ∥ #1148；用户 17:24 两条之 1/2）——§1 路由表 `/v1/models` 行与 `/v1/embeddings` 行随正（引擎模型退场 ∥ 缺配 404）∥ §2.3 补缺段 `null` 形 ∥ §2.4 四行随正（GET 缺段两值 null ∥ 探活无草稿 400 ∥ PATCH 缺段建段）∥ §4 预算（routes ⇒ ≈117 ∥ providers ⇒ ≈181 ∥ embedding-admin ⇒ ≈118；小计 ⇒ ≈1847）∥ §5 AC-6/AC-15/AC-28 三行随补 ∥ §6 增 **KD-SV-58** ∥ §7 N4 随正 + 增 N33/N34/B24/E25 ∥ §8 边界随正。**产品码零触（设计轮）**。
- 2026-10-09：设计修正轮（fix——批 `docs/batches/2026-10-09-server-embedding-decouple.md` §3 评审发现 6–9，本档面）：§4 `embedding-admin.mjs` 行按配置控制台批落地实读收正（96 ⇒ **实读 110** ⇒ ≈118——陈值 ≈108 删）∥ §5 AC-28 行「候补」标记收正（已落需求档）∥ §2 表 `/v1/embeddings` 行粗体闭合（零语义）∥ §2.4 PATCH 行 + §7 E25 明写 `embedding: null` ⇒ 400（清空段 = 不做）。**零新语义**（评审发现直接导出项）。
- 2026-10-09（**server-model-alias 批 · 设计轮 · eng-designer**——承批档 `docs/batches/2026-10-09-server-model-alias.md` §2 · 台账 #1153 + 并入 #1008 ∥ #1010 ∥ #1152 ∥ #967 ∥ #1151；需求 §2:29 + AC-29；用户 20:32/20:36 令）：§2 `/v1/models` 行随正（`id` = 对外标识）∥ §2.1 派发行重写（对外标识精确匹配 ∥ 配了只认别名 ∥ 别名全服唯一）∥ §2.2 开放清单条补条目两形 + 模型元数据撤销面口径补记（#1010①）+ `displayName` 源口径补记（#1010②）∥ §2.3 `embedding` 字段判据单源化（运行时 accessor——#1152）∥ §4 预算（providers ⇒ ≈208 ∥ provider-admin ⇒ ≈322；小计 ⇒ ≈1887）∥ §5 增 AC-29 行 ∥ §6 KD-SV-4 随正 + **增 KD-SV-59** ∥ §7 增 N35/B25/E26 ∥ §8 边界随正（别名不做项）。**产品码零触（设计轮）**。
- 2026-10-09：设计修正轮（fix——批 `docs/batches/2026-10-09-server-model-alias.md` §3 评审发现 5②/6①，本档面）：§4 小计链算术平（+≈42 ⇒ **+≈44**——补 `forward` ≈210（与 §4 逐档行 ∥ `design/PROJECT.md` §6 同拍）；≈1887 ⇒ **≈1889**）∥ §2.2 开放清单条 ∥ §5 AC-29 行 ∥ §6 KD-SV-59① 三处 `alias` 口径闭合（归一集 = 缺省 ∥ `null` ∥ `""`；数字/布尔/对象/数组 ∥ 含 `/` ∥ 首尾空白 ⇒ 400）。**零新语义**（评审发现直接导出项）。明细 = 批档 §2 修复轮块。
- 2026-10-09（**console-proxy-page 批 · 设计轮 · eng-designer**——承批档 `docs/batches/2026-10-09-console-proxy-page.md` §2 · 台账 #1158；需求 §2:30 + AC-30；用户 21:06 令）：§1 路由族表控制台数据面行增 `POST /api/admin/proxy/test` ∥ §2.4 端点族随正 + 增代理测试行（双必传 ∥ `validateProxyConfig` 单源复用 ∥ 真打 `proxyFetch` ∥ kind 二分类 ∥ 自含形 ∥ 预算 10s ∥ 零落库不计量）∥ §4 预算（`proxy-admin.mjs` 拟新增 ≈95；小计 ⇒ ≈1984）∥ §5 增 AC-30 行 ∥ §7 增 N36/B26/E27 ∥ §8 增代理测试面不做句；控制台面 = `webui/WEBUI.md` §2.7 ∥ 决策 = KD-SV-60。**产品码零触（设计轮）**。
- 2026-10-09：设计修正轮（fix——批 `docs/batches/2026-10-09-console-proxy-page.md` §3 评审发现 3，本档面）：§1 路由族表前端静态面行 `views-*` 枚数收正（十档 ⇒ **十二档**——配置控制台批 + `views-system-config.mjs` ∥ 代理页批 + `views-proxy.mjs` 各 +1）。**零新语义**（评审发现直接导出项）。明细 = 批档 §2 修复轮块。
- 2026-10-09：实施后回填轮（代理页批——批 `docs/batches/2026-10-09-console-proxy-page.md` · eng-designer）：§4 `proxy-admin.mjs` 行「拟新增」翻正（**实读 81**）∥ 小计实读增量 **+81**。**零语义**（读数 ∥ 标记）。
- 2026-10-10（**console-proxy-back 批 · 设计形式化轮 · eng-designer**——承批档 `docs/batches/2026-10-10-console-proxy-back.md` §2 · 台账 #1199；需求 §2:30 + AC-30 回改；用户 08:22/08:41 令）：§1 路由族表前端静态面行 `views-*` 十二 ⇒ **十一档**（`views-proxy.mjs` 退役）∥ §2.4 代理测试行承载描述收正（「控制台代理页」⇒「控制台系统页「服务配置」卡·连通测试块」——端点/契约零变）∥ §8 代理测试面不做项批名 ⇒ 决策指针（KD-SV-60——`webui/WEBUI.md` §7）。**产品码零触**（形式化轮——码已落）。
- 2026-10-10（**team-login-client-access 批（B1）· 设计轮 · eng-designer**——承批档 `docs/batches/2026-10-10-team-login-client-access.md` §1 · 台账 #1212；需求 §2:31 + AC-31）：§1 路由族表增客户端数据面行（骨架三端点——登录 token 鉴权）∥ §3 增客户端面复用句（零新码）；同源 = `client/CLIENT.md`。**产品码零触（设计轮）**。
- 2026-10-10（**server-exec-sandbox 批 · 设计轮 · eng-designer**——承批档 `docs/batches/2026-10-10-server-exec-sandbox.md` §2 · 台账 #1224；需求 §5 沙盒块 + 用户 14:00 两平面裁定）：§1 路由族表增两行（沙盒控制台面 ∥ 沙盒 runner 面）∥ 前端静态面行 `views-*` 十一 ⇒ **十三档** ∥ **增 §2.5/§2.6**（控制台面八端点 ∥ runner 面七端点——表为端点单源）∥ §3 增码 `sandbox_unavailable`（503）∥ §4 预算（`errors.mjs` ⇒ ≈66；sandbox 域档组预算另册）∥ §5 增沙盒判据行 ∥ §7 增用例指针行 ∥ §8 增不做面指针；机制全文 = `sandbox/SANDBOX.md` ∥ `sandbox/RUNNER.md`（迁移期引文——已删）。**产品码零触（设计轮）**。
- 2026-10-10（**server-exec-sandbox 批 · 设计评审轮 1 修正（fix 轮）· eng-designer**——承批档 `docs/batches/2026-10-10-server-exec-sandbox.md` §3 轮次 1 之 1/2/4/5/6/8/11/12/14 + 用户 14:56 直令）：§1 沙盒控制台面行方法面补全（`GET/POST/PATCH/DELETE`）+ 前端静态面行 `views-*` 十三 ⇒ **十四档** ∥ §1 增沙盒成员面行 ∥ §2.5 补 `PATCH /workspaces/:id`（资源覆写——键级合并/`null` 删键/生效面）+ 工作区行补 `limits` + join-token 行补落点（进程内存——重启作废）+ settings 行重写（值形逐键 ∥「默认单」非本表）+ rules 行「显式 deny 先」 ∥ §2.6 join 行补三态人话 + 失败审计 ∥ **增 §2.7**（沙盒成员面——本人读数单端点）∥ §3 沙盒面族补 `/api/me/sandbox/*` ∥ §4 errors 行实读收正（**实读 64**）+ 小计 §13 ⇒ §14 ∥ §5 沙盒行收正（AC-36 已落需求档 + 成员面 + 显式 deny 恒先）。**零新语义**（评审发现直接导出项 + 用户直令）。
- 2026-10-10（**server-exec-sandbox 批 · checkpoint 通路口径 fix 轮 · eng-designer**——2026-10-10 裁定（实现轮上抛：快照 ≤200 MiB vs 全局 32 MiB 相抵））：§2.6 checkpoint 行补通路口径（octet-stream 唯一收口 ∥ 路由级 200 MiB ∥ 流式落盘）∥ §3 413 句补路由级例外 ∥ §4 `server.mjs` 行随拍（实读 192 ⇒ ≈206——+≈14）∥ §5 沙盒行 + §7 增 B27（快照上送边界——E7 通则保持）。**产品码零触**。
- 2026-10-10（**runner-admin-console 批 · 设计档随正 · eng-designer**——承批档 `docs/batches/2026-10-10-runner-admin-console.md` §1 · 台账 #1252；用户 2026-10-10 19:52–19:56 口径「runner = 远程 Docker API 节点」）：§1 去沙盒 runner 面行 ∥ **§2.6 删**（端点族随执行面重定退场）∥ §2.5 运行面读数行收正 + join-token/排空行 ⇒ 节点添加/删除行 ∥ §3 去 413 路由级例外、沙盒面族去 `/api/runner/*` ∥ §4 `server.mjs` 行去 checkpoint 口径（实读链止 192）+ 小计 sandbox 域指针随正 ∥ §5 沙盒行随正 ∥ §7 B27 删 ∥ §8 沙盒不做面指针随正；同源随动 = `sandbox/SANDBOX.md` ∥ `store/STORE.md` ∥ `ops/OPS.md`。**产品码零触**。
- 2026-10-10（**runner-admin-console 批 · A 批最小切片设计 · eng-designer**——承批档 `docs/batches/2026-10-10-runner-admin-console.md` §1 · 台账 #1252；用户 19:59 令）：§2.5 运行面行重写（读时探活形）+ 添/删节点行收正 + **增容器四行**（列表 ∥ 创建三件 ∥ 启/停 ∥ 删——引擎请求/映射逐项）∥ §2.5 前括注补节点/容器面错误形（502/404/400——零新码）∥ §4 `errors.mjs` 行补本批 ±0 ∥ §5 沙盒行补最小切片判据指针；同源随动 = `sandbox/SANDBOX.md` §3 ∥ `store/STORE.md` §2 v12 段 ∥ `webui/WEBUI.md` §2.8①。**产品码零触（设计轮）**。
- 2026-10-10（**runner-admin-console 批 · 托管接入（管理面 agent）设计 · eng-designer**——承批档 §2 · 台账 #1236/#1237；用户 22:19–22:29 四句 + 15:00/15:02 裁）：§2.5 前括注补托管接入面语义（异步起跑 ∥ 零新码 ∥ 零秘密回显）+ **增四行**（起 ∥ 列表 ∥ 详情 ∥ 撤销凭据）∥ §5 增托管接入判据行；同源随动 = `sandbox/SANDBOX.md` §3 ∥ `agent/ADMIN-AGENT.md` ∥ `store/STORE.md` §2 v13 段 ∥ `webui/WEBUI.md` §2.8①。**产品码零触（设计轮）**。
- 2026-10-11（**admin-agent-chat 批 · 设计轮 · eng-designer**——承批档 `docs/batches/2026-10-11-admin-agent-chat.md` §1 · 台账 #1254；需求 §5「两个 chat 界面」②④）：§1 路由族表增管理面 agent 面行（四端点——NDJSON 流）∥ **增 §2.8**（会话面四端点表 + NDJSON 四帧形（`delta`/`call`/`result`/`end`）∥ 执行不依赖连接 ∥ 流前信封/流中 `end` 帧分界 ∥ 重启恢复在装配期）∥ §4 小计补 ±0 条（会话面四端点 = agent 域档组——本表不列）∥ §5 增判据行 ∥ §7 增用例指针行 ∥ §8 增不做面指针；机制全文 = `agent/ADMIN-AGENT.md` §11 ∥ 存储 = `store/STORE.md` §2 v14 段 ∥ 审计 = `accounts/ACCOUNTS.md` §2.1。**产品码零触（设计轮）**。
- 2026-10-11（**admin-agent-chat 批 · 设计评审轮 1 修正（fix 轮）· eng-designer**——承批档 `docs/batches/2026-10-11-admin-agent-chat.md` §3 轮次 1 之 1）：§2.8 流帧 `call` 帧 `args` 钉死为**字符串**（参数摘要——JSON 序列化 ⇒ 掩蔽后截断 ≤500 字；非对象——与 `agent/ADMIN-AGENT.md` §11 单源逐字同拍）。**零新语义**（评审发现直接导出项）。
- 2026-10-11（**sandbox-docker-admin 批 · 设计轮 · eng-designer**——承批档 `docs/batches/2026-10-11-sandbox-docker-admin.md` §1 · 台账 #1265；用户 04:36/04:39 两族同批）：§2.5 前括注补容器面补齐/镜像族错误形句（读三件 3s ∥ 重启/强杀 15s ∥ 拉取 10 分钟；三形 ⇒ 400）+ **增八行**（容器详情 ∥ 日志 ∥ 重启 ∥ 强杀 ∥ 用量 ∥ 镜像列表 ∥ 拉取 ∥ 删除镜像）；同源随动 = `sandbox/SANDBOX.md` §3（本批块）∥ `webui/WEBUI.md` §2.8① ∥ `accounts/ACCOUNTS.md` §2.1（kind 面）。**产品码零触（设计轮）**。
- 2026-10-11（**admin-agent-chat 批 · 实施轮上抛回笔（fix 轮）· eng-designer**——承批档 `docs/batches/2026-10-11-admin-agent-chat.md` §6（实施轮上抛处置 + notice 补裁——④ 空回合单列 · 四值枚举））：§2.8 会话详情行补 notice `data` 形——`reason` 四值枚举（重启收尾 "restart" ∥ 预算超限 "budget" ∥ 模型错误 "model_error" ∥ 空回合 "empty_turn"；与 `agent/ADMIN-AGENT.md` §11 ∥ `store/STORE.md` §2 v14 段同拍）。**零新语义**（上抛裁决直接导出项）。
- 2026-10-11（**sandbox-image-sources 批 · 设计轮（本笔 = 设计评审轮 1 修正补记）· eng-designer**——承批档 `docs/batches/2026-10-11-sandbox-image-sources.md` §1/§3 之 2 · 台账 #1274；用户 09:17 四点（④ 撤）+ 09:19 预选）：§2.5 前括注补镜像源面句（五端点统一信封 ∥ 目录/标签自含状态形 ∥ 读类 10s ∥ 零凭据 ∥ 零涉可用性门）+ **增七行**（源列表 ∥ 预选 ∥ 增 ∥ 改 ∥ 删 ∥ 目录 ∥ 标签）；同源随动 = `sandbox/SANDBOX.md` §3（本批块）∥ `store/STORE.md` §2 v15 段 ∥ `accounts/ACCOUNTS.md` §2.1（kind 面）∥ `webui/WEBUI.md` §2.2/§2.8① ∥ `design/PROJECT.md` §6。**产品码零触（设计轮）**。
- 2026-10-11（**常用源预选表补第 7 条（实走修正 · 轻通道）· 主 agent 直接执行 · 机械 · 可 revert**——承轻通道轮 `docs/batches/2026-10-11-light-walkthrough-fixes.md` §1 pen1；用户 20:14 实走发现）：§2.5 预选端点行 六 ⇒ **七条**（+ 1ms.run）；同源随动 = `sandbox/SANDBOX.md` §3 ∥ 代码表 `SOURCE_PRESETS`。零新语义。
- 2026-10-11（**sandbox-volumes 批 · 设计轮 · eng-designer**——承批档 `docs/batches/2026-10-11-sandbox-volumes.md` §1 · 台账 #1291；用户 2026-10-11 21:18 三件 + 21:22 裁「先按不考虑加挂的原方案开批」；需求 40 ∥ AC-40）：§2.5 前括注补卷族面句（列 3s ∥ 删 15s ∥ 名形 400 零外呼 ∥ 在用 409 ⇒ 400 ∥ 零新码 ∥ 审计 `volume_delete`）+ **增两行**（卷列表 ∥ 删卷）；§4 `errors.mjs` 行 + 小计补本批 ±0 ∥ §5 增卷族判据行。同源随动 = `sandbox/SANDBOX.md` §2/§3/§8①/§9/§11/§12/§13/§14/§15/§16 ∥ `accounts/ACCOUNTS.md` §2.1 ∥ `webui/SANDBOX.md` §2.1①/§3/§4/§6 ∥ `webui/WEBUI.md` §1/§6 ∥ `design/PROJECT.md` §2.1/§3/§4/§7。**产品码零触（设计轮）**。
- 2026-10-11（**轻通道轮收口评审 #249 发现收正（🔴）· 主 agent 直接执行 · 可 revert**——发现 1：本行契约体形缺待命命令（实现 `container-routes.mjs:179` 与 `sandbox/SANDBOX.md` §3/N46 恒携——轻通道笔 3 只随正了同源设计档、漏契约行））：本行体形补 `Cmd: ["sleep", "infinity"]` + 恒携句。零新语义。
- 2026-10-12（**轻通道笔 10——建容器「命令」字段 · 主 agent 直接执行 · 可 revert**——承走查轮 `docs/batches/2026-10-11-console-walkthrough-round.md` §1.11；用户 11:51 裁「甲，应该有个默认，但是可覆盖」）：本行入参 `{ name, image, volume? }` ⇒ `{ name, image, volume?, command? }`；体形 `Cmd: ["sleep", "infinity"]` ⇒ `Cmd: <命令>`（缺省仍 = 待命命令；`command` 给了 ⇒ 按空格切分；显式空串 ⇒ 400）。零新端点。
- 2026-10-11（**§1 静态面行 `views-*` 计数收正（改档单指针）· 主 agent 直接执行 · 机械 · 可 revert**——chat-shell-align 批设计轮知会项：在册「十四档」自 docker-admin 批后未随历批更新（现盘 ≫14——档单单源 = `webui/WEBUI.md` §1））：§1 前端静态面行「`views-*` 十四档」⇒「`views-*`（档单 = `webui/WEBUI.md` §1）」——消重复计数源。零新语义。
- 2026-10-11（**chat-shell-align 批 · 设计轮 · eng-designer**——承批档 `docs/batches/2026-10-11-chat-shell-align.md` §1 · 台账 #1292；用户 21:55 裁「全套 ∥ 补后端一件不藏 ∥ VSC 式」；功能点 41 ∥ AC-41）：§1 管理面 agent 面行补两端点（`PATCH …/chats/:id` ∥ `POST …/chats/:id/abort`）；§2.8 **增两行**（换模型 ∥ 中止）+ 会话详情行收正（notice **五值**枚举 + user 行携图仅 `imageCount`）+ 发条行收正（体 `{ content, images? }`）+ 流帧行收正（+ `turn`/`usage`；`end` 两可字段；指针 = `agent/ADMIN-AGENT.md` §11.3）+ 新增 `PATCH/abort` 两行；§4 小计补本批 ±0 条 ∥ §5 增判据行 ∥ §7 用例指针行补（N64–N67 ∥ B65/B66 ∥ E50/E51）∥ §8 不做面行随正（中止/换模型两项删——D8）。同源随动 = `agent/ADMIN-AGENT.md` §6/§7/§8/§9/§10/§11 ∥ `webui/CHAT.md` §2.1/§4 ∥ `design/PROJECT.md` §4/§7。**产品码零触（设计轮）**。
- 2026-10-11（**控制台实走修复轮（走查轮）· 主 agent 直接执行 · 可 revert**——承 `docs/batches/2026-10-11-console-walkthrough-round.md` §1 · 台账 #1299；用户 23:55 裁「甲」）：§2.5 源列表行 `kind` 三值（+ `hub-mirror`——Hub 镜像两主机）。同源随动 = `sandbox/SANDBOX.md` §3。零新语义（走查裁定直接导出项）。
- 2026-10-12（**console-reasoning-levels 批 · 设计轮 · eng-designer**——承批档 `docs/batches/2026-10-12-console-reasoning-levels.md` §1 · 台账 #1303；用户 11:45 走查 + 11:46 口径四条「行」；功能点 42 ∥ AC-42）：§2.2 GET providers 行补 `modelReasoning`（稀疏 map——机制 = `agent/ADMIN-AGENT.md` §11.4）+ 增思考档位条目；§2.8 增**会话行形条目**（四端点同源 + `reasoning`）+ 建会话行补 `reasoning` + **`PATCH …/:id` 行重写**（会话设置面：一次一件 ∥ 换模型清档 ∥ 表外 400）；§4 `provider-admin.mjs` 行实读复读（**349** ⇒ ≈362）+ 新档行一（`reasoning-levels.mjs` 拟新增 ≈45）+ 小计 +58；§8 管理面 agent 会话面不做行随正（去「推理」词——D8；+ 逐条覆写/状态行段）。同源随动 = `agent/ADMIN-AGENT.md` §6/§7/§8/§9/§10/§11.4/§13 ∥ `webui/CHAT.md` §1/§2.1/§3/§4/§5/§6 ∥ `store/STORE.md` §1–§4。**产品码零触（设计轮）。**
- 2026-10-12（**console-reasoning-levels 批 · 设计评审轮 1 修正（fix 轮）· eng-designer**——承批档 `docs/batches/2026-10-12-console-reasoning-levels.md` §3 轮次 1 之 5；父侧定形 = 明写解析径）：§2.8 `PATCH …/:id` 值域句补上游真名解析（会话 `model` = 对外标识——别名反查 = KD-SV-59；机制 = `agent/ADMIN-AGENT.md` §11.4）。**零新语义**（评审发现直接导出项）。
- 2026-10-12（**console-reasoning-levels 批 · 落地后回填 · 主 agent 直接执行 · 可 revert**）：§2.2 `reasoning-levels.mjs` 行账估 ≈45 ⇒ **实读 88**（本批落地后）。
- 2026-10-12（**team-projects-permissions 批（B2）· 设计轮 · eng-designer**——承批档 `docs/batches/2026-10-12-team-projects-permissions.md` §1 · 台账 #1216；用户 13:33 裁定收束 + 13:39 起批；需求 44 ∥ AC-44）：§1 路由族表增两行（项目面（成员） ∥ 项目管理面（admin））；**增 §2.9**（十四端点：成员面六 + 管理面八——可见性口径 ∥ 自含状态形六分类 ∥ 掩码 ∥ 删源防护 ∥ 加仓两形全成或全拒 ∥ 调度器接线）；§3 增项目面错误形行（零新码 + 自含形）；§5 增 AC-44 判据行。同源随动 = `project/PROJECTS.md`（新档） ∥ `webui/PROJECTS.md`（新档） ∥ `store/STORE.md` §2 v17 ∥ `accounts/ACCOUNTS.md` §2.1（十四型）。**产品码零触（设计轮）。**
- 2026-10-12（**team-projects-permissions 批（B2）· 设计修订轮（fix）· eng-designer**——承批档 `docs/batches/2026-10-12-team-projects-permissions.md` §3（评审 #277）∥ 用户 2026-10-12 授权两件）：§1 路由族表：项目管理面行随正（+ webhook 密钥/项目删除）+ **增接收面行**（公开——验签门）；§2.9 preamble 随正（共 **十七行**）+ 三新行（`POST …/hook-secret` ∥ `POST /api/hooks/git-sources/:id` ∥ `DELETE /api/admin/projects/:id`）+ `hookSecret` 读面/`known` 标/`source_update` 键注随正 ∥ §3 项目面行随正（+ `/api/hooks/*`）∥ §5 AC-44 行随正（十七行 ∥ 跨形归一 ∥ 事件/删除面 ∥ N1–N23 ∥ B1–B3 ∥ E1–E4）。**产品码零触（设计轮）。**
- 2026-10-12（**team-projects-permissions 批（B2）· 设计修订轮 2（fix）· eng-designer**——承批档 `docs/batches/2026-10-12-team-projects-permissions.md` §3 轮次 2（评审 #280 之 1））：§2.9 详情行 `my` 补 `admin` 布尔 + `can` 补 `delete`（六键逐值 = `project/PROJECTS.md` §3 判定函数）+ 增「详情 `my` 形」条目（渲法源口径）；同源随动 = `webui/PROJECTS.md` §2.1。**零新语义**（评审发现直接导出项）。
- 2026-10-12（**admin-chat-creds-merge 批 · 冻结域随正（fix 轮）· eng-designer**——承批档 `docs/batches/2026-10-12-admin-chat-creds-merge.md` §2（R72② 清单——父侧解冻后落） · 台账 #1326）：§1 沙盒控制台面行方法面补 `PUT` ∥ §2.5 **增两端点行**（`PUT`/`DELETE …/runners/:id/credential`——形校验 400 ∥ 零秘密响应 ∥ 审计两 kind）+ 主机表行形增 `ssh` 元数据（`overview` 元素 ∥ `POST /runners` 200 行形）+ 托管接入列表行 `credential.state` 四值（+ `moved`）。同源随动 = `sandbox/SANDBOX.md` §3（主机凭据块——单源） ∥ `accounts/ACCOUNTS.md` §2.1 ∥ `store/STORE.md` §2 v19 段。**零新语义**（R72② 清单逐项转录）。
- 2026-10-13（**sandbox-outbound-member-face 批 · 设计轮 · eng-designer**——承批档 `docs/batches/2026-10-13-sandbox-outbound-member-face.md` §1 · 台账 #1234）：§2.7 成员面行形增 `runnerName`（所属 runner——未绑定 ⇒ `null`，端侧呈「未绑定」）。机制全文 = `sandbox/SANDBOX.md` §8 成员面 ∥ `webui/SANDBOX.md` §2.2。**产品码零触（设计轮）**。
- 2026-10-13（**team-ledger 批 · 设计轮 · eng-designer**——承批档 `docs/batches/2026-10-13-team-ledger.md` §1 · 台账 #1206；需求功能点 32 ∥ AC-32）：§1 路由族表增两行（团队台账面（控制台）——会话 + 项目能力矩阵 ∥ 团队台账面（端侧）——登录 token）；**增 §2.10**（八行：控制台四（`/api/ledger*`） ∥ 端侧四（`/api/client/ledger*`）——同域模块两面族；三筛；`repos[]` 渲法源；仓归一；追认须 detail）；§3 增团队台账面错误形行（零新码 ∥ 404 不辨 ∥ 未登记仓写 400）；§5 增 AC-32 判据行。同源随动 = `ledger/LEDGER.md`（新档） ∥ `store/STORE.md` §2 v20 段 ∥ `webui/LEDGER.md`（新档） ∥ `docs/core/design/TEAM-LEDGER.md`（新档）。**产品码零触（设计轮）。**
- 2026-10-13（**team-ledger 批 · 设计评审轮 1 修复（fix 轮）· eng-designer**——承批档 `docs/batches/2026-10-13-team-ledger.md` §3 轮次 1 之 7/9）：§1 台账（控制台）行判权括注改指（`ledger/LEDGER.md` §6 ⇒ **§2——KD-SV-143**）∥ §2.10 列表行收正（行形零 `repoName`——显示名 = 控制台 `repos[]` 回填；端侧展示 = 归地址）。**零新语义**（评审发现直接导出项）；产品码零触（设计轮）。
- 2026-10-13（**team-ledger 批 · 收口随正轮（fix 轮）· eng-designer**——承批档 `docs/batches/2026-10-13-team-ledger.md` §2 · 台账 #1206）：§2.10 POST 行落**建面三态**（2026-10-13 裁定——仓不存 ⇒ 400 人话 ∥ 仓存而无 `can.view` ⇒ 404 不辨（措辞 = 「项目不存在或不可见」）∥ 可见而无 `can.write` ⇒ 403）∥ §3 团队台账面行补写面三态句 ∥ 用例/判据链随正（B1–B8 ⇒ **B1–B9**——`ledger/LEDGER.md` §11 增 B9 行；§2.10 尾 ∥ §5 AC-32 行）。**零新语义**（收口随正——父裁原文）；产品码零触。
- 2026-10-13（**gitee-namespace-kinds 批 · 设计轮 · eng-designer**——承批档 `docs/batches/2026-10-13-gitee-namespace-kinds.md` §1 · 台账 #1365；需求功能点 44 ⑫ ∥ AC-44 ⑬）：§2.9 源列表行形增 `scopeKind` ∥ 增源/改源行形增 `scopeKind`（gitee 三值——形门）∥ 拉列表行读类改平台口径（gitee 20s ∥ 余 10s）+ 三态路由 + 不符报错句 ∥  preamble 增读类超时/三态路由条（指针 = `project/PROJECTS.md` §4）。同源随动 = `project/PROJECTS.md` §2/§4/§8/§9/§10/§11/§12（KD-SV-151） ∥ `store/STORE.md` §2 v21 段 ∥ `webui/PROJECTS.md` §2.4/§3/§4。**产品码零触（设计轮）。**
- 2026-10-13（**member-face-chat 批 · 设计轮 · eng-designer**——承批档 `docs/batches/2026-10-13-member-face-chat.md` §1 · 台账 #1215；用户 2026-10-13 19:32「考虑周全」+「界面跟 vsc/桌面基本一致」+ 19:33「开」；需求功能点 50 ∥ AC-50）：§1 路由族表增两行（成员面对话面 ∥ 盒接入面）；**增 §2.11**（十一行：会话六 + 工作区写面四 + 拉仓一——双鉴权 ∥ 恒本人 ∥ 在途门 = 工作区级 ∥ 模型/档位面）∥ **增 §2.12**（四行：SSE 下行 + sync + 回合流 + 命令结果——工作区 key 第二门）；§3 增成员面/盒面错误形行（两新码 409 `workspace_offline` ∥ 400 `workspace_limit_reached`）；§4 小计行补本批 ±0 注；§5 增 AC-50 判据行。同源随动 = `agent/MEMBER-AGENT.md`（新档） ∥ `store/STORE.md` §2 v22 ∥ `webui/CHAT.md` §2.2 ∥ `sandbox/SANDBOX.md` §5/§8/§13 ∥ `webui/WEBUI.md` §1/§2/§6/§7。**产品码零触（设计轮）。**
- 2026-10-13（**gitee-namespace-kinds 批 · 设计评审轮 1 修正（fix 轮）· eng-designer**——承批档 `docs/batches/2026-10-13-gitee-namespace-kinds.md` §3 轮次 1 之 2/3）：§2.9 增源行「非 gitee 携 `scopeKind` 非空 ⇒ 400」加清空形括注 ∥ 改源行增**跨态清空形**（`scope: ""`/`null` ⇒ NULL ∥ 平台（携值 ∥ 行值）非 gitee ⇒ `scope_kind` 落 NULL——携非空 ⇒ 400 ∥ 不携/携空 ⇒ NULL）∥ 用例枚举两处收正（N1–N23 ∥ B1–B3 ∥ E1–E4 ⇒ **N1–N29 ∥ B1–B4 ∥ E1–E5**）。**零新语义**（评审发现直接导出项）；产品码零触（设计轮）。
- 2026-10-13（**member-face-chat 批 · 设计评审轮 1 修正（fix 轮）· eng-designer**——承批档 `docs/batches/2026-10-13-member-face-chat.md` §3 轮次 1 之 2/3/7/8/10/12/17）：#2 两新码行账（`errors.mjs` 现读 64 ⇒ ≈70 ∥ `server.mjs` 现读 192 ⇒ ≈197 ∥ 本域小计 ±0 ⇒ **+≈9**）∥ #3 成员面会话行形补 `reasoning`（建/列表/详情/PATCH 四处同源）∥ #7 拉仓目标目录冲突检出点 = **盒侧检出**（`git clone` 失败分类 ⇒ 结果面 `failed`）∥ #8 `turns` 体读 = 路由级流式例外 ∥ #10 盒 `ping` 上行（`POST /api/box/ping` ⇒ 204）+ 在线判据两句 ∥ #12 settings 行补 `memberWorkspaceLimit` ∥ #17 用例面别限定（成员面）。**零新语义**（评审发现直接导出项）；产品码零触（设计轮）。
- 2026-10-13（**sandbox-container-terminal 批 · 设计轮 · eng-designer**——承批档 `docs/batches/2026-10-13-sandbox-container-terminal.md` §1 · 台账 #1374；用户 21:11/21:13/21:17 三句）：§2.5 增**容器终端行**（WebSocket 升级路一枚——101 前判权/同源门/404 ∥ 101 后二进制 pty 字节 + 文本 JSON 控制 ∥ in-band 四码；心跳/收口/审计 = `sandbox/SANDBOX.md` §3 单源）∥ §4 `server.mjs` 行现读 **243** ⇒ ≈255（+`upgrade` 挂点）+ 新档 `ws.mjs`（拟新增 ≈260——最小 WebSocket 服务端）∥ §4 小计 +≈277。**产品码零触（设计轮）。**
- 2026-10-13（**sandbox-exec-rebuild 批 · 设计轮 · eng-designer**——承批档 `docs/batches/2026-10-13-sandbox-exec-rebuild.md` §1 · 台账 #1373）：§2.5 工作区三行随正（列表增 `stopReason`；创建 = 放置 + 建盒链；动作 = **直调链 + 幂等 + 未绑 503**——队列句删）∥ 增**快照列表行** ∥ 待批裁定行补「先下发节点闸再回填 DNS 闸持答」∥ settings 行增两键（`maxBoxesPerRunner` ∥ `workspaceRoot`）。**产品码零触（设计轮）**。
- 2026-10-13（**sandbox-exec-rebuild 批 · 设计评审轮 1 修复（fix 轮）· eng-designer**——承批档 §3 轮次 1（评审 #91 之 2）：§2.5 动作行「未绑定工作区 ⇒ 503（待人放）」⇒ **人话两因分列句**（因一「先放置」= 未绑 ∥ 因二「待人放」= 无候选——单源 503 保持；同源随动 = `sandbox/EXECUTION.md` §3/§7）。**零新语义（人话因分列）；产品码零触（设计轮）。**
- 2026-10-14（**member-face-chat 批 · 词表批外两处收正（fix 轮）· eng-designer**——承批档 `docs/batches/2026-10-13-member-face-chat.md` §2「收口前设计回笔」披露（父侧路由——本轮回笔）：§2.12 帧词表句随正（本面增补 = `begin` 帧 + `end.status/reason` 新值 `box_lost`（server 合成）+ 盒自产扩展四值 `save_failed`/`busy`/`not_found`/`internal`——补登四扩展值）。**零新语义**（词表随正——单源 = `agent/MEMBER-AGENT.md` §3.4）；产品码零触。
