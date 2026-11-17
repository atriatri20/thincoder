# 2026-11-14 · suspension-drive-split
> 六段，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 每段只有一个作者：作者的段可 `append` 加内容、可就地改（`edit`）；非作者一概拒。
> 编制：主 agent · 2026-11-14 · 来源 = 台账 #2418（上一批 §6 记的越档账）；CODE-TIER §3「≥300 必须拆成可复述的骨干与细节」；用户 2026-11-14 15:50 答「开」。
> 台账 = #2418（— · 归批）。前情 = docs/batches/2026-11-14-inbox-pickup-window.md（已收口 2026-11-14）。
## §1 讨论（主 agent）
**状态行**：已收口 2026-11-14
批起 sha = 95778d2e71696e43ce4f9aa70c64cc212e6b1066
<§1 模板占位：本批条目 / 关键判据 / 授权口径>

### 本批做什么

把 `thincoder-desktop/src/main/suspension-drive.mjs` 里的 `createSuspensionDrive` 从「一个 322 行的单函数」拆成「可复述的骨干 + 若干有独立语义的单元」，**行为零变化**。

### 为什么现在做

- CODE-TIER §3 的硬线：函数 ≥300 ⇒ **必须**拆成可复述的骨干与细节。
- 台账 `#2418` 是上一批收口时记的账，条件「本批收口后独立开批」已满足。
- 越档读数：上一批在批起快照 `99aeb74` 上量得 305；本批起盘上 322（函数体 37–358 行，`countContentLines` 同一把尺 + node 行扫描）。

### 验收（每条都要能被读者判对错）

- **A1 结构**：`createSuspensionDrive` 本体 ≤ 100 内容行；每个拆出的单元单独 ≤ 100 内容行。量法 = 函数跨度 node 行扫描（与上一批同一把尺）。
- **A2 行为零变化**：桌面 `node test/run.mjs` 14 例全绿 · 跨实例集成 2 例全绿（`46-1` ∥ `46-2`）· 全量 217 例 / 215 绿 / 2 红，两红仍必须是 `CLI 43-1` ∥ `43-2`（归 `#2404`），且不得新增红。
- **A3 对外面不变**：`createSuspensionDrive` 的形参键集与返回对象键集逐字不变——`start` ∥ `turnDone` ∥ `stepBoundaryPickup` ∥ `pushInput` ∥ `active` ∥ `inputSnapshot` ∥ `abort` ∥ `abortAll` ∥ `armInbox` ∥ `size` ∥ `timerLatches`。判据要能指出增删。
- **A4 可复述**：每个拆出的单元有一段头注，写清它管什么、不管什么。

### 已定决定

- **已定决定**：拆分按概念与可独立验证性，不为凑数字切碎连续逻辑 · 依据 CODE-TIER §3 末句「函数拆分按概念和可独立验证性，不为满足数字而切碎连续逻辑」 · 时间：2026-11-14（本条为标准既有裁定，非用户新裁）。

### 边界（本批不做）

- 不改任何行为、不改帧面（`ev:susp` ∥ `ev:digest` ∥ `ev:subagent`）与文案。
- 不改 `suspension-timers.mjs` ∥ `window-queue.mjs` ∥ `suspension-guard.mjs` 的行为；真需要动它们 ⇒ 停下上抛。
- 不动两条既有不变量：`entry.pending` 单一数组、「零第二写者」。
- 不顺手改 `#2417` 那批悬空节引用（另账）。

### 现状机制（主 agent 实读）

本档是一个工厂函数，内部以闭包持有窗表 `windows`、窗队 `queue`、续发期键集 `resuming`、墓碑 `abortTombstones`、闩面 `timers`。

内部概念**已经**按块分开且各有头注：

| 块 | 行 | 管什么 |
|---|---|---|
| `windowTake` | 52–58 | 取件窗缝：窗在场 ⇒ 消息进窗队列 + 唤醒 |
| `sweepDigestedStuck` | 91–109 | 已消化驻留块自愈扫读 |
| `reemitDone` | 115–126 | 逐条补发 `done`（含 consult 子块展开） |
| `injectResidual` | 130–138 | 退出残余注入（按 role 分发） |
| `stepBoundaryPickup` | 151–159 | 窗步边界取批 |
| `driveTurn` | 171–206 | 窗内单回合（用户 ∥ 消化 ∥ 唤醒） |
| `resumeResidual` | 216–250 | 残输入兜底续发 |
| `start` | 256–301 | 入口：判池 ⇒ 建窗 ⇒ 装配核件 ⇒ 出窗结算 |
| `abort` | 306–318 | 会话中止（先落代次，再摘窗 ∥ 落墓碑） |

**真障碍**：这些块全都吃同一组闭包状态。拆成模块级函数必须显式传状态面，否则会出现第二个写者——本档头注反复强调 `entry.pending` 是「单一数组、零第二写者」。

### 勘察

- **库内 = 已查**：`doc_search`「桌面挂起驱动 suspension-drive 职责 挂起会话 KD-34」→ 命中 `docs/desktop/design/ACTIVITY.md` §2、`docs/core/design/ARCHITECTURE.md` §3.5、`docs/core/design/AGENT-LOOP-ASYNC-POOL.md` §1、`docs/desktop/design/MULTI-INSTANCE-COLLAB.md` §6；另读 `docs/core/standards/CODE-TIER.md` 全文与本档源文 359 行。
- **库外 = B 类**：改动面 = 桌面主进程一个胶水档；外部断言 = 零。

### 授权

- 用户 2026-11-14 15:50 答「**开**」（回应父侧「要不要现在开这个批？」），15:57 追加「**自动跑完**」。
- **自动推进**：本批全链（设计 → 评审 → 修面 → 实施 → 验证 → 收口 → 提交）不需逐步确认 · 用户原话：「**自动跑完**」· 时间：2026-11-14 15:57。设计席的开工词由该授权承载。

### 覆盖账

覆盖账 = #2418

### 上抛

- 无。

### 设计评审第 1 轮 · 父侧裁决（2026-11-14）

判定 = **changes-required**（🔴 2 · 🟡 6 · 🔵 2）。十条**全部采纳**，无一驳回。修面席 = 设计席，`round = fix`。

| 评审编号 | 严重度 | 处置要求 |
|---|---|---|
| #1 | 🔴 | `§2.4` 的 A2 判据改成**改面单测档**（`node --test docs/batches/2026-11-14-suspension-drive-split.test.mjs`）；「桌面全量 14 例」「`46-1` ∥ `46-2`」「全量 217 例 / 215 绿 / 2 红」三行一律移到 `§6` 收口读数面 |
| #2 | 🔴 | `ACTIVITY §2.1` 的缝表补齐：**窗内回合档加 `notify`**（`turnDone` 由它产出）；**出窗档改取 `turn`**（或显式注入 `turnDone`）。表下点明 `turnDone` 的两个调用点（窗内用户回合 ∥ 残值续发回合） |
| #3 | 🟡 | 表补一列「交出哪些键」（或每档行末补 `交出 = …`），把 `resident(agent)` 明确成驻留档的读面出口 |
| #4 | 🟡 | 驻留档「不碰」列的「时机在装配档与核件钩子」改指实际三个落点：窗内回合档的起跑支 ∥ 建窗档登记的两枚核件钩子（`reclaim` ∥ `freezeAll`）∥ 驻留档自愈扫读；`§2` 顶部那句「起跑时对本轮驻留补发 done」补上归属 |
| #5 | 🟡 | `§2.7` 先例补齐三段坐标：实现坐标（已有）∥ 该形态所在设计档节 ∥ 同类先例批次；并写清与文档头注（`RENDER-CORE.md` 的 subblocks/scroll）那条的关系 |
| #6 | 🟡 | `§2` 自带一行勘察证据：公开源档（含独立档仓）查了什么、有无相关；不得以「见 §1」代答 |
| #7 | 🟡 | 八个新名逐个三问：四个档名（`suspension-resident.mjs` ∥ `suspension-window-turn.mjs` ∥ `suspension-window-open.mjs` ∥ `suspension-window-close.mjs`）+ 四个工厂名（`createResidentFace` ∥ `createWindowTurn` ∥ `createWindowOpen` ∥ `createWindowClose`）。既有 `suspension-guard.mjs` ∥ `suspension-timers.mjs` ∥ `window-queue.mjs` 是否已能承载，属这条要答的 |
| #8 | 🟡 | A2 的单测断言清单按**搬动了什么就断言什么**补齐：四处驻留出口 ∥ 回合三径（用户 ∥ 消化 ∥ timer）∥ `ev:digest start` 边界帧与留档同点双动作 ∥ 提示面 `turnDone` ∥ `windowTake` 受理与唤醒 |
| #9 | 🔵 | `§2.2` 的必填缝抛错点明依据，与同档既有 `post required (out-bound channel)` 头检对齐 |
| #10 | 🔵 | `ACTIVITY §2.1` 只引 `CODE-TIER` §3 的规则名与判据形，数值留在标准与其实现里 |

**修面边界**：本轮只动 `docs/desktop/design/ACTIVITY.md` 与本档 `§2`；不碰代码；不改 A1 ∥ A3 ∥ A4 的语义（#1 只改 A2 的测法面，#8 只补断言清单）。

### 设计评审第 2 轮 · 父侧裁决（2026-11-14）

| # | 处置 | 细节 |
|---|---|---|
| 1 | 🔴 修 | `createWindowTurn` 表补 `windows`：其「交出」列含 `windowTake` ∥ `stepBoundaryPickup`，两者体首句都是 `const entry = windows.get(key)`。与轮次 1 #2 同形（缺缝），上一轮修面漏了这一处。 |
| 2 | 🔴 修 | A1 的数字与判据必须自洽。现写「骨架余 74，加接线约 86」而判据是「骨干 ≤100」：86 落骨干 ⇒ 约 160 越线，摊进四单元 ⇒ 出窗收束 81+22 越线。给出回落路径：接线若撑不住骨干，就引**第五单元**（对外面出档）；读数写成落点结构 + 实施后实测，不以估算充判据。 |
| 3 | 🟡 修 | 跨档交接实参点名：`onExit` ∥ `onRestart` 收什么、`entry` 由谁传。盘上 `closeWindow` 吃闭包内 `entry` ∥ `controller` ∥ `agent`，`resumeResidual(entry)` 同；`§2.2` 又禁止两单元互持状态 ⇒ 实参形态必须写死，不能只给函数名。 |
| 4 | 🟡 修 | `ev:susp` 两帧的单点归属（`postSusp` 归建窗档、`postSuspEnd` 归出窗档）搬进 `ACTIVITY` §2.1 表的「交出」列。现在只住本档 §2.3，收口后随批档消失，设计档读者无法判定两帧定义点。 |

**修面边界**：仍只动 `docs/desktop/design/ACTIVITY.md` 与本档 §2；不碰代码；A2 ∥ A3 ∥ A4 语义不变。

**过程记录**：派给修面席 `#85` 的子代理随 2026-11-14T08:02 进程重启一并丢失，四条未落面。重启后按本表重派。

### 设计评审第 3 轮 · 父侧裁决（2026-11-14 · VERDICT: pass）

六条全部采纳；四条 🟡 与两条 🔵 都是设计档措辞与读数可复现性，不动结构方案，故不阻断。

| # | Action | Detail |
|---|--------|--------|
| 1 | Deferred | 🟡 `createWindowClose` 的注入缝 `latches` 全档无定义（`resuming` ∥ `abortTombstones` 的归属只活在 `§2.3`）。设计档面，且过审字节已封印——此刻改它会让实施席拿不到凭证。实施交付后由设计席补进 `ACTIVITY` §2.2 或表内 close 行 |
| 2 | Deferred | 🟡 `§4` 写「键名见 §2.3」而该条只列 11 个返回键；十三项形参键集全档无名单。同上，交付后由设计席补 |
| 3 | Deferred | 🟡 `§2`「hooks 负责计数、digest、reclaim、冻结和输入」与源文相反：`hooks` 实为 `onCounts` ∥ `reclaim` ∥ `freezeAll`，`takeInput` 是同级选项，源文头注写明「本档不注册该钩 —— 零双帧」。表内三处钩子归属正确，只有这句概述松。交付后由设计席收 |
| 4 | Deferred | 🟡 `§2` 记录句的「当前记录族」∥「活流优先规则」∥「人读线」三名无指路文档。交付后由设计席补指路或删句 |
| 5 | Deferred | 🔵 批档 `§2.4` A1 设计时读数不可复算（四档 65+69+50+76=260，同句写「去重后实搬 246」而 14 行未归属；76 的分解漏「四档创建与一次后绑」）。A1 判据是实施后复量且有回落路径，不阻断。批档 `§2` 属设计席笔域，交付后同轮改 |
| 6 | Deferred | 🔵 `createWindowOpen` 的缝 `queue` 在源 `start` 体内无消费者。实施席按已批设计保留该缝（不偏离设计），`null` 语义按源文默认值处理；缝要不要删由设计席交付后裁 |

**派实施席的依据**：评审已签发凭证，`§2` 任务书自洽（A1 判据 + 回落路径 + A2 七项 + A3 对外面 + A4 头注对齐）。本轮不动被审字节。

### 实施后设计档收正轮（父侧派单，2026-11-14）

实施已交付（§5），代码面不动。本轮只收 §5.6 / §5.7 具名留的八条，改设计档 `docs/desktop/design/ACTIVITY.md` 与本批 §2：

1. `latches` 缝全档无定义 —— `resuming` ∥ `abortTombstones` 归属只活在批档 §2.3，收口后随档删除。搬进设计档「交出」列。
2. §4 形参名单缺项 —— 与盘上 `createSuspensionDrive` 的实参表逐名对平。
3. §2 首段 `hooks` 概述与盘上相反 —— 源文头注写明「本档不注册该钩、零双帧」，设计说「hooks 负责 digest」。按盘上改。
4. 记录族三名（`entry` ∥ `controller` ∥ `handle`）无指路 —— 各给一句「是什么、谁建、谁读」。
5. A1 的设计时读数不可复算 —— 改成只留判据（实施后实测 ≤100），旧估算数字删掉。
6. 建窗档死缝 `queue` —— 移出注入缝表，并在设计档写一句它为何不在缝上。
7. §2.2「零适配器」与后绑转发件措辞相抵 —— 统一成后绑的实际形。
8. §2.2「注入缝不带缺省值」与可选缝 `null` 缺省相抵 —— 说清哪些缝必填、哪些可选。

判据：设计档与盘上代码逐名对得上；`doc_check` gate PASS；不新增机制、不改代码。

## §2 批次任务与设计（eng-designer）
**状态行**：设计完成

### 2.1 本批条目

- **覆盖**：`#2418`「suspension-drive.mjs 的 createSuspensionDrive 越函数档，需独立拆批」——本批唯一覆盖条目，收口时核销。
- **明确不在本批**：`#2417`（悬空节引用，另账）· `#2404`（`CLI 43-1` ∥ `43-2` 两红，另账）。本批不动这两处，也不把它们计进验收红绿。

### 2.2 设计档落点

`docs/desktop/design/ACTIVITY.md` §2.1（内部分工表 ∥ 为何这样切）· §2.2（状态归属与零第二写者）· §2.3（边界）· §4 的结构面一行（对外键集与头注对应）。实现以该四节为准；本段只记本批怎么落，不另立口径。

### 2.3 机制设计（摘要与三条易踩接缝）

拆法：`createSuspensionDrive` 退成装配骨干（五件状态 + 注入缝分配 + 对外面），语义落四档，档名与职责见 design §2.1。

1. **后绑缝（open ↔ close 互指）**：建窗档需 `onExit = closeWindow`，出窗档需 `onRestart = start`。装配档先声明两个可变绑定，四档建齐后一次绑死。两闭包只在装配完成后被调（`handle.done` 回调 ∥ 残值链尾），故后绑零行为差。**实参形态 = design §2.2 的两条**：`onExit(entry, failure)`——`entry` 由建窗档的 `start` 传（载体对象，`controller` 在 `entry.controller`），`failure` = `null` ∥ 错误对象，调用点 = `handle.done` 的两个回调；`onRestart(key, agent, { cwd })`——与 `start` 形参逐字同形，原样注入，出窗档按 `entry.key` ∥ `entry.agent` ∥ `entry.cwd` 传。
2. **建序**：resident → turn → timers → close → open → 绑定。`timers` 建时吃 `windowTake`，而 `windowTake` 由 turn 档交出 ⇒ turn 必须先在；close 吃 `latches`（`resuming` ∥ `abortTombstones`）∥ `resident` ∥ turn 档交出的 `turnDone` ⇒ 也须在 turn 之后、open 之前建，再回绑。
3. **身份与单点**：`entry.handle` 仍由建窗档在 `startSuspension` 返回后赋值（闭包内 `entry.handle.wake()` 依赖它）；注入给 timers 的 `windowTake` 是同一函数对象。两帧的单点归属见 design §2.1 表的「交出」列（`postSusp` 归建窗档、经 `onCounts` 钩子发；`postSuspEnd` 归出窗档、经 `closeWindow` 发），各自只有一处定义。`turnDone` 同判：由回合档建（体内 `notify?.turnDone?.({ key, agent }) ?? false`），出窗档收装配档注入的同一个函数对象——零第二定义。

### 2.4 验收对照（§1 的 A1–A4）

- **A1 结构**：判据 = 实施后复量（同尺）：`createSuspensionDrive` 跨度 ≤100，且每个拆出单元的工厂跨度 ≤100（单元跨度 = 该工厂函数的跨度，含它自己的头注与体内各块的头注）。量法 = node 行扫描，与 `countContentLines` 同一把尺（`split("\n")` 计行、末行换行不计）。
  - **落点结构（骨干保什么）**：工厂签名与两处必填缝头检 ∥ 五件状态声明 ∥ `timers` 装配（`inWindow` ∥ `windowTake` 接线）∥ 四档创建与一次后绑 ∥ 对外 `return` 对象。搬走带走分隔空行、接线又加回几行，相抵后的实测值才是骨干读数。
  - **回落路径（越线就走这条，不留给下一批）**：骨干复量若越 100 ⇒ 对外面另立第五单元 `thincoder-desktop/src/main/suspension-window-face.mjs` / `createWindowFace`——收装配档交出的对外键与 `pushInput` ∥ `active` ∥ `inputSnapshot` 三件，返回同一对象；`createSuspensionDrive` 退成「装配 + `return createWindowFace({ … })`」，对外面逐字不变（A3 判据不动）。触发顺序 = 先补三问、design §2.1 增一行、本节机读清单补一行，再实施；不触发 ⇒ 不建该档。任一单元越 100 同法在档内再切一单元（同样先补三问与 design 表行）。
- **A2 行为零变化**：判据 = 改面单测档 `node --test docs/batches/2026-11-14-suspension-drive-split.test.mjs` 全绿、零红。断言按「搬动了什么就断言什么」列：① 驻留四出口（`pendingSnapshot` ∥ `reemitDone` ∥ `sweepDigestedStuck` ∥ `injectResidual`）② 回合三径（用户 ∥ 消化 ∥ timer）③ `ev:digest start` 边界帧与留档的同点双动作 ④ 提示面 `turnDone`（两调用点同判）⑤ 取件窗缝 `windowTake` 的受理与唤醒 ⑥ 窗开关收发与残值续发 ⑦ 中止落位（窗 ∥ 续发期两态）。桌面包全量、跨实例集成与全量红绿的读数属 §6 收口面，本段不复制。
- **A3 对外面不变**：判据 = 返回对象键集逐字相等（排序后比 11 键）且形参键集不变；增删一个键即红，名字可直接指出。
- **A4 可复述**：判据 = 四新档各有一段「管什么 ∥ 不管什么」头注，且与 design §2.1 表的四行一一对上；表里有什么、头注里就有什么。

### 2.5 关键决策（含被否方案与试验）

- **采**：四档 + 装配骨干，按概念与可独立验证性切（§1 已定决定，依据 CODE-TIER §3 末句）。
- **被否①「只把无状态块挪到模块级」**：试验 = 逐块量跨度求和，无状态块合计约 70 行，扣掉后骨架仍约 250，越 100 ⇒ 不可行。
- **被否②「单回合与残值续发合成一档」**：试验 = 合并跨度 40 + 43 = 83，加文件头与工厂壳已贴 100 上限；且两者调用时机不同（窗内 ∥ 窗后）、验证面不同 ⇒ 分档。
- **被否③「窗表也搬成独立档」**：试验 = 数读点，置入/摘除只 2 处，读点却有 9 处（`windowTake` ∥ `stepBoundaryPickup` ∥ `pushInput` ∥ `active` ∥ `inputSnapshot` ∥ `size` ∥ `abort` ∥ `abortAll` ∥ `start` 判重）⇒ 搬出要开 9 个读缝，并造出第二个持有者，违反零第二写者。

### 2.6 集成增量（对 `test/RTM.md`）

零行：本批不改任何业务可观察结果，也没有既有用例断言挂起驱动的内部分工；既无新业务场景、也无生产问题驱动新增用例。RTM 只登记仓根 `test/integration/**`，本批验证走批档旁单测。

### 2.7 勘察与先例

- **先例（三族坐标齐全）**：
  - **实现坐标**：`createWindowQueue({ postQueue, prepare, degrade })` ∥ `createSuspensionTimers({ post, runTurn, busyOf, inWindow, takeOver, reloadSlot, windowTake, timer, clear, now })`——两个既有子工厂都吃注入缝、零宿主依赖、平 node 直测。
  - **设计档节坐标**：该形的设计级表述在 `docs/desktop/design/PROJECT.md` §2 的 KD-34（挂起驱动 = 宿主薄胶水、消费核件）∥ KD-40 ⑥（窗队投影面与载体数组）——`window-queue.mjs` 头注把这两条记为单源。
  - **同类先例批次**：`docs/batches/2026-09-29-queue-pickup-edge.md` §2.10（守卫序列出档 ⇒ `suspension-guard.mjs`）∥ `docs/batches/2026-09-29-desktop-susp-queue.md` §2.9 ∥ `docs/batches/2026-09-29-desktop-window-queue-parity.md` §2.9（窗队面出档 ⇒ `window-queue.mjs`）。两批同是本档越档后的出档，切法同源。
  - **与本档头注的关系**：ACTIVITY 头注「最近先例 = `docs/render-core/design/RENDER-CORE.md` 的 subblocks/scroll 与 core suspension；对齐 = 核状态机、宿主薄胶水」答的是**跨端对齐**——渲染核心的子块 ∥ 滚动原语与核挂起状态机界定「谁持状态」；本批四档是那条对齐在桌面端的落形，不新立范式，也不反向改写 RENDER-CORE 侧。
- **三问（八个新名逐个答复）**：
  - 四个档名 ∥ 四个工厂名，查过面 = `thincoder-desktop/src/main/` 全目录文件名 + 相关档导出面（`grep ^export`：`suspension-guard.mjs` 只有 `guardedDeliver` · `suspension-timers.mjs` 只有 `createSuspensionTimers` · `suspensions.mjs` 是 `createGates` 审批门面 · `turn-input.mjs` 是 `createTurnInput({ …, drive, … })` 输入路由 · `queued-input.mjs` 是 `createQueuedInput` 条目形工具）。

| 新名 | 三问答复 |
|---|---|
| `suspension-resident.mjs` / `createResidentFace` | `none found:` 上述查过面无驻留枚举与 `done` 补发面；`existing but unusable:` `suspensions.mjs` 的 `createGates`——它持审批门与裁决，不持驻留条目 |
| `suspension-window-turn.mjs` / `createWindowTurn` | `existing but unusable:` `turn-input.mjs` 的 `createTurnInput({ …, drive, … })`——它是输入路由，`drive` 是它的注入项、不是它持的语义；`queued-input.mjs` 只是条目形工具 |
| `suspension-window-open.mjs` / `createWindowOpen` | `none found:` 上述查过面；`existing but unusable:` `suspension-guard.mjs` 的 `guardedDeliver` 只做占位三件序列 |
| `suspension-window-close.mjs` / `createWindowClose` | `none found:` 上述查过面；`existing but unusable:` `suspension-guard.mjs`——出窗收束含摘窗 ∥ 出窗帧 ∥ 残值续发 ∥ `abort` ∥ `abortAll`，该档只有 `hold` 序列 |

- **三个既有档为何不承载**：`suspension-guard.mjs`（守卫序列）∥ `suspension-timers.mjs`（窗内时效面：timer ∥ 空闲火 ∥ 中止代次，注入 `inWindow` ∥ `windowTake` 读窗表）∥ `window-queue.mjs`（窗队投影与六帧，操作 `entry.pending` 但不持有）各持**另一个概念面**；把驻留 ∥ 回合 ∥ 建窗 ∥ 出窗塞进去，等于让它们同时持窗表与驻留条目，正撞零第二写者。
- **公开源档（本段自记）**：已查 `../.thincoder`（只有 `memory/` ∥ `tmp/` ∥ 两份 checklist，无设计档面）与 `../thincoder.com/docs`（全量搜 `suspension` ∥ `挂起` ∥ `Suspension`，零命中）⇒ 无相关，本设计不取外部来源。库外断言 = 零（§1「勘察」）。
- **设计档现状**：`docs/desktop/design/ACTIVITY.md` 原 §2 只有三段机制句、无内部分工描述 ⇒ 本批新增 §2.1–§2.3。

### 2.8 上抛项

无。实施若撞见必须改 `suspension-timers.mjs` ∥ `window-queue.mjs` ∥ `suspension-guard.mjs` 的行为 ⇒ 停下上抛（design §2.3）。

**受影响文件（机读清单）**

```text
| 档 | 分拆方案 | 行数 |
|---|---|---|
| thincoder-desktop/src/main/suspension-drive.mjs | — | 358 |
| thincoder-desktop/src/main/suspension-resident.mjs | — | 新 |
| thincoder-desktop/src/main/suspension-window-turn.mjs | — | 新 |
| thincoder-desktop/src/main/suspension-window-open.mjs | — | 新 |
| thincoder-desktop/src/main/suspension-window-close.mjs | — | 新 |
| docs/batches/2026-11-14-suspension-drive-split.test.mjs | — | 新 |
```

### 2.9 实施后设计档收正（§1 派单八条 · 逐条落点）

| # | 面 | 落点与形 |
|---|---|---|
| 1 | `latches` 无定义 | design §2.2 新增一条：`latches` = `{ resuming, abortTombstones }` 打成一包，只注入出窗档，并列出它读写这五处的方法（`resuming.has` ∥ `resuming.delete` ∥ `abortTombstones.add` ∥ `abortTombstones.has` ∥ `abortTombstones.delete`）；design §2.1 表 close 行「交出」列点明「两族闩件的唯一写点」并指回 §2.2 |
| 2 | §4 形参名单缺项 | design §2.3 拆成两条：返回键 11 键逐名、形参键 13 键逐名（`post` ∥ `runTurn` ∥ `reloadSlot` ∥ `notify` ∥ `busyOf` ∥ `takeOver` ∥ `postQueue` ∥ `prepare` ∥ `degrade` ∥ `hold` ∥ `timer` ∥ `clear` ∥ `now`）；§4 的「键名见 §2.3」两半都在该节，指路可解 |
| 3 | `hooks` 概述与盘上相反 | design §2 首段改为：`hooks` 只装 `onCounts` ∥ `reclaim` ∥ `freezeAll` 三枚；`inputQueue` ∥ `abortSignal` ∥ `runTurn` ∥ `takeInput` ∥ `injectResidual` ∥ `timerFace` 是同级选项不在 `hooks`；`hooks.onDigest` 为备用面、本档不注册（零双帧） |
| 4 | 记录族三名无指路 | design §2.2 新增 `entry` ∥ `controller` ∥ `handle` 三条「是什么、谁建、谁读」；§2 旧句里的「人读线」∥「当前记录族」∥「活流优先规则」三名在 `docs/` 全量 grep 零命中（无拥有该规则的档）⇒ 按 §1 的可选处置「补指路或删句」删句 |
| 5 | A1 设计时读数不可复算 | 本档 §2.4 删两条估算（65 ∥ 69 ∥ 50 ∥ 76 = 260 与「实搬 246」「骨干 76 = …」全部分解），只留判据（实施后复量 ≤100）+ 落点结构 + 回落路径；实施后读数在 §5.3 |
| 6 | 建窗档死缝 `queue` | design §2.1 表 open 行工厂签名去掉 `queue`，表下补一句它为何不在缝上（`queue.clear` 住出窗档、本档零读点）；design §2.2 建窗档必填清单注明「签名另收一个零读点的 `queue`」——盘上构造期校验仍在，设计不谎报 |
| 7 | 「零适配器」与后绑转发件相抵 | design §2.2 `onRestart` 条改成实际形：装配档注入的是读后绑绑定的转发件 `(key, agent, opts) => late.restart(key, agent, opts)`，实参逐字透传不改形；`onExit` 同形成对写出 |
| 8 | 必填缝与可选缝相抵 | design §2.2 缝条拆两条：必填逐档列出（驻留 1 ∥ 回合 5 ∥ 建窗 6 ∥ 出窗 9）、可选 = 缺省即零动作的策略面（`notify` ∥ `reloadSlot` ∥ `hold`）；装配档对外面 13 键里 `post` ∥ `runTurn` 必填、其余十一项带缺省 |

判据 = `doc_check` gate PASS（`docs/desktop/design/ACTIVITY.md`，本轮改面区域）· 八条逐条对盘上四档源文核过（`suspension-drive.mjs` ∥ `suspension-window-open.mjs` ∥ `suspension-window-turn.mjs` ∥ `suspension-window-close.mjs` ∥ `suspension-resident.mjs`）· 不碰代码。

## §3 设计评审（评审子代理）
**状态行**：评审通过



### 轮次 1（评审子代理）

本轮 = 设计评审（`docs/desktop/design/ACTIVITY.md` §2.1–§2.3 + 本档 §2）。已实读 ACTIVITY.md 全文、本档 §1–§2、拆分目标档 `thincoder-desktop/src/main/suspension-drive.mjs`、`thincoder-desktop/test/run.mjs`、`test/RTM.md`、`docs/core/standards/CODE-TIER.md` 与 METHODOLOGY.md。

| # | 严重度 | 状态 | 证据（指针） |
|---|---|---|---|
| 1 | 🔴 | 未处置 | §2.4 A2「桌面 `node test/run.mjs` 14 例全绿 · 跨实例集成 2 例（`46-1` ∥ `46-2`）全绿」——全量跑与集成半写进实施轮验收；`thincoder-desktop/test/run.mjs` 头注「清单 ↔ 盘上两向自检 + `node --test` 派发」= 该包全量跑；同形先例 `2026-11-06-vsc-test-face` 轮次 1 #3 判 🔴 |
| 2 | 🔴 | 未处置 | ACTIVITY §2.1 出窗档工厂 `createWindowClose({ post, windows, timers, queue, resident, runTurn, hold, latches, onRestart })` 无 `turnDone` ∥ `notify`，而 `resumeResidual` 体内调 `turnDone(entry.key, entry.agent)`；窗内回合档工厂无 `notify`，而 `turnDone` 体 = `notify?.turnDone?.({ key, agent }) ?? false`；§2.2「新档的注入缝不带缺省值：缺项在边界抛错并点名该参数」⇒ 照表实施即构造期抛错，或残值径静默丢档① |
| 3 | 🟡 | 建议补 | ACTIVITY §2.1 表只列各档注入缝，不列各档交出的对外键；`resident(agent)` 读面被 `freezeAll` 钩与 `abort` 取自 `entry.frozen ?? resident(agent)`，而驻留档行只点四个出口 |
| 4 | 🟡 | 建议补 | ACTIVITY §2.1 驻留档行「不判何时补发（时机在装配档与核件钩子）」与 `driveTurn` 起跑支内 `reemitDone(key, pendingSnapshot(agent))` 不符；同档 §2「起跑时对本轮驻留补发 done」也未点归属 |
| 5 | 🟡 | 建议补 | §2.7 先例只给实现坐标（`createWindowQueue` ∥ `createSuspensionTimers`）+ 对齐句，无设计档节坐标、无先例批次；ACTIVITY 头注的最近先例（`docs/render-core/design/RENDER-CORE.md` 的 subblocks/scroll）在 §2 无对应句 |
| 6 | 🟡 | 建议补 | §2.7「库外：B 类，见 §1「勘察」」→ §1 只答「外部断言 = 零」，未记公开源档（含独立档仓）查了什么、有无相关；同形先例 `2026-11-14-tiny-window-cap` §3 #6 |
| 7 | 🟡 | 建议补 | 四个新档名/工厂名（`suspension-resident` ∥ `suspension-window-turn` ∥ `suspension-window-open` ∥ `suspension-window-close`、`createResidentFace` ∥ `createWindowTurn` ∥ `createWindowOpen` ∥ `createWindowClose`）无三问答复（`existing:` ∥ `none found:` ∥ `existing but unusable:`） |
| 8 | 🟡 | 建议补 | §2.4 A2 的行为形断言只点四项（对外键集 ∥ 窗开关收发 ∥ 残值续发 ∥ 中止落位），未含被搬的起跑补发 ∥ 自愈扫读 ∥ digest 边界帧与留档 ∥ 提示面 ∥ 取件窗缝，而 A2 的回归半正是被 #1 移出去的那套 |
| 9 | 🔵 | 备注 | §2.2「缺项在边界抛错并点名该参数」未给场景（F2-7）；同档头注已有 `post required (out-bound channel)` 头检可援引 |
| 10 | 🔵 | 备注 | ACTIVITY §2.1「为什么这样切」引 CODE-TIER §3 的数值「≥300 行」；数值归属 = CODE-TIER §4 |

已实读核对、成立的（不进结论表）：

- 档位：`thincoder-desktop/src/main/suspension-drive.mjs` 实量 358 内容行（与 §2 机读清单「358」相符），≤500 ⇒ 文件档不触发拆分方案列（列内 `—` 符合模板）；四个新档不在盘上，行数列 `新` 成立。
- 函数档：`createSuspensionDrive` 跨度 ≥300 ⇒ 必须拆；§2.3（拆法）+ §2.4 A1（分块跨度 65 ∥ 65 ∥ 37 ∥ 81，骨干余 74）给出了正向方案与本批落步，未推给下一批。
- A3 可判：ACTIVITY §2.3 的 11 键与盘上返回对象 11 键逐名相同（`start` ∥ `turnDone` ∥ `stepBoundaryPickup` ∥ `pushInput` ∥ `active` ∥ `inputSnapshot` ∥ `abort` ∥ `abortAll` ∥ `armInbox` ∥ `size` ∥ `timerLatches`），增删可立刻指出。
- §2.2「五件状态」「`entry.pending` 五处同数组」与盘上一致（`windows` ∥ `resuming` ∥ `abortTombstones` ∥ `queue` ∥ `timers`；受理 ∥ 取项 ∥ 消费 ∥ 倾出 ∥ 清队）。
- 集成增量：§2.6 用的是唯一成立的零行理由（不改任何业务可观察结果、无生产问题驱动新增用例），且引 `test/RTM.md` 的登记面为证；RTM 现只有 `Desktop 12` 一条 Desktop 故事，无挂起驱动相关在用例。
- 设计档无一次性施工账：ACTIVITY 不含行数读数、不含受影响文件表、无行号锚（引 `suspension-timers.mjs` ∥ `window-queue.mjs` ∥ `suspension-guard.mjs` 均为文件名，非行号）。

VERDICT: changes-required
计数：🔴 2 · 🟡 6 · 🔵 2。

### 轮次 2（评审子代理）

本轮 = 设计评审（`docs/desktop/design/ACTIVITY.md` §2.1–§4 + 本档 §2）。已实读 ACTIVITY.md 全文、本档 §1–§2、拆分目标档 `thincoder-desktop/src/main/suspension-drive.mjs`（358 内容行，与 §2 机读清单一致），并按最接近先例核了批旁单测档的落位（`docs/batches/` 下已有三份 `.test.mjs`，A2 的测法面形制成立）。

| # | 严重度 | 状态 | 证据（指针） |
|---|---|---|---|
| 1 | 🔴 | 未处置 | ACTIVITY §2.1 窗内回合档行 `createWindowTurn({ post, notify, runTurn, reloadSlot, hold, queue, resident })` 无 `windows`，而该行「交出」列含 `windowTake` ∥ `stepBoundaryPickup`；源文 `windowTake` 体「const entry = windows.get(key)」、`stepBoundaryPickup` 体同句 ⇒ 照表实施即构造期抛错（§2.2「缺项在边界抛错并点名该参数」）或读面悬空。同形 = 轮次 1 #2（缺缝），修面后仍余这一处 |
| 2 | 🔴 | 未处置 | §2.4 A1「⇒ 骨架余 74，加接线约 86；四个工厂均 ≤100」与同条判据「骨干 ≤100」不相容：86 未归属——落骨干 ⇒ 约 160 越线；摊入四单元 ⇒ 出窗收束 81 + 约 22 越线。骨干还须承载 `pushInput` ∥ `active` ∥ `inputSnapshot` ∥ `armInbox` ∥ 两个读数出口与四个工厂的注入分配 ⇒ A1 在读法两种情形下都无达成路径，且未给回落方案（第五单元 ∥ 对外面出档） |
| 3 | 🟡 | 建议补 | 跨档交接实参未定：盘上 `closeWindow` 吃闭包内 `entry` ∥ `controller` ∥ `agent`，`resumeResidual(entry)` 同；出档后 ACTIVITY §2.1 与 §2.3 第 1 条只写「建窗档需 `onExit = closeWindow`」，未点名 `onExit` ∥ `onRestart` 收什么实参、`entry` 由谁传 |
| 4 | 🟡 | 建议补 | 帧单点归属只住批档 §2.3 第 3 条（「`postSusp` 留建窗档（`onCounts` 钩子单点）、`postSuspEnd` 留出窗档（出窗帧单点）」）；ACTIVITY §2.1 表「交出」列不含这两帧 ⇒ 收口后该当前机制事实随批档消失，设计档读者无法判定两帧定义点 |

已实读核对、成立的（不进结论表）：

- 轮次 1 的十条处置均已落面：A2 改指批旁单测档（`§2.4` A2「`node --test docs/batches/2026-11-14-suspension-drive-split.test.mjs` 全绿、零红」），桌面全量 ∥ 跨实例 ∥ 217 例读数移入 §6 面；`notify` ∥ `turnDone` 已入表并点明两调用点（ACTIVITY §2.1 表下那段「它有两个调用点」）；「交出」列、驻留档三落点、`§2.7` 三段坐标与公开源档一行、八个新名的三问表、A2 七项断言清单、`post required (out-bound channel)` 依据、CODE-TIER 数值不复制，逐条对上。
- 档位：`thincoder-desktop/src/main/suspension-drive.mjs` 实测 358 内容行 ≤500 ⇒ 不触发拆分方案列；四个新档与批旁单测档行数列 `新`，符合 CODE-TIER §2.2 快照无此档的写法。
- 函数档该拆且本批内落：`createSuspensionDrive` 跨度越 CODE-TIER §3 的「必须拆」线，§2.3 给了拆法、§2.4 A1 给了落步，未推给下一批。
- A3 可判：ACTIVITY §2.3 的 11 键与盘上 `return { ... }` 11 键逐名相同（`start` ∥ `turnDone` ∥ `stepBoundaryPickup` ∥ `pushInput` ∥ `active` ∥ `inputSnapshot` ∥ `abort` ∥ `abortAll` ∥ `armInbox` ∥ `size` ∥ `timerLatches`）；形参面 13 键以代码为基线，增删可立刻指出。
- 出窗档 ∥ 建窗档 ∥ 驻留档的注入缝逐一对着源文核过：`closeWindow` ∥ `resumeResidual` ∥ `abort` ∥ `abortAll` 所需的 `windows` ∥ `timers` ∥ `queue` ∥ `resident` ∥ `runTurn` ∥ `turnDone` ∥ `hold` ∥ 两族闩 ∥ `onRestart` 齐；`start` 所需的缝经 `turn` 整体注入亦齐；驻留档只需 `post`。
- 设计档无一次性施工账：ACTIVITY 无行数读数、无受影响文件表、无验收行、无行号锚（引 `suspension-timers.mjs` ∥ `window-queue.mjs` ∥ `suspension-guard.mjs` 均为档名）。
- 集成增量：§2.6 用唯一成立的零行理由（不改任何业务可观察结果、无生产问题驱动新增用例），RTM 无挂起驱动相关在用例。

VERDICT: changes-required
计数：🔴 2 · 🟡 2 · 🔵 0。

### 轮次 3（评审子代理）

本轮 = 设计评审第 3 轮（`docs/desktop/design/ACTIVITY.md` §2.1–§4 + 本档 §2）。已实读 ACTIVITY.md 全文、本档 §1–§2、拆分目标档 `thincoder-desktop/src/main/suspension-drive.mjs`（与 §2 机读清单「358」相符）、`suspension-guard.mjs`。

**第 2 轮四条处置逐条核过（均落面）**

- #1 `createWindowTurn` 形参已补 `windows`，同行写明「窗表只读——`windowTake` ∥ `stepBoundaryPickup` 各一处 `windows.get(key)`」。按源文逐档复核四档注入缝，**无第二处缺缝**：`createResidentFace({ post })` 齐（`panelLive` ∥ 动态 import 均模块面）；`createWindowTurn` 八缝齐；`createWindowOpen` 七缝齐，且 `onCounts` 是 `start` 内登记的钩子、不是构造缝（故不计缺口）；`createWindowClose` 十缝齐（`entry` 经 `onExit` 传入，`latches` 承载 `resuming` ∥ `abortTombstones`）。
- #2 A1 判据已改为「实施后复量 ≤100」并给出回落路径（第五单元 `suspension-window-face.mjs` / `createWindowFace`）与触发顺序；旧「骨架余 74，加接线约 86」的越线估算已删。
- #3 ACTIVITY §2.2 已写死两侧实参形：`onExit(entry, failure)`（`entry` 由 `start` 传、`controller` 在 `entry.controller`、调用点 = `handle.done` 两回调）∥ `onRestart(key, agent, { cwd })`（与 `start` 形参同形、按 `entry.key` ∥ `entry.agent` ∥ `entry.cwd` 传）。
- #4 两帧单点归属已入 §2.1 表「交出」列：`postSusp` 归建窗档经 `onCounts` 钩子、`postSuspEnd` 归出窗档经 `closeWindow`。

**本轮结论表**

| # | 严重度 | 状态 | 证据（指针） |
|---|---|---|---|
| 1 | 🟡 | 建议补 | §2.1 出窗档工厂 `createWindowClose({ post, windows, timers, queue, resident, runTurn, turnDone, hold, latches, onRestart })` 的 `latches` 全档无定义：§2.2 五件状态列的是 `resuming` ∥ `abortTombstones` 两个名字，未说 `latches` 即这两族；源文 `abort` 读 `resuming.has` ∥ 写 `abortTombstones.add`、`resumeResidual` 读 `abortTombstones.has` ⇒ 照 ACTIVITY 实施读不出该缝内容，映射只住本档 §2.3 第 2 条 |
| 2 | 🟡 | 建议补 | §4「`createSuspensionDrive` 的形参键集与返回键集逐字不变（键名见 §2.3）」——§2.3 括号只列 11 个返回键（`start` ∥ `turnDone` ∥ … ∥ `timerLatches`），**形参键集在 ACTIVITY 全档无名单**（源文工厂形参 `reloadSlot` ∥ `notify` ∥ `busyOf` ∥ `takeOver` ∥ `postQueue` ∥ `prepare` ∥ `degrade` ∥ `hold` ∥ `timer` ∥ `clear` ∥ `now` 等）；§4 把核查指到 §2.3，而那半不在那里，收口后读者无处判定增删 |
| 3 | 🟡 | 建议补 | §2 首段「hooks 负责计数、digest、reclaim、冻结和输入」与源文钩子集不符：`startSuspension` 的 `hooks` 只装 `onCounts` ∥ `reclaim` ∥ `freezeAll` 三枚；`inputQueue` ∥ `takeInput` 是同级选项不在 `hooks`；源文头注「核件 `hooks.onDigest` 为**备用面**…本档不注册该钩 —— **零双帧**」⇒ 照此句实施会多注册一枚 digest 钩 = 多帧 = 破「行为零变化」。同档 §2.1 表三处钩子口径是对的，只这一句松散 |
| 4 | 🟡 | 建议补 | §2「digest 与 subagent 快照写人读线，record:append 只承载当前记录族；historyWindow records opt-in 重建，未结轮按活流优先规则」——「当前记录族」「活流优先规则」无定义、无指向拥有该规则的档，读者无法据此判对错 |
| 5 | 🔵 | 备注 | §2.4 A1 设计时读数不可复核：「四档语料跨度 = 驻留面 65 ∥ 回合面 69 ∥ 建窗 50 ∥ 出窗收束 76」四项相加 260，同句「去重后实搬 246」的 14 无处对账（括号已声明该 14 「归出窗档、只计一次」）；且「76 = 工厂壳 11 ∥ `timers` 装配 8 ∥ 对外 `return` 块 38 ∥ 函数闭括号 1 ∥ 分隔空行 18」未含同条「落点结构」列出的「四档创建与一次后绑」。A1 的判据是实施后复量、且有回落路径，故不阻塞 |
| 6 | 🔵 | 备注 | §2.1 建窗档工厂注入 `queue`，而源文 `start` 体内零 `queue` 引用（`queue.clear` 在 `closeWindow`，已归出窗档）⇒ 该缝为死缝；§2.2「新档的注入缝不带缺省值：缺项在边界抛错」会把死缝做成硬契约 |

**已实读核对、成立的（不进结论表）**

- 档位：`thincoder-desktop/src/main/suspension-drive.mjs` 358 内容行 ≤500（与机读清单「358」相符）⇒ 文件档不触发；函数档 `createSuspensionDrive` 越「≥300 必须拆」⇒ §2.3 拆法 + §2.4 A1 落步，未推给下一批；四个新档与批旁单测档行数列 `新`，合 CODE-TIER §2.2 无快照写法。
- A3 可判：ACTIVITY §2.3 的 11 键与源文 `return { … }` 11 键逐名相同（`start` ∥ `turnDone` ∥ `stepBoundaryPickup` ∥ `pushInput` ∥ `active` ∥ `inputSnapshot` ∥ `abort` ∥ `abortAll` ∥ `armInbox` ∥ `size` ∥ `timerLatches`）。
- §2.2 状态归属与源文一致：五件状态齐（`windows` ∥ `resuming` ∥ `abortTombstones` ∥ `queue` ∥ `timers`）；窗表写点实为两处（`start` 置入 ∥ `closeWindow` 摘除）；`entry.pending` 五处同数组（受理 ∥ 取项 ∥ 消费 ∥ 倾出 ∥ 清队）。
- §2.2「缺项在边界抛错」所援引的两句实存：`post required (out-bound channel)` ∥ `runTurn required (single-turn face)`；既有可选缝（`hold` ∥ `notify` ∥ `reloadSlot` 缺省 null）经 `guardedDeliver` 的「缺省 ∥ 非函数 ⇒ 零占位径」与可选链仍走零动作径 ⇒ 必填缝只锁「实参在场」，不改变缺省语义（故不入结论表）。
- §2.1 三处 `reemitDone` 落点 + 自愈扫读与源文对位（`driveTurn` 起跑支 ∥ `reclaim` ∥ `freezeAll` ∥ `sweepDigestedStuck`）；`turnDone` 单定义在回合档、出窗档只收同一函数对象，与源文 `turnDone` 唯一 `function` 声明相符。
- 集成增量：§2.6 用唯一成立的零行理由（不改任何业务可观察结果、无生产问题驱动新增用例），与 RTM 无挂起驱动在用例一致。
- 设计档无一次性施工账：ACTIVITY 无行数读数、无受影响文件表、无行号锚；§2.7 三族先例坐标、公开源档一行、八个新名三问（含三个既有档为何不承载）齐全。

VERDICT: pass
计数：🔴 0 · 🟡 4 · 🔵 2。

## §4 用户批准（主 agent）

用户批准 = 「**开**」（2026-11-14，对应 §1 所记的自动跑完授权）。

批准面：本批做什么（`createSuspensionDrive` 拆分）+ §2 的 A1–A4 四条判据 + 台账 `#2418`。
未另设确认点：用户已给全链授权，设计评审通过即进实施，中间不逐条回问。

## §5 实施记录（eng-coder）
**状态行**：实施完成 2026-11-14（A1–A4 全绿 · 改面单测 9/9 · 桌面包 14/14 · 审计 1 轮 + 代码评审 1 轮终态 clean · 设计档六条待办已转设计席）



### 5.1 交付摘要

`createSuspensionDrive` 由单函数（批起 358 行档内一个跨度 322 的函数）拆成「装配骨干 + 四语义档」，**行为零变化**、对外面 11 键逐字不变、形参 13 键逐字不变。

落盘五档 + 批旁单测一档：

- `thincoder-desktop/src/main/suspension-drive.mjs` — 只做装配：五件状态、注入缝分配、四档创建与一次后绑、对外面 `return` 块。
- `thincoder-desktop/src/main/suspension-resident.mjs` / `createResidentFace({ post })` — 驻留读面与四出口（`pendingSnapshot` ∥ `reemitDone` ∥ `sweepDigestedStuck` ∥ `injectResidual`）。
- `thincoder-desktop/src/main/suspension-window-turn.mjs` / `createWindowTurn({ … })` — 窗内输入与回合（`windowTake` ∥ `takeQueuedInput` ∥ `driveTurn` ∥ `stepBoundaryPickup` ∥ `turnDone`）。
- `thincoder-desktop/src/main/suspension-window-open.mjs` / `createWindowOpen({ … })` — 建窗入口 `start` + 计数帧 `postSusp` 单点。
- `thincoder-desktop/src/main/suspension-window-close.mjs` / `createWindowClose({ … })` — 出窗收束（`closeWindow` ∥ `resumeResidual` ∥ `abort` ∥ `abortAll`）+ 出窗帧 `postSuspEnd` 单点。
- `docs/batches/2026-11-14-suspension-drive-split.test.mjs` — 改面单测档，收口删除。

### 5.2 验收对照（§2.4 A1–A4）

| 判据 | 结果 | 判据落在哪 |
|---|---|---|
| A1 结构（骨干 ∥ 每单元 ≤100） | ✅ | 读数见 5.3；骨干 61、四档 77 ∥ 86 ∥ 52 ∥ 100 |
| A2 行为零变化（改面单测全绿零红） | ✅ | `node --test docs/batches/2026-11-14-suspension-drive-split.test.mjs` → 9 例全绿；红侧见 5.8 |
| A3 对外面不变 | ✅ | 与批起快照模块在运行期比键集：11 键逐字相同；形参面 13 键逐字相同（签名行与快照逐字符串相等） |
| A4 可复述（四段头注对 §2.1 四行） | ✅ | 四档头注各含「管什么 ∥ 不管什么」，交出列与 design §2.1 逐行对位 |

**A4 逐档对位**（读者可翻开两处逐行比）：驻留档头注五件 = 表行四出口 + 读面 `resident(agent)`；回合档头注五件 = 表行五件；建窗档「不管什么」写着出窗结算交 `onExit`、不续发残值；出窗档「不管什么」写着不建窗（重启经 `onRestart`）、不自建提示面。

### 5.3 改面读数

量法 = `countContentLines`（`split("\n")` 计行、末行换行不计）。「跨度」= 该工厂**自己的头注首行**到闭括号（§2.4 A1 的「含它自己的头注」按此读；两种读法我都量了，均 ≤100）。

| 档 | 批起快照 | 改后档 | 工厂跨度 | 含头注 |
|---|---|---:|---:|---:|
| `suspension-drive.mjs`（`createSuspensionDrive`） | 358 | 83 | 57 | 61 |
| `suspension-resident.mjs`（`createResidentFace`） | 新 | 93 | 75 | 77 |
| `suspension-window-turn.mjs`（`createWindowTurn`） | 新 | 106 | 81 | 86 |
| `suspension-window-open.mjs`（`createWindowOpen`） | 新 | 66 | 47 | 52 |
| `suspension-window-close.mjs`（`createWindowClose`） | 新 | 117 | 97 | 100 |
| `…-suspension-drive-split.test.mjs`（单测档） | 新 | 413 | — | — |

出窗档的头注含跨度**正好 100，余量 0**：这是评审 🔵 #6 的记录，不是缺陷（判据是 ≤100）。下一次动该档的批按 CODE-TIER §3「≥100 主动审视」先审视是否再出档。

**清单外四个档的批起快照读数**（CODE-TIER §2.2 义务；四档都是注释级重指，改前改后行数相等）：

| 档 | 批起快照 | 改后 | 改了什么 |
|---|---:|---:|---|
| `window-queue.mjs` | 117 | 117 | 弃件链尾帧的落点指针 `resumeResidual` → `suspension-window-close.mjs` |
| `turn-face.mjs` | 209 | 209 | 两处 `boundary` 判据指针 → `suspension-window-turn.mjs` |
| `agent-host.mjs` | 344 | 344 | 「挂起驱动档」限定为「装配档 + 四语义档」 |
| `renderer/subagent-reduce.mjs` | 264 | 264 | 出窗帧定义点指针 `postSuspEnd` → `suspension-window-close.mjs` |

### 5.4 清单外改动（逐条给理由）

四个档、每个 1–2 行，**全部是注释重指，零代码、零行为**：

1. `thincoder-desktop/src/main/window-queue.mjs` — 理由：`resumeResidual` 已搬进出窗档，该头注原写「均住 `suspension-drive.mjs` `resumeResidual`」变成悬空指针；只改那一句的落点。边界内（不动行为、只读既有面）。
2. `thincoder-desktop/src/main/turn-face.mjs` — 理由：同上，两处引用「沿 `suspension-drive.mjs` `boundary` 同判」，而 `boundary` 现在住回合档；只改落点。
3. `thincoder-desktop/src/main/agent-host.mjs` — 理由：头注写「闩 ∥ 三武装点 ∥ 窗内 `timerFace` 装配住挂起驱动档」，三武装点已分住建窗档与出窗档；改成「装配档 + 四语义档」，句子仍真。
4. `thincoder-desktop/renderer/subagent-reduce.mjs` — 理由：出窗帧 `postSuspEnd` 的单点定义已搬到出窗档，渲染面那一句指针随之改。此条由代码评审第 1 轮指出——我原只扫了 `src/main/`，漏了 renderer 面。

**派单口径一行（用户 2026-11-14 裁）**：本席 `files` 声明里写的是 `suspension-window-resident.mjs`，**实落 `suspension-resident.mjs`**——设计档 §2.1 表与 §2 机读清单两处一致写后者，`files` 是调度通道、名字写错了，不是机读清单缺一档。按用户裁决不改名、也不按「清单外文件」记。

### 5.5 决定披露表

| # | 决定 | 依据 ∥ 造价 |
|---|---|---|
| 1 | 建窗档按 §2.1 表保留 `queue` 注入缝，体内零读点 | 设计表照写，不自行删设计面契约；造价 = 一个必填但未用的缝。已在工厂头注明写「本档体内零读点——`queue.clear` 住出窗档」避免下一个读者当 bug 修。评审 🔵 #6 同点，缝留删由设计席裁 |
| 2 | `onExit` ∥ `onRestart` 各经一条转发件读同一可变绑定 | §2.3 第 1 条要求两个方向都后绑；转发件是被后绑机械逼出来的形状，实参逐字透传、无适配。落地核对见 5.7 |
| 3 | 必填缝构造期抛错并点名参数；`notify` ∥ `reloadSlot` ∥ `hold` 沿对外面既有 `null` 缺省 | §2.2「缺项在边界抛错」+「装配档对外的既有缺省维持原样」两句同时成立；后者缺省即零动作，与源文一致 |
| 4 | 残值续发按核件取项**合并批**（两条并作一个普通回合） | 源文行为，非本批引入；我起初把单测断言写成「两条各起一回合」，实测红了才按真实形态改断言。读数落 5.8 |
| 5 | 单测的 `turnDone` 身份判据用「注入件必抛」而非对象相等 | 对象身份不可从外观察；换成必抛件后只有「确实调用交出的那一枚」才会出 `residual turn failed`，重建一份即沉默 |

### 5.6 审计与评审轮次（终态 = clean）

**内部歧离审计（只读 `explore`）1 轮**：报 1🟡 / 4🔵。处置：

- 🟡 = 出窗档「含头注」跨度 101 越 100 ⇒ 当轮压缩工厂头注两行并掉一行，复量 100。
- 🔵 之一 = 单测的 `turnDone` 只断言注入件被调、未断言「是回合档那一枚」⇒ 改为必抛件判据（见 5.5 第 5 条）。
- 🔵 之二 = 旧档头「`hooks.onDigest` 为备用面 ∥ 本档不注册该钩 ⇒ 零双帧」这条约束在我重写文件头时失去落点 ⇒ 补进建窗档 `hooks` 块上方两行。
- 🔵 之三 = 三档清单外改动未在任何记录行 ⇒ 本段即落（5.3 ∥ 5.4）。
- 🔵 之四 = 设计 §2.2 措辞比代码宽 ⇒ 记入 5.7 落地核对待收口裁决。

**独立代码评审（`advisor` type=code）1 轮**：`VERDICT: pass`，🔴 0 · 🟡 5 · 🔵 4。逐条处置：

| 评审 # | 严重度 | 处置 |
|---|---|---|
| 1 | 🟡 三个清单外档缺 CODE-TIER §2.2 快照读数 | **当轮落面**：5.3 末表给四档批起 ∥ 改后读数 |
| 2 | 🟡 `renderer/subagent-reduce.mjs` 仍有 `postSuspEnd` 悬空指针 | **当轮修**：只改该句落点（5.4 第 4 条） |
| 3 | 🟡 A3 的「形参键集不变」无任何可执行判据 | **当轮补**：单测 A3 用例加一条从声明面直取 13 形参名的断言，增删改名即红 |
| 4 | 🟡 A1 的实施后读数还没有落点 | **本段即落**（5.3），含跨度起点口径 |
| 5 | 🟡 设计评审第 3 轮判 Deferred 的六条（`latches` 无定义 ∥ §4 形参名单缺 ∥ §2 首段 hooks 概述不符 ∥ 记录族三名无指路 ∥ A1 设计时读数不可复算 ∥ 建窗档死缝） | **转设计席**：非本席写面，已在本节留存待办清单，§6 收口前须有闭环记录 |
| 6 | 🔵 出窗档含头注跨度正好 100、余量 0 | 不改，记录在 5.3 |
| 7 | 🔵 驻留档头注「时机三落点住别的档」与同括号内「本档自愈扫读」自相矛盾 | **当轮修**：改成「三处由别的档触发，本档只做自愈扫读自己的触发面」 |
| 8 | 🔵 设计 §2.2「零适配器」∥「注入缝不带缺省值」两句比代码宽 | **转设计席**（同 #5 的口径），本席在 5.7 落一行 |
| 9 | 🔵 单测 `until()` 的 400 拍轮询依赖核件链收口 | **当轮注**：头注写明单位是宏任务拍、非毫秒，红时读成超时 |

**终态 = `clean`**：我写面上的 5 条（#1 ∥ #2 ∥ #3 ∥ #4 ∥ #7 ∥ #9）当轮全部落面并复跑；#5 ∥ #8 是设计档句子，属设计席的笔，已具名转出并在本段留清单，不留在「以为有人处理」的状态。

### 5.7 落地核对

**设计档 §2.2 有一句被本次落形读作不严格**（`docs/desktop/design/ACTIVITY.md` §2.2）：「`onRestart(key, agent, { cwd })`：与 `start` 形参逐字同形，装配档把建窗档交出的 `start` 原样注入，零适配器」。

盘上实际：`onRestart: (key, agent, opts) => late.restart(key, agent, opts)` 与对称的 `onExit: (entry, failure) => late.exit(entry, failure)`，两条绑定在四档建齐后各赋一次。实参逐字透传、无改造，但「注入的函件」确是转发件而非 `start` 本身。

归属二选一交收口裁：① 代码错（改为直传）——不可行，§2.3 第 1 条把两个方向都定成后绑，直传会读未绑状态；② 目标移动（§2.2 该句补一句「经后绑转发件调用，实参不改形」）。

另：§2.1 建窗档行把 `queue` 列为注入缝而 `start` 体内零读点——这是设计面既有口径，本席照写，不构成落地漂移（评审 🔵 #6 已记，缝留删归设计席）。

### 5.8 验证与测试面

**改面单测（A2 的判据面）**：`node --test docs/batches/2026-11-14-suspension-drive-split.test.mjs` → `tests 9 · pass 9 · fail 0`。

断言面按 §2.4 A2 七项逐条：

- ① 驻留四出口 + 读面（含 consult 子块展开、三形零动作）
- ② 回合三径（用户 ∥ 消化 ∥ timer，含 `reloadSlot` 的正反两支）
- ③ `ev:digest start` 边界帧与留档同点双动作（经装配骨干）
- ④ 提示面 `turnDone`（两调用点 + 身份判据）
- ⑤ 取件窗缝受理与唤醒
- ⑥ 窗开关收发 + 残值续发
- ⑦ 中止落位（窗 ∥ 续发期墓碑）

外加拿 A3 两条判据（11 键 ∥ 13 形参）。

**红侧（尺子能红，不是恒绿）**：连做两次定向变异并复跑，两处都精确变红后才回退。

- 变异一：回合档把 `if (!timerTurn) reloadSlot?.(…)` 改成 `if (timerTurn)` ⇒ ② 的 timer 支断言红。
- 变异二：驻留档把 `pendingSnapshot` 的浅拷改成返回原数组 ⇒ ① 红（`snapshot must be a copy`）。
- 读数：变异态 `pass 7 · fail 2`；回退后 `pass 9 · fail 0`。

**桌面包全量（本席实跑，供 §6 对照）**：`thincoder-desktop` 下 `node test/run.mjs` → `tests 14 · pass 14 · fail 0`。

**集成面**：**本席不跑集成测试** —— 仓根 `test/RTM.md` 的收口运行是父侧的唯一一次。本批 §2.6 的 RTM 增量 = 零行（不改任何业务可观察结果、无生产问题驱动新增用例），本席未新增 ∥ 未改写任何集成用例。跨实例 `46-1` ∥ `46-2` 与全量 217 例红绿属 §6 读数面，本段不复制。

**单测档去向**：`docs/batches/2026-11-14-suspension-drive-split.test.mjs` 是批旁一次性档，收口时删除，仓内不留可执行件（本段即它的验证读数）。

**两个未由本席核过的面（诚实标注）**：

- 拆分前档的逐行 diff —— 我没有可用 git 工具，行为等价是按「设计 §2.1–§2.3 逐块对位 + 每个被搬符号只留一处定义 + 七项断言」判的，不是逐行比对。
- 上面两组读数是本席在 Windows 控制台实跑的输出，编码显示为乱码但计数行可读。

### 5.9 上抛与账面

- **上抛（待裁）**：无。
- **上抛（知会）**：派单 `files` 笔误一事已获用户裁决（见 5.4 末），不再是待裁项。
- **新债**：本批无新债。评审 🟡 #5 ∥ 🔵 #8 的六条加一条措辞属设计档句子，已在 5.6 具名转设计席并在本节留清单，记在本批收口待办里，不另开账。
- **越档风险留痕**：出窗档含头注跨度 100（余量 0），下一次动它就是下一次 CODE-TIER §3 审视的触发点（5.3 已记）。

## §6 验证与收口（父代理）

### 验证读数（父侧实跑，不采信交付报告）

**批内单测**：`node --test docs/batches/2026-11-14-suspension-drive-split.test.mjs` → `tests 9 · pass 9 · fail 0`。收口按纪律已删该档。

**桌面包**：`thincoder-desktop` 下 `node test/run.mjs` → `tests 14 · pass 14 · fail 0`。

**全量**：仓根 `node test/run.mjs` → 217 例 / 212 绿 / 5 红。五红均非本批引入。

| 红 | 归因 |
|---|---|
| `CLI 43-1` ∥ `43-2` | 锚图遗留，台账 `#2404` |
| `CLI 34-1` ∥ `34-2` ∥ `35-3` | 报浏览器启动超时；两档孤立单跑各 3/3 全绿 ⇒ 并发争用，台账 `#2427` |

**红侧**：实施席连做两次定向变异（回合档 `reloadSlot` 反支 ∥ 驻留档去浅拷），变异态 `pass 7 · fail 2`，回退后复绿。尺子能红，不是恒绿。

### 结构读数（父侧 `countContentLines` 同尺）

| 档 | 内容行 | 工厂跨度 |
|---|---|---|
| `suspension-drive.mjs` | 83 | 57 |
| `suspension-resident.mjs` | 93 | 75 |
| `suspension-window-turn.mjs` | 106 | 81 |
| `suspension-window-open.mjs` | 66 | 47 |
| `suspension-window-close.mjs` | 117 | 97 |

A1 判据（骨干与每单元 ≤100）四项全达；原子函数跨度 322 已消除。A3 对外 11 键与形参 13 键逐字不变，已由批内单测断言。

### 落地核对

设计档收正八条已由设计席落盘，逐条落点在 §2.9；`doc_check` 对 `ACTIVITY.md` PASS，四条被取代措辞全档零残留。

四处新档头注写「批档 = `…suspension-drive-split.md` §2」。这是历史出处标注——机制单源半句已指向 `ACTIVITY.md` §2.1，批档删除后该半句自然失效、不误导。处置 = 不改，下次动这些档时删掉那半句。

`createWindowOpen` 仍在构造期收 `queue` 并校验。设计档已改成写真话（不是语义缝），从签名里去掉它是代码改动，留后。

### 本批新债 0 条

浏览器并发争用的 `#2427` 由同一次全量跑暴露，已记在 `2026-11-14-knowledge-tokenize-punctuation.md` §6，不重复登记。

### 文档门

`doc_check(mode:"gate", docs:["docs/desktop/design/ACTIVITY.md"])` → `DOC-CHECK GATE: PASS`。
