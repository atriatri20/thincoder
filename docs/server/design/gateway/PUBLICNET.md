# 公网化安全面 —— TLS 内置 ∥ 鉴权加固与限流 ∥ 审计告警

> 板块 = server · 域 = gateway（HTTP 入口面）· 需求 = `docs/server/requirements/PROJECT.md` §1（公网化 / TLS 内置两段）· 台账 `#1243`。
> 用户令（逐字）：2026-10-10 16:51「TLS是必须的，证书我们也有」· 16:53「不不不，没有nginx，thincoder-server要自己实现tls。」
> 运行期零第三方依赖 = 硬约束：本档全部实现只用 `node:` 内置模块。

## 1. 方案与依据

**一句话**：在同一台服务进程里，用 `node:https` 换掉 `node:http` 监听、用进程内固定窗给匿名入口限流、用新审计型 `security_event` 记生命周期与异常；配置全部落在 `config.json` 的 `tls` / `rateLimits` 两段，控制台配置卡给写面，生效 = 重启；容器探针在 `tls.enabled` 时改走 https（同一端口只讲 TLS 后，明文探针会让容器恒判不健康）。

**最近先例（对齐面）**：

| 维度 | 先例坐标 | 本档取法 |
|---|---|---|
| 配置段 + 严格校验 + fail-closed | `thincoder-server/src/ops/config.mjs:86`（`validateConfig`）· `:146`（`validateProxyConfig` 段级校验） | 照抄形：tls / rateLimits 各一个段级校验函数，非法 ⇒ 抛（拒启） |
| 配置写面（白名单 + 子键级 + 原子写 + 审计） | `thincoder-server/src/gateway/config-admin.mjs:30`（`CONFIG_WRITABLE_KEYS`）· `:102`（embedding 子键级） | 照抄形：`tls` / `rateLimits` 进白名单，子键级合并 |
| 进程内限流（定窗、可注时钟、429 + `Retry-After`） | `thincoder-server/src/gateway/ratelimit.mjs`（KD-SV-35）· `src/accounts/login-guard.mjs:33` | 算法同形（固定窗），模块另立 |
| 审计「一域一型」 | `src/accounts/audit.mjs:22`（十七型枚举）· KD-SV-91（`agent_event` 三 kind 不扩） | 新型 `security_event`，不动既有型 |
| 服务端技术选型 = 内置模块、零依赖 | `thincoder-server/README.md`（运行期依赖一条 = `electron-updater`，仅桌面） | `node:https` / `node:tls` / `node:http` / `node:fs` |

**公开源调研**：工作区内公开源文档 = `docs/README.md` 档地图 + `docs/server/design/` 二十九档；查 `TLS` / `反代` / `限流` 相关主题，命中的只有 `ops/OPS.md` §5.6（现口径「前置反代 + nginx 样例」）与 `accounts/ACCOUNTS.md` §2（登录防爆破）。**与本设计相关的只有一处：OPS §5.6 的口径被用户第 3 条令推翻，本批同时改口**（见 §8）。其余无相关先例。

**分层选择**：TLS 终止放在 **gateway 服务层**（`createGatewayServer`），不做独立入口。理由三条：

① 全服只有一处装配调用（`bin/thincoder-server.mjs:204`）；独立入口要把路由表、静态面、升级钩子整套复制一遍。

② 升级路（终端 WebSocket）挂在 `server.mjs:101`，必须继续生效——`node:https` 的 `upgrade` 事件与 `node:http` 同形；换成独立进程或 `node:http2` 都得改写这条链。

③ 二十三档 import `gateway/server.mjs`，只改函数签名内部不影响它们。

## 2. 接口契约

**配置面（`config.json` 新增两段；`tls` 缺位 = 现行为零变，`rateLimits` 缺位 = 按内建缺省生效——§4 KD-PN-9）**

```json
{ "tls": { "enabled": true, "certPath": "certs/fullchain.pem", "keyPath": "certs/privkey.pem",
           "publicHost": "tc.example.com", "publicPort": 443, "redirectPort": 8443 },
  "rateLimits": { "enabled": true, "authPerMin": 20, "publicPerMin": 120 } }
```

| 键 | 形 | 缺省 | 校验（拒启） |
|---|---|---|---|
| `tls` | 对象 ∥ 缺位 | 缺位 ⇒ `null`（明文 HTTP） | 非对象 ∥ 数组 ⇒ 拒 |
| `tls.enabled` | 布尔 | `false` | 非布尔 ⇒ 拒 |
| `tls.certPath` / `tls.keyPath` | 非空串（相对 = 配置档目录，同 `db`） | 无 | `enabled: true` 时缺/空 ⇒ 拒；启动期读文件 + `tls.createSecureContext` 失败 ⇒ 拒启 |
| `tls.publicHost` | 非空串（域名，不携端口） | 无 | `redirectPort` 在场时缺 ⇒ 拒 |
| `tls.publicPort` | 整数 1–65535 | `443` | 非整数/越界 ⇒ 拒；只被重定向的 `Location` 消费 |
| `tls.redirectPort` | 整数 1–65535 ∥ `null` | `null`（不开重定向） | 非整数/越界/等于 `port` ⇒ 拒；绑不上（`EADDRINUSE` ∥ `EACCES`）⇒ 拒启 |
| `rateLimits` | 对象 ∥ 缺位 | 缺位 ⇒ 内建缺省（§4 KD-PN-9） | 非对象 ∥ 数组 ⇒ 拒 |
| `rateLimits.enabled` | 布尔 | `true` | 非布尔 ⇒ 拒 |
| `rateLimits.authPerMin` | 整数 1–10000 | `20` | 越界 ⇒ 拒 |
| `rateLimits.publicPerMin` | 整数 1–10000 | `120` | 越界 ⇒ 拒 |

写面预检（`PATCH` 时、落盘前）：`tls` 在场且 `enabled: true` ⇒ 校验 `certPath` / `keyPath` 可读且能建出上下文；不过 ⇒ 400 原报文 + 文件字节零变（机制与理由 = §9「写面防自锁」）。


阈值取法：登录维阈值 = 20 次/分/IP，与 `login-guard` 的 IP 维（20 次失败/15 分钟，`login-guard.mjs:11`）同量级但不叠加锁——限流挡脚本级连打，锁挡猜密码；团队 NAT 共用出口 IP，阈值贴地即误伤。

**入口签名（`src/gateway/server.mjs`）**

```js
createGatewayServer({ config, routes, log, staticSite, upgrade, tls = null, limits = null })
// tls = null ⇒ node:http（现行为零变）
// tls = { key, cert }（已读入内存的内容）⇒ node:https.createServer({ key, cert }, handler)
// limits = createIpLimiter(...) 产物 ∥ null ⇒ 不限
```

**限流器（新档 `src/gateway/limits.mjs`）**

```js
createIpLimiter({ rules, now = Date.now, onBurst = () => {} })   // rules = [{ class, perMin, methods, paths }]
limiter.check(method, pathname, ip)            // ⇒ { limited: false } ∥ { limited: true, retryAfterS, ruleClass }
limiter.noteBurst(payload)                     // 由判点在超限分支调用：同 IP 同窗只回调一次 onBurst
```

- **判点顺序（限流器之外、路由之前）**：`clientIp(req, { trustProxy })` 取 IP → `check` → `limited` ⇒ `noteBurst({ ip, ruleClass, retryAfterS })`（触发 `onBurst`——同窗一次）→ 回 429 `rate_limited` + `Retry-After`；未超限 ⇒ 放行。
- **IP 取法 = 与 `trustProxy` 同源的既有助手** `clientIp(req, { trustProxy })`（`src/accounts/login-guard.mjs:17`，调用形同 `src/accounts/routes.mjs:79`）——限流不另立 IP 解析。
- `onBurst` 由入口装配注入（`bin/thincoder-server.mjs`），回调体 = 记 `security_event`/`rate_limit_burst` 一行；缺省空函数 ⇒ 限流器本体可单独测。
- 算法 = **固定窗（60 s）计数**，Map<`class|ip`> → `{ count, windowStart }`，读写路径惰性清扫；与 `gateway/ratelimit.mjs` ∥ `login-guard.mjs` 同形（不引入令牌桶——第二套机制没有净收益，边界 2× 突发在案接受）。
- 类别：`auth` = `POST /api/accounts/login` ∥ `POST /api/client/login`；`public` = 公开接收面（验签前可达的写端点，清单以 `src/project/webhooks.mjs` 注册行为准，落 `limits.mjs` 常量表）。`/healthz` 与静态面不限（探活/资源面）。
- 超限 ⇒ 复用既有错误形 `rate_limited`（429 + `type: rate_limit_error`，`src/gateway/errors.mjs:20`）+ `Retry-After` 整数秒——**零新错误码**。
- `/v1/*` 不进本限流器：既有 per-model RPM/TPM + 配额（KD-SV-35 / KD-SV-38）已覆盖，且需 Bearer 鉴权。

**重定向监听（入口装配，`bin/thincoder-server.mjs`）**

- 仅当 `tls.enabled && tls.redirectPort !== null` 时起第二个 `node:http` 服务器：任何请求 ⇒ **308** + `Location: https://<publicHost>[:<publicPort>]/<原 path+query>`（`publicPort` = `tls.publicPort`，等于 443 时省略）；请求体 `req.resume()` 丢弃，不挂路由表。
- 绑定地址 = `config.host`（与 TLS 面同接口），端口 = `tls.redirectPort`；绑不上（`EADDRINUSE` ∥ `EACCES`）⇒ **拒启**（非零退出 + `startup_failed`），与证书失败同口径——半个重定向面比没有更坏。
- 对外端口 ≠ 内部端口（容器 `"443:8787"` 一类映射）时，`Location` 的端口位必须取 `tls.publicPort` 而非 `config.port`：取内部端口会把 `:8787` 泄给公网访客。
- 示例取 `redirectPort: 8443`：容器跑 `USER node`（非 root，见运维设计档 §5.1），1024 以下端口绑不上；要绑 80 须加 `CAP_NET_BIND_SERVICE` 或调 `net.ipv4.ip_unprivileged_port_start`，本批不做。
- 用 308 不用 301：301 允许客户端把 POST 改写成 GET（浏览器历史行为），webui 登录表单与 API 直连都需要方法保形。
- `Location` 的主机位取 `tls.publicHost`，**不读 `Host` 头**——读头会开出站外重定向面。

**证书轮换（`SIGHUP`）**

- TLS 起时入口注册 `process.on("SIGHUP", …)`：重读证书与私钥 → `server.setSecureContext({ key, cert })`。成功 ⇒ 日志 `cert_reloaded` + 审计 `security_event`/`cert_reload`；失败 ⇒ 日志 `cert_reload_failed` + 审计 `security_event`/`cert_reload_failed`（`detail.reason`），**旧上下文继续服务**（不中断）。
- 不做文件监听：证书文件正在被覆盖时读到半写内容会换进坏上下文；`SIGHUP` 让「放好文件再通知」成为一步。Windows 无 `SIGHUP`，部署目标 = 阿里云 ECS Linux，明文记录。

**审计面（`src/accounts/audit.mjs` 十七型 → 十八型）**

- 新型 `security_event`，四 kind（文案键三个——两个证书 kind 共一键）：
  - `tls_start` —— 以 TLS 起服（`detail = { port, redirectPort }`）；
  - `cert_reload` ∥ `cert_reload_failed` —— 轮换结果（失败携 `reason`）；
  - `rate_limit_burst` —— 同 IP 同窗触限聚合一行（`detail = { ip, ruleClass, count, windowMs, retryAfterS }`）。
- kind → 文案键（四个值、三个键）：

| kind | 文案键 |
|---|---|
| `tls_start` | `audit.securityTls` |
| `cert_reload` | `audit.securityCert` |
| `cert_reload_failed` | `audit.securityCert` |
| `rate_limit_burst` | `audit.securityBurst` |
- actor = `"server"`（非人类行为人名快照——与 `scheduler` ∥ `webhook` 先例同法，`audit.mjs:6`），`actorId = null`。
- 扩型论证（KD-SV-91 要求）：现有十七型全是「域动作 + 已认证 actor」；TLS 生命周期与限流告警没有 actor，塞进任一既有型会污染该域计数（审计页按型过滤）。逐域自持型已有先例（`project_event` / `ledger_event` / `mcp_event`），故新立一型而非扩既有型的 kind。
- 逐请求的匿名访问**不落审计行**：既有逐请求日志行（`gateway/server.mjs:65` `request`）承载访问审计，审计表只记「生命周期 + 异常」。理由：匿名请求无 actor 快照可记，量级又远超审计保留窗（90 天）的设计意图。
- 迁移：`src/store/migrations.mjs` 新增 **v26**，重建 `audit_events` CHECK（十八型：+ `security_event`），步序与 v20 / v23 / v24 同构（建新表 → 搬行 → 删旧 → 改名 → 建两索引）。零回填。

**会话 cookie 加固（`src/accounts/session.mjs`）**

- 序列化加条件 `Secure`：请求经 TLS（`req.socket.encrypted === true`）⇒ 附 `Secure`；明文内网/测试不加（浏览器会丢弃明文下的 `Secure` cookie）。前置可信代理终止 TLS（`trustProxy: true`）时后端是明文 ⇒ 判据为假、不附 `Secure`——这条部署形要附须显式开关，本批不做（§7 边界）。
- 形：`tc_session=<t>; Path=/; HttpOnly; SameSite=Strict; Max-Age=604800[; Secure]`。两处调用（`src/accounts/routes.mjs` ∥ `src/client/routes.mjs`）统一走 `sessionCookie(token, { secure })`，判据助手 `isSecureRequest(req)` 与序列化同档。

## 3. 受影响文件（行数 = 本档写就时实读）

| 文件 | 现况 | 预期增量 |
|---|---|---|
| `thincoder-server/src/gateway/server.mjs` | 274 行 | `+tls` 分支（`node:https` 建服）+ `limits` 判点，≤+25 行；仍 < 500 |
| `thincoder-server/src/gateway/limits.mjs` | 新建 | ≈120 行 |
| `thincoder-server/src/ops/config.mjs` | 360 行 | `validateTlsConfig` + `validateRateLimits` + 归一出参，≤+75 行；< 500 |
| `thincoder-server/src/gateway/config-admin.mjs` | 182 行 | 白名单两组 + 子键级合并 + GET 回显，≤+30 行 |
| `thincoder-server/bin/thincoder-server.mjs` | 241 行 | 读证书 / 建 tls 参数 / 重定向监听（含绑定失败拒启）/ `SIGHUP` / 停机并关 / 注入 `onBurst`，≤+50 行；< 500 |
| `thincoder-server/src/accounts/audit.mjs` | 133 行 | 枚举加一项 + 注释，≤+5 行 |
| `thincoder-server/src/accounts/session.mjs` | 96 行 | `secure` 选项 + `isSecureRequest`，≤+15 行 |
| `thincoder-server/src/accounts/routes.mjs` | 161 行 | 一处调用改携 `secure` + 限流判点，≤+4 行 |
| `thincoder-server/src/client/routes.mjs` | 90 行 | 同上，≤+3 行 |
| `thincoder-server/src/store/migrations.mjs` | 799 行 | **先拆后改**：拆后 = 注册表 + `migrate` ∥ `readVersion`，≈70 行；v26 段加在拆后第三档，≈+45 行 |
| `thincoder-server/src/store/migrations/ddl-v1-v11.mjs` | 新建 | ≈300 行（`DDL_V1`–`DDL_V11` 逐字迁入） |
| `thincoder-server/src/store/migrations/ddl-v12-v20.mjs` | 新建 | ≈305 行（`DDL_V12`–`DDL_V20` 逐字迁入） |
| `thincoder-server/src/store/migrations/ddl-v21-v26.mjs` | 新建 | ≈190 行（`DDL_V21`–`DDL_V25` 逐字迁入 + 新增 `DDL_V26`） |
| `thincoder-server/public/views-system-config.mjs` | 166 行 | TLS 段 + 限流段，≤+65 行 |
| `thincoder-server/public/views-audit.mjs` | 272 行 | `security_event` 行模板，≤+20 行 |
| `thincoder-server/public/i18n-zh-system.mjs` | 222 行 | 新增文案键，≤+12 行 |
| `thincoder-server/public/i18n-en-system.mjs` | 222 行 | 同上（两表同步），≤+12 行 |
| `thincoder-server/README.md` | 259 行 | §11 整段改写（删 nginx 样例），≤−20 行 |
| `thincoder-server/Dockerfile` | 41 行（实读 2026-10-19） | `HEALTHCHECK` 探针换 §5.9 新形（TLS 分支 + `statusCode` 判定），≤+3 行 |
| `thincoder-server/docker-compose.yml` | 22 行（实读 2026-10-19） | 端口加 `"8443:8443"` + 证书卷 `./certs:/app/certs:ro`，≤+3 行 |
| `docs/server/design/ops/OPS.md` | 419 行（`wc -l` 实读 2026-10-19） | §5.6 ∥ §5.7 ∥ §5.9 ∥ §1 ∥ §4.1 ∥ §6 ∥ §7 随动（逐行见 §8） |
| `docs/README.md` | — | server 设计 29 → 30 档，gateway 1 → 2 档 |

**拆分计划（`migrations.mjs` 越 800 硬顶——先于 v26 落地）**：

- 触发事实：现档 799 行（实读 `wc -l` 口径）；本档头注自己定的拆案线是 700 行，v25 之后已越线；v26（≈+45）会把 799 推到 ≈844，越过 800 行硬顶，而硬顶没有豁免通道。
- 拆点 = 按版本区间抽 DDL 常量、注册表留原档：`ddl-v1-v11.mjs`（11 段）∥ `ddl-v12-v20.mjs`（9 段）∥ `ddl-v21-v26.mjs`（6 段，含新增 v26）。逐字搬迁、零语义改动，每段仍是 `export const DDL_Vn`。
- 拆后 `migrations.mjs` = 三档 import + `MIGRATIONS` 数组 + `SCHEMA_VERSION` ∥ `migrate` ∥ `readVersion` ≈70 行；对外导出面逐字不变（`db.mjs` 与调用方零改）。
- 拆后行数：`ddl-v1-v11` ≈300 ∥ `ddl-v12-v20` ≈305 ∥ `ddl-v21-v26` ≈190 ∥ `migrations.mjs` ≈70——四档均 < 500，余量留给后续版本段。
- 迁移链「只进不退」不受影响：拆的是常量的存放位置，`MIGRATIONS` 的顺序与内容不变；结构单源仍是 `store/STORE.md` §2，本次不动任何 DDL 语义。

测试面：新增单元测试档 `thincoder-server/test/publicnet.test.mjs`（本批自持、收口删除），估算 ≈260 行（实际值收口轮记 §5），覆盖 §6 用例 N1–N7 ∥ B1–B7 ∥ E1–E11；另有常驻装配断言 A7（运维设计档 §4.1）：`redirectPort` 在场 ⇒ 装配后第二个 server 在册且停机被关、`SIGHUP` 监听断基线增量 = 1（用例 `finally` 复原）——实施轮按反证义务逐条「删装配行 ⇒ 该档必红 ⇒ 恢复」记读数。集成面（浏览器实走 HTTPS 登录 + 限流 429）归收口轮。

## 4. 关键决策记录

| # | 决策 | 理由 | 否掉的路 |
|---|---|---|---|
| KD-PN-1 | TLS 终止在 `createGatewayServer` 内（换 `node:https`） | 装配只有一处；升级路与静态面原样复用；23 个 import 面零改 | 独立入口进程（复制装配 + 双份路由表）；`node:http2`（`upgrade` 语义与现终端链路不同形） |
| KD-PN-2 | 证书启动期读入内存，轮换走 `SIGHUP` | 部署一步（scp + kill -HUP），零新增依赖；坏证书不换上下文 | 文件监听（半写文件读进坏上下文）；只支持重启（轮换每次停机） |
| KD-PN-3 | HTTP→HTTPS 用 308 + `Location` 主机取配置 `publicHost` | 方法保形；不读 `Host` 头 = 零站外重定向面 | 301（POST 变 GET）；读 `Host` 头（开重定向面） |
| KD-PN-4 | 限流算法 = 固定窗 60 s，粒度 = IP × 端点类 | 与既有两处限流同形（少一套机制）；IP 维是匿名请求唯一稳定标识 | 令牌桶（新机制，无净收益）；会话维（匿名面没有会话）；滑窗队列（每 IP 记时间戳队列，内存随请求量涨） |
| KD-PN-5 | 审计新立 `security_event` 型，不动既有型 | 无 actor 的生命周期/异常事实；每域自持型已有先例 | 塞进 `config_update` / `login_locked`（污染该域计数）；只写日志不落审计（审计页看不到） |
| KD-PN-6 | 逐请求访问审计 = 日志面，不落审计表 | 匿名请求无 actor；审计表 90 天保留窗容不下请求量级 | 每请求一行审计（噪声 + 表膨胀） |
| KD-PN-7 | 限流阈值进配置（可界面调），告警聚合窗/倍数走常量 | 阈值随部署规模变；聚合口径属机制 | 全进配置（配置项爆炸，每项都要界面）；全走常量（团队规模变了要发版） |
| KD-PN-8 | 重定向监听绑 `config.host`、绑不上即拒启；`Location` 端口取 `tls.publicPort`（缺省 443） | 半个重定向面（起了 TLS 没起重定向）比没有更坏；容器映射下内部端口 ≠ 对外端口，取 `config.port` 会把 `:8787` 泄给公网 | 绑不上只 warn（访客静默失败）；`Location` 读 `Host` 头补端口（开重定向面） |
| KD-PN-9 | `rateLimits` 缺位 = 缺省开（`enabled: true` ∥ `authPerMin: 20` ∥ `publicPerMin: 120`）；「缺位 = 现行为零变」只承诺 `tls` 段 | 公网化口径下匿名入口不限流 = 登录面裸奔；缺省开是有意选择，缺位部升级后登录端点立即受阈 | 缺位 = 关（升级零变，但新部署默认裸奔，要靠人记得开）；只给 `enabled` 缺省、阈值必填 |
| KD-PN-10 | `tls.enabled` 时容器探针走 `node:https`（`rejectUnauthorized: false`——只探活不验身份） | 同一端口只讲 TLS ⇒ 明文探针恒失败、容器恒 `unhealthy`；探针只判「进程活着、能应答」，身份校验在客户端面 | 探针另开明文例外口（多一个对外面，与「同端口只讲 TLS」相抵）；探针不读配置写死 `127.0.0.1`（#1426 已否） |
| KD-PN-11 | 前置可信代理终止 TLS 的部署形下，会话 cookie 不附 `Secure`（判据 = 连接是否为 TLS） | 判据只看连接，后端明文就是明文；「可信代理即视为 secure」是另一个开关，本批不做且不假装做了 | 只看 `X-Forwarded-Proto`（客户端可伪造，除非代理确实覆盖该头——面更宽）；恒附 `Secure`（明文内网下浏览器丢 cookie，登录即坏） |

## 5. 验收对照（回指本批条目）

| AC | 回指 | 判据（可机检） |
|---|---|---|
| AC-PN-1 | ① TLS 内置 | `tls` 缺位 ⇒ `createGatewayServer` 产出 `node:http` 实例；配置对象与现行为逐键相等 |
| AC-PN-2 | ① | `tls.enabled: true` + 自签材料 ⇒ `https.request({ rejectUnauthorized: false })` 得 200；同一端口明文请求失败 |
| AC-PN-3 | ① | 证书路径缺/非 PEM ⇒ 进程非零退出 + `startup_failed` 日志一行（fail-closed） |
| AC-PN-4 | ① | `redirectPort` 在场 ⇒ 对该端口 `POST /x?y=1` 得 308；前置 `tls.publicPort = 443` 时 `Location` = `https://<publicHost>/x?y=1`，前置 `publicPort = 8443` 时 = `https://<publicHost>:8443/x?y=1`；方法未变 |
| AC-PN-5 | ① | `SIGHUP` 换证书后新连接出示新证书；换入坏证书 ⇒ 旧上下文继续服务 + `cert_reload_failed` 审计一行 |
| AC-PN-6 | ② 鉴权加固与限流 | 登录端点同 IP 第 `authPerMin+1` 次 ⇒ 429 `rate_limit_error` + `Retry-After` 为整数秒；下一窗恢复 |
| AC-PN-7 | ② | TLS 请求签发的会话 cookie 含 `Secure`，明文请求不含（同档两断言） |
| AC-PN-8 | ③ 审计/告警 | v26 迁移后 `audit_events` CHECK 接受 `security_event`、拒未知型；存量十七型行数零变 |
| AC-PN-9 | ③ | 同 IP 同窗触限 ⇒ `security_event`/`rate_limit_burst` 恰一行（聚合，不随请求数线性涨） |
| AC-PN-10 | 配置写面 | `PATCH /api/admin/config { "tls": { "enabled": true } }` ⇒ 200 + 文件落盘 + `config_update` 审计 `keys` 含 `tls.enabled`；非法值 ⇒ 400 且文件字节零变 |
| AC-PN-11 | 配置写面 | 控制台「系统 → 配置」卡出现 TLS 段（启用/证书路径/私钥路径/公网主机/重定向端口）与限流段（启用/两阈值），保存后提示「重启服务后生效」 |
| AC-PN-12 | 零第三方依赖 | `thincoder-server/package.json` 依赖面零变；新增 import 全为 `node:` 前缀（`grep -E "^import .* from \"[^n]"` 零新命中） |
| AC-PN-13 | 既有口径改口 | 配置块 ∥ 样例 ∥ 口径句零命中（D8：删除不留痕）：`grep -n "nginx"` 在 `thincoder-server/README.md` 零命中、在 `docs/server/design/ops/OPS.md` 只命中用户令逐字引述行（决策表 KD-SV-25 行）；`grep -n "前置反代"` 两档零命中 |
| AC-PN-14 | 配置写面防自锁 | `PATCH /api/admin/config { "tls": { "enabled": true, "certPath": "<不存在>" } }` ⇒ 400 原报文 + 文件字节零变（预检在落盘前） |
| AC-PN-15 | ① TLS 内置（部署面） | 探针判定 = `statusCode === 200`（两支共用）：本地一跑 200 ⇒ 退 0、503 ⇒ 退 1；`tls.enabled` 部署 ⇒ 容器 `HEALTHCHECK` 走 https：`docker compose ps` 显示 `(healthy)`；反证 = 探针改回 `http://` 打同一端口 ⇒ `unhealthy` |
| AC-PN-16 | ② 鉴权加固与限流（`public` 类） | 公开端点同 IP 第 `publicPerMin+1` 次 ⇒ 429 `rate_limit_error` + `Retry-After` 整数秒；下一窗恢复；`/healthz` 与静态面在同一窗内高频请求恒不 429 |
| AC-PN-17 | 配置面缺省 | 配置档无 `rateLimits` 段 ⇒ 载入归一出 `{ enabled: true, authPerMin: 20, publicPerMin: 120 }`；登录端点同 IP 第 21 次 ⇒ 429（缺省开生效） |

## 6. 用例表

| # | 类 | 输入 | 预期 |
|---|---|---|---|
| N1 | 正常 | `tls` 缺位启动，`GET /healthz` | 200；实例为 `http.Server`，日志无 TLS 行 |
| N2 | 正常 | `tls.enabled` + 自签，`GET /healthz`（https） | 200；`security_event`/`tls_start` 一行 |
| N3 | 正常 | `SIGHUP`，证书文件已换 | 新连接出示新证书；`security_event`/`cert_reload` 一行 |
| N4 | 正常 | 登录端点限流窗内第 3 次（阈值 20） | 正常 200/401，不触限 |
| N5 | 正常 | 会话登录（https） | `Set-Cookie` 含 `Secure; HttpOnly; SameSite=Strict` |
| B1 | 边界 | 限流窗内恰好第 `authPerMin` 次 | 放行；第 `authPerMin+1` 次 429 |
| B2 | 边界 | 两窗交界（上一窗计数满、下一窗首请求） | 放行（固定窗重置）；在案接受 2× 突发 |
| B3 | 边界 | `redirectPort` = null（不配） | 无第二个监听；明文端口不响应 |
| B4 | 边界 | `port` = 443 时重定向 | `Location` 不带端口号 |
| B5 | 边界 | `/healthz` 高频请求（探活 1 s 一次） | 从不 429 |
| E1 | 错误 | `tls.enabled: true` + `keyPath` 指向不存在文件 | 拒启、非零退出、`startup_failed`，不监听 |
| E2 | 错误 | 私钥与证书不配对 | 拒启（`createSecureContext` 抛） |
| E3 | 错误 | `SIGHUP` 时证书文件半写 | 旧上下文继续服务；`cert_reload_failed` 审计一行 |
| E4 | 错误 | `tls.redirectPort` = `port` | 配置校验拒启 |
| E5 | 错误 | `PATCH /api/admin/config { "tls": { "certPath": "" } }` | 400 原报文；文件零变；无 `config_update` 审计 |
| E6 | 错误 | 触限后继续连打 | 全部 429，`Retry-After` 递减；审计仍只一行（同窗聚合） |
| E7 | 错误 | 未知审计型写入 | 抛（枚举校验 `audit.mjs:52`）+ 库 CHECK 拒绝 |
| N6 | 正常 | `tls.enabled` 部署，容器 `HEALTHCHECK` 按 §5.9 命令探活；探针命令另本地直跑（假 200 ∥ 假 503 服务） | 200；`docker compose ps` = `(healthy)`；探针 200 ⇒ 退 0 ∥ 503 ⇒ 退 1 |
| N7 | 正常 | 无 `rateLimits` 段的配置档，登录端点同 IP 第 1–20 次 | 全部放行（缺省阈 20） |
| B6 | 边界 | `public` 类公开端点同 IP 第 `publicPerMin` 次 ∥ 第 `publicPerMin+1` 次 | 前者放行；后者 429；下一窗首请求放行 |
| B7 | 边界 | `tls.publicPort = 8443`，向 `redirectPort` 发 `GET /x?y=1` | `Location` = `https://<publicHost>:8443/x?y=1` |
| E8 | 错误 | `tls.redirectPort` 被占用（`EADDRINUSE`）∥ 无权限（`EACCES`） | 拒启、非零退出、`startup_failed`；不半起（TLS 面也不监听） |
| E9 | 错误 | `rateLimits` 为数组 ∥ 数字 ∥ 字符串 | 拒启（fail-closed） |
| E10 | 错误 | `tls.publicPort` 越界（0 ∥ 70000 ∥ 非整数） | 拒启（fail-closed） |
| E11 | 错误 | 无 `rateLimits` 段 + 登录端点第 21 次 | 429（缺省阈生效——与 N7 同档的另一半） |

## 7. 边界（不做）

- 不做 HTTP/3 ∥ `node:http2` ∥ ALPN 协商面（HTTP/1.1 over TLS 即满足）。
- 不做 ACME/自动签证（证书用户自备）；不做证书内容入库/上传面（只存路径）。
- 不做 mTLS/客户端证书校验（成员鉴权走会话/Bearer）。
- 不做按用户/按 key 的全局限流（既有 per-model RPM/TPM + 配额已覆盖 `/v1/*`）。
- 不做限流状态持久化（进程内存，重启归零——与既有两处同口径）。
- 不做告警外发（邮件/webhook/短信）；告警面 = 日志 + 审计行 + 审计页。
- 不做多实例/负载均衡下的共享限流与共享会话。
- 不改控制台既有交互（只加两段写面 + 审计页一个行模板）。
- 不在 `tls.enabled` 之外开第二个明文监听：探针不另开例外口，重定向口只发 308。
- 前置可信代理终止 TLS（`trustProxy: true`）的部署形下会话 cookie 不附 `Secure`；「可信代理即视为 secure」的开关不做（KD-PN-11）。

## 8. 既有口径改口（D8：删除，不留「曾用 nginx」）

> 行号读数日 = 2026-10-19（`OPS.md` 本轮改后实读）。

| 落点 | 改后状态 | 责任面 |
|---|---|---|
| `docs/server/design/ops/OPS.md` §5.6（现 `272` 行起） | 已改写为「TLS 内置与证书轮换」：配置六键 ∥ `SIGHUP` 轮换 ∥ 308 重定向 ∥ `trustProxy` 只在可信代理前置时开 | 设计轮（本轮已落） |
| `docs/server/design/ops/OPS.md` §1 配置表（`33` 行 `trustProxy` ∥ 新增 `36` / `37` 行 `tls` / `rateLimits`） | 已改 / 已增 | 设计轮（本轮已落） |
| `docs/server/design/ops/OPS.md` 边界（`412` / `415` 行） | 已删「TLS 终结（前置反代）」，改为「证书签发/ACME 自动续期不做」 | 设计轮（本轮已落） |
| `docs/server/design/ops/OPS.md` KD-SV-25（`:374`）∥ AC-13（`:356`） | 判据已改为「README §11 = TLS 内置完整段（配置 + 轮换 + 重定向）」 | 设计轮（本轮已落） |
| `docs/README.md` 档地图（`17` 行） | 已改：server 设计 30 档、gateway 2 档、部分档 194 | 设计轮（本轮已落） |
| `thincoder-server/README.md` §11（现 `215`–`243` 面） | 待改：整段重写为「TLS 内置（`tls` 段 + 证书轮换 + 重定向）」，nginx 配置块整段删除 | 实施轮（产品文档面 = eng-coder） |
| `thincoder-server/README.md` `255` 行 ∥ `46` 行 | 待改：`255` 行删「TLS 终结（前置反代）」；`46` 行改「前置于可信反代时才开；直连/内置 TLS 部署保持 false」 | 实施轮（同上） |
| `docs/server/design/ops/OPS.md` §5.9（探针命令） | 已改：`tls.enabled` ⇒ `node:https`（`rejectUnauthorized: false`，只探活）；判定 = `statusCode === 200`（两支共用同一判定函数；`r` 是 `IncomingMessage`，无 fetch `Response.ok`）——明文支语义不变，形随 TLS 分支合一 | 设计轮（本轮已落） |
| `docs/server/design/ops/OPS.md` §5.7（Docker 路） | 已增 TLS 追加段：证书目录挂卷 `./certs:/app/certs:ro` ∥ `tls` 六键 ∥ 端口映射 `"8787:8787"` + `"8443:8443"` ∥ `ps` 见 healthy | 设计轮（本轮已落） |
| `docs/server/design/ops/OPS.md` §5.1 compose 样例 | 已改：`ports` 加 `"8443:8443"`，`volumes` 加 `./certs:/app/certs:ro` | 设计轮（本轮已落） |
| `docs/server/design/ops/OPS.md` §1 配置写面可写项 ∥ 启动校验清单 ∥ `host` 行 ∥ §7 非功能行 | 已改：两段进白名单与校验清单；口径改「默认内网部署；公网部署须开 `tls`」 | 设计轮（本轮已落） |
| `docs/server/design/ops/OPS.md` §6 行数预算 | 已改：`bin` 241 ∥ `config.mjs` 360 ∥ `README.md` 259（实读 `wc -l` 口径，与本档 §3 同源） | 设计轮（本轮已落） |
| `docs/server/design/ops/OPS.md` §4.1 | 已增：A7 不变量 + `onAssembled` 增 `redirectServer` | 设计轮（本轮已落） |
| `docs/server/design/accounts/ACCOUNTS.md` §2.1 审计型表 | 待改：十七型 → 十八型（+ `security_event`），列形随动；本档未读该档（`unverified`），改时以本档 §2 审计面为准 | 实施轮 |
| `thincoder-server/Dockerfile`（`HEALTHCHECK`） | 待改：探针命令换 §5.9 新形（TLS 分支） | 实施轮（产品代码面） |
| `thincoder-server/docker-compose.yml` | 待改：端口两行 + 证书卷 | 实施轮（产品代码面） |

## 9. 控制台与交互落点（UI 决策已落）

**界面落点两处，不动既有交互**：

① 系统 → 配置卡：新增「TLS」段（启用勾选 ∥ 证书路径 ∥ 私钥路径 ∥ 公网主机 ∥ 重定向端口，空 = 不开）与「限流」段（启用勾选 ∥ 登录阈值 ∥ 公开阈值）；保存 = 同一 `PATCH /api/admin/config`，整卡提交；保存后提示「已保存——重启服务后生效」（沿现行 flash 文案）。

② 审计页：`security_event` 进型筛选枚举，行模板 = `kind · ip/端口 · 成败 · 〔详情〕`；三文案键（`audit.securityTls` ∥ `audit.securityCert` ∥ `audit.securityBurst`），两语言表同步。

**写面防自锁（本档新增决策）**：`tls.enabled` 保存时做一次文件预检（`certPath`/`keyPath` 可读 + 与 `enabled: true` 配套时 `createSecureContext` 可建）——不过 ⇒ 400 原报文 + 文件零变。理由：配置写错了重启后服务起不来，而控制台正好跑在起不来的服务上，人就只能上机改文件。预检把这一步挡在保存前。

**用户视角走查（每天用这个界面的人）**：
- 证书路径与私钥路径在同一段、同一卡，填完一次保存——不需要在两页之间来回。
- 重定向端口留空即不开，不会因为忘填而拒绝保存（只有填了才校验 `publicHost`）。
- 启用 TLS 之后第一次重启前，README §11 要求先前台跑一次（`node bin/thincoder-server.mjs --config <档>`）看启动行——配错时错误直接打在终端，而不是变成「控制台连不上」。
- 审计页筛选里能直接选到「安全事件」，不必翻全部类型找一行。
