# 2026-11-09 · cross-repo-write
> 六段，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 每段只有一个作者：作者的段可 `append` 加内容、可就地改（`edit`）；非作者一概拒。
> 编制：主 agent · 2026-11-09 · 来源 = 来源 = 外部项目（v2-vibe-coding）issue《需要能写指定的外部项目目录》+ 用户 2026-11-09 17:04「在各仓的 manifest 加一个可以写的外部项目配置，对那边的更改就可以在本仓记账」∥ 17:05「不存在偷偷改，偷偷改的限制我们会在 git 的权限上控制，能提交就是允许他改」∥ 17:07 键名定 `writableRepos` ∥ 17:10「记得提示词和工具面一起改」。
> 台账 = #2238（core · 归批）。前情 = 无（独立批）。
## §1 讨论（主 agent）
**状态行**：已收口 2026-11-09
<§1 模板占位：本批条目 / 关键判据 / 授权口径>

### 已定决定

- **已定决定**：写权**单向声明**——发起方在自家 manifest 声明可写哪些外部仓，目标仓不参与授权 · 用户原话：「不存在偷偷改，偷偷改的限制我们会在 git 的权限上控制，能提交就是允许他改。」 · 时间：2026-11-09 17:05
- **已定决定**：记账归属 = **写方**——跨仓写入记在写方批档与台账行，目标仓账上不留 · 用户原话：「在各仓的manifest加一个可以写的外部项目配置，对那边的更改就可以在本仓记账。」 · 时间：2026-11-09 17:04
- **已定决定**：键名 = `index.writableRepos`（与 `publicRepos` 成对：一个读名单、一个写名单） · 用户原话：「这个键的名字含义不是很清晰，最好重新取一个，逻辑我基本同意。」→ 候选表后「可以」 · 时间：2026-11-09 17:07
- **已定决定**：**写面不建依赖图、不做环检测**——`publicRepos` 是依赖边，`writableRepos` 是授权表，A↔B 互写不产生歧义 · 依据：父侧提案经用户「可以」采认 · 时间：2026-11-09 17:07
- **已定决定**：**提示词与工具面同轮改**（D11） · 用户原话：「记得提示词和工具面一起改。」 · 时间：2026-11-09 17:10

### 研究（批前）

- **库内 = 已查**：`写入门 台账行 要号 项目根 声明面 manifest 键` → 落点为设计 `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` §2.3（笔-账绑定，含「号须是**声明项目**台账里 `在途` 的行」逐字）与需求 `docs/core/requirements/ENGINEERING-MODE-V2.md` §13.8 ⑥；键面单源 = 设计 `docs/core/design/MANIFEST.md` §2.2。
- **库内 = 已查**：`笔-账绑定|笔账绑定|写锁|要号` → 命中 `docs/core/requirements/ENGINEERING-MODE-V2.md` 的 D11 与 §13.8 ⑥ 两处；未命中任何既有跨仓写权条目 ⇒ 无既有需求覆盖本批。
- **库外 = B 类**：改动面 = `thincoder-core/agent/write-gate-ledger.mjs` ∥ `thincoder-core/manifest-schema.mjs` ∥ `thincoder-core/declaration.mjs` ∥ 工具描述与提示词；外部断言 = 零（不依赖任何外部系统的行为声明）。

## §2 批次任务与设计（eng-designer）
**状态行**：设计完成


### 2.1 本批条目（覆盖 R1–R7）

| # | 条目 | 验收 | 设计节 |
|---|---|---|---|
| R1 | 声明面 `index.writableRepos` 落 schema：键位 / 默认 `[]` / 数组层 fail-closed / 元素层宽容 / 归一复用 `normalizePathList` | AC-1 | `docs/core/design/CROSS-REPO-WRITE.md` §2.1 ∥ `docs/core/design/MANIFEST.md` §2.2 同名条 |
| R2 | 解析层 `declaredWritableRoots(cwd)`：基数 = 项目根、逐项 `resolve`、去重保序；缺省 ⇒ `[]` | AC-2 | 同档 §2.1「解析层」条 |
| R3 | 写门判据点源的选择：`index.writableRepos` 含该目标 ⇒ 号在**声明项目**账上判、放行 | AC-3 | 同档 §2.2 判序 ① |
| R4 | 未声明照拒（新拒文逐字，只在 `no such row` 那一格）+ 目标仓台账零写 | AC-4 | 同档 §2.2 拒文块 ∥ §2.3 |
| R5 | 零回归：未声明 / 缺键档的既有九面逐条等值（号四情形 ∥ 声明支 ∥ 工作区窄口 ∥ `init` 豁免） | AC-5 | 同档 §2.2 判序 ②③④⑤ |
| R6 | 提示词面与工具面**同批**落（键目录 + 节点计数 ∥ 台账节第 ⑥ 条 ∥ 语料第 7 条两分 + 同节第 6 条例外指针） | AC-6 | 同档 §2.5 表 |
| R7 | 外部仓面判**复核、零改**：目标按**目标仓自己的** `docRoot` 判面，门禁与本地逐条相同——`faceDetail` 本体零改、两个调用方本来不传 `manifest` | AC-7 | 同档 §2.4 三行面表 ∥ KD-X6 |

**不在本批**：回填存量档（无）；`publicRepos` 读面语义（零改）；面判本体与设计门判据（R7 只复核、零改；不加第三个面值）；本仓 `PROJECT-MANIFEST.json` 的实际声明（主 agent 另步）。

### 2.2 设计档落点

- **新档（机制单源）= `docs/core/design/CROSS-REPO-WRITE.md`**：声明面语义 · 写门判据点源的选择 · 新拒文逐字 · 记账归属 · 提示词 / 工具面落点 · 决策 · 验收 · 用例 · 边界 · RTM delta。
- **键面（键的单源）= `docs/core/design/MANIFEST.md` §2.2**：`index.writableRepos` 条（值形 / 归一 / 校验 / 用途 / 与 `publicRepos` 不互派 / 解析层 / 指向机制档）。
- **写门（判据单源）= `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` §2.3**：判据点来源新增一条指针（「跨仓目标 ⇒ 判据点可由写方声明表给出」），号四情形与声明面判据零改。
- 三处关系 = D2 分工：键的形在一处、门的判据在另一处，本机制**只在机制档写全**，另两处只指不述。

### 2.3 机制设计（一句 + 指针）

一个目标落在写方 `index.writableRepos` 的某个声明根内（**前缀包含**，比较键 = `gateKey`）⇒ 写门把判据点换成**声明的写方项目**，号在写方台账里判 `在途`；目标仓不参与授权、其账零写。判序、拒文逐字、复现路径 = 机制档 §2.2（本段不复述，D2）。

### 2.4 受影响文件与测试覆盖

见机制档 §3（十条，含 tier 结论 = **无 tier 跨界**）。测试面两层：

- 本批单测档 = `docs/batches/2026-11-09-cross-repo-write.test.mjs`（与批档同名同目录，随收口删除）；跑法 `node --test docs/batches/2026-11-09-cross-repo-write.test.mjs`。
- 集成面 = 故事 12 新增 `12-17`，落 `test/integration/batch-live-batch-lock.test.mjs`（RTM delta 逐条 = 机制档 §9）。

### 2.5 关键决策（全表 = 机制档 §4 KD-X1–KD-X7）

摘要三处最易被推翻的：键位 = `index` 第八子键（KD-X1）· 判据点 = 写方声明而非目标仓反向许可（KD-X2）· 「差一条声明」独立成一句拒文且只在 `no such row` 那一格（KD-X5，复现路径在 §2.2）。

### 2.6 上抛项

1. **需求层缺一条**（主 agent 处置，不阻塞本批）：`docs/core/requirements/ENGINEERING-MODE-V2.md` §13.8 ⑥ 的句面「号须是**声明项目**台账里 `在途` 的行」在本机制下**仍然成立**（声明项目 = 写方，无需改）；但 `index.writableRepos` 这个**声明面**在需求档没有任何条目 ⇒ 三链同源少一环（批档 §2 ↔ 设计 AC ↔ 需求档）。建议主 agent 在需求档补一条，键面与判据指向本机制档。
2. **键名与语义的张力**（用户裁）：用户 17:07 定名 `writableRepos`，而机制里项是**目录**（不做仓库识别）。按定的名不擅改；键目录描述里写明「目录」。若用户要改名，改的是键名，不是机制。
3. **面判 / 设计门零改的代价**（KD-X6，请评审注意）：在外部仓改一份**文档**也要活设计槽。备选被拒的理由在机制档 §2.4——若用户认为代价过大，改的是那一条决策，不是本机制的判据点。
4. **实施席需实读一处**：spawn `files` 域（token 门）对**项目外路径**的判法，本轮未实读（`unverified`）。若它按项目根拒项外路径，跨仓写入要由主 agent 直写或同批补一处判据——实施席须先读再落，并按 §5 上报。

### 2.7 读数（本轮实测 · 命令与数都留在此处，设计档只留关系）

量法 = `node` 行扫（D15 一把尺）；命令形状 = 逐档 `split(/\r?\n/)` 后按正则过滤计数。

| 量 | 正则 | 读数 |
|---|---|---|
| `test/rtm/guard.md` 故事 12 用例行 | `^\|\s*12-\w+\s*\|` | 15（`12-1`…`12-10`、`12-12`…`12-16`；`12-11` 已删） |
| `test/rtm/*.md` 各档用例行 | `^\|\s*\d+-\w+\s*\|` | guard 45 · batch-ledger 40 · tooling 27 · loop 24 · paths 11 · ends 6 |
| `thincoder-core/tool-docs/manifest.md` 节点计数句 | 实读第 20 行 | `16 writable nodes`（3 whole keys + docRoot's 6 + index's 7） |
| `thincoder-core/prompts/discipline-engineering.md` 第 7 条 | 实读第 273 行 | `**Out-of-repo changes = stop and report**` |

本批 delta 之后的目标读数：故事 12 用例行 16（+`12-17`）、节点计数 17（index 8 子键）——由实施轮落盘后复量。

### 2.8 评审轮次 1 处置（用户收窄范围后落地）

- **范围裁定**：评审 12 条只落五条 + tier 核法一句；其余七条 🟡/🔵 不动（用户 2026-11-09 令「其余七条不动」「别的别扩」）。用户同时裁定：本机制就是「声明了就能写、记我这本账」，「写权」与「面分类」分两层是多的。
- **① 两分口径**：`docs/core/design/MANIFEST.md` §2.2 的 `index.writableRepos` 条判据句改为「用本仓的账写外部目标 ⇒ 表内的才放行；不声明就只能用目标仓自己的台账号写它」，与需求 `docs/core/requirements/ENGINEERING-MODE-V2-SPEC-CROSS-REPO-WRITE.md` ②.3 同口径。
- **① 保留项**：`docs/core/design/CROSS-REPO-WRITE.md` §2.2「目标在外部而本笔没声明写方 ⇒ ②/③/⑤」原句保留，并补一句「后一半就是两分口径」——用户裁定它不是后门、是另一件事，故不堵、也不写成待裁。
- **② 判序 ① 补 `W` 三条件**：`W = project 非空 ∧ resolveDeclaredRoot(project, cwd) 成立`（在盘 ∥ 是项目 ∥ 与会话锚相关）；不成立落既有串——目标有根 ⇒ ② 现行，目标无根 ⇒ §2.3.1 拒文表 ①②③ 那句。三条全是既有件，未新写判据。
- **③ 行号指针改节名 / 引句**：`§2.5` 两处 + `§1` 勘察 ④⑤ 共三处指针（`第 20 行` ∥ `第 12 行` ∥ `第 273 行`）改为节名与所引原句；全文按 `第 N 行` 复扫，零残留。
- **④ 受影响文件表补两行**：`docs/core/design/MANIFEST.md` ∥ `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md`，标本批已落（后者 §2.3 的跨仓指针已在盘，实读确认）。
- **⑤ 验收新增两条**：AC-8（读 ≠ 写）∥ AC-9（不推导），回指需求档 AC-4 ∥ AC-5。不传递（需求 AC-3）不造夹具，由「门只读 `W` 的 manifest」一句给出。
- **tier 核法**：`doc_check` 的 `lines` 读数对 §3 表内每个 source ∥ test 档各量一次；软线 500 ∥ 触发线 650 沿用既有口径。
- **实测**：`doc_check` gate 两档 PASS（`docs/core/design/CROSS-REPO-WRITE.md` ∥ `docs/core/design/MANIFEST.md`）。未动代码、未动需求档、未动用例档，未发评审（用户令）。

### 2.9 评审轮次 2 处置（八条逐条；本例改设计面两档，未动代码 / 需求档 / 用例档，未发评审）

范围裁定（用户本轮回话）：🔴 一条由主 agent 在需求档同轮改定（本席不动需求档）；本席只落四条指令项 + 一条措辞项；🔵 两条按「不改」结。

- **①（🔴，需求 ↔ 设计互斥）** 处置 = 需求面已由主 agent 同轮改定：`docs/core/requirements/ENGINEERING-MODE-V2-SPEC-CROSS-REPO-WRITE.md` ②.2 第三支现为四支条件形（`R` = 本仓根 ⇒ 不变 ∥ **用本仓的账**写外部目标且 `R` 在表内 ⇒ 号查本仓账 ∥ **用本仓的账**写且不在表内 ⇒ 拒 ∥ 改用**目标仓自己**的在途号 ⇒ 走现行路），AC-2 ∥ AC-4 ∥ AC-5 断言各带「**用本仓的账**」且方式列 = 本仓在途号 + `project:<本仓根>`。设计面零改即同口径：`docs/core/design/CROSS-REPO-WRITE.md` §2.2「不覆盖的两形各有出路」原句保留（§2.8 ① 的保留项），`docs/core/design/MANIFEST.md` §2.2 的 `index.writableRepos` 条判据句 = 两分口径。互斥消在需求侧，设计侧无一字为新裁。
- **②（🟡）`§6 T2` 缺参数 + `§2.2` 的 `W` 前置未写** — 改两处：`docs/core/design/CROSS-REPO-WRITE.md` §6 的 T2 行输入补 `· project:<本仓根>`（与 T1 同形）；同档 §2.2 判序块之后新增一条「**声明了目标 ≠ 给出了写方**」——表内含目标只是必要条件，① 还要本笔用 `project` 显式点名写方，不传 ⇒ `W` 无 ⇒ `tbl = []`、声明表不参与判（目标有根落 ②，无根落 ④ 窄口），并点出 T2 ∥ T6 的输入都带 `project`。
- **③（🟡）`§5 AC-8` 夹具未写仓库条件** — 改：同档 §5 的 AC-8 夹具写明 `../other` **带** `PROJECT-MANIFEST.json`（与 AC-9 的 B 同款），并把理由写进格子（新串的出现条件要求 `R` 有）。
- **④（🟡）`§2.2` 三条不成立只给一对串** — 改：同档 §2.2 那条改为三支逐支落句（`§2.3.1` 拒文表 ① ∥ ② ∥ ③ 各落哪支），并**照承认措辞代价**——③ 支（在盘、带 manifest、却在锚外）确实是一个项目，句头 `declared project is not a project` 名不副实，准确的那半是括注 `(no PROJECT-MANIFEST.json at this path or within the session anchor)`；本批不改这句既有拒文（改它属另一件事），代价记在档里，实施席与读拒文的人不必再猜。
- **⑤（🟡）`docs/core/design/MANIFEST.md` §2.2 元素层枚举漏键** — 改：同档 §2.2「形态判据…两层分列」的元素层宽容枚举补 `index.writableRepos`（连读 = `index.excludePaths` / `index.docCheckExcludePaths` / `index.publicRepos` / `index.writableRepos`），与同档键条的「数组层 fail-closed ∥ 元素层宽容」及 AC-1 的 `writableRepos:"x" ⇒ ok:false` 对齐。
- **⑥（🔵）`§2.3` 与 `§2.4` 对 `R` 的 manifest 读法措辞相冲** — 改：同档 §2.3 该条改为「门只读 `W` 的 manifest 与 `W` 的账——`R` 的 manifest 在授权面上不被读；它另在两处被用到——归属判定（`resolveProjectRoot(p)`，只判存在性、不解内容）与面判（§2.4 的 `faceDetail` 按目标项目根读一次）。两处都不参与授权、不被写」。
- **⑦（🔵）tier 软线 500 / 触发线 650 口径** — 按用户本轮令**不改**：tier 结论按声明接受，`docs/core/design/CROSS-REPO-WRITE.md` §3 的核法句维持原样，读数住本段 §2.7，不入设计档。
- **⑧（🔵）需求 AC-3（不传递）无对应用例** — 维持 `docs/core/design/CROSS-REPO-WRITE.md` §5 末句的理由（门只读 `W` 的 manifest ⇒ 读不到 B 声明里的 C），不加维度、不加用例。

**本段实测量（D15 一把尺）**：改后跑 `doc_check(mode:"gate")`，范围 = `docs/core/design/CROSS-REPO-WRITE.md` ∥ `docs/core/design/MANIFEST.md` ∥ 本批档三档，首行读数 = `DOC-CHECK GATE: PASS`，0 段命中。命令与逐段读数在该次调用输出里，本段只记关系与结论。

### 2.10 评审轮次 3 新项处置（父侧同步 · 只动 `docs/core/design/MANIFEST.md`）

范围 = 用户 2026-11-09 令：只把 `docs/core/design/MANIFEST.md` 的键面计数与键目录同步到 17 节点 / `index.*` 八子键；不动代码、不动需求档、不动 `docs/core/design/CROSS-REPO-WRITE.md`（评审已过），不发评审。动因 = 评审轮次 3 第 11 条：工具描述的实施轮要按 17 落，而本档 §2.10 / §2.11 数 16 ⇒ 一份正确的工具描述会被 AC-K2 / AC-K3 判红。

| 评审# | 处置 | 改动（文件 + 逐词） |
|---|---|---|
| 11-a | 已修 | `docs/core/design/MANIFEST.md` §2.10 键目录领句「全 **16** 可写节点」→「全 **17** 可写节点」 |
| 11-b | 已修 | 同档 §2.10 键目录表 `index.*` 族末新增 `writableRepos` 行：可写外部**目录**表（目录不是仓；从本仓根可解析）= 本仓的写权声明，单向；要用**本仓的账**去改外部目录时才动（不声明就只能用目标仓自己的台账号写它）；写错 ⇒ 该目录写门照拒（拒文点名 `writableRepos` 与目标），或把不该给写权的目录放进表（真防线 = git 权限） |
| 11-c | 已修 | 同档 AC-K2「载**全部 16 可写节点**」→ 17；「文本键名覆盖 = 16」→ 17 |
| 11-d | 已修 | 同档 §2.11「`manifest` 工具写面白名单 = **16 个可写节点** … `index.*` 七子键」→「**17 个可写节点** … `index.*` 八子键」；同节 `DEFAULT_MANIFEST` 枚举 `index:{…,docCheckExts:[]}` → 补 `,writableRepos:[]` |

**同一把数的传播（用户令四条之外，本席一并落——一个计数在一档里只能是同一个值，D3 / D11）**：同档 §2.10「为什么这样分」句（16→17、七子键→八子键）∥ 算术闭合行（`16 节点 × ~115 ≈ 1,840` → `17 节点 × ~115 ≈ 1,955`）∥ 载荷预算行（16→17）∥ AC-K3（`16 键名行扫` → 17）∥ KD-M1-42 理由（16→17）∥ KD-M1-45 理由（16→17）。六处若留 16，则本档领句 17、预算与决策表 16，自相矛盾。

**未动**：评审轮次 3 的 #9（判序守卫措辞）∥ #10（`R` 与目标路径 `p` 单位不同）——两条 🔵、不阻断，不在本轮令内；`docs/core/design/CROSS-REPO-WRITE.md` 一字未动。

**本段实测**：`doc_check(mode:"gate")`，范围 = `docs/core/design/MANIFEST.md` ∥ 本批档，首行 = `DOC-CHECK GATE: PASS`。命令与逐条读数在该次调用输出里，本段只记关系与结论。

### 2.11 实施上抛四条处置（用户逐条裁定后落地）

范围 = 用户 2026-11-09 令的四条（①AC-7 两处硬错 · ②T12 夹具 · ③提示词第 6 条 · ④`BATCH-LEDGER-REVIEW-UNIFY.md` 的改前口径两句）+ 三条裁决入册。只动设计面两档；未动代码、未动需求档、未动用例档；未发评审（用户令）。

| # | 处置 | 改动（文件 + 逐词） |
|---|---|---|
| ①-a | 已改 | `docs/core/design/CROSS-REPO-WRITE.md` §5 的 AC-7：删掉「判文档面：无活设计槽 ⇒ 拒」；改为文档面 ⇒ `reason` = `doc-root`、**设计门不问**、写门仍按 §2.2 判序 ① 判本仓号（带号则放行）；产品面 ⇒ 设计门按产品面拦：无活设计槽 ⇒ 拒、带槽 ⇒ 过 |
| ①-b | 已改（选「补 R7」） | 同档 AC-7 标题改为「R7 外部仓面判与本地等同（复核、零改）」；本段 §2.1 新增 R7 行（交付物 = §2.4 三行面表 · KD-X6 · 三条面值落定；代码交付 = 零——`faceDetail` 本体零改、两个调用方本来不传 `manifest`）；领句「覆盖 R1–R6」→「R1–R7」；「不在本批」的面判句改为「面判本体与设计门判据（R7 只复核、零改；不加第三个面值）」 |
| ①-c | 同句另四处一并改（①-a 之外） | 同档 §2.2「表内 ≠ 免门」· §2.4 面表文档面那一行 · §2.4「代价照写」条 · §6 的 T10：同一句「文档面 ⇒ 文档门照跑、设计槽照要」改为「设计门不问（本地亦然），写门照判号」。这条错在同一档里有五处说法（含 ①-a 那一处），只改一处就是五处自相矛盾（D11） |
| ② | 已改 | 同档 §6 的 T12：输入改「外部仓 manifest 是坏 JSON（`readManifest` 判 `invalid`）」，预期改 `reason` = `product`；格内补「原形造不出来」及依据（`fillDefaults` 从 `DEFAULT_MANIFEST` 起补，缺的 `docRoot` 子键被默认值补回）。同档 §2.4「风险与处置」条的同一前提一并收正（有 manifest 但不可用 ⇒ 根集空 ⇒ 产品面；缺子键的档由默认值补齐、仍是文档面） |
| ③ | 已入设计面，未动提示词 | 同档 §2.5 增一行：`thincoder-core/prompts/discipline-engineering.md` 第 6 条条末补指针「（表内目标见第 7 条——那是本条的唯一例外）」，第 6 条其余字面零改。落地归产品面（提示词 = 产品码，本席不写） |
| ④ | 已改 | `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` §2.3 三处（定位参数优先 · `project` 何时被读 · `project` 加在被读的工具上）+ §7 一处，各补「例外一处 = 跨仓表内目标」：表内命中即读 `project`（判序 ①，单源指回机制档 §2.2），定位参数仍定字节落哪，两处不并生 |
| tier | 按裁改档 | 同档 §3 核法句：「软线 500 ∥ 触发线 650 … 按该档既定拆单方案处置」→「软线 500 ∥ 硬线 800，越软线 ⇒ 接受并在批档记一笔，越硬线 ⇒ 先拆再落」——原句指向的方案不在盘上（死指针），按用户裁撤掉 |
| `files` 域 | 不改 | 实施席实读 `subagent-spawn.mjs` 确认它「不是授权边界」；既有事实，档面无需改 |
| AC-3 不传递 | 不改 | 维持同档 §5 末句理由（门只读 `W` 的 manifest，读不到 B 声明里的 C），不加维度、不加用例 |

**未动（范围外）**：评审轮次 1 的第 7 条（需求 ③ 末条「写进已知限界」仍未落同档 §7）· 轮次 3 的第 9、10 条（两条 🔵）——按用户此前「其余七条不动」与本轮令，不在处置面。

**上抛（需求面，主 agent 处置，不阻塞）**：R7 在 `docs/core/requirements/ENGINEERING-MODE-V2-SPEC-CROSS-REPO-WRITE.md` 没有对应条目（该档 ④ 只有 AC-1–AC-6，无面判一条）⇒ 三链在这一格少一环。按用户「你选一个」选了补 R7，它的交付物是复核而非机制；建议需求档补一条「跨仓目标的面按目标仓自己的 `docRoot` 判，门禁与本地逐条相同」。

**出清单改动一处（理由随文）**：

- 档 = `docs/core/design/MANIFEST.md`；三处夹具 / 边界句里的 `METHODOLOGY.md` 路径由 requirements 层改指 standards 层（盘上只有一份，在 standards 层）。
- 前两处（「半读：多份声明部分不可读」的复现行 · 「T87 正常：声明且可读」的夹具）要的正是**在盘**路径；第三处（「不探测任何固定档名」的举例）写在标准层才名实相符。
- 改因 = 本段把该档纳入交付门范围后，锚判报 `档缺` 三处（那三行指的标准档不在盘）。该档不在本批清单内，故记于此。

**本段实测**：`doc_check(mode:"gate")`，范围 = `docs/core/design/CROSS-REPO-WRITE.md` ∥ `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` ∥ `docs/core/design/MANIFEST.md` ∥ 本批档 4 档，首行 = `DOC-CHECK GATE: PASS`，0 段命中。

### 2.12 目录行同步 + 一处陈旧引文（令内一行 · 门检出一行）

范围 = 用户本轮令：把 `docs/core/design/PROMPT-SYSTEM.md`「discipline · Docs & ledger repo-self-contained」目录行的第 7 条题面同步为本批落地的题面；条数与其余目录行零动；不发评审。

第二行不在该令内，是交付门逼出来的：首次跑门读作 `REFUSED（锚 1 条）`，命中一处**先于本批在盘**的陈旧引文。按「门命中当轮修」修之，逐词列表内。

| 处置 | 改动（文件 + 逐词） |
|---|---|
| 已改 · 令内 | 同档该目录行第 7 条：`Out-of-repo changes = stop and report` → 提示词第 7 条现题面逐字（该题面自带反引号，故这一条不带外层 code span）。其余 13 条与原计数列 `14` 逐字未动 |
| 已改 · 门检出 | 同档「十二份工具描述都讲同一件事」那一组的 `manifest` 档引文：原引 `thincoder-core/tool-docs/manifest.md` 里已不存在的一句，换成该档现值逐字（见下方围栏）。只换引文，该条断言（manifest 档按 action 另写收尾句）不变 |

```text
Engineering mode: required for `write`; for `init` only when the target sits inside an existing project. `read` needs none.
```

**本段实测（命令 + 结果，读数只住本段）**：

```text
node 行扫（两档各 split(/\r?\n/)；取提示词第 7 条的粗体题面与目录行第 7 条条目，判 includes）
  改后  → 判等 true；目录行条目 14 = 计数列 14 = 提示词该节编号 1–14 共 14 条
  失效侧（git show HEAD 的同档做同一比对）→ 判等 false；该条目读作 `Out-of-repo changes = stop and report`
陈旧引文（同一次 node 读）：原引句在 worktree ∥ HEAD 的 tool-docs/manifest.md 各 false ⇒ 先于本批在盘；替换句在 worktree = true
doc_check(mode:"gate", docs = PROMPT-SYSTEM.md)：修前 REFUSED（锚 1 条 = 上述引文）→ 修后 PASS，0 段命中
```

**未动**：提示词档（产品面，归实施轮，本批已落）· `docs/core/design/CROSS-REPO-WRITE.md`（本批机制档，评审已过）· 需求档 · 台账。

**同族扫描**：`docs/core/design/PROMPT-SYSTEM.md` 全文实扫 `Out-of-repo` ∥ `writableRepos` ∥ `repo-self-contained` ⇒ 该旧题只此一处，无第二处待同步。

### 2.13 评审轮次 4 新项处置（用户九条裁定后落地）

范围 = 用户 2026-11-09 令：七条改档 + 两条记理由；不动代码、不动需求档、不动提示词（产品面）、不动 `docs/core/design/MANIFEST.md`；未发评审。改动面 = `docs/core/design/CROSS-REPO-WRITE.md` ∥ `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` 两档。

| 评审# | 处置 | 改动（文件 + 逐词） |
|---|---|---|
| 1 | 已改 | `docs/core/design/CROSS-REPO-WRITE.md` §3 的 `discipline-engineering.md` 行 → 「§2.5 的两行都落：第 7 条改写 + 同节第 6 条条末例外指针（盘上两笔均已落）」 |
| 2 | 已改 | 同档 §3：删「`thincoder-core/agent/write-face.mjs` 的调用面（写锁 ∥ 设计门取 `faceDetail` 处）」整行；原「实施前须实读两处」整块换成「取面入口的实读坐标（两条，均本批零改）」+「实施前须实读一处」——两处坐标 = `thincoder-core/tools/doc-write-gate.mjs` 的 `import { faceDetail }` 与 `thincoder-core/agent/dispatch.mjs` 的 `import { faceOf }`，两处都不传 `manifest`、本批一字未动（引文放进围栏块，否则被锚判读成档指针） |
| 3 | 已改 | 同档 §2.4「风险与处置」∥ AC-7 ③ ∥ T11 ∥ T12：删「回执点名」，四处一律改成单测缝上断言 `faceDetail(<目标>).reason` 取值；并写明不新增回执的依据（设计门非 `product` 即 `continue`；`doc-write-gate.mjs` 非 `doc-root` 即 `judged:false`） |
| 4 | 已改 | `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` §2.3 态表一格：「有活设计槽 · 写产品面 · 号在途」⇒ 设计门「放行（资格判据 = 任一活槽存在 ⇒ 门不问设计做没做）」· 本锁放行 · 结果「写入」。机制与其余各格零改 |
| 5 | 已改 | 同档 §2.3 写盘七件那一行 + §2.3.1 判序各加「**例外一处 = 跨仓表内目标**」（前者指本节「例外一处」条，后者给出判序 ① 的指针与单源） |
| 6 | 已改 | `docs/core/design/CROSS-REPO-WRITE.md` §5 新增「**承接行 = AC-9 的拒格**（另一半由 AC-8 的拒格承接：读名单不授权写）」+ 等价理由（门读 manifest 的入口只有 `W` 一处 ⇒ 「B 声明了 C」与「B 什么也没声明」在门前不可区分）；原「不造夹具」理由保留，未建用例 |
| 7 | 已改 · 越线一处 | 同档 §3 tier 段：新增「尺寸越线一处（点名 + 处置）」= 集成用例档（本批 `12-17` 推过去的）+ 处置（接受并记一笔、不拆档）+ 一句「在表 `.md` 档只出读数、不带档位标记」；逐档读数住本段读数表 |
| 8 | 已改 | 同档 §5 的 AC 行序重排为 AC-1…AC-9（AC-6 从表末移到 AC-5 之后），各格的值零改 |
| 9 | 已记 | 同档 §5 新增「**第 3 条不加例外指针（理由）**」一条：第 3 条讲本仓文档不出仓，与第 7 条「写别人的目录、账仍记在本仓」不是同一件事；提示词一字未动 |

**一次回改（判错的理由照报）**：本席首轮把 `thincoder-core/prompts/persona-engineering.md` 也记成「越软线」，复看合计行才改回——档位标记只给源档 ∥ 单元测试档，`.md` 档只出数。故越线只有集成用例档一处；该档本席读数 513（用户给 514，两把尺不同，按本席这把记）。

**本轮实测（命令 + 结果；读数只住本段）**：

```text
doc_check(mode:"report", docs = 两档设计档, lines = §3 表的 9 个 source ∥ test 档)
  → 命中 0（锚 0 · 段太长 0 · 行号坐标 0）
  → 合计 9 档：越软线 1 · 未越线 8 · 越硬线 0
doc_check(mode:"gate", docs = 两档设计档) → 首行 DOC-CHECK GATE: PASS
```

逐档读数（同一把尺 = `doc_check` 的 `lines`）：

| 档 | 行数 | 档位 |
|---|---|---|
| `test/integration/batch-live-batch-lock.test.mjs` | 513 | 越 500 软线（唯一带标记的一档） |
| `thincoder-core/prompts/persona-engineering.md` | 509 | `.md`：只出数，无档位标记 |
| `thincoder-core/agent/write-gate-ledger.mjs` | 485 | 未越线 |
| `thincoder-core/prompts/discipline-engineering.md` | 416 | `.md`：只出数，无档位标记 |
| `thincoder-core/declaration.mjs` | 397 | 未越线 |
| `thincoder-core/conventions.mjs` | 192 | 未越线 |
| `thincoder-core/manifest-schema.mjs` | 180 | 未越线 |
| `test/rtm/guard.md` | 132 | `.md`：只出数，无档位标记 |
| `thincoder-core/tool-docs/manifest.md` | 36 | `.md`：只出数，无档位标记 |

**失效侧（该红的红过）**：首轮把两条 `import` 引文的**相对路径**写在正文里，交付门读作 `REFUSED（锚 2 条 · 1 段文字太长）`——引擎把两个相对路径当档指针、判 `档缺`；改法 = 引文入围栏块 + 长段拆两段，同轮复跑才 PASS。

**仍开着一条（不在本轮令内，报给主 agent）**：§5.6 第 5 条 —— `docs/core/design/CROSS-REPO-WRITE.md` §2.2 的拒文**理由句**（「号在本仓账上、目标项目的账里没有」）比它的可判形宽，「号在写方账上」那一半没机检。用户本轮九条未含它，故未动。

**未动**：代码 · 需求档 · 提示词 · `docs/core/design/MANIFEST.md` · 用例档 · 台账。

### 2.14 §5.6 第 5 条处置（用户本轮裁定「改，别留着」后落地）

范围 = 用户本轮令：只改拒文**理由句**；不动代码、不动需求档、不动用例档；不发评审。改动面 = `docs/core/design/CROSS-REPO-WRITE.md` 一档（两处）。

**病灶**（本席 §2.13 末条自报）：§2.2 理由句「号在本仓账上、目标项目的账里没有」比可判形宽——「号在写方账上」这半句门没机检，读者按理由句去验，验不到就是假绿。

| # | 处置 | 改动（文件 + 逐词） |
|---|---|---|
| ① | 已改 | 同档 §2.2「只在这一格的理由」整句换成「本格的判据就是上面那条合取，逐条都由门实际算，不另立概括」+ 三条逐条可判：**门在这一格算的三件**（`R` 的账读得到（`at.error` 为空）∧ 号解析成一个数字（`typeof parsed.no === "number"`）∧ 查无此行由 `R` 的账给出（`at.row === null`））· **门在这一格判不出的**（「本仓账上有这个号」——门在这一格只读 `R` 的账，`W` 的账只在 ① 支被读；号在 `W` 的账里也不存在（纯笔误）时同一句照出，两种因由在这一格不可分）· **不加这一格的代价**（`row #N does not exist in this project's ledger` 把「`R` 的账里没有这一行」读成「这个号有问题」） |
| ② | 已改（D11 同轮，同一句的第二处） | 同档 §4 的 KD-X5 理由「读它的人会去查号，而号是对的」→「…而门这一格只验过 `R` 那一本账（§2.2 那一格的三件）」——KD-X5 是同一句宽半句的另一层陈述，只改 §2.2 就是一处正确、一处仍宽 |

**删掉的那半句及其理由**：门在这一格里从不读 `W` 的账——`ledgerRowAt(root, …)` 在判序 ② 处只以 `root = R` 调入，`W` 的账只在 ① 支（`atW`）被读。跨两本账的对照不是门能做的判断，故按用户令只留门真能判的那部分，不留「大意如此」的话。

**未动 · 报给主 agent（产品面，本席不写）**：`thincoder-core/agent/write-gate-ledger.mjs` 注释面两处同款宽半句——档头那一节「号在声明项目账上、目标项目账里没有」，判序分支处「号在 `W` 的账上而目标项目 `R` 的账里没有」。两处是实施席照设计档原句落的笔，不是实施席自己写错；修法同此（删掉那一半）。复现见下方读数行。

**本段实测（命令 + 结果；读数只住本段）**：

```text
node 行扫（D15 一把尺） docs/core/design/CROSS-REPO-WRITE.md
  正则 号在本仓账上、目标项目的账里没有  改前 1（§2.2 理由句）→ 改后 0
  正则 本仓账上                        改后 1（§2.2「门在这一格判不出的」条——作为边界句保留）
node 行扫 thincoder-core/agent/write-gate-ledger.mjs
  正则 号在 → 5 命中：L22 ∥ L387 ∥ L442 = ① 支正当句；L390 ∥ L473 = 宽半句两处
doc_check(mode:"gate", docs = 设计档 ∥ 本批档) → 首行 DOC-CHECK GATE: PASS
```

**失效侧（该红的红过）**：宽半句那条正则改前在该档命中 1（§2.2 理由句逐字），改后 0——同一把尺、同一条正则，差别只在本次改动。该档是未跟踪档（`git status` 里为 `??`），无 HEAD 版可比，故失效侧读数为改前那次 `grep` 调用的输出，不另行重造。

**未动**：代码 · 需求档 · 用例档 · 台账 · `docs/core/design/MANIFEST.md` · `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md`（后者全文实扫无此宽半句的同款句）。

## §3 设计评审（评审子代理）
**状态行**：评审通过



### 轮次 1（评审子代理）

本轮评审（设计待评审）结论表。评审对象 = 跨仓写权：声明面 `index.writableRepos` ∥ 写门判据点源 ∥ 新拒文 ∥ 记账归属。范围 = `docs/core/design/CROSS-REPO-WRITE.md` ∥ `docs/core/design/MANIFEST.md` ∥ `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` ∥ `docs/core/requirements/ENGINEERING-MODE-V2-SPEC-CROSS-REPO-WRITE.md`。

| # | 严重度 | 状态 | 证据（指针） |
|---|---|---|---|
| 1 | 🔴 | 待修 | `docs/core/design/CROSS-REPO-WRITE.md` §2.2 判序第 ② 支「（现行，逐字零改）」+ 新串出现条件「② 的判号结果落在 `no such row`」⇒ 未声明的跨仓目标在号落目标仓账上时仍放行；`docs/core/requirements/ENGINEERING-MODE-V2-SPEC-CROSS-REPO-WRITE.md` ②.3「唯一入口 = `writableRepos` 逐仓具名」∥ ②.2「不在声明内 ⇒ 拒（沿用现有 case 报文形态，点名 `writableRepos` 与目标）」∥ `docs/core/design/MANIFEST.md` §2.2 `index.writableRepos` 条「不在表内 ⇒ 不出本仓（停下上报）」= 绝对拒——同一拒绝机制两处不同说法 |
| 2 | 🔴 | 待修 | 需求 AC-3 ∥ AC-4 ∥ AC-5（「去写 C ⇒ 拒（不传递）」「写仍拒（读 ≠ 写）」「写拒（不推导）」）在本档 §5 验收对照（回指批档 §2 的 R1–R7，未映射需求 AC-1–AC-6）∥ §6 用例表 ∥ §9「缺的行 = 1」三处俱无落点 |
| 3 | 🟡 | 待修 | 本档 §2.1「**语义 = 前缀包含**」+ §6 T3「声明方自己选的授权面，机制不缩」⇒ 声明 B 目录即授权 B 整棵子树（C 嵌在 B 内时放行），与需求 AC-3 字面判据的边界未调和 |
| 4 | 🟡 | 待修 | 本档 §2.2 判序第 ① 支只要求「W 有 ∧ tbl 含 p」；`docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` §2.3.1 拒文表 ④ 支「声明本身另须过 `resolveDeclaredRoot`（既有，零改）」这一保护在 ① 支未写 |
| 5 | 🟡 | 待修 | 本档 §2.5 落点表「第 20 行节点计数句」∥「第 12 行」与 §1 勘察 ⑤「第 273 行第 7 条」按行号定位，违 `docs/core/design/MANIFEST.md` §2.2「行号不作指针形态（D4——落点以函数名为准）」 |
| 6 | 🟡 | 待修 | 需求 ②.6 明列同批落点「设计档（`docs/core/design/MANIFEST.md` 键面 + `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` §2.3 取根判据）」，本档 §3 受影响文件表两档俱缺（两档正文已含该内容，表里读不出已落 ∥ 待落） |
| 7 | 🟡 | 待修 | 需求 ③ 末条「不做跨仓批的收口结构改造」+「本批只把它写进已知限界」，本档 §7 边界十条内无对应条 |
| 8 | 🟡 | 待修 | 本档 §3 行「`thincoder-core/agent/write-face.mjs` 的调用面（写锁 ∥ 设计门取 `faceDetail` 处）」与 `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` §2.3「对 `faceDetail` 的 import 因此成为零消费，一并删」矛盾，也与本档 §3「实施前须实读」第 2 条自述未见 import 方不一致 |
| 9 | 🟡 | 待修 | 本档 §3「**tier 结论**：**无 tier 跨界**」只有判断句、无核法；抽样量 `test/integration/batch-live-batch-lock.test.mjs` 已贴近 500 行咨询线，本批 +1 用例后的分拆判断未写（读数住本报告，不入档） |
| 10 | 🔵 | 记录 | 本档 §3「实施前须实读」第 1 条：spawn `files` 域对项目外路径未实读，「若它按项目根拒项外路径，跨仓写入在实施席那条路上走不通」——已标 `unverified`，但未说明验收是否依赖该路 |
| 11 | 🔵 | 记录 | 本档 §2.2 新串只在号落 `no such row` 一格触发；同号在目标仓账上但非在途时给的是 `row #N is "<status>"` 一类诊断，把人引向换号而非补声明，未处置 |
| 12 | 🔵 | 记录 | 三个新件的三问答案（键名「采认候选 `writableRepos`」∥ §3「新导出 `declaredWritableRoots(cwd)`」∥ 新拒文 KD-X5）散在 §1 与 KD 表，未按一项一条的 existing ∥ none found ∥ existing but unusable 表形成列 |

VERDICT: changes-required

计数：🔴 2 · 🟡 7 · 🔵 3，合计 12 条；阻塞项 = 第 1、2 条。

### 轮次 2（评审子代理）

| # | 严重度 | 状态 | 证据（指针） |
|---|---|---|---|
| 1 | 🔴 | 未处置 | `docs/core/requirements/ENGINEERING-MODE-V2-SPEC-CROSS-REPO-WRITE.md` ②.2 第三支「≠ 本仓根 ∧ 不在声明内 ⇒ 拒（沿用现有 case 报文形态，点名 `writableRepos` 与目标）」与该档 ②.3「不声明就只能用目标仓自己的台账号写它」、`docs/core/design/MANIFEST.md` §2.2 的 `index.writableRepos` 条「不声明就只能用**目标仓自己的**台账号写它」、`docs/core/design/CROSS-REPO-WRITE.md` §2.2「目标在外部而本笔没声明写方 ⇒ ②/③/⑤（现行）」互斥；同档 ④ 验收 AC-2 ∥ AC-4 ∥ AC-5 同为绝对句（「写仍拒」「写拒」未限定「用本仓的号」） |
| 2 | 🟡 | 未处置 | `docs/core/design/CROSS-REPO-WRITE.md` §2.2 `W` 定义「`project` 非空 ∧ `resolveDeclaredRoot(project, cwd)` 成立 ⇒ 该根」是口子前置条件，但 `docs/core/requirements/ENGINEERING-MODE-V2-SPEC-CROSS-REPO-WRITE.md` ②.2 第二支与 `docs/core/design/MANIFEST.md` §2.2「判据：用**本仓的账**写外部目标 ⇒ 表内的才放行」均未写该前置；同档 §6 T2「目标 `<..>/plain/x.mjs` · 本仓在途号 | 放行（口子覆盖「目标取不到项目根」这一形）」缺 `project:<W>`，按判序 ① 不触发、唯一剩余放行路是 ④ 窄口而未钉四条 |
| 3 | 🟡 | 未处置 | `docs/core/design/CROSS-REPO-WRITE.md` §5 AC-8 夹具「本仓 `index.publicRepos:["../other"]`、`index.writableRepos` 缺键；目标 `<..>/other/src/x.mjs`」未写目标仓带 manifest，而新串出现条件（§2.2「`W` 有 ∧ `R` 有 ∧ `W ≠ R` ∧ `tbl` 不含 `p`」）要求 `R` 有；对照组 AC-9 写了「会话锚下两个带 manifest 的兄弟项目 A（本仓）∥ B」 |
| 4 | 🟡 | 未处置 | `docs/core/design/CROSS-REPO-WRITE.md` §2.2「三条不成立落哪一句（沿用既有串，不新写）」只给一对串「`declared project is not a project`」，而三条含「与会话锚相关」——在盘且有 manifest 但与会话锚无关的声明会被这句话误称「不是项目」；依据指向的 `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` §2.3.1 拒文表不在本轮评审面（unverified） |
| 5 | 🟡 | 未处置 | `docs/core/design/MANIFEST.md` §2.2「形态判据（`validateManifest`…）两层分列」元素层枚举 = 「`index.excludePaths` / `index.docCheckExcludePaths` / `index.publicRepos` 元素层宽容」，未含 `index.writableRepos`，而同档键条自己写「校验：**数组层 fail-closed**（非数组 ⇒ 拒）、**元素层宽容**（归一剔除）」 |
| 6 | 🔵 | 未处置 | `docs/core/design/CROSS-REPO-WRITE.md` §2.3「`R` 的 manifest 只在 `resolveProjectRoot(p)` 判归属时被读」与同档 §2.4「跨仓写多一次 manifest 读（目标的）」措辞不符；授权结论不受影响，措辞面 |
| 7 | 🔵 | 未处置 | `docs/core/design/CROSS-REPO-WRITE.md` §3「软线 500 ∥ 触发线 650 的档位判定沿用既有口径」——`AGENTS.md`「≤ 500 lines advisory, ≤ 800 lines hard limit」；源档不属本轮评审面，tier 结论按声明接受、未实测 |
| 8 | 🔵 | 未处置 | `docs/core/design/CROSS-REPO-WRITE.md` §5「不传递不造夹具（…）判据由这一句给出，不加维度、不加用例。」——需求 ④ AC-3 无对应用例，理由成立，按 reasoned non-fix 记 |

计数：🔴 1 · 🟡 4 · 🔵 3。

VERDICT: changes-required

### 轮次 3（评审子代理）

| # | 严重度 | 状态 | 证据（指针） |
|---|---|---|---|
| 1 | 🔴 | 已修 | `docs/core/requirements/ENGINEERING-MODE-V2-SPEC-CROSS-REPO-WRITE.md` ②.2 三支均带「用本仓的账」限定，并明写「不声明写方、改用**目标仓自己**的在途号写它 ⇒ 走现行路」；④ AC-2 ∥ AC-4 ∥ AC-5 均已限定「本仓在途号 + `project:<本仓根>`」 |
| 2 | 🟡 | 已修 | `docs/core/design/CROSS-REPO-WRITE.md` §2.2 新增「声明了目标 ≠ 给出了写方」条 + §6 T2 输入补 `project:<本仓根>`；需求 ②.2 补「（`project` 指向本仓根）」 |
| 3 | 🟡 | 已修 | `docs/core/design/CROSS-REPO-WRITE.md` §5 AC-8 夹具补「`../other` 带 `PROJECT-MANIFEST.json`（与 AC-9 的 B 同款——新串的出现条件要求 `R` 有）」 |
| 4 | 🟡 | 接受（承认措辞代价） | `docs/core/design/CROSS-REPO-WRITE.md` §2.2「与会话锚无关」支：「**这一句对本支名不副实，照承认**…本批不改这句既有拒文」——与用户既有裁定（不改既有拒文）一致 |
| 5 | 🟡 | 已修 | `docs/core/design/MANIFEST.md` §2.2 形态判据元素层已含「`index.publicRepos` / `index.writableRepos` 元素层宽容」 |
| 6 | 🔵 | 已修 | `docs/core/design/CROSS-REPO-WRITE.md` §2.3 改写为「`R` 的 manifest 在授权面上不被读；它另在两处被用到」 |
| 7 | 🔵 | 未处置（不阻断） | `docs/core/design/CROSS-REPO-WRITE.md` §3 核法仍写「软线 500 ∥ 触发线 650 的档位判定沿用既有口径」，未给 650 的可查出处（Project Guide 记 500 ∥ 800） |
| 8 | 🔵 | 接受（reasoned non-fix） | `docs/core/design/CROSS-REPO-WRITE.md` §5「判据由这一句给出，不加维度、不加用例。」+ 理由（门只读 `W` 的 manifest，读不到 B 的 manifest） |
| 9 | 🔵 | 新（精度） | `docs/core/design/CROSS-REPO-WRITE.md` §2.2 判序「⇒ 工作区窄口 §2.3.1（四条全中 ⇒ 判据点 = 声明根；不成立各落自己那句）」的守卫写作「否则 W 有」，而同节落句条写「目标无根 ⇒ 照走 ④ 窄口」——按「任一条不成立 ⇒ W 无」，④ 在该格不可达 |
| 10 | 🔵 | 新（措辞） | 需求 ②.2「且 `R` 在 `writableRepos` 内」与 `docs/core/design/CROSS-REPO-WRITE.md` §2.1「**语义 = 前缀包含**：目标绝对路径落在某个声明根内」单位不同（R ∥ 目标路径 p），T3 的放行依赖 p 形 |
| 11 | 🟡 | 新（父侧同步 · report-and-pass） | `docs/core/design/MANIFEST.md` §2.10 仍「全 **16** 可写节点」+ AC-K2「文本键名覆盖 = 16」+ 键目录表无 `index.writableRepos` 行；§2.11 仍「`index.*` 七子键」「16 个可写节点」、其 `DEFAULT_MANIFEST` 枚举无 `writableRepos`——与同档 §2.2 的八子键及 `docs/core/design/CROSS-REPO-WRITE.md` §2.5「`16 writable nodes` → `17`；`index's 7 sub-keys` → `8`」冲突 |

计数：11 行 = 已修 5 · 接受 2 · 未处置 1（🔵，不阻断）· 新 3（🔵 2 + 🟡 1，均不阻断）；无未解 🔴。

VERDICT: pass

### 轮次 4（评审子代理）

本轮（第 3 轮 · 轮次衰减）复核四处落地：AC-7 两错 ∥ R7 补位 ∥ T12 夹具 ∥ 提示词第 6 条的设计面记录 ∥ `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` 的跨仓例外。

| # | 严重度 | 状态 | 证据（指针） |
|---|---|---|---|
| 1 | 🟡 | 新 | `docs/core/design/CROSS-REPO-WRITE.md` §3 清单里 `thincoder-core/prompts/discipline-engineering.md` 行只写「§2.5 第 7 条改写」，而 §2.5 对该文件有两行（第 7 条改写 + 第 6 条条末指针） |
| 2 | 🟡 | 新 | 同档 §3「实施前须实读两处」第 2 条「未见 import 方」与盘面相反：`thincoder-core/agent/dispatch.mjs` 已 import `faceOf`，`thincoder-core/tools/doc-write-gate.mjs` 已 import `faceDetail` 且调用形不传 manifest |
| 3 | 🟡 | 新 | AC-7 ③ ∥ §2.4「回执取 `faceDetail` 的 `reason` 四值」∥ T11 ∥ T12 承诺「回执点名」，但清单内无一件产出该回执（设计门非 product 即 `continue`；`thincoder-core/tools/doc-write-gate.mjs` 非 `doc-root` 即静默 `judged:false`） |
| 4 | 🟡 | 新 | `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` §2.3 态表行「有活设计槽 · 写产品面 · 号在途 ⇒ 设计门拒」与 AC-7 ② ∥ `!anyLiveDesignSlot(agent)` 守卫相反（同一机制两处说法；该判据本轮零改 ⇒ 报告不阻断） |
| 5 | 🟡 | 新 | 跨仓例外已落三处（§2.3 两条「例外一处」+ §7 一条），两处枚举未同步：§2.3 写盘七件行仍「路径上溯有 manifest ⇒ 按该根判（`project` 不参与）」、§2.3.1 判序仍「目标有根时**不看声明**」 |
| 6 | 🟡 | 新 | 需求 `docs/core/requirements/ENGINEERING-MODE-V2-SPEC-CROSS-REPO-WRITE.md` ④ AC-3（不传递）在 `docs/core/design/CROSS-REPO-WRITE.md` §5 无对应验收行；该档只给「不传递不造夹具」的结构性论证 |
| 7 | 🟡 | 新 | 同档 §3「tier 结论：无 tier 跨界」未点名尺寸越线：抽读 `test/integration/batch-live-batch-lock.test.mjs` = 514 行（越软线 500，未越硬线 800），本批 `12-17` 推过去的 |
| 8 | 🔵 | 新 | 同档 §5 行序 = AC-1…AC-5、AC-7、AC-8、AC-9、AC-6（AC-6 落在表末） |
| 9 | 🔵 | 新 | `thincoder-core/prompts/discipline-engineering.md` 第 3 条「written to THIS repo only」未随第 6 条加例外指针，而 AC-7 ① 的跨仓文档面写入正撞这句 |

四处落地核对（本次复核的四处）：

- **AC-7 ①②③**：与 `faceDetail` 四值、与设计门 `!anyLiveDesignSlot` 守卫逐条相符；③ 的「回执」半边见 #3。
- **T12**：夹具可造、期望正确（坏 JSON ⇒ `docRootKeys` 空集 ⇒ `product`）；「原形造不出来」与 `DEFAULT_MANIFEST.docRoot.design` 的补默认值相符。
- **提示词第 6 条**：设计面记录在 §2.5，盘上该条已含「The sole exception」句（清单缺口见 #1）。
- **写门档跨仓例外**：§2.3 / §7 已落指针指向单源（枚举同步见 #5）。

VERDICT: pass
计数：🔴 0 · 🟡 7 · 🔵 2

## §4 用户批准（主 agent）

## 用户批准（2026-11-09）

- **批级授权**：用户 2026-11-09 17:13「都自动跑完吧」——覆盖本批的评审发起、修正轮与实施，不再逐轮等签发。
- **设计已过评审**：第 3 轮 `VERDICT: pass`（`0a12b3a3` 之外的第四槽，designId `0c44bc39-b781-46b2-8ae0-19dcc028126c`），token 已签发并用于实施。
- **范围收窄由用户当场裁定**（2026-11-09）：单向声明（真门 = git 权限）∥ 记账归写方 ∥ 两分口径（用本仓的账写外部目标 ⇒ 表内才放行；不声明就只能用目标仓自己的台账号写它）∥ 写面不进依赖图、不判环 ∥ 授权单位 = 目录整棵子树。
- **未被要求做的事没有做**：不推导、不做跨仓批的收口结构改造、不改 `publicRepos` 语义。

## §5 实施记录（eng-coder）
**状态行**：实施完成



### 5.1 交付摘要

R1–R6 全部落盘：声明面 `index.writableRepos`（schema + 声明投影 + 解析层 `declaredWritableRoots`）· 写门判序新增 ① 支 · 新拒文两句（逐字 = 机制档 §2.2）· 提示词与工具面同批落 · RTM 故事 12 加 `12-17`。

机制落点一句：目标落在写方 `index.writableRepos` 的某个声明根内（前缀包含，比较键 = `gateKey`）
⇒ 写门把判据点换成**声明的写方项目**，号在写方台账里判 `在途`；目标仓不参与授权、其账零写。

### 5.2 逐条交付表

| # | 状态 | 交付 | 证据 |
|---|---|---|---|
| R1 | ✅ 完成 | `DEFAULT_MANIFEST.index.writableRepos = []`；`validateManifest` 数组层 fail-closed；`buildDeclaration` 投影（归一复用 `normalizePathList`，`declared` 旗不涉——与 `docCheckExcludePaths` 族同款）；写面白名单由 schema 派生 ⇒ `manifest write` 直接可写 | 单测 AC-1；另跑一次写面探针：`manifest write` 落盘成功、坏值被拒且盘零变 |
| R2 | ✅ 完成 | `thincoder-core/declaration.mjs` 新导出 `declaredWritableRoots(cwd)`，与 `declaredPublicRoots` 共用同一份取基法（`absoluteDeclaredRoots`，不写第二份）；`thincoder-core/conventions.mjs` 转口一行 | 单测 AC-2（同值声明时与 `declaredPublicRoots` 逐项相等） |
| R3 | ✅ 完成 | `thincoder-core/agent/write-gate-ledger.mjs` 判序 ①：`declaredW`（既有 `resolveDeclaredRoot` 三条件零改）+ `tbl`（`declaredWritableRoots`）+ `declaredByTable`（复用 `underKey`）；表内 ⇒ 按声明项目查号 | 单测 T3/T4/T8、集成 12-17 表内格 |
| R4 | ✅ 完成 | 新拒文两句逐字；出现条件 = `W` 有 ∧ `R` 有 ∧ `W ≠ R` ∧ 表不含 `p` ∧ 号在 `R` 的账上落在 `no such row`；清单单位 = `unknown — the declared project does not own this write's target` | 单测 AC-4/T6（含负向锁）、集成 12-17 表外格与 sha256 零变 |
| R5 | ✅ 完成 | 零回归：未声明 / 缺键档的同项目写 · 四把声明支 · 窄口 · `init` 豁免逐条等值；`execute` ∥ `manifest` 有定位参数时仍定位参数优先 | 集成档改前 15 条用例全绿 + 单测 AC-5 |
| R6 | ✅ 完成 | 工具面：`17 writable nodes` ∥ `index's 8 sub-keys` ∥ 键目录新增一条；persona 写门段新增一条（含「本仓」归属句）；discipline 第 7 条两分 | 单测 AC-6（三档行扫） |

**范围解释一处**：判序 ① 只落在写盘七件（`ledgerGateTargets` 里带 `fallbackDeclared` 的那一支）。
`execute` 带 `workdir` ∥ `manifest` 带 `target` 时仍定位参数优先、无此补位。
依据 = `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` §2.3「定位参数优先于 `project`」与 persona 同句。
跨仓改走写盘七件或 `bash`——`bash` 走 `{ declared }` 支，本批零改即已可跨仓。

### 5.3 出清单改动（逐条带理由）

| 文件 | 改什么 | 理由 |
|---|---|---|
| `thincoder-core/agent-tools/manifest.mjs` | 档头注释 `14 个可写节点` ∥ `index.* 五子键` → `17` ∥ `八子键` | 同一枚计数在 schema 的消费面里已陈旧，本批加键让它再错一格（D3 / D11）。纯注释，零判据改动 |
| `thincoder-core/tools/shared.mjs` | `PROJECT_PARAM_DESC` 补一句「写盘七件在目标属另一个项目、要用本仓在途号写它时也必带」 | 本批改了「`project` 何时必带」这条规则（新增强制情形），该句是同一规则的另一层陈述（D11）。纯描述，零判据 |
| `test/rtm/guard.md` | 故事 12「目的」行补 12-17 指引；「十五态」→「十六态」并加一格 | RTM 增量要求；节注态数随计数同步（D3） |

### 5.4 实施轮读数（命令 + 结果，读数只住本段）

```text
node --test docs/batches/2026-11-09-cross-repo-write.test.mjs            → pass 11 · fail 0
node --test test/integration/batch-live-batch-lock.test.mjs              → pass 16 · fail 0（15 条改前用例 + 12-17）
node --test test/integration/cross-repo-refs.test.mjs \
             test/integration/grep-process-doc-mark.test.mjs             → pass 22 · fail 0（声明面邻面回归）
doc_check(mode:"gate", docs = 提示词两档 ∥ 工具面 ∥ RTM)                   → 首行 DOC-CHECK GATE: PASS，0 段命中
```

新增行数读数（`node` 行扫，D15 一把尺）：`test/integration/batch-live-batch-lock.test.mjs` = **514** 行（本批前 439）。
软线 500 已越，硬线 800 未至；处置待裁，见 §5.6 第 6 条。

**失效侧读数（正向用例必须能红）**：同夹具、同目标、同一条号，差别只在声明与 `project`。
不带 `project` 那格读出的正是改前那句 `row #N does not exist in this project's ledger`；
表内格与「已核销」格在改前分别落在「号在目标项目账上查不到」与「无状态词」，故两格是改后才有的事实。

### 5.5 审计与代码评审轮次 · 终态

- **内部一致性审计（explore 子代理，1 轮）**：0 阻塞 · 7 条非阻塞。两条本轮已修：AC-3 的 sha256／已核销那一格补齐（12-17 新增一格）· T2／T9 两形补测。余五条转 §5.6。
- **代码评审（advisor type=code，1 轮）**：changes-required（🔴 0 · 🟡 3 · 🔵 3）。修三条：①（🟡 must-fix）AC-3 第二半补 sha256 —— 已落；⑤（🔵）persona 那句「only door」限定为「among the path-bearing write tools」—— 已落；④（🔵）`PROJECT_PARAM_DESC` 补跨仓那条 —— 已落（见 §5.3）。
- **未改三条的理由（当时）**：②（第 6 条 vs 第 7 条受众）需用户／设计裁 —— 后已裁并落地，见 §5.6 第 7 条 ∥ §5.8；③（行数读数与拆单方案）见 §5.6 第 6 条（已按裁定为「接受 514 行」，§2.11 tier 行）；⑥（AC-7 挂在 R7 上）属设计档标签，见 §5.6 第 1 条（§2.11 ①-b 已补 R7）。
- **修正轮**：3 轮（审计后 1 轮、评审后 1 轮、用户裁「改第 6 条」后 1 轮 = §5.8），每轮改后按改动面重跑，全绿。
- **终态 = clean**：阻塞项清零；未修的 5 条各有明示落点与处置建议，无静默项。

### 5.6 上抛项（设计 / 需求档漂移，本席不能自改）

**本段现状（设计席 §2.14 处置后 · 本轮复核）**：第 1 ∥ 2 ∥ 3 ∥ 4 ∥ 6 ∥ 8 条已由 §2.11 处置（逐条见该段表）；第 7 条已裁并已落（§5.8）；第 5 条已由 §2.14 在设计与代码两面处置（设计档 §2.2 的理由句改成门实际算的三件；代码注释面本轮同轮跟上，见 §5.9）。**本段没有仍开着的一条。** 下面各条保留当时原话，处置状态以本行为准。

1. **AC-7 挂在批档不存在的 R7 上**：批档 §2.1 领句是「覆盖 R1–R6」，机制档 §5 却有 `AC-7 | R7` 一行，而单测档确有一条 AC-7 用例。三链在这一格对不齐（实现面无问题：`faceDetail` 零改，两个调用方本来就不传 `manifest`）。建议批档补一行 R7，或机制档把 AC-7 标成「本批复核、零改」。
2. **AC-7 的「无活设计槽 ⇒ 拒」与实测相反**：文档面会跳过设计门（同一夹具写该档只被写门拦「要号」，本地亦然），与它自己的「与本地等同」前提互斥。原文：

   ```text
   同仓 <仓>/docs/design/x.md ⇒ 判文档面：无活设计槽 ⇒ 拒
   ```

   机制侧已按「面按目标仓自己的 docRoot 判」实现并测过三种面值。
3. **机制档 §6 T12 的夹具做不到它自己的预期**：「manifest 只有 `version` / `phase`」下 `fillDefaults` 会把默认 `docRoot` 补回来，实测仍判 `doc-root`。真正让文档面根集空的是**档不可用**（坏 JSON / 形态错），实测判 `product`——本批单测按这个形落。建议改 T12 的夹具描述。
4. **`docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` §2.3 与 §7 仍是改前口径**：「定位参数优先于 `project`」与「写盘七件的 `project` 只在目标取不到项目根时被读」两句，读单独看与新行为相反（表内目标时声明表先于路径）。本批已在同节加了跨仓指针，建议再补一句例外。
5. **机制档 §2.2 的拒文理由句比它的可判形宽**：理由句「号在本仓账上、目标项目的账里没有」里，「号在写方账上」那一半没有机检；实现按可判形那条（`R` 的账上 `no such row`）。建议把理由句改成与出现条件同形。
6. **tier 核法指向的方案不在盘上**：机制档 §3 写「越软线 ⇒ 按该档既定拆单方案处置」，而该方案无处可查。请裁：接受 514 行（硬线 800 仍远），还是另批按故事拆档（候选 = 非写锁格 `12-6` ∥ `12-9` ∥ `12-10` 迁出）。
7. **提示词第 6 / 第 7 条的反向指令——已裁、已落**：用户 2026-11-09 裁「改第 6 条」；落法 = 第 6 条**条末**补一句指针（「表内目标见第 7 条——本条的唯一例外」），第 6 条其余字面零改。落盘、读回与读数见 §5.8。不再有待裁项。
8. **批档 §2.6 第 4 条的实读结论（实施席任务）**：spawn `files` 域**不是**授权边界——依据 `thincoder-core/agent-tools/subagent-spawn.mjs`「This list is not an authorization boundary: touching a file outside it is allowed」；token 门只核 designToken（`gateDesignToken`），不判路径。⇒ 项目外路径不会被 token 门拒；跨仓写走不通的情形只来自第 7 条那条提示词，不来自机械门。

### 5.7 业务门与不静默

- 表外目标、号本身有问题、`W = R`、`init` 取根豁免四条都不放行：前三条各落自己那句拒文，第四条沿用既有豁免位次。
- 声明值写坏 ⇒ manifest 不可用 ⇒ 声明表按空处置 ⇒ 表外照拒，不静默放行（单测 T9 格）。
- 新增分支与窄口共用同一枚路径坐标（`gateKey`）；未引 `realpathSync`，未做仓库识别（机制档 §2.1「三条不做」）。

### 5.8 修正轮 3：提示词第 6 条例外指针（用户裁「改第 6 条」后落地）

**改什么**：`thincoder-core/prompts/discipline-engineering.md` 第 6 条（`**Subagents write only this repo**`）**条末**补一句指针，解掉 §5.6 第 7 条那处对同一读者的相反指令——第 6 条说「项外写盘 = violation」，第 7 条说「表内 ⇒ 照写、记账在本仓」。第 6 条其余字面零改，第 7 条一字未动。

设计给的指针语义（中文，`docs/core/design/CROSS-REPO-WRITE.md` §2.5 第 6 条那一行）与我落定的英文（本档通篇英文，`clause N` 是同节正文既有写法）并列如下：

```text
设计语义 ：（表内目标见第 7 条——那是本条的唯一例外）
落定逐字 ：   **The sole exception = a target inside this repo's `index.writableRepos` table**:
             such a write follows clause 7 instead (it writes the external directory and books the
             change here) — this clause's only exception; everything else above stands.
             （盘上是一行，缩进 3 空格接在第 6 条末行之后，作为第 6 条的续行）
```

**依据**：落英文逐字而非照抄中文括注（语义即定稿、逐字由实施席落笔）；只加续行，不改第 6 条既有任何一词。

**一处施工自查（记录在案，不藏）**：首次插入落在列 0、丢了续行缩进（会被读成第 7 条之前的独立段落），同轮以内容锚重写为 3 空格缩进，读回确认。

**读数（命令 + 结果，只住本段）**：

```text
git diff thincoder-core/prompts/discipline-engineering.md
  → 本笔 +1 行（第 6 条续行那句）；第 7 条两分形是上一轮 R6 已落，本笔未碰
node --test docs/batches/2026-11-09-cross-repo-write.test.mjs
  → tests 11 · pass 11 · fail 0（含 AC-6 三档行扫：工具面 ∥ persona ∥ discipline）
doc_check(mode:"gate", docs = thincoder-core/prompts/discipline-engineering.md)
  → 首行 DOC-CHECK GATE: PASS，0 段命中
node 行扫 thincoder-core/prompts/discipline-engineering.md
  → 「Subagents write only this repo」1 命中（第 6 条题面，未改）· 「Out-of-repo changes」1 命中（第 7 条，上一轮新题面）
```

**出清单改动**：无（本笔只动 spawn 声明的 `thincoder-core/prompts/discipline-engineering.md`）。

**一处设计档漂移（非本席笔，随文报、未动）**：`docs/core/design/PROMPT-SYSTEM.md` 的「discipline · Docs & ledger repo-self-contained」目录行仍列第 7 条旧题 `Out-of-repo changes = stop and report`，而该题面已在上一轮 R6 改成分两分的新句。条数 14 未变（本笔未加条）。用户本轮令「不动设计档」，故未改；建议设计席同步该目录行的第 7 条题面。

**终态 = clean**：本笔阻塞项 0、静默项 0；一条设计档漂移已报，处置归设计席。

### 5.9 修正轮 4：注释面把宽半句换成门真判过的三件（用户令「一处」）

**改什么**（`thincoder-core/agent/write-gate-ledger.mjs`，两处命名点；判序逻辑零改）：

- **档头「跨仓口子」那一节**（`ledgerBindWriteConflict` 的 JSDoc）：删去原来那句「号在声明项目账上、目标项目账里没有这一行」，换成门实际算的三件，并写明「号在写方账上」这一半不在门验过的范围里。
- **判序分支**（`if (message)` 块内注释）：删去原来那句「号在 `W` 的账上而目标项目 `R` 的账里没有」，同样换成三件，并点出判据变量的名（`noSuchRowInTarget`）。
- **零改**：`noSuchRowInTarget` 那一行与两个返回分支一字未动；拒文常量、工具描述、判分合取全未碰。

**依据（设计面本轮已改定，代码面照它跟上）**：

- 判据形 = 本格的判据由门逐条实际算，不另立概括
- `R` 的账读得到（`at.error` 为空）
- 查无此行由 `R` 的账给出（`at.row === null`）
- 门在这一格只读 `R` 的账，`W` 的账只在 ① 支被读

**出令内一处（理由随文；删回即可，与上面两处不相干）**：档头同节还有一句「目标落在目标仓的文档面时文档门照跑、设计槽照要」，与设计档 §2.2「表内 ≠ 免门」相反，本笔一并改准。

- 设计面那句现值：依据 `docs/core/design/CROSS-REPO-WRITE.md`「目标落在目标仓的**文档面** ⇒ 设计门不问（本地亦然），写门照判号；落在**产品面** ⇒ 设计门要活设计槽、写门照判号」
- 机制侧那一行（本笔读自 `thincoder-core/agent/dispatch.mjs`，逐字见下方围栏）——文档面在门前直接 `continue`，设计门不问。
- 设计面已在 §2.11 ①-c 把这句的五处说法一并收正；代码面这一处是同一句留下的第十处（D11：规则改一层就要扫全层，留一处即一处正确、一处仍旧）。本笔只动注释、不动逻辑。

```text
thincoder-core/agent/dispatch.mjs
         if (faceOf(abs) !== "product") continue // 面判单源（`write-face.mjs`）——文档面 / 出辖放行
```

**读数（命令 + 结果，只住本段）**：

```text
内置 grep（D15 一把尺）thincoder-core/agent/write-gate-ledger.mjs
  正则 号在声明项目账上|号在 `W` 的账上而|文档门照跑|设计槽照要
  改前 3 命中（档头文档面那半句 · 档头宽半句 · 判序分支宽半句）→ 改后 0
node --test docs/batches/2026-11-09-cross-repo-write.test.mjs     → tests 11 · pass 11 · fail 0
node --test test/integration/batch-live-batch-lock.test.mjs       → tests 16 · pass 16 · fail 0
doc_check(mode:"report", lines = 本档) → 490 行（改前 485），未越 500 软线
```

**失效侧（该红的红过）**：同一把尺、同一条正则，改前 3 命中、改后 0；差别只在本次三处注释改动。判序逻辑零改 ⇒ 用例读数两边同值属预期，回归证据 = 上面两行 `fail 0`，不是这组计数。

**一处门拒记录（不藏）**：本节首次 append 被文档门拒（`锚 1 条 · 引缺`）——引文里带了双引号的源码行，落盘文本的转义与档内字节不同形，故引文面匹配不上。改法 = 该行移入围栏块（围栏整块不判），`依据` 引文改取无嵌引号的连续片段。同轮复跑 PASS，档字节此前零变。

**未动**：设计档 · 需求档 · 用例档 · 台账 · 判序逻辑 · 拒文常量 · 工具描述。未发评审（用户令）。

## §6 验证与收口（父代理）

## 验证与收口（父侧）

### 验收读数（父侧亲自跑，非转述）

- `node --test docs/batches/2026-11-09-cross-repo-write.test.mjs` ⇒ `tests 11 · pass 11 · fail 0`（该档已在收口时删除，读数留此）。
- `node --test test/integration/batch-live-batch-lock.test.mjs` ⇒ `tests 16 · pass 16 · fail 0`（含本批新增 `12-17`）。
- `doc_check(mode:"gate")` 五档（机制档 ∥ 写门档 ∥ `docs/core/design/MANIFEST.md` ∥ 需求档 ∥ 本批档）⇒ `DOC-CHECK GATE: PASS`，0 段命中。

### 落地核对（逐条对设计的验收面）

- **AC-1 / AC-2 / AC-4 / AC-5 / AC-9**（声明后可写 ∥ 未声明用本仓账必拒 ∥ 只声明 `publicRepos` 仍拒 ∥ 同级仓未声明必拒 ∥ 不推导）——五条都由本批单测档的对应格覆盖，读数 11/11 全绿。
- **AC-7 面判复核**——文档面 ⇒ 设计门不问、产品面 ⇒ 要活设计槽；三处口径（设计档 §2.4 ∥ `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` §2.3 态表 ∥ `thincoder-core/agent/dispatch.mjs` 的 `!anyLiveDesignSlot` 守卫）在第 3 轮评审后同向。
- **AC-6 提示词与工具面同拍**——`thincoder-core/tool-docs/manifest.md` 的节点计数已与本批同轮到 17 ∥ 八子键；第 6 条与第 7 条的相反指令由条末例外指针接上。

### 集成测试面

- 本批新增一行：`test/rtm/guard.md` 故事 12 的 `12-17`（表内放行 + 本仓台账零变 + 目标仓账零写 ∥ 已核销格 + `sha256` 零变 ∥ 表外拒 + 新串 ∥ 不带 `project` 的负向锁）。
- **集成集现状 = 157 行 / 6 分册**（判据 = `test/rtm/*.md` 的 `\| <数字>-<数字> \|` 行）。**已越 ≈50–100 窗口，属既有体量、非本批引入**——已挂台账行，见下。
- 本批未新增集成用例以外的常驻测试面；单元测试档按纪律删除（只留上面那行读数）。

### 台账

- 本批行 `#2238` 已走完 `在途 → 待核销 → 已核销`，结算依据 = 本节读数与 §5 的实施记录。

### 收口扫描

- **延后批复核**：无（本批无暂缓批次）。
- **文档检查门**：`PASS`（上面第 3 条）。
- **残留未决**：无本批范围内的未决项；两条 🔵（`CROSS-REPO-WRITE.md` §2.2 拒文判序守卫措辞 ∥ `R` 与目标路径 `p` 的包含单位）已在评审 §3 记录为不阻断项，挂台账跟进。
- **已知限界**：本批的跨仓验收全部在夹具上完成（单测与集成），父侧未对真实兄弟仓做一次实写探测——那需要另一个会话锚，超本批验证面。
