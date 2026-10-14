# 2026-10-13 · projects-act-fix
> 六段 append-only，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 编制：主 agent · 2026-10-13 · 来源 = 用户 2026-10-13 22:59 报障（原话：「git项目更换负责人时点击保存不会切换回只读状态，关闭项目弹窗后，列表没有刷新，新的负责人不会出现在列表上。」）——父侧诊断根因 = `views-projects.mjs` act 调用约定缺陷（thunk/Promise 走样——五径：改名/改地址 ∥ 更换负责人 ∥ 改档 ∥ 移除 ∥ 加成员）；轻通道轮（defect fix）。
> 台账 = #1378（server · 归批）。前情 = 无（独立批）。
## §1 讨论（主 agent）
**状态行**：已收口 2026-10-14
<§1 模板占位：本批条目 / 关键判据 / 授权口径>

**笔 · projects-act-fix（2026-10-13 23:0x——轻通道 · defect fix）**

- **披露**：This pen = light channel（defect fix——命中②：实现与既有源相抵〔house 约定 = `modal.mjs` submitThen 的 thunk 形〕）| change = `views-projects.mjs` 五调用点 thunk 化 + act 注释收正 | reach = 1 档（`thincoder-server/public/views-projects.mjs`——6 行级）| rollback = revertable。
- **源**：用户 2026-10-13 22:59 报障（原话：「git项目更换负责人时点击保存不会切换回只读状态，关闭项目弹窗后，列表没有刷新，新的负责人不会出现在列表上。」）；根因（父侧实读坐实）= `act` 以 `await call()` 调 thunk，而五调用点传「已启动 Promise」⇒ `promise()` TypeError 被 catch 吞 ⇒ flash ∥ 弹窗重渲 ∥ `onChanged`（列表刷新）全不执行；请求因实参求值已先行发出 ⇒ **服务端改动成功、界面无收口**。
- **改动**：`views-projects.mjs:146`（act 注释——thunk 约定明写）∥ `:164`（editInPlace——改名/改地址径）∥ `:193`（更换负责人径）∥ `:242`（改档径）∥ `:246`（移除成员径）∥ `:261`（加成员径）。
- **红-绿对**（批内件 `docs/batches/2026-10-13-projects-act-fix.test.mjs`）：**红** = 修前跑——失败于「flash「负责人已更新」在册」∥「改名 flash 在册」（载荷已出网——症状与根因签字）；**绿** = 修后跑 **2/2 pass**（两测例全项：载荷逐值 ∥ flash 达 ∥ 弹窗收起回只读 ∥ onChanged 达）。
- **同族回归**：`2026-10-12-team-projects-permissions-ui.test.mjs` 本笔复跑——读数见 §6。
- **walkthrough**：待部署后于用户实例实走（改负责人 ⇒ 收起 + 列表刷新）；**冻结**：树内未提交——收尾链随轮（§2 设计形式化 ∥ §3 独立评审 ∥ §4 批准 ∥ §6 收口核销）。

**同族回归补记（2026-10-13 23:1x）**：`2026-10-12-team-projects-permissions-ui.test.mjs` 本笔复跑 = **5/7**——两红（`:root` 76≠58 ∥ zh system 键 187≠185）**归因 = #1374（终端批）在途落地**：实读 `--term-*` **18** 变量（58+18=76 ✓）∥ `audit.sandboxKind.terminal_open/terminal_close` **2** 键（185+2=187 ✓）——与本笔（`views-projects.mjs` 六行 thunk 化）零关，属该批收口轮父侧随正件（在册）。本笔面 = 无回归。

## §2 批次任务与设计（eng-designer）
**状态行**：（eng-designer 写入时更新）
<§2 模板占位：本批条目（覆盖） / 设计档落点 / 机制设计 / 受影响文件与测试覆盖 / 验收对照 / 关键决策 / 上抛项>
## §3 设计评审（评审子代理）
## §4 用户批准（主 agent）

**批准（用户 · 2026-10-14 01:36「全收口」+ 01:39「能点火的都点火自动跑吧」）**

- 评审 #133 = **pass**（0🔴）；裁定三条已落（Fixed 2 ∥ Deferred 1〔#1402 在册〕）。
- 读数：批内件 **2/2** ∥ 兄弟件 **7/7** ∥ .5 在箱（`6315cbdbe8c9`——thunk 与评审收正双 true）。
- **本档随本段冻结**（已收口）。

## §5 实施记录（eng-coder）
## §6 验证与收口（父代理）

**收口（父侧 · 2026-10-14 01:5x）**

## 一、独立评审（收尾链 · 评审子代理 #133——重发实例）

- **VERDICT：pass**（0🔴 ∥ 1🟡 可选 ∥ 2🔵 可选）；首轮实例未结算（stale）——其输出的对象外项列而不判（状态未迁移）。
- **逐条裁定**：
  - 🟡1（`views-projects.mjs:146` 注面「钮复位可重试」与本档 `act` 实现不逐拍——house 原件 `modal.mjs:95/:98/:105` 有 disable/复位两拍，本档无）⇒ **Fixed**：注面收正（`:146`——「编辑器保持——可重试；本档 `act` 无 submitThen 的钮 disable/复位两拍」）；另选「补两拍防连点」未采（如需另立）。
  - 🔵2（批内件无败径负腿——`act` catch 支无覆盖）⇒ **Deferred**（挂 **#1402**——归批）。
  - 🔵3（本档段面未收口）⇒ **Fixed**（本 §6 + §4 + 冻结随落）。
- **对象外随正一件**：`docs/batches/2026-10-12-team-projects-permissions-ui.test.mjs:9` 头行 `:root` 58 ⇒ **76** 收正（评审对象外备注——同族随正链，就地落）。

## 二、落件与实跑

- 修复 = `views-projects.mjs` 五调用点 thunk 化（`:164`/`:193`/`:242`/`:246`/`:261` + `:146` 注）；评审收正 = 注面 1 行。
- **批内件 2/2 绿**（① 更换负责人：载荷 ∥ flash ∥ 弹窗收起回只读 ∥ onChanged——用户报障径全链；② 同族四径：改名 ∥ 改档 ∥ 移除 ∥ 加成员）∥ **兄弟件 7/7 绿**（三陈锚随正后）。
- **红/绿对**：红 = 修前跑（promise() TypeError ⇒ flash∥收起∥onChanged 三缺——构造可推，本轮未实跑修前态）；绿 = 2/2（实跑）。
- **提交**：`c8f72e5b`（四档：`views-projects.mjs` 修复与注面收正 ∥ `2026-10-13-projects-act-fix.{md,test.mjs}` ∥ `2026-10-12-team-projects-permissions-ui.test.mjs` 头行随正）——gitee + github 双推 ✓。
- **部署**：.5 重建（像 `6315cbdbe8c9`）⇒ `healthz:200` ∥ 容器内实读 `projects-act thunk in box: true` ∥ `review-133 comment: true`。
- **用户面**：管理面「项目」弹窗五径复走 = 可在 .5 确认（更换负责人保存 ⇒ 弹窗回只读 + 列表刷新）。

## 三、段面（轻通道轮契约）

- **§2 / §5 = 不适用**（轻通道轮——设计与实施均 §1 直笔）。
- **§4 用户批准** = 「全收口 + 点火自动跑」令下随落；§1 状态行随整档 close 翻「已收口」。
