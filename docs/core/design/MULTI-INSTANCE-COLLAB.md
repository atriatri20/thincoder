# 多实例协作感知（MULTI-INSTANCE-COLLAB）· 设计

> 板块 = **多实例协作感知**（同一工作目录多副本 agent 互相感知与避让）。
> 本档 = 该机制的**设计面唯一权威**（共享状态分类 / 感知面 L1–L2 / 域面 L3 / 意图认领面 claims / config 原子写 F5 / 决策）。
> 相邻权威 = `docs/core/design/SESSION.md`（§6.2 槽位认领 / 判活 / slotOccupancy——本机制上游存储层基建，复用不重造）·
> `docs/core/design/WORKSPACE.md`（工作区面）· `docs/core/design/SETTINGS-TOOL.md`（settings 工具走 `writeConfigAtomic` 原子写盘）。
> 需求侧 = `docs/core/requirements/MULTI-INSTANCE-COLLAB.md`（F-MI1–F-MI10 / N-MI1–N-MI8）。

## 1. 定位与范围边界

同一 `~/.thincoder/sessions/` / `~/.thincoder/peers/` 目录下的多实例（CLI + VS Code 双端）在 **agent 认知层**互相感知：
agent 自主知道「有同伴在」，写前避让文件域竞争，无需用户口头协调。

- **不做**：任务编排 / 冲突自动合并；文件域感知是**软提示**（不阻止写，非文件锁）。
- **投递面（§5 · F-MI10）另立一面**：把一条用户消息送进指定会话并起一轮；不做消息总线 / 广播订阅 / 待取队列 / 派活。
- 判断标准 = **写入语义**：共享单一文件（读-改-写竞态 → 需 mtime 门控 / 合并）vs 追加独立快照 / 分文件（天生无冲突）。

## 2. 共享状态分类（A–E）

### A 类：已有防护（复用存储层基建）

| 共享物 | 路径 | 防护机制 |
|---|---|---|
| 会话数据文件 | `~/.thincoder/sessions/{cwd-hash}.json.N` | slotSessions 进程认领 + isProcessAlive + slotOccupancy + end marker + .bak 轮转 + mtime 门控（`SESSION.md` §6.2） |
| 会话 manifest | 同目录 `.json.manifest` | 条目级合并 + deletions 显式表达 + active 单值指针 |
| 向量 / 个人记忆 | `~/.thincoder/memory.db` | sqlite WAL 并发（低险） |

### B 类：裸写无防护（本机制覆盖——F5）

| 共享物 | 路径 | 风险 |
|---|---|---|
| config.json | `~/.thincoder/config.json` | 🔴 全局共享；整节内存写回抹掉对端改动（F5——用户实证「一端改配置另一端出现意外」） |
| 项目元数据 | `{cwd}/.thincoder/advisor.md` 等 | 🔵 低活跃低险 |

### C 类：按文件设计天然低冲突（无需协调）

项目 memory（每 entry 独立文件）· 日志 / tmp（appendFile 原子追加）· traces（按 sessionKey 分文件）·
checkpoints（追加式独立快照目录——ID 随机后缀防碰撞 + 清理幂等；语义上同 cwd 多实例快照都应可恢复，隔离反而破坏用途）。

### D 类：工作区本身（L1/L2/L3 主战场）

repo 代码 / 文档 / git 操作无跨实例协调——同时改同文件互相覆盖。

### E 类：跨实例共享的浏览器（单池 · 引用计数）

| 共享物 | 路径 | 防护机制 |
|---|---|---|
| 共享浏览器（一台） | 持有者登记 `~/.thincoder/browser/session.lock` + 用者登记 `~/.thincoder/browser/users/{pid}.json` | 持有者原子领取（创建即领取；陈旧位 `rename` 摘除）+ 用者引用计数：首开末关；活性按 pid 判、死条目扫描时剔除；末关关完浏览器即删锁 |

- **机制面单源 = `docs/core/design/BROWSER-TOOL.md` §12**——本档只登记它是共享物，不复述机制（D2）。
- **与 L1/L2/L3 的关系**：浏览器池只是共享物，不进同伴感知面、不参与写域软提示。
- **判活口径**：只判 pid 存在性（`EPERM` ⇒ 算活），**不引** `process-probe.mjs` 的身份标记族——浏览器用者本就是本产品实例；判错方向不对称（误保留 = 多留一台浏览器；误删 = 关掉别人在用的浏览器）⇒ 保守保留，与 `D-MI10` 同向。

## 3. 感知面：L1 回合注入 / L2 查询工具

数据源全部复用 `SESSION.md` §6.2（manifest `slotSessions` + 判活）——**纯只读**（N-MI3，感知面结构化上无任何 fs 写调用）。

### 3.1 `peerInstances(cwd)`（`thincoder-core/peer-instances.mjs`——双端同构）

- 读 manifest `slotSessions` → 按 sessionId（`{pid}-{ts}-{rand}` 进程级）去重分组 → slots 数组；
- **一次批量判活**（`batchAlive(pids)`——`thincoder-core/process-probe-exec.mjs`，单次 tasklist/ps 全量比对）；探测失败（null）≠ 全死——按「无活伴」降级（不显示幽灵同伴）；
- self = `sessionId === getSessionId()`（本进程恒活不查）；
- **端字段**：`probeCmdlines(pids)`（`thincoder-core/process-probe-exec.mjs`）一次 exec 拿全部 pid+cmdline，`VSC_END_RE`（extensionHost 族）命中 → `vscode`；
  桌面族（`DESKTOP_END_RE`——`thincoder-desktop` 路径段 ∥ `node_modules/electron/dist/` 段）命中 → `desktop`；其余 → `cli`；失败 → end 缺省；
- **惰性缓存**：命中判据 = **manifest mtime 未变 ∨ 快照年龄 < `PEER_PROBE_TTL_MS = 5000` ms** ⇒ 直接返回缓存快照（零 exec 零读）；
  缺失 / 损坏 → `[]`（不缓存空结果）；缓存上限 `CACHE_MAX = 64`；快照记 `probedAt`（上次实探时刻）。

  **可测缝（TTL 两侧）**：模块级 `nowFn`（缺省 `Date.now`——经 `_setPeerInstancesTestImpl` 注入、`??` 兜底、测试 finally 恢复）
  ⇒ 「TTL 内命中 / TTL 外重探」两侧均可**确定性**断言，免真实 ≥ 5 s 等待。

  **修因**：`saveSession` 每回合重写 manifest（`thincoder-core/session.mjs` 的 `saveSession`）⇒ 纯 mtime 判据**每回合自击穿**，
  每回合重跑 `tasklist` + `Get-CimInstance`（1–3 s **同步 exec**，独占事件循环——主 agent 回合假死源之一）。

  TTL 只影响**新鲜度**（同伴来去在人类时标），不影响正确性；TTL 内不重探 = 与 T-L1c「零 exec」同向。
- **探测异步化**：`thincoder-core/process-probe.mjs` 增 `batchAliveAsync` / `probeCmdlinesAsync`（`execFile` promise 化；
  **同一注入缝** `_setProcessProbeTestImpl`——测试注入的同步函数经 `await` 消费，零新缝）；
  读面 `peerInstances` → **async**，`pushPeerReminder` → **async**（装配点 `prepareRun` 已 async——`await pushPeerReminder(agent)`）。

  **清理面形态（F-MI7）**：`cleanDeadOwners` / `usableSlot` / `allocateFresh` / `ensureActive` **零自有探测**——判据 = 「入口一次束 + 查表」形态（`probeOwnersAsync` / `probeOwnersSync`，见下条）；`resumeSlot` 整链 **async**（会话起点 / 认领路径零同步 exec）。

  同步面仅剩**两处有界同步消费**（同束 `probeOwnersSync`，`SYNC_PROBE_MS` = 2 s 紧界）：① `activeSlot` 冷路径；② 占用判定 `slotOccupancy`（`thincoder-core/session.mjs`，拆分后随 `session-lifecycle.mjs`）。

  两处均带**零探测早退**（粘性早退 / 无属主或本进程属主）——详面 = `SESSION.md` §6.2；测试锚 = 本档「判据（测试层 · F-MI7）」条 ③。
- **活判定身份校验（F-MI6 / N-MI6）**：身份过滤**不进 `batchAlive`**（保持**纯存在性**——`thincoder-core/peer-domains.mjs` 死文件清理语义零变、**零改**）；过滤落点 = **读面 `peerInstances()`**（存在性结果 × 命令行复核）+ **清理面 `filterDeadOwners`**（详面见下条判据单源）。命令行命中**本产品标记族**才计为活同伴。
  标记族 = 三支：

  - ① CLI 入口族（命令行含 `bin/thincoder.cjs` ∥ `thincoder-cli/bin/thincoder.cjs` ∥ `thincoder.mjs` ∥ `thincoder-cli` 路径段）
  - ② VSC 宿主族（既有 `VSC_END_RE`——extensionHost）
  - ③ 桌面族（`DESKTOP_END_RE`——`thincoder-desktop` 路径段 ∥ `node_modules/electron/dist/` 段）；
  命令**明确可得且不命中** ⇒ 不列为同伴（消除 pid 复用假阳性）；命令探测失败 / 该 pid 缺行 ⇒ **保守保留**（探测失败 ≠ 死；既有降级语义不变）。
- **判据单源**：身份判据实现住 **`thincoder-core/process-probe.mjs`**——`batchAlive` / `probeCmdlines` / `isProductProc(cmdline)` / `classifyEnd` / `filterDeadOwners`；

  **感知面（读）与陈旧记录清理面（写）调用同一实现**，零第二套标记正则（清理面 = `thincoder-core/session-slot-claims.mjs` `cleanDeadOwners`（同名导出；转口 = `thincoder-core/session-slots.mjs`；调用点 = 清理面单点）（机制面 = `SESSION.md` §6.2）——`isProcessAlive` 之外加身份复核，pid 活 + 身份不符 ⇒ 条目可删）。

  注入缝（R6 形态）= `process-probe.mjs` 模块级 `_setProcessProbeTestImpl({ aliveFn, cmdlineFn })` + `??` 默认 + 测试 finally 恢复；

  清理面 API = `filterDeadOwners(pid, { alive, cmdline }) → boolean`——**`alive` 三态**（`true` 活 / `false` 死 / `undefined` 未知，**缺省 = 未知**）：

  `false` ⇒ `true`（可删，pid 死语义原样）；`true` ⇒ 命令明确可得且非本产品 ⇒ `true`；**未知 / 缺行 ⇒ `false`（保守保留，D-MI10）**。

  三态判据单源 = `ownerState(pid, { aliveSet, cmds }) → "dead" | "alive" | "unknown"`（`filterDeadOwners` 与占用 / 空闲判定同源消费——`SESSION.md` §6.2）。
- **清理面扫描形态**：清理面与读面**同形态**——**单次批量**取命令行（一次 `probeCmdlines` 覆盖全量待判 pid，`filterDeadOwners` 逐条消费该批量结果），**不做每 pid 一次 exec**（对齐 §8 `D-MI3` 口径与需求档 `N-MI3` 批量判活；R6 注入缝 `cmdlineFn` 即此批量语义）。
- **探测束与有界形态（F-MI7）**：探针族两形态各增**束 API**——`probeOwnersSync(pids) → { aliveSet, cmds }` / `probeOwnersAsync(pids) → { aliveSet, cmds }`（每束 ≤1 批量判活 + ≤1 批量 cmdline；异步形态两 exec **并发**）。
  同步形态超时 = `SYNC_PROBE_MS = 2000`（阻塞事件循环 ⇒ **紧界**）；异步形态沿用 10 s / 15 s（不阻塞，量级不变）。
  cmdline 一发**仅在存在非自身存活属主时**必需（无活外人 ⇒ 省发）——束内自决，调用面零探测零判据。
  **失败 ⇒ `aliveSet = null`（未知）**：判据层按「保留 / 不可认领」降级（三态判据），**任何调用面不得把 `null` 当「全死」**。
- **已知局限（登记）**：manifest 记录不含 cwd、进程 cwd 无跨平台可移植获取面 ⇒ 被他 cwd 的**真实** thincoder 实例（或他窗口 VS Code 宿主）复用 pid 时仍可能误报——处置方向 = **保守保留**（D-MI10 不对称）；**消解路径未定**（登记为已知局限，非本档可解）。
- **已知局限（误删方向 · 登记）**：标记族**假阴性**——真实本产品实例命令行不含 `bin/thincoder.cjs` / `thincoder.mjs` / `thincoder-cli` 路径段且非 extensionHost（如包装器 / 新入口形态）⇒ 清理面会删**活**属主槽条目——正是 `D-SE3` 要防的「双进程同槽」方向（`D-MI10` 不对称只护「探测失败 / 缺行」）。
  接受边界 = 入口族命中面（CLI 入口段 / extensionHost）内无此方向；族外残差接受（放宽标记族 = 复引入 pid 复用误报——`D-MI11` 判据零改）；消解路径 = 实测出现该形态时按形态补进标记族（单源改点 = `isProductProc`）。
- **判据（测试层 · 需求档 F-MI6 / N-MI6）**：读面 = 核 `peer-instances` 单测（注入缝首用——身份不符 ⇒ **不列为同伴**；身份符 / 探测失败 / 缺行 ⇒ **保留**）；清理面 = 核 `session-slot-write` 单测（同判据：不符 ⇒ 删，不确定 ⇒ 不删）；
- **判据（测试层 · 需求档 F-MI7）**：单元测试档 = 核 `process-probe` 半（束 API / 三态 / 注入缝计数 / 零同步 exec 扫描）+ 核 `session-slot-write` 半（扩——有界同步例外锚）+ 端 `zero-sync-exec` 半（零同步 exec 扫描）；四路锚：
  ① **零同步 exec 扫描（两域分档）**：核域 = `thincoder-core/session-slots.mjs` · `thincoder-core/session.mjs` · `session-lifecycle.mjs` · 端域（零同步 exec 扫描域）= `thincoder-vscode/src/extension/session-slots.mjs` · `thincoder-vscode/src/extension/peer-instances.mjs`；

  **端侧探测消费面** = `thincoder-vscode/src/extension/peer-instances.mjs` · `thincoder-vscode/src/extension/session-io.mjs`（零自有探测；名册机检 = 端 `zero-sync-exec` 单测）；

  分档 = 核 / 端两半，判据 = `docs/core/design/CORE-UNIFICATION.md` N3（核内零产品 import）；
  域内零 `execSync` / `execFileSync` / `spawnSync` 直引（形态先例 = 单测零直引扫描——核 / 端两半同形；域完整性对账先例同形）；`thincoder-core/process-probe.mjs` = 探针族单点落点（豁免——不在零域）。

  ② **束 exec 上界**（注入缝计数）：每束 ≤1 批量判活 + ≤1 批量 cmdline、零逐 pid——经 `_setProcessProbeTestImpl({ aliveFn, cmdlineFn })` 计数断言（越出即红）。
  ③ **有界同步例外锚**（`activeSlot` / `slotOccupancy` 两面）：零探测早退命中（粘性 / 无属主 / 本进程属主）⇒ 计数断言零探测；探测失败 / 超时（注入形——零真实 2 s 等待）⇒ 未知保守保留（占用判定 ⇒ `{ occupied: true, unknown: true }`）；

  界值单源 = `SYNC_PROBE_MS = 2000`（探针族一份常量）。
  ④ **初始化窗口静默读数**（< 2 s）：取值单源 = `docs/vsc/design/SETTINGS.md` §2.11 三路（静态扫描 / 注入式时序断言 / 实机读数）；实机读数承当下实机测量（实测 C）。
- 测试注入缝：`_setPeerInstancesTestImpl({ aliveFn, cmdlineFn, nowFn })` / `_resetPeerInstancesTestImpl()`（同档两导出——注入即清缓存；`nowFn` 新增——TTL 面见上）。
- **VSC 镜像面收正（F-MI6）**：端侧 `thincoder-vscode/src/extension/peer-instances.mjs` 判活 / 标记正则 / 批量 cmdline **本地副本删除**（本地副本 = `batchAlive` · `classifyEnd` · `probeCmdlines`）——判据**引核**（经 `@thincoder/core/process-probe.mjs` 引用，单源不变）；
  端侧只留 **END / 命名空间薄壳**；注入缝转口——端侧 `_setAliveProbeForTest` 转注入核缝 `_setProcessProbeTestImpl`（同缝语义——测试免双缝）。
  **（端侧整档 = 核单源转口）**
  验收：既有同伴用例行为零变（引核后同一判据）+ 端侧本地判活 / 标记正则 / cmdline 副本零残留（扫描判据 = 本档「判据（测试层 · F-MI7）」条 ①）。
- **聚合半段单源**：manifest → 按 sessionId 分组（`groupSlotSessions`——`thincoder-core/peer-instances.mjs` **具名导出**）**归核**；端侧**引核**（`thincoder-vscode/src/extension/peer-instances.mjs` 零本地副本）——共享面 = 纯函数分组半段。
  **（端 `peerInstances` = 核单源转口；`prewarmPeerInstances` = 核缓存预热薄转口）**
  判据：① 结构（机检）= 端档零本地 `groupSlotSessions` 定义 ∧ 具名 import 自核；② 行为（对拍）= 同 manifest（多槽同 sessionId / 非数字槽 / 空 sessionId / pid 不可解析）⇒ 两端分组集合逐字段相等。
- **端读面形态与缓存判据（核读面单源 · async）**：VSC 侧读形 = **核读面直取**（`@thincoder/core/peer-instances.mjs`——async · mtime ∨ TTL 惰性缓存 · 探针族单源）；
  **预热落点**：启动期异步预热的落点 = **panel resolve 面**（键 = **panel cwd**）；`activate()` 无 per-cwd 键，多根工作区会预热错键。
  **形态面（非登记项）**：预热 = 核缓存预热薄转口（`prewarmPeerInstances`——先起一次核读面落缓存）。
  `N-MI2` lockstep 不受影响——同伴清单**不入**认领 / 占用判定（判定面单源 = 核束 + `ownerState`）。

### 3.2 L1 回合注入（`pushPeerReminder`）

装配 = `thincoder-core/agent/setup-reminders.mjs`；时序（`thincoder-core/agent/setup.mjs`，depth-0）= env-state 之后、time reminder 之前（time 保持 LAST——prefix-cache 契约）。
形态 = **depth-0、transient:true**（同 env-state 纪律）；无同伴零开销（惰性缓存）；任何感知失败静默跳过（注入绝不打断回合）。

**异步形态（消 TUI 假死）**：`pushPeerReminder` = async（内部 await 读面）——装配点 `prepareRun` 为
depth-0 分支内 `await pushPeerReminder(agent)`；**注入时序与文案零变**（env-state 后、time reminder 前）。

**注入文案（逐字契约，双端一致）**：

> `[System reminder: 本目录另有 ${peers.length} 个活跃 thincoder（${who}）——文件操作注意避让]`

`who` = 各同伴 `{end} pid={pid}`（有 end 时）或 `pid={pid}`，以「、」连接。有同伴才注入，每回合注入。

### 3.3 L2 查询工具（`peer_instances`）

只读工具（无参、readonly）返回 `peerInstances(cwd)` 去 self——agent 主动查，不依赖注入时机。
装配 = 核 `assembleBuiltinTools`（`thincoder-core/tools/index.mjs`——CLI / VSC 两壳同得）；VSC 另在自有工具表 `thincoder-vscode/src/tools/index.mjs` 并表。

**schema description 逐字锚（双端照抄——禁止自行解释）**：

> "peer_instances — read-only: list other live ThinCoder instances sharing this workspace cwd. Returns [{ pid, end, sessionId, slots }]; never includes self; pure read — writes nothing."

**字段白名单**（N-MI4）：返回字段仅 `{pid, end, sessionId, slots}`——出现任何其他键即红；查询路径 fs 写点计数 = 0。

## 4. 域面 L3：文件写域登记 + 冲突检测 + 意图认领（claims）

### 4.1 选型结论

③ **选定：每实例独立登记文件 + 目录扫描聚合**——end marker 单写者模式同型（写失败容忍 + 损坏按缺失降级 + 崩溃残留判活可清）→ `thincoder-core/peer-domains.mjs`。

### 4.2 登记存储（D-L3a）

- 目录 `~/.thincoder/peers/`，每实例单文件 `{sessionId}.json`（单写者 = 本实例；**足迹面字段** `{sessionId, pid, end, cwd, domains: [绝对路径], updatedAt}`——认领面另有 `claims` / `claimsUpdatedAt` 两字段，见 §4.4.1）。
- **写点 = 回合级**：结构化写工具执行成功时 `recordPeerWrites`（同档）记入 `agent._peerWritten`（Set<绝对路径>）→ 回合末 `finalizeAgentTurn` 调 `flushPeerDomains`（同档）整写一次（`.tmp + rename` 原子）。**本回合无写入 → 不写**（hot 窗口不被空回合提前清掉）。
- `PEER_WRITE_TOOLS` = 既有 `FILE_MUTATORS` ∪ `file_ops`（后者在 FILE_MUTATORS 之外故显式并入）。
- 目标解析 `peerWriteTargets(tool, args, cwd)`（同档）：touchedPaths 优先（apply_patch / edit-batch 多文件）；`file_ops` 按**动作感知**取路径——`copy` ⇒ 只 `dest`（源仅读取，不属写域）；
  `move` / `rename` ⇒ `source` + `dest`（两端皆动）；未知 / 缺失 `action` ⇒ 同 `move` 保守双算——动作感知规则住**单源谓词** `toolTouchPaths`（`thincoder-core/agent/helpers.mjs`；规格 = `TOOLS.md` §6.17）；
  其余工具 path 单参兜底；相对路径按 cwd resolve；畸形入参跳过。
- 崩溃残留：聚合时惰性清理（死 pid 文件 unlink——**判活探测失败（null）≠ 死，不得据此删除**）；损坏文件按缺失降级（不删——属主下次 flush 覆盖）。

### 4.3 冲突检测（D-L3b）

`peerDomains(cwd)`（同档具名导出）聚合本 cwd 其他活实例登记（self 排除）；`conflicts(cwd, targets, { now })`（同档——`now` 缺省 `Date.now`，测试注入确定性时钟）：targets 命中他实例 **hot 域**
（`updatedAt` 在 `HOT_WINDOW_MS = 5 * 60 * 1000` 内——同档常量——且域含 target / 互为包含）→ 返回 `[{ target, by: [{end, pid, sessionId}] }]`。纯只读、不抛（失败按零冲突）。

- **hot 窗口语义**：「写后登记 + hot 窗口」——登记真实足迹，「正在写」弱化为「刚写过」；bash 大通道本就不可拦——诚实边界：L3 覆盖结构化写工具足迹 + hot 提示。
- **路径重叠** `pathsOverlap(a, b)`（`thincoder-core/peer-claims.mjs`——`thincoder-core/peer-domains.mjs` re-export 保名面）：相等或互为目录包含；区分大小写按平台；分隔符归一。
- **缓存**：聚合结果按 peers 目录 mtime 惰性缓存（目录未变不重扫）；**N-MI3 度量**：单次写工具调用新增开销上限 = 目录 stat 一次；注册 flush = 回合末一次整写。

**dispatch 钩子**（`thincoder-core/agent/dispatch-run.mjs` + `thincoder-core/agent/run-stages.mjs`）：执行前 `peerCollabNote(agent, tool, args)`（同档）查 conflicts——
命中 → 工具结果附**软提示**（不阻止）；成功后 `recordPeerWrites`（仅成功写计入）；routed（ACP 客户端执行）成功同样记账。
**共享钩点**——认领面同点接线（写前命中 / 写后登记见 §4.4.4 / §4.4.3）。

**软提示文案（逐字契约，双端一致）**：

> `[peer-collab] ${target} — another live instance (${who}) registered writing it within the last 5 minutes; concurrent edits may overwrite each other. Write not blocked — coordinate before proceeding.`

`who` = 各 `{end} pid={pid}` 以 ", " 连接。无冲突 / 无目标 / 降级 → null（调用方零附加）。
- **分隔符 = 核形 `\n`**：多行提示的行间分隔符不属逐字契约——核逐行 `\n`（`thincoder-core/peer-domains.mjs`）；单行文案本体不受影响。
- **字面规范面**：本字面 = **规范面单源**——核实现（`thincoder-core/peer-domains.mjs`）与核测试逐字锁之；**端侧按本字面逐 target 出行**（形态面：行间分隔符 = 核形 `\n` 单源；**非端差登记项**；见上条）。
  **F-MI9 读法**：需求档 F-MI9「仅足迹命中 ⇒ 既有文案零变」的「既有文案」= 本条规范面字面本体——端侧改形 = 聚合单行 → 逐 target（行形态），文案串零变。

  判据：① 结构（机检 · **扫描口径单源 = 本行**）：扫描面 = 核 / 端两包（`thincoder-core/**` · `thincoder-vscode/**`）+ 书写面（`docs/**/design/**` · `docs/**/requirements/**`）排除三面后零命中——

  ⒜ 定义性引用行（本档 §4.3「字面规范面」条内载该字面的判据行——`[peer conflict notice]` 作为被判对象唯此一处被引）· ⒝ 记录面 / 归档面（`**/_archive/**`）· ⒞ `.thincoder/tmp/**`；② 行为（对拍）= 同（target × 属主集）输入 ⇒ 端 `peerNotes` 足迹行与核 `peerCollabNote` 足迹行**逐行字面相等**（比较按行拆分——分隔符端差不入锚）；③ 多目标 ⇒ 逐 target 各一行（零聚合单行）。
- **端 `conflicts` 判据**：与核**同判据**——`pathsOverlap`（相等或互为目录包含）+ 同 cwd 过滤 + hot 窗口 + self 排除；
  端谓词落点 = 端 `claimsOverlap`（`thincoder-vscode/src/extension/peer-claims.mjs`——与核 `pathsOverlap` 同判据）。
- **判据（测试层 · 足迹面）**：两端各一份 `peer-domains` 单测（核半 + 端半；端档须入册 `thincoder-vscode/test/files.mjs`）。
  核半覆盖（D-L3a / D-L3b 行为组）：目标解析 / 写工具集 / hot 窗口两侧界 / 路径重叠与 self·cwd 过滤 / 保守不删与死清理 / 回合累积与整写一次 / 无写回合零写 ∧ 去重集先清 / 失败容忍保账 / dispatch 钩点端到端 / 收尾接线。

  端半覆盖：登记累积与整写 / 冲突查询（**与核同判据**——端 T-L3v2 对位核 T-L3e：目录包含 ⇒ 命中 · 他 cwd ⇒ 零命中）与聚合缓存 / 死清理 / 预检门控 / 逐 target 足迹行与混合合成；两侧沙箱 = peers / sessions 目录注入缝 + 判活注入缝（真目录零触）；逐例清单与用例号族 = 长期测试树（单元测试档）。

### 4.4 意图认领面（claims · TTL 租约 · P1）

> 定位：把「本实例正在这块文件域活动」做成跨实例可机的**结构化弱信号**（L2——非对话、非消息通道）。
> 与足迹面（D-MI5）**分存**：足迹记「已写过什么」，认领记「正在做哪里、租约到何时」——同实例文件、不同字段、不同时间戳、互不改写。
> 认领**非锁、非预留、非承诺**：零阻断（D-MI6 不动——写照发）；覆盖边界同 L3（仅结构化写工具——bash 大通道不管，诚实边界）。
> 术语注意：本面「认领 / claims」= **意图认领**（文件域级 · 租约）——与 `docs/core/design/SESSION.md` §6.2 的**槽位认领**（slot claim——会话存储隔离）**无关**，两概念不联动。
> 需求档同词两用：N-MI3「不认领**槽位**」/ F-MI7「认领路径」= **槽位面**；F-MI8 / F-MI9 / N-MI7 的「认领 / 认领面」= **本面**（意图认领）。
> 触发面证据：长回合足迹空窗真实存在——足迹 flush 只在 run 收尾落一次（`thincoder-core/agent/run-stages.mjs` 的 `finalizeAgentTurn`；端侧更窄 = 仅 depth-0 收尾，
> 端已取核同一档，无自有挂点），而一次实施 run 可达数十分钟 ⇒ 期间对端零信号。
> 「子代理收尾 flush 足迹」变体 = **已在机制内**（子代理走同一 run 收尾、同点零缺）⇒ 认领面补的是**回合内即时性**，与变体不重叠。

#### 4.4.1 存储与字段（D-MI17）

同 `peers/{sessionId}.json`（单写者 = 本进程，不变）扩两字段：

| 字段 | 属面 | 语义 |
|---|---|---|
| `claims` | 认领面 | `[{ target, claimedAt, expiresAt }]`——target = 与写目标同源的绝对路径（文件 / 目录皆可）；两时间戳 = epoch ms |
| `claimsUpdatedAt` | 认领面 | 认领字段上次落盘时刻（与足迹面 `updatedAt` 分属两面） |
| `domains` · `updatedAt` | 足迹面（D-MI5——零改） | 既有语义原样（hot 窗口判据只读本面时间戳） |

- **认领对象形态 = 与写目标同源的绝对路径**（`peerWriteTargets` 解析产物——`thincoder-core/peer-domains.mjs`）：文件级写记文件、目录级操作（`file_ops`）记目录；**不自动上扩**为目录（精度优先）。
- **覆盖去冗（方向性包含谓词）**：判据 `covers(coarse, fine)` = 相等或 coarse 为 fine 的**目录前缀**（单方向——对称谓词 `pathsOverlap`（`thincoder-core/peer-claims.mjs`）不作包含判据；归一 / 大小写同款）。三分支：
  - 已有认领 `covers` 新目标 ⇒ **只续约**（不新增）；新目标 `covers` 已有认领项 ⇒ **替换**（被覆盖项出集、新目标入集）；无包含关系 ⇒ 新目标入集。
  - **不变式 = 集内无被覆盖项**（即集内必为最粗覆盖者）⇒ 覆盖新目标的集内项至多一个（续约对象唯一——不存在多覆盖者择一问题）。
- **分存纪律 = 字段级合并写（read-modify-write）**：认领落盘只改 `claims` / `claimsUpdatedAt`（其余字段逐字保留，含未知字段）；足迹落盘只改 `domains` / `updatedAt`（同法保留认领字段）。
- **落盘原语 = 原子写（`.tmp + rename`）——单一实现**：核 `writeSessionFile`（`thincoder-core/session-slots.mjs`——会话 / 足迹 / 认领三面同一原语）；**端侧引核**（经端壳 `thincoder-vscode/src/extension/session-slots.mjs` 的单源转口——端档零本地原子写实现）。原语含**末级兜底支**：二次 rename 失败 ⇒ 以 tmp 内容直写目标（非原子，最后手段）。
  **理由**：两侧聚合缓存以 peers 目录 mtime 为键（核 `thincoder-core/peer-domains.mjs`；端 `thincoder-vscode/src/extension/peer-domains.mjs` + 头注）——rename 翻目录 mtime ⇒ 对端缓存失效、认领**回合内可见**；就地重写（同名单）不动目录 mtime ⇒ 对端不可见（本层立项动因落空）。
- **兼容（双向）**：旧读者忽略新字段（两侧扫描器只校验既有必填字段——`thincoder-core/peer-domains.mjs`）；旧记录无 `claims` ⇒ 认领面零命中（按缺失降级，不炸）。
- **测试沙箱**：核侧 peers 目录此前零缝 ⇒ 随本机制增 `_setPeersDirForTest` / `_resetPeersDirForTest`（形态先例 = 端侧同名缝，`thincoder-vscode/src/extension/peer-claims.mjs`）。

#### 4.4.2 租约语义（D-MI18）

- **TTL** = `CLAIM_TTL_MS = 30 * 60 * 1000`（30 min）；**续约** = 同目标再次写成功，或目标被已有认领覆盖（续约对象 = 该覆盖认领——§4.4.1）⇒ `expiresAt = now + TTL`（`claimedAt` 保持首次）。
- **过期失效** = 读面按 `expiresAt > now` 过滤 + 本实例落盘时剪除（**不 unlink**——过期不是崩溃残留）。
- **进程死亡即失效** = 复用聚合面既有批量判活（`batchAlive`——`thincoder-core/process-probe-exec.mjs`）与死文件惰性清理：属主死 ⇒ 整条记录不可见并随既有清理删除。
- **崩溃残留** = 与足迹面同一路径（死 pid 文件聚合时清理）；探测失败 / 未知 ⇒ 保守不删（D-MI10 零变）。

#### 4.4.3 认领与落盘时机（D-MI18 / D-MI19）

- **认领触发 = 结构化写工具执行成功**（与足迹同一钩子点：核 `thincoder-core/agent/dispatch-run.mjs` 的写前 ∕ 写后两处——单源，端已取核）——**零新手工动作**；工程模式各里程碑（批点火 / 实施轮派发 / 写轮）**不新增耦合**：实施轮写文件即自动认领。
- **落盘节流**：本次写含新目标（不在上次落盘集内）⇒ 即刻整写（原子写原语见 §4.4.1）；否则仅当距上次落盘 ≥ `CLAIM_RENEW_FLUSH_MS = 60 * 1000` ⇒ 续约落盘；其余 **零 IO**。失败容忍（NF2 同型——下次写重试）。
- **无显式释放面**（D-MI19）：释放只有三条——租约到期 / 属主进程死亡 / 记录被死清理。
- **落盘门控（测试卫生）**：认领落盘前置「本 cwd 会话 manifest 在场」判据（核侧 L3 门同法——`thincoder-core/agent/dispatch-run.mjs`；端已取核）；足迹面零改。

#### 4.4.4 写前命中与软提示升级（D-MI20）

- **钩点** = 与既有 L3 预检同点（核 `thincoder-core/agent/dispatch-run.mjs`——单源，端已取核）——一次聚合扫描同时供两面（零二次扫描）。
- **命中判据** = 目标 ∩ 他实例（同 cwd · self 排除）**未过期认领**（`expiresAt > now` ∧ `pathsOverlap`）。
- **软提示文案（逐字契约，双端一致）**：

> `[peer-collab] ${target} — another live instance (${who}) holds a live intent claim on it (claimed ${age}, lease ${left} min left); concurrent edits may overwrite each other. Write not blocked — coordinate before proceeding.`

`who` = 认领属主 `${end} pid=${pid}`（无 end 则 `pid=${pid}`），仅足迹命中的属主追加 ` (recent write)`，以 ", " 连接；
`age` = `just now`（< 1 min）/ `${n} min ago`；`left` = `max(1, ceil((expiresAt − now) / 60000))`。
- **分隔符不属逐字锚**（同 §4.3 口径）：多行提示的行间分隔符端差（核 `\n` / 端块内 `\n\n`）不入逐字契约——单行文案本体锚不受影响。
- **去重（防刷行）**：同一（目标 × 认领属主）**每 run 至多一行**（`agent._peerNoted` Set——**清空落点 = `flushPeerDomains` 首步**：先于「无写入即返回」早退，去重集不随无写回合泄漏；核侧调用点 = `finalizeAgentTurn` 首行（`thincoder-core/agent/run-stages.mjs`）；新属主出现 ⇒ 新行）。
- **优先级**：目标命中认领 ⇒ 出认领行并**抑制该目标足迹行**（不双行）；仅足迹命中 ⇒ 出足迹行（§4.3 字面——D-MI5 面文案单源）。
- **端侧混合命中合成（与核同形）**：端侧足迹行 = **逐 target 一行**（§4.3 字面——与核同形）⇒ 混合命中（同写既有认领命中目标、又有仅足迹命中目标）按 target 合成：认领命中目标各出认领行（逐字锚同上 · 逐 target）；仅足迹命中目标各出足迹行（§4.3 字面）；已被认领行覆盖的 target **不出足迹行**（零双报）。
  三态（逐字形态）：纯足迹 ⇒ 逐 target 足迹行；纯认领 ⇒ 仅认领行；混合 ⇒ 认领行 + 足迹行（逐 target，互不相叠）。
- **降级**：聚合失败 / 目录缺失 / 记录损坏 / 探测失败 ⇒ 零提示、零抛错（工具主流程永不受认领面影响）。
- **零阻断**：认领命中绝不改变工具执行与结果（写照发——D-MI6 不动）。

#### 4.4.5 成本与降级（N-MI7）

- 单次写调用新增 IO 上界 = **至多一次**实例文件合并写（节流窗内）+ 目录 stat 一次（既有缓存命中零扫描）；无新目标且续约窗内 ⇒ **零 IO**。
- 认领读写失败静默降级（NF2）；聚合面探测失败不缓存空结果（既有语义不变）。

#### 4.4.6 模块落点与双端对位（D-MI21）

| 面 | 落点 |
|---|---|
| 核 · 认领逻辑 | `thincoder-core/peer-claims.mjs`（认领存储 / 租约 / 命中判据 / 文案 / 合并写 / 节流 / `nowFn` 与重置缝；peers 路径与 `pathsOverlap` 归口于此） |
| 核 · 接线 | `thincoder-core/peer-domains.mjs`（`peerCollabNote` 组合认领行 · `recordPeerWrites` 调认领登记 · `flushPeerDomains` 字段级合并写 + `_peerNoted` 首步清空 · 聚合载荷增 `claims`） |
| 核 · 钩点 | `thincoder-core/agent/dispatch-run.mjs`（写前 / 写后两处——既有钩子内接线） |
| 端 | `thincoder-vscode/src/extension/peer-domains.mjs`（就地扩；落盘若过 500 ⇒ 给拆分方案——认领块外提 `thincoder-vscode/src/extension/peer-claims.mjs`）· 钩点 = 核 `thincoder-core/agent/dispatch-run.mjs` · 去重集清空 = 核 `thincoder-core/agent/run-stages.mjs`（端已取核） |
| 常量 / 文案锚 | `CLAIM_TTL_MS` · `CLAIM_RENEW_FLUSH_MS` · 认领软提示文案——双端各持副本，**测试对拍等值 / 逐字同串**（N-MI2 各端自持；跨端读取比对形态先例 = 端对拍单测；常量 / 文案同串面 = AC-IC11） |

#### 4.4.7 判据（测试层）

单元测试档 = `peer-claims`（核半 + 端半）。
沙箱 = 核 `_setPeersDirForTest` / 端同名缝 + 时钟缝 `_setPeerClaimsTestImpl({ nowFn })` + 判活注入 `_setProcessProbeTestImpl`（`thincoder-core/process-probe-exec.mjs`）。

四路锚：① 写入 / 续约 / 节流（落盘计数断言——零真实等待）；② 过期 / 死属主 / 崩溃残留 / 旧记录兼容（注入时钟与判活）；③ 命中 / 文案逐字 / 去重 / 优先级 / 端侧混合命中合成 / 降级；④ 分存回归（认领落盘不改 `domains` / `updatedAt`；足迹落盘不改 `claims`；既有足迹面行为零变）。

## 5. 投递面：跨实例消息（F-MI10）

> 与 §3 / §4 **分开的一面**：§3 / §4 是感知（只读、软提示、不阻止任何动作）；本面是**投递**——它会在目标会话里真的起一轮，所以它有自己的一套判据（§5.6），不沿用 N-MI3「感知面纯只读」。
> 目标 = 用户 / agent 把一个实例要说的话直接送到另一个实例（跨仓也算），省掉人肉转录；agent 之间也能互问，并靠**请求号**把回复对上原请求。

### 5.1 选型与先例

- **最近先例**：同机多实例协作的**文件即通道**形态（§2 E 类共享浏览器锁 / §4.2 每实例单文件登记）；与「投递」最接近的既有面 = **空闲唤醒面 + 步边界投递**（机制单源 = `docs/core/design/AGENT-LOOP-ASYNC-POOL.md` §6.30 / §6.34 / §6.8）。
- **最近先例（本批两决策 · D-MI34 ∥ D-MI35）**：端壳向核闩注入**判据谓词** = 既有形（`thincoder-desktop/src/main/suspension-timers.mjs` 的 `busyOf: (key) => busyOf(key) === true || inWindow(key)` 与 `inWindow`）。
  - **对齐**：判据住端壳、核闩零副本——`ready` 同形。
  - **偏离一处**：既有谓词都带缺省（`busyOf = () => false` / `inWindow = () => false`），`ready` 无缺省、缺了装配即抛。理由 = 这两个缺省正是「替调用方定了一个没有依据的值」：恒真 ⇒ 空转取件，恒假 ⇒ 永不取件，两个都静默，与本批病根同形。
  - **可见行一侧无偏离**：`inboxBlockedLine` 单构造 + 三端只调是既有形（§5.4），`reason` 只进日志、不加行。
- **对齐**：唤醒载体复用既有一次性 deadline 闩族（`thincoder-core/agent/timers.mjs` 的 `createTimerWatch` 形态）；投递形态复用既有「用户消息 → 主会话」的**落法**（`thincoder-core/context.mjs` 的 `pushReal` 落一条 `role:"user"` 消息——但只经 `prepareRun` 的输入串落一次，不是单独推一条历史，见 §5.4「落法」条）；来源标记沿用投递渲染标识制的形态（消息首部一行标识）。**取件时机不复用既有排队通道**——它的深度是「一步」（§5.4）。
- **偏离的候选失败面（既有件为何不能原样当唤醒源）**：既有空闲闩只认一个唤醒源——依据 `docs/core/design/AGENT-LOOP-ASYNC-POOL.md`「① **仅系统类消息可自唤醒**」与「其它注入面（用户排队消息 / peer 提醒 / stall / goal / task 提醒）**零唤醒面**」⇒ 跨实例 inbox 要做唤醒源，必须给闩族补一条。
- **调研面（已查）**：`docs/core/design/AGENT-LOOP-ASYNC-POOL.md` §6.8（步边界 pickup）/ §6.30（空闲唤醒面 · 端支持面）/ §6.34（投递两时点）· `docs/core/design/AGENT-LOOP-UPSTREAM.md` §6.33（投递渲染标识制）· `docs/core/design/SESSION.md` §6.2（判活 / 槽位面）——**相关面全部命中**：投递通道与唤醒闩都已在，缺的就三件——机器级寻址面、一条唤醒源、一条请求号对账面。
- **本批两项新决策的调研面（已查）**：`docs/vsc/design/PROJECT-SWITCHER.md` §4.1 无工作区守卫——逐字「**判据（单源）**：`hasWorkspaceFolder()` = `(vscode.workspace.workspaceFolders?.length ?? 0) > 0`」。
  - **命中什么**：就绪判据的可用件（判定侧）；同档守卫形（带提示）与它并存 ⇒ `ready` 取判定侧、不取守卫侧。
  - **行面承载**：受阻行 / 丢失行的端面承载已住 `docs/desktop/design/IPC.md` §2「取件行注」（本批不改它，§2.2 同判）。
  - **无「none relevant」项**：两处都命中。
- **拒绝的替代**（代价写清）：
  - **每实例本地监听面**（命名管道 ∥ `127.0.0.1` 端口）：三端各一套监听生命周期——端口 / 管道命名冲突、命名空间、退出清理；收益仅为「送达即时确认」。
  - **持久待取队列**（目标不在线也落盘、下次启动再投）：用户已否决（延迟送达对现场无用）。
  - **同步问答面**（发送方挂住等对方回话）：用户已否决（非阻塞）。
  - **选定 = 文件 inbox + 既有空闲唤醒（**一轮一取**）+ 请求号对账**：零监听面、零新进程、零等待；不可达在发送面当场可见。
- **攻击面如实记（入选方案自带，不是监听方案独有）**：inbox 落盘即被注入为 `role:"user"` ⇒ 与本机同用户的任意进程都能往任意会话投一条「用户消息」，而 §5.4 的来源标记可伪造——它声明「这条消息自称从哪来」，不是认证。独占边界 = `~/.thincoder/` 目录本身的用户权限。本面不做来源认证（§5.9 · D-MI30）——弃监听方案的理由因此只剩端口 / 管道的生命周期与命名冲突成本。

- **新造词三问答（D-MI31 ∥ D-MI32 ∥ D-MI33 的新可见面）**：
  - **取件闩本身 = `existing but unusable`**：既有一次性 deadline 闩 `createTimerWatch`（`thincoder-core/agent/timers.mjs`）**族形可用、契约不可用**——它按「一个唤醒源、响一次清一次」工作，响过必须由别处重装；取件闩要的恰是「没人叫也还在」。⇒ 另立 `createInboxWatch`：借定时器 + `unref` 的形态，不借名字、不借生死契约。
  - **`blocked` 是本面新词，`stall` 不是空位**：`stall` 在本仓已指三件别的事——advisor 零产出看门狗（`thincoder-core/advisor/run.mjs`「onStallRound: callbacks?.onStall」）· 在飞回合静默轻显形（`thincoder-core/i18n.mjs`「停滞轻显形」）· 子代理环路（`thincoder-core/agent-tools/subagent-scheduler.mjs`「export function detectStall(parent)」）⇒ 取件闩受阻**不叫 stall**：`onBlocked(ms, pending)` / `ev:inbox-watch-blocked` / `ev:inbox-watch-blocked-empty` / `INBOX_BLOCKED_MS`。四个 stall 会让日志与代码里「哪个 stall」变成猜。
  - **其余新词住新建档**：`createInboxWatch` / `onTake` / `onBlocked` / `takeInbox` / `sweepInbox` 都在本批新建的三档内（§5.8），不借用既有导出名。
  - **`ready` = `existing but unusable`**：可用件 = `thincoder-vscode/src/extension/workspace-guard.mjs` 的 `hasWorkspaceFolder()`（判据单源，机制面 = `docs/vsc/design/PROJECT-SWITCHER.md` §4.1）。
  - **不可用的那一半** = 同档 `blockOnNoWorkspace()`：每拍弹提示 + 置去重标志，带副作用 ⇒ 只取判定侧、不取守卫侧。名字是新的（核闩签名的参数名），既有导出面无同名项。
  - **`"busy"` / `"carrier"` = 新字面，住既有事件的新字段**：两者只作 `ev:inbox-watch-blocked` 的 `reason` 值（本批新增该字段），不新增事件名、不与既有日志键面重名。
- **§5.1 自引面与本面同名的处置**：§5.1 记的「其它注入面（用户排队消息 / peer 提醒 / stall / goal / task 提醒）**零唤醒面**」里的 `stall` = 那条**注入提醒**面（回合内推一条提醒）；本面的是**取件闩受阻的可见行**——同一个词指两件事，故本面改叫 `blocked`（上条）。两者都零唤醒面，语义各自独立。

### 5.2 寻址：机器级名册（D-MI25 · D-MI28）

- **名册** = `~/.thincoder/instances/{sessionId}.json`，内容 `{ sessionId, pid, end, cwd, startedAt, updatedAt }`；单写者 = 实例自身（end marker 同型）。
- **登记点 = 取件面装配处**（D-MI28）：条目只在「本实例已装上取件闩」时写入——会话起点装上闩即登记，回合收尾刷新 `updatedAt`，正常退出删除。**无取件面的会话不入册**（headless：`chat` 一次性 / ACP / 直连 `runAgent`）——它取不走任何一条消息，列进名册只会骗发送方。
- **为什么新建而不复用 `~/.thincoder/peers/`**：peers 记录只在**写过文件**的回合落盘（§4.2 写点 = 回合级，「本回合无写入 → 不写」）⇒ 空闲实例根本不在其中，不能当名册。名册的口径 = 「有取件面 ⇒ 有条目」，与「写过什么」无关。
- **跨仓可寻址** = 名册天然跨 cwd：`cwd` 是记录**字段**，不是目录键。`peer_instances` 的语义（同 cwd、白名单四键 `{pid, end, sessionId, slots}`）**零改**——两者不合并、不复述（N-MI4 白名单不动）。**身份族判据只在感知面**：`peer_instances` 的 `isProductProc` 保留（F-MI6 防误报），投递面不判（§5.5）。
- **工具面（两个）**：
  - `instance_list`（只读 · 无参）→ 机器级**可投递**实例 `[{ sessionId, end, cwd, pid }]`（self 已排除）。列的判据 = **名册有条目 ∧ pid 活**（pid 明确死 ⇒ 不列；判活探测失败 ⇒ 不列——未知不当可达）；**inbox 目录可写不在列面判**——它是写面运行时的判定，列面试写就是写（一个 `readonly: true` 的免审批读面不写盘）⇒ 与发送面**同一把尺的射程 = 底座那两条**（在册 ∧ pid 活），第三条只归发面；**不判身份族**（两处同口径）——一处判一处不判会变成「列表藏起来的目标，发送面其实收得」；
  - `instance_send`（写面）→ 参数 `{ sessionId, text, re? }`：`sessionId` 与 `text` **无缺省值**（缺参即拒并点名参数）；`re` 可选，形态 = **非空字符串、长度 ≤ 128**——形不合（非字符串 / 空串 / 超长）即拒并点名 `re`（与另两参同一口径：不静默丢弃一个坏值）。

### 5.3 发送：非阻塞 + 请求号（D-MI27）

- **发送方不等待**：`instance_send` 做完「可达性判定 + inbox 原子写」就返回，**不等对端读、不等对端答**。回程什么时候来、来不来，与这一次调用无关。
- **回执（返回值，逐字键面）**：

```json
{ "requestId": "<epochMs>-<pid>-<rand>", "target": { "sessionId": "<id>", "end": "<end>" }, "status": "delivered-to-inbox" }
```

  `requestId` = inbox 的 `msgId`（**同一枚 id，不造第二枚**）；`status` 只说「落进目标 inbox 且目标当时可达」——**不说「已读」**（§5.9）。
- **回程 = 同一通道上的普通消息**：对端回话就是一次 `instance_send`，`sessionId` = 原消息标记里的 `session=`（回程地址随请求一起送到，对方不用猜），`re` = 原 `requestId`。
- **`re` 的形态（为什么是字段而不是第二个 action）**：回话与首发是**同一操作**（一次跨实例投递）——分成两个动作会把名册 / 可达性 / inbox 写整条路径复制一份，两份判据日后必漂；字段化只加一个可选键，一条路径。
- **`re` 只用来对账，不是派活单号**：它不产生等待、不产生从属、不产生待办追踪——对端**可以不接、可以回一句「我不做」、也可以回一条与请求无关的话**（§4 边界「发消息 ≠ 派活」在这里的落地句）。本批不做「未回请求」的提醒 / 超时 / 待办面（用户没要；加提醒 = 替用户立规矩）。
- **对不上号的 `re` 怎么处置**（D-MI30）：本面**不保存已发请求登记表** ⇒ 收到一个本端不认识的 `re` 时，按普通回程消息**原样注入**——不报错、不改写、不丢弃，标记行照带 `re=<那个号>`。理由：「这条回复对哪次请求」的核对由读者（会话里的 agent / 人）做；本面存一份登记表就是一套待办追踪面，正是 §4 边界排除的东西。号对不上既不是发送方的错，也不是接收方该拒的理由。

### 5.4 投递与取件

- **inbox** = `~/.thincoder/inbox/{sessionId}/{msgId}.json`，内容 `{ msgId, text, sentAt, re?, from: { sessionId, end, cwd } }`；原子写 = `writeSessionFile`（§4.4.1 同原语）。
- **取件口径 = 一次性**：取到即 `rename` → 删除；进程重启**零重放**；目标在取走前死掉的残留条目由扫描按 `INBOX_STALE_MS`(24 h) 清理并记 `logEvent`，**不重投**（这就是「不落待取队列」的落地形态）。
- **取件时机（一句话）：只在目标没有在飞一轮时取件**。取件点 = 核 `createInboxWatch({ ready, isBusy, onTake, onBlocked, timer, clear })`，族形同 `createTimerWatch`（一次性 deadline 闩、`INBOX_POLL_MS = 1000`、`unref`）。
- **自续闩**（D-MI31）：一拍 = **先重臂、再试取件**（`inFlight` 标志防重入：上一拍还没跑完 ⇒ 本拍跳过，定时器照常走下一拍）。**闩的在位不依赖任何别的代码路径**——装上之后，只有「这一端的会话 / 面板不在了」那几处撤得掉它，而那几处本来就可见（名册条目同点删除 ⇒ 发送面当场报「无此会话 ∥ 目标已退出」）。
  - **撤闩点 = 该端会话 / 面板不在的那几处**：逐端逐点见 §5.8 端装配表（CLI 一处 · VSC 两处 · 桌面三处——桌面多的那一处是切项目级联）。**「回合起点 / 入窗 / 转空工作区」都不在其列**：它们只让这一拍的门打不开（`ready()` ∥ `isBusy()` 闸住），不撤闩。
  - **VSC 工作区转空不是撤闩点**：那一支只销毁载体（`_agent = null`），门交给 `ready()` 闸住（D-MI34）——转空期零取件、跨阈出受阻行。
  - **不需要「工作区回来」的重臂面**：闩从未撤，`ready()` 转真那一拍就是恢复点。
  - **重臂是无条件不变式**（不是「通常先做」）：重臂落在本拍**任何可能抛出的调用之前**——`ready()` / `isBusy()` / 取件 / `onTake` 全在它之后，且重臂本身不进 `try`（不让 catch 把它跳过）。取件段抛出 ⇒ 本拍只记 `ev:inbox-watch-err`，**下一拍照常在位**。「先重臂」而把重臂放进 try，等于把 D-MI31 那句「只要进程在、闩就在」降级成「只要本拍没抛，闩就在」——两个不同的承诺。
  - **取出之后的交接契约：失败只有一个真源 = `onTake` reject**（关掉「取走」与「在飞」之间的窗口，同时关掉「一次没观察到在飞就判死」这条误判路）：`onTake(messages)` 返回 promise（同步返回 `true` 不再算「已开轮」；**不收 `agent`**——载体由端壳自持，理由见 D-MI34），**只在「这一轮已登记为在飞」时 resolve**——口径 = 该端自己的判忙谓词（`isBusy`）自这一刻起读到真、直到本回合结束；**没开成轮的任何原因都 reject**（入口同步抛；入口返回后没起轮；取件路径拿到 `resume=true`；端侧前置条件不满足，如无工作区）。闩**不拿 `isBusy()` 的一次读数推断失败**——它翻真取决于开轮的异步进度，闩看不见；拿一次未翻真判死，两种本来合法的状态就被报成丢失：**短轮**（一拍内起完，下一拍看时已结束）与**审批悬挂**（`autoTurn:false` ⇒ 手动态走审批面），后者的代价是「一条已送达的消息被报成丢失」再叠加「判死之后下拍取第二条 ⇒ 两轮并行」——正是 F-MI10「不打断」禁止的形态。resolve ⇒ 下一拍 `isBusy()` 为真、本拍零取件；reject ⇒ 走 D-MI32 出口（`ev:inbox-watch-take-lost` + 逐字可见行），闩照常走下一拍。
  - **窗口内的防重入只靠 `inFlight`**：`fire()` 一直 await 到 `onTake` 落定（resolve 或 reject）才返回；下一拍见 `inFlight` 为真即跳过（零 stat）。「这一轮在不在飞」只有一个判据源 = `onTake` 的落定 + 端壳的 `isBusy()`；闩不自持第二个标志——两处判据只会再分叉一次。
  - **边界（写明，不冒充覆盖）**：端侧入口既不 resolve 也不 reject（挂死）⇒ `inFlight` 一直为真、闩不再取件。这不是「开轮没成」（开没开成无从判定）；D-MI33 ∥ D-MI35 的计数器盯「在飞」与「不就绪」两支，**不盯「上一拍还没落定」**，本批不给这种挂死新增探测器。
  - 成本：空闲拍 = 一次 inbox 目录 stat；**在飞回合 = 一拍一次内存判据、零 stat**（`isBusy()` 真 ⇒ 本拍零取件、零 fs）。
  - **回合起点不撤闩**：撤闩 = 「要靠别人再把你叫醒」的契约，而那个「别人」正是会漏掉叫醒的地方。回合尾与模态关闭点的 `sync()` 保留，但只作**幂等补位**（已在位 ⇒ 零动作）——它换来的是「轮尾 ≤ 1 ms 取件」而不是「≤ 1 s」，**不再承担存活职责**。
  - **`isBusy` 的定义域 = 「有活干」**（在飞回合 ∥ 挂起态 ∥ 用户自发模态）。**「还没有载体」不在其列**——把它折进 `isBusy` ⇒ 「面板开着、一轮没跑过」的实例永久算忙，闩首拍即死。
  - **就绪判据（D-MI34）：`ready()` = 这一端此刻能不能开一轮，由端壳给，核闩不从端壳对象上推。** 核闩**不读 `agent` 对象**了——三端对这个对象的用法各不相同（VSC 的 `runPanelChat` 自己造 agent，`onTake` 收下的那个一下划线就丢；CLI 的 `turn` 闭包自持；桌面按键查闩表里的条目），核闩却拿它当「门开不开」的判据 ⇒ 一个端的需求被当成了三端的规则。三态：`ready() === false` ⇒ 本拍零取件、计数记不就绪（下条），闩照续；`true` ⇒ 正常取件；**没有 `onTake` 也算不就绪**（没人能开轮 ⇒ 取了就是静默丢，与 `ready()` 返假同义，不再另立一支）。
  - **判据与端壳开轮面的早退条件同源**：端壳因「无工作区」早退、而 `ready()` 报真 ⇒ 同一个问题被答了两次，且这两次一定会分叉。端侧落地 = 两处取**同一个谓词**，不各写一份等价判断。
  - **判据不取守卫形**：`ready()` 每一拍跑一次 ⇒ 取的必须是端壳那个**判定**（VSC = `workspace-guard.mjs` 的 `hasWorkspaceFolder()`），不是代判定顺带出提示的守卫形状（`blockOnNoWorkspace` 会弹提示并置去重标志）——判据每秒钟弹一次框，比不报更坏。机检 = §5.8 已接判据 ⑧。**射程如实登记**：⑧ 证的是「取件接线里没走守卫形」；探针体里另写一句提示 ∥ 埋点的路不在它的射程内，本批不给拍内探针的副作用面另立判据。
  - **`ready` 是必填参数，无缺省**：缺了就是「端壳没答这个判据」，核闩不许替它猜一个（猜真 = 空转取件，猜假 = 永不取件，两个都不报错）——装配即抛，点名缺的参数。`onTake` 仍可缺省（缺省 = 不就绪，见上条）。
- **武装点（一次性）**：**会话起点**装上闩并登记名册。这一处不可省——刚起来、一个回合都没跑过的空闲实例没有「回合链尾」；退出 / 面板销毁撤闩并删除名册条目。
- **补位点（幂等 · 零存活职责）**：回合链尾 · 用户自发模态关闭点（CLI `reevalTimerWake` / VSC 面板回合尾 / 桌面键面接管）。**补位点不受「重武装守卫」约束**——守卫管的是「要不要无人自动开一轮」，管不着「门还能不能开」：闩哑掉不会让守卫少开一轮，只会让消息躺在盘上没人取。
- **目标在跑一轮 ⇒ 消息留在 inbox，等该轮结束**：不注入、不改该轮指令流；该轮结束后的下一拍（或链尾补位）⇒ ≤ `INBOX_POLL_MS` 取走，作**下一条用户消息**起**新一轮**。**「结果多久能看到」**：目标空闲且闩在位 ≤ 1 s；目标在跑一轮 = 该轮结束 + ≤ 1 s（长回合可等上数十分钟——这正是「等处理完」的含义）。
- **开轮没成 ⇒ 当场明说**（D-MI32）：消息在取件时已从盘上删除（一次性口径不变），所以「开轮没成」不能靠重投挠回——源壳开轮面 reject ⇒ 记 `ev:inbox-watch-take-lost`（带 msgId 列表）+ 目标端可见行（逐字锚见下）。不说 = 发送方与目标都以为送到了。
- **取件开轮恒为 `resume=false`**（起新一轮，不续跑）：§5.4「落法」的落库保证挂在 `prepareRun` 的 `!resume` 分支上——走 resume 时那一串**不落成 user 消息**，而消息在取件时已经离盘 ⇒ 静默丢，且 `onTake` 会照常 resolve（端壳以为开成了），D-MI32 的出口也不会触发。所以取件路径的开轮面**不带 `resume`**；端壳若在取件路径上拿到 `resume=true`，按「开轮没成」出口处理（同一个 `ev:inbox-watch-take-lost`），不静默落空。
- **两条可见行（逐字锚 · 三端同形 · N-MI2 对拍）**：

> `[cross-instance message · turn failed: {n} lost ({msgIds})]`
> `[cross-instance message · pickup blocked {ms}ms: {pending} pending]`

  - 首行 = D-MI32 的丢失行：`{n}` = 条数、`{msgIds}` = 逗号连接的 msgId（与日志同一份列表）。
  - 次行 = D-MI33 的受阻行：`{ms}` = 已受阻毫秒、`{pending}` = 待取条数。
  - 落地端 = **CLI ∥ VSC ∥ 桌面**：行文同一（`thincoder-core/instance-inbox-watch.mjs` 的 `inboxTakeLostLine` ∥ `inboxBlockedLine` 是唯一构造点，三端只调不算）；呈现面各端自持——CLI 走 `pushLine`；VSC 走面板行（`thincoder-vscode/webview/chat-messages.js` 的 `addInboxLine`，host → webview 的 `inbox` 消息类型登记于 `WEBVIEW-PROTOCOL.md` §3.2）；桌面走 `ev:inbox`（`{ key, kind, text }`，细目 = `docs/desktop/design/IPC.md` §2「取件行注」）⇒ 归约 `thincoder-desktop/renderer/events-wake.mjs` 的 `onInbox` → 流内行组 `[data-inbox]`（`thincoder-desktop/renderer/views/chat-chrome.mjs` 的 `syncInbox`）。三端文案逐字、一字不差；机检 = §5.8「已接判据」④。
  - **端差（同形 ≠ 同实现）**：三端行文逐字一致、由同一两种失败面触发（`onTake` reject ∥ 受阻跨阈）；消散面各端呈现面自持——桌面是行痕族第四员，服从**两门清点**（首屏门 ∥ 回合起跑门；清点面逐名 = `stopMark` ∥ `timerNotice` ∥ `compress` ∥ `helpLines` ∥ `digest` ∥ `inboxNotice`，两槽一并摘），故桌面这两行与停止痕 / 到期触发行同生同灭；CLI ∥ VSC 的行按各自呈现面的既有行为走，本条不新增消散规则。行组在场 ⟺ 本键切片在场（行数 = 槽数），一类一槽 ⇒ 两行互不覆盖。
  - 与来源标记同族（同上英文前缀），落在人读线上。
- **门开不了要出声**（D-MI33 ∥ D-MI35）：**取不上件有两因**——`isBusy()` 为真（有活干）∥ `ready()` 为假（载体不就绪）。任一因连续成立每跨过一个 `INBOX_BLOCKED_MS`（默认 5 min）做**一次** inbox 目录 stat——待取非空 ⇒ 记 `ev:inbox-watch-blocked`（`{ms, pending, reason}`，`reason` = `"busy"` ∥ `"carrier"`）+ 源壳 `onBlocked(ms, pending)` 可见行；空 ⇒ 记 `ev:inbox-watch-blocked-empty` 不出行；两因皆消即计数归零。`ms` = **连续取不上件的总时长**（理由中途换了不重算：人读线问的是「等了多久」），`reason` = 本刻那一支。**两因共用一条可见行**（D-MI35）：人要的是「有人在等你、而且取不上」；「为什么取不上」是诊断，住 `reason` 字段与日志，不往人读线再加一种行——多一种行就多一组端侧槽位、消散规则与跨端逐字对拍面。判据 = 一条内存计数器 + 每阈一次 stat，不新建监控面。
- **这个探测器的覆盖边界（写明，不冒充全覆盖）**：探针住在**拍内** ⇒ 它看得见「在拍但不取件」（长回合 / 卡住的模态 / `processing` 未复位 / **载体不就绪**），**看不见「没有拍」**。「没有拍」不靠这个计数器兜，靠 D-MI31 把它变成不可达状态：闩在位是无条件不变式（重臂在一切可抛调用之前、回合起点不撤闩）⇒ 进程在、拍就在。残留面如实登记 = 宿主事件循环被独占（整机假死，症状远大于本面）∥ `unref` 闩在不该退的进程里被退掉；两者都不由本计数器覆盖，本批也不新增探测器。
- **与「待取队列」的区别**：目标活着、消息已在它的 inbox 里，只是还没被取——已投递条目，取走即删；「待取队列」指目标不在时替它存着，已否决（§5.5 不可达当场报错）。
- **与既有「用户排队消息」通道的关系 = 借用落法，不借深度**：既有排队通道在**循环头**取件——依据 `thincoder-core/agent/turn-loop.mjs`「consumeQueuedInput?.(agent)」，该调用在 `runTurnLoop` 每步循环头，故深度 = **一步**（一次 LLM 调用 + 其工具执行段）：一条排队消息在**当前一轮中途**交给下一步生效。
- **跨实例消息不挂 `consumeQueuedInput`**：它要的是整轮跑完（F-MI10「送达不打断」）⇒ 取件点只有空闲闩这一处。与排队通道相同的只是**终点**——会话里落下的是一条真 `role:"user"` 消息；落法见下条，不经排队通道。
- **不另造第二套排队**：跨实例消息**不进** `state.pendingInput`，在途状态就是 inbox 目录里的一次性文件。目标端因此不触发排队消息的消费回执（依据 `thincoder-cli/src/tui/queued-pickup.mjs`「pushLine("[sending queued message]", C.tool)」）；读者靠消息首行来源标记分出这是跨实例消息。
- **会话形态 = 真 user 消息**：首行是来源标记（逐字锚），空行，之后是 `text`：

> `[cross-instance message · from {end} pid={pid} session={sessionId} cwd={cwd}]`
> `[cross-instance message · from {end} pid={pid} session={sessionId} cwd={cwd} · re={requestId}]`

  不带 `re` = 首发；带 `re` = 回程（对账靠 `re`，其余形态一字不差——读者一眼能分出「人说的」与「另一个 agent 说的」，也能分出「这是对哪次请求的回复」）。

- **落法 = 端壳开轮面的输入串，不是「先 `pushReal` 再起轮」**：取件闩把消息组成字符串——一条走 `crossMessageContent(msg)`、一批走 `crossMessageText(messages)`（各占一段；一轮一取 ⇒ 同批同轮）——交给端壳**作为普通用户回合的 `text`** 开轮。核 `prepareRun` 在 `!resume` 时无条件把这一串落成 user 消息：依据 `thincoder-core/agent/setup.mjs`「pushReal(agent, { role: "user", content: input })」。所以「先推一条历史、再以空串开轮」会落成**两条** user 消息，其中一条 content 为空、直达 provider——这就是本条写死落法的理由，照「先 pushReal」再写一遍会重新撞上。走输入串 ⇒ 恰好一条真 user 消息，标记行逐字不变。VSC 载体为双数组形，同一条消息经端适配 `thincoder-vscode/src/agent/run-helpers.mjs` 的 `pushReal(history, fullHistory, msg)` 落。
- **`[system reminder:` 族不适用**：该前缀是机器线独有（`docs/core/design/AGENT-LOOP-ASYNC-POOL.md` §6.30.3 D-TW2——人读面不显示），而本条要求「一眼分出人说的 / 另一个 agent 说的」，标记必须落在人读线上。
- **起的轮 = 普通用户回合**（`autoTurn:false`）：手动态照常走审批面——目标端有没有人在场是目标端自己的语义，本面**不新增静默批准路径**（投递不越权）。
- **不设长度门**（D-MI30）：一次投递的长度与「人往会话里贴一段字」同面，既有限制在会话层（上下文压缩 / 模型窗口）——投递面另立一个字节上限，会拒掉本需求的立项场景本身（把一段需求原文贴给另一个实例），且没有任何读数为那个数作根据。

### 5.5 可达性：先判后写，不可达当场报错（D-MI26 · D-MI28）

判定 = **写前一次**，判据三条：名册有条目 ∧ pid 活 ∧ inbox 目录可写。**判据三条 ≠ 报错态四条**（两个数不是一回事）：`pid 活` 那一次判活分三支（活 / 明确死 = **dead** / 探测失败 = **unknown**），`名册有条目` ⇒ **无此会话**，`inbox 目录可写` ⇒ **inbox 不可写**——1 + 2 + 1 = 四条。四条各有自己的报错口径——**全是业务失败结果**，点名目标 + 原因 + 「换一个 sessionId」的建议，不是被吞掉的异常、不是空结果：

| 态 | 判据 | 报错（点名对象） |
|---|---|---|
| 无此会话 | 名册无该 `sessionId` 条目 | 无此会话（点名 id）；若该会话确在运行但无取件面（headless：`chat` 一次性 / ACP / 直连 `runAgent`），它不入册——一并说明 |
| dead | pid 明确不在 | 目标已退出（点名 id 与 pid） |
| unknown | 判活探测失败（探测不可用 ∥ 未返回结果） | 无法确认目标可达（点名 id 与失败面）——**不当成可达** |
| inbox 不可写 | `mkdir` / 原子写失败 | 目标 inbox 不可写（点名 id 与失败面原文） |

- **本面不判身份族**（D-MI26）：投递面只问「这个 `sessionId` 在不在册」（存在）与「pid 还在不在」（活）。消息落在 `~/.thincoder/inbox/{sessionId}/`，**目标按目录名取件、不按 pid 认人** ⇒ pid 认错也发不歪（不会投错会话），最坏是躺在盘上无人取（代价与上界 = §5.9）。身份族核查（`isProductProc(cmdline)`）是**感知面**的规则——它防的是「无关进程被列成同伴」这种误报（需求档 F-MI6），投递面没有这个失败模式；为一个发不歪的失败面架一道身份关卡，拒掉的恰恰是走查实例 / 非标准启动形态的会话。`peer_instances` 的该判据一个字不动。
- **与「非阻塞」不矛盾**：判定的是**写的那一刻**目标能不能收；判定通过之后的取件延迟与回不回话，不在这一判定里。

### 5.6 非功能面（N-MI8）

| 面 | 标准 |
|---|---|
| 发送不阻塞 | 调用在「判定 + 落地」后返回，不等对端读、不等回话；最坏成本 = 一次判活探测 + 一次原子写 |
| 不打断 | 目标在跑一轮 ⇒ 零注入、该轮指令流零变；该轮结束 + ≤ 1 s 起**新一轮**（闩自续、在飞零 stat、轮尾补位——§5.4） |
| 延迟上界（取件） | **前提 = 目标已在册（即它有取件面）**：空闲且闩在位 ⇒ ≤ `INBOX_POLL_MS`(1 s) + 一轮起跑；在跑一轮 ⇒ 该轮结束 + ≤ 1 s |
| 失败可见 | 发送面：四态均当场报错点名（§5.5 表）；取件面：残留清理 / 取件抛错（`ev:inbox-watch-err`）/ **开轮失败**（`ev:inbox-watch-take-lost` + 逐字可见行）/ **闩取不上件跨阈**（在飞 ∥ 载体不就绪两因，`ev:inbox-watch-blocked` 带 `reason` + 同一条逐字可见行）各记 `logEvent`——四条失败面各有一条判据（§5.8 ⑨⑩ 与「已接判据」④），不只是一句陈述 |
| 不持久化 | inbox 条目一次性、取后即删、启动零重放；无「对端确认后仍留存」的持久队列；代码零待办追踪面 |
| 成本 | 空闲期一拍三件事 = ① inbox 目录 stat 一次（**唯一的 IO**）② `ready()` 就绪判据一次（内存读）③ 闩重臂一次（内存、`unref` ⇒ 不占线程）；**在飞回合 = 一拍一次内存判据、零 stat**（闩在位，取件前早退）；受阻跨阈期 = 每 `INBOX_BLOCKED_MS` 一次目录 stat；零新增进程、零监听 socket、零端口、零轮询线程 |

### 5.7 防刷屏：不设防，但把风险写在明处

- **不设防**（用户口径「互相发」）：不加配额、不加批准门——设防 = 替用户立规矩，用户没立。
- **风险（可见登记）**：两个 agent 可以 A↔B 无界往返，每条都起一轮 = 持续 token 消耗；请求号让往返**可对账**，但不限制次数。
- **缓解是结构性的而非规则式的**：§4 边界「发消息 ≠ 派活」⇒ 收到消息的实例与发送方无任何从属关系，用户随时可中断该轮。
- **人 → agent 的落点**（D-MI29）：本批**不设人直接发的人面入口**——用户在自己这一端说话，由本端的 agent 调 `instance_send` 替他发出去（跨仓也算）；agent ↔ agent 是同一个工具由 agent 自主调用。两个方向共用一条通道、一套判据；人面直发要另立一个入口再加一套人面安全面，本批不预埋。
- **处置**：用户看见后自定（配额 / 白名单 / 只许经本地 agent 发）——另开一批；本批**不预埋开关**（预埋开关 = 用户看不见的规矩）。

### 5.8 模块落点与判据（测试层）

- **核件按面分三档**（本批新建，落 `thincoder-core/`；三面压进一个文件会养出一个谁都改的巨档）：

```text
thincoder-core/instance-registry.mjs     名册：registerInstance / refreshInstance / unregisterInstance / listLiveInstances + instance_list 工具
thincoder-core/instance-inbox.mjs        inbox：可达性四态判定 / sendMessage / takeInbox / sweepInbox + instance_send 工具 + INBOX_STALE_MS
thincoder-core/instance-inbox-watch.mjs  取件闩：createInboxWatch（自续拍 / inFlight 防重入 / **`ready` 就绪探针（必填、无缺省；端壳给，D-MI34）** / `onTake(messages)` 交接契约：resolve = 已登记为在飞，reject = 开轮没成 / 幂等补位 / 撤闩 / 受阻报面（两因：在飞 ∥ 不就绪，D-MI33 ∥ D-MI35））+ crossMessageContent / crossMessageText（逐字标记 + 一批拼串，作端壳开轮的输入串）+ **inboxTakeLostLine(messages) / inboxBlockedLine(ms, pending)**（§5.4 两条可见行的**唯一构造点**——三端只调不算，N-MI2 逐字对拍因此可机检）+ INBOX_POLL_MS + INBOX_BLOCKED_MS
```

  - 注入缝：`_setInstanceDirForTest` / `_resetInstanceDirForTest`（名册档——`thincoder-core/instance-registry.mjs`）与 `_setInboxDirForTest` / `_resetInboxDirForTest`（inbox 档——`thincoder-core/instance-inbox.mjs`），两缝各自换目录 · `_setPeerMessageTestImpl({ nowFn, aliveFn, timer, clear })`（住 watch 档，三档共用一份注入面；本面零命令行探测 ⇒ 无 `cmdlineFn` 槽）。
  - 工具导出面：`instance_list` 随名册档、`instance_send` 随 inbox 档；装配点 = `peer_instances` 同点 = 核 `assembleBuiltinTools`（`thincoder-core/tools/index.mjs`——两个壳同得；CLI 的 `make-agent.mjs` 只做 MCP 合入与工具排除表，不登记工具）；VSC 另在自有工具表 `thincoder-vscode/src/tools/index.mjs` 并两件（与 `peerInstancesTool` 同处）。
- **端取件装配（三端各一处，形态同一：闩族 + 武装 / 撤闩挂点 + 名册登记）**：

| 端 | 闩族 / 装配落点 | 武装点 | 撤闩 / 登记面 |
|---|---|---|---|
| CLI | `thincoder-cli/src/tui/index.mjs`（`turnCtx.timerWatch` 邻位） | 会话起点（装配处、一次性）· 补位：回合链尾（`thincoder-cli/src/tui/agent-turn.mjs` 的 `runAgentTurnInner` `finally`——**`timerRearmBlocked` 只包 `timerWatch`**）· 模态关闭（`reevalTimerWake`） | 退出钩子 `process.on("exit")` 撤闩并删名册条目（`thincoder-cli/src/tui/index.mjs`）；无切槽撤闩面（回合起点不撤） |
| VSC | `thincoder-vscode/src/extension/timer-watch.mjs`（`syncTimerWatch` 同档增 `syncInboxWatch`） | 面板创建（会话起点、一次性：`thincoder-vscode/src/extension/chat-panel.mjs` 的 `resolveWebviewView`）· **切槽重臂**（`thincoder-vscode/src/extension/panel-session.mjs` 的 `loadSession` 调 `syncInboxWatch(panel)`——撤旧立新，**不在撤闩列**）· 补位：回合尾（`thincoder-vscode/src/extension/panel-turn-stages.mjs` 的 `syncInboxWatch(panel)`） | `thincoder-vscode/src/extension/chat-panel.mjs` 的 `dispose` / view 销毁**两处**（同点删名册条目；回合起点不撤）。**转空工作区仍撤 timer 闩、但不撤取件闩**（那一支只销毁载体——撤了没有「工作区回来」的重臂面，闩就哑在面板里，判据 ⑨）。**切槽不在此列**——timer 闩按在途 timer 现算（撤与不撤等价），取件闩撤了就没人再装。**就绪判据（D-MI34）= 面板在场 ∧ 工作区在场（= `thincoder-vscode/src/extension/workspace-guard.mjs` 的 `hasWorkspaceFolder()`——与 `runPanelChat` 的无工作区守卫同一个判定；**不是**会弹提示的 `blockOnNoWorkspace`）∧ 未销毁**——**不是 `panel._agent != null`**：面板开着、一轮没跑过的实例就是被后者判成「永不就绪」的（`_agent` 五处置空、只在回合装配路径上赋值，而 `runPanelChat` 自己造 agent）|
| Desktop | `thincoder-desktop/src/main/suspension-timers.mjs`（`createSuspensionTimers` 的键面闩表；闩体 = `thincoder-desktop/src/main/timer-watch.mjs`） | 键槽创建（会话起点、一次性：`armInbox`）· 补位：回合尾接管 / 出窗结算（`sync(key, agent)` 同点，幂等） | **撤闩分族**（`thincoder-desktop/src/main/suspension-timers.mjs`）：**取件闩只三个撤点撤**——会话清除面 ∥ 面板销毁（两路同走 `disarm` ⇒ `inbox.disarm(key)`）∥ 切项目级联（`disarmAll`，逐键 `abort` 之外兜底同撤）。**入窗不撤取件闩**：`thincoder-desktop/src/main/suspension-drive.mjs` 的 `start` 走 `timers.disarmTimer(key)`（`disarmTimer` 在该档只一处定义，`disarm` = `disarmTimer` + 取件闩的组合）。**无回合起点撤闩面**（该入口已撤）。入窗不是会话死亡 ⇒ 取件闩在位，与 D-MI31 的自续闩形态**对齐**；入窗期取件被 `busyOf` 的 `inWindow(key)` 一支挡着（只出受阻行、不取件），上界见 §5.9。**就绪判据（D-MI34）= 该键的闩槽有载体**；**空载体不是撤闩理由**（D-MI31 同族：撤闩 = 靠别人再把你叫醒）——`sync(key, …)` 不许因载体缺席 `disarm`，撤闩清单不变（仍三撤点）|

  - **「已接」判据（核三端同形；④ 覆盖三端）**：注入假 `timer` ⇒ 到点取件恰一次、`pushReal` 恰一条 `role:"user"` 消息、起一轮恰一次；断言 ①–⑥ 如下（⑦⑧⑨ 各自成条，见后）——① 会话起点不武装 ⇒ 「空闲且从未跑过一轮」的用例红；② 在飞回合 stat 计数为零 ∧ `isBusy` 转假后下一拍取件恰一次（撤闩形态下这条红：那一拍闩已不在）；③ **链尾与模态关闭两个补位点一次都不调用 ⇒ 消息照样取走**（自续闩的判据；撤闩 + 靠链尾重臂的形态下这条红）；④ **两条可见行逐字一致（三端）**：CLI ∥ VSC 各注入一次 `onTake` reject 与一次跨阈受阻 ⇒ 端可见行与 §5.4 两条逐字锚**逐字相等**（对拍断言，不比近似；N-MI2 跨端可机检的那一半）；桌面注入同一两种失败 ⇒ 出站恰 `ev:inbox` 两帧（`kind` = `lost` ∥ `blocked`，`text` 逐字等于核 `inboxTakeLostLine` ∥ `inboxBlockedLine` 的返回值——端侧零构造），渲染面行组 `[data-inbox]` 行数 = 槽数、行文与同一逐字锚相等；⑤ **一拍抛出不影响下一拍**：注入 `ready` 抛错 ∥ `takeInbox` 抛错 ⇒ 本拍记一条 `ev:inbox-watch-err`，下一拍仍取走件（「重臂在可抛调用之前」的不变式，见 §5.4）；⑥ **交接判据 · 两条「不是失败」的状态**（真轮，端级）：**短轮**——`onTake` 起的轮在一拍内跑完（下一拍 `isBusy()` 已回假）⇒ 零 `ev:inbox-watch-take-lost`、零丢失行，且下一拍照常取走第二条；**审批悬挂**——`autoTurn:false` 的轮停在审批面（`isBusy()` 为真）⇒ 零丢失行、零二次取件，批下来之后消息仍在这一轮里（起轮次数 = 1）。旧「一次未翻真即判死」形态下两条都红：短轮红在「报丢失」，审批悬挂红在「报丢失 + 起第二轮」。落点行内坐标随实现轮读端侧空闲面定（形态与挂点已定，不猜行号）。
  - **「已接」判据 ⑦ · 不就绪要出声（D-MI35，本批新增，可红）**：假端 `ready: () => false` + inbox 非空 + `nowFn` 推过 `INBOX_BLOCKED_MS` ⇒ `onBlocked` 恰一次、`ev:inbox-watch-blocked` 恰一条且 `reason === "carrier"`、可见行逐字等于 §5.4 受阻行；`ready` 转真 ⇒ 计数归零、**下一拍取件恰一次、起轮恰一次**（闩没有因不就绪而停）。
    - **⑦ 失败侧锚在行为三条**：现码只认 `getAgent`——喂 `ready` 它不认识（多传的键被丢弃）。
    - **现码的等价场景** = `getAgent: () => null`：`attempt()` 先 `blockedSince = null`，再 `if (agent == null) return false`（逐字注释「载体未就绪（端壳懒装配）⇒ 下一拍再看（闩已在位）」）。
    - **该场景里三条同时成立**：`noteBlocked` 零调用（零 `onBlocked` ∥ 零 `ev:inbox-watch-blocked`）· `takeInbox` 零调用（零取件）。红线锚在这三条行为上，不锚在 API 形状上。
  - **「已接」判据 ⑧ · 就绪判据不走守卫形（D-MI34，本批新增，可红）**：扫描 `thincoder-vscode/src/extension/timer-watch.mjs` 的取件接线，三断言同行扫描——
    - `hasWorkspaceFolder` **≥1 命中**；
    - `blockOnNoWorkspace` **零命中**；
    - `notifyNoWorkspace` **零命中**。
  - **⑧ 的失败侧** = 把谓词换成守卫形：`blockOnNoWorkspace(panel)` 每拍弹一次 host 通知并置 `panel._wsGuardNotified` ⇒ 扫描红。
  - **⑧ 为何落扫描而不落端级 spy**：本批单元档住批档目录、import 不到 `vscode` 宿主模块；而守卫形只有两个入口符号（`thincoder-vscode/src/extension/workspace-guard.mjs` 的 `notifyNoWorkspace` 与 `blockOnNoWorkspace`）——扫掉这两枚符号即证「没走守卫形」。**射程到此为止**：它不等价于「探针无副作用」——同一条接线里另写一句提示 ∥ 埋点，三断言照样全绿；那一面本批不设判据（写明，不冒充覆盖）。
  - **判据 ⑨ · 工作区转空不撤取件闩（D-MI34 ∥ D-MI31，端级，可红）**：同一面板、`ready` 由真转假再转真，中间一次都不调 `syncInboxWatch`。
    - 转假期：零取件；待取非空跨阈出一条受阻行。
    - 转真后：下一拍取件恰一次、起轮恰一次（闩从未撤）。
  - **⑨ 的失败侧 = 现码**：`thincoder-vscode/src/extension/chat-panel.mjs` 转空支调 `disarmInboxWatch(this)`（逐字注释「跨实例取件闩同族撤闩（转空工作区 = 无会话载体）」）⇒ 该键闩表零项，转真那一拍没有取件来源。
  - **步边界 pickup（`thincoder-cli/src/tui/queued-pickup.mjs`）不接**——取件时机见 §5.4。
- **受影响文件与分层结论**：改动面 = 核三档新增 + 三端接线（CLI 两处 / VSC 五处（武装三 · 撤闩二）/ 桌面两处，见上表）+ 工具装配两处（核 `assembleBuiltinTools` = `thincoder-core/tools/index.mjs`、VSC 自有工具表 `thincoder-vscode/src/tools/index.mjs`）+ 回合收尾刷新名册（`thincoder-core/agent/run-stages.mjs`，与足迹 flush 同点）+ **两条可见行的渲染落点**（CLI `thincoder-cli/src/tui/index.mjs` 的 `pushLine` 调用点；VSC `thincoder-vscode/webview/chat-messages.js` 新增 `case "inbox"` + `addInboxLine`；桌面出站 = `thincoder-desktop/src/main/suspension-timers.mjs` 的两径（`onTake` reject ∥ `onBlocked`）+ `thincoder-desktop/src/main/timer-watch.mjs` 的补键透传，渲染面 = `thincoder-desktop/renderer/events-wake.mjs` 的 `onInbox` → `thincoder-desktop/renderer/views/chat-chrome.mjs` 的 `inboxGroupNode` ∥ `syncInbox`，切片清点 = `thincoder-desktop/renderer/store.mjs` 的 `clearTurnTraces` 第四员 ∥ `thincoder-desktop/renderer/page-read.mjs` 的 `clearInboxNotice`）+ 单元测试档（收口删）+ 集成用例档（§5.10）。
  - **tier 结论：一个文件都不跨层，无拆分方案。** 三端既有档与两条可见行的渲染落点都在各自软线内（接线是挂点级改动；`thincoder-vscode/webview/chat-messages.js` 已连同接线档按下方量法一并量过，未越软线）；核三档按面分开新建，各自从零起算。
  - **量法（本档只记量法，不记读数）**：`doc_check({ mode:"report", lines: [...] })` 给出每档内容行数与软 / 硬线标记；实现轮收口对清单跑一次，任一档超软线即在同轮按面拆分（拆分方案已在上方三档）。
- **判据（测试层 · 单元档 = 与本批批档同名的那一档，收口删）**：① 名册：装配处登记 / 回合刷新 / 退出删除 / 死条目清理（注入判活）+ 无取件面的会话不入册；② 发送四态（§5.5 表）：活 ⇒ 落 inbox 且回执带 `requestId`；无此会话 ∥ dead ∥ unknown ∥ inbox 不可写 ⇒ 各自报错点名；身份族不判 ⇒ 命令行不命中标记族的会话照常投递（一条用例如实断言：cmdline 不命中产品族的在册实例，`instance_send` 送达且回执带 `requestId`）；③ 非阻塞：对端不取件时调用照常返回（注入假时钟，零等待）；④ 取件一次性：取后目录无残留、二次取件零命中；⑤ 残留清理（`INBOX_STALE_MS`(24 h) 两侧——超龄且不在世才删，超龄但在世不删）；⑥ 请求号：首发标记无 `re=`、回程标记逐字带 `re=<requestId>`，回执 `requestId` = inbox 的 `msgId`；不认识的 `re` 原样注入且不报错，`re` 形不合（空串 / 超长 / 非字符串）拒发点名；⑦ 注入形态：`role:"user"`、首行逐字标记、**不是** `[system reminder:` 前缀；⑧ 三端装配（上「已接判据」）：到点取件一条 + **在飞回合不取件**一条（一轮进行中 inbox 有件 ⇒ 循环头与步边界零注入、`state.pendingInput` 零写入；轮尾（或下一拍）⇒ 取件恰一次、起一轮）。
- **判据（续 · 本批两条新可见面，各自可红）**：⑨ **开轮失败留痕**（D-MI32）：注入 `onTake` 抛错 ⇒ `ev:inbox-watch-take-lost` 恰一条、其 `msgIds` **恰含那枚 msgId**、端壳 `pushLine` 恰一行且逐字等于 §5.4 丢失行；此时 inbox 目录已空（**不重投**）；开轮成功的一拍零事件零行。**只有 `onTake` reject 一条路走到这里**——`isBusy()` 的一次读数不参与这个判定（§5.4 交接契约 · 已接 ⑥）。⑩ **受阻跨阈**（D-MI33）：`isBusy` 恒真 + inbox 非空 + 注入 `nowFn` 一次推进跨过 `INBOX_BLOCKED_MS` ⇒ `onBlocked` 恰一次、`ev:inbox-watch-blocked` 恰一条且 `{ms, pending}` 与实际相符、可见行逐字等于 §5.4 受阻行；再跨一阈 ⇒ 第二次（每阈一次，不刷屏）；inbox 空 ⇒ 零行（只记 `-blocked-empty`）；`isBusy` 转假 ⇒ 计数归零，再受阻从零重新报。**阈不靠真实等待**：`nowFn` 注入即可确定性跨阈——不新增阈值参数，也不改常量。

### 5.9 已知边界（不做 / 不覆盖）

- **不保证「已读」、不保证回话**：发送面 `status` = inbox 落地 + 目标当时可达；目标在取走前死掉 ⇒ 消息随清理消失（已登记，不重投）。要确认对方收到，靠对方回发一条（带 `re`）。
- **无应答超时 / 无未回提醒**：请求号不是待办单（§5.3）——「发了没回」在会话里就是一条没有后续的用户消息，本面不催。
- **不做来源认证**（D-MI30）：标记行声明「这条消息自称从哪来」，同用户的任意本机进程都能照着写一条——伪造面与「往 agent 会话贴一段字」等价，唯一边界是 `~/.thincoder/` 目录的用户权限。要真认证（签名 / 令牌）另开一批，本批不预埋。
- **无取件面的会话不可投递**：headless（`chat` 一次性 / ACP / 直连 `runAgent`）不入名册 ⇒ 发送面按 §5.5「无此会话」**当场报错**。这是「不建常驻进程、不监听端口」的代价面，但代价落在发送方看得见的一侧，不是消息悄悄躺在盘上等过期。
- **不判身份族 ⇒ 走查实例 / 非标准启动形态的会话可投递**：命令行不命中本产品标记族的会话（调试器下起、经包装脚本或宿主转发起）照常收得到消息——投递面只认「名册有条目 ∧ pid 活 ∧ inbox 目录可写」。**代价面**：pid 被无关进程复用时该会话已不在，而三条判据照样通过 ⇒ 消息落进 `/inbox/{sessionId}/`、无人取件、回执仍说「已送达」。**上界** = `sweepInbox` 的在世判据（名册有条目 ∧ pid **未明确为死**）：该 pid 被无关进程长期占用期间条目**不会被按龄清掉**，至多留到那个进程退出，之后按 `INBOX_STALE_MS`(24 h) 清扫并记 `logEvent`（不重投）。**这是「不静默丢」的边界**——需求侧边界已登记于 F-MI10 ∥ N-MI8（可达 = 在册 ∧ 活 ∧ 可写；pid 复用 ⇒ 送达但无人取，随清扫记 `logEvent`）。
- **开轮没成的样子只落在目标侧**（D-MI32 的边界）：发送方的回执是**发送那一刻**的返回值（inbox 落地 + 当时可达），它不会被后来的事改写——目标侧开轮失败只记在目标端的日志与可见行里，**不回送、不更新回执**。要确认对方真的处理了，只能靠对方回一条带 `re` 的消息（§5.3）。与 pid 复用面（回执说「已送达」而无人取）同属「回执为真、但没人真处理」一族，区别 = 一个没人取、一个取到但没起轮；两者都不能靠回执自行发现，而都能靠回程消息发现。
- **桌面入窗期不取件，但取件闩在位**（§5.8 端装配表 Desktop 行）：入窗只撤空闲 timer 闩，取件闩留着；而入窗被算作在飞——依据 `thincoder-desktop/src/main/suspension-timers.mjs`「busyOf: (key) => busyOf(key) === true || inWindow(key)」⇒ **入窗期该闩只出受阻行、不取件；取件发生在出窗之后同一批闩拍上**。**上界** = 入窗期间到达的消息留在盘上，出窗结算后 ≤ `INBOX_POLL_MS` 取走。入窗期不取件 ⇒ 丢失行不产生（没有取件，就没有开轮失败）；受阻行在待取非空且跨 `INBOX_BLOCKED_MS` 时产生，照 §5.4 上屏（`[data-inbox]` 行组）——桌面这两条失败面均有可见行。**「闩在位」不等于「入窗期能取件」**：在位只证到拍子在跑、受阻行有来源。
- **载体不就绪 = 照拍、照计数，不撤闩、不静默**（D-MI34 ∥ D-MI35）：端壳此刻开不了一轮（`ready()` 为假）时，闩仍在位、每拍问一次 `ready()`，待取非空且跨 `INBOX_BLOCKED_MS` 即出受阻行（`reason = "carrier"`）。
- **这个场景在 VSC = 窗口没有工作区文件夹**，两条复现路：① 自始无文件夹——面板照建（`resolveWebviewView` 先登记名册、装闩，再弹无工作区守卫）；② 工作区被移出而未回来——那一支只销毁载体、闩留着（§5.8 VSC 行）。
- **这是「闩丢了」那条边界之外的另一件事**：闩在拍、只是打不开门，所以它有痕；「没有拍」（宿主事件循环被独占 ∥ `unref` 闩被退掉）仍无痕，不由本条覆盖。**CLI 的就绪判据恒真**（`agent` 是 `startTUI` 的入参，开轮面 `turn` 与闩取同一闭包）⇒ 该端不进这个状态；也**不存在「换会话后闩还在用旧 agent」这一路**：CLI 没有单换 agent 的路径，换会话 = 重建回合面，闩同点重建。
- **桌面的就绪判据 = 该键闩槽有载体**（§5.8 桌面行；`ready: () => slot.agent != null`）：**「有闩槽而无载体」在生产路上不存在**——闩槽由 `armInbox` 在拿到载体之后才建（`thincoder-desktop/src/main/turn-driver.mjs` 的 `ensureSession`：`if (agent) { … suspension?.armInbox(key, agent) }`），补位 `sync(key, agent)` 同带载体 ⇒ 该端实际运行中恒就绪，而判据本身按槽判：空载体的闩槽只有用例造得出来，那一拍返假、零取件、跨阈出受阻行。**代价面因此为空**——D-MI35 的两因里，「载体不就绪」这一支在桌面没有真实场景，故不存在「桌面缺一条动作提示」的账。

- **「不打断」能做到哪一步**：做到的是「不插进当前轮」——目标跑完那一轮才取件、起新一轮；**做不到「立刻看到」**——目标的长回合（实施轮可达数十分钟）里这条消息只是躺在 inbox，等它跑完。这是要求本身的结果（等处理完），不是降级。
- **与人为插话的深度差**：人打字的排队消息走「一步一取」（循环头 `consumeQueuedInput`，本轮中途即交给下一步），跨实例消息走「一轮一取」；两者时机不同、队列不共用（§5.4）。
- **名册死条目清扫的残留**：清扫是**写面**动作（`sweepInstances`，取件面装配处一次；两条件同时成立才删 = 判活**明确**为死 ∧ 条目超 `INSTANCE_STALE_MS`(24 h)），读面 `instance_list` 零删。残留面：批量判活「探测成功却漏读一个 pid」会把活实例判成明确死，过 24 h 即删；而入册只在装配处一次（`refreshInstance` 不 upsert，D-MI28）⇒ 该实例到重启前不在册，发送方按 §5.5「无此会话」拒收。24 h 只压低概率与代价，不消除。彻底解的方向 = 「在册」由取件面**在位**持续表达（闩在位期间持续刷 `updatedAt`），本批不做。
- **只本机**：`~/.thincoder/` 同一用户目录内；跨机器不做（跨仓 ≠ 跨机）。
- **无广播 / 无订阅 / 无派活**：一条消息只面向一个 `sessionId`；收到消息的实例不因此成为从属。

### 5.10 集成用例（RTM delta）

- **起点** = `test/RTM.md`（索引，一行 = 一个集成用例）+ 分册 `test/rtm/tooling.md`。现盘故事号 **CLI 1–46**——故事 46 已在册（`test/RTM.md`「| CLI 46 | 跨实例发消息：一条消息送进另一实例并起一轮，回程带请求号 | tooling | 有 | 缺 | 缺 |」），用例 46-1 已在档（`test/integration/cross-instance-message.test.mjs`，夹具 = `test/integration/fixtures/cross-instance-harness.mjs`）。**本批改这一行，不新建行。**
- **delta（本轮）**：破 **0** 行 · 冗余 **0** 行 · **改 1 行** = **CLI 46-1**。逐格说清哪格动、哪格不动：
  - 「怎么做」：末段后**增一步**——上一轮中止结束后来一条，且两个补位点（回合链尾 / 模态关闭）**一次都不调用**；用例由夹具直驱取件闩，不依赖 TUI 中止键。
  - 「怎么算通过」：盘上 ①–④ **逐条保留原意**（① 消息形态与起一轮 / ② 回执 `requestId` = inbox `msgId` / ③ 回程带 `re=` / ④ 在飞不插队且轮后起新一轮）——④ 正是本批不能打破的那条，一字不改；其后**增 ⑤⑥**：⑤ 自续补位（同「怎么做」新步）；⑥ 两条新可见面——夹具有一次开轮 reject ⇒ 目标侧恰一行丢失行且 inbox 仍空；`nowFn` 推过 `INBOX_BLOCKED_MS` 且 inbox 非空 ⇒ 恰一行受阻行，空则零行；**本批再增 ⑦**：假端 `ready() === false` ⇒ 零取件（inbox 仍有件）+ `nowFn` 推过阈值 ⇒ 恰一行受阻行且日志 `reason === "carrier"`；`ready` 转真 ⇒ 下一拍取件恰一次、起轮恰一次（旧「载体未就绪静默返回」形态下这一条红：零行、零事件、永不取件）。
  - 「异常」：盘上「目标不可达」那条**保留不动**（本批零改发送面语义）。
  - 「证据」列不变（同一档）。故事号与用例号不变（CLI 46 / CLI 46-1）。
- **为什么 ⑤⑥⑦ 进集成用例、而不是只在单元档**：三者是本批新增的**业务可见结果**（用户会看到「已丢失」/「受阻」行），且都能从同一个真实入口（两个实例的夹具）驱动一次注入的开轮失败 / 一次时钟推进 ⇒ 按「业务可见结果有个用例」进入 46-1。**注入时钟不是造假**：跨阈的业务含义是「五分钟后仍取不走」，夹具把五分钟压成一拍，业务结果不变（与假定时器同理）。
- **编号先定**（先定行号再写用例标题）：用例标题逐字 = `test('CLI 46-1 …')`；行与用例档落盘 = 实现轮（产品面），本档只定编号与断言。

```text
| 编号 | 怎么测 | 怎么算通过 | 异常 | 证据 |
| 46-1 | 两个实例 A / B 共用同一临时根（名册目录 + inbox 目录各自缝到该根）：A 调 `instance_send` 发给 B，此时 B 的 `busy` 为真；B 取件一拍 → B 置空闲再取件一拍 → 回话时带 `re` = 首发回执的 `requestId` → A 取件一拍；最后 B 再置 `busy` 真，A 发第三条、B 两拍；末段 = B 上一轮中止结束后来一条，且两个补位点一次都不调用 | ① B 会话出现一条 `role:"user"` 消息，首行逐字 `[cross-instance message · from cli pid=<N> session=<id> cwd=<p>]`（无 `re=`）、次行为空行、第三行 = 原文，并起一轮；② A 的回执带 `requestId`，其值 = B inbox 那枚 `msgId`（文件名即该号）；③ B 的回程消息落回 A 会话，标记行逐字带 ` · re=<requestId>`；④ B 在跑一轮时 A 再发 ⇒ B 该轮回合数不变、那条只在轮结束后才起新一轮（`turns` 由 1 变 2）；另：取件成功后目标 inbox 目录零残留；⑤ 中止结束的那一轮之后那条不被丢：两个补位点一次都不调用 ⇒ 下一拍仍取走并起新一轮（`turns` 再 +1）；⑥ 两条新可见面各恰好一行——注入开轮 reject ⇒ 目标侧一行丢失行且 inbox 仍空（不重投）；`nowFn` 推过 `INBOX_BLOCKED_MS` 且 inbox 非空 ⇒ 一行受阻行，空则零行；⑦ 假端 `ready() === false` ⇒ 零取件（inbox 仍有件）+ `nowFn` 推过 `INBOX_BLOCKED_MS` ⇒ 恰一行受阻行且日志 `reason === "carrier"`；`ready` 转真 ⇒ 下一拍取件恰一次、起轮恰一次 | 同档末段 = 目标不可达（无此会话：调 `instance_send` 指一个从未登记的 id）⇒ 发送面当场报错并点名该 id 与「无取件面的 headless 会话不入册」，该 id 的 inbox 目录在盘上不存在（不落待取队列），A 自己的名册条目不受影响 | `test/integration/cross-instance-message.test.mjs` |
```

- **本行评估的组件交互** = 发送工具 → 名册可达判定 → inbox 原子写 → 目标取件闩 → 端壳以组合串开轮（`prepareRun` 落一条 user 消息）→ 回程同通道带 `re`。
- **入口** = CLI TUI 用户说话面（A 端的用户回合；人 → agent 这一半走的就是这个入口，见 §5.7）。**服务的需求** = F-MI10 + N-MI8。

## 6. config.json 原子写（F5）

### 6.1 双管齐下（D-F5a + D-F5b）

- **D-F5a 消灭整节内存写回**：全部 config.json 写点改为「在磁盘新鲜 raw 上执行单操作」语义（单字段补丁 / fresh raw 上 push·splice·改单字段）——双进程并发改不同 provider 都保留；
- **D-F5b 收口函数 `writeConfigAtomic(path, mutate)`**（`thincoder-core/config.mjs` export）——持「新鲜读 → mutate 单操作 → 写前重 stat → 写」全链，所有 config.json 写点（config-helpers persistRaw / cmd-config / setup-wizard / settings writeDisk）都经它落盘。

### 6.2 writeConfigAtomic 语义

- **t0 取在新鲜读之前**（stat→read 序）——read→stat 序存在漏检窗口；
- **写前重 stat ≠ t0 → 放弃本次写**（对端新值保持在线不抹）；先 copy `.bak-{ts}` 留现场（仅冲突时；copy 而非 rename——本体不动）；
- 返回 `{ ok: false, reason: "mtime-conflict" }`，调用方提示重试——**不自动合并**（config 是用户显式操作——重试比猜测合并安全）；
- 文件缺失（首写）→ t0 = null；对端在本端读后创建 → 冲突放弃；
- 畸形文件**拒写**（throw，绝不静默覆盖）；写后 chmod 0600 尽力而为（config 含 API key）。

## 7. 机制面坐标（核 / CLI）

| 面 | 落点 |
|---|---|
| 感知面 L1/L2 | `thincoder-core/peer-instances.mjs`（`peerInstances` · `peerInstancesTool` · `groupSlotSessions`（具名导出——端侧引核，§3.1） · 测试缝两导出）+ **`thincoder-core/process-probe.mjs`（探测与判据单源）**：`batchAlive` / `probeCmdlines` 及其 `*Async` 对偶 · `probeOwnersSync` / `probeOwnersAsync` 束 · `ownerState` / `isProductProc` / `classifyEnd` / `filterDeadOwners` · **`isProcessAlive`（单 pid 兼容面，同步有界 2 s）**；陈旧清理面 = `thincoder-core/session-slot-claims.mjs`（`cleanDeadOwners`——定义同档；转口 = `thincoder-core/session-slots.mjs`；探针入参化，零自有 exec） |
| 域面 L3 | `thincoder-core/peer-domains.mjs`（`HOT_WINDOW_MS` · `peerWriteTargets` · `peerDomains` · `conflicts` · `peerCollabNote` · `recordPeerWrites` · `flushPeerDomains` · 测试缝两导出；`pathsOverlap` 归口 `thincoder-core/peer-claims.mjs`——本档 re-export） |
| 意图认领面 | `thincoder-core/peer-claims.mjs`（认领存储 / 租约 / 命中 / 文案 / 合并写 / `nowFn` 缝；peers 路径与 `pathsOverlap` 归口于此）· 接线 = `thincoder-core/peer-domains.mjs` §4.4.6 · 端 = `thincoder-vscode/src/extension/peer-domains.mjs` + `thincoder-vscode/src/extension/peer-claims.mjs`（认领块——过 500 时外提）+ 钩点 = 核 `thincoder-core/agent/dispatch-run.mjs`（端已取核） |
| L1 注入装配 | `thincoder-core/agent/setup-reminders.mjs`（`pushPeerReminder`）· `thincoder-core/agent/setup.mjs`（注入时序：env-state 后 time 前） |
| L3 钩子 | `thincoder-core/agent/dispatch-run.mjs` + `thincoder-core/agent/run-stages.mjs`（写前检测 / 成功记录 / 回合末 flush） |
| 投递面（F-MI10） | 核新增三档（名册 / inbox / 取件闩——文件级落点、分层结论与量法 = §5.8）· 工具装配同 `peer_instances` 点 · 端取件装配三处落点与武装点 = §5.8 端取件表 |
| L2 工具装配（两壳） | 核 `thincoder-core/tools/index.mjs`（`assembleBuiltinTools`——CLI / VSC 两壳同得；`peer_instances` ∥ `instance_list` ∥ `instance_send` 都在这里登记）；VSC 自有工具表 = `thincoder-vscode/src/tools/index.mjs`（并表）；CLI 壳 `thincoder-cli/src/cli/make-agent.mjs` = adapter（MCP 合入 / 工具排除表，不登记工具） |
| F5 原子写 | `thincoder-core/config.mjs`（`writeConfigAtomic` export · 自用迁移面同档）；写点收口 = `thincoder-cli/src/tui/{config-helpers,pickers,cmd-mcp,cmd-config}.mjs` + `src/cli/setup-wizard.mjs` + `thincoder-core/agent-tools/settings.mjs` |

## 8. 关键决策记录

| # | 决策 | 理由 |
|---|---|---|
| D-MI1 | F5 冲突处置 = **放弃 + 提示重试** | 用户显式操作，重试成本低 |
| D-MI3 | L1/L2 端字段 = **批量 cmdline 探测** | 一次 Get-CimInstance/ps 拿全部 pid+cmdline |
| D-MI4 | L1 注入频率 = **每回合**（有同伴时） | 一致可预期；成本 = 回合一次 stat + **探测触发判据见 D-MI13（mtime ∨ TTL）** |
| D-MI5 | L3 语义 = **写后登记 + hot 窗口**（5 分钟） | 记录真实足迹；bash 大通道本就不可拦（诚实边界） |
| D-MI6 | L3 冲突反馈 = **工具结果附软提示**（不阻止） | 范围边界——避让是建议非锁 |
| D-MI7 | L3 存储 = 每实例独立登记文件 + 目录扫描聚合 | §4.1 |
| D-MI8 | 感知面**纯只读** + 惰性缓存 + 批量判活 | N-MI3——不新建平行存储，复用 `SESSION.md` §6.2 基建 |
| D-MI9 | 活判定身份判据 = **命令行命中本产品标记族** | 「能拿到的证据里唯一区分本产品与他进程」的信号 |
| D-MI10 | 探测失败 / 缺行 ⇒ **保守保留**（不剔除、不删） | 方向性不对称：误保留 = 噪音（可忍）；误删 = 活实例失槽（破坏存储隔离，高危） |
| D-MI11 | 清理面 **同判据单源**（实现住 `thincoder-core/process-probe.mjs`，`thincoder-core/session-slots.mjs` 只调一行） | pid 死 ⇒ 删（既有）；pid 活 + 命令明确可得 + 身份不符 ⇒ 删（pid 复用案）；其余保守不删 |
| D-MI13 | 读面缓存判据 = **mtime 未变 ∨ 快照年龄 < TTL(5 s)**；探测函数 **异步化**（同一注入缝）；写面（manifest）频率零改 | 纯 mtime 判据被 `saveSession` 每回合重写自击穿；同步 `execFileSync` 在回合路径上独占事件循环（假死源）。**边界**：TTL 只关新鲜度不关正确性；探测失败 / 缺行仍保守保留（D-MI10 零变） |
| D-MI14 | 清理 / 认领面 = **入口一次探测束 + 判据查表**；`resumeSlot` 整链 **async** | 原逐 pid `isProcessAlive` 形态 = 1 发批量 cmdline + N 发逐 pid 判活 ⇒ 初始化窗口叠 2–3 轮 = 8–12 s 同步独占（实测）。现形态：`probeOwnersAsync`（会话起点 / 认领）/ `probeOwnersSync`（**两处同步消费面**——① `activeSlot` 冷路径；② 占用判定 `slotOccupancy`）各 ≤1+≤1 exec；`SYNC_PROBE_MS` = 2 s 紧界 + 零探测早退；例外锚 = 本档 §3.1「判据（测试层 · F-MI7）」条 ③，到期条件随需求档 `MULTI-INSTANCE-COLLAB.md` F-MI7 例外句（已登记 · 不重述） |
| D-MI12 | **常态各面独立实现 → 双面同改（同源缺陷冻结级特例）** | 同源缺陷为冻结级（初始化窗口 8–12 s 同步独占）且两面对**同一 manifest**——单面修则另一端仍旧形态。**另注**：VSC 宿主族命中面天然包含他窗口 VS Code 宿主 ⇒ 该局限与 D-MI10 同向（宁可多留）。核面判据 = D-MI13 |
| D-MI15 | **任何探测必有界**：同步形态 `SYNC_PROBE_MS = 2000`（逐 pid 兼容面 `isProcessAlive` 同）；异步形态 10 s / 15 s（不阻塞，不变量级）；**无 timeout 的 `execSync` 为禁形** | 本机实测 `tasklist` 单发 >10 s 且 31 个 stuck 实例存活 40–220 s+（父进程已死——本机实测证据）：无界同步 exec = 事件循环无界冻结。紧界 + 失败降级（未知 ⇒ 保留）是唯一安全组合 |
| D-MI16 | 探测**失败**（束 / 批量返回 `null`）在认领 / 占用面 = **未知**：条目保留 · 槽不可认领/不判空闲；仅显示面（L1/L2 同伴列表）可降级为空 | 「探测失败 ⇒ 全死」的实际后果 = 清理面**删活属主条目** + 恢复面**认领活属主的槽** = 双进程同槽；两方向代价不对称（D-MI10 同源） |
| D-MI17 | 认领存储 = **同实例文件分字段**（`claims` / `claimsUpdatedAt` 与足迹 `domains` / `updatedAt` 各守其字段——落盘为字段级合并写） | 复用单写者实例文件 + 一次聚合扫描供两面（N-MI1 不新建平行存储） |
| D-MI18 | 认领时机 = **结构化写成功即登记**；落盘 = 新目标即刻 + 续约节流（`CLAIM_RENEW_FLUSH_MS = 60000`）；TTL = `CLAIM_TTL_MS = 30 * 60 * 1000` | 零新手工动作（写钩子既有）；租约以真实写为锚（零假足迹——D-MI5 口径不变） |
| D-MI19 | 释放 = **租约到期 / 属主进程死亡 / 死清理**——无显式释放面 | — |
| D-MI20 | 命中反馈 = **认领级软提示**（逐字锚）+ 每（目标 × 属主）每 run 一次去重；认领行**抑制同目标足迹行** | 同频道升级（D-MI6 零阻断不动）；去重防刷行（30 min 租约下每写都提示 = 噪音） |
| D-MI21 | 双端 = **语义同源 · 各端自持**（核拆 `thincoder-core/peer-claims.mjs`；端就地扩——过 500 再给拆分方案） | N-MI2 实现各自独立；文案 / 两常量逐字对拍（测试断言） |
| D-MI22 | 足迹软提示**字面规范面 = §4.3 单源**；端侧按本字面**逐 target 出行**（单一形态） | 设计档逐字锚 + 核实现 / 核测试已逐字锁 ⇒ 端为唯一漂移点；多实现面默认消差（端侧聚合无结构性不对称——两端钩点同为多目标列表）；与认领面同族（逐 target / 同 tag `[peer-collab]`）；消差后逐字锚与 N-MI2 lockstep 由**跨端逐行对拍**机检（先例 = AC-IC11 认领文案对拍） |
| D-MI23 | 端 L3 落盘原语 = **引核 `writeSessionFile`**（端档零本地原子写实现） | 单一实现 + **末级兜底支**随核原语到位（端侧自持版二次 rename 失败 ⇒ 旧记录已删、内容只存 `.tmp`——NF2 静默丢一次登记） |
| D-MI24 | 分组半段 `groupSlotSessions` = **核具名导出 + 端引核**（消端侧逐字镜像） | 纯函数、零端差；端壳自持的 SWR 壳形（形态面——§3.1「端读面形态与缓存判据」条）不受影响（**共享半段 ≠ 委托整面**——端 `peerInstances` 仍自持）。单源化射程 = 纯函数与原语（无端差面）；壳形 / 行为语义面仍各端自持（D-MI21 不变）。**N-MI2 读法（射程口径单源 = 本行）**：『实现各自独立』射程 = 行为语义面；无端差纯函数 / 落盘原语（D-MI23）共享不属该射程——不构成独立性违反 |
| D-MI25 | 跨仓寻址 = **机器级名册**（`~/.thincoder/instances/{sessionId}.json`，进程在即有条目），不复用 `peers/` 也不改 `peer_instances` 语义 | peers 记录只在写过文件的回合落盘（§4.2）⇒ 空闲实例不在名册；`peer_instances` 的白名单四键与同 cwd 语义是既有契约（N-MI4）——扩它会把「同目录同伴」与「全机可寻址」两个问题混成一件 |
| D-MI26 | 发送前可达性四态（§5.5 表）：**无此会话 ∥ dead ∥ unknown ∥ inbox 不可写——全部当场报错点名**（未知不当可达；`inbox 不可写`同样不许静默）——与 §3.1 读面 D-MI10「保守保留」**方向相反**。**本面不判身份族**：判定只到「在册 ∧ 活 ∧ 可写」，与感知面 F-MI6 的身份核查**不同面** | 判活与可达的误判代价不同：感知面误保留 = 多一条噪音（可忍）；投递面误送达 = 用户以为送到了而没人收（正是「不静默丢」要防的）⇒ 投递面只接受「确认可达」。**撤身份族的收益与代价并立**：收益 = 不拒掉活着的合法目标（走查实例 / 包装启动形态）；代价 = pid 被复用时三条判据照样通过、消息落进无人取的 inbox（上界与清扫 = §5.9）。「pid 认错不改变落点」只证明**不会投错会话**，不证明有人收——它抵消不了那条代价 |
| D-MI27 | 发送 = **非阻塞 + 请求号对账**（`instance_send` 回执带 `requestId` = inbox `msgId`；回程同工具带 `re`）；回程送达时发送方在跑一轮 ⇒ **消息留在 inbox，该轮结束后起新一轮**（不插当前轮；取件点 = 空闲闩，武装点 = 会话起点（补位 = 回合链尾 / 模态关闭）） | 非阻塞与不打断都是用户口径（「那肯定是非阻塞呀」·「回程送达时肯定不能打断当前会话，得等到当前会话处理完再处理」2026-11-09 22:16）；既有排队通道是一步一取（循环头 `consumeQueuedInput`），借落法不借深度 ⇒ 不另造第二套排队；请求号只用来对账、不构成从属（§4「发消息 ≠ 派活」） |
| D-MI28 | 名册条目**只在取件面装配处登记**（会话起点装上闩即登记 · 回合尾刷新 · 退出删除）；无取件面的会话（headless）不入册。取件闩武装点 = 会话起点（一次性），补位点 = 回合链尾 / 模态关闭（幂等、零存活职责），撤闩点 = 退出 / 销毁 | 「进程在」不等于「收得到」：headless 会话进程活着却永远取不走一条消息，把它列进名册只是骗发送方，而发送面回执会说「已送达」——正是 F-MI10「不静默丢」要防的。会话起点必须武装：刚起来、一个回合都没跑过的空闲实例没有「回合链尾」，只靠链尾武装则永远取不到件 |
| D-MI29 | 人 → agent = **用户在本端说话、由本端 agent 调 `instance_send`**；本批不设人直发的人面入口 | 两个方向共用一条通道、一套判据；人面直发要另立一个入口再加一套人面安全面，用户没要——他的场景就是「在 A 端把话讲给 A 的 agent，让它替我发」 |
| D-MI30 | 投递面**不建三面**：来源认证 / 长度门 / 请求登记表 | 攻击面如实记——inbox 落盘即注入，标记可伪造，边界只有 `~/.thincoder/` 的用户权限，真认证另开一批；长度门既无读数又拒掉立项场景（把一段需求贴给另一个实例）；请求登记表 = 待办追踪面（§4 边界排除），对不上号的 `re` 按普通回程消息原样注入 |
| D-MI31 | 取件闩 = **自续**：一拍**先重臂**（无条件不变式：落在一切可抛调用之前、不进 `try`）**再试取件**（`inFlight` 防重入 + `onTake` 交接契约：resolve = 已登记为在飞，reject = 开轮没成；失败单源）；回合起点不撤、补位点幂等且零存活职责；`timerRearmBlocked` 只包 timer 闩 | 撤闩 + 指望链尾重臂 = 把「门还能不能开」挂在「另一段代码有没有跑到」上。会漏叫醒的路径至少两条，且都不报错：链尾守卫为真（Ctrl+C 全停 / 挂起中止后的粘滞位）⇒ 整段 `sync()` 跳过；VSC 把「还没载体」折进 `isBusy` ⇒ 首拍之后无人重臂。自续把这条依赖整个删掉：只要进程在、闩就在（重臂在 `try` 之外——放进 `try` 就降级成「本拍没抛才在」）；`D-MI28`「名册有条目 ⇒ 有取件面」这句前提也随之重新成立。代价 = 在飞回合每秒一次内存判据（零 fs） |
| D-MI34 | 取件闩的**就绪判据 = 端壳给的 `ready()`**（这一端此刻能不能开一轮）；核闩不读 `agent` 对象，`onTake` 只收消息、载体由端壳自持；`ready` 必填无缺省；**空载体不撤闩** | 同一个「有没有 agent 对象」的闸，三端三种行为：VSC 空转静默、桌面不武装、CLI 正常——一个端的需求被当成了三端的规则。VSC 的 `_agent` 只在回合装配路径上赋值，面板开着、一轮没跑过就恒空，而它的 `onTake` 把那个 agent 一下划线就丢 ⇒ 闸门判的对象根本没人用。判据要问的是「这门此刻能不能开」，那只有端壳知道 |
| D-MI35 | 取不上件有**两因**（在飞 ∥ 不就绪），共用**一个计数器与同一条**受阻行；诊断进 `ev:inbox-watch-blocked` 的 `reason`（`"busy"` ∥ `"carrier"`） | 人要的是「有人在等你、而且取不上」；「为什么取不上」是诊断。多一种行 = 多一组端侧槽位、消散规则与跨端逐字对拍面，换来的只有排障时才用的信息。不就绪原先零痕（核里一个 `return false`，连日志都没有）⇒「消息送到了、没人取」被做成了静默。**已知代价（写在此处，不留在推论里）**：两因的用户处置不同（在飞 ⇒ 等；不就绪 ⇒ 去把这一端弄到能开轮），而本条让人读线**不表达这个差异**。放弃的理由 = 动作提示已住该端自己的守卫面（VSC 无工作区时 `workspace-guard.mjs` 的 host 通知逐字 `ThinCoder: no folder is open — the agent has no workspace to work in. Open a folder to start.`，加 `workspaceGuard` 占位符第三态）⇒ 往受阻行里再加一句是把同一句提示造成两个源；桌面空载体支无场景（§5.9），没有第二个端需要它 |
| D-MI32 | 开轮失败 = **当场明说**（`ev:inbox-watch-take-lost` + 端壳可见行，点名 msgId 列表），不重投 | 取件即删是一次性口径（§5.4），消息在开轮之前就已离盘 ⇒ 重投就是「目标不在也替他存着」的持久队列（已否决）。只能明说：不说 = 两端都以为送到了，正是 F-MI10「不静默丢」要防的 |
| D-MI33 | 闩受阻跨过 `INBOX_BLOCKED_MS`（默认 5 min）⇒ 每跨一个阈值一次目录 stat；待取非空 ⇒ `ev:inbox-watch-blocked` + 端壳 `onBlocked` 可见行 | 「门在位但门不开」（长回合 / 卡住的模态 / `processing` 未复位）不抛错、不留痕，用户看到的就是「发了没反应」。判据 = 一条内存计数器 + 每阈一次 stat，不新建监控面。**覆盖边界**：探针住拍内 ⇒ 只覆盖「在拍但不取件」；「门没了」（无拍）不在它射程内，由 D-MI31 的无条件重臂变成不可达状态承担；残留 = 宿主事件循环被独占 ∥ `unref` 闩被误退，两者无探测器（本批不加） |

## 9. 与既有机制的关系

| 既有 | 关系 |
|---|---|
| `SESSION.md` §6.2 slotSessions / isProcessAlive / slotOccupancy | **上游基建**——L1/L2 直接读它，不重造 |
| `SESSION.md` §6.11（R5/R8/R9 家族） | 相邻但独立——家族管「agent 自知环境身份 / 模式」，本机制管「agent 知同伴」 |
| `BROWSER-TOOL.md` §12 共享浏览器池 | 相邻但独立——共享物分类在本档 §2 E 类（只登记、不复述）；判活只判 pid 存在性，不引身份标记族（方向不对称同 `D-MI10`） |
