# 2026-11-15 · edit 行号形态空串删除
> 六段，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 每段只有一个作者：作者的段可 `append` 加内容、可就地改（`edit`）；非作者一概拒。
> 编制：主 agent · 2026-11-15 · 来源 = 用户 2026-11-15 18:29 令「开工」；同日前序裁定：行号形态允许空 `new_string` 视同省略（删除），内容形态仍拒收；诱因是 2026-11-15 一次真实事故（`edit` 传空串被拒 → 改用 PowerShell 写文件 → `test/rtm/tooling.md` 编码被写坏）。。
> 台账 = #2457（core · 归批）。前情 = 无（独立批）。
## §1 讨论（主 agent）
**状态行**：已收口 2026-11-15
批起 sha = e1a07a40c840f3347350373a0b5e886d7328c6ad
<§1 模板占位：本批条目 / 关键判据 / 授权口径>

## 要解决什么

`edit` 的行号形态（`line` ∥ `startLine`+`endLine`）在 `new_string` 传空串时被拒。这个拒收有它的来历，但它与模型生成参数时的直觉相反，代价是一次真实的写坏事故。

现场（本会话 2026-11-15）：删 `test/rtm/tooling.md` 的一行，凭直觉写 `new_string: ""` → 被拒 → 绕去用 PowerShell 的 `Set-Content` → 整份档编码被写坏（UTF-8 字节按 GBK 解码），另丢两个空行、删除命令本身还静默失败。

**模型的直觉是「填这个字段」，不是「省略这个字段」。** 「省略等于删除」是知识，「空串等于删除」是直觉。而报错文案只在出错之后才被读到——第一次就撞墙，而第一次正是绕行的诱因。

## 已定决定（用户裁定）

- **已定决定**：行号形态允许 `new_string` 传空串，视同省略（即删除该行 ∥ 范围）；内容形态（`old_string` 匹配）仍拒收空串 · 用户原话：「我就想知道，哪个方案符合模型直觉？」→ 同轮选定放开语义（方案 B） · 时间：2026-11-15 18:20 前后
- **已定决定**：本批走完整流程（设计 → 评审 → 实施），不按 micro-batch · 理由：把原本被拒的输入变成合法，是语义面变更（破 micro 第 ④ 条「无语义面」） · 时间：2026-11-15 18:20 前后

## 判据：意图由谁表达

两块按同一条切分：

| 形态 | 删除意图由谁表达 | 空串处置 |
|---|---|---|
| 行号 | `line` ∥ `startLine`+`endLine` 已显式指明删哪一行 ∥ 范围 | **视为删除** |
| 内容 | `old_string` 匹配 + `new_string` 的内容 | **仍拒** |

内容形态不能放开：`replace_all: true` 配空串会删掉所有匹配，那是真正的误删面。

## 现场坐标（实读，本轮）

`thincoder-core/tools/edit-diff.mjs` 的 `validateEditEntry` 里两处 `new_string === ""` 抛错，分别在行号形态分支与内容形态分支；两分支互斥（`hasLineParams` 判后 early return）。

`thincoder-core/tools/edit-batch.mjs` 的 `applyLineEdit` 开头再拦一次显式空串；同函数随后的删除分支只认 `new_string === undefined`。

`thincoder-core/tools/edit-diff.mjs` 的 `applyPatchLines` 对内容形态的空 `newText` 返回失败。

`computeEditEntry` 的顺序是「先 `validateEditEntry`，再按 `hasLineParams` 分派到 `applyLineEdit`」——所以**归一必须发生在这两步之前**；只删行号形态那道 throw，下游 `applyLineEdit` 会接着抛。

## 改法方向（不是唯一解，设计席可提出更好的）

在 `computeEditEntry` 进入行号分支之前做一次投影：行号形态且 `new_string === ""` ⇒ 投影出 `new_string: undefined` 的新 entry。

- **不就地改**：批量场景里 entry 是调用方数组的元素，就地赋值会污染兄弟条目
- **两处旧检查原样保留**：`applyLineEdit` 是导出函数，别处直接调用时那道防御仍要生效
- 归一后下游走既有的 `deleted: true` 分支，删除语义显式，不靠 `splitLines("")` 的巧合

## 边界

- 内容形态的空串拒收**不动**，`applyPatchLines` 的空 `newText` 守卫也不动
- `hashline_edit` ∥ `apply_patch` 若复用 `validateEditEntry`，行为不得改变——设计席须先查清复用面再动手
- 不改 `edit` 之外的任何工具
- 报错文案：行号形态那道 throw 失效后，`EMPTY_NEW_STRING_LINE` 常量随之退场；内容形态的 `EMPTY_NEW_STRING` 保留

## 验收面

1. 行号 `""` ⇒ 该行被删，回执 `deleted: true`，与省略 `new_string` 的结果逐字段相同
2. 范围形态（`startLine`+`endLine`）`""` ⇒ 该范围被删，同上
3. 批量 edits 里一条 `""`、一条正常替换 ⇒ 两条各按自己的语义生效，兄弟条目未被污染
4. 内容形态 `""` ⇒ 仍拒，报文点名它是内容形态、并说明行号形态可传空串
5. `edit` 的 schema 描述与 `thincoder-core/prompts/knowledge/tool-edit.md` 同口径（D11 同轮扫）
6. 红侧：改前同一输入（行号 + 空串）必抛，改后返回 `deleted: true`

## 勘察与先例

先例 = 同一工具族已有的「省略即删除」语义（`new_string === undefined` ⇒ 删行），本批只是让空串走同一条路，不新造分支。

勘察证据：已读 `edit-diff.mjs` 的 `validateEditEntry` ∥ `applyPatchLines` ∥ `computeEditEntry` ∥ `isSingleLineReplace`，`edit-batch.mjs` 的 `applyLineEdit` 与其删除分支，以及两处文案常量。外部源码档 = 已查，无相关：本机制完全在本仓工具面内。

## 设计评审 #33 裁定（主 agent · 2026-11-15 18:35）

评审 `changes-required`（1 🔴 · 8 🟡 · 1 🔵）。逐条裁定：

| # | 严重度 | 裁定 | 依据与处置 |
|---|---|---|---|
| 1 | 🔴 | **Not an issue** | 场景真实且在案：本档 §1「现场（本会话 2026-11-15）… 凭直觉写 `new_string: ""` → 被拒 → 绕去用 PowerShell 的 `Set-Content` → 整份档编码被写坏」，§2 集成增量理由亦记「本条对应一起真实事故」。评审席未绑定批档故读不到。设计档不得回指批档（批档可整份删除），故持久形态只能是判据句「删除意图由谁表达」，场景留过程记录 |
| 2 | 🟡 | **Not an issue** | §2 已裁定「`new_string` 的空值归属是参数级语义，单源在 EDIT.md §1，需求面无须新增条目」。在 `TOOLS.md` 再写一份就是同一规则两份活本（D2），漂移风险大于可查性收益 |
| 3 | 🟡 | **Dispatched** | 设计档缺「工具描述面随 §1 语义更新」这一句；§2 的 E5 ∥ A5 有，但实施席读的是设计档 |
| 4 | 🟡 | **Dispatched** | §4 是主题清单，无逐条可观察结果；按 F2-5 展开 |
| 5 | 🟡 | **Dispatched** | 与 #4 同处一并解：§4 只留持久不变量，本批验收清单在 §2「验收对照 A1–A6」 |
| 6 | 🟡 | **Dispatched** | 档头「最近先例」只列设计档名、无实现坐标；而 §2「勘察与先例」已带坐标。按 `#2450` 已确立的处置（设计档不载过程记录行），删档头该行 |
| 7 | 🟡 | **Dispatched** | 同上：档头「勘察证据」删；§2「外部源码档 = 已查，无相关」是它的正位 |
| 8 | 🟡 | **Dispatched** | 「归一」「投影」「当前阈值」未定义、符号无模块坐标，实施席无法判读 |
| 9 | 🟡 | **Not an issue** | §2 已载档位结论（六档均 ≤ 500，机读清单第三列）与集成增量（新增 `CLI 41-3`）；评审席未绑定批档故看不到 |
| 10 | 🔵 | **Dispatched** | §3「路由门放行」补符号坐标，使该断言可核 |

修面面 = 设计档 `docs/core/design/EDIT.md` 一个；不改需求档、不改 §2 条目与验收对照。

## 修面轮 #35 上抛裁定（主 agent · 2026-11-15 18:40）

**上抛 1（E7 无验收行）：授权补 A7。** 我上一轮的「不改 §2 条目与验收对照」是防夹带新语义，不是禁止补齐本批自己的验收缺口——E7 是设计席自己查出的连带面（桥单形态删除回执），有 E 无 A 就是一条无人验的条目，收口时判的正是 §2 这张表。

- A7 写成可判形：单形态（顶层 `line`/`startLine`+`endLine`）传 `new_string: ""` 经 ACP 桥 ⇒ 回执以 `Deleted line N of <path>` 起头，不得出现 `OK: edited`
- 落点 = `thincoder-cli/src/acp/buffered-edit.mjs` 的 `editSingle`；单测档记该读数

**上抛 2（§2「设计档落点」仍写「投影」）：一并改。** 设计档按 #8 已让「投影」退场，§2 那半句改成明文（不在 `computeEditEntry` 里另造条目送进下游），口径与设计档对齐。

边界不变：不改 E1–E6、不改 A1–A6、不动机制方向，仍只改 `docs/core/design/EDIT.md` 与本档 §2。

## 修面轮 #37 裁定（主 agent · 2026-11-15 18:41）

- **A5 授权改（原「不改 A1–A6」在此开一个口子）**：允许把 A5「怎么验」的「那六处」改成「五段 `file.mjs` 描述 + 两处 `tool-edit.md` 删除句，逐句读那七处」。理由：本轮自查把 `tool-edit.md` 的删除口径从一处更正为两处（第 4 行「give new_string to replace, or OMIT new_string to delete the line/range」与第 17 行「Delete a line/range by number → omit new_string」），同一个判据的读数随内容变旧，验收数与判据必须同尺。不动 E1–E6、不动机制方向、不新立条目。
- **`#2449` 裁定：保持独立排期，本批不处置。** 它改的是集成用例期望与引用（`CLI 43-1/43-2` 断的是「`EDIT.md` 含 `req:F16`」），本批改的是空串语义，两者只是碰巧同档。它的复启条件已改为「该族漂移一次收敛时」（同族另有 `#2454` 的 `linter.mjs` 引 `TOOLS.md` §10.2、`edit-diff.mjs`／`edit-batch.mjs`／`buffered-edit.mjs` 注释引 `EDIT.md` §5/§6/§8 D-14/D-15），本批不触发。
- **范围外线索驳回，不动作**：有人报「`test/RTM.md` 的 CLI 41 行三值仍写 `有/缺/缺`，与 `rtm/tooling.md` 已有 41-1 ∥ 41-2 不一致」。实读该表头「矩阵三值：`有` = 盘上存在对应集成用例」，第 47 行 CLI 41 的 CLI 列正是 `有`——已对上，不存在不一致。新增 `41-3` 属于同一故事，不改这三值。

## 派实施前裁定：§2 自相矛盾（主 agent · 2026-11-15 19:40）

`§2`「受影响文件与测试覆盖」首句写「其余 `.md` 无改」，与同节 `E5`「schema 描述与 `prompts/knowledge/tool-edit.md` 同口径」、`A5`「`tool-edit.md` 的两处删除句…逐句读过」直接冲突。按字面执行，实施席不会动 `thincoder-core/prompts/knowledge/tool-edit.md`，A5 必然红。

口径：`docRoot` 下的文档面才受「其余 `.md` 无改」约束；`thincoder-core/prompts/**` 是产品面的提示词档，`D1` 把提示词改动归 `eng-coder`，本批确实要改它。

派 `#41`（设计席 fix 轮）只做一件事：把该句改成区分文档面与提示词面，把 `thincoder-core/prompts/knowledge/tool-edit.md` 写进受影响文件表，并按同一把尺（`countContentLines`，批起快照 `e1a07a40`）判定它是否进机读清单。

不动的：E1–E7、A1–A7、机制方向、`EDIT.md`（已评审通过，字节不得再动）。

## 派单未落地与两处上抛裁定（主 agent · 2026-11-15 19:44）

`#41` 未改 §2 第 195 行，「其余 `.md` 无改」仍在盘（本轮实读）。该句与 E5／A5 冲突的裁定不变，重派一次，只许改这一处。

**上抛 1 · `EDIT.md` §2 与 `EDIT-HELPERS.md` §4 同规则两份活本**：本批不删。`EDIT.md` 已过评审、字节冻结，删句会让实施席读到的迁移序表述与评审过的版本不一致。落台账另立一行，整族（设计档重写后引用与重复未跟）一次收敛。

**上抛 2 · §1「边界」里 `applyLineEdit` 是导出函数那句**：事实更正接受——调用方只有 `computeEditEntry` 一处。结论不变：决策 2 依据的是模块面单源，不是这条前提。§1 不改字（它是过程记录，`§2` 已记事实）。

## 落地核对后的一处设计档失真（主 agent 裁定 · 2026-11-15 19:56）

`#45` 交付后我实读 `thincoder-core/tools/file.mjs` 第 231–239 行核对 A5，结论：**代码是对的，设计档那句是错的。**

**盘上事实（分段，不是五段同形）**：
- `new_string`（232）两侧都写：「content-based edits require it (an empty string is an explicit error there: with replace_all it would delete every match); with line-based targeting (line/startLine/endLine) give it to replace the line/range, or OMIT it — an empty string is the same delete, not an error」
- `line`（233）∥ `startLine`（234）∥ `endLine`（235）只写行号侧：「OMIT new_string (an empty string deletes too) to DELETE the line ∥ range」，三段均带 `mutually exclusive with old_string`
- `edits`（239）两侧都写：「line-targeted entries may omit it (or pass an empty string — same delete) to DELETE the line/range, while content-targeted entries need a non-empty new_string」

**设计档 §1 现文**：「`new_string` ∥ `line` ∥ `startLine` ∥ `endLine` ∥ `edits` 五段描述，都写成「行号形省略或传空串 = 删除该行 ∥ 范围；内容形传空串 = 显式错」」——「都写成」与事实不符。

**为什么不改代码去迁就这句**：`line` / `startLine` / `endLine` 三段自述 `mutually exclusive with old_string`。在这三段的描述里写「内容形传空串 = 显式错」，等于在一句声明两字段互斥的描述里解释另一个字段的语义——自相抵。故收窄设计档，不动代码。

**处置（本批内，设计席的笔）**：把 §1 那句收窄成分段事实——哪两段两侧都写、哪三段只写行号侧、那三段为何不写内容形半句（互斥）；保留「描述面与本表同口径」这个要求本身，并说明这五段上的「同口径」是分段的，不是同一句复制五遍。

**边界**：只动 `docs/core/design/EDIT.md` 该句；不碰 §1 形态表、不碰 §2/§3/§4 实质、不碰代码、不碰 `tool-edit.md`、不碰本档 §2 ∥ §5。不新增语义——这是把一句过头的话改回事实。

## 设计席 `#46` 上抛裁定（主 agent · 2026-11-15 20:02）

**`EDIT.md` §1 那两处引文失真是真缺陷，准改。** `#46` 报：该句引 `tool-edit.md` 两句原文「give new_string to replace, or OMIT new_string to delete the line/range」与「Delete a line/range by number → omit new_string」，而实施轮 `#45` 已给两句补上括号「(an empty string deletes too)」——逐字比对找不到出处，读者会以为这两处还没改。

处置：派 `#47` 把这两处引文更新为盘上现文（逐字），不改成描述式——设计档引的是「两处都要带上这一句」这个事实，逐字引用可核。

边界：只动 §1 这一处引文的两段「」内文字，§1 其余、§2–§4、代码面、本档 §2 ∥ §5 一字不动。

**`#2458` 的 `resume_when` 已收窄**：原写「下次动 `EDIT.md` 或 `EDIT-HELPERS.md`」，本轮虽动了 `EDIT.md` 但动的是 §1、不是 #2458 指向的 §2 重复句，故改为「下次动 `EDIT.md` §2 ∥ `EDIT-HELPERS.md` §4 ∥ 整族收敛轮」——否则本条会被一次不相关的触碰误判为已满足。

## `#47` 上抛裁定：§2 A5 引文同笔对齐（主 agent · 2026-11-15 20:05）

**准改。** `#47` 报：§2 的 A5「怎么验」仍把 `tool-edit.md` 两句引成省略后的旧形（`give new_string to replace, or OMIT new_string to delete the line/range` ∥ `Delete a line/range by number → omit new_string`），而这两句盘上现文都已带 `(an empty string deletes too)`，且 §5 的 A5 读数已是现文——同一个失效只剩 §2 这一份。

判：不阻塞收口（A5 判据「都不再把空串说成错误」成立），但**留下就是一句指向盘上不存在文本的引用**，与 20:02 那条同形同源，同笔改净。

边界：只把 A5 括号内两段引文换成盘上现文；E1–E7、A1–A7 的判据句、机制方向、代码面、`EDIT.md`、本档 §3 ∥ §5 一字不动。

## §2 批次任务与设计（eng-designer）
**状态行**：设计完成

### 本批条目（覆盖）

| # | 条目 | 落点 |
|---|---|---|
| E1 | 行号形（`line`）传 `new_string: ""` ⇒ 该行被删，`deleted: true`，与省略 `new_string` 逐字段相同 | edit-batch.mjs `applyLineEdit` |
| E2 | 范围形（`startLine`+`endLine`）传 `""` ⇒ 该范围被删，同上 | 同上 |
| E3 | 批内一条 `""`、一条正常替换 ⇒ 各按自己语义生效，兄弟条目未被污染 | 同上（归一取局部量，不改条目对象） |
| E4 | 内容形传 `""` ⇒ 仍拒，报文点名内容形并指到行号形 | edit-diff.mjs `EMPTY_NEW_STRING` |
| E5 | schema 描述与 `prompts/knowledge/tool-edit.md` 同口径 | file.mjs ∥ tool-edit.md |
| E6 | 红侧：改前行号+空串必抛，改后 `deleted: true` | 单测档 |
| E7 | ACP 桥单形态行号删除回执说真话（不得说成 edited） | buffered-edit.mjs |

E7 不是新需求，是同一个改动落到第二张面上的必然后果：桥经 `computeEditEntry` 继承行号语义。

而路由门按「行号参数 + 字符串 `new_string`」放行（`thincoder-cli/src/acp/bridge.mjs` 的路由判据），空串改后就是一次删除。

### 设计档落点

`docs/core/design/EDIT.md`：§1 参数（两形态的空值矩阵）· §2 匹配与应用（归一落点，以及为何不在 `computeEditEntry` 里另造 `new_string: undefined` 的条目送进下游）· §3 写与桥（桥回执）· §4 验证。

`docs/core/design/EDIT-HELPERS.md` 不动：本批不碰 EOL、失败候选、行号锚与批量帧，该档正文没有一句因本批而失真。

`docs/core/requirements/TOOLS.md` 不动：该档 §2「F16 · edit 批量逐条成败」是工具面契约，与本批不冲突。

`new_string` 的空值归属是参数级语义，单源在 EDIT.md §1，需求面无须新增条目。

### 机制设计

**归一落一次，在行号执行体内**：`applyLineEdit` 开头取局部量 `target = entry.new_string === "" ? undefined : entry.new_string`，其后的删除分支与替换分支都读它。

结果走既有 `deleted: true` 分支，不靠 `splitLines("")` 切出空数组的巧合。

**删掉行号分支那道 throw**：`validateEditEntry` 行号分支的 `new_string === ""` 报错必须退场。

理由是它挡在更上游——批面（`edit-batch.mjs` 的条目预扫，即其 `applyEditBatch` 的①分组步逐条调它）与桥面（`buffered-edit.mjs` 的分组步）都先调它，留着就永远到不了 `applyLineEdit`。

**常量退场**：`EMPTY_NEW_STRING_LINE` 随之退场，`edit-batch.mjs` 的导入同笔去掉它。

**内容形文案改写**：`EMPTY_NEW_STRING` 现在要干三件事——点名这是内容形、说明内容形为何不能收空串（`replace_all` + 空串会删掉全部匹配）、指到行号形可传空串。

**不动的东西**：`applyPatchLines` 的 `newText === ""` 守卫、`isSingleLineReplace`、内容形的全部判定序、`applyLineEdit` 的越界与互斥校验。

**复用面实测**（本轮 `grep` 全仓 `**.mjs` 的 `edit-diff.mjs` 导入行，命中四处）：

- `thincoder-core/tools/edit-batch.mjs` —— 核批面，自动继承。
- `thincoder-core/tools/file.mjs` —— 工具壳，只导 `runSingleEdit`。
- `thincoder-cli/src/acp/buffered-edit.mjs` —— 桥，导 `validateEditEntry` ∥ `computeEditEntry` ∥ `hasLineParams` 等。
- `thincoder-cli/src/acp/bridge.mjs` —— 只导 `hasLineParams`。

`hashline_edit` 与 `apply_patch`（`patch.mjs`）不导入本档任何符号 ⇒ 行为不变。`patch.mjs` 只导入 `write-path.mjs`、`edit-receipt.mjs`、`git-run.mjs` ∥ `node:` 模块。

**头注同笔改**：`edit-diff.mjs` 头注与 `applyLineEdit` 注释里「行号形显式空串 = 显式错」的句子在本批失效，随改动作同笔改写。

桥里「单形态删行走不到这里」那段注释同样失效，改为说明删除形回执怎么出。

### 验收对照

| # | 判据（读者可判） | 怎么验 |
|---|---|---|
| A1 | 行号形 `""` 与省略 `new_string` 对同一份内容产出逐字段相同的返回（`updated` ∥ `deleted` ∥ `lineShift` ∥ `occurrences`） | 单测档两笔对照 |
| A2 | 范围形同 A1 | 单测档两笔对照 |
| A3 | 批内混合：两条回执分别以 `Deleted line N` 与 `Edited …replaced 1 occurrence(s)` 起头；传入的条目对象未被改写 | 单测档（`deepEqual` 原件） |
| A4 | 内容形 `""` 抛错，报文点名内容形、并说明行号形可传空串 | 单测档 |
| A5 | `file.mjs` 的五段描述（`new_string` ∥ `line` ∥ `startLine` ∥ `endLine` ∥ `edits`）与 `tool-edit.md` 的两处删除句，都不再把空串说成错误 | 逐处读那七处：`file.mjs` 五段描述逐段点过，`tool-edit.md` 两句（`give new_string to replace, or OMIT new_string (an empty string deletes too) to delete the line/range` 与 `Delete a line/range by number → omit new_string (an empty string deletes too)`）逐句读过 |
| A6 | 红侧：同一输入（行号 + 空串）改前抛 `EMPTY_NEW_STRING_LINE`，改后返回 `deleted: true` | 改前快照跑一次、改后跑一次，读数各记一行 |
| A7 | 单形态（顶层 `line` ∥ `startLine`+`endLine`）传 `new_string: ""` 经 ACP 桥 ⇒ 回执以 `Deleted line N of <path>` 起头，且整份回执不出现 `OK: edited` | 单测档直接调 `editSingle`（`thincoder-cli/src/acp/buffered-edit.mjs`，`readBuffer` ∥ `writeBuffer` 用桩注入），断言回执首行与禁句 |

A7 是 E7 的验收行：E7 无 A 就是一条收口无人验的条目。路由门按「行号参数 + 字符串 `new_string`」放行（`thincoder-cli/src/acp/bridge.mjs`），空串是字符串，所以这条路径改后真会走到；回执继续印 `OK: edited` 就是把一次删除说成一次替换。

### 受影响文件与测试覆盖

文档面（`docRoot` 下）：`docs/core/design/EDIT.md`（本席写）。其余 `docRoot` 下的 `.md` 无改。

提示词面（产品面，D1 归 `eng-coder` 写）：`thincoder-core/prompts/knowledge/tool-edit.md` 在本批改动面内——E5 ∥ A5 要求它的两处删除句与 `file.mjs` 的 schema 描述同口径。

它不进机读清单：机读清单要喂的是 tier 门的读数臂，判域 = `batch-tier-gate.mjs` 的 `CODE_EXTS`（`.mjs` ∥ `.cjs` ∥ `.js` 闭集），`.md` 不在其中，它也就不带行数读数。

同一把尺仍过了一遍：`countContentLines` 量 `git show e1a07a40c840f3347350373a0b5e886d7328c6ad:thincoder-core/prompts/knowledge/tool-edit.md`，读数 38；记在此处只说明该档确已过尺，不进第三列、不作门槛判据。

测试：单测档 = `docs/batches/2026-11-15-edit-empty-string-deletion.test.mjs`（本批新建，收口即删）；集成用例 = `test/integration/edit-batch-entry-outcome.test.mjs`（改）。

索引面：`test/rtm/tooling.md` 的 CLI 41 节加 `41-3` 一行（内容见「集成增量」）。它是 `.md`，与上面的提示词档同理——不进机读清单、不带行数读数。

档位结论：本批改动的代码档在批起快照上均 ≤ 500（读数见机读清单第三列，量法 `countContentLines`）。

按 `docs/core/standards/CODE-TIER.md` §2.1 不进入拆分讨论；收口时按 §2.2 的 800 复判。

### 关键决策

**决策 1：归一落在 `applyLineEdit` 内，不在 `computeEditEntry` 里投影。**

被拒方案 = §1「改法方向」的投影法（进入行号分支前投影出 `new_string: undefined` 的新 entry）。它到不了下游：批面与桥面的分组步都先调 `validateEditEntry`。

要让它到达下游，就得同时删掉那道 throw 并保留 `applyLineEdit` 的防御——一个输入于是有两套语义，正是要灭的漂移。

持久理由：一个输入一条语义，单源在行号执行体。

**决策 2：`applyLineEdit` 的显式空串拦截改成归一，而不是原样保留。**

§1 边界曾倾向「两处旧检查原样保留」，但模块面上 `applyLineEdit` 就是行号形的语义本体。

它继续对 `""` 抛错，就是工具面接受、模块面拒绝，同一次调用两条判据。

**决策 3：内容形不放开。** `replace_all: true` 配空串 = 删掉全部匹配，删除意图无界。

行号形的删除意图由行号表达，内容形的删除意图只能由内容表达。

**决策 4：桥的单形态回执补删除形。** 路由门已放行该输入，回执继续印 `OK: edited …` 就是一句假话。

跨端对同一输入的结局必须同形。

### 集成增量（对 `test/RTM.md`）

- 改写：无。
- 删除：无。
- 新增：`CLI 41-3`，题名「批内行号形空串按删除生效：一条删、一条替换各按语义，内容形空串仍拒」。
- 落点：`test/integration/edit-batch-entry-outcome.test.mjs`，并在 `test/rtm/tooling.md` 的 CLI 41 节加一行。
- 故事：CLI 41（批量改多档、逐条说清）已存在，不新增故事号。

理由：本条对应一起真实事故（2026-11-15 `edit` 拒收空串 → 绕行 PowerShell 写坏档），属「生产真出过的问题」这一入口。

单形态面由本批单测档覆盖、收口即删，故永久面押在批量形。

### 勘察与先例

先例 = 同一工具族既有的「省略 `new_string` = 删除」，本批让空串走同一条路，不新造分支。

勘察证据（本轮实读）：

- `thincoder-core/tools/edit-diff.mjs` 的 `validateEditEntry` ∥ `computeEditEntry` ∥ `applyPatchLines` ∥ 两处文案常量。
- `thincoder-core/tools/edit-batch.mjs` 的 `applyLineEdit` 与其 `new_string === undefined` 删除分支。
- `thincoder-core/tools/file.mjs` 的 `edit` 参数描述（`new_string` ∥ `line` ∥ `startLine` ∥ `endLine` ∥ `edits`）。
- `thincoder-core/prompts/knowledge/tool-edit.md`。
- `thincoder-cli/src/acp/buffered-edit.mjs` 的单形态与分组步；`bridge.mjs` 的路由门。

外部源码档 = 已查，无相关：本机制完全在本仓工具面内。

### 上抛项

**一项已裁（本轮核查新发现，处置见本节末）**：设计档 `docs/core/design/EDIT.md` §2「批量行号条目先按 startLine 降序，重叠双方失败；内容条目随后按调用序」与 `docs/core/design/EDIT-HELPERS.md` §4「planEditEntries 给行号条目降序并拒重叠；applyPlannedEntries 累积内容、收集条目失败并按原调用序返回」是同一条规则的两份活本（D2）。

同段前句「行号必须通过 `lineAnchorVerdict`」是引用，不构成重复。评审轮 2 的 🔵 #11 记作 `unverified` 后通过；本轮两档实读，重复成立。

本席不改：§1 已圈定本批改面（不改 E1–E6、不改 A1–A6、不动机制方向），删这句会改动实施席读到的迁移序表述，属越界处置。

**已裁（19:44 同日裁定）**：本批不删这句——`EDIT.md` 已过评审、字节冻结，改句会让实施席读到的迁移序与评审过的版本不一致。落台账 `#2458`（`core` 板 · 触发 `条件`），与 `#2449` ∥ `#2454` 同族，整族一次收敛。

#2449（EDIT.md 不含 F16，集成用例 CLI 43-1/43-2 稳定红）已裁：保持独立排期，本批不处置——它改的是集成用例期望与引用，本批改的是空串语义，两者只是碰巧同档；裁定与复启条件见 §1「修面轮 #37 裁定」。

### 自检复核（本轮现量）

本席复读 §1 与本档 §2，逐面重核 §2 的事实句。

本轮现量的读数（量法 = `countContentLines`，`thincoder-core/agent-tools/batch-tier-gate.mjs`；取数 = `git show e1a07a40c840f3347350373a0b5e886d7328c6ad:<档>`）：483 ∥ 290 ∥ 461 ∥ 217 ∥ 92。

依次 = `edit-diff.mjs` ∥ `edit-batch.mjs` ∥ `file.mjs` ∥ `buffered-edit.mjs` ∥ `edit-batch-entry-outcome.test.mjs`，与机读清单第三列逐档相等。

- **复用面**（`git grep -n "edit-diff.mjs" -- "*.mjs"`）：导入方四处，与「复用面实测」所列逐档相符。`applyLineEdit` 的调用方只有 `computeEditEntry` 一处（`thincoder-core/tools/edit-diff.mjs`）⇒ §1 边界「别处直接调用时那道防御仍要生效」不成立；决策 2 本就按模块面单源处置，方向不变。
- **删除形与回执**：`applyLineEdit` 的删除分支返回 `{ …, occurrences: 1, deleted: true }`；`editSingle`（`thincoder-cli/src/acp/buffered-edit.mjs`）现无删除分支，恒印 `OK: edited …` ⇒ A7 的红侧在盘，不是空断言。
- **描述面**：`file.mjs` 的五段描述（`new_string` ∥ `line` ∥ `startLine` ∥ `endLine` ∥ `edits`）在盘，现文把空串说成错误；`tool-edit.md` 的两处删除句在盘，逐句与 A5 所引相同。
- **集成增量落点**：`test/RTM.md` 的 CLI 41 行 CLI 列 = `有`（本批不改三值）；`test/rtm/tooling.md` 的 CLI 41 节现有 41-1 ∥ 41-2，`41-3` 未被占用；41-1 的证据列已是本批要改的那档 ⇒ 追 41-3 不新增集成档。

**受影响文件（机读清单）**

```
| 档 | 分拆方案 | 行数 |
|---|---|---|
| thincoder-core/tools/edit-diff.mjs | — | 483 |
| thincoder-core/tools/edit-batch.mjs | — | 290 |
| thincoder-core/tools/file.mjs | — | 461 |
| thincoder-cli/src/acp/buffered-edit.mjs | — | 217 |
| test/integration/edit-batch-entry-outcome.test.mjs | — | 92 |
| docs/batches/2026-11-15-edit-empty-string-deletion.test.mjs | — | 新 |
```

读数取法：批起快照 sha `e1a07a40c840f3347350373a0b5e886d7328c6ad` 上逐档 `git show` 后过 `countContentLines`；单测档在快照上不存在，写 `新`。

本批不新建代码档、不搬档，第二列全为 `—`。

## §3 设计评审（评审子代理）
**状态行**：评审通过



### 轮次 1（评审子代理）

**结算**：未签发（no-valid-echo）· 2026-11-15

    | # | Severity | Status | Evidence |
    |---|----------|--------|----------|
    | 1 | 🔴 | New | `EDIT.md` §1 "删除意图由谁表达，决定空值算不算删除。" + §1 "显式错：报文点名这是内容形，并说明行号形可传空串" — no scene quoted, no reproduction path anywhere in the file |
    | 2 | 🟡 | New | `TOOLS.md` §2 F16 "按条目报告，失败不掩盖其他条已写结果；同档合并写。" — the only edit clause; silent on the empty value |
    | 3 | 🟡 | New | `TOOLS.md` §1 "一份工具的完整描述说明用途、参数、路由、副作用、错误和限制" — no description update in `EDIT.md` |
    | 4 | 🟡 | New | `EDIT.md` §4 "验证互斥、空串/省略在两形态各自的结局、…和真实汇总。" — topic list, no per-case observable result |
    | 5 | 🟡 | New | `EDIT.md` §4 heading `## 4. 验证` versus METHODOLOGY F2-4 "一次性文件清单与执行验收归过程记录" |
    | 6 | 🟡 | New | `EDIT.md` header "最近先例：`WRITE.md` 的写路径与 `APPLY-PATCH.md` 的部分失败。" — design docs only, no implementation coordinates, no precedent batches |
    | 7 | 🟡 | New | `EDIT.md` header "勘察证据：已读行号/内容形、匹配、批量和 ACP 桥。" — no source documents named |
    | 8 | 🟡 | New | `EDIT.md` §2 "归一在 `applyLineEdit` 内落一次" and "不在 `computeEditEntry` 里投影"; §2 "当前阈值" |
    | 9 | 🟡 | New | review scope = `EDIT.md` + `TOOLS.md` only; no batch record §2 supplied (tier conclusion / RTM delta) |
    | 10 | 🔵 | New | `EDIT.md` §3 "路由门放行「行号参数 + 字符串 `new_string`」" — unverified, code outside scope |
    本轮未回显有效 token（评审回执不完整）
    计数：🔴 1 · 🟡 8 · 🔵 1 · 未标 0


### 轮次 2（评审子代理）

**结算**：已签发（pass）· 2026-11-15

    | # | Severity | Status | Evidence |
    |---|----------|--------|----------|
    | 1 | 🔴 | Accepted | 评审声明排除项「分支场景在批档 §1」；`EDIT.md` §1「删除意图由谁表达」为判据不含场景，场景按 F2-4 归过程记录 |
    | 2 | 🟡 | Accepted | 评审声明排除项「需求面单源在 EDIT.md §1」；`EDIT.md` §1 形态表为单源，`TOOLS.md` §2 F16 保持通用 |
    | 3 | 🟡 | Fixed | `EDIT.md` §1「**工具描述面与本表同口径**」+ §4「工具描述面」条目 |
    | 4 | 🟡 | Fixed | `EDIT.md` §4「以下是本机制的常驻判据，读者按「输入 → 操作 → 可观察结果」读：」 |
    | 5 | 🟡 | Accepted | `EDIT.md` §4 自述「本机制的常驻判据」，非本轮执行验收 |
    | 6 | 🟡 | Fixed | `EDIT.md` 档头仅「> 需求 = `docs/core/requirements/TOOLS.md`；共享底层 = `EDIT-HELPERS.md`。」，无先例行 |
    | 7 | 🟡 | Fixed | 同上档头，「勘察证据」行已不存在 |
    | 8 | 🟡 | Fixed | `EDIT.md` §2「「归一」指的就是这一次取值」+ `FUZZY_MATCH_THRESHOLD` + 各符号带模块路径 |
    | 9 | 🟡 | Accepted | 评审声明排除项「档位结论与集成增量在批档 §2」；`EDIT.md` 无受影响文件表、无行号读数 |
    | 10 | 🔵 | Accepted | `EDIT.md` §3「**路由门**（`thincoder-cli/src/acp/bridge.mjs`）」条件式 +「省略 `new_string` 的单形态走不到桥」 |
    | 11 | 🔵 | New | `EDIT.md` 档头「共享底层 = `EDIT-HELPERS.md`」与 §2 的 `lineAnchorVerdict`／匹配顺序／`FUZZY_MATCH_THRESHOLD` 展开重叠（该档不在范围，`unverified`） |
    VERDICT: pass
    计数：🔴 1 · 🟡 8 · 🔵 2 · 未标 0

### 轮次 3（评审子代理）

代码评审核对（round 1 · 目标 = E1–E7 / A1–A7 落地代码）

| # | Severity | Status | Evidence |
|---|----------|--------|----------|
| 1 | 🟡 | New | `EDIT.md` §1「工具描述面与本表同口径」：「五段描述，都写成「行号形省略或传空串 = 删除该行 ∥ 范围；内容形传空串 = 显式错」」 vs `file.mjs` `line` 段「replace that single line with new_string, or OMIT new_string (an empty string deletes too) to DELETE the line」——三段行号参数只写行号侧；§4「哪一段说「空串是错误」，哪一段就不合格」已满足 |
| 2 | 🟡 | New | 批档 §5「实施记录（eng-coder）」标题下为空（§4/§5/§6 三标题相邻）；§2 A6「改前快照跑一次、改后跑一次，读数各记一行」与 A5「逐处读那七处」的读数无落点 |
| 3 | 🔵 | New | `buffered-edit.mjs` `editSingle` 的 `Deleted ${deleteTarget(out)} of ${p}` 无 "via IDE"，同档 `editBatch` 的是 `Deleted ${deleteTarget(s.out)} of ${s.g.path} via IDE`；EDIT.md §3「与核面同措辞」⇒ 实现与设计一致 |
| 4 | 🔵 | New | `bench/toolcall/prompts.mjs` tool.8 的 `absent("new_string")` 与 `bench/check/toolcall.check.mjs`「{ path: "docs/notes.txt", line: 40, new_string: "" }」判 false——本批后空串与省略同义，该期望会把合规删除判成不合规（批外面，frozen 基线需另裁） |

已核通过（实读，代码面）：

- `applyLineEdit` 的 `const target = entry.new_string === "" ? undefined : entry.new_string` 归一，结果走既有 `deleted: true` 分支。
- `validateEditEntry` 行号分支只剩 `typeof entry.new_string !== "string"`；`EMPTY_NEW_STRING` 三件事齐（点名内容形 ∥ 无界意图理由 ∥ 指到行号形）。
- `applyPatchLines` 的 `newText === ""` 守卫与 `isSingleLineReplace` 的 `new_string !== ""` 仍在。
- `EMPTY_NEW_STRING_LINE` 全仓源码面已无（仅 asar ∥ 旧日志）。
- 路由门 `typeof args?.new_string === "string"` 放行空串；`file.mjs` 五段描述与 `tool-edit.md` 两处删除句同口径。
- CLI 41-3 ∥ `test/rtm/tooling.md` 41-3 行 ∥ `test/RTM.md` CLI 41 三值对得上。

VERDICT: pass
计数：🔴 0 · 🟡 2 · 🔵 2 · 未标 0

## §4 用户批准（主 agent）

**批准形式 = 批次级授权**：用户原话「自动跑完」（2026-11-15 18:5x），覆盖本批全流程（设计 → 评审 → 实施 → 收口），故不另设单独批准步。

**设计侧前置已满足**：§3 轮次 2 结算 `评审通过`（`已签发`），本批 `designToken` 于该轮签发，实施席 `#45` 以该 token 起跑。

**实施期裁定共 7 次，全部落在 §1**（`#33` 裁定、`#35` 上抛、`#37` 裁定、派实施前 §2 自相矛盾、派单未落地与两处上抛、设计档失真、`#46` 上抛、`#47` 上抛）：均为流程内的就地裁定，未扩大设计语义；其中「改设计档而非补代码」一条（`EDIT.md` §1「五段都写两侧」失真）按「代码不对就改代码，目标变了才改设计」的分界判为**目标变了**——三段自述与 `old_string` 互斥，补代码会自相抵。

## §5 实施记录（eng-coder）
**状态行**：实施完成



### 交付（E1–E7）

| 条目 | 落点 | 处置 |
|---|---|---|
| E1 ∥ E2 | `thincoder-core/tools/edit-batch.mjs` `applyLineEdit` | 开头 `const target = entry.new_string === "" ? undefined : entry.new_string`；删除分支判 `target === undefined`，替换分支 `splitLines(target)`。单行与范围同一条路 |
| E3 | 同上 | 归一只取局部量，条目对象不就地改 ⇒ 兄弟条目零污染 |
| E4 | `thincoder-core/tools/edit-diff.mjs` `EMPTY_NEW_STRING` | 文案一件事变三件：点名内容形、给 `replace_all` 的无界理由、指到行号形可省略或传空串 |
| E5 | `thincoder-core/tools/file.mjs` 五段描述 + `thincoder-core/prompts/knowledge/tool-edit.md` 两处删除句 | 行号形一律写成「an empty string deletes too」；内容形写成显式错（`new_string` 段与 `edits` 段两侧都写）；两处删除句同句改 |
| E6 | 单测档 `docs/batches/2026-11-15-edit-empty-string-deletion.test.mjs` | 红/绿两组读数见下 |
| E7 | `thincoder-cli/src/acp/buffered-edit.mjs` `editSingle` | 回执改两路：`out.deleted` ⇒ `` Deleted ${deleteTarget(out)} of ${p} ``，否则仍是原确认形 |

- **退场**：`EMPTY_NEW_STRING_LINE` 常量与 `edit-batch.mjs` 对它的导入同笔去掉；`validateEditEntry` 行号分支那道 `new_string === ""` 的 throw 删除。全仓源码面已无该常量（余下命中只有 `thincoder-desktop/dist-*/resources/app.asar` 构建产物与旧日志）。
- **未动**（与设计 §2「保留不动的」逐条对应）：`applyPatchLines` 的空 `newText` 守卫、`isSingleLineReplace` 的 `new_string !== ""` 守卫、内容形判定序（空串先于 `replace_all`）、`applyLineEdit` 的越界与互斥校验。
- **头注同笔改**：`edit-diff.mjs` 头注与 `computeEditEntry` 注释、`edit-batch.mjs` 头注与 `applyLineEdit` 注释、`buffered-edit.mjs` 的「单形态删行走不到这里」那段，四处随改动作改写；新写的引用只指 `EDIT.md` §1 ∥ §2 ∥ §3（现存节）。

### 验收读数（A1–A7）

- **A6 红侧**（改前，同一单测档跑在未改的核上）：`node --test docs/batches/2026-11-15-edit-empty-string-deletion.test.mjs` ⇒ `tests 5 · pass 0 · fail 5`。A1 ∥ A2 ∥ A7 三条都抛 `Error: empty new_string with line-based targeting is an explicit error — OMIT new_string to delete the line/range …`，抛在 `validateEditEntry`；A3 的落盘读数是三行 `keep` ∥ `drop` ∥ `CHANGED`——空串那条没删成，`drop` 还在。
- **A6 绿侧**（改后同档同命令）：`tests 5 · pass 5 · fail 0`。A1 报 `deleted: true`、`updated` = `alpha` + `gamma` 两行。
- **A1 ∥ A2**：单测档两笔对照，`updated` ∥ `deleted` ∥ `lineShift` ∥ `occurrences` 逐字段相等（范围形 `lineShift` = −2）。
- **A3**：`applyEditBatch` 的真实回执第 1 条以 `Deleted line 2 of mixed.txt` 起头、第 2 条是 `Edited mixed.txt: replaced 1 occurrence(s)`、末行 `edit batch: 2/2 entries applied, 0 failed — 1 file(s) written: mixed.txt`；`deepEqual(entries, 原件)` 通过。
- **A4**：内容形空串抛错，报文含 `content-based` 与 `line-based`；`replace_all: true` 配空串同样抛。
- **A7**：`editSingle` 直调（`readBuffer` ∥ `writeBuffer` 桩注入），回执首行 `Deleted line 2 of buf.txt`、全文无 `OK: edited`、缓冲内容 = `one` + `three` 两行。
- **集成增量**：`node --test test/integration/edit-batch-entry-outcome.test.mjs` ⇒ `tests 2 · pass 2 · fail 0`（41-1 与新增 41-3）。
- **相邻面回归**（改动面相关，各跑一次）：`test/integration/edit-line-anchor.test.mjs`（28-1）∥ `test/integration/acp-bridge-batch-outcome.test.mjs`（41-2 两条）⇒ 3/3 绿。
- **语法面**：`thincoder-cli` 与 `thincoder-core` 各自的 `node scripts/check-syntax.mjs` ⇒ `125 file(s) OK` ∥ `327 file(s) OK`。
- **A5（七处逐处读）**：`file.mjs` 的 `new_string` ∥ `line` ∥ `startLine` ∥ `endLine` ∥ `edits` 五段逐段读过——行号形写「an empty string deletes too」∥「or pass an empty string — same delete」，内容形在 `new_string` 与 `edits` 两段写明是显式错；`tool-edit.md` 两句逐句读过：「give new_string to replace, or OMIT new_string (an empty string deletes too) to delete the line/range」与「Delete a line/range by number → omit new_string (an empty string deletes too)」。七处无一再说空串是错误。
- **索引面**：`test/rtm/tooling.md` CLI 41 节加 `41-3` 一行，节注的交互组件与态数（行序）同笔补齐；`test/RTM.md` 的 CLI 41 行不改（该行三值按「盘上存在对应集成用例」判，新增用例不改它）。

### 决策与披露

| # | 决定 | 依据 | 代价与后果 |
|---|---|---|---|
| 1 | 归一落在 `applyLineEdit`，不用 §1「改法方向」的投影法 | 设计 §2 决策 1：批面与桥面的分组步都先调 `validateEditEntry`，投影出来的条目到不了下游 | 无；两处旧 throw 一删一改，与设计 §2 逐句对齐 |
| 2 | 内容形文案改写为一整句「三件事」 | 设计 §1 表第二行 ∥ E4 | `applyPatchLines` 复用同一常量，故该句对纯 diff 层同样成立（内容形只有它） |
| 3 | 桥单形态删除回执**不带** ` via IDE` | 设计 §3 逐字给的模板 `` Deleted ${deleteTarget(out)} of ${p} `` ∥「与核面同措辞」 | 与同档 `editBatch` 的 `… via IDE` 形不同；已作为 🔵 交父侧，代码未改 |
| 4 | `edits` 段补半句「content-targeted entries need a non-empty new_string」 | 内审发现五段里只有 `new_string` 写了两侧 | 该段变长；`line` ∥ `startLine` ∥ `endLine` 三段**未**补内容形那半句（理由与去向见「落地核对」） |

### 轮次记录

1. **内审（explore 审计子代理 · 阻断式）**：逐条比 E1–E7 ∥ A1–A7 与设计 §1–§4。结论 = 全部 covered，两条要处置：E6/A6 的红侧读数在盘上无载体（§5 当时为空，本轮补记）、描述面五段里 `edits` 段只写行号侧。**自修 1 轮**：`edits` 段补内容形半句；A6 的两行读数写进本节。
2. **代码评审（advisor `type=code` · 独立）**：无 🔴；🟡 2 + 🔵 2，`VERDICT: pass`。🟡① = `EDIT.md` §1「五段描述都写成两侧」比代码的覆盖面宽（记入落地核对，交收口裁定）；🟡② = 本节当时为空（本轮补记完毕）；🔵① = 桥单/批两种删除回执形不含 `via IDE` 不统一（设计 §3 指定，代码未改）；🔵② = `bench/toolcall` 冻结用例 tool.8 的 `absent("new_string")` 会把合规删除判成不合期望（批外面，只登记）。
3. **终态：`clean`**——无未处置的 must-fix；两条 🟡 各有载体（本节与「落地核对」），两条 🔵 均按设计/边界处置并写进交付报告。

### 落地核对

**一处**：`docs/core/design/EDIT.md` §1「工具描述面与本表同口径」原句——

> `thincoder-core/tools/file.mjs` 的 `new_string` ∥ `line` ∥ `startLine` ∥ `endLine` ∥ `edits` 五段描述，都写成「行号形省略或传空串 = 删除该行 ∥ 范围；内容形传空串 = 显式错」。

落地后只有 `new_string` 与 `edits` 两段写了两侧；`line` ∥ `startLine` ∥ `endLine` 三段只写行号侧——内容形与这三段本就互斥（三段自己的描述写着「mutually exclusive with old_string」），把「内容形传空串 = 显式错」塞进去会与同段自相抵。

哪一边该动由收口裁定：收窄该句（设计笔，该档本批已被裁为字节冻结），或补写三段（代码笔）。本席未擅自改，也未擅自补。

其余设计句逐条落地、无一失真：§1 两形态矩阵、§2 单点归一与退场常量、§2「不就地改条目对象」、§3 路由门与回执模板、§4 七条常驻判据。

### 债务与范围外线索

**本批新债 0 条**（本席无写账权，登记归父侧）。范围外线索两条，只在交付报告里报，不登记、不动作：

- `bench/toolcall` 的 tool.8 冻结用例期望 `absent("new_string")`，`bench/check/toolcall.check.mjs` 钉住 `new_string: ""` 不满足期望——本批之后那是合规写法。
- 仓根历史日志（`_f10f11-vsc-*.log` ∥ `_m8_*.log` 等）里出现过 vscode 用例名 `AC1/stage2: explicit empty new_string with line is an explicit error`；该用例在源码面已不存在（全仓 `.mjs` ∥ `.cjs` ∥ `.js` ∥ `.ts` 扫该串零命中），只有日志留名，无需处置。

## §6 验证与收口（父代理）

**收口轮（2026-11-15 20:10 · 主 agent）**

- **实施交付**：`#45`（eng-coder）· 8 档（7 码/提示词/测试 + 1 单测档收口删）· 清单外 0 档。
- **本席实跑读数（本回合自己跑的，非转述）**：
  - `node --test docs/batches/2026-11-15-edit-empty-string-deletion.test.mjs test/integration/edit-batch-entry-outcome.test.mjs` ⇒ **tests 7 · pass 7 · fail 0**（单测 5 + 集成 `CLI 41-1` ∥ `CLI 41-3` 2）。
  - 读盘核对：`edit-batch.mjs` 的 `const target = entry.new_string === "" ? undefined : entry.new_string` 在盘；`edit-diff.mjs` 内容形空串仍抛（行号分支那道已删）；`EMPTY_NEW_STRING_LINE` 全仓零命中（常量与导入齐退场）；`file.mjs` 五段描述按形态分段（`new_string` ∥ `edits` 两侧、`line` ∥ `startLine` ∥ `endLine` 只行号侧）。
- **设计档落地核对**：§5 记的一处失真（`EDIT.md` §1「五段都写两侧」）已由 `#46` 收窄为分段事实（`#45` 未擅改、`#46` 按裁落地）；`#47` 报的同类第二份（§1 两处 `tool-edit.md` 引文为改前形态）由 `#47` 改净、§2 A5 那份由 `#48` 改净。三处现与源（`tool-edit.md` 第 4 ∥ 17 行现文）逐字一致。
- **集成面**：新增 `CLI 41-3`（故事 `CLI 41` 已存在，属册 `test/rtm/tooling.md` 41 节 + `test/RTM.md` 索引行 CLI 列仍为 `有`，三值不动）；无改写、无删除。整套集成集未在本轮跑（`#2439` 实施 `#44` 在途，跑全量会混入其未交付改动）。
- **文档闸**：`doc_check(gate)` 于本批改动区 ⇒ `PASS`。
- **单测档**：`docs/batches/2026-11-15-edit-empty-string-deletion.test.mjs` 收口删除（结论留在本节读数行）。
- **本批新债 2 条**：`#2459`（`bench/toolcall` 冻结用例 `tool.8` 期望 `absent("new_string")`，本批后空串为合规删除写法 ⇒ 会把正确调用判成不合期望，改它要动 frozen 哈希，待裁）· `#2460`（depth-0 主 agent 无 `_batchDoc` 绑定 ⇒ 主 agent 直接写的档不入归属表；补它要按 `ledger:"#N"` 反解批档作第二归属源，新语义，另批）。另 `#2454` ∥ `#2458` 由本批补实测（引 `EDIT.md` 不存在节号的注释族 44 处 / 3 档 + linter 3 处）。
- **范围外线索（不记账、不动作）**：`bench/toolcall` 的 `tool.8`（已转 `#2459`）· 仓根历史日志里出现过已不存在的 vscode 用例名（源码面零命中，无需处置）。
- **遗留待裁（不影响本批收口）**：`#2459` 要不要动 frozen 哈希；`config-presets.mjs` 那条与本批无关。
