# 2026-11-15 · subagent-taskbook-in-system-prompt
> 六段，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 每段只有一个作者：作者的段可 `append` 加内容、可就地改（`edit`）；非作者一概拒。
> 编制：主 agent · 2026-11-15 · 来源 = 用户 2026-11-15 14:37 令「当然是开新批」；出题原话「工程模式下和子agent的任务书之类的，你觉得是不是应该进系统提示词更好？」。
> 台账 = #2443（— · 归批）。前情 = 2026-11-15-designer-dispatch-channel.md（已收口 2026-11-15）。
## §1 讨论（主 agent）
**状态行**：已收口 2026-11-15
批起 sha = a6602a27ce87b3cbef391225ef1d85ceb12d75b4
<§1 模板占位：本批条目 / 关键判据 / 授权口径>

### 起因

用户问：工程模式下子 agent 的任务书，是不是应该进系统提示词更好。

这个问题背后有一个可核实的不对称：系统提示词在整个子 agent 生命周期内不被压缩，而任务书读进来是 tool result，会被折叠并压缩掉。本批要判的是这个不对称该不该纠正，以及纠正的代价。

### 库内研究

库内 = 已查：`contextUsage` 的 system ∥ history 分野 → `token-window.mjs` 的 `contextUsage` 把 `extras.systemPrompt` 单独计价为 `system`，与 `history` 相加得 `overhead`；`fixedFloor` 是「history 全部压掉后」的量级。

已查：`turn-projection.mjs` 的折叠面 → `turnFoldPlan` 按消息身份找待折叠轮，`registerCompletedTurn` 在每轮结束时登记；保留窗由 `#2431` 定为最近两轮。

已查：`AGENT-LOOP-SUBAGENT.md` §3 → 工程角色任务书 = 绑定批档，不带自由文本参数；`eng-coder` 读 §2、`eng-designer` 读整份。**未规定载体必须是 user 消息。**

已查：同档 §11 验证清单含一项「system 稳定」→ 该项未展开，本批需要设计席给出判据。

库外 = B 类：改动面 = `thincoder-core/agent-tools/subagent-spawn.mjs`、`docs/core/design/AGENT-LOOP-SUBAGENT.md`、`bench/probe/driver.mjs`、`bench/check/probe.check.mjs`，全部是本仓内部代码与文档；外部断言 = 零。若设计席要断言 provider 前缀缓存对 system 段的具体行为，须另行补查并标明来源。

### 事实

一、系统提示词不在 `history` 里。`contextUsage(agent, extras)` 取 `extras.systemPrompt` 估成 `system`，压缩的 `splitHistory` 只作用在 `history` 上，碰到它。

二、任务书读进来是一条 tool result，在 `history` 里。子 agent 第 1 轮 `read` 批档得到的那个结果，到第 3 轮之后进入折叠段，再往后被压缩吞掉。

三、现状下发的是指向句，不是内容。`subagent-spawn.mjs` 对工程角色下发「任务书 = 批档 §2，读它再动手」，子 agent 自己去 `read`。

四、`#2443` 是本批的接管对象：那句话对所有工程角色同一形，而 `ENGINEERING_ROLES` 含 `eng-designer`，与提示词面已改的「设计席收整份批档」互斥。

### 问题的实质

不是「user 消息比系统提示词弱」。两者都是模型看到的权威输入。

实质是**存活时间**：任务书是整个 spawn 周期内不变的输入，却放在最早被丢掉的位置。跑几十轮之后，子 agent 手上已经没有被授权的任务书原文，只剩自己的记忆和通用纪律。

用户观察到的现象——子 agent 忘记任务书、需要父侧提醒——与这个位置直接相关。

### 边界

一、**不由父侧转录**。父 agent 读出 §2 转成文本传给子 agent，等于给同一份任务书造第二个版本；设计席改了 §2，子 agent 手里还是旧的。载体必须是「子 agent 能读到的原文」，由 spawn 自己读文件。

二、**不是整份批档进 system**。`eng-coder` 取 §2；`eng-designer` 的规则是读整份，但它自己会读 §1 与需求层，进 system 的应是任务书部分，不是全部。

三、**钉住机制不在本批**。给 `turn-projection` 与 `splitHistory` 加 pin 是另一条路径，改动面更大；本批只判载体位置。

四、**主会话不适用**。父 agent 的任务书随批变化，进系统提示词每次变都破前缀；子 agent 是「一个 spawn 一个任务」，性质不同。

### 给设计席的必答

一、**§11 的「system 稳定」指什么**。读设计档上下文，给出它的判据；若「任务书进 system」与该条冲突，说明冲突在哪，不许绕过。

二、**载体形态**。是新增一个系统提示词槽位，还是拼在 `subagent-base.md` 之后？槽位表 `SCENARIO_SLOT_FILES` 是否要扩一列？给出逐字落点。

三、**`#2443` 的收口**。`eng-designer` 那一句的逐字形，按 `audit-block.mjs` 对 `explore` 的先例（改指向句措辞、不冒称唯一通道）。这是 `#2443` 的原始要求，本批必须给出。

四、**第一条 user 消息怎么改**。任务书进 system 之后，指向句不再是「去读它」，但也不能说「已在系统提示词中」而让子 agent 忽略批档的其他段。给出逐字形。

五、**探针连带**。`bench/probe/driver.mjs` 有 `taskBookLine` 硬判据，`bench/check/probe.check.mjs` 有「explore 子块不得含该短语」的断言。`PROBE_VERSION` 要不要升，哪些断言要改。

六、**失效面**。任务书进 system 后，子 agent 若改了批档（设计席会改 §2），它手里的副本仍是启动那一刻的。这个「快照语义」要不要写进设计档，怎么表述。

### 验收面

一、新起的 `eng-coder` 与 `eng-designer` spawn，其系统提示词包含自己的任务书原文；`explore` 等非工程角色的系统提示词不变。

二、跑满二十轮后，任务书内容仍在子 agent 的系统提示词里（压缩与折叠都碰不到）。

三、`eng-designer` 的 system 固块与首条 user 消息中不出现「唯一任务通道」措辞（`#2443` 的原文在该角色上消失）；`eng-coder` 侧保留等价表述。

**判据是按角色读实际下发文本，不是整仓 `grep` 零命中。** 同一短语对 `eng-coder` 仍为真，整仓扫描会把正确文本一起判红——`#2441` 已在同一处栽过一次，设计席核出并上抛，本行按此收窄。

四、`eng-coder` 侧不回归：原来那句对它为真的规则保留等价表述。

### 已定决定

- **已定决定**：本批独立开新批，不由 `#2444` 扩围；接手台账 `#2443` · 用户原话：「当然是开新批」 · 时间：2026-11-15 14:37

- **已定决定**：载体必须是子 agent 能读到的原文，不由父侧转录 · 用户原话：「工程模式下和子agent的任务书之类的，你觉得是不是应该进系统提示词更好？」（用户以「该进系统提示词更好」为方向；「零转录」是本席据 §2441 已定纪律推得的载体约束） · 时间：2026-11-15 14:18

### 设计评审后的修面轮（用户 2026-11-15 14:52 裁定 A：先修面、再复评、再实施）

评审 `#4` 结论 PASS（0 🔴 · 8 🟡 · 3 🔵）。其中两条照字面实施会建错，故不按「实施后再修」走，改走先修面。

**两条会建错的**

- **§11.1 的破坏形与 §8.1 的块内容字面相反。** §11.1 把「把本轮才有的东西（当前轮次、当下 §2 文本）写进块里」列为破坏形，§8.1 却要求块里装的就是 §2 快照。照 §11.1 字面读，实施席会把 §2 剔出固块。
- **§8.2 的「- 工程审计上下文。」是一个只有五个字的光杆条目**，全档无一处解释它是什么。实施席只能自行发明这个块成员。

**一条父侧现场核实后推翻评审方向的**

- **§2.1 的 async 规则是事实错误，不是需求档太宽。** 设计档原句「depth-0 spawn/escalate 必须显式 async:true；depth>0 必须 async:false」。父侧实读：`thincoder-core/agent-tools/subagent.mjs` 的 async 参数描述为「`true` = async spawn (report via the auto channel); `false` = blocking; omitting it is refused」，其拒绝消息为「pass true for an async spawn or false for a blocking flight」；`thincoder-core/agent-tools/spawn-gates.mjs` 内无任何 async 判据。即 depth-0 传 `false`（阻塞）合法。评审第 1 条据需求档「depth-0 显式传值」判需求太宽——方向反了，错在设计档。

### 逐条修面清单（九条，设计席按号改、按号报）

| # | 落点 | 现状（原句） | 改成 |
|---|---|---|---|
| 1 | §2.1 | 「depth-0 spawn/escalate 必须显式 async:true；depth>0 必须 async:false。」 | 「depth-0 spawn/escalate 必须显式传 `async`：`true`（异步，结果自动送达）或 `false`（阻塞，本 turn 等结果）；省略即拒。depth>0 必须 `async:false`。」——依据是上文父侧实读的拒收消息 |
| 2 | §11.1 破坏形 | 「或把本轮才有的东西（当前轮次、当下 §2 文本）写进块里」 | 删去「当下 §2 文本」这一项，改写为「在 turn 边界重读批档并按当前内容重算固块」才是破坏形；spawn 当刻的 §2 快照是块的规定内容，不是破坏形 |
| 3 | §8.1 快照语义 | 「此后批档改动不回流——授权的就是那一刻的文本」 | 写明冻结边界：`eng-coder` 冻结 §2、`eng-designer` 冻结 §1 + §2；其余段（§3–§6）不进固块，由该角色按需从磁盘读，改动能被看到。一句话说清「哪些冻、哪些活」 |
| 4 | §8.2 收集序第三项 | 「- 工程审计上下文。」 | 补一句定义：它装的是哪个角色的哪些内容、从哪来、缺失时怎么办。若是本批不该有的东西，整条删除并同步 §8.2 的收集序 |
| 5 | §3.1 指向句 | 「批档路径、副本位置、其余段自读」 | 删去「副本位置」——固块里没有、也不该有这样一个可指向的东西 |
| 6 | §9 ∥ §6 | 「落 other 池」∥「子代理手动档非只写操作经父权限面」 | 两个术语全档无定义。各补一句（池是什么、手动档指什么状态） |
| 7 | 档头 勘察证据 ∥ 最近先例 | 「勘察证据：已读角色、九动作、spawn 门、files、固块、tester 和文档工具装配。相关 = 当前工具参数。」∥「最近先例：`ADVISOR-CONVERGENCE.md` 的实例隔离和 `BATCH-RECORD.md` 的绑定写面。对齐 = 参数门与调度事实分离。」 | 勘察证据补上查过的外部源码档（本仓参考系）或明写「已查，无相关」；最近先例补节名或实现坐标，使「对齐」可核 |
| 8 | §3.1 参数禁带句 | 「goal、knownFacts、scope、acceptance、reportFormat、task、context 一律不作为任务书参数。」 | 改为引用需求档的对应功能点，不再重抄七项名——两份活本已经漂过一次（第 1 条就是） |
| 9 | 全文状态分支 | 各拒绝/降级分支均无场景来源 | 本次修面**新增**的分支各写一句来源（真实观测 ∥ 用户报告 ∥ 可复现路径）；已有的不必补 |

**不许越的边界**

- 只改 `docs/core/design/AGENT-LOOP-SUBAGENT.md` 与批档 §2 两个写面，不碰代码、不碰需求档。
- 需求档的两条（async 措辞按上文父侧事实收严、补非功能约束一节）由父侧改，不在本轮范围内。
- 不改本批的机制方向：任务书正文进 spawn 固块、按角色切片、spawn 当刻冻结、切不出段即拒发。这四条是已批准的设计，只是表述有冲突。
- 不为「让检查变绿」改写判据：§11.1 的判读式（同 child 两次 `prepareRun`、期间改一次批档、两次 `systemPrompt` 逐字节相等）保留。

### 修面第二轮（主 agent 核后追加 · 2026-11-15 14:57）

- **已定决定**：§2.1 首句把 `escalate` 移出「必须显式传」——`spawn` 省略即拒，`escalate` 省略仍指异步飞行。 · 依据：同节第 40 行已写对该例外，首句却把 escalate 并进「必须显式、省略即拒」，两句互斥；改首句，第 40 行不动。 · 时间：2026-11-15 14:57
- 需求侧同轮落：`ENGINEERING-MODE-V2-SPEC-DELEGATION.md` ② 第 7 条已拆成 spawn 与 escalate 两句（D11 同轮扫）。
- 其余八条修面已逐条读回核实：§11.1 破坏形与 §8.1 的冲突消除（新增「spawn 当刻的 §2 快照是该块的规定内容」）· §8.1 冻结按段分（`eng-coder` = §2，`eng-designer` = §1 + §2，§3–§6 自读磁盘）· §8.2「工程审计上下文」已补成可实施定义（只由审计 spawn 携带，装 `_touchedFiles` ∥ 批档路径 ∥ 三段模板）· 「副本位置」全档零残留 · 「手动档」与「other 池」各有一段定义 · 勘察证据列六个参考系码档并写「外部源码档 = 已查，无相关」 · 最近先例补节名与实现坐标 · §3.1 改为引用需求档不重抄七项参数名。

### 复评 #8 结论与逐条裁定（主 agent · 2026-11-15 15:02）

评审 id `64cc2eaa` · `VERDICT: pass` · 0 🔴 / 7 🟡 / 2 🔵。九条逐条裁定如下。裁定为 `Deferred` 的，理由统一是**设计评审已通过 ⇒ 被审两份档字节冻结**（改一个字节，下一次 eng-coder spawn 就被拒，且实施席建的东西评审席没读过）；它们随交付后的修面轮落地，落点逐条写明。

| # | Action | Detail |
|---|---|---|
| 1 | Deferred | 「depth>0 省略 async 的行为未写」。实读 `thincoder-core/agent-tools/subagent.mjs` 的 async 参数描述：「Required: `true` = async spawn …; `false` = blocking; omitting it is refused. At depth>0 every spawn is synchronous — an explicit `async:true` there is refused」⇒ 省略在任何深度都拒、depth>0 传 `true` 也拒、只有 `false` 合法。设计 §2.1 把「省略即拒」只排进 depth-0 句是编排问题，语义无缺口，实施不受影响。交付后修面补进 §2.1 与 AC-M5-5。 |
| 2 | Deferred | 「需求 ④ 的 `task_book` 指针在设计 §5 未点名」。本批不改 `batchDocInFlight` 的语义（改动面只有系统提示词块与探针），实施不依赖该名。交付后修面在 §5 点名 `task_book`。 |
| 3 | Dispatched | 「§8.1 失效即拒缺场景来源」。该分支在本批是真要建的业务门（§2 关键决策 5：拿不到授权文本就不该派这个任务）。处置 = 由设计席在 §2 补第 7 条验收：喂一份没有 `## §2` 段头的样本档，断言拒发且点名路径与缺失段——这同时就是该分支的可复现失败路径。设计档正文的场景来源随交付后修面补。 |
| 4 | Deferred | 「§8.2 manifest 不可读 ⇒ 静默省略」与需求 ④「不静默降级」。属实：该省略对 spawner 不可见。交付后修面二选一——把缺席显式化，或写明文档坐标是可选富化、不在 ④ 的判域内。本批实施按设计现状落（不推该块、不拒 spawn）。 |
| 5 | Deferred | 「档头勘察证据行是一次性记录」。属实，F2-4 归过程记录。交付后修面把该句移入 §2 勘察证据行，档头只留最近先例 + 对齐理由。 |
| 6 | Not an issue | 「`AUTO` 未定义」。`AUTO` 不是杜撰词，是产品既有的自动审批档（本会话 env 行原文「AUTO mode is active — all tool calls are automatically approved without asking」）。评审的原意（读者无法从这两份档解析它）成立，故仍记为交付后补一句的待办，但不算缺陷。 |
| 7 | Not an issue | 「批次档侧五项本轮未核」。本席已核，逐项属实：机读清单九档、第三列量法 `countContentLines` @ 批起快照 `a6602a2`、全部 ≤500 故「分拆方案」列全 `—`；验收 6 条各带判法与红侧；`test/RTM.md` 已读，无既有行被改写或被删，新增 `CLI 50`；关键决策 6 条。 |
| 8 | Deferred | 「§3.1 的『唯一』措辞段属评审残留」。交付后修面删措辞句、留机制句。 |
| 9 | Not an issue | 「需求 ① 第二段复述载体」。设计 §8.1 与需求 ① 第二段同口径、无矛盾；需求侧保留可观察的稳定性陈述（AC-M5-6）是它该有的形状，载体细节在设计档。若删，AC-M5-6 会失去指向。 |

**本席自查发现的额外缺口（评审未提，比第 3 条更硬）**：§2 的六条验收里没有**失败用例**。项目规则「业务门要带失败用例：必须拒绝的门要有一条单测，喂它不满足的输入，断言拒绝 + 可读原因；只有happy path 证明不了门存在」。§2 关键决策 5 明确把「失效即拒」定为业务门，验收面却没有对应用例 ⇒ 已派设计席在 §2 补第 7 条验收（与第 3 条同一条落点）。

## §2 批次任务与设计（eng-designer）
**状态行**：设计完成

<§2 模板占位：本批条目（覆盖） / 设计档落点 / 机制设计 / 受影响文件与测试覆盖 / 验收对照 / 关键决策 / 上抛项>

<§2 模板占位：机读清单 = 标题行「**受影响文件（机读清单）**」+ 围栏内三列表（表头 | 档 | 分拆方案 | 行数 |、分隔行 |---|---|---|、一行一档，只列代码档（源 ∥ 单测））；第二列：越设计时线的档写正向形方案（点名带目录段的档 + 本批落步 `实施轮` ∥ `§5`），未越线写 —；第三列：该档在批起快照上的内容行数（量法 = `countContentLines`），快照里没有这一档写 `新`；示例行 = | thincoder-core/agent-tools/batch-tier-gate.mjs | — | 新 |>

### 条目（覆盖）

| # | 条目 | 来源 |
|---|---|---|
| 1 | 工程角色的任务书正文进 system 固块：eng-coder = §2，eng-designer = §1 + §2 | §1 必答二 |
| 2 | §11「system 稳定」的判据落地 | §1 必答一 |
| 3 | `#2443` 收口：eng-designer 不再收「§2 是本 spawn 唯一任务通道」 | §1 必答三 · 台账 #2443 |
| 4 | 首条 user 消息按角色改写 | §1 必答四 |
| 5 | 探针连带：`taskBookLine` 判据、夹具两层、`PROBE_VERSION` | §1 必答五 |
| 6 | 快照语义进设计档 + 块内说明行 | §1 必答六 |

### 设计档落点

`docs/core/design/AGENT-LOOP-SUBAGENT.md` 四处，已落到现形。

§3.1 补切片与「唯一」措辞的角色归属；§8.1 改写载体规则（正文进固块 + 切法 + 快照 + 失效即拒 + 不截断）；§8.2 补「任务书正文」为收集序首块，并写明逐角色指向句不留在块内、归首条 user 消息；§11.1 新增「system 稳定」判据。

### 机制设计

**载体**：正文走既有 spawn 固块 `child._spawnSystemBlock`——`buildSpawnChild` 收集、`prepareRun` 在角色槽之后拼接。

不新增 `SCENARIO_SLOT_FILES` 列：那张表是「静态场景 → 提示文档」，没有「每 spawn 一份」的位置，加一列会让槽位表依赖运行期数据。

**切片**：eng-coder 取 §2；eng-designer 取 §1 + §2。§1 是约束它的裁决，§2 是它自己的笔，§3–§6 由它自读。

切法 = 两个 `^## §\d` 段头之间的文本，段界正则单源 `thincoder-core/agent-tools/batch-skeleton.mjs`「const nextRe = /^## §\d/gm」。不解析标题文字。

**构造器另立新档**：`thincoder-core/agent-tools/taskbook-block.mjs`，纯函数 `buildTaskBookBlock({ role, record })` 返回块文本，切不出段就抛带段名与路径的错。

先例 = `audit-block.mjs` 的 D23-3 外提：判据可直测，spawn 档不越行数线。

**失效即拒**：段切不出来（不可读、无对应段头）⇒ 拒绝 spawn 并点名路径与段。不退回「只发指向句」——那会让 §8.1 的承诺落空且无人知道。

**快照语义**：正文在 `buildSpawnChild` 当刻读一次并冻结，此后不回流。块首一行说明：本副本是 spawn 时刻快照，改写或引述某段之前重读磁盘；`batch` 的 `edit` 锚点取磁盘现行文本。

**首条 user 消息逐字**（`buildSpawnChild` 内 `input` 分支）：

- eng-coder：`Task book: §2 of the batch record at <abs> — reproduced verbatim in your system prompt as it stood at spawn time. Read the record itself for any other segment; §5 of that record is where you record the implementation.`
- eng-designer：`Task book: the batch record at <abs> — §1 (the rulings that bind you) and §2 (your own pen) are reproduced verbatim in your system prompt as they stood at spawn time. Read the record itself for §3–§6, and re-read the current §2 text before you edit it.`

**`#2443` 字形**：两句都不带「only」「唯一」措辞；「唯一任务通道」只保留在 eng-coder 那一侧的规则里，对它为真。

先例 = `audit-block.mjs` 的「it is the criterion source for this audit」：把指向限定在该角色的任务上，不冒称唯一通道。

**探针连带**：`bench/probe/driver.mjs` 的 `taskBookLine` 判据拆成两条事实——`taskBookLine`（逐角色句 + 批档绝对路径 + `_engTaskInput === built.input`）与 `taskBookInSystem`（`systemPrompt` 含夹具 §2 正文行）。

`bench/check/probe.check.mjs` 的 :114/:116 断言随新句改；:75 改判审计块不得含新句的专有措辞；:63 的版本钉改 4。

`bench/probe/data.mjs` 的 `PROBE_VERSION` 3 → 4：夹具与判据本批都动，任一变化即 +1。夹具三族的沙箱批档已带 `## §1` / `## §2` 段头，正文无需改。

### 受影响文件

设计档：`docs/core/design/AGENT-LOOP-SUBAGENT.md`（.md，不计行数读数）。

同族注释：此行「任务书 = 批次档 §2」对 eng-designer 已不准——`spawn-gates.mjs` 四处、`audit-block.mjs` 两处、`subagent.mjs` 一处、`subagent-spawn.mjs` 一处。

按 D11 同轮改为「任务书 = 绑定批档，按角色切片（§8.1）」。注释改动不改变运行行为。

**受影响文件（机读清单）**

```text
| 档 | 分拆方案 | 行数 |
|---|---|---|
| thincoder-core/agent-tools/taskbook-block.mjs | — | 新 |
| thincoder-core/agent-tools/subagent-spawn.mjs | — | 430 |
| thincoder-core/agent-tools/spawn-gates.mjs | — | 203 |
| thincoder-core/agent-tools/audit-block.mjs | — | 62 |
| thincoder-core/agent-tools/subagent.mjs | — | 425 |
| bench/probe/driver.mjs | — | 274 |
| bench/check/probe.check.mjs | — | 338 |
| bench/probe/data.mjs | — | 237 |
| docs/batches/2026-11-15-subagent-taskbook-in-system-prompt.test.mjs | — | 新 |
```

第三列量法 = `countContentLines`，取值面 = 批起快照 `a6602a2`（本席实跑：`git show <sha>:<档>` 后过该函数）。全部 ≤ 500 ⇒ 无拆分方案。

### 验收对照

**验收 1 · 新 spawn 的系统提示词带自己的任务书原文，非工程角色不变。**

判法 = 单测：同一份样本批档下 `buildSpawnChild` + `prepareRun` 装配三个 child。eng-coder 的 `systemPrompt` 含 §2 正文行且不含 §3 正文行；eng-designer 含 §1 与 §2 正文行且不含 §3；explore 的 `systemPrompt` 与改前逐字节相同（无任务书块）。

红侧 = 改前同一断言在 eng-coder 与 eng-designer 上为假（`_spawnSystemBlock` 只有批档路径行）。判的人 = 实施席跑，父侧看读数。

**验收 2 · 跑满二十轮任务书仍在。**

判法 = 单测：把 `child` 的 history 压到只剩最近两轮（喂一段合成长历史后走 `compressIfNeeded`），再 `prepareRun`，`systemPrompt` 仍含 §2 正文行；结构面断言正文不在 `agent.history` 里。

红侧 = 若正文随首条 user 消息下发，压后该行消失。判的人 = 实施席。

**验收 3 · `#2443` 原文对 eng-designer 消失。**

判法 = 单测断言 eng-designer 的 `input` 不含 `only` 与「唯一」，且 `systemPrompt` 含 §1 正文行；再逐档阅读 `subagent-spawn.mjs` 的 `input` 分支、`driver.mjs` 的 `taskBookLine`、`probe.check.mjs` 的对应断言，四处都不许对该角色声称唯一通道。

不用整仓 grep 判「only task channel」零命中：该串对 eng-coder 仍为真，扫到即判红等于判据在写文档。判的人 = 设计评审 + 父侧收口。

**验收 4 · eng-coder 侧不回归。**

判法 = 单测断言 eng-coder 的 `input` 仍点名 §2 为任务书、仍点 §5 为实施记录段，且其 `systemPrompt` 的 §2 正文与磁盘 §2 逐字相等（读一次文件对读）。判的人 = 实施席。

**验收 5 · `system 稳定`（设计 §11.1）。**

判法 = 单测：同一 child 连跑两次 `prepareRun`、期间改一次批档，两次 `systemPrompt` 相等。红侧 = 若实现改成 turn 边界重读批档，第二次必然不同。判的人 = 实施席。

**验收 6 · 探针面不假绿。**

判法 = `node bench/check/probe.check.mjs`（或该面既有入口）全绿，且 `PROBE_VERSION = 4`、两层夹具逐字等值断言通过。红侧 = 改判据不改版本号 ⇒ :63 直接红。判的人 = 实施席跑，父侧看读数。

**验收 7 · 失效即拒的失败用例：切不出授权段的批档拒发 spawn。**

判法 = 单测。写一份**可读**夹具批档：正文只有 `## §1` 段头与一行 §1 文字，没有 `## §2` 段头。
可读是关键——它已过 `resolveBatchReadPath` 那道既有门，所以本断言测的只有新门。

以该夹具绝对路径作 `args.batchDoc`，调 `buildSpawnChild`（`role='eng-coder'`），断言抛出，且错误文本同时含夹具绝对路径与 `§2`。

同一夹具下 `role='eng-designer'` 同样拒发并点名 `§2`——不许「§1 在就只带 §1」放行。

同一轮里 `role='explore'` 以同一夹具装配不抛：门只对工程角色，非工程角色不因缺段被拒。

工程角色不退回「只发指向句」这一半，由上面那条「断言抛出」直接覆盖——不抛即红，不必另设一条读不出东西的断言。

红侧 = 改前同一夹具下 `buildSpawnChild` 正常返回，`_spawnSystemBlock` 只有批档路径行，上列断言全假。
这条红侧要实跑记录（命令 + 读数），不是推断：既有门只判可读、不判段头——依据 `thincoder-core/agent-tools/subagent-spawn.mjs`「if (!batchDocAbs) throw refusal(」，其拒因是「given path is not a readable file」，判据里没有段头一项。

判的人 = 实施席跑，父侧看读数。依据 = 设计 §8.1「失效即拒」+ 本段关键决策 5「失效即拒，不降级」；项目规则要求业务门带失败用例——只有 happy path 证明不了门存在。

### 集成面变更（`test/RTM.md`）

已读 `test/RTM.md`：`spawn` / `subagent` / `系统提示词` 全表仅 CLI 20「一本批档只服务一个并发 spawn」一条与 spawn 相关，它判的是同档占用护栏，不断言系统提示词组成。故无既有行被改写、无被删行。

**新增一行**：`CLI 50` · 标题「工程角色 spawn 的任务书正文在系统提示词里，跑到后面还在」。

触发 = 用户 2026-11-15 实报的子代理忘记任务书，生产已发生的问题。断言只取业务可观察面 = 装配后的系统提示词含任务书正文，且压缩后仍含。案号以 `test/RTM.md` 落行为准，标题先于此写。

### 关键决策

1. **正文进 system 固块，不进首条 user 消息**——后者在 `history` 里，折叠与压缩会吞掉；前者在整个 child 生命周期不被压缩。依据 = `thincoder-core/agent-tools/subagent-spawn.mjs`「**spawn 级固定机制性指令改走 system 固块**」。

2. **eng-designer 取 §1 + §2，不取整份**——§1 边界二已定「不是整份批档进 system」；§1 约束设计席、§2 是它的笔，其余段它自读。取整份会把 §4/§5/§6 骨架噪音塞进每次设计席装配。

3. **切段按 `^## §\d`，不按标题文字**——段头由骨架生成且 `batch` 拒收正文里新起的段头 ⇒ 机制所有物，稳定可切；按标题文字切会随骨架改字就失效。

4. **构造器另立 `taskbook-block.mjs`**——纯函数可直测，`subagent-spawn.mjs`（批起 430 行）不因新增逻辑逼近行数线。

5. **失效即拒，不降级**——业务门：拿不到授权文本就不该派这个任务。降级成指向句 = 静默改了设计承诺。

6. **不截断长 §2**——被截断的副本仍自称原文，比不给更坏；`batch` 工具单次 20000 字符上限已约束单次写入量。

### 已知边界

- 批档缺 `## §1` / `## §2` 段头 ⇒ 对应角色拒发 spawn。旧批档若手改成无段头形态会被拒——这是有意的，骨架是唯一权威入口。
- 快照不回流：eng-designer 在本轮改 §2 后，system 副本仍是启动态；块内说明行要求它改写前重读磁盘。
- 主会话不适用（§1 边界四）：depth-0 的任务书随批变化，进 system 每次破前缀。

### 上抛

- `[上抛·知会]` 设计 §8.1 原句「任务正文仍由子代理从批档读取，不把易变任务文本冻结进 system」与本批方向相反。本席已按 §1 已定决定第二条就地改写为现形，写明在此以免后续读者以为它一直如此。
- `[上抛·知会]` 台账 #2439（收口门改动面跨批取材）：本批与 #2444 在同一工作树并行，收口门可能要求对方档行。本席不改门，只记此处。
- `[上抛·知会]` §1 验收面第三条的「`#2443` 的原文消失」若按整仓 grep 判，会连 eng-coder 侧仍为真的那句一起判红。本席在验收 3 改为按角色读判据，理由写在该条内。

### 修面轮（评审 #4 后 · 用户 2026-11-15 14:52 裁定 A：先修面、再复评、再实施）

按 §1「逐条修面清单」九条改，一号一报。改面 = `docs/core/design/AGENT-LOOP-SUBAGENT.md`（本席）∥ 本段。代码、需求档未动。

| # | 落点 | 改成什么 | 依据 ∥ 判读 |
|---|---|---|---|
| 1 | §2.1 | 「depth-0 `spawn` 必须显式传 `async`：`true`（异步）或 `false`（阻塞）；省略即拒。depth>0 必须 `async:false`（该句只及 spawn）」 | `subagent.mjs`「subagent: async is required — pass true for an async spawn or false for a blocking flight」；depth-0 传 `false` 合法；escalate 的例外在同节下一段 |
| 2 | §11.1 破坏形 | 删「当下 §2 文本」；改为「本轮新产生的工具输出」，并补一句「spawn 当刻的 §2 快照是块的规定内容（§8.1），不是破坏形」 | 与 §8.1 块内容对齐；判读式（同 child 两次 `prepareRun`、两次 `systemPrompt` 相等）原样保留 |
| 3 | §8.1 快照语义 | 补冻结边界：eng-coder 冻 §2、eng-designer 冻 §1 + §2；§3–§6 不进固块、自读磁盘、改动可见 | 用户裁定 A 的「哪些冻、哪些活」 |
| 4 | §8.2 收集序第三项 | 由五字光杆条目补成定义：只由审计 spawn 携带（`if (engAuditAttempt !== null) spawnBlocks.push(buildAuditBlock(ctx))`）；装 `_touchedFiles` 快照 ∥ 批档路径 ∥ 审计指令/预算/报告格式模板；来源 `ctx.agent._touchedFiles` ∥ `_batchDoc`；缺失落 `- (none yet)` ∥ `(unavailable)`、不拒 spawn；非审计 spawn 整块不推 | 本批确有该物（不是多余的），故留而非删；依据 `audit-block.mjs` 逐字 |
| 5 | §3.1 指向句 | 删「副本位置」：首条 user 消息只留「批档路径 ＋ 其余段自读」 | 固块里没有可指向的副本位置这一物 |
| 6 | §6 ∥ §9 | §6 补「手动档 = 父会话未开 autoApprove，子代理调用逐次经 `onPermissionRequest` 询问」；§9 补「other 池 = `ASYNC_POOL_LIMITS = { engCoder: 4, other: 4 }` 的分域，`poolDomainOf(role)` 判」 | 两处逐字实读 `subagent-spawn.mjs` ∥ `subagent-async.mjs` |
| 7 | 档头 | 勘察证据列六个本仓参考系码档，并明写「外部源码档 = 已查，无相关」；最近先例补节名（`ADVISOR-CONVERGENCE.md` §4.2 ∥ `BATCH-RECORD.md` §4.2）＋ 实现坐标（`batchBound` / `child._batchDoc`），「对齐」改成可核的一句 | 依据 `ADVISOR-CONVERGENCE.md` §4.2「每轮重建 system 与 user 消息，不复用上一轮会话数组。」 |
| 8 | §3.1 参数禁带句 | 不再重抄七项名，改引用需求 `ENGINEERING-MODE-V2-SPEC-DELEGATION.md` ② 第 2 条 | 单一权威源；重抄已漂过一次（第 1 条同形） |
| 9 | 全文状态分支 | 本修面**新增**的两处分支各带来源：§2.1 的拒文（§2.1 行内 `subagent.mjs` 引文）∥ §8.2 审计块缺失占位（`audit-block.mjs` 引文）。其余新增句是措辞收严或删除，无新分支 | 已有分支未补（按清单） |

**连带扫面（D11／改后自查）**：§3.1 的「eng-designer 读整份批档」补「§1 + §2 另随固块冻结，§3–§6 自读磁盘」——否则与修好的 §8.1 冻结边界互斥（评审第 4 条同处）。其余引 §8.1／§11.1 的句子（§3.1 任务书正文段、§11.1 判据段）与改后一致。

**自检**：§11.1 的「破坏形」与 §8.1 的块内容不再字面相反；§8.2 五个块成员各有定义、收集序未变；档头两条各有可核坐标；验收 1–6 未因修面而失效（判据仍按角色读实际下发文本）。

### 上抛

- `[上抛·知会]` 修面未改机制方向与验收判据：验收 5（system 稳定）的判读式原样有效；验收 1–6 的判人仍是实施席与父侧。

### 修面第二轮（主 agent 核后追加 · 2026-11-15 14:57）

§1 该轮只追加一条裁定，其余八条经主 agent 读回核实已落地，本轮不重改。

| # | 落点 | 改成什么 | 依据 ∥ 判读 |
|---|---|---|---|
| 1 | 设计 §2.1 首句 | 「depth-0 `spawn` 必须显式传 `async`：`true`（异步，结果自动送达）或 `false`（阻塞，本 turn 等结果）；省略即拒。depth>0 必须 `async:false`（escalate 只在 depth-0，故该句只及 spawn）」 | 同节下一段已写 escalate 省略仍指异步飞行；首句把 escalate 并进「省略即拒」，两句即互斥。查码：`subagent.mjs`「if (action === \"escalate\") return await executeEscalateAction(args, ctx)」先于「subagent: async is required」返回；`subagent-actions.mjs`「Error: escalate is only available at depth 0」 |

**escalate 段未动**（§1 明示「第 40 行不动」）：`action:'escalate'` 那段逐字保留原引文。故本轮改面 = 设计 §2.1 首句一处，实测 diff 只有该句。

**上抛收口**：上一轮就 escalate 侧上抛的「省略即拒是否覆盖 escalate」已由 §1 于 14:57 裁定，需求侧同轮落（`ENGINEERING-MODE-V2-SPEC-DELEGATION.md` ② 第 7 条拆成 spawn 与 escalate 两句）；该上抛行已从本段删去，不再是待裁项。

**自检**：首句与 escalate 段不再互斥；§8.1 切片与快照、§8.2 收集序、机制方向、验收 1–6 判据均未动。

### 修面轮（复评 #8 后 · 评审 id `64cc2eaa` 逐条裁定）

本轮只落 `Dispatched` 的那一条，以及与它同一落点的自查缺口：**验收面新增第 7 条**（失效即拒的失败用例）。

设计档零改动：评审已通过 ⇒ 被审两份档字节冻结，实施席按冻结字节落；改一个字节下一次 `eng-coder` spawn 就被拒。

| 裁定 | 条目 | 本轮处置 |
|---|---|---|
| Dispatched | 3 · §8.1 失效即拒缺场景来源 | 已落：验收第 7 条。喂一份无 `## §2` 段头的可读样本，断言拒发且点名路径与缺失段——这同时就是该分支的可复现失败路径 |
| Deferred | 1、2、4、5、8 | 不动。落点见 §1 裁定表，随交付后修面轮落地；本批实施按设计现状落（第 4 条：不推该块、不拒 spawn） |
| Not an issue | 6、7、9 | 不动。第 6 条（`AUTO` 补一句）仍记交付后待办 |

**验收面自查（业务门带失败用例）**：本段原六条验收全是 happy path，无一条对「失效即拒」这个业务门喂不满足的输入。
项目规则要求必须拒绝的门带一条单测，断言拒绝 + 可读原因；只有 happy path 证明不了门存在。第 7 条即补此缺口。

**第 7 条判法的取材依据**：夹具必须是**可读**的缺段档——可读才越过既有 `resolveBatchReadPath`，测到的才是新门。不可读的路径改前已被拒，拿它当红侧等于测一条本来就绿的路。

`explore` 那半句只断言「装配不抛」，堵的是「门只该管工程角色」被实现成「所有角色都拒」。工程角色不退回指向句那一半，由「断言抛出」的自身红侧覆盖。

**自检**：验收 1–6 的判据、判法、判人均未改动；关键决策六条与机制方向（正文进固块 ∥ 按角色切片 ∥ spawn 当刻冻结 ∥ 切不出即拒）未动；机读清单九档未变（第 7 条的用例落既有 `docs/batches/2026-11-15-subagent-taskbook-in-system-prompt.test.mjs`，收口即删）。

**自检（第 7 条每条断言都能为假）**：eng-coder 与 eng-designer 两条靠「改前同一夹具正常返回」，可实跑复核；`explore` 那条靠「实现可能把所有角色一律拒」。没有一条是无论实现对错都同色的。

## §3 设计评审（评审子代理）
**状态行**：评审通过



### 轮次 1（评审子代理）

**结算**：已签发（pass）· 2026-11-15

    | # | Severity | Status | Evidence |
    |---|----------|--------|----------|
    | 1 | 🟡 | New | spec §② item 7 "depth-0 显式传值；子代理内同步" vs design §2.1 "必须显式 async:true" |
    | 2 | 🟡 | New | spec section set ①②③④⑤ — no 非功能约束 section |
    | 3 | 🟡 | New | design §11.1 "或把本轮才有的东西（当前轮次、当下 §2 文本）写进块里" vs §8.1 "eng-coder = §2、eng-designer = §1 + §2" |
    | 4 | 🟡 | New | design §3.1 "eng-designer 读整份批档" vs §8.1 "此后批档改动不回流——授权的就是那一刻的文本" |
    | 5 | 🟡 | New | design §8.2 "工程审计上下文" · §9 "other 池" · §6 "手动档" · §3.1 "副本位置" |
    | 6 | 🟡 | New | design §8.1 "该角色的段切不出来（文件不可读、或没有对应段头）⇒ 拒发 spawn 并点名路径与缺失段" · §8.2 "manifest 不可读时不推该块，不影响 spawn。" |
    | 7 | 🟡 | New | design header "勘察证据：已读角色、九动作、spawn 门、files、固块、tester 和文档工具装配。相关 = 当前工具参数。" |
    | 8 | 🟡 | New | design header "最近先例：`ADVISOR-CONVERGENCE.md` 的实例隔离和 `BATCH-RECORD.md` 的绑定写面。对齐 = 参数门与调度事实分离。" |
    | 9 | 🔵 | New | spec §② item 2 and design §3.1 — the same seven parameter names in two live copies |
    | 10 | 🔵 | New | design §8.1 "不设长度上限、不截断" |
    | 11 | 🔵 | New | design §11 验证 lists the verification surface, no suite run named; §2-side items unverified |
    VERDICT: pass
    计数：🔴 0 · 🟡 8 · 🔵 3 · 未标 0


### 轮次 2（评审子代理）

**结算**：已签发（pass）· 2026-11-15

    | # | Severity | Status | Evidence |
    |---|----------|--------|----------|
    | 1 | 🟡 | New | design §2.1 "depth>0 必须 `async:false`" vs AC-M5-5 "depth>0 传 `true` 即拒" — omission outcome absent from both |
    | 2 | 🟡 | New | requirement ④ "同档占用按 `task_book` 指针判定" vs design §5 "batchDocInFlight 检查…的同档条目" |
    | 3 | 🟡 | New | design §8.1 "失效即拒：该角色的段切不出来（文件不可读、或没有对应段头）" — no scene, no repro |
    | 4 | 🟡 | New | design §8.2 "manifest 不可读时不推该块，不影响 spawn" vs requirement ④ "不静默降级" |
    | 5 | 🟡 | New | design header 勘察证据 "外部源码档 = 已查，无相关：本档机制全在本仓代码内" |
    | 6 | 🟡 | New | design §4 "依赖失败/取消时按当前 AUTO 与父侧处置规则处理" — `AUTO` undefined in scope |
    | 7 | 🟡 | New | batch record not in review scope — tier / precedent / survey / integration-delta / acceptance unverified |
    | 8 | 🔵 | New | design §3.1 "「唯一」措辞只对 eng-coder 的那一段成立" |
    | 9 | 🔵 | New | requirement ① "另在 spawn 当刻随系统提示词固块下发" duplicating design §8.1's carrier |
    VERDICT: pass
    计数：🔴 0 · 🟡 7 · 🔵 2 · 未标 0

### 轮次 3（评审子代理）

> 状态行重置：第 3 轮打回（changes-required）· 上一轮状态行 = 评审通过 → 进行中 · 2026-11-15

代码评审（review scope = taskbook-block.mjs ∥ subagent-spawn.mjs ∥ spawn-gates.mjs ∥ audit-block.mjs ∥ subagent.mjs ∥ bench/probe/driver.mjs ∥ bench/check/probe.check.mjs ∥ bench/probe/data.mjs ∥ 本批单测档）。

| # | Severity | Status | Evidence |
|---|----------|--------|----------|
| 1 | 🔴 | New | spawn-gates.mjs `rejectEngFreeTextParams` 拒文「the task book is batch record §2 (batchDoc), read by the child itself.」 vs 设计 §3.1「eng-designer 读整份批档（§1 + §2 另随固块冻结，§3–§6 自读磁盘）」; 同族 subagent.mjs 已改「sliced per role into the spawn system block」 |
| 2 | 🟡 | New | probe.check.mjs `engPreview` 断言 `task book: batch record §2 (docs/batches/x.md)` 于 role='eng-designer'; 源 = permission.mjs「task book: batch record §2 (」未随本批改 |
| 3 | 🟡 | New | 设计 §8.1 段界单源指 `batch-skeleton.mjs`「const nextRe = /^## §\d/gm」; 实现 import `./batch-segment-vocab.mjs`，且 batch-skeleton 仍自带同一字面 |
| 4 | 🟡 | New | §2 验收 1「explore 的 `systemPrompt` 与改前逐字节相同」vs 单测只断言 `exploreSys.includes("§1-BODY-MARK")` 等三处不在场 |
| 5 | 🟡 | New | 批档 §2 验收 7「这条红侧要实跑记录（命令 + 读数），不是推断」; 盘上 `## §5 实施记录（eng-coder）` 为空 |
| 6 | 🔵 | New | driver.mjs `const segNos = PROBE_ROLE === "eng-coder" ? [2] : [1, 2]` — PROBE_ROLE 为常量 "eng-designer"，分支不可达（METHODOLOGY F2-7） |
| 7 | 🔵 | New | data.mjs `### 本批任务（任务书 = 本节，唯一通道）` 整段进 eng-designer system 固块，`taskBookInSystem` 要求其逐行在场 |
| 8 | 🔵 | New | taskbook-block.mjs `const body = withoutBlankEdges(sectionBodyLines(text, seg) ?? [])` — 段头在、段体空时只出段头行、照发 spawn（设计未列该形态） |
| 9 | 🔵 | New | 单测验收 2 起本机 SSE 端点，断言依赖 `choices[0].delta.content` 报文形状（R4 型形态依赖） |

计数：🔴 1 · 🟡 4 · 🔵 4 · 未标 0

VERDICT: changes-required

### 轮次 4（评审子代理）

代码评审（复核轮 · 2026-11-15）。review scope = taskbook-block.mjs ∥ subagent-spawn.mjs ∥ spawn-gates.mjs ∥ bench/probe/driver.mjs ∥ bench/check/probe.check.mjs ∥ 本批单测档 ∥ 批档 §5

| # | Severity | Status | Evidence |
|---|----------|--------|----------|
| 1 | 🔴 | Fixed | spawn-gates.mjs `rejectEngFreeTextParams` 拒文现为「the task book is the bound batch record (batchDoc), sliced per role into the spawn system block (eng-coder: §2; eng-designer: §1 + §2)」— 与设计 §3.1 一致；同族再无 `read by the child itself` |
| 2 | 🟡 | Fixed | probe.check.mjs「AC-11 承重句在三处产品面在位」：eng-coder 侧仍断言 `task book: batch record §2 (docs/batches/x.md)`（对该角色为真），eng-designer 侧只断言点名本批档 —— 旧句不再被钉成绿 |
| 3 | 🟡 | Unfixed | 设计 §8.1「段界正则已是单源——`thincoder-core/agent-tools/batch-skeleton.mjs`「const nextRe = /^## §\d/gm」」vs 实现 `import { sectionHeaderRe, sectionBodyLines } from "./batch-segment-vocab.mjs"`；且 batch-skeleton 仍自带 `const nextRe = /^## §\d/gm` |
| 4 | 🟡 | Fixed | 单测验收 1 增判「`assert.equal(exploreOtherSys.replace(noS2.root, "<root>"), exploreSys.replace(root, "<root>"), "explore 的 systemPrompt 与批档内容无关（换一份缺 §2 的批档仍逐字节相等）")`」—— 断言面落到批档内容不敏感 |
| 5 | 🟡 | Unfixed | 批档 `## §5 实施记录（eng-coder）` 之后直接 `## §6 验证与收口（父代理）`，两段皆空；§2 验收 7「这条红侧要实跑记录（命令 + 读数），不是推断」仍无落处 |
| 6 | 🔵 | Fixed | driver.mjs `const segNos = [1, 2]`（不可达分支已删，附独立切法理由） |
| 7 | 🔵 | Unfixed | data.mjs 夹具 `"### 本批任务（任务书 = 本节，唯一通道）",` 仍整段进 eng-designer 固块，`taskBookInSystem` 仍要求其逐行在场 |
| 8 | 🔵 | Accepted | taskbook-block.mjs `const body = withoutBlankEdges(sectionBodyLines(text, seg) ?? [])` 空段体不拒 —— 设计 §8.1 只枚举「不可读 / 无对应段头」两态，实现与设计一致；上轮即定为只报不改（待设计席问一句） |
| 9 | 🔵 | Unfixed | 单测验收 2 仍依赖 SSE 报文形状 `choices: [{ delta: { content: "SUMMARY: earlier turns compressed." }, finish_reason: null }]`（R4 型形态依赖）；`requests.length >= 1` 已补断言 |

计数：🔴 0（原 1 已修）· 🟡 4（2 修 / 2 未修，均非必改）· 🔵 4（1 修 / 1 采纳 / 2 未修）

VERDICT: pass

## §4 用户批准（主 agent）

### 用户批准

- **已定决定**：本批进入实施，范围 = 现盘上 §2 的任务书与设计评审通过的 `AGENT-LOOP-SUBAGENT.md` 目标态；不再扩围。 · 用户原话：「自动跑完」 · 时间：2026-11-15 16:10
- 依据：设计评审 `#8` 结论 `pass`（0 🔴 / 7 🟡 / 2 🔵），token `designId=a33f6dc3-40c8-4aa9-9a0e-481e7eea1b7f` 已签发并在 `design-slots` 里核为 `live`；评审的 18 条裁定见 §1 裁定表（1 条 Fixed 已落，其余 Dispatched/Deferred/Not an issue）。
- 「自动跑完」同时覆盖实施 → 验收 → 收口全链，中间不再逐站等字。

## §5 实施记录（eng-coder）
**状态行**：实施完成



### 实施摘要

机制四项按 §8.1 落地：**正文进 system 固块** ∥ **按角色切片**（eng-coder = §2、eng-designer = §1 + §2）∥ **spawn 当刻冻结** ∥ **切不出即拒**（点名路径与缺失段）。首条 user 消息只留按角色的指向句（§3.1），「唯一通道」措辞只保留在 eng-coder 一侧。

落点：

- 新档 `thincoder-core/agent-tools/taskbook-block.mjs`（内容行 94）：`TASK_BOOK_SEGMENTS` · `buildTaskBookBlock({ role, record })`（纯函数、零 fs）· `taskBookPointerLine(role, path)`。切段消费 `batch-segment-vocab.mjs` 的 `sectionHeaderRe` / `sectionBodyLines`（批次档段解析的既有唯一实现），不另写段界正则。
- `subagent-spawn.mjs`（内容行 431 → 454）：batchDoc 门之后、token 门之前读一次批档并冻结（读不到同判拒，拒文点名路径）；`spawnBlocks` 首块 = 任务书正文（§8.2 收集序）；`input` 改走 `taskBookPointerLine`。
- 同族改面（D11）：`spawn-gates.mjs` 五处注释 + 一处**运行时拒文**；`audit-block.mjs` 两处注释；`subagent.mjs` 一处注释 + 一处运行时消息；`bench/probe/data.mjs` 两处注释。
- 探针：`driver.mjs` 拆 `taskBookLine`、新增 `taskBookInSystem`（自沙箱批档独立切法、逐行判，不用产品构造器派生）；`probe.check.mjs` 版本钉 4、审计块加一条否定判、装配腿改判 + 新句断言；`data.mjs` `PROBE_VERSION` 3 → 4。

### 读数（本席实跑：命令 + 结论）

- 单测（本批单测档，7 条）：`node --test docs/batches/2026-11-15-subagent-taskbook-in-system-prompt.test.mjs` → `# pass 7 / # fail 0`。
- 红侧（同一份单测，代码取 HEAD `a42b136d`：`git worktree add … HEAD` 后在那个树里跑同一条命令）→ `# pass 1 / # fail 6`。六条失败即本批要建的事实：
  - 验收 1：eng-coder 的 `systemPrompt` 不含 §2 正文行（`false !== true`）；
  - CLI 54：`systemPrompt` 不含 §2 整段；
  - 验收 3：eng-designer 的 input 仍是 `… — read it before acting; it is the only task channel for this spawn.`（`true !== false`）；
  - 验收 4：input 不点 §5；验收 5：快照那条为假（改前无快照可比）；验收 7：**缺 §2 的可读批档照旧正常返回**——业务门在改前不存在。
  - 第 7 条（切片表性质断言）红侧仍绿：它守的是新档常量，不是改前行为，故不在这条红侧的作用面内。
- 探针：`node bench/check/probe.check.mjs` → `bench/check: 11 passed, 0 failed`（含 `PROBE_VERSION = 4` 与两层夹具 `deepEqual`）。
- 既有集成面邻居实跑：`batchdoc-reuse-guard` ∥ `tester-role` ∥ `tool-role-fitting` 全绿（`# pass 2` / `# pass 5`）。`batch-live-batch-lock` ∥ `doc-write-gate` ∥ `tiny-mode` 合跑 `# pass 27 / # fail 1`：红的是 `CLI 50-6`（`normal 档三处分母 = 模型窗口`，实测 `[NaN, 1024000, NaN]`），因另一在途批 `2026-11-15-window-reserve-and-baseline` 正在改 `token-window.mjs` / `config.mjs` / `context.mjs` / `agent/run-stages.mjs`（工作树 `M`），窗口分母出 `NaN`；与 spawn 面、任务书面无关，本席未碰这四个档。
- 行数（量法 `countContentLines`）：`taskbook-block.mjs` 94 · `subagent-spawn.mjs` 454 · `probe/driver.mjs` 294 · `probe.check.mjs` 350 · 单测档 291。全部 ≤ 500 ⇒ 无拆分方案。

### `probe.check.mjs` check 5 就地修（父侧 2026-11-15 裁定「修，就地修」）

三处，按父侧指定形态落：

- 骨架行改读**装配后的**工具描述：`loadToolDoc("subagent")` + `expandKnowledgeTopics(…, { tiny: false })`（`tools/shared.mjs` 的 `expandToolDescription` 本体就是这两行）。没直接 import 它：那条链会把整个 agent 运行时拖进一条 bench 自检，与形态无关。取**前缀形**（新行尾多了 `async=true`），不写字面全行。
- 单源断言换成「装配面恰 1 次 ∥ 指针档 0 次」（`tool-docs/subagent.md` 现只剩一句 + `{{knowledge:tool-subagent}}`）。
- 失去对象的 `§6.22.8-A` 逐字归一比对整段删除，check 标题同步改掉那半句——删的是**对象已不存在**的那一半，不是降低覆盖面（单源由上面那条取代）。

证据（HEAD 上就红，非本批造成）：`git show HEAD:thincoder-core/tool-docs/subagent.md` 无 `subagent(role=`；`git show HEAD:docs/core/design/AGENT-LOOP-SUBAGENT.md` 的 `6.22.8-A` 命中 0；内容已迁到 `thincoder-core/prompts/knowledge/tool-subagent.md` :40-41（骨架行）与 :31-32（按角色通道句）。

### 决定披露（清单外改动，逐条带理由）

| 档 | 改了什么 | 为什么 |
|---|---|---|
| `test/RTM.md` | 故事表新增一行 `\| CLI 54 \| 工程角色 spawn 的任务书正文在系统提示词里，跑到后面还在 \| tooling \| 待补 \| 缺 \| 缺 \|` | 父侧令「同一行在故事表里追加，编号以盘上为准」。盘上 `CLI 50` / `51` / `52` / `53` 均已占用（`50` = 三档模式切换、`51` = 台账查询分页、`52` = ACP workMode、`53` = knowledge 检索有界），故取下一个未占用号 `54`；§2 第 284 行的字面 `CLI 50` 按同段第 286 行「案号以 `test/RTM.md` 落行为准」让位。CLI 列填 `待补` 而非 `有`：盘上没有对应的 `test/integration/**` 用例档（RTM 自述「本表只登记仓根 `test/integration/**` 的集成用例」），按 `CLI 47` 同形如实标；既有行零改写、零删除。 |
| `bench/check/probe.check.mjs`（check 5） | 见上节 | 父侧裁定就地修；该 check 在 HEAD 上已红（见上节证据），留着它红等于本批带一个已知红的验收出门。 |
| `thincoder-core/agent-tools/subagent.mjs` 的运行面拒文 | `their task book is batch record §2.` → `the bound batch record (batchDoc), sliced per role into the spawn system block.` | 该句对 eng-designer 已不准，属 D11 同轮扫面；设计 §2 只列了这一档的「一处注释」，运行面那一处是漏算。 |
| `bench/probe/data.mjs` 两条注释 | 「任务书单通道」/「工程角色任务书 = 批次档 §2」→「按角色切片（§8.1）」 | 同族 D11。夹具**正文**未动（设计 §2 明示「夹具正文无需改」），故 `PROBE_VERSION` 只因判据变化 +1。 |

另有清单外的**回退事故与复原**（如实记）：红侧取证时 `git checkout -- <档>` 从索引（已被 `git add` 过）取回，实际没回到 HEAD，白跑一轮；改用 `git worktree add … HEAD` 取到真红侧。期间一次 `git restore --source=HEAD` 把 `spawn-gates.mjs` 回退成旧版，已从备份复原并 `node --check` + 复跑读数确认（前后 hash 一致）。

### 落地核对

- 设计 §8.1 写「段界正则已是单源——`thincoder-core/agent-tools/batch-skeleton.mjs`「const nextRe = /^## §\d/gm」」，而实现消费 `batch-segment-vocab.mjs` 的 `sectionHeaderRe` / `sectionBodyLines`（`batch-skeleton.mjs` 只再导出其中 `sectionHeaderRe`，且自留一份 `nextRe` 字面）。**语义等价、行为无差，但设计点名的消费档不是实际消费档**——该句要落到 §8.1 的坐标上（eng-designer 的笔，本席不改设计档）。同一条也已在 §3 复评轮列为未修 🟡。
- 设计 §3.1 / §8.2 / §11.1 / 快照冻结边界与落地一致，无第二处不实。
- `permission.mjs` 的人审预览对 eng-designer 仍写 `task book: batch record §2 (…)`（`formatPermission` 的拼装面）；本批未改也不在清扫枚举内。探针那条断言原先把该句钉在 eng-designer 上（复评 #2），已改为钉在 eng-coder 一侧（对它为真），eng-designer 侧只断言「点名本批档」。

### 审计与代码评审轮次

- **分歧审计**（explore，只读）：`DEVIATIONS — 0 🔴 / 2 🟡 / 1 🔵`。已修 1 条 🟡（`spawn-gates.mjs` 档头「任务书单通道 = 批次档 §2」——设计 §2 的「四处」漏数的第五处）；另 1 条 🟡（`permission.mjs` 预览）与 1 条 🔵（设计 §8.1 坐标）如实留档，不在本席写域。
- **代码评审轮 1**（`advisor type=code`）：`VERDICT: changes-required`（1 🔴 / 4 🟡 / 4 🔵）。
  - 🔴 → 修：`spawn-gates.mjs` 运行时拒文仍写「the task book is batch record §2 (batchDoc), read by the child itself.」。改成「the bound batch record (batchDoc), sliced per role into the spawn system block (eng-coder: §2; eng-designer: §1 + §2)」，并把「put everything into …」半句按角色分。
  - 🟡 → 修：验收 1 的 explore 面原来只断言三条 marker 不在场（比「与改前逐字节相同」窄）。改成对**批档内容不敏感**的等值判读：同一套装配换一份缺 §2 的批档，两次 `systemPrompt` 逐字节相等。
  - 🟡 → 修（本席写域内那一半）：探针把 `task book: batch record §2` 钉在 eng-designer 上；改为钉 eng-coder（该句对它为真），eng-designer 侧只断言点名本批档。
  - 🟡（§5 未落）→ 即本段。
  - 🔵 ×4：修两条（driver 不可达三元 → 字面 `[1, 2]`；单测加「摘要调用真发出」读数断言），留两条（空段体不拒 = 设计未枚举、属设计问题；夹具 §2 含「唯一通道」字样 = 设计明示夹具正文不改，改则再 bump 版本）。
- **代码评审轮 2**（`advisor type=code`，只核修面主张）：`VERDICT: pass`（0 🔴 / 4 🟡 / 4 🔵，其中 🟡 两条已修、两条非必改；🔵 一修一采纳两留）。
- **终态：converged**（1 个修面轮 + 1 个复核轮，0 🔴 收口）。

### 上抛

- `[上抛·知会]` `permission.mjs` 的 `formatPermission` 仍对任何携 `batchDoc` 的角色出 `task book: batch record §2 (…)`——对 eng-designer 这句为假（它的任务书是整份批档）。本批未改（不在批准档清单，也不在设计 §2 的清扫枚举）。要么记一条债挂 `#2443`，要么由设计席在 §3.1 补一句预览面口径。
- `[上抛·知会]` 设计 §8.1 的段界坐标（`batch-skeleton.mjs`）与实现（`batch-segment-vocab.mjs`）不一致，且盘上仍有两份 `nextRe` 字面。本席不改设计档，留给出设计席的修面。
- `[上抛·知会]` 本批 RTM 行 CLI 列 = `待补`：盘上没有 `test/integration/**` 用例档。`test/integration/**` 不在本席文件声明域，是否在本批补一条集成用例（入口 = 父侧真派单、断言系统提示词含任务书正文）由父侧决定。
- `[上抛·知会]` `test/integration/tiny-mode.test.mjs` 的 `CLI 50-6` 在本工作树为红（`[NaN, 1024000, NaN]`），因邻居批在改窗口分母四档；本席未碰那四个档，也不在本批判定面内。

### 债与待办（父侧登记用）

本批新债候选 3 条：① `permission.mjs` 预览语义（对 eng-designer 为假）；② 设计 §8.1 坐标漂移 + `batch-skeleton.mjs` 的第二份 `nextRe`；③ 空段体是否并入「失效即拒」的拒面（设计问题）。另有 1 条非债待办：RTM `CLI 54` 的集成用例档（CLI 列现为 `待补`）。

## §6 验证与收口（父代理）

### 父侧验收读数（本回合实跑，命令 + 结果）

- `node bench/check/probe.check.mjs` → `bench/check: 11 passed, 0 failed`（check 5 已在盘上读回：断言改读装配后的描述、`countOf(assembledDocs, ENG_SKELETON) === 1`、`tool-docs/subagent.md` 不得持骨架行第二份）。
- `node --test --test-reporter=tap docs/batches/2026-11-15-subagent-taskbook-in-system-prompt.test.mjs` → `# tests 7 / # pass 7 / # fail 0`。
- 红侧由实施席在 `git worktree … HEAD` 树上实跑：同一份单测 `# pass 1 / # fail 6`，六条失败逐条即本批要建的事实。父侧另实读过改前的门（`subagent-spawn.mjs` 只判可读、无段头判据），该红侧属实。
- 业务门（不可缺省）在盘上带着可读拒文：`buildTaskBookBlock` 切不到 `## §<n>` 时抛，拒文含批档绝对路径与缺的段号；`TASK_BOOK_SEGMENTS` = `eng-coder: [2]` ∥ `eng-designer: [1, 2]`，其余角色无块。

### 验收 1–7

| # | 状态 | 判据落点 |
|---|---|---|
| 1 | ✅ Done | 三角色同批档装配：coder 只含 §2、designer 含 §1+§2；explore 换缺 §2 的批档后 `systemPrompt` 逐字节相等 |
| 2 | ✅ Done | 40 条合成历史走压缩后，指向句被吞、`systemPrompt` 仍含 §2 整段且两次相等 |
| 3 | ✅ Done | designer 的 input 与预览面无「唯一/only」；指向句按角色各一句（`taskBookPointerLine`） |
| 4 | ✅ Done | coder 的 input 仍点 §2 与 §5、含绝对路径；`systemPrompt` 的 §2 与磁盘 §2 逐字相等 |
| 5 | ✅ Done | 同一 child 两次 `prepareRun`、期间改批档，两次 `systemPrompt` 相等 |
| 6 | ✅ Done | 探针 11/11；`PROBE_VERSION` 3→4；两层夹具 `deepEqual` |
| 7 | ✅ Done | 可读但缺 `## §2` 的夹具：coder 与 designer 均抛且拒文含夹具路径与段号，explore 不抛；红侧为改前正常返回 |

### 落地核对

- 设计 §8.1 记的段界坐标（`batch-skeleton.mjs`）与实际消费档（`batch-segment-vocab.mjs`）不符，盘上另有两处 `nextRe` 字面 ⇒ **目标移动**，本批不改设计档字节，记 `#2447`。
- 设计 §8.2 的「承载面不可缺省」与本批行为一致（缺失时推 `- (none yet)` ∥ `(unavailable)`，不拒 spawn）；与需求 ④「不静默降级」的边界由父侧在需求 ④ 补一句划清（拒绝面 vs 可缺省项），未改设计档。
- 设计 §3.1 的「eng-designer 通道是整份批档」在运行面已兑现；人审预览面仍是旧措辞 ⇒ 记 `#2446`。

### 收口动作

- 文档闸：`doc_check(mode:"gate")` 于设计档 + 需求档 + `test/RTM.md` → `DOC-CHECK GATE: PASS`。
- 单元测试档 `docs/batches/2026-11-15-subagent-taskbook-in-system-prompt.test.mjs` 按纪律于本回合删除，读数留在此段。
- 台账 `#2443` 在途 → 待核销 → 已核销；本批新债 4 条：`#2445`（bench 散文面断言）· `#2446`（预览面旧措辞）· `#2447`（段界坐标漂移）· `#2448`（`CLI 54` 集成用例档缺）。
