# Thincoder Server · 计量（metering/METERING）

> 板块 = server ∥ 本档 = metering 域（记账 ∥ 配额 ∥ 查询）；板总览 = `PROJECT.md`（文档地图 = §3）。
> 需求单源 = `docs/server/requirements/PROJECT.md`（功能点 3 ∥ 4）；本域回指 = `PROJECT.md` §7（AC-3 ∥ AC-4 判据 = 本档 §4）。

## 1. 记账（usage）

- 落库 = **请求终结后同一事务三写**（请求结束 ∥ 流终结 ∥ 客户端断开时）：`usage` 行 INSERT + `usage_daily` upsert（计数 +1 ∥ token/时长/错误数累加） + `quota_counters` upsert（token 累加）——单写点 `recordUsage`（KD-SV-8 修订——§6）；
  两 upsert 的 `day`/`month` 键 = 行 `ts` 推导（`strftime(…, ts / 1000, 'unixepoch', 'localtime')`——与 v5 回填/对账 SQL 同表达式；非入账时刻）；
  任一步失败 ⇒ 整事务回滚（两派生面零漂移）；表结构 = `store/STORE.md` §2 v5 段。
- 行形 = 一行/请求：成员 × key × 模型（**`provider` ∥ `model` 两字段** = 内部真名（转发/存储零涉）——对外显示 = **别名回映射**（配别名 ⇒ 别名 ∥ 未配 ⇒ `provider/model`；回映射单源 = `thincoder-server/src/gateway/providers.mjs` 别名索引——KD-SV-59）；`model` 可含斜杠；嵌入行 `provider = ''`——无前缀命名空间，仅统计照记） × 时段（`ts`） × token（三列 + 状态/端点/流式标记/耗时）；
  token 三列 = **上游 usage 原值**（逐值不加工——AC-3 判据单源）；上游未回 ⇒ 三列 NULL（status 照记实况；派生日表该行 token 计 0）。
- 提取来源 = gateway 侧 tap 扫描（`gateway/API.md` §2.1）。
- **管理面 chat 出账**：管理面 chat（**含唤醒回合**）的模型调用 = 本 server 网关链的进程内客户端（loopback）⇒ 与四端客户端**同径出账**：
  `usage` 行归因 = 本回合发送者（`member`——缺位 ⇒ 会话 owner；2026-10-13 收正——谁用谁）× 该成员的 `admin-agent` key（`keyName` = `admin-agent`）；端点/流式/状态列 = 网关侧实况（与客户端同径）；配额/限流/禁用三件同门生效（阻断面 = 网关错形）。机制全文 = `agent/ADMIN-AGENT.md` §16.2/§16.3。
- **派生两表 = 汇表面读源 ∥ 检查面点查源**（`usage_daily` ∥ `quota_counters`——粒度/字段 = §2.3；**可随时自 usage 重算**——对账命令 = §2.5）；仅 `usage` 为真源——明细/导出/审计毫秒精度零改。
- 保留 = **保留窗（配置化——`usageRetentionDays`，`ops/OPS.md` §1）**：缺省 90 天（论证 = 配额周期 = 月 ⇒ 跨月可见必需；统计回看惯例 = 一季 ⇒ 90 天覆盖；表只增不减 = 无界增长面 ⇒ 缺省窗收口）；`null` = 不限（保留全量——显式开）；非正整数 ⇒ 拒启。
- 清理 = **删除式**（`pruneUsage`——`thincoder-server/src/metering/`）：usage（`ts <` 界 ∥ 走 `idx_usage_ts`） + `usage_daily`（`day <` 界日） + `quota_counters`（`month <` 界月）**三删同事务同窗**；时机 = **启动一次 + 每 24h**（实现常量；入口接线 = `thincoder-server/bin/thincoder-server.mjs`）；无归档面（§8）。
- **审计事件同窗同清**：`audit_events`（v3）清理复用本保留窗与调度点（启动一次 + 24h——`accounts/ACCOUNTS.md` §2.1；保留治理单旋钮）。
- **清理失败口径 = 启动 fail-closed ∥ 周期 fail-open**：启动一次（抛 ⇒ `startup_failed` + 退出码 1） ∥ 周期（`usage_prune_failed` warn 续跑）。
- **查询面口径**：保留窗不涉查询契约（窗外行自然不在结果——`from` 早于窗界亦同；非错）∥ **明细面（`/api/usage` ∥ `/api/me/usage` ∥ export ∥ 审计）= `usage`（真源——毫秒精度）** ∥ **汇表面（summary/totals/key 窗/成员月累计）= `usage_daily`（本地日粒度——窗沿取整含端日；API 形零变——KD-SV-39）**。

## 2. 配额（分模型三级·计数准入——KD-SV-38）

### 2.1 三级生效（需求 §2:21——用户 09:28）

- ① **成员 × 模型覆盖** = `members.model_quotas_json`（JSON map——键 = 对外标识（别名 ∥ `provider/model`）；值 = ≥0 整数；未设 = 用平台） ⇒ ② **模型平台默认** = `providers.settings_json[上游模型名].quotaTokens`（未设 = 不限） ⇒ ③ **不限**。覆盖 = 整值替换（可高于 ∥ 低于平台——用户 09:28「覆盖平台设置」字面）。
  **键随别名随动**（KD-SV-59）：写面键形 = 当前对外标识（配别名模型 ⇒ 别名形）；别名变更 ⇒ 旧形键落入离表键（恒保留、不生效——无历史/迁移）。
- 单位 = token（`total_tokens` 口径） ∥ 周期 = 自然月（服务器本地时区；月键 = `'YYYY-MM'`——平台 ∥ 覆盖同窗，用户 09:30）。
- 配置落点 = 服务模型页配置弹窗（平台——`webui/ADMIN.md` §2.1③） ∥ 成员弹窗（覆盖——`webui/ADMIN.md` §2.1②）；写面 = `POST /api/members/:id/model-quotas`（键级合并——§3） ∥ PATCH `settings`（平台）。

### 2.2 检查点与超限形

- 检查点 = **派发命中后、转发前**（与模型限流准入并列——「准入前拒打不落用量」不变）；**仅 chat**——嵌入面零涉（用户 09:31 裁；旧实现的嵌入总额检查已移除——收正）。
- 超额 ⇒ 429 `quota_exceeded`（message 含模型外标 + 已用/额度——如「模型 p/m 本月 token 额度已用尽（已用 X / 额度 Y）」）；**他模型不受累**（按请求模型判）。
- 嵌入不受配额管理（计量照记——含嵌入计数行）。已知边界：单笔可越顶（准入不知本笔产出——同「不估 token」取舍）。

### 2.3 派生两表维护（计数面 ∥ 汇表面）

- **`quota_counters`**（检查面）：粒度 = 成员 × provider × 模型 × 自然月（`tokens` 列）；维护 = 随记账**同事务 upsert 累加**（§1——单写点防漂移）；全记账行照计（含嵌入——检查只读 chat 键）；月翻滚 = 新月份键自然归零（零翻转逻辑）；期初 = v5 迁移自 usage 一次性聚合回填。
- **`usage_daily`**（汇表面）：粒度 = 日 × 成员 × key × provider × model × endpoint（请求数 ∥ 三 token 和 ∥ 时长和 ∥ 错误数）；维护 = 同事务 upsert 累加（同上）；日键翻滚自然归零；期初 = v5 回填。
- **计数表读面两形**：① 点查（准入——§2.4）∥ ② 成员月表读（`monthlyCountersByMember`——成员弹窗逐行已用：Map 成员 → 外标 → tokens；外标回拼 = **读面回映射**：配别名 ⇒ 别名 ∥ 未配 ⇒ `provider = '' ? model : provider + '/' + model`；`memberId` 给定 ⇒ 唯一键前缀查询 ∥ 缺省 = 全员一次装配（免 N+1））。
- 两表 = 可重算派生面（真源 = usage）；保留/清理同窗（§1）；**键时基 = 行 `ts` 同源**（`day`/`month` 随 `usage.ts` 推导——与回填/对账同表达式；跨零点/月初终结请求 ⇒ 键归 `ts` 所在日/月——对账零幻影漂移；§1）。

### 2.4 检查查询与性能（用户 09:31 点名——硬要求）

- **检查 = 点查固定计数字段**（非 SUM——用户 09:34 直令）：`SELECT tokens FROM quota_counters WHERE member_id = ? AND provider = ? AND model = ? AND month = ?`——O(1)（唯一键点查；EXPLAIN 预期 = `SEARCH … USING INDEX sqlite_autoindex_…`）。
- **三级全无 ⇒ 零 SQL 短路**：成员 map 随鉴权行（解析一次）+ 平台值随运行时快照（`settingsFor`——内存）⇒ 无限额 ⇒ 直接放行、不触库（现状缺陷收正：旧 `checkQuota` 先跑 SUM 后判「不限」——不限成员每请求白付全量 SUM，已两步对调）。
- **目标读数**（@500k 行同构库）：配置命中路径 ≤ 0.05ms（p95） ∥ 短路路径零 SQL（µs 级——JSON 解析 0.08–0.28µs/请求）。**探针读数**：点查 p50 **0.004ms** ∥ p95 **0.005ms**；同构复测 3.3–7.0ms（分布/机器差）。
- **实测法** = 同构探针：临时库同形 500k 行 + 同 SQL/同参数——预热后 ≥1000 次采样报 p50/p95（探针 = `.thincoder/tmp` 零落仓）。
- **不加缓存 ∥ 不加批量**（判据：点查读数优于目标一个量级——余量 10×+；缓存失效面 ∥ 批写路径复杂度无对应收益——宁简勿繁；负载升档 = 升级阶梯）。
- 对账面候选（不采）：覆盖索引 `usage(member_id, provider, model, ts, total_tokens)`——实测 21.4→0.14ms（150×）但读数仍随明细行数线性涨；判据 = 检查已与行数解耦（固定字段）——索引仅常数提速，无对应收益（读数留作对账/报表参照；对账高频化 ∥ 报表批再触即评估）。

### 2.5 对账与修复（防漂移兜底）

- `node src/ops/cli.mjs --config <档> usage reconcile [--month YYYY-MM] [--fix]`（本机直开库——`ops/OPS.md` §3）：对账面 = `usage_daily` + `quota_counters` **vs usage 重算**（缺省窗 = 当本月；重算 = 同回填 SQL 逐值）；只报缺省——`--fix` = 以重算值覆写；读数 = 漂移行清单 + 合计；
  `--fix` 路径 = **读快照与覆写同事务**（`BEGIN IMMEDIATE` 先行——CLI 对账 × server 记账的跨进程并发窗闭合；报告路径（无 `--fix`）零改）。
- 口径注：对账只对**完整月**有意义（当本月 ∥ 指定月；保留窗切割月含清理残差——读数自明）；两派生表自 usage 全量可重算（真源单点）。

## 3. 查询与额度端点（本域）

（错误形 = `gateway/API.md` §3；写端点仅收 `application/json`；同族其余端点 = `accounts/ACCOUNTS.md` §3）

| 方法 + 路径 | 鉴权/角色 | 语义 |
|---|---|---|
| `GET /api/me/usage` | 会话 | 本人用量明细（成员固定 = 本人；列同下；过滤：`model` ∥ `endpoint` ∥ `from` ∥ `to` ∥ `limit`——读端点同过滤器） |
| `GET /api/me/usage/summary` | 会话 | 本人用量报表（成员固定 = 本人）：过滤 `model` ∥ `endpoint` ∥ `from` ∥ `to`（同过滤器；缺省窗 = 近 30 个本地日——`USAGE_SUMMARY_DAYS`）；返回 `{ "totals": { "requests", "promptTokens", "completionTokens", "totalTokens" }, "trend": [ { "day", "requests", "totalTokens" } ], "trendByEndpoint": [ { "day", "endpoint", "requests", "totalTokens" } ], "trendByModel": [ { "day", "model", "requests", "totalTokens" } ], "byModel": [ { "model", "requests", "totalTokens" } ] }`——数值列 = number ∥ `day` = 本地日键 `YYYY-MM-DD` ∥ `model`/维值 = 回拼外标；`trend` = 按日零填充全序列 ∥ 两维序 = 逐（维值 × 日）零填充（维值集 = 窗口内有数据者；缺日计 0）∥ `byModel` 降序（与 `/api/usage/summary` 同口径；`promptTokens`/`completionTokens` 拆 = 本端点独有）；实现 = `memberUsageSummary`：调 `usageSummary({ memberId })`（成员固定——既有函数零改）+ 独立拆 totals 查询（同窗同过滤——prompt/completion 拆值）+ 两维序查询；admin 端点/读函数/响应组装零触（KD-SV-50） |
| `GET /api/usage` | admin | 全队用量明细（过滤：member ∥ model ∥ endpoint ∥ from ∥ to ∥ limit——缺省 100 ∥ 上限 500）；返回 `{ "rows": [ { "id", "ts", "member", "keyHint", "keyName", "endpoint", "model", "status", "stream", "promptTokens", "completionTokens", "totalTokens", "durationMs" } ] }`（`ts` 原样 unix ms——页面本地化显示；`keyName` = key 名称（签发携名／缺省名 `key-N`——2026-10-12 usage-key-name 笔；无名历史行 ⇒ 空串）） |
| `GET /api/usage/summary` | admin | 用量报表读数（功能点 15②；数据源 = `usage_daily`——KD-SV-39）：过滤面同上；时段缺省 = **近 30 天**（`USAGE_SUMMARY_DAYS`）；返回 `{ totals: { requests, totalTokens }, trend: [{ day, requests, totalTokens }], byModel: [{ model, requests, totalTokens }], byMember: [{ member, requests, totalTokens }] }`——trend = 按日（服务器本地日界）**零填充**全序列；byModel/byMember = 降序聚合（聚合与排行同数据面——降序即排行）；`byModel` = provider×model **两列聚合**（`model` 字段 = 回拼对外标识——形不变） |
| `GET /api/usage/export` | admin | 同过滤面 ⇒ **CSV 下载**（`text/csv; charset=utf-8` ∥ `Content-Disposition: attachment; filename="usage.csv"`）：列 = `ts,member,key_hint,endpoint,model,status,stream,prompt_tokens,completion_tokens,total_tokens,duration_ms`（表头英文——机器面）；`ts` = ISO 8601（UTC）∥ `stream` = 1/0 ∥ NULL token = 空单元格；RFC 4180 引号规则 + 行尾 CRLF + UTF-8 BOM（Excel 中文兼容）；行数上限 `USAGE_EXPORT_MAX = 100000`（超 ⇒ 400「收窄时段」；常量注入口径） |
| `POST /api/members/:id/model-quotas` | admin | 设分模型覆盖（键级合并）：`{quotas: {"<对外标识（别名 ∥ provider/model）>": N|null}}`——值 null = 删键 ∥ ≥0 整数；未出现键不动；**键形校验** = 非空 ∥ 无首尾空白 ∥ 含斜杠时两段非空（裸名 = 别名形合法）∥ 非法键 ⇒ 400（库零变）；返回 `{id, modelQuotas}` |

（过滤参数 `endpoint` ∈ `chat` ∥ `embeddings`（缺省 = 不过滤；非法值 ⇒ 400 `invalid_request_error`）——五读端点同门（两明细 ∥ 两报表 ∥ 导出）；`model` 过滤 = 对外标识形；解析优先级：`endpoint = embeddings` 在场 ⇒ 全串按 `provider = ''`（嵌入命名空间——嵌入名可含斜杠，不切分）∥ 否则**先经别名索引反查**（命中 ⇒ 真名对——KD-SV-59）∥ 未命中且含斜杠 ⇒ `(provider, model)` 逐值对 ∥ 否则 ⇒ `provider = ''`。
  **读面回映射**：明细行 `model` ∥ 报表 `byModel`/`trendByModel` 维值 ∥ 成员月表 —— 配别名 ⇒ 显示别名（改别名 ⇒ 当即随动——无历史；映射单源 = `thincoder-server/src/gateway/providers.mjs` 别名索引）。
  **数据源分面**：明细 ∥ 导出 = `usage`（真源——毫秒精度零改）∥ 报表两面（`summary`——管理面 ∥ 本人面）/totals/key 窗/成员月累计 = 预聚合日表 `usage_daily`（本地日粒度——窗沿取整含端日；API 形零变）；**key 窗 ∥ 报表缺省窗 = 近 30 个本地日（今日起回溯——同构；`KEY_USAGE_WINDOW_DAYS` ∥ `USAGE_SUMMARY_DAYS`）**。）

**派发 ∥ 过滤两径不对称**（澄清——事实源 = `thincoder-server/src/metering/report.mjs:48-56`（过滤） ∥ `gateway/API.md:32-33`（派发））：派发 = 对外标识精确匹配、未命中 ⇒ **404 `model_not_found`**（配了别名只认别名）；过滤 = **逐值可达**——`model` 过滤值不校可达性（别名反查命中 ⇒ 真名对 ∥ 未命中 ⇒ 逐值对回落）——**过滤值不必是可达的派发名**：已配别名模型的 `provider/model` 名派发 404、过滤照经逐值对命中既有行；两径互不代偿。

## 4. 验收判据（机检）

| 需求 AC | 设计级判据 | 载体 |
|---|---|---|
| AC-3（功能点 3） | mock usage 回传 `{prompt_tokens, completion_tokens}` ⇒ `/api/usage` 返回该笔记录（成员 × 模型 × 时段 × token 四列齐 ∥ token 与上游回传**逐值相等**；存储 = `provider`/`model` 两字段——回拼无损） | 单元测试档 |
| AC-4（功能点 4） | 额度 = N ∥ 已用 ≥ N ⇒ 下一请求 **429 + `quota_exceeded` + 可读提示**；未超额 ⇒ 放行（200） | 单元测试档 |
| AC-13⑥（功能点 12——用量保留；已落需求档——`docs/server/requirements/PROJECT.md` 验收表） | 窗内旧行删除（注入时钟：刚出窗的行删、窗内行留）∥ `null` ⇒ 零删 ∥ 启动清理 + 24h 周期接线（单元测试档直调 `pruneUsage` + 断言入口接线）∥ 查询面三端点回归零变 | 单元测试档 |
| AC-15②（功能点 15——用量看板升级；已落需求档——`docs/server/requirements/PROJECT.md` 验收表） | 与 `/api/usage` **同源**（同一过滤面；数据源 = 预聚合日表——本地日粒度）：注入行集（日对齐窗）⇒ `summary.totals` 逐值 = 明细归并 ∥ trend 按日归并逐值 + 零填充全长 ∥ byModel（provider×model **两列聚合**——回拼展示）/byMember 降序逐值；CSV/明细 = 真源行集（列形 ∥ RFC 4180 转义 ∥ ISO ts ∥ 空单元格 ∥ BOM）；空集 ⇒ 空数组/totals 0/仅表头（零错）；`endpoint` 过滤（两合法值生效 ∥ 非法 400——五读端点同门）∥ `summary`/`export` 判权三态（user ⇒ 403 ∥ 无会话 ⇒ 401 ∥ admin 200）∥ 实测：30 天窗四查合计 p50 ≈11ms @500k（原明细口径 ≈2.7–4.8s——同构探针；KD-SV-39） | 单元测试档 |
| AC-21（功能点 21——配额分模型；已落需求档——`docs/server/requirements/PROJECT.md` 验收表） | ① 平台「每人每月默认用量」= settings `quotaTokens`（PATCH 保存即热生效 ∥ 非法 ⇒ 400 库与运行时零变）∥ ② 成员覆盖可设（`POST /api/members/:id/model-quotas` 键级合并 ∥ null 删键 ∥ 非法 400 ∥ 404）∥ ③ 三级序逐级生效（覆盖 > 平台 > 不限；短路 = 零 SQL——计数探针注入）∥ ④ 检查 = 仅 chat（派发命中后/转发前）∥ 窗口 = 自然月（服务器本地时区——月键 `'YYYY-MM'`；跨零点/跨月（含月初终结）键随行 `ts`、新月键零起）∥ 超限 ⇒ 429 `quota_exceeded`（message 含模型）且他模型不受累 ∥ ⑤ 嵌入零检查（旧总额检查已移除）∥ 旧总量字段退役（旧列不在 schema ∥ 旧端点 404）（判据全文 = `webui/WEBUI.md` §6 AC-21 行 + `gateway/API.md` §5 AC-21 行） | 单元测试档 |
| AC-23（功能点 23①——逐行已用数据面；已落需求档——`docs/server/requirements/PROJECT.md` 验收表） | `monthlyCountersByMember`：逐值 = 注入记账归并（自然月键——与配额检查同源同窗）∥ 外标回拼无损（`model` 带斜杠 ∥ 嵌入行单段）∥ `memberId` 给定（唯一键前缀）与全员装配逐值相等 ∥ 控制面字段形 = `webui/WEBUI.md` §6 AC-23 行 | 单元测试档 |
| AC-22（功能点 22——模型标识分字段；已落需求档——`docs/server/requirements/PROJECT.md` 验收表） | ① 记账 ∥ 计数行备 `provider`/`model` 两字段（回拼无损——含 `model` 带斜杠 ∥ 嵌入 `provider = ''`）∥ ② 统计聚合 = 列直操作（provider ∥ model ∥ 两者——`summary.byModel` 两列聚合；无字符串切分）∥ ③ 迁移拆分回填抽样比对（与旧复合值首斜杠拆逐值相等）∥ 对外契约不变（API/展示斜杠形——回拼） | 单元测试档 |
| AC-15⑥（功能点 15——key 明细数据面；已落需求档） | `keyUsageStats`：`lastUsedAt` = `MAX(ts)`（key_id 归因——读 `usage`） ∥ `windowTokens` = 近 30 个本地日（今日起回溯——与报表窗同构；读 `usage_daily`；`KEY_USAGE_WINDOW_DAYS`）——逐值 = 注入 usage 行推导；从未使用 ⇒ `null`/0；`/api/me` 与 `/api/members` key 行同形（单源 = `memberView`） | 单元测试档 |
| AC-26（功能点 26——我的用量页图表化） | `GET /api/me/usage/summary`：① 判权 = 本人（无会话 ⇒ 401；user ∥ admin 会话 ⇒ 200 且恒本人——双成员注入 ⇒ 响应只含本人值）∥ ② 逐值/零填充（totals 四字段 = 明细归并（日对齐窗）——prompt/completion/total 各自相等 ∥ trend 按日零填充全长 ∥ 两维序逐（维值 × 日）零填充（缺日 = 0） ∥ byModel 降序）∥ ③ 过滤器同门（model ∥ endpoint ∥ from/to 生效；非法 endpoint ⇒ 400——五读端点同门）∥ ④ 空集 ⇒ totals 全 0 + trend 全零全长 + 两维序/排行空数组（零错）∥ ⑤ admin 端点零动（`/api/usage/summary` 响应形与既有件回归零改） | 单元测试档 |
| AC-29④（功能点 29——成员面随动；已落需求档——`docs/server/requirements/PROJECT.md` 验收表） | 配额/禁用键 = 对外标识（配别名模型 ⇒ 别名形写入；键形校验 = 非空 ∥ 无首尾空白 ∥ 含斜杠时两段非空（裸名 = 别名形合法））∥ 记账对外标识 = 别名（读面回映射：`/api/usage` 行 `model` ∥ 导出 ∥ summary/totals 维值 ∥ `/api/me/usage/summary` 两维序 ∥ `memberView.modelUsage`——逐值 = 别名；内部两字段真名零改）∥ `model` 过滤 = 对外标识（别名先解析）∥ 改别名/清别名 ⇒ 读面当即随动（旧形键 = 离表键保留、不生效——无历史/迁移）；用例 = §7 N34/B26/E23 | 单元测试档 + 收口轮 |

## 5. 本域文件与行数预算（本域族行）

| 档 | 行数（实读——设计估） | 职责 |
|---|---|---|
| `thincoder-server/src/metering/usage.mjs`（已落盘） | 实读 **177** | 记账（单写点） ∥ 明细查询 ∥ 导出 ∥ 过滤构建 ∥ 保留清理 ∥ 时间助手 |
| `thincoder-server/src/metering/aggregates.mjs`（已落盘） | ≈**183**（`monthlyCountersByMember` 月表读两形 ∥ `--fix` 事务合围重排 ∥ 月表回映射，外标回拼换形） | 派生两表写（`usage_daily` ∥ `quota_counters` upsert） ∥ 计数点查 ∥ 成员月表读 ∥ 对账重算 ∥ 派生清理 |
| `thincoder-server/src/metering/report.mjs`（已落盘） | ≈**252**（`memberUsageSummary`（调 `usageSummary({ memberId })` + 独立拆 totals 查询 + 两维序） ∥ `byModel`/`trendByModel` 回映射（映射后排序）+ 过滤别名反查） | 汇表面读（summary ∥ totals ∥ key 窗 ∥ 成员月累计——读 `usage_daily`） |
| `thincoder-server/src/metering/quota.mjs`（已落盘） | 实读 **40** | 配额准入（点查——非 SUM） ∥ 429 形 |
| `thincoder-server/src/metering/routes.mjs`（已落盘） | 实读 **117** | 用量查询 ∥ 配额设置端点（分模型覆盖） |
| **小计** | ≈**774**（usage ≈182 ∥ aggregates ≈183 ∥ report ≈252） | —— |

## 6. 关键决策（本域）

| # | 决策 | 理由 |
|---|---|---|
| KD-SV-6 | **配额周期/单位口径 = 自然月（服务器本地时区）∥ token；时点 = 准入（不预估在途）**——机制（三级 ∥ 计数 ∥ 点查）= KD-SV-38 | 用户 09:30 裁（自然月）；单位 = token（与计量同口径，金额不涉）；准入不预估（本笔产出未知——单笔可越顶在案） |
| KD-SV-8 | **计量写入 = 请求终结后同事务三写**（`usage` 行 INSERT + `usage_daily`/`quota_counters` 两 upsert；WAL `synchronous=NORMAL`） | 单行/请求 + 团队量级；派生面同事务 = 零漂移（明细可重算——对账兜底）；写增负实测 p50 0.070ms（单 INSERT 对照 0.038ms——同构探针） |
| KD-SV-22 | **用量保留 = 配置化保留窗（缺省 90 天）+ 删除式清理（启动 + 24h）**：`usageRetentionDays`（`null` = 不限；非法 ⇒ 拒启）；三表同窗同删（`usage` ∥ `usage_daily` ∥ `quota_counters`——§1）；启动 + 周期 = 无外部调度依赖 | 表只增不减 = 无界增长面（实核）；90 天 = 配额月 + 季回看；删除式 = 零归档复杂度；启动 + 周期 = 无外部调度依赖 |
| KD-SV-27 | **用量报表 = 服务端聚合与导出**：趋势/聚合/排行 = 服务端 SQL（`/api/usage/summary` 单端点一次装配；缺省窗 30 天；数据源 = 预聚合日表——KD-SV-39）；导出 = 服务端 CSV（`/api/usage/export`——机器表头英文 ∥ ISO ts ∥ RFC 4180 ∥ BOM）；导出与明细**同源**（同一过滤面——真源 `usage`） | 前端算被否：明细行分页上限 500 撑不起趋势/聚合（多跳拉全量违分页纪律 ∥ 口径易漂）；CSV 服务端生成 = 全量导出一跳 + 转义单源；图表口（趋势）需零填充窗口——服务端产全序列（前端只画） |
| KD-SV-38 | **配额分模型 = 三级（成员×模型覆盖 ⇒ 平台默认 ⇒ 不限）+ 计数固定字段点查准入**：覆盖 = `members.model_quotas_json`（JSON map——随鉴权行零查询）∥ 平台 = settings `quotaTokens`（运行时快照——零查询）∥ 检查 = `quota_counters` 点查（O(1)）∥ 三级全无 ⇒ 零 SQL 短路 ∥ 检查点 = 派发命中后/转发前（仅 chat） ∥ 计数 = 记账同事务（§1） ∥ 对账 = `usage reconcile` | 用户 09:28/09:30/09:31/09:34 直令 + 性能硬点；实测：点查 p50 0.004ms（目标 p95 ≤0.05ms——余量 10×+） |
| KD-SV-39 | **汇表面（报表/成员页/汇总）= 预聚合日表 `usage_daily`**（用户 09:39/09:40 批）：粒度 = 日 × 成员 × key × provider × model × endpoint；写 = 记账同事务 upsert（§1）；读 = summary/totals/key 窗/成员月累计（明细/导出/审计零动——真源）；迁移回填 + `usage reconcile` 对账；**API 契约不变**（实现替换数据源——窗沿按本地日取整） | 实测（同构探针 @500k）：30 天窗四查合计 p50 **≈11ms**——≈250×；行数 = 组合数（与明细解耦）；写增负 ≈+0.03ms/请求 |
| KD-SV-50 | **本人用量报表 = 新端点 `GET /api/me/usage/summary`**（用户 22:03 令）：契约 = §3；实现 = 复用 `usageSummary`（成员固定）+ 逐日维序两面（`trendByEndpoint` ∥ `trendByModel`——零填充逐维值 × 日）+ totals 携 prompt/completion 拆；**admin 端点/门零动**（`/api/usage/summary` 形与读面色零变） | 本人面要图表（用户 22:03）；与 admin 面同构（summary 与明细分端点——单职责 ∥ 前端两读同拍沿 admin 先例）；隔离面最小——既有端点断言零动 |

## 7. 用例（本域）

| # | 类 | 输入 | 预期输出 |
|---|---|---|---|
| B2 | 边界 | 流结束无 usage（上游忽略注入） | 照常透传；usage 行 `tokens=NULL` + `status='ok'`（记录不静默） |
| B4 | 边界 | 准入通过的单笔超长请求（产出越过额度线） | 本笔照常；**下一笔**被 429（已知边界——KD-SV-6） |
| E2 | 错误 | 超额成员请求（某模型） | 429 `quota_exceeded`（含模型外标 + 已用/额度）；他模型不受累 |
| N25 | 正常 | 注入时钟：窗界外一行 + 窗内一行 ⇒ `pruneUsage` | 界外删、窗内留；返回删除数 |
| B20 | 边界 | `usageRetentionDays: null` + `pruneUsage` | 零删（不限档） |
| B21 | 边界 | 启动（bin 接线——单元测试档断言） | 启动即清一次 + 24h 周期注册（常量） |
| N26 | 正常 | 注入行集（跨两日 ∥ 两模型 ∥ 两成员）⇒ `GET /api/usage/summary` | totals 逐值 = 明细归并；trend 按日零填充全序列；byModel/byMember 降序逐值 |
| N27 | 正常 | 同过滤 `GET /api/usage/export` | CSV：英文表头 ∥ 行数 = 过滤行数 ∥ 逗号/引号转义 ∥ ISO ts ∥ `attachment` 头 |
| B22 | 边界 | 空行集 ⇒ summary ∥ export | 空数组 + totals 0（零错）；CSV 仅表头 |
| B23 | 边界 | 行数 > `USAGE_EXPORT_MAX`（注入口径） | 400 `invalid_request_error`（收窄时段提示） |
| E21 | 错误 | `endpoint=audio`（非法值——五读端点） | 400 `invalid_request_error` |
| N28 | 正常 | 三级序：仅平台设 N ∥ 成员覆盖 N′ ∥ 都无 | 覆盖优先（N′） ⇒ 平台（N） ⇒ 不限放行（短路——零 SQL） |
| N29 | 正常 | 一次 chat 记账 + 一次嵌入记账 | 计数行逐值累加（chat 键 ∥ 嵌入键照计）；日表两键各 +1 |
| B24 | 边界 | 注入时钟跨月 ∥ 跨零点/月初终结请求（`ts` 在前日/前月、入账在后） | 新月份键零起（旧月行保留；旧键不读——月翻滚零逻辑）；终结行键随 `ts`（与回填同表达式）——对账零幻影行 |
| N30 | 正常 | `usage reconcile`：注入漂移（改一行计数） | 检出漂移行明细；`--fix` 覆写 ⇒ 复查零漂 |
| N31 | 正常 | 注入行集 ⇒ 30 天窗四查（日对齐） | 与明细日对齐归并逐值相等（summary/totals/排行）；trend 零填充全长 |
| N32 | 正常 | 注入行集（跨两日 ∥ 两模型 ∥ 两端点 ∥ 两成员）⇒ `GET /api/me/usage/summary`（成员 A 会话） | totals 四字段逐值 = A 明细归并；trend 按日零填充全长；两维序逐（维值 × 日）零填充；byModel 降序；B 的行零涉（本人固定） |
| N33 | 正常 | 同过滤参数 ⇒ `/api/me/usage/summary` ∥ `/api/me/usage` | 两读同源（同过滤器）：summary 逐值 = 明细日对齐归并（窗沿取整含端日——KD-SV-39 口径） |
| B25 | 边界 | 空行集 ⇒ `/api/me/usage/summary` | totals 全 0；trend 全零全长；trendByEndpoint/trendByModel/byModel = 空数组（零错） |
| E22 | 错误 | 无会话 ⇒ `GET /api/me/usage/summary` | 401 `unauthorized`（本人面端点判权——非 403） |
| N34 | 正常 | 注入：provider `mock` 模型 `mock-chat` 配别名 `fast`；两笔记账（请求名 = `fast`） ⇒ `/api/usage` ∥ `/api/usage/summary` ∥ `monthlyCountersByMember` ∥ `model=fast` 过滤 | 行 `model` = `fast`（别名回映射）∥ byModel 维值 = `fast` ∥ 月表键 = `fast` ∥ 过滤 `model=fast` 命中同一笔（真名对反查）；库内两字段仍 = `mock`/`mock-chat`（真名零改） |
| B26 | 边界 | 别名改后（`fast` ⇒ `quick`）读历史行（记账在 `fast` 期）∥ 过滤旧名 `fast` | 读面当即显示 `quick`（无历史/迁移）；过滤 `fast` 零命中（旧别名 = 离表键语义） |
| E23 | 错误 | 成员键写入：`{" mock/m": 1}`（首尾空白）∥ 键 = 裸名（别名形——合法） | 400（首尾空白；库零变）∥ 裸名键照收（别名形——形状面单源） |

## 8. 本域边界（不做的面）

- 归档面不做（清理 = 删除式保留窗——§1；`null` 可关）∥ 阈值告警（80% 等——需求 §4 不做）∥ 金额/计费（对外计费 = 不做项）∥ token 预估/预扣（无 tokenizer——不做）。
- **明细导出 = 在**（CSV——§3；「导出」= 当前数据集下载，非归档语义——不涉保留窗）；JSON 导出不另设（`/api/usage` 即 JSON 面）∥ **汇表面 = 预聚合日表**（覆盖索引未采——§2.4）∥ 明细面毫秒精度不变（真源）∥ **我的用量页图表 = 在**（本人过滤复用：`GET /api/me/usage/summary`；管理面专属面收窄 = 跨成员过滤/排行 ∥ CSV 导出 ∥ 管理看板页——`webui/ME.md` §2.2）；本人面导出不另设（否）∥ 小时/周粒度未设（日/月两键为限）。
- 成员面读（逐模型已用）= 与配额同窗（自然月——§2.3）；报表/key 面 = 近 30 个本地日——两窗并存为设计（配额周期 = 自然月——KD-SV-6）；成员总额（`usedTokens`）含嵌入行（现口径保持）。
- 别名面不做（KD-SV-59）：记账/计数存储 = 真名两字段零改（对外标识 = 读面回映射）；别名历史/迁移不做（改别名 ⇒ 读面当即随动、旧形键 = 离表键保留）；CLI `usage reconcile` 读数 = 内部真名（运维面——非成员对外面）。
