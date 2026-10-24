# 2026-10-15 · 文档提示词卫生车
> 六段 append-only，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 编制：主 agent · 2026-10-15 · 来源 = 清账轮 3 短单 · 车 4（提示词/文档卫生 5 行）——用户 2026-10-15 01:19「不是说好了自动跑的吗？」全链自动授权；父侧清账轮 3（`docs/batches/2026-10-15-ledger-cleanup-3.md` §1 短单）点火。
> 台账 = #1457（core · 归批——清账轮 3 短单车 4）。前情 = docs/batches/2026-10-15-ledger-cleanup-3.md（未收口——本轮为其短单之车 4）。
## §1 讨论（主 agent）
**状态行**：已收口 2026-10-15

**来源与授权**：清账轮 3 短单（`docs/batches/2026-10-15-ledger-cleanup-3.md` §1）；用户 2026-10-15 01:19「不是说好了自动跑的吗？」= 全链自动（设计 → 评审 → 批准 → 实施）授权。

**本批条目（4 行——逐行「实现什么」；细节证据以台账行在案为准）**

| 行 | 实现什么 |
|---|---|
| #1407 | doc-check 维护族残：① 示意名误报已随清账轮 3 修（占位类 +`x`/`b`）；② 行宽存量——在飞域 7 行随其收尾 ∥ 其余随本车收（含 `doc-check` 口径面如需）；③（#1368/#1375 已并本行） |
| #1428 | 「设计令牌不许放到过期」纪律无规范面逐字落点（现仅批档 + 设计文本载有——提示词面 / 机制档待落；**提示词内容权 = 主 agent**，逐字稿随设计呈批） |
| #1444 | 评审标准新第 10 条维度入册（`ADVISOR-CONVERGENCE.md` 补 §15 + A-AC16——先例 = 2026-10-09 §14/A-AC15，含计数） |
| #1451 | F6 措辞层级化残余族（提示词双面 CN `persona-engineering.md` ∥ EN 同句「工程工具 / 脚本（`scripts/**`）不入域」+ `PORTABILITY.md` 同句与坐标漂移）——**禁随批夹带，走提示词面设计覆盖** |

**边界/禁触**：在飞批域零触（member 系三档冻结中）；本车纯文档/提示词面——设计轮零产品码；提示词文本 = 主 agent 内容权（逐字稿呈批）。

**附注（父侧）**：#1447（跨仓勘察三句取证）不随本车——判据 = 下一真实设计轮核「设计档是否携勘察证据行」，由父侧在本批系列设计轮（车 2–5 ∥ parity）收口时核读。

**验收（设计轮）**：逐行出案（落点 ∥ 逐字稿或口径 ∥ 机检判据）+ 受影响文件全清单；机检本批域零新增红。

**父侧裁定（#50 上抛处置 · 2026-10-15 01:5x）**

- **PROMPT-SYSTEM.md §6.11 连带（处置时机）**：**car4 实施轮落**（persona-engineering 双面 209 ⇒ 210 与 §6.11 现值 208 的收正——落笔当刻 `wc -l` 实读为准，D3 计数与清单同变）；**无实质避让冲突**（核实：在飞修正轮域 = #58 parity 三档 ∥ #61 `RELEASE.md` ∥ #62 `mcp/MCP.md` ∥ #63 car2 七档——零涉 `PROMPT-SYSTEM.md`）；若 car2 链另行引入 §6.11 连带 ⇒ 按 files 调度串行、后落者重读（同 car3×car5 判例）。
- **#1407 知会受理**：收口条件 = member 两批（parity ∥ member-face-mcp）§6 前置对表——两批收口后回本处核读；未收前 #1407 维持「读数处置（零笔）」。
- **提示词四段逐字稿（§2）**：待父侧核读（内容权）——定稿随 §4 代签落。

## §2 批次任务与设计（eng-designer）
**状态行**：设计完成（逐行案表 + 逐字稿 4 段（呈批）+ 机制档自落 3 档；产品码零触）
<§2 模板占位：本批条目（覆盖） / 设计档落点 / 机制设计 / 受影响文件与测试覆盖 / 验收对照 / 关键决策 / 上抛项>

**本批条目（覆盖——4 行 ∥ §1 表逐行对位）**

| 行 | 实现什么（§1） | 本席出案 |
|---|---|---|
| #1407 | doc-check 维护族残（示意名已办 ∥ 行宽存量 ∥ 口径面如需） | **读数处置**——13 项全在在飞批域 ⇒ 本车零笔；口径面判定 = 零改（案一） |
| #1428 | 「设计令牌不许放到过期」逐字落点（机制档 ∥ 提示词面） | 机制档自落（§10 item 4）；提示词双面逐字稿呈批（案二） |
| #1444 | 评审标准第 10 条维度入册（§15 + A-AC16——含计数） | **已落**：§15 ∥ A-AC16 ∥ 档头指针 ∥ 同轮状态收正（案三） |
| #1451 | F6 措辞层级化残余族（提示词双面 ∥ `PORTABILITY.md` 同句与坐标） | 档面自落（两处）；提示词双面逐字稿呈批（案四） |

**设计档落点**：本档 §2（设计正文 = 逐行案表 + 逐字稿围栏块）。**设计轮自落三档**（eng-designer 笔——先例 = design-token-recovery 批「单源档更新 · 本设计轮已落」）：`docs/core/design/ADVISOR-CONVERGENCE.md` ∥ `docs/core/design/DESIGN-TOKEN-SETTLEMENT.md` ∥ `docs/core/design/PORTABILITY.md`。**提示词正文 = 主 agent 内容权**（§1 边界）——四段逐字稿 = 本段五 围栏块呈批；核准后落：CN 审核面 = eng-designer 笔 ∥ EN 运行面 = eng-coder 落（M9 翻译回写）——设计席零直落提示词正文。

**勘察证据行（承评审标准第 10 条 ∥ #1447 判据面）**：勘察面 = 本仓文档/提示词双面——`docs/core/design/` 四档（ADVISOR-CONVERGENCE ∥ DESIGN-TOKEN-SETTLEMENT ∥ PORTABILITY ∥ DOC-DISCIPLINE）∥ `docs/core/design/prompts/` 三档 ∥ `docs/core/requirements/PROMPT-SYSTEM.md` ∥ `docs/batches/` 三档（car4 ∥ ledger-cleanup-3 ∥ files-gate）∥ 实现面（`spawn-gates.mjs` ∥ `doc-check-anchors.mjs` ∥ `doc-check-width.mjs`）——逐条实读在案（坐标见各案）。
**公共源文档（独立文档仓）：本批四行皆本仓内面（文档/提示词面收正）——无相关**（照记——不得静默省行）。

**同类先例行（承评审标准第 9 条）**：
- **#1444 先例** = 本档 §14 + A-AC15（2026-10-09 设计前置先例勘察批）——**对齐**：同形（权威链 + 「标准维度补一条」 + AC 行 + 档头指针随动）；**偏离**：无。
- **#1428 先例** = design-token-recovery 批（`DESIGN-TOKEN-SETTLEMENT.md` §10——机制档自落形）；对齐；偏离：无。
- **#1451 先例** = files-gate 批（`docs/batches/2026-10-14-files-gate-scripts-depth.md` §2.1——层级化措辞落点形：`AGENT-LOOP-SUBAGENT.md` §6.22 ∥ 变更记录）；偏离：无。
- **#1407 先例** = 清账轮 3 读数处置形；偏离：无。

**一、#1407 · doc-check 维护族残——读数处置（本车零笔）**

**读数（本席实跑 2026-10-15 · `node scripts/doc-check.mjs --root .`，cwd = 仓根）**：

| 面 | 读数 | 逐项 |
|---|---|---|
| 锚悬空（闸态） | **6** | 全落 `docs/server/design/agent/MEMBER-AGENT.md`：`:44`（`deploy/sandbox/member-shell/protocol.mjs`）∥ `:47`（`subblocks/block.mjs`）∥ `:50`（`deploy/sandbox/member-shell/member-tools.mjs`）∥ `:319`（同前 ×1 + `agent/setup.mjs:218`）∥ `:349`（`src/agent/member-asks.mjs`）——短形路径 ⇒ 全限定形（同清账轮 3 已办 6 枚同式） |
| 行宽（区带豁免在效） | **7** | `MEMBER-AGENT.md` ×4（`:122` 407 ∥ `:259` 403 ∥ `:383` 323 ∥ `:388` 488）∥ `docs/server/design/gateway/API.md:291`（508）∥ `docs/server/design/webui/CHAT.md:132`（336）∥ `:139`（563） |

**处置**：13 项**全在在飞批域**（成员面三档——#42/#46 持其域，冻结窗）⇒ **本车零触；「其余随本车收」的其余 = 空集**（读数核过：闸内 13 项无一落本批域）。收口条件 = 该两批各自 §6 前置对表核销（父侧派单时带一句即可）。
**① 示意名误报** = 已随清账轮 3 办（`scripts/doc-check-anchors.mjs:44` 占位类含 `x`/`b`——实读在盘）。
**口径面判定 = 零改**：占位类扩展（`x`/`b`）落在判据类「占位 / 示意名」射程内（判据 = `DOC-DISCIPLINE.md` §4.2.1 排除式 ① ∥ §4.2.4 行 5）；集合本体 = 实现面常量，判据面只载类与射程 ⇒ 类内扩展不触判据。表行豁免（§3.1 ∥ `doc-check-width.mjs:42`）与区带豁免（§3.15）口径均已入册——**无待补口径面**。

**机检判据**：复跑 ⇒ 悬空 ≤6（本批域零新增）∧ 行宽 ≤7（本批域零新增）∧ 本批三档零命中。

**二、#1428 · 「设计令牌不许放到过期」纪律逐字落点**

**两腿**：
- **机制档（设计轮已落——本席笔）**：`docs/core/design/DESIGN-TOKEN-SETTLEMENT.md` §10 回收程序 item 4（`:197`）——「纪律照旧」行扩句：携逐字纪律 + why（令牌 = 短命运行态；过期 ⇒ 授权作废、须重走评审；未消费活槽滞留 = 复用漏洞）。变更记录 = `:253`（+ 落点指针 `:251`）。**机制语义零改**（纪律面逐字落点——本档承载）。
- **提示词面（逐字稿呈批——本段五 · 稿三 ∥ 稿四）**：CN `docs/core/design/prompts/persona-engineering.md`「在飞令牌回收」条（`:132`）后 +1 条 ∥ EN `thincoder-core/prompts/persona-engineering.md` 同邻位（`:134` 后）+1 条。

**被否**：落 §9（评审凭证功能点族——纪律面物件非功能点）∥ 落需求档（需求档笔 = 主 agent；#1428 射程 = 「提示词面 / 机制档」）。
**机检判据**：机制档腿 = 变更记录一行在档 ∧ 本档域零新增红；提示词腿 = 落笔轮「双面逐字与 §2 五 稿三 ∥ 稿四全等」一次性比对 + `scripts/prompt-refs-check.mjs` 复跑 0 命中。

**三、#1444 · 评审标准第 10 条维度入册（设计轮已落——本席笔）**

**落点（`docs/core/design/ADVISOR-CONVERGENCE.md`，wc-l 499）**：**新增 §15**（`:442-449`——权威链（义务来源 / 核查维度语义 = 本节 / 落点 = `advisor-design.md` §评审标准第 10 条 ∥ EN 同节同位 / **已落笔**）+ 维度补条逐字）；§12 增 **A-AC16**（`:417`）；**计数随动**：档头维度指针（`:17`）= §9 ∥ §14 ⇒ **§9 ∥ §14 ∥ §15**；变更记录（`:452`）。
**同轮收正（一致性面——D8 类）**：§14 权威链（`:435`）∥ A-AC15（`:416`）落笔状态「**待实施轮落笔**」⇒「**已落笔（双侧在盘——2026-10-10）**」——第 9 条两面早在盘（CN `docs/core/design/prompts/advisor-design.md:22` ∥ EN `thincoder-core/prompts/advisor-design.md:11`——实读 + git blame 落盘 2026-10-10），原句 = 失效状态陈述（留着会让读者把已落项当待办）。**零语义改**（状态收实）。本项 = 本席主动收正 + 报备（本例 + 变更记录行），非评审发现。
**判据（先例对表）**：§15 形 = §14 形；A-AC16 形 = A-AC15 形 + 落笔状态收实。
**机检判据**：三处（§15 标题 ∥ A-AC16 行 ∥ 档头指针）在档；本档域零新增红。

**四、#1451 · F6 措辞层级化残余族**

**三处（档面自落 + 提示词呈批）**：
- **提示词双面（逐字稿呈批——本段五 · 稿一 ∥ 稿二）**：CN `docs/core/design/prompts/persona-engineering.md:160` ∥ EN `thincoder-core/prompts/persona-engineering.md:163`——现载 `scripts/**` 全域形态 ⇒ 层级锚定形（与 `thincoder-core/agent-tools/spawn-gates.mjs:102-103` 判据 ∥ `AGENT-LOOP-SUBAGENT.md` §6.22 逐字同口径）。
- **档面（设计轮已落——本席笔）**：`docs/core/design/PORTABILITY.md`（wc-l 381）——§3.7 行 7（`:175`）：同句 ⇒ 层级锚定形 + 坐标 `:95-109` ⇒ **`:97-111`**（函数现盘）；§3.8 行 3（`:185`）：坐标 `:104-106` ⇒ **`:106-108`**（同源 +2 漂移——本席判定随批收正）；变更记录（`:347` + 落点指针 `:345`）。
- **存档面**：`docs/_archive/**` = 冻结历史——零动作（维持 #1449 收尾链原判）。
**被否**：提示词句改纯指针（提示词面禁文档引用——句子须自足）∥ 全档加豁免注（判据本体 = 层级锚定——豁免 = 另机制）∥ 只改 `:175` 不动 §3.8 行 3（同源 +2 漂移同批随正——留着即死坐标）。
**边界（零触）**：`discipline-engineering.md` 双面 `scripts/**`（变更面路由表）= 另一机制（#1449 经扫判维持）。
**机检判据**：坐标实测 = `spawn-gates.mjs` 函数 `:97-111` ∥ 谓词 `:102` ∥ basename 支 `:106-108`（实读在盘）；本批三档零新增红。

**五、提示词逐字稿（四段——呈批；落点 = 本段）**

稿一（CN · #1451 · 替换 `docs/core/design/prompts/persona-engineering.md:160` 整行）：
```text
- **工程工具面不入域**：`files` 只列**内容产物**（源 / 测试 / 设计档）；**工程工具 / 脚本（`scripts/*`——层级锚定：仅仓根与直接子层；深层目录名不携带面信息）不入域**——入域只产生假冲突、拖慢全队。
```

稿二（EN · #1451 · 替换 `thincoder-core/prompts/persona-engineering.md:163` 整行）：
```text
- **Engineering-tools face stays out of the domain**: `files` lists only **content products** (source / tests / design docs); **engineering tools / scripts (`scripts/*` — layer-anchored: repo root or a direct child package only; a deep `scripts/` directory name carries no face information) stay out** — listing them only creates false conflicts and slows the team.
```

稿三（CN · #1428 · 在 `docs/core/design/prompts/persona-engineering.md:132`（「在飞令牌回收」条）后新增一行）：
```text
- **令牌不许放到过期**：设计令牌 = 短命运行态——签发即尽快派单落地、链收口即 `consume-design`；放任过期 = 该枚授权作废（门禁照拒，评审须重走）；活槽滞留不消费 = 复用漏洞。
```

稿四（EN · #1428 · 在 `thincoder-core/prompts/persona-engineering.md:134`（"In-flight token recovery"）条后新增一行）：
```text
- **Never let a design token expire**: a design token is short-lived runtime state — dispatch promptly after issuance, and consume it (`consume-design`) once the chain closes; letting one expire voids that authorization (the gate refuses it — a fresh review is required); a live slot left unconsumed is a reuse vulnerability.
```

**六、受影响文件全清单（实读 as-of 2026-10-15）**

| 档 | 现读（wc-l） | 触处 | 状态 |
|---|---|---|---|
| `docs/core/design/ADVISOR-CONVERGENCE.md` | 499 | §15 新增（`:442-449`）∥ A-AC16（`:417`）∥ 档头（`:17`）∥ §14（`:435`）∥ A-AC15（`:416`）∥ 变更记录（`:452`） | **已落**（设计轮——本席） |
| `docs/core/design/DESIGN-TOKEN-SETTLEMENT.md` | 290 | §10 item 4（`:197`）∥ 落点指针（`:251`）∥ 变更记录（`:253`） | **已落**（设计轮——本席） |
| `docs/core/design/PORTABILITY.md` | 381 | §3.7 行 7（`:175`）∥ §3.8 行 3（`:185`）∥ 落点指针（`:345`）∥ 变更记录（`:347`） | **已落**（设计轮——本席） |
| `docs/core/design/prompts/persona-engineering.md`（CN 审核面） | 209 | `:160` 换形 ∥ `:132` 后 +1 条 | 待落（核准后——**CN = eng-designer 笔**）；预计 210 行 |
| `thincoder-core/prompts/persona-engineering.md`（EN 运行面） | 209 | `:163` 换形 ∥ `:134` 后 +1 条 | 待落（核准后——**EN = eng-coder 落**）；预计 210 行 |
| `docs/core/design/PROMPT-SYSTEM.md` | — | §6.11 计数连带（两档 209 ⇒ 210）+ 预算表复测 | 收口面随动——**该档现域被 #48 占用**（见 上抛 1）；本批零触 |
| `docs/batches/2026-10-15-car4-doc-prompt.md` | — | §2（本段） | 已落（本段） |

**测试覆盖**：不适用（文档/提示词面——本批零产品码、零新增断言；在场判据 = 落笔轮「落地档 ↔ §2 五 逐字稿」一次性比对——先例 = §6.21 ∥ §6.22 批同口径）。

**七、验收对照（§1 设计轮验收逐条）**

| §1 验收 | 本席对照 |
|---|---|
| 逐行出案（落点 ∥ 逐字稿或口径 ∥ 机检判据） | 本段一/二/三/四（逐行案表）——4 行全覆盖 ✓ |
| 受影响文件全清单 | 本段六 ✓ |
| 提示词逐字稿 | 本段五（四段——呈批） ✓ |
| 机检本批域零新增红 | 本段八（悬空 6 ∥ 行宽 7 = 基线；本批域零新增） ✓ |
| 设计轮零产品码 | 本段八 末行（本席笔 = 三档文档 + 本段；产品码零触） ✓ |

**八、机检读数（本席实跑 · `node scripts/doc-check.mjs --root .`，cwd = 仓根）**

- **落笔前** = 悬空 **6** ∥ 行宽 **7**（基线）。
- **落笔后复跑** = 悬空 **6** ∥ 行宽 **7**——**本批域零新增**。中途检出本席新增 1 行（§15 权威链行 = 313 字符）⇒ **当场折行** ⇒ 复跑回基线（留痕：本席 READ 读数 8 ⇒ 7，实测在案）。
- 闸态汇总（落笔后）：悬空 6（全落 `MEMBER-AGENT.md`——在飞域存量）∥ 行宽 7（同上 + 三档在飞文件）。
- **产品码 = 零触**：本席笔 = 上述三档文档 + 本段；`git diff --stat` 本席三档 = 18 ∥ 5 ∥ 7 改动行；工作树其余 M/?? 档 = 他车在飞（非本席——不归本批）。

**九、关键决策（含被否）**

| # | 决策 | 理由 | 被否 |
|---|---|---|---|
| KD1 | #1444 落笔时机 = **设计轮自落** | §1 表明示「设计档自落（eng-designer 笔）」+ 先例 = design-token-recovery 批「单源档更新——本设计轮已落」 | 实施轮随动（判据面物件——越早落越早可核对） |
| KD2 | §14 ∥ A-AC15 落笔状态**同轮收正** | D8——失效状态陈述必删；与 §15「已落笔」并存会自相矛盾 | 留待另批（同档同族——留则自相矛盾） |
| KD3 | #1428 机制档腿 = §10 item 4 扩句 | 回收程序 = 纪律邻位（「恢复面 ≠ 囤积许可」原句所在）——单源最小落点 | §9 功能点族 ∥ 需求档（主 agent 笔） |
| KD4 | #1451 双轨 = 档面自落 + 提示词呈批 | 档面 = 本席笔（设计档）；提示词正文 = 主 agent 内容权（§1） | 全腿呈批（档面非提示词正文——无须呈批） |
| KD5 | #1407 = **读数处置零笔** | 13 项全在在飞域——折行 ∥ 补锚即撞冻结窗（§1 禁触面） | 正文折行笔（违 §1 边界） |
| KD6 | §3.8 行 3 坐标**同批随正** | 同源 +2 漂移（同一笔收正连带）——留着即死坐标 | 只改 `:175` |

**十、上抛项**

- **[上抛·待裁]** `docs/core/design/PROMPT-SYSTEM.md` §6.11 连带（两档 persona-engineering 209 ⇒ 210——wc-l 本席实测 ∥ §6.11 计数行现值 = 208）与预算表复测：该档**现被 #48 占用**（§1 域冲突排队源）——落笔轮（提示词面落地后）须避让或由父侧协调；**请父侧派实施轮时明示该连带的处置时机**（不阻塞本设计轮）。
- **[上抛·知会]** 提示词腿落笔后复跑 `scripts/prompt-refs-check.mjs`（新文本零文档引用——0 命中判据）+ CN 新行守 ≤300（`checkConfig.lineWidth`——提示词档在扫描域）；先例 = 2026-10-14 crossrepo-survey 批。
- **[上抛·知会]** #1407 存量的收口条件 = member 两批（`docs/batches/2026-10-15-member-face-parity.md` ∥ `docs/batches/2026-10-15-member-face-mcp.md`）§6 前置对表（13 项逐项）；若其收尾已过而未收 ⇒ 回本处。

**§2 补记（设计评审 #65 修正轮 1 · 发现 1–6 逐号落地 · 2026-10-15 · eng-designer）**

修正面 = 本段 §2 ∥ `docs/core/design/DESIGN-TOKEN-SETTLEMENT.md` ∥ `docs/core/design/PORTABILITY.md` ∥ `docs/core/design/ADVISOR-CONVERGENCE.md`；其余零触（提示词四段逐字稿仍呈批——本轮不落 ∥ 产品码 ∥ 他档 ∥ 批档他人段）。**机制语义零变**（仅坐标 ∥ as-of 标注 ∥ 所指注 ∥ 指针）。

逐号落地（号 → 改动 `file:line`——行号 = 修正后实读；先实读源码 = `thincoder-core/agent-tools/subagent-spawn.mjs` ∥ `thincoder-core/agent/dispatch.mjs` ∥ `thincoder-core/token-ttl.mjs`）：

1. **同落点读数按现盘一次重锚**（发现 1）——`DESIGN-TOKEN-SETTLEMENT.md` §4 D3 `:40`（调用点 `thincoder-core/agent/dispatch.mjs:100`）∥ `:41`（条件式 `:99-102`——末位合取 `:102`）∥ §6.1 写门行 `:74`；`resolveDesignSlot` 族实核统一 `:100`（= 函数头——§3 D2 `:31` ∥ §6.1 `:72` ∥ §6.3 门禁行 `:98` 已在位、零改）；§10 边界注 `:190` 补注 `:104` 所指（`resolveDesignSlot` 内 miss 分支行）。源码读数：`subagent-spawn.mjs:100` 函数头 ∥ `:104` miss 分支 ∥ `:115` 拒文行；`dispatch.mjs` 条件式 `:99-102`。
2. **dispatch 写门归属收正**（发现 2——源码核明）——§6.3 D5 行 `:101`：原引 `resolveDesignSlot`（`:115`）⇒ **`anyLiveDesignSlot`**（`thincoder-core/token-ttl.mjs:211`）+ 调用点 `dispatch.mjs:100`。两门关系 = **同源不同体**（同一 reconcile 源；spawn 门 = `resolveDesignSlot`、dispatch 写门 = `anyLiveDesignSlot`）——§4 D3 归属照旧（行号重锚）、§6.3 误指收正（随补 as-of）。
3. **头部 as-of 补一枚**（发现 3）——`PORTABILITY.md:8`（2026-10-15——本批 §3.7 行 7 ∥ §3.8 行 3 坐标重锚面）；变更记录 `:349`。
4. **先例行核过**（发现 4）——批档 §2 `:49-53` 已携「同类先例行」四行（#1444 ∥ #1428 ∥ #1451 ∥ #1407——三档盘面块所涉三项均在覆盖内）⇒ 条件分支未触发，零改。
5. **#1407 可见性指针**（发现 5）——三档变更记录各一句：`DESIGN-TOKEN-SETTLEMENT.md:255` ∥ `PORTABILITY.md:349` ∥ `ADVISOR-CONVERGENCE.md:453`（使 #1407 可 grep）。
6. **档位核查 = 未触 · 零动作**（发现 6）——`DOC-SYSTEM.md` §5.1 P1 = **归属判据**（判「哪一部分哪一层」——非体量档位）；文档面行数门已废除（用户 2026-09-16 裁定 · `DOC-DISCIPLINE.md` §3.7 现役）；拆档判据 = §3.14 M-1–M-6（M-4 = **不设行数阈值 / 文档行数不设门**）⇒ 无档位可触——`ADVISOR-CONVERGENCE.md` 无越线对象，零登记。

变更记录入档 = `DESIGN-TOKEN-SETTLEMENT.md:253`（发现 1 ∥ 2）∥ `:255`（发现 5）∥ `PORTABILITY.md:349`（发现 3 ∥ 5）∥ `ADVISOR-CONVERGENCE.md:453`（发现 5）。

**读数（修正后实读）**：`ADVISOR-CONVERGENCE.md` = 501 行 ∥ `DESIGN-TOKEN-SETTLEMENT.md` = 294 行 ∥ `PORTABILITY.md` = 383 行（修正前 = 499 ∥ 290 ∥ 381；三档净增 8 行 = 变更记录条目 ∥ 就地收正 6 行）。**本补记为准，上文行文不改**（§2 六表行号 = 设计轮 as-of——`DESIGN-TOKEN-SETTLEMENT.md` 变更记录条目现读 `:255/:257`）。

**机检（本席实跑 · `node scripts/doc-check.mjs --root .`，cwd = 仓根）**：修正前基线 = 锚 0 悬空 ∥ 行宽 OK；修正后复跑 = **同值**（锚 0 ∥ 行宽 OK）；本批三档零闸态命中（仅迁移期引文列报——不入闸）。中途检出本席新增 1 行（`PORTABILITY.md:8` = 309 字符）⇒ 当场收窄（299）⇒ 复跑回 OK（留痕在案）。

**§2 补记（实施面 CN 落笔 · #1451 ∥ #1428 · 2026-10-15 · eng-designer）**

落笔两处（逐字落——§2 五 稿一 ∥ 稿三；措辞 ∥ 括号 ∥ 破折号照录，零改写 / 零加注 / 零调序）：`docs/core/design/prompts/persona-engineering.md:161`（原 `:160` 整行替换 = 稿一——`scripts/**` 全域形态 ⇒ 层级锚定形）∥ `:133`（原 `:132`「在飞令牌回收」条后 +1 行 = 稿三）。EN 运行面零触（另席 = eng-coder）；`PROMPT-SYSTEM.md` ∥ 产品码 ∥ 批档他人段零触。

**读回比对（node · 字节级 `Buffer.compare`，本席实跑）**：稿一（target `:161` ↔ §2 五 `:100` 围栏）= 120 字符 / 276 字节，**逐字节相等**；稿三（target `:133` ↔ §2 五 `:110` 围栏）= 102 字符 / 242 字节，**逐字节相等**；围栏结构校验通过（```text 首 ∥ ``` 尾）。邻行零动（`:132` ∥ `:134` ∥ `:160` ∥ `:162` 实读在盘——原句）。文件实读 209 ⇒ **210 行**（LF 计数 210 ∥ 尾换行保留）；`git diff` 本档 = +1 行 ∥ 1 行换形，零其他差异。

**机检复跑（落笔后——`node scripts/doc-check.mjs --root .`，cwd = 仓根）**：悬空 0 ∥ 行宽 OK ∥ 行数面差异 88 条（报告态）——与落笔前**同值**，本批域零新增红（本档相关行 = 2 条符号·宽报告面行 `:110` ∥ `:120`——落笔前后同值、不入闸）。`node scripts/prompt-refs-check.mjs` = 提示词面 84 档 · 代码面 451 档 · **命中 0**（OK——新文本零文档引用，即 §2 十 上抛·知会 判据）；两处新行 120 / 102 字符（< 300——行宽面复跑 OK 佐证）。

## §3 设计评审（评审子代理）

### 轮次 1（评审子代理）

**评审对象**：car4 文档/提示词面收尾（#1407 doc-check 读数处置 ∥ #1428 discipline 逐字落点 ∥ #1444 第 10 条维度入册 ∥ #1451 可移植性档收正）· 首轮 · 设计评审。范围 = `docs/core/design/ADVISOR-CONVERGENCE.md` ∥ `docs/core/design/DESIGN-TOKEN-SETTLEMENT.md` ∥ `docs/core/design/PORTABILITY.md`（路径前缀 `d:/teamcode/thincoder/` 省略）。

已核通过面：三档变更记录所载改动与盘面一致（§15 / A-AC16 / 档头维度指针 `§9 ∥ §14 ∥ §15` · 五、; §10 item 4 逐字纪律 · ; §3.7 行 7 ∥ §3.8 行 3 坐标/描述）；修正式表达零残留于规范面（`待实施轮落笔` 仅存变更记录史面）；三档批次指针同指 `docs/batches/2026-10-15-car4-doc-prompt.md` §2。

范围限制（未核）：提示词档（`thincoder-core/prompts/**` ∥ `docs/core/design/prompts/**`）与批档 §2 不在范围 ⇒ 「已落笔（双侧在盘）」类断言、先例行 / 受影响文件表 / 验收面 / #1407 闭环面均未核；坐标/行数为档内自述 as-of 读数（未对源码复核）；无项目标准档、无文档地图 ⇒ 方法与归属判定依 Project Guide + 档内指针。

| # | Category | Severity | Issue | Suggestion |
|---|----------|----------|-------|------------|
| 1 | Consistency（坐标读数） | 🔵 | `DESIGN-TOKEN-SETTLEMENT.md` 同一落点并存多枚互异读数：`resolveDesignSlot` 一处记 `subagent-spawn.mjs:100`（`:31`「落点：`thincoder-core/agent-tools/subagent-spawn.mjs:100`（`resolveDesignSlot`）」· §6.1 同行记 `:100`，`:72`），一处记 `:115`（`:101`「核 `resolveDesignSlot`（`thincoder-core/agent-tools/subagent-spawn.mjs:115`）」）；§10 边界注引 §3 D2 却载 `:104`（`:190`「（§3 D2——`thincoder-core/agent-tools/subagent-spawn.mjs:104`）」）；dispatch 写门并存 `:95`（`:74`）与 `:99`／条件式 `:98-101`（`:40`／`:41`，注「实施后实读 2026-10-10」）。互异处未标同一性 / 时点差（§3 / §6.3 同属 09-15 期实核面） | 以现盘一次重锚统一（或逐处补 as-of 注、并注明两处所指不同）；如该面已在 #1407 读数处置中裁定为不动 ⇒ 在处置面登记该裁定即可 |
| 2 | Consistency（判据归属） | 🟡 | 同一「dispatch 写门资格判定」两说并存：§4 D3 归 `anyLiveDesignSlot`（`:40`「调用点 `thincoder-core/agent/dispatch.mjs:99`（实施后实读 2026-10-10）」），§6.3 D5 行归 `resolveDesignSlot`（`:101`「核 `resolveDesignSlot`（`thincoder-core/agent-tools/subagent-spawn.mjs:115`）」）——两说未标所指差异（是否同一实现的互斥描述 = 未核——源码越范围） | 核明两处所指：若同一实现 ⇒ 收正其一（并随带补 as-of）；若确为两面（分层调用 / 端差）⇒ 在两处各注明所指 |
| 3 | Doc hygiene（as-of 标注） | 🔵 | `PORTABILITY.md` 本批把 §3.7 行 7 坐标改 `spawn-gates.mjs:97-111`（`:175`）、§3.8 行 3 改 `:106-108`（`:185`），但两表表头仍标「消费面（实核 2026-09-27）」（`:167`）/「消费面（实核 2026-10-05）」（`:181`），档头 as-of 清单止于「F11 节（§2 / §3.1 / §3.2 / §3.4 / §3.9）坐标 = **as-of 2026-10-08 实读**。」（`:8`）——2026-10-15 重锚只落变更记录（`:347`） | 沿本档先例（`:349`「头部 as-of 补 2026-10-08 一枚。」）补 2026-10-15 一枚头部 as-of，或在两表表头注明重锚日 |
| 4 | Closest-precedent | 🔵 | 在盘三处变更块未见「同类先例」行 / 「无同类先例」显式声明：§15 新增块（`ADVISOR-CONVERGENCE.md:442-449`）· §3.7 行 7（`PORTABILITY.md:175`）· §3.8 行 3（`PORTABILITY.md:185`）；#1428 所在的 §10 2026-10-14 增面已载块级先例行（`DESIGN-TOKEN-SETTLEMENT.md:183`「**最相近先例**：F-SL1 清点面（:172–178）」。本批先例行是否由批档 §2 承载 = 范围外未核 | 核批档 §2 是否携先例行 / 无先例声明；若两侧皆无 ⇒ 补（本批可勘先例 = §14 维度入册形 `ADVISOR-CONVERGENCE.md:433-440` ∥ F11 批坐标读回先例 `PORTABILITY.md:351`） |
| 5 | Requirements coverage | 🔵 | 四行中 #1407（doc-check 读数处置）在三档零可见落点（`1407` 全文 grep 零命中；三档 2026-10-15 条目只载 #1428 `DESIGN-TOKEN-SETTLEMENT.md:253` ∥ #1444 `ADVISOR-CONVERGENCE.md:453` ∥ #1451 `PORTABILITY.md:347`）——该行闭环面 = 批档 §2（范围外） | 核批档 §2 的 #1407 行是否已闭环；若已闭环，可在三档变更记录加一句指针使后续读者可见 |
| 6 | Doc hygiene（体量） | 🔵 | `ADVISOR-CONVERGENCE.md` read 计数 500 行（内容末行 `:499`；本批 +§15、+A-AC16）——本档自指的拆分判据 = `design/DOC-SYSTEM.md` §5.1 P1（`:498`「落点判据 = `design/DOC-SYSTEM.md` §5.1 P1」；该档不在评审范围，阈值未核）；若该档位对设计档生效 ⇒ 已触 / 逼近档位 | 核 `DOC-SYSTEM.md` §5.1 对设计档的档位；若已触档 ⇒ 将拆分 / 收窄登记入册（本批语义零改） |

VERDICT: pass
计数：🔴 0 / 🟡 1 / 🔵 5

## §4 用户批准（主 agent）

**父侧代签（承用户「自动跑 = 全链自动授权」令 · 2026-10-15 02:2x）**：设计评审（轮 1）⇒ 修正轮（#72）六条全收口且父侧抽验在案 ⇒ **批准**。
**提示词四段逐字稿 = 核准**（内容权在父侧）：稿一 ∥ 稿二（#1451 层级锚定形——与 `spawn-gates.mjs:102-103` 判据同口径）∥ 稿三 ∥ 稿四（#1428 令牌不许放到过期——与在飞令牌回收机制同口径）；四段逐字已核读：措辞 ∥ 落点 ∥ 机制同口径均通过。
**实施面**：CN 审核面（`docs/core/design/prompts/persona-engineering.md`）= eng-designer 笔 ∥ EN 运行面（`thincoder-core/prompts/persona-engineering.md`）= eng-coder 落——两席即发。`PROMPT-SYSTEM.md` §6.11 计数连带（两档 209 ⇒ 210）= **本批零触**（该档域占用登记在案）⇒ 入收口面清单另轮。

## §5 实施记录（eng-coder）
**状态行**：实施完成（EN 运行面两处逐字落（稿二 ∥ 稿四）——审计 ∥ 代码评审各 1 轮无必修项，fix round 零轮，终态 clean）



**交付摘要（car4 实施面 · EN 运行面 · 两处逐字落）**

落点 = `thincoder-core/prompts/persona-engineering.md`（唯一改动档；209 ⇒ 210 行）：
- 稿二（#1451 · 层级锚定形）：替换原 `:163`（`scripts/**` 全域形态）⇒ 现 `:164`。
- 稿四（#1428 · 令牌不许放到过期）：`In-flight token recovery` 条（`:134`）后新增 ⇒ 现 `:135`。

逐字照录（加粗 ∥ 括号 ∥ 破折号 U+2014 ∥ 反引号）；零改写 ∥ 零加注 ∥ 零调序 ∥ 零越清单改动（`git diff` = 本档 1 删 2 加）。

**验收读数（实跑 · cwd = 仓根 `d:/teamcode/thincoder`）**

| # | 判据 | 读数 |
|---|---|---|
| ① | 逐字节全等 | 稿二 `:164 ↔ 批档 §2:105` = 369B、sha256 `74517c7ff3d6e5df`（两侧同值）；稿四 `:135 ↔ 批档 §2:115` = 329B、sha256 `e19c590a70b6c18d`（同值）；node `Buffer.equals` ×2 = **true** |
| ② | 行数 | **210** 内容行（尾换行保留） |
| ③ | `node scripts/doc-check.mjs --root .` | 落笔前 ∥ 后同值：锚 **0 悬空** ∥ 行宽 **OK**（判据项 7 项；行数面差异 88 条 = 报告态，非本批域） |
| ③b | `node scripts/prompt-refs-check.mjs` | 落笔前 ∥ 后同值：**0 命中**（提示词面 84 档 ∥ 代码面 451 档） |

**诚实附注（判据射程）**：EN 提示词档**不在** `doc-check` 的 `scanDirs`（= `docs`）射程内 ⇒ 「本批域零新增红」为真但为**空信号**；EN 面在效机判 = `scripts/prompt-refs-check.mjs`（`PROMPT_DIRS` 含 `thincoder-core/prompts`）——上表 ③b 即该面读数（新文本无 `.md` 词元 ∥ 无 `§` ⇒ J1/J2/J3 零命中）。CN 面（另席 #81，`docs/core/design/prompts/**`）在 `doc-check` 射程内，读数归属另席。

**决策透明表**：本次**零自主取舍**（两端皆逐字落，无分叉）；行号位移（原 `:163` ⇒ 现 `:164`）= 稿四在其上方插入所致的必然位移，非偏离（§2 六坐标 = 落笔前 as-of）。

**审计与代码评审轮次与终态**
- **偏离审计**（explore · 只读）1 轮：四类（部分实施 ∥ 静默简化 ∥ 文档漂移 ∥ 越清单改动）**均未发现**；独立复核 = 行哈希两侧同值（`74517c7ff3d6` ∥ `e19c590a70b6`）、210 行、隐形字符与尾随空白零命中。
- **代码评审**（advisor `type=code`）1 轮：**pass**（🔴 0 ∥ 🟡 1 协调项 ∥ 🔵 3）——无 must-fix 行；🟡 = `PROMPT-SYSTEM.md` §6.11 连带与处置时机口径（收口轮面）∥ 🔵 = 该档 EN 面坐标随本笔 +1 漂移 ∥ 同档 `:89` 全域形残留（#1451 边界外——设计轮已判属 #1449 另一机制）∥ `:133` 邻句极性近反义（非本笔引入）。
- **fix round = 零轮**（两轮均无必修项）；终态 = **clean**。

**上抛项（本段）**
- [上抛·知会] 收口轮面：`PROMPT-SYSTEM.md` §6.11 计数 + 预算表复测 + 该档 EN 面坐标重锚（`:170` / `:174` 类引用随本笔 +1）+ §1 ∥ §4 处置时机口径归一。
- [上抛·知会] `:133`「A consumed token left in the slot is a reuse vulnerability.」与新行 `:135` 末句（unconsumed）读作近反义——非本笔引入；如需收 ⇒ 内容权面（CN 正本 ∥ EN = M9 回写）双面同批，本笔零动作。
- [上抛·知会] EN `:89` ∥ CN `:88` ∥ `discipline-engineering.md` 双面仍载 `scripts/**` 全域形 = #1451 边界外（#1449 已扫判「另一机制」）——仅登记，不重开。

## §6 验证与收口（父代理）

**验证（父侧实读 · 2026-10-15 18:5x）**
- **EN 运行面两处 = 在盘**：`thincoder-core/prompts/persona-engineering.md` 双串命中（`layer-anchored` ∥ `Never let a design token expire`）；交卷读数 210 行为当时值，**现读 216 行**（split−1 口径）——后续批合法增行（当日多笔提示词面提交在案），计数以现值为准。
- **设计侧四项 = 不在盘（实测）**：① CN 提示词两处（稿一 `层级锚定` ∥ 稿三 `令牌不许放到过期`——零命中）② `PORTABILITY.md` 两坐标（`:97-111` ∥ `:106-108`——零命中）③ `ADVISOR-CONVERGENCE.md` §15 + A-AC16（零命中）④ `DESIGN-TOKEN-SETTLEMENT.md` §10 纪律句（「放到过期」零命中）。
- **成因（已断证——非本批落笔质量问题）**：清账轮整树 WIP 落入 `stash@{0}「r3-cleanup-wip」` 未回摘——该 stash 内实证 §15 + A-AC16 全行、car4 变更行俱在；恢复路径 = 从 stash 逐档摘回（评审通过原文，非重建）。CN 两处另备来源 = 本档 §2 五 逐字稿（stash 未含——原样落回）。工作单 = 台账 **#1484**。
- **#1407 收口条件已满足**：member 两批（parity ∥ member-face-mcp）§6 本日收口——其存量 13 项属成员域，随 #1484 重落同拍复跑。
- `PROMPT-SYSTEM.md` §6.11 计数连带 + 预算表复测：现值已随后续批推进（CN 217 ∥ EN 216）——随 **#1468**（双面对拍行）并办。
- 机检读数（落笔轮在案）：悬空 0 ∥ 行宽 OK ∥ `prompt-refs-check` 0 命中（EN 面在效机判）；单测档 = 无（文档/提示词面——落笔轮用「落地档 ↔ §2 逐字稿」逐字节比对，原记在案）；集成面 = 不适用。

**收口结算（父侧）**
- 台账：#1407 ∥ #1428 ∥ #1451 = 已核销（本日核销在案）；#1444（§15 + A-AC16 实体）随 **#1484** 重落补实；设计侧缺项 → **#1484**；PROMPT-SYSTEM 计数 → **#1468**。
- 暂缓批复核：本批零「暂缓」标记。
- 记录冻结：§1 ⇒「已收口 2026-10-15」。
