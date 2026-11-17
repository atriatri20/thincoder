# 2026-11-10 · manifest-gate-open
> 六段，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 每段只有一个作者：作者的段可 `append` 加内容、可就地改（`edit`）；非作者一概拒。
> 编制：主 agent · 2026-11-10 · 来源 = 用户 2026-11-10 04:24「我希望都放开」。
> 台账 = #2269（core · 归批）。前情 = 无（独立批）。
## §1 讨论（主 agent）
**状态行**：已收口 2026-11-10
<§1 模板占位：本批条目 / 关键判据 / 授权口径>

## 讨论与路由（主 agent）

### 来源与授权

- **用户提问（原话）**：「**manifest工具在工程模式下要立了帐才能用吗？**」
- **用户裁定（原话）**：「**我希望都放开。**」（2026-11-10 04:24）——对象 = `manifest` 的 `read` ∥ `init` ∥ `write` **三个动作全部免在途号**。
- **父侧对范围的解释（须用户确认或纠正）**：「都」= 三个动作，**不是**「有条件地免」；**`bash` ∥ `execute` ∥ 写盘七件不动**——用户 2026-11-03 的裁定是另一个面（命令面），本批无新口径。

### 库内 = 已查

- `manifest({action:"read", target})` **实测免号可用**（父侧 2026-11-10 04:24 亲跑，返回 `state=ok` 全文）。
- 现态规则：`read` 免号 · `init` 仅「目标在已有项目内」要号 · `write` 要号。
- 设计席核实单源：`docs/core/design/` 下**无 `WRITE-GATE` 那份档**；真单源 = `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` §2.3（写锁·笔-账绑定），跨仓适用面 = `docs/core/design/CROSS-REPO-WRITE.md` §2.2。
- 代码坐标（设计席本轮实读）：`write-gate-ledger.mjs` 的 `LEDGER_ENTRY_TOOLS` ∥ `MANIFEST_WRITE_ACTIONS = new Set(["init","write"])` ∥ `ledgerGateApplies`；`thincoder-core/agent-tools/manifest.mjs` 的 `ledger:` ∥ `project:` 两格。

### 库外 = B 类

`库外 = B 类：改动面 = 写门判定 ⧺ 两份设计档 ⧺ 提示词面规格档 + 工具描述；外部断言 = 零`（不新增依赖、不调外部 API、不对第三方行为下结论）。

### 已定决定

- **已定决定**：`manifest` 整把退出写门（`read` ∥ `init` ∥ `write` 全免号）· 用户原话：「我希望都放开。」· 时间：2026-11-10 04:24
- **已定决定**（父侧的判据方向，设计席已改写）：判据不是「改的东西有没有读者」，而是**依赖方向**——本门**自己要读** `PROJECT-MANIFEST.json`（取根 ∥ 读 `index.writableRepos`）⇒ 把写这份档也放门后即构成环（档缺失建不出项目、档坏修不回来）。`init` 的「取根豁免」是给这个环打的补丁，本批整条退场。· 时间：2026-11-10 04:30

### 父侧一处判断被设计席否定（记档）

父侧给的理由是「`manifest` 改项目自身状态、不产出可追责的交付 ⇒ 没有读者」。设计席否掉：**这条分不开 `memory`**（project 层笔记同样算不上被核的交付），而 `memory` 并没有环。⇒ **改用依赖方向**。**父侧采纳其判据。**

### 本批不做什么（边界）

- **不动 `bash` ∥ `execute` ∥ 写盘七件**——用户 2026-11-03 的裁定仍有效，本批无新口径。
- **不做「给了号就校验」的半步**：`manifest` 从此**不问号**，给错号也放行。
- 不新建设计档：真单源是既有两份。

## §2 批次任务与设计（eng-designer）
**状态行**：设计完成
<§2 模板占位：本批条目（覆盖） / 设计档落点 / 机制设计 / 受影响文件与测试覆盖 / 验收对照 / 关键决策 / 上抛项>

**本批条目（覆盖）**

一条：`manifest` 工具的 `read` ∥ `init` ∥ `write` **三个动作全部免在途号**——从此不问「替哪条账」。

来源 = 用户 2026-11-10 04:24「我希望都放开」。「都」指三动作，不是「init 免了、write 还留着」，也不是「有条件地免」。

这是**放宽**，不是收紧：任何条件形都不落——不做「给了号就校验」，也不做「免号但仍要 `project` 声明」。

**设计档落点（核过哪几份、为什么选这份）**

- 本单声明的设计档名在 `docs/core/design/` 下**不存在**（`ls` 读数无该档）。全仓 `grep WRITE-GATE` 只命中 `docs/README.md` 的一行书目，指的是需求层的 `docs/core/requirements/ENGINEERING-MODE-V2-SPEC-WRITE-GATE.md`。
- **单源判定**：机制本体住 `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` §2.3（标题即「写锁（笔-账绑定）」）。入口集清单、逐工具问法、拒文表、判序、验收行、用例行、决策全在这一节。
- 跨仓那段住 `docs/core/design/CROSS-REPO-WRITE.md` §2.2，与其 §3 ∥ §5 ∥ §6：它把 `manifest` 的 `target` 写进了「适用面」。
- **需求层不是落点**：`docs/core/requirements/ENGINEERING-MODE-V2-SPEC-WRITE-GATE.md` 的 AC-M4-4 说的是「台账 / manifest 非主 agent 写不了」。那是**写者身份闸**（工具体内的 `writer: "main"`），与本条「要不要在途号」是两件事，本批不动它。
- `docs/core/design/MANIFEST.md` 也不是落点：它讲档结构与取根，逐行核过 `manifest` 的出现处，没有一句说这个工具要号。
- **没有新建第二份档**：写进上面两份设计档的原有位置，旧陈述就地删。

**机制设计**

- **入口集减一把**：`manifest` 整把移出写锁入口集。`ledger` ∥ `project` 两格从该工具 schema 删（名字只为被读的地方存在——同 `git` 出集时的口径）。`init` 那格「取根豁免」整条随之退场：它是给循环依赖打的补丁，只堵了 `init` 一半。
- **为什么这把能免**：写锁要读两样东西——目标项目的 `PROJECT-MANIFEST.json`（取根）与写方 `index.writableRepos`（跨仓判序）。
- 把写这份档也放在门后，等于要求「先把它写成门要的样子，才准写它」。档缺失 ⇒ `init` 建不出项目；档坏 ⇒ 修不回来（读不出 ⇒ 写权表不可判 ⇒ 拒），而那正是最需要写它的时刻。
- **为什么七件不能免**：写盘七件 ∥ `bash` ∥ `execute` ∥ `memory` ∥ `ssh` 写的字节，门从不读来判自己 ⇒ 没有这个环 ⇒ 判据零改。用户 2026-11-03「命令面必须带号」仍然有效。
- **父侧另一条理由没有采用**：「改的东西有没有读者」分不开 `memory`——project 层笔记同样算不上要被人核的交付，按那条判也该出集，而 `memory` 没有环。机制判据取「门要不要求它服从自己的判据」，取的是依赖方向。
- **代价（认下）**：工程模式下改 `docRoot` ∥ `phase` ∥ `index` 的那一笔不再记在台账行上。改的事实由三处持：`writer: "main"` 身份闸、git 提交、批档。不新造替代门槛。

**受影响文件与测试覆盖**

设计档（本轮已改完）：

- `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md`：§2.3 的入口集、扫描表、声明面、schema 面、拒文表 + 新增「整把退场的六处」清单与「带号与不带同判」条 + 最近先例一行；§2.3.1 的「这一格不做什么」条（`manifest` 一支退场）与「界线」条的回落句；§3 受影响文件四行（档位结论两处读数句同步）；§4 决策 39 改写 + 新增决策 44；§5 的 R2 ⑫ ∥ R30 ∥ R33 ∥ R34；§6 用例行；§9 故事 12 的 12-15 行与其 delta；§1 ∥ §2.3.1 的仓外声明源读数统一。
- `docs/core/design/CROSS-REPO-WRITE.md`：§1 适用面、§2.2 适用面条（`fallbackDeclared` 只对 `execute`）与判序 ④（`init` 豁免 → 不可达）、KD-X11、AC-5（12-15 那格随 `init` 豁免退场）、T18 ∥ T19 退场、RTM delta。
- `docs/core/design/PROMPT-SYSTEM.md`（第 2 轮落）：新增 §6.94 收本把的教法面与描述面；§6.69 三处计数（参数描述 ∥ 工具描述 ∥ A2）、A6 块行数、A9 题眼句条数就地收正，`init` 条件豁免与 `manifest` 档收尾两条引文退场——那两句在盘上已不存在；§6.80 用例 C8 与它的 `fallbackDeclared` 依据行按出集后的口径重写（C8 只剩 `execute` 一形，依据拆成两条带名条目）。

实施轮（产品面，本席不碰）：

- `thincoder-core/agent/write-gate-ledger.mjs`：逐处清单 = `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` §2.3「整把退场的六处」——入口集删名 · `MANIFEST_WRITE_ACTIONS` 整条删 · `ledgerGateApplies` 支删 · `ledgerGateTargets` 支删 · 档头句只留 `memory` · 跨仓判序 ④ 不可达（编号不重排）；档头讲 `init` 豁免与入口集计数的注释同步。
- `thincoder-core/agent-tools/manifest.mjs`：`parameters.properties` 删 `ledger` ∥ `project` 两格与对应 import 名。
- `thincoder-core/tools/shared.mjs`：`LEDGER_PARAM_DESC_MANIFEST` 零消费 ⇒ 删（决策 32 的口径）。
- `thincoder-core/tool-docs/manifest.md`：删 `ledger` ∥ `project` 两行——描述面是模型真正读到的那一面，留着就是教旧口径。
- `thincoder-core/prompts/persona-engineering.md`：The write gate 块里 `execute` ∥ `manifest` 那句只留 `execute`（本门不再判这把）——本轮实扫提示词面 17 档，受本门判的只此一行；射程行不在盘，本批不新建它。逐字目标形 = `docs/core/design/PROMPT-SYSTEM.md` §6.94 落点 A。

测试面：

- 批单元测试档（落批档目录、与本批同名，收口删）——三条红格见下「验收对照」。
- RTM 现有行 `test/rtm/guard.md` 故事 12 的 12-15 改写（编号不变）；用例档 `test/integration/batch-live-batch-lock.test.mjs` 随之改。套件不增行。

档位结论：**无跨界**——改动面是设计档文字与四个产品档的删行/改行，无新增文件、无模块合并。

**验收对照（判据正文住设计档，此处只指）**

| # | 判据 | 读哪一节 |
|---|---|---|
| 1 | 无在途行时 `manifest({action:"write", …})` 不带项目不带号 ⇒ **落盘成功**，`PROJECT-MANIFEST.json` 可读回新值 | `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` §5 的 R2 ⑫ |
| 2 | 同一时刻 `write` ∥ `edit` 一份文档不带号 ⇒ **仍拒**（含 `no ledger number on this call`）——证明只开了这一口 | 同上 R2 ⑫；用例格 = §6 的 `manifest` 写型行 |
| 3 | 带一个已从 schema 删的 `ledger` 与不带同判（未声明的键没有一处读它——该工具 `execute` 只取 `action` ∥ `target` ∥ `key` ∥ `value`）；判据不取「真能落盘」：那测的是运行时对未声明键的处置，不是本门 | 同上 R2 ⑫ |
| 4 | `init` ∥ `read` 同样照跑；`tool-docs/manifest.md` 无 `ledger` ∥ `project` 两行，且该工具 schema 无这两键，且 `LEDGER_PARAM_DESC_MANIFEST` 已无 | 同上 R33 |
| 5 | `bash` ∥ `execute` ∥ `memory` ∥ 写盘七件的号判据零改（不在本批放宽范围） | 同上 R2 ⑩ ∥ ⑬、R30 |

**关键决策**

- **决策 44 · `manifest` 不进写门**（`docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` §4）：理由 = 门自身的输入面；边界 = 只此一把；被拒的替代三条（只免 `init`、免号但仍要 `project`、「给了就校验」）逐条写在决策里。
- **整把出集，不做条件形**：三动作同判、无效号不校验。用户口径是「不问号」；半个判据拦不住任何真实的误写，只让下一个人以为这里还在判。

**上抛项**

① **[知会] §6.69 的围栏与盘上现文不一致**（本轮实读）：`thincoder-core/prompts/persona-engineering.md` 的 The write gate 块现文里没有 §6.69 围栏中的射程行，也没有 `manifest` 那两条 bullet——后续批次改过措辞。⇒ 本批的提示词面改动面因此只有一行（`execute` ∥ `manifest` 那句），射程行不在盘、本批不新建它。这是一个面级事实，改法与依据住 `docs/core/design/PROMPT-SYSTEM.md` §6.94「上抛项 1」。

② **[知会] 提示词面已落地**：第 2 轮改了 `docs/core/design/PROMPT-SYSTEM.md`（新增 §6.94 + §6.69 就地收正），与本批两份机制档同数（十一把 ∥ 九 + 二）；描述面两行与提示词面一行已进上面的实施清单。

**本轮读数（2026-11-10 本席实读；两份设计档的「读数住批档 §2」指的就是这一段）**

- **`index.publicRepos`** = `["../.thincoder","../thincoder.com"]`（`PROJECT-MANIFEST.json` 按键名定位）——**非空**，两个目录都在盘。两档原先一处写 `[]`、一处写这张表，本轮统一成本条。
- **三串扫这两个仓**（串 = `writableRepos` ∥ `MANIFEST_WRITE_ACTIONS` ∥ `LEDGER_PARAM_DESC_MANIFEST`）：`.thincoder` 1614 档 0 命中 · `thincoder.com` 13 档 0 命中（`Get-ChildItem -Recurse -File -Include *.md,*.mjs,*.json`，排除 `node_modules` / `.git`）。⇒ 两仓都不是本机制的声明源。
- **修法侧符号名**（实读，只名字不记行号）：`thincoder-core/agent/write-gate-ledger.mjs` 里问「要不要号」的函数是 `ledgerGateApplies`、取目标的是 `ledgerGateTargets`；`manifest` 在两者的分支里各一处。
- **`manifest` 工具的实参面**（实读）：`async execute(args, ctx)` 从头到尾只读 `args.action` ∥ `args.target` ∥ `args.key` ∥ `args.value`；没有一处读 `args.ledger` 或 `args.project`——两格删掉之后，带它们与不带它们对判定没有任何区别。

### 第 3 轮修（评审第 2 轮的两条：11 🔴 · 12 🔵）

- **11（🔴）已改 · 整子格删掉**：`docs/core/design/CROSS-REPO-WRITE.md` §5 AC-15 尾句原为「两子格：`project` 指向在盘但不是项目的目录 ∥ 与会话锚无关键的目录 ⇒ 同一句；`action:"init"` 同一笔 ⇒ 同样拒（⓪ 先于 ④）」，现为「两子格：`project` 指向在盘但不是项目的目录 ∥ 与会话锚无关键的目录 ⇒ 同一句」。
  为什么删而不是改写：这一子格与 AC-15 前两子格讲的不是同一件事（前两格 = 写盘工具带坏 `project`，这一格 = `manifest` 的写型），而 `manifest` 整把不进本门、其 `project` 格也已从 schema 删 ⇒ 没有任何一笔以 `action:"init"` 走到 ⓪，照它写单测就是去期待一个不会发生的拒。也不改成「不进本门」那句话：AC 格里再写一句「什么不判」会被读成判据。
- **12（🔵）已改 · 点明计数面**：`docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` §3 `thincoder-core/tools/shared.mjs` 行原句「——十一处各抄一遍就是同一机制十一份描述，措辞漂移后模型读到十一版规则」，现为「——入口集十一把各一处，不集中就是同一机制的十一份描述，措辞漂移后模型读到十一版规则；`thincoder-vscode/src/tools/shell.mjs` 的 `bash` 副本不在这十一处里——那一把是另一包的独立 schema 副本（非核工具展开），另计」。
  计数面 = **入口集十一把，每把一处**；端副本是另一包的第十二处，另计、不混入这个数。
- **本条读数（2026-11-10 本席实跑；`node` 行扫 `.mjs` 的 `ledger: { type: "string"` 声明行，排除 `thincoder-core/tools/shared.mjs` 的定义行）**：`thincoder-core` 12 处（其中 `agent-tools/manifest.mjs` 一处本批随删 ⇒ 余 11 处，与入口集十一把一一对上）· `thincoder-vscode/src` 1 处（`src/tools/shell.mjs`）。逐档清单在命令输出里，不转录进档。
- **本轮改动面**：只这两份设计档；`docs/core/design/PROMPT-SYSTEM.md` 本轮未动（评审明示）。`doc_check(mode:"gate")` 对这两档 = `PASS`（0 命中）。
- **上抛项：无新增**。上一轮那两条知会仍成立，不需要处置。

### 第 4 轮（D11 清扫 · 同规则的其它层逐处收口）

**来源**：父侧 2026-11-10 派单，据实施席（§5）五条上抛。性质 = **清扫，不是新设计**——机制已由 §2.3「`manifest` 不进写门」（决策 44）与 §6.94 定稿，本轮只把「同一规则的其它层」里仍写着旧口径的句子收正。

**依据（本轮实读 · 2026-11-10）**

- 依据 `thincoder-core/agent/write-gate-ledger.mjs`「`manifest` **不在集内**（2026-11-10 整把出集批 · 决策 44）」——入口集现文逐字 `"bash", "execute", "memory", "ssh",`（写盘七件在其上两行），共十一把。
- 依据 `thincoder-core/tool-docs/manifest.md`「target — the project root or directory you mean; **required** — omitting it is refused.」——参数面只剩 `target` ∥ `key` ∥ `value` 三条，`ledger` ∥ `project` 两行已不在盘。
- 依据 `thincoder-core/prompts/persona-engineering.md`「`execute` with a `workdir` has no such fallback: a target in no project is refused however `project` is set.」——落点 A 的现文只剩 `execute` 一形。
- `MANIFEST_WRITE_ACTIONS` 全仓 `.mjs` 零命中（本席 `grep` 实跑，"`new Set([\"init\", \"write\"])`" 与常量名均无 `.mjs` 命中；余下命中全在批档与设计档的叙述里）。

**逐处收口（父侧五条 + 本席同轮扫出的四处）**

| # | 档 | 改什么（改后逐字要旨） | 为什么 |
|---|---|---|---|
| ① | `docs/core/design/PROMPT-SYSTEM.md` §6.69 勘察证据行·条件形判据 | 原「`MANIFEST_WRITE_ACTIONS` 现仍在盘……删它属实施轮」→「该常量已不在盘：`manifest` 的写型枚举整条退场，本门不再有按它分判的那一支」 | 陈述为假；且「属实施轮」是将来时，实施轮已过 |
| ② | 同档 §6.94 勘察证据行 | 五条 `依据` 全部改指**改后**盘上现文（写型枚举那条改指「`manifest` 不在集内（决策 44）」、入口集那条改指现文四把、`manifest.md` 两条合一条改指 `target` 行、提示词那条改指只剩 `execute` 的现文） | 原引文对象已被删 ⇒ 每条都是指着空处的引文（`doc_check` 判 `引缺`） |
| ③ | `docs/core/design/TOOLS.md` ssh 一节 ② | 入口集十二把 → **十一把**，`manifest` 出集，`git` ∥ `manifest` 并列指向各自己的「不进写门」节 | 计数与成员都旧 |
| ④ | `docs/core/requirements/ENGINEERING-MODE-V2.md` §13.8 ⑥ 与验收句 | ⑥ 尾句原「`manifest` 的 `init` 只在取不到项目根时不进本门……落在既有项目内照判要号」→「**`manifest` 整把不进本门**——三动作一律不要号、不要项目声明」，理由 = 依赖方向（门自己要读 manifest 取根与读 `index.writableRepos`）；验收句删掉 `init` 豁免那半句，只留「没号怎么办」 | 豁免已整条退场；留着即是一条**永远达不到**的验收（需求写的东西已按用户裁定消失） |
| ⑤ | `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` §3 档位表 `write-gate-ledger.mjs` 行 | 「软线内、本批不跨档位」→「**已越 500 软线，且不是本批造成的**：本批只删行 ⇒ 净负、未新增超线原因，拆单义务不因本批新增；切法与承接批照旧」 | 原结论与实读相反；不改则下一批以为这档在软线内 |
| ⑥ | 本席同轮扫出 · `PROMPT-SYSTEM.md` §6.69 入口集与 action 判条 | 原「改动前现盘 = 十三把 ⇒ 本批摘 `git` 后十二把 ⇒ §6.94 再摘 `manifest` 成十一把」的沿革串 → 一句现况：入口集十一把、`git` ∥ `manifest` 都不在集内 | 同一条规则的另一层；且原条带的 `依据` 引文（写型枚举那行）已被删 ⇒ 同属 `引缺` |
| ⑦ | 本席同轮扫出 · 同档 §6.69 公共源勘察行 | `index.publicRepos` = `[]` → `["../.thincoder","../thincoder.com"]` | 读数已在 §2「本轮读数」收正，本档同节仍留 `[]`，同一档里两个相反读数 |
| ⑧ | 本席同轮扫出 · `TOOLS.md` ssh 一节 ② ∥ ③ 的坐标 | 落点档名 `thincoder-core/agent/write-gate.mjs` → `thincoder-core/agent/write-gate-ledger.mjs` | `LEDGER_ENTRY_TOOLS` 与 `ledgerGateApplies` 都不在前者（`grep` 两串在该档零命中）；写锁段早已析出，坐标是行漂留的旧指 |
| ⑨ | 本席同轮扫出 · `docs/core/design/TOOLS.md` §6.28 调研证据行 | 仓外声明源原写 `index.publicRepos: []`「空 ⇒ 无仓外档可查」→ 改成该表的实读值，并把「空 ⇒ 无仓外档」那句结论删掉（不换一句新结论：本节未按其自身判据重扫两仓） | 与 ⑦ 是同一件事的两份相反读数；留着即同一仓两个答案 |

**验收对照（回指设计档 · 只指不抄）**

| # | 判据 | 读哪一处 |
|---|---|---|
| 1 | 用户五条逐条落地 | 上表 ①–⑤ 各行「改后逐字要旨」列，对本档与 `docs/core/design/PROMPT-SYSTEM.md` ∥ `docs/core/design/TOOLS.md` ∥ `docs/core/requirements/ENGINEERING-MODE-V2.md` 对应节 |
| 2 | 引文可核（无 `引缺`） | §6.94 勘察证据行四条的「」引文各是所引档的连续子串（`doc_check` 判读） |
| 3 | 计数一处一源 | `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` §2.3「共十一把」= `PROMPT-SYSTEM.md` §6.69 计数面 = `TOOLS.md` 入口集条 = 代码 `LEDGER_ENTRY_TOOLS` 现文 |
| 4 | 需求档不再要求已退场的东西 | `docs/core/requirements/ENGINEERING-MODE-V2.md` §13.8 ⑥ 尾句与验收句读不到 `init` 豁免 |

**本轮读数（记录面；2026-11-10 本席实跑）**

- `doc_check(mode:"gate")`，范围 = 上述四档：`REFUSED（锚 2 条）`。两条都是**本批改动区之外的既有假阳**，见的「未收口项」第 1 条。
- `thincoder-core/agent/write-gate-ledger.mjs` 行数 = 565（`read` 回执末行 `of 565 lines`）；本轮在其上是净负（六处删行）。读数只此一处成立，档内不写数。

**未收口项（上抛父侧）**

1. **[上抛·待裁] 交付门被两处既有假阳挡住，非本批所致**：`docs/core/design/TOOLS.md` 的 `id_ed25519.pub`（ssh 公钥件名）与 `docs/core/requirements/ENGINEERING-MODE-V2.md` 的 `ledger.db`（台账库件名）——两者都不是文档指针，`doc_check` 按扩展名判成 `档缺`。两行都不在本轮改动区。处置 = 在 `PROJECT-MANIFEST.json` 的 `index.docCheckExemptions` 登记两条（五字段：`file` / `kind`=`档缺` / `text` / `why` / `review`）——该档是本席笔域之外的**项目状态档**，本席未动。
2. **[上抛·知会] `TOOLS.md` ssh 一节「受影响文件与档位结论」表内**，`thincoder-core/agent/write-gate.mjs` 那一行仍写「`LEDGER_ENTRY_TOOLS` += `"ssh"`」。那是该批自己的改动记录（当时符号确实住那一档，行文形式 = 逐批变更表），本席未把它改成今天的档名——改了会让那句不再描述该批做了什么。同节 ② ∥ ③ 的**现况陈述**已按 ⑧ 收正。
3. **[上抛·知会] `thincoder-core/agent/write-gate-ledger.mjs` 已越 500 软线**（读数见上）。设计档 §3 已按实况改写，但**拆单义务已触发**而承接批未在册——本席不能写台账，请父侧当日入账（切法 = `workspaceRoot` ∥ 新拒文常量随写锁段整体迁出，档内已记）。

## §3 设计评审（评审子代理）
**状态行**：评审通过



### 轮次 1（评审子代理）

| # | 级 | 状态 | 证据（指针，不写行号） |
|---|---|---|---|
| 1 | 🔴 | open | `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` §2.3.1「这一格不做什么」条：「`execute` 的 `workdir` ∥ `manifest` 的 `target` **同在本判序内**」；`docs/core/design/CROSS-REPO-WRITE.md` §3 受影响文件：「`ledgerGateTargets` 的 `execute` ∥ `manifest` 两支挂 `fallbackDeclared`」；同档 §2.2 判序 ④：「`action:"init"` 而 `R` 无 ⇒ ④ 照旧豁免」；`docs/core/design/PROMPT-SYSTEM.md` §6.94 证据行：「本节与 §2.3 要的是删它，属实施轮」（`§2.3` 无此落笔） |
| 2 | 🔴 | open | `docs/core/design/CROSS-REPO-WRITE.md` §5 AC-5：「`init` 豁免（12-15，表外那一形）逐条与改前等值」；`docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` §9 manifest 块：「改为断「三动作都照跑 ∧ 同一时刻写文档仍拒 ∧ 号给错照样放行」」；`docs/core/design/PROMPT-SYSTEM.md` §6.80 C8：「落第三形；窄口对这两形不开」 |
| 3 | 🟡 | open | `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` §3 档位表 `thincoder-core/agent-tools/manifest.mjs` 行：「软线内（加 `project` 一行）」 |
| 4 | 🟡 | open | 同档 §3 `thincoder-core/tools/shared.mjs` 行：「十二处各抄一遍就是同一机制十二份描述」＋「`LEDGER_PARAM_DESC` + `_GIT` ∥ `_MANIFEST` ∥ `_MEMORY` 三条后缀」；同档 §5 R33：「已无 `LEDGER_PARAM_DESC_MANIFEST`」 |
| 5 | 🟡 | open | 同档 §5 R2 ⑫：「号给错（不存在 ∥ 已核销）⇒ 照样放行（它不问号，不是「给了就校验」」；`docs/core/design/PROMPT-SYSTEM.md` §6.94 C3：「照样落盘：该把不问号（这一格也已从 schema 删）」 |
| 6 | 🟡 | open | `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` §1 调研证据：「`index.publicRepos` = `[]`（按键名定位」 vs `docs/core/design/PROMPT-SYSTEM.md` §6.94 勘察证据行：「实读 = `["../.thincoder","../thincoder.com"]`」 |
| 7 | 🟡 | open | `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` §3 `thincoder-core/agent/write-gate-ledger.mjs` 行：「净增约 40 行」，与同节「行数读数不落本档」相反 |
| 8 | 🔵 | open | `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` §2.3「`manifest` 不进写门」节无单列最近先例行；最近先例以 §4 决策 37 块合并陈述（该块点名覆盖 44） |
| 9 | 🔵 | pass | 判据选型（依赖方向）经核站得住且分得开：§2.3「不外溢到别的工具」＋决策 44 边界「只此一把」；边界未连带放开：§5 R2 ⑩「`bash` ∥ `execute` 同判」零改；「二号不校验」是真放宽：决策 44 被拒 ③「免号而「给了号就校验」」 |
| 10 | 🔵 | pass | 评审条件降级如实记：无文档地图、无项目标准（判据只取 AGENTS.md）；档位抽查与「提示词面 17 档实扫」在本次评审范围外 ⇒ unverified |

VERDICT: changes-required

counts: 🔴 2 · 🟡 5 · 🔵 3

### 轮次 2（评审子代理）

| # | 级 | 状态 | 证据（指针；不写行号） |
|---|---|---|---|
| 1 | 🔴 | 已修 | `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` §2.3「整把退场的六处」条在盘（六处逐一，含 `MANIFEST_WRITE_ACTIONS` 整条删）；同档 §2.3.1「这一格不做什么」条逐字「`manifest` 的 `target` 不在——该工具整把不进本门」 |
| 2 | 🔴 | 已修 | `docs/core/design/CROSS-REPO-WRITE.md` §5 AC-5 逐字「`manifest` 三动作不属本格——它整把不进本门」；`docs/core/design/PROMPT-SYSTEM.md` §6.80 用例 C8 逐字「`manifest` 不在本格——该把整把不进本门」、依据行逐字「`manifest` 整把不在入口集，本门只剩这一形」 |
| 3 | 🟡 | 已修 | `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` §3 档位表 `thincoder-core/agent-tools/manifest.mjs` 行逐字「删 `ledger` ∥ `project` 两格 + 清 `LEDGER_PARAM_DESC_MANIFEST` 一个 import 名，净负」 |
| 4 | 🟡 | 已修 | 同档 §3 `thincoder-core/tools/shared.mjs` 行逐字「`_MEMORY` 一条后缀——`_GIT` 于 2026-11-05 那批退场、`_MANIFEST` 本批随删」，计数改「十一处」；同档档位表同行已摘掉两个退役后缀 |
| 5 | 🟡 | 已修 | 同档 §2.3 逐字「`ledger` 那格删了之后，带号与不带同判」+「多带一个键既不改变判定、也不被框架拒」；`docs/core/design/PROMPT-SYSTEM.md` §6.94 用例 C3 逐字「与不带逐字同判」 |
| 6 | 🟡 | 已修 | `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` §1 调研证据逐字「`index.publicRepos` = `["../.thincoder","../thincoder.com"]`（2026-11-10 实读，按键名定位）——**非空**」，与 `PROMPT-SYSTEM.md` §6.94 勘察证据行同读 |
| 7 | 🟡 | 已修 | 同档 §3 `thincoder-core/agent/write-gate-ledger.mjs` 行已无预期增量句（只留结论 ∥ 量法 ∥ 触线判据） |
| 8 | 🔵 | 已修 | 同档 §2.3「最近先例」条在盘：`git` 出集 ∥ 决策 32，对齐四项 + 偏离一项 |
| 9 | 🔵 | 维持 | 判据选型（依赖方向）仍站得住；边界条「**不外溢到别的工具**」与决策 44「边界：只此一把」零改 |
| 10 | 🔵 | 维持 | 评审条件降级同前：无文档地图 ∥ 无项目标准档；tier 抽查与提示词面 17 档实扫在评审范围外（unverified） |
| 11 | 🔴 | 新 | `docs/core/design/CROSS-REPO-WRITE.md` §5 AC-15 第三子格逐字「`action:"init"` 同一笔 ⇒ 同样拒（⓪ 先于 ④）」，与同档 §2.2 判序 ④ 逐字「⇒ **不可达**：`manifest` 整把不进本门」相反 |
| 12 | 🔵 | 新 | `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` §3 逐字「十一处各抄一遍就是同一机制十一份描述」，与同档 §3「端自持的 `bash` 是独立 schema 副本」一句并列时，计数面未说明是否含端副本（unverified） |

覆盖判读（本轮重点项）：原需求「二号不校验 ⇒ 传给错号也放行」仍被断言覆盖（§5 R2 ⑫ ∥ §9 的 12-15 ∥ §6.94 用例 C3 各逐字「带一个已从 schema 删的 `ledger` 与不带同判」）⇒ 不是覆盖降级。

VERDICT: changes-required

counts: 🔴 未决 1（第 11 条）· 🟡 未决 0 · 🔵 2；上轮 1–8 条经实读核修为已修，第 9 ∥ 10 条维持。

### 轮次 3（评审子代理）

| # | 严重度 | 状态 | 证据 |
|---|---|---|---|
| 11 | 🔴 已消解 | 关闭 | `CROSS-REPO-WRITE.md` §5 AC-15 末句逐字「两子格：`project` 指向在盘但不是项目的目录 ∥ 与会话锚无关键的目录 ⇒ 同一句」——第三子格不在盘，无删线、无注释、无「原为」残句；`action:"init"` 在该档只剩两处且都写不可达：§2.2 判序 ④「**不可达**」与「`action:"init"` 那支已退场」，与 `BATCH-LEDGER-REVIEW-UNIFY.md` §2.3「`manifest` 不进写门」⑥「**不可达**」同口径；主格（路径不存在）+ 两子格（在盘非项目 ∥ 与锚无关）= 拒文表 ①②③ 逐支覆盖，同一句、句意完整 |
| 12 | 🔵 建议 | 未消解（不阻断） | `BATCH-LEDGER-REVIEW-UNIFY.md` §3 受影响文件表 `thincoder-core/tools/shared.mjs` 行已写计数面：「入口集十一把各一处」∧ 端副本「不在这十一处里——那一把是另一包的独立 schema 副本（非核工具展开），另计」；11 = §2.3「共十一把」的入口集，不矛盾。残余读法歧义：该破折句同时罩 `LEDGER_PARAM_DESC` 与 `PROJECT_PARAM_DESC`，而 §2.3 工具 schema 面对 `project` 的落点是 bash ∥ memory ∥ execute 三把 + 写盘七件 |

计数：🔴 0 · 🟡 0 · 🔵 1

VERDICT: pass

## §4 用户批准（主 agent）

## 用户批准（2026-11-10）

- **裁定（原话）**：「**我希望都放开。**」（04:24）——对象 = `manifest` 的 `read` ∥ `init` ∥ `write` 三个动作全免在途号。
- **批准与实施**：设计三轮评审 `pass`（`#12` changes-required → `#15` changes-required → `#18` pass + token 签发），随后派 eng-coder 实施（`#20`），交付后父侧亲跑验收、第 4 轮 D11 清扫（`#26`）收净，再入收口。
- **父侧对范围的解释**：「都」= 三个动作，**不是**「有条件地免」；`bash` ∥ `execute` ∥ 写盘七件不动——用户 2026-11-03 的裁定是另一个面，本批无新口径。

## §5 实施记录（eng-coder）

### 实施轮（eng-coder · 2026-11-10）

**落地面（逐档）**

`thincoder-core/agent/write-gate-ledger.mjs` —— 设计 §2.3「整把退场的六处」逐处落：

- ① 入口集：`LEDGER_ENTRY_TOOLS` 删 `"manifest"`（十二把 ⇒ 十一把），集注释同步改。
- ② `MANIFEST_WRITE_ACTIONS` 整条删（`new Set(["init","write"])` 不再存在）。
- ③ `ledgerGateApplies` 的 `manifest` 支删；函数注释改成「`git` ∥ `manifest` 没有分支」。
- ④ `ledgerGateTargets` 的 `manifest` 支删，连同讲它的两段（「定位参数」句里的 `manifest.target`、「`fallbackDeclared` 适用面」句里的第二支）。
- ⑤ 档头「两把结构化 action 工具（`manifest` ∥ `memory` 按各自的枚举判）」只留 `memory`。
- ⑥ 跨仓判序 ④（`action:"init"` 而 `R` 无 ⇒ 照旧豁免）**删行**——入口集不含该工具，没有一笔走得到，留着就是一个没人走的臂；编号不重排（`§2.3.1` ∥ `R31` ∥ AC-11 的引用零改）。
- 同一轮把档头「也不进 `init` 豁免」与判序处旧注改述为「取不到根就是拒：本门没有取根失败就免判的臂」。

其余产品档：

- `thincoder-core/agent-tools/manifest.mjs`：schema 删 `ledger` ∥ `project` 两格；两个描述名都不再被读 ⇒ import 只剩 `DESC`；档头补「不在笔-账绑定写锁的入口集（决策 44）」，并把两个「写门」（`writer` 身份闸 ∥ 笔-账写锁）分开。
- `thincoder-core/tools/shared.mjs`：`LEDGER_PARAM_DESC_MANIFEST` 整条删（零消费，决策 32 口径）。
- `thincoder-core/tool-docs/manifest.md`：`ledger` ∥ `project` 两行连空行一并删（落点 B：描述面是模型真正读到的那一面，改写成「不需要号」等于留一个不存在的参数）。
- `thincoder-core/prompts/persona-engineering.md`：The write gate 块那一行整行替换为落点 A 的目标形，逐字节相等（含行首两空格）：

  依据 `thincoder-core/prompts/persona-engineering.md`「  `execute` with a `workdir` has no such fallback: a target in no project is refused however `project` is set.」

  依据 `thincoder-core/agent/write-gate-ledger.mjs`「"bash", "execute", "memory", "ssh",」——入口集改后的完整成员（写盘七件在上两行）。

用例面：

- `test/integration/batch-live-batch-lock.test.mjs` 的 12-15 按新口径重写：`write` ∥ `edit` ∥ `init` ∥ `read` 照跑；同一时刻写 / 改文档仍拒；带已删的 `ledger` 与不带逐字同判。
- 同档 12-19 的 `manifest` 半格退场（适用面收窄后它断的是一个不会发生的拒），只留 `execute` 两支，零副作用改以 R 的 manifest sha256 断言。
- `test/rtm/guard.md` 的 12-15 ∥ 12-19 行与节注两处同步；编号不变、十八态不变、套件不增行。
- 批单元测试档 `docs/batches/2026-11-10-manifest-gate-open.test.mjs`（与批档同名同目录，收口删）：门的三条断言 + 描述面 / schema 面白盒三件。它落在 `docs/batches/`，不在 `test/run.mjs` 的 `test/integration/*.test.mjs` 收集面内。

**读数（本席实跑，命令与原样结论）**

```text
node --test docs/batches/2026-11-10-manifest-gate-open.test.mjs      ⇒ tests 2 / pass 2 / fail 0
node --test test/integration/batch-live-batch-lock.test.mjs          ⇒ tests 18 / pass 18 / fail 0
cd thincoder-core && node scripts/check-syntax.mjs                   ⇒ check-syntax: 305 file(s) OK
```

**红侧读数（先红后绿，同一支命令）**

- 跑法：把四个落盘档（`agent-tools/manifest.mjs` ∥ `agent/write-gate-ledger.mjs` ∥ `thincoder-core/tools/shared.mjs` ∥ `tool-docs/manifest.md`）逐档 `git checkout --` 回 HEAD，再跑同一条单测命令。
- 结果：`tests 2 / pass 0 / fail 2`。首条失败文本逐字 = 改前本门那口 —— `write refused — ledger row not bound: no ledger number on this call. …`（即 `manifest({action:"write"})` 无号被拒）；第二条 = schema 仍带 `ledger` 一格。
- 复原：从备份拷回、复跑 ⇒ `pass 2 / fail 0`。备份目录建在仓外且在同一轮内删除（仓工作树零残留）；设计档「无新增文件」说的是仓内工作面，这条如实记在此处。

**一处必须点明的读法（不冒充红侧）**

12-15 里「同一时刻 `write` ∥ `edit` 一份文档不带号仍拒」那两格是**负向控制**：改前改后都绿——它证明的是「门只开了这一口」，不是「本批新行为生效」。

新行为的可失败面由格 1（`write` 落盘、`phase` 可读回）与格 2（带一个已删的 `ledger` 与不带逐字同判）承担。两件事混成一条，下次有人把 `edit` 也放开时它不会红。

**未做 / 简化**：无。设计 §2「验收对照」1–5 全部落地；不做半步形（不做「给了号就校验」，不做「免号但仍要 `project`」）。

**交付对照（设计 §2「验收对照」1–5）**

| # | 判据 | 状态 | 读数来源 |
|---|---|---|---|
| 1 | 无在途行时 `manifest write` 不带项目不带号 ⇒ 落盘成功、可读回新值 | ✅ 完成 | 单测格 1；集成 12-15 格 1 |
| 2 | 同一时刻 `write` ∥ `edit` 一份文档不带号 ⇒ 仍拒（含 `no ledger number on this call`） | ✅ 完成 | 单测格 2 两形；集成 12-15 格 3 两形 |
| 3 | 带一个已从 schema 删的 `ledger` 与不带同判（不取「号给错仍落盘」） | ✅ 完成 | 单测格 3；集成 12-15 格 2（断两笔结果逐字相等） |
| 4 | `init` ∥ `read` 照跑；描述档无两行、schema 无两键、`LEDGER_PARAM_DESC_MANIFEST` 已无 | ✅ 完成 | 单测格 4 + 白盒 case；实读三面 |
| 5 | `bash` ∥ `execute` ∥ `memory` ∥ 写盘七件的号判据零改 | ✅ 完成（零触） | 入口集与两支函数逐处实读；集成 12-1 / 12-3 / 12-7 / 12-12 全绿 |

**越界改动（不在本席声明的文件表内，随本批必需）**

| 档 | 改什么 | 为什么必需 |
|---|---|---|
| `thincoder-core/tools/shared.mjs` | 删 `LEDGER_PARAM_DESC_MANIFEST`；注释「十二把」改「十一把」；`PROJECT_PARAM_DESC` 句内摘掉 `manifest` | 设计 §2.3 ∥ R33 点名这一常量随删；两处文字是本批直接改假的（入口集少一把、该工具不再有 `project` 格） |
| `thincoder-core/agent/dispatch.mjs` | 写锁块注释「入口集 = 十二把（… `manifest` ∥ `memory` …）」改「十一把」，补 `manifest` 不在集内的半句 | 该行是**现行**入口集陈述（不是年表）；本批之后为假，不改就是代码面留一句旧教法 |
| `thincoder-core/agent/write-gate.mjs` | 档头年表补一行「2026-11-10 `manifest` 出集批：十二把 ⇒ 十一把」，同行「`manifest` 声明支零改」摘名 | 档头是逐批年表，不补则最后一条计数陈述停在十二把；`git` 出集那批同形补过一行 |

**上抛项（不在本席笔域，本席未动）**

1. **[上抛·待裁] 设计档现盘陈述为假**：`docs/core/design/PROMPT-SYSTEM.md` §6.69 勘察证据行逐字「`MANIFEST_WRITE_ACTIONS` 现仍在盘（`new Set(["init", "write"])`），删它属实施轮。」——实施轮已把它整条删掉（全仓 `.mjs` 零命中）。设计档 = 设计席笔域。
2. **[上抛·待裁] 同档 §6.94 五条`依据`的引文对象已被本批删掉**：`tool-docs/manifest.md` 的 `ledger` 行 ∥ `project` 行、`persona-engineering.md` 那句旧形、写型枚举那一行，都已不在盘。`doc_check(mode:"gate")` 逐档判该类为 `引缺`（引文已不是该档的连续子串），与 §6.94 自己的 K5 相反 —— 要么删引文，要么改成不带 `「」` 的事实句。
3. **[上抛·待裁] 设计档 `docs/core/design/TOOLS.md` 的 ssh 一节**：逐字「门上入口集 = `write` / … / `manifest` / `memory` / `ssh`（**十二把**，集注释同数）」，本批之后应为十一把、且不含 `manifest`。设计席笔域。
4. **[上抛·待裁] 需求档 `docs/core/requirements/ENGINEERING-MODE-V2.md`**：逐字「**`manifest` 的 `init` 只在「目标沿祖先链取不到项目根」时不进本门**（那一步无账可问），落在既有项目内照判要号」，与其验收句「并含 `manifest` 的 `init` 豁免句与「没号怎么办」句」——豁免已退场，两句为假。主 agent 笔域（D11 的「改不动的层」）。
5. **[上抛·知会] 档位读数**：`thincoder-core/agent/write-gate-ledger.mjs` 实读 565 行（越 500 软线），而设计 §3 档位表该行仍写「软线内、本批不跨档位」。本批只删行、不新增拆单义务；读数与结论的落差交设计席收正。

### 内部审计与代码评审（本席自成闭环）

**偏差审计（explore · 第 1 轮，只读）**

- 代码面：`divergent (0 blockers, 1 majors)`，四类判定 = 半实现 0 · 静默简化 0 · 文档漂移 2 · 清单外改动 3。
- 六处退场逐处核过在位；`MANIFEST_WRITE_ACTIONS` 全仓零命中；`action === "init"` 豁免零命中（且论证了删它不改变任何余下工具的行为——那支原本只在 `toolName === "manifest"` 分支内可达）。
- 判序编号与设计引用核过：①②⑤ 未重排，`§2.3.1` ∥ `R31` ∥ AC-11 ∥ AC-12 指到的条件与改前同一批。
- 两条文档漂移全在设计档（§6.69 与 §6.94），已逐条转上抛项 1 ∥ 2；清单外三处判「两处真需改、`_red_backup` 可避免」——后者已在同轮删除。
- 审计提出的一处观察：当时 §5 为空 ⇒ 本段即其落地。

**代码评审（advisor · 第 1 轮，`changes-required`）**

| # | 级 | 处置 | 事项 |
|---|---|---|---|
| 1 | 🟡 必修 | 本轮已改 | 设计 §5 R2 ⑫ 逐字「同一时刻写一份设计档（`write` ∥ `edit`）不带号仍拒」，而 §9 的 12-15 行、RTM 行与两份用例都只断 `write` ⇒ `edit` 那一半零断言：判据被文档让路收窄，那半格再也红不了 |
| 2 | 🟡 | 上抛项 1 | `PROMPT-SYSTEM.md` §6.69「`MANIFEST_WRITE_ACTIONS` 现仍在盘」已为假 |
| 3 | 🟡 | 上抛项 2 | 同档 §6.94 五条`依据`的引文对象已删（`doc_check` 将判 `引缺`） |
| 4 | 🟡 | 上抛项 5 | `write-gate-ledger.mjs` 实读越 500 软线，而设计档位表该行仍写「软线内」 |
| 5 | 🟡 协同 | 本段 | 批档 §5 当时为空（实施记录未落盘）——本段即其落地 |
| 6 | 🔵 | 本轮已采纳 | `agent-tools/manifest.mjs` 档头只剩一句「写门」（`writer` 身份闸），未写本工具已整把出集 ⇒ 已补一句并把两个「写门」分开 |
| 7 | 🔵 | 本轮已采纳 | 用例档头把决策 44 挂在 12-19 的括注里 ⇒ 已改为「`manifest` 整把不在入口集（决策 44）= 12-15」 |

**修正轮（第 1 轮后·本席笔域内）**

- must-fix 落地：批单测与集成 12-15 各补一格 `edit`（夹具先直接落一份现成档，再 `edit` 不带号 ⇒ 拒、含 `no ledger number on this call`、字节零改）；`test/rtm/guard.md` 12-15 行的怎么做 / 怎么算通过同步到两形。
- 两条 🔵 采纳（`manifest.mjs` 档头一句、用例档头一句）。
- 复跑读数：`node --test docs/batches/2026-11-10-manifest-gate-open.test.mjs` ⇒ `tests 2 / pass 2 / fail 0`；`node --test test/integration/batch-live-batch-lock.test.mjs` ⇒ `tests 18 / pass 18 / fail 0`。
- 未采纳项全部是跨笔域的文档项（上抛 1–5）：本席不动设计档与需求档，改由父侧路由。

**终态：`clean`**（本席笔域内零未决项；余项 = 5 条上抛，其中 4 条属设计席 / 主 agent 的笔域，1 条为知会）。

## §6 验证与收口（父代理）

## 验证与收口（父侧）

### 验收读数（父侧亲跑 · 2026-11-10 05:02）

- `node --test test/integration/batch-live-batch-lock.test.mjs` ⇒ **`fail 0`**（18 例）。
- 仓外红侧备份目录 `_red_backup` 清空（0 项）——实施席造红侧后未留残件。

### 失败面（实施席实跑）

四个落盘档逐档 `git checkout --` 回 HEAD，跑同一条单测 ⇒ **`pass 0 / fail 2`**：
首条失败文本 = `no ledger number on this call` 拒掉 `manifest write`（改前那口）；第二条 = schema 仍带 `ledger` 一格。复原后 `pass 2 / fail 0`。

**一处如实标注**：12-15 里「同一时刻 `write` ∥ `edit` 仍拒」两格是**负向控制**，改前改后都绿——它证「门只开了这一口」；新行为的可失败面由「`write` 落盘可读回」与「带已删的 `ledger` 与不带逐字同判」承担。

### 落地核对

- **六处退场**：入口集删 `manifest` · `MANIFEST_WRITE_ACTIONS` 整条删 · `ledgerGateApplies` 支删 · `ledgerGateTargets` 支删 · 档头只留 `memory` · 跨仓判序 ④ 删行。
- **schema 两格删**（`ledger` ∥ `project`）+ `LEDGER_PARAM_DESC_MANIFEST` 整条删（零消费）。
- **三面同轮**：`tool-docs/manifest.md` 两行删 · `persona-engineering.md` 那句只讲 `execute`（与设计 §6.94 落点 A 围栏逐字节相等）· 需求层 `ENGINEERING-MODE-V2.md` §13.8 ⑥ 改「整把不进本门」。
- **D11 清扫（第 4 轮）**：`PROMPT-SYSTEM` §6.69 假陈述改现况 · §6.94 五条 `依据` 改指现文 · `TOOLS.md` ssh 节十二把→十一把 · §6.69 沿革串与两处 `publicRepos = []` 读数 · `TOOLS.md` ②③ 落点档名（`write-gate.mjs` → `write-gate-ledger.mjs`）。

### 代码评审（实施席内部）

第 1 轮 `changes-required`：设计写「`write` ∥ `edit`」，用例只断 `write` ⇒ `edit` 半格零断言（**判据被文档让路收窄**）。已修：单测与集成各补一格。另采纳两条 🔵。

### 父侧处置（收口前）

- **豁免登记两条**（`id_ed25519.pub` @ `TOOLS.md` · `ledger.db` @ `ENGINEERING-MODE-V2.md`）：均为**运行时件名**被判成路径 token 的解析面假阳，非「档还没建」。**没有让文档改口换绿**（实施席同样拒绝了这个做法）。登记后门 = **PASS（4 档全清）**。
- **挂账**：`#2272` `write-gate-ledger.mjs` 565 行越 500 硬线、拆单无承接批。

### 集成测试面

- `test/rtm/guard.md` 故事 12 的 12-15 ∥ 12-19 行与节注同步；`test/integration/batch-live-batch-lock.test.mjs` 18 例全绿。

### 已知边界

- 真机评审实例未复验：`doc_check` 在评审路径的可用性由单测经真 `runAdvisorToolLoop` 驱动证明；真机要下一次真实评审确认。

### 收口扫描

- **延后批复核**：无。
- **文档检查门**：`PASS`。
- **本轮遗留（另账）**：`#2272` 写锁段越线未拆。
