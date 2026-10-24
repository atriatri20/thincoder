# 崩溃捕获与取证（CRASH-REPORTS）· CLI 面 · 设计

> 板块 = **崩溃捕获与取证**——CLI 进程崩溃时（含 JS 钩子拦不住的面：V8 原生 OOM / abort、外部终止）的**诊断留痕机制**。
> 配对需求档 = `docs/cli/requirements/CRASH-REPORTS.md`。
> 对位档 = **无**（VSC 端无对应能力——CLI 单端面）。

## 1. 取证物总览（四类 + 观测面）

| 取证物 | 触发 | 写入者 | 落点 | 命名 | 清理 |
|---|---|---|---|---|---|
| **堆快照** | 近堆上限 | Node（V8 回调） | TUI：`~/.thincoder/crash-reports/`；其余命令：进程 CWD | `Heap.<YYYYMMDD>.<HHMMSS>.<pid>.<thread>.<seq>.heapsnapshot` | TUI：30 天写时清理；CWD：手动 |
| **Node 诊断报告** | V8 fatal | Node | `~/.thincoder/crash-reports/` | `report.<YYYYMMDD>.<HHMMSS>.<pid>.<seq>.json` | 30 天写时自清理 |
| **JS 异常记录** | `uncaughtException` / `unhandledRejection` | `writeCrashRecord` | 同上 | `crash-<epochms>-<pid>.json` | 30 天写时自清理 |
| **TUI stderr 日志** | TUI 启动 | 包装父进程 tee | 同上 | `tui-stderr-<ts>-<pid>.log` | 30 天写时自清理 |
| **堆预警行**（观测面，非文件） | 堆用量跨阈值档 | `heap-watch.mjs` | stderr + TUI 行 + 事件日志 | 逐字见 §4.3 | 不落文件 |

**纪律（全族共守）**：取证能力本身**不得影响正常运行**（尽力面——各处独立 `try/catch`，失败静默）；
全部同步 API（崩溃路径无异步）。

## 2. 崩溃捕获链（既有面）

### 2.1 入口预建与 `process.report` 启用

- **调用点**：`bin/thincoder.mjs` 入口最前调 `prepareCrashReporting()`（**全部命令同源**——TUI 子进程亦经此入口）。
- **动作**：mkdir 预建 `~/.thincoder/crash-reports/` + `process.report.directory` / `reportOnFatalError` 代码内启用
  （shebang 入口无法携带启动参数 ⇒ 代码内启用是唯一路径）。
- **预建是必要动作**（非「零成本保险」）：目录缺失时 Node 对 fatal **静默不写**报告。
- **落点**：`report.*.json` 落 `~/.thincoder/crash-reports/`——`process.report.directory` 已由进程内设定，
  **非 CWD**。
- 接口（注入缝）：`prepareCrashReporting({ dir, heapSnapshot = true, armHeapSnapshot })`（`thincoder-cli/src/crash-reports.mjs` 导出）
  ——默认参数保**其余调用点**（如 `thincoder-cli/test/fixtures/r25-oom.mjs` 无参调用）零改（生产判定单点 = bin 入口读配置键 `diagnostics.heapSnapshot` 后显式传入——§3.2）；`dir` 选项同时服务 mkdir / `report.directory` / purge / 返回。返回值 = 目录路径。

### 2.2 JS 异常记录与启动提示

- `writeCrashRecord({ type, error })`（`crash-reports.mjs` 导出）：同步落盘 `crash-<epochms>-<pid>.json`——内容 = 时间 / 类型 / 消息 + 堆栈 /
  `uptime` / argv / cwd / 内存 / node 版本；权限 `0o600`。写失败返回 `null`（不抛——步隔离）。
- `recentCrashHint({ dir })`（`crash-reports.mjs` 导出）：启动扫描——24h 窗内是否有记录（mtime 判定）→ 返回提示文本或 `null`（无匹配不提示）。
- **提示行带记录内事实（用户裁 = B：判定面增强 · 原文案保留）**：选中记录（窗内 mtime 最新者）读回
  **`uptime` + `cwd`** 两段，提示形 = `上次运行异常终止（记录：<path> · 运行 <u>s · cwd <c>）`（`<u>` = `uptime.toFixed(1)`）。
  目的 = 「1.5s 启动尝试」与「真会话」在提示面一眼可辨（24h 窗内两条记录的形态差）。段序固定 = uptime 段在前 / cwd 段在后。
  - **字段源按记录类分**：自写记录（`crash-*.json`）取顶部 `uptime`（秒 · number）/ `cwd`（string）；Node fatal 报告
    （`report.*.json` 档）取 `header.cwd`——**Node 报告无 uptime 字段**，该段略去。
  - **退化（尽力面）**：读档 / 解析失败、记录类不明、字段缺 / **型不符**（`uptime` 非有限非负数 · `cwd` 非非空字符串）⇒ **对应段略去**；两段皆缺 ⇒ 基础形
    `上次运行异常终止（记录：<path>）`。不抛、不阻断启动（N1）。
  - **消费面零改**：两处调用点（`bin/thincoder.mjs` 内 `recentCrashHint` 调用：chat 分支 stderr 行 · `startTUI` 载荷 `crashNotice` 字段）只消费返回串。

### 2.3 30 天写时自清理（purge）

- 淘汰阈值 = 30 天；**写时自清理**，搭车点三处：`writeCrashRecord` 写后 · `prepareCrashReporting` 入口 mkdir 后 · `recentCrashHint` 启动扫描前
  （纯 fatal 序列 JS 不运行 → 由下个进程的入口 mkdir 兜底清理）。
- **purge 模式集 ≠ 提示判定集**（`crash-reports.mjs:46` / `:49`）：
  - purge 覆盖 `crash-*.json` · `report.*.json` · `tui-stderr-*.log` · `Heap.*.heapsnapshot`；
  - 「上次异常终止」提示**只计前两类**——tui-stderr 每次 TUI 启动都生成（正常退出也留档）、堆快照非「异常终止」证据类，
    计入即正常会话误报。

### 2.4 TUI stderr 包装捕获

- TUI 启动 = 父进程包装 spawn 子进程（自身 bin），子 stderr tee 双写（终端实时 + `tui-stderr-<ts>-<pid>.log`）。
- 实现：`thincoder-cli/src/tui/wrapped-spawn.mjs` · 包装门 `bin/thincoder.mjs`。

## 3. 近堆上限堆快照（对象级证据）

### 3.1 武装（注入点 / 时点 / 语义）

- **单点武装**：`prepareCrashReporting()` 内 `armHeapSnapshot(1)`——**全路径覆盖**
  （TUI 子进程 / chat / acp / 其余——同源入口），零额外进程、零参数管线。
- 调用语义：`v8.setHeapSnapshotNearHeapLimit(1)`——「堆接近上限时写快照、至多 1 份 / 进程」。
- 导入形态：命名空间 import（`import * as v8 from "node:v8"`）——API 缺失降级为调用期异常并被吞，不做 import 期硬失败。
- 独立 `try/catch`（尽力面——武装失败不阻断启动、不影响既有步骤）。

### 3.2 开关（配置键）

- 键：`diagnostics.heapSnapshot`（布尔；判定 / 默认在 `thincoder-core/config.mjs` 装载面）；**判定单点 = bin 入口读键后以显式参数传入**（`prepareCrashReporting({ heapSnapshot })`——包装器不判定，防两处判定漂移）。
- 判定：键值 `true` → 武装；缺省 / 其余值 / 读失败 → **不武装**（默认关——隐私默认〔traces D-TR6 同族〕；判定形 fail-closed）。**显式开的生效时点分端**：桌面会话热读（运行期即时）∥ CLI 本进程下次启动（判定单点 = 进程启动读键）。
- 通道纪律（自有配置禁经 env）= `CONFIG.md` §6.2。
- 包装器的 `--diagnostic-dir` **无条件注入**（开关已关时该参数无副作用面——报告目录由 `process.report.directory` 决定，同值）。

### 3.3 TUI 定向（`--diagnostic-dir`）

- `wrapped-spawn.mjs` 子 argv **首位**注入 `--diagnostic-dir=<crashReportsDir()>`
  （Node 选项须在脚本路径前：`[--diagnostic-dir=…, script, ...原始 argv]`——`thincoder-cli/src/tui/wrapped-spawn.mjs:44`）。
- 目录由包装前置 mkdir——写时目录必在（目录缺失 = 快照丢失面）。
- **落点按路径分裂（如实登记的已知边界）**：TUI（主路径 = 实测崩溃路径）→ crash-reports（与既有取证物同址 + 纳入 30 天清理）；
  其余路径保留 Node 默认 CWD（无运行时定向手段，不为单一路径引入双击进程）。

### 3.4 代价与失败面

| 项 | 事实 | 说明 |
|---|---|---|
| 体积 | 随堆规模（GB 级至更大可能） | 「≈ 堆大小」仅为粗略量级 |
| 耗时 | 生成期进程同步阻塞（近无响应），随后照常 fatal | —— |
| 额外内存 | V8 堆内 + 堆外原生（Node 语义：会调整堆以容纳开销） | —— |
| 次数 | 1 份 / 进程 | 不堆叠 |
| 常态开销 | 零（回调注册一次——未近上限不触发） | —— |
| 堆上限 | **不改**（`--max-old-space-size` 不动——改上限会改变崩溃时机，掩盖泄漏节奏） | 体积 = 取证固有成本，接受 |

- **失败面**：武装异常 → 吞；快照写失败（磁盘满 / 权限 / 目录缺失）→ 快照不落，其余取证面不受影响（机制独立）。
- 写出时 stderr 行（Node 原生）：`Wrote snapshot to <路径>`——TUI 经 tee 双写（上屏 + 日志），用户 / 同事可截图回传。
- **不做启动提示**：可发现性由写时原生行 + 落点表 + 30 天清理闭环。

## 4. 堆遥测 / 看门狗（事前预警）

### 4.1 定位

本机制补「事前预警」：接近堆上限时主动提示，
为长会话用户留出保存与取证窗口。**只看不治**（不强制 GC、不阻断、不触发快照——快照面归 §3）。

### 4.2 模块契约（`thincoder-cli/src/heap-watch.mjs`）

- `startHeapWatch({ intervalMs = 60_000, ratios = [0.7, 0.85], sample, heapLimit, enabled = true, timer })`
  → `{ stop(), checkNow() }`；`onHeapWarn(cb)` 订阅（返回退订函数）——模块不读配置 / env，开关于装配点经参数传入。
- **阈值 = 堆上限比例**（`heapUsed / v8.getHeapStatistics().heap_size_limit`）——可移植（上限随 `--max-old-space-size` / Node 版本变化），
  无绝对 MB 常量。
- **双档边缘触发**（70% / 85%——每档一次 / 进程，不重复刷屏）。
- **武装点**：`bin/thincoder.mjs` 入口 `prepareCrashReporting()` 之后单点（全命令同源；定时器 `unref()`——一次性命令自然退出、零阻塞）。
- **注入缝**：`sample` / `heapLimit` / `timer`——测试以假实现 + `checkNow()` 直驱（零等待）。
- 失败面全吞（采样抛错不阻断、状态保持）。

### 4.3 开关与预警行

- **开关（单点）**：配置键 `diagnostics.heapWatch`（布尔）——`false` → 不启动；缺省 / 其余值 → 启动（默认开——遥测默认面；判定形 `!== false`，与 §3.2 快照面默认相反〔快照默认关〕）。
  bin 入口读键后经显式参数传入（`startHeapWatch({ enabled })`——模块不读配置）。
- **预警行（逐字——进测试断言）**：

```text
[heap] warning: heapUsed <U> GB / <L> GB heap limit (<P>%) — long session; consider /new to reset context
```

（U / L 一位小数，P 取整；85% 档前缀同、数值不同。每档一次 / 进程。）

- **告警面三处**：stderr 行（headless 主面）+ TUI 行（订阅制——`startTUI` 内注册 → `pushLine(line, C.warn)` + `render()`）
  + 事件日志（`thincoder-core/log.mjs` 事件骨架：`kind:"heap-warn"`, used / limit / ratio）。
- **TUI 活动时的 stderr 面**：**不抑制——明示接受噪声**（TUI 下该行经 tee 双写；上屏行可被帧重绘刷新，
  可靠面 = TUI 行 + 事件日志，stderr = headless 主面与日志兜底）。

## 5. 异常退出的终端恢复

### 5.2 契约

- `thincoder-cli/src/tui/tui-lifecycle.mjs`：导出 `RECOVERY_SEQUENCE`（逐字 = 清理序列：`clearScreen + mouseOff + bracketedPasteOff + keyboardPop + modifyOtherKeysOff + mainBuffer + showCursor + reset + wrapOn`）；
  `writeCleanupSequence` 引用同常量（行为逐字不变——既有字节锁测试保持）。
- `thincoder-cli/src/tui/wrapped-spawn.mjs`：**守卫落点 = `exit` / `close` 事件处置内、`finish(...)` 之前**
  （按 `exitCode` / `exitSignal` 判定——`code !== 0 || signal != null`）→ `try { writeImpl(RECOVERY_SEQUENCE) } catch {}`
  ——**每进程恰一次**（`recovered` 守卫：exit / close 双路 + 30s 兜底路径同守）。
- **不在共享 `finish(code)` 内判定**：spawn error 路径现经 `child.on("error") → finish(1)`；
  字面挂共享 finish 会在子未启动时补发 `clearScreen` 序列——违「spawn error 零动作」。
- **零动作面**：spawn error（子未启动）/ 正常退出（code 0）→ 不补发（子自身清理为准）。
