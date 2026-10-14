/**
 * migrations.mjs — 结构迁移链（store/STORE.md §2/§3；自 `db.mjs` 外提——sandbox-exec-rebuild 批 · KD-SV-172/173）：
 * v1–v24 段链（append-only ∥ 每段单事务）+ `migrate` ∥ `readVersion` ∥ `SCHEMA_VERSION`；开库/PRAGMA = `db.mjs`（本档反向零依赖）。
 *
 * 口径：v2–v21 段 = **纯搬移零语义**（逐字自 `db.mjs` 迁入）；v22 收正段 = 沙盒批新增（`sandbox_workspaces` 表重建去
 * `required_labels_json` ∥ 增 `stop_reason`/`base_image`；`sandbox_tasks` 删表；`registry_credentials` 建表；
 * `sandbox_runners` 连接材料四列）；v23 增段 = member-face-chat 批（成员 git 凭据表 + 审计 CHECK 重建（十六型）——**会话两表不建**）；
 * v24 增段 = server-mcp 批（`mcp_servers` 建表 + 审计 CHECK 重建（十七型：+ `mcp_event`）——台账 #1379）。
 * 结构单源 = `store/STORE.md` §2（逐段），本档不复制语义。触发线 700 越 ⇒ 拆案本批实施（KD-SV-173）。
 */
/** v1 全量 DDL（四表 + 三索引——store/STORE.md §2 逐字）。 */
const DDL_V1 = `
CREATE TABLE IF NOT EXISTS members (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  username      TEXT NOT NULL UNIQUE,             -- 登录名（账号标识）
  name          TEXT NOT NULL UNIQUE,             -- 展示名（创建缺省 = username）
  password_hash TEXT NOT NULL,                    -- scrypt 编码串（KD-SV-13）
  role          TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin','user')),
  quota_tokens  INTEGER,                          -- NULL = 不限；否则月度 token 额度
  created_at    TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS api_keys (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  member_id  INTEGER NOT NULL REFERENCES members(id),
  key_hash   TEXT NOT NULL UNIQUE,                -- sha256(明文) hex
  key_hint   TEXT NOT NULL,                       -- sk-tc-ab12cd…wxyz
  status     TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','revoked')),
  created_at TEXT NOT NULL,
  revoked_at TEXT
);
CREATE TABLE IF NOT EXISTS usage (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  ts                INTEGER NOT NULL,             -- unix ms（请求开始）
  member_id         INTEGER NOT NULL REFERENCES members(id),
  key_id            INTEGER NOT NULL REFERENCES api_keys(id),
  endpoint          TEXT NOT NULL CHECK (endpoint IN ('chat','embeddings')),
  model             TEXT NOT NULL,
  status            TEXT NOT NULL CHECK (status IN ('ok','error','aborted')),
  stream            INTEGER NOT NULL,             -- 0/1
  prompt_tokens     INTEGER,                      -- NULL = 上游未回 usage
  completion_tokens INTEGER,
  total_tokens      INTEGER,
  duration_ms       INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS sessions (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  token_hash TEXT NOT NULL UNIQUE,                -- sha256(会话令牌) hex
  member_id  INTEGER NOT NULL REFERENCES members(id),
  created_at INTEGER NOT NULL,                    -- unix ms
  expires_at INTEGER NOT NULL                     -- unix ms（绝对过期）
);
CREATE INDEX IF NOT EXISTS idx_usage_ts ON usage(ts);
CREATE INDEX IF NOT EXISTS idx_usage_member_ts ON usage(member_id, ts);
CREATE INDEX IF NOT EXISTS idx_sessions_member ON sessions(member_id);
`

/** v2 增段（`providers` 表——store/STORE.md §2 v2 段逐字；控制台 provider 管理——gateway/API.md §2.2）。 */
const DDL_V2 = `
CREATE TABLE IF NOT EXISTS providers (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT NOT NULL UNIQUE,             -- 对外标识前缀（无 \`/\`；重名拒）
  base_url    TEXT NOT NULL,                    -- OpenAI 兼容根
  api_key     TEXT NOT NULL DEFAULT '',         -- 明文 ∥ \`env:NAME\` 引用（空 = 不发 Authorization；解析 = 注册表构建期）
  models_json TEXT NOT NULL DEFAULT '[]',       -- 开放清单（JSON 数组——条目两形：字符串 = 上游模型名（无别名）∥ 对象 { name, alias }（配别名）；对外标识 = alias ∥ provider/model——2026-10-09 alias 批）
  created_at  TEXT NOT NULL,
  updated_at  TEXT NOT NULL
);
`

/** v3 增段（`audit_events` 事件表 + 三索引——store/STORE.md §2 v3 段逐字；accounts ∥ metering 域）。 */
const DDL_V3 = `
CREATE TABLE IF NOT EXISTS audit_events (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  ts          INTEGER NOT NULL,              -- unix ms（事件时刻）
  type        TEXT NOT NULL CHECK (type IN ('login_success','login_failure','login_locked',
    'key_rotate','key_issue','key_revoke','password_change','password_reset','member_create')),
  actor_id    INTEGER,                       -- 行为人成员 id（无会话 ∥ 未知用户名 ⇒ NULL；无 FK——历史记录自足）
  actor_name  TEXT NOT NULL,                 -- 行为人名快照（用户名 ∥ 展示名 ∥ 'cli'）
  target_id   INTEGER,                       -- 对象成员 id（无对象 ⇒ NULL）
  target_name TEXT NOT NULL DEFAULT '',      -- 对象名快照（无对象 ⇒ 空串）
  detail      TEXT NOT NULL DEFAULT '{}'     -- 附加形（JSON：ip ∥ dimension ∥ keyHint ∥ role 等）
);
CREATE INDEX IF NOT EXISTS idx_audit_ts ON audit_events(ts);
CREATE INDEX IF NOT EXISTS idx_audit_type_ts ON audit_events(type, ts);
CREATE INDEX IF NOT EXISTS idx_usage_key_ts ON usage(key_id, ts);
`

/** v4 增段（`providers.settings_json`——store/STORE.md §2 v4 段逐字；gateway 域——模型设置映射）。
 *  列级 ALTER = 表不重建（存量行即刻得 `'{}'`——§3 迁移链 v4）。 */
const DDL_V4 = `
ALTER TABLE providers ADD COLUMN settings_json TEXT NOT NULL DEFAULT '{}';  -- 模型设置映射（JSON 对象——形见 store/STORE.md §2 v4 段）
`

/** v5 增段（模型标识两字段拆列 + 派生两表 + 成员配额列——store/STORE.md §2 v5 段逐字；metering ∥ accounts 域）。
 *  ① usage 拆列（判据 = `endpoint = 'chat'` + 首斜杠；嵌入行 `provider = ''`）；② 预聚合日表 `usage_daily`；
 *  ③ 配额计数表 `quota_counters`；④ 成员分模型覆盖列增 + 旧总量列删；⑤ 期初回填（usage = 真源）。 */
const DDL_V5 = `
-- ① usage 两字段拆列（KD-SV-40）：内部真名两字段（对外显示 = 别名回映射——2026-10-09 alias 批）；\`model\` 可含斜杠；嵌入行 \`provider = ''\`（无前缀命名空间）
ALTER TABLE usage ADD COLUMN provider TEXT NOT NULL DEFAULT '';
UPDATE usage SET provider = substr(model, 1, instr(model, '/') - 1), model = substr(model, instr(model, '/') + 1)
  WHERE endpoint = 'chat' AND instr(model, '/') > 0;

-- ② 预聚合日表（汇表面读源——KD-SV-39；粒度 = 日 × 成员 × key × provider × model × endpoint）
CREATE TABLE IF NOT EXISTS usage_daily (
  day               TEXT NOT NULL,              -- 'YYYY-MM-DD'（服务器本地日界——与 trend strftime 同形）
  member_id         INTEGER NOT NULL,
  key_id            INTEGER NOT NULL,
  provider          TEXT NOT NULL,              -- '' = 无 provider 维（嵌入面）
  model             TEXT NOT NULL,
  endpoint          TEXT NOT NULL CHECK (endpoint IN ('chat','embeddings')),
  requests          INTEGER NOT NULL DEFAULT 0, -- 请求数（含 error ∥ aborted）
  prompt_tokens     INTEGER NOT NULL DEFAULT 0,
  completion_tokens INTEGER NOT NULL DEFAULT 0,
  total_tokens      INTEGER NOT NULL DEFAULT 0, -- NULL 计 0（口径同 SUM 聚合）
  duration_ms       INTEGER NOT NULL DEFAULT 0,
  errors            INTEGER NOT NULL DEFAULT 0, -- status = 'error' 计数
  PRIMARY KEY (day, member_id, key_id, provider, model, endpoint)
);

-- ③ 配额计数表（检查面点查源——KD-SV-38；粒度 = 成员 × provider × 模型 × 自然月）
CREATE TABLE IF NOT EXISTS quota_counters (
  member_id INTEGER NOT NULL,
  provider  TEXT NOT NULL,               -- 检查只读 chat 键（provider 非空）∥ 嵌入行照计不读
  model     TEXT NOT NULL,
  month     TEXT NOT NULL,               -- 'YYYY-MM'（服务器本地时区）
  tokens    INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (member_id, provider, model, month)
);

-- ④ 成员分模型覆盖列 + 旧总量列退役（被 ①② 取代）
ALTER TABLE members ADD COLUMN model_quotas_json TEXT NOT NULL DEFAULT '{}';
ALTER TABLE members DROP COLUMN quota_tokens;

-- ⑤ 期初回填（一次性聚合——usage = 真源；两表与真源逐值可重算）
INSERT INTO usage_daily (day, member_id, key_id, provider, model, endpoint, requests, prompt_tokens, completion_tokens, total_tokens, duration_ms, errors)
SELECT strftime('%Y-%m-%d', ts / 1000, 'unixepoch', 'localtime') AS day, member_id, key_id, provider, model, endpoint,
       COUNT(*), COALESCE(SUM(prompt_tokens), 0), COALESCE(SUM(completion_tokens), 0), COALESCE(SUM(total_tokens), 0),
       COALESCE(SUM(duration_ms), 0), COALESCE(SUM(CASE WHEN status = 'error' THEN 1 ELSE 0 END), 0)
FROM usage GROUP BY day, member_id, key_id, provider, model, endpoint;
INSERT INTO quota_counters (member_id, provider, model, month, tokens)
SELECT member_id, provider, model, strftime('%Y-%m', ts / 1000, 'unixepoch', 'localtime') AS month, COALESCE(SUM(total_tokens), 0)
FROM usage GROUP BY member_id, provider, model, month;
`

/** v6 增段（`members.model_disabled_json`——store/STORE.md §2 v6 段逐字；accounts 域——成员模型禁用集）。
 *  列级 ALTER = 表不重建（存量行即刻得 `'{}'`——**默认全可用**；§3 迁移链 v6）。 */
const DDL_V6 = `
ALTER TABLE members ADD COLUMN model_disabled_json TEXT NOT NULL DEFAULT '{}';  -- 成员 × 模型禁用集（JSON 对象——键 = 对外标识；值 = true）
`

/** v7 增段（`providers.model_meta_json`——store/STORE.md §2 v7 段逐字；gateway 域——上游模型元数据留存图）。
 *  列级 ALTER = 表不重建（存量行即刻得 `'{}'`——未存 = 无元数据；§3 迁移链 v7）。 */
const DDL_V7 = `
ALTER TABLE providers ADD COLUMN model_meta_json TEXT NOT NULL DEFAULT '{}';  -- 上游模型元数据留存图（JSON 对象——形见下）
`

/** v8 增段（`api_keys.name`——store/STORE.md §2 v8 段逐字；accounts 域——key 名称列）。
 *  列级 ALTER = 表不重建（存量行即刻得 `''` ⇒ 随段回填默认名 `key-N`——按成员签发序；§3 迁移链 v8）。 */
const DDL_V8 = `
ALTER TABLE api_keys ADD COLUMN name TEXT NOT NULL DEFAULT '';  -- key 名称（空串 = 迁移前存量行——随段回填默认名）
UPDATE api_keys SET name = 'key-' || (SELECT COUNT(*) FROM api_keys k2 WHERE k2.member_id = api_keys.member_id AND k2.id <= api_keys.id);  -- 存量行回填默认名（key-N——按成员签发序）
`

/** v9 增段（`providers.proxy`——store/STORE.md §2 v9 段逐字；gateway 域——上游代理旗）。
 *  列级 ALTER = 表不重建（存量行即刻得 0——缺省直连；§3 迁移链 v9）。 */
const DDL_V9 = `
ALTER TABLE providers ADD COLUMN proxy INTEGER NOT NULL DEFAULT 0;  -- 上游代理旗（1 = 该渠上游请求经代理；0 = 直连——缺省）
`

/** v10 增段（`audit_events.type` CHECK 扩型——store/STORE.md §2 v10 段逐字；accounts 域——配置控制台批）。
 *  SQLite 不可改 CHECK ⇒ **表重建**（建新表 ∥ 拷贝 ∥ 换名 ∥ 索引重建）；净零新表/新列（§3 迁移链 v10）。 */
const DDL_V10 = `
-- 事件型 CHECK 扩十型（+ 'config_update'）——SQLite 不可改 CHECK ⇒ 表重建（建新表 ∥ 拷贝 ∥ 换名 ∥ 索引重建）
CREATE TABLE audit_events_v10 (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  ts          INTEGER NOT NULL,              -- unix ms（事件时刻）
  type        TEXT NOT NULL CHECK (type IN ('login_success','login_failure','login_locked',
    'key_rotate','key_issue','key_revoke','password_change','password_reset','member_create','config_update')),
  actor_id    INTEGER,                       -- 行为人成员 id（无会话 ∥ 未知用户名 ⇒ NULL；无 FK——历史记录自足）
  actor_name  TEXT NOT NULL,                 -- 行为人名快照（用户名 ∥ 展示名 ∥ 'cli'）
  target_id   INTEGER,                       -- 对象成员 id（无对象 ⇒ NULL）
  target_name TEXT NOT NULL DEFAULT '',      -- 对象名快照（无对象 ⇒ 空串）
  detail      TEXT NOT NULL DEFAULT '{}'     -- 附加形（JSON：ip ∥ dimension ∥ keyHint ∥ role ∥ keys 等）
);
INSERT INTO audit_events_v10 (id, ts, type, actor_id, actor_name, target_id, target_name, detail)
  SELECT id, ts, type, actor_id, actor_name, target_id, target_name, detail FROM audit_events;
DROP TABLE audit_events;
ALTER TABLE audit_events_v10 RENAME TO audit_events;
CREATE INDEX IF NOT EXISTS idx_audit_ts ON audit_events(ts);
CREATE INDEX IF NOT EXISTS idx_audit_type_ts ON audit_events(type, ts);
`

/** v11 增段（沙盒七表 + 审计 CHECK 再扩（十二型）+ 默认单种子——store/STORE.md §2 v11 段逐字；sandbox ∥ accounts 域）。
 *  ① 七表 CREATE（对象模型 = `sandbox/SANDBOX.md` §2 单源）；② 审计表重建（十型 ⇒ 十二型——步序与 v10 同构）；
 *  ③ 种子八行（`source='default'`——本段一次性写入、可改可删、不复活：deny 三 + allow 五）。 */
const DDL_V11 = `
-- ① 沙盒七表（对象模型 = sandbox/SANDBOX.md §2——单源；表结构全文 = store/STORE.md §2 v11 段）
CREATE TABLE IF NOT EXISTS sandbox_runners (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,                  -- runner 名（注册时给）
  token_hash TEXT NOT NULL UNIQUE,            -- sha256(runner 令牌) hex
  labels_json TEXT NOT NULL DEFAULT '{}',     -- 容量描述符（标签 + maxBoxes——放置判据；形 = src/sandbox/registry.mjs 档头）
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','draining','drained','disabled')),
  runtime_json TEXT NOT NULL DEFAULT '{}',    -- 最近心跳上行块（版本 ∥ 自检读数 ∥ 磁盘余量 ∥ 盒清单——心跳更新）
  last_heartbeat_at INTEGER,                  -- unix ms（3 拍缺 ⇒ unhealthy——展示面派生）
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS sandbox_workspaces (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  owner_member_id INTEGER NOT NULL REFERENCES members(id),
  key_id INTEGER NOT NULL REFERENCES api_keys(id),
  key_plain TEXT NOT NULL,                    -- 工作区 key 明文（盒重建再注入——披露 D2）
  runner_id INTEGER,                          -- 放置绑定（未放置 ⇒ NULL）
  required_labels_json TEXT NOT NULL DEFAULT '{}',
  limits_json TEXT NOT NULL DEFAULT '{}',     -- 每工作区覆写（资源 + TTL；键集/取值序 = sandbox/SANDBOX.md §2；空 = 随全局默认）
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS sandbox_rules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  kind TEXT NOT NULL CHECK (kind IN ('cidr','domain')),
  action TEXT NOT NULL CHECK (action IN ('allow','deny')),
  target TEXT NOT NULL,                       -- CIDR ∥ 域名（含单层左通配）
  port INTEGER,                               -- NULL = 不限
  protocol TEXT,                              -- 'tcp' ∥ 'udp' ∥ NULL（不限）
  priority INTEGER NOT NULL DEFAULT 0,        -- 同动作内排序
  note TEXT NOT NULL DEFAULT '',
  source TEXT NOT NULL DEFAULT 'admin' CHECK (source IN ('default','admin','approval')),
  created_at TEXT NOT NULL,
  created_by TEXT NOT NULL DEFAULT ''
);
CREATE TABLE IF NOT EXISTS sandbox_pending (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  runner_id INTEGER NOT NULL,
  workspace_id INTEGER NOT NULL,
  host TEXT NOT NULL,
  hits INTEGER NOT NULL DEFAULT 1,            -- 三次批准建议判据
  first_seen_at INTEGER NOT NULL,
  last_seen_at INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','approved_once','approved_remember','denied','timeout')),
  resolved_at INTEGER
);
CREATE TABLE IF NOT EXISTS sandbox_tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  runner_id INTEGER NOT NULL,
  kind TEXT NOT NULL,                         -- 'sandbox.*' 本批；'ci.*' 预留（可扩——KD-SV-72）
  payload_json TEXT NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued','claimed','done','failed','unsupported')),
  created_at TEXT NOT NULL,
  claimed_at INTEGER,
  finished_at INTEGER,
  result_json TEXT
);
CREATE TABLE IF NOT EXISTS sandbox_checkpoints (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  workspace_id INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  size INTEGER NOT NULL,                      -- 字节
  blob_path TEXT NOT NULL,
  note TEXT NOT NULL DEFAULT ''
);
CREATE TABLE IF NOT EXISTS sandbox_settings (
  k TEXT PRIMARY KEY,                         -- 全局默认——键全集与值形 = gateway/API.md §2.5（单源）；「默认单」非本表（= sandbox_rules 种子行）
  v TEXT NOT NULL                             -- JSON 文本（数字 ∥ 字符串统一 JSON 编码）
);

-- ② 审计 CHECK 再扩（十型 ⇒ 十二型——表重建，步序与 v10 同构）
-- + 'sandbox_rule'（规则增删——detail = { action, rule }）∥ + 'sandbox_event'（审批三态/超时 ∥ 盒起停拆 ∥ runner 注册/排空/删除 ∥ join 失败 ∥ 快照——detail = { kind, ... }）
CREATE TABLE audit_events_v11 (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  ts          INTEGER NOT NULL,              -- unix ms（事件时刻）
  type        TEXT NOT NULL CHECK (type IN ('login_success','login_failure','login_locked',
    'key_rotate','key_issue','key_revoke','password_change','password_reset','member_create','config_update',
    'sandbox_rule','sandbox_event')),
  actor_id    INTEGER,                       -- 行为人成员 id（无会话 ∥ 未知用户名 ⇒ NULL；无 FK——历史记录自足）
  actor_name  TEXT NOT NULL,                 -- 行为人名快照（用户名 ∥ 展示名 ∥ 'cli' ∥ 'runner:<名>'）
  target_id   INTEGER,                       -- 对象成员 id（无对象 ⇒ NULL）
  target_name TEXT NOT NULL DEFAULT '',      -- 对象名快照（无对象 ⇒ 空串）
  detail      TEXT NOT NULL DEFAULT '{}'     -- 附加形（JSON：ip ∥ dimension ∥ keyHint ∥ role ∥ keys 等）
);
INSERT INTO audit_events_v11 (id, ts, type, actor_id, actor_name, target_id, target_name, detail)
  SELECT id, ts, type, actor_id, actor_name, target_id, target_name, detail FROM audit_events;
DROP TABLE audit_events;
ALTER TABLE audit_events_v11 RENAME TO audit_events;
CREATE INDEX IF NOT EXISTS idx_audit_ts ON audit_events(ts);
CREATE INDEX IF NOT EXISTS idx_audit_type_ts ON audit_events(type, ts);

-- ③ 种子八行（初始化点 = 本段一次性写入；可改可删——不复活）：deny（cidr）三条 = RFC1918 ∥ allow（domain）五条 = 默认单
--   恒拒（127.0.0.0/8 ∥ 169.254.0.0/16）= 内置（非行——不入种子）；动态项（服务器网段 ∥ runner 自身网段）= 注册时自动带入
INSERT INTO sandbox_rules (kind, action, target, port, protocol, priority, note, source, created_at, created_by) VALUES
  ('cidr', 'deny', '10.0.0.0/8', NULL, NULL, 0, '默认禁单：RFC1918 私网', 'default', strftime('%Y-%m-%dT%H:%M:%fZ','now'), 'seed'),
  ('cidr', 'deny', '172.16.0.0/12', NULL, NULL, 0, '默认禁单：RFC1918 私网', 'default', strftime('%Y-%m-%dT%H:%M:%fZ','now'), 'seed'),
  ('cidr', 'deny', '192.168.0.0/16', NULL, NULL, 0, '默认禁单：RFC1918 私网', 'default', strftime('%Y-%m-%dT%H:%M:%fZ','now'), 'seed'),
  ('domain', 'allow', 'registry.npmjs.org', NULL, NULL, 0, '默认单：npm 依赖', 'default', strftime('%Y-%m-%dT%H:%M:%fZ','now'), 'seed'),
  ('domain', 'allow', 'github.com', NULL, NULL, 0, '默认单：代码仓', 'default', strftime('%Y-%m-%dT%H:%M:%fZ','now'), 'seed'),
  ('domain', 'allow', '*.githubusercontent.com', NULL, NULL, 0, '默认单：代码仓资源（单层左通配）', 'default', strftime('%Y-%m-%dT%H:%M:%fZ','now'), 'seed'),
  ('domain', 'allow', 'gitee.com', NULL, NULL, 0, '默认单：代码仓', 'default', strftime('%Y-%m-%dT%H:%M:%fZ','now'), 'seed'),
  ('domain', 'allow', '*.gitee.com', NULL, NULL, 0, '默认单：代码仓资源（单层左通配）', 'default', strftime('%Y-%m-%dT%H:%M:%fZ','now'), 'seed');
`

/** v12 增段（`sandbox_runners` 表重建——旧通道形态 ⇒ Docker 节点形态——store/STORE.md §2 v12 段逐字；sandbox 域）。
 *  ① 建新表（列面 = v11 段所列：id/name/address/status/runtime_json/created_at）⇒ ② 存量行弃（旧通道行无地址可取、令牌/心跳语义整废——一次性过渡）
 *  ⇒ ③ DROP ⇒ ④ RENAME（沿 v10 表重建先例——SQLite 不可改列集/CHECK）。 */
const DDL_V12 = `
-- ① 建新表（Docker 节点形态——无 token_hash ∥ 无 labels_json ∥ 无 last_heartbeat_at）
CREATE TABLE sandbox_runners_v12 (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,                  -- 节点名（登记时给）
  address TEXT NOT NULL,                      -- Docker API 地址（登记时给）
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','disabled')),
  runtime_json TEXT NOT NULL DEFAULT '{}',    -- 连通自检读数
  created_at TEXT NOT NULL
);
-- ② 存量行弃（不迁——见上注）⇒ ③ DROP ⇒ ④ RENAME
DROP TABLE sandbox_runners;
ALTER TABLE sandbox_runners_v12 RENAME TO sandbox_runners;
`

/** v13 增段（`sandbox_onboarding` 建表——托管接入任务 + 凭据——store/STORE.md §2 v13 段逐字；sandbox 域）。
 *  加表（零重建）：任务态/步骤读数/凭据密文共一行；加密密钥 = `data/credentials.key`（不落库——KD-SV-84）。 */
const DDL_V13 = `
CREATE TABLE IF NOT EXISTS sandbox_onboarding (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  host TEXT NOT NULL,                          -- 主机地址原文
  ssh_port INTEGER NOT NULL DEFAULT 22,
  ssh_user TEXT NOT NULL,
  auth_kind TEXT NOT NULL CHECK (auth_kind IN ('key','password')),
  secret_cipher TEXT,                          -- AES-256-GCM 包（iv|tag|ct —— base64 三段）；零化后 NULL
  sudo_cipher TEXT,                            -- 可选（同形）
  credential_mode TEXT NOT NULL CHECK (credential_mode IN ('burn','keep')),
  credential_state TEXT NOT NULL DEFAULT 'sealed' CHECK (credential_state IN ('sealed','burned','revoked')),
  name TEXT,                                   -- 节点名（可选；缺省取探测主机名）
  model TEXT NOT NULL,                         -- 提交时所选模型
  status TEXT NOT NULL CHECK (status IN ('running','succeeded','failed','interrupted')),
  step TEXT,                                   -- 当前/最后一步 id
  steps_json TEXT NOT NULL DEFAULT '[]',       -- 步骤日志（读数面）
  runner_id INTEGER,                           -- 成功后关联（未成 NULL）
  created_by INTEGER,                          -- admin 成员 id
  created_at TEXT NOT NULL,
  finished_at TEXT
);
`

/** v14 增段（agent chat 两表 + 审计 CHECK 再扩（十三型）——store/STORE.md §2 v14 段逐字；agent 域——admin-agent-chat 批）。
 *  ① `agent_chats`（会话：`model` ∥ `status` 在途标记——v16 增 `reasoning` 会话级思考档位）+ `agent_chat_messages`（消息序：`role` 四值 ∥ `content` ∥ `data_json`）+ `(chat_id, seq)` 索引；
 *  ② 审计表重建（十二型 ⇒ 十三型：+ `agent_event`——步序与 v10/v11 同构）。对象模型 = `agent/ADMIN-AGENT.md` §11/§12（单源）。 */
const DDL_V14 = `
-- ① 管理面 chat 两表（KD-SV-89——消息逐条增量落库；无 FK——沿 audit_events 口径）
CREATE TABLE IF NOT EXISTS agent_chats (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  model TEXT NOT NULL,                        -- 建会话时选定（KD-SV-87 同口径）
  status TEXT NOT NULL DEFAULT 'idle' CHECK (status IN ('idle','running')),  -- running = 一轮在途（重启 ⇒ idle——如实收尾）
  created_by INTEGER,                         -- 发起 admin 成员 id（无 FK——沿先例）
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS agent_chat_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  chat_id INTEGER NOT NULL,                   -- 无 FK（历史/瞬态面自足——沿 audit_events 口径）
  seq INTEGER NOT NULL,                       -- 会话内序（1 起）
  role TEXT NOT NULL CHECK (role IN ('user','assistant','tool','notice')),
  content TEXT NOT NULL DEFAULT '',           -- 工具结果 = 模型可见形（截断 ≤4000 字——回放逐字一致）
  data_json TEXT,                             -- role 附加形：assistant 的 toolCalls ∥ tool 的 toolCallId/名/摘要 ∥ notice 的 reason（四值枚举——重启收尾 "restart" ∥ 预算超限 "budget" ∥ 模型错误 "model_error" ∥ 空回合 "empty_turn"）
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_agent_chat_messages ON agent_chat_messages(chat_id, seq);

-- ② 审计 CHECK 再扩（十二型 ⇒ 十三型——表重建，步序与 v10/v11 同构）
-- + 'agent_event'（管理面 agent 会话——kind：chat_start（会话创建）∥ chat_call（每工具调用）∥ chat_stop（异常收尾：预算超限 ∥ 模型错误 ∥ 空回合 ∥ 重启中断）；
--   detail = { kind, chatId, tool?, call?, resultCode?, summary?, reason? }（notice 的 reason 四值枚举——重启收尾 "restart" ∥ 预算超限 "budget" ∥ 模型错误 "model_error" ∥ 空回合 "empty_turn"）；
--   摘要截断 + 秘密掩蔽口径沿任务面）
CREATE TABLE audit_events_v14 (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  ts          INTEGER NOT NULL,              -- unix ms（事件时刻）
  type        TEXT NOT NULL CHECK (type IN ('login_success','login_failure','login_locked',
    'key_rotate','key_issue','key_revoke','password_change','password_reset','member_create','config_update',
    'sandbox_rule','sandbox_event','agent_event')),
  actor_id    INTEGER,                       -- 行为人成员 id（无会话 ∥ 未知用户名 ⇒ NULL；无 FK——历史记录自足）
  actor_name  TEXT NOT NULL,                 -- 行为人名快照（用户名 ∥ 展示名 ∥ 'cli'）
  target_id   INTEGER,                       -- 对象成员 id（无对象 ⇒ NULL）
  target_name TEXT NOT NULL DEFAULT '',      -- 对象名快照（无对象 ⇒ 空串）
  detail      TEXT NOT NULL DEFAULT '{}'     -- 附加形（JSON：ip ∥ dimension ∥ keyHint ∥ role ∥ kind ∥ chatId 等）
);
INSERT INTO audit_events_v14 (id, ts, type, actor_id, actor_name, target_id, target_name, detail)
  SELECT id, ts, type, actor_id, actor_name, target_id, target_name, detail FROM audit_events;
DROP TABLE audit_events;
ALTER TABLE audit_events_v14 RENAME TO audit_events;
CREATE INDEX IF NOT EXISTS idx_audit_ts ON audit_events(ts);
CREATE INDEX IF NOT EXISTS idx_audit_type_ts ON audit_events(type, ts);
`

/** v15 增段（`image_sources` 建表——store/STORE.md §2 v15 段逐字；sandbox 域——sandbox-image-sources 批）。
 *  ① 镜像源表（server 全局清单——非按节点；名 ∥ 址各自唯一 ∥ 五列）；② 无审计 CHECK 变更（三 kind 走 `sandbox_event`——kind 非枚举；十三型不变）。
 *  语义/机制 = `sandbox/SANDBOX.md` §3（单源）；判据 = `store/STORE.md` §3 v15 行。 */
const DDL_V15 = `
-- ① 镜像源表（server 全局清单——非按节点）
CREATE TABLE IF NOT EXISTS image_sources (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,                         -- 显示名（≤40 字符——应用层校验）
  address TEXT NOT NULL,                      -- 归一后基址：https://host[:port] ∥ http://host[:port]（无路径/查询）
  created_at TEXT NOT NULL,
  created_by INTEGER,                         -- 建源 admin 成员 id（无 FK——沿先例）
  UNIQUE (name),
  UNIQUE (address)
);
-- ② 无审计 CHECK 变更（三 kind 走 sandbox_event——kind 非枚举；十三型不变）
`

/** v16 增段（`agent_chats.reasoning` 增列——store/STORE.md §2 v16 段逐字；agent 域——console-reasoning-levels 批）。
 *  ① 会话档位列（NULL = 未设——默认态；值域 = 该模型核枚举 `reasoningEffortEnum`，应用层校验；KD-SV-110）；
 *  ② 零迁移（存量行保持 NULL = 今日行为逐字同——无回填 ∥ 无改写；档位词表不入库——核单源）。
 *  语义/机制 = `agent/ADMIN-AGENT.md` §11.4（单源）；端点 = `gateway/API.md` §2.8；控制台面 = `webui/CHAT.md` §2.1⑤。 */
const DDL_V16 = `
-- ① 会话档位列（NULL = 未设——默认态；值域 = 该模型核枚举 \`reasoningEffortEnum\`，应用层校验）
ALTER TABLE agent_chats ADD COLUMN reasoning TEXT;
-- ② 审计 CHECK 零动（三 kind 不扩——档位写 = 会话设置面，沿 KD-SV-108 先例；十三型不变）
`

/** v17 增段（git 源/项目/项目成员三表 + 审计 CHECK 再扩（十四型）——store/STORE.md §2 v17 段逐字；project 域——team-projects-permissions 批）。
 *  ① 三表（源 ∥ 项目（仓） ∥ 项目成员）+ 两索引；② 审计表重建（十三型 ⇒ 十四型：+ `project_event`——步序与 v10/v11/v14 同构）。
 *  语义/机制 = `project/PROJECTS.md` §2/§4/§5（单源）；PAT 密文包形 = `store/credential-crypto.mjs`（KD-SV-119）；判据 = `store/STORE.md` §3 v17 行。 */
const DDL_V17 = `
-- ① 三表（源 ∥ 项目（仓） ∥ 项目成员）
CREATE TABLE IF NOT EXISTS git_sources (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,                    -- 源名（≤40——应用层校验）
  platform TEXT NOT NULL CHECK (platform IN ('gitee','github','gitlab','selfhosted')),
  base_url TEXT,                                -- 自建平台基址（其余平台 NULL——客户端用固定基址）
  scope TEXT,                                   -- 组织/企业/组标识（成员同步用；NULL = 未配置）
  token_cipher TEXT NOT NULL,                   -- PAT 密文（AES-256-GCM \`iv|tag|ct\`——KD-SV-119；永不回显原文）
  hook_secret_cipher TEXT,                      -- webhook 密钥密文（事件进路——github 专用；按需生成 ⇒ NULL 缺省；生成时一次性明示 ∥ 读面恒掩码——project/PROJECTS.md §13）
  enabled INTEGER NOT NULL DEFAULT 1,           -- 启用/停用（停用 ⇒ 定时停、已挂项目保留——需求 44⑤）
  sync_mode TEXT NOT NULL DEFAULT 'poll' CHECK (sync_mode IN ('poll','event')),
  interval_minutes INTEGER NOT NULL DEFAULT 60, -- 定时拉取间隔（5–1440——应用层校验）
  last_sync_at TEXT,                            -- 上次同步尝试时刻（成敗同记——需求 44⑤「上次同步时间 + 结果」）
  last_sync_result_json TEXT NOT NULL DEFAULT '{}',
  token_state TEXT NOT NULL DEFAULT 'unknown' CHECK (token_state IN ('unknown','ok','invalid')),
  token_checked_at TEXT,
  created_by INTEGER,                           -- 无 FK——沿先例
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  source_id INTEGER,                            -- 所属源（手输仓 ⇒ NULL）；无 FK——删源防护走应用层（KD-SV-122）
  address TEXT NOT NULL UNIQUE,                 -- git 地址（跨形归一后 = 记账键——规范形 \`host[:port]/path\`；归一口径 = project/PROJECTS.md §5）
  display_name TEXT NOT NULL,                   -- 显示名（负责人可改——需求 44②）
  owner_username TEXT,                          -- 负责人（统一用户名键；NULL = 未指派；admin 指派）
  created_by INTEGER,
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS project_members (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL,
  username TEXT NOT NULL COLLATE NOCASE,        -- 统一用户名键（大小写不敏感唯一——KD-SV-116）
  level TEXT NOT NULL CHECK (level IN ('read','readwrite','manage')),
  origin TEXT NOT NULL DEFAULT 'manual' CHECK (origin IN ('manual','sync')),
  synced_role TEXT,                             -- 平台角色原文（sync 行携带——展示用；manual 行 NULL）
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE (project_id, username)
);
CREATE INDEX IF NOT EXISTS idx_project_members_user ON project_members(username);
CREATE INDEX IF NOT EXISTS idx_projects_source ON projects(source_id);

-- ② 审计 CHECK 再扩（十三型 ⇒ 十四型：+ 'project_event'——表重建，步序与 v10/v11/v14 同构）
--    kind 枚举（十一 kind）：source_add ∥ source_update ∥ source_delete ∥ source_sync ∥ source_check ∥ project_add ∥ project_update ∥
--    project_delete ∥ member_add ∥ member_update ∥ member_remove（kind 非 CHECK 枚举——逐 kind 归 accounts/ACCOUNTS.md §2.1）
CREATE TABLE audit_events_v17 (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  ts          INTEGER NOT NULL,              -- unix ms（事件时刻）
  type        TEXT NOT NULL CHECK (type IN ('login_success','login_failure','login_locked',
    'key_rotate','key_issue','key_revoke','password_change','password_reset','member_create','config_update',
    'sandbox_rule','sandbox_event','agent_event','project_event')),
  actor_id    INTEGER,                       -- 行为人成员 id（无会话 ∥ 未知用户名 ⇒ NULL；无 FK——历史记录自足）
  actor_name  TEXT NOT NULL,                 -- 行为人名快照（用户名 ∥ 展示名 ∥ 'cli' ∥ 'scheduler' ∥ 'webhook'）
  target_id   INTEGER,                       -- 对象成员 id（无对象 ⇒ NULL）
  target_name TEXT NOT NULL DEFAULT '',      -- 对象名快照（无对象 ⇒ 空串；项目类事件 = 'project:<id>' 可读形）
  detail      TEXT NOT NULL DEFAULT '{}'     -- 附加形（JSON：kind ∥ sourceId ∥ projectId ∥ keys 等）
);
INSERT INTO audit_events_v17 (id, ts, type, actor_id, actor_name, target_id, target_name, detail)
  SELECT id, ts, type, actor_id, actor_name, target_id, target_name, detail FROM audit_events;
DROP TABLE audit_events;
ALTER TABLE audit_events_v17 RENAME TO audit_events;
CREATE INDEX IF NOT EXISTS idx_audit_ts ON audit_events(ts);
CREATE INDEX IF NOT EXISTS idx_audit_type_ts ON audit_events(type, ts);
`

/** v18 增段（主机表七列 + `sandbox_onboarding` CHECK 重建（`'moved'`）+ 回填移交——store/STORE.md §2 v18 段逐字；sandbox 域——admin-chat-creds-merge 批）。
 *  ① `sandbox_runners` 七列 ALTER（**主机表 = 本表扩展**——KD-SV-133；密列恒 `iv|tag|ct`，不落明文 ∥ 零回显）；
 *  ② `sandbox_onboarding.credential_state` 三态 ⇒ 四态（+ `'moved'` = 凭据已移交主机行；表重建，列面 = v13 段 18 列）；
 *  ③ 回填移交（存量 `keep` ∧ 成功行按 id 序移交——同 runner 多行后者胜；移交行 ⇒ 密列零化 + `'moved'`；余行 NULL/`'none'`——零伪造回填）。
 *  语义/机制 = `sandbox/SANDBOX.md` §3 主机凭据块（单源）；端点 = `gateway/API.md` §2.5；执行面 = `thincoder-server/src/sandbox/hosts.mjs`。 */
const DDL_V18 = `
-- ① 主机表七列（加性——存量行 NULL／'none'；SSH 目标主机 = 行 address 的 host 部分，不另设 ssh_host 列）
ALTER TABLE sandbox_runners ADD COLUMN ssh_port INTEGER;               -- SSH 端口（NULL = 未设——写面缺省 22）
ALTER TABLE sandbox_runners ADD COLUMN ssh_user TEXT;                  -- SSH 用户（NULL = 未设）
ALTER TABLE sandbox_runners ADD COLUMN auth_kind TEXT;                 -- 认证形（key ∥ password——应用层校验）
ALTER TABLE sandbox_runners ADD COLUMN secret_cipher TEXT;             -- 凭据密文（AES-256-GCM iv|tag|ct；NULL = 无凭据）
ALTER TABLE sandbox_runners ADD COLUMN sudo_cipher TEXT;               -- sudo 口令密文（可选——NULL = 无）
ALTER TABLE sandbox_runners ADD COLUMN credential_state TEXT NOT NULL DEFAULT 'none';  -- none ∥ sealed ∥ revoked（应用层校验）
ALTER TABLE sandbox_runners ADD COLUMN credential_updated_at TEXT;     -- 最近设/撤时刻（NULL = 未设）

-- ② sandbox_onboarding CHECK 重建（三态 ⇒ 四态：+ 'moved'——表重建，列面 = v13 段 18 列逐字）
CREATE TABLE sandbox_onboarding_v18 (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  host TEXT NOT NULL,                          -- 主机地址原文
  ssh_port INTEGER NOT NULL DEFAULT 22,
  ssh_user TEXT NOT NULL,
  auth_kind TEXT NOT NULL CHECK (auth_kind IN ('key','password')),
  secret_cipher TEXT,                          -- AES-256-GCM 包（iv|tag|ct —— base64 三段）；零化后 NULL
  sudo_cipher TEXT,                            -- 可选（同形）
  credential_mode TEXT NOT NULL CHECK (credential_mode IN ('burn','keep')),
  credential_state TEXT NOT NULL DEFAULT 'sealed' CHECK (credential_state IN ('sealed','burned','revoked','moved')),
  name TEXT,                                   -- 节点名（可选；缺省取探测主机名）
  model TEXT NOT NULL,                         -- 提交时所选模型
  status TEXT NOT NULL CHECK (status IN ('running','succeeded','failed','interrupted')),
  step TEXT,                                   -- 当前/最后一步 id
  steps_json TEXT NOT NULL DEFAULT '[]',       -- 步骤日志（读数面）
  runner_id INTEGER,                           -- 成功后关联（未成 NULL）
  created_by INTEGER,                          -- admin 成员 id
  created_at TEXT NOT NULL,
  finished_at TEXT
);
INSERT INTO sandbox_onboarding_v18 (id, host, ssh_port, ssh_user, auth_kind, secret_cipher, sudo_cipher, credential_mode, credential_state,
  name, model, status, step, steps_json, runner_id, created_by, created_at, finished_at)
  SELECT id, host, ssh_port, ssh_user, auth_kind, secret_cipher, sudo_cipher, credential_mode, credential_state,
    name, model, status, step, steps_json, runner_id, created_by, created_at, finished_at FROM sandbox_onboarding;
DROP TABLE sandbox_onboarding;
ALTER TABLE sandbox_onboarding_v18 RENAME TO sandbox_onboarding;
`

/** v18 回填移交（存量 `keep` ∧ 成功行 ⇒ 主机行七列 + run 行密列零化 + `'moved'`——`sandbox/SANDBOX.md` §3 主机凭据块）。
 *  同类两口径：**接收行** = 逐列值（同 runner 多行 ⇒ 后者胜——id 序）∥ **未接收行**（`keep` 未成功 ∥ 密文已零化 ∥ 余既有行）⇒ 新列 NULL/`'none'`（零伪造回填）。
 *  密文原样搬运（同一 `data/credentials.key`——KD-SV-84 单源；零解密零重加密）。 */
function backfillHostCredentials(db) {
  const rows = db.prepare(`SELECT id, runner_id, ssh_port, ssh_user, auth_kind, secret_cipher, sudo_cipher, finished_at, created_at
    FROM sandbox_onboarding WHERE credential_mode = 'keep' AND status = 'succeeded' AND secret_cipher IS NOT NULL ORDER BY id`).all()
  const writeHost = db.prepare(`UPDATE sandbox_runners SET ssh_port = ?, ssh_user = ?, auth_kind = ?, secret_cipher = ?, sudo_cipher = ?,
    credential_state = 'sealed', credential_updated_at = ? WHERE id = ?`)
  const zeroRun = db.prepare(`UPDATE sandbox_onboarding SET secret_cipher = NULL, sudo_cipher = NULL, credential_state = 'moved' WHERE id = ?`)
  for (const row of rows) {
    const written = writeHost.run(row.ssh_port ?? null, row.ssh_user ?? null, row.auth_kind ?? null, row.secret_cipher, row.sudo_cipher ?? null, row.finished_at ?? row.created_at, row.runner_id)
    if (written.changes === 0) continue // 接收行不在（runner_id NULL ∥ 行已删）⇒ 留 run 行（与 live 径同判——零吞密）
    zeroRun.run(row.id)
  }
}

/** v19 增段（`api_keys.key_plain` 增列——store/STORE.md §2 v19 段逐字；accounts 域——server-wake-face 批 · 修订轮）。
 *  ① 管理面 sk 明文列（NULL = 常规 key——服务端不留明文，既有行为零变；非空 = 服务端自持面——管理会话出口经网关链
 *  回环，每回合需真凭据送验）；② 写面唯一 = `issueKey({ keepPlain: true })` ∥ 读面 = `agentKeyOf`（逐请求查库 ⇒ 吊销即断）；
 *  ③ 零回填（存量行 NULL——常规 key 语义零变）。
 *  语义/机制 = `agent/ADMIN-AGENT.md` §16.3（单源）；键面 = `accounts/ACCOUNTS.md` §1；判据 = `store/STORE.md` §3 v19 行。 */
const DDL_V19 = `
-- ① 管理面 sk 明文列（NULL = 常规 key（服务端不留明文）∥ 非空 = 服务端自持面——服务端即消费方；同沙盒工作区 key_plain 先例）
ALTER TABLE api_keys ADD COLUMN key_plain TEXT;
-- ② 审计 CHECK 零动（三 kind 不扩——管理面 sk 属 key 面，沿 KD-SV-108 先例；十四型不变）
`

/** v20 增段（团队台账表 + 审计 CHECK 再扩（十五型）——store/STORE.md §2 v20 段逐字；ledger 域——team-ledger 批）。
 *  ① `team_ledger_items` 单表（全局编号 ∥ 仓 = 归一地址（`projects.address` 同形）∥ 六态枚举沿本机台账）+ 两索引（筛选主查询 ∥ 按负责人筛）；
 *  ② 审计表重建（十四型 ⇒ 十五型：+ `ledger_event`——步序与 v10/v11/v14/v17 同构）；
 *  ③ 零回填（新表空 ∥ 存量审计行逐值保形）。
 *  语义/机制 = `ledger/LEDGER.md` §3/§4（单源）；端点 = `gateway/API.md` §2.10；判据 = `store/STORE.md` §3 v20 行。 */
const DDL_V20 = `
-- ① 团队台账表（单表——全局编号；仓 = 归一地址（\`projects.address\` 同形）；六态枚举沿本机台账）
CREATE TABLE IF NOT EXISTS team_ledger_items (
  id         INTEGER PRIMARY KEY AUTOINCREMENT, -- 全局编号（全队一号空间——跨本引用可解析）
  repo       TEXT NOT NULL,                     -- 仓标记（归一形 \`host[:port]/path\`；非 FK——项目删除不级联，KD-SV-147）
  status     TEXT NOT NULL CHECK(status IN ('待讨论','待设计','在途','待核销','已核销','已废弃')),
  title      TEXT NOT NULL,                     -- 标题（≤200——应用层校验）
  detail     TEXT,                              -- 正文/说明（≤4000；追认核销须非空）
  owner      TEXT NOT NULL,                     -- 负责人（统一用户名键——不要求现存账号）
  created_by TEXT NOT NULL,                     -- 写入者（用户名）
  created_at TEXT NOT NULL,
  updated_at TEXT,                              -- 老化行龄源 = updated_at ?? created_at（未决态 ∧ >30 天 ⇒ aged）
  closed_at  TEXT
);
CREATE INDEX IF NOT EXISTS idx_team_ledger_repo_status ON team_ledger_items(repo, status);
CREATE INDEX IF NOT EXISTS idx_team_ledger_owner ON team_ledger_items(owner);

-- ② 审计 CHECK 再扩（十四型 ⇒ 十五型：+ 'ledger_event'——表重建，步序与 v10/v11/v14/v17 同构）
--    kind 枚举（四 kind）：create ∥ edit ∥ close ∥ withdraw（kind 非 CHECK 枚举——逐 kind 归 accounts/ACCOUNTS.md §2.1）
CREATE TABLE audit_events_v20 (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  ts          INTEGER NOT NULL,              -- unix ms（事件时刻）
  type        TEXT NOT NULL CHECK (type IN ('login_success','login_failure','login_locked',
    'key_rotate','key_issue','key_revoke','password_change','password_reset','member_create','config_update',
    'sandbox_rule','sandbox_event','agent_event','project_event','ledger_event')),
  actor_id    INTEGER,                       -- 行为人成员 id（无会话 ∥ 未知用户名 ⇒ NULL；无 FK——历史记录自足）
  actor_name  TEXT NOT NULL,                 -- 行为人名快照（用户名 ∥ 展示名 ∥ 'cli' ∥ 'scheduler' ∥ 'webhook'）
  target_id   INTEGER,                       -- 对象成员 id（无对象 ⇒ NULL）
  target_name TEXT NOT NULL DEFAULT '',      -- 对象名快照（无对象 ⇒ 空串；台账类事件 = 'ledger:<id>' 可读形）
  detail      TEXT NOT NULL DEFAULT '{}'     -- 附加形（JSON：kind ∥ id ∥ repo ∥ surface 等）
);
INSERT INTO audit_events_v20 (id, ts, type, actor_id, actor_name, target_id, target_name, detail)
  SELECT id, ts, type, actor_id, actor_name, target_id, target_name, detail FROM audit_events;
DROP TABLE audit_events;
ALTER TABLE audit_events_v20 RENAME TO audit_events;
CREATE INDEX IF NOT EXISTS idx_audit_ts ON audit_events(ts);
CREATE INDEX IF NOT EXISTS idx_audit_type_ts ON audit_events(type, ts);
`

/** v21 增段（`git_sources.scope_kind` 增列 + 存量回填——store/STORE.md §2 v21 段逐字；project 域——gitee-namespace-kinds 批 · 台账 #1365）。
 *  ① gitee 范围类型列（`personal` ∥ `org` ∥ `enterprise`——NULL 放行；非 gitee 恒 NULL）；
 *  ② 存量回填（仅 gitee——零猜测：scope 在场 ⇒ `'org'`（沿现行路由——组织零回归）∥ scope 空 ⇒ `'personal'`；非 gitee 行零动）。
 *  语义/机制 = `project/PROJECTS.md` §2/§4（KD-SV-151 单源）；判据 = `store/STORE.md` §3 v21 行。 */
const DDL_V21 = `
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
const DDL_V22 = `
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
const DDL_V23 = `
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
const DDL_V24 = `
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

/** 迁移链：每段 = `{ v, up(db) }`（v = 目标结构版本，自 1 起递增）；结构每变一次追一段（+1）。 */
export const MIGRATIONS = [
  { v: 1, up: (db) => db.exec(DDL_V1) },
  { v: 2, up: (db) => db.exec(DDL_V2) },
  { v: 3, up: (db) => db.exec(DDL_V3) },
  { v: 4, up: (db) => db.exec(DDL_V4) },
  { v: 5, up: (db) => db.exec(DDL_V5) },
  { v: 6, up: (db) => db.exec(DDL_V6) },
  { v: 7, up: (db) => db.exec(DDL_V7) },
  { v: 8, up: (db) => db.exec(DDL_V8) },
  { v: 9, up: (db) => db.exec(DDL_V9) },
  { v: 10, up: (db) => db.exec(DDL_V10) },
  { v: 11, up: (db) => db.exec(DDL_V11) },
  { v: 12, up: (db) => db.exec(DDL_V12) },
  { v: 13, up: (db) => db.exec(DDL_V13) },
  { v: 14, up: (db) => db.exec(DDL_V14) },
  { v: 15, up: (db) => db.exec(DDL_V15) },
  { v: 16, up: (db) => db.exec(DDL_V16) },
  { v: 17, up: (db) => db.exec(DDL_V17) },
  { v: 18, up: (db) => { db.exec(DDL_V18); backfillHostCredentials(db) } }, // v18：主机表七列 + 四态 CHECK + 回填移交（迁移段 = 结构变 + 回填——单事务同段）
  { v: 19, up: (db) => db.exec(DDL_V19) }, // v19：`api_keys.key_plain` 增列（管理面 sk 明文面——零回填）
  { v: 20, up: (db) => db.exec(DDL_V20) }, // v20：团队台账表 + 两索引 + 审计 CHECK 重建（十五型：+ ledger_event——零回填）
  { v: 21, up: (db) => db.exec(DDL_V21) }, // v21：`git_sources.scope_kind` 增列 + 存量回填（gitee 范围三态——零猜测；非 gitee 零动）
  { v: 22, up: (db) => db.exec(DDL_V22) }, // v22：沙盒收正（工作区表重建 + `sandbox_tasks` 删表 + `registry_credentials` 建表 + 连接材料四列——列面/语义单源 = store/STORE.md §2 v22 段）
  { v: 23, up: (db) => db.exec(DDL_V23) }, // v23：成员 git 凭据表 + 审计 CHECK 重建（十六型：+ member_event——会话两表不建；语义单源 = store/STORE.md §2 v23 段）
  { v: 24, up: (db) => db.exec(DDL_V24) }, // v24：`mcp_servers` 建表 + 审计 CHECK 重建（十七型：+ mcp_event；语义单源 = store/STORE.md §2 v24 段）
]

/** 当前结构版本（= 链尾段号——store/STORE.md §1）。 */
export const SCHEMA_VERSION = MIGRATIONS[MIGRATIONS.length - 1].v

/** 迁移：读 `user_version` ⇒ 顺序执行 `v > 当前` 的段（每段单事务 + 升号；抛错 ⇒ 回滚 + 抛）。 */
export function migrate(db, { migrations = MIGRATIONS } = {}) {
  let version = readVersion(db)
  for (const step of migrations) {
    if (step.v <= version) continue
    db.exec("BEGIN")
    try {
      step.up(db)
      db.exec(`PRAGMA user_version = ${Number(step.v)}`)
      db.exec("COMMIT")
      version = step.v
    } catch (e) {
      db.exec("ROLLBACK")
      throw new Error(`迁移失败（v${step.v}）：${e.message}`)
    }
  }
  return version
}

/** 结构版本读数（空库 ⇒ 0）。 */
export function readVersion(db) {
  return Number(db.prepare("PRAGMA user_version").get().user_version ?? 0)
}
