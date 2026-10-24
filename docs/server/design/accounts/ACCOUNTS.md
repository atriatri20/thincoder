# Thincoder Server · 账号与登录（accounts/ACCOUNTS）

> 板块 = server ∥ 本档 = accounts 域（团队 key ∥ 账号/成员 ∥ 会话/登录 ∥ 密码 scrypt/改密/重置）；板总览 = `PROJECT.md`（文档地图 = §3）。
> 需求单源 = `docs/server/requirements/PROJECT.md`（功能点 1 ∥ 5 ∥ 7 ∥ 15④）；本域回指 = `PROJECT.md` §7（AC-1 ∥ AC-5 ∥ AC-7 ∥ AC-15④ 判据 = 本档 §5）。

## 1. 团队 key 面

- 形态：`sk-tc-` + 32 字节随机（base64url，43 字符）；签发 = **明文回显仅一次**（页面 ∥ CLI 同语义；此后任何接口/列表只回显提示形 `sk-tc-ab12cd…wxyz`）。
- 存储：`sha256(明文)` hex 单列唯一索引；**常规 key 库内无明文**；**服务端自持面**（现唯一 = 管理面 sk `admin-agent`）明文另落 `api_keys.key_plain`（NULL = 常规；写面唯一 = `issueKey({ keepPlain: true })`；DDL = `store/STORE.md` §2 v19 段）。
- 签发 ∥ 吊销：页面（**自助签发 §1.1 ∥ 自助逐把吊销 §1.1** ∥ admin 吊销 §3）与本机 CLI（`ops/OPS.md` §3）——同库同语义；吊销 = `status` 置 `revoked`（软删、行保留）；签发 = 新行（**多把并存**——一人多把；轮转 = 新签 + 吊销旧——**页面不再露出**，端点保留 = API 兼容不变量（§1.1）；不做同 key 换 hash）。
- 校验：每请求查库（唯一索引查找——无内存缓存）⇒ **吊销下一次请求即 401**（AC-5 结构性成立）——KD-SV-11（§6）。
- **客户端登录签发路径**：客户端面登录（`POST /api/client/login`）签发 = **一枚具名 key**（本表 §1 面全量适用——hash 存储 ∥ 逐请求查库 ∥ 软删吊销 ∥ 多把并存）；端标签落 `name`（trim ≤40；空 ⇒ 默认名助手——§1.1）；**不设过期**（本表天然）∥ **不受 20 上限**（服务端签发面不判上限——沿「轮转 ∥ CLI 不受限」先例）；
  退出 = 吊销该枚；
  审计型沿用（`login_success`/`login_failure` + `key_issue`/`key_revoke`/`key_rotate`——detail 携 `surface:"client"`）。机制全文 = `client/CLIENT.md` §1/§5（KD-SV-61）。
- **沙盒工作区 key**：工作区创建 ⇒ 签发一枚具名 key（`api_keys` 行——名 `sandbox:<workspace>`；归属 = 工作区负责人）；**不判 20 上限**（沿客户端登录 ∥ CLI 先例）；明文另存控制面（`sandbox_workspaces.key_plain`——盒重建再注入；披露 = `sandbox/SANDBOX.md` §10-D2）；轮换 = 吊销 + 签发（本表 §1 面全量适用）；机制全文 = `sandbox/SANDBOX.md` §7。
- **管理面 sk**：管理会话的模型出口经本 server 网关链回环 ⇒ 凭据 = 一枚 sk——名 `admin-agent`（常量恒定）、**主体 = 本回合发送者**（登录成员——谁用谁，用户裁；唤醒/续跑轮随最近发送者、主人兜底）；
  登录 ensure = `POST /api/login` 成功 ∧ `role = "admin"` ⇒ `ensureAgentKey`（幂等：在册 ⇒ 复用零重签；非 admin 零动作；路由后置钩子）；
  不判 20 上限（服务端签发面——沿客户端登录 ∥ CLI 先例）；明文另落 `api_keys.key_plain`（**服务端即消费方**——写面唯一 = `issueKey({ keepPlain: true })`；DDL = `store/STORE.md` §2 v19 段）；
  审计 = 首发一条 `key_issue`（detail 携 `surface:"admin_agent"`——§2.1）；轮转（`POST /api/me/keys/rotate`）连带吊销 ⇒ 下次登录补发。机制全文 = `agent/ADMIN-AGENT.md` §16.3；用例 = 其 §8 N77。

### 1.1 key 自助面（功能点 25——多把并存 ∥ 命名 ∥ 逐把吊销）

- **语义**：成员自助签发任意把（加一把——不动旧把）∥ 逐把吊销本人指定 key；**所有权校验**在服务端（他人 key ⇒ 404——与「不存在」不区分，防枚举；沿 admin 吊销先例）。
- **命名**：签发可携名（`{name?}`）；trim 后空 ⇒ **默认名 `key-N`**（N = 该成员签发序号——含吊销行，单调不复用；**落库**——显示稳定 ∥ 吊销/新增不重排）；上限 = **40 字符**（trim 后；超长 ∥ 非字符串 ⇒ 400 `invalid_request_error`）；**重名允许**（名称 = 标签非标识——寻址仍按 `id`/提示形；唯一索引 = 零收益）。
- **命名落位（各创建路径）**：自助签发 ∥ 轮换端点新签 ∥ CLI `key issue`（无命名参数——在案）**共用同一默认名助手**——空名入参 ⇒ 同口径落 `key-N`；**库内空串 = 仅限迁移前存量行**（v8 回填后零残留——`store/STORE.md` §2 v8 段）。
- **上限（防滥用）**：每成员 **active key ≤ 20**（自助面判据）：签发前计数（`COUNT(*) … status='active'`）⇒ 已达 ⇒ 400 `invalid_request_error`（消息明示上限与处置）；计数与 INSERT 同同步段（无 await 间点——单写者 SQLite 下无竞态面）；**CLI `key issue` 不设限**（本机兜底面——操作者可控；在案）；轮转端点不受限（先吊销后签发 ⇒ 计数归 1）。
- **吊销语义**：立即生效（逐请求查库——KD-SV-11 不变）；幂等（已吊销 ⇒ 200——软删纪律，行保留）；吊销后 key 行离列表（仅列未吊销——KD-SV-16 口径不变；页面行消失 + flash）。
- **审计**：入既有两型（写作点 = §2.1 表：`key_issue` ∥ `key_revoke`——主体 = 本人）；**型面零增**（现行十七型——§2.1）。
- **数据面**：`api_keys.name`（v8 迁移——`store/STORE.md` §2/§3；存量行回填默认名）；`created_at` 既有（随行下发——§3 行形）。
- **端点**：`POST /api/me/keys/issue` ∥ `POST /api/me/keys/:keyId/revoke`（§3 表）；轮换端点 `POST /api/me/keys/rotate` = **保留**（既有单元测试档与审计型零动——页面露出面 = `webui/ME.md` §2.1）；其新签行 `name` = 默认名助手（空名入参——请求/响应形零改）。
- **边界**：不做改名 ∥ 不做 key 级有效期/过期 ∥ 不做删除行（软删纪律）∥ CLI 命名参数（后续如需——在案）。

## 2. 账号与会话（B 案）

- **成员表扩列**（DDL = `store/STORE.md` §2）：`username`（登录名——唯一）∥ `password_hash`（scrypt 编码串——KD-SV-13）∥ `role`（`admin` ∥ `user`——缺省 `user`）；`name` 仍为展示名（创建缺省 = username）。
- **寻址口径**：登录用 `username` ∥ API 用 `id` ∥ CLI 用 `name`（沿既有）。
- **会话形**（KD-SV-12）：登录签发令牌（32 字节随机 base64url）；库存 `sha256(令牌)`（`sessions` 表——无明文）；cookie `tc_session=<令牌>`（`HttpOnly; SameSite=Strict; Path=/; Max-Age=604800`——7 天绝对过期 ∥ 不滑动）；同人可多会话（每登录一行）。
- **会话校验**：逐请求查库（无缓存——同团队 key 纪律）；登出 = 删行 + 清 cookie；过期行在登录时顺手清；HTTP 内网无 `Secure` 标记（边界 = 本档 §8 ∥ `ops/OPS.md` §5）。
- **密码规则**：最小长度 8（建成员 ∥ 改密 ∥ 重置统一校验）；长度不设上界（已审定：无 DoS 面）；改密 = 哈希替换（旧密即失效——无宽限）；登录失败不区分「用户不存在 ∥ 密码错」（措辞与耗时同——不存在用户照跑哑散列，防枚举）。
- **登录防护（防爆破）**：双维失败计数（**进程内存**——`thincoder-server/src/accounts/login-guard.mjs`（已落盘））——**用户名维**（提交值——无论是否存在）：连续失败 ≥5 次（窗 15 分钟）⇒ 锁 15 分钟；**IP 维**：失败 ≥20 次（同窗）⇒ 锁同。
- 锁定期内登录 ⇒ **429 `too_many_attempts`** + `Retry-After`（剩余秒）+ 固定文案（**两维同文案、与用户名存在性无关**——防枚举面保持；不跑散列——快速拒绝）；固定窗（锁期内重试不延长）。
- 口面 = `check` ∥ `recordFailure` ∥ `recordSuccess` ∥ `clearUsername`（时钟可注入——单元测试档）。
- **清计路径**：登录成功（清该用户名 + 该 IP） ∥ 自助改密（清本人用户名维） ∥ admin 重置（清目标用户名维——HTTP 面；本机 CLI 重置跨进程不达——残余 ≤ 锁窗，在案）。
- **重启 ⇒ 计数清零**（在案口径：在线爆破窗 = 分钟级；重启罕发——接受；离线撞库不在防线内）。
- **桶过期惰性清理**：读写路径顺扫过期条目（过期桶即删——无独立清扫面；重启清零同拍）。
- **客户端 IP 口径**：缺省 = 连接对端地址；`trustProxy: true`（`ops/OPS.md` §1）⇒ 读 `X-Real-IP`（前提 = 端口仅反代可达——`ops/OPS.md` §5.6）。
- **事件日志**：锁触发 ⇒ `login_throttled` 一行（`username` ∥ `ip` ∥ `dimension`（`username` ∥ `ip`） ∥ `retryAfterS`——密钥面零涉）；审计事件 `login_locked` 同拍（§2.1）。
- **首个 admin**：首启引导建（`ops/OPS.md` §2——幂等）；本档只管账号数据形。

### 2.1 审计事件（audit——功能点 15④）

- **形态**：事件落库（`audit_events` 表——`store/STORE.md` §2 v3 段）；写入口 = `thincoder-server/src/accounts/audit.mjs`（`recordAudit` ∥ `queryAudit` ∥ `pruneAuditEvents`）；保留 = 与用量同窗同清（`usageRetentionDays`；启动一次 + 24h 同调度点——`metering/METERING.md` §1）。
- **名快照**：`actor_name` ∥ `target_name` = 落库时点名（改名后记录仍可读；列无 FK——历史记录自足，不约束成员生命周期）。
- **CLI 口径**：本机操作（无会话）⇒ `actor_name = "cli"`（`actor_id` NULL）。
- **事件目录与写入点（逐点——既有函数/路由坐标）**：

| 类型 | 主体（actor） | 对象（target） | detail JSON | 写入点（现值坐标） |
|---|---|---|---|---|
| `login_success` | 登录者 username | —— | `{ ip, surface? }` | `thincoder-server/src/accounts/routes.mjs` POST /api/login 成功路径（`recordSuccess` 后） |
| `login_failure` | 提交用户名（成员存在 ⇒ 其 id） | —— | `{ ip, surface? }` | 同上——失败路径（`recordFailure` 侧） |
| `login_locked` | 提交用户名 | —— | `{ ip, dimension, retryAfterS }` | `thincoder-server/src/accounts/login-guard.mjs` 置锁处——经 `onLock` 回调（装配接线 = `thincoder-server/bin/thincoder-server.mjs` 建守卫处） |
| `key_rotate` | 本人 | —— | `{ keyHint, surface? }` | `thincoder-server/src/accounts/routes.mjs` POST /api/me/keys/rotate ∥ `thincoder-server/src/client/routes.mjs` POST /api/client/rotate |
| `key_issue` | 成员 ∥ `cli` | —— | `{ keyHint, surface? }` | `thincoder-server/src/accounts/routes.mjs` POST /api/me/keys/issue（本人） ∥ `thincoder-server/src/ops/cli.mjs` `key issue` ∥ `thincoder-server/src/accounts/routes.mjs` POST /api/login 后置 ensure（管理面 sk 首发） |
| `key_revoke` | 本人 ∥ admin ∥ `cli` | key 失主 | `{ keyHint, surface? }` | `thincoder-server/src/accounts/routes.mjs` POST /api/me/keys/:keyId/revoke（本人） ∥ `thincoder-server/src/accounts/routes-admin.mjs` 吊销路由 ∥ `thincoder-server/src/ops/cli.mjs` `key revoke` |
| `password_change` | 本人 | —— | —— | `thincoder-server/src/accounts/routes.mjs` POST /api/me/password |
| `password_reset` | admin ∥ `cli` | 目标成员 | —— | `thincoder-server/src/accounts/routes-admin.mjs` 重置路由 ∥ `thincoder-server/src/ops/cli.mjs` `member passwd` |
| `member_create` | admin ∥ `cli` | 新成员 | `{ role }` | `thincoder-server/src/accounts/routes-admin.mjs` 建成员路由 ∥ `thincoder-server/src/ops/cli.mjs` `member add` |
| `config_update` | admin（名快照） | ——（沙盒设置写点 target = `sandbox_settings`） | `{ keys }`（变更键名清单——值永不入） | `thincoder-server/src/gateway/config-admin.mjs`（已落盘）PATCH /api/admin/config 写盘成功后一条（失败 ⇒ warn——不反噬已落盘事实） ∥ `thincoder-server/src/sandbox/routes.mjs` PATCH /api/admin/sandbox/settings——**变更才落一条**（同值零行） |
| `sandbox_rule` | admin（名快照） | —— | `{ action, rule }`（规则增删原文——审计面所需） | **写入面 = 无**（零新写入；历史行原值可读） |
| `sandbox_event` | admin（名快照） ∥ 成员（成员写面行——随 KD-SV-156 裁定同拍） | —— | `{ kind, workspaceId?, kept?, removed? }`（盒起停拆 ∥ 节点添加/删除（含连通自检失败行；`runner_delete` 携 `kept`/`removed` 计数——`sandbox/SANDBOX.md` §3） ∥ 容器建/起/停/删（`container_*`） ∥ **容器重启/强杀（`container_restart` ∥ `container_kill`——detail 键集 = `kind`+`runnerId`+`containerId`）** ∥ **镜像拉取/删除（`image_pull`——detail 键集 = `kind`+`runnerId`+`image`（解析后 `名:标签`）；`image_delete`——detail 键集 = `kind`+`runnerId`+`ref`+`force`）** ∥ 快照 ∥ **镜像源增/改/删**：`image_source_add` ∥ `image_source_update`（detail 键集 = `kind`+`sourceId`+`name`+`address`）∥ `image_source_delete`（detail 键集 = `kind`+`sourceId`+`name`） ∥ **卷删除**：`volume_delete`（detail 键集 = `kind`+`runnerId`+`volume`） ∥ **主机凭据设/撤**：`host_credential_set`（detail 键集 = `kind`+`runnerId`+`sshUser`+`authKind`——零秘密）∥ `host_credential_revoke`（detail 键集 = `kind`+`runnerId`） ∥ **成员写面动作行：detail 携 `by:"member"`**——**kind 非枚举，CHECK 零动**） ∥ **容器终端**：`terminal_open`（detail 键集 = `kind`+`runnerId`+`containerId`+`cols`+`rows`——就绪时值）∥ `terminal_close`（detail 键集 = `kind`+`runnerId`+`containerId`+`reason`+`durationMs`；`reason` 四值 = `client_close` ∥ `exec_exit` ∥ `error` ∥ `server_stop`）——**pty 内容零落库零日志**（零秘密面）；**kind 非枚举，CHECK 零动**） ∥ **底座可换**：`workspace_base`（detail 键集 = `kind`+`workspaceId`+`baseImage`（标准 ⇒ null））∥ `image_derive`（detail 键集 = `kind`+`runnerId`+`workspaceId`+`base`+`tag`+`cached`+`pulled`——**仅实构才落**（缓存命中 ∥ 失败不落））∥ `registry_credential_set`（detail 键集 = `kind`+`host`+`username`——**零秘密**）∥ `registry_credential_revoke`（detail 键集 = `kind`+`host`） ∥ **连接面 TLS 档**：`runner_connection`（detail 键集 = `kind`+`runnerId`+`address`+`tls` 布尔——设/改/关（含材料清零）；零秘密）；同时 `image_pull` detail 增 `auth` 布尔键（携凭据拉取 ⇒ true）+ `runner_add` detail 增 `tls` 布尔键；**kind 非枚举，CHECK 零动**） | `thincoder-server/src/sandbox/registry.mjs` ∥ `thincoder-server/src/sandbox/box.mjs`（已落——执行面：工作区/盒/快照面） ∥ `thincoder-server/src/sandbox/routes.mjs`（节点面——§2.5 动作处） ∥ `thincoder-server/src/sandbox/container-routes.mjs`（容器面——§2.5） ∥ `thincoder-server/src/sandbox/image-routes.mjs`（已落——镜像族——§2.5） ∥ `thincoder-server/src/sandbox/image-source-routes.mjs`（已落——镜像源——§2.5） ∥ `thincoder-server/src/sandbox/volume-routes.mjs`（已落——卷族——§2.5） ∥ `thincoder-server/src/sandbox/hosts.mjs`（已落——主机凭据面——§2.5） ∥ `thincoder-server/src/sandbox/derive.mjs`（已落——派生构建——§8） ∥ `thincoder-server/src/sandbox/registry-cred-routes.mjs`（已落——私有仓凭据——§2.5） ∥ `thincoder-server/src/sandbox/workspace-routes.mjs`（已落——工作区面（含底座绑定 PATCH）——§2.5） ∥ `thincoder-server/src/sandbox/terminal-routes.mjs`（已落——容器终端升级路——§2.5/§3） ∥ `thincoder-server/src/sandbox/docker-tls.mjs`（已落——连接面 TLS：材料存取/连接元数据/审计——§3） |
  **执行面增补**：工作区面 `workspace_create` ∥ `workspace_limits` ∥ `workspace_destroy`（detail 键集 = `kind`+`workspaceId`+`volumeDeleted`）。
  盒面 `box_start`/`box_stop`/`box_destroy`（+ `stopReason`） ∥ 快照 `checkpoint`（+ `checkpointId`/`size`） ∥ `checkpoint_fail`。
  **配额一件**：`quota_apply_failed`（detail 键集 = `kind`+`workspaceId`+`reason`）——写入点 = `src/sandbox/box.mjs`（已落） ∥ `src/sandbox/quota.mjs`（已落）；`egress_apply_failed` 随出站闸退场删。
  **配额自愈一件**：`quota_recovered`（detail 键集 = `kind`+`workspaceId`+`runnerId`+`recovery`+`path`；`recovery` 三值 = `reconnect` ∥ `rebuild` ∥ `demote`；**健康径零行**——写入点 = `src/sandbox/box.mjs` `stepQuota`（**成功返回 ∥ 重建/重接后下游失败两径皆落**——不因后续失败丢痕）；机制 = `sandbox/EXECUTION.md` §4）。
  **放置失败：`placement_failed`**（detail 键集 = `kind`+`workspaceId`+`runnerId`+`reason`（截 300 字）；写入点 = `src/sandbox/box.mjs` 补放置 catch（`placePendingWorkspaces`——逐工作区失败一条）；与 `_failed` 族同形）。
  **建盒步级失败：`box_step_failed`**（detail 键集 = `kind`+`workspaceId`+`runnerId`+`step`+`reason`（截 300 字）；写入点 = `src/sandbox/box.mjs` `createWorkspaceBox` 链级 catch——
  **步集 = ① 卷目录准备 ∥ ② 配额就位（专用 kind `quota_apply_failed` 优先，本 kind 不叠行） ∥ ④ 镜像就位 ∥ ⑤ 网络 ∥ ⑥ 容器 ∥ ⑦ 启动**（另含 ③ 镜像就位/重建两径同族步名）；链前置形错（`workspacePathOf` 抛在链前）归 ①；抛出的错误原样透传（响应人话零变）；与 `_failed` 族同形）。
| `agent_event` | admin（名快照） | 会话（`chat:<id>` 可读形；无对象 ⇒ 空串） | `{ kind, chatId, tool?, call?, subject?, resultCode?, truncated?, summary?, reason? }`（管理面 agent 会话——三 kind：`chat_start`（会话创建）∥ `chat_call`（每工具调用——工具名 ∥ 调用摘要 ∥ 主语原文（`subject`——环境工具面：`bash` = 命令原文、读文件 = 路径；≤2000 字） ∥ 结果码 ∥ 结果可见形截断位（`truncated`） ∥ 摘要；**读动作同落行**；秘密掩蔽后）∥ `chat_stop`（异常收尾：预算超限 ∥ 模型错误 ∥ 空回合 ∥ 重启中断 ∥ 手动中止）；正常回合终 = 无附加行——`agent/ADMIN-AGENT.md` §11） | `thincoder-server/src/agent/chat-routes.mjs`（已落——会话创建/重启收尾） ∥ `thincoder-server/src/agent/chat.mjs`（逐调用/异常收尾——chat 驱动） |
| `project_event` | admin（名快照；定时同步 actor = `scheduler` ∥ 事件触发同步 actor = `webhook`——后两者无 actorId） | 项目（`project:<id>` 可读形；源类事件无项目对象 ⇒ 空串） | `{ kind, … }`（团队项目与权限——**十一 kind**：源面五（`source_add`（detail = sourceId/name/platform） ∥ `source_update`（+ keys——变更键名） ∥ `source_delete` ∥ `source_sync`（+ trigger（manual∥schedule∥event）/counts/ok/errorKind?） ∥ `source_check`（+ ok/errorKind?）——**token ∥ hookSecret 值零入**（两键只记「已替换」）） ∥ 项目面三（`project_add`（+ projectId/displayName/sourceId∥null） ∥ `project_update`（+ keys/values——displayName/address/owner 新值） ∥ `project_delete`（+ projectId/displayName/address/memberCount）） ∥ 成员面三（`member_add` ∥ `member_update` ∥ `member_remove`（+ projectId/username/level））；机制 = `project/PROJECTS.md` §5/§13/§14） | `thincoder-server/src/project/admin-routes.mjs`（已落——源/项目/加仓面） ∥ `thincoder-server/src/project/routes.mjs`（已落——成员/项目改面） ∥ `thincoder-server/src/project/sync.mjs`（已落——定时同步/体检——actor = `scheduler`） ∥ `thincoder-server/src/project/webhooks.mjs`（已落——事件触发——actor = `webhook`） |
| `ledger_event` | 成员（写者本人——admin ∥ user 皆可；两面同型） | 台账（`ledger:<id>` 可读形） | `{ kind, id, repo, surface }`（团队台账——**四 kind**：`create` ∥ `edit` ∥ `close` ∥ `withdraw`；`surface` = `console` ∥ `client`——两面写入可辨；机制 = `ledger/LEDGER.md` §7） | `thincoder-server/src/ledger/items.mjs` ∥ `thincoder-server/src/ledger/routes.mjs`（控制台面） ∥ `thincoder-server/src/ledger/client-routes.mjs`（端侧面） |
| `member_event` | 成员（会话归属本人；名快照） | 会话（`session:<盒内槽号>` 可读形；`pull` 行 = 工作区 `workspace:<id>` 可读形；`credential_*` 行 = `host:<主机>`） | `{ kind, host?, username?, sessionId?, tool?, resultCode?, summary?, reason?, projectId?, dir?, ok? }`（成员面——**六 kind**：`chat_start`（新建会话——盒内槽分配） ∥ `chat_call`（每工具调用——工具名 ∥ 结果码 ∥ 摘要；秘密掩蔽后） ∥ `chat_stop`（异常收尾——reason **八值** = 盒端 `end.reason` 直传七（`aborted` ∥ `budget` ∥ `model_error` ∥ `save_failed` ∥ `busy` ∥ `not_found` ∥ `internal`）+ server 合成 `box_lost`） ∥ `pull`（拉仓——detail 键集 = `kind`+`projectId`+`dir`+`ok`（失败另携 `reason`——实现 = `thincoder-server/src/agent/member-pull.mjs:74`）） ∥ `credential_set`（git 凭据绑定——detail 键集 = `kind`+`host`+`username`——**零秘密**） ∥ `credential_revoke`（撤销——detail 键集 = `kind`+`host`））；机制 = `agent/MEMBER-AGENT.md` §3.4/§3.6（会话住盒后 `chat_*` = 帧驱动；`pull`/凭据面 = 服务器侧动作）） | `thincoder-server/src/agent/member-routes.mjs`（已落） ∥ `thincoder-server/src/agent/member-relay.mjs`（已落——逐调用/异常收尾） ∥ `thincoder-server/src/agent/member-pull.mjs`（已落——拉仓） ∥ `thincoder-server/src/agent/member-cred.mjs`（已落——凭据绑/撤） |
| `mcp_event` | admin（名快照） | —— | `{ kind, id, name, … }`（MCP 服务器清单——**三 kind**：`server_add`（detail 键集 = kind+id+name+transport） ∥ `server_update`（+ `keys`——变更键名；值永不入） ∥ `server_remove`（detail 键集 = kind+id+name）；零秘密；机制 = `mcp/MCP.md` §5） | `thincoder-server/src/mcp/routes.mjs` |

- **型面现状（v24）**：**十七型**（上表十六型 + `mcp_event`；CHECK 扩型重建 = `store/STORE.md` §2 v11/v14/v17/v20/v23/v24 段；v22 段型面零动）。
   （chat 三 kind 走 `agent_event` ∥ project 十一 kind 走 `project_event` ∥ ledger 四 kind 走 `ledger_event` ∥ 成员面**六 kind** 走 `member_event`（会话四 + 凭据两） ∥ MCP 三 kind 走 `mcp_event`——kind 非枚举，CHECK 逐型扩。）

- **`surface` 字段**：上表五行（`login_success` ∥ `login_failure` ∥ `key_issue` ∥ `key_revoke` ∥ `key_rotate`）detail 列 `surface?` = 面机读位——取值域 = `"client"`（客户端面） ∥ `"admin_agent"`（管理面 sk 首发）；
  写入面 = `/api/client/login`（成 ∥ 败 ∥ 签发）∥ `/api/client/logout`（吊销）∥ `/api/client/rotate`（轮换）∥ `POST /api/login` 后置 ensure（`key_issue` 首发）四写点；
  **余各面（控制台 / 自助 / CLI / admin）该键缺席**（单源 = `client/CLIENT.md` §1 ∥ `agent/ADMIN-AGENT.md` §16.3）。

- **「成员删」= 零写入点**：全库零成员删除路径；审计面只覆盖「增」——需求措辞面（「成员增删」含删）另计（成员删除功能本身不在任何功能点内）。
- **列表**：`GET /api/audit`（admin——§3 端点表）；过滤 = 类型 ∥ 成员 ∥ 时段 ∥ **`containerId`**（沙盒容器——对 `detail.containerId` 逐值相等；**过滤先于 `limit` 截取**——本容器行不被他会话行挤掉；非 JSON 的 `detail` 行不入匹配）（`member` 取 id ∥ 展示名——解析同 usage 口径；匹配 `actor_id` ∥ `target_id`）。
- **边界**：不做告警推送 ∥ 不做事件导出 ∥ 不做不可篡改/防删面（库文件权限自担——内网工具面）；OpenAI 请求不入审计（= 用量面——`metering/METERING.md` §1）；**成员配置写（分模型覆盖 ∥ 模型禁用集）不入审计**（admin 成员管理动作——沿覆盖先例，该面零增）；被拒调用 = 网关行为（同口径）。

### 2.2 成员模型禁用（功能点 23③）

- **语义**：**默认全可用**；禁用 = 对该成员禁用某 chat 模型（对外标识粒度——别名 ∥ `provider/model`；KD-SV-59）——**服务端执行**（被禁模型调用 ⇒ 拒；控制台仅写配置）。可用性轴，与配额（用量限额轴）独立（关系判据见下）。
- **存储**：`members.model_disabled_json`（JSON 对象——键 = 对外标识；值 `true`；缺省 `{}`）；形/DDL = `store/STORE.md` §2 v6 段；随鉴权行携带（零查询——沿 `model_quotas_json` 口径）。
- **写面**：`POST /api/members/:id/model-disables`（admin——§3 端点表）：**键级合并** `{disables: {"<外标>": true|null}}`——`true` = 禁用 ∥ `null` = 删键（恢复）∥ 未出现键不动；键形校验（**与 `model-quotas` 同助手**——非空 ∥ **无首尾空白** ∥ 含斜杠时两段非空；**裸名 = 别名形合法**；首尾空白键 ⇒ 400——手写/curl 面可达无反馈面闭合）；
  值非 `true`/`null` ⇒ 400（库零变）；成员不存在 ⇒ 404。
- **读面**：`memberView` 增 `modelDisables`（map——`/api/me` ∥ `/api/members` 同源；控制台勾选态直读）。
- **执行面**（消费细节 = `gateway/API.md` §2.1）：派发命中后、配额准入前——随鉴权行（零查询）；被禁 ⇒ 404 `model_not_found`（消息明示「已对该成员禁用」——零新码）；`/v1/models` 随动滤除（输出 = 开放清单 − 调用者禁用集）；仅 chat（嵌入面零涉——沿配额/限流口径）。
- **与配额三级的关系（优先级判据）**：**禁用优先**——被禁 ⇒ 拒（404），不涉配额判定（零 SQL）；未禁 ⇒ 才走三级（覆盖 > 平台 > 不限）。两轴独立：禁用不触计数/记账（准入前拒打不落用量——既口径）；配额超额不改禁用态。
- **审计面**：禁用集变更不入审计（§2.1 边界）；被拒调用不入审计（= 用量面/网关行为）。
- **边界**：不做 CLI 设置面 ∥ 定时/条件禁用 ∥ 禁用统计面 ∥ 嵌入模型禁用（嵌入面零涉）；成员删除路径零改。

## 3. 端点表（`/api/*`——登录 ∥ 自助 ∥ 管理）

（错误形 = `gateway/API.md` §3；写端点仅收 `application/json`，其它 content-type ⇒ 400）

| 方法 + 路径 | 鉴权/角色 | 语义 |
|---|---|---|
| `POST /api/login` | 公开 | 登入：`{username, password}` ⇒ 200 + `Set-Cookie`（会话）；失败 ⇒ 401 `invalid_credentials`；锁定期 ⇒ **429 `too_many_attempts`** + `Retry-After`（两维同文案——防枚举面保持，§2）；**admin 角色另确保管理面 sk 在册**（`ensureAgentKey`——幂等；首发一条 `key_issue`（`surface:"admin_agent"`）；§1） |
| `POST /api/logout` | 会话 | 销当前会话（删行 + 清 cookie） |
| `GET /api/me` | 会话 | 本人信息（`id ∥ name ∥ username ∥ role ∥ modelQuotas ∥ modelUsage ∥ modelDisables ∥ usedTokens`——覆盖 map（键 = 对外标识；额度口径 = `metering/METERING.md` §2）∥ 逐模型已用 map（当月——`metering/METERING.md` §2.3）∥ 禁用集 map（§2.2））+ 本人 key 清单（行形 = `memberView`：`{ id, name, hint, createdAt, lastUsedAt, windowTokens }`——名称 ∥ 提示形 + id ∥ 签发时间 ∥ 最后使用 ∥ 近 30 天用量；仅未吊销） |
| `POST /api/me/password` | 会话 | 自助改密：`{oldPassword, newPassword}`；旧密错 ⇒ 401 `invalid_credentials`；成功 ⇒ 吊销本人其他会话（当前保留） |
| `POST /api/me/keys/rotate` | 会话 | 轮转本人 key：新签 + 吊销旧（**全换**——无旧 ⇒ 等同首签）；新明文一次性回显（同 §1 语义）；**页面不再露出**（多把并存下「全换」页面下架；端点 = API 兼容不变量——请求/响应形零改；新签行 `name` = 默认名助手（§1.1）） |
| `POST /api/me/keys/issue` | 会话 | 自助签发一把新 key：`{name?}`（名称可空——trim 空 ⇒ 默认 `key-N`；≤40 字符 ∥ 非字符串 ⇒ 400 `invalid_request_error`）⇒ 200 `{id, name, hint, plain}`（明文一次性——同 §1 语义；**旧 key 照常可用**——多把并存）；active ≥20 ⇒ 400（消息明示上限）；命名/上限全文 = §1.1 |
| `POST /api/me/keys/:keyId/revoke` | 会话 | 自助吊销本人指定 key（立即生效——逐请求查库）；key 不存在 ∥ 不属本人 ⇒ **404 `not_found`**（两况不区分——防枚举）；已吊销 ⇒ 幂等 200；返回 `{ok, id, status:"revoked"}` |
| `GET /api/members` | admin | 全队成员 + 分模型覆盖 + 逐模型已用 + 禁用集 + 本月已用 + 各成员 key 清单（行形同 `GET /api/me`——单源 = `memberView`：名称 ∥ 提示形 + id ∥ `createdAt` ∥ `lastUsedAt` ∥ `windowTokens`；仅列未吊销） |
| `POST /api/members` | admin | 建成员：`{username, name?, role?}` ⇒ 一次性临时密码回显（服务器生成——同签发语义） |
| `POST /api/members/:id/keys/:keyId/revoke` | admin | 吊销指定 key（立即生效） |
| `POST /api/members/:id/password-reset` | admin | 重置密码（KD-SV-14——在）：一次性临时密码回显 + 吊销该成员全部会话；旧密即失效（首登后应自助改密——页面提示，不强制门） |
| `POST /api/members/:id/model-disables` | admin | 设成员模型禁用集（键级合并）：`{disables: {"<对外标识（别名 ∥ provider/model）>": true|null}}`——`true` = 禁用 ∥ `null` = 删键（恢复可用）；未出现键不动；键形校验（非空 ∥ 无首尾空白 ∥ 含斜杠时两段非空（裸名 = 别名形合法）——与 `model-quotas` 同助手）∥ 值非 `true`/`null` ⇒ 400（库零变）∥ 成员不存在 ⇒ 404；返回 `{id, modelDisables}`（机制全文 = §2.2） |
| `GET /api/audit` | admin | 审计事件列表（过滤：type ∥ member ∥ from ∥ to ∥ **containerId** ∥ limit——缺省 100 ∥ 上限 500，沿用量口径；`containerId` = 沙盒容器过滤（`detail.containerId` 逐值相等——服务端先过滤后截取）；返回 `{ events: [ { id, ts, type, actor, actorId, target, targetId, detail } ] }`（倒序——新在前；`detail` = 解码对象；类型枚举 = §2.1） |

- 用量与配额端点（`/api/me/usage` ∥ `/api/usage` ∥ `/api/members/:id/model-quotas`）= `metering/METERING.md` §3。
- 成员行三 map（`modelQuotas` ∥ `modelUsage` ∥ `modelDisables`）键 = 对外标识（别名 ∥ `provider/model`）——读面回映射随别名即改（`metering/METERING.md` §2.3 ∥ §4 AC-29④ 行）。
- provider 管理端点（`/api/admin/providers/*`）= `gateway/API.md` §2.2——判权同本表口径（`requireAdmin`：`user` ⇒ 403 ∥ 无/过期会话 ⇒ 401；写端点 JSON 型门同前言）。
- 客户端面端点（`/api/client/*`——login ∥ logout ∥ rotate ∥ me；鉴权 = 登录 token（`Authorization: Bearer`——与 /v1 同校验单源））= `client/CLIENT.md` §2（token 即本表 key 面——§1 客户端登录签发路径条）。
- **双角色规则**：角色判定与写权限强制在服务端（页面显隐非判据）；`user` 触管理端点 ⇒ 403 `forbidden`；admin 兼有自助面；无 ∥ 过期会话 ⇒ 401 `unauthorized`。
- **跨站防护**：`SameSite=Strict`（跨站不携 cookie）+ 写端点仅 JSON + 无 CORS 放行头。

## 4. 本域文件与行数预算（本域族行）

| 档 | 行数（实读——设计估） | 职责 |
|---|---|---|
| `thincoder-server/src/accounts/keys.mjs`（已落盘） | **≈180** | key 校验 ∥ key 签发/吊销/轮转（页面与 CLI 共用） |
| `thincoder-server/src/accounts/members.mjs`（已落盘） | **241** | 成员 CRUD ∥ scrypt 散列/校验 ∥ 角色 ∥ 临时密码 ∥ 首启引导 |
| `thincoder-server/src/accounts/session.mjs`（已落盘） | **95** | 会话签发/校验/吊销 ∥ cookie 序列化/解析 ∥ 过期清理 |
| `thincoder-server/src/accounts/routes.mjs`（已落盘） | **≈160** | 自助端点：login ∥ logout ∥ me ∥ me/password ∥ me/keys/issue ∥ me/keys/:keyId/revoke ∥ me/keys/rotate |
| `thincoder-server/src/accounts/routes-admin.mjs`（已落盘） | **109** | 管理端点：members 列表/建 ∥ 吊销 ∥ 重置 ∥ 审计列表 |
| `thincoder-server/src/accounts/login-guard.mjs`（已落盘） | **≈125** | 登录防爆破 |
| `thincoder-server/src/accounts/audit.mjs`（已落盘） | **133** | 审计事件（§2.1） |
| **小计** | **≈966** | —— |

## 5. 验收判据（机检）

| 需求 AC | 设计级判据 | 载体 |
|---|---|---|
| AC-1（功能点 1） | 无 Authorization ∥ 未知 key ∥ 吊销 key ⇒ **401 + `invalid_api_key`**；持有效团队 key 经 mock 上游完成一次请求 ⇒ 200 | 单元测试档 |
| AC-5（功能点 5） | 吊销后**下一次请求** ⇒ 401（无缓存路径——查库即判） | 单元测试档 |
| AC-7（功能点 7——B 案） | ① 正确凭据登录 ⇒ 200 + 会话 cookie；错凭据（含不存在用户）⇒ 401 `invalid_credentials`（同措辞）② 无/过期会话访问 `/api/me` ∥ `/api/usage` ⇒ 401 `unauthorized` ③ `user` 会话调管理写（建成员 ∥ 配额（分模型覆盖） ∥ 吊销 ∥ 重置）⇒ 403 `forbidden`（服务端判）④ 自助改密 ⇒ 旧密登录失败 + 新密登录成功 + 本人其他会话失效（当前保留）⑤ admin 重置 ⇒ 旧密失效 + 临时密码可登（一次性回显——同签发语义）⑥ 自助轮换 ⇒ 新 key 通行 + 旧 key 下一请求 401 ⑦ 首启引导幂等（零 admin + 配置 ⇒ 建；再启动 ⇒ 不重建不改密——机制 = `ops/OPS.md` §2） | 单元测试档 |
| AC-13②（功能点 12——登录防爆破；已落需求档——`docs/server/requirements/PROJECT.md` 验收表） | 5 连败（同用户名）⇒ 第 6 次（含正确密码）⇒ 429 `too_many_attempts` + `Retry-After`（秒）；锁窗过后 ⇒ 正确密码 200；成功 ⇒ 清计；IP 维 20 阈值（`trustProxy` 下取 `X-Real-IP`）；不存在用户名同锁（枚举零差——措辞/计时面）；admin 重置 ⇒ 该用户名锁清（旧密 401、临时密码 200）；锁触发日志 `login_throttled` 在册 | 单元测试档 |
| AC-15④（功能点 15——审计/安全面；已落需求档——`docs/server/requirements/PROJECT.md` 验收表） | 事件落库（逐写入点实走 ⇒ 各型行在场：登录成/败/锁 ∥ 轮换/签发/吊销 ∥ 改密/重置 ∥ 建成员——含 CLI 面 `actor=cli`）∥ 列表过滤（类型 ∥ 成员 ∥ 时段逐轴生效）∥ 失败登录可见（N 连败 ⇒ `login_failure` 行 + 第 5 次起 `login_locked` 行）∥ 判权三态（user ⇒ 403 ∥ 无会话 ⇒ 401 ∥ admin 200）∥ 保留清理（注入时钟 ⇒ 窗外删——同窗接线） | 单元测试档 |
| AC-23（功能点 23③——成员模型禁用写/读面；已落需求档——`docs/server/requirements/PROJECT.md` 验收表） | 写面：`POST /api/members/:id/model-disables` 键级合并（`true` = 禁用 ∥ `null` = 删键 ∥ 未出现键不动）∥ 键形非法（空 ∥ 首尾空白 ∥ 含斜杠时空段）⇒ 400（裸名 = 别名形合法）∥ 值非 `true`/`null` ⇒ 400（库零变）∥ 不存在 ⇒ 404 ∥ 返回 `{id, modelDisables}` ∥ 判权三态（user ⇒ 403 ∥ 无会话 ⇒ 401 ∥ admin 200）；读面：`memberView` 新字段 `modelUsage`（当月逐模型已用——键 = 外标）∥ `modelDisables`——`/api/me` ∥ `/api/members` 同形；变更不入审计（十七型零增）；覆盖键形校验同拍（`model-quotas` 首尾空白键 ⇒ 400；裸名 = 别名形合法） | 单元测试档 |
| AC-29④（功能点 29——成员面随动：配额/禁用键；已落需求档——`docs/server/requirements/PROJECT.md` 验收表） | 写面键形 = 对外标识（配别名模型 ⇒ 别名形——裸名合法；首尾空白 ⇒ 400；含斜杠 ⇒ 两段非空）；`memberView` 三 map 键 = 对外标识；别名变更 ⇒ 键面当即随动（旧形键 = 离表键保留、不生效——无历史/迁移）；记账面判据 = `metering/METERING.md` §4 AC-29④ 行；用例 = §7 N35 | 单元测试档 |
| AC-25（功能点 25——key 多把并存/命名/自助签发/逐把吊销；已落需求档——`docs/server/requirements/PROJECT.md` 验收表） | 签发：`POST /api/me/keys/issue`（会话）——`{name?}` ⇒ 200 `{id,name,hint,plain}`（明文一次性；**旧 key 照常可用**——多把并存）；空名 ⇒ 默认 `key-N`（单调——含吊销行）；名 ≤40 字符（trim；超长/非字符串 ⇒ 400 `invalid_request_error`）；重名允许；active ≥20 ⇒ 400（消息明示上限——防滥用；CLI 不设限在案）∥ 吊销：`POST /api/me/keys/:keyId/revoke` ⇒ 200；**他人 key ⇒ 404 `not_found`**（不属本人与不存在不区分——防枚举）；已吊销 ⇒ 幂等 200；吊销即断（下一 `/v1` 请求 401——逐请求查库）∥ 行形：`/api/me` ∥ `/api/members` key 行 += `name`/`createdAt`（单源 = `memberView`；仅未吊销）∥ 审计：两型既有（`key_issue` ∥ `key_revoke`——主体 = 本人；十七型零增）∥ 判权：无会话 ⇒ 401；轮换端点保留（页面不再露出——兼容不变量）∥ 数据面：`api_keys.name`（v8 迁移——存量行回填默认名）∥ **空串零残留断点**（v8 回填后全部创建路径经默认名助手；空串仅限迁移前存量） | 单元测试档 |
| AC-31（功能点 31——三端登录 token 面；已落需求档——`docs/server/requirements/PROJECT.md` 验收表） | login ⇒ 200 携 token（`api_keys` 新行：name = 端标签 ∥ key_hash = sha256(token)）；错凭据 ⇒ 401 同措辞；锁定期 ⇒ 429 + `Retry-After`（沿双维锁——§2）；logout ⇒ 吊销即判（下一请求 401——无缓存）；token 兼用 `/v1/*` 与 `/api/client/*`；label ≤40（空 ⇒ 默认名 `key-N`）；签发不受 20 上限；审计两型沿用（十七型零增）；`sessions` 表零涉 | 单元测试档 |

## 6. 关键决策（本域）

| # | 决策 | 理由 |
|---|---|---|
| KD-SV-7 | **管理/自助面 = 登录制页面（会话 cookie + 角色分面：user 自助 ∥ admin 管理）+ 本机运维 CLI 兜底** | B 案（用户定）——管理页（受登录门禁）承载管理写面（建成员 ∥ 配额 ∥ 吊销 ∥ 重置）；会话与团队 key 两族鉴权物理分离（cookie ∥ Bearer）；CLI 降本机兜底但保留全能力（同库同语义） |
| KD-SV-11 | **团队 key 校验 = 逐请求查库（无缓存）** | 吊销即时生效（AC-5）零失效逻辑；单索引查询成本可忽略（团队量级） |
| KD-SV-12 | **会话形 = HttpOnly cookie**（`tc_session`；`SameSite=Strict`；7 天绝对过期）；`sessions` 表存 `sha256(令牌)`——逐请求查库（同 key 纪律） | 与团队 key 物理分族（`Authorization: Bearer` 只属 OpenAI 面）∥ 浏览器原生携带、页面零令牌存储（HttpOnly——JS 不可读）∥ `SameSite=Strict` + 写端点仅 JSON ⇒ 免 CSRF 令牌 |
| KD-SV-13 | **密码散列 = scrypt**（`node:crypto`；N=16384 ∥ r=8 ∥ p=1 ∥ keyLen=32 ∥ salt 16B 随机；异步变体）；编码串 `scrypt$N$r$p$salt$hash`（自描述——参数可升）；校验 `timingSafeEqual`；密码最小长度 8 | 零依赖（node 内建）∥ 慢因子抗离线爆破 ∥ 异步变体不阻塞事件循环（同进程中继不抖动）∥ 自描述编码串免参数考古 |
| KD-SV-14 | **admin 重置成员密码 = 在**（用户定）；语义 = 服务器生成**一次性临时密码**（回显一次——同签发语义）+ 吊销该成员全部会话；首登后应自助改密（页面提示——不设强制门） | 忘密唯一兜底（找回 = 不做项——无外部通道）∥ 一次性临时密码 = 管理侧零知情（admin 不见成员自设密码）∥ 与 key 签发同语义——两族凭证一致 |
| KD-SV-16 | **管理面 key 枚举 = `GET /api/members` 成员行内附清单**（提示形 + id；仅列未吊销）——不设 `/api/members/:id/keys` 子资源 | 管理页一次装配（成员表 + 吊销控件同响应——vanilla 前端一跳）；与 `GET /api/me`「本人信息 + key 清单」同形；端点面零增 |
| KD-SV-21 | **登录防爆破 = 双维内存锁**（用户名维 5 次 ∥ IP 维 20 次——窗/锁各 15 分钟；任一中锁 ⇒ 429 `too_many_attempts` + `Retry-After`；两维同文案——防枚举面保持；成功/改密/重置清计；重启清零（在案））；IP 口径 = 对端地址 ∥ `trustProxy: true` 读 `X-Real-IP` | 内网面在线爆破防护（分钟级窗）；内存 = 零表零写（登录热路径不落库）∥ 双维 = 兼顾定向与喷洒；快速拒绝（429）优于服务端 sleep（挂连接/事件循环面）；固定窗不升级（升档留后续） |
| KD-SV-28 | **审计事件 = 库表（v3）+ 名快照 + 与用量同保留窗**：`audit_events`（CHECK 枚举——现行 = 十七型）；写入口 = `thincoder-server/src/accounts/audit.mjs`（`recordAudit` 由调用侧显式传型/主体——HTTP 路由与 CLI 同覆盖）；列表 = `GET /api/audit`（admin——过滤三轴）；清理复用 `usageRetentionDays` 与调度点 | 浏览器可读（审计页）+ 过滤 ∥ 库表 = 与全系统同库单源；快照名 = 改名后记录仍自足（列无 FK——不约束成员生命周期）；同窗单旋钮 = 保留治理一处配置；CLI 覆盖 = 本机改动也入审计（单点漏检面） |
| KD-SV-42 | **成员模型禁用 = 默认全可用 + 勾选即禁用（即时写）+ 存储 `members.model_disabled_json`（JSON map——沿覆盖列口径）+ 派发命中后/配额前执行（404 `model_not_found`——消息明示）+ `/v1/models` 随动滤除**：写面 = 键级合并 `POST model-disables`（`true`/`null`）；检查 = 随鉴权行零查询；**禁用优先于配额**（可用性 ≠ 用量限额——两轴独立）；审计零增（沿覆盖先例）；仅 chat（嵌入面零涉） | 需求 §2:23③（用户走查「默认可用、勾选即禁用」——机制选择为设计裁定）；沿 `model_quotas_json` 先例（JSON 列随鉴权行——零新表零新查询）；错误形零新码（沿「未开放 ⇒ 404」选择性中继口径——列表/派发两面同判）；即时写 = 布尔勾选（沿吊销在窗「即点即效」先例；额度输入仍草稿+保存——值面校验/误触面） |
| KD-SV-48 | **key 自助面 = 多把并存（签发 + 逐把吊销）+ 命名 + 上限**：端点 = `POST /api/me/keys/issue` ∥ `POST /api/me/keys/:keyId/revoke`（会话面——判权本人）；命名 = 可空 ⇒ 默认 `key-N`（**落库**——单调不复用）∥ ≤40 字符 ∥ 重名允许（名称 = 标签；寻址 = id/提示形）；上限 = active ≤20（自助面判据；超 ⇒ 400 明示；CLI 免——本机兜底）；他人 key ⇒ 404（不区分——防枚举，沿 admin 先例）；审计 = 既有两型（主体 = 本人；十七型零增）；轮换端点保留（页面下架——API 契约零动）；存储 = `api_keys.name`（v8） | 需求 §2:25（用户——「一个用户可能会有多个Key」硬需求）；沿 admin 吊销先例（404 口径 ∥ 幂等）；默认名落库 = 显示稳定（吊销/新增不重排）；名称 = 标签非标识（唯一索引无收益） |

## 7. 用例（本域）

| # | 类 | 输入 | 预期输出 |
|---|---|---|---|
| N5 | 正常 | admin 会话 + `GET /api/members` | 200；无/过期会话 ⇒ 401 `unauthorized`；`GET /` 公开 200（页面壳——零数据） |
| N6 | 正常 | 正确 `username` + `password` → `POST /api/login`，随后携 cookie `GET /api/me` | 200 + `Set-Cookie`；`/api/me` 200（本人信息 + key 提示形） |
| N7 | 正常 | 会话 + `POST /api/me/password`（旧密正确） | 200；旧密再登录 401；新密可登录；本人其他会话 401（当前保留） |
| N8 | 正常 | 会话 + `POST /api/me/keys/rotate` | 新明文一次性回显；旧 key 下一 `/v1` 请求 401；新 key 通行 |
| N9 | 正常 | admin 会话：`POST /api/members` + 设配额（`metering/METERING.md` §3） | 新成员初始密码一次性回显；该成员可登录；配额对 `/v1` 生效（429 口径 = AC-4） |
| N10 | 正常 | admin 会话 + `POST /api/members/:id/password-reset` | 200 + 临时密码一次性回显；该成员旧密登录 401；临时密码可登录；其会话全部失效 |
| N11 | 正常 | admin 会话 + `GET /api/members`（取成员行内 key id）→ `POST /api/members/:id/keys/:keyId/revoke` | 200；该 key 下一 `/v1` 请求 401（吊销即扫——无缓存路径）；成员行 key 清单不再含该 key |
| B8 | 边界 | 改密时旧密码错误 | 401 `invalid_credentials`；原密码 ∥ 全部会话不变 |
| E8 | 错误 | 无/过期会话访问 `/api/me` ∥ `/api/usage` | 401 `unauthorized` |
| E9 | 错误 | `user` 会话调管理写（`POST /api/members` ∥ 配额 ∥ 吊销 ∥ 重置） | 403 `forbidden`（服务端拒——页面隐藏非判据） |
| E10 | 错误 | 错误密码 ∥ 不存在用户登录 | 401 `invalid_credentials`（两况同措辞——防枚举） |
| N22 | 正常 | 同用户名 5 连败 ⇒ 第 6 次（正确密码） | 429 `too_many_attempts` + `Retry-After`；日志 `login_throttled` |
| N23 | 正常 | 锁窗过后（时钟注入）正确密码登录 | 200 + 会话；计数清零 |
| N24 | 正常 | admin 重置（HTTP）后该成员登录 | 锁清——临时密码 200（旧密 401） |
| B18 | 边界 | 锁定期内重复尝试 | 429 同文案；`Retry-After` 递减；锁不延长（固定窗） |
| B19 | 边界 | 不存在用户名 5 连败 | 同锁同 429（与存在者零差——枚举面） |
| E20 | 错误 | 锁定期请求（任一门径） | 429 `too_many_attempts`；`Retry-After` 头在场 |
| N26 | 正常 | 走全事件链（登录成 ∥ 败 ∥ 5 连败锁 ∥ 轮换 ∥ 签发 ∥ 吊销 ∥ 改密 ∥ 重置 ∥ 建成员）⇒ `GET /api/audit` | 各型行在场（时间 ∥ 类型 ∥ 主体 ∥ 对象 ∥ detail 逐值——ip/dimension/keyHint 归位） |
| B24 | 边界 | 失败登录（不存在用户名）∥ 锁触发 | `login_failure`（actor = 提交值 ∥ id NULL）∥ `login_locked`（dimension ∥ retryAfterS） |
| B25 | 边界 | CLI 面四命令（member add ∥ member passwd ∥ key issue ∥ key revoke） | 对应事件行（actor = `cli`） |
| E21 | 错误 | 无会话 ∥ user ⇒ `GET /api/audit`；`type`/`limit` 非法 | 401 `unauthorized` ∥ 403 `forbidden` ∥ 400 `invalid_request_error` |
| N28 | 正常 | 注入时钟：窗外一行 + 窗内一行 ⇒ `pruneAuditEvents` | 界外删、窗内留 |
| N29 | 正常 | admin 设禁用 `{disables:{"mock/mock-chat":true}}` ⇒ 该成员调 `mock/mock-chat` ∥ 他成员同调 | 404 `model_not_found`（消息含「已对该成员禁用」）；`/v1/models`（该成员）不含；他成员 200（不受累） |
| N30 | 正常 | `{disables:{"mock/mock-chat":null}}`（恢复）⇒ 下一请求 | 200；`/v1/models` 恢复含；即时生效（无缓存——写后下一请求） |
| B26 | 边界 | 禁用键不在服务清单（离表） ∥ 禁用后模型被停用再重开 | 键恒保留（与覆盖键同口径——重开即再禁）；行可读（map 面） |
| B27 | 边界 | 键形非法（`/m` ∥ `p/` ∥ `""` ∥ 首尾空白 `" mock/m"`） ∥ 裸名 `m`（别名形——合法） ∥ 值 `false`/`0`/`"x"` | 400 `invalid_request_error`；库零变 ∥ 裸名照收（别名形） |
| E22 | 错误 | `user` ∥ 无会话 ∥ 成员不存在 ⇒ 禁用端点 | 403 `forbidden` ∥ 401 `unauthorized` ∥ 404 `not_found` |
| N31 | 正常 | 会话 + `POST /api/me/keys/issue`（`{name:"笔记本"}`） | 200 `{id, name:"笔记本", hint, plain}`（明文一次性）；**旧 key 照常可用**（多把并存——verifyKey 命中）；审计 `key_issue`（actor = 本人） |
| N32 | 正常 | 会话 + `POST /api/me/keys/issue`（空体） | 200；`name` = 默认 `key-N`（该成员签发序号——含吊销行单调） |
| N33 | 正常 | 会话 + `POST /api/me/keys/:keyId/revoke`（本人 key） | 200；该 key 下一 `/v1` 请求 401；`/api/me` key 清单不再含；审计 `key_revoke`（actor = 本人）；重复调用 ⇒ 幂等 200 |
| B28 | 边界 | active = 20 时第 21 把签发 ∥ 吊销一把后再签 | 400 `invalid_request_error`（消息明示上限）∥ 吊销后 ⇒ 200 |
| B29 | 边界 | 名 41 字符 ∥ 两把同名 ∥ 名全空白 | 400 `invalid_request_error`；库零变 ∥ 200（重名允许） ∥ 200（默认名） |
| E23 | 错误 | A 会话吊销 B 的 key（B 的 keyId） ∥ 无会话 ∥ keyId 不存在 | 404 `not_found`（A 的操作零变——B key 仍 active） ∥ 401 `unauthorized` ∥ 404 `not_found` |
| N34 | 正常 | 走签发 + 自助吊销链 ⇒ `GET /api/audit` | `key_issue` ∥ `key_revoke` 行在场（actor = 本人 ∥ detail = keyHint；十七型零增——既有型复用） |
| N35 | 正常 | 模型配别名 `fast` ⇒ admin 设禁用 `{disables:{"fast":true}}` ⇒ 该成员调 `model=fast` ∥ 覆盖键同拍 `{quotas:{"fast":N}}` | 404（消息含「已对该成员禁用」）∥ 配额键 `fast` 生效（点查准入按真名对）——键即外标随动（KD-SV-59） |

## 8. 本域边界（不做的面）

- 组织架构同步 ∥ SSO ∥ 双因素 ∥ **密码找回**（需外部通道（邮件/短信）——「团队协同」步再议；**改密 = 在**——自助 ∥ admin 重置）。
- 密码复杂度策略（仅最小长度 8） ∥ 会话管理面（会话列表 ∥ 多端踢出——改密/重置吊销属被动机制） ∥ 登录防护不做：跨重启持久锁 ∥ IP 黑白名单/验证码 ∥ 改密/重置端点的失败限速（需已持会话——在案） ∥ 离线撞库（防线外）。
- 角色只两级（admin ∥ user——不做细粒度权限/自定义角色）。
- 审计面不做：告警推送 ∥ 事件导出 ∥ 不可篡改/防删面（库文件权限自担）；OpenAI 请求不入审计（= 用量面）。
- 成员模型禁用面不做：CLI 设置面 ∥ 定时/条件禁用 ∥ 禁用统计/看板 ∥ 嵌入模型禁用（嵌入面零涉——沿配额/限流口径）；审计零增（§2.1/§2.2）。
- key 自助面不做：改名 ∥ key 级有效期/过期 ∥ 删除行（软删纪律） ∥ 上限的 CLI 侧（本机兜底免——§1.1） ∥ 签发去向/设备标注（名称已足——面外） ∥ key 级用量明细面（= 网关归因面，已有）。
- 成员键别名面（KD-SV-59）：键存储 = 字符串（键 = 对外标识——别名随动、无迁移；旧形键 = 离表键恒保留）；不做键的历史/别名回写 ∥ 不做键的存在性/别名交叉校验（键形 = 形状面单源——无斜杠裸名归别名形）。
