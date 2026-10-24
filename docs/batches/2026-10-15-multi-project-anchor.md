# 2026-10-15 · 多项目锚（ambiguous 态缺陷修复）
> 六段 append-only，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 编制：主 agent · 2026-10-15 · 来源 = 用户 2026-10-15 12:15 裁定（原话：「这个问题说过多次了，cwd下面有多仓是常态，怎么还在做这种判断？谁他妈让他猜了？！」）—— 派生自：会话锚 `d:\teamcode` 下并存 `thincoder` ∥ `thincoder.com` 两项目 ⇒ 机制报 `ambiguous` 并四处拒动。。
> 台账 = #1475（core · 归批）。前情 = 无（独立批）。
## §1 讨论（主 agent）
**状态行**：已收口 2026-10-16
<§1 模板占位：本批条目 / 关键判据 / 授权口径>

**轮次开账 + 上抛裁定（2026-10-15 22:4x · 主 agent）**：来源 = 用户 12:15 裁定（锚处多仓不得停手）+ 12:19 四裁；设计轮交付（§2 · 12:28 在盘；设计档 7 档随设计轮已落）。**上抛 6 项逐项裁**：

| # | 上抛项 | 裁 |
|---|---|---|
| 1 | 态名边界（`workspace` = ≥2 vs ≥1） | **准 ≥2**——「唯一解析（恰一候选）= 非猜」，与用户核心令「不得猜」一致；≥1 读的代价（单项目工作区相位行消失 + `ledger`/`batch`/`git` 缺省全废 + 大面回归）不成比例 |
| 2 | 翻转放行（收窄 #188 拒翻腿） | **准**——依据 = 用户 12:15「不得停手」+ 实景（`d:\teamcode` 处工程模式开不起来 = 缺陷本体） |
| 3 | `MANIFEST.md` 行数（现读 781——未触 800） | **准代码口径**（该规住 `AGENTS.md`「Coding Conventions」——文档无拆分义务）；维持观察 |
| 4 | 需求档同步（`PORTABILITY.md` FR11 ∥ `SPEC-MANIFEST.md` ②.2 / AC-M1-2） | 受理——**本席笔**；时点 = 评审通过 + 批准后、随实施同拍（先于/随实施落） |
| 5 | desktop 面引文（`IPC.md:310`/`:315` ∥ `UI.md:525`） | 受理——随本批落地后归桌面文档轮收正（本席登记在案） |
| 6 | `doc-check` 第二份发现实现（`scripts/doc-check.mjs:36-45`/`:75-79`） | 受理——另批（已入台账） |

**下一步** = 设计评审（用户点火）→ 批准 → 实施轮（12 档 + 单元测试档；设计档随动已落）。

**【L7 复核裁定 + 修正轮收口（主 agent · 2026-10-15 23:1x）】**

**① L7 拆批裁定（判定时点②）**：§2 复核 = 模块列去重 M1 ∥ M2 ∥ M3 ∥ M6 = **4 > 2 ⇒ 越界**（口径 = `BATCH-RECORD.md:351` L7；处置 = `:357`「停下上报」已按规执行 ✓）。**裁定：拆批**——不另裁口径（本批属 M 族批、计数成立、L7 判据句无豁免格）。
**拆分依据**：L7 阈值（单批模块数 ≤2）。
**各批边界**：**本批（multi-project-anchor）保留 = M1 + M2**——代码档 1–4 ∥ 6 ∥ 9–15 + 测试档；设计档 `MANIFEST.md` ∥ `TOOLS.md` = M1、`LEDGER.md` = M2、`LIGHT-CHANNEL.md` ∥ `ADVISOR-GUARDS.md` = 非 M 随动。**余者另起新批** = `docs/batches/2026-10-15-mpa-residual.md`（**M3 + M6**）——代码档 5（`batch-paths.mjs`）∥ 7（`review-facts.mjs`）∥ 8（`advisor.mjs`）；文档面 `BATCH-RECORD.md`（M3）∥ `DESIGN-TOKEN-SETTLEMENT.md`（M6）**已随本批设计轮落盘**——由新批承接登记、不重复落笔。执行序：两批独立走链（本批先行）。

**② 修正轮 #18 验收**：11/11 落盘 + 三机检过 → 交轮次 2 复评（本轮发）。**③ 越列 12 处自陈**：受理（同 class「态名收口」、零新语义——不 revert）。**④ 上抛·知会（session-flags 工程位写槽）**：已入台账（新行 · 归批）。**⑤ 需求档同步（裁定 4）**：维持原时点——评审通过 + 批准后随实施同拍（本席笔）。

**父侧直笔（2026-10-16 · 小形 · revertable）**：§2 `L104` 保留行枚举补 `∥ 18–19`（承 #59 修正轮上抛·待裁②——机械形补，零语义；18–19 两行皆 M1，模块级「M1 + M2」不变）。

**父侧裁（#59 上抛·知会①）**：`mpa-residual` 档 `:54`/`:63`/`:102`/`:42` 中「态判 `:30`/`:149` = 其本批工作」的旧记已被本批吸收（两行随本批落地；其 A1「`ambiguous` 零命中」预先满足、`:42` 禁令对两行成空转）——待 #58（mpa-residual 实施轮，挂 #48 依赖）起跑时由父侧送达改记口径；#59 发现 3（`thincoder/.thincoder/tmp/ss2/baseline-manifest.mjs:447` 旧形）= 临时面，不入账。

## §2 批次任务与设计（eng-designer）
**状态行**：设计完成（判据面收正 + 单一解析律 + 五场景回归面 + AC-44/T78 机判已落；修正轮（§3 轮次 1 · 11 号 ∥ 轮次 2 · 7 号）收正已落（轮次 2 之 ⑥ = §1:15 前提句——§1 面，归主 agent 落笔）；上抛 6 项已裁（= §1 裁定表）；L7 复核 = 4 > 2 ⇒ 已裁拆批（M1+M2 留批；M3+M6 另批））
<§2 模板占位：本批条目（覆盖） / 设计档落点 / 机制设计 / 受影响文件与测试覆盖 / 验收对照 / 关键决策 / 上抛项>

### 本批条目（覆盖 · 逐条回指需求）

| # | 条目 | 覆盖 |
|---|---|---|
| 1 | **判据面收正**：`ambiguous` ⇒ `workspace`（锚自身无档 ∧ 下辖 ≥2 项目 = 工作区常态）——`projectRootView` / `projectView` / `discoverProjects` / `discoverRepos` 四契约 + 全部消费面态名同步 | 用户 12:15 裁定①（不得猜）· 设计要点 1 |
| 2 | **单一解析律**：一切项目解析 = 「用点路径 → 最近带档祖先」（`owningProject`）；会话不持项目单值；**不设计「锚作用域默认值」**（父侧 12:19 令：那正是「猜」的位置） | 用户 12:19 裁定①②· 作废原设计题第 3 项 |
| 3 | **能带路径的 ⇒ 必须带**；缺路径 ⇒ 报明事实 + 可执行下一步（不抛「歧义」、不替它挑）——`ledger` / `git` / `batch` / `manifest` 四处逐点处置 | 用户 12:19 裁定②④ |
| 4 | **情境行**（不能带路径）= 只播报事实、不做归属判断（信息行，非错误行） | 用户 12:19 裁定③ |
| 5 | **矛盾收口**：「会话不绑定项目」× 四处会话级缺省的自相矛盾——留「按用点解析」，废「会话项目根」单值；唯一保留的锚回落 = 建档流落点 | 用户 12:19 裁定④ |
| 6 | **回归面**（`d:\teamcode` 实景）：批档创建 · manifest 读写 · 评审 documents · **ledger 读写** · git 仓发现——五者皆不得因并存停手 | 用户 12:19 裁定⑤ |
| 7 | **外溢（该报）**：翻转面 `workspace` **不再拒翻**（可拒面收窄为仅「档非法」） | 用户 12:15 裁定「不得停手」+ 实景（工程模式须能在锚处开） |

### 本批显式不覆盖

- `scripts/doc-check.mjs` 的第二份发现实现（自带 `detectRoot` + 拒面）——**登记**，另批（用户 12:10 令禁调 `doc-check`）。
- **工作区级声明档**（不建——铁律 3：子目录是项目时不得在工作区根建 manifest）。
- **desktop 面引文**（`docs/desktop/design/IPC.md:310 · :315` · `UI.md:525` 引旧锚句「项目不可解析」）——该面自身批（本批已在设计档登记随动面）。
- **需求档**（`PORTABILITY.md` FR11 可拒面句 ∥ `SPEC-MANIFEST.md` ②.2 / AC-M1-2 的态名与报明口径）——**笔在主 agent**，本设计只挂指针 + 标注待同步。

### 设计档落点（逐处 · 已落）

| 档 | 落点 |
|---|---|
| `docs/core/design/MANIFEST.md` | §2.2（四契约态名 + 语义 · 决策树出口 + 翻转处置）、§2.5（**新增「单项目解析律与四处会话级缺省收口」** = 律 + 矛盾收口 + 10 行消费点处置表 + 随动面清单）、§2.6（报明行事实化逐字 + ③' 选行）、§2.9 A/C/D/边界、§2.10（返回面 / 目标面 / 不唯一解析判据）、§3.1（AC-15③ · AC-19 · AC-20③④ · AC-21 · AC-22 · AC-23 · AC-24 · AC-25 · AC-27 · AC-35 · AC-36 · AC-41⑤ + **新增 AC-44**）、§3.2（T39 · T40 · T41④ · T43⑥ · T46 · T55 · T59 · T60 · T64 + **新增 T78**） |
| `docs/core/design/BATCH-RECORD.md` | §4.15 条 1（取根单源行）· 条 5（工作区锚检查 + 逐字文案 + 机检锚 `belongs to no project`）· 行为变更登记 ⑤ · §4.8 BR-39–BR-42 |
| `docs/core/design/TOOLS.md` | §6.13 单源落点行 · 解析序行 5（报明 + 下一步）· A16 / A22 |
| `docs/core/design/LEDGER.md` | §2.1 根解析面 · §2.2 #828 补注 · §7.1 `discoverFamily` · §7.2 工作区根子例 · §8 AC-M2-17 / AC-M2-19 · 用例表 T45 |
| `docs/core/design/LIGHT-CHANNEL.md` | §2 闸读点（工作区候选跳过） |
| `docs/core/design/ADVISOR-GUARDS.md` · `DESIGN-TOKEN-SETTLEMENT.md` | 引文级随动（「同哲学」句 · 文档二义句） |

### 机制设计（契约面摘要 · 细节单源 = 上表各节）

- **态集**：`ok`（唯一解析：归属命中 ∥ 锚自身带档 ∥ 下辖**恰一**项目）/ `workspace`（锚自身无档 ∧ 下辖 **≥2** 项目 ⇒ `root: null` + `candidates` 按名排序全列）/ `none`。
- **落地判据**：显式目标路径 ⇒ `owningProject(target)`；无显式路径 ⇒ 用点路径 = `cwd`。**同一条律，无第二套模型**。
- **工作区无缺省**：报明事实 + 点名项目根 / 目标路径；零写（不建工作区级档）。
- **措辞纪律（可机判）**：报明面输出**禁含** `ambiguous` / 锚歧义 / 「项目不可解析」错误框定。
  **例外两处**：`criterion=scope-doc-ambiguous`（其指义 = **文档名撞车**——真二义，非锚态）· `batch-paths` 的 `ambiguousLandingError`（**多落点** = 同路径落多点，另一物——**零改**，不得随之更名）。
- **情境行新形**：事实行（逐字 = `MANIFEST.md` §2.6 条 1b）；前缀 `MANIFEST_LINE_PREFIX` 零改（单活体认领照旧）。

### 先例与调研（设计前置）

**最接近先例**：#41（拒翻语义——先判后翻 / 判据单源 / 拒时零副作用）＋ #188（会话锚多仓——「可拒面」出处）。**实现坐标** = `thincoder-core/agent-tools/eng.mjs:76-84` ∥ `thincoder-cli/src/tui/cmd-eng.mjs:38-50` ∥ `thincoder-cli/src/tui/cmd-session.mjs:93-112` ∥ `thincoder-cli/src/acp/handlers-slots.mjs:77-84`（F3 四路）；**设计档坐标** = `docs/core/design/MANIFEST.md` §2.8（F1–F6 · KD-M1-20/21）。**对齐面** = 单源决策树 `resolveEngineeringManifest`（KD-M1-20 零改）· 先判后翻 · 拒时零副作用 · 四路明示面机制——本批逐项照旧。**偏差面** = 拒面收窄（推翻先例「歧义 ⇒ 拒翻」腿——依据 = 用户 12:15 裁定「不得停手」+ 实景 `d:\teamcode` 工程模式开不起来 = 缺陷本体；决策在册 = 本 §2「关键决策」2）。

**调研证据（所查来源 ∥ 结论）**：① 本仓在档机制先例——`docs/core/design/MANIFEST.md` §2.8 / §2.9 ∥ `TOOLS.md` §6.13 ∥ `BATCH-RECORD.md` §4.15 条 5 ∥ `LEDGER.md` §2.1——**相关**（先例坐标与对齐 / 偏差见上行）；② 工作区并级仓文档树（`thinworker/docs/**` · `thincoder.com/docs/**`；`thincoder-issues` = 脚本仓、无文档树）——题材面（数字员工 / 站点）与本批（多项目锚解析）**无相关**；③ 声明源清单 = 本仓 `PROJECT-MANIFEST.json` `index.publicRepos` = `[]`（未声明工作区外公开源）——**无外部源可查**（`D:\ref\` 参照系 = 工作区外、不入索引——不在声明源内）。

### 受影响文件 + 测试覆盖

| # | 文件 | 现况（as-of 2026-10-15 实读） | 本批 | Δ | 模块（M 族） |
|---|---|---|---|---|---|
| 1 | `thincoder-core/manifest-discovery.mjs` | 132 | 态名 + 注释 | ≤ +6 | M1 |
| 2 | `thincoder-core/manifest.mjs` | 287 | `projectView` 投影 / 决策树出口与文案族 / 翻转码 | ≤ +12 | M1 |
| 3 | `thincoder-core/agent/setup-reminders.mjs` | 256 | 报明行事实化 + 态名 | ≤ +6 | M1 |
| 4 | `thincoder-core/agent-tools/manifest.mjs` | 201 | read 报明 + init/write 文案 | ≤ +10 | M1 |
| 5 | `thincoder-core/agent-tools/batch-paths.mjs` | 207 | 态名 + create 文案 + `workspaceCandidates` 更名 | ≤ +8 | M3——**移入 `docs/batches/2026-10-15-mpa-residual.md`** |
| 6 | `thincoder-core/tools/git.mjs` | 403 | 态名 + 消息文案 | ≤ +6 | M1 |
| 7 | `thincoder-core/agent-tools/review-facts.mjs` | 159 | 态名 + 注释 | ≤ +4 | M6——**移入 `docs/batches/2026-10-15-mpa-residual.md`** |
| 8 | `thincoder-core/agent-tools/advisor.mjs` | 277 | 拒文案措辞 | ≤ +2 | M6——**移入 `docs/batches/2026-10-15-mpa-residual.md`** |
| 9 | `thincoder-core/ledger-db.mjs` | 174 | 报明文案 | ≤ +6 | M2 |
| 10 | `thincoder-core/ledger.mjs` | 187 | 态名 + 注释 | ≤ +2 | M2 |
| 11 | `thincoder-core/agent/light-round.mjs` | 67 | 态名 + 注释 | ≤ +2 | M2 |
| 12 | `thincoder-core/agent-tools/eng.mjs` | 107 | 翻转放行分支（`workspace` 放行——拒面收窄 = 仅「档非法」） | ≤ +6 | M1 |
| 13 | `thincoder-cli/src/tui/cmd-eng.mjs` | 106 | 拒判据收窄（`workspace` 放行——放行 ⇒ 零附着） | ≤ +4 | M1 |
| 14 | `thincoder-cli/src/tui/cmd-session.mjs` | 138 | 拒判据收窄（同型——切槽照常进行、放行 ⇒ 零附着） | ≤ +4 | M1 |
| 15 | `thincoder-cli/src/acp/handlers-slots.mjs` | 224 | 拒判据收窄（`session/load` ∥ `session/resume` 两处；`reattach` 非拒面零改） | ≤ +6 | M1 |
| 16 | 设计档 7 档（`MANIFEST.md` **781** / `BATCH-RECORD.md` **490** / `TOOLS.md` **1244** / `LEDGER.md` **455** / `LIGHT-CHANNEL.md` **219** / `ADVISOR-GUARDS.md` **413** / `DESIGN-TOKEN-SETTLEMENT.md` **214**——as-of 实读） | — | 改（本批已落） | — | M1 · M2 · M3 · M6 |
| 17 | `docs/batches/2026-10-15-multi-project-anchor.test.mjs` | 新 | **建**（单元测试档——批档同目录） | 新增 | — |
| 18 | `thincoder-core/agent-tools/review-facts.mjs:149` | 159 | 分支③候选底座态判随改名收正（1 token：`"ambiguous"` ⇒ `"workspace"`） | 0（行内替换） | M1——**本批**（超原表补列；该档余面仍移入 `mpa-residual`） |
| 19 | `thincoder-core/agent-tools/batch-paths.mjs:30` | 207 | 歧义锚候选态判随改名收正（1 token：`"ambiguous"` ⇒ `"workspace"`） | 0（行内替换） | M1——**本批**（超原表补列；该档余面仍移入 `mpa-residual`） |

**模块列口径**：该行所改机制 / 档面所属 M 族模块（`docs/core/design/ENGINEERING-MODE-V2.md` §2.2 模块清单）；单一归属取**本批变更面**（点名单与变更面异者从变更面——如 `eng.mjs` 点名单列 M11（plan 面），本批所改 = M1 翻转面 ⇒ 记 M1）；非 M 族面标 `—`；设计档行按其模块面计入（行 16 逐档 = M1 ∥ M3 ∥ M1 ∥ M2 ∥ — ∥ — ∥ M6）。
**L7 复核（判定时点②——§2 表落表后复核）**：模块列去重 = **M1 ∥ M2 ∥ M3 ∥ M6 = 4 > 2 ⇒ 越界**——按 L7 口径：**停下上报** + 拆批 + **§1 补记**已行 ⇒ **裁定：拆批**（L7 判定权 = 主 agent）——本批保留 = **M1 + M2**（行 1–4 ∥ 6 ∥ 9–15 ∥ 18–19 + 测试档）；**M3 + M6 = 行 5 ∥ 7 ∥ 8 移入 `docs/batches/2026-10-15-mpa-residual.md`**（另批独立走链）。

**L7 拆批边界更正（修正轮 · 2026-10-16）**：改名本体（M1）与其 state 比较点恒假耦合——两比较点未随态名收正 ⇒ 恒假 ⇒ A5 / A7 当场不可过、改名落地即在锚处致批档建 / 评审门停手（正是本批要消灭的缺陷本体）；**故该两处（行 18 `review-facts.mjs:149` ∥ 行 19 `batch-paths.mjs:30`）随本批同拍收正**（超原受影响表 ⇒ 补列行 18 ∥ 19），`mpa-residual` 承接两档其余面（行 5 = create 文案 ∥ `workspaceCandidates` 更名；行 7 = 态名 + 注释）。

**贴线判**：有增量档最高 = `git.mjs` 403 ⇒ ≈409（< 500 顾问线）⇒ 零拆分义务。
**登记（已裁——§1 裁定 3）**：`MANIFEST.md` 现 **781** 行（as-of 实读——含本批改面；设计档已随设计轮落盘）⇒ **未触 800**；且 500/800 行规按**代码**口径读（该规住 `AGENTS.md`「Coding Conventions」——文档无拆分义务）⇒ **无拆分义务**。维持观察。

**测试覆盖**：
- 单元测试档 = `docs/batches/2026-10-15-multi-project-anchor.test.mjs`（新建 · 批档同目录 · 随批档保存 · **不进 `test/` 树、不入任何门** · 由实施者写并跑）。
- `thincoder-core/test/` 现仅 `run.mjs` / `slow.mjs`（per-face 单元测试树已清退场）⇒ 无既有用例需同步。
- 集成面：**无新增**（前端场景由父侧收口轮跑一次）。

### 验收对照（可机判 · 命令 / 阈值 / 断言）

| # | 判据 | 机检形 |
|---|---|---|
| A1 | 态名收正（实景） | `node -e` 调 `projectRootView("d:\\teamcode")` ⇒ `state === "workspace"` ∧ `candidates` 恰 2 且按名排序（`thincoder` · `thincoder.com`） |
| A2 | 下辖恰一仍解析 | tmp 夹具（容器 + 恰一子项目）⇒ `projectRootView` `state==="ok"` ∧ `root` = 该子项目（回护 AC-24 / AC-35） |
| A3 | 禁字样（五面） | 情境行 / `manifest read` / `ledger` 报明 / `git` 消息 / `batch` create 文案——`node` 行扫**零命中** `ambiguous`（`scope-doc-ambiguous` 与 `ambiguousLandingError` 两处除外，逐处白名单） |
| A4 | 情境行事实化 | 纯函数逐字断言（两变体：带档级 / 裸仓级）+ 单活体 / 幂等零改（AC-25 / AC-44） |
| A5 | 批档 create（实景 ①） | `batch create` 目标 `thincoder/docs/batches/x.md` ⇒ 落 `d:\teamcode\thincoder\docs\batches\x.md`（落其基底）；无目标 ⇒ 文案含 `belongs to no project` + 下辖全列（BR-39/40） |
| A6 | manifest 读写（实景 ②） | `manifest read`（`target` = thincoder）⇒ `state=ok`；`write docRoot.design` ⇒ 仅 `thincoder/PROJECT-MANIFEST.json` 变（sha256 另档零变）；无 `target` 且锚 = 工作区 ⇒ 报明 + 下辖全列（零写） |
| A7 | 评审 documents（实景 ③） | `resolveReviewDocPaths(["docs/core/design/MANIFEST.md"], "d:\\teamcode")` ⇒ 受理（`resolved` 含该绝对路径）；**不因锚并存而拒** |
| A8 | ledger 读写（实景 ④） | `ledger({action:"query", cwd:"d:\\teamcode\\thincoder"})` ⇒ 正常返回；不带 `cwd` ⇒ **报明事实 + 点名项目根** + 零写 + 禁字样（AC-M2-17 / T45） |
| A9 | git 仓发现（实景 ⑤） | `gitTool.execute({action:"status"})`（cwd = `d:\teamcode`）⇒ **throw 报明 + 下辖 N 仓全列 + 指 `workdir`** ∧ 消息**不含** `Ambiguous`；传 `workdir:"thincoder"` ⇒ 正常 status（A16 / A22 面） |
| A10 | 翻转放行（四路） | 核心 `eng` 工具 ∥ `/eng` ∥ `/session` ∥ ACP（cwd = 工作区夹具）⇒ `engineering === true` ∧ `agent.manifest === null` ∧ `_advisorRuns` 重置；档非法格仍拒且零副作用（AC-20 / T39 / T40 / T53） |
| A11 | 零写 | 上述无路径形全部断言：`PROJECT-MANIFEST.json` / 台账库档**未被建 / 未被改**（sha256 前后对比） |
| A12 | 单源结构（回归） | `readdirSync` 在 `thincoder-core/manifest-discovery.mjs` 恰 1 处（T54）；`git.mjs` `discoverRepos` import 命中且 `node:fs` 零命中（A20） |

### 关键决策（含被拒备选）

1. **态名 `workspace`**（收正，非新增机制）：语义 = 锚自身无档 ∧ 下辖 ≥2 项目 = 常态。
   **被拒备选**：把 `unique`（下辖恰一）并入 `workspace`（= 用户例句的「≥1」读法）——代价 = 单项目工作区会话相位行消失 + `ledger` / `batch` / `git` 缺省全废 + 大面回归；且「唯一解析」不是猜。**父侧可推翻**（若推翻，本条 2 的「无缺省」面随之扩到 ≥1）。
2. **翻转面放行**（可拒面收窄为仅「档非法」）：推翻 #188 裁定的「歧义 ⇒ 拒翻」腿。依据 = 用户 12:15 裁定（不得停手）+ 实景（`d:\teamcode` 下工程模式开不起来正是该缺陷本体）。**父侧可推翻**（推翻则 A10 回退为拒翻 + 报明）。
3. **`ambiguousLandingError` 零改**（多落点 ≠ 锚态二义）；`scope-doc-ambiguous` 零改（文档名撞车）。
4. **不建工作区级声明档**（铁律 3）；不引入「工作区级声明」新机制。

### 上抛项（已裁——§1 裁定表）

1. **态名边界**：`workspace` 取 ≥2（本设计）vs ≥1（用户原例句字面）——见关键决策 1。**裁：准 ≥2（§1 裁定 1）**
2. **翻转放行**是否准（改动 #188 既有裁定）——见关键决策 2。**裁：准（§1 裁定 2）**
3. **`MANIFEST.md` 行数**：500/800 行规是否按文档口径读；按则需拆 §3 测试层出档。**裁：准代码口径——无拆分义务；维持观察（§1 裁定 3）**
4. **需求档同步**（笔在主 agent）：`PORTABILITY.md` FR11 可拒面句收正（可拒面 = 仅「档非法」）+ `SPEC-MANIFEST.md` ②.2 / AC-M1-2 的态名与报明口径。**裁：受理——主 agent 笔；时点 = 批准后随实施（§1 裁定 4）**
5. **desktop 面引文**（`IPC.md:310 · :315` · `UI.md:525`）：桌面台账/批档通道的拒绝措辞引用旧锚句。**裁：受理——归桌面文档轮（§1 裁定 5）**
6. **`doc-check` 第二份发现实现**（`scripts/doc-check.mjs:36-45 · :75-79`）：判据应为「显式 `--root`」，与核解耦。**裁：受理——另批（§1 裁定 6）**

**修正轮（§3 轮次 1 · 11 号）落盘**：① 翻转面口径一致（§2.2 / §2.5 / §2.8 / §2.9 面）· ② 失败码零 `ambiguous` 契约残留（F1 树 / KD-M1-26 / M1-28）· ③ 态名同 class 收口（四档逐处）· ④⑪ 数字随实读（行 8 / 行 16）· ⑤ 三路落点与 Δ（行 13–15）· ⑥⑦ 先例与调研（上节）· ⑧ 模块列 + L7 复核（表下）· ⑨ 状态行 / 上抛项对齐 §1 · ⑩ 旧锚残骸删（`BATCH-RECORD.md:272`）。

**修正轮（§3 轮次 2 · 7 号）落盘**：① L7 回填——状态行 + 本表下 L7 句改记「4 > 2 ⇒ 已裁拆批（M1+M2 留批；M3+M6 另批）」，行 5 / 7 / 8 标「移入 `docs/batches/2026-10-15-mpa-residual.md`」；② `TOOLS.md` §6.13 条 4 实景收正（实盘读数：一级带档 **2** = `thincoder` ∥ `thincoder.com` ⇒ `workspace`；A9 / AC-44 维持）；③ 测试面随测试树状态收正（`thincoder-core/test/` 实读 = `run.mjs` / `slow.mjs`；`TOOLS.md` §6.13 :390 / :391 / :415 / :417–:421 死指针改述 + 用例表题头对齐 A14–A22）；④ `TOOLS.md` :345 / :361 / :388 三处宿主改指 `manifest-discovery.mjs`（经 `manifest.mjs` 转口）；⑤ BR 枚举对齐「BR-39–BR-42」（`BATCH-RECORD.md` §4.8 实档）；⑥ §1:15 前提句 = §1 面——归主 agent 落笔（本席零动该行）；⑦ `git.mjs` 行数统一 = 现读 **403**（`MANIFEST.md` 行 18 两处随正）。

## §3 设计评审（评审子代理）

### 轮次 1（评审子代理）

| # | Category | Severity | Issue | Suggestion |
|---|----------|----------|-------|------------|
| 1 | Document ownership | 🔴 | 「可拒面」同机制两处相抵（同档内）：`thincoder/docs/core/design/MANIFEST.md:501` 仍作「**拒翻**（模式保持 OFF；文案锚 `/项目不可解析/`）」，`:291`「仍拒 = 歧义 / 档非法两格」、`:537`「**可拒面 = 歧义（多候选不猜）/ 档非法（fail-closed）两格**」、`:270`「翻转面拒翻不变（#41）」；与本批已裁已落的 `:112`「**翻转面处置**：`workspace` **不拒翻**——放行」、`:669`（AC-20④「档非法 → **唯一拒翻格**」）、`:693`（AC-44「翻转面 = **放行**」）、`thincoder/docs/batches/2026-10-15-multi-project-anchor.md:36`（「翻转面 `workspace` **不再拒翻**（可拒面收窄为仅「档非法」）」）相抵。按文档归属口径（同机制两处描述不一致 = 🔴，不降档） | 按已裁口径逐处收正：`:501` 该行改「放行（`agent.manifest` = null、模式 ON、不再出「项目不可解析」文案）」；`:291` 改「仍拒 = 仅「档非法」一格」；`:537` FR11 引文随需求侧同步拍改为「仅档非法」；`:270` 理由句删「翻转面拒翻不变（#41）」或改述为「拒翻面收窄」 |
| 2 | Document ownership | 🔴 | 决策树失败码契约同机制两处相抵：`thincoder/docs/core/design/MANIFEST.md:484` ∥ `:487` 仍作「歧义（≥2 候选）⇒ `{ ok: false, code: "ambiguous", … }`」，`:492` 非 ok 枚举含 `ambiguous`，`:271`（KD-M1-26）「`no-project` / `ambiguous` ⇒ 报明行」、`:273`（KD-M1-28）「决策树失败码 = `no-project`（梯⑤）/ `ambiguous`（≥2 候选）」；与 `:110-111`（§2.2 契约：失败码枚举 `missing` / `invalid` / `no-project` / `workspace` / `init-failed`）、`:759`（T55 断言返 `{ ok:false, code:'workspace', candidates }`）相抵 | §2.8 F1 决策树两处码、非 ok 枚举、KD-M1-26 / KD-M1-28 的态名一并收正为 `workspace`，与 `:110-111` 契约行与 T55 对齐 |
| 3 | Document ownership | 🟡 | 态名收正未收口（术语级残留，行为句与新语义一致、名未收正）：`thincoder/docs/core/design/TOOLS.md:355`「某级 ≥2 = **歧义**（列该级全部候选，**不猜**）」（同节 `:361` 已作 `kind` ∈ `self` / `unique` / `none` / `workspace`）、`:380`「≥2 ⇒ 歧义 throw」、`:389`「解析序（workdir / 发现 / 歧义 throw）」；`MANIFEST.md:268`（KD-M1-23「从 `unique` 变 `ambiguous`」）、`:754`（T50「① 歧义（两候选）」）、`:187` ∥ `:188`（§2.3 行「`openLedger` 歧义拒」∥「歧义锚检查」）；`LEDGER.md:454`「**歧义命中排除**——§7.2」。本批条目 1 自称「全部消费面态名同步」 | 逐处把旧态名收正为 `workspace`（行为判据句不动）；判据/契约表内的残留优先（实施者按表落码） |
| 4 | Affected-file annotations | 🟡 | 受影响文件表 `thincoder/docs/batches/2026-10-15-multi-project-anchor.md:76` 第 8 行 `thincoder-core/agent-tools/advisor.mjs` 现况列 = 「—」（无现行行数；其余来源行皆有），该行 tier（500/800）不可判 | 补该行现况行数（实读值即可，Δ 列已给 ≤ +2） |
| 5 | Clarity | 🟡 | 翻转面落点只列 `eng.mjs`（`:80` 第 12 行，Δ ≤ +6）；而 AC-20（`MANIFEST.md:669`）与 T53（`:757`）断言四路（核心 `eng` 工具 ∥ `/eng` ∥ `/session` ∥ ACP）同判「工作区放行」。`cmd-eng.mjs` ∥ `cmd-session.mjs` ∥ ACP 档的拒翻分支落点 / Δ 未在受影响表出现；若三路零改（存在共享判定点），设计未写明该单点 | 补三路落点与 Δ；或写明三路与 `eng.mjs` 共享的判定单点位置以证零改 |
| 6 | Closest-precedent check | 🟡 | 设计（§2）无「最接近先例」行：无先例坐标（实现坐标 ∥ 对应设计档节 ∥ 先例批次）+ 对齐/偏差说明；本批确有有意偏差（推翻 #188「歧义 ⇒ 拒翻」腿，`thincoder/docs/batches/2026-10-15-multi-project-anchor.md:112`），亦未按该行形明写。同族先例行在盘（`thincoder/docs/core/design/DESIGN-TOKEN-SETTLEMENT.md:153`「**最相近先例**」；`TOOLS.md:1184`「#### 先例调查结论」） | 补「最接近先例」行：先例坐标 + 对齐面 ∥ 偏差面（#188 腿的推翻理由） |
| 7 | Survey-evidence check | 🟡 | 设计（§2）无「调研证据」行：未记所查公开来源档（独立文档仓优先）∥ 是否相关（「无相关」亦须在档），全档 `先例` / `调研` / `参考系` 零命中 | 补调研证据行（所查来源清单 + 结论句、含「无相关」形） |
| 8 | Methodology | 🟡 | L7 护栏取数面缺失：`thincoder/docs/core/design/BATCH-RECORD.md:351`（L7 口径 = §2 受影响文件表「M 族模块」列去重）∥ `:357`（「取数面 = 本批 §2 受影响文件表的**模块列**……**设计档行一并计入**」；判定时点② = §2 表落表后复核，>2 ⇒ 停下上报 + 拆批 + §1 补记）。本批 §2 表无模块列、无 L7 复核结论；受影响面跨 M1/M2/M3 档面与产品面 | 补模块列 + 去重计数与结论句（≤2 ⇒ 在档；>2 ⇒ 拆批依据 + §1 补记） |
| 9 | Clarity | 🟡 | §2 状态行（`thincoder/docs/batches/2026-10-15-multi-project-anchor.md:23`）仍作「上抛 6 项待父侧裁」，`:85` 仍作「登记（待父侧裁）」，`:117` 仍作「### 上抛项（待父侧裁）」；而 §1 `:9` 已「上抛 6 项逐项裁」并在表（`:11-18`）逐项落裁 | §2 状态行与上抛项指针对齐 §1 裁定表（加「裁」列或改述为「已裁——见 §1」） |
| 10 | Doc hygiene | 🟡 | 规范面（逐字文案 / 机检锚行）残留已作废旧形：`thincoder/docs/core/design/BATCH-RECORD.md:272` 「2026-10-15 收正——原机检锚 `ambiguous session anchor` 随之作废」；该历史已在同档行为变更登记 `:281` 在档（历史归记录面） | 删净该行内旧锚形残骸，只留现机检锚 `belongs to no project` |
| 11 | Affected-file annotations | 🔵 | 标注数字 spot-check：设计档 7 档行（`:81`）作 `MANIFEST.md` 800 / `BATCH-RECORD.md` 503 / `TOOLS.md` 1341 / `LEDGER.md` 474，`:85` 作「现 800 行、本批 ≈ +60 ⇒ ≈860」；读盘为 781 / 490 / 1247 / 455（差 13–94 行，超设计自注的 ±1 计法差）。来源（产品）行数因实施面按声明排除，本次未核 | 用实读复核值替换表内 4 个设计档行数与「≈860」推算；产品档行数同法复核（本审面未含） |

计数：🔴 2 · 🟡 8 · 🔵 1（合计 11；文档地图 / 独立项目标准档未声明 ⇒ 文档归属与规范面按 AGENTS.md 与在档设计规范判，实施面按声明排除）。

VERDICT: changes-required

### 轮次 2（评审子代理）

| # | Category | Severity | Issue | Suggestion |
|---|----------|----------|-------|------------|
| 1 | Methodology / Doc-state | 🟡 | §2 的 L7 状态停在裁定前：`thincoder/docs/batches/2026-10-15-multi-project-anchor.md:31`「L7 复核 = 4 > 2 越界——待父侧处」∥ `:102`「**待父侧处（L7 判定权 = 主 agent）**」，而 §1 `:24`「**裁定：拆批**」+ `:26`「**本批（multi-project-anchor）保留 = M1 + M2**」已裁且已补记各批边界；受影响表行 5 / 7 / 8（M3 ∥ M6）无「移出本批」标注 | 按 §1 裁定回填 §2：状态行与 `:102` 的 L7 句改记「4 > 2 ⇒ 已裁拆批（M1+M2 留批；M3+M6 另批）」；行 5 / 7 / 8 加「移入 `docs/batches/2026-10-15-mpa-residual.md`」标注 |
| 2 | Acceptance criteria | 🟡 | 同一实景两处期望相抵：`:124`（A9）断言 `d:\teamcode` 处 git 面 ⇒「throw 报明 + 下辖 N 仓全列 + 指 `workdir`」，而 `thincoder/docs/core/design/TOOLS.md:354` 记该实景为「本工作区 = 一级（13 个直接子目录含 `.git`，带 manifest 者**恰 1** = `thincoder`）」⇒ 按 `MANIFEST.md:83` 的仓梯判据（「② 直接子目录中 `.git` ∧ 带档者恰一 ⇒ 命中（≥2 ⇒ `workspace`」）应为 unique ⇒ 重定向 + 注记（不 throw）；`MANIFEST.md:693`（AC-44）的「git = 报明 + 指 `workdir`」同此。两者不可同真 | 二者取一收正：若实盘带档（含 `.git`）子目录 ≥2 ⇒ 收正 `TOOLS.md` §6.13 条 4 的实景记录；否则把 A9 / AC-44 的 git 格改为「unique ⇒ 重定向 + `(repo: …)` 注记」并核 T78 ⑤ 措辞（开工前以现盘读数判） |
| 3 | Doc-state (cross-file) | 🟡 | 测试树状态两处相抵：`:109`「`thincoder-core/test/` 现仅 `run.mjs` / `slow.mjs`（per-face 单元测试树已清退场）」，而 `TOOLS.md:417`「新档 `thincoder-core/test/git-repo-discovery.test.mjs`（**已落**」∥ `TOOLS.md:418`「`thincoder-core/test/manifest.test.mjs` 增 T41 / T42」；本批测试面口径（新档落 `docs/batches/`、无既有用例需同步）正建立在该状态判断上 | 二选一收正：若 per-face 树已清退 ⇒ 收正 `TOOLS.md:390 / :417 / :418` 的测试落点（改指现址或删死指针）；若未清退 ⇒ 收正 `:109` 并补既有用例同步口径 |
| 4 | Doc-state (coordinate lag) | 🔵 | `TOOLS.md:345`「**源逻辑现址**：`thincoder-core/manifest.mjs:44-56`」∥ `TOOLS.md:388`（落位表把 `discoverRepos` / `resolveProjectRoot` 记在 `thincoder-core/manifest.mjs`）仍指拆分前宿主；拆后宿主 = `thincoder-core/manifest-discovery.mjs`（`MANIFEST.md:212`「发现族（两梯 + 私有内核 + `owningProject`）⇒ `thincoder-core/manifest-discovery.mjs`」，经 `manifest.mjs` re-export） | 两处补「经 `manifest.mjs` 转口」注或改指 `manifest-discovery.mjs`（A20 的 import 断言与本批行 1 落点均以拆后现址为准） |
| 5 | Doc hygiene (enumeration) | 🔵 | 同一 BR 族枚举不一：`:58` 落点行作「§4.8 BR-39/40/41」，`MANIFEST.md:686`（AC-36②）作「`BATCH-RECORD.md` §4.8 BR-39–BR-42」；`BATCH-RECORD.md:170`（BR-42 = 工作区锚 `ok`/`none` 回归格）在档 | 对齐枚举（工作区锚族 = BR-39–BR-42 四行，或两处同列三行） |
| 6 | Doc-state (numeric drift) | 🔵 | §1 裁定表 `:15` 仍携旧前提「`MANIFEST.md` 行数（800 ⇒ ≈860）」与「超 800 为既定文档现实」，而 `:98` / `:105` 已改实读 **781**（本审读盘复核 = 781 ✓，未触 800）；裁定本体（准代码口径）不受影响 | 以实读值改写 `:15` 前提句（或删「超 800」半句），使 §1 与 §2 同数 |
| 7 | Affected-file annotations | 🔵 | 同一文件两套现值：`:88`（行 6）`thincoder-core/tools/git.mjs` = **403**（`:104` 贴线判「403 ⇒ ≈409」），而 `MANIFEST.md:175`（行 18）= **416** ∥ `MANIFEST.md:215`「（≈423）」——两档各自记为实读值。任一取值下 Δ 后均 < 500，不触拆分义务 | 开工前按现盘复读一次行数，统一两档数字（并保持 `:104` 贴线判同源） |

计数：🟡 3 · 🔵 4（合计 7；无 🔴）。修正轮 #18 复核：轮次 1 的 11 条中 10 条到位（① 翻转面口径一致 ∥ ② 失败码零 `ambiguous` 残留 ∥ ③ 态名收口 ∥ ④⑪ 数字随实读 ∥ ⑤ 三路落点与 Δ ∥ ⑥ 先例 ∥ ⑦ 调研 ∥ ⑨ 状态行 / 上抛对齐 ∥ ⑩ 旧锚残骸删），1 条待随裁定回填（#8 → 本表 #1）。核查面限制：文档地图 / 独立项目标准档未声明 ⇒ 文档归属与规范面按 `AGENTS.md` 与在档设计规范判；设计档行数读盘复核 = `MANIFEST.md` **781** ✓ ∥ `TOOLS.md` **1247** ✓ ∥ `LEDGER.md` **455** ✓ ∥ `BATCH-RECORD.md` **490** ✓（`LIGHT-CHANNEL.md` / `ADVISOR-GUARDS.md` / `DESIGN-TOKEN-SETTLEMENT.md` 三档不在本审面——未核）；产品（实现）面行数与坐标按评审声明不在本审面（未核）。

VERDICT: pass

## §4 用户批准（主 agent）

**用户批准**：2026-10-15 23:54「**批**」（11 批队列放行——本批实施轮 eng-coder#48 在其列）。
**实施面**：M1（四契约态名 `ambiguous` ⇒ `workspace` 六出口 ∥ 四报文面事实化）+ M2（翻转放行四路 ∥ 可拒面收窄至「仅档非法」）+ 裁定 a 两行（`review-facts.mjs:149` ∥ `batch-paths.mjs:30`）；14 源档 + 测试档。
**面外**：create 文案面（A3/AC-44）⇒ 轮作 **mpa 余者批**（`docs/batches/2026-10-15-mpa-residual.md`——已交付收口）；需求面零改。

## §5 实施记录（eng-coder）

### 5.1 交付摘要

本批 = **M1 + M2**（§2 行 1–4 ∥ 6 ∥ 9–15 + §1 裁定 a 的补列行 18–19 + 单元测试档）。改动面 = **14 个源档 + 1 个测试档**，全部落在 §2 受影响文件表 + 裁定 a 授权面内。

| 面 | 落点 | 交付 |
|---|---|---|
| 四契约态名 | `manifest-discovery.mjs`（两梯 `kind` + `projectRootView.state`）∥ `manifest.mjs`（`projectView.state` + 决策树 `code`） | `ambiguous` ⇒ **`workspace`**——六处出口同步 |
| 报明行事实化 | `agent/setup-reminders.mjs` | 五变体逐字（`MANIFEST.md` §2.6 条 1b）；`none` / 单活体 / 幂等零改 |
| read / 拒面文案 | `agent-tools/manifest.mjs` | 态名 + `ambiguousReason` ⇒ `workspaceReason` + `target` 参数文案 + read 行注 |
| git 消息 | `tools/git.mjs` | `ambiguousRepoMessage` ⇒ `workspaceRepoMessage`（去 `Ambiguous` / `no silent pick`）；两档变体按 `matched` |
| ledger 族 | `ledger-db.mjs`（工作区报明）∥ `ledger.mjs`（族发现跳过条件）∥ `agent/light-round.mjs`（候选跳过） | 报明事实 + `cwd=<目标项目根>` 下一步；读 / 写五工具同门、**零写** |
| 翻转放行 | `agent-tools/eng.mjs` ∥ `cmd-eng.mjs` ∥ `cmd-session.mjs` ∥ `acp/handlers-slots.mjs` | 可拒面收窄至**仅「档非法」**；放行 ⇒ `agent.manifest = null`（零附着） |
| 裁定 a 补列行 | `agent-tools/review-facts.mjs:149` ∥ `agent-tools/batch-paths.mjs:30` | 1 token 行内替换（`"ambiguous"` ⇒ `"workspace"`）——补列行 18 ∥ 19 |
| 测试档 | `docs/batches/2026-10-15-multi-project-anchor.test.mjs`（新建 · 随批档保存 · 删除时零留存） | A1–A10 ∥ A12 共 **13 例** |

**专项披露（用户裁定 a ③ 逐字要求）——超 §2 受影响文件表 · 2 行 · 归因 = L7 拆批边界错置（改名与比较点被切开）**：本批除 §2 表列档外，另收正 `review-facts.mjs:149` ∥ `batch-paths.mjs:30` 两行 state 比较（各 1 token，行内替换、Δ 0）。归因 = 态名改名本体与其比较点被 L7 拆批边界切开（改名随本批、比较点原判给 `mpa-residual`）⇒ 该两处不随改则**恒假**（A5 / A7 当场不可过、锚处批档建当场停手 = 本批要消灭的缺陷本体）。已由 §2 修正轮补列行 18 ∥ 19 并记入 §1 裁定 a。两行以外**一律未碰**（`ambiguousCandidates` / `ambiguousCreateError` 更名与文案 / `advisor.mjs` 面 / `scripts/doc-check.mjs` / desktop 面引文 / 需求档 = 归 `mpa-residual`）。

### 5.2 读数（本批实测）

| 项 | 命令 | 读数 |
|---|---|---|
| 靶向单测 | `node --test docs/batches/2026-10-15-multi-project-anchor.test.mjs` | **13 / 13 pass**（A1 ∥ A2 ∥ A3 ∥ A4 ∥ A5① ∥ A6 ∥ A7 ∥ A8 ∥ A9 ∥ A10①②③ ∥ A12） |
| 既有测试门 | `node test/run.mjs`（`thincoder-core` ∥ `thincoder-cli` ∥ `thincoder-vscode`） | 三条 **exit 0**——「test manifest is empty — zero tests = green」（per-face 树已清退场，与本批零冲突） |
| 语法门 | `node --check`（15 档逐个） | 全 **OK** |
| 行数 Δ 对位 | 读盘 `\n` 计数 vs §2 表「现况」 | 8 档相符；6 档表值比实读 **+1**（`git.mjs` 403/402 ∥ `agent-tools/manifest.mjs` 201/200 ∥ `review-facts.mjs` 159/158 ∥ `batch-paths.mjs` 207/206 ∥ `ledger.mjs` 187/186 ∥ `light-round.mjs` 67/66）——最高增量档 `git.mjs` 实读 **402**（贴线判 ≈409 更宽裕）；全列 < 500 顾问线 |
| 实景前提复核 | 读盘 `d:\teamcode` | 锚**无** `.git` / **无** `PROJECT-MANIFEST.json`；8 个子目录中 4 含 `.git`（`.wt-head-probe` · `thincoder` · `thincoder.com` · `thinworker`）、2 带档（`thincoder` · `thincoder.com`）⇒ 两梯 `workspace` 前提成立（A1 / A9） |

**落地差异披露（不靠父侧转述）**
1. **A3 五面本批跑四面**：情境行 ∥ `manifest read` ∥ `ledger` ∥ git 四面零命中 `ambiguous` ✓；`batch` create 文案面归 `mpa-residual`（§2 行 5 + 裁定 a ②）。现盘 `batch-paths.mjs:101` 仍为 `batch: ambiguous session anchor — create target "…" belongs to no candidate project; …`——既含禁字 `ambiguous`，也不含 `BATCH-RECORD.md:272` 的机检锚 `belongs to no project`（且 :268 已明书「不得写 `ambiguous`」）。⇒ 本批 **A3 / A5 无语标格 / AC-44 三行的该面按字面未过**，须由父侧文档层补例外注（点名该面归 `mpa-residual`）或把该面验收整行移入该批。
2. **A10 四路的运行面 = 2 / 4**：跑得动 `eng` 工具 ∥ `/eng`（A10①②）；`/session` ∥ ACP 两路以**源面**判据代（A10③，含「零附着落点」逐条钉：`ctx.agent.manifest = r.ok ? r.manifest : null` ∥ `else agent.manifest = null` ∥ `manifestAfterSwitch = r.ok ? r.manifest : null` ∥ `if (targetEng) agent.manifest = manifestAfterSwitch` ∥ ACP `reattach` 零改）。未跑运行面之由：`/session` 需整槽落盘夹具（`switchToSlot` 走 `loadManifest` / `loadSlotFile` 真盘面）∥ ACP 的判据点**先于会话建立**（该处无 agent 面可观测状态，放行只体现为「不早返错」）。
3. **A11 零写** = 由 A6 / A8 内 sha256 前后对比代（manifest 档 ∥ 台账库档未被建 / 未被改）；未单列一例。
4. **A5 目标格**（`thincoder/docs/batches/x.md` ⇒ 落其基底）= 运行面已跑（A5①）。

### 5.3 决策透明表

| 决策 | 依据 | 备选（被拒因） | 影响 |
|---|---|---|---|
| 放行分支**显式**置 `agent.manifest = null` | AC-20③ 字面「`agent.manifest === null`」+ `MANIFEST.md` F2 表（放行 = null + 事实行） | 只做「不赋值」（改动更小）——被拒：AC 字面不成立（评审轮 1 命中），且槽切换时旧值会残留 | 三路 +1 行；测试档 A10① 断言由 `undefined` 收正为 `null`，并加「拒面不动旧值」零副作用断言 |
| 翻转面**不记** `agent._projectView` | `MANIFEST.md` F2 表（§2.8 放行行 = `agent.manifest` = null + 事实行）∥ §2 落点表（逐行只写「拒判据收窄」）∥ 入档钩子面已记（`make-agent` / `agent-assemble` / vsc `setup`） | 四路各加 import + 1 行记态——被拒：与 F2 表「谁在何处赋值」相抵，且超 §2 落点表范围 | **`MANIFEST.md:112` 另书「`agent._projectView` 记态」⇒ 同机制同档两处相抵**——报父侧 / 设计档裁定（[上抛·知会]），本批按 F2 表落 |
| 不触 `batch-paths` create 文案 ∥ `review-facts.mjs:145` 注释态名 ∥ `CHANGELOG.md:147` 旧态名 | 裁定 a ②「只此两行 · residual 其余面一律不碰」；`:145` 注释属「该档余面」 | 顺手收正 1 token——被拒：超 `review-facts.mjs` 行 18「1 token：`"ambiguous"` ⇒ `"workspace"`」的授权面 | 三处残留均已在本文披露；前两处归 `mpa-residual`，`CHANGELOG.md` 面请父侧判定归属 |
| 测试档 A12 判据取**调用形** `readdirSync(` | 裸字面量在该档另有 import 行与 JSDoc 提及两处（非落点）；原判据「全档恰 1 处」对任何带 import 的实现恒假 | 照抄裸字面量判据——被拒：恒红、不可机判 | 判据可机判且真钉「恰 1 处调用居 `scanChildren` 体内」 |

### 5.4 审计与代码评审轮次与终态

| 轮 | 类型 | 结论 |
|---|---|---|
| 审计 1 | 内部 explore 分歧审计（交付码 vs 设计） | 命中 **1 🟡**（四路放行只做 `r.ok` 赋值 ⇒ A10 的 `agent.manifest === null` 字面不成立）+ **1 🔵**（`_projectView` 两处描述相抵）；PARTIAL 其余 / SILENT-SIMPLIFICATION / OUT-OF-LIST / DOC-DRIFT **零命中**；越列判定 = 表内 15 档对位、表外零多改 |
| 修复 1 | 自修（详见 5.3 第 1 行） | 三路显式置 null + 测试档断言收正 + A10③ 加四条源面落点断言 |
| 评审 1 | 内部 advisor 代码评审（15 档 + 4 文档） | **VERDICT = changes-required**（🟡 2 · 🔵 1 · **无 🔴**）：① 🟡 = A3 / A5 / AC-44 的 create 文案面与本批「五面零命中」相抵（本表 5.2 差异 ①）；② 🟡（must fix）= 本文（§5）为空——用户裁定 a ③ 的披露与测试档两处「见批档 §5」指针无落点 + A10 四路只跑两路；③ 🔵 = `review-facts.mjs:145` 注释旧态名 |
| 修复 2 | 自修（本轮） | ① 本文补齐（5.1 专项披露 + 5.2 差异 1–4 + 5.3 决策表）——三面均在本文留痕、无静默；② A10③ 补零附着落点源面断言（代运行面判据）；③ 🔵 **按裁定 a ② 不修**（该注释属行 18「余面」，另批承接），已在 5.3 披露 |

**终态**：`clean`（待评审轮 2 复核本轮修复声明后落定）。

### 5.5 评审轮 2（复核修复声明）与终态

| 轮 | 类型 | 结论 |
|---|---|---|
| 评审 2 | 内部 advisor 代码评审（轮 2——**只复核修复声明**；面 = 批档 §5 ∥ 测试档 ∥ 翻转四路 ∥ `review-facts` ∥ `batch-paths`） | **VERDICT = pass**：**🔴 0 · 未决 🟡 0** · 新 🔵 1（`git.mjs` 行数三处取值不一 402 / 403 / 416——零行为影响，已在 5.2 自陈）＋ 2 项收口。轮 1 唯一 must-fix（§5 空）判 **Fixed**；修复面未引入新 🔴 |

**终态**：**`clean`**（评审轮 2 判 pass；本批无未决 🔴 / 🟡）。

**留父侧两项（不阻塞本批；收口前登记即可）**
1. **A3 / A5 无语标格 / AC-44 的 create 文案面例外注**（点名该面归 `mpa-residual`）：A3 行现文仍把 `batch` create 文案列为本批零命中面，而该面按裁定 a ② 由另批承接 ⇒ 该三行按字面在本批不能判全过，须父侧文档层补例外注（或整行移入该批）。
2. **`MANIFEST.md:112`「`agent._projectView` 记态」∥ F2 表相抵**（同机制同档两处）：需设计档侧收正；本批按 F2 表落——翻转面未记 `_projectView`。

## §6 验证与收口（父代理）

**收口（父侧 · 2026-10-16）**

**① 验证读数（本批验证行）**：批内件 `node --test` = **13 tests / 13 pass / 0 fail**；advisor 代码评审 = 轮 1 changes-required（1 项）→ 修 → **轮 2 pass**；终态 **clean**；`amb`/`歧义`/`ambiguous` 残留扫 = 零（测试件断言 + 审计确认）；集成测试 = **未跑**（本仓无集成档——如实记「未集成验」）。

**② 集成场景影响**：无 —— 门面/契约态名与报文面，无业务场景增删。

**③ 核销结算**：台账 **#1475**（锚行——四消费点停手）→ 已核销；同批件随 §5 落定；create 文案面已由 mpa 余者批（`2026-10-15-mpa-residual.md`）承接收口 ✓。

**④ 暂缓批复核**：无。

**⑤ 结算同步清单**：角色表 ✓ ∥ 状态行 ✓ ∥ 计数（M1 六出口 + M2 四路 + 裁定 a 两行）✓ ∥ 指针（#1475 指本档）✓ ∥ 待办勾销 ✓ ∥ 前批遗留交叉核（无）✓。

**⑥ 上抛与知会处置**：① 原 §3 轮次 2 记的「13 子目录含 `.git`」与现盘不符（现盘 4 含 `.git` ∥ 2 带档）⇒ **按盘收正**：本档 §3 = 评审子代理笔（本席不改其段），故更正落此行——**列数口径 = 现盘实读 4 ∥ 2**；② `MANIFEST.md:112` 与 F2 表相抵 ⇒ 设计档面随正，**入册 #1510 族**；③ `CHANGELOG.md:147` 旧态名 ⇒ 记录面随正，**入册 #1510 族**；④ 工作树 174 档他批未提交改动 = 非本批（提交时按路径限定）。

**⑦ 结算行**：台账 #1475（+ 同批件）→ 已核销。
