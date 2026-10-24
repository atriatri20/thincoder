# 2026-10-15 · inject-project-rules-switch
> 六段 append-only，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 编制：主 agent · 2026-10-15 · 来源 = 用户 2026-10-15 04:57 提出（「是否向提示词注入agent.md我也想加个开关，因为有时候有些项目里的agent.md是适用于别的coding agent的，用到thincoder会造成混乱」）+ 05:01 收窄（「我需要一个单独关掉agent.md和project_rules.md注入的开关」）+ 05:02「按全局」+ 05:04「办」。
> 台账 = #1465（core · 归批）。前情 = 无（独立批）。
## §1 讨论（主 agent）
**状态行**：已收口 2026-10-15
<§1 模板占位：本批条目 / 关键判据 / 授权口径>

**批件（用户 2026-10-15）**

- **04:57 提出**（逐字）：「是否向提示词注入agent.md我也想加个开关，因为有时候有些项目里的agent.md是适用于别的coding agent的，用到thincoder会造成混乱。」
- **05:01 收窄**（逐字）：「我需要一个单独关掉agent.md和project_rules.md注入的开关。」
- **05:02 定作用域**（逐字）：「按全局。」
- **05:04 点火**（逐字）：「办」+ 追认配置面（逐字）：「要能配置。说好了的事情你咋拉抽屉？」——指 2026-10-14 既有口径（见下），**配置面属本功能，不是后续可选项**。

**来源链（`PROMPT-SYSTEM.md` §6.24 · 2026-10-14 批 · 台账 #1420 逐字）**

用户 2026-10-14 12:14 原话：「**几个客户端都要能在配置界面上配置**，同时也开放工具给agent让agent也能自己控制开关」——**本批沿用该口径**（既有键 `agent.injectDocs` / `agent.injectMemories` 已按此落地三端）。

**现状（as-of 2026-10-15 实读）**

- 既有键：`agent.injectDocs` ∥ `agent.injectMemories`（`thincoder-core/config.mjs:69` / `:70`，默认 `true`）。
- **`agent.injectDocs` 一键管两样**：① 项目指令文件块（`~/.thincoder/AGENTS.md` 低优 + 项目根 `AGENTS.md` / `project_rules.md`）② 相关文档块（自动检索注入）——**用户要的是把 ① 单独摘出来可控，② 不受影响**。

**本批条目（三项 = 一个功能的三个面）**

| # | 实现什么（对用户意味着什么） | 来源 |
|---|---|---|
| **A** | **新键 `agent.injectProjectRules`** —— 关掉它 ⇒ **`AGENTS.md` / `project_rules.md` 不再注入**；**文档自动检索注入与记忆注入不受影响** | 用户 2026-10-15 04:57 + 05:01 |
| **B** | **三端设置界面都能配**（CLI `/config` · VSC 设置面板 · 桌面设置界面）—— 与既有 `injectDocs` 并列 | 用户 2026-10-14 12:14 原话（§6.24 在册）—— 用户 2026-10-15 05:04 重申「要能配置」 |
| **C** | **`settings` 工具面可自控** —— agent 能自己开关 | 用户 2026-10-14 12:14 原话（同上） |

**关键判据（设计须满足）**

1. **拆键不破既有语义**：`agent.injectDocs` 现管 ①②；新增独立键后，**② 相关文档块的开关仍归 `agent.injectDocs`**（不迁移、零行为变），① 的开关归新键。
2. **默认零行为变**：新键默认 `true`（判据 `!== false`，同族先例 = `agent.injectDocs` / `agent.timerWake`）；**未设置时现行为完全不变**。
3. **阻断点 = 检索/注入调用不执行**（同 §6.24 口径：关 = 调用不执行 + 注入不发生，非仅吞输出）。
4. **热应用**：判点逐 run 现读 `agent.config`；写入落活 config 即**本会话下一次组装生效**（三端各自既有刷新语义，零新机制）。
5. **作用域 = 全局**（用户 2026-10-15 05:02 定）。
6. **收窄判据**：新键只影响 ①；关掉后 ② ③（文档检索 / 记忆）**逐项实测仍工作**。

**边界（本批不做）**

- **不**做按项目开关（用户定全局）。
- **不**改 ② 的既有键语义（迁移 = 越界）。
- **不**新增检索面 / 不改注入内容形态。

**主 agent 报备记录**

- 2026-10-15 05:04 报备（A/B/C 三面 + 来源）→ 用户「办」。
- **父侧自查**：首轮报备曾把 B/C 拆为"后续"，被用户纠正（05:04「说好了的事情你咋拉抽屉？」）——**已收回，B/C 并入本功能**。

**用户裁定续（2026-10-15 05:05–05:07）**

- **05:05「乙」**：职责关系取**完全正交** —— `agent.injectDocs` 收窄只管 ② 相关文档自动检索块；`agent.injectProjectRules` 只管 ① 项目指令块；两键互不影响。（需求档 §2.6 `:243` 已定行 / `:245` 不变式同载。）
- **05:07「还没正式用呢，不用注。」** ⇒ **不做变更告知**（不加运行期提示 / 不加检测代码 / 不加文档告示）。**依据**：`agent.injectDocs` 系 **2026-10-14 落地（昨日）· 尚未正式使用** ⇒ 无依赖旧语义的用户 ⇒ 告知无对象。
  - **⇒ 设计处置**：designer 交付里「老用户行为变更影响面 + 迁移注」一项，**降为设计档内一句事实登记**（"`injectDocs` 语义收窄为只管 ②——该键 2026-10-14 落地、未正式使用，故不设迁移提示"），**不加任何代码/文案**。
  - **本条为评审判据**：评审席若见设计档仍列"迁移提示/告知"为交付项 ⇒ 按本条判为超范围。

**设计交付登记（#43 · 2026-10-15）**

- 落点：`docs/core/design/PROMPT-SYSTEM.md` **§6.27（新增 · as-of 2026-10-15 现盘 `:683-767`）** + §6.24 同步改（键面 / 阻断点表 ① 行 / 正交注 / 不变式行）+ §7 决策记录（D-PS34 / D-PS35 续注 + **D-PS38** 新增）。
- 三项：**A** 新键 `agent.injectProjectRules`（默认 `true` · 判据 `!== false` · 判点 `thincoder-core/agent/setup.mjs`（实施后现盘 `:281`））· **B** 三端配置面逐端落点（file:line）· **C** `settings` 工具面（DEFAULTS 自动派生）。
- 受影响文件 12 档（含逐档现行行数）。
- **上抛（父侧路由）**：三端**设计档**的 #1420 两键端面登记行须随动 —— VSC `docs/vsc/design/SETTINGS.md:46-48` ∥ 桌面 `docs/desktop/design/SETTINGS.md:69` ∥ `docs/desktop/design/UI.md:522`（键数 / 词面）。**⇒ 属本功能文档面，随本批实施轮一并办**（或另派）——**父侧待办**。

## §2 批次任务与设计（eng-designer）
**状态行**：（eng-designer 写入时更新）
<§2 模板占位：本批条目（覆盖） / 设计档落点 / 机制设计 / 受影响文件与测试面 / 验收对照 / 关键决策 / 上抛项>

**状态行**：✅ 设计完成（2026-10-15）

**本批条目（三项 = 一个功能的三个面 · 全部覆盖）**

| # | 条目（对用户意味着什么） | 设计落点 | 状态 |
|---|---|---|---|
| **A** | **新键 `agent.injectProjectRules`** —— 关掉它 ⇒ `AGENTS.md` / `project_rules.md` 不再注入；文档自动检索与记忆注入不受影响 | 设计档 §6.27「职责切分」表 +「阻断点」表（① 行）+「默认零行为变」 | 已设计 |
| **B** | **三端设置界面都能配**（CLI `/config` · VSC 设置面板 · 桌面设置界面） | 设计档 §6.27「三端配置面落点」表（逐端 file:line）+「VSC 三处穿透补齐」 | 已设计 |
| **C** | **`settings` 工具面可自控** | 设计档 §6.27「`settings` 工具面」段（DEFAULTS 派生） | 已设计 |

**职责切分（用户 2026-10-15 05:05 拍板「(乙) 完全正交」）**

| 键 | 管 | 默认 / 判据 |
|---|---|---|
| `agent.injectProjectRules`（新） | ① 项目指令文件块（`~/.thincoder/AGENTS.md` 低优 + 项目根 `AGENTS.md` / `project_rules.md`） | `true` / `!== false` |
| `agent.injectDocs`（**职责收窄**——只管 ②） | ② 相关文档块（自动检索 + 注入） | `true` / `!== false` |
| `agent.injectMemories`（零动） | ③ 相关记忆块 | `true` / `!== false` |

**两键互不影响**：关 `injectDocs` ⇒ ① 照常注入；关 `injectProjectRules` ⇒ ② 照常检索。

**设计档落点**：`docs/core/design/PROMPT-SYSTEM.md`——**新增 §6.27「项目指令注入独立开关（`agent.injectProjectRules` · 拆 ① 出/职责正交）」**（`:683-767` · as-of 2026-10-15）；同步更新 §6.24 键面 / 阻断点表（① 行改指新键 + 三键正交注）、§6.24 不变式行、§7 决策记录（D-PS34 / D-PS35 各加 2026-10-15 续注 + 新增 **D-PS38**）。**同族单源**：§6.24 仍是注入开关族机制档（#1420 本体），§6.27 = 本批拆键设计（两节互指，无重复详述——D2）。

**受影响文件全清单（逐档行数 · as-of 2026-10-15 实读）**

| 文件 | 现行数 | 本批预计 Δ | 落点 |
|---|---|---|---|
| `thincoder-core/config.mjs` | 513 | +2（`injectProjectRules: true` + 注释） | `:69-70` 邻位 |
| `thincoder-core/agent/setup.mjs` | 294 | +1（`:57` 消费点变量）+ 改 1 行（`:276` 换判变量） | `:57` / `:276` |
| `thincoder-core/agent-tools/settings.mjs` | 297 | **结构不变**（工具面零改码——DEFAULTS 自动派生） | `:55-69`（读面，零改） |
| `thincoder-cli/src/tui/cmd-config.mjs` | 509 | +1 行（主菜单项）+ 1 行（view）+ 改 3 行（`:362`/`:388` 词面 + `:462` 谓词并入新键） | `:362`/`:388`/`:462` |
| `thincoder-vscode/src/agent/setup.mjs` | 317 | +4（默认种 + raw 读 + `agentFields` 白名单 + 注释） | `:131`/`:160`/`:180` |
| `thincoder-vscode/src/extension/settings.mjs` | 424 | +2 | `:45-46`/`:165-166` |
| `thincoder-vscode/src/extension/settings-panel-write.mjs` | 222 | +1 | `:84-85` 邻位 |
| `thincoder-vscode/webview/settings-agent.js` | 203 | +3（控件 + 载荷 + `EDIT_FIELDS`） | `:29-30`/`:128-129`/`:153` |
| `thincoder-vscode/locales/en.json` | 347 | +1 键 + 改 1 值 | `:144-145` + Help `:237-238` |
| `thincoder-vscode/locales/zh.json` | 347 | +1 键 + 改 1 值 | `:144-145` + Help `:237-238` |
| `thincoder-desktop/renderer/views/settings-agent.mjs` | 192 | +1（`NAMED_FIELDS` 行）+ 表注改（二十键 ⇒ 二十一键） | `:63-64` |
| `thincoder-desktop/renderer/i18n-views.mjs` | 434 | +1 键 × 2 语 + 改 1 值 × 2 语 | `:208-209`/`:398-399` |

**设计档本体**（`docs/core/design/PROMPT-SYSTEM.md`，本设计轮已落）不计入上表 12 档：+65（§6.27 新增）+ §6.24 / §7 续注。**测试档**：本批单测档随批档存放（`docs/batches/` 邻位），不进产品树、不计入 12 档。

**`settings` 工具面**：`thincoder-core/config.mjs:69-70` 邻位声明 ⇒ 装载期经 `_deriveTypes(DEFAULTS)`（`thincoder-core/agent-tools/settings.mjs:55-69`）自动进 `TYPE_MAP`（`boolean`）⇒ list/set 面可见可写 + 类型护栏自动跟随，**实现面零改码**。

**验收对照（逐条可机判 · 回指需求 §2.6 验收四行）**

| # | 判据（可机判） | 回指 |
|---|---|---|
| 1 | `settings` 工具 list 面含 `agent.injectProjectRules`（布尔）；写 `false` ⇒ 下一回合 `systemPrompt` **无** `Project instructions (follow these as project conventions):` 块，**且** `[Relevant documentation` / `[Relevant memories` 两 reminder 照常 | 需求验收① |
| 2 | 三端界面各显该开关：CLI `/config` 行在（`cmd-config.mjs` `action === "agent.injectProjectRules"` 分支可达）；VSC `#ag-injectprojectrules` switch 在（`webview/settings-agent.js`）；桌面 `NAMED_FIELDS` 含 `agent.injectProjectRules` | 需求验收② |
| 3 | **默认零行为变**：不设三键跑装配，`systemPrompt` 与 #1420 落地态逐项同（① ② ③ 块全在）；②③ 判点零改 ⇒ 逐字零变 | 需求验收③ |
| 4 | **正交实测（关后 ②③ 仍工作）**：写 `agent.injectProjectRules=false` ⇒ ① 块消失 + ② ③ reminder 仍在；写 `agent.injectDocs=false` ⇒ ② 消失 + **① ③ 仍在**（本批新语义——甲乙之别实证） | 需求验收① + 判据 6 |
| 5 | VSC 三处穿透齐（默认种 / raw 读 / `agentFields` 白名单）——缺一则该键在 `config.json` 关不掉 | §5.15 先例 |
| 6 | 工程模式装配零变：关三键后 `discipline-engineering` / `persona-engineering` 槽位装配（`assemblePrompt`）逐字节同 | 需求不变式② |

**关键决策**

- **D-PS38**（新增）：职责关系取 **(乙) 完全正交**——用户 05:05 拍板；已知代价（改 `injectDocs` 已落语义）已录 + 迁移注（三端词面改述 + 新键说明，**不设**弹窗 / 迁移脚本）。否决 (甲) 总闸 + 分闸。
- **D-PS34 / D-PS35 续注**：键面扩为三键；① 判点改读新键（判点位置 `setup.mjs:276` 零变、只换判变量）。

**上抛项（报父侧）**

1. **观察项（非阻断）**：`docs/*/design/` 三端各档（VSC `SETTINGS.md:46-48` ∥ 桌面 `SETTINGS.md:69` ∥ `UI.md:522`）已载 #1420 两键的端面登记行——本批实施后**那些行的键数 / 词面须随动**（§6.27「三端配置面落点」已给逐行坐标，但归属 = 那些档的写权面：VSC/桌面设计档的键数登记行在本批射程外，**请父侧路由**）。
2. **需求档合规核对**：需求 `docs/core/requirements/PROMPT-SYSTEM.md` §2.6（`#1465` 块）五要素齐（目标 / 功能点 / 边界 / 验收 / 依赖）+ 已定行 `:243` 已载 (乙) ⇒ **合规、无需父侧补笔**。
3. **prompt-refs-check 基线红**：`docs/core/design/prompts/persona-eng-designer.md:41` ∥ `thincoder-core/prompts/persona-eng-designer.md:41` 各 2 条命中——**存量基线**（非本批引入，本文件不在本批写域）。

**自洽检查三项读数（修复轮 1 完稿实测 · 2026-10-15）**

1. **引用集 ↔ 标题集**：§6.27 内引用的档内节号 = `§6.24` / `§6.27`（自指）；跨档引用 `§2.6`（需求档 `docs/core/requirements/PROMPT-SYSTEM.md`）∥ `§5.15`（timer-wake 设计档——§6.24 既有同形引用）；档内实存节 = 6.1–6.27 全部在册 ⇒ **引用集 ⊆ 标题集 ✓**（0 悬空）。
2. **表行 ↔ 小结数**：§6.27 四张表——职责切分 3 行（三键）∥ 阻断点 3 行（① ② ③）∥ 三端落点 4 行（CLI / VSC 穿透面 / VSC UI 链 / 桌面——表头已明写「VSC 分两行列」）∥ 受影响文件 12 行（12 档）；小结声明的数目逐一对上 ⇒ **表行 ↔ 小结数 ✓**。
3. **声称 ↔ 实测（修复轮逐格实读）**：受影响文件 12 档行数 = 修复轮 `readFileSync` **逐格实测**（513 / 294 / 297 / 509 / 317 / 424 / 222 / 203 / 347 / 347 / 192 / 434——12/12 全等，脚本核验输出 `rows=12 ok=12 mismatched=0`）；VSC 穿透三坐标 `agent/setup.mjs:131` / `:160` / `:180` 逐行实读存在（`:131` `cfgInjectDocs = DEFAULTS.agent?.injectDocs !== false` ∥ `:160` `raw.agent?.injectDocs ?? cfgInjectDocs` ∥ `:180` `injectDocs: cfgInjectDocs, injectMemories: cfgInjectMemories,`；对照 `:178` = `timerWake: cfgTimerWake`）；桌面坐标 `agent-host.mjs:183-185` 实读 = `assembleAndLoad` → `assemble` ⇒ **声称 ↔ 实测 ✓**（零「约 / 大概」）。

**机检**：`doc-check-width.mjs docs/core/design/PROMPT-SYSTEM.md` = **0 命中**（exit 0——实测）；`prompt-refs-check.mjs` 复跑 = 4 命中，全为 `persona-eng-designer.md:41` 存量基线（非本批引入，本档不在本批写域）；`doc-check.mjs` 本批域（`docs/core/**`）零新增红（该脚本全仓基线含 server-* 等他域存量红——非本批引入）。

**边界（本批不做）**：零实施（仅设计档 + 批档 §2）· 不做按项目开关 · 不改检索机制本体 · 不删数据 · 工程模式装配链零触 · `_archive/**` / 台账 / `prompts/**` 零触 · 需求档零笔。

### #59 · 设计档随动收正（fix 轮 · 2026-10-15 · 本批同一功能的设计面）

**来源**：#55 实施轮交付后报的 3 处设计档滞后（§5 out-of-scope 注记 1 ∥ 2 + §2 上抛项 1），父侧路由本批一并办。**点修**——按号改，逐号回读。

**逐号处置（3 号 + 2 处应声随动）**

| # | 处 | 改动 | 依据 |
|---|---|---|---|
| **1** | `docs/core/design/PROMPT-SYSTEM.md` 判点坐标 | `:605`/`:701`/`:709`/`:713`/`:753`/`:807`/`:810` 的判点 ⇒ **`:281`**；`:709` 的「判点位置…逐字不变」句 ⇒ 改述「**坐标随动**：`:57-60` 新增消费点变量 3 行 ⇒ 判点由 `:276` 下移至 `:281`（**位移 5 行**——语义零变，条件形逐字同）」；`:183` 连带坐标（运行期追加面区间）随动 | 现盘实读（见下） |
| **2** | `docs/vsc/design/SETTINGS.md:46-49` | 「注入开关**两键**」⇒「**三键**」（`injectProjectRules` ∥ `injectDocs` ∥ `injectMemories`）+ 补职责切分句 + 载荷 / 控件逐处由两键改三键；穿透面坐标随 #55 由 `:131-132`/`:160-161`/`:180` 收正为 **`:132`/`:162`/`:182`** | 现盘实读 |
| **3a** | `docs/desktop/design/SETTINGS.md:69` | 「二十键」⇒「**二十一键**」；「注入开关两键 `injectDocs` ∥ `injectMemories`——#1420」⇒「注入开关**三键** `injectProjectRules` ∥ `injectDocs` ∥ `injectMemories`——#1420 · #1465 · 2026-10-15」 | 现盘 `NAMED_FIELDS` **21 行** |
| **3b** | `docs/desktop/design/UI.md:522` | `i18n-views.mjs` 行数「**422**」⇒「**437**」（#1420 两键 + #1465 一键合计；422 系 #1420 后值、#55 未回填） | 现盘 **437** 行 |
| **应声随动** | `docs/desktop/design/SETTINGS.md:409` | `settings-agent.mjs` 行数「**192**」⇒「**194**」（`NAMED_FIELDS` +1 键 + 表注释「二十键 ⇒ 二十一键」齐平）——该行正文正是本批改动面，不随动即留 doc-code 矛盾 | 现盘 **194** 行 |

**说明（应声随动的判由）**：`3b`/`409` 两处**不在任务书列名内**，属**同一改动面的直接派生**——`UI.md:522` 是「键数随动」这条要求本身的载体（任务书写「`UI.md:522` 同法」但该行实为**行数登记行**，非键数句；`#55` 加 3 键 × 两语 + 注释 ⇒ 行数必变），`409` 是 `NAMED_FIELDS` 行数的登记行（键数改 ⇒ 行数必改）。**零新增语义**：均只把现盘读数写真，未引入任何新判断。**如判为越界请退回**。

**判点位移实数**：HEAD `:276` ⇒ 现盘 `:281`，**差 5 行**（`#55` 在 `:57-60` 增消费点变量 3 行 + `:117-118` 注行 1 行 + `:279-280` 注行 1 行净额）。任务书写的「**位移 5 行**」与实读吻合（任务书另处写「本批 `:57-60` 增 3 行致下移」——3 行是该处局部增量，5 行是判点净位移，两者不矛盾）。

**实读核证（逐处，2026-10-15）**

| 坐标 | 现盘读数 |
|---|---|
| `thincoder-core/agent/setup.mjs:60` | `const injectProjectRules = agent.config?.agent?.injectProjectRules !== false` ✅ |
| `thincoder-core/agent/setup.mjs:281` | `const projectRules = injectProjectRules ? await loadProjectInstructions(agent.cwd) : null` ✅ |
| `thincoder-vscode/src/agent/setup.mjs:132` | `let cfgInjectProjectRules = DEFAULTS.agent?.injectProjectRules !== false` ✅ |
| `thincoder-vscode/src/agent/setup.mjs:162` | `cfgInjectProjectRules = raw.agent?.injectProjectRules ?? cfgInjectProjectRules` ✅ |
| `thincoder-vscode/src/agent/setup.mjs:182` | `injectProjectRules: cfgInjectProjectRules, injectDocs: cfgInjectDocs, injectMemories: cfgInjectMemories,` ✅ |
| `settings-agent.mjs` `NAMED_FIELDS` | **21 行**（`{ path: ... }` 计数）——「二十一键」对上 ✅ |
| `i18n-views.mjs` | **437** 行——`UI.md:522` 回填值对上 ✅ |
| `settings-agent.mjs` | **194** 行——`SETTINGS.md:409` 回填值对上 ✅ |

**自洽检查三项读数**

1. **引用集 ↔ 标题集**：`PROMPT-SYSTEM.md` 档内节标题 **45** 个（含 `6.24` / `6.27` 实存）；本批改文本内引的档内节号 = `§6.2` / `§6.24` / `§6.27`（均实存）∥ 跨档引 `§2.6`（需求档）∥ `§5.15`（timer-wake 设计档）——**本批新增/改文本零悬空引用**（脚本报的 dangling 全为跨档引用，非档内节号）。**✓**
2. **表行 ↔ 小结数**：`PROMPT-SYSTEM.md` §6.24 阻断点表 **3 行** ∥ §6.27 阻断点表 **3 行** ∥ 职责切分表 **3 行**（三键）——各表行数 ↔ 各自「三」的声明一致；桌面 `SETTINGS.md:69` 「二十一键」↔ `NAMED_FIELDS` **21 行**实读一致；VSC `SETTINGS.md:46` 「三键」↔ 三键名逐项在列一致。**✓**
3. **声称 ↔ 实测**：上表 8 项坐标**逐条 `readFileSync` / 行读实测**（无「约 / 大概」）；三处行数值（437 / 194 / 21）**逐格实测对上**。**✓**

**机检读数**

- `doc-check-width.mjs` 四档（`PROMPT-SYSTEM.md` / `vsc/SETTINGS.md` / `desktop/SETTINGS.md` / `desktop/UI.md`）⇒ **exit 0**（零超宽行）。
- `prompt-refs-check.mjs` 复跑 ⇒ **4 命中，全为 `persona-eng-designer.md:41` 存量基线**（§2 上抛项 3 在册，非本批引入，该档不在本批写域）——**本批四档零新增命中**。

**边界（本席未做）**：零产品码改（`#55` 已交，本席不碰）· 不动 `_archive/**` · 台账 · `prompts/**` · 清理面 · 不脚本批改 · 需求档零笔。

**上抛（报父侧路由）**

1. **`docs/desktop/design/SETTINGS.md:409` 行数登记行**——任务书未列名，本席判为「同一改动面的直接派生」并已随动（原 `192` ⇒ 现盘 `194`）；**若判越界请退回**。
2. **`docs/desktop/design/UI.md:522` 语义错配**——任务书写「`:522` 同法（改二十键 ⇒ 二十一键）」，但该行实为 `i18n-views.mjs` 的**行数登记行**（非键数句），改法是回填行数 `422 ⇒ 437`；**任务书的坐标—语义描述与该行实际内容不符**，本席按现盘实义处置并如实登记。
3. **`PROMPT-SYSTEM.md:807`（D-PS35）/`:810`（D-PS38）**——亦携旧 `:276`，任务书未列名；因同属判点坐标面，本席一并收正（否则留 doc-code 矛盾）。
4. **`AGENT-LOOP-SUBAGENT.md:398`/`:406` 的 `thincoder-vscode/src/agent/setup.mjs:276`**——经实读，该处指向 **VSC 端 `setup.mjs` 的 depth-0 门**（与核 `setup.mjs` 同名异档），**非本批坐标面，未改**（不动 = 正确）。

## §3 设计评审（评审子代理）

### 轮次 1（评审子代理）

## 设计评审（#1465 · §6.27 `agent.injectProjectRules`）——发现表

| # | Category | Severity | Issue | Suggestion |
|---|----------|----------|-------|------------|
| 1 | Feasibility | 🔴 | **VSC 三处穿透坐标指错文件**——`PROMPT-SYSTEM.md:731` 明写「逐行坐标 = 上表 VSC 行」，而上表 VSC 行（`:728`）给的坐标落在 `thincoder-vscode/src/extension/settings.mjs:45-46` ∥ `:165-166`（读链归一 / 快照携键）与 `settings-panel-write.mjs:84-85`（写链 patch）。timer-wake 先例的**三处穿透**实测住在 `thincoder-vscode/src/agent/setup.mjs`：默认种 `:131-132`（`DEFAULTS.agent?.injectDocs !== false`）∥ raw 读 `:160-161`（`raw.agent?.injectDocs ?? cfgInjectDocs`）∥ `agentFields` 白名单 `:180`（`injectDocs: cfgInjectDocs`，表体 `:174-183`）。照本设计实施 ⇒ 改错档、真穿透面零补 ⇒ `config.json` 关不掉该键——正是本设计自己警告的「timer-wake 旧疾复现」。 | 把 VSC 行的三处穿透坐标改指 `thincoder-vscode/src/agent/setup.mjs` 的 `:131`（默认种）∥ `:160`（raw 读）∥ `:180`（`agentFields` 白名单），与 timer-wake 键（`:128` ∥ `:159` ∥ `:178`）同址同形；`extension/settings.mjs` / `settings-panel-write.mjs` / `webview/settings-agent.js` 保留为**界面链路**（读链归一 / 写 patch / 控件），两类坐标分列、勿混为一处。 |
| 2 | Requirements | 🟡 | **判点 ① 读变量归一未落在「归一」处**——`PROMPT-SYSTEM.md:701` 称「`:57` 新增 `injectProjectRules` 归一」，但 `setup.mjs:57-58` 是逐 run 现读的**消费点**（`const injectDocs = agent.config?.agent?.injectDocs !== false`），非「归一」层；真归一 = `config.mjs` DEFAULTS + VSC `agent/setup.mjs:160` raw 读。措辞易使实施者只在核侧加一行而漏 VSC 侧。 | 把 `:57` 表述改为「核侧新增消费点变量 `const injectProjectRules = agent.config?.agent?.injectProjectRules !== false`」，并单列 VSC 侧同址归一坐标（见发现 1）。 |
| 3 | Acceptance criteria | 🟡 | **「默认零行为变」的机判法只给正向断言、未给失败面**——`:712` 的断言（含 `Project instructions…` 块 + 两 reminder）无法区分「① 照常注入」与「② ③ 意外被牵连关掉」以外的退化；且未覆盖验收① 的反向面（写 `injectProjectRules=false` ⇒ ① 无块 **而** ②③ 照常）。 | 补反向断言：①关 ⇒ `systemPrompt` 无 `Project instructions…` 块 ∧ 仍含 `[Relevant documentation` / `[Relevant memories`；②关 ⇒ 无 `[Relevant documentation` ∧ 仍含 `Project instructions…`——三键正交可机判。 |
| 4 | Clarity | 🟡 | **CLI toggle 分支行号偏移**——`:727` 给「toggle 分支 `:462`」，实测 `cmd-config.mjs:462` 的分支判别式仅列 `agent.injectDocs \|\| agent.injectMemories`（新增键须并入该判别式），`:465` 才是 `slice("agent.".length)`——设计未点明「判别式须显式加新键」这一非天然兼容点。 | 明写「`:462` 分支判别式并入 `agent.injectProjectRules`（`:465` 取键机制天然兼容）」，避免实施者只加菜单项漏改判别式。 |
| 5 | Acceptance criteria / Doc | 🟡 | **受影响文件 12 档清单无行数标注与预期增量**——评审重点 ⑤（12 档清单是否全）在本设计档内无可核载体：§6.27 只有散文式落点行（`:727`–`:731`），§5（`:145-150`）为指针节、明示「不复制」。档内无「当前行数 + `≤±N`」表，故无法核 12 档是否齐、亦无法判越 300/500 结构线（评审标准第 8 条）。 | 在 §6.27 补「受影响文件（12 档）」小表：档 : 行 ∥ 当前行数 ∥ 预期增量（`≤±N` / 结构不变）——含核 `setup.mjs` ∥ `config.mjs` ∥ `settings.mjs`（工具面零改码，标注「结构不变」）∥ CLI `cmd-config.mjs` ∥ VSC 4 档 ∥ 桌面 3 档 ∥ 测试档。 |
| 6 | Document ownership | 🟡 | **§6.24 与 §6.27 对同一键面「族面现状」两处并存**——`:599`（「族面现状 = 三键——①…已拆至 `agent.injectProjectRules`（2026-10-15 · §6.27）」）与 `:621`（「本族新增第三键…本节两键语义收窄」）为**同机制的前向指针**，非矛盾，但 §6.24 表（`:603-607`）① 行仍以「`agent.injectProjectRules`（2026-10-15 拆出——§6.27）」标注，与 §6.27 表（`:699-703`）并存两份 ① 行——读者需自行对账。 | 在 §6.24 表下补一行「本表 ① 行以 §6.27 为准（本批后态）」单向指针句，使两表的 ① 定义面分出主从。 |
| 7 | Scope / Doc hygiene | 🔵 | **§7 表内 D-PS38 排在 D-PS37 之前**——`:783`（D-PS38）在 `:784`（D-PS37）之前，编号序与行序不符（D-PS37 为 2026-10-14 批、D-PS38 为本批）。 | 保持编号不变、按编号序重排两行（D-PS37 在 D-PS38 前），或注明 D-PS38 为「插入行」。 |
| 8 | Doc hygiene | 🔵 | **`:718` 括注残留半句形**——「（`:362` / `:388` 两处词面去「项目指令文件 + 」)」内含不成对括号（`+ 」`）与未闭合右括号，属表述瑕疵（非规范面失效表达）。 | 改写为「（`:362` / `:388` 两处词面去掉『项目指令文件 + 』括注）」。 |
| 9 | Feasibility | 🔵 | **桌面「装配表同键复用」坐标欠准**——`:721` 引 `agent-host.mjs:198-199`，实测该区为 `ensure()` 函数头（`:199`），装配复用实体现在 `:183-185`（`assembleAndLoad` → `assemble`）。结论（桌面免穿透）成立，仅坐标偏移。 | 坐标改指 `thincoder-desktop/src/main/agent-host.mjs:183-185`（`assembleAndLoad` 调 `assemble`）。 |

**核验轮（本评审实读）**：核 `setup.mjs:57-58`/`:118`/`:155`/`:157`/`:169`/`:276`/`:287-288`/`:103-112` ∥ `config.mjs:69-70`/`:333` ∥ `helpers.mjs:399` ∥ `assemble.mjs:65`/`:106` ∥ `agent-tools/settings.mjs:55-69`/`:239`-`:254`/`:62` ∥ `subagent-spawn.mjs:300-302` ∥ CLI `cmd-config.mjs:362`/`:388-389`/`:462`/`:465` ∥ VSC `extension/settings.mjs:45-46`/`:165-166` ∥ `settings-panel-write.mjs:84-85` ∥ `webview/settings-agent.js:29-30`/`:128-129`/`:153` ∥ `agent/setup.mjs:128`/`:131-132`/`:159`/`:160-161`/`:174-183`/`:180` ∥ `locales/zh.json:144-145`/`:237-238` ∥ 桌面 `views/settings-agent.mjs:3`/`:63-64` ∥ `i18n-views.mjs:208-209`/`:398-399` ∥ `agent-host.mjs:183-185`/`:199` ∥ 档 `CONFIG.md:157` ∥ `SETTINGS-TOOL.md:59-69`。**未核**：测试档在场性（`test/**` 不在本档射程）。

**计数**：🔴 ×1 ∥ 🟡 ×5 ∥ 🔵 ×3 ∥ 合计 9。

**域外注记（无严重度）**：① 需求档 §2.6 `:243`/`:245` 已定行与本设计一致，未发现需求—设计冲突；② 「受影响文件 12 档」若落在批次档 `docs/batches/2026-10-15-inject-project-rules-switch.md`（该档实存），则发现 5 的行数标注要求可改由批档承载——但本设计档自身仍缺该表（§5 明示不复制），评审标准第 8 条无从核；③ 未发现 §6.24/§6.27 机制面表述矛盾（同机制两处描述不同 = 文档归属 🔴 不成立）。

VERDICT: changes-required

### 轮次 2（评审子代理）

## Design Review — Round 3（修正轮 #45 落地后重审 · 验证 9 号修正声明）

**Reviewed:** `docs/core/design/PROMPT-SYSTEM.md` §6.27 (`:683-767`) + §6.24 sync (`:595-627`) + §7 D-PS34/35/37/38 (`:806-810`) against `docs/core/requirements/PROMPT-SYSTEM.md` §2.6 (`:240-248`). All code-level `file:line` claims re-verified by direct reads this round.

| # | Orig# | File | Severity | Status | Notes |
|---|-------|------|----------|--------|-------|
| 1 | 1 | docs/core/design/PROMPT-SYSTEM.md | 🔴 | Fixed | `:734` re-pointed to `thincoder-vscode/src/agent/setup.mjs` 三处穿透 `:131` ∥ `:160` ∥ `:180`（timer-wake `:128` ∥ `:159` ∥ `:178`）——码面实读印证：`setup.mjs:131` `let cfgInjectDocs = DEFAULTS.agent?.injectDocs !== false` ∥ `:160` `cfgInjectDocs = raw.agent?.injectDocs ?? cfgInjectDocs` ∥ `:180` `injectDocs: cfgInjectDocs, injectMemories: cfgInjectMemories,`。`:738` 明标「真穿透面 = `agent/setup.mjs`（非 `extension/settings.mjs`）」，UI 链分列于 `:735`。 |
| 2 | 2 | docs/core/design/PROMPT-SYSTEM.md | 🟡 | Fixed | `:701` 措辞改「`:57` 新增消费点变量 `const injectProjectRules = agent.config?.agent?.injectProjectRules !== false`」。 |
| 3 | 3 | docs/core/design/PROMPT-SYSTEM.md | 🟡 | Fixed | `:716` 反向 ① + `:717` 反向 ② + `:718` 「⇒ 三键正交由此三向断言机判」。 |
| 4 | 4 | docs/core/design/PROMPT-SYSTEM.md | 🟡 | Fixed | `:733` 明标 `:462` 分支谓词须显式并入（**非自动点**）；码面实读：`cmd-config.mjs:462` `if (choice.action === "agent.injectDocs" \|\| choice.action === "agent.injectMemories") {` ∥ `:465` `const key = choice.action.slice("agent.".length)`。 |
| 5 | 5 | docs/core/design/PROMPT-SYSTEM.md | 🟡 | Fixed | `:748-763` 新增「受影响文件（12 档 · 现行行数 as-of 2026-10-15 实读 · 预计 Δ）」表（表头 `:750`）。 |
| 6 | 6 | docs/core/design/PROMPT-SYSTEM.md | 🟡 | Fixed | `:707` 加单向指针「本表 ① 行以 §6.27 为准（本批后态）」。 |
| 7 | 7 | docs/core/design/PROMPT-SYSTEM.md | 🔵 | Fixed | `:809` D-PS37 先于 `:810` D-PS38——序号与行序一致。 |
| 8 | 8 | docs/core/design/PROMPT-SYSTEM.md | 🔵 | Fixed | `:718` 残缺括号已消：「**⇒ 三键正交由此三向断言机判**（任一方独立可关、关后另两方逐项仍在）。」 |
| 9 | 9 | docs/core/design/PROMPT-SYSTEM.md | 🔵 | Fixed | `:727` 改指 `agent-host.mjs:183-185`；码面实读：`:183` `async function assembleAndLoad(key, slot) {` ∥ `:185` `const agent = await assemble({ cwd, slot, key, deps })`。 |

**计数**：9 条全 resolved（Fixed 9 · Accepted 0 · Unfixed 0 · New 0）。零 🔴 残留。

**残留观察（不阻断 · 本批编辑域外）**：§6.24 `:619` 仍携旧 `agent-host.mjs:198-199` 坐标——属 #1420 原地文本、本批未触。

VERDICT: pass

## §4 用户批准（主 agent）
## §5 实施记录（eng-coder）

**状态行**：实施完成（12 档 + 单测档 · 单测 12/12 绿 · 三键正交实测 · 终态 clean）

**交付摘要（三面 A/B/C 全落 · 12 档 + 单测档）**

| # | 面 | 落点（file:line · 现盘实读） | 状态 |
|---|---|---|---|
| **A** | 核侧新键 + 判点改读 | `thincoder-core/config.mjs:68-73`（`injectProjectRules: true` + 注释）· `thincoder-core/agent/setup.mjs:60`（消费点变量 `const injectProjectRules = agent.config?.agent?.injectProjectRules !== false`）；**① 判点＝`:281`（原读 `injectDocs` ⇒ 换读新变量）**；`:122` ②门 / `:161` ③门 **逐字未动**（职责收窄 = ① 撤出后的自然结果） | ✅ Done |
| **B1** | CLI `/config` | `thincoder-cli/src/tui/cmd-config.mjs:362`（主菜单项新增）· `:389`（view 面板行新增）· `:390`/`:391`（`injectDocs` 词面收窄 · `injectMemories` 原样）· **`:464` toggle 分支谓词显式并入新键**（`:467` `slice("agent.".length)` 取键机制天然兼容） | ✅ Done |
| **B2** | VSC **穿透面三处齐** | `thincoder-vscode/src/agent/setup.mjs:132`（默认种）∥ `:162`（raw 读）∥ `:182`（`agentFields` 白名单）——缺一则 `config.json` 关不掉（timer-wake 旧疾复现） | ✅ Done |
| **B3** | VSC UI 链 | 读链 `src/extension/settings.mjs:45`（归一）+ `:166`（快照携键）∥ 写链 `src/extension/settings-panel-write.mjs:84`（显式布尔写）∥ 控件 `webview/settings-agent.js:29`（`#ag-injectprojectrules` switch）+ `:129`（载荷）+ `:155`（`EDIT_FIELDS`）∥ 词面 `locales/zh.json:144-145`+`:238-239` ∥ `locales/en.json:144-145`+`:238-239`（新键两语 + `injectDocs` 词面/Help 收窄） | ✅ Done |
| **B4** | 桌面设置面 | `thincoder-desktop/renderer/views/settings-agent.mjs:63`（`NAMED_FIELDS` 新增行）+ 表注「二十键 ⇒ 二十一键」四处（`:3`/`:5`/`:27`/`:181`）∥ `renderer/i18n-views.mjs:208`（EN）+ `:399`（ZH） | ✅ Done |
| **C** | `settings` 工具面 | **零改码**（`agent-tools/settings.mjs` 未动）——新键经 `DEFAULTS` ⇒ `_buildShapeTable(DEFAULTS)`（`:69`）自动派生 `boolean` | ✅ Done |

**决策透明表**

| 决策点 | 取法 | 依据 |
|---|---|---|
| `injectDocs` 语义收窄是否需告知/迁移 | **不设**（零代码 / 零文案 / 零弹窗） | 用户 05:07「还没正式用呢，不用注」——`injectDocs` 2026-10-14 落地未用，无依赖旧语义用户 ⇒ 告知无对象 |
| ① 判点是否换址 | **同址换变量**（`loadProjectInstructions` 调用侧） | 设计 §6.27「判点同址判定」——helper 是公开导出面，调用侧判点 = 最小爆炸半径 |
| VSC 是否只改 `extension/settings.mjs` | **否**——真穿透面 = `src/agent/setup.mjs` 三处 | 设计 §6.27「VSC 三处穿透补齐」（timer-wake 阶段 2 先例）：UI 链与穿透面分列，缺穿透则该键 `config.json` 关不掉 |
| CLI toggle 是否自动兼容新键 | **否**——谓词须显式并入 | 设计 §6.27 `:733` 明标「非自动点」；`:467` 取键机制才天然兼容 |
| 键面排序位 | 新键置于 `injectDocs` **之前**（三端同序） | 词面语义序：项目指令（①）⇒ 文档（②）⇒ 记忆（③），与设计 §6.27 职责表同序 |

**验收逐条实测（命令 + 读数）**

| # | 判据 | 实测命令 | 读数 |
|---|---|---|---|
| 1 | 新键默认 `true` · 判据 `!== false` | 单测 T1/T6 | ✅ 缺省 ⇒ ① 在；显式 `false` ⇒ 阻断；`true` ∥ `undefined` ∥ `0` ⇒ 放行 |
| 2 | **三键正交**（关任一另两方仍工作） | 单测 T2/T3/T4（`prepareRun` 真装配） | ✅ `injectProjectRules=f` ⇒ ① 消 ∧ ②③ 在；`injectDocs=f` ⇒ ② 消 ∧ ①③ 在 **（本批新语义实证）**；`injectMemories=f` ⇒ ③ 消 ∧ ①② 在 |
| 3 | 默认零行为变 | 单测 T1 | ✅ 三键缺省 ⇒ ①②③ 三块全在（#1420 落地态） |
| 4 | 工程模式不变式 | 单测 T4b | ✅ 关三键后 `engineering`(depth0) ∥ `eng-coder`(depth1) 的 `systemPrompt` **逐字节同**（槽位装配零触） |
| 5 | 三端界面各显开关 | 单测 T8/T9/T10/T11（源码级落点断言） | ✅ CLI 菜单项+view 行+谓词 ∥ VSC 穿透三处+UI 链六点 ∥ 桌面 `NAMED_FIELDS`+两语 |
| 6 | `settings` 工具面可见可写 | 实跑工具 `list`/`set`/`get`（tmp config） | ✅ list 三键成列（`agent.injectProjectRules = true (boolean)`）；set `false` ⇒ **盘写入 + 内存热应用**；`get` 回读；类型护栏拒绝 `"not-a-bool"`；`null` 清除回退默认 |
| 7 | 零改码（工具面） | `git diff` 无 `agent-tools/settings.mjs` 条目 | ✅ 结构不变 |

**机检读数**

- **批内单测**（随批档归档 · 不进 `test/` 套件）：`docs/batches/2026-10-15-inject-project-rules-switch.test.mjs`
  复跑 = `node --test docs/batches/2026-10-15-inject-project-rules-switch.test.mjs`（仓根）⇒ **tests 12 · pass 12 · fail 0**。
- **CLI 仓语法门**：`thincoder-cli` `node scripts/check-syntax.mjs` ⇒ `126 file(s) OK`（exit 0）。
- **VSC 仓语法门**：`thincoder-vscode` `node scripts/check-syntax.mjs` ⇒ `141 JS files OK`（exit 0）。
- **两语 JSON 合法**：`zh.json` / `en.json` `JSON.parse` ⇒ OK。
- **未跑仓套件**：本批按测试纪律不跑 `npm test`（仓套件 = 收口轮父侧唯一一次）。

**审计与代码评审轮次与终态**

| 轮 | 类型 | 发现 | 处置 |
|---|---|---|---|
| 1 | 内部发散审计（explore，只读） | 1 项 DOC-DRIFT 🟡：`thincoder-desktop/renderer/views/settings-agent.mjs:181` 的 `agentBody` 注仍写「二十键」（同档其余 4 处已改二十一键）+ 2 项准确度注（locale 行数 / 设计档 `:276` 坐标） | **已自修**：`:181` ⇒ 二十一键 |
| 2 | 内部代码评审（advisor · code） | 4 项：🟡×2（设计档判点坐标滞后 `:276` ⇒ 现 `:281`，**属设计席写域 report-only**；`cmd-config.mjs` 512 行越 500 咨询线，**存量近线、本批仅 +2**）+ 🔵×2（**单测 T10 标题误写「十一键」⇒ 已自修**；批档 §1 `:62` 行号跨度漂移，非本席写域） | **已自修 1 项**（T10 标题）；余 3 项 report-only（2 项超本席写域 / 1 项存量近线） |

**终态：`clean`**（自修 2 项均已复跑验证 —— 12/12 绿；未收敛项全为超写域或存量，已如实上报）

**fix round 记录**

| # | 发现 | 修法 | 复验 |
|---|---|---|---|
| 1 | 桌面 `settings-agent.mjs:181` 键数注滞后（审计 🟡） | 「二十键」⇒「二十一键」 | 全档 `二十键` 零残留（grep 复核）；语法门 OK |
| 2 | 单测 T10 标题「十一键」笔误（评审 🔵） | ⇒「二十一键表」 | 12/12 复跑绿 |
| 3 | 自校：`config.mjs` / `setup.mjs` 注释内判点坐标 `:276` ⇒ 实际 `:281`（本批新增 3 行致下移） | 两处注释坐标收正（代码零改） | T7 单测锚模式 ~ 非行号 ⇒ 仍绿 |

**out-of-scope 注记（报父侧路由，本席零改）**

1. **设计档判点坐标滞后**：`docs/core/design/PROMPT-SYSTEM.md:701`/`:709`/`:713`/`:753` 仍写判点 `setup.mjs:276`，现盘为 `:281`（本批在 `:57-60` 增消费点变量 3 行所致）；`:709` 的「判点位置……逐字不变」句随之失真 —— **属 eng-designer 写域**（D1/D6：实施者不编辑设计档）。
2. **三端设计档未随动**（批档 §2 上抛项 1 在册）：`docs/vsc/design/SETTINGS.md:46-49` 仍写注入开关「两键」∥ `docs/desktop/design/SETTINGS.md:69` 仍写「二十键」∥ `docs/desktop/design/UI.md:522` i18n 旧行数 —— 扫描确认三处均未随本批更新，**属那些档的写权面**，请父侧路由。
3. **`cmd-config.mjs` 512 行**越 500 咨询线（存量近线，本批 +2）——建议收口轮登记观察项或另立拆档小件。
4. **批档 §1 `:62` 行号跨度**「§6.27（`:683-744`）」与现盘（`:683-767`）不符 —— 批档非本席写域（§1 = 主 agent）。

## §6 验证与收口（父代理）

**§6 验证与收口（主 agent · 2026-10-15）**

**父侧核验（亲跑，非转述）**

| # | 检查 | 命令/手段 | 读数 |
|---|---|---|---|
| 1 | **批内单测** | `node --test docs/batches/2026-10-15-inject-project-rules-switch.test.mjs` | **tests 12 · pass 12 · fail 0** ✅ |
| 2 | **键面落地** | 实读 `thincoder-core/config.mjs` | `:71` `injectDocs` · **`:72` `injectProjectRules`** · `:73` `injectMemories` ✅ |
| 3 | **消费点** | 实读 `thincoder-core/agent/setup.mjs` | `:60` `const injectProjectRules = ... !== false` ✅ |
| 4 | **判点换读** | 实读 `:281` | `injectProjectRules ? await loadProjectInstructions(agent.cwd) : null` ✅ |
| 5 | **② 块职责收窄** | 实读 `:122` | `if (injectDocs)` — 只管相关文档块 ✅ |
| 6 | **三键正交（代码层）** | 键面 + 消费点 + 判点三处对照 | ①②③ 各受各的键，**无交叉** ✅ |

**⇒ 核验通过。** 单测覆盖三键正交四态（缺省全在 / 各关一方余者在）+ 三端穿透 + `settings` 工具面。

**交付面（#55）**：核 12 档改（核 2 · CLI 1 · VSC 4 · 桌面 2 · 单测 1 · 其余 i18n/locale）—— 与设计 `§6.27` 受影响文件表**逐档对上**。

**未跑仓套件** —— 按纪律，仓套件 = 收口轮父侧唯一一次（**本笔为文档+小改，套件影响面 = 三端语法自检，已由 #55 跑 267 项 OK**）。

**登记（不动作 · 供后续）**

| # | 项 | 归属 |
|---|---|---|
| 1 | **`config.mjs:70` 注释内嵌 `setup.mjs:281` 行号** —— 行号会漂（下次改 `setup.mjs` 即失真） | 存量风格；**建议后续改述为节号或去掉行号**（入台账） |
| 2 | **`cmd-config.mjs` 512 行**（越 500 咨询线，本批 +2） | 存量近线；登记 |
| 3 | 三端设计档随动 | **#59 在办**（本批内） |

**台账**：**#1465 走核销**（实施落地 + 父侧核验通过）。

**收口判定**：本笔**设计 → 评审 pass → 实施 → 父侧核验通过** 全链完成；**§6 本文即收口记录**。

**§6 收口轮（父代理 · 2026-10-15）**

**角色表 ∥ 状态**：§1 主 agent（进行中 → 本段收口）· §2 eng-designer（设计完成；#59 设计档随动收正落讫）· §3 评审（轮 1 changes-required → 轮 2 pass）· §4 主 agent（代签在案）· §5 eng-coder（实施完成——fix round 3 件落 + 12/12 绿）· §6 本文（收口执行位）。

**父侧复跑（本收口轮亲跑，非转述）**：`node --test docs/batches/2026-10-15-inject-project-rules-switch.test.mjs`（仓根）⇒ **tests 12 · pass 12 · fail 0**；落点现读逐处对上：`thincoder-core/config.mjs:71-73` 三键 ∥ `thincoder-core/agent/setup.mjs:281` 判点 ∥ `docs/vsc/design/SETTINGS.md:43` 三键 ∥ `docs/desktop/design/SETTINGS.md:64` 二十一键（#1420 · #1465 在册）∥ `docs/desktop/design/UI.md:490` i18n-views 行携本批实读。

**核销同步清单**：

- **状态行**：本档 §1 ⇒ 已收口（close 随本段落定）。
- **计数**：本批交付 12 档 + 单测档 1（复跑 12/12）。
- **指针**：批档 ∥ 台账指针可解；无悬空指针遗留。
- **待办勾销**：`#1465` = **已核销**（早前落定——本轮回执确认）；前批遗留核对 = 无（独立批）。
- **修正轮落地前置**：实施后修正轮 3 件全落并经复跑核验（12/12）；#59 设计档随动收正落讫（三端现读对上）⇒ 无未 settle 修正轮，可 close。
- **搁置清单回核**：独立批（非程序末批）——无程序级搁置清单。
- **暂缓批复核**：无（批档目录零暂缓标记）。
- **用户文档面同拍**：面清单未立（板块设计档无「用户文档面」节——按兜底①记一行）。
- **台账可见面（收口行）**：`#1465` 已核销（在册）。

**登记项处置（原「登记」表三行收口）**：① `config.mjs:70` 注释内嵌行号 ⇒ 核未挂账 ⇒ **补登台账 #1481**（归批——随下次触碰批收正）；② `cmd-config.mjs` 512 行存量近线 ⇒ 维持登记（越线拆分指针在册）；③ 三端设计档随动 ⇒ **#59 落讫，本项闭**。

**单测档**：`…-inject-project-rules-switch.test.mjs` = 本批唯一在盘单测档（随批档归档——随批档整体清理时一并处置）。

**收口判定**：设计 → 评审（轮 2 pass）→ 实施 → 父侧核验，全链完成；**本批收口，2026-10-15**。
