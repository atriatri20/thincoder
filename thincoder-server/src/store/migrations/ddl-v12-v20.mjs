/**
 * ddl-v12-v20.mjs — 迁移链 v12–v20 的 DDL 常量（store/STORE.md §2 v12–v20 段逐字；自 `../migrations.mjs` 按版本区间逐字搬迁——零语义改动）。
 *
 * 唯一消费方 = `../migrations.mjs` 的 `MIGRATIONS` 序表；导出面 = `DDL_V12`…`DDL_V20`。
 */

/** v12 增段（`sandbox_runners` 表重建——旧通道形态 ⇒ Docker 节点形态——store/STORE.md §2 v12 段逐字；sandbox 域）。
 *  ① 建新表（列面 = v11 段所列：id/name/address/status/runtime_json/created_at）⇒ ② 存量行弃（旧通道行无地址可取、令牌/心跳语义整废——一次性过渡）
 *  ⇒ ③ DROP ⇒ ④ RENAME（沿 v10 表重建先例——SQLite 不可改列集/CHECK）。 */
export const DDL_V12 = `
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
export const DDL_V13 = `
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
export const DDL_V14 = `
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
export const DDL_V15 = `
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
export const DDL_V16 = `
-- ① 会话档位列（NULL = 未设——默认态；值域 = 该模型核枚举 \`reasoningEffortEnum\`，应用层校验）
ALTER TABLE agent_chats ADD COLUMN reasoning TEXT;
-- ② 审计 CHECK 零动（三 kind 不扩——档位写 = 会话设置面，沿 KD-SV-108 先例；十三型不变）
`

/** v17 增段（git 源/项目/项目成员三表 + 审计 CHECK 再扩（十四型）——store/STORE.md §2 v17 段逐字；project 域——team-projects-permissions 批）。
 *  ① 三表（源 ∥ 项目（仓） ∥ 项目成员）+ 两索引；② 审计表重建（十三型 ⇒ 十四型：+ `project_event`——步序与 v10/v11/v14 同构）。
 *  语义/机制 = `project/PROJECTS.md` §2/§4/§5（单源）；PAT 密文包形 = `store/credential-crypto.mjs`（KD-SV-119）；判据 = `store/STORE.md` §3 v17 行。 */
export const DDL_V17 = `
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
export const DDL_V18 = `
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

/** v19 增段（`api_keys.key_plain` 增列——store/STORE.md §2 v19 段逐字；accounts 域——server-wake-face 批 · 修订轮）。
 *  ① 管理面 sk 明文列（NULL = 常规 key——服务端不留明文，既有行为零变；非空 = 服务端自持面——管理会话出口经网关链
 *  回环，每回合需真凭据送验）；② 写面唯一 = `issueKey({ keepPlain: true })` ∥ 读面 = `agentKeyOf`（逐请求查库 ⇒ 吊销即断）；
 *  ③ 零回填（存量行 NULL——常规 key 语义零变）。
 *  语义/机制 = `agent/ADMIN-AGENT.md` §16.3（单源）；键面 = `accounts/ACCOUNTS.md` §1；判据 = `store/STORE.md` §3 v19 行。 */
export const DDL_V19 = `
-- ① 管理面 sk 明文列（NULL = 常规 key（服务端不留明文）∥ 非空 = 服务端自持面——服务端即消费方；同沙盒工作区 key_plain 先例）
ALTER TABLE api_keys ADD COLUMN key_plain TEXT;
-- ② 审计 CHECK 零动（三 kind 不扩——管理面 sk 属 key 面，沿 KD-SV-108 先例；十四型不变）
`

/** v20 增段（团队台账表 + 审计 CHECK 再扩（十五型）——store/STORE.md §2 v20 段逐字；ledger 域——team-ledger 批）。
 *  ① `team_ledger_items` 单表（全局编号 ∥ 仓 = 归一地址（`projects.address` 同形）∥ 六态枚举沿本机台账）+ 两索引（筛选主查询 ∥ 按负责人筛）；
 *  ② 审计表重建（十四型 ⇒ 十五型：+ `ledger_event`——步序与 v10/v11/v14/v17 同构）；
 *  ③ 零回填（新表空 ∥ 存量审计行逐值保形）。
 *  语义/机制 = `ledger/LEDGER.md` §3/§4（单源）；端点 = `gateway/API.md` §2.10；判据 = `store/STORE.md` §3 v20 行。 */
export const DDL_V20 = `
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

