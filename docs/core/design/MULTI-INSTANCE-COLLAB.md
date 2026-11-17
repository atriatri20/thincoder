# 多实例协作（MULTI-INSTANCE-COLLAB）· 设计

> 需求 = `docs/core/requirements/MULTI-INSTANCE-COLLAB.md`。
> 最近先例：`docs/core/design/SESSION.md` 的端标记与判活、`docs/core/design/AGENT-LOOP-ASYNC-POOL.md` 的交付轮与自续闩。对齐 = 复用会话身份、业务失败可见。
> 勘察证据：已读 `thincoder-core/peer-instances.mjs` ∥ `peer-claims.mjs` ∥ `peer-domains.mjs` ∥ `process-probe.mjs` ∥ `instance-registry.mjs` ∥ `instance-inbox.mjs` ∥ `instance-inbox-watch.mjs` ∥ `config-io.mjs` ∥ `session-slots.mjs`，以及两端装配面。相关 = 当前三工具面。

## 1. 感知

`peerInstances(cwd)` = `thincoder-core/peer-instances.mjs`：读取 manifest slotSessions，按 sessionId 分组，批量判活和命令行身份复核。

缓存按 manifest mtime 或探测缓存 TTL 命中（`PEER_PROBE_TTL_MS`，同上档，5 s）；缓存有界，上限 `CACHE_MAX`（同上档，64），满则先出最旧条目。探测失败不当全死。

三态判据住 `thincoder-core/process-probe.mjs`：`ownerState` 答 `"alive" | "dead" | "unknown"`，`isProductProc` 做命令行身份复核，`filterDeadOwners` 是它的薄适配；同步探测束以 `SYNC_PROBE_MS`（同上档，2 s）为界，超时 ⇒ 未知。

有同伴时在 depth-0 装配中异步注入一条同伴提醒；工具面 `peerInstancesTool`（同档）逐条返回去 self 的四个字段：`pid` ∥ `end` ∥ `sessionId` ∥ `slots`。

## 2. 写足迹与 claims

`peers/{sessionId}.json` 是每实例单写者文件：

- domains/updatedAt：成功写足迹。
- claims/claimsUpdatedAt：意图租约。

`peerWriteTargets`（`thincoder-core/peer-domains.mjs`）从结构化写参数提取实际写路径；copy 只算 dest，move/rename 算 source+dest。

写成功后 `recordPeerWrites`（同上档）登记；新 claim 目标立即写，续约按 `CLAIM_RENEW_FLUSH_MS`（`thincoder-core/peer-claims.mjs`，60 s）节流，租约有效期 `CLAIM_TTL_MS`（同上档，30 min）。过期条件 = 条目 `expiresAt` 早于当前时刻（期内未续约即失效），不是另一套清理器的判断。

写前 `peerCollabNote`（`peer-domains.mjs`）聚合有效 claims 与热足迹（`HOT_WINDOW_MS`，同上档，5 min），返回软提示但不阻断。认领命中抑制同目标足迹提示，并按目标×属主×run 去重。

fields 级 read-modify-write 保留另一面与未知字段；`writeSessionFile`（`thincoder-core/session-slots.mjs`）原子写。

## 3. 配置写

`writeConfigAtomic(path, mutate, opts)` = `thincoder-core/config-io.mjs`：

1. 在新鲜读前取 stat（t0）。
2. 读最新 raw 并执行单项 mutate。
3. 写前重 stat，与 t0 不等则备份 `.bak-{ts}` 并返回 `mtime-conflict`。
4. 合法时原子写。

畸形配置拒写（throw，不静默覆盖）。配置含凭据，权限处理的落点 = 写盘 `mode: 0o600` 且写后 `chmod 0o600` 尽力而为（Windows 可失败）。

## 4. 名册

`instances/{sessionId}.json` 记录 sessionId/pid/end/cwd/startedAt/updatedAt，写面住 `thincoder-core/instance-registry.mjs`（`registerInstance` ∥ `unregisterInstance` ∥ `listLiveInstances` ∥ `sweepInstances`）。只有取件闩装配成功的会话登记。

`instance_list`（同上档 `instanceListTool`）只列在册且 pid 明确可确认存活者；headless/ACP/直接 runAgent 无取件面，不列。

正常退出/面板销毁撤闩并删名册。残留删除要两条件同时成立：①判活**明确**为死（探测失败或未知 ⇒ 保留）；②条目超过 `INSTANCE_STALE_MS`（同上档，24 h）——单纯超龄不是残留判据。

## 5. 发送

`instance_send`（`thincoder-core/instance-inbox.mjs` 的 `instanceSendTool`）校验 sessionId、text 与可选 re，检查名册、pid 和 inbox 写能力。

成功原子写 inbox/{sessionId}/{msgId}.json，返回 `requestId`=msgId 与 `status: "delivered-to-inbox"`。unknown 不当可达，失败不排队。回执只表示落盘，不表示已读或已处理；`requestId` 与 `re` 用于对账，不形成任务从属或待办。

消息含 from、sentAt、text 与可选 re。来源标记是自述，不是认证；本机用户目录权限是当前边界。不提供离线持久队列、广播、订阅或跨机器投递——送达只到本机另一个活会话的取件面。

残留清扫 = `sweepInbox`（同上档）：超过 `INBOX_STALE_MS`（同上档，24 h）且目标已不在世的条目删除并记 `logEvent`，不重投。

## 6. 取件闩

`createInboxWatch({ ready, isBusy, onTake, onBlocked, onPending, sessionId, timer, clear })` = `thincoder-core/instance-inbox-watch.mjs`；`sessionId` 缺省 = 本进程会话，取件与待取计数同源。自续有界拍 `INBOX_POLL_MS`（同上档，1000 ms）：

- 每拍先无条件重臂，再判 isBusy/ready。重臂落在一切可抛调用之前、且不进 try——闩的存活不挂在哪段代码跑到没跑到上。
- inFlight 防重入：上一拍没落定，本拍零动作。
- **isBusy = 已有一轮在飞**（需求 §4 的「忙碌」）。等后台子代理结果的挂起窗不算在飞：窗口在跑不等于回合在跑，把窗口算忙就是「有子代理在跑就永远收不到消息」——本机制最初的事故形态，观测原文 `ev:inbox-watch-blocked {ms: 900841, pending: 1, reason: "busy"}`：消息已落盘，取件面全程按「忙」判。端壳各答自己那一问：
  - CLI：`thincoder-cli/src/tui/timer-watch.mjs` 的 `createInboxWatch` 转口，`isBusy` 只认 `state.processing`；
  - Desktop：`thincoder-desktop/src/main/timer-watch.mjs` 的 `busyOf` 缝，由 `thincoder-desktop/src/main/suspension-timers.mjs` 注入，只读宿主的在飞判据、不读窗表；
  - VSC：`thincoder-vscode/src/extension/timer-watch.mjs`，只认在飞回合。
- **ready 由宿主提供、必填、无缺省**（缺了装配即抛）：就绪 = 这一端此刻能开一轮。无载体、无开轮面、交互面板（picker ∕ wizard ∥ 团队问句面）在场都算不就绪。面板在场是「此刻别插一轮」，不是「忙」——两个谓词各答一件事，混成一个就分不出该等什么。两端落点：CLI 的载体恒有（回合面与会话同建同毁），`ready` = 无面板在场（`modalOpen` 为假即就绪；面板在场即不就绪）；Desktop 的 `ready` = 该键闩槽有载体。
- **onTake 落定只有两种**：新轮已登记为在飞 ⇒ resolve；挂起窗内消息已进活窗口的输入队列 ⇒ 同样 resolve。其余「没有去处」⇒ reject。取件一次性，消息已离盘 ⇒ reject 只能明说、不重投。
- 取不上件有两因（在飞 ∥ 不就绪），任一因连续跨过一个受阻阈值 `INBOX_BLOCKED_MS`（同上档，5 min）出声一次；待取为空只记日志、不打扰。
- **面板在场读作 `carrier`，不读作 `busy`**：取不上件的因由取 `isBusy()` 与 `ready()` 的先后判定序，面板不是一轮在飞，故 `ev:inbox-watch-blocked` 的 `reason` 在这一场景是 `carrier`。受阻行文案不变（两因共用同一条逐字行），`ms` 计数也不因换因重算。
- **延迟上界**：空闲且闩在位 ⇒ 取件延迟不超过一拍（`INBOX_POLL_MS`）；在飞期一拍 = 一次判据 + 一次待取条数 stat（那一次 stat 只在传了 `onPending` 时发生）。
- **挂起窗内照常取件**：窗口在等子代理结果时闩不判忙；取件后消息进窗口输入队列并唤醒窗口，由窗口在步边界起轮。宿主落点：CLI 是 `state.pendingInput` + `state._suspWake()`（`thincoder-cli/src/tui/suspension-drive.mjs`）；Desktop 是窗队列 `entry.pending` + `wake()`（`thincoder-desktop/src/main/suspension-drive.mjs` 的 `pushInput` 同一数组）。窗口先退出则残项回填宿主队列（CLI 同档出窗回填 ∥ Desktop `resumeResidual`），而宿主队列本就由回合尾兜底与步边界取批消费——两条去路都在，零丢失。
- 待取条数经 `onPending(n)` 每拍交给端壳，状态栏据此显示待取提示（见 §7）。**它与 `onBlocked(ms, pending)` 的第二参不是一件事**：`onPending` 是每拍常驻面（归零同样报 0，端壳据此摘除），`onBlocked` 的第二参是跨阈那一次出声行要印的条数。两者都由闩现算，互不替代。可选形参：不传 ⇒ 本端不显示条数、也不花那次 stat；传了就得接住。
- 受阻计数器只在拍内累加：它覆盖「在拍但不取件」的一拍；「拍根本没跑」已由无条件重臂变成不可达态，不归它兜。
- 回合尾 ∕ 模态关闭的 sync 只幂等补位，不承担闩存活。

## 7. 消息落法

crossMessageContent/Text（`thincoder-core/instance-inbox-watch.mjs`）把消息组成带来源与 re 的普通用户输入。端壳以 autoTurn:false、resume:false 起新轮，由 prepareRun 落一条 user 消息。

不先 pushReal 再开空轮，不走一步一取的 queued input，不插入当前轮。

取走即删。onTake reject 时记录 `ev:inbox-watch-take-lost` 并显示消息 id（`inboxTakeLostLine`，同上档），不重投。长期 busy/carrier 跨阈时显示 blocked 行（`inboxBlockedLine`，同上档）并记日志。

等待期提示：本端有一轮在飞、消息留在 inbox 时，端壳在状态栏显示待取条数（闩经 `onPending(n)` 每拍报数，归零即摘除）。

待取条数那一段的文案与位置归各端显示档：CLI = `docs/cli/design/TUI.md`「4. 状态栏与活动」，形态沿既有「已排队 N 条消息」一脉；Desktop = `docs/desktop/design/IPC.md` 的 `ev:inbox` 行的 `pending` kind（`{ key, kind, text }`，text = 条数，同 kind 新帧替换旧帧，收到 0 ⇒ 渲染面摘除该行）。承载端 = CLI ∥ Desktop；VSC 取件照常、不显示条数——需求 §4「等待期在状态栏可见待取条数」那半句在 VSC 尚无落点，已记账。

`lost` ∥ `blocked` 两行的归属不在端显示档：文案由核生成整行（`inboxTakeLostLine` ∥ `inboxBlockedLine`），端壳只负责把它印出来，不另写句子。

状态栏是「有人在等你」的常驻面，受阻行是「等太久了」的一次性面——两件事，不互相顶替。

## 8. 验证

验证缓存与三态、批量探测、写路径分类、claims 续约与过期、软提示不阻断、配置 mtime 冲突、发送四态与负例、非阻塞发送、一次性取件与失败可见、闩在异常后续拍、短轮 ∥ 审批悬挂、在飞不取件、挂起窗内取件、待取条数报数、不就绪恢复、开轮失败和来源标记。
