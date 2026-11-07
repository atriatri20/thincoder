# 2026-11-08 · workspace-root-writable
> 六段，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 每段只有一个作者：作者的段可 `append` 加内容、可就地改（`edit`）；非作者一概拒。
> 编制：主 agent · 2026-11-08 · 来源 = 台账 #2158；用户 2026-11-07 23:56「多仓项目根的 AGENTS.md 没法修改」+ 2026-11-08 00:13 裁定「B」。
> 台账 = #2158（core · 归批）。前情 = 无（独立批）。
## §1 讨论（主 agent）
**状态行**：已收口 2026-11-08
<§1 模板占位：本批条目 / 关键判据 / 授权口径>

### 讨论与已定决定

**用户原话（两次）**

> 「**工程模式下写门禁止了写非项目目录的文档，导致多仓项目根的 agents.md 没法修改，这个得解决一下。**」（2026-11-07 23:56）
> 选形时：「**B**」（2026-11-08 00:13）

**父侧实读定位（写门判据）**

- `ledgerGateTargets`（`thincoder-core/agent/write-gate-ledger.mjs`）：写盘七件只取**目标路径**；`project` 声明只对 `bash ∥ memory ∥ execute ∥ manifest` 生效。
- `resolveProjectRoot(p)`：目标沿祖先链找最近的 `PROJECT-MANIFEST.json`。
- `D:\teamcode\AGENTS.md`：`D:\teamcode` 无 manifest，再往上没有 ⇒ `null` ⇒ **拒**。
- ⇒ **不是参数没传对，是这条路根本没留口**：给 `project:` 也不管用（写盘七件不读它）。

**那档是什么（父侧已读全文）**

不是指路表——技术栈、常用命令、编码约定、提交格式、架构注记，**且会变**。⇒ **「只做指路」那形不成立**（内容没有第二个家）。

**已定决定**

- **已定决定**：取 **B 形**——写门开一个**窄口**：目标解析不到项目根 ∧ 目标在会话锚子树内 ∧ 锚下确有 ≥1 个子项目 ∧ 调用方显式声明了 `project` ⇒ 按声明那个项目的账判，**仍须带在途号**。 · 用户原话：「**B**」 · 时间：00:13
- **已定决定**：**决策 41 的措辞随之改**——会话锚**仍不作「判哪个项目的账」的来源**，但**作定界来源**（判断目标在不在锚子树内）。「永不充当判据点」这句与新规则冲突，必须同轮改齐。 · 父侧裁定 · 时间：00:13
- **已定决定**：**不加任何「不声明就放过」的默认**——显式声明是口的必要条件，不声明照旧拒。 · 父侧裁定（决策 41 的核心保留） · 时间：00:13

**边界（四条，各自挡什么）**

| 条件 | 挡掉什么 |
|---|---|
| 目标在**会话锚子树内** | 写 `C:\Windows\…` 这类锚外路径，照旧拒 |
| 锚下**确有 ≥1 个子项目**（带 manifest 的直接子目录） | 随便一个空目录不成「工作区」 |
| **显式声明 `project`** | 「不声明就过」——决策 41 的核心不许丢 |
| **仍须带在途号且该号在途** | 拦人没变，只是拦到的地方对上了 |

**顺带覆盖**：`D:\teamcode\thinworker` ∥ `thincoder-issues` 这类**无 manifest 的子目录**今天同样写不进去，同一个口子一并解决——**但本批不把它们写进判据**（判据只认「锚子树内 + 锚下有子项目」，不枚举目录名）。

**明令不做**

- **不给工作区挂 manifest**（A 形）——那会让「工作区」与「项目」两个概念混掉，`doc_check` 域表与 `manifest read` 的 workspace 判定都会变。
- **不放宽到「锚外也可写」**——只开锚子树内这一格。
- **不动号那半**（仍须在途号）；**不动 `bash ∥ execute` 的口径**（记忆：命令面 = 甲，已被否的乙不要再提）。

**库内勘察**

- `库内 = 已查：'决策 41 ∥ 会话锚永不充当判据点 ∥ resolveDeclaredRoot ∥ ledgerGateTargets'` → 命中 `thincoder-core/agent/write-gate-ledger.mjs`（`ledgerGateTargets` L216 ∥ `resolveDeclaredRoot` L189 ∥ 判序 L326-352）、`docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` 的 `§2.3`（决策 41 正文 L1309 ∥ R31 判据行 L1399 ∥ 判据点来源 L112/L179）∥ `thincoder-core/agent/write-gate.mjs`（入口与门组装）。
- `库外 = B 类`：改动面是仓内写门判据，无外部依赖面、无协议实现；结论面零外部断言。

**待设计席回答（父侧不代答）**

- 「锚子树内」怎么判（`path.relative` 前缀？符号链接？大小写？）——**Windows 路径大小写不敏感，判据要写清怎么办**。
- 声明无效的四态（不存在 ∥ 不是项目 ∥ 与锚无关键 ∥ 越界）在新口子下各自落到哪一句拒文——**别让新口子把旧拒文吃掉**。

## §2 批次任务与设计（eng-designer）
**状态行**：设计完成（R34–R37 四条；机制落设计档 §2.3.1；上抛项 0）
<§2 模板占位：本批条目（覆盖） / 设计档落点 / 机制设计 / 受影响文件与测试覆盖 / 验收对照 / 关键决策 / 上抛项>

### 目标

现场：`D:\teamcode\AGENTS.md`（工作区根，其下 `thincoder` 带 `PROJECT-MANIFEST.json`）。这个文件今天一条路也写不进去。

为什么写不进去，三句：

- 写盘七件只按目标路径沿祖先链取根（`resolveProjectRoot`）。
- `D:\teamcode` 及其祖先链都没有 manifest ⇒ 取不到根。
- 调用方给 `project:` 也不管用——写盘七件不读它（设计档 `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` §2.3 原「名字只为被读的地方存在」条）。

本批按 §1 已定决定开一格窄口（B 形）。机制全文落设计档 §2.3.1；本段只给落点、验收与禁止项。

### 本批条目（覆盖）

台账 `#2158`（core · 归批）拆成四条，一条一条可核销：

| 条目 | 一句话 | 判据住设计档 |
|---|---|---|
| R34 工作区根窄口 | 目标取不到项目根 ∧ 目标在会话锚子树内 ∧ 锚下有带 manifest 的直接子目录 ∧ 调用方显式声明 `project` ⇒ 按声明那个项目的账判，仍须在途号 | §2.3.1 判据与判序 |
| R35 写盘七件读 `project` | 七件的 `parameters.properties` 加 `project`（描述单源 = `thincoder-core/tools/shared.mjs` 的 `PROJECT_PARAM_DESC`），只在目标取不到项目根时被读；目标取得到根时以根为准 | §2.3 逐工具对照表 ∥ §2.3.1 |
| R36 决策 41 措辞改齐 | 会话锚**仍不作「判哪个项目的账」的来源**，新增作**定界来源**；「永不充当判据点」改成有范围的句子 | §2.3 ∥ §4 决策 41 |
| R37 新口子不吃旧拒文 | 声明无效四态与锚外目标各自落到自己那一句拒文；锚当项目传进来仍拒 | §2.3.1 拒文表 |

### 落点表

| # | 文件 | 符号 / 位置 | 期望结果 | 为什么 |
|---|---|---|---|---|
| 1 | `thincoder-core/agent/write-gate-ledger.mjs` | `ledgerBindWriteConflict` 的定位参数分支（现「每个目标按自己的祖先链取根」那段） | 取不到根时先进 §2.3.1 的窄口判：声明无效 / 目标在锚外 / 锚下无子项目 各落自己那句拒；四条件全成立 ⇒ `ledgerRowAt(声明根, …)` 照原样判号 | 判据只加一格，号的半边一字不动 |
| 1b | 同档 | `ledgerGateTargets` | 写盘七件在「路径取不到项目根」时改读 `args.project`；路径取得到根时 `project` 不参与（定位参数优先） | 声明只在没有定位判据点时补位——两条判据点不许同时生效 |
| 1c | 同档 | 新模块内函数 `workspaceRoot`（不导出） | 入参 = 目标绝对路径 + 会话锚 + 声明；出 = `{root}` 或 `{refusal}`；「锚子树内」复用既有 `underKey`，「锚下有带 manifest 的直接子目录」复用 `thincoder-core/manifest-discovery.mjs` 的 `discoverProjects(anchor)`，判 `kind === "workspace" && matched === "manifest"` | 两条都是既有单源，本批不新写目录扫描、不新造路径比较坐标系 |
| 1d | 同档 | 拒文常量 | 加两条 `<case>`（逐字见设计档 §2.3.1 拒文表），新增一个 `import { discoverProjects }` | 拒文是唯一教学面（决策 38），新口子的三个失败条件各要一句 |
| 2 | `thincoder-core/agent/write-gate.mjs` | 档头判据说明 | 补 §2.3.1 那一格；`ledgerBindWriteConflict` 的导出与调用面零改 | 判据全文住原档档头，不改这里就是两份相反的活判据 |
| 3 | `thincoder-core/tools/shared.mjs` | `PROJECT_PARAM_DESC` | 句内补上写盘七件：带定位判据点的四把沿用原口径，七件「只在目标取不到项目根时被读」 | 描述单源一处改，零手写副本 |
| 4 | `thincoder-core/tools/file.mjs` · `thincoder-core/tools/patch.mjs` · `thincoder-core/tools/ops.mjs` | `parameters.properties` | 各加 `project` 一格（描述 = `PROJECT_PARAM_DESC`，不进 `required`） | 模型不知道有这参数，第一次撞的还是拒文 |
| 5 | `thincoder-core/tool-docs/write.md` · `thincoder-core/tool-docs/edit.md` · `thincoder-core/tool-docs/insert_after.md` · `thincoder-core/tool-docs/apply_patch.md` · `thincoder-core/tool-docs/delete.md` · `thincoder-core/tool-docs/hashline_edit.md` · `thincoder-core/tool-docs/file_ops.md` | 各档正文 | 各补一行 `project` 用法 + 「目标取得到项目根时它不参与」那句 | 描述面是模型真正读到的那一面 |
| 6 | `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` | §2.3 ∥ §2.3.1 ∥ §4 决策 41 ∥ §3 ∥ §5 ∥ §6 ∥ §7 ∥ §9 | 本设计轮已落（见本段末「设计档已落章」） | 设计档是规范面，措辞不同轮改齐就是下一轮的错指令 |

**档位结论**：`thincoder-core/agent/write-gate-ledger.mjs` 是本批唯一的主落档（本批净增约 40 行）。实施轮用 `doc_check` 的 `lines` 读数复量，越 500 软线时切法 = `workspaceRoot` 与新拒文常量随写锁段整体迁出——本批不新增拆单义务。其余五档在软线内，无一档跨档位。

### 验收（每条带红法）

可跑面 = 本批单测档 `docs/batches/2026-11-08-workspace-root-writable.test.mjs`（与批档同名同目录，随本批收口删除）。跑法 `node --test docs/batches/2026-11-08-workspace-root-writable.test.mjs`。

夹具 = 临时工作区根 + 其下一个带 `PROJECT-MANIFEST.json` 的子项目 + 该子项目台账里一条在途行、一条已核销行。

| 条目 | 判据（会红的读数） |
|---|---|
| R34 | ① 子项目声明 + 在途号写工作区根的文件 ⇒ 放行、字节落盘。② 同形不带 `project` ⇒ 拒、字节零改。③ 同形带号但号是已核销 ⇒ 拒、拒文点名该状态。④ 目标在**锚外**（临时工作区外另建一条路径）⇒ 拒、拒文 = 设计档 §2.3.1 拒文表「锚外」那句。⑤ 会话锚下**零带 manifest 的子目录**、声明指向锚内更深一层的项目 ⇒ 拒、拒文 = 「锚下无子项目」那句。⑥ 声明 = 会话锚自身（无 manifest）⇒ 拒、拒文仍 = `declared project is not a project`。⑦ 声明 = 一个存在的平级目录 ⇒ 同拒。⑧ 锚下只有**裸 git 仓**（无 manifest）的子目录 ⇒ 同 ⑤ 拒（`discoverProjects` 报 `matched: "git"`，不成立窄口） |
| R35 | 写盘七件 schema 各含 `project` 键且不在 `required`；`PROJECT_PARAM_DESC` 句内含写盘七件的适用条件；路径与 `project` 同给且各自指向不同项目时按路径判（直调 `ledgerBindWriteConflict` 取证）——证明声明只在无定位根时被读 |
| R36 | 设计档里 `grep -c "会话锚永不充当判据点"` = 0；§4 决策 41 正文同时含「不作…判哪个项目的账」与「定界」两句；`thincoder-core/agent/write-gate-ledger.mjs` 档头同一句读数为 0 |
| R37 | 锚当项目传（`project` = 会话锚自身）⇒ `declared project is not a project`。目标在锚外带合法声明 ⇒ 只是那句新拒文，**不是** `declared project is not a project`（两条互不顶替）。这三支的在途清单单位仍是既有 `unknown — …` 三句之一，不出现 `none` |

**集成面**：本批 delta 见设计档 §9（改一行 + 增一行，编号先定在 `test/RTM.md`，再由实施轮写用例标题）。集成跑法是父侧收口门，不在本段跑。

### 边界与禁止项

- **不给工作区挂 manifest**：本批只开写门一格，`manifest` 工具的 workspace 判定与 `doc_check` 域表零改。
- **不放宽到锚外**：锚外目标照拒，本批不开第二条出路。判定按**字面路径**走（`gateKey` 一枚坐标）：经锚内目录链接指到锚外的目标仍算在界内——这是既有坐标系的性质，不是第二出路。
- **不加「不声明就放过」的默认**：声明是口的必要条件；无声明照旧拒。
- **不动号那半**：仍须在途号且 `status = 在途`；号不在盘 / 非在途 / 非行号形的四情形一字不改。
- **不动 `bash` ∥ `execute` ∥ `manifest` ∥ `memory` 的口径**：那四把的声明支（决策 40）零改——它们本就没有「目标路径」这个定位参数，窄口对它们无意义。
- **判据只认「锚子树内 + 锚下有子项目」**，不枚举 `thinworker` ∥ `thincoder-issues` 这类目录名。
- **不加 realpath / 符号链接解析**：路径比较沿用 `gateKey` 那一枚坐标系（`resolve` + 反斜杠归一 `/` + win32 小写归一），与 `(a)` 支同一坐标；另立一套就变两个判据。
- **不动 `depth > 0` 守卫、普通模式、设计门位次、跨批档写锁与 D5 冻结窗**。

### 上抛项

- 无。§1 交办的两问已在设计档 §2.3.1 逐条作答（锚子树内的判法 ∥ 声明无效四态的拒文落点），无待裁项。

### 设计档已落章（本设计轮）

`docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md`：新增 §2.3.1（判据 · 判序 · 拒文表 · 先例与调研）；修订 §2.3（判据点来源补第三条、写盘七件不再「永不被读」、判据点表补 `project` 一格）、§4 决策 41、§3 受影响文件、§5 验收、§6 用例表、§7 边界、§9 RTM delta。

### 设计轮修正（§3 第 1 轮 13 条 · 逐条处置）

| # | 处置 |
|---|---|
| 1 🔴 | 设计档 §2.3 末条与 §7 一条改成统一口径：写盘七件 schema 各带 `project`、只在目标取不到项目根时被读、定位参数在场时不参与判定（与 §2.3.1 条件 ④ ∥ §5 R35 一字不差）。复扫「写盘七件不加」∥「不给写盘七件加」= 0 命中 |
| 2 🟡 | 设计档 §5 R2 ⑥ 补限定语：目标在任一项目之外 **∧ 本笔无 `project` 声明** ⇒ 同拒；并指向 R34 的放行支 |
| 3 🟡 | 设计档 §9 增行编号 12-15 → **12-16**（12-15 现盘已占 = `manifest` 的 `init` 取根豁免支）；补「进入口 = 父侧 `write` 工具调用（工程模式 depth-0）」；落号位置改指 `test/rtm/guard.md` 故事 12 那一节 |
| 4 🟡 | 设计档 §5 可跑面拆两层：本批（R34–R37）用本节「验收」那一本同名单测档；历史条目（R1–R33）读数落各批当时那一本、随收口已删、不追改 |
| 5 🟡 | 设计档 §3 档位表补 `thincoder-core/agent/write-gate-ledger.mjs` 一行（结论 = 软线内、本批不跨档位、本批唯一主落档）；原「新档」措辞改为「该档已在盘」 |
| 6 🟡 | 设计档 §2.3.1 探针宿主改指定义处 `thincoder-core/manifest-discovery.mjs`，并写明 `thincoder-core/manifest.mjs` 只是转口；条件 ① 的判据名统一 `resolveProjectRoot`，`owningProject` 只作其判据体说明 |
| 7 🟡 | 三条探针读数逐字记进本节「探针读数」块（P1–P5），设计档只留关系与命令 |
| 8 🟡 | 设计档 §2.3.1 补「三问」块：`workspaceRoot` 与两条新 `<case>` 各给 `none found:` 与已查面 |
| 9 🟡 | 本节「不放宽到锚外」条补字面路径限定，与设计档 §2.3.1 的代价句取同一口径 |
| 10 🟡 | 设计档 §2.3.1 依据表 ④ 改标「既有拒文换串」（判据 = 决策 41 代价面 + 实机 02:53）；⑤ 给可复现命令与读数指向（P5） |
| 11 🔵 | 设计档 §5 R36 扫描面口径改成与本节 R36 同一句：代码面 + 测试面 + 设计档，三面 `grep -c` 全 0 |
| 12 🔵 | 记录面分层成立 —— 不动作 |
| 13 🔵 | 评审环境无标准档与文档地图 —— 不动作 |

### 探针读数（2026-11-08 实跑，本批）

```text
P1 resolveProjectRoot(D:/teamcode/AGENTS.md) = null
P2 discoverProjects(D:/teamcode) = {"kind":"workspace","matched":"manifest"}
P3 resolveLedgerRoot(D:/teamcode/thincoder, D:/teamcode) = {"root":"D:\\teamcode\\thincoder","basis":"self"}
P5 discoverProjects(<临时锚，仅裸 git 子目录>) = {"kind":"workspace","matched":"git","projects":0}
P5b resolveProjectRoot(<该锚>/x.md) = null
```

- **P5 的锚怎么造**：`New-Item -ItemType Directory "<临时目录>\bare-git\.git" -Force`，该锚自身与其子目录都不带 manifest ⇒ `matched` ≠ `manifest` ⇒ 设计档条件 ③ 不成立、落「锚下无子项目」那句。
- **P4 不算读数**：`owningProject` 要两个入参（target 与界），单参调用抛 `ERR_INVALID_ARG_TYPE`——它的判据体归属写在设计档 §2.3.1「两个谓词的关系」，不作条件 ① 的判据名。

## §3 设计评审（评审子代理）
**状态行**：评审通过（第 2 轮：上轮 13 条修正全部核实，无未决 🔴）



### 轮次 1（评审子代理）

**设计评审第 1 轮 · 通审全档 · 结论表（一行一发现）**

| # | 严重度 | 状态 | 证据（指针） |
|---|---|---|---|
| 1 | 🔴 | 未处置 | `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` §2.3 末条「写盘七件不加——目标路径恒在。」+ §7「不给写盘七件加 `project`」 vs 同档 §2.3「⇒ 七件也各加一格」· §2.3.1 条件 ④ · §5 R35「七件 schema 各含 `project` 且不在 `required`」——同一机制两处相反 |
| 2 | 🟡 | 未处置 | 同档 §5 R2 ⑥「写盘工具目标在任一项目之外 ⇒ 同拒」缺「且本笔无 `project` 声明」限定，与 R34 放行支相反 |
| 3 | 🟡 | 未处置 | 同档 §9「增的行 = 12-15」与同档 §9 已册 12-15（`manifest` 的 `init` 取根豁免支）同号；该 delta 亦无「进入口」一项 |
| 4 | 🟡 | 未处置 | 同档 §5 可跑面行点名 2026-11-03 那一本单测档，`docs/batches/2026-11-08-workspace-root-writable.md` §2 点名本批那一本——R34–R37 的验收入口不是同一本 |
| 5 | 🟡 | 未处置 | 同档 §3 档位表无 `thincoder-core/agent/write-gate-ledger.mjs` 一行（只有条件式切法）；同档 §3 称其为「新档」，而批档 §1 实读该档已在盘、同档 §3 另处记「改造」 |
| 6 | 🟡 | 未处置 | 同档 §2.3.1 探针引 `thincoder-core/manifest.mjs`，批档 §2 落点 1c 引 `thincoder-core/manifest-discovery.mjs`；条件 ① 写 `resolveProjectRoot`，同档 §2.3.1 依据表写 `owningProject` |
| 7 | 🟡 | 未处置 | 同档 §2.3.1 依据块「读数住批档 §2 与命令输出，本档不转录」，而 `docs/batches/2026-11-08-workspace-root-writable.md` §2 无任何探针读数 |
| 8 | 🟡 | 未处置 | 同档 §2.3.1 无 `existing: …` ∥ `none found: …` 三问行（`workspaceRoot` 与两条新 `<case>`）；对照同档 §2.3「三问（判据函数与导出名的既有件答案）」 |
| 9 | 🟡 | 未处置 | 同档 §2.3.1「代价照写：目标经链接指向锚外时仍按字面路径判」与批档 §2 边界「锚外目标照拒，本批不开第二条出路」口径差一句 |
| 10 | 🟡 | 未处置 | 同档 §2.3.1 依据表 ⑤「夹具形：零带 manifest 子目录的临时锚 + 声明指向更深一层的项目」——④⑤ 两支无实读观察、无复现命令（判据 6b） |
| 11 | 🔵 | 核过 | 父侧四问第 1 ∥ 3 条：② 走 `underKey` 一枚 `gateKey` 坐标、③ 只取 `kind`/`matched` 两值、①②③⑥ 沿用旧串——未找到绕行支，也未找到新支吃掉旧拒文 |
| 12 | 🔵 | 未处置 | 同档 §5 R36 扫描面 = 代码与测试面（理由「本档要逐字写这条判据，字面必然在」），而同档该串实读零命中；批档 §2 R36 的扫描面含设计档——两处口径不同 |
| 13 | 🔵 | 备注 | 本轮无项目标准档、无文档地图（评审环境已声明）；行数增量读数住批档 §2（记录面），与同档 §3「行数读数不落本档」不冲突 |

计数：🔴 1 · 🟡 9 · 🔵 3（共 13 行；其中 🔵 第 11 行为核过结论，不计处置项）

VERDICT: changes-required

### 轮次 2（评审子代理）

**设计评审第 2 轮 · 只验上轮 13 条 · 结论表（一行一发现）**

| # | 严重度 | 状态 | 证据（指针） |
|---|---|---|---|
| 1 | 🔴 | Fixed | `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` §2.3 末条现逐字「**写盘七件也各带 `project` 一格**」、§7 现逐字「**写盘七件的 `project` 只在目标取不到项目根时被读**」——旧串「写盘七件不加」∥「不给写盘七件加」复扫 0 命中，与 §2.3.1 条件 ④ ∥ §5 R35 ∥ §3 受影响文件行同口径 |
| 2 | 🟡 | Fixed | 同档 §5 R2 ⑥ 现逐字「写盘工具目标在任一项目之外 ∧ 本笔无 `project` 声明 ⇒ 同拒；带子项目声明 + 在途号写同一目标 ⇒ 按 `§2.3.1` 窄口放行」 |
| 3 | 🟡 | Fixed | 同档 §9 现逐字「**增的行 = 12-16**」并补「进入口 = 父侧 `write` 工具调用（工程模式 depth-0）」；`test/rtm/guard.md` 故事 12 现册 12-1…12-10 ∥ 12-12…12-15（12-11 已删），12-16 确为空号 |
| 4 | 🟡 | Fixed | 同档 §5 可跑面拆两层：本批条目点本批单测档，历史条目「已随各批收口删除、读数不追改」——与 `docs/batches/2026-11-08-workspace-root-writable.md` §2 的验收口径同一本 |
| 5 | 🟡 | Fixed | 同档 §3 档位表新增 `thincoder-core/agent/write-gate-ledger.mjs` 一行「**软线内、本批不跨档位**」+ 量法与触线判据；旧「搬进新档」措辞改为「该档已在盘」 |
| 6 | 🟡 | Fixed | 同档 §2.3.1「**宿主单源**」段与「**两个谓词的关系**」段在册，探针改引 `thincoder-core/manifest-discovery.mjs`，条件 ① 判据名统一 `resolveProjectRoot` |
| 7 | 🟡 | Fixed | `docs/batches/2026-11-08-workspace-root-writable.md` §2「探针读数」块 P1/P2/P3/P5/P5b 在册，设计档只留命令与关系 |
| 8 | 🟡 | Fixed | 同档 §2.3.1「**三问（新件的既有件答案）**」段现给 `none found:` 与已查面（`workspaceRoot` ∥ 两条新 `<case>`） |
| 9 | 🟡 | Fixed | `docs/batches/2026-11-08-workspace-root-writable.md` §2 边界现逐字「判定按**字面路径**走（`gateKey` 一枚坐标）：经锚内目录链接指到锚外的目标仍算在界内」 |
| 10 | 🟡 | Fixed | 同档 §2.3.1 依据表 ④ 改「既有拒文的换串」+ 实机事件；⑤ 给 `New-Item … bare-git\.git` 复现命令与 P5 读数 |
| 11 | 🔵 | Fixed | 同档 §5 R36 扫描面现「代码面 + 测试面 + 本档」，与 `docs/batches/2026-11-08-workspace-root-writable.md` §2 R36 同口径；该旧串全档实读 0 命中 |
| 12 | 🔵 | Fixed | 同 #11（两处 R36 口径已并成一句，设计档不再自述被排除） |
| 13 | 🔵 | Accepted | 评审环境无标准档 / 无文档地图——非缺陷、无可动作项；记录面分层成立 |
| 新增 1 | 🔵 | New | 同档 §9 编号落点写 `test/rtm/guard.md`，而多处读数句仍写 `test/RTM.md`（两档均在盘）——文档洁癖项，不阻断 |

计数：🔴 0 · 🟡 0 · 🔵 1（新增 Note）；上轮 13 条全部处置完毕 = 12 条 Fixed（#1–#12）+ 1 条 Accepted（#13）

VERDICT: pass

## §4 用户批准（主 agent）

### 用户批准

- **批准形 = 用户实读 + 明确选形**：23:56「**工程模式下写门禁止了写非项目目录的文档，导致多仓项目根的 agents.md 没法修改，这个得解决一下。**」；00:13 选形时只回一个字：「**B**」。00:16「**都自动跑完吧**」= 整批令。
- **父侧裁定（三处）**：① **决策 41 的措辞随之改**——会话锚**仍不作「判哪个项目的账」的来源**，但**作定界来源**（判断目标在不在锚子树内）；② **不加任何「不声明就放过」的默认**（显式声明是口的必要条件）；③ **B 形要落地，写盘七件 schema 必须加 `project`**——设计席自己发现原档「七件目标路径恒在 ⇒ 不加」那条今天不成立，父侧采认并写进 `§1`。
- **否决的两形**：**A**（给工作区挂 manifest，会让「工作区」与「项目」两个概念混掉）· **「只做指路」**（`§1` 第二节已用文件内容证伪：那档是实打实的跨技术栈约定，没有第二个家）。
- **设计评审两轮**：轮 1 `changes-required`（**1 🔴 + 9 🟡 + 3 🔵**）→ 修正 → 轮 2 `pass`（旧 13 条全落地）。
- **轮 1 那条 🔴 是本批最值钱的发现**：`§2.3` 末条与 `§7` 还写着「写盘七件不加 `project`」，与同档「⇒ 七件也各加一格」+ 条件 ④ + `R35` 相反——**实施席照 `§7` 落笔，条件 ④ 永远触发不了，整条放行支不可达。**
- **实施一轮过**：内部对审 `clean`（四类偏差零命中）∥ 代码评审 `pass`；父侧独立复量四项（窄口在代码里 ∥ 七件各有 `project` ∥ 单测 11/11 ∥ 集成 15/15）。
- **收口后的收尾**：`#97` 修 `§3` 的「本批」指代歧义（判据 = 该节读不出第二个「本批」）。

## §5 实施记录（eng-coder）
**状态行**：实施完成



### 实施（2026-11-08 · eng-coder）

**一句话**：写门开了一格窄口（§1 已定决定 B 形）——四条同时成立才放行，判据点只在「目标取不到项目根」时换成声明根，号照原样判。

**四条（判序 = `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` §2.3.1）**

- ① 目标取不到项目根：`resolveProjectRoot` 得 null（既有谓词，零改）。
- ② 目标在会话锚子树内：`underKey(anchor, target)`，比较键 = `gateKey` 一枚坐标。
- ③ 锚下有带 manifest 的直接子目录：`discoverProjects(anchor)` 的 `kind` ∧ `matched` 两值。
- ④ 本笔显式声明 `project`，且声明过 `resolveDeclaredRoot`（既有，零改）。

**一字未动的三处**：号四情形与清单单位 ∥ `bash` ∥ `memory` ∥ `execute` ∥ `manifest` 的声明支 ∥ `init` 的取根豁免（仍在窄口之前短路）

**判据本体改前 / 改后**（`thincoder-core/agent/write-gate-ledger.mjs` 的定位参数分支，逐字）

```text
改前：目标沿祖先链取不到根 ⇒ 一句拒
  if (!root) {
    if (String(args?.action ?? "") === "init") return null
    return { target: p, message: ledgerNoProjectRefusal(caseNotAProject(p), LIST_UNKNOWN_TARGET_NOT_A_PROJECT) }
  }

改后：无声明仍走上面那句；有声明先试窄口，四条全中按声明根判号
  if (!root) {
    if (String(args?.action ?? "") === "init") return null
    if (!claim.fallbackDeclared) {
      return { target: p, message: ledgerNoProjectRefusal(caseNotAProject(p), LIST_UNKNOWN_TARGET_NOT_A_PROJECT) }
    }
    const opening = await workspaceRoot(p, cwd, claim.fallbackDeclared)
    if (opening.refusal) {
      return { target: p, message: ledgerNoProjectRefusal(opening.refusal.caseText, opening.refusal.listText) }
    }
    const opened = await ledgerRowAt(opening.root, parsed.no ?? null, cache)
    const openedMessage = ledgerRowRefusal(parsed, opened)
    if (openedMessage) return { target: p, message: openedMessage }
    continue
  }
```

**新件三处**

- 模块内函数 `workspaceRoot`（不导出）：判序 = 声明解析 → `underKey` → `discoverProjects`；三条全取既有单源，本档不新写目录扫描、不新造路径坐标系。
- 两条新 `<case>` 常量：`caseOutsideAnchor` ∥ `caseNoSubProject`，逐字 = 设计档 §2.3.1 拒文表 ④⑤。
- `ledgerGateTargets` 给写盘七件多带 `fallbackDeclared`：另起键名是因为两支判据不同——`bash` ∥ `memory` 那支是「只有声明」，写盘七件这支是「声明挂在路径后面」，同名会让分支判据分不开。

**落点表逐条（§2 落点 1–6）**

| 落点 | 落了什么 | 读数 |
|---|---|---|
| 1 判据本体 | 定位参数分支接窄口；号四情形拒文一字未改 | 单测 R34 ①–⑧ 全绿 |
| 1b 声明只在无根时被读 | `project` 随路径挂成 `fallbackDeclared`，目标有根时它不参与 | 单测 R35 白盒支（号属 B、目标属 A ⇒ 按 A 判，落 `does not exist`） |
| 1c `workspaceRoot` | 模块内、不导出 | 本档 `^export` 仍只有 `gateKey` ∥ `ledgerBindWriteConflict` |
| 1d 拒文常量 | 两条新串 + `import { discoverProjects }` 一条 | 单测 R34 ④⑤ 逐字断言 |
| 2 原档档头 | `thincoder-core/agent/write-gate.mjs` 补 2026-11-08 那一格；「会话锚不作判据点、只作定界」改齐 | 单测 R36 旧句三面计数 0 |
| 3 描述单源 | `PROJECT_PARAM_DESC` 逐字 = 设计档 §2.3 目标句（补 `manifest` 与写盘七件两条） | 单测 R35 描述支 |
| 4 七件 schema | `file.mjs`（`write` ∥ `edit` ∥ `insert_after` ∥ `hashline_edit`）· `patch.mjs`（`apply_patch` ∥ `delete`）· `ops.mjs`（`file_ops`）各加 `project`，均不进 `required` | 单测 R35 七件逐件断言 |
| 5 七份描述档 | `thincoder-core/tool-docs/` 的 `write.md` ∥ `edit.md` ∥ `insert_after.md` ∥ `apply_patch.md` ∥ `delete.md` ∥ `hashline_edit.md` ∥ `file_ops.md` 各补一行 `project` 用法 + 「定位参数优先」 | 七档同句，285 字符（段判据阈 300 内） |
| 6 设计档 | 本设计轮已落，实施轮零改 | — |

**两条命令与读数**

```text
node --test docs/batches/2026-11-08-workspace-root-writable.test.mjs
  → tests 11 · pass 11 · fail 0（R34 ①–⑧ ∥ R35 ∥ R36 ∥ R37）
node --test test/integration/batch-live-batch-lock.test.mjs
  → tests 15 · pass 15 · fail 0（12-1…12-10 ∥ 12-12…12-16，含改写后的 12-5 与新增 12-16）
```

**集成面（设计档 §9 的 delta 落法）**

- `test/rtm/guard.md` 故事 12 的 12-5 改写成四段：仓外拒 ∥ 工作区根无声明拒 ∥ 带子项目声明 + 在途号放行 ∥ `project` 指容器根同拒。
- 新增 12-16：锚外 ∥ 锚下无子项目两条不成之路，各落自己那句，且两支互不顶替。
- 节注 十四态 → 十五态；用例标题与 RTM 同号，落在 `test/integration/batch-live-batch-lock.test.mjs`。

**行数读数**（量法 = `doc_check` 的 `lines`；改前 = `git show HEAD:<档>` 取回同内容再量，两读同口径）

| 档 | 改前 | 改后 | 档位结论 |
|---|---|---|---|
| `thincoder-core/agent/write-gate-ledger.mjs` | 354 | 427 | 软线内、不跨档位（设计档估 +40，实 +73：注释写全会多；触线判据 = 越 500，未越） |
| `thincoder-core/agent/write-gate.mjs` | 188 | 195 | 软线内 |
| `thincoder-core/tools/shared.mjs` | 493 | 496 | 软线内，余 4 行；「越 500 则迁参数描述常量」本批未触发，下一笔触碰即会越 |
| `file.mjs` ∥ `patch.mjs` ∥ `ops.mjs` | — | 459 ∥ 311 ∥ 350 | 三档均软线内 |

**内审（独立 explore 只读对审）**：末态 = `clean`。四类偏差（未做完 ∥ 静默简化 ∥ 档漂移 ∥ 出列）零命中，8 条验收主张逐条 PASS。

**代码评审（advisor · type=code · 同步一轮）**：末态 = `clean`。无 🔴、无必修 🟡，结论 pass。三处可选项与处置：

- ① 七份描述档与 `PROJECT_PARAM_DESC` 只写了四条件里的条件 ①：会话 cwd 落在子项目里时，文档说 `project` 会被读、实际落「锚外」那句 ⇒ **已改七档那一行**（补「会话锚就是那个工作区根」），`PROJECT_PARAM_DESC` 保持设计档逐字未动。
- ② `discoverProjects` 在锚自身带 `.git` 时短路成 `kind: "self"`，那种形态落「锚下无子项目」而措辞不实；现场 `D:\teamcode` 无 `.git`（探针 P2 读数）⇒ 本批不改，报父侧。
- ③ `workspaceRoot` 按目标重算声明与锚扫描，多目标写会重复 IO ⇒ 本批不改，报父侧。

**出列文件（不在本 spawn 声明清单内，逐条报因）**

- `thincoder-core/tool-docs/` 七份描述档：§2 落点 5 要求。
- `test/integration/batch-live-batch-lock.test.mjs`：设计档 §9 的 delta 落法 + R36 要求测试面旧句计数 0。
- `docs/batches/2026-11-08-workspace-root-writable.test.mjs`：§2「验收」点名本批单测档，随本批收口删除。

**未做 / 不做**：不给工作区挂 manifest ∥ 不放宽到锚外 ∥ 不加「不声明就放过」的默认 ∥ 不动号那半 ∥ 不动四把无定位参数工具的声明支 ∥ 不新写目录扫描或路径坐标系 ∥ 不解析符号链接。以上零实现，单测各有一支取证。

## §6 验证与收口（父代理）

### 验证与收口（父侧独立复量）

| 验收 | 量法 | 父侧读数 |
|---|---|---|
| **窄口在代码里** | 搜 `thincoder-core/agent/write-gate-ledger.mjs` 的 `workspaceRoot` ∥ 两条新拒文常量 | **在**（`workspaceRoot(target, anchor, declared)` ∥ `caseOutsideAnchor` ∥ `caseNoSubProject`） |
| **写盘七件有 `project`** | 三档 `tools/` 搜 `project:` | **7 处** |
| **本批单测** | `node --test docs/batches/2026-11-08-workspace-root-writable.test.mjs` | **tests 11 · pass 11 · fail 0** |
| **集成面** | `node --test test/integration/batch-live-batch-lock.test.mjs` | **tests 15 · pass 15 · fail 0** |

**这批存在的理由**

用户 2026-11-07 23:56 原话：「**工程模式下写门禁止了写非项目目录的文档，导致多仓项目根的 agents.md 没法修改，这个得解决一下。**」

**现场**：`D:\teamcode\AGENTS.md` 往上没有 manifest ⇒ `resolveProjectRoot` 得 `null` ⇒ 拒；**给 `project:` 也没用**（写盘七件只取目标路径，`project` 只有 `bash ∥ memory ∥ execute ∥ manifest` 读）。**⇒ 不是参数没传对，是那条路根本没留口。**

**而那个档不是指路表**：技术栈 ∥ 常用命令 ∥ 编码约定 ∥ 提交格式，**且会变** ⇒ 「只做指路」那形被证伪。

**带债收口（不静默）**

- **`#2160`** `thincoder-core/tools/shared.mjs` 496 行，距软线 500 余 4 行（越线即按设计档切法迁常量）。
- **`#2161`** 锚自身带 `.git` 时 `discoverProjects` 短路成 `self`，条件 ③ 那句拒文会不实——**父侧判「不加」**：为一个还没出现过的输入加分支，是给没人走的路上保险（`#2154` 那批立的规矩）；真遇到再加，届时候选治法已记在该行。
- **`#2162`** `workspaceRoot` 按目标重算声明与扫描，多目标写重复 IO（有 `cache` 先例；无读数支撑「必须现在优化」）。
- **`docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` §3 以外各节的「本批」指代**：`#97` 提的观察，父侧裁 **先不扫**（各批当时的写法，全档扫是另一件事，下次触达再办）。

**收口**

- 台账 `#2158`：**在途 → 待核销 → 已核销**。
