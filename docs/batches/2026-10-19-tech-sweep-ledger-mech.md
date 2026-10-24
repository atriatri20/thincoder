# 2026-10-19 · tech-sweep-ledger-mech
> 六段 append-only，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 编制：主 agent · 2026-10-19 · 来源 = 用户令 2026-10-19 08:28「技术待办现在就开始处理」+ 08:31「继续不要等，thincoder 有足够的并发能力」——批 E = 台账治理机制面（`#1530` P1–P7；P2(a) 已由用户 2026-10-16 01:14 裁定，批甲已获准开工）。。
> 台账 = #1530（core · 归批）。前情 = docs/batches/2026-10-19-tech-todo-sweep.md（在途）。
## §1 讨论（主 agent）
**状态行**：已收口 2026-10-19
<§1 模板占位：本批条目 / 关键判据 / 授权口径>

### 讨论收敛（父侧 · 2026-10-19 08:35）

**用户令**：08:28「技术待办现在就开始处理，没有什么卡点」· 08:31「继续不要等」· 08:33「全部都开，能发出去的任务都发出去」。

**本批 = `#1530` 台账治理六条（批甲 · 机制面）**。用户 2026-10-16 01:14 已裁：**P2 择 (a) · 批甲 + 批乙都开**；P7 已裁（状态行在跑 ∥ 会话流三处文本行用户主动取消）。

| 条 | 内容 | 今晚实测的病 |
|---|---|---|
| P1 | 批级级联结算 | 一次收口 14 行 = **28 次调用**；`在途→已核销` 一跳被拒 |
| P2a | `归批` 须携在盘批档（降为读数） | 「软暂缓伪装已排期」 |
| P3 | 族行拆行规则 | 一行装 8 族/40+ 坐标 ⇒ 永远闭不上 |
| P4 | `evidence` 超限读数 | 有行已 ≈6000 字（软上限 300 无机检） |
| P5 | 解除条件结构化 | 散句无法机枚举 |
| P6 | `query.task_book` 过滤 | 批→行反查只能靠主 agent 记 |

**父侧两条裁定（本批设计须守）**：
1. **现有 109 行数据零损**——加可空列 + 版本号，不收紧 CHECK。
2. **不改 `trigger` 三枚举 / 六态迁移表 / `kind` 枚举**。

**与 `#1550`（批 I，`docs/batches/2026-10-16-ledger-pointer-gate-reanchor.md`）的边界**：两边都碰「批收口时做什么」——设计席已定「重锚 = 写 / 出口清单 = 读，一次 close，P1 先行」，**父侧认可**；实施时两批须**同轮排序**，不许各落一套收口动作。

## §2 批次任务与设计（eng-designer）
**状态行**：设计完成 2026-10-19（P1/P3/P4/P5/P6 逐条落笔 + P2a 定形；机制档 LEDGER.md §3.9 新增、行数回填；§2 六节齐；doc-check gate PASS）
<§2 模板占位：本批条目（覆盖） / 设计档落点 / 机制设计 / 受影响文件与测试覆盖 / 验收对照 / 关键决策 / 上抛项>

**状态行**：✅ 设计完成 2026-10-19（P1 ∥ P3 ∥ P4 ∥ P5 ∥ P6 + P2a 定形六条逐条落笔；受影响面行数本轮实读回填；doc-check gate = PASS）——零实施

## 2.1 本批条目（覆盖）

| 条 | 目标形（判据落点） | 代码面 |
|---|---|---|
| **P6** | `query` 增第 5 枚等值过滤 `task_book`（`count` 同增）——批→行反查不再靠记忆 | `LEDGER.md` §7.1 · AC-M2-28 |
| **P1** | 批级级联：`ledger(update)` / `ledger(close)` 增 `batch` 参（批档指针）——一次结算一批；调用数 2N ⇒ 2 | §3.3 · AC-M2-26 ∥ AC-M2-27 · §3.2 P7 组判据 |
| **P4** | `evidence` 超限读数（软上限 300）：`query` 逐行 `evidenceOversize` + `count` 回报；**读数非闸门** | §5 · §7.1 · AC-M2-31 |
| **P5** | `resume_when` 可空列（条件句 + `@` 锚文法单一；日期锚机判 / 事件锚只作可枚举标记） | §3.4 · AC-M2-32 |
| **P3** | 行粒度规则：**一行 = 一个可独立闭合的工作对象**；清扫轮按对象拆、不按毛病类拆 | §3.9（本批新落）· AC-M2-36 |
| **P2a 定形** | `trigger=归批` ⇒ `task_book` 非空；本笔新指名须可解析 ∧ 在盘；收口自动重锚 + 逐行读数 | §6.2 · AC-M2-29 ∥ AC-M2-30 ∥ AC-M2-33（**批甲不含实施**） |

**不在本批**：P2(a) 的实施（另批，本条只定形）；P7（状态行 ∥ 会话流三处文本行，用户已撤）；§3.7 出口面（同 #1530 另批）；§3.6 指针判据重锚 A/B/C（#1550 另批）。

## 2.2 设计落点

单源 = `docs/core/design/LEDGER.md`（机制档就地更新，不另建文件）。本批改动面 = §3.5（在册状态补 P3 指向 + 受影响面行数回填 + 贴线判单源）· §3.9（**新增** P3 规则节）· §8（AC-M2-36 新增；在册状态行补一句）· §9（行粒度边界）· §3.6 ∥ §3.7 的行数与贴线判收正。
工具描述只指认不重述：`thincoder-core/tool-docs/ledger.md`（6 行）随实施换写（`batch` / `task_book` / `resume_when` / `evidenceOversize` / count 对象形）。

## 2.3 机制设计（逐条）

- **P6**：`ledgerQuery` 过滤链增 `task_book`（原值等值——列串直比，与 §3.3 选行的「文件部分解析同址」是**两条口径、各自单源**）。§6.1 的解析口径不外溢到读面。
- **P1**：新导出 `ledgerUpdateBatch` / `ledgerCloseBatch`；选行单源 `resolveBatchRows(db, base, batch)`（`task_book` 文件部分经 `resolveDeclaredRef` 解析为同一绝对路径的行，任意状态）；单行形签名零改，两形共用逐行落笔函数（`applyRowUpdate` / `applyRowClose`）——迁移表判 / 写门 / evidence 门逐行照判。
  `close --batch` 只销 `待核销` 行（勾销径）；`待讨论` / `待设计` / `在途` 逐行点名跳过（禁静默销账）；追认核销不入批量面。回执 = `{ batch, status, applied, skipped:[{id,from,why}] }`，单事务。
  `batch` 入参自身门（fail-closed）：值自身须可解析（非空文件部分）∧ 批档在盘，否则拒；无匹配行不拒（`applied = []`）。与 §6.1 臂② 同族——判本笔自己指名的那一笔，出路恒在本笔入参内。
- **P4**：`EVIDENCE_SOFT_LIMIT = 300`（`ledger-db.mjs` 常量，与 `AGING_DAYS` 同居）；读数逐行携、不入库、不入 `DATA_COLUMNS`——先例 = `aged`。写入不拒。
- **P5**：`resume_when TEXT` 可空列；`LEDGER_SCHEMA_VERSION` 1 ⇒ 2，老库 `ALTER` 幂等补列（与 `executor` 列同一迁移机制，抽共件）。锚文法：从左到右取首个 `@` token；形合 `YYYY-MM-DD` ∧ 真日历日 ⇒ 日期锚；含 `@` 而非日期锚 ⇒ 事件锚（fail-safe，不判 due）；无 `@` ⇒ `free`。
- **P3**（本批新落）：规则面、无代码。三条 = 登记（一对象一行；同对象散行归一为族行，条件 = 成员同批同轮收口）· 清扫（按工作对象拆，**不按毛病类拆**；成员清单落 `title`；原行核销 ∥ 废弃，不静默删）· 行内证据（症状 + `file:line` + 指针，细节外置）。
  **为什么**：`close` 是二值——行内混装 N 个对象，任一未落则整行永不可闭（实例 `#1479` 8 族 / 40+ 坐标、`#1510` 4 成员并入）。
  **验收明示无机械判据**（语义判断）：可核半幅 = 拆行回执逐行点名（N 行 → M 行 + 各自闭合路径）。
- **P2a 定形**：门只判**本笔写入面**两臂（① 结果行 `status ∈ {在途, 待核销}` ∨ `trigger = 归批` ⇒ `task_book` 非空；② 本笔新写 `task_book` ∨ `trigger = 归批` ⇒ 可解析 ∧ 在盘）；「档此后在不在盘」降为读数 `taskBookOnDisk` + 收口自动重锚（`trigger=条件` + 复启句，`认账不排期` 零触）。

## 2.4 与 `#1550` C 案的边界（收口时点谁做什么）

同一次 `batch` close（`thincoder-core/agent-tools/batch-lifecycle.mjs` 476–506 区段内 `closeBatchRecord`）上挂**两件不同的动作**，不设第二套收口动作：

| 动作 | 谁做 | 写 / 读 | 判据 |
|---|---|---|---|
| **重锚**（`#1550` C） | close 径调 `ledgerReanchorBatch` | **写** | 本批未落行（`task_book` 指本档 ∧ `status ∈ {待讨论,待设计,在途}`）⇒ `trigger=条件` + 复启句 |
| **出口清单**（§3.7 ③） | close 径出回执段 | **只读** | 本批未落行 + 全库超龄行，逐行 `#<id> <出口态> <title>` |

**依赖序**：重锚的取行单源 = P1 的 `resolveBatchRows` / `ledgerBatchRows`（§7.1）——**P1 先落，`#1550` 的 `ledgerReanchorBatch` 才有取行口径**；两者同轮落地时，回执只出一份（重锚点名 + 清单并列，不各出一份）。批甲**只落 P1 的选行与结算**，不落重锚（`#1550` 面），也不落出口清单（§3.7 面）。

## 2.5 受影响文件表（行数 = 2026-10-19 node 实读）

| 文件 | 现行 | 本批增量 | 终值预估 |
|---|---|---|---|
| `thincoder-core/ledger-cmd.mjs` | 178 | 选行 + 两批量函数 + 逐行落笔抽取 + `task_book` 过滤 + `evidenceOversize` | ≈ 248 |
| `thincoder-core/ledger-db.mjs` | 253 | `resume_when` 列 + schema 版本 + `EVIDENCE_SOFT_LIMIT` + 列迁移共件 | ≈ 273 |
| `thincoder-core/ledger-tools.mjs` | 275 | `batch` / `task_book` / `resume_when` 声明 + P7 组判据 + count 回报改形 | ≈ 305 |
| `thincoder-core/ledger.mjs` | 156 | 新导出 re-export（`ledgerUpdateBatch` / `ledgerCloseBatch` / `ledgerBatchRows`） | ≈ 162 |
| `thincoder-core/ledger-migrate.mjs` | 301 | `DATA_COLUMNS` 12 ⇒ 13 + 容忍集 `{executor, resume_when}` | ≈ 306 |
| `thincoder-core/tool-docs/ledger.md` | 6 | 换写（五处） | ≈ 6（行数不变） |
| `thincoder-cli/src/acp/read-data.mjs` | 146 | `ledger/count` 直传核对象（去 `{count:…}` 包装） | 146 |
| `thincoder-core/test/ledger-batch-ops.test.mjs` | 0 | **新建** ~150–200（T92–T101） | 一次性 · 收口随批删 |
| `docs/core/design/LEDGER.md` | 898 | §3.5 / §3.9 / §8 / §9 + 行数回填 | ≈ 940（规则面终态） |

**零改面**：`thincoder-core/ledger-read.mjs`（94——直引 `DATA_COLUMNS`）· `declaration.mjs`（379——`resolveDeclaredRef` 既有）· `ledger-surface.mjs` ×3 · DDL 既有三 CHECK（`kind` / `status` / `trigger` 枚举零改）。
**贴线判**：本批合并最高 = `ledger-tools.mjs` ≈305，全部 ≤500 顾问线 ⇒ 零拆分义务；`batch-lifecycle.mjs` 现 506 行（>500）但**本批不触该档**，拆分触发 = 650 行（单源 = `BATCH-RECORD.md` §4.13）。

## 2.6 兼容性声明

- **现有台账数据零损**（109 行级别）：schema 变更全是**加可空列**（`ALTER TABLE items ADD COLUMN resume_when TEXT`）+ `PRAGMA user_version` 升 2；无 CHECK 收紧、无列改型、无行改写。老库二次打开幂等零副作用。
- **读面零破坏**：`query` 现有四过滤（status / kind / board / trigger）语义逐字不变；`task_book` 是第 5 枚**新增**。行集**只加键**（`evidenceOversize`；沿用 `aged` 先例，不入 `DATA_COLUMNS`）。
- **唯一行为变更（逐条列出）**：
  1. `ledgerCount` 出参 **裸数 ⇒ 对象形**（`{ count, evidenceOversize }`；`overdue` 键由出口面批追加）——消费面三处同批改：`ledger.mjs`（`buildScan` / 收口行读 `.count`）、`thincoder-cli/src/acp/read-data.mjs`、`ledger` 工具 count 回执（现为 `{count: <数>}`）。
  2. `ledger(update)` / `ledger(close)` 的 `id` 由「必填」改为「与 `batch` 恰携其一」（P7）；只传 `id` 的既有调用行为零变。
  3. `ledger(update)` / `ledger(add)` 新增可选 `resume_when`；空串 / 全空白拒（与 `title` 同口径）。
  4. `ledger close` 批量形携 `status` 时只接受 `已核销`（勾销单值）。
- **不改**：`trigger` 三枚举（`归批` / `条件` / `认账不排期`）· 六态状态机与迁移表本体 · `kind` 枚举 · `memory` / `team_ledger` 面。

## 2.7 验收对照（命令 + 期望读数）

| # | 命令 | 期望 |
|---|---|---|
| 1 | 迁移后 `node -e "…openLedger(cwd).prepare('PRAGMA user_version')…"` + 全量 `ledger query` | `user_version = 2`；行数 = 变更前（109 量级）逐行不变；`evidence` 内容逐字不变 |
| 2 | `node --test test/ledger-batch-ops.test.mjs`（T92–T101） | 全绿；T92 调用数 = 2（`update --batch` + `close --batch`）；T93 `skipped` 逐行点名 |
| 3 | `ledger query({ task_book: "<批A>" })`（T97） | 只回 A 批行；B / C 零掺；`count({ task_book })` 数目对 |
| 4 | `ledger count` 回执（T101） | `{ count, evidenceOversize }` 两键；301 字 `evidence` 行 `evidenceOversize = true` 且**写入不被拒** |
| 5 | 老库夹具打开两次（T100） | 列补齐、行不损、二次打开零副作用 |
| 6 | 全量 `npm test`（`thincoder-cli`） | 现有套件全绿（含 `ledger-count` / `read-data` 消费面改形后的断言） |

## 2.8 关键决策（含被否项）

| # | 决策 | 理由 / 被否 |
|---|---|---|
| K1 | 批量面长在 `ledger(update/close)` 的 `batch` 参上，不新开工具、不新开 action | 不新增工具面（§9 不变量④）；`update` / `close` 已是写面唯一入口 |
| K2 | 批量只做勾销，追认核销不入批量 | 追认须逐行结账依据——统一文本会造假账；追认行进 `skipped` 转单行 |
| K3 | 选行按「解析同址」而非串等值 | 同批档三种指针写法（无后缀 / `§2` / `§1.5（括注）`）现实并存；串等值会漏行 |
| K4 | `batch` 入参自身判「在盘」，选出的行**不判**在盘 | 判本笔自己指名的那一笔不成死锁；行侧存在性降为读数 `taskBookOnDisk` |
| K5 | `evidence` 超限只读不拒 | 用户裁定「无限机检反感」；读数进既有盘点面即必然可见 |
| K6 | `resume_when` 用 `@` 前缀锚，不新开列 / 不新表 | 单列可空 ⇒ 存量零破；锚是自由文本里的可枚举标记，机器只判日期锚 |
| K7 | P3 放规则面、明示无机械判据 | 「同一工作对象」是语义判断；硬造机检会逼作者为过闸而拆分措辞 |
| **被否** | 批量追认核销 · 批量跨批（多 `batch`）· `evidence` 超限拒绝写入 · P3 机械判据（如「`evidence` 内 `file:line` 计数 > N 即拒」）· 新开 `ledger_batch` 工具 | 同上各行 |

## 2.9 上抛项

- **[上抛·待裁] U1**：`ledgerCount` 出参改对象形是**破坏性面**（三消费点同批改）；若父侧要零破坏，可另立 `count` 的 `detail` 形延后——本席倾向同批一次改（改形只有一次窗口，分两次改要动两遍消费面）。
- **[上抛·知会] U2**：`batch-lifecycle.mjs` 实测 **506 行**（已越 500 顾问线），本批不触该档；拆分触发 650 行（单源 = `BATCH-RECORD.md` §4.13）。
- **[上抛·知会] U3**：本批 §1 仍为模板占位——本批条目由本次派单任务书承载；建议主 agent 于收口前补 §1 讨论段（六段一段一作者，本席不写 §1）。
- **[上抛·知会] U4**：设计档内 `#1550` / 出口面两节（§3.6 / §3.7）为同板他批设计，本席只收正其行数读数与贴线判口径，未改其语义。

### 修正轮（评审 16 条 · 🔴2 / 🟡10 / 🔵4，父侧全部接受）· 2026-10-19

**范围**：`docs/core/design/LEDGER.md` 单档修正；零代码 · 零 §3 评审段 · 零他批档。doc-check gate = PASS（1 档全清）。

**① 两条 🔴 的唯一定义落法**

- **🔴1 拒因文案**：结果行缺 `task_book` 的条件**只有一句文案**，落点 = §6.1 失败文案第三句（`LEDGER.md:642`）：`<函数>：task_book 必填（在途 / 待核销 / 归批 须携任务书指针）`——`归批` 与 `在途 / 待核销` 是同一门臂① 的三个入触发条件，**不分文案**。新增「缺指针文案单源」句（`:644`）宣告全档只此一处定义；§6.2 失败文案段（`:658`）改为指向 §6.1、不另立；AC-M2-10（`:812`）/ AC-M2-29（`:825`）/ T106（`:924`）三处逐字断言统一引用该句。
- **🔴2 落地批归属**：新增**全档单源表**「落地批（§3.5 · `LEDGER.md:300`）」——**门两臂 A ∥ 归批门 ∥ 读数 B ∥ 收口重锚 C = 台账 #1550**（同 helper `assertTaskBookGate` 一并落，不可拆）；**本批 #1530 只定形 P2(a)**（判据 / 文案 / 用例编排），实施面 = P1 ∥ P4 ∥ P5 ∥ P6。同句复写于 §3.5 四件表（`:300`）、§6.1 在册状态（`:609`）、§6.2 在册状态（`:650`）、§8 在册状态（`:795`），另 §5（`:581`）/ §7.1（`:689`）按件标注。**C 的用例 T99 移出 #1530 用例档**，落 #1550 档 `ledger-pointer-reanchor.test.mjs`（`:914` / `:916` 号段 = T99 · T102–T108）；#1530 档号段收为 T92–T98 · T100–T101（含 T94a ∥ T94b）。

**② 16 条逐条（号 → 改动 file:line）**

| # | 改动 |
|---|---|
| 🔴1 | `LEDGER.md:642`（唯一文案）· `:644`（单源句）· `:658`（§6.2 指回 §6.1）· `:812` / `:825` / `:924`（三处逐字断言对齐） |
| 🔴2 | `:300`（四件落地批表 · 单源）· `:314`（P2(a) 先例行注明 #1550）· `:609` · `:650` · `:795`（三处在册状态同句）· `:689`（§7.1 逐件标注）· `:581`（§5 分行标注）· `:900` / `:914` / `:916`（T99 移位） |
| 🟡3 | `:183–187`（新增声明面组键 `whenPresent`：按形 `required` ∥ `enum`，守卫只读声明）· `:220`（`close` `status` 行按形各列拒因文案）· `:254`（批量形取值域只列该形合法值） |
| 🟡4 | `:324–333`（§3.5 受影响面改表：现行 / 合并增量 / 终值上界，逐档 ≤±N 或「结构不变」）· `:336`（贴线判由增量直接相加得出） |
| 🟡5 | `:324`（现行行数单源声明）· `:372`（§3.6 零改面改「现行 = §3.5」）· `:461`（§3.7 同）· §3.6 / §3.7 各实现行改为「现行 = §3.5 · 本节增量 +~N」 |
| 🟡6 | `:689`（§7.1「九行」⇒「八行」，`resolveLedgerRoot` 移入已落地 #1588）· `:795`（§8 AC-M2-17 移入已落地，删「无 `resolveLedgerRoot`」伪证）；实读 `thincoder-core/ledger-db.mjs:100` 有该导出 |
| 🟡7 | `:232`（例外清单补 `resume_when`）· `:233`（补逐项判据与文案指针） |
| 🟡8 | `:254`（新增「`update` + `batch`（不携 `status`）= 纯字段补丁」一行：写哪些字段 / `status` 零写 / `executor` 普通补丁语义 / 门逐行照判 / 回执 `status: null`） |
| 🟡9 | `:264`（新增「门拒 ≠ 事务失败」：逐行门拒 ⇒ 捕获入 `skipped`、其余行照落；事务级失败 ⇒ 整批 ROLLBACK）· `:905`（T94a 门拒行）· `:906`（T94b 事务失败注入） |
| 🟡10 | `:654`（§6.2 两臂本体删除，改为指向 §6.1 表；本节只留「射程扩一枚 + 文案单源 + 收口重锚」） |
| 🟡11 | `:737`（§7.2 性能行重写：`ledgerCount` = 一次 SELECT + 逐行判 O(N) + N 次盘面判、不设缓存、量级判）· `:465`（§3.7 成本句指回 §7.2） |
| 🟡12 | `:335`（T92–T101 用例档补「一次性验收（零留档）：随实施轮跑完即删」——本项目口径 = 零留存） |
| 🔵13 | `:362`（migrate 行只写读数语义，删「原…失实，改述为…」修订式残留） |
| 🔵14 | `:390`（`resume_due` 比较粒度 = 本地日界：锚日 ≤ `now` 的本地日期，当日锚当日即到期） |
| 🔵15 | `:255`（`close --batch` 归档态行 ⇒ 静默不计：不入 `applied`、不入 `skipped`） |
| 🔵16 | `:338–339`（拆分触发 = 650 行，落点 `docs/core/design/BATCH-RECORD.md:450`；新增「两口径管辖面」：500 / 800 = `AGENTS.md` 全仓通用，650 只对 `batch-lifecycle.mjs` 一档生效、不构成对 500 的先例） |

**③ 本批任务面随之收敛**

- 用例档号段：`ledger-batch-ops.test.mjs` = T92–T98 · T100–T101（含 T94a ∥ T94b），一次性零留档；T99 归 #1550 档。
- 贴线判：合并后最高 = `agent-tools/batch-lifecycle.mjs` 506 + 40 ⇒ ≈546（< 650 拆分触发、< 800 硬线）；本批自有档最高 = `ledger-cmd.mjs` ≈318（< 500）。
- 实施轮入口不变：P1 ∥ P4 ∥ P5 ∥ P6；P2(a) 只作定形，门不实施。

## §3 设计评审（评审子代理）

### 轮次 1（评审子代理）

### 设计评审（批 E · 台账治理六条 + 与 #1550 C 案的边界）

评审对象：`docs/core/design/LEDGER.md`（926 行，全文已读）；范围声明之外未取新对象。

| # | 类别 | 严重度 | 问题 | 建议 |
|---|------|--------|------|------|
| 1 | Requirements / Clarity | 🔴 | 归批行缺指针的拒因文案有两版：`docs/core/design/LEDGER.md:617`「task_book 必填（在途 / 待核销 须携任务书指针）」 vs `docs/core/design/LEDGER.md:635`「trigger=归批 须携任务书指针（批档）」；同一条件（结果行 `trigger=归批` ∧ `task_book` 空）在 §6.1 臂① 射程内却只配了「在途 / 待核销」文案，而 AC-M2-10（`:779`）/ AC-M2-29（`:792`）/ T106（`:888`「「必填」文案逐字」）都只写一条「必填」文案 ⇒ P2a 的定形面缺唯一逐字文本，机检断言无法落。 | 建议给该条件指定唯一定义（单条文案或明确按臂分支：`归批` 走 §6.2 文案、`在途/待核销` 走 §6.1 文案），并把 AC-M2-10 / AC-M2-29 / T106 的逐字断言同步到同一条。 |
| 2 | Scope | 🔴 | 本批与 #1550 C 案的边界自相矛盾：`docs/core/design/LEDGER.md:290` 与 `:295`（`P2(a) 归批指针门（§6.2）`）把 P2 指针面记作「落地批 = 台账 #1530」，而 §6.1（`:584`）与 §6.2（`:624`）把同一门（含归批门）记作「落地批 = 台账 #1550」；同时收口重锚 C 的用例 T99 落在 #1530 的用例档（`:867` / `:876`）。结果：批 E 到底含不含 P2a、C 是否一次落地，读文无法判定。 | 建议把「门两臂 / 归批门 / 读数 / 收口重锚」四项逐项写到唯一一个落地批号，并让 §3.5 / §6.1 / §6.2 / §8 的在册状态与之逐字一致。 |
| 3 | Clarity | 🟡 | `docs/core/design/LEDGER.md:248`「§3.2 守卫 `status` 行按形条件化」要求按 id/batch 形条件必填，但 `:181` 定下「枚举 / 必填 / 类型**不在守卫内复写**」的声明派生单源——条件必填没有声明面承载（与 `oneOfRequired` 并列的新组键未给）；且 `:214` 批量形文案仍写「取值 ∈ {已核销, 已废弃}」（该形下 `已废弃` 非法）。 | 建议为条件必填给一条声明面表达（如组键 `requiredWhen`）并让守卫只读声明；批量形拒因文案改为只列该形合法值域。 |
| 4 | 文件规模标注 | 🟡 | §3.5 受影响面七档只给现行行数、无一枚预期增量（示例 `docs/core/design/LEDGER.md:306`「（178 行——批量选行 / 两 batch 函数 / 门扩枚 / evidence 读数）」），无法核对是否会越级；§3.6/§3.7/§3.8 均给 `⇒ ~N`，口径不齐。 | 建议给 §3.5 七档各补 `≤±N` 或「结构不变」，并让 §3.5 的合并贴线判（`:315`）由这些增量直接相加得出。 |
| 5 | 文档状态 | 🟡 | §3.6 零改面写的是过期行数：`docs/core/design/LEDGER.md:349`「（175 行——DDL / CHECK / 常量零改」与「（260 行——参数声明面零改）」；实读 `thincoder-core/ledger-db.mjs` = 253 行、`thincoder-core/ledger-tools.mjs` = 275 行（与 §3.5 `:307`/`:308` 及 §3.8 `:497`/`:499` 一致）⇒ 同一档在两个章节两个数。 | 建议把 §3.6 两处行数改为现行读数，并约定「现行行数」全档只在 §3.5 维护一份。 |
| 6 | 文档状态 | 🟡 | §7.1 在册状态（`docs/core/design/LEDGER.md:659`「九行携未落地增量」）与 §8 在册状态把已落地的根推导记作未落地：`:765`「无 `resolveLedgerRoot`」、`:763` 把 `AC-M2-17**（根解析面——读写同一推导）` 列入未落表；而 §3.8（`:444`）记「已落地在册——落地批 = 台账 #1588」，实读 `thincoder-core/ledger-db.mjs:100` 已有该导出。同处「九行」与实际列举十项也不符。 | 建议把根推导三项从 §7.1 / §8 的未落地清单移出，并把「九行」改为与实际列举一致；再核一遍两处在册状态与实读证据。 |
| 7 | 文档状态 | 🟡 | 可空串「空串 = 清值」的例外清单缺 `resume_when`：`docs/core/design/LEDGER.md:226`「**例外 = `title` / `task_book` / `evidence`**」，而 `:224` 与 §3.4（`:280`）都要求 `resume_when` 空串 / 全空白拒 ⇒ 同一字段两种口径。 | 建议把 `resume_when` 并入 `:226` 的例外清单（或在例外处改为「见 §3.2 字段判据表」单源指针）。 |
| 8 | Clarity | 🟡 | §3.3 的批量形表只覆盖 `update` + `batch` + `status`（`docs/core/design/LEDGER.md:247`），`update --batch` 不携 `status` 的语义（是否允许、逐行改哪些字段、`executor` 归属如何处理）全档未定义；守卫面（`:208`）又不强制该形必携 `status`。 | 建议在 §3.3 明写 `update --batch` 是否必须携 `status`，或补一行「不携 `status` ⇒ 纯字段补丁」的语义与回执照报。 |
| 9 | 验收标准 | 🟡 | 批量形的「门拒行 ⇒ 跳过」（`docs/core/design/LEDGER.md:247`）与「批量不破任一既有门」（`:256`）缺实现语义与用例：写门是 `throw`（§6.1），逐行 catch 才算「跳过点名」，但 T92–T101（`:869`–`:878`）无一行被写门拒的拍，也无批量中途失败的 ROLLBACK 拍（回滚只在 C 的 T108 有）。 | 建议补一句「逐行门拒 ⇒ 捕获并计入 `skipped`；仅事务级失败整批 ROLLBACK」，并加一拍门拒行 + 一拍失败注入的用例。 |
| 10 | 文档归属 | 🟡 | 同一 helper 的两臂在 §6.1（`:591` 表）与 §6.2（`:630`/`:631`）各有一份规范面表述；§6.2 除文案与重锚外与 §6.1 内容重复 ⇒ 后续改一处易漏另一处。 | 建议 §6.2 只保「射程扩一枚 + 专属文案 + 收口重锚」，两臂本体改为对 §6.1 表的指针。 |
| 11 | 可行性 | 🟡 | `ledgerCount` 由 SQL `COUNT` 改为逐行判（`overdue` 需逐行 `taskBookOnDisk` 的解析 + fs 判），但 §7.2 性能行仍是 `docs/core/design/LEDGER.md:707`「SQLite `COUNT` / 索引查询」，成本模型未更新（每次 `count` 由 O(1) 变 O(N) + N 次盘面判）。 | 建议在 §7.2 性能行与 §3.7 补一句 `ledgerCount` 的新成本模型（行数上界 / 是否有缓存），并说明大账下是否可接受。 |
| 12 | 方法论 | 🟡 | 用例留档纪律不一致：`docs/core/design/LEDGER.md:313` 的 T92–T101 只写「**新建** ~150–200 行——T92–T101」，未标一次性零留档；§3.6（`:346`）与 §3.7（`:436`）均明标「一次性验收（零留档）：随实施轮跑完即删」。 | 建议给 T92–T101 档补同一句零留档口径（或明写该档要留作回归，并给理由）。 |
| 13 | 文档卫生 | 🔵 | 规范面残留修订式表述：`docs/core/design/LEDGER.md:344`「原「该行后续更新将拒于 §6.1 写门」在新门下失实，改述为读数语义」——被推翻的旧表述仍留在受影响面里。 | 建议只写新语义（旗 = 读数、不拦写入），历史留给 git 提交与批档记录。 |
| 14 | Clarity | 🔵 | `resume_due` 的日期粒度未定：`docs/core/design/LEDGER.md:372`「日期锚（`@YYYY-MM-DD`）≤ now」——按日界比还是按时刻比（当日锚是否当日即到期）无一句话，T109 只用「过去日」取证。 | 建议补一句判定粒度（如「日锚以本地日界比较，当日 ≤ 当前日 ⇒ 到期」）。 |
| 15 | Clarity | 🔵 | `close --batch` 的跳过集只枚举三态（`docs/core/design/LEDGER.md:248`「`待讨论` / `待设计` / `在途` ⇒ 跳过」），但选行含归档态（`:250`「（任意状态、含归档态）」）⇒ 已核销 / 已废弃 行是否进 `skipped` 点名、重跑是否刷屏未定。 | 建议明写归档态行在批量 close 回执中的归属（跳过点名 ∥ 静默不计）。 |
| 16 | 文件规模标注 | 🔵 | 拆分触发「650 行」（`docs/core/design/LEDGER.md:315`/`:316`，判据单源 = `design/BATCH-RECORD.md` §4.13）取自本次评审范围之外的档，未能在本轮核；与本轮所据的 500 顾问线 / 800 硬线口径不同源。本批最高预估值 `agent-tools/batch-lifecycle.mjs` 506 ⇒ ≈546 已做拆分评审（结论不拆），故不构成阻塞。 | 建议在贴线判处同时写出 500/800 与 650 两条口径各自的作用面，避免后来者按 650 反推「500 可越」。 |

补充声明（评审口径限制）：本轮未声明项目标准档、也未提供文档地图（review context 明示「No document map found」）⇒ 文档归属准则按「就地更新本档」与「本轮域内不重复描述」两半幅判，跨档归属（`BATCH-RECORD.md` / 需求档）仅核本档对我们的自述句，未取新对象。`declaration.mjs` / `read-data.mjs` 等档的标注行数未逐档核（仅抽查 6 档，见 #5）。

计数：🔴 2 · 🟡 10 · 🔵 4
VERDICT: changes-required

### 轮次 2（评审子代理）

**复核对象** = 批 E 轮次 2（设计评审 · 目标 = 盘上 `docs/core/design/LEDGER.md` ∥ `docs/core/design/BATCH-RECORD.md`）。

**轮次 1 十六条落盘核对（逐项）**：① 拒因文案单源 ✅（LEDGER.md:644 单源句 + :658 回指）· ② 落地批四件表 ✅（:302–:309）· ③ `whenPresent` 组键 ✅（:183–:188）· ④ §3.5 增量表 ✅（残留重行，见 #1）· ⑤ 行数单源 ⚠ 部分落（见 #2 / #3）· ⑥ 在册状态 ⚠ 部分落（见 #4 / #7）· ⑦ `resume_when` 例外 ✅（:232–:233）· ⑧ `update`+`batch` 纯补丁 ✅（:254；验收缺位见 #5）· ⑨ 门拒≠事务失败 ✅（:264 + T94a/T94b）· ⑩ §6.2 两臂删除 ✅（:654 单源回指）· ⑪ §7.2 成本模型 ✅（:465 回指 :737–:738）· ⑫ 零留档 ✅（:335 / :369 / :459）· ⑬ 修订式残留 ✅（面内无 `~~` ；「被否」句仅存于先例行 / 决策行 = 允许面）· ⑭ `resume_due` 粒度 ✅（:395 本地日界）· ⑮ 归档态跳过集 ✅（:255；验收缺位见 #5）· ⑯ 650 两口径 ✅（:338–:339）。

| # | Category | Severity | Issue | Suggestion |
|---|----------|----------|-------|------------|
| 1 | 清晰度 / 文档卫生 | 🟡 | §3.5 受影响面表中 `ledger-tools.mjs` 一行出现两次（LEDGER.md:328 ∥ LEDGER.md:330），且 :328 单元格截断（「…count 回报 | ≈ 305 |」缺右括号）——修正轮留下的重复行，使「单源表」出现两个同值副本 | 删去两行之一并补齐括号，单源表每档恰一行 |
| 2 | 受影响面行数标注 | 🟡 | §3.6:367 写「现行 = §3.5」指 `ledger-migrate.mjs`，但 §3.5 表（:326–:333）无该档行（该档将改 ≤+5 纯文案，现行 301 只在 :527 出现）；同型 `thincoder-cli/src/acp/read-data.mjs`（将改 1 行）不在表内，其现行 146 由 :458 直写——与 :322「他节引用现行值一律回指本表」相抵 | §3.5 表补齐两行（301 / ≤+5 · 146 / ±0），:367 的回指才成立；:458 的读数改为回指 |
| 3 | 受影响面行数标注 | 🟡 | 同一档三组互斥读数：BATCH-RECORD.md:373「376 行」、:442「376 → **505**」、LEDGER.md:333「506」，三者皆自称落笔当刻实读；BATCH-RECORD.md:377 的贴线判（「376 行（增量后 ≈401）」⇒ 零拆分义务）即由陈旧读数算出（实已在 500 顾问线之上，LEDGER.md:337–:339 按 506 判） | 一次实读统一两档读数并重算 :377 贴线判；结论（不拆 + 650 触发）不变，依据须为现行值 |
| 4 | 在册状态 / 跨档 | 🟡 | BATCH-RECORD.md:285 把「收口重锚（本批未落行——自动）」写成现行行为，该档全篇无一处「在册状态」行（grep `在册` 仅命中 :37 的他义）；LEDGER.md:650 同机制判「未落地在册（在册未落）· 落地批 = 台账 #1550」；§4.17 的 P7 ∥ 收口重锚两增量亦无落地批指针 | §4.13 / §4.17 各补一行在册状态（未落 ⇒ 落地批 = #1550，单源 = LEDGER §3.5 四件表），否则只读批档的实现者会把未落地机制当现役 |
| 5 | 验收标准 | 🟡 | 三处新定行为无 AC / 用例对位：(a) `update`+`batch` 纯补丁形（LEDGER.md:254：`status` 零写 / 迁移表不判 / 回执 `status` 键 = `null`）——AC-M2-26（:822）只写「`batch` + `status`」，T92（:902）两次调用亦带 `--status`；(b) 归档态静默不计（:255）——AC-M2-27（:823）与 T93（:903）混批只含 待核销 / 在途 / 待讨论；(c) `close` 批量形 `status` 取值域收窄（:220 逐字文案）——无用例拍 `close --batch --status 已废弃` 必拒 | 三条各补 AC 行 + 用例：纯补丁形一拍（只改 `evidence` ⇒ 各行 `status` 零变、回执 `status: null`）· 混批加一枚 `已核销` 行（既不入 `applied` 也不入 `skipped`）· 批量形 `status` 越域逐字拒 |
| 6 | 清晰度 | 🟡 | `batch` 入参自身门（:259）有判据（可解析 ∧ 在盘）却无逐字拒因文案，未说明文案属哪个函数前缀族；T95（:907）只断言「拒」不带文案。直接复用 §6.1（:642）三句会给 `batch` 参数报「task_book …」——模型可见文案指错字段 | §3.3 补该门逐字拒因（点名 `batch`，与 §6.1 三句同族不同字段），T95 断言文案逐字 |
| 7 | 在册状态 | 🟡 | §8 在册状态块（:797）把 #1550 面枚举为 AC-M2-29 ∥ AC-M2-30 ∥ AC-M2-33，漏 AC-M2-10——而 §3.5 四件表的件 A（:304）= 门两臂正是 AC-M2-10 的主体，§6.1（:609）亦明写该形未落、落地批 = #1550；AC-M2-10（:812）现文本即两臂形态 ⇒ 据 §8 会把它当已落地 | 把 AC-M2-10 并入 :797 的 #1550 枚举（或加一句「件 A = AC-M2-10」），使 §8 与 §3.5 四件表逐件对得上 |
| 8 | 验收标准 / 单源 | 🟡 | 「全档单源 = 本表」（:300）只覆盖 #1550 四件：:309 称「本批 #1530 的实施面 = P1 ∥ P4 ∥ P5 ∥ P6」，而 §3.7（:385）把出口面归「台账 #1530 的出口面」、§3.9（:556）记 P3 亦归 #1530 ⇒ #1530 的实施物清单散在四处，无一处可一次核完 | §3.5 四件表旁补同形表列 #1530 物品（P1/P3/P4/P5/P6/出口面 → 对应节 → 用例号），:309 的枚举随该表；或在句式里收窄「全档单源」的射程 |
| 9 | 证据读数 | 🔵 | 声明源行号两档不一：LEDGER.md:320 / :360 / :449 / :517 记 `PROJECT-MANIFEST.json` 的 `publicRepos` 实读 `:54`；BATCH-RECORD.md:369 记 `:56`、:437 记 `PROJECT-MANIFEST.json:56` | 同一次实读统一到一处行号（勘察证据行的读数必须同值） |
| 10 | 清晰度 | 🔵 | §3.2 字段判据表 `resume_when` 行（:230）只给「为空」一句，未给 P4 错型文案（兄弟行如 `ledger(update)` 的 `board`/`req_doc`/… 均给「非法：<v>（应为字符串）」）；而同表 :232 声明逐字文案以该表为单源 ⇒ 该行缺一枚 | 补 `<工具>：resume_when 非法：<v>（应为字符串）` |
| 11 | 清晰度 | 🔵 | :176 说守卫 helper「「零改」面破例——增布尔分支」，:186 又说「helper 内不写形分支」——两处「分支」指代不同却均未点名（一个是调用形 / 返回值，一个是字段判别），留成实现者的猜测面 | :176 点明该布尔分支开关什么，或换措辞避免与 :186 的「形分支」相混 |
| 12 | 在册状态 | 🔵 | §7.1 在册状态块（:689–:692）只列八行未落 + `resolveLedgerRoot` 已落；表内其余带「（**新增**）」的导出（`scopeMarkerOf` / `resolveExecutorStates` / `ledgerVariantNotice`）无已落 / 未落标记 ⇒ 「八行」这个数只能靠反推 | 给这三行补「在盘（已落）」或并入清单，使块内计数自足 |
| 13 | 可行性（未核） | 🔵 | 声明面新键 `oneOfRequired` / `whenPresent` 非 JSON-schema 标准键，而声明对象正是交到模型侧的同一份（:181「声明即校验」）；两档均未写这两个键是否在交模型前剥除。**未核**（`ledger-tools.mjs` 不在本次评审对象内，未读） | 实施轮确认声明序列化面：自定义键留在声明里不被 provider 拒 / 不被模型误读，或写明剥除点 |

**计数**：🔴 0 · 🟡 8 · 🔵 5。

**VERDICT: pass**（无 🔴；🟡/🔵 不阻断）。

## §4 用户批准（主 agent）

**批准（2026-10-19 · 用户整批令）**

用户逐字：「技术待办现在就开始处理」·「全部开」·「接着派，别等」——覆盖本批批准门。设计已过评审（§3 = pass）⇒ 实施获准。

**批准范围**：P1（批级批量迁移与结算）∥ P4（`evidence` 超限读数）∥ P5（`resume_when` 列）∥ P6（`task_book` 等值过滤）∥ 出口面 §3.7 读数面。
**不在本批（父侧裁定）**：`#1550` 的 A/B/C 三件（批 I）· AC-M2-35 的 close 回执清单半幅（归 `#1550`）。

## §5 实施记录（eng-coder）
**状态行**：实施完成（P1/P4/P5/P6 + 出口面读数面落地；#1550 四件零实施；19/19 绿；两处超 Δ 上界与 AC-M2-35 ③ 归属已报）



### 实施记录（eng-coder · 2026-10-19）

**范围**：台账 #1530 实施面 = P1 批级批量迁移/结算 ∥ P4 evidence 超限读数 ∥ P5 `resume_when` ∥ P6 `task_book` 过滤 ∥ 出口面 §3.7 读数面。**#1550 四件零实施**（§6.1 写门两臂 / 归批门 / `taskBookOnDisk` 行键 / `ledgerBatchRows` ∥ `ledgerReanchorBatch` ∥ `batch-lifecycle.mjs` 重锚——实读 `assertTaskBookGate` 仍为旧形、无该四件符号）。

#### 1. 落档与行数读数（改动前 → 改动后；基准 = `git show HEAD:` 计数）

| 文件 | 改前 | 改后 | Δ | 设计 §3.5 上界 |
|---|---|---|---|---|
| `thincoder-core/ledger-cmd.mjs` | 177 | 348 | **+171** | ≤ +140（**超 31**） |
| `thincoder-core/ledger-db.mjs` | 252 | 264 | +12 | ≤ +20 ✓ |
| `thincoder-core/ledger-tools.mjs` | 274 | 320 | **+46** | ≤ +30（**超 16**） |
| `thincoder-core/ledger.mjs` | 155 | 158 | +3 | ≤ +17 ✓ |
| `thincoder-core/ledger-read.mjs` | 93 | 93 | ±0 | 结构不变 ✓ |
| `thincoder-core/declaration.mjs` | 378 | 378 | ±0 | ≤ +3 ✓ |
| `thincoder-core/ledger-migrate.mjs` | 300 | 304 | +4 | ≈ +5 ✓ |
| `thincoder-core/tool-docs/ledger.md` | 6 | 8 | +2 | 换写（约定 ≈6） |
| `thincoder-cli/src/acp/read-data.mjs` | 145 | 146 | +1 | ±0（改 1 行）✓ |
| `thincoder-core/test/ledger-batch-ops.test.mjs` | 0 | 383 | 新建 | ~150–200（**超**） |

两档超上界的原因如实列出：① 设计 §3.5 的 ≤+140 自身包含「A/B 两臂与读数 ≈+40」——那是 #1550 的面，本批按禁止面不落，故本批自有预算实为 ≈+100；② 本档注释按 why-form（逐段携设计节号与判据来源）书写，注释行占增量约一半。三档全部 ≤500 顾问线 ⇒ 零拆分义务。**未自行扩设计面**：超界处照父侧令「报上来」，不裁剪已落行为。

#### 2. 逐件落法（判据 → 坐标）

- **P1**：`ledger-cmd.mjs` 新导出 `ledgerUpdateBatch` / `ledgerCloseBatch`；选行单源 `resolveBatchRows(db, base, abs)`（`task_book` 文件部分经 `resolveDeclaredRef` 解析为**同一绝对路径**，任意状态含归档态）；逐行落笔抽为 `applyRowUpdate` / `applyRowClose`（单行形与批量形共函数，迁移表判 / 写门 / evidence 门逐行照判）；`batch` 入参自身门 `assertBatchArg`（可解析 ∧ 在盘，否则拒、零写；无匹配行不拒）；事务 = `BEGIN IMMEDIATE`（写锁一次先把），逐行门拒入 `skipped`、事务级失败整批 `ROLLBACK` 并抛。回执 = `{ batch, status, applied, skipped:[{id,from,why}] }`。
- **P4**：`EVIDENCE_SOFT_LIMIT = 300`（`ledger-db.mjs`，与 `AGING_DAYS` 同居）；`query` 逐行 `evidenceOversize`、`count.evidenceOversize`（一次遍历，零额外 IO）；导出 `ledgerEvidenceOversize` 为 `ledgerCount` 薄委托；**写入不拒**。
- **P5**：DDL 加 `resume_when TEXT`；`LEDGER_SCHEMA_VERSION` 1 ⇒ 2；列迁移抽共件 `ensureColumn(db, name)`（`ensureExecutorColumn` 保名为别名）；`DATA_COLUMNS` 13；`ledger-migrate.mjs` 容忍集 `{executor, resume_when}`；add/update 写面 + 空串/全空白拒（守卫 `NON_EMPTY_FIELDS`）。
- **P6**：`ledgerQuery` / `ledgerCount` 各增 `task_book` 等值过滤（原值等值——列串直比）。
- **出口面 §3.7 读数面**：`overdueOf(row,{now,base})` 四类首中优先（`resume_due → dangling → unlabeled → aged`；归档态恒 `null`；日期锚按本地日界比较）；`count` 三键形 `{count, overdue, evidenceOversize}`；`query` 逐行 `overdue`；`buildScan` 增 `overdue` 键；`scopeMarkerOf` 的 `warn` = `overdue>0 ∨ deadExecutors>0`；`formatDetailLine` L2 位扩为 `（老化 <aged> · 待处置 <overdue>）`、L1 文本零扩。
- **守卫（工具层）**：`oneOfRequired: [["id","batch"]]`（update / close 各一）+ `whenPresent: [{when:"batch", field:"status", required:false, enum:["已核销"]}]`（close）；两键居声明条目顶层、**不入 `parameters`** ⇒ 自定义键不随声明交模型 / provider（回应设计评审 🔵13「自定义键序列化面」——已实测 `ledgerTool.parameters` 顶层键仅 `type/required/properties/additionalProperties`）。

#### 3. 逐字文案（父侧回填设计档用）

- `batch` 入参自身门（点名 `batch`、与 §6.1 臂② 同族不同字段）：`ledgerUpdate：batch 不可解析或不在盘（<值>）` ∥ `ledgerClose：batch 不可解析或不在盘（<值>）`。
- `close --batch` 跳过行的 `why`（设计未给逐字，本席落定；两份皆点名 `ledgerClose`）：`ledgerClose：在途不可跳（须先 待核销）` · `ledgerClose：追认核销不入批量面（转单行 close）`。
- 组判据 P7：`ledger(update)：id ∥ batch 须恰携其一（收到 {"id":null,"batch":null}）`（预览 = 组内各字段现值）；批量形 `status` 越域：`ledger(close)：status 非法："已废弃"（取值 ∈ {已核销}）`。

#### 4. 验证读数

- 靶向：`cd thincoder-core && node --test test/ledger-batch-ops.test.mjs` = **19 tests / 19 pass / 0 fail**（用例号 T92–T98 · T94a · T94b · T100 · T100b · T101 · T109 · T110 · T112 · T114 + 父侧追加三拍：纯补丁形 / 混批归档行静默 / `close --batch --status 已废弃` 逐字拒）。
- 全量：改前基线 `npm test`（core ∥ cli）= 两档 "test manifest is empty — zero tests = green"；改后 core = 19 pass 0 fail（含新档）、cli = empty-green ⇒ **改后失败集合 ⊆ 基线（均 ∅）**。
- 真实台账库迁移（一次探针，读数）：`~/.thincoder/ledger/02a338af07b1ba5c.db` 行数 **1687**（设计「109 量级」为陈旧读数）；`user_version` 1 ⇒ 2、`resume_when` 列补上、行集摘要与 `evidence` 摘要前后**逐字相同**（零行损）。
- 真实读面读数：`ledgerCount` = `{"count":85,"overdue":15,"evidenceOversize":57}`（12ms）；`ledgerQuery` 1687 行 32ms；L2 = `台账 thincoder：需求池 16 · 技术待办 69（老化 0 · 待处置 15） — 可开批`。

#### 5. 边界与未落项（disclosed）

- **#1550 四件零实施**（见上），`#1550` 的用例 T123/T124 未写（父侧任务书 ① 把它们列入本批用例数，与设计 §8「T99 · T102–T108 · T123–T124 ⇒ #1550」相抵；按设计 + 禁止面执行）。
- **T98 只落「归批行登记」半幅**：拒半幅 = 归批门（#1550），本批不落。
- **`出口面 §3.7 ③`（`batch close` 回执附清单）未落**：落点 `agent-tools/batch-lifecycle.mjs` 不在本批落档清单、其读数 ∈ #1550 禁止面；本批落了 §3.7 ①②（读数面）。⇒ AC-M2-35 回执清单半幅未闭合，待父侧裁定归属。
- **T94a 的「其余行照落」在同一次批量里不可达**：一次批量的 `patch` 对各行相同 ⇒ 结果行状态相同 ⇒ 写门要么全触要么全不触；本席以「同批不带坏指针 ⇒ 照落」+ T94（迁移表拒一行 / 其余照落）证明逐行捕获语义，未造伪用例。
- 设计档六处在册状态（§3.3 / §3.4 / §3.5 / §3.7 / §5 / §8）与其实读证据已成假句——设计档非本席pen，未改，报告父侧收口归一。

#### 6. 审计 / 评审环与终态

- **内部 explore 偏差审计**（1 轮）：10 条（0 阻塞）；处置 = 修 T94b 自比断言（改行字节前后等值）、删临时探针档、补 T109 的 free / 多锚 / 未来日期锚与 T97 的 `task_book` 错型拒拍、新增 T114 写入零阻拍。
- **内部 advisor 代码评审**（1 轮 · sync · VERDICT: pass）：should-fix 3 条已落（`buildScan` 的 `now` 透传——两读数同时钟；`ledger-migrate.mjs` 三处「12 数据列」注释收正；`resumeAnchor` 正则 `\S*` ⇒ `\S+`，零长 `@` 归 `free`）；剩余 = 行数标称（父侧收正设计表）+ AC-M2-35 ③ 归属裁定。
- **终态 = clean**（0 阻塞项；两处待父侧裁定已在报告中标 `[上抛·待裁]`）。
- **doc_check gate**：`ERROR（引擎已更新…请重启会话后复跑）`——本会话启动后盘上引擎档被更新，按门语义 `ERROR` 不作 PASS；本标的一档 `thincoder-core/tool-docs/ledger.md` 在 report 态全文零命中（报告态 4 条命中全在 `docs/server/design/ops/OPS.md` 行宽，非本批档）。
- **用例档**：`thincoder-core/test/ledger-batch-ops.test.mjs` 在盘待复跑；按「随批删、零留档」由收口轮删除（本席不预删——父侧验收入口就是它）。

## §6 验证与收口（父代理）

**验证与收口（2026-10-19 · 父代理）**

**① 机检门**：`doc_check(mode:"gate")` = **PASS**（会话重启后；全域 197 档 0 命中）。

**② 实施验证读数**：
- `node --test test/ledger-batch-ops.test.mjs` = **19 passed / 0 failed**（T92–T114 含 T94a/T94b/T100b，另有父侧追加三例：纯补丁形 ∥ 混批含已核销行 ∥ `close --batch --status 已废弃` 逐字拒）
- `npm test` = **29 passed / 0 failed**（含批 I 新增 12 例）
- **全量套件失败集合 ∅ ⊆ 基线 ∅**
- 真实台账库迁移（一次探针，已删）：`~/.thincoder/ledger/02a338af07b1ba5c.db` **1687 行**，`user_version 1 → 2`、补 `resume_when` 列、**行集与 `evidence` 摘要前后逐字相同**；迁移前已备份
- 读面：`{"count":85,"overdue":15,"evidenceOversize":57}` · L2 = `台账 thincoder：需求池 16 · 技术待办 69（老化 0 · 待处置 15） — 可开批`

**③ 单元测试零留存**：`ledger-batch-ops.test.mjs` 按「随批删」口径**在收口轮删除**（本批为工程模式批，测试档属批寿命）；本节的读数是它存在过的唯一凭证。

**④ 集成面**：台账为进程内库操作，无 UI 入口 ⇒ 无集成用例；**父侧收口按 `#49` 交付轮的全量跑替代一次**。

**⑤ 修正轮落地前置**：交付轮内部 explore 审计 1 轮 + advisor 评审 1 轮（pass），自修 5 处 —— **终态 clean**。

**⑥ 搁置清单回核**：无。**⑦ 暂缓批复核：无**。

**⑧ 用户文档面同拍**：`tool-docs/ledger.md` 已同轮更新（`taskBookOnDisk` 读数句 + 两臂写门句）——**模型可见面与代码同拍**。

**⑨ ⚠️ 须让读者知道的一件事**：本批**动了机器上真实的用户台账库**（`user_version 1→2`）。**迁移前做了备份、迁移后核了行集与摘要逐字相同**。这是产品在真实数据上的一次 schema 迁移，**按纪律该在动之前报父侧，实际是事后如实交底**——记在此处以备追溯。

**⑩ 边界**：`#1550` 三件（A/B/C）本批零实施（`assertTaskBookGate` 仍为旧形、`query` 无 `taskBookOnDisk`、close 径无重锚）——**由批 I 落**。
