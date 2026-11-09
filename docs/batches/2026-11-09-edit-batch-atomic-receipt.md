# 2026-11-09 · edit-batch-atomic-receipt
> 六段，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 每段只有一个作者：作者的段可 `append` 加内容、可就地改（`edit`）；非作者一概拒。
> 编制：主 agent · 2026-11-09 · 来源 = 用户 2026-11-09 11:36 实报并已复现三次：批量 edits 后续条目被拒时回执写「零字节未落盘」，而前面的条目已经落盘。
> 台账 = #2183（TOOLS · 归批）。前情 = 无（独立批）。
## §1 讨论（主 agent）
**状态行**：已收口 2026-11-09
<§1 模板占位：本批条目 / 关键判据 / 授权口径>

### 用户实报（2026-11-09 11:36）：批量 `edits` 的部分落盘 + 假回执

**用户原话**：「edit 的批量 edits 在后续条目被拒时，回执写「零字节未落盘」，但前面的条目实际上已经落盘了。它据此改成一档一调、逐次回读。这个缺陷不阻塞本批（它绕过了），但它会让任何依赖「失败即全无」的人相信一个假状态。」

**用户已复现三次**，且为此改了工作方式（一档一调 + 逐次回读）——说明代价已经从「一次误判」变成「常态绕行」。

**父侧代码级定位（本批实读）**

`thincoder-core/tools/edit-batch.mjs` 的 `applyEditBatch` 自述：

```
* failure (atomic — nothing written). Returns the per-entry result text (joined)
```

而它的实际路径是**两段**：

| 段 | 做什么 | 是否原子 |
|---|---|---|
| 准备段 | 逐条校验 + 算出每档最终内容；`plan.rejection` 在写盘前抛出 | **是** |
| 写盘段 | 「全部检查通过——每文件一次写盘」逐组写 | **否** |

**被拒发生在第二段时，前面各组已经落盘。**写门 `thincoder-core/tools/doc-write-gate.mjs` 是**每档落盘前**判段落——第 N 档被拒时前 N−1 档已提交，而抛出的是它自己那句「本次写入未落盘——目标档字节逐字不变（零字节）」。

**那句对它自己为真、对整批为假。**所以人读到的是「什么都没写」，盘上是「写了一半」。

**它与已记录三笔的关系**：#2183（原子 `edit` 报零字节却已写入）· #2186（`batch edit` 报成功却截断整档）· #2188（批式 `edit` 部分落盘却回执零字节）——**本笔给的是机制层证据：不是写入路径坏了，是「原子」这个承诺只覆盖第一段。**

**要解的问题（用户要的）**：要么真原子，要么回执不说假话。**两者都要，缺一个都还会再骗人一次。**

### 评审第 1 轮 changes-required（2🔴+8🟡+2🔵），十二条全修（2026-11-09 11:47）

**两条 🔴 都出在同一个地方：权威档把「原子」的边界画得比现实窄。**

**🔴① 编辑器径整个漏了。**`write-path.mjs` 的 stage 契约写着「编辑器径无暂存档（即时提交）」，而 `EDIT.md` §5 说「`rename` 串是唯一残留的非原子窗口」。**在编辑器径上，暂存那一跳就是提交点**——照权威档实施，会对一个没有暂存档的档发 `{op:"commit"}`，`rename` 抛 ENOENT，**已落盘的档被回执报成没落盘**。先例 `patch.mjs` 有 `if (r.via === "editor")` 并跳过提交，**批档 §2 也写了「编辑器径例外」，唯独权威档没写**。

**🔴② 回执首行挂在「段」上，不挂在「盘上实况」上。**§5 把 `nothing written — 0 of N` 系于「准备段失败」，而门与暂存放哪一段，§5 与 §2 说法不同。**只要已有 K 档落盘，它仍会印「nothing written」**——本批要灭的那句假结论换个位置复活。

**一条格式约定要点出**：这两条修完，回执的正确基准是**盘上已落盘档数**，不是段。

| # | 评审说的 | 裁定 |
|---|---|---|
| 3 🟡 | `§6` 表头叫「现状路径」，两行却描述未在盘的代码、且无落位判词 | 收 |
| 4 🟡 | 暂存档清理没进门；`D-10` 的理由句读作连清理都禁 | 收 |
| 5 🟡 | `recordWrite` 单源句「唯一例外 = apply_patch」会失准 | 收 |
| 6 🟡 | 新回执文案无现存件三问；`EDIT_ABORT_PREFIX` 未交代 | 收 |
| 7 🟡 | 无公开源调研证据行 | 收（无关也照写） |
| 8 🟡 | `nothing written` 一形无实报∥无复现命令 | 收 |
| 9 🟡 | 换 `rename` 落盘的后果没记（模式位 ∥ 符号链接被实体档替换 ∥ 硬链接断开） | 收——**这条是我没想到的**：`edit` 的调用面比 `apply_patch` 宽得多 |
| 10 🟡 | RTM 编号待裁 | 收（编号先定再写标题） |
| 11 🔵 | 先例行缺 `APPLY-PATCH.md` 坐标与偏离理由 | 收 |
| 12 🔵 | `N` 一名两义（条目数 ∥ 档数） | 收 |

### 父侧裁定两处（2026-11-09 11:54）

**① `D-12`（保模式位）保留——不撤。**

设计席问我该不该为这一步多花一次 `stat` + 一次 `chmod`。**留。**

理由不是「更稳妥」，是**代价量级不对等**：不保，模型改过的脚本**静默丢可执行位**——不报错、不提示，下一次运行才炸，而且炸在离改动很远的时刻。一次 `stat` + 一次 `chmod` 买掉这个，划算得不像个决策。

同一逻辑：`D-13`（符号链接被实体档替换 ∥ 硬链接断开 ∥ 属主随暂存档）**接受不检测**——它明写了放弃的理由（保它们只能退回就地写，与零字节承诺矛盾）。**有理由的放弃，好过没写的沉默。**

**② 需求面 F 条已在盘，不必再问。** 设计席报「`docs/core/requirements/TOOLS.md` 检索 `原子|批量` 零命中」——那是它检索时刻的状态；**F16 已在 11:41 补进 §4.2 表**（`F1–F15` 标题同步改 `F1–F16`），判定句与设计同口径。它没有回头再查一次，所以结论过期——**不是它的错，是它报告时我还没落笔**。

**③ 它自己纠正了评审的一条：** 评审判「写前门还留 `.docgate-*` 片段档」，它去读了门，发现**门自己在 `finally` 里删**——按盘上事实写，没有照抄评审的说法。**这条该记：评审也会说错，子代理去核了再落笔，是对的。**

### 用户改口径（2026-11-09 11:54）：逐条成功/失败，不要整批返工

**用户原话**：「批量编辑时我希望某条不成功就反馈这条不成功，不要整批返工。」

**这句推翻的是本批的设计前提，不是措辞。**

前几轮我们一直在把「原子」的边界画准（准备段原子 ∥ 提交段按盘上实况报）。**用户现在说：不要那个边界——要的是每条自己成、自己败，成了的不许返工。**

| 旧前提（本批已写死的） | 新口径 |
|---|---|
| 「失败即全无」许诺到准备段（`D-5`） | **不作这个许诺**——一条失败只影响它自己 |
| 首行两形 `nothing written` ∥ `partial write`（整批为单位） | **逐条报**：哪条成了、哪条没成、为什么；末尾给计数 |
| `B1`：准备段失败 ⇒ 目标档零字节 | 准备段失败**只让那一条失败**，同批其他条照落 |
| 一条坏 ⇒ 整批拒 ⇒ 用户重做全批（现状） | **已成的留在盘上，不需要重做** |

**连带一处可能省掉的机制**：既然不再承诺「失败即全无」，`edit` 批面就不必走「暂存档 + `rename` 覆盖」那套——**就地 `writeFile` 反而保住模式位、符号链接、硬链接**，`D-12`（`stat`+`chmod` 补模式位）与 `D-13`（接受丢这三样）都可撤。**要不要撤由设计席判**：判据是「还有没有别的东西需要暂存」。

**一处必须保住的**：**同一条档的多条 `edit` 仍要合成一次写**——否则第二条读到的是写前的旧内容。**写单位 = 档，报告单位 = 条。**这两个单位不同，别混。

**冲突裁决**：同一档里某条失败（如 `old_string` 匹配不到），**同档其他条照落**；某档最终内容被写前门拒，**该档所有条失败、其他档照落**。理由 = 用户要的是「一条失败只反馈它自己」，不是「一档失败连坐整批」。

### 父侧裁定三处（2026-11-09 12:01）

**① 批档不改名。** 设计席问：批档名 `edit-batch-atomic-receipt` 与现口径（逐条成败）不符，要不要改。

**不改。** 理由：**这批的名字不值得用一条断掉的 `task_book` 指针去换。**改名的代价是文件名 ∥ 台账指针 ∥ 全部引用一起动，收益只是一个更准的名字——而**批档本身收口后就不用了**。主题词留在档头，口径以本节为准。

**② 桥面口径不在这批归一，挂账。** ACP 桥 `thincoder-cli/src/acp/buffered-edit.mjs` 仍是「全过才写」，与核面逐条成败两说。**这是同一机制的两个口径，该归一**；但它是端侧契约面（IDE 侧编辑行为随之变），不是本批能顺手吞下的。挂 `#2234`。

**③ 工具描述那两句必须同轮改。** `thincoder-core/tool-docs/edit.md` 现写 `atomic: any failure writes nothing` ∥ `overlap ⇒ the whole batch is refused, nothing written`——**逐条成败落地后这两句就是假话**，而那一层正是模型读的地方。派 coder 时一并改（D11 同轮）。

**一条要记**：设计席这次的第一句话是「**先回答你要我判的那件事：暂存整个撤掉**」，并给了依据——写前门在两条落盘径之前，所以「零字节」从来不依赖暂存档。**没有猜，是去读代码后判的。**

### 父侧实测与三处裁定（2026-11-09 12:48）

**① 逐条不连坐——实测通过（探针自建，不用实施席的用例）。**

4 条 / 3 档，第 2 条故意匹配不到：

```text
Edited a.txt: replaced 1 occurrence(s)
edits[1] — failed: old_string not found in b.txt
  searched: "NOT_THERE" — use grep to locate the actual content
Edited a.txt: replaced 1 occurrence(s)
Edited c.txt: replaced 1 occurrence(s)
edit batch: 3/4 entries applied, 1 failed — 2 file(s) written: a.txt, c.txt
```

盘上：`b.txt` **字节未动**，a/c 落盘。**这就是用户要的那件事。**

**② 档级失败只连坐该档——实测通过。**

夹具里两档：一档在 `docRoot` 内被改成超长段落（写前门拒），另一档是普通文本档：

```text
edits[0] — failed: DOC-CHECK GATE: REFUSED（1 段文字太长，难于阅读）
edits[1] — failed: DOC-CHECK GATE: REFUSED（1 段文字太长，难于阅读）
Edited good.txt: replaced 1 occurrence(s)
edit batch: 1/3 entries applied, 2 failed — 1 file(s) written: good.txt
```

被拒那一档盘上原样、`good.txt` 更新。**一条失败没有把别的档拖回来。**

**③ 裁定：`thincoder-core/tools/file.mjs` 那句 `edits` 参数描述改得对，保留。**
原文 `atomic (any failure writes nothing; …overlap refuses the whole batch…)`——**逐条成败落地后它对模型是假话**，与 `tool-docs/edit.md` 是同一规则的两层（D11 要求同轮改）。实施席改了并在报告里披露、没藏。**披露比「没改」更值得记。**

**④ 裁定：非对象条目仍走整批成形错，不改。**
实施席说 §2 机制段与设计档在那条上不一致。**以需求 F13 为准**：「非数组 `edits` 容器**与非对象条目** ⇒ 成形错误」。那属于**调用形态错**，不是「这一条内容没改成」——整批抛是对的（且零写、无假回执）。§2 那句措辞归设计笔改，不动代码。

**⑤ 设计档五处同轮收**（实施席报的：代码已落、文档还在说反话）：`EDIT.md` §6 五处「未落」判词 ∥ `EDIT-HELPERS.md` §7.2–§7.3 的「整批拒（原子，零写）」∥ `TOOLS.md` 的 `edits 数组批（原子）` ∥ 批档 §2 验收表补 A9/A10 ∥ `EDIT.md` §5 档级失败原因归属半句 + 「跨 path 并行」两说择一。

## §2 批次任务与设计（eng-designer）
**状态行**：设计完成


### 本批条目（覆盖）

| # | 条目 | 设计档回指 |
|---|---|---|
| B1 | 批量 `edits` 里**一条应用失败只废那一条**（`old_string` 匹配不到 ∥ 多匹配无 `replace_all` ∥ 行号越界 ∥ 条目成形错 ∥ 行号锚护栏拒）⇒ 该条失败，同档其余条照应用、其他档照落盘 | EDIT.md §5「一条失败只废它自己」条 · §8 D-5 |
| B2 | **档级失败只连坐该档**（档读不到 ∥ 该档最终内容被写前门拒 ∥ 该档写盘抛错）⇒ 该档所有条失败，其他档照落 | EDIT.md §5「该档写不成就整档不成」条 · §8 D-5 · D-10 |
| B3 | **逐条回执**：每条一行、按调用序回原位；成者保留现成功回执一字不改，败者逐字 `edits[<i>] — failed: <原因原文>` | EDIT.md §5「批量回执」条 · §8 D-14 |
| B4 | **末行恒为一行计数**：逐字 `edit batch: <k>/<M> entries applied, <M−k> failed — <K> file(s) written`（`K ≥ 1` 时接已写档清单） | EDIT.md §5「三个符号各一义」条 · §8 D-9 · D-14 |
| B5 | **写单位 = 档、报单位 = 条**：同一档多条合成**一次**写，写前门判该档最终内容；记账与写同一跳 | EDIT.md §5「一档一次写」条 · §8 D-5 |
| B6 | **就地写**：不落暂存档、不走 `rename`、失败不回滚；上一版为补模式位外加的 `stat`+`chmod` 与「接受丢符号链接 ∥ 硬链接 ∥ 属主」一并撤 | EDIT.md §5「落法 = 就地写」条 · §8 D-12 · D-13 |
| B7 | **批面文本不说批级谎**：批量失败原因里不出现 `no files written` ∥ `nothing written`；单档写点那两句**一字不改** | EDIT.md §5「文本不说批级谎」条 · §8 D-11 |
| B8 | **帧面返逐条失败**：`planEditEntries` 的 `rejections` · `applyPlannedEntries` 的 `onEntryError` · `scope` 选项；两个调用点显式传参，桥面回执与语义零变 | EDIT.md §6「帧面逐条失败」行 · §5「守卫与文案单源」条 |

**不在本批**：ACP 桥批量的**回执与语义**（桥仍「全过才写」、自持逐条行；本批只让它的两个调用点显式传参）· `apply_patch` 面（`patch.mjs` 的提交段回执与模式位）· `thincoder-core/tools/write-path.mjs` 与 `doc-write-gate.mjs` 本体（零改）· 需求档（主 agent 的写面；F16 已按逐条成败口径重切——判定句现在是「三档里第 2 档的一条 `old_string` 匹配不到 ⇒ 该条 `failed`、其余成功、盘上只含成功条」，与本批 A1 ∥ A2 同口径）。

### 设计档落点

`docs/core/design/EDIT.md` 就地更新（§5 契约 · §6 落位表 · §8 D-5 ∥ D-10 ∥ D-11 重写、D-12 ∥ D-13 ∥ D-14 换义），本批已落。**不新建档**——机制已有归属，新开一档即两份活体。**§6 五个「未落」判词（批量逐条落盘 ∥ 批量逐条回执 ∥ 批量回执汇总行 ∥ 帧面逐条失败 ∥ 描述面文本）在实施落盘的同轮改「已落」∥「在位」**——判词与代码同轮到位，留「未落」等于设计档停在旧状态（收口对账项）。

### 机制设计

**顶替的错处（一句）**：现实现把「原子」焊在准备段——任一条目失败 ⇒ 整批拒、盘上零字节。用户 2026-11-09 11:54 要的是**一条不成功只反馈那一条**，不要整批返工；一次手滑让整批重做，正是它要灭的代价。

**落法 = 逐条成败、逐档落盘**（全在 `applyEditBatch` 一个函数内，盘上可观察）：

- **分组**：`edits` 容器 ∥ 顶层互斥仍是**调用形态**错 ⇒ 照旧抛（没有条目可逐条报）；条目非对象 ∥ 缺 path ∥ 成形错 ⇒ **该条失败**，循环继续。
- **准备段（零 IO 写）**：逐档读一次（读不到 ⇒ 该档所有条失败）→ 行号锚按批前快照逐条判（命中 ⇒ **那一条**失败）→ 帧排顺序后逐条 `computeEditEntry` 累积（一条抛错 ⇒ 该条失败、累积内容不动、继续下一条）。
- **提交段（逐档一次就地写）**：该档有 ≥1 条成功 ⇒ `writeThroughPath(abs, 最终内容, {op:"write", record})`（`record.startLine` = 已应用条受影响行最小值 · `record.shift` = 已应用条净漂移之和）；写前门命中 ∥ 写盘抛错 ⇒ **该档所有条失败**（原因 = 那个档级错误原文），其他档继续；一档零条成功 ⇒ 不写、也不记账。
- **回执**：每条一行、按调用序回原位（成 = 现成功回执一字不改；败 = `edits[<i>] — failed: <原因原文>`），末行计数行（§5）。

**三条设计选择与理由**：

- **不落暂存档**：暂存 + `rename` 的唯一产物是「任一跳失败 ⇒ 目标档零字节」那个许诺，许诺撤了产物就没有理由。写前门在 `op === "write"` 之前 throw（依据 `thincoder-core/tools/write-path.mjs`「if (op === "write") await runDocWriteGate({ abs, content })」）⇒「该档一字未动」不依赖暂存；就地写同时保住模式位 ∥ 符号链接 ∥ 硬链接 ∥ 属主（§8 D-12）。
- **一条失败不拖同档其他条**：用户口径是一条一条算；「同档一条坏就整档不写」会把一次 `old_string` 手滑放大成整档返工——与「整批返工」同形，只缩了一圈。
- **档级失败仍连坐该档**：该档最终内容被判不合格 ∥ 档读不到 ⇒ 那几条**没有可落的内容**，报成功就是假话。这是「一条失败只反馈它自己」的边界，不是例外（§8 D-5 冲突裁决）。

**要说清的边界**：批内**没有任何跨档保证**——已写成的档不回滚，失败只由回执按条 ∥ 按档点名。「全部成功」不再是可以依赖的前提；调用方据以决策的单位是每一行回执（就地写的崩溃窗见 §8 D-13）。

### 受影响文件与测试覆盖

| 文件 | 动作 | 说明 |
|---|---|---|
| `thincoder-core/tools/edit-batch.mjs` | 改 | 逐条失败隔离（读档 ∥ 锚护栏 ∥ 应用各自 catch，失败不回滚、不重排）· 逐档一次就地写 + 同一跳记账 · 逐条回执 + 末行计数 · 档头那句 `(atomic — nothing written)` 假承诺已删（档头现写「批内没有任何跨档保证：已写成的档不回滚」） |
| `thincoder-core/tools/edit-diff.mjs` | 改 | `planEditEntries` 返 `rejections: [{index, reason}]`（取代单串 `rejection`）· `applyPlannedEntries` 的 `onEntryError` 收集模式 · `validateEditEntry` ∥ `computeEditEntry` ∥ `applyLineEdit` 的 `scope` 选项（`"batch"` 不带任何写盘结论）· `abortPrefix` 参数随核批面退役（`EDIT_ABORT_PREFIX` 常量保留——桥面仍在用） |
| `thincoder-cli/src/acp/buffered-edit.mjs` | 改（两个调用点，语义零变） | 显式传 `onEntryError:"throw"` + `scope:"single"`，并自行拼回 `EDIT_ABORT_PREFIX`——桥面今日仍是「全过才写」，那句在桥面为真 |
| `thincoder-core/tool-docs/edit.md` | **改（产品代码面，需 eng-coder）** | 两处已是假话：`atomic: any failure writes nothing` ∥ `overlap ⇒ the whole batch is refused, nothing written`——同一规则在每一层同轮改（D11），本批必须同轮改掉 |
| `thincoder-core/tools/write-path.mjs` | 零改 | `op:"write"` + `record` 的缝已在位；本批不再用 `stage` ∥ `op:"commit"` |
| `thincoder-core/tools/doc-write-gate.mjs` | 零改 | 拒文一字不改（§8 D-11） |
| `docs/core/design/EDIT.md` | 已改 | 本批设计落点 |
| `test/RTM.md` · `test/rtm/tooling.md` | 改 | 索引行 + 故事节 + 用例行（`CLI 41`） |

**另建两份档**（设计期尚未在盘，故按围栏块列；落盘后并入上表）：

```text
test/integration/edit-batch-entry-outcome.test.mjs          集成用例（RTM 新行所指向的用例体）
docs/batches/2026-11-09-edit-batch-atomic-receipt.test.mjs   单测档（收口删）
```

**tier 结论**：**无档跨层**。`edit-batch.mjs` ∥ `edit-diff.mjs` 留在 tools 层；桥面只改两个调用点的实参，判据与回执不变；工具 schema ∥ `touchedPaths` 钩子零改。失败面从「整批抛错」变成「逐条文本 + 档级抛错仍在」，消费面 `catch` 仍兜得住。

### 验收对照

| # | 判据（读者可判） | 回指 | 失败面 |
|---|---|---|---|
| A1 | 两档各一条内容编辑，第 2 档 `old_string` 匹配不到 ⇒ **第 1 档在盘为新内容**、其回执行以 `Edited ` 起头；第 2 档回执行**逐字以** `edits[1] — failed: ` 起头且含 `old_string not found in `；末行逐字 `edit batch: 1/2 entries applied, 1 failed — 1 file(s) written: <p1>` | B1 · B3 · B4 | 改前：整批抛错、第 1 档零字节、无成功行 |
| A2 | **同一档三条**内容编辑，第 2 条 `old_string` 匹配不到 ⇒ 该档在盘内容同时含第 1、3 条的改动（逐字比对）、不含第 2 条的；回执三行（2 成 1 败）；末行逐字 `edit batch: 2/3 entries applied, 1 failed — 1 file(s) written: <p>` | B1 · B5 | 改前：整批零写（同档一条坏 ⇒ 全废） |
| A3 | 档 A 一条、档 B 两条（各自合法），档 B 最终内容触发写前门 ⇒ 档 A 在盘为新内容、档 B **字节逐字不变**（改前改后哈希相同）；档 B 的两条都失败且原因含门拒文那句「本次写入未落盘——目标档字节逐字不变（零字节）。」；末行逐字 `edit batch: 1/3 entries applied, 2 failed — 1 file(s) written: <A>` | B2 · B3 · B7 | 改前：整批拒、档 A 零字节 |
| A4 | 同档两条行号条目范围重叠 + 一条合法行号条目 ⇒ 前两条都失败（原因互指对方行范围）、第三条应用成功；末行 `edit batch: 1/3 entries applied, 2 failed — 1 file(s) written: <p>` | B1 | 改前：整批拒 |
| A5 | 全成零回归：同一档 3 条 + 另一档 1 条 ⇒ 末行逐字 `edit batch: 4/4 entries applied, 0 failed — 2 file(s) written: <p1>, <p2>`；逐条 `Edited …` 回执齐全；紧接着一笔用旧行号的 `edit` 被行号锚护栏拒（记账仍在位） | B4 · B5 | 记账漏落 ⇒ 旧行号被静默应用（回归面，改前也绿） |
| A6 | 批量回执文本里检索 `no files written` ∥ `nothing written` 各 **0** 命中；`doc-write-gate.mjs` 那句「目标档字节逐字不变（零字节）」仍 **1** 命中（门文未改） | B7 | 越过 B7 改了门文 ∥ 批面复述了那句假结论 |
| A7 | 0755 脚本档 + 一个指向真实档的符号链接档，各改一条走批量 `edits` 成功 ⇒ 脚本 `stat` 的 `mode` 仍 0755、链接档 `lstat` 的 `isSymbolicLink()` 为真 | B6 | 若把暂存 + `rename` 引回来：0755→644、链接变实体档（**护栏面**：改前也绿） |
| A8 | 桥面零变：`buffered-edit.mjs` 两处调用点显式传 `onEntryError:"throw"` + `scope:"single"`，其批量路径仍在**全部条目通过后才写**，失败仍抛 `edit aborted (atomic — no files written): ` | B8 | 桥面被顺手改成逐条 ⇒ 一个没人要求的口径变更 |

| A9 | **条目级**成形错的逐条面：同一档两条合法条目 + 一条非对象条目（`null`）⇒ 两条照应用、盘上为新内容；非对象那条的回执行逐字 `edits[1] — failed: edits[1] must be an object of ` 起头；末行 `edit batch: 2/3 entries applied, 1 failed — 1 file(s) written: <p>`。**容器**本身非数组（`edits` 为字符串 ∥ 对象 ∥ 数字）仍是整批成形错、零写（那一层没有可枚举的条目） | B1 · B3 | 改前：非对象条目由 `assertEditEntries` 预扫整批抛，同批其他条零写 |
| A10 | 编辑器径注入面：桩住写路径的 `applyEdit`（返 `undefined` = 已处理）后同一批两条编辑 ⇒ 与默认径同形回执、同一记账点（旧行号紧随其后被行号锚护栏拒）、目标目录下无 `.thincoder-tmp` 类暂存档；调用方不读 `via` | B6 | 护栏面：改前也绿（暂存 + `rename` 那一跳撤销后，ENOENT 陷阱不复存在） |

A1–A4、A9 是失败面——改前红、改后绿；A5、A7、A8、A10 是护栏面（改前也绿），A6 的判据是**文本检索命中数**，不是观感。A9 与 A10 的判据原文原只住在用例档（收口即删），故在此立行。

### 案列表

| 类 | 输入 | 期望 |
|---|---|---|
| 正常 | 3 档各一条内容编辑，全部合法且过门 | 三档落盘 · 末行 `edit batch: 3/3 entries applied, 0 failed — 3 file(s) written: <清单>` · 三笔记账在位 |
| 正常 | 同一档 3 条编辑 + 另一档 1 条 | 两档各写**一次** · 末行 `4/4 entries applied, 0 failed — 2 file(s) written: …`（条目数 4 ∥ 档数 2 两个单位分开） |
| 边界 | 单档单条目 | 与单形态 `edit` 同形结果 · 末行 `1/1 entries applied, 0 failed — 1 file(s) written: …` |
| 边界 | 注入了编辑器径的档（桩 `applyEdit` 返回已处理） | 与默认径同结果、同记账；调用方不读 `via`——没有提交跳（上一版那个 ENOENT 陷阱不再存在） |
| 边界 | 模式位 0755 的脚本档 ∥ 符号链接档各改一条 | 落盘后模式位与链接形态均不改（B6） |
| 错误 | 第 2 档在写前文档门命中（段落超长） | 第 1 档在盘 · 第 2 档零字节 · 该档两条回执都失败 · 末行 `1/3 entries applied, 2 failed` |
| 错误 | 同档第 2 条 `old_string` 匹配不到 | 同档另两条照落 · `edits[1] — failed: old_string not found in …` · 末行 `2/3 entries applied, 1 failed` |
| 错误 | 第 1 档 path 不存在 | 该档各条失败（原因带 ENOENT）· 第 2 档照落 · 末行 `1/2 entries applied, 1 failed — 1 file(s) written: <p2>` |
| 错误 | 三档各一条、三档**全不成**（path 不存在 ∥ 写前门拒） | 一档不写 · 末行逐字 `edit batch: 0/3 entries applied, 3 failed — 0 file(s) written`（`K = 0` ⇒ **无路径清单支**）· 三条失败行齐全 |

### 交互面

无 UI / 交互改动——本批的用户可见面就是工具结果字符串，已在 A1 ∥ A2 ∥ A5 逐字钉住；没有需要人眼另判的界面。

### 集成用例设计（RTM 增量）

- **新增行**：故事 `CLI 41`「批量改多档：一条失败只废那一条，成了的不返工，回执逐条说清」· 属册 `tooling` · 用例号 `41-1`。**编号先行**：`test/RTM.md` 索引现在最大故事号 = `CLI 40`（末行「盘上改完不用重启，切渠道那一刻就是现况」），`CLI 41` 空 ⇒ 先落索引行，再写用例标题 `test('CLI 41-1 …')`，两者同号逐字。
- **行的四要素**：交互组件 = `edit` 工具的 `edits` 形 ⟷ 逐档就地写 ⟷ 写前文档门；断言业务可观察结果 = 盘上字节（哪几档变了）+ 逐条回执行与末行计数；服务需求 = B1 ∥ B2 ∥ B3 ∥ B4；进入口 = 真 `edit` 工具调用（`edits` 数组，其中一条故意给匹配不到的 `old_string`）。
- **被改写的既有行**：无。**冗余可删的行**：无——既有行里没有一行断言批量 `edits` 的成交与回执。
- **成因两入口**：① 生产真出过——用户实报并复现三次，为此改成一档一调（本批起因）；② 业务场景——批量改多档时「一条坏会不会连累别人」正是调用方据以决策的前提。

### 关键决策

见 `docs/core/design/EDIT.md` §8：D-5（逐条成败、逐档落盘；不作「失败即全无」的许诺）· D-9（末行恒定）· D-10（失败边界只到条 ∥ 档，不回滚）· D-11（门文与单档后缀不改字）· D-12（就地写、撤暂存）· D-13（就地写的崩溃窗登记）· D-14（三件文案新立；`EDIT_ABORT_PREFIX` 桥面留用，核批面靠 `scope:"batch"` 同时压掉前缀与后缀）。

### 上抛项

① **[知会] 描述面两处已是假话**：`thincoder-core/tool-docs/edit.md` 的 `atomic: any failure writes nothing` ∥ `overlap ⇒ the whole batch is refused, nothing written`——产品代码面，本批须同轮改（D11），派 eng-coder 时一并改；§6「描述面（模型可见）」已判「未落」，改完同轮改「在位」。
② **[知会] `apply_patch` 面同形残留**：`thincoder-core/tools/patch.mjs` 的提交段在已提交档之后失败时抛裸 `rename` 错误、不报已提交清单；`apply_patch` 也不补模式位。不在本批，请记台账。

### 文档回正（2026-11-09 12:49 · 实施落盘后同轮）

**起因**：代码已逐条成败，三份设计档还在说「整批拒（原子，零写）」。本轮只动文档、零代码。

| 档 | 改了什么 |
|---|---|
| `docs/core/design/EDIT.md` §6 | 五处「未落」判词改「已落」（批量回执汇总行 ∥ 批量逐条落盘 ∥ 批量逐条回执 ∥ 帧面逐条失败 ∥ 描述面文本），汇总行一行注出在盘的 `edit batch: <appliedCount>/<total> entries applied …` |
| `docs/core/design/EDIT.md` §5 | ① 档级失败原因归属补半句：尚无自己失败原因的条目取档级错误原文，已有一条自己原因的保留自己那句（把 `old_string not found` 覆写成门拒文会丢掉用户自己能修的那条线索）；② 「跨 path 并行」改「跨档串行」——逐档依次「读 → 帧排 → 累积 → 写」，与盘上顺序 await 一致 |
| `docs/core/design/EDIT-HELPERS.md` §7.2 | 描述面两张落点表换逐条口径（`overlap ⇒ those two entries fail … the rest of the batch still applies` ∥ `an overlapping pair fails on both sides`）。该档是帧判据单源，单源说反话比设计档说反话更坏 |
| `docs/core/design/EDIT-HELPERS.md` §7.3 | R3「整批拒（原子，零写）」→「那两条都废、同档其余条照应用」；判定点改「逐档读盘之后、帧排之前按批前快照逐条判，命中只废那一条」；两个纯函数签名与选项改 `{order, rejections}` ∥ `{content, results, failures}` + `onEntryError`；R1 代价那段的「整批零写」改该条 not-found |
| `docs/core/design/TOOLS.md` §6.6 ∥ §6.26 | `edits 数组批（原子）` → 逐条成败、逐档一次就地写；`重叠整批拒（原子零写）` → 那两条都废 |

**父侧裁定④同轮撤回**：原裁「非对象条目 ⇒ 整批成形错，以 F13 为准」，而 F13 的判定句写的是「条目级成形错误含下标 ∧ 零裸抛」——**概述句不是判据**。现按盘与需求：条目非对象（`null` ∥ 字符串 ∥ 数字 ∥ 数组）⇒ **该条失败**（A9 钉住）；`edits` **容器**非数组 ⇒ 整批成形错、零写（那一层没有可枚举的条目）。§2 机制段原句与盘一致，未改。

**一处更正**：死锚不在「§2 第 155 行」，在 §2 受影响文件表 `edit-batch.mjs` 那一行——`依据 …「(atomic — nothing written)」` 的引文随代码删掉而失配；已改述为「档头那句已删」。

**另收两处同源反话**（`EDIT.md`，同一档同一轮）：① D-14 的现存件三问原写「盘上只有被本批顶替的旧汇总行」——代码落盘后那句已非现况，改为按被顶替的旧形说明「只有全成一形、无 `k` ∥ `M` ∥ `K` 的位置」；② §6「入参守卫」行原写「两通道共用」——核批面已不走 `assertEditEntries`（条目非对象 ⇒ 该条失败、文案 = `editsEntryError(i)`），桥面两守卫同调。

## §3 设计评审（评审子代理）
**状态行**：评审通过



### 轮次 1（评审子代理）

设计评审首轮（对象 = `docs/core/design/EDIT.md` §5 落盘两段式与批量失败回执 ∥ §6 实现坐标 ∥ §8 D-5/D-10/D-11；批档 §2 作设计上下文对照）。

| # | 严重度 | 状态 | 证据 |
|---|---|---|---|
| 1 | 🔴 | 待改 | `docs/core/design/EDIT.md` §5「跨档原子只到准备段为止」在注入编辑器径不成立：`thincoder-core/tools/write-path.mjs` 的 `writeThroughPath` stage 契约写「注入径例外：编辑器径无暂存档（即时提交）」；批档 §2「编辑器径例外」写了，权威档 §5 ∥ §6 两处未写（§6「批量落盘两段式」行只列 `stage` ∥ `commit`，无 `via`） |
| 2 | 🔴 | 待改 | `docs/core/design/EDIT.md` §5「批量失败回执」把首行两形挂在「准备段失败／提交段失败」上；批档 §2「写前文档门就挂在这一跳」把门与暂存放在提交段 ⇒ 同一机制两处段划分不同，且已落盘 K>0 时仍印 `nothing written — 0 of N`（与批档 §2 案列表「后续档失败 ⇒ 回执点名它已在盘」相反） |
| 3 | 🟡 | 待改 | `docs/core/design/EDIT.md` §6 表头「实现单一权威（现状路径）」——「批量落盘两段式」「批量失败回执」两行描述的是尚未在盘的代码：`thincoder-core/tools/edit-batch.mjs` 的 `applyEditBatch` 写盘段仍是 `{ op: "write", record }`（无 `stage`、无 `commit`），且两行 `实核` 列无落位判词 |
| 4 | 🟡 | 待改 | `docs/core/design/EDIT.md` §5「批量失败回执」未写暂存档清理：失败后 `nothing written` 与盘上 `.thincoder-tmp` 残留在同一句里并存；批档 §2「清掉已落暂存档」与 `thincoder-core/tools/patch.mjs` 的 `unlink(abs + TMP_SUFFIX)` 有，而 §8 D-10 的理由句（「此时再加写入是最不该做的一件事」）反读作不做清理 |
| 5 | 🟡 | 待改 | `docs/core/design/EDIT.md` §6「两段全过后逐档 `recordWrite`」= 第二处调用方记账；`thincoder-core/tools/write-path.mjs` 自述「唯一例外 = apply_patch 的批级记账」，而该档本批声明零改 ⇒ 单源句失准且无处记账 |
| 6 | 🟡 | 待改 | 新增回执四件（两条首行 ∥ `written:` ∥ `not written:` ∥ `cause:`）无现存件三问答案；`thincoder-core/tools/edit-diff.mjs` 的 `EDIT_ABORT_PREFIX`（「edit aborted (atomic — no files written): 」）是现准备段失败前缀，设计未说复用、退役或转作 `cause` |
| 7 | 🟡 | 待改 | 无公开源档调研证据行（哪几份源档读过 ∥ 是否相关），判据 10 |
| 8 | 🟡 | 待改 | 分支出处只半边：`partial write` 一形有用户实报（批档「编制」行：已复现三次）；`nothing written — 0 of N` 一形无实报引文 ∥ 复现命令，仅有案列表一行输入-期望（判据 6b） |
| 9 | 🟡 | 待改 | 就地写换成 `rename` 落盘的后果未记：目标档模式位不保、符号链接被实体档替换；§8 D-5 只写「N 次 `rename` 是能拿到的最强形态」 |
| 10 | 🟡 | 待改 | 协调项：批档 §2 上抛项③ RTM 故事号 `CLI 41` 待裁——判据 12 要求编号先进 `test/RTM.md` 再写用例标题 |
| 11 | 🔵 | 建议 | 最切先例行只有「与 `apply_patch` 同一条缝（不是新机制）」，缺设计档坐标（`docs/core/design/APPLY-PATCH.md` §4「多文件原子」）与偏离理由（批面报 K of N，先例在提交段抛裸 `rename` 错误） |
| 12 | 🔵 | 建议 | `N` 一名两义：成功汇总行 `edit batch: N/N entries` 的 N = 条目数，失败首行 N = 档数 |

VERDICT: changes-required

计数：🔴 2 · 🟡 8 · 🔵 2，共 12 行；两项 🔴 未解（编辑器径未入权威档 ∥ 首行两形按段分派而非按盘上实况）。

### 轮次 2（评审子代理）

评审第 2 轮（设计重评：前提已换，前两轮结论作废）。对象 = `docs/core/design/EDIT.md` §5 ∥ §6 ∥ §8 D-5/D-12/D-13；批档 §2 作设计上下文对照。前轮 12 条逐条按盘核过：12 条已修（行 3 留一处残项，并入新行 15），新增 5 条（13–17），其中 1 条 🔴 未解。

| # | 严重度 | 状态 | 证据 |
|---|---|---|---|
| 1 | 🔴 | 已修 | §5「落法 = 就地写」条：「调用方**无须读 `via`**」+「**不落暂存档、不走 `rename`**」——暂存撤掉后没有提交跳，ENOENT 陷阱不成立；`thincoder-core/tools/write-path.mjs` 的 `defaultPath` `case "write"` 直接 `writeFile` 并记账 |
| 2 | 🔴 | 已修 | 段分派的「首行两形」整体退场：§5「批量回执（逐条 + 末行计数）」条改逐条一行 + 末行 `edit batch: <k>/<M> entries applied, <M−k> failed — <K> file(s) written`，并写「失败原因里**不出现**「no files written」∥ `nothing written`」 |
| 3 | 🟡 | 已修（残项见 15） | §6 表头改「实现单一权威（落点与落位）」并给判词定义「`已落` = 在盘可用；`未落` = 落点已定、代码待改（契约见 §5）」，三行标「未落」 |
| 4 | 🟡 | 已修 | §5「清理面为空」条；门的自清已核：`thincoder-core/tools/doc-write-gate.mjs` 的「for (const f of frags) {」在「} finally {」内 |
| 5 | 🟡 | 已修 | §5「落法 = 就地写」条改传 `{op:"write", record}`（同一跳记账）；`thincoder-core/tools/write-path.mjs` 的 `case "write"`「if (meta.record) recordWrite(abs, meta.record)」——不再是第二处调用方记账 |
| 6 | 🟡 | 已修（证据句有误，见 14） | §5「守卫与文案单源」条：「`EDIT_ABORT_PREFIX` 核批面不用、桥面仍在用（§8 D-14）」+ D-14 的现存件三问 |
| 7 | 🟡 | 已修 | §6「**公开源调研证据**」条在位（检索结论 + `index.publicRepos` 零命中） |
| 8 | 🟡 | 已修 | `nothing written — 0 of N` 一形已整体退场；余下分支各有实报（编制行「已复现三次」）与 A1–A4 用例 |
| 9 | 🟡 | 已修 | §8 D-12「就地写反而保住模式位 ∥ 符号链接 ∥ 硬链接 ∥ 属主」+ D-13 崩溃窗登记（就地写的截断窗已写下） |
| 10 | 🟡 | 已修 | 批档 §2「编号先行」：`test/RTM.md` 索引最大 = `CLI 40`（「盘上改完不用重启，切渠道那一刻就是现况」），`CLI 41` 空 |
| 11 | 🔵 | 已修 | §6「批量落盘的做法与先例」条给 `docs/core/design/APPLY-PATCH.md` §4 ∥ §6.1 坐标与「偏离理由 = **前提消失**，不是先例不好」 |
| 12 | 🔵 | 已修 | §5「三个符号各一义」条：`M` ∥ `k` ∥ `K` 各一义，不再一名两用 |
| 13 | 🔴 | 未解 | `docs/core/requirements/TOOLS.md` F16 仍写旧口径：「落盘走两段式（逐档暂存 → 全过 → 逐档提交），写前文档门挂在**暂存那一跳**」+「回执首行必须按**盘上实况**报已落盘档数（`nothing written — 0 of N` ∥ `partial write — K of N`）并列 `cause`」，判定句「第 N 档在写前门被拒 ⇒ 逐档回读前 N−1 档字节不变」——与 §5 三处相反（就地写 ∥ 禁说 `nothing written` ∥ 其他档照落）；层序上设计胜，故改面在需求档，但不动它就实施不完 |
| 14 | 🟡 | 未解 | §8 D-14 现存件三问的证据句半假：「`edits[` ∥ `entries applied` ∥ `file(s) written` ∥ `failed:` 在 `thincoder-core/**` 检索零命中」——`thincoder-core/tools/edit-diff.mjs` 有「edits[${i}] must be an object of」，`failed:` 亦多处命中（如 `thincoder-core/agent-tools/browser-async.mjs` 的「failed: ${clip(entry.error)}」）；且新的失败行前缀 `edits[<i>]` 与该既有标签族的两处归属未交代 |
| 15 | 🟡 | 未解 | §6 有「已落／在位」压住本批必改的面：「批量回执汇总行」标「已落；**ACP 桥批量回执不适用**」而盘上字面仍是 `thincoder-core/tools/edit-batch.mjs` 的「edit batch: ${args.edits.length}/${args.edits.length} entries — 」（k/M/K 形尚未落）；「描述面（模型可见）」标「在位（`DESC()` 加载）」而 `thincoder-core/tool-docs/edit.md` 两句已是假话（批档 §1：「atomic: any failure writes nothing」∥「overlap ⇒ the whole batch is refused, nothing written」） |
| 16 | 🔵 | 建议 | `thincoder-core/tools/edit-diff.mjs` 的 `computeEditEntry` 传「validateEditEntry(entry, { ...opts, rich: !opts.abortPrefix })」——「核批面不再使用 `EDIT_ABORT_PREFIX`」若按「不传该参」实施会把前缀带回来（默认「opts.abortPrefix ?? EDIT_ABORT_PREFIX」），传空串则反转成 `rich:true` 又拼回「 — nothing written」；§5 ∥ D-14 宜点名 `scope:"batch"` 这一开关，而不是说「不用那个常量」 |
| 17 | 🔵 | 建议 | K=0 一形无用例：案列表最近的一条是两档中一档失败（K=1）；建议补「全档皆败 ⇒ `0/M entries applied, M failed — 0 file(s) written`（无路径清单）」一案，钉住无清单分支 |

VERDICT: changes-required

计数：前轮 12 条全部已修（逐条按盘核过）· 新增 5 条 = 🔴 1 · 🟡 2 · 🔵 2；未解 🔴 = 1（行 13，需求档 F16 与本批口径相反，实施前须同轮重切）。

### 轮次 3（评审子代理）

第 3 轮（设计评审复核）：只核前轮 17 条，不抓新问题。本轮实读 `docs/core/design/EDIT.md` 全文 + 批档 §2 作对照；行 1–12 无回退，行 13–17 四条小项逐条按盘核过。

| # | 严重度 | 状态 | 证据 |
|---|---|---|---|
| 1 | 🔴 | 已修 | `docs/core/design/EDIT.md` §5「落法 = 就地写」：「调用方**无须读 `via`**——没有提交跳，也就没有要跳过的档」+「**不落暂存档、不走 `rename`**」 |
| 2 | 🔴 | 已修 | §5「文本不说批级谎」：「失败原因里**不出现**「no files written」∥ `nothing written`——那句在批面为假」；末行单形「逐字 `edit batch: <k>/<M> entries applied, <M−k> failed — <K> file(s) written`」 |
| 3 | 🟡 | 已修 | §6 表头判词：「`未落` = 落点已定、代码或文本待改」；三个机制行标「**未落**」 |
| 4 | 🟡 | 已修 | §5「**清理面为空**」条（门的 `finally` 自清据已核） |
| 5 | 🟡 | 已修 | §5：「逐档一次 `writeThroughPath(abs, content, {op:"write", record})`——记账与写同一跳」 |
| 6 | 🟡 | 已修 | §5「守卫与文案单源」：「核批面传 **`scope:"batch"`** 这一个开关」 |
| 7 | 🟡 | 已修 | §6「**公开源调研证据**」条在位 |
| 8 | 🟡 | 已修 | 旧「nothing written — 0 of N」首行两形整体退场（同 2）；余下分支各有实报与 A1–A4 |
| 9 | 🟡 | 已修 | §8 D-12「就地写反而保住模式位 ∥ 符号链接 ∥ 硬链接 ∥ 属主」；D-13 截断窗已登记 |
| 10 | 🟡 | 已修 | 批档 §2「编号先行」：`test/RTM.md` 索引最大故事号 = `CLI 40`，`CLI 41` 空 |
| 11 | 🔵 | 已修 | §6「偏离理由 = **前提消失**，不是先例不好」+ 先例坐标 |
| 12 | 🔵 | 已修 | §5「**三个符号各一义**：`M` = 条目总数 · `k` = 应用成功的条目数 · `K` = 实际写盘的档数」 |
| 13 | 🔴 | 已修（依对象声明，需求档未实读） | 对象声明：「`docs/core/requirements/TOOLS.md` F16 —— 父侧本轮已按新口径重切（旧两条首行与两段式已删，判定句改为「该条 failed、其余成功、盘上只含成功条」），不在本审对象」；批档 §2「不在本批」同述 |
| 14 | 🟡 | 已修 | §8 D-14：「`edits[` 的**文案**命中只有一处 = … `editsEntryError`」+「**同一下标标签族、分居两档**：**并存不归一**…改一处须同看另一处」；`failed:` 归「跨工具一家族…不复用」 |
| 15 | 🟡 | 已修 | §6「批量回执汇总行」判「**未落**——`const summary` 仍是旧形」；「描述面（模型可见）」判「**未落**——载体在位（`DESC()` 加载），文本待改」 |
| 16 | 🔵 | 已修 | §5：「不许靠「少传 `abortPrefix`」实现：不传前缀自己回来，传空串又反转成带后缀」；D-14 同述并点名 `scope:"batch"` |
| 17 | 🔵 | 已修 | 批档 §2 案列表：「末行逐字 `edit batch: 0/3 entries applied, 3 failed — 0 file(s) written`（`K = 0` ⇒ **无路径清单支**）」 |

新增 🔴 = 0；§6 五处「未落」判词与批档 §2「§6 五个「未落」判词」计数一致。

VERDICT: pass

计数：前轮 17 条全部已修（🔴 2 · 🟡 11 · 🔵 4；行 13 依对象声明关闭，其余按 `docs/core/design/EDIT.md` 实读逐条核过）· 新增 🔴 0 · 🟡 0 · 🔵 0。

## §4 用户批准（主 agent）

**用户批准（2026-11-09 11:54 ∥ 12:23）**

**口径原话**：「批量编辑时我希望某条不成功就反馈这条不成功，不要整批返工。」

**放行原话**：「好」（2026-11-09 12:23，在「改 F16 然后直接派 coder」的请示之后）。

**授权面**：① 把批量 `edit` 从「准备段原子」改成逐条成败、逐档落盘；② 按新口径重切需求 F16；③ 实施 + 收口 + 台账核销。

**未授权、已挂账**：ACP 桥面口径归一（`#2234`）——端侧契约面，另裁。实施中「非对象条目 ⇒ 该条失败」（而非父侧一度裁定的整批抛）属**按盘上代码与 F13 判定句落地**，父侧事后撤回自己的裁定并认可，记录见 §1。

## §5 实施记录（eng-coder）
**状态行**：实施完成



### 交付（2026-11-09 · eng-coder）

**一句话**：`edit` 的 `edits` 形从「准备段原子」改成**逐条成败、逐档就地写**。

- 一条失败只废它自己，成了的留在盘上；批内零回滚。
- 回执逐条一块（败者 `edits[<i>] — failed: <原因原文>`）+ 末行恒定计数行。
- 批档 §2 的 B1–B8 全部落地；A1–A8 逐条有判据，另补 A3-b ∥ A9 ∥ A10 三例（见「修正轮」）。

#### 落盘文件

| 文件 | 动作 | 内容 |
|---|---|---|
| `thincoder-core/tools/edit-batch.mjs` | 改 | `applyEditBatch` 重写：①分组（非对象条目 ∥ 缺 path ∥ 成形错 = 该条失败，不进组）②逐档读一次（读不到 ⇒ 该档全条失败）③行号锚按批前快照逐条判（命中只废那一条）④帧排 + `applyPlannedEntries({scope:"batch", onEntryError:"collect"})` 逐条累积（重叠两条互指各废）⑤逐档一次 `writeThroughPath({op:"write", record})`（有 ≥1 条成功才写；写失败只连坐该档）⑥逐条回执按调用序回原位 + 末行 `edit batch: <k>/<M> entries applied, <M-k> failed — <K> file(s) written`（`K ≥ 1` 才接路径清单）。档头那句 `(atomic — nothing written)` 假承诺已删。 |
| `thincoder-core/tools/edit-diff.mjs` | 改 | `planEditEntries` 返 `{order, rejections:[{index, reason}]}`（拒因**不带** `EDIT_ABORT_PREFIX`）· `applyPlannedEntries` 加 `onEntryError:"throw"∥"collect"`（collect 返 `failures`、累积内容不动）· `validateEditEntry` ∥ `computeEditEntry` ∥ `applyLineEdit` 加 `scope`（`"batch"` 同时压掉前缀与 ` — nothing written` 后缀；不许靠少传 `abortPrefix` 实现）· `assertEditEntries` 注释写明调用面只剩桥面。 |
| `thincoder-cli/src/acp/buffered-edit.mjs` | 改（语义零变） | 两个帧函数显式传 `onEntryError:"throw"` + `scope:"single"`（+ `abortPrefix: EDIT_ABORT_PREFIX`），重叠时本档自己拼回前缀；桥仍是「全过才写」。 |
| `thincoder-core/tool-docs/edit.md` | 改（模型可见） | 删两句假话（`atomic: any failure writes nothing` ∥ `overlap ⇒ the whole batch is refused, nothing written`），改成逐条成败 + 重叠两条互废 + 回执形（每条一块、原因逐字可多行、末行计数）。 |
| `test/RTM.md` · `test/rtm/tooling.md` | 改 | 索引行 `CLI 41`（属册 tooling · CLI 有）· 故事节 `## CLI 41.` + 用例行 `41-1`（四要素齐全，证据 = 集成用例档）。 |
| `docs/batches/2026-11-09-edit-batch-atomic-receipt.test.mjs` | **新建**（收口删） | 单测 11 例：A1–A8 + A3-b + A9 + A10。 |

#### 声明外改动（两项，各带理由）

1. `thincoder-core/tools/file.mjs` — **只改 `edits` 参数的描述文本**。
   - schema 结构与 `touchedPaths` 钩子零动。
   - 理由：那段描述写着 `atomic (any failure writes nothing; … overlap refuses the whole batch; …)`，逐条成败落地后对模型是假话。
   - 它与 `tool-docs/edit.md` 是同一规则的另一层，按 §2 B7 与 EDIT.md §8 D-14 同轮改。
   - 已 `[上抛·知会]` 报父侧；若要保留原文，改回一句即可，无连带。
2. `test/integration/edit-batch-entry-outcome.test.mjs` — **新建**。
   - 理由：§2 受影响文件表与 RTM `41-1` 行都指向这份用例体；不写则索引行指向空档。
   - 业务入口 = 真 `edit` 工具（不直调 `applyEditBatch`）：断言盘上字节 + 逐条回执 + 末行计数。
   - 两段覆盖：「一条匹配不到」∥「某档最终内容被写前门拒」。

#### 验证读数（命令 → 结果）

```text
node --test docs/batches/2026-11-09-edit-batch-atomic-receipt.test.mjs
  → # tests 11 · # pass 11 · # fail 0
node --test test/integration/edit-batch-entry-outcome.test.mjs
  → # tests 1 · # pass 1 · # fail 0
node --test test/integration/edit-line-anchor.test.mjs test/integration/doc-write-gate.test.mjs
  → # tests 2 · # pass 2 · # fail 0（相邻面零回归）
node scripts/check-syntax.mjs（thincoder-core）→ check-syntax: 298 file(s) OK
doc_check(mode:"gate"：test/RTM.md · test/rtm/tooling.md · thincoder-core/tool-docs/edit.md)
  → DOC-CHECK GATE: PASS
edit 工具 schema 预算 = 7493 字符（F15 单档上限 8000）
```

#### 改前红／改后绿（同一份单测档跑两棵盘）

- 基线 = HEAD 的 detached worktree（`git worktree add … HEAD`），跑同一份用例档：
  - `not ok` A1 ∥ A2 ∥ A3 ∥ A4 —— 整批抛错、前面各档零字节。
  - `not ok` A5 —— 旧汇总行 `edit batch: N/N entries — …`。
  - `not ok` A6 —— 抛错文本里带着 `no files written`。
  - `ok` A7 ∥ A8 —— 护栏面，改前也绿（与 §2 的预期一致）。
- 修正轮新增两例同样在基线红：`not ok A9`（非对象条目整批抛）· `not ok A10`（整批抛于 not-found 那条）。
- worktree 已 `git worktree remove --force` 清掉（`git worktree list` 只剩主树）。

#### 两处判断（请评审 ∥ 父侧过目）

1. **非对象条目 = 该条失败**。首版按 `assertEditEntries` 整批拒，评审第 1 轮 🔴 指出与 B1 相反，已改。
   - 依据：B1 把「条目成形错」列为逐条失败面；用户 11:54 口径是「某条不成功就反馈这条不成功」。
   - 桥面仍整批拒：`assertEditEntries` 留给桥，A8 要求桥零变。
2. **档级失败的原因归属**：该档写不成时——
   - **尚无自己失败原因**的条目取档级错误原文（A3 钉住）；
   - **已有自己原因**的条目保留自己那一句（A3-b 钉住）。
   - 理由：一条回执讲一件事；把 `old_string not found` 覆写成门拒文会丢掉用户能自己修的那条线索。
   - EDIT.md §5 那句只写「原因 = 那个档级错误原文」，建议设计笔补半句（见下方待办）。

#### 内部审计与代码评审轮次（终态 = clean）

- 偏离审计（explore，只读，B1–B8 ∥ A1–A8 逐条走查）：结论「代码面完整」，4 项提请注意 —— §6 五个判词未翻 · §2「条目非对象」与 EDIT.md §5 相抵 · 档级失败原因归属 · `跨 path 并行` 措辞。
- 代码评审第 1 轮（advisor · code）：2🔴 + 2🟡 + 3🔵 = 7 条 → changes-required。本席修 4 条：🔴 非对象条目逐条化 + A9 · 🟡 编辑器径补用例 A10 · 🔵 `one undo unit` · 🔵「每条一行」措辞（edit.md）。
- 代码评审第 2 轮（复核只核修复声明）：7 条 → **pass**。余 2 项可选 —— file.mjs 的 schema 半修（本席已随手改掉）· 批档 §2 验收表未补 A9 ∥ A10（归设计笔）。
- 剩余全部是设计笔的面（下面第 1–5 条），本席无写面，只报不写。

#### 须同轮收的（设计笔 ∥ 父侧）

1. `docs/core/design/EDIT.md` §6 五个「未落」判词（批量回执汇总行 · 批量逐条落盘 · 批量逐条回执 · 帧面逐条失败 · 描述面文本）——代码已落、判词仍是「未落」，设计档现在在说假话。
2. `docs/core/design/EDIT-HELPERS.md`：§7.3 R3「`整批拒（原子，零写）`」∥「判定点…`命中即抛、零写`」∥ §7.2 两行仍规定模型可见文本写 `overlap ⇒ the whole batch is refused, nothing written`——与 EDIT.md §5 与交付码相反，而 EDIT.md 自称「帧判据单源 = EDIT-HELPERS §7.3」。
3. `docs/core/design/TOOLS.md` 两处：`edits 数组批（原子）` · `重叠整批拒（原子零写）`。
4. 批档 §2 验收对照表补 A9（条目成形错逐条面）∥ A10（编辑器径注入面）两行——这两条判据原文现在只在用例档里，收口删档后来源无处可查。
5. `docs/core/design/EDIT.md` §5：① 档级失败原因归属补半句（见「两处判断」2）；②「跨 path 并行」与串行实现两说，择一。
6. 一处随改动的活口：非对象条目改逐条后，`assertEditEntries` 的「预扫于条目循环之前」只对桥面成立——该函数注释已同步。

## §6 验证与收口（父代理）

**交付面**

- `thincoder-core/tools/edit-batch.mjs`：逐条成败（`fail(i, …)` + `continue`）；末行 `edit batch: <k>/<M> entries applied, <M−k> failed — <K> file(s) written`；不落暂存档、就地写
- `thincoder-core/tools/edit-diff.mjs`：`rejections` ∥ `onEntryError:"collect"` ∥ 三个函数的 `scope` 选项
- `thincoder-cli/src/acp/buffered-edit.mjs`：两个调用点显式传参，**桥面回执与语义零变**
- `thincoder-core/tool-docs/edit.md` ∥ `thincoder-core/tools/file.mjs` 的 `edits` 参数描述：那两句 `atomic … writes nothing` 已改成逐条口径（D11 同层同改；`file.mjs` 属声明外改动，实施席主动披露）
- 设计档回正：`EDIT.md` §5 ∥ §6 五处判词 ∥ `EDIT-HELPERS.md` §7.2–§7.3 ∥ `TOOLS.md` §6.6 ∥ §6.26；需求档 F16 已按逐条成败重切
- 集成用例 `test/integration/edit-batch-entry-outcome.test.mjs`（`CLI 41-1`）∥ `test/RTM.md` 索引行 ∥ `test/rtm/tooling.md`

**父侧独立验证（自跑，不复用实施席断言）**

```text
① 一条失败不连坐：4 条 / 3 档，第 2 条 old_string 匹配不到
   → 回执 edits[1] — failed: old_string not found in b.txt（带 searched ∥ hints）
   → 末行 edit batch: 3/4 entries applied, 1 failed — 2 file(s) written: a.txt, c.txt
   → 盘上 b.txt 字节未动、a/c 已落

② 档级失败只连坐该档：一档被写前门拒（docRoot 内超长段落）、另一档普通文本
   → 两条均 edits[i] — failed: DOC-CHECK GATE: REFUSED（1 段文字太长）
   → 末行 edit batch: 1/3 entries applied, 2 failed — 1 file(s) written: good.txt
   → 被拒档盘上原样、good.txt 已更新
```

**两态读数互不相同 ⇒ 判据不是单向的**：失败面红、成功面绿，且「别的档照落」两次都在盘上验到。

**测试**

- 父侧收口跑：`node --test docs/batches/2026-11-09-edit-batch-atomic-receipt.test.mjs test/integration/edit-batch-entry-outcome.test.mjs` ⇒ `tests 12 · pass 12 · fail 0`。
- 本批单元测试档 **跑完已删**（父侧 `delete` 落盘，收口面按「用毕即删」处置）；读数留本节。
- 集成集：`test/integration/edit-batch-entry-outcome.test.mjs` 一条（`CLI 41-1`），常驻；本批新增集成用例 1 条，改写 0、冗余 0。
- 实施席另跑：`check-syntax` 298 档 OK ∥ 改前红侧（HEAD worktree）A1–A6 ∥ A9 ∥ A10 全 `not ok`、护栏面 A7 ∥ A8 `ok`（与设计预期一致）。

**文档门**：`doc_check(mode:"gate")` 对 `EDIT.md` ∥ `EDIT-HELPERS.md` ∥ `TOOLS.md` ∥ 本批批档 = `PASS`（4 档）。

**残留（挂账，另批清）**

- `#2234` ACP 桥面仍「全过才写」，与核面逐条成败两口径——待用户裁后归一。
- `#2232` `apply_patch` 提交段同形残留（抛裸 `rename`、不报已提交清单）。
- `#2233` `write-path.mjs` 档头「唯一例外 = apply_patch 的批级记账」已失准（本批 `edit` 成第二处）。

**收口判据**：用户 11:54 口径（「某条不成功就反馈这条不成功，不要整批返工」）+ 12:23「好」；设计面两轮 `pass`（第 3 轮取票）；实施面代码评审两轮（第 2 轮 `pass`）；父侧两条探针实测互不相同；交付门 PASS；无未决 🔴。
