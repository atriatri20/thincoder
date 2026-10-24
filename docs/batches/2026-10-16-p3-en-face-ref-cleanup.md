# 2026-10-16 · P3 EN 运行面 + tool-docs 去文档引用
> 六段 append-only，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 编制：主 agent · 2026-10-16 · 来源 = 用户 2026-10-16 原话：10:44「提示词不应该引用文档吧？！」+ 10:45「删」+ 10:50「p4 收，p3p4 分批。」+ 10:52「都点火，自动跑完。」；判据单源 = `docs/core/design/PROMPT-SYSTEM.md` §6.6（删引用（非改址）、句义保留）+ 需求面 `docs/core/requirements/PROMPT-SYSTEM.md` §4-16（提示词与文档分属两界）。。
> 台账 = #1553（core · 归批）。前情 = docs/batches/2026-10-16-prompt-face-ref-cleanup.md（P1 · CN 提示词面同律处置；本批 = P3 · EN 运行面 + tool-docs，**用户裁「p3p4 分批」故独立成批**）。
## §1 讨论（主 agent）
**状态行**：已收口 2026-10-16（4 处全落（M2/M6/M3 = 0 · M1 常驻锁命中 0 · 行数 ±0 · 零旁触）· 评审两轮 pass · 子内代码评审 pass；轮 2 记录面 6 条已入册（归批））
<§1 模板占位：本批条目 / 关键判据 / 授权口径>

**设计轮 `eng-designer#124` 已落（2026-10-16 10:59）**：两域逐处表齐——域 (a) `thincoder-core/prompts/**` **16 档**（真引用 3 候选删 ∥ 待裁 2 ∥ 豁免 59）∥ 域 (b) `tool-docs/**` **52 档**（真引用 0 ∥ 待裁 1 ∥ 豁免 33 + 2 族）；先例行 5 条 + 勘察证据行 3 行（含「无同类先例」落字）；受影响面表 **68 档 / 实读合计 2131 行**；机验判据 M1–M5 在位；**零落笔**（scoped `git status` = 空 ✓）。**关键对位**：EN 三处与 P1 的 CN 三处**逐处同源**（CN 已清 ∥ EN 仍在）⇒ 本批落笔后两面同拍。**父侧当场裁决其四项**：**(b) 表 2 三处 = 照其倾向执行**（留 / 留 / **删**），判据 = 与 P1 同一口径（**所指对象在模型读到的同一段文本内可自足解析 ⇒ 留；跨档 / 外部 ⇒ 删**）；**(a) 三包生产码串面**（`thincoder-core/**` + `thincoder-cli/src/**` + `thincoder-vscode/src/**` 的**字符串 / 模板字面量**内的文档引用，§6.6 域内、J3 覆盖缺口、实测 61 处）**= 不在本批** ⇒ **父侧已入册另相位**；**(c) EN 档内含成段中文**（`advisor-round2.md` ∥ `advisor-round3.md` ∥ `persona-eng-coder.md` 与 CN 正本同文的中文段）**= 只报不办** ⇒ **父侧已入册**；**(d) 行宽**（EN 档不在行宽机检域）**= 照记**（同 P1 的 D-P4）。**下一步** = 父侧点火设计评审（**已点火**）→ 通过 + 用户批准 → 派 `eng-coder`（携凭证）落两域真引用 3 + 待裁 3。

**父侧就地收正（§1 自身读数 · 2026-10-16 11:10）**：本档 §1 早前记的「**(b) 表 2 三处 = 照其倾向执行**（留 / 留 / 删）」与「落两域真引用 3 + 待裁 3」「M1–M5」「表 2 三处」**均已随 `#135` 点改收正**，正确读数 = **落笔目标 = 4 档 · 各 1 行**（表 1 **四行**：域 (a) 三处指路句 + 域 (b) `tool-docs/browser.md:48` **出处句形**）· **真引用：域 (a) = 3 ∥ 域 (b) = 1** · **待裁 = 0** · 判据 = **M1–M6**（新增 M6 = `grep -rn &quot;single source: core&quot; thincoder-core/tool-docs/`，现行 1 行 → 落笔后须 0）· 表 2 = **层名指路（裁 = 留 · 2 处）**。**父侧另裁其三件上抛**：**① `browser.md:48` 归类**= **照「真引用（出处句形）」**（该句引 `core tool-docs/` = 跨档档名形，属真引用；表 4 的 grep 只认指路句式 ⇒ 归类依裁决、非依 grep —— **不影响落笔**）；**② 类 ① 不补「全坐标」行**（数 = 1 ⇒ 代表坐标即全量，D-P3-7 的表述已满足）；**③ §6 的「明列未清面」= 父侧笔**（本轮只在 §2 落指针，`#5` 那条待收口轮由父侧落）。**另记**：该席自查把 §2 一处 306 字符超宽行（初始轮遗留）折到 294 ⇒ **§2 现 0 行 >300**（脚本实测）。

## §2 批次任务与设计（eng-designer）
**状态行**：设计完成（P3 EN 运行面 + tool-docs 去文档引用：落笔目标 4 处（裁删）· 层名 2 处裁留 · 豁免按 §6.6 判保留面全标；本轮零落笔）
<§2 模板占位：本批条目（覆盖） / 设计档落点 / 机制设计 / 受影响文件与测试覆盖 / 验收对照 / 关键决策 / 上抛项>

### §2 设计（eng-designer · 2026-10-16 · 初始轮）

**来源** = 用户 2026-10-16 原话（逐字）：10:44「提示词不应该引用文档吧？！」+ 10:45「删」+ 10:50「p4 收，p3p4 分批。」+ 10:52「都点火，自动跑完。」
**判据单源（按 § 引 · 零转抄）** = 设计面 `docs/core/design/PROMPT-SYSTEM.md` §6.6 ∥ 需求面 `docs/core/requirements/PROMPT-SYSTEM.md` §4-16。
**执行人 = eng-designer**——**本轮只出设计、零落笔**。本面 = **产品代码面**（`thincoder-core/prompts/**` 与 `thincoder-core/tool-docs/**` 是运行期加载面）
⇒ 落笔归 `eng-coder`，须经设计评审 + 用户批准 + 设计凭证。**逐字文本 = 本角色起草 → 主 agent 确认（内容权）→ eng-coder 机械落笔**（承 §6.1 起草分工）。

**判据（照 § 引 · 勿自立）**

- **F1 判据线** = §6.6 三条件全中即文档引用：① 指向对象 = 文档（档名 / 节号 / 指路句 / **出处句形**——署名式如 `single source: core tool-docs/`；删据 = §4-16 纪律 15）② 删后句义自足 ③ 位置 = 模型可见面。
- **F2 处置分档**：真引用 ⇒ **删**（**删引用非改址**；删后句义自足、禁引入新址）；豁免 ⇒ 留（表标「豁免」）；判不准 ⇒ **单列待裁、不自行按留处置**。
- **F3 同律裁决（照 PF 侧已定 · 勿另立）· 适用面 = 文档指路（档名 / 节号 / 「见 X」句）**：所指对象**在模型读到的同一段文本内可自足解析 ⇒ 留**（同档自身指路句 / 同档规则号如 `见 R1` / 装配机读元数据如槽位注释）；**指向别处（跨档 / 外部文档）⇒ 删**。**层名 / 体系自身名 / 档类泛称**（无档名无节号）**不入删支** ⇒ 归 §4-16④ 白名单、判留（表 2 第 1/2 行即此）。

**本批条目（覆盖 · 2 域）**

- **(a) EN 运行面** = `thincoder-core/prompts/**`——**16 档**（名单已给全）：`advisor-design.md` · `advisor-round1.md` · `advisor-round2.md` · `advisor-round3.md` · `common.md` · `consult-base.md` · `discipline-engineering.md` · `discipline-normal.md`
  · `persona-coder.md` · `persona-eng-coder.md` · `persona-eng-designer.md` · `persona-engineering.md` · `persona-explore.md` · `persona-normal.md` · `persona-plan.md` · `subagent-base.md`（实读合计 **1455 行**）。
- **(b) 工具说明档** = `thincoder-core/tool-docs/**`——**52 档**（本角色实列 · 逐档行数见下「受影响面表」；实读合计 **676 行**）。
- **互证**：`prompt-refs-check.mjs` 现行读数「提示词面 84 档」= 本两域 68 档 + CN 面 16 档 ⇒ 两份名单互证齐。

**不在本批**：CN 提示词面 `docs/core/design/prompts/**`（P1 批 · 已审）· 需求档 `docs/core/requirements/**`（父侧笔）· `docs/**` 其余面 · **三包生产码串面**（§6.6 域内在册 · 派单未列 ⇒ 见「上抛项 (a)」）· `_archive/**` · 工具 schema 实现面 · 豁免族文本（不动）。

**枚举基准（两域通用 · 供复核复算）**

- **机判** = `scripts/prompt-refs-check.mjs`（J1/J2/J3 三式 · 域已含本两域）——**现行读数 = 0 命中**（见 AC-5 M1）。
- **人工扫模式集** = `\.md` ∥ `§` ∥ `\bsee\b` / `refer to` / `described in` / `defined in` / `as defined` ∥ `→` ∥ `\blayer\b` ∥ **裸档名族**（`persona-*` / `advisor-*` / `discipline-*` / `consult-*` / `subagent-base` / `common`）
  ∥ **大写档名族**（`PROMPT-SYSTEM` / `AGENT-LOOP` / `BATCH-RECORD` / `DOC-DISCIPLINE` / `LIGHT-CHANNEL` / `TOOL-DOCS` / `CORE-UNIFICATION` …）∥ `公共层` / `shared layer` / `same-named`——**覆盖 §6.6「边界（机器不可分面）」登记的两处缺口**（裸档名 ∥ 面级指路句）。
- **读数**：域 (a) = **真引用 3** · **层名裁留 2** · **豁免坐标 60**（9 类）· 零命中 **4 档**（`consult-base.md` · `persona-normal.md` · `persona-plan.md` · `subagent-base.md`）；域 (b) = **真引用 1**（= 表 1 第 4 行 · 出处句形）· **豁免坐标 33 + 2 族**。
- **计数口径**：单位 = 命中坐标（档:行）；同一行命中两类 ⇒ 按类分别计；「族」= 形态同一且逐坐标无动作价值的成族项（给覆盖规则 + 检出口径，不逐坐标列）。

**逐处表 · 域 (a) EN 运行面**

表 1 · **本批落笔目标（4 处 · 裁 = 删；待 eng-coder 落笔）**

| # | 档:行 | 改前引文 | 判 | 删后句（逐字 · 拟落） |
|---|---|---|---|---|
| 1 | `discipline-engineering.md:197` | `(Parallel-delegation token isolation / scheduling metadata / submit-and-go = main-agent role behavior — see persona-engineering.)` | 真引用（跨档指路句） | `(Parallel-delegation token isolation / scheduling metadata / submit-and-go = main-agent role behavior.)` |
| 2 | `persona-engineering.md:199` | `General parallel rules (stages run in parallel — parallelize aggressively) — see discipline-engineering.` | 真引用（同上） | `General parallel rules (stages run in parallel — parallelize aggressively).` |
| 3 | `persona-coder.md:8` | 句尾括注 `(Evidence discipline / task boundary / delivery table: see the same-named sections in the shared layer — already injected.)` | 真引用（跨档「见同名节」指路句） | 句尾括注改为 `(Evidence discipline / task boundary / delivery table: already injected with this assembly.)`（该行其余逐字不动） |
| 4 | `tool-docs/browser.md:48` | ``CLI, VS Code and desktop share this description verbatim (single source: core `tool-docs/`).`` | 出处句（维护者注 · §4-16 纪律 15 · 对模型零动作语义 · 裁 = 删） | `CLI, VS Code and desktop share this description verbatim.` |

**同源对位（CN ∥ EN · 本批闭合 P1 上抛 (d)）**：P1 批已在 CN 面删去的三处与本表逐处对位——
CN `docs/core/design/prompts/discipline-engineering.md:206` ↔ EN `thincoder-core/prompts/discipline-engineering.md:197`；
CN `docs/core/design/prompts/persona-engineering.md:197` ↔ EN `thincoder-core/prompts/persona-engineering.md:199`；
CN `docs/core/design/prompts/persona-coder.md:6` ↔ EN `thincoder-core/prompts/persona-coder.md:8`。
**实核读数**：CN 三处已清（`grep -n "见 persona-engineering\|见 discipline-engineering\|见公共层同名节" docs/core/design/prompts/` = **0 行**）∥ EN 三处仍在（本表第 1–3 行 · 自核）；落笔后两面同拍。

表 2 · **层名指路（父侧裁 = 留 · 2 处 · 非文档指路 ⇒ F3 删支不适用）**

| # | 域 | 档:行 | 引文（磁盘逐字） | 判 |
|---|---|---|---|---|
| 1 | (a) | `persona-explore.md:9` | `the delivery table follows the unified format in the shared layer.` | 留（所指 = **层名**「shared layer」· 无档名无节号 ⇒ §4-16④ 白名单） |
| 2 | (a) | `persona-eng-coder.md:25` | 「交付表按公共层统一格式；审计/评审轮次与终态写进报告（角色补充）。」 | 留（同上 · 所指 = 层名「公共层」；该档此段为中文——另见「上抛项 (c)」） |

**改判落字（父侧 2026-10-16 · 承 §1 裁决）**：`tool-docs/browser.md:48`（出处句 · §4-16 纪律 15）裁 = **删** ⇒ **并入表 1 第 4 行**、由 eng-coder 同批落笔；表 5 随之归零。

表 3 · **豁免（留 · 按 §6.6 判保留面分类 · 逐类给判据）**

| 类 | 判据（§6.6 判保留面 / 需求 §4-16 白名单 / PF 裁决） | 代表坐标（各 1 项） | 数 |
|---|---|---|---|
| ① 行为操作数族规范豁免串（`AGENTS.md` 等六名） | §6.6 判保留面 · §4-16⑤ 操作数 | `advisor-round1.md:16` | 14 |
| ② 路径操作数 / 路径形 | §6.6 判保留面（路径操作数）+ §4-16③ | `common.md:201`（`<repo>/docs/batches/<batch>-<topic>.md`） | 8 |
| ③ `.md` 字面量 | §6.6 判保留面（扩展名字面量） | `advisor-design.md:22` | 1 |
| ④ 地图探测址 `docs/README.md` | §6.6 判保留面**明列** | `discipline-normal.md:13` | 3 |
| ⑤ 纪律条本体（该行即纪律、非引用） | 条文本体（含 `doc:section` / `"see X"` / `batch X §2` 示例形） | `common.md:53` | 5 |
| ⑥ 同档自身指路句 / 同档规则号 / 同档步号 | **PF 裁决（同一段文本内可自足解析）** | `advisor-design.md:71`（`see R1`——`R1` 定义在同档 `:64`，实核） | 20 |
| ⑦ 协议自名（段号 `§1`–`§6` 及下级两段形） | **§6.6 J2 合法正例** | `persona-eng-coder.md:33` | 族（不逐坐标计 · J2 读数 0） |
| ⑧ 槽位注释 / 装配机读元数据 | **PF 裁决**（槽位注释族） | `persona-engineering.md:1`（`eng-coder subagents use persona-eng-coder instead`） | 1 |
| ⑨ 协议内层名 / 面名 / 档类泛称（无档名无节号 · 非指路句） | §4-16④ 本提示词体系自身名 · 判据线①不中 | `discipline-engineering.md:117`（`→ persona layer`） | 8 |

**类 ① 全坐标（14）**：`advisor-round1.md:16` · `:27` · `advisor-round2.md:18` · `advisor-round3.md:17` · `common.md:34` · `:161` · `discipline-engineering.md:22` · `discipline-normal.md:13` · `:30` · `:32` · `:150` · `:156` · `:188` · `persona-eng-coder.md:26`。
**类 ② 全坐标（8）**：`common.md:201` · `discipline-engineering.md:18` · `:191` · `discipline-normal.md:220` · `persona-eng-designer.md:19` · `persona-engineering.md:11` · `:146` · `:200`。
**类 ④ 全坐标（3）**：`discipline-normal.md:13` · `:32` · `persona-eng-designer.md:33`。**类 ⑤ 全坐标（5）**：`common.md:52` · `:53` · `:184` · `:186` · `discipline-engineering.md:181`。
**类 ⑧ 全坐标（1）**：`persona-engineering.md:1`（**实核**：16 档槽位注释中仅此档含**裸档名引用** `persona-eng-coder`；其余槽位注释只含**角色名** `eng-coder` / `eng-designer` / `explore` / `coder` / `plan` 与 `ALL scenarios` 等装配说明——角色名非档名，不入引证面）。
**类 ⑧ 邻项（槽 loader key 操作数 · 非引证面）**：`advisor-design.md:1` / `advisor-round1.md:1` / `advisor-round2.md:1` / `advisor-round3.md:1` —— 槽位键 `special-advisor-*`（档名干形 · 非 `.md` 形档名）。
**类 ⑨ 全坐标（8）**：`discipline-engineering.md:117` · `:118` · `:119` · `:120` · `persona-eng-designer.md:6` · `:14` · `:15` · `persona-engineering.md:153`（域内面名 / 层名 / 档类泛称；判据 = 无档名无节号 ∧ 不构成「见 X」指路句）。
**类 ⑥ 全坐标（20）**：`common.md:50` · `:89` · `:95` · `:133` · `discipline-engineering.md:36` · `advisor-design.md:55` · `:63` · `:71` · `advisor-round1.md:29` · `:45` · `:47` · `:54` · `advisor-round2.md:41` · `:49` · `:56` · `advisor-round3.md:37` · `:45` · `:52` · `persona-eng-designer.md:38` · `:52`。
**类 ⑥ 的 R1 附带条件（PF 设）实核**：`see R1 exception` 四处所在档内均**同档定义 R1**（`advisor-design.md:64` · `advisor-round1.md:48` · `advisor-round2.md:50` · `advisor-round3.md:46`）⇒ 同档可自足解析 ⇒ **附带条件不触发、判留**（若实施轮实核发现某档缺 `R1` 定义 ⇒ 该处改删，报父侧）。

**逐处表 · 域 (b) 工具说明档（`thincoder-core/tool-docs/**` · 52 档）**

表 4 · **真引用 = 1 处**（出处句形 · `browser.md:48` · 裁 = 删 · 见表 1 第 4 行）。**读数**：`grep -rnE "→ see|see the .{0,30}\.md|refer to .{0,30}\.md" thincoder-core/tool-docs/` = **0 行**（指路句形 0）；出处句形由 M6 覆盖（现行读数 = 1 行）。

表 5 · **待裁 = 0 处**（域 (b) 落笔项已入表 1 第 4 行）。

表 6 · **豁免（留 · 逐类）**

| 类 | 判据 | 代表坐标（各 1 项） | 数 |
|---|---|---|---|
| ① 行为操作数（`AGENTS.md` / `.thincoder/advisor.md`） | §6.6 判保留面 · §4-16⑤ | `advisor.md:3` | 2 |
| ② 路径形 / 格式例 / 工具目标文件 / manifest 键路径 | §6.6 路径操作数 + §4-16③ | `advisor.md:1`（`<repo>/docs/…`） | 5 |
| ③ 工具名 / 参数名 / 占位字面量 | §4-16① 工具与工具参数 | `read_history.md:7` | 15 |
| ④ 工具路由箭头族 `→ <tool>` | §4-16①（工具名） | 档族 **13 档**（见下全列 · 形态同一 ⇒ 逐坐标不列） | 族 |
| ⑤ 协议自名（段号 `§1`–`§6`） | §6.6 J2 合法正例 | `batch.md:1` | 族（J2 读数 0） |
| ⑥ 泛称面名（无档名无节号 · 非指路句） | §6.6 判据线①不中 | `eng.md:1` | 3 |
| ⑦ 运行时概念（memory layer 族 / 台账状态名族 / `slot` / `slots`） | §4-16② 会话内对象 | `memory.md:8` | 8 |

**类 ① 全坐标（2）**：`advisor.md:3`（`.thincoder/advisor.md`）· `verify.md:1`（`the project's AGENTS.md`）。
**类 ② 全坐标（5）**：`advisor.md:1` · `manifest.md:1`（`PROJECT-MANIFEST.json`）· `manifest.md:10`（`docRoot.design` / `index.publicRepos` / `advisor.docMap`）· `manifest.md:12`（`docs/design` 例值）· `settings.md:4`（`config.json`）。
**类 ③ 全坐标（15）**：`advisor.md:1` · `code_search.md:1` · `doc_search.md:1` · `read_history.md:5` · `:7` · `subagent.md:9` · `:10` · `:11` · `:12` · `:20` · `:21` · `batch.md:1`（占位字面量 `#<编号>` / `<板块>` / `<BATCH-ID>` / `<讨论来源>`）· `ssh.md:13` · `timer.md:9` · `peer_instances.md:1`。
**类 ④ 全列（13 档）**：`bash.md` · `read.md` · `ls.md` · `grep.md` · `delete.md` · `edit.md` · `execute.md` · `file_ops.md` · `get_current_time.md` · `process.md` · `tree.md` · `browser.md` · `ssh.md`（代表坐标 `read.md:3` · `bash.md:4`–`:9`）。
**类 ⑤ 全坐标（2）**：`batch.md:1` · `subagent.md:20`（`§5` 记录写通道——同档可解析 ⇒ 正例）。
**类 ⑥ 全坐标（3）**：`eng.md:1` · `subagent.md:22` · `notify_parent.md:3`。
**类 ⑦ 全坐标（8）**：`memory.md:2` · `:4` · `:5` · `:6` · `:8` · `ledger.md:3` · `:4` · `team_ledger.md:7`。

**豁免合计（以表 3 / 表 6 为唯一读数）**：域 (a) 豁免坐标 = **60**（表 3 各类合计 14 + 8 + 1 + 3 + 5 + 20 + 1 + 8 · ⑦ 协议自名族不逐坐标计）；域 (b) 豁免 = **33 坐标 + 2 族**。

**同类先例行（坐标 + 对齐 ∥ 偏离 + 理由）**

- **坐标 = `docs/core/design/PROMPT-SYSTEM.md` §6.6「边界（机器不可分面）」段**（**面级指路句**存量 2 处已裁 = **删**——用户「这种话都不应该出现在提示词里」；域内现余 0）。
  **对齐**：表 1 第 1–3 行三处「see X」属同族（跨档指路句），处置同形 = 删 + 句义保留；**偏离**：无。
- **坐标 = P1 批 §2 表 1 体例**（`docs/batches/2026-10-16-prompt-face-ref-cleanup.md` · CN 面同源三处已删 · 逐处「改前引文 → 判 → 改后」）。
  **对齐**：表 1 逐处体例照其形（含「删引用非改址」的落形）；**偏离**：无。
- **坐标 = P1 批 §2 表 3 体例**（豁免按 §6.6 判保留面分类 · 每类给代表坐标 + 数）。
  **对齐**：本档表 3 / 表 6 照其形；**偏离**：**本档多给「各类全坐标」（P1 只给代表坐标）**——理由 = 本批两域 68 档、豁免坐标由本角色实扫得出，全列可复核（P1 面 16 档从简）。
- **坐标 = 本面 `common.md:53` 操作数豁免条**（`thincoder-core/prompts/common.md` 判保留面正例）。
  **对齐**：表 3 类 ①②③④ / 表 6 类 ①② 照其枚举口径；**偏离**：无。
- **坐标 = `docs/core/design/PROMPT-SYSTEM.md` §6.6「判保留面」`docs/README.md` 地图探测址明列**。
  **对齐**：表 3 类 ④ 三处照留；**偏离**：无。

**公共源勘察证据行**

- **查过（工作目录树内 · 判据本体）**：`docs/core/design/PROMPT-SYSTEM.md` §6.6 ∥ `docs/core/requirements/PROMPT-SYSTEM.md` §4-16 ∥ P1 批档 §2（CN 面同律处置体例）∥ `scripts/prompt-refs-check.mjs`（J1/J2/J3 机判契约与域）。**相关** ⇒ 判据单源即此三处（按 § 引）。
- **仓外声明源**：`thincoder/PROJECT-MANIFEST.json` `index.publicRepos = []`（实读）⇒ **本仓无声明公共仓**。
- **工作区外参考系（`D:\ref\` 五仓 · 按工作区指引可读）**：`kimi-code` · `MiMo-Code` · `oh-my-pi` · `openclaw` · `opencode`——**全五仓 `**/*.md` 扫过**（模式 = 「see the … doc(s)」/「见…文档」族 + `*prompt*` 路径族清单）。**命中 2 类**：
  ① `oh-my-pi/.omp/commands/fix-issues.md:26` ∥ `review-prs.md:26`——`（… see the \`github\` tool docs）`：所指 = **运行时已挂载的工具说明**（非仓内文档）；
  ② `openclaw/docs/**` 与 `CHANGELOG.md` 的互引——**文档面**（非提示词面），且其提示词面（`.github/codex/prompts/**`）零命中。
  ⇒ **无「提示词面禁带文档引用」的同律先例可对齐**（唯一近例 = 指向运行时挂载物的指针，与本仓 §4-16② 会话内对象白名单同向）；判据以本仓 §6.6 ∥ §4-16 为准，先例缺席已落字。

**受影响面表（68 档逐档实读行数 + 预期增量 · 实读合计 2131 行）**

域 (a) EN 运行面 `thincoder-core/prompts/**`（16 档 · 1455 行）：

| 档 | 现行行数 | 本轮 Δ |
|---|---|---|
| `advisor-design.md` | 77 | — |
| `advisor-round1.md` | 63 | — |
| `advisor-round2.md` | 65 | — |
| `advisor-round3.md` | 61 | — |
| `common.md` | 242 | — |
| `consult-base.md` | 26 | — |
| `discipline-engineering.md` | 198 | 1 处（`:197` 删指路句 · **±0 行**） |
| `discipline-normal.md` | 255 | — |
| `persona-coder.md` | 21 | 1 处（`:8` 括注改写 · **±0 行**） |
| `persona-eng-coder.md` | 38 | — |
| `persona-eng-designer.md` | 85 | — |
| `persona-engineering.md` | 217 | 1 处（`:199` 删指路句 · **±0 行**） |
| `persona-explore.md` | 15 | — |
| `persona-normal.md` | 47 | — |
| `persona-plan.md` | 27 | — |
| `subagent-base.md` | 18 | — |

域 (b) 工具说明档 `thincoder-core/tool-docs/**`（52 档 · 676 行 · **本轮 Δ = `browser.md`:48` 原行改写 · ±0 行**（删出处句 · 表 1 第 4 行）；其余 51 档 Δ = 0）：

| 档 | 行数 | 档 | 行数 | 档 | 行数 | 档 | 行数 |
|---|---|---|---|---|---|---|---|
| `advisor.md` | 9 | `delete.md` | 16 | `lint.md` | 11 | `read_image.md` | 9 |
| `apply_patch.md` | 16 | `doc_search.md` | 1 | `ls.md` | 13 | `recent_changes.md` | 1 |
| `bash.md` | 40 | `edit.md` | 20 | `lsp.md` | 11 | `repo_outline.md` | 1 |
| `batch.md` | 1 | `eng.md` | 1 | `main_history.md` | 1 | `settings.md` | 6 |
| `browser.md` | 49（Δ：`:48` 原行改写 · ±0 行） | `execute.md` | 14 | `manifest.md` | 17 | `skill.md` | 6 |
| `code_search.md` | 1 | `fetch.md` | 13 | `memory.md` | 11 | `ssh.md` | 35 |
| `consult_start.md` | 5 | `file_ops.md` | 17 | `notify_parent.md` | 14 | `subagent.md` | 44 |
| `consult_stop.md` | 3 | `get_current_time.md` | 8 | `peer_instances.md` | 1 | `task.md` | 8 |
| `context.md` | 7 | `git.md` | 29 | `plan.md` | 6 | `team_ledger.md` | 10 |
| | | `glob.md` | 12 | `process.md` | 15 | `timer.md` | 14 |
| | | `goal.md` | 7 | `question.md` | 19 | `tree.md` | 14 |
| | | `grep.md` | 20 | `read.md` | 21 | `verify.md` | 1 |
| | | `hashline_edit.md` | 15 | `read_history.md` | 7 | `wait_for.md` | 25 |
| | | `insert_after.md` | 16 | | | `websearch.md` | 17 |
| | | `ledger.md` | 6 | | | `write.md` | 12 |

**结构线**：两域最大档 = `discipline-normal.md` 255 行 ∥ `browser.md` 49 行——**均远低于 500 行咨询线** ⇒ 本轮**无需拆档**（改动 = 4 档各 1 行原位替换，零结构影响）。

**接口契约（设计档 8 项之 2）**：本批 = **运行期文本面的逐行替换**——`thincoder-core/prompts/**` 经 `prompt-files.mjs` 装载、`tool-docs/**` 经 `loadToolDoc` 装载（现状坐标 = `PROMPT-SYSTEM.md` §6.5）；**零装配面 / 零 schema / 零工具参数 / 零 API 变更**，数据流不变。**逐字文本 = 表 1 四行「删后句」**（内容权 = 主 agent 确认后交 eng-coder 机械落形）。

**验收对照（逐条回指本批条目 · 可机验 + 读数）**

- **① 两域逐处表齐** —— 域 (a) 表 1–3（真引用 3 + 层名裁留 2 + 豁免 60）∥ 域 (b) 表 4–6（真引用 1 + 待裁 0 + 豁免 33 坐标 + 2 族）；**落笔目标 = 表 1 四行（4 档 · 各 1 行）**；16 档 + 52 档全覆盖（零命中档亦列于受影响面表）。
- **② 判据单源按 § 引（零转抄）** —— 判据行不复制条文**正文**，以 `§6.6` / `§4-16` 坐标 + 结论为限；**F1 / F3 = 压缩判据线**（非条文本体）。
- **③ 先例行 + 勘察行在场** —— 见上「同类先例行」（5 条 · 坐标 + 对齐 ∥ 偏离 + 理由）与「公共源勘察证据行」（3 行 · 含「无同类先例」落字）。
- **④ 受影响面表** —— 68 档逐档实读行数 + 预期增量（见上）。
- **⑤ 可机验判据在位** —— AC-5（M1–M6）：
  - **M1（既有常驻锁 · 不新增）**：`node scripts/prompt-refs-check.mjs`（仓根零参）⇒ 现行读数 = `汇总：提示词面 84 档 · 代码面 451 档 · 命中 0` + `OK(prompt-refs): J1/J2/J3 三式零命中`（exit 0）；**落笔后须同读数**（闸态阈值 0）。
  - **M2（跨档指路句零命中 · 本批可直跑新增判据）**：`grep -rn "see persona-engineering\|see discipline-engineering\|same-named sections in the shared layer" thincoder-core/prompts/` ⇒ **现行读数 = 3 行**（`discipline-engineering.md:197` ∥ `persona-engineering.md:199` ∥ `persona-coder.md:8`）；**落笔后须 = 0 行**。
  - **M3（域 (b) 指路句零命中）**：`grep -rnE "→ see|see the .{0,30}\.md|refer to .{0,30}\.md" thincoder-core/tool-docs/` ⇒ 现行读数 = **0 行**；落笔后 = 0。
  - **M4（节号机判）**：J2（`§` + 两位号 / `N.N`）现行读数 = **0 命中**；协议自名 `§1`–`§6` 为该式明定合法正例（域内属该族 ⇒ 不入引证面）。
  - **M5（被清档零编辑 · 本轮）**：`git status --porcelain thincoder-core/prompts thincoder-core/tool-docs` ⇒ 本轮读数 = **空**（零改动）。
  - **M6（域 (b) 出处句零命中 · 本批可直跑新增判据）**：`grep -rn "single source: core" thincoder-core/tool-docs/` ⇒ **现行读数 = 1 行**（`browser.md:48`）；**落笔后须 = 0 行**。
- **⑥ 被清档零编辑** —— 即 M5（本轮零落笔）。
- **⑦ 行宽声明** —— 本 §2 文本按 **≤300 字符**书写；EN 档**不在行宽机检域**（`PROJECT-MANIFEST.json` `checkConfig.scanDirs = ["docs"]`）——披露不行使，同 §6.19 记法（见上抛 (d)）。

**用例表（设计档 8 项之 6）**

| 类 | 输入 | 期望输出 |
|---|---|---|
| 常 | 落笔后两域全文 | M1 = 0 命中 / exit 0（J1/J2/J3 三式） |
| 边界（本批四行改后句） | 四行全文无档名 · 无节号 · 无指路词 | M2 = 0 行（域 (a) 三行）∧ M6 = 0 行（域 (b) 一行） |
| 边界（豁免族仍留） | `AGENTS.md` 等六名 · `docs/README.md` · 路径形 · `§1`–`§6` | M1 白名单不报（J1 白名单 / J2 正例）⇒ 仍 0 |
| 边界（同档自身指路句） | `see R1` / `next section` / `above` 族 | 不入引证面（J1/J2/J3 均不命中） |
| 错误（误删豁免族 —— 不得发生） | 落笔 = 逐行替换，只动表 1 四行 | `git diff --stat` = **4 档 · 各 1 行**（行数 ±0） |

**关键决策**

- **D-P3-1 判据不进设计档**：判据本体已住 §6.6 ∥ §4-16（D2 单一权威源）⇒ 本批 = **存量处置**；逐处表 = 一次性过程材料 ⇒ 落本档 §2，不进长期文档。
- **D-P3-2 判别线**：跨档 / 外部 ⇒ 引证面；本档自身 / 同档规则号 / 同档步号 / 槽位注释 ⇒ 留（承 PF 裁决 · F3）。
- **D-P3-3 待裁不自行按留处置**：判不准者一律不自行按留处置，单列供父侧裁量。
- **D-P3-4 删引用非改址 + 句义保留**：表 1 第 1–3 行只删引用，不引入新址、不把出处搬进提示词；`persona-coder.md:8` 一行的「已随本装配注入」= 该行「已注入」事实的自足表述。
- **D-P3-5 EN ∥ CN 同律不同面**：CN 面（P1 批）已清 · 本轮 = EN 运行面 + tool-docs ⇒ 落笔后两面**同拍**（同源对位见上）。
- **D-P3-6 落笔安排**：本面 = 产品代码面 ⇒ **eng-coder 落笔**（本角色起草逐字 → 主 agent 确认内容权 → 机械落形）；**不新增机械门**（§6.6 常驻锁已在）。
- **D-P3-7 豁免全列而不从简**：本档给各类**全坐标**（偏离 P1 从简体例 · 由 = 本批两域 68 档、坐标由本角色实扫得出，全列可复核）。
- **D-P3-8 计数以表为唯一读数**：表 3 / 表 6 为唯一读数。

**上抛项 / 未决**

- **(a) [上抛·待裁] 三包生产码串面**：§6.6 域内在册（`thincoder-core/**` + `thincoder-cli/src/**` + `thincoder-vscode/src/**` 的字符串 / 模板字面量），本批派单只给两域 ⇒ **未动**。`prompt-refs-check.mjs` 现行读数 = 0 命中；但 §6.6 明载 **J3 覆盖缺口**（模型可见代码串内的小写档名不落任何一式 · 域内实测 61 处）⇒ 去留归父侧裁（同族相位 = P4 代码面批）。
- **(a-1) [残留指针 · 承 §6 收口]**：本批落笔后 §6.6 域**未清面 = 三包生产码串面**；「两面同拍」仅指**文本面** ⇒ 非全域清零。
- **(b) [已裁] 表 2 裁项**：父侧裁 = `persona-explore.md:9` 留 · `persona-eng-coder.md:25` 留（层名 ⇒ §4-16④ 白名单 · 非文档指路）· `tool-docs/browser.md:48` 删（出处句形 · 并入表 1 第 4 行）。
- **(c) [上抛·知会] EN 档含中文段**（非本批射程 · 仅报不办）：`advisor-round2.md:44`–`:46` ∥ `advisor-round3.md:40`–`:42` ∥ `persona-eng-coder.md:25` · `:33`–`:37`——EN 运行面内成段**中文**文本（与 CN 正本同文）。本轮**零触**（本批任务面 = 去文档引用）；是否另开相位归父侧。
- **(d) [上抛·知会] 行宽面**：EN 档不在行宽机检域（`scanDirs = ["docs"]`），域 (a) 存在存量 >300 字符行——本轮**零折行**（同 P1 D-P4；行宽相位另轮）。
- **(e) [上抛·待裁] §1 :9 读数同步**：§1 :9 仍载派单旧读（「落两域真引用 3 + 待裁 3」等，已被 §1 :11「父侧就地收正」收正）并载「豁免 59」（随本席补入类⑨ 坐标 `persona-engineering.md:153` 后应为 60）；§1 席位 = 父侧 ⇒ 请父侧同步（本席未改 §1）。

**边界（不做）**：不触 CN 提示词面 ∥ 需求档 ∥ `docs/**` 其余面 ∥ 三包生产码串面 ∥ `_archive/**` ∥ 工具 schema 实现面 ∥ 不新增机械门 ∥ 不改 §6.6 ∥ §4-16 语义 ∥ 不动豁免族与表 2 两处（裁留）∥ 不做行宽折行 ∥ 不碰他批。

**落笔安排 + 行宽声明**：逐字文本 = 表 1 四行「删后句」（待主 agent 确认内容权）；落笔 = `eng-coder`（产品代码面 · 须经设计评审 + 用户批准 + 凭证）；**本角色本轮零落笔**（证据 = M5 读数 = 空）。**行宽声明** = 本 §2 按 ≤300 字符书写。

**设计档 8 项对照（完整性自查）**：1 方法+理由 → 「判据」+「同类先例行」+「公共源勘察证据行」∥ 2 接口契约 → 「接口契约」段 ∥ 3 受影响文件表 → 「受影响面表」∥ 4 关键决策 → D-P3-1…8 ∥ 5 验收回指 → 「验收对照」∥ 6 用例表 → 「用例表」∥ 7 边界 → 「边界」段 ∥ 8 UI/交互 → **无 UI 面**（运行期文本），**open 项 = 无**。

**读回自检**：引用集 ↔ 标题集（§6.1 / §6.5 / §6.6 / §6.19 / §4-16 均实存）· 表行 ↔ 合计（表 3 = 60 · 表 6 = 33 + 2 族 · 受影响面表 = 1455 + 676 = 2131）· 断言 ↔ 实测（读数全来自实跑：`prompt-refs-check.mjs` · 四条 grep · 逐档行数脚本 · `git status --porcelain`）——三项一致。

## §3 设计评审（评审子代理）

### 轮次 1（评审子代理）

**设计评审 · P3 相位处置表（对象 = 本批档 §2 · 状态 待评审）**

**逐处实核（评审侧独立复跑，非转抄）**
- 域档数：`thincoder-core/prompts/` = 16 档 ✓ · `thincoder-core/tool-docs/` = 52 档 ✓（`ls` 实列；16 + 52 + CN 16 = 84，与 `scripts/prompt-refs-check.mjs:25` 域一致）；受影响面表抽查 prompts 全 16 档 + tool-docs 8 档行数**全中**，两域合计 1455 + 676 = 2131 ✓。
- M2 复跑 = 3 行，坐标/逐字与表 1 三行一致 ✓；M3 复跑 = 0 行 ✓；CN 侧同源三处已清（`grep` 0 行）✓，CN 正本坐标 `discipline-engineering.md:206` ∥ `persona-engineering.md:197` ∥ `persona-coder.md:6` 实核在位 ✓。
- 独立扫面（超出本档模式集另跑）：两域 `\bsee\b|refer to|described in|defined in|as defined|\.md|docs/` + 裸档名族（persona-/advisor-/discipline-/consult-/subagent-base）+ 大写档名族 ⇒ **除表 1/表 2 已列者外两域零跨档引证**（(a) 真引用 3 ∥ (b) 真引用 0 复核成立；唯一未列项 `tool-docs/wait_for.md:5` 的 `advisor settled` = 运行时事件名，非引证）。
- 判据源核：`docs/core/design/PROMPT-SYSTEM.md:211`（判据线三条件）· `:212`（判保留面六名）· `:214`（`.md` 字面量 / 协议自名）· `:218`（域含三包生产码串）· `:225`（J3 缺口 61 处）· `:226`（面级指路句存量 2 处已裁 = 删）∥ 需求档 `:273`（五类白名单）· `:267`（纪律 15）；`prompt-refs-check.mjs:128/:138`（汇总行 / OK 行形态与 M1 所述一致）。
- 零落笔旁证：两域最新 mtime = 2026-10-15，无 2026-10-16 写入。
- 限制：本评审无执行工具 ⇒ M1 的「代码面 451 档」读数与 M5（`git status --porcelain`）本轮未复跑（脚本契约、域档数、mtime 已旁证）；无文档地图声明 ⇒ Document ownership 判据降级（按 Project Guide 判）。

| # | Category | Severity | Issue | Suggestion |
|---|----------|----------|-------|------------|
| 1 | Acceptance / Doc-state | 🟡 | §1 已记裁决「(b) 表 2 三处 = 照其倾向执行（留 / 留 / 删）」（本档 :9），但 §2 表 2 仍标「待裁（判不准 · 未动 · 单列）」（:61）、表 5（:97）、受影响面表「本轮全档 Δ = 0——唯一待动者 = 表 5 待裁项，未裁前不动」（:167）、用例表「`git diff --stat` = 3 档 · 各 1 行」（:214）、上抛 (b)（:230）四处均未随裁决更新，§2 自定吸收机制「若父侧裁「删」，即并入表 1 由 eng-coder 同批落笔（本档 §2 追加一笔改判）」（:69）未落笔。后果：`tool-docs/browser.md:48` 实为第 4 个落笔目标，而受影响面表无其 Δ、用例表预期 3 档、M3 读数删前删后同为 0 行（:200）⇒ 无任何机验判据覆盖该档 | 按 :69 自定机制补一笔改判（表 5 并入表 1）；受影响面表给 `browser.md` 标「1 行删除 · ±0 行」；用例表预期改「4 档 · 各 1 行（行数 ±0）」；为该句补一条 grep 型判据（现 M3 对「single source: core tool-docs/」不敏感） |
| 2 | Clarity | 🟡 | 表 1 #3 的引文与改后句作全角括注 `（Evidence discipline / task boundary / delivery table: already injected with this assembly.）`（:53），磁盘 `prompts/persona-coder.md:8` 该括注为 ASCII `(...)`（同行其余文本亦 ASCII）——全角形来自 CN 正本 `design/prompts/persona-coder.md:6`；同表 2 #2 引文加粗「交付表**按公共层统一格式**」（:66）而磁盘 `persona-eng-coder.md:25` 无标记；表 2 #3 引文漏磁盘 `tool-docs/browser.md:48` 中 `tool-docs/` 的行内反引号（:67）。逐字文本（:20）若按此机械落形，EN 档将混入 CJK 标点 | #3 改后句按磁盘限定符写 ASCII `(...)`；表 2 两行引文从磁盘逐字重录（或标注「标记已归一」），使「逐字文本」可直接落形 |
| 3 | Doc hygiene | 🟡 | 计数订正以修订式表达残留规范面：表 3 类 ⑨「数」格仍为 `6`（:83），由 :240「**表 3 类 ⑨ 计数订正（取代该表格内「数」格）**：类 ⑨ 数 = 7」更正；:119 保留「（表 3 各类合计 14+8+1+3+5+20+7+1 —— 原「58」订正）」式表述。AC-① 与 :241 合计（59）以表为唯一读数，按表读得 6 与「全坐标 7 项」及 59 的算式自相矛盾 | 更正值直接落进表 3 类 ⑨ 的「数」格，删去「原…订正 / 取代…」的修订式残留（历史归记录面），使表内合计与文末合计一次成立 |
| 4 | 判据一致性 | 🟡 | 判据线 F3（:26）写「**指向别处（跨档 / 外部文档）⇒ 删**」，而 (b) 裁决（:9）对表 2 #1/#2（所指 = 公共层 / 层名，即别档 `common.md` 槽）裁「留」，:9 给出的理由恰是 F3 的「同一段文本内 / 跨档」口径；:65 亦自记「乙（§6.6 判据线① + F3）：所指对象在别档…⇒ 删」。同一判据句按字面落实会反删本批保留的两处 ⇒ 后续批次照 F3 执行即回退 | 给 F3 加适用范围限定（文档指路 = 档名 / 节号 /「见 X」句），层名 / 体系自身名归 §4-16④ 白名单；或在 §2 记一笔「#1/#2 不落 F3 删支」的因由（裁量不动），使判据句与处置面自洽 |
| 5 | Coverage | 🔵 | §6.6 域含「三包生产码字符串 / 模板字面量」（`PROMPT-SYSTEM.md:218`），域内实测 61 处落 J3 覆盖缺口（同档 :225）；本批按派单只收两文本面（§2:229），已记「同族相位 = P4 代码面批」并入册。本批落笔后 EN ∥ CN 文本面同拍，但 §6.6 域整面并未清零 | 保持现状；建议 §6 收口时把「§6.6 域未清面 = 生产码串面」列为显式残留指针，避免「两面同拍」被读成全域清零 |
| 6 | Clarity / AC | 🔵 | AC-②（:194）称判据行「条文不复制（判据本体住设计档与需求档）」，但 F1（:24）复述 §6.6 判据线三条件、F3（:26）复述 PF 同律裁决。内容经核与 `PROMPT-SYSTEM.md:211` / `:226` 一致、无机制级矛盾，仅使该条判据字面不成立 | 把 AC-② 收敛为「不复制条文正文（判据行以 § 引 + 结论为限）」，或明示 F1/F3 属压缩判据线、非条文本体 |
| 7 | Census precision | 🔵 | 类⑧（:88）称「16 档槽位注释中仅此档含档名」，但 `advisor-design.md:1` / `advisor-round1.md:1` / `advisor-round2.md:1` / `advisor-round3.md:1` 槽位注释含 `special-advisor-design` / `special-advisor-round1..3` 形槽位键（档名干形）。处置（留）不受影响，仅依据句与磁盘不一致 | 把这四档槽位键按「槽 loader key 操作数」明列于类⑧，或把依据句改写为「仅此档含 `.md` 形档名」，使豁免依据可与磁盘对齐复核 |

**计数**：🔴 0 · 🟡 4 · 🔵 3（无 🔴 ⇒ 放行；🟡/🔵 不阻断）。

VERDICT: pass

### 轮次 2（评审子代理）

**设计评审 · 第 2 轮（对象 = 本批档 §2 · 状态 待评审 · 只核第 1 轮 7 条处置 + 追新伤）**

**第 1 轮 7 条处置核验（评审侧独立复跑）**
- #1（表 2 裁项未落笔 ⇒ `browser.md:48` 无 Δ / 无用例 / 无机验）：✅ 落地——表 1 增第 4 行（:56）· 表 5 归零（:100）· (b) 域表 Δ 声明（:169）· 用例表「4 档 · 各 1 行」（:217）· 新增 M6（:205）+ AC-⑤ 改 M1–M6（:199）· 上抛 (b) 标「已裁」（:234）。
- #2（全角括注 / 引文非逐字）：✅ 落地——:55 改后句回 ASCII `(...)`；表 2 引文与磁盘逐字同（`persona-explore.md:9` · `persona-eng-coder.md:25`，加粗已去）；表 1 第 4 行含磁盘行内反引号 `tool-docs/`。
- #3（类⑨ 数格 + 修订式残留）：✅ 落地——表 3 类⑨ 数格直接落 7（:85）· 全坐标 7（:92）· 合计 `14+8+1+3+5+20+1+7` = 59（:122）· 全档区无「订正 / 取代 / 原「58」」残留（grep 仅命中 §3 第 1 轮表与 P1 先例行引称）。
- #4（F3 字面反删裁留两处）：✅ 落地——:28 加适用面限定（文档指路 = 档名 / 节号 /「见 X」句）+ 附则（层名 / 体系自身名 / 档类泛称不入删支 ⇒ §4-16④ 白名单 · 表 2 #1/#2 即此）。
- #5（「两面同拍」被读成全域清零）：✅ 落地——:233 新增 (a-1) 残留指针（未清面 = 三包生产码串面 · 仅文本面同拍）。
- #6（AC-② 字面不成立）：✅ 落地——:196 收敛为「不复制条文正文 · F1/F3 = 压缩判据线」。
- #7（类⑧ 依据句与磁盘不一致）：✅ 落地——:90 依据句改精确（仅此档含裸档名 `persona-eng-coder`）+ :91 邻项行（四档 `special-advisor-*` 槽 loader key）；实核 `advisor-design.md:1` = `special-advisor-design` ✓ · `advisor-round1.md:1` = `special-advisor-round1` ✓。

**独立复跑（数字抽查 · 非转抄）**：两域档数 16 ✓ / 52 ✓；受影响面表抽查 prompts 9 档 + tool-docs 4 档行数全中（77 / 63 / 198 / 255 / 217 / 21 / 85 / 38 / 15 ∥ 40 / 49 / 44 / 35）；两表求和 1455 + 676 = 2131 ✓；M2 复跑 = 3 行（坐标同表 1 #1–#3）✓；M6 复跑 = 1 行（`browser.md:48`）✓；判据源 `docs/core/design/PROMPT-SYSTEM.md:211/:212/:214/:218/:225/:226` ∥ `docs/core/requirements/PROMPT-SYSTEM.md:267`（纪律 15）/`:273`（五类白名单）实存且与 F1/F2/F3 压缩一致 ✓；四行删净后 M2/M6 均可达 0 ✓。**限制**：无 shell/git ⇒ M1「代码面 451 档」与 M5（`git status --porcelain`）未复跑（脚本契约、档数、行数已旁证）；无文档地图声明 ⇒ Document ownership 判据降级（按 Project Guide 判：写批次档 §2、未新建档、未重述 §6.6/§4-16 条文）。

| # | Category | Severity | Issue | Suggestion |
|---|----------|----------|-------|------------|
| 1 | Clarity（R7d 语义悬空） | 🟡 | 第 1 轮 #1 的落笔引入已退役行号的悬空引用：:71「**改判落字（父侧 2026-10-16 · 承 §1 裁决）**：#3（`tool-docs/browser.md:48` · 出处句 · §4-16 纪律 15）」、:234「父侧裁 = ① 留 · ② 留 … · ③ 删（并入表 1 第 4 行）」——`#3` / `③` 指旧表 2 第 3 行，而现表 2 只 2 行（:66–:69），同 §2 的表 1 #3 = `persona-coder.md:8`（:55）⇒ 同一 token「#3」在 §2 内指两件事 | 把 :71 / :234 的 `#3` / `③ 删` 改为坐标式指称（`tool-docs/browser.md:48`）；改判经过按记录面归属安置（:11 已存） |
| 2 | 判据一致性 | 🔵 | F1（:26「① 指向对象 = 文档（档名 / 节号 / 指路句）」）不覆盖本批第 4 个落笔目标形态：:44 记「真引用 1（= 表 1 第 4 行 · 出处句形）」、:56 判列「出处句（维护者注 · §4-16 纪律 15 · 对模型零动作语义 · 裁 = 删）」——删支实据 = 纪律 15（`requirements/PROMPT-SYSTEM.md:267`）+ :11 父侧「跨档档名形」裁决，均不在 F1① 枚举内；处置正确，仅后续批次照 F1 字面执行时出处句形落不进「真引用 ⇒ 删」 | 在 F1① 或 F2 分支补入「出处句 / 署名式（`single source: …`）」一类，仍以 :11 裁决为单一源 |
| 3 | Census precision | 🔵 | 表 3 类⑨ 标「全坐标（7）」（:92）、D-P3-7（:227）自陈「全坐标…全列可复核」，但域 (a) 内 `persona-engineering.md:153`「write the criterion **by reference to its single source** `(the design-doc section / the ruling)`」所指 = 档类泛称、无档名无节号，按 类⑨ 判据（或 F3 附则 · :28）同为判留，却未进 类⑨、也未进 表 2「层名指路 · 2 处」 | 该坐标明列入 类⑨ 全坐标（或表 2），或把「全坐标」判据句收窄到实际枚举面 |
| 4 | Clarity / 落形精度 | 🔵 | (b) 域表 Δ 仅在表前句、表行无 Δ 列，且措辞与落形不符：:169「**本轮 Δ = `browser.md` 1 行删除 · ±0 行**」vs 表 1 第 4 行落形（:56）= 该行改写为 `CLI, VS Code and desktop share this description verbatim.`（行保留、仅括注删）——「1 行删除」可读作删整行 | 改为「`:48` 原行改写 · ±0 行」，并把该 Δ 落进表行（或表头明标「其余 51 档 Δ = 0」为表级默认） |
| 5 | Doc-state（记录面） | 🔵 | §1 同事实两读并存：:9 仍保留已被收正的派单读数「…派 `eng-coder`（携凭证）落两域真引用 3 + 待裁 3」（同段「M1–M5」），:11 逐条声明「均已随 `#135` 点改收正」并给正确读数——对照可解，只读 :9 者仍见失效派单口径 | 记录面可留（:11 已标收正）；若要免歧义，把 :9 派单句改为以 :11 为准的坐标式指称 |
| 6 | Doc hygiene | 🔵 | §2 状态行（:14）载过程沿革子句「点改轮 7 条（评审 advisor#130 发现）已落」——状态行属规范面、沿革归记录面；本轮 7 条确已全落，故非失效残留，仅归属观测 | 状态行收敛为本轮设计态（落笔目标 / 裁留 / 豁免面 / 零落笔），沿革留在记录面段落 |

**计数**：🔴 0 · 🟡 1 · 🔵 5（无 🔴 ⇒ 放行；🟡/🔵 不阻断）。

VERDICT: pass

## §4 用户批准（主 agent）

**用户批准（依据 = 用户原话授权）**：依据 = 用户 2026-10-16 **10:52「都点火，自动跑完」**（授权本批全链自动跑）+ **11:11「这些都处理吧」**；**批准对象** = 本批设计（`docs/batches/2026-10-16-p3-en-face-ref-cleanup.md` §2 表 1「本批落笔目标（4 处 · 裁 = 删）」+ 判据 M1–M6）。**评审状态**：设计评审**两轮**——轮 1 `advisor#130`（🔴 0 · 🟡 4 · 🔵 3）⇒ 7 条全受理并点改落毕；轮 2 `advisor#140`（🔴 0 · 🟡 1 · 🔵 5）⇒ **pass**。**落笔**：设计轮**零落笔**（在盘改动集 = 4 档 · 各 1 行原位改写），实施由 `eng-coder` 携凭证执行。**凭证按机械剥离规则不入档**（评审通过 = 「评审通过」，无值、无占位）。

## §5 实施记录（eng-coder）

### §5 实施记录（eng-coder · 2026-10-16）

**来源** = 本批档 §2 表 1「本批落笔目标（4 处 · 裁 = 删）」（经两轮设计评审 pass · §3）。**执行人 = eng-coder**（携设计凭证）。**落形** = 逐字照 §2 表 1「删后句」原位改写（删引用、不换址、句义保留）。

**逐处（改前 → 改后 · 逐字）**

| # | 档:行 | 改前引文 | 改后句（在盘逐字） |
|---|---|---|---|
| 1 | `prompts/discipline-engineering.md:197` | `(Parallel-delegation token isolation / scheduling metadata / submit-and-go = main-agent role behavior — see persona-engineering.)` | `(Parallel-delegation token isolation / scheduling metadata / submit-and-go = main-agent role behavior.)` |
| 2 | `prompts/persona-engineering.md:199` | `General parallel rules (stages run in parallel — parallelize aggressively) — see discipline-engineering.` | `General parallel rules (stages run in parallel — parallelize aggressively).` |
| 3 | `prompts/persona-coder.md:8` | 句尾括注 `(Evidence discipline / task boundary / delivery table: see the same-named sections in the shared layer — already injected.)` | 句尾括注改为 `(Evidence discipline / task boundary / delivery table: already injected with this assembly.)`（该行其余逐字不动） |
| 4 | `tool-docs/browser.md:48` | ``CLI, VS Code and desktop share this description verbatim (single source: core `tool-docs/`).`` | `CLI, VS Code and desktop share this description verbatim.` |

**读数（落笔后实跑 · 自核）**

- M2（`see persona-engineering` ∥ `see discipline-engineering` ∥ `same-named sections in the shared layer`；跑 `thincoder-core/` 全树）= **0 行**（落笔前 3 行）。
- M6（`single source: core`；跑 `thincoder-core/` 全树）= **0 行**（落笔前 1 行）。
- M3（`→ see` ∥ `see the ….md` ∥ `refer to ….md`；`tool-docs/`）= **0 行**。
- M1（常驻锁 `node scripts/prompt-refs-check.mjs`）= `汇总：提示词面 84 档 · 代码面 451 档 · 命中 0` + `OK(prompt-refs): J1/J2/J3 三式零命中`（exit 0）。
- 行数 ±0：`198 / 217 / 21 / 49`（= 设计基线，原位替换、零结构变动）。
- `git status --porcelain` scoped（workdir = `thincoder`）= 恰 4 档 M（`prompts/discipline-engineering.md` · `prompts/persona-engineering.md` · `prompts/persona-coder.md` · `tool-docs/browser.md`），无其余改动。

**审计与代码评审轮次与终态**

- 发散审计（`explore` · 只读 · 只读一队）= **CLEAN**——对照 §2 表 1 四行 + AC ①–⑤：PARTIAL / SILENT-SIMPLIFICATION / DOC-DRIFT / OUT-OF-LIST **四类偏差均无**；四档内余项全为设计明列豁免形态。
- 独立代码评审（`advisor` · type=code · 对象 = 四档）= **pass**——🔴 0 · 🟡 0 · 🔵 1（记录面：§5/§6 落笔前为空标题，属收口轮父侧填写，非代码缺陷、不阻断）。**fix round = 0**（无 🔴/🟡）。**终态 = clean**。

## §6 验证与收口（父代理）

**复核与收口（主 agent · 2026-10-16）**

**验收读数（父侧收编 · 依据 = `#143` 实施轮自跑 + 本席抽查）**：**落笔 4 处原位改写**（逐字照 §2 表 1「改后句」）——`prompts/discipline-engineering.md:197` ∥ `prompts/persona-engineering.md:199` ∥ `prompts/persona-coder.md:8` ∥ `tool-docs/browser.md:48`；**判据读数**：**M2 = 0 行**（落笔前 3）· **M6 = 0 行**（落笔前 1）· **M3 = 0 行** · **M1 常驻锁 = `提示词面 84 档 · 代码面 451 档 · 命中 0` + `OK : J1/J2/J3 三式零命中`（exit 0）** · **行数 ±0**（198 / 217 / 21 / 49）· **零旁触**（scoped `git status --porcelain` = 恰这 4 档 M）。

**实施面**：`eng-coder#143`（携设计凭证）——**子内已跑**：发散审计 = CLEAN · 独立代码评审 = **pass（🔴 0 · 🟡 0 · 🔵 1）** · fix round = 0 · §5 已写入（2252 字符）。**本批无可跑测试面**（改动 = 运行期文本逐行替换；验准 = 上述两条 grep + 常驻锁）。

**设计评审**：两轮（轮 1 🔴 0 · 🟡 4 · 🔵 3；轮 2 🔴 0 · 🟡 1 · 🔵 5）——**🔴 全程 0**，两轮 pass。

**遗留（已入册 · 非阻断）**：**轮 2 的 1 🟡 + 5 🔵 记录面收正未修**（含 `§2` 类⑨ 全坐标补 `persona-engineering.md:153`、F1 枚举补「出处句形」、`#3/③` 悬空指称、`:169`「1 行删除」措辞、§1 双读、§2 状态行沿革子句）⇒ 已入台账一条（归批）；**本批主体（设计 + 实施 + 验收）已闭合**。

**收口同步（D7）**：§1 · §2 状态行 → **已收口** ｜ 台账条目核销（父侧续办）｜ **设计凭证已按链终消费**（值不入档）。

**批准依据**：用户 2026-10-16 **10:52「都点火，自动跑完」** + **11:11「这些都处理吧」**。

**批外注记（`#143` 上抛 · 不判级）**：`.thincoder/tmp/lc818-baseline/` 下旧指路句快照仍在（**临时区、不在常驻锁域内，非缺陷**）——仅提示：若今后把 `.thincoder/tmp/**` 纳入扫描域，这两处会成**假红源**。
