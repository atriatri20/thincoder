# 2026-11-09 · acp-bridge-entry-outcome
> 六段，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 每段只有一个作者：作者的段可 `append` 加内容、可就地改（`edit`）；非作者一概拒。
> 编制：主 agent · 2026-11-09 · 来源 = 用户 2026-11-09 12:53 裁定：「端侧也要改」——ACP 桥面沿用「全过才写」，与核面逐条成败两口径，须归一。
> 台账 = #2234 · #2232 · #2233（TOOLS · 归批）。前情 = 无（独立批）。
## §1 讨论（主 agent）
**状态行**：已收口 2026-11-09
<§1 模板占位：本批条目 / 关键判据 / 授权口径>

### 用户裁定：端侧也跟逐条成败（2026-11-09 12:53）

**用户原话**：「端侧也要改。」

**这一句把上一批留下的唯一两口径缺口关掉了。**`#2183` 收口时，核面 `edit` 批量已是逐条成败，而 ACP 桥 `thincoder-cli/src/acp/buffered-edit.mjs` 仍「全过才写」——同一机制两个口径。当时我挂 `#2234` 等裁，理由是端侧属契约面（IDE 侧编辑行为随之变）。**现在裁了：改。**

**要改的边界（我先划清，设计席可校正）**：

- **语义归一**：桥面批量编辑同样「一条失败只废它自己、成了的留在盘上、逐条回执」。
- **不动的**：桥的**传输形态**（`fs/write_text_file` 等 IDE 侧调用面）、`buffered-edit.mjs` 与 IDE 之间的消息契约字段——**改的是「几条失败怎么回」，不是「怎么和 IDE 说话」**。
- **一处必须先想清的**：桥现在是「先全算、再逐档写回」的两段结构。逐条成败意味着**失败可以发生在「算」那一段**（某条 `old_string` 匹配不到）——那一段的属性变了：它不再是「全过才写」的闸，而是**逐条判定的地方**。设计席要判：这一段还叫不叫「缓冲」，还是要拆。

**判据（用户要的东西，逐条可验）**：桥面批量里一条匹配不到 ⇒ 回执点名那条、其余条落盘、用户不必重做；**回执不能对 IDE 说「什么都没写」而实际写了一半**——那是本批最初那个病，只是换了个端。

**上游事实（本批不在盘，供设计席）**：`#2183` 已把核面改成 `scope:"batch"` + `onEntryError:"collect"`，桥面当时显式传 `"throw"` + `scope:"single"` 保原语义。本批要动的正是这两个实参的选择，以及由此带来的回执形。

### 三笔并一批（2026-11-09 12:54）

**用户原话**：「2232/2233也同时处理。」

**并入两行，理由记此（批界判据）**：

| 行 | 对象 | 与本批同一面上吗 |
|---|---|---|
| `#2234` | ACP 桥面 `buffered-edit.mjs`：全过才写 → 逐条成败 | 本批主体 |
| `#2232` | `thincoder-core/tools/patch.mjs` 的 `apply_patch` 提交段：抛裸 `rename`、不报已提交清单 | **同一条缝**（暂存 → `rename` 提交），同一失败观感 |
| `#2233` | `thincoder-core/tools/write-path.mjs` 档头「唯一例外 = `apply_patch` 的批级记账」已失准 | **同一份契约文字**，`#2232` 改完这句还要再动一次 |

**合并依据**（批界三判据逐条对）：**同一实现面** = `thincoder-core/tools/` 的写入路径与端侧调用；**同一评审面** = 一次设计评审同时看三处，不会出现「A 批说报清单、B 批说抛错」；**同一时间窗** = 今天同一天。

**不合并的代价**（为什么不各开一批）：三笔都改到「失败时回执说什么」这一件事。**分三次走，就是同一个口径判三遍**——`#2183` 那批已经因为口径反复改过两轮，不能再把同一件事拆开重来。

**逐条要求**：

- `#2232`：提交段失败不得抛裸 `rename` 错误——要按盘上实况报**已提交档**（形与 `#2183` 的 `K of N` 同族，但对象是 `apply_patch`，措辞自成一套，不硬套 `edit` 的）。
- `#2233`：`write-path.mjs` 档头那句「唯一例外」按改完的实际收敛——是「两处批级记账」还是收回单点，看 `#2232` 落地后的实况再定。

### 用户驳回我的「格式可以不统一」（2026-11-09 12:58）

**用户原话**：「格式为什么不统一？又不是内容统一。」

**我上一条写的是**：「倾向可以不一律——两个工具的调用者与语义不同」。**这句把两样东西混成一样了**：

| 两样东西 | 能不能统一 | 为什么 |
|---|---|---|
| **内容** | 不能，也不该 | `edit` 的失败是「这条 `old_string` 没匹配到」，`apply_patch` 的失败是「这个 hunk 上下文对不上」——本来就不是一件事 |
| **格式** | **必须统一** | 「哪一条没成、为什么、成了几条、写了几档」——**同一个问题只有一种好样子** |

**用户驳回的是第二行，我说反了。**

**本批口径（改判）**：

- **失败行**：`<定位> — failed: <原因原文>`，一行一条、按调用序回原位；`— failed: ` 这一段**逐字同形**。定位各用各的天然坐标（`edits[<i>]` ∥ 档 + hunk 序）。
- **末行汇总**：`<工具名>: <k>/<M> <单位> applied, <M−k> failed — <K> file(s) written`——**骨架逐字同形**，只换工具名与单位词。
- **成功行**：各工具保持自己的成功回执，不强求统一（成功回执是业务语，失败回执才是同一个问题）。

**这条为什么重要，也解释了 `#2232`/`#2233` 从哪来**：同一个失败现象两种说法，用户就得学两遍；**形状统一之后，改一处才知道另一处该跟着改**——`#2233` 那句「唯一例外」失准，本质就是没有这张对照表。

**设计席要在 §2 给一张对照表**：左列骨架（逐字），右列两工具各自填什么。**骨架列两边必须逐字相同**——将来第三个写入工具接进来，填的就是这张表。

### 需求面同轮改（2026-11-09 13:00，父侧笔）

设计席上抛两条需求面缺口，已同轮落：

**① `F16` 的边界句反了。**原写「ACP 桥面仍「全过才写」，不在本条射程」——**用户 12:53 已裁要改**。改成「**ACP 桥面同口径**（逐条成败 ∥ 逐条回执，本条与它同一个判据；回执骨架见 F17）」。

**② 新增 `F17`：写入工具回执的失败面形状。**这一条是用户 12:58 那句驳回落的根，写进需求层：

> **同一个失败现象，所有写入工具用同一副骨架说。**内容各工具不同——格式必须一样。
> 失败行 `<定位> — failed: <原因原文>`；末行 `<工具名>: <k>/<M> <单位> applied, <M−k> failed — <K> file(s) written`。
> 成功行各工具各自保留：**成功回执是业务语，失败回执才是同一个问题**。
> 共同判据一条：**回执只说盘上实况，不得在已有部分写入盘时说「什么都没写」**。

边界写了「新写入工具接入时**填骨架、不新造形状**」；判定句要求两工具回执并排读时四段逐字相同。`§4.2` 标题计数同步 `F1–F16` → `F1–F17`（D3）。

**③ 设计席问「`#2232`∥`#2233` 要不要单立需求条目」——不单立。**两笔都落在 `F17` 这条共同判据下（一个管 `apply_patch` 的回执形，一个是那句单源措辞失准）。**再立一条只是把同一句话抄第二遍。**

**④ 一处要记的现场事实**：本会话进程在我编辑需求档时，`edit` 工具的回执仍是旧形（`edit batch: 3/3 entries — <path>`），**因为工具模块在会话启动时已加载，改码后不随进程刷新**。验证新回执必须另起进程——我的两条探针都是这么跑的，读数有效。

### 评审第 1 轮 changes-required（5🔴+6🟡+2🔵），十三条全修（2026-11-09 13:09）

**最扎的一条 🔴 又是「编辑器径」**——和 `#2183` 那次同源：

`APPLY-PATCH.md` §4 写「暂存段失败 ⇒ 目标档**全未动**」、`k = 0` 同一形。而 `write-path.mjs` 的 `tryInjectedPath` 在 `defaultPath` 的暂存分支**之前**就接管了 `op:"write"`，它自己的注释写着「注入径例外：编辑器径无暂存档（**即时提交**）」；`patch.mjs` 也确实在用：`if (r.via === "editor") committedByEditor.add(p.abs)`。

**⇒ 暂存段抛错时，前面已在宿主侧提交的档是真的落在盘上的**，而设计会让回执印 `0/N file(s) applied` 且一条 `modified` 都没有——**正是本批要灭的那句假话，换到了 `apply_patch`**。

**这一条我认账**：设计席按 `#2183` 的教训在 `edit` 面写清了编辑器径，却在 `apply_patch` 面漏了同一个洞。**同一个坑，两个工具，只填了一个。**

其余四条：

| # | 事 | 裁定 |
|---|---|---|
| 2 🔴 | `D-14` 说「无可复用件」，同档 §6 说「已落（失败行 ∥ 汇总行均为 `applyEditBatch` 收尾的字面量）」 | 收——**§6 对、D-14 错**，盘上两个字面量都在 |
| 3 🔴 | 三档无 RTM 起始的集成设计、无验收 | 收 |
| 4 🔴 | 无档位结论；`edit-diff.mjs` 今日 499 行 + 本批两件 ⇒ 越 500 | 收 |
| 5 🔴 | `not committed` ∥ `k = 0` 无场景无复现径 | 收 |

**🟡 六条**（已提交集合的追踪 ∥ 「唯一例外」括注里那句被证伪的半句 ∥ §7.4 的「上一版」残留 ∥ 另两档缺先例与调研行 ∥ `apply_patch` 新文案无三问 ∥ 跨工具骨架表放在 `EDIT.md` 而非共享层）与 **🔵 两条**（量法缺 `recordWrite(` ∥ `EDIT.md` 节序跳 §7）**一并修**。

### 父侧裁定：设计席拒写「批档 §2」是对的，我那条指令违规（2026-11-09 13:23）

我给 `#51` 的 🟡② 写的是「点名 AC 住在哪一档（**批档 §2**）」。**它没照做，并给了理由**：

> `docs/core/design/DOC-DISCIPLINE.md`「D4 细则二（引用方向——用户裁定）」逐字：「**规范档禁引批档及其单元测试档（含历史行）**」，并「**处置 = 删引用片段，不是改指别处**」，阈值 0、存量无豁免。

**我去核了原文，它引对了**——同档另有：「**方向唯一**：批档 → 规范档（单向）——规范档**禁引**批档及其单元测试档（**含历史行**）；反向引用不存在。」

**所以是我错，不是它交得不对。**我那条要求会把一处阈值 0 的违规写进评审刚清干净的那一行。**它拒得对，而且拒的时候给了出处。**

**裁定**：

- 🟡② 按它的落法收（口径指本档契约面 + 需求条目 F16/F17，不指批档）；
- 它报的另一处同族 `EDIT.md` §6「读数口令 = `doc_check lines`，本轮值留在批档 §2」——**同一条规则，纯删减，当场清**（派 `#52`）；
- **单元测试档路径同样属禁引族**（「及其单元测试档」），设计席改成「住批次档目录、名随该档」的约定形，我认。

**一条要给以后的**：`F17` 与 `F16` 已经在需求层把该说的说了；**设计档再说一遍就是第二处声明面（D2），指过去才对**。它没有把「批档 §2」换个说法塞回来 —— **拒一条指令时给出更好的落法，比照办更有用。**

### 收尾裁定（2026-11-09 13:24）

**它多删的那一处，我认。**`APPLY-PATCH.md` §7.1 表末那行「本档旧文引过一句回执 `<C> of <N> file(s) committed` 作先例——**全仓零命中**……已删：无坐标的先例等于编的」——**主语是被删掉的文字，属规范面 corpse mark**。同一批里 `EDIT-HELPERS.md` 的「上一版把它列进『不写』」已按这条删过一次，**它把同一条纪律用到第二处，是对的一贯性**。

**它自己报的一处纠错也值得记**：写 §2.9 时把两个小节号写错（`§7.2` 实为 `§7.3`、`§7.1` 实为 `§7.4`），另有一句「四处先例」与逐行数对不上——**按引用集↔标题集、行↔汇总两条交叉检查复核后就地改了，并把「报脆弱的计数」换成「按坐标点名」。**

**这一步的意义**：它不是被动等我抓，是**在交付前用自己定的那两条交叉检查发现了自己的错**。

**设计面收尾完成，可派 coder。**

## §2 批次任务与设计（eng-designer）
**状态行**：设计完成（评审后同族引用扫查已清，见 2.9）
<§2 模板占位：本批条目（覆盖） / 设计档落点 / 机制设计 / 受影响文件与测试覆盖 / 验收对照 / 关键决策 / 上抛项>

### 2.1 本批条目（覆盖）

| # | 条目 | 来源 | 覆盖 |
|---|---|---|---|
| B1 | ACP 桥批量编辑从「全过才写」改为逐条成败——一条失败只废它自己、成了的留在 IDE 缓冲、逐条回执 | 用户 2026-11-09 12:53「端侧也要改」· 台账 #2234 | ✅ |
| B2 | `apply_patch` 写盘段（暂存 ∥ 提交，含注入径在暂存段即提交那一批）失败时按盘上实况报已落盘档（今日抛裸 `rename` 错误、不报清单） | 台账 #2232 | ✅ |
| B3 | `write-path.mjs` 档头「唯一例外 = apply_patch 批级记账」按 #2232 落地后的实测重判（单点 ∥ 两处） | 台账 #2233 | ✅（判法见 2.3 B3、设计档 §7.4） |

**不做（边界）**：不动 IDE 通信字段 · 不动 `doc-write-gate.mjs` · 不动 #2183 已落的核面语义 · 不动 edit 单形态与 `apply_patch` 的 hunk 面语义。

### 2.2 设计档落点

- `docs/core/design/EDIT.md` §5（批量回执射程 / 守卫与文案单源 / 桥面同口径，骨架表改为指向共享层）· §6（入参守卫、汇总行、逐条回执、帧面逐条失败、**档位结论**、桥面记账的落位——按盘上实况标已落 ∥ 未落）· **§7 集成测试设计（RTM 增量）**· §8 D-14 修订 + D-15 ∥ D-16 ∥ D-17。
- `docs/core/design/EDIT-HELPERS.md` §7.3（帧拒因、collect 的两个调用点、副本已删）· §7.4（桥面回执三形、不写的三样、合并快照只计成功条、**记账归属表**与量法）· **§7.6 跨工具失败回执骨架（单源：骨架表 + 四条判据 + 先例与调研 + 集成面指针）**。
- `docs/core/design/APPLY-PATCH.md` §1（注入径是写盘面第三态）· §4（两个失败段、注入径在暂存段即提交、`not committed` 的可复现场景、记账面含注入径）· §6.1 两条 + 注入径行 · §6.2 描述面落点 · §6.3 集成面与先例调研 · §7 D-P2 + D-P4′ + **§7.1 三问**。

### 2.3 机制设计

**B1 = 桥面走与核批面同一条六段流水线**（`EDIT.md` §8 D-15）：

- 容器守卫整批拒 → 分组（条目级失败不进组）→ 逐档读缓冲（读不到连坐该档）→ 行号锚护栏逐条判 → 帧排 + `onEntryError:"collect"` 累积 → 有成功条的档写缓冲一次并记合并快照。
- 零成功的档不写、不记账；写缓冲抛错只连坐该档，已有自己原因的条目保留自己那句。

**§1 提的那一问（第一段还叫不叫「缓冲」、要不要拆）**：两段都留、名字不改。`readBuffer` / `writeBuffer` 指 IDE 文档缓冲（传输事实），不是暂存区；变的是第一段的身份——从「闸」变成逐条判定点（D-15）。

**回执三形与单源**：

- **逐条成功行**：保持桥面现措辞（`OK: edited … via IDE` ∥ `Deleted … via IDE`）。
- **失败行与末行**：与核同构造器（`editEntryFailureLine` / `editBatchSummary`）。单源从 `edit-batch.mjs` 收尾的字面量上提为具名构造器，落新档（`edit-diff.mjs` 已贴近 500 行硬线，本批不再往里加件——见 2.4 档位结论）。
- **桥面补上末行汇总行**：它的数字全在内存里，没有宿主能力依据可以挡它（D-16）。

**退役**（D-17）：`EDIT_ABORT_PREFIX` / `assertEditEntries` / `abortPrefix` 形参链——它们最后的使用者就是桥面，桥改 `scope:"batch"` 后零使用者。

**B2：写盘段按盘上实况报，两个失败段分开说**。

- **hunk 段失败** ⇒ 一个字节没写、`k = 0`。
- **写盘段失败** ⇒ 已落盘的档照实计入 `k`，逐档列出。
- **已落盘集合** = `committedByEditor`（注入径在暂存段即提交）∪ 提交段已 `rename` 成功的档。本批新增 `committed` 集合与 `inFlight`（`catch` 靠它点名失败档）。
- **记账**：对已落盘档跑（成功 ∥ 失败两路，注入径那批在内）。今天失败路径上不记账，已落盘档会让行号锚护栏拿写前快照放行（`EDIT-HELPERS.md` §7.1 第 4 行）。
- **依据**：`thincoder-core/tools/write-path.mjs`「编辑器径无暂存档（即时提交）」∥ `thincoder-core/tools/patch.mjs`「if (r.via === "editor") committedByEditor.add(p.abs)」。

**B3**：判据先立再数。批级记账 = 调用方自己写记账表（`markDirty` / `clearLastWrite` / `recordWrite`），不是把记录交给写点；`edit` 批面把合并快照作为 `record` 交给 `writeThroughPath` ⇒ 不算。**判法 = 收回单点**：档头保留「唯一例外 = apply_patch」，把判据写进括注；量法已落 `EDIT-HELPERS.md` §7.4，实施席落档时复跑一次。

**失败回执：内容不统一，骨架必须统一**。骨架表与四条判据单源 = `EDIT-HELPERS.md` §7.6「跨工具失败回执骨架」；决策 = `APPLY-PATCH.md` §7 D-P4′。§2 不复制该表（D2），只记本批两工具的填充值：

- `edit` 批面：工具名 `edit batch` · 单位 `entries`（≠ 档）⇒ 接末段 ` — <K> file(s) written` · `M`/`k` 记条目 · `K` = 已写档数。
- `apply_patch`：工具名 `apply_patch` · 单位 `file(s)`（= 档）⇒ 末段省略 · `M`/`k` 记档（`k` 即已落盘档数）。
- 成功行不进骨架：它是业务语，各工具自持。

内容为什么不统一：`edit` 的失败发生在条目（同档多条各自成 ∥ 不成 ⇒ `k/M` 才有意义）；`apply_patch` 的 hunk 面没有部分成功，落盘失败只在档一级 ⇒ 单位词 `file(s)`、`k` 即已写档数。差异全落在填充位里，骨架一格不动。

**`#2233` 的病根 = 全仓没有一张「谁在哪一层写记账表」的表**，本批补上（`EDIT-HELPERS.md` §7.4「记账归属」）：

| 层 | 谁写 | 本仓实例 |
|---|---|---|
| 写点内（`writeThroughPath` 一跳） | 写点自己；调用方只交记录的值 | `edit` 单形态 · `edit` 批面（合并快照作 `record`）· `write` · `insert_after` · `hashline_edit` |
| 调用方自持（不经写点） | 调用方自己调 `markDirty` / `clearLastWrite` / `recordWrite` | `patch.mjs` 批级循环 · ACP 桥三入口 |

按此判，`thincoder-core/tools/` 内**唯一例外 = `apply_patch` 的批级记账** ⇒ `write-path.mjs` 档头那句收回单点、判据与量法写进括注（B3）。量法（结论可复跑）：仓根 `grep -rn "markDirty(\|clearLastWrite(\|recordWrite(" thincoder-core/tools` ⇒ 三档命中（`write-path.mjs` / `patch.mjs` / `file.mjs`），改后仍只有这三档。

### 2.4 受影响文件与测试覆盖

| 档 | 改动 |
|---|---|
| `thincoder-cli/src/acp/buffered-edit.mjs` | 改：`editBatch` 换六段流水线；收尾改调两构造器 |
| `thincoder-core/tools/edit-diff.mjs` | 改：删 `EDIT_ABORT_PREFIX` / `assertEditEntries`；`abortPrefix` 形参链退役。**不新增件**（已贴近 500 行硬线） |
| `thincoder-core/tools/edit-batch.mjs` | 改：收尾改调两构造器（字面量挪走）；`applyLineEdit` 的 prefix 退役 |
| `thincoder-core/tools/patch.mjs` | 改：写盘段回执（已落盘集合 + `inFlight`）+ 记账面（B2） |
| `thincoder-core/tools/write-path.mjs` | 改：档头那句加判据括注（B3） |
| `thincoder-core/tool-docs/apply_patch.md` | 改：描述面两处，逐字见 `APPLY-PATCH.md` §6.2（提示词面属产品代码，实施席落） |
| `test/RTM.md` · `test/rtm/tooling.md` | 增：`CLI 41-2` · 新故事 `CLI 42` 与 `42-1`（产品面，实施席落） |
| 回执构造器新档 · 集成用例新档 ×2 | 增（坐标见下：新档为数十行量级） |
| 设计档三份（`EDIT.md` / `EDIT-HELPERS.md` / `APPLY-PATCH.md`） | 本轮已落 |

**档位结论**：无档跨档。

- `edit-diff.mjs` 本批零增长：两件构造器落新档，正是为不越 500 行硬线。
- 其余改动档均在档内；三个新档都是数十行量级。
- 行数读数不进设计档，读数口令 = `doc_check lines`（卡尺 = countContentLines）。实施后复读：`edit-receipt.mjs` 39 · `edit-batch.mjs` 289 · `edit-diff.mjs` 482 · `patch.mjs` 387 · `write-path.mjs` 265 · `file.mjs` 459 · `buffered-edit.mjs` 217，七档零越线（越硬限 0 · 越软线 0）；`patch.mjs` 与 `buffered-edit.mjs` 的增长来自本批落地的流水线与回执，两档仍在档内。

```text
回执构造器单源 = thincoder-core/tools/edit-receipt.mjs
集成用例新档   = test/integration/acp-bridge-batch-outcome.test.mjs
                 test/integration/apply-patch-write-phase.test.mjs
```

**单元测试**：`docs/batches/2026-11-09-acp-bridge-entry-outcome.test.mjs`，跑 `node --test <该档>`，收口删除（承 2.5 各 AC）。

**集成面（RTM 增量）**：从索引起算，全表见 `EDIT.md` §7。逐行结论：

- `CLI 41-1`（既有，`test/rtm/tooling.md`）不断不冗——它判核 `edit` 批面，本批不动那一面。
- `CLI 41-2` 缺：桥面批量「一条失败只废那一条」的业务结果本批才成立，入口 = ACP 客户端（IDE）。
- `CLI 42-1` 缺（新故事 `CLI 42`）：`apply_patch` 写盘段失败的回执本批才成立，入口 = 真 `apply_patch` 调用。

行号先落 RTM、再写用例标题（用例名逐字带编号）。

### 2.5 验收对照（每条可判）

| AC | 判定（读它即知做没做到） | 回指 |
|---|---|---|
| AC1 | 桥面三档批、第 2 档一条 `old_string` 匹配不到 ⇒ 该行以 `edits[1] — failed: ` 起头、其余两条成功形、缓冲内容只含成功条，末行 `edit batch: 2/3 entries applied, 1 failed — 2 file(s) written: …`；全文零 `no files written` ∥ `nothing written` | `EDIT.md` §5 批量回执行 · §8 D-15/D-16 |
| AC2 | 同一批含一条非对象条目 ⇒ 该条失败且带下标，同批其余条落盘 | `EDIT.md` §5 桥面同口径 |
| AC3 | 行号两条范围重叠 ⇒ 两条互指失败，同档其余条照应用 | `EDIT-HELPERS.md` §7.3 R3 |
| AC4 | 某档 `writeBuffer` 抛错 ⇒ 该档所有条失败、其他档照落；合并快照只计成功条 | `EDIT-HELPERS.md` §7.4 桥记账 |
| AC5 | 全成 ⇒ 桥面回执末行 `edit batch: 3/3 entries applied, 0 failed — 2 file(s) written: a.md, b.md` | `EDIT.md` §8 D-16 |
| AC6 | `apply_patch` 三档补丁第二档**提交段**失败 ⇒ 抛错正文 = 逐档行 + 末行 `apply_patch: 1/3 file(s) applied, 2 failed: a.md`（单位 = 档 ⇒ 无末段）；逐档行含 `modified a.md` ∥ `b.md — failed: <原因原文>` ∥ `not committed c.md`；盘上第一档已改 | `APPLY-PATCH.md` §4 抛出内容（未全成） |
| AC7 | AC6 之后对已落盘档做行号 `edit` ⇒ 护栏拒（该档已 dirty） | `EDIT-HELPERS.md` §7.1 第 6 行 |
| AC8 | **默认（暂存）径**上的写盘段失败、无档落盘 ⇒ 末行 `apply_patch: 0/3 file(s) applied, 3 failed`（`k = 0` ⇒ 清单与末段皆无）、目标档全未动、连坐档写 `not committed`。该例不注入编辑器（`configureWritePath` 不设 `openDoc`） | `APPLY-PATCH.md` §4 两个失败段 |
| AC9 | `grep -rn "EDIT_ABORT_PREFIX\|assertEditEntries\|abortPrefix" thincoder-core thincoder-cli` 零命中 | `EDIT.md` §8 D-17 |
| AC10 | `write-path.mjs` 档头那句带判据与量法括注；`grep -rn "markDirty(\|clearLastWrite(\|recordWrite(" thincoder-core/tools` 仍只有 `write-path.mjs` / `patch.mjs` / `file.mjs` 三档命中 | `EDIT-HELPERS.md` §7.4「记账归属」 |
| AC11 | 两工具失败回执骨架逐字同形：桥面一条失败与 `apply_patch` 一档失败的正文，各按 `^.+ — failed: .+$` 与 `^\S.*: \d+/\d+ \S+ applied, \d+ failed` 两正则判、两侧都命中；末段按单位判——`edit batch` 行命中 ` — \d+ file\(s\) written`，`apply_patch` 行不命中 ` — ` | `EDIT-HELPERS.md` §7.6 |
| AC12 | **注入径那一档已提交** + 紧随其后一档写盘段失败 ⇒ 末行 `k = 1`（已提交档计入）、该档列 `modified`、其后档 `not committed`、正文零 `0/` 字样；该档之后行号 `edit` 被护栏拒 | `APPLY-PATCH.md` §4 注入径 · §7 D-P2 |
| AC13 | RTM 增量落地：`test/rtm/tooling.md` 有 `CLI 41-2` 行与 `CLI 42` 节、`test/RTM.md` 索引列出 `CLI 42`；两条用例档的用例名逐字带编号，`node --test` 全绿 | `EDIT.md` §7 |

判法：AC1–AC8 ∥ AC11 ∥ AC12 由本批单元测试文件各一例判（每例一条业务可观察结果；AC11 一例同时喂两工具、断言同一骨架）；AC9 ∥ AC10 由命令判，改前应不成立（退役符号仍在、括注不在）；AC13 由集成套判，父侧收口跑。

### 2.6 关键决策

| # | 决策 | 落点 |
|---|---|---|
| D-15 | 桥面 = 核面同一口径，两段结构保留不拆 | `EDIT.md` §8 D-15 |
| D-16 | 批级回执文案上提为具名构造器、落新档；桥上补末行汇总行（无宿主能力依据的面差不留） | `EDIT.md` §8 D-16 · 档位见 2.4 |
| D-17 | `EDIT_ABORT_PREFIX` / `assertEditEntries` / `abortPrefix` 退役 | `EDIT.md` §8 D-17 |
| D-P2′ | hunk 面原子 ∥ 写盘面非原子；注入径在暂存段即提交，回执按径分开说 | `APPLY-PATCH.md` §7 D-P2 |
| D-P4′ | **失败回执骨架跨工具统一**：骨架共用、填充物不同，成功行不统一；判据共用（只说盘上实况）；**末段存废由「单位是不是档」定** | `APPLY-PATCH.md` §7 D-P4 · 骨架单源 `EDIT-HELPERS.md` §7.6 |
| B3 | 记账归属表（写点内 ∥ 调用方自持）+ 判据 ⇒ `write-path.mjs` 档头收回单点、判据与量法入括注 | `EDIT-HELPERS.md` §7.4「记账归属」 |
| 集成 | RTM 增量三行：41-1 不动 · 41-2 新 · 42-1 新；行号先进 RTM | `EDIT.md` §7 |

每个分支的依据（真观测 / 可复现失败）：

- **B1 桥面逐条成败**：依据 thincoder-cli/src/acp/buffered-edit.mjs「const applied = applyPlannedEntries(g.content, liveE, order, { path: g.path, scope: "batch", onEntryError: "collect" })」——桥面在盘上就是逐条判定 + 逐条累积；可复现场景 = 同批一条 `old_string` 匹配不到（AC1）。
- **B2 写盘段按实况报**：依据 thincoder-core/tools/patch.mjs「lines.push(editBatchSummary({ tool: "apply_patch", applied: written.length, total: entries.length, unit: FILE_UNIT, filesWritten: written }))」——已落盘档计入 `k` 并逐档列出、未落盘档写 `not committed`；可复现场景 = 三档补丁第 2 档提交段失败（AC6）∥ 暂存径失败（AC8）。
- **B2 注入径已在盘上**：依据 thincoder-core/tools/write-path.mjs「编辑器径无暂存档（即时提交）」∥ thincoder-core/tools/patch.mjs「committedByEditor.add(p.abs)」——该档在暂存段即已提交，回执把它计入 `k`、记账也算它。
- **B2 `not committed` 的场景**：三档补丁、第 2 档 hunk 上下文对不上 ⇒ 第 1 / 3 档未落盘，可复现（失败句逐字 = thincoder-core/tools/patch.mjs「Hunk ${h + 1} in ${path} does not apply」）。
- **B3 唯一例外失准**：依据 thincoder-core/tools/write-path.mjs「唯一例外 = apply_patch 的批级」——判据（谁在哪一层记账）全仓无表，故这句每落一处要重判一次。
- **D-P4′ 骨架统一**：依据 §1 用户 2026-11-09 12:58 原话「格式为什么不统一？又不是内容统一。」

### 2.7 上抛项

1. **[已闭合]** 需求档 `docs/core/requirements/TOOLS.md` §4.2 **F17** 的末段已按条件形落盘：正文写 `<单位>` ≠ 档时才接 ` — <K> file(s) written`，判定句写末段按单位判（`edit batch` 行命中该段、`apply_patch` 行不命中 ` — `）。
2. **[知会]** 描述面 `thincoder-core/tool-docs/apply_patch.md` 属产品代码，本批只落逐字落点（`APPLY-PATCH.md` §6.2），由实施席落。

### 2.8 评审第 2 轮尾项就地修（2026-11-09）

第 2 轮 `VERDICT: pass`，剩 3 🟡 + 1 🔵，父侧裁定实施前就地修。本轮只动设计档——不动代码、不动需求档、不动用例档；未发评审。

| 项 | 修法 | 落点 |
|---|---|---|
| 🟡① 例子写死失败档路径 | 第 1 / 3 档各写自己的 `  not committed a.md` ∥ `  not committed c.md`，不再拿失败档的 `b.md` 代三档（「同形的自己一行」那句一并去掉——它与所引字面量互相矛盾） | `APPLY-PATCH.md` §4「`not committed` 的场景」 |
| 🟡② 验收指针指错档 | 指到本档内可解的落点：契约面 = `EDIT.md` §5 ∥ §7，验收面 = 需求条目 `F16` ∥ `F17`；三类判据面（单测 ∥ 命令 ∥ 集成）各说一句。**未按派单字面写「批档 §2」**——那形属引用方向纪律的禁引族，见下方「② 的偏离」 | `EDIT.md` §7 末段 |
| 🟡③ D-14 留过期计数结论 | 「`edits[` 文案命中只有一处」换成实况：两件分居两档（`edit-diff.mjs` 的 `editsEntryError(i)` ∥ `edit-batch.mjs` 收尾的 `edits[${i}] — failed:`），并存不归一；「本批新立」措辞随之去掉（它与同格「不新造文案」互斥） | `EDIT.md` §8 D-14 |
| 🔵④ 构造器归属含糊 | 拆成「逐条失败行 ← `editEntryFailureLine(i, reason)`」∥「汇总行与其 `<K> file(s) written` 计数 ← `editBatchSummary(...)`」，两个构造器各领各的，与 `EDIT-HELPERS.md` §7.4 同口径 | `EDIT.md` §5「守卫与文案单源」 |

**🟡② 的偏离（请父侧裁）**：派单的改法是「点名 AC 住在批档 §2」。该形与 `DOC-DISCIPLINE.md` 的「D4 细则二（引用方向——用户裁定）」条相抵——原句逐字「**规范档禁引批档及其单元测试档（含历史行）**」∥「**处置 = 删引用片段，不是改指别处**」，阈值 0、存量无豁免；同档「验收四条」的判据② 扫描族 `(批档|批次档|各批|板档)[^\n]{0,30}?(§\s*[\d.]+)` 正好捕获「批档 §2」这一形，而机检对裸「批档 §N」不判 ⇒ 只有人工扫面能拦住。

故落成「在 `EDIT.md` 内可解」的形：契约面指本档 §5 ∥ §7、验收面指需求条目 `F16` ∥ `F17`。**同句原本还写死了一个单元测试档的具名路径**，同属该禁引族（同条逐字「及其单元测试档」），一并改成惯例形（住批次档目录、名随该档），与 `DOC-DISCIPLINE.md` 的「设计档不写死它的路径（实施轮建档才上盘，写死即一条悬空锚）」句同口径。

父侧若坚持写批档指针，那是改写那条用户裁定，须另裁——本轮不自行越权。另：原句的 `AC1–AC11` 与 §2 的 AC 表（AC1–AC13）本就不对号，改后本档不再携 AC 编号，该计数问题随之消失。

**🟡③ 的读数**（`edits[` 起头文案在盘实况；口令 = `grep -rn "edits\[" thincoder-core/tools`）：

```text
thincoder-core/tools/edit-diff.mjs:54    export const editsEntryError = (i) => `edits[${i}] must be an object of …`   ← 入参成形错
thincoder-core/tools/edit-batch.mjs:166  results[i] = `edits[${i}] — failed: ${s.reason}`                            ← 逐条失败行
thincoder-core/tools/edit-batch.mjs:160  （注释里引同一句回执形，非文案）
thincoder-core/tools/edit-batch.mjs:52   const e = args.edits[i]                                                     ← 下标访问
thincoder-core/tools/edit-diff.mjs:163   const e = edits[i]                                                          ← 下标访问
```

⇒ 起头文案两件、分居两档；本批不新增第三件（逐条失败行是把 `edit-batch.mjs` 那件提成构造器，不新造文案）。

**门检**：`doc_check(mode:"gate")` 对 `EDIT.md` · `APPLY-PATCH.md` · `EDIT-HELPERS.md` 三档 ⇒ `DOC-CHECK GATE: PASS`（0 段有问题）。

### 2.9 同族引用扫查与就地清（2026-11-09，评审后尾项）

父侧 13:23 裁定：D4 细则二（引用方向）阈值 0，规范档禁引批档。本轮只做扫查 + 就地删片段——不动代码、不动需求档、不动用例档、不新增语义、未发评审。

**扫查族（三族，三档全扫）**：① `批档 §N` ∥ `批次档 §N` ∥ `各批…§`；② 批档目录下的路径（`docs/batches/…`，含 `.test.mjs`）；③ 把批档当出处注的「先例 = batch X §N」形。

| 档 | 引用族命中 | 处置（逐处） |
|---|---|---|
| `docs/core/design/EDIT.md` | **1** | §6「档位结论」第 3 条：删「，本轮值留在批档 §2」——保留规则句「行数读数不进本档：读数口令 = `doc_check lines`」。纯删减，未改指别处（处置 = 删引用片段）。 |
| `docs/core/design/APPLY-PATCH.md` | **0** | 族外另清 1 处修订式表述：§7.1 表末整行删「本档旧文引过一句回执 `<C> of <N> file(s) committed` 作先例——…已删：无坐标的先例等于编的。」——主语是被删掉的文字，属规范面 corpse mark（D8），规则本体已在 §7.1 三问表内成立，故整行删、不补坐标。**此项超出父侧点名的三族，单独列出供父侧复核。** |
| `docs/core/design/EDIT-HELPERS.md` | **0** | 无需处置。 |

**改后复扫读数**（口令 = `grep` 三档，族 = `批档|批次档|各批|docs/batches|本轮值|旧文|上一版|已删`）：

- `EDIT.md` 余 1 处 = §7「档按惯例住批次档目录、名随该档（同名 + `test` + `.mjs`），本档不写死它的路径」——**约定形，非引用**（父侧 13:23 已认这一落法：只写惯例、不写路径）。
- `APPLY-PATCH.md` 余 0 处。
- `EDIT-HELPERS.md` 余 2 处，均非引用族：§7.3「副本已删」= 现存结构事实（桥无第二份组循环）；§7.4 表内 `thincoder-core/agent-tools/batch.mjs`（批档直写）= 代码坐标，不是对批档的出处注。
- 另两族零命中：批档目录路径 `docs/batches/…` 三档皆无；`.test.mjs` 命中全在 `test/integration/…`（产品面集成用例坐标）；「先例 = batch X §N」形无一处——全部先例注给的是代码坐标或设计档小节（`edit-batch.mjs` 的 `applyEditBatch` · `patch.mjs` 的 `applyPatchTool` · `edit-diff.mjs` 的校验词汇 · `file.mjs` 的 `insertAfterTool.execute` · `APPLY-PATCH.md` §4 ∥ §6.1），无一处指批档。

**门检**：`doc_check(mode:"gate")` 对 `EDIT.md` · `APPLY-PATCH.md` · `EDIT-HELPERS.md` 三档 ⇒ `DOC-CHECK GATE: PASS`（范围 3 档，0 段有问题）。

**设计内容零变**：删除的两处都不携带机制语义——一处是回执读数的存放坐标，一处是被删先例的墓碑；§2.1–§2.8 的条目、机制、AC、档位结论一律不动。

### 2.10 文档翻正（实施落地后，2026-11-09）

代码已落地（§5），三份设计档里一批**现状句仍停在改前**——「桥面今日未落」「该 `catch` 只抛裸 `rename`」这类句子在盘上已是假话。本轮按盘上实况翻正：不动代码、不动需求档、不动用例档、未发评审（§3 已 pass，这是翻正不是新语义）。

| # | 修法 | 落点 |
|---|---|---|
| ① | 构造器第一参 = **定位串**：`editEntryFailureLine(label, reason)`。两工具的定位天然不同（`edits[<i>]` ∥ `<path>` / `<path> hunk <n>`），按下标收只有 `edit` 填得进，`apply_patch` 就只好再写一份 `— failed: ` 字面量 | `EDIT.md` §5 ∥ §6 · `EDIT-HELPERS.md` §7.4 ∥ §7.6（理由写在骨架单源处） |
| ② | 桥面现状句翻正：整批拒 → 六段流水线 + 汇总行；`assertEditEntries` 退役句、`D-14` 里形参链的现在时、`APPLY-PATCH.md` §6.1 三行「未落 / 部分在位」一并翻正 | `EDIT.md` §6 ∥ §8 D-14 · `APPLY-PATCH.md` §6.1 |
| ③ | `apply_patch` 失败面的标题：`返回值（未全成）` → `抛出内容（未全成）`——本工具失败走抛错面，回执在抛出文本里 | `APPLY-PATCH.md` §4 · 本段 AC6 的回指 |
| ④ | 本段 2.6 两处「依据」引文随改码消失（`onEntryError: "throw",` ∥ `throw renameError`），换成盘上现存的两句，并把复现场景指到 AC。**父侧派单说这两行是「超长段落」，实测是引文锚失效（机检报引缺），修法因此不同** | 本段 2.6 |
| ⑤ | 2.4 的行数读数按实施后复读更新；档位结论仍「无档跨档」 | 本段 2.4 |

同批翻正的两处**同族标准**：`EDIT.md` §7 三条 RTM 行的「今日整批拒 / 今日只抛裸 `rename`」理由句（同一条失效模式）、`APPLY-PATCH.md` §6.2 与 §6.3 的先例句（指向构造器现状，而非改前字面量）。

**门检**：`doc_check(mode:"gate")` 对 `EDIT.md` · `APPLY-PATCH.md` · `EDIT-HELPERS.md` 三档 ⇒ `DOC-CHECK GATE: PASS`（3 档全清）；本批档 `report` 态复扫 ⇒ 0 条命中（改前 2 条引缺随 ④ 清掉）。

**未动面**：需求档 `F17` 已由主 agent 同轮按条件形落盘（末段 ` — <K> file(s) written` 只在单位 ≠ 档时接，判定句按单位判），2.7 第 1 条的上抛因此已闭合；`APPLY-PATCH.md` §4 里「本批要灭的那句假话」保留——它说的是规则的目的（回执不许说批级谎），不是已失效的现状句。

## §3 设计评审（评审子代理）
**状态行**：评审通过



### 轮次 1（评审子代理）

| # | 严重度 | 状态 | 证据 |
|---|---|---|---|
| 1 | 🔴 | 未决 | APPLY-PATCH.md §4「暂存段失败 ⇒ 目标档全未动」∥「`k = 0`（暂存段失败）同一形」 vs `thincoder-core/tools/write-path.mjs` 的 `tryInjectedPath`（「**注入径例外**：编辑器径无暂存档（即时提交）」）+ `thincoder-core/tools/patch.mjs` 的 `committedByEditor` —— 注入径下一档已提交、回执仍报 k=0 |
| 2 | 🔴 | 未决 | EDIT.md D-14「`entries applied` ∥ `file(s) written` 在 `thincoder-core/**` 无命中」vs 同档 §6「批量逐条回执 … 已落（失败行 ∥ 汇总行均为 `applyEditBatch` 收尾的字面量）」+ `thincoder-core/tools/edit-batch.mjs` 的汇总行与 `edits[${i}] — failed:` 字面量 —— 同一机制两处说法相反 |
| 3 | 🔴 | 未决 | 三档皆无起始于 `test/RTM.md` 的集成测试设计节、亦无验收判据；唯一指针 = EDIT-HELPERS.md §7.3「用例 = 本批 AC10」（本审对象内解析不到） |
| 4 | 🔴 | 未决 | 三档无受影响文件档位结论；`thincoder-core/tools/edit-diff.mjs` 实读 499 行，本批再收 `editEntryFailureLine` ∥ `editBatchSummary` ⇒ 越 500 行档，无拆分计划（其余：edit-batch 290 / patch 312 / write-path 262 / file 460 / buffered-edit 144 均不越档） |
| 5 | 🔴 | 未决 | APPLY-PATCH.md §4「未提交且没有自身原因的档 `  not committed <path>`」∥ §7 D-P4 —— 该分支既无引述实况、也无复现径（6b） |
| 6 | 🟡 | 未决 | APPLY-PATCH.md §6.1「今日该 `catch` 只清 `.tmp` 后 `throw renameError`」—— 已提交集合的追踪未落设计（提交循环今日不记谁提交成功） |
| 7 | 🟡 | 未决 | EDIT-HELPERS.md §7.4 末段只保留「唯一例外 = `apply_patch`」措辞，既有括注「两段式全部成功后由调用方一次 `markDirty`」被 APPLY-PATCH.md §4「成功路径与失败路径同」证伪 |
| 8 | 🟡 | 未决 | EDIT-HELPERS.md §7.4「上一版把它列进「不写」是拿 `diff` 的宿主理由去挡它」—— 规范面残留修订式表述 |
| 9 | 🟡 | 未决 | 先例行 ∥ 调研证据行只在 EDIT.md §6（「批量落盘的做法与先例」「公开源调研证据」）；APPLY-PATCH.md ∥ EDIT-HELPERS.md 对本批三笔零 |
| 10 | 🟡 | 未决 | APPLY-PATCH.md 的 `not committed <path>` ∥ 末行骨架无三问答案；D-P4 的旧回执 `<C> of <N> file(s) committed` 无落点坐标 |
| 11 | 🟡 | 未决 | 跨工具骨架表住 EDIT.md §5「骨架权威」，而 EDIT-HELPERS.md 自述「编辑工具族共享 helper 语义的**唯一权威**」；F17 同口径另存（本审排除，无法核） |
| 12 | 🔵 | 未决 | EDIT-HELPERS.md §7.4 量法缺 `recordWrite(` —— 今日核内仅写点自调，结论仍真 |
| 13 | 🔵 | 未决 | EDIT.md 节序「## 6. 实现单一权威」→「## 8. 并入的关键决策记录」，无 §7 |

VERDICT: changes-required

计数：🔴 5 · 🟡 6 · 🔵 2

### 轮次 2（评审子代理）

| # | 严重度 | 状态 | 证据 |
|---|---|---|---|
| 1 | 🔴 | 已修 | `docs/core/design/APPLY-PATCH.md` §4「所以「一个档都没动」只在**默认（暂存）径**上成立」+「回执必须把它们计进 `k` 并逐档列出」；§1「注入径是写盘面的第三态」 |
| 2 | 🔴 | 已修 | `docs/core/design/EDIT.md` §8 D-14「三件在盘上**已存在，但只是 `thincoder-core/tools/edit-batch.mjs` 收尾的字面量**」——与 §6「已落」同源 |
| 2r | 🟡 | 未修 | 同格残留「`edits[` 的**文案**命中只有一处 = `thincoder-core/tools/edit-diff.mjs` 的 `editsEntryError`」与前句「已存在，但只是字面量」互斥 |
| 3 | 🔴 | 已修 | `docs/core/design/EDIT.md` §7「集成测试设计（RTM 增量）」三行表（组件交互 ∥ 断言什么业务结果 ∥ 用户可见入口 ∥ 回指）+「跑 `node --test <该档>`」 |
| 4 | 🔴 | 已修 | `docs/core/design/EDIT.md` §6「**档位结论（本批）**：无档跨档」+「两件批级回执构造器落一个新档」+「读数口令 = `doc_check lines`」 |
| 5 | 🔴 | 已修 | `docs/core/design/APPLY-PATCH.md` §4「**`not committed` 的场景（可复现）**」两分支（hunk 段 ∥ 写盘段） |
| 6 | 🟡 | 已修 | `docs/core/design/APPLY-PATCH.md` §6.1「本批新增 `committed` 集合，并在每次写调用前把当前档记进 `inFlight`」 |
| 7 | 🟡 | 已修 | `docs/core/design/EDIT-HELPERS.md` §7.4「两段式结束后由调用方一次 `markDirty` + `clearLastWrite`，对已落盘档跑——成功 ∥ 失败两路同」 |
| 8 | 🟡 | 已修 | `docs/core/design/EDIT-HELPERS.md` §7.4「与那三样不同源」——「上一版把它列进「不写」」已删 |
| 9 | 🟡 | 已修 | `docs/core/design/APPLY-PATCH.md` §6.3「本批先例（写盘段回执）」+「公开源调研证据」；`docs/core/design/EDIT-HELPERS.md` §7.6「先例与调研」 |
| 10 | 🟡 | 已修 | `docs/core/design/APPLY-PATCH.md` §7.1 三问表（`existing:` ∥ `none found:` ∥ 复用 `editBatchSummary`） |
| 11 | 🟡 | 已修 | `docs/core/design/EDIT-HELPERS.md` §7.6「骨架为何住在本档」+ 表体三行填充位 |
| 12 | 🔵 | 已修 | `docs/core/design/EDIT-HELPERS.md` §7.4 量法已含 `recordWrite(` |
| 13 | 🔵 | 已修 | `docs/core/design/EDIT.md` 节序 §6 → §7 → §8，断号消失且外部「见 §7」引用可落 |
| N1 | 🟡 | 新 | `docs/core/design/APPLY-PATCH.md` §4「第 1 / 3 档各 `  not committed b.md` 同形的自己一行」与同节「未落盘且没有自身原因的档 `  not committed <path>`」互斥 |
| N2 | 🟡 | 新 | `docs/core/design/EDIT.md` §7「各例回对 §2 的 AC1–AC11」——本档 §2 = 「参数与 schema」，AC 不在其中 |
| N3 | 🔵 | 新 | `docs/core/design/EDIT.md` §5「三件…单源 = 构造器 `editBatchSummary(...)`」与 `docs/core/design/EDIT-HELPERS.md` §7.4「失败条…与核同一构造器 `editEntryFailureLine`」口径不一 |

计数：未决 🔴 0 · 🟡 3 · 🔵 1 · 已修 13

VERDICT: pass

## §4 用户批准（主 agent）

**用户批准（2026-11-09 12:53 ∥ 12:58）**

**口径原话两句**：

1. 「端侧也要改。」——ACP 桥面由「全过才写」改为逐条成败。
2. 「格式为什么不统一？又不是内容统一。」——失败回执**骨架跨工具逐字同形**，内容各工具不同；这句同时驳掉了我先前「两个工具各写各的」的判断。

**授权面**：① 桥面逐条成败；② `apply_patch` 提交段按盘上实况报已提交档（`#2232`）；③ `write-path.mjs` 那句「唯一例外」按实况收（`#2233`）；④ 需求面 F16 边界纠正 + 新增 F17（父侧同轮落）；⑤ 实施 + 收口 + 三行核销。

**未授权、已挂账**：`anthropic-tool-roundtrip` 的既有红（`#2235`）——与本批无交集，未动。

## §5 实施记录（eng-coder）

### 5.1 实施总览（三笔覆盖）

| 条目 | 结果 | 落点与做法 |
|---|---|---|
| B1 桥面批量编辑改逐条成败 | ✅ | `thincoder-cli/src/acp/buffered-edit.mjs` 的 `editBatch` 换成与 `applyEditBatch` 同一条六段流水线：容器守卫整批拒 → 分组（条目级失败不进组）→ 逐档读缓冲（读不到连坐该档）→ 行号锚护栏逐条判 → 帧排 + `onEntryError:"collect"` 累积 → 有 ≥1 条成功的档写缓冲一次并记合并快照。两段结构保留不拆（`readBuffer` / `writeBuffer` 是 IDE 缓冲，不是暂存区） |
| B2 `apply_patch` 写盘段按盘上实况报 | ✅ | `thincoder-core/tools/patch.mjs`：阶段一收进 `planFiles`（hunk 段失败也走同一套回执，失败档带 hunk 序）；阶段二新增 `committed` 集合与 `inFlight`，`catch` 组逐档行 + 末行随错误抛出；记账对已落盘档跑，成功 ∥ 失败两路同（注入径那批在内） |
| B3 `write-path.mjs` 档头收回单点 | ✅ | `thincoder-core/tools/write-path.mjs` 档头保留「唯一例外 = apply_patch 的批级记账」，补判据（谁在哪一层写记账表）与量法括注 |
| 回执构造器新档 | ✅ | `thincoder-core/tools/edit-receipt.mjs`：`editEntryFailureLine` ∥ `editBatchSummary` ∥ `FILE_UNIT`；末段存废由「报单位是不是档」定 |
| 退役面（D-17） | ✅ | `EDIT_ABORT_PREFIX` ∥ `assertEditEntries` ∥ `abortPrefix` 形参链三处拼接全删；`scope:"batch"` 开关保留（还压 ` — nothing written` 后缀） |
| 描述面 | ✅ | `thincoder-core/tool-docs/apply_patch.md` 两处按 `APPLY-PATCH.md` §6.2 逐字落（`all-or-nothing` 改句 + 四条 bullet） |
| 集成面 | ✅ | `test/RTM.md` 增 `CLI 42` 故事行；`test/rtm/tooling.md` 增 `41-2` 行与 `CLI 42` 节（`42-1`）；两档集成用例新建，批档单测同一批新建 |

**改动档 = 11 档，全部在 §2.4 清单内（无清单外改动）**：

- 代码面：`thincoder-core/tools/edit-receipt.mjs`（新）· `edit-diff.mjs` · `edit-batch.mjs` · `patch.mjs` · `write-path.mjs` · `thincoder-cli/src/acp/buffered-edit.mjs`
- 描述面：`thincoder-core/tool-docs/apply_patch.md`
- 集成与用例面：`test/RTM.md` · `test/rtm/tooling.md` · `test/integration/acp-bridge-batch-outcome.test.mjs`（新）· `test/integration/apply-patch-write-phase.test.mjs`（新）· 批档单测档（新，收口删）

### 5.2 决策披露（设计未写死、实施时定了的三处）

| # | 事项 | 取舍 | 依据 |
|---|---|---|---|
| I1 | 失败行构造器的第一个形参 | 设计档两处写 `editEntryFailureLine(i, reason)`；实现取 `(label, reason)`——第一参是**定位串**：`edit` 批面传 `edits[<i>]`，`apply_patch` 传 `<path>` ∥ `<path> hunk <n>` | 骨架子句是 `<定位> — failed: <原因原文>`，两工具的定位坐标本就不同；按下标实现则 `apply_patch` 填不进这一格，只能再写一份 `— failed: ` 字面量，正违反「填骨架、不新造形状」。设计档 §5 ∥ §6 那两处签名需设计席同轮正形（见 5.4） |
| I2 | 已落盘集合的身份判据 | 判落盘用绝对路径（`committed` 集合），回执里的顺序与拼写取 `path`、按补丁序；同一路径在补丁里出现两次时按条目计 | 设计只说「已落盘集合 = 注入径已提交 ∪ 提交段 rename 成功」，未点重复路径这一形；病态输入不另立规则 |
| I3 | `planFiles` 抽出与 hunk 序的携带 | 阶段一抽成模块内函数（`inFlight` 由回调带出）；hunk 段失败的 hunk 序由错误对象的 `hunkNumber` 属性携带 | 错误对象本来只有文本、不带路径与档名；`catch` 靠 `inFlight` 点名失败档、靠 `hunkNumber` 组 ` hunk <n>` 定位，不去解析文案。行为不变（原 `applyHunks` 三处 throw 文案逐字保留） |

另有一处**行为变化**随 I3 落地、须记账：`apply_patch` 的 hunk 段失败从「抛裸 hunk 错误」变成「抛逐档回执 + 末行」。
这是设计 §4「两个失败段，同一套回执」要求的，不是顺手改。

### 5.3 验收对照（AC1–AC13 逐条读数）

| AC | 结论 | 读数（命令 ∥ 断言） |
|---|---|---|
| AC1 | ✅ | 批档单测 AC1 例：失败行以 `edits[1] — failed: ` 起头、另两条成功形、缓冲只含成功条、末行逐字 `edit batch: 2/3 entries applied, 1 failed — 2 file(s) written: …`、全文零 `nothing written` ∥ `no files written` |
| AC2 | ✅ | 同上 AC2 例：非对象条目 `edits[0] — failed: edits[0] must be an object of …`，同批另条落盘 |
| AC3 | ✅ | 同上 AC3 例：两条重叠互指（`L2-L3` ∥ `L3-L4`）、各一行、同档第三条照应用 |
| AC4 | ✅ | 同上 AC4 例：`writeBuffer` 抛错只连坐该档；合并快照 `lastWriteOf` = `{ type: "edit", startLine: 4, shift: -1 }`（只计成功条） |
| AC5 | ✅ | 同上 AC5 例：末行 `edit batch: 3/3 entries applied, 0 failed — 2 file(s) written: …`，同档两条只写回一次 |
| AC6 | ✅ | 同上 AC6 例：提交段失败 ⇒ `  modified …` ∥ `<path> — failed: <rename 原因原文>` ∥ `  not committed …` + 末行 `apply_patch: 1/3 file(s) applied, 2 failed: …`；盘上第一档已是新内容 |
| AC7 | ✅ | 同上 AC7 例：AC6 之后对已落盘档做行号 `edit` ⇒ 拒文首句 `this file was modified since your last read`（§7.1 第 6 行） |
| AC8 | ✅ | 同上 AC8 例（不注入编辑器）：写前文档门拒 ⇒ `apply_patch: 0/3 file(s) applied, 3 failed`、无清单无末段、两侧目标档逐字未动、连坐档 `not committed` |
| AC9 | ✅ | 同上 AC9 例走文件树扫 `thincoder-core` ∥ `thincoder-cli` 的 `.mjs`/`.js`：三个退役符号零命中（唯一残留 = 单测档自身的扫描串，收口随档删除） |
| AC10 | ✅ | 同上 AC10 例：档头带「唯一例外 = apply_patch 的批级」+ 判据句 + 量法 grep 行；同尺复跑命中档集 = `file.mjs` ∥ `patch.mjs` ∥ `write-path.mjs` |
| AC11 | ✅ | 同上 AC11 例同时喂两工具：两侧失败行命中 `^.+ — failed: .+$`、末行命中 `^\S.*: \d+/\d+ \S+ applied, \d+ failed`；末段按单位判（`edit batch` 行命中 ` — <K> file(s) written`，`apply_patch` 行不含 ` — `） |
| AC12 | ✅ | 同上 AC12 例：注入径那档已提交 ⇒ `modified` 且计入 `k`、其后的档 `not committed`、正文零 `0/` 字样、末行 `apply_patch: 1/3 file(s) applied, 2 failed: …`；随后行号 `edit` 被护栏拒 |
| AC13 | ✅ | `test/rtm/tooling.md` 有 `41-2` 行与 `CLI 42` 节、`test/RTM.md` 索引有 `CLI 42` 行；两档用例名逐字带编号（`CLI 41-2 …` ∥ `CLI 42-1 …`）；`node --test` 两档全绿（见 5.5 读数） |

**额外一例**（设计 §4 要求、AC 表未单列）：hunk 段失败的整套回执——失败档 `<path> hunk 1 — failed: …`、其余档 `not committed`、末行 k = 0、盘上零字节。

### 5.4 设计档漂移（交父侧路由；实施席未改设计档）

代码是对的，设计档几处「今天在盘是什么」比实现慢一拍：

1. `docs/core/design/EDIT.md` §5「守卫与文案单源」与 §6「批量逐条回执」行把构造器签名写成 `editEntryFailureLine(i, reason)`——盘上是 `(label, reason)`（见 5.2 I1）。按档面字面实施会把 `apply_patch` 印成 `1 — failed: …`，与 `EDIT-HELPERS.md` §7.6 的定位表相反。
2. 同档 §6 的落位列仍报改前实况（该列自述「= 该机制今天在盘的是什么」）：入参守卫行「未落（本批 D-17 退役：`assertEditEntries` 今日仍在…）」· 批量回执汇总行「桥面今日不写汇总行」· 正文「**桥面今日未落**：… 仍 `assertEditEntries` 整批拒 + `onEntryError:"throw"` + `abortPrefix`（本批改）」。三句现均为假：桥面走 `assertEditsContainer` + `onEntryError:"collect"` + `scope:"batch"`，且**写了**汇总行。
3. 同档 §8 D-14 的理由列用现在时描述已退役的形参链（`rich: !opts.abortPrefix` ∥ `applyPlannedEntries` 默认 `abortPrefix`）；同格后半句又说它已随 D-17 退役 ⇒ 一格之内两说。
4. `docs/core/design/APPLY-PATCH.md` §6.1 三行的「实核」列同属时点陈述：写盘段回执行「未落（本批）——今日该 `catch` 只清 `.tmp` 后 `throw renameError`」· 批级记账面行「部分在位（今日只在全成路径跑）」· 注入径行「本批把它计入回执与记账」。三句现均为过去。

处置建议：由设计席一轮扫面把四条现状句按盘上实况翻正（第 2 条尤其要紧——它会让下一个读者得出「桥还是全过才写」的反结论）。
**实施席不动设计档**：本批 §2.4 把三份设计档标为设计席本轮已落，笔域不在此。

### 5.5 实施席自检轮次与本轮读数

- **轮次 1 自省探针**：核批面 ∥ 桥面 ∥ `apply_patch` 三面各跑一条真调用，确认回执三形与盘上/缓冲实况一致；另跑「改前形状」反证——同一输入喂 `onEntryError:"throw"`，抛出的正文里没有逐条失败行 ⇒ AC1 判据在改前确实读红。
- **轮次 2 内部审计（explore 只读）**：13 条 AC 逐条对盘，结论「12 条可从盘上直接判成、AC13 的全绿读数因审计装配无执行工具而未能复跑」；报 0 处清单外改动、0 处静默简化；报 7 处设计档漂移（与本段 5.4 同源）。
- **轮次 3 代码评审（advisor，`type:"code"`）**：`VERDICT: pass`；3 🟡（全部为设计档现状句滞后，非代码缺陷）∥ 3 🔵。
- 到手即改的一项：`edit-batch.mjs` 注释里引批档 §2 与会话时间的出处注，已换成 `EDIT.md` §5 ∥ §8 两个设计坐标（D4 细则二同族失效模式）。
- 其余 🔵 处置：测试制造提交段失败的手法（目标档换成目录，靠 `rename` 落目录必败）在用例注释里已写明平台假设与复现径，保留现状；提示词面首行「atomically」按 `APPLY-PATCH.md` §6.2 要求逐字保留。
- **终态**：`clean`（无 🔴、无未处理 🟡；3 🟡 均为设计档笔域，转父侧路由）。

**读数（口令与结论）**：

```text
node --test docs/batches/2026-11-09-acp-bridge-entry-outcome.test.mjs  → 13 tests, 13 pass, 0 fail
node --test test/integration/acp-bridge-batch-outcome.test.mjs         → 2 tests, 2 pass
node --test test/integration/apply-patch-write-phase.test.mjs          → 1 test, 1 pass
node --test test/integration/edit-batch-entry-outcome.test.mjs         → 1 test, 1 pass（既有 41-1 未被本批打破）
node test/run.mjs（整套集成层）→ 176 pass / 3 fail：3 条 fail 全在 anthropic-tool-roundtrip.test.mjs，
  正文 "context overflow: prompt ~99026 tokens … [model claude-fake-1]"（模型 id 不在 MODEL_SPECS），
  与本批改动面无交集，属工作树中其他批未提交改动带来的既有红
grep「EDIT_ABORT_PREFIX|assertEditEntries|abortPrefix」thincoder-core thincoder-cli → 源码零命中
  （余下命中只在 docs 与 thincoder-desktop 的 dist 打包产物）
doc_check(mode:"gate", docs=[test/RTM.md · test/rtm/tooling.md · thincoder-core/tool-docs/apply_patch.md])
  → DOC-CHECK GATE: PASS（3 档全清）
```

集成面归属：两档新用例住在仓根 `test/integration/`，父侧收口跑整套时在收集面之内；本段只报实施席自己跑过的读数。

## §6 验证与收口（父代理）

**交付面（三笔）**

- `#2234` ACP 桥面 `thincoder-cli/src/acp/buffered-edit.mjs`：六段流水线（容器守卫整批拒 → 分组 → 逐档读缓冲 → 逐条行号锚护栏 → 帧排 + `onEntryError:"collect"` → 有成功条的档写回一次）+ 末行汇总；`readBuffer` / `writeBuffer` 两段结构保留（IDE 缓冲，不是暂存区）
- `#2232` `thincoder-core/tools/patch.mjs`：提交段按盘上实况报已落盘档（`committed` 集合 + `inFlight` 点名失败档），hunk 段与写盘段同一套回执；记账对已落盘档跑，成功 ∥ 失败两路同（注入径已提交那批在内）
- `#2233` `thincoder-core/tools/write-path.mjs` 档头：「唯一例外 = `apply_patch` 批级记账」保留并补判据与量法括注
- 新增档 `thincoder-core/tools/edit-receipt.mjs`：`editEntryFailureLine(label, reason)` ∥ `editBatchSummary(...)`，两工具同调、零字面副本；末段 ` — <K> file(s) written` 的有无由「报单位是不是档」定
- 退役：`EDIT_ABORT_PREFIX` ∥ `assertEditEntries` ∥ `abortPrefix` 形参链全删，源码零命中
- 文档：`thincoder-core/tool-docs/apply_patch.md` 描述面按设计 §6.2 逐字落；`test/RTM.md` 新故事 `CLI 42` + `CLI 41-2` ∥ `test/rtm/tooling.md`

**父侧独立验证（自跑探针，不复用实施席用例）**

```text
A 核批面：edits[1] 的 old_string 匹配不到
  → edits[1] — failed: old_string not found in b.txt（带 searched ∥ hints）
  → edit batch: 2/3 entries applied, 1 failed — 1 file(s) written: a.txt
  → b.txt 字节未动，a.txt 两条都落

B apply_patch：三档补丁，第 2 档 hunk 上下文对不上
  → apply_patch: 0/3 file(s) applied, 3 failed
  → "  not committed p1.txt" ∥ "p2.txt hunk 1 — failed: … context not found" ∥ "  not committed p3.txt"
  → p1/p2/p3 三档全部未动（hunk 段失败 ⇒ 一个字节没写）
```

**两侧骨架并排读**：`<定位> — failed: <原因原文>` ∥ `<工具名>: <k>/<M> <单位> applied, <M−k> failed` **逐字同形**；`apply_patch` 单位 = 档 ⇒ 末段省略（`edit` 侧保留 ` — <K> file(s) written`）。**两态读数互不相同**：失败行只出在失败的那一条，成功条仍是原成功回执。

**假话扫描**：`nothing written` ∥ `no files written` 在 `edit-receipt.mjs` ∥ `patch.mjs` ∥ `edit-batch.mjs` ∥ `buffered-edit.mjs` 四个落点**只命中 1 处注释**（`edit-batch.mjs` 说明该后缀「取废由 `validateEditEntry` 决定」），**回执面零命中**。

**测试**

- 收口跑：`node --test` 本批单测档 + 三档集成 ⇒ **tests 17 · pass 17 · fail 0**。
- 本批单元测试档 **跑完已删**（父侧 `delete` 落盘）；读数留本节。
- 集成集：`CLI 41-1`（既有，未被打破）∥ `CLI 41-2`（新，2 例）∥ `CLI 42-1`（新，1 例）。
- **整套 `node test/run.mjs` = 176 pass / 3 fail**，三红全在 `test/integration/anthropic-tool-roundtrip.test.mjs`，父侧单跑复现，正文 = `context overflow … [model claude-fake-1]`。该档**未被本批或任何未提交改动碰过**（`git status` 零输出），失败点在模型窗规格解析 ⇒ **与本批写入工具面无交集，属既有红**，已挂 `#2235`。

**文档门**：`doc_check(mode:"gate")` 对 `docs/core/design/EDIT.md` ∥ `docs/core/design/APPLY-PATCH.md` ∥ `docs/core/design/EDIT-HELPERS.md` = `PASS`（3 档全清）；批档 `report` 面命中 0（改前 2 条引缺已清）。

**档位**：`doc_check(lines)` 复读七档——`edit-receipt.mjs` 39 ∥ `edit-batch.mjs` 289 ∥ `edit-diff.mjs` 482 ∥ `patch.mjs` 387 ∥ `write-path.mjs` 265 ∥ `file.mjs` 459 ∥ `buffered-edit.mjs` 217；越硬限 0 · 越软线 0，`edit-diff.mjs` 本批零增长。

**残留（挂账，另批清）**

- `#2235` `anthropic-tool-roundtrip` 既有红（与本批无关）。
- `APPLY-PATCH.md` §4「印 `0/N file(s) applied` 就是本批要灭的那句假话」保留——它说的是规则的目的（回执不许说批级谎），不是失效的现状句。

**收口判据**：用户 12:53「端侧也要改」+ 12:58「格式为什么不统一？又不是内容统一」；设计面两轮评审 `pass`（第 2 轮取票）+ 两轮尾项就地清；实施面代码评审 `pass`；父侧两条探针实测骨架同形且两态读数互不相同；交付门 PASS；无未决 🔴。
