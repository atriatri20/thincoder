# 2026-11-10 · p0-2-batch-ledger-atomicity
> 六段，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 每段只有一个作者：作者的段可 `append` 加内容、可就地改（`edit`）；非作者一概拒。
> 编制：主 agent · 2026-11-10 · 来源 = 用户 2026-11-10 16:11 批准 P0–P2 全部并自动执行；范围 = `docs/core/requirements/ENGINEERING-SYSTEM-OPTIMIZATION.md` A4 ∥ B2 ∥ A7；P0-1 已收口（`2026-11-10-p0-1-ledger-state-machine.md`）。
> 台账 = #2287（core · 归批）。前情 = 无（独立批）。
## §1 讨论（主 agent）
**状态行**：已收口 2026-11-10
批起 sha = 4fafb49c002e12d935989fd9a7eeb72d0d0d2c6b
<§1 模板占位：本批条目 / 关键判据 / 授权口径>

## 讨论（P0-2 批档与台账一致性）

**来源**：`docs/core/requirements/ENGINEERING-SYSTEM-OPTIMIZATION.md` A4 ∥ B2 ∥ A7。
**目标**：批档与台账这两份存储不再互相制造半状态；一次收口把事做完，不留下「档已冻结、账还挂着」。

### 已定决定（父侧）

- **A4 半状态**：现状是 `closeBatchRecord` 先写档、再重锚台账，重锚失败**不否决**收口；重开同理先写档再回收，失败后写锁会拒每一笔写盘。**本批要让失败可见且可恢复**：要么真事务，要么给出可重试的补偿动作与明确的半状态查询面；**不允许静默成功**。
- **B2 一次收口**：现状 `batch close` 只冻结档，台账仍要另调 `ledger close`。**本批把它收成一次动作**：收口时按 `completed` 清单逐行处置并核销，跑完档与账一致。
- **A7 预定批指针**：现状 `task_book` 归批要求指针所指档已在盘，于是「先登记归批意图、后建批」做不到，只能先造空批。**本批允许未建档的预定指针**，或提供批号预注册；判据 = 可先登记意图，建档后自动接上。
- **边界**：P0-1 已改状态机与 `completed` 预检；本批在其上做一致性，**不改状态迁移表本身**。

### 库内勘察

`库内 = 已查：批档与台账双写链路`，落点：

- `thincoder-core/agent-tools/batch-lifecycle.mjs`（`closeBatchRecord` / `statusBatchRecord` / `reanchorOnClose`）
- `thincoder-core/agent-tools/batch-reopen.mjs`（`reclaimOnReopen`）
- `thincoder-core/ledger-cmd.mjs`（`ledgerReanchorBatch` / `ledgerReclaimBatch` / `closeDisposition`）
- `thincoder-core/ledger-write-ops.mjs`（`assertTaskBookGate`）

`库外 = B 类：改动面 = 本仓批档与台账写链路；外部断言 = 零`

### 既有件三问

- `existing: thincoder-core/ledger-write-ops.mjs · name: "assertTaskBookGate" · consumers: 写门的指针点名臂`。
- `existing: thincoder-core/ledger-cmd.mjs · name: "ledgerReanchorBatch" · consumers: 收口重锚（P0-1 已加 `completed` 形参）`。
- `existing: thincoder-core/agent-tools/batch-lifecycle.mjs · name: "reanchorOnClose" · consumers: close / status→已收口 两条通路`。

### 边界

不改状态机（P0-1 已收口）、不改提示词、不动其他批档。

## §2 批次任务与设计（eng-designer）
**状态行**：设计完成（修正轮 8：批次档位结论按现读数收正（2026-11-10））
**本批条目（覆盖）**

| # | 条目 | 设计落点 | 验收 |
|---|---|---|---|
| 1 | A4 半状态：收口 / 重开失败可见、可恢复、不静默成功 | `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` §2.17（写序 · 补偿 · 查询面） | R38 |
| 2 | B2 一次收口：收口动作逐行处置并核销 | 同档 §2.17 收口步序 ∥ `docs/core/design/LEDGER.md` §8.1 AC-M2-39 | R39 |
| 3 | A7 预定批指针：先登记意图、建档自动接上 | `docs/core/design/LEDGER.md` §6.4 ∥ UNIFY §2.17 认领一步 | R40 |
| 4 | 半状态查询面（A4「明确查询面」半句） | UNIFY §2.17 半状态枚举 + 暴露面两处 | AC-M2-40 |

**明确不在本批**

- 不改状态迁移表与六态（P0-1 已收口）。
- 不改提示词（本批提示词笔 = 0）。
- 不做跨存储真事务、不做自动重试、不做半状态自动修复。
- 不做工具描述按角色收窄（P1-1）。

**设计档落点**

- `docs/core/design/LEDGER.md`：§6.1 例外指针 · §6.4 预定批指针 · §8.1（AC-M2-38 / AC-M2-39 / AC-M2-40）· §9 两条边界。
- `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md`：§2.17（做法与理由 · 先例三问 · 调研证据 · 数据事实 · 写序 · 收口与重开步序 · 半状态查询面 · 认领一步 · 受影响文件 · 关键决策 · 验收回指）· §7 四条边界 · §8 两个新交互面 · §9 RTM delta。

**受影响文件**：逐档清单、改动档位结论与量法 = UNIFY §2.17 的「受影响文件」表与其量法块（本节不复述）。跨 500 软线风险的处置已在同处逐档点名。

**验收对照**：R38 / R39 / R40 住 UNIFY §2.17 验收回指表；台账侧面 AC-M2-38 / AC-M2-39 / AC-M2-40 住 LEDGER §8.1。

**关键决策**（逐条带代价，全文 = UNIFY §2.17「关键决策」）

- 写序 = 档先写、台账后写，台账失败回滚档——不可逆的一方（核销）排最后。
- 收口证据由本笔给（`closeEvidence` 必填），不由机器代写——机器代写会把这道理变成摆设。
- 收口即结算：批内零 `待核销` 残留；代价 = 结算行归档终态，重开不回收，同一对象要继续做只能另立新行。
- 被拒三条：跨存储真事务 ∥ 台账先行 ∥ 失败自动重试。

**上抛项（待裁）**

1. `closeEvidence` 是新必填入参。B2 的原话是「逐行处置并核销」，而核销门要工作证据、建档开的行 `evidence` 为空 ⇒ 不新增这一格，「一次收口」对主路径不成立（只能留 `待核销` 残留）。请裁定：收口动作收一格本笔证据。
2. 「收口即结算」的连带后果：批内行一律 `已核销`，重开不再回收，同一工作对象要继续做只能另立新行。这是 A5「归档即终态」的直接后果，请确认这就是要的形。

**未闭合项**：无（设计已写全，待评审）。

### 修正轮（§3 15 条逐条处置 · 全接受）

处置口径：语义层的改判一律改在单源那一侧（`docs/core/design/LEDGER.md`）；跨链口径与 RTM 面住 `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md`；本档 `§2` 只记落点。

| # | 处置 | 落点（文件 · 节） |
|---|---|---|
| 🔴1 | 收口终态两处并立 = 改判没改在单源侧。就地改成两跳结算，旧「推进到待核销」句删除、不留并列；预检与签名补 `closeEvidence` | `docs/core/design/LEDGER.md` §6.2 三条 bullet 与「选行与回执单源」句 · §7.1 导出行 · §10.2 分支行 ∥ 接口块 ∥ 预检条 |
| 🔴2 | A7 主路径被 §6.3 同面判挡死。写死判序：认领支先判、命中即不触同面判；三支（`ledger` ∥ `newDebt` ∥ 认领）互斥 | `docs/core/design/LEDGER.md` §6.4「建档认领」 ∥ `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` §2.17「认领一步」 |
| 🔴3 | 重开补偿失败的残态在查询面上报「一致」。补一类半状态 + 出路句；重开步序补补偿失败分支；R38 补 ⑤ | UNIFY §2.17 半状态表（`open-but-unwritable`）∥ 重开步序 4 ∥ R38 ⑤ ∥ LEDGER §8.1 AC-M2-40（四类 → 五类） |
| 🔴4 | 两条分支无场景出处。写门臂② 改成「判据 + 出处」两列表，每条给一条可复现路径；`≥2` 条的出处写在认领段 | LEDGER §6.4「写门臂②」 ∥ 「建档认领」 |
| 🟡5 | 补偿失败无逐字拒文。收口侧与重开侧各补一条**第二条串**（不得复用声称已回滚的那条） | UNIFY §2.17 收口步序 6 ∥ 重开步序 4 |
| 🟡6 | 本批既有 `待核销` 行被静默结清。回执逐行点名**每一枚**被结清的行，两种起点各一行 | UNIFY §2.17 收口步序 7 ∥ LEDGER §6.2「选行与回执单源」 |
| 🟡7 | RTM delta 表缺「进入口」列。四行全部补列 | UNIFY §9「收口一致性批」表 |
| 🟡8 | 重开失败的业务可观察结果没有 RTM 行。新增 14-12，并把「缺 3」改「缺 4」并写为什么另立 | UNIFY §9「收口一致性批」表 |
| 🟡9 | §6.4 无最近先例 ∥ 勘察证据行。补两行，`filePartOf` 点名对齐 ∥ 偏离（解析 vs 谓词） | LEDGER §6.4 |
| 🟡10 | 既有件三问只答查询面一件。补 `closeEvidence` ∥ `isReservedPointer` ∥ 标记文本三条 | UNIFY §2.17「最近先例」 |
| 🟡11 | 认领写在「开户之前」= 不在该笔事务内，崩中间留半状态。位次改为写形开户之后、`BEGIN IMMEDIATE` 之内（与它替代的 INSERT 同位） | LEDGER §6.4「建档认领」 ∥ UNIFY §2.17「认领一步」 ∥ AC-M2-38 |
| 🟡12 | 「最接近软线的两档」点名错。按同节量法复跑读数最高者为 `thincoder-core/agent-tools/batch-lifecycle.mjs`，改三档点名并给它补拆点 | UNIFY §2.17 档位量法块 |
| 🔵13 | 两项上抛裁定 = 不超出 B2 ∥ A4 的正当推论 ⇒ 上抛收口为「采纳」；评审点出的残留「一句证据覆盖 N 行」补写 | UNIFY §2.17「关键决策」第二条 |
| 🔵14 | 预定行 `taskBookOnDisk` 恒 `false`，不得被 `pointer-stale` 误报。表里写明不计入 | UNIFY §2.17 半状态表该行 ∥ LEDGER §6.4「读数」∥ AC-M2-38 |
| 🔵15 | 收口后重开、行集全归档 ⇒ `open-but-settled` 恒命中。写明为**预期读形**与它的出路 | UNIFY §2.17 半状态表该行 |

**偏离评审建议的一处（如实记）**：评审第 3 条要求「`record = open` ∧ 存在 `待核销` 行」即命中；本设计加上第三条合取「本批**无** `在途` 行」。理由 = 不加它，每个「一行先做完、其余还在做」的合法在途批都会被报成不一致，而那正是同一份评审第 15 条指出的病（恒报不一致）。加合取后判的仍是同一件真事：该批此刻一条在途行都没有 ⇒ 一个字也写不进去；重开补偿失败的残态仍必命中。

**上抛项**：两项（`closeEvidence` 必填 · 收口即结算）按 🔵13 的裁定收口为采纳，不再待裁。

**同轮清掉的一处引缺**：`docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` §2.20 的 `依据` 句按 `docs/core/design/ADVISOR-GUARDS.md` §5 的原文重引（原句是转述，逐字不在源档内）。

**未闭合项**：无。

### 修正轮 2（§3 第 2 轮 4 条逐条处置 · 全接受）

| # | 处置 | 落点（文件 · 节） |
|---|---|---|
| 🔴1 | 三处旧终态句删掉、不留并列：D3 ∥ §10.6 用例行 ∥ T99 全改到「同一事务内两跳至 `已核销`、本批既有 `待核销` 行一并结清」；AC-M2-30 的验收指针改到改后的 D3 并点名其内容 | `docs/core/design/LEDGER.md` §10.5 D3 · §10.6 用例表 · §8 T99 · §8 AC-M2-30 |
| 🔴2 | AC 改成设计判的那一版：类名 `open-but-unwritable`，条件三合取逐字照 §2.17（`record = open` ∧ 本批**无** `在途` 行 ∧ 存在 `待核销` 行） | `docs/core/design/LEDGER.md` §8.1 AC-M2-40 |
| 🔴3 | §9 那行括注只留活着的信号：读数 `taskBookOnDisk=false` + 「半状态面不计入 `pointer-stale`，单源 = §6.4」 | `docs/core/design/LEDGER.md` §9「预定批指针不做」 |
| 🟡4 | AC-M2-37 补认领例外（认领支命中 ⇒ 本节零判，判序单源 = §6.4，三支互斥） | `docs/core/design/LEDGER.md` §8 AC-M2-37 |

**同族滞后副本顺手清掉九处**（同一规则写在别处的旧句，全在本次写域内，逐处处名）：

- `docs/core/design/LEDGER.md` §6.3 判据句「必须显式二选一」⇒「必须显式择一处置」，第三支 = `§6.4` 认领（与 §6.4 三支互斥同源；出处 = 第 4 条指出的同一滞后）。
- `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` 八处仍写「点名行 → `待核销` / `待核销` 行零触」：§2.7 分流表 `待核销` 行 ∥ 同节「认领行的处置」句 ∥ §2.11 分流表同格 ∥ §2.11 的 `[ledger reanchor]` 逐字回执首句 ∥ §5 R5 ∥ §5 R7 ∥ §5 R13 ∥ §6 用例表那一行——全部改到「同事务两跳 / 一并结清并点名」。
- `§9` 上方各轮的历史 delta 块不追改（同档已声明该纪律；现行读形以「收口一致性批」块为准）。

**未闭合项**：无。

### 修正轮 3（实施后口径回收正 · 父侧交办两处）

口径：把设计档回正到实施后的实测形。不改代码、不改 `test/rtm/*`、不动需求档。

| # | 处置 | 落点（文件 · 节） |
|---|---|---|
| 🟡1 | AC-M2-40 改「枚举五类 ∥ 本面可命中四类各一拍 + 第五类 `pointer-stale` 结构不可达并给理由」；枚举计数与「几类各一拍」分两句写，读者不会误以为枚举少了一类 | `docs/core/design/LEDGER.md` §8.1 AC-M2-40 ∥ 同节末条（三条 `依据` + 结论句） |
| 🟡2 | §9 收口一致性批块按实改逐行收正：标题计数 破 3 → 破 4、补 14-7 行；14-11 由「一次失败即 `consistent=false`」改为两拍（回滚成功 ⇒ `record = open · consistent = true` ∥ 残态形 ⇒ `closed-but-open-rows`）；补一行「为何两拍」 | `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` §9「收口一致性批（R38–R40）」块 |

**`pointer-stale` 的写法**：不写成「未覆盖」——条件照 §2.17 表原样实现，缺的是可喂的输入；理由以三条 `依据` 写进节末（同一档 `resolveBatchRows` 与 `assertBatchArg` 的逐字行），机器可查引文。

**未闭合项**：无。`doc_check` gate = PASS（本批写的两档全清）。

### 修正轮 4（父侧交办三条 · 全落）

| # | 处置 | 落点 |
|---|---|---|
| ① | R38 ③ 挪进残态分支：注入失败而**回滚成功** ⇒ 此刻无半状态，`check` 必须读 `consistent = true`；残态读形改由 `closed-but-open-rows` 断言（与 §9 14-11 两拍对齐）；收口步序 6 末句把 `closed-but-settling` 从「同刻命中」收正为「本批另有 `待核销` 行时才命中」 | `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` §2.17 R38 ①③④ · 收口步序 6 |
| ② | 新增第六类 `header-row-missing`（档头 `台账` 行登记的号在台账 `items` 里无同号行）；「行存在但指向别处」不计入；查询面加 `headerRows` 读数；R38 ⑥ + §9 13-6 | 同档 §2.17 半状态表 · 键表 · R38 · §9 13-6 |
| ③ | 六条拒文的绝对句改到「未 COMMIT」口径；`ledgerRollbackFailed` 标记不引入、死分支删掉 | 同档 §2.17 收口步序 6 · 重开步序 4 · attach 步序 · 关键决策 |

**② 的判据与理由**（父侧问「第六类 ∥ 单出一行」，答 = 第六类）：

- **只出一行读数不够**：`consistent` 的定义是 `halfStates` 为空。读数单独存在而 `consistent` 仍为真，回执照样打「一致（本批 N 行）」——父侧指的病一字未消。要么它进 `halfStates`，要么改 `consistent` 的定义；前者就是一类。
- **一拍命中**：手改档头 `台账` 行加一个不存在的号 ⇒ `check` 当场 `consistent = false`、点名该类、给出路（零注入）。
- **生产路径**：`attach` 残态（档头已写号 ∧ 台账提交失败 ∧ 档头回写失败）；注入手法 = 批档 §5 记过的那一套（`BEFORE UPDATE` 触发器 + `chmod 0o444`）。
- **判据不许更宽**：只判「台账里没有这个号」。判「行指向别处」会把合法的退回边（`task_book` 置空、行还在）读成不一致——那正是 `open-but-unwritable` 加合取要避开的病。
- **代价**：`batchLedgerConsistency` 多读档头 `台账` 行 + 按号查表（只读、号数级）；集成面增 1 行（13-6）。

**③ 的选择**（父侧问「置标记 ∥ 改串」，答 = 改串）：

- 置标记那条路没有可复现路径：真事务上的 `ROLLBACK` 几乎不可能失败，全仓也无第二置位点 ⇒ 为它新立的残态串永远打不出来，是一条走不到的判定臂。
- 串真正需要的事实是「本笔未走到 COMMIT」——失败返回形只从 `catch` 出（`COMMIT` 之前的异常），代码当场握有，不需要标记。

**收尾扫一遍**（半状态 ∥ 回滚声称 在三处）：

| 处 | 命中 | 判定 |
|---|---|---|
| §2.17 R38 ③ vs ① | 旧 ③ 要求注入失败后 `consistent=false`，与 ① 的回滚成功相反 | 缺陷，已改（③→④ 残态分支点名 `closed-but-open-rows`） |
| §2.17 收口步序 6 末句 | `closed-but-settling` 写成同刻必命中 | 过度声称，已收正（旁行原态，不是本残态的判据） |
| §2.17 收口 / 重开 / attach 六条串 | 「台账未写」「Nothing was written」断言了代码没核实的部分 | 缺陷，已改到「台账事务未提交」口径 |
| §9 14-11 ∥ 14-12 | 两拍与五类的对应 | 与改后 R38 ①③⑤ 同向，零改 |
| `docs/core/design/LEDGER.md` §8.1 AC-M2-40 | 「枚举五类 ∥ 可命中四类」与 §2.17 现在六类 / 五类不一 | 已收正（单源仍是 §2.17 表） |
| 同节末条 | 「本面判得到的只有其余四类」 | 已收正为「其余五类」 |

**受影响文件增量**（并进 §2.17 表格读）：

| 文件 | 本轮的改 |
|---|---|
| `thincoder-core/ledger-cmd.mjs` | `batchLedgerConsistency` 加第六类与 `headerRows` |
| `thincoder-core/agent-tools/batch-ledger-bind.mjs` | 两条串改字面 + 删 `ledgerRollbackFailed` 死分支 |
| `thincoder-core/agent-tools/batch-closeout.mjs` | 收口两条串 + `checkReceipt` 打印 `headerRows` |
| `thincoder-core/agent-tools/batch-reopen.mjs` | 重开两条串 |
| `test/integration/batch-ledger-bind.test.mjs` | 13-6 |

**未闭合项**：无。

**上抛（待裁）**：13-6 要新写一个 `attach` 集成用例（`test/` 现盘对 `attach` 零引用）。若不愿本批增行，可改记台账、第六类只由单测取证；本席按「增行」写，行不行请父侧裁。

### 修正轮 5（§3 第 4 轮新增内容审 1🔴 + 4🟡 + 5🔵 逐条处置）

口径：只改设计档（`docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md`），不改代码、不改 `test/`、不改需求档、不改 `docs/core/design/LEDGER.md`（单源仍在 §2.17，`AC-M2-40` 只是回指）。

| # | 处置 | 落点 |
|---|---|---|
| 🔴1 | 取**乙**（保留「行仍 `待核销`」那半句）。R38 ③ 的读数改为「`check` 读数 = 重开前那一份（判据 = 逐项相等）」：为回收 `待核销` 行而发起的重开（正常形）起点即命中 `closed-but-settling` ⇒ 读 `consistent = false` 并点名该类，注明是**旁行原态**；行集全归档的重开（`§2.13` 已核销不回收那一形）起点零命中 ⇒ 读 `consistent = true`。**乙 的细化（如实记）**：父侧给的两条处置里「读数改成 `consistent = false`」只覆盖正常形，全归档那一形写死成 false 会与它打架，故单元格判「与写前相等」并两形各给读值——不钉单一值，否则又造一处「同一机制两种说法」 | 同档 §2.17 R38 ③ |
| 🔴1 连带 | ① 同一句里的「回滚成功 ⇒ 此刻没有半状态」（本笔没有 vs 写前没有的区别）同步收到「读数与写前逐项相等」；标准夹具仍钉 `record = open · consistent = true` | 同档 §2.17 R38 ① · §9 14-11 ① |
| 🔴1 连带 | 14-12 第一半补读形（与 ③ 同一个起步状态）：`check` 读数与重开前逐项相等、点名 `closed-but-settling` | 同档 §9 14-12 |
| 🟡2 | `§2.4` 步 5 收到同一口径：拒文只写代码握有的两件（档那一半 `unlinkSync` 的实际结果 ∥ 台账未走到 `COMMIT`）；台账侧 `ROLLBACK` 成败不作判据（`e?.ledgerRollbackFailed` 全仓无一处置位），旧句「台账已回滚」退役并写明理由与走哪条路无关 | 同档 §2.4 步 5 |
| 🟡3 | `headerRows` 行点名解析单源（与写侧 `appendLedgerNoToHeader` 同行正则与号切分，新增只读解析器同居一档）；先例块补两行：`existing: …"appendLedgerNoToHeader"` 与 `none found: 档头号集的存在性判据`（第六类 `header-row-missing` 的三问） | 同档 §2.17 键表 · 「最近先例」 |
| 🟡4 | 13-6 钉死夹具行态：已建档 ∧ **一条 `在途` 行**绑在该档，删号后档头余原号 ⇒ 五类全不命中、`consistent = true`；空行集那一形一并定在单源侧：`open-but-settled` 条件加合取「本批行集**非空**」 | 同档 §9 13-6 · §2.17 半状态表 |
| 🟡5 | `header-row-missing` 出路改成「主路径 = 从档头删号（零台账写、无条件）」+「次路 = 重跑 `attach`，**且写明它的前置**：省略 `ledger` 开新行受同面判约束（引 `docs/core/design/LEDGER.md` §6.3 描述面逐字），同面有未决行时须带显式 `ledger:"#N"` 或改用主路径」 | 同档 §2.17 半状态表 `header-row-missing` 行 |
| 🔵1 | `pointer-stale` 行补交叉引用：本面**结构不可达**（读数与理由 = `docs/core/design/LEDGER.md` §8.1 AC-M2-40）⇒ 不为它接喂不到输入的分支 | 同档 §2.17 半状态表 `pointer-stale` 行 |
| 🔵2–5 | 三条「查过、通过」与一条档位抽检：设计侧零改（判读与本轮各处一致） | — |

**同类扫（收尾一遍 · 半状态 ∥ 一致性读数在三处）**

| 处 | 命中 | 判定 |
|---|---|---|
| §2.17 步序 6 末句 | 「查询面同刻**必**命中 `closed-but-open-rows`」——`completed: []` 的收口残态无 `在途` 行，该类不命中 | 过度声称，已加条件（「本笔点过至少一条 `在途` 行时」） |
| 同处新增 | 上一条暴露的**读数盲区**：零 `在途` 行的收口补偿失败 ⇒ 五类全不命中 ⇒ `check` 报一致 | 如实写进档，处置两条并列（补第七类 ∥ 收紧 `completed` 非空）**交父侧裁**，本席不自行选 |
| §9 14-11 ① ∥ 14-12 ∥ R38 ①③ | 「此刻没有半状态」这一绝对句的四处 | 全改到「与写前逐项相等」 |
| §2.4 步 5 ∥ §2.17 步序 6 | 「台账已回滚」vs「不声称回滚成功」 | 已同口径 |
| 同轮清掉一处引缺（写入门当场报的，非本轮评审项） | §2.18 的 `依据` 句引文与源档不符（源档逐字为 `**within scope** is recorded as a ledger row`，原句写成 `within scope is **booked the same day** as a ledger row`） | 已按源档原文重引 |

**未闭合项**：无（本轮 7 条 + 同类扫全部落笔）。

**上抛（待裁）**

1. **[上抛·待裁] 设计档已走到第六类，代码面还停在五类**（`修正轮 4` 的三项未落地，本轮只改设计不改代码，故逐条留证）：① `batchLedgerConsistency` 只有五类、无 `headerRows` 键（`grep -n "header-row-missing\|headerRows" thincoder-core/ledger-cmd.mjs` = 0 命中）；② create 径的 `e?.ledgerRollbackFailed` 死分支仍在（`batch-ledger-bind.mjs` 逐字 `const rollbackNote = e?.ledgerRollbackFailed ? …`）；③ 六条拒串仍是旧字面（`grep -rn "台账事务未提交" thincoder-core` = 0 命中；attach 两条逐字仍为 `台账未写（…）；…Nothing was written.`）。要落地需另开实施轮（eng-coder），范围 = `修正轮 4` 的「受影响文件增量」表。
2. **[上抛·待裁] 读数盲区**（见同类扫第二行）：零 `在途` 行的收口残态五类全不命中。补第七类 ∥ 收紧 `completed` 非空——两条都动已定设计，取哪条请裁。
3. **[上抛·知会] 13-6 增行**仍按 `修正轮 4` 的上抛项等裁（不愿增行则改记台账、第六类只由单测取证）。

### 修正轮 6（父侧三条上抛裁定 · 一处改字）

口径：只改 `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` 的这一处（条件句 + 理由 + 受它影响的断言）。不改代码、不改 `test/**`、不改 `docs/core/design/LEDGER.md`（该档只回指 §2.17 表，未复述本类条件）。

| # | 处置 | 落点 |
|---|---|---|
| ① | 读数盲区**不补第七类**，放宽 `closed-but-open-rows` 的条件为「`record = closed` ∧ 本批存在**未做完的行**（`在途` ∥ `待讨论` ∥ `待设计`）」；枚举仍是六类，改的是一类的条件。**用词偏离一处（如实记）**：父侧用词「未决行」在本仓已是四态术语（含 `待核销`），照用会与 `closed-but-settling` 重叠 ⇒ 本类自带名字，条件与父侧所给逐字一致，只换称呼 | 同档 §2.17 半状态表该行 |
| ① 理由段 | 新增「为何判未决行而不是只判 `在途` 行」一段：收口后不该留未决行，三类是「收口没做完」的同一件事，拆两类只多一个类名；原条件漏掉零 `在途` 行残态（`completed: []`、行仍 `待讨论`）；收口成功时本批行全为 `已核销` ∥ `已废弃` ⇒ 零未决 ⇒ 不误伤 | 同档 §2.17（紧邻 `open-but-unwritable` 的合取理由段之后） |
| ① 连带一 | 收口步序 6 末段两句收正：残态必有未做完的行（点名行回滚后仍 `在途`；一条也没点名时 `待讨论` ∥ `待设计` 原样留着），故该类同刻命中——原句「本笔点过至少一条 `在途` 行时」是过窄写法，已删；「读数的一处已知盲区（处置未定）」整段换成「零 `在途` 行的收口残态同样被看见」 | 同档 §2.17 收口步序 6 末两段 |
| ① 连带二 | R38 ④ 补两形各一拍、同读该类：点名过行的（点名行仍 `在途`）与零点名行的（`completed: []`、行仍 `待讨论`） | 同档 §2.17 验收回指 R38 ④ |
| ① 连带三 | 14-11 ② 的夹具条件由「本批一行 `在途`」改为「本批存在未决行」，并补两形各一拍 | 同档 §9「收口一致性批」14-11 行 |
| ② | 13-6 增行按已写好的那一版落，本轮零改 | 同档 §9 13-6 行（未动） |
| ③ | 代码面落后设计（`header-row-missing` ∥ `headerRows` ∥ 六条新串 ∥ 删 `ledgerRollbackFailed` 死分支）= 下一轮实施轮的活，本席本轮不碰代码 | — |

**同类扫（本条件与它的读法在三处，逐处判定）**

| 处 | 命中 | 判定 |
|---|---|---|
| §2.17 半状态表 `closed-but-open-rows` 行 | 旧条件「存在 `在途` 行」 | 本轮改判点，已改 |
| §2.17 收口步序 6 末两段 | 「本笔点过至少一条 `在途` 行时…同刻命中」＋「已知盲区、处置未定」 | 旧条件的下游写法，已同口径收正 |
| §9 13-6 行 | 「本批仍 1 行 `在途` ⇒ 六类全不命中、`consistent = true`」 | 零改：夹具的档为 `open` ⇒ 本类第一合取不成立；放宽不影响该读数（读数仍成立） |
| `docs/core/design/LEDGER.md` §8.1 AC-M2-40 | 「枚举六类…可命中五类各一拍」，条件本体指向 §2.17 表 | 零改：类数未变、条件未复述（单源仍在 §2.17） |

**未闭合项**：无。

**上抛（知会）**：§3 轮次 6 的 1🔴 + 4🟡 本轮未处置（父侧边界 = 只改这一处）。其中第 1 条所引「回滚成功 ⇒ `check` 读一致」在现档内**无此句**（`grep` 读数 = 零命中；R38 ③ 格现文为「`check` 读数 = **重开前那一份**（判据 = 逐项相等）」），该条引文已与现档不符；其余四条待下一轮核。

`doc_check` gate = 见本轮报告。

### 修正轮 7（§3 轮次 7 新增 #11 ∥ #12 ∥ #13 逐条处置）

口径：只改 `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md`；不改代码、不改 `test/**`、不改需求档、不改 `docs/core/design/LEDGER.md`。

| # | 处置 | 落点（文件 · 节） |
|---|---|---|
| 🔴 #11（父侧 🔴1） | `closed-but-open-rows` 改为同时读 `status` 与 `trigger`：`在途` 恒算残态；`待讨论` ∥ `待设计` 仅在 `trigger` 非 `条件` 且非 `认账不排期`（含空值）时算「该重锚而未重锚」。`rows` 露出 `trigger`。R39 ∥ §6 正常用例 ∥ §9 14-10 都新增正常收口绿侧：等待态状态不动、`trigger = 条件` 或 `认账不排期` 时不命中，`consistent = true` | 同档 §2.17 半状态表 ∥ 键表 ∥ 判据理由 ∥ R38 / R39 · §6 正常用例 · §9 14-10 |
| 🔴 #12（父侧 🔴2） | 步序 6 删除「残态必有未做完行」与第二条串的「半状态成立」全称；改为按 `check` 的实际行集判。R38 ④ 与 §9 14-11 限到两残态前提，并补全归档反例：非空全归档且档头号集无缺号 ⇒ `record = closed · consistent = true`，不重开、不重试 | 同档 §2.17 步序 6 ∥ R38 ④ · §9 14-11 与理由段 |
| 🟡 #13 | 新只读解析器的落档补进受影响文件表与 `doc_check lines`；该档标为已越软线，拆单直接引用同档 §3 既有那格，不另造拆法 | 同档 §2.17「受影响文件」表 ∥ 档位量法 ∥ 文件层结论 |

**同类扫（当场再修两处全归档误述）**：

| 处 | 命中 | 处置 |
|---|---|---|
| §5 R17「收口后本档行集只剩已核销 / 已废弃」 | 漏掉正常收口后仍留集的 `待讨论` ∥ `待设计`（`trigger = 条件` ∥ `认账不排期`） | 改为「认领行只剩归档态；未认领等待态可留集且不命中」 |
| §9 14-7「收口即结算 ⇒ 批内行全已核销」 | 与 §2.7 ∥ §2.11 的等待态状态不动规则冲突 | 改为「认领行与既有待核销行均到已核销；未动等待态状态不动」 |

**未闭合项**：无。`doc_check` gate = 见本轮报告。

### 修正轮 8（收口前档位结论收正）

口径：只改 `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md`；不改代码、不改 `test/**`、不改需求档。量法不变，绝对行数只记本段。

| # | 处置 | 落点 |
|---|---|---|
| 1 | `batch-skeleton.mjs` 的「已越软线」与拆单回指收正为「软线内，不拆」；§2.17 总述、受影响文件行、文件层结论与接近软线档句同改 | 同档 §2.17「受影响文件」与档位量法块 |
| 2 | 同档扫到 `batch-lifecycle.mjs` 的「越 500 行软线」现值不成立，删掉这一档位断言，保留既有三刀拆分结构；`write-gate.mjs` 被误列为越线档，汇总改点真正越线的 `write-gate-ledger.mjs` | 同档 §3 档位表、判据点改动汇总、定位面收窄结论、拆分预算标题 |

**量法读数**：§2.17 指定的 `doc_check(report, lines=[受影响面])` 复跑，`batch-skeleton.mjs` = 401 内容行、`batch-lifecycle.mjs` = 494 内容行，均未越 500 软线；§3 指定的 node 行扫描复跑，二者分别为 401 / 495，结论相同。`write-gate-ledger.mjs` 两种量法均为 569，保留其越线结论。

**边界**：代码与测试零改；设计档不写绝对行数。`doc_check` gate = 见本轮报告。

## §3 设计评审（评审子代理）
**状态行**：评审通过



### 轮次 1（评审子代理）

| # | 严重度 | 状态 | 证据（指针，不记行号、不写裸档名） |
|---|---|---|---|
| 1 | 🔴 | 未处置 | `docs/core/design/LEDGER.md` §6.2「完成清单内的在途行进入 `待核销` 并清 executor」∥ 同档 §7.1 导出表「重锚在事务内只把点名的在途行推进到待核销」 vs 同档 §8.1 AC-M2-39「点名的 `在途` 行两跳至 `已核销`」；`docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` §1「改判一律改在单源那一侧」；同档 §10.2 预检条件无 `closeEvidence` |
| 2 | 🔴 | 未处置 | `docs/core/design/LEDGER.md` §6.3「本笔省略 `ledger` ∧ 同面存在未决行…⇒ 必须显式二选一」 vs 同档 §6.4「目标路径 P 上存在带标记且解析到 P 的行 ⇒ **不开新行**，认领该行」；`docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` §9 行 13-5 与 13-1 注「有预定行时走 13-5」 |
| 3 | 🔴 | 未处置 | `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` §2.17 重开步序「档已开、行仍待核销——那样写锁会拒每一笔写盘且没有任何提示」；同档半状态表 `open-but-settled` 条件「本批行全部为归档态」；同档 `consistent` 行「`halfStates` 为空 ⇔ `true`」 |
| 4 | 🔴 | 未处置 | `docs/core/design/LEDGER.md` §6.4 拒文表「预定指针所指的档已在盘（去掉「（预定）」标记即可）」∥「`≥2` 条 ⇒ 拒并逐行点名」；对照 `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` §2.17「唯一涉及的现有事实 = 建档开的行 `evidence` 为空」 |
| 5 | 🟡 | 未处置 | `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` §2.17「补偿本身也失败 ⇒ 抛拒并点名半状态与查询面」；同档重开步序无对应分支；同档 R38 四格无补偿失败格；同档收口步序 6 逐字串「batch: close failed — 台账未写（<失败原文>）」 |
| 6 | 🟡 | 未处置 | `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` §2.17 步序 5「本批既有 `待核销` 行 → `已核销`」 vs 步序 7「回执 `[ledger reanchor]` 段逐行点名 `<#id> 在途 → 待核销 → 已核销`」；`docs/core/design/LEDGER.md` §3.3「每一枚被跳过的行在回执里逐行点名」 |
| 7 | 🟡 | 未处置 | `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` §9 收口一致性批表头「编号 / 交互（哪两个组件）/ 业务可观察结果（断言）/ 服务条目」——无进入口列（同档 §9 窄口块有「进入口 = 父侧工具调用（工程模式 depth-0）」） |
| 8 | 🟡 | 未处置 | `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` §9「破 3 / 冗余 0 / 缺 3」未含重开失败的可观察结果；`docs/batches/2026-11-10-p0-2-batch-ledger-atomicity.md` §1「重开同理先写档再回收，失败后写锁会拒每一笔写盘」 |
| 9 | 🟡 | 未处置 | `docs/core/design/LEDGER.md` §6.4 全节无「最近先例」∥「勘察证据」行；同节「`filePartOf` 先剥值尾标记、再切 `§`」为先例近邻，未点名对齐/偏离 |
| 10 | 🟡 | 未处置 | `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` §2.17「`none found: 批-账一致性的只读查询面`」只覆盖查询面；`closeEvidence` ∥ `isReservedPointer` ∥ 标记文本「（预定）」无三问答案 |
| 11 | 🟡 | 未处置 | `docs/core/design/LEDGER.md` §6.4「位次 = 定下目标路径之后、开户之前」 vs `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` §2.4 步 1「开 `BEGIN IMMEDIATE`」+ 步 2「INSERT 一行 `待讨论`」 |
| 12 | 🟡 | 未处置 | `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` §2.17「最接近软线的两档：`thincoder-core/ledger-write-ops.mjs` 与 `thincoder-core/ledger-cmd.mjs`」——按同节量法复跑，十档读数最高者为 `thincoder-core/agent-tools/batch-lifecycle.mjs`（越硬限 0 · 越软线 0 的结论本身成立） |
| 13 | 🔵 | 未处置 | 上抛项裁定：`closeEvidence` 与「收口即结算」均不超出 B2/A4 正当推论（依据 = `docs/core/design/LEDGER.md` §10.2「核销门只判应用本笔补丁后的 `evidence` 非空白」+ `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` §2.17 数据事实）；残留「一句证据覆盖 N 行」未写 |
| 14 | 🔵 | 未处置 | `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` §2.17 半状态 `pointer-stale`「所指档不在盘」 vs `docs/core/design/LEDGER.md` §6.4「预定行 `taskBookOnDisk` 恒 `false`（档未建）」 |
| 15 | 🔵 | 未处置 | `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` §2.17 半状态 `open-but-settled`「本批行全部为归档态」——收口后重开（行集全归档）恒命中，`[ledger consistency]` 恒报不一致，设计未表态为预期读形 |

VERDICT: changes-required

计数：🔴 4 · 🟡 8 · 🔵 3 · 共 15 条（未处置 15）。范围限定：本仓无文档地图档、无项目标准档，Document ownership 按 AGENTS.md 与该两档自述的归属句判。

### 轮次 2（评审子代理）

| # | 严重度 | 状态 | 证据（指针，不记行号、不写裸档名） |
|---|---|---|---|
| 1 | 🔴 | 未处置 | 单源侧只改了被点名三处，同一档另有现行句仍写旧终态：`docs/core/design/LEDGER.md` §10.5 D3「完成清单内的在途行进入待核销」· §10.6 用例表「两行均到待核销，批档正常收口」· §8 用例 T99「`待核销` 行零触（属已落——不取、零改）」 vs 同档 §6.2「同一事务内两跳至 `已核销`」；同档 §8 AC-M2-30 还把「验收 = §10.5 D3」当回指 |
| 2 | — | 已处置 | `docs/core/design/LEDGER.md` §6.4「判序 = 认领支先判，命中即不触 §6.3 同面判」+「三支互斥」；`docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` §9 行 13-5 ∥ 13-1 注「有预定行时走 13-5」 |
| 3 | 🔴 | 未处置 | 查询面侧已补第五类（`docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` §2.17 半状态表 `open-but-unwritable`、R38 ⑤、§9 行 14-12），但台账侧 AC 未跟上：`docs/core/design/LEDGER.md` §8.1 AC-M2-40「含 `open-but-settling`：`record = open` ∧ 本批存在 `待核销` 行」——类名不在枚举内且丢了「无在途行」合取。合取本身判为正当（依据 = §2.17「恒报不一致的读数等于没有读数」+ 重开步序 3「台账单事务」，故重开残态必无 `在途` 行） |
| 4 | — | 已处置 | `docs/core/design/LEDGER.md` §6.4 写门臂② 三列表（分支 / 判据 / 出处）+「② 不在盘 …先登预定行、再造该档…`taskBookOnDisk` 报 `false` 而档在盘」+ 认领段「`≥2` 条 ⇒ 拒并逐行点名」出处句 |
| 5 | — | 已处置 | `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` §2.17 收口步序 6「批档回滚也失败（<回滚原文>）」与重开步序 4「批档回滚也失败（<回滚原文>）——半状态成立：批档已开，本批行仍待核销」；R38 ⑤ |
| 6 | — | 已处置 | `docs/core/design/LEDGER.md` §6.2「回执逐行点名每一枚被结清的行」两种起点 ∥ §10.2 同句；`docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` §2.17 步序 7 ∥ R39 ④ ∥ §9 行 14-10 |
| 7 | — | 已处置 | `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` §9「收口一致性批」表头已含「进入口」，四行各填空 |
| 8 | — | 已处置 | 同节「破 3 / 冗余 0 / 缺 4」+ 行 14-12 +「缺的那第四行 = 重开失败的读形」理由段 |
| 9 | — | 已处置 | `docs/core/design/LEDGER.md` §6.4「最近先例（对齐 ∥ 偏离）」`filePartOf` 解析 vs 谓词 +「调研证据」两行 |
| 10 | — | 已处置 | `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` §2.17 先例行三条：`none found: 收口证据的入参` · `isReservedPointer` 同档同源 · `none found: 行上的「未建档意图」标记` |
| 11 | — | 已处置 | `docs/core/design/LEDGER.md` §6.4「落笔位次 = 写形开户之后、`BEGIN IMMEDIATE` 之内」∥ §2.17「落笔在事务内」∥ §8.1 AC-M2-38「认领在**该笔事务内**」 |
| 12 | — | 已处置 | `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` §2.17「最接近软线的三档」点名 `batch-lifecycle.mjs` 最高并给三处拆点；复跑同节量法（`doc_check` report + lines 十档）= 408 ∥ 379 ∥ 367，越硬限 0 · 越软线 0 |
| 13 | 🔵 | 已处置 | §2.17 关键决策第二条「一句证据覆盖本批 N 行」已写；批档 §2 上抛两项收口为采纳 |
| 14 | 🔵 | 已处置 | 半状态表 `pointer-stale` 出路「预定行…不计入」∥ `docs/core/design/LEDGER.md` §6.4「这一形不计入半状态 `pointer-stale`」∥ AC-M2-38 同句（但见第 16 条的新并立） |
| 15 | 🔵 | 已处置 | §2.17 半状态 `open-but-settled`「重开一份全归档批的必然读形…属预期，不是缺陷」 |
| 16 | 🔴 | 新发现 | `docs/core/design/LEDGER.md` §9「预定批指针不做」（§6.4）：「不校验路径是否落在批次档根下（判据留读数 `taskBookOnDisk=false` 与半状态面 `pointer-stale`）」——把归属交给一个按本设计对该形永不命中的面；与 §6.4 读数条 ∥ AC-M2-38 相反 |
| 17 | 🟡 | 新发现（非强制） | `docs/core/design/LEDGER.md` §8 AC-M2-37「省略 `ledger` ∧ 同面存在未决四态行 ⇒ 拒」无认领例外，与同档 §8.1 AC-M2-38「`batch create` 建该档 ⇒ 认领同一行」对同一入参两答；规范面的优先级已在 §6.4、故属滞后副本 |

VERDICT: changes-required

计数：🔴 3（1（残留）· 3（残留）· 16（新））· 🟡 1（新，非强制）· 🔵 3（均已处置）。上轮 15 条：13 条已处置、2 条未处置（#1 残留三处现行句、#3 台账侧 AC 未跟上）。

### 轮次 3（评审子代理）

第 3 轮只验上轮 3🔴 + 1🟡 与设计席自报的同族副本九处，不重开其余。

| # | 严重度 | 状态 | 证据（指针，不记行号、不带裸档名） |
|---|---|---|---|
| 1 | 🔴 | 已处置 | `docs/core/design/LEDGER.md` §10.5 D3「完成清单内的在途行在同一事务内两跳至 `已核销`（`在途 → 待核销 → 已核销`，中间态不出事务），本批既有 `待核销` 行一并结清」· §10.6「两行均同事务两跳至已核销（中间态不出事务）」· §8 用例 T99「本批既有 `待核销` 行**同事务一并结清**（`待核销 → 已核销`——属已落，按 §6.2 结算、不跳过）」· §8 AC-M2-30「验收 = §10.5 D3（完成清单两跳结算）」——四处同向；两档 grep「推进到」「两行均到」零命中 ⇒ 旧终态句已删、无并列 |
| 2 | 🔴 | 已处置 | `docs/core/design/LEDGER.md` §8.1 AC-M2-40「含 `open-but-unwritable`：`record = open` ∧ 本批**无** `在途` 行 ∧ 存在 `待核销` 行——三合取逐字照 §2.17」——类名与条件与 `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` §2.17 半状态表同名同式，`open-but-settling` 残留零命中 |
| 3 | 🔴 | 已处置 | `docs/core/design/LEDGER.md` §9「不校验路径是否落在批次档根下（判据留读数 `taskBookOnDisk=false`；半状态面不计入 `pointer-stale`，单源 = §6.4）」——与同档 §6.4「**这一形不计入半状态 `pointer-stale`**」· AC-M2-38 同句 · `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` §2.17「**预定行（值尾带 `（预定）` 标记）不计入**」三面一致 |
| 4 | 🟡 | 已处置（升为规范面） | `docs/core/design/LEDGER.md` §8 AC-M2-37「**认领支命中除外**（目标路径上有带标记且解析到它的预定行 ⇒ 走认领、本节零判——判序单源 = §6.4，三支互斥）」——与 §6.4「判序 = 认领支先判，命中即不触 §6.3 同面判」同源，同入参两答已消 |
| 5 | 🟡 | 新发现（非阻断） | 同族副本清理不彻底：`docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` §2.11 判据句「做完了的处置动作就是把它 `update → 待核销`，做完的行不会留在 `在途`」与同节回执首句尾「做完的 update → 待核销 → close 勾销」，对照 §2.7「做完 ⇒ 点进 `completed`（收口同事务两跳至 `已核销`）」——终态同为 `已核销`，两条路径都合法，故判滞后副本 |
| 6 | — | 已受理（有理由的不修） | 「历史 delta 块不追改」：`docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` §9「本档 `§9` 上方各轮的 delta 表记的是各自那轮的状态（含 27-1 的「新增行」块），不回补笔迹——RTM 的现状以 `test/RTM.md` 为准」——同档早前块已有同一约定（「本批之后的现行读数只在 `test/RTM.md` 与本节末「`git` 退出写门」块，本块不复述」），下方「收口一致性批」块又逐行给出 14-4 / 14-5 的现读形 ⇒ 属明示不修 + 理由，受理 |

VERDICT: pass
计数：🔴 0（上轮 3 条全部已处置）· 🟡 1（新，非阻断）· 上轮 🟡 1 条已处置 · 受理 1（历史 delta 块不追改）。范围限定：本仓无文档地图档、无项目标准档，Document ownership 按两档自述的归属句 + 同档既有约定判。

### 轮次 4（评审子代理）

> 状态行重置：第 4 轮打回（changes-required）· 上一轮状态行 = 评审通过 → 进行中 · 2026-11-10

> 本节新增一轮 = 代码评审（P0-2 交付核，§2.17 ∥ §6.2 ∥ §6.4 面）；设计评审三轮读数不追改。

| # | 严重度 | 状态 | 证据（指针：符号 / 节 / 逐字） |
|---|---|---|---|
| 1 | 🔴 | 未处置 | 批档 §5「## §5 实施记录（eng-coder）」下一行直接是「## §6 验证与收口（父代理）」⇒ 用户裁定要求的读数（「读数：`pointer-stale` 在本面上不可达，如实记 §5……不要写成「已覆盖」」）与 UNIFY §2.17「档位量法（读数只记批档 §5）」均无处落；代码面已完成、记录面为零 |
| 2 | 🟡 | 未处置 | 单测标题「AC-M2-40 半状态五类各一拍命中、全一致一拍；预定行不计入 pointer-stale」vs 同档 ⑥ 注释「第五类无输入可喂」——标题声称五类全命中，正文如实记为不可达 |
| 3 | 🟡 | 未处置（设计缺口，父侧改文档） | `overdueOf` 的 `if (row.trigger === "归批" && !pointerOnDisk(row, base)) return "dangling"` vs LEDGER §6.4「这一形不计入半状态」+「预定指针是合法未建档态，不是失效指针」——出口面 `dangling` 未随半状态面一并豁免预定行 |
| 4 | 🟡 | 未处置（非阻断） | `doc_check` 行数读数 = `541  test/integration/batch-close-gate.test.mjs  · 越 500 软线（主动审视）`；UNIFY §2.17 受影响文件表与量法块未含该档，本批的机械 `closeEvidence` 增量又加在它身上 |
| 5 | 🟡 | 未处置（协调项，存量） | `batch-ledger-bind.mjs` 的 `const result = await ledgerBindBatch({` 无 try/catch（`create` 有 `if (created.flag) {` 清理），而 `ledgerBindBatch` 失败分支是 `try { db.exec("ROLLBACK") }` ⇒ 档头已写 `#N`、行随事务消失，`batchLedgerConsistency` 于此形报 `consistent = true` |
| 6 | 🔵 | 未处置 | 收口/重开两路在 `ledgerAfterRecordWrite` 之前已 `ctx.agent._batchWrites = (ctx.agent._batchWrites ?? 0) + 1`；回滚后该计数与 `_touchedFiles` 仍记一次写 |
| 7 | 🔵 | 未处置 | 认领的事务内复核 `if (!row || !isReservedPointer(row.task_book) || (row.status !== "待讨论" && row.status !== "待设计")) {` 只复核标记与现态，不复核「仍解析到 `targetAbs`」（探针的键），落笔会静默改写被改指过的行 |

VERDICT: changes-required
计数：🔴 1 · 🟡 4 · 🔵 2 · 共 7 条。范围限定：本仓无项目标准档；判据 = workspace 评审标准 + AGENTS.md。

### 轮次 5（评审子代理）

| 1 | 🔴 → Accepted | 父侧/机制项（非实施席可修）：`assertSectionFiveGate` 拒文「§5 append refused — the implementation section opens only after the design review passed」（两臂：§3 状态词 + §3 末块 pass 裁定）∥ 批档 §3 现状「进行中（第 4 轮打回）」⇒ 通过前结构不可写；残务 = 一轮 pass 之后的 §5 补录（`CHAIN_SEGMENTS = [2, 3, 4, 6]`「§5 段号豁免恒不判」⇒ 无门兜底，靠父侧执行） |
| 2 | 🟡 → Fixed | 单测标题改「AC-M2-40 半状态四类各一拍命中…第五类 pointer-stale 在批-账面上结构不可达（读数，附原因）」，与同档 ⑥「第五类无输入可喂」自洽 |
| 3 | 🟡 → Accepted | `overdueOf` 的 `if (row.trigger === "归批" && !pointerOnDisk(row, base)) return "dangling"` 未动；单源缺口（LEDGER §6.4 豁免边界）归设计席，实施席无权改设计 |
| 4 | 🟡 → Accepted | `doc_check` 读数 541 与上轮同值（18 行原地替换）；档位债归 §2.17 量法块 ∥ §5，非本笔引入 |
| 5 | 🟡 → Accepted | `attach` 形未动（存量；`create` 有 `if (created.flag) {` 清理、`attach` 只到 `}, writeHeader)` 无 catch）；设计五类枚举不含它 ⇒ 归批档 §2 ∥ 下一批裁 |
| 6 | 🔵 → Fixed | 三处写盘处注释「记「落过盘」，回档不回退」+ 「它不进任何判据」 |
| 7 | 🔵 → Fixed | 事务内复核补 `pathKey(resolveDeclaredRef(base, stillMine).abs) !== pathKey(targetAbs)`（与探针同一比较；`resolveDeclaredRef` 未命中仍返 abs ⇒ 未建档目标照判、不误拒） |
| 8 (new) | 🟡 报而不改 | LEDGER §8.1 AC-M2-40「**五类**半状态各一拍命中」vs 单测「四类各一拍命中 + 第五类不可达」——设计 AC 口径待设计席 ∥ §5 读数（R7e 报告态，不阻本轮） |

VERDICT: pass
计：🔴 未决 0 · 🟡 收口 3（父侧/设计席）· 🔵 0 · 新 🟡 1（报而不改）

### 轮次 6（评审子代理）

> 状态行重置：第 6 轮打回（changes-required）· 上一轮状态行 = 评审通过 → 进行中 · 2026-11-10

本轮（第 4 轮·新增内容审）只核三处设计面修正 + 13-6 增行，逐条读 `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` §2.4 ∥ §2.17 ∥ §9 与 `docs/core/design/LEDGER.md` §6.3 ∥ §6.4 ∥ §8.1。

| # | 严重度 | 状态 | 证据（指针，不写行号） |
|---|---|---|---|
| 1 | 🔴 | 未解决 | §2.17 验收回指表 R38 ③ 格逐字「行仍 `待核销` … 回滚成功 ⇒ `check` 读一致」 vs 同节半状态表 `closed-but-settling` 行逐字「`record = closed` ∧ 本批存在 `待核销` 行」＋键表 `consistent` 行逐字「`halfStates` 为空 ⇔ `true`」——③ 描述的那个态正是该类 ⇒ 必读成 `consistent = false`，同一机制两种说法 |
| 2 | 🟡 | 未解决 | §2.4「事务」块步 5 逐字「回滚失败 ⇒ 拒文点名「台账已回滚 / 档残留 <路径>」」 vs §2.17 步序 6「拒文里的绝对句只写代码握有的事实」条逐字「串不声称「回滚成功」」——建档径仍可断言台账侧回滚，理由（`e?.ledgerRollbackFailed` 全仓无一处置位）与路径无关 |
| 3 | 🟡 | 未解决 | §2.17 查询面键表 `headerRows` 行逐字「档头 `台账` 行登记的号集」——解析单源未点名（对照 `record` 行的 `readBatchStatusLine` 与先例块的 `filePartOf`）；新类名 `header-row-missing` 亦无 `existing:` ∥ `none found:` 三问行 |
| 4 | 🟡 | 未解决 | §9 13-6 格逐字「把该号从档头删掉或重跑 `attach` ⇒ 转 `consistent = true`」——夹具行态未钉，而 §2.17 半状态表 `open-but-settled` 行逐字「本批行全部为归档态」在空行集上恒真 ⇒ 该格可能永远转不了绿 |
| 5 | 🟡 | 未解决 | §2.17 半状态表 `header-row-missing` 行出路逐字「重跑 `attach`（它补一行并把号登记在档头）」 vs `docs/core/design/LEDGER.md` §6.3「模型可见描述面」`ledger` 参数自述逐字「only when no unsettled row exists on the same face (board); otherwise it is refused」——残态里这一句可能被同面判当场拒 |
| 6 | 🔵 | 通过 | 六条拒串（收口 2 ∥ 重开 2 ∥ 补挂 2）逐条读：全部起于逐字「台账事务未提交」；`ledgerRollbackFailed` 死分支处置 = §2.17 步序 6 第三格「删掉那个死分支、不引入该标记」＋受影响文件表 `thincoder-core/agent-tools/batch-ledger-bind.mjs` 行同句 ⇒ 三径同口径，且与 `Nothing was written` 的残留处（`batch` 写前拒文）不冲突 |
| 7 | 🔵 | 通过 | `pointer-stale` 与 `header-row-missing` 无交：前者判行集内行的 `task_book`，后者判档头号集对 `items`；退回边解绑后行仍在 `items` ⇒ 不算该类的理由成立（§2.17「为何只判「台账里没有这个号」」条）；`docs/core/design/LEDGER.md` §8.1 AC-M2-40 逐字「第六类 `pointer-stale` **结构不可达**」与两处枚举一致 |
| 8 | 🔵 | 通过 | 13-6 增行正当：四列齐（交互 ∥ 断言 ∥ 进入口 ∥ 服务条目 R38 ⑥）、编号先落 `test/rtm/batch-ledger.md`、进入口是真入口（手改档头后 `batch check`）；`test` 面检索 `attach` = 零命中（本轮实检）⇒ R38 ⑥ 否则无验收 |
| 9 | 🔵 | 通过 | 受影响文件档位结论（§2.17「受影响文件」块 ∥ §3 档位表）：量法命令在册、逐档结论在册；本轮 spot-check 抽 8 档（`thincoder-core/ledger-cmd.mjs` ∥ `thincoder-core/agent-tools/batch-lifecycle.mjs` ∥ `thincoder-core/agent-tools/batch-ledger-bind.mjs` ∥ `thincoder-core/ledger-write-ops.mjs` ∥ `thincoder-core/ledger-close-proof.mjs` ∥ `thincoder-core/agent-tools/batch.mjs` ∥ `test/integration/batch-ledger-bind.test.mjs` ∥ `test/integration/batch-gates-reanchor.test.mjs`）全在软线内，最高一档 = 设计自己点名的 `thincoder-core/agent-tools/batch-lifecycle.mjs` ⇒ 「无一档跨档位」成立，设计内无行数读数 |

计数：🔴 1 · 🟡 4 · 🔵 4（共 9 条；🔴 未解决 ⇒ 本门不放行）。
本轮三处修正的判读：⑥ 格的顺序重排与步序 6 末句条件化成立（③ 格的读形除外）；六条拒串同口径成立；第六类「判据不更宽」成立，出路与绿侧断言两处待修（第 4 ∥ 5 条）。

VERDICT: changes-required

### 轮次 7（评审子代理）

| # | 严重度 | 状态 | 证据 |
|---|---|---|---|
| 1 | 🔴 | Fixed | `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` §2.17 R38 ③ 已改成「`check` 读数 = **重开前那一份**（判据 = 逐项相等）」，并分别给 `closed-but-settling` 起点与全归档起点两形；§9 14-12 同步为逐项相等 |
| 2 | 🟡 | Fixed | 同档 §2.4 事务步 5 已写「拒文只写代码握有的两件事实」，只报档侧实际结果与「台账事务**未提交**」，并写「旧句『台账已回滚』退役」 |
| 3 | 🟡 | Fixed | 同档 §2.17「最近先例」补 `appendLedgerNoToHeader` 三问及只读解析器三问；`headerRows` 格点名 `thincoder-core/agent-tools/batch-skeleton.mjs`、同一行正则与号切分 |
| 4 | 🟡 | Fixed | 同档 §9 13-6 夹具钉为「已建档且**一条 `在途` 行**绑在该档」；§2.17 `open-but-settled` 条件已含「本批行集**非空**」，全归档重开仍保留原义 |
| 5 | 🟡 | Fixed | 同档 §2.17 `header-row-missing` 出路改为「**主路径 = 把该号从档头 `台账` 行删掉**」；重跑 `attach` 降为次路并引 `docs/core/design/LEDGER.md` §6.3 同面判前置 |
| 6 | 🔵 | Fixed | 同档 §2.17 `pointer-stale` 格已补「本面**结构不可达**」并回指 `docs/core/design/LEDGER.md` §8.1 AC-M2-40；与 `header-row-missing` 仍无交叠 |
| 7 | 🔵 | Fixed | 同档 §2.17 六条拒串仍以「台账事务未提交」开头；`ledgerRollbackFailed` 死分支处置保留 |
| 8 | 🔵 | Fixed | 同档 §9 13-6 四列齐、服务 R38 ⑥，手改档头后经 `check` 的入口与修复断言均在 |
| 9 | 🔵 | Fixed | 上轮层级量法与结论仍在本档 §2.17「受影响文件」；本轮新增解析器落档的连带漏项另记 #13 |
| 10 | 🔵 | Accepted | 评审上下文仍未给项目标准档与文档地图；所有权只能按 `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` 自身单源声明及 `docs/core/design/LEDGER.md` 的回指核对，限制不变 |
| 11 | 🔴 | New | 新增放宽会误伤正常收口：同档 §2.17 `closed-but-open-rows` 判「本批存在**未做完的行**（`在途` ∥ `待讨论` ∥ `待设计`）」；但同档 §2.11 重锚表逐字「`待讨论` / `待设计` | **机器兜底** | 只落 `trigger = 条件` + 复启句，状态不动」，`docs/core/design/LEDGER.md` §8 T99 也逐字「库内该行 `trigger = 条件`」。故正常收口后这些行仍属本批行集且状态仍为 `待讨论` / `待设计`，新条件必命中；§2.17「放宽不误伤：收口成功时本批行全是 `已核销` ∥ `已废弃`」与上述状态机直接相反。必须先把 `status` 与 `trigger` 的判据说清，并让正常收口夹具不命中，再可批准 |
| 12 | 🔴 | New | 同档 §2.17 步序 6 又写「残态下本批必有未做完的行」，但 `open-but-settled` 的出路逐字允许「直接收口」一份非空全归档批；预检只要求 `completed` 为数字数组并不要求非空。全归档批以 `completed: []` 收口时，台账失败且档补偿也失败的残态是 `record = closed` + 全归档行，按六类表没有 `closed-but-open-rows` 可命中；这句全称及 R38 ④ 的残态口径须限到其真正前提，不能继续声称必有 |
| 13 | 🟡 | New | 新只读解析器落点 = `thincoder-core/agent-tools/batch-skeleton.mjs`（§2.17「最近先例」逐字「落点 = 同一档、紧邻它」），但 §2.17「受影响文件」表及量法未收该档；同档 §3 档位表又明确该档「**已越软线**」。局部受影响面与量法需随新落点补齐；此项为文档连带缺项 |

上轮 10 项全部 Fixed / Accepted；本轮新增 2🔴 + 1🟡。#11 证明新增放宽会误伤正常收口档，#12 另留一个全归档残态反例。

VERDICT: changes-required

### 轮次 8（评审子代理）

| # | 严重度 | 状态 | 证据 |
|---|---|---|---|
| 1 | 🔴 | Fixed | docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md §2.17「验收回指」R38 ③：重开回滚后的读数改为与重开前逐项相等，并分别覆盖 `closed-but-settling` 起点与非空全归档起点；§9 14-12 同口径。 |
| 2 | 🟡 | Fixed | docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md §2.4「事务」步 5：只报档侧实际结果与「台账事务未提交」，并明示旧句「台账已回滚」退役。 |
| 3 | 🟡 | Fixed | docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md §2.17「最近先例」与 `headerRows`：只读解析器落 `thincoder-core/agent-tools/batch-skeleton.mjs`，与 `appendLedgerNoToHeader` 共用行正则和号切分。 |
| 4 | 🟡 | Fixed | docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md §9 13-6：夹具保留一条绑定本档的 `在途` 行；§2.17 `open-but-settled` 以「本批行集非空」限定，两形不再混同。 |
| 5 | 🟡 | Fixed | docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md §2.17 `header-row-missing`：从档头删号为无前置主路径，重跑 `attach` 为受同面判约束的次路。 |
| 6 | 🔵 | Fixed | docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md §2.17 `pointer-stale`：预定行排除与结构不可达均回指 docs/core/design/LEDGER.md §6.4、§8.1。 |
| 7 | 🔵 | Fixed | docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md §2.17 三条失败串均为「台账事务未提交」；删除 `ledgerRollbackFailed` 死分支的处置仍在。 |
| 8 | 🔵 | Fixed | docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md §9 13-6：交互、业务结果、进入口、服务条目齐全，删号主路径与修复后 `consistent = true` 均可观察。 |
| 9 | 🔵 | Fixed | docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md §2.17「受影响文件」与档位量法仍逐档可复跑；上轮解析器漏项由本轮 #13 单独复核并已补齐。 |
| 10 | 🔵 | Accepted | 项目标准档与文档地图未提供的验证限制保持不变；所有权仅按 docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md §1「档归属」与 docs/core/design/LEDGER.md 的回指核对。 |
| 11 | 🔴 | Fixed | docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md §2.17 `closed-but-open-rows` 同时读 `status` 与 `trigger`：`在途` 恒算残态；等待态仅在 `trigger` 非 `条件` 且非 `认账不排期`（含空值）时算残态。§5 R39、§6 正常收口行、§9 14-10 均有正常收口绿侧。 |
| 12 | 🔴 | Fixed | docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md §2.17 步序 6、R38 ④ 与 §9 14-11：按实际行集判定；非空全归档且档头号集无缺号时读 `record = closed · consistent = true`，不再预设残态必不一致。 |
| 13 | 🟡 | Fixed | docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md §2.17「受影响文件」与量法已收 `thincoder-core/agent-tools/batch-skeleton.mjs`，标明已越软线并回指本档 §3 的拆单计划。 |

VERDICT: pass

计数：13 项全复核；Fixed 12 · Accepted 1 · Unfixed 0；未收口 🔴 0。

### 轮次 9（评审子代理）

| # | 严重度 | 状态 | 证据 |
|---|---|---|---|
| 1 | 🟡 | 未处置（可选） | `docs/batches/2026-11-10-p0-2-batch-ledger-atomicity.test.mjs` 全档实读 514 行，越工作区 500 行软线；未越 800 硬限 |
| 2 | 🔵 | 未处置 | `test/integration/batch-ledger-bind.test.mjs` 头注「集成用例 13-1 … 13-3」与现行 `CLI 13-6` 用例不符 |
| 3 | 🔵 | 未处置 | `test/integration/batch-gates-reanchor.test.mjs` 头注「集成用例 14-1 … 14-9」与现行 `CLI 14-10` ∥ `CLI 14-11` ∥ `CLI 14-12` 用例不符 |

VERDICT: pass

计数：🔴 0 · 🟡 1（可选，软线档位）· 🔵 2。六条拒串逐字符合 §2.17；`headerRows` / `header-row-missing`、`status` + `trigger` 条件与 RTM 13-6、14-10～14-12 的真实双失败及全归档覆盖均已核对。

### 轮次 10（评审子代理）

| # | 严重度 | 状态 | 证据 |
|---|--------|------|------|
| 1 | 🟡（可选） | Unfixed | `2026-11-10-p0-2-batch-ledger-atomicity.test.mjs` 全档现为 502 行，仍超过 500 行软线；档头仍为「本批单元测试（随批、收口删除）」 |
| 2 | 🔵 | Fixed | `batch-ledger-bind.test.mjs` 档头「集成用例 13-1 … 13-6」，与 `CLI 13-6` 用例一致 |
| 3 | 🔵 | Fixed | `batch-gates-reanchor.test.mjs` 档头「集成用例 14-1 … 14-12」，与 `CLI 14-12` 用例一致 |

VERDICT: pass

计数：Fixed 2（🔵）；Unfixed 1（🟡 可选软线项）；New 0。

### 轮次 11（评审子代理）

| # | 严重度 | 状态 | 证据 |
|---|--------|------|------|
| 1 | 🟡 | Fixed | `docs/batches/2026-11-10-p0-2-batch-ledger-atomicity.test.mjs` 全档 fresh read：500 个内容行，末尾仅余一个空行；已不再超过 500 行软线。 |

VERDICT: pass

计数：Fixed 1，Accepted 0，Unfixed 0，New 0。

## §4 用户批准（主 agent）

## 用户批准

- **批准形态 = 整批授权**：用户 2026-11-10 16:11 指令「P0–P2 全部批次自动跑完，碰到问题现场修」，覆盖本批的评审点火与实施启动。
- **过程中一条用户直令改变了处置方式**：「能当场修的绝不挂账」——本批实施中两条误挂账（`#2292` attach 半状态 ∥ `#2293` 测试档行数）均已撤回并就地修，其中 `#2292` 对应的补偿缺口已由修正轮落进 `thincoder-core/agent-tools/batch-ledger-bind.mjs`。

## §5 实施记录（eng-coder）
**状态行**：实施完成（追加轮：单测 18/18 · 集成 6/6 + 12/12 绿 · audit clean · advisor pass · doc_check PASS）



### 交付摘要（P0-2 批账一致性 · §2 四条条目）

**已落地的档（逐档一句话）**

- `thincoder-core/ledger-close-proof.mjs` — `filePartOf` 先剥值尾标记 `（预定）` 再切 `§`；新增谓词 `isReservedPointer` 与常量 `RESERVED_POINTER_MARKER`（同档同源，不由「与原文不等」倒推）。
- `thincoder-core/ledger-write-ops.mjs` — 写门臂② 预定支（项目相对 ∥ 不在盘，逐字两串）；建档认领探针 `reservedClaimProbe` + `≥2` 逐行点名 + 事务内复核（标记 ∧ 现态 ∧ 仍解析到 P）；认领 = 事务内一笔 `applyRowUpdateTx`（不 INSERT）。
- `thincoder-core/ledger-cmd.mjs` — 收口预检增 `closeEvidence` 一格；`ledgerReanchorBatch` 收口即结算（两跳走 `applyRowUpdateTx` + `applyRowClose`、既有 `待核销` 行一并结清、证据前缀 `收口 <YYYY-MM-DD>：`）；新增 `batchLedgerConsistency`（五类条件 + 出路 + `consistent`）。
- `thincoder-core/ledger.mjs` — 再导出 `batchLedgerConsistency`。
- `thincoder-core/agent-tools/batch-lifecycle.mjs` — `ledgerAfterRecordWrite` 承担写序与补偿（收口 ∥ 重开共用）；`consistencyOf`；`checkBatchRecord`；两路回执末尾 `[ledger consistency]`；`closeEvidence` 透传；记账口径注释三处。
- `thincoder-core/agent-tools/batch-closeout.mjs` — `reanchorReceiptLine` 改两种起点逐行点名；新增 `closeLedgerFailedError` / `closeHalfStateError` / `consistencyReceiptLine` / `checkReceipt`。
- `thincoder-core/agent-tools/batch-reopen.mjs` — 删「回收失败不否决重开」那一段；新增 `reopenLedgerFailedError` / `reopenHalfStateError`。
- `thincoder-core/agent-tools/batch.mjs` — schema 增 `closeEvidence` 与 `check`（profile 面正确排除 `check`）；`closeEvidence` 在非收口笔上拒。
- `thincoder-core/agent-tools/batch-ledger-bind.mjs` — 回执点名认领形。
- `thincoder-core/tool-docs/batch.md` / `thincoder-core/tool-docs/ledger.md` — 模型可见契约同步（`closeEvidence` · `check` · 写序与补偿 · 预定标记形与认领）。
- `docs/batches/2026-11-10-p0-2-batch-ledger-atomicity.test.mjs` — 本批单测 11 例（正常 / 边界 / 负例），收口删除。
- `test/integration/batch-gates-reanchor.test.mjs` — 14-4 ∥ 14-5 ∥ 14-6 ∥ 14-7 题设与断言改写；新增 14-10 ∥ 14-11 ∥ 14-12。
- `test/integration/batch-ledger-bind.test.mjs` — 13-1 题设补「无预定行」；13-4 补 `closeEvidence`；新增 13-5。
- `test/integration/batch-close-gate.test.mjs` / `batch-close-token-consume.test.mjs` / `batch-touched-region-gate.test.mjs` — 每笔 `close` 补 `closeEvidence`（close 的唯一新必填格，不改即红）。
- `test/rtm/batch-ledger.md` — 13 节注四态 → 五态并增 13-5 行；14 节注九态 → 十二态、改写 14-4 ∥ 14-5 ∥ 14-6 ∥ 14-7、增 14-10 ∥ 14-11 ∥ 14-12。

**决策披露表（§2 四条条目逐条）**

| # | 条目 | 状态 | 说明 |
|---|---|---|---|
| 1 | A4 半状态：失败可见、可恢复、不静默（R38） | ✅ 已做 | 写序 = 只读预检 → 档写盘 → 台账单事务 →（失败 ⇒ 写前全文回档）；两路各一条第一条串 + 各自的第二条串（不复用）；`check` 与回执 `[ledger consistency]` 同一读数。**⑤ 的第二条串端到端不注入**：单进程内造不出稳定的回写失败，故「两条串互不复用 + 残态读形」由单测取证——如实记，不写「已覆盖」。 |
| 2 | B2 一次收口：收口即结算（R39） | ✅ 已做 | `completed` ∥ `closeEvidence` 双必填，两道都在凭证消费与写盘之前拒；点名行同事务两跳至 `已核销`、既有 `待核销` 行一并结清；回执两种起点各一行。 |
| 3 | A7 预定批指针：先登记意图、建档自动接上（R40） | ✅ 已做 | 臂② 两支 + 两条逐字拒文；认领在 `BEGIN IMMEDIATE` 之内、认领支先判、`≥2` 逐行点名、事务内复核。 |
| 4 | 半状态查询面（AC-M2-40） | ⚠️ 简化（按父侧裁定） | 五类条件与出路全部实现；`pointer-stale` 在本面**结构不可达**（见下条读数），四类各一拍命中 + 全一致一拍由单测取证。 |

### `pointer-stale` 不可达：读数与原因（不写成「已覆盖」）

- **条件已实现**：第五项照 §2.17 表逐字实现（`part === "" ? namesPointer(task_book) : !resolveDeclaredRef(base, part).ok`；预定行不计入）。
- **本面不可达，原因是选行判据**：`resolveBatchRows` 逐字 = 「`const part = filePartOf(r.task_book); return part !== "" && resolveDeclaredRef(base, part).abs === abs`」；`abs` 由 `assertBatchArg` 给出，其逐字 = 「`if (!hit.ok) throw new Error(...)`」+「`return hit.abs`」。两处同 base 同函数 ⇒ 凡进本批行集的行，`resolveDeclaredRef(base, part).ok` 必为 `true` ⇒ 第五类无输入可喂。
- **父侧裁定** = ①「代码照设计原样实现，两处文档口径由我派人改」，并明令「**别为了凑那一格去造一个能让它命中的输入**」。
- 单测 ⑥ 段记的正是这个事实（断言「外来行不进本批行集 ⇒ 仍只有已结清那一类」），标题 = 「四类各一拍命中 … 第五类 `pointer-stale` 在批-账面上结构不可达（读数，附原因）」。

### 量法读数（§2.17 量法块，实施后复跑 · 读数只记本段）

```text
doc_check(report, lines=[12 档]) 实测（越硬限 0 · 越软线 1 · 未越线 11）：
  494  thincoder-core/agent-tools/batch-lifecycle.mjs
  473  thincoder-core/ledger-cmd.mjs
  453  thincoder-core/ledger-write-ops.mjs
  296  thincoder-core/agent-tools/batch-ledger-bind.mjs
  267  thincoder-core/agent-tools/batch.mjs
  230  thincoder-core/agent-tools/batch-closeout.mjs
  160  thincoder-core/ledger.mjs
   47  thincoder-core/ledger-close-proof.mjs
  401  test/integration/batch-gates-reanchor.test.mjs
  170  test/integration/batch-ledger-bind.test.mjs
  347  docs/batches/2026-11-10-p0-2-batch-ledger-atomicity.test.mjs
  541  test/integration/batch-close-gate.test.mjs  · 越 500 软线（主动审视）
```

- 硬限 0 ⇒ 无拆分必需。软线那一档是存量债：本席对它的改动是 18 行原地替换（行数不变），且该档不在 §2.17 受影响文件表内 ⇒ 记在这里，处置归父侧（拆档或把该档纳入量法块）。

### 红侧 / 绿侧读数（改前该失败的那条真失败）

同一组输入在 HEAD 版 worktree（用毕即删，探针不留档）与本仓各跑一次：

```text
[red]   close(no closeEvidence)   => SUCCEEDED                  ← 改前：证据空白照收口
[red]   named row after close     => 待核销                      ← 改前：点名行停在待核销
[red]   batch check               => REFUSED unknown action "check"
[red]   reopen with ledger locked => SUCCEEDED (no rollback)     ← 改前：档已开、行仍待核销
[green] close(no closeEvidence)   => REFUSED … closeEvidence 必填…
[green] named row after close     => 已核销
[green] batch check               => record = closed · rows = 1 · consistent = true
[green] reopen with ledger locked => REFUSED batch: reopen failed — 台账未回收（database is locked）；批档仍为已收口（已回滚），可原样重试。
[green] record status after that  => closed（回滚到已收口）
[green] that row still            => 待核销
```

### 自测与评审

- 随批单测 + 改面集成档一次跑：**50/50 通过**（单测 11 · `batch-close-gate` 12 · `batch-close-token-consume` 4 · `batch-gates-reanchor` 12 · `batch-ledger-bind` 5 · `batch-touched-region-gate` 4 · `batch-anchor-create` · `batch-status-auto-set`）。未跑全量套件（按 §2 口径）。
- 内部 advisor 代码评审：轮次 1 = **changes-required（🔴1 · 🟡4 · 🔵2）**；轮次 2（只验修复声明）= **pass**。逐条处置：🔴1（§5 空）判为父侧/机制项并收口——`assertSectionFiveGate` 两臂要求「§3 状态词 = 评审通过」∧「末块携 pass 裁定」，通过前结构不可修，本段即其残务落地；🟡2（单测标题夸大五类）已改标题为四类 + 第五类不可达；🔵6（记账位次）补三处口径注释（记「落过盘」、回档不回退，不进任何判据）；🔵7（认领事务内复核）补齐「仍解析到 P」一条同源判据。🟡3（预定行在出口面仍读成 `dangling`）· 🟡4（`batch-close-gate.test.mjs` 越 500 软线）· 🟡5（`attach` 失败留半状态，存量）三条归设计席 / 父侧，本席未单方面改设计或改存量。
- **终态 = `clean`（代码面收敛；父侧两项在办）**：§5 已落；`LEDGER.md` §8.1 AC-M2-40 的「五类各一拍命中」口径与 #4 的软线债归父侧/设计席。

### 越界档（不在本 spawn 声明清单内，逐档给理由）

- `thincoder-core/ledger-close-proof.mjs` — §2.17 受影响文件表点名（`filePartOf` 剥标记 + `isReservedPointer`），臂② 与选行判据的共同底座。
- `thincoder-core/ledger.mjs` — 公共导出面（再导出 `batchLedgerConsistency`）。
- `thincoder-core/agent-tools/batch-ledger-bind.mjs` — 设计点名（认领的唯一调用点 + 回执点名）。
- `thincoder-core/tool-docs/batch.md`、`thincoder-core/tool-docs/ledger.md` — 设计点名（模型可见契约同步）。
- `test/integration/batch-ledger-bind.test.mjs`（设计点名的 13-5 落点）· `batch-close-token-consume.test.mjs` · `batch-touched-region-gate.test.mjs` — 后两者是 `close` 新必填格的**调用点**，不改即红（每笔补一格，零语义变）。
- 声明清单里未改的两档：`thincoder-core/agent-tools/batch-skeleton.mjs`（实读无须改）、`test/RTM.md`（索引只有故事号与标题，本批不增故事、不改标题 ⇒ 零改动）。

### 设计档漂移（交设计席 / 父侧，实施席不改设计档）

1. §9「收口一致性批」破行表只点名 14-4 ∥ 14-5 ∥ 14-6，**14-7 也被本批改掉**（收口即结算 ⇒ 「一行待核销 + 一行已核销」两态并存只能在收口之后造，题设必须重起）——实际改了 4 行。
2. 同节 14-11 的断言「`check` 报 `consistent=false`」在**回滚成功**的形里不成立（回滚成功即无半状态，R38 ① 要的正是「档字节 = 写前字节」）。实施按事实写：回滚后 `check` 读 `record = open · consistent = true`；`consistent=false` 的那一拍改由「残态形」（`closed-but-open-rows`）断言，需设计席把 14-11 改成两拍。
3. `LEDGER.md` §8.1 AC-M2-40 的「五类半状态各一拍命中」与实测（四类可命中 + 第五类结构不可达）口径冲突，待设计席改口径或由本段读数承接。

### 修正轮（父侧交办一处 · `attach` 缺本批同一条补偿纪律）

**条目**：`attachBatchRecord` 走 `ledgerBindBatch(…, writeHeader)`。`writeHeader` 先把 `#N` 写进档头，台账事务随后失败时回滚的只有台账，档头留着号。

`attach` 的档是**既有档、删不得** ⇒ `create` 那条 `unlink` 清理在它身上不成立。改前该形只把 SQLite 原文掷出：既不拒，也不点名残态，`batch({action:"check"})` 还把它读成 `consistent = true`。

**修法**（= 本批 A4 写序套到兄弟路径）：写前留全文（函数开头 `src`）⇒ 台账失败 ⇒ 用 `src` 回写档头 ⇒ 抛拒；回写也失败 ⇒ 第二条串。零写的两支不回写。

| # | 父侧三件 | 状态 | 落点 |
|---|---|---|---|
| 1 | 回写用写前那份字节（`src`），不做「把号删掉」的局部手术 | ✅ 已做 | `attachBatchRecord` 的 catch 支 `writeFileSync(abs, src)` |
| 2 | `already === true` 时不回写（那一支本来零写） | ✅ 已做（口径收在 `header.wrote`） | 同一 catch 支首行 `if (!header.wrote) throw e`；`already` 支在 `writeFileSync` 之前 return ⇒ 恒 `wrote = false` ⇒ 同一道门挡住。写前拒（门态 / 同面 / `BEGIN IMMEDIATE` / 档头写本身失败）同样零写，同被这道门挡、原样上抛 |
| 3 | 回写失败不许吞：第二条串点名半状态与出路，两串互不复用 | ✅ 已做 | 新增两个导出 `attachLedgerFailedError`（第一条串）∥ `attachHalfStateError`（第二条串），与既有 `attachClosedError` 等拒串同址 |

**如实记两处边界**

- **第二条串端到端不注入**：单进程内造不出「档头写成功之后、回写失败」的稳定注入（与收口侧 ⑤ 同一处境），故由单测的结构断言取证——两串逐字不同、第二条不复用「可原样重试」也不说「Nothing was written」、且点名残态与出路。**不写成「已覆盖」**。
- **`already` 那一件的实现口径**：判据取 `header.wrote`（本笔是否落过盘）；`already` 支走不到 `writeFileSync`，故恒被它覆盖，未再单列一条冗余条件。

**红侧 / 绿侧读数**（同一探针改前 / 改后在仓内各跑一次；探针用毕即删，不留档）

```text
[red]   error  = injected: 台账提交失败                        ← 改前：原始 SQLite 错，无拒文、无出路
[red]   header = > 台账 = #1 · #2（— · 归批）…                 ← 改前：档头留着 #2
[red]   header 逐字相等 = false
[red]   rows   before 1 行 · after 1 行 · 逐行相等 = true       ← 行随事务回滚（档那一半没回）
[red]   check  = record = open · rows = 1 · consistent = true   ← 半状态在查询面读成「一致」
[green] error  = batch: attach failed — 台账未写（injected: 台账提交失败）；档头已回滚到写前字节，可原样重试。Nothing was written.
[green] header = > 台账 = #1（— · 归批）…  · 逐字相等 = true    ← 档头回到写前字节
[green] rows   before 1 行 · after 1 行 · 逐行相等 = true
[green] check  = record = open · rows = 1 · consistent = true   （这一形仍在五类枚举之外，见 lead 3）
```

**单测与复跑**

- 本批单测 **14/14 通过**（新增三格：主路径注入 ∥ `already` 支注入 ∥ 两条串互不复用）。改面集成档 `test/integration/batch-ledger-bind.test.mjs` **5/5 通过**（`attach` 的唯一调用面，确认零回归）。
- 注入手法：给**本夹具项目**的库档（按键分档）挂 `BEFORE UPDATE ON items WHEN NEW.status='在途'` 触发器——它炸在 `applyRowUpdateTx` 那条 UPDATE 上，正是档头已写之后。
- 「第二连接持写锁」那种手法炸在 `BEGIN IMMEDIATE`，档头还没写，喂不到这一形——两法各瞄一段。
- `already` 那一格用只读档（`chmod 0o444`）：回写一旦发生必当场失败 ⇒「零写」从一句声明变成可证的事实，缺门的修法必红。
- 改前红侧由同一格取证：改前该格红在「第一条串」断言处（`actual = injected: 台账提交失败`），改后全绿。

**越界档**：无（只改本 spawn 声明的两档）。未跑全量套件（按 §2 口径）。**本修正轮未发评审**——父侧口径「不发评审」，故无 advisor 轮次可记。

**Leads（本席未处置，出本笔边界）**

1. `test/` 全目录对 `attach` 零引用（grep `attach` 无命中）⇒ 补挂路径没有集成档；本笔那三格单测在收口即删。
2. `e?.ledgerRollbackFailed` 只在 `batch-ledger-bind.mjs` 的 `create` 支出现一次，而 `ledger-write-ops.mjs` 的失败支逐字为 `try { db.exec("ROLLBACK") } catch { /* 事务未开 / 已结 */ }` ⇒ 该标记**无人置位**，两处「台账回滚失败」分支结构不可达。
3. `batch({action:"check"})` 五类不覆盖「档头留号 ∥ 台账无该行」这一形（五类判「档态 × 行状态」，不读档头行）⇒ 第二串喊出来之后，查询面仍读「一致」。要不要给它第六类，归设计席。

### 追加实施轮（§2 修正轮 4 ∥ 6 ∥ 7 的代码面）

**交付摘要**：六条拒串改为「台账事务未提交」口径；删去 create 的 `ledgerRollbackFailed` 死分支；档头号集只读解析器与写侧同源；一致性面新增 `header-row-missing` 与 `headerRows`，并让 `closed-but-open-rows` 同读 `status` / `trigger`。RTM 与 13-6、14-10～14-12 集成用例同批落地。

| # | 条目 | 状态 | 实证 |
|---|---|---|---|
| 1 | 六条拒串只写代码当场握有的事实 | ✅ 已做 | close ∥ reopen ∥ attach 各两条逐字串；三条回滚成功串带指定 `Ledger:` 尾句，六条均无 `Nothing was written`；create 失败只报未 COMMIT 与档侧实际清理结果 |
| 2 | 删除 `e?.ledgerRollbackFailed` 死分支 | ✅ 已做 | 分支与其文案同删；全仓 `.mjs` 检索该名零命中；create 写后失败有真实注入单测 |
| 3 | 第六类 `header-row-missing` + `headerRows` | ✅ 已做 | `readLedgerHeaderNumbers` 与 `appendLedgerNoToHeader` 共用行定位和号切分；只查 `items` 同号存在性，解绑行不误报；`check` 打印逐号 `inLedger` 与两条出路 |
| 4 | `closed-but-open-rows` 分判 status / trigger；`open-but-settled` 行集非空 | ✅ 已做 | 在途恒命中；等待态仅 trigger 非 `条件` 且非 `认账不排期`（含空值）命中；正常收口与空行集均有绿侧反例 |

**改动文件**（全部在本 spawn 声明清单内；越界档 = 无）：

- 核心查询 = `thincoder-core/ledger-cmd.mjs`。
- 批档工具 = `thincoder-core/agent-tools/batch-skeleton.mjs` · `batch-closeout.mjs` · `batch-reopen.mjs` · `batch-ledger-bind.mjs`。
- 模型可见契约 = `thincoder-core/tool-docs/batch.md`。
- RTM = `test/rtm/batch-ledger.md`。
- 集成 = `test/integration/batch-ledger-bind.test.mjs` · `test/integration/batch-gates-reanchor.test.mjs`。
- 单测 = `docs/batches/2026-11-10-p0-2-batch-ledger-atomicity.test.mjs`。

**红侧先行**：改前先写新断言并运行，旧代码在六条新串、缺 `headerRows` / `header-row-missing`、缺 `rows.trigger`、等待态未分判等路径真失败；不是只改期望后凭空报绿。

```text
[red] node --test docs/batches/2026-11-10-p0-2-batch-ledger-atomicity.test.mjs
      16 例：7 pass · 9 fail
[red] node --test test/integration/batch-ledger-bind.test.mjs
      6 例：5 pass · 1 fail（13-6 缺 headerRows）
[red] node --test test/integration/batch-gates-reanchor.test.mjs
      12 例：9 pass · 3 fail（14-10 / 14-11 / 14-12）
```

**真实双失败注入**：利用既有 `configureBatchSegment({onWrite})` 在档写盘后、台账调用前同步 `chmod 0o444`，同时以第二连接持写锁或 UPDATE 触发器令台账失败。13-6 实跑 attach 第二串并命中第六类；14-11 实跑点名在途、`completed: []` 待重锚、`completed: []` 非空全归档三形；14-12 实跑重开第二串与 `open-but-unwritable`，另覆盖全归档起点的失败回滚。不是手工摆一个残态冒充整链。

**最终验证（未跑全量套件，按交办）**：

```text
node --test docs/batches/2026-11-10-p0-2-batch-ledger-atomicity.test.mjs
  18/18 pass
node --test test/integration/batch-ledger-bind.test.mjs
  6/6 pass
node --test test/integration/batch-gates-reanchor.test.mjs
  12/12 pass
```

**内部 divergence audit**：轮次 1 = divergent（14-11 / 14-12 只模拟残态）；修正后轮次 2 = divergent（attach 双失败、14-10 的 record、全归档失败重开三处测试缺口）；修正后轮次 3 = **clean**。共 2 个修正轮，终态 = **clean**。

**内部 advisor 代码评审**：轮次 1 = pass，非阻断三项（单测软线 + 两个集成档头注范围）；轮次 2 = 两个头注 Fixed、单测仍越线；轮次 3 = 单测软线 Fixed，**pass**。三项均已处置。advisor 回执中的批档 §3 自动写入报 `Batch write failed`，故本段直接记下评审轮次与结果，不声称 §3 已落这些轮次。

**量法复跑**：`doc_check(report, lines=[§2.17 十二档])` = 越硬限 0 · 越软线 0 · 未越线 12；本批单测档 500 内容行，集成两档分别为 489 / 231，`batch-skeleton.mjs` 为 401。绝对读数只留本段。

**doc_check gate**：`DOC-CHECK GATE: PASS`（3 档 = 本批档 ∥ `test/rtm/batch-ledger.md` ∥ `thincoder-core/tool-docs/batch.md`）。

**设计档漂移（报父侧，本席不改设计档）**：§2.17 称 `batch-skeleton.mjs`「已越软线」，但本轮按它指定的同一 `doc_check` 量法读为 401、未越线；该句与当前读数不一致。

## §6 验证与收口（父代理）

## 验证与收口

- **交付面 = A4（半状态可见可恢复）∥ B2（收口即结算）∥ A7（预定批指针）**：写序 = 只读预检 → 档写盘 → 台账单事务 → 失败用写前全文回滚档；收口与重开两条通路同序；`batch({action:"check"})` 只读查询面六类半状态各带出路。
- **父侧读数**：`node --test docs/batches/2026-11-10-p0-2-batch-ledger-atomicity.test.mjs test/integration/batch-ledger-bind.test.mjs test/integration/batch-gates-reanchor.test.mjs` ⇒ **tests 36 · pass 36 · fail 0 · todo 0**。
- **红侧（改前同输入）**：单测 9 项失败、两个集成档分别 1 项与 3 项失败 ⇒ 这些格真在断东西。
- **doc-check 门**：`DOC-CHECK GATE: PASS`。
- **本批新债 2 条，均当轮撤回并就地修**：`#2292`（`attach` 补偿缺口——已修，第六类 `header-row-missing` 已进查询面）∥ `#2293`（`batch-close-gate.test.mjs` 541 行——软线是主动审视不是必须拆，未越硬限 800，本批对它只做 18 笔原地替换、行数不变 ⇒ **不拆**，非债）。
- **暂缓批复核**：无。
- **用户文档面**：无涉。
- **单测档**随收口删除；集成新增 13-6 ∥ 14-10 ∥ 14-11 ∥ 14-12（落 `test/integration/batch-ledger-bind.test.mjs` 与 `batch-gates-reanchor.test.mjs`，编号先落 `test/rtm/batch-ledger.md`）。
- **运行面提示**：本会话进程载的是改前模块 ⇒ 新门（`closeEvidence` 必填 ∥ `[ledger consistency]` 行）须重启后生效。
