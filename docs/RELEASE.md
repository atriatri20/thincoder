# 发布流程（RELEASE）· 统一发布计划

> 本档是核、CLI、VSC、Desktop 的统一发布计划；发布只走 §5 主线，不另立平行发布链。
> 本档覆盖端到端发布流程（§5）、版本号规则（§4）和官网更新方案（§6）。
> 核包加载与发布契约 = `docs/core/design/CORE-UNIFICATION.md`「包与加载契约」∥「发布与版本」；版本一致性决策 = 同档 D-C11。

## 1. 总体需求

发布动作必须是**唯一门禁**：一次触发即执行完整校验链，不过即中止。
对外版本号规则 = **CalVer**（§4——各单元同制）。
**发布顺序恒为：核 → CLI → VSC → 桌面**。产品发布以核已发布为前提；桌面是发布轮必含端，其核内嵌源自源树，发布窗按 §5.6 执行。

**顺序同时约束版本面与内容面**：下游引用核的新面时，核须随含该面的版本先发或在同一发布轮先发。核源树内容变而未换号会使 registry 滞留旧内容。机检 = §5.0 P2 核行闭包断言 + §5.0 P4 ④ registry 复验，工具 = `scripts/check-pack.mjs`。

**发布序硬门（核内容变更 ⇒ 依赖面同批抬版）**：核内算式或机制变更 ⇒ 核先发；下游（服务端 ∥ 三端）对核依赖写 **caret 形**（`^<本次核发行版>`，与 §4.3 同口径），并在同一发布轮抬到本次核发行版。发前人工校一次核 tag 内算式常量与源树一致。

**文案键新增的发布归属**：判据 = 该键是否落核字典（`thincoder-core/i18n.mjs` 的键族边界）；落核字典 ⇒ 按发布序走，否则端侧字典随端发布。键族边界与端侧载体见 `docs/core/design/I18N.md`「核容器」∥「宿主投影」。

**发布 = 按 §5 一条主线走**，从上到下执行即可。

## 2. 功能性需求（统一）

| # | 需求 | 说明 |
|---|---|---|
| **F1** | 发布 = 唯一门禁 | 门禁由发布命令自动执行（各端接线见 §5 对应阶段）；无独立「发布前再跑一次检查」步 |
| **F2** | 号在发布时定 | 开发批变更记录挂 `[Unreleased]` 段（**不编号**）；发布 = 唯一定号动作（bump → Unreleased 段头改新号；条目 = 发布轮回填——§5.2 步 2） |
| **F3** | 待发号推导 | 待发号推导规则 = §4.2（当月最高 + 1 / 月切换 = `0.<当月>.1`） |
| **F4** | 发布完成判定 | 发布命令正确返回（exit 0）= 完成——不轮询、不检查上线版本（npm publish 即见 / vsce 审核队列 = 平台侧事务）；**发布轮**收口 = 三端 ∧ 官网同步（§5.8） |
| **F5** | 核 = 独立可发布单元 | `@thincoder/core` 非 private、独立版本；核先发，产品后发。`files` 白名单含完整 `prompts/` ∥ `tool-docs/`，文件集合以仓内实读为准，不写固定档数 |

## 3. 非功能性需求（统一）

| # | 维度 | 标准 |
|---|---|---|
| **N1** | **对外编号连续不跳空** | npm / marketplace 号不得跳号 |
| **N2** | **禁止一次跳多号** | 发布前核对当月最高号（§4.2） |
| **N3** | 门禁不可绕过 | 门禁不过 = 发布中止（**有意设计**） |
| **N4** | 缺口不补 | registry 已形成的缺口不回补、不重写；越月预占号作废；后续发布不得制造新缺口 |
| **N5** | **版本一致性断言 + 提示词面完备性**（D-C11） | **断言 A（仓内）** 产品声明范围与核版本相容（caret 语义）；**断言 B（VSC 产物）** vsix 内核 `version` 逐字等于仓内核版本；**断言 C（CLI 发布预检）** 装入版本逐字等于仓内核版本 ∧ registry 上该版本存在；**断言 D（提示词面完备性）** 核包 tarball / CLI 装机目录 / vsix 解包 / **桌面 asar 解包**（`check-dist` D 族）**四处** `prompts/` ∥ `tool-docs/` 档名集合逐字相等、且等于仓内核目录的实读集合（档数取实读、不作字面），同档 sha256 等于仓内核档。**发版同步**：三产品（CLI ∕ VSC ∕ 桌面）`dependencies` 核声明写 caret 形（`^<核当前版本>`），随核发布同步收正（声明面与实发对齐——与在盘同形） |
| **N6** | **凭据不入库** | PAT 只走环境变量 / 显式传参；仓库内零凭据（源码与发布产物同查） |

## 4. 版本号规则（CalVer · 各端同制）

### 4.1 格式：`年份段.月份段.月内计数段`

| 段 | 含义 | 规则 |
|---|---|---|
| 第一段 | **年份** | 2026 = 0，2027 = 1，每年 +1 |
| 第二段 | **月份** | 1 = 1 月 … 12 = 12 月 |
| 第三段 | **月内发布计数** | **每月从 1 重置**，月内逐次 +1 |

> **号反映发布时间，不反映语义**，不按 patch/minor/major 的功能语义跳段。
>
> **CLI 例外**：CLI 的第二段是年度号，不按月变化，也不随第一段的年份递增；第三段在 2026 年内连续递增，2027-01-01 起切 `1.1.0`。换月不改 CLI 的号，§4.2 步骤 2 ∥ 3 的「当月」口径对 CLI 不适用。

### 4.2 定号纪律

1. **号在发布时定，开发期不预占**：开发批 CHANGELOG 记录挂 `[Unreleased]` 段（不编号）；发布 = 唯一定号动作（bump → Unreleased 段头改新号；条目 = 发布轮回填——§5.2 步 2）。
2. **待发号 = 当月已发最高号 + 1**；发布前查当月双源最高 + 当前月（期望号 = `0.<当月>.<月内序号>`；各端包清单的版本号 ≠ 期望号 → 先纠正）。
3. **月切换硬规则**：新月份第一次发布 = `0.<当月>.1`（月内计数每月重置，CalVer 语义）。
4. **缺口 / 越月号不补**：已发缺口不补发；越月预占号作废，其内容归入实际发布月；后续发布不得制造新缺口。
5. **各端独立号段**：核（`@thincoder/core`）· CLI（`thincoder`）· VSC（`thincoder-vscode`）· 桌面（`thincoder-desktop`）各自独立计数，互不挤占。
6. **号是否被占用，查发版目的地，不查 git**：判据 = npm registry 的版本表（`npm view <包名> versions --json`）与插件市场的版本表（`npx @vscode/vsce show <扩展> --json`）——版本表里没有该号 ⇒ 可发。**git tag 不作判据**：tag 是发版点标记，与「这个号能不能发」无关；仓里某个历史 `v0.11.1` 存在，不表示 11 月不能发 `0.11.1`。

> **tag 重名 ≠ 号被占用**：git ref 必须唯一，同号只由首发单元使用裸 tag，其他单元不另打同号 tag；规则见 §5.5，版本号本身不受影响。

> **CLI 例外**（同 §4.1）：步骤 2 ∥ 3 是「当月」口径，对 CLI 不适用——CLI 定号 = 上一号 + 1（§4.1 年内连续递增），换月不重置。

### 4.3 版本一致性断言（发版同步面）

三产品（CLI ∕ VSC ∕ 桌面）`dependencies` 对核声明写 caret 形（`"@thincoder/core": "^<核当前版本>"`；caret 兼容，声明面与实发对齐——核发新号后同步收正）；断言 A/B/C/D 全文 = `docs/core/design/CORE-UNIFICATION.md` D-C11（此处不重述）。

## 5. 发布流程（**唯一主线** · 一步步走）

### 5.0 发布预备（阶段 0 之前 · 就位干跑 ∕ 防破 guard ∕ 检查清单 ∕ 一键序列）

> 本段是阶段 0 之前的前置面：发布窗里可先行的工作先做净，使「定号 → bump → publish」在用户拍板后成为一键动作。
> **发布动作 = 用户门**：本段全部命令零发布副作用；真实 publish 由用户执行或经其明确授权。
> 本段规定前置盘点、干跑、防破检查点和就位序列；先发核再物化及恢复收敛序由 §5.3 统一规定。

**P1 · 状态盘点（就位基线——只读，可随时复跑；物化窗内 P1-2 预期非 0——见 P3）**

| # | 项 | 命令 | 通过判据 |
|---|---|---|---|
| 1 | 工作树态 | `git status --porcelain` | 空（发布窗开启前置——发版 commit + tag 依赖；在途批先收口） |
| 2 | 五链规范形 | `node scripts/dev-link.mjs --check`（在 `thincoder` 仓根跑） | exit 0（`共 5 链：5 规范 ∕ 0 漂移`） |
| 3 | registry 现状 | `npm view @thincoder/core version` · `npm view thincoder version` | 读数 = 窗口定号（§4.2）备料；只读，不改号 |
| 4 | 依赖声明核对 | 三产品（CLI ∕ VSC ∕ 桌面）`dependencies` 的 `@thincoder/core` 实读 × `thincoder-core/package.json` 版本 | 对齐（§5.2 步骤 4 口径） |

**P2 · 干跑（核 ∕ CLI ∕ VSC——零发布副作用；时点 = 窗口前）**

| 端 | 干跑命令 | 通过判据（读数形） |
|---|---|---|
| 核 | `cd thincoder-core && npm publish --access public --dry-run` | 窗口内（bump 后）exit 0——输出含 `prepublishOnly → check-syntax`（语法门）段 + `Tarball Details`（`total files` ∕ `package size`）。bump 前 ⇒ 止于 `You cannot publish over the previously published versions: <现号>` exit 1 = **版本占用守卫在位**（非缺陷） |
| 核（tarball 内容） | `node scripts/check-pack.mjs thincoder-core`（在仓根跑）∥ `cd thincoder-core && npm pack --dry-run --json` | exit 0，根 `.mjs` 集等于源树且闭包缺口为 0。**闭包断言** = `files[]` 覆盖运行时 import 闭包；`prompts/` 与 `tool-docs/` 的文件集合及内容须与源树一致。排除面 = 根非 `.mjs` 档（`CHANGELOG.md` ∥ `LICENSE` ∥ `package.json` ∥ `README.md`）。**发布后复验 = `node scripts/check-pack.mjs thincoder-core --registry <号>`**，registry 面与源树的路径集和 integrity 相等 |
| CLI | `node scripts/check-pack.mjs thincoder-cli`（在仓根跑，检查 CLI 打包面闭包）∥ `cd thincoder-cli && node scripts/release-check.mjs` | 前者 = exit 0 + 闭包缺口 0；后者 = exit 0 + 尾行 `✅ release-check 全绿——可发版`；读面 = `⓪ ✔ registry 上存在 @thincoder/core@<号>` + `✔ lint OK` + test 摘要行。⓪ 不过 = 核先发守卫（设计如此） |
| VSC | `cd thincoder-vscode && node scripts/publish-all.mjs --dry-run` | 段 0（核版本预检）+ 段 1 `vsce package`（`vscode:prepublish` = lint + test）+ 段 1.5 vsix 含核断言（B ∕ D ∕ E ∕ F 全过——E = 撞帽检查点接线 ∥ F = 渲染核版本逐字；定义 = `thincoder-vscode/scripts/check-vsix.mjs` 断言 E ∕ F 段）+ 段 2 🧪 跳过；exit 0 |

> **干跑注（时点与预期红）**：① CLI 干跑全绿时点 = 核已发布后（或 bump 前的现行号面）；bump 后—核发布前区间 ⓪ 必红（守卫，非缺陷）。
> ② VSC 段 1.5 全过 = 物化后（未物化 ⇒ 断言 B red——fail-closed，预期）；物化时点 = 核已发布后（§5.3 先发核再物化）。
> ③ 现行守卫 = fail-closed：空集为红，集成集住仓根 `test/integration/`，入口为仓根 `test/run.mjs`。
> ④ 核干跑在版本未 bump 时被版本占用守卫拒绝；bump 后须 exit 0。

**P3 · 物化防破 guard（junction 覆盖的检查点 ∕ 恢复 ∕ 终态判据）**

- **检查点**：物化前 `dev-link --check` ⇒ 0（基线）→ 物化后 vsc:core 预期变 `materialized`（真目录——窗口内预期态，允许非 0）→ 收窗恢复 dev 链后复判 ⇒ **0（终态判据：五链全规范、零 `materialized` 残留）**。
- **恢复** = §5.3 恢复收敛序，三步次序不得颠倒；`materialized` 类不归 `dev-link` 缺省替换面。
- **面覆盖** = 五链（cli→core ∕ vsc→core ∕ vsc→render-core ∕ desktop→core ∕ desktop→render-core；cli→render-core 不在面——cli 依赖声明无 render-core）；命中 `missing ∕ case-variant ∕ wrong-target` ⇒ 先 `node scripts/dev-link.mjs`（apply）修复再继续。
- **锁面**：物化或 `npm install` 引起的 lock 变更按 §5.3 的恢复收敛序处理。

**P4 · 一键序列（就位——按序执行；✋ = 用户门）**

```
① 盘点 + 干跑（P1 + P2——零副作用，可重跑）
② ✋ 定号（§4.2）→ CHANGELOG ∕ bump ∕ 依赖核对（§5.2 步骤 1–4）
③ ✋ 发核（§5.3——npm publish；先发核再物化）

④ 核可见性复核（性质 = 下游发布前置守卫——⑤ 发 CLI ∕ VSC 前核须 registry 可见；非核发布完成判定，完成判定 = F4）：npm view @thincoder/core version = 本次号；node scripts/check-pack.mjs thincoder-core --registry <本次号> exit 0（registry 面与源树的路径集及 integrity 相等）

⑤ ✋ 发 CLI（§5.4）· ✋ 发 VSC（§5.5——物化 → publish:all）
⑥ 收窗：P3 guard 恢复 dev 链 → dev-link --check = 0
⑦ 阶段 3b（§5.6——桌面 · 发布轮必含；轮内次序 = 收在 ⑤ 之后）→ 阶段 4 ∕ 5（§5.7 ∕ §5.8）照旧
```

**P5 · 回退**

- 干跑面：零副作用——无回退对象；复跑幂等。
- bump 未发布 ⇒ 改回包清单版本即退（未占号）；已发布 ⇒ §5.7 失败总原则（从失败端重跑；已发端不重发——不另立）。
- dev 链破（物化后未恢复）⇒ P3 恢复 + 复判 = 0；`--force` 只在流程明确列出时使用，不作默认恢复手段。

**P6 · 检查清单（就位轮逐项打勾——逐条时点见括注）**

- [ ] 在途批收口、工作树干净（P1-1；时点 = 窗口开启前）
- [ ] 五链规范（P1-2；时点 = 基线——物化前；收窗复判见 P3 终态判据）
- [ ] 核干跑 + tarball 内容（P2 前两行；时点 = bump 后窗口内）
- [ ] 核闭包 + registry 复验（P2 核行 ∥ P4 ④——`check-pack` 两式；时点 = bump 后窗口内 ∥ 核发布后）
- [ ] CLI 干跑（P2——时点见干跑注①）
- [ ] VSC 干跑（P2——物化后，时点见干跑注②）
- [ ] registry ∕ 市场现状已读（P1-3；时点 = 定号前——§4.2 备料；市场面 = `npx @vscode/vsce show xinbo-tech.thincoder-vscode --json`）
- [ ] **发布凭证已在环境变量**（`ALIYUN_KEY` ∥ `ALIYUN_SECRET`；时点 = 桌面上传前。先查，不问用户要；值不写进命令行）
- [ ] 各端 CHANGELOG `[Unreleased]` 段就绪（§5.2 步骤 2；时点 = bump 前）
- [ ] 三产品（CLI ∕ VSC ∕ 桌面）依赖声明与本次核号对齐（P1-4；时点 = 定号后——§5.2 步骤 4）
- [ ] ✋ 用户：定号 + 发布授权（发布动作 = 用户门）

### 5.1 总览

```
发布顺序恒等式：核 → CLI → VSC → 桌面（桌面 = 发布轮必含；任一端失败即停；修复后从失败端重跑——已发端不重发，号已占）

[阶段 0 · 发布前置]  定号 → CHANGELOG → bump → 依赖核对（各端通用）
      ↓
[阶段 1 · 发核  ]  npm publish --access public（核 @thincoder/core）
      ↓
[阶段 2 · 发 CLI]  smoke（人工·花真钱）→ npm publish（CLI thincoder）
      ↓
[阶段 3 · 发 VSC]  verify-pat → npm run publish:all（VSC thincoder-vscode · 双市场）

      ↓
[阶段 3b · 发桌面]  物化 → package（check-dist 闸）→ 签名（hook）→ 上传（Windows 三件：exe ∥ blockmap ∥ latest.yml）→ 官网挂载（Windows）——Linux 面暂缓
      ↓
[阶段 4 · 收尾  ]  验证 → 失败处置原则
      ↓
[阶段 5 · 官网同步] 提取 → 站点更新（changelog + 版本面）→ 部署 → 判据
```

### 5.2 阶段 0 · 发布前置（各端通用）

1. **定号**（§4.2）：查当月最高已发号 + 当前月 → 期望号；各端包清单的版本号 ≠ 期望号 → 先纠正再走流程。
2. **CHANGELOG**：各端各自维护核 `thincoder-core/CHANGELOG.md`、CLI、VSC 和桌面 `thincoder-desktop/CHANGELOG.md`，核不豁免。
   开发批记录挂 `[Unreleased]` 段，发布时段头改新号；使用 Keep a Changelog 格式，中文，Added / Changed / Fixed / Removed 分节。VSC 侧是市场页 Changelog 标签的内容来源；无档先建。
   **CHANGELOG 条目在发布轮回填**，取材于批档 §5 提交集与提交标题，开发批不逐条追写。

   **附带**：CLI README 的 Changelog 摘要节同步补新版本段；它是面向 npm 用户的英文精要，不是 CHANGELOG 全量镜像。
3. **version bump**：各端包清单的版本改到期望号（**JSON.parse → 改字段 → JSON.stringify**——禁 PowerShell `Set-Content -Encoding UTF8`：会写 BOM `EF BB BF`，JSON 解析失败、发布门崩）。
4. **依赖核对**：三产品（CLI ∕ VSC ∕ 桌面）`@thincoder/core` 声明与本次核版本对齐（§4.3——形 = caret，值 = 本次核发行版；核发新号后同步收正）。
5. **发布轮批档**（`docs/batches/<日期>-release.md`，每轮发布建一档）：**§2 = 薄节**，只写一句话方案与可选的就位实读小表。方案单源 = 本档 §5；候选号、逐端条目集、命令、判据和回退均引用主线，不做逐端方案展开。

### 5.3 阶段 1 · 发核（`@thincoder/core`）

> **为什么先发核**：产品的 `dependencies` 依赖 `@thincoder/core`，生产装机按 registry 解析；核版本未上 registry 时，依赖它的产品无法安装。VSC vsix 直接内嵌核，因为 marketplace 不做依赖解析。开发期产品通过本地链接使用本仓核，契约见 `docs/core/design/CORE-UNIFICATION.md`「包与加载契约」。

**首发一次性前置**：`npm whoami` + `@thincoder` scope 归属确认；核包 `prepublishOnly` 门禁**已在位**（语法门 `check-syntax`——`npm publish` 自动先跑；核仓无集成测试集，测试职责在前端包）。

```bash
cd thincoder-core
npm publish --access public    # scoped 包默认 private——首发必须显式 public
```

**完成判定**：exit 0；复核 `npm view @thincoder/core version` = 本次号。发版 commit + tag（`v` + 本次号）**推双远端**（`origin` + `github`；github 固定走 proxy）。

**发布窗两条纪律**：

- **先 bump + publish 核、再做物化 ∕ 打包**：核版本未上 registry 时先物化，会把 registry 旧快照烙进产物；**打包物化一律源自源树**。
- **`npm install` 覆盖 junction 后的恢复收敛序**：先 `npm install` 使 lock 回到 link 形，再 `npm link @thincoder/core`，最后在 `thincoder` 仓根跑 `node scripts/dev-link.mjs` 重建规范形链；`--check` 复判须为 0。次序颠倒会把 lock 写成 packed 形。`file:` 目录依赖在 `--install-links` 态的 `npm ls` 可报 `ELSPROBLEMS/invalid`，不得据此跳过恢复复判。

### 5.4 阶段 2 · 发 CLI（`thincoder`）

**第 1 步 · smoke**（人工 · **花真钱** · 在自动门禁之外）：仍须以真实端点和显式 `<provider>:<model>` 完成人工 smoke，不得省略。

**当前阻断**：原命令所写的 `smoke-qwen-thinking.mjs` 脚本当前不在盘，该自动化命令不可执行；本档不猜替代入口。脚本入口恢复前，CLI 发布验证缺口未闭合，不得写成 smoke 已通过。

**第 2 步 · 发布**：

```bash
npm publish                    # prepublishOnly 自动跑 release:check（lint → 测试 → 集成测试集）
```

**门禁链细节**（`scripts/release-check.mjs`）：两步 = lint（`thincoder-cli/scripts/check-syntax.mjs`）→ 集成测试（仓根 `test/run.mjs`——仓内一处收集；单元测试档不进任何门）；输出只打摘要行，失败时自动提取失败详情（每块 ≤24 行、最多 12 块；无汇总段回退输出尾 40 行）。

**顺序守卫**：release-check 首查核版本存在性（registry 查无 = 中止——防止发出发坏包）；核**内容**面守卫 = §5.0 P2 核行闭包断言 + §5.0 P4 ④ registry 复验。

**失败处置**：修复 → **局部重跑**（`node --test --test-name-pattern "<失败名>" <失败文件>`——秒级）确认 → **再 `npm publish` 终跑一次**收口（禁每次失败全链重跑）。

**完成判定**：exit 0 = 发布完成（npm 无审核队列）。发版 commit + tag（`v` + 本次号）**推双远端**（`origin` + `github`；github 固定走 proxy）。

### 5.5 阶段 3 · 发 VSC（`thincoder-vscode`）

**第 1 步 · 物化核依赖（link → 真实安装态）**：开发机 `node_modules/@thincoder/core` 是 `npm link` 符号链接，vsce 不打包 symlink，因此发布前必须先物化。完成后按 §5.3 的恢复收敛序回到开发链接态。

```bash
cd thincoder-vscode
npm install --install-links             # link → registry 真实拷贝
```

发完按 §5.3 恢复开发链接。

**render-core（`@thincoder/render-core`）不入发布序列**：永不发布（`private: true`）；**两打包窗内嵌形随打包器**：
- **VSC vsix** = **link 形 + `--follow-symlinks`**。`npm install --install-links` 物化对 render-core 不可执行，vsce 依赖检测失败会使打包硬失败；`publish-all.mjs` 段 0.5 在打包前自动把物化态拉回 link 形。
- **桌面产物** = **物化（源树实拷）**。electron-builder 无 follow 面，junction 入 asar 仅为 link 节点；物化由打包窗脚本执行且一律源自源树，见 `docs/desktop/design/PACKAGING.md`「构建」。

内嵌面只含运行必需的 `.mjs` 与包清单；core 另携完整 `prompts/` ∥ `tool-docs/`。`@thincoder/core` 的物化纪律不变，共享渲染核边界见 `docs/render-core/design/RENDER-CORE.md`「边界」∥「发行与验证」。

**第 2 步 · 凭据预验**（防无 TTY 静默假成功——npm 的 exit-0 判定**不可**推广到 vsce/ovsx）：

```bash
npx @vscode/vsce ls-publishers         # marketplace 凭据
npx ovsx verify-pat xinbo-tech         # open-vsx 凭据
```

PAT 走 `VSCE_PAT` / `OVSX_PAT` 环境变量或显式传参，**零入库**（N6）。

**第 3 步 · 发布**：

```bash
cd thincoder-vscode
npm run publish:all
```

**门禁与守卫细节**（`scripts/publish-all.mjs`）：`vscode:prepublish` 自动跑 `lint && test`（发布门不挂仓级文档债——doc-check 走仓根域）；
  段 0 = 核版本存在性预检（registry 查无 = 中止）· 段 1.5 = vsix 含核断言（解包校验——断言 B）；

  **双市场同发**（Microsoft Marketplace + Open VSX；Cursor/VSCodium/Windsurf 连 Open VSX，缺一即未完成）；`--skip-marketplace` / `--skip-openvsx` 仅用于显式单源发布。

**坑**：`vsce publish` 报 `already exists` 但 `vsce show` 仍旧版 = 市场索引缓存延迟（发布通常已成功——先 `vsce show ... --json` 核对 versions 列表；真失败报 `Invalid access token` 或明确错误）。

**完成判定**：exit 0 = 完成（审核队列 = 平台侧事务）。发版 commit + tag（`v` + 本次号）**推双远端**（`origin` + `github`；github 固定走 proxy——漏推即漏发布）。

> **双远端推送**：发版 commit + tag 两端皆推；github 固定走 proxy——`git -c http.proxy=http://10.2.2.112:3128 push github main`，tag 同法。漏推 github = 漏发布。
> **tag 按号唯一**：一个号一个 tag，`refs/tags/v<号>` 指该号的**首发单元**（发布序恒为核在最前 ⇒ 同号时指核那次发版提交）；同一号跨多个单元只打这一个 tag。每单元各打一个会被后一次覆盖、第二次 push 必被拒。机检 = tag→commit 映射（`git rev-parse v<号>` 等于该号首发单元的发版提交）——只判「非空」区分不出同号这一面。

### 5.6 阶段 3b · 发桌面（`thincoder-desktop` · Windows 面；Linux 面暂缓）

> **定位**：桌面是发布轮必含端，发布动作 = 用户门。构建、签名、更新、官网与验证契约 = `docs/desktop/design/PACKAGING.md`「构建」∥「签名与更新」∥「官网与版本」∥「验证」；打包物化一律源自源树。
> **构建机要求**（签名侧）：GlobalSign EV token（eToken 5300）在位 + SafeNet SAC 驱动在 + 签名时 PIN 弹窗（构建者在场）。
> **Linux 面 = 暂缓**：只有用户要求发布 Linux 面时才恢复；Linux 的构建与验收按 `docs/desktop/design/PACKAGING.md`「验证」执行。

**步骤 1 · 定号 + CHANGELOG + bump**（同 §5.2 各步；桌面号段 = §4.2 步骤 5）：`thincoder-desktop/package.json` 的 `version` 改到期望号，`thincoder-desktop/CHANGELOG.md` 的 Unreleased 段头改新号。

**步骤 2 · 构建 + 产物校验**（一条命令链）：

```bash
cd thincoder-desktop
ELECTRON_MIRROR=https://npmmirror.com/mirrors/electron/ npm run package   # prepackage = 物化；postpackage = check-dist（闸）+ dev 链自愈（win32 面；本机 no-op）
```

**判据**：check-dist exit 0，核版本、产物结构、安装包、更新索引和 sha512 校验全部通过，契约见 `docs/desktop/design/PACKAGING.md`「构建」∥「签名与更新」。**签名态 = 已签**；未签则止步核查 eToken 5300、SAC 和 PIN，未签版仅限测试。Windows-only 构建按 win32 分支过闸，不要求 Linux 产物。

本步产物面 = 安装包 + `.blockmap` + **`latest.yml`**（update-info）+ electron-builder 生成的 update-info 附档，均位于安装包同目录。`npm run package` 不触发发布，上传恒走步骤 4。

**步骤 3 · 恢复 dev 链**（收窗——**在 `thincoder` 仓根执行**）：

```bash
cd ..   # 回 `thincoder` 仓根——dev-link.mjs 住仓根 scripts/（步骤 2 于 thincoder-desktop 内）
node scripts/dev-link.mjs --force && node scripts/dev-link.mjs --check   # 自愈已入链（postpackage 第三腿）——本步 = 幂等复判 ∥ 兜底（构建中止径）；终态 = 0
```

**步骤 4 · 上传（OSS 托管 · feed 三件）**：键形 = `downloads/` 前缀——**Windows**：`ThinCoder-Setup-<号>.exe` ∥ 同名 `.blockmap` ∥ `thincoder-desktop/dist/latest.yml`。feed 上传顺序 = 安装包 → blockmap → 更新索引，见 `docs/desktop/design/PACKAGING.md`「签名与更新」。

上传使用站点仓脚本 `thincoder.com/scripts/upload-download.mjs`。

**凭证口径**：`ALIYUN_KEY` ∥ `ALIYUN_SECRET` 走环境变量，不写进命令行，也不问用户要。先查再跑（`[Environment]::GetEnvironmentVariable('ALIYUN_KEY')`）；有值就直跑，未设才停下上报。

```bash
cd thincoder.com
node scripts/upload-download.mjs <exe> <blockmap> <latest.yml>   # 键形 = downloads/<文件名>；顺序 = exe → blockmap → latest.yml（latest.yml 末传）
```

**判据**：三件取回（HTTP 200 ∥ 字节数 = 本地一致）+ **`thincoder-desktop/dist/latest.yml` 对盘**（`version` = 本次号 ∥ `files[0].sha512` = 本地 exe 实算）；同号重传 ⇒ URL 核验加查询串绕缓存（`?v=…`）。

**步骤 5 · 官网挂载** = §5.8 阶段 5 一并执行（下载卡 + 版本面三处——条目形见本档 §6.2 分节）。

**完成判定**：check-dist 绿 + 签名态 = 已签（发布版）+ URL 可达（exe ∥ blockmap ∥ 版本清单三件）+ 站点三处版本面 = 本次号；**Linux 面 = 暂缓**（复核条件 = 用户要求发布 Linux 面时恢复）。

**失败处置**：§5.7 失败总原则（从失败端重跑；已发端不重发）；桌面构建、签名与更新失败面按 `docs/desktop/design/PACKAGING.md`「构建」∥「签名与更新」处理。

### 5.7 阶段 4 · 发布后收尾

1. **验证**：npm 侧 `npm view <包名> version`；VSC 侧 `vsce show <扩展> --json` 看 versions 列表。
2. **失败总原则**：任一端失败即停 → 修复 → **从失败端重跑**（已发端不重发——号已占，重发被 registry 拒）。

### 5.8 阶段 5 · 官网同步（站点仓域）

> **为什么在收尾之后**：官网 = 发布的**下游对外面**（站点仓 = 独立项目 · 独立 AGENTS.md · 纯静态 + OSS 直传）；其输入 = 「三端已发布完成」的号与变更 ⇒ 恒晚于阶段 4。
> **一体发布**：官网同步是本次发布的组成部分，同轮必做，不后置或静默跳过。**发布轮收口 = 三端发布完成 ∧ 官网同步完成**；官网未完成则本轮不得收口，修复后重跑官网步骤，不重发版。F4 的单端完成判定不变：发布命令 exit 0，失败不回滚已完成的发布。
> **执行角色（跨仓）**：站点仓内容改动 + 部署 = **主 agent 轮**（独立项目在 thincoder 仓外）；本仓流程档只给坐标与判据。数据面与口径全文 = §6（本节不重述）。

**前置**：阶段 4 验证已过（三端号与变更已成文）；本次发布的条目 = 提取对象。

**步骤 1 · 提取**（源 = 三端 `thincoder-cli/CHANGELOG.md`（CLI）∥ `thincoder-vscode/CHANGELOG.md`（VS Code 扩展）∥ `thincoder-desktop/CHANGELOG.md`（桌面）+ 核档（取材面——用途 = §6.4））：取本次发布条目（核不入页——§6.1）⇒ 生成站点条目片段（半自动生成 + 人工择要——§6.4）。

**步骤 2 · 站点更新**：① 版本面（about 页「当前版本」行 · download 页系统要求三行，首行 = 桌面版；站点契约 = `docs/desktop/design/PACKAGING.md`「官网与版本」）；② changelog 页（页头「截至最新发布」句 + 本次条目插到本节顶部）。口径 = §6.1–§6.3。

**步骤 3 · 部署**（在站点仓内执行）：

**凭证口径（同上）**：`ALIYUN_KEY` ∥ `ALIYUN_SECRET` 在环境变量里，直接跑、不写值、不问用户要；先查再跑，真未设才停下上报。

```bash
cd thincoder.com
DRY_RUN=1 node scripts/deploy-oss.mjs                 # 预演（零凭证可跑）——先核上传清单
node scripts/deploy-oss.mjs                           # 实传（脚本只读环境变量名 ALIYUN_KEY / ALIYUN_SECRET）
```

**完成判定**（判据全文与比较归一 = §6.5）：① 三处版本面 = registry / 市场最新号；② changelog 页**各端分节**顶部条目 = 该端本次号；③ 取回线上页面含本次号。

**失败处置**：凭证缺失（`ALIYUN_KEY` / `ALIYUN_SECRET` 均无——脚本只读此名）⇒ **停下上报**（禁以 `DRY_RUN=1` 冒充完成 ✗ 禁静默跳过 ✗）；部署失败（脚本非零退出或汇总含 `N failed`）⇒ 停下上报 → 修复后**重跑**（PUT 覆盖 = 幂等；`OSS_DELETE` 保持默认关，不做远端删对象）；判据不过 ⇒ 修站点内容后重部署（**不重发版**——号已占）。

## 6. 官网更新方案（数据面）

> **定位**：§5.8 阶段 5 的数据面与口径（唯一权威源）——本节不含第二条执行路径（执行恒走 §5 主线）。
> **站点仓**：`thincoder.com`（独立项目 · 独立 AGENTS.md · 纯 HTML+CSS 零构建 · 部署 = 仓内 OSS 直传脚本）；本节只登记**内容面**方案，站点仓技术面零改。

### 6.1 版本面（对外展示三端 · 取值）

**对外端（三） = CLI（npm 包 `thincoder`）· VS Code 扩展（市场 `thincoder-vscode`）· 桌面（安装包——`thincoder-desktop/package.json` `version`）**——与站点现行形态一致（about 页「当前版本」行 · download 页系统要求各行）。
**核不入版本面**：核 = 三产品的共享依赖（CLI 经依赖解析；vsix ∥ 桌面产物内嵌），用户不直接安装 ⇒ 站点对外版本面不展示核；核的对外可见性由三产品条目承载（CLI 条目内的核依赖升级句）。

**取值 = registry / 市场最新已发号（桌面 = 源树）**：CLI = `npm view thincoder version`；VS Code 扩展 = 市场 `versions` 首项；**桌面 = `thincoder-desktop/package.json` 的 `version`**（与产物名 ∥ 站点卡片同刻比对）。**三处同值**：同一端在 about / download / changelog 页头的表述逐字一致（含 `v` 前缀形态与端名写法）。

### 6.2 changelog 页（呈现形态）

**分节**：按端分节——**CLI 节在前 · VS Code 扩展节在后 · 桌面节随其后**，各节内部版本倒序（新在前）；节标题 = `<h2 class="section-title">`（站点既有类——**零 CSS 改动**，只加标签行）。
**条目形态**（沿用现状）：`<h2>v<号> <span class="version-date">日期</span></h2>` + `<ul>` 要点列表。

**粒度 = 逐版骨架 + 要点摘要**：每个**已发布**版本必有一条（骨架 = 号 + 日期 ⇒ 可机检）；要点 = 用户可感者优先（内部结构 / 机制类择一概括或省），旧版可仅 1 条——密度不强制统一。
**不上页**：① **未发布号**，即源档有段而 registry 或市场无号；② **作废号**，包括越月预占而未发的号。页面只反映真实发布。

### 6.3 同步窗口

**例行窗口** = 各端自官网上次已同步的展示号之后到本次发布号。每次发布只向前新增条目，不在例行同步中重建更早历史。

已发布而源档缺段的条目使用最小承位条目：写明维护性发布与日期；CLI 日期取 registry 发布时间，VS Code 扩展日期取市场版本时间。日期以源档段日期为优先；对应发布源也取不到日期时必须停下核定，不得以猜测值入页。

### 6.4 自动化程度（**半自动** · 生成脚本归站点仓）

**裁定 = 半自动**：站点仓内生成脚本（零依赖 · Node 标准库）——输入 = 三端 `thincoder-cli/CHANGELOG.md`（CLI）∕ `thincoder-vscode/CHANGELOG.md`（VS Code 扩展）∕ `thincoder-desktop/CHANGELOG.md`（桌面 · 工作区兄弟路径，可参数覆盖）
+ 核 `thincoder-core/CHANGELOG.md`（**取材面**——核不入页（§6.1）：仅当本次含核依赖升级时，供 CLI 条目内「核依赖升级句」取材）；
输出 = changelog 条目片段（**stdout，不写页面**）；人工完成择要 + 号 / 日期核对 + 插页。
**归属 = 站点仓 `scripts/`**（与部署脚本同域）：生成物 = 站点 HTML（格式 / 转义 / 缩进属站点面）⇒ 工具随其产物归站点仓；**本仓零新增工具**（对外面改动全部落站点仓轮）。

**人工门不可省**：生成物 = 骨架 + 原文要点草稿——**未经人读的生成物不得部署**（内部机制 / 行话面须择除）。
**被否候选**：① **全自动（生成即部署）**——内部面会漏到对外页，且无法保证用户可读；② **纯手工**——逐版手抄格式易漂移，且防再次滞后全靠人记性。

### 6.5 判据（可机检）

1. **版本面**：三处版本面 = registry / 市场最新号（**桌面 = 源树 `package.json`**）——取值：CLI `npm view thincoder version`；VS Code 扩展 `npx @vscode/vsce show xinbo-tech.thincoder-vscode --json`（`versions[0]`）；
   **桌面 = `thincoder-desktop/package.json` 的 `version`**（与站点卡片 ∥ 安装包名内号逐字相等）。**比较归一**：比较**号标记本身**（`v` 前缀不参与比对）；站点三处 `v` 形态按 §6.1 统一后相互逐字相等。
2. **changelog 页**：① **各端分节顶部条目 = 该端本次号**（每发布必跑——单端发布只核该端节）；② 窗口内**版本集合相等**（页面 ↔ registry / 市场，比较归一同上）；需要核对同步窗口时运行。
3. **线上**：取回 `https://thincoder.com/changelog.html` 含本次号（页面档 `no-cache` ⇒ 取回即现行）。
4. **feed 面（自动更新源）**：`https://thincoder.com/downloads/latest.yml` 可取回 ∧ `version` = 源树号 ∧ `files[0].url` 指向的安装包 URL 可取回（比较归一 = 判据 1 同法）。

### 6.6 边界（本节不做）

- 不改站点仓设计、样式或结构，只加内容面与标签行；页面集扩建不属于每次发布同步，站点内容契约见 `docs/desktop/design/PACKAGING.md`「官网与版本」。不重写站点技术栈，保持零构建
- 不改 §5 既有阶段结构（发布单元扩展随同法增补——桌面 = 阶段 3b）· 不改三端产品码（桌面零触同判）
- 核不入页（§6.1）· 窗口之前的历史不重建（§6.3）· 号层面零动作（官网不占号、不进 §4 定号规则）
- **changelog 页不适用仓内源码行数档位**：它是独立站点项目 `thincoder.com` 的内容页；站点侧分页或归档按站点仓自己的规则处理。
