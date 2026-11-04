# 2026-11-05 · git-exempt-write-gate
> 六段，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 每段只有一个作者：作者的段可 `append` 加内容、可就地改（`edit`，§4.19）；非作者一概拒。
> 编制：主 agent · 2026-11-05 · 来源 = 用户 2026-11-05 03:54「git操作感觉是不是应该从写门排除一下？」＋ 03:56「git那个按照a处理吧」（A = 整把摘出要号集，保留 `project` 不再问）。
> 台账 = #2058（core · 归批）。前情 = docs/batches/2026-11-05-doc-write-gate.md（已收口 2026-11-05）。
## §1 讨论（主 agent）
**状态行**：已收口 2026-11-05
<§1 模板占位：本批条目 / 关键判据 / 授权口径>

## 已定决定

- **已定决定**：`git` **整把退出写门的要号集**（方案 A）——写型 action 不再要求 `project` + `ledger:"#N"`；`project` 也不再问（`git` 自己的 `workdir` 就说清它作用在哪）。 · 用户原话：「git那个按照a处理吧」（A 的定义见父侧 03:54 二选一表：整把摘出要号集、保留 `project` 声明；父侧按「保留 project」的实质理解为「不再对它做要号判定」） · 时间：2026-11-05 03:56

**覆盖账 = #2058**

## 为什么（三条，按分量排）

1. **同一件活被收两次费**：提交不落新字节，它记录的是**已被写门缴过账**的那些内容。内容写盘时已经报过一次「替哪条账服务」，提交再报一次，多出来的那次不产生新的可查性——归属由提交信息 ∥ 批档 §6 ∥ 台账 `evidence` 三处持。
2. **与安全哲学相反**：本仓的真防线是「工作随时已提交」（快照 ∥ 提交是兜底，不是审批）。给提交加一道门，等于让人少提交——**把兜底做成了阻力**。
3. **今晚实证**：`#2049` 一落已核销，`git add` 就被拒（`only a 在途 row carries writes`），只能重开批档 + 新开 `#2056`。**`#2056` 不记任何债，只记「这次提交」——一行由门造出来的账。**

## 边界（不动的）

- **`bash` ∥ `execute` 不动**：用户 2026-11-03 裁定甲（命令面必须带在途号）仍然有效，本批不重提、不夹带。
- **`manifest` ∥ `memory` ∥ `ssh` 不动**：它们各有自己的要号支（`init` ∥ `write`、project 层、`get`），本批不碰。
- **写盘七件不动**：`write` ∥ `edit` ∥ `insert_after` ∥ `hashline_edit` ∥ `apply_patch` ∥ `delete` ∥ `file_ops` 的判据一字不改。
- **只读判定不撤**：`git` 退出要号集后，不必再判只读——但也不许顺手把只读名单删掉（他人可能消费）；处置由设计席按实际消费面给。
- **不新造拦截**：不因为「git 免号」就给别的工具加限制，也不给 git 加「必须写提交信息」之类的替代门槛。

## 验收面（给设计席的方向，不是判据）

- 「`git add` ∥ `git commit` 无在途行也能跑通」必须是**可跑出来的读数**，不是文字承诺。
- 反向也要有：写盘工具缺号**仍然拒**（证明本批没有把整道门拆掉）。
- `bash` ∥ `execute` 缺号**仍然拒**（证明没夹带扩面）。

## 设计席上抛的裁定（父侧 · 2026-11-05 04:01）

### 1. `docs/core/design/PROMPT-SYSTEM.md` 的 `Reach` 枚举必须同轮改

- 病：那份枚举把 `git` 算进「按 action 另写」的一份，且「十三份工具描述 · 九 + 四」的口径里含 `git`。
- 为什么不能延后：**那是给模型看的指令面**。本批已让 `git` 免号，提示词还写着它要号 ⇒ 模型照着提示词去带号，或者以为不带号会拒，**一条活的错误指令比一处陈旧描述坏得多**。
- 改动：`Reach` 枚举删 `git`；「十三份 · 九 + 四」改「十二份 · 九 + 三」；凡把 `git` 归进要号面的句子逐句摘掉。
- 边界：只改这一档里与本决策相关的槽位，不重写整份枚举。

### 2. 入口集 13 把（补 `ssh`）—— 认

代码逐字含 `"ssh"`，档里写 12 把是旧读数。**这类「档比代码少一把」的漂移，正是本批顺手该收的**；写明其要号支归 `docs/core/design/TOOLS.md`、不在此处复述机制，对。

### 3. 只读名单与钩子零改 —— 认

两个消费者在审批面，写门那个消费者随本批删。**不因为一处不用就把名单删掉**，这是「谁消费谁负责」的正确处置。

### 4. 本批另加一条边界（写给下一轮）

`git` 免号**不是**让提交变得随意：提交信息仍要写清这批是哪批（今晚 `4e5455ab` 那条就是示例）。**这条靠纪律与批档 §6 持，不加机械门**——本仓否决过「文本匹配拦截」那类安全剧场。

## 评审轮 1 的裁定（父侧 · 2026-11-05 04:11）

结论 `changes-required`（🔴 1 · 🟡 9 · 🔵 3）。**13 条全收**，其中 #1 已由父侧当轮改完。

| # | 裁定 | 要求 |
|---|---|---|
| 1 🔴 | **已修（父侧笔）** | 需求档 `docs/core/requirements/ENGINEERING-MODE-V2.md` §13.8 ⑥ 原写「`git` 只读 action 不要号」（言下之意写动作要号）→ 已改为「`git` **任何 action 都不要号**」并附三条理由。设计席**不必再改需求档**；但要在 §2 里记一句「需求面已同拍」并把该句纳入 R-G6 的扫描面 |
| 2 🟡 | 改 | R-G2 补 `ssh` 一格：`ssh({action:"get"})` 缺号仍拒 ∥ `put` 放行——本批改的正是那句入口集字面，`ssh` 是 12 个成员之一，没有一格证它没被顺手删掉 |
| 3 🟡 | 改 | 故事 12 节注 **十五态 → 十四态**（删 12-11 一行、套件 110 → 109；15 − 1 = 14）。批档 R-G5 与设计档 RTM 块两处同改，别把错数写成验收 |
| 4 🟡 | 改 | 档位结论补全：受影响表里另两件代码档（`test/integration/batch-live-batch-lock.test.mjs` ∥ 本批单测档）各给读数 + 结论；设计档 §3 那张表的 `git.mjs` 行补上「行数」与「档位结论」两格——它自己写着「上表逐档给结论」 |
| 5 🟡 | 改 | 设计档 §9「`git` 纳入写」块自相矛盾（头写破 0、正文写「破的行 = 12-9」、尾写「五行/前三条是 git 的」而表内四行）。**照该轮真实状态改**（破 1 / 冗余 1 / 增 4），并把「现行读数见后一节」留作唯一入口 |
| 6 🟡 | 改 | `docs/core/design/PROMPT-SYSTEM.md` §6.69 三处读数就地改写、日期对不上：现状表仍标「改前基线 2026-11-03」而值是改后（十二把 ∥ 九 + 三）；勘察行 2026-11-03/04 已无 `git` 收尾；2026-11-05 那条把入口集读成「十二把」且不含 `git`——**那天盘上还有 `git`**。一律按实际取数日期重标；写的是目标态就标目标态 |
| 7 🟡 | 改 | `git` 工具档里那句「只读 action 不要号」的去留要写明：本批之后该区别不存在，留着就是教「写动作要号」。R-G3 的验收把这一句纳进来 |
| 8 🟡 | 改 | `LEDGER_PARAM_DESC_GIT` 有没有剩余消费者，给一句三问答案（`existing:` 谁还在用 ∥ `none found:` ⇒ 连导出一并删）。决策 32「零消费的判据整条退场」要这个答案 |
| 9 🟡 | 改 | 决策 37 块补最近先例行（`existing:` = 决策 43 的「目标取根步例外」形 ∥ 决策 32 的「零消费退场」形），带对齐 ∥ 偏离 |
| 10 🟡 | 改 | 批档 §2 补调研证据行（查过哪些仓内档 ∥ `index.publicRepos` 读数；「查无相关」也要落字） |
| 11 🔵 | 改 | `ledger` 格数三读对齐（决策 35 的「十二把」∥ §2.3 的「十一把」∥ 枚举十一项） |
| 12 🔵 | 改 | `doc_check` 调用形统一（`docs:[…]` 还是 `target:`），让验收能照抄 |
| 13 🔵 | 改 | R-G1 的白盒 `grep -c '"git"'` 会连注释里引号提到 `"git"` 也算命中，写明注释怎么写才不撞（或不引号） |

**修正轮边界**：只落上表 13 条；不动已通过的方向（入口集删 `git` ∥ 补 `ssh` ∥ 决策 37 改判 ∥ 只读名单零改 ∥ 提交信息纪律）。

## 修正轮 1 之后的复核：三个行数读数全错（父侧 · 2026-11-05 04:15）

设计席第 4 条把三档行数「复读」成 `write-gate.mjs` **381** ∥ `git.mjs` **407** ∥ `batch-live-batch-lock.test.mjs` **405**，并据此把 `write-gate.mjs` 从 510「更正」为 381。

**父侧实测（`readFileSync(...).split(/\r?\n/).length`，末行空行计入）：**

| 档 | 设计席报 | 父侧实量 |
|---|---|---|
| `thincoder-core/agent/write-gate.mjs` | 381 | **522** |
| `thincoder-core/tools/git.mjs` | 407 | **429** |
| `test/integration/batch-live-batch-lock.test.mjs` | 405 | **415** |

**⇒ 三个数一起偏低，说明不是笔误，是量法本身有问题**（「`Get-Content .Count` 含空行」与这里的差不在空行上）。

**裁定**：

1. 三处读数按上表改，**并在同一行写出量法**（`readFileSync(...).split(/\r?\n/).length`），让下一个人能复现。
2. **`write-gate.mjs` = 522 行 ⇒ 已过 500 软线**。档位结论不能再写「软线内」，要写成：**在 500 软线之上、650 拆分触发线之下；本批在其上是净负行（删 `git` 分支与两个 import）；拆分义务已有承接批在册 ⇒ 不新增**。
3. 这条正好撞上刚落的 D12（读数必须机器量）——**同一晚、同一件事，说明那一条不是多余的**。

**不许**：拿「旧读数」或「估个大概」代替复量。量法与结果同处。

## 评审轮 2 的三条新 🟡（父侧 · 2026-11-05 04:22）

结论 `pass`，🔴 0；三条新建议项**全收**，其中第 16 条必须在实施前落——否则实施席照现文编出来的交付物会教一条已废的规矩。

| # | 裁定 | 要求 |
|---|---|---|
| 14 🟡 | 改 | 设计档 §3 那行「11 个工具描述档」与「`ssh` ∥ `git` 归 `docs/core/design/TOOLS.md`」两说并存。**实读**：描述档就在 `thincoder-core/tool-docs/git.md` ∥ `thincoder-core/tool-docs/ssh.md`，而 R-G3 的落点写的正是前者（对的）。把这行改成真实落点，计数写成「改前十三份 ∥ 改后十二份」 |
| 15 🟡 | 改 | 同一节里「本批」指了两批：`shared.mjs` 行的「本批加 `PROJECT_PARAM_DESC` 一条常量」是 **2026-11-03** 那笔的事，而 2026-11-05 那条说本批是**净负**。给旧那句加日期限定，让「本批」在 §3 里只有一个所指 |
| 16 🟡 | **必改** | `test/RTM.md` 的 `12-10` 现文断「同一把工具在写型与只读型上答案不同」——`git` 退出写门后这话不再成立，**它会在交付物里继续教那条被废的规矩**。设计档 §9 却写「12-10 现行断言已改为『审批面判只读』」。二者只能对一个。**处置**：把 `12-10` 的改写写进 §2 受影响文件表与 R-G5 判据（行文用设计档自己给的那句「名单只判审批，与写门无关」），破 ∥ 冗余的账要跟 RTM 实际会读到的东西对上 |

**边界**：三条都是同批内的一致性收正，不动已通过的决策与判据方向。

**实施席的验收随之加一格**：`test/RTM.md` 的 `12-10` 行不得再含「写型与只读型上答案不同」这一形；证据 = 改后逐字实读。

## 实施回执的三条漂移（父侧裁定 · 2026-11-05 04:37）

实施席报「R-G5 的套件行数量不出来」。**父侧实测，它报得对，是我们那组数本身错了。**

| 量法 | 改前 | 改后 |
|---|---|---|
| `^\|\s*\d+-\w+\s*\|`（宽松，含 `7-5a` 这类） | 121 | **120** |
| `^\|\s*\d+-\d+\s*\|`（严格，纯数字子号） | — | 118 |
| 故事 12 自身行数 | 15 | **14**（`12-11` 已不在） |

**裁定**：

1. **「套件 110 → 109」作废**，改成「**121 → 120**（量法 = `^\|\s*\d+-\w+\s*\|`，2026-11-05 父侧实量）」。**故事 12 的「十五态 → 十四态」不受影响**——它数的是自己那 14 行，与总数无关，两条判据别混。
2. §2 受影响表把 `readonlyActionOf` 记成 `git.mjs` 要删的第三个 import——**该档没有它**（它在 `write-gate.mjs`）。改成两个 import。
3. `docs/core/design/TOOLS.md` 里「该函数对未列工具回落逐字 `return true`（`git` / `manifest` / `memory` 各一分支之后）」——`git` 分支已删，这句话现在不成立。**同批收正**（设计档笔域）。

**补一句**：「110 → 109」这组数从评审轮 1 一直活到实施回执，**中间过了两轮评审、一次设计修正，没人量过它**——评审量的是「说法一致不一致」，不量数对不对。**这正是 D12 第一句要治的**（机器量），也说明判据写了不等于有人跑。

**边界**：三处都只改数与措辞，不动判据方向、不动代码。

## 「两个 import」这一处（父侧核定 · 2026-11-05 04:39）

设计席标 `unverified` 的那点，**父侧核了**：`git show HEAD:thincoder-core/agent/write-gate.mjs` 的 import 行只有一条 `import { readonlyActionOf } from "./dispatch-gates.mjs"` 在本批被删，现盘该行已不在；其余 import 一字未动。

**所以 `write-gate.mjs` 的实际改动 = 入口集 1 处 + 分支 2 处（`ledgerGateApplies` 的 `git` 支 ∥ `ledgerGateTargets` 的取根支）+ import **1** 个。**

设计档三处仍写「删 `git` 分支与两个 import」（§3 档位结论 ∥ 越线说明 ∥ 表内 `write-gate.mjs` 行）——**改成一个 import（`readonlyActionOf`）**。`git.mjs` 那行的「清两个 import」是对的（`LEDGER_PARAM_DESC_GIT` ∥ `PROJECT_PARAM_DESC`），别跟着改。

**为什么这类数非得核**：它是下一个拆档的人要照着切的依据。**多算一个 import 本身无害，但它说明这三处是照设计推的、不是照盘抄的**——而盘上究竟是几个，只有 `git show` 能答。

**边界**：只动这三处的「两个 import」→「一个 import（`readonlyActionOf`）」，不动行数与结论。

## §2 批次任务与设计（eng-designer）
**状态行**：（eng-designer 写入时更新）
<§2 模板占位：本批条目（覆盖） / 设计档落点 / 机制设计 / 受影响文件与测试覆盖 / 验收对照 / 关键决策 / 上抛项>

**状态行**：设计完成

## 本批条目（覆盖 #2058）

- **R-G1 `git` 整把不在写门入口集**：写型 action 不要号、`path` ∥ `workdir` 不参与取根、`ledger` ∥ `project` 两格从 schema 删。判据 = `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` §2.3「`git` 不进写门」+ §5 R2 ⑪。
- **R-G2 反向控制（证明门没被拆）**：同会话里写盘七件缺号仍拒、`bash` ∥ `execute` 仍要号、`ssh` 按 action 分判（`get` 缺号仍拒 ∥ `put` 放行）。判据 = 设计档 §5 R2 ①⑤⑩⑪ + 本节「验收对照」。**为什么 `ssh` 要占一格**：本批改的正是入口集那句字面，`ssh` 是集内十二把之一——没有一格证明它没被顺手删掉。
- **R-G3 教学面同拍**：`git` 的工具描述与 schema 不再教「传号 / 传项目」——`ledger` 行 ∥ `project` 行 ∥ 「Read-only actions do not need it: …」那一句，三处逐字删（本批之后写型与只读不再分判，留着就是教「写动作要号」）；`PROJECT_PARAM_DESC` 句里摘掉 `git`。判据 = §5 R30 + R33。
- **R-G4 只读名单保留（决策 37 的存续半边）**：`isReadonlyAction` 钩子与其名单零改，消费者换成审批面（planMode 放行 ∥ 免审批短路）。判据 = §4 决策 37 + §2.3「只读名单本体」。
- **R-G5 集成面 delta**：12-9 结果列翻面（现盘断言「无在途号跑 `commit` ⇒ 拒」，改后 = 无在途行 `git add`+`commit` 照常生效）、**12-10 改写**（现尾句「同一把工具在写型与只读型上答案不同」→「名单只判审批，与写门无关」——`git` 出集后写型与只读不再分判，那一句会在交付物里继续教已废的规矩）、12-11 删、故事 12 节注十五态 → **十四态**（15 − 1 = 14）、套件 **121 → 120**（删 12-11 一行；12-9 ∥ 12-10 是改写，不计行数。量法 = 正则 `^\|\s*\d+-\w+\s*\|` 数 `test/RTM.md` 的用例行，2026-11-05 父侧实量；「110 → 109」那对旧读数作废——两次量法都量不出它，见本节末「父侧裁定的三处收正」）。判据 = §9「`git` 退出写门的 RTM 答复」（该块读数 = 破 2 ∥ 冗余 1 ∥ 缺 0）。
- **R-G6 设计档提示词面同拍**：`docs/core/design/PROMPT-SYSTEM.md` §6.69 射程行删 `git`、`Action decides` 行只留 `manifest`、工具描述读数改「十二份 · 九 + 三」、C3 ∥ C10 换写。判据 = 该档 §6.69 A2（射程枚举十二把）∥ §6.69 C3（`git` 不在射程）。**为什么必须同轮**：那是给模型看的指令面——本批已让 `git` 免号，提示词还写着它要号，模型就照着带号、或以为不带号会被拒；一条活的错误指令比一处陈旧描述坏得多（父侧 04:01 裁定 1）。

## 设计档落点

全部落两档设计档，各持自己那份、互不复述：`docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md`（本档拥有写锁契约）——§2.3 判据表 ∥ 判据点表 ∥「`git` 不进写门」节 ∥ schema 面；§3 受影响文件表；§4 决策 37（改判）；§5 R2 ∥ R30 ∥ R33；§6 用例表；§7 边界；§9 RTM delta。`docs/core/design/PROMPT-SYSTEM.md` §6.69（提示词教学面）——射程枚举行 ∥ 工具描述读数 ∥ 用例 C3 ∥ C10，本席已落。批档只引用，不另立判据。

## 机制设计

**改的是入口集成员资格，不是判据本体。** 四处连带删，都是「零消费者」的派生，不是新判据：

- `LEDGER_ENTRY_TOOLS` 去掉 `"git"` ⇒ 本门在 `if (!LEDGER_ENTRY_TOOLS.has(name)) return null` 这一行就返回。
- `ledgerGateApplies` 的 `git` 分支随之零消费 ⇒ 删。
- `ledgerGateTargets` 的 `git` 取根支（`path` ∥ `workdir`）随之零消费 ⇒ 删。
- `readonlyActionOf` 在本档零消费者 ⇒ import 删（该谓词本体与其消费者不动）。

**判据本体一字未动**：笔-账绑定、四情形拒文、判序、面判、`depth` 与模式守卫全不动。
**`git` 两格参数删除的依据** = 决策 40「名字只为被读的地方存在」——不在入口集 ⇒ 两格永不被读。
**提示词面同拍、不动机制**：射程行少一个枚举值、`Action decides` 行少一把工具——教学面跟着判据走，不新增判据。

## 受影响文件与测试覆盖

| 文件 | 改动 |
|---|---|
| `thincoder-core/agent/write-gate.mjs` | 入口集删 `"git"`；`ledgerGateApplies` 删 `git` 分支；`ledgerGateTargets` 删 `git` 取根支；`readonlyActionOf` import 删；注释随判据改 |
| `thincoder-core/tools/git.mjs` | 删 `ledger` ∥ `project` 两格与两个 import（`LEDGER_PARAM_DESC_GIT` ∥ `PROJECT_PARAM_DESC`）；`readonlyActionOf` 不在本档——它是 `write-gate.mjs` 的 import，随本批在那一档删掉；`isReadonlyAction` 钩子零改 |
| `thincoder-core/tools/shared.mjs` | `PROJECT_PARAM_DESC` 句里摘 `git`（目标逐字见设计档 §2.3 schema 面）；`LEDGER_PARAM_DESC_GIT` 零消费 ⇒ 连导出一并删（三问答案见下） |
| `thincoder-core/tool-docs/git.md` | 删三处：`ledger` 行 ∥ `project` 行 ∥ 「Read-only actions do not need it: …」那一句（教学面不许教一个本批之后已不存在的区别） |
| `docs/core/design/TOOLS.md` | 跨档收正（父侧 §1「实施回执的三条漂移」③）：§6.22 ④ 的回落分支枚举按现盘改为「`manifest` / `memory` / `ssh` 三个分支之后」（`git` 分支随本批删）；同段 ② 的入口集字面改为现盘十二把 + 一句「`git` 整把不在集内」，回指本档 §2.3（D2，不复述机制）。判据方向零改；设计档不进档位判定 |
| `thincoder-core/prompts/persona-engineering.md` | `Reach` 枚举删 `git`、`Action decides` 行只留 `manifest`（内容依据 = `docs/core/design/PROMPT-SYSTEM.md` §6.69 围栏块，落笔 = eng-coder） |
| `test/integration/batch-live-batch-lock.test.mjs` | 12-9 结果列翻面（无在途行 `git add` + `commit` 生效）、**12-10 结果列与断言串改**（现断言串「同一把工具两种判据：只读不要号」→「名单只判审批，与写门无关」；用例标题同步改）、12-11 格删 |
| `test/RTM.md` | 12-9 改写、**12-10 改写**（尾句「同一把工具在写型与只读型上答案不同」删，换「名单只判审批，与写门无关」）、12-11 行删、故事 12 节注十五态 → **十四态** |
| `docs/batches/2026-11-05-git-exempt-write-gate.test.mjs` | 本批单测档（随批删） |

**`LEDGER_PARAM_DESC_GIT` 的三问答案**

- `existing:` **零处**。本席本轮实扫 `thincoder-core` ∥ `thincoder-vscode/src`，唯一消费者 = `thincoder-core/tools/git.mjs` 的 `ledger` 格（import 行与 `ledger: { type: "string", description: LEDGER_PARAM_DESC_GIT },` 使用行）——该格随本批删 ⇒ 零消费。
- 定义处 = `thincoder-core/tools/shared.mjs` 的 `export const LEDGER_PARAM_DESC_GIT = LEDGER_PARAM_DESC`：纯别名，无自有文本，不是第二份措辞。
- 处置 = 决策 32「零消费的判据整条退场」⇒ **连导出一并删**，不留在册当备用。

**实施席两处衔接**：① `write-gate.mjs` 改注释时保留短语「`manifest` 的 `init` ∥ `write` 都要号」逐字——`docs/core/design/PROMPT-SYSTEM.md` §6.69 的勘察行引它作依据，改字即断引，交付门判 `引缺`。② `thincoder-core/prompts/persona-engineering.md` 的落地块以设计档 §6.69 围栏块为准，两行都要改（射程行 ∥ `Action decides` 行）——整行相等是 A1 的硬判。

**档位结论**（2026-11-05 实量。**量法 = `readFileSync(p,'utf8').split(/\r?\n/).length`，末行空行计入**；软线 = 500 行，拆分触发线 = 650 行）：无一文件因本批新跨档。

- `thincoder-core/agent/write-gate.mjs` = **522 行** ⇒ **已过 500 软线、未到 650 拆分触发线**；本批在其上是**净负行**（入口集少一个成员 + 删两个分支 + 删一个 import），净负回不到线下 ⇒ 拆分义务不因本批新增（**已有承接批在册**，切法见设计档 §3 该行）。
- `thincoder-core/tools/git.mjs` = **429 行** ⇒ 软线内（余 71），本批净负（删两格 + 两个 import）⇒ 不拆。
- `test/integration/batch-live-batch-lock.test.mjs` = **415 行**：测试档不进档位判定（软线判的是源档）；本批改结果列 + 删一格，净负——该读数只为这一条留证。
- `docs/batches/2026-11-05-git-exempt-write-gate.test.mjs`（本批单测档，设计时刻未落盘）⇒ 随批删，不进档位判定。
- `thincoder-core/tools/shared.mjs` = **497 行**（余 3，触 500 即拆）；`thincoder-core/tool-docs/git.md` 与两档设计档本批皆净负（删三处 ∥ 改节内文本），不进档位判定。

## 验收对照

可跑面 = `node --test docs/batches/2026-11-05-git-exempt-write-gate.test.mjs`（与本批档同名同目录、随批删）。

| 条目 | 判据 |
|---|---|
| R-G1 | 台账无在途行时 `git({action:"add"})` + `git({action:"commit"})` 都成功、`git log` 出现该 message；`git({action:"status"})` 照跑回输出；白盒 `grep -c '"git"' thincoder-core/agent/write-gate.mjs` = 0。**注释怎么写才不撞**：该 grep 数的是带双引号的字面，注释里照样写 `"git"` 一样命中 ⇒ 注释里用反引号形（`` `git` ``）或干脆不加引号；这是该白盒格的自伤面，不是判据放宽 |
| R-G2 | 同会话 `write` 不带号 ⇒ 拒、文件零改、拒文含 `no ledger number on this call`；`bash` 不带号 ⇒ 拒、命令零执行；`execute` 不带 `workdir` 也不带 `project` ⇒ 拒；`ssh({action:"get"})` 不带号 ⇒ 拒，同会话 `ssh({action:"put"})` 不带号 ⇒ 放行（证明 `ssh` 没被顺手删出入口集） |
| R-G3 | `thincoder-core/tools/git.mjs` 的 `properties` 无 `ledger` ∥ `project` 两键；`thincoder-core/tool-docs/git.md` 三处逐字不在（`ledger` 行 ∥ `project` 行 ∥ 「Read-only actions do not need it: …」句）；`PROJECT_PARAM_DESC` 句内无 `git`；`thincoder-core/tools/shared.mjs` 已无 `LEDGER_PARAM_DESC_GIT` |
| R-G4 | `grep -c "isReadonlyAction" thincoder-core/tools/git.mjs` ≥ 1；白盒 `readonlyActionOf(gitTool, "git", {action:"commit"})` = `false` ∧ `{action:"status"}` = `true` ∧ `{action:"checkpoint", checkpointAction:"list"}` = `true` ∧ `{action:"checkpoint", checkpointAction:"rewind"}` = `false` |
| R-G5 | `node --test test/integration/batch-live-batch-lock.test.mjs` 绿（12-9 新期望、12-10 改后断言）；该档无 12-11 用例；`test/RTM.md` 故事 12 节注为**十四态**、无 12-11 行、套件用例行 = **120**（量法 = 正则 `^\|\s*\d+-\w+\s*\|`；改前 121，删 12-11 一行）；**`test/RTM.md` 的 `12-10` 行逐字实读不含「写型与只读型上答案不同」这一形 ∧ 含「名单只判审批，与写门无关」**；该档 12-10 用例无 `同一把工具两种判据：只读不要号` 这一串 |
| R-G6 | `node` 读 `docs/core/design/PROMPT-SYSTEM.md` §6.69 围栏块的射程行：`` `git` `` 出现 0 次；全档扫「十三份」∥「九 + 四」⇒ 各 0；「十三把」只许出现在标了「改动前现盘」的括注里（那是实施席照着删的现盘读数，不是射程值）；§6.69 A2 的枚举清单 = 十二把；**需求面同拍**：`docs/core/requirements/ENGINEERING-MODE-V2.md` §13.8 ⑥ 逐字含「`git` **任何 action 都不要号**」，且该节扫「只读 action 不要号」= 0；`doc_check(mode:"gate", docs:["docs/core/design/PROMPT-SYSTEM.md", "docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md"])` 首行 PASS |

## 关键决策

- **取「整把退出」，不取「只摘 `commit` ∥ `push`」**：`add` 不落提交，而 `rm` ∥ `reset` 恰恰是会丢工作的动作——给它们加「先挂号」的门，把人挡在正确操作外面，同时把口子做在最容易出事的那两个上。被拒理由全文 = 设计档 §4 决策 37。
- **不新造替代门槛，提交信息仍要写清属哪批**：不加「提交必须带提交信息」这类机械门（门判得出有号无号，判不出写清没有，硬加一道文本匹配只是假门）；而免号不免归因——提交信息写「这批是什么」，靠纪律与交付记录持（设计档 §2.3「提交信息仍要写清这一笔属哪批」）。
- **`isReadonlyAction` 不删**：它有审批面消费者（`thincoder-core/agent/dispatch.mjs:63` ∥ `:185`），本批只摘掉写门那一个消费者。

## 调研证据（设计前置 · 本席本轮实读 2026-11-05）

- **仓外声明源**：`PROJECT-MANIFEST.json` 的 `index.publicRepos` = `[]` ⇒ 无跨仓公共源可查——**已查，无相关**（照记）。
- **仓内设计层相关档**：`docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md`（本批正源：§2.3 入口集与判据表 · §4 决策 37 ∥ 40 ∥ 43 · §5 R2 ∥ R30 ∥ R33 · §9）· `docs/core/design/PROMPT-SYSTEM.md` §6.69（提示词教学面唯一副本）· `docs/core/design/TOOLS.md`（`ssh` 的要号支）· `docs/core/design/TESTING.md`（零留存 ∥ 集成套件口径）· `docs/core/design/BATCH-RECORD.md`（六段与状态行）。
- **仓内需求层与测试面**：`docs/core/requirements/ENGINEERING-MODE-V2.md` §13.8 ⑥（需求面同拍）· `test/RTM.md`（故事 12 现盘十五行 = 12-1 … 12-15）。
- **需求面已同拍**（父侧 04:11 裁定 1）：需求档 §13.8 ⑥ 已由父侧改为逐字「`git` **任何 action 都不要号**」——本席不改需求档（主 agent 笔域），只把这一句纳入 R-G6 的扫描面。
- **实读坐标**：`thincoder-core/agent/write-gate.mjs` 的 `LEDGER_ENTRY_TOOLS` 现盘逐字 `"bash", "execute", "git", "manifest", "memory", "ssh",` ⇒ 十三把；`thincoder-core/tools/git.mjs` 现盘有 `ledger:` ∥ `project:` 两格与 `isReadonlyAction(args) {` 钩子。
- **无相关的一面照记**：本轮不查仓外其它仓——不在 `index.publicRepos` 内，无声明源可查。

## 上抛项

1. 〔已裁 · 本席已落〕`docs/core/design/PROMPT-SYSTEM.md` 的提示词教学面已按父侧 04:01 裁定 1 同轮改完：射程枚举删 `git`、`Action decides` 行只留 `manifest`、工具描述读数改「十二份 · 九 + 三」、C3 ∥ C10 与勘察行换写。判据见 R-G6。
2. 〔已裁 · 父侧 04:01 裁定 2 认〕§2.3 入口集计数按代码实读修正为 13 把（含 `ssh`）；`ssh` 的要号支归 `docs/core/design/TOOLS.md`，本席不复述该机制。本批后再回到 12 把（`git` 退出）。

## 父侧裁定的三处收正（2026-11-05 04:37 · 收正轮）

父侧实测三处与本 §2 原稿不符，逐条收正。判决原文与量法见 §1「实施回执的三条漂移」。

- **① 套件读数**：「110 → 109」作废，改「**121 → 120**」。量法 = 正则 `^\|\s*\d+-\w+\s*\|` 数 `test/RTM.md` 用例行（含 `7-5a` 这类字母子号），本席本轮当场复量：改后 120、故事 12 自身 14 行（`12-11` 已不在）；纯数字子号量法另得 118——两种量法都不出 110。**故事 12 的「十五态 → 十四态」不受影响**：它数的是自己那 14 行，与总行数无关。落点三处：本节 R-G5 条目 ∥ R-G5 判据格 ∥ `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` §9「`git` 退出写门」块末句。
- **② `git.mjs` 的 import 计数**：原稿记「三个 import」并点名 `readonlyActionOf`——**该档没有这个 import**（本轮实读：`readonlyActionOf` 在 `thincoder-core/tools/git.mjs` 只出现一次，在 `isReadonlyAction` 的注释里，非 import 行；该档现无 `LEDGER_PARAM_DESC_GIT` ∥ `PROJECT_PARAM_DESC` 字面）。改「两个 import」；`readonlyActionOf` 的 import 是 `thincoder-core/agent/write-gate.mjs` 的，随本批在那一档删。
- **③ `docs/core/design/TOOLS.md` 跨档滞后（设计档笔域，本席本轮改完）**：§6.22 ④ 原文「该函数对未列工具回落逐字 `return true`（`git` / `manifest` / `memory` 各一分支之后）」——`git` 分支随本批删除，本句不再成立。按现盘 `ledgerGateApplies` 实读改为「`manifest` / `memory` / `ssh` 三个分支之后」。同段 ②「入口集」那条还留着删前的集字面（含 `git`、称十二把并要改成十三把）⇒ 同步改成现盘十二把 + 一句「`git` 整把不在集内」并回指本档 §2.3，不复述机制（D2）。

**受影响文件表补一行**（本轮新增写入面，原表未列）：`docs/core/design/TOOLS.md` —— 改 §6.22 ④ 的 `return true` 分支枚举与 ② 的入口集字面（判据方向零改，只按现盘收正）。另有 `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` §3 两处 import 计数与 §9 套件读数随之收正。

## 父侧核定的「两个 import」（2026-11-05 04:39 · 收正轮 2）

父侧以 `git show HEAD:thincoder-core/agent/write-gate.mjs` 核定：该档本批实删 import **一个**（`readonlyActionOf`）；其余 import 一字未动。判决原文与理由见 §1「「两个 import」这一处」。

- **设计档三处已改**：`docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` §3 的档位结论 ∥ 越线说明 ∥ 表内 `write-gate.mjs` 行——「两个 import」→「一个 import `readonlyActionOf`」。**行数与结论未动**（父侧边界）。
- **`git.mjs` 那行保持「清两个 import」**（`LEDGER_PARAM_DESC_GIT` ∥ `PROJECT_PARAM_DESC`）——父侧明令别跟着改。
- **与本节档位结论原读数同拍**：那里原就写「入口集少一个成员 + 删两个分支 + 删一个 import」，本笔只把设计档对齐到同一读数，未产生新判断。

**同轮复核的另两笔 04:37 裁定（已落地，本席实读）**

- **① 套件读数 121 → 120**：三处同值同量法——本节 R-G5 条目 ∥ R-G5 判据格 ∥ 设计档 §9「`git` 退出写门」块末句；「110 → 109」那对旧读数已作废并写明两种量法都不出它。
- **③ `docs/core/design/TOOLS.md` §6.22**：④ 逐字已为「（`manifest` / `memory` / `ssh` 三个分支之后）」、② 已写「`git` 整把不在集内」。本笔只把该档补进本节受影响表（原表未列该写入面）。

**边界**：只改数与措辞；判据方向、行数读数、已通过的决策一律未动。

## §3 设计评审（评审子代理）
**状态行**：评审通过



### 轮次 1（评审子代理）

**设计评审 · 第 1 轮 · 对象 = git 退出写门要号集（入口集十三→十二 · 决策 37 改判 · 提示词面同拍）**

结论表（一条一项；证据 = 指针，不引行号）

| # | 严重度 | 状态 | 证据（指针 / 原词） |
|---|---|---|---|
| 1 | 🔴 | 待处置 | 同一机制两处活描述：PROMPT-SYSTEM §6.69 勘察行引需求档逐字「`git` 只读 action 不要号」，本批却把 `git` 整把摘出；批档 §2「全部落两档设计档，各持自己那份、互不复述」，§6.69 边界又写「不动需求档（主 agent 笔域）」——无落点、无上抛项 |
| 2 | 🟡 | 待处置 | 批档 §1「`manifest` ∥ `memory` ∥ `ssh` 不动…本批不碰」对 R-G2「写盘七件缺号仍拒、`bash` ∥ `execute` 仍要号」：`ssh` 不在反向控制集内 |
| 3 | 🟡 | 待处置 | R-G5 同句两读数互刺：「套件 110 → 109」（删一行）与「故事 12 节注十五态 → 十三态」（须删两态）；且「十三态」被写成验收判据 |
| 4 | 🟡 | 待处置 | 档位结论只给 `write-gate.mjs` ∥ `git.mjs` 两读数；受影响表另两件代码档（集成测试档、本批单测档）无读数无结论；设计档 §3 表自述「上表逐档给结论」，其 `git.mjs` 行恰无结论格 |
| 5 | 🟡 | 待处置 | 设计档 §9「`git` 纳入写的 RTM 答复——破 0 / 冗余 0 / 增 5」与自身「破的行 = 12-9…已翻面」「本表五行（前三条是 `git` 的）」及表内四行互刺 |
| 6 | 🟡 | 待处置 | PROMPT-SYSTEM §6.69 读数就地改：现状表仍标「改前基线 · 本席设计时刻实读 2026-11-03」而值为「十二把」「九 + 三」；勘察行日期停在 2026-11-03/04 却已无 `git` 收尾；2026-11-05 那条把入口集读成十二把且不含 `git`，与本批 13→12 前提相反 |
| 7 | 🟡 | 待处置 | 设计档 §3 仍写「`git` 档另写一句「只读 action 不要号」」，R-G3 验收只判「两行逐字不在」⇒ 教号的那句可能原样留在教学面 |
| 8 | 🟡 | 待处置 | 设计档 §3 清 `LEDGER_PARAM_DESC_GIT` 的 import，但无一句回答该常量还剩不剩消费者；决策 32「零消费的判据整条退场」要这个答案 |
| 9 | 🟡 | 待处置 | 决策 37 块与批档 §2 均无最近先例行（同档决策 43 写「最近先例：同档决策 37」，决策 32 可引） |
| 10 | 🟡 | 待处置 | 批档 §2 无调研证据行：仓外声明源 ∥ 仓内相关档 ∥ 无相关的记法，一句未落 |
| 11 | 🔵 | 记录 | `ledger` 格计数两读：决策 35「`ledger` 入入口集十二把工具的 `properties`」对 §2.3「`ledger` 面十一把各一格」，而同条枚举只列十一把 |
| 12 | 🔵 | 记录 | 同一工具两种调形：R-G6 用 `doc_check(mode:"gate", docs:[…])`，§6.69 A12 用 `doc_check(mode:"gate", target:…)` |
| 13 | 🔵 | 记录 | R-G1 白盒 `grep -c '"git"'` = 0 也会被注释里带引号的 `"git"` 撞红；设计只说「改注释随判据改」，未定带引号提及的处置 |

不挡通过的一面（记下以免复评重查）：`git` 免号的出处是实机（`#2049` 落已核销后 `git add` 被拒 ⇒ 新开 `#2056`），6b 站得住；可跑面 = 与本批档同名同目录的单测档，非整套跑；§9 的 RTM 答复有破 / 冗余 / 缺三问与进入口。

计数：🔴 1 · 🟡 9 · 🔵 3（共 13 条）。

VERDICT: changes-required

### 轮次 2（评审子代理）

**设计评审 · 第 2 轮 · 对象 = git 退出写门要号集（只验轮 1 的 13 条 + 三个行数收正）**

结论表（一条一项；证据 = 原词指针，不引行号）

| # | 严重度 | 状态 | 证据（原词） |
|---|---|---|---|
| 1 | 🔴 | 已修 | R-G6 增需求面格「`git` **任何 action 都不要号**」；§2 调研证据写「需求面已同拍（父侧 04:11 裁定 1）」；§6.69 勘察行改引「需求面与本批同拍：`git` **整把**不在写门射程内，不是「只读不要号」」 |
| 2 | 🟡 | 已修 | R-G2 增「`ssh` 按 action 分判（`get` 缺号仍拒 ∥ `put` 放行）」，验收对照有同名格 |
| 3 | 🟡 | 已修 | R-G5 与 §9 均改「故事 12 节注十五态 → **十四态**（15 − 1 = 14）」；RTM 现盘节注确为「十五态（行序）= 12-1 … 12-15」 |
| 4 | 🟡 | 已修 | 档位结论补全：`write-gate.mjs` 522 ∥ `git.mjs` 429 ∥ 集成档 415 ∥ `shared.mjs` 497 ∥ 本批单测档未落盘；§3 表 `git.mjs` 行有「**429**（2026-11-05 实量）」与结论格 |
| 5 | 🟡 | 已修 | §9 块头改「破 1 / 冗余 1 / 增 4」，表内四行、末句「本表四行…该块新增计 **4 行**」，并留「本块不复述」作唯一入口 |
| 6 | 🟡 | 已修 | §6.69 改标「本批落地后的目标态」，括注「改动前现盘 = **十三把**」；勘察行写「本节各处「十二把 ∥ 九 + 三」= **本批落地后的目标态**，不是 2026-11-03/04 的现盘值」 |
| 7 | 🟡 | 已修 | R-G3 与 §3 均改「三处逐字删（`ledger` 行 ∥ `project` 行 ∥ 「Read-only actions do not need it: …」句）」 |
| 8 | 🟡 | 已修 | §2 有「`LEDGER_PARAM_DESC_GIT` 的三问答案」：`existing:` 零处 ⇒ 连导出一并删；R-G3 判「`shared.mjs` 已无 `LEDGER_PARAM_DESC_GIT`」 |
| 9 | 🟡 | 已修 | 决策 37 有「**最近先例**：同档决策 43 … ∥ 同档决策 32 …」并带对齐 ∥ 偏离 |
| 10 | 🟡 | 已修 | §2 有「**调研证据**（设计前置 · 本席本轮实读 2026-11-05）」块：`index.publicRepos` = `[]`、仓内相关档清单、「无相关的一面照记」 |
| 11 | 🔵 | 已修 | 三读对齐十二把：决策 35「入口集十二把逐一，含 `ssh`」与 §2.3「`ledger` 面十二把各一格（入口集十二把逐一）」，枚举 6+1+4+1 = 12 |
| 12 | 🔵 | 已修 | §6.69 A12 改 `docs:["docs/core/design/PROMPT-SYSTEM.md", "docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md"]`，与 R-G6 同形并注明 `target` 是另一个参数 |
| 13 | 🔵 | 已修 | R-G1 增「注释怎么写才不撞：…注释里用反引号形或干脆不加引号」 |

三个行数收正：批档 §1 复核表（522 ∥ 429 ∥ 415）∥ §2 档位结论 ∥ 设计档 §3「本批 2026-11-05 实量」四处同值，量法逐处写明。

本轮新发现（均不挡）

| # | 严重度 | 状态 | 证据（原词） |
|---|---|---|---|
| 14 | 🟡 | 新 | 工具描述落点两说：§3 写「`ssh` ∥ `git` 归 `docs/core/design/TOOLS.md`」，而 `thincoder-core/tool-docs/` 实有 `thincoder-core/tool-docs/git.md` ∥ `thincoder-core/tool-docs/ssh.md`，§6.69 勘察行亦引「依据 thincoder-core/tool-docs/ssh.md」；同表头「11 个工具描述档」随之偏少 |
| 15 | 🟡 | 新 | §3 表 `shared.mjs` 行「本批加 `PROJECT_PARAM_DESC` 一条常量 + 导出」与本节 2026-11-05 子弹「本批各为净负（…删一条常量导出、改一句描述）」互刺——同一「本批」指两批 |
| 16 | 🟡 | 新 | 12-10 现盘断言与设计说法不符：`test/RTM.md` 12-10 尾句「同一把工具在写型与只读型上答案不同」，§9 却写「12-10 现行断言已改为「审批面判只读」，仍在册」，受影响文件表无 12-10 改动 |

计数：🔴 0 · 🟡 3（均不挡） · 🔵 0；轮 1 的 13 条全部已修。

VERDICT: pass

## §4 用户批准（主 agent）

## 用户批准

- **原话一**：「这个是不是该再紧急一点啊 已经影响到我用了」（2026-11-05 04:07）——本批的发起缘由：`git` 因台账无在途行被门拒，工作提交不了。
- **原话二**：「可以，都评审吧，自动跑完」（02:59）· **「自动跑完」（04:33）**——整批令，覆盖本批的评审发起、修正轮、实施与收口。
- **原话三（11-03 裁定，本批的依据面）**：「写门命令面 = 甲」——`bash` ∥ `execute` 必须带在途号，`git` 不在豁免讨论内；本批把 `git` **整把**移出要号集，与之同向（不是放宽命令面）。

**批准范围**：`git` 整把退出写门入口集（13 → 12 把）· schema 删 `ledger` ∥ `project` 两格 · 描述档三处逐字删 · 提示词面同拍 · 集成 12-9 翻面 ∥ 12-10 改写 ∥ 12-11 删 · 需求档 §13.8 ⑥ 改「任何 action 都不要号」。

**批准内不含**：`bash` ∥ `execute` 的号要求不变（那是 11-03 裁定的另一面）· 不加任何替代门槛（提交信息靠纪律，不另设机检）· `thincoder-desktop/dist-r3` ∥ `dist-r4` 打包产物不重建。

## §5 实施记录（eng-coder）
**状态行**：实施完成（9/9 单测 · 14/14 集成 · doc_check PASS · 终态 clean）



**交付摘要** · 覆盖账 = #2058 · 实施席 = eng-coder · 2026-11-05

- 本批 = `git` **整把退出写门入口集**（十三把 ⇒ 十二把）。改的是成员资格：写型 action 不要号、`path` ∥ `workdir` 不再参与取根、`ledger` ∥ `project` 两格从 schema 删。
- 判据本体一字未动（笔-账绑定、四情形拒文、判序、面判、`depth` 与模式守卫）。依据 docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md「写型 action 不要号」。
- 教学面同拍：`git` 工具描述三处逐字删；提示词落地块与设计档围栏块逐行相等（13 行零差异）。

**改动逐档**（行数读法 = `readFileSync(p,'utf8').split(/\r?\n/).length`，末行空行计入）

| 档 | 改动 | 行数（改后 ∥ 改前） |
|---|---|---|
| `thincoder-core/agent/write-gate.mjs` | 入口集删 `"git"`；`ledgerGateApplies` 的 `git` 分支、`ledgerGateTargets` 的 `git` 取根支、`readonlyActionOf` import（连其两行注释）三处零消费派生件删；头注释与集注释随判据改 | 515 ∥ 522 |
| `thincoder-core/tools/git.mjs` | 删 `ledger` ∥ `project` 两格与两个 import；`isReadonlyAction` 钩子本体零改，只改它注释里的消费面（写门那个消费者退场、审批面留下） | 426 ∥ 429 |
| `thincoder-core/tools/shared.mjs` | 删零消费的 `LEDGER_PARAM_DESC_GIT` 导出；`PROJECT_PARAM_DESC` 句内摘 `git`（五把 ⇒ 四把） | 494 ∥ 497 |
| `thincoder-core/tool-docs/git.md` | 三处逐字删：`ledger` 行 ∥ `project` 行 ∥「Read-only actions do not need it: …」句 | 31 |
| `thincoder-core/prompts/persona-engineering.md` | 两行：`Reach` 射程行删 `git`；`Action decides` 只留 `manifest`（与设计档 §6.69 围栏块整行相等） | 485 |
| `test/integration/batch-live-batch-lock.test.mjs` | 12-9 结果列翻面、12-10 改写（标题 + 断言串）、12-11 用例删、档头注记收正 | 401 ∥ 415 |
| `test/RTM.md` | 12-9 ∥ 12-10 改写、12-11 行删、故事 12 节注十五态 ⇒ 十四态 | 425 |
| `docs/batches/2026-11-05-git-exempt-write-gate.test.mjs` | 本批单测档（随批删） | 186 |
| `thincoder-core/agent/dispatch.mjs` | **越单改动（已上报，非静默）**：165-167 那条注释原写「入口集 = 十三把（… + `git` + …）；`git` 只对写型 action 要号」，改为十二把并写明 `git` 不在集内；行为零变 | 284 |

**验收对照**（逐条读数）

| 条目 | 读数 | 结论 |
|---|---|---|
| R-G1 | 台账无在途行：`git add` + `commit` 经 `executeToolCalls` 成功、`git log` 出现该 message、`git status` 照跑；白盒 `"git"` 字面 = 0、`readonlyActionOf` 已不在该档 | ✅ |
| R-G2 | 同会话 `write` 缺号 ⇒ 拒（`no ledger number on this call`）、文件零改；`bash` 缺项目 ⇒ 拒（`no project on this call`）、命令零执行，带项目缺号 ⇒ 拒；`execute` 缺 `workdir`/`project` ⇒ 拒（stub 零执行）；`ssh` `get` 缺号 ⇒ 拒 ∥ `put` 缺号 ⇒ 放行 | ✅ |
| R-G3 | `git` schema 无 `ledger` ∥ `project` 两键；描述档三处逐字不在；`PROJECT_PARAM_DESC` 句内无 `git`；`shared.mjs` 已无 `LEDGER_PARAM_DESC_GIT` | ✅ |
| R-G4 | `readonlyActionOf`：`commit` ⇒ `false` · `status` ⇒ `true` · `checkpoint:list` ⇒ `true` · `checkpoint:rewind` ⇒ `false`；`isReadonlyAction` 仍在该档 | ✅ |
| R-G5 | `node --test test/integration/batch-live-batch-lock.test.mjs` 14 例全绿；12-10 行含「名单只判审批，与写门无关」、不含「写型与只读型上答案不同」；12-11 行与应用例均已删；节注 = 十四态 | ✅（「套件行数 = 109」一项见下「设计漂移」） |
| R-G6 | 落地块与设计档围栏块 13 行零差异；设计档全档「十三份」∥「九 + 四」各 0；射程枚举十二把各 1、`git` 0；需求档 §13.8 ⑥ 含「`git` **任何 action 都不要号**」 | ✅ |

**跑过的读数**

- `node --test docs/batches/2026-11-05-git-exempt-write-gate.test.mjs` ⇒ `tests 9 / pass 9 / fail 0`
- `node --test test/integration/batch-live-batch-lock.test.mjs` ⇒ `tests 14 / pass 14 / fail 0`
- 相邻面回归：`ssh-file-transfer`（2/2）· `ssh-device-readability`（3/3）· `batch-gates-reanchor`（8/8）全绿
- `node --check` 六档改动的 `.mjs` 全 OK
- `doc_check(mode:"gate", docs:["test/RTM.md", "thincoder-core/tool-docs/git.md", "docs/core/design/PROMPT-SYSTEM.md", "docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md"])` 首行 `DOC-CHECK GATE: PASS`（范围 4 档，0 段有问题）

**设计漂移（本席实量，交父侧裁定；本席不改设计档、不改 §2）**

- 「套件行数 = 109」（§2 R-G5）在本仓量不出来：`test/RTM.md` 实量 = **120** 行用例行（正则 `^\|\s*\d+-\w+\s*\|`，改前 121；量法同处）。纯数字编号行另有 118 行（排除 `11-4a` ∥ `11-4b`）——两种量法都不到 110，故「110 ⇒ 109」这对读数与盘面对不上，与本批 §1 那三个行数读数同一类问题。
- §2 受影响文件表把 `readonlyActionOf` 记作 `git.mjs` 要删的第三个 import——实读该档没有这个 import（它在 `write-gate.mjs`），`git.mjs` 实删两个。结果与设计意图一致，只是表里那句多算了一个。
- `docs/core/design/TOOLS.md` 仍写「该函数对未列工具回落逐字 `return true`（`git` / `manifest` / `memory` 各一分支之后）」——本批删掉 `git` 分支后这句不再成立（设计档笔域，本席不改）。

**审计与评审轮 · 终态**

- 自审（内部 explore 分歧审计，只读）：结论「无分歧」；两行 🔵 均指向 `dispatch.mjs` 注释这一笔越单改动（已上报、非静默）。
- 内部代码评审（advisor · code）：`VERDICT: pass`（🔴 0 / 🟡 4 / 🔵 4）。四条 🟡 = 设计档 §9 旧块自相矛盾 · `docs/core/design/TOOLS.md` 跨档滞后 · `write-gate.mjs` 515 行越软线（承接批在册）· 本段当时为空；四条 🔵 = 单测标题与断言不符 · 单测把设计档围栏块行数写死 · 12-10 标题承诺多于断言 · R-G5 缺量法。
- 收正（同轮，本席笔域内三条）：单测标题改「带双引号的 `"git"` 字面 = 0」；围栏块改判首末行（不再写死 13 行）；12-10 标题改「名单只判审批，与写门无关」。三条 🟡 属他席笔域或在册裁定，随交付上抛。
- 终态 = `clean`：收正后重跑，两侧测试仍 9/9 ∥ 14/14 全绿，`doc_check` 门仍 `PASS`。

**上抛**

- 【待裁】无。
- 【知会】三条设计漂移见上节；`test/RTM.md` 的「套件 = 109」需父侧实量后裁定（§2 与设计档的笔在父侧 / 设计席）。

## §6 验证与收口（父代理）

## 验证与收口（父侧 · 2026-11-05 04:40）

### 父侧亲自复核的读数（机器量，非读数转述）

| 项 | 量法 | 结果 |
|---|---|---|
| `"git"` 字面残留 | 读 `thincoder-core/agent/write-gate.mjs` 数串 | **0** |
| 入口集规模 | 解 `LEDGER_ENTRY_TOOLS` 的 `new Set([...])` | **12 成员**，含 `ssh` |
| `readonlyActionOf` | 同一档数串 | **0**（import 已删；`git show HEAD` 核过改前只有这**一个**相关 import） |
| `git` schema 两格 | 读 `thincoder-core/tools/git.mjs` | `"ledger"` = 0 ∥ `"project"` = 0 ∥ `LEDGER_PARAM_DESC_GIT` = 0 |
| 描述档三处 | 读 `thincoder-core/tool-docs/git.md` | `ledger` 行 = 0 ∥ `project` 行 = 0 ∥ `Read-only actions do not need it` = 0 |
| `shared.mjs` | 读该档 | `LEDGER_PARAM_DESC_GIT` = 0；`PROJECT_PARAM_DESC` 段内无 `git` |
| 提示词两行 | 读 `thincoder-core/prompts/persona-engineering.md` | `Reach` 行无 `git` ∥ `Action decides` 行无 `git` |
| RTM 12-9 ∥ 12-10 | 读 `test/RTM.md` | 旧断言「写型与只读型上答案不同」= **0**；新断言「名单只判审批，与写门无关」= **1**；`12-11` 行已无；节注「十四态」在位 |
| 套件行数 | 正则 `^\|\s*\d+-\w+\s*\|` 数用例行 | **120**（改前 121）；故事 12 自身 = **14 行** |
| 全量集成 | `node test/run.mjs` | **139 / pass 139 / fail 0**（exit 0，24.6 s）；其中 `12-9` ∥ `12-10` 已是新断言 |

### 本批交付对账

- **R-G1** `git` 整把出写门：入口集 12 把、两个分支与一个 import 已删、`"git"` 字面归零。
- **R-G2** 反向控制：写盘七件缺号仍拒、`bash` ∥ `execute` 仍要号、`ssh` 按 action 分判（`get` 要号 ∥ `put` 不要）——集成 `12-1`…`12-8` ∥ `12-12`…`12-15` 全绿。
- **R-G3** 教学面与 schema 同拍：`thincoder-core/tool-docs/git.md` 三处 ∥ `thincoder-core/tools/shared.mjs` 导出 ∥ 两处提示词 ∥ `docs/core/design/PROMPT-SYSTEM.md` §6.69 十四处。
- **R-G4** 只读名单零改：`isReadonlyAction` 钩子本体一字未动。
- **R-G5** 集成面：12-9 翻面 ∥ 12-10 改写 ∥ 12-11 删 ∥ 节注十四态 ∥ 套件 121 → 120。
- **R-G6** 三向一致：需求档 §13.8 ⑥「`git` **任何 action 都不要号**」= 设计档 = 提示词面。

### 需求层那一处是本轮真正的收获

评审轮 1 的 🔴：设计改了、提示词改了、工具档改了、**需求档还写着「`git` 只读 action 不要号」**（反读即写动作要号）。**父侧当轮改毕**，并由此写进 D11。**这条不是设计的漏，是「改了不说那层」的现成标本。**

### 未做项（如实登记）

- `thincoder-desktop/dist-r3` ∥ `dist-r4` 打包产物未重建（与本批无关）。
- `docs/core/design/TOOLS.md` 的其余旧读数未全量清理——本批只收了与 `git` 出集相关的两处。

### 集成测试面

本批改动有运行面（写门判据、schema、描述档），故**有**单测档：`docs/batches/2026-11-05-git-exempt-write-gate.test.mjs`（9 例，随批删）。
集成集：现有 36 档 / RTM 120 用例行；本批**改 2 例（12-9 ∥ 12-10）、删 1 例（12-11）**，无新增。
父侧收口跑 = `node test/run.mjs` → **139/139 绿**。

### 台账

`#2058` → 已核销（父侧本轮落）。
