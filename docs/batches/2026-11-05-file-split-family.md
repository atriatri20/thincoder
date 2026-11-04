# 2026-11-05 · file-split-family
> 六段，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 每段只有一个作者：作者的段可 `append` 加内容、可就地改（`edit`，§4.19）；非作者一概拒。
> 编制：主 agent · 2026-11-05 · 来源 = 用户 2026-11-05 05:05「都开吧」——授权把台账并出的族行逐族开批。本族 = 拆档族 `#2067`（五档越 500 软线）。。
> 台账 = #2067（core · 归批）。前情 = 无（独立批）。
## §1 讨论（主 agent）
**状态行**：🔄 进行中（…）
<§1 模板占位：本批条目 / 关键判据 / 授权口径>

## 已定决定

- **已定决定**：五档一次搬完，不按档分五次开工。 · 用户原话：「都开吧。」 · 时间：2026-11-05 05:05

**覆盖账 = #2067 · #1922 · #1996 · #1999 · #2003 · #2050**

（父侧自注：本行 2026-11-05 05:26 按 `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` §2.4 的定形重写——本档行首、其余按行号升序、单行无注释。原写法把五个并入行放在括注里、用 `∥` 分隔且不升序，账目核对拿它跑不起来。）

## 本批要做的事（父侧实测，2026-11-05）

五档越 500 软线、未越 800 硬限。**行数必须在实施轮重新量**，下表是父侧读数，量法 = `read` 末行号：

| 档 | 父侧读 | 切法（具名即搬） |
|---|---|---|
| `thincoder-core/agent-tools/batch.mjs` | 541 | 执行面外移 `batch-record-write.mjs`（`appendBatchRecord` ∥ `editBatchRecord` + 共用六助手 + 四条 §3 拒串），留工具面 `batchTool` + 注入缝 |
| `thincoder-core/agent-tools/batch-skeleton.mjs` | 509 | 常量与纯判定 / action 分发与 schema |
| `thincoder-core/agent/write-gate.mjs` | 515 | 写锁段搬 `write-gate-ledger.mjs`（`ledgerRowAt` ∥ 拒文组装 ∥ `resolveDeclaredRoot` ∥ `ledgerGateTargets`），原档改 re-export，`ledgerBindWriteConflict` 导出名与调用面零变 |
| `thincoder-cli/src/acp/bridge.mjs` | ≈503 | `absOf` ∥ `editSingle` ∥ `editBatch` 抽同目录兄弟档 |
| `thincoder-core/agent-tools/ssh-transport.mjs` | 556 | 可见文本面（剥离 + 遮蔽归一）迁 `ssh-text.mjs` |

## 为什么这么切（设计席要落进 §2 的判据）

1. **纯搬家、行为零变**：搬完的唯一判据是「导出名与调用面不变 + 全量集成绿」，不是「代码更好看」。所以本批**不夹带任何判据改动**——混进来就分不清是搬家错还是新判据错。
2. **一次搬完而不分五次**：五档共用同一条判据（越 500 ⇒ 主动拆分评审），分五次就重读五遍；且每开一次批都要走一遍设计 ∥ 评审 ∥ 批准，固定成本压在同一个数上。
3. **搬完重测**：任一档仍越 500 ⇒ 记录一条「为什么没搬干净」，不硬凑。

## 边界（设计席不得越出）

- **不改行为**：不改任何判据、任何拒文、任何导出签名。
- **不动 `docs/**`**：本批是代码面搬档，文档侧的引用改指若需要，另开一笔（同批可做，但要在 §2 单列，不许夹在搬家清单里）。
- **不拆未越线的档**：只动上表五档。

## 设计席要产出

§2 的**逐档动作表**（动作 / 落点 / 期望结果 / 为什么），以及每档搬完的**验收读数**（行数 + 导入面不变 + 该面测试绿）。别复述本节的切法，把它落成可执行的行。

## 评审轮 1 的裁定（父侧 · 2026-11-05 05:18）

结论 `changes-required`（🔴 3 · 🟡 11 · 🔵 2）。**16 条全收**；第 2 条父侧当场量过，见下。

### 父侧实测（先钉事实，再裁）

`glob thincoder-core/agent/{write-gate-ledger,batch-verdict,batch-record-write,batch-segment-vocab}.mjs` ⇒ **零命中**。

⇒ **四个新档一个都不在盘。**设计把它们列进「新建（5）」**是对的**；错的是 `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` 里那两句**现在时**的话（「判据体 = `thincoder-core/agent/write-gate-ledger.mjs` 的 `ledgerRowAt`」∥「实现住 `thincoder-core/agent/write-gate-ledger.mjs`，原档 re-export」）——**它们描述的是一个还没发生的状态。**

### 三条 🔴 的处置

| # | 裁定 |
|---|---|
| 1 · E2 与登记拆法相抵 | **必须归一。**二选一：① 按登记的切法（`batch-verdict.mjs` + 十一件导出整体迁出）；② 保留设计的切法，但**在 §2 写明为什么不用登记那个**（前提是对它做过三问答），**并在同一批改掉登记行**——否则那份档会长期挂着一个代码永远不会有的落点名 |
| 2 · `write-gate-ledger.mjs` 创建 vs 扩展 | **事实已钉：不存在 ⇒ 是新建。**但 W2 的射程要**扩到那两句现在时的话**：把「实现住…」改成「待建（本批 E3）」或等价形。判据 = 该档扫这两个句子零命中 |
| 3 · 新分支无场景 | **删掉那个抛分支。**理由：唯一调用方 `buildAcpCallbacks` 恒给这套注入，**没有一条真实调用路径能走到「缺参」**；而加入它要连带一个新拒文与一个测试面，而 §2.8 已写「不改任何判据、拒文」。若设计席确知存在能走到缺参的调用路径，**给复现路径再加回来**——给不出就删 |

### 其余 13 条

- **#4 身份判据射程**：改成「每个搬走的**导出名**」；E4 另给一条自己的机检（`bridge.mjs` 仍导出 `buildAcpCallbacks`、不再定义那三个闭包 + 点名 ACP 面用例档）。
- **#5 验收可跑性**：把 `git diff --stat` 换掉——**理由我原来写错了**：本工作区**是** git 仓（`.git` 在盘、`git status --short` 有输出），真因是**工作树里同时躺着别的批的文档改动**，`--stat` 分不出本批只动哪十档。导出名逐字列出、写明哪几个经 re-export。（父侧 2026-11-05 05:31 更正：原句写「不是 git 仓」，采信了评审转述的上下文、没自己跑一次。）
- **#6 档位结论**：按判据重写成「哪几档越档 + 逐档拆分目标与拆后预期读数 + 无一档触 800 硬限」，删「故无拆分计划可给」。
- **#7 最近先例** ∥ **#8 勘察证据**：各补一行。
- **#9 三问答**：五个新档名各给一条；`batch-verdict.mjs` 那条要写清「不用它」的理由（与 #1 同一件事）。
- **#10 ∥ #11 具名与签名**：常量逐个列名；工厂签名一行写全（含 `pathOf`）。
- **#12 覆盖账形**：按 `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` 的定形重写（本档行首、其余升序、单行无注释），并在 §1 记一行「五行并入 `#2067`」的证据指针。
- **#13 CLI-DEBT 那行**：现读列去掉「改前」，拆分列改成「在途」态，实施轮再落实测读数。
- **#14 §2.8.1 登记面**：读那一节，把核内四档的拆单记录落进去（本批做），或在 §2 点名由哪一行承接。
- **#15 ∥ #16 读数**：各标量法与日期；RTM 那条把读法写进 §2.10。

**边界**：只落 16 条；不动「纯搬家、行为零变」这个方向。

## §2 批次任务与设计（eng-designer）
**状态行**：设计完成（五档逐档动作表 + 三件读数判据；W1 ∥ W2 ∥ W3 文档侧改指已落）
<§2 模板占位：本批条目（覆盖） / 设计档落点 / 机制设计 / 受影响文件与测试覆盖 / 验收对照 / 关键决策 / 上抛项>

### 2.1 本批覆盖（一档一行）

量法 = `node` 读全文按 `\n` 计行（`readFileSync(p,'utf8').split('\n').length`，末行换行计一行）；读数日 = **2026-11-05**，本席当场复量，下表数值即该次读数（`bridge.mjs` = 501，父侧 503 为估读）。

| # | 条目（覆盖） | 判据源 | 现读（2026-11-05 本席实测） |
|---|---|---|---|
| E1 | 拆 `thincoder-core/agent-tools/batch.mjs` | 越 500 软线 | 541 |
| E2 | 拆 `thincoder-core/agent-tools/batch-skeleton.mjs` | 同上 | 509 |
| E3 | 拆 `thincoder-core/agent/write-gate.mjs` | 同上 | 515 |
| E4 | 拆 `thincoder-cli/src/acp/bridge.mjs` | 同上 | 501 |
| E5 | 拆 `thincoder-core/agent-tools/ssh-transport.mjs` | 同上 | 556 |
| E6 | 导入面零变（五档既有导出名与其调用点逐字不变） | 本批判据 | 见 §2.5 |
| E7 | 文档侧改指（拆分后指针仍解析） | 见 §2.12 | 见 §2.12 |

判据源逐字：依据 `thincoder-cli/AGENTS.md`「single `.mjs` / `.js` source file exceeding 500 lines → advisory」。
数值单源：依据 `docs/core/design/DOC-DISCIPLINE.md` §3.10「软线 = 500 · 硬限 = 800（数值单源 = 工作区根 `AGENTS.md`）」——本批不另写一套数。

**覆盖账（定形）**：`覆盖账 = #2067 · #1922 · #1996 · #1999 · #2003 · #2050`

= 本档行行首、其余升序、单行无注释。后五条即并入 `#2067` 的原行（`#1922` ∥ `#1996` ∥ `#1999` ∥ `#2003` ∥ `#2050`，现态均 `已废弃`）。
「越 500 ⇒ 主动拆分」的成文位置 = 产品约定（上引句）与各面档位登记册，需求层无单项条目——不阻塞本批（判据句逐字在盘、机检可比），登记为 §2.11 的 U1。

### 2.2 逐档动作表（动作 / 落点 / 期望结果 / 为什么）

**统一动作形**：具名符号整块搬家（不重写体、不改名）→ 原档 `import` 回来并**原样 re-export**——调用点零改，这是本批「行为零变」的机械保证。

**E1 `batch.mjs`（541）**

| 面 | 内容 |
|---|---|
| 动作 | 执行面外移，工具面留原档 |
| 落点 | 新档 `thincoder-core/agent-tools/batch-record-write.mjs` |
| 搬走（具名） | 执行体 `appendBatchRecord` · `editBatchRecord`；注入缝 `injectedOnWrite` · `configureBatchSegment` · `resetBatchSegment`（缝与执行面同住，D3）；共用助手 `segmentNumber` · `allowedSegment` · `noSegmentError` · `sanitizeText` · `insertIntoSection` · `sectionBodySpan` · `statusLineSpans`；`sanitizeText` 的私有件 `CRED_RE` · `CRED_TEST_RE` · `MAX_TEXT_CHARS`（D7）；八条拒串 `SECTION3_VERDICT_GAP_ERROR` · `FROZEN_RECORD_ERROR` · `UNRESOLVED_STATUS_ERROR` · `missingSectionError` · `SKELETON_GUARD_ERROR` · `EDIT_STATUS_LINE_ERROR` · `EDIT_BLANK_ANCHOR_ERROR` · `EDIT_NO_TEXT_ERROR` |
| 留下 | `batchTool`（schema + 分发）· `batchDocForReview` · 既有 import 面 · 原档一行 `export { SEGMENT_BY_ROLE, batchDocBases, resolveBatchDocPath }` 零改 |
| 导出面（8 名 · 6 条语句） | `SEGMENT_BY_ROLE` · `batchDocBases` · `resolveBatchDocPath` · `MAX_TEXT_CHARS` · `configureBatchSegment` · `resetBatchSegment` · `batchDocForReview` · `batchTool`——逐字仍在；经新档 re-export 的 3 个 = `MAX_TEXT_CHARS` · `configureBatchSegment` · `resetBatchSegment` |
| 期望结果 | 两档各 < 500（新档 ≈360、原档 ≈190） |
| 为什么 | 工具面 = 模型可见的 schema 与分发；执行面 = 逐 action 的读写与门。改 schema 不该翻过 300 行执行体 |

**E2 `batch-skeleton.mjs`（509）**

§1 的切法写「常量与纯判定 ∥ action 分发与 schema」——本档**没有** action 分发与 schema（那是 `batch.mjs` 的 `batchTool`）。按档内实际两个读者面切（理由见 D2）：

| 面 | 内容 |
|---|---|
| 动作 | 词表 / 段白名单 / 状态行读写面外移 |
| 落点 | 新档 `thincoder-core/agent-tools/batch-segment-vocab.mjs` |
| 搬走（具名） | `STATUS_WORDS` · `STATUS_WORD_ALIASES` · `SEGMENT_BY_ROLE` · `SEGMENT_BY_ROLE_NORMAL` · `DEPTH0_SEGMENTS` · `STATUS_LINE_RE` · `SECTION_1_HEADER_RE` · `sectionHeaderRe` · `isBatchRecord` · `TEMPLATE_PLACEHOLDERS` · `HEADER_STRUCTURAL_RE` · `findPlaceholderResidue` · `placeholderResidueError` · `readBatchStatusLine` · `updateSectionStatusLine` · `readSectionStatusWord` |
| 留下 | 裁定锚 `_V_PRE` / `_V_SUF` / `VERDICT_CHANGES_LINE` / `VERDICT_PASS_LINE` / `verdictGapOf`（签发面与 §5 门同读）· 轮次块 `ROUND_HEADING_RE` / `countRoundBlocks` / `lastRoundBlock` / `nextRoundNumber` · `statusResetPlan` / `statusPassPlan` · `INAPPLICABLE_SEGMENTS` / `sectionBodyLines` / `sectionHeaderZoneLines` / `sectionContentState` / `inapplicableDeclarationError` / `malformedInapplicableLine` / `sectionHasStatusLine` · `batchSkeleton` |
| 导入方向 | 单向：原档 import 新档，新档不 import 原档；原档 re-export 搬走的 16 件里的 **14 个导出名** ⇒ §2.3 ② 列的 10 个 `.mjs` 消费者 import 行零改（其中 `advisor.mjs` 只取留下的 `countRoundBlocks`、`batch-ledger-bind.mjs` 只取留下的 `batchSkeleton`，两个本就不受影响，同列以免漏检） |
| 期望结果 | 新档 ≈200、原档 ≈300，均 < 500 |
| 为什么 | 前者是「谁是写者、能写哪段、状态词有哪些」的单源；后者是「这轮写了什么、合不合骨架」 |

**为什么不用既有登记里的拆法（`batch-verdict.mjs`）**——两条既有切法都落不到本档的实际读者面，逐条判过：

- **既有件答案 = `existing but unusable`**：坐标 = `thincoder-core/agent-tools/batch-skeleton.mjs` 的裁定锚族（`verdictGapOf` · `VERDICT_PASS_LINE` · `lastRoundBlock` 等十一件）。
  失败在**契约面**：这些锚与 `batchSkeleton` / `sectionContentState` 共用 `sectionBodyLines` / `sectionHeaderZoneLines` 两个段解析件，单独迁出要么复制一份段解析、要么再开一个导出面。
- **本批搬的是零依赖叶块**：`batch-segment-vocab.mjs` 只装词表、正则与段头读写，不依赖裁定锚；原档保裁定锚与段解析，无环、无第二份解析。
- **登记行同批收正（W3）**：`docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` §3 该行的拆分落点随本表对齐——不留两份不同的拆法。

**E3 `write-gate.mjs`（515）**

| 面 | 内容 |
|---|---|
| 动作 | 台账写锁段整体外移 |
| 落点 | 新档 `thincoder-core/agent/write-gate-ledger.mjs` |
| 搬走（导出 1） | `ledgerBindWriteConflict`——名字、参数表、返回值、拒文逐字不变；原档 re-export，`dispatch.mjs` 挂点零改 |
| 搬走（常量 6） | `LEDGER_ENTRY_TOOLS` · `MANIFEST_WRITE_ACTIONS` · `MEMORY_WRITE_ACTIONS` · `MEMORY_PROJECT_LAYER` · `MEMORY_PROJECT_UID_PREFIX` · `IN_FLIGHT_STATUS` |
| 搬走（拒文与回执件 13） | `LEDGER_PARAM_SENTENCE` · `LEDGER_HANG_STEPS` · `LEDGER_LIST_LIMIT` · `CASE_NO_NUMBER` · `CASE_NO_PROJECT` · `CASE_UNREADABLE` · `LIST_UNKNOWN_NO_PROJECT` · `LIST_UNKNOWN_NOT_A_PROJECT` · `LIST_UNKNOWN_TARGET_NOT_A_PROJECT` · `caseNotRowNumber` · `caseNoSuchRow` · `caseNotInFlight` · `caseNotAProject` |
| 搬走（组装与判定 9） | `ledgerInFlightList` · `ledgerRefusal` · `ledgerNoProjectRefusal` · `ledgerUnreadableRefusal` · `ledgerRowRefusal` · `parseLedgerNo` · `ledgerRowsOf` · `ledgerRowAt` · `resolveDeclaredRoot` |
| 搬走（比较键与目标面 5） | `gateKey` · `underKey` · `ledgerGateTargets` · `ledgerGateApplies` · `memoryTargetsProjectLayer` |
| 留下 | 文档面与写盘面 `resolveReviewTargetPaths` / `freezeWindowConflict` / `batchRecordWriteConflict` / `batchGateBasesMemo` / `memoizedBatchBases` / `underBase` / `isOwnBatchCompanion` · `export { normAbs }` · `export { REVIEW_ROOT_KEYS, resolveReviewRootsFor }` |
| 导入方向 | 单向：原档 import 新档（`gateKey` 随台账段搬走，原档的 `underBase` / `isOwnBatchCompanion` 从新档取回）⇒ 无环 |
| 导出面 | `ledgerBindWriteConflict` 的名字、参数表、返回值、拒文逐字不变——原档 re-export，`dispatch.mjs` 挂点零改 |
| 期望结果 | 新档 ≈320、原档 ≈200，均 < 500 |
| 为什么 | 笔-账绑定（读 manifest + 台账库，异步 IO 重）与文档面 / 写盘面判定（只看路径集，同步）是两道并列门；同档混住时改任一道都要趟过对方 300 行 |

**E4 `bridge.mjs`（501）**

| 面 | 内容 |
|---|---|
| 动作 | IDE 缓冲编辑面外移为**工厂**（三个符号是 `buildAcpCallbacks` 内闭包，不能裸搬） |
| 落点 | 新档 `thincoder-cli/src/acp/buffered-edit.mjs` |
| 搬走（具名） | `absOf` · `editSingle` · `editBatch`（三者是 `buildAcpCallbacks` 体内闭包，D5） |
| 工厂签名（一行写全） | `makeBufferedEditFace({ agent, readBuffer, writeBuffer, pathOf })` → `{ absOf, editSingle, editBatch }` |
| 注入项 | `agent`（取 cwd）· `readBuffer` · `writeBuffer` · `pathOf`——四者同为 `buildAcpCallbacks` 体内 `const` 闭包（前两者包 `request` 与 sessionId，`pathOf` 取 `args.path ?? args.filePath`） |
| 缺参处置 | **不设缺参分支**：唯一调用方 `buildAcpCallbacks` 在定义这四个闭包的同一作用域内调工厂，四个实参恒在；走不到的抛错支会连带一个拒文与一格测试面，删。 |
| 留下 | `buildAcpCallbacks` 本体（会话回调、权限、事件面）· `replayHistory` · `inferToolKind` / `PERMISSION_OPTIONS` / `permissionToBoolean` / `subagentMetaPayload` |
| 导入方向 | 单向：原档 import 工厂，新档不 import 原档 |
| 期望结果 | 新档 ≈180、原档 ≈330，均 < 500 |
| 为什么 | 这三个符号是「读缓冲 → 行号锚护栏 → 纯函数判定 → 写回 → 记账」一条独立链，判据与回执自持；工厂只注入 IO 缝，链体逐字搬家 |

**E5 `ssh-transport.mjs`（556）**

| 面 | 内容 |
|---|---|
| 动作 | 可见文本面（剥离 ∥ 遮蔽 ∥ 归一）外移 |
| 落点 | 新档 `thincoder-core/agent-tools/ssh-text.mjs` |
| 搬走（具名 7） | `createStripper` · `normalizeText` · `createMask` · `flushEscapes` · `escapeNote` · `INVISIBLE_SPLIT` · `MASK_SEG_MIN` |
| `flushEscapes` / `escapeNote` 随搬的依据 | 两者只读 `entry` 的剥离残态（`entry.escDropped` 与尾部半条序列），与 `createStripper` 同一个状态机；体逐字、字段名零改，原档 import 回来在收场与硬超时两处照旧调用 |
| 留下 | 常量（`SSH_*` / `SECRET_ENV` / `BUF_KEEP_CHARS`）· 测试缝 · askpass 链 `writeAskpassWrapper` / `unlinkAskpass` / `buildSshEnv` / `buildSshArgs` · 子进程 `attachChild` / `spawnSession` · 四门 `markerHit` / `promptHit` / `waitSettled` / `settleNote` · 输出帽 `capWindow` / `alignHead` / `windowMarker` · `drain` / `backfill` / `statusLine` / `bodyText` / `classifyFailure` / `failureText` |
| 导入方向 | 单向：原档 import 新档并 re-export 搬走的导出名；`ssh-session.mjs` / `ssh-transfer.mjs` / `ssh-vault.mjs` 的 import 行零改 |
| 期望结果 | 新档 ≈160、原档 ≈410，均 < 500（搬走块合计 148 行 = `// ─── 终端噪声` 横幅至 `createStripper` 收尾 + `normalizeText` + `// ─── 遮蔽` 横幅至 `createMask` 收尾 + `flushEscapes` + `escapeNote`；新档另加档头与 import ≈12 行） |
| 为什么 | 剥离与遮蔽是「字节 → 可见文本」的纯函数链，不含子进程与计时；传输面其余部分全是进程与等待 |

### 2.3 导入面不变的机械判据（三件读数）

1. **行数**：`node -e` 逐档 `content.split('\n').length`；判据 = 十档（五原档 + 五新档）全 < 500。任一档 ≥500 ⇒ 不硬凑，按 §1「记录一条为什么没搬干净」落 §5。
2. **导入面零变**（三条，逐条可跑）。本工作区**是** git 仓（`.git` 在盘、`git status` 可跑），但工作树同时带着他批的文档改动，`git diff --stat` 判不出「只动这十档」，故改用直读式：
   - `node --check` 十档逐一过（语法面）。
   - `grep -n "ledgerBindWriteConflict" thincoder-core/agent/dispatch.mjs` 的命中行逐字不变。
   - 消费面 import 行逐字不变（清单按实测命中集列全，不手挑）：
     - `batch-skeleton.mjs` 的 10 个 `.mjs` 消费者 = `batch.mjs` · `batch-lifecycle.mjs` · `batch-read.mjs` · `batch-reopen.mjs` · `batch-gate.mjs` · `batch-closeout.mjs` · `design-token.mjs` · `advisor.mjs` · `batch-ledger-bind.mjs` · `ledger-close-proof.mjs`（前 8 个各取至少一个搬走的导出名；`advisor.mjs` 只取留下的 `countRoundBlocks`、`batch-ledger-bind.mjs` 只取留下的 `batchSkeleton`）。
     - `ssh-transport.mjs` 的 `ssh-session.mjs` / `ssh-transfer.mjs` / `ssh-vault.mjs`。
     - `write-gate.mjs` 的 `dispatch.mjs`（挂点行，见上一条）。
     - `acp/bridge.mjs` 的 `session.mjs`（`buildAcpCallbacks`）/ `handlers-slots.mjs`（`replayHistory`）。
   - 上列每个消费者档在搬后跑一次 `import()`（`node -e "await import('<档>'); console.log('ok')"`），逐个打 `ok` 即判「导入面解析不变」。
3. **该面测试绿**：本批单测档逐档跑（见 §2.6）；集成半幅 = 父侧收口门（§1「全量集成绿」的落地形，理由见 D6）。

### 2.4 受影响文件清单（完整）+ 档位结论

改动（5）：`thincoder-core/agent-tools/batch.mjs` · `thincoder-core/agent-tools/batch-skeleton.mjs` · `thincoder-core/agent/write-gate.mjs` · `thincoder-cli/src/acp/bridge.mjs` · `thincoder-core/agent-tools/ssh-transport.mjs`。

新建（5）：`thincoder-core/agent-tools/batch-record-write.mjs` · `thincoder-core/agent-tools/batch-segment-vocab.mjs` · `thincoder-core/agent/write-gate-ledger.mjs` · `thincoder-cli/src/acp/buffered-edit.mjs` · `thincoder-core/agent-tools/ssh-text.mjs`。

文档侧（单列，不在上列）：`docs/cli/design/CLI-DEBT.md` · `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md`（见 §2.12）。

**档位结论（2026-11-05 本席实量，量法与日期同 §2.1）**：

- **越 500 软线的 = 五档**：`batch.mjs` 541 · `batch-skeleton.mjs` 509 · `write-gate.mjs` 515 · `bridge.mjs` 501 · `ssh-transport.mjs` 556。
- **触 800 硬限的 = 零档**（最高 556，余 244）⇒ 无豁免通道被触发。
- **逐档拆分目标与拆后预期读数**：

| 档 | 现读 | 拆分目标 | 拆后预期（原档 ∥ 新档） |
|---|---|---|---|
| `batch.mjs` | 541 | `batch-record-write.mjs` | ≈190 ∥ ≈360 |
| `batch-skeleton.mjs` | 509 | `batch-segment-vocab.mjs` | ≈300 ∥ ≈200 |
| `write-gate.mjs` | 515 | `write-gate-ledger.mjs` | ≈200 ∥ ≈320 |
| `bridge.mjs` | 501 | `buffered-edit.mjs` | ≈330 ∥ ≈180 |
| `ssh-transport.mjs` | 556 | `ssh-text.mjs` | ≈410 ∥ ≈160 |

- **无一档跨档（tier）**：五档与五个新档全在同一层（源码档），无对外契约、无 API 面、无部署面、无数据面改动 ⇒ 档位义务只有上表那五个拆分目标，无「跨档另附方案」的额外项。

**五个新档的三问答（新建前的既有件答案）**：

| 新档 | 答案 |
|---|---|
| `batch-record-write.mjs` | `existing but unusable`：坐标 = `thincoder-core/agent-tools/batch.mjs` 的 `appendBatchRecord` / `editBatchRecord`，名已在、消费者是 `batchTool` 的分发；失败在**位置**（同档 541 行、工具面与执行面混住）⇒ 整块迁出、名零改 |
| `batch-segment-vocab.mjs` | `existing but unusable`：坐标 = `batch-skeleton.mjs` 的 `STATUS_WORDS` / `SEGMENT_BY_ROLE` / `readSectionStatusWord` 一族，消费者是签发面与收口面；失败在**位置**（与裁定锚同档 509 行）⇒ 叶块迁出、名零改 |
| `write-gate-ledger.mjs` | `none found`：台账写锁的判据体与拒文组装现住 `thincoder-core/agent/write-gate.mjs` 模块内、不导出；查过 `thincoder-core/agent/` 与 `thincoder-core/ledger-*` 无现成承载档 |
| `buffered-edit.mjs` | `existing but unusable`：坐标 = `thincoder-cli/src/acp/bridge.mjs` 的 `absOf` / `editSingle` / `editBatch`，是 `buildAcpCallbacks` 体内闭包、依赖四个 IO 闭包；失败在**契约面**（闭包无法裸搬）⇒ 工厂形外移 |
| `ssh-text.mjs` | `none found`：剥离 / 遮蔽 / 归一现居 `thincoder-core/agent-tools/ssh-transport.mjs`（556 行）；同目录 `ssh-session.mjs` / `ssh-transfer.mjs` / `ssh-vault.mjs` 各管会话 / 传输 / 密钥，无承载文本面的档 |

**最近先例**：同目录 `batch-lifecycle.mjs` 的拆档——已拆成三件（`batch-ledger-bind.mjs` ∥ `batch-closeout.mjs` ∥ `batch-reopen.mjs`），原档留生命周期判据并再出口。档位结论见 `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` §3。

（父侧 06:02 改写本条：原写法逐字引该档 §3 的行数读数，而小形漂移批已把那列整列删掉 ⇒ 引文失效，连带卡住同轮其他批档的写门。见台账 `#2075`。）

**对齐** = 具名符号整块外移 + 原档 re-export、导出面零变、拆后复量。

**偏离** = E4 三件是闭包，走工厂注入（D5）而非裸搬；E1 顺带把 `sanitizeText` 的私有件带走（先例那批只动导出面）。

**勘察证据**：

- **仓外声明源**：`PROJECT-MANIFEST.json` 的 `index.publicRepos` = `[]`（2026-11-05 本席 `manifest read` 实读）⇒ 无仓外声明源可查（照记）。
- **仓内设计层已读**：`docs/cli/design/CLI-DEBT.md`（§1 收录口径四点 · §2.2 表 B）· `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md`（§2.3 写锁 · §3 档位表 · §4 决策 28–43）· `docs/core/design/DOC-DISCIPLINE.md` §3.10（尺寸档数值单源）· `docs/core/design/CORE-UNIFICATION.md` §2.5（核内档位现落点）。
- **源码面已读**：五档的 `export` 面与具名符号逐个实读（行数见 §2.1、符号面见 §2.2 各行）；`bridge.mjs` 的闭包作用域实读——`readBuffer` / `writeBuffer` / `pathOf` / `absOf` / `editSingle` / `editBatch` 六者同在一个 `buildAcpCallbacks` 体内。

### 2.5 验收对照（每条 → 机检）

| 条目 | 机检（命令 + 期望读数） |
|---|---|
| E1–E5 | `node -e` 计行：十档各 < 500；读数写进 §5 |
| E6 · 导出名仍在 | 逐名从**原档**取到，且与从新档取的**同一引用**：`batch.mjs` 8 名（`SEGMENT_BY_ROLE` · `batchDocBases` · `resolveBatchDocPath` · `MAX_TEXT_CHARS` · `configureBatchSegment` · `resetBatchSegment` · `batchDocForReview` · `batchTool`）· `batch-skeleton.mjs` 14 名（清单 = §2.2 E2 行 16 件里的**导出名**；`SECTION_1_HEADER_RE` ∥ `HEADER_STRUCTURAL_RE` 是模块内部 `const`，随搬但不导出、不 re-export）· `write-gate.mjs` 7 名（6 条语句：`normAbs` · `REVIEW_ROOT_KEYS` · `resolveReviewRootsFor` · `resolveReviewTargetPaths` · `freezeWindowConflict` · `batchRecordWriteConflict` · `ledgerBindWriteConflict`）· `ssh-transport.mjs` 7 名（清单 = §2.2 E5 行）。**经新档 re-export 回原档的导出名 = 23 名** = E1 三（`MAX_TEXT_CHARS` · `configureBatchSegment` · `resetBatchSegment`）+ E3 一（`ledgerBindWriteConflict`）+ E5 五（`createStripper` · `normalizeText` · `createMask` · `flushEscapes` · `escapeNote`）+ E2 十四（`SEGMENT_BY_ROLE` 亦在 `batch.mjs` 的 8 名内：`batch.mjs` 转出的正是 `batch-skeleton.mjs` 给的引用，按档计一次、落在 E2 这 14 里） |
| E6 · 调用面零变 | §2.3 ② 的三条（`node --check` 十档 · `dispatch.mjs` 挂点命中行逐字不变 · 消费面 import 行逐字不变） |
| E4 自有判据 | `grep -c "^export function buildAcpCallbacks" thincoder-cli/src/acp/bridge.mjs` = 1 ∧ 该档 `grep -c "const editSingle\|const editBatch\|const absOf"` = 0；ACP 面用例档逐档跑绿——档集 = `grep -l "acp/bridge.mjs\|buildAcpCallbacks" thincoder-cli/test` 的命中档（不预设档名） |
| E6 · 跑起来绿 | `node --test docs/batches/2026-11-05-file-split-family.test.mjs` 全绿 |
| E7 | `doc_check({mode:"report"})` 对改动设计档锚类零命中；`docs/cli/design/CLI-DEBT.md` 表 B 有 `bridge.mjs` 一行、现读 = 实施轮实测 |

### 2.6 用例表（本批单测档，收口删除）

| 类 | 输入 | 期望 |
|---|---|---|
| 正常 | `import * as orig from "<原档>"` / `import * as moved from "<新档>"` 逐**导出名**比 | 每个搬走的导出名 `orig.X === moved.X`（同一引用——证明是搬家不是副本） |
| 正常 | 夹具档上 `batch` append / edit / status 各一次 | 回执同形：字符数行、`[doc-check gate] … PASS` 行、段号不前进（拒写时不前进） |
| 边界 | `ledgerBindWriteConflict` 无号写产品码（夹具 agent） | 拒文逐字含 `no ledger number on this call` 与用法句——门体搬家后判据与文案零变 |
| 边界 | `createStripper()` 喂 `\x1b[1m` + 半条 OSC + `\r\n` | 剥净、`\r\n` 归一 `\n`、半条计一次（与搬前同读数） |
| 边界 | `makeBufferedEditFace` 四个注入齐备时正常产出 | `absOf` / `editSingle` / `editBatch` 三件皆是函数；两次实例化互不影响（工厂不读模块级状态） |

### 2.7 关键决策（含被拒）

- **D1 具名即搬 + 原档 re-export，不重写体**：判据 = §2.3 三件读数。被拒：搬的同时「顺手整理」（改名 / 合函数 / 抽公共件）——混进来就分不清是搬家错还是新判据错（§1 判据 1）。
- **D2 E2 按档内实际读者面切，不照搬 §1 的「常量 vs schema」**：`batch-skeleton.mjs` 里没有 action 分发与 schema（实测 `batchTool` 及其 `parameters` 全在 `batch.mjs`）。改为「词表 / 段白名单 / 状态行读写」∥「裁定锚 / 轮次块 / 骨架构造 / 段内容判定」，两半各有明确读者（签发面 ∥ 收口面）。被拒：按 §1 字面造一个不存在的 schema 面。
- **D3 注入缝随执行面同住**：`injectedOnWrite` 只被 `appendBatchRecord` 读，`configureBatchSegment` / `resetBatchSegment` 是它的写口；缝与消费者分居两档就得再开一个导出面。原档 re-export 后调用点零改。被拒：缝留原档、执行面跨档读模块级变量（两档各一份可变状态，测试复位会漏）。
- **D4 `gateKey` 随台账段搬走、原档单向 import 回来**：用户是 `underBase` / `isOwnBatchCompanion`（留原档）与 `resolveDeclaredRoot` / `ledgerGateTargets`（搬走）。若留原档，新档须反向 import ⇒ 现环。被拒：为键另立第三档（本批只做「一档拆两档」，第三档扩大改动面）。
- **D5 E4 走工厂形而非裸搬**：三个符号是 `buildAcpCallbacks` 内闭包，依赖 `readBuffer` / `writeBuffer` / `pathOf`（闭包在 `request` 与 sessionId 上）——裸搬会逼着把 `request` 也搬出去。工厂只注入 IO 缝。
- **D6 验收判据分两半**：本批 = 十档行数 + 导入面零变 + 本批单测绿；「全量集成绿」= 父侧收口门读数。被拒：把全量套件写成本批每步跑——那是发版门，不是每批成本。
- **D7 私有件随其唯一读者搬**：`CRED_RE` / `CRED_TEST_RE` / `MAX_TEXT_CHARS` 随 `sanitizeText`（依据 `thincoder-core/agent-tools/batch-record-write.mjs`「if (!CRED_TEST_RE.test(line)) { kept.push(line); continue }」——三者的读取点只在该函数体内）；`flushEscapes` / `escapeNote` 随剥离族。被拒：判据「留原档、新档反向 import」——两档互 import 成环，ESM 下表现为运行时 TDZ，比搬家错更难查。（父侧 2026-11-05 05:40 修引文路径：该函数已随 E1 搬进 `thincoder-core/agent-tools/batch-record-write.mjs`，原路径的引文因此判 `引缺`，连带把当晚其余批档的写门一起卡住。）

### 2.8 边界（本批不做）

- 不改任何判据、拒文、导出签名、提示词面文本、工具描述。
- 不拆未越线的档；不动上列五档之外的源码档。
- 不新增依赖；不新增对外导出名（新档导出只服务原档 re-export 与单测）。
- 不改 SSH 会话语义（`ssh-session.mjs` 零改动）；不改 ACP 对外回执与 `_meta` 载荷。
- 不做「顺手修」：搬完只看三件读数；见到别的记 §5 交父侧定批。

### 2.9 UI / 交互决策

本批**无 UI / 交互面**：五档全是内部实现面搬家，模型可见文本（`DESC()` 取的工具描述、拒文、回执）逐字不变，故无「交互已定」项要落。

### 2.10 集成测试设计（RTM delta）

**读法与读数（2026-11-05 本席实读）**：行数 425（量法同 §2.1）；`###` 小节 33 个（编号 1–33）；用例行 120 行（正则 `^\|\s*\d+-\w+\s*\|`，含 `7-5a` 这类字母子号）∥ 纯数字子号 118 行（`^\|\s*\d+-\d+\s*\|`）——两法都不出「108 / 110 / 121」那对旧读数。

**本批 RTM delta = 空**：

- **断开的行**：0。无一行断言这五档的档位或符号位置；`22-*`（SSH 可读性）断的是「回执零 `\x1b`、首末行俱在」，制品搬家不改结果。
- **冗余的行**：0。**缺的行**：0——本批不产生业务可观察结果变化，也不来自用户场景或生产事故（跨档但无用户可见入口，不构成一行）。
- 收口提醒：`test/integration/` 下的 `batch-*` / `ssh-device-*` / `acp-*` 是父侧收口门，本批不跑。

### 2.11 上抛项 / 未决（实施轮照此办，不自行扩权）

- **U1（需求层缺口，不阻塞）**：「单档 >500 ⇒ 主动拆分」的成文判据在产品约定与各面档位登记册，需求层无对应条目 ⇒ 验收对照的回指只能指到约定与台账行。补需求条目由主 agent 定（需求面不是我的笔）。
- **U4（登记面 · 已定形）**：`docs/core/design/CORE-UNIFICATION.md` 的标题面 `2.7` 直连 `2.9`（无 2.8 一节）；该档 §2.5 的注写明核内逐档行数与拆分计划「数值按需现量、不落档」⇒ 行数登记面按「读数不落档」退役，本批**不重建**该节。

  核内四档的拆分记录落 = §2.2 逐档动作表 + 台账 `#2067`；`docs/cli/design/CLI-DEBT.md` 档头指向那个已退役节号的一句随本批改指（W1）。

### 2.12 文档侧改指（单列，不夹在搬家清单里）

代码搬家会让设计档里「某符号住某档」的坐标漂移。按 §1 边界，这部分单列、不与五档混列：

| # | 档 | 改什么 | 判据 |
|---|---|---|---|
| W1 | `docs/cli/design/CLI-DEBT.md` | ① 表 B 的 `src/acp/bridge.mjs` 行：现读列去掉「改前」，拆分列写成**在途**态（计划在册、不宣告完成）；② 档头的「对位册」指针改指现行登记面（`docs/core/design/DOC-DISCIPLINE.md` §3.10），删掉那个已退役的节号 | 表 B 该行现读 = 501（量法与日期同列）；档头无死节号；`doc_check` 锚类零命中 |
| W2 | `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` | 把几处**现在时**说写锁台账段住新档的句子改成符号名形（该档本批新建、此前不在盘）：`gateKey` 形状 ∥ `ledgerRowAt` 判据体 ∥ §2.6 门表那格 ∥ `caseNotAProject` 引文的出处改指 `thincoder-core/agent/write-gate.mjs` | 该档扫「`thincoder-core/agent/write-gate-ledger.mjs` 的 `ledgerRowAt`」与「实现住 `thincoder-core/agent/write-gate-ledger.mjs`」两串零命中；档内每个符号名在盘可查 |
| W3 | `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` | §3 档位表 `batch-skeleton.mjs` 行的拆分落点与 §2.2 E2 对齐（词表 / 段白名单 / 状态行读写 → `batch-segment-vocab.mjs`），删掉那条不会产出的落点 | 该档全文 `batch-verdict.mjs` 零命中；该行落点名 = `batch-segment-vocab.mjs` |

W1 / W2 / W3 与搬家同批做（§1 允许），但**不计入**五档验收读数——它们的读数是 `doc_check` 与表行数，不是行数档。

## §3 设计评审（评审子代理）
**状态行**：评审通过



### 轮次 1（评审子代理）

| # | 严度 | 状态 | 证据 |
|---|---|---|---|
| 1 | 🔴 | 未决 | §2.2 E2 落点 `batch-segment-vocab.mjs` 且「留下」含「裁定锚 `_V_PRE` / `_V_SUF`」；BATCH-LEDGER-REVIEW-UNIFY 档位表「整体迁到新档 `thincoder-core/agent-tools/batch-verdict.mjs`，`batch-skeleton.mjs` 改再导出」——同档两套拆法，偏离未点名 |
| 2 | 🔴 | 未决 | 同档「判据体 = `thincoder-core/agent/write-gate-ledger.mjs` 的 `ledgerRowAt`（模块内、不导出）」∧「实现住 `thincoder-core/agent/write-gate-ledger.mjs`，原档 re-export」；同档档位结论「拆单归另一批」；E3 落点列在「新建（5）」 |
| 3 | 🔴 | 未决 | §2.6 错误行「工厂形新增的唯一边界，必须可读」——新增抛错支无场景、无复现路径（6b） |
| 4 | 🟡 | 登记 | §2.6「每个搬走的符号 `orig.X === moved.X`」∧ D5「三个符号是 `buildAcpCallbacks` 内闭包，不能裸搬」 |
| 5 | 🟡 | 登记 | E6「`git diff --stat` 只列十档」；E1「原档六个既有导出名逐字仍在，其中两个经 re-export」（未列名） |
| 6 | 🟡 | 登记 | §2.4「无一档跨档（tier）」∧「故无拆分计划可给」——与 E1–E5 各档越 500 及 §2.2 逐档拆法相反 |
| 7 | 🟡 | 登记 | 全档无「最近先例」行（grep `先例` 零命中） |
| 8 | 🟡 | 登记 | 全档无「调研证据」行（grep `调研` / `证据` 零命中） |
| 9 | 🟡 | 登记 | §2.4「新建（5）」五个档名无三问答；`batch-verdict.mjs` / `write-gate-ledger.mjs` 的既有件答案缺 |
| 10 | 🟡 | 登记 | E1「`CASE_*` / `LIST_UNKNOWN_*`」与「具名即搬」相悖；`sanitizeText` 同时在 E1 搬走列与 U2 未决 |
| 11 | 🟡 | 登记 | E4 形 = `makeBufferedEditFace({ agent, readBuffer, writeBuffer })`，注入项另列 `pathOf`——缝面未一处说全 |
| 12 | 🟡 | 登记 | §1「覆盖账 = #2067（并入的原行：`#1996` ∥ `#1999` ∥ `#2003` ∥ `#2050` ∥ `#1922`，均已废弃）」对同档「恒写、单行、无注释」与升序形 |
| 13 | 🟡 | 登记 | CLI-DEBT 表 B 现读列「改前 501」＋拆分列「已拆：IDE 缓冲编辑面」——规面留痕且提前宣告完成 |
| 14 | 🟡 | 登记 | U4「本席在其标题面未找见该节锚」对 CLI-DEBT 档头「`docs/core/design/CORE-UNIFICATION.md` §2.8.1（核内逐档行数与拆分计划）」 |
| 15 | 🔵 | 登记 | E3「515」对同档「522 行」（同日两读数）；E2「509」对同档「508」 |
| 16 | 🔵 | 登记 | §2.10「实测 425 行 / 33 个 `###` 小节」不可在评审范围内复核；同档 RTM 读数 108 / 120 互异 |

计数 = 🔴 3 · 🟡 11 · 🔵 2（共 16）

VERDICT: changes-required

### 轮次 2（评审子代理）

| # | 严度 | 状态 | 证据 |
|---|---|---|---|
| 1 | 🔴 | 已闭合 | §2.2「为什么不用既有登记里的拆法（`batch-verdict.mjs`）」+ W3「该档全文 `batch-verdict.mjs` 零命中」；BATCH-LEDGER-REVIEW-UNIFY 档位表落点已 = `batch-segment-vocab.mjs` 且「裁定锚与轮次块留原档」 |
| 2 | 🔴 | 已闭合 | 同档 §2.3「判据体 = `ledgerRowAt`（模块内、不导出）」；门表「判据体与拒文同住一个模块」；三问答 `write-gate-ledger.mjs` = `none found` |
| 3 | 🔴 | 已闭合 | §2.2「**不设缺参分支**：唯一调用方 `buildAcpCallbacks` 在定义这四个闭包的同一作用域内调工厂，四个实参恒在」；§2.6 错误行已删 |
| 4 | 🟡 | 已闭合 | §2.6「逐**导出名**比」+ §2.5「E4 自有判据」行 |
| 5 | 🟡 | 已闭合 | §2.3 ②「故改用直读式」+ 六个导出名逐字列出 |
| 6 | 🟡 | 已闭合 | §2.4「越 500 软线的 = 五档」/「触 800 硬限的 = 零档（最高 556，余 244）」 |
| 7 | 🟡 | 已闭合 | 「**最近先例**：同目录 `batch-lifecycle.mjs` 的拆档」+ 对齐 ∥ 偏离 |
| 8 | 🟡 | 已闭合 | 「**勘察证据**」+「`index.publicRepos` = `[]`（照记）」 |
| 9 | 🟡 | 已闭合 | 「**五个新档的三问答（新建前的既有件答案）**」五行俱在 |
| 10 | 🟡 | 已闭合 | E1「八条拒串 `SECTION3_VERDICT_GAP_ERROR`」逐个列名，无通配 |
| 11 | 🟡 | 已闭合 | 「工厂签名（一行写全）」含 `pathOf` |
| 12 | 🟡 | 已闭合 | 「**覆盖账 = #2067 · #1922 · #1996 · #1999 · #2003 · #2050**」——本档行首、升序、单行 |
| 13 | 🟡 | 已闭合 | CLI-DEBT B1「拆分在途：IDE 缓冲编辑面」，现读列无「改前」 |
| 14 | 🟡 | 已闭合 | §2.11 U4「数值按需现量、不落档」；CLI-DEBT 档头改指 `docs/core/design/DOC-DISCIPLINE.md` §3.10 |
| 15 | 🔵 | 已闭合 | §2.1「量法 = `node` 读全文按 `\n` 计行」+ 读数日 |
| 16 | 🔵 | 已闭合 | §2.10「两法都不出「108 / 110 / 121」那对旧读数」 |
| 17 | 🟡 | 新（不阻塞） | §2.5「经新档 re-export 的 9 名」对 E2「原档 re-export 搬走的 16 个名字」——16 名未进该计数 |
| 18 | 🔵 | 新（不阻塞） | §2.4「≈390 ∥ ≈180」对 E5「新档 ≈140、原档 ≈420」 |

计数 = 🔴 3 全闭合（0 未决）· 🟡 11 全闭合 + 1 新 · 🔵 2 全闭合 + 1 新（共 18）

VERDICT: pass

## §4 用户批准（主 agent）

## 用户批准

**用户原话**：「**都开吧**」（2026-11-05 05:05）——七族开批，本批为其一；覆盖设计 → 评审 → 批准 → 实施 → 收口全链。

**批准面**：

- §2 定稿的五档逐档动作表（E1–E5 具名外移 + 原档 re-export，调用点零改）。
- 评审轮 2 的 `pass` 结论，及轮 1 的 16 条与轮 2 的新增 2 条全部落位。
- 文档侧改指 W1 ∥ W2 ∥ W3（`docs/cli/design/CLI-DEBT.md` ∥ `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md`）。

**批准即开工**：实施席按 §2 逐档搬、逐档回读；判据 = 导出面零变 ∥ 十档 `node --check` 过 ∥ 本批单测绿。

**「全量集成绿」归父侧收口门**——不在批内每步跑。

## §5 实施记录（eng-coder）
**状态行**：实施完成（五档搬完 + 三处偏离与交父侧项已记 5.3 / 5.7 / 5.8）



### 5.1 逐档落点与读数（拆前 → 拆后）

量法 = `node` 读全文按 `\n` 计行（`readFileSync(p,'utf8').split('\n').length`）；读数日 = **2026-11-05**（实施轮本席实测）。

| # | 原档 | 拆前 | 拆后 | 新档 | 新档读数 |
|---|---|---|---|---|---|
| E1 | `thincoder-core/agent-tools/batch.mjs` | 541 | **199** | `thincoder-core/agent-tools/batch-record-write.mjs` | **369** |
| E2 | `thincoder-core/agent-tools/batch-skeleton.mjs` | 509 | **316** | `thincoder-core/agent-tools/batch-segment-vocab.mjs` | **231** |
| E3 | `thincoder-core/agent/write-gate.mjs` | 515 | **187** | `thincoder-core/agent/write-gate-ledger.mjs` | **354** |
| E4 | `thincoder-cli/src/acp/bridge.mjs` | 501 | **407** | `thincoder-cli/src/acp/buffered-edit.mjs` | **134** |
| E5 | `thincoder-core/agent-tools/ssh-transport.mjs` | 556 | **427** | `thincoder-core/agent-tools/ssh-text.mjs` | **155** |

十档全 < 500（最高 427）；无一档触 800 硬限 ⇒ 豁免通道未被触发。

### 5.2 三件读数的实测读数

**① 行数** = 上表。**② 导入面零变** = 四条：

- `node --check` 十档逐一过，十条全 `check ok`。
- `dispatch.mjs` 的 `ledgerBindWriteConflict` 命中行逐字不变：import 行与调用行（`await ledgerBindWriteConflict(agent, depth, tool, toolCall.name, args)`）两条。
- 十六个消费者档逐档 `import()` 全 `ok`：核内十个 batch-skeleton 消费者（`batch.mjs` / `batch-lifecycle.mjs` / `batch-read.mjs` / `batch-reopen.mjs` / `batch-gate.mjs` / `batch-closeout.mjs` / `design-token.mjs` / `advisor.mjs` / `batch-ledger-bind.mjs` / `ledger-close-proof.mjs`）+ 三个 ssh 消费者（`ssh-session.mjs` / `ssh-transfer.mjs` / `ssh-vault.mjs`）+ `agent/dispatch.mjs` + `acp/session.mjs` / `acp/handlers-slots.mjs`。
- 导出面逐档同一引用：`batch.mjs` 8 名（与拆前逐名同集）· `batch-skeleton.mjs` 14 名经新档（同一引用）· `write-gate.mjs` 7 名（`ledgerBindWriteConflict` 与 `write-gate-ledger.mjs` 同一引用）· `ssh-transport.mjs` 可见文本面 4 名经新档（同一引用）· `bridge.mjs` 2 名（`buildAcpCallbacks` / `replayHistory`）。

**③ 该面测试绿** = `node --test docs/batches/2026-11-05-file-split-family.test.mjs` ⇒ **10 tests / 10 pass / 0 fail**。

### 5.3 三处与 §2 落点表述不同的处置（逐条给依据）

**(a) E2 段解析下沉新档**（`sectionBodyLines` 导出、`sectionHeaderZoneLines` 私有，均住 `batch-segment-vocab.mjs`）。

依据 `thincoder-core/agent-tools/batch-segment-vocab.mjs` 的段解析单源 `sectionHeaderZoneEntries`（现名；本批落笔时为 `sectionHeaderZoneLines`，同夜 batch 工具族把段头区读面改成行项后改名）——`readBatchStatusLine` 与 `readSectionStatusWord` 都要「取某段段头区行集」，而取行集只有一份实现。（父侧 2026-11-05 06:38 改写：原写法直引旧函数签名，改名后引文失效，会拒掉收口门；见台账 `#2075`。）

留原档 ⇒ 新档须反向 import 原档（两档互 import，§2.2 E2 明写「导入方向 单向」）；复制一份 ⇒ 段解析有第二份字面（D7 禁）。

代价 = 新档多一个导出名 `sectionBodyLines`（只服务原档内部读者，**不经原档再出口** ⇒ 原档导出面零变）。

对设计档的影响：`docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` §3 档位表该行末句「（与 `sectionBodyLines` / `sectionHeaderZoneLines` 同档，单拆会把段解析复制一份）」现与实现有出入——设计档不是实施轮的笔，故只报不改。

**(b) E5 `flushEscapes` 留原档**（六件搬、一件不搬；`escapeNote` 随文本面走）。

依据 `thincoder-core/agent-tools/ssh-transport.mjs`「if (res.text) handleChunk(entry, entry.mask.push(res.text))」——它的体除读剥离残态，还把交出的字节经 `handleChunk` 汇入 log / 缓冲 / 等待者（运行时汇聚点住原档）。

搬过去要反向 import 成环；它在档外零消费者（只有 `attachChild` 的收场与 `waitSettled` 的硬超时两处调），落点不改导出面。读数差 = 新档 155（§2.2 预期 ≈160）。

**(c) E1 记账注入缝留原档**（`injectedOnWrite` ∥ `configureBatchSegment` ∥ `resetBatchSegment`）。

依据 `thincoder-core/agent-tools/batch.mjs`「const onWritten = injectedOnWrite」——缝的唯一读者是 `batchTool.execute`（取值后经 `onWritten` 形参递给五条 action），不是 `appendBatchRecord`（§2.7 D3 的前提与实测不符）。

搬走须新开一个 getter 导出名（§2.8 禁新增对外导出名），且工具面仍要反向 import。故 E1 经新档 re-export 的只有一个 `MAX_TEXT_CHARS`（§2.5 列的另外两名 `configureBatchSegment` / `resetBatchSegment` 仍在原档定义、调用点零改）。

### 5.4 夹具面实跑（搬家不改行为的行为侧证据）

夹具档（`batchSkeleton` 产出 + §5 一行正文）上实跑五步，回执与门位逐条同形：

- §3 无裁定行的 append ⇒ 拒（`SECTION3_VERDICT_GAP_ERROR` 原串），轮次号不消耗。
- §3 带 `VERDICT: pass` 的 append ⇒ 回执照旧含 `(### 轮次 1（评审子代理）)` 与 `[doc-check gate] DOC-CHECK GATE: PASS`，且 §3 状态行被置成 `评审通过`（打回/置位计划读的是新档的 `readSectionStatusWord`）。
- §5 的 append 过 §5 段序门；`edit §5` 回执「replaced 18 characters with 16」；`status §5` 回执 `§5 status line updated to "实施完成"`。
- `ledgerBindWriteConflict` 无号写产品码 ⇒ 拒文逐字含 `no ledger number on this call`、用法句与挂号两步；三道前置（普通模式 / 子代理 / 入口集外）仍各返回 `null`。
- `createStripper` / `createMask` / `normalizeText` 三条读数与拆前副本（`git show HEAD:` 取出的档）逐字同值：`p1=hi` / `p2=\n` / `end={text:"hi",dropped:1}` / `mask.push="a"` / `flush="a--bb"` / `normalizeText="bo\ndy"`。

### 5.5 用例档

本批批内单测档 = `docs/batches/2026-11-05-file-split-family.test.mjs`（§2.6 五类 → 十格；收口删除）。

覆盖：五档导出面同一引用 · bridge 不再定义三个闭包（结构机检）· 夹具档 append/edit/status 回执 · 写门拒文 · 剥离器读数 · 工厂两实例独立 · 编辑链在假缓冲上跑通单/数组两形态。

### 5.6 越声明文件面的改动（逐条）

`docs/batches/2026-11-05-file-split-family.test.mjs` —— 不在本 spawn 的声明文件清单里；§2.6 要求本批产出本批单测档（收口删除），故按任务书建。

除它之外未动任何声明清单外的文件；`docs/**` 一字未改（W1 ∥ W2 ∥ W3 已由设计席落盘，本席只做读面核对）。

### 5.7 交父侧（未做 / 需路由）

- **E7 后半未落**：`docs/cli/design/CLI-DEBT.md` 表 B 的 `src/acp/bridge.mjs` 行现读仍 = 拆前 501、状态「拆分在途」。实施轮实测 = **407**。按该册 §1 行维护 ②「拆分兑现（读数回落 <700 且无在册裁定）⇒ 移出本册」——此行现应**整行移出**（表 B 归 0 档），不只是刷新读数。设计档不是实施轮的笔 + 不在声明文件面 ⇒ 报父侧路由。
- **集成半幅未跑**（§2.7 D6：父侧收口门）；**未做集成测试验证——父侧收口那一跑是唯一的集成测试运行**。
- **ACP 面用例档集 = 空**：`thincoder-cli/test` 只有 `run.mjs` / `slow.mjs`，`grep -l "acp/bridge.mjs\|buildAcpCallbacks"` 零命中 ⇒ §2.5 E4 的「用例档逐档跑绿」退化为空集，E4 的机检部分（`buildAcpCallbacks` 定义恰 1 处、三个闭包 0 处）已进批内单测档。

### 5.8 审计轮 ∥ 代码评审轮 ∥ 修正轮（收敛读数）

**审计轮 1（`explore` 只读子代理，比对交付与 §2）**：结论 `DIVERGENCE: 8 条`——7 条为本段已申报项（含 5.3 三处、5.6、5.7），1 条未申报。

未申报那条已修：单测档原先是直调执行体与 lifecycle，未经工具面。**修正轮 1** 改为 `batchTool(fixture, { review: true })` / `batchTool(fixture)` 的 `execute` 调用（`append` / `edit` / `status` 三条），覆盖分发与 `onWritten` 接线；复跑 10/10 仍绿。

审计另点出 §2.5 的合计句偏差，本段照实记数：**经新档再出口回原档的导出名实测 = 20**（E2 十四 + E3 一 + E5 四 + E1 一），不是 §2.5 的 23——差额三件即 5.3 的 (a)(b)(c)。

**代码评审轮 1（`advisor` 代码评审，11 档 + 批档）**：结论 `VERDICT: pass`（🔴 0 · 🟡 6 · 🔵 4）。

🟡 六条的处置：四条是**设计档侧的滞后**（§2.5 的 23 名、§2.2 E1 注入缝落点、§2.2 E5 `flushEscapes` 落点、`docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` 该行括注）——本席的笔写不了设计档，全数报父侧；一条是 5.7 已报的 E7 后半；一条是「ACP 面用例档集为空 + 本批单测档收口删除 ⇒ 工厂本体收口后零持久覆盖」——由父侧定留不留。

🔵 四条里，两条本轮就地修：`batch-record-write.mjs` 档头「共用六助手」实列五名（改为「共用五助手 + edit 面两助手」）；§5 状态行原写「两处偏离」而 5.3 有三处（已改口径，见状态行）。

另两条记观察、本批不动：① `write-gate.mjs` 的 `underBase` 与 `write-gate-ledger.mjs` 的 `underKey` 是同一谓词的两份（拆档前同档即两处，拆后跨档；`gateKey` 坐标系已单源，判据本体未合）——纯搬家批不夹带合并；② 单测档的回执断言写死了字数与夹具正文，夹具一改会以「行为变了」的样子红——按 §2.6 收口删除，不必改。

**终态 = `clean`**：审计 1 轮 + 修正 1 轮 + 代码评审 1 轮，评审未触发必须修（无 🔴），各轮读数全绿。

## §6 验证与收口（父代理）

## 验证与收口（父侧 · 2026-11-05 06:37）

### 交付核对（逐条对 §2 五档 + 三条验收）

| # | 判据 | 读数 |
|---|---|---|
| E1 | `batch.mjs` 541 → 现盘行数、执行面迁出 | 199 行；执行面住 `batch-record-write.mjs`（369 行） |
| E2 | `batch-skeleton.mjs` 509 → | 316 行；词表 / 段白名单 / 状态行读写住 `batch-segment-vocab.mjs`（231 行） |
| E3 | `write-gate.mjs` 515 → | 187 行；台账写锁段住 `write-gate-ledger.mjs`（354 行） |
| E4 | `bridge.mjs` 501 → | 407 行；三闭包改工厂，住 `buffered-edit.mjs`（134 行） |
| E5 | `ssh-transport.mjs` 556 → | 427 行；可见文本面住 `ssh-text.mjs`（155 行） |
| AC-1 | 十档 `node --check` 过、导出名逐名仍在 | 十档全过；五原档导出面 8 ∥ 14 ∥ 7 ∥ 4+`flushEscapes` ∥ 2 名逐名同一引用 |
| AC-2 | 16 个消费者 import 行一字未改且全部解析 | 逐档 `import()` 全 `ok` |
| AC-3 | 本批单测绿 | `node --test docs/batches/2026-11-05-file-split-family.test.mjs` ⇒ **10 pass / 0 fail** |

### 偏离（已申报并采纳）

三处与任务书落点不同，理由在 §5.3：段解析随状态行读面下沉（避免反向 import 成环）、`flushEscapes` 留原档（汇聚点）、记账注入缝留原档（**§2.7 D3 的前提与代码不符**——缝的读者是工具面分发，不是执行体）。

### 收口门读数

- **集成全量**：`node test/run.mjs` ⇒ **`tests 143 · pass 143 · fail 0`**，exit 0（父侧唯一一次）。
- **doc-check 门**：本档 append 回执 `PASS`。
- **单测档**：`docs/batches/2026-11-05-file-split-family.test.mjs` 用毕，收口删除。
- **暂缓批复核**：无（本批未暂缓）。

### 交接父侧的两笔

- `docs/cli/design/CLI-DEBT.md` 表 B 的 `src/acp/bridge.mjs` 行：现读 501、「拆分在途」，实测 **407**，按该册 §1 维护 ②「拆分兑现 ⇒ 移出本册」应整行移出 → 已挂 `#2076` 同族处置。
- `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` §3 档位表该行末句与 §2.5「23 名」两处数字需设计席收正 → 已并入 `#2077`。

### 台账

`#2067` 在途 → 待核销 → 已核销（结算行随本批收口）。

### 收口前的死引文清扫（父侧 06:38）

§5 第 428 行原写 `依据 …「function sectionHeaderZoneLines(src, seg) {」`——该函数已被同夜 batch 工具族改名为 `sectionHeaderZoneEntries`，**引文失效、收口门 fail-closed 会拦**。父侧已就地改写成不带直引的形（保留符号名与理由）。

⇒ **今晚第六次同一形状**（前五次见 `#2075`）。**新批次撞老账**这一次，说明 `#2075` 不是一次性问题：**任何改名 ∥ 搬家都会让别人的账变成死引文。**
