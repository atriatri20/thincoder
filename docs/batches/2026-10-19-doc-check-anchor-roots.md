# 2026-10-19 · doc-check-anchor-roots
> 六段 append-only，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 编制：主 agent · 2026-10-19 · 来源 = 用户 2026-10-19 07:38 逐字「**B**」——R5 删镜像后，37 档 306 行裸提示词档名（`common.md` 等）失去解析目标（此前由 CN 镜像兼任）。裁决 = **改解析器**（不是改 306 行文档）：给归档检查增提示词/工具描述解析根。。
> 台账 = #1685（core · 归批）。前情 = docs/batches/2026-10-19-prompt-cn-mirror-delete.md §6（在途 · 未收口）。
## §1 讨论（主 agent）
**状态行**：已收口 2026-10-19
<§1 模板占位：本批条目 / 关键判据 / 授权口径>

### 讨论收敛（父侧 · 2026-10-19 07:40）

**问题（已实证，不是推测）**

用户裁定「提示词单面制」⇒ 2026-10-19 07:36 删除 `docs/core/design/prompts/` 16 档。**删后文档纪律机检 `doc-check` 报 89 条 `锚·档缺`**——`common.md` / `persona-engineering.md` / `advisor-design.md` 这类**裸提示词档名**不再解析。

| 事实 | 证据 |
|---|---|
| 归档检查解析序 = ① 仓根相对 → ② 域根相对（`scanDirs`，本仓 = `["docs"]`）→ ③ 引用方目录相对 → ④ 域内唯一 basename | `thincoder-core/doc-check/anchors.mjs:9–11` |
| CN 镜像一直兼任「裸提示词档名的解析目标」（它是 `docs/` 内唯一同名档） | 删档前 gate PASS；删档后同批 89 条档缺 |
| 全量实测：**306 行 / 447 处 / 37 档**裸提示词档名悬空 | 父侧逐行扫（含 `TODO-archive.md` 11 行记录面） |

**用户裁决（07:38 逐字「B」）**：**改解析器**，不改 306 行文档。

**为什么 B 而不是 A（父侧判断，供评审核）**

1. 裸档名是 37 档的既有写法；改文档 = 447 处迁就一个解析器的盲区，且今后每次写「在 `common.md` 增一节」都会再次引入。
2. 提示词现为**产品代码**（单面制裁定）；代码面文件本就不是「文档指针」，让文档检查认识其解析根，比给代码文件名套上文档锚更符合分层。
3. 保持检查效力：解析仍然发生——写成 `commn.md` 这类错名**照样报档缺**（若改成「跳过提示词名」则错名漏判）。

**两条已试过并否决的配置路（均还原）**

- `checkConfig.scanDirs` 加 `thincoder-core/prompts` ⇒ 锚 0 ✅ 但**行宽 252 条** ❌（提示词档本就长篇；且与「提示词档不在行宽机检域」的现行陈述相抵）。
- `checkConfig.exemptions` ⇒ 引擎**不读**该键（`index.mjs` / `width.mjs` 零命中）。

**本批要解决的一件事**：让归档检查能解析「住在 `docs/` 之外的产品代码 `.md`」——**提示词档（`thincoder-core/prompts/`）与工具描述（`thincoder-core/tool-docs/`）**，且**不影响行宽射程**。

**不做什么**：不改 `scanDirs`（行宽射程不变）· 不改 306 行文档 · 不放宽「档缺」判定（错名仍报）。

## §2 批次任务与设计（eng-designer）
**状态行**：设计完成（文档面三笔欠账已落（round 4 · 2026-10-19））
<§2 模板占位：本批条目（覆盖） / 设计档落点 / 机制设计 / 受影响文件与测试覆盖 / 验收对照 / 关键决策 / 上抛项>

**状态行**：✅ 设计完成（2026-10-19 · eng-designer）

### 2.1 本批条目（覆盖）

| # | 条目 | 落点 |
|---|---|---|
| 1 | 新增声明键 `checkConfig.anchors.roots: string[]`（缺省 `[]`；缺键 ∥ 非数组 ⇒ 引擎按 `[]`） | `PROJECT-MANIFEST.json` · `manifest-schema.mjs` · `index.mjs` |
| 2 | 解析序新增一步（插在 ③ 引用方目录之后、⑤ 唯一 basename 索引之前），语义 = 逐根「根 + 档 token」解析 | `anchors.mjs` · `DOC-DISCIPLINE.md` §3.20 判据 ① |
| 3 | 本仓取值 = 三条根（见 2.4 KD-3） | `PROJECT-MANIFEST.json` |
| 4 | 判据句更新（单源）：解析序 + 新键语义只写 `DOC-DISCIPLINE.md` §3.20；引擎注释只指认 | `DOC-DISCIPLINE.md` |
| 5 | 行宽射程不变：`scanDirs` 保持 `["docs"]`；解析根不进射程 | `PROJECT-MANIFEST.json`（零改）· `width.mjs`（零改） |
| 6 | 判定不放宽：错名（`commn.md`）仍报 `档缺`；带 `§N` 仍判节 | `anchors.mjs`（④ 命中后照跑节判定） |
| 7 | 配置面：新根走 `checkConfig.anchors`，引擎零硬编码 | `index.mjs` · `manifest-schema.mjs` |
| 8 | 文档零触：306 行裸提示词档名一处不改 | ——（边界） |

**明示不在本批**：`thincoder-vscode/src/prompts/discipline-normal.md` 两条真死路径（见 2.8 上抛 2）· `prompt-refs-check.mjs` 5 条既有命中（台账 `#1684`）· `scanDirs` · `DOC-DISCIPLINE.md` §4.2.6 的 V5 手跑面解析序（另一引擎，非本判据）· 行宽判据本体。

### 2.2 实测读数（本席亲跑 · 判据 = `doc_check` report，target = `d:\teamcode\thincoder`，2026-10-19 07:4x）

- **锚·档缺 = 302 条 / 20 档 / 32 唯一 token**（改前基线；行宽 0 条，域 196 档）。
- 分类：**裸档名 266 处**（15 个唯一名，逐个在 `thincoder-core/prompts/` 在盘）+ **含目录段 36 处**（`prompts/*.md` 34 处 + `thincoder-vscode/src/prompts/discipline-normal.md` 2 处）。
- **同名撞车实测**：`thincoder-core/prompts/` 16 档、`thincoder-core/tool-docs/` 53 档的 basename 与 `docs` 域 basename **交集 = ∅**（两侧各 ∅）⇒ 新步对现状解析结果零影响（这是 2.4 KD-2 插位的实测前提）。
- §1 记的「89 条」与本次 302 的差 = 口径差：89 = 镜像删除批 gate 的被判档集读数，302 = 全域报告态读数；同一现象、不同范围，如实并列（见 2.8 上抛 1）。

### 2.3 机制设计（现状未落 · 目标态）

**契约**：`checkConfig.anchors.roots` = 字符串数组，元素 = **相对项目根**的目录，缺省 `[]`（缺键 ∥ 非数组 ⇒ 引擎按 `[]` 处理，报告态不炸；gate 面由 `configError` fail-closed 拒）。

**解析序（判据 ①）**：① 仓根相对 → ② 域根相对（`scanDirs` 逐根）→ ③ 引用方档所在目录相对 → **④ 声明解析根相对（`anchors.roots` 逐根，按声明序）** → ⑤ 域内唯一 basename 索引（同名 ≥2 ⇒ 不判）。

**引擎接线**：`index.mjs` 读 `cfg.anchors?.roots`（`Array.isArray` 过滤，与 `scanDirs` 同款）→ 传入 `checkAnchors` → `resolveDoc` 在 ③ 之后插一步循环。命中后照旧走 `sectionOnDisk`（`节缺` 不被绕过）。**`width.mjs` 零改**——`scanDomain` / `checkDocWidths` 只认 `scanDirs` + `exclude`。

**声明面**：`PROJECT-MANIFEST.json` `checkConfig.anchors.roots = ["thincoder-core", "thincoder-core/prompts", "thincoder-core/tool-docs"]`；缺省值形状单源 = `manifest-schema.mjs` 的 `DEFAULT_MANIFEST.checkConfig.anchors`（加 `roots: []`，`checkConfig` 五顶层键计数不变）。

### 2.4 关键决策

| # | 决策 | 理由 / 被拒项 |
|---|---|---|
| KD-1 | 新键，不复用既有键 | 复用 `promptsLanding` ⇒ 把检查参数耦合到提示词注入面（两者不同义），且不覆盖工具描述；加 `scanDirs` ⇒ 实测行宽 252 条（§1 已试并还原）；`exemptions` ⇒ 引擎零消费点；引擎硬编码 ⇒ 违 N3 可迁移（§7 F2 / §3.20 裁定句） |
| KD-2 | 插位 = ③ 之后、⑤ 之前 | ①②③ 全部在先 ⇒ **任何现行可解析 token 的目标零变**（302 条全是前三步落空者）；④ 先于 ⑤ = **显式声明优先于启发式推断**（⑤ 多义 ⇒ 不判，属 fail-open，让声明根先判可保持严格）；同名二在时域内档仍可经 ①/②/③ 的路径形态引用，不会不可达。实测同名交集 = ∅ ⇒ 今日零行为变化 |
| KD-3 | 本仓取值三条根 | `thincoder-core` = 接住 34 处 `prompts/*.md` 前缀名，并为 `tool-docs/*.md` 前缀形留位（今日 0 处）；`thincoder-core/prompts` = 接住 266 处裸名；`thincoder-core/tool-docs` = 裸工具描述名（今日 0 处；收入因 §1 把工具描述列为同一目标面，裸名是其自然短形）。**最小化备选**：删第三条不影响本批任何读数——评审若主张最小化可直接删 |
| KD-4 | 域内档优先于解析根 | ②/③ 在 ④ 之前：文档树是文档指针的规范落点，产品代码面是后备面 |
| KD-5 | 节判定不变 | ④ 只换「档在哪」，不换「节在不在」：解析命中后照跑 `sectionOnDisk` |
| KD-6 | 报告态宽容 / gate 面 fail-closed | 与 `scanDirs` 同款分工：report 非数组 ⇒ `[]`（不炸）；gate ⇒ `configError` 拒（无 PASS） |

**最接近先例（对齐 ∥ 偏离）**：对齐 = `scanDirs` / `anchors.exclude` 的声明面接法（`index.mjs:153`–`:154` 读取 + `configError:49`–`:57` 校验，同键族同分工）；偏离 = 新键**只进解析面、不进射程**（行宽域不变），既有键则两处共用或只作域面。

**公共源勘察**：`PROJECT-MANIFEST.json` `index.publicRepos = []`（实读）⇒ 工作目录内无独立公共文档仓，**已查无相关公共源**。

### 2.5 受影响文件（现行行数 → 预计）

| 文件 | 现行 | 预计 | 改动 |
|---|---|---|---|
| `thincoder-core/doc-check/anchors.mjs` | 118 | ≈124 | `resolveDoc` 增收 `roots` + 一步循环；头注解析序行随动（只指认 §3.20） |
| `thincoder-core/doc-check/index.mjs` | 196 | ≈201 | 读 `cfg.anchors.roots` · 传参 · `configError` 增一条 · JSDoc |
| `thincoder-core/manifest-schema.mjs` | 167 | 168 | `DEFAULT_MANIFEST.checkConfig.anchors` 增 `roots: []` |
| `PROJECT-MANIFEST.json` | 62 | 65 | `checkConfig.anchors.roots` 三元素 |
| `docs/core/design/DOC-DISCIPLINE.md` | 1962 | ≈1965 | §3.20 判据 ① 解析序 + 两条新键语义；§3.19 键计数 6 → 7（**已落**） |
| `docs/core/design/DOC-SYSTEM.md` | 385 | 385 | §8.2 判据项 6 → 7（**已落**） |
| `thincoder-core/tool-docs/doc_check.md` | 53 | 53 | `:47`–`:48` 参数枚举补 `anchors.roots`（英文运行面 = eng-coder 落，内容点见本条） |
| `thincoder-core/test/doc-check-roots.test.mjs` | 新建 | ≈90 | 用例 DD-R1–DD-R8（收口删） |

全部远低于 500 行软线；无拆分义务。

### 2.6 用例表

| # | 类 | 输入 | 期望 |
|---|---|---|---|
| DD-R1 | 正常 | 域内档引用裸名 `common.md` | 解析到 `thincoder-core/prompts/common.md` ⇒ 0 命中 |
| DD-R2 | 正常 | `prompts/persona-engineering.md` | 经根 `thincoder-core` 解析 ⇒ 0 命中 |
| DD-R3 | 正常 | `common.md §4` ∥ `common.md §99` | 前者节在盘 ⇒ 0；后者 ⇒ `节缺`（目标 = prompts 档，证明 ④ 不绕过节判定） |
| DD-R4 | 边界 | 夹具 manifest 无 `anchors.roots` ∥ `roots: []` | 读数与本批改前逐字同（302）——零回归对照 |
| DD-R5 | 边界 | 夹具：`docs/x.md` 唯一 ∧ `root/x.md` 在盘 | 解析到 root（④ 先于 ⑤） |
| DD-R6 | 边界 | 夹具：docs 内 `x.md` 同名 ≥2 ∧ root 有 | 解析到 root（不再走「多义不判」） |
| DD-R7 | 错误 | 错名 `commn.md` | `档缺` 命中 1（判定不放宽） |
| DD-R8 | 错误 | `anchors.roots: "thincoder-core"`（非数组） | gate ⇒ `ERROR`（configError）；report ⇒ 按 `[]` 跑、不炸 |

### 2.7 验收对照（回指 2.1 条目）

| AC | 判据（机核） | 回指 |
|---|---|---|
| AC-1 | 新进程 `doc_check(report)` on `thincoder` ⇒ 锚命中 **302 → 2**（残留两条均为 `thincoder-vscode/src/prompts/discipline-normal.md`，见上抛 2） | 条目 1/2/3 |
| AC-2 | DD-R7 夹具 ⇒ `档缺` = 1；`git diff` 不含 `thincoder-core/prompts/**` 与 `tool-docs/**` 文本改动 | 条目 6/8 |
| AC-3 | report 射程行仍 `docs（196 档）`、行宽 = 0；`scanDirs` 直读 = `["docs"]`；夹具 root 内一档含 400 字符行 ⇒ 行宽命中 0 | 条目 5 |
| AC-4 | `DOC-DISCIPLINE.md` §3.20 判据 ① 解析序五步且点名 `anchors.roots`；全仓 `grep anchors.roots` 的**语义定义**只此一处（引擎注释只指认） | 条目 4 |
| AC-5 | `PROJECT-MANIFEST.json` 含三元素；引擎内 `grep -n "thincoder-core/prompts" thincoder-core/doc-check/` = 0（无硬编码）；删一条根 ⇒ 命中随变（DD-R4 对照） | 条目 7 |
| AC-6 | `git diff --stat` 改动集 ⊆ 2.5 表 | 条目 8 |
| AC-7 | 实施轮与父侧收口各跑一次 `doc_check(mode:"gate")`，首行 `PASS` | 全批 |

**设计轮自检**：`doc_check(mode:"gate", docs=[DOC-DISCIPLINE.md, DOC-SYSTEM.md])` ⇒ `DOC-CHECK GATE: PASS`（2 档全清）。

### 2.8 上抛项

1. `[上抛·知会]` 口径差：§1 的 89（gate 被判档集）与实测 302（全域报告态）并列记录，无需动作。
2. `[上抛·待裁]` **2 条真死路径**：`docs/core/design/CORE-UNIFICATION.md:821` 与 `:823` 引 `thincoder-vscode/src/prompts/discipline-normal.md`——该路径已不存在（疑应改指 `thincoder-core/prompts/discipline-normal.md`）。修法 = 改文档，本批禁改 ⇒ 需另批或扩权；不处置则 AC-1 终值 = 2。
3. `[上抛·知会]` `anchors.domain` 与 `exemptions` 两键**产品引擎零消费点**（判据 ① 实读只用 `scanDirs` / `anchors.exclude` / 新增 `anchors.roots`）；本批按「声明面并集」口径把键计数 6 → 7，两键本体零触。

### 2.9 边界（不做）

不改 306 行裸提示词档名 · 不改 `scanDirs`（行宽射程不变）· 不动 `prompt-refs-check.mjs`（`#1684`）· 不把解析根并进行宽域 · 不为解析根设行级豁免名单 · 不改 `DOC-DISCIPLINE.md` §4.2.6 的 V5 手跑面解析序 · 不处理 2 条真死路径。

### 2.10 修正轮（round 2 · 评审 11 条逐条落 · 2026-10-19）

**评审 11 条父侧全接受，本轮逐条落地**；设计档 = `docs/core/design/DOC-DISCIPLINE.md` + `docs/core/design/DOC-SYSTEM.md:241`。下列行号 = 落笔后实测（as-of 本轮）。

| # | 改动落点 | 改后要点 |
|---|---|---|
| 1 | `DOC-DISCIPLINE.md:1924`（A-DD32 六条）· `:1253`（用例 DD-100–DD-104）· `:1023`–`:1026`（触发面与复跑判据） | 新步有验收物：正常 / 边界三式 / 错误两式，且读数写成本档复跑判据 |
| 2 | `DOC-DISCIPLINE.md:1028`（声明面三件）· `:1023`（306 行触发面） | 所需声明值逐条 + 依据；声明笔 = 主 agent（manifest 专权）；schema 缺省 `roots: []` + 值形校验 + `MANIFEST.md` 键条目（实施轮落） |
| 3 | `DOC-DISCIPLINE.md:1983`（F2 键集表 = 单源）· `:905`（§3.19 键数改引用）· `DOC-SYSTEM.md:241`（只引用不复制） | 键集一处定死 = 7 键；另两处只引用 |
| 4 | `DOC-DISCIPLINE.md:1014`（消费面）· `:1988`（F2 表 `anchors.roots` 行标「产品引擎专用」） | `anchors.roots` 只由产品引擎消费；V5 手跑面自有解析序、不读该键 |
| 5 | `DOC-DISCIPLINE.md:1005`（拼接规则）· `:1012`（根缺位三态）· `:1013`（值形非法）· `:1004`（相对基准） | 前缀名拼接写死「根内整体命中」；基准 = 项目根（`target`）；根缺位对齐 §4.2.2 ⑥ 三态；值形非法两态处置 |
| 6 | `DOC-DISCIPLINE.md:1037`–`:1039` | 先例行（`anchors.mjs:57` `resolveDoc` ∥ 本档 §4.2.2 ⑥）+ 对齐 / 偏离各一句 + 「为何不扩仓根索引」 |
| 7 | `DOC-DISCIPLINE.md:1040` | 公共源勘察证据行（与 `:1167` 同形） |
| 8 | `DOC-DISCIPLINE.md:1042`（表） | 逐档现行行数（实读）+ 预计增量 + 档位；`anchors.mjs` = 118 行，远低于 500 软线 ⇒ 无拆分义务 |
| 9 | `DOC-DISCIPLINE.md:1003`（解析序改版）· `:1015`（插位 = 覆盖偏移 0）· `:1026`（复跑读数） | 新步移到 basename 之后（⑤）；覆盖偏移 = 0，有双序比对读数 |
| 10 | `DOC-DISCIPLINE.md:925`（R-3）· `:931`（R-9）· `:932`（R-10） | R-3 ⇒ 7（`CRITERIA_KEYS` 增 `anchors.roots`）；R-9 ⇒ 需求档 AC-M8-6「7 = 6 + 1」（笔 = 主 agent，见上抛 1）；R-10 改现盘 `DOC-SYSTEM.md:241` / `:242` |
| 11 | `DOC-DISCIPLINE.md:1017`（由来行） | 用户裁定「B」（2026-10-19 07:38）+ 306 行实证 + 镜像删除前置；从简平铺 |

**解析序（改后完整一行）**：① 仓根相对 → ② 域根相对（`scanDirs` 逐根）→ ③ 引用方档所在目录相对 → ④ 域内唯一 basename 索引（同名 ≥2 ⇒ 不判，列报告面）→ ⑤ 声明解析根相对（`anchors.roots` 逐根，按声明序；缺省 `[]` ⇒ 本步零效）。

**复跑读数（本席亲跑 · 2026-10-19）**

- **基线（改前）**：锚·档缺 **300 条 / 20 档 / 31 唯一 token**——裸档名 15 名 / 266 处、含目录段 16 名 / 34 处；行宽 0 条；域 196 档。
  与 §1 的 306 行 / 447 处 / 37 档并存：口径差（引擎只判声明域内可抽取的 token）。与 §2.2 的 302 差 2 = 两条真死路径已由 `#63` 收掉。
- **双序比对**（同一 token 集 7173 处实例；旧四步 ∥ 新五步各解析一遍）：旧序已解析 **6061** 处，逐处目标相同、**差异 0**；旧序 300 条档缺**全部转可解析**（残留 0）；多义 812 处两序同判。
  方法 = 临时域比对脚本，抽取面逐字复制产品引擎（`scanDomain` + `ANCHOR_RE` + 类名 / 占位过滤）；零落仓。
- **结论**：覆盖偏移 = **0**；AC-1 的终值路径改为「300 → 0」。

**键集三处读数**：`DOC-DISCIPLINE.md:905`（7 项，引用）· `DOC-DISCIPLINE.md:1983` 表（7 行）· `DOC-SYSTEM.md:241`（7，引用）——三处一致；语义定义单源 = F2 表。

**上抛项**

1. `[上抛·待裁]` 需求档 AC-M8-6（`docs/core/requirements/ENGINEERING-MODE-V2-SPEC-MACHINE-CHECK.md:38`）现文「6 = 5 + 1」，须改为「7 = 6 + 1」——需求档不属本席笔域，只落派单行（R-9），请主 agent 落。
2. `[上抛·知会]` `PROJECT-MANIFEST.json` 的 `checkConfig.anchors.roots` 三元素（`["thincoder-core/prompts", "thincoder-core/tool-docs", "thincoder-core"]`）属主 agent 笔（`manifest` 工具专权）；本轮未改，实施轮前需落。

**边界（本轮不做）**：不动解析器代码（`anchors.mjs` / `index.mjs` / schema）· 不改 306 行文档 · 不动 `prompt-refs-check.mjs`（台账 `#1684`）· 不动 `CORE-UNIFICATION.md`（`#63` 已收）· 不动 §3 / §6 其他条目。

**交付门自检**：`doc_check(mode:"gate", docs=[DOC-DISCIPLINE.md, DOC-SYSTEM.md])` ⇒ 首行 `DOC-CHECK GATE: PASS`，0 条命中（2 档全清）。

**行号更正（同上表第 4 行）**：F2 键集中 `anchors.roots` 行的现盘坐标 = `DOC-DISCIPLINE.md:1992`（`:1988` 是表内第 2 行 `lineWidth`）；表头 `:1983`、7 行 = `:1987`–`:1993`。

### 2.11 形式 / 数值欠账收敛（round 3 · 评审轮 2 的 6 条 · 2026-10-19）

**范围**：只收轮 2 留下的 🟡3 / 🔵3（评审段 §3「轮次 2」第 12–17 条），父侧全部裁定接受。**已通过评审的实质设计零触**：解析序五步 / 键集 7 键 / 声明值 / 消费面一律不动；代码（`anchors.mjs` / `index.mjs` / schema）零触；306 行文档零改；§3 评审段不动。行号 = 落笔后实测（as-of 本轮）。

| # | 改动落点 | 改后要点 |
|---|---|---|
| 12 | `DOC-DISCIPLINE.md:1697` | §5 索引表补 A-DD32 行（判据六条齐 · 回指 `§3.20 条目 S · 判据 ①「解析序 ⑤」`）——实施者读索引可见该验收物 |
| 13 | `DOC-DISCIPLINE.md:951`（§3.19 表）· `:1051`（§3.20 表） | 两处同档行数各写口径、不再裸并两数：`195` = 退役前读数（含 `lineCounts` 138 行）；`62` = 现盘实读（退役后态）。两行互相指名，读者判得出哪个是现态 |
| 14 | `DOC-DISCIPLINE.md:1003`（判据句）· `:1016`（折叠句）· `:1260`（用例）· `:1931`–`:1935`（A-DD32 边界式） | ④「多义 ⇒ 不判」写死为**终结**、不进 ⑤；补交叉用例 **DD-105**（域内 `x.md` ∧ `y/x.md` + `roots=["a"]` ∧ `a/x.md` 在盘 ⇒ 不判，不得落到 ⑤）；编号顺延，无断号；A-DD32 边界「三式」改「四式」并入本式 |
| 15 | `DOC-DISCIPLINE.md:1053` / `:1054` | 受影响表两行改落笔后实测值（`2046` / `384`，`wc -l` 口径与表内他行同），行内注明「= 本笔落笔后实测」；`DD-100–DD-104` 计数随 14 改 `DD-100–DD-105`（同表 `:1056` 测试档行同改） |
| 16 | `DOC-DISCIPLINE.md:932`（R-10 行） | 「现文」列换成盘上逐字（`DOC-SYSTEM.md:241` 已无枚举、`:242` 段名句），该行标「已由前轮落笔达成 ⇒ 本行 = 复核确认」；**行不删**（它记的是那次改动的依据） |
| 17 | `DOC-DISCIPLINE.md:1026` | 补结论行：差 **147 处 / 17 档** 落在记录面与域外档，**永久不判**（引擎射程之外，非本设计遗留缺陷）；**将来要判须另立射程变更** |

**实读读数（本席亲跑 · 2026-10-19）**：`PROJECT-MANIFEST.json` = **62** 行（`lineCounts` 已在盘上删除——R-1 已落，实读无该键）· `DOC-DISCIPLINE.md` = **2046** 行 · `DOC-SYSTEM.md` = **384** 行；三档均按 `wc -l` 口径（与表内 `anchors.mjs` 118 / `manifest-schema.mjs` 167 同口径）。轮 2 记的 `DOC-SYSTEM.md`「385」= 末尾换行算一行的分片口径，与表内口径不同 —— 表值 384 经复核无误。

**判据句原文（14 条 · 写死解析序 ④ 的终结语义）**：`DOC-DISCIPLINE.md:1003`——「④ 域内**唯一 basename** 索引（同名 ≥2 ⇒ **不判**，列报告面；**「不判」= 终结，不再进 ⑤**）」。
**夹具原文（14 条 · DD-105，`DOC-DISCIPLINE.md:1260`）**：输入「域内 `x.md` ∧ `y/x.md`（同名 ≥2）+ `roots=["a"]` 且 `a/x.md` 在盘；域内档引 `x.md`」⇒ 期望「**不判**（列报告面）——④ 多义**终结**解析，**不得**落到 ⑤ 解出 `a/x.md`」。实现成「继续落 ⑤」即判违规（A-DD32 边界 4 式，`:1935`）。

**交付门自检**：`doc_check(mode:"gate", target=d:\teamcode\thincoder, docs=[docs/core/design/DOC-DISCIPLINE.md])` ⇒ 首行 `DOC-CHECK GATE: PASS`，0 条命中（1 档全清）。

**边界（本轮不做）**：不改实现码 · 不改 306 行文档 · 不改 §3 评审段 · 不动已通过的实质设计（解析序 / 键集 / 声明值 / 消费面）· A-DD25 索引缺行属既有欠账，不并入本笔。

### 2.12 文档面三笔欠账收敛（round 4 · 父侧裁定「按实装改文档」· 2026-10-19）

**范围**：只收 `#68` 上抛的三笔文档面欠账（§5.5 第 2 / 3 / 4 条）。引擎代码 / 解析序 / 键集 / 声明值 / 消费面 / 306 行裸档名文档 / §3 评审段一律不动。行号 = 落笔后实测。

| # | 改动落点 | 改后要点 |
|---|---|---|
| 1 | `DOC-DISCIPLINE.md:1012`（判据句 · 根缺位态 ②）· `:1259`（DD-104）· `:1938`（A-DD32 ③） | 三处同口径 = **fail-closed**：根缺位只加一条报告行「声明解析根缺位 · 未核、不入判」，指针照走解析序、末步仍未命中 ⇒ `档缺`（判定不放宽）。与实装相抵的旧文（`:1259` 的「零 `档缺`」、原 `:1936` 的「不判悬空」）已删除 |
| 2 | `MANIFEST.md:672`（键目录表下说明行） | `checkConfig.anchors.roots` 条目 + 值形句（项目根相对的目录数组 · 缺省 `[]`）+ 写错后果（该根不参与解析、报告面列缺位、其下死指针照报 `档缺`）；`anchors` 仍为单一可写节点 ⇒ 节点计数 **20 不变**（与 `MANIFEST_SCHEMA.nestedKeys.checkConfig` 五键一致） |
| 3 | `DOC-DISCIPLINE.md:1255`–`:1260`（DD-100–DD-105）· `:1932`（A-DD32 ①）· 新增 `:1262`（夹具命名说明） | 夹具名由 `x.md` / `a/x.md` / `y/x.md` 换为仓内实有档名 `common.md`；根目录名换 `ext/prompts` / `ext/alpha` / `ext/beta`（不与 `.md` 相拼，故不成 token）；补一句「夹具名须避开占位词干与类名过滤，否则该 token 不进抽取集、用例空转（假绿）」 |

**实测证据（新进程 · 2026-10-19）**

- **抽取面**（temp 夹具 · 三 token 同档）：`x.md` **不入**抽取集；`common.md` / `alpha-note.md` **入集**（`hits` 各 1）⇒ 占位词干说成立（`thincoder-core/doc-check/anchors.mjs:32` `PLACEHOLDER_STEMS`）。
- **根缺位**（temp 夹具 · `roots=["ext/prompts"]` 目录不在盘、域档引 `common.md`）：`rootGaps=[{kind:"missing",root:"ext/prompts"}]` + `hits=[{token:"common.md",clazz:"档缺"}]` ⇒ 只加报告行、判决不减——第 1 笔的判据句即按此读数写。
- **全库复跑**（新进程 `runDocCheck("d:/teamcode/thincoder",{mode:"report"})`）：`hits={total:0,anchors:0,width:0}` · 射程 `docs（196 档）` · `anchorRootGaps=[]` ⇒ 本笔两档全清、全库零命中。

**偏离披露（第 3 笔）**：建议名 `alpha-note.md` 未采用——实测它**会**被抽取（非占位词干），写进本档即成悬空指针（`档缺` +1、gate 红）。改用仓内实有档名 `common.md`：既不被过滤、也不在本档留悬空；该约束已写进 `:1262` 供后续夹具沿用。

**实读更正（第 2 笔）**：`MANIFEST.md` 原档 `anchors.roots` 命中 = **0**（`anchors` 仅作 `checkConfig` 五键之一出现于键目录行）⇒ 属「缺，已补」，非「已在位」；补法取「`checkConfig.*` 行下说明行」而非新增第 21 节点（新增节点会与 `MANIFEST_SCHEMA` 五键及描述面 20 节点契约相抵）。

**边界（本笔不做）**：不改引擎（`anchors.mjs` / `index.mjs` / `manifest-schema.mjs`）· 不改 `PROJECT-MANIFEST.json` · 不动 §3 评审段 · 不动 `tool-docs/doc_check.md` 与 `tool-docs/manifest.md`（英文运行面 = eng-coder 面）· 不新增可写节点。

## §3 设计评审（评审子代理）

### 轮次 1（评审子代理）

### 评审对象
doc-check 归档检查新增解析根 `checkConfig.anchors.roots`（解析序 4→5 步）· `thincoder/docs/core/design/DOC-DISCIPLINE.md` §3.20 判据 ①（另读 `thincoder/docs/core/design/DOC-SYSTEM.md` 全档）。评审方式 = 只读静态面，未跑任何机检。

### 发现表

| # | 类 | 严重度 | 问题 | 改法 |
|---|---|---|---|---|
| 1 | 验收标准 | 🔴 | 新增解析序第 ④ 步无任何验收物：§3.20 验收标准只回指 A-DD29 / A-DD30 / A-DD31（`DOC-DISCIPLINE.md:1207`），用例表 DD-79–DD-99 无 ④ 面（多根序 / 根缺位 / 空前缀名 / 多义），§5 无 A-DD32 ⇒ 新机制零可验判据 | 补 A-DD32 + DD-100 起用例：正常（声明根内裸档名零 `档缺`）· 边界（`anchors.roots` = `[]` 本步零效 · 多根按声明序 · 根内同名与域内同名并存）· 错误（根目录不在盘 / 值形非法）；并把触发面读数写成复跑判据 |
| 2 | 需求覆盖 | 🔴 | 触发面未登记：本档全文无 `306` 读数（grep 命中 0）、无「裸提示词档名」处置句；④ 也未给本仓所需声明值（根 = `thincoder-core/prompts` ∥ `thincoder-core`）、未写声明笔（manifest 专权）、未写 schema 缺省 / 校验登记与 `MANIFEST.md` 记载（对照同档 `:940` R-12 对 `lineCounts` 的同形处置）⇒ 实施者无从落地、也验不了「306 行转可解析」 | 补三件：所需声明值逐条（根目录字面 + 依据）· 声明笔归属（manifest）· schema 缺省 `[]` + 值形态校验 + `MANIFEST.md` 键条目；触发面读数（306 行 / 档集）写入本档作复跑判据 |
| 3 | 文档归属（机制级矛盾） | 🔴 | `checkConfig` 判据键集合三处不同形：`DOC-DISCIPLINE.md:1918`（6 键，无 `anchors.roots`）∥ 同档 `:905`（7 键，含 `anchors.roots`）∥ `DOC-SYSTEM.md:241`（7 键，含 `anchors.roots`）；且 §3.20 自述声明面单源 = §7 F2（`:990`），而 F2 行不含新键 ⇒ 同一机制两处现役描述并存，读者判不了该键是否在册 | F2 行同轮补 `anchors.roots`（键集单源 = §7 F2，其余处引用不复制）；§3.19 R-7 行补「F2 改后键集」；全档键集与计数一处定死 |
| 4 | 可行性 / 消费面 | 🔴 | 未声明 ④ 由哪个引擎消费：产品引擎（§3.20 ①）之外，V5 `scripts` 引擎的实装解析序（`:1266`）仍是六步无 ④，而 `:905` 把 roots 记入声明面 7 键、`:1025` 记 V5 = 「仓内 V5 专用面（六键声明面 + V5 三锚」⇒ 键被声明而无解析步消费（或 V5 面漏改），实施面二选一不定 | 明写消费面（产品引擎 ∥ 两引擎同改）；按所定面同轮对齐 §4.2.2 解析序与 §3.19 键数；两引擎解析序各自标注归属、禁互借 |
| 5 | 清晰度 | 🟡 | ④ 语义未定死（`DOC-DISCIPLINE.md:1004`）：`prompts/x.md` 这类前缀名「取约定前缀根」——「约定前缀根」未定义，且与前缀拼接规则冲突（根 + `prompts/x.md` 得重复段）；「项目根」与 ② 的「域根」未分（`target` 是否影响）；根目录不在盘时的态未定（先例 ⑥ 有三态「未核列报」，④ 无） | 逐条补：前缀名拼接规则（根内整体命中 ∥ 去前缀再解析，二选一）· 根的相对基准（项目根 / `target`）· 根缺位态（未核列报 ∥ 零效，与 ⑥ 三态对齐）· 值形非法（非字符串数组 / 绝对路径 / `..` 越界）的处置 |
| 6 | 最近先例 | 🟡 | ④ 块无先例行：最近的 = 同档 `:1266` 的 ⑥ 声明源候选（置后追加 · 三态 · 同名多仓取声明序首者）与 ⑤「域内 / 仓根两读」——后者多读一次即可解开裸提示词档名，本设计未比这条更简路径为何不取 | 补先例行（实现坐标 `doc-check/anchors.mjs` 解析序 ∥ 本档 §4.2.2 ⑥ ∥ 先例批不记名）+ 对齐 / 偏离各一句；偏离须写「不扩 ⑤ 为仓根索引而另立声明根」的理由 |
| 7 | 勘察证据 | 🟡 | ④ 块无公共源勘察证据行（§3.20 内 `:1108` / `:1167` 属此前的 batch 门 / 工具面，非本条）⇒ 本条读作未勘察 | 补一行（`index.publicRepos` 实读 + `D:\ref` 索引外 ⇒ 无相关公共源可引），与 `:1167` 同形 |
| 8 | 受影响文件行数标注 | 🟡 | 本条会动源档（`thincoder-core/doc-check/anchors.mjs` 解析序 · 读取面 `index.mjs` · manifest schema 缺省 / 校验 · 测试），档面无任何受影响文件表（当前行数 / 预计增量 / 拆分计划）——§3.19 那张表属 lineCounts 退役，不含本改 ⇒ 500 / 800 档位不可判（本档 `:225` 口径要求源 / 单元测试档三件齐） | 补受影响文件表：逐档当前行数 + 预计增量 + 是否越档位；`anchors.mjs` 现状行数须给实读并附拆分计划（若近档位） |
| 9 | 覆盖偏移 | 🟡 | `:1005` 自承「④ 先于 ⑤」⇒ 现由 ⑤ 解析的裸档名可被声明根内同名档抢先，判据目标改变（可能由零报变 `节缺`，或反向假绿）；同档 §3.5 `:168` 的同族先例要求「判据句变更 = 标准变更 ⇒ 登记新旧覆盖差 + 复跑清账」，本条无登记 | 登记覆盖偏移：④ 抢 ⑤ 的 token 清单（复跑读数）+ 声明根遮罩风险 + 根序确定性说明；未清账前不得声称「现行可解析 token 目标零变」 |
| 10 | 文档状态漂移 | 🟡 | §3.19 R-10（`:932`）记 DOC-SYSTEM `:232` / `:233` 现文为「判据项 7 … 含 `lineCounts`」「五档接口」，盘上 `DOC-SYSTEM.md:241` 已是 7 键含 `anchors.roots`、`:242` 已是「四档接口」——照该行字面执行会把 `anchors.roots` 从枚举删掉并改 6；同族算术残留 = R-3（`:925`「长度 6」）与 R-9（`:931`「6 = 5 + 1」） | 三处按现盘重算（去 `lineCounts` 后 6 + 新增 `anchors.roots` = 7；AC-M8-6 改 `7 = 6 + 1`），as-of 坐标改现盘行号；执行前逐处回读 |
| 11 | D9 依据 | 🔵 | ④ 块无「由来 / 依据」句——用户裁 B、306 行实证、镜像删除前置均未记；D9 要求新规范携 why 且来源可指认，`:1005` 只给插位理由 | 补由来一行（来源 = 用户裁定 + 实测读数），从简平铺，贴在 ④ 块下 |

### 计数
🔴 4 · 🟡 6 · 🔵 1（共 11）

### VERDICT
VERDICT: changes-required

### 未决面（供父侧派单参考）
- 消费引擎归属（发现 4）决定实施面大小：仅产品引擎 = 单档解析序改；两引擎 = 产品档 + `scripts/doc-check-anchors.mjs` 同改，且 §4.2.2 须同步。
- 键集单源（发现 3）与算术（发现 10）同轮改，否则 gate 的 AC-M8-6 计数与 `CRITERIA_KEYS` 长度会再次对不上。

### 轮次 2（评审子代理）

**核验面**：`thincoder/docs/core/design/DOC-DISCIPLINE.md`（全档，现盘 2039 行）∥ `thincoder/docs/core/design/DOC-SYSTEM.md`（全档 385 行）。只核轮 1 的 11 条是否落地 + 修正引入的新问题；未跑任何机检。

| # | 原# | 文件 | 严重度 | 状态 | 摘 |
|---|---|---|---|---|---|
| 1 | 1 | DOC-DISCIPLINE.md | 🟢 | Fixed | 验收物齐：`:1259`「解析序 ⑤（声明解析根）见 §5 的 **A-DD32**」· `:1924` A-DD32 六条 · `:1253`–`:1257` DD-100–DD-104 |
| 2 | 2 | DOC-DISCIPLINE.md | 🟢 | Fixed | 触发面 + 声明值 + schema 三件齐：`:1023`/`:1024` 读数 · `:1030` 三根值 · `:1034` 声明笔 · `:1035` schema/MANIFEST 登记 |
| 3 | 3 | DOC-DISCIPLINE.md · DOC-SYSTEM.md | 🟢 | Fixed | 键集单源成立：`:1979`「键集单源 = 本节「F2 声明面键集」表（7 行 = 7 键，D3）」· `:1992` roots 行 · DOC-SYSTEM `:241` 已去枚举只引用 |
| 4 | 4 | DOC-DISCIPLINE.md | 🟢 | Fixed | 消费面定死：`:1014`「只由产品引擎 … V5 手跑面自有解析序、不读该键」· `:1931` A-DD32 ⑥ · `:925` R-3 注 |
| 5 | 5 | DOC-DISCIPLINE.md | 🟢 | Fixed | 语义定死：`:1005` 拼接规则 · `:1011` 根序 · `:1012` 根缺位三态 · `:1013` 值形非法两态 |
| 6 | 6 | DOC-DISCIPLINE.md | 🟢 | Fixed | `:1037` 同类先例（对齐/偏离）· `:1038` 为何不扩仓根索引 |
| 7 | 7 | DOC-DISCIPLINE.md | 🟢 | Fixed | `:1040` 公共源勘察证据行（同 `:1167` 形） |
| 8 | 8 | DOC-DISCIPLINE.md | 🟢 | Fixed | `:1042`–`:1054` 受影响表（9 行，含档位判定「软线 500 / 硬线 800 均远未触及」；`anchors.mjs` 118 行数值未核——源档不在射程） |
| 9 | 9 | DOC-DISCIPLINE.md | 🟢 | Accepted | 以改设计代替登记：新步移后（④ basename → ⑤ 声明根），`:1015`「⑤ 置于 ④ **之后** … 目标集合与改前逐一相同（含 basename 面）」，理由成立（①②③④ 任一步即返回，⑤ 纯追加）⇒ 覆盖偏移结构性为 0，无须登记遮罩 |
| 10 | 10 | DOC-DISCIPLINE.md | 🟢 | Fixed | `:925` 增 roots ⇒ **7** · `:931`「**7 = 6 + 1**」· `:932`「判据项 **7** 保留、**枚举删**」；需求档 AC-M8-6 现读「7 = 6 + 1」（grep 复核） |
| 11 | 11 | DOC-DISCIPLINE.md | 🟢 | Fixed | `:1017`「**由来**：提示词单面制删除 … 用户 2026-10-19 07:38 裁定「B」」 |
| 12 | (新) | DOC-DISCIPLINE.md | 🟡 | New | §5 索引表止于 A-DD31（`:1693`），**无 A-DD32 行**——A-DD32 块在 `:1924` 有实体、被 `:1259` 回指，但索引面缺行（A-DD25 缺行属既有，不并案） |
| 13 | (新) | DOC-DISCIPLINE.md | 🟡 | New | 同档两张受影响表的同一文件行数自相矛盾：新表 `:1049` 记「`PROJECT-MANIFEST.json` 现行 **62**」，而 `:951` 记「`PROJECT-MANIFEST.json` | **195** | −138」，且 `:923` 明示 lineCounts 占 `:43-180`（138 行）⇒ 62 与 195 至少一误 |
| 14 | (新) | DOC-DISCIPLINE.md | 🟡 | New | DD-100–DD-104 缺「④ basename **多义（不判）** × ⑤ 声明根可解析」交叉用例：`:1003`「④ 域内**唯一 basename** 索引（同名 ≥2 ⇒ **不判**，列报告面）」与 `:1015`「在 ①–④ 任一步即返回」合读时「不判是否终结解析」靠推断，误实现为「继续落到 ⑤」时现有用例全绿 |
| 15 | (新) | DOC-DISCIPLINE.md | 🔵 | New | 受影响表行数与盘上漂移：`:1051`「`docs/core/design/DOC-DISCIPLINE.md` | 1963 | ≈1985」（现盘 2039 行）· `:1052`「`DOC-SYSTEM.md` | 384 | 384」（现盘 385 行） |
| 16 | (新) | DOC-DISCIPLINE.md | 🔵 | New | R-10 现文列已过期：`:932` 记现文「判据项 **7**（枚举 7 键——含 `anchors.roots`）」，而盘上 `DOC-SYSTEM.md:241` 已无枚举（= 该行「改后」即现状，动作成 no-op）；该表已自带「落笔前逐处回读」免责句，风险低 |
| 17 | (新) | DOC-DISCIPLINE.md | 🔵 | New | 射程外残余未登记为永久残余：`:1024` 全仓口径「**306 行 / 447 处 / 37 档**」vs `:1023` 引擎口径「**300 条 / 20 档**」——差 147 处 / 17 档在引擎射程外（记录面 / 域外档），本设计只记「口径差」，未写「该面永久不判（射程外）」的结论行 |

计数：🔴 0 · 🟡 3 · 🔵 3（原 11 条：Fixed 10 · Accepted 1；新 6 条：🟡3/🔵3）。

VERDICT: pass

## §4 用户批准（主 agent）

**用户批准（2026-10-19 08:07）**——用户逐字：「**批**」。

**批准链路**：

| 步 | 事实 |
|---|---|
| 裁决（07:38） | 用户对「A 改文档 ∥ B 改引擎」逐字选「**B**」 |
| 设计评审轮 1（07:44） | `VERDICT: changes-required`（🔴4 / 🟡6 / 🔵1） |
| 修正轮（`#65`） | 11 条全落；父侧另改一处设计（新步由 basename 前移到后 ⇒ 覆盖偏移归零） |
| 设计评审轮 2（08:01） | `VERDICT: pass`（11 条：Fixed 10 · Accepted 1 · Unfixed 0；遗留 🔴 = 0） |
| 形式欠账收敛（`#67`） | 评审新增 6 条（🟡3 / 🔵3）全落 |
| **用户批准实施（08:07）** | **逐字「批」** |
| 实施（`#68`） | 六条验收全过（父侧亲跑，§6 ①） |
| 文档面收敛（`#69`） | 上抛 3 条落地 |

**批准范围**：`anchors.mjs` · `index.mjs` · `manifest-schema.mjs` · `tool-docs/doc_check.md` · `scripts/doc-check.mjs`（R-3 在册）· 单元测试（收口删）；`PROJECT-MANIFEST.json` 三元素 = 父侧笔（已落）。

**未批准的范围**：306 行裸档名改写（用户裁定 B = 不改文档）· `prompt-refs-check.mjs` 的 5 条既有命中（台账 `#1684`）· `helpers.mjs` 三处常量注（台账 `#1683`）。

## §5 实施记录（eng-coder）

### 5.1 交付摘要（eng-coder · 2026-10-19）

按 `docs/core/design/DOC-DISCIPLINE.md` §3.20 判据 ①「解析序 ⑤」+ §5 A-DD32 落地，六处改动：

| # | 文件 | 改了什么 |
|---|---|---|
| 1 | `thincoder-core/doc-check/anchors.mjs` | `resolveDoc` 增第 ⑤ 步（④ 之后、逐根「根 + `/` + token」原样拼、声明序首者）；新增 `classifyRoots`（值形 ∧ 根在盘两门，弃用/缺位入 `rootGaps`）；`isDir`；`checkAnchors` 收 `roots` 并回 `rootGaps`；头注解析序行随动 |
| 2 | `thincoder-core/doc-check/index.mjs` | 读 `cfg.anchors?.roots` 原值下传；`configError` 增 roots 一支（gate fail-closed）；报告面逐条列「解析根弃用 ∥ 声明解析根缺位」；返回面增 `anchorRootGaps` |
| 3 | `thincoder-core/manifest-schema.mjs` | `DEFAULT_MANIFEST.checkConfig.anchors.roots = []`（`checkConfig` 顶层键仍 5）；导出单元素值形谓词 `anchorRootError`（非空字符串 / 相对 / 无 `..`），报告态与 gate 面共用一处实现 |
| 4 | `thincoder-core/tool-docs/doc_check.md` | 参数枚举补 `anchors.roots` + 一句「只扩解析面、不扩行宽射程」（53 → 54 行） |
| 5 | `thincoder-core/test/doc-check-roots.test.mjs` | 新建：DD-R1–DD-R8（R8 拆 a/b）共 9 例，映射设计 DD-100–DD-105 + A-DD32 六条判据；夹具全落 `mkdtemp` |
| 6 | `scripts/doc-check.mjs`（**超出派单五档，见 5.2 第 5 条**） | 设计 R-3（`DOC-DISCIPLINE.md:925`，笔 = eng-coder）派的一行：`CRITERIA_KEYS` 增 `"anchors.roots"` ⇒ 7 项（同步注释枚举） |

`width.mjs` / `scanDirs` / `scripts/doc-check-anchors.mjs` / 306 行裸提示词档名 / `prompt-refs-check.mjs` 零改。

### 5.2 决策透明表

| # | 决定 | 依据 / 被拒项 |
|---|---|---|
| 1 | 值形谓词住 `manifest-schema.mjs`，**不加** `validateManifest` 硬拒支 | `validateManifest` 报错 ⇒ `readManifest` 返 `ok:false` ⇒ 报告态直接抛错，违 §3.20「report 逐元素弃用（不炸）」。gate 的拒由 `index.mjs` `configError` 承担（设计 2.5 的「`configError` 一支」） |
| 2 | 根缺位 / 元素弃用只列报告态，不进 gate 报面 | 设计只要「报告面逐根列」；gate 报面是固定句形（首行 verdict + 命中行），歧义报告同样不入 gate |
| 3 | 测试档名不用设计夹具的 `x.md` | 引擎抽取面本就排除单字符词干与占位词干（`anchors.mjs` `PLACEHOLDER_STEMS`）——照 `x.md` 写夹具，token 进不了抽取集，判据零可判。改用 `common.md` / `report.md` 等真名 |
| 4 | DD-R5 按「域内 basename 先判」落 | 批次档 §2.6 该行写「解析到 root」，与设计 §3.20:1015 / DD-103「④ 在 ⑤ 之前 ⇒ 解析到域内档」相抵——按设计落，用例断言「0 命中」即域内档胜出 |
| 5 | `scripts/doc-check.mjs` 那行按设计 R-3 落，作为**超派单披露** | R-3 明列笔 = eng-coder 且要求该键集镜像 7 项（需求档 AC-M8-6 已收正为「7 = 6 + 1」）；派单要点表未列该档，故如实披露。改动为一行数组 + 一行注释，V5 面行为零变（该列表只作声明面镜像，不参与任何 verdict） |
| 6 | `PROJECT-MANIFEST.json` 未落 `roots` | manifest = 父侧专权（设计 `:1036`）。验证时临时写入三元素、读毕 `git restore` 还原（现盘零 diff） |

### 5.3 实测读数（本席亲跑）

- **零回归**（新引擎 + 现盘 manifest 无 `roots`）：锚·档缺 **300** / 行宽 **0** / 射程 `docs（196 档）`——与改前基线逐字同。
- **临时声明三根后**（`["thincoder-core/prompts","thincoder-core/tool-docs","thincoder-core"]`，新进程）：锚 **0** / 行宽 **0** / 射程 **196 档** / `rootGaps` **0**；**多义报告行 812，与改前 812 逐字同**（⑤ 只接 ①–④ 全落的 token ⇒ 覆盖偏移 0 的实测面）。
- **gate**（新进程，`docs=["docs/core/design/DOC-DISCIPLINE.md"]`，同批临时声明下）：首行 `DOC-CHECK GATE: PASS`，范围 1 档。
- **gate（本会话内）**：`DOC-CHECK GATE: ERROR（引擎已更新…请重启会话后复跑）`——结构性：本会话进程起于本轮改动之前（引擎版本一致性判据按设计如此）。
- **单元测试**：`node --test thincoder-core/test/doc-check-roots.test.mjs` ⇒ **9/9 pass**；`npm test`（`thincoder-core`）同绿。
- **无硬编码**：`grep -rn "thincoder-core/prompts" thincoder-core/doc-check/` ⇒ **0**。
- **prompt-refs-check**：`node scripts/prompt-refs-check.mjs` ⇒ **5 条，逐条与改前相同**（`tool-docs/batch.md:1` · `tool-docs/doc_check.md:12` / `:33` · `agent-tools/batch-lifecycle.mjs:460` / `:504`），未新增、未顺手修。
- **行数（wc -l 口径）**：`anchors.mjs` 118→**142**（表记 ≈124）· `index.mjs` 196→**210**（≈202）· `manifest-schema.mjs` 167→**181**（≈172）· `tool-docs/doc_check.md` 53→**54**（=54）· 单测 **160**（表记 ≈96）· `PROJECT-MANIFEST.json` **62**（未改）。无一档接近 500 软线。

### 5.4 审计 / 代码评审轮次与终态

| 轮 | 形式 | 结果 |
|---|---|---|
| 内部偏离审计 | explore（只读，逐条对设计） | findings 2 条，均 PARTIAL·low（仅行数容差）；机制面 9 条判据零偏离 |
| 代码评审 | advisor（code，五档 + 设计档 + 批档） | `VERDICT: pass`：0 🔴 / 6 🟡（4 条属文档面或声明面协调项、1 条收口登记、1 条 AC 夹具缺例）/ 3 🔵 |
| 自修（≤5 轮内） | 同会话 | ① 两处引擎注释去掉判据复述、改为指认 §3.20；② 单测头注删去失实句「不进任何门」（本档现暂居 `test/`，会被 `npm test` 收集到收口删除为止）；③ 报告行去掉「缺位…声明解析根缺位」重言 |

**终态**：`clean`（代码/测试面）。未落项全在文档面与声明面（见 5.5）。

### 5.5 未做 / 上抛（逐条）

1. `[上抛·知会]` `PROJECT-MANIFEST.json` 的 `checkConfig.anchors.roots` 三元素未落（父侧笔）⇒ 本仓此刻读数仍是 300，AC-1 的终值只在临时声明下成立。
2. `[上抛·知会]` `docs/core/design/MANIFEST.md` 的 `checkConfig` 键表条目（设计 `:1037` 要求「实施轮落」）——设计档笔 = eng-designer，本席未写。
3. `[上抛·待裁]` 设计自相抵：`DOC-DISCIPLINE.md:1259`（DD-104「根缺位 ⇒ …零 `档缺`」）与 `:1936`（A-DD32③「不判悬空」）对 `:1012` ③「末步仍未命中 ⇒ `档缺`（判定不放宽）」——实装取 fail-closed（根缺位只作报告行，指针本身照报 `档缺`，用例 DD-R8b 钉住）。若「零 `档缺`」才是本意，请裁，实装随之改。
4. `[上抛·知会]` A-DD32 / 用例表的夹具名（`x.md` 等）会被引擎占位词干过滤，故单测改用真名（见 5.2 第 3 条）。
5. `[上抛·知会]` 设计受影响表两行读数落后于实施（`anchors.mjs` 142 vs ≈124、单测 160 vs ≈96）——估计值未计报告面归类件与 9 例夹具，均远低于软线。
6. `[上抛·知会]` 单测落位 `thincoder-core/test/` 是派单指定，与 `docs/core/requirements/TESTING.md:77`「单元测试档住 `docs/batches/`、不进任何门」相抵：本档在收口删除前会被 `npm test` 收集。按派单落位，处置面在父侧/设计档。

## §6 验证与收口（父代理）

### 验证与收口（父侧 · 2026-10-19 08:21）

**① 六条验收（父侧亲跑，不采信转述）**

| # | 判据 | 读数 | 判 |
|---|---|---|---|
| 1 | 单测全绿 | `node --test thincoder-core/test/doc-check-roots.test.mjs` ⇒ **9/9 pass**（DD-R1–R8a/R8b） | ✅ |
| 2 | 锚·档缺 300 → 0 | 新进程 `runDocCheck(".", {mode:"report"})` ⇒ `hits={total:0,anchors:0,width:0}` · 射程 `docs（196 档）` · `anchorRootGaps=0` | ✅ |
| 3 | 错名仍报（未放宽） | DD-R7 pass；`#69` 夹具复跑：根缺位时 `档缺` 照报 | ✅ |
| 4 | 无硬编码 | `grep -rn "thincoder-core/prompts" thincoder-core/doc-check/` = **0** | ✅ |
| 5 | `prompt-refs-check` 失败集不变 | 5 条，与改前逐条相同（`batch.md:1` · `doc_check.md:12`/`:33` · `batch-lifecycle.mjs:460`/`:504`） | ✅ |
| 6 | 行数 | `anchors.mjs` 142（设计估 ≈124，+18）· `index.mjs` 210 · `manifest-schema.mjs` 181 · `doc_check.md` 54 · 无一档近 500 | ✅ 超估但未越线 |

**零回归证据（父侧另测）**：不声明 `roots` 时读数 = **300**，与改前逐字同 ⇒ 本次为**纯追加**，既有解析零改动。

**② 父侧落的笔**

- `PROJECT-MANIFEST.json`：`checkConfig.anchors = {domain, exclude, roots:[`thincoder-core/prompts`, `thincoder-core/tool-docs`, `thincoder-core`]}`（manifest 工具只接受一层子键，故整块写入）。
- 单测档 `doc-check-roots.test.mjs` **9/9 绿后按零留存删除**（不留常驻测试）；读数留本节。

**③ 落位偏离（`#68` 报）**：`#68` 多改一档 `scripts/doc-check.mjs`（`CRITERIA_KEYS` 增 `anchors.roots` ⇒ 7 项）——依据 = 设计 R-3 明列该档笔 = eng-coder，**我的派单漏列**。接受。

**④ 文档面收敛（`#69`）**：根缺位三处口径改 fail-closed 统一（`:1012` / `:1259` / `:1938`）· `MANIFEST.md:672` 补键条目 · 夹具名换真名 + 命名约束句（`:1262`）。

**⑤ 遗留（两条，另案）**

| # | 项 | 去处 |
|---|---|---|
| 1 | `scripts/prompt-refs-check.mjs` 5 条既有命中 | 台账 `#1684` |
| 2 | `thincoder-core/agent/helpers.mjs:454/:461/:470` 常量注 `Content authority = parent side` | 台账 `#1683` |

**⑥ 会话内引擎陈旧（结构性，如实记）**：本会话进程启动早于引擎改动 ⇒ `doc_check` / `batch` 门报 `ERROR（引擎已更新…）`，为 fail-closed 的正确行为。**收口判据以新进程读数为准**（本节 ①）；`batch close` 需重启会话后执行。

**⑦ 测试线**：本批为引擎判据面改动，单元测试 9/9 绿后删除；**集成场景未受影响**（无业务面变更）。
