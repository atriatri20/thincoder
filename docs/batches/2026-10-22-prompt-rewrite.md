# 2026-10-22 · prompt-rewrite
> 六段 append-only，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 编制：主 agent · 2026-10-22 · 来源 = 用户 2026-10-22 12:28「你让一个 MoE 模型去看一端 3000 多字的提示词，它能看明白啥？」+ 12:31「改法对，就照这个来」；需求 §13.24（FR46）。
> 台账 = #1735（PROMPT-SYSTEM · 归批）。前情 = 无（独立批）。
## §1 讨论（主 agent）
**状态行**：已收口 2026-10-22
<§1 模板占位：本批条目 / 关键判据 / 授权口径>
## §2 批次任务与设计（eng-designer）
**状态行**：设计完成（评审 #16 九条已落 · 三族实扫 13 行逐处归类 · gate 以盘上新引擎直跑 PASS（0 命中））
<§2 模板占位：本批条目（覆盖） / 设计档落点 / 机制设计 / 受影响文件与测试覆盖 / 验收对照 / 关键决策 / 上抛项>

**状态行**：✅ 设计完成（2026-10-22 · eng-designer）

**派单形态说明**：本席派单时 §1 仍为模板占位；本段按派单任务书（`#12` 评审四条 + 验收 ①–⑥）执行，条目与依据逐条列在下方，可与 §1 收口后对读。

### 本批条目（覆盖）

| # | 条目 | 判据 / 落点 |
|---|---|---|
| 1 | `#12` 评审 🔴：(m, off) => m` §3.18 仍描述已删的行宽「过渡豁免」 | 同档 §3.18（括注 · 独立块 · 边界句三处） |
| 2 | `#12` 评审 🟡：§3.20 ① 抽取面补第三免（提示词面六个 CANON 操作数） | 同档 §3.20 ①「抽取面三免」 |
| 3 | `#12` 评审 🟡：模型可见契约未写锚面的操作数豁免 | 设计 = 同档 §3.20 ①「模型可见契约」段（逐字目标形）；**落笔 = eng-coder**（`thincoder-core/tool-docs/doc_check.md` = 英文运行面 · 写域外） |
| 4 | `#12` 评审 🟡：剥除面窄于「提示词面」定义 | 设计 = 同档 §3.20 ①「面界差」条（**登记为接受差异**，理由三条 + 解除条件） |

**不在本批**：不改 `OPERAND_FACE`（产品代码）· 不改提示词档正文 · 不改需求档 · 不清 `prompts/**` 的宽度存量。

### 设计档落点

`docs/core/design/DOC-DISCIPLINE.md` §3.18 条目 Q · §3.20 条目 S ①。判据句单源仍在本档——`thincoder-core/doc-check/anchors.mjs:4` 的自称单源由此对齐（第三免在盘 = 有判据句可指）。

### 机制设计

1. **撤豁免（条目 1）**：§3.18 判据句改为「提示词面照判，无面级豁免」；「过渡豁免」独立块整块删（含 `PROMPT_FACE` / `isPromptFace` / `widthSkipped` 三条实现坐标与覆盖偏移读数）；边界句回退到「不改提示词档正文」。依据 = 需求 `docs/core/requirements/ENGINEERING-MODE-V2.md` §13.23（用户 12:23／12:24 令）+ `#12` 代码面已回退到 HEAD。
2. **补第三免（条目 2）**：抽取面免由两免扩为三免——③ 操作数 = 提示词面**先整串删六个 CANON 操作数再抽**；作用面**只** `thincoder-core/prompts/**`；`docs/` 面与 `tool-docs/**` 的同名 token 仍按指针判（四名另有 ① 类名免接住，`README.md` / `docs/core/design/MANIFEST.md` 两名在非提示词面照报）。「归一算术」同轮由「两免」改「三免」并改指实现坐标。
3. **契约落笔形（条目 3）**：契约句给**逐字英文目标形**，落点 = `Anchors —` bullet 之末；**六名以围栏字面列表给出**——未扩面时六名行内裸写会让该档自己落一条 `docs/core/design/MANIFEST.md` `档缺`（该面不剥）。此形 = 落笔后 gate 可过、且不伪造覆盖。
4. **面界裁定（条目 4）**：**接受差异，不扩面**。理由：① 剥除面是锚判自己的面判据，(m, off) => m` §6.6 的 J 族域是提示词引用判据的域——同树不等于同判据；② 现盘 `tool-docs/**` 六名裸名 2 处（`thincoder-core/tool-docs/advisor.md` 第 3 行 · `thincoder-core/tool-docs/verify.md` 第 1 行），basename 均落类名免，锚判 0 命中；
  ③ 扩面 = 产品代码改动 + 判据面变更，须独立批。**解除条件**：该面出现操作数裸名入判（真实假阳）⇒ 扩面，由产品代码批承接。

### 受影响文件与测试覆盖

| # | 文件 | 改动 | 笔 |
|---|---|---|---|
| 1 | `docs/core/design/DOC-DISCIPLINE.md` | §3.18 三处（净 −8 行）· §3.20 ①（三免 + 面界差 + 契约逐字块 + 归一算术） | 本席（已落） |
| 2 | `thincoder-core/tool-docs/doc_check.md` | 锚段续写契约句 + 六名围栏列表（逐字见 §3.20 ①） | **eng-coder**（英文运行面）——未落 |
| 3 | `docs/batches/2026-10-22-prompt-rewrite.md` | 本段 | 本席（已落） |

**测试覆盖**：本条**不新增判据、不改引擎** ⇒ 无单元测试档义务（判据改动词必配的护栏由 `#12` 自己的单元面承接；本席零代码笔）。**零改面**：产品代码 · 提示词档 · 需求档（`git status` 中该三类的 `M` = `#12` 及前轮遗留，非本轮笔）。

### 验收对照（回指本批验收 ①–⑥）

| # | 验收 | 读数 / 判法 |
|---|---|---|
| ① | §3.18 不再描述已删豁免 | 域内 grep 五串（过渡豁免 / 三个已删符号 / 行宽免判）⇒ **0**（实跑） |
| ② | §3.20 ① 第三免在册 | §3.20 ① 含「抽取面三免」+ ③ 操作数条 + 实现坐标；与 `anchors.mjs:4` 自称单源对齐 |
| ③ | 契约写明六名 + 只此一面 | 设计已给逐字目标形（§3.20 ①「模型可见契约」段）；**文件面待 eng-coder 落笔** |
| ④ | 面界二选一 | 已裁 = 接受差异（§3.20 ①「面界差」条，理由三条 + 解除条件） |
| ⑤ | 三档 `doc_check`（独立进程） | 见下读数表 |
| ⑥ | 零改 | 类别判法见「受影响文件」表 |

**三档 `doc_check` 读数（独立 node 进程 · `runDocCheck` 直调 · 引擎 = 盘上现盘）**：

| 档 | mode / docs | 读数 |
|---|---|---|
| 1 | gate · `docs/core/design/DOC-DISCIPLINE.md` | `PASS` · 0 命中（锚 0 / 行宽 0） |
| 2 | gate · `thincoder-core/prompts/common.md` + `thincoder-core/prompts/advisor-round1.md` | `REFUSED（61 = 行宽 61 · 锚 0）`——与 `#12` 撤豁免后读数逐数一致 |
| 3 | gate · `thincoder-core/tool-docs/doc_check.md` | `PASS` · 0 命中（契约未落笔，落笔后需复跑） |

### 关键决策

| # | 决策 | 理由 |
|---|---|---|
| K1 | §3.18 整块删，不留「曾经有过」注脚 | 活文档描述已删机制 = 读者照它核会核到空；历史住 git（D8 / 用户 10-15 裁定） |
| K2 | 第三免写进 §3.20 ①（判据单源），不写进 `anchors.mjs` 注释 | 实现自称单源在 §3.20；注释只作坐标，不承载判据 |
| K3 | 契约落笔 = 围栏字面列表，不行内裸写 | 未扩面 ⇒ `docs/core/design/MANIFEST.md` 在该面 `档缺`；围栏是引擎既有的字面免判形，不伪造覆盖 |
| K4 | 面界 = 接受差异（不扩面） | 扩面须改产品代码 + 判据面，本轮零改面（验收 ⑥）；差异有解除条件，不留「今天恰好没触发」的空白 |
| K5 | 契约落笔交 eng-coder | `thincoder-core/**` = 英文运行面 / 产品代码面，非设计笔 |

### 上抛项

- 〔父侧登记〕面界扩面（`OPERAND_FACE` 加 `tool-docs/**`）= 条件触发项（解除条件见 §3.20 ①「面界差」），台账由父侧决定是否预登记。
- 〔交接〕条目 3 的落笔 = eng-coder；本席已给逐字目标形与落点，实施面为机械粘贴 + 复跑第 3 档读数。

**状态行**：设计完成

**本批条目（覆盖）**：需求 `docs/core/requirements/ENGINEERING-MODE-V2.md` §13.24（FR46）四条验收——① 两舱每一行 ≤300（一次性 `node` 脚本改前改后读数）；② 语义对账映射表四列非空；③ `prompt-refs-check` 命中 0；④ 本设计档相反口径已收正。
设计落点 = `docs/core/design/PROMPT-SYSTEM.md` §6.45（§6.44 之后 · `## 7` 之前）：来源 / 要做的那一处 / 机制 / 三条手法 / 逐字围栏块（样板六行）/ 落点表（两舱逐档）/ 受影响文件表（16 档逐档现值 + 预期改后）/ 验收 A1–A4 / 连带项 C1–C2 / 体量读数 / 边界 / 关键决策 K1–K6 / 先例∥偏离 / 勘察证据行。

**本批不做**：FR45 引擎改造（`width.mjs` → `paragraph.mjs`，段判据）· 提示词语义与判据强度变更 · 新增规则 · 删除内容 · 改 `thincoder-core/tool-docs/**` / 产品代码 / 需求档 · 改本设计档 §6.40–§6.44 正文（`:476` / `:2818` 收正 = 实施轮的设计档笔）。

**受影响文件**：16 档提示词（逐档现值与预期 = 设计 §6.45 受影响文件表，此不重抄；其中 13 档有 >300 行、3 档现值即达标）· `docs/core/design/PROMPT-SYSTEM.md` §6.45 新增 · 实施轮两处收正 `:476` / `:2818`。
**推进次序**：甲舱（9 档）先行，乙舱（7 档）随后；单舱一单。

**验收对照**：A1–A4 = 设计 §6.45 验收表（判法逐条在场）；改前读数 = 设计 §6.45 落点表（16 档 / 290 行 >300 / 最长 1,486）。
**关键决策**：K1–K6 = 设计 §6.45 关键决策表（两舱先行 / 重写不折行 / 样板过线 / 映射表落 §5 / 行界只读数 / 两面块定义不同）。
**上抛项**：无。

**门读数**：`doc_check(mode:"gate", docs=["docs/core/design/PROMPT-SYSTEM.md"])` 本会话返回 `ERROR（引擎已更新…须重启会话后复跑）`——非命中，原因 = 并行批（FR45）在本会话启动后改写了 `thincoder-core/doc-check/` 引擎档；本席另以盘上新引擎直跑同档（读数见报告）。父侧重启会话后复跑 gate 为准。

**修正轮 1（逐字块收正为与 §3.20 ③ 同口径 · 2026-10-22 · eng-designer）**

**症状**：§3.20 ①「模型可见契约」逐字块原句把非提示词面一律读作「同一个 token 照判指针」——绝对话。实机不是这样：六名里的四名（`AGENTS.md` · `SKILL.md` · `.thincoder/advisor.md` · `project_rules.md`）在任何面都先落类名免
（`thincoder-core/doc-check/anchors.mjs:28`–`:31` 的 `FILENAME_CLASSES` · 逐 token 跳过 `:126`），只有 `README.md` / `docs/core/design/MANIFEST.md` 两名在非提示词面照报 `档缺`。同节 ③ 作用面（同档「③ 的作用面」条）写的就是这个口径 ⇒ ① 与 ③ 两套说法，而模型读到的是 ①。

**改动**：① 逐字块第 2–3 行收正——提示词面剥除后另起一句：其余面上六名中的四名按**类名免**放行（逐名列出），`README.md` / `docs/core/design/MANIFEST.md` 两名仍按指针判。围栏形不变（`~~~text` 外层 · 内层六名 `text` 列表）；改后块体 4 行 + 六名列表，最长行 131 字符（读数）。

**实施面随动**：`thincoder-core/tool-docs/doc_check.md` 那一格须按收正后的逐字块**整格重贴**（现贴 = 旧形，与设计档不再逐字相等）；笔 = eng-coder。

**零改面**：产品代码 · 提示词档 · 需求档 · `tool-docs` · §3.20 ③（本席零笔）。

**门读数**：独立 node 进程（产品引擎 `runDocCheck` 直调 · `staleEngineFiles` = `[]`）⇒ `DOC-CHECK GATE: PASS` · 0 命中（锚 0 / 行宽 0）。

### 设计修正轮 · 评审 #16 收口（eng-designer · 2026-10-22）

**派单**：评审 #16 判 changes-required（🔴1 · 🟡7 · 🔵2）；落在设计档的九条 = #1 #2 #4 #5 #7 #8 #9 #10（#3 / #6 经父侧改需求档，本席只做设计档随正）。

**设计档落点（全部在 `docs/core/design/PROMPT-SYSTEM.md` §6.45 + §7 D-PS45）**

| # | 位置 | 改了什么 |
|---|---|---|
| 1 | §6.45 F3 行 | 「两处」⇒ 三族实扫的六处坐标；指向连带项 C 表 |
| 2 | §6.45 机制第 5 条 | 新增「理由单独一行、以 `Why` 起头」（三条手法计数不变，与需求 §13.24 一致） |
| 3 | §6.45 落点表列头 | 「超 300 行数」⇒「超 300 字符行数」 |
| 4 | §6.45 受影响文件表列头 | 「>300 行」⇒「>300 字符行数」 |
| 5 | §6.45 推进次序下 | 新增「批次结构（两舱 = 两批）」段 |
| 6 | §6.45 A2 | 四列判法改「每列都要有判断（无内容写「—（本条无）」，不许编）」；落点写「甲舱落本批 / 乙舱落乙舱批」 |
| 7 | §6.45 A4 | 改判「三族子串全档零命中」，判域排除本行自身 |
| 8 | §6.45 连带项（整块重写） | 执笔方 + 轮次 + C1–C6 六行 + 逐字目标行六条围栏块 + 三族定义 + 不在射程五类 |
| 9 | §6.45 体量读数末句 | 「只作读数」⇒ 合计行数 / 字符数是体量读数，验收线只有 A1 / A2 两条 |
| 10 | §6.45 边界 | 改「§6.19 / §6.25 / §6.26 / §6.44」与「设计席修正轮的设计档笔」 |
| 11 | §6.45 关键决策 | K4 随 A2 改；新增 K7（两舱 = 两批）· K8（C 表一次性：落笔后删表 + 删 F3 行） |
| 12 | §6.45 先例∥偏离 | 新增「先例批次坐标」行；偏离 ②③④ 各补「既有形为何不适用」 |
| 13 | §6.45 勘察证据行 · 上抛项 | 「两处」读数 ⇒ 六处；上抛项改「无」并写明执笔与轮次已定 |
| 14 | §7 D-PS45 | 「两处（实施轮的设计档笔）」⇒「三族六处（设计席修正轮的设计档笔）」 |

**三族实扫（`node` 实读 · 改后 · 未落笔）**：命中 **13 行** = 正文 6 + 本节自携 7。

| 族 | 子串 | 命中行 |
|---|---|---|
| ① 不在行宽机检域 | `不在行宽机检域` / `行宽机检域` | 正文 `:476` `:627` `:653`（C1 / C3 / C4）· 本节自携 `:3002` `:3010` `:3012` `:3056` |
| ② 披露不行使 | `披露不行使` | 同族①诸行（正文三行 + 本节自携） |
| ③ 行数不作断言 | `行数不作断言` / `行数是排版副产品` / `只作排版读数` / `行数不作验收条` | 正文 `:2818` `:2849` `:2870`（C2 / C5 / C6）· 本节自携 `:3002` `:3011` `:3014` `:3015` `:3056` |

口径：正文 6 行 = C 表落笔对象；本节自携 7 行（A4 行 1 + C 表行 5 + 三族定义 1）= K8 的删除对象 ∥ A4 判域排除项。逐处「不在射程」的五类（轻通道披露族 · 行面 Δ 附注 · `doc_check` 读数 · 阈值数值 · 改后预期）各给理由，见 §6.45 连带项末段。

**验收对照（回指派单 ①–⑩）**

| # | 验收 | 读数 / 位置 |
|---|---|---|
| ① | 三族扫全档、逐处进 C 表或写不在射程 | 13 行逐行归类（上表）+ 不在射程五类 |
| ② | 「两处」随实扫改 | F3 行 · 勘察证据行 · D-PS45 三处（如实写六处） |
| ③ | A4 改判三族零命中 | §6.45 A4 行 |
| ④ | C1/C2 给逐字目标行 | C1–C6 六条围栏块全给（不只 C1/C2）；实测字符数 110 / 130 / 175 / 158 / 150 / 88，均 ≤300 |
| ⑤ | 写明执笔方与轮次 | §6.45 连带项首段「执笔与轮次」 |
| ⑥ | 偏离 ②③④ 补理由 + 先例批次 | 各一句 + 「先例批次坐标」行 |
| ⑦ | 批次结构写死 | K7 + §6.45「批次结构」段：**两批**，甲舱 = 本批 |
| ⑧ | 两表列头改「字符」 | 落点表 · 受影响文件表各一处 |
| ⑨ | 「理由以 Why 起头」并入 | §6.45 机制第 5 条（手法计数不变） |
| ⑩ | `doc_check` PASS | 盘上引擎独立 `node` 进程 `runDocCheck(target, mode:"gate")` ⇒ `DOC-CHECK GATE: PASS` · `hits.total = 0`（anchors 0 / width 0 · 阈值 300 · 1 档全清） |

**受影响文件**

| 文件 | 改动 | 笔 |
|---|---|---|
| `docs/core/design/PROMPT-SYSTEM.md` | §6.45 十四处 + §7 D-PS45 一行 | 本席（已落） |
| `docs/batches/2026-10-22-prompt-rewrite.md` | 本段 | 本席（已落） |

**零改面**：提示词档 · 产品代码 · 需求档 · `§6.19` / `§6.25` / `§6.26` / `§6.44` 正文（六处收正 = 设计席修正轮的设计档笔，目标行只写在 C 表里）。

**关键决策（本轮新增）**

| # | 决策 | 理由 |
|---|---|---|
| A | C 表 = 一次性落笔指令；落笔后删表 + 删 F3 行 | A4 判三族零命中，而表与 F3 引文自身携旧串 ⇒ 不删则零命中永不成立；状态档只留当前态，变更轨迹住 git |
| B | 两舱 = 两批（甲舱 = 本批） | 需求 §13.24「16 档分两批」是权威；一批次档 = 一次实施轮 |
| C | 六处收正的执笔 = 设计席修正轮（§4 批准后、实施派单前） | 需求 §7.1「设计文档 = eng-designer（含修订）」（`docs/core/requirements/ENGINEERING-MODE-V2.md:289`）；实施轮 coder 写域 = `thincoder-core/prompts/**` |

**待父侧确认（非阻塞）**

- 「两舱 = 两批、甲舱 = 本批」按需求 §13.24 字面落（K7）。若父侧意为「本批只做设计、两舱各另起一批」，改 K7 与 §6.45「批次结构」段两处即全链随正，其余不动。
- 先例批次坐标用「需求段 + 台账号」（§6.45「先例批次坐标」行），未写批次档路径：批次档可整档删，写进来即成死指针（D4 方向规则）。若必须写路径，请父侧裁。

### 设计修正轮 2 · 评审 #21 收口（eng-designer · 2026-10-22）

**派单**：评审 #21 判 changes-required（🔴1 · 🟡1 · 🔵1）——#11 设计未承载需求 §13.24 新增「实施顺序」四步 · #12 A4 零命中判域不可达 · #13 §13.24 坐标滞后。

**设计档落点（全部在 `docs/core/design/PROMPT-SYSTEM.md` §6.45）**

| # | 位置 | 改了什么 |
|---|---|---|
| #11 | §6.45「推进次序 / 批次结构」（原两行） | 换为「推进次序」四步 + 「舱与批」段：第一步样板波（`thincoder-core/prompts/persona-engineering.md` 单档 · 一个实施席 · 父侧逐行核 · 用户过目后才开下一波）· 第二步分波并行（每席一到两档 · 单波 ≤ 并发 4）· 第三步横切检查三条 · 第四步未参与者独立复查五类；舱 = 批次边界，**派单单位 = 波** |
| #11 | §6.45 来源行 · 落点表列头 · K1 · K7 · 偏离② · §7 D-PS45 | 来源枚举补「实施顺序四步」；「按舱推进」⇒「按波推进」；「单舱 ≤15 档 = 一单可审」及其余四处派单口径 ⇒「舱 = 批次边界、派单按波（样板一波 · 其余每席一到两档）」 |
| #12 | §6.45 A4 行 · K8 · 连带项「执笔与轮次」 | A4 判域 = 落笔后删 C 表 / F3 行 / 三族定义行，命中只剩 A4 行自身并排除（A4 行内自带三族子串清单，不靠另起的定义行）；K8 删除清单补「三族定义行」 |
| #13 | §6.45 来源行 · 勘察证据行 | §13.24 坐标 `:997-1019` ⇒ `:1000-1048`（两处） |
| ④ | §6.45 上抛项 | 不再写「无」：列〔父侧 · 需求档随正〕需求 `:1042` 仍记「两处」（设计实扫六处），设计侧不触需求档 |

**验收对照（回指派单 ①–⑤）**

| # | 验收 | 读数 / 位置 |
|---|---|---|
| ① | 四步实施顺序入设计，与「单舱 ≤15 档」相容 | §6.45「推进次序」四步 + 「舱与批」段；设计档内 grep `一单可审` = 0（实跑） |
| ② | A4 判域可达 | §6.45 A4 行 + K8（删除清单含三族定义行） |
| ③ | 坐标 | 设计档内 grep `997-1019` = 0；两处现为 `:1000-1048` |
| ④ | 上抛项逐条列 | §6.45「上抛项（待裁）」两条 bullet |
| ⑤ | 门 PASS | 独立 node 进程（盘上引擎直调 · `staleEngineFiles` = `[]` · 1 档整档入判）⇒ `DOC-CHECK GATE: PASS` · 命中 0（锚 0 / 行宽 0） |

**零改面（实测）**：本席本轮笔 = `docs/core/design/PROMPT-SYSTEM.md` 一档 + 本段。提示词档 / 产品代码 / 需求档零笔（`git status` 中其余 `M` = 并行批遗留，非本轮笔）。

**§2 前段更正（D7 · 设计变更传播）**：前段「推进次序：甲舱（9 档）先行，乙舱（7 档）随后；单舱一单」按现行设计更正——舱 = 批次边界、派单按波（样板档单波先行 · 其余每席一到两档），见 §6.45「推进次序 / 舱与批」；A1–A4 判据与落点表读数不变。

## §3 设计评审（评审子代理）

### 轮次 1（评审子代理）

### 设计评审 · 轮次 2（FR46 设计层复核 · 目标 = `docs/core/design/PROMPT-SYSTEM.md` §6.45 + 需求 §13.24）

**复核结论摘要**：轮次 1 的样板超线项已闭——围栏块（`docs/core/design/PROMPT-SYSTEM.md:2938`-`:2944`）本席逐行复算 = 130 / 213 / 200 / … / 288，`docs/core/design/PROMPT-SYSTEM.md:3009`` 记「最长 288 ≤ 300」属实（三行独立复算逐字相符）。受影响文件表与落点表逐格对读一致；
  行数 / 字符合计复算 = 1,568 行 / 284,907 字符 / 甲 184 + 乙 106 = 290 行，与 `:3010` 读数相符。仍余 1 🔴（相反口径 sweep 不完整）+ 7 🟡 + 2 🔵。

| # | Category | Severity | Issue | Suggestion |
|---|----------|----------|-------|------------|
| 1 | Requirements / Document ownership | 🔴 | 相反口径 sweep 登记为「两处」（(m, off) => m:2921`、`:3040`），实际同一结论至少四处：`:476`（C1 收）、`:2818`（C2 收）、**`:627`／`:653`「提示词档不在行宽机检域」未收**。
  A4（`:3000`）只测两句原文串「EN 档不在行宽机检域」/「行数不作断言」，而 `:627`／`:653` 措辞是「提示词档…」⇒ 逐字测不到：本批收口后 A4 可全绿，档内仍并存「提示词面受行界约束」（§6.45 / C1）与「提示词档不在行宽机检域、披露不行使」（§6.25／§6.26 机检行）两套口径，需求 §13.24 验收 ④「相反口径已收正」未真达。 | 把 sweep 改成按判据族扫全档（「不在行宽机检域」/「披露不行使」/「行数不作断言」三族），把 `:627`／`:653` 补进 C 表（或写明不在射程的理由）；
  A4 判「三族串全档零命中」，F3 / 勘察行的「两处」随读数改。 |
| 2 | Document ownership | 🟡 | (m, off) => m:2818` 除「行数不作断言」外还带一条落地形态指令「B1 三段各落」+ 一整行；C2（`:3007`）只收正「行数」半句。乙舱要重写 (m, off) => m`，而 §6.44 B1 三段合计 +1,312 字符 / 3 内容行（`:2849`）⇒ 重写必破「各落一整行」，两条现行写形指令并存且相斥。 | C 表补一条（或明确豁免 §6.44 的「一整行」形态），令 §6.44 落地形态与 FR46「一条规则一行」同向；否则乙舱实施席照任一条做都违另一条。 |
| 3 | Acceptance criteria | 🟡 | A2（`:2998`）「四列（规则 / 条件 / 例外 / 理由）逐格非空」对没有例外或没有理由的行只能靠编——与本节边界「不新增规则」（`:3014`）、D-PS42 ①（不硬编因果，`:3092`）相抵；需求 §13.24 ② 已把该口径写死，本节未记录这个张力。 | 明确「无该类内容」的合法填法（如该格写「—（本条无）」并算已判），A2 判法改「无空串且无未判格」；或把口径冲突上抛需求层裁。 |
| 4 | Acceptance criteria | 🟡 | A4（`:3000`）要求 `:476`／`:2818` 与 C1／C2 的「收正后」**逐字相等**，但「收正后」列（`:3006`／`:3007`）是摘要散文（含「原句的…结论作废，改述为…」），不是目标行 ⇒ 逐字相等无可比对对象，A4 不可执行。 | 按本档先例（§6.43／§6.44 逐字围栏块）给 C1／C2 的目标行逐字文本，A4 判「现文 ↔ 目标行全等」。 |
| 5 | Clarity / Ownership | 🟡 | C1／C2 标为「实施轮的设计档笔」（`:3002`），未写谁执笔；写权矩阵 = 设计档唯一作者 eng-designer（需求 `docs/core/requirements/ENGINEERING-MODE-V2.md:289`；D1 `:602` 记「唯一作者 = eng-coder」仅指提示词面）⇒ 实施轮 coder 不持设计档 ⇒ A4 的落笔在本批派单里没有合法执行者。 | 写明执笔方（设计席修正轮 ∥ 父侧机械收正并照「父侧直接执行 + 可 revert」打标），并把该笔排进轮次。 |
| 6 | Cross-doc state | 🟡 | 需求 §13.24（`docs/core/requirements/ENGINEERING-MODE-V2.md:1009`）记「实测最长 312 字符」「样板还差 12 个字符要再收一句」；`docs/core/design/PROMPT-SYSTEM.md:3009` 记「最长 288 ≤ 300」（本席复算属实）。两处对同一件样品给出不同状态，且本节边界写「不改需求档」（`:3014`）⇒ 读者判不出样板是否已合规。 | 体量读数处登记「样板自需求稿 312 收至 288」（需求侧那句状态的改写 = 父侧随拍或列入上抛项）。 |
| 7 | Closest-precedent | 🟡 | 先例∥偏离块（`:3029`-`:3032`）只对偏离 ① 给了理由；②（以舱为实施单位）③（以重写为落笔形态）④（样板入逐字块）仅陈述「首次」，未写既有形为何不适用（理由散在 K1／K2，④ 无理由）；先例坐标只到设计档节名 + 源行，无先例批次。 | ②③④ 各补一句「既有形为何不适用」（可回指 K1／K2），并补先例批次坐标。 |
| 8 | Coordination | 🟡 | 需求 §13.24（`:1011`）写「16 档分两批」，本节写「两舱推进、甲舱先行」「单舱 ≤15 档 = 一单可审」（`:3020`／`:2969`），未说两舱 = 同一批次档两轮实施，还是两份批次档；A2 的两份映射表落哪个 §5 因此不定。 | 写明批次结构（两舱 = 两批 ∥ 一批两轮）与 A2 落点，避免实施轮自定。 |
| 9 | Clarity | 🔵 | 两表列头「超 300 行数」（`:2949`）／「>300 行」（`:2973`）字面读作「超过 300 **行**」，列内实为「超过 300 **字符**的行数」；(m, off) => m` 恰有 310 行读数，歧义可被读成按行数判。 | 列头改为「超 300 字符行数」。 |
| 10 | Requirements coverage | 🔵 | 写形四条中「理由行以 Why 起头」只出现在 D-PS45（`:3095`），本节三条手法（`:2932`-`:2934`）与机制块未列。 | 把「理由行以 `Why` 起头」并进三条手法，或机制块补一句。 |

**计数**：🔴 1 · 🟡 7 · 🔵 2。

**评审面限制（据实记）**：① 项目标准档 = 无声明（methodology 判据按 Project Guide + 评审标准）；② 文档地图 = 无（Document ownership 降级核对：按需求档写权矩阵与 Project Guide 判）；③ 16 档提示词逐档行数 / 最长行读数在声明的评审文件之外，仅核内部一致性（分项与合计互洽），未独立复读原档。

VERDICT: changes-required

### 轮次 2（评审子代理）

### 设计评审 · 轮次 3（#16 修复复核 · PROMPT-SYSTEM §6.45 + 需求 §13.24）

审查面：`docs/core/design/PROMPT-SYSTEM.md` §6.45（`:2905-3100`）+ `docs/core/requirements/ENGINEERING-MODE-V2.md` §13.24（`:1000-1048`）。声明路径 = 项目根（`thincoder/`）相对；工作区根无 `docs/`。

**上轮 10 项（1🔴 + 7🟡 + 2🔵）逐项复核 = 10/10 落地**：① 相反口径六处登记（F3 `:2921` · C1–C6 `:3010-3015`）+ A4 判据句族（`:3002`）；② C2 覆盖落地形态 + 逐字目标行 `:3028`；③ A2「—（本条无）」不许编（`:3000` · K4 `:3074`）；④ 六行逐字目标行 `:3017-3054`；⑤ 执笔点名（`:3006`）；⑥ 312→288 双侧收正（需求 `:1012` · 设计 `:3060`，本席复算 130/200/288 精确吻合）；
  ⑦ 偏离②③④ 各给「不适用，因为」+ 先例批次坐标（`:3081` `:3084-3086`）；⑧ 批次结构（`:2971` + K7 `:3077`）——但写实派单口径反而与需求新增实施顺序相抵（见新-1）；⑨ 列头「超 300 字符行数」（`:2950` `:2975`）；⑩ 机制 5「理由以 Why 起头」（`:2929`）。

**新发现 3 项（1🔴 · 1🟡 · 1🔵）**：

| # | Orig# | File | Severity | Status | Notes |
|---|-------|------|----------|--------|-------|
| 11 | (new) | `docs/core/design/PROMPT-SYSTEM.md` §6.45 ∥ 需求 §13.24 | 🔴 | New | 设计未承载需求新增「实施顺序（硬前置，不许跳）」：需求 `docs/core/requirements/ENGINEERING-MODE-V2.md:1016` "**实施顺序（硬前置，不许跳）**"；`:1018` "第一步，先由一个实施席"（单独改完 thincoder-core/prompts/persona-engineering.md + 用户过目）；`:1022` "每席一到两档"；
  `:1024` "第三步，并行段结束后跑一次**横切检查**"；`:1028` "**第四步：改完之后再查一轮（用户 2026-10-22 12:45 要求）**"；
  `:1038` "按**判据句族**全仓扫一遍"（含「操作数是否算指针」族）。设计侧仍是 `docs/core/design/PROMPT-SYSTEM.md:2970` "单舱 ≤15 档 = 一单可审" 与 `:2971` "甲舱一批、乙舱一批，各一份批次档、各一次实施派单"，`:3100` "**上抛项（待裁）**：无"。⇒ 甲舱 = 一次派单 9 档 与「单档先行 + 用户过目」「每席一到两档」直接相抵；第三步② 形态同构抽检、第四步复查轮在设计中无对应；来源行 `:2907` 的 §13.24 枚举亦无「实施顺序」。 |
| 12 | (new) | `docs/core/design/PROMPT-SYSTEM.md:3056` / :3002 / :3078 | 🟡 | New | A4 判「三族子串全档零命中」，但 `:3056` "**三族定义（A4 判域）**" 一行本身写着三族全部子串；`:3078` 的删除令只到 "落笔后删表、删本节 F3 行"，A4 的排除只到 `:3002` "判域排除本行自身（判据句须写出被判的子串），命中 0 才算过" ⇒ 按字面执行，`grep` 仍命中 3056 行，「命中 0 才算过」不可达。 |
| 13 | (new) | `docs/core/design/PROMPT-SYSTEM.md:2907` / :3094 ∥ 需求:1042 | 🔵 | New | 指针读数滞后：`:2907` / `:3094` 记 §13.24 为 "`:997-1019`"，实读 = `docs/core/requirements/ENGINEERING-MODE-V2.md:1000` 至 `:1048`（`:1050` 起附录）；需求 `:1042` 仍写 "本批的连带收正要把这两处改掉"（两处），设计实扫六处、需求验收④ 亦要求按句族扫。 |

计数：上轮 10 项全闭（10/10）；本轮新 1🔴 + 1🟡 + 1🔵。

VERDICT: changes-required

### 轮次 3（评审子代理）

### 设计评审 · 轮次 3（#16 复核收口 · PROMPT-SYSTEM §6.45 + 需求 §13.24）

**审查面**：`docs/core/design/PROMPT-SYSTEM.md` §6.45（`:2905-3113`）+ `docs/core/requirements/ENGINEERING-MODE-V2.md` §13.24（`:1000-1048`）。声明路径为项目根相对（工作区根无 `docs/`；活本在 `thincoder/` 下，`docs/core/requirements/ENGINEERING-MODE-V2.md` 全仓仅此一份）。

**上轮 13 行逐项复核 = 13/13 闭合**（#1–#10 = 上上轮 10 项，均仍 Fixed；#11–#13 = 上轮新发现，本轮全部 Fixed）：

| # | 上轮 | 状态 | 本轮证据（实读） |
|---|---|---|---|
| 1 | 🔴 相反口径 sweep / A4 判法 / 需求④ | Fixed | 六处登记齐（`docs/core/design/PROMPT-SYSTEM.md:2921`「本档六处（`:476` `:627` `:653` `:2818` `:2849` `:2870`）」）；C1–C6 现文引文与实读逐条对上（`:476` / `:627` / `:653` / `:2818` / `:2849` / `:2870`；C3 有 `##` 块计数句、C4 无——两处正确区分）；A4（`:3012`）改判据句族「三族子串全档零命中」；
  需求 `:1048` ④「按**判据句族**扫全档」同口径 |
| 2 | 🟡 `:2818` 落地形态未收 | Fixed | `:3021` C2 族列「③ + 落地形态」；逐字目标 `:3038`「B1 三段各成一整段，段内按 FR46 分行」 |
| 3 | 🟡 A2 逐格非空逼编造 | Fixed | `:3010`「该列没有内容时写「—（本条无）」，不许留空串，也不许为凑格编一条」；K4 `:3084`「无内容写「—（本条无）」，不许编」；需求 `:1048` ② 同步 |
| 4 | 🟡 A4 无逐字目标 | Fixed | `:3027`「**逐字目标行（六行 · 各 ≤300 字符 · 落笔 = 整行替换）**」+ `:3032`–`:3064` 六块目标行给全（C1「EN 档**同受行宽判据**（FR46——一条规则一行、逐行 ≤300 字符）」） |
| 5 | 🟡 C 表执笔未名 | Fixed | `:3016`「落笔轮次 = **本批的设计席修正轮**（§4 用户批准后、实施派单前）」+「A4 由父侧在收口轮判」 |
| 6 | 🟡 样板 312 / 288 跨档相抵 | Fixed | 需求 `:1012`「需求稿记的「最长 312」是初稿读数」；设计 `:3070`「样板六行 = 130 / 213 / 200 / 252 / 183 / 288 字符（最长 288 ≤ 300」——两处一致 |
| 7 | 🟡 偏离②③④ 缺理由 / 无先例批次 | Fixed | `:3091`「**先例批次坐标**：§6.42 ← 需求 §13.18（FR40 · 台账 `#1725`）」；`:3094`–`:3096` 三条各给「既有形 = …；不适用，因为 …」 |
| 8 | 🟡 批次结构未定 | Fixed | `:2981`「**派单单位 = 波，不是舱**」+「甲舱批 = 本批 … 乙舱批另起一份批次档」；K7 `:3087` |
| 9 | 🔵 列头「超 300 行数」 | Fixed | `:2950`「超 300 字符行数」；`:2985`「>300 字符行数」 |
| 10 | 🔵 写形缺「Why 起头」 | Fixed | `:2929`「**理由单独一行，以 `Why` 起头**」 |
| 11 | 🔴 设计未承载需求「实施顺序（硬前置）」 | Fixed | `:2970`「**推进次序（需求 §13.24「实施顺序」四步 · 硬前置，不许跳；甲舱先行不变）**」；第一步 `:2972`「父侧逐行核、用户过目后才开下一波」；第二步 `:2975`「每席一到两档」（甲舱余 8 ⇒ 4 席 × 2；乙舱 7 ⇒ 2/2/2/1）；第三步 `:2977`「第三步 · 横切检查」（三小项对齐需求 `:1024`）；第四步 `:2978`–`:2979`「复查由没参与改写的人做」+ 五类含「⑤ 口径不一致处按判据句族全仓扫（… · 操作数是否算指针）」；
  「上抛项 = 无」已撤（`:3112` 留父侧随正一项） |
| 12 | 🟡 A4 零命中不可达（三族定义行携全族旧串且不在删除令内） | Fixed | `:3012`「C 表、F3 行与三族定义行已删，见 K8」；K8 `:3088`「落笔后删表、删本节 F3 行、删三族定义行」；`:3016` 同口径。落笔后仅余 A4 本行，且已明写「判域排除本行自身」⇒ 零命中可达 |
| 13 | 🔵 需求段坐标滞后 / 「两处」vs 六处 | Fixed | `:2907`「… 实施顺序四步 …，`:1000-1048`」；`:3104`「需求档 §13.24（`:1000-1048`）」；「两处 vs 六处」升为具名上抛项（`:3112`「需求 §13.24 `:1042` 仍记相反口径「两处」… 父侧收正需求档时按六处随正」） |

**本轮新发现**：0。**计数**：0🔴 / 0🟡 / 0🔵（残留 🔵 级一项，不阻断：#13 的兄弟指针 `:2908`「§13.23（…，`:978-995`）」仍短 3 行——§13.23 验收实读在 `docs/core/requirements/ENGINEERING-MODE-V2.md:998`；随需求档随正顺手收即可）。

**上轮 🟡 #12 复核**：`docs/core/design/PROMPT-SYSTEM.md:3066` 三族定义行仍在，但已进 K8 删除令；`:3068` 不在射程行只余「不作验收条」（无「行数」前缀）等非族串 ⇒ 不产生命中。

VERDICT: pass

## §4 用户批准（主 agent）

**批准记录（主 agent 记）**

- 用户 2026-10-22 12:46「批准」——批 FR46 实施（设计 §6.45 + 需求 §13.24 + 实施顺序四步）。
- 随后追加令（同一批，范围未变）：13:10「可以，开始吧」（开甲舱样板档）· 13:13「都跑」（乙舱并行开）。
- 中途三次口径更正同样是用户原话：14:09「一次会话完成的只是一个庞大的任务中的一步…」→ §13.25 加一层 why；14:10「可以」→ 四行 why 定稿；13:58「要有条独立规则」→ FR47 独立成节。

**授权口径**：整批令（「都跑」）覆盖批内全链；停相只在 🔴 未决 / 偏离批准设计 / 用户明示 hold / 范围变更 四种。

## §5 实施记录（eng-coder）
**状态行**：实施完成（四档 25 行 · 评审 2 轮 pass）



**落点**：`thincoder-core/tool-docs/doc_check.md` 的 `- Anchors —` 起首 bullet 之末（`…are skipped whole.` 之后另起一段）。

**改动面**：`git diff --numstat` = **9 插入 / 0 删除**。相对本席开工基线的 `git diff --name-only` 增量 = **该档一档**。
开工前已在改的 7 档 = 并行批遗留，非本席笔：
`docs/core/design/DOC-DISCIPLINE.md` · `docs/core/design/PROMPT-SYSTEM.md` · `docs/core/requirements/ENGINEERING-MODE-V2.md` ·
`scripts/prompt-refs-check.mjs` · `thincoder-core/doc-check/anchors.mjs` · `thincoder-core/prompts/advisor-round1.md` · `thincoder-core/prompts/common.md`。

**落笔逐字**（与设计档 (m, off) => m` §3.20 ①「模型可见契约」`~~~text` 块 7 行逐行相等——脚本实读行哈希 7/7 相等；每行 2 空格缩进）：

~~~text
  **Operand names.** Six names count as operands rather than documents: the model writes them, or reads a file by that name. On
  the prompt face (`thincoder-core/prompts/**`) they are stripped from a line before extraction; on any other face the same token
  is judged as a pointer. The six:

  ```text
  AGENTS.md  SKILL.md  README.md  `docs/core/design/MANIFEST.md`  .thincoder/advisor.md  project_rules.md
  ```
~~~

**验收对照**

| # | 验收 | 读数 |
|---|---|---|
| ① | 逐字目标形贴到 `Anchors —` bullet 之末 · 六名围栏字面 | ✅ 7 行逐行相等（行哈希 7/7；审计子代理独立复核同读数） |
| ② | 该档 `doc_check` gate（独立进程）= PASS | ✅ `DOC-CHECK GATE: PASS` · 命中 0（锚 0 / 行宽 0）；会话内读数 = ERROR（原因见「门读数」） |
| ③ | `git diff --name-only` = 该档 | ✅ 相对开工基线增量为该档一档 |
| ④ | 不改该档其它句 | ✅ 9 插入 / 0 删除 |

**决策披露**

| # | 决策 | 理由 |
|---|---|---|
| D1 | 采设计档的**围栏形**（六名一行 `text` 围栏），不采任务书正文的平铺行内码段形 | 设计单源 = §3.20 ① 逐字块；任务书同段要求「用围栏块或代码块包起来」，验收 ① 亦写「围栏字面」。行内形会落 `docs/core/design/MANIFEST.md` `档缺`（仓根无该档）⇒ 违反验收 ②；措辞零改写（逐行哈希相等） |
| D2 | 落笔块前补一空行、块后保持原空行 | 原档两条判据 bullet 间有空行；保持段落独立与 bullet 分隔的既有形，原句零动 |

**审计与评审轮次**

| 轮 | 面 | 读数 | 终态 |
|---|---|---|---|
| 内部审计 | explore 偏差审计（逐字 ∥ 落点 ∥ 名单外 ∥ 语义） | 六条判点全对齐；四类偏差（PARTIAL / SILENT-SIMPLIFICATION / DOC-DRIFT / OUT-OF-LIST）零 | `clean` |
| 代码评审 | advisor `type:"code"`（目标 = 该档 14–22 段） | 1 🔴 + 1 🟡 + 2 🔵；🔴 属**设计逐字文本自身**（见上抛项），非本席落笔偏离；改写须设计席笔 | `stalled` |

**上抛项**

- 〔上抛·待裁〕**设计逐字块与实机行为不一致（评审 1 🔴）**：绝对句「on any other face the same token is judged as a pointer」对六名中的**四名**不成立——
  `AGENTS.md` / `SKILL.md` / `.thincoder/advisor.md` / `project_rules.md` 在**任一面**都先落 `FILENAME_CLASSES` 类名免（`anchors.mjs:29`–`:31` · `:126`），
  只有 `README.md` / `docs/core/design/MANIFEST.md` 两名在非提示词面照报（设计档 §3.20 ③ 作用面 `:1023`–`:1024` 即此口径）。本席按任务书「照抄，别改写措辞」落笔未擅改；
  修正 = 设计席改 §3.20 ① 逐字块（以 ③ 作用面为准），再由本席一格重贴。
- 〔知会〕任务书正文的平铺形（六名行内码段）与设计档围栏形不同；本轮按设计单源落围栏形（见 D1）。

**门读数**

- 独立进程（新 node 进程 · 盘上引擎 · 先 `staleEngineFiles` 后 `runDocCheck`）：`DOC-CHECK GATE: PASS` · `hits {total:0, anchors:0, width:0}`。
- 会话内工具面：`DOC-CHECK GATE: ERROR（…；thincoder-core/tool-docs/doc_check.md mtime 2026-10-22T04:39:33.786Z > 进程启动 2026-10-22T03:30:20.162Z）…`——
  三档 stale 中两档 = 并行批 `#12` 在本会话启动后改写的引擎档，第三档 = 本笔自身（本批验收对象即改产品档，会话内必陈旧）⇒ 父侧重启会话后复跑为准（同 §2「门读数」处置）。

**修正轮**：0 轮（落笔一次成型；评审 🔴 不属本席笔，未自改）。

### 重贴轮 · 契约格换为收正后的逐字块（eng-coder · 2026-10-22）

**为什么**：上一轮按设计档当时的目标形落笔，块内带绝对句 `on any other face the same token is judged as a pointer`。设计席修正轮已把设计档 `docs/core/design/DOC-DISCIPLINE.md` §3.20 ① 的逐字块收正（六名中四名在任一面先落 `FILENAME_CLASSES` 类名免，只有 `README.md` / `docs/core/design/MANIFEST.md` 在非提示词面照判），产品面仍是旧形 ⇒ 两处不再逐字相等，且模型会照旧句预测一个永不出现的 `档缺`。

**改动面**：`thincoder-core/tool-docs/doc_check.md:15-24` 整格替换为 `docs/core/design/DOC-DISCIPLINE.md:1033-1042` 的逐字块（外层 `~~~text` 起止 + 4 行正文 + 空行 + 内层 `text` 六名列表，共 10 行）。**逐行哈希 10/10 相等**（含缩进与空行位置）。该档相对 HEAD = **12 插入 / 0 删除**（相对本席开工基线 9/0 ⇒ 净 +3 行，全部在该格内）；开工基线 8 个 `M` 中其余 7 档 numstat 逐数未变 ⇒ 本席笔只此一档。

**验证读数**

| # | 验收 | 读数 |
|---|---|---|
| ① | 整格逐字替换 · 行哈希逐行相等 | ✅ 10/10 EQ（独立脚本实读两档 + 审计子代理独立复算同读数） |
| ② | 该档独立进程 `doc_check` gate = PASS | ✅ `DOC-CHECK GATE: PASS` · hits {total:0, anchors:0, width:0} · `staleEngineFiles` = `[]` |
| ③ | `git diff --numstat` 只出该档 | ⚠️ 全仓 numstat = 8 档（7 档为并行批遗留，与本席开工基线逐数相同）；**本席增量 = 该档一档** |
| ④ | 不改该档其它句 | ✅ 0 删除；1-14 行与 25-67 行逐字未变（+3 插入全部由该格解释） |

**门读数**：会话内工具面 `ERROR（引擎已更新（doc-check/index.mjs mtime …；doc-check/anchors.mjs mtime …；thincoder-core/tool-docs/doc_check.md mtime 2026-10-22T04:46:26.970Z > 进程启动 2026-10-22T03:30:20.163Z）…）`——结构性原因：本档本身是引擎六档之一（`version.mjs` `ENGINE_FILES`），本轮改它必然让会话启动时加载的引擎陈旧；盘上新引擎独立进程读数见 ②。

**审计与评审轮次**

| 轮 | 面 | 读数 | 终态 |
|---|---|---|---|
| 内部审计 | explore 偏差审计（逐字 ∥ 其它句 ∥ 名单外 ∥ 四类偏差） | 10/10 EQ；②③ 零；四类偏差（PARTIAL / SILENT-SIMPLIFICATION / DOC-DRIFT / OUT-OF-LIST）零 | `clean` |
| 代码评审 | advisor `type:"code"`（目标 = 该档） | `VERDICT: pass`；1 🟡 可选（在册外）+ 🔵 若干 | `clean` |

**评审余项（不属本席笔 · 交父侧路由）**：该档 `Anchors —` bullet 的全称句仍是绝对话（实机另有类名九名闭集与占位词干族不判，`anchors.mjs:28-31` / `:34-36` / `:126`）。本批验收 ④ 明令「其余句零改」⇒ 本席未动；补写须设计席先给目标形，另批处置。

**修正轮**：0 轮（一次贴准，审计与评审无本席笔内的必改项）。

### 样板波 · persona-engineering 78 行超长行重写（eng-coder · 2026-10-22）

**派单**：本批设计 `docs/core/design/PROMPT-SYSTEM.md` §6.45「推进次序」第一步——一个实施席单独改完 `thincoder-core/prompts/persona-engineering.md`（甲舱样板档），交「改前 / 改后」对照 + 行长读数 + 四列映射表；父侧逐行核、用户过目后才开下一波。任务书 = 本批批次档 §2 + 派单正文（写形四条、样板六行、红钱四条）。

**落点**：`thincoder-core/prompts/persona-engineering.md` 一档。改前 249 行 / 66,324 字符 / **78 行 >300** / 最长 **1,486 @`:104`**；改后 **469 行 / 66,896 字符 / 0 行 >300 / 最长 300 @`:138`**（该行是未改动的原「Subagent ids…」行，恰好压线未越）。

**改动面**：`git diff --numstat` 该档 = **302 插入 / 82 删除**（净 +220 行）；相对本席开工基线（12:53:35）增量 = **该档一档**——其余 8 档 `M` 均为并行批遗留（mtime 均 ≤ 12:53:35，本席笔仅该档 12:57 后写入）。被改写的 78 条长行里 `55–59` 是引文块整体（含 4 条 ≤300 的续行）；逐条对账仍按 78 条 >300 行为单位。

**行长读数（一次性 `node` 脚本 · `split(/\r?\n/)` · 判 `length > 300`）**：

| 时点 | 行数 | 字符数 | >300 行数 | 最长行 |
|---|---|---|---|---|
| 改前 | 249 | 66,324 | **78** | **1,486 @`:104`** |
| 改后 | 469 | 66,896 | **0** | **300 @`:138`**（未改行） |

**写形落地**：一条规则一行 · 行首一个短语题眼 · 条件与例外放在规则之后并尽量独立成行 · 理由独立成行且以 `Why` 起头 · 加粗只落在题眼。中文术语原样保留（在途 / 已收口 / 老化 / 归批 / 条件 / 认账不排期 / 已查无 / 现成不可用 / 暂缓批复核 / 收尾链待跑 / 已定决定 / 已废弃 / 待核销 / 评审通过 / 不适用 / 状态行 / 模板占位 / 重开记录 / 前情 逐词命中，零改写）。

**样板六行逐字落地**：新 `:191–196` 与设计 §6.45 围栏块（`docs/core/design/PROMPT-SYSTEM.md:2940`–`:2945`）逐行相等（行长 130 / 213 / 200 / 252 / 183 / 288）。

#### 验收对照（派单 ①–⑥）

| # | 验收 | 读数 |
|---|---|---|
| ① | 全档每一行 ≤300；改前改后各报一次 | ✅ 78 → 0；最长 1,486 → 300 |
| ② | 四列映射表逐条不空 | ✅ 下表 78 行；无空格、无为凑格编造（无该类内容写「—（本条无）」） |
| ③ | `node scripts/prompt-refs-check.mjs` 命中 0 | ✅ 提示词面 69 档 · 代码面 463 档 · 命中 0 |
| ④ | `cd thincoder-core && node test/run.mjs` 全绿 | ✅ 35 tests / 35 pass / 0 fail |
| ⑤ | `git diff --numstat` 只出该档 | ✅ 本席增量 = 该档（302 / 82）；其余 8 档 mtime 均早于开工时点 = 并行批遗留 |
| ⑥ | 最长十行改前 / 改后逐字 | ✅ 见本段「最长十行」节 |

#### 语义对账（原文行 → 新行 · 四列）

四列判法：规则 / 条件 / 例外 / 理由；无该类内容写「—（本条无）」，不编。新行号 = 改后档行号。

| # | 旧行 | 新行 | 规则 | 条件 | 例外 | 理由 |
|---|---|---|---|---|---|---|
| 1 | 9 | 9–13 | ✅ 审批即开火；意图即批准；一步；唯一停形 | ✅ 评审通过后 | ✅ approval 说 hold | ✅ `:12` Why：两步读成三步白等一轮 |
| 2 | 14 | 18–26 | ✅ go-ahead 盖审批关；评审照跑；四停形 | ✅ 有 / 无 batch-wide go-ahead | ✅ 四停形 (i)–(iv) | ✅ `:19` Why：同一授权二次收费 |
| 3 | 18 | 30–32 | ✅ 两族「Yours」+ 设计稿核验 | —（本条无） | —（本条无） | —（本条无） |
| 4 | 28 | 42–44 | ✅ 需求即合约 | ✅ 一经陈述即生效 | ✅ 成本高 → 照做或先摆权衡 | ✅ `:44` Why：交付缩水 = 已批设计打折扣 |
| 5 | 30 | 46–50 | ✅ 决定当轮落盘 | ✅ 落需求档 / 否则 §1 | ✅ 需求档装不下 → §1 固定形 | ✅ `:50` Why：只住对话的决定一次压缩就没 |
| 6 | 31 | 51–53 | ✅ 压缩后先重锚；丢掉的决定回盘 | ✅ 压缩提示 / 自压回执出现时 | —（本条无） | ✅ `:53`：被动压缩发生在请求之间 |
| 7 | 39 | 61–63 | ✅ 转向立即生效；勿断已飞工具 | ✅ 忙碌中排队的消息 | —（本条无） | ✅ `:63` Why：重跑已完部分付费两次 |
| 8 | 40 | 64–67 | ✅ 默认值只在已确认范围内 | ✅ 批内 / 批外 | —（本条无） | ✅ `:65` Why：放宽的默认 = 无人做的决定 |
| 9 | 55–59 | 82–87 | ✅ 每步呈现；停即等明确放行；恢复 | ✅ 有 / 无 go-ahead | ✅ 用户叫停；唯一停形 | ✅ `:85`：自动跨步跳过无人给的批准 |
| 10 | 64 | 92–93 | ✅ 最近祖先胜 | ✅ 嵌套时 | ✅ 子胜根（独立子项目保自己的） | ✅ `:93`：兄弟无层级，全局优先只能任选 |
| 11 | 65 | 94–101 | ✅ 项目根判定向下走；①–⑤ | ✅ 五档判序 | ✅ 多候选 = workspace 报事实列候选 | ✅ `:99` Why：猜 = 定一个没人确立的事实 |
| 12 | 66 | 102–103 | ✅ 落档是轻动作、一项目一份 | ✅ 使用点 | ✅ `git init` 可选、需确认 | ✅ `:102`：预建 manifest 声明一个还不存在的项目 |
| 13 | 69 | 106–108 | ✅ 不能坛会话；缺项目只报不杀 | ✅ 需要项目参数且无项目时 | —（本条无） | ✅ `:106`：因缺项目杀会话丢整段上下文 |
| 14 | 71 | 110–111 | ✅ 你是唯一写者，走 `manifest` 工具 | —（本条无） | —（本条无） | ✅ `:111`：手改会分裂状态与工具假设 |
| 15 | 76 | 116–118 | ✅ 一实现轮边界 = 一交付目标 + 一条目集 + 一档 | ✅ ①–③ 任一命中 | ✅ 批内条目 → 同批继续 | —（本条无） |
| 16 | 77 | 119–121 | ✅ 长度与轮次护栏 | ✅ 上限命中 | ✅ §3 无轮次上限（连续驳回 >3 停报） | ✅ `:120`：达自然边界则另起一批 |
| 17 | 78 | 122–125 | ✅ 收口链检查门 | ✅ 或 §1 声明不适用 | ✅ §5 免、§6 不可声明 | —（本条无） |
| 18 | 79 | 126–130 | ✅ 不足即拒；过门即冻；可重开 | ✅ 过门之后 | ✅ 已收口档可重开 | ✅ `:127` Why：冻住未完的链，缺口永远补不回 |
| 19 | 88 | 139–141 | ✅ digest ack 首行逐字 | ✅ 报告送达时 | ✅ 早前轮已 ack → 收口消息重述一次 | ✅ `:140`：改写后无法证明收到哪份 digest |
| 20 | 89 | 142–147 | ✅ watchdog 是诊断触发；看后裁定 | ✅ 50 轮无写 | ✅ progressing 放行 / spinning 接管或取消 | ✅ `:143`：early 抓无限无写环；`:147` 上报义务同点 |
| 21 | 92 | 153–156 | ✅ 修轮派单三句 | ✅ 派修轮时 | —（本条无） | —（本条无） |
| 22 | 94 | 158–159 | ✅ 父侧不代笔，走修轮 | —（本条无） | ✅ 三类例外（自己写域 / 机械纠形 / 小改） | ✅ `:158`：两支笔同一面互相覆盖 |
| 23 | 96 | 161–166 | ✅ 收口三态 | ✅ ①②③ 各给判法 | ✅ 第四态「承诺」不存在 | ✅ `:166` Why：过后轮次兑换 = 零 |
| 24 | 97 | 167–169 | ✅ 每条断言携依据 | ✅ 收口时 | ✅ 无格式强制、存量不追改 | ✅ `:168`：无依据 = 读者无从核 |
| 25 | 98 | 170–175 | ✅ 欠账上清单、§6 只留指针 | ✅ 已定未入需求档 = 同形欠账 | ✅ 被推翻 → 已废弃 / 改写绑新决定 | ✅ `:173` Why：只住散文的欠账无人再看见 |
| 26 | 99 | 176–178 | ✅ 就地先修；只真欠账入池；老条目分类 | ✅ 一次性小形项 | ✅ 需自轮 / 条件 / 需设计 | ✅ `:176`：记了号的小修等一个永不来的轮 |
| 27 | 100 | 179–181 | ✅ 清账轮重核「归批」锚 | ✅ 清账轮 | ✅ 三条重锚路径（触点 / 小批 / 认账） | ✅ `:181`：池计数须代表真活，不是悬空指针 |
| 28 | 102 | 183–186 | ✅ 先复核暂缓批；冻结档残留扫描 | ✅ 会话开 / 条件事件 | ✅ 满足⇒恢复；对象没⇒收口或撤回 | —（本条无） |
| 29 | 103 | 187–190 | ✅ 开局自查池面 | ✅ 每次会话开 | ✅ 仅内部、不得转播 | ✅ `:189`：无人扫的池静默长大 |
| 30 | 104 | 191–196 | ✅ 收尾扫台账；每条带处置 | ✅ 每次批收口 / 用户说收会话 | ✅ 对象已不在 ⇒ 当场结算 | ✅ `:196` Why：处置菜单给每条一条免罪路 |
| 31 | 105 | 197–199 | ✅ 收口抽读笔行 | ✅ 少于两行 ⇒ 全读 | ✅ 缺行 = 未查（非已查无） | ✅ `:199`：该抽读就是缺口浮出的地方 |
| 32 | 107 | 201–205 | ✅ 实现轮角色路由；先判变更面 | ✅ 派单前 | ✅ 三面各归其主（产品码 / 档 / 工具面） | —（本条无） |
| 33 | 111 | 209–212 | ✅ 披露携判据半句；用户一词改道；越界重披露 | ✅ 命中三项之一 | ✅ 诊断 / 探针零链不披露 | —（本条无） |
| 34 | 112 | 213–215 | ✅ 开局记账：先档后行 | ✅ 轮开（第一笔前） | —（本条无） | ✅ `:214`：指针须指盘上档；`:215` 无账 = 未成立 |
| 35 | 113 | 216–219 | ✅ 轻通道代码笔放行；无账先记账 | ✅ 有账在盘 | ✅ 提示词面 / 设计档不走轻通道 | ✅ `:218` Why：静默转全链会偷换披露 |
| 36 | 115 | 221–222 | ✅ 一轮 = 一批次档；§5 不适用 | —（本条无） | ✅ 实现面 = 父侧直改，记 §1 | —（本条无） |
| 37 | 117 | 224–229 | ✅ 收口触发与要素 | ✅ 三种提醒点（自然停顿 / 跑题 / 收尾信号） | ✅ 一句话、不追 | —（本条无） |
| 38 | 118 | 230–231 | ✅ 跳会话接续扫描未收轻通道轮 | ✅ 会话开 | —（本条无） | —（本条无） |
| 39 | 121 | 234–240 | ✅ 笔前答三问；三种形入 §1 | ✅ 每笔 | ✅ 偏离须点名能力 / 契约失败；形状好看不算理由 | ✅ `:239` 同句携理由 |
| 40 | 123 | 242–246 | ✅ 派单携 round；坐标替代扫全域 | ✅ initial / fix | —（本条无） | ✅ `:245` Why：全探把轮花在已钉住的 | 
| 41 | 124 | 247–249 | ✅ 设计派单携公共源坐标 | ✅ 无源 ⇒ 明写「已查无」 | —（本条无） | ✅ `:249` Why：缺行与未勘察同形 |
| 42 | 138 | 263–264 | ✅ `Deferred` 适用面 | ✅ 🟡 / 🔵、需用户裁的 🔴、有理由的不修 🔴 | ✅ 无理由不修 = Unfixed | ✅ `:264`：默丢的缺陷用户永远盲 |
| 43 | 145 | 271–273 | ✅ 非修必携理由；评审可推回 | ✅ 第 2 轮前可推回；第 3 轮起接受有理由的不修 | ✅ 无理由不修 = Unfixed | ✅ `:272` Why：无理由无从评估 |
| 44 | 153 | 281–283 | ✅ 修轮先档后码；终端后重走评审 | ✅ 链未收期 | ✅ 终端后新工（含偏离修）需新评审 + token | —（本条无） |
| 45 | 154 | 284–286 | ✅ 链终端消费 designId | ✅ 交付已验证且链收 | ✅ 新工需新评审 + token | ✅ `:286`：消耗的 token 留在槽 = 重用漏洞 |
| 46 | 155 | 287–290 | ✅ 飞中 token 可恢复；design-slots 列全 | ✅ 上下文丢失（压缩 / 重启） | ✅ 过期槽也列；畸形记录 `designToken=—` | ✅ `:290`：恢复不改纪律 |
| 47 | 156 | 291–292 | ✅ token 短命，签发即派 | ✅ 链收即消费 | ✅ 过期则授权作废、重走评审 | ✅ `:292`：活槽不消费 = 重用漏洞 |
| 48 | 157 | 293–296 | ✅ 用户点头 ≠ 设计批准；新范围走全链 | ✅ 含已批设计的扩展 | ✅ 批准一个形（「B」）不免评审 | ✅ `:295`：它定的是形，不是设计 |
| 49 | 158 | 297–299 | ✅ 首句停信号 = 停 | ✅ 意图而非词表 | —（本条无） | ✅ `:298` Why：漏掉就自动跨过用户叫停的步 |
| 50 | 159 | 300–303 | ✅ 凭据值不入档 | ✅ 写入随档入 git 且收不回 | ✅ 评审通过只记「评审通过」 | ✅ `:301` Why：写进档的 token 进每个克隆 / 备份 |
| 51 | 164 | 308–310 | ✅ `batchDoc` 必填 | ✅ 相对路径解析序 | ✅ 缺 / 不可读 ⇒ 机械拒 | ✅ `:310` Why：无任务书的执行跑在猜的方向上 |
| 52 | 166 | 312–315 | ✅ 任务书重导不抄写 | ✅ §2 与设计档冲突时设计为准 | ✅ 抄兄弟批 = 同病 | ✅ `:314`：重述的数只活到下次设计变更 |
| 53 | 167 | 316–319 | ✅ 设计变更传播到引用它的任务书 | ✅ 变更落地那一刻 | ✅ 或记当日债（点名批与节） | ✅ `:319` Why：自改 §2 = 第二作者 |
| 54 | 171 | 323–326 | ✅ `designToken` 逐字取槽 | ✅ 从 design-slots 行 | ✅ 修轮复用同 token | ✅ `:325`：门拒整次 spawn |
| 55 | 173 | 328–333 | ✅ 已知事实是量不是判据；一判据一源 | ✅ 任务书同时给数与判据时 | ✅ 观测案例（严格正则数 vs 语义判据） | ✅ `:329` Why：重述造出第二判据 |
| 56 | 174 | 334–335 | ✅ 第五参数按角色命名 | ✅ designPoints ∥ scope 恰一 | ✅ 错名被拒、互不代替 | —（本条无） |
| 57 | 175 | 336–338 | ✅ `files` 是调度通道不是简报通道 | —（本条无） | ✅ 观测：四个子代理因此各烧一轮 | ✅ `:337`：只写 `files` 的清单到不了子代理 |
| 58 | 176 | 339–340 | ✅ `acceptance` 机可验；验证只跑变更面单测 | ✅ 单文件 / 相关子集 | ✅ 集成测试归父侧收口 | ✅ `:340`：每轮全绿 = 验证成本乘轮数 |
| 59 | 180 | 344–347 | ✅ 任务书 `why` 须携推理 | ✅ 最可能反驳处自测 | ✅ 无推理的规则只有例子的宽度 | ✅ `:345` Why：裸命令逼子代理回来问 |
| 60 | 181 | 348–350 | ✅ 禁令携后果 | ✅ 「不要碰 X」须接「碰了会怎样」 | ✅ ✗ / ✓ 两例 | ✅ `:349` Why：无后果的禁令只躲字面 |
| 61 | 192 | 361–363 | ✅ 工程工具面不入写域 | —（本条无） | ✅ `scripts/*` 层级锚定 | ✅ `:363` Why：列了只造假冲突 |
| 62 | 201 | 372–375 | ✅ 批设计前扫相关条目并合并 | ✅ 批点火前 | ✅ 不合并则写理由入 §1 | —（本条无） |
| 63 | 206 | 380–383 | ✅ 实现验证过 ⇒ 两跳迁移 | ✅ 从待核销 / 待讨论 / 待设计 | ✅ 追认核销须 evidence | ✅ `:382` Why：直跳会洗成「已完」 |
| 64 | 207 | 384–392 | ✅ 批收口交叉核 | ✅ 三项子检查（残留 / 暂缓 / doc-check） | ✅ REFUSED / ERROR / 无档变更三分支 | ✅ `:387`：否则该账永远开着 |
| 65 | 208 | 393–395 | ✅ 新债当日记 | ✅ 在范围（评审 / 回报 / 档漂） | ✅ trigger 只携一个裸枚举 | ✅ `:395` Why：只住散文的债无人再看见 |
| 66 | 209 | 396–397 | ✅ 上抛项当场裁 | ✅ 在范围 | ✅ 可纠 → 当轮修；其余 → 当日记 | ✅ `:397`：散文不是台账 |
| 67 | 214 | 402–403 | ✅ 范围外不记不上抛 | —（本条无） | —（本条无） | ✅ `:403` Why：一眼判不出真假，入单即成事实 |
| 68 | 215 | 404–405 | ✅ finding = 查过的东西 | —（本条无） | ✅ 入报告的发现须携读数或可复现路径 | —（本条无） |
| 69 | 216 | 406–407 | ✅ 唯一例外：阻塞 / 推翻当前任务 | ✅ 所述前提被事实推翻 / 依赖档被代码推翻 | ✅ 不算范围外发现 | —（本条无） |
| 70 | 220 | 411–412 | ✅ 登记查重 | ✅ 登记时 | ✅ 不同项则记关系 | —（本条无） |
| 71 | 222 | 414–415 | ✅ 族行 | ✅ 成员同批 / 同轮收口 | ✅ 查重管登记；族行管存量合并 | ✅ `:414`：点火前扫描一眼看全 |
| 72 | 223 | 416–418 | ✅ 证据指针化与软上限 | ✅ ≈300 字 | ✅ 细节无家可归 ⇒ 允许内嵌摘要 | ✅ `:417`：超限先问哪段归所指档 |
| 73 | 230 | 425–431 | ✅ token 隔离；并行各携各对 | ✅ 一次多个 eng-coder | ✅ 失败重审保留旧对到 TTL | ✅ `:426`：新对覆盖旧对 = 作废授权 |
| 74 | 231 | 432–438 | ✅ 声明调度元数据；调度器闸；files 只写实现域 | ✅ 异步 / 同步各异 | ✅ 目录声明被拒 | ✅ `:436` Why：列了只造假冲突 |
| 75 | 232 | 439–440 | ✅ 父侧等待姿势 | —（本条无） | —（本条无） | ✅ `:440`：阻塞等只买到停住的会话 |
| 76 | 233 | 441–446 | ✅ 提交即走；池上限；自记并行状态 | ✅ 池满入队 | ✅ 非法值回落 4/4 | ✅ `:442` Why：手排队列重复调度器 |
| 77 | 234 | 447–452 | ✅ 感知重叠是调度输入；`queued` 是准入回执 | ✅ 派前自检 | ✅ 不因重叠改落点 | ✅ `:448` Why：手等停在队列本可吸收的冲突上 |
| 78 | 239 | 457–459 | ✅ env 行字段与 resumed 语义 | —（本条无） | ✅ design-token 例外：TTL 内随槽恢复 | ✅ `:459`：进程内存态丢失，假设活着 = 猜 |

#### 最长十行（改前 / 改后 · 逐字）

改前行长读自改前快照，改后逐字读自现档。围栏内为原文，围栏外才是本段的话。

**1 · 旧 `:104`（1,486 字符）→ 新 `:191–196`（六行 · 即设计 §6.45 样板块）**

改前：

~~~text
- **Closing ledger sweep (the dual of the opening self-check)**: at **every batch closeout** (and at a session's close, if the user says so), sweep the ledger before declaring done. **The rule is one line, not a menu: every entry leaves the sweep with a disposition.** Every unsettled entry is either
  
  
  **settled** (the work landed ⇒ walk it to closure), **withdrawn** (its premise is gone / it is superseded or duplicate), or **puts on the record why it cannot be done now** (a concrete blocking condition and the trigger that clears it — **"file it under a batch" / "later" / "pending ruling" are 
  not conditions**). Nothing else. **The sweep is a real check, not a reading**: take each entry's coordinate (its `file:line` / the symbol it names) and **actually look at it** — an entry whose object no longer exists is settled on the spot, since carrying it forward leaves a false task on the 
  list. **A stale entry that has been sitting on the list for weeks is the defect this exists to kill** — "looks open" is not evidence, so the check is not skipped. **"It stays on the list" is not an outcome of the sweep** — that is the defect the sweep exists to remove. **The closeout report 
  carries the ledger reading** (unsettled count before → after ∥ rows touched) — "was the ledger cleaned" must be checkable, not a claim. **Why**: a menu of dispositions gives every entry a way to be excused; the pool then only grows. The closeout is the natural, zero-extra-trip moment to keep it 
  honest.
~~~

改后：

~~~text
- **Closing ledger sweep**: sweep the ledger before declaring a batch closeout done — and at session close, when the user says so.
- **Every entry leaves the sweep with a disposition**: settled (the work landed, so walk it to closure), withdrawn (its premise is gone, or it is superseded or duplicate), or blocked with the reason on the record.
- **A blocked entry carries a condition, not a word**: "file it under a batch", "later" and "pending ruling" are not conditions; a condition names what blocks the entry and the trigger that clears it.
- **The sweep is a check, not a reading**: take each entry's coordinate — its `file:line` or the symbol it names — and actually look at it; an entry whose object is gone is settled on the spot, since carrying it forward leaves a false task on the list.
- **"It stays on the list" is not an outcome**: a stale entry sitting for weeks is the defect this sweep exists to kill, and "looks open" is not evidence, so the check is not skipped.
- **Why**: a menu of dispositions gives every entry a way to be excused, and the pool only grows; the closeout is the zero-extra-trip moment to keep it honest. The report carries the reading — unsettled before → after, rows touched — so "was the ledger cleaned" is checkable, not a claim.
~~~

**2 · 旧 `:230`（1,204 字符）→ 新 `:425–431`（七行）**

改前：

~~~text
- **Token isolation**: each design's review pass issues its own designId + token pair (the advisor echoes both in the Approved reply). Parallel eng-coders each carry their own designId+token — a new pair overwriting an earlier one voids that coder's authorization, so a newly issued pair never 
  overwrites an earlier one, and a failed re-review leaves all previously approved pairs intact until TTL. When spawning multiple eng-coders at once, calls look like: `subagent(role="eng-coder", designId=<id-A>, designToken=<token-A>, batchDoc=<batch record path>, round="initial", goal=..., 
  knownFacts=..., designPoints=..., acceptance=..., reportFormat=...)` and `subagent(role="eng-coder", designId=<id-B>, designToken=<token-B>, batchDoc=<batch record path>, round="initial", goal=..., knownFacts=..., designPoints=..., acceptance=..., reportFormat=...)` — one call per design, all in 
  the same reply. `batchDoc` is mandatory on every eng-coder spawn — the batch record path (e.g. `<repo>/docs/batches/<batch>-<topic>.md` — relative paths resolve against the session cwd first, then candidate project roots, or absolute), the task book that spawn implements: omitted, or path 
  unreadable, mechanically refused.
~~~

改后：

~~~text
- **Token isolation**: each design's review pass issues its own designId + token pair (the advisor echoes both in the Approved reply).
- **Parallel eng-coders each carry their own designId+token**: a new pair overwriting an earlier one voids that coder's authorization, so a newly issued pair never overwrites an earlier one, and a failed re-review leaves all previously approved pairs intact until TTL.
- **When spawning multiple eng-coders at once, one call per design, all in the same reply**:
  - `subagent(role="eng-coder", designId=<id-A>, designToken=<token-A>, batchDoc=<batch record path>, round="initial", goal=..., knownFacts=..., designPoints=..., acceptance=..., reportFormat=...)`
  - `subagent(role="eng-coder", designId=<id-B>, designToken=<token-B>, batchDoc=<batch record path>, round="initial", goal=..., knownFacts=..., designPoints=..., acceptance=..., reportFormat=...)`
- **`batchDoc` is mandatory on every eng-coder spawn** — the batch record path (e.g. `<repo>/docs/batches/<batch>-<topic>.md` — relative paths resolve against the session cwd first, then candidate project roots, or absolute).
  It is the task book that spawn implements: omitted, or path unreadable, mechanically refused.
~~~

**3 · 旧 `:173`（1,171 字符）→ 新 `:328–333`（六行）**

改前：

~~~text
  **⚠️ Known facts are MEASUREMENTS, not criteria — and the dispatch carries ONE criterion source**: when a task book states a count ("N sites") and also a criterion, write the criterion **by reference to its single source** (the design-doc section / the ruling) — a restatement in your own words 
  beside a hand-written count creates the second criterion, and that count becomes the real one. A task book that measures by one criterion and judges by another **self-contradicts** — the coder stops and the round-trip is yours. (Observed: a parent quoted a strict-regex count under "known facts" 
  while the criteria section carried the semantic criterion — the child found a site satisfying the criterion but absent from the count, and had to ask. **One criterion, one source, cited — not restated.**) The same reach extends to the task book itself: a criterion or count written into batch 
  record §2 as its own text is that second criterion — §2 cites the owning design-doc section, in the form `design §N.M` / `requirements §N.M`, and where a literal value has to appear (an acceptance equality assertion) it appears only as that section's value with the citation beside it.
~~~

改后：

~~~text
  **Known facts are MEASUREMENTS, not criteria — and the dispatch carries ONE criterion source**: when a task book states a count ("N sites") and also a criterion, write the criterion by reference to its single source (the design-doc section / the ruling).
  Why: a restatement in your own words beside a hand-written count creates the second criterion, and that count becomes the real one.
  **A task book that measures by one criterion and judges by another self-contradicts** — the coder stops and the round-trip is yours.
  (Observed: a parent quoted a strict-regex count under "known facts" while the criteria section carried the semantic criterion — the child found a site satisfying the criterion but absent from the count, and had to ask. One criterion, one source, cited — not restated.)
  **The same reach extends to the task book itself**: a criterion or count written into batch record §2 as its own text is that second criterion.
  §2 cites the owning design-doc section, in the form `design §N.M` / `requirements §N.M`; where a literal value has to appear (an acceptance equality assertion) it appears only as that section's value with the citation beside it.
~~~

**4 · 旧 `:234`（1,156 字符）→ 新 `:447–452`（六行）**

改前：

~~~text
- **A perceived file overlap is a scheduling input, not a reason to hold or relocate**: the perception is exactly what the `files` declaration exists for — declare the domain, dispatch, and let the scheduler queue what overlaps; a hand-kept wait stalls the batch on the same conflict the queue would 
  have absorbed in place. Relocating the landing point to get around the overlap is the heavier detour: the content lands where its criterion does not live, and a later round pays to move it back. **`queued` is a normal admission receipt**: read it as admission and keep dispatching — a receipt read 
  as a failure signal is what turns a same-minute dispatch into a hand-kept wait. **Line-number drift is a content problem, not a timing one**: serial edits shift line numbers under each other, and a wait leaves the shifted line exactly where it was — a text anchor puts the edit on its content, and 
  a `dependsOn` on the producing task orders the edit after it. **Pre-dispatch self-check**: "am I waiting, or have I moved the landing point, because of file overlap?" — if yes, declare `files` and dispatch; the queue holds the conflict while the work proceeds.
~~~

改后：

~~~text
- **A perceived file overlap is a scheduling input, not a reason to hold or relocate**: the perception is exactly what the `files` declaration exists for — declare the domain, dispatch, and let the scheduler queue what overlaps.
  Why: a hand-kept wait stalls the batch on the same conflict the queue would have absorbed in place.
- **Relocating the landing point to get around the overlap is the heavier detour**: the content lands where its criterion does not live, and a later round pays to move it back.
- **`queued` is a normal admission receipt**: read it as admission and keep dispatching — a receipt read as a failure signal is what turns a same-minute dispatch into a hand-kept wait.
- **Line-number drift is a content problem, not a timing one**: serial edits shift line numbers under each other, and a wait leaves the shifted line exactly where it was — a text anchor puts the edit on its content, and a `dependsOn` on the producing task orders the edit after it.
- **Pre-dispatch self-check**: "am I waiting, or have I moved the landing point, because of file overlap?" — if yes, declare `files` and dispatch; the queue holds the conflict while the work proceeds.
~~~

**5 · 旧 `:207`（1,135 字符）→ 新 `:384–392`（九行）**

改前：

~~~text
3. **Batch closeout** ⇒ **settlement cross-check**: verify entries settled, pointers resolve; **prior-batch leftovers** (entry done, anchor batch record unclosed) ⇒ the **fallback settlement path**, since otherwise that account stays open forever; **deferred-batch re-check** — run the deferral scan 
  against resume conditions; none ⇒「暂缓批复核：无」in §6; **doc-check gate** — before approval / settlement / close, run `doc_check(mode:"gate", docs:[...])` over **this round's doc set** (the list = `git diff <batch-start sha> --name-only -- docs`, `<batch-start sha>` = HEAD before this round started); 
  `REFUSED` ⇒ no approval, no settlement, no close, no ledger write — send it back to the author for a same-round fix, re-run to `PASS`; `ERROR` ⇒ the same judgment (no `PASS` means not passed), and an unclear fix goes to the main agent — unsure ⇒ relay to the user; no doc changes ⇒ one line 
  "doc-check gate: no doc changes" in §6; **Settlement line** — **ensure the settlement line lands** (the settlement sync checklist's mechanical step) + **the settled count goes with the closeout** (reported together with it, not as a separate line).
~~~

改后：

~~~text
3. **Batch closeout ⇒ settlement cross-check**: verify entries settled, pointers resolve.
   - **Prior-batch leftovers** (entry done, anchor batch record unclosed) ⇒ the fallback settlement path.
     Why: otherwise that account stays open forever.
   - **Deferred-batch re-check** — run the deferral scan against resume conditions; none ⇒「暂缓批复核：无」in §6.
   - **Doc-check gate** — before approval / settlement / close, run `doc_check(mode:"gate", docs:[...])` over this round's doc set (the list = `git diff <batch-start sha> --name-only -- docs`, `<batch-start sha>` = HEAD before this round started).
     - `REFUSED` ⇒ no approval, no settlement, no close, no ledger write — send it back to the author for a same-round fix, re-run to `PASS`.
     - `ERROR` ⇒ the same judgment (no `PASS` means not passed), and an unclear fix goes to the main agent — unsure ⇒ relay to the user.
     - No doc changes ⇒ one line "doc-check gate: no doc changes" in §6.
   - **Settlement line** — ensure the settlement line lands (the settlement sync checklist's mechanical step); the settled count goes with the closeout, reported together with it, not as a separate line.
~~~

**6 · 旧 `:231`（1,133 字符）→ 新 `:432–438`（七行）**

改前：

~~~text
- **Declare spawn scheduling metadata in the task book**: spawns carry `files` (write domain) and `dependsOn` (prior async ids) — an undeclared write domain is invisible to the scheduler, and what it cannot see it cannot queue; the scheduler gates admission: async spawns overlapping in-flight/queued
  
  
  files queue until the blocker settles; sync spawns conflicting on files error out (no queueing); dependency chains order automatically. Spawn mirror tasks across independent trees as parallel eng-coders, each declaring its own file domain — overlapping domains are queued by the scheduler rather 
  than hand-serialized. **The files declaration lists only the implementer's write domain** (source, test, design-doc files) — project process files (requirement pool / changelog / task-list family) stay out of it — listing them only creates false conflicts and slows the team; reconciliation notes 
  and CHANGELOG entries are your responsibility, landed after the eng-coder delivery. files must be file-level paths (one per file). Directory declarations are NOT supported — they bypass the conflict detector and are rejected with an error.
~~~

改后：

~~~text
- **Declare spawn scheduling metadata in the task book**: spawns carry `files` (write domain) and `dependsOn` (prior async ids) — an undeclared write domain is invisible to the scheduler, and what it cannot see it cannot queue.
- **The scheduler gates admission**: async spawns overlapping in-flight / queued files queue until the blocker settles; sync spawns conflicting on files error out (no queueing); dependency chains order automatically.
- **Spawn mirror tasks across independent trees as parallel eng-coders, each declaring its own file domain** — overlapping domains are queued by the scheduler rather than hand-serialized.
- **The files declaration lists only the implementer's write domain** (source, test, design-doc files) — project process files (requirement pool / changelog / task-list family) stay out of it.
  Why: listing them only creates false conflicts and slows the team.
- **Reconciliation notes and CHANGELOG entries are your responsibility**, landed after the eng-coder delivery.
- **files must be file-level paths** (one per file). Directory declarations are NOT supported — they bypass the conflict detector and are rejected with an error.
~~~

**7 · 旧 `:233`（992 字符）→ 新 `:441–446`（六行）**

改前：

~~~text
- **Submit and go — queuing is the mechanism's job**: spawns always carry `files`/`dependsOn` and are submitted directly — domain conflicts are queued by the scheduler (returns `queued` + position), pool-full is queued by the pool; a hand-kept queue duplicates the scheduler, waits on nothing and 
  blocks work that could have been queued. The parent only reads state (status/observe) and does not simulate the scheduler. **Concurrent pool limits (per role domain)**: the eng-coder pool is 4, the other-role (explore/plan/coder) pool is 4 — a domain never queues behind the other, so concurrent 
  eng-coders plus concurrent other-role spawns can total 8; `agent.poolLimits = { engCoder, other, advisor }` overrides both subagent domains (invalid values fall back to 4/4; the advisor key is read by the advisor pool — default 4). You track each parallel implementation's state (design, token, 
  delivery, audit, review) yourself; past 4 the bookkeeping cost and cross-talk risk outweigh the speedup.
~~~

改后：

~~~text
- **Submit and go — queuing is the mechanism's job**: spawns always carry `files` / `dependsOn` and are submitted directly — domain conflicts are queued by the scheduler (returns `queued` + position), pool-full is queued by the pool.
  Why: a hand-kept queue duplicates the scheduler, waits on nothing and blocks work that could have been queued.
- **The parent only reads state (status / observe) and does not simulate the scheduler.**
- **Concurrent pool limits (per role domain)**: the eng-coder pool is 4, the other-role (explore / plan / coder) pool is 4 — a domain never queues behind the other, so concurrent eng-coders plus concurrent other-role spawns can total 8.
- **`agent.poolLimits = { engCoder, other, advisor }` overrides both subagent domains** (invalid values fall back to 4/4; the advisor key is read by the advisor pool — default 4).
- **You track each parallel implementation's state** (design, token, delivery, audit, review) yourself; past 4 the bookkeeping cost and cross-talk risk outweigh the speedup.
~~~

**8 · 旧 `:65`（878 字符）→ 新 `:94–101`（八行）**

改前：

~~~text
**Project-root judgment (walk DOWN — walking up lands the manifest in an unrelated enclosing project; direct child directories only, no recursion)**: ① the anchor itself carries the file → the anchor is a project; ② the anchor itself contains `.git` → the anchor is the repo root (missing file = a 
  chance to land one); ③ otherwise look at direct child directories: the ones carrying the file take precedence (exactly one counts; several = a workspace — a normal state: report the fact, list every candidate project and name its root; guessing settles a fact nobody established, and landing one 
  there breaks every later project-root lookup); ④ only when none carries the file, look at bare repos containing `.git` (exactly one = it; several = list the candidates); ⑤ none of these → no project here → **generate the manifest at the session anchor** (default landing point = cwd).
~~~

改后：

~~~text
**Project-root judgment walks DOWN** — walking up lands the manifest in an unrelated enclosing project; direct child directories only, no recursion.
① **The anchor itself carries the file** → the anchor is a project.
② **The anchor itself contains `.git`** → the anchor is the repo root (missing file = a chance to land one).
③ **Otherwise look at direct child directories**: the ones carrying the file take precedence — exactly one counts.
   Several = a workspace, a normal state: report the fact, list every candidate project and name its root.
   Why: guessing settles a fact nobody established, and landing one there breaks every later project-root lookup.
④ **Only when none carries the file, look at bare repos containing `.git`**: exactly one = it; several = list the candidates.
⑤ **None of these → no project here** → generate the manifest at the session anchor (default landing point = cwd).
~~~

**9 · 旧 `:14`（860 字符）→ 新 `:18–26`（九行）**

改前：

~~~text
The go-ahead **covers the approval gate**: the batch runs its whole chain through in one pass — review, fixes, implementation, closeout — because the go-ahead already authorizes the batch's whole scope, and a second stop at the approval gate charges the same authorization twice. **The review still 
  runs, unchanged**: the go-ahead covers the wait for a separate go, not the review itself — review is the quality gate, and its findings are handled as before. Four shapes still stop the run and send it back to the user: (i) review 🔴 findings that cannot be fixed or that need a change of design 
  semantics (ii) implementation would have to deviate from the approved design (iii) the user says hold / design only / not yet (iv) the scope changes — a new requirement outside the batch. Without a batch-wide go-ahead, each step waits for the user's word as before.
~~~

改后：

~~~text
- **The go-ahead covers the approval gate**: the batch runs its whole chain through in one pass — review, fixes, implementation, closeout.
  Why: the go-ahead already authorizes the batch's whole scope, and a second stop at the approval gate charges the same authorization twice.
- **The review still runs, unchanged**: the go-ahead covers the wait for a separate go, not the review itself — review is the quality gate, and its findings are handled as before.
- **Four shapes still stop the run and send it back to the user**:
  - (i) review 🔴 findings that cannot be fixed or that need a change of design semantics.
  - (ii) implementation would have to deviate from the approved design.
  - (iii) the user says hold / design only / not yet.
  - (iv) the scope changes — a new requirement outside the batch.
- **Without a batch-wide go-ahead**, each step waits for the user's word as before.
~~~

**10 · 旧 `:121`（782 字符）→ 新 `:234–240`（七行）**

改前：

~~~text
**A pen answers the three questions before it moves** — where the function lives now (a coordinate ∥ a doc section) · what it is called (the existing name, verbatim) · who uses it — and the answer joins the pen's §1 entry in one of three shapes: `existing: <coordinate> · name: "<verbatim>" · 
  consumers: <who>` (then reused) · `none found: <surfaces checked>` · `existing but unusable: <coordinate> · name: "<verbatim>" · failed on: <the capability ∥ contract failure>`. An answer on hand ⇒ the pen reuses the existing piece; a deviation names the concrete capability ∥ contract failure that
  
  
  left it unusable — a different shape, a smoother fit or a nicer look is taste, not a reason. A full-chain pen writes the same line in its design doc's new-mechanism section, one per landing.
~~~

改后：

~~~text
**A pen answers the three questions before it moves**: where the function lives now (a coordinate ∥ a doc section) · what it is called (the existing name, verbatim) · who uses it.
**The answer joins the pen's §1 entry in one of three shapes**:
- `existing: <coordinate> · name: "<verbatim>" · consumers: <who>` (then reused).
- `none found: <surfaces checked>`.
- `existing but unusable: <coordinate> · name: "<verbatim>" · failed on: <the capability ∥ contract failure>`.
**An answer on hand ⇒ the pen reuses the existing piece**; a deviation names the concrete capability ∥ contract failure that left it unusable — a different shape, a smoother fit or a nicer look is taste, not a reason.
**A full-chain pen writes the same line in its design doc's new-mechanism section**, one per landing.
~~~

#### 审计与评审轮次 · 终态

| 轮 | 面 | 读数 | 终态 |
|---|---|---|---|
| 内部审计 | explore 偏差审计（丢句 / 新增约束 / 悬空指代 / 行长 / 名单外） | 82 行逐条对读：丢句 0 · 新增规则 0 · 改后 >300 = 0 · 未重写行逐字存在（18 个中文术语全命中）· OUT-OF-LIST 0；接受删项 5 类（指代 2 · 自我限定 1 · 同义括注 1 · 装饰加粗 1） | `clean` |
| 代码评审 | advisor `type:"code"`（目标 = 该档；设计 §6.45 为判据上下文） | 🔴 0 · 🟡 2（可选）· 🔵 4（两条为本席笔内形态，两条为存量结构 + 验证限制） | `clean` |

**评审后自修（2 轮范围内 · 本席笔）**：① 🟡 旧 `:40` 拆分出的悬空半句（`:65` 原无主谓）⇒ 改回 `64–67` 四行形（理由入 `:65` Why）；② 🟡 旧 `:92` 三条规则挤一行 ⇒ `:153–156` 拆为 ①②③；③ 🔵 旧 `:89` 的 Why 离其所释规则过远 ⇒ 上移至 `:143`；
  ④ 🔵 `:8` 断句残留大写 `Review` ⇒ 小写。**未修两条（存量，非本席笔）**：`:200` 空行分割 bullet 列表与 `:216–230` 顶格 / 缩进混排——改前快照 `:106` / `:113` / `:114` / `:116` 即此形，属「78 行之外不动」的边界。

#### 决策披露

| # | 决策 | 理由 |
|---|---|---|
| D1 | 引文块 `55–59` 整块重排（含 4 条 ≤300 续行） | 原块在句子中间断行（`Stop-and-check` / `is intent…`、`post-digest` / `follow-up`）；只改 `:55` 会留下半个句子，模型按块读到的仍是碎片 |
| D2 | 样板块 `:191–196` 逐字取设计 §6.45，不自行润色 | 设计已定「样板 = 逐字围栏块」；任何改动都会让第一波之后的比对基准漂移 |
| D3 | 存量的空行 / 缩进不齐（`:200` `:216–230`）不动 | 派单边界 = 78 行；顺手重排会改动已审过的行，超出本波可审面；已记入本段供父侧裁 |
| D4 | 中文术语零改写 | 派单明令保留；术语是台账 / 批次机制的操作数，译或改会让本档与工具面脱钩 |

#### 上抛项

- 〔上抛·知会〕存量结构两条（bullet 列表被空行截断、顶格 / 缩进混排）在本档 `:200` `:216–230`，改前即存在；本波未动，建议父侧列入横切检查（设计 §6.45 第三步 ②「形态是否同构」）。
- 〔上抛·知会〕内容等价的可核范围：改前全文已不在盘上（本席开工时该档已是 66,324 字符版；工作区无该版快照），故「无丢句」= 逐条对读 + 词表差集（全档仅 12 个词消失、3 个新增，逐个归因到允许删项 / 改写）的结论，**不是**与改前逐字 diff 的结论。完整证明需父侧把改前全文与段内映射表一并交复查轮。

#### 读数更正（同轮 · append-only 无编辑面）

本段「改动面」行记的 `302 插入 / 82 删除` 是评审前读数；评审后自修 4 处又换了 2 行（③④ 各为原位改写 + 两行拆分），**终值 = `304 插入 / 84 删除`**（净 +220 行，249 + 220 = 469）。行数 / 字符 / 最长行读数不变：469 行 · 66,896 字符 · 0 行 >300 · 最长 300 @`:138`。

### 甲舱波 · persona-eng-coder + persona-normal 超长行重写（eng-coder · 2026-10-22）

**派单**：本批 §2 + 设计 `docs/core/design/PROMPT-SYSTEM.md` §6.45（写形四条 / 样板块 / 红线）+ 需求 `docs/core/requirements/ENGINEERING-MODE-V2.md` §13.24（FR46）。落点 = `thincoder-core/prompts/persona-eng-coder.md`（改前 4 行 >300，最长 885 @`:19`）· `thincoder-core/prompts/persona-normal.md`（3 行 >300，最长 422 @`:21`）。
  两档合一单（设计第二步「每席一到两档」）。

**行长读数（一次性 `node` 脚本 · `split(/\r?\n/)` · 判 `length > 300`；行数含末尾空行——设计表 38 / 49 = 不含末尾空行的内容行数）**：

| 档 | 时点 | 行数 | 字符数 | >300 行数（逐行） | 最长行 |
|---|---|---|---|---|---|
| `thincoder-core/prompts/persona-eng-coder.md` | 改前 | 39 | 6,073 | 4（`:16` 522 · `:19` 885 · `:20` 407 · `:27` 351） | 885 @`:19` |
| `thincoder-core/prompts/persona-eng-coder.md` | 改后 | 60 | 6,222 | **0** | 281 @`:20`（未改行） |
| `thincoder-core/prompts/persona-normal.md` | 改前 | 50 | 6,471 | 3（`:21` 422 · `:31` 352 · `:38` 307） | 422 @`:21` |
| `thincoder-core/prompts/persona-normal.md` | 改后 | 58 | 6,516 | **0** | 295 @`:25`（未改行） |

改前读数与设计落点表逐数一致（`docs/core/design/PROMPT-SYSTEM.md:2956` / `:2957`）。

**改动面**：`git diff --numstat` 本席两档 = **25 插入 / 4 删除**（eng-coder）· **11 插入 / 3 删除**（normal）。
  全仓本时段并行波在同一工作树写入 8 档（mtime 13:13–13:17：persona-coder / discipline-engineering / advisor-design / advisor-round1 / advisor-round2 / advisor-round3 / consult-base / common），另有开工前遗留 9 档（其中 advisor-round1 / common 运行期被并行席续写）；本席两档 mtime = 13:19:03，其余档 mtime 均非本席写入。

**写形落地**：一条规则一行 · 行首短语点题 · 条件与例外在规则之后（能独立成行即独立成行）· 理由独立成行以 `Why` 起头（eng-coder 6 条 · normal 3 条，逐条对应原文的理由从句）· 加粗只落题眼。中文术语零改写（两档无 CJK，`[一-鿿]` 零命中）；`∥` / `⇒` 记号原样。

**验收对照（派单 ①–⑥）**

| # | 验收 | 读数 |
|---|---|---|
| ① | 两档每行 ≤300；改前改后各报一次 | ✅ 改前 4 / 3 行 >300（最长 885 / 422）⇒ 改后两档均 **0**（最长 281 / 295，均未改行）；见上表 |
| ② | 逐档「原文行 → 新行」四列映射表 | ✅ 见下段 7 行（eng-coder 4 · normal 3），无空格、无编造 |
| ③ | `node scripts/prompt-refs-check.mjs` 命中 0 | ✅ 提示词面 69 档 · 代码面 463 档 · 命中 0 |
| ④ | `cd thincoder-core && node test/run.mjs` 全绿 | ✅ tests 35 / pass 35 / fail 0 |
| ⑤ | `git diff --numstat` 只出这两档 | ⚠️ 全仓 19 档（并行波 8 档 + 开工前遗留 9 档 + 本席 2 档）——并行波下全仓口径不可达；**本席增量 = 这 2 档**（mtime 13:19:03 为界） |
| ⑥ | 每档最长五行改前 / 改后逐字 | ✅ 见下「最长五行」 |

**最长五行（改前 / 改后 · 逐字）**

改前 eng-coder 最长五行：

~~~text
[:19 · 885] - **Final review before finishing**: ① verify every acceptance criterion from the design ② confirm every out-of-list change (if any) is reported with its reason in the delivery report ③ run relevant tests — all green, because an unchecked criterion is a claim, not a verification ④ read 
  every file you changed — catch leftover debug code, stale comments, or incomplete edits ⑤ check that comments and docstrings match what the code actually does ⑥ report any design-doc drift your diff touches (module map / affected-files table) in your delivery report — the design docs are 
  eng-designer's to edit, so the report is where your drift lands. ⑦ **Doc-check gate** — before delivering, run `doc_check(mode:"gate")` (range = the docs this session wrote, checked **whole**); only a first line of `DOC-CHECK GATE: PASS` may be delivered, with a `doc_check: PASS (N docs)` line in 
  the report;
[:16 · 522] - **Implement to the full design — a silent degradation is a deviation.** If a stated design element (interaction, behavior, edge case, state) feels costly or fiddly to implement, implement it anyway and note the cost in your report. A "simpler approximation" of a specified behavior IS a
  
  deviation: either implement it as designed, or stop and surface the trade-off to the parent BEFORE coding — a reduced version disclosed afterwards is still a broken delivery, because the parent approved the design, not your discount.
[:20 · 407]   `REFUSED` ⇒ fix to zero hits in the same round, then re-run; a hit in a doc **outside your pen** (a design doc you touched) goes to the parent for routing, since **pen-domain discipline outranks going green**; an unclear fix ⇒ escalate to the main agent (the main agent is unsure ⇒ 
  relay to the user); a gate hit is fixed in the round, not booked to the ledger — booking moves the work where nobody looks.
[:27 · 351] - Write code one file at a time, verify each before moving on: syntax-check (node --check / lint) after each edit, run the project's own verification per its AGENTS.md method after each logical group, then declare the outcome to `verify` via verification.status — verify mechanically 
  gates on your declaration; it does not run checks or tests for you.
[:17 · 281] - **UI/interaction: implement exactly what the task brief and design doc state** (layout, flows, control behavior, states, feedback). If an interface decision the task implies is missing from both, stop and report the gap — an interface decision you invent is a ruling nobody made.
~~~

改后 eng-coder 最长五行（均为未改行 ⇒ 与改前逐字相同，行号已移位）：

~~~text
[:20 · 281] - **UI/interaction: implement exactly what the task brief and design doc state** (layout, flows, control behavior, states, feedback). If an interface decision the task implies is missing from both, stop and report the gap — an interface decision you invent is a ruling nobody made.
[:58 · 278]   If the write does not land (refused / failed) → say "§5 not written" plainly in the report. A silent skip makes the parent settle against a record that is not there; claiming it was written records a write that never happened — and a parent-side ghost-write is marked as such.
[:5 · 276] The parent agent is the product manager and flow orchestrator: it hands you the batch record §2 as your task book (design-doc references, file list, acceptance criteria) and the design token; the design document itself is authored by eng-designer. Your role is implementation.
[:50 · 246] ## file-domain declaration semantics = the expected touch surface (scheduling queue + transparent-disclosure baseline) — not an authorization boundary; going beyond the declaration ≠ overreach, just disclose it truthfully (user ruling 2026-09-10)
[:57 · 215]   Write means = the `batch` tool `batch({action:"append", segment, text})` (**no path parameter** — the target is the batch record bound at your spawn; the segment number follows from your identity: eng-coder → §5);
~~~

改前 normal 最长五行：

~~~text
[:21 · 422] - **Stated requirements are a contract**: every requirement the user states (in conversation/docs/plans) binds the moment it is stated — shrinking at delivery means the user approved the design and received a discount. Discovering mid-way that an element is costly → implement it anyway 
  and note the cost, or stop and lay out the trade-off BEFORE shrinking; disclosing only after delivery is the same discount, paid later.
[:31 · 352] - **A steer corrects you at once**: the user's reply reaches you as an ordinary user message (a message queued while you were busy takes effect once the current step lands) — apply it to the work that follows; interrupting a tool already in flight throws away its result and re-runs the 
  work, and re-running finished parts pays for the same work twice.
[:38 · 307] **The management face is yours**: normal mode has no designer role — requirements integration ∥ design text ∥ closeout documentation normalization are your own work (the same standard as the engineering-mode designer), then an independent review; the batch record ∥ ledger ∥ closeout are 
  all yours to write.
[:22 · 295] - **The only exemption (doc/code consistency)**: updating a doc whose topic you already own, recording a decision the user just made, closing a doc-code gap the advisor pointed out — these complete the same already-confirmed task, so they are done in the same turn and spend no new 
  confirmation.
[:27 · 280] **During a long task (a long chain / subagents in flight) the ordinary reply text beats both bad choices**: blocking on the user stalls the run, and pushing through blind spends the decision without them — so raise the question there, state a **workable default**, and keep going.
~~~

改后 normal 最长五行（均为未改行 ⇒ 与改前逐字相同，行号已移位）：

~~~text
[:25 · 295] - **The only exemption (doc/code consistency)**: updating a doc whose topic you already own, recording a decision the user just made, closing a doc-code gap the advisor pointed out — these complete the same already-confirmed task, so they are done in the same turn and spend no new 
  confirmation.
[:30 · 280] **During a long task (a long chain / subagents in flight) the ordinary reply text beats both bad choices**: blocking on the user stalls the run, and pushing through blind spends the decision without them — so raise the question there, state a **workable default**, and keep going.
[:40 · 257]   **All three routes follow one rule: check the docs first, and carry the checked-evidence line ∥ "checked, nothing relevant" when you ask** — asking without checking makes someone re-answer what is already written down; the user can check this on the spot.
[:15 · 250] **Subagent ids carry their accounts in reports**: report subagent statuses as a table with a dedicated ledger column — form: `coder #3 | #938 · <topic> | <task detail> | <status>`; a bare serial number ⇒ violation (the user traces it without asking).
[:39 · 238] - **Channel boundary**: hard gate (new scope / a ruling on a criterion / no default can carry it) ⇒ the `question` tool (blocking) or stop and ask the user; soft steer ⇒ in-flight ask (non-blocking); routine confirm gates stay plain text.
~~~

> 围栏内 `[:行号 · 字符数] ` 为标签，其后逐字（标签不计入原文）。改后各档最长行均为未改行 ⇒ 本笔新写行全部落在各档 top-5 之外。

**语义对账（原文行 → 新行 · 四列；无内容写「—（本条无）」）**

| # | 旧行 | 新行 | 规则 | 条件 | 例外 | 理由 |
|---|---|---|---|---|---|---|
| 1 | eng-coder `:16` | `:16–19` | 按全设计实施：静默降级 = 偏差（`:16`）；「近似替代」= 偏差（`:18`） | 某设计元素（交互 / 行为 / 边界 / 状态）成本高或难做（`:17`） | 不许替代实现；可编码前停下向父侧摆权衡（`:18`） | 事后才披露的缩水仍是坏交付——父侧批的是设计，不是折扣（`:19`） |
| 2 | eng-coder `:19` | `:22–31` | 交付前自检 ①–⑦（`:23`–`:31`） | 交付前（自检时点） | —（本条无） | 未检查的验收条只是断言，不是验证（`:26`）；设计档归 eng-designer，漂移只落报告（`:30`） |
| 3 | eng-coder `:20` | `:32–38` | `PASS` 首行才可交付（`:32`）· `REFUSED` ⇒ 同轮修到零命中（`:33`）· 门命中同轮修、不记账（`:37`） | `:20` = ⑦ 的续行，条件同 ② | 笔外档命中 ⇒ 交父侧路由（`:34`）；修法不清 ⇒ 上抛（`:36`） | 笔域纪律高于变绿（`:35`）；记账会把工作搬到没人看的地方（`:38`） |
| 4 | eng-coder `:27` | `:45–48` | 一次写一档、每档验证后再走（`:45`）；每次编辑后语法检查（`:46`）；每个逻辑组后跑项目自有验证并声明给 `verify`（`:47`） | 每次编辑后 / 每个逻辑组后 | —（本条无） | `verify` 只按声明机械过门，不替你跑检查或测试（`:48`） |
| 5 | normal `:21` | `:21–24` | 用户陈述的需求即合约，一经陈述即生效（`:21`）；中途发现成本高 ⇒ 照样实现并记成本，或先摆权衡再缩（`:23`） | 需求一经陈述；中途发现某元素成本高（`:23`） | 先摆权衡可替代直接实现；不许事后才披露（`:23`） | 交付缩水 = 用户批了设计却收到折扣（`:22`）；事后披露是同一笔折扣、晚付（`:24`） |
| 6 | normal `:31` | `:34–37` | steer 立即纠正你，应用到后续工作（`:34`）；打断在飞工具 = 丢结果并重跑（`:36`） | 用户在长任务中回复（`:34`） | —（本条无） | 忙中排队的消息在当前步落地后生效（`:35`）；重跑已完成部分付两次费（`:37`） |
| 7 | normal `:38` | `:43–45` | 管理面归你：普通模式无设计席，需求整合 / 设计文本 / 收口文档规范化按工程模式设计席同一标准、随后独立评审（`:43`–`:44`）；批次档 / 台账 / 收口都归你写（`:45`） | —（本条无） | —（本条无） | 普通模式没有设计席（`:43` 同句） |

**四类内容与零新增（审计读数）**：7 条旧超长行逐条对读，规则 / 条件 / 例外 / 理由全在；新写行无原文没有的约束（词级差集 = 断句、加粗、大小写与 `Why:` 前缀，内容词零增删）；`##` 块计数两档 6 → 6 未变。

**审计与评审轮次 · 终态**

| 轮 | 面 | 读数 | 终态 |
|---|---|---|---|
| 内部审计 | explore 偏差审计（四类内容 / 零新增 / 写形 / 行长 / 名单外） | 四类内容 7 行全在 · 零新增规则 · 零文档引用 · 0 行 >300 · OUT-OF-LIST 0；写形 1 类偏差（满行加粗 3 行，低） | `clean`（自修后） |
| 代码评审 | advisor `type:"code"`（两档；设计 §6.45 + 需求 §13.24 为判据上下文） | 🟡1（可选：`thincoder-core/prompts/persona-normal.md:36` 理由未独立成行）+ 🟡2（协调：§5 映射表待落 / 设计档活坐标漂）+ 🔵2；**0 🔴 ⇒ `VERDICT: pass`** | `clean`（本席笔内两条已自修） |

**自修轮（1 轮 · 均在笔内）**：① 满行加粗（审计点 `thincoder-core/prompts/persona-eng-coder.md:16` / `:45`、`thincoder-core/prompts/persona-normal.md:45`；评审补 `:23` / `:25` / `:28`）⇒ 加粗收窄到题眼，词句零改；
  ② 评审 🟡：`thincoder-core/prompts/persona-normal.md:36` 理由内联 ⇒ 拆出 `:37` `Why:` 行，词句零改。自修后复测：两档仍 0 行 >300（最长 281 / 295）· `prompt-refs-check` 0 · 35/35 绿 · 盘上引擎 `doc_check` gate PASS。**修正轮 = 1（上限 5）**。

**决策披露**

| # | 决策 | 理由 |
|---|---|---|
| D1 | 两档合一单 | 设计 §6.45 第二步「每席一到两档」；同舱同族，形态可互校 |
| D2 | 加粗以「题眼一个短语」为准（谓语 / 条件留平文） | 需求三条手法 ②「满行加粗等于没有重点」；样板块每行恰一处且非整句 |
| D3 | 原分号串联改为「一行一事」+ 缩进子项，保留原编号 ①–⑦ 与原括注 | 写形四条 + 红线「四类内容不得丢」；不合并同义句、不改判据强度 |
| D4 | 两档无 CJK ⇒ 无中文术语改写；`∥` / `⇒` 原样 | 术语是台账 / 批次机制的操作数；审计已扫 `[一-鿿]` 零命中 |

**上抛项**

- 〔上抛·知会〕**设计档活坐标随本笔漂移**（设计档笔归 eng-designer，本席不写）：`docs/core/design/PROMPT-SYSTEM.md:161` 记 `thincoder-core/prompts/persona-eng-coder.md` 实现纪律「`:17` 不得静默降级 / `:23` 收尾自审」——现为 `:16` / `:22`；
  `docs/core/design/ADVISOR-CONVERGENCE.md:221` 记 `thincoder-core/prompts/persona-eng-coder.md:22` = `self-fix (max 5 correction rounds)`——现为 `:41`。两处改前亦已偏（改前实读 `:16` / `:19` 与 `:23`），本笔使偏移扩大；请父侧路由。交付报告已逐条列出。
- 〔上抛·知会〕**存量重复（非本笔）**：`thincoder-core/prompts/persona-normal.md:7` ∥ `:11` 同句 `You own the code — the entire project is your code.`；D-PS3 判重复为缺陷（`docs/core/design/PROMPT-SYSTEM.md:3120`），不在本波边界，未动；交父侧横切检查 / 第四步复查。
- 〔上抛·知会〕验收 ⑤ 的全仓口径在并行波下不可达（见验收表 ⑤ 行与「改动面」）。

**门读数**

- `node scripts/prompt-refs-check.mjs`（仓根）⇒ 提示词面 69 档 · 代码面 463 档 · 命中 0 · `OK(prompt-refs): J1/J2/J3 三式零命中`。
- `cd thincoder-core && node test/run.mjs` ⇒ tests 35 / pass 35 / fail 0 / exit 0。
- `doc_check(mode:"gate", docs:[两档])`：会话内工具面 = `ERROR（引擎已更新 … > 进程启动 …）`（并行批改写 `thincoder-core/doc-check/**` 致本会话加载的引擎陈旧；非命中，范围 0 档）；盘上新引擎独立 node 进程（`staleEngineFiles` = `[]`）⇒ `DOC-CHECK GATE: PASS` · hits {total:0, anchors:0, width:0}。

### 第二波 · `thincoder-core/prompts/discipline-normal.md` + `thincoder-core/prompts/persona-eng-designer.md` 超长行重写（eng-coder · 2026-10-22）

**状态行**：实施完成（`thincoder-core/prompts/discipline-normal.md` 28 行 >300 → 0 · `thincoder-core/prompts/persona-eng-designer.md` 22 行 >300 → 0 · 映射表 50 行 · 审计 clean（0/0/0/0）· 评审 pass（🔴0，两轮）· 修正轮 1）

**派单**：设计 `docs/core/design/PROMPT-SYSTEM.md` §6.45「推进次序」第二步（样板经用户确认后按波推进 · 每席一到两档）；需求 `docs/core/requirements/ENGINEERING-MODE-V2.md` §13.24；台账 `#1735`；
  任务书 = 本批批次档 §2 + 派单正文（写形四条 / 样板六行 / 红线四条 / 验收 ①–⑥）。本波两档 = 甲舱 `thincoder-core/prompts/discipline-normal.md` 与 `thincoder-core/prompts/persona-eng-designer.md`。

**行长读数（一次性 `node` 脚本 · `split(/\r?\n/)` · 判 `length > 300`；改前 = 开工快照，改后 = 现档）**

| 档 | 时点 | 行数 | 字符数 | >300 行数 | 最长行 |
|---|---|---|---|---|---|
| `thincoder-core/prompts/discipline-normal.md` | 改前 | 263 | 38,535 | 28 | 756 @`:54` |
| `thincoder-core/prompts/discipline-normal.md` | 改后 | 314 | 38,706 | **0** | 296 @`:25`（未改行） |
| `thincoder-core/prompts/persona-eng-designer.md` | 改前 | 89 | 18,574 | 22 | 934 @`:35` |
| `thincoder-core/prompts/persona-eng-designer.md` | 改后 | 143 | 18,814 | **0** | 298 @`:105`（未改行） |

**改动面**：`git diff --numstat` 两档 = `79 插入 / 28 删除`（discipline-normal）· `76 插入 / 22 删除`（persona-eng-designer）。全仓 numstat 其余 13 档 = 并行波遗留（样板波与其它波次），非本席笔；本席写工具调用只触这两档。LCS 实核：删除集恰为 50 条超标行（28 + 22），其余行逐字未动。

**写形落地**：一条规则一行 · 行首短语题眼 · 条件与例外在规则之后（能独立成行的独立成行）· 理由独立成行且以 `Why` 起头 · 加粗只落在题眼。中文术语零改写（CJK 串多重集改前改后相等：待讨论 / 待设计 / 在途 / 待核销 / 已核销 / 已废弃 / 归批 / 条件 / 认账不排期 / 会诊 / 飞刀 / 已收口）。

#### 语义对账 · `thincoder-core/prompts/discipline-normal.md`（原文行 → 新行 · 四列）

四列判法：规则 / 条件 / 例外 / 理由；无该类内容写「—（本条无）」，不编。旧行号 = 改前快照行号，新行号 = 现档行号。

| # | 旧行 | 新行 | 规则 | 条件 | 例外 | 理由 |
|---|---|---|---|---|---|---|
| 1 | 26 | 26–29 | 写码前读相关文件并贴合周边风格；依赖前先确认项目已用过；外部 API 先联网查证；收尾前想边界并逐批自审 | before writing code · before depending · before using external APIs · before finalizing | —（本条无） | ✅ `:27`（同句携因：假定依赖只在运行期暴露，一轮已花掉） |
| 2 | 46 | 49–51 | 缺层就地补建（本轮所需且缺的层） | 本轮工作需要且缺失时 | 顺带看到、不阻塞当前工作的缺层 = 范围外 | ✅ `:50` Why：别处的档先消失，本仓层永久缺失 |
| 3 | 47 | 52–53 | 自持只管写面、读不受限；工作目录内可检索可引，工作目录外按声明 | 读工作目录外内容时 | —（本条无） | —（本条无） |
| 4 | 48 | 54–55 | 开工前查声明源；阻塞性缺源就地补清单；非阻塞噪音 = 范围外 | 开工前 · 源缺失时 | 阻塞 vs 不阻塞的缺源分界 | —（本条无） |
| 5 | 54 | 61–65 | 用户约定按原词实现；「等价实现」= 换掉约定；降级交付前先说；「parity with X」只描述来源；实现后逐点机验 | 用户给出交互 / 行为约定时 | 确认过的约定可简化 / 降级——但须交付前当面说 | ✅ 同句携因（用户约定是唯一判据） |
| 6 | 80 | 91–92 | 并行不划算的五类：同文件写 · 依赖等待 · bash / 审批风暴 · 同仓 git 冲突 · 有状态交错 | —（本条无） | 异步 spawn 声明 `files` 时由调度器排队，不算冲突 | ✅ 同句携因（成本对照） |
| 7 | 98 | 110–113 | 台账 = 待办书（需求池 + 技术债）；写面 = 主 agent；六态；四个移动时机 | —（本条无） | 子代理只读，发现走上抛 | —（本条无） |
| 8 | 100 | 115–116 | Register：一条需求一行，先扫同面已有行 | 复杂档（3+ 步 / 新功能） | 同题 = 同项 → 合并；否则记关系 | —（本条无） |
| 9 | 102 | 118–120 | Book a debt：范围内新债当日记；范围外不记；`trigger` 三值 | within scope | 范围外不记（criterion A） | ✅ `:120` Why：只住散文的债无人再看见 |
| 10 | 103 | 121–122 | Settle：收口后行两步走；结算依据入 `evidence` | 收口链跑完后 | 在途→已核销跳跃会洗成已完 | ✅ 同句携因（洗成已完） |
| 11 | 107 | 126–128 | 一交付目标 = 一批次档；开档触发 = 复杂档；中小改回填 | 目标变 / 阶段越 / 条目集变 | 诊断 / 只读探针零链不开档 | —（本条无） |
| 12 | 110 | 131–133 | 边做边记：§1 每笔 · §2 · §5；§5 = 实施者写 | —（本条无） | 直接做 = 你写；coder 接手 = 带 `batchDoc` 自写；无绑定交接 = 你代记并注明来源 | ✅ 同句携因（冻结后回改 = 重写历史） |
| 13 | 116 | 139–140 | 落地按批；明细 / 缺陷 / 当场点名直改；路由判据与工程同源 | 新机制 / 大改时 | 其余直接落地，收口兜底 | ✅ 同句携因（收口是兜底） |
| 14 | 130 | 154–156 | 范围外不记：不写报告 / 不记账 / 不上抛 / 不处置 | —（本条无） | 阻塞或推翻当前任务 ⇒ 按停报纪律 | ✅ `:155` Why：一眼判不出真假，入单即成事实 |
| 15 | 131 | 157–158 | finding = 查过的东西；入报告的发现须携读数或可复现路径 | —（本条无） | —（本条无） | —（本条无） |
| 16 | 137 | 164–165 | 设计时：像每天用这界面的人那样走一遍，把别扭 / 来回找 / 靠猜 / 该有没有的点名 | 设计轮 | —（本条无） | ✅ 同句携因（只盯机制 = 把界面的别扭一起交付） |
| 17 | 158 | 186–187 | 完成前跑项目自带验证并声明给 `verify`；语法 / 冒烟 / 测试由你跑 | 声明完成前 | —（本条无） | —（本条无） |
| 18 | 159 | 188–191 | 代码改动必须验证；单测定义；单测文件随批次档；单测不升集成 | —（本条无） | —（本条无） | ✅ 同句携因（每轮全绿 = 验证成本乘轮数） |
| 19 | 160 | 192–197 | 集成测定义；验收环；业务资产；发布门 = 全验证链；测试代码位置；套件只在前端入口 | —（本条无） | 核心不带集成套件（前端场景传递覆盖） | ✅ 同句携因（每改动加一案 = 成本随频次） |
| 20 | 171 | 208–210 | 收尾对账：实现偏差自己修到与档一致；真漂移 / 超范围交用户 | 收尾时 | 超本轮实施范围 ⇒ 交用户 | ✅ 同句携因（悄悄改档 = 替用户定规范面） |
| 21 | 175 | 214–215 | Advisor 改码后叫；必须给 `paths` / `documents` | 改代码后 | 判设计档是否存在 ⇒ 必须 `type:"design"` + `documents` | —（本条无） |
| 22 | 179 | 219–221 | 「本来就有问题」不是免修理由；只按技术理由反驳 | —（本条无） | 技术反驳成立则不改 | ✅ 同句携因（何时出现不决定该不该修） |
| 23 | 180 | 222–224 | 未解 🔴 保持可见；`Deferred` 适用面；`Deferred` 不是静默丢弃 | —（本条无） | `Deferred` 适用 🟡 / 🔵、需用户裁的 🔴、有理由的不修 🔴 | ✅ 同句携因（无理由 = 无从评估） |
| 24 | 182 | 226–227 | 非修必携理由；评审可推回 | 第 2 轮前可推回；第 3 轮起接受有理由的不修 | 无理由不修 = Unfixed | ✅ 同句携因（无理由无从评估） |
| 25 | 191 | 236–238 | 长输出先落日志再读；日志尾读摘要、grep 失败细节 | 全量 / 长测试（≥60s）或可能截断的输出 | —（本条无） | ✅ `:238` Why：过滤丢失败细节、管道缓冲截尾 |
| 26 | 220 | 267–269 | 同文件异步 spawn 有声明即可发；必须声明 `files`（调度器只看声明域）；同步冲突报错不排队 | 异步 spawn | 同步冲突 = 报错（不排队） | ✅ `:269` Why：手串行 = 白等 + 堵队列 |
| 27 | 230 | 279–280 | 验收子代理交付：实现与设计 / 指令比对；实现偏差修好；漂移 / 超范围交用户 | 验收子代理交付时 | 超本轮实施范围 ⇒ 交用户 | ✅ 同句携因（零额外 LLM：反正要读文件） |
| 28 | 241 | 291–292 | consult 流程：后台跨轮跑，落定后全文自动到达；消化时用自己的工具判每条 | —（本条无） | —（本条无） | —（本条无） |

#### 语义对账 · `thincoder-core/prompts/persona-eng-designer.md`（原文行 → 新行 · 四列）

| # | 旧行 | 新行 | 规则 | 条件 | 例外 | 理由 |
|---|---|---|---|---|---|---|
| 1 | 6 | 6–8 | 实现码 = coder 面；英文运行面 = 产品代码（主 agent 内容权，写它绕过写门）；你的提示词笔 = 中文评审面；开评审 = 主 agent / 用户 | —（本条无） | —（本条无） | ✅ 同句携因（自开评审 = 先花掉注意力和 token） |
| 2 | 14 | 16–17 | 写域 = 设计档 + 中文评审面提示词；英文运行面不是你的 | —（本条无） | 中文模板 = 设计轮直接落地；英文面由 coder 落 | ✅ `:17`（产品代码 = 主 agent 内容权） |
| 3 | 25 | 28–32 | A · 范围外不记：不写报告 / 不记账 / 不上抛 / 不处置 | —（本条无） | 阻塞或推翻当前任务 ⇒ 停报（不是范围外发现，是当前任务被卡） | ✅ `:30` Why：一眼判不出真假，入单即成事实 |
| 4 | 26 | 33–34 | B · finding = 查过的东西；入报告须携读数或可复现路径 | —（本条无） | —（本条无） | —（本条无） |
| 5 | 27 | 35–37 | 范围内异常逐条进报告（含「本批不阻塞」观察） | —（本条无） | —（本条无） | ✅ `:37` Why：静默修的发现无记录、无人可核 |
| 6 | 28 | 38–40 | 修 / 抛分界：一致性面可当场修；语义面必停报 | —（本条无） | 一致性面：重复登记 / 死指针 / 计数不符 / 形态不一 | ✅ 同句携因（语义面自修 = 落了没人批的需求变更） |
| 7 | 30 | 42–45 | 修订式表达检查：规范面见到即删（删除线 / 「先前 X 改为 Y」/ 作废标记） | 起草 / 对账时 | —（本条无） | ✅ `:45` Why：残留让读者把死项当活单重开 |
| 8 | 31 | 46–51 | 接单纪律：`Suggestion` = 处置建议、执行者 = 你；归属句 ≠ 豁免令；按编号回报；新语义不进修轮 | 修轮派单时 | 归属句若指需求档问题 ⇒ 交主 agent | ✅ 同句携因（跳过表 = 整表未做） |
| 9 | 34 | 54–55 | 轮语义：initial = 空白起步可广探；fix = 目标钉死只点修 | —（本条无） | —（本条无） | ✅ `:55` Why：全探把轮花在已钉住的点上 |
| 10 | 35 | 56–64 | 自己探：读码 / 档 / 既有设计取 `file:line`；先跑勘察清单 ①–④；探预算 ≤6 spawn / 批；主 agent 结果只作参考 | 勘察前 | 主 agent 的勘察结果可参考、不能替代自身勘察 | ✅ `:63` Why：无界勘察把轮花在写设计之前 |
| 11 | 36 | 65–67 | 自己写的坐标必须带 `file:line`；审阅者 / 父侧给的坐标只作引用不复读；新写坐标各读一次；自身勘察不豁免 | —（本条无） | 复读他人已给坐标 = 豁免项 | —（本条无） |
| 12 | 37 | 68–70 | 先落地后修正；首版 ≤15 轮 / 单档修 ≤10 轮；过半未落地 ⇒ 降级交付 | 首版 >7 轮 / 单档修 >5 轮且未落地 | 降级形 = 骨架 + 未决清单 | —（本条无） |
| 13 | 38 | 71–72 | 需求档合规检查：五要素 / 判据行 / 验收；不符 ⇒ 抛回；需求档笔 = 主 agent | —（本条无） | 一致性问题也报主 agent 定（自修 = 第二支笔） | ✅ 同句携因（同面两支笔互相覆盖） |
| 14 | 47 | 81–86 | 送审前自检五项 ①–⑤ | 送审前 | 任一项不过 ⇒ 先修 | —（本条无） |
| 15 | 48 | 87–88 | doc-check gate：返回前跑 gate，整档入判；只有首行 `PASS` 才可返回，报告写 `doc_check: PASS (N docs)` | 返回前 | —（本条无） | —（本条无） |
| 16 | 49 | 89–93 | `REFUSED` ⇒ 同轮修到零命中再跑；不清楚怎么修 ⇒ 上抛主 agent，主 agent 不确定 ⇒ 转用户；与已批设计冲突 ⇒ 停报；命中当轮修不记账 | —（本条无） | 自批豁免会让错规则存活 ⇒ 不许 | ✅ `:91` Why：你写的错规则会因你自批而继续活着 |
| 17 | 53 | 97–98 | 批次任务 = 覆盖条目 / 不在本批条目 / 受影响档 / 验收 → `§2`（追加）；不写进设计档 | —（本条无） | —（本条无） | ✅ 同句携因（一次性内容混进长档会被下一批覆盖） |
| 18 | 54 | 99–101 | `§2` 引而不抄：判据 / 计数指向其所属节 | 需出现字面值时 | 字面值只作该节的值、旁边带引 | ✅ `:100` Why：抄进 `§2` 的数在抄的那一刻冻结 |
| 19 | 61 | 108–109 | 板档组织：档归板（一板可多档、板内分域）；架构级机制档可用目标与约束替代逐项故事 | —（本条无） | 架构级豁免（既有惯例） | —（本条无） |
| 20 | 72 | 120–123 | 方法 / 理由：设计层直写「决定 + 理由」；附最接近先例行；附勘察证据行；候选枚举不再要求 | —（本条无） | 「无相关」也要记录（沉默会被读成「勘察过」） | ✅ 同句携因（无理由的设计不可评） |
| 21 | 81 | 132–134 | 设计 / 需求档只写当前态；可追溯性住 git 提交 + 批次档 | —（本条无） | —（本条无） | ✅ `:133` Why：变更记录是最大注入污染源 |
| 22 | 89 | 142–143 | 报告形：只给结论 + `number → change file:line` | —（本条无） | —（本条无） | ✅ `:143` Why：过程是内部事务，证据纪律只要求结论带坐标 |

#### 验收对照（派单 ①–⑥）

| # | 验收 | 读数 |
|---|---|---|
| ① | 两档每一行 ≤300；改前改后各报一次 | ✅ discipline 28 → **0**（最长 756 → 296）· persona 22 → **0**（最长 934 → 298）；读数 = 上表 |
| ② | 逐档四列映射表，逐条不空 | ✅ 上表 28 + 22 = 50 行；无空串、无为凑格编造（无该类内容写「—（本条无）」） |
| ③ | `node scripts/prompt-refs-check.mjs` 命中 0 | ✅ 提示词面 69 档 · 代码面 463 档 · 命中 0 |
| ④ | `cd thincoder-core && node test/run.mjs` 全绿 | ✅ 35 tests / 35 pass / 0 fail |
| ⑤ | `git diff --numstat` 只出两档 | ⚠️ 两档读数 = `79/28` · `76/22`；全仓 numstat 其余 13 档 = 并行波遗留（本席写工具调用只触两档） |
| ⑥ | 每档最长五行改前 / 改后逐字 | ✅ 见交付报告「最长五行」节（本段不重抄） |

**门读数**：`doc_check(mode:"gate")` 会话内 = `ERROR（引擎已更新…须重启会话后复跑）`——结构性原因 = 并行波在本会话启动后改写了 `thincoder-core/doc-check/` 引擎档；
  盘上新引擎独立 `node` 进程直调 `runDocCheck(root, {mode:"gate"})` ⇒ **`DOC-CHECK GATE: PASS` · hits {total:0, anchors:0, width:0}**（阈值 300）。本批 §5 的两次 `batch` append 回执均带该 ERROR 行（范围 0 档），非本段内容命中。

#### 审计与评审轮次 · 终态

| 轮 | 面 | 读数 | 终态 |
|---|---|---|---|
| 内部审计 | explore 偏差审计（50 行映射逐行对读 · 四类内容 · CJK / 实词差集 · 名单外） | PARTIAL 0 · SILENT-SIMPLIFICATION 0 · DOC-DRIFT 0 · OUT-OF-LIST 0；`^.{301,}$` 两档零命中 | `clean` |
| 代码评审 · 轮 1 | advisor `type:"code"`（两档；设计 §6.45 + 需求 §13.24 为判据上下文） | `VERDICT: pass`；🟡 可选 4（情态弱化 · 两处仍两规则一行 · 一条读数归属待证 · 映射表 / 脚本证据面不在评审范围）+ 🔵 若干 | `clean`（pass） |
| 代码评审 · 轮 2 | advisor 复核四条 fix claim（同一目标面） | 四条全部成立：`:36` 情态复原 · `:192-193` 拆分 · `:196-197` 拆分 · 两档 0 行 >300（296 @`:25` · 298 @`:105`）；`VERDICT: pass` | `clean`（pass） |

**评审后自修（修正轮 1 · 本席笔）**：① `thincoder-core/prompts/persona-eng-designer.md:36` 情态复原为 `must carry`（与 `:34`、`thincoder-core/prompts/discipline-normal.md:158` 同强度）；② `thincoder-core/prompts/discipline-normal.md:192–193` 拆分（集成测定义 + 验收环）；
  ③ `thincoder-core/prompts/discipline-normal.md:196–197` 拆分（测试代码位置 + 套件归属）。修后复跑：两档 0 行 >300 · `prompt-refs-check` 0 · `test/run.mjs` 35/35。

**评审余项（不属本席笔）**：轮 1 的「`:133` 读数被删」一项经实证**不成立**——改前快照（`thincoder-core/prompts/persona-eng-designer.md`）全文既无 `8645` 也无 `12.2`，评审比对的 `cabin-a-baseline` 是更早副本；改前原句本就无量化读数，本波零删除。该项闭环为误读，不另立条目。

#### 决策披露

| # | 决策 | 理由 |
|---|---|---|
| D1 | 只重写 >300 行及其直接续行，其余行逐字不动 | 派单边界 = 50 条超标行；LCS 实核删除集恰为 50 行，其余行 byte-identical——把改动面钉在可审范围内 |
| D2 | 原句内联的理由改独立 `Why` 行；原句无理由的行不造 Why | 设计 §6.45 机制 5；D-PS42 ①「不硬编因果」——查无依据就不补理由 |
| D3 | 中文术语原样保留、不译不改 | 术语是台账 / 批次机制的操作数；CJK 串多重集改前改后相等可核 |
| D4 | 评审后按可选项自修 1 轮（情态 + 两处分行） | 情态弱化触及「判据强度不变」；两行仍两规则违背「一条规则一行」——廉价且可机核，修后复跑全绿 |
| D5 | 未改：多加点处的既有风格、`criterion A` 标签、`.md` / `§N` 字面 | 均属改写集之外的既有行或规范豁免面；只改改写行会造成同档两套写法（一致性反而更差）；设计 §6.45 明写验收线只有 A1 / A2 两条 |

#### 上抛项

- 〔上抛·知会〕并行波仍在改其它提示词档（全仓 numstat 13 档），收口时以本席两档为增量核。
- 〔上抛·知会〕设计 `docs/core/design/PROMPT-SYSTEM.md` §6.45 受影响文件表的列头「现行」= 改前基线（A1 明文「改前读数 = 本节落点表」），本波改后读数已入本段；该表不随本波改，收口轮如需「现行」口径由设计席随正。
- 〔上抛·知会〕评审两轮的引证核验报「file unreadable」= 路径基准差（评审用 `thincoder-core/prompts/...`，工作区根下不解析；实际取件 `thincoder/thincoder-core/prompts/...`）。父侧重跑 A1 脚本时 CWD 须为 `thincoder/`，否则「>300 = 0」可能是空扫假绿。

### 甲舱第二波 · discipline-engineering + persona-coder 超长行重写（eng-coder · 2026-10-22）

**派单**：设计 `docs/core/design/PROMPT-SYSTEM.md` §6.45（写形四条 · 逐字围栏块 · 推进次序第二步「每席一到两档」）· 需求 `docs/core/requirements/ENGINEERING-MODE-V2.md` §13.24（FR46）。
任务书 = 本批批次档 §2 + 派单正文；红线 = 规则 / 条件 / 例外 / 理由四类内容不得丢 · 不许新增规则 · 档里已有的中文术语原样保留 · 只改这两档。

**落点**：两档，只重排超长行；长度 ≤300 的行逐字未动。
机械对读：discipline 改前 204 行中 156 条短行、persona-coder 20 行中 19 条短行，逐行仍在现档（multiset 对读，0 条缺失）。

**行长读数（一次性 `node` 脚本 · `split(/\r?\n/)` · 判 `length > 300`）**：

| 档 | 时点 | 行数（split 段） | 字符数 | >300 行数 | 最长行 |
|---|---|---|---|---|---|
| discipline-engineering | 改前 | 205 | 39,858 | **48** | **1,389 @`:42`** |
| discipline-engineering | 改后 | 329 | 40,401 | **0** | **300 @`:68`**（未改动的原 `:40`） |
| persona-coder | 改前 | 21 | 1,723 | **1** | **386 @`:8`** |
| persona-coder | 改后 | 23 | 1,665 | **0** | **203 @`:9`**（重写行；原 187 行现 `:13`） |

split 段数含末尾空段；内容行 = 段数 − 1（`read` 工具的「N lines total」同口径）。

**改动面**：`git diff --numstat` = `173 插入 / 49 删除`（discipline）· `3 插入 / 1 删除`（persona-coder）。
开工基线（13:11）的 9 档 `M` 为并行批遗留；现盘 15 档 `M` 中其余 13 档 = 同波并行席产物（mtime 13:12–13:13）⇒ **本席增量 = 这两档**。

**写形落地**：一条规则一行 · 行首短语点题 · 条件与例外在规则之后（能独立成行就独立成行）· 理由独立成行以 `Why` 起头 · 加粗只落题眼。
中文术语零改写：`归批` / `条件` / `认账不排期` / `已定决定` 逐词计数 1→1（本两档仅这四词在册）；译名与缩写原样（eng-coder / eng-designer / UAT / doc-check）。

**机械对读（丢句 / 新增 / 覆盖）**：

- 改前 48 条 >300 行逐条映射到新块；diff 新增 172 行**全部**落在映射块内（0 行未覆盖 · 0 块不含旧行）——映射表覆盖整个 diff。
- 全档词表差集：旧有而新无 = `able`（`must be able to answer` → `must answer`）· `covering`（→ `covers`）；新增 = `covers` / `applies`（均为词形）。
- persona-coder 旧有而新无 = `evidence` / `discipline` / `already` / `injected` / `assembly` —— 全部来自删掉的括注「(Evidence discipline / task boundary / delivery table: already injected with this assembly.)」（指代 + 自我限定，属可删类；见 D2）。
- 标题行：discipline `##` / `###` 共 17 条、persona-coder `##` 3 条，改前改后逐字相同。

#### 验收对照（派单 ①–⑥）

| # | 验收 | 读数 |
|---|---|---|
| ① | 两档每行 ≤300；改前 / 改后各报一次 | ✅ 48 + 1 → **0**；最长 1,389 → 300（未改行）· 386 → 203 |
| ② | 四列映射表逐行给判断，无内容写「—（本条无）」，不编 | ✅ 下表 49 行（discipline 48 + persona-coder 1） |
| ③ | `node scripts/prompt-refs-check.mjs` 命中 0 | ✅ 提示词面 69 档 · 代码面 463 档 · 命中 0 |
| ④ | `cd thincoder-core && node test/run.mjs` 全绿 | ✅ 35 tests / 35 pass / 0 fail |
| ⑤ | `git diff --numstat` 只出这两档 | ✅ 本席增量 = 这两档（`173/49` · `3/1`）；其余 13 档 = 同波并行席 |
| ⑥ | 每档最长五行改前 / 改后逐字 | ✅ 见「最长五行」节 |

#### 语义对账（原文行 → 新行 · 四列 · discipline-engineering 1–25）

四列判法 = 规则 / 条件 / 例外 / 理由；无该类内容写「—（本条无）」，不编。新行号 = 改后档行号。

| # | 旧行 | 新行 | 规则 | 条件 | 例外 | 理由 |
|---|---|---|---|---|---|---|
| 1 | 4 | 4–7 | 本块规则皆自加；每条须答「立于何结构、值不值」 | 前提变化时重审 | —（本条无） | `:7` Why：旧结论当常设令 = 规则在死前提上活着 |
| 2 | 6 | 9–14 | 四步全走；三份文档；验收分界；单测不留档 | 交付面（客户验收我们） | 内部面（我们验收 coder）不必留档 | `:14` Why：直接写码十有八九错 |
| 3 | 7 | 15–16 | 坏结构当场修（本次碰到的当场修） | 变更撞上错的代码结构 / 状态归属 | —（本条无） | `:16` Why：最小补丁遮症状、下次再补一层 |
| 4 | 8 | 17–19 | 批次档 + 台账是跟踪权威；每条需求一条目（§2 + 台账行） | 需求确认后；`task` 工具机械禁用 | —（本条无） | —（本条无） |
| 5 | 10 | 21–23 | 「太小 / 顺手修」不是压缩步骤的理由；问「流程适用吗」即全流程 | 任何规模请求 | —（本条无） | `:22` Why：模式选定那刻规模已判、无变更免落设计档 |
| 6 | 12 | 25–26 | 前提被推翻 ⇒ 上抛 `ask` | 代码与设计 / 任务书相抵 | —（本条无） | `:26` Why：跑完错的前提，终端报告太迟 |
| 7 | 24 | 38–41 | 未列举路径一律产品码面（fail-closed）；product-text 面单列 | 路径不在工具面 / 文档面枚举内 | —（本条无） | `:39` Why 优先走流程；`:41` Why 成品是对外契约 |
| 8 | 25 | 42–44 | 直改两条硬约束；机械变更定义；改判据语义者仍走设计 | 机械变更（不改判据语义） | 改判据语义 ⇒ 不走直改面 | —（本条无） |
| 9 | 26 | 45–47 | 授权判据 ≠ 绕过门；门优先 | 路由与门相抵 ⇒ 停报 | —（本条无） | `:47` Why：拿路由顶门只会把门关掉 |
| 10 | 37 | 58–62 | 设计前问需求、覆盖四类；判「问过」= 四类能答的都问过 | 新功能 / 新业务规则 | —（本条无） | `:61` 未问的清单不是讨论、配额会问过头；`:62` 事实不能代替用户陈述 |
| 11 | 39 | 64–67 | 完成判据 = 五元素 + 用户明确确认；未确认前产出 = 问题清单 | 进入设计前 | 代理自读「够清楚」不算确认 | —（本条无） |
| 12 | 41 | 69–73 | 设计 = 目标态 / 方案与理由 / 影响档 / 可验验收；问题陈述不进设计档 | 设计步 | —（本条无） | `:72` Why：批次档 = 过程档、设计档 = 状态档 |
| 13 | 42 | 74–83 | 三问 · 三形 · 落点；先对齐既有形；偏离须点名能力 / 契约失败 | 任何新名称 / 组件 / 端点 / 文案 | `existing but unusable` 可偏离（须给具体失败） | `:82` 口味不是理由；`:83` 为不同而不同 = 违规 |
| 14 | 43 | 84–86 | 设计前扫工作目录内公共源文档、落勘察证据行 | 设计前置 | `none relevant` 也记 | `:86` Why：没有通用纪律会自己触发 |
| 15 | 49 | 92–95 | 实跑验证；测试不产测试设计档；UAT = 交付面文档 | 每次变更 | 单测不留常驻档 | `:95` 验证花费 ∝ 失败代价 |
| 16 | 52 | 98–99 | 轻通道三类命中即走（跳过设计→评审→批准） | 三类之一 | 绕过 ≠ 取消 | —（本条无） |
| 17 | 62 | 109–111 | 诊断 / 探针零链；性能观察类无结构变更且前后读数可证；轻通道笔 = 主 agent 直改 | 轻通道笔（披露携 revertable） | 大修仍走 eng-coder | —（本条无） |
| 18 | 64 | 113–117 | 一轮 = 一份批次档 + 逐笔台账行；开局先记账；收口一次全链 | 轮开（第一笔前） | 收口未落 ⇒ 不结算 | `:114` 无账的笔不成立；`:117` 账仍开 |
| 19 | 78 | 131–134 | 范围外不记 / 不登 / 不上抛 / 不动 | 范围外所见 | 阻塞或推翻当前任务 ⇒ 停报 | `:132` Why：一眼判不出真假、入单即成事实 |
| 20 | 79 | 135–136 | finding = 查过的东西；入报告须携读数或可复现路径 | 入报告的发现 | 未跑未走全调用路径 = 猜，不写 | —（本条无） |
| 21 | 85 | 142–143 | 设计轮交付内写自检（按每天用这界面的挑剔用户走查） | 有 UI / 交互变更 | 拿不准的偏好摆上桌问 | `:143` 只花在机制上会连别扭一起交付 |
| 22 | 105 | 163–168 | 单测 = 单组件隔离、变更期反馈环；用了就删；实施者只写只跑变更面；不升集成 | 批收口 | 零保留 | `:165`–`:166` Why：体量 × 跑全部 = 验证成本高于编码成本 |
| 23 | 107 | 170–174 | 集成测 = 组件协同、发布前验收环；只断言业务可观察结果；套件 ≈50–100 例 | 发布前 | 超 100 例 = 过测（裁不加） | —（本条无） |
| 24 | 108 | 175–179 | 体量持平不累积；单测零保留、集成在预算内；两者不互转 | 项目增长 | —（本条无） | `:176` Why：永久测试税每次变更、绕开的套件保护不了 |
| 25 | 111 | 182–184 | 集成测 = 发布门不是工作节奏（收口跑一次、父侧） | 收口 | 无集成测 ⇒ 门诚实空绿 | `:183`–`:184` 单测凑的门只说明有点绿 |

#### 语义对账（续 · discipline-engineering 26–48 + persona-coder 49）

| # | 旧行 | 新行 | 规则 | 条件 | 例外 | 理由 |
|---|---|---|---|---|---|---|
| 26 | 112 | 185–186 | 断言骑行为不骑散文 | 新断言 | 只允许行为形与结构机判形 | `:185` 读档断句子的测试遇改词就红 |
| 27 | 113 | 187–189 | 业务门必带失败用例（喂不满足输入、断言拒绝 + 可读理由） | 门须拒绝时 | —（本条无） | `:189` Why：没见过拒绝的门可能一路兜住 |
| 28 | 117 | 193–195 | 命名须自带定义（或可核定义 + 来源） | 指定一个事物 | —（本条无） | `:195` Why：生造词逼每个读者现编含义 |
| 29 | 118 | 196–199 | 一物一名（档词 = UI 词 = 对话词 1:1）；新名锚到已有概念并写映射 | 新名 | 无对应概念 ⇒ 登记替代 / 扩展了什么 | `:197` 第二个名字 = 缺陷 |
| 30 | 143 | 224–226 | 本轮需要且缺失的文档层当场建 | 本轮工作需要 | 不阻塞的顺手发现 = 范围外（不记不做） | `:225` Why：别处档会被删、本层永久缺 |
| 31 | 149 | 232–235 | 多仓并存是常态、先定目标仓；写面与工具路径参数取显式目标 | 写或传路径前 | 多候选 ⇒ 显式绝对路径 | `:234` 替用户选 = 写错仓 + 跨仓返工；`:235` 卡住的会话丢掉可修复的那轮 |
| 32 | 152 | 238–239 | 他仓发现 = 范围外（不记 / 不登 / 不上抛） | 他仓发现 | 阻塞或推翻当前任务 ⇒ 停报，另起一轮 | —（本条无） |
| 33 | 153 | 240–242 | 跨仓耦合只走接口；提交按仓各提各的 | 跨仓协作 | 本句只管耦合不管读 | —（本条无） |
| 34 | 155 | 244–245 | 自持管写、读不受限；工作目录内容默认可搜可读可引 | 写 vs 读 | 目录外按声明读 | —（本条无） |
| 35 | 156 | 246–248 | 实现 / 设计前查已声明源；阻塞的缺源随手补清单 | 设计 / 实现前 | 不阻塞的噪声 = 范围外 | —（本条无） |
| 36 | 163 | 255–256 | 跨面对齐走共享设计、不走某面成品 | 多实现面 | 本句只描述实现形态，不是保留差异的理由 | —（本条无） |
| 37 | 165 | 258–259 | 面专属节留本面、不并别面 | 某面独有内容 | 非机制内容、不是保留机制差异的理由 | —（本条无） |
| 38 | 180 | 274–275 | 范围内欠账当日记账（trigger 裸枚举 + evidence）或上抛 | 范围内的欠账 | 范围外不记 | —（本条无） |
| 39 | 185 | 280–281 | D1 写权矩阵（各类档唯一作者；提示词 = 内容权威 + 落地按面分笔） | 写档时 | —（本条无） | —（本条无） |
| 40 | 188 | 284–287 | D4 指针形 `doc:section`、禁相对指针；实现坐标用仓根全路径 + `:line` | 写指针 / 坐标 | 盘面 as-of 读数与评审引文各有其面、不受两形管 | —（本条无） |
| 41 | 191 | 290–293 | D7 结算同步清单（角色表 / 状态行 / 计数 / §2↔设计档对账 / 指针 / 待办勾销） | 每次批结算 | 错配以追加 §2 更正或记 §6 关闭 | `:293` 用过期 §2 判收口会把正确实现判红 |
| 42 | 192 | 294–299 | 清单余项（上批遗留 / 修轮前置 / 暂缓清单 / 暂缓批 / 用户文档面 / 台账可见面） | 批结算 | 无暂缓批 ⇒ 一行「deferred-batch re-check: none」 | —（本条无） |
| 43 | 194 | 301–305 | D8 规范面失效表达必删；需求 / 设计档无历史 | 表达失效（被否 / 对象没了 / 被取代） | 历史归 git 提交 | `:304` Why：陈旧句是 RAG 污染源 |
| 44 | 195 | 306–310 | D9 写规范文本须携 why（依据在先 / 携理由 / 来源可核 / 简短） | 更新或新增规范文本 | —（本条无） | `:307` 无依据的删改让规则无人可核；`:309` 编的理由无源可指 |
| 45 | 198 | 313–316 | 写档要内容完整、格式可读（正常换行、单行 ≤300） | 写 / 改需求层设计层档 | 项目自己的档约优先 | `:315` 不可读的档等于没写 |
| 46 | 202 | 320–323 | 工程阶段可并行、积极并行（一批只读调用 / 多档 edits / 多个子代理） | 阶段间独立 | —（本条无） | —（本条无） |
| 47 | 203 | 324–325 | 并行的代价（同档互覆 / 依赖等输入 / 审批风暴 / git 相撞 / 状态交错） | 考虑并行时 | 小操作（<1s）不并行 | —（本条无） |
| 48 | 204 | 326–328 | 并发是常态（顶层 spawn 立即返回、报告自达） | 派出后 | —（本条无） | `:328` Why：攥着逐枚等 = 把并行排成串行 |
| 49 | 8 | 8–10 | persona-coder：中立（实现设计、不是设计者）；冲突即停报父侧 | 设计与代码冲突（接口破坏调用者 / 符号不存在） | —（本条无） | `:10` Why：悄悄适配 = 交付没人批过的设计 |

#### 最长五行（改前 / 改后 · 逐字）

改前逐字取自 `git show HEAD` 快照，改后逐字取自现档。围栏内为原文，围栏外才是本段的话。

**discipline-engineering · 1 · 旧 `:42`（1,389 字符）→ 新 `:74–83`（十行）**

改前：

~~~text
   - **Closest-precedent survey = three questions before any new landing** (any landing: design or direct pen): before any new name ∥ component ∥ endpoint ∥ label text, answer and write down — **where does this function live now** (a code coordinate ∥ a doc section) · **what is it called** (the 
  existing name, verbatim) · **who uses it** (callers ∥ consumers). Three shapes: `existing: <coordinate> · name: "<verbatim>" · consumers: <who>` ⇒ **use the existing piece** (name copied verbatim, component reused, endpoint connected); `none found: <which surfaces were checked>` — only a checked 
  absence earns a new build; a missing line = "not checked", not "checked, none found"; `existing but unusable: <coordinate> · name: "<verbatim>" · failed on: <the capability ∥ contract failure>`. In a design doc: one line per new landing in the new-mechanism section; a direct pen: one line in batch
  
  record §1 beside that pen. Survey how **similar / same-kind features currently do it** (implementation coordinates ∥ design sections ∥ precedent batches) — **align first** (the existing shape: component ∥ layout ∥ criteria ∥ wording); a deviation needs the existing piece **not reusable**, and its 
  rationale names the **concrete failure on the capability ∥ contract face** — a different shape, a smoother fit or a nicer look is taste, not a rationale; **diverging for its own sake = a violation**.
~~~

改后：

~~~text
   - **Closest-precedent survey = three questions before any new landing** (any landing: design or direct pen): before any new name ∥ component ∥ endpoint ∥ label text, answer and write down.
     **The three questions**: where does this function live now (a code coordinate ∥ a doc section) · what is it called (the existing name, verbatim) · who uses it (callers ∥ consumers).
     **The answer takes one of three shapes**:
     - `existing: <coordinate> · name: "<verbatim>" · consumers: <who>` ⇒ **use the existing piece** (name copied verbatim, component reused, endpoint connected).
     - `none found: <which surfaces were checked>` — only a checked absence earns a new build; a missing line = "not checked", not "checked, none found".
     - `existing but unusable: <coordinate> · name: "<verbatim>" · failed on: <the capability ∥ contract failure>`.
     **Where the answer lands**: in a design doc, one line per new landing in the new-mechanism section; in a direct pen, one line in batch record §1 beside that pen.
     **Survey how similar / same-kind features currently do it** (implementation coordinates ∥ design sections ∥ precedent batches) — **align first** (the existing shape: component ∥ layout ∥ criteria ∥ wording).
     A deviation needs the existing piece **not reusable**, and its rationale names the **concrete failure on the capability ∥ contract face** — a different shape, a smoother fit or a nicer look is taste, not a rationale.
     **Diverging for its own sake = a violation.**
~~~

**discipline-engineering · 2 · 旧 `:105`（1,135 字符）→ 新 `:163–168`（六行）**

改前：

~~~text
- **Unit tests** exercise **a single component in isolation** (its external collaborators stubbed or faked) — the **feedback loop the developer runs right after the change**, answering "did this spot get fixed right?". **Delete on use — an action, not a question.** At closeout the batch's unit test 
  files are deleted; exactly one reading line stays in batch record §5 (what was verified + command + result), and no executable file is kept. **Why**: after any change the reflex is to run everything, and this is an engineering-scale product — one agent-day produces code that would need hundreds of
  
  unit tests to verify, while unit tests are per-batch and one-off; so **accumulated test volume × the run-everything reflex = verification cost far above coding cost**. Delete the runnable artifacts and there is no "everything" left to run. **The change's implementer writes them and runs exactly 
  those for the changed face (nobody else, no per-round re-runs, not another batch's files)**. **Unit test files are not promoted into integration tests** (integration cases are established from business needs, not graduated from unit files).
~~~

改后：

~~~text
- **Unit tests** exercise **a single component in isolation** (its external collaborators stubbed or faked) — the **feedback loop the developer runs right after the change**, answering "did this spot get fixed right?".
- **Delete on use — an action, not a question**: at closeout the batch's unit test files are deleted; exactly one reading line stays in batch record §5 (what was verified + command + result), and no executable file is kept.
  Why: after any change the reflex is to run everything, and this is an engineering-scale product — one agent-day produces code that would need hundreds of unit tests to verify, while unit tests are per-batch and one-off.
  So **accumulated test volume × the run-everything reflex = verification cost far above coding cost** — delete the runnable artifacts and there is no "everything" left to run.
- **The change's implementer writes them and runs exactly those for the changed face** (nobody else, no per-round re-runs, not another batch's files).
- **Unit test files are not promoted into integration tests** (integration cases are established from business needs, not graduated from unit files).
~~~

**discipline-engineering · 3 · 旧 `:107`（818 字符）→ 新 `:170–174`（五行）**

改前：

~~~text
- **Integration tests** exercise **components working together** (the real composition — a front-end scenario drives the core transitively) — the **pre-release acceptance loop**: walk through the real business from a user-visible entry; project assets: business scenarios + production-problem 
  additions, asserting only business-observable results; permanent, and a single change adds no case to the set (per-change additions make cost scale with change frequency); a repo's integration-suite budget is **≈50–100 cases — beyond that is over-testing** (trim rather than add). **Integration 
  test cases and test code live together in the project's `test/` directory**. Integration suites live in the **front-end entry points only** — front-end scenarios cover the core transitively (the core carries no integration suite).
~~~

改后：

~~~text
- **Integration tests** exercise **components working together** (the real composition — a front-end scenario drives the core transitively) — the **pre-release acceptance loop**: walk through the real business from a user-visible entry.
- **Project assets**: business scenarios + production-problem additions, asserting only business-observable results.
- **Permanent, and a single change adds no case to the set** (per-change additions make cost scale with change frequency); a repo's integration-suite budget is **≈50–100 cases — beyond that is over-testing** (trim rather than add).
- **Integration test cases and test code live together in the project's `test/` directory.**
- **Integration suites live in the front-end entry points only** — front-end scenarios cover the core transitively (the core carries no integration suite).
~~~

**discipline-engineering · 4 · 旧 `:64`（721 字符）→ 新 `:113–117`（五行）**

改前：

~~~text
- **Round form**: a light-channel round = one batch record (per-pen entries: disclosure · change · walkthrough · freeze) + per-pen ledger rows; **start-up booking** — at round open (before the first pen) create the round batch record + the round ledger row first (the account precedes the pen; a pen 
  without an account = not established); one full chain at closeout (design formalization → independent review (code · record · doc reconciliation) → fixes (if any) → approval → closeout settlement, including the necessary tests — **convergence-face pens = the red-then-green reproduction pair ∥ the 
  before/after reading pair**); **closeout not landed ⇒ no settlement** (the batch record · the round ledger row stays open).
~~~

改后：

~~~text
- **Round form**: a light-channel round = one batch record (per-pen entries: disclosure · change · walkthrough · freeze) + per-pen ledger rows.
- **Start-up booking**: at round open, before the first pen, create the round batch record + the round ledger row first — the account precedes the pen; a pen without an account = not established.
- **One full chain at closeout**: design formalization → independent review (code · record · doc reconciliation) → fixes (if any) → approval → closeout settlement, including the necessary tests.
  **Convergence-face pens = the red-then-green reproduction pair ∥ the before/after reading pair.**
- **Closeout not landed ⇒ no settlement** — the batch record and the round ledger row stay open.
~~~

**discipline-engineering · 5 · 旧 `:6`（703 字符）→ 新 `:9–14`（六行）**

改前：

~~~text
1. **Every dev task walks the four steps, no skipping**: Requirements → Design → Development → Testing. **Three things are written down**: the requirement doc, the design doc, and the **UAT report** (integration testing = user acceptance testing — the one the client signs; **one per delivery end**, 
  since the signature is per deliverable, not per task). The dividing line = **who accepts whose work**: the delivery face (the client accepts ours) keeps a document; the internal face (we accept the coder's) need not. Unit tests stay the change-time feedback loop (**the batch's unit test files** — 
  added as you go) and leave no standing document. Jumping straight to code is wrong nine times out of ten.
~~~

改后：

~~~text
1. **Every dev task walks the four steps, no skipping**: Requirements → Design → Development → Testing.
   **Three things are written down**: the requirement doc, the design doc, and the **UAT report**.
   **The UAT report** = integration testing = user acceptance testing, the one the client signs; one per delivery end, since the signature is per deliverable, not per task.
   **The dividing line = who accepts whose work**: the delivery face (the client accepts ours) keeps a document; the internal face (we accept the coder's) need not.
   **Unit tests stay the change-time feedback loop** (the batch's unit test files — added as you go) and leave no standing document.
   Why: jumping straight to code is wrong nine times out of ten.
~~~

**persona-coder · 最长五行**

改前 / 改后（2–5 为未改动行，行号因首条重写而位移）：

| # | 改前 | 字符 | 改后 | 逐字 |
|---|---|---|---|---|
| 1 | `:8` | 386 | `:8–10` | 见下（唯一重写行） |
| 2 | `:11` | 187 | `:13` | 未改动（内容行位移 +2） |
| 3 | `:15` | 144 | `:17` | 未改动 |
| 4 | `:12` | 141 | `:14` | 未改动 |
| 5 | `:18` | 129 | `:20` | 未改动 |

1 改前：

~~~text
1. **Neutrality**: you implement the design; you are not the designer. If the design conflicts with what you find in the code (an interface change broke a caller, a referenced symbol does not exist), STOP and report the conflict to the parent — quietly adapting ships a design nobody approved. 
  (Evidence discipline / task boundary / delivery table: already injected with this assembly.)
~~~

1 改后：

~~~text
1. **Neutrality**: you implement the design; you are not the designer.
**Stop on a design conflict**: if the design conflicts with what you find in the code (an interface change broke a caller, a referenced symbol does not exist), STOP and report the conflict to the parent.
Why: quietly adapting ships a design nobody approved.
~~~

2–5 改后逐字（未改动行）：

~~~text
- COMPLETE delivery: solve the ENTIRE task the parent gave you — every requirement, every file, every acceptance criterion; anything less is a partial delivery the parent did not approve.
Do what was asked, fully — opportunistic cleanup, speculative generality and half-finished refactors each land work the task did not ask for.
- Your report must state: the path of every file you touched, how you verified the change (tests/commands with results), and the delivery table.
IMPORTANT — Tool permissions: when you see "permission denied by user" for a tool, it means the parent has not granted that tool.
~~~

#### 审计与评审轮次 · 终态

| 轮 | 面 | 读数 | 终态 |
|---|---|---|---|
| 内部审计（第 1 轮） | explore 偏差审计（改前 / 改后对读） | 判「不可判」：该席工具装配无 bash / git，取不到改前全文（五处快照体量均不符） | 未判 |
| 内部审计（第 2 轮 · 改前快照落 `.thincoder/tmp/audit-before/` 后） | explore 偏差审计（48 条逐块对读 · 术语 · multiset · 行宽 · 名单外） | 丢失 0 · 新增 0 · 术语 4 项计数不变 · 短行缺失 0 · 行宽 0 超 · 名单外 0 条可证 | `clean` |
| 代码评审 | advisor `type:"code"`（两档 + 设计 / 需求判据上下文） | 🔴 0 · 🟡 2（形态面，可选）· 🔵 2（形态 / 指代）· 🟡 1（coordination：A2 / A4 不在评审面） | `pass`（🔴 0） |

**评审后自修（本席笔 · 4 处 · 1 轮）**：

1. `thincoder-core/prompts/persona-coder.md:9` 补行首题眼「**Stop on a design conflict**」（评审 🟡 #1：条件行无题眼）。
2. `thincoder-core/prompts/discipline-engineering.md:43` 定义 / 例外拆两行（评审 🟡 #2）。
3. `thincoder-core/prompts/discipline-engineering.md:109–110` 两个处置各占一行（评审 🔵 #3）。
4. 删 `thincoder-core/prompts/persona-coder.md` 旧 `:8` 末尾括注（评审 🔵 #4：指代 + 自我限定）。

自修后复测：行宽仍 `0` 超；映射覆盖仍 100%（新增 172 行全在块内）；词表差集仍只余上列词形与那一条括注；标题行逐字未变。评审未要求改动语义面，本席未动语义。

#### 决策披露

| # | 决策 | 理由 |
|---|---|---|
| D1 | 行数并列两个读数（split 段数 / 内容行 = 段数 − 1） | 设计 A1 的口径是 `split(/\r?\n/)`（含末尾空段）；两个读数并列，避免与 `read` 工具的「N lines total」对不上 |
| D2 | 删 persona-coder 旧 `:8` 末尾括注 | 需求 §13.24 内容边界把「指代、自我限定」列为可删；评审 🔵 亦点名它是指代留活口。删的只有导航句，非四类内容 —— 词表差集逐词列在本段，可核 |
| D3 | 长段落一律拆成同级行 / 子行，不新起 `##` 节 | 零节计数连带；标题行 17 / 3 条逐字未变 |
| D4 | 新行加粗只落题眼；原行内的第二处加粗能留则留 | 手法二；删加粗属可删类，但不为形式统一而删原文重点 |
| D5 | 术语与专名零改写、原句顺序尽量保持 | 派单红线；术语是台账 / 批次机制的操作数，译或改会让本档与工具面脱钩 |
| D6 | 只重排超长行；≤300 行逐字不动（含存量形态问题） | 派单边界；顺手重排会改动已审过的行，超出本波可审面 |

**存量观察（非本席笔 · 供父侧横切检查）**：两档仍有个别 ≤300 行沿用旧形态 —— 例如 `thincoder-core/prompts/discipline-engineering.md:12` 前的编号条目在拆行后与 `:9` 的题眼重复陈述（原行本如此）；`thincoder-core/prompts/persona-coder.md:13–14` 的续行顶格。按 D6 未动。

#### 上抛项

- 〔知会〕设计 `docs/core/design/PROMPT-SYSTEM.md` §6.45 的落点表记的是两档**改前**基线；改后读数落本段，不要求设计档随正（A1 判改后读数，按 A1 归 §5）。
- 〔知会〕评审的 coordination 项：A2（本段映射表由父侧按「每条 >300 行逐行出现 · 未判格 0」核）· A4（设计档三族零命中，属设计席修正轮的笔）· A3 脚本读数（本节已贴实跑）—— 均不在两档文件评审面内。

#### 门读数

- `node scripts/prompt-refs-check.mjs`（仓根 · 实跑 2026-10-22）⇒ `汇总：提示词面 69 档 · 代码面 463 档 · 命中 0` · `OK(prompt-refs): J1/J2/J3 三式零命中`。
- `cd thincoder-core && node test/run.mjs`（实跑）⇒ `tests 35 · pass 35 · fail 0 · cancelled 0 · skipped 0`。
- 独立 `node` 进程（盘上引擎直调 · `staleEngineFiles` = `[]`）`runDocCheck(mode:"gate")` 两档 ⇒ `DOC-CHECK GATE: PASS` · `hits {total:0, anchors:0, width:0}`。
- 会话内工具面：`doc_check` 报「引擎陈旧」（并行批在本会话启动后改写了 `thincoder-core/doc-check/` 三档）——报告态读数仍为 0 命中；闸判以独立进程为准（同 §2「门读数」处置）。批次档 append 的 doc-check 回执同为 `ERROR（引擎已更新 · 范围 0 档）`，同样以独立进程读数为准。
- 集成测试面：本批两档均为提示词文本、零代码改动 ⇒ 未跑集成套件（父侧收口轮可判「不涉及」）。

**上段「存量观察」行更正（同轮 · append-only 无编辑面）**：该行举的两例写错——`thincoder-core/prompts/discipline-engineering.md:9` / `:12` 之间不存在重复陈述。
现档实际的存量形态观察（改前即此形，非本席笔）= `thincoder-core/prompts/discipline-engineering.md:203`–`:206` 四问列表 item 1–3 缩进 2 格、item 4（`:206`）顶格；`thincoder-core/prompts/persona-coder.md:13`–`:14` 续行顶格。两处均按 D6 未动。

**§5 指针形更正（同轮 · append-only 无编辑面）**：本段行文里的裸档名按 D4 应写仓根全路径——两档 = `thincoder-core/prompts/discipline-engineering.md` · `thincoder-core/prompts/persona-coder.md`（同波并行席另涉 `thincoder-core/prompts/persona-eng-coder.md` · `thincoder-core/prompts/persona-normal.md` · 
  `thincoder-core/prompts/discipline-normal.md` · `thincoder-core/prompts/persona-eng-designer.md`）。
本段 `:1254`–`:1257` / `:1272` / `:1287`–`:1288` 的裸名引用即由此触发 `档缺`（`doc_check` 整档闸 8 条）；本席无编辑面，残留由父侧在 §5 收口时按上列全路径回改。
同次整档闸另报 5 条行宽命中（`:766` 309 · `:859` 302 · `:872` 348 · `:886` 311 · `:974` 302）与 22 条锚命中，均落在 §5 前段 / §2（非本席笔）——一并交父侧路由。

### 第四步复查 findings 修复 · `thincoder-core/prompts/common.md` + `thincoder-core/prompts/persona-engineering.md`（eng-coder · 2026-10-22）

**派单**：本批 §2 + 派单正文（第四步复查 findings：`thincoder-core/prompts/common.md` 1 🔴 / 3 🟡 / 8 🔵 / 7 🟡；`thincoder-core/prompts/persona-engineering.md` 2 🟡 / 3 🟡 / 4 🟡 / 7 🟡 / 8 🔵）。判据 = `docs/core/design/PROMPT-SYSTEM.md` §6.45 · `docs/core/requirements/ENGINEERING-MODE-V2.md` §13.24；合规对照形 =
  `thincoder-core/prompts/discipline-normal.md:12`；
  样板形 = `thincoder-core/prompts/persona-engineering.md:191` / `:196`。

**笔数**：`thincoder-core/prompts/common.md` 10 行（7 行原位改写 + 3 行删除；423 → 420 行）· `thincoder-core/prompts/persona-engineering.md` 39 行（全部原位改写；469 行不变）。两档 `git diff --numstat`（累计 vs HEAD）= `166/51` · `305/85`；本席增量 = 上述行，其余 17 档 `M` = 并行批遗留（写工具调用只触这两档；mtime 13:33:28 / 13:39:56 为界）。

**逐条落点与改后逐字**

| 号 | file:line（改前 → 改后） | 改后逐字 | 处置 / 理由 |
|---|---|---|---|
| 1 🔴 | `thincoder-core/prompts/common.md` `:30–:33` → `:30` | `**The checked-evidence line and the survey-evidence line share one shape** — both record "what was checked"; the setting differs: one in a question, one in a doc.` | `:33` 删 "the design doc's"（与
  `thincoder-core/prompts/discipline-normal.md:12` 同义、零文档引用）；
  `:30`–`:32` 三行维护者注整删（出处与归属进设计档，不进提示词） |
| 3 🟡 | `thincoder-core/prompts/common.md` `:19` | `**Ask only when it changes what you do next**: a question the docs already answer changes nothing — it only spends attention.` | 满句加粗收成题眼 + 冒号 + 正文；措辞按代码评审 #8 当轮再改一次（去掉与 `:18` 末句的逐字重复） |
| 8 🔵 | `thincoder-core/prompts/common.md` `:107` → `:104` | `- **The doc holds only the final, current state** — no history, no "previously X", no changelog, no lineage section.` | 删 `(user ruling 2026-10-15)`，语义保留 |
| 8 🔵 | `thincoder-core/prompts/common.md` `:113` → `:110` | `- **An invalidated expression is deleted, not revised**: on the **normative face** (feature points / AC / judgment lines / discipline lines / boundaries / status statements), once an expression is invalidated (ruled out / its object gone
  / superseded) ⇒ **delete
  it**.` | 删 `(user ruling 2026-09-18)` |
| 8 🔵 | `thincoder-core/prompts/common.md` `:116` → `:113` | `- **A requirement/design doc carries no history at all**: history lives only in **git commits**.` | 删 `(user ruling 2026-10-15)` |
| 8 🔵 | `thincoder-core/prompts/common.md` `:356` → `:353` | `**Disposable by design — it may be cleaned up at any time**: a batch record is a **one-off execution record**; the whole set **must be deletable at any moment**.` | 删 `(user ruling 2026-10-15)` |
| 7 🟡 | `thincoder-core/prompts/common.md` `:112` → `:109` | `- **The user's words outrank any paraphrase of yours**: task books / design docs / plans you wrote are not grounds to violate an explicit user instruction — on conflict, stop and re-align instead of hiding behind your own document.` |
  删回查括注 `(full precedence
  ladder in the "Instruction precedence" section)`——同档已有优先级梯子正文 |
| 2 🟡 | `thincoder-core/prompts/persona-engineering.md` `:12` + 全档 33 行 | `  - **Why**: a two-step rule read as three spends a round-trip waiting for a word the approval already spoke.` | 全档 Why 行统一成样板形：35 行全合规（33 行 `- **Why**: ` · `- **Why two steps**: ` `:382` · `- **Why book it**: ` `:395`），其余形
  0 |
| 3 🟡 | `thincoder-core/prompts/persona-engineering.md` `:58` | `**The ordinary reply text beats both bad choices**: during a long task (a long chain / subagents in flight), blocking on the user stalls the run, and pushing through blind spends the decision without them — so raise the question
  there, state a **workable
  default**, and keep going.` | 整句加粗收窄到题眼；条件从句移入正文，词零改 |
| 4 🟡 | `thincoder-core/prompts/persona-engineering.md` `:444` | `- **Concurrent pool limits (per role domain)**: by default 4 per domain — the eng-coder pool and the other-role (explore / plan / coder) pool never queue behind each other; `agent.poolLimits` overrides the defaults, and a configured
  session may allow more.`
  | 写死值改默认口径 + 可覆盖 + 明说「may allow more」，不再冒充上限 |
| 4 🟡 | `thincoder-core/prompts/persona-engineering.md` `:446` | `- **You track each parallel implementation's state** (design, token, delivery, audit, review) yourself; past the point where you can follow each parallel line, the bookkeeping cost and cross-talk risk outweigh the speedup.` |
  删数字，改「跟不上的那一点」表述 |
| 7 🟡 | `thincoder-core/prompts/persona-engineering.md` `:82` | `> **Each step completes → present → enter the next step**: review firing / implementation starts wait for the user's word — with the go-ahead, continue; without one, hold.` | 删 `(see the Firing-rights boundary)` |
| 8 🔵 | `thincoder-core/prompts/persona-engineering.md` `:147` | `- **The report-up duty is the same point**: it exists so the parent checks for an endless non-writing survey and keeps the child out of a loop.` | 删 `(user ruling 2026-10-15)` |

**行长读数（一次性 `node` 脚本 · `split(/\r?\n/)` · 判 `length > 300`）**

| 档 | 行数 | 字符数 | >300 行数 | 最长行 |
|---|---|---|---|---|
| `thincoder-core/prompts/common.md` | 420 | 50,343 | **0** | 294 @`:341`（未改行） |
| `thincoder-core/prompts/persona-engineering.md` | 469 | 67,112 | **0** | 300 @`:138`（未改行） |

**门读数**

- `node scripts/prompt-refs-check.mjs`（仓根）⇒ 提示词面 69 档 · 代码面 463 档 · 命中 0 · `OK(prompt-refs): J1/J2/J3 三式零命中`。
- `cd thincoder-core && node test/run.mjs` ⇒ tests 35 / pass 35 / fail 0。
- `doc_check(mode:"gate")` 会话内 = `ERROR（引擎已更新 … 晚于进程启动）`（结构性，非命中）；盘上新引擎独立 node 进程 `runDocCheck(root, {mode:"gate"})` 两档 ⇒ `DOC-CHECK GATE: PASS` · hits {total:0, anchors:0, width:0}。
- 验收 ⑤：全仓 numstat 19 档（并行批并行写入），本席增量 = 两档；以 mtime 与写工具调用为界。

**审计与评审轮次 · 终态**

| 轮 | 面 | 读数 | 终态 |
|---|---|---|---|
| 内部审计 | explore 偏差审计（九条逐条 / 名单外改动 / Why 形计数 / 残留引用 / 行长） | 九条全 PASS · 名单外 0 · Why 形 35/35 单一 · 行长 0 超 · 四类偏差（丢失 / 新增 / 术语 / 越界）0 | `clean` |
| 代码评审轮 1 | advisor `type:"code"`（两档 + 设计 §6.45 / 需求 §13.24 为判据上下文） | `VERDICT: changes-required`：1 项落在本笔行（`:19` 与 `:18` 逐字重复）· 8 项落在任务书「不动其它行」名单外（类别式全清要求） | 本笔内已修；名单外逐条上抛（见下），未跑轮 2（轮 2 只复核 fix claim，唯一 fix claim 已由改后复测覆盖；名单外 8 项按派单不修） |

**决策披露**

| # | 决策 | 理由 |
|---|---|---|
| D1 | Why 行统一取样板形 `- **Why**: `，含 30 个原 `Why:` 行补 `- ` 前缀（不止 `:12` 一行） | 派单 finding 2 要求「全档只能一种」；样板 `:196` 是设计 §6.45 逐字块、不可改 ⇒ 全档 34 行向样板收，不反向 |
| D2 | 段落专名保留为 `- **Why two steps**: ` `:382` / `- **Why book it**: ` `:395` | 标签自带限定词，拆开须改写句义；加粗 + 短横 + 冒号一形不变，词零改 |
| D3 | 代码评审 #8（`:19` 与 `:18` 重复）当轮修 | `:19` 是本笔行且派单给了「措辞你定」授权；去重不触其它行 |
| D4 | 代码评审其余 8 项不修 | 全部落在派单「只改下面列出的行 / 不动其它行」之外；`:444` 的 `by default 4 per domain` 更是派单逐字给定的目标句 ⇒ 不自行扩面，逐条上抛 |

**上抛项**

- 〔上抛·待裁〕类别口径 vs 派单行边界：代码评审按「五类全清」判，指出下列未清处——整句加粗 14 行（persona `:6` `:11` `:40` `:49` `:52` `:54` `:62` `:172` `:248` `:286` `:303` `:318` `:345` `:443`）· 回查指代（common `:48` `:165` `:171` `:225` `:273` `:300` `:319`；
  persona `:133` `:231`）· 出处括注（common `:13` `:112` `:273` `:333`）· 写死上限（common `:163` 的 `20 messages`；persona `:445` 的 `4/4`）· 面级指路句（common `:366`）。均在派单名单外（派单明令不动），未修；若父侧要按类别全清，需另派一笔并带行清单。
- 〔上抛·知会〕评审席引证核验报 `file unreadable` / `0/14 citations match` = 路径基准差（评审以工作区根 `D:\teamcode` 取 `thincoder-core/...`，实际仓根 = `D:\teamcode\thincoder`）；本席逐条复核其坐标，9 行引用在现档均成立。
- 〔上抛·知会〕并行批仍在写其它提示词档（现盘 19 档 `M`）；收口时以本席两档为增量核。

### 第四步复查 · 笔 2：两档六类残留全清 + 归属话收正（eng-coder · 2026-10-22）

**派单**：本批 §2 + 派单正文（五类清单 = 上席上抛的 `:1350` 项）；用户追加令 3 次——① 第 6 类本仓路径约定出提示词 ② 路径要给出「怎么拿」（主 agent = `manifest read` → `docRoot.batches`；
  子代理 = 路径由任务书给出）③ `#36` 两处归属话 + 一处自相矛盾（号 9、10）。判据 = 需求 `docs/core/requirements/ENGINEERING-MODE-V2.md` §13.24（含新增两段：只写动作不写组织 · 数量与配置值不进提示词）· 设计 `docs/core/design/PROMPT-SYSTEM.md` §6.45 三条手法 · D1 写权矩阵路由。

**改动面**：两档 54 行 —— `thincoder-core/prompts/persona-engineering.md` 29 行（含新增 1 行 · 469 行）· `thincoder-core/prompts/common.md` 25 行（419 行）。全部原位改写，行数 468 → 469 的唯一增量 = 目录声明的**唯一说明处** `thincoder-core/prompts/persona-engineering.md:114`；
  其余各笔零增删行。逐条「改前 → 改后」逐字见 `.thincoder/tmp/fr46-fix2-before-after.md`（51 行 + 追加令 3 行 = 54 行，含保留项逐条理由与行号漂移说明）。

**六类逐类读数（改前 → 改后 · 一次性 `node` 脚本，两档合扫）**

| 类 | 判法 | 改前 | 改后 |
|---|---|---|---|
| 1 整句加粗 | 整行单加粗 `^\s*(-\s+)?\*\*[^*]+\*\*[.:]?\s*$` ∥ 行内整句加粗 `\*\*[^*]+[.!]\*\*` | 21（persona 14 行整行 + common `:155` + 12 行行内） | **0** |
| 2 回查指代 | `\b(above\|below)\b` | 11（persona 3 · common 8） | **0** |
| 3 出处括注 | `\(user ruling…\)｜\(this actually happened\)｜\(a real, dated incident\)｜measured twice` | 4（common） | **0** |
| 4 写死配置值 | `4 per domain｜4/4｜20 messages｜default 4` | 3（persona 2 · common 1） | **0** |
| 5 面级指路句 | `defined by the [a-z-]+ mechanism` | 1（common `:366`） | **0** |
| 6 本仓路径约定 | `docs/batches｜<repo>/｜batches/｜docs/**` | 5（persona 3 · common 2） | **0** |
| （附）归属话 | `sole author｜sole write authority` | 2（persona `:30` `:34`） | **1**（`:34` 未被点名 · 上抛） |

判外留证：`thincoder-core/prompts/common.md:118` 的 `**The test — where does it point?**` = 问句题眼（非整句断言加粗）；`thincoder-core/prompts/common.md:322` 的 `as of 2026-09-15` = 判据里的示例（非出处括注）；`.thincoder/tmp/**` / `.thincoder/advisor.md` 字样 = 本产品自己的目录与档名（非本仓约定）。三条理由均记在对照档「保留项」。

**取值动作落地（第 6 类的第二刀 · 逐条验到代码层）**

- `thincoder-core/prompts/persona-engineering.md:114`（新增 · 唯一说明处）：五个 `docRoot` 子键 `requirements` / `specs` / `design` / `modules` / `batches` 声明文档目录；与 `thincoder-core/manifest-schema.mjs:34-38` 逐键相符。
- `thincoder-core/prompts/persona-engineering.md:309` / `:431`：`read with \`manifest read\` → \`docRoot.batches\``；`manifest` 工具只挂 depth-0（`thincoder-core/agent/family-tools.mjs:144` 的 `depthOnly` 段、`:153` 列 `manifestTool`）。
- `thincoder-core/prompts/common.md:351`（子代理面）：路径取任务书里的 `batchDoc`，不猜。
- `thincoder-core/prompts/persona-engineering.md:445`：删掉 `4` 与 `4/4`，改「读 `agent.poolLimits`」——`settings` 工具真存在（`thincoder-core/agent-tools/settings.mjs:239` 的 `enum: ["list", "get", "set"]` + `key` 为 dot path）· `agent.poolLimits` 是真键（`thincoder-core/config-defaults.mjs:46`）。

**行长读数（一次性 `node` 脚本 · `split(/\r?\n/)` · 判 `length > 300`）**

| 档 | 行数 | 字符数 | >300 行数 | 最长行 |
|---|---|---|---|---|
| `thincoder-core/prompts/persona-engineering.md` | 469 | 67,632 | **0** | 300 @`:139`（未改行） |
| `thincoder-core/prompts/common.md` | 419 | 50,295 | **0** | 294 @`:341`（未改行） |

**门读数**

- `node scripts/prompt-refs-check.mjs`（仓根）⇒ 提示词面 69 档 · 代码面 463 档 · 命中 0 · `OK(prompt-refs): J1/J2/J3 三式零命中`。
- `cd thincoder-core && node test/run.mjs` ⇒ tests 35 / pass 35 / fail 0。
- `doc_check(mode:"gate", docs:[两档])` 会话内 = `ERROR（引擎已更新 … 晚于进程启动）`（结构性：并行批在本会话启动后改写了 `thincoder-core/doc-check/` 引擎档；非命中）；盘上引擎独立 `node` 进程直调 `runDocCheck` ⇒ **`DOC-CHECK GATE: PASS` · hits {total:0, anchors:0, width:0}**。
- 改动面 `git diff --numstat` 两档 = `309/89`（persona）· `174/59`（common），均为累计 vs HEAD（含前几轮本批笔）；全仓 20 档 `M` 中其余 18 档 = 并行批遗留（mtime 12:28–13:42，本席开工 13:42 后只写过这两档；两档 mtime = 13:43–13:52）。

**审计与评审轮次 · 终态**

| 轮 | 面 | 读数 | 终态 |
|---|---|---|---|
| 内部审计 1 | explore 偏差审计（37 行逐条 + 六类复扫 + 行长） | 37/37 在档、37/37 四类内容未丢；**另报两类残留**：行内整句加粗 12 行（persona `:275` `:464` · common `:18` `:63` `:84` `:93` `:220` `:224` `:230` `:242` `:374` `:379`）+ `persona:29` 的 `batches/*.md` | needs-fix → 13 笔全部自修 |
| 内部审计 2 | 同形派单（复核 18 笔） | 装配拒绝：`Unknown subagent role: undefined`（同一形状前一轮成功）⇒ 改本席机械复读 | 复读 **18/18** 逐字相符 · 六类读数仍全 0 |
| 代码评审 1 | advisor `type:"code"`（两档 + 设计 §6.45 / 需求 §13.24） | `VERDICT: pass`；🟡1（13 笔未入档：声明 37+13 而对照档只有 37）· 🔵1（未用四列形） | pass → 🟡 已修（对照档补到 51 行） |
| 代码评审 2 | advisor 复核（18 笔 + 记账） | `VERDICT: pass`；🟡1 **Fixed**（51 行、口径与「37+13」吻合）· 🔵1 **Unfixed**（四列形仍未采纳，档内零理由说明） | `clean`（pass · 余 1 笔 🔵 记账建议） |

**修正轮 = 2（上限 5）**：第 1 轮 = 审计 13 笔 + 用户追加令；第 2 轮 = 用户补充令（取值动作 + 唯一说明处）与 `#36` 归属话。

**决策披露**

| # | 决策 | 理由 |
|---|---|---|
| D1 | 整句加粗一律收成「题眼 + 冒号 + 正文」，原句词序尽量不动 | 设计 §6.45 手法二；样板 `thincoder-core/prompts/persona-engineering.md:192` 即此形 |
| D2 | 「行内整句加粗」也按第 1 类收（不只整行加粗） | 设计手法二判「加粗只落题眼」；审计以「加粗整句 + 正文另起一句」立判，与本席共认 |
| D3 | 文件路径全部换成取值动作（`manifest read` → `docRoot.batches` / 任务书），不写含糊说法 | 用户补充令；含糊说法不可执行，等于把猜路径留给读者 |
| D4 | 五个 `docRoot` 子键只在 `:114` 写一次，其余三处只给动作 | 用户令「一处在维护，十五处在指它」 |
| D5 | `:204` 的 `docs/**` 一并去掉并拆正路由 | 原句把需求档也派给 eng-designer，与 D1 及刚改的 `:206` 三行内互斥 |
| D6 | 同名归属话四处不自行改 | 派单只点名两处；扩面会把未批的语义变更混进本轮（逐条上抛） |

**上抛项**

- 〔上抛·待裁〕同名归属话 4 处未改（未被点名）：`thincoder-core/prompts/persona-engineering.md:34` `sole write authority` · `:79` `… are your products; the design doc belongs to eng-designer.` · `:465` `**Design authoring** belongs to eng-designer; implementation belongs to eng-coder.` · `:468` `(implementation belongs 
  to eng-coder)`。逐条改法是去掉「归谁」半句、只留动作（如 `:465` → 「把设计档派给 eng-designer，把实现派给 eng-coder」）。
- 〔上抛·知会〕设计 `docs/core/design/PROMPT-SYSTEM.md` §6.45 落点表与受影响文件表记的是**改前**基线，不随本笔改（A1 判改后读数，口径归 §5）。
- 〔上抛·知会〕会话内 `doc_check` 引擎陈旧（并行批改写了引擎档）——闸判以独立进程读数为准，与 §2 / 前几段 §5 同处置。
- 〔上抛·知会〕同波其他席仍在改其余 15 档提示词；本段读数以本席两档为增量。

### FR47 · 动手前先查文档（独立小节）· `thincoder-core/prompts/common.md`（eng-coder · 2026-10-22）

**派单**：需求 `docs/core/requirements/ENGINEERING-MODE-V2.md` §13.25（FR47 · `:1054-1070`；用户 13:58「要有条独立规则」）；任务书 = 本批派单正文。约束：不并进 `## Check the docs before you ask` · 不改梯子 · 不动别的档 · 每行 ≤300。同日口径两次变更均由父侧先改需求档、本席随改。

**落点与逐字（`thincoder-core/prompts/common.md:32-40`，新节 9 行）**

~~~text
## Check the docs before you act
**Before you act, look at how this thing already works**: the interfaces, the conventions, the decisions made earlier. The user's words say what is wanted; the docs and the code say how it currently works.
**Why**: the code records only what is; the reasons and consequences live in the docs.
Someone who does not know the reason has two paths — follow blindly, or change blindly.
A blind change can damage the project's overall value with nobody noticing, especially when the decision carried a non-functional requirement that no test covers.
For an agent this is structural: it can always read the current shape, never why it was that way, nor what a change would break.
So acting without checking the docs is a blind change — not "something might be missed", but no basis at all.
**When the docs are silent**: go ahead, and say what you looked at — what you searched, which doc you opened, which code you read. Checked and found nothing is itself a result worth stating.
**Bounds**: the instruction-precedence ladder stays as it is — that one governs conflict, this one governs the look before acting; the check is narrow — whether the how of this work is already written, not a long survey before every move.
~~~

**改法（两版）**：第一版按首版 §13.25 落（5 行，why = 「为什么容易漏」）。用户 2026-10-22 两次改口径后整节重写为 9 行：why 换成「为什么必须查」——代码只记形状，理由与后果住在文档里；不知理由的人只有盲从或盲改，不查就动手结构上就是盲改、没有依据。出处（Nygard）与首版比喻式收尾（「用代码再答一遍」「沉默加一次读数」）均未进提示词面（需求档保留出处）。位置 = `## Check the docs before you ask`（`:17-30`）之后相邻，两节互读得到。

**行长读数（一次性 `node` 脚本 · `split(/\r?\n/)` · 判 `length > 300`）**：429 内容行 · 0 行 >300 · 最长 294（`:351`，未改行）。新节各行 = `:32` 32 · `:33` 205 · `:34` 86 · `:35` 87 · `:36` 162 · `:37` 128 · `:38` 109 · `:39` 190 · `:40` 238。

**门读数**

- `node scripts/prompt-refs-check.mjs`（仓根）⇒ 提示词面 69 档 · 代码面 463 档 · 命中 0 · `OK(prompt-refs): J1/J2/J3 三式零命中`。
- `cd thincoder-core && node test/run.mjs` ⇒ tests 35 / pass 35 / fail 0。
- `doc_check(mode:"gate", docs:[`thincoder-core/prompts/common.md`])` 会话内 = `ERROR（引擎已更新 … 晚于进程启动）`——结构性（并行批在本会话启动后改写了 `thincoder-core/doc-check/` 引擎档），非命中；盘上引擎独立 `node` 进程 `runDocCheck` ⇒ **`DOC-CHECK GATE: PASS` · hits {total:0, anchors:0, width:0}**。父侧重启会话后复跑为准。
- 改动面：`git diff --numstat` 基线（本席动手前）= `thincoder-core/prompts/common.md` `178/63`；改后 `188/63`（+10/−0，全部新增）。其余档 numstat 前后逐数不变；需求档 `118/2 → 120/2` = 父侧并发改 §13.25，非本席笔。

**审计与评审轮次 · 终态**

| 轮 | 面 | 读数 | 终态 |
|---|---|---|---|
| 内部审计 1 | explore 偏差审计（首版 5 行） | 需求四元素 + 位置全在位 · 0 行 >300 · 四类偏差 0 | `clean`（首版后被口径更新作废） |
| 内部审计 2 | explore 偏差审计（重写后 9 行 · 逐元素 + 禁用词 + 行宽） | 需求五元素逐条在位（规则 / why 链 / agent 结构性 / 沉默时 / 边界）· 禁用项（读数 / 比喻收尾 / confident guess / 出处书名）0 · 0 行 >300 · 相邻询问节与梯子读来未动 | `clean` |
| 代码评审 | advisor `type:"code"`（`thincoder-core/prompts/common.md` + 需求 §13.25 / 设计 §6.45 为判据面） | `VERDICT: pass`；🟡2 = 文档层协调项（设计档缺 FR47 节 · 需求档 `docs/core/design/PROMPT-SYSTEM.md:64` 节表滞后）· 🔵4（`this thing` 无所指 · why 段无题眼加粗 · 沉默形与 `:29` 不同形 · advisor 面不在装配表） | `clean`（pass） |

**决策披露**

| # | 决策 | 理由 |
|---|---|---|
| D1 | 🔵「why 段无题眼加粗」不修 | 设计档尺度字面只约束加粗位置（`docs/core/design/PROMPT-SYSTEM.md:2934`「加粗只落在每行的题眼上」），不要求每行必有；why 是连续一段，强加题眼标签等于给需求没要求的元标签 |
| D2 | 🔵「`this thing` 无所指」不修 | 对应需求原句「这件事」；改所指 = 改已评审文本，无用户令 |
| D3 | 🔵「沉默形与 `:29` 不同形」不修 | 两触发点各一形：`:29` 是提问面定形串，`:39` 按 §13.25 `:1066` 原句落 |
| D4 | 🟡 两项不修 | 设计档 = eng-designer 笔，需求档 = 主 agent 笔；本席写域只此一档，交父侧路由 |

**上抛项**

- 〔上抛·待裁〕设计档缺 FR47 节：`docs/core/design/PROMPT-SYSTEM.md` 最新 §6.x = §6.45（FR46，`:2905`），§7 无 FR47 行；该档 `:3202` 要求提示词裁定先落设计节 ⇒ 英文面无逐字基线，本轮评审只能拿中文需求对英文实现。需求档 `docs/core/requirements/PROMPT-SYSTEM.md:64` 标题仍写「`thincoder-core/prompts/common.md` 20 节」（现为 21），逐节大纲（`:68-87`）无新行。两项均非本席写域。
- 〔上抛·知会〕advisor / consult 面不在 `thincoder-core/prompt-overlays.mjs:41` 的 `SCENARIO_SLOT_FILES` 装配表内（`:49` consult = 自含基底）⇒ 本条对这两面不生效；需求 §13.25 `:1070` 落点理由「全角色全模式可见」是否按实收窄，由父侧判。

### 归属话收成派单话 · `thincoder-core/prompts/persona-engineering.md` 九处（eng-coder · 2026-10-22）

**派单**：本批 §2 + 主 agent 任务书（四处 `:34` `:79` `:465` `:468`）+ 用户裁决（「扩面，七处全收」·「按判据收，不按我数的数收」）。判据 = 需求 `docs/core/requirements/ENGINEERING-MODE-V2.md` §13.24（只写动作，不写组织，`:1011`）；对照形 = `thincoder-core/prompts/discipline-engineering.md:279` D1 路由句；设计判据 = `docs/core/design/PROMPT-SYSTEM.md` §6.45。

**改动面**：`thincoder-core/prompts/persona-engineering.md` 九行原位改写 · 行数不变（470 段）· 字符 67,632 → 67,581（−51，等于九行逐行差之和——旁行零改动的机核）。九处 = 点名四处 + 裁决七处 + 判据扫出的 `:78` 与 `:220`。

**逐行改后逐字（行号为现档）**

| 行 | 改后逐字 | 字符 |
|---|---|---|
| `:34` | `- **Dispatch, do not write**: the design doc (revisions included) goes to **eng-designer**; implementation code goes to `eng-coder` — two pens on one surface overwrite each other, and writing it yourself puts a second pen on that surface.` | 238 |
| `:74` | `- eng-designer produces two things: **the batch task (batch record §2 — not written into the design doc)** + **the design doc**; design-doc revisions also go back to it.` | 169 |
| `:78` | `Plan and delegate; implementation goes to eng-coder — writing it yourself puts a second pen on that surface and collides with the implementer.` | 142 |
| `:79` | `Batch record, dispatch task books, verification conclusions, review firing, requirement docs are your products; dispatch the design doc to eng-designer.` | 152 |
| `:159` | `- **Parent does not ghost-write**: anything needing a design-doc change is dispatched to **eng-designer** via a fix round — two pens on one surface overwrite each other.` | 169 |
| `:220` | `**Prompt faces and design docs are not light-channel direct edits**: dispatch the English runtime face to eng-coder as an exact translation of the Chinese final text, and the design docs to eng-designer — the light channel applies to code pens only.` | 249 |
| `:319` | `- **The scan and the dispatch are yours**: §2 corrections go to **eng-designer**.` | 81 |
| `:465` | `- **Dispatch routing**: design authoring → eng-designer; implementation → eng-coder. Your deliverable to eng-coder is the batch record §2 (the task book itself — no separate copy) + the designToken; eng-designer's deliverables are the batch task + the design doc.` | 263 |
| `:468` | `- **escalate is unavailable in engineering mode** — `subagent` `action:'escalate'` refuses the same way (dispatch implementation to eng-coder).` | 143 |

**删掉的归属腔（逐处）**：`:34` `sole write authority` + `**NOT yours**` → 动作禁令改 `**Dispatch, do not write**`（禁令本身保留）· `:74` `(single write authority)` 整删 · `:78` `the implementation pen is eng-coder's` → `implementation goes to eng-coder` · `:79` `the design doc belongs to eng-designer` → `dispatch the design
  doc to eng-designer` · `:159` `the design doc's pen is eng-designer's … the writing surface stays unmixed` → 派单 + 「two pens on one surface overwrite each other」
  · `:220` `the English runtime face is written by eng-coder … and the Chinese design face by eng-designer` → 派单形（并删退场分支，见 D3）· `:319` `the §2 pen is the designer's` → `§2 corrections go to eng-designer` ·
  `:465` `**Design authoring** belongs to … implementation belongs to …` → `**Dispatch routing**: … → …` · `:468` `(implementation belongs to eng-coder)` → `(dispatch implementation to eng-coder)`。

**行长读数**（一次性 `node` 脚本 · `split(/\r?\n/)` · 判 `length > 300`）

| 时点 | 段数 | 字符数 | >300 行数 | 最长行 |
|---|---|---|---|---|
| 改前 | 470 | 67,632 | 0 | 300 @`:139` |
| 改后 | 470 | 67,581 | **0** | 300 @`:139`（未改行） |

**门读数**

- `node scripts/prompt-refs-check.mjs`（仓根）⇒ 提示词面 69 档 · 代码面 463 档 · 命中 0 · `OK(prompt-refs): J1/J2/J3 三式零命中`。
- `cd thincoder-core; node test/run.mjs` ⇒ tests 35 / pass 35 / fail 0 / exit 0。
- `doc_check` 会话内 = `ERROR（引擎已更新 … 晚于进程启动）`（结构性：并行批在本会话启动后改写了 `thincoder-core/doc-check/` 引擎档；非命中）；盘上引擎独立 `node` 进程（`staleEngineFiles` = `[]`）⇒ **`DOC-CHECK GATE: PASS`** · hits {total:0, anchors:0, width:0}。
- 改动面：全仓 `git diff --numstat` 22 档 = 并行批遗留；本席写工具调用只触本档；本笔增量 = 九行，机核 = 全档字符差 −51 恰等于九行逐行差之和。

**审计与评审轮次 · 终态**

| 轮 | 面 | 读数 | 终态 |
|---|---|---|---|
| 内部审计 | explore 偏差审计（八处逐字 · 四类内容 · 残留扫描 · 行长） | 八处逐字相符 · 四类内容未丢 · 无新增语义 · 0 行 >300 · 四类偏差 0/0/0/0 | `clean` |
| 代码评审 1 | advisor `type:"code"`（全档 + 需求 §13.24 为判据） | `VERDICT: pass`；🟡3（`:220` 同族被动形 · `:79` 半改 + `review firing` 相抵 · 设计档 `:1649` 落后）· 🔵1（`:319` 题眼归属腔） | `pass` |
| 代码评审 2 | 采纳 🟡 第 1 项（`:220` 改派单形）后复核最终态 | `VERDICT: changes-required`：**新 🔴 1**（`:220` 改后派往已退场的「中文设计面」）· 🟡2 🔵1 无理由未修 | 进修复 |
| 代码评审 3 | 只核该 🔴 一笔 + 行宽读数 | 该 🔴 = **Fixed**（`:220` 现为 `the design docs to eng-designer`；「Chinese design face」全档零残留）· 无新 🔴 · 余 🟡2 🔵1 非阻塞（其中 🟡 `:79` / 🔵 `:319` 记 Accepted） | `clean`（pass） |

**修正轮 = 1（上限 5）**：审计零修；评审 2 的 🔴 一笔修复后评审 3 pass。

**决策披露**

| # | 决策 | 理由 |
|---|---|---|
| D1 | 七处之外收 `:78` | 用户裁决「按判据收，不按我数的数收」；`:78` 的 `the implementation pen is eng-coder's` 与 `:159` / `:319` 同形 |
| D2 | 采纳评审行 1，把 `:220` 也改派单形 | 同判据（写权矩阵不进提示词）；评审独立点名，属判据面 |
| D3 | `:220` 删「the Chinese design face」分支，代之以「the design docs」 | `docs/core/design/PROMPT-SYSTEM.md:119`「无「中文设计面」一支」· `:1201`「中文镜像面 无（`docs/core/design/prompts/` 已不存在——运行面单面）」· glob `docs/core/design/prompts/**` 0 命中 ⇒ 该分支派往不存在的面 |
| D4 | `:79` 归属半句 · `:33` `:75` `:119` 属有腔 · `:319` 题眼不修 | 父侧自有面属 §13.24「你能动什么」半边；`review firing` 与 `:6` / `:253` 相抵属新语义面，本轮未授权，上抛 |
| D5 | 设计档 `:1649` 逐字块不随正 | 设计档笔 = eng-designer（D1 写权矩阵）；上抛父侧路由 |

**上抛项**

- 〔上抛·待裁〕`thincoder-core/prompts/persona-engineering.md:79` 的 `review firing` 被列为父侧产物，与同档 `:6`（design reviews and implementation starts are both fired by the user, not by you）∥ `:253`（design reviews can only be fired by the user）相抵；改哪一句属语义面，本轮未动。
- 〔上抛·知会〕设计档 `docs/core/design/PROMPT-SYSTEM.md:1649` 仍载已删半句「The scan and the dispatch are yours; the §2 pen is the designer's」，该块抬头自称「唯一权威目标形」；产品档现为 `:319`–`:320`。执笔 = eng-designer。
- 〔上抛·知会〕验收 ④「numstat 只出该档」在全仓口径不可达：并行批 21 档在改；本席增量 = 一档九行（字符差机核）。

### `thincoder-core/prompts/persona-engineering.md:79` · 删去 `review firing`（一处语义相抵收正 · eng-coder · 2026-10-22）

**派单**：批次档 §2 + 派单正文（用户裁定「设计评审只能由用户点火，你只负责准备和提醒」）。判据 = 同档 `:6`（`design reviews and implementation starts are both fired by the user, not by you`）· 同档 `:253`（`design reviews can only be fired by the user — you prepare and remind, the user fires`）· 需求 `docs/core/requirements/ENGINEERING-MODE-V2.md`
  §13.10 ③（`:727`「设计评审只能由用户发起」照旧）。

**改动面**：`thincoder-core/prompts/persona-engineering.md` 一行（`:79`），其余零笔。行数不变（470 段）。

**改前 → 改后（逐字）**

| 时点 | `:79` 逐字 | 字符 |
|---|---|---|
| 改前 | `Batch record, dispatch task books, verification conclusions, review firing, requirement docs are your products; dispatch the design doc to eng-designer.` | 152 |
| 改后 | `Batch record, dispatch task books, verification conclusions, requirement docs are your products; dispatch the design doc to eng-designer.` | 137 |

**只动一行的机核**：全档字符数 67,581 → 67,566，差 −15，恰等于被删子串 `review firing, ` 的 15 字符。把该子串插回 `:79`，全档字符数复现 67,581、`:79` 复现 152 字符且逐字等于改前句（一次性 `node` 脚本实跑）。

**三处一致性（改后逐字）**

- `:6` = `**Who fires**: design reviews and implementation starts are both fired by the user, not by you.`（未动）
- `:79` = `Batch record, dispatch task books, verification conclusions, requirement docs are your products; dispatch the design doc to eng-designer.`
- `:253` = `- Firing rights: design reviews can only be fired by the user — you prepare and remind, the user fires;`（未动）

全档其余 `review firing` 命中 5 行（`:8` `:16` `:82` `:85` `:300`）均为「等用户的话 / 整批令 = 用户授权」，与 `:253` 同向，无第二处相抵。删掉的只是「把它当父侧产物」这一句；「准备与提醒」职责仍明文在 `:31`（`reminding the user to fire reviews`）与 `:253`，未丢。

**验收对照（回指派单 ①–④）**

| # | 验收 | 读数 |
|---|---|---|
| ① | `:79` 与 `:6` / `:253` 不再相抵，改后逐字 | 三行逐字见上；`:79` 已无 `review firing`，与两处同向 |
| ② | 该档 0 行 >300 | 0（最长 300 @`:139`，未改行） |
| ③ | `prompt-refs-check` 0 · 测试 35/35 | 命中 0 · tests 35 / pass 35 / fail 0 |
| ④ | diff 只出该档 | 本席写工具只触该档一行与本段；字符差 −15 + 回插复现为机核 |

**行长读数**（一次性 `node` 脚本 · `split(/\r?\n/)` · 判 `length > 300`）

| 时点 | 段数 | 字符数 | >300 行数 | 最长行 |
|---|---|---|---|---|
| 改前 | 470 | 67,581 | 0 | 300 @`:139` |
| 改后 | 470 | 67,566 | 0 | 300 @`:139`（未改行） |

**门读数**

- `node scripts/prompt-refs-check.mjs`（仓根 · 实跑）⇒ 提示词面 69 档 · 代码面 463 档 · 命中 0 · `OK(prompt-refs): J1/J2/J3 三式零命中`。
- `cd thincoder-core; node test/run.mjs`（实跑）⇒ tests 35 / pass 35 / fail 0 / exit 0。
- `doc_check(mode:"gate")` 会话内 = `ERROR（引擎已更新 … 晚于进程启动）`：结构性原因，并行批在本会话启动后改写了 `thincoder-core/doc-check/` 引擎档；非命中。
- 盘上引擎独立 `node` 进程（`staleEngineFiles` = `[]`）直跑：`thincoder-core/prompts/persona-engineering.md` ⇒ `DOC-CHECK GATE: PASS` · hits {total:0, anchors:0, width:0}。
- 同进程跑本批次档 ⇒ `REFUSED（命中 9 条）`：8 条锚 + 1 条行宽（`:1556`），全部落在 §5 前段 `:1511`–`:1595`，非本席笔，交父侧路由。
- 改动面：该档 `git diff --numstat` 前后同为 `319/98`（累计 vs HEAD，含本批前几轮笔）——行内改子串不改行数，故机核取字符差与回插复现。

**审计与评审轮次 · 终态**

| 轮 | 面 | 读数 | 终态 |
|---|---|---|---|
| 内部审计 | explore 偏差审计（九项：三处逐字 / 两处零改 / 只动一行 / 行宽 / 其余五处提法 / 职责是否丢 / 设计档漂移 / 名单外 / 夹具） | 九项全 PASS · 四类偏差 0 | `clean` |
| 代码评审 | advisor `type:"code"`（本档 + 需求 §13.24 / 设计 §6.45 / 本批次档为判据面） | `VERDICT: pass` · 🔴 0 · 🟡 1 协调项 | `pass` |
| 评审 🟡 处置 | 批次档 §5 旧行仍记 `:79` 未动、§6 未收口 ⇒ 读档者会读到「未修」 | 本段即该笔的实施记账；§6 收口行由父侧补 | 本段关闭，余项归父侧 |

**修正轮 = 0**：审计零修，评审无 must-fix。

**决策披露**

| # | 决策 | 理由 |
|---|---|---|
| D1 | 删 `review firing`，不改写成「评审准备与提醒」 | `:31` 与 `:253` 已明写准备与提醒职责，改写等于新增重复；删除是最小改动，零新增语义 |
| D2 | `:6` / `:253` 零笔 | 两处与用户裁定同向，是本次判据的来源 |
| D3 | 不在 `:79` 处补「见 :6」一类指路 | FR46 复查已令删回查指代（本批次档 `:1372`）；补指针会把同一档拉回已收掉的形 |

**上抛项**

- 〔上抛·知会〕设计档 `docs/core/design/PROMPT-SYSTEM.md` 内 `are your products` / `dispatch task books` / `:79` 三串零命中（grep 实读）⇒ 本笔无设计逐字基线可判等，判据取需求 `docs/core/requirements/ENGINEERING-MODE-V2.md` §13.10 ③（`:727`）与 §8.5（`:457`）。是否补设计基线 = 设计席笔，归父侧路由。
- 〔上抛·知会〕本批次档整档 gate 的 9 条命中全在 §5 前段，非本席笔；本席无编辑面，交父侧 §5 收口时路由。

**§5 本段形态更正（同轮 · append-only 无编辑面）**：本段「派单」行（`:1601`，330 字符）超行宽 300，是本席笔唯一一条 gate 命中。拆行形如下，供父侧 §5 收口时替换该行；内容零改，只拆行。

> **派单**：批次档 §2 + 派单正文（用户裁定「设计评审只能由用户点火，你只负责准备和提醒」）。
> 判据 = 同档 `:6`（`design reviews and implementation starts are both fired by the user, not by you`）· 同档 `:253`（`design reviews can only be fired by the user — you prepare and remind, the user fires`）· 需求 `docs/core/requirements/ENGINEERING-MODE-V2.md` §13.10 ③（`:727`「设计评审只能由用户发起」照旧）。

### FR47 why 层 · 四段落笔（eng-coder · 2026-10-22）

**派单**：本批 §2 + 派单正文；用户 2026-10-22 14:09 补充（会话只是一步、上下文只是一小部分）与 14:10 逐字认可的四段。判据 = 需求 `docs/core/requirements/ENGINEERING-MODE-V2.md` §13.25。写域 = `thincoder-core/prompts/common.md` 一档；本批其余档零笔。

**落点与改后逐字**：`## Check the docs before you act` 的 why 链整块替换为四段（现档 `:34-:37`）；`:32` 标题 · `:33` 规则 · `:38` 沉默时 · `:39` 边界逐字未动。

~~~text
**Why — you only ever see a part**: one session finishes one step of a large task, and what is in front of you — this conversation, the files you opened — is a fraction of what the project already knows. The docs and the code are how the rest reaches you.
**A part taken for the whole**: acting on what you can see alone treats a piece as the whole. Every reading may be right about its own piece and still wrong about the whole.
**Why nothing warns you**: no conflict, no unclear point — so nothing flags it. The mismatch shows up later, as a diff against a document nobody opened.
**Why it costs**: the code records what is; the reasons and the consequences live in the docs. A decision may have carried a requirement no test covers — changed blind, what it protected is gone, and nothing reports it.
~~~

**顺序（不是随手排的）**：`:34` 依据——你手里只有一部分，文档与代码是其余部分进来的路；`:35` 直接后果——每片都对、整体仍错；`:36` 为什么这条最难自觉——没有冲突、没有说不清的点，所以没有任何东西报警；`:37` 代价——代码只记形状，理由与后果在文档里，改掉一个没人测的东西，它护着的东西就没了，也没人报。

**替换面（不留两套说法）**：旧 why 链 5 行整删（旧 `:34-:38`）。旧句探针全档零命中：`Someone who does not know the reason` · `two paths` · `follow blindly` · `no basis at all` · `is structural` · `A session completes` · `what you can see is one piece`；其语义并入现 `:37`。提示词里未写「盲人摸象」成语本身（用户令），写的是它说的那件事。

**行长读数（一次性 `node` 脚本 · `split(/\r?\n/)` · 判 `length > 300`）**

| 时点 | 内容行 | 字符数 | >300 行数 | 最长行 |
|---|---|---|---|---|
| 改前 | 429 | 51,542 | 0 | 294 @`:351` |
| 改后 | 428 | 51,768 | 0 | 294 @`:350` |

四段行长 = 255 / 173 / 152 / 219；净差 −119 字符 = 新块 803 − 旧块 922（7 行 915 字符 + 7 折行），旁行零移动。

**门读数**

- `node scripts/prompt-refs-check.mjs`（仓根）⇒ 提示词面 69 档 · 代码面 463 档 · 命中 0 · exit 0。
- `cd thincoder-core && node test/run.mjs` ⇒ tests 35 / pass 35 / fail 0。
- 独立 `node` 进程（盘上引擎直调 · `staleEngineFiles` 的 `stale` = `[]`）`runDocCheck(mode:"gate", docs=[thincoder-core/prompts/common.md])` ⇒ `DOC-CHECK GATE: PASS` · hits {total:0, anchors:0, width:0}。会话内 `doc_check` = `ERROR（引擎已更新…晚于进程启动）`——结构性（并行批在本会话启动后改写了引擎档），非命中。
- 改动面：写工具调用只触 `thincoder-core/prompts/common.md`；字符差与行宽读数为机核，其余档在改 = 并行批遗留。

**审计与评审轮次 · 终态**

| 轮 | 面 | 读数 | 终态 |
|---|---|---|---|
| 内部审计 1 | explore 偏差审计（首版两行） | 四类偏差 0 · 两行 178/165 ≤300 · 旁行未动 | `clean`（被 14:10 逐字令取代） |
| 内部审计 2 | explore 偏差审计（四段终态） | 四段逐字全等 · 旧句 7 探针 0 · 顺序在位 · 行宽 255/173/152/219 · 旁行逐字未动 · 成语 0 | `clean` |
| 代码评审 | advisor `type:"code"`（本档 `:32-:39`） | `VERDICT: pass`；🔴 0 · 🟡2（需求 §13.25 why 段滞后 · 本档 §5 旧 FR47 块失效）· 🔵2（why 标签三种形 · `:35` 第二句逐字出处；后者经查在批准文本内） | `clean`（pass） |

**修正轮 = 1（上限 5）**：用户 14:10 逐字令到达后整块替换一次；审计零修、评审零修。

**决策披露**

| # | 决策 | 理由 |
|---|---|---|
| D1 | 旧 why 链整块替换，不保留其一 | 用户 14:10「要替换掉…不要留两套说法」；四段已含旧链语义 |
| D2 | 四段各占一行，不按句断行 | 255/173/152/219 ≤300，无需断行；一段一行保住一段一意 |
| D3 | 🔵 标签三种形不改 | 措辞 = 用户逐字给定（14:10「措辞尽量逐字」），自改形即改批准文本 |
| D4 | 🟡 两项不自行处置 | 需求档 = 主 agent 笔；本档旧 FR47 段 append-only 无编辑面，由本段取代 |

**上抛项**

- 〔上抛·待裁〕需求 `docs/core/requirements/ENGINEERING-MODE-V2.md` §13.25 的 why 段仍是上一版口径，未登记「part taken for the whole」这一层；设计档 `docs/core/design/PROMPT-SYSTEM.md` 仍无 FR47 节（该档 `:3202` 要求提示词裁定先落设计节）。两项均非本席写域。
- 〔上抛·知会〕本段之前的 §5 FR47 块（记 9 行与逐行读数）已被本段取代；append-only 无编辑面，以本段为准。
- 〔上抛·知会〕会话内 `doc_check` 引擎陈旧（并行批改写了引擎档）——闸判以独立进程读数为准，与本批各段同处置。

### 终读三类残留收口 · 四档（A 整句加粗 16 · B 本仓路径 1 · C 回查指代 13 逐处判）（eng-coder · 2026-10-22）

**派单**：批次档 §2 + 派单正文。判据 = `docs/core/design/PROMPT-SYSTEM.md` §6.45 手法②③ · `docs/core/requirements/ENGINEERING-MODE-V2.md` §13.24。样板 = `thincoder-core/prompts/persona-engineering.md:192`（`- **Closing ledger sweep**: sweep the ledger …`）。

**改动面**：四档 25 行原位改写，行数逐档不变（128 / 429 / 33 / 315）；字符差 = advisor-design +17 · common +3 · consult-base 0 · discipline-normal +79，四档逐行差之和与总差逐一相等（改动行外零笔的机核）。其中 19 行 = 派单点名（A 16 + B 1 + C 真指代 2），6 行 = 评审轮 1 的 must-fix 扩面（见决策披露 D1）。

**A 段 · 16 处整句加粗（改前 → 改后逐字 · 行号为现档）**

| # | 档:行 | 改前（逐字） | 改后（逐字） | 四类内容 |
|---|---|---|---|---|
| 1 | `thincoder-core/prompts/advisor-design.md:46` | `    **An existing piece left unused with no reason it is unusable ⇒ 🔴.**` | `    **Unused existing piece**: an existing piece left unused with no reason it is unusable ⇒ 🔴.` | 规则 + 条件 |
| 2 | `thincoder-core/prompts/common.md:312` | `**A Layering**` | `**A Layering**:` | —（本条无：分组题眼，正文 = 下列 1–3 条） |
| 3 | `thincoder-core/prompts/common.md:318` | `**B Location & naming (predictable)**` | `**B Location & naming (predictable)**:` | —（本条无：同上，正文 = 4–6 条） |
| 4 | `thincoder-core/prompts/common.md:323` | `**C Quality (checkable)**` | `**C Quality (checkable)**:` | —（本条无：同上，正文 = 7–12 条） |
| 5 | `thincoder-core/prompts/consult-base.md:15` | `**Rules:**` | `**Rules**:` | —（本条无：题眼，正文 = 下列 10 条） |
| 6 | `thincoder-core/prompts/discipline-normal.md:6` | `**Before writing code / proposing an approach / changing a doc, walk this step — it holds at ANY tier.**` | `**Survey first, at any tier**: before writing code / proposing an approach / changing a doc, walk this step.` | 规则 + 条件（any tier） |
| 7 | `thincoder-core/prompts/discipline-normal.md:22` | `**Coding — match your approach to the task type:**` | `**Coding tasks**: match your approach to the task type.` | 规则 |
| 8 | `thincoder-core/prompts/discipline-normal.md:65` | `- **After implementing, machine-verify every point the user's original words promised.**` | `- **Verify the promise**: after implementing, machine-verify every point the user's original words promised.` | 规则 + 判据来源 |
| 9 | `thincoder-core/prompts/discipline-normal.md:122` | `  **Settlement needs the closeout first.**` | `  **Settlement order**: settlement needs the closeout first.` | 规则 |
| 10 | `thincoder-core/prompts/discipline-normal.md:170` | `**Your last message is ALL the caller sees — make it self-contained; a report that assumes the process was read is one nobody can act on.**` | `**Make the report self-contained**: your last message is all the caller sees — a report that 
  assumes the process was read is one nobody can act on.` | 规则 + 理由 |
| 11 | `thincoder-core/prompts/discipline-normal.md:184` | `**Testing & review:**` | `**Testing & review**:` | —（本条无：题眼，正文 = 下列条目） |
| 12 | `thincoder-core/prompts/discipline-normal.md:195` | `- **The release gate is the project's full verification chain.**` | `- **The release gate**: the project's full verification chain.` | 规则 |
| 13 | `thincoder-core/prompts/discipline-normal.md:196` | ``- **Integration test cases and test code live together in the project's `test/` directory**.`` | ``- **Where integration cases live**: together with the test code, in the project's `test/` directory.`` | 规则（与 
  `thincoder-core/prompts/discipline-engineering.md:172` 同形） |
| 14 | `thincoder-core/prompts/discipline-normal.md:199` | `- **How you finish:**` | `- **How you finish**:` | —（本条无：题眼，正文 = 下列四行） |
| 15 | `thincoder-core/prompts/discipline-normal.md:210` | `  **This sentence governs the delivery-reconciliation surface; whether an "out-of-scope finding" enters the pool is criterion A's call.**` | `  **Scope of this sentence**: it governs the delivery-reconciliation surface; whether an 
  "out-of-scope finding" enters the pool is criterion A's call.` | 边界 + 规则 |
| 16 | `thincoder-core/prompts/discipline-normal.md:268` | ``  **Declare `files`, since the scheduler only sees declared domains (undeclared = no detection); sync spawns conflicting on files error out (not queued)**.`` | ``  **Declare `files`**: the scheduler only sees declared domains (undeclared 
  = no detection); sync spawns conflicting on files error out (not queued).`` | 规则 + 理由 |

**B 段 · 本仓路径 1 处（`thincoder-core/prompts/discipline-normal.md:7`）**

改前：`- **Look**: `doc_search` the topic → via `docs/README.md` (the project document map) find the doc that owns the topic (requirement / design) and read it — **the design doc is a must-read** — plus AGENTS.md if present.`

改后：`- **Look**: `doc_search` the topic → via the project's declared document map, find the doc that owns the topic (requirement / design) and read it — **the design doc is a must-read** — plus AGENTS.md if present.`

判：`docs/README.md` 是本仓的文档地图档名，换一个项目即不成立；改成项目声明面，不用含糊说法（派单令）。

**C 段 · 回查指代 13 处逐处判**

| # | 位置 | 现文（逐字） | 判 | 判由 / 改法 |
|---|---|---|---|---|
| 1 | `thincoder-core/prompts/advisor-design.md:40` | `(independent doc repos above all)` | 假阳性 | `above all` = 习语「首要地」，不是位置指代 |
| 2 | `thincoder-core/prompts/advisor-design.md:78` | `output nothing beyond the token echo below.` | 真指代 | 改为 `output nothing beyond the token echo.`（删 `below`，指令自足） |
| 3 | `thincoder-core/prompts/advisor-design.md:127` | `You have received the review-object declaration above` | 假阳性 | 指本轮注入在消息首部的评审对象声明——读者手里就有（装配注入面） |
| 4 | `thincoder-core/prompts/advisor-round1.md:99` | 同 3 | 假阳性 | 同上 |
| 5 | `thincoder-core/prompts/advisor-round2.md:25` | `The prior review output above is the COMPLETE output` | 假阳性 | 指本轮评审上下文里注入的上轮输出（装配注入面） |
| 6 | `thincoder-core/prompts/advisor-round2.md:89` | 同 3 | 假阳性 | 同上 |
| 7 | `thincoder-core/prompts/advisor-round3.md:24` | 同 5 | 假阳性 | 同上 |
| 8 | `thincoder-core/prompts/advisor-round3.md:91` | 同 3 | 假阳性 | 同上 |
| 9 | `thincoder-core/prompts/common.md:338` | `(a relative pointer like "see earlier" / "see elsewhere" goes stale, while a section name resolves)` | 假阳性 | 「see earlier / see elsewhere」是**坏形示例**，不是指路 |
| 10 | `thincoder-core/prompts/discipline-engineering.md:84` | `(independent doc repos above all)` | 假阳性 | 同 1（习语） |
| 11 | `thincoder-core/prompts/discipline-engineering.md:165` | `verification cost far above coding cost` | 假阳性 | 比较级用法，非指代 |
| 12 | `thincoder-core/prompts/discipline-engineering.md:283` | `NO "see above / see that section" relative pointers` | 假阳性 | 反面示例（禁用形本身） |
| 13 | `thincoder-core/prompts/discipline-normal.md:298` | `An explicit user request overrides the worthiness judgment above:` | 真指代 | 就地写清：`overrides the judgment of whether the consult pays for itself:` |

**C 段之外 · 评审轮 1 must-fix 扩面 6 行（`thincoder-core/prompts/discipline-normal.md`）**

判据 = 本批 D2（`docs/batches/2026-10-22-prompt-rewrite.md:1471`「「行内整句加粗」也按第 1 类收」）+ 设计 §6.45 手法②。改后逐字：

| 行 | 改后逐字 |
|---|---|
| `:68` | `- **Check existing code**: search for existing functions, helpers, patterns before writing new ones. Duplicates are technical debt.` |
| `:69` | `- **Understand intent**: ask why this change is needed — the "why" reveals scope the literal request hides.` |
| `:70` | `- **Decide what's right before deciding what's smallest**: after understanding intent, before choosing HOW, first answer what SHOULD this be — every entry point, every view, every edge case — then how to implement it.` |
| `:167` | `② **Before claiming done**: actually look at it — screenshots or a hands-on walkthrough; when needed, ask the user to double-check. Machine checks all green ≠ delivered.` |
| `:219` | `- **The "pre-existing" cop-out is not one**: you own the whole code.` |
| `:222` | `- **An unresolved 🔴 stays visible**: a 🔴 you neither fix nor rebut blocks convergence.` |

**复查读数（一次性 `node` 脚本 · 四档）**：整行加粗（含尾句号在外）0 · 行内整句加粗 0 · 行 >300 字符 0（最长 296 @ `thincoder-core/prompts/discipline-normal.md:25`）· `docs/README.md` 在 `thincoder-core/prompts/` 0 · 全 16 档整行加粗 0（改前 16，恰等于派单清单）。

**门读数**

- `node scripts/prompt-refs-check.mjs`（仓根）⇒ 提示词面 69 档 · 代码面 463 档 · 命中 0 · `OK(prompt-refs): J1/J2/J3 三式零命中`（exit 0）。
- `cd thincoder-core && node test/run.mjs` ⇒ tests 35 · pass 35 · fail 0 · cancelled 0 · skipped 0（exit 0）。
- 独立 `node` 进程（盘上引擎直调）`runDocCheck(mode:"gate")` 四档 ⇒ `DOC-CHECK GATE: PASS` · hits {total:0, anchors:0, width:0}；会话内 `doc_check` = `ERROR（引擎已更新…晚于进程启动）`（结构性，非命中）。
- 集成测试面：本笔零代码改动、纯提示词文本 ⇒ 不涉及（父侧收口轮可判）。

**审计与评审轮次 · 终态**

| 轮 | 面 | 读数 | 终态 |
|---|---|---|---|
| 内部审计 | explore 偏差审计（七项：16 处形态 / 整行加粗零残留 / 四类内容 / B 段路径 / C 段真假判 / 行宽 / 点名外改动） | 七项全 PASS · 名单外 0 · 偏差四类 0；附注 1 条（`:22` 题眼改名的取证面） | `clean` |
| 代码评审 1 | advisor `type:"code"`（四档 + 设计 §6.45 / 需求 §13.24） | `VERDICT: changes-required`：🟡 must-fix 1（`thincoder-core/prompts/discipline-normal.md` 6 行行内整句加粗）· 🟡 optional 2（`:167` 双加粗；`criterion A` 标签）· 🔵 1（`thincoder-core/prompts/common.md:127`）· 🟡 coordination 1（本轮 §5 未落） | 进修复 |
| 代码评审 2 | 只核五项处置 + 修复是否引入新 🔴 | `VERDICT: pass`：1 / 2 Fixed（逐字复核）· 3 / 4 Accepted（判由可核）· 5 Unfixed 但非阻断（协调项，本段即其落盘）· 新 🔴 0 | `clean` |

**修正轮 = 1（上限 5）**：评审轮 1 的 must-fix 一轮全修（6 行），轮 2 pass。

**决策披露**

| # | 决策 | 理由 |
|---|---|---|
| D1 | 扩面 6 行（`thincoder-core/prompts/discipline-normal.md` 行内整句加粗） | 评审轮 1 must-fix + 本批 D2 已裁「行内整句加粗也按第 1 类收」；6 行全在本单写域、逐行披露在上表 |
| D2 | 7 处标题行只把冒号移出加粗，不补正文句 | 正文 = 紧随的列表；补句即编内容（§6.45 边界「不新增规则」）。改后形 = 同档既有合法形 `**Four rules**:` |
| D3 | 任务书注意句与 16 项清单相抵，按清单 + 手法② 执行 | 注意句把 `**Coding — match your approach to the task type:**` 举为合法题眼行，而该行正是清单第 7 项；清单逐行可核、手法②判「满行加粗 = 没有重点」⇒ 以判据为准（上抛项 1） |
| D4 | C 段 11 处判假阳性，原文不动 | 判由逐条列上表；其中三处指本轮注入的评审上下文，读者手里就有 |
| D5 | `criterion A` 标签与用法未动 | 标签横跨 `thincoder-core/prompts/discipline-engineering.md` 与 `thincoder-core/prompts/persona-engineering.md`，非本单写域；评审轮 2 记 Accepted（Deferred） |

**上抛项**

- 〔上抛·待裁〕任务书注意句 vs 16 项清单相抵（D3）：注意句点名「以冒号收尾的整行加粗不要动」并举 `**Coding — match your approach to the task type:**` 为例，该行 = 清单第 7 项。本席按清单 + 手法② 收成 `**Coding tasks**: match your approach to the task type.`；若父侧原意是保该行原形，回退 `thincoder-core/prompts/discipline-normal.md:22` 一处即可。
- 〔上抛·待裁〕`criterion A` 标签在提示词面无定义，用法横跨 `thincoder-core/prompts/discipline-normal.md`（3 处）· `thincoder-core/prompts/discipline-engineering.md`（3 处）· `thincoder-core/prompts/persona-engineering.md`（1 处）；需一个持有后两档的批统一处置。
- 〔知会〕评审引证核验报 `file unreadable` = 路径基准差（评审以工作区根 `D:\teamcode` 取 `thincoder-core/...`，实际仓根 = `D:\teamcode\thincoder`）；本席复核其五项判由在现档均成立。
- 〔知会〕会话内 `doc_check` 引擎陈旧（并行批改写了引擎档）——闸判以独立进程读数为准，与本批各段同处置。

**§5 指针形更正（同轮 · append-only 无编辑面 · 交父侧机械回改）**

本段两行里的裸档名触发 `doc_check` 档缺 3 条（`:1817` 两条 · `:1826` 一条）。本席无编辑面，原文不动；回改目标逐行给出（只换路径，语义零改）：

- `:1817` 现文片段 `` `thincoder-core/prompts/discipline-normal.md` 6 行行内整句加粗 `` ⇒ `` `thincoder-core/prompts/discipline-normal.md` 6 行行内整句加粗 ``；同行的 `` `thincoder-core/prompts/common.md:127` `` ⇒ `` `thincoder-core/prompts/common.md:127` ``。
- `:1826` 现文片段 `` `thincoder-core/prompts/discipline-normal.md` 行内整句加粗 `` ⇒ `` `thincoder-core/prompts/discipline-normal.md` 行内整句加粗 ``。

回改后本档整档 gate 应为 0 命中（本席独立进程复跑：除上述 3 条外，锚 0 · 行宽 0）。

**§5 二次更正（同轮 · 补前条 · 只给位置，不再照抄裸名）**

上一条更正块自身（`:1843`–`:1844`）照抄了裸档名，又新增 3 条档缺。父侧机械回改的目标共 6 处，分布 = `:1817`（两处）· `:1826`（一处）· `:1843`（两处）· `:1844`（一处）。做法二选一：把每处裸名换成仓根相对全路径，或把 `:1843`–`:1844` 整块删除（替换文本见本席交付报告）。替换后本档整档应为 0 命中。

### 终读收口 · 两处整句加粗 + `criterion A` 七处换自足说法（eng-coder · 2026-10-22）

**派单**：本批 §2 + 派单正文。判据 = `docs/core/design/PROMPT-SYSTEM.md` §6.45 手法②（`:2934`「加粗只落在每行的题眼上」）· 需求 `docs/core/requirements/ENGINEERING-MODE-V2.md` §13.24（`:1000-1048`）。写域 = 四个提示词档；不动判据语义、不动其它行。

**改动面**：四档九行原位改写，段数逐档不变（102 / 328 / 315 / 470）。字符差 = advisor-round2 +22 · discipline-engineering +106 · discipline-normal +101 · persona-engineering −14，各等于该档逐行差之和；persona 一档另有外部锚——前轮本段记录的全档 67,566，本笔 −14 后现为 67,552（机核）。

**一、两处整句加粗（改后逐字 · 缩进按现档）**

~~~text
# 1  thincoder-core/prompts/advisor-round2.md:28  (100)
4. **Read before judging**: always `read` the current file before deciding an item fixed or unfixed.
# 2  thincoder-core/prompts/discipline-engineering.md:144  (163)
② **Closeout round**: actually look at it — screenshots or a hands-on walkthrough; when needed, ask the user to double-check. Machine checks all green ≠ delivered.
~~~

改法：① 满句加粗收成题眼 `**Read before judging**` + 冒号 + 正文；原词 `ALWAYS` 以 `always` 保留，`judging` → `deciding` 只为不与题眼重复。② 句末 `**Machine checks all green ≠ delivered.**` 去粗，句子本身逐字保留。

**二、`criterion A` 七处（改后逐字 · 缩进按现档）**

~~~text
# 1  thincoder-core/prompts/discipline-engineering.md:225  (138)
   **A missing layer seen in passing that does not block the current work = outside this task book's scope** — not recorded, not acted on.
# 2  thincoder-core/prompts/discipline-engineering.md:237  (167)
11. **Findings in another repo = outside this task book's scope** ⇒ this batch **does not record them, does not book them to any ledger, does not report them upward**.
# 3  thincoder-core/prompts/discipline-engineering.md:274  (157)
   **Out-of-scope items are not booked** (scope test: only findings inside this task book's scope are booked; anything beyond it is a suspicion, not a fact).
# 4  thincoder-core/prompts/discipline-normal.md:51  (134)
   A missing layer seen in passing that does not block the current work = outside this task book's scope — not recorded, not acted on.
# 5  thincoder-core/prompts/discipline-normal.md:118  (251)
- **Book a debt** — work turns up a new defect / debt / doc drift **within scope** ⇒ book it (tech todo) **the same day**; **out-of-scope items are not booked** (scope test: inside this task book's scope ⇒ booked; beyond it ⇒ a suspicion, not a fact).
# 6  thincoder-core/prompts/discipline-normal.md:210  (214)
  **Scope of this sentence**: it governs the delivery-reconciliation surface; an "out-of-scope finding" enters the pool only if it sits inside this task book's scope — anything beyond it is a suspicion, not a fact.
# 7  thincoder-core/prompts/persona-engineering.md:400  (39)
**Booking scope (main-agent version)**:
~~~

改法：标签就地写清「入账范围 = 任务书范围」——范围内才入池，范围外不记、不上抛，只是猜疑。新指代 = the task book：公共层有定义（`thincoder-core/prompts/common.md:374`），节内定义见 `thincoder-core/prompts/persona-engineering.md:402`。第 5 处同时删掉同档 `see "Task boundary & finding discipline"` 的节名回指——它指的那条规则已就地写清，导航不再承担判据。

**读数（一次性 `node` 脚本 · 16 档全扫 · `split(/\r?\n/)`）**

- `criterion A`：`thincoder-core/prompts/` **0**（16 档）；忽略大小写 `criterion[ -]?a` 在 `thincoder-core/` 全树 **0**（含 tool-docs / 代码面）。全仓其余命中 7 档 = `.thincoder/tmp/**` 前像 5 档 + `docs/batches/**` 历史 2 档，均属历史面或写域外。
- 行 >300：16 档 **0**；逐档最长 = advisor-round2 296@58 · discipline-engineering 300@68 · discipline-normal 296@25 · persona-engineering 300@139。
- 整行加粗（加粗文本即整句、句末标点在加粗内）：**0**。
- 行内整句加粗（`\*\*[^*]+[.!]\*\*`）：**1** 处残留 = `thincoder-core/prompts/persona-eng-designer.md:79` 的 `**"Written" is not "self-consistent".**`。不在本单九行目标内（派单「不动别的行」），上抛待裁。

**门读数**

- `node scripts/prompt-refs-check.mjs`（仓根 · 实跑）⇒ 提示词面 69 档 · 代码面 463 档 · 命中 0 · exit 0。
- `cd thincoder-core && node test/run.mjs`（实跑）⇒ tests 35 / pass 35 / fail 0。
- `doc_check(mode:"gate")` 会话内 = `ERROR（引擎已更新 … 晚于进程启动）`——结构性（并行批在本会话启动后改写了引擎档），非命中；盘上引擎独立 `node` 进程直调 `runDocCheck(root, {docs: 四档, mode:"gate"})` ⇒ **`DOC-CHECK GATE: PASS`** · hits {total:0, anchors:0, width:0} · checkFiles 4。

**审计与评审轮次 · 终态**

| 轮 | 面 | 读数 | 终态 |
|---|---|---|---|
| 内部审计 | explore 偏差审计（九行逐字 / 标签清除 / 行长 / 整句加粗 / 名单外 / 语义等价） | 九行 9/9 逐字相符 · 四类内容未丢 · 名单外 0（mtime 界：四档同一时刻，其余 12 档更早）· 两门未复跑（审计席装配无 shell，本席实跑读数在案） | `clean` |
| 代码评审 | advisor `type:"code"`（四档 + 本批 §2 / 设计 §6.45 / 需求 §13.24） | `VERDICT: pass` · 🔴 0 · 🟡 2（1 可选 = `thincoder-core/prompts/persona-eng-designer.md:79` 残留；1 协调项 = 本轮落账）· 🔵 2（`:210` 引号词读来自相抵 · 派单判据「换个仓还成立吗」在 §13.24 定位不到） | `clean`（pass） |

**修正轮 = 0**：审计零必修；评审无 must-fix（两条 🟡 均标非 must-fix）。🔵 两条按「接受并记由」处置，见决策披露 D2 / D3。

**决策披露**

| # | 决策 | 理由 |
|---|---|---|
| D1 | 七处不套同一句式，按所在句形分两形：已带去向的句子只换指代（out of scope ⇒ outside this task book's scope）；只给结论的句子补完整 scope test | 判据是「自足」不是「同字」；带去向的句子里补整句定义是重复，只给结论的句子不补判据就仍不可执行 |
| D2 | 评审 🔵 `thincoder-core/prompts/discipline-normal.md:210` 不修 | 引号词 `"out-of-scope finding"` 是原句自带的标签，句中已由 `only if it sits inside this task book's scope` 给出判定；改后文本会脱离本轮评审面，风格收益不抵一轮复核 |
| D3 | 评审 🔵「换个仓还成立吗」定位不到不修 | 需求档 = 主 agent 笔，非本席写域；改引 `:1011` / `:1013` 两句可核原文，交父侧随正 |
| D4 | `thincoder-core/prompts/persona-eng-designer.md:79` 不动 | 九行目标外的行；派单明令「不动别的行」。同类真命中，上抛待裁 |

**上抛项**

- 〔上抛·待裁〕`thincoder-core/prompts/persona-eng-designer.md:79` 行末 `**"Written" is not "self-consistent".**` 是整句加粗（句号在加粗内），与本轮收掉的两条同类。派单的终读读数把它记作 `**one root cause**` 短语假阳性；但命中批次档自定判据 `行内整句加粗`（本档 `:1424`）的跨度是这一句，不是那个短语。九行目标不含该行，按「不动别的行」未动——收成题眼形还是记为已知接受，请父侧裁。
- 〔上抛·知会〕代码评审的引证核验报 `0/15 citations match` = 路径基准差（评审以工作区根 `D:\teamcode` 取 `thincoder-core/...`，实际仓根 = `D:\teamcode\thincoder`）；本席逐条复核该等坐标在现档成立，与本段 `:1409` 同源。
- 〔上抛·知会〕会话内 `doc_check` 引擎陈旧（并行批改写了引擎档）——闸判以独立进程读数为准，与本批各段同处置。

### 末条行内整句加粗收口 · `thincoder-core/prompts/persona-eng-designer.md:79`（eng-coder · 2026-10-22）

**派单**：本批 §2 + 派单正文。判据 = `docs/core/design/PROMPT-SYSTEM.md` §6.45 手法②（`:2934`「加粗只落在每行的题眼上」）· 需求 `docs/core/requirements/ENGINEERING-MODE-V2.md` §13.24（`:1008` 同句 · `:1014` 内容边界允许删装饰性加粗）。写域 = 该一行；其余档零笔。

**改动面**：一行原位改写，行数不变（143 行）。整行 258 → 254 字符，差 −4 恰等于两对 `**` 的四个字符。

**改前 → 改后（逐字）**

| 时点 | 该行末段逐字 | 整行字符 |
|---|---|---|
| 改前 | `downstream). **"Written" is not "self-consistent".**` | 258 |
| 改后 | `downstream). "Written" is not "self-consistent".` | 254 |

改后整行：

~~~text
   - **Why this is called out**: the three share **one root cause** — each spot correct, the whole inconsistent; and only the machine check / review catches it (skip the self-check and you forward the cost downstream). "Written" is not "self-consistent".
~~~

**选形**：取「去粗、句子逐字保留」，不取 `**Written ≠ self-consistent**:` 形。该行题眼已在行首 `**Why this is called out**`，再造一个句首题眼 = 一行两处题眼，且要改词序；本批同形先例即「句末整句加粗去粗、句子逐字保留」（本档 `:1880`）。

**读数（一次性 `node` 脚本 · `split(/\r?\n/)` · 16 档全扫）**

| 项 | 改前 | 改后 |
|---|---|---|
| 16 档「行内整句加粗」`\*\*[^*]+[.!]\*\*` | 1（唯一一处 = 本行） | **0** |
| 该档行数 | 143 | 143 |
| 该档 >300 字符行数 | 0 | **0** |
| 该档最长行 | 298 @`:104` | 298 @`:104`（未改行） |

**门读数**

- `node scripts/prompt-refs-check.mjs`（仓根 · 实跑）⇒ 提示词面 69 档 · 代码面 463 档 · 命中 0 · `OK(prompt-refs): J1/J2/J3 三式零命中`（exit 0）。
- `cd thincoder-core && node test/run.mjs`（实跑）⇒ tests 35 · pass 35 · fail 0 · exit 0。
- `doc_check` 会话内（该档）= `ERROR（引擎已更新 … 晚于进程启动）`——结构性（并行批在本会话启动后改写引擎档），非命中；盘上引擎独立 `node` 进程（`staleEngineFiles` = `[]`）直调 `runDocCheck` ⇒ **`DOC-CHECK GATE: PASS`** · hits {total:0, anchors:0, width:0}。
- 本批次档同引擎直跑 = `REFUSED（命中 3 条）`：`docs/batches/2026-10-22-prompt-rewrite.md:1945` 一处 · `:1964` 两处，全在 §6（父侧笔），非本席；本席无编辑面，交父侧路由。
- 改动面：该档 `git diff --numstat` = `86/33` → `87/34`（+1/−1 = 恰一行）；机核 = 全档字符差 −4 等于被删的两对标记。

**审计与评审轮次 · 终态**

| 轮 | 面 | 读数 | 终态 |
|---|---|---|---|
| 内部审计 | explore 偏差审计（九项：逐字 / 词零改 / 行内其余加粗 / 邻行 / 16 档读数 / 行长 / 名单外 / 四类偏差 / 选形判据） | 九项全 PASS · 四类偏差 0/0/0/0 · 名单外档 0（mtime：该档 06:38，其余 15 档更早） | `clean` |
| 代码评审 | advisor `type:"code"`（该档 + 设计 §6.45 / 需求 §13.24 / 本批档为判据面） | `VERDICT: pass` · 🔴 0 · 🟡 0 · 🔵 2（`:79` 余 `**one root cause**` 非题眼短语加粗 · 两门读数评审面不可复跑） | `clean`（pass） |

**修正轮 = 0**：审计零修，评审无 must-fix。

**决策披露**

| # | 决策 | 理由 |
|---|---|---|
| D1 | 去粗、句子逐字保留，不改写成句首题眼 | 该行题眼已在行首；再造一个 = 一行两处题眼且动词序；同形先例见本档 `:1880` |
| D2 | 评审 🔵「`:79` 余 `**one root cause**` 非题眼」不修 | 本批已裁该短语对「整句加粗」判据是假阳性（本档 `:1936`）；收它 = 重开一行读数已 0 的行，且多加重行先例在（本档 `:1894`） |
| D3 | 段内文档引用一律写仓根相对全路径 | 裸档名在非提示词面落 `档缺`（本批 K3 同因）；本段 gate 读数为零新增命中 |

**上抛项**

- 〔上抛·知会〕本批次档 §6 的 3 条锚命中（`:1945` / `:1964`）非本席笔，本席无编辑面，交父侧 §6 收口时路由。
- 〔上抛·知会〕会话内 `doc_check` 引擎陈旧——闸判以独立进程读数为准，与本批各段同处置。

**§5 坐标更正（同轮 · append-only 无编辑面）**：上段「门读数」与「上抛项」里记的 §6 锚命中坐标 `:1945` / `:1964` = 本段落笔**前**的读数；本段插入后两处现为 `:2005` / `:2024`（同一三条命中、同一三名 token，数量零变）。指针口径以「§6 ① 行与 ⑨ 行」为准，不再按行号取。

## §6 验证与收口（父代理）

**验证与收口（父侧）**

**① 本批验证读数**
- 甲舱 9 档：每档 0 行 >300（一次性 node 脚本，CWD = `thincoder/`）。样板档 `thincoder-core/prompts/persona-engineering.md`：249 行 / 66,324 字符 / 78 行超 → 470 行 / 67,552 字符 / **0 行超**，最长 1,486 → 300（未改行）。
- `node scripts/prompt-refs-check.mjs`：提示词面 69 档 · 代码面 463 档 · **命中 0**。
- `cd thincoder-core && node test/run.mjs`：**35 / 35 pass**。
- `doc_check` 独立进程（盘上引擎）：八份文档（设计 3 · 需求 3 · 提示词 2）逐个 **PASS**，0 命中。会话内工具面报 `ERROR（引擎已更新）`——本会话进程启动早于引擎改动，属结构性陈旧；**收口后需重启会话复跑**，父侧已在本批 §6 记此前置。

**② 语义对账**：甲舱 78 行 × 四列映射表在 §5（各席写入）；父侧抽查最长十行（`:104` 那一行 1,486 → 六行 288/213/200/252/183/130），四类内容（规则 / 条件 / 例外 / 理由）逐条在位；用 `git show HEAD:` 取改前全文做词表差集（8,429 → 8,446 词），三个「1→0」的词逐个追到重排后的行。

**③ 第四步独立复查**：`advisor #32` 判 changes-required（🔴1 · 🟡6 · 🔵2），五条主要发现经父侧逐条复读**全部属实**；修复由 `#33`（两档六类清零）· `#35`（不存在的写面 + 死指代）· `#36`（五档形态）· `#37`（六类全清）· `#42`（九处归属话）· `#44`（评审归属矛盾）· `#46`（四行 why）· `#47`（16 处整句加粗 + 13 处回查指代逐处判）· `#48`（`criterion A` 七处 + 两处加粗）· `#49`（末条加粗）分批落地。

**④ 终读（父侧实跑，16 档）**：行 >300 = **0** · 整句加粗 = **0**（25 处整行加粗全为合法题眼行）· 行内整句加粗 = **0** · 本仓路径约定 = **0** · 日期/`user ruling` 括注 = **0** · 写死配置值 = **0** · 中文评审面 = **0** · `criterion A` = **0**。

**⑤ 集成测试**：本批只改提示词文本，仓内无对应集成用例 ⇒ 不形成集成门；单测 35/35 为唯一测试门。

**⑥ 台账**：`#1735`（FR46）在途 → 待核销 → **已核销**（依据 = 本 §6 的终读读数）。新增并已核销/在途：`#1736`（tool-docs 全称句 · 条件）· `#1737`（设计档活坐标漂移 · 条件）· `#1738`（子代理 manifest 只读面 · 在途，另批）。

**⑦ 暂缓批复核**：本批无暂缓批 ⇒「暂缓批复核：无」。

**⑧ doc-check gate（收口轮）**：本批文档集 = 需求 §13.24/§13.25 + 设计 §6.45 + 三张批档；独立进程读数全 PASS，会话内 ERROR 为引擎陈旧（见 ①），重启后复跑为准。

**⑨ 遗留（已在台账或在下一批）**：设计档 §6.45 受影响文件表的「现行」读数已成历史值（`#1737`）；`thincoder-core/tool-docs/manifest.md` 的 Anchors 全称句仍绝对化（`#1736`）；`thincoder-core/prompts/persona-eng-designer.md:79` 末条整句加粗由 `#49` 收尾。
