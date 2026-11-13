# 2026-11-13 · doc-system-audit
> 六段，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（主 agent）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（实施者：主 agent ∥ coder）· §6 验证与收口（父代理）。
> 每段只有一个作者：作者的段可 `append` 加内容、可就地改（`edit`）；非作者一概拒。
> 编制：主 agent · 2026-11-13 · 来源 = 用户 2026-11-13 要求保存文档体系评估并在 ThinCoder 内修复；随后明确使用台账和批次规则。。
> 台账 = #2377（core · 归批）。前情 = 无（独立批）。
## §1 讨论（主 agent）
**状态行**：已收口 2026-11-13
批起 sha = 8a03f35fffa8f90adccf611cc3d5d575fd5fe034
<§1 模板占位：本批条目 / 关键判据 / 授权口径>

- 2026-11-13：接管同主题台账 #2377；原预定指针未落盘，已先退回旧占用再由本批接管。
- 用户批准范围：在仓内保存评估报告并修复；使用台账与批次规则；历史批档不清理；不补 CLI 47；不改产品代码；不提交 git。
- 当前证据：状态文档 202 份；最大现役文档为 `docs/core/design/TESTING.md`，无千行现役档。问题集中于现役/退役混线、章节失效、关键契约缺失和跨文档冲突。
- 处理原则：不整档回滚、不再次全仓压缩；逐项对照当前代码与文档补回必要契约。

## §2 批次任务与设计（主 agent）
**状态行**：设计完成（按评估证据定点修复，开放业务冲突先裁定）

<§2 模板占位：本批条目（覆盖） / 设计档落点 / 机制设计 / 受影响文件与测试覆盖 / 验收对照 / 关键决策 / 上抛项>

<§2 模板占位：机读清单 = 标题行「**受影响文件（机读清单）**」+ 围栏内三列表（表头 | 档 | 分拆方案 | 行数 |、分隔行 |---|---|---|、一行一档，只列代码档（源 ∥ 单测））；第二列：越设计时线的档写正向形方案（点名带目录段的档 + 本批落步 `实施轮` ∥ `§5`），未越线写 —；第三列：该档在批起快照上的内容行数（量法 = `countContentLines`），快照里没有这一档写 `新`；示例行 = | thincoder-core/agent-tools/batch-tier-gate.mjs | — | 新 |>

### 本批目标态

本批交付评估报告，并修复无业务争议的核心文档问题。评估报告是诊断输入；实际修复设计由本节和各权威文档承担。

1. 报告与地图：报告可从地图到达，并明确其诊断性质。
2. 现役边界：当前台账是工作树外的 SQLite；仓内归属、写权和引用规则由 core 的现有权威文档承接。旧 TODO 明示退役，DOC-MIGRATION 移出设计检索面，LEDGER-SELF-CONTAINED 不再描述 L4/V4 或文件台账。
3. 批档补偿：按 create、attach、close、reopen、supersede 分别记录档先写、台账后写、回滚和 `check` 可读的半状态，具体以当前实现为准。
4. Provider：列出当前可重试状态与网络错误、尝试次数、退避序列、Retry-After 上界和 sleep 中断；这些值从当前代码核实，不自行发明。
5. tester：明确可以创建临时夹具但不得修改实现或断言；`execute/bash` 能写文件，角色约束不是安全沙盒。
6. NORMAL-MODE：删除已失效章节指针和施工时态，只保留当前职责与真实引用。

### 本批范围与后续批次

本批覆盖上述六项。以下内容不取消，按后续批次继续交付：

- 产品端契约：render-core、VSC 协议、Desktop IPC、ACP 和 CLI 数值边界。
- Server 契约：先取得团队记忆、恢复策略和权限边界裁定，再写目标态。
- 发布、测试环境与其余 RTM 引用。
- 跨仓检查和无项目文档门：存在规则选择，另批先裁定再改。

### 最近先例

`docs/core/design/BATCH-RECORD.md`「载体机制」保留生命周期、失败边界和职责而不复制历史；`docs/core/design/LEDGER.md` 保留状态机与核销来源。对齐 = 当前规则、接口、边界和验收；偏离 = 本批新增独立诊断报告，报告不是状态规范。

### 勘察证据

已读 `docs/README.md`「本图只登记当前文档的归属和入口；执行过程由 `batches/` 承载，历史版本由 git 承载。」以及 BATCH-RECORD、LEDGER-SELF-CONTAINED 当前正文。另按 core、产品端、Server、RTM 分板直读并定点对照代码；未读历史批档正文。外部公共文档未查阅；本批只整理仓内现行规则与当前代码，无相关外部来源。

### 边界

- 不清理 `docs/batches/` 历史，不补 CLI 47，不改产品代码，不提交 git。
- 不把代码现状自动当成正确业务规则；涉及产品选择时移到有裁定的后续批次。
- 不用篇幅作为质量判据，不恢复无关历史细节。

**受影响文档**

本批无产品代码或单元测试文件，因此代码档机读清单为空。

| 档 | 分拆方案 | 行数 |
|---|---|---|
| docs/DOC-SYSTEM-ASSESSMENT.md | 新建诊断报告 | 实写 |
| docs/README.md | 登记诊断入口并同步退役边界 | 实写 |
| docs/TODO.md | 标明旧文件台账已退役，指向当前工具面 | 实写 |
| docs/core/design/LEDGER-SELF-CONTAINED.md | 重写为当前仓内归属与写权规则 | 实写 |
| docs/core/design/DOC-MIGRATION.md | 移出当前设计检索面 | 实写 |
| docs/core/design/DOC-SYSTEM.md | 如需调整退役档边界则同步 | 实写 |
| PROJECT-MANIFEST.json | 如需声明归档排除则只改对应索引键 | 实写 |
| docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md | 补回写序与补偿契约 | 实写 |
| docs/core/design/PROVIDER.md | 补回重试状态、次数、退避与中断契约 | 实写 |
| docs/core/requirements/TOOLS.md | 明确 tester 角色纪律非沙盒 | 实写 |
| docs/core/design/AGENT-LOOP-SUBAGENT.md | 同步 tester 边界 | 实写 |
| docs/core/requirements/NORMAL-MODE.md | 修复章节引用和过程措辞 | 实写 |

### 逐项验收

| 项 | 正常与边界 | 失败面 |
|---|---|---|
| 报告与地图 | 地图入口可读到完整诊断；报告不作为当前规范引用 | 报告缺少证据等级或把未验证项写成事实即不通过 |
| 现役边界 | 当前台账、写权和仓内归属只有一个口径；DOC-MIGRATION 不再被设计域检索 | 仍出现「docs/TODO.md 是当前台账」或旧 L4/V4 作为现役规则即不通过 |
| 批档补偿 | 五种操作都能从文档读出写序、失败回滚和恢复入口 | 任一操作只有「按当前规则」而没有可核对语义即不通过 |
| Provider | 文档中的状态集、次数、退避、上界和中断与当前实现逐项一致 | 缺少可重试输入或停止条件即不通过 |
| tester | 正常夹具、禁止改实现、可写文件的非沙盒边界均写明 | 把 tester 描述成机制保证只读即不通过 |
| NORMAL-MODE | 引用能到达当前职责章节，无「现状」「新增节」等施工时态 | 仍指向不存在的章节即不通过 |
| 机械检查 | 所有改动文档执行 `doc_check report` | 任何未处置命中即不通过；该 PASS 不替代上述语义验收 |

本批没有业务可观察结果或协议行为变化，因此没有集成测试用例增量；文档验收由逐项阅读和 `doc_check report` 承担。

## §3 设计评审（评审子代理）
**状态行**：评审通过（第 5 轮复核：三项发现均已解决）



### 轮次 1（评审子代理）

| # | 严重度 | 状态 | 证据 |
|---|---|---|---|
| 1 | 🔴 | 未解决 | `docs/DOC-SYSTEM-ASSESSMENT.md` 文首声明「本文是诊断报告，不是当前产品或机制规范。」；评审范围内另有文档地图，但没有修复目标态设计 |
| 2 | 🔴 | 未解决 | 同档「## 6. 修复优先级」列出六项跨 core、CLI、VSC、Desktop、Server 与 RTM 的优先级，未界定本批修复哪些发现、哪些延期 |
| 3 | 🔴 | 未解决 | 同档「## 7. 验证边界」：「团队记忆真源、快照恢复业务策略和若干 Server 权限边界需要用户或业务负责人裁定。」；A3/A4 也尚未选定冲突规则的权威口径 |
| 4 | 🔴 | 未解决 | 同档「## 6. 修复优先级」仅给出「每批改后运行 `doc_check report`，另做语义与章节复核。」；「## 1. 总体结论」明确该 PASS「不证明章节、引文、语义或产品行为正确」 |

VERDICT: changes-required

计数：🔴 4，🟡 0，🔵 0。

### 轮次 2（评审子代理）

| # | 严重度 | 状态 | 证据 |
|---|---|---|---|
| 1 | 🔴 | Unfixed | `docs/DOC-SYSTEM-ASSESSMENT.md` 文首仍为「本文是诊断报告，不是当前产品或机制规范。」；`docs/README.md` 是文档地图，评审范围中仍没有收窄批次的修复目标态设计。 |
| 2 | 🔴 | Unfixed | `docs/DOC-SYSTEM-ASSESSMENT.md`「修复优先级」仍列出「清理旧台账、迁移档和退役内容的现役／检索边界。」至 Server、RTM 等广泛工作，没有按发现编号界定收窄后的 core 本批范围与延期项。 |
| 3 | 🔴 | Unfixed | `docs/DOC-SYSTEM-ASSESSMENT.md`「修复优先级」仍写「业务选择不明确时请用户裁定。」，A3/A4 的相反规则仍未裁定；「验证边界」仍写「团队记忆真源、快照恢复业务策略和若干 Server 权限边界需要用户或业务负责人裁定。」 |
| 4 | 🔴 | Unfixed | `docs/DOC-SYSTEM-ASSESSMENT.md`「修复优先级」的验收仍仅为「每批改后运行 `doc_check report`，另做语义与章节复核。」；「总体结论」仍明确「`doc_check` 的 PASS 只证明段长、行号锚和文件存在性检查通过，不证明章节、引文、语义或产品行为正确。」，没有逐项正常、边界、失败验收。 |

VERDICT: changes-required

计数：🔴 4（Unfixed 4），🟡 0，🔵 0，New 0。

### 轮次 3（评审子代理）

| # | 严重度 | 状态 | 证据 |
|---|---|---|---|
| 1 | 🟡 | Advisory（不阻断） | §2「勘察证据」记录了仓内文档和代码阅读，但未说明是否勘察公共来源，亦未明确记录无相关公共来源。 |

VERDICT: pass

计数：🔴 0，🟡 1，🔵 0。

### 轮次 4（评审子代理）

> 状态行重置：第 4 轮打回（changes-required）· 上一轮状态行 = 评审通过 → 进行中 · 2026-11-13

| # | 严重度 | 状态 | 证据 |
|---|---|---|---|
| 1 | 🔴 | 未解决 | `BATCH-LEDGER-REVIEW-UNIFY.md` §2.20 总述「需要同时改档和改账时，档先写、台账后写」与 §2.20.1 create 先在事务内 INSERT 待讨论行、再写档，以及 §2.20.2 attach 的同类顺序不一致；§2 验收要求五种操作的写序可核对。 |
| 2 | 🟡 | Advisory（不阻断） | 批档 §5「落笔与边界」记录主 agent 已修改 `PROJECT-MANIFEST.json`，同节「验证与读数」又写「未修改产品代码、测试、manifest 或其他板块文档」，批次总账口径自相矛盾。 |
| 3 | 🟡 | Advisory（不阻断） | 批档 §2 机读清单模板写明「只列代码档（源 ∥ 单测）」，实际表内列入多份纯 Markdown 文档；本批无源码或单测改动，文档分档本应豁免。 |

VERDICT: changes-required

计数：🔴 1，🟡 2，🔵 0。独立复核已对九份实际改动文档执行 `doc_check report`，结果为 PASS；该结果不替代上述语义一致性判断。

### 轮次 5（评审子代理）

| # | 严重度 | 状态 | 证据 |
|---|---|---|---|
| 1 | 🔴 | 已解决 | `BATCH-LEDGER-REVIEW-UNIFY.md` §2.20 总述现写「create/attach 在 SQLite 事务内先准备或插入待讨论行，再写档，随后写行状态与批次指针并提交；close/reopen/supersede 先写档、再改账。」，与 §2.20.1、§2.20.2 及其余操作分述一致。 |
| 2 | 🟡 | 已解决 | 批档 §5「验证与读数」现写「本 coder 未修改产品代码、测试、manifest 或其他板块文档；批次级 manifest 排除由主 agent 完成并已在上面记录。」，与「落笔与边界」的主 agent 修改记录一致。 |
| 3 | 🟡 | 已解决 | 批档 §2 现写「本批无产品代码或单元测试文件，因此代码档机读清单为空。」；后续表以「受影响文档」为标题，仅登记文档改动，不再冒充代码档机读清单。 |

VERDICT: pass

计数：🔴 0（原 1 项已解决），🟡 0（原 2 项已解决），🔵 0。

## §4 用户批准（主 agent）

- 2026-11-13：用户明确「那你继续修吧，不过改thincoder还是使用台账和批次规则，照章办事了。」批准本批保存评估并按上述范围定点修复。

## §5 实施记录（实施者：主 agent ∥ coder）

### 实施记录（coder）

#### 落笔与边界

- 主 agent 已落盘 `docs/DOC-SYSTEM-ASSESSMENT.md` 与 `docs/README.md` 的诊断入口；报告明确是诊断而非当前规范。主 agent 提供的落盘检查结论为 doc_check PASS。
- 主 agent 已将 `docs/core/design/DOC-MIGRATION.md` 加入 `PROJECT-MANIFEST.json` 的 `index.excludePaths`。本 coder 未改 manifest，也未改或删除 DOC-MIGRATION；`DOC-SYSTEM.md` 已有排除键职责说明，无需再改。
- `LEDGER-SELF-CONTAINED.md` 已重写为工作树外 SQLite、项目根归属、仓内文档与批次、主 agent 写权和公共源引用边界；旧文件台账与旧机检施工内容不再出现。
- `docs/TODO.md` 已改为退役说明，指向当前 SQLite 台账、ledger 工具面和 LEDGER 权威契约，不再承载需求池或技术待办条目。
- `BATCH-LEDGER-REVIEW-UNIFY.md` §2.20 已分 create / attach / close / reopen / supersede 写清事务与档面写序、失败回滚、补偿失败半状态、check 读数和恢复入口。
- `PROVIDER.md` §3 已补齐可重试状态、非 AbortError 网络异常、四次缺省尝试、1/2/4 秒普通退避、Retry-After 的 15/30/60 秒回退与 300 秒上界，以及 sleep 中断。
- `TOOLS.md` 与 `AGENT-LOOP-SUBAGENT.md` 已写明 tester 可建临时夹具、不得改实现或断言，execute/bash 可真实写文件，角色纪律不是安全沙盒。
- `NORMAL-MODE.md` 的 AGENT-LOOP 引用已从不存在的 §6.17 改到当前 §10；BATCH-RECORD §4.16 经实读保留。施工时态与迁移来源措辞已删除。

#### 代码对账证据

- 批档写序实读 `batch-ledger-bind.mjs` 的 createBatchRecord / attachBatchRecord、`batch-lifecycle.mjs` 的 statusBatchRecord / closeBatchRecord / ledgerAfterRecordWrite、`batch-closeout.mjs` 的 assertCloseDisposition / checkReceipt、`batch-reopen.mjs` 的 reclaimOnReopen，以及 `batch-supersede.mjs` 的 supersedeBatchRecord。
- Provider 实读 `retry.mjs` 的 requestWithRetry、`rate.mjs` 的 RETRYABLE_STATUS / MAX_RETRIES / RATE_LIMIT_BACKOFF_MS、`errors.mjs` 的 parseRetryAfter / isNonRetryableError、`core.mjs` 的 sleepInterruptible。
- tester 实读 `family-tools.mjs`：角色注释明确 run-only 是角色契约而非沙盒，bash 仍可写；工具装配为基础只读集与 execute/bash。

#### 验证与读数

- 对七份实际改动文档执行 `doc_check report`：`DOC-CHECK GATE: PASS`。这仅是文档机械检查，不是产品测试。
- `doc_search` 初始仍命中 DOC-MIGRATION 的旧索引行。按 `sync-tail.mjs` 的存量排除维护说明，先对 `D:/teamcode` + `thincoder/docs/core/design/DOC-MIGRATION.md` 干跑，确认只涉及一条派生 doc 索引行；再执行 memory sweep --confirm，删除该索引行并生成用户数据目录备份。仓内 DOC-MIGRATION 文件仍在。
- 清理后对同一查询「文档迁移台账 DOC-MIGRATION 已退役」执行 doc_search，结果不再包含 DOC-MIGRATION。
- grep 复核：LEDGER-SELF-CONTAINED 无 docs/TODO.md、L4、V4 或文件台账现役表述；BATCH-LEDGER-REVIEW-UNIFY 无「按当前规则 / 按当前事务 / 按当前补偿」占位；NORMAL-MODE 无 §6.17、现状、新增节、设计轮、承旧等目标残留。
- Markdown 的 lint full 调用返回只支持 JS/TS 语法检查，因此未把它记为 lint 通过；本批验证由语义复读、grep、doc_search 与 doc_check 承担。
- 本 coder 未修改产品代码、测试、manifest 或其他板块文档；批次级 manifest 排除由主 agent 完成并已在上面记录。未运行产品测试；本批没有产品行为变化。

- 收口复核修复：`BATCH-LEDGER-REVIEW-UNIFY.md` §2.20 总述区分 create/attach 的事务内预备行与 close/reopen/supersede 的档先写；§5 区分 coder 与批次级 manifest 改动；§2 将受影响文档与空代码机读清单分开。
- 独立复核 #21 已确认三项发现全部解决。

## §6 验证与收口（父代理）

- 主 agent 逐份复读全部 core 交付；报告与地图、旧 TODO、SQLite 自持、批档补偿、Provider、tester、NORMAL-MODE 均符合 §2 本批验收。
- 九份改动状态文档 `doc_check report` 全量 PASS；修复后 BATCH-LEDGER-REVIEW-UNIFY 单独复跑 PASS。
- `DOC-MIGRATION.md` 保留在盘且被 manifest 排除；同一 doc_search 查询不再命中。派生索引清理有用户数据目录备份。
- 独立复核 #18 的三项发现已修复，#21 全部通过；无未解决红项。
- 本批无新债。未运行产品测试或真机验收；没有产品行为变化，不声明行为测试通过。
