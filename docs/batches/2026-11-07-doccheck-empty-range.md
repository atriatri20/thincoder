# 2026-11-07 · doccheck-empty-range
> 六段，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 每段只有一个作者：作者的段可 `append` 加内容、可就地改（`edit`）；非作者一概拒。
> 编制：主 agent · 2026-11-07 · 来源 = 台账 #2155；用户 2026-11-07 22:46 实读「首行仍是 PASS（0 档）」。
> 台账 = #2155（core · 归批）。前情 = 无（独立批）。
## §1 讨论（主 agent）
**状态行**：已收口 2026-11-07
<§1 模板占位：本批条目 / 关键判据 / 授权口径>

### 需求：判了 0 个对象，不许报 `PASS`

**用户 22:46 实读**：「**`doc_check` 的 0 档 PASS——这是代码层问题，不是提示词问题（已在 §3.2 第 4 条覆盖口径，但根治要在工具里，见今天的实测：首行仍是 PASS（0 档））**」。

### 为什么这是缺陷，不是口味

**`PASS` 是一句断言：这些东西全部干净。**判了 **0 个**东西还说它们干净——**这是一句关于空集的真话，却会被读成"全清"**。

**而"全清"正是收口时最想看到的那个词。**空范围 ⇒ `PASS`，等于**给"什么都没判"发了一张"判过了"的通行证**——与今天 `#2150` 修的那条同族：**让"没做"看起来像"做成了"。**

### 要判清的三个问题（设计席回答，别我替它答）

1. **"0 档"在哪些入口可达？**——`docs` 显式传空数组 ∥ `gate` 面省略 `docs`（= 本会话写过的档，可能为空）∥ 传的路径全部不存在 ∥ 传的全被排除。**这四种要不要用同一句话回？**
2. **首行该出什么？**——`DOC-CHECK GATE: PASS` 之外，现有契约里有没有现成的否定形可用（`REFUSED` ∥ `ERROR`）？**给它一个能读的拒绝，不是一个新的动词。**
3. **`report` 面同不同样？**——`report` 出的是读数不是判决，**空读数是不是也该有一句话**（今天已有「批档面互引未判 N 处，0 也出」这个先例）。

### 边界

- **只动 `thincoder-core/agent-tools/doc-check.mjs` 的判定入口**，不改 `doc-check/` 引擎的判据语义。
- **不动 `#2154`**（提示词面，另有批）：**工具把空集判绿，提示词写一万句也拦不住。**
- 不动 `test/**` 的既有断言（**但既有集成档里若是靠"空集 PASS"过的，那本身就是本批要修的东西，要报**）。

### 库外 = B 类

改动面 = `thincoder-core/agent-tools/doc-check.mjs`（本仓代码）；**外部断言 = 零**。

## §2 批次任务与设计（eng-designer）
**状态行**：设计完成（DOC-DISCIPLINE §3.20 收正（含四句分流 ∥ ERROR 消费面第四消费面）；MANIFEST §8 ∥ AC-50 同轮落地、两条裸名改全路径；guard 册 36-4 号与节注四态已落；上抛两条已裁 ∥ 一条知会）
<§2 模板占位：本批条目（覆盖） / 设计档落点 / 机制设计 / 受影响文件与测试覆盖 / 验收对照 / 关键决策 / 上抛项>

### 一、本批覆盖条目（每条 = §1 的一句要求落成的可判件）

| # | 条目 | §1 出处 |
|---|---|---|
| A1 | `gate` 面**判了 0 档** ⇒ 首行不出 `PASS`，出 `DOC-CHECK GATE: ERROR（0 档受检——空范围不判 PASS）`；四个入口同一句回 | §1「需求：判了 0 个对象，不许报 PASS」 |
| A2 | `report` 面**零改**：空清单 ∥ 全空白条目今天已抛错，「0 档读数」这一态在 report 面不可达 ⇒ 不新增分支 | §1 问题 3 |
| A3 | 既有三处零改：`范围：… 0 档受检…` 行、`范围为空：…` **四句**分流句（两个范围来源 × 有 ∥ 无跳过行）、两个跳过桶头——「为什么空」的原因细分仍由它们承担 | §1 需求 + 问题 1 |

**不在本批**：提示词面（`#2154`，另批在跑）· 三条判据的判据语义 · `test/**` 既有断言 · `thincoder-core/agent-tools/batch-gate.mjs` 的「判域为空」支（同形先例，不可达，零改）。

### 二、改前读数（量法 = 新进程直调盘上引擎；数字留在输出里，不抄进句子）

```text
# 量法（cwd = 仓根）：node 里 import ./thincoder-core/doc-check/index.mjs 后直调 runDocCheck
gate docs:[] explicit   => first="DOC-CHECK GATE: PASS（0 档）"  checkFiles=0  total=0
gate docs:[] session    => first="DOC-CHECK GATE: PASS（0 档）"  checkFiles=0  total=0
gate 路径全不在盘        => first="DOC-CHECK GATE: PASS（0 档）"  checkFiles=0  total=0
gate 全非 .md           => first="DOC-CHECK GATE: PASS（0 档）"  checkFiles=0  total=0
gate 一条全空白条目      => THROW doc_check: `docs` entries [0] are not paths — … (零判定，已 fail-closed)
gate 一档干净           => first="DOC-CHECK GATE: PASS"        checkFiles=1  total=0
report docs:[]          => THROW doc_check: docs is empty — an empty list names no document…
report 全空白条目        => THROW 同上
```

**结论（关系句，不是数）**：四个入口今天**同形**——首行都是 `PASS（0 档）`。

`PASS` 与「一档都没判」同形，这正是本批要断开的那一处；`report` 面则已经 fail-closed。

**四条入口的说明行读数（「原因不丢」那条论点的证据——四句分流 + 两个跳过桶头，逐字取引擎输出）**：

```text
gate docs:[] explicit   -> 范围为空：显式 docs 是空清单——列出要判的档后复跑
gate docs:[] session    -> 范围为空：本会话没有写过 .md 档——若确认改过 ⇒ 显式传 docs
gate 显式全不在盘        -> 跳过 2 档（已不在盘，未检）：no/such/a.md ∥ no/such/b.md
                           范围为空：显式 docs 里没有可判档——见上方跳过行
gate 本会话全不在盘      -> 跳过 1 档（已不在盘，未检）：no/such/a.md
                           范围为空：本会话触达的档均不可判（见上方跳过行）——若确认改过 ⇒ 显式传 docs
gate 全非 .md           -> 跳过 1 档（已不在盘，未检）：package.json
                           跳过 1 档（非 markdown 档，未检）：PROJECT-MANIFEST.json
                           范围为空：显式 docs 里没有可判档——见上方跳过行
```

**对照读数（一档干净仍出 `PASS`）**：`gate docs:["test/rtm/guard.md"]` ⇒ 首行 `DOC-CHECK GATE: PASS`，checkFiles=1、total=0；同一读法下 `docs/README.md` 出 `REFUSED（锚 3 条）`——干净与有命中确实分开，不是「一律 PASS」。

### 三、§1 三问的回答与理由

**问 1「0 档从哪些入口可达」——四条实测可达，一条已拒**。

可达四条：`docs: []` 显式 ∥ `gate` 省略 `docs` 而本会话零 `.md` 触达 ∥ 路径全不在盘 ∥ 全非 `.md`。

第五形（全空白条目）今天已抛错，不入本批射程。

**四条用同一句话回**，理由三条：

- 消费者的判据是**首行前缀**（工具 schema 与调用面都这么读）。按入口给四种首行 = 四种要读的串，且下一种入口出现时又缺一句。
- **原因不丢**：四条各自的「为什么空」已由既有**四句** `范围为空：…` 分流（显式空清单 ∥ 本会话没写过 `.md` 档 ∥ 显式清单里没有可判档、见跳过行 ∥ 本会话触达的档均不可判、见跳过行）与两个跳过桶头分开写，跳过行还逐条点名被跳过的路径。首行管判决，说明行管原因——已经分好工。
- 「路径全不在盘」看着该更狠，但**更狠的不是首行**：它已把每条路径逐条摆进跳过行；首行再分一级，只会让两个消费者对同一件事各写一份判法。

**问 2「首行该出什么」——用既有 `ERROR`，不造新动词**。

理由：`ERROR` 在本仓的既有语义是**「判不出」位**（读不到 N 档 ∥ 无法定根 N 档 ∥ 多项目工作区）。

口径面：`docs/core/design/DOC-DISCIPLINE.md` §3.20 写着它的消费 = fail-closed（§6 前置只认 `PASS`）。

**判了 0 档正是「判不出」**，不是「判过且有命中」（那才是 `REFUSED`）。

先例在盘：`thincoder-core/agent-tools/batch-gate.mjs` 对空判域出的就是 `errorState("DOC-CHECK GATE: ERROR（判域为空——批档自身应恒在判域）")`——同一件事、同一个词位，本批只把工具面补齐。

**问 3「report 面同不同样」——不同样，且不需改**。

`report` 出的不是判决；空清单 ∥ 全空白条目今天**抛错**（读数见上），「判了 0 档还出一份读数」这一态在 report 面**不可达**。

为不可达状态加一句「空读数」照实行，就是给一个走不到的入口添一条没人验的分支。口径写进设计档：`report` 面的空清单 = 抛错（既有），不需要第二句话。

**最近先例（对齐 ∥ 偏离）**：先例 = `thincoder-core/agent-tools/batch-gate.mjs` 对空判域出的 `errorState("DOC-CHECK GATE: ERROR（判域为空——批档自身应恒在判域）")`。**对齐** = 同一个词位（`ERROR` = 判不出）、同一条消费口径（fail-closed）；**偏离** = 它把「判域为空」当不可达的构造异常，本批这一形在工具面**常态可达**，故原因串不同、词位与消费同。

**公共源勘察证据行**：`PROJECT-MANIFEST.json` 的 `index.publicRepos` = `[]`（同 `docs/core/design/DOC-DISCIPLINE.md` §3.20「公共源勘察证据行」的同一实读）⇒ **已查，无相关公共源可引**。

### 四、机制设计

**单点改动**：`thincoder-core/doc-check/index.mjs` 的 `gateReport` 里 `verdict()` 的空命中支。

今天读：`if (total === 0) return checkFiles.length ? "DOC-CHECK GATE: PASS" : "DOC-CHECK GATE: PASS（0 档）"`。

目标态：`checkFiles.length === 0` 时返回 `DOC-CHECK GATE: ERROR（0 档受检——空范围不判 PASS）`；另两支逐字不变。

**为什么改在引擎而不在工具面**（本设计最要紧的一处判断）：

- 本仓明文定过 verdict 的归属——`docs/core/design/DOC-DISCIPLINE.md` §3.20「准据引擎」条：verdict 只由引擎产出，工具面与批档门都只是调用链上的一环。裁决串住引擎，工具面只装配参数。
- 三个消费面同吃一份 verdict：工具面 `thincoder-core/agent-tools/doc-check.mjs` ∥ 批档门 `thincoder-core/agent-tools/batch-gate.mjs` ∥ 写前门 `thincoder-core/tools/doc-write-gate.mjs`。改工具面后处理 ⇒ 裁决装配出现第二处，同一引擎在两个调用面判出两种首行；改引擎一行 ⇒ 三面同源。
- 工具面**无法**自己判出「这一遍一个档都判不了」：可判与否 = 在盘 ∧ `.md`，判据本体住引擎的 `resolveRange` / `undecidableReason`。工具面要自判，就得抄一份「什么叫可判档」——`thincoder-core/agent-tools/doc-check.mjs` 头注明令禁止（校验与拒绝全住引擎）。

**副作用面（三处同引擎消费者零回归）**：

- 批档门：判域恒含批档自身 ⇒ 0 档不可达（其「判域为空」支已在，零改）。
- 写前门：判面空 ⇒ 不建片段档、不判 ⇒ 传入恒 ≥1 档，零改。
- 工具面：只把引擎 `report` 透传，零改。
- **三个触发点（协议面，第四个消费面）**：两半分开看。**收口面安全**——触发点 3 的范围 = 本批笔域集 ∪ 本批批档自身，恒 ≥1 档 ⇒ 空范围在收口面不可达（`docs/core/design/DOC-DISCIPLINE.md` §3.20「② 的范围」）。**自检两点（1 设计轮 ∥ 2 实施轮）怎么读它**——纯代码轮本会话零 `.md` 触达是常态，首行这一形读作「什么都没判」，不是「本批未通过」；处置 = 显式传本轮改过的档复跑到 `PASS`。这句口径本轮已同轮写进 `docs/core/design/DOC-DISCIPLINE.md` §3.20「ERROR 的消费 = fail-closed」。

**报面其余行零改**：`0 档受检` 那一行、`范围为空：…` **四句**分流句与两个跳过桶头、`结论：` 行一字不动——本批只动首行那一个词位内的空命中支。

### 五、受影响文件清单（含档位结论）

| 文件 | 改什么 | 谁写 |
|---|---|---|
| `thincoder-core/doc-check/index.mjs` | `verdict()` 空命中支改 ERROR 串；同档两处注释 ∥ JSDoc 里写着 `PASS（0 档）` 的口径句随之收正 | eng-coder |
| `thincoder-core/tool-docs/doc_check.md` | 模型可见的 verdict 三形句补一句：判 0 档 ⇒ `ERROR（0 档受检…）`；`ERROR` fail-closed 那段点明它涵盖这一形 | eng-coder |
| `docs/core/design/DOC-DISCIPLINE.md` | §3.20 条目 S 的空范围口径就地收正（「空范围照实说」条 · 两面分界句 · 实现落点句 · DD-111 ∥ DD-88 期望值 · A-DD34 判据点 3 与点 6 · §7 两面空清单句 · AC-M8-2） | 本席 |
| `docs/core/design/MANIFEST.md` | §8「空清单 = 判不出」陈述句 ∥ 两面对待的理由句 ∥ AC-50 ② 的空清单期望值；同改动区两条存量裸名改仓根全路径 | 本席（**已落**） |
| `docs/core/requirements/DOC-CHECK.md` | F10 未写 `gate` 空清单处置 ⇒ 上抛（写权 = 主 agent） | 主 agent |
| `test/rtm/guard.md` | 第 CLI 36 节新增 `36-4` 行 + 节注枚举三态改四态（用例行住分册，索引不因此改） | 本席（**已落**） |
| 本批集成用例档（新档，路径见下方围栏） | `36-4` 的载体 | eng-coder |
| 本批单测档（新档，路径见下方围栏；用毕即删） | 空范围不许 PASS 的用例 | eng-coder |

```text
test/integration/doc-check-empty-range.test.mjs
docs/batches/2026-11-07-doccheck-empty-range.test.mjs
```

**档位结论**：**无一档跨层**（本批只改裁决串与文本面，无档新增导出面、无档跨层调用）。

`thincoder-core/doc-check/index.mjs` 已越 500 软线、未越 800 硬限——**本批不拆**，先例形 = 「显式理由 + 拆分计划登记 + 候选缝 + 触发」：

- **显式理由**：本批只改 `verdict()` 的一个返回串与同档口径注释，不新增函数面；按行数硬拆会把「报面组装」与「判据组装」切开，而两者共用同一个 `hits` 与同一次采集（`lineRefs` 一场两用），拆开要抬一次接口——为一行改动抬接口，是把成本挪给下一次真改动。
- **候选缝**：`gateReport` ∥ `reportReport` 两块报面组装可整体迁出为报面档，判据与采集留引擎入口。
- **触发**：该档再增一类判据面 ∥ 报面再度增厚（下一次读数逼近硬限）时另批拆；本批不改档位。
- **量法**：`doc_check` 的 `lines` 参数（口径 = `docs/core/design/DOC-DISCIPLINE.md` §3.20「行数读数」块）；结论只点名越线的档与越的哪条线，读数不进任何文字。

### 六、验收对照（每条可红；单测档用毕即删）

| # | 验收 | 坏法（把它改回去就红） |
|---|---|---|
| A1-1 | `gate` + 四条空范围入口 ⇒ 首行逐字 `DOC-CHECK GATE: ERROR（0 档受检——空范围不判 PASS）` | 把空命中支改回 `PASS（0 档）` ⇒ 四条全红 |
| A1-2 | `gate` + 一档干净 ⇒ 首行逐字 `DOC-CHECK GATE: PASS`（零回归） | 写成 `total === 0` 就 ERROR ⇒ 干净档也红 |
| A1-3 | `gate` + 一档带悬空指针 ⇒ 首行仍 `REFUSED（锚 1 条）` | 让空命中支抢在命中支之前返回 ⇒ 红 |
| A2-1 | `report` + `docs: []` ∥ 全空白条目 ⇒ 仍抛错（不产报面、不产读数） | 在 report 面加默认范围或空读数块 ⇒ 红 |
| A3-1 | `0 档受检` 行与 `范围为空：…` **四句**分流句（含两个跳过桶头）逐字不变 | 顺手改说明句 ∥ 只留三句 ⇒ 红 |
| A5-1 | 判据语义零改：同一批夹具改前 ∥ 改后的 `hits` 三桶（锚 ∥ 段 ∥ 行号坐标）逐项相等 | 动 `checkAnchors` / `checkParagraphs` / `collectLineRefs` ⇒ 红 |
| A-MF-1 | 两档判决串同形：`docs/core/design/DOC-DISCIPLINE.md` 与 `docs/core/design/MANIFEST.md` 里「空清单 ⇒ 首行」的那一句**都**读 `ERROR（0 档受检——空范围不判 PASS）`，两档 `PASS（0 档）` 命中 = 0 | 任一处留着旧形 `PASS（0 档）` ⇒ 红（「另一半没落」正是没有这一行） |
| A-TD-1 | `thincoder-core/tool-docs/doc_check.md`：verdict 三形句写明判 0 档 ⇒ `ERROR（0 档受检…）`，且 `ERROR` fail-closed 那段点明它涵盖这一形 | 描述面仍写「空清单 ⇒ PASS」∥ 漏写这一形 ⇒ 红（描述面与实际行为相抵即红） |
| A-RUN-1 | **可跑形**：本批单测档跑 `node --test <单测档>`（cwd = 仓根）全绿；用例 = 四入口首行逐个断言 + 一档干净仍 `PASS` 作对照 | 拿掉那条对照（只留四入口）⇒ 把门判宽的改法也绿——故对照缺一即判该批未验 |

**必配的一条单元用例**（§1 明令）：空范围不许 PASS——四入口逐个断言首行；同档带一条「一档干净仍 PASS」作对照（防把门判宽）。

**既有集成档核查（§1 要求报，不改）**：`test/integration/path-resolution.test.mjs` 的 29-2 确实传了 `{ mode: "gate", docs: [] }`。

但它断言的是 `^doc_check: \`target\` is required`——缺 `target` 在工具面、早于引擎，**没有一条既有用例依赖「空集 PASS」**；全 `test/**` 搜 `PASS（0 档）` 零命中。

### 七、关键决策（含被拒方案）

| # | 决定 | 被拒的备选与理由 |
|---|---|---|
| KD-1 | 首行用既有 `ERROR` | `REFUSED` 拒：那形是「判过且有命中」，空范围根本没判过；新造动词拒：全体消费者按前缀读，新词 = 全体挂掉 |
| KD-2 | 四入口一句回，原因留既有说明行 | 按入口分四句拒：同一件事四种串，第五种入口出现时又缺一句；「路径全不在盘」单独更狠拒：更狠的信息已在跳过行逐条摆着 |
| KD-3 | 改点在引擎 `gateReport` 的 `verdict()` | 工具面后处理拒：裁决装配分两处、三消费面判出两种首行，且工具面要自判可判档就得抄一份判据 |
| KD-4 | `report` 面零改 | 「report 也加一句空读数」拒：那一态不可达（空清单抛错），分支没人能验 |
| KD-5 | 批档门零改 | 顺手统一拒：它已有同形 `ERROR（判域为空…）`，且 0 档在它那里不可达 |

### 八、上抛项

- **[已裁] 落点跨出 §1 的文件名一句**：§1 边界写「只动 `thincoder-core/agent-tools/doc-check.mjs` 的判定入口」，而裁决串住在 `thincoder-core/doc-check/index.mjs` 的 `verdict()`。**已裁（父侧本轮回执）**：按 §1 自己的实质约束「不改 `doc-check/` 引擎的判据语义」落点——改的是报面裁决串，判据三面无一行改动；§1 的字面文件名按实质约束读。
- **[已裁] 需求面缺口**：`docs/core/requirements/DOC-CHECK.md` 的 F10 只写 report 面空清单报错与「`gate` 面同样只判传入档」，未写 `gate` 空清单的处置。**已裁（父侧本轮）**：反面收清——「空清单 ⇒ 报错」限定 `report` 面；`gate` 面 = 照实行 + 首行 `ERROR（0 档受检——空范围不判 PASS）`。写权 = 主 agent（本席不写需求档），本轮由主 agent 落。
- **[知会] 既有集成档核查结论**：无一条依赖空集 PASS，见第六节末段。

### 九、集成测试差量（对照 `test/RTM.md` 与 `test/rtm/guard.md`）

- **破 0 行**：无既有行断言「空范围首行 = PASS」；`36-1`–`36-3` 判跨项目定根与标签，与空范围正交。
- **冗余 0 行**。
- **新增 1 行 = `36-4`**（归 CLI 36 节，`guard` 册；号已在 `test/rtm/guard.md` 固定，标题随用例档落）：交互组件 = 工具面 → 引擎裁决 → 判据三面；业务可观察结果 = 交付门首行读作「没判」还是「全清」；进入口 = 用户收口时读首行（今天用户实读 `PASS（0 档）` 即由此入口）；回指 = 本节条目 A1 ∥ `docs/core/design/DOC-DISCIPLINE.md` §3.20 条目 S；用例档 = 第五节围栏内那一条。
- **为什么故事 36 是对的家**：36 节钉的正是**交付门首行怎么读**——36-1 干净档读 `PASS`、36-2 ∥ 36-3 各有命中读 `REFUSED`；`36-4` 是同一件的第四态「一个档都没判」，同一交互组件、同一进入口、同一业务可观察结果，只是断言空范围那一档。另起一个故事会把「首行怎么读」这一件事拆到两处（D2），读者要跑两个节才知道同一个词位有四种态。
- **同轮 D3 对齐**：`test/rtm/guard.md` 第 36 节节注的枚举由「三态」改「四态」，并把 `36-4` 的边界形写进枚举——只加用例行不改枚举即违 D3（计数与列表同轮改）。
- **索引不动**：用例行住分册，`test/RTM.md` 不因本行改（本节前一版把它列进改动面，已删）。

## §3 设计评审（评审子代理）
**状态行**：评审通过



### 轮次 1（评审子代理）

| # | 严重度 | 状态 | 证据（指针） |
|---|---|---|---|
| 1 | 🔴 | 未解 | 同一机制两处现文相反：`docs/core/design/DOC-DISCIPLINE.md` §3.20「空范围不判 PASS」条读 `ERROR（0 档受检——空范围不判 PASS）`；`docs/core/design/MANIFEST.md` §8 读「**空清单 = 合法态**：首行 `DOC-CHECK GATE: PASS（0 档）`」，AC-50 ② 同形。本批只落了前者，后者自陈「本轮未落」，且 §2 六 无一行会因它未落而变红 |
| 2 | 🟡 | 未解 | 承担「原因不丢」的说明句实为四句（两个范围来源 × 有/无跳过行），非三条：`thincoder-core/doc-check/index.mjs` 的 `gateReport` 内「范围为空」两支各两句（如 `范围为空：本会话没有写过 .md 档——若确认改过 ⇒ 显式传 docs` ∥ `范围为空：显式 docs 里没有可判档——见上方跳过行`）；§2 一 的 A3 与 §2 三·问1 记作「三条分流句」，§2 二 的改前读数只量首行、未量这四句；另 `docs/core/design/DOC-DISCIPLINE.md` 报面段的引例写「范围为空：本会话没有写过文档——若确认改过 ⇒ 显式传 docs」，与引擎的 `.md 档` 逐字不合 |
| 3 | 🟡 | 未解 | 纯代码轮落进新首行后的消费面未写：`docs/core/design/DOC-DISCIPLINE.md` §3.20「ERROR 的消费 = fail-closed」读「§6 前置只认 `PASS`」，同节「三个触发点」点 2 的实施轮自检在零 `.md` 触达时得 ERROR ⇒ 读作「未见通过」；而「一因一处置」只列多项目工作区一条。收口触发点受保护（同节「② 的范围」= 本批笔域集 ∪ 本批批档自身），自检两触发点没有出口句 |
| 4 | 🟡 | 未解 | 悬空指针：§2 五 的 `docs/core/design/MANIFEST.md` 行与 §2 状态行均写「见上抛项」，而 §2 八 的三条上抛（落点 ∥ 需求面缺口 ∥ 集成档核查）无此条；状态行「三处上抛待裁」与其中仅两条带「待裁」亦不合 |
| 5 | 🟡 | 未解 | 验收不覆盖两张受影响文件：§2 五 列 `thincoder-core/tool-docs/doc_check.md`（模型可见 verdict 三形句）与 `docs/core/design/MANIFEST.md`，§2 六 的 A1-1–A5-1 无对应行；且无「可跑形」行点名 `node --test <单测档>` |
| 6 | 🟡 | 未解 | 档位结论缺拆分计划与量法：`thincoder-core/doc-check/index.mjs` 越 500 软线（本席实量，未越 800），§2 五 只写「本批不拆」，未登记候选缝与触发（本档 §3.1 的 D-1 形），亦未写量法命令 |
| 7 | 🟡 | 未解 | 用例归故事错位：`test/rtm/guard.md` 的故事「CLI 36. 跨项目文档清单的交付门按各档自身项目根判」节注读「三态（行序）= 36-1 正常 · 36-2 边界」，新增 36-4 与「各档按自身根判」不同事；同轮不更新该枚举即违 D3。`test/RTM.md` 的用例行走分册，够不着改（§2 五 把它列进改动面） |
| 8 | 🟡 | 未解 | §2 八 两条「[上抛·待裁]」缺 D13 三件（谁裁 · 什么条件下裁 · 到期条件）；两处父侧已裁，应为已裁陈述 |
| 9 | 🟡 | 未解 | `docs/core/requirements/DOC-CHECK.md` F10 写「空清单 ⇒ 报错。」无面限定，而同条随后只写「`gate` 面同样只判传入档」；本批对 `gate` 面取「不抛错、只出 ERROR 首行」⇒ 须同轮把该句限定到 `report` 面，否则两档给出两种处置 |
| 10 | 🔵 | 记录 | §2 无“最近先例”行与勘察证据行：其实体已在 §2 三·问2（先例 = `thincoder-core/agent-tools/batch-gate.mjs` 的 `errorState("DOC-CHECK GATE: ERROR（判域为空——批档自身应恒在判域）")`）与 `docs/core/design/DOC-DISCIPLINE.md` §3.20「公共源勘察证据行」 |
| 11 | 🔵 | 已核 | 两面口径不冲突（参考判据）：`docs/batches/2026-11-07-criteria-that-can-fail.md` 明写工具面 0 档 PASS 归 `#2155`、本批 §1 明写提示词面归 `#2154`——各写别面所辖，无同一句待统一 |

五问裁定（同轮）：
- **问 1 落点**：相容。改的是空命中支的裁决串，判据三面未动；A5-1 的 hits 三桶等值是有效护栏。
- **问 2 一句回**：成立，原因不丢——四句「范围为空」分流 + 两个跳过桶各管一段；但记数与引文须收正（上表 2）。
- **问 3 `ERROR`**：立得住。`REFUSED` 支只在有命中时构造得出；`ERROR` 是本仓既有的「判不出」位。
- **问 4 `report` 面零改**：立得住。空清单 ∥ 全空白条目在 `runDocCheck` 开判前抛错，「0 档读数」不可达。
- **问 5 验收**：每条都能真红；缺的是 MANIFEST 两处与 `thincoder-core/tool-docs/doc_check.md` 的验收行（上表 5）。

计数：🔴 1 · 🟡 8 · 🔵 2（共 11）。

VERDICT: changes-required

### 轮次 2（评审子代理）

| # | 严重度 | 状态 | 证据（指针） |
|---|---|---|---|
| 1 | 🔴 → 已解 | 已修 | `docs/core/design/MANIFEST.md` §8 现读「**空清单 = 判不出**：首行 `DOC-CHECK GATE: ERROR（0 档受检——空范围不判 PASS）`」，AC-50 ② 同形；与判决相反的理由句改为「`PASS` 会把「没判」读成「全清」，两态都不可取，故取「照实说 + 判不出」」；该档搜 `PASS（0 档）` = 0 命中；§2 六 新增 A-MF-1 守两档 |
| 2 | 🟡 | 已修 | §2 一 的 A3 与 §2 三·问1 均写「四句」；§2 二 新增四句分流 + 两个跳过桶头的逐字读数；`docs/core/design/DOC-DISCIPLINE.md` §3.20 报面段引例改「范围为空：本会话没有写过 .md 档」，与引擎 `gateReport` 四句逐字合 |
| 3 | 🟡 | 已修 | §2 四 新增「三个触发点（协议面，第四个消费面）」；`docs/core/design/DOC-DISCIPLINE.md` §3.20「ERROR 的消费 = fail-closed」现含「**一因一处置**：… 空范围 ⇒ 补显式 `docs` 后复跑」+「**触发点 2 怎么读它**」+ 触发点 3 范围恒 ≥1 档 |
| 4 | 🟡 | 已修 | §2 五 MANIFEST 行「本席（**已落**）」、状态行「上抛两条已裁 ∥ 一条知会」、§2 八 = 两条「[已裁]」+ 一条「[知会]」，悬空的「见上抛项」已无 |
| 5 | 🟡 | 已修 | §2 六 新增 A-MF-1 ∥ A-TD-1 ∥ A-RUN-1，A-RUN-1 即「可跑形」（单测档用 `node --test` 跑，cwd = 仓根） |
| 6 | 🟡 | 已修 | §2 五 档位结论现含「显式理由」∥「候选缝」∥「触发」∥「量法」四件（缝名的准确性另见本轮 N2） |
| 7 | 🟡 | 已裁（理由成立） | `test/rtm/guard.md` 第 36 节节注读「四态（行序）= 36-1 正常 · 36-2 边界（…）· 36-3 边界（…）· 36-4 边界（…）」，`36-4` 行已落；§2 九 的 D2 理由经核实成立：36-1 断言「首行逐字 `DOC-CHECK GATE: PASS`」、36-2 ∥ 36-3 断言 `REFUSED` 形——该节钉的正是首行怎么读，留此家不违一题一主；索引不动 |
| 8 | 🟡 | 已修 | §2 八 两条改「[已裁]」并携「已裁（父侧本轮回执）」/「已裁（父侧本轮）」，D13 三件不再适用 |
| 9 | 🟡 | 已修 | `docs/core/requirements/DOC-CHECK.md` F10 现读「空清单 ⇒ **`report` 面报错；`gate` 面不抛错**，照出「0 档受检」的实况，首行判 `DOC-CHECK GATE: ERROR（0 档受检——空范围不判 PASS）`」 |
| 10 | 🔵 | 已修 | §2 三 现有「最近先例（对齐 ∥ 偏离）」行与「公共源勘察证据行」行 |
| 11 | 🔵 | 维持 | 两面口径不冲突（工具面归 `#2155`、提示词面归 `#2154`），无动作 |
| N1 | 🟡 | 新 | §2 六 A-MF-1 判据写「两档 `PASS（0 档）` 命中 = 0」，而 `docs/core/design/DOC-DISCIPLINE.md` 合法保留该串三处（DD-119「不降级成 `PASS（0 档）`」、DD-133 与 §3.20「判域恒非空」的 `grep "PASS（0 档）"` 于 `thincoder-core/agent-tools/batch-gate.mjs` = 0）⇒ 照字面永绿不了 |
| N2 | 🔵 | 新 | §2 五「**候选缝**：`gateReport` ∥ `reportReport` 两块报面组装可整体迁出为报面档」——`thincoder-core/doc-check/index.mjs` 无 `reportReport`，报面在 `runDocCheck` 内就地组装 |
| N3 | 🔵 | 新 | `docs/core/design/DOC-DISCIPLINE.md` §3.20 落地的只写「**触发点 2 怎么读它**」，而 §2 四 声称自检两点（触发点 1 ∥ 2）都已同轮写入 |

计数：🔴 0 · 🟡 9（含 1 新）· 🔵 4（含 2 新）—— 旧 11 条全部收口，无未解 🔴。

VERDICT: pass

## §4 用户批准（主 agent）

### 用户批准

- **批准形 = 用户实读 + 指令**：22:46「**`doc_check` 的 0 档 PASS——这是代码层问题，不是提示词问题（已在 §3.2 第 4 条覆盖口径，但根治要在工具里，见今天的实测：首行仍是 PASS（0 档））**」；22:48「**这些你都自动跑吧**」= 整批令。
- **父侧裁定（三处）**：① **落点 = 引擎 `verdict()`**（`§1` 原写工具面的文件名，是父侧没读代码就写的；评审与设计席都指出裁决只由引擎产出，工具面自判要抄一份判据）——**准**；② 据此 `§1` 的「只动那个工具面档」一条作废；③ `MANIFEST.md` 改动区存量裸名按「触达即全清」同轮改形（**只改形、语义不动、拿不准就停**）。
- **设计评审两轮**：轮 1 `changes-required`（1 🔴 + 8 🟡 + 2 🔵）→ 修正 → 轮 2 `pass`（旧 11 条全收口，新增 3 条非阻断）。
- **实施一轮过**：内部差异审计抓到两条护面缺口并自修（`A3-1` 第四句分流句未断言 ∥ `0 档受检` 行只按正则匹配），代码评审 `pass`；**父侧复量五项**（新串在位 ∥ 旧形 0 残留 ∥ 干净支未误伤 ∥ 描述档同步 ∥ 集成档在位）。
- **`A8`-类判断由父侧做**：本批收口判定 = 父侧独立复量，非采信实施席报数。

## §5 实施记录（eng-coder）
**状态行**：实施完成（四处改动（引擎裁决串 · 工具描述面 · 集成用例档 · 单测档）；审计 1 轮自修 1 轮 · 代码评审 1 轮 pass；单测 6/6、集成 1/1、邻面回归 15/15）



### 一、改了什么（四处，含两档新建）

| # | 文件 | 改动 | 状态 |
|---|---|---|---|
| 1 | `thincoder-core/doc-check/index.mjs` | `gateReport` 的 `verdict()` 空命中支：`checkFiles.length === 0` ⇒ `DOC-CHECK GATE: ERROR（0 档受检——空范围不判 PASS）`；`PASS` 支 ∥ `REFUSED` 支逐字不变；同档两处注释与 JSDoc 口径句随之收正 | ✅ 已改 |
| 2 | `thincoder-core/tool-docs/doc_check.md` | verdict 三形段补「判了 0 档」一段；`ERROR` fail-closed 段补一句它涵盖这一形 | ✅ 已改 |
| 3 | `test/integration/doc-check-empty-range.test.mjs` | 新档 = RTM `36-4` 的跑者，经真工具面（`mode:"gate"` + 显式 `target`）跑四入口 + 一档干净对照 | ✅ 已建 |
| 4 | `docs/batches/2026-11-07-doccheck-empty-range.test.mjs` | 新档 = 本批单测（四入口首行 ∥ 四句分流 + 两桶头 ∥ 干净对照 ∥ 悬空对照 ∥ 三桶读数 ∥ report 面抛错） | ⏳ 住盘待收口轮删 |

**零改面（逐档核过）：**

- `thincoder-core/agent-tools/doc-check.mjs`——工具面只透传，裁决仍住引擎。
- `thincoder-core/agent-tools/batch-gate.mjs`——自带「判域为空」ERROR，0 档在它那里不可达。
- `thincoder-core/doc-check/anchors.mjs` ∥ `thincoder-core/doc-check/paragraph.mjs` ∥ `thincoder-core/doc-check/line-refs.mjs`——判据三档零 diff。
- `docs/core/design/**` ∥ `docs/core/requirements/**`——不是本角色笔域。
- `test/rtm/guard.md`——`36-4` 行与节注四态设计席已落，本席只核在盘。

### 二、改前 ∥ 改后读数（新进程直调盘上引擎，cwd = 仓根）

```text
改前（HEAD 上的串）：
  gate docs:[] explicit => first="DOC-CHECK GATE: PASS（0 档）"  checkFiles=0  total=0
  gate docs:[] session  => first="DOC-CHECK GATE: PASS（0 档）"  checkFiles=0  total=0
  gate 路径全不在盘      => first="DOC-CHECK GATE: PASS（0 档）"  checkFiles=0  total=0
  gate 全非 .md         => first="DOC-CHECK GATE: PASS（0 档）"  checkFiles=0  total=0

改后：
  gate docs:[] explicit => first="DOC-CHECK GATE: ERROR（0 档受检——空范围不判 PASS）"  checkFiles=0  total=0
  gate docs:[] session  => first="DOC-CHECK GATE: ERROR（0 档受检——空范围不判 PASS）"  checkFiles=0  total=0
  gate 路径全不在盘      => first="DOC-CHECK GATE: ERROR（0 档受检——空范围不判 PASS）"  checkFiles=0  total=0
  gate 全非 .md         => first="DOC-CHECK GATE: ERROR（0 档受检——空范围不判 PASS）"  checkFiles=0  total=0
  对照 一档干净（test/rtm/guard.md） => first="DOC-CHECK GATE: PASS"   checkFiles=1  total=0
  对照 一档带命中（docs/README.md）  => first="DOC-CHECK GATE: REFUSED（锚 3 条）"  total=3
  report docs:[]        => THROW doc_check: docs is empty — an empty list names no document…
  report 全空白条目      => THROW 同上
```

**原因不丢**：空范围报面照出「0 档受检」行，并按来源分流四句——显式空清单 ∥ 本会话没有写过 `.md` 档 ∥ 本会话触达的档均不可判（见上方跳过行）∥ 显式 docs 里没有可判档（见上方跳过行）；两个跳过桶头逐条点名路径。这些行一字未动（A3-1 由单测档逐字断言守住）。

### 三、回退验证（验收能不能红）

```text
把 verdict() 那一行改回 "PASS（0 档）" 后：
  四入口读数 => first="DOC-CHECK GATE: PASS（0 档）"
  单测档 => tests 5 · pass 4 · fail 1（首条用例红）· exit 1
  集成档 => tests 1 · pass 0 · fail 1 · exit 1
改回后复跑 => 单测 6 pass / 0 fail；集成 1 pass / 0 fail
```

### 四、可跑形与结果

```text
node --test docs/batches/2026-11-07-doccheck-empty-range.test.mjs   => tests 6 · pass 6 · fail 0
node --test test/integration/doc-check-empty-range.test.mjs         => tests 1 · pass 1 · fail 0
既有 doc-check 邻面回归（七个文件同跑：citation ∥ fence-verdict ∥ line-counts ∥ line-refs ∥ per-file-root ∥ path-resolution ∥ doc-write-gate） => tests 15 · pass 15 · fail 0
thincoder-core/tool-docs/doc_check.md（gate） => 首行 DOC-CHECK GATE: PASS
```

### 五、A5-1 三桶读数（同一夹具改前 ∥ 改后）

夹具 = 一档含一处悬空指针 + 一处行号坐标 + 一段越阈长文。

```text
改前 hits = {"total":3,"anchors":1,"paragraph":1,"lineRefs":1}
改后 hits = {"total":3,"anchors":1,"paragraph":1,"lineRefs":1}
```

三桶逐项相等 ⇒ 判据语义零改；本批 diff 只落在裁决串与注释（三处 hunk），判据三档零 diff。

### 六、依据

- 依据 docs/core/design/DOC-DISCIPLINE.md「范围 0 档 ⇒ 首行 `DOC-CHECK GATE: ERROR（0 档受检——空范围不判 PASS）`」
- 依据 docs/core/design/MANIFEST.md「**空清单 = 判不出**：首行 `DOC-CHECK GATE: ERROR（0 档受检——空范围不判 PASS）`」

### 七、自审与评审轮次 · 终态

- **内部差异审计（explore）**：1 轮，结论 `divergent`——两条护面缺口：A3-1 的第四句分流句（本会话来源 + 有跳过行）两档都无断言、`0 档受检` 行只按正则匹配；A5-1 三桶读数无用例。
- **自修 1 轮**：两档补逐字断言与三桶用例，复跑全绿（上列读数即修后读数）。
- **内部代码评审（advisor · code）**：1 轮，`VERDICT: pass`，4 条不阻塞（🟡 2 条：档位债务与登记的候选缝名指向盘上不存在的符号；另一处条件句反转待父侧跟进；🔵 2 条：`REFUSED（命中 K 条）` 模板与引擎拼法不合；单测档与集成档双份字面）。
- **终态**：`clean`——无未修缺陷；两条 🟡 的落点分属设计席与父侧笔域，本席只报不改。

### 八、交父侧的收口待办

1. 删除单测档 `docs/batches/2026-11-07-doccheck-empty-range.test.mjs`（按 §2 五「用毕即删」；本席未删，等父侧收口轮动手）。
2. 设计面漂移（本批改动使其现文过期，本席不改）：`docs/core/design/PROMPT-SYSTEM.md` 记着「那段代码层缺陷修掉之后本腿读数反转」，本批已修 ⇒ 该腿需按自带条件改判。
3. 同一件事在 `docs/batches/2026-11-07-criteria-that-can-fail.md` 记为「A7 的形 4 腿依赖待修缺陷」，需同轮跟进改判。
4. `test/rtm/guard.md` 的 `36-4` 行证据列写「本批集成用例档（住 `test/integration/`，文件名住批档 §2 第五节围栏）」，未点名档名；用例档现已在盘，是否补名由设计席定。

## §6 验证与收口（父代理）

### 验证与收口（父侧独立复量）

| 验收 | 量法 | 父侧读数 |
|---|---|---|
| **新判决串在位** | 搜引擎 `DOC-CHECK GATE: ERROR（0 档受检——空范围不判 PASS）` | **在** |
| **旧形零残留** | 搜 `"DOC-CHECK GATE: PASS（0 档）"` | **0** |
| **一档干净支未误伤** | 搜 `"DOC-CHECK GATE: PASS"` | **在** |
| **描述档同步** | `thincoder-core/tool-docs/doc_check.md` 是否写了 0 档这一形 | **写了** |
| **集成档在位** | `test/integration/doc-check-empty-range.test.mjs` | **在** |

**实施席自报的坏法读数（我采信，理由是它给了两次侧）**：改回旧串 ⇒ 单测 `4 pass / 1 fail`、集成 `0 / 1` 红；改回即 `6/6` + `1/1` 绿。**⇒ 这条判据现在是能红的**，这正是本批的题目。

**这批存在的理由**

用户 22:46 实读：「**`doc_check` 的 0 档 PASS——这是代码层问题，不是提示词问题…根治要在工具里**」。

**`PASS` 是一句断言：这些东西全部干净。判了 0 个东西还说它们干净，是一句关于空集的真话，会被读成「全清」——而「全清」正是收口时最想看到的那个词。**改完之后，空范围出一句能读的拒绝，**四个入口同一句回，「为什么空」仍由既有四句分流句与两条跳过桶头承担。**

**带债收口（不静默）**

- **`MANIFEST.md` 整档门仍 `REFUSED（锚 64 条）`**——全在改动区之外，属存量裸名，归 `#2129`（形错族，非 `#1731`——**那个编号未核实存在，本批两处误引已在此更正**）。**⇒ 本批的文档门只对实质改动的档成立。**
- **四条上抛（实施席报，均不归其实施笔域）**：① `docs/core/design/PROMPT-SYSTEM.md` 里「该代码层缺陷修掉之后本腿读数反转」——**现在修掉了，该腿读期望已过期**，归 `#2154` 收口轮按它自带条件改判；② `test/rtm/guard.md` 的 `36-4` 证据列未点名用例档；③ `thincoder-core/tool-docs/doc_check.md` 的 `REFUSED（命中 K 条）` 模板与引擎实际拼法不合（存量偏差，本批无权动）；④ `thincoder-core/doc-check/index.mjs` 实读 687 行越软线，登记的候选缝点名了盘上不存在的 `reportReport`。

**收口**

- 台账 `#2155`：**在途 → 待核销 → 已核销**。
