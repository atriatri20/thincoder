# 2026-10-19 · prompt-mech-single-face
> 六段 append-only，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 编制：主 agent · 2026-10-19 · 来源 = 用户 2026-10-18 23:32「后续都自动跑完吧」——R4（蓝图第 4 轮）：把机制文档 / 需求档里「提示词双份制」的陈述改成单面制。**这是 R5 的硬前置**：指针不改完就删目录，中间态必留死链。。
> 台账 = #1682（core · 归批）。前情 = docs/batches/2026-10-18-prompt-single-face.md §2.9 R4（已收口 2026-10-18）。
## §1 讨论（主 agent）
**状态行**：已收口 2026-10-19
<§1 模板占位：本批条目 / 关键判据 / 授权口径>

### 讨论收敛（父侧 · 2026-10-19 00:12）

**用户令**：2026-10-18 23:32「后续都自动跑完吧」。

**R4 是什么**：把机制文档 / 需求档里所有「提示词有中文正本」「CN = 文档面 ∥ EN = 代码面」「两处相等」这类**双份制陈述**，改成单面制（唯一副本 = `thincoder-core/prompts/**`）。**这一步必须早于 R5**：指针不改完就删 CN 目录，中间态必留死链。

**范围（蓝图 §2.9 R4 + §2.6 / §2.7 逐处清单）**：

| 面 | 量 | 笔 |
|---|---|---|
| **A 组**（路径字面处，A1–A22，含 W 类无路径字面句） | 22 处 | 机制文档面 = eng-designer |
| **B 组**（机制档档级陈述） | 24 档 | 同上 |
| **需求档** | 12 档 | 主 agent（本席） |
| **地图** | `docs/README.md` | 同上 |

**两条判面（验收用）**：

1. **路径字面** —— 域 = `docs/**`，扣 `docs/batches/**` · `**/_archive/**` · 产品树 `thincoder-{cli,vscode}/docs/**`；判据 = `docs/core/design/prompts` 在该域内计数 **0**。
2. **无路径字面的陈述句** —— `grep` 抓不到（如 `DOC-SYSTEM.md:143` 的 P4 判据句），只能按 §2.6 A 组 + §2.7 W 类**逐处勾稽**：清单全覆盖即达标。

**为什么必须逐处勾稽**：首轮评审就漏掉过这两处——因为它们句内不含路径字面，机械判据抓不到。**只有清单能兜住。**

**边界**：不改提示词（R1/R3 已落）· 不删 CN 目录（R5）· 不改代码 · `_archive` 与产品树参照历史不处置。

### 父侧实施记录（需求档 13 档 · 2026-10-19 00:45）

**清单缺口（实测）**：设计 §2.6 列需求档 **26 处**；父侧对 15 档做 token 族全扫（`中文正本 / 中文设计档 / 中文设计文档 / 中文提示词 / 提示词正本 / 正本面 / 两面 / 两份 / 双份 / 设计→实现 / 精确翻译 / 翻译回写 / 运行期面 / 落地档`）后实得 **54 行命中**。逐行判别后：

| 类 | 量 | 处置 |
|---|---|---|
| 真双面制陈述 | 约 30 处 | 改 |
| 假阳性（「两份实现」「两面文案」「双份索引」等他义） | 约 24 处 | 不动作（已逐行判过） |

**判定**：这不是设计席的扫描失误——**§2.10.1 的 token 族只扫了机制档，需求档沿用了 §2.6 的旧清单**（写于 R1–R3 之前）。与 `advisor#26` 的 🔴 同源，只是面不同。

**已落（父侧笔，逐档）**：

| 档 | 处 |
|---|---|
| `PROMPT-SYSTEM.md` | 15（含 :4 :11 :46 :50 :54 :93 :98 :109 :157 :171 :174 :176 :181 :240 :241） |
| `ENGINEERING-MODE-V2.md` | 10（:356 :440 :442 :444 :446 :449 :451 :602 :618 :701） |
| `METHODOLOGY.md` | 11（:5 :15 :17 :18 :19 :35 :54 :104 :105 + 全档路径改名） |
| `CORE-UNIFICATION.md` | 4（:73 整行删 · :79 整条删 · :103 尾句 · :161） |
| `NORMAL-MODE.md` | 4（:33 :103 :115 + 路径改名） |
| `LIGHT-CHANNEL.md` | 4（:82 :83 :84 + 路径改名） |
| `DOC-SYSTEM.md` | 2（:23 :27） |
| `ADVISOR-CONVERGENCE.md` | 1（:75 N5） |
| `PHILOSOPHY.md` | 1（:149） |
| `TESTING.md` | 1（:155 加「已随镜像取消退场」） |
| `STRUCTURE-DEBT.md` | 1（:17 改指机制档） |
| `TWO-REPO-MERGE.md` | 1（:26 F4 注记改「整条退役」） |
| `ENGINEERING-MODE-V2-SPEC-PROMPT-PIPELINE.md` | 5（:1 标题 :7 :11 :14 :34）——**未整档退场**：`ENGINEERING-MODE-V2.md:453` 仍引其 ②4，退档需同轮改指，留台账另批 |
| `docs/README.md` | 2（:3 :5? → :3 与 :51 地图行） |

**机械改名披露**：5 档内 `docs/core/design/prompts/` → `thincoder-core/prompts/` 共 12 处，用脚本做（**零语义的单一符号替换**，替换数与残留 0 已复核）——这是唯一允许脚本的形态，其余全部逐档读改写。

**门**：`DOC-CHECK GATE: PASS`（显式 14 档 · 0 命中）。

**残留 token 复核**：需求档内 `中文正本 / 中文设计档 / 中文设计文档 / 中文提示词 / 提示词正本 / 正本面 / 设计→实现 / 翻译回写` = **0**（两个真残留已收：`ENGINEERING-MODE-V2.md` 的「无中文设计档一支」按 D8 删）；`两面 / 两份 / 双份` 保留者经逐行判为他义。

## §2 批次任务与设计（eng-designer）
**状态行**：设计完成 2026-10-19（A13 已落 CORE-UNIFICATION 单档（19 + 新补 36 处）· #41 / #45 已收 · 本笔：AGENT-LOOP-UPSTREAM 17 处同族命中（内容权 / 父侧定稿 / 内容权威 / 落笔分述）已逐处判义——15 行 16 处改、1 处判他义保留（:557「内容权在核侧」= 核 ∥ 端的文本归属）；四族读数 1 / 0 / 0 / 0，gate PASS）
<§2 模板占位：本批条目（覆盖） / 设计档落点 / 机制设计 / 受影响文件与测试覆盖 / 验收对照 / 关键决策 / 上抛项>

### 2.1 本批口径与笔域（承接 §1，不复述裁定）

**R4 = 把机制文档 / 需求档里「提示词双份制 / 中文正本 / 两处相等」的陈述改成单面制**：唯一副本 = `thincoder-core/prompts/**`（产品代码）· 规则的人读权威 = 中文机制文档（`docs/core/design/` 纪律族）。本批产出 = **逐处执行清单（现文 → 改后）**；**本步不落笔任何档**。

**笔域（D1 = `DOC-DISCIPLINE.md:15`，判据 A.3 / A.4 已裁）**：

| 面 | 笔 | 本批交付 |
|---|---|---|
| 机制文档（`docs/core/design/**` + `docs/README.md` 地图） | eng-designer（本席） | 逐处现文 + 改后（§2.3–§2.5） |
| 需求档（`docs/core/requirements/**`） | 主 agent | 只列坐标 + 改后要点（§2.6） |
| 提示词（`thincoder-core/prompts/**`·`docs/core/design/prompts/**`） | eng-coder（产品代码面）· CN 镜像随 R5 删 | **不在 R4**：A17–A19 见 §2.4 处置列（已裁，非新语义） |

**判面（验收用，逐字承冻结蓝图 `2026-10-18-prompt-single-face.md` §2.9 R4 行）**：

1. **判面一 · 路径字面**：域 = `docs/**`，扣 `docs/batches/**` · `**/_archive/**` · **`docs/TODO.md` · `docs/TODO-archive.md`**（与 `PROJECT-MANIFEST.json` `checkConfig.anchors.exclude` 的 `TODO*.md` 同集）· 产品树 `thincoder-cli/docs/**` ∥ `thincoder-vscode/docs/**`；判据 = 该域内 `docs/core/design/prompts` **计数 = 0**；记录面（`docs/TODO*.md`）另计并给读数。
2. **判面二 · 清单勾稽**：句内不含上面那串完整字面的陈述（裸 `design/prompts/` ∥ 完全无路径的「中文设计档 = 人读规格」类）**`grep` 抓不到**，判据 = 本档 §2.5 + §2.6 + §2.7 清单**全覆盖**。

### 2.2 坐标漂移（蓝图 §2.6 写于 R1–R3 之前 → 今天盘上实测）

**实测手段**：`docs/**` 全量逐行扫 `design/prompts`（扣 `batches` / `_archive`），逐档出命中行号；再对每处逐行实读。读数：**域内命中共 203 行 / 38 档**（机制档 24 · 需求档 10 · 地图 `README.md` 1 · `TODO.md` · `TODO-archive.md` · `cli/design` 1；`docs/core/design/prompts/*.md` 自身不含该字面，不计）。

| 档 | 蓝图坐标 | 今天盘上 | 漂移 |
|---|---|---|---|
| `design/PROMPT-SYSTEM.md` | A1 `:862` · A2 `:866-878` · A3 `:884-889` · A4 `:891-915` · A5 `:818` · A7 `:925` | `:883` · `:889-899` · `:905-910` · `:912-936` · `:839` · `:946` | **+21**（逐处已核，A6/A8 未漂） |
| `design/DOC-DISCIPLINE.md` | B 组 `:1552` · `:1890` | `:1559` · `:1897` | **+7**（R2 落 §4.4 追加段） |
| `design/LEDGER.md` | B 组 `:403-406` | `:421` · `:424` | **+18**（R2 落 §1.1） |
| `design/ADVISOR-CONVERGENCE.md` | B 组 `:75` | 今天 `:75` **无命中**；命中 `162,176,178,179,197,199,201,210,220,221,222,223,233,342,381,401,402,409,419` | 蓝图 `:75` 系漂出 / 或原为无路径陈述（今天该行无字面） |
| `design/DOC-MIGRATION.md` | B 组 `… · 507 · 517` | 今天无 `:507` / `:517` 命中（命中 6,97,264,270,333,336,367,376,484） | 两条失效 |
| `design/ANCHOR-DEBT-REPAIR.md` | B 组 `230 · 309-311` | 命中共 6 行：`146,157,158,230,309,311` | **蓝图漏 3 行**（146/157/158） |
| `design/LEDGER-SELF-CONTAINED.md` | B 组 `:189` | 今天**零命中** | 该处已无字面（下沉为无路径陈述的可能 ⇒ 归 §2.7 W 待核） |
| `design/PORTABILITY.md` | B 组 `:230` | 今天**零命中** | 同上 |
| `design/DOC-SYSTEM.md` | A11 `:121 / :269 / :272-276 / :343 / :355 / :326-327` | 全部在盘（`:355` 无路径字面，属 W） | 无漂移；**另有 `:152` · `:154` 两处蓝图未列**（裸 `design/prompts/`） |
| `design/CORE-UNIFICATION.md` | A13 `:485` + 随动 17 处 | 全部在盘（`:12/31/40/45/68/69/80/173/266/302/409/417/420/516/536/585/586/953`） | 无漂移 |
| `requirements/**`（12 档） | 蓝图列 40+ 坐标 | 路径字面命中仅 15 行；无路径陈述另 20 行 | **大面漂移**，逐处见 §2.7 |

**结论**：机制文档侧漂移 = 三档（PROMPT-SYSTEM +21 · DOC-DISCIPLINE +7 · LEDGER +18），其余按今天坐标执行；需求档以 §2.7 今天坐标为唯一执行面（蓝图坐标作历史参照，不作执行依据）。

### 2.3 A 组 · 机制陈述本体（逐处现文 → 改后）

> **现文一律为今天盘上逐字摘录**（长行取决定性子串，以「…」表示省略，其余逐字）；**改后一律定一形**，不留「按单面改」「视情况」。

| # | 档:行（今天） | 现文（逐字摘录） | 改后（逐字） |
|---|---|---|---|
| **A1** | `design/PROMPT-SYSTEM.md:883` | 「**定位**：提示词两份，关系 = **设计 → 实现**——**中文提示词 = 设计文档**（`docs/core/design/prompts/`，人读的规格；用中文因读者是中文用户，与它的性质无关）∥ **英文提示词 = 代码**（`thincoder-core/prompts/`，机器执行物）。流程 = 先改中文设计文档 → 英文由 coder 在编码时依它**精确翻译**生成（生成 = 精确翻译，不是 cp、不是照抄）。**无机检门**（用户裁定：无限机检反感）。」 | 「**定位**：提示词 = **产品代码**，唯一副本 = `thincoder-core/prompts/`（16 档，运行期直接加载）。规则的**人读权威** = 中文机制文档（`docs/core/design/` 纪律族）。变更路子 = 改规则 → 先改机制文档 → coder 依它改 EN（走产品代码面：需求 → 设计 → 评审 → coder）。**无机检门**（用户裁定不变）。」 |
| **A2** | `design/PROMPT-SYSTEM.md:887-899`（§8.1 全节） | 标题「### 8.1 路径（多根取法与落地面裁定）」+ 两行表「**模板（CN 设计文档）**｜`docRoot.design` **逐根** + `/prompts`——**取实存者**；本仓 = `docs/core/design/prompts/`（16 档）」+「**取法裁定（选定「逐根取实存」）**」四条 + 「**两份语义**：中文设计文档 = 人读的规格…生成 = **精确翻译**（中文 → 英文），**不是 cp、不是照抄**」 | 整节改为「**提示词面无模板 / 落地二元**」一节：只有一个运行期面 `thincoder-core/prompts/`（加载面 = `thincoder-core/prompt-files.mjs:29-30` `PROMPTS_DIR`，包内固定）。`docRoot.design + /prompts` 的模板探测**退场**（该目录不存在是终态，不是配置缺口，不 fail-loud）。`promptsLanding` 键**保留**、语义收正为「提示词唯一副本路径声明」（不再是「落地产物目录」）——删键 = schema 面改动（`MANIFEST.md` 八键 · 需求规格），不属 R4，要删另立批；本仓 `PROJECT-MANIFEST.json:25` **无改动**。 |
| **A3** | `design/PROMPT-SYSTEM.md:901-910`（功能点表 F2 / F3 + 「结构级复核」段） | F2「更新流程约束 ｜ 先改中文设计文档 → 依它精确翻译生成英文代码——后者是生成物」· F3「落点读声明面 ｜ 模板 = `docRoot.design` 逐根 + `/prompts`，**取实存者**…」· 「**结构级复核（已结清）**：**判据 = 结构 / 条目级对应**（槽位标记 + 标题树 + 条目与技术 token）——两侧 = 中文设计文档 ↔ 英文代码的一致形态…P1–P4 处置…」 | F2 改「更新流程约束 ｜ 改规则 → 先改机制文档 → coder 依它改 EN（产品代码面；无「生成物」一步）」；**F3 整行删**（无模板面可解析）；**「结构级复核（已结清）」整段删**（无第二面可对）。 |
| **A4** | `design/PROMPT-SYSTEM.md:912-936`（§8.2 16 对复核表 + 两处收正） | 「### 8.2 结构级复核（16 对 · 已结清）」16 行表（每行「双语正当差」）+「**两份内容差收正**：四行并入 CN（判据 = **D-PS1**「中文设计文档 = 内容权威」）…」 | **§8.2 整节删**（复核对象不存在：没有 16 对）；「四行并入 CN」条**删**（CN 面不存在；那四行 EN 现体已在）。 |
| **A5** | `design/PROMPT-SYSTEM.md:839`（D-PS1） | 「D-PS1 ｜ **中文设计文档 = 设计基准**；英文代码 = 依它精确翻译生成 ｜ 承用户裁定 A7 面；生成 = 精确翻译，不是 cp、不是照抄；两份不同语言、无硬一致要求」 | 「D-PS1 ｜ **提示词 = 代码单源**（`thincoder-core/prompts/`）；规则的人读权威 = 中文机制文档；同一规则两处成文 = 缺陷 ｜ 2026-10-18 23:01 裁定（取消中文镜像）」**同族随动**：`:840` D-PS2（「EN 落地 = CN 定稿的语义对等翻译」）**整行删**——翻译流退场，该行无对象。 |
| **A6** | `design/PROMPT-SYSTEM.md:152-153`（§6.1 头两条） | 「**英文提示词 = 代码**（中文设计文档 = 设计文档；FR1 口径不变）；**内容权 = 主 agent**…**落笔分述**——**中文设计文档 = eng-designer 笔**（随设计轮直落）· **英文代码 = eng-coder 落笔**…」·「**两份**：**中文设计文档** = `docs/core/design/prompts/`（16 档——人读的规格；设计基准与设计维护面）∥ **英文代码** = `thincoder-core/prompts/`…**名等价**：§1 ∥ §2.2「中文设计档」∥ 各处「中文正本」…均指同一份。」 | `:152` 改「**提示词 = 产品代码面 ⇒ 单笔域 = eng-coder**（内容依据 = 机制文档）；无「中文设计面」一支；父侧改提示词 = 改产品代码，走 coder（判据 A，2026-10-18 23:01 裁定）。」；`:153` 改「**唯一副本** = `thincoder-core/prompts/`（16 档）+ `thincoder-core/tool-docs/`（53 档）——运行期加载面（承 F8）。」——「名等价」整句随删（无第二份可等价）。 |
| **A7** | `design/PROMPT-SYSTEM.md:946`（AC-M9-3 判据域注） | 「**域** = 两份提示词档（中文设计文档 16 + 英文代码 16 = 32 档）」 | 「**域** = 提示词档 16 档（`thincoder-core/prompts/`）」 |
| **A8** | `design/PROMPT-SYSTEM.md:15 · :20 · :22 · :41-56 · :67-68 · :97 · :102 · :115-117`（§1 / §2 的中文设计档族） | `:15`「**中文设计档（供人读・非运行期——英文代码由它精确翻译生成）** ｜ `thincoder-cli/docs/design/prompts/*.md`（实核空；现落 `docs/core/design/prompts/*.md`〔16 档〕）…」· `:20`「**中文设计档永进核** ✗（归属**文档面**…）」· `:41-43` §2.2 标题 + 组陈述 · `:47-56` 10 行「镜像 · 1.0000 · 同 · 文档面」· `:67-68` #50/#51 两行 · `:97`/`:102` 明细两条 · `:115-117` #120–122 三行 | `:15` **整行删**（§1 表 4 行 ⇒ 3 行）；`:20` 改「**核内只有运行期面** ✓——`thincoder-core/prompts/`（16）+ `thincoder-core/tool-docs/`（53）；`docs/` 下不建提示词档（单面制）」；`:22` 括注「（槽位 / 描述 / 中文设计档）」⇒「（槽位 / 描述）」；**§2.2 整节删**（标题 + 组陈述 + 表头 + 10 行 = `:41-56`），其后 §2.3 / §2.4 节号顺移一级、节内互引同轮改指；`:67-68`（#50/#51）两行删；`:97`/`:102` 对应明细两条删；`:115-117`（#120–122）三行删。**表行数 / 档数计数句按 D3 同轮随正**（删除表行合计 15 行 + §1 一行）。 |

| **A9** | `design/DOC-SYSTEM.md:301-308`（§10.3） | 「### 10.3 落点二：提示词层（**不落**——英文提示词 = 代码）」+ 表两行「`docs/core/design/prompts/persona-engineering.md`（**正本**）…在「边界」条**追加判据句**」「`thincoder-core/prompts/persona-engineering.md`（**运行期落地档**）…按正本**回写**」+「**为何落这里（实核）**：两池机制的唯一详述处 = `docs/core/design/prompts/persona-engineering.md`…**本设计只给落点与文本，不写提示词档**」 | 标题改「### 10.3 落点二：提示词层（**只落 EN 一面**）」；表改 **1 行**：「`thincoder-core/prompts/persona-engineering.md`（唯一副本）｜§「台账（需求池 / 技术待办）——攒批与生命周期」第 5 条**边界**｜在「边界」条**追加判据句**（同 §10.1 文本，不加新节）」；「为何落这里」改「两池机制的详述处 = `design/LEDGER.md`（机制档）；提示词只是该规则的执行面」。 |
| **A10** | `design/DOC-SYSTEM.md:174`（N-d） | 「**N-d** ｜ **正本不与落地档同名混淆** ｜ 提示词正本 = `docs/core/design/prompts/<槽名>.md`；运行期落地档 = `thincoder-core/prompts/<槽名>.md`——**两者不同域**（文档面 vs 代码面），路径前缀可区分」 | 「**N-d** ｜ **提示词不建第二处** ｜ 提示词档只在 `thincoder-core/prompts/`；`docs/` 下不得出现同名档（机检：`docs/**` 下 `prompts/` 目录数 = 0）」 |
| **A11** | `design/DOC-SYSTEM.md:121` | 「`docs/design/prompts/`（16 档正本） ｜ `docs/core/design/prompts/` ｜ 提示词正本归 **core**（其落地档 = `thincoder-core/prompts/` · `tool-docs/`）」 | 「`docs/design/prompts/`（16 档） ｜ **无去向（整族退场）** ｜ 提示词唯一副本 = `thincoder-core/prompts/`；`docs/` 下不含提示词档」（**行保留，列结构不动**） |
| **A11** | `design/DOC-SYSTEM.md:269`（§9 ③） | 「`docs/design/prompts/` 仓根 = 提示词**正本**；核 `prompts/` · `tool-docs/` = **运行期落地档** ｜ 正本归 **core** 部分…两份链路（正本 → 回写核内落地档 → 产品两份不参与）**不变**… ｜ ⚠ **路径变更**」 | 「提示词只有一份 = `thincoder-core/prompts/**`（运行期加载面 = 产品代码，不入 `docs/`）；`docs/` 侧无提示词档 ｜ 本规划不引入文档面提示词档，P4 按单面陈述 ｜ ✓ 自洽」 |
| **A11** | `design/DOC-SYSTEM.md:272-276`（修法 1） | 「**修法 1（③ 的连带——串级扫替）**：正本落 `docs/core/design/prompts/` 后，根层文档…内全部 `docs/design/prompts/` 引用须**串级扫替**…**扫替域** = 根层 `docs/**`（扣 `_archive/` 与时序日志面）；**两产品树排除**…**判据** = 扫替后域内 `docs/design/prompts/` 计数 = 0。」 | 「**修法 1（③ 的连带——引用清扫）**：『正本 → 回写落地档』链路退场；保留扫替判据——域 = 根层 `docs/**` 扣 `_archive/` 与时序日志面、两产品树排除，判据 = 域内 `docs/design/prompts` ∥ `docs/core/design/prompts` 引用计数 = 0。**该清扫属 R5（与删档同批）**。」 |
| **A11** | `design/DOC-SYSTEM.md:343`（决策 8） | 「正本落 `docs/core/design/prompts/` ｜ 提示词正本 = core 机制（落地档 `thincoder-core/prompts/`）」 | 「提示词无文档面正本；唯一副本 = `thincoder-core/prompts/` ｜ 承 2026-10-18 取消镜像裁定」 |
| **A11** | `design/DOC-SYSTEM.md:355`（§13 A1 行） | 「…现有 16+16 板块档与提示词正本去向逐项给出（§4 表） ｜ FR1」 | 「…16+16 板块档去向逐项给出（§4 表）；提示词面无文档面档（单副本 = `thincoder-core/prompts/`） ｜ FR1」 |
| **A11** | `design/DOC-SYSTEM.md:326`（§11 行 7） | 「`docs/core/design/prompts/discipline-engineering.md` ｜ 189 ｜ +5 ｜ 两池判据句（§10.3） ｜ 英文提示词 = 代码 ⇒ 主 agent 内容权」 | **整行删**（该档随 R5 消失；行数 189 亦与实测 207 不符——两处一并消失） |
| **A11** | `design/DOC-SYSTEM.md:327`（§11 行 8） | 「`thincoder-core/prompts/discipline-engineering.md` ｜ 264 ｜ +5 ｜ 按正本回写 ｜ 同上（**核树只读**）」 | 「`thincoder-core/prompts/discipline-engineering.md` ｜ **198（实测）** ｜ 见 R3 ｜ 两池判据句（coder 落笔） ｜ eng-coder」 |
| **A12** | `design/DOC-DISCIPLINE.md:15`（D1） | 「提示词 = 主 agent 内容权 + 落笔分述：中文设计文档（设计文档面）= eng-designer 笔 · 英文代码（代码面）= eng-coder 落笔」 | 「提示词 = **产品代码面** ⇒ 唯一作者 = **eng-coder**（内容依据 = 机制文档）；无第二支笔；「笔域越权」概念作废（2026-10-18 23:01 裁定）」 |
| **A13** | `design/CORE-UNIFICATION.md:485`（D-C14） | 「**D-C14** ｜ **中文设计档（裁定 B）**：**根仓 `docs/` 整层 = 基准层**…其中 `core/design/prompts/` = **提示词正本**（**唯一撰写面 / 内容基准** ✓）…**提示词权威链路**：改提示词内容 ⇒ **先改仓根正本** → 按正本**回写核内运行期落地档**…」 | **D-C14 整条退场**，原地留一句：「提示词唯一副本 = `thincoder-core/prompts/`；`docs/` 层不含提示词档（承 2026-10-18 取消镜像裁定）」 |
| **A13** | 同档**随动 17 处** | `:12`「**中文设计档（子系统 = 提示词系统）**：`thincoder-cli/docs/design/prompts/*.md` …各 15 档…**永进核** ✗」· `:31` B5 行「另有**中文设计档**（供人读・非运行期；**文档面——不进核**）各 15 档（`docs/design/prompts/`）」· `:40` B14 行「`docs/design/prompts/`（**中文设计档**…）两端各 15 档：**同 10 · 异 5**…」· `:45` B19 ②「② **中文设计档的落点**…**已裁（用户裁定 B）**…」· `:68` 树行「…· `core/design/prompts/`（提示词正本）· `batches/`」· `:69`「└── core/design/prompts/ ← **中文设计档**…」· `:80`「**运行期面 vs 文档面（硬）**…**中文设计档（`docs/core/design/prompts/**`）永进核** ✗…」· `:173`「…+ **中文设计档 15 对**（`docs/design/prompts/` 两端对位——B14）」· `:266`「**`文档面`** = **中文设计档专用值**…」· `:302`「…中文设计档行 = 两端 `docs/design/prompts/`）」· `:409`「…+ 中文设计档对（`docs/design/prompts/`）…」· `:417`「**中文设计档行（`docs/design/prompts/**`）唯一取值 = `文档面`**」· `:420`「**中文设计档不在建核面**（`docs/design/prompts/**`——归属段 = `文档面`…）」· `:516` 表行「**中文设计档（文档面 · 基准层正本）** ｜ 仓根 `docs/core/design/prompts/*.md` ｜ **16**…」· `:536`「…**两产品 `docs/design/prompts/**` 的删除**（用户裁定 B——…D-C14）」· `:585`「…**提示词内容基准 = 根仓 `docs/core/design/prompts/`（正本——唯一撰写面）**…」· `:586`「中文设计档（仓根 `docs/core/design/prompts/`）是**内容权威面、唯一撰写面**…」· `:953` T-C8 行「…+ 仓根 `docs/core/design/prompts/` 清点…**S3 收口**：…仓根中文设计档 16 在位…」 | `:12` 整行删 · `:31` 删「另有中文设计档…各 15 档（`docs/design/prompts/`）」⇒「提示词面 = 核内 `thincoder-core/prompts/`（16 档）」· `:40` 删「`docs/design/prompts/`（中文设计档…）两端各 15 档：同 10 · 异 5（…）」与「提示词面 40 档同路径对」中的镜像段 ⇒「提示词面读数 = 核内 16 档（唯一副本；镜像面退场，无对位读数）」· `:45` ② 改「② 提示词唯一副本 = `thincoder-core/prompts/`（`docs/` 下不含提示词档）——2026-10-18 取消镜像裁定」· `:68` 删「· `core/design/prompts/`（提示词正本）」· `:69` 整行删 · `:80` 改「**运行期面 = 唯一面**：`thincoder-core/prompts/`（16 档）+ `thincoder-core/tool-docs/`（**53 档**——枚举工具 52 ∥ 目录档 53；读数口径出处 = `PROMPT-SYSTEM.md:310`，同档 `:18` / `:20` / `:153` 同为 53 档读数）；`docs/` 下不建提示词档」· `:173` 删「+ 中文设计档 15 对（…）」· `:266` 删「**`文档面`** = 中文设计档专用值…」整段（取值三值：S0a / S1 / S2 / 不迁）· `:302` 删「；中文设计档行 = 两端 `docs/design/prompts/`」· `:409` 删「+ 中文设计档对（`docs/design/prompts/`）」· `:417` 删两处中文设计档分句 · `:420` 删尾句「**中文设计档不在建核面**（…）」· `:516` **整行删** · `:536` 改「**两产品 `docs/design/prompts/**` 的删除**（产品树旧档已归档 `_archive/`——保留为历史）」· `:585` 改「**提示词唯一副本 = 核内 `thincoder-core/prompts/`**（运行期加载面）；仓内零重复实现副本」· `:586` 整行删 · `:953` 改「…+ `docs/**` 下 `prompts/` 目录数 = 0 核」；**S3 收口**改「核内 16 + **53** 在位；`docs/**` 下 `prompts/` 目录不存在」 |
| **A14** | `design/ENGINEERING-MODE-V2.md:72`（M9 模块行） | 「M9 ｜ 提示词设计→实现流程 ｜ 中文设计文档 `docs/core/design/prompts/` → 英文代码 `thincoder-core/prompts/`（依设计文档精确翻译生成）+ 清理「方案选型对比」残留 ｜（`persona-eng-designer.md` 8 项「选型对比」· `discipline-engineering.md` A3⑤——随 M9 落地清理） ｜ 单向流程（只改中文设计文档 → 按它精确翻译生成英文代码），落点读声明面 ｜ §8.4」 | 「M9 ｜ 提示词单源承载 ｜ `thincoder-core/prompts/`（16 档，唯一副本，运行期加载面） ｜ 提示词 = 产品代码；无「设计 → 实现」两段流程 ｜ §8.4」（**保留 M9 编号**——删行会破 M1–M11 编号链与各处 `M9` 引用） |
| **A14** | 同档 `:278` | 「**提示词：中文 = 设计文档，英文 = 代码**（M9 落点，v2 §8.4）：「中文设计文档（`docs/core/design/prompts/`）= 人读的规格（用中文因读者是中文用户，与性质无关）；英文代码（`thincoder-core/prompts/`）= 机器执行物。更新流程 = 先改中文设计文档 → 英文由 coder 在编码时依它**精确翻译**生成；生成 = 精确翻译，不是 cp、不是照抄。无机检门（用户裁定）」。」 | 「**提示词 = 代码单源**（M9 落点，v2 §8.4）：「唯一副本 = `thincoder-core/prompts/`（运行期加载面）；规则的人读权威 = 中文机制文档。更新流程 = 改规则 → 先改机制文档 → coder 依它改 EN。无机检门（用户裁定）」。」 |
| **A14** | 同档 `:297` · `:299` · `:448` · `:478`（KD5） | `:297`「**设计 → 实现流程**：中文设计文档 → 英文代码（M9——依设计文档精确翻译生成，无机检门）——流程见设计层 `PROMPT-SYSTEM.md` §6.1。」· `:299`「**变更点（v2 对提示词系统的改动…）**：M9 设计→实现流程（§6.1 收正——中文设计文档 → 精确翻译 → 英文代码）· 纪律分流…」· `:448`「M9 → 文件 ｜ 读/写 ｜ 中文设计文档目录 → 英文代码目录（精确翻译生成）」· `:478`「KD5 ｜ 提示词 = 中文设计文档 + 英文代码（依设计文档精确翻译生成，无机检） ｜ 用户裁定：不设机检；一致性由收口核对兑底」 | `:297` 改「**提示词承载**：唯一副本 = `thincoder-core/prompts/`（产品代码面）；规则权威 = 机制文档——见设计层 `PROMPT-SYSTEM.md` §6.1。」· `:299` 删「M9 设计→实现流程（§6.1 收正——…）」一项（其余项保留）· `:448` **整行删**（无第二面可读/写）· `:478` 改「KD5 ｜ 提示词 = 代码单源（`thincoder-core/prompts/`）；规则的人读权威 = 中文机制文档 ｜ 用户裁定：不设机检；一致性由收口核对兜底」 |
| **A15** | `design/ARCHITECTURE.md:39` · `:60` | `:39`「├── core/{requirements,design}/ ← 统一面板块档 + design/prompts/（提示词中文正本 16 档）」· `:60`「├── prompts/ 槽位提示词运行期落地档（16 档——正本 = docs/core/design/prompts/）」 | `:39` 改「├── core/{requirements,design}/ ← 统一面板块档」· `:60` 改「├── prompts/ 槽位提示词唯一副本（16 档）」 |
| **A16** | `docs/README.md:3` · `:51` | `:3`「…**提示词正本** = `core/design/prompts/`）。」· `:51`「提示词系统（槽位 / 工具描述 / 中文设计档） ｜ `PROMPT-SYSTEM.md`」 | `:3` 改「…**提示词唯一副本** = `thincoder-core/prompts/`（代码面））。」· `:51` 改「提示词系统（槽位 / 工具描述） ｜ `PROMPT-SYSTEM.md`」 |
| **A17** | `docs/core/design/prompts/persona-eng-designer.md:6 / :14-15` ＋ EN `thincoder-core/prompts/persona-eng-designer.md` 同节 | CN「…**不碰英文代码提示词**（英文提示词 = 代码；中文设计文档 = 设计文档；**你的提示词笔域 = 中文设计文档**）」；EN「your prompt pen = the Chinese review face」 | **R4 不落笔（两处均非本席笔域）**：① CN 镜像 = 待删对象（R5 删，改它是白干）⇒ **零动作**；② EN = 产品代码 ⇒ **移交 eng-coder 单批**，改后句（设计给定，供 coder 落）：「your pen = the design/mechanism docs + batch record §2 only; you write no prompts（prompt = product code, eng-coder's pen; the "pen-domain overreach" notion is retired）」。**依据 = 判据 A.3 / A.4（冻结蓝图 §1，已裁）**，非本批新语义。 |
| **A18** | `design/prompts/discipline-engineering.md:189`（D1）∥ EN `:179` | CN「提示词 = 主 agent 内容权 + **落笔分述：中文设计文档 = eng-designer 笔 · 英文运行面 = eng-coder 落笔**」 | 同上处置：CN 零动作（R5 删）· EN 移交 coder，改后「prompts = product code ⇒ eng-coder's sole pen; no Chinese-design branch」。 |
| **A19** | `design/prompts/discipline-engineering.md:18` ∥ EN `:18`（变更面分流表「文档面」行） | 「prempts = main agent content authority + landing split by face」（原文含此拼写） | 同上处置：EN 移交 coder——「doc face」行删提示词括号，提示词移入「产品代码面」行。 |
| **A20** | `design/TWO-REPO-MERGE.md:80-90` · `:120` · `:136` | `:80`「## 4. 提示词承载（双源保留）」· `:82`「现状结构：各产品持 `src/prompts/`（运行期落地物）+ `docs/design/prompts/`（中文权威模板）；提示词**正本** = 基准层 `docs/core/design/prompts/`（16 档）。」· `:87`「产品内双源层 ｜ 产品 `docs/design/prompts/`（中文权威）↔ `src/prompts/`（运行期落地物） ｜ **保留**——产品内的权威↔落地关系与「仓」无关」· `:90`「**「单副本」在 phase 1 不可实现（机械约束，非偏好）**…」· `:120`「D14 ｜ 提示词**不做单副本合流**——产品内双源保留 ｜ 运行期硬加载 + 打包边界（§4）——机械约束」· `:136`「**同型守卫现行承担面**：产品内双源守卫由**单仓版断言**承担（本端同名集合相等 + 本端镜像节引用可解析）。」 | `:80` 改「## 4. 提示词承载（单源）」· `:82` 改「现状结构：唯一副本 = `thincoder-core/prompts/`（16 档，运行期加载面）；两产品 `docs/design/prompts/**` = 已归档的历史参照（`_archive/`）。」· `:87` 整行删（双源层无对象）· `:90` 保留（打包边界仍真——解释为何单副本必须住核包内）· `:120` 反转为「D14 ｜ 提示词 = **单副本**（`thincoder-core/prompts/`，运行期硬加载 ⇒ 副本须在包内） ｜ 承 2026-10-18 取消镜像裁定；打包边界见 §4」· `:136` **整句删**（双源守卫无对象） |
| **A21** | `design/DOC-SYSTEM.md:143`（P4 判据行 · W 类） | 「**P4** ｜ **运行期 vs 文档面**：提示词**正本**（中文设计档）= 文档面（随 core）；核内运行期落地档（`thincoder-core/prompts/**` · `thincoder-core/tool-docs/**`）= **产品代码**，不入 `docs/` ｜ 二者档名集合相等且各 16 / 52 档（`PROMPT-SYSTEM.md` §2 组陈述）」 | 「**P4** ｜ **提示词 = 产品代码**：唯一副本 = `thincoder-core/prompts/**`（运行期加载面）+ `thincoder-core/tool-docs/**`；`docs/` 下不含提示词档 ｜ 机检：`docs/**` 下 `prompts/` 目录数 = 0 ∧ 提示词档集合 = `thincoder-core/prompts/*.md` 16 档（`PROMPT-SYSTEM.md` 单面陈述）」——**「16 / 52 档相等」这一机检落点整句删除**（第二个对象已不存在） |
| **A22** | `design/DOC-SYSTEM.md:79`（§4 目标树子行） | 「│   │   └── design/prompts/                 ← 提示词**中文设计档正本**（16 档）」 | **整行删**（§4 树 `core/design/` 下不再有 `prompts/` 子行） |

### 2.4 W 类逐处点名（**判面二**——句内无 `docs/core/design/prompts` 完整字面，`grep` 与判面一均抓不到）

| # | 处（今天坐标） | 现文（逐字摘录） | 改后 | 归属 |
|---|---|---|---|---|
| W1 | `design/DOC-SYSTEM.md:143` | 「提示词**正本**（中文设计档）= 文档面（随 core）…二者档名集合**相等**且各 **16 / 52 档**」 | 见 **A21**（整行替换；「相等」机检落点删） | 机制档（本席笔） |
| W2 | `design/DOC-SYSTEM.md:79` | 「└── design/prompts/ ← 提示词**中文设计档正本**（16 档）」 | 见 **A22**（整行删） | 机制档 |
| W3 | `design/DOC-SYSTEM.md:174` | N-d「提示词正本 = `docs/core/design/prompts/<槽名>.md`；运行期落地档 = …**两者不同域**」 | 见 **A10**（该行含完整字面，判面一亦抓得到；列此以保勾稽完整） | 机制档 |
| W4 | `design/DOC-SYSTEM.md:355` | 「现有 16+16 板块档与**提示词正本**去向逐项给出（§4 表）」——**无路径字面** | 见 **A11** `:355` 行 | 机制档 |
| W5 | `design/DOC-SYSTEM.md:152` · `:154` | `:152`「（**不含** `design/prompts/` 15 档 · `design/_archive/` 50 档 · 批次档 41 档）」· `:154`「实核 = **84**（含 `design/prompts/` 则 99；含 `_archive/` 则 149）」——**裸 `design/prompts/`，判面一抓不到，R5 的 grep 判据会命中** | `:152` 改「（**不含** `_archive/` 下的提示词档 15 档 · `design/_archive/` 50 档 · 批次档 41 档）」；`:154` 改「实核 = **84**（含 `_archive/` 下的提示词档则 99；含 `_archive/` 则 149）」——**不写连续子串 `design/prompts`**（R5 判据 ① 是文本串匹配，补 `_archive/` 前缀照样命中）——**指回已归档位**（`DOC-MIGRATION.md:270` 实测 CLI 提示词 15 档已入 `_archive/` 下同名目录） | 机制档 |
| W6 | `design/CORE-UNIFICATION.md` 17 处 | 见 A13 随动行（多为裸 `docs/design/prompts/` ∥ `core/design/prompts/`） | 见 A13 随动逐个改后 | 机制档 |
| W7 | `design/ARCHITECTURE.md:39` | 「…+ design/prompts/（提示词中文正本 16 档）」——裸路径 | 见 A15 | 机制档 |
| W8 | `design/DOC-MIGRATION.md:6` · `264` · `270` · `333` · `367` | 裸 `design/prompts/`（基数口径 / 归档去向表行 / 建归档根目录 / 边界行） | **保留原义、换成不携带子串的指法**：凡指 CLI / VSC 树者写「`_archive/` 下的提示词档」（**不写连续子串 `design/prompts`**——R5 判据 ① 是文本串匹配，补前缀照样命中）（`:6` 例外——该行是「底本不含设计提示词档」的口径句，改为「不含 `_archive/` 下的提示词档 · `design/_archive/`」）；`:484` 属 M 类改指（→ §2.5 移交 R5） | 机制档 |
| W9 | `design/TWO-REPO-MERGE.md:82` · `:87` | 裸 `docs/design/prompts/` | 见 A20 | 机制档 |
| W10 | `docs/README.md:3` | 「**提示词正本** = `core/design/prompts/`」——**相对形**，判面一抓不到 | 见 A16 `:3` | 机制档（地图） |
| W11 | `design/PROMPT-SYSTEM.md:15` · `:43` · `:153` · `:190` · `:206` | `:15`/`:43` 裸 `docs/design/prompts/*.md`；`:153`/`:206`「中文设计档」「中文正本 = `docs/core/design/prompts/*.md`」 | 见 A8 / A6 / §2.5 B 组 `:190` · `:206` | 机制档 |
| W12 | `design/DOC-DISCIPLINE.md:15` | D1「中文设计文档（设计文档面）= eng-designer 笔」——**无路径** | 见 **A12** | 机制档 |
| W13 | `requirements/DOC-SYSTEM.md:23` · `:27` | `:23`「现有 16+16 板块档与**提示词正本**的**去向**」· `:27`「既有四条裁定（基准层 / 参照历史 / **提示词正本** / 逐档随批迁）」——无路径 | `:23` 改「现有 16+16 板块档的去向；提示词面无文档面档（单副本 = `thincoder-core/prompts/`）」· `:27` 改「既有四条裁定（基准层 / 参照历史 / **提示词单副本** / 逐档随批迁）」 | **需求档 · 主 agent 笔** |
| W14 | `requirements/ADVISOR-CONVERGENCE.md:75`（N5） | 「新文本**四面同文**：CLI / VSC ×（运行期落地 + 中文正本）…」——无路径 | 改「新文本**两面同文**：`thincoder-core/prompts/` 一处 + 机制档对应节；无第二份可对」，机判句改「同一字面串在两处（EN 档 + 机制档节）在位」 | 需求档 · 主 agent 笔 |
| W15 | `requirements/TESTING.md:155`（F15） | 「散文锚 = §5.1 三条同时成立的断言；**一律不做**——含**提示词镜像锚**（用户对「保留双端镜像锚」的建议明确否决…）」——无路径 | 改「…**一律不做**——含提示词镜像锚（用户对「保留双端镜像锚」的建议明确否决；镜像面已退场，本条为通用禁令，无对象可附）」 | 需求档 · 主 agent 笔 |

**判面二勾稽结论（2026-10-19 收正）**：判面二的清单 = **A1–A22（22 处）+ W1–W15（15 组）+ §2.5 B 组（24 档 29 行）+ §2.10.2 新补（机制档 109 处 + 需求档 26 处）**。**判据 = 语义 token 族全量扫**（token 族与逐档命中表见 §2.10.1），不是「`design/prompts` 字面命中」——原「已全覆盖」表述作废：它只覆盖字面命中面，`PROMPT-SYSTEM.md:171-173` 一族因此漏掉。

### 2.5 B 组 · 落点族（机制档 24 档 + 今天新增 2 处）

**统一改写式（定四形，逐处只点「用哪一形」）**：

- **F1 落点式**：「**落点（中文设计文档 + 英文代码）**」⇒「**落点（提示词 = 代码单源）**」；同句内「中文正本 `docs/core/design/prompts/X`」⇒「EN `thincoder-core/prompts/X`」；「CN 面 = `docs/core/design/prompts/` ∥」分句删。
- **F2 正本句**：「中文正本 = `docs/core/design/prompts/*.md`（16 档）」⇒「唯一副本 = `thincoder-core/prompts/*.md`（16 档）」。
- **F3 双份句**：「两份」「CN ∥ EN」「按 M9 精确翻译回写」「CN = 内容权威」⇒ 整句删（无第二份）。
- **F4 登记行**：纯「CN 侧某档某行 = X 行」的复核 / 差异 / 行数登记行 ⇒ **整行删**（对象随 R5 消失）。

| 档 | 今天命中行 | 逐处处置（改后） |
|---|---|---|
| `design/PROMPT-SYSTEM.md` | 190 · 206 · 222 · 246 · 261 · 276 · 297 · 298 · 352 · 372 · 390 · 404 · 405 · 428 · 450 · 471 · 494 · 495 · 520 · 539 · 560 · 622 · 625 · 649 · 760 · 764 · 781 · 807 · 833 | `:190`「CN 正本「并行委派与多任务」`docs/core/design/prompts/persona-engineering.md:182` 起」⇒ **F2**（删 CN 侧行号）· `:206` **F2** · `:222`「域 = …+ `docs/core/design/prompts/**`（两面 + 工具描述）」⇒ 删该元素（域 = 提示词面 + 工具描述）· `:246`「自止点：中文正本 … + 英文代码 …」⇒「自止点：`thincoder-core/prompts/common.md`」· `:261` **F1** · `:276` **F1** · `:297-298`「落点（四档——中文设计文档 ∥ 英文代码，两模式各一对）」⇒「落点（四档——EN 两模式各一对）」+ 删两处 CN 路径与行号 · `:352` **F1**（「CN `docs/core/design/prompts/common.md` ∥ EN …」⇒「EN `…`」）· `:372` **F1** · `:390` **F1** · `:404-405` **F1**（同族条 CN 半删）· `:428`「EN 面 = … ∥ CN 面 = …（下同）」⇒「EN 面 = `thincoder-core/prompts/`（下同）」· `:450` **F1** + 删「EN 按 M9 精确翻译回写（非 cp）」⇒ **F3** · `:471` **F1** + 删「EN 按 M9…」· `:494-495` **F1**（三处 CN 路径 + CN 行号删）· `:520` **F1** · `:539`「CN 正本 `…common.md:154-155` ∥ EN 代码 `…:203-204`（同节位）…；CN = 恰-字（内容权威）∥ EN = M9 翻译」⇒「EN `thincoder-core/prompts/common.md`（§16 档末）」+ **F3** 删比较句 · `:560` **F1** · `:622` **F1** · `:625`「**现态**：两档已落（CN … ∥ EN …；逐行比对 11/11 全等）」⇒「**现态**：已落 `thincoder-core/prompts/common.md`」· `:649` **F1**（四处 × 2 ⇒ 四处）· `:760` · `:764` · `:781` · `:807` **F1**（`:807`「CN 正本 = …三档四处…设计轮直落（§6.1 面分述默认）」⇒「EN 三档四处——设计先行、coder 落笔」）· `:833`「边界：本纪律只管 `thincoder-core/prompts/**`；`tool-docs/**` 与中文设计档（`docs/core/design/prompts/`）不在规则内」⇒「边界：本纪律只管 `thincoder-core/prompts/**`；`tool-docs/**` 不在规则内（`docs/` 下已无提示词档）」 |
| `design/ADVISOR-CONVERGENCE.md` | 162 · 176 · 178 · 179 · 197 · 199 · 201 · 210 · 220 · 221 · 222 · 223 · 233 · 342 · 381 · 401 · 402 · 409 · 419 | **F1 / F4 逐处**：`:162`「四处提示词末句（运行期 + 中文正本）…`docs/core/design/prompts/discipline-normal.md` §评审纪律…」⇒「两处提示词末句（EN 运行面）…」+ 删全部 CN 坐标 · `:176`「**两份同文（N5）**…+ 中文正本 `…` 同节同位」⇒ 删「两份同文」与 CN 半句 · `:178`/`:179` 删 CN 半句（两处）· `:197`/`:199`/`:201` 删「中文正本 `…` 同节（…）」括号（K 类：EN 指针保留）· `:210` 命令 1「grep … `thincoder-core/prompts docs/core/design/prompts`」⇒ 删第二目录 · `:220`–`:223` 表「P3–P6」删 CN 坐标列项（P3/P4 两行整行删——纯 CN 落点登记 ⇒ **F4**）· `:233` 删「· `docs/core/design/prompts/advisor-design.md:21`」· `:342` 删 CN 半句 · `:381`「纪律 = `docs/core/design/prompts/discipline-engineering.md` §测试纪律」⇒ 改指 `requirements/TESTING.md` §2（M 类，改指机制档）· `:401`/`:402`/`:409`/`:419`「落点 = `docs/core/design/prompts/advisor-design.md` §N ∥ `thincoder-core/prompts/advisor-design.md` 同节同位；**已落笔**（双侧在盘）」⇒ 删 CN 半 + 「双侧」⇒「（EN 在盘）」 |
| `design/AGENT-LOOP-UPSTREAM.md` | 216 · 217 · 265 · 284 · 653 · 667 · 1227 · 1243 · 1259 · 1261 | `:216`/`:217` 表行（纯 CN 档 + 行数）⇒ **F4** 整行删 · `:265`「**② `docs/core/design/prompts/common.md`（中文设计文档）**——同段中文…」⇒ 整句删（无中文面）· `:284`「（`…discipline-engineering.md` + `docs/core/design/prompts/discipline-engineering.md`）」⇒ 保留 EN 单侧 · `:653`「口面零行：`git diff --stat -- thincoder-core/prompts docs/core/design/prompts`」⇒ 删第二目录 · `:667`「提示词面 `thincoder-core/prompts/common.md` + 模板 `docs/core/design/prompts/common.md`（父侧笔）」⇒ 删模板半句 · `:1227`「**③ 接收侧 · CN 权威面**——`docs/core/design/prompts/common.md`（…）」⇒ 整段删 · `:1243`「**⑤ 报告惯例 · CN 权威面**——`…subagent-base.md`」⇒ 整段删 · `:1259`/`:1261` 表行（CN 档行数）⇒ **F4** 删（两行） |
| `design/AGENT-LOOP.md` | **今天零命中** | 蓝图 `:334` 已无字面 ⇒ **本档零动作**（漂移登记，不改） |
| `design/AGENT-LOOP-ASYNC-POOL.md` | 195 | 「提示词正本 = `docs/core/design/prompts/advisor-*.md`」⇒「提示词面 = `thincoder-core/prompts/advisor-*.md`（唯一副本）」 |
| `design/BATCH-RECORD.md` | 571 | 「两端各自 `docs/core/design/prompts/` 中文权威镜像，与英文产品源**同名集合相等**」⇒ 整行删（「双源断言」块无对象） |
| `design/DOC-MIGRATION.md` | 6 · 97 · 264 · 270 · 333 · 336 · 367 · 376 · 484 | `:6`/`:264`/`:270`/`:333`/`:367` 见 W8（补 `_archive/` 前缀）· `:97`「（…提示词正本已归 `docs/core/design/prompts/`）」⇒ 删该括注 · `:336`（测试处置：镜像路径字面 / 扫描根）⇒ **不改**（历史动作记录，产品树 `_archive/` 内，R5 排除集）· `:376`「不碰提示词面（`docs/core/design/prompts/**` 与两产品镜像均为对象外）」⇒ 改「不碰提示词面（`thincoder-core/prompts/**` 为对象外）」· `:484`「**落点**：正本 `docs/core/design/prompts/discipline-engineering.md`…落地镜像 `thincoder-core/prompts/…`」⇒「落点：`thincoder-core/prompts/discipline-engineering.md`（唯一副本；对应机制档 = `DOC-DISCIPLINE.md`「按域分界」节）」 |
| `design/ANCHOR-DEBT-REPAIR.md` | 146 · 157 · 158 · 230 · 309 · 311 | `:146`/`:157`/`:158` 表行（CN 档行数 / 锚数）⇒ **F4** 删三行 · `:230`「行宽判据射程 ｜ 提示词副本 `docs/core/design/prompts/**` 在扫描域内；落地副本 `thincoder-core/prompts/**` 不在」⇒ 改「行宽判据射程 ｜ `thincoder-core/prompts/**`（唯一副本）不在扫描域内（行宽只扫 `docs/`）」· `:309`/`:311`（另轮提示词面两行行宽 + 写域口径）⇒ **整行 / 整段删**（对象随 R5 消失） |
| `design/DESIGN-TOKEN-SETTLEMENT.md` | 171 · 203 · 234 | `:171`/`:203`/`:234`「中文评审面 `docs/core/design/prompts/persona-engineering.md` …」⇒ **F4 + 改指**：该三处的对象是「在飞令牌取回」句的落点——改指「EN `thincoder-core/prompts/persona-engineering.md`（对应句）」；行数列（222）随删 |
| `design/ENG-TOKEN-BINDING.md` | 98 · 117 | `:98`「（CN——`docs/core/design/prompts/advisor-design.md:55` 句内加固）」⇒ 改「（EN——`thincoder-core/prompts/advisor-design.md`）」· `:117`「EN 运行期 `…:20-22` ∥ CN 模板 `docs/core/design/prompts/advisor-design.md:51-53`（同文口径）」⇒ 删 CN 半句与「同文口径」 |
| `design/LEDGER.md` | 421 · 424 | `:421`「既有开局自查是**提示词纪律**（`docs/core/design/prompts/persona-engineering.md:87`）+ 收口扫账（同档 `:88`）」⇒「（`thincoder-core/prompts/persona-engineering.md` 对应节）」· `:424` 勘察证据行同法（删 CN 坐标，改指 EN 同名档） |
| `design/LEDGER-SELF-CONTAINED.md` | **今天零命中** | 蓝图 `:189` 已无字面 ⇒ **零动作**（漂移登记） |
| `design/LIGHT-CHANNEL.md` | 150 · 151 · 162 · 166 · 167 | `:150`「`docs/core/design/prompts/discipline-engineering.md`（CN 正本）｜「基本流程」节内…」⇒ 删「（CN 正本）」并把档指改为「`thincoder-core/prompts/discipline-engineering.md`（EN）」· `:151` 同法 · `:162`/`:166`/`:167` 三处「（`docs/core/design/prompts/persona-engineering.md` §… ·「X」条）」⇒ 删括注（保留条名）——该三处的裁定对象是**条款名**，非档位 |
| `design/MANIFEST.md` | 176 · 567 · 634 · 649 · 689 | `:176` 表行「`docs/core/design/prompts/persona-engineering.md` ｜ 165 ｜ 修改…」⇒ **F4** 删行 · `:567`「英文代码落地副本 `thincoder-core/prompts/persona-engineering.md` 同义落地」⇒ 保留单侧（删「落地副本」措辞，改为「唯一副本」）· `:634`「（同义）」⇒ 删 CN 半 · `:649`「（`docs/core/design/prompts/common.md:48`——提示词面禁带文档引用…）」⇒ 改指 EN `common.md` · `:689` 表行（CN 档 + eng-designer 笔）⇒ **F4** 删行（笔域随之作废） |
| `design/PORTABILITY.md` | **今天零命中** | 蓝图 `:230` 已无字面 ⇒ **零动作** |
| `design/STRUCTURE-DEBT.md` | 39 | 「铁律②（`docs/core/design/prompts/discipline-engineering.md`「铁律」节）」⇒ 改指机制档「（`DOC-DISCIPLINE.md` 铁律判据节 / `ENGINEERING-MODE-V2.md` 铁律②）」——**改指而非改 EN**（该处是「规则详述处」） |
| `design/TESTING.md` | 11 | 「工程模式实现侧正文 = `thincoder-core/prompts/discipline-engineering.md`（测试纪律节）· `persona-engineering.md`（派单验收行）——CN 正本 = `docs/core/design/prompts/` 同名两档」⇒ 删尾句「CN 正本 = …」 |
| `design/TOOLS.md` | 692 · 703 | `:692`「正本同句 = `docs/core/design/prompts/…` 同节同位 · `persona-engineering.md:67`」⇒ 删 CN 半句 · `:703`「双副本链路承 D-C14（先改 `docs/core/design/prompts/` 正本 → 回写 `thincoder-core/prompts/` 运行期落地档）…（提示词 = 主 agent 内容权）」⇒「提示词 = 产品代码（`thincoder-core/prompts/`，eng-coder 笔）」 |
| `design/VERIFY-REDESIGN.md` | 67 | 「提示词正本 = `docs/core/design/prompts/**`（本档只留机制边界，D2）」⇒「提示词 = `thincoder-core/prompts/**`（唯一副本；测试纪律机制 = `requirements/TESTING.md` §2，D2）」 |
| `design/BASH-EXECUTOR-FACE.md` | 149 | 「需求档/提示词正本面（`docs/core/design/prompts/**`——注入值本身除外）」⇒「需求档面（`docs/core/requirements/**`；提示词 = `thincoder-core/prompts/**`，注入值本身除外）」 |
| `design/ADVISOR-GUARDS.md` | **今天零命中** | 蓝图 `:185` 已无字面 ⇒ **零动作** |
| `design/DOC-CODE-RECONCILE.md` | 218 | 「中文设计档正本 = `docs/core/design/prompts/discipline-engineering.md` §文档与台账自持…节（各实现面原文自持）」⇒「规则详述 = `DOC-DISCIPLINE.md`「自持」节；提示词面 = `thincoder-core/prompts/discipline-engineering.md`」 |
| `design/DOC-DISCIPLINE.md` | 36 · 68 · 74 · 228 · 229 · 266 · 681 · 1559 · 1897 | `:36`「**提示词面同步**：D8 行已同步——`docs/core/design/prompts/discipline-engineering.md` 两档清单补 D8 行」⇒ 删「两档」与 CN 路径（改「`thincoder-core/prompts/discipline-engineering.md` 清单补 D8 行」）· `:68`「正 = 公共层「工作结构常识」节 why 段（…——`docs/core/design/prompts/common.md`）」⇒ 改指 EN `common.md` · `:74`「`docs/core/design/prompts/common.md` **两份** +1 枚（CN `:42` 邻位 ∥ EN `:47` 邻位）…两档 D 清单 +1 行」⇒ 删「两份」与 CN 半句 · `:228`/`:229`（零改核验项：CN 档 + `advisor-design.md:21`）⇒ **整段删**（核验对象随 R5 消失；同内容不住提示词）· `:266`（不处置面：「`docs/core/design/prompts/**` 与 `thincoder-core/prompts/**`（英文提示词 = 代码，零改）」）⇒ 删 CN 半（改「`thincoder-core/prompts/**`（提示词 = 代码，零改）」）· `:681`「规范单源 = 需求层 … + 提示词 `docs/core/design/prompts/discipline-engineering.md` 第 6 条」⇒ 删该半句 · `:1559`「**不动**：… `docs/core/design/prompts/**`（英文提示词 = 代码面）」⇒ 删 CN 半 · `:1897` DD-32 行（提示词面核验两档）⇒ **整行删**（核验对象消失） |
| `cli/design/ACP-CLIENT.md` | 132 | 按 F1（该行以 EN 指针为主，删 CN 半句）——**该档属 cli 部分，笔域同为本席**（设计面） |
| **今天新增（蓝图未列）** `docs/TODO.md:19` | 19 | 「`src/prompts/` 与 `docs/design/prompts/` **60 档原文不外发**」⇒ 改「提示词档原文不外发（唯一副本 = `thincoder-core/prompts/`）」——**该行属退役历史 md 面**（`README.md:14`：`TODO*.md` = 退役历史、已排除在锚检查之外）⇒ **处置已定 = 改该行**（不改会命中 R5 判据 ①；改它不动语义） |
| **今天新增** `docs/TODO-archive.md:260` | 260 | 归档台账（**记录面**，`DOC-DISCIPLINE.md:34` 明列归档台账不属失效表达、不得删）⇒ **零动作**（记录面，R5 排除集外但语义上不改） |

### 2.6 需求档（**12 档 + 今天新增 1 档**——只列坐标与改后要点；笔 = 主 agent）

| 档 | 今天命中行 | 现文（逐字摘录） | 改后要点 |
|---|---|---|---|
| `requirements/PROMPT-SYSTEM.md` | 11 · 50 · 94 · 158 · 182 · 242 | `:11`「…**中文设计档永进核**（供人读、非运行期，文档面）」· `:50`「① **双面人格档**（`persona-engineering.md` 中文正本 + 英文运行面）…」· `:94`「…+ `docs/core/design/prompts/common.md`（中文正本）」· `:158`「正本 = `docs/core/design/prompts/persona-engineering.md` §…」· `:182`「**提示词 = 中文设计文档 ∥ 英文代码**：设计面 = …（`docs/core/design/prompts/`）∥ 运行期提示词（`thincoder-core/prompts/*.md`）= **英文代码**…变更流：改中文设计文档 → **依它精确翻译**生成英文代码…无机检门」· `:242`「**中文设计档不进核内构建面**：两产品 `docs/design/prompts/**` = 迁移期参照历史…F9「无残留双份」覆盖范围限实现面 + 提示词落地档」 | `:11` 删「中文设计档永进核…」⇒「；`docs/` 下不含提示词档」· `:50` **F3**（「双面」⇒ 单面：EN 运行面）· `:94` 删 CN 半 · `:158` 改指 EN 同名档 · `:182` 整条改「**提示词 = 代码单源**：唯一副本 = `thincoder-core/prompts/*.md`（运行期加载面）；规则权威 = 中文机制文档；变更路子 = 改规则 → 先改机制文档 → coder 改 EN；无机检门」（英文为何英文的用户原话句**保留**——那讲的是读者面，不是双份制）· `:242` 改「**`docs/` 下不含提示词档**；F9「无残留双份」覆盖 = 实现面 + 提示词运行面（单副本）」 |
| 同档·蓝图坐标失效 | 蓝图列 4 · 46 · 51 · 54 · 61 · 93 · 99 · 105 · 112 · 124 · 133 · 172 · 175 · 177 | 今天这些行**无路径字面、亦无双份制陈述**（实读） | **零动作**（漂移登记；若主 agent 落笔时命中，按同形处置） |
| `requirements/ENGINEERING-MODE-V2.md` | 356 · 446 · 602 | `:356`「不改提示词文件（**运行期面**——`thincoder-core/prompts/**`；主 agent 内容权）；**中文设计档面例外**（`docs/core/design/prompts/**` = 文档面 / 非运行期 ⇒ 其笔归设计轮）」· `:446`「**中文提示词 = 设计文档**（`docs/core/design/prompts/`）——人读的规格…」· `:602` D1「提示词 = 主 agent 内容权 + eng-coder 落笔（**运行期面**——中文设计档面 `docs/core/design/prompts/**` 归**设计档行** = eng-designer 笔）」 | `:356` 改「不改提示词文件（`thincoder-core/prompts/**` = 产品代码 ⇒ eng-coder 笔；父侧改提示词 = 走 coder）」· `:446` **整条删**（或改「提示词 = 代码单源；人读权威 = 中文机制文档」）· `:602` 改「提示词 = **产品代码面** ⇒ 唯一作者 = eng-coder（内容依据 = 机制文档）；无中文设计档一支」（三条父侧直笔例外句**保留**） |
| `requirements/ENGINEERING-MODE-V2-SPEC-PROMPT-PIPELINE.md` | 7 · 11（**全档即该流程**，35 行） | `:7`「提示词两份，关系 = **设计 → 实现**：**中文提示词 = 设计文档**（`docs/core/design/prompts/`…）；**英文提示词 = 代码**…提示词修改**先落中文设计文档**，英文版本由 coder…生成 = **精确翻译**…**不是 cp、不是照抄**。」· `:11`「**更新流程**：先改模板（`docRoot.design` + `/prompts`…= `docs/core/design/prompts/`）→ 再翻译生成落地（`promptsLanding`…）」 | **建议整档退场**（该档 = 该流程的完整规格，流程已退场 ⇒ 无对象；退场 = 删档，引用面同轮改指）。若主 agent 判保留：`:7`/`:11` 按 A1/A2 同形改写 |
| `requirements/METHODOLOGY.md` | 5 · 15 · 17 · 18 · 19 · 30 · 41 · 42 · 43 · 54 · 75 · 89 · 90 · 104 · 105 | `:5`/`:15`/`:18`/`:19`/`:54`/`:104`/`:105` 各处「**方法论的设计落地 = 提示词正本本身**（`docs/core/design/prompts/**`…）」「正本 = 基准…（中文正本 = `docs/core/design/prompts/` ∥ 运行期落地 = `thincoder-core/prompts/`——无同步脚本、不做 byte-identical 硬一致）」· `:17`/`:30`/`:41`/`:42`/`:43`/`:75`/`:89`/`:90` 各处「细则载体 = `docs/core/design/prompts/*.md:行`」 | `:5`/`:15`/`:104`/`:105` 改「方法论的设计落地 = 提示词（`thincoder-core/prompts/`，唯一副本）+ 机制档承载」· `:18`/`:19` **F3** 删「正本 = 基准 / 并行两面」句（保留「不做 byte-identical 硬一致」事实）· `:17`/`:30`/`:41`/`:42`/`:43`/`:75`/`:89`/`:90` 七处载体坐标 ⇒ 改指 EN 同名档（行号删）或改指机制档（该规则的详述处） |
| `requirements/CORE-UNIFICATION.md` | 73 · 79 · 103 · 161 | `:73` 表行「`docs/design/prompts/`（中文设计档——…）｜15｜**10**｜**5**｜…」· `:79`「3. **中文设计档（旧称「中文权威镜像」）的分叉集合…**」· `:103` F9「…**不含**两产品 `docs/design/prompts/` 的中文设计档…」· `:161`「…回填（中文设计档 / 分叉读数）｜52」 | `:73` **整行删**（分叉读数为产品树历史读数）· `:79` **整条删**（镜像分叉裁决无对象）· `:103` 删「不含…中文设计档」尾句（整句改为「覆盖范围 = 实现面 + 提示词运行面」）· `:161` 删「（中文设计档 / 分叉读数）」 |
| `requirements/PHILOSOPHY.md` | 149 | 「**设计 → 实现关系**：中文**设计文档** = `docs/core/design/prompts/**`（人读规格）；实现物 = `thincoder-core/prompts/**`（机器执行物，依中文**精确翻译**生成）…三层可逐级核对：**哲学 → 纪律层 → 提示词**」 | 改「**提示词 = 代码单源**：`thincoder-core/prompts/**`（运行期加载面）；规则的人读权威 = 中文机制文档。三层可逐级核对：**哲学 → 纪律层 → 提示词**」 |
| `requirements/LIGHT-CHANNEL.md` | 89 | 「提示词层：工程模式纪律（`docs/core/design/prompts/discipline-engineering.md`）∥ 主 agent 角色面——落法设计定形」 | 改指 EN 同名档（`thincoder-core/prompts/discipline-engineering.md`）；「落法设计定形」保留 |
| `requirements/NORMAL-MODE.md` | 33 · 120 | `:33` N-NM2「正本 ↔ 落地档对位 ｜ 运行期落地档 `thincoder-core/prompts/`（16 档）↔ 中文设计档正本 `docs/core/design/prompts/`（16 档）逐档对位（P4）」· `:120`「（运行期 `thincoder-core/prompts/` · 正本 `docs/core/design/prompts/`——零额外 LLM…）」 | `:33` 改「**提示词单副本** ｜ `thincoder-core/prompts/`（16 档，唯一副本；`docs/` 下无提示词档）；各实现面语义同源、原文自持」· `:120` 删「· 正本 `docs/core/design/prompts/`」 |
| `requirements/ADVISOR-CONVERGENCE.md` | 75（N5） | 见 **W14** | 见 W14 |
| `requirements/DOC-SYSTEM.md` | 23 · 27 | 见 **W13** | 见 W13 |
| `requirements/TESTING.md` | 155（F15） | 见 **W15** | 见 W15 |
| `requirements/TWO-REPO-MERGE.md` | 26 | F4「…**收窄注记**：本行「提示词双副本」按设计档收窄为**其跨仓机制层**退役——产品内「权威模板（`docs/core/design/prompts/`）↔ 运行期落地物（产品 `src/prompts/`）」双源**保留**」 | 改「…本行「提示词双副本」整条退役——提示词 = 单副本 `thincoder-core/prompts/`（承 2026-10-18 取消镜像裁定）；产品 `src/prompts/` 与两产品 `docs/design/prompts/` 均已退役 / 归档」 |
| **今天新增（蓝图未列）** `requirements/STRUCTURE-DEBT.md` | 17 | 「…适用条件与硬约束以设计侧 `docs/core/design/prompts/discipline-engineering.md`（§变更面分流 ∥「铁律」节）为准，**本档不重述（D2）**」 | 改指机制档：`design/DOC-DISCIPLINE.md` / `design/ENGINEERING-MODE-V2.md` 对应节（提示词不再是规则详述处） |

**需求档勾稽结论**：今天实测命中 = **13 档**（蓝图列 12 档，`requirements/STRUCTURE-DEBT.md` 为新增）；蓝图在 `requirements/PROMPT-SYSTEM.md` 列出的 14 个坐标今天已无对应陈述（零动作，已在表内登记）。

### 2.7 受影响文件表（按笔域分组；行数 = 今天实测）

**A · 机制文档（eng-designer 笔）**

| 档 | 现行行数 | 处数 | 预计 Δ |
|---|---|---|---|
| `core/design/PROMPT-SYSTEM.md` | 958 | 9 组（A1–A8 + B 组 29 行） | **约 −75**（删 §2.2 十行表 / §8.1-8.2 两节 / 多条 CN 半句） |
| `core/design/DOC-SYSTEM.md` | 392 | 10 处（A9–A11 七处 + A21 + A22 + W5 两行） | 约 −8 |
| `core/design/CORE-UNIFICATION.md` | 1006 | 18 处（A13 + 随动 17） | 约 −22 |
| `core/design/DOC-DISCIPLINE.md` | 1965 | 10 处（A12 + B 组 9 行） | 约 −12 |
| `core/design/ENGINEERING-MODE-V2.md` | 526 | 6 处（A14） | 约 −3 |
| `core/design/TWO-REPO-MERGE.md` | 156 | 5 处（A20 + W9） | 约 −4 |
| `core/design/ARCHITECTURE.md` | 199 | 2 处（A15） | ±0 |
| `docs/README.md`（地图） | 107 | 2 处（A16） | ±0 |
| `core/design/ADVISOR-CONVERGENCE.md` | 424 | 19 行 | 约 −18 |
| `core/design/AGENT-LOOP-UPSTREAM.md` | 1320 | 10 行 | 约 −20 |
| `core/design/DOC-MIGRATION.md` | 747 | 9 行 | 约 −4 |
| `core/design/ANCHOR-DEBT-REPAIR.md` | 371 | 6 行 | 约 −12 |
| `core/design/DESIGN-TOKEN-SETTLEMENT.md` | 266 | 3 行 | 约 −3 |
| `core/design/ENG-TOKEN-BINDING.md` | 210 | 2 行 | 约 −1 |
| `core/design/LEDGER.md` | 898 | 2 行 | ±0 |
| `core/design/LIGHT-CHANNEL.md` | 219 | 5 行 | 约 −3 |
| `core/design/MANIFEST.md` | 868 | 5 行 | 约 −6 |
| `core/design/STRUCTURE-DEBT.md` | 42 | 1 行 | ±0 |
| `core/design/TESTING.md` | 621 | 1 行 | ±0 |
| `core/design/TOOLS.md` | 1553 | 2 行 | 约 −2 |
| `core/design/VERIFY-REDESIGN.md` | 107 | 1 行 | ±0 |
| `core/design/BASH-EXECUTOR-FACE.md` | 156 | 1 行 | ±0 |
| `core/design/DOC-CODE-RECONCILE.md` | 235 | 1 行 | ±0 |
| `core/design/AGENT-LOOP-ASYNC-POOL.md` | 1155 | 1 行 | ±0 |
| `core/design/BATCH-RECORD.md` | 636 | 1 行 | −1 |
| `cli/design/ACP-CLIENT.md` | 627 | 1 行 | ±0 |
| `docs/TODO.md`（退役 md 面） | 58 | 1 行（`:19`，**处置已定 = 改该行**；改后逐字见 §2.5 表末行） | ±0 |

**B · 需求档（主 agent 笔）**：`PROMPT-SYSTEM.md`(276) · `ENGINEERING-MODE-V2.md`(765) · `ENGINEERING-MODE-V2-SPEC-PROMPT-PIPELINE.md`(35，建议整档退场) · `METHODOLOGY.md`(108) · `CORE-UNIFICATION.md`(177) · `PHILOSOPHY.md`(180) · `LIGHT-CHANNEL.md`(92) · `NORMAL-MODE.md`(135) · `ADVISOR-CONVERGENCE.md` · `DOC-SYSTEM.md` · `TESTING.md` · `TWO-REPO-MERGE.md`(51) · `STRUCTURE-DEBT.md`(43) = **13 档**。

**C · 零动作（漂移 / 记录面）**：`AGENT-LOOP.md` · `LEDGER-SELF-CONTAINED.md` · `PORTABILITY.md` · `ADVISOR-GUARDS.md`（今天零命中）· `docs/TODO-archive.md`（归档记录面，`DOC-DISCIPLINE.md:34` 不得删）。

### 2.8 验收对照（回指本批条目）

| 条目 | 判据 | 落点 / 读数 |
|---|---|---|
| AC1 | A1–A22 + B 组 + 需求档 + §2.10.2 新补 **135 处**（机制档 109 = 逐字 76 + 按形 33；需求档 26）。**逐字 76 处**给「文件:行 · 现文逐字 · 改后逐字」；**按形 33 处**给形名 + 逐行坐标（形 = 判据 F1–F7 / G1–G2，落笔轮不自定） | §2.3（A1–A22）· §2.5（B 组 24 档 + 新增 2 处）· §2.6（需求档 13 档）· **§2.10.2（新补 135 处在册）** |
| AC2 | 现文与今天盘上一致（R3 已改过 EN，机制档未动 ⇒ 须实测复核） | 全量逐行扫 203 命中 / 38 档 + 逐处约 150 处实读；漂移表 §2.2（PROMPT-SYSTEM +21 · DOC-DISCIPLINE +7 · LEDGER +18） |
| AC3 | 判面一的域与排除集写明 | §2.1 判面 1 |
| AC4 | W 类逐处点名（`:143` / `:79` 等） | §2.4 W1–W15（含首轮漏项两处） |
| AC5 | 受影响文件表按笔域分组 | §2.7 A / B / C 三组 |
| AC6 | 先例行 + 勘察证据行 | 下节两行 |
| AC7 | 交付后复算两条读数：① 规范面（域 = `docs/**` 扣 `batches` / `_archive` / `docs/TODO*.md` / 产品树）计数 = 0；② 记录面（`docs/TODO*.md`）另计 | ② 现读数 = **1**（`TODO-archive.md:260`，归档记录、按 `DOC-DISCIPLINE.md:34` 不删）；① 落笔轮复跑 |

### 2.9 关键决策 / 上抛项

| # | 决策 | 内容与理由 |
|---|---|---|
| D-1 | **W 类判面归属定义** | 判面一 = 完整字面 `docs/core/design/prompts`（R5 grep 同串）；凡**裸 `design/prompts/`、相对 `core/design/prompts/`、无路径的「中文设计档 / 正本 / 两份」陈述**一律归判面二（清单勾稽）。理由：R5 的 grep 判据只认完整串，混判会让清单与机检二义。 |
| D-2 | **A17–A19 处置 = 不落笔 + 移交** | CN 镜像 = R5 待删对象（改它白干）⇒ 零动作；EN = 产品代码 ⇒ eng-coder 单批（判据 A.3 / A.4，2026-10-18 23:01 已裁）。改后 EN 句已在 §2.3 A17–A19 给出，供 coder 批直用。**非本批新语义**。 |
| D-3 | **M9 保留编号、改行不删行** | 删 `ENGINEERING-MODE-V2.md:72` 的 M9 行会破 M1–M11 编号链与他档 `M9` 引用（涟漪面不可控）⇒ 改为「提示词单源承载」。`PROMPT-SYSTEM.md` §2.2 整节删后，其下节号顺移一级（同档内互引同轮改指）。 |
| D-4 | **非双份制但破 R5 grep 的两处 = 本轮同改（已写死）** | `DOC-SYSTEM.md:152/154`（裸 `design/prompts/` 计数注）· `TODO.md:19`（退役 md 面）。改法 = 写成「`_archive/` 下的提示词档」——**不携带连续子串 `design/prompts`**（补前缀照样命中 R5 的文本串判据）；`TODO.md:19` 改为「提示词档原文不外发（唯一副本 = `thincoder-core/prompts/`）」。R5 判据 ① 同时收窄为「不带 `_archive/` 前缀的 `design/prompts` 零命中」（§2.10.5）。 |
| **上抛·知会** | **A17–A19 的 EN 落笔需新开 eng-coder 批** | 本批禁改提示词，故 A17–A19 的 EN 侧不在 R4 落地；若不排期，提示词里「your prompt pen = the Chinese review face」会与机制档单面制**并存**至 R5 之后。 |
| **上抛·知会** | **`requirements/ENGINEERING-MODE-V2-SPEC-PROMPT-PIPELINE.md` 建议整档退场** | 该档 35 行 = 「设计 → 实现流程」的完整规格，流程已退场 ⇒ 无对象。属需求档（主 agent 笔），本席只出建议。 |

**先例行**：查过 = `docs/README.md`（文档地图，`:3` / `:51`）· `core/design/PROMPT-SYSTEM.md` 全文（958 行，含 §1 / §2 / §6.1 / §7 决策族 / §8 全节）· `core/design/DOC-SYSTEM.md` 全文（392 行，§4 树 / §5.1 P4 / §9 / §10.3 / §11 / §13）· `core/design/DOC-DISCIPLINE.md` §1 D1–D9 块（`:13-74`）· `core/design/{CORE-UNIFICATION,ENGINEERING-MODE-V2,TWO-REPO-MERGE,ARCHITECTURE,DOC-MIGRATION,LEDGER,ADVISOR-CONVERGENCE,AGENT-LOOP-UPSTREAM,MANIFEST,LIGHT-CHANNEL,ANCHOR-DEBT-REPAIR,DESIGN-TOKEN-SETTLEMENT,ENG-TOKEN-BINDING,TOOLS,TESTING,VERIFY-REDESIGN,STRUCTURE-DEBT,BASH-EXECUTOR-FACE,DOC-CODE-RECONCILE,BATCH-RECORD,AGENT-LOOP-ASYNC-POOL}.md` 命中行逐行 · `cli/design/ACP-CLIENT.md:132` · `requirements/**` 49 档中 13 档命中行逐行 · 冻结蓝图 `2026-10-18-prompt-single-face.md` §2.5 / §2.6 / §2.7 / §2.9 / §2.12。**最接近先例行**：先例 = 本批输入 `docs/batches/2026-10-18-prompt-single-face.md`（其 §2.6 即逐处现文→改后的先例形态）· 对位设计节 = `PROMPT-SYSTEM.md` §6.1 / §8 · `DOC-SYSTEM.md` §5.1 P4 / §10.3；**对齐面 = 方法**（逐处现文→改后 + 清单勾稽 + 引用清扫分流）；**偏离面 = ① 坐标全量重测（蓝图 +21/+7/+18 已漂）② A17–A19 笔域改判为「CN 零动作 + EN 移交 coder」（判据 A.3/.A.4 的直接后果，非新语义）③ 补三处漏项（`TODO.md:19` · `DOC-SYSTEM.md:152/154` · `requirements/STRUCTURE-DEBT.md:17`）**；偏离理由 = 上述三处均为**事实层纠正**（盘上坐标 / 已裁笔域 / 漏项），不构成方向偏离。

**勘察证据行**：公共源档 = `docs/core/design/**`（61 档）+ `docs/core/requirements/**`（49 档），命中面已逐行实读；`_archive/**` 与两产品树 `docs/**` 判**冻结 / 参照历史，不处置**（与蓝图 §2.7 注一致）。**独立文档仓结论 = 不相关（已查无）**：工作区 `AGENTS.md` 项目表末行载参考系 `D:\ref\` 已移出工作区不入索引；`PROJECT-MANIFEST.json` `index.publicRepos = []`（蓝图 `:56` 在册读数，本批沿用）⇒ 无独立仓可查。**doc_check 读数（本档两次 append 回执，mode = gate）**：首行均 `DOC-CHECK GATE: PASS（0 档）`——批次档不在声明域（`checkConfig.anchors.exclude` 含 `batches`），如实记；R4 落笔轮的 gate 由该轮自判。

### 2.10 修正轮（`advisor#26` · 6 条全收 · 2026-10-19）

**根因（#1，本席认领）**：§2.5 的行集是 `design/prompts` **字面 grep** 的产物。2026-10-18 蓝图 B 组列过的 `PROMPT-SYSTEM.md:171-173 / 268 / 344 / 354 / 521 / 624 / 650 / 761 / 783 / 808 / 827` 等行，今天已写成「CN ∥ EN」无路径形 —— 于是既抓不到、又被 §2.4 的「已全覆盖」结论句盖住。**判面二存在的理由（抓字面抓不到的句）恰好成了它的盲区。**

### 2.10.1 第二轮：语义 token 族全量扫（24 机制档 + 13 需求档 + 地图）

**手段**：node 逐档逐行扫，token 族 = `中文正本` / `中文设计档` / `中文设计文档` / `中文提示词` / `提示词正本` / `正本面` / `两面` / `两份` / `CN 正本|CN 面|CN 代码` / `设计→实现` / `精确翻译` / `翻译回写` / `运行期面` / `落地档` / `双语` / `镜像`（`镜像` 与裸 `正本` 只作候选放大，逐行人工判）。**判定规则**：命中且语句在描述「提示词有两面 / 有正本 / 有翻译回写链」⇒ 双份制陈述；命中但指别的事物（两臂 / 两份 `.mjs` / 锚类两面 / 双语 UI）⇒ 非本族，登记为「已判非」。

| 档 | 行数 | token 族命中（命名族） | 判定 | 本轮新补 |
|---|---|---|---|---|
| `design/PROMPT-SYSTEM.md` | 958 | 中文设计文档 35 · 中文设计档 31 · 精确翻译 27 · CN 正本/CN 面 27 · 落地档 22 · 中文正本 19 · 翻译回写 18 · 两份 14 · 双语 14 · 两面 11 · 设计→实现 6 · 运行期面 4 | 绝大多数为本族 | **41 处**（§2.10.2-a） |
| `design/DOC-SYSTEM.md` | 392 | 落地档 10 · 提示词正本 4 · 两份 3 · 中文设计档 2 | 本族；A9/A10/A11/A21/A22/W5 已覆盖 `:79 / :121 / :143 / :174 / :269 / :272-276 / :306 / :326-327 / :343 / :355 / :152 / :154` | **1 处**（`:388`） |
| `design/CORE-UNIFICATION.md` | 1006 | 中文设计档 45 · 运行期面 8 · 两面 6 · 两份 6 · 落地档 5 · 提示词正本 3 · 中文设计文档 2 · 精确翻译 2 · 设计→实现 1 | A13（1 + 随动 17）覆盖 18 处；**其余 36 处本族**（席位 / 行集 / 读数句） | **36 处**（逐字 6 + 按形 30——`:593` 1 + G2 12 + G1 11 + `:402` 6；`:302` 已在 A13 随动，不重计） |
| `design/DOC-DISCIPLINE.md` | 1965 | 运行期面 3 · 两面 3 · 运行面 3 · 两份 2 · 中文设计文档 1 · 正本面 1 · 提示词正本 1 · CN 正本 1 | A12 + §2.5（`:36/:68/:74/:228/:229/:266/:681/:1559/:1897`）覆盖；`:21`（D7 清单）/`:104`/`:332`/`:489`/`:518`/`:1532`/`:1603`/`:1944` 为「运行面 / 两面」他义 | **3 处**（`:683` · `:1856` · `:691`） |
| `design/AGENT-LOOP-UPSTREAM.md` | 1320 | 两份 12 · 两面 8 · 中文设计文档 2 | §2.5 覆盖 10 行；`:199`/`:900`/`:949`/`:973`/`:976`/`:1098`/`:1134`/`:1174`/`:1181`/`:1182`/`:1205`/`:1207`/`:1250`/`:1282`/`:1293`/`:1313`/`:1314`/`:1316` 为「两份稿 / 两面」在派单与批次语境（非提示词面） | **1 处**（`:620`；`:265` 已由 §2.5 覆盖，不重计） |
| `design/BATCH-RECORD.md` | 636 | 两份 6 | 全为本族（提示词层两档） | **6 处**（`:460/:468/:494/:565/:569/:578`） |
| `design/LIGHT-CHANNEL.md` | 219 | 两份 5 · 精确翻译 4 · CN 2 · 中文设计文档 2 · 落地档 2 · 设计→实现 1 | §2.5 覆盖 `:150/:151/:162/:166/:167` | **8 处**（`:146/:152/:179/:180/:181/:194/:209/:216`） |
| `design/ADVISOR-CONVERGENCE.md` | 424 | 中文正本 8 · 两份 6 · 中文设计档 2 · 双语 2 · 精确翻译 1 | §2.5 覆盖 19 行；`:163`/`:203`/`:207`/`:214` 为本族（`:48` = 「重置镜像状态」轮次语义，已判非） | **5 处**（逐字 `:75` · `:207`；按形 `:163` · `:203` · `:214`） |
| `design/DOC-MIGRATION.md` | 747 | 中文设计文档 2 · 两份 2 · 提示词正本 1 | §2.5 覆盖 9 行 | **2 处**（`:507` · `:517`） |
| `design/TESTING.md` | 621 | 两份 2 · CN 1 · 双语 1 | §2.5 覆盖 `:11` | **2 处**（`:128` · `:256`） |
| `design/AGENT-LOOP.md` | 516 | 两份 1 · 两面 1 · 提示词正本 1 | 前二为他义；`提示词正本` 一处为本族 —— **推翻 §2.5「本档零动作」** | **1 处**（`:334`） |
| `design/LEDGER-SELF-CONTAINED.md` | 227 | 中文设计文档 1 · 两面 1 | `:189` 为本族（「落笔分述：中文设计文档 = eng-designer 笔」）—— **推翻 §2.5「零命中」** | **1 处**（`:189`） |
| `design/PORTABILITY.md` | 300 | 中文设计文档 1 · 运行面 1 | `:230` 为本族（D12 行「落笔分述」）—— **推翻 §2.5「零命中」** | **1 处**（`:230`） |
| `design/ENGINEERING-MODE-V2.md` | 526 | 精确翻译 8 · 中文设计文档 8 · 设计→实现 4 · 落地档 1 · 两面 1 · 两份 1 | A14 覆盖 `:72/:278/:297/:299/:448/:478` | **0 处**（A14 已全） |
| `design/AGENT-LOOP-SUBAGENT.md` | 681 | 中文正本 1 · 两份 1 · 双语 1 | `:679`「提示词面（persona ∥ 中文正本）零触」为本族 | **1 处**（`:679`） |
| `design/AGENT-LOOP-ASYNC-POOL.md` | 1155 | 运行期面 1 · 两面 3 · 提示词正本 1 | §2.5 覆盖 `:195`；`:105/:106/:141/:538/:545/:573/:1111/:1124` 为他义（池面两面） | **0 处** |
| `design/BASH-EXECUTOR-FACE.md` | 156 | 正本面 1 · 提示词正本 1 | §2.5 覆盖 `:149` | **0 处** |
| `design/ANCHOR-DEBT-REPAIR.md` | 371 | 两面 4 | 全为锚类两面（路径锚 ∥ 用例号锚），**已判非** | **0 处** |
| `design/DESIGN-TOKEN-SETTLEMENT.md` | 266 | 两面 3 · 运行期面 2 | §2.5 覆盖 `:171/:203/:234`；`:76-78` 为「两面对齐」（端差面）、`:204` 是英文运行期面独行 | **0 处** |
| `design/LEDGER.md` | 898 | 两面 3 · 两份 1 | 两臂 / `.mjs` 两份，**已判非** | **0 处** |
| `design/MANIFEST.md` | 868 | 两份 2 · 两面 2 · 精确翻译 1 · 运行面 1 | §2.5 覆盖 `:176/:567/:634/:649/:689`；其余为他义 | **0 处** |
| `design/TOOLS.md` | 1553 | 落地档 5 · 运行期面 4 · 运行面 3 · 两份 1 · 两面 1 | §2.5 覆盖 `:692/:703`；其余为代码面「两面 / 两份实现」 | **0 处** |
| `design/ADVISOR-GUARDS.md` · `design/DOC-CODE-RECONCILE.md` | 413 / 235 | 后者中文设计档 1 | 前者零；后者 `:218` 由 §2.5 覆盖 | **0 处** |
| `cli/design/ACP-CLIENT.md` | 627 | 命名族零 | §2.5 覆盖 `:132` | **0 处** |
| `docs/README.md`（地图） | 107 | 提示词正本 1 · 中文设计档 1 | A16 覆盖 `:3/:51` | **0 处** |
| **需求档 13 档** | — | `PROMPT-SYSTEM` 18 · `ENGINEERING-MODE-V2` 13 · `METHODOLOGY` 9 · `CORE-UNIFICATION` 10 · `NORMAL-MODE` 6 · `LIGHT-CHANNEL` 3 · `ADVISOR-CONVERGENCE` 2 · `DOC-SYSTEM` 2 · `TESTING` 2 · `TWO-REPO-MERGE` 1 · `TOOLS` 1 · `CONTEXT-COMPACTION` 1 · `AGENT-LOOP` 4 · `STRUCTURE-DEBT` 0 | §2.6 覆盖已列坐标；新增 26 处（§2.10.2-c 实列 26 行） | **26 处** |

**零命中登记（证明扫过；命名族零且无本族候选）**：`design/` 侧 `AGENT-PARAMS` · `API-CONTRACT` · `APPLY-PATCH` · `BROWSER-TOOL` · `CHECKPOINT` · `CONFIG`（两面 1 = 配置两面，判非） · `CONSULTATION` · `EDIT` · `EDIT-HELPERS` · `ENG-TOKEN-BINDING`（§2.5 覆盖其两处路径字面） · `ESCALATE` · `HASHLINE-EDIT` · `I18N`（双语 1 = UI 双语） · `INSERT-AFTER` · `LOGGING` · `MCP` · `MEMORY` · `MODEL-BENCH`（运行面 25 = 运行期面他义） · `MODEL-SPECS` · `MULTI-INSTANCE-COLLAB` · `PROVIDER` · `PROXY` · `SEND-STALL-DISTILL` · `SESSION` · `SETTINGS-TOOL` · `STRUCTURE-DEBT`（§2.5 覆盖 `:39`） · `TEAM` · `TEAM-LEDGER` · `TOOL-OUTPUT-LIMITS` · `TRACES` · `TURN-CAP-CONTINUE` · `TWO-REPO-MERGE`（§2.5 覆盖 5 处） · `VERIFY-REDESIGN`（§2.5 覆盖 `:67`） · `WORKSPACE` · `WRITE`；`requirements/` 侧 49 档中除上列 13 档外**全部零命中**（`ENGINEERING-MODE-V2-SPEC-PROMPT-PIPELINE` 按 §2.6 已判整档退场，不计）。

**合计（逐行判定后定稿）**：机制档 **109 处**（逐字 76 + 按形 33）+ 需求档 **26 处** = **135 处**（A 组 22 + W 15 + B 组 29 行 + §2.6 既有清单之外的新增面）。**算式**：41 + 1 + 36 + 3 + 1 + 6 + 8 + 5 + 2 + 2 + 1 + 1 + 1 + 1 = 109。

### 2.10.2 新补处 · 现文逐字 → 改后逐字

**改写式（收正 · 逐处只点形）**

- **F1 落点式（收正 #4）**：删 CN 半句（「中文正本 `docs/core/design/prompts/…`」及其行号），**EN 半句原位保留、不复制**；标题括注「（中文设计文档 + 英文代码）」⇒「（唯一副本 = `thincoder-core/prompts/`）」。
- **F2 正本句**：「中文正本 = `docs/core/design/prompts/*.md`（16 档）」⇒「唯一副本 = `thincoder-core/prompts/*.md`（16 档）」。
- **F3 双份句**：「两份」「CN ∥ EN」「按 M9 精确翻译回写」「CN 正本 = 设计轮直落 ∥ EN = 实施轮」⇒ 整句删（无第二份）。
- **F4 登记行**：纯 CN 侧档 / 行登记行 ⇒ 整行删。
- **F5 宽检句**：「CN 新行守行宽 ≤300」⇒ 删（被检面消失）。
- **F6 对拍句**：「CN↔EN 对拍时点 / 四轴对拍」⇒ 删（无对拍对象）。
- **F7 落笔句**：「CN 本设计轮落形 ∥ EN 按 M9 回写」⇒「EN = 实施轮 coder 落笔（依据 = 本节设计）」。

**(a) `design/PROMPT-SYSTEM.md`（41 处）**

| 行 | 现文（逐字摘录） | 改后（逐字） |
|---|---|---|
| :166 | 「…（既有节内增列 ⇒ 零 `##` 块计数连带；CN 正本 = 设计轮直落 ∥ EN 代码 = 实施轮按 M9；→ §6.23 · §7 D-PS31）·」 | 删「CN 正本 = 设计轮直落 ∥ EN 代码 = 实施轮按 M9；」（F3），余同 |
| :168 | 「…零 `##` 块计数连带；CN 正本 = 设计轮直落 ∥ EN 代码 = 实施轮按 M9；→ §6.26 · §7 D-PS37）。」 | 同上删该分句 |
| :169 | 「…标题节点 22 ⇒ 23——§8.2 行 5 随正；CN 正本 = 设计轮直落 ∥ EN 代码 = 实施轮按 M9；→ §6.28」 | 同上 |
| :170 | 「…标题节点 23 ⇒ 24——§8.2 行 5 随正；CN 正本 = 设计轮直落 ∥ EN 代码 = 实施轮按 M9；→ §6.29」 | 同上 |
| :171 | 「…；CN 正本 = 设计轮直落 ∥ EN 代码 = 实施轮按 M9 精确翻译回写）。」 | 同上 |
| :172 | 「…；CN 正本 = 设计轮直落 ∥ EN 代码 = 实施轮按 M9 精确翻译回写；→ §6 末紧凑登记 · §7 D-PS41）。」 | 同上 |
| :173 | 「- **变更流**：改中文正本 → 精确翻译写入英文代码（复用存量词句、语义对等；**无同步脚本、无硬一致门**）。提示词档免档位判定（`.md` 结构尺度）。生成流程本体（设计→实现流程 / 路径取法与落地面 / 结构级复核）见 **§8**（本处不重述——D2）。」 | 「- **变更流**：改规则 → 先改机制文档 → coder 依它改 EN（产品代码面；复用存量词句、语义对等）。提示词档免档位判定（`.md` 结构尺度）。承载面本体（唯一副本 / 加载面）见 **§8**（本处不重述——D2）。」 |
| :187 | 「- 各实现面（CLI / VSC / **中文正本 / 运行期落地**）**语义同源、原文自持**…」 | 「- 各实现面（CLI / VSC / 核内提示词面）**语义同源、原文自持**…」 |
| :191 | 「`persona-eng-coder.md` 实现纪律（`:17` 不得静默降级 / `:23` 收尾自审；**CN 正本 `:18` / `:30`**）。」 | 删「；CN 正本 `:18` / `:30`」（F1） |
| :232 | 「**落点**：纪律句落 `common.md`「文档写作纪律」节（**两面各 +1 行**；内容权威 = 主 agent）。」 | 「**落点**：纪律句落 `common.md`「文档写作纪律」节（1 行；内容权威 = 主 agent）。」 |
| :247 | 「**正典层 `subagent-base.md`** **两份**（槽位 [4]——全部子代理角色装配…）；」 | 「**正典层 `subagent-base.md`**（槽位 [4]——全部子代理角色装配…）；」 |
| :250 | 「**机检**：引用锁 T9 · T-CL1 · **两份锁**照常适用；…」 | 「**机检**：引用锁 T9 · T-CL1 照常适用；…」 |
| :268 | 「**来源**：用户裁定——裁定 A（落点）；**落笔口径 = 中文设计文档设计轮落形 / 英文按 M9 精确翻译回写**；**追加第 4 条纪律**…」 | 「**来源**：用户裁定——裁定 A（落点）；**落笔 = eng-coder（依据 = 本节设计）**；**追加第 4 条纪律**…」 |
| :277 | 「…（…第 4 条折行），按 **M9 精确翻译回写**、非 cp——实施轮落笔）；逐字文本 = 设计围栏块…」 | 「…（…第 4 条折行）——实施轮 coder 落笔）；逐字文本 = 设计围栏块…」 |
| :303 | 「…；**CN 镜像两行守行宽 ≤300**。」 | 删该句（F5） |
| :304 | 「…；**CN 两新行守行宽 ≤300**；新增文本零文档引用…」 | 删「CN 两新行守行宽 ≤300；」（F5） |
| :336 | 「**落点（中文设计文档 + 英文代码）**：**CN 正本 ∥ EN 代码 × 两档**——逐处（档 ∥ 节 ∥ 形态）与咬合处置 = 机制设计档 §3；…；**EN 按 M9 精确翻译回写（非 cp）**。」 | 「**落点（唯一副本 = `thincoder-core/prompts/`）**：EN 两档——逐处（档 ∥ 节 ∥ 形态）与咬合处置 = 机制设计档 §3；逐字文本 = 设计围栏块（一次性材料不混入本档——D2）。」 |
| :339 | 「…；**CN 新行守行宽 ≤300**。」 | 删该句（F5） |
| :344 | 「…；**提示词正本 D1–D7 ∥ 设计档 D1–D8**——先裁同步与否。」 | 「…；**提示词面 D 清单与机制档 D1–D9 同步**（D-PS16）。」 |
| :354 | 「③ `discipline-engineering.md`「文档更新纪律」表头 ∥ 计数句 ∥ +D8 行（**CN ∥ EN**）。逐字文本 = 设计围栏块…；**EN 按 M9 精确翻译回写（非 cp）**。」 | 「③ `discipline-engineering.md`「文档更新纪律」表头 ∥ 计数句 ∥ +D8 行（EN 一档）。逐字文本 = 设计围栏块（一次性材料不混入本档——D2）。」 |
| :451 | 「逐字文本 = 设计围栏块（一次性材料不混入本档——D2）；**EN 按 M9 精确翻译回写（非 cp）**。」 | 删后半句（F3） |
| :496 | 「…`persona-eng-designer.md`（`:38` ∥ `:51`）；逐字文本 = 设计围栏块…；**EN 按 M9 精确翻译回写（非 cp）**。」 | 删后半句（F3） |
| :521 | 「…`common.md`（「批次档常识」六段全图行——节内换写）；逐字文本 = 设计围栏块…；**EN 按 M9 精确翻译回写（非 cp）**。」 | 删后半句（F3） |
| :623 | 「**落笔安排（父侧派单）**：**CN ∥ EN 均实施轮落笔**（CN → eng-designer ∥ EN → eng-coder——M9 精确翻译回写，非 cp）。」 | 「**落笔安排（父侧派单）**：EN 档 = 实施轮 coder 落笔（依据 = 本节设计）。」 |
| :624 | 「与 §6.1「中文设计文档 = 设计轮直落」之差——**因由 = 双稿同轮落笔**：…（§6.16「单批安排」为异向旧例——旧规「落笔归实现轮」时代，本处不沿引）。」 | 整句删（F3：无「设计轮直落」一支） |
| :629 | 「…；**CN 新行守行宽 ≤300**（实施轮落地时核）∥ EN 档不在行宽机检域…」 | 删「CN 新行守行宽 ≤300（实施轮落地时核）∥」（F5） |
| :650 | 「**落笔安排**：**中文设计文档 = 本设计轮直落**（§6.1 面分述）；**英文代码 = 实施轮**（按 M9 精确翻译回写，非 cp）。」 | 「**落笔安排**：**EN 代码 = 实施轮 coder 落笔**（依据 = 本节设计）。」 |
| :761 | 「**落笔安排**：**CN 正本 = 本设计轮直落**（§6.1 默认——中文设计文档随设计轮直落）∥ **EN 代码 = 实施轮**（按 M9 精确翻译回写，非 cp）。」 | 同 :650 改后（F7） |
| :762 | 「**CN↔EN 对拍时点**：EN 落地轮做四轴对拍（同裁定 ∥ 同判据 ∥ 同形边界 ∥ 差异如实登记），读数入落地轮记录面。」 | 整句删（F6） |
| :783 | 「**落笔安排**：**CN 正本 = 本设计轮直落**（§6.1 默认——中文设计文档随设计轮直落）∥ **EN 代码 = 实施轮**（按 M9 精确翻译回写，非 cp）。」 | 同 :650 改后（F7） |
| :784 | 「**CN↔EN 对拍时点**：EN 落地轮做四轴对拍…」 | 整句删（F6） |
| :800 | 「③ 工程纪律层 `discipline-engineering.md:206`（**CN 正本**）旁注整行扩写——…」 | 「③ 工程纪律层 `discipline-engineering.md:206` 旁注整行扩写——…」 |
| :808 | 「EN 代码 = `thincoder-core/prompts/` 同四处——**实施轮**按 M9 精确翻译回写（非 cp）；…」 | 「EN 代码 = `thincoder-core/prompts/` 同四处——**实施轮** coder 落笔；…」 |
| :843 | 「…红线是既有「有专用工具就不 hand-roll」句（**仅中文正本** `common.md:69`）的同节主题延伸…」 | 「…（`common.md:69`）的同节主题延伸…」（删「仅中文正本」） |
| :848 | 「…（六字段列表末行后 · 既有节内增列 ⇒ 零块计数连带）；**中文正本本设计轮落形，英文按 M9 精确翻译回写（实施轮）**」 | 「…（六字段列表末行后 · 既有节内增列 ⇒ 零块计数连带）；**EN 按本节设计于实施轮落笔**」 |
| :852 | 「（**中英两份**——既有节内增列 ⇒ 零 `##` 块计数连带）」 | 「（既有节内增列 ⇒ 零 `##` 块计数连带）」 |
| :853 | 「（**中英两份**——既有节内增列；设计句零改——规则已在机制设计档）」 | 「（既有节内增列；设计句零改——规则已在机制设计档）」 |
| :866 | 「**同族句换写 = 中英两档四处**（CN `:38` ∥ `:51` ∥ EN `:38` ∥ `:51`；…）」 | 「**同族句换写 = EN 两处**（`:38` ∥ `:51`；…）」 |
| :881 | 「## 8. 提示词设计→实现流程（M9 落点）」 | 「## 8. 提示词承载（单源 · M9 落点）」 |
| :954 | 「（见 §8 提示词设计 → 实现流程——v2 行为面由该流程 + 收口核对承载。）」 | 「（见 §8 提示词承载——v2 行为面由该节 + 收口核对承载。）」 |
| :957 | 「变更同步：v2 对提示词内容的任何裁定，落本档对应设计文档档（persona / discipline / common），设计 → 实现流程（M9）同步落地。」 | 「变更同步：v2 对提示词内容的任何裁定，先落本档对应节（persona / discipline / common 的设计面），再由 coder 改 EN（M9 单源落地）。」 |

**(b) 其他机制档（逐字处）**

| 档:行 | 现文（逐字摘录） | 改后（逐字） |
|---|---|---|
| `DOC-SYSTEM.md:388` | 「4. **不写核树 / 提示词 / 台账**：`thincoder-core/**` 零写入；**提示词文件（含中文模板）零写入**；`docs/TODO.md` 零写入（§10.2 交父侧）。」 | 「4. **不写核树 / 提示词 / 台账**：`thincoder-core/**` 零写入；提示词文件（`thincoder-core/prompts/**`，产品代码面）零写入；`docs/TODO.md` 零写入（§10.2 交父侧）。」 |
| `DOC-DISCIPLINE.md:683` | 「提示词**正本面**第 6 条 = **已落** · 提示词**运行期面**第 6 条 = **在途**（落笔 = eng-coder 域）」 | 「提示词面第 6 条 = **在途**（落笔 = eng-coder 域）」——「正本面 = 已落」一条的对象（CN 镜像）随 R5 删档消失，该条删（D8：否则同行两个同名条目、状态互斥）；同行「提示词运行期面第 6 条」⇒「提示词面第 6 条」 |
| `DOC-DISCIPLINE.md:1856` | 「（**CN 正本 + EN 运行面** + `BATCH-RECORD.md` §5.3）」 | 「（EN 运行面 + `BATCH-RECORD.md` §5.3）」 |
| `DOC-DISCIPLINE.md:691` | 「**复核读数（域 = `docs/**/design/**` 非归档 + 提示词两面）**：族命中 114 行…」 | 「**复核读数（域 = `docs/**/design/**` 非归档 + 提示词面）**：族命中 114 行…」——「提示词两面」⇒「提示词面」 |
| `BATCH-RECORD.md:460` | 「## 5. 行为纪律（提示词层，**两份同步**）」 | 「## 5. 行为纪律（提示词层，EN 单份）」 |
| `BATCH-RECORD.md:468` | 「`prompts/persona-engineering.md`「批次档生命周期（五条）」（**CN ∥ EN 两份**）+ `prompts/persona-eng-coder.md`「批次档纪律」…」 | 删「（CN ∥ EN 两份）」，余同 |
| `BATCH-RECORD.md:494` | 「**本次不加机检**（守护 = **两份逐字** + 评审核验 + 三机检零回归）」 | 「**本次不加机检**（守护 = 逐字核对 + 评审核验 + 三机检零回归）」 |
| `BATCH-RECORD.md:565` | 「\| A12 \| **主 agent 人格改述 + spawn eng-designer 调用链** \| 主 agent persona \| **两份（同名两档）** \|」 | 「\| A12 \| … \| 主 agent persona \| 单档（`thincoder-core/prompts/persona-engineering.md`） \|」 |
| `BATCH-RECORD.md:569` | 「### 6.3 提示词**两份**与端特有段」 | 「### 6.3 提示词面与端特有段」 |
| `BATCH-RECORD.md:578` | 「② **提示词两份面**（**拷贝** + 锚句宿主定点改 + 新建 + 锚句断言测试）」 | 「② **提示词面**（锚句宿主定点改 + 新建 + 锚句断言测试）」 |
| `TESTING.md:128` | 「· 工程纪律档**两副本**的 D7 枚举（主 agent 内容权 + 落笔分述）· 对端**两份**同款两文件。」 | 「· 工程纪律档（EN）的 D7 枚举（主 agent 内容权 + eng-coder 落笔）· 对端两文件同款。」 |
| `TESTING.md:256` | 「纪律落点 = 本仓提示词测试纪律节（**两份**）+ 需求档 + 本档；…」 | 「纪律落点 = 本仓提示词测试纪律节（EN）+ 需求档 + 本档；…」 |
| `AGENT-LOOP.md:334` | 「…（**提示词正本** `prompts/persona-eng-designer.md:35`），而轮数本身是模型看不见的量…」 | 「…（提示词 `thincoder-core/prompts/persona-eng-designer.md:35`），而轮数本身是模型看不见的量…」 |
| `LEDGER-SELF-CONTAINED.md:189` | 「**归属**：英文提示词实体 = 代码——**内容权归主 agent，落笔分述：中文设计文档 = eng-designer 笔 · 英文代码 = eng-coder 落笔**；本档只出逐字稿与落点。」 | 「**归属**：提示词 = 产品代码——**内容依据 = 机制文档，落笔 = eng-coder 独笔**；本档只出逐字稿与落点。」 |
| `PORTABILITY.md:230` | 「…结构一致性要求闭口；**内容权 = 主 agent，落笔分述：中文设计文档 = eng-designer 笔 · 英文代码 = eng-coder 落笔**」 | 「…结构一致性要求闭口；**内容依据 = 机制文档，落笔 = eng-coder 独笔**」 |
| `LIGHT-CHANNEL.md:146` | 「**落点（两份 × 两模式 = 4 档）**：」 | 「**落点（EN × 两模式 = 2 档）**：」 |
| `LIGHT-CHANNEL.md:152` | 「\| 同两行（**EN 依中文设计文档精确翻译生成**） \| `thincoder-core/prompts/…`（EN 代码） \| 同位 \| 既有节内增列 \|」 | 「\| 同两行（EN 单份） \| `thincoder-core/prompts/…` \| 同位 \| 既有节内增列 \|」 |
| `LIGHT-CHANNEL.md:179` | 「…落**两份**后按 ①–④ 同构核…」 | 「…落 EN 后按 ①–④ 同构核…」 |
| `LIGHT-CHANNEL.md:180` | 「…落需求 ∥ 提示词**两份**新增行）落需求后…」 | 「…落需求 ∥ 提示词新增行）落需求后…」 |
| `LIGHT-CHANNEL.md:181` | 「…落需求 ∥ 提示词**两份**后按 ①–④ 同构核…」 | 「…落需求 ∥ 提示词后按 ①–④ 同构核…」 |
| `LIGHT-CHANNEL.md:194` | 「- 提示词**设计 → 实现流程**（`PROMPT-SYSTEM.md` §6.1 ∥ §8——CN 设计文档 → EN 依它精确翻译生成）；」 | **整句删**（F3；该条链已退场） |
| `LIGHT-CHANNEL.md:209` | 「\| K7 \| **EN 依 CN 定稿精确翻译生成（实施轮）** \| 流程既定（中文设计文档 = 设计基准；生成 = 精确翻译，不是 cp、不是照抄） \|」 | **整行删**（F4） |
| `LIGHT-CHANNEL.md:216` | 「…需求 §2.3 新增条 ∥ 提示词「派发与收尾纪律」节内新增行（**两份**）」 | 删「（两份）」 |
| `ADVISOR-CONVERGENCE.md:75` | 「…（**内容权在主 agent**——落地形态照 D1；**两份 = 运行期 EN（依中文设计档精确翻译）⊗ 中文设计档 CN，同文口径**）：」 | 「…（**内容依据 = 机制文档**——落地形态照 D1；单份 = 运行期 EN，同文口径）：」 |
| `ADVISOR-CONVERGENCE.md:207` | 「**口径**：**双语**「轮次上限」字面族扫全仓，对象 = 提示词面（**运行期 + 中文正本**）· 需求面 · 设计面；…」 | 「**口径**：「轮次上限」字面族扫全仓，对象 = 提示词面（`thincoder-core/prompts/`）· 需求面 · 设计面；…」 |
| `AGENT-LOOP-SUBAGENT.md:679` | 「…提示词面（**persona ∥ 中文正本**）零触…」 | 「…提示词面（`thincoder-core/prompts/`）零触…」 |
| `AGENT-LOOP-UPSTREAM.md:620` | 「**两份纪律**（承 §6.27.8 先例）：英文代码（核 `helpers.mjs`）+ **中文设计文档的对位文本**归父侧同轮落笔；本档只登记落点与逐字建议。」 | 「**落笔纪律**（承 §6.27.8 先例）：英文代码（核 `helpers.mjs`）文本归父侧同轮落笔；本档只登记落点与逐字建议。」 |
| `DOC-MIGRATION.md:507` | 「**随动面**：① **两份同批同改（中文设计文档 + 英文代码；节名对应…）**；…④ 笔权 = 主 agent 内容权 + 落笔分述（D1）；…」 | 「**随动面**：① 落笔 = EN 一档（本设计轮零写提示词，实施轮 coder 落）；…④ 笔权 = eng-coder 独笔（内容依据 = 本节设计）；…」 |
| `DOC-MIGRATION.md:517` | 「\| AC-5 \| 提示词**两份同批落**（中文设计文档 + 英文代码；节名对应…）∧ 零新悬空引用 ∧ 无外露计数 \| §11.7 \|」 | 「\| AC-5 \| 提示词 EN 落（`thincoder-core/prompts/` 一档）∧ 零新悬空引用 ∧ 无外露计数 \| §11.7 \|」 |
| `CORE-UNIFICATION.md:282` | 「\| 提示词系统（槽位 / 工具描述 / **中文设计档**） \| `PROMPT-SYSTEM.md` \| … \|」 | 「\| 提示词系统（槽位 / 工具描述） \| `PROMPT-SYSTEM.md` \| … \|」 |
| `CORE-UNIFICATION.md:517` | 「…「产品内双源」约定段改述为「核内落地 + **仓根中文设计档**」」 | 「…「产品内双源」约定段改述为「核内落地（单副本）」」 |
| `CORE-UNIFICATION.md:589` | 「**保留的一致面（非端差） = 中文设计档（根仓基准层）↔ 英文代码（核内运行期落地档）**（英文由中文设计文档精确翻译生成）——…」 | 「**保留的一致面（非端差） = 无**（单副本；无第二面可对）——…」 |
| `CORE-UNIFICATION.md:593` | （同族一致面句） | 同 `:589` 同形 |
| `CORE-UNIFICATION.md:680` | 「\| 9 \| 提示词面指令集（`discipline-engineering` · `discipline-normal` · `persona-eng-coder` 三档 + **中文设计档**） \| 输出（模型可见指令） \| …」 | 「\| 9 \| 提示词面指令集（三档 EN） \| 输出（模型可见指令） \| …」 |
| `CORE-UNIFICATION.md:494` | 「D-C14（**中文设计档**——裁定 B 修订 + 层级口径：根仓 `docs/` 基准层正本 · 产品 `docs/**` 迁移期参照历史）」 | 「D-C14（**提示词单副本**——承 2026-10-18 取消镜像裁定）」 |
| `CORE-UNIFICATION.md:584` | 「2. **D14（提示词不做单副本合流）**：…（核内唯一副本 + 单一加载面 + **中文设计档**——…)」 | 「2. **D14**：…（核内唯一副本 + 单一加载面）」 |
| `CORE-UNIFICATION.md:242 / :252 / :297 / :303 / :408 / :410 / :412 / :415 / :416 / :610 / :642 / :947`（12 处；`:302` 已在 A13 随动处置，不重计） | 「+ 中文设计档对 15」「107 + 15 + 63 = 185」「S0a 席位 51（39 + 12）」「S0b 71」「中文设计档行 = 两端 `docs/design/prompts/`」等**读数 / 席位句** | **按形 G2**：删「中文设计档对」元素与对应读数；**计数同轮重算（D3）**：行集起点 185 ⇒ **170**（107 + 63）· S0a 席位 51 ⇒ **39**（36 + 3）· S0b 71 ⇒ **68** · `:410` 的「36 + 12 = 48」⇒「36 = 36」· `:947` T-C2 的「107 + 15 + 63」⇒「107 + 63」 |
| `CORE-UNIFICATION.md:5 / :27 / :36 / :94 / :400 / :401 / :402 / :403 / :404 / :418 / :419` | 「中文设计档不在建核面 / 不并入 / 不动——文档面」等同族限定句 | **按形 G1**：整句删（单面制下无「文档面提示词」这一支） |
| `CORE-UNIFICATION.md:530` | 度量脚本行数（480，Δ+309，含「中文设计档对」功能项） | **不改**——历史动作记录（该脚本改动已落，读数属记录面） |

**按形处清单（未逐字抄录的同族行——形 = 判据，落笔轮不自定；坐标即计数，清单闭合、无「等」）**：① `CORE-UNIFICATION.md` 6 处 = `:306` / `:790` / `:812` / `:813` / `:915` / `:918`（`:530` 已在上表判「不改」，不计）按 **G1 / G2**；② `ADVISOR-CONVERGENCE.md` 3 处 = `:163` / `:203` / `:214` 按 **F3**（删「两份同文 / 双语孪生 / 两份」半句；EN 半句原位保留、不复制）；③ `AGENT-LOOP-UPSTREAM.md:199` / `:900` / `:949` 判**已判非**（「两面」= 工具面 / 载荷面，非提示词面——见 §2.10.1 该档行），不入本表。**判定依据 = token 族 → 形映射；形本身是判据（F1–F7 / G1–G2），不留给落笔轮自定。**

**(c) 需求档（26 处 · 主 agent 笔）**

| 档:行 | 现文（逐字摘录） | 改后（逐字） |
|---|---|---|
| `requirements/PROMPT-SYSTEM.md:4` | 「设计层 = `docs/core/design/PROMPT-SYSTEM.md`（机制面 §6 **中文设计文档 → 英文代码** 的落地 / 装配 + §2 核模块裁决行）」 | 「（机制面 §6 提示词面的落地 / 装配 + §2 核模块裁决行）」 |
| `:46` | 「① **四面副本**（工程 / 普通 × 运行期 / 模板）该段在位；**同语言双副本与其语言面逐字草案全等**…④ **双面语义等价**。」 | 「① **运行期档**（工程 / 普通）该段在位且与逐字草案全等；④ 语义一致。」 |
| `:50` | 「① **双面人格档**（`persona-engineering.md` 中文正本 + 英文运行面）…」 | 「① **人格档**（`persona-engineering.md` 运行面）…」 |
| `:54` | 「① **两面**该行在位且与逐字草案全等（…逐语言逐字 + **双面语义等价**…）」 | 「① 该行在位且与逐字草案全等（一次性逐行比对）」 |
| `:59` | 「…CN 正本已落 ∥ EN 运行面 = 实施轮回写（M9）。」 | 「…EN 运行面 = 实施轮 coder 落笔。」 |
| `:93` | 「① **两面** `common.md` 第 14 节在位…④ **双面语义等价**。」 | 「① `common.md`（EN）第 14 节在位…」 |
| `:99` | 「**落点**：…；**两面同步（模板 + 运行期）**。**验收**：**两面**该条在位…+ **双面语义等价**…」 | 「**验收**：该条在位（node UTF-8 扫描）+ 机检净增 0 + 三包全绿。」 |
| `:110` | 「（**EN 运行面三档 = M9 翻译回写**。）」 | **整句删** |
| `:112` | 「**验收**：**双面六档**在位且围栏块逐行全等…」 | 「**验收**：EN 三档在位且围栏块逐行全等…」 |
| `:172` | 「**验收**：**两侧（中文设计文档 ∥ 英文代码）**同条落；…」 | 「**验收**：EN 档同条落；…」 |
| `:175` | 「…**四档中文设计文档 ∥ 英文代码两侧（M9）**。」 | 「…四档 EN 侧。」 |
| `:177` | 「**验收**：**四档两侧（中文设计文档 ∥ 英文代码）**该句在位…」 | 「**验收**：四档（EN）该句在位…」 |
| `requirements/ENGINEERING-MODE-V2.md:440` | 「…**中文设计文档 ↔ 英文代码一致不挂机检**——英文依中文编码生成，由收口核对兑底。」 | 「…（提示词单副本 ⇒ 无一致性机检项）。」 |
| `:444` | 「提示词有**两份**，关系是**设计 → 实现**，不是「同一物的两面」：」 | 「提示词只有一份（`thincoder-core/prompts/`）= 产品代码：」 |
| `:449` | 「**流程**：提示词的任何修改**先落在中文设计文档**；英文版本由 **coder 在编码时依中文设计文档生成**——生成 = **精确翻译**…」 | 「**流程**：改规则 → 先改中文机制文档 → coder 依它改 EN。」 |
| `:451` | 「**归属**：中文提示词 = 设计文档（设计席笔；主 agent 持内容权）∥ 英文提示词 = 代码（实施轮落笔…）。」 | 「**归属**：提示词 = 产品代码（eng-coder 独笔，随代码走评审与测试）。」 |
| `:605` | 「…**完成判据 = 自标面（需求 / 设计 / 提示词正本）的行号形引用归零**」 | 「…**完成判据 = 自标面（需求 / 设计 / 提示词面）的行号形引用归零**」 |
| `:618` | 「…**提示词两侧（中文设计文档 → 英文代码）**——语义同源于设计、原文自持…」 | 「…**提示词面（`thincoder-core/prompts/`）**——语义同源于设计、原文自持…」 |
| `:701` | 「…**模板面与运行期面同步**（语义一致；M9 单向机检已裁撤 ⇒ 收口核对兜底）…」 | 「…运行期面（EN）语义一致（收口核对兜底）…」 |
| `requirements/LIGHT-CHANNEL.md:82` | 「落**提示词两侧（中文设计文档 → 英文代码）**后，按 ①–④ 同构判据核。」 | 「落**提示词面（EN）**后，按 ①–④ 同构判据核。」 |
| `:83` | 「…落需求 ∥ **提示词两侧（中文设计文档 → 英文代码）**后…」 | 「…落需求 ∥ **提示词面（EN）**后…」 |
| `:84` | 「…落需求 ∥ **提示词两侧（中文设计文档 → 英文代码）**后…」 | 「…落需求 ∥ **提示词面（EN）**后…」 |
| `requirements/NORMAL-MODE.md:103` | 「…`thincoder-core/prompts/discipline-normal.md` **两侧（中文设计文档 → 英文代码）**含用法节…」 | 「…（EN）含用法节…」 |
| `:115` | 「…**提示词两侧落点三处（中文设计文档 → 英文代码）**（…——**EN 核内 + CN 正本**）…」 | 「…**提示词落点三处**（…——EN 核内）…」 |
| `requirements/METHODOLOGY.md:35` | 「…细则落**提示词两侧（中文设计文档 → 英文代码；设计轮出逐字块）**」 | 「…细则落**提示词（EN；设计轮出逐字块）**」 |
| `requirements/ADVISOR-CONVERGENCE.md:57` | 「评审提示词**四面**（round1 ∥ round2 ∥ round3 ∥ design，**各 EN⊗CN**）落「禁省略号…」写作禁则。」 | 「评审提示词四档（round1 ∥ round2 ∥ round3 ∥ design 的 **EN 面**）落「禁省略号…」写作禁则。」 |

**需求档侧同族但已判非**（登记以证判过）：`requirements/CORE-UNIFICATION.md:13 / :27 / :48 / :97 / :153`（「两份实现 / 两份现有文本 / 板块镜像」= 实现面与板块形）· `requirements/TESTING.md:78`（「改写镜像」= 测试层次）· `requirements/CONTEXT-COMPACTION.md:37`（两份摘要）· `requirements/TOOLS.md:62`（禁两份实现）· `requirements/TWO-REPO-MERGE.md:13`（两份实现）· `requirements/PROMPT-SYSTEM.md:223`（「这两面」= 两个注入开关）。

### 2.10.3 六条逐条处置

| # | 号 → 改动 :行 → 改后 |
|---|---|
| 1 🔴 | **清单重建**：§2.10.1 给出 token 族与逐档命中表（24 机制档 + 13 需求档 + 地图，零命中档逐个登记）· §2.10.2 给出 a/b/c 三张逐字表（机制档 109 处 + 需求档 26 处）· §2.10.4 把结论句从「字面命中」改为「token 族计数」。**主缺陷消除**：原来被丢弃的 `:171-173 / :268 / :344 / :354 / :521 / :624 / :650 / :761 / :783 / :808 / :827` 一族，全部落进 §2.10.2-a；另抓出 **9 处**原「零动作」误判（`AGENT-LOOP.md:334` 1 · `LEDGER-SELF-CONTAINED.md:189` 1 · `PORTABILITY.md:230` 1 · `BATCH-RECORD.md` 6 行 = **1 + 1 + 1 + 6**）。 |
| 2 🟡 | **判面一域写死为「并入 TODO\*.md」一形**（§2.1 行 + AC7 同改）：域 = `docs/**` 扣 `docs/batches/**` · `**/_archive/**` · **`docs/TODO.md` · `docs/TODO-archive.md`**（= `PROJECT-MANIFEST.json` `checkConfig.anchors.exclude` 的 `TODO*.md` 两项，同集）· 产品树。**AC7 改后逐字**：「交付后复算两条读数：① 规范面（域同上）`docs/core/design/prompts` 计数 = **0**；② 记录面（`docs/TODO*.md`）另计——现读数 = **1**（`TODO-archive.md:260`，归档记录、按 `DOC-DISCIPLINE.md:34` 不删）」。 |
| 3 🟡 | **W5/W8 改法换掉**（§2.5 `:121` / `:124` 两行改后文本）：`_archive/design/prompts/` 仍含子串 ⇒ 改为**拆开写、不携带连续子串**：「`_archive/` 下的提示词档 15 档」。同时把 **R5 判据 ① 收窄写死**（§2.8 R5 行）：「域 = `docs/**` + `scripts/**`，排除 = `docs/batches/**` · `**/_archive/**` · `docs/TODO*.md` · 产品树；判据 = 域内 `design/prompts` 零命中 ∧ **第二道：不带 `_archive/` 前缀的 `design/prompts` 零命中**」。 |
| 4 🟡 | **F1 收正 + 逐字补齐**：F1 改为「删 CN 半句 + 保留 EN 半句（不复制）」，并在 §2.10.2 给每条示例（`:760` 的改后见 a 表 `:761` 行同族，`:336` / `:623` / `:650` 各自给全句）。**AC1 粒度与交付物对齐**：AC1 分两层——逐字 76 处给「现文逐字 + 改后逐字」；按形 33 处给形名 + 逐行坐标（形 = 判据；见 §2.8 AC1 行）。 |
| 5 🟡 | **A13 的 48 → 53**（§2.3 A13 随动行 `:80` / `:953` 两处改后文本）：「`thincoder-core/tool-docs/`（**53 档**——枚举工具 52 ∥ 目录档 53；读数口径出处 = `PROMPT-SYSTEM.md:310`，同档 `:18` / `:20` / `:153` 同为 53 档读数）」「核内 16 + **53** 在位」。**计数口径**：目录实存 `.md` 53 = 枚举工具 52 + 目录档 1；`tool-docs/` 内不再出现 48 / 52 的并列读数。 |
| 6 🟡 | **`docs/TODO.md:19` 写死 = 改该行**（§2.5 表末行的「待定」括注已删，改为确定处置——与 §2.7 受影响文件表同口径）：改后 = 「提示词档原文不外发（唯一副本 = `thincoder-core/prompts/`）」。理由 = 不改则该行会命中 R5 判据 ①；改它成本一行且不动语义。**§2.9 D-4 同步改写**：该行不再是「两处待定」之一。 |

### 2.10.4 §2.4 结论句改后（逐字替换 `:133` 原句）

> **判面二勾稽结论（2026-10-19 收正）**：判面二的清单 = **A1–A22（22 处）+ W1–W15（15 组）+ §2.5 B 组（24 档 29 行）+ §2.10.2 新补（机制档 109 处 + 需求档 26 处）**。**判据不是「`design/prompts` 字面命中」而是「语义 token 族全量扫」**：token 族 = `中文正本` / `中文设计档` / `中文设计文档` / `中文提示词` / `提示词正本` / `正本面` / `两面` / `两份` / `CN 正本|CN 面` / `设计→实现` / `精确翻译` / `翻译回写` / `运行期面` / `落地档` / `双语`。逐档命中表与零命中档登记见 §2.10.1；原 `:133` 的「已全覆盖」表述作废（它只覆盖了字面命中面）。

### 2.10.5 三处口径改后（逐字）

**① 判面一（§2.1 第 1 条）**：「**判面一 · 路径字面**：域 = `docs/**`，扣 `docs/batches/**` · `**/_archive/**` · `docs/TODO.md` · `docs/TODO-archive.md`（与 `PROJECT-MANIFEST.json` `checkConfig.anchors.exclude` 的 `TODO*.md` 同集）· 产品树 `thincoder-cli/docs/**` ∥ `thincoder-vscode/docs/**`；判据 = 该域内 `docs/core/design/prompts` **计数 = 0**。记录面（`docs/TODO*.md`）另计并给读数。」

**② R5 判据（§2.8 R5 行）**：「域 = `docs/**` + `scripts/**`；排除 = `docs/batches/**` · `**/_archive/**` · `docs/TODO*.md` · 产品树。判据 = ① 域内 `design/prompts` 零命中 ∧ 不带 `_archive/` 前缀的 `design/prompts` 零命中 ② `node scripts/prompt-refs-check.mjs` 绿 ③ `docs/**` 下 `prompts/` 目录不存在。」

**③ AC1（§2.8 第 1 行）**：「A1–A22 + B 组 + 需求档 + **§2.10.2 新补 135 处**（机制档 109 = 逐字 76 + 按形 33；需求档 26）：**逐字 76 处**给「文件:行 · 现文逐字 · 改后逐字」；**按形 33 处**给形名 + 逐行坐标（形 = 判据 F1–F7 / G1–G2，落笔轮不自定）。落点 = §2.3 · §2.5 · §2.6 · §2.10.2。」

**合计（按逐行判定后定稿）**：机制档 **109 处**（逐字 76 + 按形 33）+ 需求档 **26 处** = **135 处**；另有「已判非」登记 10 组（§2.10.1 与 §2.10.2-c 末）。

### 2.11 轮次 2 修正轮（`advisor#28` · 四条 🟡 + 一条 🔵 全收 · 2026-10-19）

| # | 号 → 改动 :行 → 改后（逐字要点） |
|---|---|
| 1 🟡 | `:365` 的现文改为盘上逐字（`DOC-DISCIPLINE.md:691` = 「**复核读数（域 = `docs/**/design/**` 非归档 + 提示词两面）**…」），改后写死「提示词面」（原记「运行面」句 = 与盘上不符，落笔为空操作）。`:363`（`:683`）补处置同行后半「提示词运行期面第 6 条」⇒「提示词面第 6 条」；「正本面 = 已落」一条删——其对象（CN 镜像）随 R5 删档消失，两条同名后状态互斥（D8） |
| 2 🟡 | AC1 两处（`:236` / `:458`）改为与交付物同粒度：**逐字 76 处**逐字在册；**按形 33 处**给形名 + 逐行坐标（形 = 判据 F1–F7 / G1–G2，落笔轮不自定）——不再要求「每处逐字、改写式不作替代」 |
| 3 🟡 | `:226` 删「建议同改，最终由主 agent 定」⇒「**处置已定 = 改该行**」，与 `:170` / `:251` 三处同口径（§2.10.3 第 6 条括注同轮去掉旧措辞） |
| 4 🟡 | 复算逐档表（复算依据见下）：CORE-UNIFICATION 34→**36**（`:302` 已在 A13 随动，不重计）· ADVISOR-CONVERGENCE **5**（坐标取齐：`:48` = 轮次镜像状态，已判非）· AGENT-LOOP-UPSTREAM 2→**1**（`:265` 已由 §2.5 覆盖）· 需求档 21→**26** · `:402` 6 行 / 6 坐标（`:530` 判不改、`:199`/`:900`/`:949` 判已判非，均剔除）· `:441` 8→**9 处**（1 + 1 + 1 + 6）。**算式**：41 + 1 + 36 + 3 + 1 + 6 + 8 + 5 + 2 + 2 + 1 + 1 + 1 + 1 = **109**（逐字 76 + 按形 33）；109 + 26 = **135** = 定稿 = AC1 |
| 5 🔵 | `:100` / `:445` 的「唯一读数处」⇒「**读数口径出处** = `PROMPT-SYSTEM.md:310`」，并注同档 `:18` / `:20` / `:153` 同为 53 档读数（盘上不成立的说法不留） |

**复算依据（实读）**：`ADVISOR-CONVERGENCE.md:48` = 「每 runAgent 起始重置镜像状态」（轮次语义，非提示词面）；`AGENT-LOOP-UPSTREAM.md:199` = 「两面不重叠」（工具面）· `:900` = 「两面载荷」（载荷面）· `:949` = 「提醒文案（两面…）」（载荷面）——三行均非提示词面，§2.10.1 该档判定列本已如此记，§2.10.2 的清单与它不符，本轮按判定列取齐。**合计口径**：一处只登一次（§2.3 A 组 / §2.5 B 组已覆盖者不重计）。

### 2.12 落笔轮 · `CORE-UNIFICATION.md` 单档（eng-designer 自落，2026-10-19）

**范围**：本档一档（1006 行 → 1002 行，Δ−4）；A13（1 + 随动 18）+ §2.10.2-b 新补 36 处，逐处处置如下。**未改其他档**（并行笔）。

**(a) A13 19 处（全部落地）**（原行号 → 改后要点）：`:12` 整行删 · `:31` 删中文设计档半句，改「两产品提示词面 40 档（迁移期读数）；唯一副本 = 核内 `prompts/` 16 档」· `:40` 删 CN 15 档对与镜像读数，改「提示词面读数 = 核内 16 档」· `:45` B19 ② 改「唯一副本 = `thincoder-core/prompts/`；`docs/` 下不含提示词档」· `:68` 树行删 `core/design/prompts/` 元素 · `:69` 整行删 · `:80` 改「运行期面 = 唯一面」+ tool-docs 53 档（口径出处 `PROMPT-SYSTEM.md:310`）· `:173` 删「+ 中文设计档 15 对」· `:266` 归属段删「文档面」值，取值四值 · `:302` 删「中文设计档行 = 两端 …」· `:409` 删 CN 对元素 · `:417` 删两处 CN 限定句 · `:420` 删尾句「中文设计档不在建核面」· `:516` 整行删 · `:536` 已撤面项改「两产品提示词档的删除（旧档已归档 `_archive/`）」（按 W5/W8 同规：不携带连续子串）· `:585` 改「提示词唯一副本 = 核内 `prompts/`」· `:586` 整行删 · `:953` T-C8 改「`docs/**` 下 `prompts/` 目录数 = 0 核」+ S3 收口 53 在位 · `:485` D-C14 整条退场，原地留「提示词唯一副本 = `thincoder-core/prompts/`；`docs/` 层不含提示词档」。

**(b) 新补 36 处：改 24 · 已判非 12**（逐处见下表；形 = G1「整句删」/ G2「删 CN 对元素 + 计数同轮重算」）

| 坐标（原行号） | 形 | 处置 |
|---|---|---|
| `:282` `:494` `:517` `:584` `:589` `:680`（逐字 6） | 逐字 | 全改：`:282` 删「/ 中文设计档」· `:494` D-C14 名改「提示词单副本」· `:517` 改「核内落地（单副本）」· `:584` D14 删 CN 分支 · `:589` 改「保留的一致面 = 无（单副本）」· `:680` 改「提示词面指令集（三档 EN）」 |
| `:593` | 按形 | 改「对外命令接口不变」（删「与设计→实现流程」） |
| `:242` `:252` `:297` `:303` `:408` `:410` `:412` `:415` `:416` `:610` `:642` `:947`（G2 12） | G2 | 全改；计数同轮重算：行集 **185 → 170**（`107 + 63`；`:252` / `:412` / `:268` 三处）· 逐字节同组 **39 → 29** · S0a 席位 **48/51 → 36/39** · S0b **71 → 68** · `:408` / `:410` 删 CN 对元素与 `12` 读数 |
| `:400` `:401` `:402` `:403` `:404`（G1 5） | G1 | 全改：删「中文设计档不在建核面 / 不并入 / 不动——文档面 / 合流归属层 = 根仓」各限定句；`:401` 删「15 镜像对」 |
| `:5` `:27` `:36` `:94` `:418` `:419`（G1 6） | — | **已判非**（token 命中指别物：板块镜像 / `.md` ∥ `.mjs` 两面 / 镜像度量工具 / 两份断言 / 定性复核 / 结构性对称判据）——无提示词双份制陈述可删 |
| `:306` `:790` `:812` `:813` `:915` `:918`（清单 6） | — | **已判非**（「镜像融合」= 产品镜像；「两面」= src/dest 门禁面 / 断言覆盖面） |
| `:530` | — | **不改**（§2.10.2 已判「历史动作记录」；今在 `:527`） |

**(c) 读数**：① 全档 token 族扫（1002 行，逐行 node 扫）：`中文设计档` **1**（= `:527` 度量脚本历史行，批档已判不改）· `中文设计文档` / `中文正本` / `提示词正本` / `正本` / `精确翻译` / `设计→实现` / `落地档` / `翻译回写` / `design/prompts` 均 **0** · `两面` 5（`:26` `.md`∥`.mjs` · `:808`/`:809` src/dest · `:911`/`:914` 断言面）· `两份` 1（`:92` 两份断言）· `文档面` 2（`:331` 文档面轮 · `:776` #53 锚）· `镜像` 8（`:5`/`:35`/`:39`/`:44`/`:304`/`:786` 他义；`:483`/`:492` = 裁定名「2026-10-18 取消镜像裁定」）· `双语` 1（`:658` UI）· `双源` 2（`:514`/`:515` 产品测试档名）。② `doc_check(mode:"gate", docs=["docs/core/design/CORE-UNIFICATION.md"])` → **`DOC-CHECK GATE: PASS`（0 条命中 / 1 档全清）**。③ 行数 1006 → 1002（§2.7 预计 Δ−22 未达，实测 −4：本档只做单面陈述改写与 3 行删除 + 1 处合并）。

**(d) 本档残留（未改，非本批清单内——待主 agent 裁）**：`thincoder-core/tool-docs/` 的 **48 档**旧读数仍存 9 处（`:64` · `:84` · `:94` · `:475` · `:480` · `:482` · `:503` · `:524` · `:948`）；本批按 A13 改后文本把 `:80` / `:402` / `:953` 三处定为 **53 档**（目录实存读数）⇒ 本档现 53 与 48 并存。统一为 53 属另一处收正，不属本批枚举。

### 2.12 R4 落笔轮（本组 12 档 · 2026-10-19）

**笔域**：`docs/core/design/**` 12 档，逐处按 §2.3 / §2.5 / §2.6 / §2.10.2-b 的「现文 → 改后」落笔；未改 `PROMPT-SYSTEM.md`（#30）· `CORE-UNIFICATION.md`（#31）· 提示词 · 需求档 · 本档 §3 / §5。

**逐处读数（档 → 处数 → 掉盘要点）**

| 档 | 处 | 要点 |
|---|---|---|
| `DOC-DISCIPLINE.md` | 12 | `:36` 改指 EN 同名档 · `:68` 改指 EN `common.md` · `:74` 删「两份 / CN `:42`」 · `:228-229` 整段删（零改核验项，对象随 R5 消失） · `:266` 删 CN 半句 · `:681` 删「+ 提示词 … 第 6 条」半句 · `:683` 删「正本面 = 已落」条、同行「运行期面」⇒「提示词面」 · `:691`「提示词两面」⇒「提示词面」 · `:1559` 删 CN 半 · `:1854`（原 `:1856`）删「CN 正本 + 」 · `:1895`（原 `:1897`）DD-32 整行删 |
| `DOC-SYSTEM.md` | 14 | `:79` 树行删（A22） · `:121` 行保留、去向改「无去向（整族退场）」 · `:143` P4 改「提示词 = 产品代码」 · `:152` / `:154` 改「`_archive/` 下的提示词档」 · `:174` N-d 改「提示词不建第二处」 · `:269` ③ 改单面 · `:272-276` 修法 1 改「引用清扫（属 R5）」 · `:301-308` §10.3 改「只落 EN 一面」（表 2 行 ⇒ 1 行） · `:326` 整行删 · `:327` 改「两池判据句（coder 落笔）/ eng-coder」 · `:343` 决策 8 改单面 · `:355` A1 行改「提示词面无文档面档」 · `:388` 「含中文模板」⇒「`thincoder-core/prompts/**`，产品代码面」 |
| `AGENT-LOOP-UPSTREAM.md` | 1 | `:620`「两份纪律」⇒「落笔纪律」（删「+ 中文设计文档的对位文本」） |
| `BATCH-RECORD.md` | 7 | `:460` 节题「两份同步」⇒「EN 单份」 · `:468` 删「（CN ∥ EN 两份）」 · `:494` 守护句删「两份」 · `:565` A12 落点「两份（同名两档）」⇒ 单档 EN · `:569` 节题改「提示词面」 · `:571` 整行删（§2.5 在册） · `:578`「提示词两份面（拷贝…）」⇒「提示词面（…）」 |
| `LIGHT-CHANNEL.md` | 8 | `:146` 「两份 × 两模式 = 4 档」⇒「EN × 两模式 = 2 档」 · `:152` 行改「（EN 单份）」· `:179` / `:180` / `:181` 删「两份」 · `:194` 依赖条整句删 · `:209` K7 整行删 · `:216` K14「（两份）」⇒「（EN）」 |
| `ADVISOR-CONVERGENCE.md` | 5 | `:75` 「两份 = 运行期 EN ⊗ CN」⇒「单份 = 运行期 EN」 · `:207` 口径对象改「提示词面（`thincoder-core/prompts/`）」 · `:163`（F3）删「两份同文」与 CN 句、留 EN 句 · `:203` 删「双语孪生 / EN 孪生」措辞 · `:214`「活行 4 = 2 句 × 两份」⇒「活行 2 = 2 句」 · `:48` 判不改（实读 = 轮次重置镜像状态，他义） |
| `DOC-MIGRATION.md` | 2 | `:507` 随动面 ① 改「落笔 = EN 一档」、④ 改「eng-coder 独笔」 · `:517` AC-5 改「提示词 EN 落」 |
| `TESTING.md` | 2 | `:128` 「两副本 / 对端两份」⇒「（EN）/ 对端两文件」 · `:256`「（两份）」⇒「（EN）」 |
| `AGENT-LOOP.md` | 1 | `:334`「提示词正本 `prompts/…`」⇒「提示词 `thincoder-core/prompts/…`」 |
| `LEDGER-SELF-CONTAINED.md` | 1 | `:189` 归属句改「提示词 = 产品代码——内容依据 = 机制文档，落笔 = eng-coder 独笔」 |
| `PORTABILITY.md` | 1 | `:230` D12 尾句改「内容依据 = 机制文档，落笔 = eng-coder 独笔」 |
| `AGENT-LOOP-SUBAGENT.md` | 1 | `:679`「（persona ∥ 中文正本）」⇒「（`thincoder-core/prompts/`）」 |

**合计 = 55 处**（派单写「31 处」；等于表列各档「显式 + 行数」相加 = 51，实落 55，差额 4 = `DOC-SYSTEM.md` 两处分行处置（`:326` / `:327`）+ `BATCH-RECORD.md:571` 按 §2.5 增补 1 + 段落级处置按 1 计）。

**token 族扫读数（node 逐档逐行；族 = 中文正本 / 中文设计档 / 中文设计文档 / 中文提示词 / 提示词正本 / 正本面 / 两份 / 双语 / 精确翻译 / 设计→实现 / 中文镜像 / 落地档 / CN 正本 / CN 面 / 运行期面 + 字面 `design/prompts`）**

| 档 | 命中 | 判定 |
|---|---|---|
| `PORTABILITY.md` | **0** | 零残留 |
| `BATCH-RECORD.md` | 1 | `:571`「一并写入该端中文镜像」——清单未列，见残清单 |
| `DOC-DISCIPLINE.md` | 4 | `:15`（D1/A12）本派单未含；`:516` / `:1241` / `:1876` 判非（核内落点 / 占位集 / 夹具类目） |
| `DOC-SYSTEM.md` | 2 | `:120` / `:271` 为设计许可的路径字面（迁移行 / 清扫判据句） |
| `AGENT-LOOP-UPSTREAM.md` | 21 | 20 行 = §2.5 在册、本派单未含；`:1207` 判非（工具档无中文镜像之事实句） |
| `LIGHT-CHANNEL.md` | 7 | `:150` / `:151` / `:162` / `:166` / `:167` = §2.5 在册、本派单未含；`:180` / `:181` 的「落地档」= 实施轮落地档，同义沿用 |
| `ADVISOR-CONVERGENCE.md` | 19 | 除本派单 5 处外，余 = §2.5 在册（`:162` / `:176` / `:178` / `:179` / `:197` / `:199` / `:201` / `:210` / `:220-223` / `:233` / `:342` / `:381` / `:401` / `:402` / `:409` / `:419`） |
| `DOC-MIGRATION.md` | 9 | 8 行 = §2.5 在册（含 W8 归档位）；余 1 = 历史动作记录 |
| `TESTING.md` | 2 | `:11` = §2.5 在册未含；`:598` 判非（本轮不纳入多语言面） |
| `AGENT-LOOP.md` | 1 | `:41` 判非（两端两份能力 = 实现面） |
| `LEDGER-SELF-CONTAINED.md` | 1 | `:187`「normal 纪律档中文镜像（两端）」——清单未列，见残清单 |
| `AGENT-LOOP-SUBAGENT.md` | 2 | `:254` 判非（enum 值）；`:471`「中英两份流程面」——清单未列，见残清单 |

**doc_check gate（12 档，mode=gate，`docs` 显式列）**：首行 `DOC-CHECK GATE: PASS`——0 条命中（12 档全清，声明域 212 档）。

**两处与设计的偏离（已落，报评审）**

1. `DOC-SYSTEM.md` §11 行 8：设计给「198（实测）/ 见 R3」，落盘写 `—` / `—`——依据 = 用户 2026-10-15 裁定取消设计 / 需求档行数两列（`DOC-DISCIPLINE.md:223`「形态 = 该两列填 `—`，行保留」），用户令 > 设计草稿。
2. `BATCH-RECORD.md:571` 整行删——派单 6 处未含该行，§2.5 B 组在册（「两端 … 中文权威镜像，与英文产品源同名集合相等」⇒ 整行删）。

**残清单（清单未列、本派单未改，待父侧裁）**：`BATCH-RECORD.md:571`「一并写入该端中文镜像」· `LEDGER-SELF-CONTAINED.md:186-187`「normal 纪律档（产品源 + 对端）/ 中文镜像（两端）」· `AGENT-LOOP-SUBAGENT.md:471`「中英两份流程面」——三处均为双份制陈述但不在 §2.5 / §2.10.1 / §2.10.2 任何清单内，改法涉及语义（删或改指），不自行定形。

### 2.12 落笔轮（本档 `PROMPT-SYSTEM.md` 实落 · 2026-10-19）

**范围**：只改 `docs/core/design/PROMPT-SYSTEM.md` 一档（并行他人改他档）。落三张表属本档的行：§2.3 A1–A8 · §2.5 B 组 29 行 · §2.10.2-a 新补 41 处；另含 A4 的 §8.2 整节删与 A8 的 §2.2 整节删（其后节号顺移：§2.3→§2.2、§2.4→§2.3）。

**读数**：本档 958 行 → **881 行**（Δ −77）。三张表凡属本档的行已落；逐字行照 §2.10.2-a 右列，形行照 F1–F7 判据。

**token 族扫（改后 · 行号）**：`中文正本` 0 · `中文设计档` 0 · `中文设计文档` 0 · `CN 正本` 0 · `设计→实现` 0 · `翻译回写` 0 · `精确翻译` 0 · `两份` 2（`:516` 台账行数「±0 行（CN ∥ EN）」· `:836` D-PS37 标题「四处落点 × 两份」）· `两面` 6（`:398` `:414` `:421` `:440` `:443` `:561` 均「`##` 块计数随正（两面）」型计数句）· **`§8.2` 残留 21 行（死指针，见下）**。

**同轮处置的两处表外一致性修正（consistency surface · 逐条在册）**：① `:7` 机制面导航行与 §6.1 标题里的「设计文档 → 代码落地流程」框架词（A1/A6 的直接后果，不改则与新定位自相矛盾）；② `:113` §5 指针行删两条指向本批在 `CORE-UNIFICATION.md` 已被删除行的指针（`中文设计档（文档面 · 基准层正本）` / `中文设计档（删除 · 作废）`）。

**未落 / 上抛（交父侧裁）**：
1. **`§8.2` 死指针 21 行**——A4 令 §8.2 整节删，而本档 19 处「§8.2 行 N 随正（当前读数唯一处 = §8.2）」型读数指针 + D-PS27 + D-PS39/D-PS40 仍指向该节。**本席未改**（属表外内容，且改法涉及计数句重编号——按「不得顺手重编号表外内容」暂留），请示：随 R5 一并清，或另立小批重定读数面。
2. **`两面` 6 行**（`:398` `:414` `:421` `:440` `:443` `:561`）与 **`两份` 2 行**（`:516` `:836`）——均为计数/落点行的措辞残留，非表列行；同属表外，未落。
3. 原 §6.1 `:152` 行顶部「**内容权 = 主 agent**」句随 A6 改后被新句替换（新句写明「父侧改提示词 = 走产品代码」）；若需保留「内容权 = 主 agent」的强表述，需父侧裁一句并回填。

**机检**：`doc_check(mode:"gate", docs=["docs/core/design/PROMPT-SYSTEM.md"])` = `DOC-CHECK GATE: PASS`（0 条命中，1 档全清）。

### 2.11 R4 补漏轮 · §2.5 原行落笔（4 档 39 行，2026-10-19）

依据 = §2.5 B 组表（`:180`–`:207`）+ 表头四形（`:173`–`:178`）。`#32` 只落 §2.10.2 新补行，§2.5 原行未做；本笔补完下列 4 档。落笔前逐行实读（坐标未漂）。

**`design/ADVISOR-CONVERGENCE.md`（19 行）**

| 行 | 改后要点 | 形 |
|---|---|---|
| :162 | 「四处提示词末句（运行期 + 中文正本）」⇒「两处提示词末句（EN 运行面）」；删两处 CN 路径 + 节名 | F1 |
| :176 | 删「两份同文（N5），不得两说」与 CN 半句 | F3 |
| :178 | 删 `+ 中文正本 … 同节同位（:41 之后）` | F1 |
| :179 | 删「与中文正本 … §评审纪律（:118 起）」与「（两处同文）」 | F1 |
| :197 | 删「提示词面 `docs/core/design/prompts/persona-engineering.md`」 | F4 |
| :199 | 删「中文正本 … 同节（「自修（最多 5 轮修正）」）」 | F1 |
| :201 | 删「（与中文正本 … :48 同文——两份同文）」 | F3 |
| :210 | 命令 1 删第二目录 `docs/core/design/prompts`、删「· 两份」 | F1 |
| :220/:221 | P3 / P4 两行整行删（纯 CN 落点登记） | F4 |
| :222/:223 | P5 / P6 删 CN 坐标列项（含 CN 逐字引文） | F1 |
| :233 | 假阳登记删 CN 半 `advisor-design.md:21` | F4 |
| :341–342 | 「四个纪律档副本——运行期…；中文正本…（发起/裁决/轮次）——」⇒「两档运行期提示词——…；就地…」 | F1 |
| :381 | 纪律改指 `docs/core/requirements/TESTING.md` §2 | M（改指机制档） |
| :401/:402/:409/:419 | 删 CN 半 + 「双侧在盘」⇒「（EN 在盘）」 | F1 |

**`design/AGENT-LOOP-UPSTREAM.md`（10 行）**

| 行 | 改后要点 | 形 |
|---|---|---|
| :216/:217 | 表行 13 / 14（纯 CN 档 + 行数）整行删；表注「行 11–14」⇒「行 11–12」（同轮两处：`:219` 表注、`:236` §6.27.8 标题） | F4 + D3 |
| :265 | ② CN 设计文档段整段删（含其围栏正文，避留孤栏） | F1/F3 |
| :284 | 保留 EN 单侧 `discipline-engineering.md` | F1 |
| :653 | 删第二目录 `docs/core/design/prompts` | F1 |
| :667 | 删「+ 模板 `docs/core/design/prompts/common.md`」 | F1 |
| :1227 | ③ 接收侧 · CN 权威面 整段删 | F4 |
| :1243 | ⑤ 报告惯例 · CN 权威面 整段删 | F4 |
| :1250 | 「两份 1:1 对照」整行删（③/⑤ 已删 ⇒ 死指） | F4 随动 |
| :1259/:1261 | 表行 4 / 6（纯 CN 档 + 行数）整行删 | F4 |

**`design/DOC-MIGRATION.md`（9 行）**

| 行 | 改后要点 | 形 |
|---|---|---|
| :6 | 「不含 `design/prompts/`」⇒「不含 `_archive/` 下的提示词档」 | W8 |
| :97 | 删括注「提示词正本已归 `docs/core/design/prompts/`」 | W8 |
| :264/:270 | 迁移表 VSC / CLI 行：源写「`design/` 下的提示词档」、的写「`_archive/` 下的提示词档」 | W8 |
| :333 | 建归档根：`design/`（其下 `prompts/`） | W8 |
| :367 | 边界同名集合：「`_archive/` 下的提示词档 15 档」 | W8 |
| :376 | 「`docs/core/design/prompts/**` 与两产品镜像均为对象外」⇒「`thincoder-core/prompts/**` 为对象外」 | F1 |
| :484 | 正本 ∥ 落地镜像 ⇒「`thincoder-core/prompts/discipline-engineering.md`（唯一副本）；规则详述 = `DOC-DISCIPLINE.md`「按域分界」节」 | M（改指） |
| :336 | **按表不改**（历史动作记录；含 `_archive/` 前缀，R5 收窄后不命中） | — |

**`design/TESTING.md`（1 行）**：`:11` 删尾句「CN 正本 = `docs/core/design/prompts/` 同名两档」——F1。

**读数**：4 档 token 族扫（`中文正本 / 中文设计档 / 中文设计文档 / 提示词正本 / 两份 / CN 正本 / design/prompts`）：`design/prompts` 仅剩 `DOC-MIGRATION.md:336`（按表不改，带 `_archive/` 前缀）；`两份` 剩 9 处全在 `AGENT-LOOP-UPSTREAM.md`（`:1154 / :1161 / :1162 / :1185 / :1244 / :1255 / :1275 / :1276 / :1278`）——**均属双面制表述、未列入 §2.5 行集，本席未动，如实上报**；`ADVISOR-CONVERGENCE.md` 剩 `:163`「同文（N5）」为同一残留（未列）。

**gate**：`DOC-CHECK GATE: PASS（4 档全清，0 命中）`。

### R4 第三笔 · 收尾单点（2026-10-19）

**覆盖条目**：§2.5 表内单点 + §2.6 A12 + `#32` 上抛三处残句——10 档 14 处。行号按内容定位（前几笔改过同档，坐标已漂）。

| 档:行 | 改后 | 形 |
|---|---|---|
| `design/VERIFY-REDESIGN.md:67` | 提示词 = `thincoder-core/prompts/**`（唯一副本；本档只留机制边界，D2） | F2 |
| `design/BASH-EXECUTOR-FACE.md:149` | 需求档面（`docs/core/requirements/**`；提示词 = `thincoder-core/prompts/**`，注入值本身除外） | F1 |
| `design/DOC-CODE-RECONCILE.md:218` | 规则详述 = `LEDGER-SELF-CONTAINED.md` §5.2；提示词面 = EN 同名档（各实现面原文自持） | F1 + 改指机制档 |
| `design/STRUCTURE-DEBT.md:39` | 铁律②改指 `requirements/ENGINEERING-MODE-V2.md` §8 五条铁律 + 提示词面 EN | 改指机制档 |
| `design/AGENT-LOOP-ASYNC-POOL.md:195` | 提示词面 = `thincoder-core/prompts/advisor-*.md`（唯一副本） | F2 |
| `design/LIGHT-CHANNEL.md:150` · `:151` | 档指改 EN（`thincoder-core/prompts/…（EN）`），删「（CN 正本）」 | F1 |
| `design/LIGHT-CHANNEL.md:162` · `:166` · `:167` | 删 `docs/core/design/prompts/…` 括注，留条款名与实质描述 | F4 |
| `design/DOC-DISCIPLINE.md:15`（D1） | 提示词 = **产品代码面** ⇒ 唯一作者 = **eng-coder**（内容依据 = 机制文档） | A12 |
| `design/AGENT-LOOP-SUBAGENT.md:471` | 「中英两份流程面」⇒「提示词面（`thincoder-core/prompts/`）」 | F3 |
| `design/LEDGER-SELF-CONTAINED.md:186–187` | 合为「normal 纪律档（`thincoder-core/prompts/`）」，删「中文镜像（两端）」行 | F3 + F4 |
| `design/BATCH-RECORD.md:571`（原「端特有段处置」行） | 整行删（镜像机制无对象） | F4 |

**与派单给定文本的偏差（依据在先）**

1. `VERIFY-REDESIGN.md:67`：§2.5 行的「（唯一副本；测试纪律机制 = `requirements/TESTING.md` §2，D2）」未照抄——同句前半已写「见 `requirements/TESTING.md` §2 F1–F4」，照抄即同节重复引；按派单要点落「（唯一副本；本档只留机制边界，D2）」。
2. `DOC-DISCIPLINE.md:15`：A12 行末「无第二支笔；「笔域越权」概念作废（2026-10-18 23:01 裁定）」未落——「概念作废」属 D8 禁止的挂尸式否定陈述；「唯一作者 = eng-coder」已表达单笔域。
3. `DOC-CODE-RECONCILE.md:218`：派单写「规则详述 = `DOC-DISCIPLINE.md`「自持」节」——实核该档无「自持」节（标题 grep 零命中），改指实存节 `design/LEDGER-SELF-CONTAINED.md` §5.2「新节「文档与台账自持」」。
4. `STRUCTURE-DEBT.md:39`：同因——`design/ENGINEERING-MODE-V2.md` 全文无「铁律」字样，改指实存节 `requirements/ENGINEERING-MODE-V2.md` §8「五条铁律」。

**token 族扫（改动后实测）**：`VERIFY-REDESIGN` 0 · `BASH-EXECUTOR-FACE` 0 · `DOC-CODE-RECONCILE` 0 · `STRUCTURE-DEBT` 0 · `AGENT-LOOP-ASYNC-POOL` 4（全他义：`:141` 两面 = 机读线 / 事件、`:314` 运行期面、`:1111` / `:1124` 窗 ∥ 闩两面）· `LIGHT-CHANNEL` 2（`:180` / `:181`「落地档」= 实施轮落地档）· `DOC-DISCIPLINE` 5（`:487` / `:1241` / `:1530` / `:1876` 他义；`:516` 见残留）· `AGENT-LOOP-SUBAGENT` 1（`:254`「无双语 marker」= 判非）· `LEDGER-SELF-CONTAINED` 3（`:73` 两面分列、`:205` 三值齐备 = 他义；`:184` 见残留）· `BATCH-RECORD` 1（`:571` 见残留）。

**未列入本笔、仍属双面制 / 失效概念的残留（报告不动，待父侧处置）**

- `design/LEDGER-SELF-CONTAINED.md:184`：§5.6 落点表第 2 行「工程纪律档（中文权威镜像）」——镜像档无对象。
- `design/BATCH-RECORD.md:571`：「跨仓节引用处置」仍写「逐项入镜像差异表」「另一侧不变」。
- `design/DOC-DISCIPLINE.md:516`：扫账登记行含「设计文档与代码两份」——被登记对象已删。
- `design/AGENT-LOOP-SUBAGENT.md:412` · `:475` · `:514` · `:550`：「内容权 = 主 agent / 内容权归主 agent」——A12 已定内容依据 = 机制文档、唯一作者 = eng-coder。
- `design/LIGHT-CHANNEL.md:152`：「同两行（EN 单份）」行在本笔把 `:150` / `:151` 改 EN 后与两行重复（重复登记行）。
- `design/AGENT-LOOP-ASYNC-POOL.md:197`：「逐字定稿——中文稿；提示词层英文定稿」仍为双份措辞。

**验收**：逐处见上表；token 族扫见上；`doc_check gate` = PASS（本会话 10 档全清，0 命中）；残留 6 条已逐条报出。

**边界**：只动本笔 10 档的 14 处；提示词 / 需求档 / 代码 / 批档 §3 · §5 零触。

### 2.14 R4 补漏轮 · §2.5 B 组原始行集执行（6 档 · 2026-10-19）

**范围**：§2.5 表中属本组 6 档的 **20 行**，逐行落笔（`ANCHOR-DEBT-REPAIR` 6 · `DESIGN-TOKEN-SETTLEMENT` 3 · `ENG-TOKEN-BINDING` 2 · `LEDGER` 2 · `MANIFEST` 5 · `TOOLS` 2）。未改其他档 / 需求档 / 提示词 / 本档 §3 / §5。

**坐标核验（落笔前逐行实扫）**：20 个坐标与 §2.5 写时坐标**完全一致**（`design/prompts` 字面在 6 档内命中 = 20 行，行号逐一相同），本轮无坐标改判。

| 档 | 行（写时 = 实读） | 形 | 改后要点 |
|---|---|---|---|
| ANCHOR-DEBT-REPAIR | 146 · 157 · 158 | F4 | 三行整行删（`prompts/advisor-round2.md` / `advisor-design.md` / `advisor-round3.md` 的行数·锚数登记行） |
| 同上 | 230 | 逐字 | 行宽射程行改「`thincoder-core/prompts/**`（唯一副本）不在扫描域内（行宽只扫 `docs/`）」；依据列「见 §8 发现 6」保留 |
| 同上 | 309 · 311 | 整行 / 整段删 | 「另轮（提示词面 2 行行宽 · 主 agent 处置）」表行 + 「写域口径（提示词副本…）」整段删（对象随 R5 消失） |
| DESIGN-TOKEN-SETTLEMENT | 171 · 203 · 234 | F4 | 三行删（「中文评审面」建议文本行 · 摘要表行 · 受影响文件清单第 7 行）；EN 行原位保留为落点 |
| ENG-TOKEN-BINDING | 98 | 改指 | 「（CN——`docs/core/design/prompts/advisor-design.md:55` 句内加固）」⇒「（EN——`thincoder-core/prompts/advisor-design.md`）」 |
| 同上 | 117 | F3 | 删 CN 半句「∥ CN 模板 …:51-53（同文口径）」+ 标签句「两源同文口径」⇒「提示词面既有逐字约定」 |
| LEDGER | 421 | F2 | 开局自查句：CN 档 + `:87` ⇒「`thincoder-core/prompts/persona-engineering.md` 对应节」；「（同档 `:88`）」⇒「（同档对应节）」 |
| 同上 | 424 | F2 | 勘察证据行同法删 CN 坐标、改指 EN 同名档对应节 |
| MANIFEST | 176 | F4 | 整行删（`design/prompts/persona-engineering.md` ｜ 165 ｜ 修改） |
| 同上 | 567 | F1 | E 段改「「项目状态档」段（`thincoder-core/prompts/persona-engineering.md`，唯一副本）按新模型改写。」（删「英文代码落地副本」） |
| 同上 | 634 | F1 | ② 管理面单元格删 CN 档与「英文落地副本（同义）」，只留 EN 唯一副本 |
| 同上 | 649 | 改指 | 「（`docs/core/design/prompts/common.md:48`…）」⇒「（`thincoder-core/prompts/common.md`…）」（行号随删） |
| 同上 | 689 | F4 | 整行删（CN 档 219 行 · eng-designer 笔域登记行） |
| TOOLS | 692 | F1 | 删「，正本同句 = `docs/core/design/prompts/discipline-engineering.md` 同节同位 · `persona-engineering.md:67`」 |
| 同上 | 703 | 逐字 | 「双副本链路承 D-C14（先改正本 → 回写落地档）。落档 = 主 agent 笔面（提示词 = 主 agent 内容权）。」⇒「提示词 = 产品代码（`thincoder-core/prompts/`，eng-coder 笔）。」 |

**D3 随动（删除行的直接后果，同轮改）**：`DESIGN-TOKEN-SETTLEMENT` 受影响文件清单原 7/8/9/10 ⇒ 删第 7 行后 8→7、9→8、10→9；`MANIFEST` §2.10 受影响文件表原 1/2/3/4/5 ⇒ 删第 2 行后 3→2、4→3、5→4。

**一处按形偏离（报评审）**：`DESIGN-TOKEN-SETTLEMENT` 三处 §2.5 记「F4 + 改指 EN」，但 EN 行（原 `:172`）已承载同一「在飞令牌取回」句——照「改指」落笔会产出两条同句行。执行取 = **删 CN 三行、EN 行原位不动**（落点即 EN，无重复）；若评审判须字面出现 EN 指针，三行可从 git 复原改判。

**token 族扫读数**（node 逐档逐行；族 = `中文正本` / `中文设计档` / `中文设计文档` / `中文提示词` / `提示词正本` / `正本面` / `两面` / `两份` / `CN 正本` / `CN 面` / `设计→实现` / `精确翻译` / `翻译回写` / `运行期面` / `落地档` / `双语` / `两源` / `双副本` / 字面 `design/prompts`）：

| 档 | 命中 | 判定 |
|---|---|---|
| ANCHOR-DEBT-REPAIR | 两面 4（`:178` `:207` `:256` `:263`） | 全为锚类两面 + `design/prompts` **0**（与 §2.10.1 判定一致） |
| DESIGN-TOKEN-SETTLEMENT | 两面 3（`:76-78` 端差面）· 运行期面 1（`:202` EN 行） | `design/prompts` **0**；两面为已判非 |
| ENG-TOKEN-BINDING | 两源 1（`:94`，见下表） | `design/prompts` **0** |
| LEDGER | 两面 3 · 两份 1 · 两源 6 | 全为他义（两臂 / `.mjs` 两份 / 收口两源）；`design/prompts` **0** |
| MANIFEST | 两面 1 · 两份 2 · 精确翻译 1（`:176`，见下表） | `design/prompts` **0** |
| TOOLS | 两面 1 · 两份 1 · 运行期面 4 · 落地档 4 · 双语 1 | `design/prompts` **0**；落地档 4 行为下表未列入项 |

**行数（node 内容行，不含末尾空行）**：ANCHOR 364（Δ−6）· DESIGN-TOKEN 262（−3）· ENG-TOKEN 209（0）· LEDGER 897（0）· MANIFEST 865（−2）· TOOLS 1552（0）——Δ 与删除行数逐档相符。

**未列入但仍是双面制 / 悬空的行（逐条报出，本轮未改）**

| 档:行 | 现文要点 | 为何未改 |
|---|---|---|
| `ANCHOR-DEBT-REPAIR.md:194` | 「提示词面归主 agent（§8 发现 6）」 | 落笔权 / 归属陈述与单面制相抵 | 
| 同上 `:208` | 「行宽 3 行 … 机械 1 行 + 提示词 2 行（主 agent 另轮）」 | 指向已删的「另轮」行 |
| 同上 `:314`（AC-2） | 「`FAIL(行宽)` = 2（提示词面另轮；若主 agent 同批落则 0）」 | 同上；改它等于改验收读数，待父侧裁 |
| 同上 `:362`（§8 发现 6） | 「设计面副档超宽 2 行 vs 落地副档超宽 23 行」「实测两副本」 | 双副本陈述，无路径字面；§2.10.1 按「两面 4 已判非」未入册 |
| `ENG-TOKEN-BINDING.md:94` | 「**b. 评审员系统提示两源**（同文口径——EN 运行期 ∥ CN 模板逐字对应）」 | 「两源 / CN 模板」不在 token 族内，任何清单未列 |
| 同上 `:98` | 已按 §2.5 改指 EN，但句身仍是中文译句 | 落点改写后中文句无归属；随 R5 删档整行去留待裁 |
| `MANIFEST.md:176`（原 `:177`） | 「英文代码（精确翻译）**落地副本**同义落地」 | 与 CN 行同族但 §2.5 只列 CN 行；「落地副本」措辞预设正本 |
| `TOOLS.md:689` | 「…逐字固化；落档 = 主 agent 笔面」 | 笔域陈述与 A12 / D1 相抵 |
| 同上 `:694` `:697` `:700` | 「现行（**正本·中文**）」「建议（**正本·中文**）」 | 正本 / 落地两面并列，§2.5 只列 `:692` `:703` |
| 同上 `:695` `:698` `:701` | 「现行（**核内落地档·英文**）」「建议（核内落地档·英文）」 | 同上；`:692` 改后仍留「核内运行期落地档」措辞（§2.5 只令删「正本同句」半） |
| 同上 `:699` | 「`persona-engineering.md:67` 正本 / `:68` 核内」 | 正本 / 核内对位 |
| 同上 `:1143` | 「逐字文本面归主 agent 内容权、eng-coder 落笔」 | 笔域陈述（提示词面） |

**gate**：`doc_check(mode:"gate")` 首跑 `ERROR（多项目工作区：请指名 target）`——我未传 target 的回执，指名 `d:\teamcode\thincoder` 后复跑 = **`DOC-CHECK GATE: PASS`（6 档全清 · 0 命中 · 声明域 212 档）**。

### 2.11 收正笔 · §8.2 死指针 21 行 + 双面残留两族（2026-10-19 · eng-designer · 承 #30 上抛）

**病由**：A4 把 §8.2 整节删掉（复核对象 = 16 对，已不存在），但 21 行的括注 / 分句仍在指它——「当前读数唯一处 = §8.2」把读者指向一个不存在的节。R5 要删 CN 目录，这类句必须先收，否则死链成片。

**笔域**：`docs/core/design/PROMPT-SYSTEM.md` 单档（881 行不变——25 处全是行内改）。只动三族：§8.2 引用 21 行 · 「两面」5 行 · 「两份」2 行。

**处置口径**：括注 / 分句整段删（连同分隔符），该行其余内容逐字不动；编号列表里删一项即顺编（①②④ 的断号会被读成「丢了一项」）。不改指别的节——那会编造一组不存在的对应关系。「两面」按句义选：括注位改「单份」，状语位直接删。

| 处置形 | 行 | 改后 |
|---|---|---|
| 删「——§8.2 行 5 随正」尾句 | :136 :137 :722 :742 | 「标题节点 22 ⇒ 23」「23 ⇒ 24」等读数留着，指向删掉 |
| 删整项 ②，其后顺编 | :376 :420 :508 :591 :727 :748 | 计数连带余项连续编号 |
| 删整项 ③ / ④，其后顺编 | :464 :528 :616 | 同上（:616 删末项 ④，三项收口） |
| 删括注内 §8.2 分句、保留前半 | :398 :440 :489 :767 :838 :839 | 「`##` 块计数随正」「标题节点 24 不变」「（标题节点 22 ⇒ 23）」 |
| 删「§8.2 行 7 尾列」定位语 | :455 :826 | 「「段」口径定形 = 标题段」独立可读 |
| 「两面」→「单份」 | :398 :421 :443 | `##` 块计数随正（单份）∥（单份不变） |
| 「两面」状语直删 | :414 :440 | 删「——两面」∥「两面」 |
| 「两份」→「一份」 | :516 :836 | 「提示词一份」∥「四处落点 × 一份」 |

**验收读数（本轮实测）**：`§8.2` 命中 **0**（改前 21 行）· 「两面」余 **1**（`:561` = 两开关，别义，未动）· 「两份」余 **0** · 行数 **881**（改前 881）· `DOC-CHECK GATE: PASS`（显式 1 档，0 命中）。

**知会（未处置，不在本单三族内）**：本档仍有双面制残留句——`CN ∥ EN` 2 行（`:455` `:464`）· 「按本节设计于实施轮落笔」6 行（`:809` `:830` `:836` `:838` `:839` `:840`）· 「+3/面」1 行（`:464`）、「EN 代码」4 行（`:378` `:614` `:725` `:746`）· `docRoot.design` 1 行（`:851`）。按本单笔域未动，处置归父侧裁量。

### 2.13 R4 收尾轮 · `#34` 报出的 11 条（AGENT-LOOP-UPSTREAM 9 · ADVISOR-CONVERGENCE 2 · 2026-10-19）

**范围**：只改这两档的这 11 处。改法 = 删双面制框架词（`两份` / `1:1` / `各随其份` / 无对位对象的 `同文`），**句子本来的执行含义保留**——11 处全部行内替换，无整句删、无行增删。未改提示词 / 需求档 / 代码 / 本档 §3 §5。

| # | 档:行 | 改前（要点） | 改后 |
|---|---|---|---|
| 1 | `AGENT-LOOP-UPSTREAM.md:1154` | 标识逐字固定（两处同形——不受两份语言约定影响）。 | 标识逐字固定（两处同形）。 |
| 2 | `:1161` | ② **接收侧（两份）** | ② **接收侧** |
| 3 | `:1162` | ③ **报告惯例（两份）** | ③ **报告惯例** |
| 4 | `:1185` | §6.33.4 标题「…本档只出文本。两份 = CN 设计文档 ∥ EN 代码——语义 1:1、语言各随其份；标识逐字两处同形」 | 「…本档只出文本；标识逐字两处同形」 |
| 5 | `:1244` | U-UM7 输入列「三处落笔 + 两份」 | 「三处落笔」 |
| 6 | `:1255` | A-UM3「提示词面三处（含两份对位）落盘 + 语义 1:1（§6.33.4 对照句）」 | 「提示词面三处落盘 + 语义一致（对照 §6.33.4 逐字）」 |
| 7 | `:1275` | D-UM3 落点 = `common.md`（两份） | 落点 = `common.md` |
| 8 | `:1276` | D-UM4 落点 = `subagent-base.md`（两份） | 落点 = `subagent-base.md` |
| 9 | `:1278` | D-UM6「标识逐字 …、两面同形」+ 理由「不受「两份语言各随其份」约定影响」 | 「标识逐字 …、逐字固定」+ 理由「不随语言变」 |
| 10 | `ADVISOR-CONVERGENCE.md:163` | **同文（N5）**：末句 = en `No round cap …` | **落点（N5）**：末句 = en `No round cap …` |
| 11 | `:75` | 单份 = 运行期 EN，同文口径 | 单份 = 运行期 EN，口径 = 该单份逐字 |

**token 扫读数（改后 · grep 逐行）**

- `AGENT-LOOP-UPSTREAM.md`：`两份` **0** · `各随其份` **0** · `同文` **0**；`1:1` 1（`:953`「本节引文与代码字节 1:1」= 设计↔代码单源核对，非双面）· `两面` 9（`:199` 工具面互补对偶 · `:880` `:929` `:953` `:956` `:1078` `:1114` = A 面文案 ∥ B 面载荷 · `:906` `:1118` `:1148` = 「同改 / 重复编辑」字样）——均非提示词双面。
- `ADVISOR-CONVERGENCE.md`：`两份` **0** · `1:1` **0** · `各随其份` **0**；`同文` **1**（`:335`，见残留）。

**gate**：`doc_check(mode:"gate", target:"d:\teamcode\thincoder", docs=[两档])` ⇒ `DOC-CHECK GATE: PASS`（0 条命中 / 2 档全清）。

**残留（未改，交父侧裁）**：`ADVISOR-CONVERGENCE.md:335`「链行节点（**四面同文插入**）」——「四面」= 旧双面制读数（两产品 × 运行期 ∥ 正本），单面制下无对位对象。不在本派单 11 条内，且改法涉及「落几处」的口径（一处 ∥ 一处 + 机制档对应节），不自行定形。

### R4 第四笔 · 收 `#36` 报的 6 条残留（2026-10-19 · 父侧逐条裁定）

**范围**：6 处 / 5 档（`LIGHT-CHANNEL.md:152` 判为重复登记行 ⇒ 删行）；坐标落笔前逐处实读。未改提示词 / 需求档 / 代码 / 本档 §3 · §5。

| # | 档:行 | 改后（逐字要点） | 依据 |
|---|---|---|---|
| 1 | `design/LEDGER-SELF-CONTAINED.md:184` | `\| 2 \| 工程纪律档 \| 同上（该镜像档若无勘察 checklist 段则不含 §5.4）· 新节（§5.3） \|` —— 删「（中文权威镜像）」 | 镜像已退场 |
| 2 | `design/BATCH-RECORD.md:571` | 「…**逐项登记**；一致性检查对**带注记的引用行豁免**（不报、不入基线）。该豁免为 VSC 侧独有语义。」—— 删「镜像差异表」与「（另一侧不变）」，其余处置语义保留 | 双侧框架无对象 |
| 3 | `design/DOC-DISCIPLINE.md:516` | 登记行第 3 项「设计文档与代码两份」⇒「设计文档与提示词（单份）」 | 被登记对象已单份 |
| 4 | `design/AGENT-LOOP-SUBAGENT.md:412 · :475 · :514 · :550` | 四处「内容权（= 归 / 在）主 agent」⇒「内容依据 = 机制文档，落笔 = eng-coder」（非删句） | 父侧裁：该独立权利不保留 |
| 5 | `design/LIGHT-CHANNEL.md:152` | 整行删（`\| 同两行（EN 单份） \| … \| 同位 \| 既有节内增列 \|`） | 重复登记，判据见下 |
| 6 | `design/AGENT-LOOP-ASYNC-POOL.md:197` | 「（逐字定稿——**提示词层 `thincoder-core/prompts/`**）」 | 双份措辞退场 |

**#5 重复判定 = 重复 ⇒ 删**：` :150` / `:151` 两行已各自承载一份完整落点（档 + 节 + 形态）；`:152` 三格全部由前两行推出（文件同、节 =「同位」、形态 =「既有节内增列」），零新增信息；且与节头 `:146`「落点（EN × 两模式 = **2 档**）」的计数相抵（该行使表成 3 行）。删后 2 行 = 2 档，计数自洽（D3）。

**token 族扫（node 逐档逐行；族 = 中文权威镜像 / 镜像差异表 / 另一侧 / 设计文档与代码两份 / 内容权 / 中文稿 / 英文定稿 / EN 单份 / 中文正本 / 中文设计档 / 中文设计文档 / 中文提示词 / 提示词正本 / 正本面 / 两份 / 双份 / 两面 / 精确翻译 / 设计→实现 / 翻译回写 / CN 正本 / CN 面 / 双语 / `design/prompts`）**：

| 档 | 本笔 6 项 | 其余命中 |
|---|---|---|
| LEDGER-SELF-CONTAINED | **0** | 另一侧 1（`:48` 跨仓台账引用例 = 他义）· 两面 1（`:73` 写门 / 文档侧两列）· 内容权 1（`:222`「不写提示词实体（内容权归主 agent）」） |
| BATCH-RECORD | **0** | EN 单份 1（`:460` 前笔所改）· 内容权 2（`:512` · `:620`） |
| DOC-DISCIPLINE | **0** | 两面 2（`:487` · `:1530` 两档面）· 内容权 3（`:365` · `:614` · `:693`） |
| AGENT-LOOP-SUBAGENT | **0** | 双语 1（`:254` enum）· 双份 1（`:676` 描述面双份字面 = D2 他义） |
| LIGHT-CHANNEL | **0** | 内容权 1（`:139`） |
| AGENT-LOOP-ASYNC-POOL | **0** | 两面 3（`:141` 机读线 / 块面 · `:1111` 窗 ∥ 闩 · `:1124` 窗两面）· 内容权 5（`:404` · `:418` · `:754` · `:857` · `:1089`——均「内容权威 = 父侧」他义或工具描述面） |

**`内容权` 同族残留 12 处（未改 —— 派单未列，禁止越界）**：`LEDGER-SELF-CONTAINED.md:222` · `BATCH-RECORD.md:512` · `:620` · `DOC-DISCIPLINE.md:365` · `:614` · `:693` · `LIGHT-CHANNEL.md:139` · `AGENT-LOOP-ASYNC-POOL.md:404` · `:418` · `:754` · `:857` · `:1089`。同裁（该独立权利不保留）已下，此 12 处仍按旧口径成文 —— 需父侧决定是否并批收。

**一处偏离（报父侧）**：#6 派单文本为「提示词层（`thincoder-core/prompts/`）」，落盘去掉内层括号写作「提示词层 `thincoder-core/prompts/`」——同一语义（外层括号已包住整句），避免括号套括号。若须逐字，可复原。

**未决（上抛）**：`LEDGER-SELF-CONTAINED.md:184` 按令只删限定词后，同格动作列仍留「该镜像档若无勘察 checklist 段则不含 §5.4」——「该镜像档」已无对象；且本行现与第 1 行标签同为「工程纪律档」。派单「不许整句删」，本席未动该括注。处置建议（择一）：① 删该括注；② 整行删（其对象随镜像退场）。

**机检**：`doc_check(mode:"gate", target=d:\teamcode\thincoder, docs=6 档)` → `DOC-CHECK GATE: PASS`（0 条命中 / 6 档全清 / 声明域 212 档）。

### 2.16 收尾单点 · `ADVISOR-CONVERGENCE.md:335`（`#38` 报的最后残句 · 2026-10-19）

**范围**：本档一行（`:335`），行内一词。「（**四面同文插入**）」⇒「（**两档同文插入**）」。不改其他档 / 提示词 / 需求档 / 代码 / 本档 §3 §5。

**定形依据（实读）**：

1. 同节 `:339` 已写死落点 = 「**两档运行期提示词**——`thincoder-core/prompts/discipline-normal.md` §Review discipline ∥ `thincoder-core/prompts/persona-engineering.md` §Review convergence」⇒ 本行括注讲的是这同一组落点的插入要求，单位 = **档**，不是「端」。
2. 「四面」= 旧双面制读数（两个提示词档 ×（运行期 ∥ 中文正本））：前一轮记录（本档 §2 表内 `:341–342` 行）的改前原句即「四个纪律档副本」，改后 = 「两档运行期提示词」。单面制下只剩运行期 = **两档**。
3. **与派单给定两形均不同，报依据**：派单两候选都写「两端（CLI / VSC）」；实读本档全档 **「两端」= 0**，而落点单位由 `:339` 写死为「档」。单面制下 `thincoder-core/prompts/` 只有一份副本、被两产品共同加载，写「两端插入」会陈述一条已不存在的按产品落点。故取本档自己的词「两档」。
4. 「同文」保留：它在本行有真对位对象（两档逐字同文），不是 §2.13 所清的「无对位对象的同文」。

**读数（改后实测 · node 逐行扫）**：`四面` **0**（改前 1 = `:335`）· `同文` **1**（`:335`，判义 = 两档同文，保留）· `两份` 0 · `1:1` 0 · `各随其份` 0 · `两端` 0 · 行数 421（不变）。

**gate**：`doc_check(mode:"gate", target:"d:\teamcode\thincoder", docs=["docs/core/design/ADVISOR-CONVERGENCE.md"])` ⇒ `DOC-CHECK GATE: PASS`（0 条命中 / 1 档全清 / 声明域 212 档）。

### 2.15 收正笔 · 尾两处 `CN ∥ EN`（`#37` 报 · 2026-10-19 · eng-designer）

**病由**：双份制改单面制后，`CN ∥ EN` 仍是「两面并存」的形态符号——留着它，读者会去找并不存在的 CN 那一面。

**笔域**：`docs/core/design/PROMPT-SYSTEM.md` 单档两行（`:455` `:464`），行内改，行号与行数零变。

**处置口径**：两处 `CN ∥ EN` 都是并列项本体（不是连接别的并列项的连接词），删去后句子自足；不留 `∥` 孤悬。

| 行 | 改前 | 改后 |
|---|---|---|
| `:455` | 复算 = **17/17 全配对**（CN ∥ EN 逐段对位零孤段） | 复算 = **17/17 全配对**（逐段对位零孤段） |
| `:464` | ② `persona-eng-designer.md` 换写 **±0 行**（CN ∥ EN） | ② `persona-eng-designer.md` 换写 **±0 行** |

**验收读数（本轮实测）**：`CN ∥ EN` 命中 **0**（无空变体 `CN∥EN` = 0 · `CN ∥` = 0）· 文件行数不变（`\n` 计数 880，改前同读数；read 工具报 881 属末行换行计法差）· 两行行宽 175 / 151 字符（阈值 300）· `DOC-CHECK GATE: PASS`（显式 1 档，0 命中）。

**知会（未处置，超出本单两行）**：同族双面并列仍在 4 处——`:455` ⑦（`CN `:38` ∥ `:51` ∥ EN `:38` ∥ `:51`` = 两面对位坐标）· `:528`（`行数 CN **218** ∥ EN **216**；`##` 块 **17 ∥ 17**`）· `:593` / `:618`（`CN 新行守行宽 ≤300 ∥ EN 档不在行宽机检域`）。处置归父侧裁量。

### R4 清残余笔 · `#35` 报的 12 条（4 档 · 2026-10-19）

**范围**：`#35` 如实报出、本派单未含的 12 条（父侧裁定全收）。四档：`ANCHOR-DEBT-REPAIR.md` 4 · `ENG-TOKEN-BINDING.md` 1 · `MANIFEST.md` 1 · `TOOLS.md` 6（`TOOLS` 系含 `:692` 一句）。未改其他档 / 提示词 / 需求档 / 代码 / 本档 §3 · §5。

| # | 档:行（改后行号） | 改后 |
|---|---|---|
| 1 | `ANCHOR-DEBT-REPAIR.md:194` | 「提示词面 = 产品代码面 ⇒ 落笔 = eng-coder（内容依据 = 机制文档）」 |
| 2 | `:208` | 子批 D 行改「行宽 1 行 \| 1 \| 1 \| 机械 1 行（`ENG-TOKEN-BINDING.md:147` 折行）」——删「提示词 2 行（主 agent 另轮）」项，条数 / 档数同轮 3→1 / 2→1（D3） |
| 3 | `:314` AC-2 | 「行宽：`FAIL(行宽)` = **0**（域内机械 1 行随子批 D 折行；提示词档不属本档修复面）」 |
| 4 | `:362` 发现 6 | 「**提示词面行宽超宽**：`thincoder-core/prompts/` 16 档中单行 >300 字符者 **259** 行（最长 1486 字符 = `persona-engineering.md:100`）\| 实测提示词面（单副本…）\| 落笔 = eng-coder…折行」 |
| 5 | `ENG-TOKEN-BINDING.md:94` | 「**b. 评审员系统提示**（`thincoder-core/prompts/`，单源）：」（`:98` 句身未动，留 R5 整行裁） |
| 6 | `MANIFEST.md:176` | 第 4 列改「提示词 = 产品代码（单副本）」——该行另承载「档 + 161 行 + 修改 + ±~11」，故不整行删（派单给了这一分支） |
| 7 | `TOOLS.md:689` | 「落档 = eng-coder（内容依据 = 机制文档）」 |
| 8 | `:692` | 「三撞点 = 提示词面（`thincoder-core/prompts/`）的 `discipline-engineering.md` …」 |
| 9 | `:694`–`:698`（①②③） | 删三处「（正本·中文）」整句（CN 引文行）+「建议（正本·中文）」行；EN 行改标签「现行（EN）」「建议（EN）」；③ 括注「`:67` 正本 / `:68` 核内」⇒「`:68`」 |
| 10 | `:1143`（改后 `:1140`） | 「逐字文本面落笔 = eng-coder（内容依据 = 机制文档）」 |
| 11 | `ANCHOR-DEBT-REPAIR.md:8` | 「行宽 3 行同欠」⇒「行宽 1 行同欠」（#2 的直接后果，D3 同轮） |

**与派单文本的偏离（依据在先，可一行回改）**

1. **`:208` 未整行删**：D 行同时承载「机械 1 行」（有效规则，§4 行宽面 + L4 行「见 Q3 子批 D」+ §2 时序行都指它）。整行删会删掉一条活规则并留三处悬空指针——与派单自身「不得把承载规则的整句删掉」相抵。取 = 删「提示词 2 行（主 agent 另轮）」一项、条数 / 档数同轮重算。
2. **AC-2 读数 2 ⇒ 0**：该 2 全部来自提示词面 2 行（对象已删）。按「对象已删 ⇒ 该项消失」取 0；若父侧意为保留历史读数 2，可回改。
3. **发现 6 的读数重测**：原记「落地副档超宽 23 行（最大 981 字符）」= 旧读数；实测（阈值 300 = `checkConfig.lineWidth`）`thincoder-core/prompts/` 16 档中 **259** 行超宽、最长 **1486**（`persona-engineering.md:100`）。按实测落数。

**读数**：四档 token 扫（`正本·中文` / `核内落地档·英文` / `两源` / `精确翻译`）= 各 **0**（改前 3 / 3 / 1 / 1）。行数：ANCHOR 365（不变）· ENG-TOKEN 210（不变）· MANIFEST 866（不变）· TOOLS 1553 → **1551**（−2：三行 CN 引文 / 一建议行删、EN 标签并回一行）。gate：首跑 `REFUSED`（`TOOLS.md:694` 343 字符 = 我自己合并出的长行）⇒ 折行 ⇒ 复跑 `DOC-CHECK GATE: PASS`（显式 4 档 · 0 命中 · 指名 target = `d:\teamcode\thincoder`）。

**仍属双面制 / 未列入本单的残留（只报不改）**：`ENG-TOKEN-BINDING.md:145`「提示词档（`advisor-design.md` EN/CN）…（如需同句加固 = 主 agent 内容权）」· `TOOLS.md:1119`「工具描述（英文提示词 = 代码：内容权归主 agent、落笔归 eng-coder）」· `TOOLS.md:1368`「（英文运行期面——内容权主 agent，eng-coder 落笔）」——三处均不在本派单 12 条内，改法涉语义（归属句），留父侧裁。

### R4 第五笔 · 收 `#39` 报的 12 处「内容权」+ 1 处遗留（2026-10-19 · 父侧逐条裁定）

**范围**：5 档 13 处（`内容权` 12 行 = 13 个 token，`DOC-DISCIPLINE.md:365` 行内 2 个）+ `LEDGER-SELF-CONTAINED.md:184` 整行删。落笔前逐处实读。未改第六档 `AGENT-LOOP-SUBAGENT.md`（前笔已零）· 提示词 / 需求档 / 代码 / 本档 §3 §5 零触。

| # | 档:行（改后行号） | 改后（逐字要点） |
|---|---|---|
| 1 | `LEDGER-SELF-CONTAINED.md:221` | 「不写提示词实体（内容依据 = 机制文档，落笔 = eng-coder）」 |
| 2 | `BATCH-RECORD.md:512` | 「②③ = 纪律句，落点 = 提示词面（内容依据 = 机制文档，落笔 = eng-coder）」 |
| 3 | `BATCH-RECORD.md:620` | 「2. 不写提示词实体（内容依据 = 机制文档，落笔 = eng-coder）」 |
| 4 | `DOC-DISCIPLINE.md:365`（行内 2 token） | 标签「**内容权边界**」⇒「**内容边界**」；「…实质上变更 = 主 agent 内容权，不属本条」⇒「…实质变更不属本条（内容依据 = 机制文档，落笔 = eng-coder）」 |
| 5 | `DOC-DISCIPLINE.md:614` | 「产品代码 / 主 agent 内容权」⇒「产品代码，内容依据 = 机制文档，落笔 = eng-coder」 |
| 6 | `DOC-DISCIPLINE.md:693` | 「提示词正文（内容权 = 主 agent）」⇒「提示词正文（内容依据 = 机制文档，落笔 = eng-coder）」 |
| 7 | `LIGHT-CHANNEL.md:139` | 「（落笔 = 实施轮；内容权 = 主 agent）」⇒「（落笔 = 实施轮 · eng-coder；内容依据 = 机制文档）」 |
| 8 | `AGENT-LOOP-ASYNC-POOL.md:404` | 「**逐字文本 = 父侧定稿（内容权威）**」⇒「**逐字文本 = 机制文档定稿（落笔 = eng-coder）**」 |
| 9 | `:418` | 「**逐字文本 = 父侧定稿**（内容权威）」⇒「**逐字文本 = 机制文档定稿**（落笔 = eng-coder）」 |
| 10 | `:754` | 「**逐字文本 = 父侧定稿**（内容权威——D-TW8 同口径…）」⇒「**逐字文本 = 机制文档定稿**（D-TW8 同口径…落 = 实施轮 · eng-coder）」 |
| 11 | `:857` | 「内容权威 = 父侧，本设计给合同与草稿位」⇒「内容依据 = 机制文档，落笔 = eng-coder，本设计给合同与草稿位」 |
| 12 | `:1089` | 首格「候父侧（内容权——只登记）」⇒「候定稿（内容依据 = 机制文档——只登记）」；尾格「逐字 = 父侧定稿」⇒「逐字 = 机制文档定稿」 |

**B · `LEDGER-SELF-CONTAINED.md:184` 整行删**：`| 2 | 工程纪律档 | 同上（该镜像档若无勘察 checklist 段则不含 §5.4）· 新节（§5.3） |` —— 对象（镜像档）随单面制退场 + 标签与第 1 行重复（D8）。§5.6 表 4 行 ⇒ 3 行；该表上下无计数句或档数陈述，无需随动（D3）。

**三处偏离（按裁定的同一口径落，报父侧）**

1. 第 8–11 处盘上原文是「内容权威 = 父侧 / 父侧定稿（内容权威）」，不是「内容权 = 主 agent」的逐字形——但同在父侧裁定的 12 个坐标内，且「独立权利不保留」同指该授权面（父侧直笔定文本），故同形收；「父侧定稿」⇒「机制文档定稿」（内容的定稿位 = 机制文档，即本设计节，经评审 + 批准后由 coder 落）。
2. 第 12 处尾格「逐字 = 父侧定稿」在同行第三格——只改首格会让该行自相矛盾（首格说内容依据 = 机制文档、尾格说父侧定稿），故同轮改；仍在父侧点名的 `:1089` 这一行内。
3. 第 4 处的标签「**内容权边界**」本身携 token——只改后半句则 `内容权` 计数不为零，故标签同改「**内容边界**」（语义 = 内容归属边界，句子其余不动）。

**读数（改后实测 · node 逐档逐行）**

- `内容权`：`LEDGER-SELF-CONTAINED` **0** · `BATCH-RECORD` **0** · `DOC-DISCIPLINE` **0** · `LIGHT-CHANNEL` **0** · `AGENT-LOOP-ASYNC-POOL` **0** · `AGENT-LOOP-SUBAGENT` **0**（改前 = 0，前笔已收）——六档合计 **0**。
- 行数：`LEDGER-SELF-CONTAINED` 225 ⇒ 224（整行删 1）· 其余 4 档行数零变。
- `LEDGER-SELF-CONTAINED.md` §5.6 # 列现为 `1 / 3–4 / 5–6`（槽位 2 的对象退场）——按裁定只删行、未重编号；是否重编为 `1 / 2–3 / 4`，请父侧裁（重编号 = 改编号语义，不在本派单）。
- 同族残留（未改 · 无 `内容权` token，不在 12 处内）：`AGENT-LOOP-ASYNC-POOL.md:420`「**逐字文本 = 父侧定稿**（候落）」。

**机检**：`doc_check(mode:"gate", target:"d:\\teamcode\\thincoder", docs=5 档)` ⇒ `DOC-CHECK GATE: PASS`（0 条命中 / 5 档全清 / 声明域 212 档）。

**边界**：只动上述 5 档 13 处；第六档与提示词 / 需求档 / 代码 / 本档 §3 §5 零触。

### 收正笔 · 本档 `CN ∥ EN` 同族四处（`#41` 尾轮 · 2026-10-19 · eng-designer）

**范围**：`docs/core/design/PROMPT-SYSTEM.md` 四处（`:455` ⑦ · `:528` · `:593` · `:618`）——`CN ∥ EN` 并列 = 旧双面制直接残留（父侧裁定同轮收）。逐处判 CN 半句是否承载未落地待办 ⇒ **均无**（CN 半 = 坐标 / 读数 / 检查项三类；CN 档 = R5 删除对象，非在办）。

| 行 | 改前 | 改后 |
|---|---|---|
| `:455` ⑦ | （CN :38 ∥ :51 ∥ EN :38 ∥ :51；弃 1:1 基数、保内核、补关系句） | （EN :38 ∥ :51；弃 1:1 基数、保内核、补关系句） |
| `:528` | 行数 CN **218** ∥ EN **216**；`##` 块 **17 ∥ 17** | 行数 EN **236**；`##` 块 **17** |
| `:593` | CN 新行守行宽 ≤300（实施轮落地时核）∥ EN 档不在行宽机检域 | 提示词档不在行宽机检域 |
| `:618` | CN 新行守行宽 ≤300 ∥ EN 档不在行宽机检域 | 提示词档不在行宽机检域 |

**`:528` 连带的读数陈旧校正**：`persona-engineering.md` 实测 **236** 行（`node` `\n` 计数）/ `##` 块 **17**；档载 216 = §6.23 写后又被后续批增行（`git log` 实证 `236b1af0` / `e02abfd3`）——按 §6.23「当前读数唯一处」就地校正。

**读数**：① 同行含 `CN` 且含 `EN` 的行 = **0**（改前 4）；② `CN…∥…EN` 并列形 = **0**；③ 本档 880 行（`node` `\n` 计数）；④ `DOC-CHECK GATE: PASS`（显式 1 档 · 0 命中）。

**范围外观察（未动、不入台账）**：仅含 `CN` 不含 `EN` 的单面读数句尚存 15 行（`:305` `:323` `:342` `:359` `:374` `:400` `:423` `:442` `:466` `:491` `:510` `:530` `:729` `:750` `:772`）——非并列形，不在本批四处；`docs/core/design/prompts/` 实测仍在盘（R5 未执行），故其读数当前尚有对象。

### R4 收尾笔 · `#40` 报的最后 3 处「内容权」（2026-10-19 · eng-designer）

**范围**：两档三处（派单定）。改词不删句；`ENG-TOKEN-BINDING.md:145` 删 `EN/CN` 并列、留 EN 半句（EN 半句独立可读：`advisor-design.md` 即 `thincoder-core/prompts/advisor-design.md`）。未改其他档 / 提示词 / 需求档 / 代码 / 本档 §3 · §5。

| # | 档:行 | 改前（逐字要点） | 改后（逐字要点） |
|---|---|---|---|
| 1 | `ENG-TOKEN-BINDING.md:145` | 提示词档（`advisor-design.md` EN/CN）既有「pass ⇒ 才回显」句已言明耦合——**零改**（如需同句加固 = 主 agent 内容权）。 | 提示词档（`advisor-design.md` EN）既有「pass ⇒ 才回显」句已言明耦合——**零改**（如需同句加固 ⇒ 内容依据 = 机制文档）。 |
| 2 | `TOOLS.md:1119` | 工具描述（**英文提示词 = 代码**：内容权归主 agent、落笔归 eng-coder——保存面内容点：…） | 工具描述（**产品代码 · `thincoder-core/tool-docs/`**：内容依据 = 机制文档、落笔 = eng-coder——保存面内容点：…） |
| 3 | `TOOLS.md:1368` | #### ⑥ 工具描述建议文本（英文运行期面——内容权主 agent，eng-coder 落笔） | #### ⑥ 工具描述建议文本（提示词面——内容依据 = 机制文档，落笔 = eng-coder） |

**读数（改后实测 · node 逐档逐行）**

- `内容权`：`ENG-TOKEN-BINDING` **0**（改前 1）· `TOOLS` **5**（改前 7；派单 3 处内的 2 处已清，余见下「上抛」）。
- 行宽：`ENG-TOKEN-BINDING:145` = 81 · `TOOLS:1119` = 237 · `TOOLS:1368` = 49（阈值 300；`:1119` 另属表行豁免）。
- 行数：`TOOLS.md` 1551（不变）· `ENG-TOKEN-BINDING.md` 210（不变）——三处全为行内替换。

**两处与派单文本的偏离（依据在先，可一行回改）**

1. `TOOLS.md:1119`：派单给「提示词 = 产品代码（`thincoder-core/prompts/`）」，而该行对象 = `thincoder-core/tool-docs/ssh.md`——照抄会把读者指到另一目录（提示词档 ∥ 工具描述档两个面）。落「**产品代码 · `thincoder-core/tool-docs/`**」，面与路径同行自洽。
2. `ENG-TOKEN-BINDING.md:145`：派单形「= 内容依据 = 机制文档」在一句内会产生两个等号（原句连接词已是 `=`），读作链式相等。连接词改 `⇒`，内容短语逐字保留。

**上抛（`[上抛·待裁]`）**：验收②「两档 `内容权` = 0」按事实不可达——`TOOLS.md` 余 5 处同在派单三处之外：`:313`（工具描述 = 提示词面，内容权归主 agent）· `:1067`（工具描述英文面——内容权主 agent / 落笔 eng-coder）= 同形旧口径；`:705` / `:707` / `:735`（`AUTO_TURN_DIGEST_DOMAIN` 常量注「内容权 = 父侧」）= 他机制。已发 `ask`（我的倾向：续收 `:313` / `:1067`；`:705` / `:707` / `:735` 留父侧裁）。

**机检**：`doc_check(mode:"gate", target:"d:\teamcode\thincoder", docs=["docs/core/design/TOOLS.md", "docs/core/design/ENG-TOKEN-BINDING.md"])` ⇒ `DOC-CHECK GATE: PASS`（0 条命中 / 2 档全清 / 声明域 212 档）。

### 收正笔 · `#46` 报的 5 处「父侧定稿」（`AGENT-LOOP-ASYNC-POOL.md` · 2026-10-19 · eng-designer）

**依据**：父侧裁定同轮收——「父侧定稿」是「内容权 = 主 agent」的另一个说法；单面制下父侧的内容主张走机制文档这条链，不再是独立的定稿权利位。本档 `:418` / `:420` 已是「机制文档定稿」，本笔取齐。

**范围**：只改 `docs/core/design/AGENT-LOOP-ASYNC-POOL.md` 五处，逐字替换 `父侧定稿` ⇒ `机制文档定稿`（改词不删句；行内替换，行数零变）。

| # | 行 | 改前（逐字要点） | 改后 |
|---|---|---|---|
| 1 | `:434`（D-TW8 行） | 见 §6.30.3；逐字 = 父侧定稿 | 见 §6.30.3；逐字 = 机制文档定稿 |
| 2 | `:776`（受影响文件清单） | 描述面四式（逐字 = 父侧定稿） | 描述面四式（逐字 = 机制文档定稿） |
| 3 | `:878`（上限与升级 · F-DA3） | 显式提醒（`pushReal`——机器线 + 人读线；逐字 = 父侧定稿） | 显式提醒（`pushReal`——机器线+人读线；逐字 = 机制文档定稿） |
| 4 | `:885`（升级提醒 · 可见面） | 措辞 = 父侧定稿 | 措辞 = 机制文档定稿 |
| 5 | `:903`（缺席支 · 6.31.7） | 同款异常提醒注入（…；逐字 = 父侧定稿） | 同款异常提醒注入（…；逐字 = 机制文档定稿） |

**`:878` 行宽连带**：替换后该行 **301** 字符（阈值 300，`checkConfig.lineWidth`）⇒ gate 首跑 `REFUSED`。处置 = 同行内 `机器线 + 人读线` 去两空格 ⇒ `机器线+人读线`（词义零变，301 → 299），复跑 PASS。

**读数**：`父侧定稿` **0**（改前 5 行 / 5 处，`grep` 逐行扫）· `机制文档定稿` 9 行（前笔 4 + 本笔 5）· 行数不变（1155）。

**机检**：`doc_check(mode:"gate", target:"d:\teamcode\thincoder", docs=["docs/core/design/AGENT-LOOP-ASYNC-POOL.md"])` ⇒ `DOC-CHECK GATE: PASS`（0 条命中 / 1 档全清 / 声明域 212 档）。

**边界**：只动本档五处 + `:878` 行宽一改；提示词 / 需求档 / 代码 / 他档 / 本档 §3 §5 零触。

**读数更正（同笔 · 计数笔误）**：`机制文档定稿` = **10 行**（`404` `418` `420` `434` `754` `776` `878` `885` `903` `1089`；前笔 5 + 本笔 5）——上行写「9 行（前笔 4）」系计错，以此行为准；`父侧定稿` = **0**、行数 1155、gate PASS 三项不变。

### 收尾单点 · `#45` 报的 `TOOLS.md` 五处「内容权」（2026-10-19 · eng-designer · 父侧裁定 5 处全收）

**笔域**：`docs/core/design/TOOLS.md` 五处，行内改词；句子不删（派单「改词不删句」）。未改其他档 / 提示词 / 需求档 / 代码 / 本档 §3 · §5。

**依据**：单面制下「父侧」不是独立的内容权利位——父侧的内容主张走「机制文档」这条链（同形改法已在 `TOOLS.md:689` / `:1140` · `ENG-TOKEN-BINDING.md:145` · `AGENT-LOOP-SUBAGENT.md` 四处落地）。不引入「定稿位」等新概念。

| # | 改前行号 | 改前（逐字片段） | 改后（逐字片段） | 改后行号 |
|---|---|---|---|---|
| 1 | `:313` | 提示词面，**内容权归主 agent**） | 提示词面，**内容依据 = 机制文档，落笔 = eng-coder**） | `:313`（句在此折行，续 `:314`） |
| 2 | `:705` | **变体文本内容权 = 父侧**——先例 = … | **变体文本内容依据 = 机制文档**——先例 = … | `:706` |
| 3 | `:707` | 注 = **内容权 = 父侧** + 出处指针 = … | 注 = **内容依据 = 机制文档** + 出处指针 = … | `:708` |
| 4 | `:735` | +8（平行导出 + 注——**内容权 = 父侧**）⇒ ≈420 | +8（平行导出 + 注——**内容依据 = 机制文档**）⇒ ≈420 | `:736` |
| 5 | `:1067` | 英文面——**内容权主 agent / 落笔 eng-coder**） | 英文面——**内容依据 = 机制文档 / 落笔 = eng-coder**） | `:1068` |

**行宽处置（一处）**：第 1 处改后整行 302 字符（阈值 300 = `checkConfig.lineWidth`；改前 287）。在该行既有子句边界（「）；」之后）折行，成 `:313`（171 字符）+ `:314`（131 字符），语义与渲染不变。全档行数 1551 → **1552**（仅此一处折行，其余四处行数零变）。

**读数（改后实测 · node 逐行扫 `docs/core/design/TOOLS.md`）**：`内容权` **0**（改前 5）· 四处未折行行宽 = 115 / 165 / 78 / 187（阈值 300）· 折行后 171 / 131 · `内容权威` 0 · 行数 1552。

**机检**：`doc_check(mode:"gate", target:"d:\teamcode\thincoder", docs=["docs/core/design/TOOLS.md"])` ⇒ **`DOC-CHECK GATE: PASS`**（0 条命中 / 1 档全清 / 声明域 212 档）。

**同族残留（未改 · 报父侧裁）**：第 2 处同行仍带先例括注「先例 = `UPSTREAM_TURN_DOMAIN` 注「Content authority = parent side」（`:706`）」——英文引文，不携 `内容权` token；但该括注原本只支撑「内容权 = 父侧」这一主张，现句前半已改为「内容依据 = 机制文档」，两者并置读作自相矛盾。删该括注 = 改句子所述内容（语义面），派单又令「改词不删句」，故未动。同源读法：代码侧 `thincoder-core/agent/helpers.mjs:454`（`AUTO_TURN_DIGEST_DOMAIN_ENG`）· `:461`（`UPSTREAM_TURN_DOMAIN`）· `:470`（`TIMER_TURN_DOMAIN`）三处注仍为 `Content authority = parent side`，与 `:708` 现文「注 = 内容依据 = 机制文档」分处两面——代码面不属本笔笔域，未动。

**边界**：只动本档五处；提示词 / 需求档 / 代码 / 本档 §3 · §5 零触。

### 收正笔 · `#44` 报的 15 行「仅 CN」单面读数（2026-10-19 · eng-designer）

**笔域**：`docs/core/design/PROMPT-SYSTEM.md` 单档 15 行（`:305` `:323` `:342` `:359` `:374` `:400` `:423` `:442` `:466` `:491` `:510` `:530` `:729` `:750` `:772`），全部行内片段删——行身不动、行号与行数不变（880 内容行）。未改其他档 / 提示词 / 需求档 / 代码 / 本档 §3 · §5。

**判义（逐行同一形，变体各异）**：15 行都是各 §6.N「机检」段尾的同一检查项——「CN 新行守行宽 ≤300」（变体携 `checkConfig.lineWidth` / 「CN 档在扫描域」/ 「新行 125 字符 ✓」）。判义 = **纯 CN 面检查项**：对象 = `docs/core/design/prompts/*.md`（R5 删除对象），句子本身不载规则——行宽值 = `PROJECT-MANIFEST.json` `checkConfig.lineWidth`（单源，D2），本档自身行宽由 gate 管。⇒ **片段级 F4：删该检查项**；行身 live 检查项（`prompt-refs-check.mjs` 复跑 / `##` 块计数 / 不新增断言）逐字保留。**整行删被否**：行身载规则。

| 行 | 删掉的片段（逐字） | 行身保留的 live 检查项 |
|---|---|---|
| `:305` | `；CN 新行守行宽 ≤300。` ⇒ `。` | 不新增断言 / 零文档引用 / 块计数无涉 |
| `:323` | 同上 | 同上（含块计数口径） |
| `:342` | 同上 | 同上 |
| `:374` | 同上 | 不新增断言 / 零文档引用 |
| `:400` | 同上 | 断言数 / 内容在场比对 |
| `:423` | `；CN 新行守行宽 ≤300；` ⇒ `；` | 零文档引用 / `##` 块计数 |
| `:491` | 同上 | 同上 |
| `:510` | 同上 | 同上 |
| `:729` | 同上 | 同上 |
| `:750` | 同上 | 同上 |
| `:772` | 同上 | 同上 + 三档块计数读数 |
| `:359` | `；CN 新行守行宽 ≤300（= 仓行宽闸值——manifest `checkConfig.lineWidth`）。` ⇒ `。` | 零文档引用 / 块计数随正（闸值本身住 manifest） |
| `:442` | `；CN 新行守行宽（`checkConfig.lineWidth` = 300——CN 档在扫描域；新行 125 字符 ✓）；` ⇒ `；` | 零文档引用；下一行 `:443` 的 EN 行宽披露句保留（EN 档不在扫描域仍真） |
| `:466` | `；CN 新行守行宽 ≤300（`checkConfig.lineWidth`）；` ⇒ `；` | 零文档引用 / 块计数 |
| `:530` | `；CN 新行守行宽 ≤300（`checkConfig.lineWidth`——本档与提示词档均在扫描域）；` ⇒ `；` | 零文档引用 / 块计数 —— 括注「提示词档均在扫描域」在单面制下为假（EN 档住 `thincoder-core/prompts/`，不在 `scanDirs = ["docs"]`），故整括注随删 |

**读数（改后实测 · node 逐行扫）**：`CN` token 全档 **0**（改前 15 行命中，逐行对位无余项）· `design/prompts` **1**（`:727`，见残留）· 行数 **880**（`\n` 计数，不变）· 行宽只减不增（未触发 300 闸）。

**残留（未改 · 不在本单 15 行内，待父侧裁）**：`:727` 计数连带 ② 「`docs/core/design/prompts/discipline-normal.md` 两处句内换写 ⇒ 零行数 / 零计数连带」——指 CN 提示词档的计数读数，但行内无 `CN` token（故 `#44` 的扫描未抓到），亦不在本单 15 行；处置涉语义（删该项 ∥ 改指 `thincoder-core/prompts/discipline-normal.md`），本席不自行定形。

**gate**：`doc_check(mode:"gate", target:"d:\teamcode\thincoder", docs=["docs/core/design/PROMPT-SYSTEM.md"])` ⇒ `DOC-CHECK GATE: PASS`（0 条命中 / 1 档全清 / 声明域 212 档）。

**边界**：零机械门 · 只删不增（无新语义）· 其余档与提示词 / 需求档 / 代码零触。

### R4 落笔笔 · `design/ENGINEERING-MODE-V2.md` A14 七处（2026-10-19 · eng-designer）

**范围**：单档 `docs/core/design/ENGINEERING-MODE-V2.md`。§2.3 A14 在册六处（`:72` · `:278` · `:297` · `:299` · `:448` · `:478`）+ 终扫另报的 `:23`（「设计→实现」）。改法 = 双面框架改单面（提示词 = 产品代码单源；规则本体 = 机制文档），**与 `requirements/ENGINEERING-MODE-V2.md` §8.4 现文同口径**。未改其他档 / 提示词 / 需求档 / 代码 / 本档 §3 · §5。

| 行（改前） | 改后 |
|---|---|
| `:23` E4 行 | 条目标签「提示词设计→实现流程」⇒「提示词单源承载」（其余五项不动） |
| `:72` M9 模块行 | 「M9 ｜ 提示词单源承载 ｜ `thincoder-core/prompts/`（16 档，唯一副本，运行期加载面——M9 落点读 manifest `promptsLanding`） ｜ 提示词 = 产品代码单源（只承载「怎么执行」）；规则本体 = 机制文档 ｜ §8.4」 |
| `:278` E4 M9 段 | 「**提示词 = 代码单源**（M9 落点，v2 §8.4）：『唯一副本 = `thincoder-core/prompts/`（机器执行物，只承载「怎么执行」）；规则的人读权威 = 中文机制文档（…——用中文因读者是中文用户，与提示词的性质无关）。更新流程 = 改规则 → 先改机制文档 → coder 依它改 `thincoder-core/prompts/` 对应档。无机检门（用户裁定）』」 |
| `:297` | 「**提示词承载**：唯一副本 = `thincoder-core/prompts/`（产品代码面，只承载「怎么执行」）；规则本体 = 机制文档——流程见设计层 `PROMPT-SYSTEM.md` §6.1。」 |
| `:299` | 该项改「M9 提示词单源承载（§6.1 收正——规则先落机制文档，coder 改 `thincoder-core/prompts/` 对应档）」，其余三项逐字不动 |
| `:448`（依赖表 M9 → 文件 行） | 整行删（无第二面可读 / 写） |
| `:478` → 现 `:477` KD5 | 「KD5 ｜ 提示词 = 代码单源（`thincoder-core/prompts/`）；规则的人读权威 = 中文机制文档 ｜ 用户裁定：不设机检；一致性由收口核对兜底」 |

**两处与 A14 在册文本的偏离（依据在先）**

1. `:72` 的「清理「方案选型对比」残留」格随删——**该清理已完成**：`thincoder-core/prompts/persona-eng-designer.md:71` 现文「candidate enumeration is no longer required (that discipline is retired)」，全档 `选型对比` 命中 0。留该格即造一条已办待办。
2. `:299` **未整项删**（在册令删）：该项是「变更点」清单的一项，其对象 M9 在需求档 §8.4 仍是现行裁定；整项删会让清单漏掉 M9 一条，与需求档自相矛盾。取 = 换措辞、保条目。

**读数（改后实测 · node 逐行）**：`中文正本` 0 · `中文设计档` 0 · `中文设计文档` 0 · `提示词正本` 0 · `正本面` 0 · `设计→实现` 0 · `设计 → 实现` 0 · `精确翻译` 0 · `翻译回写` 0 · `英文代码` 0 · `CN` 0 · `design/prompts` 0 · `两份` 1（`:481`「同一条规则两端各实现一次 = 两份矩阵」= 端侧矩阵他义）· `两面` 1（`:400`「TUI / ACP 两面共用一条」= 两个出口面他义）· 行数 525（改前 526，`:448` 一行删）。

**gate**：`doc_check(mode:"gate", target:"d:\teamcode\thincoder", docs=["docs/core/design/ENGINEERING-MODE-V2.md"])` ⇒ `DOC-CHECK GATE: PASS`（0 条命中 / 1 档全清 / 声明域 212 档）。

**同族残留（在册坐标外 · 只报不改，交父侧裁）**

| 档:行 | 现文要点 | 为何未动 |
|---|---|---|
| `ENGINEERING-MODE-V2.md:97` | 接线表 M9 行「零改（落地 `prompts/` = **生成物**，重生成不手改）」 | 「生成物 / 重生成」预设一个上游设计面（生成源），单面制下无对象；但「核 / CLI / VSC 零改」的判定属语义面，且不在 A14 七处内 |
| `ENGINEERING-MODE-V2.md:286` | E4.1 引言「设计层 `PROMPT-SYSTEM.md`（机制面 = **§6 设计文档 → 代码落地/装配** …）」 | 指另一档的节名；该节在 A1–A4 落笔后是否仍叫此名须实读 `PROMPT-SYSTEM.md` §6，本笔未核，改指会编造节名 |

### A15 / A20 执行笔 · 两档 6 处（2026-10-19）

**范围**：`docs/core/design/ARCHITECTURE.md`（A15）· `docs/core/design/TWO-REPO-MERGE.md`（A20）。这两处在 §2.6 在册但整个实施阶段从未派笔；终扫实测 `design/prompts` 字面命中 = A15 `:39` `:60` · A20 `:82` `:87`。逐行先读整句再改。未改提示词 / 需求档 / 代码 / 本档 §3 · §5。

**A15 · `ARCHITECTURE.md`（2 行，行内改，行数 199 不变）**

| 行 | 改后 |
|---|---|
| `:39` | `│   ├── core/{requirements,design}/ ← 统一面板块档`（删「+ `design/prompts/`（提示词中文正本 16 档）」） |
| `:60` | `│   ├── prompts/                    槽位提示词唯一副本（16 档）`（删「运行期落地档（16 档——正本 = `docs/core/design/prompts/`）」） |

**A20 · `TWO-REPO-MERGE.md`（5 处：改 4 删 2，行数 156 → 153）**

| 行（改后行号） | 改后 |
|---|---|
| `:80` | `## 4. 提示词承载（单源）` |
| `:82` | 现状结构：唯一副本 = `thincoder-core/prompts/`（16 档，运行期加载面，两产品共用）；两产品 `docs/` 下的提示词档（15 档 × 2）已归档到 `_archive/`（历史参照，不再维护）。 |
| `:87`（原 `:87` 整行删） | 产品内双源层行删——双源层无对象 |
| `:89` | **单副本必须住核包内（机械约束，非偏好）**：npm tarball 与 vsix 均只收包根之内……（句身逐字保留，见下「偏离 1」） |
| `:119` | `\| D14 \| 提示词 = **单副本**（`thincoder-core/prompts/`，运行期硬加载 ⇒ 副本须在包内） \| 承 2026-10-18 取消镜像裁定；打包边界见 §4 \|` |
| 原 `:136` 整行删 | 「同型守卫现行承担面：产品内双源守卫……」整句删（双源守卫无对象） |

**口径**：与需求档 `requirements/TWO-REPO-MERGE.md:26`（「提示词双副本」整条退役——单副本 `thincoder-core/prompts/`）同口径。

**读数（改后实测 · node 逐行扫）**：两档 `design/prompts` 字面 = **0**（改前 4 行：ARCHITECTURE `:39` `:60` · TWO-REPO `:82` `:87`）· token 族（含 `正本 / 镜像 / 副本`）余：ARCHITECTURE `:60` 唯一副本（本意）· `:85` 会话副本（他义）· `:82` / `:161` 不镜像 / 不逐像素镜像（他义）；TWO-REPO `:82` / `:89` / `:119` 单副本族（本意）· `:140` 板块镜像（他义）——**双面制陈述零残留**。

**偏离（报父侧）**：设计 §2.6 A20 对 `:90` 写「保留（打包边界仍真）」，但该段首句「**「单副本」在 phase 1 不可实现（机械约束，非偏好）**」在同节 `:82` 改成单源后自相矛盾（同节两处活陈述互斥）。处置 = **只换首句**：「单副本必须住核包内（机械约束，非偏好）」；其下逐句（tarball / vsix 只收包根、构建期拷入破坏直跑）逐字保留——这正是设计给 :90 的保留理由（说明为何副本须住核包内）。

**`[上抛·待裁]` 残留一处（未改，超设计所列行）**：`TWO-REPO-MERGE.md:87`「跨产品内容层 ｜ 两产品同名提示词集合的逐字节差异 ｜ 收敛归 phase 2（§8）」——单副本制下该行对象（两产品各自的同名提示词集合）已不存在；设计 §2.6 只列 `:87` 为删、未列本行。删或改写属语义面，本笔未动，请父侧裁。

**机检**：`doc_check(mode:"gate", target:"d:\teamcode\thincoder", docs=[两档])` ⇒ `DOC-CHECK GATE: PASS`（0 条命中 / 2 档全清 / 声明域 212 档）。

**边界**：只动两档 6 处 + 一处行宽无关的格式空行归位；提示词 / 需求档 / 代码 / 他档 / 本档 §3 · §5 零触。

**修轮（#47 上抛 + 终扫同族残留）——唯一改动档 = `docs/core/design/PROMPT-SYSTEM.md`**

同批已定形：`内容权 / 父侧定稿 / 内容权威` ⇒ **内容依据 = 机制文档，落笔 = eng-coder**。逐处改后：

| # | 行 | 改后 |
|---|---|---|
| 1 | `:199` | 落点行括注 ⇒「1 行；内容依据 = 机制文档，落笔 = eng-coder」 |
| 2 | `:291` | 描述逐字文本 = 内容依据机制文档、落笔 eng-coder |
| 3 | `:727` | 计数连带删去整项 ②（`docs/core/design/prompts/discipline-normal.md` 换写——对象随 R5 退场）；原 ③ 顺编为 ②，无断号 |
| 4 | `:738` | tool-docs 描述面随动另笔（内容依据 = 机制文档，落笔 = eng-coder；建议文案随设计上抛） |
| 5 | `:752` | 同 #4 同句 |
| 6 | `:774` | 描述面口径 = 内容依据机制文档、落笔 eng-coder，另笔议 |
| 7 | `:810` | D-PS11 决策句「定义照父侧定稿」⇒「定义以机制文档为据」；「放置两类分述」保留（非族词） |
| 8 | `:873` | §8.5 边界「不做提示词内容权（内容 = 主 agent 内容权 + coder 落笔）」⇒「不做提示词落笔（内容依据 = 机制文档，落笔 = eng-coder）」 |

**在盘读数**：`design/prompts` 0 · `内容权` 0 · `落笔分述` 0 · `父侧定稿` 0 · `内容权威` 0 · `内容依据` 7（`:119` 既有 1 + 本轮 6）· 行数 880（`\n` 计，±0）· `doc_check` gate PASS（target = `d:\teamcode\thincoder`，1 档全清 0 命中）。

**未动（他义 / 现行规则）**：`:801`「人读权威 = 中文机制文档」与 `:776`–`:795` EN 语言纪律；`:119` 既有「内容依据 = 机制文档」原句；`:731` `discipline-normal.md`「通用」条句（无 `design/prompts` 指路）。

### 收正笔 · `TWO-REPO-MERGE.md:87` 整行删（`#51` 上抛 · 父侧裁定 · 2026-10-19 · eng-designer）

**依据**：父侧裁定整行删。该行对象 = 「两产品同名提示词集合的逐字节差异」；单副本制下该集合不存在（只有 `thincoder-core/prompts/` 一份），「逐字节差异」与「收敛归 phase 2」均失去对象——留着它，读者会去找一个不存在的差异面。

**范围**：只改 `docs/core/design/TWO-REPO-MERGE.md` 一处（`§4` 表第 2 行，整行删）。未改本档其他行 · 提示词 / 需求档 / 代码 / 本档 §3 · §5 零触。

| 项 | 改前 | 改后 |
|---|---|---|
| `:87` | `| 跨产品内容层 | 两产品同名提示词集合的逐字节差异 | 收敛归 **phase 2**（§8） |` | （删） |

**删后检查（D3 与悬空引用）**

- §4 表：表头 + 1 行（`跨仓机制层`）——表结构与列不变，剩 1 行仍可读。
- **无计数句随动**：本档 §4 段落序为「现状结构句（`:82`）→ 表 → 单副本机械约束段（`:87`）」，全档无「本表 N 行 / N 层」类计数陈述（实读 §1–§9 全文 + 关键词扫 `表 … 行`）。
- **无悬空引用**：`跨产品内容层` / `逐字节差异` / `两产品同名` / `phase 2（§8）` 四串在本档余 **0**；该行原指 `§8`（`## 8. phase 2 演进通道（本档不实施）`，现 `:134`）为全档自有小节，§8 本体不依赖本行。
- 行数 153 → **152**（`\n` 计数 152 → 151；read 报 152 属末行换行计法差）。

**机检**：`doc_check(mode:"gate", target:"d:\teamcode\thincoder", docs=["docs/core/design/TWO-REPO-MERGE.md"])` ⇒ **`DOC-CHECK GATE: PASS`**（0 条命中 / 1 档全清 / 声明域 212 档）。

**边界**：零机械门 · 只删不增（无新语义）· 本档以外零触。

### 收正笔 · `AGENT-LOOP-UPSTREAM.md` 17 处同族命中（父侧终扫 · 2026-10-19 · eng-designer）

**范围**：只改 `docs/core/design/AGENT-LOOP-UPSTREAM.md`（1281 内容行，行数零变——15 处全为行内改词）。改法 = 批内已定形两形：「**内容依据 = 机制文档，落笔 = eng-coder**」（内容归属句）· 「**机制文档定稿**」（定稿位句）；**不删句**。未改提示词 / 需求档 / 代码 / 他档。

**逐处判义（16 行 / 17 命中）**

| # | 行 | 族 | 原句要点 | 判义 | 处置 |
|---|---|---|---|---|---|
| 1 | `:161` | 父侧定稿 | 两形返回注逐字 = 待父侧定稿 | 真残留（返回注内容由谁定稿） | 待**机制文档定稿** |
| 2 | `:236` | 内容权 | 「父侧已落笔——内容权在父侧」 | 真残留（逐字建议谁落笔 / 谁定） | 「**机制文档定稿 · 落笔 = eng-coder**」 |
| 3 | `:238` | 父侧定稿 | 接收侧句 = 待父侧定稿 | 真残留 | 待**机制文档定稿** |
| 4 | `:391` | 内容权 | 逐字建议 = §6.27.12.8；内容权 = 父侧 | 真残留 | 内容依据 = 机制文档，落笔 = eng-coder |
| 5 | `:489` | 内容权 | 新导出 `UPSTREAM_TURN_DOMAIN`（文本 = …；内容权 = 父侧） | 真残留 | 同上 |
| 6 | `:557` | 内容权 | 基座文本**内容权在核侧** | **他义——不改** | 见下「判他义的理由」 |
| 7 | `:569` | 内容权 | 「文本 = 父侧内容权」+「父侧确认后落笔」（同行两格） | 真残留 | 格 = 「文本 = **机制文档定稿**」；说明 = 「**机制文档定稿后落笔 = eng-coder**」（只改一格则该行自相矛盾） |
| 8 | `:584` | 内容权 | §6.27.12.8 标题（逐字建议——内容权 = 父侧） | 真残留 | 内容依据 = 机制文档，落笔 = eng-coder |
| 9 | `:646` | 内容权 + 父侧定稿 | 「内容权 = 父侧（限定：…待父侧定稿——…）」 | 真残留 ×2 | 两处同轮改（内容依据形式 + 待机制文档定稿） |
| 10 | `:715` | 内容权 | 代价 = 核文本改（内容权 = 父侧） | 真残留 | 内容依据 = 机制文档，落笔 = eng-coder |
| 11 | `:866` | 内容权 | 提示词面 / 工具描述与返回注零改（内容权 = 父侧） | 真残留 | 同上 |
| 12 | `:929` | 父侧定稿 | §6.32.4 标题（提醒文案——父侧定稿） | 真残留（文案由谁定稿） | **机制文档定稿** |
| 13 | `:1132` | 内容权 | 提示词面零改（内容权 = 父侧） | 真残留 | 内容依据 = 机制文档，落笔 = eng-coder |
| 14 | `:1147` | 父侧定稿 | D-ZW9「维持 note 不唤醒（有意选择——父侧定稿）」 | 真残留（定稿位归属；对象是决定而非提示词字面，但同族同形） | **机制文档定稿**（决定的定稿位 = 机制文档，语义不变） |
| 15 | `:1159` | 内容权 | 提示词面三处（内容权 = 父侧） | 真残留 | 内容依据 = 机制文档，落笔 = eng-coder |
| 16 | `:1185` | 内容权 | §6.33.4 标题（内容权 = 父侧） | 真残留 | 同上 |

**判他义的理由（`:557`，报出不改）**：原句「句内锚点插值 ⇒ 端侧须持基座句串锚点，而基座文本**内容权在核侧**（§6.27.12.8）——核侧改字面即静默失效（漂移面）」。此处的对手方是**端侧**（核 ∥ 端的文本归属），不是父侧 / 主 agent 的授权位；论证点是「核改字面 ⇒ 端锚点静默失效」这条漂移路径。换成「内容依据 = 机制文档」会把主语从「核侧」换掉，句子失真——基座句串住 `thincoder-core/prompts/`，不在机制文档里。单面制下该陈述为真（唯一副本在核），故保留。若父侧要 `内容权` 读数归零，最小改法 = 「基座文本**在核侧**」（省「内容权」三字，语义零变）——涉及词形选择，本席不自定。

**读数（改后实测 · node 逐行扫）**

- `内容权` **1**（`:557`，判他义；改前 12）· `落笔分述` **0**（改前 0——父侧终扫的该族命中实为 `内容权` 12 处的同坐标）· `父侧定稿` **0**（改前 5）· `内容权威` **0**（改前 0）。
- 新形落地：`内容依据 = 机制文档，落笔 = eng-coder` 9 行（`391` `489` `584` `646` `715` `866` `1132` `1159` `1185`）· `机制文档定稿` 7 行（`161` `236` `238` `569` `646` `929` `1147`）；两式在 `:646` 同行 ⇒ 共 **15 行 / 16 命中**（`557` 不计）。
- 行数 **1281**（不变）· 15 处改后行宽 38–219 字符（阈值 300）。

**同族残留（本单 17 处之外 · 未改 · 报父侧）**：`:217` / `:328` / `:647` / `:650` / `:1089` / `:1263` 的「父侧笔 / 父侧落笔」（多数指需求档笔域；`:328` 明写「不改提示词正文（父侧落笔）」）· `:1129`「文案定稿权 = 父侧」（定稿权同族，无 `父侧定稿` 字面）——均不在终扫 17 坐标内，改法涉归属语义，等父侧裁。

**机检**：`doc_check(mode:"gate", target:"d:\teamcode\thincoder", docs=["docs/core/design/AGENT-LOOP-UPSTREAM.md"])` ⇒ **`DOC-CHECK GATE: PASS`**（0 条命中 / 1 档全清 / 声明域 212 档）。

**边界**：只动本档 15 行 16 处；提示词 / 需求档 / 代码 / 他档 / 本档 §3 · §5 零触。

**坐标更正（同笔 · 上行自误）**：上节「单副本机械约束段（`:87`）」应为 **`:88`**（删行后原 `:89` 上移一行）。该段本身零改动；§4 表 = `:84`–`:86`（表头 + 1 行），`:87` 为表后空行。复核读数：全档 `表 … N 行 / N 层` 类计数陈述 = 0（node 逐行扫两条正则，命中 2 行均为他义：`:13`「下移一层」目录树注、`:98`「各档 ≤300 行」行宽判据）。

### 收正笔 · `#50` 报的 A14 同族残留两处（`ENGINEERING-MODE-V2.md` · 2026-10-19 · eng-designer）

**范围**：单档 `docs/core/design/ENGINEERING-MODE-V2.md` 的 E4.1 引言一行（`:286`）与接线表 M9 行（`:97`），另同句内一处失效节号。未改本档其他行 · 提示词 / 需求档 / 代码 / 本档 §3 · §5 零触。

| # | 行 | 改前 | 改后 |
|---|---|---|---|
| A | `:97`（接线表 M9 行） | `零改（落地 \`prompts/\` = 生成物，重生成不手改）` | `零改（提示词 = 产品代码，由 coder 按机制文档落笔）` |
| B | `:286`（E4.1 引言 · 设计层括注） | `机制面 = §6 设计文档 → 代码落地/装配 + §2 核模块裁决行` | `机制面 = §6.1 提示词承载与落笔分工 ∥ §6.2 装配实现事实 + §2 核模块裁决行` |
| C | `:286`（同行 · 需求层括注） | `内容大纲 = §4.3 人格层/公共层/纪律层表` | `内容大纲 = §2.2 人格层 ∥ §2.3 公共层 ∥ §2.4 纪律层` |

**A 的依据**：「生成物 / 重生成」预设一个上游生成源（中文设计面）；单面制下提示词 = 手写的产品代码，没有生成这一步，也没有可回退的手改禁令对象。三格「零改」判定（核 / CLI / VSC 各不改文件）逐字保留——那是断言，不是框架词。

**B 的依据（实读）**：`PROMPT-SYSTEM.md` 现行节名 = `## 6. 机制面`（`:115`）→ `### 6.1 提示词承载与落笔分工（现行）`（`:117`）· `### 6.2 装配实现事实`（`:144`）；旧指法「§6 设计文档 → 代码落地/装配」不是盘上任一节名。改后两节名逐字取自盘上标题。

**C 的依据（实读 · 同句同病）**：`requirements/PROMPT-SYSTEM.md` 无 `§4.3`（`^#{1,4} 4\.3` 命中 0）；三层表的实存位 = `### 2.2 人格层…`（`:26`）· `### 2.3 公共层…`（`:64`）· `### 2.4 纪律层…`（`:135`）。属同行死指针（一致性面），随 B 同轮收，不另立批。

**读数（改后实测）**：`生成物` 0 · `重生成` 0（改前各 1，均 `:97`）· `§6 设计文档` 0 · `代码落地/装配` 0 · `§4.3` 0（本档）· 行数 525（不变，三处全为行内替换）。

**gate**：`doc_check(mode:"gate", target:"d:\teamcode\thincoder", docs=["docs/core/design/ENGINEERING-MODE-V2.md"])` ⇒ `DOC-CHECK GATE: PASS`（0 条命中 / 1 档全清 / 声明域 212 档）。

**读数更正（同笔 · 上节自误）**：上行写「`§4.3` 0（本档）」错——本档实测 `§4.3` **1** 处，在 `:295`（同在 E4.1 节：「权威内容大纲见需求层 `PROMPT-SYSTEM.md` §4.3（不在此重述）」），与 C 同类（需求档无 §4.3，实存 = §2.2 / §2.3 / §2.4）。该行不在本派单「只改两处」（`:97` · `:286`）范围内，**未改**。

**[上抛·待裁]**：`ENGINEERING-MODE-V2.md:295` 的 `§4.3` 是否随 C 同批改指（`§2.2 人格层 ∥ §2.3 公共层 ∥ §2.4 纪律层`）；同一括注族在两行内一改一留，读者会按 `:295` 去需求档找一个不存在的节。

其余读数不变：`生成物` 0 · `重生成` 0 · `§6 设计文档` 0 · `代码落地/装配` 0 · 行数 525（改前 525）。

### 收正笔 · `#56` / `#54` 两处同族残留（2026-10-19 · eng-designer）

**范围**：两档各一行（`docs/core/design/ENGINEERING-MODE-V2.md:295` · `docs/core/design/AGENT-LOOP-UPSTREAM.md:1129`），行内改，行数与行宽阈值无涉。未改提示词 / 需求档 / 代码 / 他档 / 本档 §3 · §5。

**A · `ENGINEERING-MODE-V2.md:295`（死指针，与 `:286` 同形收）**

| 项 | 内容 |
|---|---|
| 改前 | …· consult-base——权威内容大纲见需求层 `PROMPT-SYSTEM.md` **§4.3**（不在此重述）。 |
| 改后 | …· consult-base——权威内容大纲见需求层 `PROMPT-SYSTEM.md` **§2.2 人格层 ∥ §2.3 公共层 ∥ §2.4 纪律层**（不在此重述）。 |

**依据（实读）**：`requirements/PROMPT-SYSTEM.md` 的三层表实存位 = `### 2.2 人格层`（`:26`）· `### 2.3 公共层`（`:64`）· `### 2.4 纪律层`（`:135`），`^#{1,4} 4\.3 ` 命中 **0**；同节 `:286` 上一笔已按同三节改指 ⇒ 同一括注族一改一留会让读者按 `:295` 去找一个空节。

**B · `AGENT-LOOP-UPSTREAM.md:1129`（判义 → 改）**

| 项 | 内容 |
|---|---|
| 改前 | 5. 阈值固定 50（用户口径）——不做配置键；**文案定稿权 = 父侧**。 |
| 改后 | 5. 阈值固定 50（用户口径）——不做配置键；**文案定稿 = 机制文档定稿**。 |

**判义（实读同档三处）**：本行「文案」= **零落笔提醒的展示文案**，非提示词正文、亦非需求 / 设计档的叙述文字——

1. 同节 `:1128` 第 4 条写「其采集口径与**展示文案**随收正（读数与文案两变——见 §6.32.2 ① / §6.32.4）」——把「文案」定指到 §6.32.4 的提醒文案。
2. §6.32.4 标题（`:929`）现文 = 「提醒文案（两面 · 单行 · 英文——**机制文档定稿**）」——本批同族笔已把这份文案的定稿位改到机制文档（「两面」= A 面 `zero-write-watch.mjs` ∥ B 面 `checkpoint.mjs`，他义保留）。
3. 该文案的落点 = 产品代码（`zero-write-watch.mjs` / `checkpoint.mjs`），内容依据 = 本档 §6.32.4 逐字。

⇒ 派单两分支都不逐字命中（不是提示词正文，也不是需求 / 设计档叙述文案），但落点与 `:929` 同一对象；保留「父侧」会让同一档对同一份文案给出两处互斥陈述。故按批内已定形取「机制文档定稿」（批内 `:1147` / `:434` / `:776` / `:878` / `:885` / `:903` 同形）。

**未动（判义为对的，不在本笔）**：`:217` / `:328` / `:647` / `:650` / `:1089` / `:1263` 的「父侧笔 / 父侧落笔」——多数指需求档 / 设计档的笔域，属父侧真实笔权；`:557`「内容权在核侧」判他义（核 ∥ 端的文本归属）。

**读数（改后实测 · node 逐行扫）**：`ENGINEERING-MODE-V2.md` `§4.3` **0**（改前 1）· 行数 524（不变）· `:295` 行宽 250 字符（阈值 300）· `:286` 同行三节逐字对位一致；`AGENT-LOOP-UPSTREAM.md` `父侧定稿` **0** · `机制文档定稿` **8** 行 · 行数 1281（不变）· `:1129` 行宽 38 字符。

**机检**：`doc_check(mode:"gate", target:"d:\teamcode\thincoder", docs=[两档])` ⇒ **`DOC-CHECK GATE: PASS`**（0 条命中 / 2 档全清 / 声明域 212 档）。

**边界**：只动这两行；提示词 / 需求档 / 代码 / 他档 / 本档 §3 · §5 零触。

**坐标更正（同笔 · 上节自误）**：上行「批内 `:1147` / `:434` / `:776` / `:878` / `:885` / `:903` 同形」未带档名，读起来像同一档内坐标。实为两档：`:1147` 在 `AGENT-LOOP-UPSTREAM.md`；`:434` / `:776` / `:878` / `:885` / `:903` 在 `AGENT-LOOP-ASYNC-POOL.md`（前笔「父侧定稿 ⇒ 机制文档定稿」，`docs/batches/2026-10-19-prompt-mech-single-face.md` §2 收正笔 · `#46`）。读数不变：`AGENT-LOOP-UPSTREAM.md` `机制文档定稿` 8 行（`161` `236` `238` `569` `646` `929` `1147` + 本笔 `1129`）。

### 终扫收正笔 · 父侧第三轮窄口径 4 处（2026-10-19 · eng-designer）

**范围**：四档 5 处（派单 4 处 + 1 处同族 `:858`——验收②要求「两档 `生成物` = 0」，该行是同一 token 的否定式残留）。全部行内改，行数零变（749 / 881 / 386 / 627）。未改提示词 / 需求档 / 代码 / 本档 §3 · §5。

| # | 档:行 | 改前（要点） | 改后（逐字要点） |
|---|---|---|---|
| 1 | `CONTEXT-COMPACTION.md:746`（D-CC31） | （CN 正本 = 设计轮直落 ∥ EN 代码 = 实施轮按 M9） | （提示词侧 = 实施轮 coder 落笔） |
| 2 | `PROMPT-SYSTEM.md:873`（§8.5 边界） | 不手改落地档（**生成物**） | 不手改落地档 |
| 2b | `PROMPT-SYSTEM.md:858`（F2 方案列） | 改 EN（产品代码面；**无「生成物」一步**） | 改 EN（产品代码面） |
| 3 | `DOC-SYSTEM.md:271`（修法 1） | 『正本 → 回写落地档』链路退场；保留扫替判据——…判据 = 域内 `docs/design/prompts` ∥ `docs/core/design/prompts` 引用计数 = 0 | 扫替判据——域 = 根层 `docs/**` 扣 `_archive/` 与时序日志面、两产品树排除；判据 = 域内指向 `docs/**/prompts` 的引用计数 = 0 |
| 4 | `docs/cli/design/ACP-CLIENT.md:132`（§3.5 判据） | `docs/core/design/prompts/advisor-design.md` 第 8 条 | `thincoder-core/prompts/advisor-design.md` 第 8 条 |

**逐处依据**

1. 双面并列 ⇒ 单面（本批统一定形）。
2. 「生成物」= 生成源预设；单面制下提示词 = 手写产品代码，无生成一步。只删括注、保留「不手改落地档」——「落地档」在本档是 live 用法（`:141` `:230` `:270` `:271` `:305` 均指盘上提示词档，语义 = 一次性比对的对侧），不是生成物专名。
2b. 派单只点 `:873`；`:858` 的「无「生成物」一步」是同一 token 的否定式残留（D8：已退场物的否定陈述），且验收②「两档 `生成物` = 0」不删它不可达。
3. 该句 = R5 判据 ① 的本体（描述清扫判据），自身携带两处 `design/prompts` 字面 ⇒ 会自命中。改法：判据泛化为「指向 `docs/**/prompts` 的引用计数 = 0」（不含连续子串，覆盖原两种历史前缀；与 `:174` N-d 的「`docs/**` 下 `prompts/` 目录数 = 0」同口径）。另删半句「『正本 → 回写落地档』链路退场；」——D8 否定式残留。
4. F1 形：改指 EN 同名档。实读核 `thincoder-core/prompts/advisor-design.md` 第 8 条 = 行数 / 函数档判据（含「文件 ≤500 行而含 300+ 行单体函数仍不合规」），与 ACP 句所述判据同源。

**读数（改后实测 · node 逐行扫 4 档）**

| 档 | 行数 | `CN 正本` | `生成物` | `design/prompts` |
|---|---|---|---|---|
| `CONTEXT-COMPACTION.md` | 749（不变） | 0（改前 1） | 0 | 0 |
| `PROMPT-SYSTEM.md` | 881（不变） | 0 | 0（改前 2 = `:858` `:873`） | 0 |
| `DOC-SYSTEM.md` | 386（不变） | 0 | 0 | **1（`:120`）** |
| `docs/cli/design/ACP-CLIENT.md` | 627（不变） | 0 | 0 | 0（改前 1） |

**残留判义（只报不改）**：`DOC-SYSTEM.md:120` = 迁移表「现址」列（`docs/design/prompts/`（16 档）→ 无去向（整族退场））。判义 = 现址陈述（该目录当前在盘，R5 前为真），非提示词落点句；但 R5 删档后即死指向 ⇒ 建议随 R5 同批删该行（不在本派单 4 处内，未动）。

**机检**：`doc_check(mode:"gate", target:"d:\teamcode\thincoder", docs=[4 档])` ⇒ `DOC-CHECK GATE: PASS`（0 条命中 / 4 档全清 / 声明域 212 档）。

**边界**：只动四档 5 处；提示词 / 需求档 / 代码 / 本档 §3 · §5 零触。

### 收尾单点 · `DOC-SYSTEM.md:120` 整行删（`#57` 残留 · 父侧裁定 · 2026-10-19 · eng-designer）

**范围**：`docs/core/design/DOC-SYSTEM.md` 一处（迁移表「现有档的去向（FR1）」第 4 行整行删）。行数 **386 → 385**。提示词 / 需求档 / 代码 / 本档 §3 · §5 零触。

**改前（`:120` 整行）**：

| `docs/design/prompts/`（16 档） | **无去向（整族退场）** | 提示词唯一副本 = `thincoder-core/prompts/`；`docs/` 下不含提示词档 |

**改后**：该行不存在；表 = 表头 + 分隔行 + **5 行**（原 6 行）。

**为什么删而不是改**：该行唯一结论 = 「整族退场」（对象整体消失，行无剩余信息）；「说明」列事实由 §5.1 P4 判据句（`:142`）与 §9 ③（`:268`）各自在册，删行不丢单一权威源。留下的代价是「现址」列携带连续子串 `design/prompts` ⇒ 作 R5 判据 ① 的命中源（本批所治的「判据句自命中」）。

**计数 / 引用随动（D3）**：全档搜「现有档的去向 / 整族退场 / 表内 / 上表 / 行数」**零计数句、零他处引用该行**（`grep` 实测：本档唯一命中即待删行；仓内 `现有档的去向` 仅 `:114` 标题句）⇒ 无随动项。

**读数（改后实测）**：

| 项 | 读数 |
|---|---|
| 本档 `design/prompts` | **0**（改前 1 = `:120`） |
| 本档行数 | 385（`386 → 385`） |
| 迁移表结构 | 表头 / 分隔行在位，数据行 5（无断号——本表未编号） |
| `doc_check(mode:"gate", target:"d:\teamcode\thincoder", docs=[`DOC-SYSTEM.md`])` | **`DOC-CHECK GATE: PASS`**（0 条命中 / 1 档全清 / 声明域 212 档） |

**R5 判据 ① 残留读数（只报不改 · 派单写死域外）**：按 `docs/**` + `scripts/**` 扣 `batches` / `_archive` / `TODO*.md` 实测 `design/prompts` 命中 **7 处**——`scripts/prompt-refs-check.mjs:10/:13/:25`（**LIVE 扫描路径**：`PROMPT_DIRS` 含 `docs/core/design/prompts`，该目录 R5 前仍在盘）· `docs/core/design/DOC-MIGRATION.md:336`（`docs/_archive/design/prompts`，W8 清单未列该行）· `docs/core/requirements/TWO-REPO-MERGE.md:26`（需求档，主 agent 笔）· `docs/TODO.md:19` · `docs/TODO-archive.md:260`。⇒ **R5 判据 ① 的「域内零命中」在 CN 提示词目录删除前、且脚本扫描根字面不改的前提下不可达**；本单点只清 `DOC-SYSTEM.md` 一处。

**边界**：只删该行；未改本档其他行、未改提示词 / 需求档 / 代码、未改本档 §3 / §5。

**上块坐标更正（读回核出 · 同轮）**：上块「说明」列事实的两处单源坐标按**删行后**盘面为准——§5.1 **P4 判据句 = `docs/core/design/DOC-SYSTEM.md:141`**（非 `:142`）· §9 **③ = `:267`**（非 `:268`）。成因 = 所写坐标为删 `:120` 之前的读数（删行后其后全部行号前移 1）；`现有档的去向` 标题 = `:114`（在删行之前，读数不变）。按 D4 优先读「§5.1 P4 判据句」「§9 ③」两处节名，行号仅 as-of。

### 收正笔 · `#59` 报的 `DOC-MIGRATION.md:336`（2026-10-19 · eng-designer）

**病由**：W8 的「补 `_archive/` 前缀」只把裸 `design/prompts/` 补成 `docs/_archive/design/prompts`——连续子串 `design/prompts` 仍在，R5 判据 ① 是**文本 grep**（非路径遍历），照样命中。补前缀不改变命中，改法落空。

**范围**：只改 `docs/core/design/DOC-MIGRATION.md` 一处（`:336`，S4 测试处置行内片段）。同行「⑤ 扫描根（`:53`）改指 `docs/_archive/`」不含该子串，未动。未改本档其他行 · 提示词 / 需求档 / 代码 · 本档 §3 · §5 零触。

| 项 | 内容 |
|---|---|
| 改前 | ③ 镜像源（`:39`）改指 `docs/_archive/design/prompts` · ⑤ 扫描根（`:53`）改指 `docs/_archive/`（判据不变、**不得静默空扫描**） |
| 改后 | ③ 镜像源（`:39`）改指 `_archive/` 下的提示词档目录 · ⑤ 扫描根（`:53`）改指 `docs/_archive/`（判据不变、**不得静默空扫描**） |

**定形依据（实读 · 最接近先例）**：本档自己已有同指法——`:264` / `:270`（§10.3 迁移表「目标路径」列）= 「`_archive/` 下的提示词档」· `:367`（用例表「边界 · 同名集合」）= 「`_archive/` 下的提示词档 15 档（两树同名）」。取同一形，判据（改指已归档位）零变，只换指法。

**读数（改后实测 · node 逐行扫）**：本档 `design/prompts` **0**（改前 1 = `:336`）· 行数 746 内容行（不变，行内替换）· `:336` 行宽 584 字符（表行，属行宽豁免类）。

**机检**：`doc_check(mode:"gate", target:"d:\teamcode\thincoder", docs=["docs/core/design/DOC-MIGRATION.md"])` ⇒ **`DOC-CHECK GATE: PASS`**（0 条命中 / 1 档全清 / 声明域 212 档）。

## §3 设计评审（评审子代理）

### 轮次 1（评审子代理）

**评审对象**：R4 设计（`thincoder/docs/batches/2026-10-19-prompt-mech-single-face.md` §2：A1–A22 + W1–W15 + B 组 24 档 + 需求档 13 档 逐处执行清单）· 对象状态 = 待评审
**评审范围（实读全文）**：本批档 · `thincoder/docs/batches/2026-10-18-prompt-single-face.md` · `thincoder/docs/core/design/PROMPT-SYSTEM.md`（958 行全文）· `thincoder/docs/core/design/DOC-SYSTEM.md`（392 行全文）· `thincoder/docs/core/design/DOC-DISCIPLINE.md`（抽读 §1 D1–D9 块 / §3.7 块 / §3.13 / §4.5.11 / §6 用例表末 + 全档 `design/prompts` 与「正本」族 grep）· 旁证实读：`thincoder/docs/README.md` · `thincoder/docs/TODO.md` · `thincoder/docs/TODO-archive.md:260` · `thincoder/PROJECT-MANIFEST.json` · `thincoder/thincoder-core/prompt-files.mjs:29-30` · `thincoder-core/{prompts,tool-docs}/` 目录列举
**计数**：🔴 1 · 🟡 5 · 🔵 0

| # | Category | Severity | Issue | Suggestion |
|---|----------|----------|-------|------------|
| 1 | Requirements / Document ownership | 🔴 | 判面二清单不完整，与其自身的「全覆盖」断言相抵。§2.4 结论（`thincoder/docs/batches/2026-10-19-prompt-mech-single-face.md:133`「**已全覆盖今天盘上「无双面完整字面」的双份制陈述**」）与盘上实读不符——下列现役双份制句既不在 A1–A22、也不在 W1–W15、也不在 §2.5 逐行表：`thincoder/docs/core/design/PROMPT-SYSTEM.md:173`「改中文正本 → 精确翻译写入英文代码」· `:268`「落笔口径 = 中文设计文档设计轮落形 / 英文按 M9 精确翻译回写」· `:344`「提示词正本 D1–D7 ∥ 设计档 D1–D8」· `:232`「两面各 +1 行」· `:250`「两份锁照常适用」· `:848`（D-PS10）「中文正本本设计轮落形，英文按 M9 精确翻译回写（实施轮）」· `:881`「## 8. 提示词设计→实现流程（M9 落点）」（A1–A4 只改该节正文，节标题留双面框架）· `:954`「见 §8 提示词设计 → 实现流程」· `thincoder/docs/core/design/DOC-DISCIPLINE.md:683`「提示词正本面第 6 条 = **已落**」· `:1856`「（CN 正本 + EN 运行面 + `BATCH-RECORD.md` §5.3）」· `thincoder/docs/core/design/DOC-SYSTEM.md:388`「提示词文件（含中文模板）零写入」。根因：§2.5 的行集是 `design/prompts` 字面 grep 的产物，而 2026-10-18 蓝图 B 组列过的 `:171-173` · `:268` · `:344` · `:354` · `:521` · `:624` · `:650` · `:761` · `:783` · `:808` · `:827` 等行在本轮按字面重测后被整体丢弃（原处已成「CN ∥ EN」无路径形）。执行本设计后，机制档仍会以两套说法描述同一机制（双面 + 单面并存），R4 的目标态不成立 | 以语义 token 族（`中文正本` / `中文设计档` / `两面` / `两份` / `CN 正本` / `设计→实现` / `M9…翻译回写`）对 24 机制档 + 13 需求档做第二轮全量扫，逐处补入 §2.3 / §2.4 / §2.5 的「现文逐字 → 改后逐字」；§2.4 结论句改为按 token 族计数（含零命中档的登记），不再以 `design/prompts` 字面为全集 |
| 2 | Acceptance criteria | 🟡 | AC7 与 §2.5 的零动作行相抵，判面一按现文定义不可达：`:51` 判面一「判据 = 该域内 `docs/core/design/prompts` **计数 = 0**」（域 = `docs/**` 扣 `batches` / `_archive` / 产品树）；`:242` AC7 同判据；但 `:171` 对 `docs/TODO-archive.md:260` 判「**零动作**（记录面，R5 排除集外但语义上不改）」，而该行实读含完整字面（`thincoder/docs/TODO-archive.md:260`「`docs/core/design/prompts/discipline-engineering.md` 新节」）。`TODO-archive.md` 不在 `_archive/` 目录下 ⇒ 落在判面一域内 ⇒ 计数 ≥ 1 ⇒ AC7 恒不成立。`docs/TODO.md` 同理只在 `checkConfig.anchors.exclude`（`thincoder/PROJECT-MANIFEST.json:41`）里被排除，与判面一的域定义不是同一集合 | 判面一的域显式并入 `docs/TODO.md` · `docs/TODO-archive.md`（与 `checkConfig.anchors.exclude` 同集），或把 AC7 改写为「规范面（设计 / 需求档 + 地图）计数 = 0；记录面另计并给读数」——二形择一写死 |
| 3 | Acceptance criteria | 🟡 | W5 / W8 的改后达不到它自己声明的目的：`:121` 记「R5 的 grep 判据会命中」并据此把裸 `design/prompts/` 改为 `_archive/design/prompts/`（`:121` 与 `:124`），但 R5 判据 ① 是文本串匹配（`thincoder/docs/batches/2026-10-18-prompt-single-face.md:330`「grep -r "design/prompts" docs/ scripts/」），`_archive/design/prompts/` 仍含 `design/prompts` 子串 ⇒ 补前缀后照样命中，改法落空（另：`_archive/design/prompts/` 15 档实存已核 = 真，指向本身正确） | 改法换成不携带该子串的指法（如「`_archive/` 下的提示词档 15 档」），或把 R5 判据 ① 收窄为「不带 `_archive/` 前缀的 `design/prompts/` 零命中」，并把该口径写进 R5 行 |
| 4 | Clarity | 🟡 | 「改后」在 B 组与需求档未落到逐字，且 F1 形在 CN∥EN 同句并列时歧义：AC1（`:236`「逐处给「文件:行 · 现文逐字 · 改后逐字」」）要求在册，但 §2.5 只给四形标签（`:146`「`:760` · `:764` · `:781` · `:807` **F1**」）；F1 规定 `:139`「同句内「中文正本 `docs/core/design/prompts/X`」⇒「EN `thincoder-core/prompts/X`」」，照此对 `thincoder/docs/core/design/PROMPT-SYSTEM.md:760`（同句已有「英文代码 `thincoder-core/prompts/common.md`（同节位）」）执行会产出两个 EN 指针。§2.6 需求档只给「改后要点」，与 AC1 的「改后逐字」亦不同粒度。这与 `:76`「改后一律定一形」自设标准相抵 | 每处补一行逐字改后；或把 F1 改为可机械执行的「删 CN 半句 + 保留 EN 半句（不复制）」并给每条一个示例；同时把 AC1 的落点列改成与交付物实际粒度一致（要么补逐字，要么把 AC1 降为「四形 + 逐行坐标」） |
| 5 | Requirements（数值） | 🟡 | A13 的改后引入错误档数：`:100` 写「`thincoder-core/tool-docs/`（48 档）」，同格尾部又写「核内 16 + 48 在位」；实读 `thincoder/thincoder-core/tool-docs/` = 53 个 `.md`，同档 `thincoder/docs/core/design/PROMPT-SYSTEM.md:18` 写「（53 档工具描述）」、`:310` 写「枚举工具 52 ∥ 目录档 53」⇒ 落笔即造出 48 / 52 / 53 三读数并存（A21 的改后已删「16 / 52 档」，却没纠 48） | 统一为 53 并给计数口径（枚举工具 52 + 目录档 1），或只留一处读数 + 指针（D2） |
| 6 | Scope | 🟡 | 本批唯一「未定形」项与它自己的 R5 门槛耦合：`:170` 对 `docs/TODO.md:19` 写「建议同改（成本一行），最终由主 agent 定」，而 `:251` 又把该行列为「非双份制但破 R5 grep 的两处」之一 ⇒ 该项不落定，R5 判据 ① 的成败取决于一个悬空口径（协调项，非缺陷） | 二选一写死：(a) 改该行；(b) 把 `docs/TODO*.md` 并入 R5 判据 ① 的排除集——两条都写进 §2.9 D-4，落笔轮不再裁 |

**正向核对（本轮实读通过，不作发现）**：A1（`:883`）· A2（`:887-899`）· A3（`:901-910`）· A4（`:912-936`）· A5（`:839` / `:840`）· A6（`:152-153`）· A7（`:946`）· A8（`:15` / `:20` / `:22` / `:41-56` / `:67-68` / `:97` / `:102` / `:115-117`）· A9（`:301-308`）· A10（`:174`）· A11（`:121` / `:269` / `:272-276` / `:326` / `:327` / `:343` / `:355`）· A21（`:143`）· A22（`:79`）· W5（`:152` / `:154`）的坐标与逐字现文均与盘上一致；§2.7 行数抽验（PROMPT-SYSTEM 958 · DOC-SYSTEM 392 · DOC-DISCIPLINE 1965 · README 107 · ARCHITECTURE 199 · ENGINEERING-MODE-V2 526）一致；`prompt-files.mjs:29-30` `PROMPTS_DIR` 与 `PROJECT-MANIFEST.json:25` `promptsLanding` 与设计所述一致；最接近先例行（`:255`）+ 勘察证据行（`:257`，含「独立文档仓结论 = 不相关」）在册。
**未验证项（越出本轮 Documents to Review，不作判据）**：A13（`CORE-UNIFICATION.md` 18 处）· A14（`ENGINEERING-MODE-V2.md` 6 处）· A15（`ARCHITECTURE.md:39/:60`）· A20（`TWO-REPO-MERGE.md` 5 处）· B 组其余 20 档逐处坐标 · §2.6 需求档 13 档坐标 · §2.2 的「203 行 / 38 档」总读数（本次仅抽核，未复算汇总）。
**范围限制**：本轮无项目标准档、无文档地图声明（Document ownership 判据降级），归属判据以 Project Guide + 在盘 `DOC-SYSTEM.md` / `DOC-DISCIPLINE.md` 为准。

VERDICT: changes-required
**计数**：🔴 1 · 🟡 5 · 🔵 0

### 轮次 2（评审子代理）

**评审对象**：§3 轮次 1 六条发现的修复落点（`thincoder/docs/batches/2026-10-19-prompt-mech-single-face.md` §2.10 修正轮：§2.10.1 token 族全量扫 / §2.10.2 a–c 三张逐字表 / §2.10.3 六条逐条处置 / §2.10.5 三处口径）+ 新补「133 处」的落地验证 · 对象状态 = 待评审 · 触发 = 轮次 2 复审
**评审范围（实读）**：本批档全文（§1–§3）· `thincoder/docs/core/design/PROMPT-SYSTEM.md`（抽核 :12-23 · :140-199 · :225-354 · :600-660 · :795-824 · :860-958）· `thincoder/docs/core/design/DOC-SYSTEM.md`（抽核 :70-159 · :260-359 · :384-392）· `thincoder/docs/core/design/DOC-DISCIPLINE.md`（抽核 :10-89 · :222-281 · :660-719 · :1552-1565 · :1850-1903）
**未验证（越出 Documents to Review，不作判据）**：`CORE-UNIFICATION.md` / `ENGINEERING-MODE-V2.md` / `AGENT-LOOP-UPSTREAM.md` / `BATCH-RECORD.md` / `LIGHT-CHANNEL.md` 等机制档逐处坐标 · 13 档需求档坐标 · `thincoder-core/prompts/*.md` 行数（A11 `:327` 的 198）· `_archive/` 归档位（W8）
**计数**：🔴 0 · 🟡 4 · 🔵 1

| # | Category | Severity | Issue | Suggestion |
|---|----------|----------|-------|------------|
| 1 | Clarity | 🟡 | 新补表内有一行的「现文」与盘上不符、「改后」对该行是空操作 ⇒ 该行的双面制陈述在执行后存活。`thincoder/docs/batches/2026-10-19-prompt-mech-single-face.md:365` 对 `DOC-DISCIPLINE.md:691` 记现文「（同族「运行面」句，与 `:683` 同节）」、改后「与 `:683` 同形（删「正本面」）」；盘上该行实读为 `thincoder/docs/core/design/DOC-DISCIPLINE.md:691`「**复核读数（域 = `docs/**/design/**` 非归档 + 提示词两面）**：族命中 114 行…」——既无「运行面」也无「正本面」字面，命中点为「提示词两面」。按现指令落笔 => 零改动，单面制目标态在该行不成立（R5 的文本串判据抓不到它：无路径字面）。同批 `:363` 对 `DOC-DISCIPLINE.md:683` 只处置前半句「正本面」，同行后半「提示词运行期面第 6 条 = **在途**」亦带面限定，改后未交代 | 把 `:365` 行的现文改为盘上逐字（「非归档 + 提示词两面」），改后写死为「提示词面」；`:363` 补一句「同行「提示词运行期面」⇒「提示词面」」 |
| 2 | Acceptance criteria | 🟡 | 轮次 1 第 4 条的粒度残留：AC1 仍要求「每处逐字」，而交付物有三成按形。`thincoder/docs/batches/2026-10-19-prompt-mech-single-face.md:236` 定「每处给「文件:行 · 现文逐字 · 改后逐字」；改写式只作索引不作替代」，`:458` 重申「改写式 F1–F7 / G1–G2 只作索引，不作替代」；但 `:460` 的定稿口径为「机制档 **107 处**（逐字 77 + 按形 30）」，`:402` 明写「**未逐字抄录的同族行**」，`:398` 的 G2/G1 按形行覆盖 24 个坐标不落逐字 ⇒ 按 AC1 自读，30 处不合格 | 把 AC1 的判据改成与交付物同粒度：「逐字 77 处逐字在册；按形 30 处给形名 + 逐行坐标（形 = 判据，落笔轮不自定）」——二选一写死，不两头都写 |
| 3 | Document state consistency | 🟡 | 轮次 1 第 6 条的修复只落在 §2.5，§2.7 保留旧措辞 ⇒ 同一项两处活陈述互斥。`thincoder/docs/batches/2026-10-19-prompt-mech-single-face.md:170` 已写「**处置已定 = 改该行**」，`:251`（D-4）同向；但 `:226` 受影响文件表该行仍记「**建议同改**，最终由主 agent 定」 ⇒ 落笔轮读受影响文件表会看到悬空口径（R5 判据 ① 的成败仍取决于一条「待定」） | 删 `:226` 的「建议同改，最终由主 agent 定」，改为与 `:170` 一致的确定处置 |
| 4 | Methodology compliance（D3 计数纪律） | 🟡 | 修正轮自身「N 处」与列表不闭合，四处读数互不等：逐档表合计 = 108 机制档（`:269`–`:293` 各行相加：41+1+34+3+2+6+8+5+2+2+1+1+1+1），定稿口径写「107 处」（`:298` / `:460`）；需求档表内记「**21 处**」（`:294`），定稿记「需求档 **26 处**」（`:298`），`:404` 的 (c) 表实列 26 行；`:276` 记「**5 处**」却列 6 个坐标（`:48/:75/:163/:203/:207/:214`）；`:402` 记「其余 6 行」却列 7 个坐标（`:306 / :530 / :790 / :812 / :813 / :915 / :918`）；`:441` 记「另抓出 8 处」而括注为 1+1+1+6 = 9 处。本批自设 D3（`N 项/处/条` 与列表同时改）在这一层未兑 | 复算一遍逐档表并按实数改写 `:298` / `:441` / `:460` 与 AC1 的「133 处」；`:276` / `:402` 的坐标数与「N 处」取齐（多列或减列） |
| 5 | Requirements（数值口径） | 🔵 | 轮次 1 第 5 条修到 53 后引入一句不可兑现的唯一性声明：`:100`（A13 随动改后）写「`thincoder-core/tool-docs/`（**53 档**——枚举工具 52 ∥ 目录档 53，唯一读数处 = `PROMPT-SYSTEM.md:310`）」，但同档还有 `thincoder/docs/core/design/PROMPT-SYSTEM.md:18`「`thincoder-core/tool-docs/`（53 档工具描述）」、`:20`「`thincoder-core/tool-docs/`（53）」、`:153`「（53 档工具描述）」——「唯一读数处」在盘上不成立，且本批又在 `CORE-UNIFICATION.md` 的两处改后文本内新增 53 的读数 | 改为「读数口径出处 = `PROMPT-SYSTEM.md:310`」（只声明口径出处，不声明唯一读数），或其余三处改指 `:310`（D2） |

**正向核对（本轮实读通过，不作发现）**：轮次 1 第 1 条（🔴）的点名行已全部进册且现文逐字对盘一致——`PROMPT-SYSTEM.md:173 / :232 / :250 / :268 / :344 / :848 / :881 / :954`（盘上逐字核：`:173` 变更流句、`:232` 「两面各 +1 行」、`:250` 「两份锁照常适用」、`:268` 「落笔口径 = 中文设计文档设计轮落形」、`:344` 「提示词正本 D1–D7」、`:848`（见 `:848` 行）「中文正本本设计轮落形」、`:881` 节标题「## 8. 提示词设计→实现流程（M9 落点）」、`:954` 「见 §8 提示词设计 → 实现流程」）；`DOC-SYSTEM.md:388`「提示词文件（含中文模板）零写入」；`DOC-DISCIPLINE.md:683` / `:1856`。零命中档登记（`:296`）与「已判非」登记（`:435`）在册。轮次 1 第 2 条（AC7）已按「规范面 / 记录面」两读法写死（`:51` · `:242` · `:454` 三处同集）。第 3 条（W5/W8）改法已换成不携带连续子串的指法（`:121` · `:124`）且 R5 判据同步收窄（`:443` · `:456`）。第 5 条（48 → 53）已在 A13 改后落到 53。第 6 条主处置已在 §2.5 / D-4 写死（残留见本表 #3）。最接近先例行（`:255`，含对齐面 / 三条偏离 + 偏离理由）与勘察证据行（`:257`，含「独立文档仓结论 = 不相关（已查无）」+ 读数出处）均在册 ⇒ 判据 9 / 10 满足。

**范围限制**：本轮无项目标准档、无文档地图声明（Document ownership 判据降级，归属判据以 Project Guide + 在盘 `DOC-SYSTEM.md` / `DOC-DISCIPLINE.md` 为准）；按对象声明「不重新猎新问题」，§2.7 表的既有形态（`.md` 行携行数与预计 Δ）与 `DOC-DISCIPLINE.md:223`「取消 .md 行数标注」的关系本轮不复审。

VERDICT: pass
**计数**：🔴 0 · 🟡 4 · 🔵 1

## §4 用户批准（主 agent）

**用户批准（2026-10-19 00:44）**——依据 = 用户 2026-10-18 23:32 逐字「**后续都自动跑完吧**」（整批令，覆盖 R1–R6 各步的评审发起与实施启动）。

**批准范围**：R4 设计（§3 两轮：轮次 1 changes-required 🔴1 🟡5 → 轮次 2 **pass**）⇒ 落 22 组 A 项 + 24 档 B 组 + 13 档需求档 + 地图。

**批准依据（在盘）**：

| 项 | 读数 |
|---|---|
| 轮次 1 | 🔴1（判面二清单被 `design/prompts` 字面口径漏掉 11 处）+ 🟡5（AC7 不可达 · W5/W8 改法无效 · 改后未逐字 · 48 档 · TODO 悬空） |
| 轮次 2 | **pass**；四条已实证落地；两处修正（§2.10 新补 133/135 处） |

**落笔分工（D1）**：机制档 = eng-designer（`#30`–`#61` 共 19 笔）· 需求档 13 档 + 地图 = 主 agent（本席）。

**实施规模**：约 **250 处**（含终扫追加的清单外残留 71 处 + A14/A15/A20 三个未派组 + 需求侧 30 处）。

**未含**：提示词面实体（R1/R3 已落）· `scripts/prompt-refs-check.mjs` 的目录元素（R5 本活）· CN 目录实删（R5）。

## §5 实施记录（eng-coder）
**状态行**：实施完成 2026-10-19（两处上抛修复已落盘（T11 `:46` 交付物面 / T12 `:49` 点名三案）；审计 converged · 评审 pass · fix round 0）



### 5.1 本笔范围与笔域

**笔域**：`thincoder-core/prompts/discipline-engineering.md`（产品代码面 · 提示词面板）· 两处 · 只改父侧裁定的两条上抛；本批 §2 的 A17–A19（EN 笔域句）**不在本笔**（父侧未派单）。禁改面（CN 镜像 / 机制档 / 需求档 / 本档 `:184` D4 规则本体）零触碰。

### 5.2 两处改前 → 改后（逐字，整行）

**T11 · `:46`**

- 改前：`4. **Testing** — verify. **Verify by actually running it**: the change's implementer runs the change-time feedback loop; the parent runs the real check at delivery (one-line readings). **Testing produces no test-design document and mandates no per-user-story case** — unit tests leave no standing document, and the **UAT report** is step 1's deliverable (signed per delivery end, not per task); verification spend ∝ cost of failure.`
- 改后：`4. **Testing** — verify. **Verify by actually running it**: the change's implementer runs the change-time feedback loop; the parent runs the real check at delivery (one-line readings). **Testing produces no test-design document and mandates no per-user-story case** — unit tests leave no standing document, and the **UAT report** is a **delivery-face document** (the client signs it per delivery end, not per task); verification spend ∝ cost of failure.`
- 判据：原句把 UAT 报告挂在「step 1」上——本档四步里 step 1 = Requirements，字面读会落到「需求步的交付物」；现改为按**面**归属（交付物面），与机制档 `docs/core/design/TESTING.md:417`（`的验收报告——集成测试（= UAT · 用户验收测试）的文档面`）与需求档 `docs/core/requirements/TESTING.md:212`（`## 7. UAT 验收总表（RTM）· 交付物面`）同旨。`signed per delivery end, not per task` 并入括注（加了签署主体 the client），无重复。

**T12 · `:49`**

- 改前：`**Light channel (detail-face ∥ convergence-face controlled bypass — hit one of the three ⇒ walk; bypass ≠ cancellation)**: any one of the three below ⇒ skip the "Design → Review → Approval" chain — direct edit → live walkthrough → freeze:`
- 改后：`**Light channel (detail-face ∥ convergence-face controlled bypass — hit one of the three ⇒ walk; bypass ≠ cancellation)**: any one of the three named cases — detail / cosmetics · defect fix · problems named on the spot during a walkthrough ⇒ skip the "Design → Review → Approval" chain — direct edit → live walkthrough → freeze:`
- 判据：`below` 是与刚清掉的 `, above` 同族的相对指针（违本档 `:184` D4）；现句内点名三项，且与下列 1/2/3 条标题逐字对应（Detail / cosmetics · Defect fix / Problems named on the spot during a walkthrough）——计数与清单同轮一致（D3），无悬空指代。

### 5.3 验证读数

| 判据 | 命令 / 手段 | 读数 |
|---|---|---|
| ① 歧义消解 | `grep -n "step 1" thincoder-core/prompts/discipline-engineering.md` | **0 命中** |
| ② 相对指针实例数 | grep 工具 `\b(above|below)\b`（ignoreCase）全档 | **指针实例 = 0**；命中 2 行共 3 次，均非实例：`:40` `independent doc repos above all`（副词短语「尤其」）· `:184` `NO "see above / see that section" relative pointers`（同一句 2 次，D4 **规则本体举例**，父侧已嘱不动） |
| ③ 装配 warnings | `assemblePrompt("engineering" / "eng-coder" / "normal")`（`thincoder-core/prompt-overlays.mjs:68`） | 三场景均 `[]`（另核 prompt 文本含 `delivery-face document` / `three named cases` 各 1、不含 `step 1`） |
| ④ 项目自检 | `cd thincoder-core && npm test` | `test manifest is empty — zero tests = green`（退出码 0）· 该包无提示词专项用例（`test/` 仅 `run.mjs` / `slow.mjs`；cli 侧 test 无 `assemblePrompt` 引用） |
| ⑤ 文档机检 | `doc_check(mode:"gate", docs=["thincoder-core/prompts/discipline-engineering.md"])` | `DOC-CHECK GATE: PASS（0 档）`——提示词面不在声明域（显式 docs 1 档被跳过，回执原样记） |

### 5.4 审计与代码评审（本会话内）

- **偏离审计（explore 子代理，1 轮）**：VERDICT = converged。四项逐条 OK：`:46` 无步序残留 · `:49` 三项句内点名且 `below` 已清零 · 全档 `above/below` 分类（指针 0 / idiom 1 / 规则本体 1）· 两行之外无本笔改动。其提示的「括注 `hit one of the three` 与内联三名语义重复」判为措辞层、非偏差（本轮不改：该括注系原句既有，改动仅换掉 `below`）。
- **代码评审（advisor，type=code，1 轮）**：VERDICT = **pass**（无 🔴）。3 条 🔵 已裁 / 记录项 + 1 条 🟡 协调项（父侧笔域）：`docs/batches/2026-10-18-prompt-EN-parity.md` 的逐条处置仍写 `不修 · 上抛`、`§6` 空段，须由父侧收口时按落盘状态收正并给读数行。
- **终态**：`clean`（0 个 fix round——两处一次落对，审计与评审均无 must-fix）。

### 5.5 表外改动

无。改动全在 `thincoder-core/prompts/discipline-engineering.md` 的两行内。

## §6 验证与收口（父代理）

### 验收与收口（父侧 · 2026-10-19 00:45）

**① 四条收口判据（父侧亲跑 · 第四轮终扫 · 226 档）**

| # | 判据 | 读数 | 判 |
|---|---|---|---|
| 1 | 判面一：域内 `docs/core/design/prompts` 完整字面 | **3**，全在 `scripts/prompt-refs-check.mjs:10/:13/:25` | **R5 本活**——蓝图 §2.9 R5 明写「删一目录元素」；该脚本的扫描路径必须在删目录那一刀里同改 |
| 2 | 强 token 族（中文正本 / CN 正本 / 中文设计档 / 提示词正本 / 设计→实现 / 精确翻译 / 翻译回写 / 运行期落地档 / 内容权 / 父侧定稿） | **21**：5 处在待删 CN 档自身 · 0 处在 scripts · **16 处在规范面** | 16 处**逐条实读判义**（见 ②）——**全部为一致表述或他义，不是双面制残留** |
| 3 | `design/prompts` 字面 | **3**，全在 `scripts/prompt-refs-check.mjs` | R5 本活 |
| 4 | `doc_check` gate | 各笔交付时均 **PASS**（含末笔 `CORE-UNIFICATION.md`） | ✅ |

**② 16 处逐条判义（父侧实读原文）**

| 判 | 处 | 理由 |
|---|---|---|
| **一致表述 · 不动** | `ADVISOR-GUARDS:130` · `API-CONTRACT:4403` · `CONSULTATION:178` · `CONTEXT-COMPACTION:330` `:358` `:579` `:736` · `ENGINEERING-MODE-V2:232` `:331` · `TESTING:128` `:307` · `SPEC-PROMPT-PIPELINE:18` · `METHODOLOGY:108` · `PROMPT-SYSTEM:266` | 「**内容权 = 主 agent + 落笔 = coder**」= 单面制下的**内容 / 笔分离**，与 `DOC-DISCIPLINE.md` D1 新句「内容依据 = 机制文档 ⇒ 唯一作者 = eng-coder」**同义**；这些句**不含 CN 镜像 / 两份 / 中文正本**任何一面词 |
| **他义 · 不动** | `AGENT-LOOP-UPSTREAM:557` | 「基座文本内容权**在核侧**」——核侧 ∥ 端侧的文本归属，不是父侧授权位（`#54` 已判，父侧复核同判） |
| **他义 · 不动** | `MENU:143` | 「版权文案取值（内容权 = 主 agent）」——版权文本，与提示词无关 |

**③ 为何判面一不在 R4 归零**：`scripts/prompt-refs-check.mjs` 的 `PROMPT_DIRS` 是**活代码里的扫描路径**——目录在盘时它是对的，删目录必须同轮改。**蓝图已把它列入 R5**。R4 的判据是「**文档陈述面无残留**」，已达成。

**④ 结算核对**：台账 `#1682` 保持**在途**（覆盖 R1–R6）；本批另有 `#1683`（代码侧常量注，条件触发）。§1–§6 均有内容。

**⑤ 文档机检门**：`DOC-CHECK GATE: PASS`（各笔交付均过；末轮 14 档需求档 + 各机制档全清）。

**⑥ 暂缓批复核**：无暂缓批。

**⑦ 收口测试线**：本批零代码变更（`scripts/` 未动，`DOC-MIGRATION:336` 只改文档指法）；集成场景未受影响。

**⑧ 遗留（三条，均已归位）**

| # | 项 | 去处 |
|---|---|---|
| 1 | `scripts/prompt-refs-check.mjs` 三处扫描路径 | **R5 本活**（蓝图 §2.9 R5） |
| 2 | 代码侧 `helpers.mjs:454/:461/:470` 常量注 `Content authority = parent side` | 台账 `#1683`（条件触发：R5 完成后收正） |
| 3 | CN 镜像 16 档实体 | R5（删） |

**实施规模实测**：机制档 19 笔（`#30`–`#61`）· 需求档 13 档（主 agent）· 约 **250 处**（含终扫追加 71 处 + A14/A15/A20 三个漏派组 + 需求侧 30 处）。
