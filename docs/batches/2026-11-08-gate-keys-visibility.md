# 2026-11-08 · gate-keys-visibility
> 六段，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 每段只有一个作者：作者的段可 `append` 加内容、可就地改（`edit`）；非作者一概拒。
> 编制：主 agent · 2026-11-08 · 来源 = 用户 2026-11-08 16:35「dock_check排除路径在manifest的工具说明和提示词里说了吗?」· 16:36「补,之前还有相关的台账挂账的问题也一起处理了.」。
> 台账 = #2197（core · 归批）。前情 = docs/batches/2026-11-08-doc-check-exclude-paths.md（已收口 2026-11-08）。
> **原绑 #2196 已按用户收窄令退回池**（见 §1 第三条裁定）——本批实做的是「撤快车道」，与 #2196 是两个债。
## §1 讨论（主 agent）
**状态行**：已收口 2026-11-08
<§1 模板占位：本批条目 / 关键判据 / 授权口径>

### 已定决定

- **已定决定**：排除路径要写进提示词（不只工具说明） · 用户原话：「补,之前还有相关的台账挂账的问题也一起处理了.」 · 时间：2026-11-08 16:36

### 本批覆盖三件事

**① 提示词层补「哪些键决定哪些门」**（主件）

现状（实读）：`index.docCheckExcludePaths` 在 `thincoder-core/tool-docs/manifest.md` 有逐字说明，**在 `thincoder-core/prompts/*.md` 零命中**。而提示词里那段「Project state file (PROJECT-MANIFEST)」只讲定位 ∥ 落地 ∥ 谁写，**从不讲哪些键在决定哪些门的判集**。

**为什么这是漏而不是「按惯例不写」**：它是该环境里唯一一个「不声明就与门禁行为不一致」的默认值——按提示词行事的人永远不知道要去声明它，于是每次交付都把批档一起判（`#2194` 那 94 条就是这样来的）。

**范围只开一条**：在 `thincoder-core/prompts/persona-engineering.md` 的项目状态文件那节补一句，说清两个面——`docRoot.*` 决定文档落哪与门扫哪，`index.docCheckExcludePaths` 决定哪些档不进 `doc_check` 判集。**不逐键罗列**（提示词的惯例是结构说明 + 指向工具，逐键罗列就算了）。

**顺带一处实错**：同节写「五个 `docRoot` 子键」，盘上已是六个（含 `standards`）。**改那句时一并改成六个。**

**② `#2196`（已接）**：`docs/core/design/MANIFEST.md` 里「可写节点」三个数（12 ∥ 20 ∥ 14）对不上 + `report` 面「全排除」读法未与抛错规则接线。

**③ `#2190`（一并接）**：`docs/core/design/TIMEOUT-DIGEST.md` §2.3 两处裸名（task 一族 ∥ 完成门一族）拖出 token 集外——那是上一轮「判不了」留下的，本批一并定归属。

### 另有一笔要**销**而非做

`#2191`（花括号形 16 处 / 15 档）的前提已被 `2026-11-08-doc-standard-sync-gate` 取代：那批把抽取面补上了花括号组展开（**有尺了**），并实测改前 **37 处落另外 6 档**、`#2191` 记的那 5 档改后 **0 条**。**旧记载既少记了数也记错了档。**本批收口时按「已被吸收」撤回，不重做。

### 判断边界

- **不逐键罗列提示词**：加一句「哪些键影响判集」，不加一张键表——键表在 `thincoder-core/tool-docs/manifest.md`，两处都写就是第二份规格。
- **不改 `doc_check` 的行为**：本批全是文档面与提示词面。

### 第二批已定决定（同轮追加）

- **已定决定**：撤销「快车道」，不留着制造误会 · 用户原话：「你把快车道那个撤掉,不要留着制造误会了.」 · 时间：2026-11-08 16:40

**撤它的理由（不是我猜的，是它自己造出来的后果）**：

提示词 `thincoder-core/prompts/persona-engineering.md` §Ledger 里写着「**Fast lane** — the user saying urgent / do it now skips **pooling**: single point walks the full flow」。**它只跳「入池」，一步都不减**——可它占着一整条独立的 lane，读它的人自然以为存在第二条流程。

**我本人就是这么读错的**：这一天里我反复问「要不要走完整流程」，根子就在这条。

**而且它本来就是多余的**：同节 `Pool routing` 已经写着「design does not start until the user says start this batch」——**用户说「现在就做」本来就等于「现在就开工」，不需要第二个名字。**

### 要撤的四处（D11 同一条规则的各层）

| 层 | 位置 | 现状 |
|---|---|---|
| 提示词 | `thincoder-core/prompts/persona-engineering.md` §Ledger | `Pool routing` 括注「or marks it urgent — fast lane」· 独立的 `Fast lane` 条 · `Boundary` 末句「urgent bugs go through the fast lane」 |
| 设计档 | `docs/core/design/PROMPT-SYSTEM.md` | §6 的 persona · Ledger 普查表列了 20 条，其中一条是 `Fast lane`——撤后计数与条目都要跟 |
| 需求档 | `docs/core/requirements/METHODOLOGY.md` F5-1 | 「急 / 马上做」= 快车道（单点完整流程一步不少）——**主 agent 笔** |
| 根部 | `docs/TODO.md` | 「快车道：用户说"急"走单点不入池」 |

**不改的三处同名不同物**（撤它就是为了消歧义，不能再制造新歧义）：
- `docs/core/requirements/AGENT-LOOP.md` 的「快车道（用户明确指令）」= 指「用户直接下令点火」，与攒批无关；
- `docs/core/design/PROVIDER.md` 的「快车道全链点火」= 同一个意思；
- `docs/desktop/design/RENDERER.md` KD-74 的「21:59 点火（快车道）」= 同上。

**这三处指的是「用户当场下令」，不是「有一条更轻的路」——按既有语义保留，但接笔时若仍读得出「第二条路」的意思，就一并改成「用户直接下令」。**

- **已定决定**：本批收窄成「撤快车道」一件，其余三件退回池 · 用户原话：「就单改这个,他设计好了你检查一下.」 · 时间：2026-11-08 16:42

### 收窄后的真实范围（补记，因为评审 §3 第 1 轮 #1 正是照这个缺口打的红）

**收窄令之前**本批写的是三件事（① 提示词补键面 ∥ ② `#2196` ∥ ③ `#2190`）。**16:42 用户一句话把它砍到一件。**

三件退回的落处，逐件点名（不许只写「退回池」三个字）：

| 退回项 | 去处 |
|---|---|
| ① 提示词补「哪些键决定哪道门」 | 未单立行——它原本靠 `#2196` 承载，随下面一行一起等 |
| ② `#2196`（MANIFEST 三个数 ∥ `report` 面读法） | 台账 `#2196` 仍在，**本批收口时按「原批已收口，须另起批次接手」重锚** |
| ③ `#2190`（TIMEOUT-DIGEST 两处裸名） | 台账 `#2190` 仍在，同上 |

**本批自己的账 = `#2197`**（撤快车道），批档头已改指。**原绑 `#2196` 与实做内容不是同一个债——这是评审抓到的红，认。**

### 一条我给评审的答复（它按字面判红，判得对）

评审第 1 轮 #3 说「需求档 F5-1 里那句「急 / 马上做」= 快车道 不存在，四层模型多算一层」。

**它读到的是我改完之后的样子**——那一层是我在 16:45 亲手落的（`METHODOLOGY.md` F5-1 改成「用户说开工就开工，不设第二道流程」，计数五条改四条）。**它写设计时那句还在盘上，不是它写错，是我先改掉了它要改的东西。**

⇒ 这条**不列为待修**，记为「已落」。**但下一次设计席报「某档某句在读」时，父侧若已先改，必须在 §1 留一行；不然评审只能按现盘判它说假话。**

### 评审第 2 轮后的两处父侧处置

**① 「执笔人」那半句（⑤）撤出本批**——评审 🟡5 判得对：用户 16:42 的原话是「就单改这个」，而 ⑤ 是我在派单里自己加的，设计席照做了并如实标「不是用户点名」。

**撤它的理由不是它没价值，是它的出处不对**：它是一条对**生产提示词正文**的改动，却挂在一句只点名快车道的裁定下面。**没被点名的改动，哪怕再对，也不该顺路搭车**——这正是这批在治的东西（一条规则不吭声地跟着另一条走）。

**留账**：另立一行，等它自己的时机。

**② 评审 🟡3（提示词全域有没有 `fast lane` 残留）——父侧当场量了，答案是「只有那三处」。**

量法：`grep -i 'fast lane|fast-lane' thincoder-core/prompts/**` ⇒ 命中 3 行，全在 `thincoder-core/prompts/persona-engineering.md` 的 §Ledger 内（`Pool routing` 括注 ∥ `Fast lane` 条 ∥ `Boundary` 末句），其余 16 档零命中。

⇒ **按节域判 A1 ∥ A2 是够的**，不必加全域扫描读数。**这条不是设计席漏了，是评审按范围判不出、父侧一量就清楚。**

## §2 批次任务与设计（eng-designer）
**状态行**：设计完成（修正轮第二轮：⑤ 按父侧撤令撤出本档（另立台账 #2199）；§6.85 验收表收为 A1–A5（A5 = 交付门）；普查表题眼按提示词实况改齐；提示词与 docs/TODO.md 已由实施轮落盘）
<§2 模板占位：本批条目（覆盖） / 设计档落点 / 机制设计 / 受影响文件与测试覆盖 / 验收对照 / 关键决策 / 上抛项>

### 2.1 本单只做一件（上一稿已退回池）

| # | 条目 | 台账 | 面 |
|---|---|---|---|
| ④ | 撤销「快车道」——提示词 §Ledger 三处 + 本档普查表计数 + `docs/TODO.md` | — | 提示词面 ∥ 文档面 |
| — | `docs/core/requirements/METHODOLOGY.md` F5-1 | — | 需求档（**主 agent 笔**） |

**不在本单**

- ⑤「执笔人」半句（`small / exploratory / interactive changes stay in the main session` 续半句）——用户 16:42「就单改这个」把本批收窄成一件；父侧采认评审 🟡5，撤出本批，另立台账 `#2199`。`docs/core/design/PROMPT-SYSTEM.md` §6.85 已按此撤净（验收表 A1–A5，不含该条）。
- 「提示词补哪些键决定哪道门」——`index.docCheckExcludePaths` 在 `thincoder-core/prompts/**` 仍零命中。
- 台账 `#2196`：`docs/core/design/MANIFEST.md` 可写节点三个数仍不一致；`report` 面「全排除」那句仍未接线。
- 台账 `#2190`：`docs/core/design/TIMEOUT-DIGEST.md` §2.3 两处裸名仍是裸名。
- 台账 `#2191`：前提已被 `2026-11-08-doc-standard-sync-gate` 取代，主 agent 按「已被吸收」撤回。
- `doc_check` 行为零改——本单全是文本面。

**退回归档（留痕）**：本席本轮曾把上述三件做进 `docs/core/design/MANIFEST.md` ∥ `docs/core/design/TIMEOUT-DIGEST.md`；收窄令下后用 `git checkout` 整档退回（快照 `mw7l47ha-4hcb` ∥ `mw7l487e-pglb`），两档现与批前逐字相等。





### 2.2 落点、逐字文本与验收

**依据**：用户 2026-11-08 16:40 裁——「你把快车道那个撤掉,不要留着制造误会了.」

**④ 落点与逐字文本**：`docs/core/design/PROMPT-SYSTEM.md` §6.85——含终稿甲（删条 + 重编号 + 去末句）、计数连带、三处同名不同物清单、验收命令 ⑦。

**为什么不能分两处写**：一条规则住在四层（提示词 ∥ 本档普查表 ∥ `docs/TODO.md` ∥ 需求档 F5-1）。留任一层不动，读那一层的人就做旧动作，且没有红会响。

**四层现况（逐层点名）**：需求档那层 = **已落**（主 agent 2026-11-08 16:45 改 `docs/core/requirements/METHODOLOGY.md` F5-1，口径改成「用户说开工就开工，不设第二道流程」，计数五条 ⇒ 四条）；本档普查表 = **已落**（本席，20 ⇒ 19）；提示词 ∥ `docs/TODO.md` = **已落**（实施轮 2026-11-08，逐字见 `docs/core/design/PROMPT-SYSTEM.md` §6.85 终稿甲）。四层同轮齐。

**红侧读数（本席本轮实跑；命令 = §6.85 的验收命令 ⑦）**

| 读数 | 改前 | 改后应 |
|---|---|---|
| `A1_fastLaneCap`（§Ledger 内 `Fast lane`） | 1 | 0 |
| `A2_fastLaneLow`（§Ledger 内 `fast lane`） | 2 | 0 |
| `A3_entries`（§Ledger 全节编号条目） | 10 | 9 |
| `A4_census`（普查表 `persona · Ledger` 计数） | 20 | 19（本席已改） |
| `A4_name`（普查表名单内 `Fast lane`） | 1 | 0（本席已改） |

**判据自纠一条**：`A3` 初稿写「= 4」，一跑读出 **10**——§Ledger 有**两列**各 5 条编号，初稿把判域当成一列。判据已改为「全节 = 9」，基线写在红侧。不改这条，实施轮会当场假红。

**本席未写产品码**：`thincoder-core/prompts/persona-engineering.md` 与 `docs/TODO.md` 均不在 `docRoot` 声明面（后者 fail-closed 判产品面），按 §8 的变更路子（改规则 → 先改机制文档 → coder 依它改 EN）由 eng-coder 落；逐字文本已在 §6.85 围栏内。

**三处同名不同物（已读，判断 = 不动）**

`docs/core/requirements/AGENT-LOOP.md` ∥ `docs/core/design/PROVIDER.md` ∥ `docs/desktop/design/RENDERER.md` 的「快车道」**都不再读成第二条路**：三处均指「用户当场下令点火」，与攒批无关。撤掉攒批快车道后，这个词只剩这一个意思——歧义是这次撤除消掉的，不是它们造出来的。故一字未动。

### 2.3 受影响文件与档位结论

| 档 | 动作 | 本笔归谁 | 档位 |
|---|---|---|---|
| `thincoder-core/prompts/persona-engineering.md` | §Ledger 删一条 + 重编号 + 去末句（`docs/core/design/PROMPT-SYSTEM.md` §6.85 终稿甲） | eng-coder，已落 | 产品码 · 提示词面 |
| `docs/core/design/PROMPT-SYSTEM.md` | §6 普查表 `persona · Ledger` 20⇒19 且名单去 `Fast lane`；§6.85 新增 | 本席，已落 | 文档档 |
| `docs/TODO.md` | 删「快车道：用户说"急"走单点不入池。」一句 | eng-coder，已落 | 不在 `docRoot` 声明面 ⇒ 产品面 fail-closed |
| `docs/core/requirements/METHODOLOGY.md` | F5-1 口径改成「用户说开工就开工，不设第二道流程」，计数五条 ⇒ 四条——**已落 2026-11-08 16:45** | 主 agent（已落） | 需求档 |
| `docs/core/design/MANIFEST.md` ∥ `docs/core/design/TIMEOUT-DIGEST.md` | **零改**（本轮曾改，已退回批前态） | — | 文档档 |

**档位结论**：无源文件跨档位，无拆分计划——全为文本面；唯一字符帽档 `thincoder-core/tool-docs/manifest.md` 本单不改。

**测试覆盖 = 无**：零代码面，无单元测试档、无集成档。不改任何既有用例断言的业务可观察结果；`test/RTM.md` 无一行断提示词文本（已读，与评审相邻行断的是消息注入面与工具写盘回执）。

### 2.4 边界（本单不做）

- 不给「急」另造名字、不留兜底分支：删旧路径即完成——「现在做 = 现在开工」已由 `Pool routing` 承载。
- 不改那三处同名不同物（判断见 2.2 末：都只指「用户当场下令点火」）。
- 不改 `doc_check` 行为、不动台账工具与代码。
- 不动需求档（主 agent 笔）、不动 §1。

### 2.5 上抛项

[上抛·待裁] **`thincoder-core/tool-docs/manifest.md` 已超自设帽**：实读 `[...s].length` = **5,555 字符**，超 `docs/core/design/MANIFEST.md` §2.10 自设帽 5,000（机制硬限 8,000 未破）。本单不改该档；此读数随 `#2196` 一并回池——放宽帽 ∥ 收帽 ∥ 认账，本席不能自裁。

[上抛·知会] **提示词与 `docs/TODO.md` 已由实施轮落盘**（读数与改前改后见 §5）：提示词逐字照 `docs/core/design/PROMPT-SYSTEM.md` §6.85 终稿甲；本席未写这两档一字。

## §3 设计评审（评审子代理）
**状态行**：评审通过



### 轮次 1（评审子代理）

| # | 严重度 | 状态 | 证据（指针） |
|---|---|---|---|
| 1 | 🟡 | 待处置 | `docs/batches/2026-11-08-gate-keys-visibility.md` §2.2 写「留任一层不动，读那一层的人就做旧动作，且没有红会响」，而验收 A1–A6 无一条读 `docs/TODO.md` |
| 2 | 🟡 | 待处置 | §6.85 的 A3 红法写「（漏删 ∥ 漏改编号都落在这里）」——只删条、不重编号时 `A3_entries` 仍读 9，该红法高估了判域 |
| 3 | 🟡 | 待处置 | §6.85 的 A1 ∥ A2 判域 = `## Ledger` 节内；勘察证据行只记了「新半句的两个题眼串」的 17 档扫描，无 `fast lane` 全档扫描读数 |
| 4 | 🟡 | 待处置 | §6.85「计数连带（D3）」三笔已到普查表与 §Ledger；`docs/core/design/PROMPT-SYSTEM.md` §6.73 的「280 条」与「合计 **299** 条」未随 `persona · Ledger` 20⇒19 同移 |
| 5 | 🟡 | 待处置 | §6.85「⑤ 的纳入依据是那句判据的射程，不是用户点名」 vs `docs/batches/2026-11-08-gate-keys-visibility.md` §1「本批收窄成「撤快车道」一件」 |
| 6 | 🟡 | 待处置 | §6.85「实读 = `["../.thincoder","../thincoder.com"]`」 vs §6.84「实读 = `[]`」——同一 `index.publicRepos` 在同一设计档上两份活描述 |
| 7 | 🟡 | 待处置 | `docs/batches/2026-11-08-gate-keys-visibility.md` §2 状态行「§3 第 1 轮 #4–#10 六条已落本档」，而 §3 段内无任何内容可核 |
| 8 | 🔵 | 待处置 | §6.85 终稿乙以省略号起首，未交代被续句原条的末尾标点处置 |

计数 = 🔴 0 · 🟡 7 · 🔵 1

VERDICT: pass

## §4 用户批准（主 agent）

- **批准（评审后）**：§3 第 2 轮判 `pass`（第 1 轮 1 🔴 + 8 🟡 + 1 🔵 → 第 2 轮 7 🟡 + 2 🔵，0 🔴）。批准面 = 那轮评审所对的那版 §2，**减去父侧当场撤出的 ⑤**（见下）。

**三条父侧裁量（写在这里，因为它们是批准面的一部分）**：

- **⑤ 撤出本批**（评审 🟡5）：用户点名的是撤快车道；⑤ 是附加改动，且我是在派单里自己加的。**没被点名的改动不该顺路搭车**——这正是这批在治的形状。转 `#2199`。
- **A3 ∥ §6.73 计数缺口不就地改**（评审 🟡2 ∥ 🟡4）：属设计档判据面与计数面，不影响落盘；转 `#2200`。
- **`fast lane` 全域残留：父侧自量为零**（评审 🟡3）：17 档提示词里只出现在 §Ledger 那三行，按节域的判据因此够用。

**批准范围**：提示词 `thincoder-core/prompts/persona-engineering.md` §Ledger 三处 ∥ `docs/TODO.md` 一行 ∥ `docs/core/design/PROMPT-SYSTEM.md` §6.85 与普查表。**判据本体（A1–A5 的数值口径）是零改项。**

## §5 实施记录（eng-coder）

### 落盘（2026-11-08 · 逐字照 `docs/core/design/PROMPT-SYSTEM.md` §6.85 终稿甲与 §2 的范围）

**交付面 = 两档文本**：`thincoder-core/prompts/persona-engineering.md` 的 §Ledger 三处 + 重编号；`docs/TODO.md` 删一句。**⑤「执笔人半句」按父侧撤令未落**——它在该档的正确状态是缺席。

**① `thincoder-core/prompts/persona-engineering.md` §Ledger 改前 ⇒ 改后**

| 处 | 改前 | 改后 |
|---|---|---|
| `Pool routing` 尾括注 | `…the user says start this batch (or marks it urgent — fast lane).` | `…the user says start this batch.` |
| `Fast lane` 条 | `3. **Fast lane** — the user saying urgent / do it now skips pooling: …` 整条含其括注 | 删除，条目不存 |
| 重编号 | `4. **Batch design**` · `5. **Boundary**` | `3. **Batch design**` · `4. **Boundary**` |
| `Boundary` 末句 | `…mixing them leaves neither readable; urgent bugs go through the fast lane.` | `…mixing them leaves neither readable.` |

`Pool routing` 与 `Boundary` 两条的改后全文，与 §6.85 两个围栏块逐字相等。生命周期那一列五条一字未动。

**② `docs/TODO.md` 该行改后原文（逐字）**

```text
> 生命周期：实现后核销勾销。
```

前半句 `快车道：用户说"急"走单点不入池。` 删净；后半句是父侧点名要保住的那半，原样留下。

**验收命令 ⑦（§6.85 围栏内那一条 · cwd = 仓库根 · 本席 node 实跑，改前改后各一次）**

| 读数 | 改前 | 改后 | §6.85 期望 |
|---|---|---|---|
| `A1_fastLaneCap` | 1 | 0 | 0 |
| `A2_fastLaneLow` | 2 | 0 | 0 |
| `A3_entries` | 10 | 9 | 9 |
| `A4_census` | 19 | 19 | 19 |
| `A4_name` | 0 | 0 | 0 |
| `A5_pen` | 0 | 0 | 按父侧撤令应为 0（§6.85 表内仍写 1，见上抛） |

`A4` 两笔改前已是 19 / 0——那是设计席本轮已落的普查表，本席未动该档一字，故它不随本笔变化。

**红侧留痕**：改前读数（1 · 2 · 10）与 §6.85 记的基线一致；同一命令在改前读出非零，改后读出零，判据不是自证。

**交付门**：`doc_check(mode:"gate", docs=["thincoder-core/prompts/persona-engineering.md","docs/TODO.md"])` ⇒ 首行 `DOC-CHECK GATE: PASS`，0 段命中，2 档全清。

**零测试面**：两档皆文本面，无单元测试档；不改任何业务可观察结果 ⇒ 集成档零行变动。`test/RTM.md` 无一行断提示词文本（设计席已逐行读过，本席复核结论相同）。

### 审计与评审轮次 · 终态

| 环节 | 轮次 | 结果 |
|---|---|---|
| explore 差异审计 | 1 | `no divergence`：④ 的五处逐项 ✅，⑤ 缺席 ✅；它无 bash 面，六个读数系手工复算 ⇒ 以本席 node 实跑为准 |
| advisor 代码评审 | 1 | `VERDICT: pass` · 🔴 0 · 🟡 1（协调项，笔在父侧/设计席）· 🔵 1（误判，本席已复） |
| 修正轮 | 0 | 无必修项 |

终态 = `clean`。

### 上抛

- [上抛·待裁] **`docs/core/design/PROMPT-SYSTEM.md` §6.85 的 A5 判据与父侧撤令相左**：表内仍写「执笔人半句在位 · `A5_pen` = 1 · = 0 即红」，而 ⑤ 已撤出本批 ⇒ 任何人按该表复跑都会把「正确缺席」读成红。同一层的 §2.1 表行 ⑤ 与 §2.3 的「首条补半句」也仍在册。笔在父侧与设计席，本席未改这两处。
- [上抛·知会] **普查表一行内的措辞漂移（设计席笔）**：`docs/core/design/PROMPT-SYSTEM.md` §6 普查表 `persona · Ledger` 行的题眼之一写作「must carry a reading…」，而提示词实况为「must carry a reproducible path」。该行正是本笔 A4 判域，故一并报出；本席未动。
- [上抛·知会] **advisor 的 🔵 本席不复**：它把 `docs/TODO.md` 留下的那半句判成「无主块引用」。父侧派单明确要求同一行保住「生命周期：实现后核销勾销。」——改后正是该半句，不是残留。

## §6 验证与收口（父代理）

### 父侧复量（命令 ⑦，与设计同一把尺子）

| 读数 | 改前 | 改后 | 判 |
|---|---|---|---|
| `A1_fastLaneCap` | 1 | **0** | ✅ |
| `A2_fastLaneLow` | 2 | **0** | ✅ |
| `A3_entries` | 10 | **9** | ✅ |
| `A4_census` | 19 | **19** | ✅ |
| `A4_name` | 0 | **0** | ✅ |
| `docs/TODO.md` 的「走单点不入池」 | 在 | **不在** | ✅（父侧另加的一读） |

**改前那三个非零值说明判据是红的，不是自证的绿。**全域复扫 `thincoder-core/prompts/`：`fast lane` ∥ `fast-lane` **零命中**。

### §2 ↔ §5 对账

§5 里留着一枚 `[上抛·待裁]`——「§6.85 的 A5 判据与撤令相左」。**已闭**：设计席按甲案删掉 A5（⑤ 的逐字终稿乙、出处块、既有件三问那一条一并删净），验收表收为 `A1–A5`、A5 = 交付门。§5 那枚上抛**不追改**（实施席当时报得对，历史留着）。

### 实施轮报出的两条，处置如下

| 报出 | 处置 |
|---|---|
| 普查表 `persona · Ledger` 行题眼写 `must carry a reading…`，提示词实况是 `must carry a reproducible path` | **属实，已改**——`A4` 判的正是这一行，它此前数着一张失真的表 |
| 设计档 `§6.85` 仍按「⑤ 会落」写 | 已按甲案删净 |

### 转出项

| 项 | 去处 |
|---|---|
| ⑤ 执笔人半句 | `#2199`（`trigger = 条件`） |
| A3 分不开「漏删」与「漏重编号」∥ §6.73 的 280/194/299 未随 20→19 同移 | `#2200`（`trigger = 条件`） |
| 约 45 处勘察行仍写 `publicRepos = []` | `#2198`（既有行，本批零触） |
| `#2196`（MANIFEST 三个数 ∥ `report` 面读法） | 本批零触，收口时按「原批已收口，须另起批次接手」重锚 |

### 单元测试档

**无**——零代码面，改动全是文本删除与重编号，无单元测试档可写。**读数留在本节**：命令 ⑦ 的六个读数即验收。

### 门检

本节落笔回执：`DOC-CHECK GATE: PASS`。
