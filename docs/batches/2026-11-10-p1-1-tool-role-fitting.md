# 2026-11-10 · p1-1-tool-role-fitting
> 六段，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 每段只有一个作者：作者的段可 `append` 加内容、可就地改（`edit`）；非作者一概拒。
> 编制：主 agent · 2026-11-10 · 来源 = 用户 2026-11-10 16:11 批准 P0–P2 全部并自动执行；范围 = `docs/core/requirements/ENGINEERING-SYSTEM-OPTIMIZATION.md` B3–B8。
> 台账 = #2286（core · 归批）。前情 = 无（独立批）。
## §1 讨论（主 agent）
**状态行**：已收口 2026-11-10
批起 sha = 4fafb49c002e12d935989fd9a7eeb72d0d0d2c6b
<§1 模板占位：本批条目 / 关键判据 / 授权口径>

## 讨论（P1-1 工具按角色收窄）

**来源**：`docs/core/requirements/ENGINEERING-SYSTEM-OPTIMIZATION.md` B3–B8。
**目标**：模型读到的工具说明 = 它真能用的能力；只读角色不再因为「整把工具被过滤」而失去只读能力。

### 已定决定（父侧）

- **B3 建批指引**：拒文改为优先 `batch create` 一次完成（它本身同事务建行）；只有接管已有行时才要求先查号。现状 `LEDGER_HANG_STEPS` 写成两步，诱导多一次往返。
- **B4 只读能力**：只读角色（explore/plan/consult）按 **action 级只读**派生受限变体，而不是按整把 `readonly` 过滤。至少补上 `git` 只读（log/show/diff）、`memory` 只读（search/list）、`settings` 只读（list/get）、`process` 只读（list）。**写动作仍不得进入只读角色。**
- **B5 doc_graph**：只读变体描述删除 `scan` 段；未建图时不得要求子代理上抛父代跑 scan——由系统自动补扫或返回可读的空态说明。
- **B6 只读变体描述**：`ledger`、`team_ledger`、`batch`、`doc_graph` 的子代理描述不得含它们不能执行的写动作（add/update/close/create/attach/close/scan）。按角色生成描述与 schema。
- **B7 描述与实现对齐**：`eng-designer` 的「≤6 explore」要么实现计数、要么删描述（**父侧倾向：实现计数**，因为它是审计预算）；`coder` 的「complete toolset」写明排除 `question`、`ssh`；两处 `batch` 注释的四/五 action 改成六。
- **B8 历史读取**：子代理无 `read_history`，需要父会话事实只能上抛。**本批给受限只读历史**（限当前批相关、限量），或明确「任务书必须携带」并写进派单判据——二选一，倾向前者。

### 库内勘察

`库内 = 已查：工具装配与描述（调研 #3）`，落点如下：

- `thincoder-core/agent/family-tools.mjs`（各角色家族件装配）
- `thincoder-core/agent/helpers.mjs`（`readonlyToolNames` ∥ `SUBAGENT_TOOL_EXCLUSIONS`）
- `thincoder-core/agent/dispatch-gates.mjs`（`isReadonlyAction`，action 级只读口径）
- `thincoder-core/agent-tools/subagent-spawn.mjs`（角色过滤）
- `thincoder-core/agent-tools/doc-graph.mjs`（只读变体与 scan 缺口）
- `thincoder-core/ledger-tools.mjs` ∥ `team-ledger.mjs`（只读变体复用全量描述）
- `thincoder-core/agent-tools/batch.mjs`（六动作枚举与描述）

`库外 = B 类：改动面 = 本仓工具装配与描述；外部断言 = 零`

### 既有件三问

- `existing: thincoder-core/agent/dispatch-gates.mjs · name: "isReadonlyAction" · consumers: 运行期只读判定`——B4 应复用它，不另立第二套名单。
- `existing: thincoder-core/agent/helpers.mjs · name: "readonlyToolNames" · consumers: 只读角色工具继承`。
- `existing: thincoder-core/agent/family-tools.mjs · name: "familyTools" · consumers: 各角色家族件装配`。

### 边界

不改状态机（P0-1 在做）、不改提示词正文规则（P0-3 已收口）、不改批档判据。

## §2 批次任务与设计（eng-designer）
**状态行**：设计完成（B3–B8 设计、验收与集成增量已落 TOOLS.md §6.29；B8 范围裁定已回写）
<§2 模板占位：本批条目（覆盖） / 设计档落点 / 机制设计 / 受影响文件与测试覆盖 / 验收对照 / 关键决策 / 上抛项>

### 本批条目（覆盖）

| 条目 | 本批交付 | 验收回指 |
|---|---|---|
| B3 | 写门拒文优先给 `batch create` 一次建批；接管既有行才先查号，示例带必需路径与同面未决行条件 | `docs/core/design/TOOLS.md` §6.29「验收回指」B3 |
| B4 | explore/plan/consult 按运行期 `readonlyActionOf` 派生 action 级只读变体；至少恢复 git、memory、settings、process 的规定只读动作，写动作双层拒绝 | 同节 B4 |
| B5 | doc_graph 只读描述去除 scan/scope 与父代扫描指引；未建图返回可区分空态，读取失败不吞 | 同节 B5 |
| B6 | ledger/team_ledger/batch/doc_graph 按角色生成描述与 schema；不可执行动作、写参数和写说明不出现 | 同节 B6 |
| B7 | designer 按 batchDoc 实现六次 explore 上限并跨 fix 累计，拒绝的 spawn 不占额度；coder 描述点名 question/ssh 排除；两处注释改六动作 | 同节 B7 |
| B8 | 仅 eng-coder/eng-designer 以真实 `_batchDoc` 获得限量只读父历史，窗口夹在本批与下一批起点之间，limit 必传且上限 50；未绑定角色由任务书 knownFacts 携带事实，consult 不改 | 同节 B8 |

**明确不在本批**：新增工具名或角色、状态机、批档判据、配置/UI、depth-0 全量面、tester 扩面、doc_graph 自动扫描、未绑定角色历史工具、consult `main_history`。

### 设计档落点与机制

唯一新增设计节 = `docs/core/design/TOOLS.md` §6.29。机制、接口、分支依据、关键决策、边界与九项集成设计均以该节为准；本表只作批次覆盖与回指，不复制其判据或数量。

B8 上抛已裁：历史工具只给有真实批次绑定的 eng 两角色；未绑定角色继续使用任务书 `knownFacts`，consult 既有 `main_history` 不在改动面。未决项 = 无。

### 受影响文件与测试覆盖

| 面 | 文件/落点 | 详细契约 |
|---|---|---|
| 建批与历史起点 | `thincoder-core/agent/write-gate-ledger.mjs`、`thincoder-core/agent-tools/batch-ledger-bind.mjs` | TOOLS.md §6.29「接口契约」①④ |
| 只读派生与角色装配 | `thincoder-core/agent/family-tools.mjs`、`agent/helpers.mjs`、`agent/dispatch-gates.mjs`、`agent/spawn-child.mjs`、`agent-tools/subagent-spawn.mjs`、`agent-tools/subagent.mjs`、`agent-tools/consult.mjs` | 同节①②；动作判据只复用 `readonlyActionOf` |
| doc_graph | `thincoder-core/agent-tools/doc-graph.mjs`、`thincoder-core/doc-graph.mjs` | 同节③ |
| 台账与 batch | `thincoder-core/ledger-tools.mjs`、`thincoder-core/team-ledger.mjs`、`thincoder-core/agent-tools/batch.mjs`、`thincoder-core/agent-tools.mjs` | 同节②与 B6/B7 |
| 父历史 | `thincoder-core/agent-tools/read-history.mjs` | 同节④；仅 eng 两角色经 childRunOpts.extraTools 注入 |
| VSC | `thincoder-vscode/src/agent/tool-table.mjs` | 与 core 同派生面，tester 不变 |
| 描述 | `thincoder-core/tool-docs/subagent.md`、`read_history.md` 及 §6.29「受影响文件」围栏列出的变体描述档 | 描述与 schema 同角色，不新增工具名 |
| 测试 | `test/integration/batch-live-batch-lock.test.mjs`、`batch-ledger-bind.test.mjs`、`tester-role.test.mjs`；新增集成档与随批单元档见 §6.29 同表围栏 | B3 改写 CLI 12-1；新增 CLI 49-1～49-3；批次单测用毕删除 |

全量受影响文件与「无跨层、无需拆分」结论 = TOOLS.md §6.29「受影响文件」。此处不另估行数或增量。

### 验收对照与负例

B3–B8 逐条判据、normal/boundary/error 用例与测试文件 = TOOLS.md §6.29「验收回指」「用例表」。本批统一负例：只读角色直接 execute 写动作仍须在 execute 前拒绝，并断言零文件写、零台账写、零团队网络写；doc_graph scan、read_history path、designer 第七次 explore 同属负例。

RTM 增量 = 改写 CLI 12-1；CLI 13-1/13-4、CLI 30-1/30-2 保留回归；新增 CLI 49-1/49-2/49-3，入口与业务可观察断言见 TOOLS.md §6.29「集成测试设计」。不把全量套件当本批评审前验收。

### 关键决策

1. `readonlyToolNames` 的 tester 语义不变；新变体构造器复用运行期谓词，不另立只读名单。
2. doc_graph 选可读未建图空态，不让只读角色隐式写共享边表。
3. designer 计数按规范化 batchDoc 存于 depth-0 独立 Map，与 eng-coder 审计预算分账，fix respawn 不归零。
4. 父历史绑定 parent agent 与真实批次起点；禁止 path/跨会话，未绑定角色不虚构过滤口径。

### 上抛项

无。B8 未绑定角色范围已按父侧裁定落入本节与 TOOLS.md §6.29。

### 修正轮 1（评审 11 条逐号处置 · 改动档 = `docs/core/design/TOOLS.md`）

| # | 处置 | 落点与逐字 |
|---|---|---|
| 1 | 描述来源定成一条规则，并收窄派生面 | ① 表描述行改「一份独立描述档，档名由构造器的 `docName` 形参给出，**档定义期**经 `DESC(docName)` → `loadToolDoc` 读 `<tool-docs>/<docName>.md`」；① 表前句改「接收工具、谓词与**描述档名**三样注入」；新增「覆盖面与不挂的两件」七条，点名 `browser` ∥ `ssh` 的 `isReadonlyAction` 判的是审批门而非读写分界，故不造变体、不造描述档；原「其它已有 action 钩子也走同一派生面」整句删除 |
| 2 | 动作集两说合一 | §6.7 batch 条改「action = 六动作 create ∕ attach ∕ append ∕ edit ∕ status ∕ close」，并把「**无路径参数**」改「`path` 只在 depth-0 可选（D-BR21）」；§6.29 ② 的「depth-0 保持全量六动作」保留，两处同数 |
| 3 | 补 RTM 面并交代 12-1 | 受影响文件增「RTM 面」行：`test/RTM.md` 索引加 CLI 49 节、`test/rtm/tooling.md` 写 49 故事节与 49-1～49-3、`test/rtm/guard.md` 改写 12-1；围栏后加一句——改写 12-1 只换 `LEDGER_HANG_STEPS`，`Pass project:` 句住 `thincoder-core/agent/write-gate-ledger.mjs` 的 `LEDGER_PARAM_SENTENCE` 独立常量 ⇒ 12-1 对它的断言保留 |
| 4 | 层级结论改实 | 改为「增量面 ∥ 越 500 行道三档 ∥ 处置 ∥ 读数口径」四条：点名 `thincoder-core/doc-graph.mjs`、`thincoder-core/agent/write-gate-ledger.mjs`、`test/integration/batch-live-batch-lock.test.mjs`；不设拆分计划；行数按 `doc_check` 的 `lines` 量法取，本档不记绝对值 |
| 5 | doc_graph 描述面写清分不分 | ③ 后新增「描述面也分两份」四条：现状 = `ACTION_DESC` 含 `scan`；档内注记为共用；本批改为从该变体动作集生成，只读字面不含 `scan`；理由 = 不改则 B5/B6 的「不可执行动作描述不可达」落不了地 |
| 6 | B7 点名两处注释 | B7 补坐标：`thincoder-core/agent-tools.mjs` 的「主名 `batch` 单工具四 action」与 `thincoder-core/agent-tools/batch.mjs` 的工厂头注释「单工具五 action」——一处说四、一处说五，`enum` 实为六值 |
| 7 | 两个新拒面补依据 | 新增「两个新增拒面的依据」表两行：designer 第六次之后 = `family-tools.mjs` 逐字 `Survey budget: ≤6 explore spawns per batch` 而 `spawn-child.mjs` 的 `if (parentRole === "eng-designer") return null` 不计数；`read_history` 缺 `limit` = `read-history.mjs` 的 `const DEFAULT_LIMIT = 50` |
| 8 | 调查证据行点名两声明源 | 改成五条：仓内实读面；公开源按 `index.publicRepos` 查；两条声明源 `../.thincoder`（`memory` ∥ `tmp` ∥ `advisor.md` ∥ `checklist*.md`）与 `../thincoder.com`（`docs` ∥ `scripts` ∥ `www` ∥ `AGENTS.md`）；结论 = 无工具装配或角色工具面内容；数据事实检查 |
| 9 | 新增描述档的体量后果进受影响文件 | 受影响文件增「描述预算读数」行：`docs/core/design/TOOLS.md` §6.11 与 `docs/core/design/PROMPT-SYSTEM.md` §6.11 的「54 档」随新增档同步，预算表（同档声明为唯一权威处）按实测更新 |
| 10 | 删围栏笔误 | 围栏删去误落在批档目录的那一行测试档（与批档同名、带 `.test.mjs` 后缀）；该栏只留集成档，落点见 `docs/core/design/TOOLS.md` §6.29「受影响文件」围栏 |
| 11 | 嵌套候选配对规则写死 | ① 后新增「嵌套动作的配对规则」五条：候选形 = 顶层 action + 被钩子读取的嵌套键；配对键闭集 = `stashAction` ∥ `worktreeAction` ∥ `tagAction` ∥ `branchAction` ∥ `remoteAction` ∥ `checkpointAction`；进 `action.enum` 的条件 = 至少一个只读对；变体里嵌套键的 `enum` = 只读值并集；配对在 execute 第二道门按真实入参对重判 |

本轮未改代码、未改需求档、未改提示词面。验收：`doc_check(mode:"gate")` 对 `docs/core/design/TOOLS.md` 首行 `DOC-CHECK GATE: PASS`。

### 修正轮 2（实施后：设计档读数收正 · 本席笔域）

**触发**：`docs/core/design/TOOLS.md` §6.29「描述预算读数」行的实施项未落（设计档为设计席笔域）；评审轮 2 新增 #12（`index.publicRepos` 同读数两说）。

**读数（量法 = `node scripts/tool-schema-size.mjs`；目录计数另以 `node` 读 `readdirSync` 复核，两法同值）**：`thincoder-core/tool-docs` = 68 个 `.md`（逐档 148,620 字符）· 枚举工具 55 档 · 总量 202,794 字符（= 1.959 × 基线 103,529；分面 builtin 89,791 · builtin(gated) 873 · meta 93,087 · instance 19,043）。

| # | 项 | 处置 | 落点与逐字 |
|---|---|---|---|
| 1 | 档数绝对值只住预算表 | 本档两处改「档数 = 实测 + 量法」，不记绝对值 | `docs/core/design/TOOLS.md` §6.11「描述档全档随包发布，档数 = 实测（量法 = `node` 计 `thincoder-core/tool-docs` 下 `.md` 档）」；同档 §6.9「档数 = 实测，量法 = `node` 读 `readdirSync` 计 `.md` 档……本档不记绝对值」 |
| 2 | 预算表按实测更新 | 机制行档数 + 预算表四行（当前 / 单档帽 / top5；基线行不动） | `docs/core/design/PROMPT-SYSTEM.md` §6.11「（68 档——枚举工具 55 ∥ 目录档 68）」「**202,794** 字符（= **1.959 × 基线**；分面 = builtin 89,791 · builtin(gated) 873 · meta 93,087 · instance 19,043；枚举 55 档，其中 tool-docs 68 档 · 148,620 字符）」 |
| 3 | 单档帽名单随读数移格 | 超限六档 = `subagent` ∥ `batch` ∥ `browser` ∥ `ssh` ∥ `doc_check` ∥ `doc_graph`（`git` 降到 8,000 以下退出，`doc_graph` 进入）；「其余四档未削」随之成立 | 同表「单档帽」行 |
| 4 | 受影响文件行改成常设规则 | 原「两处『54 档』随新增描述档同步」换成「档数绝对值只记在预算表……本档两处只写量法」——不再留一次性动作句 | `docs/core/design/TOOLS.md` §6.29「描述预算读数」行 |
| 5 | 评审轮 2 #12 陈旧读数 | `index.publicRepos` 实读 `[]` 改为实读两条，结论改指调查证据行 | 同档 §6.9「仓外声明源 = `PROJECT-MANIFEST.json` 的 `index.publicRepos` 实读两条（`../.thincoder` ∥ `../thincoder.com`）——两仓无工具面相关档 ⇒ 无仓外档可依据（读数与查法 = 本档 §6.29「调查证据行」）」 |
| 6 | 11 个新描述档核对 | 与盘上一致，**零改** | 同档 §6.29 受影响文件围栏 11 行 vs `node` 列 `thincoder-core/tool-docs` 实得 11 个同名档 |

**同轮收正（`docs/core/design/PROMPT-SYSTEM.md` 另三处旧档数，同属数错类）**：§6.60「来源」行是过去式扫描记录，删去其中的档数；§6.66 读数表一行的扫描帧按重跑更新——`node` 逐行扫 `thincoder-core/prompts`（17 档）+ `thincoder-core/tool-docs`（68 档）= 85 档，`file:<数字>` 字面命中 0（与旧读数同结论，只是域变大）；「证据形清单」标题改为不带档数的形。

**未做项（本席笔域外）**：`docs/core/design/ARCHITECTURE.md`、`CORE-UNIFICATION.md`、`CONTEXT-COMPACTION.md`、`DOC-DISCIPLINE.md`、`MANIFEST.md` 仍写旧档数——那五档不在本批两档之列，须另开一轮按各自量法收正。

本轮未改代码、未改需求档、未改提示词面、未改批档 §5。

**上抛项（本席笔域外 · 本批交付会被它判红）**

- **`thincoder-vscode/scripts/check-vsix.mjs` 的档数硬等式已过期**：该档 `const EXPECT = { prompts: 17, "tool-docs": 55 }` 逐字在盘，而 `node` 实读 `thincoder-core/tool-docs` = 68 档（本批 +11，另有 2 档属另一批未随）；断言 D 的通过条件是 `repo.size === EXPECT[dir]` 全等 ⇒ 打包校验今天报 `仓内侧档数不符 [68]`。复现 = 两个读数对照（`EXPECT` 常量 vs `node` 计目录），本席未跑打包器（需先出 vsix）。处置归实施席（一个数，或把硬等式降为「档名集合 + sha256」）。
- 同批同类（设计档，均在本席本批两档之外）：`docs/core/design/MANIFEST.md` §2.10 勘察行 ④ 记 `EXPECT tool-docs = 54` 与「盘上实测 54 档」两处旧读数。

### 修正轮 3（评审轮 3 五条逐号处置 · 改动档 = `docs/core/design/TOOLS.md` ∥ `docs/core/design/PROMPT-SYSTEM.md`）

**读数（本席本轮实跑，量法逐条在命令里）**

```text
doc_check(mode:"report", lines = 本批受影响 21 档)
→ 越 500 软线 5 · 越 800 硬限 0
  612  test/integration/batch-live-batch-lock.test.mjs
  778  thincoder-core/doc-graph.mjs
  569  thincoder-core/agent/write-gate-ledger.mjs
  528  thincoder-core/agent/helpers.mjs
  501  thincoder-core/agent-tools/subagent-spawn.mjs

node scripts/prompt-refs-check.mjs（零参 · 2026-11-10）
→ 汇总：提示词面 85 档 · 代码面 499 档 · 命中 6
```

| # | 处置 | 落点与逐字 |
|---|---|---|
| 1 🔴 | 层级结论按**实施后**行数重判，五档逐个点名，各给处置 | `docs/core/design/TOOLS.md` §6.29「层级结论」首行改「**越 500 行主动审视线、未越 800 行硬限的五档**」并列五档（补 `agent/helpers.mjs` ∥ `agent-tools/subagent-spawn.mjs`）；新增「**逐档处置**（同一条判据：本批是否新增职责面——新增才拆）」五条，每档一句不拆的依据；「读数口径」行加「档级事实以实施后的实际行数为准（实施轮已落，本节按该轮行数复判）」。仍不记行数绝对值 |
| 2 🟡 | 两种写法合成并列，不再断言 55 含 68 | `docs/core/design/PROMPT-SYSTEM.md` §6.11「当前」行由「枚举 55 档，其中 tool-docs 68 档 · 148,620 字符」改为「枚举工具 55 档 ∥ 目录档 68 档（差 13 档 = 按角色 ∥ 变体另立的描述档）；`thincoder-core/tool-docs` 描述合计 148,620 字符」 |
| 3 🟡 | 旧余数改「其余各档」形，不留新绝对值 | 同档 §6.66 证据形清单 E 组「`thincoder-core/tool-docs/` 其余 51 档」→「其余各档（除本表已点名者）」 |
| 4 🟡 | 一档两说取一个值：F1 的档数改成域定义 | 同档 §6.45 F1 行「`thincoder-core/prompts/` 16 档（逐档）」→「`thincoder-core/prompts/` 全档（逐档）」；另 7 处同形「`thincoder-core/prompts/` 16 档」同批改为「全档」，「字面全 16 档」改「字面全档」。§8 ∥ §8.5 的「17 档」为现行权威，未动 |
| 5 🟡 | 加域作用域一行，并把被钉成期望值的那处改到当前域 | 同档 §6.66 实测表后新增「**读数作用域（本档各节的「提示词面 N 档 · 代码面 N 档」都是当轮域）**」四行：§6.31–§6.46 那组读数是各轮域、非现域；现域只有一条读法 = 零参汇总行，一次实读 = 85 ∥ 499 ∥ 命中 6；本节只留量法与日期。§6.31.5 C3 行由写死的「69 档 · 459 档（与改前同）」改成关系判——改前改后各读一次、两次档数相等 |

**#4 与 #5 的判法交代（为什么不是把 69 改成 85、把 16 改成 17）**

- #4：`thincoder-core/prompts/` 的 16 档是那些轮次的实读数，盘上转 17 的那一笔本档 §6.66 已有记载（新增档 = `persona-tester.md`）。把旧轮次的 16 直接改成 17，等于替当时那次扫描换一个没扫过的域。改法取「域定义」形——扫的是那个目录里的每一档，数不写，就不会过期。
- #5：逐处加尾巴的做法已试过，被写门以「文字太长，难于阅读」拒（目标段本身就是超长段，改一个字符也要连段重写）。改重写那十段的历史节超出修正轮射程 ⇒ 处置改为「作用域一行 + 期望值一处」，作用域行落在量法所在的 §6.66（D2 单一权威源），不散成十一份尾巴。

**上抛项（本席笔域外 · 本批交付会被它判红）**

- 〔待裁〕`node scripts/prompt-refs-check.mjs` 零参实读 **命中 6**，六条全指同一处举例：`thincoder-core/tool-docs/doc_graph-read.md`（本批新建）∥ `thincoder-core/tool-docs/doc_graph.md` 各 2 条 ∥ `thincoder-core/agent-tools/doc-graph.mjs` 各 2 条，命中串 = `EDIT.md`。处置归实施席（描述档是产品面笔域），判据 = §6.60「工具描述面的举例不得指向本仓档」。
- 〔待裁〕`index.docCheckExemptions` 登记未命中由 3 条增至 7 条（`doc_check` 提示「复核后删」）；manifest 是父侧写面，本席未动。

本轮只改这两份设计档；未改代码、未改需求档、未改提示词面、未改批档 §5。验收：`doc_check(mode:"gate")` 对上述两档首行 `DOC-CHECK GATE: PASS`。

## §3 设计评审（评审子代理）
**状态行**：评审通过（第 4 轮：上轮 1🔴 + 4🟡 中 3 处已闭，2 处 🟡 残留（§6.66 E 组余数形只落半边、§6.56/§6.57 判法格仍写「全 16 档」），不阻断）



### 轮次 1（评审子代理）

| # | 严重度 | 状态 | 证据（指针） |
|---|---|---|---|
| 1 | 🔴 | 待修 | `docs/core/design/TOOLS.md` §6.29「接口契约」① 表「描述 | 由该变体的只读动作说明生成」∥ 同节「受影响文件」围栏的 `git-read` 一族新描述档；描述取值在档定义期 = `thincoder-core/tools/shared.mjs` 的 `DESC`，先例 = `thincoder-core/agent-tools/manifest.mjs` 的 `DESC("manifest-read")`（逐工具硬编码）；同节又写「其它已有 action 钩子也走同一派生面」而 `thincoder-core/tools/browser.mjs` / `thincoder-core/tools/ssh.mjs` 无对应描述档 |
| 2 | 🔴 | 待修 | `docs/core/design/TOOLS.md` §6.7 batch 条「action = create ∕ append ∕ edit ∕ status ∕ close；**无路径参数**」∥ 同档 §6.29「depth-0 保持全量六动作」；`thincoder-core/agent-tools/batch.mjs` 的 `enum` 六值 + depth-0 可选 `path` |
| 3 | 🟡 | 待修 | `docs/core/design/TOOLS.md` §6.29「用例标题必须先使用上述编号」而「受影响文件」表无 `test/RTM.md` / `test/rtm/tooling.md` / `test/rtm/guard.md`；`test/RTM.md`「故事本体与用例行住分册」 |
| 4 | 🟡 | 待修 | `docs/core/design/TOOLS.md` §6.29「层级结论」「无文件跨越拆分阈值」vs 实读内容行：`thincoder-core/doc-graph.mjs` 769 ∥ `thincoder-core/agent/write-gate-ledger.mjs` 565 ∥ `test/integration/batch-live-batch-lock.test.mjs` 608（均越 500 主动审视线，无一越 800） |
| 5 | 🟡 | 待修 | `thincoder-core/agent-tools/doc-graph.mjs` 的 `ACTION_DESC` 字面含 `scan`，同档注「描述面不因此分裂成两份会各自漂的文本」；与 §6.29 验收「scan 与写动作描述不可达」冲突 |
| 6 | 🟡 | 待修 | `thincoder-core/agent-tools.mjs` 注释「主名 `batch` 单工具四 action」仍在；§6.29 B7「两处 batch 注释统一为六动作」未点名两处（另一处与 §6.7 同款陈旧说法） |
| 7 | 🟡 | 待修 | `thincoder-core/agent/family-tools.mjs`「Survey budget: ≤6 explore spawns per batch」∥ `thincoder-core/agent/spawn-child.mjs`「if (parentRole === "eng-designer") return null」——第六/七次门与 `read_history` 的 `limit` 必传均无场景读数，仅 §6.29 调查证据行一句总括 |
| 8 | 🟡 | 待修 | §6.29 调查证据行「公开源调查 = 本批只改本仓装配与描述，未检索到需要引入的外部契约」；`PROJECT-MANIFEST.json` 的 `index.publicRepos` 两条声明源未点名 |
| 9 | 🟡 | 待修 | §6.29 围栏新建 11 个描述档 vs `docs/core/design/TOOLS.md` §6.11「54 档随包发布」与 `docs/core/design/PROMPT-SYSTEM.md` §6.11 预算表（同档声明为唯一权威处）——两处读数未进「受影响文件」 |
| 10 | 🟡 | 待修 | §6.29 围栏内一条测试档名落在批档目录下（与批档同名、带 `.test.mjs` 后缀），同栏已有正确的集成档落点 ⇒ 该行是笔误 |
| 11 | 🔵 | 记录 | `thincoder-core/tools/git.mjs` 的 `isReadonlyAction(args)` 对 `tag/branch/stash/remote/worktree/checkpoint` 按嵌套键判定；§6.29 ①「读取原 schema 的 `action.enum` 及嵌套动作枚举」未给候选配对规则 |

VERDICT: changes-required

计数 = 🔴 2 · 🟡 8 · 🔵 1（共 11 条）。逐条正文与建议见本轮评审报告。

### 轮次 2（评审子代理）

### 轮次 2 逐条核（上轮 2🔴 + 8🟡 + 1🔵）

| # | 原# | 严重度 | 状态 | 证据（指针） |
|---|---|---|---|---|
| 1 | 1 | 🔴→已闭合 | 已修 | `docs/core/design/TOOLS.md` §6.29「接口契约」①「接收工具、谓词与**描述档名**三样注入」+ 描述行「档名由构造器的 `docName` 形参给出，**档定义期**经 `DESC(docName)`」；同节「覆盖面与不挂的两件」点名 `browser` ∥ `ssh` 的 `isReadonlyAction` 判的是审批门；受影响文件含 `thincoder-core/agent/helpers.mjs`；原「其它已有 action 钩子也走同一派生面」全文零命中 |
| 2 | 2 | 🔴→已闭合 | 已修 | `docs/core/design/TOOLS.md` §6.7 batch 条「action = 六动作 create ∕ attach ∕ append ∕ edit ∕ status ∕ close」与「`path` 只在 depth-0 可选（D-BR21」∥ 同档 §6.29 ②「depth-0 保持全量六动作」；`thincoder-core/agent-tools/batch.mjs` 的 `enum: ["create", "attach", "append", "edit", "status", "close"]` 与 `path` 的「depth-0 only (D-BR21)」 |
| 3 | 3 | 🟡→已闭合 | 已修 | `docs/core/design/TOOLS.md` §6.29「受影响文件」新增「RTM 面」行（`test/RTM.md` ∥ `test/rtm/tooling.md` ∥ `test/rtm/guard.md`）；`thincoder-core/agent/write-gate-ledger.mjs` 的 `const LEDGER_PARAM_SENTENCE = 'Pass project:…'` 为独立常量，与 `LEDGER_HANG_STEPS` 在拒文里分别插值 ⇒ 12-1 的 `Pass project:` 断言确实保留 |
| 4 | 4 | 🟡→已闭合 | 已修 | `docs/core/design/TOOLS.md` §6.29「层级结论」点名 `thincoder-core/doc-graph.mjs` ∥ `thincoder-core/agent/write-gate-ledger.mjs` ∥ `test/integration/batch-live-batch-lock.test.mjs` 三档并写「本档不记绝对值」；`doc_check` 的 `lines` 读数 = 越软线恰三档、越 800 硬限 0 档，与所点三档逐档一致 |
| 5 | 5 | 🟡→已闭合 | 已修 | `docs/core/design/TOOLS.md` §6.29 新增「描述面也分两份」四条（现状 = `ACTION_DESC` 含 `scan`；档内注记共用；本批改为按变体动作集生成；理由 = 否则 B5/B6 的「不可执行动作描述不可达」落不了地）；该处即 `thincoder-core/agent-tools/doc-graph.mjs` 的 `const ACTION_DESC = "The question to ask: \`scan\` collects the edges…"` |
| 6 | 6 | 🟡→已闭合 | 已修 | `docs/core/design/TOOLS.md` §6.29 B7 点出两处坐标：「`thincoder-core/agent-tools.mjs` 的『主名 `batch` 单工具四 action』」与「`thincoder-core/agent-tools/batch.mjs` 的工厂头注释『单工具五 action』」——两处字面均实读在场（「单工具 `batch`——单工具五 action」） |
| 7 | 7 | 🟡→已闭合 | 已修 | `docs/core/design/TOOLS.md` §6.29「两个新增拒面的依据」表两行：`thincoder-core/agent/family-tools.mjs`「Survey budget: ≤6 explore spawns per batch」∥ `thincoder-core/agent/spawn-child.mjs`「if (parentRole === "eng-designer") return null」∥ `thincoder-core/agent-tools/read-history.mjs`「const DEFAULT_LIMIT = 50」——三处实读在场 |
| 8 | 8 | 🟡→已闭合 | 已修 | `docs/core/design/TOOLS.md` §6.29 调查证据行五条，点名「两条声明源：`../.thincoder`（`memory` ∥ `tmp` ∥ `advisor.md` ∥ `checklist*.md`）与 `../thincoder.com`（`docs` ∥ `scripts` ∥ `www` ∥ `AGENTS.md`）」并给结论「两处都没有工具装配或角色工具面内容」；`PROJECT-MANIFEST.json` 的 `index.publicRepos` 实读两条一致 |
| 9 | 9 | 🟡→已闭合 | 已修 | `docs/core/design/TOOLS.md` §6.29「受影响文件」新增「描述预算读数」行，指 `docs/core/design/TOOLS.md` §6.11 与 `docs/core/design/PROMPT-SYSTEM.md` §6.11 的「54 档」随新增描述档同步 |
| 10 | 10 | 🟡→已闭合 | 已修 | `docs/core/design/TOOLS.md` §6.29 受影响文件围栏只剩 11 个变体描述档 + 一个集成档落点，误落批档目录的 `.test.mjs` 行已无 |
| 11 | 11 | 🔵→已闭合 | 已修 | `docs/core/design/TOOLS.md` §6.29「嵌套动作的配对规则」五条，末条「schema 是平铺的，配对在 enum 上表达不出来 ⇒ execute 第二道门按真实入参对重判」 |
| 12 | 新增 | 🟡（可选，不阻断） | 新增 | `docs/core/design/TOOLS.md` §6.9 调研证据行「仓外声明源 = `PROJECT-MANIFEST.json` 的 `index.publicRepos` 实读 = `[]` ⇒ 无仓外档可查（已查，无相关）」∥ 同档 §6.28「`index.publicRepos` = `["../.thincoder","../thincoder.com"]`（2026-11-10 实读，按键名定位）」∥ 同档 §6.29「两条声明源：`../.thincoder` … 与 `../thincoder.com` …」——同一读数两说，由第 8 条的修复显影（既有陈旧句，非本节机制面） |

VERDICT: pass

计数 = 🔴 0（上轮 2 条均闭合）· 🟡 0 待修（上轮 8 条均闭合）· 🔵 0 待修（上轮 1 条闭合）· 新增 1 条 🟡 可选（不阻断批准）。上轮 11 条 = 已修 11。

### 轮次 3（评审子代理）

> 状态行重置：第 3 轮打回（changes-required）· 上一轮状态行 = 评审通过 → 进行中 · 2026-11-10

| # | 严重度 | 状态 | 证据（指针） |
|---|---|---|---|
| 1 | 🔴 | 待修 | `docs/core/design/TOOLS.md` §6.29「层级结论」逐字「越 500 行主动审视线、未越 800 行硬限的三档」；按该节自述量法（`doc_check` 的 `lines`）实测越软线**五档**——漏名两档 = `thincoder-core/agent/helpers.mjs` ∥ `thincoder-core/agent-tools/subagent-spawn.mjs`（行数读数 528 ∥ 501），二者均在该节「受影响文件」表内，且未见拆分计划或主动审视登记 |
| 2 | 🟡 | 待修 | `docs/core/design/PROMPT-SYSTEM.md` §6.11 同节两说：机制行逐字「（68 档——枚举工具 55 ∥ 目录档 68）」∥ 预算表「当前」行逐字「枚举 55 档，其中 tool-docs 68 档」——「其中」断言 55 含 68 |
| 3 | 🟡 | 待修 | `docs/core/design/PROMPT-SYSTEM.md` §6.66「证据形清单」E 组逐字「`thincoder-core/tool-docs/` 其余 51 档」——按同节已改的 68 档减该表点名三档应余 65；51 = 改前 54 档时的读数 |
| 4 | 🟡 | 待修 | `docs/core/design/PROMPT-SYSTEM.md`「F1」行逐字「`thincoder-core/prompts/` 16 档（逐档）」∥ 同档 §8 逐字「唯一副本 = `thincoder-core/prompts/`（17 档，运行期直接加载）」；盘上 `thincoder-core/prompts/` = 17 档 |
| 5 | 🟡 | 待修 | `docs/core/design/PROMPT-SYSTEM.md` 十一处逐字「提示词面基线 = 69 档 / 代码面 463 档 / 命中 0」类读数（其一被钉成用例期望值），与同档 §6.66 实测表已改为「**0**（85 档逐行扫）」+「`thincoder-core/prompts` 17 档 + `thincoder-core/tool-docs` 68 档」相左 |
| 6 | 🟡 | 协调 | 跨档滞后（本席笔域外，已由设计席在批档登记）：`docs/batches/2026-11-10-p1-1-tool-role-fitting.md` §2 修正轮 2「未做项」逐字点名 `docs/core/design/MANIFEST.md` 等五档仍写旧档数——单源声明在盘上尚不成立 |
| 7 | 🔵 | 记录 | 档数同源已核：`thincoder-vscode/scripts/check-vsix.mjs` 的 `EXPECT` = prompts 17 ∥ tool-docs 68，与两设计档所述同值；仅其头注「计数规则：枚举工具 N ∥ 描述档目录 N+1」已不描述今天这组数 |

VERDICT: changes-required

计数 = 🔴 1 · 🟡 5 · 🔵 1（共 7 条）。另三项读数（不进上表）：11 份变体描述档名单与盘上逐名一致 ✓ · 设计档零绝对档数、只留量法 + 单源指针 ✓ · 两份字符读数（202,794 ∥ 148,620）本席未复跑该表所列量法脚本 = unverified（其分面四项相加恰为 202,794 ✓）。

### 轮次 4（评审子代理）

第 4 轮复核面 = 上轮 1🔴 + 4🟡 五处，逐处读数如下（其余不重开）。

| # | 严重度 | 状态 | 证据 |
|---|---|---|---|
| ① | 上轮 🔴 | 已闭 | `docs/core/design/TOOLS.md` §6.29「层级结论」五档与本席用 `doc_check` 的 `lines` 逐档量 21 档受影响文件的结果完全一致：越 500 者恰为 `thincoder-core/doc-graph.mjs` · `thincoder-core/agent/write-gate-ledger.mjs` · `thincoder-core/agent/helpers.mjs` · `thincoder-core/agent-tools/subagent-spawn.mjs` · `test/integration/batch-live-batch-lock.test.mjs`，越 800 者零；档内「本档不记绝对值」在位，无数字入档 |
| ② | 🟡 | 已闭 | `docs/core/design/PROMPT-SYSTEM.md` §6.11 当前行读「分面 = builtin 89,791 · builtin(gated) 873 · meta 93,087 · instance 19,043」，四项相加 = 同行「**202,794** 字符」；「其中」形零残留 |
| ③ | 🟡 | 未闭 | `docs/core/design/PROMPT-SYSTEM.md` §6.66 证据形清单 E 组读「提示词面其余 6 档（…）· `thincoder-core/tool-docs/` 其余各档（除本表已点名者）」——「其余各档」形只落到 tool-docs 半边；`thincoder-core/prompts` 实为 17 档，A–D 组点名 10 档，E 组六名不含 `thincoder-core/prompts/persona-tester.md` |
| ④ | 🟡 | 未闭 | `docs/core/design/PROMPT-SYSTEM.md` §6.56 的 A6 与 §6.57 的 A5 判法格仍读「`thincoder-core/prompts/` 全 16 档扫…」，同一格又写「不按全档总数判」；两处在 §6.66「读数作用域」声明的 §6.31–§6.46 之外，全档无一行把它们重定域 |
| ⑤ | 🟡 | 已闭 | §6.66「读数作用域」四行在位；「提示词面 85 档」= 实读 17 + 68，与 §6.11 的「目录档 68」不冲突；声明的 §6.31–§6.46 覆盖全部「69 档 · 463 档」读数 |
| ⑥ | 🔵 | 记录 | §6.29「层级结论」只判档级，未写函数级一句；`thincoder-core/agent/helpers.mjs` 按导出声明间距看最大函数约 86 行（非逐函数量法，未构成违规读数） |

计数：🔴 0 · 🟡 未闭 2（③ ④）· 🔵 1（⑥）· 上轮已闭 3（① ② ⑤）

VERDICT: pass

## §4 用户批准（主 agent）

### 用户批准

- **原话**：「我看了，挺好，这些工作我认为都要做，从P0-P2，都需要做，你开工吧，依次做完，自动执行」（2026-11-10 16:11）。
- **批准范围 = 第 4 轮评审通过的设计**：B3–B8 六条——写门建批一次 `batch create` · 只读角色四族只读变体 · `doc_graph` 未建图空态 · 同律五件按身份收窄 · designer 勘察按批累计 6 次 · eng 两角色受限父历史。
- **父侧追加裁定**：`check-vsix` 的 `EXPECT` 从 55 改到 68（本批新增描述档引起的真缺陷）；同档失败文案按实际失败项分叉（档数达标时不再喊「不符」）。

## §5 实施记录（eng-coder）
**状态行**：实施完成



### 实施记录（eng-coder）

#### 交付清单（逐档一行）

| 档 | 状态 | 改动 |
|---|---|---|
| `thincoder-core/agent/write-gate-ledger.mjs` | 已落 | B3：`LEDGER_HANG_STEPS` 换成设计目标句（`batch create` 一次建成；接管既有行才先查号；同面未决行给 `newDebt` ∥ 接管）——`LEDGER_PARAM_SENTENCE` 未动 ⇒ 12-1 的 `Pass project:` 断言保留 |
| `thincoder-core/agent/helpers.mjs` | 已落 | B4 构造器：`READONLY_VARIANT_DOCS`（四族登记 + `writeOnly` 列）· `makeReadonlyToolVariant`（三面收窄）· `deriveReadonlyTools`；新增 `DESC` import |
| `thincoder-core/agent/dispatch-gates.mjs` | 已落 | `readonlyActionTest`（派生面唯一谓词形，内部即 `readonlyActionOf`） |
| `thincoder-core/agent-tools/subagent-spawn.mjs` | 已落 | B4 explore/plan 面改 `deriveReadonlyTools`；B7 勘察计数调用点；B8 `extraTools` 注入 + 起点补记 |
| `thincoder-core/agent-tools/consult.mjs` | 已落 | B4 会诊席同一派生面（`readonlyToolNames` 退场） |
| `thincoder-vscode/src/agent/tool-table.mjs` | 已落 | B4 端侧同一派生面（判据面动态 import——W8 契约②） |
| `thincoder-core/agent/spawn-child.mjs` | 已落 | B7：`chargeDesignerSurveySpawn` + `rootAgentOf`（depth-0 独立 Map，与 `_engAuditSpawns` 分账） |
| `thincoder-core/agent-tools/doc-graph.mjs` | 已落 | B5/B6：`docName`/`unscanned` 两参、`ACTION_CLAUSES` 按变体动作集生成描述、`scope` 只留全量面；`ACTION_DESC`/`READONLY_SUFFIX` 退场 |
| `thincoder-core/doc-graph.mjs` | 已落 | B5：`UNSCANNED_READONLY_STATE`（设计逐字）+ `unscanned` 分支；读失败仍抛 |
| `thincoder-core/ledger-tools.mjs` | 已落 | B6：只读面参数取自 `query`/`count` 的 `ACTION_SPECS`，描述 `ledger-read` |
| `thincoder-core/team-ledger.mjs` | 已落 | B6：同上（`team_ledger-read`） |
| `thincoder-core/agent-tools/batch.mjs` | 已落 | B6：身份 profile（`PROFILE_ACTIONS`/`PROFILE_SEGMENTS`/`PROFILE_DOCS`/`profileSegmentProp`/`fullParameters`）+ execute 第二道门；头注改六动作 |
| `thincoder-core/agent/family-tools.mjs` | 已落 | B6：三处 `batchTool` 带 `role` |
| `thincoder-core/agent-tools.mjs` | 已落 | B7：「单工具四 action」→ 六 action |
| `thincoder-core/agent-tools/read-history.mjs` | 已落 | B8：`makeBatchHistoryTool` + `recordBatchHistoryStart` + `BATCH_HISTORY_LIMIT_MAX` |
| `thincoder-core/agent-tools/batch-ledger-bind.mjs` | 已落 | B8：建批成功记父会话起点 |
| `thincoder-core/tool-docs/*.md`（新 11 档） | 已落 | `git-read` ∥ `memory-read` ∥ `settings-read` ∥ `process-read` ∥ `doc_graph-read` ∥ `ledger-read` ∥ `team_ledger-read` ∥ `batch-eng-designer` ∥ `batch-eng-coder` ∥ `batch-review` ∥ `read_history-batch` |
| `thincoder-core/tool-docs/subagent.md` | 已落 | B7：coder 行点名 `question`/`ssh` 排除；explore 行改「git 只读可查、不注入工作区上下文」 |
| `thincoder-core/tool-docs/read_history.md` | 已落 | B8：补「子代理面为受限变体」一段 |
| `test/integration/tool-role-fitting.test.mjs`（新） | 已落 | CLI 49-1 / 49-2 / 49-3 |
| `test/integration/batch-live-batch-lock.test.mjs` | 已落 | 12-1 断言改写为新建批指引 |
| `test/RTM.md` · `test/rtm/tooling.md` · `test/rtm/guard.md` | 已落 | 索引 + 49 故事节三行 + 12-1 判据改写 |
| `docs/batches/2026-11-10-p1-1-tool-role-fitting.test.mjs`（随批单测） | 已落 | U1–U10；收口时删除 |
| `docs/core/design/TOOLS.md` §6.11 · `docs/core/design/PROMPT-SYSTEM.md` §6.11 | **未做（越笔域）** | 两处「54 档」需随新增描述档同步；设计档 = eng-designer 笔域，本席不改 |

#### 验收对照（B3–B8 → 判据 → 读数）

| 条目 | 判据（TOOLS.md §6.29「验收回指」） | 本批读数 |
|---|---|---|
| B3 | 拒文给一次建批路径、`path` 与接管条件，不再引导先 `ledger add` | `LEDGER_HANG_STEPS` 与设计目标句逐字一致；旧串在写门档内出现次数 = 0；CLI 12-1 四条断言全过 |
| B4 | 三种只读角色在 core ∥ VSC 的实际 schema 里可调用规定只读动作；直接 execute 写动作在原执行前拒且零副作用；tester 名集不变 | 49-1：explore 子代理真跑 `git log`/`settings list`/`process` 成功；四族写动作直接 execute 全拒且观察壳记录为空（原 execute 零运行）；仓内提交数仍 1；`readonlyToolNames` 面不含 `git`（tester 面维持原状） |
| B5 | 未建图返回可区分空态且不要求父代；直接 `scan` 仍拒；读取失败不变成空图；depth-0 scan 保持可用 | 49-2 四条全过（空态逐字、`scan` 拒且列取值集、坏档抛读失败、depth-0 仍四动作） |
| B6 | 逐角色检查描述与 schema，找不到不可执行动作、写参数或写说明；直接调用仍拒 | 49-1/49-2 断言：`memory` = search ∥ list、`settings` = list ∥ get、`process` = list、`git` 无写动作且无写专用参数；`ledger`/`team_ledger` 只读面参数 = 各自 query∥count 并集；`batch` profile 六格参数（`path`/`completed` 不出现）；`doc_graph` 只读面无 `scope`、描述无 scan 说明 |
| B7 | 同批前六次 explore 通过、第七次拒，fix respawn 不归零，coder 审计计数独立；coder 文本点名 question/ssh；两处注释六动作 | 49-3：6 过 1 拒，`round:"fix"` 重派仍拒；`_engAuditSpawns` 未被触碰；两处注释与 subagent.md 已改 |
| B8 | eng 两角色读到父会话本批起点后、下一批起点前的限量消息，`limit` 必传上限 50，缺 limit 与 `path` 均拒；未绑定角色无新历史工具 | 49-3：窗口内那条读得到、起点前那条读不到；缺 limit 拒 · 取 51 拒 · 传 `path` 拒；explore 的 `extraTools` 与家族段均无 `read_history` |

#### 旧行为红侧（改前该失败的那条，实跑读数）

```text
B4 old-face has git? false | new-face has git? true
B3 old-guidance occurrences in write gate: 0 | new guidance: true
B5 'ask the parent' in tool face: false | READONLY_SUFFIX present: false
B5 depth-0 unbuilt still throws: true
B5 read unbuilt returns empty state: true
B7 old gate for designer returns: null (null ⇒ 旧实现无限额)
```

#### 验证读数（改动面）

```text
node --test test/integration/batch-live-batch-lock.test.mjs test/integration/tool-role-fitting.test.mjs docs/batches/2026-11-10-p1-1-tool-role-fitting.test.mjs
→ tests 31 · pass 31 · fail 0

node --test 13 档（tester-role / batch-* 九档 / doc-anchor-graph / review-doc-scope / ledger-read-cross-project / path-resolution）
→ tests 59 · pass 59 · fail 0（含 CLI 30-1 ∥ 30-2 回归：tester 面未顺扩）

node --check 逐个改动档 → 全部 OK
doc_check(mode="gate") · 本批所写 16 档 → DOC-CHECK GATE: PASS（0 段问题）
```

#### 偏离与未做项（逐条交代）

1. **设计档「描述预算读数」未做**（`docs/core/design/TOOLS.md` §6.11 ∥ `docs/core/design/PROMPT-SYSTEM.md` §6.11 的「54 档」）：设计档是 eng-designer 笔域，本席不改；实测读数 = `readdirSync(thincoder-core/tool-docs)` 68 个 `.md`（本批新增 11），两处「54 档」与预算表需由设计席按实测更新。
2. **`batch` profile 的参数面比设计表更窄**：设计 §6.29 ② 只给「可写段与动作」，未逐个列参数；本席按 B6「不可执行的动作、写专用参数不进入该角色面」把 `path`／`completed`／`create`·`attach` 专用参数一并从 profile 面移除（子代理执行不到它们）。动作集与段域仍由既有白名单裁决，未改状态机。
3. **`writeOnly` 列按工具声明**：参数名与注释都不说明它服务哪个 action（`git` 的 `name` 挂在 `branch` 上，而只读项 `branch list` 并不读它），无通用派生法；动作集仍只由运行期谓词裁决（K2 未破）。
4. **`thincoder-core/agent-tools/subagent.mjs` 零改动**：设计「受影响文件·家族与预算」行把它列入，实读其 `gateEngCoderSpawn` 调用点无需改（勘察计数落在 `buildSpawnChild`，在它之后）；未改即为已核。
5. **`read_history.md` 只加一段**：该档没有被 B8 证伪的陈述（它原就不自称 depth-0 专属），故按「能力说明」补一句子代理面形态，未重写全文。

#### 未提交事项（转父侧 / 设计席）

- 描述预算读数两处（上列 1）。
- `index.docCheckExemptions` 里 3 条登记未命中（CLI 41/42 的夹具档名行——本批插入 49 节后行号偏移所致），`doc_check` 提示「复核后删」；manifest 是父侧写面，本席未动。

### 修轮 3（`check-vsix` 档数收正 · 单档一处真缺陷）

**缺陷**：`thincoder-vscode/scripts/check-vsix.mjs` 的 `EXPECT = { prompts: 17, "tool-docs": 55 }` 与盘上 68 档不符；断言 D 的判据是 `repo.size === EXPECT[dir]` 硬全等 ⇒ 打包校验必报红。来源 = 本节上方「上抛项」第一条（设计席报，处置归实施席）。

**改动（单档 · 同一数四处）**：

- `EXPECT["tool-docs"]` 55 → 68——**判据形状未动**，仍是档数全等；`prompts` 的 17 未动。
- 头注两处陈旧 live 句随同一数收正：`tool-docs/` 54 档 → 68 档 · 「档数硬等设计口径（17 / 54）」→（17 / 68）。
- 新增一条收正行（沿该档既有「日期 + 批次 + 实测 + 可 revert」体例）。

**红侧 → 绿侧读数**（同一 vsix = `thincoder-vscode-0.11.1.vsix`，命令 = `node thincoder-vscode/scripts/check-vsix.mjs`）：

```text
改前 ✘ 断言 D/tool-docs（仓内 68 档 · 口径 55）：仓内侧档数不符 [68] · 缺 [14 项] · 内容异 [40 项]
改后 ✘ 断言 D/tool-docs（仓内 68 档 · 口径 68）：仓内侧档数不符 [68] · 缺 [14 项] · 内容异 [40 项]
判据①单读（isolate）：EXPECT[prompts]=17 | disk=17 | repo.size===EXPECT -> true ; EXPECT[tool-docs]=68 | disk=68 | repo.size===EXPECT -> true
```

**仍未过的「缺 14 · 内容异 40」= 陈旧产物，不在本手**：`0.11.1.vsix` 构建于 2026-11-04，早于本批 11 份新描述档 ⇒ 与本改无关，重打包后自然消失；本手未打包、未改 vsix。

**两处如实报、未顺手改**：

1. `prompts` 面同样报红（缺 [] · 多 [] · 内容异 13）——同为陈旧 vsix，不是档数问题（17 = 17）。
2. `bad()` 的消息模板「仓内侧档数不符 [N]」是无条件措辞：档数达标时也照印，读数会被误读成档数仍不符。修法＝把该子句换成按 `repo.size === EXPECT[dir]` 分叉的两句或拆成四条独立子句；本手按派单「不改判据形状」未动。

本轮只改一档，未改设计档、未改其他代码、未派实施、未发评审。

### 修轮 4（断言 D 失败文案分叉 · 单档一处 · 父代理派单）

**缺陷**：`thincoder-vscode/scripts/check-vsix.mjs` 的断言 D 失败消息里「仓内侧档数不符 [N]」是**无条件**拼接的子句——档数达标时照印，同一条消息里「仓内 68 档 · 口径 68」与「档数不符 [68]」并存。读的人会照它去查一个不存在的档数问题。

**改动**（只动文案生成一处；判据形状未动；`EXPECT` 未动；其余断言未碰）：

- 新增 `const countOff = repo.size !== EXPECT[dir]`，通过条件由 `repo.size === EXPECT[dir] && !missing.length && !extra.length && !differs.length` 改为 `!countOff && !missing.length && …`（同值，仍是档数硬全等）。
- 失败分支改为按真实失败项逐条 `why.push`，`why.join(" · ")` 组消息：档数不符只说档数不符（带两个数）；`缺`/`多`/`内容异` 各自只在非空时出现。else 分支四条件互斥完备 ⇒ `why` 恒非空。

**红侧 → 绿侧读数**（同一 vsix = `thincoder-vscode/thincoder-vscode-0.11.1.vsix`；命令 = `node thincoder-vscode/scripts/check-vsix.mjs`）

```text
项数 = 各括号内档名列表的长度（同一命令输出逐项计数，不手数）

改前 ✘ 断言 D/prompts（仓内 17 档 · 口径 17）：仓内侧档数不符 [17] · 缺 [] · 多 [] · 内容异 [13 项]
改前 ✘ 断言 D/tool-docs（仓内 68 档 · 口径 68）：仓内侧档数不符 [68] · 缺 [14 项] · 多 [] · 内容异 [39 项]

改后 ✘ 断言 D/prompts（仓内 17 档 · 口径 17）：内容异 [13 项]
改后 ✘ 断言 D/tool-docs（仓内 68 档 · 口径 68）：缺 [14 项] · 内容异 [39 项]

探针（口径临时改 67 · 跑完已改回 68）
✘ 断言 D/tool-docs（仓内 68 档 · 口径 67）：仓内侧档数不符 [68]（口径 67） · 缺 [14 项] · 内容异 [39 项]
残留复核：TEMP-PROBE 命中 0 · EXPECT 逐字 = { prompts: 17, "tool-docs": 68 } · 含「档数不符」的 D 消息行数 = 0
```

（派单里写「内容异 40」；按上述命令的输出逐项计数 = 39，本节取机器读数。）

两侧都验到了：**该报的仍报**（档数真不符时点名两个数），**不该报的不再报**（档数达标时零「档数不符」字样）。

**仍未过的「缺 14 · 内容异 39」= 陈旧产物，不在本轮面**：`0.11.1.vsix` 构建于 2026-11-04，早于本批 11 份新描述档；重打包后自然消失。本轮未打包、未改 vsix。

**相邻项（复审提出 · 未做，理由如实）**：

1. 把 `why` 组装抽成可导出纯函数以便钉住两分支文案——属结构改动，越本轮派单边界（「一档、两行」「不改判据形状」），未做。
2. `repoFace` 在缺 `thincoder-core/<dir>` 时裸抛栈回溯（既有，非本轮引入）——未动。

**自查轮与终端态**：explore 偏离审计 1 轮（五条逐条给据 · 结论 = 无偏离）· advisor 代码评审 1 轮（`VERDICT: pass`；🔴 0 · 🟡 1 可选 · 🔵 3）· 返修轮 0 · **终端态 = clean**。

本轮只改一档，未改设计档、未改 `EXPECT` 的数、未改其他断言、未改测试。

## §6 验证与收口（父代理）

### 验证与收口（父侧）

**交付**：工具按角色收窄六条——B3 写门一次建批 ∥ B4 只读四族（`git` / `memory` / `settings` / `process`）的 action 级只读变体 ∥ B5 `doc_graph` 未建图可区分空态 ∥ B6 同律五件按身份收窄 ∥ B7 designer 勘察按批累计 6 次 ∥ B8 eng 两角色受限父历史。

**父侧独立复跑**：

```
node --test test/integration/tool-role-fitting.test.mjs
  tests 3 · pass 3 · fail 0
  CLI 49-1 只读四族真跑成功、写动作与写参数不在面内、直接 execute 仍拒且原 execute 零运行
  CLI 49-2 未建图仓返回可区分空态、scan 与写参数不在只读面
  CLI 49-3 designer 第七次勘察拒且跨 fix 累计；eng 两角色父历史只读本批窗口

node --test {tool-role-fitting, batch-live-batch-lock}.test.mjs
  tests 21 · pass 21 · fail 0
```

**红侧**：实施席在改动前实读——B4 旧面 `has git? false` / 新面 `true`；B3 旧两步串在写门出现 0 次；B5 面内 `ask the parent` = false。

**产品行为变化**：只读角色能看见只读动作了（原来整族被砍光）；建批从两步变一步；`doc_graph` 未建图不再要求父代跑 `scan`。

**夹具**：随批单测档收口删除；仓内零常驻样本。

**集成测试增量**：CLI 新增 49-1 ∥ 49-2 ∥ 49-3，改写 12-1；RTM 三处登记（`test/RTM.md` ∥ `test/rtm/tooling.md` ∥ `test/rtm/guard.md`）。

**观察（未记账、未开新题）**：桌面侧孪生脚本 `thincoder-desktop/scripts/check-dist.mjs` 有同一「无条件印不符」措辞，且其注释自称「同源 = check-vsix 的 `EXPECT`」而实值仍写旧数。属另一面，本批不动。
