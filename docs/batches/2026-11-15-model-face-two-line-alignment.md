# 2026-11-15 · 模型面两线口径
> 六段，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 每段只有一个作者：作者的段可 `append` 加内容、可就地改（`edit`）；非作者一概拒。
> 编制：主 agent · 2026-11-15 · 来源 = 用户 2026-11-15 20:26 裁定 A（500 是设计时自觉标准、收口只判 800）之后，批 2026-11-15-tier-gate-closeout-line 收口时查出模型可见面仍留旧口径：#2467（batch-skeleton.mjs 的 §2 模板占位仍把方案列派给设计时线）∥ #2465（两个提示词档的 500 半句只给「必须带方案」一条出路，缺标准允许的「写明不拆的理由」）。
> 台账 = #2465 #2467 #2471（core · 归批）。前情 = 无（独立批）。
## §1 讨论（主 agent）
**状态行**：已收口 2026-11-15
批起 sha = 3ad50cc31c11e8db7f6f4d0b84165e66394d85df
<§1 模板占位：本批条目 / 关键判据 / 授权口径>

**覆盖账 = #2465 #2467 #2471**

### 要解决什么

用户 20:26 裁定「500 是设计时自觉标准、收口只判 800」之后，`#2461` 已把码门 `FILE_CLOSE_MAX`、`CODE-TIER.md` §2、`DOC-CHECK.md` §8.5 三层改成终态。**模型可见的文本面还留着旧口径**，四档五处：

| 落点 | 现文（逐字） | 问题 |
|---|---|---|
| `thincoder-core/agent-tools/batch-skeleton.mjs` | 「第二列：越设计时线的档写正向形方案（点名带目录段的档 + 本批落步 `实施轮` ∥ `§5`），未越线写 —」 | 这是下派给设计席的 §2 骨架。照它写的「设计时 400、收口 860」档会把方案格写成 `—`，到收口当场被门拒 |
| `thincoder-core/prompts/advisor-design.md` | 「Any file over 500 lines before the change must carry a split plan in batch record §2.」 | 只给一条出路，缺 `CODE-TIER.md` §2.1 允许的「写明不拆的理由」 |
| `thincoder-core/prompts/persona-eng-designer.md` | 「A source or test file over 500 lines before the change carries a split plan that lands inside this batch; over 800 at closeout means split first」 | 同上；其 800 半句与 §2.2 一致，不需动 |
| `thincoder-cli/AGENTS.md` | 「File size (source and unit-test files only)」整条 | 标准正文驻在 AGENTS.md；500 半句同样只给一条出路 |

### 授权口径

用户 20:26：「A。500本来就是自觉标准，不自觉采用800判，如果两条都要判，那何必画两条线？」

用户 21:0x：「这个不要放在agents.md里，thincoder的标准不要放在agents.md里。」——第四档落点的直接依据：`thincoder-cli/AGENTS.md` 与工作区 `AGENTS.md` 同病，都是标准正文驻在 AGENTS.md。

### 两处不许丢的内容

**`thincoder-cli/AGENTS.md` 那条独有一段**：closeout 另判一件**记录缺口**而非长度——每档读数须在 §2 且与批起快照相符，缺格与编数同拒。该半句是有效规则（`CODE-TIER.md` §2.2 与 `DOC-CHECK.md` §8.4 已有对应判据），**删该条前须确认这半句在标准层有落点**，不掉。

**`persona-eng-designer.md` 同段另一句**：「`every code file stays under 500 lines` is that shape」——那是「验收判据不该写数」的**反面例子**，不是本规则，**不动**。

### 库内

已查：`grep`，域 = `thincoder`，串 `over 500 lines|越设计时线|设计时线|500 lines` → 模型面命中集中在上述四档；其余命中落在已收口批档（过程档，不判）与 `thincoder-core/tools/` 两处历史注释（「shared.mjs exceeded 500 lines」这类**改动缘由记录**，属历史陈述，不动）。判据源 = `docs/core/standards/CODE-TIER.md` §2.1 ∥ §2.2，现文已给两出路口径。

### 库外

B 类：改动面 = 三个提示词/骨架文本档 + 一份项目 `AGENTS.md`，无依赖清单、无外部 API、无协议实现；外部断言 = 零。

### 本批不做

`#2463`（`BATCH-RECORD.md` 六条措辞）、`#2436`（`DOC-CHECK.md` 五处缺面）、`#2469`（认领判据漏已收口批）——各有自己的落点与评审面，不并入。本批只做「模型可见面的两线口径与裁定一致 + 标准正文不驻 AGENTS.md」这一件事。

### 21:30 评审 #74 裁定（1 🔴 · 7 🟡 · 2 🔵）

十条全部成立，无驳回。修面轮一次性改净。

**🔴 #1 是本批要害，不是可改可不改**：验收只量「逐行 ≤300 字」（§七 row 2「生成骨架后两行占位各 ≤300 字」∥ §六 单测①「骨架产出逐行 ≤300 字」）。

而本批存在的全部理由是那**一段**不过 300——§四.1 自己写「合并后 315 字，越过 `doc_check` 的 300 字段长线——工具建出的每一本新档都会在 §2 占位这一行被自己的写门拒」。

`DOC-CHECK.md` §2 定「一段 = 相邻的非空正文行」，所以两行相邻时并成一段、越过 300 字，照样被拒，而两种形态下单测①同绿。**验收证明不了本批要证明的事**，必须改成能区分正确形与破形。（当时实测 324 字；修面轮把示例行改成示形后文本加长，现读数以 §2 四.1 的 338 为准。）

**同根第二处（🟡 #2）**：§四.1 只给两行文本，通篇没写「两行之间留空行」这条结构约束。

设计与验收两处都缺，实施席照「这些字就是判据」交差就会产出破形态。两处一起改，缺一处仍不成。

**其余八条（上）**：🟡 #3 §十 的「原句（语义）」改逐字——整条退场前，这张表是唯一可核凭据 · 🟡 #4 库内串补 `800` 与中文数值形，或写明 800 面为何不属本批检索 · 🟡 #5 补先例批次坐标并显式声明对齐 ∥ 偏离。

`docs/batches/2026-11-11-designer-tier-rule.test.mjs` 在目录里，是否同主题由你自己读后判。

**其余八条（下）**：🟡 #6 `DOC-CHECK.md` §8.5 那句与 KD-7 落成同一说法 · 🟡 #7 档头台账行与覆盖账三条一致 · 🟡 #8 补函数档位读数 · 🔵 #9 `CODE-TIER.md` §6.1 改稳定名 · 🔵 #10 验收补执行命令。

**边界**：只动 §2 与两份设计档。不碰代码、`thincoder-cli/AGENTS.md`（实施面）、提示词档、集成用例。不并入 `#2463` ∥ `#2436` ∥ `#2469`。

**冻结**：本裁定落盘后进入修面轮，三档再次冻结，等第二轮评审。

### 主 agent 裁定：档头台账行（评审 #74 第 7 条）

设计席上抛的两问，一并裁掉：

- **档头行补成三条**（已落笔）：`> 台账 = #2465 #2467 #2471（core · 归批）。前情 = 无（独立批）。`
- **两行同义的裁定**：档头台账行与 §1「覆盖账」此后写同一组编号，二者不再各说一套。核销读的是台账行集（三行 `task_book` 都指本档），档头行是它的可读副本，不是第二个来源。

**为什么是补三条而不是改覆盖账**：三行在台账里都已是 `在途` 且 `task_book` 指向本档（`#2465` ∥ `#2467` ∥ `#2471`），收口时三行一并结算；覆盖账若写成一条，收口只销一条，另两条会留在 `在途` 上无人认领。档头行是读者最先看到的一处，写成一条会让收口面与记录面给出不同数目。

### 主 agent 验收：实施轮 `#77` 交付（2026-11-15 21:46 实测）

**本批要证明的事，两侧都挣到了**（我在仓根 `D:\teamcode\thincoder` 实跑，不是转述 `#77` 的读数）：

- 正侧：`batchSkeleton({...})` 的产出对 `paragraphHits` ⇒ `[]`（零命中）。占位两行之间那个空行在位，`L[i+1].length === 0` 为真。
- 反侧：把产出里那个空行删掉，同一把尺 ⇒ `[{"line":15,"len":324}]`。破形态会红，绿不是命令自己的措辞。
- 单测：`node --test docs/batches/2026-11-15-model-face-two-line-alignment.test.mjs` ⇒ `tests 2 · pass 2 · fail 0`。
- 机检面：`thincoder-cli/AGENTS.md` 对 `500 lines` ∥ `advisory` 零命中，现存「**Code file and function size**: … live in the standards layer — `docs/core/standards/CODE-TIER.md`. This file restates none of it.」；`must carry a split plan in batch record` ∥ `carries a split plan that lands inside this batch` 在两份提示词档零命中。

### 裁定：修面轮 `#75` 之后的第二轮评审 `#76` 判 pass，但记录面三处要改

评审 `#76` 十条旧项全 Fixed，另报三处，我逐条裁：

1. **🟡 `#76` 第 11 条 —— `batchSkeleton` 函数读数 58 应为 46。** 采纳。量法就是 §一 自己写的那一条（「函数声明行至其收尾大括号行」）：`export function batchSkeleton({ … }) {` 起、`].join("\n")` 后的 `}` 止 = 46 行，下一个顶层声明是 `function ledgerHeaderLineOf(src) {`。46 落在 `CODE-TIER.md` §3 的「≤50 正常」档，不是「50–100：审视是否应拆出独立概念」。结论「本批不拆」不变，读数与档位判词要改。
2. **🟡 `#76` 第 13 条 —— §十三 留着已裁的待裁项。** 采纳。评审 #74 第 7 条已在 §1 裁定「档头行补成三条（已落笔）」，档头行也已改，§十三 仍写 `[上抛·待裁]` 就是同一本档给出两个状态。
3. **🟡 `#77` 上抛 —— §四.1 示例行的第三列 `新` 对在盘档是会被收口门拒的形。** 采纳，且判它是本批文本的一部分（本批把这一块占位从一行拆成两行，示例行随之成为形示意的主证据）。`batchSkeleton` 的 `readingGapOf` 对「快照里有这一档、格内写 `新`」的回应是拒；而示例档 `thincoder-core/agent-tools/batch-tier-gate.mjs` 是**在盘且早已存在**的档，两者矛盾。下一批照抄范例就撞——这个坑 `#2439` ∥ `#2461` 已经各撞过一次。

**派设计席 fix 轮改这三处**；示例行改后的逐字文本由设计席给，我再据此派 eng-coder 改 `batch-skeleton.mjs` 那一行（骨架与批档文本必须同字，否则 §四.1 从判据退化成描述）。

**一处实施面的差异我判不构成缺陷**：`#77` 报告四.2 甲的缩进取 3 格而设计围栏块是 4 格。围栏块的行首空格是渲染，同一 numbered item 的续行在该档一律 3 格；措辞逐字未改。准。

### 修面轮 `#78` 处置（评审 #76 第 11 ∥ 13 条 + `#77` 上抛）

- **第 11 条（函数读数 58 ⇒ 46）准。** 我按 §一 自定的量法复核：`batchSkeleton` 声明行至收尾大括号行 = 46；`statusDonePlan` = 212–224 = 13。设计席把 `statusDonePlan` 的 44 一并改成 13 属同族读数，准——原 44 是上一轮用「到下一个 `^function` 的距离」推出来的，而 212 与 256 之间夹着别的顶层声明，距离不等于函数跨度。这条错记在这里。
- **第 13 条（§十三 留着已裁项）准**，已删。
- **`#77` 上抛（示例行第三列 `新`）准，且判为本批文本的一部分。** 改后逐字文本在 §2 四.1：第三列示形 `<该档在批起快照上的内容行数>`——写 `新` 对在盘档当场被门拒，写具体数是读数、档一改就漂。下一批照抄范例不会再撞同一个坑。
- **`#78` 披露的一处越界准**：§七 row 2 补上示例行的机检面。原来没有任何验收面盯这一行，「骨架与批档同字」只能靠人工比对，属本批要防的空档，不算越界。
- **待 eng-coder 落（本轮派）**：`batch-skeleton.mjs` 的示例行换成 §四.1 现文；§5 的旧读数（`[{line:15,len:324}]`、169 / 155 / 324）随新文本改净（新读数 = 第一行 183 字、第二行 155 字、并段 338 字）。
- **§1 第 56 行的 `169+155 = 324`** 是上一轮评审当时的读数记录，交付后一并改成新读数或关系表述——不改就是一句读者会当成现状的旧话。

## §2 批次任务与设计（eng-designer）
**状态行**：设计完成


**覆盖账 = #2465 #2467 #2471**（三条均在途、均绑定本档，收口时一并核销）

**落笔分派**：提示词两档 ∥ 骨架 ∥ `thincoder-cli/AGENTS.md` = eng-coder（`实施轮`）。两份设计档（`CODE-TIER.md` §2.1、`DOC-CHECK.md` §8.5）本席已在设计轮落成，实施席不再动。

### 一、批起读数

本批只改一个代码档。文件读数 = `countContentLines` 量批起快照，取数 = `git show <§1 的批起 sha>:<档>`：

| 档 | 批起内容行数 | 越设计时线 500 | 越收口线 800 |
|---|---|---|---|
| thincoder-core/agent-tools/batch-skeleton.mjs | 452 | 否 | 否 |

452 ≤ 500 ⇒ 按 `docs/core/standards/CODE-TIER.md` §2.1「`≤ 500`：不进入拆分讨论」；收口线也远未到 ⇒ 机读清单第二列写 `—`。

函数档位读数（`CODE-TIER.md` §3「先检查函数，再检查文件」）——量法 = 函数声明行至其收尾大括号行（顶格 `}` 那一行；`batchSkeleton` 的是 `].join("\n")` 后那一行），量同一份批起快照：

| 函数 | 批起行数 | §3 档位 |
|---|---|---|
| `batchSkeleton` | 46 | ≤50：正常 |
| `statusDonePlan` | 13 | ≤50：正常 |

两档都落在 §3 的 `≤50`「正常」⇒「50–100：审视是否应拆出独立概念」不触发，本批不拆它；本批改的是 `batchSkeleton` 里模板占位那段文本，换文案不改变这一档的函数结构。全档无 ≥300 行的函数 ⇒「必须拆成可复述的骨干与细节」不触发。

其余改动面全是 `.md`。依据同档 §1「需求、设计、批次和其他文档没有行数拆分义务」⇒ 不量、不进机读清单。

### 二、语义单源：本批不改它，只把模型面搬回它

依据 `docs/core/standards/CODE-TIER.md` §2.1「`> 500`：基准是修改代码前的长度。设计席自觉判断，并在过程记录里写下处置：拆（分拆在本批内落成，不推到下一批）；或写明不拆的理由。」

依据同档 §2.2「`> 800`：先拆分再完成收口。」

依据同档 §2.3「两条线各归各的判者：500 归设计席自觉执行；800 归收口门。」

三条合起来就是本批的全部判据：500 给两条出路（拆；或写明不拆的理由），800 是收口门的物，两者各归各时点。

今天的模型可见面有两处背离：500 半句只给一条出路（比标准严）；骨架把收口门要的方案格整个派给设计时线（时点错位）。

### 三、条目（一行一缺陷）

| # | 台账 | 档 | 现文（逐字） | 改后 |
|---|---|---|---|---|
| 1 | #2467 | `thincoder-core/agent-tools/batch-skeleton.mjs` | 「第二列：越设计时线的档写正向形方案（点名带目录段的档 + 本批落步 `实施轮` ∥ `§5`），未越线写 —」 | 拆成两行占位，见四.1 |
| 2 | #2465 | `thincoder-core/prompts/advisor-design.md` | 「Any file over 500 lines before the change must carry a split plan in batch record §2.」 | 见四.2 甲 |
| 3 | #2465 | 同上判据另一句 | 「each with its split plan, or stating that none crosses」 | 见四.2 乙 |
| 4 | #2465 | `thincoder-core/prompts/persona-eng-designer.md` | 「A source or test file over 500 lines before the change carries a split plan that lands inside this batch」 | 见四.3 |
| 5 | #2471① | `thincoder-cli/AGENTS.md` | 整条「**File size (source and unit-test files only)**」 | 换成一行指针，见四.4 |
| 6 | #2471② | 同条第 3 句 | 「above 500 lines ⇒ the design must carry a split plan and the split lands inside this batch (no deferral to another batch)」 | 随第 5 条整条退场；语义落 `CODE-TIER.md` §2.1（本轮已补「分拆在本批内落成，不推到下一批」） |

第 3 条是本轮新查出的同族缺陷：同一判据的下一条 bullet 也只认「拆方案 ∥ 没有越线档」两种形，没有「越线但写明不拆的理由」这一支。根因与第 2 条同一个，同一笔记里一次改净。

### 四、改后文本（逐字；这些字就是判据）

四.1 的第一行（形规格 + 示例行）：

```text
<§2 模板占位：机读清单 = 标题行「**受影响文件（机读清单）**」+ 围栏内三列表（表头 | 档 | 分拆方案 | 行数 |、分隔行 |---|---|---|、一行一档，只列代码档（源 ∥ 单测））；示例行 = | thincoder-core/agent-tools/batch-tier-gate.mjs | — | <该档在批起快照上的内容行数> |>
```

四.1 的第二行（第二列的两件事 + 第三列）：

```text
<§2 模板占位：第二列两件事——越设计时线的档写处置（分拆方案，或写明不拆的理由）；越过收口线的档写正向形方案（点名带目录段的档 + 本批落步 `实施轮` ∥ `§5`）；两条线都不越写 —。第三列：该档在批起快照上的内容行数（量法 = `countContentLines`），快照里没有这一档写 `新`>
```

**结构约束（与那两行文本同属判据）**：两行之间**必须留一个空行**。依据 `docs/core/design/DOC-CHECK.md` §2「一段 = 相邻的非空正文行」——两行相邻时并成一段、越过 300 字，工具建出的每一本新档仍会在自己的 §2 占位这一行被自己的写门拒。文本对、空行缺 ⇒ 产出的是破形态，与把两行合回一行等效。

骨架数组因此是 `第一行, "", 第二行, ""`：第一行前的空行已在盘，本批补的是**两行之间**那一个。

字数都是读数，量法 = 两行文本的字符数（与 `PARAGRAPH_MAX` 同一口径），两侧读数与命令见七：第一行 183 字、第二行 155 字 ⇒ 相邻并段 338 字（拒）；中间留空行 ⇒ 各成一段（过）。合并成一行同为 338 字，所以「省掉空行换行数」不是可接受的近似形。

**示例行第三列只示形不示值**：在盘档那一格写 `新`，收口门当场拒——依据 `thincoder-core/agent-tools/batch-tier-gate.mjs`「写的是 \`新\`，而批起快照里这一档有 ${baseLines} 行」；写具体数同样不行，那是读数，档一改就漂成错值。哪一档写哪一种由第二行那句定，示例行不替它说。

行序是设计约束：示例行必须留在第一行（理由见八，`CLI 7-10` 夹具只剥首条占位行）。

四.2 甲（`advisor-design.md` 判据 8 那一句）：

```text
    **Any file over 500 lines before the change takes a disposal written into batch record §2** — a split plan that lands inside this batch, or the reason not to split. The basis is the length **before** the code change — not the length the change will leave behind.
```

四.2 乙（同一判据下一条 bullet 的收尾半句）：

```text
   the conclusion does — one line in batch record §2 naming which files cross a tier, each with its split plan or its reason not to split, or stating that none crosses.
```

四.3（`persona-eng-designer.md` Step 1 第 3 项那一 bullet 的第二行）：

```text
  A source or test file over 500 lines before the change takes a disposal written in §2 — a split plan that lands inside this batch, or the reason not to split; over 800 at closeout means split first; a single function of 300 lines or more is non-compliant however long the file is.
```

四.4（`thincoder-cli/AGENTS.md` 整条退场，换这一行）：

```text
- **Code file and function size**: the rule, its two time points and their thresholds live in the standards layer — `docs/core/standards/CODE-TIER.md`. This file restates none of it.
```

提示词面一行一段，四.2 ∥ 四.3 的每一行各 ≤300 字（实测 266 ∥ 282）。

### 五、机制设计（为什么是这些字）

- **① 500 的两条出路必须逐字都在场**：只写「必须带方案」，模型面就把自觉标准写成硬判据，与 §2.1 的第二条出路冲突。改后每处都同时有 `a split plan` 与 `the reason not to split`。
- **② 第二列一格担两件事，因为两条线的落点都是它**：500 的处置与 800 的正向形方案都写在受影响文件清单第二列（`CODE-TIER.md` §2.1「拆的方案写当前过程记录的受影响文件清单」；`DOC-CHECK.md` §8.5「满足形」）。骨架必须把两件事各派给各的线。
- **③ 不新增第三种出路**：`CODE-TIER.md` §2.3「不得新增第三条阈值」。本批只拆两出口径，不引入「≤800 就不用写」这类中间档。
- **④ 提示词面自足**：提示词不写指向标准层的引证（那边的字会随改字漂），只把规则说全；`batch record §2` 是执行坐标，不是引证。
- **⑤ 标准层是规则的家，AGENTS.md 只是索引**：用户 2026-11-15 裁定「thincoder 的标准不要放在 agents.md 里」。删整条前逐句核过落点（见十），缺的那一句本轮已补进 §2.1。

### 六、受影响文件（机读清单）

**受影响文件（机读清单）**

| 档 | 分拆方案 | 行数 |
|---|---|---|
| thincoder-core/agent-tools/batch-skeleton.mjs | — | 452 |
| docs/batches/2026-11-15-model-face-two-line-alignment.test.mjs | — | 新 |

单测档的两条用例（行为面，不是措辞断言；随批删）：

① 骨架产出的 §2 段对 `paragraphHits` 零命中（段法 = `docs/core/design/DOC-CHECK.md` §2，与 `doc_check` 同一实现面）。正侧 = 两行之间空行在位 ⇒ 零命中；反侧 = 删掉两行之间的空行 ⇒ 并成一段、越过 300 字。逐行量 ≤300 的写法证明不了本条：两种形态下单测同绿，判据必须落在段法上。

② 两条占位行仍被判空。正侧 = `sectionContentState(src, 2)` 读 `empty`；反侧 = 去掉第二行的 `<§2 模板占位：` 前缀 ⇒ 读 `content`，链门「§2 真跑过」那一支对工具建的档永久失效。

### 七、验收对照（一档一条，读者可判）

| # | 验收面 | 读者读什么、什么算不对 | 机检面 |
|---|---|---|---|
| 1 | 500 两出口径在提示词面 | 读 `advisor-design.md` 判据 8 ∥ `persona-eng-designer.md` 那一 bullet：只说「必须带方案」而无「写明不拆的理由」⇒ 不对 | `grep` 串 `must carry a split plan in batch record` ∥ `carries a split plan that lands inside this batch` 零命中 |
| 2 | 骨架把方案格派给收口线，且两行占位各自成段 | 读 `batchSkeleton` 产出的 §2 两行占位：第二列仍只对设计时线说话 ⇒ 不对；两行之间没有空行 ⇒ 同样不对 | 单测 ① ∥ ② 绿；单测 ① 判的是 `paragraphHits` 段法（正侧零命中、反侧并段越过 300 字命中），不是逐行字数；产出第一行含 `| — | <该档在批起快照上的内容行数> |>`（第三列示形，不写死一个值） |
| 3 | AGENTS.md 不驻标准正文 | 读 `thincoder-cli/AGENTS.md` 全文：出现 500 ∥ 800 阈值或分拆语义 ⇒ 不对 | `grep` 串 `500 lines` ∥ `800` ∥ `advisory` 零命中 |
| 4 | 设计档不再转录提示词原文 | 读 `DOC-CHECK.md` §8.5「收口线」bullet：仍逐字引提示词句子 ⇒ 不对 | `doc_check(mode:"gate")` 该档 PASS |
| 5 | 记录缺口那半句不丢 | 读 `CODE-TIER.md` §2.2 末段 ∥ `DOC-CHECK.md` §8.3：读数义务与「不符即拒」各在盘 ⇒ 算对 | 读者判（两处本轮已逐字核过，见十） |
| 6 | §8.5 与 KD-7 同一说法 | 读 `DOC-CHECK.md` §8.5「收口线」bullet：仍把 `advisor-design.md` 列为收口线数值的承载处 ⇒ 不对（该档判据只承载设计时线） | `grep` 域 = `docs/core/design/DOC-CHECK.md`：串 `另有两处承载` 零命中，串 `persona-eng-designer` 命中一处 |

执行命令（仓根 `D:\teamcode\thincoder`）：

```text
node --test docs/batches/2026-11-15-model-face-two-line-alignment.test.mjs
```

两侧都要跑到：① 的反侧 = 临时删掉骨架里两行之间的空行 ⇒ 红；正侧 = 复原 ⇒ 绿。② 的反侧 = 去掉第二行的 `<§2 模板占位：` 前缀 ⇒ 段判非空。只跑正侧证明不了这两条能拒。

### 八、集成 delta（对 `test/RTM.md`）

改写 = 无 · 删除 = 无 · 新增 = 无。

理由 = 本改动不改变任何既有用例断言的业务可观察结果（改的是模板文本与提示词文本），也不新增产品真需要的场景：它不是新的业务入口，而断言提示词措辞会变成措辞断言。

但点名一条会被波及的既有用例：`CLI 7-10`（`test/integration/batch-edit-spec-section.test.mjs` 的夹具）用 `/^<§2 模板占位：[^\n]*>\n/m` 只剥首条占位行。骨架改两行后：首行（形规格 + 示例行）被剥，第二行（第二列语义）留在夹具里。

第二行不含任何带目录段的档 token（本席实测该判据正则不命中）⇒ 不产生 `档缺`，用例不需改写。

反过来说，把示例行挪到第二行就会让夹具留下一个 `thincoder-core/agent-tools/batch-tier-gate.mjs` 指针。所以四.1 的行序是设计约束，实施席不得调换。

窗口读数（当前集成用例数对 50–100）由收口报，本批不报。

### 九、先例三问与勘察证据

新落点 = 骨架里第二列那两句。三问的答案：

- `existing:` `thincoder-core/agent-tools/batch-tier-gate.mjs` 的 `TIER_PLAN_DISPOSAL`「第二列写正向形方案（点名目标档，带目录段；并写出本批落步 `实施轮` ∥ `§5`）；未越线的档不受此约束」· name: 正向形 · consumers: 收口门 `assertTierPlan` ⇒ 措辞照它写，不另造一套。
- `existing:` `docs/core/standards/CODE-TIER.md` §2.1「拆（分拆在本批内落成，不推到下一批）；或写明不拆的理由」⇒ 两出口径照它译写，不加第三条。
- `existing:` `docs/core/design/DOC-CHECK.md` §8.5「满足形」= 方案格的两件合取 ⇒ 第二列「越收口线写正向形方案」直接引这一形。

**同族最近四个批次，逐条声明对齐 ∥ 偏离**（坐标 + 主题都是我读过的档）：

- `docs/batches/2026-11-15-tier-gate-closeout-line.md` — 本批的直接前身（档头来源行点名它）。对齐 = 语义单源仍取 `CODE-TIER.md` §2.1–§2.3，它落成的收口线终态形本批不改。偏离 = 它改判据与常量（`FILE_CLOSE_MAX`），本批只把模型可见文本面搬回那份判据，常量与门一字不动。
- `docs/batches/2026-11-11-cli-tier-alignment.md` — 同一档 `thincoder-cli/AGENTS.md` 的 File size 条前一轮处理。**偏离，且是全批唯一一处与先例反向的决定**：它 KD-1 取「与工作区根同文」并明确拒了短指针。本批改成一行指针，两条依据——用户 2026-11-15 裁定「thincoder 的标准不要放在 agents.md 里」；以及能力面失败：那份同文副本今天已经是缺陷本体（只给 500 的一条出路，见三），全引形把漂移变成一次逐字比对，可比对不等于不被复制。
- `docs/batches/2026-11-12-code-tier-rule-home.md` — 把规则的家搬到 `docs/core/standards/CODE-TIER.md` 的那批。对齐 = 同一处置形「删正文、留一句指到新家的指针」（它 K-1 用的正是这个形）。偏离 = 无。
- `docs/batches/2026-11-11-designer-tier-rule.md` — 设计时线 500 判据落成批，其单测档 `docs/batches/2026-11-11-designer-tier-rule.test.mjs` 与本批单测档同目录。对齐 = 档形照它（名随批档、住批次目录、直调产出函数、收口前删）。偏离 = 它的断言全在 `assertTierPlan` 的放行 ∥ 拒绝两支，主题是门的判据行为；本批不改门、不断言措辞，所以不沿用它任何一条断言。

那份 `.test.mjs` 是否同主题：读实后判**不同主题**——它测的是门的行为（三行触发物 + 两种逃生口 + 删档不拒），本批改的是模型可见的模板与提示词文本。可复用的是档形，不是断言。

勘察证据（本批查过的档）：`docs/core/standards/CODE-TIER.md` §1–§8（语义单源）· `docs/core/design/DOC-CHECK.md` §8（门与拒文）∥ §9（时点与判域）· `docs/core/requirements/DOC-CHECK.md` 的 AC 面（判文档三件，不含码档长度）。

**库内复检（800 面与中文数值形也扫，不能只扫 500 面）**：串 = `800|八百|over 500|500 lines|500 行|设计时线|收口线|软线|硬线`；域 = `thincoder-core/prompts` ∥ `thincoder-cli` ∥ `thincoder-core/agent-tools` ∥ `thincoder-core/tool-docs` ∥ `docs/core/standards` ∥ `docs/core/design` ∥ 仓根 `AGENTS.md`；尺 = 内置 `grep`，逐域跑、不跨域合并（跨目录一次跑会静默漏域，读数不可信）。

800 面命中三处，各有处置：`persona-eng-designer.md` 的 `over 800 at closeout` 半句 = `CODE-TIER.md` §2.2 的合法承载，本批不动；`batch-tier-gate.mjs` 的 `FILE_CLOSE_MAX = 800` = 收口门常量，本批不动；两份设计档 = 语义单源，本批只改 `DOC-CHECK.md` §8.5 的口径句。

`advisor-design.md` 在 800 面零命中 ⇒ 这正是 KD-7 的事实依据，也是 §8.5 原句把该档列为「同一个数的承载处」不成立的证明。中文数值形 `八百` 全域零命中。

`docs/core/design/DOC-GRAPH.md`：`grep` 串 `行数档位|CODE-TIER|800` 零命中 ⇒ 它已不承载行数口径，无需第三处改字。

`CODE-TIER.md` §6「检索与复核」列的三面（名称面 ∥ 数值面 ∥ 提示词面）本批逐面走过，结论见上面两条读数。模型面载体就是上述四档，无第五处。

不判两处（判定按 `CODE-TIER.md` §5「漂移看一句话把长度判定派给哪个时点」）：

- `thincoder-core/tools/shared.mjs` ∥ `tools/write-gate-params.mjs` 的「越过了 500 行设计时线」注：记的是改动缘由，属历史陈述，不是派给谁的当前规则。
- `thincoder-desktop/dist-r*/win-unpacked/…/app.asar` 内的旧提示词副本：构建产物，随打包重生成，不是源档。

### 十、`thincoder-cli/AGENTS.md` 那条逐句归落点（删前确认）

| 原句（逐字，第 36 行那条 bullet 的子句） | 落点 |
|---|---|
| `judged exactly twice, nowhere else.` | `CODE-TIER.md` §2.3「实施、代码评审和其他中间环节不另设代码文件长度检查」 |
| `**At design time** the designer judges the length **before** this batch's changes` | §2.1「基准是修改代码前的长度」 |
| `at or below ⇒ nothing to judge` | §2.1「`≤ 500`：不进入拆分讨论」 |
| `above 500 lines ⇒ the design must carry a split plan`（原条只此一条出路——缺陷本身） | §2.1「拆……；或写明不拆的理由」两条出路 |
| `the split lands inside this batch (no deferral to another batch)` | §2.1（本轮补入；原条独有，删条前标准层无此落点） |
| `**At closeout** the check judges 800 lines: above ⇒ split before landing; at or below ⇒ leave it alone.` | §2.2 |
| `**The closeout also re-checks one thing that is a record gap, not a length**: every code file this batch changed carries its line reading in batch record §2's affected-files table, and that reading has to match the batch-start snapshot — a missing cell and a made-up number are refused alike.` | §2.2 末段（读数义务）+ `DOC-CHECK.md` §8.3「缺少行、缺少数值或数值不符都明确拒绝」 |
| `**Every step in between judges nothing about file length**` | §2.3 |
| `**Documents (`.md`) are under no size obligation**` | §1 |
| `There is no advisory tier and no "looked at it, decided not to split" verdict.` | 随整条退场：它与 §2.1 的第二条出路当场相反，是旧口径残留，不是有效内容 |
| `The rule measures whether a code file has grown past what one person can hold` | 随整条退场：意图句不构成判据，`CODE-TIER.md` 自带意图句 |

### 十一、关键决策

- **KD-1｜500 保两条出路，不新增阈值**——依据 = 用户 2026-11-15 20:26 裁定「500本来就是自觉标准」+ `CODE-TIER.md` §2.1 ∥ §2.3。
- **KD-2｜第二列一格担两件事**——两条线的落点都是受影响文件清单（五②）。放弃「给 800 另开一列」：要同步改 §8.1 的表形（2–3 列）与 `batch-tier-gate.mjs` 的解析面，且同一格的历史读数无处安放。
- **KD-3｜AGENTS.md 只留指针**——用户裁定 + 标准正文的家在标准层；逐句落点见十。
- **KD-4｜`CODE-TIER.md` §2.1 补「分拆在本批内落成，不推到下一批」**——删 AGENTS.md 整条会让这一条失去唯一落点（十的表里那一行）。补的是标准层、落的是被删内容的原义，不新增判据。
- **KD-5｜骨架占位拆两行，且两行之间留一个空行**——合并成一行越过 300 字段，会让每本新档在建档时被自己的写门拒；两行相邻时同样并成一段、越过 300 字（段法 = `DOC-CHECK.md` §2），所以空行与两侧文本同属判据，读数与命令见四.1 ∥ 七。备选「削短其它说明文字凑 300」放弃：那是让被检查物迁就检查。
- **KD-6｜`DOC-CHECK.md` §8.5 的两处提示词引文改成点名**——引文会随提示词改字当场脱节（本轮改的正是那两句）。改成点名后同一句话在改字后仍成立，也少一份要同步的副本。
- **KD-7｜`advisor-design.md` 不补 800 句**——评审席判设计时线，800 是收口门的触发物；把 800 写进评审判据等于把收口门的判定派给不执行它的席位。#2465 的射程也只到 500 半句。

### 十二、边界（本批不做）

- 不并入 `#2463` ∥ `#2436` ∥ `#2469`：各有落点与评审面，§1 已裁定。
- 不动工作区 `D:\teamcode\AGENTS.md`（仓外）。本席查过：该档 `grep` 串 `500|800|File size|line limit` 零命中，不含行数条目。
- 不改 `batch-tier-gate.mjs` ∥ `batch-closeout.mjs`：门的触发物与常量本批一字不动。
- 不改任何集成用例夹具：八 的行序约束替代改夹具。
- 不新增第三阈值，不改 `countContentLines` 量法。

### 十三、上抛项

- 无阻断项。
- `[上抛·知会]` 四.1 的「示例行留第一行」与 `CLI 7-10` 夹具的剥离规则之间是一条隐性耦合。本批以设计约束固定，未动夹具；将来谁挪动示例行，7-10 会红在 `档缺` 上，那时该改夹具的剥离规则（`/g` 或逐条剥离），不是改骨架。

## §3 设计评审（评审子代理）
**状态行**：评审通过



### 轮次 1（评审子代理）

**结算**：未签发（no-valid-echo）· 2026-11-15

    | # | Severity | Status | Evidence |
    |---|----------|--------|----------|
    | 1 | 🔴 | New | §七 row 2 机检面「单测 ① ∥ ② 绿；生成骨架后两行占位各 ≤300 字」+ §六 单测①「骨架产出逐行 ≤300 字」+ `DOC-CHECK.md` §2「一段 = 相邻的非空正文行」 |
    | 2 | 🟡 | New | §四.1「拆成两行不是排版偏好。原行 282 字」段内无空行约束 |
    | 3 | 🟡 | New | §十 表头「\| 原句（语义） \| 落点 \|」 |
    | 4 | 🟡 | New | §1 库内「串 `over 500 lines\|越设计时线\|设计时线\|500 lines`」+ §九「数值面…本批逐面走过」 |
    | 5 | 🟡 | New | §九「先例三问与勘察证据」；档头「批 2026-11-15-tier-gate-closeout-line 收口时查出」 |
    | 6 | 🟡 | New | `DOC-CHECK.md` §8.5「同一个数在提示词面另有两处承载，改数值时这三处一起看」vs §十一 KD-7「`advisor-design.md` 不补 800 句」 |
    | 7 | 🟡 | New | 档头「`> 台账 = #2465（core · 归批）。前情 = 无（独立批）。`」vs 「**覆盖账 = #2465 #2467 #2471**」 |
    | 8 | 🟡 | New | §一「\| thincoder-core/agent-tools/batch-skeleton.mjs \| 452 \| 否 \| 否 \|」；`CODE-TIER.md` §3「先检查函数，再检查文件」 |
    | 9 | 🔵 | New | §九「`CODE-TIER.md` §6.1 的检索面」；该档章名「## 6. 检索与复核」 |
    | 10 | 🔵 | New | §七 机检面「单测 ① ∥ ② 绿」，无执行命令 |
    本轮未回显有效 token（评审回执不完整）
    计数：🔴 1 · 🟡 7 · 🔵 2 · 未标 0


### 轮次 2（评审子代理）

**结算**：已签发（pass）· 2026-11-15

    | # | Severity | Status | Evidence |
    |---|----------|--------|----------|
    | 1 | 🔴 | Fixed | 批档 §六 单测①「骨架产出的 §2 段对 `paragraphHits` 零命中」+ §七 row 2「判的是 `paragraphHits` 段法」 |
    | 2 | 🟡 | Fixed | 批档 §四.1「两行之间**必须留一个空行**」+「骨架数组因此是 `第一行, "", 第二行, ""`」 |
    | 3 | 🟡 | Fixed | 批档 §十 表头「原句（逐字，…」 |
    | 4 | 🟡 | Fixed | 批档 §九「库内复检（800 面与中文数值形也扫」 |
    | 5 | 🟡 | Fixed | 批档 §九「同族最近四个批次，逐条声明对齐 ∥ 偏离」 |
    | 6 | 🟡 | Fixed | `DOC-CHECK.md` §8.5「这个数在提示词面只由一处承载」 |
    | 7 | 🟡 | Fixed | 批档档头「> 台账 = #2465 #2467 #2471（core · 归批）」 |
    | 8 | 🟡 | Fixed | 批档 §一「函数档位读数（`CODE-TIER.md` §3「先检查函数，再检查文件」）」 |
    | 9 | 🔵 | Fixed | 批档 §九「`CODE-TIER.md` §6「检索与复核」列的三面」 |
    | 10 | 🔵 | Fixed | 批档 §七「执行命令（仓根 `D:\teamcode\thincoder`）」 |
    | 11 | 🟡 | New | 批档 §一「\| `batchSkeleton` \| 58 \| 50–100：审视是否应拆出独立概念 \|」vs `batch-skeleton.mjs` `export function batchSkeleton(`…`].join("\n")`（46 行） |
    | 12 | 🔵 | New | 批档 §十「原句（逐字，第 36 行那条 bullet 的子句）」 |
    | 13 | 🟡 | New | 批档 §十三「`[上抛·待裁]` 档头 `> 台账 = #2465（core · 归批）` 与本批覆盖账」vs §1「**档头行补成三条**（已落笔）」 |
    VERDICT: pass
    计数：🔴 1 · 🟡 9 · 🔵 3 · 未标 0

## §4 用户批准（主 agent）

**批准依据 = 用户 2026-11-15 的原话，不是一次单独的「开始实施」回合。**

- **已定决定**：thincoder 的标准正文不进 `AGENTS.md`，两线口径（500 设计时 / 800 收口时）只在标准层与提示词面承载 · 用户原话：「这个不要放在agents.md里，thincoder的标准不要放在agents.md里。」 · 时间：该轮未取时钟，不补记
- 这条裁定落到本批 = `#2465`（两个提示词档的 500 半句只给一条出路）· `#2467`（骨架把方案列派给设计时线）· `#2471`（`thincoder-cli/AGENTS.md` 整条标准正文）。
- 实施在评审 `#76` 判 `pass` 后点火：设计已定、口径已审，无需另一次口令；本会话 `AUTO` 生效，面内步骤自动推进。
## §5 实施记录（eng-coder）
**状态行**：实施完成



### 一、交付清单（逐档）

| 档 | 改了什么 |
|---|---|
| `thincoder-core/agent-tools/batch-skeleton.mjs` | `batchSkeleton` 的 §2 机读清单占位由一行拆成两行，行间留一个空行（数组尾声 = `第一行, "", 第二行, ""`）：第一行 = 形规格 + 示例行；第二行 = 第二列两件事 + 第三列。第二列现在把两条线各归各的：越设计时线的档写处置（分拆方案，或写明不拆的理由），越过收口线的档写正向形方案（点名带目录段的档 + 本批落步）。另加五行 why 注释（为什么不能合并成一行、为什么不能相邻、示例行为什么必须留在第一行）。 |
| `thincoder-core/prompts/advisor-design.md` | 判据 8 两句都补上第二条出路：首句 `takes a disposal written into batch record §2 — a split plan that lands inside this batch, or the reason not to split`；同条下一条 bullet 的收尾半句 `each with its split plan or its reason not to split, or stating that none crosses`。500 的基准半句、函数档位那几句一字未动。 |
| `thincoder-core/prompts/persona-eng-designer.md` | 「The affected-file table carries one number per code file」条第二行加第二条出路（`or the reason not to split`）；800 半句与函数 300 半句照留。 |
| `thincoder-cli/AGENTS.md` | 整条 `**File size (source and unit-test files only)**` 退场，换成一行指针：规则、两个时点与阈值住 `docs/core/standards/CODE-TIER.md`，本档不复述。 |
| `docs/batches/2026-11-15-model-face-two-line-alignment.test.mjs` | 本批单测档，三条行为用例（随批删，不进集成树）。 |

### 二、验证读数（命令 + 结果，仓根 `D:\teamcode\thincoder`）

- `node --test docs/batches/2026-11-15-model-face-two-line-alignment.test.mjs` ⇒ 3 pass / 0 fail（用例 ①②③）。反侧两跑：把两行之间的空行从骨架里临时删掉 ⇒ 用例 ① 红（`两行之间留一个空行——这条结构约束与两行的字同属判据`），同一时刻并段读数 = `[{line:15,len:338}]`；把示例行第三列临时改回 `| 新 |` ⇒ 用例 ③ 红（`正侧：第三列是示形 token`，actual `新`）。两次复原后各 3 pass。
- `node --test test/integration/batch-edit-spec-section.test.mjs` ⇒ 2 pass（`CLI 7-10` 正侧 ∥ 反侧；夹具只剥掉第一行，第二行留下不产生 `档缺`，与设计 八 的预判一致）。
- `node --test test/integration/batch-status-auto-set.test.mjs` ⇒ 3 pass（`CLI 27-2` ×2 ∥ `CLI 27-4`；裸骨架落盘 + 写门全绿 ⇒ 两行占位各自成段后，工具建的档不再被自己的写门拒）。
- 字数读数：第一行 183、第二行 155、并段 338（量法 = `paragraphHits` 命中的 `len`，与 `PARAGRAPH_MAX` 同口径）；提示词面两条新行 242 ∥ 265 ∥ 282，均在 300 以内（提示词面逐行判）。
- 验收 七 行 1：内置 `grep` 域 `thincoder-core/prompts`，串 `must carry a split plan in batch record` ∥ `carries a split plan that lands inside this batch` ⇒ 零命中（只在已收口批档的过程记录里以引文出现，属历史陈述）。
- 验收 七 行 3：`thincoder-cli/AGENTS.md` 全文读 + `grep` 串 `500 lines` ∥ `800` ∥ `advisory` ⇒ 零命中。
- 验收 七 行 6：`grep` 域 `docs/core/design/DOC-CHECK.md`，串 `另有两处承载` ⇒ 零命中；串 `persona-eng-designer` ⇒ 一处（§8.5「收口线」bullet）。
- 验收 七 行 4：`doc_check(mode:"gate")`，docs = `thincoder-cli/AGENTS.md` ∥ `docs/core/design/DOC-CHECK.md` ∥ `docs/core/standards/CODE-TIER.md` ⇒ `DOC-CHECK GATE: PASS`。
- 验收 七 行 5：落点在盘 —— `CODE-TIER.md` §2.2 末段「每个改动代码文件都必须在当前过程记录中携带批起快照的内容行数」+ `DOC-CHECK.md` §8.3「缺少行、缺少数值或数值不符都明确拒绝」。

### 三、自主决定与披露

| # | 决定 / 披露 | 依据 |
|---|---|---|
| 1 | 四.2 甲的缩进取 3 格，而设计围栏块里是 4 格 | 设计块内 4 格是转录渲染；该 numbered item 的续行在本档一律 3 格，取 4 格会让这一行成缩进码块。**措辞逐字未改**（与设计块逐字比对过，只差行首空格）。 |
| 2 | 骨架里那五行 why 注释不在设计文本内 | 设计给的是两行占位文本与结构约束；注释是代码面的「为什么」（D9），内容逐条对着 `DOC-CHECK.md` §2 的段法与 `CLI 7-10` 夹具的剥离链写，不含新判据。 |
| 3 | 反侧读数用临时改盘取 | 设计 七 要求两侧都跑到：临时删掉两行之间的空行 → 红；复原 → 绿。复原后 `git diff` 核对过最终形 = `第一行, "", 第二行, ""`。 |
| 4 | 未改任何集成夹具、未动 `batch-tier-gate.mjs` ∥ `batch-closeout.mjs`、未动仓外工作区 `AGENTS.md` | 设计 十二 边界。设计用「示例行留在第一行」的行序约束替代改夹具，本席照此落地并在注释里写明。 |
| 5 | `doc_check gate` 那一次把两份设计档一并点名（`DOC-CHECK.md` ∥ `CODE-TIER.md`），gate 因此把这两档也 `git add` 了 | 七 行 4 ∥ 行 6 的机检面就落在那两档上；两档在盘已是设计轮终态，不是半成品。 |
| 6 | `thincoder-cli/AGENTS.md` 现存三行超 300 字（33 ∥ 37 ∥ 39） | 本批之前就在盘；该档是产品文本面，不在 `doc_check` 的判域内，本批新增那一行是短句，未加剧。 |
| 7 | 🟡 一条上交设计面，未在本批改字 | 见四 第 3 条。 |

### 四、审查轮次与终态

1. **内部差异审计（`explore`，只读）**：五档 × 条目 1–6 × 四.1–四.4 逐字 × 单测 ①② × 验收 1–6 × 边界 十二，含 `TEMPLATE_PLACEHOLDERS` 枚举面与 `EXCLUDED_LINE_RE` 前缀面两条隔离面核查 ⇒ **0 偏差**，终态 clean。它另确认：示例行仍在第一行、四条 `四.x` 文本与盘上逐字相同、`记录缺口` 半句的两处落点在盘、`.md` 档不产生读数义务。
2. **代码评审（`advisor`，code）**：🔴 0 · 🟡 1 · 🔵 2，判 `pass`。两条 🔵 当场修净：① 注释对 `CLI 7-10` 夹具的描述漏了前一次整行精确剔除 → 改成点名两段剥离链；② 「300 字段」与同函数相邻注释的「一段 381 字」单位不一致 → 统一成「300 字一段长线」。修后重跑单测 2 pass ∥ `CLI 7-10` 2 pass。
3. 🟡 一条（**上交，属设计面，不阻断**）：第一行占位的示例行 `示例行 = | thincoder-core/agent-tools/batch-tier-gate.mjs | — | 新 |` 里，第三列 `新` 对一个在盘档是会被收口门拒的形——`batch-tier-gate.mjs` 的 `readingGapOf` 对「快照里有这一档、格内写 `新`」的回应是拒。该文本逐字来自设计 四.1，本席照抄，故不是本批的偏离；处置见六（主 agent 已裁定，本轮改净）。
4. **终态：clean**（无未处理 🔴；两条 🔵 已修，一条 🟡 已上交）。

### 五、落地核对

**落地核对：无**（本批落地未使任何设计档句子变假：`CODE-TIER.md` §2.1 ∥ §2.2、`DOC-CHECK.md` §8.5 三处口径由设计席在本批落成，本席一字未动；`BATCH-RECORD.md` ∥ `requirements/DOC-CHECK.md` 对骨架只作类名引用（`模板占位` 属排除类、`机读清单` 指真块），没有一句把骨架的 §2 占位写成一行或写成几条，故两行拆开后无句子失效。）

### 六、修面轮（示例行改示形 · 读数改净 · 单测第三条）

主 agent 裁定（§1「修面轮 `#78` 处置」的「待 eng-coder 落（本轮派）」）落到盘上的三件：

| # | 改了什么 | 逐字 / 读数 |
|---|---|---|
| 1 | `batch-skeleton.mjs` 的示例行第三列由 `新` 改成示形 token | `示例行 = \| thincoder-core/agent-tools/batch-tier-gate.mjs \| — \| <该档在批起快照上的内容行数> \|` |
| 2 | 同一档三处注释 | 新增「第三列只示形不示值」的 why（引 `readingGapOf` 的拒文）；两行字数 169 ∥ 155 ⇒ 183 ∥ 155、并段 324 ⇒ 338，并标「当轮实测，改字须重量」；「三行相连就是一段 381 字」改成关系表述「几行相连必越过 300 字」 |
| 3 | 单测档补第三条用例（§七 row 2 的示例行机检面） | 判产出第一行的示例行：档名 ∥ 第二列 `—` ∥ 第三列 = 示形 token；`新` 与数都不成立；示例行只在第一行 |

读数（仓根 `D:\teamcode\thincoder`）：

- 产出两行占位与 §2 四.1 的两条围栏行逐字相同；第一行 183 字、第二行 155 字、行间空行在位。
- `paragraphHits(骨架)` ⇒ `[]`；把行间空行删掉 ⇒ `[{"line":15,"len":338}]`。
- 单测档单跑 ⇒ 3 pass / 0 fail；与两份集成同跑 ⇒ 8 pass / 0 fail（用例 ①②③ + `CLI 7-10` ×2 + `CLI 27-2` ×2 + `CLI 27-4`）。
- 反侧两跑见二（空行删掉 ⇒ ① 红；示例行改回 `新` ⇒ ③ 红）。

函数档位读数（`CODE-TIER.md` §3；量法 = 声明行至收尾大括号行）：`batchSkeleton` 批起 46（§2 §一）→ 本轮落盘后 55。

增量全是注释行（上一轮 5 行 + 本轮 2 行），函数体结构未变。

§3 表按当前文件读数落「50–100：审视是否应拆出独立概念」档。我的判断是不拆：它是一条返回数组的字面模板，没有可独立验证的子概念，§3 末句「函数拆分按概念和可独立验证性，不为满足数字而切碎连续逻辑」正对这里；读数与判断交收口裁判。

自主决定与披露：

| # | 决定 / 披露 | 依据 |
|---|---|---|
| 1 | 单测第三条用例超出 §2 六 列举的两条 | 本轮父代理指令「单测档也要跟上 §七 row 2 新增的机检面…正反两侧都要跑到」；该条判格内 token，不是措辞断言、不是逐行字数 |
| 2 | 注释新增两行 why，`batchSkeleton` 当前读数 46 → 55 | 见上「函数档位读数」；收口席若判超 50 需处置，把这两行移到函数体外可回到 53（仍 >50） |
| 3 | 删掉旧读数 381，改成关系表述 | 381 与现形对不上（三条 §2 占位行现在 66 ∥ 183 ∥ 155），也没有在盘的形能复现它——旧形残留读数 |
| 4 | 第三条用例的反侧不自造字符串 | 在产出那一行上做替换再断言解析结果只能证明自己；反侧靠临时改盘跑，读数在二 |

审查轮次与终态：

1. **内部差异审计（`explore`，只读）**：6 项逐条 ⇒ 代码与单测 0 偏差。它报两条记录面：§5 旧读数（本轮已改净）∥ §2 六 只列「两条用例」未登记第三条（§2 是设计席的笔，本席无权改，上交）。
2. **代码评审（`advisor`，code，第 2 轮）**：🔴 0 · 🟡 2 · 🔵 1，判 `pass`。三条处置：① 用例 ③ 的「反侧」是同义反复 ⇒ 改成对产出那一行的三种断言（token ∥ ≠ `新` ∥ 非数），反侧改由临时改盘跑并记进二；② §5 旧读数 ⇒ 本轮改净；③ 注释里的字数没有机检面 ⇒ 标注「当轮实测，改字须重量」。
3. **终态：clean**（无未处理 🔴；🟡 2 与 🔵 1 已在本轮改净）。

**落地核对：无**（本轮只改骨架模板文本与注释、本批单测档、§5 自己的读数；设计档一字未动。§2 §一 的 `batchSkeleton` 46 行是「量批起快照」的读数，本轮改的是落盘后的长度，没有把它写假——差别记在上文「函数档位读数」，供收口核对。）

## §6 验证与收口（父代理）

**本批做了什么（一句）**：把 500 / 800 两线口径搬回模型真正读得到的地方——两个提示词档、骨架模板——并把标准正文从 `thincoder-cli/AGENTS.md` 退场换成一行指针。

### 一、验证读数（父侧本轮实跑，不是转述）

| 项 | 命令 ∥ 入口 | 读数 |
|---|---|---|
| 本批单测 | `node --test docs/batches/2026-11-15-model-face-two-line-alignment.test.mjs` | tests 3 · pass 3 · fail 0 |
| 骨架产出段法（正侧） | `paragraphHits(batchSkeleton(…))` | `[]` |
| 骨架产出段法（反侧 = 删掉行间空行） | 同上 | `[{"line":15,"len":338}]` |
| 提示词面禁用串 | `must carry a split plan in batch record` ∥ `carries a split plan that lands inside this batch` | 0 命中 |
| `thincoder-cli/AGENTS.md` | `500 lines` ∥ `800` ∥ `advisory` | 0 命中 |
| 集成（骨架的两处消费者） | `CLI 7-10` ×2 · `CLI 27-2` ×2 · `CLI 27-4` | 5 pass · 0 fail |

红侧是改盘做出来的：删掉两行之间那个空行 ⇒ 用例①红且并段读数 338；把第三列改回 `新` ⇒ 用例③红。两份都在复原后复绿。

### 二、落地核对

§5 记「落地核对 = 无」——设计档本批一字未动，无句子因落地变假。

### 三、文档闸

`doc_check(mode:"report")` 于本批改动面的三份 `.md`（`thincoder-cli/AGENTS.md` ∥ `docs/core/design/DOC-CHECK.md` ∥ `docs/core/standards/CODE-TIER.md`）⇒ `DOC-CHECK GATE: PASS`。本会话无 `batch` 工具，`gate` 模式无绑定批档、只会打印裸 `PASS`（实际上什么都不判），所以用 `report` 模式整档判；批档本身不在受判集。

### 四、单测零留存

`docs/batches/2026-11-15-model-face-two-line-alignment.test.mjs` 收口时删除，验证读数留在本节第一段。

### 五、台账结算

`#2465` ∥ `#2467` ∥ `#2471` 三行在途、`task_book` 均指本档，收口时一笔核销。**本批无新债。**

### 六、§2 ↔ §5 对账（差一项，记在这里不改 §2）

§2 六 写「单测档的两条用例」，实际交付三条：第三条是父侧追加指令要求覆盖「示例行第三列的示形 token」，实施席加上并让它在 `新` 上红。属追加覆盖面，不是缺陷；按对账纪律记在此处，不回改 §2。

另记一处口径差：§2 §一 的 `batchSkeleton` 46 行是**批起快照**读数；落盘后该函数 55 行（增量全是注释），落在 `CODE-TIER.md` §3「50–100：审视是否应拆出独立概念」档，实施席判不拆（单一返回数组、无独立可验证子概念）。判断照记，本批不另派拆分。

### 七、挂账存量（均不在本批）

- `#2463` `BATCH-RECORD.md` 六条措辞（`#2439` 遗留）
- `#2436` `DOC-CHECK.md` 五处缺面（本批之外只修过假节号）
- `#2468` 三份已收口批的单测档残留（其中一份已跑不起来）
- `#2469` 认领判据漏掉已收口批
- `#2470` 门在自身改动批上的进程生命周期错位
