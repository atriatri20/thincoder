# 2026-10-15 · mpa 余者（M3+M6）拆分批
> 六段 append-only，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 编制：主 agent · 2026-10-15 · 来源 = L7 拆批裁定（`2026-10-15-multi-project-anchor` §1 补记 · 主 agent · 2026-10-15）。
> 台账 = #1475（core · 归批）。前情 = docs/batches/2026-10-15-multi-project-anchor.md §1（L7 拆批裁定 · 2026-10-15）。
## §1 讨论（主 agent）
**状态行**：已收口 2026-10-16
<§1 模板占位：本批条目 / 关键判据 / 授权口径>
## §2 批次任务与设计（eng-designer）
**状态行**：设计完成（三档定形 + 测试面 + 承接登记；L7 复核 M3 ∥ M6 = 2 ≤ 2 在档；现读 206/158/276 实读在册；修正轮（§3 轮次 1 · 4 号）收正已落——① A3 闭合（`:27` 态名入 F1 ④）∥ ② 纪律两口径 + 保留符号列明 ∥ ③ 测试档用后即删收定 ∥ ④ 档头归一）
<§2 模板占位：本批条目（覆盖） / 设计档落点 / 机制设计 / 受影响文件与测试覆盖 / 验收对照 / 关键决策 / 上抛项>

**设计轮交付（initial · 2026-10-15）**：本批 = L7 拆批余者（M3 + M6）——由 mpa §2 表行 5/7/8 提取定形；**本 §2 自足**（任务面引 mpa 可核坐标，不复制）。语义源 = mpa §2「机制设计」（`workspace` 态语义 · 措辞纪律 · 工作区无缺省）。

### 本批条目（覆盖 · 逐条回指）

| # | 条目 | 覆盖（回指） |
|---|---|---|
| 1 | **M3 · 批档解析消费面收口**（`batch-paths.mjs`）：态名 `workspace` + create 报明文案（逐字）+ 同 class 符号收口 | mpa §2 条目 1 · 条目 3 · 回归面 6（批档创建） |
| 2 | **M6 · 评审文档解析消费面收口**（`review-facts.mjs`）：态名 + 注释 | mpa §2 条目 1 · 回归面 6（评审 documents） |
| 3 | **M6 · advisor 拒文案措辞**（`advisor.mjs`）：去 `ambiguous` 词 + 下一步 = 绝对路径；criterion 名面零改 | mpa §2 条目 1 · 回归面 6 · 机制设计「措辞纪律」 |
| 4 | **测试面**：单元测试档 = `docs/batches/2026-10-15-mpa-residual.test.mjs`（批档同目录 · 不进 `test/` 树 · 用后即删），覆盖 1–3 | 本批交付件（沿 mpa §2 测试覆盖口径） |

**坐标（可核）**：mpa 记录 = `docs/batches/2026-10-15-multi-project-anchor.md`（下称 mpa）——本批边界 = §1 拆批补记 `:22-26`；语义源 = §2 条目表 `:34-44` / 机制设计 `:64-72`（措辞纪律 + 例外两处 = `:69-70`）；提取源 = 受影响表行 5/7/8 = `:87` / `:89` / `:90`；测试口径 = `:107-110`。
**需求侧口径**：承 mpa 批需求面（用户 2026-10-15 12:15 / 12:19 两条裁定——原话与四裁在 mpa 编制行 + §1）；需求档同步笔 = 主 agent（随 mpa 批实施同拍）——本批零需求档笔。

### 设计档落点（承接登记 · 本批零新落笔）

(mpa §1 拆批补记明令：两档「由新批承接登记、**不重复落笔**」)

| 档 | 已落面（承 mpa 设计轮） | 本批 |
|---|---|---|
| `docs/core/design/BATCH-RECORD.md`（M3） | §4.15 条 1（取根单源工作区句）· 条 5（工作区锚检查 + **逐字文案** + 机检锚 `belongs to no project`，`:267-272`）· 行为变更登记 ⑤（`:281`）· §4.8 BR-39/40/41（`:167-169`） | 承接登记 · **零笔** |
| `docs/core/design/DESIGN-TOKEN-SETTLEMENT.md`（M6） | F3 行（`:122`——fail-closed 歧义 = **文档名撞车——非工作区态**） | 承接登记 · **零笔** |

注：`docs/core/design/ADVISOR-GUARDS.md:108`（「工作区锚同哲学」句）属 mpa 批保留面「非 M 随动」——本批不重复登记。

### 机制设计（本批面摘要 · 单源 = mpa §2 + 上表已落节）

- **本批 = 三处消费面收口（零新机制）**：`workspace` 态（= 锚自身无档 ∧ 下辖 ≥2 项目）名下消费面同步——① 批档 create 无所属目标 ⇒ 报明 + 下一步（逐字文案）；② 评审 documents 解析分支态名；③ 文档名撞车拒文案措辞。
- **不动面（在册）**：`ambiguousLandingError`（多落点 = 同路径落多点，另一物——零改、不得随之更名）· `criterion=scope-doc-ambiguous` 名面 · 读面 / 在飞 / 写门基底集（候选并集——非停手先例）· 翻转四路（M1 面——批次外）· `resolveReviewDocPaths` 四分支判据（受理 / 围栏 / 可读唯一化 / fail-closed 零改）· 文档二义返回形与注释（`ambiguous` 字段——指义 = 文档二义，非锚态）。
- **措辞纪律（可机判）**：本批三档**输出面**禁含 `ambiguous`；白名单 = `scope-doc-ambiguous`（criterion 名）· `ambiguousLandingError`（符号面）两处。
- **依赖（开工条件）**：态名面（条目 1/2）**依赖 mpa 批先行落地**（`workspace` 态存在——执行序 = mpa 批先行）。mpa 批未落 ⇒ 本批态判不得先行改（否则 `workspaceCandidates` 读回 null ⇒ create 静默回落锚基底 = 回归）。

### 本批显式不覆盖

- **M1 / M2 面**（mpa 批保留——翻转四路 / `manifest` 工具 / `git` / `ledger` / 情境行）——本批零笔。
- **两档已落文档面**（`BATCH-RECORD.md` / `DESIGN-TOKEN-SETTLEMENT.md`）——零笔（承接登记）。
- **需求档**（`PORTABILITY.md` FR11 / `SPEC-MANIFEST.md`——笔在主 agent）· **desktop 面引文**（另轮）· **`doc-check` 第二份发现**（另批）· **VSC 端镜像**（re-export 面）——沿 mpa 上抛裁定，本批零笔。

### 逐档定形（修法 ∥ 落点 `file:line` ∥ 面 ∥ 验收 · 含现读行数 + 增量）

**F1 · `thincoder-core/agent-tools/batch-paths.mjs`（M3 · 现读 206 行 · Δ = 0 预期（行内替换；承 mpa 上限 +8））**

- ① 态判 `:30`：`view.state === "ambiguous"` ⇒ `"workspace"`。
- ② create 拒文案 `:101`：逐字 = `BATCH-RECORD.md:272`——`batch: create target "<raw>" belongs to no project — the session anchor is a workspace holding <N> projects: <c1>, <c2>. Pass an explicit path under a project (e.g. "<候选>/docs/batches/<file>.md").`（`<N>` = `candidates.length`；下辖全列 = `candidates.join(", ")`，按名序绝对路径）。
- ③ 同 class 符号收口（零语义）：`ambiguousCandidates` ⇒ `workspaceCandidates`（定义 `:27-31` · 调用 `:58` / `:107` / `:168`）· `ambiguousReadLegs` ⇒ `workspaceReadLegs`（`:106` / `:133`）· `ambiguousCreateError` ⇒ `workspaceCreateError`（`:101` / `:171`）· 局部别名 `amb` ⇒ `ws`。
- ④ 注面 sweep：歧义锚 ⇒ 工作区锚（`:10` · `:27` · `:54` · `:100` · `:104` · `:156`）；`:100` 内引旧机检锚句同步改 `belongs to no project`。
- **零改**：`ambiguousLandingError`（`:102` / `:195`）· 读面 / 在飞 / 写门基底集 · `outsideBasesError` / `anchoredEscapeError` 文案 · `batchProjectRoot`。
- 面 = 报明文案面 + 符号面 + 注面；验收 = A2 ∥ A3 ∥ A6。

**F2 · `thincoder-core/agent-tools/review-facts.mjs`（M6 · 现读 158 行 · Δ = 0（两行行内替换；承 mpa 上限 +4））**

- ① 态判 `:149`：`view.state === "ambiguous"` ⇒ `"workspace"`；② 注 `:145` 同拍（`workspace → candidates 按名序`）。
- **零改**：四分支判据 / 返回形（`ambiguous` 字段 = 文档二义——保留）· `REVIEW_ROOT_KEYS` / 导出面。
- 面 = 符号面（态判）+ 注面；验收 = A1 ∥ A4。

**F3 · `thincoder-core/agent-tools/advisor.mjs`（M6 · 现读 276 行 · Δ = 0（单行替换；承 mpa 上限 +2））**

- ① 拒文案 `:127` 逐字 ⇒ `Advisor: design review document "${ambiguous.doc}" matches several projects: ${ambiguous.hits.join(", ")}. Pass an absolute path to select one.`（去 `is ambiguous` 词 + 去「候选项目」锚归因 + 下一步 = 绝对路径）。
- **零改**：`criterion` `:128`（名逐字 `scope-doc-ambiguous`）· 注面 `:119` / `:125`（criterion 指义 = 文档二义）· 判定语义（fail-closed、列全部可读命中、不静默挑一）。
- 面 = 报明文案面；验收 = A5。

### 先例与调研（设计前置）

- **最接近先例**：mpa §2「先例与调研」行（`:73-77`——#41 拒翻语义 + #188 会话锚多仓 + F3 四路坐标 + KD-M1-20）。**对齐面** = 单源解析（`batch-paths` 叶档单源 / `resolveReviewDocPaths` 单源）· 逐字文案单源（`BATCH-RECORD.md` §4.15 条 5）· 「不静默挑一」fail-closed。**偏差面 = 无**（本批零机制变更——纯消费面收口）。
- **形面先例（测试档）**：`docs/batches/2026-10-15-inject-project-rules-switch.test.mjs`（批档同目录 · `node:test` + tmp 夹具——本批测试档沿此形）。
- **调研证据（所查来源 ∥ 结论）**：① mpa 设计轮已落档——`MANIFEST.md` §2.5 消费点表行 3/5（`:321` / `:323`）· `BATCH-RECORD.md` §4.15（`:254-289`）· `ADVISOR-GUARDS.md:108` · `DESIGN-TOKEN-SETTLEMENT.md:122`——**相关**（本批语义源 / 文案源 / 处置源）；② 三档代码现读 + 实景读数（`projectRootView("d:\\teamcode")` ⇒ `ambiguous` + 候选恰 2 按名序；`resolveReviewDocPaths(["docs/core/design/MANIFEST.md"], "d:\\teamcode")` ⇒ 受理；`batchDocBases` ⇒ 两候选基底并集；create 两形 = owner 落基底 ∥ 裸串拒）——**相关**（before 读数在册，见验收对照）；③ 声明源 = 本仓 `PROJECT-MANIFEST.json` `index.publicRepos` = `[]`——**无外部公开源可查**（工作区并级仓 `thinworker` / `thincoder.com` 与批档 / 评审解析题材无关——承 mpa 调研结论）。
- **本批独立性一句**：本批为 L7 拆批余者，独立走链（评审 → 批准 → 实施）；引 mpa 坐标、零重落、零复制（mpa §1 拆批补记）。

### 受影响文件 + 测试覆盖

| # | 文件 | 现况（as-of 2026-10-15 实读） | 本批 | Δ | 模块（M 族） |
|---|---|---|---|---|---|
| 1 | `thincoder-core/agent-tools/batch-paths.mjs` | **206**（mpa 表作 207——口径差 1） | 态名 + create 文案 + 同 class 符号收口 | 0（行内替换；上限 +8） | M3 |
| 2 | `thincoder-core/agent-tools/review-facts.mjs` | **158**（mpa 表作 159） | 态名 + 注释 | 0（上限 +4） | M6 |
| 3 | `thincoder-core/agent-tools/advisor.mjs` | **276**（mpa 表作 277） | 拒文案措辞 | 0（上限 +2） | M6 |
| 4 | `docs/batches/2026-10-15-mpa-residual.test.mjs` | 新 | **建**（单元测试档——批档同目录；覆盖 1–3） | 新增 | — |

**行数口径**：三档一律以本行**实读**为准（换行符计数 = 206 / 158 / 276）；mpa 表 207/159/277 与实读差 1 = 口径差——mpa 记录本批笔不及其段落，报告级登记（供父侧核对）。
**贴线判**：有增量档最高 = `advisor.mjs` 276 ⇒ < 500 顾问线 ⇒ 零拆分义务。
**L7 复核（判定时点②——§2 表落表后复核）**：模块列去重 = **M3 ∥ M6 = 2 ≤ 2** ⇒ **在档**（不自触发拆批；测试面「—」不计）。

**测试覆盖**：
- 单元测试档 = `docs/batches/2026-10-15-mpa-residual.test.mjs`（新建 · 批档同目录 · 随批档保存 · **不进 `test/` 树、不入任何门** · 由实施者写并跑 · 用后即删——沿现有纪律）。
- 覆盖 = 验收对照 A2 / A3 / A4 / A5 / A6 的可机判部分（F1 文案 + 符号面 · F2 态判 · F3 文案词面 · 零写）。
- `thincoder-core/test/` 现仅 `run.mjs` / `slow.mjs` ⇒ 无既有用例需同步；集成面 = **无新增**（前端场景由父侧收口轮跑一次）。

### 验收对照（可机判 · 命令 / 阈值 / 断言）

| # | 判据 | 机检形 |
|---|---|---|
| A1 | 态名收口（实景） | `projectRootView("d:\\teamcode")` ⇒ `state === "workspace"` ∧ 候选恰 2 按名排序（M1 落地后）；`batch-paths.mjs` / `review-facts.mjs` 源内 `view.state === "ambiguous"` **零命中** |
| A2 | create 报明文案（逐字） | 工作区锚 + 裸目标（实景 ∥ 夹具）⇒ throw；消息含 `belongs to no project` ∧ **零** `ambiguous` ∧ 下辖全列（绝对路径、按名序）；owner 目标 ⇒ 落其基底 |
| A3 | 符号面收口 | `batch-paths.mjs` 源内 `ambiguous` 命中行集 == `ambiguousLandingError` 命中行集（`ambiguousCandidates` / `ambiguousReadLegs` / `ambiguousCreateError` 零残留） |
| A4 | 评审 documents 受理（实景 · 回归） | `resolveReviewDocPaths(["docs/core/design/MANIFEST.md"], "d:\\teamcode")` ⇒ resolved 含 `…thincoder\\docs\\core\\design\\MANIFEST.md`（收口后仍过） |
| A5 | advisor 拒文案（词面） | 撞车夹具 ⇒ 拒发；消息 `ambiguous` **恰 1 次**（仅 criterion token）∧ 含 `absolute path` ∧ criterion 逐字 `scope-doc-ambiguous` |
| A6 | 零写 ∥ 零回归 | 拒面 / 报明面零写（夹具前后对比）；`ok` / `none` 两态行为与 before 读数同 |

### 用例表（正常 / 边界 / 错误）

| 类 | 输入 | 预期 |
|---|---|---|
| 正常 | 工作区锚 + create 目标 `thincoder/docs/batches/x.md`（实景） | 落 `d:\teamcode\thincoder\docs\batches\\x.md`（before 实测同） |
| 正常 | 工作区锚 + 读面相对串（在档于下辖项目基底内） | 首个可读胜（下辖按名序——次序单源） |
| 边界 | 工作区锚 + 裸 `docs/batches/x.md` | 拒 + 新逐字文案（`belongs to no project` + 下辖全列）；零写 |
| 边界 | `ok` ∥ `none` 两态 + create / 读面两形 | 零改（BR-42 回归锚） |
| 边界 | 文档名撞车（两项目同相对名、皆可读） | `resolveReviewDocPaths` ⇒ `ambiguous` 非空（全列可读命中）；advisor ⇒ 新逐字拒文案 |
| 错误 | create 多落点（`ambiguousLandingError`） | 逐字零改（白名单例外——不随更名） |
| 错误 | 绝对路径越基底 ∥ 锚定串逃逸 | 逐字零改（`outsideBasesError` / `anchoredEscapeError`） |

### 关键决策（含被拒备选）

1. **符号收口 = 一处明列 + 两处同律**：`ambiguousCandidates` ⇒ `workspaceCandidates`（mpa 明列）；同拍 `ambiguousReadLegs` ⇒ `workspaceReadLegs` · `ambiguousCreateError` ⇒ `workspaceCreateError`（同 class——态指名符号，「一名一物」）；`ambiguousLandingError` 零改（mpa 明列——多落点另一物）。**被拒备选**：只改明列一处——同 class 态名残留。
2. **advisor 文案 = 去 `ambiguous` 词 + 去锚归因 + 绝对路径下一步**；`criterion=scope-doc-ambiguous` 名面零改（其指义 = 文档二义）。**被拒备选**：保留 `is ambiguous` 只改尾句——与措辞纪律白名单（两处）相抵。
3. **局部别名 `amb` ⇒ `ws`**（零语义同拍）。**被拒备选**：留 `amb`（虽不入机检，伤「一名一物」）。
4. **两档文档面 = 承接登记、零笔**（mpa §1 明令「不重复落笔」）。**被拒备选**：重落一遍（覆写 mpa 已落面）。
5. **测试档形** = 批档同目录 `.test.mjs` · 用后即删。**被拒备选**：进 `test/` 树（违 mpa 测试口径——不入任何门）。
6. **行数口径 = 实读**（206 / 158 / 276）。**被拒备选**：沿 mpa 表字面（207 / 159 / 277——口径差，非在盘真值）。

### 上抛 / 登记项（报告级——不阻本批）

1. **行数口径差**（mpa 表 207/159/277 vs 实读 206/158/276）：mpa 记录本批笔不及其段落——供父侧核对。
2. **同 class 收口两处超 mpa 明列字面**（`ambiguousReadLegs` / `ambiguousCreateError`）：依据 = mpa 机制设计例外句「（多落点 = …另一物——零改，**不得随之更名**）」（`:70`）之反证——存在「随之更名」的收口运动；零语义、单点可回退——评审可推翻。
3. **advisor 文案逐字 = 产品代码本体**（设计档不复制——沿 D2）；本 §2 给定逐字稿 + 约束集（`ambiguous` 词零命中 ∧ 绝对路径下一步 ∧ criterion 零改）——评审可改措辞、约束不动。

**修正轮（§3 轮次 1 · 4 号）落盘**（四条现读；与上方初始段并读——四条面以本块为准）：

- **① A3 闭合 —— F1 ④ 增补 token 级子项（取「与 `:100` 并列点名 `:27`」路）**：F1 ④ 现读 = 「注面 sweep：歧义锚 ⇒ 工作区锚（`:10` · `:27` · `:54` · `:100` · `:104` · `:156`）；token 级子项：`:27` 内态名字面 `ambiguous` ⇒ `workspace`（「`ambiguous` 态 ⇒ 候选全列**按名排序**」句）∥ `:100` 内旧机检锚句 ⇒ `belongs to no project`」。
  **闭合核验（现读）**：收口后 `batch-paths.mjs` 源内 `ambiguous` 命中 = `:13` / `:102` / `:195`（三行皆含 `ambiguousLandingError`）⇒ A3 等式成立。**弃备选（A3 改「白名单残差集」）之由**：白名单化会把已过期态名冻成常态残留（死引用），且把等式弱化为残差集——零收益。
- **② 纪律两口径 + 保留符号逐一列明**：`:41` 现读分两口径。
  **(i) 输出文案面**：本批三档输出面禁含 `ambiguous`；例外（逐处白名单）= `scope-doc-ambiguous`（criterion token）∥ `ambiguousLandingError`（多落点另一物）。
  **(ii) 源内符号面（明令保留 · 零改）**：F2 四处 = `review-facts.mjs:68`（返回形注）/ `:95`（`let ambiguous = null`）/ `:118`（`ambiguous = { doc, hits: readable }`）/ `:124`（返回形 `{ resolved, invalid, ambiguous, candidates }`）；F3 四处 = `advisor.mjs:121`（解构）/ `:122` / `:124`（判用）/ `:127`（新逐字稿插值 `${ambiguous.doc}` / `${ambiguous.hits.join(", ")}`）；另 `batch-paths.mjs:13` / `:102` / `:195`（`ambiguousLandingError`）。
  **A3 射程**：源级等式仅 `batch-paths.mjs`；`review-facts.mjs` / `advisor.mjs` 源内命中按 (ii)（criterion token 逐处 = `review-facts.mjs:65` · `advisor.mjs:119` / `:128`）——不入 A3 断言。
- **③ 测试档去留 = 用后即删（收定）**：沿现行单元测试纪律（零留存；证据载体 = 批档 §5 读数行——所验 ∥ 命令 ∥ 结果；同口径源 = `MEMBER-AGENT.md:370`「随批收口用后即删——零留存」）。
  `:94` 现读 = 单元测试档 = `docs/batches/2026-10-15-mpa-residual.test.mjs`（新建 · 批档同目录 · **不进 `test/` 树、不入任何门** · 由实施者写并跑 · **用后即删**）——「随批档保存」半句删；「沿 mpa §2 测试覆盖口径」引用收窄 = 仅「不进 `test/` 树、不入任何门」两款（mpa `:108` 无删款）。
  `:21` 同拍 = 条目 4 括注收为「（不进 `test/` 树、不入任何门；用后即删——§5 留读数行）」。
- **④ 档头归一（已落盘）**：`:3` 现读 = 「> 编制：主 agent · 2026-10-15 · 来源 = L7 拆批裁定（`2026-10-15-multi-project-anchor` §1 补记 · 主 agent · 2026-10-15）。」——单次「来源 =」+ 反引号 1 对；无残留。

## §3 设计评审（评审子代理）

### 轮次 1（评审子代理）

**设计轮评审（initial · 2026-10-15）· 对象 = 本档 §2（mpa 余者拆分批 M3+M6 · 设计完成）**

| # | Category | Severity | Issue | Suggestion |
|---|----------|----------|-------|------------|
| 1 | Acceptance criteria | 🟡 | A3 等式口径与 F1 计划不闭合：`:104` 断言「`batch-paths.mjs` 源内 `ambiguous` 命中行集 == `ambiguousLandingError` 命中行集」，而 ①/③/④ 均不覆盖 `batch-paths.mjs:27` 注释行内的态名字面（该行为 `/** 歧义锚候选（判定单点 = `projectRootView`——`ambiguous` 态 ⇒ 候选全列**按名排序**；余者 null）。 */`）；④ 的 sweep 到词面「歧义锚」为止（`:27` 虽在列，token 级子项只点名 `:100` 的机检锚句）⇒ 按现计划收口后 `:27` 成为唯一非白名单残留，A3 不成立 | 在 ④ 的 token 级子项里与 `:100` 并列点名 `:27` 的态名字面；或把 A3 改为「白名单残差集」等式并把该白名单写全 |
| 2 | Clarity | 🟡 | 措辞纪律白名单（`:41`）自述「两处」（`scope-doc-ambiguous` ∥ `ambiguousLandingError`），而本批计划保留的源内 `ambiguous` 符号多于两处：F2「零改」明令保留返回形字段（`review-facts.mjs:68` / `:95` / `:118` / `:124`），F3 新逐字稿自身插值 `${ambiguous.doc}` / `${ambiguous.hits.join(", ")}`（`advisor.mjs:121` / `:122` / `:124` / `:127`）——按「白名单密闭」读会误动 F2 明令零改的两处 | 纪律分两口径（输出文案面 ∥ 源内符号面）并逐一列明保留符号；若只约束输出面，写明 A3 的源级等式射程仅 `batch-paths.mjs` |
| 3 | Clarity | 🟡 | 测试档处置两处并列互斥：`:94` 同句写「随批档保存」∥「**用后即删——沿现有纪律**」；所引 mpa 测试口径（`2026-10-15-multi-project-anchor.md:108`）只有「不进 `test/` 树、不入任何门」、无删除款，且唯一在盘先例（`docs/batches/2026-10-15-inject-project-rules-switch.test.mjs`）至今留存 ⇒ 去留口径与其来源不明（牵动 A2–A6 夹具的复跑证据） | 二择一并写明来源：留档（同 mpa 口径）∥ 删（写出删后 §5/§6 的证据载体）；`:21` 的「沿 mpa §2 测试覆盖口径」与新增半句对齐 |
| 4 | Doc hygiene | 🔵 | 档头 `:3` 残形：「`来源 = 来源 =` L7 拆批裁定（…`2026-10-15`）。」——前缀重复一次 + 收尾反引号不配对（不含已作废内容，不影响机读） | 归一为单次「来源 = …」并去掉多余反引号 |

计数：🔴 0 · 🟡 3 · 🔵 1（合计 4）

核查面限制与读盘 spot-check：文档地图 / 独立项目标准档未声明 ⇒ 文档归属与规范面按 `AGENTS.md` 与在档设计规范判。读盘复核：`batch-paths.mjs` 206 / `review-facts.mjs` 158 / `advisor.mjs` 276（末内容行，读面另显一行行尾空行——即 mpa 表 207/159/277 的 +1 = 行尾空行口径，本批 `:89` 登记属实）；`thincoder-core/test/` = `run.mjs` / `slow.mjs`（`:96` 属实）；`PROJECT-MANIFEST.json` 下辖两份 ⇒ A1「候选恰 2（`thincoder` · `thincoder.com`）」可核；`index.publicRepos` = `[]`（`:77` ③ 属实）；`MANIFEST.md:321` 只列 `ambiguousCandidates` ⇒ 上抛 2 的「超 mpa 明列字面」表述属实；F1/F2/F3 全部 `file:line` 坐标（`:30` / `:101` / `:27-31` / `:58` / `:106-107` / `:133` / `:168` / `:171` / `:102` / `:195` · `:149` / `:145` · `:127` / `:128` / `:119` / `:125`）与逐字源（`BATCH-RECORD.md:272` / `:167-169` / `:281` · `DESIGN-TOKEN-SETTLEMENT.md:122`）逐处命中。`ADVISOR-GUARDS.md:108` 按本审面未核。

体外记（无严重度，不计入本表）：所审三档之外——① mpa（M1+M2）批面不在本次对象内（已另批）：其 §2 `:31` / `:102` 仍停「待父侧处」、表行 5/7/8 无「移入本批」标注（mpa §3 轮次 2 #1 的既有项）；② 「用后即删」若属既有纪律，则先例留存面与该纪律的出入在 mpa 侧文档面，本表只按本批 `:94` 的自陈不一致记。

VERDICT: pass

## §4 用户批准（主 agent）

**用户批准**：2026-10-15 23:54「**批**」（11 批队列放行——本批实施轮 eng-coder#58 在其列）。
**实施面**：M3（`batch-paths.mjs` 消费面：create 报明文案逐字换新 + 同 class 符号收口 + 注面 sweep 六处）+ M6（`review-facts.mjs:145` 注面态名收正 ∥ `advisor.mjs:127` 拒文案去 `ambiguous` 词并改绝对路径下一步）；3 源档 + 1 测试档。
**面外**：两设计档零笔（designer 面）；需求档零改。

## §5 实施记录（eng-coder）

### 5.1 交付摘要

本批 = **M3 + M6**（§2 条目 1–4）。改动面 = **3 个源档 + 1 个单元测试档**，全部落在 §2 受影响文件表内。

| 面 | 落点 | 交付 |
|---|---|---|
| M3 · 批档 create 报明文案 | `agent-tools/batch-paths.mjs:101` | 旧 `batch: ambiguous session anchor — …` ⇒ 新逐字（`BATCH-RECORD.md:272`）：`batch: create target "<raw>" belongs to no project — the session anchor is a workspace holding <N> projects: <…>. Pass an explicit path under a project (…).` |
| M3 · 同 class 符号收口 | 同档 定义 `:28`/`:106`/`:101` ∥ 调用 `:58`/`:107`/`:168` ∥ `:133` ∥ `:171` | `ambiguousCandidates` ⇒ `workspaceCandidates` ∥ `ambiguousReadLegs` ⇒ `workspaceReadLegs` ∥ `ambiguousCreateError` ⇒ `workspaceCreateError` ∥ 局部别名 `amb` ⇒ `ws` |
| M3 · 注面 sweep | 同档 `:10` · `:27` · `:54` · `:100` · `:104` · `:156` | 「歧义锚」⇒「工作区锚」；`:100` 旧机检锚句 ⇒ `belongs to no project` |
| M6 · 评审文档解析注面 | `agent-tools/review-facts.mjs:145` | 态名字面 `ambiguous` ⇒ `workspace` |
| M6 · advisor 拒文案措辞 | `agent-tools/advisor.mjs:127` | 去 `is ambiguous` 词 + 去「候选项目」锚归因 + 下一步 = 绝对路径 |
| 测试档 | `docs/batches/2026-10-15-mpa-residual.test.mjs`（新建 · 批档同目录 · 用后即删） | A1–A6 共 **6 例** |

**开工条件与既成面（披露）**：本批挂 mpa 批（#48）依赖，mpa 已先行落地——其 §5.1 记录另收正 `review-facts.mjs:149` ∥ `batch-paths.mjs:30` 两行 state 比较（`"ambiguous"` ⇒ `"workspace"`，各 1 token）。故 §2 F1①（`:30` 态判）∥ F2①（`:149` 态判）在本批落点表内**已满足、本批零改**（设计交接口径 = mpa §1 `:32` 父侧裁「两行随本批落地；A1「`ambiguous` 零命中」预先满足」）。本批实施 = **F1②③④ ∥ F2② ∥ F3①**。

**超表 / 越列**：无。两设计档（`BATCH-RECORD.md` ∥ `DESIGN-TOKEN-SETTLEMENT.md`）= 承接登记、**零笔**（本批未写）；需求档 / desktop 面引文 / `scripts/doc-check.mjs` / VSC 端镜像 = 零笔。全程零调 `node scripts/doc-check.mjs`（用户 12:10 令）。

### 5.2 读数（本批实测）

| 项 | 命令 | 读数 |
|---|---|---|
| 靶向单测 | `node --test docs/batches/2026-10-15-mpa-residual.test.mjs` | **6 / 6 pass**（A1 ∥ A2 ∥ A3 ∥ A4 ∥ A5 ∥ A6） |
| 项目测试门 | `node test/run.mjs`（cwd = `thincoder-core`） | exit 0 ——「test manifest is empty — zero tests = green」 |
| 语法门 | 三档逐个（edit 工具内建 `node --check`） | 全 **OK** |
| 行数 Δ 对位 | `\n` 计数 vs §2 表「现况」 | **206 / 158 / 276** ⇒ **Δ = 0**（行内替换，与 §2 预期一致） |
| A3 等式 | 源级行扫（`batch-paths.mjs`） | `ambiguous` 命中行 = `:13` / `:102` / `:195` == `ambiguousLandingError` 命中行 ⇒ **等式成立** |
| 残留符号 | 全域 grep | `ambiguousCandidates` / `ambiguousReadLegs` / `ambiguousCreateError` **零命中**；局部别名 `amb` **零命中** |
| 输出文案面 | 三档输出串逐个核 | 除白名单 `scope-doc-ambiguous` ∥ `ambiguousLandingError` 外 **零** `ambiguous` |

### 5.3 决策透明表

| 决策 | 依据 | 备选（被拒因） | 影响 |
|---|---|---|---|
| F1① / F2① **零改**（两行态判已由 mpa 落地） | mpa §5.1（另收正两行）+ §1 `:32` 父侧裁 | 再改一次——被拒：已是目标态，改则 no-op | 本批 Δ 不含这两行 |
| 同 class 两处**超 mpa 明列字面**（`ambiguousReadLegs` / `ambiguousCreateError`） | §2 关键决策 1 + 上抛 2（例外句反证 = 存在「随之更名」的收口运动） | 只改明列一处——被拒：同 class 态名残留 | 零语义、单点可回退 |
| 局部别名 `amb` ⇒ `ws` | §2 关键决策 3 | 留 `amb`——被拒：虽不入机检，伤「一名一物」 | 零语义 |

### 5.4 审计与代码评审轮次与终态

| 轮 | 类型 | 结论 |
|---|---|---|
| 审计 1 | 内部 explore 分歧审计（交付码 vs 设计） | **MATCH 11**；PARTIAL ∥ SILENT-SIMPLIFICATION ∥ OUT-OF-LIST ∥ DOC-DRIFT ∥ DIVERGENCE **零命中**；三档 Δ=0 复核一致；A3 等式与措辞纪律两口径逐处命中 |
| 评审 1 | 内部 advisor 代码评审（三档 + 测试档 + 批档 §2） | **进行中（本段回执见 §5.5）** |

**终态**：（待评审 1 回执后落定——见 §5.5）

### 5.5 评审轮 1 回执、响应表与终态

**评审 1（内部 advisor 代码评审——三档 + 测试档 + 批档 §2）**：**VERDICT = pass** —— **🔴 0**；🔵 2 · 🟡 1（**均非 must-fix**）。

**核验面（评审只读静态——无法执行 `node --test`，§5.2「6/6 pass」按静态推演复核）**：A3 等式（`:13`/`:102`/`:195` 三行皆含 `ambiguousLandingError`）· 符号收口完整性（新名全调用点在位、旧名在代码面零残留）· 消费面完整性（仅**导出名**被 `batch.mjs`/`batch-read.mjs`/`batch-lifecycle.mjs`/`subagent-spawn.mjs`/`write-gate.mjs` 引用 ⇒ 私有重命名零外部影响；VSC 端无在盘镜像副本）· 逐字文案对位（`BATCH-RECORD.md:272`）· 实景前置（`d:\teamcode` 锚自身无档 ∧ 带档者恰 2 ⇒ A1）· `DEFAULT_MANIFEST.docRoot.design = "docs/design"`（`manifest-schema.mjs:35` ⇒ A4 分支① 不命中、分支③ 命中 `thincoder`）· `identityLine` 形（`advisor/notice.mjs:14` ⇒ A5「恰 1 次」断言与实现一致）——逐项与实现一致。

**响应表**：

| # | 严重度 | 项 | 处置 | 理由 |
|---|---|---|---|---|
| 1 | 🔵 | 测试档实景锚硬编码绝对路径（A1/A2/A4 与运行盘面强耦合） | **不改**（登记建议） | 非 must-fix；实景夹具 = §2 A1 明令（授权取舍，非实现偏差）；档随批收口删（零留存）⇒ 守卫加值归零。§6 前若留档复跑，可按建议加 `t.skip()` 守卫 |
| 2 | 🔵 | 测试档在盘 vs 「用后即删」 | **不改（时点裁定）** | §2 修正块 ③ 口径 = **随批收口用后即删**（零留存；证据载体 = 批档 §5 读数行——同口径源 `MEMBER-AGENT.md:370`）；§5.2 读数行已备 ⇒ 删除落 **§6 收口轮**（父侧） |
| 3 | 🟡（报告级 · 非 must-fix） | 本档 §2 F1① / F2① 仍把 `batch-paths.mjs:30` ∥ `review-facts.mjs:149` 两行列为本批落点，与 mpa 档 `:110`（「该两处…随本批同拍收正」）∥ `:214` 的归属表述相左（**代码终态无争**——两行现盘均已是 `workspace`，§5.1 已披露） | **不改**（登记 · 转父侧） | 报告级（R7a 报而不改 · R7e 不阻通过）；该面 = 本档设计轮遗留（mpa 拆批边界更正后未回填 F1①/F2①），**§2 属 eng-designer 面**，实施轮不得自改 |

**终态**：**`clean`**（评审轮 1 判 pass；**无未决 🔴 / must-fix 🟡**）。

**留父侧（不阻塞本批）**：① 测试档删除时点 = §6 收口轮（承 §2 修正块 ③）；② 响应 #3 的跨档归属交叉说明（§3 / §6 层）；③ 评审体外记：`docs/core/design/MANIFEST.md:321` 仍以「`ambiguousCandidates` 更名 `workspaceCandidates`」记述，收口后旧符号在全仓已无代码命中（仅文档面残留）——是否补记「已落」由文档层裁。

## §6 验证与收口（父代理）

**收口（父侧 · 2026-10-16）**

**① 验证读数（本批验证行）**：批内件 `node --test docs/batches/2026-10-15-mpa-residual.test.mjs` = **6 / 6 pass**（A1–A6，含 A3 等式闭合：`ambiguous` 命中行 == `ambiguousLandingError` 命中行）；三档 `node --check` 全 OK；行数 **Δ = 0**（206 ∥ 158 ∥ 276 行内替换）；项目测试门 `node test/run.mjs` exit 0（清单空 = zero tests = green）；advisor 代码评审 = **pass**（🔴 0 ∥ 🔵 2 ∥ 🟡 1，均非 must-fix）；终态 **clean**。**父侧抽核**：`thincoder-core/agent-tools/batch-paths.mjs:101` = 新文案逐字在场（机检锚 `belongs to no project` ✓）∥ `:28/:58/:107/:168` = `workspaceCandidates` ✓ ∥ `:102/:195` = `ambiguousLandingError` 零改 ✓。集成测试 = **未跑**（本仓无集成档——如实记）。禁调令遵守 ✓。

**② 集成场景影响**：无 —— 门面文案/符号名面。

**③ 核销结算**：台账 **#1475 族**尾项（create 文案面）随本批闭合；mpa 档（`2026-10-15-multi-project-anchor.md`）已收口。

**④ 暂缓批复核**：无。

**⑤ 结算同步清单**：角色表 ✓ ∥ 状态行 ✓ ∥ 计数（M3 两件 + M6 两件 + 测试面）✓ ∥ 指针 ✓ ∥ 待办勾销 ✓ ∥ 前批遗留交叉核（mpa 档 create 文案面 ⇒ 本批承接 ✓）✓。

**⑥ 上抛与知会处置**：① 测试档删除时点 = **随批收口用后即删（零留存）**——§5.2 读数行在档，删除落父侧收口轮（本席执行）；② 跨档归属表述相左（本档 §2 F1①/F2① vs mpa 档 `:110`/`:214`）⇒ 记录面随正，**入册 #1510 族**；③ `docs/core/design/MANIFEST.md:321` 旧符号记述 ⇒ 记录面随正，**入册 #1510 族**；④ 工作树 215 档他批未提交改动 = 非本批。

**⑦ 结算行**：台账 #1475 族尾项已闭合；批内件随收口删除（§5.2 留读数行）。
