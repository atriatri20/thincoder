# Thincoder Server · 存储（store/STORE）

> 板块 = server ∥ 本档 = store 域（库 ∥ DDL ∥ 迁移链——accounts 与 metering 共用）；板总览 = `PROJECT.md`（文档地图 = §3）。
> 结构面档（表语义 = 各域档）；数据面 AC = `metering/METERING.md` §4 ∥ `accounts/ACCOUNTS.md` §5（审计事件面）；结构升版判据 = §3 v3 段（空库直落 ∥ v2 旧库启动自动升——随单元测试档）。
> 建档：2026-10-06（批 `docs/batches/2026-10-06-server-gateway.md` 设计轮；同日补轮——B 案织入 + 三层结构）。

## 1. 库形态

- 单库单连接（`DatabaseSync`）；PRAGMA：WAL ∥ `synchronous=NORMAL` ∥ `busy_timeout=5000` ∥ `foreign_keys=ON`。
- 库文件默认 = `thincoder-server/data/gateway.db`（运行期生成，不入 git）。
- 结构版本 = `PRAGMA user_version`（当前 = **24**——v2 增 `providers` ∥ v3 增 `audit_events` 与三索引 ∥ v4 增 `providers.settings_json`（模型设置——服务模型配置面） ∥
  v5 增模型标识两字段拆列 + 派生两表 + 成员配额列 ∥ v6 增成员模型禁用列（详见 §2 v5/v6 段） ∥ v7 增 provider 模型元数据留存列 ∥ **v8 增 key 名称列（`api_keys.name`——me-keys 批）**（详见 §2 v7/v8/v9 段） ∥
  v9 增 provider 上游代理旗（`providers.proxy`——server 代理批） ∥ **v10 增审计型 `config_update`（`audit_events` 重建——CHECK 扩型；配置控制台批）**（详见 §2 v10 段） ∥ **v11 增沙盒七表 + 审计 CHECK 再扩（十二型——server-exec-sandbox 批）**（详见 §2 v11 段） ∥
   **v12 `sandbox_runners` 表重建（Docker 节点形态——runner-admin-console 批）**（详见 §2 v12 段） ∥ **v13 增 `sandbox_onboarding` 表（托管接入——runner-admin-console 批增补；2026-10-14 起 = 停机留史——数据不删 ∥ 零写入零读面）**（详见 §2 v13 段） ∥
  **v14 增 agent chat 两表 + 审计 CHECK 再扩（十三型——admin-agent-chat 批）**（详见 §2 v14 段） ∥ **v15 增 `image_sources` 表（镜像源清单——sandbox-image-sources 批）**（详见 §2 v15 段） ∥ **v16 增会话级思考档位列（`agent_chats.reasoning`——console-reasoning-levels 批）**（详见 §2 v16 段）
   ∥ **v17 增 git 源/项目/项目成员三表 + 审计 CHECK 再扩（十四型——team-projects-permissions 批）**（详见 §2 v17 段） ∥ **v18 增主机表七列 + `sandbox_onboarding` 凭据态四值（`'moved'`）+ 回填移交（admin-chat-creds-merge 批——段号收正 2026-10-13：实落次序在先）**（详见 §2 v18 段）
  ∥ **v19 增 `api_keys.key_plain` 列（管理面 sk 明文面——server-wake-face 批修订轮——段号收正 2026-10-13：实落次序在后）**（详见 §2 v19 段）
  ∥ **v20 增团队台账表 + 审计 CHECK 再扩（十五型——team-ledger 批）**（详见 §2 v20 段）
  ∥ **v21 增 `git_sources.scope_kind` 列 + 存量回填（gitee 范围三态——gitee-namespace-kinds 批）**（详见 §2 v21 段）；
  ∥ **v22 收正段（`sandbox_workspaces` 表重建（去 `required_labels_json` ∥ 增 `stop_reason` ∥ 增 `base_image`）+ 增建 `registry_credentials` 表 + `sandbox_tasks` 删表 + 增 `sandbox_runners` 连接材料四列（TLS 档——本增补 #2）——sandbox 域；sandbox-exec-rebuild 批）**（详见 §2 v22 段）
  ∥ **v23 增成员 git 凭据表 + 审计 CHECK 再扩（十六型——member-face-chat 批；会话两表不建——题一裁定会话真源在盒内）**（详见 §2 v23 段）；
  ∥ **v24 增 `mcp_servers` 表 + 审计 CHECK 再扩（十七型——mcp 域；server-mcp 批）**（详见 §2 v24 段）；
  未发布期连续演进，无历史库迁移包袱——旧库启动自动升；迁移链机制自 v1 起备）。
- server-model-alias 批（2026-10-09——台账 #1153）：**零结构变更**（别名落 `models_json` 元素——JSON 文本内演进；无新列/新表/新段——结构版本保持 **10**）。

## 2. DDL（v1 基线四表 + v2–v23 增段）

### v1 基线（四表——逐字）

```sql
PRAGMA journal_mode = WAL;      -- 读并发 + 单写者
PRAGMA synchronous = NORMAL;    -- 进程崩溃安全；掉电丢最后若干提交（内部计量档位——登记）
PRAGMA busy_timeout = 5000;
PRAGMA foreign_keys = ON;

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
```

### v2 增段（`providers`——gateway 域）

```sql
CREATE TABLE IF NOT EXISTS providers (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT NOT NULL UNIQUE,             -- 对外标识前缀（无 `/`；重名拒）
  base_url    TEXT NOT NULL,                    -- OpenAI 兼容根
  api_key     TEXT NOT NULL DEFAULT '',         -- 明文 ∥ `env:NAME` 引用（空 = 不发 Authorization；解析 = 注册表构建期）
  models_json TEXT NOT NULL DEFAULT '[]',       -- 开放清单（JSON 数组——条目两形：字符串 = 上游模型名（无别名）∥ 对象 { name, alias }（配别名）；对外标识 = alias ∥ provider/model——2026-10-09 alias 批）
  created_at  TEXT NOT NULL,
  updated_at  TEXT NOT NULL
);
```

- 条目两形与别名语义（2026-10-09 alias 批——KD-SV-59）：别名 = 元素内字段（`{ name, alias }`——alias 非空 ∥ 不含斜杠；字符串条目 = 无别名）；**零迁移**（列形不变——旧行字符串天然兼容；保存径归一 = 别名缺省/空回落字符串形）；校验/唯一性/派发 = `gateway/API.md` §2.2 ∥ §6 KD-SV-59；配置面（种子）= `ops/OPS.md` §1。

### v3 增段（`audit_events` 事件表 + 三索引——accounts 域 ∥ metering 域）

```sql
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
```

- `audit_events` 语义与写入点清单 = `accounts/ACCOUNTS.md` §2.1；快照名（`actor_name` ∥ `target_name`）= 成员改名/删除后记录仍可读（无 FK 约束成员生命周期）；保留窗 = 与 usage 同窗同清（`metering/METERING.md` §1 口径）。
- `idx_usage_key_ts` = key 级明细查询索引（「最后使用 ∥ 窗口内用量」——`metering/METERING.md` §3）。

### v4 增段（`providers.settings_json`——gateway 域）

```sql
ALTER TABLE providers ADD COLUMN settings_json TEXT NOT NULL DEFAULT '{}';  -- 模型设置映射（JSON 对象——形见下）
```

- 形 = `{ "<上游模型名>": { rpm ∥ tpm（正整数 ∥ null） ∥ costIn ∥ costOut（≥0 数 ∥ null） ∥ note（≤200 字 ∥ null） ∥ quotaTokens（≥0 整数 ∥ null——每人每月默认用量；v5 批新增） } }`——`null`/缺省 = 未设；键 = 上游模型名（与 `models` 同空间；不在 `models` 的键合法——设置随名保留，停用不丢）。
- 写面 = PATCH `/api/admin/providers/:id` 的 `settings` 键级合并（`gateway/API.md` §2.2）；校验单源 = `thincoder-server/src/ops/config.mjs`（`validateProviderEntry`/`validateProviderEntries` 扩 settings——未知子字段 ∥ 非法值 ⇒ 400/拒启）；装配载入缺省 = `{}`（配置种子零 settings 字段——控制台单一面）。
- 消费 = 限流（`gateway/ratelimit.mjs`——KD-SV-35）读 `rpm`/`tpm`；`costIn`/`costOut`/`note` = 展示面（`webui/ADMIN.md` §2.1③）；`quotaTokens` = 配额平台层默认值（`metering/METERING.md` §2——三级之一，KD-SV-38）。

### v5 增段（模型标识两字段拆列 + 派生两表 + 成员配额列——metering ∥ accounts 域；配额分模型批）

```sql
-- ① usage 两字段拆列（KD-SV-40）：内部真名两字段（对外显示 = 别名回映射——2026-10-09 alias 批）；`model` 可含斜杠；嵌入行 `provider = ''`（无前缀命名空间）
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
```

- `provider` 约定（usage ∥ usage_daily ∥ quota_counters 三表同构）：chat 行 = provider 名（无 `/`）；嵌入行 = `''`（无 provider 维——回拼 = `model` 单段）；**对外标识 = 别名回映射**（配别名模型——读面单源 = `thincoder-server/src/gateway/providers.mjs` 别名索引；2026-10-09 alias 批——KD-SV-59）。
- 两派生表 = **可重算**（`usage reconcile`——`metering/METERING.md` §2）；**不设 FK**（派生面自足——沿 `audit_events` 无 FK 口径；成员删除本无路径）；唯一键即查形（日表 = `day` 前缀日窗扫描；计数表 = 四列点查 O(1)——`EXPLAIN` 预期 `SEARCH … USING INDEX sqlite_autoindex_… (…)`）。
- 保留/清理 = 与 usage **同窗同清**（`metering/METERING.md` §1——三表同事务删除）。

### v6 增段（`members.model_disabled_json`——accounts 域；配额 v2 · 成员模型面批）

```sql
ALTER TABLE members ADD COLUMN model_disabled_json TEXT NOT NULL DEFAULT '{}';  -- 成员 × 模型禁用集（JSON 对象——键 = 对外标识；值 = true）
```

- 形 = `{ "<对外标识（别名 ∥ provider/model）>": true }`——键 = 对外标识（与 `model_quotas_json` 同空间；键形校验同助手——非空 ∥ 无首尾空白 ∥ 含斜杠时两段非空（裸名 = 别名形合法——#1008 收正；2026-10-09 alias 批））；值仅 `true`（禁用）；删键 = 恢复可用；缺省 `{}` = **默认全可用**。
- 机制全文 = `accounts/ACCOUNTS.md` §2.2；消费面 = 鉴权行携带（`accounts/keys.mjs` `verifyKey`——沿 `model_quotas_json` 零查询口径） ⇒ 网关准入（`gateway/API.md` §2.1）+ `/v1/models` 随动滤除 + 成员弹窗勾选态（`webui/ADMIN.md` §2.1②）。
- 与 `model_quotas_json`（v5）并列：两列各管一轴——配额 = 用量限额 ∥ 禁用 = 可用性（优先级判据 = `accounts/ACCOUNTS.md` §2.2）。

### v7 增段（`providers.model_meta_json`——gateway 域；Provider 模型元数据批）

```sql
ALTER TABLE providers ADD COLUMN model_meta_json TEXT NOT NULL DEFAULT '{}';  -- 上游模型元数据留存图（JSON 对象——形见下）
```

- 形 = `{ "<上游模型名>": { displayName? ∥ contextWindow?（正整数） ∥ vision?（`true`） ∥ status?（退役状态原文） } }`——**≥1 字段才入键**（缺就空着——零兜底值、零占位）；只含开放清单（`models_json`）模型（写面求交）。
- 保留集与各上游来源映射 = `gateway/API.md` §2.2「模型元数据」条（逐字）；本列 = **纯展示数据**（转发 ∥ 派发 ∥ `/v1/models` 零涉）。
- 写面 = 保存路径（POST/PATCH）携 `modelMeta`（键在场 = 期望图——白名单过滤 + 形不符即略 + 求交；缺省 = 现存按求交滑动）；读面 = `rowToEntry` 解码（坏 JSON ⇒ 行数据损坏抛——沿 `models_json`/`settings_json` 口径）；消费 = 控制台 Provider 详情弹窗（`webui/ADMIN.md` §2.1④）。

### v8 增段（`api_keys.name`——accounts 域；me-keys 批）

```sql
ALTER TABLE api_keys ADD COLUMN name TEXT NOT NULL DEFAULT '';  -- key 名称（空串 = 迁移前存量行——随段回填默认名）
UPDATE api_keys SET name = 'key-' || (SELECT COUNT(*) FROM api_keys k2 WHERE k2.member_id = api_keys.member_id AND k2.id <= api_keys.id);  -- 存量行回填默认名（key-N——按成员签发序）
```

- 形 = 自由文本标签（≤40 字符——服务层 trim 后校验；空名 ⇒ 服务层生成默认名 `key-N` 落库）；**非标识**——寻址仍按 `id`/提示形（重名允许 ∥ 无唯一索引）。
- 语义与写面 = `accounts/ACCOUNTS.md` §1.1（命名规则 ∥ 上限 ∥ 自助签发/吊销）；读面 = `memberView` key 行（`name` 随行下发——仅未吊销）；消费 = 控制台「我的·key 与签发」表列（`webui/ME.md` §2.1）。
- 回填口径：N = 该成员按 `id` 升序的序号（含吊销行——单调不复用；后续签发 = 服务层按同口径续编）；**逐行结果稳定**（子查询只读 `member_id`/`id`——两列不被本 UPDATE 改写，扫描顺序无关）。

### v9 增段（`providers.proxy`——gateway 域；server 代理批）

```sql
ALTER TABLE providers ADD COLUMN proxy INTEGER NOT NULL DEFAULT 0;  -- 上游代理旗（1 = 该渠上游请求经代理；0 = 直连——缺省）
```

- 形 = 布尔旗（SQLite 无布尔——1/0；非布尔 ⇒ 写面 400 ∥ 配置面拒启）；读面解码 = `rowToEntry` 转 boolean（`proxy: row.proxy === 1`——沿 `settings`/`modelMeta` 解码位）。
- 语义与判定 = `gateway/API.md` §6 KD-SV-55（旗 1 ∧ 顶层 `proxy.uri` 在案 ⇒ 该渠上游请求经代理——chat ∥ 发现同判定）；配置面 = `ops/OPS.md` §1（顶层 `proxy` 段）；控制台面 = `webui/ADMIN.md` §2.1④。
- 圈界：纯路由旗——零计量 ∥ 零展示涉 ∥ 不参与 `/v1/models` 与元数据面。

### v10 增段（`audit_events.type` CHECK 扩型——accounts 域；配置控制台批）

```sql
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
```

- 形 = 十型（九型 + `config_update`——配置写入事件）；`detail.keys` = 变更键名清单（值永不入——密钥/uri 洁癖）；actor = admin 名快照（target = 无——空串）。
- 语义与写入点 = `accounts/ACCOUNTS.md` §2.1（写入面 = `src/gateway/config-admin.mjs`（已落盘 · 实读 **182** 行）——写盘成功后一条；失败 ⇒ warn，不反噬已落盘事实）；消费 = 审计页类型下拉/文案（`webui/READINGS.md` §2.1④——型面现状 = 十三型，v14 段）。
- 圈界：重建净零新表/新列——判据 = 行拷贝逐值（含 id 连续）+ 两索引在场。

### v11 增段（沙盒七表 + 审计 CHECK 再扩——sandbox 域；server-exec-sandbox 批）

```sql
-- ① 沙盒七表（对象模型 = `sandbox/SANDBOX.md` §2——单源）
CREATE TABLE IF NOT EXISTS sandbox_runners (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,                  -- 节点名（登记时给）
  address TEXT NOT NULL,                      -- Docker API 地址（登记时给）
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','disabled')),
  runtime_json TEXT NOT NULL DEFAULT '{}',    -- 连通自检读数
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS sandbox_workspaces (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  owner_member_id INTEGER NOT NULL REFERENCES members(id),
  key_id INTEGER NOT NULL REFERENCES api_keys(id),
  key_plain TEXT NOT NULL,                    -- 工作区 key 明文（盒重建再注入——披露 D2）
  runner_id INTEGER,                          -- 绑定节点（未绑定 ⇒ NULL）
  limits_json TEXT NOT NULL DEFAULT '{}',     -- 每工作区覆写（资源 + TTL；键集/取值序 = `sandbox/SANDBOX.md` §2；空 = 随全局默认）
  created_at TEXT NOT NULL
);
-- 注：本表列面（去 `required_labels_json`）与实表已收正在态——v22 段表重建（sandbox-exec-rebuild 批）。
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
  kind TEXT NOT NULL,                         -- 'sandbox.*'；'ci.*' 预留（执行面与 CI 共用——KD-SV-72）
  payload_json TEXT NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued','done','failed','unsupported')),
  created_at TEXT NOT NULL,
  finished_at INTEGER,
  result_json TEXT
);
-- 注：本表（指令队列）随执行面重做退场——v22 段删表（sandbox-exec-rebuild 批 KD-SV-161；本段 DDL 为历史形，保留在链）。
CREATE TABLE IF NOT EXISTS sandbox_checkpoints (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  workspace_id INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  size INTEGER NOT NULL,                      -- 字节
  blob_path TEXT NOT NULL,
  note TEXT NOT NULL DEFAULT ''
);
CREATE TABLE IF NOT EXISTS sandbox_settings (
  k TEXT PRIMARY KEY,                         -- 全局默认——键全集与值形 = `gateway/API.md` §2.5（单源）；「默认单」非本表（= sandbox_rules 种子行）
  v TEXT NOT NULL                             -- JSON 文本（数字 ∥ 字符串统一 JSON 编码）
);

-- ② 审计 CHECK 再扩（十型 ⇒ 十二型——表重建，步序与 v10 同构）
-- + 'sandbox_rule'（规则增删——detail = { action, rule }）∥ + 'sandbox_event'（审批三态/超时 ∥ 盒起停拆 ∥ 节点添加/删除（含连通自检失败行） ∥ 快照——detail = { kind, ... }）
-- 重建步（建新表（十二型 CHECK） ∥ 拷贝 ∥ DROP ∥ RENAME ∥ 两索引重建——SQL 形同 v10 段，逐字替换型清单）。
-- ③ 种子（初始化点 = 本段一次性写入；可改可删——不复活）
--   sandbox_rules 八行（source='default'）：deny（cidr）= 10.0.0.0/8 ∥ 172.16.0.0/12 ∥ 192.168.0.0/16；
--   allow（domain）= registry.npmjs.org ∥ github.com ∥ *.githubusercontent.com ∥ gitee.com ∥ *.gitee.com；
--   恒拒（127.0.0.0/8 ∥ 169.254.0.0/16）= 内置（非行——不入种子）；动态项（服务器网段 ∥ 节点自身网段）登记时自动带入。
```

- 语义/对象模型 = `sandbox/SANDBOX.md` §2/§3–§7（单源）；端点 = `gateway/API.md` §2.5/§2.7。
- 圈界：`sandbox_settings` = 键值设置面（全局默认——键全集/值形 = `gateway/API.md` §2.5）；`sandbox_*` 与 `members`/`api_keys` 的引用 = `owner_member_id` ∥ `key_id`（沿 `api_keys` 先例）；`sandbox_pending`/`sandbox_checkpoints` 无 FK（历史/瞬态面自足——沿 `audit_events` 口径）。

- 表归属：`members` ∥ `api_keys` ∥ `sessions` ∥ `audit_events` = accounts 域（`accounts/ACCOUNTS.md`）；`usage` ∥ `usage_daily` ∥ `quota_counters` = metering 域（`metering/METERING.md`）；`providers` = gateway 域（provider 管理面 ∥ v4 模型设置——`gateway/API.md` §2.2）；
  `sandbox_runners` ∥ `sandbox_workspaces` ∥ `sandbox_rules` ∥ `sandbox_pending` ∥ `sandbox_checkpoints` ∥ `sandbox_settings` ∥ **`registry_credentials`（本增补）** = sandbox 域（v22 后**七表**——`sandbox/SANDBOX.md` §2 对象模型单源；`sandbox_tasks` 随队列退场——v22 段删表）；结构单源 = 本档。

### v12 增段（`sandbox_runners` 表重建——sandbox 域；runner-admin-console 批）

（背景：v11 段所列 `sandbox_runners` 列面 = 执行面重定后的**目标形**；v11 实落为旧通道形态（`token_hash` ∥ `labels_json` ∥ `last_heartbeat_at`）——本段一次重建收正，两形态不再并存。重建后列面以 §2 v11 段所列**为准**（本节不重复列举）。）

- **重建步**（SQLite 不可改列集——沿 v10 表重建先例）：① 建 `sandbox_runners_v12`（列面 = v11 段所列：`id` ∥ `name`（NOT NULL UNIQUE） ∥ `address`（NOT NULL） ∥ `status`（NOT NULL DEFAULT `'active'` CHECK `active`/`disabled`） ∥ `runtime_json`（NOT NULL DEFAULT `'{}'`——连通自检读数） ∥ `created_at`（NOT NULL））。
  ⇒ ② **存量行弃**（不迁——旧通道行无地址可取、令牌/心跳语义整废；一次性过渡行为）⇒ ③ `DROP TABLE sandbox_runners` ⇒ ④ `RENAME` ⇒ 无索引/无 FK（沿先例——`sandbox_workspaces.runner_id` 无 FK）。
- **判据（单元测试档）**：空库读数 12 ∥ v11 库升后读数 12 ∥ v12 段幂等（再开零变）∥ 列面五行在场（`pragma_table_info`）∥ 旧三列名不在（`token_hash` ∥ `labels_json` ∥ `last_heartbeat_at`）∥ 存量行弃（含旧行的 v11 库升后 ⇒ 空表）。
- 同段旁注（**收正在态——2026-10-13**）：v11 段所列 `sandbox_workspaces` 列面收正 = v22 段表重建（去 `required_labels_json`；增 `stop_reason` ∥ `base_image`——本增补）；`sandbox_tasks` = v22 段删表（队列退场——sandbox-exec-rebuild 批 KD-SV-161）。

### v13 增段（`sandbox_onboarding` 建表——sandbox 域；runner-admin-console 批增补（托管接入）；**停机留史（2026-10-14——托管接入退场：数据不删 ∥ 零写入零读面）**）

（背景：托管接入任务 + 凭据 = 单表；任务态/步骤读数/凭据密文共一行——**现状 = 停机留史（2026-10-14 托管接入退场；历史机制 as-of = `sandbox/SANDBOX.md` §2 停机留史注）。**）

- **建表**（`CREATE TABLE sandbox_onboarding`——列面逐列）：`id`（INTEGER PRIMARY KEY）∥ `host`（TEXT NOT NULL——主机地址原文）∥ `ssh_port`（INTEGER NOT NULL DEFAULT 22）∥ `ssh_user`（TEXT NOT NULL）∥ `auth_kind`（TEXT NOT NULL CHECK `'key'`/`'password'`）∥
  `secret_cipher`（TEXT——AES-256-GCM 包 `iv|tag|ct` base64；零化后 NULL）∥ `sudo_cipher`（TEXT——可选，同形）∥ `credential_mode`（TEXT NOT NULL CHECK `'burn'`/`'keep'`）∥ `credential_state`（TEXT NOT NULL DEFAULT `'sealed'` CHECK `'sealed'`/`'burned'`/`'revoked'`）∥
  `name`（TEXT——节点名（可选；缺省取探测主机名））∥ `model`（TEXT NOT NULL——提交时所选模型）∥ `status`（TEXT NOT NULL CHECK `'running'`/`'succeeded'`/`'failed'`/`'interrupted'`）∥ `step`（TEXT——当前/最后一步 id）∥
  `steps_json`（TEXT NOT NULL DEFAULT `'[]'`——步骤日志（读数面））∥ `runner_id`（INTEGER——成功后关联；未成 NULL）∥ `created_by`（INTEGER——admin 成员 id）∥ `created_at`（TEXT NOT NULL）∥ `finished_at`（TEXT）。
- **加密密钥** = `data/credentials.key`（32 字节；首用生成；0600——**不落库**；如实披露 = `sandbox/SANDBOX.md` §14 KD-SV-84 ∥ 单源 = `thincoder-server/src/store/credential-crypto.mjs`）。
- **判据（单元测试档）**：空库直落 13 ∥ v12 库升后读数 13 ∥ v13 段幂等（再开零变）∥ 列面十八列在场（`pragma_table_info`）∥ 凭据列读写往返（密文 ≠ 明文 ∥ 零化后 NULL）∥ 状态 CHECK 四值放行/越值拒。

### v14 增段（agent chat 两表 + 审计 CHECK 再扩——agent 域；admin-agent-chat 批）

（背景：管理面 chat = 会话 + 消息序两表（对象模型 = `agent/ADMIN-AGENT.md` §11——单源）；审计新型 `agent_event`（KD-SV-91）。）

```sql
-- ① 管理面 chat 两表
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
  data_json TEXT,                             -- role 附加形：assistant 的 toolCalls ∥ tool 的 toolCallId/名/摘要 ∥ notice 的 reason（五值枚举——重启收尾 "restart" ∥ 预算超限 "budget" ∥ 模型错误 "model_error" ∥ 空回合 "empty_turn" ∥ 手动中止 "aborted"）
  --                                          -- user 行携图 ⇒ imageParts（parts 数组素形——chat-shell-align 批；零结构变更）
  --                                          -- user 行 + `data.kind="reminder"`（提醒投递行——timer 到期 ∥ 后台任务结算；server-wake-face 批；零结构变更）
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_agent_chat_messages ON agent_chat_messages(chat_id, seq);

-- ② 审计 CHECK 再扩（十二型 ⇒ 十三型——表重建，步序与 v10/v11 同构）
-- + 'agent_event'（管理面 agent 会话——kind：chat_start（会话创建）∥ chat_call（每工具调用）∥ chat_stop（异常收尾：预算超限 ∥ 模型错误 ∥ 空回合 ∥ 重启中断 ∥ 手动中止）；
--   detail = { kind, chatId, tool?, call?, resultCode?, summary?, reason?（chat_stop——五值枚举同 v14 段 `data_json` 注） }——摘要截断 + 秘密掩蔽口径沿任务面）
-- 重建步（建新表（十三型 CHECK） ∥ 拷贝 ∥ DROP ∥ RENAME ∥ 两索引重建——SQL 形同 v10 段，逐字替换型清单）。
```

- 语义/对象模型 = `agent/ADMIN-AGENT.md` §11/§12（单源）；端点 = `gateway/API.md` §2.8；控制台面 = `webui/CHAT.md` §2.1；审计型面 = `accounts/ACCOUNTS.md` §2.1。
- 圈界：`agent_chat_messages.chat_id` 无 FK（沿 `audit_events`/沙盒瞬态表口径）；消息不回写/不归档（保留口径未裁——不设清零——`agent/ADMIN-AGENT.md` §10）。
- **判据（单元测试档）**：空库直落 14 ∥ v13 库升后读数 14 ∥ v14 段幂等（再开零变）∥ 两表列面在场（`pragma_table_info`）∥ `(chat_id, seq)` 索引在场 ∥ 存量审计行逐值保形 + 两索引在场 ∥ `agent_event` 型可写（CHECK 放行）∥ `role`/`status` CHECK 枚举放行/越值拒。

### v15 增段（`image_sources` 建表——sandbox 域；sandbox-image-sources 批）

（背景：控制台镜像源清单（增/删/改/列 + 常用源预选）——对象模型/机制 = `sandbox/SANDBOX.md` §3；**拉取机器侧零改；消费面 = 显式选源（KD-SV-96）**。）

```sql
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
```

- 语义/机制 = `sandbox/SANDBOX.md` §3（单源）；端点 = `gateway/API.md` §2.5 镜像源七行；审计 kind = `accounts/ACCOUNTS.md` §2.1。
- 圈界：`created_by` 无 FK（沿 `audit_events`/沙盒瞬态表口径）；**清单不镜像远端**（远端态不落库——读时读；KD-SV-79 精神）。
- **判据（单元测试档）**：空库直落 15 ∥ v14 库升后读数 15 ∥ v15 段幂等（再开零变）∥ 列面五列在场（`pragma_table_info`）∥ 重名/重址插入拒（UNIQUE 两枚）∥ 存量表零变。

### v16 增段（`agent_chats.reasoning` 增列——agent 域；console-reasoning-levels 批）

（背景：控制台对话页思考档位选择器——会话级档位（与 `model` 同层）；对象模型/机制 = `agent/ADMIN-AGENT.md` §11.4；**列级 `ALTER`——表不重建**。）

```sql
-- ① 会话档位列（NULL = 未设——默认态；值域 = 该模型核枚举 `reasoningEffortEnum`，应用层校验）
ALTER TABLE agent_chats ADD COLUMN reasoning TEXT;
-- ② 审计 CHECK 零动（三 kind 不扩——档位写 = 会话设置面，沿 KD-SV-108 先例；十三型不变）
```

- 语义/机制 = `agent/ADMIN-AGENT.md` §11.4（单源）；端点 = `gateway/API.md` §2.8（会话设置面 + 会话行形）；控制台面 = `webui/CHAT.md` §2.1⑤。
- 圈界：**零迁移**——存量行保持 NULL（= 未设 = 今日行为逐字同；无回填 ∥ 无改写）；**档位词表不入库**（核单源——列只存该模型枚举内的串）；NULL 与字面 `off` 不等价（缺省 ≠ 原子档位哨兵——`off` = 核件**显示**哨兵，写面不收）。
- **判据（单元测试档）**：空库直落 16 ∥ v15 库升后读数 16 ∥ v16 段幂等（再开零变）∥ `agent_chats` 列面六列在场（`pragma_table_info`——`reasoning` 尾插）∥ 存量行 `reasoning IS NULL` 零变 ∥ 存量其余列逐值保形。

### v17 增段（git 源/项目/项目成员三表 + 审计 CHECK 再扩（十四型）——project 域；team-projects-permissions 批）

（背景：团队项目与权限——源表/仓表（项目 ↔ 仓一对一）/权限三档；对象模型与机制 = `project/PROJECTS.md` §2/§4/§5（单源）；PAT 密文包形 = `credential-crypto.mjs`（KD-SV-119）。）

```sql
-- ① 三表（源 ∥ 项目（仓） ∥ 项目成员）
CREATE TABLE IF NOT EXISTS git_sources (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,                    -- 源名（≤40——应用层校验）
  platform TEXT NOT NULL CHECK (platform IN ('gitee','github','gitlab','selfhosted')),
  base_url TEXT,                                -- 自建平台基址（其余平台 NULL——客户端用固定基址）
  scope TEXT,                                   -- 组织/企业/组标识（成员同步用；NULL = 未配置）
  token_cipher TEXT NOT NULL,                   -- PAT 密文（AES-256-GCM `iv|tag|ct`——KD-SV-119；永不回显原文）
  hook_secret_cipher TEXT,                      -- webhook 密钥密文（事件进路——github 专用；按需生成 ⇒ NULL 缺省；生成时一次性明示 ∥ 读面恒掩码——`project/PROJECTS.md` §13）
  enabled INTEGER NOT NULL DEFAULT 1,           -- 启用/停用（停用 ⇒ 定时停、已挂项目保留——需求 44⑤）
  sync_mode TEXT NOT NULL DEFAULT 'poll' CHECK (sync_mode IN ('poll','event')),
  interval_minutes INTEGER NOT NULL DEFAULT 60, -- 定时拉取间隔（5–1440——应用层校验）
  last_sync_at TEXT,                            -- 上次同步尝试时刻（成败同记——需求 44⑤「上次同步时间 + 结果」）
  last_sync_result_json TEXT NOT NULL DEFAULT '{}',
  token_state TEXT NOT NULL DEFAULT 'unknown' CHECK (token_state IN ('unknown','ok','invalid')),
  token_checked_at TEXT,
  created_by INTEGER,                           -- 无 FK——沿先例
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  source_id INTEGER,                            -- 所属源（手输仓 ⇒ NULL）；无 FK——删源防护走应用层（KD-SV-122）
  address TEXT NOT NULL UNIQUE,                 -- git 地址（跨形归一后 = 记账键——规范形 `host[:port]/path`；归一口径 = `project/PROJECTS.md` §5）
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
```

- 语义/机制 = `project/PROJECTS.md` §2/§4/§5（单源）；端点 = `gateway/API.md` §2.9；控制台面 = `webui/PROJECTS.md` §2。
- 圈界：`projects.source_id` 无 FK（删除防护 = 应用层 400——KD-SV-122）；成员行不要求本地账号存在（KD-SV-116）；项目删除 = 应用层级联（`project_members` 同事务随删——`project/PROJECTS.md` §14）；`token_cipher` ∥ `hook_secret_cipher` 同键文件（`data/credentials.key`）不同密钥（每源独立随机——KD-SV-84/119）。
- **判据（单元测试档）**：空库直落 17 ∥ v16 库升后读数 17 ∥ v17 段幂等（再开零变）∥ 三表列面（含 `git_sources.hook_secret_cipher`）/三索引在场（`pragma_table_info` + `sqlite_master`）∥ 存量审计行逐值保形 + 两索引在场 ∥ `project_event` 型可写（CHECK 放行）。

### v18 增段（主机表七列 + `sandbox_onboarding` 凭据态四值（`'moved'`）+ 回填移交——sandbox 域；admin-chat-creds-merge 批）

（背景：主机表 = `sandbox_runners` 扩展——行 = 一台主机（名 ∥ Docker API 地址 ∥ SSH 凭据随行）；托管接入 `keep` 且成功 ⇒ 凭据移交该主机行。机制全文 = `sandbox/SANDBOX.md` §3 主机凭据块（单源） ∥ §14 KD-SV-133/134/135。）
（段号收正 · 2026-10-13：本批实落先于 server-wake-face ⇒ 段号 19 ⇒ **18**——迁移器空档不可回填（`db.mjs` 开库序只升 `v > 当前`）；对调依据 = 实落次序。父侧直接执行 · 可 revert。）

```sql
-- ① 主机表增七列（列级 ALTER = 表不重建——KD-SV-133）
ALTER TABLE sandbox_runners ADD COLUMN ssh_port INTEGER;                              -- SSH 端口（NULL = 未设——写面缺省 22）
ALTER TABLE sandbox_runners ADD COLUMN ssh_user TEXT;                                 -- SSH 用户名（NULL = 未设）
ALTER TABLE sandbox_runners ADD COLUMN auth_kind TEXT;                                -- `key` ∥ `password`（NULL = 未设；应用层校验）
ALTER TABLE sandbox_runners ADD COLUMN secret_cipher TEXT;                            -- 凭据密文（AES-256-GCM `iv|tag|ct`——KD-SV-84 同件；NULL = 无凭据）
ALTER TABLE sandbox_runners ADD COLUMN sudo_cipher TEXT;                              -- sudo 口令密文（同形；NULL = 未设）
ALTER TABLE sandbox_runners ADD COLUMN credential_state TEXT NOT NULL DEFAULT 'none'; -- `none` ∥ `sealed` ∥ `revoked`（应用层校验）
ALTER TABLE sandbox_runners ADD COLUMN credential_updated_at TEXT;                    -- 最近设/撤时刻（NULL = 未设）

-- ② `sandbox_onboarding.credential_state` CHECK 四态（+ `'moved'`——SQLite 不可改 CHECK ⇒ 表重建，步序与 v10/v12 同构）
--    重建后列面 = v13 段所列（十八列——本段不重复列举）；唯一差 = `credential_state` CHECK 四值（`'sealed'` ∥ `'burned'` ∥ `'revoked'` ∥ `'moved'`）
-- ③ 回填移交（存量 `keep` ∧ 成功行 ⇒ 密文移入主机行 + run 行密列零化 + `'moved'`；`keep` ∧ 未成功 ⇒ 不动）
```

- **语义/机制 = `sandbox/SANDBOX.md` §3 主机凭据块（单源）**——列面/行形（`ssh` 元数据） ∥ 密列零回显（响应 ∥ 日志 ∥ 审计 ∥ 帧四面零秘密字段） ∥ 端点 = `gateway/API.md` §2.5 ∥ 审计两 kind = `accounts/ACCOUNTS.md` §2.1。
- **回填口径**：存量 `keep` ∧ 成功行（`runner_id` 在场）按 `id` 序移交——**同 runner 多行 ⇒ 后者胜**；`keep` ∧ 未成功 ⇒ 留 run 行（密文不动）；既有 `sandbox_runners` 行新列 = NULL ∥ `'none'`（零伪造回填）。
- **圈界**：加解密 = 既有凭据三件同件（**不与 run 行并存两份**——实施轮以当刻盘面实读为准）；`sandbox_runners` 既有列 ∥ 索引 ∥ 引用面零动。
- **判据（单元测试档）**：空库直落 **18** ∥ v17 库升后读数 **18** ∥ v18 段幂等（再开零变）∥ 七列在场（`pragma_table_info('sandbox_runners')`）∥ `credential_state` 四值放行/越值拒 ∥ 回填三用例（成功行 ⇒ 移交 ∥ 同 runner 多行 ⇒ 后者胜 ∥ 失败行 ⇒ 零变）∥ 存量 `sandbox_onboarding` 行逐值保形（拷贝前后全等）。

### v19 增段（`api_keys.key_plain` 列——管理面 sk 明文面；server-wake-face 批 · 修订轮）

（背景：管理面 chat 的模型出口经本 server 网关链回环——每回合需真凭据（sk 明文）送验；凭据归属/吊销/轮转全沿 key 面（`accounts/ACCOUNTS.md` §1）。机制 = `agent/ADMIN-AGENT.md` §16.3。）
（段号收正 · 2026-10-13：本批实落后于 admin-chat-creds-merge ⇒ 段号 18 ⇒ **19**（同依据：实落次序 ∥ 空档不可回填）。父侧直接执行 · 可 revert。）

```sql
ALTER TABLE api_keys ADD COLUMN key_plain TEXT;
```

- **语义**：NULL = 常规 key（服务端不留明文——既有行为不变）∥ 非空 = **服务端自持面**（当前唯一写面 = `issueKey({ keepPlain: true })`——管理面 sk `admin-agent`）。
- **单源**：`thincoder-server/src/accounts/keys.mjs`（列写入点 = `issueKey`；读取 = `agentKeyOf`）。
- **旁证先例**：沙盒工作区 `key_plain`（服务端即消费方——披露类不升级）。

- **判据（单元测试档）**：空库直落 **19** ∥ v18 库升后读数 **19** ∥ v19 段幂等（再开零变）∥ `api_keys` 列面含 `key_plain`（`pragma_table_info`——尾插）∥ 存量行 `key_plain IS NULL` 零变 ∥ 其余列逐值保形。

### v20 增段（团队台账表 + 审计 CHECK 再扩（十五型）——ledger 域；team-ledger 批）

（背景：团队共享一本工作台账——**全局编号** ∥ **键 = git 源**（归一地址） ∥ **全局一本**（数据层无分本）；机制全文 = `ledger/LEDGER.md`（单源）。）

```sql
-- ① 团队台账表（单表——全局编号；仓 = 归一地址（`projects.address` 同形）；六态枚举沿本机台账）
CREATE TABLE IF NOT EXISTS team_ledger_items (
  id         INTEGER PRIMARY KEY AUTOINCREMENT, -- 全局编号（全队一号空间——跨本引用可解析）
  repo       TEXT NOT NULL,                     -- 仓标记（归一形 `host[:port]/path`；非 FK——项目删除不级联，KD-SV-147）
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
```

- 语义/机制 = `ledger/LEDGER.md` §3/§4（单源）；端点 = `gateway/API.md` §2.10；控制台面 = `webui/LEDGER.md` §2；端侧面 = `docs/core/design/TEAM-LEDGER.md` §2。
- 圈界：无 FK（沿先例）；`repo` 非唯一（同仓 N 条）；`status` CHECK 六态（迁移表判在应用层——`ALLOWED_MIGRATIONS` 沿本机台账枚举）；归档 = 状态值（软删除——行保留）。
- **判据（单元测试档）**：空库直落 **20** ∥ v19 库升后读数 **20** ∥ v20 段幂等（再开零变）∥ 表/两索引在场（`pragma_table_info` + `sqlite_master`）∥ 存量审计行逐值保形 + 两索引在场 ∥ `ledger_event` 型可写（CHECK 放行）。

### v21 增段（`git_sources.scope_kind` 列 + 存量回填——project 域；gitee-namespace-kinds 批）

```sql
-- ① gitee 范围类型（personal ∥ org ∥ enterprise——KD-SV-151；非 gitee/NULL = 不适用）
ALTER TABLE git_sources ADD COLUMN scope_kind TEXT CHECK (scope_kind IN ('personal','org','enterprise'));
-- ② 存量回填（仅 gitee——零猜测：scope 在场 ⇒ 'org'（沿现行路由）∥ scope 空 ⇒ 'personal'；非 gitee 零动）
UPDATE git_sources SET scope_kind = CASE WHEN scope IS NULL OR TRIM(scope) = '' THEN 'personal' ELSE 'org' END WHERE platform = 'gitee';
```

- 语义/机制 = `project/PROJECTS.md` §4（KD-SV-151——三态 ∥ 路由 ∥ 不符报错）；旧企业行（如 id=2）= 回填后 `org`——编辑窗改选「企业」保存即工作（迁移零猜测；端形 = `gateway/API.md` §2.9）。
- 圈界：列级 `ALTER`（表不重建）；CHECK 三值（NULL 放行——非 gitee 恒 NULL）；非 gitee 行零动（回填体 `WHERE platform = 'gitee'`）；审计 CHECK 零动（十五型不变）。
- **判据（单元测试档）**：空库直落 **21** ∥ v20 库升后读数 **21** ∥ v21 段幂等（再开零变）∥ 列面含 `scope_kind`（`pragma_table_info`——尾插）∥ 回填三用例（gitee ∧ scope 在场 ⇒ `org` ∥ gitee ∧ scope 空 ⇒ `personal` ∥ 非 gitee ⇒ NULL/零动）∥ 存量行余列逐值保形。

### v22 收正段（`sandbox_workspaces` 表重建 + `registry_credentials` 建表 + `sandbox_tasks` 删表——sandbox 域；sandbox-exec-rebuild 批）

```sql
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
-- ② 存量行拷贝（逐列映射）⇒ DROP TABLE sandbox_workspaces ⇒ RENAME ⇒ （无索引/无 FK 重建）
-- ③ DROP TABLE sandbox_tasks（指令队列退场——KD-SV-161）
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
-- ⑤ sandbox_runners 增连接材料四列（TLS 档——本增补 #2；列级 ALTER = 表不重建；存量行 NULL = 明文档零回填；机制 = `sandbox/SANDBOX.md` §3 连接方式块）
ALTER TABLE sandbox_runners ADD COLUMN tls_ca TEXT;                                    -- CA 证书 PEM（仅 TLS 档）
ALTER TABLE sandbox_runners ADD COLUMN tls_cert TEXT;                                  -- 客户端证书 PEM（仅 TLS 档）
ALTER TABLE sandbox_runners ADD COLUMN tls_key_cipher TEXT;                            -- 客户端私钥密文（AES-256-GCM——密列零回显；仅 TLS 档）
ALTER TABLE sandbox_runners ADD COLUMN tls_updated_at TEXT;                            -- 材料更新时间（NULL = 未设）
```

- 语义/机制 = `sandbox/EXECUTION.md` §3/§8/§9（KD-SV-161/162/184/188——直调链替换队列；`stop_reason` 写入点 = 服务器侧停盒动作；`base_image` 写入点 = 工作区 PATCH（`baseImage` 键）；`registry_credentials` 写入点 = 凭据四端点）；**本增补 #2**：`tls_*` 四列 = 列级 `ALTER`（存量行 NULL——零回填；不变量 `https` ⇔ 三件齐 = 应用层校验——`sandbox/SANDBOX.md` §3）。
- 圈界：表重建（SQLite 不可改列集——沿 v12 表重建先例）；`required_labels_json` 列消（放置 = 在线 active 最少绑定者——EXECUTION §3）；`stop_reason`/`base_image` NULL 放行；无索引/无 FK（沿先例）；删表 = 队列退场（无消费者——瞬时态零迁移价值）；`registry_credentials` 新表：`host` 唯一（一主机一枚——`UNIQUE` 自携索引）；`created_by` 无 FK（沿先例）。
- **判据（单元测试档）**：空库直落 **22** ∥ v21 库升后读数 **22** ∥ v22 段幂等（再开零变）∥ **`sandbox_workspaces` 列面十行在场**（`pragma_table_info`——含 `stop_reason` ∥ `base_image`；不含 `required_labels_json`）∥
  `registry_credentials` 表在场且列面**七行**（含 `updated_at`） + `host` 唯一（`sqlite_master` ∥ 重复 host 插入 ⇒ 拒）∥ `sandbox_tasks` 表不在（`sqlite_master`）∥ **`sandbox_runners` 连接材料四列在场**（`pragma_table_info`——含 `tls_key_cipher`；存量行 NULL）∥ 存量行逐值保形（拷贝映射——`base_image` 全 NULL）。

### v23 增段（成员 git 凭据表 + 审计 CHECK 再扩（十六型）——agent 域；member-face-chat 批）

```sql
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
```

- 语义/机制 = `agent/MEMBER-AGENT.md` §3.6/§2 KD-SV-204（成员本人凭据——绑定一次复用 ∥ 经盒按次 ∥ 用毕即清）；端点 = `gateway/API.md` §2.11。
- 圈界：无 FK（沿先例）；`(member_id, host)` 唯一（UNIQUE 自携索引）；`secret_cipher` 单密列（读写单点）；**会话两表不建**（题一裁定——服务器零会话落库）；审计 CHECK 扩型 = 十六型（重建同构——CHECK **kind 非枚举**：`member_event` 六 kind = `chat_start` ∥ `chat_call` ∥ `chat_stop` ∥ `pull` ∥ `credential_set` ∥ `credential_revoke`）。
- **判据（单元测试档）**：空库直落 **23** ∥ v22 库升后读数 **23** ∥ v23 段幂等（再开零变）∥ `member_git_credentials` 列面七行在场（`pragma_table_info`）+ `(member_id, host)` 唯一（重复插入 ⇒ 拒）∥ 存量审计行逐值保形 + 两索引在场 ∥ `member_event` 型可写（CHECK 放行）∥ **`member_sessions` 表不在**（`sqlite_master`——题一判据）。

### v24 增段（`mcp_servers` 建表 + 审计 CHECK 再扩（十七型）——mcp 域；server-mcp 批）

```sql
-- ① MCP 服务器清单表（server 全局单份——非逐用户；KD-SV-197）
CREATE TABLE IF NOT EXISTS mcp_servers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,                   -- 服务器名（工具前缀源——核 `{server}_{tool}`）
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
```

- 语义/机制 = `mcp/MCP.md` §3（KD-SV-197/198——清单形/凭据形）；端点 = `gateway/API.md` §2.13；控制台面 = `webui/MCP.md` §2。
- 圈界：无 FK（沿先例）；`name` 唯一（UNIQUE 自携索引——工具前缀须稳定可辨）；`transport` CHECK 三值；三传输列互斥 = 应用层校验（列 NULL 放行）；`secret_cipher` 单密列（三敏感面合一——读写单点）；审计 CHECK 扩型 = 十七型（重建同构）。
- **判据（单元测试档）**：空库直落 **24** ∥ v23 库升后读数 **24** ∥ v24 段幂等（再开零变）∥ `mcp_servers` 列面十行在场（`pragma_table_info`）∥ `name` 唯一（重复插入 ⇒ 拒）∥ `transport` 枚举逐值（表外 ⇒ 拒）∥ 存量审计行逐值保形 + 两索引在场 ∥ `mcp_event` 型可写（CHECK 放行）。

## 3. 迁移链（`user_version` 逐版升）

- `thincoder-server/src/store/db.mjs`（已落盘）持 `MIGRATIONS` 数组——每段 = `{ v, up(db) }`（v = 目标 `user_version`，自 1 起递增；v1 = 基线段 = §2 全量 DDL）。
- 开库序：读 `user_version` ⇒ 顺序执行 `v > 当前` 的段（每段单事务；成功 ⇒ `PRAGMA user_version = v`；抛错 ⇒ 进程非零退出——fail-closed）。
- 结构每变一次 = 追一段（+1）——空库 ∥ 旧库启动自动升，零手工脚本（断点列 = `EVOLUTION.md` §1-G2）。
- v2 = provider 增段（`providers` 表——控制台 provider 管理；旧库（v1）启动自动升 ∥ 空库直落 v2）。
- v3 = 审计增段（`audit_events` 表 + 三索引——`accounts/ACCOUNTS.md` §2.1 ∥ key 明细索引）；旧库（v1/v2）启动自动升 ∥ 空库直落 v3；判据（单元测试档）= 空库结构版本读数 3 ∥ v2 库升后读数 3 ∥ 迁移链幂等（再开零变）。
- v4 = 模型设置增列（`providers.settings_json`——服务模型配置面）：**列级 ALTER = 表不重建**（SQLite `ADD COLUMN` 常量默认——存量行即刻得 `'{}'`）；旧库（v1–v3）启动自动升 ∥ 空库直落 v4；判据（单元测试档）= 空库读数 4 ∥ v3 库升后读数 4 ∥ v4 段幂等（再开零变）。
- first-release-completeness 批（2026-10-06）：**零结构变更**（保留窗清理 = 删除式 ∥ 登录防护计数 = 进程内存——均无新表；结构版本不变）。
- v5 = 两字段拆列 + 派生两表 + 成员配额列（**配额分模型批**——需求 §2:21 ∥ §2:22 ∥ 台账 #990/#991/#992）：五步见 §2 v5 段（拆列 ∥ 建 `usage_daily`/`quota_counters` ∥ 成员列增删 ∥ 期初回填）。
  判据（单元测试档）= 空库读数 5 ∥ v4 库升后读数 5 ∥ v5 段幂等（再开零变）∥ 拆列抽样逐值（含 `model` 带斜杠 ∥ 嵌入行 `provider = ''`）∥ 回填两表逐值 = usage 重算 ∥ 旧列不在 `pragma_table_info('members')`；耗时（一次性 @500k 行——同构探针实读）= 日表回填 ≈1.2s ∥ 计数回填 ≈3.4s（合计 ≈5s 级）。
- v6 = 成员模型禁用列（`members.model_disabled_json`——**配额 v2 · 成员模型面批** ∥ 台账 #1004）：**列级 ALTER = 表不重建**（存量行即刻得 `'{}'`——默认全可用）；旧库（v1–v5）启动自动升 ∥ 空库直落 v6；判据（单元测试档）= 空库读数 6 ∥ v5 库升后读数 6 ∥ v6 段幂等（再开零变）∥ 新列常量默认在场（`pragma_table_info('members')` 含列）。
- v7 = provider 模型元数据留存列（`providers.model_meta_json`——**Provider 模型元数据批** ∥ 台账 #1005）：**列级 ALTER = 表不重建**（存量行即刻得 `'{}'`——未存 = 无元数据）；旧库（v1–v6）启动自动升 ∥ 空库直落 v7；判据（单元测试档）= 空库读数 7 ∥ v6 库升后读数 7 ∥ v7 段幂等（再开零变）∥ 新列常量默认在场（`pragma_table_info('providers')` 含列）。
- v8 = key 名称列（`api_keys.name`——**me-keys 批** ∥ 台账 #1023）：**列级 ALTER = 表不重建**（存量行即刻得 `''` ⇒ 随段回填默认名 `key-N`——按成员签发序）；旧库（v1–v7）启动自动升 ∥ 空库直落 v8；判据（单元测试档）= 空库读数 8 ∥ v7 库升后读数 8 ∥ v8 段幂等（再开零变）∥ 新列在场（`pragma_table_info('api_keys')` 含 `name`）∥ 存量回填抽查（多 key 成员：行名 = `key-1..key-N` 按 id 序 ∥ 空串零残留）。
- v9 = provider 上游代理旗（`providers.proxy`——**server 代理批** ∥ 台账 #1129）：**列级 ALTER = 表不重建**（存量行即刻得 `0`——缺省直连）；旧库（v1–v8）启动自动升 ∥ 空库直落 v9；判据（单元测试档）= 空库读数 9 ∥ v8 库升后读数 9 ∥ v9 段幂等（再开零变）∥ 新列在场（`pragma_table_info('providers')` 含 `proxy`）∥ 存量默认值抽查（迁移后旧行 `proxy = 0`——直连缺省）。
- v10 = 审计事件型扩（`audit_events` CHECK 扩十型——**配置控制台批** ∥ 台账 #1139）：**表重建**（SQLite 不可改 CHECK——建新表 ∥ 拷贝 ∥ 换名 ∥ 索引重建）；旧库（v1–v9）启动自动升 ∥ 空库直落 v10；判据（单元测试档）= 空库读数 10 ∥ v9 库升后读数 10 ∥ v10 段幂等（再开零变）∥ 存量行逐值保形（id/时刻/型/详情——拷贝前后全等）∥ 两索引在场 ∥ `config_update` 型可写（CHECK 放行）∥ `sqlite_sequence` 连续（新事件 id 不撞存量）。
- server-model-alias 批（2026-10-09——台账 #1153）：**零结构变更**（别名 = `models_json` 元素升级——JSON 文本内演进；无新列/新表/新段——结构版本保持 **10**；旧行字符串天然兼容）；判据（单元测试档）= 迁移链读数仍 10 ∥ 别名增删往返不改库结构（`pragma_table_info('providers')` 零变）。
- v11 = 沙盒七表 + 审计 CHECK 再扩（十二型）+ `sandbox_rules` 种子（八行——**server-exec-sandbox 批** ∥ 台账 #1224）：七表 CREATE（见 §2 v11 段）+ 种子写入（`source='default'`——一次性；可改可删不复活）+ `audit_events` 表重建（十型 ⇒ 十二型：+ `sandbox_rule` ∥ `sandbox_event`——步序与 v10 同构）；
  旧库（v1–v10）启动自动升 ∥ 空库直落 v11；判据（单元测试档）= 空库读数 11 ∥ v10 库升后读数 11 ∥ v11 段幂等（再开零变） ∥ 七表在场（`pragma_table_info`） ∥ 存量审计行逐值保形 + 两索引在场 ∥ 两新型可写（CHECK 放行） ∥ 种子八行在场（`source='default'`——deny 三 + allow 五） ∥ 覆写列在场（`sandbox_workspaces.limits_json` 默认 `'{}'`）。
- v12 = `sandbox_runners` 表重建（旧通道形态 ⇒ Docker 节点形态——**runner-admin-console 批** ∥ 台账 #1252）：**表重建**（建新表 ∥ 存量行弃 ∥ DROP ∥ RENAME——见 §2 v12 段）；旧库（v1–v11）启动自动升 ∥ 空库直落 v12；判据（单元测试档）= 空库读数 12 ∥ v11 库升后读数 12 ∥ v12 段幂等（再开零变）∥ 列面五行在场 ∥ 旧三列名不在 ∥ 存量行弃（含旧行 ⇒ 空表）∥ `sandbox_workspaces.runner_id` 引用面零变。
- v13 = `sandbox_onboarding` 建表（托管接入任务 + 凭据——**runner-admin-console 批增补** ∥ 台账 #1236/#1237）：**加表**（零重建——见 §2 v13 段）；旧库（v1–v12）启动自动升 ∥ 空库直落 v13；判据（单元测试档）= 空库读数 13 ∥ v12 库升后读数 13 ∥ v13 段幂等（再开零变）∥ 列面十八列在场 ∥ 凭据读写往返（密文 ≠ 明文 ∥ 零化后 NULL）∥ 存量表零变。
- v14 = agent chat 两表 + 审计 CHECK 再扩（十三型——**admin-agent-chat 批** ∥ 台账 #1254）：**加两表 + 表重建**（SQLite 不可改 CHECK——步序与 v10/v11 同构；见 §2 v14 段）；旧库（v1–v13）启动自动升 ∥ 空库直落 v14；判据（单元测试档）= 空库读数 14 ∥ v13 库升后读数 14 ∥ v14 段幂等（再开零变）∥ 两表列面在场 + `(chat_id, seq)` 索引在场 ∥ 存量审计行逐值保形 + 两索引在场 ∥ `agent_event` 型可写。
- v15 = `image_sources` 建表（镜像源清单——**sandbox-image-sources 批** ∥ 台账 #1274）：**加表**（零重建——见 §2 v15 段）；旧库（v1–v14）启动自动升 ∥ 空库直落 v15；判据（单元测试档）= 空库读数 15 ∥ v14 库升后读数 15 ∥ v15 段幂等（再开零变）∥ 列面五列在场 ∥ 重名/重址插入拒（UNIQUE 两枚）∥ 存量表零变。
- v16 = `agent_chats.reasoning` 增列（会话级思考档位——**console-reasoning-levels 批** ∥ 台账 #1303）：**加列**（`ALTER TABLE … ADD COLUMN`——表不重建；见 §2 v16 段）；旧库（v1–v15）启动自动升 ∥ 空库直落 v16；判据（单元测试档）= 空库读数 16 ∥ v15 库升后读数 16 ∥ v16 段幂等（再开零变）∥ 列面六列在场 ∥ 存量行 NULL 零变。
- v17 = git 源/项目/项目成员三表 + 审计 CHECK 再扩（十四型——**team-projects-permissions 批** ∥ 台账 #1216）：**加三表 + 表重建**（SQLite 不可改 CHECK——步序与 v10/v11/v14 同构；见 §2 v17 段）；旧库（v1–v16）启动自动升 ∥ 空库直落 v17；判据（单元测试档）= 空库读数 17 ∥ v16 库升后读数 17 ∥ v17 段幂等（再开零变）∥ 三表列面（含 `hook_secret_cipher`）与索引在场 ∥ 存量审计行逐值保形 ∥ `project_event` 型可写。
- v18 = 主机表七列 + `sandbox_onboarding` 凭据态四值（`'moved'`）+ 回填移交（**admin-chat-creds-merge 批** ∥ 台账 #1326）：**加列 + 表重建**（列级 `ALTER`——表不重建；CHECK 重建步序与 v10/v12 同构；见 §2 v18 段）；旧库（v1–v17）启动自动升 ∥ 空库直落 v18；

- v19 = `api_keys.key_plain` 增列（管理面 sk 明文面——**server-wake-face 批修订轮** ∥ 台账 #1324）：**加列**（`ALTER TABLE … ADD COLUMN`——表不重建；见 §2 v19 段）；旧库（v1–v18）启动自动升 ∥ 空库直落 v19；
    判据（单元测试档）= 空库读数 19 ∥ v18 库升后读数 19 ∥ v19 段幂等（再开零变）∥ 列面含 `key_plain` ∥ 存量行 NULL 零变。
- v20 = 团队台账表 + 审计 CHECK 重建（十五型）（**team-ledger 批** ∥ 台账 #1206）：**建表 + 两索引 + 表重建（审计 CHECK 扩型——同上四段同构）**（见 §2 v20 段）；旧库（v1–v19）启动自动升 ∥ 空库直落 v20；
    判据（单元测试档）= 空库读数 20 ∥ v19 库升后读数 20 ∥ v20 段幂等（再开零变）∥ 表/两索引在场 ∥ 存量审计行逐值保形 ∥ `ledger_event` 型可写。
- v21 = `git_sources.scope_kind` 增列 + 存量回填（gitee 范围三态——**gitee-namespace-kinds 批** ∥ 台账 #1365）：**加列 + 回填**（`ALTER TABLE … ADD COLUMN` + 同段 `UPDATE`——表不重建；见 §2 v21 段）；旧库（v1–v20）启动自动升 ∥ 空库直落 v21；
    判据（单元测试档）= 空库读数 21 ∥ v20 库升后读数 21 ∥ v21 段幂等（再开零变）∥ 列面含 `scope_kind` ∥ 回填三用例（gitee 在场 ⇒ `org` ∥ gitee 空 ⇒ `personal` ∥ 非 gitee 零动）。
  - v22 = 沙盒两表收正（`sandbox_workspaces` 表重建 + `registry_credentials` 建表 + `sandbox_tasks` 删表 + `sandbox_runners` 连接材料四列（本增补 #2）——**sandbox-exec-rebuild 批** ∥ 台账 #1373）：**表重建 + 建表 + 删表 + 列级 ALTER**（步序与 v10/v12 同构；见 §2 v22 段）；旧库（v1–v21）启动自动升 ∥ 空库直落 v22；
      判据（单元测试档）= 空库读数 22 ∥ v21 库升后读数 22 ∥ v22 段幂等（再开零变）∥ `sandbox_workspaces` 列面十行（含 `stop_reason` ∥ `base_image`；不含 `required_labels_json`）∥ `registry_credentials` 在场 + `host` 唯一 ∥ `sandbox_tasks` 表不在 ∥ `sandbox_runners` 连接材料四列在场（存量行 NULL）∥ 存量行逐值保形。
- v23 = 成员 git 凭据表 + 审计 CHECK 再扩（十六型——**member-face-chat 批** ∥ 台账 #1215）：**加表 + 表重建**（步序与 v10/v11/v14/v17/v20 同构；见 §2 v23 段；**会话两表不建**——题一裁定）；旧库（v1–v22）启动自动升 ∥ 空库直落 v23；
     判据（单元测试档）= 空库读数 23 ∥ v22 库升后读数 23 ∥ v23 段幂等（再开零变）∥ 凭据表列面七行与 `(member_id, host)` 唯一在场 ∥ `member_sessions` 表不在 ∥ 存量审计行逐值保形 ∥ `member_event` 型可写。
- v24 = `mcp_servers` 建表 + 审计 CHECK 重建（十七型——**server-mcp 批** ∥ 台账 #1379）：**加表 + 表重建**（步序与 v10/v11/v14/v17/v20/v23 同构；见 §2 v24 段）；旧库（v1–v23）启动自动升 ∥ 空库直落 v24；
    判据（单元测试档）= 空库读数 24 ∥ v23 库升后读数 24 ∥ v24 段幂等（再开零变）∥ 表列面十行 + `name` 唯一 + `transport` CHECK ∥ 存量审计行逐值保形 ∥ `mcp_event` 型可写。

## 4. 本域文件与行数预算（本域族行）

| 档 | 行数（实读——设计估） | 职责 |
|---|---|---|
| `thincoder-server/src/store/db.mjs`（已落盘） | **124 ⇒ ≈160 ⇒ 144**（实读——v3 落地后）**⇒ ≈155**（服务模型配置面批 +≈11 = v4 段（ALTER + 迁移段））**⇒ 实读 150 ⇒ ≈205**（配额分模型批 +≈55 = v5 段：拆列 ALTER/UPDATE ∥ 建两表 ∥ 两回填 INSERT ∥ 成员列增删）**⇒ 实读 202 ⇒ ≈214**（配额 v2 批 +≈12 = v6 段（ALTER + 迁移段））**⇒ 实读 210（v6 落地后）⇒ ≈218**（模型元数据批 +≈8 = v7 段（ALTER + 迁移段——与 v6 段同构））**⇒ ≈228**（me-keys 批 +≈10 = v8 段（ALTER + 回填 UPDATE + 迁移段——较 v6/v7 段多一条回填））**⇒ 实读 ≈224（2026-10-09）⇒ ≈234**（本批代理：v9 段 +≈10——实读待回填）**⇒ 实读 231（2026-10-09——本设计轮复读）⇒ ≈256（配置控制台批：v10 重建段 +≈25——建新表/拷贝/换名/索引重建 ∥ 迁移段；实读待回填）⇒ 实读 255（2026-10-09——配置控制台批落地后）∥ ±0（2026-10-09 alias 批：零结构变更）⇒ ≈350（server-exec-sandbox 批：v11 段 +≈95 = 七表 + 种子 + 审计重建——实读待回填）** ⇒ 实读 **365**（2026-10-10——runner-admin-console 批现读）⇒ ≈400（本批：v12 段 +≈35——实读待回填）⇒ **≈425**（托管接入增补：v13 段 +≈25——实读待回填）** ⇒ 实读 **409**（2026-10-11——admin-agent-chat 批设计轮现读）⇒ 实读 **458**（2026-10-11——sandbox-image-sources 批设计轮现读；v14 段入盘 +49）⇒ ≈490（本批：v15 段 +≈32——建表 + 两唯一约束 + 迁移段；实读待回填）** ⇒ 实读 **476**（2026-10-12 本设计轮复读）⇒ ≈**485**（console-reasoning-levels 批：v16 段 +≈9——`ALTER` + 迁移段）** ⇒ 实读 **488**（2026-10-12——team-projects-permissions 批设计轮现读）⇒ ≈**560**（本批：v17 段 +≈70——三表 + 两索引 + 审计重建（十四型）+ 迁移段；实读待回填）∥ **+≈72**（**admin-chat-creds-merge 批**：**v18** 段——七列 `ALTER` ∥ `sandbox_onboarding` CHECK 重建 ∥ 回填移交；段序收正 2026-10-13——实落次序在先） ∥ **+≈14**（**server-wake-face 批**修订轮：**v19** 段——`ALTER` + 迁移段；段序收正 2026-10-13——实落次序在后） ∥ **+≈44**（**team-ledger 批**：**v20** 段——建表 + 两索引 + 审计 CHECK 重建（十五型）+ 迁移段；实读待回填）∥ **+≈14**（**gitee-namespace-kinds 批**：**v21** 段——`ALTER` + 回填 `UPDATE` + 迁移段；现读 **675 ⇒ ≈690**——触发线 700 未触，余 ≈10 行） ∥ **±0（member-face-chat 批：**v23** 段入 `migrations.mjs`——凭据表 + 索引 + 审计 CHECK 重建（十六型）——拆案已落，本档零动）**）**；**>500 软线复核（评审发现 2）：判 = 维持 + 上限 700**——维持理由：迁移段 append-only（每段 ≈5–70 行——批增速 ≈每批 +10–35）∥ 本档 = 迁移链单源（开库序 ∥ 段序一读到底——外拆 = 跨档跳转）；硬限 800 未触（≈560 留 ≈240 余量 ⇒ ≈7 批以上）；**触发 = 实读 >700 ⇒ 起「迁移段外拆」轮**（v2–vN 段外迁 `src/store/migrations.mjs`（拟新增）——纯搬移零语义；本档保开库/PRAGMA/语句封装）**⇒ 实读 688（2026-10-13 本批现读）⇒ 触发达成（+ v22 段 ≈20 ⇒ ≈708）⇒ 拆案本批实施**（sandbox-exec-rebuild 批：`db.mjs` ≈300 + `migrations.mjs` ≈430——纯搬移 + v22 段；**本增补 +≈40**——`base_image` 列 + `registry_credentials` 建表 ⇒ `migrations.mjs` ≈**470**；**本增补 #2 +≈10**——连接材料四列 `ALTER` ⇒ `migrations.mjs` ≈**480**；**server-mcp 批 +≈20**——**v24** 段（`mcp_servers` 建表 + 审计 CHECK 重建（十七型））⇒ ≈**500**；**命名 = `migrations.mjs` 单源**——SANDBOX §13 旧称 `schema.mjs` 收正；**member-face-chat 批 ±0**——本档零动，v23 段入 `migrations.mjs`（+≈35——凭据表 + 索引 + 审计 CHECK 重建（十六型））⇒ ≈**535**） ∥ **本档实读 37**（2026-10-13 本批现读——拆案落定后）；`migrations.mjs` 实读 **711**（2026-10-13 本批现读——在册估低，以实施当刻实读为准） | 开库 ∥ PRAGMA ∥ 语句封装（DDL/迁移链 = `migrations.mjs`） |
| `thincoder-server/src/store/credential-crypto.mjs`（已落——team-projects-permissions 批 · KD-SV-119） | ≈65（设计估——凭据三件（`loadOrCreateCredentialKey` ∥ `encryptSecret` ∥ `decryptSecret`）自 `thincoder-server/src/sandbox/onboarding.mjs` 逐字抽出 + **键路径派生 `credentialKeyPath(config)` 同件收口**（单一出处——两域同址；消第二份路径规则）——sandbox ∥ project 两域共享） | 凭据加解密（AES-256-GCM + `data/credentials.key`——首用生成 ∥ 0600 ∥ 不落库） |

## 5. 关键决策（本域）

| # | 决策 | 理由 | 被否候选与何故否 |
|---|---|---|---|
| KD-SV-3 | **存储 = `node:sqlite`（`DatabaseSync`）**——WAL ∥ `user_version` 结构版本 | 需求候选 + 仓内先例（核 `thincoder-core/ledger-db.mjs:18` 同技术）；零依赖 ∥ 单文件 ∥ SQL 聚合天然贴合看板/配额 | JSON 文件（并发/查询弱、无原子写）· 外部 DB（违零依赖 ∥ 运维重）· 内存（重启即失——违计量本意） |
| KD-SV-40 | **v5 迁移 = 模型标识两字段（`provider` ∥ `model`）+ 派生两表 + 旧列删除**：拆列判据 = `endpoint = 'chat'`（嵌入行 `provider = ''`——无前缀命名空间）；派生两表 = 可重算（对账兜底）+ 不设 FK；旧 `members.quota_tokens` **删列**（`DROP COLUMN`——`node:sqlite`（SQLite 3.53.4）实核可）不弃用：总量 ≠ 分模型无保义映射（不转换 ⇒ 列删）；`ADD COLUMN` 常量默认 = 表不重建 | 用户 09:38 直令（「应该分两个字段，将来统计的时候需要按provider」——需求 §2:22）；迁移窗口 = 配额分模型批同窗（§2:22③）；弃用列留残 = 双源混乱 ∥ 转换 = 语义放大（总量复制到每模型）；派生面同事务维护（`metering/METERING.md` §1） | 转换旧值到每模型覆盖（无保义——总量 ≠ 分模型）· 保留旧列只读弃用（死列 ∥ 归拼口径分裂）· 拆列按全行 `instr > 0`（嵌入名可含斜杠 ⇒ 误拆——故以 `endpoint` 为判据）· 派生表异步回填（两写路径 = 漂移面） |

## 6. 本域边界（不做的面）

- 归档/导出面不做（清理 = 保留窗删除式——`metering/METERING.md` §1；备份 = 部署侧面——`ops/OPS.md` §5.5）；多实例共享存储 = 触发项（`EVOLUTION.md` §2）；结构升级只走迁移链（不做手工脚本面）。

## 变更记录

- 2026-10-14（**sandbox-onboarding-removal 批 · 设计轮 · eng-designer**——承批档 `docs/batches/2026-10-14-sandbox-onboarding-removal.md` §1 · 台账 #1383；用户裁「撤」）：§1 版本链 v13 条注「停机留史」∥ §2 v13 段标题 + 背景行注「停机留史（数据不删 ∥ 零写入零读面）」+ 机制指针收正 ∥ 加密密钥披露指针收正（§14 KD-SV-84）。既落段零改写（v13/v18 段体 = as-of 历史；迁移链不可回填——零动）。**产品码零触（设计轮）。**

- 2026-10-13（**server-mcp 批 · 设计轮 · eng-designer**——承批档 `docs/batches/2026-10-13-server-mcp.md` §1 · 台账 #1379）：§1 版本链增 v24 句（当前 23 ⇒ 24）∥ §2 增 v24 段（`mcp_servers` 建表 + 审计 CHECK 重建（十七型）——DDL 逐字 + 圈界 + 判据）∥ §3 迁移链增 v24 行 ∥ §4 `migrations.mjs` 行（+≈20 ⇒ ≈500）。同源随动 = `mcp/MCP.md` §3 ∥ `accounts/ACCOUNTS.md` §2.1 ∥ `gateway/API.md` §2.13。**产品码零触（设计轮）。**

- 2026-10-13（**sandbox-exec-rebuild 批 · 范围增补 #2（连接面 TLS 档——fix 轮）· eng-designer**——承批档 `docs/batches/2026-10-13-sandbox-exec-rebuild.md` §1「2026-10-13 22:43 · 用户裁定」）：§1 v22 收正段句增一件（`sandbox_runners` 连接材料四列）；§2 v22 段 DDL 增 ⑤（四列 `ALTER`——`tls_ca`/`tls_cert`/`tls_key_cipher`/`tls_updated_at`；列级/存量 NULL）+ 语义句随正 ∥ 判据增「四列在场（存量行 NULL）」腿；§3 v22 行判据同拍；§4 `migrations.mjs` ≈470 ⇒ **≈480**（本增补 #2 +≈10）。同源随动 = `sandbox/SANDBOX.md`（§2/§3 连接方式块） ∥ `sandbox/EXECUTION.md` §9/§14 ∥ `gateway/API.md` §2.5 ∥ `accounts/ACCOUNTS.md` §2.1。**产品码零触（设计轮）。**

- 2026-10-06：建档（批 `docs/batches/2026-10-06-server-gateway.md` 设计轮；同日补轮按三层结构 + B 案织入）——store 域：库 ∥ DDL（四表——members 扩列 + sessions） ∥ 迁移链；KD-SV-3。
- 2026-10-06：实施后回填轮（fix）——§4 行数按实读回填（≈175 ⇒ 110）。
- 2026-10-06：控制台 provider/模型管理设计轮（批 `docs/batches/2026-10-06-console-providers.md`——需求 §2:11 ∥ 台账 #962）——§1 结构版本 1 ⇒ 2 ∥ §2 增 v2 增段（`providers` 表——字段面/注释）+ 表归属补 gateway 行 ∥ §3 迁移链补 v2 段 ∥ §4 预算（db 110 ⇒ ≈135）。
- 2026-10-06：首版完备化设计轮（批 `docs/batches/2026-10-06-first-release-completeness.md`——需求 §2:12 ∥ 台账 #963）——§3 补零结构变更句 ∥ §6 边界随正（清理 = 删除式保留窗；备份归部署侧面）。
- 2026-10-06：实施后回填轮（R14——批 `docs/batches/2026-10-06-console-providers.md`）：§4 行数按实读收正（db **124**）。
- 2026-10-06：控制台可见面二轮设计轮（批 `docs/batches/2026-10-06-console-completeness-2.md`——需求 §2:15 ∥ 台账 #972）——§1 结构版本 2 ⇒ 3 ∥ §2 增 v3 增段（`audit_events` + `idx_audit_ts`/`idx_audit_type_ts`/`idx_usage_key_ts`）∥ 表归属补 accounts 行 ∥ §3 迁移链补 v3 段 ∥ §4 预算（db 124 ⇒ ≈160）；同源随动 = `accounts/ACCOUNTS.md` §2.1 ∥ `metering/METERING.md` §3。
- 2026-10-06：服务模型配置面设计轮（批 `docs/batches/2026-10-06-models-config.md`——需求 §2:17 ∥ 台账 #981）——§1 结构版本 3 ⇒ 4 ∥ §2 增 v4 增段（`ALTER TABLE providers ADD COLUMN settings_json`——形/写面/校验/消费）∥ 表归属 providers 行补 v4 ∥ §3 迁移链补 v4 段（表不重建 ∥ 判据）∥ §4 预算（db ⇒ ≈155；v4 段 +≈11）；同源随动 = `gateway/API.md` §2.2 ∥ `webui/WEBUI.md` §2.4③。
- 2026-10-07：配额分模型批设计轮（批 `docs/batches/2026-10-07-quota-per-model.md`——需求 §2:21 ∥ §2:22 ∥ 台账 #990/#991/#992）——§1 结构版本 4 ⇒ 5 ∥ §2 增 v5 增段（usage 两字段拆列 ∥ `usage_daily` ∥ `quota_counters` ∥ members 增 `model_quotas_json`/删 `quota_tokens` ∥ 期初回填——全 DDL 逐字）∥ v4 段 settings 形补 `quotaTokens`（消费补配额句）∥ 表归属补 metering 两表 ∥ §3 迁移链补 v5 段（判据 + 一次性耗时读数）∥ §4 预算（db 150 ⇒ ≈205）∥ §5 增 KD-SV-40；同源随动 = `metering/METERING.md` §1/§2 ∥ `gateway/API.md` §2.2。
- 2026-10-07：配额 v2 · 成员模型面批设计轮（批 `docs/batches/2026-10-07-quota-v2-member-models.md`——需求 §2:23 ∥ 台账 #1002/#1003/#1004 + 并入 #1001/#994/#995/#988）——§1 结构版本 5 ⇒ 6 ∥ §2 增 v6 增段（`members.model_disabled_json`——形/消费/与配额列并置句）∥ §3 迁移链补 v6 段（判据）∥ §4 预算（db 实读 202 ⇒ ≈214）；同源随动 = `accounts/ACCOUNTS.md` §2.2/§3 ∥ `gateway/API.md` §2.1。
- 2026-10-07：Provider 模型元数据批设计轮（批 `docs/batches/2026-10-07-provider-model-metadata.md`——台账 #1005 + 并入 #984）——§1 结构版本 6 ⇒ 7 ∥ §2 增 v7 增段（`providers.model_meta_json`——形/写面/读面/消费/圈界）∥ §3 迁移链补 v7 段（判据）∥ §4 预算（db 实读 210 ⇒ ≈218——v6 落地后基数重估）；同源随动 = `gateway/API.md` §2.2 ∥ `webui/WEBUI.md` §2.4④。
- 2026-10-07：fix 轮（评审轮次 1——批 `docs/batches/2026-10-07-provider-model-metadata.md` §3 九发现，本档面）：§4 预算按现读重估（v6 已落盘——db 实读 210；v7 终值 ≈218——上条括注同拍）。
- 2026-10-07：me-keys 批设计轮（批 `docs/batches/2026-10-07-me-keys-redo.md`——需求 §2:25 ∥ 台账 #1023）——§1 结构版本 7 ⇒ 8 ∥ §2 增 v8 增段（`api_keys.name`——形/语义指针/写读面/回填口径）∥ §3 迁移链补 v8 段（判据）∥ §4 预算（db 实读 210 ⇒ ≈228——v8 段 +≈10）；同源随动 = `accounts/ACCOUNTS.md` §1.1 ∥ `webui/WEBUI.md` §2.3⑥。
- 2026-10-09：server 代理批设计轮（批 `docs/batches/2026-10-09-server-gemini-openai-preset.md`——台账 #1129；用户 13:5x 令）：§1 结构版本 8 ⇒ **9** ∥ §2 增 v9 增段（`providers.proxy`——形/语义指针/圈界）∥ §3 迁移链补 v9 段（判据）∥ §4 预算（db 实读 ≈224 ⇒ ≈234——v9 段 +≈10）；同源随动 = `gateway/API.md` §2.2/§6 KD-SV-55 ∥ `ops/OPS.md` §1 ∥ `webui/WEBUI.md` §2.4④。
- 2026-10-09：配置控制台批设计轮（批 `docs/batches/2026-10-09-server-console-config.md`——台账 #1139；用户 15:51–15:57 三连）：§1 结构版本 9 ⇒ **10** ∥ §2 增 v10 增段（`audit_events` CHECK 扩型——表重建 SQL 逐字 ∥ 语义/圈界）∥ §2 标题随正 ∥ §3 迁移链补 v10 段（判据）∥ §4 预算（db 实读 231 ⇒ ≈256——v10 段 +≈25）；同源随动 = `accounts/ACCOUNTS.md` §2.1（事件型/写入面） ∥ `webui/WEBUI.md` §2.3④（十型）。**产品码零触（设计轮）**。
- 2026-10-09：设计修正轮（fix——批 `docs/batches/2026-10-09-server-console-config.md` §3 评审发现 6，本档面）：§1 版本枚举补 v9 条（`providers.proxy`——server 代理批）。**零新语义**（评审发现直接导出项）。
- 2026-10-09（**server-model-alias 批 · 设计轮 · eng-designer**——承批档 `docs/batches/2026-10-09-server-model-alias.md` §2 · 台账 #1153；需求 §2:29 + AC-29）：§1 补零结构变更句 ∥ §2 v2 段 `models_json` 注释两形 + 增条目两形/别名语义条 ∥ v5 拆列注释随正（内部真名）+ `provider` 约定句补别名回映射 ∥ v6 禁令键形收正（裸名合法 + 首尾空白 400——#1008）∥ §3 补零结构变更条（版本保持 **10**）∥ §4 db.mjs 行 ±0 句。**产品码零触（设计轮）**。
- 2026-10-10（**server-exec-sandbox 批 · 设计轮 · eng-designer**——承批档 `docs/batches/2026-10-10-server-exec-sandbox.md` §2 · 台账 #1224；需求 §5 沙盒块 + 用户 14:00 两平面裁定）：§1 结构版本 10 ⇒ **11** ∥ §2 增 v11 增段（沙盒七表 DDL ∥ 审计 CHECK 再扩（十型 ⇒ 十二型）重建注）∥ §2 标题随正 ∥ 表归属补 sandbox 行 ∥ §3 迁移链补 v11 段（判据）∥ §4 预算（db 实读 255 ⇒ ≈345——v11 段 +≈90）；同源随动 = `sandbox/SANDBOX.md` §2 ∥ `accounts/ACCOUNTS.md` §2.1（十二型） ∥ `gateway/API.md` §2.5/§2.6。**产品码零触（设计轮）**。
- 2026-10-10（**server-exec-sandbox 批 · 设计评审轮 1 修正（fix 轮）· eng-designer**——承批档 `docs/batches/2026-10-10-server-exec-sandbox.md` §3 轮次 1 之 1/2 + 用户 14:56 直令）：§2 v11 段 `sandbox_workspaces` 增 `limits_json` 列（每工作区覆写——键集/取值序 = `sandbox/SANDBOX.md` §2）∥ `sandbox_settings` 注释收正（键全集/值形单源 = `gateway/API.md` §2.5；「默认单」非本表 = `sandbox_rules` 种子行）∥ 增 ③ 种子注（初始化点 = 本段一次性写入——八行：deny 三 + allow 五；恒拒两项非行）∥ `sandbox_event` 注补 join 失败 ∥ §3 v11 判据补种子八行 + 覆写列 ∥ §4 db.mjs 行随正（⇒ ≈350）。**零新语义**（评审发现直接导出项 + 用户直令）。
- 2026-10-10（**runner-admin-console 批 · 设计档随正 · eng-designer**——承批档 `docs/batches/2026-10-10-runner-admin-console.md` §1 · 台账 #1252；用户 2026-10-10 19:52–19:56 口径「runner = 远程 Docker API 节点」）：§2 v11 段列面随正——`sandbox_runners` 去 token_hash/labels_json/last_heartbeat_at、增 address（Docker API 地址）、status 枚举收窄（active/disabled）、runtime_json 注释 = 连通自检读数 ∥ `sandbox_workspaces` 去 required_labels_json（runner_id 注释 = 绑定节点）∥ `sandbox_tasks` 去 claimed_at（status 去 claimed）∥ 审计注/种子注/端点注随正；**`db.mjs` v11 列面实现与本节差 = 实施侧收正项（重做批）**；同源随动 = `sandbox/SANDBOX.md` §2 ∥ `accounts/ACCOUNTS.md` §2.1 ∥ `gateway/API.md` §2.5。**产品码零触**。
- 2026-10-10（**runner-admin-console 批 · A 批最小切片设计 · eng-designer**——承批档 `docs/batches/2026-10-10-runner-admin-console.md` §1 · 台账 #1252；用户 19:59 令）：§1 结构版本 11 ⇒ **12** ∥ §2 标题随正（v2–v11 ⇒ v2–v12）+ **增 v12 增段**（`sandbox_runners` 表重建——旧通道形态 ⇒ Docker 节点形态；重建步 ∥ 存量行弃 ∥ 幂等判据；列面不重复 = v11 段所列为准）∥ §3 迁移链补 v12 段（判据）∥ §4 预算（db 实读 **365** ⇒ ≈400——v12 段 +≈35）；同源随动 = `sandbox/SANDBOX.md` §2/§3。**产品码零触（设计轮）**。
- 2026-10-10（**runner-admin-console 批 · 托管接入（管理面 agent）设计 · eng-designer**——承批档 §2 · 台账 #1236/#1237；用户 22:19–22:29 四句 + 15:00/15:02 裁）：§1 结构版本 12 ⇒ **13** ∥ §2 标题随正（v2–v12 ⇒ v2–v13）+ **增 v13 增段**（`sandbox_onboarding` 建表——任务态/步骤日志/凭据密文；密钥文件显式不落库 ∥ 十八列）∥ §3 迁移链补 v13 段（判据）∥ §4 预算（≈400 ⇒ ≈425——v13 段 +≈25）；同源随动 = `sandbox/SANDBOX.md` §2/§3 ∥ `accounts/ACCOUNTS.md` §2.1。**产品码零触（设计轮）**。
- 2026-10-11（**admin-agent-chat 批 · 设计轮 · eng-designer**——承批档 `docs/batches/2026-10-11-admin-agent-chat.md` §1 · 台账 #1254；需求 §5「两个 chat 界面」②④）：§1 结构版本 13 ⇒ **14** ∥ §2 标题随正（v2–v13 ⇒ v2–v14）+ **增 v14 增段**（agent chat 两表 —— 会话/消息序 ∥ 审计 CHECK 再扩十二 ⇒ 十三型：+ `agent_event`；重建步同 v10/v11 同构）∥ §3 迁移链补 v14 段（判据）∥ §4 预算（db 实读 **409** ⇒ ≈450——v14 段 +≈41）；同源随动 = `agent/ADMIN-AGENT.md` §11/§12 ∥ `accounts/ACCOUNTS.md` §2.1（十三型） ∥ `gateway/API.md` §2.8。**产品码零触（设计轮）**。
- 2026-10-10（**runner-admin-console 批 · 设计评审轮 1 修正（fix 轮）· eng-designer**——承批档 `docs/batches/2026-10-10-runner-admin-console.md` §3 轮次 1 之 8）：§2 v11 段 `sandbox_workspaces` ∥ `sandbox_tasks` 两表定义处就近补注（列面差 = 去 `required_labels_json` ∥ 去 `claimed_at`——与 v12 段旁注同指；实现收正随执行面重做批）。**零新语义**（评审发现直接导出项）。
- 2026-10-11（**admin-agent-chat 批 · 实施轮上抛回笔（fix 轮）· eng-designer**——承批档 `docs/batches/2026-10-11-admin-agent-chat.md` §6（实施轮上抛处置 + notice 补裁——④ 空回合单列 · 四值枚举））：§2 v14 段 `data_json` 注释收正——notice 的 `reason` 四值枚举（重启收尾 "restart" ∥ 预算超限 "budget" ∥ 模型错误 "model_error" ∥ 空回合 "empty_turn"；与 `gateway/API.md` §2.8 ∥ `agent/ADMIN-AGENT.md` §11 同拍）。**零新语义**（上抛裁决直接导出项）。
- 2026-10-11（**sandbox-image-sources 批 · 设计轮 · eng-designer**——承批档 `docs/batches/2026-10-11-sandbox-image-sources.md` §1 · 台账 #1274）：§1 结构版本 14 ⇒ **15**；§2 标题随正（v2–v14 ⇒ v2–v15）+ **增 v15 增段**（`image_sources` 建表——源清单全局表 ∥ 名/址两唯一约束 ∥ 五列；审计 CHECK 零动——三 kind 走 `sandbox_event`）；§3 迁移链补 v15 段（判据）；§4 预算（db 实读 **458** ⇒ ≈490——v15 段 +≈32）；同源随动 = `sandbox/SANDBOX.md` §2/§3 ∥ `gateway/API.md` §2.5 镜像源七行 ∥ `accounts/ACCOUNTS.md` §2.1。**产品码零触（设计轮）**。
- 2026-10-11（**chat-shell-align 批 · 设计轮 · eng-designer**——承批档 `docs/batches/2026-10-11-chat-shell-align.md` §1 · 台账 #1292；用户 21:55 裁「全套 ∥ 补后端一件不藏 ∥ VSC 式」）：v14 段 `data_json` 注随正——notice `reason` **五值**（+ 手动中止 `"aborted"`）∥ user 行 **`imageParts`** 键登（parts 数组形——KD-SV-109；`chat_stop` 注同拍）；**零结构变更**（结构版本 15 不变——列存 JSON 内键集扩展）。同源随动 = `agent/ADMIN-AGENT.md` §11.2/§11.3 ∥ `gateway/API.md` §2.8 ∥ `webui/CHAT.md` §2.1。**产品码零触（设计轮）**。
- 2026-10-11（**chat-shell-align 批 · 设计评审轮 1 修正（fix 轮）· eng-designer**——承批档 `docs/batches/2026-10-11-chat-shell-align.md` §3 轮次 1 之 2；父侧受理全单）：v14 段 `agent_event` kind 注 `chat_stop` 收尾括注五值统一（+ 手动中止——与同句 detail `reason` 五值枚举对齐）。**零新语义**（评审发现直接导出项）。
- 2026-10-12（**team-projects-permissions 批（B2）· 设计轮 · eng-designer**——承批档 `docs/batches/2026-10-12-team-projects-permissions.md` §1 · 台账 #1216；需求 44 ∥ AC-44）：§1 结构版本 16 ⇒ **17**；§2 标题随正（v2–v16 ⇒ v2–v17）+ **增 v17 增段**（`git_sources` ∥ `projects` ∥ `project_members` 三表——源表七字段/仓表（一对一）/成员表（用户名键 + manual∥sync）；两索引；审计 CHECK 再扩十三 ⇒ **十四型**：+ `project_event`——重建步同 v10/v11/v14 同构）∥ §3 迁移链补 v17 段（判据）∥ §4 预算（db 实读 **488** ⇒ ≈560——v17 段 +≈70 ∥ **新档行一**（`credential-crypto.mjs` ≈60——KD-SV-119 自 sandbox 抽出共享））；同源随动 = `project/PROJECTS.md`（新档） ∥ `gateway/API.md` §2.9 ∥ `accounts/ACCOUNTS.md` §2.1（十四型） ∥ `webui/PROJECTS.md`（新档）。**产品码零触（设计轮）**。
- 2026-10-12（**team-projects-permissions 批（B2）· 设计修订轮（fix）· eng-designer**——承批档 `docs/batches/2026-10-12-team-projects-permissions.md` §3（评审 #277）∥ 用户 2026-10-12 授权两件）：§2 v17 段 `git_sources` 增 **`hook_secret_cipher`** 列（事件进路——`project/PROJECTS.md` §13）∥ `projects.address` 注释收正（**跨形归一**——`project/PROJECTS.md` §5）+ 圈界句增项目删除级联/双密钥注 ∥ v17 判据行补列在场 ∥ §3 v17 链行同拍 ∥ §4 `db.mjs` 行补 **>500 软线复核（判 = 维持 + 上限 700 触发外拆）** ∥ §4 `credential-crypto.mjs` 行随正（≈65——`credentialKeyPath` 同件收口）。**产品码零触（设计轮）**。
- 2026-10-12（**team-projects-permissions 批（B2）· 设计修订轮 2（fix）· eng-designer**——承批档 `docs/batches/2026-10-12-team-projects-permissions.md` §3 轮次 2（评审 #280 之 2））：§2 v17 段 kind 枚举补 `project_delete` + 计数「十一 kind」（逐值对齐 `accounts/ACCOUNTS.md` §2.1）。**零新语义**（评审发现直接导出项）。
- 2026-10-12（**server-wake-face 批 · 修订轮（fix 轮「加宽」）· eng-designer**——承批档 `docs/batches/2026-10-12-server-wake-face.md` §1.3/§1.4（条目 ③④ 入批）；用户 15:44「应该走我们自己的模型代理服务，这样才能确保用量统计的准确」；台账 #1324）：§1 结构版本链补 **v18 段**（`api_keys.key_plain`——管理面 sk 明文面）；§2 标题随正（v2–v17 ⇒ v2–v18）+ **增 v18 增段**（`ALTER TABLE api_keys ADD COLUMN key_plain TEXT`——NULL = 常规 ∥ 非空 = 服务端自持面（写面唯一 = `issueKey({ keepPlain: true })`）；单源 = `accounts/keys.mjs`；旁证 = 沙盒工作区 `key_plain` 先例；判据四条）∥ §3 迁移链补 v18 段（判据）∥ §4 `db.mjs` 行补 +≈14（v18 段；段序 = B2 批 v17 先落——批序另定则对调）。同源随动 = `accounts/ACCOUNTS.md` §1（存储句收正 + 管理面 sk 条） ∥ `agent/ADMIN-AGENT.md` §16.3（KD-SV-130）。**产品码零触（设计轮）。**
- 2026-10-12（**admin-chat-creds-merge 批 · 冻结域随正（fix 轮）· eng-designer**——承批档 `docs/batches/2026-10-12-admin-chat-creds-merge.md` §2（R72② 清单——父侧解冻后落） · 台账 #1326）：§1 结构版本链补 **v19 条**（版本号 17 ⇒ **19**——段号 as-of：v17/v18 归在途批，实施当刻以链尾实读为准） ∥ §2 标题随正（v2–v18 ⇒ v2–v19）+ **增 v19 增段**（`sandbox_runners` 七列 `ALTER`（主机表——KD-SV-133） ∥ `sandbox_onboarding.credential_state` CHECK 四值（+ `'moved'`——表重建，列面以 v13 段为准） ∥ 回填移交（`keep` ∧ 成功行按 `id` 序——后者胜））∥ §3 迁移链补 v19 段（判据）∥ §4 db.mjs 行补 +≈72。同源随动 = `sandbox/SANDBOX.md` §2/§3/§13/§14（KD-SV-133–135） ∥ `gateway/API.md` §2.5 ∥ `accounts/ACCOUNTS.md` §2.1。**零新语义**（R72② 清单逐项转录）。

- 2026-10-13（**段号对调收正 · 父侧**——承 creds-merge 实施轮上抛（db 段号冲突）∥ 代码实读 `db.mjs:521-529`（开库序只升 `v > 当前` ⇒ 空档不可回填））：实落次序 = admin-chat-creds-merge 先（实施在落）∥ server-wake-face 后 ⇒ 两批段号对调——**creds-merge = v18 ∥ wake-face = v19**（§1 链 ∥ §2 两段 ∥ §3 两行 ∥ §4 预算行逐处同拍；wake 批自身文档面编号由其修正轮随正）。机械对调 · 零语义变化。（父侧直接执行 · 可 revert）
- 2026-10-12（**server-wake-face 批 · 设计评审轮 1 修正（fix 轮）· eng-designer**——承批档 `docs/batches/2026-10-12-server-wake-face.md` §3 轮次 1 之 6）：§2 v14 段注补 user 行 `data.kind="reminder"` 键登（提醒投递行——timer 到期 ∥ 后台任务结算；同 `imageParts` 登记式；机制 = `agent/ADMIN-AGENT.md` §15.1）。**零结构变更**（版本号零动——列存 JSON 内键集扩展）；**产品码零触（设计轮）。**
- 2026-10-13（**team-ledger 批 · 设计轮 · eng-designer**——承批档 `docs/batches/2026-10-13-team-ledger.md` §1 · 台账 #1206；需求功能点 32 ∥ AC-32）：§1 结构版本 **19 ⇒ 20**；§2 标题随正（v2–v19 ⇒ v2–v20）+ **增 v20 增段**（`team_ledger_items` 建表（十列——全局自增编号 ∥ 仓 = 归一地址（非 FK） ∥ 六态 CHECK）+ 两索引 ＋ 审计 CHECK 再扩十四 ⇒ **十五型**：+ `ledger_event`——重建步同 v10/v11/v14/v17 同构）∥ §3 迁移链补 v20 段（判据）∥ §4 `db.mjs` 行补 +≈44（实读待回填——v20 后 ≈675；既定触发 >700 未触）。同源随动 = `ledger/LEDGER.md`（新档） ∥ `gateway/API.md` §2.10 ∥ `accounts/ACCOUNTS.md` §2.1（十五型） ∥ `webui/LEDGER.md`（新档） ∥ `docs/core/design/TEAM-LEDGER.md`（新档）。**产品码零触（设计轮）。**
- 2026-10-13（**gitee-namespace-kinds 批 · 设计轮 · eng-designer**——承批档 `docs/batches/2026-10-13-gitee-namespace-kinds.md` §1 · 台账 #1365；需求功能点 44 ⑫ ∥ AC-44 ⑬）：§1 结构版本 **20 ⇒ 21**；§2 标题随正（v2–v20 ⇒ v2–v21）+ **增 v21 增段**（`git_sources.scope_kind` 列（三值 CHECK——NULL 放行）+ 存量回填（gitee：scope 在场 ⇒ `org` ∥ 空 ⇒ `personal`；非 gitee 零动）；审计 CHECK 零动（十五型不变））∥ §3 迁移链补 v21 段（判据）∥ §4 `db.mjs` 行补 +≈14（现读 675 ⇒ ≈690——触发线 700 余 ≈10 行，实施实读回填）。同源随动 = `project/PROJECTS.md` §2/§4/§8/§9/§10/§11/§12（KD-SV-151） ∥ `gateway/API.md` §2.9 ∥ `webui/PROJECTS.md` §2.4/§3/§4。**产品码零触（设计轮）。**
- 2026-10-13（**member-face-chat 批 · 设计轮 · eng-designer**——承批档 `docs/batches/2026-10-13-member-face-chat.md` §1 · 台账 #1215；需求功能点 50 ∥ AC-50）：§1 结构版本 **21 ⇒ 22**；§2 标题随正（v2–v21 ⇒ v2–v22）+ **增 v22 增段**（`member_sessions`（`workspace_id`/`member_id`/`model`/`reasoning`/`status`）+ `member_session_messages`（`seq`/`role` 四值/`data_json`）+ 两索引 ∥ 审计 CHECK 再扩十五 ⇒ **十六型**：+ `member_event`——重建步同 v10/v11/v14/v17/v20 同构）∥ §3 迁移链补 v22 段（判据）∥ §4 `db.mjs` 行补 +≈70（现读 ≈690 ⇒ ≈760——**越触发线 700 ⇒ 迁移段外拆 `src/store/migrations.mjs`（拟新增）本批先行落地**；触发条件已在案）。同源随动 = `agent/MEMBER-AGENT.md`（新档） ∥ `gateway/API.md` §2.11/§2.12 ∥ `accounts/ACCOUNTS.md` §2.1（十六型） ∥ `webui/CHAT.md` §2.2。**产品码零触（设计轮）。**
- 2026-10-13（**member-face-chat 批 · 设计评审轮 1 修正（fix 轮）· eng-designer**——承批档 `docs/batches/2026-10-13-member-face-chat.md` §3 轮次 1 之 4（连带——闸面锚读数））：§2 v22 段新档路径 `src/store/migrations.mjs` 补「（拟新增）」标记（未落盘档须带标记，否则计悬空）。**零新语义**（闸面标记）；产品码零触（设计轮）。
- 2026-10-13（**sandbox-exec-rebuild 批 · 设计轮 · eng-designer**——承批档 `docs/batches/2026-10-13-sandbox-exec-rebuild.md` §1 · 台账 #1373）：§1 结构版本 **22 ⇒ 23** ∥ §2 标题（v2–v22 ⇒ **v2–v23**）+ **增 v22 收正段**（`sandbox_workspaces` 表重建（去 `required_labels_json` ∥ 增 `stop_reason`）+ `sandbox_tasks` 删表）+ 原 v22 段顺延 **v23** ∥ v11 段两处旁注收正 + 表归属七 ⇒ **六表** ∥ v12 段旁注收正 ∥ §3 增 v22/v23 两行 ∥ §4 `db.mjs` 行（实读 688 ⇒ 触发达成 ⇒ 拆案本批落；命名单源 `migrations.mjs`）。同源随动 = `sandbox/EXECUTION.md` §9 ∥ `agent/MEMBER-AGENT.md` §5 ∥ `accounts/ACCOUNTS.md` §2.1。**产品码零触（设计轮）**。
- 2026-10-13（**sandbox-exec-rebuild 批 · 设计修订轮增补（fix 轮）· eng-designer**——承批档 `docs/batches/2026-10-13-sandbox-exec-rebuild.md` §1 「2026-10-13 21:32 · 用户裁定（底座可换 = 完整功能进本批）」）：§1 v22 收正段句增两件（`base_image` 列 ∥ `registry_credentials` 建表）；§2 v22 段：DDL ① 增 `base_image TEXT`（NULL = 标准镜像）+ ④ 增 `registry_credentials` 建表（`host` 唯一 ∥ `secret_cipher` 密列零回显）∥ 圈界/语义句随正 ∥ **判据收正**（列面八行 ⇒ **十行**——原值对 DDL 差 1，本笔随正纠偏；增 `registry_credentials` 在场 + `host` 唯一腿）；同段旁注（v12 段）+ 表归属（六表 ⇒ **七表**）随正；§3 v22 行判据同拍；§4 `db.mjs` 行：`migrations.mjs` ≈430 ⇒ **≈470**（本增补 +≈40——底座可换；全形 = `sandbox/EXECUTION.md` §8/§15 KD-SV-184/188）。同源随动 = `sandbox/EXECUTION.md` ∥ `sandbox/SANDBOX.md`（§2/§3） ∥ `gateway/API.md` §2.5 ∥ `accounts/ACCOUNTS.md` §2.1。**产品码零触（设计轮）。**
- 2026-10-13（**sandbox-exec-rebuild 批 · 设计评审轮 1 修复（fix 轮）· eng-designer**——承批档 `docs/batches/2026-10-13-sandbox-exec-rebuild.md` §3 轮次 1（评审 #91 之 7）：§4 `db.mjs` 行链内 member-face-chat 段号 **v22 ⇒ v23**（按结构单源——v22 = 沙盒收正段 ∥ v23 = 成员面）；随正读数与拆案归属（拆案实施 = sandbox-exec-rebuild 批；v23 段入 `migrations.mjs`——该档面 ≈540，本档 ≈300）。**零新语义（段号/读数收正）；产品码零触。**
- 2026-10-13（**member-face-chat 批 · 裁定修订轮（fix 轮）· eng-designer**——承批档 `docs/batches/2026-10-13-member-face-chat.md` §1（用户裁定：题一翻案——会话真源在盒内 / 题三补——成员 git 凭据））：§1 结构版本链 v23 行重定（**成员 git 凭据表 + 审计 CHECK 十六型**——会话两表不建）∥ §2 v23 段全重写（凭据表 DDL（`(member_id, host)` 唯一）+ 圈界（密列单点 ∥ kind 非枚举——六 kind）+ 判据（含 `member_sessions` 表不在））∥ §3 v23 行同拍（判据：凭据表列面/唯一 + 会话表不在）∥ §4 `db.mjs` 行链 member-face 段 **+≈70 ⇒ ±0**（v23 入 `migrations.mjs`）+ 两档实读回填（本档 **37** ∥ 该档 **711**——在册估低收正）。**产品码零触（设计轮）。**
- 2026-10-13（**sandbox-exec-rebuild 批 · 实施上抛一裁 · 父侧直接执行（可 revert）**——承本批实施上抛（#106 底座舱 · 文档相抵）：`registry_credentials` 增 `updated_at TEXT`（§2 v22 段 DDL 于 `created_at` 后——**七列**）+ 判据「列面六行」⇒「**七行**（含 `updated_at`）」——消解 `gateway/API.md` §2.5（列表行 `updatedAt`）∥ `webui/SANDBOX.md` §2.1①（卡面「更新时间」）与 DDL 无该列之相抵（否则编辑后「更新时间」恒为创建时刻——用户可见失真）。落法：本档两处 = 父侧直接执行；`migrations.mjs` DDL 列 = steer 执行面舱（#104）；写面维护（update 径刷新）= 底座舱（#106）。API/webui 两处已含 `updatedAt`——零动。**产品码零触（设计档收正）。**
