# 2026-11-15 · 收口门改动面按批判取材
> 六段，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 每段只有一个作者：作者的段可 `append` 加内容、可就地改（`edit`）；非作者一概拒。
> 编制：主 agent · 2026-11-15 · 来源 = 用户 2026-11-15 18:30 令「开工」，接台账 #2439（收口门改动面取材跨批）；触发条件「下次动 batch-closeout.mjs 的 changedSurface 取材面时」现已满足：2026-11-15 同日三批并行，#2444 与 #2450 各自被要求为邻批的码档补镜像行。。
> 台账 = #2439（core · 归批）。前情 = 无（独立批）。
## §1 讨论（主 agent）
**状态行**：已收口 2026-11-15
批起 sha = c8dcc16e3d55ed85b1d5dc36b94f5abcc26ec0a3
<§1 模板占位：本批条目 / 关键判据 / 授权口径>

## 要解决什么

收口门的档位臂要「本批改动面里在盘的码档，§2 机读清单必须有行」，而它取「本批改动面」的方式不区分是哪一批改的。

`thincoder-core/agent-tools/batch-closeout.mjs` 的 `changedSurface` 注释原文：

> 本批改动面（**取材 = 现成两面**：写工具触达账 ∪ 提交 diff；本档不另造登记）

两路都不带批次归属：

- `agent._touchedFiles` 是**会话级**的——同一会话里跑过的每一批都往里记
- `committedDocs(root, baseSha)` 是 `批起 sha..HEAD` 的**工作树级** diff——本批建立之后别人提交的每一批都算进来

后果：两批并行时，任一方收口都要求另一方补镜像行。今天连撞两次：

| 批 | 批起 sha | 被要求补的邻批档 |
|---|---|---|
| `#2444` | `100def4c` | `#2443` 的八档（`52eeeab1`）+ `#2450` 的两档（`8e43c30e`） |
| `#2450` | `8600e19f` | 更早，两批全落进去 |

历史同形：`#2431` 与 `#2434` 互相要求对方四档（台账 `#2439` 原 evidence 记的现场）。

**这不是「多写几行」的问题**：§2 的「受影响文件」表若填进别人改的档，这张表就从「本批的改动面」变成「窗口里所有批的改动面」，记录会说一件不真的事。

## 已定决定（用户裁定）

- **已定决定**：开批修 `#2439`，让收口门按「本批」取材 · 用户原话：「开工」 · 时间：2026-11-15 18:30
- **已定决定**：本批只改取材判据，不改档位门的读数判法（第三列与批起基线的比对规则不动） · 来源：`#2433` 记的是读数基准问题，与本批不同对象，本批不夹带 · 时间：2026-11-15 18:30

## 关键事实（本轮实读）

写门本来就要求每笔写绑定一个在途台账行号（`ledger: "#N"`）。**「这笔写属于哪一批」这个信息在写的那一刻是已知的**，只是没有被记下来——`_touchedFiles` 存的只有路径。

换句话说：缺的不是判据来源，是**记账时把已知的归属丢掉**。

提交 diff 那一路的性质不同：它是事后从 git 取，天然没有批次标记。它现在承担的作用是「兜底」——子代理在其上下文里改的档不进主会话触达账。

## 候选方向（设计席须逐个论证，不得只写一个）

| 方向 | 判据 | 代价 |
|---|---|---|
| **甲** 触达账带批次 | 写门已知 `ledger:"#N"`，记账时一并存；收口按本批行号过滤 | 记账格式变，消费面（`recent_changes` ∥ 子代理合入）同轮改 |
| **乙** 清单即契约 | 门只判清单内各档的读数；清单外但有改动的，报「未声明」不拒收 | 门不再主动发现漏登记，靠人补；对「真的漏了」变松 |
| **丙** diff 降为提示 | 只用触达账判读数；diff 只用于提示「这些档也变了，确认是否本批」 | 子代理改的档会漏出判据 |

**我倾向甲 + 丙的组合**：触达账带批次是唯一有「归属」这个事实的判据；diff 只作提示，不作判据。乙会把门的发现能力削掉一截。

但这三条各有其失效面，设计席要给出**在什么情况下选错会静默放过一个真的漏登记**，那才是取舍的关键。

## 边界

- 不改档位门第三列与批起基线的比对规则（`#2433` 的读数基准问题是另一条）
- 不改 §2 机读清单的格式（三列语义不动）
- 不改写门的拒绝行为与报文（它仍要求 `ledger:"#N"`）
- 补登记是现状的权宜，本批要给的是让它不再需要的判据

## 验收面

1. 两批并行：各自收口时，门对本批改动面逐档判读数，对邻批档不要求
2. 真的漏登记（本批改了码档、§2 无该行）⇒ 仍拒，报文点名该档
3. 子代理在自身上下文改的档 ⇒ 仍进判据（不得因改判据而漏掉这一类）
4. 无批起 sha 时（`baseShaOf` 返回 null）行为不变
5. 红侧：改前用两批并行的现场（同一工作树、后开的批先提交）必拒；改后同一现场放行

## 勘察与先例

先例 = 同一档里已有的「判据单源」纪律：`batch-tier-gate.mjs` 的入参注释写明「本批改动面（触达账 ∪ 提交 diff；**必填**——它就是触发物的取材）」，即取材是外层交进来的，门自己不取。本批改的是**交进来的那一面的取材**，门的判法不动——这个分界沿用。

勘察证据：已读 `batch-closeout.mjs` 的 `assertCloseoutGates` ∥ `changedSurface` ∥ `tierRootOf` ∥ `baseTextReaderOf`，`batch-tier-gate.mjs` 的 `assertTierPlan` ∥ `readingFindingsOf` ∥ 入参注释，`batch.mjs` 里 `_touchedFiles` 的两处注释。外部源码档 = 已查，无相关：本机制完全在本仓批次工具面内。

## 设计评审 #34 裁定（主 agent · 2026-11-15 18:38）

评审 `changes-required`（1 🔴 · 6 🟡）。逐条裁定：

| # | 严重度 | 裁定 | 依据与处置 |
|---|---|---|---|
| 1 | 🔴 | **Not an issue** | 场景真实且本档已逐条记：§1「今天连撞两次」表（`#2444` 批起 `100def4c` 被要求补 `#2443` 八档 + `#2450` 两档；`#2450` 批起 `8600e19f` 更早）+「历史同形：`#2431` 与 `#2434` 互相要求对方四档」。评审席未绑定批档故读不到；设计档不得回指批档（可整份删除），故其持久形态只能是机制句与判据。判据二存在的理由也非想象：`changedSurface` 自带的「触达账 ∪ 提交 diff」两面结构里，diff 一路本来就是为兜住不经记账面的写而存在 |
| 2 | 🟡 | **Dispatched** | 两腿对同一档结论相反时谁说了算未写。§4.18.1 既写「两层，主判据在前」又写「减完剩下的仍按本批判」，缺裁定规则 |
| 3 | 🟡 | **Dispatched** | 「别批 §2 机读清单列了这一档」是计划面，当成所有权即 fail-open；且「盘上另一份未收口批档」未按项目根收窄，跨项目同名相对路径会误认领 |
| 4 | 🟡 | **Dispatched** | 判据一的落点（记账面）无符号、归属表无名字；承重句「子代理的写也走同一条记账面」未引原文 |
| 5 | 🟡 | **Dispatched** | 「此前记账只存路径、把归属丢掉了。现在…」是规范面的改动史，与需求 §6「状态文档只写当前状态，历史由 git 保存」冲突 |
| 6 | 🟡 | **Dispatched** | 新增回执行 `[changed surface]` 未指定承载面，与 §4.5「每一面按谁读得到来定」的既有写法不一致 |
| 7 | 🟡 | **Not an issue** | 协调项：§2 已载档位结论（六档均 ≤ 500）与集成增量（新增 `CLI 41-3` 一例）；评审席未绑定批档。需求追溯落在 `ENGINEERING-MODE-V2-SPEC-BATCH-SEGMENT.md`，属范围外档，不在本轮判 |

修面面 = 设计档 `docs/core/design/BATCH-RECORD.md` 一个。不改需求档，不改 §2 条目与验收行，不动「甲 + 丙」的方向选择。

## 派实施前裁定：集成用例落点未定（主 agent · 2026-11-15 19:42）

`§2`「用例 delta」写「编号 = RTM 该故事段下一号」，但没有点名哪一个故事段；「受影响文件与机读清单」七行里也没有集成测试档。

后果两条：① 实施席要自己猜用例落在哪个 `test/integration/*.test.mjs`，猜错就是故事归属错；② 只要它动了那个档，该档就是「本批改动的代码档」，机读清单缺它的行读数，收口门会拒——`#2444` 就是在这一步被拦下、补登记两轮。

派 `#42`（设计席 fix 轮）只做一件事：在 §2 的用例 delta 里点名故事段（号 + 题名），点明集成用例落在哪个 `test/integration/*.test.mjs`，并把该档按同一把尺（`countContentLines`，批起快照 `c8dcc16`）写进机读清单。

不动的：`BATCH-RECORD.md`（已评审通过，字节不得再动）、§2 条目与验收对照、机制方向。

## 认领按分源裁定 + 落地核对处置（主 agent · 2026-11-15 20:15）

### 一、认领「在途」按来源分开（实施期裁定，当时只发给实施席，现补落档）

**起因**：实施席 `#44` 报设计档同一节内两句相抵——概括句「减去**别的在途批已认领**的档」要求邻居在途；具体句「本会话归属表里别的批档是观测；盘上另一份**未收口**批档的 §2 机读清单只是计划面」把「未收口」只挂在计划源上。按概括句实现，则后收口那批邻居已关 ⇒ 不算认领 ⇒ 照判 ⇒ 拒，本批等于白做。

**裁定：按源分开，不一刀切。**

- **观测源（归属表）不要求在途**：归属表记的是「哪一批写了这一档」，那一批关了，这个事实不变。
- **计划源仍要求在途**，并保留它是想对的两条边界（该档在那份批档自己的 `baseSha..HEAD` 内、同项目根）。

**理由**：实施席拒绝扩到已收口批档时给的理由（收口批的 `committedDocs` 上界是 HEAD、会一直长，对计划面恒真）**只对计划源成立**；归属表是观测，没有这个问题。

**连带**：验收 #1「两次收口均放行」保持原文不缩；集成用例除在途序外另加一条「邻居已收口但归属仍在表里 ⇒ 本方仍放行」；方案 (c)（批档记收口 sha）不做——新状态，越出本批。

**设计档措辞过窄**：§4.18.1 的概括句（`:260` ∥ `:263`）与具体句不一致，是首轮评审 `#40` 第 4 条已记的歧义，本批真的踩了。交付后由设计席一次改净（见下）。

**跨会话残留边界**：别的会话开的批若已收口，归属表不留痕，那一档仍会被要行。已要求实施席在 §5 如实写，不许粉饰成已解决。

### 二、§5「落地核对」四条的处置（收口裁定）

判据按纪律：**代码不对就改代码；目标变了才改设计**。四条全属后者——实现是对的，设计档的话过宽或不精确。

| # | 设计句 | 落地实况 | 处置 |
|---|---|---|---|
| 1 | §4.18.1「`agent._batchDoc` 在写时已绑定」 | 只在**子代理**上成立（唯一赋值点 `subagent-spawn.mjs` 的 `if (batchBound) child._batchDoc = batchDocAbs`）；depth-0 主 agent 在 CLI 会话为空 | **改设计**：收窄成「绑定时已知」，并写明 depth-0 为空这一事实与该情形下的走向；缺口本身已是台账 `#2460` |
| 2 | §4.18.1「减去别的在途批已认领的档」 | 按本页第一节裁定分源 | **改设计**：概括句与 `:263` 一并改成按源表述 |
| 3 | §4.18.1「抽取面复用现成的 `doc-check/existence.mjs`（机读清单读取）」 | 实际只从它取 `batchDirs`；清单行取自 `batch-segment-vocab.mjs` 的 `machineListRowsOf` | **改设计**：写清两个面各自的来源 |
| 4 | §2 对 `subagent-async.mjs` 的「内联循环换成调用新叶档的合入函数」 | 内联循环保留，承担 `_touchedFiles` 并集；归属由 `mergeAttribution` 另行合入 | **改 §2**：改成「在既有内联循环之外另调 `mergeAttribution`」，`_touchedFiles` 形状不动那句保持 |

四条均不阻塞收口，但留一条就是一句与盘上不符的规范——同笔改净。

## `#49` 上抛的两条裁定（主 agent · 2026-11-15 20:07）

**一、设计档改后要不要再走一轮设计评审 —— 不走。**

三条改动都是把设计档的措辞收窄到**评审已批准、实施已落地**的事实上：判据一改成「绑定时已知」、认领按源分开（这是实施期已裁的口径）、抽取面写清两个来源。语义没有变，变的是文档与代码是否说同一件事。

纪律里「改后重评」针对的是**目标变了**（实施按已批设计会造出错的东西）；这里是目标没变、实施先到、文档追赶。再评一轮等于为一次纠错付两次评审费，且 `§4.18.1` 的判据本体（甲 + 丙、判据一在前、fail-closed）一字未动。

**二、代码注释与设计档相抵 —— 是缺陷，本轮改，不记账。**

`thincoder-core/agent-tools/batch-closeout.mjs` 第 232 行注释仍写「判据二 = 提交 diff，减去别的**在途**批已认领的档（认领两源：本会话归属表里的别的批档 ∥ 盘上**在途**批档的 §2 清单）」——把「在途」同时挂到观测源上，正是我 20:15 裁定推翻的那条口径。同档 `sessionClaimsOf` 的注释写对了，所以这是**同一文件内两处互相矛盾**。

它是本批自己造出来的（实施时留下的旧口径），不是存量债：一个照这句注释实现的人，会把「邻居已收口仍算认领」做回去。按「修在看见的那一轮」，派实施席改这一处注释，不立台账。

## 评审 `#50` 裁定（主 agent · 2026-11-15 20:11）

第三轮 `VERDICT: pass`（0 🔴 · 1 🟡 · 4 🔵）。

评审逐条核了 §4.18.1 ∥ §4.7 ∥ D-BR44 与实施面的对应：两个记账点都同笔调 `recordAttribution`、`_batchDoc` 唯一赋值点在 spawn、三个导出名逐字、`committedDocs` 是 `<base>..HEAD`、`sessionClaimsOf` 不筛状态而 `neighborListClaims` 只放未收口、合成规则与 `changedSurface` 的 `mine.has(key) || !claimed.has(key)` 一致。

结论：**没有档码不一致的字节，没有新增静默放过面**。

五条处置：

| # | Severity | 处置 | 落点 |
|---|---|---|---|
| 1 | 🟡 | 修 | 设计档：边界补「跨会话 + 邻批已收口」这一残余代价 |
| 2 | 🔵 | 修 | 设计档：小标题「diff 只报不判」改成「被别的批认领的档只报不判」 |
| 3 | 🔵 | 修 | 设计档：`baseShaOf` 为 null 那句改成「判据 = 归属 + 认领；diff 腿不贡献条目」 |
| 4 | 🔵 | 修 | 设计档：补「三个面共用一个比较键（`surfaceKey`），归一不在记账面做」 |
| 5 | 🔵 | 不修 | 场景在档里被点名，不是无语义的想象防御；引一条实测只对读者更硬，成本是一轮设计 |

第 2 条有实施面的连带：`batch-closeout.mjs` 的注释正引「diff 只报不判」这个标签当判据单源，标签读窄了会把实施面读歪。

**顺序**：先派实施席改 `batch-closeout.mjs` 第 232 行的注释——评审前签发的 token 只对设计档未改的字节有效；实施交付后再派设计席落上表四条，设计档一改那个 token 即封，故实施必须在前。

## 档位门拦截裁定（主 agent · 20:16）

**事实（`#52` 实测）**：`thincoder-core/agent-tools/batch-closeout.mjs` 批起 359（§2 第三列）→ 现盘 510，越设计时线 500；`assertTierPlan` 的越线方案支按**当前盘上长度**比 500，§2 第二列只有 `—` ⇒ 拒。

**裁定：取「记录方案」，不取另外三条。**

- 否**甲**（压注释降到 ≤500）：那是让被检查物迁就检查，会把「本档已越过设计时线」这一事实藏起来。这 18 行注释复述的正是设计档 §4.18.1 的口径，而本档头注自称「本档只实现，不重述口径（D2）」——这份重复该由下一批的**提取**一并解决，不靠临时削掉凑数。
- 否**乙**（本轮真拆）：提取 `changedSurface` 一族要改设计档点名的落点 ⇒ 重走一轮设计评审拿新 token + 再一轮实施。对一个 510 行的档撑开两轮不合算；`CODE-TIER.md` §2.2 的收口线是 800，510 本就不触拆分。
- 否**丙**（本批照 800 判、立台账）：门是现成机制，本批不改它。

**处置**：§2 第二列给 `batch-closeout.mjs` 写一条可用方案（提取 `changedSurface` 一族到新叶档，同轮把复述 §4.18.1 的注释收成指向式，并改设计档 §4.18.1 的落点名），**下一批实施**；§5 的读数由旧值 491 更正为实量 510，并写明「本档越设计时线，方案见 §2 第二列；收口时点线 800，本档 510 ≤ 800」。

**留在本批之外的一条张力（待用户裁）**：`CODE-TIER.md` §2.1 写「基准是修改代码前的长度」，而越线方案支取的是**收口时的当前长度**。按前者，本档批起 359 不触发方案义务；按后者，510 触发。本批按门的要求如实记录方案，不改门、不改标准。

## 20:20 改判：取甲（本批真拆）

`#55` 实测把 20:16 的取丁推翻了一条：`batch-tier-gate.mjs` 的 `planGapOf` 要「带目录段的目标档 ＋ 落步词（`实施轮` ∥ `§5`）」**合取**，注释明写「点名了目标却把落地推给下一批的，不命中落步词，同样不命中」。

我 20:16 写的「下一批实施轮」含落步词，**是靠词形过的门，不是判据本意**——这种过法我不接受，它把一条记录写成了一件不真的事。`CODE-TIER.md` §2.1 也硬：「`> 500`：必须在当前工作中给出**并实施**拆分方案」。取丁与这两处都不相容。

**改判为甲：本批真拆。**

代价比 20:16 估的小——`#55` 指出提取面可以收窄：只搬判据一族（`selfAttributedOf` ∥ `sessionClaimsOf` ∥ `neighborListClaims` ∥ `displayRelOf`）。

留在 `batch-closeout.mjs` 的是 `changedSurface`（入口）∥ `changedSurfaceReceiptLine`；`surfaceKey` 按 `#57` 的上抛随判据一族进新叶档（三处判据都用它，留本档就要让新叶档反向 import、两档成环）。设计档 §4.18.1 写的是「串由 `batch-closeout.mjs` 出」，且只按符号名点名 `surfaceKey`、不钉档位，这一分法让那句话仍然成立 ⇒ **设计档不改、token 不失效、不用再走一轮设计评审**。

这是甲成立的关键，也是我先前把乙估贵的原因——我按「整族搬走」算的，搬法不对。

**执行顺序**：`#55` 改 §2 第二列（点名新叶档全路径 + `实施轮` + 提取哪四个/留哪三个）并给新叶档加 `新` 行 → 我派实施席按 token 执行提取 → §5 记录 → 收口。

20:16 那段「取丁」的裁定连同三条否决理由**保留在档**（它们对「压注释凑数」「整族搬走要重评」两条仍然成立），但结论已被本条取代。

## 20:22 token 被封：我自己的顺序错了

派实施席时被拒：

```
Error: designToken seal mismatch — the reviewed documents changed after the review passed:
       docs/core/design/BATCH-RECORD.md — re-run the review, or revert those files to the version the review approved.
```

成因是我 20:11 的派单顺序：我让设计席在**实施之前**把评审 `#50` 的四条落进 `BATCH-RECORD.md`。纪律写的是反的——评审通过后、实施开始前不动被评审的档，要改的写进批档，**交付之后**再动设计档。我为了少一轮，把顺序做反了，代价是一轮设计评审。

处置：**重跑一轮设计评审**（不是撤回那四条——四条是对的，且它是被评审过的那份档的改进）。评审通过后拿新 token 派实施，此后到交付为止 `BATCH-RECORD.md` 一个字节不动。

**给设计席的纪律**：本轮之后、实施交付之前，不许再改 `BATCH-RECORD.md`；要改的写进本档 §1，交付后一轮改净。

## 评审 `#56` 裁定（主 agent · 2026-11-15 20:26）

**结论**：`VERDICT: pass`，0 🔴 · 5 🟡 · 4 🔵（其中 1 条为前轮结转）。token = ``，designId = `c10ca866-ca82-46f9-8531-626727345816`。

**逐条处置**

| # | 评审条 | Action | Detail |
|---|---|---|---|
| 1 | 需求档里没有本机制的功能点与验收 | Deferred | 需求档在本轮设计评审的受审集内，动它即封当前 token；与本表 2–6 同批、交付后一并落 |
| 2 | §4.7 不变量未带 §4.18.1 的两处边界 | Deferred | 同上：`BATCH-RECORD.md` 已随评审通过冻结，交付后设计席一轮改净 |
| 3 | `[changed surface]` 承载面写成无条件的（`mode === "normal"` 之外不出行） | Deferred | 同上 |
| 4 | 认领条件 ③「可读地未收口」缺持久理由 | Deferred | 同上 |
| 5 | 「见本文末段边界」是位置指针，指不到 | Deferred | 同上 |
| 6 | 需求档功能点 9 与 §4.4 两说（前轮 🔵 结转） | Deferred | 同上，随第 1 条同笔改 |
| 7 | `batch-closeout.mjs` 的注释引了设计档已不存在的标签「diff 只报不判」 | Dispatched | 该档正是本轮实施要动的档；§2 增「顺带改净」一条，交实施席同笔改 |
| 8 | 开场的失败场景未点到复现物 | Not an issue | 复现物 `CLI 7-32` 是过程记录里的用例号；写进状态档即 D10 的必死指针，场景作为机制来由陈述、复现已由用例承载 |
| 9 | 本评审无绑定批档，§2 各项不可核 | Not an issue | 复核 §2 现文：分层结论（§2「受影响文件与分层结论」末段）、先例与勘察（§2「先例与勘察」）、验收对照五条、用例 delta 均在档 |

**派单顺序纪律（20:22 那次自纠，写死在这里）**：评审通过 → 到交付为止，`BATCH-RECORD.md` 与需求档一个字节不动；要改的写进本表，交付后由设计席一轮改净。上一轮我为了省一轮先让设计席改了四处，token 因此被封，多花一轮——代价一样，还多了一次空转。

**§2 补件（派实施前）**：本轮 §2 的机读清单第二列已写提取方案，但散文「受影响文件与分层结论」仍列七档（机读清单九行，D3 两处不齐）、验收对照无该提取的判法、第 7 条的注释改净项未入册。三条一并交设计席补，再派实施。

**收口受阻：收口前置门按旧取材判定（主 agent · 2026-11-15 20:47）**

- 现象：`close` 被 tier-reading gate 拒，点名五档「§2 清单里没有这一档的行」——`edit-batch-entry-outcome.test.mjs` 92 ∥ `buffered-edit.mjs` 217 ∥ `edit-batch.mjs` 290 ∥ `edit-diff.mjs` 483 ∥ `file.mjs` 461。
- 成因：这五档是 `#2457` 的改动面（已收口提交 `249b6b95`），落在本批窗口 `c8dcc16e..HEAD` 内。**本批改的取材逻辑在盘上，但当前进程加载的是改动前的模块**，门仍按「窗口内所有批」取材。本批要解决的正是这件事，只是没能作用在自己身上。
- 处置：按 `#2444` 先例，由设计席在 §2 机读清单补这五行（第三列写门给的基线数），表下写明这五档属邻批 `#2457`、本批对它们零改动。记录必须说过的事，不靠进程重启去绕。
- 禁改：条目与验收对照、机制设计、已有九行读数、批档其余段。

## §2 批次任务与设计（eng-designer）
**状态行**：设计完成

<§2 模板占位：本批条目（覆盖） / 设计档落点 / 机制设计 / 受影响文件与测试覆盖 / 验收对照 / 关键决策 / 上抛项>

<§2 模板占位：机读清单 = 标题行「**受影响文件（机读清单）**」+ 围栏内三列表（表头 | 档 | 分拆方案 | 行数 |、分隔行 |---|---|---|、一行一档，只列代码档（源 ∥ 单测））；第二列：越设计时线的档写正向形方案（点名带目录段的档 + 本批落步 `实施轮` ∥ `§5`），未越线写 —；第三列：该档在批起快照上的内容行数（量法 = `countContentLines`），快照里没有这一档写 `新`；示例行 = | thincoder-core/agent-tools/batch-tier-gate.mjs | — | 新 |>

## 覆盖与不覆盖

覆盖 = 台账 #2439（收口门改动面取材跨批）。设计档落点 = `docs/core/design/BATCH-RECORD.md` 新增 §4.18.1「本批改动面的取材」，并在 §4.7 不变量、§7 关键决策（D-BR44）各登记一条。

不在本批：档位门第三列与批起基线的比对法（`#2433` 的读数基准）、§2 机读清单三列语义、写门的拒绝行为与报文、收口门的其余四臂。补登记（给邻批码档补镜像行）仍是现状的权宜，本批给的是让它不再需要的判据。

## 机制设计（口径单源 = 设计档 §4.18.1）

**判据一 · 写时归属**：记账那一刻「这笔写服务哪一批」在有绑定时已知（`agent._batchDoc`——子代理由 spawn 绑定，depth-0 主 agent 为空、那一路的写不入归属表），记账同时写下路径与它服务的批档；收口取归属含本档的路径。`_touchedFiles` 形状不动，归属另记一张表。

**判据二 · diff 按认领收窄**：提交 diff 兜住不经记账工具写的档（`bash` ∥ `execute` 落盘、脚本生成），减去别的批已认领的档。认领两源，任一成立即算认领：本会话归属表里别的批档（观测源，不看那一批收没收口），或盘上另一份未收口批档的 §2 机读清单列了这一档（计划源）。

**只报不判**：被别的在途批认领的档不判读数，收口回执留一行 `[changed surface]` 点名。子代理的归属表随 `mergeChildMutations` 并入父侧（并集）。

三个方向的静默失效面（取舍依据同在设计档 §4.18.1）：甲 只按归属 ⇒ 放过不经记账工具写的码档；乙 清单即契约 ⇒ 漏登记而档没进改动面时永远不报；丙 只按 diff 提示 ⇒ 跨会话并行时两边都不判。故选甲 + 丙。

## 受影响文件与分层结论

实现面收敛在四处记账点、一处判据点、一处回执点，外加新叶档与测试料；下表九档代码档与机读清单前九行逐行对应。

- `thincoder-core/agent/batch-attribution.mjs`（新叶档）：归属表的记录、查询与合入三个纯函数，零 fs、零 import。
- `thincoder-core/agent/record-results.mjs`：记账点一，路径入账时同时记归属。
- `thincoder-core/agent/turn-loop.mjs`：记账点二，同上。
- `thincoder-core/agent-tools/subagent-async.mjs`：`mergeChildMutations` 在既有 `_touchedFiles` 内联循环之外另调 `mergeAttribution`（归属表并集）；`_touchedFiles` 的形状与去重语义不动，净行数不增。
- `thincoder-core/agent-tools/batch-closeout.mjs`：`changedSurface`（入口）按归属取材、diff 按认领收窄；回执行 `changedSurfaceReceiptLine` 留在本档——设计档 §4.18.1 那句「串由 `batch-closeout.mjs` 出」指的正是它。
- `thincoder-core/agent/batch-changed-surface.mjs`（新叶档）：判据一族——比较键 `surfaceKey` ∥ 显示式 `displayRelOf` ∥ 三处判据 `selfAttributedOf` ∥ `sessionClaimsOf` ∥ `neighborListClaims`。
- `thincoder-core/agent-tools/batch-lifecycle.mjs`：两处回执串各内联一行回执行（替换既有串，净行数不增）。
- `docs/batches/2026-11-15-closeout-surface-per-batch.test.mjs`（新单测档，收口时删）：验收 1–5 的判据与红侧。
- `test/integration/changed-surface-per-batch.test.mjs`（新集成档）：本批唯一的集成用例 `CLI 7-32`，场景在档内自建，不改共享夹具。

机读清单只收代码档：本批另动 `test/rtm/guard.md`（用例面，`.md` 无行读数、故不进清单）。

分层结论（量法 = `countContentLines`）：批起快照上无一档越过 500 行，读数见下表第三列。本批两档在 480–500 之间（`thincoder-core/agent-tools/subagent-async.mjs` ∥ `thincoder-core/agent-tools/batch-lifecycle.mjs`），本批要求这两档零净增行。

一档越过设计时线：`thincoder-core/agent-tools/batch-closeout.mjs` 批起快照 359、收口前现盘 510。门比的是现盘长度，故越线方案随本批落地（下表该行第二列）——本批实施轮已真拆，判据一族搬进新叶档，拆后实测 419，越线方案支不再触发。

后五行是邻批的档，按同一把尺量过（批起快照 ∥ 现盘），两列都未越 500：

- `test/integration/edit-batch-entry-outcome.test.mjs` 92 ∥ 125
- `thincoder-cli/src/acp/buffered-edit.mjs` 217 ∥ 217
- `thincoder-core/tools/edit-batch.mjs` 290 ∥ 293
- `thincoder-core/tools/edit-diff.mjs` 483 ∥ 480
- `thincoder-core/tools/file.mjs` 461 ∥ 461

故这五行的第二列写 `—`。

本批新建四档按 `docs/core/standards/CODE-TIER.md` §2.1「新建文件使用其本次落盘长度」判：落盘时各自内容行数须 ≤ 500，否则分拆随本批落地。

四档 = `thincoder-core/agent/batch-attribution.mjs` ∥ `thincoder-core/agent/batch-changed-surface.mjs` ∥ `docs/batches/2026-11-15-closeout-surface-per-batch.test.mjs` ∥ `test/integration/changed-surface-per-batch.test.mjs`。

**受影响文件（机读清单）**

| 档 | 分拆方案 | 行数 |
|---|---|---|
| thincoder-core/agent/batch-attribution.mjs | — | 新 |
| thincoder-core/agent/record-results.mjs | — | 205 |
| thincoder-core/agent/turn-loop.mjs | — | 337 |
| thincoder-core/agent-tools/subagent-async.mjs | — | 486 |
| thincoder-core/agent-tools/batch-closeout.mjs | 提取 `selfAttributedOf` ∥ `sessionClaimsOf` ∥ `neighborListClaims` ∥ `displayRelOf` ∥ `surfaceKey` 到新叶档 `thincoder-core/agent/batch-changed-surface.mjs`，本档单向 import 它们（不成环）；留 `changedSurface`（入口）∥ `changedSurfaceReceiptLine`。落地 = 本批 §5 实施轮。读数（`countContentLines`）：现盘 510 − 搬走 85（四段 80 + `surfaceKey` 5）+ 一行 import ⇒ 落盘后 < 500 | 359 |
| thincoder-core/agent/batch-changed-surface.mjs | — | 新 |
| thincoder-core/agent-tools/batch-lifecycle.mjs | — | 494 |
| docs/batches/2026-11-15-closeout-surface-per-batch.test.mjs | — | 新 |
| test/integration/changed-surface-per-batch.test.mjs | — | 新 |
| test/integration/edit-batch-entry-outcome.test.mjs | — | 92 |
| thincoder-cli/src/acp/buffered-edit.mjs | — | 217 |
| thincoder-core/tools/edit-batch.mjs | — | 290 |
| thincoder-core/tools/edit-diff.mjs | — | 483 |
| thincoder-core/tools/file.mjs | — | 461 |

后五行属邻批 `#2457`，本批对它们零改动。它们是 `#2457` 已收口提交 `249b6b95` 的改动面，落在本批窗口 `c8dcc16e..HEAD` 内；收口前置门的取材不区分批次，于是把这五档算进本批改动面。补这五行只为让门的读数支有行可读，不把邻批的档记成本批改的。先例 = `#2444` 为邻批码档补镜像行的同一处置（§1 2026-11-15 20:47 裁定）。

## 验收对照

| # | 任务书验收 | 判法 | 读者看什么 |
|---|---|---|---|
| 1 | 两批并行各判各的 | 同一工作树两批：先开的批改四档并提交，后开的批改另一批档；两批各自收口都不为对方档要行 | 两次收口均放行；回执行点名对方的档 |
| 2 | 真的漏登记仍拒 | 本批改一码档、§2 无该行 ⇒ 收口拒，拒文点名该档 | 拒文里出现该档的仓根相对路径 |
| 3 | 子代理改的档仍进判据 | 子代理改码档并合入，§2 无该行 ⇒ 拒 | 同 2 的拒文 |
| 4 | 无批起 sha 时行为不变 | `baseShaOf` 返回 `null` ⇒ diff 腿不启动，只按归属判 | 与改前同形：只判触达面，内容按批收窄 |
| 5 | 红侧：改前必拒、改后放行 | 两批并行的同一现场，在改前代码上跑必拒、改后跑放行 | 两次运行的拒 ∥ 放行各自可复现 |
| 6 | 越线的判据档随本批落地（§1 2026-11-15 20:20 裁甲） | 实施轮把判据一族搬进 `thincoder-core/agent/batch-changed-surface.mjs`；`batch-closeout.mjs` 留 `changedSurface`（入口）∥ `changedSurfaceReceiptLine`，并单向 import 新叶档 | 收口那一笔放行；两档各自 `countContentLines` ≤ 500；`changedSurfaceReceiptLine` 仍由 `batch-closeout.mjs` 导出 |
| 7 | 代码注释不指向设计档已不存在的标签（评审 `#56` 第 7 条） | 读 `changedSurfaceReceiptLine` 的文档注释：判据单源句是否指到设计档 §4.18.1 现文里的词 | 注释里不再出现 `diff 只报不判` 这个标签名，引的是「被别的批认领的档只报不判」或该节节名 |

1–5 落在本批单测档 `docs/batches/2026-11-15-closeout-surface-per-batch.test.mjs`（收口时删）；6 由收口那一笔的门结果与两档的行读数判；7 由读那段注释判。集成面见下节 delta。

## 用例 delta（对 `test/RTM.md`）

- 改写的用例：无（现有收口面用例断言拒文与放行，本批不放宽任何一条）。
- 删除的用例：无。
- 新增 1 例，标题「两批同工作树并行：各自收口只判本批改动面，邻批码档只进回执行」。

新增例的归属：

- 故事段 = `CLI 7`「收口只判本批改过的档」，属册 = `test/rtm/guard.md` 的 CLI 7 节，索引行在 `test/RTM.md` 的故事索引表。
- 编号 = `CLI 7-32`，即该故事段现有最大号 `7-31` 的下一号；空号 `7-12` ∥ `7-15`–`7-17` 是退役号，不回收。
- 落档 = `test/integration/changed-surface-per-batch.test.mjs`（本批新建），用例标题形 = `test('CLI 7-32 正常 · 两批同工作树并行：各自收口只判本批改动面，邻批码档只进回执行')`，号与该行逐字一致。
- 落步 = 实施轮（eng-coder，§5）：先在该档写入 `CLI 7-32` 一行，再按该号落用例档——编号先于用例标题设立。
- 失效 = 本批收口时 RTM 与用例档都没有 `CLI 7-32`，则本项按未落地记入 §6。

落档选新档、不并进 `test/integration/batch-close-gate.test.mjs`：后者在批起快照上已 633 行（量法 = `countContentLines`），并进去就要求本批同时对它给出**并实施**分拆方案（`docs/core/standards/CODE-TIER.md` §2.1）；新档按「本次落盘长度」判，本批不外扩分拆面。同目录先例 = `test/integration/machine-list-head-form.test.mjs`（一个子面一档，75 行）。

两批同工作树的场景在用例档内自建夹具（两份批档、两个批起 sha、两把绑定工具），不改同目录的共享夹具 `test/integration/close-gate-fixture.mjs`——那份夹具按单批硬绑 `BATCH_REL`，改它要连带全族调用方。

## 关键决策

| # | 决策 | 理由 |
|---|---|---|
| 1 | 归属记在触达账旁边的表，不改 `_touchedFiles` 形状 | 它有 `recent_changes`、`verify`、子代理调度、审计块四处读者；改形状要同轮改四处，而归属只是多一列事实 |
| 2 | 归属的键取批档路径，不取台账号 | 收口比对的正是批档本身；号→档还要多一次映射，而一笔写只知道它服务的批 |
| 3 | diff 按「别的批已认领」收窄，认领两源对批档状态要求不同：本会话归属表（观测源，不看那一批收没收口）∥ 盘上未收口批档的 §2 机读清单（计划源，另加三条观测条件） | 会话级归属表跨会话无效；批档在盘上，是跨会话唯一可读的认领面 |
| 4 | 收窄掉的档仍进回执行 | 判据收窄，事实不能消失；「这些档也变了，确认是否本批」正是人该看的那一眼 |
| 5 | `surfaceKey` 随判据一族进新叶档，不留本档 | 三处判据都用它；留下就要让新叶档反向 import，两档成环。设计档 §4.18.1 只按符号名点名它（「三个面……共用一把比较键：`surfaceKey`」）、不钉档位，故这条不改设计档 |

### 修轮 5（§1 2026-11-15 20:26「§2 补件」→ 就地改）

修面 = 本段三处（受影响文件散文 ∥ 验收对照 ∥ 关键决策加一条）＋一条「顺带改净」。设计档 `docs/core/design/BATCH-RECORD.md` 与需求档一个字节未动（§1 20:26 的派单顺序纪律：评审通过到交付为止，不动被评审的档）。

| §1 要求 | 处置 | 落点 |
|---|---|---|
| 散文列七档、机读清单九行（D3 两处不齐） | 已改 | 「受影响文件与分层结论」列九档，与机读清单逐行同序同名；另记 `.md` 用例面 `test/rtm/guard.md` 不进清单的理由 |
| 验收对照无提取的判法 | 已补 | 第 6 行：越线判据档随本批落地的判法（门放行 ∥ 两档读数 ≤ 500 ∥ 回执行仍从 `batch-closeout.mjs` 导出） |
| 第 7 条注释改净项未入册 | 已入册 | 本段新增「顺带改净」一节 ＋ 验收第 7 行 |

**顺带改净（同笔，交实施席）**

| 档 | 符号 | 现文（本轮实读） | 改成 |
|---|---|---|---|
| `thincoder-core/agent-tools/batch-closeout.mjs` | `changedSurfaceReceiptLine` 的文档注释 | 「\`[changed surface]\` 收口回执段（判据单源 = 设计档 §4.18.1「diff 只报不判」）」 | 判据单源句改指设计档 §4.18.1 的现标签「被别的批认领的档只报不判」，或改指该节节名 |

同档另有三处出现「只报不判」，都只是在描述「报而不判」这一半、与代码一致，不动：`assertCloseoutGates` 的位次说明 ∥ `changedSurface` 段的门结果交回说明 ∥ 回执串本身。

读数（本轮实跑，量法 = `countContentLines`）：`thincoder-core/agent-tools/batch-closeout.mjs` 现盘 510；四段判据 80（`displayRelOf` 7 ∥ `selfAttributedOf` 13 ∥ `sessionClaimsOf` 14 ∥ `neighborListClaims` 46）；`surfaceKey` 5。

`[上抛·知会]` 与 §1 20:20「三段留下」的差只有 `surfaceKey` 一行；§1 的硬边界（四段出去、`changedSurfaceReceiptLine` 留下）未动。若主 agent 要它留在本档，实施席只能让两档互相 import——本席按上表落地，裁定权在主 agent。

## 先例与勘察

先例 = 同族的「判据单源」纪律：`batch-tier-gate.mjs` 的入参注释写明改动面是**调用方交进来的**（「`changed` = 本批改动面——**调用方交的现成两面**（写工具触达账 ∪ 提交 diff，绝对路径）」），门自己不取。本批改的正是交进来那一面的取材，门的判法一字不动。

勘察证据（本轮实读）：`batch-closeout.mjs` 的 `assertCloseoutGates` ∥ `changedSurface` ∥ `tierRootOf` ∥ `baseTextReaderOf`；`batch-tier-gate.mjs` 的 `assertTierPlan` ∥ `readingFindingsOf` ∥ `codeFilesOf`；`batch-regions.mjs` 的 `committedDocs` ∥ `diffBaseOf`。

同轮实读的第二组：`record-results.mjs` 的记账块 ∥ `turn-loop.mjs` 同形块 ∥ `subagent-async.mjs` 的 `mergeChildMutations` ∥ `write-gate-ledger.mjs` 的 `ledgerBindWriteConflict` 前两行（子代理不过写门）。

外部源码档 = 已查，无相关：本机制完全在本仓批次工具面内。

新落点三问：`已查无`——归属表类机制在本仓不存在（查过：`agent/` 全部 `.mjs`、`agent-tools/` 的批次族、`_touchedFiles` 的全部读者）。合入点用现成的 `mergeChildMutations`（消费者 = `escalate-async.mjs` 与 `subagent-run.mjs`），不另造合入路径。

## 上抛项

`[上抛·知会]` 设计档 §4.18.1 的边界明写「不动 `#2433` 的读数基准」：那条记的是第三列与批起基线的比对法，与本批的取材面相邻而不同对象。若评审认为两条该并批，请裁，本批不夹带。

## 修轮 1（评审 #34 裁定 → 设计档就地改）

修面 = `docs/core/design/BATCH-RECORD.md` 一处（§4.18.1 主体 + §7 D-BR44）。§2 条目与验收行未动，需求档未动，「甲 + 丙」方向未动。

| # | 处置 | 落点与原文 |
|---|---|---|
| 2 | 已改 | §4.18.1 新条「**两腿相反时判据一说了算**。同一档在归属表里属本档、又被邻批认领 ⇒ 本批的，判：一条直接的写记录不被另一个批的计划推翻。归属表里没有它、认领成立 ⇒ 不判，只报。两腿都不说话 ⇒ 本批的，判」；「两层，主判据在前」改为「两腿，判据一在前」 |
| 3 | 已改（两半） | ① 计划面不算所有权：新条「**认领要有观测支撑**」——清单这一源另加「该档确在**那份批档自己的**批起 sha..HEAD 之内（`baseShaOf` 取那份批档的批起 sha，`committedDocs` 给档清单）」。② 按项目根收窄：同条「且那份批档与本次收口**同项目根**（路径按仓根相对归一后再比，win32 再折大小写）——跨项目同名的相对路径不认领」 |
| 4 | 已改 | 记账面点名两处 `agent._touchedFiles.push(abs)`（`record-results.mjs` ∥ `turn-loop.mjs`）；归属表点名载体 `thincoder-core/agent/batch-attribution.mjs`、挂点 `agent._batchAttribution`、三个导出面 `recordAttribution` ∥ `attributedTo` ∥ `mergeAttribution`；承重句带原文：`record-results.mjs`「if (!agent._touchedFiles.includes(abs)) agent._touchedFiles.push(abs)」· `subagent-async.mjs`「for (const abs of child._touchedFiles ?? []) {」· `subagent-spawn.mjs`「if (batchBound) child._batchDoc = batchDocAbs」 |
| 5 | 已删 | 「只是此前记账只存路径、把归属丢掉了。现在…」整句删除，改写为当前态「所以每笔记账除路径之外同时写下它服务的批档」 |
| 6 | 已改 | §4.18.1 新增承载面段：`[changed surface]` 的承载面 = 收口那一笔返回给调用方的回执文本，与 `[doc-check gate]` ∥ `[ledger reanchor]` 同面；读者 = 收口这一笔的调用者。按 §4.5「谁读得到这份档」的口径定面，不写进批档、不进台账 |
| 1 · 7 | 不适用 | 裁定为 Not an issue，未改 |

两处机制加法（评审席请按新条判）：

- 清单认领要一条观测 ⇒ 收口时每个落在 diff 里的邻批认领多一次 git 调用（`baseShaOf` + `committedDocs` 各一次）。取舍：不认领的代价是多要一行镜像行（与改前同形，看得见）；认领错的代价是一条永不兑现的计划把一档从每一批的判据里摘掉（静默）。往判的方向倒。
- 判据一优先只在本批确实记过这笔写时成立；未记归属的写（`bash` ∥ `execute` 落盘、无绑定子代理）仍按认领判定，认领不成立即本批——本批要补行的那一面没有放宽。

修轮 1 补一条（与 #3 的 ① 同一处）：清单认领须归到**具体那份批档**——观测要它自己的批起 sha，跨批合并后的路径集给不出；抽取面复用现成的 `thincoder-core/doc-check/existence.mjs`（机读清单读取）。落点 §4.18.1「认领要有观测支撑」条末。

## 修轮 2（§1「派实施前裁定：集成用例落点未定」· 2026-11-15 19:42 → 就地改）

修面 = §2 一处（用例 delta ∥ 受影响文件清单 ∥ 分层结论）。`docs/core/design/BATCH-RECORD.md` 未动（已过评审，字节冻结），§2 的验收对照与「甲 + 丙」方向未动。

| 裁定要求 | 处置 | 落点与原文 |
|---|---|---|
| 点名故事段（号 + 题名） | 已改 | 用例 delta 新增「故事段 = `CLI 7`「收口只判本批改过的档」，属册 = `test/rtm/guard.md` 的 CLI 7 节」 |
| 点明集成用例落在哪个档 | 已改 | 同节「落档 = `test/integration/changed-surface-per-batch.test.mjs`（本批新建）」，并写明用例号 `CLI 7-32` |
| 该档按同一把尺写进机读清单 | 已改 | 机读清单末尾补一行 `| test/integration/changed-surface-per-batch.test.mjs | — | 新 |` |

三条读数（本轮实跑，量法 = `countContentLines`，快照 = 批起 sha `c8dcc16e`）：

- `test/integration/batch-close-gate.test.mjs` 在快照上 = 633 行 ⇒ 越过设计时线 500。故用例不并进该档，另建新档（理由与先例见用例 delta 末两段）。
- `test/integration/close-gate-fixture.mjs` = 200 行，`test/integration/machine-list-head-form.test.mjs` = 75 行（先例档，与本批无关，仅供比形）。
- 机读清单原六行的读数同轮复核、与本批快照逐一相符（`205` ∥ `337` ∥ `486` ∥ `359` ∥ `494`，另两档为 `新`）；`batch-attribution.mjs` 与单测档在快照上确实不存在，故仍是 `新`。

两处随之收窄的口径：

- 新档 `test/integration/changed-surface-per-batch.test.mjs` 的夹具自建，不动共享夹具 `test/integration/close-gate-fixture.mjs`——后者按单批硬绑 `BATCH_REL`，改参数等于给导出签名加默认值（本席禁形），改全族调用方则把本批的面撑开。
- 新建两档按「本次落盘长度」判 500（`CODE-TIER.md` §2.1），已写进分层结论：落盘时各档内容行数须 ≤ 500，否则分拆随本批落地。

上抛（`[上抛·知会]`）：`test/integration/batch-close-gate.test.mjs` 现 633 行，已越过设计时线且存量在盘。本批不碰它，故不触发分拆义务；但它是该故事段的主用例档，谁下次并用例进去就同时背上分拆方案。是否另开一条技术待办，请主 agent 定。

## 修轮 3（§1「认领按分源裁定 + 落地核对处置」→ 设计档与 §2 就地改 · 2026-11-15 20:04）

修面 = 设计档 `docs/core/design/BATCH-RECORD.md` §4.18.1（含 §4.7 不变量与 §7 D-BR44 各一条）＋ 本段两处机制句与一条受影响文件措辞。判据按 §1 的口径：四条全是「实现是对的、设计档的话过宽或不精确」。验收对照五条、「甲 + 丙」方向、需求档均未动。

| # | 原句 | 处置 | 落点与改后原文 |
|---|---|---|---|
| 1 | 「`agent._batchDoc` 在写时已绑定。」 | 已改：收窄成「绑定时已知」，另立一条写明 depth-0 为空这一事实与该情形下的走向 | 判据一改为「在**绑定了批档的 agent 上**是已知的」；新增条「**绑定只在子代理上有**」：唯一赋值点 = `subagent-spawn.mjs`「if (batchBound) child._batchDoc = batchDocAbs」，depth-0 = `null`（`batch.mjs`「depth-0 主 agent 挂载时 = null——目标走 D-BR21 可选 path / 在飞扫描」），未绑定的记路径不入表（`recordAttribution` 对空绑定返回 `false`）；边界条补走向「按本批判：它们不入归属表，故邻批收口之后仍会被本批要行」 |
| 2 | 概括句「减去**别的在途批已认领**的档」（与具体句相抵：不按源分，则后收口那批的邻居已关 ⇒ 不算认领 ⇒ 照判，本批等于白做） | 已改：按源分开 | 判据二改「别的批已认领」，并点明两源对状态要求不同；「认领要有观测支撑」写明观测源**不看批档状态**、计划源三条（可读地未收口 ∥ 在那份批档自己的批起 sha..HEAD 内 ∥ 同项目根）；「diff 只报不判」去掉「在途」限定；§4.7 不变量与 D-BR44 同笔跟上（D-BR44 括注「观测源不看批档状态，计划源要求未收口」）。§2 机制句「判据二」同笔改净 |
| 3 | 「抽取面复用现成的 `thincoder-core/doc-check/existence.mjs`（机读清单读取）」 | 已改：两个面各记各的来源 | 新增条「**认领的抽取面**」：批档目录 = `batchDirs`（`existence.mjs`）；机读清单行 = `machineListRowsOf`（`thincoder-core/agent-tools/batch-segment-vocab.mjs`，与档位门同一解析面）；并写明 `existence.mjs` 的 `plannedPathsOf` 是跨批并集、给不出「哪一份批档列了哪一档」 |
| 4 | §2「`mergeChildMutations` 的内联循环换成调用新叶档的合入函数」 | 已改（本段「受影响文件与分层结论」） | 「在既有 `_touchedFiles` 内联循环之外另调 `mergeAttribution`（归属表并集）；`_touchedFiles` 的形状与去重语义不动，净行数不增」——实况见 `thincoder-core/agent-tools/subagent-async.mjs` 的 `mergeChildMutations`：内联循环「for (const abs of merged) if (!parent._touchedFiles.includes(abs)) parent._touchedFiles.push(abs)」仍在，其下一行「mergeAttribution(parent, child)」承担归属表并集 |

### 修面内同笔改净的一处（不在四条裁定里，属本席写域）

§4.18.1 原有一行以 `依据` 起头，引 `batch-closeout.mjs`「本批改动面（**取材 = 现成两面**：写工具触达账 ∪ 提交 diff；本档不另造登记）」。该档在本批实施时已把注释改写为「本批改动面（**取材 = 现成两面，按批判**；判据单源 = 设计档 §4.18.1）」，原引文逐字已不存在——一条读起来像证据、实际指向不再存在的原文的句子。

处置 = 整条删除：它要说的「两路都不带批次归属」已由判据一 ∥ 判据二两条各自承担，留下只会让下一个读者照它去核一段不存在的话。

### 上抛（`[上抛·知会]`）

- 设计档 §4.18.1 在本批实施后、评审通过之后又被改了两批字节（修轮 1 之后是本轮）。二轮设计评审 `VERDICT: pass` 判的是改前字节；本轮是否要再走一遍设计评审，请主 agent 定，本席不自扇。
- 代码注释面一例，非本席写域，请主 agent 定是否另立台账：`batch-closeout.mjs` 的 `changedSurface` 文档注释仍写「减去别的在途批已认领的档（认领两源：本会话归属表里的别的批档 ∥ 盘上在途批档的 §2 清单）」——与设计档按源分开的现口径有出入（观测源不看批档状态）。同档 `sessionClaimsOf` 的函数注释已写对了原因，两处同一档内不一致。

## 修轮 4（评审 `#50` 裁定四条 ＋ 档位门拦截裁定 → 设计档与本段就地改 · 2026-11-15）

修面 = `docs/core/design/BATCH-RECORD.md` §4.18.1 四处，加本段机读清单 `thincoder-core/agent-tools/batch-closeout.mjs` 的第二列。验收对照五条、「甲 + 丙」方向、判据本体、需求档均未动。

| # | 评审 `#50` 处置 | 落点与改后原文 |
|---|---|---|
| 1 | 已补 | 边界新增「归属表不出会话：它挂在 `agent` 上，随会话结束消失……（计划源只给未收口的批）⇒ 跨会话并行时那一档仍会被要一行镜像行。与上一条是两个缺口：上一条是写入侧没有绑定，这一条是观测面只覆盖本会话」 |
| 2 | 已改 | 小标题「**diff 只报不判**」→「**被别的批认领的档只报不判**」，同条余文未动 |
| 3 | 已改 | 边界「`baseShaOf` 返回 `null` 时 diff 腿不启动，判据只有归属面」→「……时 diff 腿不启动：判据 = 归属 + 认领，diff 腿不贡献条目」 |
| 4 | 已补 | 新增一段「三个面——归属表、认领表、改动面条目——共用一把比较键：`surfaceKey`（`resolve` 后统一 `/` 分隔符，win32 折小写）。归一不做在记账面……」 |
| 5 | 不修 | 裁定原文 = 场景在档里被点名，不是无语义的想象防御；未改 |

第 4 条那条比较键只按符号名写、不带档路径：`surfaceKey` 落在哪个档是实施面的事，下一个动它的人不该因为一句档名被钉住布局。

### 越线方案（`batch-closeout.mjs` 那一格）

读数（本轮实测，量法 = `countContentLines`）= 现盘 510 · 批起快照 359 · 收口时点线 800。510 > 500，触发越线方案支。

方案 = 本批实施轮真拆（主 agent 2026-11-15 裁甲）。提取四段到新叶档 `thincoder-core/agent/batch-changed-surface.mjs`：`selfAttributedOf` ∥ `sessionClaimsOf` ∥ `neighborListClaims` ∥ `displayRelOf`。

留下两段在 `batch-closeout.mjs`：`changedSurface`（入口）∥ `changedSurfaceReceiptLine`；比较键 `surfaceKey` 随判据一族进新叶档（决策 5：三处判据都用它，留下就要反向 import、两档成环）。设计档 §4.18.1 写「串由 `batch-closeout.mjs` 出」——`changedSurfaceReceiptLine` 不动，那句话就仍成立，故设计档不改、不再走一轮设计评审。

搬走 85 行（四段 80 + `surfaceKey` 5；读数见「修轮 5」节），落盘后本档 < 500；新叶档 = 这五段加头注与 import，远低于 500，故它的第二列写 `—`。

### 连带一例（不在本席写域）

`thincoder-core/agent-tools/batch-closeout.mjs` 的 `changedSurfaceReceiptLine` 文档注释写着「判据单源 = 设计档 §4.18.1「diff 只报不判」」。本修轮第 2 条把那个标签改了名，这句于是指向一个不再存在的名字。要改的是代码注释（判据单源句应改指节名或新标签），本席不动代码，请实施席同笔改净。同档 `changedSurface` 的判据二注释口径已由 §5 修轮改对，与设计档一致。

### 裁定记录（甲）

主 agent 2026-11-15 裁甲：本批真拆，落步由实施席执行；不接受「靠落步词过门」的记法。硬边界 = 上节那两行——四段出去、`changedSurfaceReceiptLine` 留在本档（把它搬出去即断设计档那句话）；`surfaceKey` 的落位按决策 5。

依据：`docs/core/standards/CODE-TIER.md` §2.1「`> 500`：必须在当前工作中给出并实施拆分方案」；门的正向形判据见 `thincoder-core/agent-tools/batch-tier-gate.mjs` 的 `planGapOf`（带目录段的目标档 token ＋ 落步词 `实施轮` ∥ `§5`）。

## §3 设计评审（评审子代理）
**状态行**：评审通过



### 轮次 1（评审子代理）

**结算**：未签发（no-valid-echo）· 2026-11-15

    | # | Severity | Status | Evidence |
    |---|----------|--------|----------|
    | 1 | 🔴 | New | §4.18.1「两批同工作树并行时，任一方收口都会要求另一方补镜像行」（无观测、无复现命令）；「盘上另一份未收口批档的 §2 机读清单列了这一档（后者跨会话也成立）」 |
    | 2 | 🟡 | New | §4.18.1「两层，主判据在前」 |
    | 3 | 🟡 | New | §4.18.1「盘上另一份未收口批档的 §2 机读清单列了这一档」+「收口回执里留一行 `[changed surface]` 点名它们」 |
    | 4 | 🟡 | New | §4.18.1「只能从记账面取（子代理的写也走同一条记账面）」 |
    | 5 | 🟡 | New | §4.18.1「只是此前记账只存路径、把归属丢掉了」；对比 ENGINEERING-MODE-V2.md §6「状态文档只写当前状态，历史由 git 保存」 |
    | 6 | 🟡 | New | §4.18.1「收口回执里留一行 `[changed surface]` 点名它们」 |
    | 7 | 🟡 | New | BATCH-RECORD.md 头注「需求 = `docs/core/requirements/ENGINEERING-MODE-V2-SPEC-BATCH-SEGMENT.md`」；本轮范围为两份文档 |
    本轮未回显有效 token（评审回执不完整）
    计数：🔴 1 · 🟡 6 · 🔵 0 · 未标 0


### 轮次 2（评审子代理）

**结算**：已签发（pass）· 2026-11-15

    | # | Severity | Status | Evidence |
    |---|----------|--------|----------|
    | 1 | 🟡 | New | SPEC-BATCH-SEGMENT ④ AC-M3-10「close、status、supersede、补关和 check 的台账结果可验证」 |
    | 2 | 🟡 | New | §4.18.1「`committedDocs` 给档清单」 |
    | 3 | 🟡 | New | §4.18.1「两处都按 `agent` 记、不看深度」 |
    | 4 | 🟡 | New | §4.18.1「别的在途批已认领」 |
    | 5 | 🟡 | New | §4.18.1 边界「`baseShaOf` 返回 `null` 时 diff 腿不启动，判据只有归属面」 |
    | 6 | 🟡 | New | §4.18.1「写工具触达账 ∪ 提交 diff；本档不另造登记」 |
    | 7 | 🟡 | New | §4.18.1「跨项目同名的相对路径不认领」 |
    | 8 | 🔵 | New | §4.18.1「归属表里没有它、认领成立 ⇒ 不判，只报。」 |
    | 9 | 🔵 | New | SPEC-BATCH-SEGMENT ②功能点 9「其后落评审报告原文」 |
    | 10 | 🔵 | New | §4.18.1「不改档位门第三列与批起基线的比对规则（那是读数基准，另一件事）」 |
    VERDICT: pass
    计数：🔴 0 · 🟡 7 · 🔵 3 · 未标 0

### 轮次 3（评审子代理）

代码评审（交付前 · 台账 #2439 收口门改动面取材按批判）· 全量首轮

| # | Severity | Status | Evidence |
|---|----------|--------|----------|
| 1 | 🟡 | New | `batch-closeout.mjs` 的 `changedSurface`：`const mine = new Set(attributedTo(agent, abs).map(surfaceKey))` ∥ `sessionClaimsOf` 的 `if (surfaceKey(batch) === self) continue`（两把键，`attributedTo` 走精确 `table.get(batch)`） |
| 2 | 🟡 | New | `batch.mjs`「depth-0 主 agent 挂载时 = null」+ `subagent-spawn.mjs`「if (batchBound) child._batchDoc = batchDocAbs」+ `record-results.mjs`「recordAttribution(agent, touched, agent._batchDoc)」⇒ 判据一对主 agent 自己的写不可达 |
| 3 | 🟡 | New | `batch-closeout.mjs`「档被别的在途批认领，本批没判它们的读数」∥ `sessionClaimsOf`「不按批档状态筛」 |
| 4 | 🟡 | New | `batch-closeout.mjs` `neighborListClaims` ①「if (changed.has(key)) claims.set(key, abs)」——`committedDocs` 的区间含他人提交，在途邻批的「观测」几乎恒真 |
| 5 | 🟡 | New | `BATCH-RECORD.md` §4.18.1「抽取面复用现成的 `thincoder-core/doc-check/existence.mjs`（机读清单读取）」∥ 实现取 `batchDirs` + `machineListRowsOf`，existence 的读面是跨批并集 `plannedPathsOf` |
| 6 | 🟡 | New | `test/integration/changed-surface-per-batch.test.mjs`「recordAttribution(agent, [join(root, "src/alpha.mjs")], join(root, REL_A))」——写时归属由用例注入，未经记账面 |
| 7 | 🔵 | New | `batch-closeout.mjs`「if (surfaceKey(owningProject(abs, base) ?? "") !== surfaceKey(base)) continue // ②（取不到根 ⇒ 不认领）」——`resolve("")` = cwd |
| 8 | 🔵 | New | `batch-closeout.mjs` `changedSurfaceReceiptLine` 用 `relKeyOf(surface.root, p)` 显示路径，该键在 win32 折小写 |
| 9 | 🔵 | New | `batch-closeout.mjs`「认领键与改动面条目同一坐坐系」错字 |
| 10 | 🔵 | New | `batch-closeout.mjs` `surfaceKey` 与 `batch-tier-gate.mjs` `const normPath = (p) => {` 同义重复（第 4 把归一尺，METHODOLOGY N-4） |

VERDICT: pass
计数：🔴 0 · 🟡 6 · 🔵 4


### 轮次 4（评审子代理）

**结算**：已签发（pass）· 2026-11-15

    | # | Severity | Status | Evidence |
    |---|----------|--------|----------|
    | 1 | 🟡 | New | §4.18.1「同会话并行的两批，后收口的一方正是靠它减掉先收口那一方的档」 vs 边界「代价是主 agent 独占写并提交的档会被邻批要一次镜像行」 |
    | 2 | 🔵 | New | §4.18.1 小标题「diff 只报不判」 |
    | 3 | 🔵 | New | §4.18.1 边界「判据只有归属面」 |
    | 4 | 🔵 | New | §4.18.1「路径按仓根相对归一后再比，win32 再折大小写」 |
    | 5 | 🔵 | New | §4.18.1「两批同工作树并行时，任一方收口都会要求另一方补镜像行」 |
    VERDICT: pass
    计数：🔴 0 · 🟡 1 · 🔵 4 · 未标 0


### 轮次 5（评审子代理）

**结算**：已签发（pass）· 2026-11-15

    | # | Severity | Status | Evidence |
    |---|----------|--------|----------|
    | 1 | 🟡 | Unfixed | Requirement doc ②功能点 11「收口：正常批检查链完整性，使用 completed 与 closeEvidence 结算」 and `AC-M3-10`「close、status、supersede、补关和 check 的台账结果可验证」 — neither covers 本批改动面取材 |
    | 2 | 🟡 | New | §4.7「收口只判本批的档（§4.18.1）」 vs §4.18.1 边界「故邻批收口之后仍会被本批要行」∥「跨会话并行时那一档仍会被要一行镜像行」 |
    | 3 | 🟡 | New | §4.18.1「`batch-lifecycle.mjs` 的 `close` 与 `status → 已收口` 两条回执串各内联一行」 vs `batch-closeout.mjs`「if (mode === "normal") {」 |
    | 4 | 🟡 | New | §4.18.1「那份批档**可读地未收口**（状态词 = 进行中；状态不可读的按冻结处置，不给认领权）」 — reason lives only in `neighborListClaims` ③ |
    | 5 | 🟡 | New | §4.18.1「收口按本批判（见本文末段边界）」 |
    | 6 | 🔵 | Accepted | Requirement ②功能点 9「其后落评审报告原文」 vs §4.4「评审的推理正文不进块——它留在评审报告里。」 — prior round's §3 轮次 2 item 9 |
    | 7 | 🔵 | New | `batch-closeout.mjs` `changedSurfaceReceiptLine`「判据单源 = 设计档 §4.18.1「diff 只报不判」」 vs §4.18.1「**被别的批认领的档只报不判**」 |
    | 8 | 🔵 | New | §4.18.1「两批同工作树并行时，任一方收口都会要求另一方补镜像行。」 — reproducer `CLI 7-32` unnamed |
    | 9 | 🟡 | New | No batch record bound to this review ⇒ §2 tier conclusion ∥ closest-precedent ∥ survey evidence ∥ acceptance ∥ RTM delta unverifiable in scope |
    VERDICT: pass
    计数：🔴 0 · 🟡 6 · 🔵 3 · 未标 0

### 轮次 6（评审子代理）

代码评审（交付验收 · 越线拆档 + 回执标签改净）· 全量首轮

| # | Severity | Status | Evidence |
|---|----------|--------|----------|
| 1 | 🔵 | New | `batch-changed-surface.mjs` 头注「依赖单向：`agent-tools/batch-closeout.mjs` → 本档」——只写了两档之间的方向，未写本档自己的五个 import（同族叶档 `batch-attribution.mjs` 是「本档零 fs、零 import」） |
| 2 | 🔵 | New | `batch-changed-surface.mjs`「比较键（绝对路径归一：`/` 分隔符 + win32 折小写）」——`surfaceKey` 是仓内第四份路径归一本体，拆档后随族搬进新档而未归并 |
| 3 | 🔵 | New | `batch-changed-surface.mjs`「const s = resolve(String(p ?? \"\"))」——空 ∥ `undefined` 入参经 `resolve(\"\")` 取到 cwd，产出一个看似合法的键 |
| 4 | 🔵 | New | `batch-changed-surface.mjs`「if (!owned || surfaceKey(owned) !== surfaceKey(base)) continue」——只依赖路径的 ② 判据排在 `readFileSync` ∥ `machineListRowsOf` 之后 |
| 5 | 🔵 | New | 同一失败两处口径：`batch-closeout.mjs`「for (const f of committed.files ?? []) diff.push(resolve(committed.base, f))」（不看 `ok`）∥ `batch-changed-surface.mjs`「if (!committed.ok) continue」 |

§2 验收 6 核（读面）：判据一族五个符号只在 `agent/batch-changed-surface.mjs` 出现一次；`batch-closeout.mjs` 单向 import 它们，`changedSurface` ∥ `changedSurfaceReceiptLine` 留在原档。

同一核：`changedSurfaceReceiptLine` 仍由 `batch-closeout.mjs` 导出，`batch-lifecycle.mjs` 仍从该档 import 它；两档落盘行数远低于 500。

§2 验收 7 核（读面）：该回执行的文档注释已引「被别的批认领的档只报不判」，全仓 `.mjs` 无「diff 只报不判」。

设计档 §4.18.1「串由 `batch-closeout.mjs` 出」在拆档后仍成立。

**未核**（只读评审，未跑）：收口那一笔门结果与两档 `countContentLines` 的实测读数。

VERDICT: pass
计数：🔴 0 · 🟡 0 · 🔵 5 · 未标 0

## §4 用户批准（主 agent）

**用户批准（主 agent 记录，2026-11-15）**

- 用户原话「点」：点火本批设计评审（评审 `#34` ∥ `#40` ∥ `#50` ∥ `#56` 四轮，末轮 `VERDICT: pass`）。
- 用户原话「自动跑完」：批准本批整条链（设计 → 评审 → 实施 → 收口）连跑，不再逐步等第二个词。
- 授权范围：判据按批判取材（写时归属作判据一、diff 兜底按认领收窄、被认领档只报不判），以及由此需要的判据一族拆分。
- 未包含的：需求档与 `TOOLS.md` 的语义变更、`batch-tier-gate.mjs` 的收口线改动（后者归 `#2461`，另一批）。

## §5 实施记录（eng-coder）
**状态行**：实施完成



### 实施轮（eng-coder · 2026-11-15）

**交付摘要**（判据单源 = `docs/core/design/BATCH-RECORD.md` §4.18.1；本段按批档落地形态写，不重述口径）

| 落点 | 落地形态 |
|---|---|
| `thincoder-core/agent/batch-attribution.mjs`（新叶档，零 fs、零 import） | 归属表本体：`recordAttribution`（逐档一批一条、幂等）· `attributedTo`（取某批路径集，返回副本）· `mergeAttribution`（并集合入）；挂点 `agent._batchAttribution`，键 = 批档串、值 = 路径集 |
| `thincoder-core/agent/record-results.mjs` | 记账点一：`agent._touchedFiles.push(abs)` 那一笔里同时收 `touched`，出循环后 `recordAttribution(agent, touched, agent._batchDoc)`；`_touchedFiles` 形状与去重语义一字未动 |
| `thincoder-core/agent/turn-loop.mjs` | 记账点二（Ctrl+I 中断分支的同形记账块）：同上，一档一笔 |
| `thincoder-core/agent-tools/subagent-async.mjs` | `mergeChildMutations` 调 `mergeAttribution(parent, child)`（归属表并集）；`_touchedFiles` 并集仍是原内联循环，`merged` 改为副本喂 `noteMutations`；本档净行数 486 → 485 |
| `thincoder-core/agent-tools/batch-closeout.mjs` | `changedSurface` 改判据化取材，返回 `{root, judged, reported}`；新增 `selfAttributedOf`（判据一，含归一键补取）· `sessionClaimsOf`（认领的观测源，不按状态筛）· `neighborListClaims`（认领的计划源，三条件：在该批自己的批起 sha..HEAD 之内 ∧ 同项目根 ∧ 可读地未收口）· `displayRelOf`（回执显示面不折大小写）；导出 `changedSurfaceReceiptLine`；`assertCloseoutGates` 在 `mode === "normal"` 时把 `surface` 挂上 `gate.changedSurface` |
| `thincoder-core/agent-tools/batch-lifecycle.mjs` | `close` 与 `status → 已收口` 两条回执串各内联 `${changedSurfaceReceiptLine(gate?.changedSurface)}`（原地改，净行数 494 → 494） |
| `docs/batches/2026-11-15-closeout-surface-per-batch.test.mjs`（新，收口时删） | 四条单测：判据一与只报不判 + 红侧 / 真漏登记仍拒 / 子代理合入两半 / 无批起 sha 行为不变（含归属面取材） |
| `test/integration/changed-surface-per-batch.test.mjs`（新） | 集成用例 `CLI 7-32`（一个 `test()`、四段：先收 A 放行 → 再收 B（A 已收口）放行 → 两档 §1 落盘 → 红侧两源皆不成立时拒） |
| `test/rtm/guard.md` | CLI 7 节：目的段补「改动面本身也按批判」一句；节注「二十七态」→「二十八态」并补 7-32；用例表加 7-32 行 |

**交付表**（对 §2 验收对照五行）

| # | 状态 | 要求 | 落点 |
|---|---|---|---|
| 1 | ✅ | 两批并行各判各的（两次收口均放行，邻批档只进 `[changed surface]`） | `changedSurface` + `sessionClaimsOf` + `neighborListClaims`；集成 `CLI 7-32` 前两段 |
| 2 | ✅ | 真的漏登记仍拒、拒文点名该档 | 单测「改动面取材 2」＋集成 7-32 红侧（`src/beta.mjs` 仓根相对点名） |
| 3 | ✅ | 子代理改的档仍进判据 | 单测「改动面取材 3」两半（本批子代理照判 ∥ 邻批子代理只报），走 `mergeChildMutations` 真路径 |
| 4 | ✅ | 无批起 sha 时行为不变 | 单测「改动面取材 4」两半：基线不可判照旧整批一拒 ∥ 判域只由归属面决定 |
| 5 | ✅ | 红侧：改前必拒、改后放行 | 单测「改动面取材 1」后半（去掉归属表 = 改前那一形 ⇒ 拒）＋集成 7-32 红侧 |

**读数**（量法 = `countContentLines`；基准 = §2 机读清单第三列，批起快照 `c8dcc16`）

- 新叶档 `batch-attribution.mjs` = 87；单测档 = 170；集成档 = 167。
- `record-results.mjs` = 211（205）；`turn-loop.mjs` = 342（337）。
- `subagent-async.mjs` = 485（486，零净增达成）；`batch-lifecycle.mjs` = 494（494，零净增达成）。
- `batch-closeout.mjs` = 491（359）——新增判据与回执行都在这一档，仍 ≤ 500，未触发分拆义务。

**验证**（本轮实跑，cwd = 仓根）

- `node --test docs/batches/2026-11-15-closeout-surface-per-batch.test.mjs` → 4/4 pass。
- `node --test test/integration/changed-surface-per-batch.test.mjs` → 1/1 pass。
- 回归面：`batch-close-gate` ∥ `batch-gates-reanchor` → 26/26 pass；`batch-status-auto-set` ∥ `batch-close-token-consume` ∥ `batch-gates-ledger` → 20/20。
- 回归面续：`batch-anchor-create` ∥ `batch-edit-spec-section` ∥ `batch-ledger-bind` ∥ `batch-live-batch-lock` ∥ `batchdoc-reuse-guard` ∥ `edit-batch-entry-outcome` ∥ `ledger-close-proof` → 33/33；`machine-list-head-form` → 1/1。
- `node --check` 对八个改动档全绿。集成全套未在本席跑（发布门 = 父侧收口那一次）。

**评审与自查轮次**（终态 = clean）

- 内部发散审计（explore，只读）一轮 → `diverge`：5 条（1 major · 4 minor）。
- 自查修正轮 1（本席自改）：⑤ 无批起 sha 的单测只钉了改前那半 ⇒ 补「判据一两半」；④ 认领面把状态不可读的批档也当在途 ⇒ 收紧为「可读地未收口（`readBatchStatusLine === "open"`）」；③ 集成档把同编号拆成两个 `test()` ⇒ 合回一个块（一个号 = 一例，标题逐字取 §2 给的形）；② §2 与本文对 `subagent-async.mjs` 的措辞差异记进下节「落地核对」；① major 按父侧裁定不改（见「未覆盖面」）。
- 独立代码评审（`advisor type=code`，轮次记于 §3 轮次 3）→ `VERDICT: pass`，0 🔴 · 6 🟡 · 4 🔵；终态 clean。
- 评审后自查修正轮 2（本席自改，逐条对齐评审 🟡/🔵 中落在本席写域的那些）：判据一的取件补归一键（🟡1）· 回执串改写成事实口径（🟡3）· 空值分支显式判空（🔵7）· 回执显示不再用折小写的比较键（🔵8）· 错字（🔵9）；🟡4/🟡5 属设计档措辞（不收本席的笔）· 🟡6 属证据面，已在集成档的场景注释里写明「归属由用例注入」。
- 修正后复跑：单测 4/4 · 集成 `CLI 7-32` 1/1 · `batch-close-gate` ∥ `batch-gates-reanchor` 26/26 · `machine-list-head-form` 1/1。

**关键取舍**（本轮实做时定的，口径仍归设计档 §4.18.1）

| # | 取舍 | 理由 |
|---|---|---|
| 1 | 认领面按源分开：观测源（本会话归属表）不按批档状态筛，计划源（盘上批档 §2 清单）要求「可读地未收口」 | 父侧 2026-11-15 裁定：归属是已发生的事实，与那批收没收到无关；计划面对收口批几乎恒真（`committedDocs` 上界是 HEAD），故只能给未收口批 |
| 2 | 判据一的取件在取材面按归一键补取，不把路径归一塞进叶档 | 叶档契约是「零 fs、零 import」；表键与批档串在分隔符 ∥ 大小写上的差只允许落在「少判」的反方向（判据一必须比认领硬） |
| 3 | `[changed surface]` 的承载面 = 收口那一笔的回执文本，不写批档、不进台账 | 设计档 §4.18.1 的承载面段：它不是规范，是一次收口的读数 |
| 4 | 归属表与 `_touchedFiles` 并行，不改后者形状 | 后者有 `recent_changes` ∥ `verify` ∥ 子代理调度 ∥ 审计块四处读者 |

**落地核对**（本次落地使哪些状态档的句子不成立——逐条原文；按设计档纪律，改文档不由本席动笔）

| 档 | 节 | 原文 | 落地实况 |
|---|---|---|---|
| `docs/core/design/BATCH-RECORD.md` | §4.18.1 判据一 | 「写的那一刻「这笔写服务哪一批」是已知的：`agent._batchDoc` 在写时已绑定。」 | 只在**子代理**上成立：core 侧唯一赋值点是 `thincoder-core/agent-tools/subagent-spawn.mjs`「if (batchBound) child._batchDoc = batchDocAbs」；depth-0 主 agent 在 CLI 会话为空（`batch.mjs`「depth-0 主 agent 挂载时 = null」） |
| `docs/core/design/BATCH-RECORD.md` | §4.18.1「diff 只报不判」 | 「被别的在途批认领的档不判读数，但回执里留一行 `[changed surface]` 点名它们，请人确认「是否本批」。」 | 按父侧裁定分源后，观测源不筛状态 ⇒ 已收口的邻批也能认领；回执串已改成「被别的批认领（本会话归属表 ∥ 盘上在途批的 §2 清单）」 |
| `docs/core/design/BATCH-RECORD.md` | §4.18.1「认领要有观测支撑」 | 「抽取面复用现成的 `thincoder-core/doc-check/existence.mjs`（机读清单读取），按「哪一份批档列了哪一档」取。」 | 从 `existence.mjs` 只取 `batchDirs`；清单行取 `batch-segment-vocab.mjs` 的 `machineListRowsOf`（与档位门同一解析面）。`existence.mjs` 的清单读面是跨批并集 `plannedPathsOf`，正是本句说「给不出」的那一形 |
| `docs/core/design/BATCH-RECORD.md` | §4.18.1「认领要有观测支撑」① | 「该档确在**那份批档自己的**批起 sha..HEAD 之内（`baseShaOf` 取那份批档的批起 sha，`committedDocs` 给档清单）」 | 照此落地；但该区间上界是 HEAD、含他人提交 ⇒ 这条「观测」实际只证明「窗口内提交过」，不证明「那批写的」。属该句的强度，不是代码偏差 |
| `docs/batches/2026-11-15-closeout-surface-per-batch.md` | §2「受影响文件与分层结论」 | 「`mergeChildMutations` 的内联循环换成调用新叶档的合入函数，净行数不增。」 | 内联循环仍在（`_touchedFiles` 的并集），新叶档函数承担的是**归属表**的并集；净行数 486 → 485（-1） |

**未覆盖面**（已知缺口，父侧 2026-11-15 裁定另立台账，本批不修、不扩围）

- 归属表的写时归属在 depth-0 不可达：core 侧唯一赋值点是 `subagent-spawn.mjs` 的 `if (batchBound) child._batchDoc = batchDocAbs`，只有子代理有绑定；depth-0 主 agent 在 CLI 会话 `_batchDoc` 为空，因此主 agent 直接写的档不入归属表。
- 后果：「邻批已收口仍靠归属表认领」只在**子代理写过的档**上成立；主 agent 独占写并提交的档，在邻批收口后仍会被要行（设计档边界句「记账时没有绑定批档的路径（`agent._batchDoc` 为空）按本批判」兜住了 fail-closed，但没有兜住「不再要镜像行」）。
- 证据面：集成用例里的归属是**显式注入**的（模拟写时记账，同一导出面 `recordAttribution`），真实 depth-0 路径产不出它；用例场景注释已写明这一点。
- 另一条本批边界内的已知面：文档机检门（④ 臂）的取材仍是「触达账 ∪ 提交 diff」，未按批判收窄（§2 边界明写不改其余四臂）——邻批的脏 `.md` 仍可能拦本批收口。

**文件面**：本席改动 9 档（上表 8 行 + `test/rtm/guard.md`），全部在 spawn 声明面内，无面外代码档。`test/RTM.md` 声明了但**未改**：其故事索引表的 CLI 7 行已存在（`| CLI 7 | 收口只判本批改过的档 | guard | 有 | 缺 | 缺 |`），该表一行一故事、无用例计数可动；用例行住 `test/rtm/guard.md`。

### 修轮 · 注释口径对齐（eng-coder · 2026-11-15 20:1x）

派发面 = §1「`#49` 上抛的两条裁定」第二条：`batch-closeout.mjs` 的 `changedSurface` 文档注释把「在途」同时挂到认领的观测源上，与同档 `sessionClaimsOf` 的注释、与设计档 §4.18.1 的按源口径相抵。**不立台账**，本轮改净。

**改了什么**（一档、一处、两行注释；零代码语义变动）

| 档 | 位置 | 改前 | 改后 |
|---|---|---|---|
| `thincoder-core/agent-tools/batch-closeout.mjs` | `changedSurface` 文档注释「判据二」条 | 「判据二 = 提交 diff，减去别的**在途**批已认领的档（认领两源：本会话归属表里的别的批档 ∥ 盘上**在途**批档的 §2 清单）」 | 「判据二 = 提交 diff，按认领收窄：减去**别的批已认领**的档。认领两源对批档状态的要求不同——观测源（本会话归属表里别的批档）不看那一批收没收口；计划源（盘上批档的 §2 机读清单）只给可读地未收口的批。」 |

同档其余两处已自查过、口径本来是对的，未动：`sessionClaimsOf`「不按批档状态筛」· `changedSurfaceReceiptLine`「本会话归属表 ∥ 盘上**在途批**的 §2 清单」（那里的「在途」只限定计划源，与代码一致）。

**代码复核**（对照设计档 §4.18.1 逐条看实现，均相符）：`sessionClaimsOf` 无状态筛 · `neighborListClaims` 的 `readBatchStatusLine(src) !== "open"` 一条即计划源未收口 · `changedSurface` 的 `mine.has(key) || !claimed.has(key)` 即判据一优先。

**验证**（本轮实跑，cwd = 仓根）

- `node --check thincoder-core/agent-tools/batch-closeout.mjs` → OK。
- `node --test docs/batches/2026-11-15-closeout-surface-per-batch.test.mjs` → `pass 4 · fail 0`。
- `node --test test/integration/changed-surface-per-batch.test.mjs` → `pass 1 · fail 0`（`CLI 7-32`）。
- `node --test test/integration/batch-close-gate.test.mjs test/integration/batch-gates-reanchor.test.mjs` → `pass 26 · fail 0`。

**本档现长度**：`countContentLines` = 510（本轮实测）。与上节「读数」记的 491 差 19 行；中间本档经过评审后修正轮 2 的五笔改动，增量未逐笔核——这里只报两个读数，不归因。510 > 500，且 §2 机读清单该档第二列是 `—`。

**收口阻塞（`[上抛·待裁]`，已上抛父侧，本席不自行处置）**

- 实测：按盘上 §2 与本批批起 sha `c8dcc16e` 调 `assertTierPlan`，返回 REFUSED——「`thincoder-core/agent-tools/batch-closeout.mjs` — 510 > 500；方案为空 ∥ 只有 `—`」。
- 成因：档位门越线方案支拿**当前盘上长度**比 500（`codeFilesOf` → `contentLinesOf`），而本档批起快照 = 359——本批把它从 359 涨到 510，方案列没东西可判的。
- 三条处置（收窄注释落 ≤500 ∥ 按先例真拆并补方案 ∥ 按门判法另立台账）已连同证据上抛，等父侧裁定；未定之前本席不动这一档的注释量。

**落地核对：无**（本轮的改动是把注释改成与设计档 §4.18.1 一致，没有使任何状态档的句子不成立）。

**跨会话残留（§1 2026-11-15 20:15 裁定要求如实写，不粉饰成已解决）**

- 本批解决的是**同一会话内**两批并行：观测源（`agent._batchAttribution`）住在会话内存里，后收口的一方靠它减掉先收口那一方的档。
- 跨会话不成立：别的会话开的批所写的档不进本会话归属表；那一批若已收口，计划源（`neighborListClaims` 要求 `readBatchStatusLine === "open"`）也不再认领它 ⇒ **那一档仍会被本批要一行镜像行**。这不是回归，是判据的边界——观测面只覆盖本会话。
- 与「depth-0 主 agent 的写不入归属表」（上节未覆盖面第 1 条）是两个不同的缺口：那条是**写入侧没有绑定**，这条是**归属表不出会话**。两者后果同形（都会要镜像行），成因不同，修法也不同（前者要绑定点，后者要跨会话的持久归属面——新状态，越出本批）。

### 修轮 · 越线判据档真拆 + 回执标签改净（eng-coder · 2026-11-15 20:30）

派发面 = §2 验收对照第 6、7 行（§1 2026-11-15 20:20「改判：取甲（本批真拆）」＋评审 `#56` 第 7 条）。

**改了什么**（两档，都在 spawn 声明面内）

| 档 | 改动 |
|---|---|
| `thincoder-core/agent/batch-changed-surface.mjs`（新建） | 判据一族搬入并导出：`surfaceKey` ∥ `displayRelOf` ∥ `selfAttributedOf` ∥ `sessionClaimsOf` ∥ `neighborListClaims`。函数体与注释逐字取自原档；另加头注（语义单源 = 设计档 §4.18.1 ∥ 依赖单向 ∥ 本档自己的依赖集） |
| `thincoder-core/agent-tools/batch-closeout.mjs` | 五段删除、改单手 import 新叶档；留 `changedSurface`（入口）∥ `changedSurfaceReceiptLine`（仍由本档导出）；回执行的判据单源句改指 §4.18.1 现标签「被别的批认领的档只报不判」 |

顺带改净一处：新叶档 `displayRelOf` 的注释原有一个多余右括号，一并改正（不涉语义）。

**读数**（量法 = `countContentLines`，本轮实跑）

- `thincoder-core/agent-tools/batch-closeout.mjs` = 510 → **419**（≤ 500，越线方案支不再触发）
- `thincoder-core/agent/batch-changed-surface.mjs` = **112**（新档，按落盘长度判，远低于 500）

**验证**（本轮实跑，cwd = 仓根）

- `node --check` 两档 → 均 OK。
- `node --test` 四档一组（批单测 ∥ `changed-surface-per-batch` ∥ `batch-close-gate` ∥ `batch-gates-reanchor`）→ `pass 31 · fail 0`。
- 另跑十档批次族集成（`batch-status-auto-set` ∥ `batch-close-token-consume` ∥ `batch-gates-ledger` ∥ `batch-anchor-create` ∥ `batch-edit-spec-section` ∥ `batch-ledger-bind` ∥ `batch-live-batch-lock` ∥ `batchdoc-reuse-guard` ∥ `edit-batch-entry-outcome` ∥ `ledger-close-proof`）→ `pass 45 · fail 0`；`machine-list-head-form` 单独一轮 → `pass 1 · fail 0`。
- 档位臂实跑（`assertTierPlan`，入参 = 盘上 §2 全文 ∥ 仓根 ∥ 本批九档改动面 ∥ 批起快照 `c8dcc16e` 取文函数）→ **无发现（放行）**。这是验收第 6 行「收口那一笔放行」的直接读数。

**审计与评审轮次**（终态 = clean）

- 内部发散审计（explore，只读）一轮 → `clean`。逐条核过：五个函数已从原档去净且在叶档导出 ∥ 函数体与注释逐段行数与 §2 记的搬走量相符 ∥ 原档仍导出回执行、仍定义入口 ∥ 叶档不 import 原档 ∥ 原档「diff 只报不判」零命中 ∥ 无别的调用方 import 搬走的符号 ∥ 设计档句子未失真 ∥ 新档 ≤ 500。
- 独立代码评审（`advisor type=code`，轮次记于 §3 轮次 6）→ `VERDICT: pass`，0 🔴 · 0 🟡 · 5 🔵。
- 评审后自查修正轮 1（本席自改）：只改 🔵1——新叶档头注补「本档不是无依赖那一形」与本档依赖集，免得下一个人把它当 `batch-attribution.mjs` 那种零依赖叶档而加反向 import。
- 修后复跑：两档 `node --check` OK；四档一组 `pass 31 · fail 0`。

**未采纳的评审 🔵 与理由**（逐条处置，不静默）

| # | 条目 | 处置与理由 |
|---|---|---|
| 2 | `surfaceKey` 是仓内第四份同义路径归一 | 不采纳：归并会改设计档按符号名点名的落点，越出本批；记在报告里，建议下一批收成一处 |
| 3 | `surfaceKey` 对空 ∥ 非串入参落到 `resolve("")` = cwd | 不采纳：四个调用点都已滤掉空路径（入口显式滤、归属表不存空串），为一个不出现的输入加分支是没人走的那条路 |
| 4 | `neighborListClaims` 的同项目根判排在读完并解析档之后 | 不采纳：纯顺序问题，收益只是省几次字符串解析；本批字节已过评审，不动更值 |
| 5 | 入口不看 `committedDocs` 的 `ok`、叶档看 | **上抛**（见下节），不在本批改 |

**`[上抛·待裁]` 一条：`committedDocs` 的 `ok: false` 在入口被静默吞掉**

- 事实（本轮实读）：`thincoder-core/agent-tools/batch-regions.mjs` 的 `committedDocs` 注释写「跑不出（非仓 ∥ sha 不可解析）⇒ `ok: false` + 空集（调用面按「基 sha 未定」明示，不静默）」，实现是 `catch { return { ok: false, base: root, files: [] } }`。
- 入口 `changedSurface` 只做 `committed.files ?? []`、不看 `ok` ⇒ 读不出来时 diff 腿静默为空，判域退成只剩触达账——那正是设计档判据二要兜的那一类（`bash` ∥ `execute` 落盘的档）。
- 为什么本席不改：改法只有两种（读不出即拒 ∥ 回执点名），两者都要给设计档 §4.18.1 添一句处置口径，而设计档不在本席笔内。
- 残余面（实读后收窄）：同一情形下读数支多半先撞「批起基线不可判」整批一拒（`baseTextReaderOf` 对读不到的提交对象返回 `undefined`）；只有当本批判域里一档在盘码档都没有时才可能静默。窄，但不是零。
- 建议：下一批按那条「明示」契约补一句设计口径 + 一处显式处置；本批不动这一处。

**落地核对：无**（本轮只搬家与改一处标签。设计档 §4.18.1 的「串由 `batch-closeout.mjs` 出」仍成立——回执行没搬；该节对 `surfaceKey` 只按符号名点名、不钉档位，故搬家不使任何句子失真）。

**文件面**：本轮改 2 档（上表），均在 spawn 声明面内，无面外代码档。声明的两个测试档本轮未改——现有断言已覆盖搬家前后同一业务结果（`changedSurface` 的回执与判域经真收口取），不需要跟随改动。

**跨会话残留**：维持本节上一条如实记录（归属表不出会话、depth-0 无绑定），本轮不动判据、不粉饰。

## §6 验证与收口（父代理）

**收口轮（主 agent · 2026-11-15 20:44）**

- **实施交付**：`#44`（首轮：按批取材 + 归属表）、`#52`（注释按源口径）、`#59`（真拆判据一族 85 行 + 标签改净）。设计面 `#32` / `#36` / `#49` / `#57` / `#60`；评审 `#34` / `#40` / `#50` / `#56`。
- **收口读数（本回合我自己跑的，非转述）**：
  - `node --check` 于两档内存档 ⇒ 均 OK。
  - `countContentLines`：`thincoder-core/agent/batch-changed-surface.mjs` = **112**；`thincoder-core/agent-tools/batch-closeout.mjs` = **419**（批起快照 359）。两档均 ≤ 500。
  - `node --test` 于本批单测档 + `changed-surface-per-batch` + `batch-close-gate` + `batch-gates-reanchor` + `machine-list-head-form` ⇒ **tests 32 · pass 32 · fail 0**。
  - 陈旧标签「diff 只报不判」于 `thincoder-core/**` 的 `.mjs` ⇒ **0 命中**。
- **集成面**：本批新增 `CLI 7-32`（`test/integration/changed-surface-per-batch.test.mjs`），RTM 属册行在 `test/rtm/guard.md` 的 CLI 7 节。上一轮集成全量 tests 222 · pass 219 · fail 3，三红分别是既有 `CLI 43-1` ∥ `CLI 43-2`（台账 `#2449`）与 `CLI 34-1`（浏览器并发争用，台账 `#2438` 记同一现象），均非本批面。
- **单测档**：`docs/batches/2026-11-15-closeout-surface-per-batch.test.mjs` 收口删除（本回合已删，工作树不再有该档）。
- **落地核对**：`#59` 报「无」，我复核一致——设计档 §4.18.1「串由 `batch-closeout.mjs` 出」仍成立（回执行未搬），该节对 `surfaceKey` 只按符号名点名、不钉档位。
- **本批新债**：`#2462`（`changedSurface` 对 `committedDocs` 的 `ok:false` 静默吞掉，`#59` 上抛，修法要给设计档 §4.18.1 添处置口径）。
- **相邻行不结**：`#2433`（tier-plan 门用收口实测长度判 500）的复启条件由 `#2461` 承接；`#2436` 只由 `#2461` 修掉五分之一（①），其余四条仍在。
- **未采纳的评审项**：`#59` 报的五条 🔵 中三条判不采纳（`surfaceKey` 同义归一已有四份、空入参在四个调用点已滤、廉价判据次序），理由逐条在 §5。
- **跨会话残留**：按 §1 2026-11-15 20:15 裁定如实记录，未粉饰为已解决。
