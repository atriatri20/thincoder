# 2026-10-15 · light-prompt-why
> 六段 append-only，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 编制：主 agent · 2026-10-15 · 来源 = 用户 2026-10-15 03:5x 两问（「为什么要用 git 工具，在提示词里做到了知其然知其所以然了吗？」∥「关于批次档可以清理是否已经进了提示词？」）+ 04:01「收尾」——轻通道两笔：批档可随时删（提示词面）· git 工具 why（提示词面）。
> 台账 = #1464（core · 归批）。前情 = 无（独立批）。
## §1 讨论（主 agent）
**状态行**：已收口

**轮次性质**：**轻通道轮**（细节/文案面——补 why，零新机制）· 两笔均已直改落地、实时走查通过；2026-10-15 04:01 用户「**收尾**」⇒ 跑收尾全链（设计形式化 → 独立评审 → 用户批准 → 收口核销）。
**授权** = 用户 2026-10-15 03:56 选 **A**（「我直接改 + 走查」= 轻通道）+ 04:01「收尾」。
**台账行** = #1464（`task_book` 指本档）；**收尾未落 ⇒ 不许核销**。

### 轮内笔（两笔 · 逐笔收录）

| # | 笔 | 路由判据 | 改动落点 | 走查读数 |
|---|---|---|---|---|
| 1 | **批档可随时删**入提示词 | 细节/文案（把已裁定的架构定义写进模型面）·零新机制 | EN `thincoder-core/prompts/common.md:191` ∥ CN `docs/core/design/prompts/common.md:145` | 双面 grep 命中，内容一致（read-back 核实） |
| 2 | **git 工具 why**（替代「只给命令、不给因果」） | 细节/文案（补既存规矩的 why，不改规矩）·零新机制 | EN `common.md:131-132` ∥ CN `common.md:88-91` | 双面 grep 命中，内容一致（read-back 核实） |

### 笔 1 · 批档可随时删（来源 = 用户 03:39 逐字）

**用户原话**：「**批档只是批档，执行过了就无意义了，需要长期存在的内容应该在设计和需求文档里，批次档必须是能够随时清理掉的**」

**实现什么**（对模型意味着什么）：在 `## 批次档常识` 节内、紧跟「是什么」之后，立一条**定义本质**的规矩——批档 = **一次性执行记录**，跑完即耗尽，整套**必须可随时删除**；凡需活过本轮的内容**住需求/设计档**；引用方向只能 **批档 → 规范档**。**可执行自检**：永不让批档成为机制/决策/判据的唯一居所——**若删掉全部批档会丢东西，那东西就是放错了档**。

**为何要带「实务后果」句**：光说「可删」是抽象规定，模型不会因此改行为；「删了会丢 = 放错了」才是**可执行**判据。

### 笔 2 · git 工具 why（来源 = 用户 03:55 一问 + 03:55 事故）

**用户原话**：「**所以，为什么要用git工具，在提示词里做到了知其然知其所以然了吗？**」

**改前实况**：双面全部为命令式、**零 why**——`common.md` 路由表行 `| git | ALL git operations | git in bash |`（EN `:129`）∥ CN `:86`「全部 git 操作用 `git` 工具」。

**实现什么**（三层因果 + 反向解释摩擦）：① **what**——git 操作用 `git` 工具；② **why**——它在**每个破坏性动作前自动快照**（`checkout -- <路径>` · `restore` · `reset --hard` · `stash pop` · `clean -f` · 分支/标签删除）⇒ 误回滚可 `checkpoint`（`list` → `rewind`）找回；③ **代价 + 陷阱**——bash 的对应护栏**在特定配置下静默失效**：它查 `isGitRepo(cwd)`，而 `cwd` = **进程工作目录**；会话锚是非仓工作区根（仓在其子目录）时判定为非仓 ⇒ **不拍快照、且不告警**，命令里 `Set-Location` 进仓**不改变护栏看到的 `cwd`**；④ **反向解释摩擦**——`git` 工具在锚点歧义时要求显式 `workdir`，**那点摩擦是护栏在起作用，不是障碍**。

**实证依据（读源码取得，非推断）**：`thincoder-core/tools/bash.mjs:88` `GIT_DESTRUCTIVE_RE`（覆盖 `git checkout -- <path>` 形态）· `:95` `if (!isGitRepo(cwd)) return null`（**静默失效点**）· `:96` `createCheckpoint(cwd)` · `:100` `[auto-protection]` notice；`thincoder-core/tools/git.mjs` 的 `snapshotBefore` 调用点 = `:269` tag delete · `:295` branch delete · `:304` `checkout -- <path>` · `:317` restore · `:334` stash pop · `:358` reset --hard；`thincoder-core/tools/git-ext.mjs:54-57` 共享辅助。

**事故背景（本条 why 的实证来源）**：2026-10-15 本会话，父侧用 bash `git checkout -- <8 档>` 回滚一次误派批的越批改动 ⇒ 连坐还原了 `docs/core/design/DOC-DISCIPLINE.md`（该档携带未提交的设计成果 ~170 行）⇒ 因绕过 git 工具、**无 checkpoint 可恢复**，成果永久丢失。**根因 = 提示词只给命令不给因果 ⇒ 遇到「多传 workdir」的小摩擦就被绕过。**

### 收尾链（本轮待跑）

设计形式化（§2）→ 独立评审（§3，落码 ∥ 记录 ∥ 文档对账）→ 用户批准（§4）→ 收口核销（§6，含台账 #1464 勾销）。**§5 不适用**（轻通道无 eng-coder 实施段——实施面 = 父侧直改，逐笔已录本节）。
## §2 批次任务与设计（eng-designer）
**状态行**：设计完成（收尾轮 · 设计形式化 + 文档一致化方案 · 两笔双面锚对拍齐（W1 4/4 · W2 5/5）· 引用方向扫描双面缺陷 0 · 上抛 U1–U3）

### §2.1 本批条目（覆盖 · 逐笔形式化 —— 形按 `LIGHT-CHANNEL.md` §2.6 / 模板 §2.4）

| # | 笔 | 类 | 出处（目标行为坐标 ∥ 用户原话） | 相抵/读数 | 落地（改动 `file:line`） | 文档一致化去向 |
|---|---|---|---|---|---|---|
| W1 | 批档可随时删 → 提示词面 | 收敛面·补 why/写本质（零新机制——把已裁定的架构定义写进模型面） | 用户 2026-10-15 03:39「批档只是批档，执行过了就无意义了，需要长期存在的内容应该在设计和需求文档里，批次档必须是能够随时清理掉的」（批档 §1） | **非机械面**——无先红后绿对：本笔为模型可见文本的语义补全，读数 = **双面 grep 命中 + 语义锚逐条对拍**（下表 §2.4）。**先态**：两面「批档常识」节内**零可删性表达**（`common.md` 该节 `:189-197` 原仅「是什么/模式归属/六段全图/写手段/任务书本体/结构权威/多仓按仓各自」七行——`grep` 可复现） | EN `thincoder-core/prompts/common.md:191`（新增）· CN `docs/core/design/prompts/common.md:145`（新增） | 出处 = 已裁定设计面（`DOC-DISCIPLINE.md` §4.5 ① / §1 D4 细则二）⇒ **实现向档对齐、档零改**；提示词面 = 实现面（`PROMPT-SYSTEM.md` §6.1 常例，中文面 = 设计档作者笔 · 英文面 = 核内运行面） |
| W2 | `git` 工具 why → 提示词面 | 收敛面·补 why（补既存规矩的因果，不改规矩） | 用户 2026-10-15 03:55「所以，为什么要用git工具，在提示词里做到了知其然知其所以然了吗？」（批档 §1） | **非机械面**——读数 = 双面 grep 命中 + 三层因果（what/why/陷阱）锚逐条对拍 + **实证坐标复核**（下表 §2.4 / §2.5）。**先态**：双面零 why——原两行仅命令式（EN `:129` 路由表行 `| git | ALL git operations | git in bash |` ∥ CN `:86`「全部 git 操作用 `git` 工具」，逐字见批档 §1） | EN `thincoder-core/prompts/common.md:131-132`（新增）· CN `docs/core/design/prompts/common.md:88-91`（新增） | 出处 = 当场的话 + 当日事故（记录面）⇒ **收口落档**：设计侧权威源 = `CHECKPOINT.md` §2.1（`git-checkpoint.mjs` / `git-ext.mjs` 的 `snapshotBefore` 族——核模块裁决行 #48/#49）；本笔为提示词面（模型面）表达，档零改 |

### §2.2 落点判断（D2 单一权威源 —— 两笔各自的权威源归属）

**判据（D2 + `DOC-SYSTEM.md` 归属口径）**：一条机制**只在一处详述**（权威源 = 该机制被完整定义的处所）；其余处**只引用不重述**。提示词面 = **实现面 / 消费面**（模型可见文本），**永不当权威源**——提示词里的规矩须能在设计档指到源头，否则「规矩无出处」。

**W1（批档可删性）**

- **权威源归属 = `docs/core/design/DOC-DISCIPLINE.md` §4.5 ①（原则句）+ §1 D4 细则二（方向分界 + 处置口径）**。
  实证：`DOC-DISCIPLINE.md:1819`（本档变更记录 2026-10-15 行）记载 §4.5 §「批档可删性契约与存量清理工序」已落、其 ① 项 = 原则句（用户裁定原文）+ 方向分界；`:1689` A-DD25 判据块 8 = 「§1 D4 细则二在盘（批档可随时删 ∥ 禁引批档及其单元测试档 · 含历史行；方向唯一 = 批档 → 规范档；处置 = 删引用片段非改指别处）」。
- **`docs/core/design/prompts/common.md` = 实现面，不是权威源**：中文面提示词 = 设计树下的中文写作面（供人读 · 非运行期），其权威源判据与英文面同（`PROMPT-SYSTEM.md` §1「核内只有运行期面 · 中文设计档永进核」）。
- **结论（D2）**：W1 的**机制详述住 `DOC-DISCIPLINE.md` §4.5 + §1 D4 细则二**；提示词双面（EN `common.md:191` / CN `common.md:145`）为**消费面**，其文本须与权威源同义、**不再另立第三处描述**。
- **登记（超本批写域 · 只登记不写入）**：`DOC-DISCIPLINE.md` **正被在飞链 `docs/batches/2026-10-15-doc-ref-direction-cleanup.md`（台账 #1463）重写**（该档 §2 状态行 = 进行中；其 R1 批含本档自身 55/64/224 三处清理 —— `DOC-DISCIPLINE.md:1403`）。⇒ **本轮对该档零写入**；权威源已在盘（§4.5 / D4 细则二由该在飞链落笔），W1 无需另行落档。**该登记 = 本批对 #1463 的挂接点**（若该链后续改写 §4.5 ① 措辞，提示词面须随之对拍 —— 见 §2.6 U1）。

**W2（`git` 工具 why）**

- **权威源归属 = `docs/core/design/CHECKPOINT.md`（检查点与 git 面子系统设计档）**。
  实证：`CHECKPOINT.md:14-15` = 检查点核心经 `@thincoder/core/git/checkpoint.mjs` 引用 · 工具面经 `@thincoder/core/tools/git-checkpoint.mjs` · `git-ext.mjs` 引用；`:27-28` = 核模块裁决行 #48 `tools/git-checkpoint.mjs` / #49 `tools/git-ext.mjs`（两者即 `snapshotBefore` 族所在）。
- **`docs/core/design/TOOLS.md` §6.7 = 逐工具契约（要旨）——「先快照再执行 + 确认，从不拦截（`gitGuardSnapshot`）」（`TOOLS.md:235`）**：此处详述的是 **git 工具的破坏性动作快照语义**（要旨层），**是 W2 的次权威点**。
  **判 D2 归属：W2 的快照因果 → `CHECKPOINT.md` 为机制主档**（检查点族 = 该档的完整设计面），**`TOOLS.md` §6.7 为 git 工具契约面**（一行要旨，非机制详述）；**两处不重复**（§6.7 是契约要旨、`CHECKPOINT.md` 是快照机制；`TOOLS.md:1409` 已自声明「检查点 / hooks 权威归各自板块」）。
- **§6.13 与 W2 的关系 = 不同面（不入权威源）**：`TOOLS.md` §6.13 = **git 工具仓发现**（会话锚非仓时的仓解析 / `workdir` 摩擦的技术根因）——W2 的「`workdir` 摩擦 = 护栏在起作用」句**在其因果面与之相接**（同档 §6.12 fail-closed 是 §6.13 的前置），但 §6.13 详述的是**发现层**（重定向 / 注记 / 缓存 / 开销），**不含**快照因果 ⇒ W2 的 why 不入 §6.13。
- **结论（D2）**：W2 的机制详述住 `CHECKPOINT.md`（`snapshotBefore` 族 = 破坏性动作前快照的机制面）+ `TOOLS.md` §6.7（该工具的契约要旨行）；**提示词双面（EN `:131-132` / CN `:88-91`）为消费面**，不再另立第三处。
- **`bash` 侧护栏与静默失效点的实证依据（本笔所引，非本批写域）**：`thincoder-core/tools/bash.mjs:88` `GIT_DESTRUCTIVE_RE` · `:95` `if (!isGitRepo(cwd)) return null`（**静默失效点**）· `:96` `createCheckpoint(cwd)` · `:100` `[auto-protection]` notice；`thincoder-core/tools/git.mjs` 的 `snapshotBefore` 调用点 = `:269` tag delete / `:295` branch delete / `:304` `checkout -- <path>` / `:317` restore / `:334` stash pop / `:358` reset --hard；共享辅助 = `thincoder-core/tools/git-ext.mjs:54-57`。**上述坐标 proven 自读源码（批档 §1 已录，本席复核型引用）**——**这批实证住代码面**，档面表述住 `CHECKPOINT.md` / `TOOLS.md` §6.7。

### §2.3 文档一致化方案（收尾全链必做面 —— 双面语义一致校验 + 引用方向校验）

**方案（四步 · 收尾轮一次跑 · 载体重跑命令）**：

1. **双面锚对拍**：对每笔抽 **语义锚表**（EN 串 ∥ CN 串 —— 见 §2.4 表），逐锚 `grep` 双面各 ≥1，且**锚计数对等**（无单面独有锚）。
2. **双面结构与因果层对拍**：每笔的**因果层数**两面必须同（W2 三层 = what/why/陷阱 + 反向解释摩擦；W1 四项 = 本质/归属/实务后果/引用方向），逐层在另面有对应句。
3. **引用方向校验（提示词面禁带档名 / 节号引用 —— 承 `DOC-DISCIPLINE.md` §1 D4 细则一 + 本批 U 判）**：
   - **扫描式（双面全域）**：`[A-Z][A-Z0-9-]{2,}\.md` 与 `§\s?\d` 两正则各扫一面全档 ⇒ 命中集须 ⊆ 豁免集（豁免 = 协议自指 `AGENTS.md` / `SKILL.md` / `README.md` / `MANIFEST.md` 与批次档段号 `§1`–`§6`，后者是 `PROMPT-SYSTEM.md` §5 J2 明列合法正例）。
   - **本笔文本单独判**：W1 / W2 四段文本内**任一档名 / 节号 / 「见 X」指针 ⇒ 判缺陷**（提示词面自足——句子须能独立站住）。
4. **失效表达扫描（D8）**：两笔文本内 `~~` / 「原记 X ⇒ 收正 Y」/「已作废 / 裁撤」类残句 ⇒ **判缺陷**（规范面失效表达必删）。

**本批实测读数（2026-10-15 04:0x · 本席自读自跑 · 命令 = `node` 逐行扫，UTF-8 感知）**：

| 校验项 | 命令（可复跑） | 读数 |
|---|---|---|
| W1 双面命中 | `grep -n "one-off execution record\|Disposable by design" thincoder-core/prompts/common.md` ∥ `grep -n "本质上可弃\|一次性执行记录" docs/core/design/prompts/common.md` | EN **:191**（1 行）∥ CN **:145**（1 行）✅ |
| W2 双面命中 | `grep -n "Why the \`git\` tool" thincoder-core/prompts/common.md` ∥ `grep -n "为什么要知其所以然" docs/core/design/prompts/common.md` | EN **:131**（1 行）∥ CN **:88**（1 行）✅ |
| **引用方向扫描（双面全域）** | `node -e "…matchAll(/[A-Z][A-Z0-9-]{2,}\.md/g)…"` ∥ 同法扫 `§\s?\d` | EN 档名命中 = `AGENTS.md` / `SKILL.md` / `README.md` / `MANIFEST.md`（**全在豁免集**）· 节号命中 = `§1`–`§6`（**全在豁免集**）∥ CN **同** ✅ **缺陷 0** |
| **引用方向扫描（本批两笔文本）** | 正则 `([A-Za-z][\w-]*\.md)|§\s?\d` 施于 W1/W2 四段 | **EN-pen1 clean ∥ CN-pen1 clean ∥ EN-pen2 clean ∥ CN-pen2 clean** ✅ **缺陷 0** |
| 失效表达扫描（D8） | 正则 `~~|原记|作废|已废|裁撤|scrapped|previously` 施于四段 | 四段**全 clean** ✅ **缺陷 0** |
| 面长读数（as-of 本轮回读） | `node -e "…split('\n').length"` | EN `common.md` = **225 行** ∥ CN `common.md` = **178 行**（**面不对称 = 结构面差异，非本笔缺陷** —— 见 §2.6 观察 1） |

### §2.4 双面语义一致读数（逐笔锚表 —— 机判式）

**W1（批档可删性 —— 四项锚）**

| 语义锚 | EN（`common.md:191`） | EN 命中 | CN（`common.md:145`） | CN 命中 | 判 |
|---|---|---|---|---|---|
| 本质 = 一次性执行记录 | `a batch record is a **one-off execution record**` | 1 | `批次档 = **一次性执行记录**` | 1 | ✅ |
| 整套必须可随时删除 | `must be deletable at any moment` | 1 | `必须可随时删除` | 1 | ✅ |
| 归属 = 需活过本轮者住需求/设计档 | `Anything that must outlive the round belongs in the requirement/design docs, never in a batch record.` | 1 | `凡需活过本轮的内容，住需求/设计档，绝不住批次档。` | 1 | ✅ |
| 实务后果 + 引用方向 | `never make a batch record the only home of a mechanism…` ∥ `Cited only from batch records to spec docs, never the reverse` | 1 / 1 | `永不让批次档成为机制 / 决策 / 判据的唯一居所` ∥ `引用方向只能是批档 → 规范档，不得反向` | 1 / 1 | ✅ |

**W2（`git` 工具 why —— 三层因果 + 反向解释摩擦）**

| 语义锚 | EN（`:131-132`） | EN 命中 | CN（`:88-91`） | CN 命中 | 判 |
|---|---|---|---|---|---|
| ③ what「有此规矩」 | `The git tool **auto-snapshots before every destructive action**` | 1 | `\`git\` 工具在**每个破坏性动作前自动快照**` | 1 | ✅ |
| ② why「可找回」 | `a mistaken rollback is recoverable via \`checkpoint\` (\`list\` → \`rewind\`)` | 1 | `误回滚可经 \`checkpoint\`（\`list\` → \`rewind\`）找回` | 1 | ✅ |
| ③ 代价 + 陷阱（静默失效） | `it **silently fails in exactly the configuration you are most likely to be in**` ∥ `**no snapshot is taken, and nothing tells you**` ∥ `Set-Location … does not change the \`cwd\` the guard sees` | 1 / 1 / 1 | `但它**恰好会在你最可能所处的配置下静默失效**` ∥ `**不拍快照，且什么都不告诉你**` ∥ `命令里 \`Set-Location\` 进仓**不会改变护栏看到的 \`cwd\`**` | 1 / 1 / 1 | ✅ |
| ④ 反向解释摩擦 | `it demands an explicit \`workdir\` … **pass it; that friction is the guard working, not an obstacle**` | 1 | `要求显式 \`workdir\`——**传它；那点摩擦是护栏在起作用，不是障碍**` | 1 | ✅ |
| 事故背景句（why 的实证来源） | `bypassing it has cost uncommitted work **permanently** (a real, dated incident)` | 1 | `「git 操作用 git 工具」不是偏好，绕过它真丢过东西（已发生的事故）」` | 1 | ✅ |

**机判结论**：W1 = 4/4 锚双面各 1 命中；W2 = 5/5 锚双面各 ≥1 命中；**单面独有锚 = 0**；**面级语义差 = 0**。✅

### §2.5 实证坐标复核（W2 引用的代码实证 —— 本席复核读数）

| 坐标 | 内容 | 复核判 |
|---|---|---|
| `thincoder-core/tools/bash.mjs:95` | `if (!isGitRepo(cwd)) return null`（**静默失效点**——不拍快照、不告警） | ✅ 与 W2 文本「恰好会在你最可能所处的配置下静默失效」对应 |
| `thincoder-core/tools/bash.mjs:88` | `GIT_DESTRUCTIVE_RE`（破坏性命令正则，覆盖 `git checkout -- <path>` 形态） | ✅ |
| `thincoder-core/tools/bash.mjs:96` / `:100` | `createCheckpoint(cwd)` / `[auto-protection]` 提示（被跳过的一支） | ✅ |
| `thincoder-core/tools/git.mjs:269/:295/:304/:317/:334/:358` | `snapshotBefore` 调用点 = tag delete / branch delete / `checkout -- <path>` / restore / stash pop / reset --hard —— **即 W1 括号内 6 项的实证** | ✅ |
| `thincoder-core/tools/git-ext.mjs:54-57` | 共享辅助（`snapshotBefore` 族所在） | ✅ |

**边界（WF 面）**：W2 括号枚举 `checkout -- <path>` · `restore` · `reset --hard` · `stash pop` · `clean -f` · 分支/标签删除 —— 其中 **`clean -f` 未在 `git.mjs` 六个调用点内出现**（节点 = `:269` / `:295` / `:304` / `:317` / `:334` / `:358`），**但它的快照在 `git-ext.mjs:117`**（`clean` 分支，与 `git.mjs` 六处同机制、同辅助函数 `snapshotBefore`）——**见 §2.6 观察 3 的已闭记录**。

### §2.6 受影响文件表 + 逐条机判式 AC

**受影响文件表（本批写域 = 只读 + 批档 §2 写入；产品面零改）**

| # | 文件 | 类别 | 当前行数 | 本批 Δ | 写者 | 面别 |
|---|---|---|---|---|---|---|
| 1 | `docs/batches/2026-10-15-light-prompt-why.md` | 批档 | 49（§1 后） | +本段 | eng-designer | 文档面 |
| 2 | `thincoder-core/prompts/common.md` | 提示词（EN 运行面） | **225** | **0**（两笔已于本批前落地，本轮只核） | —— | 产品文本面·零触 |
| 3 | `docs/core/design/prompts/common.md` | 提示词（CN 设计面） | **178** | **0**（同上） | —— | 文档面·零触 |
| 4 | `docs/core/design/DOC-DISCIPLINE.md` | 设计档（W1 权威源） | 2031 | **0**（在飞链写域 ⇒ 只登记） | `doc-ref-direction-cleanup` 链 | 文档面·零触 |
| 5 | `docs/core/design/CHECKPOINT.md` | 设计档（W2 权威源 · 登记） | 218 | **0**（登记，不改） | —— | 文档面·零触 |
| 6 | `docs/core/design/TOOLS.md` | 设计档（W2 次权威 §6.7 / §6.13 · 登记） | 1607 | **0**（登记，不改） | —— | 文档面·零触 |

**逐条机判式 AC（回指批档 §1 两笔）**

| # | 判据（机器可验） | 回指 |
|---|---|---|
| AC-1 | **W1 双面在盘**：`thincoder-core/prompts/common.md:191` 命中 `one-off execution record` ∧ `docs/core/design/prompts/common.md:145` 命中 `一次性执行记录`（各 1 行） | W1 |
| AC-2 | **W2 双面在盘**：EN `common.md:131` 命中 `` Why the `git` tool `` ∧ CN `common.md:88` 命中 `为什么要知其所以然`（各 1 行） | W2 |
| AC-3 | **双面锚计数对等（§2.4 表）**：W1 四锚 / W2 五锚**双面各 ≥1 且单面独有锚 = 0** | W1 · W2 |
| AC-4 | **引用方向零缺陷**：双面全域档名命中集 ⊆ {`AGENTS.md`,`SKILL.md`,`README.md`,`MANIFEST.md`} ∧ 节号命中集 ⊆ {`§1`…`§6`}；**两笔文本内命中 = 0** | W1 · W2 |
| AC-5 | **失效表达零残留（D8）**：四段文本 `~~` / 「原记 / 作废 / 已废 / 裁撤 / previously」命中 = **0** | W1 · W2 |
| AC-6 | **W2 实证坐标在盘**：`thincoder-core/tools/git.mjs` `snapshotBefore` 六调用点在位 ∧ `bash.mjs:95` 为 `if (!isGitRepo(cwd)) return null` | W2 |
| AC-7 | **清单外零改动**：本轮 `git status --porcelain` ⊆ 受影响文件表（本表 1–6 行）∪ 批档 | 全批 |
| AC-8 | **提示词双面面长读数在册（as-of）**：EN **225** ∥ CN **178**；**两笔行号已记（EN 131-132 / 191 ∥ CN 88-91 / 145）** | 全批 |

**用例表（正常 / 边界 / 错误）**

| # | 类 | 输入 | 期望输出 |
|---|---|---|---|
| LP-1 | 正常 | 双面 `common.md` 全档，`grep` W1 / W2 锚串 | 各 1 行命中；行号 = 表列值 |
| LP-2 | 正常 | §2.4 锚表逐锚双面 `grep` | 双面各 ≥1；单面独有锚 = 0 |
| LP-3 | 边界 | 双面全域 `[A-Z][A-Z0-9-]{2,}\.md` 扫描 | 命中集 ⊆ 豁免四档名（**AGENTS.md / SKILL.md / README.md / MANIFEST.md**） |
| LP-4 | 边界 | 双面全域 `§\s?\d` 扫描 | 命中集 ⊆ `§1`–`§6`（协议自指 —— `PROMPT-SYSTEM.md` §5 J2 合法正例） |
| LP-5 | 边界 | 两笔四段文本内档名 / 节号扫描 | 命中 **0**（提示词面自足） |
| LP-6 | 错误 | 夹具：提示词段内插入 `TOOLS.md §6.7` 式指针 | 判**缺陷**（引用方向违规 —— 提示词面禁带档名 / 节号） |
| LP-7 | 错误 | 夹具：规范面内留 `~~…~~` / 「原记 X ⇒ 收正 Y」 | 判**缺陷**（D8 —— 失效表达必删） |
| LP-8 | 错误 | 夹具：单面独有语义锚（仅 EN 面有「可找回」句） | 判**缺陷**（双面语义差 —— 面级一致校验不过） |

### §2.7 关键决策

| # | 决策 | 理由 | 备选（否决） |
|---|---|---|---|
| D1 | **W1 权威源 = `DOC-DISCIPLINE.md` §4.5 ① + §1 D4 细则二；提示词面 = 消费面** | 该处已由在飞链落定完整契约（判据句 + 四类处置 + 处分成因）；D2 = 一处详述，余处引用 | 判 `prompts/common.md` 为权威源 —— 否决：提示词 = 实现/消费面，非机制详述面（`PROMPT-SYSTEM.md` §1 中文档永不进核；EN 面 = 运行期镜像） |
| D2 | **W2 权威源 = `CHECKPOINT.md`（检查点机制主档）；`TOOLS.md` §6.7 为工具契约要旨；§6.13 不入** | `CHECKPOINT.md` = 检查点子系统的完整设计面（#48/#49 裁决行即 `snapshotBefore` 族所在）；§6.7 = 逐工具契约一行要旨；§6.13 = **仓发现层**（不同面） | 判 §6.13 为权威源 —— 否决：§6.13 详述仓发现 / 重定向 / 注记 / 缓存，机制主体 ≠ 快照因果；判 §6.7 为唯一权威 —— 否决：一行要旨不构成机制详述，不满足 D2「一处详述」 |
| D3 | **本批对 `DOC-DISCIPLINE.md` 零写入（只登记）** | 该档正被在飞链 `2026-10-15-doc-ref-direction-cleanup` 重写（R1 批含本档自身）⇒ **超本批写域**；权威源已在盘，无需本轮落笔 | 直接补写 §4.5 ① —— 否决：与在飞链写域冲突（并发写同档 = 覆盖风险） |
| D4 | **双面一致判据 = 语义锚对拍（非逐字）** | 提示词双面 = 中英两语言面，「语义同源」而「逐字不可能同」；判据须可机判 ⇒ 取有限锚表 | 逐字对拍 —— 否决：跨语言面不可逐字；无限语义比对 —— 否决：不可机判 |
| D5 | **`clean -f` 与 `git.mjs` 六调用点的差 = 观察项，非缺陷** | `TOOLS.md:551` 表已含 `clean`（有快照类）；提示词括号枚举取「用户可感的常见破坏性动作」层，不承诺与调用点清单逐项一一 | 判 W2 文本缺陷并回改提示词 —— 否决：**超本批写域**（产品文本面零改），且档面已有依据 |

### §2.8 边界（本批不做 —— 明列）

- **不改提示词**（两笔文本 = 已落地实况；本轮为形式化 + 一致性核，产品文本面零触）。
- **不写产品代码**（`thincoder-core/**` 零改；代码实证 = 只读复核）。
- **不写 `DOC-DISCIPLINE.md`**（在飞链写域 ⇒ 只登记，见 §2.7 D3）。
- **不改** `_archive/**` · 台账 · `docs/batches/2026-10-15-doc-ref-direction-cleanup.md` 及其链任何档 · `CHECKPOINT.md` · `TOOLS.md`。
- **不新立规矩**（两笔皆为「补 why / 写本质」，零新机制 —— 不新增机制条款、不新增机检门）。
- **不把本批内容写进任何长期设计档**（本段 = 一次性批次材料，按 W1 本身的原则：需活过本轮的已住权威源，其余归批档）。

### §2.9 上抛项（U —— 须父侧裁）

- **U1（挂接登记 —— 与在飞链 #1463 的咬合）**：W1 的权威源 `DOC-DISCIPLINE.md` §4.5 ① / §1 D4 细则二 **正由 `2026-10-15-doc-ref-direction-cleanup` 链在写**。本批轮对提示词面已按现盘同义核对（§2.4 通过），但**若该链后续改写 §4.5 ① 措辞**，提示词面（EN `:191` / CN `:145`）须随之对拍 —— **请裁：是否在该链收口时把「提示词面同拍」列入其 §2 同步项**（本批只登记，不代该链立规矩）。
- **U2（观察项 —— 双面结构不对称）**：EN `common.md` = **225 行** ∥ CN `common.md` = **178 行**（差 47 行）。本席回读判定 = **结构面差异**（EN 面按 slot 装配需自足运行期文本；CN 面为设计树写作面，部分节以枚举行承载），**非本批两笔所致**（两笔双面锚齐、判据句逐条对应）。**请裁是否另案**（登记项，本批不处置）。
- **U3（观察项 —— `clean -f` 枚举与调用点）**：W2 括号内 `clean -f` 未在 `git.mjs` 直读的六调用点中出现（依据在 `TOOLS.md:551` 表 + §6.14 批记载）。**请裁是否另案核**（本批只登记，不改提示词、不改档）。

### §2.10 自检结论

**pre-review 四检**：① 需求（= §1 两笔收录）可设计？✅（两笔皆已落地，本轮形式化）；② 全受影响文件表 + 行数？✅（§2.6 六行 · 本回读实测）；③ 逐条 AC 回指 §1？✅（AC-1…AC-8 · 逐条机判）；④ 交付决策全落？✅（§2.7 五项 + §2.8 边界 + §2.9 三项上抛，无「讨论未落」）。**本轮零新机制、零产品面写入、零超域写入**。

## §3 设计评审（评审子代理）

### 轮次 1（评审子代理）

placeholder

### 轮次 2（评审子代理）

## 设计评审（轮次 1 · 对象 = 批档 §2 形式化 + 双面提示词实况对账）

审阅范围 = `docs/batches/2026-10-15-light-prompt-why.md` §1/§2 全文 ∥ `docs/core/design/prompts/common.md` 全文 ∥ `thincoder-core/prompts/common.md` 全文（声明的 EN 源档，产品代码树内）∥ 复核性实读 `thincoder-core/tools/bash.mjs`、`thincoder-core/tools/git.mjs`、`thincoder-core/tools/git-ext.mjs`、`docs/core/design/TOOLS.md` §6.14、`CHECKPOINT.md` §1/§2.5、`DOC-DISCIPLINE.md` §1 D4 细则二/§4.5/A-DD25。

| # | Category | Severity | Issue | Suggestion |
|---|---|---|---|---|
| 1 | Document ownership（机制描述矛盾 · 同一机制两处互斥） | 🔴 | §2.5 边界段称「**`clean -f` 未在 `git.mjs` 六个调用点内出现**（节点 = `:269` / `:295` / `:304` / `:317` / `:334` / `:358`）」（`docs/batches/2026-10-15-light-prompt-why.md:129`），并据此把「提示词面写了 `clean -f` 而 `git.mjs` 直读未见其调用点」立为观察项；§2.7 D5 把该差记为「观察项，非缺陷」，§2.9 U3 再请裁是否另案。**实读源码：该前提不成立**——`clean` 走 `git.mjs:386`（`case "clean":` 落进 `executeExtAction` 分支）⇒ `git-ext.mjs:117` `const snap = args.dryRun ? "" : await snapshotBefore(ctx, "clean")`；即 `clean` 在 `git-ext.mjs` 内**自带 `snapshotBefore` 调用点**，`git.mjs` 六点只是同一族在 `git.mjs` 内的子集。`TOOLS.md:551` 行「有快照类 = `rebase` · `clean` · `tag -d` · …（快照**先于**动作落（`snapshotBefore`））」与源码一致。⇒ 同一机制（`clean -f` 有无快照）在设计面被描述为「未见调用点 / 差待核」，在源码与 `TOOLS.md` 面为「有快照」。三处（§2.5 · D5 · U3）同措辞复述该错误前提 ⇒ 读者按设计面复核会去「找 `clean` 的缺失」，而它根本不缺。 | 把 §2.5 边界段、D5、U3 三处的判定依据由「`git.mjs` 六调用点清单」改为「`git-ext.mjs:117` `snapshotBefore(ctx, "clean")` + `git.mjs:386` 路由」，并把 W2 括号内 `clean -f` 判为**与代码面一致、无差可记**；U3 随之撤下或改述为已消解。 |
| 2 | Requirements coverage / 提示词文本正确性（未在设计中落判的实质文本改动） | 🔴 | W2 陷阱③ 的 CN 面文本为「命令里 `Set-Location` 进仓**不会改变护栏看到的 `cwd`**」（`docs/core/design/prompts/common.md:90`），EN 面为「`Set-Location` into the repo inside the command does not change the `cwd` the guard sees」（`thincoder-core/prompts/common.md:132`）。实读 `bash.mjs:95` `if (!isGitRepo(cwd)) return null` 与 `:261` `gitGuardSnapshot(args.command, ctx.cwd)`：护栏查的是 `ctx.cwd`（进程级传入值），而**任何** shell 内改变自身工作目录的手段（POSIX `cd`、`Set-Location`、子 shell）都不改变 `ctx.cwd`——机制是「护栏只认 ctx.cwd，不看命令内部」这一层。现文本把该机制**收窄成一个 PowerShell 专名**，而该档是跨平台运行期面（同档 §「工具路由表」并列给出 cmd.exe `%VAR%` 与 POSIX 指引，见 `thincoder-core/prompts/common.md:144`「existence / state checks use read-only commands only (`dir` / `ls` / `where` / `type`)」）。设计 §2.1 / §2.4 只把该句登记为 W2 四锚之一「三层因果 + 反向解释摩擦」，**未出现任何把机制表述绑定到 `Set-Location` 的决策或理由**（§2.7 D1–D5 五项均无涉）⇒ 该措辞属设计未覆盖的自主收紧。 | 补一条决策或收正该句：机制表述改为与 shell 无关的层（「命令内部进仓不改变护栏看到的 `cwd`」/ 以 `cd` 与 `Set-Location` 并陈），设计面补记该措辞的选择与理由，双面同改。 |
| 3 | Acceptance criteria（判据不可执行） | 🟡 | AC-7 判据 = 「本轮 `git status --porcelain` ⊆ 受影响文件表（本表 1–6 行）∪ 批档」（`docs/batches/2026-10-15-light-prompt-why.md:154`）。本工作区无 git 仓（`AGENTS.md` 明载「No git repository detected — change-set context is unavailable」）⇒ 该判据在现环境下跑不出读数，属「写了但无法跑」的判据（承 `AGENTS.md`「Every change must be verified by running it」）。§2.3 其余校验项均给了可复跑命令，唯 AC-7 无。 | 把 AC-7 改为可跑形态（逐文件 mtime / 内容 sha 比对，或明示以「本批只读 + §2 写入」为边界的静态清单核对），或登记该判据的环境前提与替代读数。 |
| 4 | Clarity / Methodology（面长读数与权威档计数口径） | 🟡 | §2.6 受影响文件表行 2/3 给 `thincoder-core/prompts/common.md` = **225** 行 ∥ `docs/core/design/prompts/common.md` = **178** 行，§2.6 观察 1（U2）据此判「面不对称 = 结构面差异，非本笔缺陷」。实读两面确为 225 ∥ 178（尾行分别为 `For situations you haven't seen before, reason from these whys and get it right.` / `没见过的场面，照这些理由自己推对。`），**读数本身属实**。但 U2 未给「结构面差异」的可核依据，而同批 W1/W2 的落点行号在权威档 `PROMPT-SYSTEM.md` §10.2 行 5 处记有标题节点读数（`17/20`，见 `docs/core/design/PROMPT-SYSTEM.md:841`）——本批两笔为既有节内增列、零标题节点变动，设计未声明该计数是否随动。 | U2 补「结构面差异」的可核依据（逐节枚举行/散文行的对面读数）；§2.6 或 §2.7 补一行声明本批零标题节点连带（对齐 `PROMPT-SYSTEM.md` §10.2 行 5 现有读数）。 |
| 5 | Requirements coverage（双面一致判据的边界未声明） | 🟡 | §2.4 机判结论 = 「W1 = 4/4 锚双面各 1 命中；W2 = 5/5 锚双面各 ≥1 命中；单面独有锚 = 0；面级语义差 = 0」。逐条对拍属实（我核了 §2.4 表内各锚串确在两面在盘：EN `:131`/`:132`/`:191`、CN `:88`/`:89`/`:90`/`:91`/`:145`）。但锚表是**抽锚**而非全段对拍——W1 的 CN 段含「引用方向只能是批档 → 规范档，不得反向（规范档引批档 = 该档一删就断）」（`docs/core/design/prompts/common.md:145`），其尾句在 §2.4 锚表中无对应 EN 锚；EN 同段对应句为 `(a spec doc that cites a batch record breaks the moment the record is deleted)`（`thincoder-core/prompts/common.md:191`）。两面对拍结论「面级语义差 = 0」在锚表范围内成立，出锚表的尾句**未声明已核**。 | 在 §2.4 补一行声明判据边界（锚表内 = 机判；锚表外散文 = 人工通读，并给出通读结论），或把该尾句补入锚表。 |
| 6 | Affected-file size annotations | 🔵 | §2.6 受影响文件表六行均带当前行数与本批 Δ，两个可核读数（225 ∥ 178）实读相符，产品文本面标「零触」与 §2.8 边界一致。**注**：行数对 `.md` 档按文档面规则不设门（`DOC-DISCIPLINE.md:1462`「文档面行数规则已废除（§3.7 条目 H）——`.md` 档不设行数门」）⇒ 本项无门禁面；仅登记。| 无需改动。 |
| 7 | Scope / 上抛项登记形态 | 🔵 | U1（与在飞链 #1463 的咬合）已明列「本批只登记，不代该链立规矩」并请裁是否入该链 §2 同步项——形态正确。**但**：`DOC-DISCIPLINE.md:1673` A-DD25 AC-1 的机判含「§1 D4 细则二在盘」，而 D4 细则二现体（`DOC-DISCIPLINE.md:54-62`）与 W1 提示词面所用表述（「一次性执行记录」∥「批次档 = 一次性执行记录，必须可随时整体删除」`DOC-DISCIPLINE.md:1194`）同义 ⇒ U1 的咬合面确为真，登记无缺。仅登记。 | 无需改动。 |

### 判据性结论

- W1 —— 双面在盘、语义同义、权威源确在 `DOC-DISCIPLINE.md` §4.5 ①（`DOC-DISCIPLINE.md:1194`）/§1 D4 细则二（`DOC-DISCIPLINE.md:54-56`）**经实读核对成立**（`DOC-DISCIPLINE.md:1186` `### 4.5 批档可删性契约与存量清理工序`）。✅
- W2 —— 双面在盘、三层因果齐、权威源 `CHECKPOINT.md` §2.5 行「git 工具破坏性 action 前 `snapshotBefore`」（`CHECKPOINT.md:82`）**经实读核对成立**。✅
- 实证坐标：`bash.mjs:88`/`:95`/`:96`/`:100` ✓ · `git.mjs:269`/`:295`/`:304`/`:317`/`:334`/`:358` ✓ · `git-ext.mjs:54-57`（`export async function snapshotBefore` 在 `:57`）✓——§2.5 表四行坐标逐一实读相符。✅

**计：🔴 2 · 🟡 3 · 🔵 2**

VERDICT: changes-required

## §4 用户批准（主 agent）

**§4 用户批准（主 agent）**

**批准依据**：用户 2026-10-15 03:39「批档只是批档，执行过了就无意义了，需要长期存在的内容应该在设计和需求文档里，批次档必须是能够随时清理掉的」+ 03:55 一问（git 工具 why）+ 04:44「**直接开办把，你想得挺对，提示词可以加上这个**」（= 审批本条两笔）。

**本笔面 = 轻通道**（提示词补 why · 零新机制）⇒ §5 不适用（无 eng-coder / token 面）；**实施记录见 §6**。

**批准范围** = 本笔两笔全链收口（§1 笔 1 + 笔 2 → 双面落盘 → 走查 → 收口核销）。依据登记 = §1 ∥ §2 ∥ §3。可撤回。

## §5 实施记录（eng-coder）
## §6 验证与收口（父代理）

**§6 验证与收口（父代理 · 2026-10-15）**

**§3 评审 changes-required 的两 🔴 处置（逐条）**

| # | 评审发现 | 处置 | 落点 |
|---|---|---|---|
| **🔴1** | §2.5 边界段称「`clean -f` 未在 `git.mjs` 六调用点内」——**前提失效**（读起来像"clean 无护栏"） | **改述**：加「**但它的快照在 `git-ext.mjs:117`**（`clean` 分支，与 `git.mjs` 六处同机制、同辅助函数 `snapshotBefore`）」 | 本档 `:129` |
| **🔴2** | 提示词 `Set-Location`（**PowerShell 专名**，写进跨平台档） | **改成平台无关表述**（"a shell `cd` / `Set-Location`, or any prefix of that kind"）**+ CN 面补对应段**（原 CN 缺整段） | `thincoder-core/prompts/common.md:132` ∥ `docs/core/design/prompts/common.md:97-100` |

**父侧实施（轻通道 · 父侧直改）**

- **提交** `d8d51ba1`（3 档）：`thincoder-core/prompts/common.md` ∥ `docs/core/design/prompts/common.md` ∥ 本档 `:129`。
- **走查**：EN `:132` 无 `Set-Location` 裸用（改为并列举例）· CN `:97-100` 新增段在盘 · 本档 `:129` 改述在盘。

**核销**

- **#1461**（本批）—— 两笔提示词已落 + 两 🔴 已修 ⇒ **走核销**。
- **本档状态行** ⇒ **已收口**。

**遗留登记（本批未做 · 明写卡点）**

| # | 项 | 卡点 / 解除条件 |
|---|---|---|
| 1 | **CN 面缺少「工具观」三子节**（搜索工具优先级 / 代码库探索顺序 / 并行调用原则）—— EN 有 CN 无 | **发现于本笔走查**（双面对拍）；**解除条件 = 提示词双面对齐批**（已入台账 #1468） |
| 2 | `advisor-design.md` 等 4 档章节数不一致（EN/CN） | 同上（#1468） |
