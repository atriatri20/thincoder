# 2026-11-14 · turn-projection-recovery
> 六段，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 每段只有一个作者：作者的段可 `append` 加内容、可就地改（`edit`）；非作者一概拒。
> 编制：主 agent · 2026-11-14 · 来源 = 用户 2026-11-14 指令「你安排一下，把这几条都落地，另外，恢复的时候考虑了吗？」；台账 #2397–#2401 覆盖。
> 台账 = #2401（core · 归批）。前情 = 无（独立批）。
## §1 讨论（主 agent）
**状态行**：已收口 2026-11-14
批起 sha = 677d4e70b12eef46eb44f1bc78939d212ee3e45f
<§1 模板占位：本批条目 / 关键判据 / 授权口径>

覆盖 = 台账 #2397（压缩重建后 `_turnStartLen` 未同步）、#2398（固定开销单独超线无显式处置）、#2399（压缩摘要不落槽）、#2400（`taskState` 无决策指向、折叠 no-op 不可观测）、#2401（恢复时在途/异常段被 `turns` 短路）。

恢复面实读（本轮）：
- `restoreMachineFromTurns(data)` 只做 `projectTurns(turns)`，`turns` 非空即返回，`contextHistory` 不再参与。
- `saveSession` 的机读副本 = `machineLineForSlot(turns, activeTurnRaw(agent))`，在途/异常段**已存进槽**。
- 于是恢复丢两类：在途/异常段原文（存了但读不回）、压缩摘要（从未入槽）。

已定决定（用户 2026-11-14「把这几条都落地，另外，恢复的时候考虑了吗？」）：
- **恢复口径取甲案**：槽存压缩检查点，恢复 = 摘要 + 其后轮次投影 + 在途段；不做「压缩时裁剪 `turns`」的乙案。
- **保存与恢复必须同尺**：`saveSession` 存了什么段，`applySession` 就要读回什么段；在途/异常段是机读线的一部分，不能只在保存侧存在。
- **#2400 的决策面只指路不摘录**：任务状态给「本轮真改过的设计/需求档」，不写模型自述的理由，避免第二种事实来源。
- **#2398 不靠压缩兜底**：固定开销（system+tools）单独超线时直接给出可读的 typed error，说明该线不可通过压缩解决。

边界（给设计席的范围）：
- 人读线、sidecar、`read_history` 一字不动；双线共享消息对象不得原地改写。
- 旧槽（无 `turns`）保持现有回退，不因新字段而变。
- 不把压缩摘要做成第二条事实源：摘要只表示「此前的机读线被压过」，轮记录仍是事实面。
- 上一批 #2396 的三条非阻塞发现（§1.1 与 §4 截断口径、A2 读法歧义、改动来源未记）**不在本批处理**，等 #2396 实施交付后另办，避免让它的评审凭证失效。
- 本批要产出：两份设计档（`docs/core/design/CONTEXT-COMPACTION.md` §1.1/§4/§6 ∥ `docs/core/design/SESSION.md` §2/§10）+ 批档 §2（含机读清单、RTM 增量、可跑的验收档与命令）。

- **自动推进**：本批设计→评审→实施→收口全链 · 自 2026-11-14 02:10 · 用户原话：「这些都自动跑完吧。」

- **已定决定**：`taskState.objective` 每轮重复整段请求的问题并入本批（#2399）处理，不单开批次 · 用户原话：「这个，我说并」 · 时间：2026-11-14 02:30

口径待本批设计裁定：是回到短形态（`objective` 只在缺 `goal` 时取请求首行），还是保持全文；两条都须写明 `taskStateText` 是否重复输出该行。裁定依据 = 当前上限已去掉，重复无界（批内单测 U3 现冻结「objective = 整段请求」这一形，改动时同步）。

- **已定决定**：`taskState.objective` 的重复问题并入本批（#2399）处理，不单开批；形态由本批设计裁定 · 用户原话：「这个，我说并」 · 时间：2026-11-14 02:33
- **已定决定**：需求层恢复成分那句由主 agent 补在 `docs/core/requirements/SESSION.md` §1 · 依据：设计侧 #12 上抛，恢复成分属「存储与恢复」小节射程 · 时间：2026-11-14 02:33

需求已落：`docs/core/requirements/SESSION.md` §1 现写「恢复机读历史时使用用户请求、最终回复和任务状态，含压缩检查点与没有轮记录可依的在途段，完整工具过程从人读记录按需回查」。设计 §2 的 `objective` 重复处置按此定形态，验收补对应行。

收口门实测（2026-11-14）：§2 机读清单缺本批实际改动 11 档的基线读数。

`thincoder-core/agent/turn-projection.mjs` 现 553 行，越 500 设计时线，且 §2 无拆分方案。

§2 需补其一：11 档各写批起快照基线行数。前六档：turn-projection 411 · context 292 · token-window 285 · provider/errors 175 · run-stages 361 · agent-tools/context 184。

后五档：session 286 · session-lifecycle 445 · setup-reminders 257 · fixtures/anthropic-endpoint 131 · integration/turn-history-projection 116。新增档 `thincoder-core/agent/turn-task-state.mjs` 记「新」。

§2 需补其二：越线档 `thincoder-core/agent/turn-projection.mjs` 写正向拆分方案，目标档 `thincoder-core/agent/turn-task-state.mjs`，落步 = 本批 §5。

拆分边界由主 agent 定：轮事实账本 + taskState 组装 + 状态串渲染 + 成败取形整体搬出；`turn-projection.mjs` 保留折叠 ∥ 投影 ∥ 恢复三面，并对既有符号保持 re-export 以稳住对外契约。

### 第 3 轮评审裁决（8 项）

- **🔴 #1 在途段尾端配对收口两支无场景** ⇒ 本轮派设计席修。两条路二选一：给出能产出该槽状态的可复现路径（谁在「调用已上线、结果未回」之间落盘），或按 6b 收窄/删除该支并改写 `CONTEXT-COMPACTION.md` §6 的来由为脏数据收口。修完要让 §2「表里没有第四条无场景分支」这句重新为真。
- **🟡 #2 re-export 调用点清单** ⇒ 本轮修（按实读改成 `record-results.mjs` ∥ `run-start.mjs` ∥ `agent.mjs`，移出 `run-stages.mjs`）。
- **🟡 #3 拆后文件归属句与偏离记零** ⇒ 本轮修（增「拆后文件归属与理由重述」步，偏离从零改为具名偏离 + 持久理由）。
- **🟡 #4 落步与 §5 状态不自洽** ⇒ 本轮修（§2 与 §5 二者取一，写明拆档落在哪一轮）。
- **🟡 #5 需求 §7 验收枚举未扩展** ⇒ 主 agent 同轮已补，枚举中增入「压缩检查点与在途段恢复」。
- **🟡 #6 设计 §2 `activeRaw` 措辞宽于实现** ⇒ 已在 #2403 登记，本轮不改（实现语义不在本轮修面）。
- **🔵 #7 `str` 的 import 面写窄** ⇒ 本轮修（点明新档须导出 `str`，恢复面亦从新档 import）。
- **🔵 #8 `test/rtm/tooling.md` CLI 1-6 括注理由相抵** ⇒ 产品面，随下一轮实施席改。

### 第 4 轮评审裁决与本轮实施面

- **评审判 pass**：上轮 8 项 = 6 已落实 + 2 已接受；新增 2 项 🟡 均建议、不阻。凭证已重签。
- **本轮实施面（eng-coder，fix 轮）**：① `thincoder-core/agent/turn-projection.mjs` 按 §2 分拆方案拆出 `thincoder-core/agent/turn-task-state.mjs`，两档同尺各 ≤500；② 该档档头「四个面同一份实现」改为「三面同尺 + 账簿/事实单列」并留一句持久理由（代码注）；③ `test/rtm/tooling.md` CLI 1-6 括注改成自洽读数，判据列不动；④ §5 状态行退回进行中，写补实施轮交付后再收。
- **不在本轮**：`CONTEXT-COMPACTION.md` 头注与 §1.1 常量括注两处文件归属句属设计档笔，待实施交付后由 eng-designer 一轮改；§2「越线档留着不动，下一批一开工就先付这笔」与落步相抵（评审 N1），同一设计轮一并改；#2403 的 `activeRaw` 措辞仍不动。
- **用户口径**：2026-11-14 03:0x「修。后续自动跑吧，跑完你就开工工具面的修改。」本批收口后即开工具面批。

### 第 4 轮评审裁决（6 项）

- **🟡 #1 §6「只覆盖 Ctrl+I 的中断支」因果写错** ⇒ 设计档面，排在拆档交付后的一轮设计改（过审字节冻结期不动设计档）。
- **🟡 #2 `harvestActiveRaw` 注释仍挂被否掉的场景** ⇒ 已并入实施席本轮（`send` 投放，随拆档同批改注释）。
- **🟡 #3 §2 段末「下一批一开工就先付这笔」与「不推到下一批」相抵** ⇒ 设计席面，排在拆档交付后同轮改。
- **🟡 #4 §5/§6 状态与 §2 落步相反** ⇒ §5 状态行由实施席本轮退回，§6 由主 agent 收口时重写。
- **🔵 #5 `design/SESSION.md` §2 恢复次序缺 §6 装线前收口指针** ⇒ 设计档面，同上排期。
- **🔵 #6 `tooling.md` CLI 1-6 与夹具档头同一句互斥说法** ⇒ 已并入实施席本轮（`send` 投放，两处一起改）。

### 收口前设计收尾（第 4 轮遗留 + 拆档弄假的两句）

- **D1** `CONTEXT-COMPACTION.md` 头注「账本 ∥ 事实 ∥ 折叠 ∥ 恢复四面同一实现」——账本与事实已进新档，改作「投影 ∥ 折叠 ∥ 恢复三面在 `turn-projection.mjs`，账本与状态组装在 `turn-task-state.mjs`」。
- **D2** 同档 §1.1「`SUMMARY_CAP` ∥ `COMMAND_CAP`（`turn-projection.mjs`）」——两个常量随账本块进新档，归属改 `turn-task-state.mjs`。
- **D3** §2 档位结论行：拆档已落盘，同尺读数 `turn-projection.mjs` 318 ∥ `turn-task-state.mjs` 265（`countContentLines`），删掉「唯 `turn-projection.mjs` 越线（553）」与「越线档按下方分拆方案在本批 §5 内拆出」的将来时。
- **D4** §2「越线档留着不动，下一批一开工就先付这笔」删除——与盘面相反，且是评审 N1 与第 5 轮 #3 点名的相抵句。
- **D5** §2 机读清单：`turn-projection.mjs` 与 `turn-task-state.mjs` 两行改 318 ∥ 265；本批单测档 `docs/batches/2026-11-14-turn-projection-recovery.test.mjs` 行改「收口删除」。
- **D6** `CONTEXT-COMPACTION.md` §6「补占位结果的那一段只覆盖 Ctrl+I 的中断支」——代码判据是 `signal?.reason?.interrupt` 而 Ctrl+C 也带 `interrupt: true`，真正让 Stop 走不到占位段的是中止先沿工具批抛出；改成代码实际成立的那一条因果。
- **D7** `SESSION.md` §2 恢复次序第 1 步补一句指到 `CONTEXT-COMPACTION.md` §6 的装线前配对收口（单点仍在 §6，§2 只指路）。

拆档本身保留（用户 2026-11-14 03:24 裁定「不回退，拆档不是坏事」）：原判「越 500 设计时线」用错了基准（批起 411、标准 §2.1 基准 = 修改前长度，§2.3 中间不判），但两档边界本身成立，不回退。

## §2 批次任务与设计（eng-designer）
**状态行**：设计完成





### 本批条目（覆盖）

| 台账 | 问题 | 落点 |
|---|---|---|
| #2397 | 压缩重建机读数组后 `_turnStartLen` 仍指旧下标，在途段切片失真 | 设计 `CONTEXT-COMPACTION.md` §1.1「压缩重建整个机读数组后，在途段起点按消息身份重定」；实现 `context.mjs` 的 `applyCompression` |
| #2398 | 固定开销（system + tools）单独越线无显式处置 | 设计 §5「固定开销（system + tools）单独越过 limit 时压缩无解」；实现 `run-stages.mjs` 的 `enforceContextFit` ∥ `context.mjs` 的 `force` 支 |
| #2399 | 压缩摘要不落槽：重启重压，摘要里的决策与未决点丢失 | 设计 §6「压缩成果必须能落槽」+ `SESSION.md` §2 三段表与恢复次序 |
| #2400 | `taskState` 无决策指向，折叠 no-op 不可观测 | 设计 §1.1 表新增 `changedDocs` 行 +「决策指向只指路不摘录」+「折叠在安全点的 no-op 也要留痕」 |
| #2401 | 恢复时在途 ∥ 异常段被 `turns` 短路 | 设计 `SESSION.md` §2 `activeRaw` 段与恢复次序第 1 步 |

### 机制设计

槽的机读线分三段写、按 `SESSION.md` §2 的次序读回：

| 槽键 | 写面 | 读面 |
|---|---|---|
| `compactCheckpoint` = `{ note, turnsCovered }` | `saveSession` 从 agent 的 `_compactCheckpoint` 落盘（无压缩 ⇒ 键缺） | 恢复时机读线首条，`role:"user"`、`content` = `note` 原文；`turns` 从第 `turnsCovered` 项之后投影 |
| `turns` | 既有写面不变 | 只投影 `turns.slice(turnsCovered)` 那一段 |
| `activeRaw` | `saveSession` 取 `activeTurnRaw(agent)`，丢弃 `transient` 标记消息 | 接在轮投影之后，装线前做配对收口，两支各有来由（`CONTEXT-COMPACTION.md` §6）：尾部缺结果的 `assistant(tool_calls)` 不装，来由 = 工具执行中按 Stop、结果未提交而回合尾保存已落盘；缺调用的 `tool` 消息不装，无写侧来由、按槽数据归一。收口落在 `restoreMachineFromTurns` 内，`activeTurnRaw` 的采集面不动 |

键形与在途段的写面单点在 `SESSION.md` §2，覆盖判据与恢复收口单点在 `CONTEXT-COMPACTION.md` §1.1 ∥ §6；本节只记本批落点，不另立第二份规则。

恢复不只装线：`applySession` 还要把 `agent._compactCheckpoint`（键缺 ⇒ 不设）与折叠身份标记（按恢复出的轮记录重建）播种回 agent。不播种，同一会话的第二次压缩只见到重启之后的轮，`turnsCovered` 被写小、被摘要的轮整条投影回来（`SESSION.md` §2）。

`contextHistory` 保留原形（三段按同一投影拼成再过滤 transient），降为旧槽与旧读者的回退面，恢复不再以它为权威。

压缩检查点由 `applyCompression` 产出，载体 `agent._compactCheckpoint`，两字段 `{ note, turnsCovered }`，惰性建立（读面 `?? null`，不新增 `createAgent` 播种行，也不动 VSC `setup.mjs`）。

`turnsCovered` 在压缩当刻按轮记录算：该轮三条记录消息全部落在切割点之前才算覆盖。实现上折叠时登记每条轮记录的消息对象身份（`applyTurnFold` 写进 `agent._turnFoldMarks`），压缩按身份判「是否已进中段」。

在途段起点 `_turnStartLen` 在压缩重建后按消息身份重定：压缩前记下它指向的消息对象，重建后在新数组里找回下标；找不回（该条已进摘要）⇒ 取注记与占位之后的第一条原文。

`fixedFloor` 谓词一处实现：`contextUsage` 返回值新增该字段（= 固定开销按当前估算比缩放，与 `total` 的估算支同尺），两处消费——`enforceContextFit` 抛 typed error，`compressIfNeeded` 的 `force` 支直接 no-op，不发摘要请求。

typed error 复用 `kind: "context_overflow"`，新增 `reason: "overhead_exceeds_limit"`，报文给固定开销 ∥ limit ∥ window 三数，并说明压缩解不了、可选的三个动作。

`taskState` 新增 `changedDocs`：`facts.docRoots`（调用方注入的设计 ∥ 需求文档根）过滤 `_touchedFiles`，账本与状态组装两档都保持零 IO 纪律、不自读 manifest（文档根由 `agent/setup-reminders.mjs` 注入）。文本面一行 `changedDocs: a.md, b.md`。

折叠 no-op（有待折项但 `turnFoldPlan` 返 `null`）经 `logEvent` 记一行，含原因与轮记录条数，不抛、不改线。

### 关键决策

1. **甲案（槽存检查点）而非乙案（压缩时裁 `turns`）**：`turns` 是人读回查的权威面，裁掉即永久丢失被摘要轮的原文；甲案只多一个键，旧槽零回归。用户 2026-11-14 裁定取甲。

2. **在途段单列 `activeRaw`，不由 `contextHistory` 与投影长度做算术差**：那份副本经 `.filter((m) => !m?.transient …)`，长度不等于投影长度，算术差会把 transient 挤出的缺口读成原文。

3. **typed error 复用同一 `kind` 加 `reason`**：CLI ∥ VSC ∥ Desktop 三处渲染面已认 `context_overflow`，新增 kind 要三处同时改；条件相同、处置不同，用 `reason` 分更省。

4. **覆盖以轮记录为单位，切一半不算覆盖**：宁可恢复多装一轮，也不把半轮当整轮——半轮会让模型看到一条没有请求的回复。

5. **`changedDocs` 只给路径不给理由**：模型自述的理由会成为第二个事实源，与设计档的写法分叉，读的人分不清哪份是当轮的判断。

### 边界（本批不做）

- 人读线、sidecar、`read_history`、`_fullHistory` 一字不动；双线共享消息对象不原地改写。
- 旧槽（无 `turns`）回退整条不变；新键缺失等同无压缩、无在途段。
- 不改压缩触发公式、切割公式、阈值自动派生与 `/compact` 命令面。
- 不改 `_turnResponseEnd` 的采集时点与 `registerCompletedTurn` 的登记条件。
- 不新增错误 kind，不新增渲染面，不新增命令。
- 台账 #2396 的三条非阻塞发现不在本批（用户 §1 边界）。

### 受影响文件（机读清单）

| 档 | 分拆方案 | 行数 |
|---|---|---|
| thincoder-core/agent/turn-projection.mjs | 拆档后三面：折叠 ∥ 投影 ∥ 恢复 + 装配接缝（四块已搬出，见下「分拆」） | 318 |
| thincoder-core/agent/turn-task-state.mjs | 搬入处：轮事实账本 ∥ taskState 组装 ∥ 状态串渲染 ∥ 成败取形 | 265 |
| thincoder-core/context.mjs | — | 292 |
| thincoder-core/agent/run-stages.mjs | — | 361 |
| thincoder-core/token-window.mjs | — | 285 |
| thincoder-core/provider/errors.mjs | — | 175 |
| thincoder-core/agent-tools/context.mjs | — | 184 |
| thincoder-core/session.mjs | — | 286 |
| thincoder-core/session-lifecycle.mjs | — | 445 |
| thincoder-core/agent/setup-reminders.mjs | — | 257 |
| test/integration/fixtures/anthropic-endpoint.mjs | — | 131 |
| test/integration/turn-history-projection.test.mjs | — | 116 |
| docs/batches/2026-11-14-turn-projection-recovery.test.mjs | — | 收口删除 |

行数读数：两个「新」行的读数取自拆档落盘后的同尺复量，因为档位结论要读的正是拆后这两个对象——`turn-projection.mjs` 318 ∥ `turn-task-state.mjs` 265（`countContentLines`，`thincoder-core/agent-tools/batch-tier-gate.mjs`）。其余十一行记批起快照基线，取自批档 §1「收口门实测」段。第 3 列全部是同一把尺的同一数，换一把尺量的数与它不互比。

本批单测档 `docs/batches/…recovery.test.mjs` 为本批新建、收口即删，记「收口删除」而不给数。

复量命令形如 `node -e "import('./thincoder-core/agent-tools/batch-tier-gate.mjs')…" <档路径>`，读数是同一把尺的同一数。

`turn-history-projection.test.mjs` 该尺读数 116；原始行数 117（末行为空串）。本表记内容行，不记原始行——两数不可互比。

函数档位先行（标准 `docs/core/standards/CODE-TIER.md` §3「先检查函数，再检查文件」）：本批改动的函数按 node 行扫描（签名行到闭合括号行）读数如下。

| 函数 | 所在档 | 行数 | 处置 |
|---|---|---|---|
| `applyCompression` | `context.mjs` | 77 | 50–100 带，不拆；本批加身份重定一段 |
| `compressIfNeeded` | `context.mjs` | 72 | 50–100 带，不拆；本批加 `fixedFloor` 早退 |
| `runCompactionCheck` | `run-stages.mjs` | 34 | 不拆 |
| `enforceContextFit` | `run-stages.mjs` | 27 | 不拆 |
| `applySession` | `session-lifecycle.mjs` | 139 | ≥100 ⇒ 本批把恢复播种段提成 `seedCompressionState(agent, data, restoredTurns)`，调用点留在 `applySession` 内 |
| `saveSession` | `session.mjs` | 98 | 50–100 带，只加检查点落盘一段，不拆 |

`seedCompressionState` 是新增的独立语义函数：入参 = agent ∥ 槽数据 ∥ 恢复出的轮记录，职责 = 设 `_compactCheckpoint`（键缺不设）并按轮记录重建折叠身份标记。验收「#2399 恢复播种」一行即它的单测面。

档位结论：全部档在 500 行文件线内。批起快照十一档本就在线内；拆档落盘后同尺复量 `turn-projection.mjs` 318 ∥ `turn-task-state.mjs` 265（`countContentLines`），本批无越线档。

### 分拆：`turn-projection.mjs` → `turn-task-state.mjs`（已落盘）

触发与判据撤回：本批实现一度把它写到 553 内容行，本席据此写过分拆方案；复核对基准后撤回那次「越线」判断——标准 §2.1 的基准是修改前长度（批起 411），§2.3 中间态不判，553 是本批自己写出来的中间读数。

分档本身保留（用户 2026-11-14 03:24 裁定「不回退，拆档不是坏事」）：两档边界成立，四块不同职责挤在一档本来也偏紧。落步 = 本批 §5 的补实施轮，已落盘，不推给下一批。

目标档：`thincoder-core/agent/turn-task-state.mjs`。只此一个新档，不新增第三个档。

搬出四块（边界由 §1 定死，本席按符号落实）：

| 块 | 搬去新档的符号 |
|---|---|
| 轮事实账本 | `createTurnLedger` ∥ `noteTurnToolFacts` ∥ `noteTurnRunError`，及其形体常量 `SUMMARY_CAP` ∥ `COMMAND_CAP` ∥ `MAX_VERIFICATION` ∥ `MAX_CHANGED_FILES` ∥ `MAX_EVIDENCE` ∥ `MAX_REMAINING` |
| taskState 组装 | `buildTurnTaskState` 与它独占的取形函数 `changedDocsOf` ∥ `changedPathsOf` ∥ `remainingOf` ∥ `blockedOf` ∥ `evidenceOf` |
| 状态串渲染 | `taskStateText` ∥ `TASK_STATE_MARK` |
| 成败取形 | `VERIFICATION_TOOLS` ∥ `verdictOf` ∥ `parseArgs` ∥ `resultSummary` |

留在 `turn-projection.mjs` 的三面：

- 折叠 — `turnFoldPlan` ∥ `applyTurnFold` ∥ `registerFoldMarks` ∥ `coveredTurnCount`
- 投影 — `buildTurnRecord` ∥ `turnRecordMessages` ∥ `projectTurns`
- 恢复 — `machineLineForSlot` ∥ `activeTurnRaw` ∥ `findTurnStartIndex` ∥ `normalizeSlotTurns` ∥ `slotTurns` ∥ `normalizeCheckpoint` ∥ `harvestActiveRaw` ∥ `restoreMachineFromTurns`
- 装配接缝 — `registerCompletedTurn` ∥ `applyTurnProjection`

归属有争议的三处这样定：

- `str` ∥ `line` ∥ `capText` 随账本块进新档，新档须把它们导出：投影面（`buildTurnRecord` 等）与恢复面（`normalizeSlotTurns` ∥ `normalizeCheckpoint` 都调 `str`）一起从新档 import——同一判据不在两档各留一份，留两份就是改一处漏一处。
- `logsPathOrNull` 留装配面：它只取日志路径这个事实值，不组装状态。

依赖方向单向：`turn-projection.mjs` → `turn-task-state.mjs`。新档不 import 投影面，否则两档成环，拆了等于没拆。

对外契约：搬走的每个符号在 `turn-projection.mjs` 原路径上 re-export，既有 import 一字不改。re-export 是这一步的全部目的——拆档不动调用方。

实读调用点六处（`agent/run-stages.mjs` 不 import 本档）:

- `record-results.mjs` 取 `noteTurnToolFacts`。
- `run-start.mjs` 取 `applyTurnProjection` ∥ `createTurnLedger` ∥ `findTurnStartIndex`。
- `agent.mjs` 取 `registerCompletedTurn` ∥ `noteTurnRunError`——搬走的 `noteTurnRunError` 只在这里。
- `context.mjs` 取 `coveredTurnCount`。
- `session-lifecycle.mjs` 取 `normalizeCheckpoint` ∥ `normalizeSlotTurns` ∥ `restoreMachineFromTurns`。
- `session.mjs` 取 `activeTurnRaw` ∥ `machineLineForSlot` ∥ `normalizeCheckpoint` ∥ `slotTurns`。

拆后文件归属（同一步，三处一次改到新档）：拆档当轮三句归属句必须一起改——不随之改，三句在拆档当轮即成假。前两句属设计档笔、已在收口前设计轮改完；第三句属代码笔、随拆档由实施席改。

- `docs/core/design/CONTEXT-COMPACTION.md` 头注现写「`turn-projection.mjs` 的轮投影（投影 ∥ 折叠 ∥ 恢复三面在 `turn-projection.mjs`，轮事实账本与任务状态组装在 `turn-task-state.mjs`）」。
- 同档 §1.1 两个常量的括注现指 `turn-task-state.mjs`（常量随账本块进新档）。
- `thincoder-core/agent/turn-projection.mjs` 档头现写「三面同尺 + 账本/事实单列」，两档分工与上句同形。

验收（读数见 §5）：两档同尺各 < 500；本批单测与集成 CLI 1-5 ∥ 1-6 全绿；被搬符号从 `turn-projection.mjs` 原路径 import 逐个非 `undefined`。

`test/integration/turn-history-projection.test.mjs` 属产品面（`test/**`），其代码改动已在本批落地：CLI 1-5 改写、CLI 1-6 新增（题名 `test('CLI 1-6 …')`），基线 116 内容行、现 196，仍在 500 行线内。

单测档为本批新建、收口即删。

### 其它改动档（非代码）

`docs/core/design/CONTEXT-COMPACTION.md`（§1.1 ∥ §5 ∥ §6 ∥ §10）· `docs/core/design/SESSION.md`（§2 ∥ §10）· `test/rtm/tooling.md`（CLI 1 节）· 本档 §2。

`test/rtm/tooling.md` 属产品面，由实施席落三处：

- ① CLI 1 节注补「交互组件 ∥ 进入口」两腿（其余各节皆有）——交互组件 = `turn-projection.mjs` 的 `machineLineForSlot` ∥ `activeTurnRaw` ∥ `restoreMachineFromTurns` ⟷ `session-lifecycle.mjs` 的 `applySession` ⟷ 槽 JSON；进入口 = 真 CLI 里压缩后关进程重开同一会话再问一句。
- ② 用例题名按 `test('CLI 1-6 …')` 形落，编号先定、题名后写、同一编号逐字。
- ③ CLI 1-6 行的括注「固定开销吃掉自动压缩线」与本套件「压缩线（1M 窗格的 600K）永远在固定开销之上」相抵，补实施轮改成与实测一致的说法，判据列不动。

### 需求核对（只核对，不改）

依据 `docs/core/requirements/CONTEXT-COMPACTION.md`「机读 history 可摘要、截断或 prune；人读与落盘全史不因此丢失。」

依据 `docs/core/requirements/SESSION.md` §1「会话同时保存跨轮任务状态；恢复机读历史时使用用户请求、最终回复和任务状态，含压缩检查点与没有轮记录可依的在途段，完整工具过程从人读记录按需回查。」

- 五要素：本批是既有模块的机制修正，模块目标 ∥ 边界 ∥ 依赖沿用现需求档，无新功能点需求。
- 恢复成分已由主 agent 落在需求层（2026-11-14，批档 §1）：压缩检查点与在途段都在「恢复机读历史」的成分之内。设计侧把这两项拆成 `compactCheckpoint` 与 `activeRaw` 两段，是本条需求在槽键上的落法，不与需求冲突。
- 「完整工具过程从人读记录按需回查」说的是**已登记轮**的工具过程；在途 ∥ 异常段没有轮记录可依，不在这一句的射程里，按用户 §1 裁定「保存与恢复同尺」处理（设计 `SESSION.md` §2 表 `activeRaw` 行）。
- 需求 §7 的验收枚举已由主 agent 同轮扩入「压缩检查点与在途段恢复」（实读 `docs/core/requirements/SESSION.md` §7 该句），评审第 3 轮 #5 由此收口。
- 需求档其余不动：需要的映射已落在 §1 那一句，设计侧无待主 agent 定的需求项。

### 验收对照

| 条目 | 怎么算过 | 谁读 |
|---|---|---|
| #2397 | 单测「压缩后段边界按身份重定」：压缩前后同一在途轮的切片内容一致；失败侧 = 改造前旧下标在新数组上取到另一条消息 | 实施席 ∥ 评审席 |
| #2397 找不回支 | 单测「起点已进摘要」：让切点落进在途段内部，断言起点 = 注记与占位之后的第一条原文，不抛、不回落到旧下标 | 实施席 |
| #2398 | 单测「固定开销单独越线不压就抛」：断言错误 `kind` ∥ `reason` ∥ 报文三数，且压缩调用次数为 0（失败侧 = 改造前压一次再抛同一错） | 实施席 ∥ 评审席 |
| #2398 强制面 | 单测「`force` 也拦」+「`/compact` 回执同因」：`fixedFloor > limit` 时 `compressIfNeeded` 的 `force` 支 no-op、摘要调用次数 0，`/compact` 回执带同一 `reason` | 实施席 |
| #2399 | 单测「压缩检查点落槽」：`saveSession` 后槽含 `compactCheckpoint`，`note` ∥ `turnsCovered` 与覆盖判据一致；无压缩时键缺 | 实施席 |
| #2399 恢复播种 | 单测「重开后二次压缩」：恢复带检查点的槽后再压一次，`turnsCovered` 从槽里那一段继续数，不重算、不缩回 | 实施席 ∥ 评审席 |
| #2401 | 单测「恢复 = 摘要 + 其后轮次投影 + 在途段」：三段的顺序与来源逐条断言；失败侧 = 改造前在途段为空 | 实施席 ∥ 评审席 |
| #2401 尾端配对 | 单测「孤立调用不装机读线」：在途段尾部为无结果的 `assistant(tool_calls)`、以及前面无调用的 `tool` 消息，装线后都不在机上，且线尾落在用户请求 | 实施席 ∥ 评审席 |
| 边界 | 单测「旧槽无新键回退」：无 `turns` 的槽仍走 `contextHistory` → `history`；无 `compactCheckpoint` 的槽恢复时不设 `_compactCheckpoint` | 实施席 |
| #2400 | 单测「`changedDocs` 只记路径」+「折叠 no-op 记一行」：前者断言字段内容不含理由文本、未注入文档根时字段不出现，后者断言日志出现一次 | 实施席 |
| 文档面 | 读 `CONTEXT-COMPACTION.md` §1.1 ∥ §5 ∥ §6 与 `SESSION.md` §2：每条台账都能找到一句规则句 + 一句理由句，且两份档的恢复次序不冲突（`SESSION.md` §2 为单点，`CONTEXT-COMPACTION.md` §6 只指路） | 评审席 |

单测档 = `docs/batches/2026-11-14-turn-projection-recovery.test.mjs`；命令 = `node --test docs/batches/2026-11-14-turn-projection-recovery.test.mjs`。

### RTM 增量

- **改写** CLI 1-5（跨轮机读投影）：判据补「重开后仍带上一程未登记那一段的原文」。
- **新增** CLI 1-6（压缩检查点恢复）：压缩后重开，机读线以摘要注记开头、其后只装切割点之后的轮记录、压缩不重做。
- **删除** 无。
- 两行证据同指 `test/integration/turn-history-projection.test.mjs`；索引已按 `test/rtm/tooling.md` CLI 1 节落行。

### 最近先例勘察（三问）

- **现成**：`turn-projection.mjs` 的 `machineLineForSlot` ∥ `activeTurnRaw` ∥ `restoreMachineFromTurns`（投影 ∥ 折叠 ∥ 恢复三面与装配接缝；轮事实账本与状态组装在 `turn-task-state.mjs`）；`contextUsage` 的 `overhead` 字段；`logEvent`；`contextOverflowError`。先例批次 = `docs/batches/2026-11-13-turn-history-projection.md`（台账 #2395，本档代码头注明记）：槽 `turns` ∥ 恢复权威顺序 ∥ 折叠身份判据都是那一批落的。
- **现成不可用**：`contextUsage.overhead` 未按估算比缩放，与 `total` 的估算支不同尺 ⇒ 新增 `fixedFloor` 字段，不直接拿 `overhead` 比较。`agent-tools/subagent-design-token.mjs` 的 `changedDocsOf` 同词义但不可用：基线是设计凭证封印（`seal.docHashes`）、逐档读盘算哈希，判的是「相对封印变过」而不是「本轮改过」，与本档零 IO 纪律相反。
- **已查无**：`thincoder-core` 内 `compactCheckpoint` ∥ `fixedFloor` ∥ `_compactCheckpoint` ∥ `_turnFoldMarks` 零命中；`activeRaw` 仅作 `machineLineForSlot` 的形参名存在（`turn-projection.mjs`），槽键为新增。
- **对齐**：沿 `2026-11-13-turn-history-projection` 的三面同尺（保存 ∥ 恢复 ∥ 折叠同一投影函数），只加三段与两个内存载体，不另立第二套投影。

- **偏离（一项，具名 + 持久理由）**：那一批的形状是一档四面同实现（账本 ∥ 投影 ∥ 折叠 ∥ 恢复）；本批把账本、taskState 组装、状态串渲染、成败取形搬进 `turn-task-state.mjs`。理由 = 四块职责与投影三面不同，挤在一档改一处要读四面、档位也偏紧；对外契约由 `turn-projection.mjs` 的 re-export 保持，调用方零改。

### 勘察证据

已查（本轮实读）：两份设计档 `docs/core/design/CONTEXT-COMPACTION.md` ∥ `docs/core/design/SESSION.md`、`test/rtm/tooling.md` CLI 1 节、`test/integration/turn-history-projection.test.mjs` 夹具注。

代码面：`turn-projection.mjs` ∥ `context.mjs` ∥ `agent/run-stages.mjs` ∥ `token-window.mjs` ∥ `session-lifecycle.mjs` ∥ `agent-tools/subagent-design-token.mjs`。相关 = 槽写面与恢复次序、轮投影四面、压缩原子与越窗守卫。

公开源档：manifest `index.publicRepos` 声明的两份（`../.thincoder` ∥ `../thincoder.com`）本机不在盘（读目录 ENOENT），无可查内容——本批判据全在本仓代码与设计面，不依赖它们。

### 数据事实核对

本批不对存量数据断言任何事实（行数、字段填充率、枚举取值皆不涉及）；判据全在代码与文档面。答案 = 无 claim 需读数据。

四条新分支各有来由，场景取自同仓代码与夹具而非数据行：

- #2398 固定开销单独越线：依据 `test/integration/turn-history-projection.test.mjs`「本仓当前固定开销（system + 工具 schema）已超过 128K 窗格模型的请求上限，」——那份夹具正因此改用大窗格模型。复现 = 用 128K 窗格模型的预算跑一次发送前守卫。
- #2397 找不回支：依据 `CONTEXT-COMPACTION.md` §4 的 history 段窗口比例预算——在途段长过该预算时切点落进它内部，起点那条随之进中段，重建后按身份自然找不回。
- 折叠 no-op 支：依据 `CONTEXT-COMPACTION.md` §1.1——轮内被压缩过一次后，轮尾登记的那批消息对象已不在机读线上，下一次安全点的折叠因此定位不到待折段。
- 在途段尾端无结果的调用：依据 `thincoder-core/agent/turn-loop.mjs`「synthesize placeholder tool results BEFORE the interrupt message」——补占位结果只在这一支（Ctrl+I 中断），普通 Stop 落在工具执行中没有它。复现 = 工具执行中按 Ctrl+C，回合异常收尾，`thincoder-cli/src/tui/agent-turn.mjs`「Save session after every turn (survives crashes)」的回合尾保存把 `activeRaw` 落盘，尾即那条没有结果的调用。
- 缺调用的 `tool` 消息：无写侧场景，按槽数据归一处理，不是场景分支。

场景句写在 `CONTEXT-COMPACTION.md` §5 ∥ §1.1 ∥ §6 各自句后；配对收口一支有场景、一支是数据归一，表里没有无来由的分支。

### 上抛项

- **`taskState.objective` 的形态**：用户 2026-11-14 裁定本批只做 #2397–#2401（§4 ∥ §5 已记），形态另起一轮设计裁定；§2 不为它落验收行。
- 需求面的映射已落（§1，2026-11-14）；本席无待主 agent 裁的设计项。

### 第 4 轮修面（评审第 3 轮 8 项 · 设计席落）

| # | 严重度 | 处置（本轮已落） |
|---|---|---|
| 1 | 🔴 | 两支按「一支给场景、一支归数据」落定。`CONTEXT-COMPACTION.md` §6 改写：尾部缺结果的调用有了可复现路径（普通 Stop 落在工具执行中，补占位结果只覆盖 Ctrl+I 中断支，回合尾保存照旧落盘），缺调用的结果改记为槽数据归一；删去失效的 CLI 1-5 引文。§2 机制设计 `activeRaw` 行与「数据事实核对」同步。 |
| 2 | 🟡 | re-export 调用点按实读改六处，删 `run-stages.mjs`，补 `agent.mjs` 的 `noteTurnRunError`。 |
| 3 | 🟡 | 新增「拆后文件归属与理由重述」步（三处归属句逐条写明改法）；「偏离 = 零」改为具名偏离一项 + 持久理由。 |
| 4 | 🟡 | 落步改为「本批 §5 补实施轮」，并写明首轮 §5 未随该轮落地、§5 状态行须回到进行中。 |
| 5 | 🟡 | 需求 §7 已由主 agent 扩入「压缩检查点与在途段恢复」，本席实读核对通过。 |
| 6 | 🟡 | 「含未登记就结束的轮」宽于实现：已登记 #2403，本批不动实现语义。 |
| 7 | 🔵 | 新档须导出 `str`，投影面与恢复面一并从新档 import（`normalizeSlotTurns` ∥ `normalizeCheckpoint` 也调它）。 |
| 8 | 🔵 | CLI 1-6 括注相抵：列入补实施轮三处之一，判据列不动。 |

设计档本轮实改：`docs/core/design/CONTEXT-COMPACTION.md` §6（配对收口两支的来由与场景）。`docs/core/design/SESSION.md` 本轮零改：配对规则单点在 `CONTEXT-COMPACTION.md` §6，§2 的 `activeRaw` 行与 §10 验收枚举仍与实现同形。

## §3 设计评审（评审子代理）
**状态行**：评审通过



### 轮次 1（评审子代理）

| # | 严重度 | 状态 | 证据指针 |
|---|---|---|---|
| 1 | 🔴 | 待处理 | 槽检查点形状两说：`thincoder/docs/core/design/SESSION.md` §2 表 `compactCheckpoint` 行「压缩摘要注记原文 + 它已覆盖的前若干条轮记录」，`thincoder/docs/core/design/CONTEXT-COMPACTION.md` §6 同句式；批档 §2「机制设计」作「`compactCheckpoint` = `{ note, turnsCovered }`」，验收 #2399 断言的字段名 `turnsCovered` 两档设计皆未定义；`activeRaw` 的 transient 处置亦只在批档「丢弃 `transient` 标记消息」 |
| 2 | 🔴 | 待处理 | 恢复→保存回写腿缺失：`thincoder/docs/core/design/SESSION.md` §2「applySession 的恢复权威顺序」只写机读线拼法，未写把检查点与折叠身份标记播种回 `agent._compactCheckpoint` / `agent._turnFoldMarks`；而批档 §2「`turnsCovered` 在压缩当刻按轮记录算」⇒ 重启后二次压缩只见到重启后的轮，覆盖条数被覆盖写 |
| 3 | 🔴 | 待处理 | 在途段尾端配对无规则：`thincoder-core/agent/turn-projection.mjs` `activeTurnRaw` 注释「**原样保留**（不折叠也不丢）」；`thincoder/docs/core/design/CONTEXT-COMPACTION.md` §6「恢复读取时归并病态相邻 assistant，tool_calls 配对优先」只覆盖回声归并、未覆盖尾端孤立 `assistant(tool_calls)`；需求 `CONTEXT-COMPACTION.md` §2「不能留下孤立 tool 结果」；场景 = `thincoder/test/rtm/tooling.md` CLI 1-5「回合中途关进程重开同一会话」 |
| 4 | 🔴 | 待处理 | #2398 分支无场景（6b）：批档 §2「数据事实核对」「本批不对存量数据断言任何事实」，验收 #2398 失败侧「改造前压一次再抛同一错」是当前行为而非场景；同仓可引观测 = `thincoder/test/integration/turn-history-projection.test.mjs` 夹具注释「本仓当前固定开销（system + 工具 schema）已超过 128K 窗格模型的请求上限」 |
| 5 | 🟡 | 建议 | 另两条新分支同样无场景（6b）：`CONTEXT-COMPACTION.md` §1.1「找不回（该条已进摘要）」与「折叠在安全点的 no-op 也要留痕」；可达性目前只由 `turn-projection.mjs` `turnFoldPlan` 注释「消息已被压缩摘要吞掉」担着 |
| 6 | 🟡 | 建议 | 验收缺两项：`CONTEXT-COMPACTION.md` §5「`/compact` 面按 no-op 回执报同一原因」与 §1.1「找不回」支，在批档 §2「验收对照」无对应行 |
| 7 | 🟡 | 建议 | 批档 §2「RTM 增量」「两行证据同指 `test/integration/turn-history-projection.test.mjs`」——该档盘上已在（117 行），本批须改 1-5、加 1-6，却不在「受影响文件（机读清单）」，无基线行数与档位结论，也未写其代码是否在本批落地 |
| 8 | 🟡 | 建议 | 机读清单「分拆方案」列全为「—」，结论行只读文件行数（「全部在 500 行线内，本批不触分拆」）；CODE-TIER §3 函数档位在前，`applyCompression` ∥ `enforceContextFit` ∥ `applySession`·`saveSession` 无函数长度读数 |
| 9 | 🟡 | 建议 | 批档 §2「最近先例勘察（三问）」只给实现坐标与现成三态，无先例批次坐标、无对齐 ∥ 偏离理由；「对齐 = …」句只在两份设计档头注 |
| 10 | 🟡 | 建议 | 批档 §2 无勘察证据行（查了哪些公开 ∥ 独立源码档、是否相关）；设计档头「勘察证据」只列本仓文档 |
| 11 | 🟡 | 建议 | `thincoder/test/rtm/tooling.md` CLI 1 节注有「回指 = …」与六态，缺「交互组件 ∥ 进入口」两腿（CLI 41 ∥ 43 ∥ 46 ∥ 49 节皆有）；新增 1-6 的题名形 `test('CLI 1-6 …')` 未在任何一档固定 |
| 12 | 🟡 | 建议 | 需求面未随同改：`thincoder/docs/core/requirements/SESSION.md` §1「恢复机读历史时使用用户请求、最终回复和任务状态，完整工具过程从人读记录按需回查」；批档 §2「需求核对」「需求档本批不改」（R7b 设计层胜，仅报） |
| 13 | 🔵 | 建议 | 批档 §2「已查无」把 `changedDocsOf`（`thincoder/thincoder-core/agent-tools/subagent-design-token.mjs`，注释「只服务报面」、逐档读盘做封印哈希差）记作「不冲突」，未取「existing but unusable: …」形并给不可用理由 |
| 14 | 🔵 | 建议 | `facts.docRoots` 注入面只在批档 §2「`facts.docRoots`（调用方注入的设计 ∥ 需求文档根）过滤 `_touchedFiles`」；拥有 `taskState` 的设计档未定「未注入时 `changedDocs` 为何值」 |

VERDICT: changes-required

计数：🔴 4 · 🟡 8 · 🔵 2（共 14 项）。档位抽查：`turn-projection.mjs` 实测 412 行（记 411）、`session-lifecycle.mjs` 实测 445 行（记 445），清单内各档均 ≤ 500，§2 结论行成立。

### 轮次 2（评审子代理）

| # | 上轮严重度 | 本轮状态 | 证据指针（本轮实读） |
|---|---|---|---|
| 1 | 🔴 | 已落实 | `thincoder/docs/core/design/SESSION.md` §2 表改作「`compactCheckpoint` = `{ note, turnsCovered }`」「`turnsCovered` = 已覆盖的轮记录条数」，`activeRaw` 行补「`transient` 标记的消息落槽前丢弃（与 `contextHistory` 的过滤口径同一条）」；`thincoder/docs/core/design/CONTEXT-COMPACTION.md` §6「键形 `compactCheckpoint` = `{ note, turnsCovered }` 与在途段的写面归 `SESSION.md` §2」；批档 §2 机制设计同形 |
| 2 | 🔴 | 已落实 | `thincoder/docs/core/design/SESSION.md` §2「恢复也把压缩状态播种回 agent」「`agent._compactCheckpoint` = 槽里的 `compactCheckpoint`」「折叠身份标记按恢复出的轮记录重建」；批档 §2 机制设计同句 + 函数档表新增 `seedCompressionState` + 验收「#2399 恢复播种」行 |
| 3 | 🔴 | 已落实 | `thincoder/docs/core/design/CONTEXT-COMPACTION.md` §6「恢复装线前还要做一次配对收口」；批档 §2 机制设计 `activeRaw` 读面「收口落在 `restoreMachineFromTurns` 内」+ 验收「#2401 尾端配对」行；`SESSION.md` §10「在途段尾端配对」 |
| 4 | 🔴 | 已落实 | `thincoder/docs/core/design/CONTEXT-COMPACTION.md` §5「这一格不是假想：本仓自己的固定开销就已越过 128K 窗格模型的请求上限」；批档 §2 数据事实核对给复现「用 128K 窗格模型的预算跑一次发送前守卫」；引文在 `thincoder/test/integration/turn-history-projection.test.mjs` 夹具注实测存在 |
| 5 | 🟡 | 已落实 | `CONTEXT-COMPACTION.md` §1.1「找不回不是假想：尾部受 history 段窗口比例预算约束（§4）」∥「可达场景 = 轮内被压缩过一次」；批档 §2 数据事实核对逐条列三条分支场景 |
| 6 | 🟡 | 已落实 | 批档 §2 验收对照新增「#2397 找不回支」∥「#2398 强制面」（`/compact` 回执带同一 `reason`） |
| 7 | 🟡 | 已落实 | 批档 §2 机读清单新增 `| test/integration/turn-history-projection.test.mjs | — | 116 |`，并写「其代码改动在本批落地」与 116 ∥ 117 两尺说明；实测末行 116 相符 |
| 8 | 🟡 | 已落实 | 批档 §2「函数档位先行」表六个函数逐一来读数与处置（`applySession` ≥100 ⇒ 提 `seedCompressionState`） |
| 9 | 🟡 | 已落实 | 批档 §2 最近先例勘察「先例批次 = `docs/batches/2026-11-13-turn-history-projection.md`」∥「偏离 = 零。」 |
| 10 | 🟡 | 已落实 | 批档 §2 勘察证据行「公开源档：manifest `index.publicRepos` 声明的两份」（本机不在盘、无可查内容，已声明） |
| 11 | 🟡 | 已接受（转 §5 落） | 批档 §2 其它改动档把两腿与题名形写死：「① CLI 1 节注补「交互组件 ∥ 进入口」两腿」+「题名按 `test('CLI 1-6 …')` 形落」；`thincoder/test/rtm/tooling.md` CLI 1 节注本轮仍是「回指 = …；六态（行序）= …」，两条腿随实施席落地 |
| 12 | 🟡 | 已落实 | `thincoder/docs/core/requirements/SESSION.md` §1 现写「含压缩检查点与没有轮记录可依的在途段」；批档 §1 记该句已由主 agent 落，§2 需求核对改述为「已落」 |
| 13 | 🔵 | 已落实 | 批档 §2 现成不可用行「`changedDocsOf` 同词义但不可用：基线是设计凭证封印（`seal.docHashes`）、逐档读盘算哈希」 |
| 14 | 🔵 | 已落实 | `CONTEXT-COMPACTION.md` §1.1 `changedDocs` 行「未声明文档根 ⇒ 该字段不出现，不写空数组」；验收「未注入文档根时字段不出现」 |
| N1 (new) | 🟡 | 建议 | 批档 §1 两条已定决定把 `taskState.objective` 重复并入本批、并写「口径待本批设计裁定：是回到短形态」与「验收补对应行」；§2 全节无 `objective` 一句，上抛项仍记「无阻塞项，设计与实施可继续」——建议在 §2 落一句裁定与一行验收，或由主 agent 明示移出本批 |
| N2 (new) | 🔵 | 建议 | `thincoder/docs/core/requirements/SESSION.md` §7 验收枚举「验证跨端恢复、活槽互斥、三态探测、拒绝零副作用、双线恢复、任务状态恢复、sidecar 对账、索引回退、盘面列表、摘要自愈、GC 和偏好。」未随 §1 新增的压缩检查点 ∥ 在途段扩展 |

VERDICT: pass

计数：上轮 14 条 = 13 已落实 + 1 已接受（🟡，转 §5 落）；新增 🟡 1 · 🔵 1（均建议，不阻）。复核读数：`thincoder-core/agent/turn-projection.mjs` 末行 409、`test/integration/turn-history-projection.test.mjs` 末行 116，与 §2 行数列相符，档位结论行「八个档全部在 500 行文件线内」成立。无未决 🔴。

### 轮次 3（评审子代理）

> 状态行重置：第 3 轮打回（changes-required）· 上一轮状态行 = 评审通过 → 进行中 · 2026-11-14

| # | 严重度 | 状态 | 证据指针 |
|---|---|---|---|
| 1 | 🔴 | 待处理 | 配对收口两支既无场景、其唯一引文也已失效：`design/CONTEXT-COMPACTION.md` §6「进程在「模型已发出工具调用、结果还没回到线上」之间被杀就是这一格（`test/rtm/tooling.md` CLI 1-5「回合中途关进程重开同一会话」）」；`test/rtm/tooling.md` CLI 1-5 现写「第二轮的工具结果回来后上游拒掉那次请求（该轮不登记、进程仍在），随关进程重开同一会话再问一句」，且该行断言「未登记那一段的工具结果原文应仍在」（完整结果收尾 ⇒ ①∥② 都不触发）；§5「落地核对」自记「「回合中途关进程」那一格没有落盘点（进程被杀就没有保存，槽里不会有在途段）」；§2「数据事实核对」却写「表里没有第四条无场景分支」 |
| 2 | 🟡 | 建议 | §2「分拆方案」re-export 依据「既有 import（`record-results.mjs` ∥ `run-start.mjs` ∥ `run-stages.mjs` 等调用点）一字不改」：实读 `agent/run-stages.mjs` 无 turn-projection import；搬出符号 `noteTurnRunError` 的真实调用方 `agent.mjs` 未列 |
| 3 | 🟡 | 建议 | 拆后两处文件归属句成假、方案无修订步：`design/CONTEXT-COMPACTION.md` §1.1「`SUMMARY_CAP` ∥ `COMMAND_CAP`（`turn-projection.mjs`）」、头注「`turn-projection.mjs` 的轮投影（账本 ∥ 事实 ∥ 折叠 ∥ 恢复四面同一实现）」、`turn-projection.mjs` 头注「四个面同一份实现」；§2「最近先例勘察」仍记「偏离 = 零。」 |
| 4 | 🟡 | 建议 | 落步与实施状态不自洽：§2「落步 = 本批 §5，不推到下一批」，§5 状态行「实施完成」无该行；`thincoder-core/agent/turn-task-state.mjs` 盘上不存在；`turn-projection.mjs` 仍 553 行 |
| 5 | 🟡 | 建议 | 需求档验收枚举未随扩展（轮次 2 N2 仍开）：`requirements/SESSION.md` §7「验证跨端恢复、活槽互斥、…、GC 和偏好。」未含压缩检查点 ∥ 在途段 |
| 6 | 🟡 | 建议 | 设计措辞宽于实现（§5 已记新债 #2403）：`design/SESSION.md` §2「含未登记就结束的轮」 |
| 7 | 🔵 | 记录 | §2「投影面从新档 import」写窄：恢复面 `normalizeSlotTurns` ∥ `normalizeCheckpoint` 亦用 `str`，新档须导出它 |
| 8 | 🔵 | 记录 | `test/rtm/tooling.md` CLI 1-6 括注「固定开销吃掉自动压缩线」与本套件「压缩线（1M 窗格的 600K）永远在固定开销之上」互不相抵 |

VERDICT: changes-required

计数：🔴 1 · 🟡 5 · 🔵 2（共 8 项）。抽查读数（本轮自量）：`turn-projection.mjs` 553（记 411 基线 / 结论行 553 相符）· `session-lifecycle.mjs` 474（记 445）· `turn-history-projection.test.mjs` 197（记 116 基线）。除 `turn-projection.mjs` 外均 ≤ 500，§2 档位结论行对这三档成立。分拆符号盘点实读完整（搬出 24 ∥ 留 18，无遗漏符号），新档与新档之间无环，方案可执行。

### 轮次 4（评审子代理）

| # | 上轮严重度 | 本轮状态 | 证据指针（本轮实读） |
|---|---|---|---|
| 1 | 🔴 | 已落实 | `design/CONTEXT-COMPACTION.md` §6 现写「来由是一次普通的 Stop（Ctrl+C）落在工具执行中」+「回合随即异常收尾，CLI 的回合尾保存照旧落盘（`agent-turn.mjs`「Save session after every turn (survives crashes)」），槽里的在途段尾就是这条没有结果的调用」；失效的 CLI 1-5 引文已删。三处代码引文实读到：`dispatch-run.mjs`「User interrupt (Ctrl+C / Ctrl+I) must propagate, not become a tool error」· `turn-loop.mjs`「synthesize placeholder tool results BEFORE the interrupt message」· `agent-turn.mjs`「Save session after every turn (survives crashes)」；补占位结果那一段的守卫实读为 `if (signal?.reason?.interrupt)`，「只覆盖 Ctrl+I 支」成立。§2「数据事实核对」给复现「工具执行中按 Ctrl+C」+ 落盘点，末句改作「表里没有无来由的分支」 |
| 2 | 🟡 | 已落实 | §2「实读调用点六处（`agent/run-stages.mjs` 不 import 本档）」：全仓 import 实读恰六档 = `record-results.mjs` ∥ `run-start.mjs` ∥ `agent.mjs`（`noteTurnRunError`）∥ `context.mjs` ∥ `session-lifecycle.mjs` ∥ `session.mjs`，`run-stages.mjs` 零命中 |
| 3 | 🟡 | 已落实 | §2 新增「拆后文件归属与理由重述（同一步，§5 补实施轮落）」三处逐条写明改法；「最近先例勘察」改作「偏离（一项，具名 + 持久理由）」 |
| 4 | 🟡 | 已落实（设计面） | §2「落步 = 本批 §5 的补实施轮，不推到下一批」+ 上抛项「须由 §5 作者把状态行退回进行中，补实施轮拆完再收」。残留 = §5 状态行仍「实施完成」，属 §5 作者的写面（协调项见 N2） |
| 5 | 🟡 | 已落实 | `requirements/SESSION.md` §7 现写「验证跨端恢复、活槽互斥、三态探测、拒绝零副作用、双线恢复、任务状态恢复、压缩检查点与在途段恢复、sidecar 对账…」 |
| 6 | 🟡 | 已接受（记 #2403） | `design/SESSION.md` §2「含未登记就结束的轮」未改，理由 = 实现语义不在本轮修面、新债 #2403 已登记（§6 末行）。措辞宽于实现的账留着，不阻本轮 |
| 7 | 🔵 | 已落实 | §2「`str` ∥ `line` ∥ `capText` 随账本块进新档，新档须把它们导出：投影面（`buildTurnRecord` 等）与恢复面（`normalizeSlotTurns` ∥ `normalizeCheckpoint` 都调 `str`）一起从新档 import」 |
| 8 | 🔵 | 已接受（转补实施轮） | §2「其它改动档」③ 把括注改正列入补实施轮三处之一、判据列不动；`test/rtm/tooling.md` 1-6 现仍写「固定开销吃掉自动压缩线」——具名转手，理由成立 |
| N1 (new) | 🟡 | 建议 | §2 同段自相抵：一处「不推到下一批」、一处「越线档留着不动，下一批一开工就先付这笔」；档位结论行又写「在本批 §5 内拆出 `turn-task-state.mjs`，不推到下一批」——拆档落在本批还是下一批，读者仍有两说 |
| N2 (new) | 🟡 | 建议（协调项） | §5 状态行「实施完成」与 §6「设计评审两轮通过；代码评审 pass，🔴 0。」均未随第 3 轮打回与拆档未落更新；拆档（`turn-task-state.mjs` 仍不在盘、`turn-projection.mjs` 仍 553）在 §5 ∥ §6 无行。父侧/§5 作者补齐即闭合 |

VERDICT: pass

计数：上轮 8 条 = 6 已落实 + 2 已接受；新增 🟡 2（均建议/协调，不阻）。无未决 🔴。档位抽查（本轮自量）：`turn-projection.mjs` 553 · `session-lifecycle.mjs` 474 · `turn-history-projection.test.mjs` 197，§2 结论行对后两档成立；分拆方案符号盘点与单向依赖仍成立，可执行。

### 轮次 5（评审子代理）

第 4 轮（核第 3 轮 8 项修面 · 不重判第 2 轮 14 项与实现语义）

已核落实：#1 两支改写（`CONTEXT-COMPACTION.md` §6 删去 CLI 1-5 引文，给 Stop 场景，第二支改记归一）· #2 六处调用点实读相符（`agent/run-stages.mjs` 零 import）· #3「拆后文件归属与理由重述」步 + 具名偏离已落 · #5 需求 §7 已含「压缩检查点与在途段恢复」· #7 `str` 导出面写明。未核：#6 转 #2403（本轮修面外）· #8 已排补实施轮。

| # | 严重度 | 状态 | 证据指针 |
|---|---|---|---|
| 1 | 🟡 | 建议 | `docs/core/design/CONTEXT-COMPACTION.md` §6「补占位结果的那一段只覆盖 Ctrl+I 的中断支」与代码判据不符：`thincoder-core/agent/turn-loop.mjs` 判的是 `if (signal?.reason?.interrupt) {`，而 `thincoder-cli/src/tui/key-handler-ctrlc.mjs` 写「state.controller.abort({ interrupt: true })」；真判据 = `thincoder-core/agent/dispatch-run.mjs`「if (signal?.aborted) throw error」 |
| 2 | 🟡 | 建议 | 同一支在实现注释里仍是旧场景：`thincoder-core/agent/turn-projection.mjs` `harvestActiveRaw` 注释「（进程死在「模型已发出调用、结果还没回到线上」之间）」vs 批档 §5「「回合中途关进程」那一格没有落盘点（进程被杀就没有保存，槽里不会有在途段）」 |
| 3 | 🟡 | 建议 | 批档 §2「落步 = 本批 §5 的补实施轮，不推到下一批」与同段末「越线档留着不动，下一批一开工就先付这笔」并存（CODE-TIER §2.1「必须在当前工作中给出并实施拆分方案」） |
| 4 | 🟡 | 协调 | 批档 §2「`thincoder-core/agent/turn-task-state.mjs` 盘上不存在，`turn-projection.mjs` 仍在越线读数上」vs §5 状态行「实施完成」∥ §6「单测档按纪律收口删除」；§2 验收「本批单测与集成 CLI 1-5 ∥ 1-6 全绿」所指数档已不在盘 |
| 5 | 🔵 | 建议 | `docs/core/design/SESSION.md` §2「applySession 的恢复权威顺序单点定义如下」三步未指到 `CONTEXT-COMPACTION.md` §6 的装线前配对收口 |
| 6 | 🔵 | 未落（已排补实施轮） | `test/rtm/tooling.md` CLI 1-6「固定开销吃掉自动压缩线，自动阈值触发在本仓跑不到」∥ `test/integration/turn-history-projection.test.mjs` 夹具档头「压缩线（1M 窗格的 600K）永远在固定开销之上」 |

VERDICT: pass

计数：🔴 0 · 🟡 4 · 🔵 2（共 6 项）。

## §4 用户批准（主 agent）

用户 2026-11-14 原话「修。后续自动跑吧，跑完你就开工工具面的修改。」——批准本批五项实施并授权后续按批链自动推进。
用户 2026-11-14 原话「这个，我说并」——`taskState.objective` 重复问题并入本批记录；因设计层未裁定形态，实施轮按未做处理并另起设计轮，已在 §6 记明。

## §5 实施记录（eng-coder）
**状态行**：实施完成（补实施轮（拆档 + 本批自带回归）已交付）



### 交付摘要（#2397–#2401 · 一项按用户裁定不做）

| # | 状态 | 要求 | 落点 |
|---|---|---|---|
| 1 | ✅ Done | #2397 压缩重建后 `_turnStartLen` 按消息身份重定；找不回 ⇒ 注记与占位之后的第一条原文 | `context.mjs` 的 `applyCompression`（函数首记 `inFlightAnchor`、函数尾重定） |
| 2 | ✅ Done | #2398 固定开销单独越线：`fixedFloor` 一处实现、两处消费（守卫抛 typed error ∥ `force` 支 no-op），`/compact` 回执同因 | `token-window.mjs` `contextUsage`；`run-stages.mjs` `enforceContextFit` ∥ `runCompactionCheck`；`context.mjs` `compressIfNeeded`；`provider/errors.mjs` `overheadOverflowError`；`agent-tools/context.mjs` `compactOverheadNote` |
| 3 | ✅ Done | #2399 压缩检查点落槽（`{note, turnsCovered}`，无压缩 ⇒ 键缺）+ 恢复播种（`seedCompressionState`） | `context.mjs` `applyCompression`；`session.mjs` `saveSession`；`session-lifecycle.mjs` `applySession` ∥ `seedCompressionState` ∥ `resetSessionState`；`turn-projection.mjs` `coveredTurnCount` ∥ `registerFoldMarks` |
| 4 | ✅ Done | #2400 `taskState.changedDocs` 只给路径（未声明文档根 ⇒ 字段不出现）+ 折叠 no-op 经 `logEvent` 留一行 | `turn-projection.mjs` `changedDocsOf` ∥ `applyTurnProjection`；`agent/setup-reminders.mjs` 注入 `agent._docRoots` |
| 5 | ✅ Done | #2401 恢复 = 摘要注记 + 其后轮次投影 + 在途段，装线前尾端配对收口 | `turn-projection.mjs` `restoreMachineFromTurns` ∥ `harvestActiveRaw` ∥ `machineLineForSlot`；`session.mjs` 写 `activeRaw` |
| 6 | ❌ 未做 | `taskState.objective` 每轮重复整段请求（§1 已定决定并入本批，用户 2026-11-14 02:33「这个，我说并」） | 用户本轮裁决：**本批不实施**（见本节末「未做项」三段） |
| 7 | ⚠️ Simplified | RTM CLI 1 节：节注补「交互组件 ∥ 进入口」两腿 + 1-5/1-6 行 | `test/rtm/tooling.md` 落地；**1-6 的触发方式与 §2 之外的原文不同**（见「落地核对」），1-5「怎么做」按实际驱动改写 |
| 8 | ✅ Done | 集成档：改写 CLI 1-5、新增 CLI 1-6（题名 `test('CLI 1-6 …')`） | `test/integration/turn-history-projection.test.mjs` |
| 9 | ✅ Done | 单测档 11 例（覆盖 §2「验收对照」11 行） | `docs/batches/2026-11-14-turn-projection-recovery.test.mjs`（**收口即删；本段是它唯一的名单**） |

### 决策与披露

**a. 声明外改动（4 档，逐条给理由）**

| 档 | 为什么必须动 |
|---|---|
| `thincoder-core/provider/errors.mjs` | typed error 家族的单源就在这里（`contextOverflowError` 同一处取 `classifyResponsesErrorCode` 的 kind/retryable）。在调用点就地拼错误会把「kind/retryable 从哪来」变成第二份判据 |
| `thincoder-core/agent-tools/context.mjs` | 回执注记族（`compactNoopNote` ∥ `compactFailureNote`）住在该档，前缀 `CONTEXT_NOTE_PREFIX` 是单源；新注记与本行同族，不能另立前缀 |
| `thincoder-core/agent/setup-reminders.mjs` | `facts.docRoots` 的注入点：manifest 已在该档 mtime 门控读取，同处解析文档根零额外 IO。放进轮投影会破「本档零 IO、不自读 manifest」的纪律 |
| `test/integration/fixtures/anthropic-endpoint.mjs` | 两个夹具旋钮：`callsAt`（按对话请求序号派工具调用——多回合场景要它）∥ `failAt`（回合中途回上游拒——「异常段」场景要它）。夹具与场景分居是既有约定（档头已写理由） |

**b. 设计内自行决定（两处，均已在代码注释写明依据）**

- `resetSessionState` 同步清 `_compactCheckpoint` / `_turnFoldMarks`：`/new` 后旧检查点跟过去会让首回合的机读线被当成「已被摘要覆盖」。
- `changedDocsOf` 比对文档根时在 win32 折大小写：与同族判据同口径（`agent/write-face.mjs` 的 `faceKey`、`doc-check/existence.mjs` 的 `pathKey`），磁盘不区分大小写、字符串区分会静默漏项。

### 验证读数

- 本批单测 + 两例集成：`node --test docs/batches/2026-11-14-turn-projection-recovery.test.mjs test/integration/turn-history-projection.test.mjs` → **13 pass / 0 fail**。
- 改动面回归（守卫 / 压缩 / 恢复 / 模式槽）：`node --test test/integration/context-overflow-guard.test.mjs test/integration/minimal-mode.test.mjs test/integration/context-percent-calibrated.test.mjs test/integration/server-work-mode.test.mjs` → **16 pass / 0 fail**。
- 失败侧实测（不是恒绿）：一次性变异 5 处（`applyCompression` 不重定、守卫不抛、检查点不落、恢复不接在途段、no-op 不记日志）⇒ **9 红 2 绿**（绿的是 U9 旧槽回退、U10 字段面——本就不该被这些变异碰到）；恢复面变异（忽略检查点 + 不接在途段）⇒ 集成 1-5 红在「未登记那一段的用户请求原文应仍在」、1-6 红在「注记是机读线首条」。回滚后 13 绿 / 16 绿如上。
- 映射顺序里先红后绿的现场：单测首跑 8 绿 3 红（U5 槽文件按名猜错、U6 夹具把全部轮覆盖了、U10 分隔符），集成 1-5 首跑红在「已登记轮的工具结果不得再装」——探针选错（`NOTE_BODY` 在已登记轮的最终回复里合法出现），改按调用 id 判后绿。三处都是断言/夹具问题，不是产品面回退。
- 文档面：`doc_check(mode:"gate")` → `DOC-CHECK GATE: PASS`。

### 审计与评审轮次 · 终态

- 内部偏差审计（explore 只读）：1 轮，**findings 6 / 无 🔴**（4 条即上表声明外档；2 条为「半轮不记」缺直接断言 + no-op 日志字段名与 §2 措辞差）。
- 内部代码评审（advisor · code）：1 轮，**🔴 0 · 🟡 3 · 🔵 4，VERDICT pass**。
- 收下的两条：win32 折大小写（🔵）、U6 补「一轮被切开不记」的 `turnsCovered === 1` 断言、1-6 补 system ∥ tools 前缀同形断言（RTM 判据原话）——四处已改，复跑仍全绿。
- 未改而报告的 5 条（都不是本席能自行裁的语义）：`limit < 0` 时新守卫把既有 max_tokens 超窗报文变成不可达（设计面，见下「新债候选」）· `activeRaw` 只覆盖最后一段未登记段，与 `SESSION.md` §2「含未登记就结束的轮」措辞不符（设计面）· RTM 1-6 前缀判据已补断言（已收）· §2「含原因与轮记录条数」与代码记的是消息条数（过程措辞）· 尾部无结果 `assistant(tool_calls)` 整条丢弃时其正文一并丢失，设计档未表态。
- 终态：**clean**（无 🔴；未修项均为设计/记录面，已逐条上抛）。

### 落地核对

**落地核对：无**（设计档 `CONTEXT-COMPACTION.md` §1.1 ∥ §5 ∥ §6 与 `SESSION.md` §2 逐句被实现，无一句被落地弄假）。

RTM 面有一处改写须收口席核：

- `test/rtm/tooling.md` 1-6 行原写「（自动阈值触发）」，本仓**不可达**：该夹具档头自己记着「本套件的固定开销吃掉压缩线 ⇒ 压缩支在三个场景里从不触发」，1M 窗格的压缩线（600K）永远在固定开销之上。
- 本案改由模型主动调用 `context` 工具触发——同一条 `applyCompression`、同一条检查点落槽 / 恢复路，判据列未动。
- 1-5 行的「怎么做」同步改为「第二轮工具结果回来后上游拒掉那次请求（该轮不登记、进程仍在）」：`回合中途关进程` 那一格没有落盘点（进程被杀就没有保存，槽里不会有在途段）。

### 未做项：`taskState.objective` 每轮重复整段请求（用户裁定，非遗漏）

用户本轮裁决原话：「本批只做 #2397–#2401 五项，`taskState.objective` 形态不在本批实施」。按裁定的三条落地要求记录：

1. **状态 = 未做，原因不是实现遗漏**：
   - §2 任务书全节无此条目（覆盖表只有 #2397–#2401 五行，上抛项写「无阻塞项，设计与实施可继续」）。
   - 两份设计档也未定形态：`docs/core/design/CONTEXT-COMPACTION.md` §1.1 表只写「objective / status ｜ 当前任务与运行完成状态」。
   - §1 记着「口径待本批设计裁定：是回到短形态……还是保持全文」，评审 §3 轮次 2 N1 停在「建议 §2 落一句裁定与一行验收」——裁定依据缺失，实施席无据可依。
2. **后续路径**：由单独一轮设计裁定（形态 = 短形态 ∥ 全文；`taskStateText` 是否重复输出该行），**不并入本批任何验收**。
3. **实测现状（给下一轮设计当依据）**：
   - `thincoder-core/agent/turn-projection.mjs` 的 `createTurnLedger` 里 `objective: request || capText(goal?.objective) || null`——本轮请求有内容时 `objective` **恒等于整段请求原文**（`capText` 不截断）。
   - `taskStateText` 的 `if (taskState.objective) rows.push(...)` **每轮重复输出该行**。
   - 本批未动这两行的任何字节。

### 本批新债候选（交父侧裁并登记；本席无台账写面）

1. **`limit < 0` 的处置支被新守卫吞掉**：
   - 现场 = `run-stages.mjs` 的 `enforceContextFit` 里 `if (usage.fixedFloor > budget.limit) throw overheadOverflowError(...)` 排在 `const remedy = budget.limit < 0 ? …` 之前。
   - 而 `fixedFloor` 恒 ≥ 0、`requestBudget` 明写「negative = any prompt overflows」⇒ provider.maxTokens ≥ 窗口那一格永远先抛固定开销错。
   - 后果：既有「max_tokens 单独超窗」报文与建议成为死支，报文头读作「fixed overhead ~N alone exceeds the limit −M」。设计侧未定这一格的优先序。
2. **`activeRaw` 只覆盖最后一段未登记段**：
   - `turn-projection.mjs` 的 `activeTurnRaw` 只切 `history.slice(_turnStartLen)`，而 `run-start.mjs` 在非续跑回合把 `_turnStartLen` 推到新输入上。
   - ⇒「异常轮 + 同一进程里改问一句 + 关进程」这一格，失败那段的原文既不在 `turns` 也不在 `activeRaw`，恢复线装不回来（人读线仍在）。
   - `SESSION.md` §2 的 `activeRaw` 行写「含未登记就结束的轮」，措辞比实现宽：设计侧收窄措辞，或为「已结束未登记段」单列一格。

### 补实施轮（拆档 · 2026-11-14 · eng-coder）

| # | 状态 | 要求（§1 第 4 轮实施面 + 本轮追加） | 落点 |
|---|---|---|---|
| A1 | ✅ Done | ① 按 §2「分拆方案」拆出 `turn-task-state.mjs`，两档同尺各 ≤500 | 搬出四块：账本（`createTurnLedger` ∥ `noteTurnToolFacts` ∥ `noteTurnRunError` + 六个形体常量）· taskState 组装（`buildTurnTaskState` 与其五个取形函数）· 状态串（`taskStateText` ∥ `TASK_STATE_MARK`）· 成败取形（`VERIFICATION_TOOLS` ∥ `verdictOf` ∥ `parseArgs` ∥ `resultSummary`），`str` ∥ `line` ∥ `capText` 随账本块；`turn-projection.mjs` 留折叠 ∥ 投影 ∥ 恢复三面与装配接缝 |
| A2 | ✅ Done | ② 档头「四个面同一份实现」→「三面同尺 + 账本/事实单列」+ 持久理由 | `turn-projection.mjs` 头注；理由 = 四块同住越 500 档位线、投影判据只该有一处 |
| A3 | ✅ Done | ③ RTM CLI 1-6 括注改成自洽读数（判据列不动） | `test/rtm/tooling.md` 1-6「怎么做」列：强制压缩 + 压缩线 600K 在固定开销之上 |
| A4 | ✅ Done | 追加：`harvestActiveRaw` ② 支来由换成「普通 Stop 落在工具执行中」 | 该函数注释引三条实读：`turn-loop.mjs` 的 `pushReal` 先于工具批 · `dispatch-run.mjs`「if (signal?.aborted) throw error」· `agent-turn.mjs`「Save session after every turn (survives crashes)」 |
| A5 | ✅ Done | 追加：夹具档头与 1-6 注释里两句互斥的话对齐 | `fixtures/anthropic-endpoint.mjs` 档头按消费面标出模型档位（128K 档压缩线 76800 在固定开销之下）∥ `turn-history-projection.test.mjs` 1-6 注释标出 1M 档（600K 在开销之上，不触发的原因是历史短） |
| A6 | ✅ Done | 追加（父侧裁决）：本批自带回归 RTM CLI 1-1 ∥ 1-2 ∥ 1-3 本批修 | `test/integration/anthropic-tool-roundtrip.test.mjs` 夹具加 `maxTokens: 4096`，判据与断言零改（详见「本批自带回归」节） |

**读数（命令 + 输出，同一把尺）**

- 尺 = `countContentLines`（`thincoder-core/agent-tools/batch-tier-gate.mjs`），命令形如 `node -e "import('./thincoder-core/agent-tools/batch-tier-gate.mjs').then(m => …countContentLines(fs.readFileSync(档,'utf8')))"`。
- 输出：`turn-projection.mjs countContentLines= 316 | rawLines= 317` · `turn-task-state.mjs countContentLines= 265 | rawLines= 266`。
- 结论：两档都在 500 线下；失败侧读数 = 拆档前同一把尺 553（单测 S2 断言的正是 < 500）。父侧复量得 236 ∥ 221，与本席不同尺，结论一致（两档都在线下），本席不辩数字。
- 本批单测：`node --test docs/batches/2026-11-14-turn-projection-recovery.test.mjs` ⇒ **6 pass / 0 fail**（S1 re-export 逐个非 undefined 且与目标档同一实体 · S2 两档档位 · S3 依赖单向 · S4 记账→轮记录→三条消息 · S5 恢复三段拼法 ∥ 尾端收口 · S6 写向同尺）。
- 集成：`node --test test/integration/turn-history-projection.test.mjs` ⇒ **2 pass / 0 fail**（CLI 1-5 ∥ 1-6，真 CLI + 进程重开）。
- 改动面回归：`context-overflow-guard` ∥ `context-percent-calibrated` ∥ `minimal-mode` ⇒ **15 pass / 0 fail**。
- 跨端消费面：`thincoder-vscode/test/2026-11-06-vsc-turn-save-slots.test.mjs` ⇒ **5 pass / 0 fail**（该档从 `turn-projection.mjs` 取 `TASK_STATE_MARK`，re-export 面被真消费者走到）。
- 单测首跑 4 绿 2 红，两条都是本席断言写错（S3 正则命中头注里的档名、S5 把中间那条带结果的 `assistant(tool_calls)` 当成应收口项）；改断言后全绿，产品面未回退。

### 本批自带回归（RTM CLI 1-1 ∥ 1-2 ∥ 1-3）

**原状**：三行红，报 `context overflow: fixed overhead (system + tools) ~110351 tokens alone exceeds the limit 96000 (window 128000)`，回合请求零发。

**成因**：夹具 `defaultModel: fake-anthropic:claude-fake-1` 未登记 ⇒ 128K 默认 spec + 默认 reserve 32000 ⇒ `limit` 96000；本仓真实固定开销 110351 越过它 ⇒ #2398 的发送前守卫先抛 typed error。

**旧账（更正本席先前的说法）**：这一格在本批之前就是红的——`#2235` 记「`claude-fake-1` 既有红」，2026-11-09 ∥ 10 ∥ 11 三批记录同一档三红，读数为 `context overflow: prompt ~104047 tokens … (limit 96000)`。本批的守卫没让它红，只是把同一条越窗换成了显式报文（报文头从「prompt ~N」变成「fixed overhead ~N」）。

**处置**：夹具 provider 条目加 `maxTokens: 4096`（`scene()` 内）。reserve 4096 ⇒ `limit` 123904 > 固定开销 110351 ⇒ 守卫放行；压缩线仍 = min(123904, 76800) = **76800 < 固定开销** ⇒ 原判据一格不动。

**为什么不是「换大窗格模型」**：该档三条用例各带 `assertFixedOverheadOverLine()`，断的正是「固定开销越过压缩线」这一格（§6.17 可达性门）。换 1M 窗格后压缩线 600K 在固定开销之上，这条前提当场变假，三条「零摘要请求」也就失去所测之物。调小 `max_tokens` 保住同一格。

**与 1-5 ∥ 1-6 的口径**：1-5 ∥ 1-6 判跨轮投影与压缩检查点恢复，不要这一格 ⇒ 它们用 1M 窗格模型；1-1 ∥ 1-2 ∥ 1-3 要的正是 128K 那一格 ⇒ 保持 128K 模型。两处前提各写在各档注释里，都带模型档位。

**未改（逐条对照父侧边界）**：守卫 `enforceContextFit` ∥ `compressIfNeeded` 未动（不放宽、不加豁免）· 判据列与三条断言未动 · `assertFixedOverheadOverLine` 未动 · `defaultModel` 未动。

### 取证（父侧要求）

| 项 | 读数 |
|---|---|
| 修前全量集成 | `# tests 212 / # pass 207 / # fail 5`；失败 = CLI 1-1 ∥ 1-2 ∥ 1-3（`anthropic-tool-roundtrip.test.mjs`）+ CLI 43-1 ∥ 43-2（`doc-anchor-graph.test.mjs`） |
| 修后全量集成（同命令） | `# tests 212 / # pass 210 / # fail 2`；失败仅 CLI 43-1 ∥ 43-2 |
| 命令 | `node --test --test-reporter=tap <test/integration 下全部 .test.mjs>`（TAP 跑法同于 `node --test test/integration/*.test.mjs`；目录形式 Node 24 不认，故逐档展开） |
| 夹具键改动 | `anthropic-tool-roundtrip.test.mjs` 的 `scene()`：`providers[0]` 由 `{ name, baseURL, format, apiKey }` → 加 `maxTokens: 4096`；其余键与断言零改 |
| 为什么不动判据 | 三条用例判的是「工具回放形状 + 无 400」，`maxTokens` 只改请求预算，不碰被观察的行为 |
| 同类扫描 | 全仓 `fake-anthropic:claude-fake-1` 另四档（`acp-work-mode` ∥ `minimal-mode` ∥ `tester-role` ∥ `tool-role-fitting`）修后全绿——它们不走真 CLI 全工具表装配，固定开销在 96000 之下，不在本类 |

### 非本类红（只报不修）

- **CLI 43-1**（`doc-anchor-graph.test.mjs`）：报「第 1 跳须含设计档」——`req:F16` 的 chain 第 1 跳现无设计档。
- **CLI 43-2**（同档）：报「需求档那条须在：按类：cites 48 条（已验存在 48 ∥ 目标不在盘 0 ∥ 判不了存在性 0）」。
- 两行修前修后同红，与本轮改动无关；面属文档锚点图建图（仓内 `docs/**` 现有大量未提交改动 + 本批新批档），本席未动该面，交父侧判。

### 落地核对（补实施轮）

**落地核对：两条设计档归属句被拆档弄假，均属设计档笔（§1 第 4 轮已排给 eng-designer 一轮改），本席未动该档。**

1. `docs/core/design/CONTEXT-COMPACTION.md` 头注「最近先例」段，原句「`turn-projection.mjs` 的轮投影（账本 ∥ 事实 ∥ 折叠 ∥ 恢复四面同一实现）」——账本与事实两面已进 `turn-task-state.mjs`。
2. 同档 §1.1，原句「命令与结果摘要单行折叠到 `SUMMARY_CAP` ∥ `COMMAND_CAP`（`turn-projection.mjs`）」——两个常量随账本块进 `turn-task-state.mjs`。

第三处（`turn-projection.mjs` 档头「四个面同一份实现」）属代码笔，本轮已改到位。

### 本轮审计与评审轮次 · 终态

- 内部偏差审计（explore 只读）：见下条评审合跑 1 轮。
- 内部代码评审（advisor · code）：见交付报告；终态以报告末行为准（本轮为 fix 轮，改动面 = 拆档 + 四处注释 + 一处夹具键）。

### 内部代码评审（补实施轮 · 1 轮 · advisor · code）

VERDICT: **pass**（🔴 0 · 🟡 2 · 🔵 4）。六条 🔵/🟡 里能就地改的四条已改并复跑全绿；两条属设计档笔与父侧裁定，只报告。

| # | 严重度 | 评审所指 | 本轮处置 |
|---|---|---|---|
| 1 | 🟡（建议） | 档头把 `machineLineForSlot` 归进「折叠」面并写成「按消息身份定位本轮原始段」「同函数的非就地投影」——该符号入参是轮记录 ∥ 检查点 ∥ 在途段，不做身份定位，设计 §2 把它列在恢复面 | 已改：折叠条只留 `turnFoldPlan` ∥ `applyTurnFold` ∥ `registerFoldMarks`；`machineLineForSlot` 与 `restoreMachineFromTurns` 同列「恢复」并写明「同一段拼法的写向 ∥ 读向」 |
| 2 | 🔵 | 「三面同尺」漏掉装配接缝（`registerCompletedTurn` ∥ `applyTurnProjection`） | 已改：三面之后补一行装配接缝 |
| 3 | 🔵 | 夹具注释的行号锚已漂：`context.mjs:20` 现指向一条 `import` 行 | 已改：改按符号锚（`SUMMARIZE_PROMPT` 首句） |
| 4 | 🔵 | 前提断言 `requestBudget({ model: "claude-fake-1" })` 不带本批新加的 `maxTokens`，量的不是被配置的那一格 | 已改：按配置档复算（`{ model, format, maxTokens }`），门槛仍 76800 |
| 5 | 🔵 | 单测 `MOVED` 注释说「全部符号」而只列 6 个；`str` ∥ `line` ∥ `capText` 未从旧路径 re-export 与 §2「对外契约」字面不符 | 已改：注释改称「外部消费面六个符号」+ 新增 S1b 断言新档导出那三个取字符串（无外部调用方，实读零命中） |
| 6 | 🔵 | 1-5 的探针 `note.txt"` 依赖 JSON 序列化形状（任务状态行以该串收尾会被误命中） | 已改：改判结构串 `"input":{"path":"note.txt"}` |
| 7 | 🟡（协调） | §2「越线档留着不动，下一批一开工就先付这笔」与盘面相反（分拆已落） | 属 §2 设计档笔，本席无该段写面；已在交付报告上抛，设计席一轮改 |
| 8 | 🟡（协调） | 收口门要求一次集成全绿，而全量为 210/212（两红为 `doc-anchor-graph` 的 43-1 ∥ 43-2，不在本批改动面） | 非本类红，交父侧在 §6 定归属口径；本席未动该面 |

**评审后复量（终态读数）**

- 尺同上（`countContentLines`）：`turn-projection.mjs` **318**（评审 #1 ∥ #2 的头注修正 +2）· `turn-task-state.mjs` **265**，两档仍在 500 线下。
- 单测（含新增 S1b）：`node --test docs/batches/2026-11-14-turn-projection-recovery.test.mjs` ⇒ **7 pass / 0 fail**。
- 集成：`turn-history-projection.test.mjs` ⇒ **2 pass / 0 fail**；`anthropic-tool-roundtrip.test.mjs` ⇒ **3 pass / 0 fail**。
- 全量集成（终态）：`# tests 212 / # pass 210 / # fail 2`，两红 = CLI 43-1 ∥ CLI 43-2（非本类，见上节）。

**终态：clean**（🔴 0；两条协调项均为设计档笔与父侧裁定，已在报告逐条上抛）。

## §6 验证与收口（父代理）

验收 = 父侧本轮复跑：批内单测 7/7（S1–S7）· 集成 CLI 1-5 ∥ 1-6 共 2/2 · CLI 1-1 ∥ 1-2 ∥ 1-3 共 3/3 · 全量集成 212 例 210 绿 2 红。两红 = CLI 43-1 ∥ CLI 43-2，修前修后同红，归属 `DOC-GRAPH` 重写（#2404），不在本批改动面；收口门因此不写「全绿」。

落地核对 = 拆档把三处设计句弄假，已由设计席改正：`CONTEXT-COMPACTION.md` 头注改作「三面在 `turn-projection.mjs`，轮事实账本与任务状态组装在 `turn-task-state.mjs`」；同档 §1.1 两个常量括注改指新档；`SESSION.md` §2 恢复次序第 1 步补 §6 装线前收口指路。

偏离 ①② = RTM CLI 1-6 驱动由自动阈值改 `context` 工具触发，判据列未动；拆档 553 → 318 ∥ 265（`countContentLines` 同尺），用户 2026-11-14 裁定「不回退，拆档不是坏事」。

偏离 ③④ = 夹具三例加 `maxTokens: 4096`，`assertFixedOverheadOverLine` 与三条断言零改；声明外五档（provider/errors ∥ agent-tools/context ∥ agent/setup-reminders ∥ fixtures/anthropic-endpoint ∥ anthropic-tool-roundtrip.test）。

单测档按纪律收口删除（`docs/batches/2026-11-14-turn-projection-recovery.test.mjs` 已删，读数留本节与 §5）。设计评审 5 轮（第 3 轮 changes-required，第 4、5 轮 pass）；代码评审 pass，🔴 0。

未做 = `taskState.objective` 每轮重复整段请求（#2405）：用户并入本批，但设计层未裁定形态，实施轮按未做处理，不计入本批验收。

集成增量 = 对照 `test/RTM.md` CLI 1 节：改写 CLI 1-5、新增 CLI 1-6，共 2 例，均在 212 例全量内；全套 212 例已超 50–100 窗口，属既有存量，本批未新增其他用例。

本批新债 4 条 = #2402（`limit<0` 时守序）· #2403（异常轮后失败段无恢复源）· #2404（DOC-GRAPH 重写后 43-1 ∥ 43-2 长红）· #2405（objective 恒等整段请求）。

收口同步 = §2 ↔ 设计档：机读清单 318 ∥ 265 与两份设计档归属句一致；§2 ↔ §5：补实施轮 A1–A6 与本节读数一致；用户可见面未变（机读线只在请求内部，人读线与各端呈现不动）；暂缓批复核：无。
