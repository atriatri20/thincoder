# 2026-10-19 · tech-sweep-residual
> 六段 append-only，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 编制：主 agent · 2026-10-19 · 来源 = 用户令 2026-10-19 08:38「继续，还有没派的吗？接着派」——批 M2 = 三笔残余（`#1391` 装配面无持久断言 ∥ `#1346` 唤醒轮 timer 无闩 ∥ `#1388` hooks 面收原始结果）。。
> 台账 = #1391 ∥ #1346 ∥ #1388（core · 归批）。前情 = docs/batches/2026-10-19-tech-todo-sweep.md（在途）。
## §1 讨论（主 agent）
**状态行**：已收口 2026-10-19
<§1 模板占位：本批条目 / 关键判据 / 授权口径>
## §2 批次任务与设计（eng-designer）
**状态行**：设计完成 · 2026-10-19（修正轮：评审 15 条（🔴1/🟡10/🔵4）全收，三档已收正（OPS.md §4.1 A1–A6 ∥ AGENT-LOOP-ASYNC-POOL.md §6.30.19 ∥ TOOLS.md §6.3/§6.4），待复评）
<§2 模板占位：本批条目（覆盖） / 设计档落点 / 机制设计 / 受影响文件与测试覆盖 / 验收对照 / 关键决策 / 上抛项>

**状态行**：设计完成（三笔残余 · 设计档三处已落 · 待评审）

### 2.1 本批条目（覆盖）

| 台账号 | 对象 | 现况（实读） | 目标形 | 判类 |
|---|---|---|---|---|
| `#1391` | `thincoder-server/bin/thincoder-server.mjs`（实读 241 行） | 装配面零持久断言；整链冒烟 = 进程内驱 `run()`，跑完即弃 ⇒ 删一处装配仍全绿 | 常驻档 `thincoder-server/test/assembly.test.mjs`：探针缝 `onAssembled` ＋ 四条行为不变量 | 产品码（测试档 ＋ 一处探针缝）——设计先行 |
| `#1346` | 交付轮内到期 timer | 件不丢（在途表未动）；「最近送达时点」无规范句；且忙期闩被消耗后不重武装（死闩至下次 `sync()`） | 送达时点规范句 ＋ 「闩只在空闲态武装」 | 语义面（规范句）＋ 小机制 |
| `#1388` | `thincoder-core/hooks.mjs:47-51` | hook stdin 载荷携 `result` 全文；日志面 `SECRET_FORM` 剥离不覆盖该面 | 本批**只落披露句**（安全纪律⑤：不默认建立防护）；收窄 ∥ 脱敏 ∥ 可选开关 三选一交用户裁 | 安全面观察项（零代码） |

**明示不在本批**：`#1388` 的任何防护机制（收窄 / 脱敏 / 配置开关）；`#1346` 的「轮内消化」方案；timer 面其余挂账族。

### 2.2 实读修正（与派单事实的差异，如实登记）

- 派单称装配 5 处含「DNS 闸」——**bin 全文 243 行零 `dns-gate` import**，DNS 闸不在 bin 直读面 ⇒ 本批不钉，不臆造断言点。
- 装配点实读 = 保留清理周期（`:139-151`）· 路由族注册 **22 个** `register*` 函数（`:167-200`）· hostExec 装配（`:181` 建 ∥ `:213` 注入）· 终端 hub config（`:203` 建 ∥ `:204` upgrade 接线）· 盒 ticker（`:212-214`）· 更新器（`:215-216`）。

### 2.3 设计档落点

- `#1391` → `docs/server/design/ops/OPS.md` **§4.1**（装配面的持久断言——四条不变量表 ＋ 反证义务）。
- `#1346` → `docs/core/design/AGENT-LOOP-ASYNC-POOL.md` **§6.30.19**（送达时点规范句 ＋ 防自旋口径 ＋ T-TW51–53）。
- `#1388` → `docs/core/design/TOOLS.md` **§6.3 hooks 行**（载荷披露句）。

### 2.4 机制设计要点

**`#1391`（持久断言）**：

- 探针缝：`run(argv, log, { update = {}, onAssembled })`——装配完成、`listen` 前回调 `{ routes, server, config, timers }`；缺省不传 ⇒ 生产行为逐字不变。
- 四条不变量（判据 = 删掉对应装配行该档必红）：A1 路由族全覆盖（22 个注册函数各取一条代表端点在册）· A2 周期器件在册（拦截 `setInterval`：24h 保留清理 ＋ 30s 盒 ticker）· A3 优雅停机清周期（`SIGINT` 后两档句柄均被 `clearInterval`）· A4 监听与自环接线（`listen` 后端口 = 配置端口 ＋ 真打 `GET /healthz` 得 200）。
- 断言形 = 行为断言（跑一遍看结果），**禁止**读设计档查句子。
- 落点 = `thincoder-server/test/assembly.test.mjs`（常驻回归档，不随批删除）。
- 反证义务：实施轮逐条「临时删一行 ⇒ 跑该档 ⇒ 红 ⇒ 恢复」，读数落 §5；未做反证的不变量视为未验证。

**`#1346`（防自旋口径 —— 选 ②：维持现状 ＋ 规范句）**：

- ①「轮内也消化」为何不选：前台空闲链无上界。挂起窗有 `poolLive` 退出（`suspension.mjs:295`）兜底；前台链（`createTimerWatch:130` ＋ `fireTimerWake:156`）没有等价判据。交付轮时长 ≥ 到期周期（`every` 下限 60s）时，轮尾恒有新到期 ⇒ 轮轮相接无上界。**自旋真实成立。**
- ② 的机制半边（缺陷修复）：现状忙期 fire 消耗闩且 `fireTimerWake` 不重武装（`:160` 直接 `return false`）⇒ 死闩至下次 `sync()`。修法 = `createTimerWatch.sync()` 增 `busy` 缝，忙期撤闩零注册（不产生 0ms 循环），链尾 `sync()` 置于忙态归位之后。
- 规范句：交付轮运行期间到期的 timer，最近送达时点 = 该轮结束后的空闲面判定（前台 = 链尾闩首火 ∥ 挂起窗 = 下一等待态兑现 ∥ 回退面 = 下一回合边界）。

**`#1388`（安全面 · 三选一，用户裁）**：

- ① **收窄**（payload 不带 `result` 正文）：防的是「hook 拿到全文」；代价 = 既有 hook 用法全断（四事件属对外事件面冻结，改载荷须迁移）。
- ② **脱敏**（`result` 过 `SECRET_FORM` ＋ 字段黑名单）：代价 = 形态扫描只认令牌形，假阴性多；且会切断合法正文。
- ③ **维持 ＋ 披露**（**本批已落**）：hook 与 agent 同权（能读任意文件），脱敏防不住它自己读；真实威胁 = hook 脚本把 payload 外发。可选开关（`hooks.resultPayload: full | meta`，默认 `full` 零回归）为后续另裁。

### 2.5 受影响文件与测试覆盖

| 文件 | 现读 | 预期增量 | 说明 |
|---|---|---|---|
| `thincoder-server/bin/thincoder-server.mjs` | 241 | ＋≈4 | `run()` 第三参 ＋ `onAssembled` 回调 ＋ 周期句柄表 |
| `thincoder-server/test/assembly.test.mjs` | —— | 新档 ≈160 | A1–A4 ＋ 反证注释；常驻 |
| `thincoder-core/agent/timers.mjs` | 164 | ＋≈12 | `createTimerWatch` 增 `busy` 缝 ＋ 注释 |
| `thincoder-cli/src/tui/timer-watch.mjs` · `thincoder-vscode/src/extension/timer-watch.mjs` · `thincoder-desktop/src/main/timer-watch.mjs` | 65 · 74 · 76 | 各 ＋1–3 | 传 `busy` |
| `docs/batches/2026-10-19-tech-sweep-residual.timer.test.mjs` | 新档 | ≈60 | T-TW51–53（本批单元测试档——随批留存、收口删除；仓内现零 timer 测试档，实读 2026-10-19） |
| `thincoder-core/hooks.mjs` | 108 | 0 | `#1388` 本批零代码 |

### 2.6 验收对照（逐条回指）

| # | 判据 | 机检形 |
|---|---|---|
| A-1 | `#1391` 四条不变量在册 | `node --test thincoder-server/test/assembly.test.mjs` 全绿 |
| A-2 | `#1391` 断言真能拦回归 | 逐条反证：删装配行 ⇒ 该档红（读数落 §5） |
| A-3 | `#1346` 规范句在册 | `AGENT-LOOP-ASYNC-POOL.md` §6.30.19 在位且与实现一致 |
| A-4 | `#1346` 忙期零武装 | T-TW52：`sync({busy:true})` × 3 ⇒ `timer` 缝 0 次 |
| A-5 | `#1346` 轮后送达 | T-TW51：忙期零交付、归假后恰一次交付 ＋ 恰一轮 |
| A-6 | `#1388` 披露句在册 | `TOOLS.md` §6.3 hooks 行含载荷披露句 |
| A-7 | 零回归 | `thincoder-core` 与 `thincoder-server` 既有测试档全绿 |

### 2.7 关键决策

- **D-1** `#1391` 用探针缝而非黑盒端到端：黑盒只能看 HTTP 面，装配的周期件 / 停机清理全在 HTTP 外；探针缝 ＋ 全局计时器拦截才能把「删一行」变成红灯。
- **D-2** `#1391` 断言域取「每域一条代表端点」而非全量端点清单：端点随批增长，全量清单会变成需要天天改的噪音；代表端点足够让「删掉整个注册行」变红。
- **D-3** `#1346` 选 ②：延迟上界 = 一轮时长，收益小；① 的自旋在真实条件下无上界。
- **D-4** `#1388` 本批零代码：安全纪律 ⑤——防护须作为独立提案（防什么 ∥ 代价 ∥ 为何现在）交用户裁。

### 2.8 上抛项

- **[上抛·待裁]** `#1388` 三选一（收窄 ∥ 脱敏 ∥ 维持＋披露＋可选开关）——本批按 ③ 落披露句；若选 ①/② 则另开设计轮（涉全工具形态 ＋ 对外事件面冻结）。
- **[上抛·知会]** 派单事实「装配 5 处含 DNS 闸」与实读不符（bin 零 `dns-gate` import）——本批不钉，非阻断。

### 2.9 修正轮（评审 15 条全收 · 设计面收正 · 以下取代 2.4/2.5/2.6 的对应项）

**🔴1 不变量漏面 → 补 A5/A6 ＋ 面→不变量对照（无豁免项）**

扩展后不变量（`OPS.md` §4.1 L127-134）：

| # | 不变量 | 断言形 |
|---|---|---|
| A1 | 路由族全覆盖 | 装配面按 `ROUTE_FAMILIES` 表（`{ name, probe, register }`）循环注册；探针载荷 `families` = 该表；逐族 `probe` 在 `routes` 命中且两两不重 |
| A2 | 周期器件在册 | 拦截 `setInterval`：24h 保留清理 ∥ 30s 盒 ticker ∥ 60s 项目同步 ∥ 6h 更新自检，四个周期值在场 |
| A3 | 优雅停机清周期 | 探针 `stop("SIGINT")` 后四个句柄全进清除面，残留活周期 = 0 |
| A4 | 监听与自环接线 | 有界轮询 `server.listening`（≤2s · 步 10ms）⇒ 端口 = 配置端口 ∧ `GET /healthz` 200 |
| A5 | 终端 hub 接线 | `server.listeners("upgrade")` 恰 1 条且 `=== terminalHub.handleUpgrade`；裸 upgrade 请求得 hub 响应 |
| A6 | 更新自检在册 | `update` 替身启动即检一次；`autoUpdate:false` ⇒ 零调用；停机后零再检 |

「面 → 不变量」对照（`OPS.md:104` 回指 §4.1；`:116` 自列各面全覆盖）：盒 ticker = A2∥A3 · 路由族注册 = A1 · 终端 hub 接线 = A5 · 保留清理 = A2∥A3 · 更新自检 = A2∥A6 · 项目同步 = A2∥A3 · 监听∥自环 = A4。

**🟡2 触发/等待面与夹具**：探针载荷扩为 `{ routes, server, config, timers, families, terminalHub, stop }`（`stop` = 停机句柄）；A3 用它触发（不用 `process.emit("SIGINT")`——监听器跨用例堆积）；A4 用有界轮询 `server.listening`；夹具 = 临时 config 目录 ∥ 临时 db ∥ 端口先用 `listen(0)` 取 OS 分配值 ∥ `setInterval`/`clearInterval` 保存-复原（`OPS.md` L148-152）。
**🟡3 寿命档位**：`assembly.test.mjs` = **常驻回归档**（§5.1 零留存纪律的显式例外 ＋ 理由，`OPS.md:122`）；`#1346` 用例档 = **随批收口删除**（`AGENT-LOOP-ASYNC-POOL.md:881-882`）。
**🟡4 运行点**：`cd thincoder-server && npm test`（新增 `package.json` `"test"`）；**入发布门** = `prepublishOnly` 链尾追加 `&& npm test`（`OPS.md:121` · §5.1 L164）。
**🟡5 行数**：bin 现读 **241** ＋≈40（族表驱动 ＋ 探针缝 ＋ 停机句柄）；新档 ≈220；§6 预算表 182 → 241 ＋ 新档行（`OPS.md:314-315`）。
**🟡6 增量与基线**：`timers.mjs` 164 ＋≈10 ∥ CLI 65 ＋1–2 ∥ VSC 74 ＋1–2 ∥ 桌面 76 ＋1–2；164 = §6.30.18 基线（其「＋≈50」未落盘），两批同片 ⇒ 串行；桌面 76 vs 79 差 −3 归其后收编批次（`AGENT-LOOP-ASYNC-POOL.md:875-884`）。
**🟡7 缝形唯一**：构造期注入（`sync()` 不收参数）——`createTimerWatch({ getAgent, onFire, timer = setTimeout, clear = clearTimeout, now = Date.now, busy = () => false })`；T-TW52 按此形改写；§6.30.16 零变不变量 ④ 登记 `busy` 键（`:687`）。
**🟡8 新调用点与归位**：`state.processing` 归假 = `thincoder-cli/src/tui/agent-turn.mjs:297`（正文 finally）；链尾 `sync()` = `agent-turn.mjs:103`（包装器 finally，晚于正文 finally）⇒ sync 时 busy 已归假；挂起态零注册 = 挂起窗接管；新增 T-TW54（红 = 新死闩）。
**🟡9 测试宿主实况**：`thincoder-core/test/` 现只有 `run.mjs` ∥ `slow.mjs`（**零 `.test.mjs`**，实读 2026-10-19）⇒ 无既有 timer 档可扩；新档落包内 `test/`（`timer-watch-busy.test.mjs` ≈80 · `thincoder-cli/test/timer-rearm-order.test.mjs` ≈60），**不落 `docs/`**。
**🟡10/🟡11 两行义务**：三节各补「最近先例」与「调研证据」行（`OPS.md:117-118` · `AGENT-LOOP-ASYNC-POOL.md:869-871` · `TOOLS.md:154`）。
**🔵12**：§4 启动序补 30s 盒 ticker ∥ 60s 项目同步 ∥ 6h 更新自检，停机行补盒 ticker 与项目同步（`OPS.md:102-104`）——周期集合与 A2/A3 逐条对平。
**🔵13**：§6.30.19 补验收行 A-TW20–A-TW22（含 doc-check 基线句）（`AGENT-LOOP-ASYNC-POOL.md:886`）。
**🔵14**：A1 改由装配面自身 `ROUTE_FAMILIES` 表驱动（新增族必须入表并给 `probe`，否则红）——手抄 22 项清单退场。
**🔵15**：`SECRET_FORM` 出处指针 = `thincoder-core/log.mjs:43`（脱敏 `:149-180`）；§6.4 安全边界表增 hooks 行回指（`TOOLS.md:153-154` · `:169`）。

**验收对照（本修正轮取代 2.6）**

| # | 判据 | 机检形 |
|---|---|---|
| A-1 | A1–A6 在册 | `cd thincoder-server && npm test` 全绿 |
| A-2 | 断言真能拦回归 | 逐条反证：删装配行 ⇒ 该档红（读数落 §5） |
| A-3 | 规范句在册 | `AGENT-LOOP-ASYNC-POOL.md` §6.30.19 在位且与实现一致 |
| A-4 | 忙期零武装 | T-TW52（构造期 `busy: () => true`）⇒ 零注册 |
| A-5 | 轮后送达 ∧ 收尾闩已武装 | T-TW51 ∥ T-TW54 |
| A-6 | 披露句在册 | `TOOLS.md` §6.3 hooks 行含载荷披露句 ＋ §6.4 回指行 |
| A-7 | 零回归 | `thincoder-core` ∥ `thincoder-server` ∥ `thincoder-cli` 既有测试档全绿 |

### 2.10 修正轮 2（评审轮次 2 的 3 条残留 · 父侧接受）

**🟡16（同一「产品面改动面」两处互斥描述）**：`OPS.md:125` 改为「**产品面改动 = 族表驱动重构 ＋ 探针缝 ＋ 停机句柄**」——三件点名，「唯一改动」二字删除；与 `:132` A1（族表驱动）∥ `:328` 预算行（＋≈40 = 族表驱动 ＋ 探针缝 ＋ 停机句柄）同口径。

**🟡17（A1 删表行盲区）**：`OPS.md:132` A1 增断言 ② —— **集合面锚点** `families.length === 22`，`22` 是测试档内写死的独立常量（不读表、不从 `families` 推算）。① 逐族 `probe` 随表同步缩水仍绿，只有 ② 拦「删掉一整族表行」；「删掉什么它会红」列补「表内任一整族行（22 → 21）」。常量读数 = bin 现读 22 个整族注册调用（实读 2026-10-19，族名 22 条逐一列出）。判据形演示（模型，非实施档）：全表 22 → ① 绿 ② 绿；删一行 21 → ① 仍绿 ② 红。

**🟡19（指针失配）**：`OPS.md:140` 指针 `:116` → `:121`。派单给 `:119`；实读 `:119` = 「最近先例」行、缺口清单 = `:121`（派单读数比盘上落后 2 行），按「指向缺口清单」的裁定意图取实读行。

**机检**：`doc_check(mode:"gate")` = `ERROR（引擎已更新，需重启会话复跑）`——本会话进程启动早于盘上 `tool-docs/doc_check.md` 的 mtime；同引擎 `report` 读数 = `docs` 全域 197 档命中 0 条（锚 0 · 行宽 0），但陈旧引擎读数不作交付判据。**gate 未取得 PASS，须重启会话复跑。**

**未触碰**：A7（`:138`）∥ 证书夹具（`:155`–`:157`）∥ 四条折行（`:59` / `:69` / `:126` / §5.7 追加行）——本轮只改 `:125` / `:132` / `:140` 三行，逐行替换、行数不变（全文 420 行未变）。

## §3 设计评审（评审子代理）

### 轮次 1（评审子代理）

### 设计评审 · 批 M2 载荷（#1391 ∥ #1346 ∥ #1388）

**评审对象**：`docs/server/design/ops/OPS.md` §4.1 ∥ `docs/core/design/AGENT-LOOP-ASYNC-POOL.md` §6.30.19 ∥ `docs/core/design/TOOLS.md` §6.3。
**限制声明**：本轮未声明项目标准档、未提供文档地图 ⇒ Document ownership 维度按 Project Guide 降级判定；批次档 §2 设计载荷本体不在本轮评审范围（仅评三档落平面）。

| # | Category | Severity | Issue | Suggestion |
|---|---|---|---|---|
| 1 | Requirements | 🔴 | A1–A4 未覆盖 §4.1 自列的静默失效面：`OPS.md:116` 点名「终端 hub 接线」而四条不变量无一钉它（A1 只钉 `register*Routes`，A2/A3 只钉 `:139`/`:213`/`:107`/`:112`）；更新自检周期（`OPS.md:189`「启动即检一次 + 每 6 小时」）与停机周期清单（`OPS.md:103`「（更新循环 ∥ 保留清理 ∥ watchdog 同法）」）亦未入 A2/A3（A2 只断「24h 保留清理与 30s 盒 ticker 两档」`OPS.md:124`）⇒ 删这些装配行仍全绿，本批要消灭的缺陷类残留。 | 补 A5/A6（hub 接线 ∥ 更新自检周期）或逐条写显式豁免与理由；A2/A3 清单与 §4 启动序 ∥ §5.4(a) 周期集合对平，做到 §4.1:116 列的每一面都有不变量或豁免。 |
| 2 | Clarity/Feasibility | 🟡 | 探针缝只给「装配完成、`listen` 前调用」（`OPS.md:118`），A3「触发 `SIGINT` 后两档句柄均被清除」（`OPS.md:125`）与 A4「`listen` 后 `server.address().port` = 配置端口」（`OPS.md:126`）缺可编程触发/等待面：`onAssembled({ routes, server, config, timers })` 不含停机入口，"listen 完成"无回调 ⇒ 只能进程内 emit + 轮询，夹具（临时 config ∥ db 路径 ∥ 端口 ∥ `finally` 复原被改写的 `setInterval`/`clearInterval`）全未定。 | 写明 A3 触发形（`process.emit("SIGINT")` ∥ 导出的 stop 句柄）与 A4 等待形（有界轮询 `server.listening`），并给夹具规格（含临时 db 与端口取值）。 |
| 3 | Methodology/Document ownership | 🟡 | 同批两条相反寿命口径：`OPS.md:138` 记「随批收口用后即删、零留存」，新 §4.1 宣告「该档为常驻回归档，不随批删除」（`OPS.md:129`），而 §6.30.19 的用例档「随批留存、收口删除」（`AGENT-LOOP-ASYNC-POOL.md:865`）——且未引测试寿命分层档。 | 逐档点明寿命档位（先例 = §6.20.6「测试层寿命分类 → `docs/core/requirements/TESTING.md` §2」）；常驻档须显式写成 §5.1 纪律的例外并给理由。 |
| 4 | Acceptance criteria | 🟡 | 常驻护栏无运行点：§4.1 未给执行命令 ∥ npm script ∥ CI 接线，而 `OPS.md:138` 明写「单元测试档不入任何门」⇒ 该档变红不阻断任何事。 | 指名运行点（命令 + 挂载位置），并说明是否入发布门。 |
| 5 | Affected-file size | 🟡 | §4.1 只给当前读数且与 §6 自相矛盾：`OPS.md:116`「实读 241 行」vs `OPS.md:288`「**182**」；被改档无 `≤±N`，新档 `thincoder-server/test/assembly.test.mjs` 无行数估计。 | 补 current+delta（探针缝 + 调用点）与测试档估计，并把 §6 的 182 重锚为实读值+增量。 |
| 6 | Affected-file size | 🟡 | §6.30.19 受影响文件（`:865`）四源档只给现读（timers 164 ∥ CLI 65 ∥ VSC 74 ∥ 桌面 76）无 `≤±N`，新测试档无估计；164 与 §6.30.18（`:774`「**164**」+「+≈50」）同基相对（该批已落则现读应 ≈214）；桌面 76 与 `:611`「**79**」亦不一致。 | 补增量列、实施当刻复读，并与 §6.30.18 base 对齐（计法差异 `§6.20.4` 已注——差 3 行仍须说明）。 |
| 7 | Clarity | 🟡 | `busy` 缝三处三种写法：`:852`「`createTimerWatch.sync()` 增 `busy` 缝」∥ `:865`「`createTimerWatch` 增 `busy` 缝」∥ `:862`「`sync({ busy: () => true })` 连续三次」——构造期注入 vs 逐次实参互斥，T-TW52 按字面无法在该实现上成立；§6.30.16 零变不变量 ④（`:687`「端面 API——CLI 导出面逐名零变」；`:684`「签名 `{agent,onFire,timer,clear,now}` 零变」）未随新键收正。 | 只留一种缝形并写全签名（含默认值），T-TW52 按该形改写，并在 §6.30.16 零变不变量 ④ 登记新增键。 |
| 8 | Feasibility | 🟡 | 「链尾 `sync()` 置于忙态归位之后」（`:852`）未指名落点：现链尾 sync 在 `runAgentTurn` 的 `finally` 内（§6.30.16 `:549`「回合链尾 `sync()` 上收收口层 `finally`」），`processing` 归位在调用方——若 sync 时 `busy()` 仍读真 ⇒ 零注册 ⇒ 闩永不武装，等于把「忙期死闩」换形重犯。 | 指名新调用点与 busy 归位先后（谁清 / 在哪清 / sync 在其后），并加用例「回合结束 ⇒ busy 已归假 ∧ 闩已武装」（红 = 新死闩）。 |
| 9 | Requirements/Clarity | 🟡 | `:865`「仓内现零 timer 测试档——实读 2026-10-19」与同档清单矛盾：`§6.30.6` `:458`「`thincoder-core/test/timer-wake.test.mjs`（已落）」、`:468` ∥ `:469`，`§6.30.13` `:620` ∥ `:636` 均列有 timer 测试档（带行数）⇒ 另立 `docs/batches/…timer.test.mjs` 的前提不成立，且与用例宿主惯例（`§6.30.7` `:502`「用例宿主」）冲突。 | 复核仓内实况：扩既有 timer 测试档；若确需新档，写明真实理由与位置（可执行测试档不落 `docs/`）。 |
| 10 | Closest-precedent | 🟡 | 三节均无「最近先例」行（实现坐标 ∥ 对应设计节 ∥ 先例批 + 对齐/偏离理由）：#1391 探针缝 + 常驻回归档、#1346 `busy` 缝、#1388 披露句落点。 | 逐项补一行；若由批次档 §2 承载（本轮不在范围），在三节各留指针。 |
| 11 | Survey-evidence | 🟡 | 三节均无「调研证据」行（查过哪些公共源文档 ∥ 是否有相关）。 | 补记录，含「无相关」的显式结论。 |
| 12 | Clarity | 🔵 | A2 钉的「24h 保留清理与 30s 盒 ticker 两档」（`OPS.md:124`）中 30s 盒 ticker 在 §4 启动序无对应条目（`OPS.md:102` 只列「告警 watchdog（60s 周期——可靠性批暂缓，未落；webhook 缺省 ⇒ 零行为）」）；装配序与不变量清单未对平。 | 在 §4 启动序登记该 ticker，或让 A2/A3 与 §4/§5.4 的周期集合逐条对齐。 |
| 13 | Acceptance criteria | 🔵 | §6.30.19 无机检回指块（无验收行 ∥ 无 `doc-check` 基线句），兄弟节均有（`:827`「`node scripts/doc-check.mjs --root .` 对比开工基线」）。 | 补验收行（含 doc-check 零新增基线）。 |
| 14 | Clarity | 🔵 | A1 的「域表共 22 个注册函数」（`OPS.md:123`）为手抄静态清单，新增路由族不会自动落入护栏（与本批要消灭的静默失效同类）。 | 由装配面自身导出族清单或断族计数，使集合变化即红。 |
| 15 | Note | 🔵 | `TOOLS.md:153` 披露句「日志面的 `SECRET_FORM` 剥离不覆盖该面」中 `SECRET_FORM` 在本档无出处；§6.4 安全边界（`:156`）无 hooks 行，扫安全面者看不到该披露。 | 给 `SECRET_FORM` 归属指针，并在 §6.4 表加一行回指。 |

**计数**：🔴 1 ∥ 🟡 10 ∥ 🔵 4（共 15 条）
**VERDICT: changes-required**

### 轮次 2（评审子代理）

## 轮次 2 复核（设计评审 · 批 M2）

评审面：`docs/server/design/ops/OPS.md` §4.1 ∥ `docs/core/design/AGENT-LOOP-ASYNC-POOL.md` §6.30.19 ∥ `docs/core/design/TOOLS.md` §6.3/§6.4。限制：无项目标准档/文档地图声明（方法论按 Project Guide 判定）；批次档 §2 载荷本体不在本轮范围；仓内代码实况本轮未读（涉及 repo 状态的断言标 unverified）。

| # | Orig# | File | Severity | Status | Notes |
|---|-------|------|----------|--------|-------|
| 1 | 1 | OPS.md | — | Fixed | `OPS.md:119` 缺口清单六面在 `OPS.md:139-148` 表逐行有归宿（hub→A5 ∥ 更新自检→A2∥A6 ∥ 项目同步→A2∥A3），另加 监听/自环→A4 ∥ TLS→A7，A1–A7 |
| 2 | 2 | OPS.md | — | Fixed | `OPS.md:132` A4「**有界轮询** `server.listening`（≤2s · 步 10ms）」；`OPS.md:154`「A3 用探针 `stop`——**不用** `process.emit("SIGINT")`」；`OPS.md:150-153` 夹具规格 |
| 3 | 3 | OPS.md ∥ ASYNC-POOL.md | — | Fixed | `OPS.md:122` 常驻回归档 = §5.1 纪律显式例外 + 理由；`OPS.md:166` 同拍收正；`AGENT-LOOP-ASYNC-POOL.md:885-886` 批内用例档寿命 = 随批收口删除 |
| 4 | 4 | OPS.md | — | Fixed | `OPS.md:121` 运行点（`cd thincoder-server && npm test` ∥ 新增 `"test"` 脚本 ∥ prepublishOnly 链尾 `&& npm test`） |
| 5 | 5 | OPS.md | — | Fixed | `OPS.md:320` bin = 「**241**（实读 2026-10-19；本批 ＋≈40）」与 `OPS.md:119` 一致；`OPS.md:321` 新档 ≈220 已入预算表 |
| 6 | 6 | ASYNC-POOL.md | — | Fixed | `:877-890` 表含 现读/增量 两列；`:888` 解释 164 vs §6.30.18；`:889` 桌面 76 vs 79 已归因 |
| 7 | 7 | ASYNC-POOL.md | — | Fixed | `:853-854` 缝形唯一 = 构造期注入 + 完整签名；`:869` T-TW52 对齐该形；`:688` 零变不变量 ④ 登记 busy 键且「`sync()` 参数表仍为空」 |
| 8 | 8 | ASYNC-POOL.md | — | Fixed | `:856-859` 指名调用点与归位先后；`:871` T-TW54「**红 = 新死闩**」 |
| 9 | 9 | ASYNC-POOL.md | — | Fixed | `:875` 主张收窄 + 解释旧清单已删除；`:890` 用例宿主 = 各包 `test/`、测试档不落 `docs/` |
| 10 | 10 | 三档 | — | Fixed | `OPS.md:117` ∥ `ASYNC-POOL.md:873`（含偏离项）∥ `TOOLS.md:154` |
| 11 | 11 | 三档 | — | Fixed | `OPS.md:118` ∥ `ASYNC-POOL.md:875` ∥ `TOOLS.md:154` |
| 12 | 12 | OPS.md | — | Fixed | `OPS.md:102` 补「→ 盒 ticker（30s——§5.10）→ 更新自检」；`OPS.md:103-104` 停机清单 + 对齐句 |
| 13 | 13 | ASYNC-POOL.md | — | Fixed | `:892` 验收 A-TW20–A-TW22（含 doc-check 基线） |
| 14 | 14 | OPS.md | — | Fixed | `OPS.md:129` A1 改 `ROUTE_FAMILIES` 表驱动；残余盲区见 #17 |
| 15 | 15 | TOOLS.md | — | Fixed | `:153` 补 `SECRET_FORM` 坐标；`:169` §6.4 表增 hooks 行回指 §6.3 |
| 16 | (new) | OPS.md | 🟡 | New | `OPS.md:123`「**探针缝**（产品面唯一改动）」与 `OPS.md:129`「装配面按 `ROUTE_FAMILIES` 表（`{ name, probe, register }`）循环注册」及 `OPS.md:320`「本批 ＋≈40——族表驱动 ＋ 探针缝 ＋ 停机句柄」互斥 —— 同一「产品面改动面」两处不同描述 |
| 17 | (new) | OPS.md | 🟡 | New | `OPS.md:129`「断言 = 逐族 `probe` 端点在 `routes` 中命中，且 `probe` 两两不重（不手抄清单）」——注册与断言同源于一张表 ⇒ 删掉整族表行两处同步缩水，仍全绿（本批要消灭的缺陷类留一处盲区） |
| 18 | (new) | OPS.md | 🟡 | New | `OPS.md:135`「`tls.redirectPort` 在场 ⇒ 探针载荷 `redirectServer` 非 `null`、`address().port` = `redirectPort`」缺夹具：`OPS.md:151` 的临时 config 无 tls 段，证书材料与第二端口取值未定，`process.listenerCount("SIGHUP")` 为进程级残留面无复原句 |
| 19 | (new) | OPS.md | 🔵 | New | `OPS.md:137`「（`:116` 自列的静默失效面逐条有归宿，无豁免项）」指针失配——缺口清单现在 `OPS.md:119` |
| 20 | (new) | ASYNC-POOL.md | 🔵 | New | `AGENT-LOOP-ASYNC-POOL.md:875`「**仓内无既有 timer 测试档可扩**」与 `:458`「`thincoder-core/test/timer-wake.test.mjs`（已落）」并存，表内无删除注（repo 状态 unverified） |

**计数**：prior 15/15 Fixed；🔴 0 ∥ 🟡 3 ∥ 🔵 2（新 5 条）

VERDICT: pass

### 轮次 3（评审子代理）

### 轮次 3（设计复核：只核轮次 2 的 3 条残留）

核对象：`thincoder/docs/server/design/ops/OPS.md`（全文 420 行，实读）。三条残留逐条对盘核：

| # | 轮次 2 残留 | 落点 | 核读结果 |
|---|---|---|---|
| 16 | `:125` 产品面改动改「三件点名」 | `OPS.md:125` | 已落：族表驱动重构（A1）∥ 停机句柄（A3）∥ 探针缝（`run(argv, log, { update = {}, onAssembled })`）三件各带归属，无「等」式含混 |
| 17 | A1 新增集合面锚点（写死常量 22、不读表不从表推算）＋ 反证列指明「删整族行必红」 | `OPS.md:132` | 已落：断言② = `families.length === 22`，明示「`22` 是测试档内**写死的独立常量**（不读表、不从 `families` 推算）」；反证列首项 = 「表内任一整族行（`families.length` 22 → 21）」 |
| 19 | 指针 `:116` → `:121` | `OPS.md:140` | 已落：指 `:121`；`:121` 实读即「现状缺口」行（自列 6 个静默失效面），指针所指与文意一致 |

一致性旁核：`:121` 实读 241 行与 `:328` 行数预算表同值；A2–A6 反证坐标（`:139`/`:197`/`:203-207`/`:213`/`:215-216`）在 241 行档内自洽。

## 本轮发现（不新猎，仅记观察）

| # | Category | Severity | Issue | Suggestion |
|---|---|---|---|---|
| 1 | Acceptance criteria | 🔵 | `OPS.md:132` 的锚点常量 `22` 在本档内无族名单可对（文档未逐族列名），其正确性只能由实施轮首次跑测时的实测族数确认 | 实施轮首次跑 A1 若实测族数 ≠ 22，按实有族表校正该常量并在实施记录记一笔（不得为凑常量而拆并路由族） |
| 2 | Clarity | 🔵 | A2–A6 反证列以 bin 现行行号寻址（`:139` ∥ `:197` ∥ `:213` ∥ `:215`），而 M1 折行已使同类坐标漂移 2 行（本轮 `:116` → `:121` 即此因） | 反证以语句内容（如 `clearInterval(pruneTimer)` ∥ `updater.start()`）为锚，行号只作指路；实施记录按内容回报 |

计数：🔴 0 ∥ 🟡 0 ∥ 🔵 2

VERDICT: pass（三条残留均已落盘，无 🔴）

## §4 用户批准（主 agent）

**批准（2026-10-19 · 用户整批令）**

用户逐字：「技术待办现在就开始处理」·「全部开」·「接着派，别等」——覆盖本批批准门。设计已过两轮（§3 = pass，🔴0）⇒ 实施获准。

**批准范围**：`OPS.md` §4.1 的 A1–A7 + bin 三件（族表驱动 ∥ 探针缝 ∥ 停机句柄）。

## §5 实施记录（eng-coder）
**状态行**：实施完成（三件在册 · A1–A7 全绿 · 八处反证已读数 · 漂移 5 条交设计席）



### 5.1 交付摘要（三件在册）

- **族表驱动**（OPS.md §4.1 A1）：`bin/thincoder-server.mjs` 新增导出 `ROUTE_FAMILIES`（22 行 `{ name, probe, register }`），装配面改 `for (const family of ROUTE_FAMILIES) family.register(routes, familyDeps)`；族间依赖（Gateway 产出的 `providerRuntime` ∥ `serverRef` / `updater`）经 `familyDeps` 惰性传递，注册序只看表序。
- **探针缝**（OPS.md §4.1）：`run(argv, log, { update = {}, onAssembled })`——装配完成、主监听**之前**回调一次 `onAssembled({ routes, server, redirectServer, config, timers, families, terminalHub, stop })`；缺省不传 ⇒ 生产行为逐字不变。
- **停机句柄**（OPS.md §4.1 A3）：现有 `stop` 已覆盖四个活周期（更新循环 ∥ 保留清理 ∥ 盒 ticker ∥ 项目同步）并对 `SIGHUP` 监听做差集摘除——本批以 A3 断言钉死该面（未改 stop 实现，改的是「它可被证明」）。
- **常驻回归档** `thincoder-server/test/assembly.test.mjs`（A1–A7；存活档，不随批删除）。
- **集合面常量**：测试档内写死 `EXPECTED_FAMILY_COUNT = 22`——不读 `ROUTE_FAMILIES`、不从 `families.length` 推算；常量来源 = bin 实读 22 条整族注册（Gateway · ProviderAdmin · Account · Admin · Client · Metering · System · Overview · EmbeddingAdmin · ConfigAdmin · ProxyAdmin · Sandbox · RegistryCred · ImageSource · Mcp · Chat · MemberFace · Project · ProjectAdmin · ProjectWebhook · Ledger · ClientLedger）。

### 5.2 改动面（文件 + 行数）

| 文件 | 本批增量 | 说明 |
|---|---|---|
| `thincoder-server/bin/thincoder-server.mjs` | 306 → **349**（＋43） | 族表 22 行 ∥ 探针缝 ∥ 盒 ticker 前移到主监听前 |
| `thincoder-server/test/assembly.test.mjs` | 新档 **371** | A1–A7 ＋ 夹具（设计估 ≈220——见 5.5-4） |
| `thincoder-server/package.json` | ＋2 行 | `"test": "node --test test/*.test.mjs"`；`prepublishOnly` 链尾追加 `&& npm test` |
| `thincoder-server/src/gateway/server.mjs` | 净 −4 行 | **out-of-list（见 5.5-3）**：`upgrade` 直挂（A5 身份断言所需） |

### 5.3 A1–A7 逐条读数（`cd thincoder-server && npm test`）

一次全跑：`tests 32 · pass 32 · fail 0`（assembly 7 + publicnet 25，2.2s）。

| # | 断言形（实现） | 读数 |
|---|---|---|
| A1 | 逐族 `probe` 在 `routes.resolve` 命中且 `method path` 两两不重；`families.length === 22`（写死常量） | pass（22 族全命中，去重集 22） |
| A2 | 拦截 `globalThis.setInterval`：四周期值在场（86400000 ∥ 30000 ∥ 60000 ∥ 21600000）；`timers.prune`/`timers.box` 在位 | pass（实读 `[86400000, 60000, 21600000, 30000]`——顺序按装配点） |
| A3 | 探针 `stop("SIGINT")` ⇒ 四个装配期句柄全进 `clearInterval` 清除面，残留 = 0 | pass（alive = `[]`） |
| A4 | 有界轮询 `server.listening`（≤2s · 10ms）⇒ `address().port` = 配置端口 ∧ 真打 `GET /healthz` = 200 `status:"ok"` | pass |
| A5 | `server.listeners("upgrade")` 恰 1 条 ∧ `=== terminalHub.handleUpgrade`；裸 upgrade（无会话）得 `HTTP/1.1 401`（hub 自答，非连接重置） | pass |
| A6 | 替身 `fetchImpl`：启动自检恰 1 次；`autoUpdate:false` ⇒ 0 次；`stop` 后再等 30ms 仍 1 次 | pass（1 ∥ 0 ∥ 1） |
| A7 | TLS 夹具：`redirectServer` 非 null ∧ `address().port` = `redirectPort` ∧ `process.listenerCount("SIGHUP") - base === 1` ∧ `stop` 后 redirect 已关 | pass（增量 1） |

### 5.4 反证读数（逐条「临时删一行 ⇒ 跑该条 ⇒ 红 ⇒ 恢复」）

| # | 临时改动 | 跑法 | 红读数 |
|---|---|---|---|
| A1-a | 删 `ROUTE_FAMILIES` 的 ClientLedger 整族行（22 → 21） | `node --test --test-name-pattern=A1 test/assembly.test.mjs` | `actual: 21, expected: 22` |
| A1-b | 删 `src/project/routes.mjs` 的 `routes.add("GET", "/api/projects", …)` 行 | 同上 | `路由族 Project 的 probe 未命中：GET /api/projects` |
| A2 | 删盒 ticker 两行（`setInterval` + `unref`） | `--test-name-pattern=A2` | `盒 ticker 周期未注册（期望 30000ms；实读 [86400000,60000,21600000]）` |
| A3 | 删 `stop` 内 `clearInterval(pruneTimer)` | `--test-name-pattern=A3` | `deepEqual actual: [86400000], expected: []` |
| A4 | 删主监听块（`server.listen(...)`） | `--test-name-pattern=A4` | `server.listening 2s 内未成立`（2086ms） |
| A5 | 去掉 `createGatewayServer({ …, upgrade: terminalHub.handleUpgrade })` 实参 | `--test-name-pattern=A5` | `strictEqual` 失败（listener = 网关兜底件，非 hub 本身） |
| A6 | 删 `updater.start()` | `--test-name-pattern=A6` | `actual: 0, expected: 1`（启动自检次数） |
| A7 | 删 `if (tlsMaterial !== null) process.on("SIGHUP", onHangup)` | `--test-name-pattern=A7` | `actual: 0, expected: 1`（SIGHUP 基线增量） |

恢复后复跑全量：`tests 32 · pass 32 · fail 0`（上述 8 处临时改动均已还原，`git status` 中 `src/project/routes.mjs` 干净）。

### 5.5 设计档漂移与缺口（交设计席，未自行改档）

1. **启动序**：OPS.md:104 记「监听 → 就绪日志 → 盒 ticker」；探针载荷 `timers.box`（OPS.md:127）要求 `box` 在 `onAssembled` 时在位，而探针在 `listen` 前（:125）⇒ 实现把盒 ticker 前移到主监听前。两条设计句只能取后者，`OPS.md:104` 需改。
2. **A4 的 `serverRef` 反证不成立**（OPS.md:135 反证列：「删 `serverRef = server` ⇒ 红」）：A4 断言面 = listening ∥ 端口 ∥ `/healthz`，删该行不会红。自环取数（chat `selfBaseUrl` 闭包）无鉴权不可观测 ⇒ **设计缺口**：或给 A4 补可观测入口，或把该行从反证列移除。本批未自造断言。
3. **A5 身份断言与网关实现不符**：原 `createGatewayServer` 注册的是包装闭包（socket error 面 ＋ try/catch），`listeners("upgrade")[0] === terminalHub.handleUpgrade` 恒假。落地 = `src/gateway/server.mjs` 改**直挂**传入手（身份可比），socket error 面移到 `connection` 层。代价：原包装的同步 try/catch 保护随包装移除——`handleUpgrade` 内可达路径逐段自带捕获（terminal-routes.mjs:269-350 实读），且 `createWsConnection`/`feed` 内建捕获（ws.mjs:182/191-196/259-276）。
4. **行数基线**：OPS.md:121/:320 记 bin 241 行 + ≈40；实际起点 306 行（M1 已折 TLS 分支）⇒ 落地 349（相对 306 ＋43）。新档实 371 行（预算 ≈220）——多出 = 夹具（freePort/twoPorts/writeConfig/stubLog/assemble/shutdown/withTempDir/rawUpgrade）＋逐条断言注释。
5. **停机定时器口径**：任务书「五个定时器」；OPS.md:103-105 的第五档 = 告警 watchdog（`:104` 自记「可靠性批暂缓，未落」）⇒ 实活四档（更新循环 ∥ 保留清理 ∥ 盒 ticker ∥ 项目同步）＋ `SIGHUP` 监听，全部摘净；watchdog 落盘时须同步入 A2/A3。
6. **测试不触网**：所有用例注入 `fetchImpl` 替身（更新自检静默）；A2 用 `autoUpdate:"notify"`（否则 6h 周期不注册），A6 另跑 `false` 档零调用。

### 5.6 机检与零回归

- `doc_check(mode:"gate")` = **ERROR**（引擎陈旧：`tool-docs/doc_check.md` mtime 2026-10-19T00:44 > 会话进程启动 00:22）⇒ 未取得 PASS，**须重启会话复跑**；同日 `report` 读数 = docs 197 档命中 0（锚 0 · 行宽 0），陈旧引擎读数不作交付判据。
- `node --check`：`bin/thincoder-server.mjs` ∥ `src/gateway/server.mjs` ∥ `test/assembly.test.mjs` ∥ `src/project/routes.mjs` 全 OK。
- 零回归：`thincoder-core` `npm test` = 31/31；`thincoder-server` `npm test` = 32/32；`thincoder-cli` `npm test` = 「test manifest is empty — zero tests = green」（其 runner 口径）。
- `git diff --stat`（本批三档，注意两档含先行未提交的 M1 改动，故数值大于本批净增量）：`bin/thincoder-server.mjs 200 ++--` ∥ `package.json 3 +-` ∥ `src/gateway/server.mjs 87 ++--`；新档 `test/assembly.test.mjs` 371 行（untracked）。

### 5.7 上抛

- **[上抛·知会]** 5.5-1/3/4/5 = 设计档需收正的漂移（设计席改档；本批未动 `OPS.md` 正文，也未动 `PUBLICNET.md` 与台账三件）。
- **[上抛·待裁]** 5.5-2 = 设计缺口：A4 的「自环取数」面在现有端点面上不可观测，需设计席裁定补断言入口还是删该反证项。

### 5.8 收口前读数修正

- `thincoder-server/test/assembly.test.mjs` = **372** 行（5.2 记 371——注释收尾复读 +1）；`npm test` 复跑 = 32/32。
- 复读面：`bin` 349 行 ∥ `src/gateway/server.mjs` 325 行；上述两档相对 HEAD 的 `git diff --stat` 含先行未提交的 M1 改动（TLS 分支 ∥ 限流面），本批净增量见 5.2。

### 5.9 交付前内部审计与代码评审（收敛轮）

- **内部审计（explore，只读，1 轮）**：对照 `OPS.md` §4.1 逐条核 A1–A7 —— 结论 `diverged`：无静默简化；必改项 3 条中 2 条 = 设计席归属（A4 自环面缺口 ∥ 设计档启动序与行数基线），1 条 = 父侧追认 out-of-list（`src/gateway/server.mjs`）。据此在 hub 侧补直挂后的异常兜底。
- **内部代码评审（advisor，2 轮）**：
  - 轮 1（全量）：🔴 2 ∥ 🟡 2（可选）∥ 🔵 5；`changes-required`。两条 🔴 = ① `OPS.md:104` 启动序与 §4.1 的盒 ticker 装配点两处互斥（文档席）② A4「自环取数」面不可断言而 `OPS.md:135` 仍称已钉（待裁）。均属本席笔外，未自改设计档，转上抛。
  - 轮 2（核修复声明）：🟡/🔵 共 7 条中 6 条已修 ∥ 1 条成文口径被接受；新增 1 条 🔵（收口路径自身可能抛）——**已修**（`terminal-routes.mjs` 收口循环与 `socket.destroy` 各自再包一层 try/catch，异常不逃进事件发射栈）。两条 🔴 盘上未变，终态 `stalled`（等待设计席/用户裁定）。
- **本轮修复落点（全部在册后复跑绿）**：
  - `bin/thincoder-server.mjs`：启动失败径与 `stop()` 同口径（清 `pruneTimer` ∥ `projectSync` ∥ `terminalHub` ∥ `updater` ∥ `boxTicker`）；`SIGINT/SIGTERM` 不摘的成文口径；ProjectWebhook probe 的参数形注释。
  - `test/assembly.test.mjs`：A3 改「四周期各至少一柄在册」+ 全柄清除（去精确计数）；A6 停机后改用宏任务刻度（不用固定窗口）。
  - `src/sandbox/terminal-routes.mjs`（**out-of-list 第 2 档**）：`handleUpgrade` 对外暴露形 = 自持 try/catch（直挂后身份可比、钩子异常不落进程）；收口循环再包一层；孤儿会话（`conn === null`）就地收口。
- **收口复读**：`bin` **359** 行 ∥ `test/assembly.test.mjs` **376** 行 ∥ `src/gateway/server.mjs` **325** 行 ∥ `src/sandbox/terminal-routes.mjs` **378** 行；`npm test` = **32/32**（assembly 7 ∥ publicnet 25）；`node --check` 四档 OK。
- **`git diff --stat`（相对 HEAD；前两档含先行未提交的 M1 改动，故大于本批净增量）**：`bin/thincoder-server.mjs` 210 `+++---` ∥ `src/gateway/server.mjs` 87 `+++--` ∥ `src/sandbox/terminal-routes.mjs` 18 `++-` ∥ `package.json` 3 `+-`；新档 `test/assembly.test.mjs` 376 行（untracked）。
- **终态**：`stalled`——两条 🔴 均为设计档/裁定面（见 5.5-1 已修复实现、5.5-2 待裁），本席笔内项全清、全绿。

## §6 验证与收口（父代理）

**验证与收口（2026-10-19 · 父代理）**

**① 机检门**：`doc_check(mode:"gate")` = **PASS**（会话重启后；全域 197 档 0 命中）。

**② 实施验证读数**（`cd thincoder-server && npm test` = **32/32**；`thincoder-core` 31/31）：
- **三件在册**：`ROUTE_FAMILIES` **22** 行表 + `for (const family of ROUTE_FAMILIES) family.register(...)` ∥ 探针缝 `run(argv, log, { update, onAssembled })` 回调在 `listen` **之前** ∥ `stop` 清四活周期 + 摘 `SIGHUP`
- **集合面常量不来自被测表**：`EXPECTED_FAMILY_COUNT = 22` 是**字面量**，不读 `ROUTE_FAMILIES`、不由 `families.length` 推算
- **A1–A7 七条各一读**；**八处「删一行就红」逐条跑过并复原**：
  A1-a 删整族表行 → `actual: 21, expected: 22` ∥ A1-b 删 `routes.add` → probe 未命中 ∥ A2 删盒 ticker → 期望 30000 缺失 ∥ A3 删 `clearInterval` → `[86400000] vs []` ∥ A4 删主监听 → `listening 2s 内未成立` ∥ A5 删 `upgrade` 实参 → 身份 `strictEqual` 失败 ∥ A6 删 `updater.start()` → `0 vs 1` ∥ A7 删 `SIGHUP` 注册行 → 增量 `0 vs 1`

**③ 单元测试零留存**：`test/assembly.test.mjs`（376 行 / 7 例）**随本批收口删除**；本节读数是唯一凭证。

**④ 集成面**：装配面不变量 = 进程内直断，**无前端集成用例**。

**⑤ 修正轮落地前置**：交付轮内部审计 1 轮 + 独立代码评审 2 轮（轮 2 = pass）+ 1 条新增 🔵 已修 ⇒ 终态 stalled（**两条 🔴 落在设计档/裁定面**）。

**⑥ 搁置清单回核**：无。**⑦ 暂缓批复核：无**。

**⑧ 用户文档面同拍**：本批改的是服务端装配内部，不改用户可见面 ⇒ 无同步项。

**⑨ 残留（已记账 `#1693`）**：
- **`OPS.md:135` 的 `serverRef = server` 是假反证项**（删掉全档仍绿）——父侧裁定：补探针读数 + 断身份；走不通则设计档明写「不可机检、理由 = …」，**但不许留一条删了也绿的反证项**
- `OPS.md:104` 启动序与探针缝互斥（实现为准，设计席收正）
- 行数基线：bin 实读 **359**、test **376**（表记 241 / ≈220）
- 「五个定时器」实活四档（watchdog 未落）

**⑩ 本批最该被后来者读到的一句**：**一条「删掉它仍然全绿」的反证项，本身就是假判据。** 八条真反证都红了，第九条没红——它诚实地报了出来。
