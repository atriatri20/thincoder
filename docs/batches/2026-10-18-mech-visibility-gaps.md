# 2026-10-18 · mech-visibility-gaps
> 六段 append-only，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 编制：主 agent · 2026-10-18 · 来源 = 用户 2026-10-18 21:51「这五个新问题都立刻处理掉」——三条产品行为变更合并为一批（同一交付目标：把「今天机制做实后露出的观测/配置缺口」补齐）：#1661 设计轮轮数对模型不可见（规则存在但不可观测）· #1665 report 模式不查引擎版本（旧引擎读数被当真值，已致一次误判）· #1668 CLI `/config` 无「回到 auto」写面（配置能写死不能清回，两端不对称）。另两条缺陷（#1671 提示词面 / #1672 server 注释）已在轻通道轮 `2026-10-18-mech-visibility-light` 由父侧直接改。。
> 台账 = #1661（core · 归批）。前情 = 无（独立批）。
## §1 讨论（主 agent）
**状态行**：已收口 2026-10-18
<§1 模板占位：本批条目 / 关键判据 / 授权口径>

### 讨论收敛（父侧）

**来源**：用户 2026-10-18 21:51「这五个新问题都立刻处理掉」。五条中两条（提示词面 / server 注释）已在轻通道轮 `2026-10-18-mech-visibility-light` 由父侧直改；本批 = 余三条产品行为变更。

**共同病根**：三条都不是「今天做坏了」，而是**今天把机制做实之后露出来的缝**——规则写了模型看不见（`#1661`）、读数可信度无标识（`#1665`）、配置能写死不能写回（`#1668`）。

| # | 台账 | 现象（实证） | 本批要答 |
|---|---|---|---|
| 1 | `#1661` | `persona-eng-designer.md:35` 写「首版 ≤15 轮 / 过 7 轮未落笔降级」，实跑 `#14` = **28 轮零写入**、`#15` = **16 轮零写入**——规则要求自观测一个模型看不见的量 | 设计轮轮数注入（照 goal 预算先例） |
| 2 | `#1665` | `report` 模式按 DD-91 不查引擎版本；实害 = `#17` 拿旧引擎「锚 159」当真值，父侧同刻真值 **0**，差点推翻正确基线 | 只加注记行（三不改） |
| 3 | `#1668` | CLI `/config` 只能写数值，清键要手改配置文件；VSC 空串即清键（`settings.mjs:42`）⇒ 单向门 | 加「回 auto」写面（删键） |

**边界**：不动今天刚落的三套机制（batch 链门/重开径 · doc-check 两机械点 · `requestBudget` 单算式）；不改 `STATUS_WORDS`；不新增豁免清单；不改需求档（F8 是否增 report 注记句由本 §1 裁定 → 见下）。

**父侧裁定（本条 §1 落定）**：需求档 `DOC-CHECK.md` 的 F8 补一句 report 注记口径——**理由**：F8 现只写「gate 校验版本」，而 report 注记是本批新增的用户可见面；需求档不载则「报告态读数可信度」在需求层无出处，下一轮读需求的人会以为 report 无需标识。**落法** = 只加一句、不重述机制（判据单源仍 = `DOC-DISCIPLINE.md` §3.20）。

**验收面**：三条各有「落点 + 机判形」（设计档 §2 已给）。实现后须过：批内单测全绿 · `bench/check` 118/0 · 本批触及档 doc_check 零命中。

### §1 前提补正（父侧 · 对 `eng-designer#5` 上抛）

| 过期处 | 原文 | 补正 |
|---|---|---|
| `:23` | 「F8 现只写「gate 校验版本」…落法 = 只加一句」 | **F8 已载**——本父侧 21:58 已把 report 注记句写入 `docs/core/requirements/DOC-CHECK.md:25`（早于设计报告）。故 §2 二七.4 的「待裁」撤回、二六 不做面写「不改需求档（已载）」——`#5` 已按此改 |
| `:6` | 状态行「进行中（…）」 | 阶段实况 = **设计完成**（§2 状态行 `:30` 已由工具写入「设计完成（轮次 2…）」），§1 的括号占位随本段失效 |

**台账登记（`#5` 上抛·知会）**：`cmd-config.mjs` 过 500 顾问线的拆分（两步路径 + 行数账已在 §2 二三 注）**本批不做**，须另批——登记为独立行，trigger = `归批`。

**他档坐标漂移（`#5` 上抛·知会，非本批写域）**：`MODEL-BENCH.md:1357` 记 `_currentTurn` 在 `turn-loop.mjs:66`（实 `:74`）；`TURN-CAP-CONTINUE.md:48` 记帧调用点 `:65` / 回填 `:66-67`（实 `:73` / `:74-75`）——登记为独立行，归坐标清扫批。

**行数口径（`#5` 上抛·知会）**：评审报 `TUI-COMMANDS.md` = 201 系 `read` total 口径（含尾空元素）；仓内口径 = 换行符计数 ⇒ **200**。**两种口径并存，引用须带口径名**；本批按仓内口径落数（与 `scripts/doc-check.mjs` 91 行同口径）。

## §2 批次任务与设计（eng-designer）
<§2 模板占位：本批条目（覆盖） / 设计档落点 / 机制设计 / 受影响文件与测试覆盖 / 验收对照 / 关键决策 / 上抛项>

**状态行**：设计完成（2026-10-18 轮次 2：评审轮 1 的 14 条已逐条落定（见二 十）；本批发现 6 条（二 七））

### 二 一、本批覆盖的条目（三条 · 来源 = 档头「编制」行 + 台账 #1661 + 派单五参数）

| # | 条目 | 判定句（机器可验） |
|---|---|---|
| 1 | **#1661 设计轮轮数对模型不可见** | `eng-designer` 第 5 轮起每工具轮末注入轮次行；第 8 轮仍未落盘 ⇒ 注入「先落骨架」句；其余角色 / depth-0 零注入（`designTurnReminder` 五断言 + 接线一条） |
| 2 | **#1665 report 模式不查引擎版本** | 引擎 stale ⇒ report **首行前**多一行 `[doc_check note] …`；既有行逐字不变 · 不产 verdict · 不阻断；无 stale ⇒ 报面逐字同改前（`reportEngineNote` 两断言 + report 分支接线） |
| 3 | **#1668 CLI `/config` 无「回 auto」写面** | 数值项输入 `auto` ⇒ 盘上 `agent.compactThreshold` **键消失** · `compactThresholdAuto` true · 显示回 `(auto)`；输入数值仍建显式键；`abc` ⇒ 报错零落盘；空输入 ⇒ 取消（R12） |

不在本批：`#1671` / `#1672`（已在轻通道轮 `2026-10-18-mech-visibility-light` 由父侧直接改）。

### 二 二、设计落点（逐字文案住设计档，本节只给落点与判据——不复述，防漂）

**① #1661** 落点 = `AGENT-LOOP.md` §6.6「回合后注入」新增条目「设计轮轮数注入」（`docs/core/design/AGENT-LOOP.md:334`）。
- 实现点 = `thincoder-core/agent/post-turn.mjs`（与 goal 预算同函数体、`callbacks.onTurnEnd` 之前）；纯函数 `designTurnReminder({ role, turn, wrote })` → 注入串 \| `null`。
- 判据源 = `agent._currentTurn`（**链内累计轮号**——跨段累计、续跑不重置；`thincoder-core/agent/turn-loop.mjs:73-74` → `helpers.mjs:274-276`）+ `(agent._touchedFiles ?? []).length > 0`（该集合在 resume 保留集内 ⇒ 续跑段沿用前段写入痕迹）；阈值 `DESIGN_TURN_NOTICE_AT = 5` / `DESIGN_TURN_SKELETON_AT = 8` / `DESIGN_FIRST_VERSION_TURNS = 15`（注入串里的 15 由该常量插值）；`turn < 5` 静默。
- 注入形两条（常行 / 降级行）逐字 = `AGENT-LOOP.md` §6.6 该条「注入形逐字」块（本处不复制）。
- 边界（如实登记）：机器只看得见「写过文件」，看不见「写的是不是设计档 / 批次档 §2」；轮号 = 链内累计（续跑不重置——续跑段起手即带前段轮数与写入痕迹，可能首轮即过阈值）；不取 `injectPostTurn` 的 `turn` 形参（段内 0 起、续跑重数）——理由见 `AGENT-LOOP.md` §6.6。

**② #1665** 落点 = `DOC-DISCIPLINE.md` §3.20「引擎版本一致」的「gate 裁定 · report 注记」条（`docs/core/design/DOC-DISCIPLINE.md:1051`–`:1057`）+ 工具形 `:1017` + DD-91（`:1197`）+ A-DD30 ①（`:1842`）。
- 实现点 = `doc-check/version.mjs` 新增 `reportEngineNote({ startMs, stale })`（stale 空 ⇒ `null`）与 `withEngineNote(report, version)`；消费点 = `agent-tools/doc-check.mjs` report 分支返回值（gate 分支零改）。
- 触发与 gate 同源（`staleEngineFiles()`）；注记逐字 = 上述 §3.20 条内串（`；` 连列同 `gateEngineError` 形）。
- 三不改（明写）：不改既有行、不改 verdict（report 本无 verdict）、不改 PASS 语义（gate 逐字不变）。
- 配套文案收窄：gate 处置行括注改为「`report` 不裁定、不产 verdict（陈旧时只在首行前加注记）」（`thincoder-core/doc-check/version.mjs:58`——旧括注「report 不查版本」在新口径下失真）；落点已记入 `DOC-DISCIPLINE.md` §3.20（`:1057`）。

**③ #1668** 落点 = `CONTEXT-COMPACTION.md` §6.17「写回面（CLI `/config` 数值项——回 auto）」（`docs/core/design/CONTEXT-COMPACTION.md:663`–`:668`）+ 用例 R12 / R13（`:707` / `:708`）+ 边界（`:710`）；命令面一句话 = `TUI-COMMANDS.md` §5.3（`docs/cli/design/TUI-COMMANDS.md:135`）。
- 写盘动作 = `delete raw.agent.compactThreshold`，经 `persistRaw` 单通道（与 TUI 其余写点同源 `writeConfigAtomic`）。
- 与 VSC 对齐：VSC 空串 ⇒ `patch.compactThreshold = undefined` ⇒ `applyAgentPatch` 删键（`thincoder-vscode/src/extension/settings-panel-write.mjs:77`）——两端输入形不同、**写盘结果同为删键**。
- 用户可见文案三条（提问行 / 保存回显 / 报错行）逐字 = §6.17 上述条内（本处不复制）。

### 二 三、受影响文件表（现行行数 + Δ）

| 档 | 现行 | 预期 Δ | 改动 |
|---|---|---|---|
| `thincoder-core/agent/post-turn.mjs` | 70 | +22 ≈ 92 | 三常量 + `designTurnReminder` + 注入三行 |
| `thincoder-core/doc-check/version.mjs` | 65 | +12 ≈ 77 | `reportEngineNote` + `withEngineNote`（stale 列表形与 `gateEngineError` 共用）+ `:58` 处置行括注收窄（净 0 行） |
| `thincoder-core/agent-tools/doc-check.mjs` | 74 | +2 ≈ 76 | report 分支 `withEngineNote(…)`；import 一行 |
| `thincoder-core/tool-docs/doc_check.md` | 49 | +4 ≈ 53 | report 注记一句；「five engine files」→ 六档（补 `doc-check/version.mjs`） |
| `thincoder-cli/src/tui/cmd-config.mjs` | 521 | +14 ≈ 535 | 输入解析 `auto` 分支 + 三条文案 + 抽出导出纯函数 `compactThresholdSuffix(auto)`（`:358` 内联三元改调用）。**过 500 顾问线（现档 521 已过）、未触 800 硬限**——拆分预案见二 三 注 |
| `docs/core/design/AGENT-LOOP.md` | 500 | +15 → **515**（实测） | §6.6 新条目 + 判据源四条（链内累计 / 为何不用 `turn` / 写入痕迹 / 续跑后果）+ 机判拆两行 |
| `docs/core/design/DOC-DISCIPLINE.md` | 1949 | +8 → **1957**（实测） | §3.20 四落点（工具形 / 引擎版本一致 / DD-91 / A-DD30①）+ report 注记条「配套文案收窄」一句 |
| `docs/core/design/CONTEXT-COMPACTION.md` | 738 | +10 → **748**（实测） | §6.17 写回面 + 两端对齐 + R12 / R13 + 报错行射程 + 边界 |
| `docs/cli/design/TUI-COMMANDS.md` | 199 | +1 → **200**（实测，已在盘） | §5.3 `/config` 一句（`:135`） |
| `.thincoder/tmp/2026-10-18-mech-visibility-gaps-dtb.test.mjs` | 0 | ≈ +55（**收口随批删**——先例 = `CONTEXT-COMPACTION.md:615` R4 行） | T-DTB1–6 + 接线（`#1661`） |
| `.thincoder/tmp/2026-10-18-mech-visibility-gaps-den.test.mjs` | 0 | ≈ +30（同上） | T-DEN1–2 + 接线（`#1665`） |
| `.thincoder/tmp/2026-10-18-mech-visibility-gaps-ct.test.mjs` | 0 | ≈ +35（同上） | T-CT1–5（`#1668`） |

**跨文件线**：无。`post-turn.mjs` 92 / `version.mjs` 77 / `doc-check.mjs` 76 / `cmd-config.mjs` 535——均低于 800 硬限；`cmd-config.mjs` 现档 521 已过 500 顾问线（改后 535），拆分预案见下注。

**注 · `cmd-config.mjs` 拆分预案（过 500 顾问线，本批不做）**：现档 521 行（实测，换行符计数）已过 500 顾问线——本批不扩机制，只加输入分支与一个纯函数。拆分路径 = ① 数值项编辑支（提问 → 解析 → 落盘 → 回显，`cmd-config.mjs:491`–`:519`）连同 `ctDisplay` / `ctSuffix` 两个纯函数迁入新档 `cmd-config-numeric.mjs`（≈ −34 行 ⇒ ≈ 501）；② 再将三个已导出的纯函数（`embeddingPatch` / `poolCur` / `effortMenuLevels`，`:9`–`:32`，≈ −24 行）迁入 `cmd-config-helpers.mjs` ⇒ ≈ 477，落回 500 内。**本批不做**——改动面 = 产品代码重构，须另批 + 独立设计。请父侧登台账。

### 二 四、机判形（构造 + 断言）

**A #1661（`post-turn` 单测）**
1. `designTurnReminder({ role:"eng-designer", turn:4, wrote:false })` ⇒ `null`（早期静默）
2. `turn:5, wrote:false` ⇒ 含 `design round turn 5/15` + `nothing has been written to disk yet`，**不含** `degrade the delivery NOW`
3. `turn:8, wrote:false` ⇒ 含 `degrade the delivery NOW` + `skeleton`
4. `turn:8, wrote:true` ⇒ 含 `something has been written to disk`，不含降级句
5. `role:"eng-coder"` / `role:null` ⇒ `null`
6. 接线：fake agent `{ _role:"eng-designer", _currentTurn:8, _touchedFiles:[], history:[], _pendingReminders:[], config:{} }` 调 `injectPostTurn(fake, [], [], {}, 7)` ⇒ `history` 末条 = 降级串（`turn=7` = 段内 0 起第 8 轮、`_currentTurn=8` = 链内累计——二者故意不同，设计取后者，与 `AGENT-LOOP.md` §6.6 判据源同源）
7. 续跑：fake agent `{ _role:"eng-designer", _currentTurn:12, _touchedFiles:["docs/x.md"], … }` ⇒ 常行、含 `turn 12/15` 与 `something has been written`，不含降级句（续跑段沿用前段痕迹的登记形态）

**B #1665（`version.mjs` 单测 · 假时钟 + 假 stat，不碰产品档 mtime）**
1. `reportEngineNote({ startMs, stale:[{file:"doc-check/index.mjs", mtimeMs: startMs+1000}] })` ⇒ 串首 `[doc_check note] 引擎陈旧（` 且含档名与两个 ISO 时刻
2. `reportEngineNote({ startMs, stale:[] })` ⇒ `null`；`withEngineNote("R", {startMs, stale:[]})` ⇒ `"R"`（逐字返回）
3. `withEngineNote("R", staleVersion)` ⇒ `注记行\nR`（首行为注记、原报面逐字跟在后面），且串内**不含** `DOC-CHECK GATE:`
4. 接线（源面）：`agent-tools/doc-check.mjs` report 分支含 `withEngineNote(` 且同一返回表达式含 `staleEngineFiles(`（行序可判）

**C #1668（`cmd-config` 单测 · 临时 config 文件）**
1. 输入映射：`auto` / `AUTO` / ` auto ` ⇒ 删键；`700000` ⇒ 显式 700000；`abc` ⇒ invalid；空 ⇒ 取消
2. 写盘：临时档 seed `{agent:{compactThreshold:700000}}` ⇒ 走删键 mutate + `persistRaw(mutate,{path})` ⇒ 重读 JSON 无 `agent.compactThreshold`
3. 派生：同档 `loadConfig()` 语义下 `compactThresholdAuto === true` 且 `compactThresholdResolved` 为数（auto 派生）
4. 显示：`compactThresholdSuffix(true)` === `" (auto)"`；`compactThresholdSuffix(false)` === `""`（符号 = 本批从 `:358` 内联三元抽出的导出纯函数，三处显示路径 `:360` / `:364` / `:392` 改调它——列在二 三）

### 二 五、验收对照（任务书五条 → 落点）

| 任务书 | 落点 |
|---|---|
| ① #1661 注入形逐字 + 阈值 + 单测机判 | 二 二 ① · 二 四 A · `AGENT-LOOP.md` §6.6 |
| ② #1665 注记逐字 + 位置 + 三不改 + 机判 | 二 二 ② · 二 四 B · `DOC-DISCIPLINE.md` §3.20 |
| ③ #1668 文案逐字 + 写盘动作 + VSC 对齐 + 机判 | 二 二 ③ · 二 四 C · `CONTEXT-COMPACTION.md` §6.17 |
| ④ 三条受影响文件表 + 不做面 | 二 三 · 二 六 |
| ⑤ 无新增豁免清单 / 不改既有判据语义 | 二 六（逐条列） |

### 二 六、关键决策与不做面

**关键决策**
- D1 注入点与 goal 预算同文件同位置（`post-turn.mjs`）——先例对齐；偏离 = 新增按角色的纯函数，不把 designer 预算塞进 goal 分支（goal 只活在 depth-0）。
- D2 用「轮次 + 是否落过盘」而非「连续零写 streak」：persona 的判据是「首版一次也没落盘」，不是「中途停写」；`_zeroWriteStreak` 是看门狗（#934）的量，语义不同，不借。
- D3 阈值 5 / 8：5 在「过半 >7」之前 3 轮给计数；8 与 persona 判定点（`turn > 7`）同一处。
- D4 注记放**首行前**而非尾行：报告态无 verdict、首行无机器消费者；尾部是略读最先丢的部分。
- D5 注记单源住 `version.mjs`（与 `gateEngineError` 同档同形），不新建模块。
- D6 `auto` 输入形而非「空输入 = auto」：空输入现语义 = 取消（其余数值项共用同一提示），改它会把取消变删除——危险面。

**不做面（逐条）**
- 不改既有机制本体：batch 链完整性门 / 重开径 · doc-check 两机械点判据 · `requestBudget` 单一算式（本批只加注记与写回面，判据不动）。
- 不改 `STATUS_WORDS` · 不新增豁免清单 · **不改需求档**（F8 已载 report 注记句——`docs/core/requirements/DOC-CHECK.md:25` 实读；本批零改）· 不碰 `scripts/**`。
- 不改 gate 的三串 verdict 与 gate 报面（逐字不变）。
- 不改 VSC 设置面板（输入形差异已登记，写盘结果已同）。
- 不给 `eng-coder` 注入轮次（理由见 `AGENT-LOOP.md` §6.6；另裁）。
- 不改两份 `persona-eng-designer.md`（运行时不需增引用；如需，须运行时面 + 设计副本同步，属产品代码面）。

### 二 七、上抛与发现（逐条）

1. **〔一致性 · 已就地收正〕** `CONTEXT-COMPACTION.md` §6.17 记的 `/config` 四处读点行号（`:352/:356/:384/:488`）为旧值，实际 = `:360/:364/:392/:497`——已随本批修正。
2. **〔一致性 · 实现轮落〕** `thincoder-core/tool-docs/doc_check.md:28-30` 写「five engine files」且只列五档，而 `ENGINE_FILES` 已是六档（含 `doc-check/version.mjs`；`DOC-DISCIPLINE.md:1046` 亦称六档）——随注记句一并改为六档。
3. **〔待裁 · 主 agent 账目面〕** 批次档头「台账 = #1661」只登一条，本批覆盖三条（#1661/#1665/#1668）——台账行与 §1 需主 agent 补齐（台账写入面在主 agent）。
4. **〔已闭 · 需求档面〕** 需求档 `docs/core/requirements/DOC-CHECK.md` F8 **已载** report 注记句（`:25` 实读：「report 模式出注记行（不改既有行 ∥ 不改 verdict ∥ 不改 PASS 语义）」）——上抛撤回，本批零改需求档。**另**：§1（`:23`）「F8 现只写 gate 校验版本」的前提已过期，§1 笔在主 agent，请其按现盘改写。
5. **〔知会 · 记录面〕** §1 讨论段仍为模板占位（主 agent 段）；本批条目依据 = 档头「编制」来源行 + 台账 #1661 + 派单五参数及其 `file:line` 证据。§1 收口前需主 agent 补齐，不阻断本设计。
6. **〔知会 · 数量面〕** persona「首版 ≤15 回合」与 `agent.subagentTurns`（默认 100）是两个量：注入只报 persona 预算，不报段帽——记录以免后代把 `maxTurns` 当设计预算。

### 二 八、落盘后实测（轮次 2 读数）

- **口径**：行数 = 换行符计数（`wc -l` 等价——与档内既有读数 `scripts/doc-check.mjs（91 行）` / `doc-check-width.mjs（6 行）` 同口径；`read` 工具的「N lines total」把尾部空元素也算一行，比本口径大 1）。
- **设计档实测（轮次 2 落盘后）**：`AGENT-LOOP.md` **515**（批起 500）· `DOC-DISCIPLINE.md` **1957**（1949）· `CONTEXT-COMPACTION.md` **748**（738）· `TUI-COMMANDS.md` **200**（199，`:135` 已在盘）。二 三表已换成本行实测值。
- **代码档（本批未动，实测）**：`post-turn.mjs` 70 · `version.mjs` 65 · `agent-tools/doc-check.mjs` 74 · `tool-docs/doc_check.md` 49 · `cmd-config.mjs` 521——实施后行数待 §5 报。
- **二 七 条数与性质**：6 条——①②=已就地收正 / 实现轮落；③=待裁（主 agent 账目面）；④=已闭（需求档 F8 已在盘）；⑤⑥=知会。
- **观察（非本批笔 · 勿并入本批范围）**：工作树中 `thincoder-core/prompts/persona-engineering.md`（+1/−1）与 `docs/core/design/prompts/persona-engineering.md`（+5/−1）已有未提交改动，非本批改动——父侧收口按 git 清单取范围时需分域，勿计本批。
- **观察（他档坐标漂移 · 非本批笔）**：`MODEL-BENCH.md:1357` 记 `_currentTurn` 在 `turn-loop.mjs:66`（实 `:74`）· `TURN-CAP-CONTINUE.md:48` 记帧调用点 `:65` / 回填 `:66-67`（实 `:73` / `:74-75`）——两档属别批，本批未改，报父侧分派。

### 二 九、同类先例（对齐 ∥ 偏离）与公共源勘察证据行

**同类先例行（逐条：实现坐标 ∥ 匹配设计节 ∥ 先例 · 对齐 ∥ 偏离）**

① **`#1661` 设计轮轮数注入** — 实现坐标 = `thincoder-core/agent/post-turn.mjs`（与 goal 预算同函数体、`callbacks.onTurnEnd` 之前）∥ 匹配设计节 = `AGENT-LOOP.md` §6.6「goal 预算」· 先例 = `AGENT-LOOP-UPSTREAM.md` §6.32 零落笔看门狗（同族：把「轮数 / 零写」这类模型看不见的量做成可观测量）。
**对齐** = 同文件 / 同注入点 / 同形（`agent.history.push({ role: "user", … })`）· **偏离** = goal 预算只活在 depth-0（goal 是主会话概念），本注入按角色判据（`_role` + `_currentTurn` + `_touchedFiles`）——理由：设计轮预算的判据量在 persona 的 15 轮，不在 goal 账。

② **`#1665` report 注记** — 实现坐标 = `thincoder-core/doc-check/version.mjs`（与 `gateEngineError` 同档同形）+ `thincoder-core/agent-tools/doc-check.mjs` report 分支 ∥ 匹配设计节 = `DOC-DISCIPLINE.md` §3.20「gate 裁定 · report 注记」· 先例 = 同条 gate 分支的版本前置（`staleEngineFiles` / `gateEngineError`）。
**对齐** = 同一判据源（`staleEngineFiles()`）、同一串形（`；` 连列、ISO 8601 时刻）、同一注入缝（时钟 ∥ `stat` 可注）· **偏离** = 注记放**首行之前**（gate 是首行 verdict）——理由：报告态没有 verdict 行、首行没有机器消费者，尾部是略读最先丢掉的部分。

③ **`#1668` `/config` 回 auto** — 实现坐标 = `thincoder-cli/src/tui/cmd-config.mjs` 数值项支（`:491`–`:519`）+ `saveProxy → persistRaw` 单通道 ∥ 匹配设计节 = `CONTEXT-COMPACTION.md` §6.17「写回面」+ 用例 R12 / R13 · 先例 = VSC 设置面板「置空 ⇒ `applyAgentPatch` 删键」（`thincoder-vscode/src/extension/settings-panel-write.mjs:77`）+ TUI 既有显示后缀 `ctSuffix`（`cmd-config.mjs:358`）。
**对齐** = 写盘结果同为删键、显示回 `(auto)`、经同一 `persistRaw` 通道 · **偏离** = CLI 输入形取 `auto` 关键字（VSC 取空串）——理由：CLI 空输入现语义 = 取消（`cmd-config.mjs:503`，所有数值项共用），改成「空 = auto」会把手滑变删键。

**公共源勘察证据行**：`PROJECT-MANIFEST.json` 的 `index.publicRepos` = `[]`（实读 `:56`）；工作区参考系已移出索引（`d:\teamcode\AGENTS.md`：「参考系已移出工作区至 `D:\ref\`（不入索引）」）⇒ **已查，无相关公共源可引**。

### 二 十、评审轮 1（`advisor#3`）14 条处置

**总判**：14 条全收（🔴 1 · 🟡 10 · 🔵 3）；逐条处置如下，交付门取证见末行。

| # | 处置 | 改动（file:line） | 改后（要点 / 逐字） |
|---|---|---|---|
| 1 🔴 | 收正为**链内累计**（全文单说法） | `docs/core/design/AGENT-LOOP.md:335`–`:339` · 批档 `:46` / `:48` | 「`agent._currentTurn` = **链内累计轮号**（跨段累计，续跑不重置；`turn-loop.mjs:73-74` → `helpers.mjs:274-276`，`turn = seq`）」+ 为何不取 `turn` 形参 + 续跑后果三段 |
| 2 🟡 | F8 前提作废 ⇒ 读作「已在盘」 | 批档 二 七.4 · 二 六 不做面 | 「需求档 F8 **已载** report 注记句（`DOC-CHECK.md:25` 实读）——上抛撤回，本批零改需求档」；§1 前提句待主 agent 按现盘改写（§1 笔在主 agent） |
| 3 🟡 | `wrote` 与保留集冲突 ⇒ 写明继承 | `AGENT-LOOP.md:337`–`:338` · 批档 二 四 A-7 | 「该集合在 resume 保留集内 ⇒ 续跑段沿用上一段写入痕迹，`wrote` 按整轮累计读」+ 续跑用例一条 |
| 4 🟡 | 贴线判改实 + 拆分预案 | 批档 二 三 `cmd-config` 行 · 二 三 注 | 「**过 500 顾问线（现档 521 已过）、未触 800 硬限**」+ 两步拆分路径（≈ 501 → ≈ 477，本批不做） |
| 5 🟡 | C-4 改走可跑符号 | 批档 二 三 `cmd-config` 行 · 二 四 C-4 | 抽出导出纯函数 `compactThresholdSuffix(auto)`（`:358` 内联三元改调用；三处显示路径 `:360` / `:364` / `:392`） |
| 6 🟡 | 逐字串去反引号歧义 + 写明射程 | `docs/core/design/CONTEXT-COMPACTION.md:667`–`:668` · 用例 R13 `:708` | `Value must be a number (or "auto" to clear the explicit override)`；射程 = 仅 `agent.compactThreshold`，其余数值项文案不变 |
| 7 🟡 | 存量串失真 ⇒ 收窄括注 | 设计 `DOC-DISCIPLINE.md:1057` · 实现 `version.mjs:58`（列二 三） | 括注改「`report` 不裁定、不产 verdict（陈旧时只在首行前加注记）」 |
| 8 🟡 | 补先例行 | 批档 二 九 | 三条各给 实现坐标 ∥ 匹配设计节 ∥ 先例 · 对齐 ∥ 偏离 |
| 9 🟡 | 补勘察证据行 | 批档 二 九 | `index.publicRepos` = `[]`（实读 `:56`）⇒ 已查，无相关公共源可引 |
| 10 🟡 | 交付门取证 | 本段末行（`doc_check gate`） | `DOC-CHECK GATE: PASS`（3 档全清） |
| 11 🟡 | §2 只留一条状态行 | 批档 §2（重复行已删，现唯一位于 `:30`） | 状态行 note 对齐二 七（6 条） |
| 12 🔵 | 坐标 / 读数漂移 | `AGENT-LOOP.md:377`（`turn-loop.mjs:66` → `:74`）· 批档 二 二 ②（DD-91 `:1197`）+ A-DD30 ① `:1842`——两处因 §3.20 本批插一句（`:1057`）各下移一行 · 二 三 / 二 八（实测行数） | 行数口径统一为换行符计数；评审报的「`DOC-DISCIPLINE.md` 实 1957 / `TUI-COMMANDS.md` 实 201」是把 `read` 工具 total（含尾部空元素）当口径的结果——按换行符计数：`TUI-COMMANDS.md` = 200（差 1 只在这一条）· `DOC-DISCIPLINE.md` = 1957（此条与评审同值）· `AGENT-LOOP.md` = 515 |
| 13 🔵 | 单测档按档拆行 | 批档 二 三（三行） | `-dtb` ≈ +55 · `-den` ≈ +30 · `-ct` ≈ +35（收口随批删；先例 `CONTEXT-COMPACTION.md:615`） |
| 14 🔵 | 常量可观测 | `AGENT-LOOP.md:343`（注入形条）· 批档 二 二 ① | 「两串里的 `15` 一律由常量 `DESIGN_FIRST_VERSION_TURNS` 插值——改常量即改注入文本，不另留字面」 |

**交付门回执**：`doc_check: PASS（3 档）`——范围 = 本批触及设计档（`AGENT-LOOP.md` / `DOC-DISCIPLINE.md` / `CONTEXT-COMPACTION.md`），阈值 300，命中 0 条。

## §3 设计评审（评审子代理）

### 轮次 1（评审子代理）

**评审对象**：`docs/batches/2026-10-18-mech-visibility-gaps.md` §2（设计段）+ 其落点四档（`AGENT-LOOP.md` §6.6 · `DOC-DISCIPLINE.md` §3.20 · `CONTEXT-COMPACTION.md` §6.17 · `TUI-COMMANDS.md` §5.3）+ 需求档 `DOC-CHECK.md`。

**计数**：🔴 1 · 🟡 10 · 🔵 3 ⇒ **VERDICT: changes-required**

| # | 类别 | 严重度 | 问题 | 建议 |
|---|---|---|---|---|
| 1 | 一致性（机制语义） | 🔴 | `agent._currentTurn` 同一字段两处规范性描述互斥：`AGENT-LOOP.md:335` 写「（段内帧，与状态行同源）」，而 `AGENT-LOOP.md:372`／`:387` 写「链内累计轮号（跨段累计，与状态行同源）」；批次档 `:49` 的登记边界「段内轮号，续跑新段重新计」与实现相反（`turn-loop.mjs:73-74` → `helpers.mjs:274-276`：`_currentTurn = frame.turn = seq`，续跑不重置）。设计未说明为何取 `_currentTurn` 而不取 `injectPostTurn` 已有的 `turn` 形参（`post-turn.mjs:17`），机判 A-6 反而让二者故意不相等（`turn=7` / `_currentTurn=8`），把该选择固化成不可判 | 二选一并在落点与批次档只写一次：取段内轮号（用 `turn` 形参）或取链内累计（用 `_currentTurn`）；据实改写 `AGENT-LOOP.md:335` 括注与批次档 `:49` 边界句；补一条「续跑新段」取值用例 |
| 2 | 文档状态（需求档） | 🟡 | 需求档前提为假：批次档 `:23` 称「F8 现只写『gate 校验版本』」、`:133` 称 F8「未涉 report 注记」，而 `DOC-CHECK.md:25` F8 已载「report 模式出注记行（不改既有行 ∥ 不改 verdict ∥ 不改 PASS 语义）」；同时 §1 已裁定「补一句」（`:23`）与 §2 不做面「不改需求档」（`:122`）互相矛盾 | 删去上抛第 4 条并将其读作「已在盘·无需改」，§1 前提句与不做面按现行盘面改写（机制面单源仍 = `DOC-DISCIPLINE.md` §3.20） |
| 3 | 验收面（边界未覆盖） | 🟡 | `wrote` 判据与 `_touchedFiles` 生命周期不符：`AGENT-LOOP.md:335` 写「本 run 至今写过文件没有」，但 `_touchedFiles` 在 resume 保留集内（`AGENT-LOOP.md:232`）⇒ 续跑段可携带上一段的写入痕迹，`wrote` 恒真、降级句在最该出现的长跑场景被压制；机判 A 组（`batch:81-86`）无 resume 用例 | 在 `AGENT-LOOP.md` §6.6 判据源处写明「续跑段沿用上一段写入痕迹（保留集）」或改用段内增量判据；补一条 resume 段 `wrote=true` 的用例 |
| 4 | 受影响文件表（行数/档位标注） | 🟡 | `cmd-config.mjs` 标注为「521｜+12 ≈ 533（≤500 建议线内不破）」（`batch:69`）——现档 521 行，已越 500 建议线，改后 533 仍越（`AGENTS.md`「≤ 500 lines advisory」）；档位已越线却无拆分评估/计划 | 把「建议线内不破」改为据实标注（已越 500 建议线，硬限 800 内），并给出主动拆分复核结论或拆分计划 |
| 5 | 验收面（不可判符号） | 🟡 | 机判 C-4 断言 `compactThresholdSuffix(true)`（`batch:98`）——该符号全仓不存在（仅出现在本批次档）；` (auto)` 后缀现为 `cmd-config.mjs:358` 的内联三元 `ctSuffix`（用于 `:360`／`:364`／`:392`），设计未把「抽助手」列入改动 | 或改为对既有显示路径的回归断言（读 `/config` 三处输出），或在受影响文件表列明抽取重构及其 Δ |
| 6 | 清晰度（逐字/射程） | 🟡 | 报错行逐字 `CONTEXT-COMPACTION.md:667` 在代码 span 内嵌反引号（`auto`）⇒ 用户可见字面不可判（含或不含反引号）；且该错误路径为所有数值项共用（`cmd-config.mjs:506` 统一 `Value must be a number`），设计未说明其它数值项的报错文案是否随改 | 给出无反引号歧义的逐字串；写明射程（仅 `agent.compactThreshold`）并为其它数值项补一条「文案不变」断言 |
| 7 | 一致性（存量串随改失真） | 🟡 | 「三不改（不改既有行）」使一条模型可见串在改后失真：`version.mjs:58` gate ERROR 处置行写「`report` 模式不查版本——报告态不是交付判据」，而 `DOC-DISCIPLINE.md:1051-1056` 新口径下 report 正以 `staleEngineFiles()` 判定是否加注记 | 明裁一处：或把该括注收窄为「report 不裁定、不产 verdict」，或登记为「保留失真·理由 + 复检时点」 |
| 8 | 方法论（先例行） | 🟡 | 设计段无「同类先例（对齐 ∥ 偏离）」行——先例仅散见 D1／D5（`batch:113`／`:117`）；三落点未给「实现坐标 ∥ 匹配设计节 ∥ 先例批」与对齐/偏离结论，规范档既有形 = `DOC-DISCIPLINE.md:1103`／`:1163` | 逐条补先例行（含 report 注记「首行之前」这类偏离的对齐面与理由） |
| 9 | 方法论（勘察证据行） | 🟡 | 设计段无公共源勘察证据行（项目规范形 = `DOC-DISCIPLINE.md:1107`／`:1166`：`index.publicRepos` 实读 + 「无相关公共源可引」）——缺行 = 未勘察或未记录 | 补该行并写明结论（即便结论为「无相关公共源可引」） |
| 10 | 方法论（交付门取证） | 🟡 | 设计轮交付未携 `doc_check: PASS（N 档）` 取证行（触发点 1 = `DOC-DISCIPLINE.md:1061`；§1 验收面亦列「本批触及档 doc_check 零命中」`batch:25`），而本批已改四档 | 跑一次 gate 并在 §2 补 verdict 行（`REFUSED` ⇒ 同轮修到 `PASS`） |
| 11 | 记录结构 | 🟡 | §2 出现两条 `**状态行**：`（`batch:28` / `:31`），且首条 note 的「上抛 4 条」与二七的 6 条不符（二八 `:140` 已自陈） | 保留单条状态行并使其 note 与二七条数一致，删去重复行（状态写面只应有一个目标） |
| 12 | 数字漂移 | 🔵 | 坐标/行数小漂：`DD-91` 引作 `:1194`（实际 `DOC-DISCIPLINE.md:1196`）；`AGENT-LOOP.md:372` 引 `turn-loop.mjs:66` 而 `_currentTurn` 赋值在 `:74`；实测行数 `TUI-COMMANDS.md` 200（实 201）、`DOC-DISCIPLINE.md` 1956（实 1957） | 收口前统一重读一次该三处坐标与行数 |
| 13 | 受影响文件表（颗粒度） | 🔵 | 单测只一行「单测档（本批新建）｜0｜≈ +110（结算即删）」涵盖三组用例（`batch:74`）；「结算即删」有仓内先例（`CONTEXT-COMPACTION.md:615`「收口随批删」），但一行合报使每档 Δ 不可核 | 按文件拆行（各组 0 → +N）并注明随批删的出处 |
| 14 | 命名/常量一致性 | 🔵 | 声明 `DESIGN_FIRST_VERSION_TURNS = 15`（`batch:47`），而逐字注入形把 15 写死（`AGENT-LOOP.md:340` 的 `${turn}/15`）⇒ 常量无可观测消费方，后续改常量不生效 | 在注入形处声明该段由常量插值，或删去该常量 |

**说明**：`post-turn.mjs`(70) · `version.mjs`(65) · `doc-check.mjs`(74) · `doc_check.md`(49) 四处现行行数与表注一致；`cmd-config.mjs` 现档 521 行（表注数值正确，档位判断错误，见 #4）。`doc_check.md:28-30`「five engine files」与 `ENGINE_FILES` 六档（`version.mjs:22-29`）不符，设计已登记并随批修，核对无误。

**VERDICT: changes-required**（🔴 1 条：`_currentTurn` 语义两处互斥且登记边界与实现相反）

### 轮次 2（评审子代理）

**评审对象**：`docs/batches/2026-10-18-mech-visibility-gaps.md` §2（设计段 + 二 九 / 二 十 与 §1 前提补正）+ 落点四档（`AGENT-LOOP.md` §6.6 · `DOC-DISCIPLINE.md` §3.20 · `CONTEXT-COMPACTION.md` §6.17 · `TUI-COMMANDS.md` §5.3）+ 需求档 `DOC-CHECK.md`。

**计数**：🔴 0 · 🟡 0 · 🔵 2（上轮 14 条全数收口：🔴 1 Fixed · 🟡 10 Fixed · 🔵 3 Fixed）⇒ **VERDICT: pass**

| # | 上轮# | 档 | 严重度 | 状态 | 依据（本轮实读） |
|---|---|---|---|---|---|
| 1 | 1 | `AGENT-LOOP.md` · 批档 | 🔴 | Fixed | `:335` 已改「`agent._currentTurn` = **链内累计轮号**（跨段累计，续跑不重置…）」；`:336` 补「为何不取 `turn` 形参（段内 0 起）」；批档 `:61` 边界句改「轮号 = 链内累计（续跑不重置…）」——全文再无「段内帧」说法 |
| 2 | 2 | 批档 · `DOC-CHECK.md` | 🟡 | Fixed | 需求档 `:25` 实读含「**report 模式出注记行**」；批档 `:31` / `:140` / `:151` 已按现盘读作「已在盘 · 本批零改」，§1 前提句由 `:27`–`:32` 补正表显式作废 |
| 3 | 3 | `AGENT-LOOP.md` · 批档 | 🟡 | Fixed | `:337`「该集合在 resume 保留集内（§6.2「resume 保留集」）⇒ **续跑段沿用上一段写入痕迹**」+ `:338` 续跑后果登记 + 机判 A-7（`:104`） |
| 4 | 4 | 批档 二 三 | 🟡 | Fixed | `:82` 改「**过 500 顾问线（现档 521 已过）、未触 800 硬限**」+ `:93` 两步拆分预案（本批不做，请父侧登台账） |
| 5 | 5 | 批档 二 三 / 二 四 | 🟡 | Fixed | `:82` 改动列已含「抽出导出纯函数 `compactThresholdSuffix(auto)`（`:358` 内联三元改调用）」；C-4（`:116`）注明符号来源与三处调用点 |
| 6 | 6 | `CONTEXT-COMPACTION.md` | 🟡 | Fixed | `:667` 逐字改 `Value must be a number (or "auto" to clear the explicit override)`（无反引号）；`:668` 射程句「仅 `agent.compactThreshold`，其余数值项文案不变」；R13（`:708`）为对照用例 |
| 7 | 7 | `DOC-DISCIPLINE.md` · 批档 | 🟡 | Fixed | `:1057` 新增「**配套文案收窄（同批）**：…由「`report` 模式不查版本…」改为「`report` 不裁定、不产 verdict（陈旧时只在首行前加注记）」」；批档 `:67` + 二 三 `:79` 列入改动 |
| 8 | 8 | 批档 二 九 | 🟡 | Fixed | `:166`–`:175` 三条各给「实现坐标 ∥ 匹配设计节 ∥ 先例 · 对齐 ∥ 偏离」 |
| 9 | 9 | 批档 二 九 | 🟡 | Fixed | `:177`「公共源勘察证据行：`PROJECT-MANIFEST.json` 的 `index.publicRepos` = `[]`…⇒ 已查，无相关公共源可引」 |
| 10 | 10 | 批档 二 十 | 🟡 | Fixed | `:200`「**交付门回执**：`doc_check: PASS（3 档）`…阈值 300，命中 0 条」（范围口径见 N1） |
| 11 | 11 | 批档 §2 | 🟡 | Fixed | §2 现唯一位于 `:43`，note 与二 七 6 条一致；重复行已删 |
| 12 | 12 | `DOC-DISCIPLINE.md` · `AGENT-LOOP.md` · 批档 | 🔵 | Fixed | DD-91 实于 `:1197`（批档 `:63` 已改）；`AGENT-LOOP.md:377` 改引 `turn-loop.mjs:74`；行数改按换行符口径（`:157`/`:196`），本轮读 total −1 与实测值全部对齐 |
| 13 | 13 | 批档 二 三 | 🔵 | Fixed | `:87`–`:89` 三行分档（−dtb ≈ +55 · −den ≈ +30 · −ct ≈ +35），并注明随批删先例 `CONTEXT-COMPACTION.md:615` |
| 14 | 14 | `AGENT-LOOP.md:343` | 🔵 | Fixed | 「两串里的 `15` 一律由常量 `DESIGN_FIRST_VERSION_TURNS` 插值——改常量即改注入文本，不另留字面」 |
| N1 | (new) | 批档 `:200` | 🔵 | New | `**交付门回执**：`doc_check: PASS（3 档）`——范围 = 本批触及设计档（`AGENT-LOOP.md` / `DOC-DISCIPLINE.md` / `CONTEXT-COMPACTION.md`），阈值 300，命中 0 条。` 与二 三 列出的第四档 `TUI-COMMANDS.md`（`:86`，`+1 → 200（实测，已在盘）`）不齐——回执的「3 档」范围未说明为何不含该档，N 不可核 |
| N2 | (new) | 批档 `:93` | 🔵 | New | ``cmd-config.mjs:491`–`:519`）连同 `ctDisplay` / `ctSuffix` 两个纯函数迁入新档 `cmd-config-numeric.mjs`（≈ −34 行 ⇒ ≈ 501）` —— 基数未写（521 − 34 = 487 ≠ 501，只有以本批改后 535 为基才成立），且本批已把 `ctSuffix` 抽为 `compactThresholdSuffix`，预案里的旧名将失效 |

**本轮复核（无问题项）**：落点坐标全对——`AGENT-LOOP.md:334` · `DOC-DISCIPLINE.md:1017` / `:1051`–`:1057` / DD-91 `:1197` / A-DD30 `:1842`（① 判据正文 `:1844` 已含「报告态注记接线」）· `CONTEXT-COMPACTION.md:663`–`:668` / R12 `:707` / R13 `:708` / 边界 `:710` · `TUI-COMMANDS.md:135`（含指向 §6.17 的「本档不重述」）；`CONTEXT-COMPACTION.md:661` 四处读点 = `:360`/`:364`/`:392`/`:497` 与盘上一致；二 七 6 条与二 八 条数自述一致；`_currentTurn` 语义在 `AGENT-LOOP.md:335`/`:336`/`:377`/`:392` 四处单说法（链内累计），与需求档 `AGENT-LOOP.md:100` F-E2 同口径。

**VERDICT: pass**（🔴 0 · 上轮 14 条全收口 · 新增仅 🔵 2）

## §4 用户批准（主 agent）

**用户批准（2026-10-18 22:38）**——用户逐字「批准」。

**批准范围**：本批三条的设计与实施——`#1661` 设计轮轮数注入 · `#1665` report 引擎陈旧注记 · `#1668` `/config` 回 auto。

**批准依据（全部在盘）**：
- §2 判据冻结（二 一 落点 / 二 二 逐字形 / 二 三 受影响面 / 二 四 机判 / 二 九 先例与勘察 / 二 十 处置表）
- §3 评审轮次 2 **pass**（🔴 0 · 🔵 2）；轮次 1 的 🔴 1（`_currentTurn` 语义写反）已在修正轮收正并经父侧实读核过
- §5 实施：批内单测 21 断言（8/5/8）全绿 · `bench/check` 118/0 · 新进程 `doc_check` 对 5 档 PASS · 终态 `clean`

**未含**（同批登记、另批处置）：`#1673` server 压缩阈值（已开批 `2026-10-18-server-compact-threshold`）· `#1674` `cmd-config.mjs` 拆分 · `#1675` 坐标漂移 · `#1676` 轻通道例外 · `#1677` `wrote` 判据看不见 `batch` 写面 · `#1678` `DOC-DISCIPLINE.md:1113` · `#1679` 回 auto 提示位置。

## §5 实施记录（eng-coder）
**状态行**：实施完成（三档机判 21 断言全绿 · bench 118/0 · 内部审计 1 轮 + 代码评审 1 轮（终态 clean））



### 5.1 逐档改动（file:line + 改后整行）

| # | 档 | 行数（前 → 后） | 落点 | 改后整行 / 要点 |
|---|---|---|---|---|
| 1 | `thincoder-core/agent/post-turn.mjs` | 70 → **104** | `:13`–`:18` 常量 · `:27`–`:36` 纯函数 · `:94`–`:101` 接线 | `export const DESIGN_TURN_NOTICE_AT = 5` ∥ `export const DESIGN_TURN_SKELETON_AT = 8` ∥ `export const DESIGN_FIRST_VERSION_TURNS = 15`；`export function designTurnReminder({ role, turn, wrote } = {}) {`（两串逐字 = `AGENT-LOOP.md:344`/`:345`，串内 `15` 由常量插值，无字面）；接线在 `callbacks.onTurnEnd` 之前：`const designReminder = designTurnReminder({` / `role: agent._role,` / `turn: agent._currentTurn ?? 0,` / `wrote: (agent._touchedFiles ?? []).length > 0,` / `})` / `if (designReminder) agent.history.push({ role: "user", content: designReminder })` |
| 2 | `thincoder-core/doc-check/version.mjs` | 65 → **84** | `:51`–`:55` `staleParts` · `:69`–`:73` `reportEngineNote` · `:76`–`:79` `withEngineNote` · `:63` 括注收窄 | `export function reportEngineNote({ startMs, stale } = {}) {`（注记串逐字 = `DOC-DISCIPLINE.md:1054`）；`export function withEngineNote(report, version) {` + `const note = reportEngineNote(version ?? {})` + `return note ? `${note}\n${report}` : report`；`:63` = `"处置：重启会话后复跑 gate（`report` 不裁定、不产 verdict（陈旧时只在首行前加注记））",` |
| 3 | `thincoder-core/agent-tools/doc-check.mjs` | 74 → **75** | `:19` import · `:73` report 分支 | `import { staleEngineFiles, gateEngineError, withEngineNote } from "../doc-check/version.mjs"`；`return withEngineNote(runDocCheck(root).report, staleEngineFiles())`（gate 分支 `:64`–`:70` 零改） |
| 4 | `thincoder-core/tool-docs/doc_check.md` | 49 → **53** | `:3`–`:6` report 注记句 · `:31`–`:32` 六档 | `When the engine files are newer than this session's start time (or unreadable), `report` prefixes its output with one` …；`the six engine files (`doc-check/index.mjs` / `doc-check/anchors.mjs` / `doc-check/width.mjs` / `doc-check/version.mjs` / `agent-tools/doc-check.mjs` / `tool-docs/doc_check.md`)` |
| 5 | `thincoder-cli/src/tui/cmd-config.mjs` | 521 → **543** | `:34`–`:39` 导出纯函数 · `:365` 调用 · `:501` / `:510` / `:514`–`:521` / `:526` 写回支与三条文案 | `export function compactThresholdSuffix(auto) {` + `return auto ? " (auto)" : ""`；`const ctSuffix = compactThresholdSuffix(ac.compactThresholdAuto)`；`if (isCompact && String(val).trim().toLowerCase() === "auto") {` → `await saveProxy((raw) => { if (raw.agent) delete raw.agent.compactThreshold })` → `pushLine("agent.compactThreshold = (auto)（键已删除——压缩线按在用模型的窗口每轮现算）", C.tool)`；报错行 `pushLine(isCompact ? `Value must be a number (or "auto" to clear the explicit override)` : "Value must be a number", C.error)` |
| 6 | `.thincoder/tmp/2026-10-18-mech-visibility-gaps-{dtb,den,ct}.test.mjs` | 0 → 新建（**收口随批删**） | 三档机判 | `-dtb` = A1–A8 · `-den` = B1 / B1b / B2 / B3 / B4 · `-ct` = C1a–C1e / C2 / C3 / C4（先例 `CONTEXT-COMPACTION.md:615`） |

### 5.2 三条机判实跑读数

**A `#1661`** — `node --test .thincoder/tmp/2026-10-18-mech-visibility-gaps-dtb.test.mjs` ⇒ **8 passed / 0 failed**（A1 `turn 4` ⇒ `null` · A2 `turn 5` 未落盘 ⇒ 含 `design round turn 5/15` + `nothing has been written to disk yet`、不含 `degrade the delivery NOW` · A3 `turn 8` 未落盘 ⇒ 降级句 + `skeleton` · A4 `turn 8` 已落盘 ⇒ `something has been written to disk`、无降级句 · A5 `eng-coder` / `null` ⇒ `null` · A6 接线 `_currentTurn=8` 而段内 `turn` 实参 `7` ⇒ 末条为 `turn 8/15` 降级串 · **A7 续跑** `_currentTurn=12` + `_touchedFiles:["docs/x.md"]` ⇒ `turn 12/15` + `something has been written`、无降级句 · A8 `eng-coder` 经接线零注入）。
另跑逐字核对（一次性读数）：把 `AGENT-LOOP.md:344`（常行）/ `:345`（降级行）模板以 `turn` / `wrote` 代入求值，与 `designTurnReminder` 三串比较 ⇒ **全等 true**（`turn5/未写` · `turn8/已写` · `turn8/未写`）。

**B `#1665`** — `node --test …-den.test.mjs` ⇒ **5 passed / 0 failed**（B1 串首 `[doc_check note] 引擎陈旧（` + 档名 + 两 ISO 时刻 · B1b 多档 `；` 连列 + `不可读（stat 失败）` · B2 stale 空 ⇒ `null`、`withEngineNote("R", …)` === `"R"` · B3 首行 = 注记、原报面逐字跟随、串内无 `DOC-CHECK GATE:` · B4 源面：report 分支同一返回表达式含 `withEngineNote(` 与 `staleEngineFiles(`，且行序在 gate 版本前置之后）。
真 stat 读数（一次性）：`staleEngineFiles({ nowMs: Date.now() − 7h, uptimeSec: 0 })` ⇒ **stale 6 档**（六档全列、`；` 连列），`withEngineNote("=== REPORT BODY ===", …)` ⇒ 首行注记 + 原报面逐字跟随 + 无 verdict 串；`staleEngineFiles()`（本进程真启动时刻）⇒ **stale 0**、`withEngineNote` 逐字返回、`reportEngineNote` ⇒ `null`（三不改中的「不陈旧 ⇒ 零注记」）。

**C `#1668`** — `node --test …-ct.test.mjs` ⇒ **8 passed / 0 failed**（C1a `auto` / `AUTO` / ` auto ` 三形同落盘：盘上键消失 + 保存回显逐字 + `compactThresholdAuto === true` + 下一轮菜单/hdr 带 ` (auto)` · C1b `700000` ⇒ 显式键 + 提问行含 `输入数值即固定为显式阈值；输入 auto 回到自动派生（删键）` · C1c `abc` ⇒ 专属报错句、零落盘 · C1d 空输入 ⇒ 取消、键不动 · C1e R13 `agent.maxTurns` 非法输入仍 `Value must be a number`、无 auto 子句 · C2 删键 mutate + `persistRaw(mutate,{path})` ⇒ 盘上无键 · C3 删键后 `loadConfig()` ⇒ auto `true` / `compactThresholdResolved` 为数 · C4 `compactThresholdSuffix(true)` === `" (auto)"` / `(false)` === `""`）。

### 5.3 bench ∥ doc_check ∥ 单测留存

- `node bench/check/run.mjs` ⇒ `bench/check: 118 passed, 0 failed`（exit 0，与基线同值）。
- `thincoder-cli && npm test` ⇒ `test manifest is empty — zero tests = green`（exit 0）。
- doc_check 读数（**产品引擎 · 新进程**，会话工具面不引）：
  - **report 全域**：`docs（212 档）… 命中 0 条（锚 0 · 行宽 0）`，本进程启动时刻无 stale ⇒ 报面无注记行（#1665 的真实「零注记」面）。
  - **gate（显式 5 档）** = 本批设计档四份 + 需求档 F8（`AGENT-LOOP` / `DOC-DISCIPLINE` / `CONTEXT-COMPACTION` / `TUI-COMMANDS` / `DOC-CHECK`）⇒ `DOC-CHECK GATE: PASS`，`结论：0 条命中（5 档全清）`。
  - **gate（本会话笔域 = 批次档）** ⇒ `DOC-CHECK GATE: PASS（0 档）` + `跳过 1 档（不在声明域内）`——`batches` 在 `checkConfig.anchors.exclude`（`PROJECT-MANIFEST.json:39`）。
  - 会话内 `doc_check` 工具面因本批改了引擎档 ⇒ 给 `ERROR（引擎已更新…）`（fail-closed 的预期形，恰是 #1665 要标注的读数类），故交付读数一律取新进程。
- **单测零留存**：三档 `.test.mjs` 随批删（本段即其唯一读数所在，不另留可执行面）。

### 5.4 审计 / 评审轮次与终态

- **内部偏离审计**（explore · 只读）1 轮 ⇒ findings 5（🟡 2 = 设计档坐标漂移 · 🔵 3）；**代码面 0 条**：PARTIAL / 静默简化 / 清单外改动均未发现，二 四 A1–A7 / B1–B4 / C1–C4 全落地。
- **自修复** 0 轮（无代码缺陷；两处漂移属设计档笔域，见 5.5）。
- **内部代码评审**（advisor · code）1 轮 ⇒ **VERDICT: pass**（🔴 0 · 🟡 4 全为可选 · 🔵 5）。
- **修复 1 处**（评审 #7）：`tool-docs/doc_check.md:3` 补「（or unreadable）」——report 注记的另一触发支是引擎档不可读（`version.mjs:44`），原句只写 newer。
- **终态 = clean**（无阻断项）；两条设计缝 + 两处设计档面问题已上抛（5.5）。

### 5.5 上抛 / 漂移（父侧处置）

1. **[上抛·待裁] `wrote` 判据看不见 `batch` 写面**：`wrote` 只读 `_touchedFiles`，而该集合仅由 `FILE_MUTATORS` 六件写入（`helpers.mjs:86` · `record-results.mjs:169` · `turn-loop.mjs:246`）；`batch` 工具不在其中，而 eng-designer 写 §2 的唯一通道正是 batch（`persona-eng-designer.md:53`）⇒ 「第 3 轮已落 §2、第 8 轮起仍被告知 nothing has been written…」会成立。设计判据原话是「本设计轮至今写过文件没有」（`AGENT-LOOP.md:337`）。**处置建议**：① 把 batch 写面并入判据（append 成功后记目标档 / 单开标志）；或 ② 收窄判据与注入句（如「no write/edit tool has landed anything」）+ §6.6 判据源段写明 batch 不计。本批按冻结判据实现，未自改。
2. **[上抛·待裁] 回 auto 的提示只在 auto 档出现**：`cmd-config.mjs:510` 的条件是 `isCompact && ac.compactThresholdAuto`，而需要这条提示的是**显式档**（R12 `CONTEXT-COMPACTION.md:707` 的用例正是显式 700000）⇒ 写面已通、发现面仍靠读档。设计句 :665「auto 档时追加」是该行为来源。**处置建议**：条件改恒追加或取 `!ac.compactThresholdAuto`，同改 :665 / `TUI-COMMANDS.md:135`。
3. **[知会] 设计档坐标漂移（eng-designer 笔，本席未自改）**：`CONTEXT-COMPACTION.md:661` 四处读点记 `:360` / `:364` / `:392` / `:497`，实为 `:367` / `:371` / `:399` / `:505`；`AGENT-LOOP.md:336` 引 `post-turn.mjs:17`，实为 `:42`；§2 `:67` 引 `version.mjs:58`，实为 `:63`（§2 属设计笔，本段只记）。
4. **[知会] 设计档状态缝**：`DOC-DISCIPLINE.md:1113` 报告态「报面（固定句形）」块未含 stale 注记行，与同档 `:1053`「首行之前」并存——建议作者补一句括注。

### 5.6 交付表

| # | 状态 | 要求 |
|---|---|---|
| 1 | ✅ 完成 | 三条落点的逐档改动（file:line + 改后整行）——见 5.1 |
| 2 | ✅ 完成 | `#1661` 五断言 + 续跑断言实跑（8/0）+ 注入串与 `AGENT-LOOP.md:344`/`:345` 逐字全等 |
| 3 | ✅ 完成 | `#1665` report 注记三断言实跑（5/0）+ 真 stat 双面读数（陈旧 6 档有注记 ∥ 不陈旧零注记） |
| 4 | ✅ 完成 | `#1668` 输入映射四态 + 删键落盘 + 派生 + 显示后缀实跑（8/0，含菜单 ` (auto)` 显示面） |
| 5 | ✅ 完成 | `node bench/check/run.mjs` = 118 passed / 0 failed |
| 6 | ✅ 完成 | 触及档 doc_check（新引擎新进程）零命中：设计档 5 档 `PASS`、批次档 `PASS（0 档）`（`batches` 在声明域排除表内） |
| 7 | ✅ 完成 | 交付表（本段） |

## §6 验证与收口（父代理）

### 验收与收口（父侧 · 2026-10-18 22:38）

**① 交付验证（父侧亲跑读数）**

| 项 | 读数 | 来源 |
|---|---|---|
| 批内单测 | **21 断言全绿**（`#1661` 8 ∥ `#1665` 5 ∥ `#1668` 8） | `eng-coder#9` 实跑，父侧复核派单口径一致 |
| `bench/check` | **118 passed / 0 failed** | 同批实跑（基线同值） |
| `doc_check` 全域 | **212 档 · 锚 0 · 行宽 0** | 父侧**新进程**直跑 `doc-check/index.mjs`（22:38） |
| 本批触及档 | `PASS（5 档）` | `eng-coder#9` gate 回执（新进程） |

**② 结算核对**

- 台账三行路径可解析、产物在盘：`#1661` → `post-turn.mjs` 注入接线（§5）；`#1665` → `version.mjs` 注记函数 + report 分支（§5）；`#1668` → `cmd-config.mjs` `auto` 分支（§5）。
- 批次档指针可解析（§1/§2/§3/§4/§5 均有内容）。
- 前置批遗留交叉核对：无（本批首次点火）。

**③ 文档机检门（交付时点强制）**

`doc_check(mode:"gate")` 的**会话工具面**报 `ERROR（引擎已更新…）`——本会话进程加载的是启动时（13:48）的旧引擎，而 `doc-check/version.mjs` 的 mtime = **14:07:50**（由并行批改动）。按 fail-closed 口径，**该面不产 PASS**，`batch close` 会因此被门拒绝。
**权威读数取新进程**：全域 212 档 · 锚 0 · 行宽 0（22:38 实测）⇒ **内容面零命中**；阻塞原因纯属**会话进程引擎陈旧**（环境级），非文档缺陷。**处置**：重启会话后复跑 gate 并 `close`；本档在此之前保持「进行中」，不标「已收口」。

**④ 暂缓批复核**：无暂缓批。

**⑤ 收口测试线**：本批验证 = 三条机判实跑（见 ①）；集成场景**未受影响**（三处均为新增能力，无既有业务路径改动）；`thincoder-cli && npm test` = 空清单零用例绿（仓库现状，非本批引入）。

**⑥ 遗留（均已在台账，不留在散文里）**：`#1673` `#1674` `#1675` `#1676` `#1677` `#1678` `#1679`。
