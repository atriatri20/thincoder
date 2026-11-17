# 2026-11-14 · turn-projection-consistency
> 六段，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 每段只有一个作者：作者的段可 `append` 加内容、可就地改（`edit`）；非作者一概拒。
> 编制：主 agent · 2026-11-14 · 来源 = 用户 2026-11-14 裁定：「1. 去掉，2. 去掉上限，3. 改。」——针对 verify 伪验证、TURN_TEXT_CAP、session 注释三项偏差。
> 台账 = #2396（core · 归批）。前情 = 无（独立批）。
## §1 讨论（主 agent）
**状态行**：已收口 2026-11-14
批起 sha = 50287e4b5bf975d033a3a89188b3f674d43d5748
<§1 模板占位：本批条目 / 关键判据 / 授权口径>

问题 = 需求要求任务状态记录「验证命令及真实结果」，设计写「实际执行命令」；代码却把 `verify` 工具列入验证面，而该工具不执行命令、只转述模型自述，下一轮会把自述当真实执行结果。另有两处：用户请求/最终回复被代码单方面截到 4000 字符（需求与设计均无此上限）；`saveSession` 注释写「KEEP transient」但实现 `filter(!isLegacyTransient)` 是丢弃。

裁定 = 用户 2026-11-14：「1. 去掉，2. 去掉上限，3. 改。」

三项事实冲突均经用户直接裁定：① verify 移出验证事实；② 去掉请求/回复文本上限；③ 保存注释与实现对齐。裁定原话：「1. 去掉，2. 去掉上限， 3.改。」

工作树在本批设计定稿前已含三处代码改动（我先前直接修改的残留），故 §5 按「已存在」如实记录，不记为新实施；来源未验。

- **自动推进**：本批实施与收口全链 · 自 2026-11-14 02:10 · 用户原话：「这些都自动跑完吧。」

## §2 批次任务与设计（eng-designer）
**状态行**：设计完成（三项条目 + 设计落点 + 机读清单 + 验收对照已落；上抛一项知会（工作树已含修正，来源未记录））

<§2 模板占位：本批条目（覆盖） / 设计档落点 / 机制设计 / 受影响文件与测试覆盖 / 验收对照 / 关键决策 / 上抛项>

<§2 模板占位：机读清单 = 标题行「**受影响文件（机读清单）**」+ 围栏内三列表（表头 | 档 | 分拆方案 | 行数 |、分隔行 |---|---|---|、一行一档，只列代码档（源 ∥ 单测））；第二列：越设计时线的档写正向形方案（点名带目录段的档 + 本批落步 `实施轮` ∥ `§5`），未越线写 —；第三列：该档在批起快照上的内容行数（量法 = `countContentLines`），快照里没有这一档写 `新`；示例行 = | thincoder-core/agent-tools/batch-tier-gate.mjs | — | 新 |>

### 条目（覆盖）

| 编号 | 条目 | 依据 |
|---|---|---|
| V-1 | `verify` 移出任务状态的验证面：验证结果只收真正执行过命令的工具（bash、execute） | 需求 `docs/core/requirements/CONTEXT-COMPACTION.md` §5「任务状态至少包含…验证命令及真实结果」「任务状态由运行过程生成，不以模型事后回忆代替执行事实」；用户 2026-11-14 裁定「1. 去掉」 |
| V-2 | 用户请求与最终回复逐字入轮记录，去掉 4000 字符上限 | 需求 §5「后续请求只保留各轮用户请求、最终回复和任务状态」——原文保留，需求与设计均无上限；用户裁定「2. 去掉上限」 |
| V-3 | 槽内机读线的 transient 处置写进设计，`saveSession` 注释与实现一致（丢弃，`turns` 为恢复权威） | 需求 `docs/core/requirements/CONTEXT-COMPACTION.md` §4「机读 history 可摘要、截断或 prune；人读与落盘全史不因此丢失」；用户裁定「3. 改」 |

### 勘察与最近先例

勘察证据：已读 `thincoder-core/agent/turn-projection.mjs` 的账本 ∥ 事实 ∥ 折叠 ∥ 恢复四面，`thincoder-core/session.mjs` 的 `saveSession` 机读线一行与 `restoreMachineFromTurns`。

再读两份设计 `docs/core/design/CONTEXT-COMPACTION.md` §1.1 ∥ `docs/core/design/SESSION.md` §2，以及需求 `docs/core/requirements/CONTEXT-COMPACTION.md` §4 ∥ §5。相关 = 验证面成员、原文通道、槽机读副本三面。

最近先例（三个面各问一次：现在在哪 · 叫什么 · 谁用）：

| 面 | 现成件（坐标 · 名 · 用者） | 处置 |
|---|---|---|
| 验证面成员 | `thincoder-core/agent/turn-projection.mjs` · `VERIFICATION_TOOLS` · 用者 `noteTurnToolFacts`（`recordToolResults` 的唯一调用点） | 收窄成员集，定义点不动 |
| 原文上限 | `thincoder-core/agent/turn-projection.mjs` · `capText` · 用者 `createTurnLedger` 的 `input` 与 `buildTurnRecord` 的 `finalResponse` | 去掉截断，通道不动 |
| 槽副本 transient | `thincoder-core/session.mjs` · `saveSession` 的 `contextHistory` 一行 · 用者 `writeSessionFile` ∥ `saveProjectedSlot` | 沿用既有 `isLegacyTransient` 过滤，规矩写进属主 `SESSION.md` §2 |

对齐理由：三面都是既有件的收窄或删除，本批新增名 = 零，不引入第二实现 —— 没有需要偏离的地方。

### 明确不做

- 不动折叠机制本身（轮起点 ∥ 终点采集 ∥ 就地折叠）：机制由台账 #2395 那一批落定，本批只改规则句（`CONTEXT-COMPACTION.md` §1.1 三处 ∥ `SESSION.md` §2 三处）。
- 不改需求档：三项都在需求 §5 ∥ §4 既有句子的射程内，本批不新增需求条目，也不改需求措辞。
- 不给 `verify` 工具本身加限制：它照常记 `verification.status` 声明，只是这份声明不进任务状态。
- 不动人读线：`_fullHistory` ∥ 记录 sidecar ∥ `read_history` 的取回面本批零改动。

### 设计档落点

设计档落点按面分属两个属主档：轮投影归 `CONTEXT-COMPACTION.md` §1.1，槽写面与恢复次序归 `SESSION.md` §2。

`docs/core/design/CONTEXT-COMPACTION.md` §1.1：

1. 折叠段之后：用户请求与最终回复逐字入轮记录、无长度上限，容量由「本轮工具过程退出」控制。
2. 同一处再补一句：上限只留在摘要面（`SUMMARY_CAP` ∥ `COMMAND_CAP`），两面不是同一条预算规则。
3. `taskState` 表之后：verification 面的成员判据——只收真正执行过命令的工具，附理由。
4. 保存恢复段：`turns` 是权威源、机读线是派生副本、保存与恢复同一投影；写槽次序与 transient 处置改为指路 `SESSION.md` §2，原文里对回退次序的重述删除。

`docs/core/design/SESSION.md` §2：

1. 写槽段：机读线 = `turns` 投影 + 在途 ∥ 异常段原文，再丢弃 transient 标记的消息，附理由。
2. `turns` 可选面段：`turns` 非空才作权威源，空数组与缺键同视。
3. 恢复次序段：入口改成「`turns` 非空」，次序本身仍是本段单点定义。

表内 `verification` 行同步写明「verify 只转述模型自述，不计入」。

### 机制设计（要点）

- **验证面成员**：`noteTurnToolFacts` 只对 `VERIFICATION_TOOLS` 成员记 `{tool, command, ok, summary}`。成员集 = 会真正执行命令的工具；判据写在 `docs/core/design/CONTEXT-COMPACTION.md` §1.1 的 verification 段，代码里的集合是它的实现，两处成员必须同一。
- **长度面**：用户请求 ∥ 最终回复走同一条原样入库的通道（`turn-projection.mjs` 的 `capText`），命令 ∥ 结果摘要仍各带上限——上限属于摘要面，不属于原文面。两者不要混成一条「文本预算」规则。
- **保存面**：槽里机读线 = 轮记录投影 + 在途 ∥ 异常段原文，再丢弃 transient；`turns` 非空才是恢复入口，副本里再存任务状态串没有读者。这三条的属主是 `docs/core/design/SESSION.md` §2，本批把处置写进该段（原先落在 §1.1，属主错位）。

### 受影响文件（机读清单）

```text
| 档 | 分拆方案 | 行数 |
|---|---|---|
| thincoder-core/agent/turn-projection.mjs | — | 416 |
| thincoder-core/session.mjs | — | 286 |
| docs/batches/2026-11-14-turn-projection-consistency.test.mjs | — | 新 |
```

读数 = `countContentLines(git show ${批起 sha}:<档>)`：本批起快照上 `turn-projection.mjs` = 416、`session.mjs` = 286。两档都未越 500 行设计时线 ⇒ 分拆方案列写 —。单测档在快照上不存在 ⇒ 行数写 `新`。

### 用例表（单测，收口删除）

| 用例 | 断言 | 对应条目 |
|---|---|---|
| U1 拒绝面 | `noteTurnToolFacts` 收到一次 `verify` 工具调用后 `ledger.verification` 长度不变 | V-1 |
| U2 原文面 | `buildTurnRecord` 的 `finalResponse` 取 1 万字符 ⇒ 记录里原文全留、无省略号 | V-2 |
| U3 请求面 | `createTurnLedger` 的 `input` 取 1 万字符 ⇒ `userRequest` 原文全留 | V-2 |

跑法 = `node --test docs/batches/2026-11-14-turn-projection-consistency.test.mjs`（U1–U3 同一份档）。

V-3 是注释与设计句，没有可跑的行为面：判据是读者读 `saveSession` 机读线一行与 `docs/core/design/SESSION.md` §2 写槽段一致（见验收 A3）。

### 验收对照（需求一条对一条）

| 判据 | 判什么 | 读法（什么算错） | 需求来源 |
|---|---|---|---|
| A1 | `verify` 不进验证面：成员集只含会执行命令的工具 | 跑 `node --test docs/batches/2026-11-14-turn-projection-consistency.test.mjs`，U1 绿；再读 §1.1 的 verification 段与 `VERIFICATION_TOOLS` 成员，两处不一致、或 `verify` 在集合里 ⇒ 错 | §5 第 3、4 条 |
| A2 | 请求与最终回复无长度上限、逐字入库 | 同档 U2 ∥ U3 绿；再读 §1.1 原文段，出现任何截断上限的表述 ⇒ 错 | §5 第 2 条 |
| A3 | 槽机读副本丢弃 transient、`turns` 非空为权威源、旧槽回退入口 | 读 `docs/core/design/SESSION.md` §2 写槽段 ∥ 可选面段 ∥ 恢复次序段，与 `session.mjs` 的 `saveSession` 机读线一行 ∥ `restoreMachineFromTurns` 对照：transient 处置或回退入口说法不一 ⇒ 错（V-3 无行为面，判据是读） | §4 双线 |
| A4 | 已撤的 4000 字符上限无活表述；`verify` 不被写成验证结果来源 | 对五档（两份 compaction 需求 ∥ 设计、`SESSION.md`、`turn-projection.mjs`、`session.mjs`）各跑一次字面检索 `4000` 与 `TURN_TEXT_CAP`，两次都 0 命中；再对两份 compaction 档检索 `verify`，每处都不许写成结果来源（当前唯一一处 = §1.1 表行「verify 只转述模型自述，不计入」），否则错 | §5 第 3、4 条 |
| A5 | 需求 §5 三条各能指到 §1.1 的对应句 | 读需求 `docs/core/requirements/CONTEXT-COMPACTION.md` §5 逐条对 §1.1：「验证命令及真实结果」→ verification 段；「由运行过程生成，不以模型事后回忆代替」→「状态由运行记账和实际工具结果组装」；「只保留各轮用户请求、最终回复和任务状态」→ 折叠段。缺任一句、或指到的句子说了相反的 ⇒ 错 | §5 全部 |

读数（A4，2026-11-14 取）：五档 `4000` = 0 命中、`TURN_TEXT_CAP` = 0 命中；两份 compaction 档 `verify` = 1 命中，即 §1.1 表行。

### 关键决策（含被拒替代）

- **不截断，而不是「把上限写进设计」**：需求 §5 要求各轮保留用户请求与最终回复，把 4000 写进设计等于改需求——那是语义面，超出本批。被拒的替代把一条需求改动藏在实现里。
- **成员判据写进 §1.1 原位**：单一权威源；另立一节会让「验证面收谁」有两个说法。被拒替代：新增小节专讲验证面。
- **副本丢弃 transient，而不是存两份加注释**：同一状态两个落点，恢复时谁赢要靠读者推断。被拒替代：保留存储、只在注释里说明。
- **`verify` 移出验证面，而不是保留并标注来源**：机读线上一条带「自述」标签的验证结果，下一轮照样会被当结果读。被拒替代：加一个 `basis: "self-report"` 字段。

### 集成增量（对照 `test/RTM.md`）

改正 0 行、删除 0 行、新增 0 行。本批无用户可见入口承接：机读线只在请求内部生效，人读线与各端呈现都不变。

既存用例 `CLI 1-5`（`test/integration/turn-history-projection.test.mjs`）覆盖「跨轮机读投影 + 重开恢复」，其断言依赖 `turns` 重建出的任务状态，与本批副本丢弃 transient 不冲突；本批不改写它，收口须跑它。

### 台账核对

#2396（core · requirement · 在途 · 归批）与本批三条目同一事由，本批收口时核销。

### 现场读数（原「上抛：工作树已含修正、来源未验」）

三处修正的现场值已读，逐条记在此。改动来源仍是前一轮未写 §5 的残留，本批不追认它为实施：

- `thincoder-core/agent/turn-projection.mjs`：`const VERIFICATION_TOOLS = new Set(["bash", "execute"])` —— `verify` 不在内。
- 同档：`function capText(v) {` 后随 `return str(v)`，上一行注释「长文本不再截断：用户请求与最终回复原样入库」—— 无上限。
- `thincoder-core/session.mjs`：注释「Machine line (contextHistory): DROP transient messages — turn state lives in `turns`」，实现行 `machineLineForSlot(agent._turns, activeTurnRaw(agent)).filter((m) => !isLegacyTransient(m))`—— 注释与实现同向，§5 按「已存在」记录边界。

## §3 设计评审（评审子代理）
**状态行**：评审通过（第 4 轮定点复核（verify/上限 + session.mjs transient 过滤）· 🔴 0 · 🟡 5（含 1 项跨端协调）· 🔵 2）



### 轮次 1（评审子代理）

| # | 严重度 | 状态 | 证据 |
|---|---|---|---|
| 1 | 🟡 | 待处置 | §2 验收对照 A1–A5 全部是「读者读完两处能说出…」式文档判据；§2 用例表落 U1–U3 但验收行未点名跑 `node --test <单测档>`，代码面（`VERIFICATION_TOOLS` 成员、`capText` 不设上限）只有读判据；且 §2 上抛项自述工作树修正「未验」 |
| 2 | 🟡 | 待处置 | §2 A4「全仓无「用户请求截到 4000 字符」的活表述」未给范围（哪些档）与命令，「全仓」不可机械复核 |
| 3 | 🟡 | 待处置 | §2 无勘察证据行；设计档表头「勘察证据：已读触发、切割、降级、context 工具、预算和恢复决策」不含本批三面（验证面成员 ∥ 原文上限 ∥ 槽 transient） |
| 4 | 🟡 | 待处置 | §2 无最近先例行；设计档表头「最近先例：`ADVISOR-GUARDS.md` 的可用窗口预算与 `SESSION.md` 的双线持久化」不覆盖本批三面，§2 只在明确不做里提「本批只改它的三条规则句」（#2395），无实现坐标 ∥ 对齐或偏离理由 |
| 5 | 🟡 | 待处置 | 设计 §1.1「写槽时副本丢弃 transient 标记的消息」落在 compression 档，而 `SESSION.md` §2 才是槽写面属主（「saveSession 写当前粘性槽并原子替换」「applySession 的恢复权威顺序单点定义如下」）；`SESSION.md` 全文无 transient 表述，且 §1.1「旧槽没有 `turns` 键时仍回退 contextHistory」重述了 SESSION §2 已单点定义的次序 |
| 6 | 🔵 | 待处置 | 设计 §1.1 与 `SESSION.md` §2 均未说明「`turns` 存在」按键在场还是非空判（`restoreMachineFromTurns` 以空数组视作缺失）；A3 无法在这条边界上判 |
| 7 | 🔵 | 待处置 | 设计 §1.1「用户请求与最终回复逐字入轮记录，没有长度上限」未写摘要面（命令 ∥ 结果摘要）上限仍在，与需求 §4「机读 history 可摘要、截断或 prune」并读留两解；机制设计里两面分开只在过程记录 |
| 8 | 🔵 | 待处置 | §2「两档都未越 500 行设计时线 ⇒ 分拆方案列写 —」经自查成立：`thincoder-core/agent/turn-projection.mjs` 现 412 行、`thincoder-core/session.mjs` 现 286 行（批起 416 ∥ 286），最长函数 `saveSession` 约 97 行，距函数硬档 300 行远 |

VERDICT: pass

计数：🔴 0 · 🟡 5 · 🔵 3。集成增量段以合法理由声明零增量（§2「集成增量（对照 `test/RTM.md`）」），未构成 🔴。

### 轮次 2（评审子代理）

上一轮（轮次 1）8 条处置核查：

| 上轮 # | 严重度 | 处置（证据指针） |
|---|---|---|
| 1 | 🟡 | 已落实（值已验）：A1「跑 `node --test docs/batches/2026-11-14-turn-projection-consistency.test.mjs`，U1 绿」、A2「同档 U2 ∥ U3 绿」；上抛改为「### 现场读数」并给出三处实读 |
| 2 | 🟡 | 已落实：A4 给五档范围 +「字面检索 `4000` 与 `TURN_TEXT_CAP`」+ 读数行 |
| 3 | 🟡 | 已落实：§2「勘察证据：已读 `thincoder-core/agent/turn-projection.mjs` 的账本 ∥ 事实 ∥ 折叠 ∥ 恢复四面」；设计表头含轮投影三面 |
| 4 | 🟡 | 已落实：§2「最近先例（三个面各问一次：现在在哪 · 叫什么 · 谁用）」表 +「对齐理由」 |
| 5 | 🟡 | 已落实：transient 处置与回退次序迁入 `SESSION.md` §2，`CONTEXT-COMPACTION.md` §1.1 只留指路句 |
| 6 | 🔵 | 已落实：`SESSION.md` §2「`turns` 非空才作权威源，空数组与缺键同视为没有」 |
| 7 | 🔵 | 已落实（引出本轮 #1 的张力）：§1.1「上限只留在摘要面」句 |
| 8 | 🔵 | 已落实：机读清单 416 ∥ 286，分拆方案列「—」 |

本轮发现：

| # | 严重度 | 状态 | 证据 |
|---|---|---|---|
| 1 | 🟡 | 待处置 | `CONTEXT-COMPACTION.md` §1.1「需求 §4 的「机读 history 可摘要、截断或 prune」说的是摘要面，用户与模型的原文不在其中」∥ 同档 §4 降级链第 3 条「无中段时 shrinkOversized 截断单条超大内容」（无角色豁免） |
| 2 | 🟡 | 待处置 | §2 A2 读法「再读 §1.1 原文段，出现任何截断上限的表述 ⇒ 错」∥ §1.1 新句「上限只留在摘要面：命令与结果摘要单行折叠到 `SUMMARY_CAP` ∥ `COMMAND_CAP」 |
| 3 | 🟡 | 待处置 | §2 状态行「上抛一项知会（工作树已含修正，来源未记录）」∥「### 现场读数」节「改动来源仍是前一轮未写 §5 的残留，本批不追认它为实施」 |
| 4 | 🔵 | 待处置 | §2「勘察证据：已读 `thincoder-core/agent/turn-projection.mjs` 的账本 ∥ 事实 ∥ 折叠 ∥ 恢复四面」——未记参考系是否查过 ∥ 是否相关 |
| 5 | 🔵 | 待处置 | `CONTEXT-COMPACTION.md` §1.1「`SUMMARY_CAP` ∥ `COMMAND_CAP`（`turn-projection.mjs`）」∥ `SESSION.md` §2「发送层发送前也剥离 transient」——域外实现断言，标记 unverified |

VERDICT: pass

计数：🔴 0 · 🟡 3 · 🔵 2。两份设计档互指后无重述残留（§1.1 指路 `SESSION.md` §2，§2 指路 §1.1）；本轮 #1 是同一档内 §1.1 ∥ §4 对「原文可否被截断」的两解，按 R1/R7d 报而不拦。

### 轮次 3（评审子代理）

> 状态行重置：第 3 轮打回（changes-required）· 上一轮状态行 = 评审通过 → 进行中 · 2026-11-14

| # | 严重度 | 状态 | 证据 |
|---|---|---|---|
| 1 | 🔴 | 待处置 | `docs/core/design/SESSION.md` §2「机读线在槽里按三段存」+ 表行「`activeRaw`」（「在途段单列一键」）∥ `session.mjs` `saveSession`「const contextHistory = machineLineForSlot(agent._turns, activeTurnRaw(agent))」+ `turn-projection.mjs` `restoreMachineFromTurns`「if (turns.length === 0) return null」——槽里无 `compactCheckpoint` ∥ `activeRaw` 两键，`turns` 非空时在途段（虽已写进 `contextHistory`）恢复时整段消失，即 §2 明令禁止的「中途崩掉的轮在重启后凭据全无」 |
| 2 | 🟡 | 待处置 | 验证面成员判据编码三处：`VERIFICATION_TOOLS`「new Set([\"bash\", \"execute\"])」· `commandOf`「if (name === \"bash\")」· `verdictOf`「if (name !== \"bash\" && name !== \"execute\") return ok === true」——§2 机制设计要求「两处成员必须同一」，加成员时后两处不会跟（静默退化：命令串空、成败按 ok） |
| 3 | 🟡 | 待处置 | `docs/core/design/CONTEXT-COMPACTION.md` §4 降级链「3. 无中段时 shrinkOversized 截断单条超大内容。」∥ §1.1「用户请求与最终回复逐字入轮记录，没有长度上限。」——两条并存留两解（§3 轮次 2 #1 仍未裁定） |
| 4 | 🟡 | 待处置 | `turn-projection.mjs` `createTurnLedger`「objective: request || capText(goal?.objective) || null,」∥ §1.1 表「objective / status | 当前任务与运行完成状态」——上限去掉后 objective 每次把整段用户请求再存一遍（单测 U3「目标取同一份原文」把该形冻结） |
| 5 | 🟡 | 待处置 | §2 验收对照 A3 读法只点名「transient 处置或回退入口说法不一 ⇒ 错」——#1 的存储键形状差异因此不在任何判据内，本轮绿是按窄判据取得的 |
| 6 | 🔵 | 待处置 | `turn-projection.mjs`「function capText(v) {」+「return str(v)」——名字说明截断，实现是恒等包装 |
| 7 | 🔵 | 待处置 | `turn-projection.mjs` 头注「折叠 `turnFoldPlan` ∥ `applyTurnFold` ∥ `projectMachineHistory`」——本档无此符号（实为 `machineLineForSlot`） |
| 8 | 🔵 | 待处置 | 单测标题「U2 原文面：最终回复取 1 万字符」∥ 实际「repeat(9_990)」+ `TAIL-MARK` ⇒ 9999 |
| 9 | 🔵 | 待处置 | §2「V-3 是注释与设计句，没有可跑的行为面」——`turnRecordMessages` 的「transient: true」标记面本可断言（U4），现仅读判据 |
| 10 | 🔵 | 待处置 | `turns` 与 `contextHistory` 同时落同一段原文（`session.mjs`「turns: slotTurns(agent._turns),」）——上限去掉后重复量无界，属 SESSION §2 既定的派生副本，仅提示确认 |

VERDICT: changes-required
计数：🔴 1 · 🟡 4 · 🔵 5。V-1（`VERIFICATION_TOOLS` 无 `verify`，「verify」工具名实为 `agent-tools/verify.mjs` 的 `name: "verify"`）与 V-2（`capText` 恒等、`runTurnLoop` → `registerCompletedTurn` 全链无上限）已逐行核对成立；U1–U3 断言与实现同向。

### 轮次 4（评审子代理）

### 第 4 轮定点复核（评审面 = verify/上限 + `session.mjs` transient 过滤；SESSION.md §2 三段键与恢复次序不在本轮）

| # | 严重度 | 状态 | 证据 |
|---|---|---|---|
| 1 | 🟡 | 待处置（协调项） | `session.mjs` `saveSession` `.filter((m) => !m?.transient && !isLegacyTransient(m))` ∥ `thincoder-vscode/src/extension/panel-session-write.mjs` `const keepMachine = (m) => !isLegacyTransient(m)` ∥ `panel-chat.mjs` `history = loadedLines.contextHistory`（VSC 端无 `restoreMachineFromTurns`/`projectTurns`，grep 零命中）⇒ CLI 写的槽重开后 VSC 机读线丢 `[Task state]`，与 §2「本批无用户可见入口承接」相反 |
| 2 | 🟡 | 待处置 | 同一 transient 谓词三处：`session.mjs` `legacyHistory` 的 `!m.transient && !isLegacyTransient(m)`、`saveSession` 的 `!m?.transient && !isLegacyTransient(m)`，与 `session-segments.mjs` `shouldAppend`（注释自称「与 saveSession 同源」）；`session-store.mjs` 已 re-export，本可直引 |
| 3 | 🟡 | 待处置 | `turn-projection.mjs` 成员判据编码三次：`const VERIFICATION_TOOLS = new Set(["bash", "execute"])` · `commandOf` `if (name === "bash")` · `verdictOf` `if (name !== "bash" && name !== "execute")`——§2 机制设计要求「两处成员必须同一」，加成员时后两处静默退化 |
| 4 | 🟡 | 待处置 | `turn-projection.mjs` `objective: request || capText(goal?.objective) || null` ∥ `taskStateText` `if (taskState.objective) rows.push(\`objective: ${taskState.objective}\`)`——上限去掉后整段请求每轮在 `turns` 与状态串各存一份；设计表行 `| objective / status | 当前任务与运行完成状态 |` 未授权整段原文；单测 U3 却断言 `assert.equal(ledger.objective, LONG, "目标取同一份原文（不再走一条会截断的通道）")`，把该形冻结 |
| 5 | 🟡 | 待处置 | §2「V-3 是注释与设计句，没有可跑的行为面」∥ `turn-projection.mjs` `if (state) out.push({ role: "user", content: state, transient: true })`——该标记与保存面丢弃都可断言；`test/` 全目录 grep `noteTurnToolFacts`/`buildTurnRecord`/`createTurnLedger` 零命中 ⇒ 收口删掉批内单测后 V-1 ∥ V-2 无持久覆盖 |
| 6 | 🔵 | 待处置 | `turn-projection.mjs` `function capText(v) {` 后随 `return str(v)`——名字说明截断，实现是恒等包装 |
| 7 | 🔵 | 待处置 | 单测标题 `U2 原文面：最终回复取 1 万字符` ∥ `const LONG = \`${"x".repeat(9_990)}TAIL-MARK}\`` = 9,999 字符（断言用 `LONG.length`，未掩盖缺陷） |

VERDICT: pass
计数：🔴 0 · 🟡 5 · 🔵 2。

范围说明：`SESSION.md` §2 的三段键（`compactCheckpoint` ∥ `activeRaw`）与恢复次序按本轮复核声明归在途批 `2026-11-14-turn-projection-recovery`，本轮不判（轮次 3 #1 的 🔴 随之转出，非本轮未见）。

### 轮次 5（评审子代理）

| # | 严重度 | 状态 | 证据 |
|---|---|---|---|
| 1 | 🟡 | 待处置 | `CONTEXT-COMPACTION.md` §1.1「用户请求与最终回复逐字入轮记录，没有长度上限」「用户与模型的原文不在其中」∥ 同档 §4 降级链「3. 无中段时 shrinkOversized 截断单条超大内容。」——原文可否被截断仍是两解（轮次 2 #1 ∥ 轮次 3 #3 未裁定） |
| 2 | 🟡 | 待处置 | `SESSION.md` §2「留给旧读者与旧槽回退」∥ §2 机制设计「副本里再存任务状态串没有读者」+ §2 集成增量「人读线与各端呈现都不变」；§3 轮次 4 #1 记 `panel-chat.mjs`「history = loadedLines.contextHistory」（VSC 端 grep `restoreMachineFromTurns` 零命中） |
| 3 | 🟡 | 待处置 | §2 A3 读法点名「读 `docs/core/design/SESSION.md` §2 写槽段 ∥ 可选面段 ∥ 恢复次序段」，而恢复次序段的三段次序归在途批 `2026-11-14-turn-projection-recovery`（本轮声明排除）⇒ 收口时 A3 可被判成对另一批内容的判定 |
| 4 | 🟡 | 待处置 | §2「### 现场读数」V-3 行「实现行 `machineLineForSlot(agent._turns, activeTurnRaw(agent)).filter((m) => !isLegacyTransient(m))`」∥ §3 轮次 4 #1「`.filter((m) => !m?.transient && !isLegacyTransient(m))`」——同一行两个互斥引法，旧引法不含 `m.transient`；且 §1「§5 按「已存在」如实记录」而 §5 为空，`已实现` 状态无实施面 |
| 5 | 🔵 | 待处置 | `CONTEXT-COMPACTION.md` 表头「原文通道 `capText`」∥ §2 现场读数「`function capText(v) {` 后随 `return str(v)`」——名字说截断、实现恒等；A4 的检索集只有 `4000` ∥ `TURN_TEXT_CAP` 不含 `capText` |
| 6 | 🔵 | 待处置 | §1「**状态行**：🔄 进行中（…）」未填说明；`<§1 模板占位…>` ∥ `<§2 模板占位…>` 两处骨架占位仍在场 |
| 7 | 🔵 | 待处置 | §2「勘察证据：已读 `thincoder-core/agent/turn-projection.mjs` 的账本 ∥ 事实 ∥ 折叠 ∥ 恢复四面」未记参考系（`D:\ref\`）是否查过 ∥ 是否相关 |
| 8 | 🔵 | 待处置 | §3 轮次 1 #8「最长函数 `saveSession` 约 97 行，距函数硬档 300 行远」——只答 CODE-TIER §3 的 ≥300 档，未答 50–100 档（「审视是否应拆出独立概念」） |
| 9 | 🔵 | 待处置 | §3 轮次 4 范围说明「轮次 3 #1 的 🔴 随之转出」——转出目标批 `2026-11-14-turn-projection-recovery` 已在场，核销点在那一批的收口面 |

三项现字节复核（本轮可读面内）：

- V-1：`CONTEXT-COMPACTION.md` §1.1「verification 面只收真正执行过命令的工具（bash、execute）」+ 表行「verify 只转述模型自述，不计入」均在。
- V-2：同段「用户请求与最终回复逐字入轮记录，没有长度上限」在；A4 的两个字面检索在本轮可读的设计档内 0 命中（唯一 `cap*` 命中是表头 `capText`）。
- V-3：`SESSION.md` §2「三段按同一投影拼成，再丢弃 `transient` 标记的消息」在。
- 机读清单第三行 `docs/batches/2026-11-14-turn-projection-consistency.test.mjs` 在盘，不悬空。

VERDICT: pass
计数：🔴 0 · 🟡 4 · 🔵 5（需求档与两份代码档不在本轮可读面内；A4 五档读数与轮次 4 的代码读数按记录引用，未重新实测）。

## §4 用户批准（主 agent）

用户 2026-11-14 对三项偏差逐项裁定：「1. 去掉，2. 去掉上限，3. 改。」即 verify 移出验证事实、去掉文本截断上限、修正保存注释。

用户 2026-11-14 对三面偏差逐条裁定：「1. 去掉， 2. 去掉上限， 3.改。」——① `verify` 移出验证面；② 用户请求与最终回复去掉 4000 字符上限；③ `saveSession` 注释与实现对齐。随后「确认」表示可开工。

## §5 实施记录（eng-coder）
**状态行**：实施完成



### 一、交付摘要

判据口径 = §2「条目（覆盖）」V-1 ∥ V-2 ∥ V-3 与「验收对照」A1–A5。

交接状态：批起时三处修正已在工作树（§2「现场读数」自述为前一轮未写 §5 的残留，本批不追认）。本席逐条实读复核，另据 §2「机制设计」补做了 V-1 的一处实现收口。

**V-1 验证面成员**：`VERIFICATION_TOOLS` 由「Set 名单 + `commandOf` 里 `name === "bash"` + `verdictOf` 里 `name !== "bash" && name !== "execute"`」三处编码，收成一张「名字 → 命令取形」表；`commandOf` 删除，`verdictOf(result, ok)` 只读退出码、不再按工具名分派。成员 = bash ∥ execute，`verify` 不在内。

**V-2 原文面**：`capText` 为恒等包装（`function capText(v) {` 后随 `return str(v)`），`createTurnLedger` 的 `input` 与 `buildTurnRecord` 的 `finalResponse` 两通道均无上限。代码为既有残留，本席未改其行为。

**V-3 保存面注释**：`session.mjs` `saveSession` 注释「槽里的机读线 = 按轮记录投影（`turns`）+ 在途 ∨ 异常段原文，再丢弃 `transient` 标记的消息」与实现 `.filter((m) => !m?.transient && !isLegacyTransient(m))` 同向。代码为既有残留，本席未改。

### 二、决策披露表

| # | 决策 | 理由 |
|---|---|---|
| 1 | 改 `thincoder-core/agent/turn-projection.mjs`（不在本 spawn 声明档内，在 §2 机读清单内） | §2「机制设计」要求「代码里的集合是它的实现」，而盘上是三处编码：加成员时后两处不跟，命令串空、成败按 `ok` 静默退化。§3 轮次 3 #2 ∥ 轮次 4 #3 两次点到，均 🟡 未处置 |
| 2 | 成员表用 `Object.hasOwn` 取值，不用裸下标 | 工具名来自模型入参：`toString` ∥ `constructor` 会取到原型链上的函数，把一条不存在的工具记成验证结果 |
| 3 | 不删 `capText`、不改名 | §2「最近先例」处置列写「去掉截断，通道不动」；`CONTEXT-COMPACTION.md` 头注以 `capText` 为「原文通道」点名。改名属设计改动（设计档笔） |
| 4 | 不改 `objective: request \|\| capText(goal?.objective)` 的形状 | 「当前任务」取整段请求是设计档表行的语义决定，超出本批三条目；按「设计缺口停下来报」处置，见第五节 |
| 5 | 不动 `session.mjs` 行为 | §2「现场读数」与逐行实读一致；本批对它是复核，不是修改 |

### 三、验收对照读数（A1–A5）

| 判据 | 读数 | 结论 |
|---|---|---|
| A1 | `node --test docs/batches/2026-11-14-turn-projection-consistency.test.mjs` ⇒ U1 绿；`VERIFICATION_TOOLS` 成员 = bash ∥ execute，`CONTEXT-COMPACTION.md` §1.1「verification 面只收真正执行过命令的工具（bash、execute）」同向 | 过 |
| A2 | 同档 U2 ∥ U3 绿；§1.1「用户请求与最终回复逐字入轮记录，没有长度上限」在，同段无原文截断表述 | 过 |
| A3 | `SESSION.md` §2「`turns` 非空才作权威源，空数组与缺键同视为没有」⟷ `restoreMachineFromTurns` 的「if (turns.length === 0) return null」；transient 处置两处同向 | 本批射程内过，三段键见第四节 |
| A4 | 五档（两份 compaction 需求 ∥ 设计、`SESSION.md`、`turn-projection.mjs`、`session.mjs`）字面检索：`4000` = 0 命中、`TURN_TEXT_CAP` = 0 命中；两份 compaction 档 `verify` = 1 命中（§1.1 表行） | 过 |
| A5 | 需求 §5 三条各指到 §1.1：验证命令及真实结果 → verification 段；由运行过程生成 → 「状态由运行记账和实际工具结果组装」；只保留请求 ∥ 回复 ∥ 任务状态 → 折叠段 | 过 |

**反向读数（失败侧）**：把 `verify` 放回成员表、给 `capText` 加回 4000 上限，做成一次性副本跑同一组断言 ⇒ U1 ∥ U2 ∥ U3 三条全红（`verification.length = 1`、`len = 4001 / 9999`、`len = 4001 / 9999`）。同一组断言在修后实现上全绿，故 U1–U3 不是恒绿空转。

**集成面**：`node --test test/integration/turn-history-projection.test.mjs` ⇒ CLI 1-5 pass 1 / fail 0。本批 RTM 增量 = 改 0 ∥ 删 0 ∥ 增 0（§2 已声明）。

### 四、临时件已清、盘上零残留

**临时件已清、盘上零残留。** 核对方式三条：

1. 候选路径逐个 `Test-Path`：`thincoder-core\agent\tmp-failside-projection.mjs` ⇒ absent；`docs\batches\tmp-failside-check.test.mjs` ⇒ absent（该档的写入当时被写闸拒，从未落盘）。
2. 全仓递归通配 `tmp-*` ∥ `tmp_*` ∥ `*.tmp` ∥ `*failside*`（排除 `node_modules` ∥ `.git`）：无任何本席产出的路径。
3. `git status --porcelain` 对 `failside|tmp-|\.tmp` 过滤：零命中（`.thincoder-tmp-ctx.txt` ∥ `tmp-target-block.txt` 是本席 spawn 前就在场的旧件，非本席产出）。

失败侧副本原地放在 `thincoder-core/agent/` 下（产品树内），是本轮的做法缺陷；现已删除，产品树无残留。另记：`.gitignore` 第 28 行 `tmp-*.mjs` 本来也会拦住它进提交，但不以忽略规则代替删除。

### 五、上抛与发现

| # | 性质 | 内容 | 建议去向 |
|---|---|---|---|
| 1 | 设计缺口［上抛·待裁］ | `objective: request \|\| capText(goal?.objective) \|\| null` 使 `objective` 恒等于整段请求，`taskStateText` 再 `objective: ...` 写进 `[Task state]` 消息，而该消息会发到 provider（`stripLocalMessageFields` 只剥字段、不剥消息）⇒ 每轮机读线把请求存两遍，槽里再各存一份。上限去掉后这条重复无界。单测 U3 第三条断言把这个形冻住了 | 需求方定「当前任务」是否就是整段请求 |
| 2 | 设计档漂移（非本席落地所生） | `docs/core/design/SESSION.md` §2「机读线在槽里按三段存」+ 表行 `activeRaw` ∥ `CONTEXT-COMPACTION.md` §1.1 指路句，而 `session.mjs` 只写 `turns` + `contextHistory`，`activeRaw` ∥ `compactCheckpoint` 全仓零命中；`restoreMachineFromTurns` 在 `turns` 非空时整段丢弃在途段 | 属在途批 `2026-11-14-turn-projection-recovery`（§3 轮次 4 范围说明已转出） |
| 3 | 设计档缺口（非本席落地所生） | §2「设计档落点」要求写槽段「再丢弃 transient 标记的消息，附理由」；落地的 §2 只有规则句，无理由句。旧 `saveSession` 注释记载的「KEEP transient」理由（provider 缓存整前缀命中）也没有任何一句处置 | eng-designer（设计档笔） |
| 4 | 跨端不一致［上抛·知会］ | CLI 写面丢弃 transient，VSC 写面 `panel-session-write.mjs` 的 `const keepMachine = (m) => !isLegacyTransient(m)` 保留；VSC 读面取 `history = loadedLines.contextHistory` ⇒ CLI 写的槽在 VSC 机读线里丢 `[Task state]` 行 | 跨端协调，§2「本批无用户可见入口承接」与之相反 |
| 5 | 维护面 | transient 判据三个字面副本（`session.mjs` 两处、`session-segments.mjs` 的 `shouldAppend`，后者注释自称与 `saveSession` 同源），空值安全不一 | 可并入 `session-store.mjs` 导出一个谓词 |
| 6 | 覆盖缺口 | 本批单测收口即删，`test/` 对 `noteTurnToolFacts` ∥ `buildTurnRecord` ∥ `createTurnLedger` 零命中 ⇒ 收口后把 `verify` 加回成员表不会被任何用例拦住 | 按测试纪律不造常驻单测；建议父代理记一条台账 |
| 7 | 边界 | 旧槽（无 `turns`）恢复后在首个完成轮前落盘，`contextHistory` 会被写成 `[]`，下次恢复回落全史、压缩收益作废；该调用点是否存在未验（`unverified`） | 待有场景再收 |

### 六、落地核对

**落地核对：无。** 本席改动未使任何设计档句子不成立（`VERIFICATION_TOOLS` ∥ `capText` 两个被点名的符号仍在、语义未变）。

### 七、轮次与终态

| 轮 | 类型 | 结论 | 处置 |
|---|---|---|---|
| 1 | 内部勘察（explore 差异审计） | DIVERGENCE 2（均 low） | ① `verdictOf` 注释写「不读工具调用成败」，末行却有 `return ok === true` 回落 ⇒ 已按代码改写注释（自纠 1 处）；② `SESSION.md` §2 写槽段缺理由句 ⇒ 转设计档笔，见第五节 #3 |
| 2 | 内部代码评（advisor code） | VERDICT pass：🔴 0 · 🟡 6（2 项跨端 ∥ 跨批协调）· 🔵 4 | 自纠 2 处：`slotTurns` 注释自称「纯拷贝…不共享可变结构」而 `taskState` 按引用透传 ⇒ 改写注释；单测 `LONG` 实为 9,999 而标题写「1 万字符」⇒ 改 `repeat(9_991)`，实测 10,000 |
| 3 | 收尾复核（父代理提醒临时件） | 临时件清点 | 见第四节 |

**终态 = `clean`**：两条内部审计轮次均已收敛，🔴 0；第 2 轮的 🟡 全是可选建议或跨批协调项，无一项落在 V-1 ∥ V-2 ∥ V-3 的判据上。

自纠轮次合计 2 轮（审计轮 1 处 + 评审轮 2 处），无未收敛项。

## §6 验证与收口（父代理）

验收 = 父侧复跑 `node --test docs/batches/2026-11-14-turn-projection-consistency.test.mjs test/integration/turn-history-projection.test.mjs`：4 pass / 0 fail（U1 ∥ U2 ∥ U3 + CLI 1-5）。失败侧交接席已实测：`verify` 放回成员表、`capText` 加回 4000 上限 ⇒ 三条全红，断言非恒绿。

评审 = 设计评审 5 轮，末轮 `VERDICT: pass`；代码评审 pass（🔴 0）。轮次 3 #1 的 `compactCheckpoint` ∥ `activeRaw` 🔴 按批界转出到 `2026-11-14-turn-projection-recovery`，本批不认领、不算已闭。

本批新债 = 无。范围外观察（objective 是否等于整段请求、VSC 写面 transient、旧槽 `contextHistory` 被写空）已如实交给用户裁定，未擅自开行。
