# 2026-11-08 · refusal-third-shape
> 六段，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 每段只有一个作者：作者的段可 `append` 加内容、可就地改（`edit`）；非作者一概拒。
> 编制：主 agent · 2026-11-08 · 来源 = 用户 2026-11-08 00:43「提示词和工具面调整过吗? 模型能正确的使用新的写门吗?」+ 00:45「补」；前情 = docs/batches/2026-11-08-workspace-root-writable.md（已收口）。
> 台账 = #2163（core · 归批）。前情 = 无（独立批）。
## §1 讨论（主 agent）
**状态行**：已收口 2026-11-08
<§1 模板占位：本批条目 / 关键判据 / 授权口径>

### 讨论与已定决定

**来源**：用户 2026-11-08 00:43 提问，00:45 裁「**补**」。

> 「**提示词和工具面调整过吗? 模型能正确的使用新的写门吗?**」

**父侧实查（改前）**

- **工具面 = 三层都调过**：七件 schema 各加 `project`（不进 `required`）∥ 七份 tool-docs 各补一行用法 ∥ `PROJECT_PARAM_DESC` 单源逐字含「写盘七件在目标取不到项目根时必带」。
- **提示词面 = 零调整**：`thincoder-core/prompts/*.md` 搜 `project:` ∥ 写门 ∥ 工作区根 = **0 命中**。
- **真缺口**：`persona-engineering.md` 的「**When a call is refused, read the refusal**」那句列了**两种**会撞到的形状，而本批新开的窄口让人撞的是**第三种**：

```
它列的：  no project on this call   ∥   row #N is 待讨论 — only a 在途 row carries writes
缺的：    unknown — no project owns this write's target      ← 工作区根那一笔撞的正是这个
```

**后果**：模型第一次写工作区根文件必被拒一次，读拒文能自己纠回来，**但提示词那句「照拒文走」没给它这一形**，等于教了一半。

**已定决定**

- **已定决定**：在 `thincoder-core/prompts/persona-engineering.md` 的「照拒文走」那句**补第三种形状**，并写明 `project` 是那时的唯一来源（传一个「台账里有本笔在途号」的子项目根）。 · 用户原话：「**补**」 · 时间：00:45
- **已定决定**：**只补提示词面**，工具面三处不动（已调过）。 · 父侧裁定 · 时间：00:45

**边界**

- 只改那一处；**不动**同一节已有的两种形状的措辞。
- 不新增判据、不加表格、不另立一节——**加一句话，不是加一个维度**。

**库内勘察**

- `库内 = 已查：'project: ∥ 写门 ∥ 工作区根 ∥ When a call is refused'` → 命中 `thincoder-core/prompts/persona-engineering.md`（那句原文在「For the write gate — every write call names the row it serves」节内）∥ 工具面三处已调（`thincoder-core/tools/shared.mjs` 的 `PROJECT_PARAM_DESC` ∥ 七份 tool-docs ∥ 七件 schema）。
- `库外 = B 类`：改动面是提示词文本，无外部依赖面、无外部断言。

## §2 批次任务与设计（eng-designer）
**状态行**：设计完成（评审轮 6 条已处置：块 ① 扩到 4 行（四条件 + 首句点名 + execute/manifest 无回落）、块 ② 续行收窄、A4 换独占探针、A1 改节切、K3/K5/上抛 2∥3∥6 同步、集成测试补 RTM 读数）
<§2 模板占位：本批条目（覆盖） / 设计档落点 / 机制设计 / 受影响文件与测试覆盖 / 验收对照 / 关键决策 / 上抛项>

### 覆盖条目（本批 = 两条 + 一处同档连带）

| # | 条目 | 来源 |
|---|---|---|
| E1 | 写门节新增一条正面 bullet：`project` 只在写盘目标不落在任何项目里时参与判定，那时它是唯一来源；锚自身不行（无 manifest ⇒ 判成 `declared project is not a project`） | §1「已定决定」+ 用户 2026-11-08「既然补了最好补完整」 |
| E2 | 写门节 `When a call is refused, read the refusal` 那条由两种拒文形状改成三种，第三种 = `unknown — no project owns this write's target` | §1「已定决定」（原批条目） |
| E3 | 同档连带：`docs/core/design/PROMPT-SYSTEM.md` 的 §6.69 副本里 `When a call is refused` 那条的续行随本批同步（旧形退役，D11 ∥ D14；该围栏块其余行不动，判域 = 它自己那一批） | 设计面一致性 · 本席写域内（见 K5） |

**本批不做**：不改写门判据本体；不动工具面三层（schema ∥ tool-docs ∥ `PROJECT_PARAM_DESC`）；不枚举那三句首句的全文；不动写门节其余四条 bullet；不动需求档。

### 设计档落点

设计档 = `docs/core/design/PROMPT-SYSTEM.md` 新增 §6.80（照该档既有节形：来源 ∥ 判据 ∥ 落点 ∥ 逐字终稿 ∥ 对照表 ∥ 用例表 ∥ 验收 ∥ 关键决策 ∥ 先例偏离 ∥ 既有件三问 ∥ 勘察证据行 ∥ 受影响文件 ∥ 集成测试 ∥ 边界 ∥ UI ∥ 上抛项）。节号定在 6.80 = 该档 `### 6.x` 族的下一个空号，落在 §6.79 之后、`## 8. 提示词承载` 之前。

### 落点（文件 + 位置 + 期望改后文）

| 块 | 文件 | 位置（逐字锚） | 期望改后文 |
|---|---|---|---|
| ① | `thincoder-core/prompts/persona-engineering.md` | `Why that is not a deadlock` 那条之后、`When a call is refused, read the refusal` 之前，空行位增列 | 4 行（bullet + 续行 3）：题眼 = `Naming the project when the target has none`；第 3 行 = 四条件 + 「拒文首句点名哪一条没成立」；第 4 行 = `execute` ∥ `manifest` 无回落。逐字 = 设计档 §6.80 围栏块 ①，**整行相等**（A1 判，`n = 4`） |
| ② | 同上 | 替换现盘那一条 `When a call is refused, read the refusal` | 2 行（换写 + 续行）：枚举由两形改三形，第三形 = `unknown — no project owns this write's target`；续行收窄到「目标在锚子树内 ∧ 锚下有带 manifest 的子目录」时 `project` 才是唯一来源。逐字 = 设计档 §6.80 围栏块 ② |

两块的**唯一权威副本** = 设计档 §6.80 的围栏块（本节只引不抄：抄一份就是下一个漂移点，口径 = 本档 §6.37）。已有两形的措辞一个字不动——由 A1 的整行相等判（围栏块 ② 内即原两形逐字）。

块 ① 由 2 行扩到 4 行的原因 = 评审第 1 条：第三形那句拒文由三处返回（无声明 ∥ 锚外 ∥ 锚下无子项目），只教「补 `project`」等于教了四条件里的一条；处置见设计档 §6.80 上抛 2 ∥ 上抛 6。

### 验收对照（每条写「红在什么读数上」；命令住设计档 §6.80「验收命令」）

| # | 判据 | 期望 | 红在什么读数上 | 跑者 |
|---|---|---|---|---|
| A1 | 两块与设计档围栏块逐行相等（比的对象 = §6.80 切片内的围栏块） | 落地档首行各 **1** · `missing` = `none` · `equal: true` | 首行 0 命中 ∥ `missing` 非 `none` ∥ 任一行不等 | 实施轮 |
| A2 | 旧串清零（D14 退役项） | `the two shapes` 在落地档全档 = **0** | 落地档非 0（判域 = 落地档；本档不作判域，理由见 §6.80 A2 行） | 本席 ∥ 实施轮 |
| A3 | 第三形在场 | `no project owns this write's target` 在落地档 = **1**（按出现计） | 0 ∥ > 1 | 实施轮 |
| A4 | 块 ① 三句判据在场（探针串各在块 ① 独占） | `stays out of the judgement while that path resolves` ∥ `The anchor itself will not do` ∥ `two judging points never both decide` 各 **1**（落地档） | 任一 = 0 ∥ > 1。`is the only source` 不作探针：两块各含一句同串（计 2） | 实施轮 |
| A5 | 行宽 ≤300（提示词面按行判、无结构豁免） | 两块六行 `maxLen ≤ 300` | `maxLen > 300` ⇒ 交付门 `REFUSED` | 实施轮 |
| A6 | 交付门 | `doc_check(mode:"gate", docs:["docs/core/design/PROMPT-SYSTEM.md", "thincoder-core/prompts/persona-engineering.md"])` 首行 `PASS` | 首行非 `PASS` | 本席交付前 ∥ 父侧收口复跑 |

### 改前读数（本席本轮实跑 · 命令 = 设计档 §6.80 命令 ① ②）

```text
块 ①：hitsDisk 0 ∥ hitsFence 1（§6.80 切片内）∥ missing "disk" ∥ equal false ∥ fenceLines 4 ∥ maxLen 293
块 ②：hitsDisk 1 ∥ hitsFence 1（§6.80 切片内）∥ missing "none" ∥ equal false ∥ fenceLines 2 ∥ maxLen 273
the two shapes：落地档 1 ∥ 本档 3（= 判据自身 ∥ 探针串 ∥ 退役登记）
no project owns this write's target：落地档 0 ∥ 本档 6
stays out of the judgement…：落地档 0 ∥ The anchor itself will not do：落地档 0 ∥ two judging points never both decide：落地档 0
新文本撞名扫描：五串在 thincoder-core/prompts 全 17 档各 0 命中（none found）
结构读数：persona-engineering.md = ## 18 ∥ ### 5 ∥ 500 行 ∥ 最长行 300
RTM 读数：test/RTM.md = 70 行 ∥ ## 3 段；近面两行 = CLI 12（写盘与跑命令报所替台账行）∥ CLI 8（批次档建在项目里）
doc_check gate（docs = PROMPT-SYSTEM.md）：PASS
```

读数说明（关系，不是数字）：块 ① 的 `missing: disk` 与两块的 `equal: false` 就是 A1 的红侧读数——设计档围栏已是新形、落地档仍是旧形 ⇒ A1 现在读红，实施后读绿。A2/A3/A4 的落地档读数在实施前分别是「非 0 / 0 / 0」，即三条现在都读红。A1 的 fence 计数已按评审第 3 条收进 §6.80 切片（§6.69 的同步副本在切片外，不比、不计）。


### 受影响文件与测试覆盖

| 档 | 面 | 本笔归谁 |
|---|---|---|
| `docs/core/design/PROMPT-SYSTEM.md` | 文档面（设计） | 本席，已落（新增 §6.80 + §6.69 副本一格同步） |
| `thincoder-core/prompts/persona-engineering.md` | 产品代码面（提示词 = 运行期面） | 实施轮 eng-coder（块 ① 4 行增列 + 块 ② 2 行换写） |
| 测试档 | — | **0**：零代码面，提示词文本无可运行单测；验收 = 上表 A1–A6 的实跑读数 |

分层结论 = 无档跨分层（档位线只量代码面；`.md` 提示词档免档位判定）。

集成测试：`none` —— 改动不改任何既有用例断言的业务可观察结果，也未新增业务上真需要的场景；破行 0 · 冗余 0 · 新增 0（理由见设计档 §6.80「集成测试设计」）。

### 关键决策（摘要；理由住设计档 §6.80 K 表）

| # | 决策 | 一句理由 |
|---|---|---|
| K1 | 正面规则与拒文形状同轮落 | 一头教怎么写对、一头教被拒怎么读；只补一头仍要先撞一次 |
| K2 | 「只在那时」的理由住 bullet 内 | 模型读提示词，不读设计档 |
| K3 | 不枚举那三句首句的全文 | 块 ① 与块 ② 只教「首句点出哪一条没成立」，读者拿首句对块 ① 的四个条件；抄三句全文 = 重述机制（D2），加表不是加一句 |
| K4 | 中文内容译成英文面落笔 | 提示词面语言纪律：中文只许在四类字面（`在途` 这类字面照留） |
| K5 | 同档 §6.69 副本只同步那一行的续行 | §6.69 围栏块的判域 = 它自己那一批的落地时刻（`Reach` 七条已被 §6.73 删）；本批只改那一行，免得本档留一句与盘上相反的话 |

### 上抛项

1. 〔知会 · 语言面〕父侧给的中文内容按语义译成英文面落笔，逐字形见设计档 §6.80 围栏块 ① ②；语义未增删。
2. 〔知会 · 措辞面〕块 ① 首句写 `a write tool judges by its target path first`，不写成「七件」再列七个名（枚举七名 = 加一张表；`execute` 带 `workdir` 时走同一支）；语义 = 只在那时参与。
3. 〔知会 · 同档连带〕§6.69 逐字副本同步一格（旧形退役），旧节其余行不回改——判域仍是它自己那一批的落地时刻。

## §3 设计评审（评审子代理）
**状态行**：评审通过（第 2 轮：上一轮 2 🔴 + 4 🟡 全部消解；新增 🟡 1 条（非必修，§6.69 标题权威声明）+ 🔵 2 条）



### 轮次 1（评审子代理）

**设计评审第 1 轮（通审全档）· 结论表**

| # | 严重度 | 状态 | 证据（指针） |
|---|---|---|---|
| 1 | 🔴 | 未消解 | `thincoder-core/agent/write-gate-ledger.mjs` 的 `workspaceRoot` 在 `underKey` 支与 `discoverProjects` 支**各返回一次** `LIST_UNKNOWN_TARGET_NOT_A_PROJECT`；同档头注「会话锚子树内 ∧ 锚下有带 manifest 的直接子目录 ∧ 本笔显式声明了 `project` ∧ 声明解析得出根」。§6.80「本节不枚举后两句——按块 ① 走不会撞到它们」与块 ② 第二句「The third one is the workspace root」据此不成立 |
| 2 | 🔴 | 未消解 | `docs/core/design/PROMPT-SYSTEM.md` 的 A4 行「`is the only source` = **1**（落地档）」+「> 1 ⇒ 红」与块 ① ∥ 块 ② 两处同串（「`project` is the only source」各一）互斥 ⇒ 正确落地后 A4 恒红；批档 §2 A4 行同判 |
| 3 | 🟡 | 未消解 | 命令 ① 的 `const i=P.findIndex(l=>l.startsWith(k)),j=D.findIndex(l=>l.startsWith(k))`：块 ② 取设计档**首次命中** = §6.69 副本，A1 自称比「本节围栏块」 |
| 4 | 🟡 | 未消解 | §6.80 上抛 2「`execute` 带 `workdir` 时走同一支」只及首句：同档 `return wd ? { paths: [wd] } : onlyDeclared()` 不带 `fallbackDeclared`，窄口对 `execute` ∥ `manifest` 的目标形不开 |
| 5 | 🟡 | 未消解 | K5「那一格是盘上仍在行的一句的副本」只对该一行成立：§6.69 围栏块仍列 `- **Reach**: every tool that can land bytes` 等七条，落地档已由 §6.73 删去（本席本轮扫描零命中）⇒ 一格随改后该围栏块成混时态，其 A1 逐行相等改前改后都红、无人登记 |
| 6 | 🟡 | 未消解 | 集成测试设计称「`test/RTM.md` 的故事索引本轮读过」，未记读数、未点名近面行；`test/RTM.md` 故事表近面两行 =「写盘与跑命令都要报它替哪条台账行服务（不分面、不分类命令）」∥「批次档建在项目里（工作区锚报明、不落锚目录）」 |

读数复核（本席本轮实读）：块 ① 第二行逐字计数 = 287（与批档 §2 同数，判据 300，余量 13 字）；落地档 `the two shapes` = 1、设计档 = 3；`no project owns this write's target` 落地档 = 0、设计档 = 6；块 ② 首行设计档 2 处（§6.69 副本 ∥ 本节围栏）。A1 ∥ A2 ∥ A3 ∥ A4 的「改前必红」均为真读数（块 ① 在盘 0 命中、旧串仍在行、第三形 0 命中、三句判据 0 命中）。

计数：🔴 2 · 🟡 4 · 🔵 0

VERDICT: changes-required

### 轮次 2（评审子代理）

**设计评审第 2 轮（只验上一轮 6 条）· 结论表**

| # | 严重度 | 状态 | 证据（指针） |
|---|---|---|---|
| 1 | 🔴 | 已消解 | 围栏块 ① 现为 4 行：第三行「Four things then decide it, and the refusal's first sentence names the one that failed」列齐四条件，第四行「have no such fallback」限定 `execute` ∥ `manifest`；C 表 C6 ∥ C7 ∥ C8 在位；原句「本节不枚举后两句——按块 ① 走不会撞到它们」已删；块 ② 续行收窄为「outside those the first sentence says which condition failed」 |
| 2 | 🔴 | 已消解 | A4 探针换成 `two judging points never both decide`（只在块 ① 第一行），并明写 `project` is the only source 不作探针（两块各含一句、计 2）；A3 判 `unknown — no project owns this write's target` 仍 1 |
| 3 | 🟡 | 已消解 | A1 改节切：命令 ① 取 `const s=D.findIndex(l=>l.startsWith('### 6.80 '))` 切片后再 `sec.findIndex`，批档 §2 读数两块的 `hitsFence` 各 1 |
| 4 | 🟡 | 已消解 | 上抛 2 与块 ① 末行同改：`execute` 带 `workdir` ∥ `manifest` 带 `target` 不开窄口、补 `project` 不生效；C8 对应该形 |
| 5 | 🟡 | 已消解 | K5 写明 §6.69 围栏块整体「**不是当刻副本**」、判域 = 它自己那一批（`- **Reach**` 等七条已被 §6.73 删），上抛 3 同步；本批只同步那一行续行 |
| 6 | 🟡 | 已消解 | 集成测试段补 RTM 读数并点名 `CLI 12` ∥ `CLI 8` 两条，各给「不破」的理由；批档 §2 读数行同记 |
| 7 | 🟡 | 报告 · 非必修 | `docs/core/design/PROMPT-SYSTEM.md` 的 §6.69 标题仍写「**逐字终稿（英文 · 唯一副本 = 本节；围栏内即落地形，实施席逐行整行照落）**」，§6.80 写「唯一权威副本 = 本节」——同一块的权威声明两处；由 K5 的判域声明兜住，本批不动 §6.69（超本批边界），知会父侧下一轮动该节时顺手加判域括注 |
| 8 | 🔵 | 记录 | 块 ① 最长行 293、判据 300（余量 7 字）：下一轮任何追句都撞顶，只能是改写不是追加；A5 的红侧就是交付门 `REFUSED`，故不是待修项 |
| 9 | 🔵 | 记录 | C4 那一腿（「`project` declared」不成立）未记拒文首句读数；三句首句已住勘察证据行，把其中一句挂到 C4 即可闭合块 ① 第三行的「首句点名」 |

计数：🔴 0（未消解）· 🟡 1（非必修）· 🔵 2

VERDICT: pass

### 轮次 3（评审子代理）

**实施轮交付 · 代码面评审（写门节两块）**

| # | 严重度 | 状态 | 证据（指针） |
|---|---|---|---|
| 1 | 🟡 | 报告 · 非必修（§3 设计评审第 2 轮第 7 条已在册，父侧协调项） | 同一围栏块的权威声明两处并存：`docs/core/design/PROMPT-SYSTEM.md` §6.69「唯一副本 = 本节；围栏内即落地形，实施席逐行整行照落」∥ §6.80「唯一权威副本 = 本节」；§6.69 围栏块内七条（`- **Reach**` ∥ `- **The project**` ∥ `Action decides, not the tool` ∥ `No exemption by content` ∥ `init is exempt only where`）在落地档全 0 命中 ⇒ 该块 A1「逐行相等」不可满足，读者无从判断哪份为准 |
| 2 | 🔵 | 记录（记录措辞滞后，落盘态为准） | 批档 §2 的 E3 ∥ §6.80 的 K5 ∥ 上抛 3 均写「只同步那一行的续行」，而 §6.69 那条首行现为 `the three shapes` 并含 `unknown — no project owns this write's target` ⇒ 该条首行亦已改写；按 D > 记录取设计档 |
| 3 | — | 已核 · 绿 | A1：落地档两块六行与 §6.80 围栏块逐行同文（`Naming the project when the target has none` 四行 ∥ `When a call is refused, read the refusal` 两行）；A2 `the two shapes` 落地档 0；A3 第三形 1；A4 三枚探针串各 1；新句无 `.md` ∥ `§` 引用、无越宽行 |
| 4 | — | 已核 · 绿 | 新句与机制一致：`workspaceRoot` 三支拒文（`caseNotAProject` ∥ `caseOutsideAnchor` ∥ `caseNoSubProject`）、四条件就是门槛；`ledgerGatetargets` 的 `execute.workdir` ∥ `manifest.target` 取 `{ paths }` 不带 `fallbackDeclared` ⇒ 块 ① 末行「无回落」成立；`project` 只在目标取不到根时补位（`fallbackDeclared` 不入路径成立的判据） |

VERDICT: pass
计数：🔴 0（未消解）· 🟡 1（非必修）· 🔵 1

## §4 用户批准（主 agent）

### 用户批准

- **批准形 = 用户提问 + 两字裁定**：00:43「**提示词和工具面调整过吗? 模型能正确的使用新的写门吗?**」→ 00:45「**补**」→ 00:45「**一句话够吗? 既然补了最好补完整.**」= **两轮扩大范围**，均由用户原话给出。
- **父侧裁定（三处）**：① **只补提示词面**（工具面三层已调过，本批不动）；② **只补两块，不枚举五句拒文**——枚举五句等于加一张表，加表不是加一句；③ **中文内容译成英文面落笔**（提示词运行面英文，中文只许四类字面）；父侧采认设计席的译法。
- **设计评审两轮**：轮 1 `changes-required`（**2 🔴 + 4 🟡**）→ 修正 → 轮 2 `pass`。
- **两条 🔴 都是父侧内容不够**：`🔴1` 我给的「补 `project` 是唯一来源」只覆盖四条件里的一条（那句拒文由三处返回）；`🔴2` `A4` 的探针串在两块里各一次 ⇒ 正确落地必红。
- **实施一轮过**：内部对审 6 项 `clean` ∥ 代码评审 `pass`；**父侧复量五项**（三形各 1 ∥ 旧句 0 ∥ 四条件在 ∥ 最长 293 ∥ 无文档引用）+ 项目自带 `prompt-refs-check` 三式零命中。
- **父侧量法教训**：先用 PowerShell 数中文串得一形为 0，**差点误判**；换 `node` 复量才正确——**shell 的 CJK 编码会让「缺」和「量错」长得一样**。

## §5 实施记录（eng-coder）
**状态行**：实施完成（两块逐行照 §6.80 围栏落盘 · A1–A6 全绿 · 自审两轮收敛）



### 实施（eng-coder · 本批唯一改动 = 一档提示词）

**改动面**：`thincoder-core/prompts/persona-engineering.md` 写门节，两块，逐字照 `docs/core/design/PROMPT-SYSTEM.md` §6.80 的围栏块 ① ② 落，未润色、未重排。

| 块 | 位置 | 形 | 落地判 |
|---|---|---|---|
| ① | `- **Why that is not a deadlock**` 之后、`- **When a call is refused, read the refusal**` 之前 | 新增 bullet + 续行 3 = **4 行** | 与 §6.80 围栏块 ① 逐行整行相等 |
| ② | 原 `- **When a call is refused, read the refusal**` 那一条 | 整条换写 + 续行 1 = **2 行** | 与 §6.80 围栏块 ② 逐行整行相等 |

节内其余四条 bullet（`Why the row` ∥ `A batch's first write is always reachable` ∥ `Why that is not a deadlock` ∥ `Fix the call`）与节外全文零改。

`git diff -- thincoder-core/prompts/persona-engineering.md` 只有两个 hunk；文件 500 → 505 行（块 ① +4，块 ② 1 行变 2 行 ⇒ +1），`##` 18 ∥ `###` 5 不变。

**A1–A6 读数（改前红 / 改后绿，两侧都是本轮实跑同一条命令的输出）**

| # | 改前（红侧） | 改后（绿侧） |
|---|---|---|
| A1 | 块① `hitsDisk 0` ∥ `missing "disk"` ∥ `equal false` ∥ `maxLen 293`；块② `hitsDisk 1` ∥ `missing none` ∥ `equal false` ∥ `maxLen 273` | 块① `hitsDisk 1` ∥ `hitsFence 1` ∥ `missing none` ∥ `equal true` ∥ `maxLen 293`；块② `hitsDisk 1` ∥ `hitsFence 1` ∥ `missing none` ∥ `equal true` ∥ `maxLen 273` |
| A2 | `the two shapes` 落地档 **1** | **0** |
| A3 | `no project owns this write's target` 落地档 **0** | **1** |
| A4 | 三枚探针串落地档 `0 / 0 / 0` | `1 / 1 / 1`（`is the only source` 按判据不作探针，落地档计 2） |
| A5 | 对象 = 围栏块 `maxLen 293` | 落地两块六行 `maxLen 293 ≤ 300`；新增行中文仅 `在途` ∥ `待讨论`（台账状态字面）；两块无 `.md` ∥ `§数字` 引用 |
| A6 | — | 交付门首行 `DOC-CHECK GATE: PASS`（范围 2 档：`docs/core/design/PROMPT-SYSTEM.md` ∥ `thincoder-core/prompts/persona-engineering.md`） |

A6 实跑命令（复跑用）：

```text
doc_check(mode:"gate", docs:["docs/core/design/PROMPT-SYSTEM.md", "thincoder-core/prompts/persona-engineering.md"])
→ DOC-CHECK GATE: PASS · 0 段有问题（2 档全清）
```

**自审轮次（协议两步都跑完，无回改）**

- **探索审计（只读 divergence audit）**：6 项全 clean —— ① 逐字一致（两块六行无缺行、无多行、无改字）；② 四条件 + 首句点名 + `execute`/`manifest` 无回落四句俱在；③ 无弱化；④ 落地档内无第二种拒文教法（全档仅一条枚举）；⑤ 无域外改动；⑥ §2 受影响文件表与 §6.80 同步项未被推翻。
- **代码评审（advisor · code）**：`VERDICT: pass`，🔴 0 · 🟡 1（非必修）· 🔵 1，结论表已落 §3 轮次 3。
  - 🟡 = `docs/core/design/PROMPT-SYSTEM.md` 的 §6.69 与 §6.80 各写一次「权威副本」，而 §6.69 围栏块七条在落地档零命中 ⇒ 该块 A1 逐行相等不可满足。已在 §3 第 2 轮第 7 条在册，属父侧协调项，本批不动设计档。
  - 🔵 = §2 的 E3 ∥ §6.80 的 K5 ∥ 上抛 3 写「只同步那一行的续行」，盘上 §6.69 那条首行亦已改写。按 D > 记录，落盘态为准。

**测试覆盖**：`none` —— 零代码面，`.md` 提示词档无可运行单测；验收 = 上表 A1–A6 实跑读数。集成测试 `none`（破行 0 · 冗余 0 · 新增 0，理由同 §2）。

**域外改动**：无。工具面三层（`project` 的 schema ∥ 七份 tool-docs ∥ `PROJECT_PARAM_DESC`）、写门判据本体、需求档、批档其余段、§6.69 围栏块 —— 全零触。

**记录侧笔误（就地记，不回改他人段）**：§3 轮次 3 第 4 行的 `ledgerGatetargets` 是笔误，机制档符号逐字 = `ledgerGateTargets`。

**项目自带校验（提示词面）**：`node scripts/prompt-refs-check.mjs`（仓根零参）→ 实测「汇总：提示词面 71 档 · 代码面 487 档 · 命中 0」∥ `OK(prompt-refs): J1/J2/J3 三式零命中` ⇒ 新增两块未引入文档引用，与 A5「无 `.md` ∥ `§数字` 引用」互证。

## §6 验证与收口（父代理）

### 验证与收口（父侧独立复量）

| 验收 | 量法 | 父侧读数 |
|---|---|---|
| **三种拒文形状在位** | 数三串 | `no project on this call` **1** ∥ `only a 在途 row carries writes` **1** ∥ `no project owns this write's target` **1** |
| **旧句清零** | 数 `the two shapes` | **0** |
| **正面规则四条件在** | 数 `Four things then decide it` ∥ `no such fallback` | **1 ∥ 1** |
| **行宽** | 两块六行 | 块 ① `293,251,243,142` ⇒ 最长 **293**（判据 300） |
| **无文档引用** | 扫 `.md` ∥ `§数字` | **0** |

**父侧本轮的量法教训**：先用了 PowerShell 数中文串，得 `only a 在途 row carries writes` = 0，差点判成缺一形；**换 `node` 复量才是 1**——**shell 的 CJK 编码会让「缺」和「量错」长得一样**。

**这批存在的理由**

用户 00:43 原话：「**提示词和工具面调整过吗? 模型能正确的使用新的写门吗?**」

**实查结果**：工具面三层（七件 schema ∥ 七份 tool-docs ∥ `PROJECT_PARAM_DESC`）**全调过**；**提示词面零调整**，而写门节那句教「照拒文走」的话只列了两种形状——新开的窄口让模型撞的是第三种。

**⇒ 模型第一次写工作区根文件必被拒一次。**能用（读拒文能自纠），但每个模型、每一次都多一个往返。

**两轮评审、两次纠父侧的内容错**

- **轮 1 的 🔴1**：父侧给的「补一句 `project` 是唯一来源」**只覆盖四个条件里的一个**——那句拒文由**三处**返回（目标在锚外 ∥ 锚下无子项目 ∥ 没声明），后两处模型**控不住**。改为块 ① 写四条件 + 「拒文首句点名哪一条」。
- **轮 1 的 🔴2**：`A4` 要 `is the only source` = 1，而两块各含一次 ⇒ **正确落地必为 2 ⇒ 判据永红**。换独占探针串。
- **⇒ 两条都是「我写的内容不够」，评审读代码读出来的。**

**带债收口（不静默）**

- **`§6.69` 的标题仍写「唯一副本 = 本节」**，与 `§6.80` 的「唯一权威副本」并存；内容层面块 ② 两处同文不冲突，`K5` 的判域声明已兜住。**本批边界明写不动该节其余行**，下一轮动它时补判域括注。
- **`§6.69` 围栏块的逐行相等判据改前改后都读红**——判域 = 它自己那一批的落地时刻（`- **Reach**` 等七条已被 `§6.73` 删去），本批不认领。
- **块 ① 最长行 293 字，判据 300，余量 7 字**：下一轮对该块**只能改写或拆行，不能追加**（拆行要连带改 `A1` 的 `n`）。

**收口**

- 台账 `#2163`：**在途 → 待核销 → 已核销**。
