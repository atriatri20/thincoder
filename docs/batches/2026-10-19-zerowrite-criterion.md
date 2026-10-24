# 2026-10-19 · 零写计数器判据物错位（去重文件数 ⇒ 单调写序）
> 六段 append-only，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 编制：主 agent · 2026-10-19 · 来源 = 用户 2026-10-19 15:06「感觉零写轮次计数器有问题，你排查一下，总是错误的报零写入」+ 15:08「开批正式修」。
> 台账 = #1706（core · 归批）。前情 = 无（独立批）。
## §1 讨论（主 agent）
**状态行**：已收口 2026-10-19
<§1 模板占位：本批条目 / 关键判据 / 授权口径>

### 本批条目与授权口径（主 agent）

**本批条目**：台账 `#1706`——零写看门狗判据物错位。

**用户实报（逐字）**：2026-10-19 15:06「感觉零写轮次计数器有问题，你排查一下，总是错误的报零写入」· 15:08「开批正式修」。

**根因（父侧实读三行对照）**：
- 设计档 `docs/core/design/AGENT-LOOP-UPSTREAM.md` §6.32.2 逐字定「判据物 = **`agent._mutationSeq`（单调写序）**」；
- 实现 `thincoder-core/agent/turn-loop.mjs:81` 比的是 `agent._touchedFiles.length`；
- `thincoder-core/agent/record-results.mjs:169` 是 `if (!includes(abs)) push`——**去重**。

⇒ **重写已触碰过的档，长度一动不动 ⇒ 判成零写**。旁证：并行实例实报「`touchedFiles` 11 个档、盘上文件在变，同期 66/251 轮判零写」。

**关键判例（本批发现，须留档）**：**前序批档 `docs/batches/2026-10-15-zero-write-watchdog-criterion.md` 已载同一设计（§2「设计完成（判据口径收正（写序 `_mutationSeq`）…）」，193 行），其 §3/§4/§5/§6 全空 ⇒ 从未评审、从未实施，四天后父侧又从头设计一遍。**

**父侧裁定**：**本批 = 执行批**；2026-10-15 档按「设计已被本批吸收」收口（§3/§4 声明不适用并给理由，§6 记吸收指针）。**两条档不得并存为「都还能干」** —— 那正是本次误设计的成因。

**范围边界（父侧划死）**：**不动 `FILE_MUTATORS` 覆盖面**。`bash` / `file_ops` / `batch` / `git` 不记 `_mutationSeq` 是**另一条债**（影响 `verify` 变更清单 ∥ 审计范围 ∥ 子代理文件合入 5 个消费面），另批立项；混进来本批就有两个判据面，验收说不清哪条挡了哪个退形。

## §2 批次任务与设计（eng-designer）
**状态行**：设计完成（修正轮 2：A-ZW5 按父侧裁定收正——现役可红面 = 批次本地单测档 7 例，U-ZW1–U-ZW8 从未落到可执行测试档（补建另立批）；A-ZW1/A-ZW2/A-ZW3 的无载体绿断言同轮删除（编号自洽）；设计档 1274 行；实现待 eng-coder）
<§2 模板占位：本批条目（覆盖） / 设计档落点 / 机制设计 / 受影响文件与测试覆盖 / 验收对照 / 关键决策 / 上抛项>


### §2.1 本批目标
零写计数器与设计档说同一件事：判据物由 `_touchedFiles` 路径数（**去重数组**——同文件重写长度不变 ⇒ 假零写）改为 `_mutationSeq` 单调写序。设计权威 = `docs/core/design/AGENT-LOOP-UPSTREAM.md` §6.32.2 ① / §6.32.6 接线①；需求 = `docs/core/requirements/AGENT-LOOP.md` §4.16 F-ZW1（已在盘，已含新口径）。

### §2.2 本批条目（覆盖）
| # | 条目 | 需求档 | 设计档落点 | 本批动作 |
|---|---|---|---|---|
| 1 | F-ZW1 子代理族判据 | §4.16 F-ZW1 | §6.32.2 ① · §6.32.6 接线① | 判据物换 `_mutationSeq`：基线 `turn-loop.mjs:62` · 轮顶 `:81` · 前移 `:90` · 收尾 `:276`（四处同一谓词；收尾轮为**单结** `_zeroWriteTurns`，不另作 alert ∥ streak 判定——与设计档 §6.32.2 ① · §6.32.10-7 · D-ZW7 同口径） |
| 2 | F-ZW3 防轰炸 | §4.16 F-ZW3 | §6.32.3 | 零改（streak 归零 + 闩清照旧；只换判据物，结构不动） |
| 3 | F-ZW4 B 面读数 | §4.16 F-ZW4 | §6.32.4 B 面 · §6.32.6 接线③ | 读数带分母（新增 `_segmentTurns`）+ 职责句；缺字段不渲染 |
| 4 | #417 读数语义 | 设计档 §6.32.2 ① 单点副产物 | §6.32.2 ① | `_zeroWriteTurns` 与 streak 同分支自增 ⇒ 口径同改；字段名 / 承载面 / 消费点零改 |

**明确不在本批**：① `FILE_MUTATORS` 覆盖面（`bash` / `file_ops` / `batch` / `git` 不记账——父侧另批）；② 阈值 `ZERO_WRITE_ALERT_ROUNDS = 50` 与 `WATCH_ROLES`；③ 自动杀 / 自动转向；④ 评审族判据（`_zeroWriteStreak` 之外的 `silentRounds` 链）；⑤ 父侧提示词面（内容已定，落笔非本席）。

### §2.3 现状实读（改前 · 2026-10-19 · 按盘）
- `thincoder-core/agent/turn-loop.mjs:62` `agent._turnFilesMark = agent._touchedFiles.length`（基线）。
- `:81` `if (agent._touchedFiles.length === agent._turnFilesMark)` ⇒ `:82` `_zeroWriteTurns += 1` · `:83` `_zeroWriteStreak += 1` · `:84` `maybeZeroWriteAlert(agent)`；else `:86` streak = 0 · `:87` 闩清。
- `:90` `agent._turnFilesMark = agent._touchedFiles.length`（前移）。
- `:276` `if (maxTurns > 0 && agent._touchedFiles.length === agent._turnFilesMark) agent._zeroWriteTurns += 1`（收尾单结）。
- 病根在盘：`thincoder-core/agent/record-results.mjs:169` `if (!agent._touchedFiles.includes(abs)) agent._touchedFiles.push(abs)`（中断分支 `turn-loop.mjs:246` 同式）⇒ 去重数组 ⇒ 同文件重写判零写。
- `_mutationSeq` 链（复用，零新建）：写侧 `thincoder-core/agent-tools/advisor-settle.mjs:45-52`（每次写 +1，不去重）；唯一调用点 `thincoder-core/agent/dispatch-gates.mjs:145-151`；初始化 `thincoder-core/agent.mjs:69` `_mutationSeq: 0`；读面 `mutationSeqOf` `advisor-settle.mjs:38-40`。
- 消费面：`thincoder-core/agent-tools/checkpoint.mjs:30` 读 `_zeroWriteTurns`（旧文案 `zero-write rounds this segment: K`）；`zero-write-watch.mjs:46` 读 `_zeroWriteStreak`。

### §2.4 目标形（逐处）
| 处 | 现形 | 目标形 |
|---|---|---|
| 基线（`turn-loop.mjs:62`） | `_turnFilesMark = _touchedFiles.length` | `_mutSeqMark = _mutationSeq` |
| 轮顶判据（`:81`） | 路径数相等 | `!wroteSince(agent, agent._mutSeqMark)` |
| 前移（`:90`） | `_turnFilesMark = _touchedFiles.length` | `_mutSeqMark = _mutationSeq` |
| 收尾（`:276`） | 路径数相等 ∧ `maxTurns > 0` | `maxTurns > 0 && !wroteSince(agent, agent._mutSeqMark)` |
| 谓词 | 无 | `helpers.mjs` 模块级导出 `wroteSince(agent, mark)`（单行；非整数 ⇒ `true` 不判） |
| 段轮数 | 无 | `_segmentTurns` 环头 +1（`turn-loop.mjs:73-75` 邻）；`run-start.mjs:107` 邻复位 0 |

`_turnFilesMark` 改后零消费者（源码面扫描 `thincoder-core/**` + `thincoder-vscode/**` 全 `.mjs` 379 档：仅 `turn-loop.mjs` 四处；`.thincoder/tmp/2026-09-29-agent-p2-baseline.mjs` 另有 4 处——测量快照、非源码面、不在判据域）⇒ **退役删除**（不留 corpse）。`_touchedFiles` 记账面两处与约 20 个消费面**零改**。

### §2.5 三条边界处置
1. **`_mutationSeq` 非整数**（缺字段 / NaN）：判「有落笔」⇒ 不判。**不用 `?? 0`**——未跟踪面两值同为 0 ⇒ 读成「零落笔」，正是本批要消除的误报方向。核内构造恒初始化 0（`agent.mjs:69`），非整数属防御分支。
2. **resume 跨段**：`_mutSeqMark` 每段入口重取基线（`runTurnLoop` 入口——续跑 = 新调用），段内比对不串位；`_zeroWriteStreak` / `_zeroWriteAlerted` 跨段存活（`run-start.mjs:128-129` 只在 `!resume` 支复位）；`_zeroWriteTurns` / `_segmentTurns` 按段复位（`run-start.mjs:107` 同点、不受 `!resume` 门控）。
3. **`maxTurns ≤ 0`**：回合环未跑 ⇒ 零计数（收尾门 `maxTurns > 0` 保留）；入口基线赋值无副作用。

### §2.6 判据（改前红 / 改后绿）
- 单元测试档：`docs/batches/2026-10-19-zerowrite-criterion.test.mjs`（批档同目录 · **随批档留存**·不进集成测试树——与设计档 §6.32.7 行 16 同一生命周期；设计档 A-ZW5 以它为现役可红面）。
- **改前红**：① `import { wroteSince } from "../../thincoder-core/agent/helpers.mjs"`（测试档在 `thincoder/docs/batches/` ⇒ 上两级才落 `thincoder/thincoder-core/`；cwd = `d:\teamcode\thincoder`） ⇒ 无该导出（红）；② 静态断言 `turn-loop.mjs` 不含 `agent._touchedFiles.length === agent._turnFilesMark` ⇒ 改前 2 命中（红）。
- **改后绿（谓词级）**：U-1 同文件连编 3 轮（`_mutationSeq` 3→4→5→6，`_touchedFiles` 长度恒 1）⇒ `wroteSince` 三次 `true`；U-2 seq 不变（3→3）⇒ `false`（计零写）；U-3 `_mutationSeq` 缺字段 ⇒ `true`（不判）；U-4 NaN ⇒ `true`；U-5 `checkpoint.turnCapTrace` 携 `46 of this segment's 51 rounds produced no file write`，缺 `_segmentTurns` ⇒ 该元不渲染。
- **改后绿（接线级）**：U-6 写失败不计（同 mark、写序不推进 ⇒ `false`——前提「`Error:` 前缀结果不推进写序」由 `dispatch-gates.mjs:145-151` 既有门兑付，本批零改）；U-7 接线断言（环内判据点均调 `wroteSince(agent, agent._mutSeqMark)` ∧ 环外基线 ∥ 前移两处赋 `_mutSeqMark` ∧ 无路径数比较）。
- **U-7 的限度（写清）**：`runTurnLoop` 无模型注入缝 ⇒ 行为级直驱需 loader 级桩；本批以静态接线断言代设计档 U-ZW9 ∥ U-ZW10 的直驱面。

**用例映射（本批 U-n ⇔ 设计档 §6.32.8 U-ZW-n）**：

| 本批 | 设计档 | 面 | 本批是否立例 |
|---|---|---|---|
| U-1 | U-ZW9 | 同文件重复编辑 ⇒ 计落笔（谓词级） | 立 |
| U-2 | U-ZW10 | 零写 ⇒ 计零落笔（谓词级） | 立 |
| U-3 | §6.32.2 ① 边界①（非整数不判） | 未跟踪执行面 | 立 |
| U-4 | §6.32.2 ① 边界①（NaN 卫生） | NaN 不判 | 立 |
| U-5 | U-ZW12 | B 面读数带分母 + 缺字段不渲染 | 立 |
| U-6 | U-ZW11 | 写失败不计落笔 | 立 |
| U-7 | U-ZW9 ∥ U-ZW10 的直驱面 | 回合环接线 | 立（静态接线断言；直驱需 loader 级桩——见上） |
| — | U-ZW1–U-ZW8 | 叶档推送 ∥ 评审族 ∥ 文案面（本批零改） | 不立（载体缺口上抛 4） |
- 复跑：`node --test docs/batches/2026-10-19-zerowrite-criterion.test.mjs` ⇒ exit 0。

### §2.7 受影响文件（现量 = `node` `split("\n")` 实读）
| # | 文件 | 现量 → 预计 | 说明 |
|---|---|---|---|
| 1 | `thincoder-core/agent/turn-loop.mjs` | 282 → ~288 | 四处判据换物 + 谓词 import + `_segmentTurns` + 注释 |
| 2 | `thincoder-core/agent/helpers.mjs` | 493 → ~496 | `wroteSince` 导出（留 500 建议线内） |
| 3 | `thincoder-core/agent/run-start.mjs` | 159 → 160 | `_segmentTurns = 0` |
| 4 | `thincoder-core/agent-tools/checkpoint.mjs` | 122 → ~127 | 读数带分母 + 职责句 |
| 5 | `docs/batches/2026-10-19-zerowrite-criterion.test.mjs` | 新 | 判据用例 U-1–U-7 |
| 6 | 零改面 | — | `record-results.mjs` / `dispatch-gates.mjs` / `advisor-settle.mjs` / `zero-write-watch.mjs` |
| 7 | `docs/core/design/AGENT-LOOP-UPSTREAM.md` | 1272 → 1272 | 本批笔迹：`:915` · `:1121` · `:1135` 三处「撞帽收尾轮不另判」收正为「收尾单结（同一谓词）+ 不另作 alert ∥ streak 判定」（行数零变——逐行替换）；本批档 §2 笔迹另计 |

### §2.8 验收对照（可机检 · cwd = `d:\teamcode\thincoder`）
| # | 判据 | 回指 |
|---|---|---|
| A-1 | 仓级扫描（`node -e` 递归 `thincoder-core/**` + `thincoder-vscode/**` 全 `.mjs`，379 档）：`_turnFilesMark` 零命中 ∧ `turn-loop.mjs` 含 `_mutSeqMark` ≥3 命中 ∧ 不含 `agent._touchedFiles.length === agent._turnFilesMark`。改前实读 = `_turnFilesMark` 4 命中（全在 `turn-loop.mjs`） | §2.2 条 1 |
| A-2 | 谓词单源：`helpers.mjs` 导出 `wroteSince` ∧ `turn-loop.mjs` 两处判据点均调用它 | §2.4 |
| A-3 | `_segmentTurns` 在盘：`turn-loop.mjs` 环头 +1 ∧ `run-start.mjs` 复位 | §2.4 |
| A-4 | B 面在盘：`checkpoint.mjs` 含 `produced no file write` ∧ `Check for a non-writing loop before you grant or stop` | §2.2 条 3 |
| A-5 | `node --test docs/batches/2026-10-19-zerowrite-criterion.test.mjs` ⇒ exit 0（U-1–U-7） | §2.6 |
| A-6 | 零回归（静态指纹——不依赖 git 仓）：四档改后实读 = `record-results.mjs` 195 行 ∥ sha256\(bytes\) 前 12 位 `cd8f19a37b02` · `dispatch-gates.mjs` 152 ∥ `e7ef2a383a3b` · `advisor-settle.mjs` 239 ∥ `cb7d02c0500f` · `zero-write-watch.mjs` 78 ∥ `b7640a81ec09`（`node -e` 读档算，cwd = `d:\teamcode\thincoder`） | §2.2 不在本批 |
| A-7 | 不变量：U-5 断言 `_zeroWriteTurns ≤ _segmentTurns`（同段） | §2.5 |

### §2.9 关键决策
| # | 决策 | 理由 / 否决 |
|---|---|---|
| D1 | mark 字段 = **新增 `_mutSeqMark`**（不沿用 `_turnFilesMark`，亦不用 `_turnMutMark`） | 同名不同物 = 名称失义；设计档 §6.32.6 已定此名；`_turnFilesMark` 改后零消费者 ⇒ 退役删除 |
| D2 | `_zeroWriteTurns` **同改**（与 streak 同一分支同一谓词） | 同函数两计数器判据异源 = 长期漂移源；字段名 / 承载面 / 消费点不变 |
| D3 | B 面读数同批落地（`_segmentTurns` + 职责句） | 判据改后旧文案失义；需求 F-ZW4 已要求；设计档同一收正轮。若父侧要窄批：删 §2.2 条 3 与受影响文件 3 / 4 即可，判据（条 1）独立成立 |
| D4 | 谓词提为 `helpers.mjs` 模块级导出 | 闭包无法行为级单测 ⇒ 改前红/改后绿只能退化为文本扫描；纯函数零状态、两处判据点共用 |
| D5 | 非整数 ⇒ 记「有落笔」（不判） | 否决 `?? 0`：未跟踪面读成零落笔 = 误报方向；核内已初始化 0 |

### §2.10 上抛项
- **[上抛·知会] 1. 前序批档未收口**：`docs/batches/2026-10-15-zero-write-watchdog-criterion.md` §2 已设计同一收正（与本批同源），§3 / §4 空、§5 无实施记录——即该设计从未落到代码。本批为其再派；两档关系（旧档收口 / 废弃）属父侧批档管理。
- **[上抛·知会] 2. #417 连带**：本批后 `_zeroWriteTurns` 数值变（同文件重复编辑不再计零写），字段名 / 承载面 / 三端消费点零改；B 面文案按设计档 §6.32.4 改为带分母读数。
- **[上抛·知会] 3. 需求档三链同源**：`AGENT-LOOP.md` §4.16 F-ZW1 / F-ZW4 已在盘且已含新口径（读数 334 行）——本批零触；前序批档 §2.10 的「需求档待收正」已由父侧完成。
- **[上抛·待裁] 4. A-ZW5 可红面载体缺口**：设计档 A-ZW5 以「单元测试档（U-ZW1–U-ZW12）全绿」为现役可红面，而本批用例集覆盖 U-ZW9–U-ZW12 + 接线（U-1–U-7 映射见 §2.6）；U-ZW1–U-ZW8（叶档推送 ∥ 评审族 ∥ 文案面）本批零改、不立例 ⇒ 其载体在盘只有本档这一份。要么父侧裁定「U-ZW1–U-ZW8 由后续批立例」，要么把 A-ZW5 的现役可红面改成只列 U-ZW9–U-ZW12。

### §2.11 最近先例（对齐 ∥ 偏离）

| 面 | 实现坐标 | 设计档节 | 先例批 | 对齐 ∥ 偏离（理由） |
|---|---|---|---|---|
| 判据物换写序 | `turn-loop.mjs:62` · `:81` · `:90` · `:276` | §6.32.2 ① · §6.32.6 接线① | `docs/batches/2026-10-15-zero-write-watchdog-criterion.md` §2（`:97` · `:99` · `:100` · `:101`） | 对齐：四处判据点 / 字段 `_mutSeqMark` / 收尾轮与环内同一谓词（先例 `:101`「收尾轮与环内同一谓词」）逐点同形 |
| 谓词落点 | `helpers.mjs` 模块级导出 | §6.32.2 ①「谓词住 `helpers.mjs`」 | 先例批 `:99`（环内 `const wroteSince = (a, mark) => …`） | **有意偏离**：环内闭包 ⇒ 模块级导出。理由 = `runTurnLoop` 无模型注入缝，闭包只能靠文本扫描断言；导出后改前红可行为级跑（无该导出即红） |
| 读数分母 | `_segmentTurns` | §6.32.2 ① · §6.32.4 B 面 | 先例批 §2 同字段同落点 | 对齐 |

### §2.12 调研证据（查过哪些源 ∥ 结论）

- ① 本仓设计档 `docs/core/design/AGENT-LOOP-UPSTREAM.md` §6.32（该机制的拥有档；文档地图登记 = `docs/README.md:77`）——**相关**：判据物 / 落笔判定表 / 文案逐字俱在盘。
- ② 需求档 `docs/core/requirements/AGENT-LOOP.md:288`（F-ZW1）· `:291`（F-ZW4）——**相关**：判据句已含写序口径、B 面已含带分母；本批零触需求档。
- ③ 先例批 `docs/batches/2026-10-15-zero-write-watchdog-criterion.md` §2——**相关**：同源设计，本批为其落地（对齐 / 偏离见 §2.11）。
- ④ 仓内测试面：`node --test` 直驱 `runTurnLoop` 无先例（驱动只见 `.thincoder/tmp/**` 测量脚本与 VSC 端子进程夹具）——**相关**：故 U-7 取静态接线断言（§2.6）。
- ⑤ 项目约定 `AGENTS.md`——**相关**：文件 ≤ 800 行硬限（`helpers.mjs` 493 → ~496 在限内）；「改动必须实跑验证」⇒ A-5 复跑 + A-6 静态指纹。
- 结论：五项皆相关，无「无相关」项。

### §2.13 A-ZW5 收正（修正轮 2 · 父侧裁定落地 · 2026-10-19）

**父侧裁定（对上抛 4）**：收 A-ZW5；不收「U-ZW1–U-ZW8 由后续批立例」那条路——那是把一句假话变成一条无人认领的待办。口径三条：① 现役可红面写**在盘的事实**；② 明写 U-ZW1–U-ZW8 从未建档、本批不建（零改面）；③ 将来要建另立批，A-ZW5 不承诺。

**改了什么（设计档 `docs/core/design/AGENT-LOOP-UPSTREAM.md`）**：

| # | 落点 | 改前 | 改后 |
|---|---|---|---|
| 1 | `:1108` A-ZW5 | 「现役可红面 = 单元测试档（U-ZW1–U-ZW12）全绿」 | 「现役可红面 = 批次本地单元测试档 7 例（U-ZW9–U-ZW12 的谓词级投影 + 接线静态断言；§6.32.7 行 16 · 随批档留存）——U-ZW1–U-ZW8 从未落到可执行测试档（§6.32.8 头注），补建须另立批次」 |
| 2 | `:1083` §6.32.8 头注（新增 2 行） | 无 | 执行载体一行：U-ZW9–U-ZW12 由批次本地单测档承载（7 例）；U-ZW1–U-ZW8 只有本表规格、从未落到可执行测试档；补建须另立批次 |
| 3 | `:1104` A-ZW1 | 尾「——U-ZW5 / U-ZW7 绿」 | 删尾（两例无执行载体；判据句本体零改） |
| 4 | `:1105` A-ZW2 | 尾「——U-ZW2 / U-ZW3 / U-ZW7 绿」 | 删尾（同因） |
| 5 | `:1106` A-ZW3 | 尾「——U-ZW1 / U-ZW12 逐字断言」 | 「——U-ZW12 逐字断言」（U-ZW1 无载体、U-ZW12 有） |
| 6 | `:1078` §6.32.7 行 18 | 1272 → 1272 · ±0 | 1272 → **1274** · **+2**（实读行数） |

第 3–5 条 = 父侧「编号自洽」的直接推论：A-ZW5 明写 U-ZW1–U-ZW8 无载体后，另三行若仍留「绿」即同档自相矛盾。三行判据本体零改，只删无载体用例的绿断言——如父侧只认第 1–2 条，这三行可逐行回退。

**实读依据（本席实跑 · 2026-10-19）**：
- `grep "U-ZW"` 全仓 `.mjs` = **0 命中** ⇒ U-ZW1–U-ZW12 无一落到可执行测试档。
- `docs/batches/*.test.mjs` = 6 档（`2026-10-15-desktop-walkthrough-fixes` ∥ `-model-selection-pivot` ∥ `-team-token-rotation` ∥ `2026-10-16-box-quota-recovery` ∥ `2026-10-19-product-remainder` ∥ `-product-remainder-1518`），无 zerowrite 档 ⇒ 本批单测档尚未在盘（§2.7 行 5 = 新，随实施落地）。
- 设计档 `:1113` 自注：核清单自 2026-09-28 空置、`npm test` 零用例即绿 ⇒ 核套件不是可红面。
- `.md` 侧命中：本档 §6.32.8 用例行 12 条；`2026-10-15-zero-write-watchdog-criterion.md` `:105` / `:116` / `:119` / `:160`（该档称「U-ZW1–U-ZW12 = 12 例」，从未实施）；本批档 `:84`–`:91` / `:129` / `:159` / `:161`。

**编号自洽核对（改后实读 · 设计档）**：§6.32.8 用例行 = 12（`:1087`–`:1098`）∥ 无载体 8（U-ZW1–U-ZW8）+ 有载体 4（U-ZW9–U-ZW12）= 12 ✓；§6.32.9 验收行 = 8（`:1104`–`:1111`）；全表引用的 U-ZW 号均在 §6.32.8 定义域 1–12 ✓；「绿」断言只剩 A-ZW3 ∥ A-ZW7 ∥ A-ZW8，所指 U-ZW9–U-ZW12 均有本批载体 ✓。

**上抛·待裁（主 agent 笔，本席不触）**：需求档 `docs/core/requirements/AGENT-LOOP.md:295` N2 仍以「U-ZW1–U-ZW12」为可机判用例集；设计档改后 U-ZW1–U-ZW8 无载体 ⇒ 需求与设计两侧不同步。处置在需求档。

**文档检查门读数**：`doc_check` 工具面报 `DOC-CHECK GATE: ERROR（引擎已更新）`——本会话进程加载的引擎早于盘上引擎档（`doc-check/index.mjs` mtime 2026-10-19T03:32:12Z 等 > 进程启动 02:35:55Z），须重启会话复跑。报告态（旧引擎，不可作交付判据）读数：本档 0 锚命中、0 行宽命中；全库 2 条行宽命中（`docs/core/design/PROMPT-SYSTEM.md:265` / `:267`，非本次触碰档）。

## §3 设计评审（评审子代理）

### 轮次 1（评审子代理）

### 设计评审（首审 · 独立评审子代理）

**范围限制**：评审对象 = 三份文档（本批档 · `docs/core/design/AGENT-LOOP-UPSTREAM.md` · `docs/batches/2026-10-15-zero-write-watchdog-criterion.md`）；代码档（`turn-loop.mjs` / `record-results.mjs` / `run-start.mjs` / `helpers.mjs`）不在评审范围，未读 ⇒ 代码坐标相关断言按「文中自述」记录，未独立核实。无文档地图与项目标准档声明 ⇒ 方法学按 `AGENTS.md` + 评审准则判定。

| # | 类别 | 严重度 | 问题 | 建议 |
|---|---|---|---|---|
| 1 | 文档归属（机制级冲突） | 🔴 | 「撞帽收尾轮是否判」在同一权威档内两种不可兼容描述：`thincoder/docs/core/design/AGENT-LOOP-UPSTREAM.md:915`「撞帽收尾轮不另判」· `:1121`「撞帽收尾轮不另判（单点采集——§6.32.2 ①）」· `:1135`「采集点 = 回合环轮顶单点（撞帽收尾轮不另判）」；而同档 `:1011`「// 撞帽收尾轮单结（:276——同一谓词）：」+:1012「if (maxTurns > 0 && !wroteSince(agent, agent._mutSeqMark)) agent._zeroWriteTurns += 1」，本批 `§2.2` 条 1 亦称「四处同一谓词」。本批 §2.7 未把设计档列入受影响文件，而 §2 状态行称「设计档 §6.32 目标形已收正」⇒ 一处按「不判」读、一处按「同谓词单结」读，读者无从判优劣；实现若按前者删掉收尾结算行，`_zeroWriteTurns` 语义与 A-7 不变量读数一并改变 | 二选一并落笔：(a) 保留收尾单结，则把 `:915` / `:1121` / `:1135` 三处改为「撞帽收尾轮单结（与环内同一谓词），不另作 alert 判定」，并在受影响文件表登记该档笔迹；(b) 取消收尾结算，则同步改 `:1011-1012`、本批 §2.4 收尾行与 A-1/A-2，并登记 `_zeroWriteTurns` 语义变化 |
| 2 | 验收 | 🟡 | 单测档生命周期两说：本批 `2026-10-19-zerowrite-criterion.md:74`「（批档同目录 · 收口删）」 vs 设计档 `AGENT-LOOP-UPSTREAM.md:1076`「（随批档留存 · 不进集成测试树）」，且 `:1106` A-ZW5 把「现役可红面 = 单元测试档（U-ZW1–U-ZW12）全绿」作为验收面 ⇒ 收口即删会让该验收面失去可复现载体 | 统一为「随批档留存」；若确要收口删，须在设计档 `:1076`/`:1106` 同步声明替代的可红面，并说明 A-ZW5 此后由何承载 |
| 3 | 可行性 | 🟡 | 单测档相对 import 路径错：`2026-10-19-zerowrite-criterion.md:75` 写 `"../thincoder-core/agent/helpers.mjs"`，而档位在 `thincoder/docs/batches/`、代码在 `thincoder/thincoder-core/` ⇒ 解析到 `thincoder/docs/thincoder-core/...`，A-5（`node --test … ⇒ exit 0`）与「改前红」都会因模块解析失败而红，红的原因不是「无该导出」 | 改为 `"../../thincoder-core/agent/helpers.mjs"`（并注明 cwd = `d:\teamcode\thincoder`）；若静态断言按相对 cwd 读档，同句一并标 cwd |
| 4 | 验收 | 🟡 | 用例集与设计档验收不对应：本批只有 U-1–U-5（`:76`），设计档 A-ZW5/A-ZW7/A-ZW8（`:1106`/`:1108`/`:1109`）引用 U-ZW1–U-ZW12；缺口 = ① 写失败不计（U-ZW11，`:1095`）② 直驱 `runTurnLoop` 的两例（U-ZW9/U-ZW10，`:1093`/`:1094`——本批 U-1 只在假 agent 上验谓词，未验接线）③ 只读 50 轮 + 不变量（U-ZW10） | 或沿用 U-ZW 编号，或加一张「本批 U-n ⇔ 设计档 U-ZW-n」映射行，缺的用例补进 `§2.6`；至少把「同档重写不计零写」补一例经回合环的直驱断言 |
| 5 | 验收 | 🟡 | A-6 依赖 `git diff --stat`（`2026-10-19-zerowrite-criterion.md:97`），而本次评审上下文明确「No git repository detected — change-set context is unavailable」⇒ 该验收在现环境不可机检 | 改为可跑的静态判据：四个零改档的行数/内容指纹（`node -e` 读档比对基线）或 `git` 不在时的等价断言 |
| 6 | 范围协调 | 🟡 | 前序档仍未收口：`2026-10-15-zero-write-watchdog-criterion.md:60` 仍为「设计完成（判据口径收正（写序 `_mutationSeq`）」、`:190` 起 §3/§4/§5/§6 全空；本批 `:24` 已裁定「两条档不得并存为「都还能干」」，但 `:110` 把处置列为「属父侧批档管理」⇒ 现状两档并存且 §2 在三处相左（谓词闭包 vs `helpers` 导出 · A-2「≥4 命中」 vs A-1「≥3 命中」 · 12 例 vs 5 例） | 协调项（非设计缺陷）：旧档按 §1 裁定落 §3/§4 不适用声明 + §6 吸收指针，本批 §2.10 同步改为「已收口」或保持待办并指认处置轮次 |
| 7 | 方法学 | 🟡 | 缺**最近先例行**（判准 9）：本批 §2 有先例实质（`:110` 上抛 1 指向旧档同源设计 · D4 `:106` 以「闭包无法行为级单测」为理由偏离旧档闭包形 · D2 `:104`），但没有成行给出「实现坐标 ∥ 对应设计档节 ∥ 先例批次」+ 对齐/偏离理由 | 补一行最近先例行：实现坐标（`turn-loop.mjs:62/81/90/276`）∥ 设计档 `§6.32.2 ①` / `§6.32.6 接线①` ∥ 先例批 `2026-10-15`；并显式写「谓词提为模块级导出」为有意偏离（理由 = 改前红/改后绿可行为级断言） |
| 8 | 方法学 | 🟡 | 缺**调研证据行**（判准 10）：未记录查过哪些公共源档（尤其独立文档仓）、是否相关；「none relevant」也须落行，否则读作「未调研」 | 补一行调研证据：列出所查源（如 `AGENTS.md` / `docs/README.md` 文档地图 / 需求档 §4.16）与结论（相关 = 判据句已在盘，或「none relevant」） |
| 9 | 验收 | 🟡 | A-1 的字段退役断言只扫 `turn-loop.mjs`（`:92`「`_turnFilesMark` 全档零命中」），而 `:66` 的论断是「全仓仅 `turn-loop.mjs` 四处 + 设计档改前块」⇒ 「全仓」结论无对应全仓判据（VSC 端壳不在扫描面） | A-1 加一条仓级扫描（含 `thincoder-vscode/**`）或以「`thincoder-core/agent` + `thincoder-vscode/src` 零命中」限定句式，二选一使结论与判据同域 |
| 10 | 清晰度 / 文档卫生 | 🔵 | 定位句失准 + 退役字段残迹：`:66` 称设计档存在「改前块」，但该档 `_turnFilesMark` 只出现在 `:992`「`_turnFilesMark` 是路径数标」（理由注）与 `:1071`「`_turnFilesMark` 退役」（表行），无改前代码块；D1「不留 corpse」与 `:992`/`:1071` 的退役字样并存 | 更正 `:66` 的定位句（改指 `:992`/`:1071`），或把 `:992` 的理由改写成不依赖退役字段名的表述（如「mark = 写序标，语义 = 单调序，故不复用路径数标名」） |
| 11 | 清晰度 | 🔵 | 坐标/数值漂移（同档内与跨档）：设计档 `:569` 记 `thincoder-core/agent/helpers.mjs` 为 `383`，`:1077` 与本批 `:83` 记 `493`；复位锚设计档 `:913`/`:1062` 记 `run-start.mjs:124`「同点」，本批 `:70` 记「`run-start.mjs:128-129` 只在 `!resume` 支复位」 | 同批回读一遍两处坐标，取同一实测值；`run-start` 的 `:124` 与 `:128-129` 若不指同一点，请标明各自指哪条赋值 |
| 12 | 清晰度 | 🔵 | 本批 §2 有两条状态行：`:29`「**状态行**：（eng-designer 写入时更新）」与 `:32` 的实状态并存 ⇒ 骨架占位未清 | 删 `:29` 占位行，或把实状态写回该行 |
| 13 | 需求覆盖 | 🔵 | §2.2 只列 F-ZW1 / F-ZW3 / F-ZW4 / #417，未像前序档那样把 F-ZW2（评审族）/ F-ZW5（送达）/ F-ZW6（边界）列为「零改」行；§2.5 的「不在本批」只点到「评审族判据」 | 补三行零改条目（各自引设计档 §6.32.2 ② / §6.32.5 / §6.32.10-9），使六条覆盖面可对账 |
| 14 | 可行性（核实限制） | 🔵 | 根因链与现量均以代码坐标为证（`turn-loop.mjs:81` 比路径数 · `record-results.mjs:169` 去重 push · `run-start.mjs:107` · `helpers.mjs` 493 行），这些档不在本次评审范围，本评审只核到「三份在范围文档内部自洽」（设计档 `:889`「判据物 = `agent._mutationSeq`」`(:889)`、`:892`「`_touchedFiles` 是**去重路径集**」与本批 `:15-20` 同向） | 实施前用一次实读把四处坐标与两个现量数钉成一份读数（`node` 行扫描输出贴进 §5），使「根因成立」从自述变为可核证 |

计数：🔴 1 · 🟡 8 · 🔵 5（共 14 项）。根因方向（设计档定 `_mutationSeq`、实现在比去重数组）在三份在范围文档中自洽；未通过项集中在「收尾轮同判」的机制级两说、单测档的生命周期/路径/用例映射、以及 git 依赖验收。

VERDICT: changes-required

### 轮次 2（评审子代理）

### 设计评审（二轮 · 独立评审子代理 · 只核首审 🔴1 + 🟡2–5、7–9）

**范围与限制**：评审对象 = 三份在范围文档（本批档 `docs/batches/2026-10-19-zerowrite-criterion.md` · `docs/core/design/AGENT-LOOP-UPSTREAM.md` · `docs/core/requirements/AGENT-LOOP.md`）；代码档不在范围 ⇒ 代码坐标 / 行数 / sha256 按文中自述记、未独立核实。评审上下文无项目标准档、无文档地图声明 ⇒ 方法学按 `AGENTS.md` + 评审准则判定，文档归属按 `AGENTS.md` 指向的 `docs/README.md` 地图口径判定（该地图档不在本范围）。

**三件落定结论**：
① 首审 🔴1 **已真收正、与 `:1011`–`:1012` 同口径（非改成另一种含混）**：设计档 `:915` / `:1123` / `:1137` 现均作「撞帽收尾轮单结（与环内同一谓词，同结 `_zeroWriteTurns`），不另作 alert ∥ streak 判定」，与 `:1012` `maxTurns > 0 && !wroteSince(agent, agent._mutSeqMark)` 同一谓词；全档检索「不另判」= 0 命中；本批档 `:39` 的「四处同一谓词 · 收尾为单结」与之一致。
② 首审 🟡4 / 🟡9 **已落**：用例映射表在盘（`:81`–`:90`，含「不立」行与载体缺口上抛）；仓级扫描已含 `thincoder-vscode/**`（`:107`）。U-7 的断言强度与自述限度仍有残余（表 #1 / #2 / #5）。
③ 编号自洽：设计档 §6.32.8 = 12 用例行 · §6.32.9 = 8 验收行 ·「绿」断言只剩 A-ZW3 / A-ZW7 / A-ZW8（`:1106` / `:1110` / `:1111`），所指 U-ZW 号全在 1–12 定义域；需求档 `:295` N2 已收为「有载体 = U-ZW9–U-ZW12 / U-ZW1–U-ZW8 只有规格」 ⇒ 设计 ∥ 需求两档同类同言、无悬空引用。但本批档 §2 内三处陈述未随修正轮 2 同步（表 #3 / #4）。

| # | 类别 | 严重度 | 问题 | 建议 |
|---|---|---|---|---|
| 1 | 验收（接线漏改的可检强度） | 🟡 | 「接线漏改」只有两条机器判据且都不钉次数/位置：`:107` 的 `_mutSeqMark` **≥3 命中** 与 `:76` U-7 的「两处判据点均调 `wroteSince(...)`」皆为定性/下限断言。漏掉前移赋值（`turn-loop.mjs:90`：只删不补）时 `_mutSeqMark` 恰 3 命中（基线赋值 + 环内调用 + 收尾调用）⇒ 门槛仍过、`_turnFilesMark` 亦零命中 ⇒ 谓词恒判「有落笔」、看门狗永不触发，而现役 7 例全绿。另首审 🔴1 争的那一行本身（`:1012` 收尾谓词的 `maxTurns > 0` 门 + 形态）无任何字面断言，回退成「不判」不会被抓。`:77` 只写了「以静态接线断言代直驱面」，未写它挡得住什么、挡不住什么 | 判据钉成**精确计数 + 字面形态**：`turn-loop.mjs` 内 `_mutSeqMark` 恰 4 处（2 赋值 + 2 谓词调用）、`wroteSince(` 恰 2 处，`helpers.mjs` 恰 1 处导出；并把 `:1012` 收尾行作逐字断言（含 `maxTurns > 0 &&`）。`:77` 改写为「挡得住：残留旧字段名 / 路径数比较回潮 / 判据点少一处赋值；挡不住：赋值位置错放（环头之后、else 支内）、分支内顺序与 alert 接线、行为级连轮读数」，并把挡不住的面显式登记为未测面 |
| 2 | 验收（「绿」的强度与载体不匹配） | 🟡 | 设计档 A-ZW7 `:1110`「U-ZW9 / U-ZW10 / U-ZW11 绿」、A-ZW8 `:1111`「U-ZW10 / U-ZW12 绿」，而 U-ZW10 的规格 `:1096` 是「连 50 轮仅 `read` / `grep` / `git`」的直驱，期望含「第 50 轮起恰 1 条 note」与全程不变量；A-ZW5 `:1108` 自己又把载体降为「谓词级投影」⇒ 本批 U-2 只证 `wroteSince` 返 false，note 条数 ∥ `_zeroWriteTurns` = 50 ∥ 不变量三项均无载体 ⇒ 编号可解析、强度不可兑现。同族：本批 A-7 `:113` 以 U-5 的假 child「46 / 51」断言不变量，而那只是渲染模板顺序，无代码计算该关系 ⇒ 该条对不变量为空判 | A-ZW7 / A-ZW8 按载体实际强度重述（谓词级：同档重写不计 / seq 不变计零 / 非整数不判 / 互斥字段不渲染），把「50 轮 note 恰一条」「`_zeroWriteTurns = 50`」「逐轮 `≤` 不变量」明确列为**无载体、另批**；A-7 换成一条真计算该关系的断言，或删掉该条 |
| 3 | 文档状态（行数 / 坐标漂移） | 🟡 | 本批档 §2.7 行 7 `:102` 记设计档「`1272 → 1272`」且「行数零变——逐行替换」，笔迹坐标取 `:1121` · `:1135`；实测该档现为 **1274 行**（末行空行），两处收正文分别在 `:1123` · `:1137`（`:1121` 现为「边界 5 阈值」、`:1135` 现为 D-ZW5）⇒ 与同档 §2.13 行 6 `:160`「1272 → **1274** · **+2**（实读行数）」及设计档 §6.32.7 行 18 `:1078` 三处互斥，且按 `:102` 的坐标去核会落到无关行 | §2.7 行 7 改为「1272 → 1274 · +2；改后坐标 `:915` · `:1123` · `:1137`」，或直接删该行、指向 §2.13 表（同一事实两处存账 = 漂移源） |
| 4 | 文档状态（待裁项 / 需求档状态陈旧） | 🟡 | 本批档 §2.10 上抛 4 `:128` 仍称「设计档 A-ZW5 以「单元测试档（U-ZW1–U-ZW12）全绿」为现役可红面」并请父侧二选一，而 §2.13 `:149` / `:155` 记该裁定已落、设计档 `:1108` 现已换文 ⇒ 同档一条已收口的待裁项仍挂着旧描述。§2.13 `:172` 仍称需求档 `AGENT-LOOP.md:295` N2「仍以「U-ZW1–U-ZW12」为可机判用例集」，实读 `:295` 已改为「**有载体 = U-ZW9–U-ZW12**」⇒ 与在范围需求档相反 | `:128` 标「已裁定（见 §2.13）」或改写为已落结论；`:172` 改写为「需求档 `:295` 已同步（实读：有载体 = U-ZW9–U-ZW12）」，或删该句 |
| 5 | 清晰度（名称 / 载体不核） | 🔵 | 本批 U-5 `:75` 断言 `checkpoint.turnCapTrace` 携逐字读数，而设计档 §6.32.6 接线③ 的代码块给出的载体是局部 `function traceText(child)`（`:1039` 改前 ∥ `:1047` 改后），§6.32.7 行 13 的改动清单也未列新增导出 ⇒ 若该名不可导入，U-5 会以模块解析错红（与首审 🟡3 同类：红的原因不是判据）。**未核实**（代码档不在本范围） | 实施前实读 `checkpoint.mjs` 的导出面，把 U-5 的导入名与该档导出一致化（或在设计档登记测试缝导出） |
| 6 | 验收（用例区分力） | 🔵 | U-6（`:76`）与 U-2 同构：两者都是「同 mark、`_mutationSeq` 不变 ⇒ `false`」，U-6 不经过 `dispatch-gates.mjs:145-151`（本批零改）⇒ 区分不出「写失败不计」与「未写」，其「接线级」标签（`:76` 与 §2.6 分类）名不副实 | U-6 归入谓词级并说明它只固定「写失败 ⇒ 写序不推进」这一前提，或换成经 `noteExecutedMutation` 结果分类的一例 |
| 7 | 方法学（范围外不可核） | 🔵 | 判准 9 的先例行在盘（§2.11 `:130`–`:136`：实现坐标 ∥ 设计档节 ∥ 先例批 + 「谓词提为模块级导出」的显式偏离理由），但先例批 `2026-10-15-zero-write-watchdog-criterion.md` 及其 `:97` / `:99` / `:100` / `:101` 坐标不在本轮声明范围 ⇒ 对账未核；首审 🟡6（旧档收口）同因不可核 | 每轮把先例批列入范围，或在 §2.11 直接摘引先例对应句（自足对账，免再查他档） |
| 8 | 验收（扫描域与断言语域） | 🔵 | A-1 `:107` 的扫描域 = `thincoder-core/**` + `thincoder-vscode/**`（379 档），而结论句是「`_turnFilesMark` 改后零消费者 ⇒ 退役删除」；`thincoder-cli/**`、`thinworker/**` 不在扫描面 ⇒ 断言语域宽于扫描域（**未核实**：代码不在范围） | 结论句限定为「两源码树零命中」，或把 `thincoder-cli/**` 并入扫描 |
| 9 | 文档卫生（首审 🔵10 / 🔵11 残留） | 🔵 | 设计档 `:992` 的规范面代码注释仍以退役字段名立理由（`_turnFilesMark` 是路径数标…）、`:1071` 记「`_turnFilesMark` 退役」⇒ 实施后注释指向已删字段；同档 `:569` / `:489` 记 `helpers.mjs` = 383 行、`:1077` 记 493 行（本批受影响档现量）⇒ 同一档内两值并存，现量无法自证 | `:992` 改写为不依赖退役名（写序标 ≠ 路径数标的语义差）；`:1077` 标注「现量实读」，旧节的 383 视为历史读数（或统一为一行现量真源） |
| 10 | 需求覆盖 | 🔵 | §2.2 仍只列 F-ZW1 / F-ZW3 / F-ZW4 / #417，未给 F-ZW2（评审族）/ F-ZW5（送达）/ F-ZW6（边界）的「零改」行；F-ZW2 的 U-ZW7 / U-ZW8 现由需求档 `:295` N2 自认无载体 ⇒ 该需求的验收在本批与后续皆无执行面（已声明、非隐瞒） | 补三行零改条目（回指 §6.32.2 ② / §6.32.5 / §6.32.10-9），使六条需求可逐条对账；F-ZW2 的「无载体」在 §2.10 上抛里单列一条 |

计数：🔴 0 · 🟡 4 · 🔵 6（共 10 项）。首审 🔴1 与 🟡2 / 🟡3 / 🟡5 / 🟡7 / 🟡8 已验证落定；设计 ∥ 需求两档同口径、编号自洽；未通过项集中在**机器判据的强度**（次数 / 位置 / 字面形态未钉 ⇒ 漏一处赋值或回退收尾行不被抓）、**「绿」的强度超出载体**、以及本批档 §2 内三处陈述未随修正轮 2 同步。

VERDICT: pass

## §4 用户批准（主 agent）

### 用户批准（2026-10-19）

**用户逐字**：15:06「感觉零写轮次计数器有问题，你排查一下，**总是错误的报零写入**」⇒ 立需求 · **15:08「开批正式修」** ⇒ 走全链（不走轻通道）· 14:34「都点火，都收口」⇒ 全链启动权。

**批准口径**：判据物由去重文件数改 `_mutationSeq`；**判据强度父侧钉死**——`_mutSeqMark` **恰 4** ∥ `wroteSince(` **恰 2** ∥ 收尾行**逐字**（含 `maxTurns > 0 &&`）。理由：`≥3` 的下限断言拦不住「只删不补前移赋值恰 3 处」——那种情形门槛仍过，而看门狗永不触发、7 例全绿。

**批准后的实施读数**：五档落地（`helpers` 499 ∥ `turn-loop` 286 ∥ `run-start` 160 ∥ `checkpoint` 127 ∥ 单测 101）· 计数三项全符 · 改前红 exit 1 / 改后绿 7/7 · 四零改档指纹相符 · 回归 15/0。

## §5 实施记录（eng-coder）

### §5.1 实施摘要（eng-coder · 2026-10-19）

**状态行**：实施完成（四档代码 + 一档单测；7 例绿；内审 1 轮 · 代码评审 2 轮；终态 = clean）

**改了什么（判据物换物：去重文件数 ⇒ 单调写序）**

| # | 文件 | 行数 改前 → 改后 | sha256 前 12 | 改动 |
|---|---|---|---|---|
| 1 | `thincoder-core/agent/helpers.mjs` | 493 → **499** | `d0cec15db9ba` | 新增模块级导出 `wroteSince(agent, mark)`：`_mutationSeq` 为整数 ⇒ `seq !== mark`；否则 `true`（记「有落笔」不判，**无 `?? 0`**） |
| 2 | `thincoder-core/agent/turn-loop.mjs` | 282 → **286** | `585ebba70cea` | 基线 `:64` / 轮顶判 `:85` / 前移 `:94` / 收尾 `:280` 四处换判据物；`_segmentTurns` 环头 +1（`:79`）；import `wroteSince`；`_turnFilesMark` 退役（零命中） |
| 3 | `thincoder-core/agent/run-start.mjs` | 159 → **160** | `34ed91b92da2` | `_segmentTurns = 0` 段起点复位（`:108`，与 `_zeroWriteTurns` 同点、不受 `!resume` 门控）；streak / 闩仍在 `!resume` 支复位（`:130-131`） |
| 4 | `thincoder-core/agent-tools/checkpoint.mjs` | 122 → **127** | `d9deb9edb7fb` | B 面读数带分母（`:28-34`）+ 撞帽载荷职责句（`:88-91`）；缺分子或分母 ⇒ 整元不渲染 |
| 5 | `docs/batches/2026-10-19-zerowrite-criterion.test.mjs` | 新 · **101** | `0cd65c72a919` | U-1…U-7 七例（行为级 6 + 静态接线 1）；随批档留存 |

**为什么这么改**：`record-results.mjs:169` 是 `if (!includes(abs)) push`（去重数组）⇒ 子代理重写同一批档，`_touchedFiles.length` 一动不动 ⇒ 旧判据读成「零写」，触发假看门狗提醒，父侧照着假信号去 observe / cancel。写侧记账 `_mutationSeq` 每次写 +1、不去重（`advisor-settle.mjs:48`，唯一呼点 `dispatch-gates.mjs:150`），判据物换成它即可让「同档重写」计为落笔。

**判据读数（实跑 · cwd = `d:\teamcode\thincoder`）**

- 改前红：`node --test docs/batches/2026-10-19-zerowrite-criterion.test.mjs` ⇒ **exit 1 · tests 1 · pass 0 · fail 1**，错误 = `SyntaxError: The requested module '../../thincoder-core/agent/helpers.mjs' does not provide an export named 'wroteSince'`。
- 改后绿：同一命令 ⇒ **exit 0 · tests 7 · pass 7 · fail 0**（终态档 101 行，含修复轮追加的断言）。
- 精确计数：`turn-loop.mjs` `_mutSeqMark` **恰 4 处**（2 赋值 `:64`/`:94` + 2 谓词调用 `:85`/`:280`）· `wroteSince(` **恰 2 处** · `_turnFilesMark` **0** · `agent._touchedFiles.length ===` **0** · `helpers.mjs` `export function wroteSince(` **恰 1 处**。
- 收尾行逐字（去首尾空白后全等）：`if (maxTurns > 0 && !wroteSince(agent, agent._mutSeqMark)) agent._zeroWriteTurns += 1`（`turn-loop.mjs:280`）。
- `node --check` 五档（四代码 + 单测）全部通过；`thincoder-core npm test` ⇒ **15 pass / 0 fail**（该仓现仅 2 个测试档；`thincoder-cli` / `thincoder-vscode` 的 `test/` 无 `*.test.mjs` ⇒ 空绿，不作发布级验收）。
- 四零改档指纹（逐档实读，与 §2.8 A-6 基线一致）：`record-results.mjs` 195 · `cd8f19a37b02` ∥ `dispatch-gates.mjs` 152 · `e7ef2a383a3b` ∥ `advisor-settle.mjs` 239 · `cb7d02c0500f` ∥ `zero-write-watch.mjs` 78 · `b7640a81ec09`。
- 越界改动：无（改动全部落在 §2.7 列出的 5 档内）。

**内审与代码评审（本会话内）**

- 内审 1 轮（读-only 子代理，对照设计 §6.32.2 ① / §6.32.6 / §6.32.4）：核心四处接线与目标形逐字一致，零越界；提 3 条改进（A-7 恒真断言、行数预算、U-6 与 U-2 同构）。
- 代码评审 2 轮（独立 advisor）：首轮 **pass**（🔴 0 · 🟡 3 可选 · 🔵 4）；二轮只核修复声明 ⇒ **pass**（🔴 0）。经二轮真修：U-7 增补 B 面分母接线计数断言（A-3 有载体）、计数前剥注释（消除注释染色假红）；部分落：U-5 仍留一条样本算术断言、U-6 门坐标只在单测注释改正。

**未测面（明列——不计入「已验」）**

1. 赋值**位置**错放（基线挪到环头之后 / 前移挪进 else 支）——U-7 只数出现次数，不判位置。
2. 分支内顺序与 `maybeZeroWriteAlert` 接线（streak +1 → alert → else 重置的真实顺序）。
3. 连轮行为读数（真两轮「写 / 不写」下两个计数器的走向）——`runTurnLoop` 无模型注入缝，需 loader 级桩。
4. 撞帽收尾轮与环内结账不重复计数的行为级验证（`maxTurns` 边界）。
5. A-7 不等式 `_zeroWriteTurns ≤ _segmentTurns` 的**动态**机检：现仅固定样本算术 + 静态结构前提（分母 +1 恰 1 处、分子自增恰 2 处），而 `≤` 成立所依赖的 `if (turn > 0)` 门（`turn-loop.mjs:84`）无断言——把环内自增移出该门仍 7 例全绿。
6. U-4 对「非整数 ⇒ 不判」的区分力（无 `Number.isInteger` 守卫的实现同样返 `true`）。
7. U-6 对「写失败不推进写序」的区分力（前提门已核在盘：`dispatch-run.mjs:136` `!raw.startsWith("Error:")`，routed 面 `:82`；未直驱）。
8. 改前红只观测到聚合红（`import` 缺导出使整档 1 fail）；终态档比出红时多 4 条断言，其红态为**推断**（均指向本批新增代码行），未在码未改状态下复跑最终档。

**上抛**

- [上抛·知会] 设计档漂移（eng-designer 笔，本席不改）：① `AGENT-LOOP-UPSTREAM.md:957` / `:1106` 的 B 面单源行锚仍是 `checkpoint.mjs:28-31` ∥ `:85-86`，实读为 `:28-34` ∥ `:88-91`；② `:1110` / `:1111` 仍写「U-ZW9 / U-ZW10 / U-ZW11 绿」「U-ZW10 / U-ZW12 绿」，而本批载体是谓词级投影（A-ZW5 `:1108` 已自认）；③ §6.32.7 行 17 记 `helpers.mjs` 493 → ~496，实读落地后 499 行（距 500 建议线 1 行）。
- [上抛·知会] 批档 §2 漂移（eng-designer 笔）：`:76` 把「`Error:` 前缀结果不推进写序」这道门指为 `dispatch-gates.mjs:145-151`，而该函数 `noteExecutedMutation(agent, tool, args)` 无结果入参；门实际在 `dispatch-run.mjs:136`（routed 面 `:82`）。同句还把 U-6 归在「改后绿（接线级）」下，与单测档自注的谓词级互斥。

**文档检查门读数**：`doc_check(mode:"gate", target:"d:\teamcode\thincoder")` ⇒ `DOC-CHECK GATE: ERROR（引擎已更新（doc-check/index.mjs mtime 2026-10-19T03:32:12.693Z … > 进程启动 2026-10-19T02:35:55.703Z），请重启会话后复跑）`——本会话加载的引擎早于盘上引擎档，未取得 PASS，如实记录；未据此改任何文档。

## §6 验证与收口（父代理）

### 收口（2026-10-19）

**角色表**：讨论 ∥ 收口 = 主 agent · 设计 = eng-designer `#42`（首稿）+ `#44`（修正轮 1）+ `#45`（修正轮 2：A-ZW5 收正）· 评审 = advisor `#43`（首审 changes-required · 🔴1 · 🟡8 · 🔵5）+ `#46`（二轮 pass · 🟡4 · 🔵6）· 实施 = eng-coder `#47`。

**状态行**：实施完成 · **已收口 2026-10-19**。

**病根与交付（一行一个数）**：判据物由 `_touchedFiles.length`（**去重数组**，`record-results.mjs:169` `if (!includes(abs)) push`）改为 `_mutationSeq`（`advisor-settle.mjs:45`–`:48`，每次写 +1 不去重）。五档落地：`helpers.mjs` 493→**499**（`wroteSince` 导出恰 1）· `turn-loop.mjs` 282→**286**（`_mutSeqMark` **恰 4**、`wroteSince(` **恰 2**、`_turnFilesMark` **0**、路径数比较 **0**）· `run-start.mjs` 159→**160** · `checkpoint.mjs` 122→**127**（B 面带分母）· 单测档新建 **101** 行 7 例。

**判据读数**：**改前红** exit 1 / tests 1 / pass 0 / fail 1（`does not provide an export named 'wroteSince'`）· **改后绿** exit 0 / **7 pass** / 0 fail · `node --check` 五档全过 · `thincoder-core npm test` **15 pass / 0 fail** · 四零改档行数与 sha256 指纹逐档相符（`record-results` 195·`cd8f19a37b02` ∥ `dispatch-gates` 152·`e7ef2a383a3b` ∥ `advisor-settle` 239·`cb7d02c0500f` ∥ `zero-write-watch` 78·`b7640a81ec09`）· 收尾行逐字全等（含 `maxTurns > 0 &&`）。

**修正轮落地前置**：首审 🔴1（三处「不另判」与 §6.32.6 收尾单结互斥）→ 修正轮 1 收正为「收尾单结（同一谓词）+ 不另作 alert/streak 判定」，二轮复核「与 `:1012` 同口径、全档零残留」· 首审 🟡2–5、7–9 已落 · 修正轮 2 收 A-ZW5（现役可红面 = 本批 7 例，U-ZW1–U-ZW8 从未建档）并同步需求档 `:295` N2 · 实施席内审 1 轮 + 代码评审 2 轮 pass · **终态 `clean`**。

**搁置清单回核**：`#1707`（设计档三处漂移 + 批档 §2 两处指错）转收口同轮；**未测面两条如实留档**——① **改前红只有聚合读数**（import 缺导出使整档 1 fail），终态档 4 条新增断言的「能红」属**推断**未实测；② 环内自增移出 `if (turn > 0)` 门后 **7 例仍全绿** ⇒ `_zeroWriteTurns ≤ _segmentTurns` 不变量可破而不被抓。**暂缓批复核：无。**

**文档机检门**：会话内 = `ERROR（引擎已更新）`；新进程真读数待复跑（收口前置）。

**用户文档面同拍**：无用户可见能力变更（内部告警判据 + 撞帽读数文案）；父侧提示词面的「诊断触发」职责条**不在本批**（§2.2 已声明）。

**待办勾销**：`#1706` 随本批收口核销；`#1707` 挂收口同轮。

**前批遗留**：`2026-10-15-zero-write-watchdog-criterion.md`（同一设计、四段空白、从未实施）按 §1 裁定收口为「设计已被本批吸收」——**这是本批被发现的原因，也是本批最重要的一条教训：点火前未扫台账／批档，同一件事四天内设计了两遍。**

**结算读数**：本批未决项 = 1（`#1707`）。
