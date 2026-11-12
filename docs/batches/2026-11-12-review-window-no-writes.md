# 2026-11-12 · review-window-no-writes
> 六段，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 每段只有一个作者：作者的段可 `append` 加内容、可就地改（`edit`）；非作者一概拒。
> 编制：主 agent · 2026-11-12 · 来源 = 用户 2026-11-12 21:09「把AB两条合并在一起重新梳理一下，别分开写」＋ 21:13「能不能不用逼格这么高的话」——今晚在同一处连开三轮设计修正、三次作废 token。
> 台账 = #2370（core · 归批）。前情 = 无（独立批）。
## §1 讨论（主 agent）
**状态行**：已收口 2026-11-12
批起 sha = 648e4fde2eb1457219580ddeeef279e74a9d6a1b
<§1 模板占位：本批条目 / 关键判据 / 授权口径>

**交付后收正单（设计席 `#19` 排队中，跑起来时读这里，不另发消息）**

**一、围栏断行与盘面不同**——原因是父侧派单写错：让实施席「逐字照抄围栏块」，可围栏块按设计档排版折行，落进提示词面要逐行 ≤300 码点，照抄必被门拒（首轮 REFUSED：455 ∥ 359 ∥ 359 ∥ 394）。实施席按断行重排、词句一字未改、逐处验过拼回相等，门才 PASS。

要改：
1. §6.101 落点 ①② 的围栏块按盘面实际断行重排（① 三条现 5 行、② 两条现 4 行），**词一个不改**；
2. §6.100 落点⑤ 那句「三条 `>` 引文」按实际行数改口；
3. A1／A2 里若写着「逐字照抄围栏块」，改成「词句逐字相等；断行由实施席定，逐行 ≤300 且可拼回原句」；
4. 补一句：**围栏块是给人读的读数，不是抄写模板；断行属实施席**。

**二、评审第 2 轮两条 🟡**——A5 的「禁令词集命中 0」与 `do not edit` ∥ `never` 冲突（实施席实跑：起句 0 命中成立、字面集命中不成立），改成只判起句或把豁免注写全；「交后续批处置」与「上抛项：无」互斥，把 §6.56 ∥ §6.57 那道缝写进上抛项（承接方 + 解除条件）。

**三、既有件三问现读失效**——那里说「提示词面读不到 `zero-writes`」，落盘后命中 2，按现读改口。

## §2 批次任务与设计（eng-designer）
**状态行**：设计完成

<§2 模板占位：本批条目（覆盖） / 设计档落点 / 机制设计 / 受影响文件与测试覆盖 / 验收对照 / 关键决策 / 上抛项>

<§2 模板占位：机读清单 = 标题行「**受影响文件（机读清单）**」+ 围栏内三列表（表头 | 档 | 分拆方案 | 行数 |、分隔行 |---|---|---|、一行一档，只列代码档（源 ∥ 单测））；第二列：越设计时线的档写正向形方案（点名带目录段的档 + 本批落步 `实施轮` ∥ `§5`），未越线写 —；第三列：该档在批起快照上的内容行数（量法 = `countContentLines`），快照里没有这一档写 `新`；示例行 = | thincoder-core/agent-tools/batch-tier-gate.mjs | — | 新 |>

**本批条目（覆盖 · 逐条回指设计档）**

- **E1 · 零写入三条整块替换原两句**（落点 ①）。目标态 = `design §6.101` 落点 ① 围栏块的三行；`persona-engineering.md` §Advance & stop 原来的两行 `>` 引文（`From the review passing to the spawn` ∥ `The small corrections land after the eng-coder delivery`）整段被取代，不与新块并存。依据：用户 21:09「把AB两条合并在一起重新梳理一下，别分开写」。
- **E2 · 第 287–288 行收窄**（落点 ②）：该条只管「什么时候可以请批准」，并指回零写入条；判据 = `design §6.101` 验收 A2。
- **E3 · 同一规则的其余两处副本换写**（落点 ③ 第 89 行链 ∥ 落点 ④ 第 303 行 `docs FIRST`）。判据 = A3。
- **E4 · 第 330 行删句**（连同只解释它的第 332 行 Why，第 331 行留）。判据 = A4：删后 `One batch record serves one spawn at a time` 与 `two children on one record` 各命中 0，`A sequential handoff …` 仍在位。

**本批不做**：见 `design §6.101` 的「边界（本批不做）」六条，逐条成立；其中「不改七个开工词那一族」与「不改 §Ledger 那条 fix-aside 论价钱的句子」两条最容易被读成漏项，故在那节里各留了理由与对照行。

**设计档落点**：`docs/core/design/PROMPT-SYSTEM.md` §6.101（新增一节，落点在 §6.100 之后、`## 8.` 之前）· 同档 §6.100 落点⑤ 的语句改为指向 §6.101（原拟的两行已被取代，不再同处留存）· 同档 §6.100 的 A6·E4 探针 ∥ 受影响文件表的 persona-engineering 行 ∥ 用例表（删 C5，C6–C8 顺次前移）· 同档 §7 `D-PS61` 行的 `§Advance & stop` 半句。

**改动面（一句话）**：只改 `thincoder-core/prompts/persona-engineering.md` 一份提示词文本的五处，加本档一节；无代码档、无单测档、无工具面改动。

**受影响文件（机读清单）**

```text
| 档 | 分拆方案 | 行数 |
|---|---|---|
```

（本批无代码档：改动面 = 一份提示词 `.md` + 一份设计档，`.md` 不带读数，故清单空表。档位结论 = 无档跨分层：提示词档按本档 §6.1「提示词档免档位判定（`.md` 结构尺度）」不适用。）

**验收对照（逐条回指 · 读者面判读）**

- A1 ↔ E1：读者读 `persona-engineering.md` §Advance & stop，三条首句各在位一处，原两句读不到（探针 = 内置 `grep` 逐字串，改前各 1、改后各 0）。
- A2 ↔ E2：读者读 §Review convergence，收窄条在位且指回 `## Advance & stop`；`BEFORE you may request user approval` 读不到。
- A3 ↔ E3：读者读 §Call chain 与 §Delivery-chain closure，两处换写在位；`A fix round is not an exception` 逐字未动。
- A4 ↔ E4：读者读 §Implementation dispatch structure，删句后两个探针命中 0、`A sequential handoff … keeps the same record` 仍在位一处。
- A5 全批：零禁令起句 · `##` ∥ `###` 标题计数改前 = 改后。
- A6 全批：§6.100 A6·E4 的探针指向 §6.101 落点 ① 三段首句；档内不再有第二处要求原两句（`From the review passing to the spawn` ∥ `The small corrections land after the eng-coder delivery`）在位。

**判据形态的一条**：本组判据写的都是「必须成立的事」（哪句在位、哪句读不到），不写「本批改了五处」这类产出数——那个数随活而变，读者据此判不出活干完没有。

**关键决策**：`design §6.101` 关键决策表 K1–K5（K1 = 三条一整块不拆 · K2 = 和解句住收窄条而不动用户三段 · K3 = 副本一并换写 · K4 = 删句连同无主的 Why · K5 = 不补替代句）。

**上抛项**：

- [上抛·待裁] §6.56 ∥ §6.57 的账面与盘面不符（逐字 = `design §6.101`「§6.56 ∥ §6.57 的账面与盘面不符（本批不改，只登记）」）：本批只登记不改。承接方 = 主 agent 为它登记一行台账（`trigger` = `条件`；`resume_when` 写「下一次触碰 §6.56 ∥ §6.57 时并入」），由碰那两节的批落笔改那两节。解除条件 = 那两节改引盘面实际文本（`A sequential handoff (designer → coder → a fix round's re-spawn) keeps the same record` 及其上下文），或盘面改回它们记的 `One batch record is one task book` 那一族——二者任一使 §6.56 A1 与 §6.57 A5 的读数重新成立，这一行即销。

**修正轮（评审第 1 轮 · 逐条落点）**：11 条，收 10、不重开 1（第 10 条 = 台账 `#2346` 已登记，等裁定）。第 2 条按父侧实读改形态：`One batch record serves one spawn at a time` 盘上在位，落点 ⑤ 的删除对象不变。

| # | 级别 | 落了什么 |
|---|---|---|
| 1 | 🔴 | §6.100 的 A6·E4 探针换成 §6.101 落点 ① 三段首句（`Once the review has passed, do not edit the reviewed documents until the implementation starts.` ∥ `Approval is a separate step from the spawn.` ∥ `The exception: a finding that changes what the thing means.`），并写明该档零写入语义现由 §6.101 承载；§6.101 A1 未动 |
| 2 | 🔴 | 落点 ⑤ 的删除对象不变；实问题落 §6.101 新块「与前节的账面关系」——删的两行逐字 ∥ §6.56 ∥ §6.57 的账面与盘面不符只登记不改 ∥ §6.56 A1 与 §6.57 A5 当前读数不成立写明 |
| 3 | 🟡 | §6.100 受影响文件行的 ⑤ 半句改指向 §6.101（本节不增列）∥ §7 `D-PS61` 同半句改为「§Advance & stop 三段（落点见本档 §6.101 落点 ①）」∥ §6.100 用例表删 C5（同场景住 §6.101 C1），C6–C8 顺次前移为 C5–C7 |
| 4 | 🟡 | §6.101 新增「影响面（§6.73.1 类② 按节表的两个题眼）」：`Fix round ⇄ user approval timing` ∥ `Fix rounds doc-first` 换名，按节计数 2 / 19 与 297 基数不动 |
| 5 | 🟡 | §6.101 新增「档位结论 = 无档跨分层」（全 `.md`、按 §6.1 不适用；机读清单空表） |
| 6 | 🟡 | §6.101 新增「既有件三问」：`the zero-writes rule` = 改名，落点 ① 首句承载，旧名 `the reviewed documents take zero writes` 同时退场 |
| 7 | 🟡 | §6.101 标题第三段改为「并行按『各带自己的批档』」，与落点 ⑤ 的删除理由同向 |
| 8 | 🔵 | 「删句后的接续」改按句子指认（先读哪句 ∥ 紧接哪句 ∥ 再下一行是哪条 bullet），`325 → 329 → 331` 行号退场 |
| 9 | 🔵 | 用例表下补一行：C3 的例外分支 = `## Firing-rights boundary` (i) 的搬运、不新增分支；本仓无该类实例，故只写出处 |
| 10 | 🔵 | 不重开：关键决策「被否」列 vs F7-2 已登记台账 `#2346` |
| 11 | 🔵 | 「最近先例」补实现坐标（§6.99 落 `wait for a start word` ∥ `one of seven start words`；§6.100 落 `the pin is yours` ∥ `## Ledger` 第 3 条的两行） |

**修正轮另补两条（同轮自扫所得，非评审条目）**：§6.101 边界加一条「不改 §6.56 ∥ §6.57 的落地状态记载」；§6.100 用例表编号顺移已在上表第 3 行记明，无别处引用旧号。

**收正轮（父侧交付后收正单 · 逐条落点）**：7 条，收 7（第 3 条核过：A1 ∥ A2 无「逐字照抄围栏块」这一形，落的是同族的「照此落笔」标题与新增的断行声明）。

读数（探针 = node 逐行读取 + 逐字串比对；行宽 = `[...line].length`，同一把尺）：落点 ① 围栏块 5 行，与提示词面同一块 5 行**拼回逐字相等**；落点 ② 4 行同（4 行）；两块最长行 = 272 ∥ 280 码点；提示词面全档仍无一行越 300 码点。

| # | 单条 | 落了什么 |
|---|---|---|
| 1 | 一① | `design §6.101` 落点 ① 围栏块按盘面断行重排为 5 行（三段、各以 `> **` 起句），落点 ② 排为 4 行；词一个不改，拼回与盘面逐字相等 |
| 2 | 一② | 同档 §6.100 落点 ⑤ 的「三条 `>` 引文」改为按块指认（「该节那一整块 `>` 引文……块的断行与提示词盘面逐行相同」）；**不写行数**——同档 §6.102 的判据是状态档不携绝对值读数，行数读数住本节 |
| 3 | 一③ | A1 ∥ A2 核过无该措辞；同族的「**逐字英文文本（实施席照此落笔**」在 `design §6.100` ∥ `§6.101` 两处改为「照此词句落笔 · 断行自定」 |
| 4 | 一④ | `design §6.101` 新增「**围栏块是给人读的读数，不是抄写模板**」：① ∥ ② 按盘面断只为逐行对照；断行仍由实施席定，规则本体指向同档 §6.102「断行规则」 |
| 5 | 二·A5 | `design §6.101` A5 改为只判**起句**（取词法与词集同 §6.102 的 A5，`do not` 不入集），并明写「整行逐字扫不是判法」；原「禁令词集命中 0」的字面断言撤掉 |
| 6 | 二·上抛 | `design §6.101` 上抛项不再写「无」：§6.56 ∥ §6.57 那道缝入上抛项，带承接方与解除条件；正文那句「交后续批处置」改指上抛项（本节「上抛项」同步改写） |
| 7 | 三 | `design §6.101`「既有件三问」第三条按现读改口：`the zero-writes rule` 由落点 ② ∥ ④ 两处引用、各带 `in \`## Advance & stop\`` 的指回，旧名 `the reviewed documents take zero writes` 随落点 ① 退场；不再说「提示词面读不到该串」 |

**同轮自扫（非收正单条目）**：`design §6.101` 的「§6.56 ∥ §6.57 的账面与盘面不符」末条原写「交后续批处置」，与本轮上抛项同义重复，已改为指向上抛项，一处读法（上抛项承接）。

## §3 设计评审（评审子代理）
**状态行**：评审通过



### 轮次 1（评审子代理）

| # | 级别 | 状态 | 证据（指针） |
|---|---|---|---|
| 1 | 🔴 | 待处置 | §6.100「验收」A6·E4 要求 `The small corrections land after the eng-coder delivery`「各在位一处」；§6.101「验收」A1 要求同一串「改后各 0」 |
| 2 | 🔴 | 待处置 | §6.101 落点⑤ 的删除对象 `**One batch record serves one spawn at a time**` 与 §6.56「既有件三问」`none found` 的「全目录逐档实扫（忽略大小写）零命中」、§6.57「勘察证据行」的现文三行冲突；A4 探针改前即 0（绿买自文档让步） |
| 3 | 🟡 | 待处置 | §6.100「受影响文件」persona-engineering 行仍写「⑤（§Advance & stop 增列两行）」· §7 `D-PS61` 同行 · §6.100 用例表 C5 与 §6.101 C1 同场景 |
| 4 | 🟡 | 待处置 | 类②按节表 `persona · Review convergence` 题眼 `Fix round ⇄ user approval timing` 与 `persona · Delivery-chain closure` 题眼 `Fix rounds doc-first` 被落点② ∥ ④ 整体换代，297 条枚举未处置 |
| 5 | 🟡 | 待处置 | §6.101 无受影响文件的档位结论行（同档先例 = §6.100「分层结论 = 无档跨分层」） |
| 6 | 🟡 | 待处置 | §6.101 无「既有件三问」行；新标签 `the zero-writes rule` 被落点② ∥ ④ 两处引用 |
| 7 | 🟡 | 待处置 | §6.101 标题「一个批档一个 spawn」与其落点⑤ 的删除理由（「提示词面这句被读成『全场一个』」）相反 |
| 8 | 🔵 | 待处置 | 「删句后的接续」整段读法由 `325 → 329 → 331` 行号承载 |
| 9 | 🔵 | 待处置 | 用例 C3 的例外分支只指既有规则坐标（§Firing-rights boundary (i)），未给观测 ∥ 复现路径 |
| 10 | 🔵 | 不重开 | 「关键决策」被否列 vs F7-2 —— 台账 `#2346` 已登记，本轮不重开 |
| 11 | 🔵 | 待处置 | 「最近先例」只给设计档节号（§6.99 · §6.100），无实现坐标 |

VERDICT: changes-required

计数：🔴 2 · 🟡 5 · 🔵 4

### 轮次 2（评审子代理）

| # | 级别 | 状态 | 证据（指针） |
|---|---|---|---|
| 1 | 🔴 | Fixed | §6.100「验收」A6·E4 现文「原两句 `the reviewed documents take zero writes` ∥ `The small corrections land after the eng-coder delivery` 由 §6.101 落点 ① 取代，本节不再判它们在位。」——与 §6.101 A1 的「改后各 0」同向，反向断言已撤 |
| 2 | 🔴 | Fixed | §6.101 新增「**与前节的账面关系（本席实读）**」逐字给出被删两处与留存句；「**§6.56 ∥ §6.57 的账面与盘面不符（本批不改，只登记）**」记 `One batch record is one task book` 读不到、A1 与 A5 读数不成立；A4 探针改为「`One batch record serves one spawn at a time` 命中 0 ∥ `two children on one record therefore each work the full table` 命中 0」，与盘面读数成对 ⇒ 绿可红 |
| 3 | 🟡 | Fixed | §6.100「受影响文件」行改为「⑤（该锚位文本改由本档 §6.101 落点 ① 承载——本节不增列）」；§7 `D-PS61` 改为「§Advance & stop 三段（落点见本档 §6.101 落点 ①）」；§6.100 用例 C5 现为「边界 · 旧封印无逐档 hash」，旧重复例已撤 |
| 4 | 🟡 | Accepted | §6.101「**影响面（§6.73.1 类② 按节表的两个题眼）**」逐条登记两处换代名并给计数论证，末句「那张表属 §6.73 的产出，本节只登记失效与计数，不在其上落笔」——登记即处置，表本身归 §6.73 |
| 5 | 🟡 | Fixed | §6.101「**档位结论 = 无档跨分层**：本节改动的档全为 `.md`」+ 机读清单为空表 |
| 6 | 🟡 | Fixed | §6.101「**既有件三问（新增标签 `the zero-writes rule` · 读者 = 主 agent）**」，含 existing/name/consumers 与「是改名，不是第二份」 |
| 7 | 🟡 | Fixed | 标题现为「### 6.101 评审通过到实施之间：零写入 · 批准与 spawn 分开 · 并行按「各带自己的批档」」，与落点 ⑤ 判据同向 |
| 8 | 🔵 | Fixed | 「**删句后的接续（落点 ⑤）**：删后读法按句子认，不按行号——」，三条逐字句取代原 `325 → 329 → 331` 论证 |
| 9 | 🔵 | Fixed | 「C3 的例外分支 = 既有规则 `## Firing-rights boundary` (i) 的搬运，不新增分支；截至本轮，本仓没有「动了含义的发现」这一类实例」 |
| 10 | 🔵 | Accepted | 「关键决策」仍带「被否」列（`| # | 决策 | 理由 | 被否 |`）；冲突已入账 `#2346`（台账在 `#2346` 结案时一并销），本轮按上一轮裁定不重开 |
| 11 | 🔵 | Fixed | 「**最近先例（含实现坐标）**」两条各给提示词档 + 节 + 逐字落点句（`wait for a start word` ∥ `one of seven start words` ∥ `the pin is yours` 三行） |
| 12 | 🟡 | New | §6.101 A5「禁令词集 = `never` ∥ `must not` ∥ `do not` ∥ …：对落点 ①–⑤ 新增行逐行读，命中 0。落点 ① 第 1 段首句的 `do not edit` 起于 `**Once the review has passed` 之后」——同格先判 0 命中又当场认一处命中；姊妹行 §6.100 A8 的集是「（`do not` 不在集内）」，同一扫面两套集 |
| 13 | 🟡 | New | §6.101 正文「故写在册，交后续批处置。」与同节「**上抛项**：无。」互斥——已登记的 §6.56 ∥ §6.57 缝没有承接项 |

VERDICT: pass

计数：🔴 2（全 Fixed）· 🟡 7（Fixed 4 · Accepted 1 · New 2）· 🔵 4（Fixed 3 · Accepted 1）；New 两条为非阻断建议项。

## §4 用户批准（主 agent）

**用户批准**：2026-11-12 21:16「ok」放行设计轮；批级授权覆盖本批全链（评审 ∥ 修正 ∥ 实施 ∥ 收口）。

**评审链**：第 1 轮 `changes-required`（2🔴 5🟡 4🔵）→ 修正 → 第 2 轮 `pass` → 实施 → 交付后收正（设计席 `#19`）。

**本批是用户当场纠错形成的**：我在评审通过后连开三轮设计修正、三次作废 token，用户指出「提示词没写评审过了再改就要作废」；本批改的正是那两处会打架的纪律——评审通过到实施之间零写入、批准与 spawn 分开、动了含义的发现停下上报。

## §5 实施记录（eng-coder）
**状态行**：实施完成（五处落点逐字落位 · ② ¶1 断在分号已如实记 · 门 PASS · 终止态 clean）



**实施轮 · 2026-11-12 · 改动面 = `thincoder-core/prompts/persona-engineering.md` 一份，五处落点；无代码档、无单测档。台账 `#2370`。**

**五个落点（逐条 · 改前 → 改后）**

| # | 节 | 处置 | 改后要点（逐字） |
|---|---|---|---|
| ① E1 | §Advance & stop | 原两句**整段取代**为三段（落于七个开工词那族之前） | `Once the review has passed, do not edit the reviewed documents until the implementation starts.` ∥ `Approval is a separate step from the spawn.` ∥ `The exception: a finding that changes what the thing means.` |
| ② E2 | §Review convergence | 原两句**整条换写**并收窄 | 首段 `Approval timing — this bullet decides one thing: when the approval request may go out`；次段 `"Fix before asking" means the fix is on disk before the review passes`；尾句指回 `## Advance & stop` 的零写入条 |
| ③ E3 | §Call chain | 链中段**换写一处** | `**adjudicate finding by finding**` → `(if fixes needed) **the fix lands and is verified before the review passes**` |
| ④ E3 | §Delivery-chain closure | **整行换写** | `Fix rounds reuse the token while the chain is unclosed`；文档面交 `## Advance & stop` 判，本条不判文档面 |
| ⑤ E4 | §Implementation dispatch structure | **删两句**（`One batch record serves one spawn at a time` 与其 `- **Why**:` 块） | `A sequential handoff (designer → coder → a fix round's re-spawn) keeps the same record` 原地未动 |

**句界换行（父侧 2026-11-12 本轮批准；词句一字不动，只断行）**

送检先得 `REFUSED`：落点 ① 与 ② 的围栏段超 300 码点（455 ∥ 359 ∥ 359 ∥ 394）。判据 = 提示词面逐行判、阈值 300（`thincoder-core/doc-check/paragraph.mjs` 的 `PARAGRAPH_MAX` 与该档 `promptFace` 分支；状态档单源 = `DOC-CHECK.md` §2「**提示词面**（`thincoder-core/prompts/`）每行自成一界——那里的换行排的是版式，不是分段。」）。断行后全档无超 300 行。

| 处 | 断在哪 | 拼回去等于 | 两段码点 |
|---|---|---|---|
| ① ¶1 | `A change made in between` 之前 | 围栏 ¶1（去前缀后以单空格连接，逐字相等） | 258 ∥ 198 |
| ① ¶2 | `But "before approval"` 之前 | 围栏 ¶2 | 169 ∥ 191 |
| ① ¶3 | 未断 | 围栏 ¶3 | 272 |
| ② ¶1 | `in-flight status is reported only` 之前（**分号处，不是句号**） | 围栏 ¶1 | 280 ∥ 80 |
| ② ¶2 | `A fix wanted at that point` 之前 | 围栏 ¶2 | 197 ∥ 198 |
| ③ ∥ ④ | 未断 | 围栏逐字（④ 整行逐字相等） | 259 ∥ 282 |

② ¶1 那一处断在分号：该段内部没有句号，换到句界断则单行仍超 300、门照拒。别把它读成「四处全断在句界」。

**A1–A5 读数（探针 = 内置 `grep` 逐字串；「改前」于动手前采，落盘后按同一探针复采）**

| # | 判据 | 改前 | 改后 |
|---|---|---|---|
| A1 | 三段首句各在位一处 | 0 ∥ 0 ∥ 0 | 各 1（§Advance & stop） |
| A1 | `From the review passing to the spawn` ∥ `The small corrections land after the eng-coder delivery` | 1 ∥ 1 | 0 ∥ 0 |
| A2 | `this bullet decides one thing: when the approval request may go out` ∥ `"Fix before asking" means the fix is on disk before the review passes` | 0 ∥ 0 | 1 ∥ 1 |
| A2 | `BEFORE you may request user approval` | 1 | 0 |
| A2 | `the zero-writes rule in ` + `## Advance & stop` 指回 | 0 | 2 处（② 末段 ∥ ④） |
| A3 | `the fix lands and is verified before the review passes` ∥ `fix round lands and is verified` | 0 ∥ 1 | 1 ∥ 0 |
| A3 | `Fix rounds reuse the token while the chain is unclosed` ∥ `docs FIRST` | 0 ∥ 1 | 1 ∥ 0 |
| A3 | `A fix round is not an exception` 逐字未动 | 1 | 1 |
| A4 | `One batch record serves one spawn at a time` | 1 | 0 |
| A4 | `two children on one record therefore each work the full table` | 1 | 0 |
| A4 | `A sequential handoff (designer → coder → a fix round's re-spawn) keeps the same record` | 1 | 1 |
| A5 | 新增 11 行是否以禁令词起句 | — | 0 行 |
| A5 | `## ` ∥ `### ` 标题计数 | 17 ∥ 5 | 17 ∥ 5 |
| A5 | 禁令词集逐字命中 | — | **不成立**：`do not`（① ¶1）∥ `never`（① ¶1 次行） |

A5 的「命中 0」这一半跑不过，如实记：`do not edit`（A5 自己点了名）与 `the reviewer never read` 都在陈述句里，不是禁令句；题名「零禁令起句」成立、字面 0 不成立。这是 A5 本体自相矛盾（§3 第 2 轮 #12 已登记为非阻断），换行只是把 `never` 那一从句移到自己一行。

**交付门**：`doc_check(mode:"gate")` 首行 = `DOC-CHECK GATE: PASS`（首次 REFUSED 四行超长，断行后 PASS）。

**本轮评审与终止态**：内部 explore 差异审计 1 轮 = `AUDIT VERDICT: clean`（独立复算：行首禁令词 0 命中、未锚定时 30 行命中 ⇒ 探针有判别力；标题 17 ∥ 5；文档门 PASS）。内部 advisor 代码评审 1 轮 = `VERDICT: pass`（无 🔴；🟡 两条非阻断 + 🔵 一条样式；其中一条与本节自记的「② ¶1 断在分号」同处）。纠正轮 0。终止态 = clean。

**落地核对（设计档侧，等收口判）**

- `docs/core/design/PROMPT-SYSTEM.md` §6.101「逐字英文文本」落点 ①：「…**整段替换**为下面三行 `>` 引文…」——盘上为 5 行 `>`（词句逐字相同，断行不同）。
- 同节落点 ②：「…第 287–288 行**整条替换**为下面两条…」——盘上为 4 行（两条各断一次）。
- 同档 §6.100 落点 ⑤：「该锚位…的文本现由本档 §6.101 落点 ① 承载（三条 `>` 引文取代此处原拟的两行）；本节不复制。」——「三条」现为 5 行。
- 同节「既有件三问」：「`zero-writes` 这个名字此前不在提示词面：本轮对 `thincoder-core/prompts/` 扫该串，提示词面读不到（读数住本批记录面）。」——落盘后该串在提示词面命中 2（② ∥ ④）；作「此前」的历史读数仍真，作现读不成立。
- 其余与技术落盘同向、无第二处不成立：§6.101 的 A1–A4 判据、§6.100 A6·E4 的探针句、§7 `D-PS61` 的指向句。

**债务 ∥ 线索**：本批新债 0 条（本席视角，归口在 §6）。域外线索 1 条、未判：`thincoder-core/agent-tools/subagent.mjs` 的 `round` 参数说明仍带 `docs FIRST`，而落点 ④ 已在提示词面把那半句换成指向零写入条；设计边界明写工具面零改，故只登记。

**索引**：本轮写过的唯一档已由 `doc_check` gate 按路径 `git add`（只此一份，未 `git add -A`）。

## §6 验证与收口（父代理）

**验证（父侧，本会话实跑，探针 = 内置 `grep` 逐字串，域 = `thincoder-core/prompts/persona-engineering.md`）**

| 检查 | 读数 |
|---|---|
| 三条新句在位 | `Once the review has passed, do not edit` = 1 · `Approval is a separate step from the spawn` = 1 · `The exception: a finding that changes what the thing means` = 1 |
| 四串旧话清零 | `From the review passing to the spawn` = 0 · `The small corrections land after the eng-coder delivery` = 0 · `One batch record serves one spawn at a time` = 0 · `two children on one record therefore each work` = 0 |
| 留存句 | `A sequential handoff` = 1（原样留在原地） |
| 行宽 | 提示词面全档超 300 码点的行 = 0（实施席断行后最长 280） |
| 文档门 | `doc_check(mode:"gate")` 首行 `DOC-CHECK GATE: PASS` |

**单测**：本批零代码档，无单测档；提示词面无既有用例可跑。

**集成集**：不破任何既有用例——可观察面是提示词文本，RTM delta = 破 0 ∥ 冗余 0 ∥ 新增 0。

**落地核对**：实施顶掉了设计档四处描述（§6.101 落点①② 的围栏断行、§6.100 落点⑤ 的「三条引文」、既有件三问的 `zero-writes` 现读），已由设计席 `#19` 在交付后逐条收正；A5 的禁令词集改成只判起句；§6.56 ∥ §6.57 那道缝写进上抛项并落成台账 `#2374`。

**本批新债 1 条 + `#2374`。**
