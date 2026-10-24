# 2026-10-19 · tech-sweep-rest-multi
> 六段 append-only，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 编制：主 agent · 2026-10-19 · 来源 = 用户令 2026-10-19 08:28/08:31/08:33/08:34/08:35——批 L = 非 core 板剩余（server ∥ desktop ∥ cli ∥ sandbox），约 11 项。。
> 台账 = #770 ∥ #1511 ∥ #1518 ∥ #1519 ∥ #1528 ∥ #1529 ∥ #1533 ∥ #1566 ∥ #1599 ∥ #1681（归批）。前情 = docs/batches/2026-10-19-tech-todo-sweep.md（在途）。
## §1 讨论（主 agent）
**状态行**：已收口 2026-10-19
<§1 模板占位：本批条目 / 关键判据 / 授权口径>
## §2 批次任务与设计（eng-designer）
**状态行**：设计完成（轮次 1 十七条 = §2.20；轮次 2 八条 = §2.21 ③ 初处置 + §2.22 余六条落点；#1533 AC-5 原文已读（§2.21 ①），无未读项）
<§2 模板占位：本批条目（覆盖） / 设计档落点 / 机制设计 / 受影响文件与测试覆盖 / 验收对照 / 关键决策 / 上抛项>

### 2.1 本批条目表（10 条 · 台账号 → 实读现状 → 目标形 → 判类）

判类口径：**机械** = 一致性面 / 纯文档面，可直接落地；**需裁** = 语义面（口径 / 取舍未定，须主 agent 或用户裁后再落）；**需真机** = 盘上无判据，须在 `.6` / 真 Electron 上跑读数。

| # | 台账号 | 板 | 实读现状（读数） | 目标形 | 判类 |
|---|---|---|---|---|---|
| 1 | `#770` | desktop | `docs/desktop/design/PROJECT.md` = 539 行（内容 538）。§6.1 表头（`:405`）写「功能点 **D1–D41**」，表体只到 **D27**（`:411`–`:437`，27 行）——**D28–D41 共 14 行无指针行**（仅 `:407` 的 D35 有一句正文）。D34 验收实质已落两处：`docs/desktop/design/COMPOSER.md:275`（设计单源回指 + 机检读数「单元测试档 425 行 · 18 例全绿」）∥ `:288`（**T-DSK56** 真 Electron 用例全文）= 台账原判「D34 块缺」在 `PROJECT.md` 这一面成立、在承载面不成立 | 表头收正为 `D1–D27 · D34 · D35` + 补 D34 指针行（`docs/desktop/design/COMPOSER.md` §4 ∥ T-DSK56）+ `:407` D35 句转表行；余 12 行（D28–D33 · D36–D41）补录另立台账行 | 机械（一致性面 · 计数同拍） |
| 2 | `#1511` | server | 台账 10 处坐标（`docs/server/design/sandbox/SANDBOX.md:223/:224/:527/:528/:531/:532/:552/:554` ∥ `docs/server/design/accounts/ACCOUNTS.md:77/:79`）**逐处实读皆不含「拟新增」字样**——现文分别是 pty 会话形态句 / 会话链句 / 档账表行 / 事件 kind 表行。全仓「拟新增」共 **415 命中**（含 `docs/batches/**` 过程面）；**规范面另有同族 56 处 / 20 档**（本席实测，§2.16——台账列的 10 处坐标已由他批收正，同族仍在） | 规范面同族**仍活 56 处 / 20 档**（本席实测，见 §2.16）；本批逐处删标记、内容全保 | 机械（一致性面 · 批量删标记） |
| 3 | `#1518` | vsc · desktop | 五处落点逐处实读见 §2.14（V1/V2/V3/D1/C1；C1 已对称） | 登出成拍补推送，与登录成拍对称 + V3 同拍清簿记 | 机械（§2.14） |
| 4 | `#1519` | server | `thincoder-server/public/views-sandbox.mjs:317` 实读：工作区清单取数 `.then(…, () => [])` —— **读败静默回落空数组**；`:318`–`:341` 据此算 `boundCount`，`:305` `applyGate()` 在 `boundCount === 0` 时不渲勾选门 ⇒ 删除钮可用；服务端仍以 400 拒（零数据损）。容器清单侧（`:314`–`:315`）已有 `reachable` 三态 | 读败径补第三态设计（无承载 ∥ 不可达 ∥ **读败**）并给出可见面（就地句 + 钮禁 / 可重试） | 已裁（裁定 C：禁用 + 重试） |
| 5 | `#1528` | vsc | `thincoder-vscode/src/extension/settings.mjs:172`–`:173` 实读：注释「MODEL-MERGE-SESSION：defaultModel 顶层键（新会话起点）——面板『默认模型』项读写」+ 快照写 `defaultModel: loadRaw().defaultModel ?? null`；`webview/` 内 `defaultModel` 零消费（台账已核） | 删键 + 删注释（连注释一并撤，不留失实说明） | 机械（纯删，行为面零变） |
| 6 | `#1529` | vsc（缺陷面）· render-core（改动落档） | banner 重指会话模型钮 ×「候选为空」态可能开零候选菜单——台账标记 **unverified**（未跑真机） | 判「真机走查步骤」或「直接加兜底」 | 设计定案（§2.15） |
| 7 | `#1533` | server | 批档 `docs/batches/2026-10-16-box-quota-recovery.md` 代码完备、唯欠 AC-5；`.6`（`10.0.0.6`）ssh 已实测可达；`/dev/loopN` = `brw-rw---- root disk` ⇒ 读挂载侧需 root（设计已裁为部署前提） | 父侧可照做的命令序列：造陈旧挂载 ⇒ 自愈 + `quota_recovered` 审计行 ⇒ 销毁零残留 | 需真机（`.6`） |
| 8 | `#1566` | server | `thincoder-server/deploy/sandbox/member-shell/core-run.mjs` 实读 **655 行** > 500 咨询线（硬限 800 未越） | 拆分案：按职责边界（盒内 agent 运行核 ∥ 审批接线族）划缝，验收 = 职责清楚 | 设计定案（§2.5⑥） |
| 9 | `#1599` | sandbox | 被降级工作区原目录被 loopback 新 fs 盖住 ⇒ 原内容「活着但看不见」；现有档仅披露、无复原径 | 二选一：① 人工复原口径入档 ∥ ② 维持披露 | 已裁（裁定 E：① 三段口径） |
| 10 | `#1681` | server | 核依赖地板 `assertCoreFace` 只判「核件导出在场」，验不出算式变化；`v0.10.8-core` tag 内 `COMPACT_RATIO = 0.6` ∥ 现盘 `0.8`；`460fcbac` `git tag --contains` 空（未发布） | 三案择一：① 精确钉版 ∥ ② 算式指纹 ∥ ③ 发布序硬门 | 已裁（裁定 D：①⊕③） |

### 2.4 逐条设计（机械面 · 本批可直接落地）

**① `#770` · desktop — D34 / D35 指针行 + 表头与表体同拍**

- 现状读数：`docs/desktop/design/PROJECT.md:405` §6.1 表头「功能点 **D1–D41**」；表体 `:411`–`:437` 实有 **D1–D27**（27 行）。
  `:407`（§6.1 标题与表之间）另有一句正文「D35 设计面 = `docs/desktop/design/ACTIVITY.md` §2」——**不在表体内**。
  `D28`–`D41` 另在边界段与 §7 用例段出现（`:179`/`:189`/`:190`/`:191`/`:192`/`:194`/`:197`/`:199`；`:166` D32、`:7`/`:172` D37、`:105`/`:108`/`:111` KD 行、`:512`/`:514`/`:515`）；**`D28` 全文零命中**。
  D34 的验收实质在两处且完整：`docs/desktop/design/COMPOSER.md:275`（设计单源回指 + 机检读数「单元测试档 425 行 · 18 例全绿」）∥ `:288`（**T-DSK56** 用例全文：四条正例 + 负例）。需求侧 `docs/desktop/requirements/COMPOSER.md:13` D34 行在册。
- 目标形：① 补 **D34 行**：`| **D34** | → `docs/desktop/design/COMPOSER.md` §4（设计单源）∥ 用例 T-DSK56 | T-DSK56 |`（指针形 = 全表 canonical 形：全路径反引号 + `§N`）；
  ② `:407` 的 D35 句**转表体行** `| **D35** | → `docs/desktop/design/ACTIVITY.md` §2 | — |`（该句自带的承载面即 `ACTIVITY.md` §2，转行不再读需求卷；评审 #11③ 的处置）；
  ③ 表头（`:405`）改为「功能点 **D1–D27 · D34 · D35**」——区间是给人读的记法，判据不靠它。
- 判据（可执行形）：期望集 = `{D1…D27} ∪ {D34, D35}`，与表体首列取出的集合**相等**（取集比对，区间不参与）；两指针目标档与节在盘（`COMPOSER.md` §4 ∥ `ACTIVITY.md` §2）。列数一致性判据见 §2.11 `#770` 行。
- **不强做**：`D28`–`D33` · `D36`–`D41` 共 **12 行**的指针补录 = 需逐条读需求卷并核对承载域档，属父侧台账行的另一轮。

**② `#1511` · server — 「拟新增」族全库收正**

- 现状读数（实读）：台账列的 10 处坐标**已无一字「拟新增」**——`docs/server/design/sandbox/SANDBOX.md:223`/`:224` = pty 真终端形态句 ∥ 会话链句，`:527`/`:528`/`:531`/`:532` = 文件账表行，`:552`/`:554` = 档账计数句；`docs/server/design/accounts/ACCOUNTS.md:77`/`:79` = 事件 kind 表行。⇒ 台账的「余量 10 处」已由他批收正、对象已不在原坐标。
- 但**同族仍活**（规范面实读命中，逐档首处）：
  server —— `server/design/sandbox/SANDBOX.md:231`（`gateway/ws.mjs`（拟新增））· `:540` · `:561` · `:563`；`sandbox/EXECUTION.md:13`；`accounts/ACCOUNTS.md:80` · `:82`；`agent/MEMBER-AGENT.md:347`；`client/CLIENT.md:45`；`ledger/LEDGER.md:23`；`PROJECT.md:268`；
  `webui/CHAT.md:157` · `webui/SANDBOX.md:50`/`:53`/`:118`/`:121` · `webui/STYLE.md:100` · `webui/TABS.md:71` · `webui/TERMINAL.md:20`/`:21`/`:22`/`:23`/`:81`。
  desktop —— `desktop/design/E2E-TESTING.md:143`/`:204`/`:205`/`:238` · `PACKAGING.md:14`/`:168` · `PROJECT.md:505` · `SHELL.md:16`。
  core / cli / vsc —— `core/design/AGENT-LOOP-ASYNC-POOL.md:857` · `ANCHOR-DEBT-REPAIR.md:15` · `ARCHITECTURE.md:44` · `MODEL-SPECS.md:1103`/`:1719`/`:1832` · `PROVIDER.md:622` · `TEAM.md:181`；
  `cli/design/READ-DATA-INTERFACE.md:27`/`:28` · `TUI.md:459`；`vsc/design/SETTINGS.md:637`/`:653` · `vsc/requirements/WEBVIEW.md:26`–`:28` · `:36`。
  render-core / 根 —— `render-core/design/RENDER-CORE.md:69`/`:166`/`:220`/`:232`/`:370`/`:384`/`:387`/`:398`/`:420`；`docs/RELEASE.md:14`/`:99`；`core/requirements/PROMPT-SYSTEM.md:130`。
- 目标形（**收正判据**）：该族的唯一用途 = 喂已退场的旧机检引擎（前向引用豁免）；引擎退场后**标记无语义载体** ⇒ **规范面一律删标记、保留标记句承载的内容**（文件行 ∥ 行数预算 ∥ 机制句全保）。判据 = 规范面对 `（拟新增` **0 命中**（可 grep 复核），且逐处回读句子仍成立。
- **一条须裁**（见 §2.7 上抛 B）：删标记后「该档尚未落盘」这一现状是否需要替代形态（如行数列写 `≈N`、状态列写「设计已裁 · 实施未落」）——本席倾向前者（内容已在行列里），不新增状态词族。

**③ `#1519` · server — 承载清单读败径补第三态**

- 现状读数：`thincoder-server/public/views-sandbox.mjs:316`–`:317` 工作区清单取数 = `.then((data) => Array.isArray(data?.workspaces) ? data.workspaces : [], () => [])` —— **失败与「没有工作区」在数据层不可辨**。
  `:318`–`:320` 据 `workspaces` 算 `boundCount`；`:305` `applyGate()` 令 `confirmBtn.disabled = boundCount > 0 && !boundConfirmed` ⇒ 读败时 `boundCount = 0` ⇒ **删除钮可用、勾选门不渲**。
  对照：容器清单侧 `:314`–`:315` 已携 `reachable` 两态，`:322`–`:324` 据此渲「不可达」就地句 + 仅 keep 可过。
- 目标形（三态显式化）：`workspacesCall` 的失败径改为 `({ ok: false })`（与容器侧同形），渲染分三支——① **无承载**（ok 且空）⇒ 现文；② **不可达**（容器侧失败）⇒ 现文；③ **读败**（工作区清单失败）⇒ 就地句「承载清单读取失败」+ `confirmBtn` **禁用** + 「重试」钮（重跑两取数）。
- 判类 = **需裁**：读败时「禁用删除」vs「维持可用（服务端 400 已兜底零损）」是交互取舍，本席推荐禁用 + 重试（用户不会走到 400 才被告知）；取舍点见 §2.7 上抛 C。

**④ `#1528` · vsc — 快照 `defaultModel` 死键**

- 现状读数：`thincoder-vscode/src/extension/settings.mjs:172`–`:173` = 注释「MODEL-MERGE-SESSION：defaultModel 顶层键（新会话起点）——面板『默认模型』项读写」+ `defaultModel: loadRaw().defaultModel ?? null`。webview 零消费（台账已核）。注释所指的「面板『默认模型』项」已不存在 ⇒ 注释失实 + 键零消费者。
- 目标形：**两行整删**（注释 + 键）。判据 = 删后 `settings.mjs` 内 `defaultModel` 在该快照函数内 0 命中，`node --check` exit 0，VSC 设置面行为零变（键无消费者）。

**⑤ `#1681` · server — 核依赖地板的「算式变了」盲区**

- 现状读数：`thincoder-server/src/agent/chat-compact.mjs:50` `function assertCoreFace(mod, names, face)`，三处调用 `:62`/`:78`/`:94` 传的都是**导出名数组**（`["assistantToolCallMessage","specForModel"]` / `["repairHistory"]` / `["compressIfNeeded","compressFallback"]`）⇒ 判据 = 「这些名字是不是函数」，**算式不在判据内**。
  实证差：`v0.10.8-core` tag 内 `COMPACT_RATIO = 0.6` ∥ 现盘 `0.8`，deepseek-flash 阈值 369,600 vs 616,000。
- 三案代价对照（本席推荐 = ①⊕③，否 ②）：

  | 案 | 做法 | 代价 | 漂移风险 |
  |---|---|---|---|
  | ① 精确钉版 | 服务端对核依赖写**精确版本**（去 `^`），绑定发布记录 | 核每次变更须显式抬服务端依赖（一次有意动作） | **零**（算式只有一份，在核内） |
  | ② 算式指纹 | 地板校验增常量值探测（如 `COMPACT_RATIO === 0.8`） | 校验通过即等于把算式复制一份到服务端 | **高**——第二份算式必然先漂，且漂时给出的是**假绿** |
  | ③ 发布序硬门 | 纪律句：核先发、服务端后抬，写入发布档 | 靠纪律，非机检 | 中（漏一次即复发） |

- 推荐 = **① + ③**：① 把「算式在核内单源」这条保住（②正好破坏它）；③ 补发布序的书面门。判类 = **已裁**（父侧裁定 D，§2.13）。
- **钉版值（评审 #14 处置）**：现串 = `thincoder-server/package.json:17` `"@thincoder/core": "^0.10.7"`；核现版 = `thincoder-core/package.json` `0.10.8`。
  **不能钉 `0.10.8`**：`v0.10.8-core` tag 内算式是 `COMPACT_RATIO = 0.6`（含 `0.8` 的 `460fcbac` 未发布）⇒ 钉 `0.10.8` 会取回 tag 的 0.6 内容，与服务端现跑算式反向。
  **目标串 = 含 `460fcbac`（`COMPACT_RATIO = 0.8`）的发布版（≥ `0.10.9`）**，发布同批写成精确串 `"@thincoder/core": "<该版>"`。与「算式单源在核」的关系：指纹不进判据（否 ②），版本串是**唯一**耦合点——核内算式怎么变，服务端只随版本号走。
  发布前置（纪律句）：核先发 ⇒ 服务端同批抬精确版；发前人工校一次 tag 内 `COMPACT_RATIO` == 现盘（一次性动作，非运行时判据）。

### 2.7 定案项（父侧五条裁定，原上抛 A–E）

- **A `#770`**：本批只做「表头收正 + D34 行 + `:407` D35 句转表行」；D28–D33 / D36–D41 共 12 行补录由父侧另立台账行，不进本批。
- **B `#1511`**：不加替代状态词——标记删净、内容全保；「未落」由台账行承担。
- **C `#1519`**：读败 ⇒ 删除钮**禁用** + 重试钮（不取「维持可用」——那等于把「读败 ∥ 无承载」的不可辨留着）。
- **D `#1681`**：① 精确钉版 ⊕ ③ 发布序硬门；**否 ② 算式指纹**（在判据里放第二份算式 ⇒ 漂时给假绿，方向反了）。
- **E `#1599`**：① 复原口径入档；口径必是**三段**（前置 ∥ `.loop.img` 去留 ∥ 当次可达 vs 持久复原），见 §2.5⑧。

### 2.5 逐条设计（续 · 结构面与真机面）

**⑥ `#1566` · server — `core-run.mjs` 655 行拆分案（本批只立缝，不动结构）**

- 现状读数（实读 `thincoder-server/deploy/sandbox/member-shell/core-run.mjs`，655 行）：顶层**纯函数族 9 件**——`slotOf`(`:85`) · `withBoxProvider`(`:93`) · `isToolFailureText`(`:111`) · `textOf`(`:119`) · `flagsOf`(`:128`)。
  读/档面 —— `projectMessages`(`:140`) · `excerptOf`(`:175`) · `listFilesOf`(`:188`) · `reasonTextOf`(`:610`)。
  常量族 `MAX_TOOL_OUTPUT`(`:51`) · `BOX_PROVIDER`(`:54`) · `FLAG_KEYS`(`:67`) · `FLAG_SETTERS`(`:70`) · `FILE_LIST_LIMIT`(`:78`) · `FILE_SCAN_LIMIT`(`:79`) · `IGNORED_DIRS`(`:82`) · `ShellError`(`:58`)。
  **主体 = `createCoreRun({…})` 单函数 `:228`–`:607`（380 行）**；末件 `reasonTextOf`(`:610`) ∥ `loadCore()`(`:619`)。
- 拆缝（按**职责**，不由行数反推）：
  - **缝 1（无状态纯件外提）**：`:51`–`:192` 的常量 + 9 件纯函数 ⇒ 新档 `core-run-util.mjs`。理由 = 它们无闭包依赖、可单独直测；`core-run.mjs` 保留 re-export 保 import 面零改。**估减 ≈140 行**（区间 `:51`–`:192` 实读 142 行；`655 − 142 = 513` ⇒ **仅缝 1 仍越 500 咨询线**，落线靠缝 2）。
  - **缝 2（`createCoreRun` 内三族）**：380 行的主体按「会话装配 ∥ 工具面（读/写/执行/列档）∥ 审批与提问接线」分三件，装配函数只做**接线**（把三族返回值拼成核 run 参数）。
- **验收形态（本席明定，防行数达标冒充拆分）**：① 每族有**独立入参/出参契约**（不共享闭包变量——跨族只走显式参数）；② `createCoreRun` 拆后只做装配，其函数体**不含**任何工具实现；③ 机检 = 拆后三件各自 `grep`「顶层无跨族自由变量」，且既有单测/冒烟读数逐字不变。
- 本批**不动代码**（结构变更须独立实施轮 + 设计已批）；本条交付 = 上述缝与验收形态。
- **壳源树后果（评审 #13）**：新档落在 `deploy/sandbox/member-shell/**` = 壳件**内容寻址版本身份的覆盖集**（`docs/server/design/sandbox/EXECUTION.md:173`「覆盖集 = 源树逐件」；工件经 `prepack` 落 `public/box-shell/`，`:175`）
  ⇒ **增一档即换壳版本**，逐盒下次启动自取新版。实施轮的发布动作：重打包工件（`deploy/pack-box-shell.mjs`）+ 留 3 件回退窗（`:172`）；档账随正 = `docs/server/design/agent/MEMBER-AGENT.md` §5（`:304` 口径）——新增 `core-run-util.mjs` 与拆后各件逐件登账。

**⑦ `#1533` · server — 配额自愈 AC-5 真机复证（父侧可照做）**

- 分界：**盘上不可做**——判据全在 `.6`（`10.0.0.6`）的挂载态与审计表实读；代码面已完备（台账：`#86` 实装 ∥ `#87` 判据自洽 ∥ 19/19 绿），唯欠 AC-5。
- 步骤（前缀统一 = `ssh -i <key> thincoder@10.0.0.6`；**提权面**：`/dev/loopN` = `brw-rw---- root disk` ⇒ 读挂载侧须 `sudo` 或入 `disk` 组，属部署前提）：
  1. **造陈旧**：取一个现成盒，实读其工作区挂载 —— `findmnt -no TARGET,SOURCE,FSTYPE,OPTIONS -T <工作区目录>`（定形 = `EXECUTION.md:111` 读件形）；确认形 = `SOURCE` 列 = `/dev/loopN`、`TARGET` = 工作区目录。
  2. **打陈旧**：把该 loop 的 backing 镜像重写/换掉（两侧 UUID 不再相等），或用既有陈旧样本（台账记录：`/12` 挂 `/dev/loop32`、镜像已重写）。**造完必须复读一次 `findmnt` 留存读数**——否则复证无基线。
  3. **走自愈**：对该盒执行一次建盒/启动路径（服务端既有入口，代码完备）。
  4. **断言 A**：返回体 `recovery` ∈ {`"rebuild"`, `"reconnect"`}（按径）；**断言 B（计数式）**：审计表新增 `quota_recovered` 行**恰好一条** —— `select count(*) from audit_event where kind='quota_recovered' and id > <基线>` == 1（基线 = 步骤 2 完成时该表的 `max(id)`；`limit 1` 证不出「恰好」）。
  5. **走销毁**：`umount <工作区目录>` ⇒ 归属 detach（`losetup -d <loopN>`）⇒ `rm -rf <镜像/目录两项>`。
  6. **断言 C（盒级零残留）**：`findmnt -no TARGET,SOURCE,FSTYPE,OPTIONS -T <工作区目录>` 无该挂载 · `losetup -a -O NAME,BACK-FILE -n` 无 `BACK-FILE` = 本工作区镜像路径的行（**按 back-file 归属判，不按 NAME**）· 目录与 `<path>.loop.img` 皆不存在。
- **[待核]** 步骤 1/5 的具体路径与字段名取自台账口径，本席**未在盘核到 AC-5 正文**（批档 `docs/batches/2026-10-16-box-quota-recovery.md` 本轮未读）⇒ 实施前以该批档 AC-5 原文校准字段名，校准结果回写本节。

**⑧ `#1599` · sandbox — 被降级工作区原目录复原口径（父侧裁定 E：入档）**

- **定案**：复原口径入 `docs/server/design/sandbox/EXECUTION.md` §4 降级腿披露句之后（`:108` 之后）。口径必须**三段齐备**：
  1. **前置 = 先停盒（或销毁）**。运行中的盒经 bind 占用工作区路径 ⇒ 直接 `umount` 撞 `EBUSY`，且盒面失卷。停用 `§3` 「停止」动作（卷零触）；或用销毁径（已含卸挂 + 删目录与镜像）。
  2. **`<path>.loop.img` 去留二择及后果**：**保留** ⇒ 下次建盒/启动走 ext4 径再失败 ⇒ 再降级 ⇒ `absent` ∧ 镜像在场且具 `project` ⇒ **只挂载既有镜像**（`EXECUTION.md:130`，零 `mkfs`）⇒ 原目录**再被盖住**；**删除**（`rm -f <path>.loop.img`，即销毁径第三步 `:132` 的镜像那一半）⇒ 下次 `absent` ∧ 镜像不在 ⇒ `truncate` + `mkfs` **新建** ⇒ **同样盖住**。两择都不产生持久复原。
  3. **明写「复原 = 当次可达；持久复原不成立」**：`chattr` 被拒（`EOPNOTSUPP`）这一根因未解 ⇒ 每次建盒/启动复发降级 ⇒ 每次重演覆盖。「**一次性检视**（本次把原目录内容读出 / 备份走）」与「**持久复原**（让工作区长期可用原目录）」分开表述：前者本口径可达成，后者标注为**未解根因**、非本口径能达成。
- 命令序列（停盒后）：`umount <工作区目录>` ⇒ `losetup -a -O NAME,BACK-FILE -n` 按 back-file 归属定位本工作区 loop ⇒ `losetup -d <loopN>` ⇒ 原目录内容露出（新 fs 撤走后原文可见）；须保留降级后内容者先备份（`tar` 到盒外）。
- 判据：承载档含上述三段与命令序列（人读）；真机面判据 = 停盒 + 三步后原目录内容可见（**当次**）——持久性不在判据内（根因未解）。

### 2.6 本批能做 ∥ 必须真机/服务器侧（分界）

| 条目 | 本批（盘上） | 真机 / `.6` | 判据 |
|---|---|---|---|
| `#770` | 补 D34 行 + `:407` D35 句转行 + 表头同拍 | 真机用例 T-DSK56 已是既有义务，非本项 | 表体首列集合 == `{D1…D27} ∪ {D34, D35}` |
| `#1511` | 规范面删标记族（56 处 / 20 档，逐档见 §2.4② ∥ §2.16） | 无 | `grep '（拟新增'` 规范面 0 命中 |
| `#1519` | 三态支 + 就地句 + 钮态（需裁 C） | 无（服务端 400 已兜底） | 读败径可观测：就地句在 + 钮禁用 |
| `#1528` | 两行删 | 无 | `defaultModel` 快照内 0 命中 |
| `#1533` | 只能给步骤（本节 ⑦） | **是**——`.6` 建盒/销毁/审计全在机 | AC 三段断言 |
| `#1566` | 缝与验收形态（本节 ⑥） | 无（结构面）；壳版本随动 = 发布动作 | 跨族零共享闭包变量；仅缝 1 仍越 500（513） |
| `#1599` | 三段口径文本（§2.5⑧） | 复原动作在节点上执行 | 口径三段齐备；复原后原目录**当次**可见（持久复原不成立） |
| `#1681` | 钉版 + 发布序句（需裁 D） | 无 | 依赖版本精确 + 算式仍单源在核 |
| `#1518` / `#1529` | 设计定案（§2.14 / §2.15） | `#1529` 判据需真 webview 走查（§2.19） | 见 §2.11 |

### 2.8 未解清单（本轮如实挂账）

- **`#1533` 的 AC-5 原文未读**：批档 `docs/batches/2026-10-16-box-quota-recovery.md` 未读 ⇒ 步骤里的字段名（审计 kind ∥ 返回体键）实施前以该档 AC-5 原文校准，校准结果回写本节。
- 其余九条均有实读落点（§2.5 / §2.14 / §2.15 / §2.16）；交付表按本节计 ⚠️。

### 2.9 补读：`#1518` 目标形（部分实读 · 未实读处已标）

- 实读：CLI 侧 `thincoder-cli/src/tui/cmd-team.mjs:235` `export async function syncProvidersFromDisk(agent)`，调用点三处 `:181` / `:202` / `:219`（`:7` 注释：`wizard.mjs` 团队路与 `completeTeamLogin` ∥ `syncProvidersFromDisk` ∥ `refreshTeamState` 三件共用）。
  VSC 侧推送单点 `thincoder-vscode/src/extension/settings.mjs:351` `export function pushStatus(panel)`，`fullStatus`（`:393`）首行即 `pushStatus(panel)`（`:394`），另 `:414` 一处重推。
- 目标形（待核部分已标）：VSC 登出成拍 ⇒ 调一次 `pushStatus(panel)`（现只在 `fullStatus` 内被调，登出径未调）；桌面同形 ⇒ 重推 `model:catalog`。
- **[待核]**：① CLI 三处调用点**哪一处是退出径**、② VSC 登出处理所在档与函数（本轮在 `src/extension/` 下按 `logout|signOut` 检索 **0 命中**，登录/登出可能落在别的命名下）、③ 桌面 `model:catalog` 的发射点（`src/main/ipc.mjs` 内 0 命中）。三项未核 ⇒ 本条的落点坐标不定死，实施轮须先补这三处读数。

### 2.10 受影响文件表（按条目）

| 条目 | 文件 | 现行数 | 预期 Δ | 面 |
|---|---|---|---|---|
| `#770` | `docs/desktop/design/PROJECT.md` | 539 | +2（D34 ∥ D35 行）· 表头 1 行改 · `:407` 句转行 | 文档 |
| `#1511` | `docs/server/design/**`（14 档）· `docs/desktop/design/**`（4 档）· `docs/core/design/**`（6 档）+ `docs/core/requirements/_archive/ENGINEERING-MODE-MECHANISM.md` · `docs/cli/design/**`（2 档）· `docs/vsc/**`（2 档）· `docs/render-core/design/RENDER-CORE.md` · `docs/RELEASE.md` · `docs/server/requirements/PROJECT.md` | — | 逐处删标记，行数 ±0 | 文档（跨板 19 处 = 范围外扩，§2.16） |
| `#1519` | `thincoder-server/public/views-sandbox.mjs` | 343 | +≈12（三态支 + 就地句 + 钮态） | 产品码 |
| `#1528` | `thincoder-vscode/src/extension/settings.mjs` | 427 | −2 | 产品码 |
| `#1529` | `thincoder-render-core/composer/model-menu.mjs` | **494** | **≤ +12**（三态分支 `:93` + 锚零矩形兜位 `:123`–`:130`）⇒ ≈506 **越 500 咨询线**（硬限 800 未越） | 产品码 — 越线处置见下 |
| `#1529` i18n | 端侧字典五档：`thincoder-server/public/i18n-zh-core.mjs`（`:42`）· `i18n-en-core.mjs`（`:39`）· `thincoder-desktop/renderer/i18n-composer.mjs`（en `:64` ∥ zh `:127`）· `thincoder-vscode/locales/en.json` ∥ `zh.json`（`:107`）——逐档判定依据见 §2.22 | 145 / 142 / 152 / 351 / 351 | +1 / +1 / +2 / +1 / +1 | 产品码 |
| `#1529` 设计档 | `docs/render-core/design/RENDER-CORE.md` §5（接口契约） | — | +1 行「空表 ≠ 未到」三态语义 | 文档 |
| `#1533` | 无文件（真机步骤，§2.5⑦） | — | 0 | 真机 |
| `#1566` | 新档 `thincoder-server/deploy/sandbox/member-shell/core-run-util.mjs`（+≈140）· `core-run.mjs` 655 ⇒ **513**（缝 1，**仍越 500**）⇒ 缝 2 后 ≈340 · 壳树哈希变 ⇒ 工件重打包 · `docs/server/design/agent/MEMBER-AGENT.md` §5 档账 | 655 | 见左 | 产品码（独立实施轮） |
| `#1599` | `docs/server/design/sandbox/EXECUTION.md` §4 降级腿披露句之后（`:108` 后） | 373 | +≈20（三段口径 + 命令序列） | 文档 |
| `#1681` | `thincoder-server/package.json:17`（去 `^` + 钉发布版）· `docs/RELEASE.md`（发布序句 + 文案键归属指针行） | 32 / 389 | 1 行改 + 2 句 | 产品码 + 文档 |
| `#1518` V1 | `thincoder-vscode/src/extension/panel-messages-settings.mjs:281` | 299 | +1（`panel._pushSettings()`） | 产品码 |
| `#1518` V2 | `thincoder-vscode/src/extension/team-surface.mjs:149` | 191 | +1（`_chatPanel?._pushSettings?.()`） | 产品码 |
| `#1518` V3 | `thincoder-vscode/src/extension/settings.mjs:397` | 427 | +≈5（空表推送 1 行 + `_lastModelsPayload = []` ∥ `_lastPushedPrefs = null` 2 行 + 注释） | 产品码 |
| `#1518` D1 | `thincoder-desktop/renderer/mount-team.mjs:164`（并 `:13` 注释收正） | 355 | +1（`onProvidersChanged?.()`）+ 注释 1 行改 | 产品码 |
| `#1518` 注释 | `thincoder-desktop/renderer/mount-settings.mjs:82`（`onProvidersChanged` 枚举句补登出径） | 308 | 注释 1 行改 | 产品码 |
| `#1518` C1 | `thincoder-cli/src/tui/cmd-team.mjs:202` | 268 | 零动作 | 产品码 |

**`model-menu.mjs` 越线处置（评审 #2）**：本条改动把它推过 500 咨询线（494 + ≤12 ≈ 506；硬限 800 未越）。处置 = 实施轮先抽两件纯件：
① 定位支 `place()`（`:123`–`:130`）⇒ 新档 `thincoder-render-core/composer/model-menu-place.mjs`（入参 = `anchorEl` + `panel` + `up`，无 DOM 状态）；
② 分组渲染支（`:98`–`:120`，provider 分组 + 行渲）⇒ 同域新档 `model-menu-list.mjs`。
⇒ `model-menu.mjs` ≈ 494 − 31 + 三态支 ≈ +10 ≈ **473**（余量 ≥27），两新档各 ≈20 / ≈28 行。备选（不取）「只抽 `place()`」净减仅 ≈8，余量 ≤3 行，下次改即复发。

### 2.11 验收对照（条目 → 机检点回）

| 条目 | 机检判据（可复跑） |
|---|---|
| `#770` | 表体首列集合 == `{D1…D27} ∪ {D34, D35}`（取集比对，区间不参与）；**表体每行单元格数 == 表头单元格数**（逐行）；两指针目标档在盘、节在盘（`COMPOSER.md` §4 ∥ `ACTIVITY.md` §2） |
| `#1511` | 规范面（`docs/*/design/**` `docs/*/requirements/**` `docs/RELEASE.md`）对 `（拟新增` grep = **0** |
| `#1519` | 读败夹具（注入失败 `api`）⇒ 就地句在场 ∧ `confirmBtn.disabled === true` ∧ 重试钮在场；无承载夹具 ⇒ 现行为逐字不变 |
| `#1528` | `settings.mjs` 该快照函数内 `defaultModel` 0 命中；`node --check` exit 0 |
| `#1533` | `.6` 三段断言：`recovery` 值 ∥ `quota_recovered` **计数式** == 1（`count(*) … and id > 基线`）∥ 销毁后 `findmnt -T` 与 `losetup -a -O NAME,BACK-FILE` 零残留（按 back-file 归属） |
| `#1566` | 拆后每件无跨族自由变量；缝 1 后行数 = 513（仍越 500）⇒ 缝 2 后 < 500；既有单测读数逐字不变；壳树哈希变 ⇒ 工件重发 |
| `#1599` | 承档含三段口径（前置 ∥ `.loop.img` 去留二择及后果 ∥ 「当次可达 ∥ 持久复原不成立」）+ 命令序列（人读）；真机 = 复原后原目录**当次**可见 |
| `#1681` | 机检：服务端核依赖版本串无 `^`/`~` 且 = 含 `460fcbac` 的发布版（≥ `0.10.9`）；**发布序句 = 纪律句，非机检** |
| `#1518` | 登出成拍后候选面即时刷新（VSC `pushStatus`/`_pushSettings` 各 1 次 · 桌面 `model:catalog` 请求 1 次）；**V3 簿记：登出 ⇒ 开/切会话后 `#model-btn` 仍 `display:none`**（`_lastModelsPayload = []` ∥ `_lastPushedPrefs = null`） |
| `#1529` | 空数组夹具 ⇒ `.mm-loading` 不在场 ∧ 空态句在场；锚零矩形兜位 = **面板矩形中心落视口中心**（`|centerX − innerW/2| ≤ 2 ∧ |centerY − innerH/2| ≤ 2`）= **真 webview 走查项**（happy-dom 无布局引擎，不判别——§2.19）；`null` 夹具 ⇒ 现行为逐字不变 |

### 2.12 分节索引（本段逐笔追加，节号以本索引为准）

- 2.1 本批条目表（10 条：台账号 → 实读现状 → 目标形 → 判类）
- 2.4 逐条设计（机械面：`#770` `#1511` `#1519` `#1528` `#1681`）
- 2.7 定案项（父侧五条裁定 A–E）
- 2.5 逐条设计（结构面与真机面：`#1566` `#1533` `#1599`）
- 2.6 本批能做 ∥ 必须真机/服务器侧（分界表）
- 2.8 未解清单（权威版）
- 2.9 补读：`#1518` 目标形（逐处实读）
- 2.10 受影响文件表（含 `#1529` 越线处置）
- 2.11 验收对照（条目 → 机检点回）
- 2.13 权威面声明 ＋ 裁定落点（A–H）
- 2.14 `#1518` 五处落点（V1/V2/V3/D1/C1）
- 2.15 `#1529` 实读结论（可达 · 真缺陷）与兜底设计
- 2.16 `#1511` 同族实测 ＋ 范围外扩
- 2.17 受影响文件与判据（本轮核定）
- 2.18 本轮未做
- 2.19 `#1529` 读数判别力说明
- 2.20 修正轮 17 条落点 ＋ 最近先例行 ＋ 抽查行
- **本轮未落**：设计层档（`docs/server/design/**` 等）尚未写入 —— 机制设计目前只住本批档 §2；落设计层档须另一轮。

### 2.13 权威面声明 ＋ 父侧裁定落点（A–H）

**本节起为本批 §2 的权威面**：实施口径以本节 A–H 裁定行 ∥ §2.7 定案行为准；修正轮 17 条的逐条落点见 §2.20。

| 裁定 | 决定 | 落点（本节 ∥ 他档） | 判据 |
|---|---|---|---|
| **A** `#770` | 表头收正为 `D1–D27 · D34 · D35` + 补 D34 行 + `:407` D35 句转表行（评审 #11③）；D28–D33 / D36–D41 共 12 行补录**另立台账行**（父侧已办），不进本批 | §2.17 行 1 ∥ §2.4① | 表体首列集合 == `{D1…D27} ∪ {D34, D35}` |
| **B** `#1511` | **不加**替代状态词（内容自足；「未落」由台账行承担） | §2.16 | 只 grep 0，无形态断言 |
| **C** `#1519` | 读败 ⇒ **删除钮禁用 + 重试**（维持可用 = 把「读败 ∥ 无承载」的不可辨留着） | §2.4③ 定案（原推荐转裁） | 读败夹具：就地句在场 ∧ `confirmBtn.disabled === true` ∧ 重试钮在场 |
| **D** `#1681` | 采纳 **①⊕③**（精确钉版 + 发布序硬门），**否 ②** | §2.4⑤ 定案；否 ② 的理由见下 | 服务端核依赖版本串无 `^`/`~`；`assertCoreFace` 仍只判导出 |
| **E** `#1599` | 采纳 **① 复原口径入档**，口径三段：前置（停盒/销毁）∥ `.loop.img` 去留二择及后果 ∥ 「当次可达 ∥ 持久复原不成立」 | §2.5⑧ 定案 | 承档含三段 + 命令序列；复原后**当次**可见 |
| **F** `#1529` | 越线处置 = 抽定位纯件 + 分组渲染支（§2.10）；三态语义单源落 `docs/render-core/design/RENDER-CORE.md` §5 一行 | §2.10 ∥ §2.15 | `model-menu.mjs` ≤ 500 |
| **G** `#1518` V3 | 空表推送**同拍清簿记**：`_lastModelsPayload = []` ∥ `_lastPushedPrefs = null`（否则开/切会话复推旧候选） | §2.14 V3 | 登出 ⇒ 开/切会话后 `#model-btn` 仍隐 |
| **H** 板别与范围 | `#1528` = vsc 板 · `#1529` = vsc（缺陷面）/ render-core（落档）；`#1511` 跨板 **19 处**（core 7 ∥ vsc 2 ∥ render-core 10）= **范围外扩（协调项）**，父侧确认后扫 | §2.16 | 19 处计数式在册 |

**否 ② 的理由（D · 父侧升级口径，以本条为准）**：算式指纹等于**在判据里放第二份算式**——算式一漂，指纹跟着漂、校验给出**假绿**，而那正是本项要治的病。②不是「代价高」，是**方向反了**：把「算式单源在核内」这条前提自己拆掉。

**计数读数（A · 一致性面）**：`D28–D41` 的编号数 = `41 − 28 + 1` = **14**；本批落 D34 ∥ D35（`:407` 句转行）⇒ 补录轮余 **12 行**（D28–D33 · D36–D41）。表体实测 D1–D27 = 27 行（`:411`–`:437`）。补录动作在父侧台账行，不影响本批交付。

### 2.14 `#1518` 五处落点（逐处实读 ＋ 改法）

判类 = **机械**（对齐既有登录径补一行，零新语义）。

| # | 落点（实读坐标） | 现状读数 | 改法 | 判据 |
|---|---|---|---|---|
| V1 | `thincoder-vscode/src/extension/panel-messages-settings.mjs:277` `handleTeamLogout` | 成功径 `:281` 只调 `panel._pushStatus()`；`_pushStatus` = `settings.mjs:351` `pushStatus(panel)`，体内仅 `postMessage({type:"providerStatus"})`（`:357`）⇒ **不推 `models`**，候选缓存不换。登录径对照 `:268` `panel._pushSettings()` | `:281` 后补 `panel._pushSettings()`（全状态链，见 `settings.mjs:362` 注释：「登录/退出成拍」） | 退出后 `models` 消息到达 webview |
| V2 | `thincoder-vscode/src/extension/team-surface.mjs:144` `logoutFlow` | `:149 afterChange()` = `:115`–`:119`（`refreshItem` + `pushTeamStatus` + `_pushStatus`）⇒ 同上，无 `models`。登录径对照 `:135` `_chatPanel?._pushSettings?.()` | `:149` 后补 `_chatPanel?._pushSettings?.()` | 状态栏命令退出后候选面刷新 |
| V3 | `thincoder-vscode/src/extension/settings.mjs:397` `fullStatus` 早退 | `if (!s.providerState \|\| s.providerState.state === "invalid") return` 早于 `flush()`（`:418` 的 `models` 推送）⇒ **登出后全渠退场（invalid 态）时，即便 V1/V2 补了 `_pushSettings()` 也不推 `models`**，webview 留旧候选。另：`_lastModelsPayload = allModels`（`:405`）只在 `flush()` 内写，`panel-session.mjs:164`–`:165` 开/切会话按 `lastModelsPayload()` 复推 ⇒ **登出后开/切会话可把旧候选推回**；`_lastPushedPrefs`（`:411`）同理属播种回声门判零源 | 早退前推一次空候选：`postMessage({ type:"models", models: [], prefs: loadModelPrefs(workspaceState) })` **并同拍清簿记** `_lastModelsPayload = []` ∥ `_lastPushedPrefs = null`（webview `applyModels` 空表 ⇒ `model-menu.mjs:466`–`:471` 钮隐藏） | 登出后 `#model-btn` `display: none`；**且登出后开/切会话后仍隐** |
| **D1** | `thincoder-desktop/renderer/mount-team.mjs:154` `logout` | `:163`–`:164` 只有 `loadTeam()` + `loadProviders()`，**无 `onProvidersChanged?.()`**；登录径 `:149` 有（⇒ `app.mjs:71` `composer.refreshCandidates()`） | `:164` 后补 `onProvidersChanged?.()` | 退出后 `model:catalog` 请求发出一次 |
| **C1** | `thincoder-cli/src/tui/cmd-team.mjs:202`（`runTeamLogout` 成径） | **已对称，零动作**：`:202` 已调 `syncProvidersFromDisk(agent)`（`:235` 定义，`:240` `agent.providers = cfg.providersList`）；候选无缓存——`model-picker.mjs:115` 开面时现读 `agent.providers.filter(isDerivedProviderHidden)`。另两处调用点 `:181`（rotate 成径）/`:219`（`completeTeamLogin` 登录成径）同形 | 不动 | grep `syncProvidersFromDisk` 仍 3 调用点 |

**桌面「发射侧」之名收正**：`model:catalog` 是 **renderer → main 的拉取请求**（`thincoder-desktop/src/main/ipc-registry.mjs:59` 注册；`renderer/composer-sync.mjs:273` `call("model:catalog")`，入口 `refreshCandidates` `:325`），宿主侧没有推送口——所以落点是渲染面登出径补一次 `refreshCandidates()`，不是主进程加推送。

### 2.15 `#1529` 实读结论：**可达 · 真缺陷（VSC 端）**；桌面端不可达

**渲染支实读**：`thincoder-render-core/composer/model-menu.mjs:93`–`:97` —— `models` 为空时渲一个 `.mm-loading` 行 + `t("model.loading")`（`thincoder-server/public/i18n-zh-core.mjs:42` = 「加载模型…」），footer 三管理项照渲（`:109`–`:120`）。⇒ 不是「零候选空白菜单」，是**永不解除的「加载模型…」**。

**入口可达性（VSC，逐跳实读）**：
1. banner 动作钮只在 `fallback` 态渲：`thincoder-vscode/webview/ui.js:88`–`:96`（`fallback` 由 `:75` 判）。
2. 出口 = `webview/chat-messages.js:156` `() => document.getElementById("model-btn")?.click()`。
3. 候选空时 `applyModels` 把钮 `display:none`（`model-menu.mjs:466`–`:471`）——但 `HTMLElement.click()` 是**合成事件、不经命中测试**，监听器（`:345`）照发。
4. ⇒ `open()`（`:322`）⇒ `openModelMenu({ models: [] })` ⇒ 命中 `:93` 分支。

**结论**：**可达**，两处可见缺陷——① 永远显示「加载模型…」（真实态是「无候选」，不是「加载中」），用户得不到「没有可用模型」这句话；② `place()`（`:123`–`:130`）对 `display:none` 锚取 `getBoundingClientRect()` 全零 ⇒ 面板落视口左上 `(4,4)`，不贴 banner 钮。

**桌面端**：fallback 明示行是纯文本 `thincoder-desktop/renderer/composer-sync.mjs:101`–`:110`（`children: [word]`，无钮）⇒ **无入口，不可达**。

**兜底设计（本批只定设计，实施另轮）**：
- `openModelMenu` 三态化：`models == null`（未到）⇒ 现「加载模型…」；`models` 为**空数组**（已到且空）⇒ 新键 `model.empty`（「无可用模型」）+ 不渲分组；锚零矩形（`r.width === 0 && r.height === 0`）⇒ 以视口居中兜位（不落左上角）。
- 判据（可机检）：空候选夹具 ⇒ `.mm-loading` 不在场 ∧ 空态句在场；锚零矩形兜位（`panel.style.top !== "4px"`）= **真 webview 走查项**（happy-dom 无判别力，§2.19）；`null` 夹具 ⇒ 现行为逐字不变。
- **新键 `model.empty` 的载体（内建 #5）**：现键 `model.loading` 分布三档 —— `thincoder-server/public/i18n-zh-core.mjs:42` ∥ `i18n-en-core.mjs:39` ∥ `thincoder-desktop/renderer/i18n-composer.mjs:64`/`:127`（实读行数 140 / 137 / 137）。
  **VSC 面**经 `thincoder-vscode/src/i18n.mjs:49` `loadLocaleStrings` 投影 —— `:41`–`:42` = `projectDictionary(lang)`（源 = `@thincoder/core/i18n.mjs`，`:21` 导入）⊕ 本地 `locales/*.json` 覆盖（`:28` `_loadLocal`；`:19` 记「核域键在本地档仍有 32 键同值副本」）。
  ⇒ **加键同步三处**：server 两档（`zh` ∥ `en`）∥ 核字典 `@thincoder/core/i18n.mjs` ∥ VSC 本地档中同值副本所在键集（若 `model.*` 在内）。键集断言件随正（现有 i18n 键集测试同批补 `model.empty`）。
- **归属档（内建 #5）**：`thincoder-render-core/**` 的内容面单源 = `docs/render-core/design/RENDER-CORE.md` §5（接口契约；节在盘，`:169`）；三态语义（空表 ≠ 未到）落该节一行。
- **不取**「候选空时 banner 不渲钮」这条备选：banner 在 webview 面，要判空得再下一份候选计数——而「未到 ∥ 空」的混淆正是本项要治的病，把判断留在菜单里才单点。

### 2.16 `#1511` 同族实测（判据前移到读数）

**实测（本机 `docs/**`，排除 `docs/batches/**`）**：`（拟新增` 命中 **56 处 / 20 档**（非父侧估的 ≈60 / 31 档）。

| 目录 | 处 |
|---|---|
| `server/design/**` | 22（SANDBOX 6 · TERMINAL 5 · ACCOUNTS 4 · EXECUTION 2 · webui/SANDBOX 2 · CLIENT 1 · LEDGER 1 · webui/CHAT 1） |
| `desktop/design/**` | 10（E2E-TESTING 6 · PACKAGING 3 · SHELL 1） |
| `render-core/design/RENDER-CORE.md` | 10 |
| `core/design/**` | 6（MODEL-SPECS 4 · PROVIDER 1 · TEAM 1） |
| `cli/design/READ-DATA-INTERFACE.md` | 2 |
| `vsc/design/SETTINGS.md` | 2 |
| `docs/RELEASE.md` | 2 |
| `server/requirements/PROJECT.md` | 1 |
| `core/requirements/_archive/ENGINEERING-MODE-MECHANISM.md` | 1 |

- **判据**：规范面（`docs/*/design/**` · `docs/*/requirements/**` · `docs/RELEASE.md`，`docs/batches/**` 不入判据）对 `（拟新增` grep = **0**。
- **改法**：逐处删标记、留标记句承载的内容（文件行 ∥ 行数预算 ∥ 机制句全保）；判类 = 机械。`_archive` 档同样在判据面（归档需求档仍会被检索当指引），未取豁免。
- **不新增状态词**（裁定 B）。
- **计数差在册**：父侧「≈60 处 / 31 档」与本机读数 56 / 20 不符，以本机读数为实施面口径；差异原因是估计值 vs 实测，非清单缺项。
- **范围外扩（协调项 · 内建 #15）**：56 处中 **19 处**落在 §1 声明的四板（server ∥ desktop ∥ cli ∥ sandbox）之外 —— `core/design/**` 6 + `core/requirements/_archive/**` 1 = 7 ∥ `vsc/design/SETTINGS.md` 2 ∥ `render-core/design/RENDER-CORE.md` 10。
  判据同一（删标记、内容全保），但**板界超出批范围** ⇒ 显式记为范围外扩，由父侧确认后扫；板别同拍收正：`#1528` = vsc 板 ∥ `#1529` = vsc（缺陷面）/ render-core（落档）。

### 2.17 受影响文件与判据（本轮核定）

| 条目 | 文件（实读坐标） | 本轮交付 | 判据 |
|---|---|---|---|
| `#770` | `docs/desktop/design/PROJECT.md:405`（表头）· `:407`（D35 正文句）· `:411`–`:437`（表体 27 行） | 表头改 `D1–D27 · D34 · D35` + 补 D34 行（→ `docs/desktop/design/COMPOSER.md` §4 ∥ T-DSK56）· D35 句转表行（→ `docs/desktop/design/ACTIVITY.md` §2） | 表体首列集合 == `{D1…D27} ∪ {D34, D35}` |
| `#1511` | 20 档（§2.16 表） | 删标记 56 处，内容全保 | grep = 0 |
| `#1519` | `thincoder-server/public/views-sandbox.mjs:316`–`:317` · `:305` | 读败径 `({ok:false})` + 就地句 + 钮禁用 + 重试（裁定 C） | 读败夹具三断言 |
| `#1528` | `thincoder-vscode/src/extension/settings.mjs:172`–`:173` | 两行整删 | 该快照函数内 `defaultModel` 0 命中 |
| `#1518` | `panel-messages-settings.mjs:281`（299 行）· `team-surface.mjs:149`（191 行）· `settings.mjs:397`（427 行）· `mount-team.mjs:164`（355 行，并 `:13` 注释收正）· `mount-settings.mjs:82`（注释收正）· `cmd-team.mjs:202` | 前四处各补一行（V3 补空表推送 + **同拍清簿记**），C1 零动作；两处注释同批收正 | 登出后候选面刷新；V3 空表推送在场；登出 ⇒ 开/切会话 `#model-btn` 仍隐 |
| `#1529` | `thincoder-render-core/composer/model-menu.mjs:93`–`:97` · `:123`–`:130`（现行 **494**） | 三态 + 锚兜位 + **越线先拆两件**（§2.10）；三态语义入 `docs/render-core/design/RENDER-CORE.md` §5 | 空数组夹具出空态句；`model-menu.mjs` ≤ 500 |
| `#1681` | `thincoder-server/package.json:17`（去 `^` + 钉发布版）· `docs/RELEASE.md`（发布序句） | ①⊕③（裁定 D）；钉版值 = 含 `460fcbac` 的发布版（§2.4⑤） | 版本串无 `^`/`~`；发布序句 = **纪律句，非机检** |

### 2.18 本轮未做（如实挂账，不冒充已交付）

- **代码一行未动**（本轮是设计修正轮，父侧明令不做实施）。
- `#1529` 兜底属**设计定案**，实施轮落 `model-menu.mjs`；桌面端无入口，本项不涉桌面改动。
- `#1518` V3 的 `_pushSettings` 体内细节（`panel-settings-push.mjs`）未逐行读——本条只需「调用它」这一点，判据不依赖其内部。
- 设计层档（`docs/**/design/**` 除 §2.17 列出的文档面条目）尚未写入；机制设计目前只住本批档 §2。

### 2.19 `#1529` 可达性与锚定位：读数判别力说明

- **`click()` 一条 = 规范结果，不是读数**：合成事件不经命中测试（`HTMLElement.click()` 按 DOM 规范直接派发）⇒ 隐藏钮也能触发监听器。这条不依赖任何测试读数。
- **happy-dom 矩形读数无判别力（评审 #16）**：happy-dom 无布局引擎 ⇒ **任意**元素的 `getBoundingClientRect()` 皆零矩形，故「隐藏钮 ⇒ 零矩形」**未被那个读数证成**（缺可见钮对照）；该读数撤回，不作证据。
- **锚定位判据改真 webview 走查**：`display:none` 的元素无 CSS 盒（CSSOM 规范）⇒ 矩形全零 ⇒ `place()`（`:123`–`:130`）的 `Math.max(4, …)` 把面板落在 `(4, 4)`——这是**规范推定**，本轮无读数；实施轮以真 VSC webview 走查承载（步骤：登出 + 空候选 ⇒ 触发 banner 钮 ⇒ 看面板落位与空态句）。
- **门检口径**：`doc_check gate` 的实读数见交付报告一行；本档落在声明的排除项（`batches`）内时 gate 范围为空，则不拿 gate PASS 冒充本文已机检。

### 2.20 修正轮 17 条落点（评审 §3 轮次 1 · 父侧全部接受）

**最近先例行（评审 #9）**——逐条：先例坐标 ∥ 对齐点 ∥ 偏离理由。

- `#1519`：先例 = 容器清单侧两态 `thincoder-server/public/views-sandbox.mjs:314`–`:315`（`reachable`）。对齐 = 同档同构补第三态；偏离 = 无。
- `#1518`：先例 = 登录径 `thincoder-vscode/src/extension/panel-messages-settings.mjs:268` ∥ `team-surface.mjs:135` ∥ `thincoder-desktop/renderer/mount-team.mjs:149`。对齐 = 登出径照抄同拍一行；偏离 = 无。
- `#1529`：无同机制先例；最近先例 = 文案键族 `model.loading`（server 两档 + 桌面一档 + 核字典投影）。对齐 = 新键 `model.empty` 与 `model.loading` 同址同形载入；偏离 = 新增「已到且空」态（原机制只有单态）。
- `#1566`：先例 = `quota.mjs` ∥ `box.mjs` 拆案（`docs/server/design/sandbox/EXECUTION.md:131`–`:132`，两档共成销毁全程、按职责划缝）。对齐 = 按职责拆 + 档账随正；**偏离 = 新档落壳源树内，触发内容寻址版本变更 + 工件重发**（`EXECUTION.md:173`）——先例拆分皆在服务端常驻档，不涉壳树。
- `#770`：先例 = 表体 canonical 指针形 `→ \`docs/desktop/design/SESSIONS.md\` §4`（`PROJECT.md:411` 起）。对齐 = 全路径反引号 + `§N`；偏离 = 无。
- `#1599`：先例 = 同节降级腿披露句 `EXECUTION.md:108`。对齐 = 同一节续写；偏离 = 无。
- `#1533`：先例 = 读件定形 `EXECUTION.md:111`。对齐 = 两处 `findmnt` 统一取该形；偏离 = 无。
- `#1681`：先例 = 无（`assertCoreFace` 是唯一的地板机制）。

**抽查（公共源文档）行（评审 #10）**——查了什么 / 有无相关，逐项如实记。

- 仓内源档实读：`docs/server/design/sandbox/EXECUTION.md` §3/§4/§8（`:53`–`:134` · `:142`–`:180`）∥ `docs/desktop/design/PROJECT.md` §6.1（`:403`–`:417`）∥ `docs/render-core/design/RENDER-CORE.md` 节序（§5 = 接口契约，`:169`）。
- `docs/README.md` 档目：本轮未查；归属档由 §2.17 逐档直接指定，未依赖地图选定。
- `docs/server/requirements/PROJECT.md` §5 沙盒块：本轮未查（无相关判据取自该节）。
- 宿主 / man 源（`man findmnt` ∥ `man losetup` ∥ `chattr` 语义）：本轮未查；命令形取自本仓 `EXECUTION.md:109`–`:111` 既有读件形（同仓单源优先）。`display:none` 元素零矩形取自 CSSOM 规范，本轮无外部核对。

**17 条逐条落点（号 → 改动 file:line）**

| # | 严重度 | 落点（本档 §2 行号以本节写入时为准） |
|---|---|---|
| 1 | 🔴 | `#1599` 三段口径 → §2.5⑧ 全段重写；裁定行 §2.13 E；受影响档 §2.10 `#1599` 行 |
| 2 | 🔴 | `model-menu.mjs` 494 · Δ ≤+12 · 越线处置 → §2.10 新增 `#1529` 行 + 「越线处置」段；§2.17 `#1529` 行 |
| 3 | 🟡 | `#1518` 逐档行数 → §2.10 新增 V1(299)/V2(191)/V3(427)/D1(355)/注释 行；§2.17 `#1518` 行；注释收正 = `mount-team.mjs:13` ∥ `mount-settings.mjs:82` |
| 4 | 🟡 | V3 同拍清簿记 → §2.14 V3 行（`_lastModelsPayload = []` ∥ `_lastPushedPrefs = null`）；新判据 §2.11 `#1518` 行 ∥ §2.13 G 行 |
| 5 | 🟡 | `model.empty` 载体清单 + 归属档 → §2.15「载体」段与「归属档」段；§2.10 i18n 行 ∥ `RENDER-CORE.md` §5 行 |
| 6 | 🟡 | `#1511` 两个活读数 → §2.1 行 2 改为单一读数（56 处 / 20 档，指针 §2.16） |
| 7 | 🟡 | 修订式残留 → §2.12 索引只留现行节；§2.9 仅存一节；§2.7 = 定案行；§2.13 首段 = 现行声明 |
| 8 | 🟡 | 两条状态行 → §2 只留一条（`部分完成（…）`），旧行删除；未读项收敛到 `#1533` 一项 |
| 9 | 🟡 | 最近先例行 → 本节首段 |
| 10 | 🟡 | 抽查行 → 本节中段 |
| 11 | 🟡 | `#770` 三处 → §2.4① 全段（指针全路径反引号 ∥ 判据取集式 ∥ `:407` D35 句转表行）；§2.13 A 行与计数段；§2.17 `#770` 行 |
| 12 | 🟡 | `#1533` 三段断言 → §2.5⑦ 步骤 1（定形）/ 4（计数式）/ 6（`losetup -a -O NAME,BACK-FILE -n` 归属判）；§2.11 `#1533` 行 |
| 13 | 🟡 | `#1566` 壳源树 → §2.5⑥ 新增「壳源树后果」条；§2.10 `#1566` 行；§2.11 `#1566` 行 |
| 14 | 🟡 | `#1681` 钉版值 → §2.4⑤「钉版值」段（不能钉 `0.10.8`；目标 = 含 `460fcbac` 的发布版）；§2.13 D 行；§2.11 `#1681` 行标「纪律句，非机检」 |
| 15 | 🟡 | 板别与范围 → §2.1 行 5/6 板列；§2.13 H 行；§2.16「范围外扩」条（19 处 = core 7 ∥ vsc 2 ∥ render-core 10） |
| 16 | 🔵 | happy-dom 读数 → §2.19 全段重写（读数撤回、判据改真 webview 走查）；§2.11 `#1529` 行；§2.15 判据行 |
| 17 | 🔵 | 行数小差 → §2.5⑥（`createCoreRun` `:228`–`:607` = 380 行 ∥ 缝 1 ≈140 行 ∥ `655 − 142 = 513` 仍越 500）；`#1566` 行数面复核见 §2.10 |

### 2.21 落地轮（设计席 · 档面落地 · 2026-10-19）

**本节 = 本轮读数与落点，权威面顺延**：§2.13 A–H 裁定不变；本节只追加**跑出来的数**与**改动坐标**。

**① 读数（命令 ∥ 结果）**

- `（拟新增` 规范面复扫（`docs/**/*.md`，排除 `docs/batches/**`）= **core 7 处 / 4 档**（`core/design/MODEL-SPECS.md` 4 · `core/design/PROVIDER.md` 1 · `core/design/TEAM.md` 1 · `core/requirements/_archive/ENGINEERING-MODE-MECHANISM.md` 1）——**他批范围（铁律：不动 `docs/core/**`）**；其余板块 **0 命中**。
- 本批删标记 **49 处 / 16 档**（改前实测全量 56 处 / 20 档 = 本批 49 + core 7）。逐档处数：server/design **22**（`sandbox/SANDBOX.md` 6 · `webui/TERMINAL.md` 5 · `accounts/ACCOUNTS.md` 4 · `sandbox/EXECUTION.md` 2 · `webui/SANDBOX.md` 2 · `client/CLIENT.md` 1 · `ledger/LEDGER.md` 1 · `webui/CHAT.md` 1）· desktop/design **10**（`E2E-TESTING.md` 6 · `PACKAGING.md` 3 · `SHELL.md` 1）· `render-core/design/RENDER-CORE.md` **10** · `cli/design/READ-DATA-INTERFACE.md` **2** · `vsc/design/SETTINGS.md` **2** · `docs/RELEASE.md` **2** · `server/requirements/PROJECT.md` **1**。
- `#1533` AC-5 原文**已读**（`docs/batches/2026-10-16-box-quota-recovery.md:100`）：判据句 = `.6` 上一工作区造陈旧挂载 ⇒ 走 ② 得恢复 + `quota_recovered` 行；销毁后零残留。**字段名与 §2.5⑦ 一致**（`recovery` ∥ `quota_recovered` ∥ `findmnt`/`losetup` 零残留）⇒ §2.8 的未读项**闭合**，实施前无需再校准。
- 行数（改前 ⇒ 改后；`\n` 计数后 +1）：`docs/desktop/design/PROJECT.md` 539 ⇒ 539（+2 行 / −1 段 / −1 空行）· `docs/render-core/design/RENDER-CORE.md` 508 ⇒ **509** · `docs/server/design/sandbox/EXECUTION.md` 373 ⇒ **378** · `docs/RELEASE.md` 387 ⇒ **388** · 余 12 档 **±0**（原位删标记）。

**② 档面落点（条 → `file:line`）**

| 条 | 改动 | 落点 |
|---|---|---|
| `#770` | 表头收正 `D1–D27 · D34 · D35`；`:407` D35 正文句转表行；补 D34 行 | `docs/desktop/design/PROJECT.md:405` ∥ `:436`（D34 → `docs/desktop/design/COMPOSER.md` §4 ∥ T-DSK56）∥ `:437`（D35 → `docs/desktop/design/ACTIVITY.md` §2） |
| `#1511` | 49 处标记删净、内容全保（行数预算 ∥ 文件行 ∥ 机制句全留） | server：`sandbox/SANDBOX.md` §3 传输层行 / §13 三表行；`webui/TERMINAL.md:20-23` ∥ `:81`；`accounts/ACCOUNTS.md:80` ∥ `:82`；`sandbox/EXECUTION.md:13`；`webui/SANDBOX.md:50` ∥ `:53`；`client/CLIENT.md:45`；`ledger/LEDGER.md:23`；`webui/CHAT.md:157` · desktop：`E2E-TESTING.md:143` ∥ `:184` ∥ `:185` ∥ `:204` ∥ `:238`（「标记清除」待办项改写为现状句）· `PACKAGING.md:14` ∥ `:156` ∥ `:168` · `SHELL.md:16` · render-core：`RENDER-CORE.md` §2 KD-RC-8/12 表行 ∥ §5 条 5/6 ∥ §7/§8 随动段（行号 = 当刻快照，引用以段名为准）· `cli/design/READ-DATA-INTERFACE.md:27` ∥ `:28` · `vsc/design/SETTINGS.md:637` ∥ `:653` · `docs/RELEASE.md:14` ∥ `:100` · `server/requirements/PROJECT.md:361` |
| `#1529`（落档面） | 三态语义一行（空表 ≠ 未到 ∥ 锚零矩形兜位）入接口契约节 | `docs/render-core/design/RENDER-CORE.md:228`（§5 条 6） |
| `#1599` | 复原口径三段（前置 ∥ `.loop.img` 去留二择及后果 ∥ 当次可达 vs 持久不复原）+ 命令序列 | `docs/server/design/sandbox/EXECUTION.md:109-113`（§4 降级腿披露句之后） |
| `#1681`（落档面） | 发布序硬门：核内算式/机制变更 ⇒ 核先发，下游依赖写精确版同批抬 | `docs/RELEASE.md:15`（§1 总体需求） |

**③ 轮次 2 八条处置（号 → 落点 ∥ 未落）**

| 号 | 严重度 | 处置 |
|---|---|---|
| 1 | 🟡 | **已落**：本批单一实测清单 = 本节 ①（16 档 / 49 处；core 7 处另记）；§2.4② 的坐标枚举与 §2.10 自报档数**作废于本节**（其内已核为陈旧：`agent/MEMBER-AGENT.md:347` ∥ `webui/STYLE.md:100` ∥ `webui/TABS.md:71` ∥ `desktop/design/PROJECT.md:505` ∥ `vsc/requirements/WEBVIEW.md:26–:36` ∥ `core/requirements/PROMPT-SYSTEM.md:130` 现盘零命中；desktop 实为 3 档非 4）。判据保持 `grep = 0`，不依赖计数 |
| 2 | 🟡 | **未落**：`model.empty` 载体清单未定成一份逐档表（现文两说：§2.10 i18n 行与 §2.15 载体段）；本机未读核字典与 VSC 本地档键集 ⇒ 处数与 Δ 无读数，不臆造。**上抛待裁** |
| 3 | 🟡 | **未落**：`thincoder-desktop/renderer/mount-settings.mjs` ∥ `thincoder-server/package.json` 的现行行数未读（本轮未取该读数） |
| 4 | 🟡 | **半落**：发布序联动已入 `docs/RELEASE.md:15`（核内容变更 ⇒ 下游精确版同批抬）；`model.empty` 落核字典 ⇒ 触发该序这一点仍待 §2.15 同批记（随 #2） |
| 5 | 🔵 | **未落**：§2.5⑥ 缝 1「9 件」含区间外的 `reasonTextOf`（`:610`）——区间内实为 8 件，文字未改（§2 append-only，须另段落改） |
| 6 | 🔵 | **已落**：`#1511` 判据单表述 = 本节 ①（`grep = 0` ∧ 逐处回读句子仍成立） |
| 7 | 🔵 | **未落**：§2.11 `#1529` 行的否定式判据（`panel.style.top !== "4px"`）未改肯定式；档面侧已在 `RENDER-CORE.md:228` 写肯定式（视口居中兜位），批档行待另轮 |
| 8 | 🔵 | **未落**：§2.4① 的 `#770` 判据未补「行单元格数 == 表头单元格数」一条（本轮已按 3 列落表，判据句待补） |

**④ 计数核对（自检）**：§3 轮次 2 表实测 = 🟡 **4** + 🔵 **4** = **8** 行；派单记「五条 🟡 / 四条 🔵」= 9 行，**差 1 行**（差异在派单计数与盘面表）。§2.20 = 轮次 1 的 17 条落点表，**不含**轮次 2 各行；派单「轮次 2 的五条 🟡 / 四条 🔵 已在 §2.20 记了落点」与盘面不符。

**⑤ 未做 / 边界（如实）**

- 产品码零触（`views-sandbox.mjs` ∥ `settings.mjs` ∥ `model-menu.mjs` ∥ `mount-team.mjs` ∥ `package.json` 钉版 ∥ `core-run.mjs` 拆案 = 他席面）。
- `docs/core/**` 零触（他批在途）；`docs/batches/**` 与 `docs/README.md` 零触。
- `#1566` 档账（`docs/server/design/agent/MEMBER-AGENT.md` §5）随实施轮，不在本轮。

### 2.22 修正轮（轮次 2 余六条 · 2026-10-19）

**锚点（轮次 1 十七条 ∥ 轮次 2 八条各在哪儿）**：轮次 1 十七条的落点表 = §2.20（`:326`–`:366`，表头「17 条逐条落点」）；轮次 2 八条的初处置 = §2.21 ③（`:389`–`:400`，逐行「已落 / 半落 / 未落」）；本轮 = 本节，处置轮次 2 里余下的六条（2 / 3 / 4 / 5 / 7 / 8），编号以 §2.21 ③ 的行为准。

**派单计数更正**：派单记「五条 🟡 / 四条 🔵」= 9 行；§3 轮次 2 表实测 = 🟡 **4** + 🔵 **4** = **8 行**（读数行 = §3「轮次 2」段的「计数」行）。**派单计数有误，实为 8 条**，非实施席的账；评审段不改。

**② `model.empty` 载体（逐档实读；行数 = `\n` 计数 + 1）**

键值定形：zh「无可用模型」∥ en `No models available`（与既有 `model.*` 同形同行）。

| 档 | 现行行数 | `model.*` 键数（实读） | Δ | 加键判定 ＋ 依据 |
|---|---|---|---|---|
| `thincoder-server/public/i18n-zh-core.mjs` | 145 | 11（`model.loading` `:42`） | +1 | **加** —— 同族键在此，`model.empty` 与 `model.loading` 同址同形 |
| `thincoder-server/public/i18n-en-core.mjs` | 142 | 11（`model.loading` `:39`） | +1 | **加** —— 同上（en 侧） |
| `thincoder-desktop/renderer/i18n-composer.mjs` | 152 | 11 × 2 语块（en `:64` ∥ zh `:127`） | +2（两块各一键） | **加** —— 理由取「保持键集对齐」：三端同族键集逐键一致；该端 `#1529` 入口不可达（`thincoder-desktop/renderer/composer-sync.mjs:101`–`:110` 纯文本无钮），加键不改行为，只补键集缺口 |
| `thincoder-vscode/locales/en.json` | 351 | 11（`model.loading` `:107`） | +1 | **加** —— VSC 面文案的唯一来源：核投影不含 `model.*`（见末行），本地档缺键时 `t()` 回退返回键名（`thincoder-vscode/src/i18n.mjs:66`）⇒ 不加则缺陷面直接显示字面 `model.empty` |
| `thincoder-vscode/locales/zh.json` | 351 | 11（`model.loading` `:107`） | +1 | **加** —— 同上（zh 侧） |
| `thincoder-core/i18n.mjs`（核字典） | 128 | **0**（`CORE_MESSAGES` 46 键，无一个 `model.*`） | 0 | **不加** —— 该容器自述边界 = 核域文案（压缩 / 消化 / 限流 / 异步池 / 会诊 / 任务 / goal / 思考状态；`:14`–`:16`），面板文案归端侧；在此新增即新开一个非核域键族 |

- **键集断言件**：本轮检索 `thincoder-core/test/**` 与 `thincoder-vscode/**`（文件名/路径含 test，共 7 档候选）对 `CORE_MESSAGES` ∥ `model.loading` ∥ `locales` **零命中** ⇒ **未读到既有键集断言件，不列**；实施轮的断言形 = 上表五档各含 `model.empty` 一次（`grep` 计 1）。
- 判定不取条件句：桌面档「加」（键集对齐），核字典「不加」（边界），VSC 两档「加」（唯一来源）。

**③ 两个读数（本轮实读，已补进 §2.10）**

- `thincoder-desktop/renderer/mount-settings.mjs` = **308 行**（§2.10 `#1518` 注释 行现行数由「—」补为 308）。
- `thincoder-server/package.json` = **32 行**（`"@thincoder/core": "^0.10.7"` 在 `:17`；§2.10 `#1681` 行现行数补为 32，同格并记 `docs/RELEASE.md` 388）。
- `#1518` C1 行 Δ 已写「零动作」（`thincoder-cli/src/tui/cmd-team.mjs` 268 行，`:202` 已对称），不再与「未标注」同形。

**④ 核字典联动：不触发（依据 = 实读）**

`model.empty` **不落核字典**（上表末行：核字典 `model.*` 0 键，边界在 `:14`–`:16`）⇒ 核发版与服务端精确钉版随正**不触发**；`#1681` 的待钉发布版（含 `460fcbac`，≥ `0.10.9`）与本项无绑定关系。
指针已入 `docs/RELEASE.md:16`（新增一行，指 `docs/render-core/design/RENDER-CORE.md` §5 条 6）；载体句已入 `docs/render-core/design/RENDER-CORE.md:229`–`:230`（两态键只住端侧字典 + 核容器边界）。

**⑤ 缝 1 计数更正（更正 §2.5⑥ 的「9 件」；原句保留，本节为准）**

`thincoder-server/deploy/sandbox/member-shell/core-run.mjs` 区间 `:51`–`:192` 内实为 **8 件**纯函数：`slotOf`(`:85`) ∥ `withBoxProvider`(`:93`) ∥ `isToolFailureText`(`:111`) ∥ `textOf`(`:119`) ∥ `flagsOf`(`:128`) ∥ `projectMessages`(`:140`) ∥ `excerptOf`(`:175`) ∥ `listFilesOf`(`:188`)。
第 9 件 `reasonTextOf`(`:610`) 在区间外，**留 `core-run.mjs`**，不入缝 1。减量读数不变：区间 142 行 ⇒ `655 − 142 = 513`，仅缝 1 仍越 500 咨询线（落线靠缝 2）。

**⑦ §2.11 `#1529` 判据改肯定式**

兜位判据 = **面板矩形中心落视口中心**（`|centerX − innerW/2| ≤ 2 ∧ |centerY − innerH/2| ≤ 2`），与 `docs/render-core/design/RENDER-CORE.md:228`「面板落位取视口居中兜位」同形；否定式（`panel.style.top !== "4px"`）已删。落点 = 本档 `:198`。

**⑧ §2.11 `#770` 判据补列数机检**

新增一条：**表体每行单元格数 == 表头单元格数**（逐行，3 列），与首列集合判据同批跑；§2.4① 判据行只留指针（不重述）。落点 = 本档 `:189`。

**本轮边界**：产品码零触；`docs/core/**` 零触；`docs/batches/**` 只动本档 §2。

## §3 设计评审（评审子代理）

### 轮次 1（评审子代理）

评审对象 = 批 L 设计载荷（本档 §2，权威面 2.13–2.19）；旁证面 = `docs/desktop/design/PROJECT.md` ∥ `docs/server/design/sandbox/EXECUTION.md`。

| # | Category | Severity | Issue | Suggestion |
|---|----------|----------|-------|------------|
| 1 | Feasibility / 需求覆盖 | 🔴 | `#1599` 复原口径（裁定 E：`umount` → `losetup -d` → 原目录露出）**不达目标且未披露复盖**：`EXECUTION.md:113` 就位判据「① 未挂在工作区路径上 ⇒ `absent`（建/挂）」+ `:130`「`absent` ∧ 镜像在场且具 `project`（只挂载既有镜像，零 `mkfs`）」+ `:99` 配额步在三链在场（建盒 ∥ 启动确保链 ∥ 轮换重建）+ `:60` 启动 = ①→②→④→⑤→⑥ ⇒ 手工撤走后 `<path>.loop.img` 仍在盘，下次建盒/启动再走 ext4 径失败 ⇒ 再降级 ⇒ 只挂载既有镜像 ⇒ **原目录再被盖住**；口径内亦无 `<path>.loop.img` 的处置（销毁径的第三步 `:132` `rm -rf <path> <path>.loop.img` 被截掉），且未写「先停盒」前置（运行中盒经 bind 挂载占用该路径） | 口径补三段：① 前置 = 停盒/销毁（否 `umount` 撞 EBUSY 或盒失卷）；② `<path>.loop.img` 的去留二择（保留 ⇒ 下次启动可能只重接、再盖住；删除 ⇒ 下次 `absent`+镜像不在 ⇒ `truncate`+`mkfs` 新建、同样盖住）；③ 明写「复原是**当次可达**，根因（`chattr` 被拒）未解则每次启动复发」——把「一次性检视」与「持久复原」分开表述 |
| 2 | 受影响文件（行数面） | 🔴 | `#1529` 改动档 `thincoder-render-core/composer/model-menu.mjs` **实读 494 行**，§2.10/§2.17 均无该行；本条改动 = 三态分支 + 锚零矩形兜位（+≈10 行）⇒ **越 500 咨询线**，设计未带拆分案与 Δ 标注（`model-menu.mjs:93`/`:123`–`:130` 为改动点） | §2.10 补行：现行 494 · Δ ≤±12 · 越线后处置（就地拆出 `model-menu-place.mjs` 一类的定位纯件，或写明「三态分支抽为独立渲染支」的拆分口径） |
| 3 | 受影响文件（行数面） | 🟡 | `#1518` 四处落点里 `panel-messages-settings.mjs`（`:281`）∥ `team-surface.mjs`（`:149`，实读 191 行）∥ `mount-team.mjs`（`:164`，实读 355 行）**未进 §2.10**，`#1518` 行的 `settings.mjs` 现行数记「—」（该档实读 427 行，同表 `#1528` 行已载）；且补 `onProvidersChanged?.()` 会使 `mount-team.mjs:13`「登出 ∥ 轮换两径零改」∥ `mount-settings.mjs:82` 的枚举句失实，两注释未列入改动 | §2.10 逐档补行数与 Δ；把 `mount-team.mjs:13` / `mount-settings.mjs:82` 的注释收正列入 `#1518` 改动清单（同批改，勿留失实句） |
| 4 | 需求覆盖 | 🟡 | `#1518` V3 只推空 `models`，**未清簿记**：`settings.mjs:405` `_lastModelsPayload = allModels` 仍在 `flush()` 内（V3 分支不经过），`panel-session.mjs:164`–`:165` 会话切换时按 `lastModelsPayload()` 复推 ⇒ 登出后开/切会话**可把旧候选推回**，正是 V3 要治的病；`_lastPushedPrefs`（`:411`）同理属播种回声门判零源 | V3 同拍把 `_lastModelsPayload = []`（及 `_lastPushedPrefs = null`）一并置零，判据补一条「登出 ⇒ 开/切会话后 `#model-btn` 仍隐」 |
| 5 | Document ownership / Clarity | 🟡 | `#1529` 新键 `model.empty` **无载体清单**：现键 `model.loading` 分布在 `thincoder-server/public/i18n-zh-core.mjs:42` ∥ `i18n-en-core.mjs:39` ∥ `thincoder-desktop/renderer/i18n-composer.mjs:64`/`:127`（三档四处）；VSC 面经 `thincoder-vscode/src/i18n.mjs:49` `loadLocaleStrings` 投影——本条缺陷恰在 VSC 面，设计只点了 server 公共档；另 `thincoder-render-core/**` 的行为改动未列其归属档（内容面单源 = `PROJECT.md:73` KD-29 → `docs/render-core/design/RENDER-CORE.md` §5） | 列全 i18n 载体（哪些档加键、键集断言件随正）+ 在 RENDER-CORE.md 对应节补一行三态语义（空表 ≠ 未到） |
| 6 | Requirements / 状态一致 | 🟡 | `#1511` 同一测量在 §2 内有两个活读数：§2.1 行 2「全仓 415 命中全部落在 `docs/batches/**`／规范面零命中 ⇒ 本行**无需改文**」 ⟥vs⟥ §2.16/§2.17「规范面 56 处 / 20 档，删标记」。读者在 §2.1 处无法得知本批到底改不改 20 档 | 按 2.13 权威面把 §2.1 行 2 的「无需改文 / 零命中」删去或改为一行指针（→ §2.16），同一测量只留一处读数 |
| 7 | Doc hygiene | 🟡 | 规范面残留修订式表达：`§2.12`「2.2（首笔内的「2.9 未解清单」块）**作废** —— 由 2.8 取代」= corpse 标记 + 与 `§2.9`（两份，`:31`/`:135`）重号；`§2.13`「§2.4 各条里的「推荐 ∥ 待裁」句与 §2.7 上抛 A–E 已由父侧裁定取代」而 §2.7 五条仍以「[上抛·待裁]」在场 | 删「作废」句与重号首版；§2.7 五条按裁定改写为定案行（或整节移入记录面），历史让位给 git/批次记录 |
| 8 | Clarity / 状态一致 | 🟡 | §2 有**两条状态行**且值不同（`:9` 修正轮「设计完成」∥ `:12`「🔄 设计完成（首版…未解项单列 §2.9）」——后者所指 §2.9 已作废）；且状态「设计完成」与 §2.5⑦ `[待核]`（`#1533` AC-5 原文未读）∥ §2.8（`#1599` 承载档文面未逐行实读、锚点待定）并存 | 只留一条状态行（末态值）；未读两项读齐后落文，或状态改述为「部分完成（两项待读）」 |
| 9 | Methodology / 先例 | 🟡 | **缺最近先例行**（先例坐标 ∥ 对应设计节 ∥ 先例批 + 对齐 ∥ 偏离理由）。实质先例其实在正文里用了（`#1519` 容器侧两态 `views-sandbox.mjs:314`–`:315`；`#1518` 登录径 `panel-messages-settings.mjs:268` ∥ `mount-team.mjs:149`），但未成行 ⇒ 无从区分「查过」与「没查」 | 于 §2 首加一行：逐条列先例坐标 ∥ 对齐点 ∥ 偏离理由（如 `#1566` 拆缝偏离 `quota.mjs`/`box.mjs` 拆案先例处须明写） |
| 10 | Methodology / 抽查 | 🟡 | **缺抽查（公共源文档）行**（查了哪些公共源档 ∥ 有无相关）。设计对 `#1529` 的判别依赖宿主/webview 行为、对 `#1533`/`#1599` 依赖 `findmnt`/`losetup`/`chattr` 语义，均无源档对账记录 | 加一行抽查：`docs/README.md` 档目 ∥ `docs/server/requirements/PROJECT.md` §5 沙盒块 ∥ 宿主档（webview/Electron）∥ man/findmnt/chattr 行为——并记「无相关」也要记 |
| 11 | Clarity / 验收可判 | 🟡 | `#770` 三处：① 拟写的 D34 行指针形 `→ desktop/design COMPOSER.md §4` 与全表 canonical 形（`→ \`docs/desktop/design/SESSIONS.md\` §4`）不一致、无反引号全路径 ⇒ 指针族判不了；② 表头拟改「`D1–D27 · D34`」（区间记法）而判据是「表体编号集 == 表头集合（一次 grep 比对）」——区间不展开则集合比对不成立；③ 设计称 D28–D41「只在边界段与 §7 出现（:179/:189/:190/:191/:192/:194/:197/:199）」，实测 `PROJECT.md:407`（§6.1 内）载「D35 设计面 = …」、`:166` D32、`:7`/`:172` D37、`:105`/`:108`/`:111`（KD 行）、`:512`/`:514`/`:515`（§7）——**D28 全文零命中** ⇒ 收正后 §6.1 表头排除 D35 而表上一行仍写 D35，成孤儿 | 指针写全路径反引号形；判据改成可执行形（表头逐号枚举，或判据改为「表体编号集 == 计划补录集 ∪ 已载集」）；`:407` D35 句随表头收正一并处置（移入 D35 指针行或注明不属验收面） |
| 12 | 验收可判 | 🟡 | `#1533` 三段断言不可复跑：断言 B「新增 `quota_recovered` 行**恰好一条**」给的查询是 `select … order by id desc limit 1`（证不出「恰好」）；步骤 1/6 的 `findmnt -no SOURCE,TARGET <dir>` 与 `EXECUTION.md:111` 的读件定形 `findmnt -no TARGET,SOURCE,FSTYPE,OPTIONS -T <path>` 不同形、步骤 6 未给形；断言 C 的 `losetup -a` 未钉判据（按 NAME ∥ BACK-FILE） | 断言 B 改计数式（`select count(*) … where kind='quota_recovered' and id > <基线>`）；两处 `findmnt` 统一取 §4 读件定形；断言 C 给 `losetup -a -O NAME,BACK-FILE -n` 并按 back-file 归属判 |
| 13 | Feasibility / 覆盖 | 🟡 | `#1566` 缝 1 新档 `core-run-util.mjs` 落在 `deploy/sandbox/member-shell/**` = 壳源树，而该树是**内容寻址版本身份的覆盖集**（`EXECUTION.md:173`「覆盖集 = 源树逐件」；工件经 `prepack`→`public/box-shell/`，`:175`/`:302`）⇒ 增档即换壳版本、逐盒下次启动自取新版；档账归属（`:304`「档账随正 = `agent/MEMBER-AGENT.md` §5」）未列 | §2.10/§2.17 补：`MEMBER-AGENT.md` §5 档账随正 + 「本次拆分 ⇒ 壳树哈希变 ⇒ 需重发工件」的发布动作与回退窗（留 3 件）说明 |
| 14 | Clarity | 🟡 | `#1681` 只给「去 `^`」，**未给钉到哪个版本**：现串 = `thincoder-server/package.json:17` `"@thincoder/core": "^0.10.7"`，而病灶正是「`v0.10.8-core` tag 内 `COMPACT_RATIO = 0.6` ∥ 现盘 `0.8`、`460fcbac` 未发布」——钉错值会与服务端实际运行算式反向 | 写明目标版本串（并说明与「算式单源在核」的关系）；裁定 ③ 无机检面，验收表须如实标「纪律句，非机检」 |
| 15 | Scope | 🟡 | 板别/批范围：`#1528`（板记 desktop，档在 `thincoder-vscode/src/extension/settings.mjs`）∥ `#1529`（板记 desktop，缺陷实读为 **VSC 端**、改动落 `thincoder-render-core/**`）；`#1511` 56 处中 **19 处**（core 7 ∥ vsc 2 ∥ render-core 10）落在 §1 声明四板（server/desktop/cli/sandbox）之外，设计未标为范围外扩 | 板别按落档实改（`#1528`/`#1529` → vsc/render-core），并把跨板 19 处显式记为「范围外扩（协调项）」，由父侧确认后再扫 |
| 16 | 证据强度 | 🔵 | `#1529` 的 happy-dom 实测（§2.19）两条不判别：happy-dom 无布局引擎 ⇒ **任意**元素 `getBoundingClientRect()` 皆零矩形，故「隐藏钮 ⇒ 零矩形」未被该读数证成（缺可见钮对照）；「`click()` 触发 1 次」符合 DOM 规范但同属无命中测试环境的自然结果 | 补可见钮对照（同环境零矩形即证该读件无判别力），或改以真 webview/Electron 走查读数承载；删「由推理升为读数」的升级表述 |
| 17 | 行数读数（抽检） | 🔵 | 两处读数小差：① `#1566` 缝 1 引区间 `:51`–`:192` = **142 行**，估减「≈150 行」超区间上限 ⇒ 655−142 = 513 **仍在 500 软线之上**（缝 1 单独不达标，靠缝 2 才落 ≈340）；② `createCoreRun` 实读为 `:228`–`:607`（380 行，`:609` 是 `reasonTextOf` 的文档注释），设计记 `:228`–`:609`（382 行） | 缝 1 减量改 ≈140 并把「仅缝 1 仍越线」写明；区间改 `:228`–`:607` |

**计数**：🔴 = 2 ∥ 🟡 = 13 ∥ 🔵 = 2（共 17 行）。
**未解 = 2 项 🔴**（#1599 复原口径可行性 ∥ `model-menu.mjs` 越线无拆分案），其余为咨询项。
**说明**：本审唯一对象 = 本档 §2；`PROJECT.md` / `EXECUTION.md` 作旁证面（引用即实读）。`#770` 拟补 D34 之承载面（`COMPOSER.md:275`/`:288`）与 `#1533` 批档 AC-5 原文未在本轮实读 ⇒ 不据其作断言。

VERDICT: changes-required

### 轮次 2（评审子代理）

评审对象 = 批 L 设计载荷（本档 §2；权威面 §2.13–§2.20）。轮次 2 任务 = 复核轮次 1 十七条的落盘 + 新引入的明显问题。

**轮次 1 十七条复核结论（逐条到落点）**：1 → §2.5⑧ 三段齐备（前置 ‖ `.loop.img` 去留二择及后果 ‖ 当次可达/持久不复原）+ 命令序列；2 → §2.10 `#1529` 行（494 · ≤+12 · ≈506）+「越线处置」段（≈473）；4 → §2.14 V3 同拍清簿记（`_lastModelsPayload = []` ‖ `_lastPushedPrefs = null`）+ §2.11/§2.13 G 新判据；5 → §2.15「载体」+「归属档」段；6 → §2.1 行 2 单一读数（56 处 / 20 档，指针 §2.16）；7 → 作废句与重号已删（§2.12 索引无 2.2/重号 2.9）；8 → §2 只留一条状态行（部分完成）；9 → §2.20 首段最近先例行（`#1681` 明写「先例 = 无」）；10 → §2.20 抽查行（含「本轮未查」如实记）；11 → §2.4① 指针全路径反引号 + 取集判据 + `:407` D35 句转表行 + D28 零命中在册；12 → §2.5⑦ 计数式断言 + `findmnt` 定形 + `losetup -a -O NAME,BACK-FILE -n` 归属判；13 → §2.5⑥「壳源树后果」条 + §2.10/§2.11 随正；14 → §2.4⑤「钉版值」段（不能钉 `0.10.8`；目标 = 含 `460fcbac` 的发布版）+ §2.11 标「纪律句，非机检」；15 → §2.1 行 5/6 板列 + §2.13 H + §2.16 范围外扩 19 处；16 → §2.19 读数撤回、判据改真 webview 走查；17 → §2.5⑥ 改 ≈140 / `:228`–`:607` / 513 仍越 500。
**只落一半**：#3（`#1518` 逐档行数）——§2.10 行已建（V1 299 / V2 191 / V3 427 / D1 355 / 注释行 / C1 行），但 `mount-settings.mjs` 现行数仍记「—」⇒ 见本轮 #3。#6/#2 的新型表述见本轮 #1/#2。

| # | Category | Severity | Issue | Suggestion |
|---|----------|----------|-------|------------|
| 1 | Requirements / Clarity | 🟡 | `#1511` 的同一测量在 §2 内仍是**三份互不相同的清单/计数**：§2.4② 坐标枚举（`docs/batches/2026-10-19-tech-sweep-rest-multi.md:47`–`:52`，共 **29 档**——含 `agent/MEMBER-AGENT.md:347`、`webui/STYLE.md:100`、`webui/TABS.md:71`、`vsc/requirements/WEBVIEW.md:26`–`:28`、`core/requirements/PROMPT-SYSTEM.md:130`）∥ §2.16 实测表「`（拟新增` 命中 **56 处 / 20 档**」（`:279`，逐目录分解 8+3+1+3+1+1+1+1+1 = 20 档，server 侧只 8 档、不含 MEMBER-AGENT/STYLE/TABS/design/PROJECT.md）∥ §2.10 行的「`docs/server/design/**`（14 档）· `docs/desktop/design/**`（4 档）· `docs/core/design/**`（6 档）」（`:163`，合计 **32 档**）。且 §2.4② 自称「逐档首处」却每档列多处、处数与实测表逐档数不符（SANDBOX 4 vs 6；ACCOUNTS 2 vs 4；EXECUTION 1 vs 2；webui/SANDBOX 4 vs 2；MODEL-SPECS 3 vs 4）。⇒ 无可照做的档清单：照 §2.16 表会漏 §2.4② 的档，照 §2.4② 会多做；§2.13 H 的「19 处」随清单变动 | 三处同源于一次实测：以 §2.16 为唯一实测清单并逐档列路径，§2.10 的档数与 §2.4② 的坐标改为指针、不再自报档数；重算 §2.13 H 的跨板处数。判据保持 grep=0 不动（不依赖计数） |
| 2 | 受影响文件 / 行数标注（criterion 8） | 🟡 | `#1529` 新键 `model.empty` 的载体在两处说法不一：§2.10 i18n 行点三档并各「+1（`model.empty`）」（`:167`，含 `thincoder-desktop/renderer/i18n-composer.mjs`），§2.15 的「**加键同步三处**：server 两档（`zh` ∥ `en`）∥ 核字典 `@thincoder/core/i18n.mjs` ∥ VSC 本地档中同值副本所在键集」（`:273`）不含桌面档、却新增核字典与 VSC 本地档——后两者在 §2.10 表内零行、无现行行数与 Δ；「键集断言件随正」（`:273`）未指名测试档；桌面端本项判为不可达（`:266`），是否仍需加键无从判定 | 定成一份清单：逐档（路径 + 现行行数 + Δ）列 server 两档、核字典、VSC 本地档（「同值副本是否含 `model.*`」不留条件句、给判定结果）、键集断言测试档；桌面档取「加键」或「不加」其一并写理由 |
| 3 | 受影响文件 / 行数标注（criterion 8） | 🟡 | §2.10 仍有要改的非 .md 档把现行数记「—」：`thincoder-desktop/renderer/mount-settings.mjs:82`（`:177`，Δ「注释 1 行改」）与 `thincoder-server/package.json:17`（`:172`，Δ「1 行改 + 1 句」）。纯 .md 才是标注豁免面，这两处是产品码/配置改动 ⇒ 现行行数与 Δ 缺 | 补这两行的现行行数与 Δ；`#1518` C1（`:178`）零动作可留「—」，但 Δ 列写「零动作」，免得与「未标注」同形 |
| 4 | 可行性 / 发布序（协调项） | 🟡 | `model.empty` 若落核字典 `@thincoder/core/i18n.mjs`（`:273`），即一次核内容变更：按 §2.4⑤ 裁定 D（精确钉版 ⊕ 发布序硬门，「核先发 ⇒ 服务端同批抬精确版」，`:85`）服务端核依赖须随同一发布序抬版；VSC 面经 `loadLocaleStrings` 投影（`:272`）⇒ 核版未落前新键不可见。此联动设计未记（同类联动对 `#1566` 已记「壳版本随动 = 发布动作」，`:141`） | §2.6 或 §2.10 补一行联动：核发版（含 `model.empty`）⇒ 服务端精确钉版同批随正 ⇒ VSC 投影可见；并写明该核发版与 `#1681` 待钉发布版是否同一版 |
| 5 | Clarity | 🔵 | §2.5⑥ 缝 1 的搬件数与区间不一致：「`:51`–`:192` 的常量 + 9 件纯函数」（`:104`），而 9 件中的 `reasonTextOf`(`:610`)（`:100`）在区间外 ⇒ 区间内实为 8 件 | 写「区间 `:51`–`:192` 内 8 件（`reasonTextOf` 留 `core-run.mjs`）」，或把 `reasonTextOf` 明列进缝 1 并重算 ≈140 / 513 |
| 6 | 验收可判 | 🔵 | `#1511` 同一条判据三处表述不一：§2.4②「**0 命中**（可 grep 复核），且逐处回读句子仍成立」（`:53`）∥ §2.11「grep = **0**」（`:190`）∥ §2.13 B「只 grep 0，无形态断言」（`:228`） | 取一条为准（建议「grep 0 ∧ 内容保全」，内容保全由「留标记句承载的内容」句承担），其余改指针 |
| 7 | 验收可判 | 🔵 | `#1529` 锚兜位走查判据是否定式：`panel.style.top !== "4px"`（`:198`）——`top` 为空串或其他值同样通过，判不出兜位是否生效 | 改肯定式：面板矩形中心落在视口中心 ±ε，或 `panel.style.top`/`left` 属于兜位期望值集 |
| 8 | Clarity / 验收可判 | 🔵 | `#770` 拟补行给了行文形（`:37`、`:38`），但判据只覆盖「首列集合相等 + 指针目标档/节在盘」（`:40`），不含「列数与表头一致」⇒ 行形错列（少单元格）仍可判过 | 判据补一条 md 表格列数一致（行单元格数 == 表头单元格数），与集合判据同批跑 |

**计数**：🔴 = 0 ∥ 🟡 = 4 ∥ 🔵 = 4（共 8 行）。
**未解 = 0 项 🔴**（轮次 1 两项 🔴 已落：`#1599` 三段口径 ∥ `model-menu.mjs` 越线拆分案）。
**范围限制（如实记）**：本审仅读本档，外部档的行数/坐标读数未逐处对盘复核（unverified），故 criterion 8 的「抽查标注数」仅作内部一致性核对。

VERDICT: pass

## §4 用户批准（主 agent）

**批准（2026-10-19 · 用户整批令）**

用户逐字：「技术待办现在就开始处理」·「全部开」·「接着派，别等」——覆盖本批批准门。设计已过两轮评审 + 修正轮（§3 三轮记录；末轮 🔴0）⇒ 实施获准。

**批准范围**：非 core 板文档面 16 档（`#1511` 标记删除 ∥ `#770` 表行 ∥ `#1529` 三态语义 ∥ `#1599` 三段口径 ∥ `#1681` 发布序句 ∥ `#1533` 未读项闭合后的口径）。**产品代码零改动**。

## §5 实施记录（eng-coder）
## §6 验证与收口（父代理）

**验证与收口（2026-10-19 · 父代理）**

**① 机检门**：`doc_check(mode:"gate")` = **PASS**（会话重启后；全域 197 档 0 命中）。

**② 实施验证读数**：
- `#1511` 规范面 `（拟新增`：本批删 **49 处 / 16 档**（原 56 处 / 20 档 = 本批 49 + core 7 属他批）；非 core 板全部归零
- `#770` `docs/desktop/design/PROJECT.md` 表头 `D1–D27 · D34 · D35` + D34/D35 表行；两指针目标在盘
- `#1529` 三态语义 → `RENDER-CORE.md:228`（空表 ≠ 未到 ∥ 锚零矩形兜位，**肯定式判据**）
- `#1599` 三段口径 → `EXECUTION.md:109`–`:113`（前置 / `.loop.img` 二择 / 当次可达 vs 持久不复原 + 命令序列）
- `#1681` 发布序硬句 → `RELEASE.md:15`（纪律句，非机检——已在批档标注）
- **`#1533` AC-5 原文已读到**（`2026-10-16-box-quota-recovery.md:100`），字段名与 §2.5⑦ 一致 ⇒ **未读项闭合，不需猜**
- `model.empty` 载体表（6 行）：**核字典 `model.*` 实读 = 0 ⇒ 不加**（容器边界 = 核域文案，面板文案归端侧）；端侧五档各 +1/+2，判定依据逐档写明

**③ 单元测试零留存**：纯文档面，无测试档；判据 = `grep` 读数 + 逐档行数。

**④ 集成面**：无（文档面）。

**⑤ 修正轮落地前置**：修正轮（余六条：载体表 ∥ 两个读数 ∥ 核字典联动 ∥ 缝 1 更正为 **8 件** ∥ `#1529` 判据肯定式 ∥ `#770` 列数机检）**已落**。

**⑥ 搁置清单回核**：无。**⑦ 暂缓批复核：无**。

**⑧ 用户文档面同拍**：本批改的是 VSC / 桌面 / 渲染核的设计单源，**下游按它写代码** ⇒ 每条都有落点坐标。

**⑨ 派单缺陷留档（父侧自记）**：父侧派单写「五条 🟡 / 四条 🔵」，盘上实为 **4🟡 + 4🔵 = 8 条**——**计数靠印象、没数**。设计席在 §2.22 如实记了「派单计数有误」。**这是父侧的错，不是实施方的账。**

**⑩ `#1511` 的三份清单收敛**：§2.4② 坐标枚举（29 档）∥ §2.16 实测表（20 档）∥ §2.10 行（32 档）三说并行——本批以 §2.21 的**单一实测清单（16 档 / 49 处）**为准，其余改指针。
