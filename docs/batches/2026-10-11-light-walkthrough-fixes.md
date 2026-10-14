# 2026-10-11 · light-walkthrough-fixes
> 六段 append-only，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 编制：主 agent · 2026-10-11 · 来源 = 用户 2026-10-11 20:14 实走发现（镜像源常用预选表缺实测可用源——原话「我发现你刚才测通的那个镜像源根本不在常用源列表里，太坑了。」）+ 全链自动授权（18:44「也自动跑完」）。
> 台账 = #1284（server · 归批）。前情 = 无（独立批）。
## §1 讨论（主 agent）
**状态行**：已收口 2026-10-11
<§1 模板占位：本批条目 / 关键判据 / 授权口径>

### pen 1（实走缺陷——常用源预选表）
- **披露**（2026-10-11 20:1x · 对话在案）：「本笔 = 轻通道（实走缺陷类）｜改动 = 常用源预选表补第 7 条 `docker.1ms.run` + 设计三处计数随正｜波及 = 代码 1 档 + 设计 3 档 + 批内件 1 档｜回滚 = 逐档可 revert」。
- **改动**（逐档）：① `thincoder-server/src/sandbox/image-sources.mjs`——`SOURCE_PRESETS` 第 7 条 `Object.freeze({ name: "Docker Hub 镜像（1ms.run）", address: "https://docker.1ms.run" })` + 两处头注（`:8` 计数 ∥ `:19-21` 枚举 + why：实拉实证 `.6` 200·10.4s·119MB；用户实走发现缺表）；② `thincoder-server/public/views-sandbox-image-sources.mjs:5`——头注计数（六 ⇒ 七）；③ `docs/batches/2026-10-11-sandbox-image-sources.test.mjs`——三处断言（`:260` 注释 ∥ `:263-272` 列表 + 计数 ∥ `:682` `length === 7`）；④ `docs/server/design/sandbox/SANDBOX.md` §3——预选清单 六 ⇒ 七 + 第 7 条落名（含 why）+ 变更记录行；⑤ `docs/server/design/gateway/API.md` §2.5——端点行计数随正 + 变更记录行；⑥ `docs/server/design/webui/WEBUI.md` §2.10——**待 #237（chat 设计微轮）放行后补一笔**（避并发写）。
- **走查**：批内件复跑 `node --test docs/batches/2026-10-11-sandbox-image-sources.test.mjs` = **13 pass / 0 fail**（含「预选七条逐值」断言）；用户可见面 = 后续 `.5` 部署后「添加源」下拉第七项。
- **冻结**：本笔改动档（①–⑤）冻结于本记录；⑥ 落笔后同冻。

- **追记（pen 1 ⑥ 落 · 2026-10-11 20:2x）**：`docs/server/design/webui/WEBUI.md` §2.10 增/改弹窗句（`:557`）+ §6 镜像源族行（`:715`）预选下拉 六 ⇒ 七条 + 变更记录行（同笔落）——#237（chat 设计微轮）放行后一笔补；本笔六档全数落位。**pen 1 改动面封**：① `src/sandbox/image-sources.mjs` ∥ ② `views-sandbox-image-sources.mjs` ∥ ③ 批内件 ∥ ④ `SANDBOX.md` ∥ ⑤ `API.md` ∥ ⑥ `WEBUI.md`。

### 笔 2——建容器镜像：手输 ⇒ 节点本地镜像选单（2026-10-11 21:0x）
- **来源**：用户 21:00 实走上报（原话「创建容器的时候，镜像好歹给做成下拉选择啊，让我手输哪输得准啊！」）。
- **口径**：选单 = 目标节点本地镜像（既有端点 `GET /api/admin/sandbox/runners/:id/images`——零新端点）；选定 ⇒ 回填下方镜像输入（可再改；提交取输入值）；「自定义（手输）」保底（读败/空表/设置预填不在表 ⇒ 手输照常——零回归）。
- **落点**：① `thincoder-server/public/views-sandbox-containers.mjs`（建容器窗——选单 + 回填 + 预选；`<none>`/空 tags 滤除）∥ ② `i18n-zh-sandbox.mjs` ∥ ③ `i18n-en-sandbox.mjs`（各 +2 键：`imageFromNode` ∥ `imageCustom`）∥ ④ 批内件四档随正（`2026-10-10-runner-admin-console-ui.test.mjs`——选单三断言 + 提交体期望值改「nginx:1.27」∥ `2026-10-08-server-public-structure.test.mjs`——键数 **598 ∥ 603** + 指纹锚两枚重算 ∥ `2026-10-10-server-small-fixes.test.mjs` ∥ `2026-10-11-admin-agent-chat-ui.test.mjs`——键数随正）∥ ⑤ `webui/SANDBOX.md` §2.1① + 变更记录。
- **走查读数**：全链 `npm run prepublishOnly` = **478/478 绿 · 0 红**（EXIT=0；本笔无新 `test()` 块——总计数不变）。受影响四档全绿（指纹锚 = 重算值 `ea028ee2…` ∥ `9ebe47ab…`）。
- **冻结**：待部署 `.5` 后实走复核（用户径）。

- **笔 2 部署读数（2026-10-11 21:1x）**：提交 `ed4aed38` 双推 origin ∥ github ✓；箱 `~/thincoder` fast-forward ✓；镜像重建 `0a91641c52be`（仓根上下文 + 双包）；容器 `--force-recreate` ⇒ `Up (healthy)` ✓；探针：`healthz=200` ∥ 服上 `i18n-zh-sandbox.mjs` 含 `imageFromNode`（命中 1）∥ 服上 `views-sandbox-containers.mjs` 含 `imageCustom`（命中 1）——新件在服 ✓。**待用户实走复核**（沙盒页 → 节点展开 → 创建容器 → 镜像下拉）。

### 笔 3——建容器待命命令：盒一启动就退出（2026-10-11 21:10）
- **来源**：用户 21:10 实走上报（原话「我创建了一个ubuntu:24.04的容器，然后启动，为啥总是一启动就退出？」）。
- **根因**（实读）：`ubuntu:24.04` 自带命令 = `/bin/bash`，无终端 ⇒ 读不到输入秒退（exit 0）；最小切片建容器只传镜像+卷、未传待命命令 ⇒ 无长驻进程的镜像一亮即退。盒镜像 `deploy/sandbox/Dockerfile:18` 自带 `CMD ["sleep","infinity"]` ⇒ 真机走查未暴露本缺口。
- **落点**：① `thincoder-server/src/sandbox/container-routes.mjs`（建容器体恒携 `Cmd: ["sleep","infinity"]`——沿盒镜像自身语义；注一行）∥ ② 批内件断言随正（`2026-10-10-runner-admin-console.test.mjs:302`——请求体逐值含 `Cmd`）∥ ③ `sandbox/SANDBOX.md` §3 建容器条 + §12 N46 + 变更记录。
- **走查读数**：全链 `npm run prepublishOnly` = **478/478 绿 · 0 红**（EXIT=0）。
- **用户侧影响**：**旧容器命令已定死 ⇒ 需重新建一个**（新建的才会待命）；既有 `ubuntu:24.04` 镜像可复用。

### 笔 4——卷字段说人话（2026-10-11 21:13）
- **来源**：用户 21:13 实走上报（原话「我看到那个"卷"也挺迷糊的，不知道该填什么。」）。
- **口径**：字段标签「数据卷（可留空）」；占位举例「起个名字，如 box-data（拿不准就留空）」；**字段下一行大白话说明**「卷 = 给容器留一块持久盘：删了容器，里面的数据还在。拿不准就先留空。」——「卷」是行话，本次把「是什么 / 填什么 / 不填会怎样」写全。不做面：字段默认自动起名（= 语义变化，未点不做——如用户要 ⇒ 单列提议）。
- **落点**：① `i18n-zh-sandbox.mjs` ∥ ② `i18n-en-sandbox.mjs`（标签/占位改值 + 新键 `volumeHint`——键数 **599 ∥ 604**）∥ ③ `views-sandbox-containers.mjs`（字段下加说明行）∥ ④ 批内件四档随正（指纹锚重算 `a366534b…` ∥ `fac676d1…` + 计数）∥ ⑤ `webui/SANDBOX.md` §2.1① + 变更记录。
- **走查读数**：全链 `npm run prepublishOnly` = **478/478 绿 · 0 红**（批级读数——四笔同轮；本笔单一跑点未另录）；部署 `.5` 复核 = 见 §2 验收对照（:80-87）。**收口链补录（2026-10-11 收口）**：#249 评审发现表（5 条：1🔴+2🟡+2🔵）代录 = §6（§3 拒父侧写——一段一作者；#249 未携批次档写通道）。

## §2 批次任务与设计（eng-designer）
**状态行**：设计完成（轻通道轮形式化 · 评审 #249 🟡-1）
<§2 模板占位：本批条目（覆盖） / 设计档落点 / 机制设计 / 受影响文件与测试面 / 验收对照 / 关键决策 / 上抛项>

### 本批条目（覆盖）

本批 = 轻通道轮（实走缺陷类 ×4——用户 2026-10-11 实走；四笔先实施，§2 于收口链补形式化——评审 #249 🟡-1；台账 #1284 · server）。四笔来源 = 用户走查要义 + 时点（原话全文见 §1——本处指针式）：

| # | 条目 | 来源（要义 + 时点） |
|---|---|---|
| pen1 | 常用源预选表 +1（第 7 条 `docker.1ms.run`）+ 计数随正（六⇒七） | 20:14 实走——「测通的镜像源不在常用源列表」；实拉实证 `.6` 200·10.4s·119MB |
| pen2 | 建容器镜像字段：手输 ⇒ 节点本地镜像选单（+「自定义（手输）」保底） | 21:00 实走——「镜像做成下拉选择」（要义：手输不准） |
| pen3 | 建容器待命命令恒携（修「一亮即退」） | 21:10 实走——「ubuntu:24.04 容器一启动就退出」 |
| pen4 | 建容器卷字段说人话（标签 ∥ 占位 ∥ 说明行） | 21:13 实走——「"卷"迷糊、不知道该填什么」 |

### 设计档落点（现行读——零触、只引）

| 设计档 | 落点（现行读） | 笔 |
|---|---|---|
| `docs/server/design/sandbox/SANDBOX.md` | §3 建容器条 :61-63（`Cmd` 恒携；:63 含 #249-2 服务镜像面注）∥ §3 预选清单 :150-152（第 7 条 :152）∥ §11 镜像源族判据行 :341（预选七条）∥ 变更记录 :553 ∥ :556 ∥ :559 | pen1 · pen3 · #249 |
| `docs/server/design/webui/SANDBOX.md` | §2.1① 建容器弹窗 :19（镜像选单——pen2）∥ :20（卷字段说明——pen4）∥ :27（增/改弹窗句——预选下拉七条；pen1 ⑥ 同源句现址）∥ 变更记录 :116 ∥ :117 | pen1 · pen2 · pen4 |
| `docs/server/design/gateway/API.md` | §2.5 建容器行 :129（`Cmd`——#249-1 补）∥ 预选端点行 :143（七条）∥ 变更记录 :394 ∥ :396 | pen1 · #249 |

- 注（拆分沿革——只记指位）：pen1 ⑥ 原落 `webui/WEBUI.md` §2.10（另笔——`sandbox/SANDBOX.md` :556 在案）；域内拆分后同源句现址 = `webui/SANDBOX.md` §2.1①:27，`webui/WEBUI.md` 留变更记录行 :361。

### 机制设计（逐笔一行）

- pen1：`SOURCE_PRESETS` +1（第 7 条 `https://docker.1ms.run`——实拉可用源）；计数六⇒七全域随正（代码头注 ∥ 设计档 ∥ 批内件断言）。
- pen2：建容器窗镜像字段 = 目标节点本地镜像选单（零新端点——既有 `GET …/runners/:id/images`；`<none>`/空 tags 滤除）；选定回填、可再改；「自定义（手输）」保底；提交 = 当刻输入值。
- pen3：建容器请求体恒携 `Cmd: ["sleep", "infinity"]`（沿盒镜像自身 CMD 语义——`deploy/sandbox/Dockerfile:18`；`container-routes.mjs` 注一行）。
- pen4：卷字段三件套 = 标签「数据卷（可留空）」∥ 举例占位「起个名字，如 box-data」∥ 字段下一行大白话说明；`Binds` 形零改。

### 受影响文件与测试面（只列名与笔）

- 产品码（五档）：`thincoder-server/src/sandbox/image-sources.mjs`（pen1）∥ `src/sandbox/container-routes.mjs`（pen3）∥ `public/views-sandbox-containers.mjs`（pen2 ∥ pen4）
  ∥ `public/views-sandbox-image-sources.mjs`（pen1；#249-🔵5 缩进）∥ `public/i18n-{zh,en}-sandbox.mjs`（pen2 ∥ pen4——键数 598 ∥ 603 ⇒ 599 ∥ 604）。
- 批内件（六档）：`docs/batches/2026-10-11-sandbox-image-sources.test.mjs`（pen1）∥ `2026-10-10-runner-admin-console.test.mjs`（pen3）
  ∥ `2026-10-10-runner-admin-console-ui.test.mjs`（pen2 ∥ pen4）∥ `2026-10-08-server-public-structure.test.mjs`（pen2 ∥ pen4）
  ∥ `2026-10-10-server-small-fixes.test.mjs`（pen2 ∥ pen4）∥ `2026-10-11-admin-agent-chat-ui.test.mjs`（pen2 ∥ pen4）；本批零新 `test()` 块（总计数不变）。
- 设计档（三档——现行正文载体）：`sandbox/SANDBOX.md` ∥ `webui/SANDBOX.md` ∥ `gateway/API.md`（另 `webui/WEBUI.md` :361 变更记录行——见上注）。

### 验收对照（四笔 → 现状；读数以 §1 为准——不另测）

| 笔 | 现状 |
|---|---|
| pen1 | 批内件 13 pass / 0 fail（含「预选七条逐值」）；实拉实证 `.6` 200·10.4s·119MB |
| pen2 | 全链 `npm run prepublishOnly` 478/478 绿 · 0 红；部署 `.5`（`ed4aed38` 双推 ∥ 镜像重建 `0a91641c52be` ∥ 容器 `Up (healthy)` ∥ `healthz=200` ∥ 服上新件 `imageFromNode` ∥ `imageCustom` 命中）——待用户实走复核 |
| pen3 | 全链 478/478 绿 · 0 红 |
| pen4 | 全链 478/478 绿 · 0 红（批级读数——§1 pen4 读数行「见下」未续；列报） |

### 关键决策

- pen1：补第 7 条、既有六条零动；计数随正全域同步（沿「预选表随设计轮维护」口径——源站关停/换址频繁）。
- pen2：数据源 = 目标节点本地镜像（零新端点）；手输保底 = 零回归（读败/空表/预填不在表 ⇒ 手输照常）；选定仅回填（提交取当刻输入值）。
- pen3：待命命令恒携（沿盒镜像语义）；修因 = 最小切片建容器只传镜像 + 卷；**既有旧容器命令已定死 ⇒ 需重建**（新建的才待命）。
- pen4：说明行写全「是什么 / 填什么 / 不填会怎样」；「默认自动起名」未点不做（如用户要 ⇒ 单列提议）。
- 评审 #249 处置要点（评审表全文 = §3——父侧；本处只记处置）：🔴 契约行补 `Cmd`（`gateway/API.md` :129/:396）∥ 🟡-2 服务镜像面注（`sandbox/SANDBOX.md` :63/:559）
  ∥ 🔵-4 计数漂移六⇒七（`sandbox/SANDBOX.md` :341）∥ 🔵-5 缩进（`views-sandbox-image-sources.mjs` 头注）∥ 🟡-1 = 本段（§2 形式化——已落）。

### 上抛/余项

- ① pen2 部署后待用户实走复核（沙盒页 → 节点展开 → 创建容器 → 镜像下拉——§1 部署读数在案）。
- ② pen3 既有旧容器需重建（旧命令已定死——重建后的才待命）。
- ③ pen4「卷字段默认自动起名」未点不做——如用户要 ⇒ 单列提议。

## §3 设计评审（评审子代理）
## §4 用户批准（主 agent）

**批准（代签——用户全链自动授权：2026-10-11「发，并且其他任务也都点火，后续自动跑完」；本节点 = 轻通道轮收口链）**

依据四件：① 四笔已实施（全链 `npm run prepublishOnly` 478/478 绿 ∥ 部署 10.0.0.5 完成——批档 §1 逐笔读数在案）∥ ② 收口评审 #249（1🔴+2🟡+2🔵；changes-required）全数收正并落盘：#1 契约行补 `Cmd`（`gateway/API.md:129`——🔴，编辑收据在案）∥ #2 服务镜像面注（`sandbox/SANDBOX.md:63`）∥ #3 §2 设计形式化落盘（#250——:43-102 七块）+ §1 状态行收正 ∥ #4 计数 六⇒七（`sandbox/SANDBOX.md:341`）∥ #5 缩进收齐（`views-sandbox-image-sources.mjs:5`）；#249 未携批次档写通道 ⇒ 发现表代录于 §6（标记来路）∥ ③ 父侧逐条核验（读回 + 编辑收据）✓ ∥ ④ 令牌面 = 轻通道轮不涉设计令牌（机制按轮型区分）。

**用户实走终判（保持开口）**：pen2（建容器镜像下拉）/ pen3（新建容器待命命令）/ pen4（卷字段说明行）的界面面 = 用户实走复核对象（部署已在 `.5`）；如实走发现问题 ⇒ 开新轮（本记录冻结后不回改）。

## §5 实施记录（eng-coder）
## §6 验证与收口（父代理）

**收口（2026-10-11 · 主 agent——本段 = 验证与收口）**

**结算对象**：轻通道轮四笔（pen1 常用源预选 +1 ∥ pen2 建容器镜像下拉 ∥ pen3 建容器待命命令 ∥ pen4 卷字段说人话）——全数已实施、已核、评审已收正。

**#249 发现表代录（来路 = 父侧代录——#249 未携批次档写通道，§3 拒父侧写 ⇒ 本段承载）**：

| # | File | Severity | Issue | 处置 |
|---|------|----------|-------|------|
| 1 | `gateway/API.md:129` | 🔴 | 契约行体形缺 `Cmd`（实现 `container-routes.mjs:179` 与同源设计档恒携——笔 3 只随正设计档、漏契约行） | **Fixed**——体形补 `Cmd: ["sleep", "infinity"]` + 恒携句（变更记录 :402） |
| 2 | `sandbox/SANDBOX.md` §3 | 🟡 | 恒携命令 ⇒ 服务镜像不跑自身服务（未披露） | **Fixed**——增「服务镜像面注」（:63） |
| 3 | 批档 §1/§2 | 🟡 | §1 状态行 + §2 空模板 | **Fixed**——§2 形式化落盘（#250，:43-102）∥ §1 状态行收正 |
| 4 | `sandbox/SANDBOX.md:341` | 🔵 | 镜像源族行计数六条 vs 七条相抵 | **Fixed**——六 ⇒ 七 |
| 5 | `views-sandbox-image-sources.mjs:5` | 🔵 | 头注行首多一空格 | **Fixed**——缩进收齐 |

计数：🔴 1（已 Fixed）∥ 🟡 2（全 Fixed）∥ 🔵 2（全 Fixed）。

**核验读数**：全链 `npm run prepublishOnly` = **478/478 绿**（四笔同轮——§1 逐笔）∥ 部署 10.0.0.5 ✓（探针 + 镜像内实核在 §1）∥ doc-check = **悬空 25（基线）∥ 超宽 0**（收口前扫）。

**台账核销**：#1284（本批行）⇒ 已核销 ∥ #1294（pen2）∥ #1295（pen3）∥ #1296（pen4）⇒ 追认核销；依据 = 本段 + §1 逐笔读数。

**待办指针**：① 用户实走复核（pen2/3/4 界面面——见 §4）——如实走发现问题 ⇒ 新轮（本记录冻结不回改）；② pen 4 的「字段默认自动起名」= 未点不做（如用户要 ⇒ 单列提议）。

**状态行**：已收口 2026-10-11（记录冻结）。
