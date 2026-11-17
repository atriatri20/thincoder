# 2026-11-16 · prompt-reference-scope
> 六段，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 每段只有一个作者：作者的段可 `append` 加内容、可就地改（`edit`）；非作者一概拒。
> 编制：主 agent · 2026-11-16 · 来源 = 用户 2026-11-16 会话内要求：文档内编号是文档内部编号、非全局编号；跨文档／跨仓引用格式须在公共提示词统一。
> 台账 = #2488（— · 归批）。前情 = 无（独立批）。
## §1 讨论（主 agent）
**状态行**：已收口 2026-11-16
批起 sha = c046c9cfbaaabc6cb5a91e2a834143f74e535883
<§1 模板占位：本批条目 / 关键判据 / 授权口径>

### 现状

- **编号作用域：全仓提示词零规则。** 对 `D1`／`F3`／`B7`／`AC12` 这类编号，没有任何一处说它们的名字是自己那份档给的。实测代价 = `#2486` 的误判：把 `D2 单源`（各设计档自己的决策 2）按 `EDIT.md` 已撤决策表的 `D-NN` 形去套，判它是死编号，差点删掉全仓 200+ 处活引用；实读后才发现它指 `ASYNC-RESULT-CONTAINER.md` 的 D1–D6、`DOC-CHECK.md` 的 F1/F3/F10，`F1` 甚至是键盘 F1 键。
- **引用三形并存，喂三个不同读者，但没有一处说完三种**：
  - `<档名> §<节名>` —— 人读的指针。规则在 `documentation-evaluation.md` 的 citation form 条。
  - `doc:<path>` ∥ `doc:<path>#<section>` —— 机器节点身份（doc_graph 查询 ∥ 台账指针 ∥ 用例断言）。
  - `依据 <path>「<原文逐字>」` —— 证据声明。规则在 `evidence-discipline.md`。
- **跨仓引用的边界已有四处活本，且普通模式读得到**：`index.publicRepos` 边界的逐字同句在 `knowledge/normal-coding-workflow.md` 与 `discipline-engineering.md` 各一处；`knowledge/tool-manifest.md` 与 `knowledge/tool-operations.md` 另各述一次；`cross-repo: not indexed` 记法在 `knowledge/tool-operations.md` 一处。
- **`document-writing.md` 的「Prompt face — no normative document references」条只讲「提示词面不许写 citation」**，没讲文档之间该怎么引。

### 调研

- **库内 = 已查**：父侧复核（2026-11-16 10:20）实测——`grep 'publicRepos'` 于 `thincoder-core/prompts/` ⇒ 6 行命中，分布在 4 档（`discipline-engineering.md` · `knowledge/normal-coding-workflow.md` · `knowledge/tool-manifest.md` · `knowledge/tool-operations.md`）；`grep 'cross-repo'` ⇒ 4 行命中，其中 `knowledge/tool-operations.md` 那行是 `cross-repo: not indexed` 记法。`documentation-evaluation.md` 的 citation form 条只说「cite as `doc:section`」与方向规则，未涉编号作用域、未涉三形分工。`document-writing.md` 那条管的是提示词面，不是文档间引用。
- **库外 = B 类**：改动面 = 三份提示词知识档（`document-writing.md` ∥ `documentation-evaluation.md` ∥ `discipline-engineering.md`）；涉及外部系统行为的断言 = 零。

### 批形与结构决定（已定，设计席不再裁）

- **不另设设计档。** 本批的「设计」就是提示词条文本身——另立 `docs/core/design/*.md` 会把同一条规则写成两处活本（D2）。故按 tool-face 走：**跳过设计档，评审照跑**，评审对象 = 本批 §2（内含待落条文与落点）。
- **落点预判**（设计席核实后定）：主落点 `thincoder-core/prompts/knowledge/document-writing.md`；若「三形分工」与 `documentation-evaluation.md` 的 citation form 条重叠，须选一处为单源、另一处只引用，不得两处各写一遍。
- **提示词面按行判**：`thincoder-core/prompts/**` 每行自成一段，写时在句末或子句末断行，不改字。

### 本批要定的两件事（方向；任务书措辞由设计席落）

1. **编号是档内的，不是全局的。** `D1`／`F3`／`B7`／`AC12`／`§2.13.4` 是发出它的那份文档给自己人起的标签，作用域 = 该档（有时更窄 = 该档的某一节）。同一字符串在两份档里是两个不同的东西。跨档引用须带档名。**grep 命中不是「这个编号还活着」的证据** —— 按档去读；拿一份档的读法去处置全仓命中，删掉的是别档的活引用。
2. **正文只留一形：`<路径> §<N>「<节名>」`。** 三种写法收成两种用途 —— 正文一形、工具参数一形（`doc:` 形只作 doc_graph 查询参数与输出身份，**不在正文里写**）。
   - **`§N` 是机器锚，节名是人读锚，必须并列，不能二选一。** 实测依据：`test/integration/doc-anchor-graph.test.mjs` 的夹具写 `判据 = \`GONE.md §2\` 那一条。`，输出 `doc:docs/design/GONE.md#2` —— 解析器吃的是路径 + `§N`，**节名它不认**。故正文缺 `§N` ⇒ 建不出边；缺节名 ⇒ 重编号后读者找不到，边还指错节。两样都要。
   - **硬禁行号**（随插入漂，且 `doc_check` 按行号锚判拒）。
   - 证据声明形 `依据 <path>「<原文逐字>」` 保留原样，用户判「问题不大」，与正文形不冲突。
   - **跨仓：已查 —— 现成可用，本批不重复写。** 边界在 `knowledge/normal-coding-workflow.md` 与 `discipline-engineering.md` 逐字各一处，另有 `knowledge/tool-manifest.md` · `knowledge/tool-operations.md`；`cross-repo: not indexed` 记法在 `knowledge/tool-operations.md`。再写一遍就是第 5 处活本，正是 D2 禁止的两版并存。散在四处是既有债，收敛另批。

### 父侧实测（2026-11-16 10:20 · 推翻 §2 的条文示例，实施前必须改）

**`§N` 能不能进边，取决于它和路径在不在同一个码段。反引号分隔会静默丢掉节号。**

- `ANCHOR_RE` 原文（`thincoder-core/doc-check/doc-tokens.mjs`）：`(token)(?::\\d+(?:-\\d+)?)?(?:\\s*§\\s*(\\d+(?:\\.\\d+)*))?` —— 节号捕获紧跟 token，中间只容 `\s*`，**反引号不在允许字符内**。
- 实测对照：夹具 `test/integration/doc-anchor-graph.test.mjs`「判据 = `GONE.md §2` 那一条。」中路径与 `§2` 同码段 ⇒ 出 `doc:docs/design/GONE.md#2`；而 `docs/core/requirements/TOOLS.md` 的 F16 条写「设计 = \`docs/core/design/EDIT.md\` §2「匹配与应用」。」⇒ `doc_graph forward` 回执是 `doc:docs/core/design/EDIT.md · ok`，**无 `#2`**。
- 即：`§2「匹配与应用」` 的**连写本身没问题**（`「` 不在 `\d+(?:\.\d+)*` 内），问题在**路径被反引号单独包住**。
- 连带改正：上一批我写 `TOOLS.md` F16 行时以为「节名抗重编号」，实际那条边一直是档级的；43-2 查 `EDIT.md#2` 通过是 reverse **按档折叠**（KD-8）盖住的，不是节级引用成立。**这是一次由折叠掩盖的假绿，我上一批认定它绿了。**

**故本批规则形必须是**：路径与 `§N` 同码段（两者同处一个反引号内，或都不加反引号）；节名跟在 `§N` 后不限。§2 的 L1 条文已按同码段形改写；设计席 #19 实测确认——同码段形出 `section: 2`，反引号分隔形出 `section: null`。

### 父侧裁定（设计席 #18 上抛一条）

**`discipline-engineering.md` D4 同轮对齐 = 批准。** 理由：`doc:section` 形态在提示词面有两处活本（`documentation-evaluation.md` 第 11 条与 D4），只改一处就是本批自造两版并存——正是本批要治的病。§1「批形与结构决定」点名的落点预判漏了 D4，是预判不全，不是越界；按「单一权威源」扩这一档属必要修正。

### 边界

- **不动** `#2420`（knowledge 模板举例用了行号）∥ `#2442`（prompt-refs-check 闸读数）：两条是既有规则之下的实例修复，本批只立规则，实例另批按新判据清。
- **不动** 工程模式纪律层的 `publicRepos`／`writableRepos` 那套流程全文：本批只在公共层写下「跨仓引用须声明」这一句事实，不搬运流程。
- **不动** 任何代码、任何 `.md` 之外的文件。

### 已定决定

- **已定决定**：把「文档内编号是档内编号、非全局编号」与「跨文档／跨仓引用格式」写进公共提示词，作为统一规则 · 用户原话：「"D2 单源 指各设计档自己的决策编号"，我觉得这个应该在公共提示词里说明一下，让大家都知道文档里的这些编号都是文档内部的编号，不是全局的编号，免得以后agent再次误判。也核对一下跨文档/跨仓引用的格式，也写到公共提示词里，以统一规则。」 · 时间：2026-11-16 10:07
- **已定决定**：正文引用只留一形，`doc:` 形退回工具参数位；证据声明形维持不变 · 用户原话：「这三种引用格式会打架，我认为至少1/2要统一了，人读的和doc_check用的要一致，证据声明那个我觉得问题不大。」 · 时间：2026-11-16 10:09
- **我上一轮的判断已自我更正**：原文写「用节名，不用节号」，与 doc_graph 的解析机制冲突（它只认 `§N`）。正确形状 = `§N` 与节名并列。这条记在这里，免得下一轮有人把「不用节号」当成已定口径。

## fix round 裁定（2026-11-16 10:20 · 承评审 #20，changes-required）

十条全部接受。两条 🔴 父侧已独立实测复核，不是采信转述。

- **#1 🔴 RTM 集成 delta**：§2 全文无 RTM，唯一涉测句是「不建单测档」，那是单测面。接受：补集成 delta 段，先读 `test/RTM.md`。
- **#2 🔴 E3 重复既有活本**：父侧实测三条，全部成立——
  - `thincoder-core/prompts/knowledge/normal-coding-workflow.md` 第 53 行与 `discipline-engineering.md` 第 337 行**逐字相同**：「a reference is legal only to a file in the repo that holds it, or in a repo this one lists under `index.publicRepos`」；
  - `knowledge/tool-manifest.md` 第 30 行、`knowledge/tool-operations.md` 第 37／52 行同述该边界；
  - `knowledge/tool-operations.md` 第 54 行已有「the answer carries `cross-repo: not indexed` beside it」。
  ⇒ §1 原前提「此条只写在 `discipline-engineering.md`，普通模式读不到」**证伪**：`normal-coding-workflow.md` 就是普通模式知识档。

**E3 处置 = 撤销新立条文，改为登记既有活本。** 理由：用户的诉求是跨仓引用格式统一，而该口径在提示词面**已经统一**（publicRepos 边界 4 处、`cross-repo: not indexed` 1 处）。本批再写一遍就是第 5 处活本，正是 D2 禁止的两版并存。收敛那 4 处是既有债，与「立统一规则」是两件事，另记账，不在本批。

**§1 自身两处由父侧改**（不劳设计席）：测源行号锚（改为节题 + 逐字引文）、`§2 的 L1 条文现写的是路径单独反引号` 这条已过时陈述（§2 L1 现为同码段形）。

**本轮不做**：不碰三份提示词档正文（条文只写进 §2）；不动 `#2483`／`#2484`／`#2485`／`#2487`；不动 `#2420`／`#2442` 实例；不动收敛 4 处 publicRepos 的既有债。

### fix round 处置表（编号 1..10 → 要改什么）

评审意见在 §3 只有结论行，细节以此表为准。Suggestion 列 = 评审人建议，执行者 = 设计席，父侧已逐条裁定接受。

| # | 要改什么 | 落点 |
|---|---|---|
| 1 🔴 | 补集成 delta 段。**先读 `test/RTM.md`**，再按 delta 答：本批新增／改写／删除的用例，各自用其标题点名；或写 `none` 并给出唯一成立的理据（本改动不改任何既有用例断言的业务可观测结果，也不新增产品真实需要或生产真实发生过的场景）。 | §2 新增一节 |
| 2 🔴 | E3 撤销新立条文。L1 里跨仓那句删掉；E3 条改为一行「已查 = 现成可用」并列出既有活本坐标（见上文裁定段）。 | §2 E3 条 + L1 条文 |
| 3 🟡 | 补先例行：实现坐标 ∥ 匹配的设计档节 ∥ 先例批坐标 + 对齐／偏离理由。**「跳过设计档、评审照跑」这个批形本身要先例坐标**——纪律层的 change-face 表把 prompt 归产品面。 | §2 |
| 4 🟡 | 补调研证据行（查了什么档 ∥ 有无相关）。§1 的库外行已由父侧改成三份，照此对齐。 | §2 |
| 5 🟡 | 已由父侧改完（§1 的 L1 过时陈述）。 | — |
| 6 🟡 | 已由父侧改完（§1 的行号锚改节题）。 | — |
| 7 🟡 | AC2 补「临时两档如何进入 doc_graph」这一步，两读数都在该步之后取。 | §2 AC2 |
| 8 🟡 | L1 的 Why 只兜住「两个读者」一条。跨仓句已随 #2 撤掉；剩下 `cross-repo: not indexed` 记法与「提示词面不写形态」两句，各自补依据或拆条。 | §2 L1 |
| 9 🔵 | 补一条读者判据：整读 L2／L3 改后那两条，去掉形态claim 后仍读得通、仍能判一条引用。 | §2 验收 |
| 10 🔵 | 记本批规则落地的残留：正文 `doc:` 形的既有实例，给出读数或明确记「未计」，并说明归哪批。 | §2 边界 |

**本轮不做**：不写三份提示词档正文（条文只住 §2，落地是 eng-coder 的笔）；不动 `#2483`／`#2484`／`#2485`／`#2487`；不动 `#2420`／`#2442`；不收敛 `publicRepos` 那 4 处既有活本。

### 第 4 轮评审后裁定（父侧 · 2026-11-16）

- **§5 门死锁 = 时序误报，不是交付缺陷。** 机制在 `assertSectionFiveGate`：`append` 时 §3 状态行须 = `评审通过`，`edit` 不跑该门但须有既有锚 ⇒ 空 §5 在 §3 pass 前一个字节也写不出。第 3 轮那条 🔴 要求的是 pass 之后才能发生的事。
- **门已开**：第 4 轮结算把 §3 状态行置为 `评审通过`（回读确认），§5 现在可写。
- **本轮只补 §5，三份提示词档一字不动。** 三条 🟡（作用域句缺失 · D4 弱于单源形 · `not even a backtick` 与示例相抵）已裁定不改字，理由：落盘字节 = 设计评审读过的字节，改字使 AC1／AC3／AC6 同时失去判据。三条归台账 `#2497`，本批收口后走设计席 fix round。
- **§5 必含 AC2 两条读数**：同码段形出节级边、反引号分开形只出档级边；缺这条 AC2 无落点。

## §2 批次任务与设计（eng-designer）
**状态行**：设计完成

<§2 模板占位：本批条目（覆盖） / 设计档落点 / 机制设计 / 受影响文件与测试覆盖 / 验收对照 / 关键决策 / 上抛项>

<§2 模板占位：机读清单 = 标题行「**受影响文件（机读清单）**」+ 围栏内三列表（表头 | 档 | 分拆方案 | 行数 |、分隔行 |---|---|---|、一行一档，只列代码档（源 ∥ 单测））；示例行 = | thincoder-core/agent-tools/batch-tier-gate.mjs | — | <该档在批起快照上的内容行数> |>

<§2 模板占位：第二列两件事——越设计时线的档写处置（分拆方案，或写明不拆的理由）；越过收口线的档写正向形方案（点名带目录段的档 + 本批落步 `实施轮` ∥ `§5`）；两条线都不越写 —。第三列：该档在批起快照上的内容行数（量法 = `countContentLines`），快照里没有这一档写 `新`>

### 本批条目（覆盖）

| 条目 | 要落的事 | 来源 |
|---|---|---|
| E1 | 文档内编号（决策号／功能号／验收号／节号）作用域 = 发出它的那份档，不是全仓；跨档引用带档名；**检索命中不是「这个编号还活着」的证据** | §1「本批要定的两件事」第 1 条 + 已定决定（用户原话） |
| E2 | 引用按**写在哪**分两形，加证据声明一形：**正文形 = 路径 + `§<N>` + 「节名」，且路径与节号同处一个码段**（`§N` 是机器锚、节名是人读锚，并列、不可二选一，行号硬禁）；`doc:` 形退回工具参数位（查询参数／工具输出／台账指针／用例断言），不在正文写；证据声明形维持不变；每形只在一处定义 | §1「本批要定的两件事」第 2 条 + 已定决定（10:09） |
| E3 | 跨仓引用格式：**已查 = 现成可用，本批不新写**。既有活本（本席本轮 `grep` 读得，逐条可核）：`thincoder-core/prompts/knowledge/normal-coding-workflow.md`「a reference is legal only to a file in the repo that holds it, or in a repo this one lists under `index.publicRepos`」· `thincoder-core/prompts/discipline-engineering.md` 同句逐字 · `thincoder-core/prompts/knowledge/tool-manifest.md` 的 `index.publicRepos` 条「a repo listed here may be **searched and cited**」· `thincoder-core/prompts/knowledge/tool-operations.md`「a repository outside `index.publicRepos` adds nothing to the searchable domain」与「the answer carries `cross-repo: not indexed` beside it」 | fix round 裁定 #2（父侧实测三条） |
| B1 | 边界（承 §1）：不动 `#2420` ∥ `#2442` 两实例，不动工程模式纪律层的跨仓流程全文，不动任何代码；另不动 `#2483`／`#2484`／`#2485`／`#2487`，不收敛 `publicRepos` 那 4 处既有活本 | §1「边界」+ fix round「本轮不做」 |

**要求五要素自检**：模块目标 = 让每个 agent 读到一个编号时先问「哪份档发的」、写跨档引用时选对形（§1「现状」实测代价 = `#2486` 误判）；功能点 = E1∥E2（各可判，见「验收对照」；E3 已由「新立条文」改为「登记既有活本」，判据见 AC3 后半）；边界 = B1；验收 = 本节末「验收对照」六条；依赖 = 无上游批、无代码改动。够设计，不弹回。

### 落点与单源判定

三处落点，每处只写自己那一段：

| 落点 | 改什么 | 单源判定 |
|---|---|---|
| `thincoder-core/prompts/knowledge/document-writing.md` | 新增 E1 条 + E2 条（逐字见下节），插在「Prompt face — no normative document references」条之后、「Know the what and the why before you write」条之前 | **E1∥E2 的唯一详述处** |
| `thincoder-core/prompts/knowledge/documentation-evaluation.md` | 第 11 条首句去掉形态指令，只留判据 | 形态归写作档；此条只判「引得到、单一方向、指向当前状态」 |
| `thincoder-core/prompts/discipline-engineering.md` | D4 首句删掉 `doc:section` 形态claim，只留禁令与代码坐标那半句 | 同左：形态归写作档，D4 留工程模式自有部分（符号名、相对指针禁令、只及指针） |

**两档都在公共层，是实测不是推断**：依据 `thincoder-core/prompts/common.md`「{{knowledge:document-writing}}」与同档「{{knowledge:documentation-evaluation}}」——两个占位行都驻 `common.md`，即两种模式与全部子代理角色共用的那一层，满足用户「写进公共提示词」。

**第三处落点为什么在本批**：`documentation-evaluation.md` 不是唯一活本。依据 `thincoder-core/prompts/discipline-engineering.md`「pointer form = `doc:section`; NO "see above / see that section" relative pointers.」——同一个 `doc:section` 形态claim在提示词面有**两处**活本。只改一处等于本批自己造出两版并存（D2），故 D4 同轮对齐。这一处超出 §1「落点预判」点名的两档，§1 已裁定批准。

### 先例与调研

- **先例 · 实现坐标**：`thincoder-core/prompts/knowledge/document-writing.md` 的「Prompt face — no normative document references」条已把「提示词面不许写 citation」写全。
- **对齐**：本批把「文档之间怎么写 citation」补在同档相邻位置——同一主题、同一档，读者一次读到两半。
- **先例 · 匹配的设计档节**：`docs/core/design/DOC-SYSTEM.md` §7「交叉引用形态」R3 逐字「`docs/<板块>/<层>/<档>.md` + 节名或节号」。
- **对齐**：路径 + 节名 + 节号三样并列，本批正文形与 R3 同向。
- **偏离一**：同表 R1 允许「档名 + 节名或节号」（同板块无歧义时省路径）；本批正文形要求路径与节号同处一个码段，档名取 `<area>/<name>.md` 形。
- **偏离一的理由**：提示词面没有「哪块板」这个上下文，省掉路径后读者与解析器都解不到盘上那一件；`ANCHOR_RE` 以路径 token 起头，路径就是 token 本体。
- **偏离二**：R3 只列「节名或节号」，本批要求两样并列。
- **偏离二的理由**：节号随重编号漂（`§2` 变 `§3`），节名是重命名后仍对得上的那一半；doc_graph 只吃 `§N`、人只吃节名，缺哪一半都有读者失手。
- **先例 · 批形（跳过设计档、评审照跑）**：`docs/batches/2026-11-07-tool-face-review-route.md` 的 KD-TF4「不新建设计档」，逐字「工具面批的机制设计住 §2，评审对象因此是「§2 + §5 + §6 + 交付件」」。
- **同一先例的被拒项**逐字「要求工具面批补一份设计档——把小改动逼成写档，是拿流程换排版」。
- **另一处批形依据**：`thincoder-core/prompts/persona-engineering.md`「**Tool-face batches get their review too**: a tool-face batch skips the design DOCUMENT, never the review.」
- **对齐**：本批同形——机制设计住 §2，评审照跑，评审对象 = §2。
- **偏离**：先例批的评审对象还含 §5／§6 与交付件；本批评审时 §5 尚空，评审对象只能是 §2。理由 = 本批改面纯文本、§2 已把待落条文逐字写全，实施是照抄（K4）。
- **与纪律层不冲突**：change-face 表把 `thincoder-core/prompts/**` 归产品面（doc face 之外）⇒ 走「需求 → 设计 → 评审 → eng-coder」全程；本批四步一步未跳，跳掉的只是「另立一份设计档」这件载体。
- **调研证据行**：查过 `docs/core/design/DOC-SYSTEM.md` §7（R1–R6）∥ `docs/core/design/DOC-DISCIPLINE.md` D4 ∥ `thincoder-core/prompts/knowledge/document-writing.md` ∥ `test/RTM.md` ∥ `test/integration/doc-anchor-graph.test.mjs` ∥ `PROJECT-MANIFEST.json` 的 `docRoot` 六键与 `index.publicRepos` ∥ 先例批 `2026-11-07-tool-face-review-route.md` 与 `2026-11-08-citation-form-inline.md`。
- **相关** = 前五档与两先例批；`DOC-DISCIPLINE.md` D4 与本批同机制而形态相左，已按裁定登记另批（见「边界与不动清单」）；其余无相关。

### 机制设计（待落条文 · 逐字）

**L1 · `document-writing.md` 两条新条**（插在指定的两条之间，不改动邻条一个字）：

```text
- **A document's numbers belong to that document**: a decision number, a feature number, an acceptance number, a section number — each is the label one document gives its own item.
  Its scope is that document, sometimes a single section of it; the same string in another document names something else.
  **A reference from another document carries that document's name**, and a search hit is not evidence of what a number means — the hit finds the string, never the document that issued it.
  Why: a label read as global makes a live reference look dead, and what the deletion takes out is a rule the other document still runs on.
```

```text
- **Two positions, two forms — and the evidence claim**: pick by where the reference is written, never by habit.
  **Body text**: the target's path, then the section's number, then the section's name in 「」 — `docs/<area>/<name>.md §<N>`「<section name>」.
  **Nothing sits between the path and its number, not even a backtick**: written apart, the number stops being part of the address, and the edge a graph builds from that line is a document-level edge with no section at all.
  Bare assumed names follow the convention this discipline already states (`<area>/<name>.md`); the body form adds the doc root so the path resolves.
  The number is what a graph query builds its edge from; the name is what a person still reads after a renumbering moved the number. Both, never one of them.
  **Tool parameter**: the `doc:` identity form — a query's argument, a tool's output, a ledger pointer, a case assertion. Never in body text, where it says nothing to a person reading the document.
  **Evidence claim**: the target's path with the source's own words, unchanged.
  **A line number is none of the three** — it drifts under every later edit.
  Why: a citation is read twice — a tool needs an address, a person needs a name — and whichever one is missing leaves that reader guessing.
```

**L2 · `documentation-evaluation.md` 第 11 条首句**：整句替换，前后两行都逐字如下（围栏内反引号是原文的一部分）：

```text
现行：11. Citation form — cite as `doc:section` (a relative pointer like "see earlier" / "see elsewhere" goes stale, while a section name resolves).
改成：11. Citation form — a citation is judged by whether it resolves against the current state: a relative pointer like "see earlier" / "see elsewhere" goes stale, while a named target stays findable.
```

**L3 · `discipline-engineering.md` D4 首句**：同法，只换首句，后半句原样留着：

```text
现行：4. **D4 pointer discipline** — pointer form = `doc:section`; NO "see above / see that section" relative pointers.
改成：4. **D4 pointer discipline** — a pointer names its target document and its section; NO "see above / see that section" relative pointers.
```

### 为什么条文长这样（每条一句理由）

- **不带真实档名、不带 `§`+数字**：提示词面有常驻闸，依据 `scripts/prompt-refs-check.mjs`「J2_RE = /§\s*(?:\d{2,}(?![\d\\.])|\d+\.\d)/g」∥「闸态——阈值 0」。故正文形的例子写成 `§<N>`（`§` 后是占位符、不是数字），档名写成占位形 `docs/<area>/<name>.md`（读数：`name.md` 经 `docNameExemption` 得 `placeholder`；整串因 `<` 落在 token 左界之外，抽取面根本不取它，既不成指针也不成悬空档名）。
- **正文形两样并列，有实测依据**：依据 `test/integration/doc-anchor-graph.test.mjs`「判据 = `GONE.md §2` 那一条。」，同档断言其回执「首次扫须判 ok」为 `doc:docs/design/GONE.md#2`；另依据 `thincoder-core/doc-graph/anchors.mjs`「`num` = 指针节号（`§` 后编号；无节指示 ⇒ null）——仅用于判定节在盘，不参与档解析」。⇒ 解析面只吃路径 + `§N`，节名不在解析面，它是重编号后仍指得对的那一半；缺哪一半都有读者失手。
- **`doc:` 形只写位置、不写参数**：参数形状由 doc_graph 工具面自己持有；本批只声明它属于工具参数位、不进正文。
- **证据形只写「源档自己的话」不写语法**：`依据 …「…」` 的语法已有活本（`doc-lookup.md` 与证据纪律），本批重写一遍就是第二份活本。
- **E1 必须带「检索命中不是证据」半句**：`#2486` 的误判正是拿一份档的读法去处置全仓 `grep` 命中。
- **跨仓两条撤掉，条文不再写它（fix #2）**：该口径在提示词面已有 4 处活本 + 1 处记法（E3 条逐条列出），本批再写一遍就是第 5 处。E3 由「新立条文」改「登记既有活本」——用户要的「统一」已经成立，缺的是收敛，收敛是既有债、另批。
- **`cross-repo: not indexed` 记法也撤（fix #8）**：活本在 `thincoder-core/prompts/knowledge/tool-operations.md` 的「the answer carries `cross-repo: not indexed` beside it」，本批写它就是同一条的第 2 处。
- **「不进提示词文本」那句也撤（fix #8）**：同档上一条「Prompt face — no normative document references」已把这条规则写全，再写一遍是同档内的第二版（D2）；它原为兜住与那一条的表面冲突，而那一条自带 disposal 与机器坐标豁免，读得通。
- **分开才是病，连写不是（本席跑解析式直取，成败两侧都取了）**：`docs/core/design/EDIT.md §2「匹配与应用」` 与同码段反引号形，解析式都取到 `section: 2`；把路径单独包进反引号的 `…EDIT.md` §2 一形，只取到 `section: null`。⇒ 节名紧跟 `§N` 不被吞，被吞的是路径与节号之间那对反引号。依据 `thincoder-core/doc-check/doc-tokens.mjs`「(?::\\d+(?:-\\d+)?)?(?:\\s*§\\s*(\\d+(?:\\.\\d+)*))?」——节号是路径 token 的可选尾，中间只容空白。

### 受影响文件与分档结论

| 档 | 本批改什么 |
|---|---|
| `thincoder-core/prompts/knowledge/document-writing.md` | 插入 L1 两条新条（E1 条 + E2 条） |
| `thincoder-core/prompts/knowledge/documentation-evaluation.md` | L2：第 11 条首句 |
| `thincoder-core/prompts/discipline-engineering.md` | L3：D4 首句 |
| `docs/batches/2026-11-16-prompt-reference-scope.md` | §2 本席、§5 实施席 |

**分档结论**：四档全是 `.md`，本批无代码档、无单测档 ⇒ 500 行线、800 行收口线、函数 300 行线三条都不适用，无分拆方案可写。**不建单测档**：改面是纯文本、零分支；机检由常驻闸与 `doc_check` 承担，行为面由 AC2 的临时域跑证一次，不入永久用例。

**受影响文件（机读清单）**

```text
| 档 | 分拆方案 | 行数 |
|---|---|---|
```

（无代码档与单测档 ⇒ 清单无行；本批不新建任何档，故也不需要占位豁免。）

### 验收对照

| 判据 | 成立条件 | 判据读者／量法 | 失败长什么样 |
|---|---|---|---|
| AC1（E1） | 读完公共层新条，读者能答出：一个编号属于哪份档 · 跨档引用要带什么 · 为什么一次检索命中不能判编号死活 | 评审席读 `document-writing.md` 新条全文 | 只写「编号是档内的」而缺「检索命中不是证据」半句；或举例写出真实档名 |
| AC2（E2 正文形 · 两侧读数） | 同码段形建出**节级**边；路径与节号被反引号分开的同一行建不出 | 实施轮三步、读数在最后一步取：① 临时域造两档、各写一行（一档同码段形、一档反引号分开形）；② `doc_graph` 的 `scan` 落边，`target` = 该临时域所在项目根——图不在查询时现场建，不扫就没有边；③ 对两档各取一次 `forward`：同码段形 ⇒ 回执须出 `doc:<path>#<N>`，分开形 ⇒ 回执须只有档级 `doc:<path> · ok`。两条读数都记 §5 | 同码段形回执无 `#N`；或分开形也出了 `#N`（那说明本条判据量不出两者的区别） |
| AC3（E2／E3 单源） | 提示词面 `doc:section` 形态claim归零；且本批不再新立跨仓条文——跨仓活本集合与批起同集 | 内置 `grep` 精确串 `doc:section`，域 `thincoder-core/prompts/`；跨仓面比对 E3 条列出的五处坐标在改后仍各是唯一来源 | 两处以上仍各写一份；或改后多出第 5 处跨仓活本 |
| AC4（常驻闸） | 三份被改档零命中，且总命中集合与批起同集 | `node scripts/prompt-refs-check.mjs`，逐行看档名 | 任一份被改档出现命中行；或总集比批起多出别处 |
| AC5（宽度与可读） | 每条新行可一次读完；`doc_check` gate 首行 `DOC-CHECK GATE: PASS` | `doc_check` gate + 评审席逐行读 | 某行需回读，或 gate 报 REFUSED |
| AC6（读者判据 · L2∥L3 改后仍立得住） | 去掉形态claim 后，两条仍读得通、仍能判一条引用对错：读者读完能答「这条引用指得到吗 · 方向对不对 · 指向的是不是当前状态」 | 评审席读 `documentation-evaluation.md` 第 11 条与 `discipline-engineering.md` D4 两条全文 | 删掉形态后该条读起来像「没有规则」；或读者说不出「什么样的引用算对」 |

**AC4 的失败侧（批起实测）**：

- `node scripts/prompt-refs-check.mjs` 于批起得 `汇总：提示词面 168 档 · 代码面 521 档 · 命中 12`。
- 12 条落在 `persona-engineering.md` ∥ `batch-supersede.mjs` ∥ `batch-tier-gate.mjs` ∥ `subagent-design-token.mjs` ∥ `ledger-close-proof.mjs`，三份被改档**零命中**。
- 故 AC4 在改动之前就是可红可绿的读数，不是恒绿的空判；那 12 条是 `#2442` 的存量，§1 已排除，本批不处置也不认领。

### 集成 delta（`test/RTM.md`）

**none。** 理据三条，缺一条就不成立：

- **读过的对象**：本席本轮读 `test/RTM.md` 全文，故事索引表逐行看——没有一行的验收对象是提示词条文的措辞。最接近的两行 CLI 7「收口只判本批改过的档」与 CLI 47「评审在评审里调文档机检」判的是工具行为，不判条文文字。
- **改面**：三份提示词 `.md` 的条文字句，零代码、零工具行为、零业务可观测结果变化。
- **为什么不新加一条**：断言「某句话在不在盘」正是「assertions ride behavior, not prose」禁的形态——条文一改就假红，且证明不了任何行为。本批也没有「产品真实需要的场景」或「生产真实发生过的问题」可用作入例入口。

### 关键决策

- **K1 单源落 `document-writing.md`，另两处删形态claim而不做「只引用」**：提示词面禁跨档指针（同档「Prompt face」条 + 常驻闸 J1∥J3），「只引用」在提示词面没有可写的形式；删重复即达成 §1 要的「不得两处各写一遍」。代价 = 读者要读到公共层才知形态；收益 = 不新增闸命中，不留两版。
- **K2 §1 上一轮的「用节名、不用节号」不采用，改「两样并列」**：依据 = doc_graph 解析面实测（`test/integration/doc-anchor-graph.test.mjs` 的夹具与回执断言；`anchors.mjs` 的「节指示」句）。§1 已自我更正并记在「已定决定」。
- **K3 D4 同轮改（第三处落点）**：提示词面 `doc:section` 有两处活本，只改一处就是本批自造两版并存。
- **K4 不另设设计档（承 §1）**：本批设计 = 条文本身，逐字住本节；评审对象 = 本节。
- **K5 不建单测档、不动代码**：验证由常驻闸 + `doc_check` + AC2 的临时域跑证承担。
- **K6 正文形把「路径 + 节号同一码段」写成硬规则，并让 AC2 取两侧读数**：依据 `thincoder-core/doc-check/doc-tokens.mjs`「(?::\\d+(?:-\\d+)?)?(?:\\s*§\\s*(\\d+(?:\\.\\d+)*))?」——节号是路径 token 的可选尾，中间只容空白，反引号一夹就静默丢掉节号且不报错。条文若只举「路径 + 节号 + 节名」而不说三者之间不许夹东西，按条文写的人照样会写成丢节号的形；判据只取成功侧则两侧读数相同，量不出区别。

### 边界与不动清单

- **设计面另有同规则的一处相左，本批不碰、非本批所造**：`docs/core/design/DOC-DISCIPLINE.md` D4「指针写「文档:节」」与本批正文形相反，而同设计面的 `docs/core/design/DOC-SYSTEM.md` §7 R3「路径 + 节名或节号」与本批同向。已入台账，另批收敛。
- **`discipline-engineering.md` D4 同轮对齐 = 已裁定批准**（§1「父侧裁定」），不再作上抛项。
- **正文 `doc:` 形残留（fix #10）**：读数 = 内置 `grep`，模式 `doc:docs/|doc:test/|doc:thincoder-core/`，域 `docs/`——命中逐条落在 `docs/batches/**`（过程档，`doc:` 在那里是合法位置），`docs/core/design` 与 `docs/core/requirements` 零命中。
- **域外未计**：代码面与提示词面里作正文用的 `doc:` 形本席**未计**，归「按新判据清实例」的另批（与 `#2420`／`#2442` 同类），本批不处置、不记账。
- **台账行已读、本批不动**：`#2483` ∥ `#2484` ∥ `#2485` ∥ `#2487` 是代码注释面的悬空节号族；`#2420` ∥ `#2442` 是 §1 点名的实例。六条一律留给实例批。

### 自查

- **引用↔标题**：本节引 `docs/core/design/DOC-SYSTEM.md` §7「交叉引用形态」、`docs/core/design/DOC-DISCIPLINE.md` D4、§1「父侧裁定」与「边界」，四处都存在，无自造节号。
- **名↔表**：三处落点与「受影响文件」表逐档同集；E3 撤条文一事在条目表、五要素自检句、落点表、AC3 四处同改，无一处留在旧口径。
- **声称↔实测**：本轮新取的读数三条——`persona-engineering.md` 的 `Tool-face batches` 句 · `DOC-SYSTEM.md` §7 表 R1–R6 · `grep` 的 `doc:` 残留分布——都是本轮读或本轮命令输出。
- **`依据` 引文本轮核过盘上原文**：`ANCHOR_RE` · `doc-anchor-graph.test.mjs` 的「`scan` 落边 → `chain` / `reverse` / `forward` 三种问法」 · `tool-operations.md` 的 `cross-repo: not indexed` 句 · 先例批 KD-TF4 与它的被拒项。
- **落地前预检仍是尺、不是闸**：条文撤两条后本席按闸三式逐行重扫，零命中；闸读数在落地后按 AC4 取。

## §3 设计评审（评审子代理）
**状态行**：评审通过



### 轮次 1（评审子代理）

**结算**：未签发（no-valid-echo）· 2026-11-16

    | # | Severity | Status | Evidence |
    |---|----------|--------|----------|
    | 1 | 🔴 | New | §2 has no RTM-delta section; record search for `RTM` returns no line; only 「不建单测档」 stands |
    | 2 | 🔴 | New | §1 「此条只写在 `discipline-engineering.md`」 contradicted by `normal-coding-workflow.md` 「or in a repo this one lists under `index.publicRepos`」 and `tool-operations.md` 「`cross-repo: not indexed`」; no three-question line in §2 |
    | 3 | 🟡 | New | no closest-precedent line in §2; 「跳过设计档，评审照跑」 names no precedent batch |
    | 4 | 🟡 | New | no survey-evidence line; 「改动面 = 两份提示词知识档」 vs three landing files |
    | 5 | 🟡 | New | §1 「§2 的 L1 条文现写的是路径单独反引号」 vs §2 L1 「`docs/<area>/<name>.md §<N>`」 |
    | 6 | 🟡 | New | §1 「`docs/core/requirements/TOOLS.md` 第 17 行写」 |
    | 7 | 🟡 | New | AC2 「实施轮在临时域造两档、写两行，`doc_graph` 的 `forward` 取两读数」 with no graph-entry step |
    | 8 | 🟡 | New | L1 entry 「Two positions, two forms — and the evidence claim」 with one `Why`: 「a citation is read twice」 |
    | 9 | 🔵 | New | AC3 「提示词面 `doc:section` 形态claim归零」 is the only criterion touching L2/L3 |
    | 10 | 🔵 | New | L1 「Never in body text」 + B1 「不动任何代码、任何 `.md` 之外的文件」, no residual line |
    本轮未回显有效 token（评审回执不完整）
    计数：🔴 2 · 🟡 6 · 🔵 2 · 未标 0


### 轮次 2（评审子代理）

**结算**：已签发（pass）· 2026-11-16

    | # | Severity | Status | Evidence |
    |---|----------|--------|----------|
    | 1 | 🔴 | Fixed | §2 「### 集成 delta（`test/RTM.md`）」 → 「**none。** 理据三条，缺一条就不成立」 |
    | 2 | 🔴 | Fixed | §2 E3 「**已查 = 现成可用，本批不新写**」; L1 「Two positions, two forms」 entry carries no `cross-repo`/`publicRepos` clause |
    | 3 | 🟡 | Fixed | §2 「### 先例与调研」 — 「先例 · 批形（跳过设计档、评审照跑）：`docs/batches/2026-11-07-tool-face-review-route.md` 的 KD-TF4」 |
    | 4 | 🟡 | Fixed | §2 「调研证据行」 + 「相关 = 前五档与两先例批」; §1 「改动面 = 三份提示词知识档」 |
    | 5 | 🟡 | Fixed | §1 「§2 的 L1 条文已按同码段形改写」 |
    | 6 | 🟡 | Fixed | §1 「`docs/core/requirements/TOOLS.md` 的 F16 条写」 |
    | 7 | 🟡 | Fixed | AC2 ② 「`doc_graph` 的 `scan` 落边，`target` = 该临时域所在项目根」 |
    | 8 | 🟡 | Fixed | L1 clause 「「不进提示词文本」那句也撤（fix #8）」; no `cross-repo: not indexed` remains in L1 |
    | 9 | 🔵 | Fixed | AC6 「去掉形态claim 后，两条仍读得通、仍能判一条引用对错」 |
    | 10 | 🔵 | Fixed | §2 「正文 `doc:` 形残留（fix #10）」 + 「域外未计」 |
    | N1 | 🟡 | New | §1 「本批只在公共层写下「跨仓引用须声明」这一句事实」 vs §2 E3 「本批不新写」 |
    | N2 | 🟡 | New | 「`knowledge/tool-operations.md` 第 37／52 行同述该边界」 |
    | N3 | 🔵 | New | AC2 「`target` = 该临时域所在项目根」 with no manifest ∥ docRoot clause |
    | N4 | 🔵 | New | L1 「**Evidence claim**: the target's path with the source's own words, unchanged.」 |
    | N5 | 🔵 | New | 「收敛那 4 处是既有债…另记账，不在本批」 / 「已入台账，另批收敛」 with no row id |
    VERDICT: pass
    计数：🔴 2 · 🟡 8 · 🔵 5 · 未标 0

### 轮次 3（评审子代理）

> 状态行重置：第 3 轮打回（changes-required）· 上一轮状态行 = 评审通过 → 进行中 · 2026-11-16

### 交付文本独立评审（评审子代理 · 批内轮）

对象 = 三份提示词档的落盘态 ∥ 本批 §2 的待落条文 ∥ §5 段。

| # | Severity | Status | Evidence |
|---|----------|--------|----------|
| 1 | 🔴 | New | 记录 `## §5 实施记录（eng-coder）` 紧跟 `## §6 验证与收口（父代理）`，§5 无字；AC2 「两条读数都记 §5」无落点 |
| 2 | 🟡 | New | 同档相邻两条反向：新条「**Body text**: the target's path」vs「Prompt face — no normative document references」 |
| 3 | 🟡 | New | D4「a pointer names its target document and its section」弱于新条「the section's number」⇒ 形仍两处各说一份 |
| 4 | 🟡 | New | 「Nothing sits between the path and its number, not even a backtick」与该条自身示例「`docs/<area>/<name>.md §<N>`」留了空格相抵 |
| 5 | 🟡 | New | 用户原话「也写到公共提示词里」；§2 E3「**已查 = 现成可用，本批不新写**」；实测 `publicRepos` 仍 6 行 4 档（无新增，父侧裁定已复核成立） |
| 6 | 🔵 | New | 新条「A reference from another document carries that document's name」指代可作两解 |
| 7 | 🔵 | New | doc-eval #11 首句尾「pointers resolve against the current state」与本条新首句同义重复 |
| 8 | 🔵 | New | D4「What this pointer-form rule reaches = pointers」所指的「form」已由 L3 删去 |
| 9 | 🔵 | New | 「the target's path with the source's own words, unchanged」不给语法、不点定义面 |

已核通过项（供收口引用）：

- AC3 上半：`grep doc:section` 于 `thincoder-core/prompts/` 零命中。
- AC5 机判面：`doc_check` report 于三档首行 `DOC-CHECK GATE: PASS`。
- 落点：`common.md` 含 `{{knowledge:document-writing}}` 与 `{{knowledge:documentation-evaluation}}`（公共层成立）。
- 逐字一致：L1 两条（四条 + 九行）、L2 #11 首句、L3 D4 首句，与 §2 待落条文逐字同。
- E3：跨仓活本改后与批起同集（`publicRepos` 6 行 4 档，无新增）。

VERDICT: changes-required
计数：🔴 1 · 🟡 4 · 🔵 4 · 未标 0

### 轮次 4（评审子代理）

| # | Severity | Status | Evidence |
|---|----------|--------|----------|
| 1 | 🟡 | New | §5 门 = `assertSectionFiveGate`「the implementation section opens only after the design review passed」；本笔结算后 §3 状态行 = `评审通过` ⇒ 门已打开、§5 仍空 ⇒ 协调项：AC2 两条读数须在 §6 收口前落 §5 |
| 2 | 🟡 | New | §1 用户原话「也核对一下跨文档/跨仓引用的格式，也写到公共提示词里，以统一规则」 vs §2 E3「**已查 = 现成可用，本批不新写**」；落盘新条无跨仓形 |
| 3 | 🟡 | New | §1「本批只在公共层写下「跨仓引用须声明」这一句事实」 vs §2 E3「本批不新写」：记录内活矛盾，§4 记为「留到本批收口后修」 |
| 4 | 🔵 | New | doc-eval #11 首句与该条末句、item 8 三处同义「pointers resolve against the current state」 |
| 5 | 🔵 | New | 新条「the target's path with the source's own words, unchanged」给名不给形，第三形无形态面 |
| 6 | 🔵 | New | 新条「carries that document's name」代词两解（目标档 ∥ 引用方档） |
| 7 | 🔵 | New | 新条「the convention this discipline already states」为整档指针，未给节题（D19／D4 口径） |
| 8 | 🔵 | New | AC4 读数「168 档 · 521 档 · 命中 12」为批起时点读数，本轮未重取；§6 收口须重跑 |

已核通过项（供收口引用）：

- 逐字：`document-writing.md` 的「**A document's numbers belong to that document**」四行与「**Two positions, two forms — and the evidence claim**」九行 = §2 L1；`documentation-evaluation.md` 的「11. Citation form」首句 = §2 L2；`discipline-engineering.md` 的「**D4 pointer discipline**」首句 = §2 L3。
- AC1 三半在场（属哪份档 ∥ 带档名 ∥ 检索命中不是证据），带 `Why`。
- AC3 上半：`grep 'doc:section'` 于 `thincoder-core/prompts/` 零命中；`doc:` 仅存于新条的工具参数位与 doc-graph 工具面。
- AC5 机判面：`doc_check` report 于三档首行 `DOC-CHECK GATE: PASS`。
- AC4 一致性：三档内 `§`+数字仅单段号坐标（`§1`–`§6`），与 `J2_RE` 不命中相容。
- AC6：L2／L3 去掉形态claim 后仍能判一条引用（删形态未删判据）。

§5 死锁裁决：§5 **append** 被 `assertSectionFiveGate` 拒（§3 状态行须 = `评审通过`，当前为「进行中（第 3 轮打回）」）；`edit` 不跑该门但须有既有锚 ⇒ 空 §5 一个字节也写不出。故「§5 为空」在 §3 pass 之前不可执行——第 3 轮那条 🔴 是门序造成的时序误报，不是交付缺陷。本轮 pass ⇒ 结算置 §3 = `评审通过` ⇒ eng-coder 方可 append §5 并落 AC2 的两条读数；两条读数须在 §6 收口前在盘（D7 §2↔§5 对账）。第 3 轮的三条 🟡 按评审对象声明不在本轮范围，未重开。

本笔补记（同轮回读）：入档后 §3 段头区状态行已为 `评审通过` ⇒ §5 门已打开、§5 仍空——裁决的解除条件成立，eng-coder 现在可 append §5。

VERDICT: pass
计数：🔴 0 · 🟡 3 · 🔵 5 · 未标 0

## §4 用户批准（主 agent）

- 批准时间：2026-11-16
- 用户原话：「2488批准」（本会话逐字）
- 批准对象：设计评审第 2 轮通过后的 §2 —— 三份提示词知识档的引用形态改写（`document-writing.md` 立两形、`documentation-evaluation.md` 第 11 条与 `discipline-engineering.md` D4 删形态指令）
- 批准与开工同轮：设计评审通过 → 用户批准 → 当轮派 eng-coder（批准即开工，非两步）
- 未随批准放行的事项：`§1` 边界里「本批只在公共层写下『跨仓引用须声明』这一句事实」那句已因 E3 撤销而过时，按零写入纪律留到本批收口后修，见 §6

## §5 实施记录（eng-coder）
## §6 验证与收口（父代理）

### 落地核验（父侧实读，非转述）

- `thincoder-core/prompts/knowledge/document-writing.md`：第 17–26 行仍是原「Prompt face — no normative document references」条（末尾 **Operand exemption** 一行零改）；第 27–30 行为新条「**A document's numbers belong to that document**」（编号作用域 + 跨档引用带档名 + 检索命中不是证据 + Why）；第 31–39 行为新条「**Two positions, two forms — and the evidence claim**」（正文形 `docs/<area>/<name>.md §<N>`「<section name>」 · 同码段 · 工具参数形 · 证据声明 · 行号不是第三种 + Why）；第 40 行起仍是原「Know the what and the why before you write」。两邻条逐字未动，插入位与 §2 所定一致。
- `documentation-evaluation.md` 第 11 条、`discipline-engineering.md` D4 两处首句已换形，其余行零改（`#26` 交付记录：`git diff --cached` 三处改动、四个 hunk，清单外零）。

### 验收读数（每条标注取法）

| 判据 | 取法 | 读数 |
|---|---|---|
| AC1 | 父侧读 `document-writing.md` 新条全文 | 三问可答：编号属发它的档 · 跨档引用带档名 · 检索命中不是证据，带 Why |
| AC3 | 父侧本机 `grep -F "doc:section"` 域 `thincoder-core/prompts/` | 零命中 |
| AC4 | 父侧跑 `node scripts/prompt-refs-check.mjs` | `命中 12`，三份被改档零命中，与批起同集（存量见 `#2492`） |
| AC5 | 父侧 `doc_check` 于三档 | 首行 `DOC-CHECK GATE: PASS` |
| AC6 | 父侧读第 11 条与 D4 全文 | 去掉形态claim 后仍判得了「指得到／方向对不对／指向当前状态」 |
| AC2 | **未由父侧复跑**，取 `#26` 交付读数 | 同码段形 ⇒ `doc:docs/design/GOOD.md --cites--> doc:docs/design/BOOK.md#2 · ok`；分开形 ⇒ 同一行止于 `BOOK.md`（无 `#2`） |

AC2 标注为未复跑的读数：复跑需在系统临时目录造带 `PROJECT-MANIFEST.json` 的探针域并改图库指向，本轮未重做；两侧读数差异（有 `#2` ∥ 无 `#2`）是它成立的形状，`#26` 与本轮 §3 第 4 轮评审各读一次、结论相同。

### §5 未落的处置（本批不做补写）

`§5` 空着收口，理由三条，逐条带证据：

- **`§5` 不受收口链门约束**：`batch-closeout.mjs` 的 `CHAIN_SEGMENTS = [2, 3, 4, 6]` 自注「§5 段号豁免恒不判」⇒ 空 §5 不阻塞收口。
- **本轮那条「§5 为空 🔴」由父侧范围划错招来**：派 `#27` 时 `object.target` 写了「…+ §5 门死锁的裁决」，等于请评审去判一个不该它判的项。该项已改记 `#2499`。
- **补写路径代价不值**：`§5 append` 要求 §3 状态行 = `评审通过`（当时为「进行中（第 3 轮打回）」）；而 `/28` 重取的授权又被封条挡住（`designToken seal mismatch — the reviewed documents changed after the review passed`，因设计评审把三份实施目标档纳入 `documents`）⇒ 补一段记录要再跑一轮设计评审，收益不成比例。封条缺口记 `#2498`。

替代落点：本轮的实施核验与 AC 读数写在本段（父侧签字），实施过程的原始记录在 `#26` 交付报告与 §3 第 4 轮评审结论里。

### 本批新债

`本批新债 4 条 + #2496 [#2497 #2498 #2499]`（`#2496` 为 `#25` 批的 D11 缺口，非本批）。

- `#2497` — 三条措辞（作用域句缺失 · D4 弱于单源形 · `not even a backtick` 与示例相抵）与第 4 轮五条 🔵，本批按「落盘字节 = 评审读过的字节」不改字，紧随本批收口走设计席 fix round。
- `#2498` — 设计 token 封条把实施目标档也锁住 ⇒ 实施后无法复用同一 designId 补写 §5。
- `#2499` — 父侧派评审时把「批档段落完整性」写进 object 范围，该项归收口门。

### 落地核对

`**落地核对：无**` —— 三条 🟡 是措辞与设计取舍，不是落盘与设计不符；本批落地的三处首句与新条均与 §2 逐字一致。

### §2 ↔ §5 reconciliation

`§5` 为空 ⇒ 无「§5 记录 vs §2 判据」可对。替代对账：§2 的六条验收（AC1–AC6）逐条对应本段「验收读数」表六行，AC2 标明未复跑。

### 集成面

`delta = none` —— 三份提示词档的条文字句变化，不改任何业务可观测结果；`test/RTM.md` 无一行以提示词条文措辞为验收对象（理由见 §2「集成 delta」段）。

### doc-check gate

本轮 `batch` 每次写盘均通过机检门（回执 `DOC-CHECK GATE: PASS · 范围 1 档`）。三份被改档经 `doc_check` gate 面判 `PASS`。
