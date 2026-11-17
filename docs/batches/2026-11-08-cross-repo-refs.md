# 2026-11-08 · 跨仓引用
> 六段，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 每段只有一个作者：作者的段可 `append` 加内容、可就地改（`edit`）；非作者一概拒。
> 编制：主 agent · 2026-11-08 · 来源 = 用户 2026-11-08 09:15–09:22 四条决定（逐字摘录见台账 `#2171` 的 evidence）：① 检索与引用是同一需求，不拆两套；② 不引入 base/app 角色位；③ 被引用的仓就该能被检索；④ 就按是否在 `index.publicRepos` 里声明判，方向由此机判。另加 09:22 一条：「`crossRepoOf` ∥ `crossRepoNote` 这个退役吧，其实并没有真的使用，多一个分叉的名称多一层用户困惑。」。
> 台账 = #2171（core · 归批）。前情 = 无（独立批）。
## §1 讨论（主 agent）
**状态行**：已收口 2026-11-08
<§1 模板占位：本批条目 / 关键判据 / 授权口径>

**本批治什么**：跨仓引用现在没有可机检的方向规则。要做的事 = 让「本仓能引用谁」由 `index.publicRepos` 声明，并让违者被拒。

**用户定的四条（2026-11-08 09:15–09:22）**：

- **检索与引用是同一件事**——`publicRepos` 不拆成两套许可；一个键两种用途是设计意图。
- **不引入 base/app 角色位**——应用与基础的边界并不清晰，一个应用可以是另一个应用的基础。
- **被引用的仓就该能被检索**——`publicRepos` 的语义 = 本仓的出边 = 我能读/检索/引用的仓。
- **就按是否在 `publicRepos` 里声明判**——方向由这张表给出，不另立声明面。

**用户另定的两件事**：

- **机检要拦截**——不是只出读数。
- **`crossRepoOf` ∥ `crossRepoNote` 退役**——理由逐字：「其实并没有真的使用，多一个分叉的名称多一层用户困惑」。

**库内勘察（父侧 2026-11-08 09:2x 实读）**：

- `thincoder-core/path-resolve.mjs` 第 177 行 `crossRepoOf`，只在第 269 行被调，入口条件是第 223 行 `o.crossRepo === "visible"`。
- `thincoder-core/doc-check/anchors.mjs` 第 258 行**确实传了** `crossRepo: "visible"` ⇒ **这一支是活的，不是死代码**；`thincoder-core/doc-check/index.mjs` 第 41 ∥ 419 行把它接成读数行。
- 同一选项名另有 `"dangling"` 值：**实参只有一处**（`thincoder-core/agent-tools/review-facts.mjs` 的 `resolvePathTarget(...)` 调用）；`thincoder-core/agent-tools/batch-paths.mjs` 那处只出现在 JSDoc 里，四个调用点都不传这个键（设计席 2026-11-08 实读更正，父侧原记「两处」有误）。**它与文档锚面那条不是一件事**，删这个键行为零变化。
- **`index.publicRepos` 的值在本批内变过两次，所以 `§1` 不记它的值**：开工时读到 `[]`；实施前父侧改成 `["../.thincoder"]`（原因：`docs/core/design/` 有 4 处真指 `D:\teamcode\.thincoder\advisor.md` 这个 workspace 级档，不声明就是新规则下的红）。**现值以 `PROJECT-MANIFEST.json` 为准，本档不复述。**
- **「`docs/**` 无一条真正的跨仓指针」这条开工时的判断是错的**：新规则上线当天判出 48 条（30 条首段 `thincoder` ∥ `thincoder.com` 的真跨仓 + 约 16 条把 `~/.thincoder` 漏写成 `.thincoder`）。读数与逐条构成见 `§5` 第三节，清账另批（台账 `#2173`）。

**边界**：本批判的是**交付物**（文档指针），不拦动作。与「不造拦截」的原则不冲突——`档缺` ∥ `节缺` 本来就是拒的，本条并入同一类。

## §2 批次任务与设计（eng-designer）
**状态行**：设计完成（设计落文轮六档已落盘；评审第 2 轮 pass；实施 drift 三条 + AC-9 前提已按父侧裁收正）


**本批条目（覆盖）**——每条一行，验收在 §2 末尾逐条对回。

| # | 条目 | 依据 |
|---|---|---|
| R1 | `index.publicRepos` = 本仓的出边表：列了谁就能读 / 检索 / 引用谁；一个键两种用途，不拆两套许可 | 用户 ①③（`§1` 逐字） |
| R2 | 不引入 base / app 角色位，manifest 不加角色键 | 用户 ② |
| R3 | 指向未声明仓的文档指针 ⇒ 拒（落 `档缺`，交付门 `REFUSED`），不是只出读数 | 用户 ④ + 「机检要拦截」 |
| R4 | 已声明 ⇒ 分两格判：声明根**在本机** ⇒ 当场校存在性，档缺即拒（`档缺`）；声明根**不在本机** ⇒ 存在性跨机器不成立 ⇒ 不校，列报 `未核` 且不入闸 | `docs/core/requirements/PROMPT-SYSTEM.md` ⑤ ∥ ⑤-补 现文（2026-11-08 09:46 读取） |
| R5 | 沿 `publicRepos` 递归读对方出边、走回自己 ⇒ 拒（`锚·环引`） | 用户 ④ 第二条 |
| R6 | `crossRepoOf` ∥ `crossRepoNote` ∥ `crossRepo` 选项与结果态退役：一个概念一个名 | 用户 09:22 逐字 |
| R7 | 无 `PROJECT-MANIFEST.json` 的仓是叶仓：可被声明 / 被引用，自己声明不了任何出边 | `§1`「必须写进规则的事实」 |
| R8 | 上线当天不凭白造红：本仓既有指针里被本批判出的未声明仓名，**全是真跨仓指针**（逐条可点）；`锚·环引` 与 `未核` 各零新增 | 父侧 2026-11-08 裁定：原「`docs/**` 无真跨仓指针」前提为假，读数与逐条点位见 `§5` 第三节；那批真指针挂台账 `#2173` 另批清 |

**夹具形态（下文一律用代号指它，不再写全路径）**：

```text
A 仓：项目根，有 manifest，声明 ../B
B 仓：有 manifest，出边为空
C 仓：与 A 同级，无 manifest，未声明
四种指针：已声明在盘档 ∥ 已声明缺档 ∥ 未声明仓名的档 ∥ 形态非法（B/../越界.md · B/ · 绝对形）
```

**设计档落点**——六档已落盘（设计落文轮，2026-11-08）；本节只留落点与改法，一处一个归属：

| 档 | 改哪里 | 改什么 |
|---|---|---|
| `docs/core/design/PATH-RESOLUTION.md` | §1 目标 ∥ §1.2 先例行 ∥ §1.3 · §2.1 选项与状态表 · §2.2 第 6 步 · §2.5 接线表 · §2.6 报明文 · §2.7 全节 · §3 · §4 KD-9 ∥ KD-10 ∥ KD-11 · §5 AC-1 ∥ AC-9 ∥ AC-10 ∥ AC-12 · §6 · §7 · §8 · §9 | 第四态换义（`crossRepo` 读数态退役 ⇒ `unverified` 未核态登场）；声明仓腿按「根在盘才校存在性」两格落；两个跨仓读数形删除；报面三态各一行形 |
| `docs/core/design/DOC-DISCIPLINE.md` | §3.20 判据 ①（读数行删 · `档缺` 括注增 · `锚·环引` 类增）∥ §4.2.2 ⑥（声明源形改为「存在性可核 + 未声明即 `档缺`」） | 判据句改成会拒的形状 |
| `docs/core/design/DOC-CHECK.md` | §2.5 域表三项 · §4 受影响文件表里那段代码围栏（`resolveDoc` 的调用行） | `index.publicRepos` 从读数源升为判据源；环检要读兄弟仓 manifest；围栏里的 `crossRepo: "visible"` 换成 `declaredRepos: true` |
| `docs/core/design/MANIFEST.md` | §2.2 的 `publicRepos` 用途行 | 出边表语义 · 叶仓事实 · 不加角色位 |
| `docs/core/design/ADVISOR-GUARDS.md` | §12（评审文档路径解析与受理面）的解析面归口那句 | 「跨仓形（`crossRepo`）**不进入本面**」改为不含键名的同义句：本面不传 `declaredRepos`，项目外指针照旧 `档缺`——行为零改、只改名（R6） |
| `docs/core/design/BATCH-RECORD.md` | §4.15（相对路径解析序与防嵌套）本面自声明参数那一行 | 「`crossRepo:"dangling"`（本面不放宽跨仓形）」改为「本面不传 `declaredRepos`（不放宽跨仓形）」——语义保留、键名拿掉（R6） |
| `test/rtm/paths.md` | 29-4 ∥ 29-5 改写；故事 CLI 37 与其三行新增（见第十一节） | 断言改成会红的形 |
| `test/RTM.md` | 故事索引表加一行（CLI 37，属册 = `paths`） | 编号先行 |

**一、方案与理由**

**最近先例**：`existing: thincoder-core/declaration.mjs` · name `resolveDeclaredRef` · consumers = 台账 `task_book` 指针写门。

它已经实现了本批要的那条腿——「首段命中声明公共仓目录名 ⇒ 于该声明根解析余段，查存在性」。本批把同一条腿搬进统一解析层：语义对齐、零偏离。偏离只有一处，且正是本次要的：那个函数只服务记录面，文档锚面此前**不查存在性**。

**新增三名的三问（本批要落盘的新名：选项 `declaredRepos` · 结果态 `unverified` · 判词 `锚·环引`）**：

- `declaredRepos`（选项面）——`none found: 查面 = `thincoder-core/path-resolve.mjs` 的 opts 名（`kind` ∥ `order` ∥ `bases` ∥ `scanBases` ∥ `referrer` ∥ `session`）· `thincoder-core/declaration.mjs` 的导出（`resolveDeclaredRef` ∥ `declaredPublicRoots`）· `thincoder-core/prompts/**` · `thincoder-core/tool-docs/**`；逐串查 = 0 命中（2026-11-08 09:46 前后实跑）`。⇒ 新名，直取规则词汇（声明表），读者不用再学一个说法。
- `unverified`（结果态）——`existing: thincoder-core/agent-tools/verify.mjs` · name `unverified` · consumers = 评审 ∥ 校验面`。既有用法是**证据的判词**（判不了 ⇒ 不许据此判过）；本批把它落成**解析结果的一格**，词义未变（判得出、判不了存在性），只是从判词面搬到结果态面 —— 故照借、不另造。
- `锚·环引`（判词类）——`none found: 查面 = `thincoder-core/doc-check/index.mjs` 的 `ANCHOR_LABELS`（`锚·档缺` ∥ `锚·节缺` ∥ `锚·引缺`）；族形 `锚·<类名>` 与渲染兜底已有，类名是新的`。⇒ 借族形、不借类名。

**为什么既有三类名一个都不能借**：`档缺` ∥ `节缺` ∥ `引缺` 的判据都是「有东西缺了」——档不在盘 · 节号不在 · 引文对不上。环上每一档都在盘、节号也全对，缺的不是东西而是边结构闭合；借任一个都会让读者去补一个本来就存在的档。

`existing but unusable: thincoder-core/path-resolve.mjs` 的 `crossRepoOf` ∥ `crossRepoNote`：形是「识别跨仓 ⇒ 出一行读数」，判据面零命中。用户裁定退役，本批删之、不改建。

**调研证据（库内）**：

- `docs/core/design/PATH-RESOLUTION.md` §2.7 与 KD-9 ∥ KD-10——跨仓只判形态、不查存在性、未声明不阻断。**这正是本次要反转的规则**。
- `docs/core/design/DOC-DISCIPLINE.md` §4.2.2 ⑥ 与 `docs/core/design/LEDGER-SELF-CONTAINED.md` §3 L4③——声明源前缀形已是「合法可核坐标」。坐标语法不必新立，只需从「可核」变成「不核就红」。
- `docs/core/design/MANIFEST.md` §2.2 与 `docs/core/design/MEMORY.md` §6.15——`publicRepos` 的值形与解析单源（`declaredPublicRoots`）。**相关**。

**调研证据（库外）**：本仓 `index.publicRepos` 现列 `../.thincoder`（工作区工具目录：`memory` / `tmp` / `advisor.md`，不是公共文档仓）⇒ 库外无相关先例可引——已查，无相关。

**依据（本批立论的三条代码事实；取的是本节撰写当刻的盘面读数）**——三条都落在本批改动面内，**按符号名指、不引逐字**：引文会随本批的删除一起失效，而引用点少一处，实施轮就少一处被门拒的由头。

- `thincoder-core/path-resolve.mjs` 的 `resolvePathTarget`：`crossRepo === "visible"` 才开跨仓识别支；选项值域 `"visible"` ∥ `"dangling"`。
- 同档的 `crossRepoOf`：已声明形**按声明仓目录名匹配首段即返回**，不对声明根做存在判（JSDoc 里写着声明根不 stat，位置因人而异）；未声明形只出同级候选。
- `thincoder-core/doc-check/anchors.mjs` 的 `resolveDoc`：向 `resolvePathTarget` 传 `crossRepo: "visible"` ⇒ 文档锚面是唯一开这一支的面；两处收集点见结果为该态即 `continue`（零命中）。

**对 `§1` 勘察的一处更正（本席实读）**：`crossRepo: "dangling"` 的实参面只有一处——`thincoder-core/agent-tools/review-facts.mjs` 的 `resolveReviewDocPaths`。

`thincoder-core/agent-tools/batch-paths.mjs` 那处只在一行 JSDoc 注释里，它的四个调用点都不传这个键。`"dangling"` 与不传等价，由上引第一行判死：只有字面 `"visible"` 开分支。

**二、接口契约**

`resolvePathTarget(anchor, given, opts)` 的结果态仍是四态，但**第四态换义**：`resolved` ∥ `ambiguous` ∥ `dangling` ∥ `unverified`。

`crossRepo` 这一态与它的载荷（`repo` ∥ `declared` ∥ `relPath` ∥ `candidates`）整体删除——它出的是读数、判据面零命中。顶上去的 `unverified` 不是读数行，是 ⑤ 的**未核**（`docs/core/requirements/PROMPT-SYSTEM.md`）：一个**判得出、判不了存在性、因而不入闸**的判态。

选项面：删 `crossRepo`（两个值都删），新增一个布尔 `declaredRepos`，缺省不开。

**只有文档锚面传它**——这是「哪一面允许跨出本仓」的显式声明，与既有 `kind` ∥ `order` ∥ `bases` 同性质。其余面不传，跨仓形照旧判 `档缺`，行为零变。

新增的腿 = 判定序第 6 步，取代原跨仓识别步；前三步与第 4–5 步一字不动：

1. 前置：`declaredRepos` 已开、输入多段、第 4–5 步零命中。
2. 声明仓名集 = `declaredPublicRoots(start)` 各根的目录名，按**声明序**匹配首段；同名多仓取声明序首者。
3. 余段须非空、不含 `..` ∥ `.` 段；不合法 ⇒ 不成腿 ⇒ 落 `dangling`（形态写错仍阻断，既有 KD-11 零改）。
4. 命中 ⇒ **先判声明根本机在不在**，两格分开落：
   - **不在本机** ⇒ `unverified`（未核）：仓名合规、形态合规，只是本机没有那个仓根 ⇒ 列报、不阻断；余段与节号都不判（判不了）。
   - **在本机** ⇒ 于该声明根解析余段，按 `kind` 判存在性：在盘 ⇒ `resolved`（下游「节在盘」照旧判——跨仓指针从此也管节号，白送的一半）；不在盘 ⇒ `dangling`（红）。

`unverified` 载荷四格：`declaredRepo`（仓目录名）· `declaredRoot`（期望的声明根绝对路径）· `relPath`（余段）· `declarationEntry`（该仓在 `index.publicRepos` 里的声明项原文）。四格全进报面——读者据此分得清「没声明」「声明了但本机没 clone」「声明了、clone 了、档不在」三件事。

`dangling` 增四格载荷：`declaredRepo`（仓目录名）· `declaredRoot`（声明根绝对路径）· `rootOnDisk`（声明根本机在不在）· `siblingRepos`（仅未声明形：本机同级目录名，既有那次 `readdir` 的产出改喂注解）。既有载荷（`missing` ∥ `sameName` ∥ `level` ∥ `tried`）零改。

**三、每一支的依据**（填不出这一格就删掉这一支）

| 分支 | 依据（读数 / 可复现路径） |
|---|---|
| 已声明 ∧ 根在盘 ∧ 档在盘 ⇒ `resolved` | 判定取 `thincoder-core/declared-repos.mjs` 的三合投影（声明序、`declaration.mjs` 的单源值），与台账面同一函数同一序；红侧 = 改前同输入走 `crossRepoOf` 的已声明支，不过存在判、节号也不判 |
| 已声明 ∧ 根在盘 ∧ 档缺 ⇒ `dangling`（红） | `docs/core/requirements/PROMPT-SYSTEM.md` ⑤-补 那句「声明根在本机时连目标一起校」的限定面——根在本机时不涉跨机器，存在性可核，缺档照判。红侧 = 今日同输入零命中（`crossRepoOf` 的已声明支直接返回，不过存在判） |
| 已声明 ∧ 根不在本机 ⇒ `unverified`（未核，不入闸） | `docs/core/requirements/PROMPT-SYSTEM.md` ⑤ 的第三态（声明根不在本机、列报不入闸）+ ⑤-补 给的理由（clone 位置因人而异，存在性跨机器不成立）。红侧 = 今日同输入出的是 `跨仓引用：…（声明源引用，未校验存在性）` 读数行、报面上**没有 `未核` 这一形**：`grep -rn 未核 thincoder-core` 本席实跑 = **0 命中** |
| 未声明 ∧ 首段是本机同级目录 ⇒ `dangling` + 同级候选 | 今日同输入零命中（`crossRepo{declared:false}` 一行读数）——`§1` 记的那条读数行就是这一支的现形 |
| 未声明 ∧ 首段非同级目录 ⇒ `dangling` | 既有行为（跨仓形不成立 ⇒ 普通悬空），零改 |
| 形态不合法 ⇒ `dangling` | 既有 KD-11：形态是作者能写对的事，写错仍阻断 |
| 环 ⇒ `锚·环引` | 用户 ④ 第二条；今日全仓零环检（`§1` 未列该面）⇒ 红侧 = 造一对互声明，`doc_check` 首行仍 `PASS` |

**四、环检的落点（本批真新增的一半）**

落点 = **锚判据内、按被判档的组根各走一遍**：不另立工具、不加判据条数。

理由：`doc_check` 的 `gate` 是全项目唯一「拒了就不用交付」的门。放到门外的脚本里，等于造一条没人会跑的第二道门（`§1` 已否过「只出读数」）。判据数 = 三 是闭集，加第四条要动 verdict 分词与全档口径；而环回答的仍是「指针指向哪里」，归锚判据不牵动判决词。

走法（新建一个叶档承载，档名见第六节围栏）：

1. 节点 = 仓根绝对路径；边集 = 该根的 `declaredPublicRoots`，**只保留自身带 `PROJECT-MANIFEST.json` 的目录**——无 manifest 的仓没有出边（R7 的机检面）。
2. 从被判根出发 DFS，带 visited 集（路径同一性，`win32` 大小写不敏感）。visited 集本身保证终止，故不设深度帽。
3. 走回起点 ⇒ 一条 `锚·环引`，链按目录名写全。只报**穿过起点**的环——每个仓的门报自己的环，不为别人的环背红。
4. 起点根无 manifest ⇒ 无声明面 ⇒ 零判；`doc_check` 的域表读数已把「该根无 manifest」摆在报面上，不静默。
5. 走查撞到**声明根不在本机**的节点 ⇒ 它的边集为空（读不到对方 manifest）⇒ 走查在该节点止步，并按第五节的唯一一行形写进 `未核` 列报（该根若无指针触发，`触发` 列写「环走查止步」）——**「没找到环」与「没看过去」因此在报面上分得开**，不留静默。

`锚·环引` 与 `锚·档缺` 同计 `锚 N 条` ⇒ `gate` 首行照旧 `REFUSED`，不新增判决词。

**五、报面（人读面 · 本机制唯一的人机界面）**

- 已声明、根在盘、解析出的跨仓指针：**静默**，与仓内指针同形处理。不再有 `跨仓引用：` 那一行（那是退役掉的分叉）。带节号而节不在 ⇒ `锚·节缺`。
- 未声明的跨仓形 ⇒ `锚·档缺` 行，括注三件：缺的那一段 · 本机同级目录候选 · 一句「该名未在 `index.publicRepos` 声明」。既有 `sameName` 提示不变。
- 已声明但声明根不在本机 ⇒ **不落 `锚` 命中**，落 `未核` 读面。**一个声明根一行**，两个产出方（指针 ∥ 环走查）共用这一形：`未核（声明源缺位）  仓 <repo>：声明根 <path> 本机不存在（声明项 = <entry>）  触发 = <pointer 逐个列出 ∥ 环走查止步（该根无出边可读）>`。同一根既被指针触发又被走查撞到 ⇒ 仍是一行，`触发` 两半都写。该行不进 `锚 N 条`、不动 gate 首行。
- `未核` 恒带条数成行：`未核 N 条（声明源缺位——列报不入闸）`，与「读面」块同处（照 `unreadable` 的既有形：不当命中、也不当干净）。**N = 上列行数 = 声明根缺位的仓数（不是指针数）**；N = 0 时不出行。**这一行是「看过了、判不了」与「根本没看」在报面上的唯一区别。**
- 环 ⇒ 一行 `✗ 锚·环引 PROJECT-MANIFEST.json（<根>）publicRepos 成环：A → B → A`。
- 无 `open` 项：四形逐条定死（`核` 静默 · `未核` 列报 · `红·未声明` · `红·根在盘而档缺`）。

**六、受影响文件与测试覆盖**

源码（改）：

| 档 | 改什么 |
|---|---|
| `thincoder-core/path-resolve.mjs` | 删 `crossRepoOf` ∥ `crossRepoNote`；加声明仓腿（两格：根不在机 ⇒ `unverified`；根在机 ⇒ 判存在性）；`unverified` 四格载荷 ∥ `dangling` 四格载荷；`crossRepo` 选项删、`declaredRepos` 加 |
| `thincoder-core/doc-check/anchors.mjs` | `resolveDoc` 传 `declaredRepos`；两处 `crossRepo` 收集点改为 `unverified` 收集（**不入 `hits`** ⇒ 不改 verdict）；接环检、产 `锚·环引`；`档缺` 载荷透传 |
| `thincoder-core/doc-check/index.mjs` | `crossRepoNote` 的 import 与 `crossRepoLine` 删；`unverified` 的并集 ∥ 条数行 ∥ 逐声明根行接上（与 `unreadable` 块同处）；`环引` 类名接上（`ANCHOR_LABELS` 增项或走渲染兜底，二选一、行为同）；`档缺` 行增新括注 |
| `thincoder-core/agent-tools/review-facts.mjs` | 删 `crossRepo: "dangling"`（实参唯一调用点，行为零变） |
| `thincoder-core/agent-tools/batch-paths.mjs` | 只改那行 JSDoc 注释（实参面零改） |

新增（围栏内是尚未落盘的档名，故不按锚判）：

```text
thincoder-core/declared-repos.mjs                    声明出边图 + 环走查（叶档：只 import node:* 与 manifest.mjs / declaration.mjs）
docs/batches/2026-11-08-cross-repo-refs.test.mjs      本批单元测试档（收口删）
test/integration/cross-repo-refs.test.mjs             集成用例（故事 CLI 37）
```

测试（改）：`test/integration/path-resolution.test.mjs` — 29-4 ∥ 29-5 改写成新判态（见第十一节）。

**层级结论**：无档跨层。改动全落 `thincoder-core/**` 与仓根 `test/**`，无端（cli / vsc / desktop / server）与核之间的分层迁移，无跨层共享的接口形状变更。

**量法**：`doc_check` 的 `lines` 面（`countContentLines` 单源），本席 2026-11-08 09:46 前后实跑：

- `thincoder-core/agent-tools/batch-paths.mjs` 234 · `thincoder-core/agent-tools/review-facts.mjs` 130 · `thincoder-core/doc-check/anchors.mjs` 372 · `thincoder-core/doc-check/index.mjs` 686（越 500 软线、未越 800）· `thincoder-core/path-resolve.mjs` 300；越硬限 0 档。
- 新增的声明出边叶档与两份测试档此刻不在盘，无基线可量。

**函数级结论**：六处改动都在既有函数体内，或落一个新增叶档——`resolvePathTarget` 加一条腿与两个载荷格 · `resolveDoc` 换选项名并改两处收集点的去向 · 渲染面加 `未核` 与 `环引` 两形 · 两处调用点一处删实参、一处改注释 · 环走查落新叶档的导出函数。无一处改既有函数的形参表（`resolvePathTarget` 的 opts 是对象入参，只增减键）。

收口轮按同一量法复量；`thincoder-core/doc-check/index.mjs` 的既有越线在册，本批对它的净增减在收口轮量，不预先宣称净减。

**七、验收对照（每条带红侧；红侧要么本席实读，要么写明为什么取不到）**

| # | 判据（机检口径） | 红侧（改前读数 / 复现路径） | 对回 |
|---|---|---|---|
| AC-1 | 退役读全，三面各判 ⇒ **0 行**：`thincoder-core/**` · `test/**` · `docs/core/**`（量法面与历史例外见下表后两条） | 今日读数（本席 2026-11-08 09:46 前后实跑 `Select-String`）：`thincoder-core` 31 行 · `test` 1 行（`test/integration/path-resolution.test.mjs` 的断言消息「形态错不落 crossRepo」）· `docs/core` 28 行 ⇒ 三面皆红 | R6 |
| AC-2 | A 声明 `../B`、指针指已声明在盘档 ⇒ 文档门零命中、首行 `PASS` | 今日同输入也零命中 ⇒ **本条单独不可判红**，故与 AC-3 合判：真正红的是「节在盘」那一半 | R1 |
| AC-3 | 同上夹具，指针带一个 B 侧不存在的节号 ⇒ `锚·节缺` 一条、首行 `REFUSED（锚 1 条）` | 今日零命中（跨仓态在节判之前返回，`anchors.mjs` 的 `if (r.state === "crossRepo")` 直接 `continue`）⇒ 红 | R1 |
| AC-4 | 同上夹具，**声明根在盘**、指针指已声明缺档 ⇒ `锚·档缺` 一条、首行 `REFUSED（锚 1 条）` | 今日零命中（已声明支不过存在判）⇒ 红 | R4 |
| AC-5 | 同上夹具，**声明根整份不在本机** ⇒ ① 报面出 `未核 N 条（声明源缺位——列报不入闸）` 与逐声明根行（点名声明根与声明项，行形见第五节）；② `锚` 命中 0 条、gate 首行 `PASS`；③ **同一指针删掉声明再跑 ⇒ `锚·档缺` + 首行 `REFUSED（锚 1 条）`**——②③ 两跑并置，「判不了」与「没看」才分得开 | 今日该形出 `跨仓引用：…（声明源引用，未校验存在性）` 读数行、报面无 `未核` 这一形（`grep -rn 未核 thincoder-core` = 0 行，本席上一轮实跑）⇒ 红 | R4 |
| AC-6 | 指针首段 = 未声明的同级目录 C ⇒ `锚·档缺`，括注含同级候选与「未在 `index.publicRepos` 声明」 | 今日零命中且出的是 `跨仓引用：` 读数行 ⇒ 红 | R3 |
| AC-7 | A ↔ B 互为声明 ⇒ 判 A 的档时 `锚·环引` 一条（链 `A → B → A`）、首行 `REFUSED`；A → B → C 无环 ⇒ 零 `环引`；C 无 manifest 当被 A 声明 ⇒ 零 `环引`、零抛错；**且 A 声明 `../C`（C 无 manifest）后，指针指 C 内的在盘档 ⇒ `resolved`、零命中、首行 `PASS`**——叶仓被声明后可解析，验收 ⑤ 末例的机检形 | 今日无任何环检实现：造该夹具跑 `doc_check`，首行 `PASS`（可复现） | R5 ∥ R7 |
| AC-8 | 零回归：29-1 ∥ 29-2 ∥ 29-3 零改零红；`node --test test/integration/path-resolution.test.mjs` 改前改后同绿 | 本条是回归闸，不是会红的判据——照实标注其角色 | R6 |
| AC-9 | 本仓自身零红：同清单判 `docs/**` ⇒ 新增的 `锚·档缺` **全部是真跨仓指针**（逐条可点、无一假阳）；`锚·环引` 与 `未核` 各 **0** 条 | 改前那 48 条出的是 `跨仓引用：…` 读数行、零命中；改后进 `锚·档缺` 集——「新增 0」不成立，成因 = 原前提为假（读数与逐条点位见 `§5` 第三节） | R8 |
| AC-10 | 夹具「A 声明 `../B`、B 整份不在本机」⇒ 报面恰出 `未核 1 条` 与**一行**逐声明根行，行内含 `仓 B` ∥ `声明根` ∥ `触发 =` 两半（指针与环走查止步都列）；删掉该指针、只留一次 `gate` 跑 ⇒ 仍是 `未核 1 条`、行内 `触发 = 环走查止步`——两个产出方各出一条同形行，条数按声明根计、不按指针计 | 今日两种输入都零 `未核` 行（`grep -rn 未核 thincoder-core` = 0 行，本席上一轮实跑）⇒ 红 | R4 |

**R2 的判法（它是边界项，不是判据）**：今天 `PROJECT-MANIFEST.json` 里没有任何 base / app 一类键 ⇒ 任何「不存在角色键」的机检只会恒绿，写进表里就是一条永远验不了的绿。故 R2 归第九节边界逐条落（`manifest` 键面零增），不占 AC 行；守它的是评审面与第十五节的 `D11` 同改层表。

**AC-1 的量法面（三面各判；第四面是过程面，另算）**：

- 判面 = `thincoder-core/**` · `test/**` · `docs/core/**`，三面跑同一串（`Select-String -Pattern "crossRepo" -SimpleMatch`，逐面计数）。
- `docs/batches/**` 是**过程面**（本批批档 ∥ 评审记录 ∥ 历史批次）：其中出现该词是历史，不算余留；批档单元测试档与批档同目录同前缀、收口删，同属过程面。

跑法：本批单元测试档 `node --test docs/batches/2026-11-08-cross-repo-refs.test.mjs`；集成半在收口行报，不写全量套跑。

**八、用例表**

| 类 | 输入 | 期望 |
|---|---|---|
| 正常 | 已声明在盘档 | `resolved`，零命中 |
| 正常 | 已声明在盘档 + B 侧存在的节号 | `resolved`，零命中 |
| 正常 | 仓内指针（无首段仓名） | 与改前逐字同（零回归） |
| 正常 | A 声明 `../C`（C 无 manifest），指针指 C 内的在盘档 | `resolved`，零命中、首行 `PASS`（叶仓能被声明、被引用——验收 ⑤ 末例的机检形） |
| 边界 | 已声明、根在盘、档缺 | `dangling`（红），`declaredRepo` = B、`rootOnDisk` = true |
| 边界 | 已声明、根不在本机 | `unverified`，载荷含 `declaredRoot` ∥ `declarationEntry`；零命中、不入闸 |
| 边界 | A 声明 B、B 不在本机 | 环走查止于 B；报面出 `未核 1 条` 与该根一行 `未核（声明源缺位）  仓 B：声明根 <path> 本机不存在（声明项 = <entry>）  触发 = 环走查止步（该根无出边可读）`（「没找到环」与「没看过去」由这一行分得开） |
| 边界 | 声明两个目录名同为 B 的仓 | 取声明序首者（与 `resolveDeclaredRef` 同序，无第二规则） |
| 边界 | 未声明仓名、首段是同级目录 C | `dangling`，`siblingRepos` 含 C |
| 边界 | 未声明仓名、首段非同级目录 | `dangling`，`siblingRepos` 为空 |
| 边界 | A ↔ B 互声明 | `锚·环引`（A 的一侧） |
| 边界 | A → B，B 无 manifest | 零 `环引`、零抛错（叶仓） |
| 错误 | 形态非法三形（见夹具围栏） | `dangling`（阻断） |
| 错误 | 首段等于仓内真目录名（如 `docs`）而仓内无该档 | `dangling`，不按仓名解 |

**九、边界（本批不做什么）**

- 不拦「读」：本批判交付物（文档指针），不拦任何工具动作。
- 不改检索面：`doc_search` 的声明域已按 `index.publicRepos` 接，行为一字不动。
- 不加角色位：manifest 不加任何 base / app 一类键（R2）。
- 不判断对方仓的文档质量与结构：环检只读出边，锚判只读被指档的存在性与节号。
- 不改台账 `task_book` 指针的跨仓硬判（`docs/core/design/LEDGER-SELF-CONTAINED.md` 的 L4 面零改）。
- 不改评审 / 顾问 `documents` 与批档读面的受理面：两面不传 `declaredRepos`，跨仓形照旧判 `档缺`。
- 不新增工具、不改任何工具入参与 schema。
- 不给叶仓造 manifest：`thinworker` ∥ `thincoder-issues` 保持无 manifest，规则照 R7 写在档里，不替它们建档。
- 不做双向同步 / 镜像：引用方向是单向出边，不要求对方回指。

**十、关键决策**

**KD-1 把跨仓腿并回普通解析，不保留「跨仓态」。** 用户要的是「未声明就拒」，而拒的最短路径是既有 `档缺`——判词、报面行、门判决全现成，白送一条不会漏的机检。被否：留 `crossRepo` 态再加一个红的子态（两个态说一件事，正是用户点的「多一个分叉」）。

**KD-2 存在性只判能判的那一格（R4，已裁）。** 声明根在本机 ⇒ 存在性可核，缺档即 `档缺`；声明根不在本机 ⇒ 跨机器不成立，落 `未核`、不入闸。依据 = `docs/core/requirements/PROMPT-SYSTEM.md` ⑤ 的三态 + ⑤-补 那句「不校**对方机器上**那个档」的限定面；父侧 2026-11-08 裁定撤销「一律拒」的默认——**这格不是新造态，是 ⑤-补 的原意**。

被否两条：① **一律红**——把 `未核` 这个既有态弃用，等于让「本机没 clone」冒充「路径写错」，两件事共用一句话，读者会去修错地方；② **一律放行**——把「不查存在性」从后门请回来，且让一条拼错的路径在别人机器上静默通过。

**KD-3 环检落进锚判据、按组根各走一遍。** 依据：门只有 `doc_check` 的 `gate` 一处；判据数 = 三 是闭集。被否：另立脚本（没人跑 ⇒ 回到「只出读数」）· 加第四条判据（动 verdict 分词与全档口径，代价远大于收益）。

**KD-4 只报穿过起点的环。** 依据：仓自足——A 的门不该为 B 与 C 之间的环背红。

**KD-5 选项名取 `declaredRepos`，不取 `crossRepo` 的变体。** 依据：用户退役的是分叉的名称；新名直接取自规则词汇（声明表），读者不用再学一个说法。

**KD-6 同级目录候选保留、状态改红。** 依据：那次 `readdir` 的产出是「你是不是指这个」的提示，与 `sameName` 同性质；改的只是它落在 `档缺` 行上。

**KD-7 把「无 manifest 的仓是叶仓」写成规则（R7）。** 依据：不写进去，将来想从那些仓反向引用会无处可写，然后随手造 manifest 绕过——绕过的是整套方向规则。机检面 = 环走查只保留自身带 manifest 的节点。

**KD-8 本轮不改 `thincoder-core/declaration.mjs` 的 `resolveDeclaredRef`。** 本批把同一条腿搬进解析层 ⇒ 同一形映射有了第二处实现，这是单源债。但那一处在台账 `task_book` 写门与批档面上，改它会把爆炸半径从文档面扩到写门与台账。**登记为债、不改**（上抛 2）。

**十一、集成测试设计（`test/RTM.md` 增量）**

读 `test/RTM.md` 与 `test/rtm/paths.md` 后按增量答：**破 2 行 · 增 1 故事 4 行 · 冗余 0**。

| 处置 | 行 | 入口 | 交互的组件 | 断言的可观察结果 | 对回 |
|---|---|---|---|---|---|
| 改 | 29-4 | 一次文档门 `gate` 跑 | 文档交付门 × 声明出边 × 统一解析层 | 已声明在盘档 ⇒ 零命中、首行 `PASS`；带错节号 ⇒ `锚·节缺`；未声明仓名 ⇒ `锚·档缺` + 同级候选注解。原断言「两条均零命中 + 两行读数」已假 | R1 ∥ R3 |
| 改 | 29-5 | 同上 | 文档门 × 台账面 | 文档面形态错 ⇒ `锚·档缺`（零改）；台账面同形 `task_book` ⇒ 硬拒（零改）。删掉的只是「不落跨仓读数」那半句 | R3 |
| 新增 | 37-1 | 一次文档门 `gate` 跑 | 文档交付门 × 声明出边 | A 声明 `../B` 且 B 在本机：指在盘档 ⇒ `PASS`；指缺档 ⇒ `锚·档缺`、首行 `REFUSED`——声明不免除存在性，**但只在根在盘这一格** | R1 ∥ R4 |
| 新增 | 37-2 | 同上 | 文档交付门 × 声明出边 × 同级目录 | 未声明仓名 ⇒ `锚·档缺` + 「未在 `index.publicRepos` 声明」+ 同级候选；同输入改台账面仍硬拒（可见差） | R3 |
| 新增 | 37-3 | 同上 | 文档交付门 × 出边图 | A ↔ B 互声明 ⇒ `锚·环引`、首行 `REFUSED`；B 无 manifest 当被声明 ⇒ 零 `环引`，且 B 内的在盘档可解析为 `resolved`（叶仓能被声明、被引用） | R5 ∥ R7 |
| 新增 | 37-4 | 同上 | 文档交付门 × 声明出边 × 本机缺仓 | A 声明 `../B` 而 **B 不在本机**：报面出 `未核 1 条（声明源缺位——列报不入闸）` + 该根一行逐声明根行（`触发 = 指针 ∥ 环走查止步`）、首行 `PASS`；同一指针删掉声明再跑 ⇒ `锚·档缺` + `REFUSED`——「判不了」与「没看」在报面上分得出 | R4 |

- 新故事号 = `CLI 37`（索引表现有一行到 `CLI 36`）；属册 = `paths`（同族：路径与引用解析），故不新开分册。
- 用例号在此定死：行内号 `37-1` … `37-4`，**测试标题逐字 = `test('CLI 37-1 …')`**——`CLI` 前缀是编号的一部分，与既有 `test('CLI 29-4 …')` 同形，丢了它故事就对不上索引表；故事节与这四行落在 `test/rtm/paths.md`。
- 29-1 ∥ 29-2 ∥ 29-3 零改；`test/RTM.md` 的「异常与更正」无新增。

**十二、上抛项**

1. **【已裁】声明根不在本机 ⇒ 不阻断，落 `未核`。** 父侧 2026-11-08 撤销「已声明但缺档也拒」的默认，按 `docs/core/requirements/PROMPT-SYSTEM.md` ⑤ 的既有三态落（`核` ∥ `未核` ∥ `红`）；该档 ⑤ ∥ ⑤-补 ∥ 验收 ⑤ 已由父侧同轮改齐。落地 = 本节 KD-2 ∥ AC-4 ∥ AC-5 三处，`待裁` 标记全部解掉；报面新增的 `未核 N 条` 行就是这一格的人读面。
2. **【知会】** `thincoder-core/declaration.mjs` 的 `resolveDeclaredRef` 与本批新增的腿是同一形映射的第二处实现（KD-8）。本批不动它，请父侧记账、下一轮并源。
3. **【知会】** `§1` 勘察「`crossRepo: "dangling"` 两处」实为一处实参（`review-facts.mjs`）+ 一处注释（`batch-paths.mjs`），已在本节「一处更正」写明。

**十三、提示词面（`D11` 第二层 · 逐字终稿，实施轮落盘）**

**改点 1＋2：工程 ∥ 普通两面的自足条**（`thincoder-core/prompts/discipline-engineering.md` 与 `thincoder-core/prompts/discipline-normal.md` 内标题为 `Self-containment governs writes; reading is unrestricted` 的那一条；两面的题眼原句相同，只有标点与粗体不同）。

原文（两面题眼原句，**逐字连粗体一并引**；两面只差一个分号 ∥ 一个破折号，句尾各带一个括注）：

```text
工程面：**Content under the working directory is searchable, readable and citable by default**; **sources beyond the working directory are read per the declaration** (project manifest `index.publicRepos`).
普通面：**Content under the working directory is searchable, readable and citable by default** — **sources beyond the working directory are read per the declaration** (project manifest `index.publicRepos`).
```

**句尾那个括注随本句一起删**：终稿第二行已明写 `index.publicRepos` 是那张声明表；括注若留，同一键在同一目内出现两次（D2 的条目级形）。

**为什么要改**：`working directory` 在这一句里指哪个根没有定义——会话锚 ∥ 项目根，两种理解在本规则下**结论相反**。

会话锚 = `D:\teamcode`（workspace 根，兄弟仓 `thincoder.com` ∥ `thinworker` 都住在它底下）⇒ 按字面「锚下默认可引用」⇒ 可引；按新规则 = 未声明 ⇒ 拒。这类句子不能靠「读者会理解成项目根」撑着。

**逐字终稿（两面写同一份、逐字相等）**——替换区间 = 上面围栏里那一整句（两半 + 句尾括注）；区间外零改，其后 `**Check the declared sources …**` 起各行原文逐字保留。

```text
   **Reading has no boundary**: anything you can reach may be read, in this repo or outside it.
   **What may be cited has a boundary, and that boundary is the declaration**: a reference is legal only to a file in the repo that holds it, or in a repo this one lists under `index.publicRepos`.
   **A repo sitting beside this one is not thereby declared** — proximity is not the boundary, and it is not something a reader on another machine can check.
   A reference to a repo you have not declared is refused: the pointer is reported as a missing document, and a delivery gate fails.
```

**三处措辞选择，逐条说清**：

- 「`Reading has no boundary`」独立成句：既有条目的第一句是「自持管写、读不限」，但后半句把 read ∥ search ∥ cite 三件事并成一个「by default」。三件事在新规则下后果不同，故拆开——读无界、引有界。
- 「`proximity is not the boundary`」是**为 workspace 锚那一读法写的**：它把「住在同一父目录」这条唯一能撑起旧读法的理由当场否掉，并给出可核的理由（别的机器上看不到你的盘面）。
- 「`reported as a missing document`」而不是引入一个新词：`档缺` 是既有判词，跨仓未声明形落在同一判词上是本批 KD-1 的整个要点，提示词面不该再发明一个说法。

**改点 3：`common.md` 的跨仓那一段**（`thincoder-core/prompts/common.md` 的「Documents in other repositories」段）。

逐字终稿（在首句之后插入一行，其余三行零改）：

```text
**Documents in other repositories** count once declared. A repository outside `index.publicRepos` adds nothing to the searchable domain, and a `grep` result from the current repo says nothing about it either way.
**One key, two consequences**: the same declaration that lets a repo be searched is what lets it be cited — a reference into an undeclared repo is not merely un-indexed, it is refused (reported as a missing document, and a delivery gate fails).
So when a topic may live in a sibling repository and the answer found nothing, the answer carries `cross-repo: not indexed` beside it.
That records which surface was searched, and keeps an unsearched repository from reading as a settled absence.
```

**一处偏离父侧指令，请裁**：父侧说「`common.md` 那两句都要补」。本设计只改「Documents in other repositories」那一段，**`common.md` 的检索面定义句（`doc_search` searches a declared domain …）零改**。

理由：那一句只陈述检索域，在新规则下**仍为真**（检索域 = 本仓文档 + 声明仓）；把「一个键两种后果」再写一遍就是同一机制的第二处说明（D2 单源）。若父侧仍要它在检索面也出现，加法是往下加一句「The same key also decides what may be cited」，我按裁落。

**十四、工具描述（`D11` 第三层 · 逐字终稿，实施轮落盘）**

**改点 4：`thincoder-core/tool-docs/manifest.md` 的键目录行**（`index.publicRepos` 那一条）。

原文：`public-repo paths (resolvable from this repo root); change when wiring a public repo into the index or cross-repo refs; wrong ⇒ that repo is unreachable for retrieval (empty origin set / wrong path)`

**为什么要改**：它只说了检索后果。新规则下写错的后果多一半且更重——**指向它的指针落 `档缺`、交付被拒**。模型读工具表，读到的就是这一行。

逐字终稿（替换该行，两行；第二行是续行，非列表项）：

```text
- `index.publicRepos` — public-repo paths (resolvable from this repo root) = this repo's out-edge table: a repo listed here may be **searched and cited**; change it when wiring a public repo in or dropping one.
  - Not listing a repo: not merely un-indexed — a pointer into it is reported as a missing document, and a delivery gate fails.
  - Listing a path that does not exist on this machine: you lose that retrieval origin, and a pointer into it is reported `unverified`.
    Reported, never blocking — so a clone kept elsewhere does not fail this repo's gate.
```

**改点 5：`thincoder-core/tool-docs/doc_check.md` 的解析序那句**。

原文（在盘上被一个空行劈成两段，本节按跨空行连读；那个空行是排版残留，属被替换区间的内部）：`A pointer resolves against the project root (full path) or against the pointing document's own directory — bare names are not resolved across other directories.`

**为什么要改**：解析根今天写死两个；新规则多一组（已声明的 `publicRepos` 根），而未声明形现在要报 `档缺`——这一句一个字都没提。

**替换区间的边界（区间外一字不动）**：

- 起点 = `A pointer resolves against the project root (full path) or`（句首；其后跨一个空行接续，该空行在区间内）。
- 终点 = `against the pointing document's own directory — bare names are not resolved across other directories.`（句尾）。
- 区间外前一句的尾巴 `is judged; in `gate` mode such paths are listed as skipped instead.` **零改**——它属上面那条讲 `docs` 参数的句子，不在本改点内。
- 区间外后一段（`lines`（optional, `report` mode only）那行起的段落）**零改**。

逐字终稿（三行，替换上面那个区间；空行分隔）：

```text
A pointer resolves against the project root (full path), against the pointing document's own directory, or inside a repo this one declares under `index.publicRepos` (first segment = that repo's directory name).
Bare names are not resolved across other directories.

A pointer into a repo this project has not declared is refused, not merely noted: it is reported as a missing document and a `gate` run fails the delivery.
```

**两层的语义同源（承第十三节 ∥ 第十四节的两个改点）**：两面（提示词 ∥ 工具描述）属不同的多实现面，语义同源，文字按各自读者写——提示词是给模型的纪律句，工具描述是给模型的参数说明。

跨面差异只有一处且属形态：提示词用「refused / gate」的口吻，工具描述用「reported as a missing document」的参数口吻。**语义零差**：两处都只说「未声明 ⇒ 拒」。存在性那两格（根在盘 ⇒ `红`；根不在盘 ⇒ `未核`）属产品码与设计档的笔，两层都不写——写进来只会与「未声明 ⇒ 拒」争读者注意力。

**十五、`D11` 同改层表（父侧画的五层 + 本次新发现的第六层）**

| 层 | 落点 | 谁的笔 | 本轮状态 |
|---|---|---|---|
| 需求 / 决定 | 本档 `§1` | 父侧 | 已落 |
| 设计档 | 六档：`docs/core/design/PATH-RESOLUTION.md` §2.7 及其余 §2 节 · `docs/core/design/DOC-DISCIPLINE.md` §3.20 ∥ §4.2.2 ⑥ · `docs/core/design/DOC-CHECK.md` §2.5 · `docs/core/design/MANIFEST.md` §2.2 · `docs/core/design/ADVISOR-GUARDS.md` §12 · `docs/core/design/BATCH-RECORD.md` §4.15 | 设计席（落文轮） | **已落盘（2026-11-08）**；实施 drift 三条已在本轮收正：`docs/core/design/PATH-RESOLUTION.md` §1 叶档 import 面（三档）∥ 投影单源 ∥ §3 源码表增 `thincoder-core/agent-tools/batch-gate.mjs` 与 `thincoder-core/tools/doc-write-gate.mjs` · `docs/core/design/DOC-DISCIPLINE.md` §3.20 的 `锚·环引` 行去掉行号（与本节第五节同形） |
| 提示词 | `thincoder-core/prompts/discipline-engineering.md` ∥ `thincoder-core/prompts/discipline-normal.md` ∥ `thincoder-core/prompts/common.md` | 实施轮（产品面） | 逐字终稿见本节第十三节 |
| 工具描述 | `thincoder-core/tool-docs/manifest.md` ∥ `thincoder-core/tool-docs/doc_check.md` | 实施轮 | 逐字终稿见本节第十四节 |
| 产品码 | `thincoder-core/path-resolve.mjs` ∥ `thincoder-core/doc-check/**` ∥ 新增叶档 | 实施轮 | 见 §2 第六节 |
| **需求档（第六层 · 本批碰到的层）** | `docs/core/requirements/PROMPT-SYSTEM.md` ⑤ ∥ ⑤-补 ∥ 验收 ⑤ | **父侧**（设计席不写需求档） | **已改齐（2026-11-08）：未声明 ⇒ 阻断 · 已声明两格 · 方向 · 叶仓** |

**十六、证「读法不同」（判据面 · 含跑不了的如实标注）**

| # | 判据（机检口径） | 红侧（改前读数） | 层 |
|---|---|---|---|
| AC-P1 | `grep -c "under the working directory"` 对两面各 ⇒ **0** | 今日两面各 1（本席实读原句）⇒ 红 | 提示词 |
| AC-P2 | `grep -c "proximity is not the boundary"` 对两面各 ⇒ **1** | 今日 0 ⇒ 红（这一句就是说给 workspace 锚的读者听的） | 提示词 |
| AC-P3 | 两面取同一段四行、逐行相等 ⇒ `identical: true` | 今日两面同一句的标点不同（`;` ∥ ` — `）⇒ 不相等 ⇒ 红 | 提示词 |
| AC-P4 | `grep -c "One key, two consequences"` 对 `thincoder-core/prompts/common.md` ⇒ **1**；`grep -c "adds nothing to the searchable domain"` 仍 ⇒ 1（原句没被吃掉） | 今日前者 0 ⇒ 红 | 提示词 |
| AC-P5 | `grep -c "that repo is unreachable for retrieval"` 对 `thincoder-core/tool-docs/manifest.md` ⇒ **0**；`grep -c "out-edge table"` ⇒ **1** | 今日前者 1、后者 0 ⇒ 红 | 工具描述 |
| AC-P6 | `grep -c "refused, not merely noted"` 对 `thincoder-core/tool-docs/doc_check.md` ⇒ **1**；`grep -c "first segment = that repo's directory name"` ⇒ **1** | 今日两者各 0 ⇒ 红 | 工具描述 |
| AC-P7 | 提示词面单行 ≤ 300 字符（本批新增四行逐行量）；`node scripts/prompt-refs-check.mjs` 零参跑 ⇒ 命中 0 | 回归闸，不是会红的判据（照实标注其角色） | 提示词 |
| AC-P8 | **「改后与改前读出结论不同」这一条**：机检不了文意，故拆两半——① 结构半 = AC-P1 ∥ AC-P2 ∥ AC-P5 ∥ AC-P6（旧串消失、新串在位）；② 行为半 = AC-6（未声明的同级目录 ⇒ `档缺`）。两半同绿才成立；文意面本身**归评审面判**，本席不冒充机检 | 结构半今日红（上列各处）；行为半今日也红（AC-6 所述指针今日零命中） | 两层 |

**AC-P8 的读法差，逐字摆在这里**（供评审面直接对照）：

- 改前读到：`Content under the working directory … citable by default` ⇒ 会话锚 `D:\teamcode`、`thinworker` 在锚下 ⇒ **可引用**。
- 改后读到：判据只有 `index.publicRepos`，且明写 `A repo sitting beside this one is not thereby declared` ⇒ 未声明 ⇒ **拒**。
- 工具面同形：改前读到 `wrong ⇒ that repo is unreachable for retrieval` ⇒ 只是检索不到；改后读到 `a pointer into it is reported as a missing document and a delivery gate fails` ⇒ **拒**。

**十七、需求档现文与本批的落法（原「相抵」项已裁）**

**读的时刻与档的当时状态**：以下要点的读数取于 **2026-11-08 09:46 前后**，父侧当轮告知需求档已定稿、本轮不再改。上一版写的是更早一次改前的文，两条要点与盘面相反——**正文里的转述看不出过期，只有带上时刻与读数，读者才分得出现文与快照**。

**现文要点**（逐字引见下方三条 `依据` 行）：

- ⑤ 三态 = `核`〔已声明 ∧ 目标可解析〕∥ `未核`〔已声明 ∧ 声明根不在本机——列报不入闸；**同根在机而目标缺失则判红**〕∥ `红`〔未声明 ∥ 已声明但声明根在本机而目标不可解析〕。
- ⑤-补 四条：形态不合法（无声明源前缀 / `..` 越出仓根 / 绝对路径）⇒ 阻断；**仓名未声明但形态合法 ⇒ 阻断**（2026-11-08 用户裁定「机检要拦截」覆盖原「列报不阻断」）；仓名已声明 ⇒ **声明根不在本机时**只校仓名与形态（此即 `未核`，列报不入闸）∥ **声明根在本机时连目标一起校**（根在机而目标缺失 ⇒ 判红）；**方向** = `index.publicRepos` 是本仓出边，沿出边走回自己 ⇒ 阻断。
- **叶仓**：无 `PROJECT-MANIFEST.json` 的目录没有出边，只能被别人声明与引用。
- 验收 ⑤ 要的例数 = 三态各一例 + 成环阻断一例 + **叶仓被声明后可解析**一例。

依据 docs/core/requirements/PROMPT-SYSTEM.md「〔已声明 ∧ 声明根不在本机——列报不入闸；同根在机而目标缺失则判红〕」

依据 docs/core/requirements/PROMPT-SYSTEM.md「声明根在本机时连目标一起校」

依据 docs/core/requirements/PROMPT-SYSTEM.md「叶仓被声明后可解析」

**为什么这一节改回引逐字**：上一版为躲死引文而不引逐字，结果转述随需求档改而失真（评审第 1 条就是这么来的）。引逐字 + 带时刻 = 需求档再改时 `doc_check` 报 `引缺`，不会让一段过期的转述冒充现文。

**本批据此落的判据（三态一对一，第四形不存在）**：

| 现文态 | 解析层判态 | 报面 | 闸 |
|---|---|---|---|
| `核` | `resolved` | 静默（与仓内指针同形） | 过 |
| `未核` | `unverified` | `未核 N 条` + 逐声明根行（点名声明根与声明项） | 不阻断 |
| `红`〔未声明〕 | `dangling` | `锚·档缺` 一行（括注含同级候选与「未声明」） | `REFUSED` |
| `红`〔已声明 ∧ 根在机 ∧ 目标缺〕 | `dangling` | `锚·档缺` 一行（括注含声明仓与 `rootOnDisk`） | `REFUSED` |

## §3 设计评审（评审子代理）
**状态行**：评审通过（第 2 轮：上轮 10 条逐条复核，2🔴+8🟡 全已修，无新 🔴）



### 轮次 1（评审子代理）

| # | 严重度 | 状态 | 证据（指针） |
|---|---|---|---|
| 1 | 🔴 | 待改 | `docs/core/requirements/PROMPT-SYSTEM.md` 现文「声明根不在本机时」＋「声明根在本机时连目标一起校」；设计 §17 写「仓名已声明 ⇒ 只校仓名与形态」，同节又称 ⑤ 的 `红` 括注为「不可解析 ∧ 未声明」（现文含「已声明但声明根在本机而目标不可解析」）——三处与现文相反，且与本节 R4 ∥ KD-2 自相矛盾 |
| 2 | 🔴 | 待改 | `docs/core/design/ADVISOR-GUARDS.md`「跨仓形（`crossRepo`）**不进入本面**」· `docs/core/design/BATCH-RECORD.md`「`crossRepo:"dangling"`（本面不放宽跨仓形）」；§15 设计档行只列 `docs/core/design/MANIFEST.md` ∥ `docs/core/design/PATH-RESOLUTION.md` ∥ `docs/core/design/DOC-DISCIPLINE.md` ∥ `docs/core/design/DOC-CHECK.md` 四档 |
| 3 | 🟡 | 待改 | §7 AC-1「全仓 `grep -rn "crossRepo" thincoder-core`」；`test/integration/path-resolution.test.mjs` 的断言消息「形态错不落 crossRepo」不在该面内，退役读全则漏 test 面 |
| 4 | 🟡 | 待改 | §5「未核（声明源缺位）  <pointer>  ←  仓 <repo>」是逐指针行形，而 §4 第 5 步「把该节点写进 `未核` 列报」的走查止步节点没有指针；§8 用例表只断「报面有 `未核` 行」，无行形、无 AC |
| 5 | 🟡 | 待改 | §13「同名条第 3 行」——该句实属 `thincoder-core/prompts/discipline-normal.md` 的「Self-containment governs writes; reading is unrestricted」条（非同名条）；§2 全篇「需求档 ⑤」未落全路径 |
| 6 | 🟡 | 待改 | §13「原文」少了粗体与句尾「(project manifest `index.publicRepos`)」，非逐字；§14 围栏首行「is judged; in `gate` mode such paths are listed as skipped instead.」属上一句（`thincoder-core/tool-docs/doc_check.md`），替换区间不定 |
| 7 | 🟡 | 待改 | §2 先例行只答那条腿（`resolveDeclaredRef`）；新名 `declaredRepos` ∥ `unverified` ∥ `锚·环引` 无三问形（无 existing ∥ none found ∥ existing but unusable 之一） |
| 8 | 🟡 | 待改 | §6「层级结论：无档跨层」未给量法命令、函数级未表；本席六档 spot-check 与该结论相符（仅 `thincoder-core/doc-check/index.mjs` 过 500、无档过 800），结论对、命令缺 |
| 9 | 🟡 | 待改 | 验收 ⑤ 的「叶仓被声明后可解析」无断言：§7 AC-7 ∥ §8 用例表只断「零 `环引`、零抛错」，未断叶仓内的档可解析为 `resolved` |
| 10 | 🟡 | 待改 | §11「实施轮 `test('37-1 …')` 逐字用同一号」；`test/RTM.md` 编号为 `CLI 37`，既有用例题为 `test('CLI 29-4 …')` 形，前缀会丢 |

计数：🔴 2 · 🟡 8 · 🔵 0

- 实测佐证：`grep -rn "crossRepo" thincoder-core` 非零，点位与 §2 所记一致（无漏网调用点；漏的是 test 与 docs 面，见第 3 条）
- 实测佐证：`grep -rn 未核 thincoder-core` 0 命中；`PROJECT-MANIFEST.json` 的 `index.publicRepos` 为 `[]`
- 实测佐证：`test/rtm/paths.md` 的 29-4 ∥ 29-5 行在盘且原断言已假；`test/RTM.md` 索引末行为 `CLI 36`
- 设计自证成立、不另立条：AC-5 第 ① 条本身已分得开「未核」与「根本没看」，两跑并置是加固而非唯一依据
- 设计自证成立、不另立条：三态分格由 ⑤ ∥ ⑤-补 现文逼出，非设计自选（用户只说了「机检要拦截」，拦截由未声明那格承担）
- 设计自证成立、不另立条：环检落锚判据不新增判决词，与 ⑤-补「方向」一致

VERDICT: changes-required

### 轮次 2（评审子代理）

| # | 严重度 | 状态 | 证据（修后指针） |
|---|---|---|---|
| 1 | 🔴 | 已修 | §17 现文要点三条与 `docs/core/requirements/PROMPT-SYSTEM.md` 逐字一致（`核` 带「已声明」· `红` 带两析取项 · ⑤-补 带「声明根不在本机时」）；三条「依据」引文「声明根在本机时连目标一起校」∥「〔已声明 ∧ 声明根不在本机——列报不入闸；同根在机而目标缺失则判红〕」∥「叶仓被声明后可解析」在盘皆命中；「留父侧」那段已删 |
| 2 | 🔴 | 已修 | §15 设计档行改「六档」，含 `docs/core/design/ADVISOR-GUARDS.md` §12 ∥ `docs/core/design/BATCH-RECORD.md` §4.15；§2 落点表两行各写替换后措辞（「本面不传 `declaredRepos`」），两处原文在各自节内皆命中 |
| 3 | 🟡 | 已修 | AC-1 改三面（`thincoder-core/**` · `test/**` · `docs/core/**`）并列红侧 31 / 1 / 28；`docs/batches/**` 与批档测试档明写为过程面 |
| 4 | 🟡 | 已修 | §5 定死「一个声明根一行」，形含 `触发 = <pointer 逐个列出 ∥ 环走查止步（该根无出边可读）>`；§4 第 5 步改指该行形；AC-10 ∥ §8 用例行 ∥ 37-4 同步 |
| 5 | 🟡 | 已修 | §13 改按条目标题指「Self-containment governs writes; reading is unrestricted」（两档皆确有该条目），行号已去；R4 ∥ KD-2 ∥ §17 依据行皆落全路径 |
| 6 | 🟡 | 已修 | §13 原文连粗体与句尾括注一并引，并明写「句尾那个括注随本句一起删」；§14 补起点 ∥ 终点 ∥ 区间外零改三行边界 |
| 7 | 🟡 | 已修 | §2 三名三问齐：`declaredRepos` = `none found:` · `unverified` = `existing: thincoder-core/agent-tools/verify.mjs` · `锚·环引` = `none found:`；并答「既有三类名一个都不能借」 |
| 8 | 🟡 | 已修 | §6 补 `doc_check` 的 `lines` 量法与实跑读数（234 / 130 / 372 / 686 / 300）· 越硬限 0 档 · 函数级结论；改口「收口轮按同一量法复量，不预先宣称净减」 |
| 9 | 🟡 | 已修 | AC-7 加第四 Clause（A 声明无 manifest 的 C ⇒ 指 C 内在盘档 `resolved`、首行 `PASS`）；§8 加一用例行、37-3 加一句 |
| 10 | 🟡 | 已修 | §11 定死「测试标题逐字 = `test('CLI 37-1 …')`」并写明 `CLI` 前缀属编号的一部分 |

计数：🔴 2 已修 · 🟡 8 已修 · 新 🔴 0 · 新 🟡 0

- 复核实证：`thincoder-core` 五个源档内的 `crossRepo` 点位与 §2「三条代码事实」一一对应，无漏网调用点
- 复核实证：`docs/core/design/ADVISOR-GUARDS.md` 的「跨仓形（`crossRepo`）**不进入本面**」确在其 §12 节内
- 复核实证：`docs/core/design/BATCH-RECORD.md` 的「（本面不放宽跨仓形）」确在其 §4.15 节内
- 观察不立条：本席对 `thincoder-core` 面的 `crossRepo` 计数 30 行、设计红侧记 31 行——差 1 行，多落在本席工具跳过的目录，不改「三面皆红」的判读；实施轮宜按 `Select-String` 复钉基线
- 观察不立条：§17 的三条逐字引文现在在盘命中，属设计有意的「需求档再改即报 `引缺`」，不是死引文

VERDICT: pass

## §4 用户批准（主 agent）

**用户放行（批级）**：2026-11-08 09:30 逐字「自动跑完」。

- 覆盖面 = 本批全链：设计评审 ∥ 修正轮 ∥ 设计档落文 ∥ 实施 ∥ 收口。**「设计过了还要不要问一声」这件事，用户已经答过。**
- 批准对象 = `§3` 第 2 轮 `pass` 的那份设计（`§2` 状态行 `设计完成`）；实施按它落，未偏离。

**四形状逐个未触发**：

- 无「评审 🔴 修不掉或要改设计语义」——第 1 轮两条 🔴 均在第 2 轮复验为已修。
- 无「实施要偏离已批设计」——三条 drift 是设计档与 `§2` 的措辞不一致，按 `§2` 落并回改设计档。
- 无「用户叫停」。
- 无「批外新需求」——`AC-9` 的 48 条落差是本批自己判出来的既有存量，不是新范围；处置（不清、挂账 `#2173`）由父侧裁定。

**父侧在批内的两次自裁（记录在此，供复核）**：

- `index.publicRepos` 由 `[]` 改为 `["../.thincoder"]`——理由与读数见 `§1`。
- `AC-9` 由「新增 0」改为「新增全为真跨仓指针」——理由 = 原前提为假，见 `§2` 与 `§5` 第三节。

## §5 实施记录（eng-coder）
**状态行**：实施完成（AC-9 的 48 条落差已按父侧裁如实入 §5 第三节；出清单改动三条、设计 drift 三条）



### 一、落了什么（逐档一行 · 仓根全路径；`§2` 第六节 ∥ 第十三节 ∥ 第十四节逐条对位）

**产品码（改）**

- `thincoder-core/path-resolve.mjs` — 删 `crossRepoOf` ∥ `crossRepoNote`；选项 `crossRepo` 退场、`declaredRepos`（布尔、缺省关）登场；第 6 步换成声明仓腿（声明根不在机 ⇒ `unverified` 四格；在机 ⇒ 判余段存在性）；`dangling` 增四格载荷（`declaredRepo` ∥ `declaredRoot` ∥ `rootOnDisk` ∥ `siblingRepos`）。
- `thincoder-core/declared-repos.mjs`（新 · 叶档 94 行）— `declaredOutEdges`（出边三合投影：目录名 ∥ 声明项原文 ∥ 本机在盘）+ `declaredCycles`（沿出边 DFS，只报穿过起点的环；止步节点单列）。只 import `node:*` + `thincoder-core/manifest.mjs` + `thincoder-core/declaration.mjs`。
- `thincoder-core/doc-check/anchors.mjs` — `resolveDoc` 传 `declaredRepos`；两处收集点由 `crossRepo` 改收 `unverified`（**不入 `hits`**）；新增环检（按组根走一遍）产 `环引`；`档缺` 载荷透传（两处产出点收成一个 `danglingHit`，同一 token 不再两套载荷）。
- `thincoder-core/doc-check/index.mjs` — `crossRepoNote` 的 import 与 `crossRepoLine` 删；`unverified` 并集 + `未核 N 条（声明源缺位——列报不入闸）` + 逐声明根行（`unverifiedBlock`，一个声明根一行、条数按声明根计）；`ANCHOR_LABELS` 增 `环引` 与它的行形；`档缺` 括注增声明仓两格与未声明注解。
- `thincoder-core/agent-tools/review-facts.mjs` — 删 `crossRepo: "dangling"` 实参（行为零变）。
- `thincoder-core/agent-tools/batch-paths.mjs` — 只改那行 JSDoc（实参面零改）。

**提示词（改 · 逐字终稿照 `§2` 第十三节）**

- `thincoder-core/prompts/discipline-engineering.md` ∥ `thincoder-core/prompts/discipline-normal.md` — 四行终稿替换旧句（句尾括注随句一起删）；两面缩进各随自己的列表层级，行文本逐行相等。
- `thincoder-core/prompts/common.md` — 「Documents in other repositories」段插入 `One key, two consequences` 一行，其余三行零改。

**工具描述（改 · 照 `§2` 第十四节）**

- `thincoder-core/tool-docs/manifest.md` — `index.publicRepos` 那条换成出边表语义 + 两条续行。
- `thincoder-core/tool-docs/doc_check.md` — 解析序那句换成三行终稿（区间外零改；区间内那个空行随区间删掉，另在旧句尾巴之后补了一个空行——否则旧句尾巴与新句并段会越过 300 字符的段判据；正文逐字未改）。

**测试**

- `test/integration/path-resolution.test.mjs` — 29-4 改写（已声明在盘 ⇒ `PASS`；错节号 ⇒ `锚·节缺`；未声明仓名 ⇒ `锚·档缺` + 同级候选 + 未声明注解）；29-5 只删「不落跨仓读数」那半句。
- `test/integration/cross-repo-refs.test.mjs`（新）— 故事 CLI 37：37-1 … 37-4，标题逐字带 `CLI` 前缀。
- `test/rtm/paths.md` — 29-4 ∥ 29-5 行改写；新增 `## CLI 37` 节与四行。
- `test/RTM.md` — 故事索引表增 `CLI 37`（属册 `paths`）。
- `docs/batches/2026-11-08-cross-repo-refs.test.mjs`（新 · 本批单元测试档 · 13 例 · 收口删）。

### 二、AC 逐条：改前读数 ∥ 改后读数

改前读数取改代码之前的实跑（夹具 = 系统临时域，七形一次跑完）；改后读数是同一夹具在改后重跑。

```text
P1 已声明在盘档          改前 命中 0 条 + 行「跨仓引用：B/docs/guide.md → 仓「B」的…（声明源引用，未校验存在性）」+ gate PASS
                        改后 命中 0 条、无该读数行、gate PASS
P2 已声明 + 错节号        改前 命中 0 条、gate PASS          ⇒ 错节号不被判
                        改后 锚·节缺 1 条、gate REFUSED（锚 1 条）
P3 已声明 + 缺档          改前 命中 0 条、gate PASS          ⇒ 存在性不被判
                        改后 锚·档缺 1 条（声明仓 B（声明根 ../B，本机在盘：在））、gate REFUSED
P4 已声明但根不在本机     改前 命中 0 条 + 跨仓读数行、无「未核」这一形
                        改后 未核 1 条（声明源缺位——列报不入闸）+ 该根一行（触发 = 指针 ∥ 环走查止步）、锚 0 条、gate PASS
P5 未声明同级仓           改前 命中 0 条 + 行「引用外部仓「C」——…须先在 index.publicRepos 声明」
                        改后 锚·档缺 1 条（本机同级目录：…；该名未在 index.publicRepos 声明）、gate REFUSED
P6 A ↔ B 互声明成环       改前 命中 0 条、gate PASS           ⇒ 全仓零环检
                        改后 锚·环引 1 条（publicRepos 成环：A → B → A）、gate REFUSED（锚 1 条）
P7 叶仓被声明后指其档     改前 命中 0 条（跨仓读数行）         ⇒ 结论相同但走的是读数
                        改后 命中 0 条、gate PASS（`resolved`，与仓内指针同形）
```

- **AC-1**（退役读全 · 三面各判）改前 `thincoder-core` 30 行 · `test` 1 行 · `docs/core` 0 行 ⇒ 改后 **0 / 0 / 0**（量法 = node 逐行扫，串 `crossRepo`；单元档 U-8 同判）。
- **AC-2 ∥ AC-3**（已声明在盘 ⇒ 零命中；错节号 ⇒ 节缺）由上表 P1 ∥ P2 两跑成立；AC-2 单独不可判红（改前同输入也零命中），与 AC-3 合判——真正红的是「节在盘」那一半。
- **AC-4**（声明根在盘、指已声明缺档 ⇒ 档缺 + `REFUSED`）= P3；**AC-5**（声明根不在机 ⇒ `未核` + `PASS`；删掉声明再跑 ⇒ `档缺` + `REFUSED`）= P4 + 集成 37-4 的删声明那一跑。
- **AC-6**（未声明同级目录 ⇒ 档缺 + 同级候选 + 未声明注解）= P5 + 集成 37-2；**AC-7**（成环 ⇒ 环引 + `REFUSED`；叶仓 ⇒ 零环引 + 其档可解析）= P6 ∥ P7 + 集成 37-3。
- **AC-8**（零回归）`node --test test/integration/path-resolution.test.mjs` 改前 = 5 例 4 过 1 红（29-4 按旧判据断言，红）；改后 = 5 例全过。29-1 ∥ 29-2 ∥ 29-3 零改零红。
- **AC-10**（同根两个产出方共用一行、条数按声明根计）单元档 U-7 两跑：带指针 ⇒ 触发两半都写；无指针 ⇒ 触发只剩 `环走查止步（该根无出边可读）`，条数仍是 1。

### 三、AC-9 的落差（父侧 2026-11-08 裁：照实记，不美化）

```text
AC-9 的「新增 0」不成立：实测新增 48（18 条 declaredRepo=.thincoder ∥ 30 条首段为同级目录名），
环引 0、未核 0；声明本身生效（.thincoder/advisor.md 四指针全 resolved）。
成因 = 设计前提「docs/** 无真跨仓指针」为假，不是实现缺陷。
```

- 量法：`doc_check` 的 gate 面对 `docs/**` 全部 255 档一次跑完，首行 `REFUSED（锚 4465 条 · 12 段文字太长，难于阅读 · 行号坐标 121 处）`；带本批新载荷的命中逐条可点——三例的原始点位见本节末围栏（自 48 条中挑出）。
- 改前这 48 条是 `跨仓引用：…` 读数行、零命中——它们不是本批新写进来的，是本批第一次被判。
- `publicRepos: []` 时条数一条不差（改走「未声明同级目录 ⇒ 档缺」，只是括注换词），故「基线与改后逐字相等」在任何声明取值下都不成立。
- 处置（父侧裁）：代码面照设计交付，`docs/**` 一条不清；AC-9 由父侧另派一轮改；那 48 条另批清账（笔在 `docs/**`，不在本批 files 内）。
- 其中最有价值的一条：声明表里的 `.thincoder` 指工作区工具目录，而文档里那个同名路径指的是用户数据目录下的 config——**同名不同物**（围栏第三行即此例）。这些红不是噪声，是文档真在指错地方。

```text
命中点位（原始读数 · 三例自 48 条中挑出）
  docs/TODO.md                        →  命中串  thincoder/docs/TODO.md
  docs/desktop/design/PACKAGING.md    →  命中串  thincoder.com/www/desktop.html
  （用户数据目录）                     →  命中串  .thincoder/config.json
```

### 四、跑法与读数（本轮实跑）

```text
node --test docs/batches/2026-11-08-cross-repo-refs.test.mjs      → 13 例全过
node --test test/integration/cross-repo-refs.test.mjs            → 4 例全过（CLI 37-1 … 37-4）
node --test test/integration/path-resolution.test.mjs            → 5 例全过（29-1 … 29-5）
node --test（doc-check 六档 + doc-write-gate + review-doc-scope + batch 门五档）→ 43 例全过
node --test（上列前四组同跑一次）                                  → 32 例全过
node scripts/prompt-refs-check.mjs                               → 命中 0 · exit 0
doc_check gate（本会话写的 7 档）                                  → 首行 DOC-CHECK GATE: PASS（0 命中）
node --check（改面 7 档源 + 4 档测试）                             → 全过
```

- 提示词 ∥ 工具描述两层的判据：旧串 `under the working directory` 两面各 0；新串 `proximity is not the boundary` 两面各 1；两面同一段四行逐行相等；`One key, two consequences` 1 且原句 `adds nothing to the searchable domain` 仍 1；`that repo is unreachable for retrieval` 0 ∥ `out-edge table` 1；`refused, not merely noted` 1 ∥ `first segment = that repo's directory name` 1（单元档 U-10 ∥ U-11 同判）。
- 写前门的仓级命中形（单元档 U-13）：成环项目的拒串取引擎那一行原文，**红侧实测** = 临时去掉那个分支后该例转红（拒串里没有 `✗ 锚·环引`），恢复后转绿。

### 五、行数读数（`countContentLines` 单源；数值只作读数，不当判据）

```text
thincoder-core/path-resolve.mjs              300 → 311
thincoder-core/doc-check/anchors.mjs         372 → 393
thincoder-core/doc-check/index.mjs           686 → 718（越 500 软线，既有；未越 800 硬限）
thincoder-core/agent-tools/review-facts.mjs  130 → 130
thincoder-core/agent-tools/batch-paths.mjs   234 → 234
thincoder-core/agent-tools/batch-gate.mjs    547 → 548（越 500 软线，既有）
thincoder-core/tools/doc-write-gate.mjs      243 → 247
新增：thincoder-core/declared-repos.mjs 94 · test/integration/cross-repo-refs.test.mjs 176
越 800 硬限 0 档；无新档越软线。
```

### 六、出清单改动（三条 · 各带理由）

1. `thincoder-core/agent-tools/batch-gate.mjs` — `ANCHOR_CLASSES` 增 `环引`（原三值）。理由：`§2` 定「`锚·环引` 与 `锚·档缺` 同计 `锚 N 条`」，不增则该类被切进段类，批档门的拒串会写成「1 处锚·环引」，与引擎首行「锚 N 条」相抵。净增 1 行。
2. `thincoder-core/tools/doc-write-gate.mjs` — 拒串映射加仓级命中一分支。理由：`环引` 没有行号，旧映射会把 `null` 当行号写进写者眼前（`✗ 环引 <目标档> 加 null` 那一形）——这是本批新命中形状落到既有渲染面上的缺口。净增 4 行，红侧读数见上。
3. `test/integration/doc-check-citation.test.mjs` — 那条源面直读断言的字面集从三值改四值（`环引`）。理由：它按整串匹配 `ANCHOR_CLASSES` 的构造式，集合一变即红；断言意图（锚类集含 `引缺`）零改，只跟集合同步。

### 七、报给设计席的 drift（三条 · 请父侧转）

- `docs/core/design/PATH-RESOLUTION.md` §1 的叶档 import 面写着两条（`thincoder-core/manifest.mjs` + `thincoder-core/declaration.mjs`），实际是三条：`thincoder-core/path-resolve.mjs` 也 import 了新增的 `thincoder-core/declared-repos.mjs`。理由：声明出边的投影（目录名 ∥ 声明项原文 ∥ 在盘）在解析层与环检两处都要，两处各写一份就是同一机制的第二个实现。
- `docs/core/design/DOC-DISCIPLINE.md` §3.20 报面模板里 `锚·环引` 一行写的是「档名 + 行号」，而 `§2` 第五节定的是 `✗ 锚·环引 PROJECT-MANIFEST.json（<根>）publicRepos 成环：…`——环是仓级事实、没有行号。本席按 `§2` 落（`§2` 是更具体的那一份），请设计席把前者那一行收正。
- `docs/core/design/PATH-RESOLUTION.md` §3 的改面源码表未列本批必需的 `thincoder-core/agent-tools/batch-gate.mjs` 与 `thincoder-core/tools/doc-write-gate.mjs`（就是上面第六节前两条）。

### 八、上抛项与遗留

1. **【已裁】** AC-9 的落差（第三节）——父侧裁：如实记录、`docs/**` 不清、AC-9 另轮改写。本节即按裁落。
2. **【知会】** `KD-8` 的单源债仍在：`thincoder-core/declaration.mjs` 的 `resolveDeclaredRef` 与本批新增的声明仓腿是同一形映射的两处实现。本批按设计未动它，请父侧记账、下一轮并源。
3. **【知会】** `PROJECT-MANIFEST.json` 的 `index.publicRepos` = `["../.thincoder"]` 是父侧 2026-11-08 改的，不是本席的笔；本席只验证了它生效（出边表 1 条、零环、零未核）。
4. **遗留（已知、不修）**：成环时一整个项目的文档都写不进去（环是项目级事实，与 `§2`「环与档缺同计锚」一致，但判面比单个档宽）。本批未遇实景，记录在此。

## §6 验证与收口（父代理）

**单元测试（已删）**：`docs/batches/2026-11-08-cross-repo-refs.test.mjs`（13 例，覆盖三态 ∥ 环引 ∥ 未核 ∥ 退役归零）。收口时删除。读数一次：实施席跑 `node --test` 该档 ⇒ 13 例全过；父侧收口前的合并跑（含集成三档）⇒ 23 例、`fail 0`。

**集成（父侧收口跑一次）**：

```text
node --test test/integration/path-resolution.test.mjs test/integration/cross-repo-refs.test.mjs test/integration/doc-check-citation.test.mjs
⇒ tests 23 · pass 23 · fail 0 · duration 1361ms
```

- 本批增 4 例（`CLI 37-1` … `37-4`）、改写 2 例（`29-4` ∥ `29-5`）。`test/RTM.md` 增 `CLI 37` 故事、`test/rtm/paths.md` 记四行。
- **全集规模本轮未量**——不写臆数。下一轮收口要报「N / 50–100」时，先量再写。

**核心三条的红侧（改前 ∥ 改后，同一夹具两跑）**：

- 未声明同名仓 `C`：改前「引用外部仓『C』——须先声明」读数行、首行 `PASS`；改后 `锚·档缺` + `REFUSED`。
- 成环 `A → B → A`：改前全仓零环检、`PASS`；改后 `锚·环引` + `REFUSED`。
- 已声明但根不在本机：改前报面无「未核」这一形；改后 `未核 1 条（声明源缺位——列报不入闸）` + 逐声明根行、`PASS`；**删掉声明再跑同一指针** ⇒ `锚·档缺` + `REFUSED`（两跑输出不同 = 这条指针两次都被看了）。

**交付门（本仓实现，非会话工具）**：

```text
交付面 12 档（批档 ∥ 六设计档 ∥ 三提示词 ∥ 两工具描述 ∥ 需求档）
⇒ hits { total: 0, anchors: 0, paragraph: 0, lineRefs: 0 }

docs/core/design/MANIFEST.md 单跑 ⇒ hits 67（存量，见下）
```

**`MANIFEST.md` 67 条已做归因，不是估的**：本批给该档的改动只有一处 hunk（新侧 151–155 行），67 条命中行里无一条落在这五行内 ⇒ **本批新增 0**。

**已知存量与未决（各有指向，不重复叙述）**：

- `docs/**` 48 条跨仓指针 ⇒ 台账 `#2173`（归批）。
- `MANIFEST.md` 存量裸名锚 ⇒ 台账 `#2129`（该行记的「64」是旧构建读数；现值 67，**两个数不同源于构建不同，判别看新增**）。
- `thincoder-core/declaration.mjs` 的 `resolveDeclaredRef` 与新增声明仓腿同形两处实现 ⇒ 台账 `#2172`（条件）。
- **`DOC-CHECK.md` §6 AC-2（本仓固定三档与基线逐字相等）未重取基线**：本批后带跨仓指针的档会新增 `锚·档缺`。**归入 `#2173` 同一口径**（该批清账时一并重取），本批不另开。

**暂缓批复核：无。**

**用户可见面**：无新增 UI 或交互面，本轮零改动（`doc_check` 报面多两行属工具输出面，已在 `§2` 与设计档记）。

**结算**：`#2171` 已核销；`#2172` ∥ `#2173` 各自在账；`#2129` 仍在账。
