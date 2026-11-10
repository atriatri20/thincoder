# 2026-11-09 · cross-instance-message
> 六段，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 每段只有一个作者：作者的段可 `append` 加内容、可就地改（`edit`）；非作者一概拒。
> 编制：主 agent · 2026-11-09 · 来源 = 用户 2026-11-09 22:07 提出需求、22:09 答定三处口径（跨仓 ∥ 互相发 ∥ 作为用户消息但须可识别为跨 agent 消息）。。
> 台账 = #2246（core · 归批）。前情 = 2026-11-09-subagent-doc-tools（进行中）。
## §1 讨论（主 agent）
**状态行**：已收口 2026-11-09
<§1 模板占位：本批条目 / 关键判据 / 授权口径>

## 用户原话（2026-11-09 22:07 / 22:09）

- **需求提出**：「我现在特别需要实例之间能发消息，比如刚才那些需求，其实可以 vsc 端直接发给你，就省得我贴过来了，而且，有些问题，你还可以直接问他，省事多了。」
- **三处口径（22:09，逐条问、逐条答）**：
  1. **跨仓**——原话「**必须是跨仓的**」。
  2. **互相发**——原话「**互相发**」。
  3. **送达形态**——原话「**作为用户消息挺好，只要能识别是跨 agent 消息就行**」。

## 现状实读（父侧，2026-11-09 22:08）

- `peer_instances` **只有只读枚举**：同 workspace cwd 的其它活实例，返回 `{pid, end, sessionId, slots}`，**不含自己**，无发消息面。
- 需求档 `docs/core/requirements/MULTI-INSTANCE-COLLAB.md` 的 §4 边界原写「**不做跨实例消息传递** / 任务编排 / 冲突自动合并」——本条需求推翻该第一项，边界已在同轮改写（保留「不做任务编排」并把理由写明：发消息 ≠ 派活）。

## 需求已落（父侧笔）

- 新增 **F-MI10**（跨实例发消息）：用户消息形态 + 跟常起一轮 + 跨仓可寻址 + 双向 + 可识别来源标记 + 不可达时有读数。
- §4 边界改写：删「不做跨实例消息传递」，保留并强化「不做任务编排」，新增「不做消息总线 / 广播订阅」。

## 边界判断（父侧）

**F-MI10 与既有 F-MI1–F-MI9 不是一件事**：既有面全是**感知 / 避让**（只读、软提示、不被阻止），F-MI10 是**投递**（会真的让另一个会话起一轮）。所以它不沿用 N-MI3「感知面纯只读」那条，需要自己的非功能条。

## 已定决定（2026-11-09 22:11）

- **已定决定**：目标会话不可达 ⇒ **当场报错**（点名目标与原因），不落待取队列、不静默丢 · 用户原话：「报错吧。」 · 时间：2026-11-09 22:11

**这样定的理由（父侧记录）**：乙案（落一条待取消息）要一套持久队列 + 一套「谁在什么时候取走」的语义，而这一条需求的真实场景是「我现在就想问那边一句」——延迟送达的答案对现场没有用。报错让发送方自己换目标，比静默排队诚实。

## 已定决定（2026-11-09 22:14）

- **已定决定**：发送方**非阻塞**（发完照常走，不等对方），回程靠**请求号**关联 · 用户原话：「那肯定是非阻塞呀。」 · 时间：2026-11-09 22:14

**补上的两个概念（父侧记）**：

1. **请求号**——人 / agent 发消息时可带一个 `re` 号，对方回时带同一个号。没有它，对方回来时发送方对不上「这是哪一次请求的回复」。
2. **回程也是普通消息**——对方的回复经同一条通道回来，落成发送方会话里的一条用户消息；**不是**某种「应答帧」。所以「像调用子代理」只是使用效果像，机制上仍是两个独立会话互相说话。

**边界不变（用户 22:13 的提问引出的澄清）**：「发消息 ≠ 派活」仍然成立。对方是独立会话，**可以不接、可以回一句「我不做」**，不会因为收了一条消息就变成发送方的下属。请求号只用来对账，不构成从属关系。

**重开记录**：2026-11-09 · 原收口 2026-11-09 · 理由 = 用户 2026-11-09 23:31 裁定：投递面不做身份族核查（「一台机器上的两个 thincoder，搞那么严格的身份核查干嘛」）。撤掉 instance_send 的 isProductProc 判据，感知面保留。（原收口 2026-11-09） · 操作者 = 主 agent

## 已定决定（2026-11-09 23:34）

- **已定决定**：**投递面整面**不做身份族核查——发面（`instance_send`）与列面（`instance_list`）同撤；感知面（`peer_instances`）的 `isProductProc` 保留 · 用户原话：「我就是觉得你们老是过度设计，**一台机器上的两个 thincoder，搞那么严格的身份核查干嘛！**」 · 时间：2026-11-09 23:31

**为什么列面也撤（父侧裁定）**：只撤发面会变成「列表把它藏起来、发送面其实送得出去」——一支藏一支收，是同一处过度设计的另一半。**投递面的判据只有：名册有条目 ∧ pid 活 ∧ inbox 目录可写。**

**代价面（写进 §5.9 已知面）**：pid 被复用时消息会落进无人取的 inbox、随 `INBOX_STALE_MS` 清扫消失；pid 被长期占用则留到该进程退出。**这个代价是可接受的——消息发不歪，只是可能白跑。**

**动因实录**：2026-11-09 23:28 一条跨仓消息从走查实例（cwd `d:\repos`）投递成功，回程被 `isProductProc` 判「身份不符」挡住——**功能第一天就暴露了这条判据的代价大于收益**。

## §2 批次任务与设计（eng-designer）
**状态行**：设计完成（评审轮 4 的 5🟡+1🔵 已全收：D-MI26 理由收窄 · 列面「同一把尺」射程写死 · §5.9 清扫上界收正 · INBOX_STALE_MS(24 h) 补值 · 需求侧边界回指 · 三条判据与四态消歧）
<§2 模板占位：本批条目（覆盖） / 设计档落点 / 机制设计 / 受影响文件与测试覆盖 / 验收对照 / 关键决策 / 上抛项>

## 本批覆盖（对照需求档 `docs/core/requirements/MULTI-INSTANCE-COLLAB.md`）

| 需求条 | 覆盖 | 设计落点 |
|---|---|---|
| F-MI10 | ✅ 全条（用户消息形态 + 起一轮 + 跨仓可寻址 + 双向 + 来源标记 + 回程请求号 + 发送非阻塞 + **送达不打断（一轮一取）** + 不可达当场报错） | 设计 §5.1–§5.10 |
| N-MI8（**本批新增条，落需求档归主 agent**） | ✅ 设计已给标准表（六项，含「不打断」） | 设计 §5.6 |

## 设计档落点

- `docs/core/design/MULTI-INSTANCE-COLLAB.md`：新增 **§5 投递面：跨实例消息（F-MI10）**，含 §5.10 集成用例 delta；§1 范围边界改写（删「不做实时聊天」、投递面单列一条）；档头需求侧范围收到 F-MI10 / N-MI8；§5.4 取件时机 = **一轮一取**（空闲闩 · 武装点 = **会话起点 + 回合链尾**）；§7 坐标表投递面行指 §5.8；§8 增 D-MI25 / D-MI26 / D-MI27 / D-MI28 / D-MI29 / D-MI30。
- 需求档不在本席写域（结果见「上抛项」）。

## 机制设计（五步各一条 + 指设计档）

- **名册**：机器级，条目只在装好取件面时登记——headless 会话不入册（设计 §5.2）。
- **可达判定**：写前一次，三条 = 名册有条目 ∧ pid 活 ∧ inbox 目录可写；四态 = 无此会话 ∥ dead ∥ unknown ∥ inbox 不可写，**全部当场报错点名**（设计 §5.5）。身份族核查只在感知面（`peer_instances` 的 `isProductProc` 保留），投递面不判（D-MI26）。
- **发送**：inbox 原子写即返回，**非阻塞**，回执带 `requestId`（设计 §5.3）。
- **取件**：只在目标无在飞回合时取；武装点 = 会话起点 + 回合链尾，回合起点撤闩，≤ 1 s（设计 §5.4）。
- **注入**：消息形态作为普通用户回合的输入串开轮（`crossMessageContent` / `crossMessageText`），由核 `prepareRun` 的 `!resume` 分支落成一条 `role:"user"` 消息；首行逐字来源标记，起**普通用户回合**（设计 §5.4）。
- **回程**：同一条通道；发送方在跑一轮时消息留在 inbox，该轮结束后起新一轮——不挂 `consumeQueuedInput`，不进 `state.pendingInput`（设计 §5.4）。

## 受影响文件与测试覆盖

```text
新增  thincoder-core/instance-registry.mjs                         名册 + instance_list 工具（§5.8）
新增  thincoder-core/instance-inbox.mjs                            四态可达判定 + inbox 原子写 + instance_send 工具（§5.8）
新增  thincoder-core/instance-inbox-watch.mjs                      取件闩 + 注入 + 注入缝（§5.8）
新增  <docRoot.batches>/2026-11-09-cross-instance-message.test.mjs 单元测试档（收口删——单元档用毕即删）
新增  test/integration/cross-instance-message.test.mjs             集成用例 CLI 46-1（§5.10）
改    thincoder-core/agent/run-stages.mjs                          回合收尾刷新名册（与足迹 flush 同点）
改    thincoder-core/tools/index.mjs                               挂 instance_list / instance_send（= peer_instances 装配点，两壳同得）
改    thincoder-vscode/src/tools/index.mjs                         VSC 自有工具表并两件
改    thincoder-cli/src/tui/index.mjs                               会话起点装 inbox 闩 + 登记名册（timer 闩邻位）
改    thincoder-cli/src/tui/agent-turn.mjs                          回合链尾重臂（timerWatch.sync 邻位）
改    thincoder-vscode/src/extension/timer-watch.mjs                增 syncInboxWatch（timer 闩同档）
改    thincoder-vscode/src/extension/panel-turn-stages.mjs          回合尾重臂（syncTimerWatch 同点）
改    thincoder-vscode/src/extension/chat-panel.mjs                 撤闩 / 删名册条目（timerWatch.disarm 三点同点）
改    thincoder-desktop/src/main/suspension-timers.mjs              键面闩表增 inbox 闩（会话起点 + 回合尾接管）
改    thincoder-desktop/src/main/timer-watch.mjs                    键面表壳（闩体 = 核闩）
改    test/RTM.md 与 test/rtm/tooling.md                            故事 CLI 46 + 用例行 CLI 46-1
```

- **tier 结论**：无跨档拆分——核三档按面分开新建（名册 / inbox / 取件闩，设计 §5.8），三端均为既有档内挂点级接线。
- **量法**：`doc_check({ mode:"report", lines: [...] })` 给内容行数与软 / 硬线标记；实现轮收口跑一次，超软线即按 §5.8 三面拆分。本席不记读数。
- **不接步边界 pickup**：`thincoder-cli/src/tui/queued-pickup.mjs` **零改**（既有一步一取通道不并入——设计 §5.4）。

## 验收对照（逐条回指；每条都是读者可判的一条线）

| # | 判据（读哪里 / 什么算对） |
|---|---|
| A1 | 读设计 §5.4「会话形态」「`[system reminder:` 族不适用」两条 ⇒ 首发标记无 `re=`，回程标记逐字带 `re=<requestId>`；核注入形 = `role:"user"`、不是 `[system reminder:` 前缀 |
| A2 | 读设计 §5.4「起的轮」条 ⇒ 投递起的是普通用户回合（`autoTurn:false`，手动态照常走审批面） |
| A3 | 读设计 §5.2 ⇒ 名册跨 cwd（`cwd` 是字段不是目录键）；`peer_instances` 语义与白名单四键零改 |
| A4 | 读设计 §5.3 回执键面 + §5.5 表 ⇒ **四态**（无此会话 ∥ dead ∥ unknown ∥ inbox 不可写）各有报错且点名目标与原因；回执含 `requestId`；§5.5「本面不判身份族」条在 ⇒ 身份族不是判据 |
| A5 | 读设计 §5.4「取件时机」「武装点」「不挂 `consumeQueuedInput`」三条 ⇒ 取件只在目标无在飞回合；目标在跑一轮 ⇒ 该轮结束 + ≤ 1 s；且明写不进 `state.pendingInput`（不另造第二套排队） |
| A6 | 读设计 §5.6 表 ⇒ 非功能**六格**（发送不阻塞 / **不打断** / 延迟上界 / 失败可见 / 不持久化 / 成本）各有一格，与需求档 N-MI8 六项逐项对得上 |
| A7 | 读设计 §5.9 ⇒ 逐条在：不保证已读 / 无应答超时 / **不做来源认证** / **无取件面的会话不可投递**（headless 不入册 ⇒ 发送面报错）/ 只本机 / 无广播无派活；另有「不打断能做到哪一步」「与人为插话的深度差」两条把保证范围写死 |
| A8 | 单测档（临时文件，收口删）跑：名册五条（含「无取件面不入册」）+ 发送**四态** + 非阻塞 + **在飞回合不取件** + 取件一次性 + 请求号（含「对不上号的 `re` 原样注入」）+ 注入形态 + 三端装配（已接判据）；命令与结果记 §5 |
| A9 | 读设计 §5.10 表 ⇒ 破 0 / 冗余 0 / 缺 1 行（故事 CLI 46 · 用例 CLI 46-1）；该行的组件交互与四条业务结果逐条在，用例标题写作 `test('CLI 46-1 …')` |

## 集成用例 delta（RTM · 先读现状再定）

- 读 `test/RTM.md` + `test/rtm/tooling.md`：**无既有行断言跨实例消息** ⇒ 需要改写的行 = 0，冗余行 = 0（CLI 34「多实例共用一个浏览器」是独立故事，不改不删）。
- **缺 1 行**：新故事 **CLI 46**（属册 `tooling`，标题「跨实例发消息：一条消息送进另一实例并起一轮，回程带请求号」），用例 **CLI 46-1**。
- 该行评估的交互 = 名册 × inbox × 工具面 × 注入面 × 空闲闩；业务可视结果 = 目标会话出现带来源标记的用户消息并起一轮、发送方回执带 `requestId`、回程消息带 `re`、**目标在跑一轮时消息不插进该轮（轮结束后才起新一轮）**；服务的需求 = F-MI10 + N-MI8。
- 编号先定在本表，用例标题 `test('CLI 46-1 …')` 与编号逐字一致；RTM 与用例档落盘 = **实现轮（产品面）**，本席只定编号与断言。

## 关键决策（本批新增；单源 = 设计 §8）

- **D-MI25**：跨仓寻址 = 机器级名册，不复用 `peers/`、不改 `peer_instances`。
- **D-MI26**：可达性**四态**（无此会话 ∥ dead ∥ unknown ∥ inbox 不可写）**全部报错**（未知不当可达）——与感知面 D-MI10 方向相反，理由 = 误判代价不对称。**投递面不判身份族**：判定只到「在册 ∧ 活 ∧ 可写」，身份族核查属感知面（F-MI6 防误报），消息按目录名投递、pid 认错不改变落点。
- **D-MI27**：发送 = 非阻塞 + 请求号对账；回程**不抢插在飞回合**——消息留在 inbox，该轮结束后由空闲闩取走、起新一轮。
- **D-MI28**：名册条目**只在取件面装配处登记**（headless 不入册）；取件闩武装点 = **会话起点 + 回合链尾**，撤闩点 = 回合起点 + 退出。
- **D-MI29**：人 → agent = 用户在本端说话、由本端 agent 调 `instance_send`；本批不设人直发入口。
- **D-MI30**：不建三面——来源认证 / 长度门 / 请求登记表（各带理由，见设计 §8）。

## 上抛项

[上抛·知会] 需求档三处已由主 agent 落地，本轮实读核对（`docs/core/requirements/MULTI-INSTANCE-COLLAB.md`）：§1 范围边界 = 消息总线 / 广播订阅 / 待取队列 / 任务编排（「发消息 ≠ 派活」在位）；档头范围句 = F-MI1–F-MI10 / N-MI1–N-MI8；N-MI8 六项在位（含「不打断」）⇒ 设计档对需求档的引用不再悬空。

[上抛·知会] 评审 #7 的 `open` 已收口：三端取件装配挂点、武装 / 撤闩点与「已接」判据写进设计 §5.8 端取件表——形态已定，落点行内坐标随实现轮读端侧空闲面定（不猜行号）。

[上抛·知会] **跨档相冲（本席写域外的档，只报不改）**：`docs/core/design/AGENT-LOOP-ASYNC-POOL.md` 内两句互相矛盾，本档 §5.9 按后一句写。

- 前一句：§6.30.1「桌面端」条——「主进程仍零轮询 ⇒ **自唤醒面仍不存在**」。
- 后一句：§6.30.5 端支持面表——「桌面 | ✅（阶段 2）| 空闲 deadline 闩（`thincoder-desktop/src/main/timer-watch.mjs`（已落 · 实读 **76**——2026-09-29 收正）」。
- 实读：`glob thincoder-desktop/src/main/timer-watch.mjs` 命中 ⇒ 文件在盘，支持后一句。
- **已收正（2026-11-09 修复轮 · 该档写域随本轮扩到本席）**：删去「主进程仍零轮询 ⇒ 自唤醒面仍不存在（无空闲 deadline 闩 + 核件 `waitForSettleOrWake` 无 timer 第三兑现态）」整段——其两半皆非现态；改为现态句：桌面端「空闲 deadline 闩已落（`thincoder-desktop/src/main/timer-watch.mjs`——主进程 · 键面 = 会话键 · 键面表壳包核闩 `createTimerWatch`）⇒ 自唤醒面在」，与 §6.30.5 表桌面行一致。「零轮询」作为闩形态保留（一次性 deadline、到点自撤，非 interval 采样）——零轮询与有自唤醒面不矛盾。同轮端能力旧话扫净 = 见下「修复轮记录（#2248）」。

## 修复轮记录（台账 #2248 · 2026-11-09）

一条要求：清掉 `docs/core/design/AGENT-LOOP-ASYNC-POOL.md` 里与 §6.30.5 表打架的「端能力」旧话。删，不划掉、不写「曾经」。

| # | 位置 | 旧话（删掉的） | 改成 |
|---|---|---|---|
| 1 | §6.30.1「桌面端」条 | 「主进程仍零轮询 ⇒ **自唤醒面仍不存在**（无空闲 deadline 闩 + 核件 `waitForSettleOrWake` 无 timer 第三兑现态）」 | 「**空闲 deadline 闩已落**（`thincoder-desktop/src/main/timer-watch.mjs`…）⇒ **自唤醒面在**，与 §6.30.5 表桌面行一致」；`零轮询` 保留为闩形态说明 |
| 2 | §6.30.9 边界第 1 条 | 「VSC / 桌面零写入 = 阶段 1 边界（阶段 2 批已接线……」 | 整条删除（现态两端已接线 ⇒ 该条不是现态边界）；余四条顺次重编，原「见边界 4」→「见边界 3」 |
| 3 | §6.30.8 A-TW3 | 判据尾句「……；本行 = 阶段 1 判据原样」 | 「§6.30.5 五形态逐格定义（自唤醒 / 不支持，各带理由）；桌面 / VSC 两行 ✅ 的落点 = §6.30.10–§6.30.11」 |
| 4 | §6.30.8 A-TW4 | 判据「§6.30.5（桌面 / VSC 不接 + 理由 + 后续登记——**阶段 1 原样 · 阶段 2 已接线**：同表两行改 ✅……」+ 验收点名「含『不接 + 理由』」 | 验收点改「各形态自唤醒 ∥ 不支持，各带理由」；判据「§6.30.5 逐格枚举；桌面 / VSC 落点 = §6.30.10–§6.30.11」 |
| 5 | §6.30.14 A-TW12 | 判据里的「§6.30.9 边界 1 指向阶段 2」——第 2 行删除后该指针失去对象（悬空） | 删该分句；余项逐字不动（§6.30.5 表两行 ✅ ∥ `docs/core/design/TOOLS.md` §6.7 timer 行 ∥ 描述端限定句） |

**扫过的词（逐个 grep，本档）**：`零轮询` · `自唤醒` · `无空闲` · `尚不存在`/`不存在` · `尚未` · `未接线` · `不接` · `无闩` · `仍不存在` · `轮询` · `零消费者` · `阶段 1 边界` · `阶段 1 原样` · `桌面端` · `未落`/`待落` · `缺失`/`缺口` · `不具备` · `没有` · `待接` · `后续登记` · `❌` · `阶段 1` · 以及正则 `桌面.*(无|不|零|未)` / `(无|不|零|未).*桌面`。

**扫完剩什么（都读回去核过，与 §6.30.5 表一致）**：① CLI headless 行 ❌ 不支持（§6.30.5 同行 · §6.30.15 边界 3「无空转面 ⇒ 零闩」）—— 现态；② 桌面 / VSC 渲染面零定时器、触发面全在主进程闩（§6.30.15 边界 6）—— 现态；③ §6.30.11 桌面 / VSC 两块的落点逐条（闩 ∥ 装配点 ∥ 火面 ∥ `ev:timer`）—— 与 §6.30.5 同行。**其余端能力表述与 §6.30.5 表一致**。

**机检**：`doc_check(mode:"gate")` 本档 = `DOC-CHECK GATE: PASS`（0 段命中）；第 5 行指针收正后复测同 PASS。

## 修复轮记录（设计评审轮 1 · 2026-11-09 · 十一条全收）

改法一句话：**「进程在」不再等于「收得到」**——名册只在装好取件面的那一刻登记，发送面用五态当场报错；顺带把 `re` 的形态与对不上号的处置、长度门、攻击面、人面入口、三端挂点、RTM delta 一次写清。

| # | 位置（`docs/core/design/MULTI-INSTANCE-COLLAB.md`） | 改成 |
|---|---|---|
| 1 🔴 | 新增 §5.10（+ §5.8 判据 ⑧ 回指） | 集成用例节：起点 = `test/RTM.md` + 分册 `test/rtm/tooling.md`；破 0 / 冗余 0（CLI 34 是独立故事）/ 缺 1 行 = 故事 CLI 46 · 用例 CLI 46-1；写清组件交互（发送工具 → 可达判定 → inbox 写 → 取件闩 → `pushReal` 起一轮 → 回程带 `re`）、四条业务结果、入口 = CLI TUI 用户说话面 |
| 2 🔴 | §5.2 登记点 · §5.5 · §5.6 两行 · §5.9 · 增 D-MI28 | 名册条目**只在取件面装配处登记**——headless（`chat` / ACP / 直连 `runAgent`）不入册，「活但永远取不走」这条静默丢消失；§5.6 的延迟上界 / 失败可见两行加前提「目标已在册」 |
| 3 🟡 | §5.5 表 · §5.8 ② | 四连词落成**五态表**：补「身份不符」（pid 活但非本产品 ⇒ 报错点名，不按感知面静默）与「inbox 不可写」（报错点名 + 失败面原文）；判据清单逐条对齐 |
| 4 🟡 | §5.2 工具面 · §5.3 末条 | `re` 形态 = 非空字符串、长度 ≤ 128，形不合拒发并点名 `re`；**对不上号的 `re` 原样注入**（不报错不改写不丢弃）——本面不存请求登记表，理由写在条内 |
| 5 🟡 | §5.8 三档块 + tier 结论 + 量法 · §7 投递面行 | 核件按面分三档（名册 / inbox / 取件闩）；tier 结论 = **一个文件都不跨层，无拆分方案**；量法 = `doc_check({ mode:"report", lines: [...] })`（本档不记读数） |
| 6 🟡 | §5.4 武装点条 · §5.6 延迟上界行 | 武装点改为**会话起点 + 回合链尾**，并加撤闩点 = 回合起点；写明「会话起点这一处不可省」及其理由（刚起来、没跑过回合的实例没有回合链尾） |
| 7 🟡 | §5.8 端取件表 + 「已接」判据（`open` 整条删除） | 三端各给闩族落点 / 武装点 / 撤闩面：CLI = `thincoder-cli/src/tui/index.mjs` + `agent-turn.mjs`；VSC = `timer-watch.mjs` 的 `syncInboxWatch` + `panel-turn-stages.mjs` + `chat-panel.mjs` 三点；桌面 = `suspension-timers.mjs` 键面 + `timer-watch.mjs`。已接判据 = 三条挂点断言 + 到点取件 / 在飞不取件 |
| 8 🟡 | §5.7 新增「人 → agent 的落点」条 · 处置条改写 · 增 D-MI29 | 二选一写死 ①：人 → agent = 用户在本端说话、由本端 agent 调 `instance_send`；本批**不设人直发入口**；处置条改「只许经本地 agent 发」 |
| 9 🟡 | §5.1 新增「攻击面如实记」条 · §5.9 增「不做来源认证」· 增 D-MI30 | 攻击面记为**入选方案自带**：inbox 落盘即注入，标记可伪造，唯一边界 = `~/.thincoder/` 的用户权限；弃监听方案的理由收窄为端口 / 管道的生命周期与命名冲突成本 |
| 10 🟡 | §5.4 长度门条 → 「不设长度门」· §5.8 常量表删 `MAX_MESSAGE_BYTES` · D-MI30 | 删这个预埋上限：无读数作根据，且会拒掉本需求的立项场景本身（把一段需求原文贴给另一个实例）；既有长度限制在会话层 |
| 11 🔵 | §5.6 标题 | 删交接括注，只留「非功能面（N-MI8）」 |

同轮连带收正（不在十一条内、但改后必须同步，否则 §2 与设计档打架）：本段「设计档落点」「机制设计」「受影响文件」「验收对照 A4 / A7 / A8 / 新增 A9」「关键决策 D-MI26 + D-MI28–30」「上抛项 `open` 一条」；设计档 §8 的 D-MI26 行同步改成五态。

## 实现回修轮记录（2026-11-09 · eng-designer · 台账 #2246）

实现席交付后回三处，本轮全收：① 一处**实现偏离设计**（用户裁定「实现的做法对，改设计」）· ② 一处**装配点坐标写错** · ③ 一处它的自报残留（进 §5.9 已知边界）。下表 6 行 = 改动的落点（行 1–2 ← ① · 行 3 ← ② · 行 4 ← ③ · 行 5–6 = 连带同步）。

| # | 位置（`docs/core/design/MULTI-INSTANCE-COLLAB.md`） | 改成 |
|---|---|---|
| 1 | §5.4「会话形态」条 · 新增「落法」条 · 「不挂 `consumeQueuedInput`」条收窄 | 落法写死 = 取件闩把消息组成字符串（`crossMessageContent` / `crossMessageText`）作**普通用户回合的 `text`** 开轮；并落纸为何不能「先 `pushReal` 再起轮」——核 `prepareRun` 在 `!resume` 时无条件落输入串，两件一起做会多出一条**空 content 的 user 消息直达 provider**（依据句在条内） |
| 2 | §5.8 三档块（watch 那一行） | `injectCrossMessage`（未实现）→ `crossMessageContent` / `crossMessageText`（实现把注入合并进这两件；档面同步） |
| 3 | §5.8 工具导出面条 · 受影响文件条 · §3.3 · §7「L2 工具装配」行 | 装配点 = 核 `assembleBuiltinTools`（`thincoder-core/tools/index.mjs`——CLI / VSC 两壳同得）；VSC 另在自有工具表 `thincoder-vscode/src/tools/index.mjs` 并表；CLI 的 `make-agent.mjs` = adapter（MCP 合入 / 工具排除表，不登记工具） |
| 4 | §5.9 新增「名册死条目清扫的残留」 | 写面清扫（`sweepInstances`：判活明确为死 ∧ 条目超 `INSTANCE_STALE_MS`(24 h)）遇「探测成功却漏读一个 pid」会删活条目，而入册只在装配处一次（`refreshInstance` 不 upsert）⇒ 该实例到重启前按 §5.5「无此会话」拒收；彻底解方向 = 在册由取件面**在位**持续表达，本批不做 |
| 5 | §5.10「本行评估的组件交互」行 | `pushReal` 起一轮 → 端壳以组合串开轮（`prepareRun` 落一条 user 消息） |
| 6 | 本段：机制设计「注入」条 · 受影响文件清单 | 同步落法与装配点（`make-agent.mjs` 行换成核 `thincoder-core/tools/index.mjs` + `thincoder-vscode/src/tools/index.mjs`） |

- **第 3 条的实读依据**：`thincoder-cli/src/cli/make-agent.mjs` 对 `peerInstancesTool` / `instance_list` / `instance_send` **零命中**（复跑 = `grep -n "peerInstancesTool\|instance_list\|instance_send\|builtinTools" thincoder-cli/src/cli/make-agent.mjs` → 无匹配；该档头注自述 = `assembleAgent` adapter）；`thincoder-core/tools/index.mjs` 的 `assembleBuiltinTools` 里 `peerInstancesTool` / `instanceListTool` / `instanceSendTool` 同点登记；VSC 另在 `thincoder-vscode/src/tools/index.mjs` 并三件。
- **本轮验收**：`doc_check(mode:"gate")` 到 PASS + 本段与设计档同步；读数（单测 / 集成）归 §5，本段不记。

## 重开轮记录（用户 2026-11-09 23:31 裁定 · 投递面不做身份族核查 · 台账 #2246）

用户原话：「我就是觉得你们老是过度设计，**一台机器上的两个 thincoder，搞那么严格的身份核查干嘛！**」

口径：**投递面**（F-MI10 这一面）不判身份族；**感知面**（`peer_instances` / §3.1 / 清理面）的 `isProductProc` 一个字不动。判据因此只剩「在册 ∧ 活 ∧ 可写」——pid 只答「还在不在」，不答「是不是我们」。

| # | 位置（设计档 `docs/core/design/MULTI-INSTANCE-COLLAB.md`） | 改成 |
|---|---|---|
| 1 | §5.5 判据句 + 表 | 四条判据 → **三条**（名册有条目 ∧ pid 活 ∧ inbox 目录可写）；表里「身份不符」行删除；`unknown` 行收窄为「判活探测失败」（本面不再探命令行，原「命令行探测失败」口径随判据一起走） |
| 2 | §5.5 新增「本面不判身份族」条 | 理由落纸：消息落 `/inbox/{sessionId}/`，目标按目录名取件、不按 pid 认人 ⇒ pid 认错也发不歪，最坏躺到过期；身份族核查是感知面防误报的规则（F-MI6），投递面没有这个失败模式，设关卡拒掉的正是走查实例 / 非标准启动形态的会话 |
| 3 | §5.2 工具面 `instance_list` 条 | 列面判据写死 = 名册有条目 ∧ pid 活（死 ∥ 探测失败 ⇒ 不列），**同样不判身份族**——一支藏一支收，等于把拒收留在读面 |
| 4 | §5.2「跨仓可寻址」条 | 加一句：身份族判据只在感知面，`peer_instances` 的 `isProductProc` 保留 |
| 5 | §5.6 失败可见行 · §5.8 三档块 · §5.8 判据 ② | 五态 → 四态；判据 ② 加一条断言：cmdline 不命中产品族的在册实例照常送达、回执带 `requestId` |
| 6 | §5.9 新增已知面 | 走查实例 / 非标准启动形态的会话可投递；代价面 = pid 被复用时消息落进无人取的 inbox，随 `INBOX_STALE_MS` 清扫消失（不重投），pid 被长期占用则留到该进程退出 |
| 7 | §5.8 注入缝行 | `_setPeerMessageTestImpl` 去 `cmdlineFn` 槽（本面零命令行探测 ⇒ 槽无消费者） |
| 8 | §8 D-MI26 行 | 五态 → 四态；理由改写为「收益与代价并立」（不拒掉活着的合法目标 ↔ pid 复用静默落空）——原句把「身份不符」与「inbox 不可写」并列，撤后不成立 |

- **需求档核对（不在本席写域，供父侧复核）**：F-MI10「目标不可达 ⇒ 当场报错（点名目标与原因）」与 N-MI8「失败可见」都不以身份族为前提 ⇒ 撤后仍满足；F-MI6 的身份校验范围是感知面活判定，不受影响。
- **验收**：设计档与本章 `doc_check(mode:"gate")` = PASS（读数归父侧复核；单测 / 集成读数归 §5）。

## 修复轮记录（设计评审轮 4 · 2026-11-09 · 五🟡 + 一🔵 全收）

一句话：**「落点不歪」与「没人收」是两件事**——D-MI26 只留它能证明的那半，§5.9 的代价与上界并立；列面 / 发面的「同一把尺」缩到真能共用的底座两条；`INBOX_STALE_MS` 补上实读值。

| # | 位置（`docs/core/design/MULTI-INSTANCE-COLLAB.md`） | 改成 |
|---|---|---|
| 1 🟡 | §8 D-MI26 理由格 | 删「身份族不在这个代价链上——消息按目录名投递，pid 认错不改变落点，为它设关卡只会拒掉活着的合法目标」；换成**收益与代价并立**：收益 = 不拒掉活着的合法目标（走查实例 / 包装启动形态）；代价 = pid 被复用时三条判据照样通过、消息落进无人取的 inbox（上界与清扫 = §5.9）；末句写死「『pid 认错不改变落点』只证明**不会投错会话**，不证明有人收——它抵消不了那条代价」 |
| 2 🟡 | §5.2 `instance_list` 条 | 删无保留的「列的判据与发送面**同一把尺**：名册有条目 ∧ pid 活」；改为：列的判据 = 名册有条目 ∧ pid 活；**inbox 目录可写不在列面判**——它是写面运行时的判定，列面试写就是写（`readonly: true` 的免审批读面不写盘）⇒「同一把尺」的射程 = 底座那两条，第三条只归发面 |
| 3 🟡 | §5.9「不判身份族」条 | 一句两结局收成一个：删「无人取件、随 `INBOX_STALE_MS` 清扫消失（不重投）」（pid 被占用时它根本发生不了）；改为「三条判据照样通过 ⇒ 落进 `/inbox/{sessionId}/`、无人取件、**回执仍说「已送达」**」+ **上界** = `sweepInbox` 在世判据（名册有条目 ∧ pid 未明确为死）⇒ 占用期间**不按龄清**，至多留到那个进程退出，之后按 `INBOX_STALE_MS`(24 h) 清扫并记 `logEvent` |
| 4 🟡 | §5.4 取件口径 · §5.8 判据 ⑤ · §5.9 代价面 | `INBOX_STALE_MS`(24 h) 补值（取件口径与断言处各一，形同 `INSTANCE_STALE_MS`(24 h)）；同轮把判据 ⑤ 收紧为「两侧——超龄且**不在世**才删，超龄但在世不删」（没有数，两侧无从断言） |
| 5 🟡 | §5.9 代价面条末 | 补「**这是「不静默丢」的边界**——需求侧边界已登记于 F-MI10 ∥ N-MI8（可达 = 在册 ∧ 活 ∧ 可写；pid 复用 ⇒ 送达但无人取，随清扫记 `logEvent`）」 |
| 6 🔵 | §5.5 首段 | 补「**判据三条 ≠ 报错态四条**：`pid 活` 那一次判活分三支（活 / 明确死 = dead / 探测失败 = unknown），`名册有条目` ⇒ 无此会话，`inbox 目录可写` ⇒ inbox 不可写——1 + 2 + 1 = 四条」 |
| 7 连带 | §5.5「本面不判身份族」条 | 「最坏是躺在盘上到过期（§5.9）」→「pid 认错也发不歪（不会投错会话），最坏是躺在盘上无人取（代价与上界 = §5.9）」——与第 3 条同一事实，不写两套 |

- **第 4 条的实读依据**：`thincoder-core/instance-inbox.mjs`「export const INBOX_STALE_MS = 24 * 60 * 60 * 1000」；同档 `sweepInbox` 的「gone」= `!entry || (aliveSet instanceof Set && !aliveSet.has(entry.pid))`，`!gone ⇒ 保留`——第 3 条的上界因此不是「到点必清」。
- **验收对照 A1–A9 零改**：本轮六条没改判据面口径——四态、非阻塞、起一轮、标记形态、在飞不取件都在原行内；第 3 条的清扫上界落在 §5.8 判据 ⑤（单元档），A8 的清单不列该项，故不动。
- **本轮验收**：`doc_check(mode:"gate")`（设计档）⇒ `DOC-CHECK GATE: PASS`（0 段命中）；`五态 ∥ mismatch ∥ 代价链 ∥ 到过期` 逐词 grep 零命中（`cmdlineFn` 的四项命中全是 §3.1 感知面注入缝，不属投递面）。读数归 §5 / 父侧，本段不记。

## 上抛项（评审轮 4 收口）

[上抛·知会] 需求档 N-MI8 对同一事实仍是宽松写法：「pid 被无关进程复用时消息可落进无人取的 inbox、**随清扫记 `logEvent` 消失**，这是「不静默丢」的边界」。`sweepInbox` 的在世判据在，被占用期间**不按龄清**——正确写法是「至多留到该进程退出 + `INBOX_STALE_MS` 后清」（= 设计 §5.9 现文）。需求档归父侧，本席不改；父侧本轮既然在改 N-MI8，这半句顺带收正即可。

## §3 设计评审（评审子代理）
**状态行**：评审通过



### 轮次 1（评审子代理）

| # | 严重度 | 状态 | 证据 |
|---|---|---|---|
| 1 | 🔴 | 未处置 | `docs/core/design/MULTI-INSTANCE-COLLAB.md` §5.8 仅「判据（测试层 · 单元档 `instance-messaging`）」；§5 全文零 `test/RTM.md` 引用、零集成用例编号（`test/RTM.md` 索引在盘，故事号 CLI 1–45） |
| 2 | 🔴 | 未处置 | 同档 §5.9「无空闲面的调用方不自动取件」+ §5.5 判据含四连词（名册有条目 ∧ pid 活 ∧ `isProductProc` ∧ inbox 可写）；`docs/core/requirements/MULTI-INSTANCE-COLLAB.md` N-MI8「**失败可见**（不可达当场报错，点名目标与原因）」、F-MI10「**不落待取队列、不静默丢**」 |
| 3 | 🟡 | 未处置 | 同档 §5.5 三态处置（找不到 / dead / unknown）vs 判据四连词；§5.8 ②「发送五态」零身份不符、零 inbox 不可写 |
| 4 | 🟡 | 未处置 | 同档 §5.3「`re` 只用来对账」；§5.2 `re` 无形态约束；零「对不上号」处置行 |
| 5 | 🟡 | 未处置 | 同档 §5.8 核件「新增 `instance-messaging` 模块」；§7「投递面（F-MI10）」行 — 零文件级 tier 结论 + 零核对命令 |
| 6 | 🟡 | 未处置 | 同档 §5.4「**武装点 = 回合链尾**」vs §5.6「延迟上界（取件）」行「目标空闲 ≤ `INBOX_POLL_MS`(1 s)」 |
| 7 | 🟡 | 未处置 | 同档 §5.8「**open**：VSC / 桌面取件装配的精确挂点」；需求档 N-MI2 端一致 |
| 8 | 🟡 | 未处置 | 同档 §5.7「配额 / 白名单 / 只许人发」vs §5.2 工具面（`instance_list` / `instance_send` 两件，零人面入口）；需求档 F-MI10「**双向**（人 → agent ∥ agent ↔ agent）」 |
| 9 | 🟡 | 未处置 | 同档 §5.1「新增攻击面（任何本机进程都能往 agent 会话注入一条「用户消息」= 任意指令）」vs §5.4 inbox 落盘即注入、标记可伪造 |
| 10 | 🟡 | 未处置 | 同档 §5.4「`text` 超 `MAX_MESSAGE_BYTES = 8192`」——零场景（观测 / 复现路径），6b |
| 11 | 🔵 | 记录 | 同档 §5.6 标题「非功能面（N-MI8——本面自己的非功能条，落需求档归主 agent）」——需求档 N-MI8 行已在盘 |

VERDICT: changes-required

计数：🔴 2 · 🟡 8 · 🔵 1；跨档口径（`docs/core/design/AGENT-LOOP-ASYNC-POOL.md` §6.30 / §6.34）本次未核（unverified，声明排除）。

### 轮次 2（评审子代理）

### 第 2 轮 · 上轮 2🔴 + 8🟡 + 1🔵 的落地核对

| # | 严重度 | 状态 | 证据（指针） |
|---|---|---|---|
| 1 | 🔴 | 已修 | `docs/core/design/MULTI-INSTANCE-COLLAB.md` §5.10「起点 = `test/RTM.md`」·「编号先定」·「本行评估的组件交互」/「入口」/「服务的需求 = F-MI10 + N-MI8」· delta「破 0 / 冗余 0 / 缺 1 = CLI 46-1」 |
| 2 | 🔴 | 已修 | 三处同读：§5.2「无取件面的会话不入册（headless…）」· §5.5 无此会话行「它不入册——一并说明」· §5.9「发送面按 §5.5「无此会话」当场报错」；D-MI28 同口径 |
| 3 | 🟡 | 已修 | §5.5 表五态（含「身份不符」与「inbox 不可写」）· D-MI26「五态」· §5.8 ② 同名词表 · §5.6「五态均当场报错点名」 |
| 4 | 🟡 | 已修 | §5.3「对不上号的 `re` 怎么处置」⇒ 原样注入、不报错、不改写 |
| 5 | 🟡 | 已修 | §5.8「受影响文件与分层结论」+「tier 结论：一个文件都不跨层，无拆分方案」+ 量法 `doc_check` |
| 6 | 🟡 | 已修 | §5.4「武装点两处 + 撤闩两处」（会话起点 / 回合链尾 / 回合起点 / 退出）+ §5.6 延迟上界「前提 = 目标已在册」+ §5.8「已接」判据「会话起点不武装 ⇒…红」 |
| 7 | 🟡 | 已修 | §5.8 端取件表 VSC / Desktop 两行填满（闩族落点 · 武装点 · 撤闩面）+ 三端「已接」判据 |
| 8 | 🟡 | 已修 | §5.7「人 → agent 的落点」（D-MI29）+ §5.10「入口」行回指 |
| 9 | 🟡 | 已修 | §5.1「攻击面如实记（入选方案自带，不是监听方案独有）」+ 弃监听理由收窄 + §5.9「不做来源认证」 |
| 10 | 🟡 | 已修 | §5.4「不设长度门」+ D-MI30；`MAX_MESSAGE_BYTES` / 8192 零残留（grep 零命中） |
| 11 | 🔵 | 已修 | §5.6 标题「非功能面（N-MI8）」——交接语已删 |
| 12 | 🟡（可选） | 新 | §5.2「`re` 可选，形态 = 非空字符串、长度 ≤ 128」——该拒发分支无场景（6b），只拒坏值不拒正常投递 |
| 13 | 🔵 | 新 | §5.8 判据题「单元档 = 与本批批档同名的那一档，收口删」与同档 §3.1 / §4.4.7 的模块名持久档不一致，收口后新三档零持久单测 |
| 14 | 🔵 | 新 | 需求档 `docs/core/requirements/MULTI-INSTANCE-COLLAB.md` N-MI8「延迟上界可述」句未带设计要求侧已有的「目标已在册」前提 |
| 15 | 🔵 | 新 | §5.2 名册死条目的清理承担者仅由 §5.8 判据 ①「死条目清理（注入判活）」承载，正文无落点 |

计数：🔴 0 · 🟡 1（可选，不阻断）· 🔵 3 · 上轮 11 项全部落地

VERDICT: pass

### 轮次 3（评审子代理）

**本轮只核三件 + 一处悬置**（代码层不在范围 —— 按声明排除）

① **落法已收正**：`docs/core/design/MULTI-INSTANCE-COLLAB.md` §5.4「落法 = 端壳开轮面的输入串，不是「先 `pushReal` 再起轮」」条 —— `prepareRun` 无条件落 user 消息这一事实已落纸（引文 `pushReal(agent, { role: "user", content: input })` 与 `thincoder-core/agent/setup.mjs` 实文逐字相符；该调用在 `if (!resume)` 分支内、无第二重门，与「`!resume` 时无条件」的写法一致）⇒ 「为什么不能两件一起做」的依据成立。§5.1「对齐」条同向收正（「但只经 `prepareRun` 的输入串落一次，不是单独推一条历史」）。

② **CLI 装配点已改准**：§5.8「工具导出面」条与 §7「L2 工具装配（两壳）」行 —— 装配点 = 核 `assembleBuiltinTools`（`thincoder-core/tools/index.mjs`，该文件实导出 `assembleBuiltinTools`）；两处提及 `make-agent.mjs` 均写「MCP 合入 / 工具排除表，不登记工具」；实核 `thincoder-cli/src/cli/make-agent.mjs` 对 `builtinTools` 零命中 ⇒ 档内无把装配点指成该档的旧句。

③ **名册清扫残留已收下**：§5.9「名册死条目清扫的残留」条 —— 写面动作（`sweepInstances`）+ 漏读 pid ⇒ 活条目误删 + 「而入册只在装配处一次（`refreshInstance` 不 upsert，D-MI28）」（= 不重建）+ 「24 h 只压低概率与代价，不消除」+ 彻底解方向（「彻底解的方向 = 「在册」由取件面**在位**持续表达」）⇒ 三要素齐。

④ **悬置判读 = 不卡**（列 🟡）：实现多一枚 `sessionId = null`，null 缺省 ⇒ 生产调用面零变，无验收行依赖签名，非静默简化。

| # | 严重度 | 状态 | 证据 |
|---|---|---|---|
| 1 | 🟡 | 已裁定 · 不卡 | §5.4「取件时机」条签名 `createInboxWatch({ getAgent, isBusy, onTake, timer, clear })` 缺 `sessionId = null`；实文 `export function createInboxWatch({ getAgent, isBusy = null, onTake = null, sessionId = null, timer = null, clear = null } = {}) {` |
| 2 | 🔵 | 记账 | §5.8 判据「单元档 = 与本批批档同名的那一档，收口删」未写档路径 ⇒ 变面单跑命令无法只据档执行 |
| 3 | 🔵 | 记账 · unverified | §5.8「tier 结论：一个文件都不跨层，无拆分方案。」文件层抽检通过（抽检各档均 < 500）；函数层（300+ 行单函数）本机无 LSP ⇒ 未测，不入判 |

VERDICT: pass

🔴 0 · 🟡 1 · 🔵 2

### 轮次 4（评审子代理）

依据 `docs/core/design/MULTI-INSTANCE-COLLAB.md` 与 `docs/core/requirements/MULTI-INSTANCE-COLLAB.md`（本轮重开评审，四项核查）。

| # | 严重度 | 状态 | 证据 |
|---|---|---|---|
| 1 | 🟡 | 需求面边界未登记 | 需求档 F-MI10「**目标不可达 ⇒ 当场报错**（点名目标与原因，发送方自己换目标）——**不落待取队列、不静默丢**」+ N-MI8「**失败可见**（不可达当场报错，点名目标与原因）」vs 设计档 §5.9「pid 被无关进程复用时该会话已不在，消息照常落进 `/inbox/{sessionId}/`、无人取件、随 `INBOX_STALE_MS` 清扫消失（不重投）」 |
| 2 | 🟡 | 列面「同一把尺」只枚举两条 | §5.2「列的判据与发送面**同一把尺**：名册有条目 ∧ pid 活」+「`instance_list`（只读 · 无参）→ 机器级**可投递**实例」vs §5.5「判据三条：名册有条目 ∧ pid 活 ∧ inbox 目录可写」 |
| 3 | 🟡 | D-MI26 理由与 §5.9 代价面互拆 | D-MI26「身份族不在这个代价链上——消息按目录名投递，pid 认错不改变落点」vs §5.9「无人取件、随 `INBOX_STALE_MS` 清扫消失（不重投）」 |
| 4 | 🟡 | §5.9 内清扫结局两种说法 | 「随 `INBOX_STALE_MS` 清扫消失（不重投）」vs「条目会留到该进程退出（`sweepInbox` 的在世判据 = 名册有条目 ∧ pid 未明确为死）」 |
| 5 | 🟡 | `INBOX_STALE_MS` 无取值 | §5.8 判据 ⑤「残留清理（`INBOX_STALE_MS` 两侧）」；同档 `INBOX_POLL_MS = 1000` · `INSTANCE_STALE_MS`(24 h) 皆有值 |
| 6 | 🔵 | 三条判据 / 四条报错态易混读 | §5.5「判据三条」vs D-MI26「发送前可达性四态」· §5.8「可达性四态判定」 |

核查通过项：① 判据三条在 §5.5 与 D-MI26 两处同口径（发面三条已成立）；② 投递面零「五态 ∥ 身份不符 ∥ cmdlineFn」残留（§5.8「本面零命令行探测 ⇒ 无 `cmdlineFn` 槽」· §5.2「身份族判据只在感知面」· §5.5「本面不判身份族」）；③ 代价面已在 §5.9 写出。

计数：🔴 0 · 🟡 5 · 🔵 1

VERDICT: pass

## §4 用户批准（主 agent）

## 用户批准（2026-11-09）

- **需求提出**：「我现在特别需要实例之间能发消息，比如刚才那些需求，其实可以 vsc 端直接发给你，就省得我贴过来了」。
- **三处口径（逐条问、逐条答）**：① 跨仓——「**必须是跨仓的**」；② 双向——「**互相发**」；③ 送达形态——「**作为用户消息挺好，只要能识别是跨 agent 消息就行**」。
- **失败处置**：「**报错吧**」（不可达当场报错，不落待取队列、不静默丢）。
- **送达时机**：「**回程送达时肯定不能打断当前会话，得等到当前会话处理完再处理**」——设计据此把取件点收到「回合链尾武装 + 在飞回合零注入」，**不复用既有排队通道的「一步一取」深度**。
- **非阻塞**：「**那肯定是非阻塞呀**」。
- **父侧对形态的判断**：不做人直接发的人面入口（用户在本端说话、由本端 agent 代发）；刷屏**不设防**（风险写清、处置留用户）；来源标记落**人读线**而非 `[system reminder:` 机器线。

## §5 实施记录（eng-coder）

## 实施摘要（eng-coder · 2026-11-09）

一句话：**「进程在」不再等于「收得到」——名册只在装上取件面时登记，发送面用四态当场报错；投递走「一轮一取」**。核三档新建、三端各接一处、工具两件同 `peer_instances` 点装配，集成用例 CLI 46-1 两个真进程跑通。

### 核三档（新建）

```text
thincoder-core/instance-registry.mjs      名册：registerInstance / refreshInstance / unregisterInstance /
                                          readInstanceEntry / listLiveInstances（纯只读）/ sweepInstances（写面清扫）
                                          / INSTANCE_STALE_MS / instance_list 工具 / 三档共用注入面
thincoder-core/instance-inbox.mjs         inbox：可达性四态 assertReachable / sendMessage / takeInbox（一次性）
                                          / sweepInbox（残留）/ INBOX_STALE_MS / MAX_RE_LEN / instance_send 工具
thincoder-core/instance-inbox-watch.mjs   取件闩：createInboxWatch（sync / disarm / fire）+ crossMessageContent /
                                          crossMessageText + INBOX_POLL_MS + _setPeerMessageTestImpl
```

### 逐条状态（对照 §2 A1–A9）

| # | 状态 | 说明 |
|---|---|---|
| A1 | ✅ | 标记行逐字：首发 `[cross-instance message · from <end> pid=<pid> session=<id> cwd=<p>]`、回程尾接 ` · re=<requestId>`；不是 `[system reminder:` 族（单测「注入形态」）|
| A2 | ✅ | 三端开轮都传 `autoTurn` 缺省 false（CLI `turn(text, {})` · VSC `runPanelChat(panel, { text })` · 桌面 `runTurn(key, agent, text, {})`）——手动态照常走审批面 |
| A3 | ✅ | 名册按 `~/.thincoder/instances/{sessionId}.json`、`cwd` 是字段；`peer_instances` 与白名单四键零改 |
| A4 | ✅ | 四态各有报错且点名目标与原因（`no-session` / `dead` / `unknown` / `inbox-unwritable`）；回执 `{requestId, target:{sessionId,end}, status:"delivered-to-inbox"}`，`requestId` = inbox `msgId` |
| A5 | ✅ | 取件只在目标无在飞回合；在飞 ⇒ 零取件零重臂（回合链尾重臂）；不挂 `consumeQueuedInput`、不进 `state.pendingInput` |
| A6 | ⚠️ | 六格标准属设计档正文（本席零改）；实现侧对得上的是「发送不阻塞 / 不打断 / 延迟上界 / 失败可见 / 不持久化 / 成本」六面，`sweepInbox` + `sweepInstances` 记 `logEvent`/`ev:*` 落实「失败可见」 |
| A7 | ✅ | 不保证已读 / 无应答超时 / 无来源认证 / headless 不入册（发送面报 `no-session` 并说明）/ 只本机 / 无广播派活——逐条落在三档注里 |
| A8 | ✅ | 单测档 22 例全绿（命令与结果见下）；含「无取件面不入册」「在飞不取件」「取件一次性」「re 对不上号原样注入」「三端装配」|
| A9 | ✅ | `test/RTM.md` 故事 CLI 46 行 + `test/rtm/tooling.md`「## CLI 46.」节与用例行 46-1；用例标题逐字 `test('CLI 46-1 …')` |

### 三端接线（四处逐一对应：会话起点 / 回合链尾 / 回合起点 / 退出）

| 端 | 会话起点（登记 + 装闩） | 回合链尾重臂 | 回合起点撤闩 | 退出（撤闩 + 删条目） |
|---|---|---|---|---|
| CLI | `tui/index.mjs`（`turnCtx.timerWatch` 邻位） | `tui/agent-turn.mjs` `runAgentTurnInner` finally | 同档入口 | `process.on("exit")` 删名册条目 |
| VSC | `chat-panel.mjs` `resolveWebviewView` | `panel-turn-stages.mjs` `finalizeTurn`（`syncTimerWatch` 同点） | `panel-chat.mjs` 忙态置 running 处 | `dispose` / view 销毁删条目；三点（转空工作区 / view 销毁 / dispose）撤闩 + `panel-session.mjs` 切槽撤闩 |
| 桌面 | `turn-driver.mjs` `ensureSession`（本键 agent 装配成功处） | `suspension-timers.mjs` `sync(key, agent)`（timer 闩同点） | `turn-driver.mjs` `drive()` 起跑处 | `disarm(key)` 同点；取件面归零 ⇒ `unregisterInstance()` |

**桌面端与另两端的形差（写清，不拿旧结论垫）**：桌面按会话键**懒装配** agent ⇒「会话起点」只能落在本键 agent 装配成功那一刻（`ensureSession`）——一个从未用过的会话在桌面没有 agent、也就没有取件面，本就不该在册。VSC 面板创建时 `_agent` 亦为 null（同类懒装配），差别是面板对象已存在 ⇒ 闩在载体缺席时照装（见下「代码评审」首条）。

### 实施中的三处判断（披露）

1. **消息落法 = 端壳开轮输入串，不是「先 pushReal 再空串开轮」**。设计 §5.4 写 `pushReal` 落 `role:"user"`；核 `prepareRun` 在 `!resume` 时无条件 `pushReal(agent, { role:"user", content: input })`，先推后以空串开轮会多出一条**空 content 的 user 消息**（直达 provider）。故实现 = `crossMessageContent` 组合 → 作为普通用户回合的 `text` ⇒ 恰好一条真 user 消息、形态逐字不变。**连带偏差**：§5.8 模块内容表点名的 `injectCrossMessage` 未实现（合并进 `crossMessageContent` / `crossMessageText`）——档面该行需主 agent 转 eng-designer 收正。
2. **`instance_send` 走既有工具审批面**（`readonly: false`），不自设豁免。§5.7「不加批准门」指本面不加配额 / 白名单；宿主的通用审批面不属本面射程，自行用 `isControlAction` 豁免等于替用户改门。
3. **`instance_list` 保持真只读**：死条目清扫从读面挪到写面 `sweepInstances()`（取件面装配处一次，条件 = 明确死 ∧ 条目超 `INSTANCE_STALE_MS`），理由 = 一个 `readonly: true` 的免审批工具不得删别人盘上的文件。

### 验证（命令 + 结果）

```text
node --test docs/batches/2026-11-09-cross-instance-message.test.mjs   → # tests 22 / # pass 22 / # fail 0
node --test test/integration/cross-instance-message.test.mjs          → # tests 1  / # pass 1  / # fail 0
node --check <全部改动档>                                              → 全 OK
doc_check(mode:"gate")：RTM.md / rtm/tooling.md / 本批档 / 两份 tool-docs → PASS（0 命中）
```

**失败侧读数（机检能不能红，实测过）**：把 `agent-turn.mjs` 链尾的 `ctx?.inboxWatch?.sync()` 临时改成不存在的 `syncX()` ⇒ 结构机检那条用例当场红（22 例中 1 红），改回即复绿——该断言不是恒真句。

### 内部审计与代码评审

- **自查轮**（读回全部改动档）：五处判断逐条对回设计 §5；发现并当场改掉 3 处（`instance_send` 参数校验收口、`refreshInstance` 不得 upsert、注入形态改走输入串）。
- **顾问代码评审 round 1 = changes-required**：1🔴 + 6🟡 + 3🔵。处置如下。

| # | 级别 | 处置 |
|---|---|---|
| 1 | 🔴 | **已修**：VSC 会话起点「武装」是空转（`_agent` 装配前为 null ⇒ 核 `sync()` 直接零注册，而名册已登记 ⇒ 发送方拿到「已送达」却永远无人取件）。修法 = 核 `sync()` 只在「端壳压根没给载体读面」时零注册，载体暂缺照装一拍（使 `fire()` 的「下一拍再看」成立）；单测补「载体缺席照装 / 端壳未给缝才零注册」两侧 |
| 2 | 🟡 | **已修**：VSC 三端装配断言原用自带 `_agent` 的假面板（绿是被 setup 换来的）；改为生产同态 `_agent: null` 起跑 |
| 3 | 🟡 | **已修**：`instance_list`（`readonly: true`、免审批）在 `listLiveInstances()` 里 `unlinkSync` 别人的名册条目 ⇒ 读面零删，清扫移 `sweepInstances()` |
| 4 | 🟡 | **部分修**：清扫加「明确死 ∧ 条目超 24 h」双条件，降低「探测成功却漏读 pid ⇒ 删活实例条目且永不重建」的代价；**残留未消**：超龄且一时漏读仍会删（入册只在装配处一次，`refreshInstance` 按 D-MI28 不 upsert）。彻底解需设计席定「在册由取件面在位持续表达」的形态 |
| 5 | 🟡 | **已修**：火面 `void fire()` 无人兜 ⇒ 加 `.catch`（`ev:inbox-watch-err` + 重臂），不再逃逸成 unhandledRejection |
| 6 | 🟡 | **不改（保留理由）**：可达性两发串行探测（判活后仅存活才探命令行）是 §5.5 四判据的顺序语义；代价上界仍是一次判活 + 一次原子写之外的一发异步探测 |
| 7 | 🟡 | **已修**：本段即 §5 实施记录；「真端 `pushReal` 落法未验」在下表如实登记 |
| 8 | 🔵 | **已修**：标记行 pid 不可解析 ⇒ `unknown`（与 end / sessionId / cwd 同口径），不再回退到接收方 pid |
| 9 | 🔵 | **已修**：`sweepInbox` 同收 `*.taken` 残留（原来只扫 `*.json`，取件删除失败的文件永不清） |
| 10 | 🔵 | **未修（档面，非本席写域）**：设计 §5.8 把 CLI 工具装配点写作 `thincoder-cli/src/cli/make-agent.mjs`，实落 = 核 `assembleBuiltinTools`（`make-agent.mjs` 零命中）——请主 agent 转 eng-designer 收正该行 |

- **终态 = `clean`**（round-1 全部处置落地、两套测试复跑全绿）；**未复跑 round-2 的「修复核对」**（轮次预算），故 round-1 的修复结论以本段表格 + 复跑读数为准。
- **未验（如实登记）**：① VSC 端 `onTake` 拉起 `runPanelChat` 那一段未跑（需 VS Code 宿主；单测只验到「到点能取走」这半段）；② 桌面端 `ensureSession` / `dispose` 两处宿主挂点未跑（需 Electron 宿主），只有闩表与到点取件跑了；③ 集成用例把**回合面**换成夹具（真 TUI 要 TTY、要真 provider）⇒ 「起一轮 + `role:"user"` 落法」在真三端未被执行证据覆盖；④ `thincoder-desktop/node_modules/@thincoder/core` 是**已发布副本**（非 junction），新三档尚未进副本 ⇒ 桌面端按包名 import 新档在本机会解析失败（发布随核版本走；单测期用解析钩子直指本仓核）。

### 越清单改动（逐档理由）

```text
thincoder-core/tool-docs/instance_list.md        新增：工具描述单点（DESC 加载；peer_instances 同制）——清单外
thincoder-core/tool-docs/instance_send.md        同上
thincoder-core/tools/index.mjs                   `assembleBuiltinTools` 挂两件（= peer_instances 装配点，两壳同得）——清单外
thincoder-vscode/src/tools/index.mjs             VSC 自有工具表并两件（缺则 VSC 端 agent 拿不到工具）——清单外
thincoder-vscode/src/extension/panel-chat.mjs    回合起点撤闩（设计 §5.8 未点名、但「回合起点撤闩」必须落在回合入口）——清单外
thincoder-vscode/src/extension/panel-session.mjs 切槽撤闩（设计 §5.8「三点」之一 = loadSession）——清单外
thincoder-desktop/src/main/turn-driver.mjs       会话起点登记 + 回合起点撤闩（设计 §5.8 只点到 suspension-timers / timer-watch 两档，宿主挂点须在此）——清单外
test/integration/fixtures/cross-instance-harness.mjs 集成用例的实例壳（夹具；回合面替身，头注写明能证/不能证）——清单外
```

- 清单外无「顺手改」：以上每一条都是本批接线或工具面所必需。
- **设计档 / 需求档零改**（按主 agent 指示）；设计档的两处档面滞后（§5.8 的 `injectCrossMessage` 行、CLI 装配点行）已在本段登记，待 eng-designer 收正。

### 重开轮（投递面撤身份族 · 2026-11-09 · 台账 #2246）

一句话：**投递面不再问「这个 pid 是不是我们」**——判据只剩「在册 ∧ pid 活 ∧ inbox 可写」；列面同撤，注入缝的命令行槽一并删去。感知面（`peer_instances` / `process-probe` 的 `isProductProc` / 槽位清理面）一个字未动。

**改动的四处**：

| # | 落点 | 改成 |
|---|---|---|
| 1 | `thincoder-core/instance-inbox.mjs` 的 `assertReachable` | 删判活后的命令行探测段与 `mismatch` 态；`unknown` 收窄为「判活探测失败」一条；`inbox 不可写` 补上设计 §5.5 要求的「换一个 sessionId」建议句（与另三态同形） |
| 2 | `thincoder-core/instance-registry.mjs` 的 `listLiveInstances` | 删 `definitelyOther` 过滤与批量命令行探测；判据 = 在册 ∧ pid 活（探测失败 ⇒ 不列） |
| 3 | 三档注入面 `_seams` / `_setPeerMessageTestImpl` | 去命令行槽：四槽 = `nowFn` / `aliveFn` / `timer` / `clear` |
| 4 | 三档头注 · `tool-docs/instance_send.md` · VSC 工具表注 | 「五态」→「四态」；`instance_send` 的不可达枚举删掉「pid reused by another process」（撤判据后那句是假话） |

**动因用例（先跑红、再改、后复绿）**：新增「发送 ②-6」——真子进程（`node -e`，命令行不含本产品字样）+ 生产探测，先证场景前提再断言送达。撤身份族前该例红，读数：

```text
InstanceSendError: instance_send: pid 14940 registered as session "333-walkthrough" now belongs to another process — the message was not sent.
  code: 'mismatch'
```

同一次红跑另有四例（②-1 / ②-5 / ③ / ⑥-1）因「no command line could be read for that pid」被拦（`code: 'unknown'`，pid 是夹具假 pid）——两处红同源：命令行探测长在可达路径上。

**读数（命令 + 结果）**：

```text
node --test docs/batches/2026-11-09-cross-instance-message.test.mjs   → # tests 26 / # pass 26 / # fail 0
node --test test/integration/cross-instance-message.test.mjs          → # tests 1  / # pass 1  / # fail 0（CLI 46-1 未退红）
node --check <全部改动档>                                              → 全 OK
doc_check(mode:"gate")：test/rtm/tooling.md · tool-docs/instance_send.md → DOC-CHECK GATE: PASS
```

**D14 清扫（闭集 + 预期残留 = 0，逐档实读）**：闭集 = `isProductProc` · `probeCmdlinesAsync` · `cmdlineFn` · `definitelyOther` · `mismatch` · 「身份不符」 · 「五态」。结果：三档核件 0 命中 · `tool-docs/instance_send.md` 0 · `tool-docs/instance_list.md` 0 · 集成用例与夹具 0 · RTM 故事 CLI 46 节注 0。

一处例外如实登记：同名单测档里 `probeCmdlinesAsync` 两处保留——那是 ②-6 在**证场景前提**（目标命令行确实不含本产品字样），不是判据残留。

**本轮清扫又发现的两处**（都在清单外、逐条理由见下）：集成用例头部「§5.5 五态」与夹具「带 `thincoder-cli` 参数落进 `isProductProc` 族」那段一并去掉（那份夹具不再是「装成 CLI」才收得到消息）；RTM 故事 46 节注同两处同步。

**内部审计与代码评审**

- **审计（read-only explore，对照 §2 与设计 §5）**：1 条 findings —— RTM 故事 46 节注写「三态（行序）= 46-1 正常…」而该节只有一行用例（同档他节的形 = 计数与枚举同改），当场改为「一态（行序）= 46-1 正常」。
- **顾问代码评审 round 1 = pass**：0🔴 / 2🟡（均「可选、不阻断」）/ 4🔵。处置：三条 🔵 当场落地（`inbox 不可写` 建议句补齐 · ②-6 的固定等待改有界轮询、前提不就绪时以「本场景无法成立」报红 · 单测档里一个无名块标签删掉）；两条 🟡 落在别人的笔上，上抛父侧（见报告）。
- **终态 = `clean`**（round-1 可处置项全部落地，两套测试复跑全绿）。

**越清单改动（逐档理由）**

```text
thincoder-core/instance-inbox-watch.mjs           去 `_setPeerMessageTestImpl` 的命令行槽 + 两处头注同步（任务书第 3 条点名要改；该档不在本 spawn 的声明文件表内，如实登记）
thincoder-core/tool-docs/instance_send.md        不可达枚举删「pid reused by another process」——撤判据后那句是假话，而它是模型读的描述面
thincoder-vscode/src/tools/index.mjs             一处注释「可达性五态」→ 四态（登记面同拍同步）
test/rtm/tooling.md                              故事 46 节注三处：§5.5 五态→四态 · 删「夹具带 thincoder-cli 参数落进 isProductProc 族」半句 · 三态（行序）→一态（行序）
```

清单外无「顺手改」：每条都是本轮撤判据的连带面，不改则盘上留下与现码相反的句子。

**未验（如实登记）**：VSC / 桌面两端仍需宿主（沿用首轮登记：`onTake → runPanelChat`、`ensureSession` / `dispose` 两处挂点未跑）；本轮零改端壳代码，未验面与首轮同。

## §6 验证与收口（父代理）

## 验证与收口（父侧）

### 验收读数（父侧亲自跑，2026-11-09 23:20）

- `node --test docs/batches/2026-11-09-cross-instance-message.test.mjs` ⇒ **`tests 22 · pass 22 · fail 0`**（该档收口删除，读数留此）。
- `node --test test/integration/cross-instance-message.test.mjs` ⇒ **`tests 1 · pass 1 · fail 0`**（`CLI 46-1`，两个真 node 进程）。
- `node --check` 全部改动档 ⇒ 全 OK；`doc_check` ⇒ `PASS`。

### 失败面

实施席把 `agent-turn.mjs` 链尾的 `inboxWatch?.sync()` 临时改成 `syncX()`，结构机检那条当场红，改回复绿。

**一处如实登记的缺口**：「起一轮 + `role:"user"` 落法」在**真三端无执行证据**——集成用例把回合面换成夹具（真 TUI 要 TTY）。这不是没验，是**验不了**，已写进 §5「未验」。

### 落地核对

- **核三档（新建）**：`instance-registry`（名册：登记 / 刷新 / 退出删除 / 只读清单 / 写面死条目清扫）· `instance-inbox`（五态报错 + `sendMessage` 非阻塞 + `takeInbox` 一次性 + 残留清扫）· `instance-inbox-watch`（`INBOX_POLL_MS = 1000` 链式重臂 + 逐字消息形态 + 三档共用注入面）。
- **可达判定（本批最要紧的一处）**：名册条目**只在取件面装配处登记**，无取件面的会话（headless：`chat` 一次性 / ACP / 直连 `runAgent`）**不入册** ⇒ 不可达在**发送面当场报错**，不再有「消息躺在盘上等过期、回执却说送达」。
- **三端接线**：CLI 四处（会话起点登记 + 装闩 / 回合链尾重臂 / 回合起点撤闩 / 退出删条目）· VSC 四处 · 桌面四处，同形。
- **落法收正**：设计原写「先 `pushReal` 再起轮」，实施席实读发现核 `prepareRun` 在 `!resume` 时**无条件** `pushReal(input)` ⇒ 两件一起做会落成两条 user 消息、其中一条 content 为空直达 provider。改为「消息作为普通用户回合的**输入串**」，设计档同轮收正并把那句代码事实落纸。

### 三端诚实度（本批最该被看见的一行）

| 端 | 状态 | 说明 |
|---|---|---|
| CLI | ✅ 验过 | 集成用例覆盖投递、在飞不插队、回程带号、不可达报错 |
| VSC | ⚠️ 已接未验 | 需 VS Code 宿主；只验到「到点能取走」，`onTake → runPanelChat` 未验 |
| 桌面 | ⚠️ 已接未验 | `ensureSession` / `dispose` 两处挂点需 Electron；闩表与到点取件跑过 |

### 过程中清掉的真问题

- **实现偏离设计一处**（落法），设计席收正并落纸依据。
- **装配点坐标错**：设计写 CLI = `make-agent.mjs`，实读该档对 `builtinTools` 零命中；同句假话还在 §3.3 ∥ §7 两处，四处一并改准为核 `assembleBuiltinTools`。
- **`AGENT-LOOP-ASYNC-POOL.md` 自相矛盾**（`#2248`）：§6.30.1 说桌面「自唤醒面仍不存在」，§6.30.5 表说「已落」，盘上 `timer-watch.mjs` 在。设计席整段删除旧话，并扫出三处同类旧话 + 一处自己造成的悬空指针一并收正。

### 已知边界（明写，不留白）

- **名册清扫残留（`#2250`）**：写面清扫（判活明确为死 ∧ 超 `INSTANCE_STALE_MS` 24 h）仍可能误删活条目（探测成功却漏读一个 pid），而入册只在装配处一次、`refreshInstance` 不 upsert ⇒ 该实例到重启前按「无此会话」拒收。**24 h 只压低不消除**；彻底解 = 在册由取件面在位持续表达，另议。
- **不保证已读 / 不保证回话**：目标在取走前死掉 ⇒ 消息随清理消失（不重投）。
- **桌面端核副本**：`node_modules/@thincoder/core` 是已发布副本，新三档要等核发版才进副本；本机单测期用解析钩子直指本仓核，生产不受影响。

### 集成测试面

- 新故事 `CLI 46` · 用例 `CLI 46-1`；`test/RTM.md` 与 `test/rtm/tooling.md` 同步。

### 台账

- 本批行 `#2246` 走完 `在途 → 待核销 → 已核销`；`#2248` 同批核销。
- `#2250`（名册清扫残留）**认账不排期**，随本批一并挂账。

### 收口扫描

- **延后批复核**：无。
- **文档检查门**：`PASS`。
- **遗留**：`#2250` 未处置（认账不排期）。

## 重开轮收口（2026-11-09 23:54 · 投递面撤身份族核查）

### 验收读数（父侧亲自跑）

- `node --test docs/batches/2026-11-09-cross-instance-message.test.mjs` ⇒ **`tests 26 · pass 26 · fail 0`**（该档收口删除，读数留此）。
- `node --test test/integration/cross-instance-message.test.mjs` ⇒ **`tests 1 · pass 1 · fail 0`**（`CLI 46-1` 零改仍绿）。
- `doc_check(mode:"gate")` ⇒ **`PASS`**。

### 失败面（实施席实跑，父侧采信）

改前红读数 = **本改动的动因证据**：

```text
InstanceSendError: pid 14940 registered as session "333-walkthrough"
now belongs to another process — the message was not sent.  code: 'mismatch'
```

另有 4 例因「no command line could be read for that pid」被拦（`code: 'unknown'`）——两处红同源。**`333-walkthrough` 就是走查实例的形状**，与 2026-11-09 23:28 的真实现场同型。

### 落地核对

- **发面**：判据三条（在册 ∧ pid 活 ∧ inbox 可写）；`isProductProc` 与 `mismatch` 态删除；报错四态；`unknown` 收窄为「判活探测失败」——本面零命令行探测。
- **列面**：`listLiveInstances` 删 `definitelyOther` 过滤与批量命令行探测；读面仍零删盘。
- **注入缝**：`cmdlineFn` 槽删除（四槽 = `nowFn` / `aliveFn` / `timer` / `clear`）。
- **D14 贯通清扫**：闭集 = `isProductProc` · `probeCmdlinesAsync` · `cmdlineFn` · `definitelyOther` · `mismatch` · 「身份不符」·「五态」，逐档实读残留 0；一处例外（单测档保留 `probeCmdlinesAsync` 两处，用于断言「该进程命令行确不含产品字样」的场景前提，非判据残留）。
- **新用例**：真子进程 + 生产探测，先断言前提（该进程命令行不含本产品字样）再断言送达 + 回执带 `requestId` + 消息真落目标 inbox。

### 需求面同步（父侧之笔）

`docs/core/requirements/MULTI-INSTANCE-COLLAB.md` N-MI8 补边界三条：可达判据 = 在册 ∧ pid 活 ∧ inbox 可写（不判身份族）；pid 复用 ⇒ 回执仍说「已送达」但无人取，**至多留到那个进程退出 + `INBOX_STALE_MS`(24h) 后清并记 `logEvent`**——这是「不静默丢」的边界。F-MI10 加一句指向 N-MI8。

**初稿写错一处**：先写成「随清扫消失」，设计席指出 `sweepInbox` 的在世判据是 `!gone ⇒ 保留`，「到点必清」不成立，已按实读改正。

### 设计面收尾（三轮同形缺陷）

本轮修改自身带出三处新缺陷，全部同轮清掉：

1. 设计与实现互斥 → 评审 5🟡 + 1🔵 全收，设计席六处收正（含 `INBOX_STALE_MS`(24h) 补值、`sweepInbox` 上界改准、D-MI26 理由收窄）。
2. 设计席删清单 → §5 指针悬空 → 实施席清掉。
3. §2 残留的旧工作单与死引文 → 删净（删后自检：`isProductProc` 剩 3 处全为「感知面保留」现态真话，`mismatch` 剩 1 处为 grep 搜索词，`definitelyOther` 0 处）。

### 集成测试面

- 本批 +1 例（`CLI 46-1`），改写 0 行。
- **集体现状 57 档 178 例，越 ≈50–100 窗口约 1.8 倍**——既有存量，非本批所增，已记账 `#2253`（处置方向 = 按故事修剪，不拒收新例）。

### 台账

- `#2246` / `#2248` 已于首轮核销，重开不回收。
- 本轮工作行 `#2251`（VSC 实例登记成功但判活不认 ⇒ 只能收不能回）→ 本批收口时核销。
- `#2253`（集成集越窗口）新开，转下一批。

### 收口扫描

- **延后批复核**：无。
- **文档检查门**：`PASS`。
- **遗留**：`#2250`（名册清扫残留，认账不排期）· `#2253`（集成集修剪）——均已在台账挂账。

### 同型缺陷留档（给下一批）

本轮四处「改动带出新缺陷」：补 `K` ⇒ §2 引文失效；加空格 ⇒ §5 引文失效；破锁补旧形 ⇒ 需回改；删清单 ⇒ §5 指针悬空。**四次都不是粗心，是「改 A 会让指向 A 的 B 失效」这个性质本身**——四次都被报告出来了。
