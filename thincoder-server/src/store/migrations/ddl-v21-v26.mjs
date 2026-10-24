/**
 * ddl-v21-v26.mjs — 迁移链 v21–v26 的 DDL 常量（store/STORE.md §2 v21–v25 段逐字；自 `../migrations.mjs` 按版本区间逐字搬迁——零语义改动；
 * v26 = publicnet 批新增：审计 CHECK 重建十八型（+ `security_event`——gateway/PUBLICNET.md §2））。
 *
 * 唯一消费方 = `../migrations.mjs` 的 `MIGRATIONS` 序表；导出面 = `DDL_V21`…`DDL_V26`。
 */

/** v21 增段（`git_sources.scope_kind` 增列 + 存量回填——store/STORE.md §2 v21 段逐字；project 域——gitee-namespace-kinds 批 · 台账 #1365）。
 *  ① gitee 范围类型列（`personal` ∥ `org` ∥ `enterprise`——NULL 放行；非 gitee 恒 NULL）；
 *  ② 存量回填（仅 gitee——零猜测：scope 在场 ⇒ `'org'`（沿现行路由——组织零回归）∥ scope 空 ⇒ `'personal'`；非 gitee 行零动）。
 *  语义/机制 = `project/PROJECTS.md` §2/§4（KD-SV-151 单源）；判据 = `store/STORE.md` §3 v21 行。 */
export const DDL_V21 = `
-- ① gitee 范围类型（personal ∥ org ∥ enterprise——KD-SV-151；非 gitee/NULL = 不适用）
ALTER TABLE git_sources ADD COLUMN scope_kind TEXT CHECK (scope_kind IN ('personal','org','enterprise'));
-- ② 存量回填（仅 gitee——零猜测：scope 在场 ⇒ 'org'（沿现行路由）∥ scope 空 ⇒ 'personal'；非 gitee 零动）
UPDATE git_sources SET scope_kind = CASE WHEN scope IS NULL OR TRIM(scope) = '' THEN 'personal' ELSE 'org' END WHERE platform = 'gitee';
`

/** v22 收正段（`sandbox_workspaces` 表重建 + `registry_credentials` 建表 + `sandbox_tasks` 删表 + `sandbox_runners` 连接材料四列——
 *  store/STORE.md §2 v22 段逐字；sandbox 域——sandbox-exec-rebuild 批 · KD-SV-161/171/172 + 增补（底座可换/连接面 TLS））。
 *  ① 工作区表重建（去 `required_labels_json`——放置判据去标签；增 `stop_reason`（停因注记）∥ `base_image`（底座绑定，NULL = 标准镜像））；
 *  ② 存量行逐列拷贝 ⇒ DROP ⇒ RENAME（沿 v10/v12 表重建先例——无索引/无 FK 重建）；
 *  ③ `sandbox_tasks` 删表（队列退场——动作 = 请求内直调链）；④ `registry_credentials`（私有仓凭据——底座可换）；
 *  ⑤ `sandbox_runners` 连接材料四列（列级 ALTER——存量行 NULL，明文档零回填）。 */
export const DDL_V22 = `
-- ① sandbox_workspaces 表重建（列面 = v11 段所列减 required_labels_json + 增 stop_reason + 增 base_image——放置判据去标签；停因注记；底座绑定）
CREATE TABLE IF NOT EXISTS sandbox_workspaces_v22 (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  owner_member_id INTEGER NOT NULL REFERENCES members(id),
  key_id INTEGER NOT NULL REFERENCES api_keys(id),
  key_plain TEXT NOT NULL,
  runner_id INTEGER,
  limits_json TEXT NOT NULL DEFAULT '{}',
  stop_reason TEXT,                            -- 停因注记（idle_ttl/wallclock_ttl/manual；NULL = 未停）
  base_image TEXT,                             -- 底座绑定（归一引用「名:标签」；NULL = 标准镜像 settings.image——底座可换）
  created_at TEXT NOT NULL
);
-- ② 存量行拷贝（逐列映射）⇒ DROP ⇒ RENAME（无索引/无 FK 重建）
INSERT INTO sandbox_workspaces_v22 (id, name, owner_member_id, key_id, key_plain, runner_id, limits_json, stop_reason, base_image, created_at)
  SELECT id, name, owner_member_id, key_id, key_plain, runner_id, limits_json, NULL, NULL, created_at FROM sandbox_workspaces;
DROP TABLE sandbox_workspaces;
ALTER TABLE sandbox_workspaces_v22 RENAME TO sandbox_workspaces;

-- ③ sandbox_tasks 删表（指令队列退场——KD-SV-161）
DROP TABLE sandbox_tasks;

-- ④ 私有仓凭据表（sandbox 域——server 全局；底座可换：拉取/派生注入——KD-SV-188）
CREATE TABLE IF NOT EXISTS registry_credentials (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  host TEXT NOT NULL UNIQUE,                   -- 注册表主机（归一：小写；Hub 别名归 docker.io）
  username TEXT NOT NULL,
  secret_cipher TEXT NOT NULL,                 -- AES-256-GCM（credential-crypto.mjs；密列零回显）
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,                    -- 最后编辑时间（创建 = 创建时刻；编辑刷新——写面维护；父侧 2026-10-13 收正 · 可 revert）
  created_by INTEGER
);

-- ⑤ sandbox_runners 增连接材料四列（TLS 档——列级 ALTER = 表不重建；存量行 NULL = 明文档零回填；机制 = sandbox/SANDBOX.md §3 连接方式块）
ALTER TABLE sandbox_runners ADD COLUMN tls_ca TEXT;                    -- CA 证书 PEM（仅 TLS 档）
ALTER TABLE sandbox_runners ADD COLUMN tls_cert TEXT;                  -- 客户端证书 PEM（仅 TLS 档）
ALTER TABLE sandbox_runners ADD COLUMN tls_key_cipher TEXT;            -- 客户端私钥密文（AES-256-GCM——密列零回显；仅 TLS 档）
ALTER TABLE sandbox_runners ADD COLUMN tls_updated_at TEXT;            -- 材料更新时间（NULL = 未设）
`

/** v23 增段（成员 git 凭据表 + 审计 CHECK 再扩（十六型）——store/STORE.md §2 v23 段逐字；agent 域——member-face-chat 批 · 台账 #1215）。
 *  ① `member_git_credentials`（成员本人 git 凭据——拉取/推送共用；KD-SV-204；`(member_id, host)` 唯一；密列零回显）；
 *  ② 审计表重建（十五型 ⇒ 十六型：+ `member_event`——步序与 v10/v11/v14/v17/v20 同构；kind 非枚举——六 kind 归 `accounts/ACCOUNTS.md` §2.1）；
 *  ③ **会话两表不建**（题一裁定——会话真源在盒内；服务器零会话落库）。
 *  语义/机制 = `agent/MEMBER-AGENT.md` §3.6/§2 KD-SV-204；判据 = `store/STORE.md` §3 v23 行。 */
export const DDL_V23 = `
-- ① 成员 git 凭据表（成员本人凭据——拉取/推送共用；KD-SV-204；密列零回显）
CREATE TABLE IF NOT EXISTS member_git_credentials (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  member_id INTEGER NOT NULL,                  -- 归属（本人过滤键）
  host TEXT NOT NULL,                          -- 托管主机（归一：小写）
  username TEXT NOT NULL,
  secret_cipher TEXT NOT NULL,                 -- AES-256-GCM（credential-crypto.mjs；密列零回显）
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_member_git_credentials ON member_git_credentials(member_id, host);
-- ② audit_events 表重建（十五型 ⇒ 十六型：+ member_event——步序与 v10/v11/v14/v17/v20 同构）
--    kind 枚举（六 kind）：chat_start ∥ chat_call ∥ chat_stop ∥ pull ∥ credential_set ∥ credential_revoke（kind 非 CHECK 枚举——逐 kind 归 accounts/ACCOUNTS.md §2.1）
CREATE TABLE audit_events_v23 (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  ts          INTEGER NOT NULL,              -- unix ms（事件时刻）
  type        TEXT NOT NULL CHECK (type IN ('login_success','login_failure','login_locked',
    'key_rotate','key_issue','key_revoke','password_change','password_reset','member_create','config_update',
    'sandbox_rule','sandbox_event','agent_event','project_event','ledger_event','member_event')),
  actor_id    INTEGER,                       -- 行为人成员 id（无会话 ∥ 未知用户名 ⇒ NULL；无 FK——历史记录自足）
  actor_name  TEXT NOT NULL,                 -- 行为人名快照（用户名 ∥ 展示名 ∥ 'cli' ∥ 'scheduler' ∥ 'webhook'）
  target_id   INTEGER,                       -- 对象成员 id（无对象 ⇒ NULL）
  target_name TEXT NOT NULL DEFAULT '',      -- 对象名快照（无对象 ⇒ 空串；会话类事件 = 'session:<槽号>' 可读形）
  detail      TEXT NOT NULL DEFAULT '{}'     -- 附加形（JSON：kind ∥ sessionId ∥ host ∥ tool 等）
);
INSERT INTO audit_events_v23 (id, ts, type, actor_id, actor_name, target_id, target_name, detail)
  SELECT id, ts, type, actor_id, actor_name, target_id, target_name, detail FROM audit_events;
DROP TABLE audit_events;
ALTER TABLE audit_events_v23 RENAME TO audit_events;
CREATE INDEX IF NOT EXISTS idx_audit_ts ON audit_events(ts);
CREATE INDEX IF NOT EXISTS idx_audit_type_ts ON audit_events(type, ts);
`

/** v24 增段（`mcp_servers` 建表 + 审计 CHECK 再扩（十七型）——store/STORE.md §2 v24 段逐字；mcp 域——server-mcp 批 · 台账 #1379）。
 *  ① `mcp_servers`（server 全局单份清单——非逐用户；KD-SV-197；`name` 唯一 = 工具前缀源；`transport` 三值 CHECK；
 *  三传输列 = `command`/`args_json` ∥ `url` ∥ `ws_url`（互斥 = 应用层校验——读面 `mcp/store.mjs`）；`secret_cipher` 单密列（`{ token?, headers?, env? }` 合一）；
 *  ② 审计表重建（十六型 ⇒ 十七型：+ `mcp_event`——步序与 v10/v11/v14/v17/v20/v23 同构；kind 非枚举——三 kind 归 `accounts/ACCOUNTS.md` §2.1）；
 *  语义/机制 = `mcp/MCP.md` §3（KD-SV-197/198）；判据 = `store/STORE.md` §3 v24 行。 */
export const DDL_V24 = `
-- ① MCP 服务器清单表（server 全局单份——非逐用户；KD-SV-197）
CREATE TABLE IF NOT EXISTS mcp_servers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,                   -- 服务器名（工具前缀源——核 \`{server}_{tool}\`）
  transport TEXT NOT NULL CHECK (transport IN ('stdio','http','ws')),
  command TEXT,                                -- stdio：可执行（明文）
  args_json TEXT,                              -- stdio：参数数组（JSON string[]；明文——可含秘密，指引 = 设计档）
  url TEXT,                                    -- http：端点
  ws_url TEXT,                                 -- ws：端点
  secret_cipher TEXT,                          -- AES-256-GCM（credential-crypto.mjs；{ token?, headers?, env? } 合一；NULL = 零敏感字段；密列零回显）
  enabled INTEGER NOT NULL DEFAULT 1,          -- 启用位（0/1——沿 providers.proxy 先例）
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
-- ② audit_events 表重建（十六型 ⇒ 十七型：+ 'mcp_event'——步序与 v10/v11/v14/v17/v20/v23 同构）
--    kind 枚举（三 kind）：server_add ∥ server_update ∥ server_remove（kind 非 CHECK 枚举——逐 kind 归 accounts/ACCOUNTS.md §2.1）
CREATE TABLE audit_events_v24 (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  ts          INTEGER NOT NULL,              -- unix ms（事件时刻）
  type        TEXT NOT NULL CHECK (type IN ('login_success','login_failure','login_locked',
    'key_rotate','key_issue','key_revoke','password_change','password_reset','member_create','config_update',
    'sandbox_rule','sandbox_event','agent_event','project_event','ledger_event','member_event','mcp_event')),
  actor_id    INTEGER,                       -- 行为人成员 id（无会话 ∥ 未知用户名 ⇒ NULL；无 FK——历史记录自足）
  actor_name  TEXT NOT NULL,                 -- 行为人名快照（用户名 ∥ 展示名 ∥ 'cli' ∥ 'scheduler' ∥ 'webhook'）
  target_id   INTEGER,                       -- 对象成员 id（无对象 ⇒ NULL）
  target_name TEXT NOT NULL DEFAULT '',      -- 对象名快照（无对象 ⇒ 空串；会话类事件 = 'session:<槽号>' 可读形）
  detail      TEXT NOT NULL DEFAULT '{}'     -- 附加形（JSON：kind ∥ sessionId ∥ host ∥ tool 等）
);
INSERT INTO audit_events_v24 (id, ts, type, actor_id, actor_name, target_id, target_name, detail)
  SELECT id, ts, type, actor_id, actor_name, target_id, target_name, detail FROM audit_events;
DROP TABLE audit_events;
ALTER TABLE audit_events_v24 RENAME TO audit_events;
CREATE INDEX IF NOT EXISTS idx_audit_ts ON audit_events(ts);
CREATE INDEX IF NOT EXISTS idx_audit_type_ts ON audit_events(type, ts);
`

/** v25 增段（`agent_chats.auto_approve` 增列——审批卡面 `always` 槽；store/STORE.md §2 v25 段逐字；列级 ALTER = 表不重建；0 = 缺省（问）∥ 1 = 免问（`always` 置真 ∥ PATCH 可清）；语义 = agent/ADMIN-AGENT.md §11.5。 */
export const DDL_V25 = `ALTER TABLE agent_chats ADD COLUMN auto_approve INTEGER NOT NULL DEFAULT 0;`

/** v26 增段（审计 CHECK 再扩（十八型：+ `security_event`）——store/STORE.md §2 v26 段；accounts 域——publicnet 批 · 台账 #1243）。
 *  步序与 v10/v11/v14/v17/v20/v23/v24 同构（建新表 → 搬行 → 删旧 → 改名 → 建两索引）；零回填；
 *  kind 非枚举（四 kind 归 `accounts/ACCOUNTS.md` §2.1）：`tls_start` ∥ `cert_reload` ∥ `cert_reload_failed` ∥ `rate_limit_burst`。
 *  语义/机制 = `gateway/PUBLICNET.md` §2 审计面。 */
export const DDL_V26 = `
-- audit_events 表重建（十七型 ⇒ 十八型：+ 'security_event'——步序与 v10/v11/v14/v17/v20/v23/v24 同构）
CREATE TABLE audit_events_v26 (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  ts          INTEGER NOT NULL,              -- unix ms（事件时刻）
  type        TEXT NOT NULL CHECK (type IN ('login_success','login_failure','login_locked',
    'key_rotate','key_issue','key_revoke','password_change','password_reset','member_create','config_update',
    'sandbox_rule','sandbox_event','agent_event','project_event','ledger_event','member_event','mcp_event','security_event')),
  actor_id    INTEGER,                       -- 行为人成员 id（无会话 ∥ 未知用户名 ⇒ NULL；无 FK——历史记录自足）
  actor_name  TEXT NOT NULL,                 -- 行为人名快照（用户名 ∥ 展示名 ∥ 'cli' ∥ 'scheduler' ∥ 'webhook' ∥ 'server'）
  target_id   INTEGER,                       -- 对象成员 id（无对象 ⇒ NULL）
  target_name TEXT NOT NULL DEFAULT '',      -- 对象名快照（无对象 ⇒ 空串）
  detail      TEXT NOT NULL DEFAULT '{}'     -- 附加形（JSON：kind ∥ ip ∥ ruleClass ∥ reason 等）
);
INSERT INTO audit_events_v26 (id, ts, type, actor_id, actor_name, target_id, target_name, detail)
  SELECT id, ts, type, actor_id, actor_name, target_id, target_name, detail FROM audit_events;
DROP TABLE audit_events;
ALTER TABLE audit_events_v26 RENAME TO audit_events;
CREATE INDEX IF NOT EXISTS idx_audit_ts ON audit_events(ts);
CREATE INDEX IF NOT EXISTS idx_audit_type_ts ON audit_events(type, ts);
`

