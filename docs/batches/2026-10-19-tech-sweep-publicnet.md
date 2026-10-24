# 2026-10-19 · tech-sweep-publicnet
> 六段 append-only，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 编制：主 agent · 2026-10-19 · 来源 = 用户令 2026-10-19 08:38「继续，还有没派的吗？接着派」——批 M1 = 公网化安全面三件（`#1243`）。用户 2026-10-10 16:53 逐字「没有nginx，thincoder-server要自己实现tls」已把 TLS 归一为代码实工。。
> 台账 = #1243（server · 归批）。前情 = docs/batches/2026-10-19-tech-todo-sweep.md（在途）。
## §1 讨论（主 agent）
**状态行**：已收口 2026-10-19
<§1 模板占位：本批条目 / 关键判据 / 授权口径>
## §2 批次任务与设计（eng-designer）
**状态行**：（eng-designer 写入时更新）
<§2 模板占位：本批条目（覆盖） / 设计档落点 / 机制设计 / 受影响文件与测试覆盖 / 验收对照 / 关键决策 / 上抛项>

**状态行**：✅ 设计完成（2026-10-19）

### 本批条目（覆盖）

| # | 条目 | 来源 | 判据 |
|---|---|---|---|
| 1 | TLS 内置（`node:https` + 证书；零第三方运行期依赖；配置键 + 控制台写面，重启生效） | 用户令 2026-10-10 16:53「没有nginx，thincoder-server要自己实现tls」· 台账 #1243 | AC-PN-1…5、AC-PN-10…13 |
| 2 | 鉴权加固与限流（登录防爆破加固 ∥ 会话 cookie `Secure` ∥ 匿名入口按 IP 限流） | 需求 §1（威胁模型按公网计）· #1243 | AC-PN-6 ∥ AC-PN-7 |
| 3 | 审计 / 告警（`security_event` 新型四 kind：`tls_start` ∥ `cert_reload` ∥ `cert_reload_failed` ∥ `rate_limit_burst`；迁移 v26） | 需求 §1 · KD-SV-91 先例 | AC-PN-8 ∥ AC-PN-9 |
| 4 | 既有口径改口（README §11 nginx 样例 ∥ OPS §5.6 ∥ 档地图计数） | 需求 §1 第 15 行 · D8 | AC-PN-13 |

**不在本批**：证书签发/ACME ∥ mTLS ∥ http2/http3 ∥ 告警外发 ∥ 多实例共享限流 ∥ 控制台既有交互改动 ∥ `team_ledger` / `memory` 面。

### 设计档落点

`docs/server/design/gateway/PUBLICNET.md`（新建；gateway 域第二档）。改口落点见该档 §8。

### 机制设计（摘要）

- **TLS 终止层** = `createGatewayServer`（`thincoder-server/src/gateway/server.mjs:54`）内分支：`tls` 缺位 ⇒ `node:http`（现行为零变）；在场 ⇒ `node:https.createServer`。证书启动期读入 + `tls.createSecureContext` 校验，失败拒启。终端 WebSocket 升级路（`:101`）原样复用。
- **HTTP→HTTPS** = 可选第二监听（`tls.redirectPort`），**308** + `Location` 主机取配置 `tls.publicHost`（不读 `Host` 头）。301 否掉（POST 会被改写成 GET）。
- **证书轮换** = `SIGHUP` ⇒ 重读 + `server.setSecureContext`；失败保留旧上下文并落审计。
- **限流** = 新档 `src/gateway/limits.mjs`：固定窗 60 s，粒度 = IP × 端点类（`auth` ∥ `public`）；429 复用既有 `rate_limited` + `Retry-After`（零新错误码）。算法选固定窗的理由 = 与既有 `ratelimit.mjs` ∥ `login-guard.mjs` 同形，不引第二套机制。
- **会话加固** = `tc_session` cookie 在 TLS 请求上加 `Secure`（判据 `req.socket.encrypted === true`）。
- **审计** = 新型 `security_event`（十七型 → 十八型，actor = `"server"`），迁移 **v26** 重建 CHECK；逐请求访问审计仍走日志面（匿名无 actor，量级不适合审计表）。

### 配置项 × 控制台写面

| 配置键 | 控制台入口 | 生效 |
|---|---|---|
| `tls.enabled` | 系统 → 配置卡 → TLS 段（勾选） | 重启 |
| `tls.certPath` | 同上（文本） | 重启 |
| `tls.keyPath` | 同上（文本） | 重启 |
| `tls.publicHost` | 同上（文本） | 重启 |
| `tls.redirectPort` | 同上（数字，空 = 不开） | 重启 |
| `rateLimits.enabled` | 同上 → 限流段（勾选） | 重启 |
| `rateLimits.authPerMin` | 同上（数字） | 重启 |
| `rateLimits.publicPerMin` | 同上（数字） | 重启 |

写面 = `PATCH /api/admin/config` 白名单增 `tls` / `rateLimits`（子键级，沿 embedding 先例 `config-admin.mjs:102`）；GET 只回路径，证书内容永不出响应。

### 受影响文件与测试覆盖

见设计档 §3（15 个文件，逐档行数 + 增量）。测试 = 本批自持单元测试档（收口删除）覆盖 §6 用例 N1–N5 ∥ B1–B5 ∥ E1–E7；集成面（浏览器 HTTPS 登录 + 429 实走）归收口轮。

### 验收对照

AC-PN-1…13 逐条回指本批四条（设计档 §5）。关键读数：`tls` 缺位时实例仍为 `node:http`；启用后 https 200 / 同端口明文失败；第 `authPerMin+1` 次 429 且审计恰一行；`package.json` 依赖面零变 + 新增 import 全 `node:` 前缀。

### 关键决策

KD-PN-1…7（设计档 §4）：TLS 在 gateway 层（非独立入口）· `SIGHUP` 轮换 · 308 + 配置主机名 · 固定窗 IP 限流 · 新审计型 `security_event` · 访问审计走日志 · 阈值进配置/聚合口径走常量。

### 零第三方依赖证明

新增 import 面：`node:https` · `node:tls`（`createSecureContext`）· `node:http`（重定向监听）· `node:fs`（读证书）——全部内置；`thincoder-server/package.json` 依赖面零改。

### 上抛项

无阻塞项。实施期需核一处：`public` 限流类的公开端点清单以 `src/project/webhooks.mjs` 注册行为准（设计档 §2 已注明取值来源，不需裁决）。

### 补记（同轮）

- **AC-PN-14（写面防自锁）**：`tls` 保存时预检证书/私钥文件（可读 + `createSecureContext` 可建），不过 ⇒ 400 文件零变。理由：配错后重启起不来、控制台恰在其上，人只能上机改文件；预检把错误挡在保存前（设计档 §9）。自此本批 AC 共 14 条（AC-PN-1…14）。
- **已完成的改口**：`docs/server/design/ops/OPS.md` §5.6 ∥ §1 配置表（新增 `tls` / `rateLimits` 两行 + `trustProxy` 口径）∥ 边界两行 ∥ KD-SV-25 ∥ AC-13；`docs/README.md` 档地图（server 设计 30 档 · gateway 2 档 · 部分档 194）。**`thincoder-server/README.md` §11 归实施轮**（产品文本面 = eng-coder，设计档 §8 已列逐行改法）。
- **待主 agent 处置（需求档面，其笔不在我）**：`docs/server/requirements/PROJECT.md` §1 已裁公网化三件与 TLS 内置（第 11–15 行），但验收表末行仍为 AC-57，尚无对应公网化 AC 行。本档 AC-PN-1…14 可直接作回填源。

### 补记二（计数更正）

- 受影响文件 = 设计档 §3 表内 **16 行 / 17 个文件**（i18n 中英两表合一行）。上文「15 个文件」为笔误，以本条与设计档 §3 为准。
- 自检三读数：文档机检 gate = PASS（3 档 0 命中）；设计档标题九节（§1–§9）与全文引用逐一对应；AC 行 14 条 = 上文「AC-PN-1…14」。

### 修正轮（评审 15 条 · 父侧全部接受）

逐条处置（号 → 改动落点；设计档 = `docs/server/design/gateway/PUBLICNET.md`，运维档 = `docs/server/design/ops/OPS.md`）：

| # | 处置 | 落点 |
|---|---|---|
| 🔴1 | **拆分计划**（见下节）：`migrations.mjs` 799 行 → 拆后 ≈70，另建三档 DDL；拆后行数写回 §3 表 | 设计档 §3（表 + 拆分计划块） |
| 🔴2 | 探针改口：`tls.enabled` 时走 `node:https`（`rejectUnauthorized: false`，只探活）；新增 AC-PN-15；§5.9 探针命令改写 + TLS 段；§5.7 Docker 路加 TLS 追加段；§5.1 compose 加 `8443` 与证书卷；决策 KD-PN-10 | 设计档 §2/§4/§5/§8；运维档 §5.1 / §5.7 / §5.9 |
| 🟡3 | 「缺位 = 零变」限定 `tls` 段；`rateLimits` 缺位 = 缺省开，落显式决策 KD-PN-9 + AC-PN-17 | 设计档 §2/§4/§5 |
| 🟡4 | OPS §1 可写项 + 启动校验清单已改；`ACCOUNTS.md` §2.1 类型表列「实施轮待改（`unverified`）」 | 运维档 §1；设计档 §8 |
| 🟡5 | AC-PN-13 收窄为「配置块 ∥ 样例 ∥ 口径句零命中」，例外 = OPS 决策表 KD-SV-25 行的用户令逐字引述 | 设计档 §5 AC-PN-13 |
| 🟡6 | 签名补 `onBurst`；写明判点顺序（`clientIp` → `check` → 超限 ⇒ `noteBurst` + 429 + `Retry-After`）；IP 取法指明 `login-guard.mjs:17` 的 `clientIp` | 设计档 §2 限流器 |
| 🟡7 | 补 `rateLimits` 段级对象形拒收行（非对象 ∥ 数组 ⇒ 拒启） | 设计档 §2 校验表 |
| 🟡8 | 重定向监听：绑 `config.host`、端口冲突 ⇒ 拒启；示例改 `redirectPort: 8443`；`Location` 端口取新键 `tls.publicPort`（缺省 443，KD-PN-8）；compose/证书卷/§5.7 随动 | 设计档 §2/§4/§8；运维档 §5.1/§5.7 |
| 🟡9 | 常驻断言 **A7**（`redirectPort` 在场 ⇒ `redirectServer` 在册、停机被关、`SIGHUP` 监听在册）；探针载荷增 `redirectServer`；不变量六条 → 七条；反证义务保留 | 运维档 §4.1；设计档 §3 测试面 |
| 🟡10 | 行数统一为实读 `wc -l`：`bin` 241 ∥ `config.mjs` 360 ∥ `README.md` 259 ∥ `migrations.mjs` 799（旧值 182/≈316/≈318 为早批残留）；设计档 §3 表同步 | 设计档 §3；运维档 §6 |
| 🟡11 | `host` 行与 §7 非功能行改为「默认内网部署；公网部署须开 `tls`」 | 运维档 §1/§7 |
| 🟡12 | 新增 AC-PN-16（`public` 类超阈 ⇒ 429、下一窗恢复、`/healthz` 恒不限）+ 用例 B6；AC-PN-4 改为按 `tls.publicPort` 参数化期望 + 用例 B7 | 设计档 §5/§6 |
| 🟡13 | i18n 两档各 222 行、≤+12 行；新测试档 `test/publicnet.test.mjs` 估算 ≈260 行（收口轮记实际） | 设计档 §3 |
| 🔵14 | 四 kind 表：`tls_start`→`securityTls` ∥ `cert_reload`/`cert_reload_failed`→`securityCert` ∥ `rate_limit_burst`→`securityBurst`；增量列改上界形（`≤+N`） | 设计档 §2/§3 |
| 🔵15 | 前置代理终止 TLS + `trustProxy: true` ⇒ `Secure` 不附，写入 §7 边界与决策 KD-PN-11（强制开关不做） | 设计档 §2/§4/§7 |

**拆分计划（v26 落地前执行）**：现档 799 行（`wc -l` 实读），v26 ≈+45 ⇒ ≈844，越 800 硬顶。拆点 = 按版本区间抽 DDL 常量、注册表留原档：`src/store/migrations/ddl-v1-v11.mjs` ≈300 ∥ `ddl-v12-v20.mjs` ≈305 ∥ `ddl-v21-v26.mjs` ≈190（含新增 v26）∥ `migrations.mjs` ≈70。逐字搬迁、零语义改动，`MIGRATIONS` 顺序与对外导出面不变，`db.mjs` 与调用方零改。

**探针改口与 AC**：探针读 `config.json`，`tls.enabled === true` ⇒ `node:https.get({ host, port, path:'/healthz', rejectUnauthorized:false })`，否则原明文 `http.get` 逐字不变；AC-PN-15 = `tls.enabled` 部署下 `docker compose ps` 显示 `(healthy)`，反证 = 探针改回 `http://` 打同一端口 ⇒ `unhealthy`。

**AC-PN-13 可满足式**：`grep -n "nginx"` 在 `thincoder-server/README.md` 零命中、在 `docs/server/design/ops/OPS.md` 只命中决策表 KD-SV-25 行的用户令逐字引述；`grep -n "前置反代"` 两档零命中。

**计数**：AC 共 **17 条**（AC-PN-1…17）；用例 N1–N7 ∥ B1–B7 ∥ E1–E11 = 25 条；受影响文件表 20 行（20 档）+ 新建单元测试档 1 档。

**同轮观察（知会）**：`OPS.md` 本轮期间被另一在飞批同时改写（§4.1 的不变量表已由 A1–A4 扩为 A1–A6、`bin` 行已改 241）。本轮改动按内容锚点落盘、未覆盖对方内容；本批的常驻断言因此编为 **A7** 而非 A5，且 §6 `config.mjs`/`README.md` 两行按本批实读值落定（360 / 259）。

### 修正轮二（评审轮次 2 的 7 条 · 父侧全部接受 · 2026-10-19）

落点：设计档 = `docs/server/design/gateway/PUBLICNET.md`，运维档 = `docs/server/design/ops/OPS.md`。`OPS.md` 有批 M2 并发写——本轮全部按内容锚点改，未碰 §4.1 的 A1–A6、未碰 §6 的 bin 增量行、未动 §3 评审段。

| # | 处置 | 落点（改后实读） |
|---|---|---|
| 🔴16 | 探针判据改 `statusCode === 200`：`const ok=(r)=>r.statusCode===200;` 定义一次，明文/ TLS 两支共用（分支只选 `mod` 与 `target`）；`PUBLICNET.md` 的「明文部署逐字不变」改为「明文支语义不变，形随 TLS 分支合一」；AC-PN-15 与用例 N6 补「200 ⇒ 退 0 ∥ 503 ⇒ 退 1」 | `OPS.md:298`（探针命令 + 判定说明）；`PUBLICNET.md:253`（§8 行）、`:193`（AC-PN-15）、`:218`（N6） |
| 🟡17 | `tls` 键集统一六键（`enabled` ∥ `certPath` ∥ `keyPath` ∥ `publicHost` ∥ `publicPort` ∥ `redirectPort`），逐键列全 | `OPS.md:36`（§1 配置表）∥ `:274`（§5.6）∥ `:285`（§5.7 ③）∥ `:374`（KD-SV-25）；`PUBLICNET.md:246`（§8 §5.6 行）∥ `:254`（§8 §5.7 行） |
| 🟡18 | 不变量编号 A5 → **A7**（本批的 TLS 附加面 = A7；A5 = 终端 hub 接线，归批 M2） | `PUBLICNET.md:258`（§8 §4.1 行） |
| 🟡19 | A7 断言改成可判红的形 = **基线增量恰 1**（装配前记 `base`，装配后断 `listenerCount − base === 1`）；夹具补证书夹具、第二端口、监听器复原三句，并把 `tls` 段写进 `config` 夹具 | `OPS.md:138`（A7 行）∥ `:153`–`:157`（夹具规格）；`PUBLICNET.md:157`（测试面同步） |
| 🟡20 | §3 受影响文件表补 `Dockerfile`（41 行）与 `docker-compose.yml`（22 行）两行（实读 + Δ）；`OPS.md` §6 的 Dockerfile 行同步为 41 行（原 ≈37 与实读不符） | `PUBLICNET.md:144`–`:145`；`OPS.md:339` |
| 🔵21 | §8 的 OPS 坐标按本轮落笔后实读重写：§5.6 = `:272`、边界 = `:412` / `:415`、KD-SV-25 = `:374`、AC-13 = `:356`；§8 表头加「行号读数日 = 2026-10-19」 | `PUBLICNET.md:242`（读数日句）、`:246`、`:248`、`:249` |
| 🔵22 | 档头回指标签随 §7 行同口径：「非功能·仅内网」→「默认内网部署；公网部署须开 `tls`」 | `OPS.md:4` |

**探针命令（改后全文，`OPS.md:298`）**：

```
CMD node -e "const fs=require('node:fs');let c={};try{const raw=JSON.parse(fs.readFileSync('/app/config/config.json','utf8'));if(raw&&typeof raw==='object')c=raw}catch{};const h=(typeof c.host==='string'&&c.host!==''&&c.host!=='0.0.0.0')?c.host:'127.0.0.1';const p=Number.isInteger(c.port)?c.port:8787;const tlsOn=!!(c.tls&&c.tls.enabled===true);const mod=tlsOn?require('node:https'):require('node:http');const ok=(r)=>r.statusCode===200;const target=tlsOn?{host:h,port:p,path:'/healthz',rejectUnauthorized:false}:'http://'+h+':'+p+'/healthz';mod.get(target,(r)=>{r.resume();process.exit(ok(r)?0:1)}).on('error',()=>process.exit(1))"
```

**为什么现在恒判对**：`r` 是 `node:http`/`node:https` 的 `IncomingMessage`（同一回调里还按流用 `r.resume()`），它没有 `ok` 属性——`ok` 只属于 fetch 的 `Response`。改判 `r.statusCode` 后，200 ⇒ 退 0、503 ⇒ 退 1 恒成立；判定函数 `ok` 只写一处，两支共用，避免下次「改一处漏一处」。

**A7 断言形（`OPS.md:138`）**：`redirectServer` 在册且端口 = `redirectPort`、`stop()` 后已关；`SIGHUP` 监听断**基线增量恰 1**——跨用例残留时「删注册行仍 > 0」不再兜底，删行 ⇒ 增量 0 ⇒ 必红。

**A7 证书夹具三句（`OPS.md:155`–`:157`）**：① 入库测试 PEM 放 `thincoder-server/test/fixtures/tls/`（`cert.pem` ∥ `key.pem`，自签、只作测试材料；测试期不现生成——零新包）；② 第二端口同法 `net.createServer().listen(0)` 取后关闭再用，须 ≠ 配置端口；③ 用例 `finally` 按装配前 `process.listeners("SIGHUP")` 快照差集 `removeListener`，跨用例不堆积。

**探针两支的本地试跑读数（`node -e`，假 200 ∥ 假 503 服务）**：明文 200 ⇒ exit 0 ∥ 明文 503 ⇒ exit 1 ∥ 旧判据 `r.ok` 对同一 200 服务 ⇒ exit 1（复现恒假）∥ `tls.enabled: true` ⇒ 选 `node:https`（对明文端口走 error 路径 ⇒ exit 1）∥ `typeof r.ok = undefined`、`r.statusCode = 200`。

**计数随动**：受影响文件表 = **22 行（22 档）** + 新建单元测试档 1 档；AC 仍 17 条（AC-PN-1…17）；用例仍 25 条（N1–N7 ∥ B1–B7 ∥ E1–E11）。`OPS.md` 现 **419 行**（`wc -l` 实读 2026-10-19）。

**机检读数**：`doc_check(mode:"gate")` = **ERROR**（引擎档 mtime 晚于会话进程启动——旧引擎读数不可信，需重启会话复跑；非本档内容问题）。以当前盘上引擎直跑 `node scripts/doc-check.mjs --root .`：本轮两档**行宽 0 命中**；两档另有 11 条悬空为既有（`limits.mjs` / `ddl-v*.mjs` 等**待新建档**的前向路径坐标 ∥ `deploy/restore-drill.mjs` 相对形），非本轮引入。

## §3 设计评审（评审子代理）

### 轮次 1（评审子代理）

**设计评审轮 —— 批 M1 · 公网化安全面三件（PUBLICNET.md ∥ OPS.md）**

评审范围：`docs/server/design/gateway/PUBLICNET.md`（全文）∥ `docs/server/design/ops/OPS.md`（全文）。项目标准档：未声明（方法学按 AGENTS.md + 评审判据；已在报告中声明该限制）。文档地图：未提供（文档归属判据降级，按 AGENTS.md 定位）。

| # | Category | Severity | Issue | Suggestion |
|---|----------|----------|-------|------------|
| 1 | 受影响文件体量 / 结构层 | 🔴 | `migrations.mjs` 标注「800 行」+「约 +45 行」（PUBLICNET.md:119）⇒ 落在 800 行硬顶之外（≈845），而全档无拆分计划（全文无「拆/split/拆分」字样；§7 边界也未列）。按判据 8「>800 行 must split——硬顶、无豁免通道」 | 给出 v26 前的拆分计划（例如把迁移步序/DDL 段抽到 `store/migrations/v26.mjs` 一类子档，或按版本域切分并保留 `migrations.mjs` 为注册表），并把拆后各档行数写进 §3 表 |
| 2 | 需求覆盖 / 文档归属 | 🔴 | 同一端口改为只讲 TLS（PUBLICNET.md:9「用 `node:https` 换掉 `node:http` 监听」；AC-PN-2 = PUBLICNET.md:146「同一端口明文请求失败」），而 OPS 文档的容器探针仍以明文打同一端口（OPS.md:259 的 `HEALTHCHECK` 走 `fetch('http://'+h+':'+p+'/healthz')`）⇒ 两处对「探活面」这一机制给出互斥描述，TLS 部署下 healthcheck 恒失败（`unhealthy`）。PUBLICNET.md:195-203 的改口表与 §3 受影响文件表均无 `OPS.md` §5.9 / §5.7 行，AC 表也无一条覆盖「TLS 下容器探活」 | 补一条决策 + 改口行：探针在 `tls.enabled` 时走 `node:https`（或探针改连回环 + 例外口），把 §5.9 探针命令与 §5.7 清单纳入改口表，并加一条 AC（TLS 部署下 `docker compose ps` = healthy） |
| 3 | 需求覆盖 / 验收 | 🟡 | PUBLICNET.md:33 括注「缺位 = 现行为零变」覆盖「两段」，但 `rateLimits.enabled` 缺省 `true`（PUBLICNET.md:48 ∥ OPS.md:37）⇒ 缺位部署升级后行为会变（登录端点开始出 429），该升级语义既无决策条目也无 AC | 把「零变」限定为 `tls` 段；为 `rateLimits` 缺位态补一条显式决策（缺省开 = 有意公网化口径）与一条 AC（无 `rateLimits` 段的存量档 ⇒ 登录阈 20 生效） |
| 4 | 文档归属 / 改口完整性 | 🟡 | 同一机制在 OPS 的两处清单会滞后且无改口行：`OPS.md:68` 的「可写项 = `autoUpdate` ∥ `trustProxy` ∥ `usageRetentionDays` ∥ `proxy.uri`（顶层段）」未含 `tls`/`rateLimits`（与 PUBLICNET.md:16 / :52 的「进白名单」冲突），`OPS.md:59` 的「**启动校验（fail-closed）**：`host` 缺失」清单未含两段非法值。另：`accounts/ACCOUNTS.md` §2.1 被 OPS.md:97 指为审计目录/列形 owner，新增第 18 型很可能需在其类型表加行，改口表无该落点（unverified——该档不在评审范围） | 在 §8 改口表补三行：OPS §1 配置写面可写项、OPS §1 启动校验清单、`accounts/ACCOUNTS.md` §2.1 类型表；标注「设计轮已改 / 实施轮待改」 |
| 5 | 验收判据 / 文档卫生 | 🟡 | AC-PN-13（PUBLICNET.md:157）要求「`nginx` … 零命中」于 `ops/OPS.md`，但同一档 KD-SV-25 的令文引述就含该词（OPS.md:333「没有nginx，thincoder-server要自己实现tls」）⇒ 该 AC 现状即不可满足（机检必红），也与 D8「删除不留痕」的口径互相打脸 | 把 AC-PN-13 的判据收窄到「配置块/样例/口径句零命中」（引述用户令原话除外），或改写引述为不含该词的描述，再统一 D8 执行口径 |
| 6 | 清晰度 / 接口契约 | 🟡 | `createIpLimiter({ rules, now = Date.now })`（PUBLICNET.md:69）无「触限回调」入参，而 `limiter.noteBurst(payload)` 的说明直接引用「只回调一次 onBurst」（PUBLICNET.md:71）——`onBurst` 从何注入、由谁调用（限流器自身判超限 vs 外层判点）未定；`check(…, ip)` 的 IP 取法也未指名助手 | 把签名补成 `createIpLimiter({ rules, now, onBurst })`，并写明判点顺序（check ⇒ 超限 ⇒ 记审计 + 置 `Retry-After`）；IP 取法指明与 `trustProxy` 同源的那一处助手 |
| 7 | 清晰度 / 配置校验 | 🟡 | 校验表给了 `tls` 的对象形拒收行（PUBLICNET.md:43），但 `rateLimits` 只有子键行、无段级对象形行（数组/数字/字符串 `rateLimits` 何去何从未定） | 与 `tls` 对称补一行：`rateLimits` 非对象 ∥ 数组 ⇒ 拒启（fail-closed） |
| 8 | 可行性 / 部署面 | 🟡 | 重定向监听的三处未定：① 绑哪个 host（`host` ∥ `0.0.0.0`）未写；② `EADDRINUSE`/`EACCES` 时是拒启还是 warn 未写；③ 示例 `redirectPort: 80`（PUBLICNET.md:37）在文档既定部署形下不可绑——容器 `USER node`（非 root，OPS.md:146），且 compose 样例只映射 8787（OPS.md:160）、未挂证书目录；§5.7 首部署清单也无 TLS 步骤（放证书 ∥ 开 443/80 ∥ 安全组） | 写明绑定地址与端口冲突时的 fail-closed 语义；示例改 `redirectPort: 8443` 或注明需 `CAP_NET_BIND_SERVICE`/`sysctl net.ipv4.ip_unprivileged_port_start`；把 compose 端口 443/80 与证书卷、§5.7 清单 TLS 步骤纳入 §8 改口 |
| 9 | 方法学 / 常驻护栏 | 🟡 | OPS §4.1 的常驻装配断言（`thincoder-server/test/assembly.test.mjs`，OPS.md:117「常驻测试位」、A1–A4、反证义务、OPS.md:129「不随批删除」）与本批的装配面改动无对接：新增的第二监听、`SIGHUP` 注册、停机并关都不在任何不变量内；PUBLICNET.md:127 的测试面只写「新增单元测试档（本批自持、收口删除）」 | 在 §3 测试面加一条常驻断言（A5：`redirectPort` 在场 ⇒ 装配后第二 server 在册且停机被关；`SIGHUP` 监听在册），并保留反证义务读数 |
| 10 | 清晰度 / 体量标注一致性 | 🟡 | 本档「现况」数字与 OPS 同档两处不一致，机检无法采信：`bin/thincoder-server.mjs` = PUBLICNET.md:114「242 行」 vs OPS.md:288「**182**」 vs OPS.md:116「实读 241 行」；`src/ops/config.mjs` = PUBLICNET.md:112「361 行」 vs OPS.md:289「**≈316**」；`README.md` = PUBLICNET.md:123「260 行」 vs OPS.md:303「**≈318**」 | 落笔前重读一次三个档的真实行数并统一（OPS §6 行数预算表随动，或反之），把以哪一处为准写清 |
| 11 | 需求口径 / 改口完整性 | 🟡 | 公网化口径与 OPS 既有内网口径并存且无改口行：`OPS.md:310` 验收行仍写「非功能 · 仅内网」，`OPS.md:29` `host` 仍写「内网接口地址」 | §8 补两行（§7 非功能行 + §1 `host` 行），把「仅内网」改为「默认内网部署；公网部署须开 `tls`」一类口径，避免两处口径打架 |
| 12 | 验收判据 | 🟡 | 限流的 `public` 类无任何 AC/用例（AC-PN-6 ∥ B1/B2/E6 全在 `auth` 类，B5 只证 `/healthz` 不限）⇒ `publicPerMin` 阈值与常量表清单的正确性不可机检；AC-PN-4（PUBLICNET.md:148）写 `Location` = `https://<publicHost>/x?y=1`，未声明该断言的前置是 `port = 443`（§2 说非 443 要带端口；B4 只覆盖 443 那一侧） | 补 AC + 用例（`public` 类端点同 IP 超 `publicPerMin` ⇒ 429；下一窗恢复）；AC-PN-4 写明前置端口或改为参数化期望 |
| 13 | 受影响文件体量标注 | 🟡 | 两个 i18n 档（`i18n-zh-system.mjs` / `i18n-en-system.mjs`）现况列只写「两表」、无行数无增量；新增单元测试档也无估算（PUBLICNET.md:122 / :127）⇒ 不满足「每个改动源/测试档须带现况行数 + 预期增量」 | 补两档行数（读一次即可）与「≈+N 行」，测试档给估算并在收口轮记录实际值 |
| 14 | 文档卫生 / 措辞 | 🔵 | 「三 kind」后列了四个 kind 值（`tls_start` ∥ `cert_reload` ∥ `cert_reload_failed` ∥ `rate_limit_burst`，PUBLICNET.md:92-95），而 §9 只给三个文案键 ⇒ 行模板与键的对应关系含糊；增量列统一写「约 +N 行」而非判据要的 `≤±N` 上界 | 把 kind 计数与文案键的映射列成小表（四 kind → 三键：cert 两 kind 共键）；增量列改为上界形（`≤+25`） |
| 15 | 边界语义 | 🔵 | `Secure` 判据 = `req.socket.encrypted === true`（PUBLICNET.md:103）：若部署形为「前置可信代理终止 TLS + `trustProxy: true`」（OPS.md:242 允许的部署形），后端为明文 ⇒ 会话 cookie 不带 `Secure`，未在边界/决策中披露 | 在 §7 边界或决策行记一句：前置代理终止 TLS 的部署形下 `Secure` 不附（要附须显式配置），或引入「可信代理即视为 secure」的开关（不做则如实写不做） |

计数：🔴 2 ∥ 🟡 11 ∥ 🔵 2（合计 15）。

VERDICT: changes-required

（评审限制声明：未提供项目标准文档，方法学按 AGENTS.md + 判据；未提供文档地图，文档归属按 AGENTS.md 定位；行数「现况」除 OPS.md 内部交叉比对外，未回读源文件核对（评审范围只含两档设计文档）。）

### 轮次 2（评审子代理）

## 轮次 2 复核（设计评审）—— 批 M1 · 公网化安全面（TLS 内置 ∥ 鉴权加固与限流 ∥ 审计 security_event）

评审范围：`docs/server/design/gateway/PUBLICNET.md` 全文 ∥ `docs/server/design/ops/OPS.md` 全文（按声明，未扩面）。

### 轮次 1 十五条逐条核对
1. 🔴 migrations.mjs 越 800 硬顶无拆分计划 → **Fixed**（PUBLICNET:135「先拆后改」+ 147-153 拆案：799→≈844 越过硬顶，四档 ≈300/≈305/≈190/≈70 均 <500，对外导出面逐字不变）
2. 🔴 TLS 换监听 vs 容器明文探针互斥 → **Fixed**（OPS:290 探针含 tlsOn 分支、OPS:292 决策、PUBLICNET:170 KD-PN-10、:191 AC-PN-15、:216 N6；Dockerfile 待改行在 §8:256）
3. 🟡「缺位 = 现行为零变」vs rateLimits 缺省开 → **Fixed**（PUBLICNET:33 限定 tls、:169 KD-PN-9、:193 AC-PN-17、:223 E11）
4. 🟡 §8 改口漏 OPS 可写项/启动校验清单（+ACCOUNTS §2.1）→ **Fixed**（OPS:68、OPS:59；PUBLICNET:252、:255）
5. 🟡 AC-PN-13「OPS 内 nginx 零命中」不可满足 → **Fixed**（PUBLICNET:189 改为「只命中用户令逐字引述行」；grep 复核 OPS 仅 :366 KD-SV-25 一处命中，「前置反代」两档零命中）
6. 🟡 createIpLimiter 缺 onBurst / IP 取法未指名 → **Fixed**（PUBLICNET:71、:73、:76、:77、:78）
7. 🟡 rateLimits 段级对象形校验行缺失 → **Fixed**（PUBLICNET:49 + E9:221）
8. 🟡 重定向监听绑址/EADDRINUSE/非 root:80/compose 端口/证书卷 → **Fixed**（PUBLICNET:87、:88、:89；OPS:187-192、:280）
9. 🟡 常驻装配护栏未覆盖 TLS 附加面 → **Fixed**（OPS:124 probe 含 redirectServer、OPS:135 A7、OPS:148 面对照；PUBLICNET:155）
10. 🟡 bin/config.mjs/README 行数三处互不一致 → **Fixed**（PUBLICNET:128/130/143 ↔ OPS:320/322/336 逐值相等）
11. 🟡 OPS §7「非功能·仅内网」+ host 内网口径 → **Fixed**（OPS:29、OPS:343；线 4 回指标签残留另列）
12. 🟡 public 类无 AC / AC-PN-4 端口前提未声明 → **Fixed**（AC-PN-16:192、B6:218；AC-PN-4:180 参数化 + B7:219）
13. 🟡 i18n 两档与测试档无行数/增量 → **Fixed**（PUBLICNET:141、:142、:155）
14. 🔵「三 kind」列四值 / 增量非上界形 → **Fixed**（PUBLICNET:100、:104-111 映射表；增量改 ≤+N）
15. 🔵 Secure 判据过不了前置代理终止 TLS 的部署形 → **Fixed**（PUBLICNET:119、KD-PN-11:171、§7:236 明示不做）

### 本轮新发现
| # | 文件 | 严重度 | 状态 | 说明 |
|---|---|---|---|---|
| 16 | ops/OPS.md:290 ∥ gateway/PUBLICNET.md:249 | 🔴 | New | 探针重写把 fetch Response 语义搬到 `IncomingMessage` 上：`process.exit(r.ok?0:1)` —— 同一回调对象按流用（`r.resume()`、`.on('error')`），判据从不读 `statusCode`；`ok` 在 node 内建流对象上不存在 ⇒ 恒退 1 ⇒ HEALTHCHECK 恒失败、AC-PN-15「docker compose ps 见 (healthy)」不可达成。且 PUBLICNET:249 声明「明文部署逐字不变」不实（明文分支同样被改写） |
| 17 | ops/OPS.md:36 ∥ :269 | 🟡 | New | `tls` 键集两处只列五键（enabled/certPath/keyPath/publicHost/redirectPort），漏 `publicPort`——而 PUBLICNET §2:47 定义该键、OPS:59/:68/:280 三处消费它；且两处「五键」枚举内容互不相同（:280 的五键含 publicPort、不含 enabled） |
| 18 | gateway/PUBLICNET.md:254 | 🟡 | New | 改口表称「§4.1 已增：A5 不变量」，而 OPS:135 的 TLS 不变量编号是 **A7**（A5 = 终端 hub 接线），本档 :155 亦写 A7 ⇒ 与批 M2 并发写入的编号对不上，读者无法判定哪条在册 |
| 19 | ops/OPS.md:135 ∥ :154 ∥ :151 | 🟡 | New | A7 断言形 `process.listenerCount("SIGHUP") > 0` 与 :154 自定原则（「不用 `process.emit("SIGINT")`——监听器会在同进程跨用例堆积」）相抵：跨用例泄漏时删装配行仍 >0 ⇒「删行必红」反证义务落空；另 A7 需 `tls.enabled + certPath/keyPath` 的证书夹具，:151 夹具规格只列 host/port/db/autoUpdate/providers，零依赖又不允许测试期现生成证书 |
| 20 | gateway/PUBLICNET.md:256-257 ∥ §3 表 | 🟡 | New | `Dockerfile`（探针命令换新形）与 `docker-compose.yml`（端口两行+证书卷）已列入改动集，但 §3 受影响文件表（:126-145）无这两行、无现况行数与增量 ⇒ 体量标注面不完整 |
| 21 | gateway/PUBLICNET.md:242 | 🔵 | New | §8 的 OPS 行内坐标因本轮改稿整体位移：§5.6 实为 `OPS.md:267`（本档写 `237`）、边界实为 :404/:407（本档写 `371`/`374`）、KD-SV-25/AC-13 实为 :366/:348（本档写 `333`/`315`） |
| 22 | ops/OPS.md:4 | 🔵 | New | 回指标签仍写「`PROJECT.md` §7（非功能·仅内网 …）」，与 :343 已改的「默认内网部署；公网部署须开 `tls`」并存（跨档口径残留，PROJECT.md 不在本轮范围，未验证其 §7 标题） |

### 并发写入自洽性（OPS ∥ 批 M2）
§4.1 现为 A1–A7，A7 与「面 → 不变量对照」表（OPS:148）已收 TLS 附加面；probe 载荷含 `redirectServer`（OPS:124），与 PUBLICNET:155 互指一致。行数面：OPS:320 的 bin 基线 241 与本档 §3:130 的 241 同源，两侧增量（≈+40 ∥ ≤+50）叠加后 ≈331，仍 <500——预算表只记本批增量（不记另一批），不构成越顶，仅需实施轮以落地时实读复算。唯一硬伤 = 编号 A5/A7（见 #18）。

计数：轮次 1 十五条 = 15 Fixed ∥ 0 Unfixed；本轮新增 🔴1 ∥ 🟡4 ∥ 🔵2。
判定：先例/调研/需求回指/边界/决策/AC/用例七面齐备，TLS、限流、审计三链的机制与判点均已可机检；阻塞项仅探针命令的判据错用（#16），其余为并发编号与标注面收尾。

VERDICT: changes-required

### 轮次 3（评审子代理）

## 轮次 3 复核（严格核轮次 2 的 7 条）

| # | Orig# | File | Severity | Status | Notes |
|---|-------|------|----------|--------|-------|
| 1 | 16 | ops/OPS.md:298 | 🔴 | Fixed | 判据已改共用函数：`const ok=(r)=>r.statusCode===200;` + `process.exit(ok(r)?0:1)`；两支只选模块与目标形（`node:https` ∥ `node:http`）；:298 尾注自陈「`r` 是 `IncomingMessage`…`ok` 只在 fetch `Response` 上有」；PUBLICNET:193 AC-PN-15 判据改「探针判定 = `statusCode === 200`（两支共用）：本地一跑 200 ⇒ 退 0、503 ⇒ 退 1」，N6 @:218 补「假 200 ∥ 假 503 服务」直跑；§8 @:253 撤回「逐字不变」，改为「明文支语义不变，形随 TLS 分支合一」 |
| 2 | 17 | ops/OPS.md:36 ∥ :274 ∥ :287 ∥ PUBLICNET.md:246/:254 | 🟡 | Fixed | 六键口径统一：:36「内置 TLS 段六键：`enabled` ∥ `certPath` ∥ `keyPath` ∥ `publicHost` ∥ `publicPort`（缺省 `443`——只被重定向 `Location` 消费） ∥ `redirectPort`」；:274、:287、PUBLICNET:246/:254 均「六键」且枚举一致；:70 可写项与 :60 启动校验含 `publicPort` |
| 3 | 18 | gateway/PUBLICNET.md:258 | 🟡 | Fixed | 「已增：A7 不变量 + `onAssembled` 增 `redirectServer`」；与 OPS:138 A7 ∥ :151 对照表 ∥ 本档 :157 三处同号 |
| 4 | 19 | ops/OPS.md:138 ∥ :154-157 | 🟡 | Fixed | A7 断言改基线增量：「装配前记 `base = process.listenerCount("SIGHUP")`，装配后断 … `- base === 1`（跨用例残留不兜底：删注册行 ⇒ 增量 0 ⇒ 红）」；证书夹具三句齐备——:154 用例 `tls` 段指向夹具、:155 `test/fixtures/tls/` 入库 PEM「测试期不现生成（零新包）」、:157 `finally` 按差集 `removeListener` 复原使增量不被残留污染 |
| 5 | 20 | gateway/PUBLICNET.md:144-145 | 🟡 | Fixed | §3 补两行：`Dockerfile` 41 行（实读）「探针换 §5.9 新形（TLS 分支 + `statusCode` 判定），≤+3 行」；`docker-compose.yml` 22 行「端口加 `"8443:8443"` + 证书卷 `./certs:/app/certs:ro`，≤+3 行」 |
| 6 | 21 | gateway/PUBLICNET.md:242-249 ∥ :146 | 🔵 | Fixed | 坐标按改后实读：§5.6「现 `272` 行起」（实为 OPS:272）∥ §1 `33`/`36`/`37` 行逐一对上 ∥ 边界 `412`/`415`（实为 :412/:415）∥ KD-SV-25 `:374`（实为 :374）∥ AC-13 `:356`（实为 :356）；§3 @:146「OPS.md 419 行」与实读一致 |
| 7 | 22 | ops/OPS.md:4 | 🔵 | Fixed | 档头回指已同口径：「本域回指 = `PROJECT.md` §7（默认内网部署；公网部署须开 `tls` ∥ AC-7⑦ 引导幂等——机制 = 本档 §2）」，与 §7 验收行 @:351「默认内网部署；公网部署须开 `tls`」一致 |

计数：轮次 2 七条 = **7 Fixed ∥ 0 Unfixed**；新增 🔴0 / 🟡0 / 🔵0。
自报读数复核：探针 200⇒退 0、503⇒退 1 的判据在正文（OPS:298 ∥ PUBLICNET:193/:218）有对照；旧判据 `r.ok` 在 200 下退 1 与改成 `statusCode` 后的差异已写入 §8:253。

VERDICT: pass

## §4 用户批准（主 agent）

**批准（2026-10-19 · 用户整批令）**

用户逐字：「技术待办现在就开始处理」·「全部开」·「接着派，别等」——覆盖本批批准门。设计已过三轮评审（末轮 = pass，7/7 Fixed）⇒ 实施获准。

**批准范围**：条目 1（TLS 内置）∥ 条目 2（限流，复用 `ratelimit.mjs`）∥ 条目 3（`security_event` 审计 + 迁移 v26 + `migrations.mjs` 拆分）∥ `publicHost` 形判（父侧扩）· 条目 4 文档面归设计席。

## §5 实施记录（eng-coder）
**状态行**：实施完成（条目 2 ∥ 条目 3 ∥ publicHost 形判补丁；25 例全绿；迁移 v26）



### 交付面（本批条目 1 = TLS 内置；条目 2/3/4 不在本轮）

实现 = 内置 `node:https` TLS 终止 + 308 重定向 + `SIGHUP` 热换证 + 控制台 TLS 段 + 容器探针；零第三方依赖（新增 import 全 `node:` 前缀）。

| 文件 | 现况 | 交付 |
|---|---|---|
| `src/ops/config.mjs` | 412 行（+51） | `validateTlsConfig` 六键校验/归一（缺省 `publicPort: 443` ∥ `redirectPort: null`；`redirectPort === port` 拒）；`loadConfig` 证书路径按配置档目录归一 |
| `src/gateway/server.mjs` | 315 行（+41） | `createGatewayServer({ tls })` ⇒ `node:https`；`loadTlsMaterial`（读 + `createSecureContext` 校验）；`redirectLocation`（只取配置主机/端口）；`createRedirectServer`（308） |
| `bin/thincoder-server.mjs` | 286 行（+45） | 启动期读证书（失败拒启）；先起重定向面、后起主面（绑不上不半起）；`SIGHUP` ⇒ `setSecureContext`（失败保旧证，仅日志）；停机同收并摘监听；`tls_start` 日志 |
| `src/gateway/config-admin.mjs` | 230 行（+48） | `tls` 进写白名单 + 子键级合并 + GET 只回路径 + 写面防自锁预检（启用 ⇒ 证书可读且成对，否则 400 文件零变） |
| `public/views-system-config.mjs` | 210 行（+44） | 「TLS（内置）」段六控件 + 端口前端自校 + 段内独立错态位 |
| `public/i18n-zh-system.mjs` ∥ `i18n-en-system.mjs` | 各 234 行（+12） | 10 个 `system.cfgTls*` 键（中英同步，en 零 CJK） |
| `Dockerfile` | 43 行（+2） | `HEALTHCHECK` 探针换 `OPS.md:298` 同形（`tls.enabled` ⇒ `node:https`；判定 `statusCode === 200` 由单函数两支共用） |
| `docker-compose.yml` | 24 行（+2） | `"8443:8443"` + `./certs:/app/certs:ro` |
| `test/publicnet.test.mjs` | 360 行（新建，本批自持） | 15 例，收口轮随批删除 |
| `test/fixtures/tls/*.pem` | 4 份 | 自签测试材料（`cert/key` ∥ `cert-rotated/key-rotated`；测试期不现生成） |

**未做（本轮范围外，父侧已知）**：`rateLimits` 校验 ∥ `limits.mjs` 限流器 ∥ 会话 cookie `Secure`（条目 2）；`security_event` 四 kind + 迁移 v26 + `migrations.mjs` 拆分（条目 3）；`README.md` §11 改口与 `ACCOUNTS.md` §2.1 类型表（条目 4 / 文档面）。故 AC-PN-5 的「`cert_reload_failed` 审计一行」与 AC-PN-8/9/10（审计面）/11（限流段）/13 本轮未覆盖。

### 读数（本机 Windows，Node v24.19.0）

| # | 判据 | 命令 / 方式 | 结果 |
|---|---|---|---|
| ① | 三启动路径 | `cd thincoder-server && node --test test/publicnet.test.mjs`（进程内驱 `run()`） | 无 `tls` 段 ⇒ http 200、无 `tls_start`、零 `SIGHUP` 监听 ∥ `tls.enabled:false` ⇒ http 200 ∥ `tls.enabled:true` ⇒ https 200 且同端口明文失败、`SIGHUP` 监听增量 = 1 |
| ② | `SIGHUP` 换证 | 同上（`process.emit("SIGHUP")`；Windows 无真信号投递） | 覆盖为轮换对 ⇒ 新连接对端证书 CN = `rotated.localhost`；写坏证 ⇒ `cert_reload_failed` + 旧证继续服务（CN 仍 `rotated.localhost`、200） |
| ③ | 308 `Location` | 同上（非默认 `publicPort: 8443`；请求头 `Host: evil.example:9999`） | `GET /x?y=1` ⇒ 308，`Location: https://tc.example.com:8443/x?y=1`；POST 同 308（方法保形）；主机名不受 `Host` 影响 |
| ④ | 探针两支 | 取 `Dockerfile` 的 `HEALTHCHECK … CMD node -e "…"` 原串直跑（TLS 支仅把 `/app/config/config.json` 换临时档） | 明文 200 ⇒ 退 0 ∥ 明文 503 ⇒ 退 1 ∥ TLS 200 ⇒ 退 0 ∥ TLS 支打明文端口 ⇒ 退 1；串内含 `statusCode === 200`、无 `r.ok` |
| ⑤ | 控制台写面（人工走查） | 真实起服 + 浏览器登录 → `#/admin/system` | TLS 段六控件渲染并回填；勾「启用 TLS」保存 ⇒ 配置档落 `tls.enabled: true`；certPath 改为不存在 ⇒ 400「TLS 证书预检失败…」且文件字节零变 |
| ⑥ | 拒启 | 同上测试档 | 私钥缺 ⇒ `startup_failed` + 不监听（E1）；`redirectPort` 被占用 ⇒ `startup_failed` + 主面不监听（E8） |

`node --test test/publicnet.test.mjs` = **15 例全绿**（含上述 ①–③⑥）；`node test/rc-resolve.mjs` = 退出 0（既有档未受扰）。

`git diff --stat`（9 档）：`+285 / −27`；另两件未跟踪 = `thincoder-server/test/publicnet.test.mjs`（360 行）∥ `thincoder-server/test/fixtures/`（4 份 PEM）。

文档机检：`doc_check(mode:"gate")` = **ERROR**（会话进程内引擎早于盘上引擎档——须重启会话复跑；非本档内容问题）；以盘上引擎直跑 `node scripts/doc-check.mjs --root .`：源域行宽 **0 命中**（FAIL 的 279 条悬空为既有，非本轮引入）。

### 决策与披露

- **重定向面先起、主面后起**：`redirectPort` 绑不上即整机拒启、TLS 面不监听（E8「不半起」的字面实现）；两 server 关闭走 `closeQuietly`（未监听实例 `close()` 会抛，且一处抛出不得跳过另一处）。
- **写面预检口径 = 设计 §2:54**：「`tls` 在场且 `enabled: true` ⇒ 校验」。控制台每次保存都携六键，故启用态下每次控制台保存都会预检（首版注释写成窄口径，已按设计订正注释、未改行为）。
- **审计面缺位**：TLS 生命周期目前只落日志（`tls_start` ∥ `cert_reloaded` ∥ `cert_reload_failed`）；`security_event` 行随条目 3 落地时，`PUBLICNET.md` §2 的四个 kind 与三个文案键一并接上。
- **`publicHost` 只判非空**：设计校验表只要求「缺 ⇒ 拒」，未给域名形判据；误填 `https://x` 或 `x:8443` 会拼出坏 `Location`。留给设计席裁量（未自行发明语义）。

### 审计与评审轮次

- **内部偏离审计（explore 子代理，只读）**：VERDICT **pass**；四类偏差（部分实现 / 静默简化 / 文档漂移 / 越界改动）零。观察项 6 条——「A7 ∥ `onAssembled` 探针缝不在本批」归批 M2（装配面那批），「`publicHost` 形判」「AC-PN-10 字面 200 需前置证书」交设计席。
- **独立代码评审（advisor，type=code）**：VERDICT **pass**，🔴 0；🟡 2（TLS 端口错态落在保留天数行 ∥ 预检触发面与注释不符）+ 🔵 6（用例覆盖强度、测试确定性、行数预算漂移、`publicHost` 形判、审计留白、AC-PN-10 前置）。
- **修正轮（1 轮，已核实）**：🟡1 已修——TLS 段独立错态节点 `tlsInvalidHint`（不再借用保留天数那颗，端口非法时红字与焦点同段）；🟡2 已处置——按设计 §2:54 订正注释、行为保持；另采纳审计观察 6——启动失败径也摘 `SIGHUP` 监听。改后复跑 15/15 绿。
- **终态**：**clean**（无未决阻塞项；🔵 六条为建议项，已在本段与交付报告披露）。

### 追加轮（2026-10-19 · 条目 2 ∥ 条目 3 ∥ `publicHost` 形判补丁）

实现三件：匿名入口按 IP 限流（**复用既有 `gateway/ratelimit.mjs` 的计数引擎**，不写第二套）∥ 会话 cookie 在 TLS 连接上附 `Secure`
∥ 审计第十八型 `security_event`（四 kind）+ 迁移 v26 + `migrations.mjs` 拆分 ∥ `tls.publicHost` 形判。零第三方依赖（新增 import 全 `node:` 前缀）。

| 文件 | 现况 | 交付 |
|---|---|---|
| `src/gateway/limits.mjs` | 96 行（新建） | `createIpLimiter({ rules, now, onBurst })` + `check` + `noteBurst`；规则表 `auth`（`POST /api/login` ∥ `POST /api/client/login`）∥ `public`（`POST /api/hooks/git-sources/:id`）；计数引擎 = `ratelimit.mjs` 的 `createRateLimiter` + `RATE_LIMIT_WINDOW_MS` + `windowIndexOf`；按窗重建引擎使 IP 桶内存按窗有界 |
| `src/gateway/server.mjs` | 330 行（+56） | `createGatewayServer({ …, limits })` 判点（路由之前：`clientIp` → `check` → 超限 ⇒ `noteBurst` + `req.resume()` + 429 `rate_limited` + `Retry-After`） |
| `src/ops/config.mjs` | 448 行（+88） | `validateRateLimits` 三键校验/归一（缺位 ⇒ 缺省开 20/120——KD-PN-9）；`publicHost` 形判（含 `://` ∥ 含 `:` ⇒ 拒启） |
| `src/gateway/config-admin.mjs` | 256 行（+74） | `rateLimits` 进写白名单 + 子键级合并 + `rateLimitsView` 缺省回显；白名单七键 |
| `src/accounts/audit.mjs` | 140 行（+7） | 第十八型 `security_event`（四 kind） |
| `src/accounts/session.mjs` | 104 行（+11） | `serializeSessionCookie(token, { secure })` + `isSecureRequest(req)`（判据 `socket.encrypted`） |
| `src/accounts/routes.mjs` | 164 行（+3） | 登录签发按 `isSecureRequest(req)` 附 `Secure` |
| `src/store/migrations.mjs` | 99 行（重写为注册表） | 留 `MIGRATIONS` ∥ `SCHEMA_VERSION` ∥ `migrate` ∥ `readVersion` 与 v18 回填件；导出面逐字不变（`db.mjs` 零改） |
| `src/store/migrations/ddl-v1-v11.mjs` | 296 行（新建） | `DDL_V1`–`DDL_V11` 逐字搬迁（零语义） |
| `src/store/migrations/ddl-v12-v20.mjs` | 292 行（新建） | `DDL_V12`–`DDL_V20` 逐字搬迁 |
| `src/store/migrations/ddl-v21-v26.mjs` | 175 行（新建） | `DDL_V21`–`DDL_V25` 逐字搬迁 + 新增 `DDL_V26`（审计 CHECK 重建十八型，步序同 v24） |
| `bin/thincoder-server.mjs` | 306 行（+65） | 建限流器（`rateLimits.enabled: false` ⇒ 不限）+ `auditSecurity` 写入面；`tls_start` ∥ `cert_reload` ∥ `cert_reload_failed` ∥ `rate_limit_burst` 四 kind 接线 |
| `public/views-system-config.mjs` | 243 行（+77） | 「限流（匿名入口）」段三控件 + 段内独立错态位 + 前端阈值自校 |
| `public/views-audit.mjs` | 301 行（+29） | `security_event` 进型筛选枚举 + 安全事件行模板（四 kind → 三文案键） |
| `public/i18n-zh-system.mjs` ∥ `i18n-en-system.mjs` | 各 252 行（+18） | 限流段 6 键 + 安全事件 10 键（中英同步） |
| `test/publicnet.test.mjs` | 633 行（本批自持，收口删除） | 25 例（上轮 15 + 本轮 10） |

### 读数（本机 Windows，Node v24.19.0）

| # | 判据 | 命令 / 方式 | 结果 |
|---|---|---|---|
| ① | 限流命中（第 N+1 次被拒的形状） | 起服 `rateLimits: { authPerMin: 2 }` 后连打 `POST /api/login` | 第 1/2 次 401 ∥ 第 3 次 **429**，`retry-after: 4`，体 = `{"error":{"message":"请求过于频繁（auth 类端点限流，4s 后可重试）","type":"rate_limit_error","code":"rate_limited"}}`；第 4 次仍 429 |
| ② | `public` 类与豁免面（同一实例） | 同上 | `POST /api/hooks/git-sources/1` 三次 ⇒ 404 ∥ 404 ∥ **429**；`GET /healthz` 三次 ⇒ 200 ∥ 200 ∥ 200 |
| ③ | 四 kind 审计行 + v26 | 同库 `SELECT type, actor_name, detail` | 两行 `security_event`（actor = `server`）：`{kind:"rate_limit_burst", ip:"127.0.0.1", ruleClass:"auth", count:2, windowMs:60000, retryAfterS:4}` ∥ `{…, ruleClass:"public", count:2, …}`；`tls_start` ∥ `cert_reload` ∥ `cert_reload_failed` 三 kind 在 TLS 起服 / `SIGHUP` 换证 / 坏证用例中各断一行（含 `reason`） |
| ④ | 迁移 v26 | `migrate` 于 `:memory:`；v25 库升级径 | 空库 ⇒ `user_version = 26`、`SCHEMA_VERSION = 26`、26 段；存量 v25 库 + 一行旧审计 ⇒ 升级后行保留 1、`security_event` 可写、未知型被 CHECK 拒 |
| ⑤ | 拆分前后对照（行数 ∥ 导出面） | `wc -l` + 逐段字节比对 + `sqlite_master` diff | 拆分前 `migrations.mjs` **799 行**（26 段常量全在同档）；拆分后 **99 行** + `ddl-v1-v11` 296 ∥ `ddl-v12-v20` 292 ∥ `ddl-v21-v26` 175（均 <500）；**25 段 DDL 逐字节相同**（仅加 `export ` 前缀）；导出面 `MIGRATIONS` ∥ `SCHEMA_VERSION` ∥ `migrate` ∥ `readVersion` 不变；全链建库后 55 个 `sqlite_master` 对象与拆分前逐一相同，**唯一差异 = `audit_events` 表（v26 预期改动）** |
| ⑥ | `publicHost` 形判 | `validateTlsConfig` 直调 | `https://x` ⇒ 拒（`tls.publicHost 须为主机名（不含协议 ∥ 端口——端口用 tls.publicPort）`）；`x:8443` ⇒ 同拒；`tc.example.com` ⇒ 放行；缺位 ⇒ `null` |
| ⑦ | 全量测试 | `cd thincoder-server && node --test test/publicnet.test.mjs`；`node test/rc-resolve.mjs` | **25 例全绿**（含上轮 15 例）；`rc-resolve` 退出码 0（既有档未受扰） |

`git diff --stat`（12 档）：`+516 / −761`（减号大头 = `migrations.mjs` 的搬迁）；另 5 件未跟踪 = `src/gateway/limits.mjs`（96）· `src/store/migrations/`（296 + 292 + 175）· `test/publicnet.test.mjs`（633）。

### 决策与披露

- **限流复用取法（父侧铁律 1 压过设计档写法）**：设计档 §2 写「自建 `Map<class|ip>` + 惰性清扫」，父侧铁律要求「复用 `ratelimit.mjs`，不许写第二套」。取法 = 计数引擎直接用 `createRateLimiter`，`limits.mjs` 只补规则匹配 ∥ 触限聚合 ∥ 按窗重建引擎；匿名 IP 空间无界而引擎桶 Map 不回收，故窗号一变即换引擎（旧窗计数本就作废），内存只承载当前窗——与设计档「惰性清扫」的目的同效，且计数实现只剩一份。
- **拆分 = 行区间逐字搬迁（脚本提取，已逐段验真）**：搬迁是零语义操作，按 `const DDL_Vn` 与其前置 JSDoc 切块生成三档；随后逐段与新档比对（25/25 逐字节相同，仅多 `export ` 前缀），并以全链建库的 `sqlite_master` 全量 diff 复核（唯一差异 = v26 审计表）。未做任何文本改写。
- **审计写失败 ⇒ `warn` 不反噬服务**：`auditSecurity` 自带 try/catch（限流回调在请求路径上，审计失败不能把 429 变成 500）；代价 = 审计面故障只在日志留一行 `security_audit_failed`。
- **限流判点单点落在 `gateway/server.mjs`**：设计档 §3 原列 `src/client/routes.mjs`「+判点 ≤+3 行」，实现把判点上收到服务层一处（同一张路由表只有一处入口），该档零改。
- **设计档漂移（`docs/**` 不在本席笔内，交设计席）**：① `PUBLICNET.md` §2 的 `auth` 类路径写作 `POST /api/accounts/login`，全仓无此路由，真实注册行是 `POST /api/login`；② 同节称会话 cookie「两处调用（`accounts/routes.mjs` ∥ `client/routes.mjs`）」，实情只有 `accounts/routes.mjs` 一处，`client` 面发 Bearer token，且函数实名是 `serializeSessionCookie`；③ `publicHost` 形判无设计档校验行、无 AC 行（实现严于文档）；④ `STORE.md` §2 无 v26 段，而代码注释以它作结构单源；⑤ `ACCOUNTS.md` §2.1 仍写「型面现状（v24）：十七型」，第十八型未进归属档；⑥ 受影响文件表的行数预算按实读普遍偏小。
- **两项待裁（父侧/用户口径，非本席可定）**：① `rate_limit_burst` 的 `detail.count` 现写「该类阈值」，页面文案渲染成「计数」，同 IP 同窗打 40 次也只显示阈值——设计档未定义该键语义，本席不自造；② 用户令点名的三件事里「鉴权拒绝」仍不入审计（`invalid_api_key` 只回响应，连日志行都没有），设计档 KD-PN-6 以「匿名无 actor + 量级」归日志面——是按设计收口还是补一条聚合型审计，须用户裁。
- **控制台面未做浏览器走查**：本轮只做机检（i18n 键中英各存在、控件与提交体对照设计 §9），页面观感留收口轮。

### 审计与评审轮次

- **内部偏离审计（explore 子代理，只读）**：VERDICT **changes-required**，但限定两项——AC-PN-10 的 PATCH 端到端实测缺位 ∥ E6「`Retry-After` 递减」只断整数未断方向；四类偏差里「部分实现 0（条目 2/3 的 AC 全落）· 静默简化 0（限流确为真实复用）· 越界改动 0 · 拆分导出面不变」。两项已在本轮补齐（`test/publicnet.test.mjs` 的 PATCH 用例与「不增」断言）。
- **独立代码评审（advisor，type=code）· 第 1 轮**：VERDICT **pass**，🔴 0 ∥ 🟡 8 ∥ 🔵 4（文档归属面滞后 5 条 · `count` 语义 · 鉴权拒绝口径 · 测试档体量与收口删除；另 4 条为 429 未排空请求体 · 默认阈用例墙钟依赖 · 行数预算漂移 · 批记录状态行）。
- **修正轮（1 轮，已核实）**：🔵 两条已修——429 早退补 `req.resume()`（沿重定向监听同形）∥ 默认阈用例先对齐固定窗窗首（余量 < 30 s 即等到新窗）。复跑 25/25 绿。
- **独立代码评审 · 第 2 轮（只核修正与不采纳项）**：VERDICT **pass**，两条 🔵 = Fixed；其余 10 条仍为 🟡/🔵 且本轮零理由未处理（文档面归设计席、两项待裁）——按规则一律记 Unfixed，不视为已闭环。
- **终态**：**clean**（代码面无未决阻断项；剩余项全是文档面与口径决策，已在交付报告逐条点名）。

## §6 验证与收口（父代理）

**验证与收口（2026-10-19 · 父代理）**

**① 机检门**：`doc_check(mode:"gate")` = **PASS**（会话重启后；全域 197 档 0 命中）。

**② 实施验证读数**（`cd thincoder-server && npm test` = **32/32**）：
- **TLS 三启动路径**：无 `tls` ⇒ http 200、零 `SIGHUP` 监听 ∥ `tls.enabled:false` ⇒ http 200 ∥ `tls.enabled:true` ⇒ https 200 且同端口明文失败、`SIGHUP` 监听增量 = 1
- **`SIGHUP` 换证**：轮换后新连接对端证书 CN = `rotated.localhost`；写坏证再 HUP ⇒ `cert_reload_failed`，**旧证继续服务**（CN 仍 `rotated.localhost`、200）
- **308 且 `Location` 取配置**：非默认 `publicPort: 8443` + 伪造 `Host: evil.example:9999` ⇒ `Location: https://tc.example.com:8443/x?y=1`；**POST 同样 308（方法保形）**
- **探针**：明文 200 ⇒ 退 0 ∥ 明文 503 ⇒ 退 1 ∥ TLS 200 ⇒ 退 0 ∥ TLS 支打明文端口 ⇒ 退 1（串内 `statusCode === 200`，**无 `r.ok`**）
- **限流（复用 `ratelimit.mjs` 计数引擎，无第二套）**：`第 1→401 ∥ 第 2→401 ∥ 第 3→429`（`retry-after: 4`）；`public` 类同形；`/healthz` 恒豁免
- **审计四 kind**：`tls_start` ∥ `cert_reload` ∥ `cert_reload_failed` ∥ `rate_limit_burst` 各有写入点、各断「恰一行」；迁移 **v26**（存量 v25 升级后行保留）
- **`migrations.mjs` 799 → 99**（拆三档 296/292/175）；**25 段 DDL 逐字节相同**；全链建库 `sqlite_master` 55 对象唯一差异 = `audit_events` 表
- **`publicHost` 形判**：`https://x` ∥ `x:8443` 拒启；`tc.example.com` 放行

**③ 单元测试零留存**：`test/publicnet.test.mjs`（633 行 / 25 例）与 `test/fixtures/tls/*.pem` **随本批收口删除**——本节读数是它们存在过的唯一凭证。

**④ 集成面**：服务启动/重定向/探针已由上述进程内驱用例覆盖；**无新增前端集成用例**。

**⑤ 修正轮落地前置**：交付轮内部审计 1 轮 + 独立代码评审 2 轮（均 pass）+ 修正 1 轮（429 早退补 `req.resume()` ∥ 默认阈对齐窗首）**已落**。

**⑥ 搁置清单回核**：无。**⑦ 暂缓批复核：无**。

**⑧ 用户文档面同拍**：控制台新增「TLS（内置）」段（六控件 + 前端自校 + 段内独立错态位 + 10 个 `system.cfgTls*` 键中英同步）——**配置项都有 UI 写面，已同轮落地**。

**⑨ 残留（已记账）**：`#1692`（`invalid_api_key` 不入审计 ∥ `rate_limit_burst.count` 记阈值非实际次数——**待用户裁**）。

**⑩ 判据留档**：本批六条铁律全部有读数，其中三条是「不读外部输入」类的安全判据：**`Location` 不读 `Host`**（伪造头验证）· **换证失败保旧证**（坏证验证）· **探针不用 `r.ok`**（本机复现恒假）。
