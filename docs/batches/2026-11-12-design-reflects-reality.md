# 2026-11-12 · design-reflects-reality
> 六段，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 每段只有一个作者：作者的段可 `append` 加内容、可就地改（`edit`）；非作者一概拒。
> 编制：主 agent · 2026-11-12 · 来源 = 用户 2026-11-12 00:49「拆完了应该更新一下设计反应现状啊！」——上一轮设计给了分拆方案，方案落地后文件已拆完，设计档仍写「本批分拆」，下一轮读档的人会照着再做一次。。
> 台账 = #2344（core · 归批）。前情 = 无（独立批）。
## §1 讨论（主 agent）
**状态行**：已收口 2026-11-16
批起 sha = 48482678ab9c708d3eaf63d5d49f520d2041ae34
<§1 模板占位：本批条目 / 关键判据 / 授权口径>

### 条目与授权口径（父侧）

**用户原话**（2026-11-12 00:49）：「拆完了应该更新一下设计反应现状啊！」

**现场**：`docs/core/design/PATH-RESOLUTION.md` §3 贴线判写「`doc-check/index.mjs` **越 800 硬线**，必须拆」「`subagent-spawn.mjs` **越 500 设计器硬线**」——**这句话在设计当时是真的**；上一轮按它落地后文件已拆完（五档分拆目标档全在盘，实读 399 ∥ 428）。**设计档没跟着改**。

**为什么不改**：流程里没有这一步。现在的四步走到「实施完成」就结束，没人负责把设计档里那些「本批要做什么」的句子改成现况。

**后果（不是洁癖）**：下一轮读档的人看到「必须拆」会照着再拆一次；看到 `新增` 里列着已在盘的档会去建一个已存在的档；看到 AC 断言已退役的载荷会去实现一个已删的字段。

**要设计的**：**落地即回写**——实现把设计档里被这次落地改写的那几句改成现况（时态、清单、断言），一个字不多写。

**与既有规则的分界**：不是「设计档记得改」，是「实施完成的那一刻，设计档的那几句已经不对了」——所以它属于**实施的收尾动作**，不是设计的活。

### 范围（用户 2026-11-12 00:50）

**用户原话**：「这事儿应该不止涉及到分拆吧？还有可能干别的活做完了以后也要更新一下设计反映现状？」

**是。** 分拆只是撞上的那一例。凡是实现让设计档某句话不再成立，都要回写：

| 落地形态 | 设计档里跟着变的 |
|---|---|
| 分拆落地 | 「本批分拆」⇒ 已落地（落点档名）；越线结论按实量重取 |
| 新机制落地 | 「将新增 X」⇒ 「X 在此，职责是……」 |
| 行为改了 | 判据句 ∥ 验收标准按现况写 |
| 机制退役 | 那句话连同它引的符号名一起删（不留「已删除」的尸体） |
| 符号改名 | 设计档里那个名字跟着改 |
| 验收达成 | 「待验证」⇒ 已验（附读数出处） |

**共性一句**：设计档写的是「应该怎样」，实现完成后它就是「现在怎样」——**两者不一致的那半句就是欠账**。

**边界**：回写只改「被这次落地改写的那几句」，不顺手重写整节，不把实现细节搬进设计（那是 §5 的事）。

### 父侧收正两处（2026-11-12 00:58）

**① 现场证据换了**：本段原先引 `PATH-RESOLUTION.md` §3「越 800 硬线，必须拆」——那个案子已被 `#5` 改成「已落地」，盘上零命中。真正的反面样本在 `docs/core/design/DOC-CHECK.md` §2.9.7：那里仍写「`thincoder-core/doc-check/index.mjs` 越 800 硬线，本批分拆，不推下批」，而五族落点档全在盘、`index.mjs` 实读 399。**同一份设计面里，一处改对了、一处没改**——这正好是 D17 要防的形态。

**② 补第三种形态：计划句失去归属**。设计写「本批分拆」，批已收口而没拆 ⇒ 那句话既不是「已落地」也不是「待落地」，它**没有承接者了**。

判据：**计划句失去归属时，要么转成台账行（写明承接批），要么删掉。** 挂着不动，读档的人会以为它还在做——这比写错更坏，因为写错有人会查，挂着的没人查。

**补关记录**：2026-11-16 · 行集全归档（2 行）· §3/§4/§6 未补写 · 操作者 = 主 agent
## §2 批次任务与设计（eng-designer）
**状态行**：设计完成（修正轮 3 已落（评审轮 6 的三条 + 扫面连带 1 条）：落地核对三态在 §5.3 ∥ §5.4 ∥ D7 行三处同句；D17 现场去绝对读数与时序叙述、判读点两处收齐。提示词四档与需求档 ∥ 标准层待主 agent 与实施轮）

### 条目（本批覆盖）

用户 2026-11-12 00:49–00:53 逐轮定形：分拆落地要回写 → **凡落地都回写** → 回写是流程的 ⑤、核验是 ⑥ → ⑤ 的材料归实施席、笔归设计席。

| # | 条目 | 覆盖形态 |
|---|---|---|
| ① | **⑤ 材料：实施席出清单** | §5 里一张六列表「本批落地改写的设计语句」+ 空形固定句 |
| ② | **⑤ 落笔：设计席写回写轮** | 设计席按清单改设计档，记 §2 的「回写轮」小节 |
| ③ | **⑥ 核验：两个时点两项对读** | 材料半（派单时，打回 §5）· 落笔半（收口时，对不上不 close） |
| ④ | **判据面：D17** | 表行 + 细则块（六行闭枚举 · 与 D11 分界 · 与 D8∥D12∥D14 关系 · 机判=无 · 边界） |
| ⑤ | **流程面：四步 → 六步** | 流程句逐字目标形 = `docs/core/design/BATCH-RECORD.md` §5.4 的两段围栏，实施席照落 |

**不在本批**：不加任何新机检门 ∥ 不给回写开工具参数 ∥ 不另开清单交付物 ∥ 不改六段作者表 ∥ 不批量回写存量设计档（存量按 D17 在触碰批处理）。

### 设计档落点（判据与载体分住，D2）

- **判据面** = `docs/core/design/DOC-DISCIPLINE.md` §1：D17 表行 + **D17 细则**块（谁出材料 · 谁落笔 · 哪几句 · 两个核验时点 · 分界 · 边界）。
- **载体面** = `docs/core/design/BATCH-RECORD.md`：§5 行为纪律表新行 · **§5.4**（§5 清单形 + §2 回写轮形 + 两个时点 + 流程句逐字副本）· §5.3 收口槽位。
- 两档互不重述：判据住前者，形与动作住后者。

### 关键决策

- **KD-1 ⑤ 拆两个席位**（材料归实施席、笔归设计席）。实施席离事实最近——他刚落地，只有他知道哪句变了；但设计档不是他的笔域。让实施席直接改（省一轮）的代价是 D1 破一个口子、且没人能判「清单本身对不对」——**被否**。
- **KD-2 清单住 §5，不另开交付物**。判据 = 父侧派设计席时能照着它直接干；派单本就带 `batchDoc`，第二条通道不带来新信息，却要自带存放位置、生命周期与收口删除的纪律。
- **KD-3 ⑥ 分两个时点**。材料半在派单时（坏清单当场打回，成本最低）；落笔半在收口时（那时设计档才定稿）。合成一个 ⇒ 材料坏了要等收口才发现，而回写轮已照着坏材料干过一轮。
- **KD-4 ⑥ 不并进设计评审**。设计评审在实现**之前**点火，那时 §5 是空的、事实还没发生；⑥ 的输入是 §5 与落地后的设计档。两个时点、两份输入。
- **KD-5 机判 = 无**。判「哪句被落地改写」是语义面（正则会把引述与反例一并抓），取数面只出候选清单、由人判。
- **代价（如实）**：每批多一轮设计席——**只在清单非空时点火**；清单为「无」不派轮、§6 记一行。

### 受影响文件（机读清单）

```text
| 档 | 分拆方案 |
|---|---|
| docs/core/design/DOC-DISCIPLINE.md | — |
| docs/core/design/BATCH-RECORD.md | — |
| docs/core/design/PROMPT-SYSTEM.md | — |
| thincoder-core/prompts/discipline-engineering.md | — |
| thincoder-core/prompts/persona-eng-coder.md | — |
| thincoder-core/prompts/persona-eng-designer.md | — |
| thincoder-core/prompts/persona-engineering.md | — |
```

**档层结论**：七档 `.md` 均不出档位标记 ⇒ 无越线档、无分拆方案；零用例档。**另有一处清单外源档** `thincoder-core/prompt-overlays.mjs`（`tester` 行注释一行，落地时补改）——当时未列，本行补记；清单与读数只覆盖那七档。

读数（`doc_check` 的 `lines` 面，本批七档全量）：

```text
合计 7 档（其他检查硬线 0 · 设计器硬线 0 · 未越线 7）
```

**写权分区（D1 · D11 同批各写域各落）**：设计档三份 = 本席（已落）· 提示词四份 = 实施轮（`eng-coder`，内容取 §5.4 的围栏副本、不改英文）· 需求档 `docs/core/requirements/ENGINEERING-MODE-V2.md` §13.1 = **主 agent 笔**（标题 ∥ 导语 ∥ D17 行）。

### 验收对照（条目 → 判据落点 → 读者怎么判它没做）

| 条目 | 判据落点 | 失败面（读者照着读就能说「没做」） |
|---|---|---|
| ① | `docs/core/design/BATCH-RECORD.md` §5.4 的表与空形条 | 六列缺一列 ∥ 没有空形固定句 ⇒ 没做 |
| ② | 同节「⑤ 的笔住 §2」三条 | 说不出回写轮记在哪、清单为「无」派不派轮 ⇒ 没做 |
| ③ | 同节两个时点 + §5.3 槽位 + `docs/core/design/DOC-DISCIPLINE.md` 的 D7 行 | 三处任一缺「设计档回写核对」∥ 只有收口一处 ⇒ 没做 |
| ④ | `docs/core/design/DOC-DISCIPLINE.md` §1 的 D17 行与细则 | 六行闭枚举少一行 ∥ 说不清 D11 与本条触发物不同 ⇒ 没做 |
| ⑤ | `docs/core/design/BATCH-RECORD.md` §5.4 两段围栏 | 提示词面仍 `four steps` ∥ 两条步骤句不全 ⇒ 没做 |

### 本批自己的回写（首个应用，预期非空）

实施轮把 D17 落进提示词清单后，`docs/core/design/PROMPT-SYSTEM.md` 的 D-PS16 ∥ K6 两处「提示词清单 = `D1–D15` 十五条」即成过期句（规范面闭枚举侧本席同轮已改 `D1–D17`）。

这正是机制的必要性所在：**设计轮写不出落地后的那句**——事实还没发生。清单第 1 条由此定形。

### 上抛项

**1 · [上抛·待裁] §1 的现场与盘不符，本批的理由要换一个证据。**

`docs/core/design/PATH-RESOLUTION.md` §3 现文读作「未越线——五族分拆**已落地**」「未越线——两族分拆**已落地**」。

`doc_check` 的 `lines` 面读 `thincoder-core/doc-check/index.mjs` = 399、`thincoder-core/agent-tools/subagent-spawn.mjs` = 428 ⇒ **那两句已经是对的**；§1 引的「越 800 硬线，必须拆」在盘上零命中。

真正的现场在 `docs/core/design/DOC-CHECK.md` 的 `#### 2.9.7 档层结论`：它写「`thincoder-core/doc-check/index.mjs` 越 800 硬线，本批分拆，不推下批」，而该档已在 500 之下、五族落点档五份全在盘。

另有一半：`anchors.mjs` 实读 504（越设计器硬线），而 `doc-tokens.mjs` 已在盘 ⇒ 那句「本批分拆」的计划与「越线结论」两半都过期。

**本席按「机制照设计、证据换成实测」推进**；若父侧要改 §1，本席据新证据改 §2 的引用。

**2 · [上抛·待裁] 「批收口时计划没落地」那一半未定。**

计划句的批收口了、事情没做（`anchors.mjs` 即此形）。它不属「落地让句子过期」，属计划句失去归属。

设计档里已按待裁三件写好：谁裁 = 用户 · 条件 = 本项回复时 · 到期 = 收到回复即改写或另立条目。

**3 · [上抛·知会] 需求档同步 = 主 agent 笔。**

`docs/core/requirements/ENGINEERING-MODE-V2.md` §13.1 的标题「D1–D16」、导语「十六条纪律」、以及缺 D17 行——三处 D11 要求同批落，本席不可写。

**4 · [上抛·知会] 顺手撞到的口径分歧（lead，非本批缺陷）。**

需求档 §13.1 的 D3 行读「数字只在它本身是断言时写；作为列表别名的数字一律删」；`docs/core/design/DOC-DISCIPLINE.md` §1 的 D3 行仍读「「N 项/处/条」与列表**同时改**」。

两条不是同义句（一条删别名、一条保同步），本席**未动**——属裁定面。本席按「改名并保同步」执行（两种读法下都成立）。

### 修正轮 1（§3 评审轮 1 → 逐条处置）

评审 VERDICT = `changes-required`（🔴2 · 🟡6 · 🔵1）。本席按序号逐条落，一条一行；🟡4 是需求档笔，本席只出建议文（归主 agent 落）。

| # | 处置 | 落点（本席已落盘） |
|---|---|---|
| 1 🔴 | 现场换掉 | `docs/core/design/DOC-DISCIPLINE.md` §1「D17 细则」的「现场（可复跑）」条：原引 `DOC-CHECK.md` §2.9.7 的「越 800 硬线，本批分拆，不推下批」**在盘零命中**（该节已改成「五族分拆已落地」）⇒ 换成同节今天仍在盘的那一条：`index.mjs` 那条已改、`anchors.mjs` 那条仍写「仍越 500 设计器硬线（504）」+「余下的分拆未落」。同一份设计面一条改对一条没改，正是本条要防的形态 |
| 2 🔴 | 起点写死 + 落点表补两档 | `docs/core/design/BATCH-RECORD.md` §5.4「提示词面落点」条：加「起点（实施席照此数，不要自己猜）= **16 条**」三件同数（节标题 `(D1–D16)` ∥ 条数句 `Sixteen doc-update disciplines:` ∥ 末条 `16.`），写明要补的是第 **17** 条；新增「同批落点表（五档）」，第 5 档 = `docs/core/design/PROMPT-SYSTEM.md` §7 的 `D-PS16` ∥ `K6`（走 D17 正向路）。数出来不是 16 ⇒ 停下上报 |
| 3 🟡 | 五前置 ⇒ 六前置 | `docs/core/design/BATCH-RECORD.md` §5.3 标题：「六前置」+ 括注补「设计档回写核对」。标题上三个旧日期一并删（D8：规范面不留历史行；六项的计数句带一份只覆盖前五项的日期表 = 同一句里两个口径） |
| 4 🟡 | 需求档 D7 行缺槽位 | **需求档笔归主 agent，本席不写**；建议文见下方「上抛项 3」 |
| 5 🟡 | 清单列数三处不一 | `docs/core/design/DOC-DISCIPLINE.md` §1 的 D17 表行：`（档 / 定位 / 改前逐字 / 现况 / 依据）` ⇒ `（六列：# / 档 / 定位 / 改前逐字 / 现况 / 依据）`；`#` 列由此在判据面有位置，§5.4 的「清单号 → 落点」追踪才有锚 |
| 6 🟡 | 缺新名三问 ∥ 缺逐支依据 | `docs/core/design/DOC-DISCIPLINE.md` §1「D17 细则」：新增「新名三问」三条（固定句 ∥ `### 回写轮（落地回写）` ∥ §6 槽位「设计档回写核对」——三个名逐一给 `existing:` 坐标与消费面）与「逐支依据」两条（清单为空 ⇒ 不派轮 ∥ 设计席否决 ⇒ 停、上报，各写现场与判定面） |
| 7 🟡 | 提示词面落点只有一处家 | `docs/core/design/DOC-DISCIPLINE.md` §1 的 D17 表行末尾加指针：「**提示词面落点** = `docs/core/design/BATCH-RECORD.md` §5.4 的「提示词面落点」条（逐字形，本条唯一副本）」。判据住 D 族、形住载体档，与 D8 ∥ D9 ∥ D12 各行同形 |
| 8 🟡 | 四步 → 六步，标准层滞后 | `docs/core/design/BATCH-RECORD.md` §5.4：新增「标准层同轮面（D11 点名上抛）」条——`docs/core/standards/METHODOLOGY.md` §2.1 的 `F2-1` 仍写「四步硬流程……不跳步」；标准层不在任何子代理写权面内 ⇒ 谁写 = 主 agent、何时 = §4 批准前，见下方「上抛项 5」 |
| 9 🔵 | 已核，不动 | — |

**本批自己的回写（D17 的首个应用，已在修正轮预落）**

- `docs/core/design/PROMPT-SYSTEM.md` §7 的 `D-PS16` ∥ `K6` 两处旧读「提示词清单 = `D1–D15` 十五条」，而盘上实为 `D1–D16` / `Sixteen` ⇒ 两处已按现况改成 `D1–D16` 十六条。
- 同两处删掉「两面差一 = 已知状态」那句：D16 早已进编号清单（末条 `16.`），该句自它落地那天起就不成立。
- 实施轮补上第 17 条之后，这两句再改 `D1–D17` 十七条——那一笔是回写轮，不是本轮。

**本轮口径（为什么只改这几句）**：每一处改动都能对回上表的一个序号；没有序号支撑的句子一律没动（D17 边界：不顺手重写整节、不把实现细节搬进设计）。

**`PROMPT-SYSTEM.md` 其余 `D1–D15` 提法（lead，非本批缺陷）**

- 另有四处把该节记作 `（D1–D15）`：§7 上方那条同步说明 · §6.73 清点表两行 · 其后的落地表一行。
- 四处都在**别的批的决策记录**里当定位标签用，本轮按点修不动；建议转台账行，由主 agent 定承接批（D14：退役名一次扫完，域写明）。

### 上抛项（修正轮更新）

**1 · [已裁] 现场证据换成实测那一条。**

- 用户本轮回复：「改法：现场换成今天仍在盘的那一条——同节的 `anchors.mjs`「仍越 500 设计器硬线（504）· 余下的分拆未落」」。已按此落（见上表 #1）。
- **本席另加一句判读**：原句读起来像「那份档写错了」，真实形态是「同一份设计面里一条跟着落地改了、另一条没有」——后者才是 D17 要防的形态，故现场按后者写。

**2 · [上抛·待裁] 「批收口时计划没落地」那一半仍未定。**

- 三件齐、未过期：谁裁 = 用户 · 条件 = 本批 §2 上抛项回复时 · 到期 = 收到即改写或另立条目。
- 本条住在 `docs/core/design/DOC-DISCIPLINE.md` §1「D17 细则」的「边界（不做）」条。本轮未动——用户本轮未就此回复，改写即替用户裁。

**3 · [上抛·知会] 需求档 §13.1 两处 → 主 agent 落，建议文如下。**

- **D7 行补槽**：在「用户文档面同拍」槽与「台账可见面（收口行）」槽之间插入一项，逐字建议：
  `**设计档回写核对**（§5 清单 ↔ §2 回写轮 ↔ 设计档现文三面对读——口径 = docs/core/design/BATCH-RECORD.md §5.4；对不上不收口）`
- 该建议与 `docs/core/design/DOC-DISCIPLINE.md` §1 的 D7 行同槽逐字同源（设计档侧已在盘）。
- **D17 行改六列**：该行现写「哪份档 / 哪一句改前逐字 / 现况应该是什么 / 依据」= 四件；判据面已改成六列 ⇒ 同轮改成 `清单号 / 档 / 定位（节名）/ 改前逐字 / 现况 / 依据`。

**4 · [上抛·知会] 顺手撞到的口径分歧（lead，非本批缺陷）。**

- 需求档 §13.1 的 D3 行读「数字只在它本身是断言时写；作为列表别名的数字一律删」。
- `docs/core/design/DOC-DISCIPLINE.md` §1 的 D3 行仍读「「N 项/处/条」与列表**同时改**」。
- 两条不是同义句（一条删别名、一条保同步）——本轮**未动**（裁定面）。本席按「改名并保同步」执行，两种读法下都成立。

**5 · [上抛·待裁] 标准层 `METHODOLOGY` §2.1 `F2-1` 的「四步硬流程」要与提示词标题「six steps」同拍。**

- **建议文（逐字）**：把 `F2-1` 的「四步硬流程：任何开发任务走需求 → 设计 → 开发 → 测试，不跳步」改成「六步硬流程：需求 → 设计 → 开发 → 测试 → 回写 → 核验，不跳步」；同格「三步要写文档（需求 / 设计 / 测试）」不动。
- **三件齐**：谁裁 = 主 agent（标准层无子代理写权）· 条件 = §4 批准前 · 到期 = 批准即落，或裁「该层不改并写明理由」。
- **不落的后果**：一处「四步」与「six steps」并存——下一轮读标准层的人照四步做，读完提示词的人照六步做。

### 修正轮 2（§3 评审轮 2 → 逐条处置）

评审 VERDICT = `changes-required`（🔴2 · 🟡5 · 🔵1）。8 条全部有归属：4 条父侧落（标准层 ∥ 需求档，子代理无写权），4 条本席落；另加扫面连带 2 条。

| # | 处置 | 落点（本席已落盘 ∥ 父侧已落） |
|---|---|---|
| 1 🔴 | 父侧已落（标准层半）；需求档半仍未落 | `docs/core/standards/METHODOLOGY.md` §2.4 `F5-1` 判据句现读「任何一点都得走完 F2-1 的六步，没有跳步通道」——本席实读在盘。**另一半**：`docs/core/requirements/ENGINEERING-MODE-V2.md` §1 仍读「四步流程、评审门、批次档、台账，都是为这件事服务的机器」⇒ 见上抛 4 |
| 2 🔴 | 父侧已落（标准层） | 同档 §2.6 `F7-1` 现读「三节组织」，判定句「变更记录一行」已删，边界栏补「历史留痕不进本模板」（D8） |
| 3 🟡 | 父侧已落（标准层） | 同档 §2.1 `F2-6` 坐标表已无「先例批」，边界栏补「先例批不作规则出处（D4 细则二，例外 = 0）」 |
| 4 🟡 | **标准层同轮面改成现况** | `docs/core/design/BATCH-RECORD.md` §5.4：原句「`F2-1` 现文写「**四步硬流程**」，与本条相抵」⇒「该层现文 =「**六步硬流程**：…→ **更新文档**…→ **评审文档**…，不跳步」——与本节流程句同拍，本批不动该层」 |
| 5 🟡 | **扫面按类定，处数交清单** | 同节第 5 行下新增四条：「已读到的样本」（§6.32 `H2` 行 · 同节落点表行 · §6.41 `existing` 名 · §6.96.4 及权威详述句）·「样本不止这一档」（`AGENT-LOOP-SUBAGENT.md` 两处 · `docs/core/design/PORTABILITY.md` 一处）·「处数不写在设计轮」·「回写轮扫面域 = 本仓设计档全文，命中串 `four steps` ∥ `四步`」 |
| 6 🟡 | 指针整句删除 | 同节第 5 行尾「（即本条的首个应用，见 §2「本批自己的回写」）」删——设计档指批档逆行方向纪律（D10），且该目标在本档解不到 |
| 7 🟡 | 父侧已落（需求档） | `docs/core/requirements/ENGINEERING-MODE-V2.md` §13.1 `D3` 行现读「机检器未实装（V2 现无对应机检器，判读点 = 设计评审）」，与本档 D3 行「机判 = 无」同向，分歧消 |
| 8 🔵 | 两支标「未观测」+ 到期条件 | `docs/core/design/DOC-DISCIPLINE.md` §1 D17 细则「逐支依据」块：标题改「证据状态」；两支各写「**未观测**」+ 从未跑过的原因 + 到期条件（首个清单为「无」的批次补批号与读法） |

**修正轮的扫面（本轮新撞见、同轮修完）**

- `docs/core/design/DOC-DISCIPLINE.md` §1 D17 细则的「病」行：原读「四步流程走到「实施完成」就结束」⇒ 改「旧流程（四步）走到「实施完成」就结束」。同一条「四步」陈述，是 #4 的兄弟行，留着就是下一轮的 #4。
- 扫面域按类重取多出两档（`AGENT-LOOP-SUBAGENT.md` 两处 · `docs/core/design/PORTABILITY.md` 一处）——**本轮不改**：那两句今天为真（提示词仍是 `## Basic flow (four steps, in order)`），随落地才过期，故按 #5 纳入回写轮扫面域。

**机检**：`doc_check({mode:"gate", docs:["docs/core/design/BATCH-RECORD.md","docs/core/design/DOC-DISCIPLINE.md"]})` ⇒ 首行 `DOC-CHECK GATE: PASS`（命中 0 · 行号坐标 0）。

### 上抛项（修正轮 2 更新）

**1 · [已裁] 现场证据 + 「批收口时计划没落地」两半。** 现场按用户裁定换成 `anchors.mjs` 那一条（修正轮 1 #1 已落）。

**2 · [上抛·待裁] 「批收口时计划没落地」那一半仍未定**（`docs/core/design/DOC-DISCIPLINE.md` §1 D17 细则「边界（不做）」条）。

- 三件齐：谁裁 = 用户 · 条件 = 本批 §2 上抛项回复时 · 到期 = 收到即改写或另立条目。本轮未动——改即替用户裁。

**3 · [上抛·知会] `doc_check` 回执带「登记未命中 1 条」。**

- 回执原句：「登记未命中 1 条（原文已变或已不在判集，复核后删）」。它在 `PROJECT-MANIFEST.json` 的 `index.docCheckExemptions`（主 agent 笔域），本席不写，只报。

**4 · [上抛·知会] 评审轮次 2 #1 的另一半仍在盘（需求档 = 主 agent 笔）。**

- 需求档 §1 现读：「四步流程、评审门、批次档、台账，都是为这件事服务的机器；**不为这件事服务的形式，就是可以删的形式**」——本席读见原文。
- 标准层 `F2-1` 已是六步、本批又要把提示词改成 `six steps` ⇒ 需求档这一句是同一层的第三个口径。
- 建议文（逐字）：「**六步流程**、评审门、批次档、台账，都是为这件事服务的机器；不为这件事服务的形式，就是可以删的形式」。
- 三件齐：谁裁 = 主 agent · 条件 = §4 批准前 · 到期 = 批准即落，或裁「该句不动并写明理由」。

### 回写轮（落地回写）

**材料** = §5「⑤ 材料」的 20 条六列清单（实施席给）；**笔** = 本席。这是 D17 的第一次真跑：清单 20 条逐条落，落点与落成的句子如下；整行现文读各自落点，本表不抄正文（D2）。

| 清单号 | 落点（档 §节） | 落成的句子（逐字要点） |
|---|---|---|
| 1 | `PROMPT-SYSTEM.md` §7 `D-PS16` | 「节列 **D1–D17**」·「提示词清单 = `D1–D17` 十七条，与规范面闭枚举同数」 |
| 2 | 同档 §7 `K6` | 「清单现况 = `D1–D17` 十七条（… 末条 `17.`），与规范面闭枚举同数」 |
| 3 | 同档 §6.93 落点 ⑩续 | 围栏换成一句现况读数：「该节现读：`### Doc update discipline (D1–D17)` ∥ `Seventeen doc-update disciplines:`」 |
| 4 | 同档 §6.32 `H2` 行 | 新名列 = `## Basic flow (six steps, in order)`；依据列「六步顺序 = 流程机制本身」 |
| 5 | 同档 §6.32 落点表 `H2` 行 | 依据列改「六步顺序…」；原句摘要 `four hard steps` **保留**（它是该行的改前值，不是现况断言） |
| 6 | 同档 §6.34 | 「纪律层六步描述的是一批工作怎么走」·「与「六步是什么」两件事混进同一节」 |
| 7 | 同档 §6.41 | 「六步顺序与步骤入口」·「已读 … 的六步节」 |
| 8 | 同档 §6.71 | 节名四处改 `## Basic flow (six steps, in order)`；「该档六步与本节的关系实读」 |
| 9 | 同档 §6.72 | 引文 = `The six steps, the review gates, …` |
| 10 | 同档 §6.73.1 清点表 | 探针串改 `six steps`；条数 `14` ⇒ `16`；探针列补 `Update the docs` · `Check the docs` |
| 11 | 同档 §6.76 | 「六步流程约束的是「走了哪几步」」·「同节第 1 条（六步）」 |
| 12 | 同档 §6.77 | 「**与六步流程的关系**」· 表行节名与步序（…→ 更新文档 → 核验文档）·「六步流程条首逐字」 |
| 13 | 同档 §6.95 | 「六步关系句」· 引文 six steps · `C3 边界 · 六步关系` ·「不改六步流程、评审门…」 |
| 14 | 同档 §6.96.4 | 节标题「六步管顺序，三式管步内动作」· 两个权威锚与两处围栏引文改 six steps ·「三式前三条、六步顺序…」 |
| 15 | 同档 §6.96.10–13 ∥ §6.97.2 | 「最小形态」四处（原「最小四步」）·「把流程步降为遇阻备用」·「六步流程、父侧调用链…」 |
| 16 | `AGENT-LOOP-SUBAGENT.md` §6.59.2 判由 ∥ `D-TT6` | 「装的是六步流程与 §2 任务书」·「工程纪律装的是六步流程与 §2 账」 |
| 17 | `PORTABILITY.md` §4 `D1` | 「破坏六步流程」 |
| 18 | `STRUCTURE-DEBT.md` §1 | 「设计 → 评审 → 实现都在工程模式的六步（…）之内」 |
| 19 | `BATCH-RECORD.md` §5.4 流程句条 | 「落点 = … 的 `## Basic flow (six steps, in order)` 节；该节现文与下文围栏逐字一致」 |
| 20 | 同档 §5.4 提示词面落点区 | 「该节现况（三件同数）… = **17 条**」· 围栏首行改定位句「…第 17 条：」·「同一规则的各声明面（D11）…四段同轮同拍」·「两处现读 `D1–D17` 十七条」 |

**读数（D12：数住记录面）**：清单 20 条 = 落 20 条、剩 0 条。§6.73.1 那条 `14 ⇒ 16` 的量法 = 逐条数 `thincoder-core/prompts/discipline-engineering.md` 的 `## Basic flow (six steps, in order)` 节（起句至 `## Engineering judgment` 前）：10 条节首调研 bullet + 6 步 = 16，与该表探针列逐条相等。

**与清单「现况」列不同的三处（点名 + 理由）**

- **#15 的 `最小四步` ⇒ `最小形态`**：清单写「全部按「六步」重取」；本席只把**步数**改成六，把那个**名**换成 `最小形态`——提示词面这条规则的名字是 `The minimum form for a simple change`，写成「最小六步」会造出一个读不出所指的标签。
- **#3 换成读数形**：清单只要求副本按现况重取；那处围栏原是「改前 ∥ 改后」两条指令，落地后同块里两套数并存，故换成一句现况读数。
- **#5 只动依据列**：清单要求「标题面目标形按现况重取」；该行的「原句摘要」格装的是**改前值**（`## Basic flow (four hard steps — no skipping)`），改它就不是那条记录了——故保留原句、只改依据列。

**本轮三处裁定（父侧）的落地**

- **① `discipline-normal.md` 不改**：普通模式没有批档、评审门、回写轮，⑤⑥ 是工程模式的机械点 ⇒ **四步在普通模式是对的**，不是第二个口径。`BATCH-LEDGER-REVIEW-UNIFY.md` §2.19「不动普通模式的四步」据此保留；本席未动该档。
- **② 围栏外五句的逐字目标形已定**，住 `BATCH-RECORD.md` §5.4「围栏外的五处逐字目标形」围栏（唯一副本）。其中四句英文与盘上一字不差（实施席自撰的四句成立，**追认**，无需返工）；第 5 句（③ 的指针化）需实施轮改一笔。
- **③ 漂移的住所 = §5 清单**：读者是派单时的父侧（⑥ 材料半读清单）与回写轮的设计席，两处都读 §5；交付报告只被父侧当轮读一眼，收口的三面对读取不到它。⇒ 终检 ⑥ 换成指回清单的一句，逐字见围栏第 5 行。

**扫面（回写轮自己的：域 = 本仓设计档全文，命中串 `four steps` ∥ `四步`）**

- **修 3 处**：`BATCH-RECORD.md` §5.4「已读到的样本」（两处引文随本轮落笔过期）· 同节「样本不止这一档」（两处）· `BATCH-LEDGER-REVIEW-UNIFY.md` §2.19 越界段「四步一步不跳」⇒ 六步（**§5 清单漏了这一处**——同一条规则、同一命中串，本轮按扫面补上）。
- **判「别的东西」不动**（与 §5 同判）：解析序四步 · 判面取法四步 · 镜像就位四步 · 恢复四步 · 升级支四步 · 配置写四步 · 承接修复四步 · 实施顺序四步（`ENGINEERING-MODE-V2.md` §13.24 是另一件事）。
- **判「历史对照」不动**：`DOC-DISCIPLINE.md` §1 D17 细则的「旧流程（四步）走到「实施完成」就结束」——它标的是旧流程，不是现流程。
- **判「记录面读数」不动**：`PROMPT-SYSTEM.md` §6.93 的 `none found` 列仍含探针串 `Sixteen doc-update disciplines`，原文带「落地前各零命中」。它是那一刻的读数，今天该串有命中——见上抛 1。

**未落（1 条，写权不在本席）**

- ③ 的另一半：`thincoder-core/prompts/persona-eng-coder.md` 终检第 ⑥ 项两行（现文「Report any design-doc drift your diff touches … in the delivery report」+ 其 `Why:` 行）整段换成围栏第 5 行。提示词 = 产品代码面（D1 笔 = eng-coder），本席给逐字目标形、不动笔。

**回写轮机检**：`doc_check({mode:"gate", docs:[本轮七档]})` ⇒ 首行 `DOC-CHECK GATE: PASS`（0 段有问题 · 7 档全清）。回执另带 8 条「已裁定假阳」——`PROMPT-SYSTEM.md` 里一个运行期操作数路径被判档缺；它是运行期读的字面量、不是文档指针，属既有登记，非本批。

### 上抛项（回写轮）

**1 · [上抛·待裁] `PROMPT-SYSTEM.md` §6.93 的 `none found` 列仍含探针串 `Sixteen doc-update disciplines`。**

- **现文**：「… `Deleting the body and leaving the sentences that point at it is not deleting it` ∥ `Sixteen doc-update disciplines` 在提示词面逐串实扫（内置 `grep` 跨 …），落地前各零命中」。
- **为什么不改**：它是 D16 落地轮**那一刻**的读数（当时为零命中），今天该串在提示词面有命中；按父侧本轮「清单外的不碰」未动。两条读法不同：① 当它是一次性探针串 ⇒ 删；② 当它是带「落地前」限定的历史读数 ⇒ 留。
- **三件齐**：谁裁 = 用户 · 条件 = 本批 §2 上抛项回复时 · 到期 = 收到即删该串，或裁「留并写明它是一次性探针」。

**2 · [上抛·知会] 提示词面一笔待实施轮，写权不在本席。**

- `thincoder-core/prompts/persona-eng-coder.md` 终检第 ⑥ 项两行（现文 `⑥ **Report any design-doc drift your diff touches** (module map / affected-files table) in the delivery report.` + 其 `Why:` 行）整段换成 `BATCH-RECORD.md` §5.4 围栏第 5 行（逐字已定）。
- 不落的后果：漂移有两个地址（§5 清单 ∥ 交付报告），收口的三面对读只读得到前者。

### 改向轮（用户 2026-11-12 02:05：D17 从「工序」改成「边界」）

**用户原话**：「其实造成落地完了以后文档落后了的原因，其实是我们把文档写错了地方。设计文档从一开始就应该写目标态，而这一轮怎么改其实是应该写在批档里的。」

**本节的现设计以此轮为准。** §2 上文各节是改向前一轮的完整记录（历史），**不得据此实施**；本轮已就地删除其中最危险的一节（见本节末「删掉的那一节」）。

### 条目（本批覆盖 · 现设计）

| # | 条目 | 覆盖形态 |
|---|---|---|
| ① | **D17 = 载体边界** | `docs/core/design/DOC-DISCIPLINE.md` §1：D17 表行改成边界条 + D17 细则块重写（三形命中 · 两种处置闭枚举 · 计划句失去归属归本条 · 与 D11 ∥ D8 ∥ D12 ∥ D14 的分界） |
| ② | **载体面拆掉回写轮** | `docs/core/design/BATCH-RECORD.md`：§5 行为纪律表那一行改「载体边界（D17）」· §5.4 整节重写为「落地核对（收口一行）」· §5.3 第六个前置改「落地核对」· `docs/core/design/DOC-DISCIPLINE.md` 的 D7 行同槽位同轮 |
| ③ | **六步退回四步** | 设计面全部「六步 ∥ six steps」改回四步：`docs/core/design/PROMPT-SYSTEM.md` ∥ `AGENT-LOOP-SUBAGENT.md` ∥ `PORTABILITY.md` ∥ `STRUCTURE-DEBT.md` ∥ `BATCH-LEDGER-REVIEW-UNIFY.md` 五档 |
| ④ | **D 清单第 17 条改形** | 提示词面：`thincoder-core/prompts/discipline-engineering.md` 的 `17.` 条由「落地回写」改写成边界条；`persona-eng-coder.md` ∥ `persona-eng-designer.md` ∥ `persona-engineering.md` 三处回写段与收口核对段删除 |

**不在本批**：不设回写轮 ∥ 不设清单交付物 ∥ 不设第二个核验时点 ∥ 不为它开机检门 ∥ 不改六段作者表 ∥ 不批量重写存量设计档（存量按 D17 触碰批处理）。

### 判据面与载体面（判据与载体分住，D2）

- **判据面** = `docs/core/design/DOC-DISCIPLINE.md` §1 的 D17 表行与 D17 细则块（谁判 · 判哪三形 · 两种处置 · 分界）。
- **载体面** = `docs/core/design/BATCH-RECORD.md` §5.4（收口一行 + 固定句）· §5.3 的收口槽位 · §5 行为纪律表的 D17 行。
- 两处互不重述：判据住前者，形与动作住后者。

### 关键决策

- **KD-1 D17 判「住所」，不判「时序」。** 症状是文档落后，根因是过程语句被写进状态档。补一道回写工序＝让错的写法多跑一轮——本批第一轮就实跑了这一轮：派了一轮设计席、收了一张 20 条清单，去给住错地方的句子补时序。**被否：保留回写轮、只把它做轻。**
- **KD-2 收口只留一行。** 「句子陈旧但两边都对」这第三种情况不存在；它之所以存在，就是因为设计档里混进了计划句。计划句一进批档，收口只需判一件事：那一句的处置定了没有（代码写错了 ∥ 目标变了）。
- **KD-3 六步回路成四步。** ⑤⑥ 是回写轮的步子，轮子拆了，步骤回路。**不保留任何「实施后有人去改设计档」的步骤**——留一步就是换个名字留着回写轮。
- **KD-4 设计档不引提示词现文。** `docs/core/design/PROMPT-SYSTEM.md` 里几处 `依据 …「<提示词逐字>」` 在落地期必然相抵：设计档写目标态（四步）、提示词面尚未回退（六步）⇒ 写前门当场判 `引缺`（本轮实撞一次）。改为「节名 + 目标态」，不引现文——一句被引的现文是读数，读数会陈（D12）。
- **KD-5 写权分区**：判据面与载体面三档 = 本席（已落）· 提示词四档 = `eng-coder`（内容 = 本节条目 ④ 给的目标形）· 需求档 §13.1 与 §1、标准层 = 主 agent（本席只报）。

### 受影响文件（机读清单）

```text
| 档 | 分拆方案 |
|---|---|
| docs/core/design/DOC-DISCIPLINE.md | — |
| docs/core/design/BATCH-RECORD.md | — |
| docs/core/design/PROMPT-SYSTEM.md | — |
| docs/core/design/AGENT-LOOP-SUBAGENT.md | — |
| docs/core/design/PORTABILITY.md | — |
| docs/core/design/STRUCTURE-DEBT.md | — |
| docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md | — |
| thincoder-core/prompts/discipline-engineering.md | — |
| thincoder-core/prompts/persona-eng-coder.md | — |
| thincoder-core/prompts/persona-eng-designer.md | — |
| thincoder-core/prompts/persona-engineering.md | — |
| thincoder-core/prompt-overlays.mjs（清单外 · 实施席落地时补改） | — |
```

**档层结论**：本批十二档 = 十一档 `.md`（`.md` 不出档位标记）+ **一处源档** `thincoder-core/prompt-overlays.mjs` ⇒ 无越线档、无分拆方案；零用例档。

**这一处源档是清单外改动，已披露**：它落在 `docs/` 面之外，实施席落地时按「该行注释指的就是本批改的那一节，不改即是盘上一条假陈述」补改（`SCENARIO_SLOT_FILES` 的 `tester` 行注释一行）。原先的清单与「改动全在 `.md`」一句都漏了它——清单与结论由此按盘面重取，不留在别的轮次里当暗账。

### 提示词面目标形（实施席照落，内容 = 本节给）

**逐字形 = 本节下面这几块，全批唯一副本**。`docs/core/design/BATCH-RECORD.md` §5.4 只给载体形与收口动作（节名 `落地核对（收口一行）`），**不持提示词面的逐字目标形**——那是本批的计划句，按 D17 住批档（§2 任务书 ∥ §5 实施记录）。派单时说「逐字目标形在 §5.4」是错指向；找逐字形来本节。

**D 清单第 17 条改形**（`thincoder-core/prompts/discipline-engineering.md`，三件同笔：节标题 `(D1–D17)` ∥ 条数句 `Seventeen doc-update disciplines:` ∥ 末条正文）：

```text
17. **D17 carrier boundary** — a design or requirement document states what should be now, never how this batch will change it: no
    "this batch will…", no "will be added", no "to be verified". The plan lives in the batch record — §2 for what changes, §5 for what
    changed. A design sentence the landing contradicts is only ever one of two things: the code is wrong, or the target moved (a design
    change). There is no third case "stale but both are right" — that case only exists when a plan was written into the design.
    Why: the document lags because the wrong thing was written in the wrong place, not because a step was missing — no write-back round
    can fix a sentence that never belonged there.
```

**Basic flow 退回四步**：节标题改 `## Basic flow (four steps, in order)`；节内第 5、6 步（`Update the docs` ∥ `Check the docs`）整段删除；同档四处「six steps」族句子改回 `four steps` 与四步枚举（`Requirements → Design → Development → Testing`）。

**三处回写段删除**：`persona-eng-coder.md` 的 `**Landing write-back**` 段 · `persona-eng-designer.md` 的 `**Write-back round**` 段 · `persona-engineering.md` 的 `**Design write-back check**` 收口段——连同各自的 `Why:` 行整段删（D8：不留尸体）。

**收口一句（住 §5，不新增步骤）**：实施席落地时若发现设计档某句不成立，在 §5 记一句「落地过程中发现设计档哪一句不成立：〈档 + §节 + 逐字〉」；没有就写 `落地核对：无`。

### 验收对照（条目 → 判据落点 → 读者怎么判它没做）

| 条目 | 判据落点 | 失败面（读者照着读就能说「没做」） |
|---|---|---|
| ① | `docs/core/design/DOC-DISCIPLINE.md` §1 的 D17 行与细则 | 细则里还能读出「派设计席」「清单」「两个时点」任一 ⇒ 没做；两种处置缺一 ⇒ 没做 |
| ② | `docs/core/design/BATCH-RECORD.md` §5.4 与 §5.3 槽位 | §5.4 还留着六列清单 ∥ 回写轮派单 ∥ 三面对读任一 ⇒ 没做；§5.3 的槽位仍叫「设计档回写核对」⇒ 没做 |
| ③ | 五份设计档 | 任一档仍写「六步」指这条开发流程 ⇒ 没做 |
| ④ | `thincoder-core/prompts/` 四档 | 第 17 条仍是 `landing write-back` ∥ 三处回写段仍在盘 ⇒ 没做；`## Basic flow` 仍 `six steps` ⇒ 没做 |

### 按新边界，今晚那 20 条清单里哪些本就不该出现（改动本身的证据）

**答：4 条 —— #1 · #3 · #19 · #20。**

| 清单号 | 它的形态 | 为什么本就不该在设计档里 |
|---|---|---|
| #1 `D-PS16` | 「…落地后本句改写为 `D1–D17` 十七条，那一笔属 D17 的回写轮」 | 一句写在设计档里的**计划**：说的是「这一轮会怎么改」 |
| #3 §6.93 快照块 | 提示词那节的逐字副本 + 计数 | 某一刻的**副本读数**，随被引档一变就陈（D2 ∥ D12） |
| #19 `BATCH-RECORD` §5.4 流程句条 | 「落点 = … 标题由 four steps 改 six steps」 | **落点计划**，本该住 §2 任务书 |
| #20 同档 §5.4 提示词面落点区 | 「本节要补的是第 17 条」「节当前 = 16 条」「四段提示词面同批落」 | 同上：三条都是「这批怎么改」 |

**其余 16 条不是欠账，是设计变更。** #2、#4–#18 都是设计档按目标态写的现况句（「纪律层四步描述的是…」「该节现名是…」）。它们落地后变，只有两种原因：

- **目标变了**——四步改六步那一次，确实是一次设计变更。
- **代码写错了**——这 16 条里没有一条属于这一形。

**这就是回写轮存在的理由本身出错的证据**：清单分不出「该改设计」与「该改代码」，只能一律让人去改设计档。

**这一条也是 KD-1 的读数**：本批第一轮花了「一轮设计席 + 一张 20 条清单 + 四份设计档三十余处落笔」，其中真正属于「写错地方」的只有 4 条；另 16 条本该走设计变更评审，或本来一句都不用动。

### 上抛项（改向轮）

**1 · [上抛·知会] 提示词四档 = 实施轮笔。** 本席不动英文面；目标形已在上文「提示词面目标形」给全（第 17 条改形 · Basic flow 退回四步 · 三处回写段删除）。内容归属 = 主 agent 确认，落笔 = `eng-coder`。

**2 · [上抛·知会] 需求档三处仍是旧口径（主 agent 笔）。**

- `docs/core/requirements/ENGINEERING-MODE-V2.md` §1 现读「六步流程、评审门、批次档、台账，都是为这件事服务的机器」⇒ 建议改「四步流程」。
- 同档 §13.1 的 D7 行仍带「设计档回写核对（§5 清单 ↔ §2 回写轮 ↔ 设计档现文三面对读）」⇒ 建议改「落地核对（§5 记了设计档哪一句不成立 ⇒ 处置已定：代码写错了 ∥ 目标变了；未定不收口）」。
- 同档 §13.1 的 D17 行仍是回写轮的措辞 ⇒ 建议按 `docs/core/design/DOC-DISCIPLINE.md` §1 的现文同轮改。

**3 · [上抛·知会] 标准层还有一处「六步」（主 agent 笔）。** `docs/core/standards/METHODOLOGY.md` §2.4 的 `F5-1` 判定句现读「任何一点都得走完 F2-1 的六步，没有跳步通道」——`F2-1` 已由用户改回四步，这一句是它的邻居，同轮改「四步」。

**4 · [上抛·知会] `doc_check` 回执带「登记未命中 1 条」。** 登记住 `PROJECT-MANIFEST.json` 的 `docCheckExemptions`（主 agent 笔域），本席只报不写。

### 机器读数（D12：数住记录面）

- **档层读数**（`doc_check` 的 `lines` 面，本批十二档全量）：`合计 12 档（其他检查硬线 0 · 设计器硬线 0 · 未越线 12）`——含清单外那一处源档（`thincoder-core/prompt-overlays.mjs`，实读 84 行，在 500 设计器硬线之下）。
- **文档机检门**：`doc_check({mode:"gate", docs:[本批八档]})` ⇒ 首行 `DOC-CHECK GATE: PASS`（0 段有问题 · 8 档全清）。回执另带 8 条「已裁定假阳」（`PROMPT-SYSTEM.md` 里一个运行期操作数路径）与「登记未命中 1 条」——登记住 `PROJECT-MANIFEST.json`（主 agent 笔域），本席只报。

### 修正轮 3（§3 评审轮 6 → 逐条处置）

评审轮 6 = `changes-required`（🔴1 · 🟡4）。归本席 3 条（1 🔴 + 2 🟡）；🔴 之外的 🟡 两条正是用户判据点名的同一个病（同一件事在文档里两个说法）。另两条不归本席：需求档 §13.1 的空行 = 父侧笔、已修；轮 6 的 🟡5 = 上轮 §4.22 ∥ §4.23 存量项，不在本轮声明对象内。

| # | 处置 | 落点与落成的句子（本席已落盘） |
|---|---|---|
| 1 🔴 | §5.3 按 §5.4 收正——漏写不代填 | `docs/core/design/BATCH-RECORD.md` §5.3「落地核对」槽现读：「两者都不是 ⇒ 不收口。§5 记的是固定句 `**落地核对：无**` ⇒ 放行；两句都没有 ⇒ 判实施席漏写，**打回 §5**，收口面不代填「无」——口径 = 本档 §5.4」 |
| 2 🟡 | 现场块去计数、去时序叙述，留可复跑指针 | `docs/core/design/DOC-DISCIPLINE.md` §1 D17 细则「现场（可复跑）」现读：「§5.4 的历史版本里读得到三句计划句……」＋复跑 = `git log -S 本节要补的是第 17 条 -- docs/core/design/BATCH-RECORD.md`；后果句改关系句：「照这三句办，就必然多出一道「给住错地方的句子补时序」的工序」 |
| 3 🟡 | 判读点两处枚举收齐 | 同档 §1 D17 表行现读：「判读点 = 设计席自检（写的那一刻）∥ 设计评审 ∥ 收口核销」——与细则块三值同拍 |
| 4 | 扫面连带（同一条规则、同一病，本轮新撞见同轮修） | ① `docs/core/design/DOC-DISCIPLINE.md` §1 D7 行「落地核对」槽：原读「§5 无该行记「无」一行」⇒ 改与 §5.4 同句的三态。② `docs/core/design/BATCH-RECORD.md` §5.4「收口轮」条：原两分支 ⇒ 三态——原形下，实施席照规矩写下的固定句 `**落地核对：无**` 在收口轮无处可去（既不是「处置已定」，一读就像「未定」） |

**扫面结论（用户判据 = 同一件事在这份文档里还有没有第二个说法）**

- **`落地核对`三处同句**：`docs/core/design/BATCH-RECORD.md` §5.4（判据与动作）∥ 同档 §5.3（收口槽位）∥ `docs/core/design/DOC-DISCIPLINE.md` §1 的 D7 行（核销同步清单槽位）——三处都读作三态：有「哪一句不成立」句 ⇒ 判处置 ∥ 有固定句 ⇒ 放行 ∥ 都没有 ⇒ 打回 §5、不代填。
- **`判读点`两处同值**：D17 表行 ∥ D17 细则块，三值相同。
- **提示词面（实读，非本席笔）**：`thincoder-core/prompts/persona-engineering.md` 的 `Landing check` 读「no such line in §5 ⇒ the implementer skipped it — send it back to §5, which carries `**落地核对：无**` when nothing was untrue」——与三态同向，不改。
- **需求档 §13.1 的 D7 行（父侧笔，实读）**：读「§5 一行 ↔ 设计档现文：对不上只有两种因」——不带代填指令、与 §5.4 不冲突，但也没有「两句都没有 ⇒ 打回」那一支；是否补齐见下方上抛 1。

**机检**：`doc_check({mode:"gate", docs:["docs/core/design/BATCH-RECORD.md","docs/core/design/DOC-DISCIPLINE.md"]})` ⇒ 首行 `DOC-CHECK GATE: PASS`（0 段有问题 · 2 档全清）。回执另带「登记未命中 1 条」——登记住 `PROJECT-MANIFEST.json` 的 `index.docCheckExemptions`（主 agent 笔域），本席只报不写。

**本轮口径**：四处改动逐一对得上上表的序号；没有序号支撑的句子一律没动（D17 边界：不顺手重写整节）。第 4 条虽不在评审点名的三条里，但它是同一条规则在同一份文档里的第二、第三个说法，留着就是下一轮的 #1。

### 上抛项（修正轮 3）

**1 · [上抛·知会] 需求档 §13.1 的 D7 行没有「漏写」那一支（主 agent 笔）。**

- 该行现读：「**落地核对**（§5 一行 ↔ 设计档现文：对不上只有两种因——代码写错 / 目标变了；没有「句子陈旧而两头都对」这第三种——口径 = `docs/core/design/BATCH-RECORD.md` §5.4）」。
- 它不冲突（口径已指 §5.4），但读者只从这一行推不出「§5 什么都没有 ⇒ 打回」。三态齐的逐字建议（接在「这第三种」之后）：「；§5 两句都没有 ⇒ 判实施席漏写、打回 §5，收口面不代填」。
- 三件齐：谁裁 = 主 agent · 条件 = §4 批准前 · 到期 = 批准即落，或裁「该行只留口径指针、不列三态」。

## §3 设计评审（评审子代理）
**状态行**：进行中（第 5 轮打回）



### 轮次 1（评审子代理）

| # | 严重度 | 状态 | 证据（指针） |
|---|---|---|---|
| 1 | 🔴 | 未处置 | `DOC-DISCIPLINE` §1「D17 细则」的「现场（可复跑）」引 `DOC-CHECK.md` `#### 2.9.7 档层结论` 写「越 800 硬线，本批分拆，不推下批」，并判「那句没人改」；该节现文为「五族分拆已落地」「`index.mjs` 已回到线下」——被引句在 `DOC-CHECK.md` 全文零命中（检索式 `800\|分拆\|没人改`），该支场景在盘不成立 |
| 2 | 🔴 | 未处置 | `BATCH-RECORD` §5.4「提示词面落点」条「节标题与条数句同笔改 D1–D17 ∥ Seventeen，并补一行：17.」 ⟷ `PROMPT-SYSTEM` §7 `D-PS16`「提示词清单 = `D1–D15` 十五条」· K6「清单仍是 `D1–D15`、十五条」· 落点 ⑩续「### Doc update discipline (D1–D16)」——同一张清单三个数并存；`D-PS16` 是 `DOC-DISCIPLINE` D11 细则点名的声明面，未入 §5.4 落点表、也未按 D11 上抛 |
| 3 | 🟡 | 未处置 | `BATCH-RECORD` §5.3 标题「§6 收口要求与五前置（…）」⟷ 同节正文新增槽位「**设计档回写核对**」（D3：计数与列表同时改） |
| 4 | 🟡 | 未处置 | `ENGINEERING-MODE-V2` §13.1 的 D7 行核销同步清单枚举止于「用户文档面同拍 / 台账可见面」，无「设计档回写核对」；`DOC-DISCIPLINE` D7 行已含该槽位（跨层滞后，D11 声明面） |
| 5 | 🟡 | 未处置 | 同一份 §5 清单的列数三处不同：需求 D17 行「哪份档 / 哪一句改前逐字 / 现况应该是什么 / 依据」· 设计 D17 行「档 / 定位 / 改前逐字 / 现况 / 依据」· D17 细则「六列：`#` ∥ 档 ∥ 定位（节名）∥ 改前逐字 ∥ 现况 ∥ 依据」；§5.4 的「回写轮」又要求「清单号 → 落点」，而 `#` 列在后两种摘要里没有位置 |
| 6 | 🟡 | 未处置 | D17 无「新名三问」、无逐支「依据」表——同套兄弟节（§4.22 ∥ §4.23）两件都带；D17 的新名 = 固定句「**本批落地改写的设计语句：无**」· `### 回写轮（落地回写）` · §6 槽位「设计档回写核对」，两支负向分支 = 「清单为空 ⇒ 不派轮」「设计席否决 ⇒ 停、上报」 |
| 7 | 🟡 | 未处置 | D17 的提示词面落点只有一处住所 = `BATCH-RECORD` §5.4「提示词面落点（逐字形，同为本条唯一副本）」；`DOC-DISCIPLINE` 的 D17 行无提示词面同步块、也无指针（D8 ∥ D9 ∥ D12 各行各有其一） |
| 8 | 🟡 | 未处置 | `BATCH-RECORD` §5.4「流程句」条落点 = `## Basic flow` 节「标题由 four steps 改 six steps」；标准层 `METHODOLOGY` §2.1 F2-1 仍是「四步硬流程……不跳步」，设计未把该层列为同轮面、也未按 D11 上抛 |
| 9 | 🔵 | 已核 | 尺寸档抽查通过：`design-token.mjs` 340 · `advisor-settle.mjs` 265 · `batch-status-auto-set.test.mjs` 236（量法 = `doc_check` 的 `lines` 面），§4.23「档层结论」的结论行成立；D17 侧改动全为 `.md`，档位判定豁免 |

VERDICT: changes-required
计数：🔴 2 · 🟡 6 · 🔵 1

### 轮次 2（评审子代理）

| # | 严重度 | 状态 | 证据（指针） |
|---|---|---|---|
| 1 | 🔴 | 未决 | `docs/core/standards/METHODOLOGY.md` §2.4 的 `F5-1` 判定句「任何一点都得走完四步，没有跳步通道」 vs 同档 §2.1 `F2-1`「**六步硬流程**」；同层 `docs/core/requirements/ENGINEERING-MODE-V2.md` §1 的「四步流程、评审门、批次档、台账，都是为这件事服务的机器」 |
| 2 | 🔴 | 未决 | `docs/core/standards/METHODOLOGY.md` §2.6 `F7-1`「板块设计文档按**三节 + 变更记录**组织」+ 判定句「变更记录一行」 vs `docs/core/design/DOC-DISCIPLINE.md` §4.5 禁令句「变更记录段 / 不并项与历史沿革族 不得出现在设计档与需求档」+ `docs/core/requirements/ENGINEERING-MODE-V2.md` §13.1 `D8`「变更记录段 / 不并项与历史沿革 已废除」 |
| 3 | 🟡 | 未决 | `docs/core/standards/METHODOLOGY.md` §2.1 `F2-6`「实现坐标 ∥ 设计档对应节 ∥ 先例批」 vs `docs/core/design/DOC-DISCIPLINE.md` §1 D4 细则二「先例坐标不入规范档（禁引无例外…）…同样判违规（例外 = 0）」 |
| 4 | 🟡 | 未决 | `docs/core/design/BATCH-RECORD.md` §5.4「标准层同轮面（D11 点名上抛）：…`F2-1` 现文写「**四步硬流程**…」」——该档现文为「六步硬流程」 |
| 5 | 🟡 | 未决 | `docs/core/design/BATCH-RECORD.md` §5.4 同批落点表第 5 行只点 `D-PS16` ∥ `K6`；`docs/core/design/PROMPT-SYSTEM.md` §6.32 的 `H2` 行「`## Basic flow (four hard steps — no skipping)`」· §6.41 既有件行的 `existing` 名「`## Basic flow (four steps, in order)`」· §6.96.4「四步管顺序」仍在声明面 |
| 6 | 🟡 | 未决 | `docs/core/design/BATCH-RECORD.md` §5.4 同批落点表第 5 行「（即本条的首个应用，见 §2 「本批自己的回写」）」——本档 §2 = 「batchDoc spawn 门禁」，全档无「本批自己的回写」节 |
| 7 | 🟡 | 未决 | `docs/core/design/DOC-DISCIPLINE.md` §1 `D3` 行「机判 = **无**（V2 无机检器…）」 vs `docs/core/requirements/ENGINEERING-MODE-V2.md` §13.1 `D3` 行「仍声明计数处，数量与列表同时改；可机判（V2）」 |
| 8 | 🔵 | 未决 | `docs/core/design/DOC-DISCIPLINE.md` §1 D17 细则「逐支依据（两个负向分支各有现场）」两段为理由句，无观测原话 / 复现命令 |

VERDICT: changes-required
计数：🔴 2 · 🟡 5 · 🔵 1

### 轮次 3（评审子代理）

| # | 严重度 | 状态 | 证据（指针 = 符号名 ∥ 该行原话） |
|---|---|---|---|
| 1 | — | 已修 | `METHODOLOGY.md` §2.4 `F5-1`：「**任何一点都得走完 F2-1 的六步，没有跳步通道**」（原「走完四步」已改，四步/六步两读消失） |
| 2 | — | 已修 | `METHODOLOGY.md` §2.6 `F7-1`：「板块设计文档按**三节**组织」∧「**历史留痕不进本模板**——变更记录段 / 历史沿革族已废除」；判定句「结构机检（三节在场）」 |
| 3 | — | 已修 | `METHODOLOGY.md` §2.1 `F2-6`：「**先例批不作规则出处**——规范档不引批档（D4 细则二，例外 = 0）」 |
| 4 | — | 已修 | `BATCH-RECORD.md` §5.4「标准层同轮面（D11）」条：「该层现文 =「**六步硬流程**…」——与本节流程句同拍，本批不动该层」 |
| 5 | — | 已修 | `BATCH-RECORD.md` §5.4「**第 5 行的扫面不止那两处（D14 一次扫完）**」＋「**已读到的样本**」（H2 行 ∥ §6.41 `existing` 名 ∥ §6.96.4）＋「**回写轮的扫面域** = 本仓设计档全文，命中串 `four steps` ∥ `四步`」 |
| 6 | — | 已修 | `BATCH-RECORD.md` §5.4 同批落点表第 5 行现文「走 D17 正向路：实施席入 §5 清单、设计席回写轮落笔」——「见 §2 「本批自己的回写」」全仓 zero 命中 |
| 7 | — | 已修 | `ENGINEERING-MODE-V2.md` §13.1 `D3`：「机检器未实装（V2 现无对应机检器，判读点 = 设计评审——口径 = `DOC-DISCIPLINE.md` §1 D3）」 |
| 8 | — | 已修 | `DOC-DISCIPLINE.md` §1 `D17` 细则「逐支依据」：「**清单为空 ⇒ 不派轮**：**未观测**」＋「到期条件 = 首个清单为「无」的批次…在那之前不得把它当已验事实引用」 |
| 9 | 🟡 | 新（可选·待定射程） | `DOC-DISCIPLINE.md` §3.16 `O-3`：「域档自持六件：域内决策行 ∥ 文件账 ∥ 验收回指 ∥ 用例 ∥ 上抛与登记 ∥ 变更记录。总览档 = 总览 + 跨域决策 + 索引 + 历史段」——与同档 `D8` 禁令「**变更记录段 / 不并项与历史沿革族 不得出现在设计档与需求档**」并存；`O-5` ⑤「既有变更记录**整块留原址**」同族 |
| 10 | 🔵 | 新（注） | `BATCH-RECORD.md` §5.4「命中串 `four steps` ∥ `四步`」扫面会撞上另一件四步物：`PROMPT-SYSTEM.md` §6.24「推进次序（需求 §13.24「实施顺序」四步 · 硬前置，不许跳」——落点未说明如何与流程四步区分 |

计数：🔴 0 · 🟡 1 · 🔵 1（前 8 条 = 上一轮全部 🔴/🟡/🔵 项，逐条已在盘核过）

VERDICT: pass

### 轮次 4（评审子代理）

### 轮次 4（评审子代理 · 改向轮后复核）

对象 = 提示词四档 + `thincoder-core/prompt-overlays.mjs` 注释。

- **Basic flow 回退**：`## Basic flow (four steps, in order)` 在盘，四处 `four steps` 族句同形。
- **D 清单三件同数**：`(D1–D17)` ∥ `Seventeen doc-update disciplines:` ∥ `17. **D17 carrier boundary**`，与 §2「提示词面目标形」围栏逐字一致。
- **三处回写段**：`persona-eng-coder.md` ∥ `persona-eng-designer.md` ∥ `persona-engineering.md` 全文零 `write-back` 段。
- **装配注释**：`prompt-overlays.mjs` 注释回 `四步流程`。

| # | 严重度 | 状态 | 证据（指针 = 档 ∥ 符号 ∥ 该行原话） |
|---|---|---|---|
| 1 | 🟡 | 新（协调项，非缺陷） | `prompt-overlays.mjs` 的 `tester` 行注释现读「工程纪律装的是四步流程与 §2 账」；§2（改向轮）「受影响文件（机读清单）」十一档全为 `.md`，同节「档层结论」读「本批零源档、零用例档（改动全在 `.md`）」⇒ 这一档 `.mjs` 不在表内（F-R24a） |
| 2 | 🔵 | 新 | `persona-eng-coder.md`「The landing check」的固定句作 `落地核对：无`；`BATCH-RECORD.md` §5.4 的固定句为 `**落地核对：无**`（逐字含粗体标记，两处字面不同） |
| 3 | 🔵 | 新 | `persona-eng-coder.md`「the only two answers are the code is wrong (fix the code) or the target moved (a design change)」未点名裁决者；`BATCH-RECORD.md` §5.4 读「**设计席的回答只有两种**」 |
| 4 | 🔵 | 新（既有，非本轮改动） | `discipline-engineering.md` 设计步「full affected-file list」∧ `persona-eng-designer.md` 设计档 9 项「**Affected-file list**」⟷ `METHODOLOGY.md` `F-R24a`「**受影响文件表归批档 §2，设计档不设**」 |
| 5 | 🔵 | 新（记录面，非提示词缺陷） | 批档 §5 状态行读「实施完成（提示词四档落 D17 与六步流程」，与盘面（四步 ∥ 载体边界）不一致——改向轮的 §5 条目待落 |

VERDICT: pass
计数：🔴 0 · 🟡 1 · 🔵 4

### 轮次 5（评审子代理）

> 状态行重置：第 5 轮打回（changes-required）· 上一轮状态行 = 评审通过 → 进行中 · 2026-11-12

| # | 严重度 | 状态 | 证据 |
|---|---|---|---|
| 1 | 🔴 | 待处置 | BATCH-RECORD §4.22「`档缺`（该 token 在解析根下解不到）⇒ 不进 `hits`、不动首行 verdict、不出行」vs ENGINEERING-MODE-V2 §13.23 第 4 条现役句「已落段的命中同样入拒因」——同一机制（批次档门阻什么）两处两种说法；D11 的声明面同批各落只对 §4.23 做了（需求档 §5.3 (ii) 已在册），§4.22 未做亦未上抛 |
| 2 | 🟡 | 待处置 | BATCH-RECORD §4.9 门 ④「判定输入与阻断集单源 = `docs/core/design/DOC-CHECK.md` §2.9.1 ∥ §2.9.4」；§4.22「受影响面」七项零该档——新收窄只住 BATCH-RECORD §4.22 |
| 3 | 🟡 | 待处置 | §4.23「18 份开放批档 §3 无状态行（含 desk 三份、lane01–12、node-floor）」· §4.22「第二段 316 字符」——设计档携绝对读数（D12 规范面零绝对读数） |
| 4 | 🟡 | 待处置 | §4.23「既有存量不在本批…由主 agent 单独处置」· §4.22「本批不改该支（与 `#2268` 同形，另轮处置）」「分拆随当批实施」——计划句（D17）；`batch-gate-judge.mjs` ∥ `batch-gate-report.mjs` 已在盘 |
| 5 | 🟡 | 待处置 | §4.22 全节零「依据」列（branch provenance 缺）；§4.23「分支依据（逐支一读；填不出依据的支当场删…）」为应有形 |
| 6 | 🟡 | 待处置 | §4.22 零「验收回指（条目 → 判据 → 机检形）」表、零「跑法」行；§4.23 两处齐（「跑法：单测档 = 本批批档同目录同名档」） |
| 7 | 🟡 | 待处置 | §4.21「判据句（为何是 0）：…属内部机制——没有业务用户在这个面上进入产品」vs §4.22 48-1「业务入口 = 评审 ∥ 设计席用 `batch({action:"append"})` 写 §2 ∥ §3 时读回执」——同类改动两种判法 |
| 8 | 🔵 | 备查 | §4.23「机制面**零新名**」紧接「两处新增，各一支」 |
| 9 | 🔵 | 备查 | §4.22「档层结论：`thincoder-core/agent-tools/batch-gate.mjs` 设计时读数过 500…」——其余六档不越线的结论未落一句；doc_check `lines` 实量为未越线（9 档 · 越线 0） |

计数：🔴 1 · 🟡 6 · 🔵 2（共 9 条）

VERDICT: changes-required

### 轮次 6（评审子代理）

**第 2 轮复审对象** = D17 载体边界改写（DOC-DISCIPLINE §1 D17 行 ∥ D17 细则块 · BATCH-RECORD §5.4 · 需求档 §13.1 D7 ∥ D17 行 · METHODOLOGY §2.1 F2-1 ∥ §2.4 F5-1）；声明面排除 §4.22 ∥ §4.23。

| # | 严重度 | 状态 | 证据（指针） |
|---|---|---|---|
| 1 | 🔴 | 未决 | BATCH-RECORD §5.4「§5 无该行 ⇒ 判实施席漏写，打回 §5」 ∥ 同档 §5.3「§5 无该行记一行「落地核对：无」」——同一条件两种处置（收口自填放行 ∥ 打回） |
| 2 | 🟡 | 未决 | 需求档 §13.1：D16 行与 D17 行之间一空行 ⇒ D17 行脱离表头，渲染成散文行 |
| 3 | 🟡 | 未决 | DOC-DISCIPLINE §1 D17 细则「现场（可复跑）」含「收了一张 20 条的清单」——一次运行产出的绝对值进了设计面（D12） |
| 4 | 🟡 | 未决 | D17 表行「判读点 = 设计评审 ∥ 收口核销」 ∥ 细则块「判读点 = 设计席自检 ∥ 设计评审 ∥ 收口核销」——枚举两读 |
| 5 | 🟡 | 未决（超出本轮声明对象，仍实读在盘） | 上轮 9 项：`18 份开放批档` · `分拆三族，分拆随当批实施` · `证据格的职责是**指向**`（§4.22 无依据列） · `机制面**零新名**`；其余 5 项本轮未复核 |

**已核而过项**：D17 判据句四层同拍（设计档 DOT 细则 ∥ 需求档 §13.1 D17 行 ∥ 纪律层第 17 条 ∥ F2-1 范围边界）、落地核对载体形三处同向（§5.4 ∥ coder persona ∥ engineering persona）· METHODOLOGY `F2-1` ∥ `F5-1` 均读「四步」· 全仓 `six steps` 族仅余记录面与 PROMPT-SYSTEM 的两处「four hard steps」旧名 · 无「回写轮」残留。

计数：🔴 1 · 🟡 4。

VERDICT: changes-required

## §4 用户批准（主 agent）
## §5 实施记录（eng-coder）
**状态行**：实施完成（改向轮已落：D17 = 载体边界、Basic flow 退回四步、三处回写段按载体档收口句重落；逐处改前 ∥ 改后在前一段，落地核对记 §2 的「零源档」与盘面相抵）



### 实施记录（eng-coder）

**交付面**：本批落的全部在 `thincoder-core/prompts/` 四档 + 一处清单外注释。设计档零写——`docs/core/design/PROMPT-SYSTEM.md` 归设计席的回写轮（§5.4「提示词面落点」里设计档面那一句：走 D17 正向路），本席只出材料，见下「⑤ 材料」。

**落了什么（逐件）**

- `thincoder-core/prompts/discipline-engineering.md`：`## Basic flow` 节标题 `four steps` ⇒ `six steps`；节内按 `docs/core/design/BATCH-RECORD.md` §5.4「流程句」围栏逐字补第 5、6 步（含两条 `Why:`）；D 清单节标题 `(D1–D16)` ⇒ `(D1–D17)`、条数句 `Sixteen doc-update disciplines:` ⇒ `Seventeen doc-update disciplines:`、末条补 `17. **D17 landing write-back**`（围栏第一段逐字）。
- `thincoder-core/prompts/persona-eng-coder.md`：`**Landing write-back**` 段（围栏第二段），挂在 Batch-record discipline 的 §5 那条之后。
- `thincoder-core/prompts/persona-eng-designer.md`：`**Write-back round**` 段（围栏第三段），挂在 Two deliverables 节末。
- `thincoder-core/prompts/persona-engineering.md`：结算清单第 3 项加 `**Design write-back check**`（围栏第四段），紧随 doc-check gate 那一支之后。
- 清单外一处：`thincoder-core/prompt-overlays.mjs` 的 `tester` 行注释「工程纪律装的是四步流程与 §2 账」⇒「六步流程」——该注释指涉的对象就是这次改的那一节，留下即盘上一条假陈述。改后 `Syntax: OK`。

**起点核对（§5.4 要求先数再动笔）**：改前该节 = 16 条，三件同数（节标题 `(D1–D16)` ∥ 条数句 `Sixteen doc-update disciplines:` ∥ 末条 `16.`）；改后 = 17 条，三件同数（`(D1–D17)` ∥ `Seventeen doc-update disciplines:` ∥ `17.`）。数出来是 16 ⇒ 照单落；「不是 16 ⇒ 停下上报」这一支未用到。

**提示词面逐处改动（含围栏外四处与清单外一档，如实列）**

| # | 档 | 定位（节名） | 改前逐字 | 改后 | 依据 |
|---|---|---|---|---|---|
| 1 | `thincoder-core/prompts/discipline-engineering.md` | `## Basic flow` 节标题 | `## Basic flow (four steps, in order)` | `## Basic flow (six steps, in order)` | 围栏「标题由 four steps 改 six steps」 |
| 2 | 同档 | What this mode runs on 第 1 条 | `**Every dev task walks the four steps, no skipping**: Requirements → Design → Development → Testing.` | `…six steps…: Requirements → Design → Development → Testing → Update the docs → Check the docs.` | 围栏外：枚举不多这两步即不再完整（D11 同轮） |
| 3 | 同档 | How a good engineer moves 节末 | `The four steps are the quality gates and their order` | `The six steps are the quality gates and their order` | 围栏外；同上 |
| 4 | 同档 | Why this mode exists 节 | `The four steps, the review gates, the batch record, the ledger and the role split are machinery` | `The six steps, the review gates, …` | 围栏外；同上 |
| 5 | 同档 | 第 1 条「最小形态」句 | `all four steps happen in order, and none requires a full-size document` | `all six steps happen in order, …` | 围栏外；同上 |
| 6 | 同档 | Doc update discipline 三件 | `(D1–D16)` ∥ `Sixteen doc-update disciplines:` ∥ 无第 17 条 | `(D1–D17)` ∥ `Seventeen doc-update disciplines:` ∥ `17. **D17 landing write-back** …` | 围栏第一段 |
| 7 | `thincoder-core/prompts/persona-eng-coder.md` | Batch-record discipline | 无 | `**Landing write-back** … You supply material, not the pen.` | 围栏第二段 |
| 8 | `thincoder-core/prompts/persona-eng-designer.md` | Two deliverables 节末 | 无 | `**Write-back round** … do not land it.` | 围栏第三段 |
| 9 | `thincoder-core/prompts/persona-engineering.md` | 结算清单第 3 项 | 无 | `**Design write-back check** … one line in §6.` | 围栏第四段 |
| 10 | `thincoder-core/prompt-overlays.mjs`（清单外档） | `SCENARIO_SLOT_FILES` 的 `tester` 行注释 | `工程纪律装的是四步流程与 §2 账` | `工程纪律装的是六步流程与 §2 账` | 注释所指那一节已改（假陈述不留） |

**围栏外那四处的判定与代价（如实）**：围栏只给标题与第 5、6 步的逐字文本，四处写的是「四步」；不改则六步标题之下仍躺着「四步是按序执行的」，验收行「提示词面仍 `four steps` ⇒ 没做」当场不成立。**代价**：这四处的英文是本席拟的，而同档 D1 写着「Prompt content comes from the main agent」——故本席把它们列进本表请追认；不追认的处置 = 回写轮给逐字目标形，本席照落。

### ⑤ 材料：本批落地改写的设计语句（§5.4 六列 · 清单非空）

**量法**：`node` 行扫描，扫面域 = `docs/` 下各 `design` 目录的全部 `.md`，命中串 `four steps` ∥ `Four steps` ∥ `四步` ⇒ 132 档里 20 档命中、合计 95 处；逐处判类 ⇒ **指这条开发流程 68 处 · 指别的东西 27 处**。下表是那 68 处里**被本批落地改写成不成立**的那些（同节逐条合并、逐处给逐字）。

| # | 档 | 定位（节名） | 改前逐字 | 现况 | 依据 |
|---|---|---|---|---|---|
| 1 | `docs/core/design/PROMPT-SYSTEM.md` | §7 关键决策记录 `D-PS16` | 提示词清单 = `D1–D16` 十六条；规范面闭枚举 = `D1–D17`——差的一 = D17；落地后本句改写为 `D1–D17` 十七条，那一笔属 D17 的回写轮 | 清单现况 = `D1–D17` 十七条，两面无差；「落地后…改写」这一条件句已兑现，应写成现况句 | 落地件 = 提示词档三件同数（实读） |
| 2 | 同档 | §7 关键决策记录 `K6` | 清单现况 = `D1–D16` 十六条（节标题 `(D1–D16)` ∥ 条数句 `Sixteen doc-update disciplines:` ∥ 末条 `16.`）；规范面闭枚举 = `D1–D17`，差的一 = D17 | 同 #1 | 同上 |
| 3 | 同档 | §6.93 的快照块（`D16` 落地轮的逐字副本） | `### Doc update discipline (D1–D16)` ∥ `Sixteen doc-update disciplines:` | 提示词面该节现为 `(D1–D17)` ∥ `Seventeen doc-update disciplines:`；该副本已不复制原文 | 实读两档对照 |
| 4 | 同档 | §6.32 `H2` 行 | 现行列 `## Basic flow (four steps, in order)` ∥ 判据格「四步顺序 = 流程机制本身」 | 现行 = `## Basic flow (six steps, in order)`；顺序 = 六步 | 实读提示词档 |
| 5 | 同档 | §6.32 同节落点表行 | `## Basic flow (four hard steps — no skipping)（标题）` | 标题面目标形须按现况与六步重取（设计席定笔） | 实读 |
| 6 | 同档 | §6.34 批准即实施启动 | 纪律层四步描述的是一批工作怎么走 ∥ 把「什么时候派工」与「四步是什么」两件事混进同一节 | 纪律层现描述六步 | 实读 |
| 7 | 同档 | §6.41 落地前先答三问 | `四步顺序与步骤入口` ∥ `的四步节（需求步 · 贴近先例条）` ∥ `name: "Basic flow (four steps, in order)"` | 该节现名 `## Basic flow (six steps, in order)`；节内六个步骤 | 实读 |
| 8 | 同档 | §6.71 开批前先调研 | `## Basic flow (four steps, in order)` 节内、`1. **Requirements**` 之前加一块 ∥ `块在 `## Basic flow (four steps, in order)` 节内` | 该块在盘（节首十条调研），节名已是 six steps | 实读 |
| 9 | 同档 | §6.72 工程模式存在的理由（逐字引文） | `The four steps, the review gates, the batch record, the ledger and the role split are machinery` | 现文 = `The six steps, the review gates, …` | 实读 |
| 10 | 同档 | §6.73.1 逐条删除清单与存量清点表 | 探针 `Every dev task walks the four steps, no skipping` ∥ `discipline · Basic flow` 的条数 `14` 与「四步各自自带理由」 | 探针串现为 six steps；该节步数 4 ⇒ 6，清点读数须重取 | 实读 |
| 11 | 同档 | §6.76 工程无小事 | `四步流程约束的是「走了哪几步」` ∥ `同节第 1 条（四步）` | 六步流程约束的是「走了哪几步」；第 1 条现列六步 | 实读 |
| 12 | 同档 | §6.77 参数零默认值 | `**与四步流程的关系**` ∥ 表行 `## Basic flow (four steps, in order)`（…）需求 → 设计 → 开发 → 测试，不许跳 ∥ `四步流程条首逐字：依据` | 节名与步序按现况（需求 → 设计 → 开发 → 测试 → 更新文档 → 核验文档） | 实读 |
| 13 | 同档 | §6.95 开篇三式与主 agent 责任（含边界句） | `末段采用 §6.96.4 的四步关系句` ∥ `The four steps are the quality gates and their order` ∥ `三式选择步内动作，四步始终按序执行` ∥ `不改四步、评审门、批档、台账与测试机制的判据` | 关系句现读 six steps；三式管步内动作、六步按序执行 | 实读 |
| 14 | 同档 | §6.96.4 `C4` | 标题 `C4：四步管顺序，三式管步内动作` ∥ `**权威详述** = … 的 `Every dev task walks the four steps, no skipping` 与 `Basic flow (four steps, in order)`。` ∥ `all four steps happen in order` ∥ `留：三式前三条、四步顺序、评审与批档门全部不改。` | 四个符号串与两条引文都已改（six steps 族），该节标题与权威详述须按现况重取 | 实读 |
| 15 | 同档 | §6.96.10–§6.96.13 ∥ §6.97.2 | `C4 三式关系句与最小四步` ∥ `最小四步也在纪律档详述，四步顺序仍在` ∥ `走最小四步` ∥ `K4` 行「C4 最小四步只写纪律档」 ∥ `四步流程、父侧调用链、跨层同步与在途 §2 传播` | 全部按「六步」重取（最小形态仍在 D 族条内） | 实读 |
| 16 | `docs/core/design/AGENT-LOOP-SUBAGENT.md` | §6.59.2 纪律槽取档判由 ∥ 同节决策表 `D-TT6` | `装的是四步流程与 §2 任务书，而 tester 不写账、不推进工程流程` ∥ `工程纪律装的是四步流程与 §2 账` | 工程纪律现装六步流程与 §2 账 | 实读两档 |
| 17 | `docs/core/design/PORTABILITY.md` | §4 关键决策记录 行 `D1` | `纯声明制（无声明项目不可用，破坏四步流程）` | 破坏**六步**流程 | 实读 |
| 18 | `docs/core/design/STRUCTURE-DEBT.md` | §1 定位与口径 | `设计 → 评审 → 实现（工程模式四步）` | 工程模式现为六步（需求 → 设计 → 开发 → 测试 → 更新文档 → 核验文档） | 实读 |
| 19 | `docs/core/design/BATCH-RECORD.md` | §5.4「流程句」条 | `落点 = … 的 `## Basic flow` 节（标题由 four steps 改 six steps）` | 已落地：该节现名 `## Basic flow (six steps, in order)`，第 5、6 步在盘 | 本批落地 |
| 20 | 同档 | §5.4「提示词面落点」起点条 ∥ 「本节要补的是第 17 条」条 ∥ 「同一规则的各声明面同批同拍」条 | `节当前 = **16 条**，三件同数：节标题带 `D1–D16`、条数句写 `Sixteen doc-update disciplines:`、末条编号 `16. **D16 a cell filled by inference says so**`。` ∥ `**本节要补的是第 17 条**，同笔改两处计数面为 `D1–D17` ∥ `Seventeen`。` ∥ `四段提示词面同批落——` | 已落地：该节现 17 条、三件同数，四段提示词面在盘；同区里**设计档面那一句仍待落**（`D-PS16` ∥ `K6` 走设计席回写轮） | 本批落地 + 实读该档（该区本轮被另一席改过，见「过程事实」） |

**判为「别的东西」不进清单的（27 处，同一条扫面）**：解析序四步 ∥ 判据四步 ∥ 判面取法四步 ∥ 镜像就位四步 ∥ 配置写四步 ∥ 升级四步 ∥ 承接修复四步 ∥ 实施顺序四步（`docs/core/requirements/ENGINEERING-MODE-V2.md` §13.24 那一件事——**这不是本批的流程四步，改错即把两条规则绑在一起**）。普通模式那条单独见下。

### 清单外的观察（报父侧，本席不改）

- **`thincoder-core/prompts/discipline-normal.md` 的 `Match the process to the task scale` 节仍读**：`(four steps: Requirements → Design → Development → Testing, true for any task)`。它在提示词面、不在本批文件清单、也不在 §5.4 给的回写扫面域（该域 = 设计档全文）⇒ 本席未改：普通模式是否同六步属裁定面。**不落的后果**：同一台提示词里工程纪律说六步、普通纪律说四步。
- **`docs/core/design/DOC-DISCIPLINE.md` §1 D17 细则的「旧流程（四步）」** 与 **`docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` §7 的「不动普通模式的四步」**：今天仍成立（前者是历史对照、后者普通模式本批零动）⇒ 不改。
- **`docs/core/design/PROMPT-SYSTEM.md` §6.24 的「实施顺序四步」**：另一件事（需求档 §13.24 的改档推进次序），与本条流程无关 ⇒ 不动。
- **`discipline-engineering.md` 的 D 清单行与 `persona-eng-coder.md` 终检条「⑥ Report any design-doc drift … in the delivery report」**：后者与新 `Landing write-back` 条对「设计档漂移落在哪」给了两个家（报告 ∥ §5）。围栏外，改笔归主 agent ∥ 设计席 ⇒ 本席只报，不动。

### 机检读数

- **文档机检门**：`doc_check({mode:"gate", docs:[四份提示词档]})` ⇒ 首行 `DOC-CHECK GATE: PASS`，0 段有问题。回执另带「登记未命中 1 条」——该登记住 `PROJECT-MANIFEST.json` 的 `index.docCheckExemptions`（主 agent 笔域），本席只报不写。
- **提示词面扫面**（内置 `grep`，同四串）⇒ 命中 1 处 = 上列普通模式那条。
- **测试面**：`test/` 下同两串 ⇒ 0 命中（没有断言旧串的用例被这次落地打破）。
- **装配面**：`thincoder-core/prompt-overlays.mjs` 只持 scenario → slot 档名表，本次改动不触及装配判据；`Syntax: OK`。

### 验收对照（本批条目 → 落点 → 读者怎么判它没做）

| 条目 | 落点 | 失败面 |
|---|---|---|
| ① ⑤ 材料 | 本节六列表 | 六列缺一列 ∥ 无「改前逐字」可对得上盘 ⇒ 没做 |
| ② ⑤ 落笔 | 不在本席（设计席的 `### 回写轮（落地回写）`） | 清单 20 条无落点 ⇒ 机制空转 |
| ③ ⑥ 两个时点 | 材料半 = 父侧读本节清单；落笔半 = 收口三面对读 | 只剩收口一处 ⇒ 没做 |
| ④ D17 | `discipline-engineering.md` 第 17 条（逐字 = 围栏第一段） | 第 17 条与围栏不逐字 ∥ 三件不同数 ⇒ 没做 |
| ⑤ 四步 → 六步 | `## Basic flow (six steps, in order)` + 第 5、6 步 | 标题仍 `four steps` ∥ 两条步骤句不全 ⇒ 没做 |

### 审校轮次与终态

- **分歧审计**（内部 `explore`，1 轮）：3 条发现，全部是「未落/未披露」型——§5 清单未写、清单外档未披露、围栏外四处未披露。处置：#1 由本节落；#2、#3 由本节与上面的逐处表披露。
- **代码评审**（`advisor` `type="code"`，1 轮）：`changes-required`（🔴1 · 🟡3 · 🔵1）。
  - 🔴（§5 清单为空）= 已落：本节即那张六列表，20 条逐条带逐字与依据。
  - 🟡 普通模式那条 = 披露（裁定面，本席无笔）。
  - 🟡 围栏外四处 = 已逐处列表并请追认（理由与代价见上）。
  - 🟡 `persona-eng-coder` 的两个家 = 披露（围栏外，改笔不归本席）。
  - 🔵 设计师 persona 的位置 = 保留：该节既有同类顶层 bullet（微批那条），本席按现成形落。
- **终态**：`clean`（本席回读自核：四档逐字对围栏、三件同数、清单逐条对盘）。**评审轮 2 未跑**——剩余处置全是披露与追认、不含代码改动，第二轮只会复核同一批文本；这一句是如实记，不是「已收敛」的断言。

### 过程事实（写这一节的时候盘面变过一次）

- **谁变了什么**：`docs/core/design/BATCH-RECORD.md` §5.4 的「逐档落点表（五档）」在本席实施期间被另一席改成陈述句——现读「同一规则的各声明面同批同拍（D11；缺一即本批未完成）」与「逐档落点表归批档 §2，本档不设」。
- **为什么落地不返工**：「流程句」与「提示词面落点」两段围栏逐字未变，复跑对读 9/9 行对得上；变的只是位置。本节凡指该区的句子一律指节名与原句，**不指行号、不指表行号**（清单 #20 已按现文重取）。
- **这对 ⑥ 的材料半意味着什么**：读清单的人按「档 + 节名 + 改前逐字」在盘上找，找不到即清单坏；本轮实跑撞到过一次（三条逐字在盘上已消失），这条纪律当场兑现了一次。**清单的逐字只对当刻成立**——材料半核的是「此刻在对上」，不是「写的时候对上」。

### 改向轮实施（eng-coder · 2026-11-12 02:11 起）

**按本批 §2 的「改向轮」一节落**（用户 2026-11-12 02:05 原话 + 条目 ①②③④ + 提示词面目标形 + 验收对照）。上文那段「实施记录」是改向前那一轮的账，保留原文，不作现机制引用。

**四处逐处（改前 ∥ 改后）**

| # | 档 | 定位（节名） | 改前逐字 | 改后逐字 |
|---|---|---|---|---|
| 1 | `thincoder-core/prompts/discipline-engineering.md` | `## Basic flow` 节标题 | `## Basic flow (six steps, in order)` | `## Basic flow (four steps, in order)` |
| 2 | 同档 | 同节第 5、6 步（整段 9 行） | `5. **Update the docs — the sentences this landing rewrote** — the implementer, in the same §5 write, lists every design-doc sentence this` … ∥ `6. **Check the docs — material first, then the landing** — at dispatch the parent reads §5's list: six columns, a section name, old words` …（各含续行与一条 `Why:` 行） | 整段删除：节在 `4. **Testing**` 之后直接接 `## Engineering judgment (verdicts)` |
| 3 | 同档 | What this mode runs on 第 1 条 | `1. **Every dev task walks the six steps, no skipping**: Requirements → Design → Development → Testing → Update the docs → Check the docs.` | `1. **Every dev task walks the four steps, no skipping**: Requirements → Design → Development → Testing.` |
| 4 | 同档 | How a good engineer moves 节末 ∥ Why this mode exists 节 ∥ 第 1 条「最小形态」句 | `The six steps are the quality gates and their order` ∥ `The six steps, the review gates, the batch record, the ledger and the role split are machinery` ∥ `all six steps happen in order` | 同上三处 `six` ⇒ `four`，其余逐字不动 |
| 5 | 同档 | Doc update discipline 末条 | `17. **D17 landing write-back** — the implementer lists every design-doc sentence the landing made untrue (§5); the design seat lands that list and records it in §2; closeout checks the list, the landing and the docs against each other.` | §2 围栏那 6 行逐字：`17. **D17 carrier boundary** …` 起、至其 `Why:` 行止——node 逐行比对 **6/6 行相等** |
| 6 | `persona-eng-coder.md` | Batch-record discipline 的 §5 条下 | `**Landing write-back** — when your landing makes a design-doc sentence untrue, list it in §5: file, section,` ∥ `the old words verbatim, what it must now say, the evidence; one fixed line when nothing was touched. You supply material, not the pen.` | 三行 `**The landing check**`：记 §5（档 ∥ 节 ∥ 逐字）；**两种处置由收口轮定，实施席只记那一句**；无则不成立句 ⇒ 固定句 `**落地核对：无**` |
| 7 | 同档 | Final review 第 ⑥ 项 | `⑥ **Report any design-doc drift your diff touches** (module map / affected-files table) in the delivery report.` + `Why: the design docs are eng-designer's to edit, so the report is where your drift lands.` | `⑥ **Design-doc drift goes in §5, never only in your report** — the landing check in the batch-record discipline is its one home … and the closeout reads §5.` + 新 `Why:`（你不改设计档；只写在报告里的漂移只被父侧读一眼） |
| 8 | `persona-eng-designer.md` | Two deliverables 第 2 条之后 | `**Write-back round** — when the parent hands you a batch with §5's list, land it in the design docs and record each landing in §2. An item that would change a judgment line, a boundary or a decision is a design change: stop and report, do not land it.` | 整段删除，其后直接接「A micro-batch's §2 is four items…」那条 |
| 9 | `persona-engineering.md` | 结算清单第 3 项 | `**Design write-back check** — §5's list ↔ §2's write-back round ↔ the design docs as they now stand; a mismatch blocks close. No item touched ⇒ one line in §6.` | `**Landing check** — …`（三行：处置二择已定与否；§5 无该行 ⇒ 判漏写、打回 §5；固定句 `**落地核对：无**`） |
| 10 | `thincoder-core/prompt-overlays.mjs`（清单外） | `SCENARIO_SLOT_FILES` 的 `tester` 行注释 | `工程纪律装的是六步流程与 §2 账` | `工程纪律装的是四步流程与 §2 账` |

**第 6、7、9 处为什么不等于「把回写轮换个名字留着」**（用户判据：改完若提示词里还有「实施后派人去改设计档」的意思 ⇒ 没改到根上）

- 三处都不派任何人去改设计档：处置两种（`the code is wrong (fix the code)` ∥ `the target moved (a design change)`），且 coder 面写明 `you do not edit the design docs (that is eng-designer's pen, and it is a design change)`。
- 回写轮的骨架句（`You supply material, not the pen`）随第 6 处整段删除——材料 / 笔两个席位的分工一并消失。
- 载体形单源 = `docs/core/design/BATCH-RECORD.md` §5.4（「收口时实施席记一句」+「本节不改设计档：不派回写轮、不设清单、不设第二道核验」）；三处只是同一句在各面的落点，不是第二套机制。

**第 7 处为什么改（超出用户点的四处，如实披露）**：分歧审计把这一条判为残留——同档给漂移两个家（交付报告 ∥ §5），正是用户判据点名的形态。改后它指回 §5 那一条，不再另立第二个家。

**搜索读数（同一把尺子 = 内置 `grep` / `Select-String`；面 = `thincoder-core/prompts/*.md` + `prompt-overlays.mjs`）**

- `six steps` ∥ `六步` ⇒ **0 命中**。
- `write-back` ∥ `write back` ⇒ **1 命中**：`discipline-engineering.md` 第 17 条 `Why:` 行的 `… not because a step was missing — no write-back round can fix a sentence that never belonged there.`。**留的理由**：它是围栏给的逐字目标形，且是一句**否定**（回写轮治不了根）——正是用户判据允许的那一类。
- `回写` ⇒ **0 命中**。
- `four steps` ⇒ 6 命中（`discipline-engineering.md` 5 处 + `discipline-normal.md` 1 处；普通模式那处本轮不动——本批不动普通模式，四步在普通模式本来就对）。
- **控制读**（同一命令形状打在已知存在的串上）：同批扫 `doc_check` ⇒ 20 命中 ⇒ 扫描面是活的，上面那些 0 不是空跑。

**机检**

- `doc_check({mode:"gate", docs:[四份提示词档]})` ⇒ 首行 `DOC-CHECK GATE: PASS`（0 段有问题 · 4 档全清）。回执另带「登记未命中 1 条」——登记住 `PROJECT-MANIFEST.json` 的 `index.docCheckExemptions`（主 agent 笔域），本席只报不写。
- `node --check thincoder-core/prompt-overlays.mjs` ⇒ `Syntax: OK`。
- 三件同数（D3，node 实算）：节标题 `### Doc update discipline (D1–D17)` ∥ 条数句 `Seventeen doc-update disciplines:` ∥ 条目 `1.`–`17.` ⇒ **17 条**。
- 步数（node 实算）：`## Basic flow` 节内 `1.`–`4.` ⇒ **4 步**；`Update the docs` ∥ `Check the docs` 两个步名在该节零命中。
- 测试面：`test/` 与 `thincoder-core/**/*.test.mjs` 对 `Basic flow` ∥ `four steps` ∥ `six steps` ∥ `Doc update discipline` ∥ `Seventeen` 零命中（59 份测试档全扫）——本次回退没打破任何内容锚；控制读同扫 `doc_check` ⇒ 20 命中。

**审计与评审轮次 · 终态**

- **分歧审计**（内部 `explore`，1 轮）：逐条 (a)/(b)，`DIVERGENCE: 1` —— 第 ⑦ 处残留（漂移两个家），已在本轮修；另指出第 6、9 处「目标形说删、盘上是落地核对」，判为与载体档 §5.4 一致（是收口句的落点，不是替换）。
- **代码评审**（`advisor` `type="code"`，1 轮）：`pass`（🔴 0 · 🟡 1 · 🔵 4），结论落 §3 轮次 4。
  - 🟡 `prompt-overlays.mjs` 不在 §2 机读清单、同节「零源档」与之相抵 ⇒ 记录面归设计席 / 父侧（本席无 §2 笔），已写进下方落地核对。
  - 🔵 固定句字面不一（提示词 `落地核对：无` ∥ 载体档 `**落地核对：无**`）⇒ **已修**：两份提示词一律取载体档那一形。
  - 🔵 「两种处置」未点名裁决者 ⇒ **已修**：写明由收口轮定，实施席只记那一句。
  - 🔵 既有口径分歧（受影响文件表住设计档 ∥ 标准层说归批档 §2）⇒ 只报不改（不在本批改动面，见上抛）。
  - 🔵 §5 记录面滞后 ⇒ 本段即补。
- **终态**：`clean`（评审 `pass`；四条 🔵 中两条本轮已修、一条只报、一条由本段补；🟡 是记录面归属，不在提示词面）。

**落地核对**（载体形 = `docs/core/design/BATCH-RECORD.md` §5.4）

落地过程中发现设计档哪一句不成立：`docs/batches/2026-11-12-design-reflects-reality.md` §2 的「**档层结论**：本批零源档、零用例档（改动全在 `.md`）」（同节「受影响文件（机读清单）」十一档全为 `.md`）——盘上 `thincoder-core/prompt-overlays.mjs` 的 `tester` 行注释本轮随四步回退改回四步形，这一档是源档、不在清单内。

另报一处指针不落地（同类、非本席笔）：本轮交办与 §2 都说「逐字目标形在 `BATCH-RECORD` §5.4（设计席这轮已改好）」，而该节实读只有载体形与收口动作（节名 `落地核对（收口一行）`），没有第 17 条的逐字形；本轮唯一逐字形在 §2 改向轮那块围栏里，本席按它落并 node 比对 6/6 行相等。

**验收对照（本批条目 → 落点 → 读者怎么判它没做）**

| 条目 | 落点 | 失败面 |
|---|---|---|
| ③ 六步退回四步 | `## Basic flow (four steps, in order)` + 四处步数句 | 任一提示词档仍把这条流程写成 `six steps` ⇒ 没做 |
| ④ 第 17 条改形 | 同档末条（与 §2 围栏 6/6 行相等） | 第 17 条仍是 `landing write-back` ⇒ 没做 |
| ④ 三处回写段删除 | coder 的 `The landing check` · designer 整段删 · engineering 的 `Landing check` | 任一处仍是「派设计席按 §5 清单回写」的形 ⇒ 没做 |
| 装配注释 | `prompt-overlays.mjs` 的 `tester` 行 | 仍读「六步流程」⇒ 没做 |

## §6 验证与收口（父代理）
