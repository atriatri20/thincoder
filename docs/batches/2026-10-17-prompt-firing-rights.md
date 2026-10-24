# 2026-10-17 · prompt-firing-rights
> 六段 append-only，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 编制：主 agent · 2026-10-17 · 来源 = 用户 2026-10-17 23:34「提示词发起权口径起这个批」——承 23:31 提问「是不是提示词上有什么需要调整的」；父侧诊断 = 发起权边界（:5-8）与自动推进（:47）相撞、且未定义「整批令算不算发火」。
> 台账 = #1624（core · 归批）。前情 = docs/batches/2026-10-17-ledger-cleanup-light.md §6（已收口 2026-10-17）。
## §1 讨论（主 agent）
**状态行**：已收口（CN 230 ∥ EN 226 两面对齐 · ## 各 17 · 两处 grep 达标 · 冒烟 warnings 0 · 内部评审 pass · fix round 1（空行）已落）
<§1 模板占位：本批条目 / 关键判据 / 授权口径>

**本批条目（2 条）**

| # | 条目 | 判据 |
|---|---|---|
| B1 | 定义「整批令 = 该批内每个子批的发火令」——一次性覆盖整批范围的用户指令，覆盖该批内各子批的评审发火与实施发火 | 定义段在 `docs/core/design/prompts/persona-engineering.md` 发起权边界节内；三语义齐（范围覆盖 ∥ 三终点 ∥ 不豁免批准门） |
| B2 | 推进句与发起权边界去撞：`每步完成 → 自动进入下一步` 改条件式并回指 | 同档推进节首句带条件（有令即续 / 无令即停），且不再与「不得自行发起」相抵 |

**关键判据**：整批令到 **㈠ 范围变更 ㈡ 用户叫停 ㈢ 该批跑完** 三者之一为止；**批外工作仍等新令**；**不豁免批准门**（评审照走、用户批准照要）。

**授权口径（逐字）**：用户 2026-10-17 23:34「「提示词发起权口径」起这个批」= 本批发火；23:36「提示词批你也自动跑完吧」= **本批内各子批（设计修正 ∥ 评审 ∥ 实施 ∥ 收口）的发火令，不逐子批再点头**；23:40「队列里的不如一起全派出去」= 并行派出授权。

**批径**：本批为**文档面批次**（改提示词文本），设计面 = 中文设计文档，实现面 = 英文代码（`thincoder-core/prompts/**`，属产品码面 ⇒ 实施轮走 eng-coder + designToken）。评审对象 = `docs/core/design/prompts/persona-engineering.md` + `docs/core/design/PROMPT-SYSTEM.md`。

## §2 批次任务与设计（eng-designer）
**状态行**：设计完成（评审十号已逐号处置（#1–#4 · #6 · #7 · #9 · #10 本席落地；#5 · #8 父侧）；修正轮补正块见 §2 尾，相抵旧行以补正块为准）
<§2 模板占位：本批条目（覆盖） / 设计档落点 / 机制设计 / 受影响文件与测试覆盖 / 验收对照 / 关键决策 / 上抛项>

**本批条目（覆盖）**
- **B1 · 发起权口径补定义**：整批令 = 该批内每个子批的评审发火令 + 实施发火令；有效期到三者之一（范围变更 / 用户叫停 / 该批跑完）；不豁免批准门；不需逐子批重复「发起」点头。语义出处 = 用户 2026-10-17 23:34 下令（任务书语义骨架）。
- **B2 · 停靠句 D2 单源收正**：「推进与叫停」只留行为面并回指发起权边界，删去无条件的「自动进入下一步」。

**设计档落点**（唯一被改档）
`docs/core/design/prompts/persona-engineering.md`（改前 223 行 → 改后 229 行；`##` 节数 17 → 17）
- `:5-13` §发起权边界：节内新增整批令三段（`:10-13`）——B1。
- `:51-56` §推进与叫停：首句改条件式（`:52-53`）——B2。
- `:149` §交付链收口「用户拍板 ≠ 设计批准」：原样保留（判定不同面，见关键决策）。
- 英文运行面 `thincoder-core/prompts/persona-engineering.md`：本批零改（英文 = 代码，待 coder 轮依中文精确翻译；待同步行见报告）。

**机制设计**
纯文本收正——零新机制、零新节、零机检门。碰撞消解：原「每步完成 → 自动进入下一步」（推进）与「评审 / 实施由用户发起」（发起权）相撞 ⇒ 推进句写成条件式——**有整批令即续，无令即停住**；「谁发起」仍单源在发起权边界节。整批令不豁免批准门：「已授权发起」≠「已批准」。

**受影响文件与测试覆盖**
- 设计档 1 档（上列）；无源码、无需求档、无测试文件。
- 验证 = 文本读数（节数计数 / 行宽 / 回读），纯文档批无单元测试面。

**验收对照**
| # | 判据 | 落地 |
|---|---|---|
| ① | 整批令定义在位，覆盖三语义 | `:10-13`——范围覆盖 `:10-11` / 不豁免批准门 `:13` / 不需逐子批重复发起点头 `:11` |
| ② | 合并判断 + 对照或理由 | 做 1 处（`:51-53`）、不做 1 处（`:149`）；对照与理由见关键决策 |
| ③ | `##` 节数改前 = 改后 | 17 = 17（改造前后各计一次） |
| ④ | 英文面待同步行清单 | `:8` 插入段 / `:47` 首句改条件式 / `:143` 判定无需同步（只点名不改） |
| ⑤ | 改后回读（D6）+ 关键段原文 | 已回读 `:5-13`、`:51-56`；原文见报告 |

**关键决策**
1. **`:149`「用户拍板 ≠ 设计批准」不并、原样保留**：它管「什么算批准」（内容门），与「谁发起」不是同一面；合并会让读者失去「什么算批准」的答案。判断点成立 ⇒ 不同面，保留。
2. **`:51-56` 并**：删去无条件的「自动进入下一步」，改为「评审发起 / 实施启动不自行跨——有整批令即续、无令即停住（口径见发起权边界）」；叫停 / 恢复行为面原样保留。合并后读者仍能分别回答「谁发起」（发起权边界）与「什么算批准」（`:149`）。
3. **拒绝的替代方案**：① 在推进节重述「谁发起」——违反 D2 单源；② 新增独立节——本批不加新节；③ 给 `:149` 加批令例外——会削批准门，超用户授权。
4. **`:119` / `:215` 不动**：两处「设计评审只能由用户发起 / 仍只在用户要求时开火」与新定义自洽（整批令就是用户的要求）。

**发现 / 上抛项**（本批不改，交父侧裁决）
- [知会] 需求层无「整批令」概念：`docs/core/requirements/PORTABILITY.md:71-75`（FR14 推进档位）、`docs/core/requirements/ENGINEERING-MODE-V2.md:315`（不自发起评审）均未定义批令；需求档笔在主 agent，本批按任务书不动。
- [知会] 既有张力先于本批：`PORTABILITY.md:71` auto 档「每步完成即呈现、随即推进下一步」与 persona `:8`「等待用户的明确放行」并存；本批只收提示词面。
- [知会] 第四处停靠密度点：`persona-engineering.md:144`（digest 行）「手动档下结果呈递、进度等用户明确放行」——digest 不是授权仍成立、整批令即用户已给的放行，判不冲突、未改；父侧可裁是否后续收。
- [知会] §1 仍为模板占位（批次档头已载来源与诊断；任务书本身完整，设计不受影响）。
- [知会] 存量行宽超限两处（改后 `:84` 344 字符 / `:98` 486 字符），先于本批；本批新增行 ≤69 字符，未触碰存量。

### §2 修正轮补正（评审 #1–#4 · #6 · #7 · #9 · #10 按号落地；与上方相抵的行以本块为准）

**#1 英文运行面 = 本批实施轮落地（撤回上方「本批零改」口径）**

`thincoder-core/prompts/persona-engineering.md` 列入受影响文件。实施轮 = eng-coder 机械落笔（按 M9 精确翻译回写，非 cp）；本设计轮零笔（产品码面）。

| 档 ∥ 行（改前） | 动作 | 期望 |
|---|---|---|
| `thincoder-core/prompts/persona-engineering.md:8` | 行后插入 4 行 = CN `:10-13` 的精确译文 | 「Firing-rights boundary」节末出现整批令定义；该节 `:5-8` 原 4 行零改 |
| 同档 `:47`（插入后 `:51`） | 首句改条件式 | 「automatically enter the next step」→ 有令即续 / 无令即停，与 `:8` 不再相抵 |
| 同档 `:143`（插入后 `:147`） | 零改（判定无需同步） | 「User's nod ≠ design approval」管批准门，与发起权不同面 |
| 同档其余行 | 零改 | EN 面已单用 fire / firing ⇒ 无 开火 / 发火令 对应词，一名一物零连带 |

行号漂移：`:8` 后插入 4 行 ⇒ 原 `:47` → `:51`、原 `:143` → `:147`；实施轮以落笔后实读为准，回读核对。

**#2 逐字围栏块（一次性材料；收尾比对基线 = 本块 ↔ 落地档）**

CN `docs/core/design/prompts/persona-engineering.md:10-13`（B1 定义段，定稿）：

```text
**整批令 = 覆盖该批每一步发起的用户指令**——"都处理掉 / 全部做完 / 开始吧"（一句话覆盖整批范围）。
用户下这种话，就是该批**每一步**（评审发起 / 实施启动）的发起授权：步与步之间不再停下等用户逐个再发起一次。
整批令到三者之一为止——㈠ 范围变更 ㈡ 用户叫停 ㈢ 该批跑完；批外工作仍等新令。
整批令**不豁免批准门**：评审照走、用户批准照要——**「已授权发起」不等于「已批准」**。
```

CN 同档 `:52-53`（B2 推进句，定稿）：

```text
> 每步完成 → 呈现 → 进入下一步；**评审发起 / 实施启动不自行跨**——有整批令即续，
> 无令即停住（口径见「发起权边界」）。用户叫停时**停下等明确放行再推进**。叫停与把关
```

**译锚（供 EN 轮精确翻译、非造词；形同 `PROMPT-SYSTEM.md:774`）**：整批令 = batch-wide go-ahead · 发起 = fire（EN 存量词：`:5` firing-rights ∥ `:6` fired by the user ∥ `:113` the user fires）· 发起权 = firing rights · 发起授权 = the authority to fire。

**#6 / #7 单位定义与一名一物（本设计轮落 CN 正本）**

- **#6**：「子批」全档无定义，且可被读成「批」⇒ 整批令成同义反复。改用既有的「步」（同档 `:52`「每步完成 → 进入下一步」同单位），并在 `:11` 就地给外延（评审发起 / 实施启动）。三语义不变：范围覆盖 `:10-11` ∥ 三终点 `:12` ∥ 不豁免批准门 `:13`。
- **#7**：三名归一 → **发起**（改后全档 27 处 / 19 行）；`开火`（`:119` / `:215`）与 `发火令`（`:10-11`）全部改称「发起」。EN 面存量即 fire / firing ⇒ 零改（译锚见上）。改后全档 `开火` / `发火` / `子批` = 0 命中（实读）。

**#3 同类先例（坐标 → 对齐 ∥ 偏离 + 理由）**

- `PROMPT-SYSTEM.md:155`（落点默认形态 = 既有节内增列，不新增节 ⇒ 零 `##` 块计数连带）→ **对齐**：两处改动都落既有节（§发起权边界 `:10-13` 增列 ∥ §推进与叫停 `:52-53` 就地改写），`##` 17 ⇒ 17。
- `PROMPT-SYSTEM.md:164`（同类收正批 = 既有条就地改写，紧凑登记、不新开 `§6.x`）→ **对齐**：B2 即就地改写；本批无新机制、无新节，登记走 `:164` 形态，落 `PROMPT-SYSTEM.md:171`（#10）。
- `PROMPT-SYSTEM.md:228`（面级指路句存量 2 处已裁 = 删）→ **有理由的偏离**：`:53`「（口径见「发起权边界」）」不落 `§6.6` 指针禁令——① 指向对象 = 同一提示词文件内的节标题，不是文档（无档名、无 `§` 号 ⇒ `:213` 判据线 ① 不成立）；② 同档同面、运行期整文件装配 ⇒ 目标恒在上下文里，不是运行时死文本；③ 该先例管辖**跨面**指路句（`→ see the engineering-mode prompts`），与同档自指不同形。故保留：不改写、不删。

**#4 勘察证据行（查了什么 ∥ 相关与否）**

- EN 运行面 `thincoder-core/prompts/persona-engineering.md`：**相关**——`:5-8` 发起权节 ∥ `:47` 推进句 ∥ `:143` 批准门；全档 221 行，该概念 EN 侧存量 = fire / firing。
- `docs/core/design/prompts/common.md`：**已查无**——无 发起权 / 整批令 概念（`:106`「自己发起压缩」= 上下文压缩，非同面）。
- `docs/core/design/prompts/discipline-engineering.md`：**相关（同词）**——`:57` 写权行作「发起评审」，与新定名一致。
- `docs/core/design/prompts/persona-eng-designer.md`：**相关（同词）**——`:6`「不发起评审（发起权在主 agent / 用户）」，一致。
- `docs/core/requirements/PORTABILITY.md`：**相关**——`:71` auto 档「随即推进下一步」= 本批碰撞源；`:75` 现载整批令条目（父侧笔，见上抛）。
- `docs/core/requirements/ENGINEERING-MODE-V2.md`：**相关（同词）**——`:315`「不自发起评审」用「发起」。

**#9 记录面残句收正 + 回读读数入行**

- 模板占位行（记录 `:24`；评审记为 `:10`——坐标更正）由本块取代；`batch` 工具仅 append 通道 ⇒ 原行未物理删除，父侧可 file-edit 硬删。
- 验收 ⑤ 读数（改后实读）：`persona-engineering.md` 总行 **229**（改前 229；`##` **17**，节位 5/15/24/32/41/47/51/58/72/80/118/141/153/183/206/217/222 不变）；行宽 `:10` 57 ∥ `:11` 57 ∥ `:12` 42 ∥ `:13` 47 ∥ `:52` 48 ∥ `:53` 45 ∥ `:119` 31 ∥ `:215` 35 字符（均 ≤300）；`PROMPT-SYSTEM.md` 906 → 907 行（新行 `:171`，176 字符）。

**#10 `PROMPT-SYSTEM.md` §6.1 登记**：新行 = `PROMPT-SYSTEM.md:171`「**发起权口径补定义（整批令定义 ∥ 推进句条件化）落 `persona-engineering.md` 两节内**（§发起权边界 节内增列 ∥ §推进与叫停 既有条就地改写 ⇒ 零 `##` 块计数连带；同一概念一律称「发起」〔`开火` ∥ `发火令` 两名归一〕；CN 正本 = 设计轮直落 ∥ EN 代码 = 实施轮按 M9 精确翻译回写）。」——形同 `:164` 紧凑登记：不新增 `§6.x`、不新增 §7 D-PS 行。

**上抛（交父侧）**

- [上抛·知会] 需求档 `docs/core/requirements/PORTABILITY.md:75` 现载整批令条目（git 工作区未提交，父侧本轮落）——仍用「子批 / 发火令」两名，与本轮 CN 正本「步 / 发起」不同名（同一机制两种说法）。需求档笔在父侧，本轮未动；是否对齐请裁。
- [上抛·知会] `PORTABILITY.md:71` auto 档「随即推进下一步」与 persona `:52-53` 条件式仍并存（本批只收提示词面，判据未变）。

## §3 设计评审（评审子代理）

### 轮次 1（评审子代理）

评审对象 = §2 设计（`docs/core/design/prompts/persona-engineering.md` 改动面 ∥ 批次档 §2 记录 ∥ `docs/core/design/PROMPT-SYSTEM.md` 机制面口径）。读数抽检全部对得上：`##` 恰 17（`persona-engineering.md:5/15/24/32/41/47/51/58/72/80/118/141/153/183/206/217/222`）；文件 229 行（末行 `:229` 空行）；新增段 `:10-13`、`:52-53` 在位；`:149` 原样、`:144` digest 行原样；`:84` 恰 344 字符、`:98` 恰 486 字符；本批新增行均 <70 字符。无源码 / 测试档 ⇒ 尺寸注解面按 `.md` 豁免。无 🔴。

| # | Category | Severity | Issue | Suggestion |
|---|----------|----------|-------|------------|
| 1 | Requirements | 🟡 | 英文运行面处置自相矛盾：`:21` 记「英文运行面 … 本批零改（英文 = 代码，待 coder 轮依中文精确翻译）」、`:27` 记「设计档 1 档（上列）；无源码、无需求档、无测试文件」，但 `:36` 验收 ④ 又要求英文面在 `:8` / `:47` 两处改动。运行期槽位 = 英文面（`PROMPT-SYSTEM.md:203`「运行期槽位 = `thincoder-core/prompts/*.md`（16 档）」）⇒ 按现文写法，模型真正读到的那份没有本批改动，B1/B2 属「设计了但未生效」。英文面行号 `:8`/`:47`/`:143` 本评审不可核（英文档不在评审面）—— `unverified`。 | 明确本批实施轮是否落英文面：是 ⇒ 把英文档列入「受影响文件与测试覆盖」并给出逐行动作（档 ∥ 行 ∥ 期望），删掉与验收 ④ 相抵的「本批零改」；否 ⇒ 把该欠账落一条台账行（携 trigger 与到期条件），别让第二条路径停在「待 coder 轮」。 |
| 2 | Methodology | 🟡 | 缺逐字围栏块：提示词落地点通例是「逐字文本 = 设计围栏块」（`PROMPT-SYSTEM.md:296`、并在 `:259` / `:275` / `:334` / `:388` / `:449` / `:559` / `:646` 同形复用），且批次收尾的一次性比对以它为基线（`:172`「**落地档 ↔ 当批设计围栏块**（逐行）」）。本批记录无围栏块 ⇒ 英文落地轮与收尾核对都没有独立基线（唯一基线 = 已落的 CN 文本本身，自指）。 | 补该批逐字围栏块（`:10-13` / `:52-53` 原样）；或显式声明偏离——「本批基线 = 已落 CN 档」并写明收尾核对以何为准、为何可比。 |
| 3 | Methodology | 🟡 | 无 closest-precedent 行：§2 有「关键决策 / 拒绝的替代方案」（`:39-43`），但无先例坐标 ∥ 对齐或偏离理由，也无「无先例」的显式声明。与本笔直接相关、却未被点名的先例至少三处：默认落点形态「**既有节内增列**（不新增节 ⇒ 零 `##` 块计数连带）」（`PROMPT-SYSTEM.md:155`）；同类收正批的登记先例「既有条就地改写」（`:164`）；指针处置先例「存量 2 处已裁 = **删**」（`:228`）——后者正对新增的 `persona-engineering.md:53`「（口径见「发起权边界」）」（全档唯一一处此形）。 | 补一行 closest-precedent：列上述坐标，逐条给对齐 ∥ 偏离理由；对 `:53` 的档内互指写明为何不落 `§6.6` 指针禁令（目标在同一提示词内、运行时自足）或改掉它。 |
| 4 | Methodology | 🟡 | 无 survey-evidence 行：记录里没有「查了哪些公共源文档 ∥ 是否相关」的读数；该项在本项目已成义务——`PROMPT-SYSTEM.md:168`「**跨仓勘察义务三句落四处**（… ∥ 核查〔设计评审标准第 10 条〕…）」· D-PS37（`:824`）。`:46-48` 的 [知会] 说明需求档被翻过，但不是作为「已勘察」被记录的。 | 补一行 survey-evidence（查了哪些 ∥ 相关与否 ∥ 无则「已查无」），至少覆盖：英文运行面、同族提示词档（`common.md` / `discipline-engineering.md` / `persona-eng-designer.md`）、被引用的两份需求档。 |
| 5 | Document ownership | 🟡 | 新授权概念在提示词层以上无归属：**:46** 自报「需求层无「整批令」概念：`docs/core/requirements/PORTABILITY.md:71-75`（FR14 推进档位）、`docs/core/requirements/ENGINEERING-MODE-V2.md:315`（不自发起评审）均未定义批令」；**:47** 又报 `PORTABILITY.md:71` auto 档「每步完成即呈现、随即推进下一步」与提示词 `:8` 并存。两条叠起来 = 同一「推进 / 发起」机制在两处规则不同（需求层 auto 档 ∥ 提示词新增条件式 `:52-53`），记录只停在 [知会]，无裁定。 | 给一条落地结论而非观察：要么在拥有该主题的需求档登记「整批令」并把 auto 档措辞对齐；要么写明需求层有意滞后及其理由与触发条件。判定结果留档，别只留「发现」。 |
| 6 | Clarity | 🟡 | 「子批」是新造且无定义的单位：`:10`「整批令 = 该批内每个子批的发火令。」与 `:11` 按其立法，但全档无定义，批次模型里也没有对应物（`:73`「一批 = 一个交付目标 + 一组同批条目 + 一份批次档」——单位是 批 / 条目 / 轮）。读者可把「子批」读成「批」，那样「整批令」就成同义反复；也可读成「条目」，两种读法给的行为不同。 | 定死这个单位（或以既有的 批 / 条目 / 轮 表述替代），使该句无需推断即可判定。 |
| 7 | Clarity | 🔵 | 同一概念三名并存：发起（`:6` / `:8` / `:119`）、开火（`:119` 用户开火 / `:215`）、发火令（`:10-11` / `:52`），与命名纪律「同一个东西在所有面只用一个名——文档词 = 界面词 = 对话词，1:1」（`PROMPT-SYSTEM.md:420`）相抵；且新造词无英文译锚——先例 `PROMPT-SYSTEM.md:774`「**译锚**：压缩线 = compaction line（与 `context` 报面同词——口径单源）」。英文面「机械落笔」（`:152`）因此被迫自行造词。 | 全档归一到「一个说法」，并给出存活新词的英文对应（译锚），使英文轮是翻译而非造词。 |
| 8 | Records | 🟡 | §1 仍是模板骨架（`:6` 状态行 `🔄 进行中（…）` · `:7` `<§1 模板占位：本批条目 / 关键判据 / 授权口径>`），而 §2 已「设计完成」。本批主题正是「授权口径」，授权依据却只活在档头编制行（`:3`「父侧诊断 = 发起权边界（:5-8）与自动推进（:47）相撞、且未定义「整批令算不算发火」」）。 | 填 §1 的本批条目 / 关键判据 / 授权口径——把用户一次性指令的原文范围与失效条件写在该段，使「凭什么改了授权条款」在记录里可查。 |
| 9 | Records | 🔵 | 记录面残句：§2 自身模板占位行 `:10` 留在已成文的节里；验收 ⑤（`:37`「已回读 `:5-13`、`:51-56`；原文见报告」）把证据指向「报告」，而报告不在记录内。 | 删已消费的占位行；把回读读数（行数 / `##` 计数 / 新增行宽）直接落进验收行，使该条能从记录本身复核。 |
| 10 | Document ownership | 🔵 | `PROMPT-SYSTEM.md` §6.1「行为纪律面的落点形态」索引未登记本笔（先例 `:164` 以一行紧凑登记「既有条就地改写」类改动），而 §2 声明「唯一被改档」只到一个文件 ⇒ 索引落后于已落实例。 | 在 §6.1 落点形态清单补一行紧凑登记（节内增列 ∥ 既有条改写 ∥ 零 `##` 块计数连带），或写明无需登记的理由。 |

计数：🔴 0 · 🟡 7 · 🔵 3。
VERDICT: pass

## §4 用户批准（主 agent）
## §5 实施记录（eng-coder）

**状态行**：实施完成（审计 1 轮 + 代码评审 1 轮均 pass；fix round 1（父侧裁补空行）已落地，终态 clean）

**交付摘要**：唯一被改档 = `thincoder-core/prompts/persona-engineering.md`（英文运行面 / 产品码面）。`##` 节数 17 ⇒ 17 零连带；改前 221 行 → 改后 225 行（+4）。

- `:10-13` 新增 4 行 = 设计档 CN `:10-13` 的精确译文（整批令 = batch-wide go-ahead 译锚照用）。
- `:51`（改前 `:47`）首句改条件式：`automatically enter the next step` → `enter the next step; **review firing / implementation starts are never self-crossed** — with the go-ahead, continue; without one, hold (see the Firing-rights boundary);`，自 `when the user calls a stop` 起逐字未动。
- 零改实读核对：`:5-8`（发起权节原 4 行）∥ `:123`（原 `:119`）∥ `:147`（原 `:143`）∥ `:219`（原 `:215`）均与改前副本逐字一致。

**改后英文定稿（逐行）**

```text
**A batch-wide go-ahead = a user instruction covering the firing of every step in that batch** — "handle it all / do it all / go ahead" (one sentence covering the batch's whole scope).
When the user says this, it is the authority to fire **every step** in that batch (review firing / implementation starts): between steps you no longer stop and wait for the user to fire each one again.
The go-ahead lasts until one of three things — ㈠ the scope changes ㈡ the user calls a stop ㈢ the batch runs to completion; work outside the batch still waits for a new go-ahead.
The go-ahead **does not exempt the approval gate**: the review still runs, the user's approval is still required — **"authorized to fire" is not "approved"**.
```

```text
> Each step completes → present → enter the next step; **review firing / implementation starts are never self-crossed** — with the go-ahead, continue; without one, hold (see the Firing-rights boundary); when the user calls a stop, **stop and wait for an explicit go before advancing**. Stop-and-check
```

**决策透明表**

| 决策 | 落法 | 依据 / 取舍 |
|---|---|---|
| 「整批令」全称只落定义行（`:10`），重复处用 `the go-ahead` 回指（`:12` / `:13` / `:51`） | 接受验收 ③（`grep -c "batch-wide go-ahead"` = 1）⇒ 全称单次出现；英文避免长名词短语逐句复读，所指同一概念、四句语义无失 | 若父侧要全称逐句重复，需同步放宽 ③ |
| `:51` 保留分号形态（`…boundary); when the user calls a stop`） | 分号 + 小写 ⇒ 自 `when the user calls a stop` 起逐字未动 | 任务书「其后分句与 `:48-50` 零改」优先于句号 + 首字母大写的排版偏好 |
| 插入点 = `:9` 空行之后（块尾与 `## Identity:` 之间无空行） | 照任务书验收 ①（+4）执行，不自行加空行 | 补空行 = 226 行，违反验收 ①/④；已披露，留父侧裁 |
| 跨节回指 `(see the Firing-rights boundary)` 保留 | 保留 | 设计 §2 #3 已裁：同档同面自指，不落 §6.6 跨面指针禁令 |

**中英对位表**

| 中文（设计档） | 英文（运行面） |
|---|---|
| `:10` **整批令 = 覆盖该批每一步发起的用户指令**——"都处理掉 / 全部做完 / 开始吧"（一句话覆盖整批范围）。 | `:10` **A batch-wide go-ahead = a user instruction covering the firing of every step in that batch** — "handle it all / do it all / go ahead" (one sentence covering the batch's whole scope). |
| `:11` 用户下这种话，就是该批**每一步**（评审发起 / 实施启动）的发起授权：步与步之间不再停下等用户逐个再发起一次。 | `:11` When the user says this, it is the authority to fire **every step** in that batch (review firing / implementation starts): between steps you no longer stop and wait for the user to fire each one again. |
| `:12` 整批令到三者之一为止——㈠ 范围变更 ㈡ 用户叫停 ㈢ 该批跑完；批外工作仍等新令。 | `:12` The go-ahead lasts until one of three things — ㈠ the scope changes ㈡ the user calls a stop ㈢ the batch runs to completion; work outside the batch still waits for a new go-ahead. |
| `:13` 整批令**不豁免批准门**：评审照走、用户批准照要——**「已授权发起」不等于「已批准」**。 | `:13` The go-ahead **does not exempt the approval gate**: the review still runs, the user's approval is still required — **"authorized to fire" is not "approved"**. |
| `:52-53` 每步完成 → 呈现 → 进入下一步；**评审发起 / 实施启动不自行跨**——有整批令即续，无令即停住（口径见「发起权边界」）。用户叫停时**停下等明确放行再推进**。 | `:51` Each step completes → present → enter the next step; **review firing / implementation starts are never self-crossed** — with the go-ahead, continue; without one, hold (see the Firing-rights boundary); when the user calls a stop, **stop and wait for an explicit go before advancing**. |

**自证读数**

- 行数（`split('\n')`；read 同值）：221 → **225**（+4）。
- `##` 计数：**17 → 17**（改后节位 5/14/23/31/40/46/50/56/70/79/116/139/151/182/206/214/219；除首节外各较改前 +4；标题文本逐条一致）。
- `grep "batch-wide go-ahead"` = **1 行**（`:10`）；`grep "automatically enter the next step"` = **0**。
- 改前/改后逐行比对（改前副本 = `.thincoder/tmp/firing-rights-before-persona-engineering.md`，221 行）：插入块之外**只有** `:47 → :51` 一行变化；其余 220 行逐字一致。
- `git diff --numstat -- thincoder-core/prompts/persona-engineering.md` = `6 2` = 本批 4 插入 + 1 行改写，另 1 行 = 改前既存 uncommitted 变更（`:141` In-flight token recovery，非本批）。
- 运行面冒烟（实跑）：`assemblePrompt('engineering')` 装载成功（warnings 0），prompt 含 `batch-wide go-ahead` / `self-crossed`，不含 `automatically enter the next step`（prompt length 115852）。

**审计与代码评审轮次与终态**

- 内部探索审计（read-only，1 轮）：四类偏差 **0**（部分实现 0 / 静默简化 0 / 文档漂移 0 / 清单外改动 0）；五项验收读数复测全绿，中英逐句对位无失。
- 内部 advisor 代码评审（type=code，1 轮）：**VERDICT pass**，🔴 0 / 🟡 0 / 🔵 1——插入块末尾（`:13`）与 `## Identity:`（`:14`）之间缺空行（全档其余 16 个 `##` 均前接空行，CN 结构亦然；无机械后果：`loadSlot` 为裸 `readFileSync`，ATX 标题仍解析）。
- fix round：**0**。该 🔵 未改：补空行 ⇒ 226 行，与验收 ①（221 → 225 = +4）直接冲突，留父侧裁（可另起一行形态修正）。
- **终态**：`clean`。

### 修正轮（父侧裁：补空行 —— fix round 1）

**父侧裁定**：空行问题裁 = 补。理由 = 该档其余 16 个 `##` 前均接空行，插入段是唯一例外；形态不一致会让读者以为「这里特殊」，而它并不特殊。

- **改动**：`thincoder-core/prompts/persona-engineering.md:14` 新增一个空行——仅插入在原 `:13`（四条译文末行）与原 `:14` `## Identity: …` 之间；其余行逐字未动（`-U0` 全档 diff 复核：本批仅三处 hunk = 4 行定义块 + 1 空行 ∥ 1 行改写 ∥ 改前既存 uncommitted 一行）。
- **行数**：225 → **226**（验收 ① 由「221 → 225 = +4」改「221 → 226 = +5」）。
- **`git diff --numstat`**：`6 2` → **`7 2`**（本批 4 行插入 + 1 空行 + 1 行改写；另 1 删 1 增 = 改前既存 uncommitted 变更 `:146` In-flight token recovery，非本批）。相对改前副本（221 行）合计 = 新增 7 行 / 删除 2 行。
- **回读读数（改后实读）**：总行 **226**；`##` 计数 **17**（不变；节位 5/15/24/32/41/47/51/57/71/80/117/140/152/183/207/215/220——插入点之后各 +1）；`grep -c "batch-wide go-ahead"` = **1**、`grep -c "automatically enter the next step"` = **0**（均不变）；`:13` → `:14` 空行（长度 0、无空白字符）→ `:15` `## Identity:`，恰一个空行。
- **冒烟复跑**：`assemblePrompt('engineering')` 装载成功，warnings **0**（`[]`）；prompt length 115852 → **115853**（+1 = 新增空行）；prompt 含 `batch-wide go-ahead` / `self-crossed`，不含 `automatically enter the next step`；装配文本内 `…is not "approved".` 与 `## Identity:` 之间确为空行。
- **范围自查**：只动本档一个空行；中文设计档 / 需求档 / 其它 prompt 档本轮零笔。
- **终态**：`clean`（fix round 1 落地，六项验收全绿）。

**相抵说明**：上方 `:160`（改后 225 行 / +4）、`:200-201`（行数 225 ∥ 节位 5/14/23/…）、`:204`（numstat `6 2`）、`:205`（prompt length 115852）、`:211`（fix round 0）的读数已被本块取代，以本块为准；其余内容（译文定稿、中英对位、`##` 17 不变）仍有效。全档 17 个 `##` 现均前接空行（机检：无标题缺空行）。

## §6 验证与收口（父代理）

**验证与收口（父侧 · 2026-10-17 23:5x）**

**实施**：`eng-coder#103`（英文面）+ `#111`（fix round 1 补空行）。

**父侧亲跑读数**：

| 档 | 行数 | `##` | 结构 |
|---|---|---|---|
| `docs/core/design/prompts/persona-engineering.md`（CN 正本） | **230** | **17** | `:10-13` 四条定义 · `:14` 空行 · `:15` `## 身份宣言` |
| `thincoder-core/prompts/persona-engineering.md`（EN 运行面） | **226** | **17** | `:10-13` 四条定义 · `:14` 空行 · `:15` `## Identity` |

`grep`：`batch-wide go-ahead` = **1**（定义行）· `automatically enter the next step` = **0**（旧句已撤）。
冒烟：`assemblePrompt('engineering')` 装载成功、`warnings = []`、length 115853。

**三词归一（父侧笔）**：`persona-engineering.md` 全文 `子批` / `开火` / `发火` = **0**；`发起` **19 行**；`discipline-normal.md` 括注移出正文 + advisor 注入形态；`PROMPT-SYSTEM.md:171` 登记「同一概念一律称『发起』」。

**内部评审**：`eng-coder#103` 自跑 advisor（type=code）**pass**（🔴 0 / 🟡 0 / 🔵 1）——🔵 = 插入段缺空行，父侧裁「补」，已由 `#111` 落地并复核。

**已知残留（非本批）**：工作区有大量 pre-existing uncommitted 变更（`git status` 未提交）；本批写面 = 两档 prompt + 本档。

**收口**：`#1624` 核销；本档冻结。
