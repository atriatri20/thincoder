# 2026-10-17 · crossdoc-coords
> 六段 append-only，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 编制：主 agent · 2026-10-17 · 来源 = 用户 2026-10-17 23:40「队列里的不如一起全派出去，thincoder 是全异步高并发的」；本批 = A 组第四支（跨档坐标陈旧族重扫）。
> 台账 = #1626（core · 归批）。前情 = docs/batches/2026-10-17-design-doc-labels.md（同轮 · 并行）。
## §1 讨论（主 agent）
**状态行**：已收口（14 点三态（9 改 ∥ 5 零改）+ 13 条抽查实读；SCOPES 零改（十名，派单前提「十一」作废）；评审 advisor#109 pass（前项链）；已知缺口 = 本批改动无独立评审，已记 §6）
<§1 模板占位：本批条目 / 关键判据 / 授权口径>

**本批条目（1 条 · 14 点）**：`#1574` 跨档坐标陈旧族——14 个坐标约六成失效（起点行在、所指对象已迁或已废）。

**关键判据**：① 逐点三态（在 ∥ 不在 ∥ 已迁）实读判定，处置 = 页内更新 / 改指新址 / 退场注记；② **`SCOPES` = 十名**（父侧派单原写「十一」= 前提错、已作废；依据 = `views/settings.mjs:43-51` SECTIONS 7 名 + `mount-settings.mjs:60` 三常量）；③ 零语义改（只动坐标与随之不通的半句）。

**授权口径**：用户 2026-10-17 23:10「都处理掉」+ 23:40「一起全派出去」。

**批径**：文档面；设计 = 本档 §2；评审 = `advisor#109`（在飞）。

## §2 批次任务与设计（eng-designer）
**状态行**：设计完成（2026-10-17 · 14 点三态表在案；页内更新 5 档 9 处；SCOPES = 十名零改（父侧「十一」前提作废）；D6 回读在案）
<§2 模板占位：本批条目（覆盖） / 设计档落点 / 机制设计 / 受影响文件与测试覆盖 / 验收对照 / 关键决策 / 上抛项>

### 本批条目（覆盖）
- `#1574` 跨档坐标陈旧族重扫（A4 · 14 点）——性质 = **设计档坐标收正**（零机制语义：不新增机制 ∥ 不改契约 ∥ 不动需求档 / 产品码 / 已冻结批档）。
- 不在本批：需求档（`docs/*/requirements/**`）∥ 产品码（`thincoder-desktop/**` · `thincoder-core/**` · `thincoder-vscode/**`）∥ 非八档设计档 ∥ 已冻结批档——零触碰。
- **SCOPES 计数（父侧派单前提更正）**：派单称「已裁 = 十一」；实读 `thincoder-desktop/renderer/views/settings.mjs:43-51` `SECTIONS` = **7 名** + `mount-settings.mjs:60` 三弹窗组常量 ⇒ **10**；`mount-settings.mjs:54-60` 注记链末行亦为「十一 ⇒ 十」。父侧 2026-10-17 23:5x 裁决 = **维持十名、0 处改**（「十一」= 父侧派单前提错，已作废；非本批改动）。

### 14 点三态表（台账坐标 → 现行坐标 → 处置）
| # | 台账坐标 | 现行坐标 / 实读 | 所指对象 | 三态 | 处置 |
|---|---|---|---|---|---|
| 1 | `DOC-MIGRATION.md:313` | 现 `:315`（本批插入坐标注 +2 行后） | `docs/vsc/design/VSC-MIGRATION.md:126` | **不在**（该档现 62 行，`:126` 越界；原自承句已随档收正） | §10.4 清单头加「坐标注」覆盖（7 处越界逐一点名） |
| 2 | `LEDGER.md:187` | `:187`（行在） | 该行现 = §3.2 字段判据表行；全档 `thincoder-{vscode,cli}/docs` 前缀 = 0 | **不在**（所指退役树引用已随迁移收正） | LEDGER.md 零改；死坐标住 DOC-MIGRATION §10.4 ⇒ 由坐标注覆盖 |
| 3 | `LEDGER.md:292` | 派单组读：`LEDGER.md:292` = `ledger-migrate.mjs`（301 行 · 落笔当刻快照，现盘 **300**）；#94 原报读：`DOC-MIGRATION.md:292` = 引 `VSC-MIGRATION.md:92` | `VSC-MIGRATION.md:92` | **不在**（该档 62 行，`:92` 越界） | `DOC-MIGRATION.md:292` 改指 `VSC-MIGRATION.md` §1.4（归档形态现状）；LEDGER 快照读数标「落笔当刻」⇒ 零改 |
| 4 | `LEDGER.md:310-312` | 派单组读：`LEDGER.md:310-312` = 逐行字段 / 本笔入参 / 收口重锚三行，所指 `ledger-cmd.mjs` `ledgerQuery`（`:32`）∥ `ledger-tools.mjs` `assertToolArgs`（`:49`）∥ `BATCH-RECORD.md` §4.13（`:255`）；#94 原报读：`DOC-MIGRATION.md:310-312`（现 `:312-314`）= 逐族明细三行 | 三符号 / 节全在；清单内 7 坐标越界 | **在**（LEDGER 侧）∥ **不在**（清单侧） | LEDGER.md 零改；DOC-MIGRATION 坐标注覆盖 |
| 5 | `E2E-TESTING.md:232` | `:232`（行在） | `PROJECT.md` §4.1（现 = 指针索引、不持值）· `D1–D42` ✓ · `T-DSK27` ✓（`PROJECT.md:490`）· §8 ✓（`:170`） | §4.1 半句**不在**（原持 `package.json 21` / `files.mjs 15` / 两新行） | 页内更新：§4.1 改为「两档指针行——值单源 = `PACKAGING.md` §3.1 ∥ 本节 §9.1」 |
| 6 | `E2E-TESTING.md:234` | `:234`（行在） | `PROJECT.md` §4.1 `files.mjs` 值 = 15 ∥「二十七档」 | **不在**（§4.1 已不持值；`thincoder-desktop/test/files.mjs` 现 = `export default []` 空清单） | 页内更新：计数面口径改为「值单源 = 各域文件账；`files.mjs` 显式清单现为空（重建随批登记）」 |
| 7 | `UI.md:487` | `:487`（行在） | `ACTIVITY.md` §1 KD-47（`:18`）∥ `thincoder-vscode/webview/chat.css:467-468`（60px ∕ 0.75 逐字命中） | **在** | 零改 |
| 8 | `SETTINGS.md:27` | `:27`（行在） | `mount-settings-segments-mcp.mjs` 记 299 → 现 **327**；`view-state.mjs:168-174` ✓；`docs/vsc/design/SETTINGS.md` §2.10（`:179`）✓ | 读数**不在**（299 ≠ 327）；余在 | 页内更新：`:27` + 同句 `:246` 两处 299 ⇒ **327**（§3.1 `:446` 已是 327） |
| 9 | `SETTINGS.md:412` | `:412`（行在） | `thincoder-vscode/locales/{en,zh}.json` 各 **350** 行 | **在**（两档在盘，现 350；行内 353 = 改前值） | 零改；变更计划形（`现行 ⇒ 预期`）属 D10 面 ⇒ 范围外注记 |
| 10 | `ACTIVITY.md:130` | `:130`（行在） | `suspension-drive.mjs` **340** 行 ✓；`#978` = 台账行在（已核销） | **在** | 零改（`#978` 属 provenance 痕迹 ⇒ #1573 面，父侧已核「无戳」，本批零触） |
| 11 | `MENU.md:12` | `:12`（行在） | `window.mjs:70-92` buildMenu → 现 `:89-109`；`window.mjs:111-113` ✓；`PACKAGING.md` §2.8.1 ✓；`SCOPES` 十名 = 代码真值 | 行在、**坐标不在** | 页内更新：坐标 ⇒ `:89-109`；「组名硬编码英文混排」半句 ⇒ 词面经 `menu-words.mjs` 投影、模板单源 = `app-menu.mjs` |
| 12 | `MENU.md:13` | `:13`（行在） | `app-menu.mjs:96-109` → 现 `:133-136`；`menu-words.mjs:53` → 现 `:81`；`menu-actions.mjs:24-36`（五动作）→ 现 `:27-40`（六动作）；事件 **25** ✓ ∥ 白名单 **54** ✓ | 行在、**三坐标不在** | 页内更新（三处） |
| 13 | `IPC.md:40` | `:40`（行在） | 菜单六名 ∥ `SCOPES` 十名（代码真值）；「去「模型」∥ 去「团队」」与六名清单自抵（SECTIONS 已无「模型」段） | 数值在；**推导半句不通** | 页内更新：⇒「= `SECTIONS` 名序去「团队」」 |
| 14 | `IPC.md:360` | `:360`（行在） | `ipc.mjs` **300** 行 ✓；白名单 54 ✓；拆点 `:280-331` → 现 `:299-300`（转口群注记行）；`ipc-relays.mjs` 77 ✓ | 行读数在；**拆点越界** | 页内更新：`:280-331` ⇒ `:299-300` |

### 机制设计
无新机制。判据 = 现盘单源，两问分判：① 起始行还在不在；② 它所指的对象（`file:line` / 节号 / 符号 / 路径）还在不在。对象在 ⇒ 页内更新为现行坐标；对象不在 ⇒ 退场注记（保留原句 + 明记，不删成空）；**不顺手改语义**——内容本身的问题一律记范围外注记。

### 受影响文件与测试覆盖
5 档，零代码档、零需求档（行数 = 内容行数口径）：
- `docs/core/design/DOC-MIGRATION.md` 744 ⇒ **746**（+2：§10.4 坐标注两行；`:292` 同句改指零行数变）
- `docs/desktop/design/E2E-TESTING.md` 253 ⇒ 253（`:232` / `:234` 两行改笔）
- `docs/desktop/design/SETTINGS.md` 553 ⇒ 553（表行两处 299 ⇒ 327）
- `docs/desktop/design/MENU.md` 146 ⇒ 146（表行三坐标 + 半句）
- `docs/desktop/design/IPC.md` 368 ⇒ 368（表行一处半句 + 一处拆点）

测试覆盖 = **无**（纯文档坐标收正——不新增单测；收口验证 = D6 回读 + grep / 行宽读数）。

### 验收对照
1. 14 点逐点三态表（上表：台账坐标 → 现行坐标 → 处置）。
2. 新指向逐条实读（抽查 14 条，读数见下）——全部命中。
3. D6 回读：edit 回执上下文逐行在案 + 改后逐点复读（`DOC-MIGRATION.md:292` / `:310-311`；E2E `:232` / `:234`；SETTINGS `:27` / `:246`；MENU `:12` / `:13`；IPC `:40` / `:360`）。
4. 行宽：**改动行非表格行 ≤300**（坐标注两行 114 / 205；E2E `:234` = 151）；5 档非表格 >300 = **0**（SETTINGS 存量 3 处见范围外注记）。
5. 范围外注记逐条在册（见下）。

### 抽查读数（本批新指向 / 关键对象 · 实读）
| # | 坐标 | 读数 |
|---|---|---|
| 1 | `thincoder-desktop/renderer/views/settings.mjs:43-51` | `SECTIONS` = 7 名（providers / agent / mcp / env / tools / models / team） |
| 2 | `thincoder-desktop/renderer/mount-settings.mjs:60` | `SCOPES = [...SECTIONS.map(name), providerAdd, mcpForm, consultAdd]` ⇒ 7 + 3 = **10** |
| 3 | `thincoder-desktop/renderer/mount-settings-segments-mcp.mjs` | **327** 行；SETTINGS §3.1 `:446` 同值 |
| 4 | `thincoder-desktop/renderer/view-state.mjs:168-174` | `draftLoc`（`id` 优先 ∥ `data-draft` 次之）在所指行 |
| 5 | `docs/vsc/design/SETTINGS.md:179` | §2.10 在（不可复得类删除二次确认） |
| 6 | `thincoder-vscode/webview/chat.css:467-468` | `max-height: 60px` ∥ `opacity: 0.75` 逐字命中 |
| 7 | `thincoder-desktop/src/main/window.mjs:89-109` | `buildMenu()` 函数体起止行 |
| 8 | `thincoder-desktop/src/main/app-menu.mjs:133-136` | `maintenance` 组两项（`gc` ∥ `index`） |
| 9 | `thincoder-desktop/src/main/menu-words.mjs:81` | `maintenance: "维护"` |
| 10 | `thincoder-desktop/renderer/menu-actions.mjs:27-40` | `onMenu` 六动作分派（含 `openSettings`） |
| 11 | `thincoder-desktop/src/main/ipc.mjs:299-300` | 转口群二十四项出档注记行；全档 **300** 行 |
| 12 | `thincoder-desktop/src/preload/preload.cjs:38-69` | `CHANNELS` = **54** ∥ `EVENT_CHANNELS` = **25** |
| 13 | `thincoder-desktop/test/files.mjs` | `export default []`（空清单） |
| 14 | `docs/desktop/design/PROJECT.md:218` / `:490` / `:170` | §4.1 = 指针索引（不持值）∥ §7 `T-DSK27` ∥ §8 存在 |
| 15 | `docs/desktop/requirements/PROJECT.md:141` / `:156` | `D1–D42` 在册 |
| 16 | `thincoder-desktop/src/main/suspension-drive.mjs` | **340** 行 |
| 17 | `thincoder-vscode/locales/en.json` ∥ `zh.json` | 各 **350** 行 |
| 18 | `docs/vsc/design/VSC-MIGRATION.md` | **62** 行；§1.4 归档形态现状（`:45`） |
| 19 | `docs/core/design/DOC-MIGRATION.md` §10.4 坐标越界扫描 | 7 坐标越界（`AGENT-PARAMS.md:138` ∥ `CORE-UNIFICATION.md:1656` ∥ `I18N.md:75` ∥ `SEND-STALL-DISTILL.md:114/:147` ∥ `TOOL-OUTPUT-LIMITS.md:160` ∥ `VSC-MIGRATION.md:126`）；`NORMAL-MODE.md:129` 在盘（`docs/core/requirements/NORMAL-MODE.md`，134 行） |
| 20 | `docs/core/design/LEDGER.md:32` / `:49`；`BATCH-RECORD.md:255` | `ledgerQuery` ∥ `assertToolArgs` ∥ §4.13 均在盘 |

### 关键决策
- **SCOPES = 十名**：认代码一手证据（7 段 + 3 弹窗组常量）与八档现文一致；父侧「十一」前提作废，本批零改。
- **对象不在 ⇒ 保留原句 + 明记**（不删成空、不改写成历史）：DOC-MIGRATION §10.4 以一条「坐标注」覆盖整张清单（内含 7 处越界点名），逐行改写 48 条坐标属语义/结构改动，超本批射程。
- **归属歧义按两读法并列**（`LEDGER.md:292` / `:310-312`）：派单分组与 #94 原报指向两种读法并存 ⇒ 两侧分别给出三态结论；实际改笔只落在可判定的那一侧（DOC-MIGRATION），LEDGER 侧零改。
- **表行与列表行的超宽豁免**：本批改动行均 ≤300；SETTINGS 存量 3 处非表格超宽不折行（折行 = 改结构，归行宽清理批）。

### 上抛项 / 范围外注记（未动，供父侧记账）
1. `docs/desktop/design/PROJECT.md:3-7` 档头「十四档」vs 实盘 **15 档**（含 `PANEL-READBACK.md`）；同处「域拆分七档」实列 2 档——PROJECT.md 不在本批八档 ⇒ 未动。
2. `docs/desktop/design/SETTINGS.md` 存量非表格行 >300 三处：`:391`（313）∥ `:398`（824）∥ `:416`（491）——归行宽清理批（折行 = 改结构）。
3. `docs/desktop/design/MENU.md:117`「七组项（序 = `SECTIONS`）」：SECTIONS 现 7 段而菜单组项 = 六（去「团队」）——不在本批 14 点内，未动。
4. `DOC-MIGRATION.md` §10.4「到期条件 = 命令 A 读数回 0」：现盘前缀行 = **184 行**（含归档形合法引用），该条件按现口径不可达——语义面，未动。
5. `DOC-MIGRATION.md` §10.4 清单 `NORMAL-MODE.md:129` 为裸名，实档住 `docs/core/requirements/`（同表其余裸名 = `core/design/`）——前缀形不一致，未动。
6. `LEDGER.md` §3.5 受影响面读数为「落笔当刻实读」快照（与现盘漂移：`ledger-tools.mjs` 260 vs **274** ∥ `ledger.mjs` 187 vs **155** ∥ `ledger-db.mjs` 175 vs **252**）——有意 as-of，D10 面，未动。
7. `SETTINGS.md:412` 的 `353 ⇒ 350` 为 KD-80 批变更计划形（现文 350）——D10 面，未动。
8. `ACTIVITY.md:130` 的 `#978` 为 provenance 痕迹（台账行在、已核销）——归 #1573 面，父侧已核「12 处无一处含戳」，本批零触。
9. 供父侧核账（不属本批）：`views/settings.mjs:49` 的 `models` 段 = **会诊与审查**段（KD-67 六组项之「会诊与审查…」；SETTINGS §2.1 记 `models` = consult ∥ advisor），与 KD-80 撤的「模型」（选择面）非同项——注记链「十一 ⇒ 十」与该段并存不构成相抵。

## §3 设计评审（评审子代理）
## §4 用户批准（主 agent）
## §5 实施记录（eng-coder）
## §6 验证与收口（父代理）

**验证与收口（父侧 · 2026-10-17 23:5x）**

**实施**：`eng-designer#97` —— 14 点三态全出（**9 改 / 5 零改**），13 条新指向抽查实读；`SCOPES` **零改**（十名），父侧派单前提「十一」作废。

**改动落点（9 处）**：`DOC-MIGRATION.md:292` 改指 `docs/vsc/design/VSC-MIGRATION.md` §1.4 · `:310-311` 新增「坐标注」两行（含 7 处越界点名）· `E2E-TESTING.md:232` / `:234` 值来源改指单源 · `SETTINGS.md:27` / `:246` 读数 299 → **327** · `MENU.md:12` 坐标 `:70-92` → **`:89-109`** · `MENU.md:13` 三坐标（`app-menu` `:133-136` ∥ `menu-words` `:81` ∥ `menu-actions` `:27-40` 六动作）· `IPC.md:40` 去「模型」半句收正 · `IPC.md:360` 拆点 `:299-300`。

**零改 5 处（对象在）**：`UI.md:487`（`ACTIVITY.md` KD-47 `:18` + `chat.css:467-468` 命中）· `SETTINGS.md:412`（vsc locales 各 350 行）· `ACTIVITY.md:130`（`suspension-drive.mjs` 340 行）· `LEDGER.md:187` / `:292` / `:310-312`（快照性质有意 as-of，由坐标注覆盖）。

**独立评审**：`advisor#109` → **pass**（12/12 前项复核闭合 · 0 Unfixed · 无回归）。
**⚠️ 已知缺口（如实记，同类第二次）**：`#109` 的评审表面落在**上一轮事项链**（ledger-cleanup 的 12 条），未对本批 9 处改动出评审意见。本批以父侧「14 点三态表 + 13 条抽查读数」为验收依据。同类批后续须把评审对象声明钉到本批 diff。

**范围外注记（9 条，已择要立行）**：① `PROJECT.md:3-7` 档头「十四档」vs 实盘 15 档（漏 `PANEL-READBACK.md`）· ② `SETTINGS.md` 存量超宽三处（313/824/491）· ③ `MENU.md:117`「七组项」vs 实六 · ④ `DOC-MIGRATION` §10.4「到期条件 = 读数回 0」现口径不可达 · ⑤ `DOC-MIGRATION` 清单 `NORMAL-MODE.md:129` 裸名路径错层 · ⑥ `LEDGER.md` §3.5 有意 as-of 快照 · ⑦ `SETTINGS.md:412` 变更计划形（D10 面）· ⑧ `ACTIVITY.md:130` provenance 痕迹（`#1573` 已核无戳）· ⑨ **`views/settings.mjs:49` 的 `models` = 「会诊与审查」段**，与 KD-80 撤的「模型」选择段非同项 ⇒ 父侧原 `#1632` 判断错误，**已自撤回**。

**收口**：`#1574` 核销；`#1573` 前轮已核销；本档冻结。
