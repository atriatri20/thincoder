# 2026-10-15 · 发布打包面收尾车
> 六段 append-only，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 编制：主 agent · 2026-10-15 · 来源 = 清账轮 3 短单 · 车 5（发布/打包面 4 行）——用户 2026-10-15 01:19「不是说好了自动跑的吗？」全链自动授权；父侧清账轮 3（`docs/batches/2026-10-15-ledger-cleanup-3.md` §1 短单）点火。
> 台账 = #1457（core · 归批——清账轮 3 短单车 5）。前情 = docs/batches/2026-10-15-ledger-cleanup-3.md（未收口——本轮为其短单之车 5）。
## §1 讨论（主 agent）
**状态行**：已收口 2026-10-15

**来源与授权**：清账轮 3 短单（`docs/batches/2026-10-15-ledger-cleanup-3.md` §1）；用户 2026-10-15 01:19「不是说好了自动跑的吗？」= 全链自动（设计 → 评审 → 批准 → 实施）授权。

**本批条目（4 行——逐行「实现什么」；细节证据以台账行在案为准）**

| 行 | 实现什么 |
|---|---|
| #616 | B10 W5 尾腿：`check-dist.mjs` D 族断言（prompts/tool-docs 集合 + sha256——KD-B10-3 裁窄登记）+ 打包后真跑 ∥ `release-check.mjs` 发版轮真跑干查 |
| #1222 | 发布序约束入发布流程：核 `@thincoder/core`（含 `team.mjs`）须先于/同拍 CLI 发行（CLI 先发 ⇒ `team login/logout/status` 缺核档即失效） |
| #1355 | 开发批 CHANGELOG `[Unreleased]` 段随批维护口径定案（现 = 发布时父侧回填——定随批口径或明示维持发布回填） |
| #1363 | 发布预检补「打包面引用闭包」断言（pack files ⊇ 运行时 import 闭包——0.10.5 核 files 白名单缺 browser/ 漏网实证） |

**边界/禁触**：在飞批域零触；设计轮产品码零触（口径/断言设计；如涉及脚本改动 = 实施轮）。

**验收（设计轮）**：逐行出案（机制 ∥ 落点 ∥ 机检判据）+ 受影响文件全清单；机检本批域零新增红。

**父侧裁定（#51 上抛处置 · 2026-10-15 01:3x）**

- **R1 定案 = 案 B**（#1355：维持发布时回填 + 明示书面化）——据 = 三次发布实测 + 单一编辑口（职责面）；案 A（随批维护）= 过程成本未证其需。落笔 = 实施轮（`docs/RELEASE.md` §5.2 面）。
- **R2 受理并当场处置**：`thincoder-vscode/scripts/check-vsix.mjs` EXPECT `tool-docs: 51 ⇒ 52`——工程工具面 = 父侧直接执行（可 revert；读数随附）。
- **R3 ∥ R4 ∥ R5 知会受理**（R4 尾腿已闭 ✓；R5 = #1458 同族实证，已并入其证据行）。

**R2 处置读数（父侧 · `thincoder-vscode/scripts/check-vsix.mjs` · 直接执行 · 可 revert）**：修前跑 = 断言 D/tool-docs「仓内 **52** 档 · 口径 **51** ⇒ 仓内侧档数不符」；修后（`51 ⇒ 52` + 注释链续行）= 口径 **52** ✓ 不符消；**余红 = 制品陈旧**（`缺 [ssh.md]` ∥ 内容异 [subagent.md]；另 D/prompts 内容异 5 档——0.10.7 vsix 先于 10-14 提示词/ssh 落盘）——**下次 `npm run package` 重建自消**（发布时红即此闭）。

**父侧裁定（#56 评审处置 · 2026-10-15 01:4x）**：评审 = **pass**（🔴 0 ∥ 🟡 3 ∥ 🔵 5；发现表 = §3 轮次 1）——处置：**4 条受理落笔**（#2 按需残留 ∥ #3 §6.1 端数 ∥ #4 集合措辞 ∥ #5 think-off 归属——修正轮 #61 落 `docs/RELEASE.md`）∥ **4 条判非问题**（#1：#616 ∥ #1355 处置在案——§2 :41-44 逐行落点 + §1 :25 裁定（案 B，实施轮落 §5.2）+ RELEASE.md:434 已载「承批档 §2」指针；#6：规格全文在 §2 :54-61（`files[]` = `npm pack --dry-run --json` 路径集；根集比对 = 判据内）；#7：受影响表在 §2 :89（`0 ⇒ ≈170（±40）`）；#8：同类先例行在 §2 :50 + :434 指针已载——四条均因评审域 = 本档单件、记录面（批档 §2）在域外所致，如实记录）。**实施语义零变**（4 条受理全为文档面收正）。

**父侧笔（2026-10-15 02:2x）**：㈠**#69（文档面）交付受理**——`RELEASE.md` §5.2 案 B 逐字落 `:171` ∥ `PACKAGING.md` 四落点（`:76` / `:79` / `:282` / `:341` / `:404` + 变更记录 `:483`）∥ 行数回填 339 ⇒ **422**；机检 exit 0（残 `:347` = car3 域，记）。㈡**父侧直接执行（小改三处 · `RELEASE.md` · revertable）**——承 #69 上抛：`:35`（N5）断言 D 枚举 **三处 ⇒ 四处**（+「桌面 asar 解包（`check-dist` D 族）」——#616 新落面入数）；`:22`（F2）∥ `:52`（§4.2 步 1）各补「条目 = 发布轮回填——§5.2 步 2」指针（消「随批书写」读歧）。理由 = 枚举/索引面随实收正（零新语义）。㈢#69 上抛 (d) 底本 = §2:83 确认。㈣真跑腿（bash#78 `npm run package`）在跑——读数入 §5。

## §2 批次任务与设计（eng-designer）
**状态行**：设计完成（文档面落笔（实施轮 · 2026-10-15）已落 = RELEASE §5.2 案 B（`:171`）∥ PACKAGING 四点（`:76` ∥ `:79` ∥ `:282` ∥ `:341` ∥ `:404` ∥ `:483`）；行数 = 438 ∥ 483；check-dist 收正 339 ⇒ 422（承补充裁定）；机检 = exit 0（悬空 0 · 行宽 OK；行数面本档残余 = car3 域 `:347`））
<§2 模板占位：本批条目（覆盖） / 设计档落点 / 机制设计 / 受影响文件与测试覆盖 / 验收对照 / 关键决策 / 上抛项>

### 设计轮交付（eng-designer · 2026-10-15 · 授权 = §1 短单车 5 + 台账 #616 ∥ #1222 ∥ #1355 ∥ #1363）

**本批条目（覆盖）**

| 行 | 实现什么（承 §1 短单） | 设计单源（落点） | 验收对照 |
|---|---|---|---|
| #1363 | 发布预检补「打包面引用闭包」断言（核 ∥ CLI 两臂）+ registry 内容面复验式 | `docs/RELEASE.md` §5.0 P2 核行 ∥ CLI 行 ∥ P4 ④ ∥ P6（**已落**）；脚本落点 = `scripts/check-pack.mjs`（拟新增——规格 = 本 §2，实施轮落） | AC-1–AC-4 |
| #1222 | 「核先于/同拍下游」明文化（版本面 + 内容面双关）+ 内容面守卫 | `docs/RELEASE.md` §1 ∥ §5.4 ∥ P4 ④ ∥ P6（**已落**） | AC-5–AC-7 |
| #616 | `check-dist.mjs` 补 D 族（asar 内核心提示词面：`prompts` ∥ `tool-docs` 集合 + 逐档 sha256，win ∥ linux 同判） | 规格 = 本 §2 全文；落点 = `thincoder-desktop/scripts/check-dist.mjs` + `docs/desktop/design/PACKAGING.md` §2.5 ∥ §2.11.3 ∥ §3.1/§3.3 回填（**实施轮**——避与车 3 #1197 同档并发写） | AC-8–AC-10 |
| #1355 | CHANGELOG 口径二择（A 随批维护 ∥ B 维持回填 + 明示） | **待裁（R1）**——两案落笔文本备好（本 §2 末）；裁后落 `docs/RELEASE.md` | AC-11 |

**不在本批**：桌面面 5 行 = 车 3（`2026-10-15-car3-desktop.md`）· 核/CLI 16 行 = 车 2 · 文档提示词 4 行 = 车 4 · member 系在飞批（`MEMBER-AGENT.md` ∥ `CHAT.md` ∥ `API.md` ∥ `ME.md` ∥ `WEBUI.md` 冻结中）——本批零触。

**勘察证据行**：查过 = `docs/RELEASE.md`（全 430 行）∥ `docs/desktop/design/PACKAGING.md` §2.2/§2.5/§2.11.3/§3.1/§3.3/§3.4 ∥ `thincoder-desktop/scripts/check-dist.mjs`（339 行）∥ `thincoder-vscode/scripts/check-vsix.mjs`（100 行——断言 D 先例）∥ `thincoder-cli/scripts/release-check.mjs`（96 行）∥ 发布批档（`2026-10-02-desktop-release-stage2.md` ∥ 0.10.5/0.10.6/0.10.7 三段）∥ 桌面批 `2026-09-29-parity-b10-ui.md`（KD-B10-3）∥ `docs/batches/2026-10-01-desktop-packaging-release.test.mjs`（410 行——L3 合成 asar 夹具先例，现跑 21/21 绿）∥ `PROJECT-MANIFEST.json`（`index.publicRepos` 实读 = **空**）。**声明源面 = 无独立文档仓相关**（照记）。实测 = `npm pack --dry-run --json` 本地核 ∥ registry@0.10.7 两读。

**同类先例行**：先例 = `thincoder-vscode/scripts/check-vsix.mjs` 断言 D（核档 `prompts` ∥ `tool-docs` 集合 + 逐档 sha256，对仓内侧实读）；对齐 = 同断言族、同对位（档数 + 名集 + 内容哈希）；偏离 = ① 载体 = asar（读面 = 头区 JSON + 载荷段切片，非解包目录）② 台面 = win ∥ linux 两分支同判（vsix 单产物）③ 计数常量 = 本批实读（`tool-docs` 52；口径随正见 R2）。

### 机制设计（逐行）

**#1363 · 打包面引用闭包断言（新脚本 `scripts/check-pack.mjs`（拟新增）——仓根，零依赖）**

- 机制：`npm pack --dry-run --json` 取 `files[]` 路径集 P；逐档扫 pack 内脚本（`.mjs` ∥ `.cjs` ∥ `.js`）：静态 `import` / `export … from` ∥ 裸 `import "x"` ∥ 字面 `import("x")` ⇒ 相对说明符（`./` `../`）解析为包内路径，判 ∈ P；**越出包根 = 错误**；非字面动态 import = **警告行（不入闸）**；裸说明符（`node:` ∥ `@thincoder/*` ∥ 第三方）= 跳过（外来面）。另判 **根 `.mjs` 集 = 源树根集**（核面 ≠ 100/100 即红）。
- 判据（exit 0/1）：**闭包缺口 0 ∧ 越界 0**；读数行 = 包名@号 ∥ pack 件数 ∥ 扫档数 ∥ import 数 ∥ 缺口 N ∥ 告警 N ∥ 根集 N/N。
- 第二式 `--registry <号>`：本地 pack integrity 与 registry pack integrity（`dist.integrity`）**相等** ∧ 路径集相等；不等 ⇒ 红 + 逐路径差（本地独有 ∥ registry 独有）。缺省号 = 源版本。
- 接线（已落 `docs/RELEASE.md`）：§5.0 P2 核行（`node scripts/check-pack.mjs thincoder-core`）∥ P2 CLI 行（`… thincoder-cli`）∥ P4 ④（`--registry <本次号>`）∥ P6 清单一条。
- 判例锚 = 0.10.5 核包缺 `browser/`（发布批档在案——本断言族要咬的形态）；#1222 判例 = CLI `src/cli/team-command.mjs` 消费核 `team.mjs`（唯一写者）。
- 不接线 `prepublishOnly` ∥ `release-check.mjs` 内部（零改核心发布命令行为面——时点由 P6 清单承载）。

**#1222 · 「核先于/同拍」版本面 + 内容面双关（文本已落）**

- 句 = `docs/RELEASE.md` §1（双关段：下游引用核新面 ⇒ 核随含该面版本先发 ∥ 同拍发；源树内容变而未换号 ⇒ registry 滞留旧内容 ⇒ 装后缺档失效）+ §5.4 顺序守卫句（内容面守卫 = P2 核行 + P4 ④）。
- 守卫实现 = #1363 两式复用（不另造机制）；**判读窗明示**：发布窗内树冻结 ⇒ 相等为判据；窗外（在飞树）跑 `--registry` = 预期漂移读数（非判据）。
- 已实测（as-of 2026-10-15，设计窗）：本地核 pack **331 件** ∥ registry@0.10.7 **325 件** ∥ 差 **6 件**（ssh 会话 ∥ 图像自愈批的新增档——源树领先 registry，正常）；两读 integrity **不相同** ⇒ `--registry 0.10.7` = 预期红 + 差集 6 件（负例可用，AC-3）。

**#616 · `check-dist.mjs` D 族（规格全文；实施轮落）**

- 机制：复用既有 `readAsarEntry`（头区 JSON → 载荷切片）；新增「目录枚举 + 逐档比对」：asar 内 `node_modules/@thincoder/core/prompts/*.md` ∥ `tool-docs/*.md` 直下叶 ⇒ 对仓内 `thincoder-core/prompts` ∥ `tool-docs` 实读：**档数 = 口径常量（16 ∥ 52——实读 2026-10-15）∧ 档名集合相等 ∧ 逐档 sha256 相等**；`unpacked: true` 条目 ⇒ 显式判红（读面不覆盖该形态）。
- 落点 = `check-dist.mjs`：win 分支（主 asar）∥ linux 分支（linux asar）**同 helper 同判**；汇总行计数随实；**头注「D 族 = 另轮登记（KD-B10-3 裁窄）」旧句删除**（本批即该另轮）。
- 夹具族（实施轮 · 新档 `docs/batches/2026-10-15-car5-release.test.mjs`（拟新增））：沿用 `docs/batches/2026-10-01-desktop-packaging-release.test.mjs:193` `buildAsar` 合成技法（载荷相对偏移——现行约定）；D 族夹具 = 合成 asar 携仓内**真档字节**（16+52）⇒ 正常态绿；剔一档 ∥ 改一字节 ∥ 加一档 ∥ `unpacked:true` ⇒ 四负态各红。
- 真跑腿：实施轮本机 `npm run package` 一次（先例 = 0.10.6/0.10.7 均本机构建）⇒ check-dist（含 D 族）exit 0，读数入 §5。**linux 分支 = 本机（win32）不可跑** ⇒ 覆盖 = 下一 Linux 构建窗 + 代码级同 helper（如实声明）。
- release-check 真跑腿（#616 尾句）= **已闭合**：0.10.5 ∥ 0.10.6 ∥ 0.10.7 三轮 `prepublishOnly` 实跑全绿 + ⓪ 核存在性在场（引发布批档）——本批零新工，收口引证。
- `docs/desktop/design/PACKAGING.md` 落笔（实施轮）：§2.5 加 D 族行 + 注（判据 = 档数 + 名集 + sha256；对位 `check-vsix` 断言 D）∥ §2.11.3 加「D 族两平台分支同判」句 ∥ §3.1/§3.3 行数回填 ∥ 变更记录一行。

**#1355 · CHANGELOG 口径（待裁 R1——两案落笔文本备好）**

- **案 A（随批维护）**：§2 F2 行 + §5.2 步骤 1 句 + 四端 `CHANGELOG.md` 段头纪律句——「开发批随批往 `[Unreleased]` 追条目；发布 = 段头改号；收口核 `[Unreleased]` 空段例外」——成本 = 四端每批纪律 + 「未发布段恒空」态需容忍。
- **案 B（维持回填 + 明示）**：§1 或 §5 落一句「CHANGELOG 条目 = 发布轮回填（取材 = 批档 §5 提交集 + 提交标题），开发批不逐条追写」+ §5.2 步骤 1 加取材句——成本 = 发布轮材料整理；收益 = 单一编辑口（三次发布实测 = 0.10.5/0.10.6/0.10.7 均回填形，批档 §5 在案）。
- **本席倾 B**（三次实测 + 单一编辑口 + 零四端纪律开销）。裁后落笔（AC-11）。

**受影响文件（施行面 · 现行 ⇒ 预期）**

| 档 | 现行（`wc -l`） ⇒ 预期 | 轮次 ∥ 面 |
|---|---|---|
| `docs/RELEASE.md` | 430 ⇒ **435**（本设计轮已落 +5：§1 +2 ∥ P6 +1 ∥ 变更记录 +2） | 设计轮 ✅ |
| `scripts/check-pack.mjs`（拟新增） | 0 ⇒ ≈170（±40——零依赖，`node:` 系统模块 only） | 实施轮 |
| `thincoder-desktop/scripts/check-dist.mjs` | 339 ⇒ ≈410（+D 族 ≈+70：枚举 helper ∥ 两分支调用 ∥ 汇总 ∥ 头注） | 实施轮（≤500 顾问线内——无需拆分） |
| `docs/desktop/design/PACKAGING.md` | 480 ⇒ ≈486（§2.5 +2 ∥ §2.11.3 +1 ∥ §3.1/§3.3 行内改 ∥ 变更记录 +1） | 实施轮（**避车 3 同档**） |
| `docs/batches/2026-10-15-car5-release.test.mjs`（拟新增） | 0 ⇒ ≈350（±100——T1–T11） | 实施轮 |
| `thincoder-vscode/scripts/check-vsix.mjs` | 100 ⇒ 100（一行：EXPECT `tool-docs` 51 ⇒ 52） | **待裁 R2**（随批 ∥ 另立微项） |
| `docs/RELEASE.md` F2 ∥ §5.2 步骤 1（#1355 裁后） | +2~6 | **待裁 R1** |

**零触面**：产品码（`thincoder-core/**` ∥ `thincoder-cli/src/**` ∥ `thincoder-vscode/src/**` ∥ `thincoder-desktop/src/**`）∥ `thincoder-cli/scripts/release-check.mjs`（96 行——零改）∥ `prepublishOnly` ∥ `package.json` 脚本面 ∥ 三端 `CHANGELOG.md`（#1355 裁前）∥ 他车在飞域（car2 ∥ car3 ∥ car4 + member 批）。

**验收对照（逐条 · 机检化）**

| AC | 判据（可机检） | 回指 |
|---|---|---|
| AC-1 | `node scripts/check-pack.mjs thincoder-core`（仓根）⇒ exit 0 + 读数行含「闭包缺口 0」 | #1363 |
| AC-2 | `node scripts/check-pack.mjs thincoder-cli` ⇒ exit 0 + 缺口 0 | #1363 |
| AC-3 | `node scripts/check-pack.mjs thincoder-core --registry 0.10.7` ⇒ **exit 1 + 差集逐路径行**（as-of 实测 = 6 件——负例在场）；同号发布窗内实发复验 ⇒ exit 0（发布轮读数） | #1363 ∥ #1222 |
| AC-4 | `docs/RELEASE.md` §5.0 P2 核行 ∥ CLI 行 ∥ P4 ④ ∥ P6 四处命令在场（读回）；`check-pack.mjs` 零 `node_modules` 依赖（import 面 = `node:` only，实核） | #1363 |
| AC-5 | `docs/RELEASE.md` §1 双关段 ∥ §5.4 句在场（读回）——**已落** | #1222 |
| AC-6 | P2 核行（闭包）+ P4 ④（registry）两式 = 内容面守卫可执行形（命令在场 + AC-1/AC-3 实跑） | #1222 |
| AC-7 | 判读窗注在场（发布窗内为判据；窗外漂移为预期读数）——防误判红 | #1222 |
| AC-8 | D 族夹具四负态各红 + 正常态绿（T7–T11） | #616 |
| AC-9 | `check-dist` 对真 dist（实施轮 `npm run package` 一次）⇒ exit 0 + D 族读数行在场（两分支代码级同 helper） | #616 |
| AC-10 | `docs/desktop/design/PACKAGING.md` §2.5 D 族行 + 头注旧句删除（读回） | #616 |
| AC-11 | #1355 裁后按案落笔（读回） | #1355 |
| AC-12 | `node scripts/doc-check.mjs`（仓根）⇒ 本批域零新增红：悬空 6 → 6 ∥ 行宽 7 → 7 ∥ 拟新增 33 → 35（+2 = 本批标记列报）——**已实测**（2026-10-15） | 通用 |

**用例表（T1–T11 · 实施轮落 `docs/batches/2026-10-15-car5-release.test.mjs`（拟新增））**

| # | 形态 | 输入 | 预期输出 |
|---|---|---|---|
| T1 | 正常 · check-pack 核 | 真仓 `thincoder-core` | exit 0 + 缺口 0 ∥ 根集 100/100 |
| T2 | 错误 · 缺档（复刻 0.10.5 判例） | 夹具包：白名单剔目录（`a.mjs → ./lib/b.mjs`） | exit 1 + `a.mjs:N → ./lib/b.mjs ∉ pack` |
| T3 | 错误 · 越界 | 夹具包：`../` 出包根 | exit 1 + 越界行 |
| T4 | 边界 · 动态不可解 | 夹具包：`import(\`./lib/${n}.mjs\`)` | 警告行在场 + **exit 0**（不入闸） |
| T5 | 错误 · 根集不符 | 夹具包：白名单剔 `*.mjs` | exit 1 |
| T6 | 边界 · registry 差集（纯函数） | 两合成集合 | 差集逐路径列报（本地独有 ∥ registry 独有） |
| T7 | 正常 · D 族 | 合成 dist + asar（16 ∥ 52 真档字节） | exit 0 |
| T8 | 错误 · D 族缺档 | 剔一档 | exit 1 + 点名档 |
| T9 | 错误 · D 族内容异 | 改一字节 | exit 1 + differs 点名 |
| T10 | 错误 · D 族多档 | 加一档 | exit 1 + 点名 |
| T11 | 边界 · unpacked 守卫 | leaf `unpacked:true` | 显式判红（读面不覆盖） |

**边界（不做什么）**

- 不做 fs 数据面闭包（`prompts/` ∥ `tool-docs/` 运行时读——已有 D 族 ∥ P2 计数面断言；静态抽误报率高）。
- 不做依赖树 ∥ 版本面断言（声明面 = N5 在案）。
- 不接 `prepublishOnly` ∥ `release-check.mjs` 内部（零改核心发布命令行为面）。
- 不覆盖动态构造说明符 ∥ `require()`（核 = ESM；CLI `bin/` 唯一 import 面为静态）。
- 不新建 CI（机制面 = 发布窗本机命令）。
- linux 构建窗之外不宣称 linux 分支真跑覆盖。
- #1355 裁前零笔（不做「先改一版」）。

**关键决策（含被否）**

- KD-C5-1 脚本落点 = 仓根 `scripts/`（跨包复用 + 零依赖；被否：`thincoder-core/scripts/` 新目录（CLI 臂复用时须再挪）∥ 并入 `release-check.mjs`（核臂无 CLI 依赖面——臂需独立））。
- KD-C5-2 registry 判据 = **integrity 相等 + 路径集相等**（被否：仅路径集（同路径换内容漏网）∥ 全内容解包逐档（重且无增益——integrity 即全内容哈希））。
- KD-C5-3 闭包面 = 静态 + 字面动态 import（被否：全 `fs` 读面静态抽（误报 ∥ 与 D 族重叠）∥ 不做闭包（0.10.5 判例在案））。
- KD-C5-4 CLI 臂 = 同脚本一行接线（被否：不覆盖 CLI 打包面（同律面不覆盖不成立））。
- KD-C5-5 桌面 D 族 = 对位 `check-vsix` 断言 D（含 EXPECT 计数常量）（被否：只判集合不判计数（repo 侧缩水漏网——vsix 先例含计数）∥ 只判计数（同名换内容漏网））。
- KD-C5-6 #1355 倾 B（维持回填 + 明示）（案 A 文本备好——见上）。
- KD-C5-7 桌面档（`docs/desktop/design/PACKAGING.md`）改笔推迟实施轮（避与车 3 #1197 同档并发写——单作者纪律）。

**上抛项**

- **R1（待裁 · #1355）**：案 A ∥ 案 B 二择（文本见上；本席倾 B）。
- **R2（待裁 · 随批 ∥ 另立微项）**：`tool-docs/` 读数随正——① `thincoder-vscode/scripts/check-vsix.mjs` EXPECT `tool-docs: 51` ⇒ **52**（**不随正则下次 VSC 发布断言 D 必红**——ssh 批漏随正）② `docs/desktop/design/PACKAGING.md` §2.2 句内「tool-docs 52」= 旧代读数（**与现行实读同值系巧合，须按现行语义复读**——知会级）③ `docs/batches/2026-10-01-desktop-packaging-release.test.mjs` 无计数耦合（实核 21/21 绿）。建议随本批实施轮一行级随正。
- **R3（知会 · 他批面）**：W5 夹具 `docs/batches/2026-09-29-parity-b10-ui-w5-fixture.mjs` ok 态现红（旧偏移约定 + 断言族已扩）——归档件零动作；新夹具按现行约定重建（技法先例 = `2026-10-01-desktop-packaging-release.test.mjs:193`）。
- **R4（知会 · 发布面）**：`docs/batches/2026-10-13-release.md` §6③「release-check 真跑腿口径待定」——本设计给闭（三轮 `prepublishOnly` 实测 + ⓪ 在场）；台账 #616 该腿据此收。
- **R5（知会 · 他档存量）**：`node scripts/doc-check.mjs` 报告行 `docs/desktop/design/UI.md:518`（行式异常：配对失败 档 1 ∕ 数 2）——他档报告面，本批零触。

**设计轮落笔清单（D6 读回已核）**：`docs/RELEASE.md` 五处——§1 双关段（`:13-14`）∥ §5.0 P2 核行（`:99`）∥ P2 CLI 行（`:100`）∥ P4 ④（`:121`）∥ P6 一条（`:138`）∥ §5.4 句（`:211`）∥ 计数四处（`:25` ∥ `:35` ∥ `:99` ∥ `:231`）∥ 变更记录三行（`:434-435` 起）。

- **自核订正**：上条「变更记录三行」⇒ **两行**（`docs/RELEASE.md:434-435`）——本设计轮新增净 +2（计数与枚举同改正，D3）。

- **R2② 复核收正（D6 回读后同轮）**：`docs/desktop/design/PACKAGING.md:47`（§2.2 物化行）读数 = `prompts/` 16 + `tool-docs/` 52——**与现行实读一致 ⇒ 无需动作**；上条「旧代读数」措辞系**未取证推断，撤回**（该句值即现状；历次随正记录（10-05 ∥ 10-13）仅覆盖 `docs/RELEASE.md` 四处，本档该句的出处不在本轮取证面内——不行动作结论不受影响）。

- **实施轮收尾项（防标记冗余）**：`scripts/check-pack.mjs` 落地后，`docs/RELEASE.md:14` ∥ `:434` 两处「（拟新增」标记按 §4.2.9 到期条件**撤除**（否则转为「标记冗余」报告行）。

### 修正轮（评审轮 1 · 发现 #2–#5 逐号 · 2026-10-15 · eng-designer）

**来由**：评审 = pass（🔴 0 ∥ 🟡 3 ∥ 🔵 5——§3 轮次 1）；父侧裁（§1 父裁块）= **4 条受理落笔**（#2 ∥ #3 ∥ #4 ∥ #5）∥ 4 条判非问题（#1 ∥ #6 ∥ #7 ∥ #8）。本修正轮 = 按 #2–#5 落笔 `docs/RELEASE.md`（**文档面收正；实施语义零变**）。

**逐号处置**（号 → 改动 file:line）

| # | 处置 | 改动 `docs/RELEASE.md` |
|---|---|---|
| #2 | 桌面腿「按需」残留清零：`:124` ∥ `:149` ⇒ **发布轮必含**（轮内次序 = 收在 ⑤ 之后）；`:159` 挂载面消歧（原「· 按需」= 10-02「按需发布单元」期残留——`git show 78096e9b8~1:docs/RELEASE.md` 第 154 行在案） | `:124` ∥ `:149` ∥ `:159` |
| #3 | §6.1 标题端数随正文 | `:345`「对外展示两端」⇒「三端」 |
| #4 | 集合措辞统一到现行口径（三端 = CLI / VSC / 桌面；核 = 先行发布单元单列） | `:3` ∥ `:4`「四端」⇒ 核 + 三端 ∥ `:348`「两产品」⇒「三产品」（+ 桌面产物内嵌）∥ `:82` ∥ `:94` 干跑行集 = 核 ∕ CLI ∕ VSC（与 P2 表行集对齐） |
| #5 | P4 ④ 只留一条权威机检式 | `:121` think-off 读数并含于 `--registry` 判据 |

**记录面零触**：`:417` ∥ `:420` ∥ `:432`（历史「按需 / 三端干跑」记录）∥ §1 ∥ §3。**产品码 ∥ `docs/desktop/design/PACKAGING.md` ∥ 在飞批域 = 零触**；#1355 案 B 文本不随本修（实施轮落）。

**机检**（`node scripts/doc-check.mjs` · 修正前 → 修正后）：悬空 **6 → 6** ∥ 行宽 **7 → 7**（全在 member 在飞批域——`MEMBER-AGENT.md` ∥ `API.md` ∥ `CHAT.md`）∥ 拟新增 **36 → 36**（RELEASE.md 行 = `:14` ∥ `:434` 未变）——**本批域零新增红**。`docs/RELEASE.md` = 435 ⇒ 436 内容行（变更记录 +1——`:436`）。`git status`：本席写面 = `docs/RELEASE.md` + 本 §2（产品码零写；在树他批产品码改动 = member 在飞批，非本席）。

**观察（未落笔 · 知会）**：`:178`（§5.3 注）「两产品」= 2026-09-20 期措辞（桌面同持 `@thincoder/core` 依赖声明——`thincoder-desktop/package.json` 第 20 行）；该注论域 = registry 解析消费面（CLI/VSC），判非本轮缺陷、未触——如父侧判同族，另轮处置。

### 文档面落笔（实施轮 · 2026-10-15 · eng-designer）

**范围**：car5 文档面两档（授权 = §1 短单 + 父裁三则——#64 窗关后落）。`scripts/**` ∥ `check-dist.mjs` ∥ 批档 ∥ member 在飞域 = 零触；本席写面 = `docs/RELEASE.md` ∥ `docs/desktop/design/PACKAGING.md`。

**逐条落点（D6 读回已核）**

| # | 落点 | 内容 |
|---|---|---|
| ① | `docs/RELEASE.md:171`（§5.2 步 2 内 · 独立行） | #1355 案 B 明示句——逐字 = §2:83 引号句（裁 ㈢ 确认底本）；同拍 `:438` 变更记录一行 |
| ② | `docs/desktop/design/PACKAGING.md:76` ∥ `:79` | §2.5 D 族行（档数 + 名集 + 逐档 sha256；`unpacked` 守卫）+ 注（对位 `check-vsix` 断言 D） |
| ③ | `docs/desktop/design/PACKAGING.md:282` | §2.11.3「D 族两平台分支同判」句（inline——行数 +0） |
| ④ | `docs/desktop/design/PACKAGING.md:341`（§3.1 行 2）∥ `:404`（§3.4 行 4） | 行数回填（裁 ㈡ 落点）：链续读「现读 339 ⇒ ≈410」前瞻注 + 最近块注「后续改动 ⇒ 现读 339」；§3.3 行 8 零触 |
| ⑤ | `docs/desktop/design/PACKAGING.md:483` | 变更记录一行 |

**行数自报**：`docs/RELEASE.md` 436 ⇒ **438** 内容行（§5.2 +1 ∥ 变更记录 +1）；`docs/desktop/design/PACKAGING.md` 480 ⇒ **483**（§2.5 +2 ∥ §2.11.3 +0 ∥ §3.x 行内改 +0 ∥ 变更记录 +1——设计估 ≈486，实 483）。

**实施窗实况（重要）**：D 族于本席落笔窗口内**已落盘**——`thincoder-desktop/scripts/check-dist.mjs` = **422 行**（前读 339，+83；设计估 ≈410 ⇒ 实 422）。**§3.1 行 2 实值随正（339 ⇒ 422）∥ 注内「在办」字样随正 = 父侧笔**（裁 ㈠「我落 D 当日机械收正该行」——本席未代跑，勿重）。

**机检读数（`node scripts/doc-check.mjs` 仓根实跑 · 落笔后）**：**exit 0**——悬空 **0** ∥ 行宽 OK（区带豁免在效）∥ 拟新增 32 · 迁移期引文 341 · 声明源缺位 0。行数面：差异 88 条（报告态）；本批关联 2 条 = `PACKAGING.md:341`（表 339 ⇒ 实读 422——见上，随正归父侧）∥ `PACKAGING.md:347`（CHANGELOG 73 ⇒ 108——**car3 域**，本席零触）。**本批域零新增红**（闸面 = 0）。

**验收对照**：① 案 B 段落与 §2 逐字全等 ✓（引句 substring 实核）∥ ② 四条落点逐处对位 ✓（读回在案）+ 行数 483 自报 ∥ ③ 本批域零新增红 ✓（exit 0）。

**观察（未落笔 · 知会）**：① §5.2 邻句「开发批记录挂 `[Unreleased]` 段」（`docs/RELEASE.md:170`）∥ F2（`:22`）∥ §4.2 步 1（`:52`）同族三句 = 「随批书写」读取面残留——案 B 句落 `:171` 后书写者/时点已明示；三句本席零触（裁 ㈢ 零新语义）——如判须随正，另轮。② `docs/RELEASE.md` N5（`:35`）提示词面完备性枚举「三处」（核 tarball ∥ CLI 装机 ∥ vsix 解包）未含桌面 asar 面（#616 D 族新落面）——枚举齐全性他轮裁。③ §2 末无独立「案 B 逐字稿」块（裁 ㈢ 已确认底本 = §2:83）。

**补记（承父侧补充裁定 · 2026-10-15 · 值口径覆盖）**

D 族已落盘（父侧笔）：`thincoder-desktop/scripts/check-dist.mjs` **339 ⇒ 422**（+83：枚举 helper ∥ 两分支同 helper 调用 ∥ unpacked 守卫 ∥ 汇总/头注）；批内件 `docs/batches/2026-10-15-car5-release.test.mjs` 十一腿 **11/11 绿**（含 D 族四负态）。⇒ 值行改由本席就地收正（前瞻注免——「一次落对，不留二次笔」）：

- `PACKAGING.md:341`（§3.1 行 2）链续读 = **339 ⇒ 422**（car5 批 D 族）；`≈410` ∥ 「在办」字样删除。
- `PACKAGING.md:404`（§3.4 行 4）注 = **后续改动 ⇒ 现读 422**〔car5 批 D 族：339 ⇒ 422〕。
- `PACKAGING.md:483` 变更记录同拍收正（`339 ⇒ 422`；「= 父侧笔」句删）。

**订正**：上段「实值随正 = 父侧笔……本席未代跑」句被父侧补充裁定覆盖（append-only——上段原据保留）。收正后复跑 `node scripts/doc-check.mjs`（仓根）= **exit 0**；行数面 `:341` 条目清零（残余 `:347` = car3 域）。真跑腿（`npm run package` ⇒ check-dist 含 D 族 exit 0——父侧 bash#78 起跑）读数入 §5，本席未等。

## §3 设计评审（评审子代理）

### 轮次 1（评审子代理）

**评审对象**：`d:/teamcode/thincoder/docs/RELEASE.md`（全文 436 行已通读；声明四行 = #1363 引用闭包断言 ∥ #1222 发行序 ∥ #616 check-dist D 族 ∥ #1355 CHANGELOG 口径）。

| # | Category | Severity | Issue | Suggestion |
|---|---|---|---|---|
| 1 | Requirements（目标行处置） | 🟡 | 声明四行中仅 #1363 ∥ #1222 在本档有可核落点：#616 全档只以台账号出现一次——`d:/teamcode/thincoder/docs/RELEASE.md:434`「台账 #616 ∥ #1222 ∥ #1363」，而该条正文所列改动（§1 ∥ §5.0 P2 两行 ∥ P4 ④ ∥ P6 ∥ §5.4）无一与 check-dist ∥ D 族（提示词面断言）相关；#1355 全档零命中（连台账号也无）；正文 check-dist 各句均为既有句（`d:/teamcode/thincoder/docs/RELEASE.md:159` 与 `d:/teamcode/thincoder/docs/RELEASE.md:275` 两处为例），无 D 族新动线。若两条目标行的落点在别档（PACKAGING.md ∥ 批档 §2），本档亦无指针。 | 在本轮记录补两条目标行的处置坐标（落点档 ∥ 节；或显式「本档零改」句），或把变更记录头的台账列表收窄为实际落档项——避免台账号悬空。 |
| 2 | Doc consistency（口径遗留） | 🟡 | 桌面腿仍带已废「按需」限定，与本档收正后口径相抵：`d:/teamcode/thincoder/docs/RELEASE.md:124`「⑦ 阶段 3b（§5.6——桌面 · 按需）」∥ `d:/teamcode/thincoder/docs/RELEASE.md:149`「发布顺序恒等式：核 → CLI → VSC（→ 桌面——按需）」；现行口径见 `d:/teamcode/thincoder/docs/RELEASE.md:12` ∥ `d:/teamcode/thincoder/docs/RELEASE.md:262`「（发布轮含桌面——2026-10-13 用户裁定）」；被取代的旧式句见 `d:/teamcode/thincoder/docs/RELEASE.md:432`「桌面 = 按需发布单元（不随三端每轮必发）」。同族另见 `d:/teamcode/thincoder/docs/RELEASE.md:159`「官网挂载（Windows ∥ Linux · 按需）」（若此处「按需」指挂载面，需改词消歧）。 | 把 :124 ∥ :149 的桌面腿按现行口径改写为「发布轮必含」（轮内次序可用「收在 ⑤ 之后」类表述）；:159 的「按需」若指挂载面则改成「按需挂载」等无歧义写法。 |
| 3 | Doc consistency（同节矛盾） | 🟡 | §6.1 标题与本节正文端数不一致：`d:/teamcode/thincoder/docs/RELEASE.md:345`「### 6.1 版本面（对外展示两端 · 取值）」对 `d:/teamcode/thincoder/docs/RELEASE.md:347`「对外端（三）」——桌面并入对外端后标题未随动（同类「两端⇒三端」收正已有一处：`d:/teamcode/thincoder/docs/RELEASE.md:423`）。 | 标题改「三端」（或去掉端数的「对外展示端」）；本节判据面已用「三处版本面」（`d:/teamcode/thincoder/docs/RELEASE.md:380`），改后同节一致。 |
| 4 | Doc consistency（集合措辞） | 🔵 | 桌面并入与 2026-10-13 口径注（`d:/teamcode/thincoder/docs/RELEASE.md:68`「三端 = CLI / VSC / 桌面」+「核 = 先行发布单元（非端）」）之后，多处集合措辞未随动：`d:/teamcode/thincoder/docs/RELEASE.md:3`「核 / CLI / VSC / 桌面四端发布流程的统一发布计划」∥ `d:/teamcode/thincoder/docs/RELEASE.md:4`「核 / CLI / VSC / 桌面四端同在主线内」；`d:/teamcode/thincoder/docs/RELEASE.md:348`「核 = 两产品的共享依赖（CLI 经依赖解析、vsix 内嵌）」（桌面产物同属核物化内嵌——`d:/teamcode/thincoder/docs/RELEASE.md:230`「**桌面产物** = **物化（源树实拷）**」）；`d:/teamcode/thincoder/docs/RELEASE.md:82` ∥ `d:/teamcode/thincoder/docs/RELEASE.md:94`「三端干跑」而 P2 表行集为 核 ∥ 核（tarball 内容）∥ CLI ∥ VSC（无桌面行）。 | 集合词统一到现行口径（三端 = CLI ∥ VSC ∥ 桌面；核单列先行发布单元）；干跑表标注与表行集对齐。 |
| 5 | Clarity（判据叠置） | 🔵 | P4 ④ 保留旧读数且归属括注钝化：`d:/teamcode/thincoder/docs/RELEASE.md:121`「registry 侧 tarball 复验含 think-off.mjs（P2 复验形——#470 判据）」——本轮已把 P2 复验形改为 `--registry` 式（`d:/teamcode/thincoder/docs/RELEASE.md:99`「**发布后复验形 = `node scripts/check-pack.mjs thincoder-core --registry <号>`**」），后者按路径集全量比对已含 think-off.mjs 成员判定，两读并存对实施者「哪条为权威判据」不清。 | think-off.mjs 读数标为 #470 既判据 ∥ 历史读数，或并入 `--registry` 判据说明；④ 只留一条权威机检式。 |
| 6 | Clarity（工具规格留白） | 🔵 | `scripts/check-pack.mjs`（`d:/teamcode/thincoder/docs/RELEASE.md:99`「脚本 = `scripts/check-pack.mjs`（拟新增）」）的断言语义未收口：「**闭包断言** = `files[]` ⊇ 运行时 import 闭包」未定义闭包根集来源与 `files[]` 指代（package.json `files` 白名单 ∥ `npm pack` 实出清单）；「排除面 = 根非 `.mjs` 档（`CHANGELOG.md` ∥ `LICENSE` ∥ `package.json` ∥ `README.md`）」与「根 `.mjs` 集 = 源树」的比对对象关系留白。 | 补两处定义（闭包根集来源 ∥ `files[]` 指代与比对对象），使读数行可确定性机检。 |
| 7 | Size annotations | 🔵 | 本档为纯 .md（档位标注豁免）；设计引入的唯一代码件 `scripts/check-pack.mjs` 无预期规模 ∥ 拆分余量标注（评审面内无受影响文件表；批档 §2 在范围外）。 | 在受影响文件记录补新脚本的预期规模 ∥ 档位余量（对照 ≤500 建议线），或显式记「预计远低于建议线」。 |
| 8 | Closest precedent | 🔵 | 本档未见显式「最近先例」行（实现坐标 ∥ 对应设计节 ∥ 先例批）：对齐由 `d:/teamcode/thincoder/docs/RELEASE.md:434`「**零新机制**（判据 = 断言化既有读数面——台账 #1363 ∥ #1222）」+ `d:/teamcode/thincoder/docs/RELEASE.md:99`「判例 = 0.10.5 缺 `browser/`」承载，未给同类工具 ∥ 同族轮次坐标（如仓根脚本先例 `d:/teamcode/thincoder/docs/RELEASE.md:90`「`node scripts/dev-link.mjs --check`（在 `thincoder` 仓根跑）」∥ 断言脚本先例 `d:/teamcode/thincoder/docs/RELEASE.md:101`「`thincoder-vscode/scripts/check-vsix.mjs`」）。 | 补一行先例坐标（实现坐标 ∥ 设计节 ∥ 先例批）+ 对齐 ∥ 偏离理由；若该勘察在批档 §2（范围外）已成文，于本档加指针即可。 |

**计数**：🔴 0 ∥ 🟡 3 ∥ 🔵 5

**VERDICT: pass**

## §4 用户批准（主 agent）

**用户批准（主 agent 代签——全链自动授权 2026-10-15 01:19）**：评审 #56 = **pass**（🔴 0 ∥ 🟡 3 ∥ 🔵 5）；裁定 = 4 条受理（#2–#5）∥ 4 条非问题（#1 ∥ #6–#8——证据在 §1 父裁块）；**修正轮 #61 落盘并经父侧逐点实读核实**（`:3` ∥ `:4`（核 + 三端）∥ `:82` ∥ `:94`（干跑行集）∥ `:121`（think-off 并入 `--registry`）∥ `:124` ∥ `:149`（发布轮必含）∥ `:159`（挂载面消歧）∥ `:345`（三端）∥ `:348`（三产品）∥ `:436`（修正轮记录）——全部对位）。

**实施分段**：**脚本面**（工程工具面 = 父侧直接笔）——`scripts/check-pack.mjs`（新档）+ `check-dist` D 族 + 单元测试档；**文档面**（设计席笔）——`docs/RELEASE.md` §5.2（#1355 案 B 文本）∥ `docs/desktop/design/PACKAGING.md`（§2.5 D 族行 ∥ §2.11.3 ∥ §3.1/§3.3 行数回填 ∥ 变更记录——**待 #64 窗关**，先落 RELEASE.md）。

## §5 实施记录（eng-coder）
## §6 验证与收口（父代理）

**验证（父侧实读 + 实跑 · 2026-10-15 19:2x）**
- **脚本面（父侧直笔）实读 + 实跑**：① `thincoder-desktop/scripts/check-dist.mjs` D 族在盘（`EXPECT = {prompts:16, tool-docs:52}` :125-126 ∥ 档数/名集/sha256 三断言 :161-187 ∥ win ∥ linux 同 helper :260/:359 ∥ 读数行 :324/:420）；② `scripts/check-pack.mjs` 在盘（179 行）——**双包实跑**：`node scripts/check-pack.mjs thincoder-core` ⇒ **exit 0**（pack 件 331 ∥ 扫档 259 ∥ import 1111（相对 860）∥ 缺口 0 ∥ 越界 0 ∥ 告警 1（execute.mjs 非字面动态 import——不入闸）∥ 根集 100/100）∥ `… thincoder-cli` ⇒ **exit 0**（pack 件 120 ∥ 扫档 116 ∥ 缺口 0 ∥ 越界 0 ∥ 告警 0）。
- **文档面（设计席笔）**：`RELEASE.md` 案 B（`:171`「CHANGELOG 条目 = 发布轮回填……2026-10-15 定案」）在盘 ∥ 修正轮句在位（「按需」全域零余实读 ✓）∥ `PACKAGING.md` 四落点 + 变更记录（§1:33 父侧受理在案）。行数 393（清理批后值；原报 438 = 落笔时读数）。
- **真跑腿（#616 尾）＝ 阻塞**：`npm run package` ⇒ **EBUSY ×2**（`dist\win-unpacked\resources\app.asar` 被在跑的桌面 dev 实例锁——`npx electron .` 进程族实读在案）⇒ check-dist D 族对真 dist 的 exit 0 读数待**桌面实例关闭窗口**重跑；命令在册（`npm run package` → `node scripts/check-dist.mjs`）。工作单 = **#1486**。
- 集成面：不适用（工程工具面）；单元档 = 无新档（check-pack 本体即真实断言面——双包实跑读数如上）。

**收口结算（父侧）**
- 台账：四行（#616 ∥ #1222 ∥ #1355 ∥ #1363）= 已核销在案；真跑腿窗口 → **#1486**（条件）。
- 暂缓批复核：本批零「暂缓」标记。
- 记录冻结：§1 ⇒「已收口 2026-10-15」。

（注：§5 = 空——实施面 = 脚本面父侧直笔 + 文档面设计席笔，证据在 §1:29/:33 与本 §6；无 eng-coder 段。）
