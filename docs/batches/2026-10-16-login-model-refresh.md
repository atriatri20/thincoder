# 2026-10-16 · 登录成拍模型候选面即时刷新（三端）
> 六段 append-only，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 编制：主 agent · 2026-10-16 · 来源 = 用户 2026-10-16 00:08 原话「6那个要处理，#1220，要补」——承台账 #1220（认账转立项）：登录成拍不刷模型候选面（VSC 模型候选唯一来源 = `fullStatus` 的 `models` 载荷；设计 §2.20 写面只推 `teamStatus` + `providerStatus`）⇒ 补一次全状态推送 + 三端同判。。
> 台账 = #1220（core · 归批）。前情 = 无（独立批）。
## §1 讨论（主 agent）
**状态行**：已收口 2026-10-16
<§1 模板占位：本批条目 / 关键判据 / 授权口径>
## §2 批次任务与设计（eng-designer）
**状态行**：设计完成（首轮——三端落点已定；CLI 零改；VSC ∥ 桌面各一处点改（见 §2（二）（三）））
<§2 模板占位：本批条目（覆盖） / 设计档落点 / 机制设计 / 受影响文件与测试覆盖 / 验收对照 / 关键决策 / 上抛项>

**（一）本批条目（覆盖）**

| # | 条目 | 范围 |
|---|---|---|
| 1 | VSC：登录成拍补一次全状态推送（`panel._pushStatus()` ⇒ `panel._pushSettings()`）⇒ `fullStatus` 产 `models` 载荷 ⇒ 模型菜单当刻含 team 渠道 | ✅ 本批（代码 1 行内改） |
| 2 | 桌面：登录成拍随动输入区候选面（`login()` 成支增 `onProvidersChanged()` ⇒ `composer.refreshCandidates()` 全渠重取 `model:catalog`） | ✅ 本批（代码 +3 行） |
| 3 | CLI：登录成拍候选面即时（既有 `completeTeamLogin` → `syncProvidersFromDisk` 已满足） | ✅ 本批（**零代码改**——只落设计） |

**显式不在本批**：轮换（`teamRotate`）∥ 退出（logout）——既有随动零改（指派口径 = 只动登录成拍一条路径）。

**（二）落点挡位表（端 → 设计档 ∥ 代码落点 file:line）**

| 端 | 设计档落点 | 代码落点（file:line） |
|---|---|---|
| 机制单源（三端） | `docs/core/design/TEAM.md` §2.8（新增）+ §2.5 表「登录成拍候选面刷新」行 + §5 判据 ⑩ + §6 用例 N5 | —— |
| VSC | `docs/vsc/design/SETTINGS.md` §2.20（:616） | `thincoder-vscode/src/extension/panel-messages-settings.mjs:264` `handleTeamLogin` 成支（`:268` `panel._pushStatus()` ⇒ `panel._pushSettings()`） |
| 桌面 | `docs/desktop/design/SETTINGS.md` §2.21（:303） | `thincoder-desktop/renderer/mount-team.mjs:120` `login()`（`:146` `loadProviders()` 旁增 `onProvidersChanged()`）∥ 注入面 `thincoder-desktop/renderer/mount-settings.mjs:155` |
| CLI | `docs/cli/design/TUI-COMMANDS.md` §5.5（:189） | `thincoder-cli/src/tui/cmd-team.mjs:182` `completeTeamLogin`（`:187` `syncProvidersFromDisk`）——零改 |

**（三）形态表（端 → 形态）**

| 端 | 形态 |
|---|---|
| VSC | 沿既有「provider 写成功 ⇒ `panel._pushSettings()`」先例（同档 `:94`——登录 = 派生条目入列表，同类动作）；`fullStatus` 首行 `pushStatus(panel)` 同步先发 ⇒ 回执序（推送先落 ⇒ `teamLoginResult` 殿后）不变；`models` 载荷随探针拍异步落 |
| 桌面 | 沿既有「provider 写成功 ⇒ `onProvidersChanged`」先例（`thincoder-desktop/renderer/mount-settings-exits.mjs:123`）——`createTeam` deps 增 `onProvidersChanged`（`mount-settings.mjs:155` 注入；`thincoder-desktop/renderer/app.mjs:71` 已绑 `composer.refreshCandidates()`） |
| CLI | 既有随动（零改）：`agent.providers` 换盘面；模型 picker 开面活读该数组（`thincoder-cli/src/tui/model-picker.mjs:115`） |

三端零新推送机制 ∥ 零新 IPC ∥ 零轮询。

**（四）验收对照（回指 TEAM.md §5 判据 ⑩）**

- **验收句**：「登录成拍后，模型候选面当刻即含 team 渠道」（三端同判）。
- 机检三条：① VSC = `handleTeamLogin` 成支后假 webview sink 收到 `models` 消息；② 桌面 = 注入的 `onProvidersChanged` spy 成拍恰一次；③ CLI = `/team login` 成后 `agent.providers` 含 `team` 派生条目。
- 收口轮：三端实走一轮（登录 ⇒ 开模型面 ⇒ 见 team 渠道）。
- **需求侧回笔（主 agent 笔，待落）**：三端需求卷各增判据行（回指集 = 桌面 D11 ∥ CLI F19 ∥ F20 ∥ VSC F-W20 ∥ F-W21——同 TEAM.md §5 增判据族）。

**（五）受影响文件与行数预算**（实读 —— 与各档现有计法同）

| 域 | 档 | 行数 |
|---|---|---|
| VSC | `thincoder-vscode/src/extension/panel-messages-settings.mjs` | **285 ⇒ 285**（行内改；净 0） |
| 桌面 | `thincoder-desktop/renderer/mount-team.mjs` | **324 ⇒ ≈326**（+2——deps 解构 + `login()` 成支调用） |
| 桌面 | `thincoder-desktop/renderer/mount-settings.mjs` | **306 ⇒ 307**（+1——`createTeam` deps 增注入键） |
| CLI | `thincoder-cli/src/tui/cmd-team.mjs` | **235（零改）** |
| 文档 | `docs/core/design/TEAM.md` ∥ `docs/vsc/design/SETTINGS.md` ∥ `docs/desktop/design/SETTINGS.md` ∥ `docs/cli/design/TUI-COMMANDS.md` | 本批落点（216 ∥ 690 ∥ 509 ∥ 195——实读） |
| 零改（只经既有出口调用） | `thincoder-vscode/src/extension/settings.mjs` ∥ `panel-settings-push.mjs` ∥ `team-surface.mjs` ∥ `thincoder-desktop/renderer/composer-sync.mjs` ∥ `thincoder-desktop/renderer/app.mjs` ∥ `thincoder-cli/src/tui/model-picker.mjs` | 426 ∥ 124 ∥ 189 ∥ 343 ∥ 346 ∥ 324 |

- **不落行数预算表**（`TEAM.md` §4 ∥ 桌面 `SETTINGS.md` §3.1）：两表归在途批 `2026-10-15-team-token-rotation`（§4 待批准）——本批避重叠，行数同步归实施轮（该面机检 = 报告态）。
- 测试覆盖：单元测试档 = 本批件随批档归档（`docs/batches/2026-10-16-login-model-refresh.test.mjs`；不入链）；用毕批内删（零留存），§5 留一行读数。

**（六）关键决策**

| # | 决策 | 理由 ∥ 被否 |
|---|---|---|
| KD-L1 | VSC 形态走 `panel._pushSettings()`（不直调 `fullStatus`） | 沿「provider 写成功 ⇒ `panel._pushSettings()`」既有先例（同档 `:94`）——一个出口、登录与加渠道同类动作；**被否**：`fullStatus(panel._panel)` 直调（新增 import ∥ 与先例不一致） |
| KD-L2 | 桌面形态走 `onProvidersChanged`（不新增候选面刷新口） | 该接线已在（`app.mjs:71`）——复用即「沿既有推送面」；**被否**：新增独立刷新口（重复机制） |
| KD-L3 | CLI 零改 | 既有 `syncProvidersFromDisk` 已满足判据 ⇒ 作为三端形态的对齐基准 |
| KD-L4 | 退出 ∥ 轮换零改 | 指派范围（只动登录成拍一条路径）；见 §（七）上抛 ① |

**（七）上抛项**

1. 【上抛·知会】**退出成拍同缺口（VSC ∥ 桌面）**：logout 后派生条目无 key ⇒ 候选面按 `derived ∧ 无 key` 过滤隐藏（`TEAM.md` §2.4），但**推送面不重发** ⇒ 模型菜单残留旧 `team` 行直至下一次取数（VSC = 下一次 `fullStatus`；桌面 = 下一次 `model:catalog`）；CLI 退出已有 `syncProvidersFromDisk`（`cmd-team.mjs:170`）。本批按指派只做登录 ⇒ 退出留缺口；建议归批（主 agent 台账笔）。
2. 【上抛·知会】**文档重叠**：`docs/core/design/TEAM.md`（§4/§5/§6）∥ `docs/vsc/design/SETTINGS.md` §2.20 ∥ `docs/desktop/design/SETTINGS.md` 同被在途批 `2026-10-15-team-token-rotation` 触（该批 §4 待批准）。本批落新增节 + 定点点改（未改该批的 §4 行数行 / §2.7 / §2.5 轮换画句）。
3. 【上抛·知会】**既有不一致（非本批引入，零改）**：`docs/vsc/design/SETTINGS.md:618` 仍写「轮换 = 另裁项（服务端无 client rotate 端点——零控件）」，与 `docs/core/design/TEAM.md` §2.5 设置面行（轮换控件在场——rotation 批）相抵——属该批随正件未落；本批报告在案。
4. 【上抛·知会】**顺手收正一处死指针**（一致性面，随本批报）：`docs/desktop/design/SETTINGS.md:303` 原写调用点 = `mount-settings-team.mjs`；该档已净删（`createTeam` 迁入 `mount-team.mjs`），本批改写为 `mount-team.mjs`。
5. 【上抛·知会】机检读数（`node scripts/doc-check.mjs --root .`，exit 1）：悬空 226 / 行宽 18——均为**既存**；本批 0 新增悬空；行宽唯一新增一行非本批文件（`docs/server/design/webui/SANDBOX.md:16`）。

**（八）读数勘误（自检发现，append 更正——前段两数写错）**：§2（五）「零改」行的两处行数为记忆值，实测更正——`thincoder-desktop/renderer/app.mjs` = **347**（原写 346）∥ `thincoder-vscode/src/extension/team-surface.mjs` = **188**（原写 189）；同行其余四值（`settings.mjs` 426 ∥ `panel-settings-push.mjs` 124 ∥ `composer-sync.mjs` 343 ∥ `model-picker.mjs` 324）+ §2（五）其余各值经 `readFileSync` 实测无误。

**（九）最近先例（补 §2 缺行——修正 8）**

| 面 | 实现坐标（file:line 实读） | 对应设计档节 | 先例批次 | 对齐 ∥ 偏离 |
|---|---|---|---|---|
| VSC | `thincoder-vscode/src/extension/panel-messages-settings.mjs:94`（provider 写成功 ⇒ `panel._pushSettings()`） | `docs/vsc/design/SETTINGS.md` §2.13 区（extension 写面链） | 加渠批（M9 渠道准入——同档 `:95` 注） | **对齐**：登录 = 派生条目入列表，与加渠同类动作 ⇒ 同一出口；**偏离**：无（KD-L1 被否项 = 直调 `fullStatus`） |
| 桌面 | `thincoder-desktop/renderer/mount-settings-exits.mjs:123`（`provider:save` ∥ `provider:remove` 成 ⇒ `onProvidersChanged()`） | `docs/desktop/design/SETTINGS.md` §3.1 `:438`（`mount-settings.mjs` 行——「模型菜单全渠批：`onProvidersChanged` 注入转口」） | 模型菜单全渠批（2026-09-29——同页 `:512` 用例行标名） | **对齐**：接线已在（`thincoder-desktop/renderer/app.mjs:71` 绑 `composer.refreshCandidates()`）——复用即「沿既有推送面」；**偏离**：无（KD-L2 被否项 = 新增独立刷新口） |
| CLI | `thincoder-cli/src/tui/cmd-team.mjs:219`（`completeTeamLogin` 内 `syncProvidersFromDisk`） | `docs/cli/design/TUI-COMMANDS.md` §5.5 `:190` | 登/退既有两复读（B1 批族） | **对齐**：作为三端形态对齐基准；**偏离**：无（既有随动已满足——KD-L3） |

**（十）调研证据（补 §2 缺行——修正 9）**

- **仓内源档（逐档实读）**：`docs/core/design/TEAM.md` §2.4 ∥ §2.5 ∥ §2.8 ∥ `docs/core/design/PROVIDER.md` §6.25 ∥ `docs/core/design/API-CONTRACT.md`（`syncProvidersFromDisk` 行）∥ `docs/vsc/design/SETTINGS.md` §2.20 ∥ `docs/vsc/design/VSC-DEBT.md`（`_pushSettings` 是否既有——旁证）∥ `docs/desktop/design/SETTINGS.md` §2.21 ∥ §2.22 ∥ `docs/desktop/design/IPC.md` §2「模型清单注」∥ `docs/cli/design/TUI-COMMANDS.md` §3.1 ∥ §5.5。结论 = 三端取数面与推送面**均已存在**，本批零新机制。
- **参考系（`D:\ref\` 五仓——kimi-code ∥ MiMo-Code ∥ opencode ∥ oh-my-pi ∥ openclaw）**：**未调研**——本批改动 = 端内既有推送面复用（零新机制 ∥ 零跨端形态选择），无适用项。**显式落字**，以免「静默」被读成「已调研且无相关」。

**（十一）登录入口逐径（修正 1 ∥ 2 ∥ 3）**

- **修正 1（桌面向导径点名）**：首启向导团队表单径 `thincoder-desktop/renderer/mount-onboarding.mjs:182` 直发 `team:login`、**不经** `mount-team.mjs` `login()`；成拍随动 = `loadProviders()`（`:191`）+ 进步 2 自带取数链（`loadModels`）⇒ 向导期主界面输入区不在用 ⇒ 本批刷新落点该径不适用（零改）。端面 = `docs/desktop/design/SETTINGS.md` §2.21 `:308`；逐径表 = `docs/core/design/TEAM.md` §2.8 `:116-121`。
- **修正 2（CLI 逐径点名）**：三径 = argv `team login`（进程即止、无会话内存 ⇒ 零随动对象）∥ 首启向导团队路 ∥ 会话内 `/team login`——后两径**同经 `completeTeamLogin`**（`thincoder-cli/src/tui/wizard.mjs:23` 引 ∥ `:311` 调）⇒ 两复读随拍；argv 径零随动对象。端面 = `docs/cli/design/TUI-COMMANDS.md` §5.5 `:195` ∥ §3.1 `:69`（向导步成句改指共用件）。
- **修正 3（CLI 坐标统一——单坐标）**：批档 `:29` 的 `:187` 与 `docs/core/design/TEAM.md` §2.8 旧行的 `:203` 指**同一调用**；单坐标 = `cmd-team.mjs` `completeTeamLogin`（现盘实读 `:214`，内 `syncProvidersFromDisk` 调用 = `:219`）。旧两值作废（批档 `:29` 原行不改——以本段为准；`docs/core/design/TEAM.md:112` 已改）。

**（十二）判据面补正（修正 4 ∥ 5 ∥ 6）**

- **修正 4**：判据 ⑩ 的「当刻」改为可机检时点 = **成拍推送链内到达**（VSC = 假 sink 收序 `teamStatus` → `models` → 回执 `teamLoginResult`；`models` 随探针拍异步落、早于回执）；补**败径零刷新**（网络 ∥ 凭据 401 ∥ 429 ∥ 写盘败）与 **VSC sink 收序**断言。落 = `docs/core/design/TEAM.md` §5 `:201` ∥ §6 用例 N5/E5（`:218`–`:219`）。
- **修正 5**：判据 ⑩ 桌面半的 `modelCandidates` 切片 ⇒ `composer.refreshCandidates()` / `model:catalog`（与 §2.5 `:72` ∥ §2.8 `:114` 同名同面）。落 = `docs/core/design/TEAM.md:201`。
- **修正 6**：同名手工冲突成拍边界（成但携 `notice`）⇒ 仍**恰一次**刷新 ∧ 候选面**零** `team` 条目（零假造）。落 = 用例 B5（`docs/core/design/TEAM.md:220`）。

**（十三）行数口径与读数（修正 11）**

- **口径单源（本批统一）**：行数 = **内容行数**（`split("\n").length − 1` ≙ `wc -l`；文末换行不计——`read` 工具显示值 = 本口径 +1）。同口径在册先例 = `docs/core/design/TOOLS.md:552` ∥ `docs/desktop/design/PROJECT.md:218`。
- **§2（五）复读（2026-10-16 现盘实读 · 内容行数口径）**：`panel-messages-settings.mjs` **298**（原写 285 ⇒ 285——漂移；本批改后 298 ⇒ 298，行内改净 0）∥ `mount-team.mjs` **351**（原写 324 ⇒ ≈326——漂移；改后 351 ⇒ ≈353）∥ `mount-settings.mjs` **306**（原写 306 ⇒ 307 ✓）∥ `cmd-team.mjs` **267**（原写 235、零改——漂移，本批仍零改）∥ 落点四档 = `TEAM.md` **216** ∥ `docs/vsc/design/SETTINGS.md` **689** ∥ `docs/desktop/design/SETTINGS.md` **548**（原写 509——漂移）∥ `docs/cli/design/TUI-COMMANDS.md` **195**。漂移 = 本批设计轮后他批落盘随动（本批代码未落——`panel-messages-settings.mjs:268` 现仍 `panel._pushStatus()` 实读）。
- **零改行复读（同口径）**：`panel-settings-push.mjs` **124** ∥ `team-surface.mjs` **188** ∥ `composer-sync.mjs` **343** ∥ `app.mjs` **347** ∥ `model-picker.mjs` **324** ∥ `thincoder-vscode/src/extension/settings.mjs` **426**（三值不一已收正：该档 §3 陈旧值 406 ⇒ 426，落 `docs/vsc/design/SETTINGS.md:647`；评审所引「420」现档 grep 无命中 ⇒ 视为引陈旧版本，报告在案）。
- **对账待办（不在本批笔面——in-flight `2026-10-15-team-token-rotation` 批面）**：`docs/core/design/TEAM.md` §4 的 `mount-settings.mjs` **292** 与 `docs/desktop/design/SETTINGS.md` §3.1 `:438` 的 **306** 相抵 ⇒ **以现盘实读 306 为准**；§4 该行归 rotation 批随正（本批不动他批面）。
- **测试档规模（修正 11 末句）**：`docs/batches/2026-10-16-login-model-refresh.test.mjs` 预期 **≈210**（估——用例覆盖 = 判据 ⑩ 三端机检 + E5 败径 + B5 边界；实施轮回填实读）。

**（十四）归属与锚（修正 10 ∥ 12 ∥ 13 ∥ 14）**

- **修正 12（口径裁 = 用后即删 · 零留存）**：§2（五）末句的测试档口径以本段为准——本批件 `docs/batches/2026-10-16-login-model-refresh.test.mjs` **用毕即删（零留存）**，§5 留一行读数（验了什么 ∥ 命令 ∥ 结果）。依据 = 本批父侧裁定（EN 运行面提示词同旨）∥ 仓实态（既有批内件已清）∥ 批内件零维护。
- **修正 12 旁项（未落 · 报告在案）**：`docs/desktop/design/SETTINGS.md:471` ∥ `:477` 记「随批留存 · 不进集成测试树」——属**他批验收块**（设置面样式收正批 ∥ 设置菜单升级批）的陈述，改之 = 越他批笔面 ⇒ 只报告，请父侧归口。
- **修正 10（归属点清）**：本批对 `docs/vsc/design/SETTINGS.md` §2.20 的改动 = `:615`（候选面补齐句）；同节 `:617`「「轮换」= 另裁项（服务端无 client rotate 端点——零控件）」句 = **rotation 批随正件归属**（与 `docs/core/design/TEAM.md` §2.5 `:71` 相抵）——本批零动、随该批落；同一节不两批各改一半。
- **修正 13（落点锚收正——批档 `:27`–`:29` ∥ `:76` 原行不改，以下为准）**：`:27` VSC = §2.20 **落句 `:615`**（原写条目锚 `:616`）∥ `:28` 桌面 = §2.21 **落句 `:306`**（原写 `:303` = 段形句）∥ `:29` CLI = §5.5 **落句 `:190`**（原写 `:189`）∥ `（七）4` 调用点句 = 桌面档 `:307`（原写 `:303`）。
- **修正 14（占位行）**：§2 `:10` 的 `<§2 模板占位…>` 行 = 工具层占位（法条允许）——批档 append-only（原行不改）⇒ 保留并点清：§2 实义内容 = （一）–（八）+ 本 fix 轮追加（九）–（十四）；该行 = 后续条目续写位。

**修正记录（fix 轮 · 逐号 → 改动 file:line）**

| # | 处置 | 改动 file:line |
|---|---|---|
| 1 | ✅ 已落——桌面向导径点名（排除理由在档） | `docs/desktop/design/SETTINGS.md:308` ∥ `docs/core/design/TEAM.md:120` ∥ 本段（十一） |
| 2 | ✅ 已落——CLI 三径点名（向导路同经共用件） | `docs/cli/design/TUI-COMMANDS.md:195` ∥ `:69` ∥ `docs/core/design/TEAM.md:120` |
| 3 | ✅ 已落——单坐标（`:187`/`:203` 双值作废） | `docs/core/design/TEAM.md:112` ∥ 本段（十一）修正 3 |
| 4 | ✅ 已落——时点改写 + 败径零刷新 + VSC sink 收序 | `docs/core/design/TEAM.md:201` ∥ `:218`–`:219` |
| 5 | ✅ 已落——桌面半坐标改 `composer.refreshCandidates()` / `model:catalog` | `docs/core/design/TEAM.md:201` |
| 6 | ✅ 已落——同名冲突成拍边界（用例 B5） | `docs/core/design/TEAM.md:220` |
| 7 | ❌ 未落——需求档判据行 = 主 agent 笔（父侧派单排除；回指集已备于 §2（四）） | —— |
| 8 | ✅ 已落——先例行（坐标 ∥ 设计档节 ∥ 先例批次 + 对齐/偏离） | 本段（九） |
| 9 | ✅ 已落——调研证据行（含参考系「未调研」显式声明） | 本段（十） |
| 10 | ⚠️ 部分落——只落归属点清句（该句本体 = rotation 批随正件，本批零动） | 本段（十四）修正 10 |
| 11 | ✅ 已落——口径统一 + 复读 + 测试档规模（§4 ∥ 桌面 §3.1 对账 = 在途批面，未落并报告） | 本段（十三）∥ `docs/vsc/design/SETTINGS.md:647` |
| 12 | ✅ 已落——口径裁 = 用后即删（零留存）（他批「随批留存」块未落并报告） | 本段（十四）修正 12 |
| 13 | ✅ 已落——落点锚收正（条目锚 → 落句坐标） | 本段（十四）修正 13 |
| 14 | ✅ 已落——占位行归属点清（保留为续写位） | 本段（十四）修正 14 |

**（十五）本 fix 轮改后复读（收（十三）「落点四档」——避免读成现盘值）**

- （十三）各值为本 fix 轮**改动前**读数；改动后现盘（内容行数口径，2026-10-16 实读）：`docs/core/design/TEAM.md` **216 ⇒ 226** ∥ `docs/cli/design/TUI-COMMANDS.md` **195 ⇒ 198** ∥ `docs/desktop/design/SETTINGS.md` **548 ⇒ 551** ∥ `docs/vsc/design/SETTINGS.md` **689（零变——行内改）**。
- **机检读数**（`node scripts/doc-check.mjs --root .`，exit 1，改后实读）：悬空 **229**——本批（fix 轮）新增坐标逐处可解析，**本批 0 新增悬空**；行宽 **26 行**超 300 字符——本 fix 轮首稿曾新增 2 行超宽（`docs/cli/design/TUI-COMMANDS.md:69` 390 字符 ∥ `docs/desktop/design/SETTINGS.md:308` 408 字符），**已就地拆分**（`docs/cli/design/TUI-COMMANDS.md:69-71` ∥ `docs/desktop/design/SETTINGS.md:308-310`）⇒ 现本批 0 行超宽，余 26 行为既存。
- **旁项（未落 · 报告在案）**：本批档自身现 **14 行**超 300 字符（他批评审行 8 行 ∥ 本档设计轮 1 行（（八））∥ 本 fix 轮追加 5 行——（九）表行 ∥ （十）源档行 ∥ （十一）修正 1 行 ∥ （十三）复读两行）。原因 = §2 append-only（原行不改 ⇒ 无法就地拆分）+ 逐条对账句式所需；批档不在 `doc-check` 行宽 scanDirs 面（该面未列本档）——是否收正请父侧裁。

**（十六）锚位收正（自检发现——本 fix 轮自身编辑致锚漂移，收修正记录第 2/11 行与（十四）修正 13）**

- `docs/cli/design/TUI-COMMANDS.md`：本 fix 轮在 §3.1 拆行 2 处（消除超宽行）⇒ 其后行号 **+2**。修正记录第 2 行所引 `:195` = 拆行前读数，**正确锚 = `:197`**（§5.5「登录入口逐径」bullet）；（十四）修正 13 的 CLI 落句 `:190` = 拆行前读数，**正确锚 = `:192`**（§5.5 `/team login` 两复读落句）。§5.5 逐径 bullet 内自指亦已同拍收正（`:192`）。
- `docs/core/design/TEAM.md`：修正记录第 1/2 行所引 `:120` = 逐径表 **CLI 行**；**正确读法 = §2.8 登录入口逐径表整体（`:116`–`:122`；CLI 行 `:120` ∥ VSC 行 `:121` ∥ 桌面行 `:122`）**。
- 其余锚位经改后逐处复读可解析：`docs/core/design/TEAM.md` `:112`（§2.8 CLI 落点行）∥ `:201`（§5 判据 ⑩）∥ `:218`–`:220`（§6 N5/E5/B5）∥ `docs/desktop/design/SETTINGS.md` `:306`（落句）∥ `:307`（调用点）∥ `:308`–`:310`（逐径 bullet）∥ `docs/vsc/design/SETTINGS.md` `:647`。行号口径 = as-of 本 fix 轮改后实读。

**（十七）fix 轮（实施轮 #71 实读反馈——判据 ⑩ VSC 半收序不可实现）**

- **事实**：判据 ⑩ ∥ 用例 N5 原写 VSC 收序 = `teamStatus` → `models` → 回执 `teamLoginResult`（`models` 早于回执）。实读反：`pushSettings`（`panel-settings-push.mjs:104`）内 `fullStatus(panel._panel)` **不 await** ⇒ 其首拍 `pushStatus` 同步先落（`settings.mjs:394`）；回执由 `handleTeamLogin` 同步发（`panel-messages-settings.mjs:271`）；`models` 只在探针拍后 `flush()` 发（`settings.mjs:421-422` → `:418`）。⇒ 可观测序恒为 `teamStatus` → `providerStatus` → 回执 → … → `models`；加 `await` 亦不改（只等到 `shellCandidates`）。
- **处置**：判据措辞改写为可观测序（机制/落点表/§2.8 零动——判据面只改措辞）。改 `docs/core/design/TEAM.md:201`（§5 判据 ⑩）∥ `:218`（§6 N5）两处同改；相邻 E5（`:219`）只言「VSC sink 零 `models` 消息」、不引该序，零动。
- **交付报告附实读三行**：`panel-settings-push.mjs:104`（`fullStatus(panel._panel)` 不 await）∥ `settings.mjs:418`（`models` 由 `flush()` 发）∥ `panel-messages-settings.mjs:271`（回执同步发）。

**（十八）fix 轮③（实施轮 #71 实读反馈——`docs/core/design/TEAM.md:121` 断言「三径同经 `handleTeamLogin`」建在错前提）**

- **错前提**：`docs/core/design/TEAM.md:121` 原写 VSC 三径（首启板团队卡 ∥ 状态栏 item ∥ 命令面板）「同经宿主 `handleTeamLogin`」。实读反——**实现两处、未汇流**。
- **最终形态判定 = (b) 各自补链（未汇流）**：不是汇流到 `handleTeamLogin`，而是扩展侧两径在 `loginFlow()` 成支自带同款全状态链。

| 登录入口 | 实现径（实读） | 成拍刷新落点 |
|---|---|---|
| 首启板团队卡 | webview `teamLogin` 消息（`thincoder-vscode/webview/onboarding.js:186`）⇒ `thincoder-vscode/src/extension/panel-messages.mjs:388` case ⇒ 宿主 `handleTeamLogin`（`thincoder-vscode/src/extension/panel-messages-settings.mjs:264`） | 成支 `pushTeamStatus` + `panel._pushSettings()`（`panel-messages-settings.mjs:268`） |
| 状态栏 item ∥ 命令面板 `thincoder.team`（`_item.command` = `thincoder-vscode/src/extension/team-surface.mjs:170`） | `runTeamCommand()`（`team-surface.mjs:157`）⇒ `loginFlow()`（`:123`）**直调核 `teamLogin`**（`:131`）——**不经** `handleTeamLogin` | 成支 `afterChange()`（`:134`）+ `_chatPanel?._pushSettings?.()`（`:135`） |

**处置（改动 file:line——只动该断言族）**

| # | 面 | 改动前 ⇒ 改动后 | file:line |
|---|---|---|---|
| 1 | §2.8 落点表 VSC 行 | 单一落点（`handleTeamLogin` 成支）⇒ 两处落点（① webview 径 ⇒ `panel-messages-settings.mjs:268`；② 扩展侧径 ⇒ `team-surface.mjs:135`） | `docs/core/design/TEAM.md:113` |
| 2 | §2.8 逐径表 VSC 行 | 「三径同经宿主 `handleTeamLogin`」⇒ 「三径皆成拍刷新——实现两处（未汇流）：① 首启板团队卡经 `handleTeamLogin`；② 状态栏 item ∥ 命令面板经 `loginFlow()` 成支」 | `docs/core/design/TEAM.md:121` |
| 3 | §5 判据 ⑩ VSC 半 | 单一 sink 收序（隐含只有一径）⇒ 两径各记（webview 径：收序 `teamStatus` → `providerStatus` → 回执 → … → `models`；扩展侧径：收序 `teamStatus` → `providerStatus` → … → `models`，零回执） | `docs/core/design/TEAM.md:201` |

- **实读读数行（三处盘面 + 一处链）**：`thincoder-vscode/src/extension/team-surface.mjs:135`（`_chatPanel?._pushSettings?.()`——扩展侧径落点）∥ `thincoder-vscode/src/extension/panel-messages-settings.mjs:268`（`panel._pushSettings()`——webview 径落点；相邻 `:267` `pushTeamStatus`）∥ `thincoder-vscode/src/extension/settings.mjs:418`（`models` 唯一发点——`fullStatus` 内 `flush()`）∥ `thincoder-vscode/src/extension/panel-settings-push.mjs:104`（`pushSettings` 内 `fullStatus(panel._panel)` 不 await ⇒ 其首行 `pushStatus`（`settings.mjs:394`）同步先落——回执殿后之因）。
- **批档面随正（本档 append-only ⇒ 原行不改，以本段为准）**：§2（五）「零改」行仍列 `thincoder-vscode/src/extension/team-surface.mjs`——该档现为本批**落点档**（§5（一）表 #4），非零改档；同行该档行数值 188 亦随之作废（现盘实读 **190**）。
- **零动**：判据 ⑩ 的桌面半 ∥ CLI 半、其余机制面（§2.5 / §2.7 / §3 / §4 / §7）——本 fix 轮未触；产品码未触（实施轮 `files` 域）。
- **机检读数（改后实读 · `node scripts/doc-check.mjs --root .`）**：悬空 **229**（本批 0 新增——TEAM.md 唯一悬空 = `:55`，既存）∥ 行宽 **30 行**超 300 字符（本批 0 新增——三处改动均表格行，表格行依 `scripts/doc-check-width.mjs:42` 豁免宽度判定；TEAM.md 非表格行超宽 = 0）。批档不在机检扫描面（报告 0 行源自 `docs/batches/`）。`docs/core/design/TEAM.md` 内容行数 **226（零变——行内改）**。

- **与（十七）的关系**：（十七）末句「机制/落点表/§2.8 零动」= 该轮自身范围（只改判据措辞）；本轮按父侧授权扩面，§2.8 的 VSC 两行（`:113` ∥ `:121`）随该断言族同改——两轮范围各自以本段为准，互不推翻。

## §3 设计评审（评审子代理）

### 轮次 1（评审子代理）

**评审对象**：登录成拍模型候选面即时刷新（三端）批 §2 设计（设计席 #61 落盘）· 独立设计评审。

| # | Category | Severity | Issue | Suggestion |
|---|----------|----------|-------|------------|
| 1 | Requirements coverage | 🟡 | 桌面刷新只落「状态段就地登/退面板」径——落点写死 `mount-team.mjs` `login()`（batch:28）；而 `docs/core/design/TEAM.md:62` 桌面入口 = 「首启向导两路 ∥ 状态栏团队段」，且 `docs/desktop/design/SETTINGS.md:327` 记向导团队提交（`team:login`——成/败两径）住 `mount-onboarding.mjs`（不在本批受影响文件表内）⇒ 向导登录成拍是否同经该出口未明 | 按「登录入口」逐径补一行（向导路是否同出口）；若向导路不在本批判定范围，明写排除理由（向导期输入区候选面不在用 / 步 2 自带取数链——`docs/desktop/design/SETTINGS.md:323`） |
| 2 | Requirements coverage / Clarity | 🟡 | CLI 零改依据只给 `/team login` 径（batch:29 写 `:187` `syncProvidersFromDisk`），而 `docs/core/design/TEAM.md:62` CLI 入口 = 「首启向导两路 ∥ 会话内 `/team` 命令族」+ argv；向导路 `docs/cli/design/TUI-COMMANDS.md:69`「提交 ⇒ 核 `teamLogin`；成 ⇒ 结果行」直调核、不经 `completeTeamLogin` ⇒ 该径候选面即时性未被覆盖亦未点名 | 逐径点名既有机制（argv = 进程即止无会话内存；向导路 = 其模型选定面取数链），或明写零改结论的适用径与其余径兜底面 |
| 3 | Clarity / consistency | 🟡 | 同一调用两处坐标不一：batch:29「`:187` `syncProvidersFromDisk`」 vs `docs/core/design/TEAM.md:112`「既有 `syncProvidersFromDisk`（`:203`）」——同一「CLI 零改」结论的两个坐标不能同真 | 统一为一个坐标（§2.8 的 `:203` 与仓内 API 契约面一致），或注明 `:187` 所指的另一调用 |
| 4 | Acceptance criteria | 🟡 | 三条机检全为正路（batch:44）；缺 ① 败径（登录败 ⇒ 零刷新）；② VSC 换出口后的回归断言——§2（三）自称「`fullStatus` 首行 `pushStatus(panel)` 同步先发 ⇒ 回执序…不变」（batch:35）却无机检；③ 判据 ⑩「当刻即含 `team` 渠道」（`docs/core/design/TEAM.md:193`）与同段「`models` 载荷随探针拍异步落」（batch:35）并存，「当刻」无可观测定义 | 补：败径零推送断言 · 成拍 sink 收 `models` ∧ `teamStatus` ∧ 回执后置断言 · 把「当刻」改写为可机检时点（同步拍到达 ∥ 探针拍后到达，二择一） |
| 5 | Acceptance criteria / naming | 🟡 | `docs/core/design/TEAM.md:193` 判据 ⑩ 桌面半写「桌面 `modelCandidates` 切片」，而本批其余落点一律写 `composer.refreshCandidates()` / `model:catalog`（`TEAM.md:72` ∥ `TEAM.md:114` ∥ `docs/desktop/design/SETTINGS.md:306`）；`modelCandidates` 在评审域内仅此一处 ⇒ 判据指名的面不可对账、不可机检 | 判据 ⑩ 桌面半改用与机制同名的坐标（`composer.refreshCandidates()` 或 `model:catalog` 回执面），与 §2.5 ∥ §2.8 两处一致 |
| 6 | Acceptance criteria / edge | 🟡 | 未覆盖「成但有 `notice`」的同名手工条目冲突径（`docs/core/design/TEAM.md:41` 记该径不写派生条目）⇒ 成支刷新是否空推、是否恰一次未定 | 补边界断言：同名冲突成拍 ⇒ 仍恰一次刷新且候选面零 `team` 条目（零假造） |
| 7 | Coordination (parent-side) | 🟡 | 需求侧判据行仍「待落」（batch:46），且回指集（桌面 D11 ∥ CLI F19 ∥ F20 ∥ VSC F-W20 ∥ F-W21）皆为登入口条目——新判据题面（模型候选面）在需求面是否另有归属未记（需求档不在评审域，未能核） | 回笔时除登入口条目外点名候选面所属需求条目并落判据行，避免判据只挂在登录面下 |
| 8 | Closest precedent (crit. 9) | 🟡 | §2 无「最近先例」专行：先例坐标散在 §2（三）/KD 表（batch:35「同档 `:94`」· batch:36「`thincoder-desktop/renderer/mount-settings-exits.mjs:123`」），缺「实现坐标 ∥ 对应设计档节 ∥ 先例批次」成行形态，先例批次（加渠批 ∥ 模型菜单全渠批）未点名 | 补一行先例行（坐标 + 设计档节 + 先例批次），逐条附「对齐 ∥ 偏离」理由（KD-L1/L2 理由可直接上提） |
| 9 | Survey evidence (crit. 10) | 🟡 | §2 无调研证据行——未记查过哪些公共源档/参考系仓，亦无「无相关/未调研」的显式声明 | 补一行调研证据行（源档清单 ∥ 结论；「无相关」也须显式落字） |
| 10 | Document ownership / doc-state | 🟡 | `docs/vsc/design/SETTINGS.md:618` 写「「轮换」= 另裁项（服务端无 client rotate 端点——零控件）」，与 `docs/core/design/TEAM.md:71`「**「轮换」控件**（已登录在场——确认一步 + 结果行；team-token-rotation 批）」相抵；本批已在 batch:75 报告（跨批滞后，非本批引入） | 报告在案、不阻断；随 rotation 批 VSC 侧随正件落地一并销账，并点清本批对 §2.20 的改动（`:615`）与该句的处理归属，避免同一节两批各改一半 |
| 11 | Affected-file annotations (crit. 8) | 🔵 | 抽查失配：batch:56 「本批落点（216 ∥ 690 ∥ 509 ∥ 195——实读）」——桌面 SETTINGS.md 现档实为 **549** 行（另三值与实读相符）；batch:57 值列「426 ∥ 124 ∥ 189 ∥ 343 ∥ 346 ∥ 324」中的 426 与 `docs/vsc/design/SETTINGS.md:154`「**420**（+隐藏判据一处」及同档 `:647`「该档现 **406**（内容行数口径）」三值不一（该档本批零改）；batch:54「**306 ⇒ 307**」与 `docs/core/design/TEAM.md:161`「**292**（`MODAL_READS` +1 行」相抵；新建测试档（batch:60）无预期规模。层级面无问题：本批改动档 285 ∥ 324⇒≈326 ∥ 306⇒307 皆 ≤500，无越线、无拆分预案义务 | 统一计数口径并在 `TEAM.md` §4 ∥ 桌面 §3.1 之间对账、指明以哪一份为准；新建测试档补预期行数读数 |
| 12 | Doc hygiene | 🔵 | batch:60 同句自抵：「本批件随批档归档（…；不入链）；用毕批内删（零留存）」——归档与用毕删互斥，且与桌面档「随批留存 · 不进集成测试树」（`docs/desktop/design/SETTINGS.md:471`）口径不一 | 二择一并写明（若用毕删，写明与「随批留存」惯例的偏离理由及 §5 留读数的落点） |
| 13 | Clarity (citation anchor) | 🔵 | 落点锚多指条目起首而非落句：batch:27「§2.20（:616）」（落句在 `docs/vsc/design/SETTINGS.md:615`）· batch:28「§2.21（:303）」（落句在 `docs/desktop/design/SETTINGS.md:306`）· batch:29「§5.5（:189）」（落句在 `docs/cli/design/TUI-COMMANDS.md:190`）；batch:76 引用的是本批自身改动前的坐标（现 :303 为段形句） | 锚改为落句坐标或标注「条目锚」，便于评审/机检对账 |
| 14 | Doc hygiene | 🔵 | batch:10 的「<§2 模板占位：本批条目（覆盖）…」与已填的（一）–（八）并存（工具层合法，读面为死字面） | §2 填毕后删该占位行，或注明「后续条目续写位」 |

**域外旁证（不计分）**：`docs/vsc/design/VSC-DEBT.md:488` 记 `_pushStatus` `:375-377` ∥ `_pushSettingsLight` `:385-396` ∥ `_pushSettings` `:398-408`（闭合「`_pushSettings` 是否既有 panel 方法」；结论 = 存在）· `docs/core/design/API-CONTRACT.md:184` 记 `syncProvidersFromDisk` = `cmd-team.mjs:203`（第 3 条应然坐标）· 同批族先例形态参考 = `docs/batches/2026-10-15-team-token-rotation.md:255`（块 C 先例 + 块 D 未调研显式声明——第 8/9 条应备形态）。

**限制**：未声明项目标准档（方法学按 Project Guide + 本评审判据）· 无文档地图（文档归属降级为「改在本主题既有归属档 / 是否与既有单源句相抵」）· 无 git 仓（不做改动集考古；代码侧行数/坐标域内不可独立复核）。

**计数**：🔴 0 ∥ 🟡 10 ∥ 🔵 4。

VERDICT: pass

## §4 用户批准（主 agent）

**用户批准**：2026-10-16 00:08 用户裁「**6那个要处理，#1220，要补**」⇒ 本批立项（补登录成拍全状态推送 + 三端同判）。**父侧两裁（实施中落定）**：① **判据 ⑩ 的 VSC 半按可观测序改**——实施轮实读证「`models` 早于回执」不可实现（`panel-settings-push.mjs:104` `fullStatus` 不 await ⇒ `models` 随探针拍落、回执同步殿后）⇒ 机制按落点表（一行换、不 await），**判据措辞归设计席笔**（已由 #77/#83 收）；② **授权扩面**——实读发现状态栏 item ∥ 命令面板两径**不经** `handleTeamLogin`（自走 `loginFlow()`，只推 `providerStatus`）⇒ 本批目的（登录成拍刷新）在那两径被架空 ⇒ 授权补链（`team-surface.mjs:135`），并要求机检覆盖**扩展侧径**（非仅直调假 panel）。**实施面** = VSC 2 档 ∥ 桌面 3 档 ∥ CLI 零改 ∥ 批内件 1。

## §5 实施记录（eng-coder）
**状态行**：实施完成 2026-10-16（三端落点落齐（VSC 两径 ∥ 桌面 ∥ CLI 零改）+ 父侧授权扩面两径；靶向单跑 12/12 绿；审计两轮 CLEAN；代码评审轮 1 changes-required ⇒ 轮 2 pass）



**（一）落点与改动（file:line · 行数口径 = 内容行数 `split("\n").length − 1`）**

| # | 档 | 改动 | 改后行数 |
|---|---|---|---|
| 1 | `thincoder-vscode/src/extension/panel-messages-settings.mjs:268` | `panel._pushStatus()` ⇒ `panel._pushSettings()`（一行换；注释 `:260-263` 同拍收正 ⇒ 净 0） | 298（原 298） |
| 2 | `thincoder-desktop/renderer/mount-team.mjs:49` ∥ `:149` | deps 增 `onProvidersChanged` 归一（`:49`）+ `login()` 成支 `onProvidersChanged?.()`（`:149`）；注释 `:13` ∥ `:44-45` ∥ `:120-121` 同拍收正；**登出 ∥ 轮换两径零改** | 354（原 351；+3 = deps 归一 +1 ‖ 登录支调用 +1 ‖ 注释 +1） |
| 3 | `thincoder-desktop/renderer/mount-settings.mjs:155-156` | `createTeam({ … })` 注入 `onProvidersChanged`（+1）；注释 `:82` ∥ `:152` 同拍收正 | 307（原 306；+1，合 §2（五）预算） |
| 4 | `thincoder-vscode/src/extension/team-surface.mjs:135` | **扩面（父侧 2026-10-16 授权 ①）**：`loginFlow()` 成支 `afterChange()` 后增 `_chatPanel?._pushSettings?.()`；头注 `:11` + jsdoc `:121-122` 同拍收正；`afterChange()` 本体（`:115-119`）∥ `logoutFlow`（`:144-154`）零改 | 190（原 188；+2） |
| 5 | `thincoder-cli/src/tui/cmd-team.mjs` | **零改**（既有 `completeTeamLogin` → `syncProvidersFromDisk` 已覆盖） | 267 |
| 6 | `docs/batches/2026-10-16-login-model-refresh.test.mjs` | 批内单测件（新增；用毕即删——本档随批档归档、不入链） | 443（§2（十三）估 ≈210——实读 443） |

扩面由来（父侧授权书原话要点）：`TEAM.md:121`「三径同经 `handleTeamLogin`」= 基于错前提的断言（实况：状态栏 item ∥ 命令面板两径走 `team-surface.mjs` `loginFlow()` 直调核 `teamLogin`，不经 `handleTeamLogin`）⇒ 三径两径不刷 = 目的被架空 ⇒ 授权补该两径 + 补覆盖扩展侧径的机检；落法择「login 支补同款链 + 登出径零改」（`afterChange()` 为两径共用件，故落点取 `loginFlow` 成支而非共用件）。

**（二）验证读数（靶向单跑）**

- `node --test docs/batches/2026-10-16-login-model-refresh.test.mjs`（仓根）⇒ **pass 12 ‖ fail 0**。
  覆盖面：判据 ⑩ 三端机检 —— VSC webview 径（假 sink 收序 `teamStatus` → `providerStatus` → 回执 → … → `models`，载荷含 `provider === "team"` 行）‖ **VSC 扩展侧径**（状态栏 item ∥ 命令面板；真 `initTeamSurface` + `runTeamCommand`，三问经 vscode 桩）‖ 桌面（`onProvidersChanged` spy 恰一次 ∧ 主进程 `modelCatalog()` 含 `team` 行）‖ 桌面装配面径（经真 `attachSettings` 验 `mount-settings.mjs:155` 注入键接通）‖ CLI（真 `/team login` 问句面三步 ⇒ `agent.providers` 含 `team` 派生条目）；E5 败径四径零刷新（三端，含 VSC 扩展侧径）；B5 同名手工冲突恰一次 ∧ 候选面零 `team` 条目（三端）。桩 = 本地 HTTP 桩（`POST /api/client/login` + `GET /v1/models`）+ 临时 config 路径（`_setConfigPathForTest`）+ `vscode`∕`electron` 假模块（`module.registerHooks`）。
- `cd thincoder-vscode && npm run lint` ⇒ `check-syntax: 141 JS files OK`（exit 0）。
- `cd thincoder-vscode && npm test` ‖ `cd thincoder-desktop && npm test` ⇒ 两档清单空 ⇒ 零用例绿（收口集成跑归父侧 §6）。

**（三）自含环：分歧审计与独立代码评审（轮次与终态）**

- 分歧审计（explore，只读）：轮 1（原 4 档）**CLEAN**；轮 2（扩面后增量：`team-surface.mjs` + 件）**CLEAN** —— 零 PARTIAL ‖ 零 SILENT-SIMPLIFICATION ‖ 零 DOC-DRIFT ‖ 零 OUT-OF-LIST。
- 独立代码评审（advisor）：轮 1 **changes-required**（🔴 1 ‖ 🟡 1 ‖ 🔵 3）；轮 2（核验修复申明）**pass**。
  🔴（VSC 扩展侧两径不经本批落点 ⇒ 判据 ⑩ 在该两径不成立）= 本修复轮落（扩面上表 #4）；
  🟡（装配面注入行无覆盖——机检绕过 `attachSettings`）= 落（补装配面径用例）；
  🔵 三件 = 两件本轮回填（墙钟 `settle()` 改 `waitFor` 链尾信号 ‖ CLI `write_failed` 支补齐四径同形断言；含新增扩展侧径用例的 50ms 定时一并改链尾信号），第三件（§5 读数未落）= 本段即其回填。
- 校正轮次：fix 轮 1（扩面 + 机检 + 两 🔵 回填）⇒ 靶向单跑复绿（12/12）⇒ advisor 轮 2 pass；**终态 = clean**。

**（四）as-of 读数与漂移（报告在案——不改设计档，设计席笔）**

- 判据 ⑩ ∕ 用例 N5 的 VSC 半措辞（「`models` 早于回执」）= **随设计轮更正**（父侧 2026-10-16 裁：按落点表实现、不 await；改判据措辞归设计席）——本件按可观测实况断言：`panel-settings-push.mjs:104` `pushSettings` 内 `fullStatus(panel._panel)` 不 await ⇒ `models` 由探针拍落（`settings.mjs:421-422` → `:418`），回执 `panel-messages-settings.mjs:271` 同步先发 ⇒ 收序恒 = `teamStatus` → `providerStatus` → 回执 → … → `models`。
- `docs/core/design/TEAM.md:121` 逐径表仍写「覆盖：三径同经宿主 `handleTeamLogin`（…`panel-messages-settings.mjs:264`）」——与实现不符（item ∥ 命令面板径经 `team-surface.mjs:135` 自推）；批档 §2（五）「零改」行仍列 `team-surface.mjs`（现为本批落点档）。两处 = 设计面 ∕ 批档面随正件，本批零动、报告在案。
- 行数漂移：`mount-team.mjs` 改后 354（§2（十三）估 ≈353——+1 为注释行）；批内件实读 443（§2（十三）估 ≈210）。

## §6 验证与收口（父代理）

**收口（父侧 · 2026-10-16）**

**① 验证读数（本批验证行）**：`node --test docs/batches/2026-10-16-login-model-refresh.test.mjs`（cwd = 仓根）⇒ **pass 12 ∥ fail 0**（判据 ⑩ 三端机检——VSC webview 径假 sink 收序 `teamStatus` → `providerStatus` → 回执 → … → `models` 且载荷含 `team` 渠 ∥ **VSC 扩展侧径走真 `initTeamSurface` + `runTeamCommand`** ∥ 桌面 `onProvidersChanged` 恰一次 ∧ 主进程 `modelCatalog()` 含 `team` 行 ∥ 桌面装配面径经真 `attachSettings` ∥ CLI 真 `/team login` 三步 ⇒ `agent.providers` 含 `team` 派生条目；E5 败径四径零刷新；B5 同名冲突恰一次 ∧ 候选面零 `team` 条目）；`cd thincoder-vscode && npm run lint` ⇒ `check-syntax: 141 JS files OK`（exit 0）；两产品树 `npm test` 清单空 ⇒ 零用例绿。**档已随收口用毕即删** ✓（§5 留读数行）。**内部**：偏离审计 2 轮 CLEAN ∥ 独立代码评审 2 轮（轮 1 changes-required 🔴1/🟡1/🔵3 → 修 → 轮 2 **pass**）；终态 **`clean`**。**集成测试** = 未跑（仓根无集成档——如实记）。

**② 集成场景影响**：无（推送面调用点/注入键；无业务场景增删）。

**③ 核销结算**：台账 **#1220**（登录成拍候选面刷新——认账转立项）→ 已核销。

**④ 暂缓批复核**：无。

**⑤ 结算同步清单**：角色表 ✓ ∥ 状态行 ✓ ∥ 计数（VSC 2 + 桌面 3 + CLI 零改）✓ ∥ 指针 → 本档 ✓ ∥ 待办勾销 ✓ ∥ 前批遗留交叉核（`#1518` 登出成拍同缺口 = **既有行在册**、本批按指派只做登录 ⇒ 非漏做）✓。

**⑥ 落点记录（含扩面）**：VSC `panel-messages-settings.mjs:268`（`_pushStatus()` ⇒ `_pushSettings()`）∥ **VSC 扩面** `team-surface.mjs:135`（`loginFlow()` 成支 `afterChange()` 后增 `_chatPanel?._pushSettings?.()`）∥ 桌面 `mount-team.mjs:49/:149`（deps 增 `onProvidersChanged` 归一 + `login()` 成支调用）+ `mount-settings.mjs:155-156`（注入）∥ CLI 零改（`cmd-team.mjs` 既有 `completeTeamLogin` → `syncProvidersFromDisk` 已覆盖）。

**⑦ 设计侧随正（#83 · 收口前落定）**：**最终形态 = (b) 各自补链（未汇流）**——实读反原断言；`TEAM.md:113`（落点表 VSC 行：单一 ⇒ 两处落点）∥ `:121`（三径断言 ⇒ 「三径皆成拍刷新——实现两处：① 首启板团队卡经 `handleTeamLogin`；② 状态栏 item ∥ 命令面板经 `loginFlow()` 成支」）∥ `:201`（判据 ⑩ VSC 半：单一 sink 收序 ⇒ **两径各记**（webview 径收序至回执后落 `models`；扩展侧径收序、**零回执**））+ 批档更正段。

**⑧ 父侧裁定（在案两条）**：① `TEAM.md` §2.8 `:124`「`fullStatus` 首行仍发 `providerStatus`，回执序不变」= **零动**——该句主语是 `fullStatus` 机制 + webview 径回执序（两径皆真）；两径差异已由 §2.8 `:121` + §5 `:201` 的逐径记载覆盖 ✓；② 批档 §2（五）「零改」行仍列 `team-surface.mjs`（记 188）、行数漂移两处（`mount-team.mjs` 354 vs 估 353 ∥ 批内件 443 vs 估 210）⇒ **record-face，append-only 不改原行**（以更正段为准）；已并入 **#1510**。

**⑨ 需求侧判据行**：评审 finding #7 指出的需求档判据行 = **主 agent 笔、本批未落** ⇒ **已入册**（回指集 = 本档 §2（四））——**如实记、非漏做**。

**⑩ 结算行**：台账 #1220 → 已核销。
