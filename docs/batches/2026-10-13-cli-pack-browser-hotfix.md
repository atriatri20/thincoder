# 2026-10-13 · cli-pack-browser-hotfix
> 六段 append-only，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 编制：主 agent · 2026-10-13 · 来源 = 用户 2026-10-13 17:32 报障（thincoder@0.12.72 装后启动即崩：ERR_MODULE_NOT_FOUND @thincoder/core/browser/clipboard.mjs）——P0 快车道；台账 #1362。
> 台账 = #1362（RELEASE · 归批）。前情 = 无（独立批）。
## §1 讨论（主 agent）
**状态行**：已收口 2026-10-13
<§1 模板占位：本批条目 / 关键判据 / 授权口径>

**轻通道轮 · CLI 发布 P0（核包 `files` 白名单缺 `browser/`——装后启动即崩）**（round 行 = 台账 #1362——「收尾链待跑」；每笔 = 披露 ∥ 变更 ∥ 实走 ∥ 冻结；§5 = 不适用——实施面 = 父侧直笔，记 §1）

## 笔 1 · 核包 `files` 白名单补 `browser/` + 号 0.10.6（P0 热修）

- **披露（笔前）**：本笔 = 轻通道（缺陷修复——实现与「发布物必须可装载」相抵；报障原话在案）｜变更 = `thincoder-core/package.json` `files` 补 `"browser/"` + 版本 `0.10.5 ⇒ 0.10.6` ∥ `thincoder-core/CHANGELOG.md` 0.10.6 段（Fixed）｜reach = 核打包面 / 发布面（三产品声明随正 `^0.10.6`——`RELEASE.md` §5.2 步骤 4）｜回滚 = revert（未发布 ⇒ 改回即退——§5.0 P5）。
- **根因（实据）**：`tools/browser.mjs:13-15` ∥ `permission.mjs:16` 引 `../browser/*`，而 `files` 白名单未列 `browser/`（该目录 2026-10-07 落地；0.10.5 = 目录出现后首个核发布 ⇒ 首装即崩；0.10.4 及以前装机不受影响）。
- **变更（实读）**：`thincoder-core/package.json`（`files` + `"browser/"`；`version` 0.10.6）∥ `thincoder-core/CHANGELOG.md`（0.10.6 段——含教训行）∥ 三产品声明（`thincoder-cli` ∥ `thincoder-vscode` ∥ `thincoder-desktop`：`^0.10.5 ⇒ ^0.10.6`）∥ `docs/RELEASE.md` 声明面三处 + 变更行。
- **实走（全绿）**：① 打包内容判据（`npm pack --dry-run --json`）= 根 `.mjs` 100/100 零缺 ∥ **`browser/` 九件在包** ∥ prompts 16 ∥ tool-docs 51；② 真包装机冒烟（`.thincoder/tmp/pack-smoke-1013`）= 复刻崩点 `import @thincoder/core/tools/browser.mjs` ⇒ **IMPORT_OK** ∥ `thincoder -v` ⇒ 0.12.72 ∥ 无 TTY 直启 ⇒ 干净走到 TTY 守卫（零模块错）；③ 发布干跑 exit 0（325 件——`prepublishOnly → npm test` 段过）。
- **冻结**：待（发布轮完成 + 收尾链 §2/§3/§4/§6 后）。

**笔 1 冻结 · 2026-10-13**：冻结条件达成（发布轮完成 + 收尾链 §2/§3/§4/§6 落——见 §6）；本档收口。

## §2 批次任务与设计（eng-designer）
**状态行**：✅ 设计完成 · 2026-10-13
<§2 模板占位：本批条目（覆盖） / 设计档落点 / 机制设计 / 受影响文件与测试覆盖 / 验收对照 / 关键决策 / 上抛项>

**设计形式化（轻通道轮收尾链第①段 · round = initial · 2026-10-13）**

**批条目（覆盖）**：台账 #1362 —— 核包 `files` 白名单缺 `browser/` 致装后启动即崩（P0 热修）。根因 ∥ 披露 ∥ 实走逐笔在 §1 笔 1。

**修复形（一句话）**：`thincoder-core/package.json` `files` 白名单补 `"browser/"`，版本 0.10.5 ⇒ 0.10.6；`thincoder-core/CHANGELOG.md` 0.10.6 段（Fixed）；三产品 `@thincoder/core` 声明收正 `^0.10.6`。

**机制单源（引用不重述）**：发布前置 ∥ 发核 ∥ 完成判定 ∥ 发布窗纪律 = `docs/RELEASE.md` §5.2（阶段 0 · 各端通用；步骤 4 = 三产品声明对齐）∥ §5.3（阶段 1 · 发核）。本批 = 该机制下的一次常规核发布，零机制新增。

**受影响文件**：`thincoder-core/package.json:3`（`version`）∥ `thincoder-core/package.json:43`（`files` + `"browser/"`）；`thincoder-core/CHANGELOG.md`（0.10.6 段）；`thincoder-cli/package.json:23` ∥ `thincoder-vscode/package.json:33` ∥ `thincoder-desktop/package.json:20`（`^0.10.6`）；`docs/RELEASE.md`（声明面三处 + 变更行）。

**验收对照（= §1 笔 1 实走读数，指针）**：① 打包内容判据（根 `.mjs` 100/100 零缺 ∥ `browser/` 九件在包 ∥ prompts 16 ∥ tool-docs 51）；② 真包装机冒烟（复刻崩点 `import` ⇒ IMPORT_OK）；③ 发布干跑 exit 0（325 件；`prepublishOnly → npm test` 段过）。逐条在 §1 笔 1「实走」行；本批零新增测试文件。

**发布完成态（§5.3 完成判定达成）**：核 0.10.6 已发且 registry 可见 ✓（`npm view @thincoder/core version` ⇒ 0.10.6）；tag `v0.10.6-core` 双推 ✓。

**关键决策**：① 轻通道走形——缺陷修复（实现与「发布物必须可装载」相抵；§1 披露在案）；② 本节薄节形——先例 = `docs/RELEASE.md` §5.2 步骤 5（一句话方案 + 指针；零新设计）。

**上抛项**：无。

**边界（不做）**：不改打包 ∥ 发布机制本身；不改浏览器工具实现面；不展开逐端发布步骤（展开 = `docs/RELEASE.md` §5 的活，重复 = 缺陷）。

## §3 设计评审（评审子代理）
## §4 用户批准（主 agent）

**用户批准 · 2026-10-13 17:37 + 17:40**（✋ 发布门——P0 修复后的全量发布授权）

- 用户 2026-10-13 17:37 原话「修复以后重新发布，三端都发。」+ 17:40「等你妈逼啊！发布啊！」= 本笔的发布授权（核 `0.10.6` + 三端 `0.12.73` / `0.10.6` / `0.10.6` 与官网一体——发布轮档 `docs/batches/2026-10-13-release-0-10-6.md` 在案）。
- 发布动作 = 用户门（`RELEASE.md` §5.0——授权 = 用户明确指令 ✓）；执行全程实跑、读数全绿（发布轮档 §6 表在案）。

## §5 实施记录（eng-coder）
## §6 验证与收口（父代理）

**收口 · 2026-10-13（主 agent）**——轻通道轮全链闭合：§2 形式化 ✓ ∥ §3 独立评审 **pass** ✓ ∥ §4 授权在案 ✓ ∥ 随轮发布完成（发布轮档 `docs/batches/2026-10-13-release-0-10-6.md` §6 在案）。

**① 评审（#64 · advisor 代码验证轮 4）**：`VERDICT: pass`——五档逐项与声明一致（`thincoder-core/package.json:43` `"browser/",` ∥ `thincoder-core/package.json:3` `"version": "0.10.6",` ∥ `thincoder-core/CHANGELOG.md:6` 0.10.6 段 ∥ CLI/VSC/桌面 `^0.10.6`）；遗留表 = 仅 1 条 🔵 Accepted（在册另轮项 `引闭包断言待另轮补，已登记`——非本笔缺口）；Unfixed / New = 0。核验说明（如实）：评审 host 引文核验块报 0/18 命中，所列均为**上下文混入的另一对象旧引**（`chat.mjs` / `run.mjs` 裸路径不可读——非本批射程）；评审对本批的实质引证与 §1 笔 1 实走读数一致（本席修复/验证期亲验）。**§3 未由评审落笔**（工具面未落档）——结论代录归本 §6。
**② 修复生效证据（随发布轮）**：核 `@thincoder/core@0.10.6` registry 可见 ✓（`npm view` ⇒ 0.10.6）∥ CLI `0.12.73` registry 可见 ✓（`npm i -g thincoder@latest` 即恢复）∥ VSC `0.10.6` 双市场已发且 Open VSX 已激活为 latest ✓ ∥ 桌面 `0.10.6` feed 已传、三件取回对盘逐字相符 ✓；commit `ea5b2cfc` + tag `v0.10.6-core` ∥ `v0.12.73` ∥ `v0.10.6` ∥ `v0.10.6-desktop` 双推 ✓。
**③ 措辞更正登记（不回改冻结档）**：发布轮档 §4/§6 及当日报账曾用「四端」= 旧措辞残留；按 `RELEASE.md` §4.3 口径注（用户 2026-10-13 裁定：三端 = CLI / VSC / 桌面；核 = 先行发布单元）应为「**核 + 三端**」——冻结档不回改、更正登记于此。
**④ 收口判定**：修复 ✓ + 全链评审 pass ✓ + 随轮发布 ✓ ⇒ **成立**；台账 #1362 随本档核销（待核销 → 已核销）。
