# 文档锚点图（DOC-GRAPH）· 设计

> 需求单源 = `docs/core/requirements/DOC-GRAPH.md`（六功能点 ∥ 六边界 ∥ 六验收，2026-11-09 定稿）。本档只答「怎么建」，不重述需求口径。

## 1. 方案与理由

**一句话方案**：把 `doc_check` 锚判据那一次逐行遍历**顺手产出的边**收集起来，写进台账同一个 SQLite 文件的一张 `doc_edges` 表；查询面是一个新工具 `doc_graph`，四种问法（扫 ∥ 正向 ∥ 反向 ∥ 链路）。**不新写文档解析器，不新开库。**

### 最近先例

- **台账（`thincoder-core/ledger-db.mjs` ∥ `thincoder-core/ledger-tools.mjs`）——对齐**：同一 `node:sqlite` 句柄、同一「按项目根开库」、同一「单工具 + `action` 枚举」的交互形状、同一中文枚举进 `CHECK` 的写法。本面照抄这四样，不另立风格。
- **`doc_check`（`thincoder-core/agent-tools/doc-check.mjs`）——对齐抽取面、偏离查询面**：抽取面直接复用；查询不并进 `doc_check`，理由见 §4 KD-2。
- **偏离台账的一处**：台账的写面是「用户点一下、工具改一行」；边表的写面是「扫一次、整档重写」。故边表按 `scope`（引用方那一档）整档替换，不做逐边增删——文档改了，它那一档的边全换，没有「旧边留一半」的中间态。

### 勘察证据（做完才算设计）

- 已查 `thincoder-core/doc-check/anchors.mjs` 的 `checkAnchors`：逐档逐行抽 token、解析、判节在盘；**失败进 `hits`，成功只留一条 `suffixHits` 读数**——「算完就丢」成立，边要落库只需在同一个循环里旁挂一个收集器。
- 已查 `thincoder-core/ledger-db.mjs`：`import { DatabaseSync } from "node:sqlite"` 静态导入；建表 DDL 是一段 `CREATE TABLE IF NOT EXISTS items (...)` 幂等串；版本号当前为 2（依据 `thincoder-core/ledger-db.mjs`「export const LEDGER_SCHEMA_VERSION = 2」）。同库加表 = 同一 DDL 串里再加一条语句 + 版本号升一号。
- 已查 `PROJECT-MANIFEST.json`：`docRoot` 五类根齐备（requirements ∥ specs ∥ design ∥ modules ∥ batches），`index.publicRepos` = `["../.thincoder", "../thincoder.com"]`。
- 已查 `test/RTM.md`：索引表按「故事号 ∥ 标题 ∥ 属册 ∥ 三端矩阵」一行一故事，故事本体住 `test/rtm/` 下按族分册，一行一集成用例。故事号现到 `CLI 42`，`CLI 43` 空着。
- 已查 `test/integration/edit-batch-entry-outcome.test.mjs` 与 `test/rtm/tooling.md` 均在盘——AC-1 的第四跳目标真实存在。
- 已查库外（读数在批档 §1「试扫结果与 AC-1 改判」）：SCIP ∥ LSIF 索引的是声明与引用；TIA 用运行时覆盖建「代码→用例」映射。结论 = 静态面能出的就是引用边，运行时覆盖那一支本版不做。

### 数据事实检查

**需要读数据的断言 = 一条**：AC-1 的五跳能不能连。读数已在批档 §1 的试扫实况表（父侧手跑五行）：前四跳连上，第五跳落在 `editTool` 上才连得上，落在 `editBatchSummary` 上连不上。本档不新增未读过的数据断言。

### 起点事实：需求档 F2 列的六种锚形状，今天只有两种在抽取面上

需求档 F2 写「`doc_check` 今天就在算这些」。读实现：抽取面 = `ANCHOR_RE`（只认扩展名清单内的**档 token** + 紧随的 `§N` 节号）加 `CITE_RE_SRC`（`依据` 行的引文面）。清单常量与取形口径单源 = `docs/core/design/DOC-CHECK.md` §2.6，清单外的形不入判：

| F2 列的锚形状 | 今天的抽取面 | 本设计的落点 |
|---|---|---|
| `doc:section` 形（档 token） | 在（`ANCHOR_RE`） | 原样复用 |
| `§N.M` 节号 | 在（`ANCHOR_RE` 的节指示组） | 原样复用 |
| 反引号里的符号名 | **不在**（`codeSpans` 只用来**跳过**码段区间，不产出符号 token） | 同一次遍历里加一支（§2.2 的 `cites-symbol`） |
| `test/RTM.md` 的行号 | 不在（行号面算的是 `档:N` 坐标，不是 RTM 行） | 由档 token 覆盖：RTM 行末列是档路径，本身就是一条边 |
| 台账的 `task_book` | 不在（那是台账列，不是 `doc_check` 的输入） | 查询面从 `items` 投影成边，不抽（§2.4） |
| 需求编号（`F16` 这类） | 不在 | 同一次遍历里加一支 |

**这不是绕开需求，是把 F2 的规则（同一份文档只有一套解析器）落到实际起点上**：加的两支住在同一次遍历里，不引第二个解析器。F2 的那句话与实现不符，已列入批档 §2 上抛项，请主 agent 决定是否收正需求档措辞——本档不改需求档。

## 2. 接口契约

### 2.1 节点身份文法（闭集，六种）

```
req:<编号>              例 req:F16 ∥ req:AC-1
doc:<仓相对路径>        例 doc:docs/core/design/EDIT.md
doc:<仓相对路径>#<节号> 例 doc:docs/core/design/EDIT.md#5
case:<用例编号>         例 case:CLI 41-1
symbol:<符号名>         例 symbol:editTool
ledger:#<行号>          例 ledger:#2236
```

**身份按目标算，不按字面算**（F6）：两档各用一种说法引同一节，产出的 `dst` 是**同一个**节点，所以反向查两条都回来。节号漂了靠 `dst_label`（节标题原文）认——这就是批档 §1 记的「节号 + 节标题双锚」，表里两列都存。

### 2.2 边的形状与三种来源

边 = `(src, kind, dst, evidence, state)`。`kind` 闭集五值，每一种只有一个产出面：

| kind | src → dst | 产出面 | 依据 |
|---|---|---|---|
| `cites` | `doc:` / `doc:#N` → `doc:` / `doc:#N` | 锚抽取（档 token ± 节指示）∥ `依据` 行 | 抽取面现成；`依据` 行今天已在判引文（`CITE_RE_SRC`），同一 token 已占区间，顺手成边不重抽 |
| `cites-req` | `doc:` → `req:` | 需求编号形（`F\d+` ∥ `AC-\d+`） | AC-1 第一跳：`docs/core/design/EDIT.md` §7 的 RTM 增量表「回指」列写着 `F16` |
| `mentions-case` | `doc:` → `case:` | 用例编号形（族大写 + 空格 + 数字-数字，族表取 `test/RTM.md` 的故事号前缀） | AC-1 第三跳：批档 §2 与 §6 都写着 `CLI 41-1` |
| `cites-symbol` | `doc:` → `symbol:` | 反引号内的标识符（标识符字符类，且不是档 token、不是路径） | F2 列的锚形状之一；今天的码段扫描只跳不取 |
| `imports` | `doc:`（代码档）→ `symbol:` | `import … from "<说明符>"` 语句扫描，说明符解析到仓内档后取**具名导入** | AC-1 第五跳：用例 `import { editTool }`；边是 import 边不是断言边（需求档 §3 第一行） |

**只有一条方向**。反向查是索引查，不存 `imported-by` 这种镜像边——存两行就是两处记账（`#2183` / `#2233` 那个病）。

### 2.3 表结构（同库，不第二库）

```sql
CREATE TABLE IF NOT EXISTS doc_edges (
  id         INTEGER PRIMARY KEY,
  src        TEXT NOT NULL,
  src_label  TEXT,
  kind       TEXT NOT NULL CHECK(kind IN ('cites','cites-req','mentions-case','cites-symbol','imports')),
  dst        TEXT NOT NULL,
  dst_label  TEXT,
  evidence   TEXT NOT NULL,
  state      TEXT NOT NULL CHECK(state IN ('ok','目标不在盘','判不了存在性')),
  scope      TEXT NOT NULL,
  scanned_at TEXT NOT NULL,
  UNIQUE(src, kind, dst, evidence)
);
CREATE INDEX IF NOT EXISTS doc_edges_dst ON doc_edges(dst);
CREATE INDEX IF NOT EXISTS doc_edges_scope ON doc_edges(scope);
```

- 落点 = `thincoder-core/ledger-db.mjs` 的 `DDL` 串里加这一段（与 `items` 同一个 `db.exec`、同一个文件）。`LEDGER_SCHEMA_VERSION` 由 2 升到 3——结构变更升号是本档既有规矩。
- `evidence` = 引用方那一档的仓相对路径 + 行号 + 那一处的原文片段。**行号只作边的产地读数，不作节点身份**：节点指档案与符号，档里插一行不会让任何边失效。
- `state` 三值直接对齐 `doc_check` 的三种诚实度：`ok` ∥ 目标解不到（`档缺` 那一面）∥ 判不了存在性（声明仓根不在本机，`unverified` 那一面）。
- `scope` = 引用方那一档的仓相对路径。重扫一档 = 先按 `scope` 删、再插，别档的边零动。

### 2.4 台账号不复制进边表

台账 `items` 的 `req_doc` ∥ `task_book` ∥ `board` ∥ `executor` 是四条现成的边（需求档 §1「这不是新系统」）。**查询面在内存里把它们投影成边读，不落进 `doc_edges`**：同一件事存两份正是本项目反复治的病。投影规则：

```
task_book → ledger:#N --task_book--> doc:<指针的档部分>
req_doc   → ledger:#N --req_doc--> doc:<档部分>
board     → ledger:#N --board--> board:<名>
```

链路查询因此是「`doc_edges` ∪ `items` 投影」的一次图走查，不是两套数据对账。

### 2.5 工具面：`doc_graph`，一个工具四种问法

| action | 参数 | 输出 |
|---|---|---|
| `scan` | `target`（项目根，必填）∥ `scope`（可选：只重扫这些档） | `扫 N 档 · 落 M 条边 · 目标不在盘 K 条 · 判不了存在性 J 条` |
| `forward` | `target` + `node` | 该节点出去的边，一行一条：`kind → dst`，后随 `evidence` |
| `reverse` | `target` + `node` | 指向该节点的边，一行一条：`src --kind-->`，后随 `evidence` |
| `chain` | `target` + `node`（通常是 `req:`） | 从该节点走出的最短链，逐跳一行 |

**`node` 不给默认值**（设计参数零默认）：缺 `node` ⇒ 边界拒，报文点名 `node`。`target` 同理——`doc_check` 就是这条规矩，本面沿用。

反向查的**一通**：查 `doc:P#5` 时，边集 = 「`dst` 恰是 `doc:P#5`」∪「`dst` 是 `doc:P`（整档引用）」。理由：整档引用落在哪一节，读者都要从头找；不并入，AC-5 那条「裸名形引用」就查不到。反向查 `doc:P`（不带节）时**不**向各节展开——反过来收窄，不放大。

### 2.6 抽取面怎么接（一次遍历，两个消费者）

`checkAnchors` 增一个可选入参 `onEdge`（回调）：循环里每判定一处 token，先调它、再走原来的判定。回调缺席 ⇒ 行为逐字节不变（判定面、命中面、读数面全零改）。

- 成功解析的那一支今天**什么也不产出**，正是要接的位置；
- 失败的那一支已经在 `hits` 里，回调拿同一条记录，`state` 记 `目标不在盘`——**边照落**（AC-6：不静默丢弃、不猜替代目标）。

代码档的 `imports` 边不吃这个回调（它要读的是 import 语句，不是文档锚），由边表的写入侧自己扫一遍——同一档读一次，不回头重读。

## 3. 受影响文件清单与分层结论

**现有档（改）**：

| 文件 | 改动 |
|---|---|
| `thincoder-core/doc-check/anchors.mjs` | 增 `onEdge` 可选入参 + 成功支一处回调；零行为变更 |
| `thincoder-core/ledger-db.mjs` | `DDL` 串加 `doc_edges` 表；`LEDGER_SCHEMA_VERSION` 2 → 3 |
| `thincoder-vscode/scripts/check-vsix.mjs` | `EXPECT` 的 `"tool-docs"` 计数 54 → 55 |

**新档（本批建，落盘前不在盘）**：

```
thincoder-core/doc-check/graph-tokens.mjs   三支新 token 家族（需求编号 ∥ 用例编号 ∥ 反引号符号）的纯函数
thincoder-core/doc-graph.mjs                扫描编排 ∥ 落库 ∥ 三查询 ∥ 降级读数 ∥ 盘上端点判定
thincoder-core/agent-tools/doc-graph.mjs    工具面：入参校验 ∥ 动作分派 ∥ 文本回执
thincoder-core/tool-docs/doc_graph.md       模型可见描述（描述外置的既有做法）
```

**本批单测档**：与批档同名、同目录，收口删除。

**分层结论**：无档跨层。`thincoder-core` 内部三个改动各自在本层；唯一跨包的一处是 `check-vsix.mjs` 的计数常量——它不搬逻辑、只改一个数，跟着同一个交付走。

**W8 契约②**：消费侧一律动态 import 台账库（依据 `thincoder-core/ledger-db.mjs`「本档静态 import node:sqlite ⇒ 消费侧一律动态 import 本模块链（W8 契约②——KD-M2-3）。」）。新加的两个 core 消费面因此一律**动态** `import()`——与 `ledger-tools.mjs` 同一条纪律。

## 4. 关键决策记录

**KD-1 · 边从 `doc_check` 的遍历里旁挂产出，不新写解析器。** 被拒：另写一个独立的边抽取器去读同样的文档。理由：同一份文档被两套解析器读，两边迟早给出不同答案（F2 的原话），而边与判定一旦分叉，「这条边为什么 `doc_check` 没报」就没有答案。

**KD-2 · 新工具 `doc_graph`，不并进 `doc_check`。** 被拒：给 `doc_check` 加一个图查询的 action。理由：`doc_check` 的返回面是**判决**（首行 `DOC-CHECK GATE: PASS/REFUSED`，有 verdict 词、有闸门语义）；塞进查询面，读者与脚本都会把非判决输出按判决解析，而需求档 §3 明写两者「判的东西不同，不合并」。代价是多一个工具描述档与上面那个计数常量——已列进受影响文件。

**KD-3 · 只存一条边，反向靠索引。** 被拒：`imports` 与 `imported-by` 各存一行。理由：同一事实两行，删一处漏一处（`#2233` 那类两处记账）。

**KD-4 · 台账号不复制，查询面投影。** 被拒：扫台账时把 `task_book` 等列灌进 `doc_edges`。理由同上，且台账行会变（状态迁移、`task_book` 改指针），复制出来的边立刻过期。

**KD-5 · 边落库带三种 `state`，失败也落。** 被拒：只落解析成功的边。理由：AC-6 要求端点不在盘时明说，而反向查恰恰最需要看见「这档已经没了但还有三处在引它」；只落成功的边正好把这个信号丢掉。

**KD-6 · 反引号符号边只认「具名可见标识符」，不做断言字面量近似匹配。** 被拒：用断言里的字符串去猜它指的是哪个符号。理由：需求档 §3 第一行已裁定用例到代码是 import 边；近似匹配是语义反推，与本档「不引大模型抽边」的边界相冲，且会让「链断没断」这个判定失真（一条要标「弱」才敢用的边，不如没有）。

**KD-7 · `doc:<path>#N` 的 `N` 按字符串等值判，不做数值比较。** 理由：`§5` 与 `§05` 是两处写法，把节号归一化会顺手把「标题里恰好有别的数字」也归进来；`doc_check` 判节在盘今天就是字符串等值，本面同一把尺。节标题的容错走 `dst_label`，不走数字。

## 5. 验收判据（逐条回指需求档 §4）

| 需求 | 设计面判据（读者可判 ∥ 机检命令） |
|---|---|
| AC-1 | 在本仓跑 `scan` 后跑 `chain` 且 `node:"req:F16"`，输出是一条**五跳**的链：`req:F16` → `doc:docs/core/design/EDIT.md#5` → `docs/batches/2026-11-09-edit-batch-atomic-receipt.md` → `case:CLI 41-1` → `symbol:editTool`，每跳带 `evidence`。缺任一跳 ⇒ 判红。第五跳**不是** `symbol:editBatchSummary`：那条边在静态面上不存在 |
| AC-2 | 对 `doc:docs/core/design/EDIT.md#5` 跑 `reverse`，结果集含 `req:F16` 与那本批档两条 `src`，两条都带非空 `evidence` |
| AC-3 | 扫完之后台账目录里的文件清单长度不变（新库不出现）；`sqlite_master` 的 `type='table'` 清单含 `items` 与 `doc_edges` 两张，且二者同属台账那一个库文件 |
| AC-4 | 在一个无 `docRoot.requirements` 的目录上跑 `scan`：退出正常，首行含「本仓无需求层」，次行列出该仓实出的 `kind` 集合；不出现空的边表当结果 |
| AC-5 | 构造两段文本引同一节：一段写 `EDIT.md §5`，一段写裸名 `EDIT.md`；`reverse` 查 `doc:…#5` 两条都在 |
| AC-6 | 构造：目标档移走后重扫 ⇒ 该边 `state` = `目标不在盘`，`dst` 保持原值不被替换，`forward` 面上仍列出它并标该状态 |

## 6. 用例表

| # | 类 | 输入 | 期望输出 |
|---|---|---|---|
| 1 | 正常 | 扫 `docs/core/design/EDIT.md` | `cites` 边逐条带 `evidence`；重复扫 ⇒ 边总数不变（`UNIQUE` 咬合） |
| 2 | 正常 | `reverse` 查 `doc:docs/core/design/EDIT.md#5` | 含 `req:F16` 与本批批档两条 |
| 3 | 正常 | 用例档 `import { editTool } from "…"` | `imports` 边 `doc:<用例档> → symbol:editTool` |
| 4 | 边界 | 同一节被「节号形」与「裸名形」各引一次 | `reverse` 两条都回来（§2.5 的一通） |
| 5 | 边界 | 无 `docRoot.requirements` 的项目根 | 「本仓无需求层」+ 实出的 `kind` 集合，不报错 |
| 6 | 边界 | 同一档扫两次 | 第二次先删后插，别档边数零变 |
| 7 | 错误 | 入参缺 `node`（`forward` / `reverse` / `chain`） | 拒绝，报文点名 `node`；不以空结果当答案 |
| 8 | 错误 | 边的目标档被删后重扫 | 该边 `state` = `目标不在盘`，不丢弃、不换目标 |
| 9 | 错误 | `target` 指向不存在的目录 | 拒绝并点名 `target`；不落任何边 |
| 10 | 错误 | 台账库读不到（权限） | 报明读失败，不输出「空图」（读不到 ≠ 干净，与 `doc_check` 的读面同一口径） |

## 7. 边界（本设计不做的事）

- **不做运行时覆盖**，不问「哪个用例真跑到了这个符号」。那要插桩跑测试，需求档 §3 已划到本版之外。
- **不做断言字面量的近似匹配**（KD-6）。
- **不做语义相似度**：`dst` 按目标身份连。同一概念换两个名字认不出——需求档 §1 已把这一条作为取舍写明，本版不管。
- **不做常驻索引**：`scan` 是一次性动作，没有 watch、没有后台进程。
- **不判内容质量**：边只记「谁引了谁」与「目标在不在盘」。
- **不给搜索结果排序**：`forward` / `reverse` 按 `kind`、`src`、`dst` 字典序出，不分相关度——本面没有「相关度」这个概念。

## 8. 交互决策（查询面读什么、怎么读）

- **输出是文字，不是图**（需求档 §3 已定）。一行为一条边，形状沿用 `ledger` 查询面的「一行一条 + 读数行」。
- **每条边后面必须跟 `evidence`**：读者看的是「它长在 `docs/core/design/EDIT.md` 第 5 节那一条里」，不是一个孤零零的节点名。
- **三态显式**：`目标不在盘` 与 `判不了存在性` 在输出里各是一格，不用颜色、不用省略号表达。
- **空结果的形状与降级分开**：「本仓无需求层」是降级读数，「该节点没有出边」是空结果；两者文案不同，否则用户第一次问就得到空白会认为功能坏了（F5 的原话）。
- **`scan` 的回执给四个数**：扫了几档、落了几条、几条目标不在盘、几条判不了存在性。数与边表实际行数对得上。

## 9. 集成测试设计（从 `test/RTM.md` 索引出发的 delta）

**读索引的结论**：集成用例按故事设立、编号先行（先定 RTM 编号再写 `test('<编号> …')`）。本设计新增一个业务故事，故 delta 如下。

| 项 | 答案 |
|---|---|
| 被破坏的现有行 | 无。本设计不改任何现有集成用例断言的业务可观测结果——`doc_check` 的判决面零改（`onEdge` 缺席即原样），台账六态与回执零改 |
| 冗余可删的行 | 无 |
| 缺的行 | 一个新故事 **CLI 43**「文档锚点图：一条链从一个需求走到用例入口符号」，属册 `tooling` |

**CLI 43 的集成行**（每行四要素；落 `test/rtm/tooling.md`，用例落 `test/integration/`）：

| 构造（组件间交互） | 断言的业务可观测结果 | 服务的需求 | 入口 |
|---|---|---|---|
| `doc_graph(scan)` 扫本仓 → `doc_graph(chain, node:"req:F16")` | 五跳链逐跳出现且各带出处；第五跳是 import 面符号 | AC-1 · F3 · F4 | 真工具调用 `doc_graph`（CLI 端） |
| `doc_graph(reverse, node:"doc:…EDIT.md#5")` | 两条引用方都在，各带出处 | AC-2 · F4 | 同上 |
| 移走目标档后重扫 → `forward` | 该边仍列出且标「目标不在盘」 | AC-6 · F5 | 同上 |

**规模**：本设计给集成集加 3 行；加后仍在 50–100 的窗内。