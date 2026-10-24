# 2026-10-18 · bench-test-cleanup
> 六段 append-only，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 编制：主 agent · 2026-10-18 · 来源 = 用户 2026-10-18 07:13「为什么还有『常驻测试』存在？我们的测试策略不是早就改了吗？」+ 07:14 选「A 按策略清」。
> 台账 = #1644（core · 归批）。前情 = docs/core/requirements/TESTING.md §2.1（重建基线「五仓存量测试已全清」）。
## §1 讨论（主 agent）
**状态行**：已收口 2026-10-18
<§1 模板占位：本批条目 / 关键判据 / 授权口径>

**本批条目（1 条 · 18 文件 / 262 KB）**：`thincoder/bench/test/` 的常驻测试未随测试策略清理，与 `TESTING.md:98`「五仓存量测试**已全清**」不符。按用户 07:14 裁定 **A：按策略清**（单元测试零留存）。

**关键判据**：
- **为什么漏**：`bench/` 无 `package.json`（不是独立包），`thincoder/` 根也无——`bench/test/*.test.mjs` 只能手动 `node --test` 跑；`bench/README.md:229` 自述「不进 CI / 发布门」。⇒ **清理时扫「门」和 `npm test` 都扫不到它**。
- **为什么不立 A/B/C 之外的选项**：`TESTING.md` 的策略判据（「删掉可跑的东西，就没有可跑的全量」·「保险按事故史买，不按想象力买」）已定，本批只是**把既定策略执行完**，不是重新设计策略。
- **代价明说**：删后 bench 的判分器 / 报告 / 计时面失去回归保护。按策略这是**有意接受**——bench 改动时临时写单元测试（用后即删，§5 留一行读数），或跑一次真实 bench 作 UAT。
- **同批附带实证**：`bench/test/probe.test.mjs:104` 曾断言 `/missing mandatory field/`（对 spawn 六字段门），而批 `2026-10-18-prompt-residual-fixes` 的 ⑥ 要删该门 ⇒ **本批必须排在 ⑥ 之前**，否则删门即红（该批评审 `advisor#130` 的 🔴#2 即此）。

**授权口径**：用户 2026-10-18 07:14「A」（对应我给出的「A. 按策略清：删掉，改成 bench 自己的集成测试，用例数受 50–100 上限管」）。

**批径**：`bench/test/**` = 工程工具面（`test/**`）⇒ 可直接编辑；但含**删除**与「哪些属单元 / 哪些属继承资产」的判断，走设计 → 评审 → 实施。

**父侧扩范围：本批从「bench/test 清理」扩为「全仓测试面清理」（用户 2026-10-18 07:18「测试清理一下」）**

**审计读数（父侧全仓扫描，2026-10-18 07:1x）**：合规机制壳 = `test/run.mjs`×6 ∥ `test/slow.mjs`×3 ∥ `test/files.mjs`×2（**空清单 `export default []`**，2026-09-28 全清）∥ `test/rc-resolve.mjs`×2 ∥ `test/integration/`×2（空）；**六类第三类物 ≈886 KB**（详见台账 `#1645`）。

**父侧直接执行面（本笔 · 16 个文件 · 工程工具面 / 文档面 ⇒ 不 spawn）**

| 类 | 文件 | 判据 |
|---|---|---|
| 已收口批次的单元档 | `docs/batches/` 7 个：`2026-10-15-inject-project-rules-switch` · `2026-10-16-login-model-refresh` · `2026-10-17-box-shell-update` · `2026-10-17-deepseek-search-fetch` · `2026-10-17-sandbox-quota-chattr` · `2026-10-17-ssh-credential-save` · `2026-10-17-token-visibility-simplify`（`.test.mjs`） | `TESTING.md`：单元测试件**收口即删**；各自批档状态行 = 已收口 |
| 孤儿单元档 | `docs/batches/2026-10-15-model-selection-pivot-vsc.test.mjs` · `2026-10-17-ssh-credential-save-ends.test.mjs` | 对应批档**不存在** ⇒ 无主 |
| 位置错误的批内档 | `thincoder-server/test/2026-10-17-admin-approval-cards.test.mjs`（37 KB） | 批内单测件应在 `docs/batches/`；其批档已收口 ⇒ 删 |
| 第三类：真机冒烟 | `thincoder-cli/test/smoke-qwen-thinking.mjs` · `smoke-responses.mjs` · `smoke-responses-chain.mjs` · `thincoder-vscode/test/smoke-provider.mjs` · `smoke-settings.mjs` | 自述「真实端点 / 真机 / 手动跑 / 测试禁用」⇒ 不隔离（非单元）、不进 `integration/`（非集成）。**归集成需撑开 50–100 上限，而其验证价值已被真实使用覆盖** |
| 第三类：复现脚本 | `thincoder-cli/test-startup.mjs` | 黑屏复现脚本躺在包根；问题已修，复现脚本无留存价值 |

**保留面**：5 个**进行中**批次的单元档（`desktop-walkthrough-fixes` · `model-selection-pivot` · `team-token-rotation` · `box-quota-recovery` · `context-perception`）——「用后即删」，未到收口不删；全部 `run.mjs` / `slow.mjs` / `files.mjs` / `rc-resolve.mjs` 机制壳；`test/integration/` 空目录（待建位）；`thincoder-server/src/agent/model-test.mjs`（**产品功能**「模型测试执行器」，非测试文件——命名误导但保留）。

**不属仓库债**：`thincoder-desktop/test/artifacts/*.png` 11 张 / 305 KB —— `thincoder-desktop/.gitignore:2` = `test/artifacts/` ⇒ **运行期产物，不进 git**（`E2E-TESTING.md` KD-10）。本地可清可留，不影响仓库。

**bench/test 18 档**：由 `eng-designer#132` 出设计 → 评审 → 实施（本笔不含）。

**父侧直接执行结果（2026-10-18 07:2x · 16 文件 · 单笔可 revert）**

**已删（16）**：`docs/batches/` 9 个单元档（7 已收口 + 2 孤儿）· `thincoder-server/test/2026-10-17-admin-approval-cards.test.mjs`（批档已收口 + 位置错）· `thincoder-cli/test/` 3 个真机冒烟 · `thincoder-vscode/test/` 2 个真机冒烟 · `thincoder-cli/test-startup.mjs`（包根复现脚本）。

**保留面实测（清理后扫描，20 个测试文件）**：
- `docs/batches/*.test.mjs` **5 个**，全部对应**进行中**批次：`2026-10-15-desktop-walkthrough-fixes` · `2026-10-15-model-selection-pivot` · `2026-10-15-team-token-rotation` · `2026-10-16-box-quota-recovery` · `2026-10-16-context-perception`（「用后即删」，未到收口不删）。
- `bench/test/` **15 个 `.test.mjs` + 3 个夹具**（`fixtures.mjs` / `probe-fixtures.frozen.mjs` / `toolcall-fixtures.frozen.mjs`）—— 由 `#132` 设计轮处置，本笔未动。
- 机制壳完好：`thincoder-cli/test` = `run.mjs` · `slow.mjs`；`thincoder-core/test` = `run.mjs` · `slow.mjs`；`thincoder-desktop/test` = `files.mjs` · `rc-resolve.mjs` · `run.mjs` · `integration/`（空）· `artifacts/`（gitignored）；`thincoder-render-core/test` = `run.mjs`；`thincoder-server/test` = `rc-resolve.mjs`；`thincoder-vscode/test` = `files.mjs` · `run.mjs` · `slow.mjs` · `integration/`（空）。

**验证读数（父侧亲跑）**：`thincoder-core` 的 `node test/run.mjs` → `test manifest is empty — zero tests = green (2026-09-28 full reset)`（exit 0）∥ `thincoder-cli` 同句同绿 ⇒ 清的是「不该在的测试」，不是机制壳。

**未在本笔**：`bench/test` 18 档（`#132` 设计中）· `thincoder-desktop/test/artifacts/*.png` 11 张（`.gitignore:2` 已忽略 = 运行期产物，非仓库债）。

**用户改判（2026-10-18 07:24 / 07:26）——本条覆盖上文「按策略清」的授权口径**

- **07:24**：「bench/test 需要的是改名改路径而不是删除。」
- **07:26**：「都不算，他就是产品代码，性能评估是产品，不是测试。」（回「bench/check 算单元测试还是集成测试」）

**据此更正的授权口径**：本批**不删任何测试文件**。`bench/test/` → `bench/check/`、`*.test.mjs` → `*.check.mjs`，**内容零改**。

**定位（父侧 2026-10-18 07:48 更正）**：`bench` = **对外部 provider 做性能评估**——跑题集 → 判分 → 出速度 / 成本报告（`docs/core/design/MODEL-BENCH.md` §1.1「统一题集 + 判分器 + 速度/成本报告」· `bench/README.md:1-3`）。

**完整链条（用户 07:48 补充）**：输入 = `bench/cases/`（题集）· 处理 = `bench/lib/`（判分器 / 计时 / 成本）· **输出 = `bench/results/`（评估报告 = 产品输出）**。`bench/check/` = **这个产品的测试码**，随产品常驻。

**此前写过的「产品自检 / 自检码」是父侧发明的错词，已废**——bench 不是产品的自检功能，它评的是外部 provider 的性能。⇒「单元测试零留存」不适用于 `bench/check/`（它不是本项目的单元测试，是评估工具的测试码）。

**前一轮「18/18 全删」的设计作废**（§2 旧段保留为记录面，`advisor#135` 的 12 条随其作废）；现行设计 = §2 改判轮段（`advisor#138` 复审 → `advisor` 第 3 轮）。

**父侧裁定（记录面第 6 号冲突）**：`MODEL-BENCH.md` 记录面的历史命令**取章首披露形态**——§5.13 / §6 各一行写明「本批改名前的命令形为 `bench/test/*`」，逐档明细住本批档与 git；**不做逐行「当时 → 改名后」**。理由：逐行写回旧路径会与 `advisor#138` 第 1 号「`docs/core/**` 旧名零留存」直接冲突；章首一行即满足「可解析」，且 AC-2 的 `改名后` 豁免上限（≤2 行）正好容纳它。

**父侧两处计数错误的更正（`eng-designer#140` 实扫纠正，父侧认错）**：自档头注实为 **18/18**（父侧曾报 16）；`test/fixtures.mjs` 提及实为 **5 处**（父侧曾报 3，漏 `preflight:6` / `recompute:3`）。**教训**：父侧凭 `grep` 命中行估算计数，未逐档核——与今晚多次「拿二手读数当事实」同源。

**用户追加裁定（2026-10-18 08:03）**

- **08:03**：「改名 …ForCheck 也要做。」

**射程**：`bench/lib/` 的 4 个测试缝函数 —— `_setJudgeConfigPathForTest` / `_resetJudgeConfigPathForTest`（`judge.mjs:38-39`）· `_setPricesPathForTest` / `_resetPricesPathForTest`（`prices.mjs:29-30`）⇒ 后缀 `ForTest` → `ForCheck`（设计 = §2.13）。

**边界（不许越）**：`thincoder-core/**` 等其它模块的 `ForTest` 一律不动——那是真测试缝，服务项目测试体系，名称正确。改的只是「服务 `bench/check` 却挂着 `ForTest` 后缀」这 4 个。

**父侧判据错误更正**：父侧派单曾写「`docs/core/**` 内 `ForTest` = 0」，该面实有 **126 行** `ForTest`（真测试缝名录 + ③ 通道模板形）⇒ 按字面不成立。`eng-designer#146` 已改为「**4 个旧名 = 0** ∧ `bench/**` 内 `ForTest` = 0」，父侧采纳。**教训**：判据要落在「改的那几个」上，不是落在整个面上。

**用户裁定（2026-10-18 08:17）——`node --test` 不用，手动实现**

- **原话**：「node --test 我不希望用，因为造成误判的代价太大，你区分不清的问题造成了很大的困扰，我希望你手动实现不要用『免费』的，免费的才是最贵的」
- **射程**：`bench/check` 的**执行引擎面**——移除 `node:test`，自写 harness（设计 = §2.14）。`node:assert` 保留（断言原语，非测试框架）。
- **为什么（父侧理解，供复核）**：`node --test` 免费替我们决定了三件事——① 什么算一个用例 ② 失败长什么样 ③ 跑完报成 `ℹ tests / pass / fail`。**这三件事恰好就是让人把 bench 读成「内部测试」的东西**，而且它们藏在框架里、不写在我们的代码上。改名清了文件面、路径面，清不掉引擎面；引擎面只能自己实现才看得清。
- **代价如实**：丢掉 TAP / 单例超时 / `describe` / 并发调度——前两项**当前零使用**（`describe` / `before` / `beforeEach` / `afterEach` / `.skip` / `.todo` / `t.` 全部 0），后两项零使用。隔离不丢：`run.mjs` 仍逐档 `spawnSync` 一进程。
- **与 §2.13 的关系**：§2.13 = 标识符面（`ForTest` → `ForCheck`）；§2.14 = 引擎面。两者独立，互不阻塞。

## §2 批次任务与设计（eng-designer）
**状态行**：设计完成（fix 轮 2026-10-18（用户 08:12 裁定 + 08:17 收紧 + 收口轮 13 号）：§2.13 缝名收敛 + §2.14 引擎面去 test（逐档超时 60s · 异常原文 · 三计数器自校验 · 末行自证 · J7）；实施待 eng-coder）
<§2 模板占位：本批条目（覆盖） / 设计档落点 / 机制设计 / 受影响文件与测试覆盖 / 验收对照 / 关键决策 / 上抛项>

**本批条目（覆盖 · 1 条）**：`thincoder/bench/test/` **18 文件 / 3,735 行 / 268,421 B（262.1 KiB）/ 116 个 `test()` 块**全清——单元测试零留存（`requirements/TESTING.md` §2 F6 / F8 / F33）。用户 2026-10-18 07:14 选 **A：按策略清**（授权原文见 §1）。
**不在本批**：`docs/batches/*.test.mjs`（现盘 14 件——批内单元测试档，属各批收尾动作）；`bench/cases|lib|probe|results|toolcall` 源码；产品三包测试；`bench/results/**` 在档报告对。

### 2.1 分类处置表（逐文件 · 实读依据）

| # | 文件 | 行 | 体量 | 类 | 处置 | 依据（实读） |
|---|---|---|---|---|---|---|
| 1 | `graders.test.mjs` | 279 | 19,077 | 单元测试 | 删 | 直调 `../lib/grade.mjs` 原语 + 题集夹具；14 个 `test()` |
| 2 | `judge.test.mjs` | 298 | 20,870 | 单元测试 | 删 | 直调 `lib/judge.mjs` / `judge-fallback.mjs`，桩传输零网络；16 个 `test()` |
| 3 | `judge-fallback.test.mjs` | 231 | 16,136 | 单元测试 | 删 | 级联 / 补判面，桩传输；6 个 `test()` |
| 4 | `metrics.test.mjs` | 150 | 8,494 | 单元测试 | 删 | `lib/metrics.mjs` / `lib/prices.mjs` 纯函数；9 个 |
| 5 | `preflight.test.mjs` | 138 | 11,593 | 单元测试 | 删 | `lib/params.mjs` 枚举面 + `run.mjs` 启动门；3 个 |
| 6 | `probe-report.test.mjs` | 165 | 11,127 | 单元测试 | 删 | `probe/report.mjs` 落档 / 脱敏 / 成本闸；含 dry-run 全链腿 |
| 7 | `probe.test.mjs` | 264 | 18,267 | 单元测试 | 删 | 探针结构 / 行为级；**含 `:104` 钉死 spawn 六字段门的断言**（见 2.6 排序） |
| 8 | `recompute.test.mjs` | 168 | 10,874 | 单元测试 | 删 | `--recompute` 六用例 + 毒化 fetch 零网络腿 |
| 9 | `report-present.test.mjs` | 305 | 31,006 | 单元测试 | 删 | `renderReport` 呈现面断言（`render.3–9`） |
| 10 | `report-render.test.mjs` | 300 | 24,757 | 单元测试 | 删 | 渲染 / dry-run 产物 / sanitize 断言（`render.1/2`、`report.1/2`、`review.*`） |
| 11 | `roster.test.mjs` | 190 | 13,219 | 单元测试 | 删 | `lib/roster.mjs` / 价格键 / 数据档 schema；7 个 |
| 12 | `suite.test.mjs` | 227 | 14,339 | 单元测试 | 删 | `SUITE_VERSION` / 题集冻结 / `judge.json` schema；14 个 |
| 13 | `timing.test.mjs` | 109 | 8,031 | 单元测试 | 删 | `client.mjs` / `judge.mjs` / `metrics.mjs` 计时语义；3 个 |
| 14 | `toolcall.test.mjs` | 296 | 19,857 | 单元测试 | 删 | 工具探针结构 / 三轴 / dry-run 全链；含冻结副本等值腿 |
| 15 | `toolcall-report.test.mjs` | 160 | 10,768 | 单元测试 | 删 | 工具探针报告面 / 落档 / 成本闸；3 个 |
| 16 | `fixtures.mjs` | 205 | 17,368 | 测试夹具（非测试） | 删 | 仅被上述 9 个测试档 `import`（`graders` / `judge` / `judge-fallback` / `preflight` / `recompute` / `report-present` / `report-render` / `roster` / `suite`）；零运行面消费 |
| 17 | `probe-fixtures.frozen.mjs` | 113 | 6,343 | 冻结副本（测试夹具） | 删 | 仅被 `probe.test.mjs:16` 消费（两层机检另一侧）；零运行面消费 |
| 18 | `toolcall-fixtures.frozen.mjs` | 137 | 6,295 | 冻结副本（测试夹具） | 删 | 仅被 `toolcall.test.mjs:29` 消费；零运行面消费 |

**合计**：15 个测试档 + 3 个测试夹具 = 18/18 删；保留 **0**（零留存）。

### 2.2 判定依据（分类为什么成立）

- **定义判据**（`requirements/TESTING.md` §0）：单元测试 = 隔离测单个组件（依赖以桩 / 假件替身）。15 档全部 `import` bench 模块直测 / 经桩传输 / 夹具结果，无一走真实网络或付费端点 ⇒ 属单元测试（`probe.test` / `toolcall.test` / `report-render` 的 dry-run 腿也是夹具驱动，不是业务验收）。
- **寿命判据**（F6 / F8 / F33）：单元测试档零留存（用毕即删）；**永不转集成**。⇒ 不能"改成常驻集成测试"来保留（定义上不成立）。
- **集成面判据**（F12 / N20）：集成测试集只住三个前端（cli / vsc / desktop）；bench 是仓级工具，不是交付单元，且自述**不进 CI / 发布门**（`bench/README.md:229`；`MODEL-BENCH.md` §7-4）⇒ 无 RTM 业务故事可挂。
- **父侧禁止**：本批明令"不新增常驻测试"⇒ 不新建 `bench/test/integration/**`。

### 2.3 "bench 自己的集成测试"怎么落（最小可跑形态）

**结论：bench 的集成面 = 三个 runner 自带的 `--dry-run` 全链自检（产品特性，非测试档）**——已经常驻、零网络、零 API 花费，正是"跑通判分器 + 报告生成的冒烟"：

| 入口 | 覆盖 | 证据 |
|---|---|---|
| `node bench/run.mjs --dry-run --label <x> --results-dir <tmp>` | 判分（含判官对 / 仲裁 / 级联 / 复核夹具）→ 指标 → 报告 → 脱敏 | README:24-29；设计 §2.1-7 / §3 |
| `node bench/probe.mjs --models <label> --dry-run --label probe-<x> --results-dir <tmp>` | 真 `buildSpawnChild` 装配 + 脚本化假 child + 夹具判官 → 报告对 | 设计 §10.8 `--dry-run` 行 |
| `node bench/toolcall.mjs --models <label> --dry-run --label toolcall-<x> --results-dir <tmp>` | 夹具传输 + 真载荷 → 三轴 → 报告 → 落档 | 设计 §11.9 `--dry-run` 行 |

- **候选枚举（三选一，取 c）**：a) 新建 `bench/test/integration/*.test.mjs`——否决（违反父侧"不新增常驻测试"；违反 N20；要给非门控工具造门）；b) 把现有 dry-run 测试档改称集成测试——否决（定义上单元永不转集成；且仍是 262 KiB 常驻税）；**c) 用 runner 自带 `--dry-run` 当常驻冒烟**——选定（零新增档、零网络、零花费，且就是用户要的"判分器 + 报告生成冒烟"）。
- **改动时验证**：临时单元测试（住批次目录，用毕即删，批档 §5 留一行读数）∥ 一次真实 bench 跑（触网 / 花钱，用户点名）。**"改坏了怎么发现"** = `--dry-run` 全链 + 真实跑批读数异常；按 `TESTING.md` §1.3 这是**有意接受**的掉保护（保险按事故史买）。

### 2.4 回归价值评估（被删文件里"真会抓到问题"的清单）

| 簇 | 载体（代表用例） | 价值 | 为什么按策略仍删 |
|---|---|---|---|
| 判分器原语 | `graders.test.mjs:26-130`（`numEquals` / `vmRun` 超时 / `strictJson` / `textRules` fail-closed） | **高**——判分错 = 报告数字错 | 政策零留存；判分面由 `run.mjs --dry-run` 全链显影；改动时临时单测定点复现 |
| 判官 / 复核 / 级联 | `judge.test.mjs:34-283` · `judge-fallback.test.mjs:42-231` | **高**——判分口径核心 | 同上；dry-run 内置判官对 / 仲裁 / 级联 / 复核夹具 |
| 版本轴与题集冻结 | `suite.test.mjs:26-227`（`SUITE_VERSION` 单源、`judge.json` schema、28 条题面逐字） | **高**——版本轴是可比性根基 | `SUITE_VERSION` / `frozenAtSuiteVersion` 的机检（`judge.mjs:86` 拒跑）仍在运行面；冻结纪律 = 写时纪律 |
| 探针读数口径 | `probe.test.mjs:55-264` · `probe-report.test.mjs:45-165` · `toolcall.test.mjs:53-296` · `toolcall-report.test.mjs:42-160` | **高**——探针的全部读数口径 | 探针是测量面、非门控；`--dry-run` 全链 = 同口径可跑 |
| 报告渲染 | `report-present.test.mjs:25-305` · `report-render.test.mjs:21-300` | 中高——报告误读会误导选型 | 渲染面可从结果 JSON 重出（`--recompute`）；真实跑批复核 |
| 数据面 / 预检 / 计时 / 重算 | `roster.test.mjs` · `preflight.test.mjs` · `timing.test.mjs` · `recompute.test.mjs` | 中——schema / 参数 / 计时语义 | `preflight.mjs` 本身是运行面阻断门；`--recompute` 是产品分支；临时单测覆盖改动面 |

**维护税实录（为什么"高价值"也不留）**：`probe.test.mjs:104` 断言 `/missing mandatory field/` 钉住 spawn 六字段门，导致批 `2026-10-18-prompt-residual-fixes` 的 ⑥ 删门时必须同步改测试（该批评审 `advisor#130` 🔴#2）；这正是"存量测试 × 改动频次"的乘法成本。删后该批 ⑥ 可独立落地。

### 2.5 保留清单 / 零保留论证

- **保留 = 0**：`bench/test/` 目录整体消失；`bench/` 下零 `*.test.mjs`。
- **非测试资产不动**：`bench/results/**`（报告对留档 = 数据面）、`bench/probe/fixtures.mjs` / `bench/toolcall/fixture.mjs` / `cases.mjs`（运行面夹具正本）、`bench/judge.json` / `models.json` / `prices.json`（数据档）。
- **冻结副本随删的代价（明写）**：`probe.test.mjs` / `toolcall.test.mjs` 承载的"运行面副本 ↔ 冻结副本逐字等值"两层机检随之退役；夹具漂移只剩 `PROBE_VERSION` / `TOOL_PROBE_VERSION` 的**写时 bump 纪律**。按策略这是有意接受（同 §2.3）。

### 2.6 排序依赖与回滚面

- **排序**：本批必须**先于** `2026-10-18-prompt-residual-fixes` ⑥（删 spawn 六字段门）。本批删掉 `probe.test.mjs:104` 后，该批 ⑥ 不再有测试连带；若顺序倒置，该档必红。
- **该批影响（报告项）**：`docs/batches/2026-10-18-prompt-residual-fixes.md` §2.5 表列 `bench/test/probe.test.mjs`（263 行 / +47）与 AC-12 的 `node --test bench/test/probe.test.mjs` 腿——本批后该档不存在 ⇒ 该批 §2 需由主 agent 处置（删该行 / 改判据）；本批不代改他批档。
- **回滚面**：单提交、纯删除 + 文档；`git revert <commit>` 即恢复 18 档。无 schema / 数据 / 版本号变更（`SUITE_VERSION` 恒 7）。

### 2.7 文档改法（清后仍成立）

| 档 | 改法 | 笔 |
|---|---|---|
| `docs/core/requirements/TESTING.md:98` | 现句"五仓存量测试已全清"只覆盖五包、不含 bench（bench 非包）⇒ 扩为：**"重建基线：五仓存量测试已全清 + `bench/test/` 常驻测试已清（2026-10-18）——`npm test` = 空清单零用例绿；`bench/` 无常驻测试（验证 = 各 runner 的 `--dry-run` 自检 + 改动时临时单元测试（用毕即删，§5 留一行读数）+ 真实跑批）；集成测试集重建按 N8（最小可跑起步）＋ N19（规模窗口）＋ N20（三前端）。"** | **主 agent**（需求档笔）——本席给逐字建议，不落笔 |
| `bench/README.md:229` | 测试入口句 → **"不进 CI / 发布门 / 三端产物白名单；bench 无常驻测试（单元测试用毕即删——`docs/core/requirements/TESTING.md`）；验证 = `--dry-run` 自检 + 改动时临时单元测试 + 真实跑批。"** | eng-coder（实现面） |
| `bench/README.md:243` | 目录树删 `test/ 自检（手动跑，不进 CI）` 行 | eng-coder |
| `docs/core/design/MODEL-BENCH.md` | **现行面**更新：§3 重写为现行文件清单 + 验证方式（删逐批预算表——历史入 git，不进设计档）；§7-4 边界句；§4 KD-11；§10.2 / §10.10 / §11.2 / §11.11（冻结副本与两层机检退役 → 验证方式 = dry-run + 临时单测 + 真实跑批）；§5.10 / §5.13 承载句（若保留历史表则见下"残留"） | **本席（设计档笔）** |
| 其它档实扫 | `docs/**` 命中仅：`MODEL-BENCH.md`（现行 + 逐批记录）+ 三份批档（`2026-10-16-p4…` 历史记录不动；`2026-10-18-prompt-residual-fixes` 见 2.6；本批档）。`docs/README.md` / `PROJECT-MANIFEST.json` / CI / 各包 `package.json` **零命中** | —— |

- **残留（如实登记）**：`bench/probe/fixtures.mjs:5` 与 `bench/toolcall/fixture.mjs:5` 的注释仍写"冻结副本（`bench/test/*.frozen.mjs`）"——本批禁止触碰 `probe/` / `toolcall/` 源码，**不删**；两处 = 死指针，建议另批两行注释收正（不涉逻辑）。`MODEL-BENCH.md` 的逐批用例 / AC 表（§5.10–§5.13 / §6）仍含测试档名——属**记录面历史残留**，本批只改现行机制面；整档去历史 = 另批（设计档历史债务，非本批引入）。

### 2.8 受影响文件与测试覆盖

| 文件 | 现状 | 变更 | 说明 |
|---|---|---|---|
| `bench/test/*`（18 档） | 3,735 行 / 262.1 KiB | **−18 档（全删）** | `git rm`（tracked） |
| `bench/README.md` | 246 行 | ±2 处（`:229` 句 / `:243` 树行） | 见 2.7 |
| `docs/core/design/MODEL-BENCH.md` | 2,013 行 | 现行面就地更新（§3 重写 + 5 小节改写） | 本席落笔 |
| `docs/core/requirements/TESTING.md` | 248 行 | `:98` 一句扩写 | **主 agent 笔**（建议见 2.7） |
| `docs/batches/2026-10-18-prompt-residual-fixes.md` | —— | 删 `probe.test.mjs` 行 / 改 AC-12 | **主 agent 处置**（他批档） |
| `bench/results/**` / 三包 / 产品码 / `package.json` / CI | —— | **±0** | 零触 |

**本批测试覆盖（F9 测试行）**：无新增常驻测试；本批验证 = 三个 `--dry-run` 全链（零网络）+ 静态核查（`git ls-files bench/test` 空 / grep 残留逐条）。

### 2.9 验收对照（机器可验）

| # | 判据 | 回指 |
|---|---|---|
| AC-1 | `bench/test/` 不存在（`glob bench/test/**` = 0 命中；目录可删） | 条目 ① |
| AC-2 | `git ls-files bench/test` 输出为空；`git status --porcelain` 中 18 档为 `D` | 条目 ① |
| AC-3 | `grep -rn "bench/test" bench --glob '!README.md'` 仅命中 `probe/fixtures.mjs:5` / `toolcall/fixture.mjs:5` 两处注释（已登记残留，2.7）；其余零命中 | 条目 ② / ⑤ |
| AC-4 | 三条 `--dry-run` 命令 exit 0；产物落 `--results-dir` 临时目录；`git status --porcelain bench/results` 为空 | 条目 ③ |
| AC-5 | `TESTING.md:98` 新句在位；`bench/README.md` 无 `bench/test` / `node --test bench/test` 字样；`MODEL-BENCH.md` 现行面（§3 / §4 KD-11 / §5.10 / §5.13 / §7-4 / §10.2 / §10.10 / §11.2 / §11.11）零 `bench/test` 引用 | 条目 ④ |
| AC-6 | `bench/**/*.test.mjs` = 0；`docs/batches/*.test.mjs` 本批零新增（现盘 14 件属各批收尾） | 零留存 |
| AC-7 | 本批提交先于 `2026-10-18-prompt-residual-fixes` ⑥；该批 §2 / AC-12 已由主 agent 收正 | 排序 |
| AC-8 | `git show --stat` = 纯删除 + 上表文档行；无 schema / 版本号 / `bench/results` 变更；单提交可 revert | 回滚 |

**验证命令（读数入 §5）**：
1. `node bench/run.mjs --dry-run --label cleanup-check --results-dir .thincoder/tmp/bench-cleanup-check`
2. `node bench/probe.mjs --models <在册 label> --dry-run --label probe-cleanup-check --results-dir .thincoder/tmp/bench-cleanup-check`
3. `node bench/toolcall.mjs --models <在册 label> --dry-run --label toolcall-cleanup-check --results-dir .thincoder/tmp/bench-cleanup-check`

### 2.10 关键决策记录

| # | 决策 | 备选与取舍 |
|---|---|---|
| K1 | 18/18 全删（零留存） | 备选"保留 3 个夹具"——否决：夹具零运行面消费，留着只是死数据 |
| K2 | bench 不建独立集成测试集；集成面 = runner 自带 `--dry-run` 全链 + 真实跑批 | 见 2.3 三候选；b/c 取舍 = 定义（单元永不转集成）+ N20 + 非门控 |
| K3 | 冻结副本与两层机检随测试退役；夹具漂移只剩版本 bump 写时纪律 | 备选"留两个冻结档 + 一个 20 行校验档"——否决：仍是常驻测试（父侧禁令）+ 只保护"副本没被改"这一低价值命题 |
| K4 | `MODEL-BENCH.md` 只改**现行机制面**；逐批用例 / AC / 预算历史表另批去历史 | 备选"本批整档去历史"——否决：射程膨胀（~60 处历史行），且历史内容属另一类债务；本批只保证"现行面不说假话" |
| K5 | `TESTING.md:98` 用"扩写"而非"改写为另一句" | 原句对五包仍为真；缺的是 bench（非包）⇒ 加法式扩写，不推翻既有事实 |

### 2.11 上抛 / 知会项

- **[上抛·知会]** `docs/batches/2026-10-18-prompt-residual-fixes.md` §2.5 / AC-12 含 `bench/test/probe.test.mjs`——本批后失效，请主 agent 处置（他批档笔）。
- **[上抛·知会]** `docs/core/requirements/TESTING.md:98` 需主 agent 落 2.7 的逐字建议（需求档笔）。
- **[上抛·知会]** 零留存同类残留：`docs/batches/*.test.mjs` 现盘 **14 件**（`docs/core/design/TESTING.md:94` 已认账其存在）——本批不触；若属已收口批次，属同政策欠账，建议主 agent 评估另批。
- **[上抛·知会]** 两处源码注释死指针（`bench/probe/fixtures.mjs:5` / `bench/toolcall/fixture.mjs:5`）——本批禁止触碰源码，建议另批两行注释收正。
- **[上抛·知会]** `MODEL-BENCH.md` 逐批历史表（§5.10–§5.13 / §6）仍含 `bench/test/*` 档名——设计档历史债务，建议登记另批"MODEL-BENCH 去历史"。

**§2 落盘后收正（同席 · 2026-10-18）**：2.7 的 `MODEL-BENCH.md` 改动**已落盘**（现盘 **1,742 行**，原 2,013）：§3 重写为现行文件清单 + 验证方式（逐批预算表整段删除）；§7-4 · KD-11 · §5.10（承载句 + 五列表列）· §5.13 承载句 · §10.2 · §10.10 · §11.2 · §11.11 · §2.5 价格孤儿判据句 · §5.13 测试策略五则 ①② 已改为零常驻测试口径。

**AC-5 射程收正（实测读数）**：`MODEL-BENCH.md` 现盘 `bench/test` 残留 = **19 行**，全部在**记录面**——§5.13 逐批用例表 4 行（`timing.1–3` / `preflight.1`）· §6 逐批 AC 表 15 行；**现行机制面零命中**（§3 / §4 KD-11 / §5.10 / §5.13 承载句 / §7-4 / §10.2 / §10.10 / §11.2 / §11.11 逐处实读）。这 19 行 = 2.7 已登记的「设计档历史债务」，不属本批现行面；整档去历史另批（已上抛）。
**实读补充**：`MODEL-BENCH.md` 存量行宽超 300 字符单行 **57** 行（本批前后同量级——属存量 doc-debt，不在本批射程）；本批新增 / 改写的 §3 段落无超宽行。

**§1 扩范围后收正（2026-10-18 07:2x 实读 §1）**：§1 已把本批扩为「**全仓测试面清理**」（用户 07:18「测试清理一下」），父侧同轮直接执行面（16 文件）已落：`docs/batches/` 9 个单元档（7 已收口 + 2 孤儿）· `thincoder-server/test/2026-10-17-admin-approval-cards.test.mjs` · CLI 3 个真机冒烟 · VSC 2 个真机冒烟 · `thincoder-cli/test-startup.mjs`。**本席 2.11 第 3 条与 AC-6 的「现盘 14 件」已过时**——现盘 `docs/batches/*.test.mjs` 保留 **5 件，全部对应进行中批次**（`desktop-walkthrough-fixes` / `model-selection-pivot` / `team-token-rotation` / `box-quota-recovery` / `context-perception`，「用后即删」，未到收口不删）；本批不触。
**本批射程收正**：全仓清理的**剩余设计面 = `bench/test` 18 档**（§1 原文「由 eng-designer#132 出设计 → 评审 → 实施（本笔不含）」）；2.1–2.10 的 18 档处置、集成面论证、文档改法、排序与回滚**不变**。

### 改判设计轮（2026-10-18 · 用户 07:24 / 07:26：`bench/test/` 不删，改名改路径）

**改判依据**：用户 07:24「`bench/test/` 不删，改名改路径」+ 07:26「bench 是产品，性能评估是产品功能，这些自检档是产品代码，不是测试」。⇒ 本段取代上段「18/18 全删」的处置（上段保留为记录面，不再有效）。

**0. 定位判定（本设计的第一性判据）**

`bench` = **对外部 provider 做性能评估的工具**——跑题集 → 判分 → 出速度 / 成本报告。完整链条：输入 = 题集（`bench/suites/`，本批由 `bench/cases/` 改名）· 处理 = 判分器 / 计时 / 成本（`bench/lib/`）· 输出 = 评估报告（`bench/results/` = **产品输出**，不是运行期残留）。口径见 `docs/core/design/MODEL-BENCH.md` §1.1「统一题集 + 判分器 + 速度/成本报告」。

`bench/check/` = **这套评估工具自身的测试代码**，随工具常驻。

- 项目测试体系的两种定义（`docs/core/requirements/TESTING.md` §0）都以**归属与寿命**落地：单元测试 = 批次本地、用毕即删的开发者反馈回路（§1.1 / §2 F6 / F8）；集成测试 = 三前端业务场景的 UAT（N20）。`bench/check/**` 不属于任何批次、不挂 `npm test` / CI / 发布门（`bench/README.md:229`）、随评估工具常驻 ⇒ **既不是单元测试，也不是集成测试**。
- 所以它**不受「单元测试零留存」管**：零留存纪律的对象是批次件（「删掉可跑的东西，就没有可跑的全量」——`TESTING.md` §1.1），这套评估工具自身的测试代码不在这句话的对象集里。
- **为什么名字里不能留 `test`**：`test` 在本项目是一个有严格定义的词；bench 用同一个词指另一类物 ⇒ 一词二物。实证 = `#1648`：刚删的 `bench/test/fixtures.mjs`（测试夹具）与仍在的 `bench/probe/fixtures.mjs`（探针载荷）同名不同物；`TESTING.md:98`「已全清」漏掉 `bench/test` 也源于这套语汇污染。
- **形态说明（不粉饰）**：这些测试代码做的是组件级校验——与 ISTQB「component testing」的**手法**同形。判它属于哪一类的是本项目的归属 / 寿命 / 门判据，不是检查手法；`node:test` 只是执行引擎（实测：显式传 `.check.mjs` 路径可跑，2 档 pass / exit 0；失败档 exit 1）。
- **副作用（正向）**：改名后 `bench/check/**` 离开工程工具面（`test/**`），按变更面路由落到**产品码面**——与用户「这些是产品代码」的判定一致。

**1. 18 档改名映射表（原名 → 新名 → 引用点）**

命名硬约束：① 名字里零 `test`；② 与 `bench/lib/` 的 23 个 basename 不同名（撞名 5 个：`judge` / `judge-fallback` / `metrics` / `recompute` / `roster` ⇒ `.check` 后缀使 `judge.check.mjs` ≠ `judge.mjs`，5 处全解）。

| # | 原路径 | 新路径 | 行 | 字节 |
|---|---|---|---|---|
| 1 | `bench/test/graders.test.mjs` | `bench/check/graders.check.mjs` | 278 | 19,077 |
| 2 | `bench/test/judge.test.mjs` | `bench/check/judge.check.mjs` | 297 | 20,870 |
| 3 | `bench/test/judge-fallback.test.mjs` | `bench/check/judge-fallback.check.mjs` | 230 | 16,136 |
| 4 | `bench/test/metrics.test.mjs` | `bench/check/metrics.check.mjs` | 149 | 8,494 |
| 5 | `bench/test/preflight.test.mjs` | `bench/check/preflight.check.mjs` | 137 | 11,593 |
| 6 | `bench/test/probe-report.test.mjs` | `bench/check/probe-report.check.mjs` | 164 | 11,127 |
| 7 | `bench/test/probe.test.mjs` | `bench/check/probe.check.mjs` | 263 | 18,267 |
| 8 | `bench/test/recompute.test.mjs` | `bench/check/recompute.check.mjs` | 167 | 10,874 |
| 9 | `bench/test/report-present.test.mjs` | `bench/check/report-present.check.mjs` | 304 | 31,006 |
| 10 | `bench/test/report-render.test.mjs` | `bench/check/report-render.check.mjs` | 299 | 24,757 |
| 11 | `bench/test/roster.test.mjs` | `bench/check/roster.check.mjs` | 189 | 13,219 |
| 12 | `bench/test/suite.test.mjs` | `bench/check/suite.check.mjs` | 226 | 14,339 |
| 13 | `bench/test/timing.test.mjs` | `bench/check/timing.check.mjs` | 108 | 8,031 |
| 14 | `bench/test/toolcall.test.mjs` | `bench/check/toolcall.check.mjs` | 295 | 19,857 |
| 15 | `bench/test/toolcall-report.test.mjs` | `bench/check/toolcall-report.check.mjs` | 159 | 10,768 |
| 16 | `bench/test/fixtures.mjs` | `bench/check/helpers.mjs`（见 2.3-K2） | 204 | 17,368 |
| 17 | `bench/test/probe-fixtures.frozen.mjs` | `bench/check/probe-frozen.mjs` | 112 | 6,343 |
| 18 | `bench/test/toolcall-fixtures.frozen.mjs` | `bench/check/toolcall-frozen.mjs` | 136 | 6,295 |
| — | （新增） | `bench/check/run.mjs`（契约见 2.3） | — | — |

**合计（本席实测）**：18 档 / **3,717 行（`wc -l` 口径）** / 268,421 B / 116 个 `test()` 块。注：上段旧读数「3,735 行」= 同一批档的 `split("\n").length` 口径（含 18 个末行空元素），两者差 18；沿用本席 `wc -l` 口径。

**每档的引用点（改后即生效）**：

- **15 档共有**：① 头注跑法句 `node --test "bench/test/*.test.mjs"` → `node bench/check/run.mjs`（15/15 档，`:3`～`:7` 不等）；② 目录深度不变（`dirname(dirname(import.meta.url))` 仍 = `bench/`——`graders:23` / `roster:20` / `suite:19` / `toolcall:44` 四处不受影响）。
- **`./fixtures.mjs` → `./helpers.mjs`（9 档）**：`graders:20` · `judge:17` · `judge-fallback:17` · `preflight:17` · `recompute:9` · `report-present:13` · `report-render:12` · `roster:18` · `suite:17`。
- **`../cases/` → `../suites/`（4 档 10 行）**：`graders:14-19`（6 行）· `judge:11` · `report-render:8` · `suite:14-15`。
- **`../probe/fixtures.mjs` → `../probe/data.mjs`**：`probe.check:15`（+`:60` 注释串）。
- **`../toolcall/cases.mjs` → `../toolcall/prompts.mjs`**：`toolcall.check:19` · `toolcall-report.check:15`。
- **`../toolcall/fixture.mjs` → `../toolcall/data.mjs`**：`toolcall.check:23`（+`:83` / `:85` / `:89` 注释与相对路径表 / 断言串）。
- **冻结副本导入**：`probe.check:16`（`./probe-fixtures.frozen.mjs` → `./probe-frozen.mjs`）· `toolcall.check:29`（`./toolcall-fixtures.frozen.mjs` → `./toolcall-frozen.mjs`）。
- **路径字面（唯一一处非 import 的运行面路径）**：`graders:261` 的 `join(BENCH_DIR, "cases", "multiturn.mjs")` → `"suites"`。
- **16 号档（helpers）自档头注 `:2`**：「`report-recompute.test.mjs` 行数超线 ⇒ 按设计档 §3 拆出」→ 改为现行档名口径（见 ④）。
- **17/18 号档自档头注**：`probe-frozen:4/:6`（指向 `bench/probe/data.mjs`）· `toolcall-frozen:4/:5`（指向 `bench/toolcall/data.mjs` + `prompts.mjs`）。
- **头注自档名 + 兄弟档名提及（33 处 = 18 + 5 + 10；`fixtures:2` 一线同属 ① ③ ⇒ 去重 32 行）**：这些串不带 `bench/` 前缀 ⇒ 判据 A（盘上名字面）与改前 AC-2（5 个旧路径）都不覆盖，必须逐行改；改后由 AC-2 兜底（7-a）。
  - **① 18 档自档头注 `:2`（18/18 · 实扫）**：现文形 ` * test/<旧档名> — …` → 改为 ` * check/<新档名> — …`；18 档 =
    `fixtures` · `graders` · `judge` · `judge-fallback` · `metrics` · `preflight` · `probe` · `probe-report` · `probe-fixtures.frozen` · `recompute` · `report-present` · `report-render` · `roster` · `suite` · `timing` · `toolcall` · `toolcall-report` · `toolcall-fixtures.frozen`。
  - **② `test/fixtures.mjs` 提及（5 处 · 非自档名）**：`preflight:6` · `recompute:3` · `report-present:8` · `report-render:4` · `roster:6` → `check/helpers.mjs`（后 3 处与上面「15 档跑法句」同行）。
  - **③ 兄弟档名提及（10 处 · 旧名 → 新名，逐条）**：`judge:6` `judge-fallback.test.mjs`→`judge-fallback.check.mjs` · `probe:6` `probe-report.test.mjs`→`probe-report.check.mjs` · `report-present:2` `report-render.test.mjs`→`report-render.check.mjs`
    · `roster:76` `suite.test.mjs`→`suite.check.mjs`（`roster:3` 同行 2 处同改）· `suite:4` `roster.test.mjs`→`roster.check.mjs` · `toolcall:6` `toolcall-report.test.mjs`→`toolcall-report.check.mjs` · `fixtures:174` `suite.test.mjs`→`suite.check.mjs`。
  - **④ 既存陈旧名（非本批引入，随 ③ 收正）**：`fixtures:2` ∕ `fixtures:3` 写「`report-recompute.test.mjs` 行数超线拆出」——**该名现盘不存在**（拆档前旧名）⇒ 改为现行两档口径（`recompute.check.mjs` ∕ `report-render.check.mjs`），语义不变。

**2. 「`bench/` 内零 `test`」的可机检判据（按名字面定义，残差面单列）**

| 判据 | 内容 | 机检命令（可逐字跑） | 期望 |
|---|---|---|---|
| **A 名字面** | `bench/` 下无任何**文件 / 目录名**含 `test`（不区分大小写） | `node -e "const{readdirSync}=require('node:fs');const w=d=>readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?[e.name,...w(d+'/'+e.name)]:[e.name]);console.log(w('bench').filter(n=>/test/i.test(n)))"`（cwd = `thincoder/`；输出空数组） | `[]` |
| **B 新名字面** | 本批新增 / 改名的 19 个名字（15×`.check.mjs` + `helpers.mjs` + `probe-frozen.mjs` + `toolcall-frozen.mjs` + `run.mjs`）零 `test` | 包含在 A 内（A 为全集） | `[]` |
| **C 旧路径引用面** | 见 §7 AC-2 / 7-a（**单源**：扫面、七串类、排除面、期望值全部以 7-a 为准，本行不复述；排除面含 `bench/results/**` = 产品输出面，不得纳入改名射程） | 7-a 代码块（可逐字跑） | 7-a 读数 `residual = 0` |

**残差登记（`test` 的非名字形态 · 逐类列出）**：`test` 还会以四类**非名字**形态存在：

1. **`node:test` API 面**：`import { test } from "node:test"` + **116 个 `test()` 调用**（15 档自检 + helpers 的再导出）——执行引擎，不是命名；改它等于换执行引擎。
2. **测试缝导出**：`_setJudgeConfigPathForTest` / `_resetJudgeConfigPathForTest`（`bench/lib/judge.mjs:38-39` · `bench/lib/prices.mjs:29-30`）；消费方 `run.mjs:26-27` · `probe.mjs:14,16` · `toolcall.mjs:16` + 4 档自检（judge / judge-fallback / preflight / recompute）。**本批 fix 轮改名 `…ForCheck`**（§2.13；用户 2026-10-18 08:03 裁定）——标识符面，独立判据见该节。
3. **数据键 / 局部量**：`sameVendorAsTested`（报告 JSON 键；`bench/results/**` 已冻结，共 24 处）· `tested` 局部集（`lib/judge.mjs` / `lib/report.mjs` / `lib/pipeline.mjs` / `lib/rejudge.mjs` / `preflight.mjs`）。**不得改**——改键 = 破在档数据 schema 与 `--recompute` 兼容。
4. **JS 标准 API**：`RegExp.prototype.test`（`.test(` 调用，`lib/grade.mjs` / `lib/prices.mjs` / `lib/recompute.mjs` / `lib/rejudge.mjs` / `lib/roster.mjs` / `probe/report.mjs` / `probe/data.mjs` / `toolcall/grade.mjs` / `toolcall/report.mjs` 等）。

**另两处「撞词但不动」**：`--cases` CLI 旗标（`bench/toolcall.mjs:31`）与结果 JSON 的 `cases` / `fixtures` 键（`bench/results/**` + `toolcall-report.check:60,77` 断言的 schema）——**数据契约，不是路径**。

**3. `bench/check/run.mjs` 契约**

**目的**：一条命令跑全部 `bench/check/` 档（评估工具自身的测试代码）；漏登记 = 拒跑（不是静默少跑）。

```
node bench/check/run.mjs        # 无参数；cwd 不敏感（路径按本档位置解析）
```

| 阶段 | 行为 | 判据 |
|---|---|---|
| 清单 | `CHECK_FILES` = 15 个显式相对路径（固定顺序，与上表 1–15 同序） | 清单是单源；不靠目录扫描发现 |
| 启动前自检 ① | **盘上 ⊆ 清单**：递归走 `bench/check/`，收 `*.check.mjs`；不在清单里的 ⇒ 报错 + 点名 + exit 1；软链目录 ⇒ 检出即失败（递归穿不过，属静默漏收集） | 新增一档未登记 ⇒ 红 |
| 启动前自检 ② | **清单 ⊆ 盘上**：清单任一项不在盘 ⇒ 报错 + 点名 + exit 1 | **理由（实测）**：`node --test a.check.mjs c.check.mjs`（c 不存在）⇒ exit 0、只跑 1 例——node 对缺失档**静默忽略**，单向反查不够 |
| 启动前自检 ③ | 清单为空 ⇒ exit 1（**偏离各包 `test/run.mjs` 的空清单 = 绿**） | 各包的空绿是 2026-09-28 全清重置的产物；bench/check 是常驻产品资产，变空 = 缺陷 |
| 执行 | `spawnSync(process.execPath, ["--test", ...绝对路径], { stdio: "inherit" })` | 15 档各跑独立子进程（隔离）；并发由 node 默认调度 |
| 退出码 | 0 = 全过；1 = 任一自检红 或 上述 ①②③ 任一失败 | 与 `node --test` 语义一致（实测：失败档 exit 1） |
| 边界 | 不读网络、不读用户 config、不写 `bench/results/`（各档自带临时沙箱） | 零 API 花费 |

**4. 连带撞词四项 —— 引用点全清单（实施逐条改，改完 grep 归零）**

**A. `bench/cases/` → `bench/suites/`（10 档目录改名）**

- import（8 处运行面）：`bench/run.mjs:22` · `bench/lib/judge.mjs:14` · `bench/lib/pipeline.mjs:15` · `bench/lib/rejudge.mjs:19` · `bench/lib/report-review.mjs:9` · `bench/lib/report-tables.mjs:8` · `bench/lib/report.mjs:9` · `bench/lib/roster.mjs:14`。
- import（测试面，已计入 1. 的「4 档 10 行」）。
- 路径字面：`bench/check/graders.check.mjs:261`。
- 注释：`bench/suites/*.mjs:2` ×10（自档头注 `cases/<dim>.mjs —` → `suites/<dim>.mjs —`）· `bench/lib/report-review.mjs:5`。
- 文档：`bench/README.md:76` · `:91` · `:241`（三处 `bench/cases` → `bench/suites`；`:77` 的 `cases[].prompt` 与 `:184` 的 `casesDigest` = 数据键，不改）。`docs/core/design/MODEL-BENCH.md` 同串已归零（实测，见 5.），不在改点。

**B. `bench/probe/fixtures.mjs` → `bench/probe/data.mjs`**

- `bench/probe.mjs:22`（import）· `bench/probe/data.mjs:2`（自档头注）· `bench/probe/data.mjs:5`（冻结副本指针）· `bench/check/probe.check.mjs:15`（import）· `:60`（注释串）· `bench/check/probe-frozen.mjs:4` · `:6`（注释）· `docs/core/design/MODEL-BENCH.md:693 :1326 :1327`。

**C. `bench/toolcall/fixture.mjs` → `bench/toolcall/data.mjs`**

- `bench/toolcall.mjs:19`（import）· `bench/toolcall/data.mjs:2`（自档头注）· `:5`（冻结副本指针）· `bench/toolcall/prompts.mjs:6`（注释）· `:11`（import）· `bench/toolcall/variants.mjs:6` · `:7`（注释）· `:14`（import）· `bench/check/toolcall.check.mjs:23`（import）· `:83 :85 :89`（注释 / 相对路径表 / 断言串）· `bench/check/toolcall-frozen.mjs:4` · `docs/core/design/MODEL-BENCH.md:693 :1532 :1534 :1567`。

**D. `bench/toolcall/cases.mjs` → `bench/toolcall/prompts.mjs`**

- `bench/toolcall.mjs:18`（import）· `bench/toolcall/report.mjs:11`（import）· `bench/toolcall/prompts.mjs:2`（自档头注）· `bench/toolcall/data.mjs:5`（注释「本档 + `cases.mjs`」）· `bench/check/toolcall.check.mjs:19`（import）· `:85`（相对路径表）· `bench/check/toolcall-report.check.mjs:15`（import）· `bench/check/toolcall-frozen.mjs:5` · `docs/core/design/MODEL-BENCH.md:693 :1534 :1642`。

**5. 文档改法（三档 · 落笔权各有其主）**

| 档 | 改法 | 笔 | 状态 |
|---|---|---|---|
| `docs/core/design/MODEL-BENCH.md`（1,741 → **1,745 行** · +4） | ① §1.2 `:31` · §1.3 `:37` `:40` · §2.6 `:377` `:407`：`bench/cases/` → `bench/suites/`；② §3 文件清单加 `bench/check/**` 行，**验证方式整段重写**（零常驻测试口径 → 「评估工具自身的测试代码」口径 + 定位段）；③ §4 KD-2 / KD-11 / KD-55；④ §5.10 承载句 → 自检档 + dry-run + 真实跑批；⑤ §5.13 标题「测试承载」→「自检承载」、承载句、列头 `测试文件` → `自检档`、全表档名 `*.test.mjs` → `*.check.mjs`；⑥ §5.13 五则标题 + ①②；⑦ §6 逐行档名 / 命令（11 处 `node --test "bench/test/*.test.mjs"` → `node bench/check/run.mjs`）；⑧ §7-4（不是测试体系成员）；⑨ §7-19 / §7-23；⑩ §10 头注 · §10.2（冻结副本机检由 `check/probe.check.mjs` 承担）· §10.10 整段；⑪ §11.2 · §11.4 · §11.5 · §11.11 整段 | **本席（设计档笔）** | **已落盘**（实测：`bench/test` 0 命中 · `bench/cases` 0 · 旧夹具路径 0 · `零常驻/临时单元测试` 0） |
| `bench/README.md`（245 行） | `:76` `:91` `bench/cases/index.mjs` → `bench/suites/index.mjs`；`:241` 树行 `cases/` → `suites/`；`:229` 边界句 → 「不进 CI / 发布门 / 三端产物白名单；`bench/check/**` = 这套评估工具自身的测试代码（不是测试体系的单元 / 集成测试）——`node bench/check/run.mjs` 全跑」；`:243` 树行 `test/ 自检（手动跑，不进 CI）` → `check/ 评估工具自身的测试代码（node bench/check/run.mjs；不进 CI）`；目录树补 `suites/` 描述口径 | eng-coder（产品面） | 待实施 |
| `docs/core/requirements/TESTING.md:98` | **逐字建议（不落笔 · 三处逐字见 5-b）**：`**重建基线**：五仓存量测试已全清——`npm test` = 空清单零用例绿；集成测试集重建按 N8（最小可跑起步）＋ N19（规模窗口）＋ N20（三前端）。`bench/` 不进测试体系的两类定义面：bench 是对外部 provider 做性能评估的工具，`bench/check/` 是这套评估工具自身的测试代码（随工具常驻、不入本档两类测试），入口 = `node bench/check/run.mjs`。` | **主 agent（需求档笔）** | 待主 agent 落 |

**5-b. `TESTING.md` 的改法（父侧 #5 · 逐字建议 · 主 agent 笔）**

**取 (b)：把「归属面 = 批次目录」写成定义的构成要件**，不新立第三类。理由：§0 是 ISTQB ∕ IEEE 原文逐字 + 两点推论，立第三类等于把「不是测试」的东西写进测试分类学——与用户 07:26「这些自检档是产品代码，不是测试」相反；把归属写进定义则不动 §0、只收定义口。

- `:44`（§1.2 技法轴）现文 `- **单元测试** = 隔离测单个单元（依赖以桩 ∕ 假件替身）——回答「这一件对不对」；` → 追加：**此句是技法判据（必要非充分）**——还要归属面成立（见下「寿命轴」）才算单元测试。
- `:49`（§1.2 寿命轴）现文 `- **单元测试 = 开发期工具**：……不留「复跑旧件」面。` → 追加：**归属面是定义的构成要件**：单元测试件住批次目录（`docs/batches/`、名随批次档）；**不住批次目录的隔离测试代码不是单元测试**——它属于产品自身的测试面（产品代码、随工具常驻），不在本档两类测试的定义面内。
- `:98`（§2.1 重建基线）按上表建议落，措辞改为「`bench/check/` = 这套评估工具自身的测试代码（随工具常驻，不是本档两类测试）」。
- **§0 不动**（原文逐字 + 推论；缺的只是 §1.2 的归属要件）。

**5-c. `MODEL-BENCH.md` 记录面的历史命令（父侧 #6 · 取 (a)，标记提到章首）**

上一轮把 §6 的 11 行 AC 判定方式刷成了现行入口 `node bench/check/run.mjs`——那批验收时这条命令并不存在。**取 (a)「保留当时命令 + 加改名标记」，把标记提到章首一行**：

- 11 行逐行加注不取：`:1069`（405 字符）∥ `:1179`（406）会推过 450，`:1086`（284）也会破 300 字符线 ⇒ 新增 3 行超宽行。
- §5.13 表前一行：`**记录面说明**：本表为历史批次当时的用例读数；「自检档」列档名已按 2026-10-18 改名刷新为现行名（当时 = \`bench/test/*.test.mjs\`，改名后 = \`bench/check/*.check.mjs\`），用例与判定内容未改。`
- §6 表前一行：`**记录面说明**：本表为历史批次当时的验收读数；各行命令已按 2026-10-18 改名刷新为现行入口（当时 = \`node --test "bench/test/*.test.mjs"\`，改名后 = \`node bench/check/run.mjs\`），判定内容未改。`
- 笔 = **本席**（设计档笔）；本轮按父侧「写进设计、不直接改 MODEL-BENCH」执行 ⇒ **待父侧裁后落**。
- **与 AC-2 的接口**：这两行含旧路径字面 ⇒ AC-2 用 `改名后` 作豁免标记（豁免 ≤2 行，须列名）。

**6. 受影响文件与行数（现读数 = 本席实测；Δ = 预计）**

| 文件 | 现行 | Δ | 说明 |
|---|---|---|---|
| `bench/test/*` → `bench/check/*`（18 档） | 3,717 行 / 268,421 B | **±0 行 · 字节随字面增减（不设阈值）** | `git mv` + 同行 import / 注释字面替换；无逻辑改 |
| `bench/check/run.mjs` | 0（新增） | **+≈55 行** | 契约见 3. |
| `bench/cases/*` → `bench/suites/*`（10 档） | code 65 / index 68 / instructions 64 / json 66 / longctx 94 / manual 21 / multiturn 108 / reasoning 52 / tools 104 / vision 66 | ±0 | 仅每档头注 `:2` 一行 |
| `bench/run.mjs` | 310 | ±0 | 1 行 import |
| `bench/probe.mjs` | 310 | ±0 | 1 行 import |
| `bench/probe/fixtures.mjs` → `data.mjs` | 221 | ±0 | 头注 + 1 行冻结副本指针 |
| `bench/toolcall.mjs` | 262 | ±0 | 2 行 import |
| `bench/toolcall/fixture.mjs` → `data.mjs` | 148 | ±0 | 头注 + 1 行指针 |
| `bench/toolcall/cases.mjs` → `prompts.mjs` | 205 | ±0 | 头注 + 1 行 import |
| `bench/toolcall/variants.mjs` | 77 | ±0 | 1 import + 2 注释 |
| `bench/toolcall/report.mjs` | 233 | ±0 | 1 import |
| `bench/lib/*`（judge 278 · pipeline 289 · rejudge 133 · report-review 164 · report-tables 288 · report 214 · roster 76 · client 201） | — | ±0 | 各 1 行 import（`client.mjs:89` 1 行注释） |
| `bench/README.md` | 245 | ±0～+2 | 见 5. |
| `docs/core/design/MODEL-BENCH.md` | 1,745（原 1,741） | **+4** | 已落盘；读数单源 = 本行（`:397` 只留行宽读数） |
| `docs/core/requirements/TESTING.md` | 247 | ±0 | `:98` 一句改写（主 agent） |
| `bench/results/**` · 三产品包 · `package.json` · CI | — | **±0** | 零触 |

**测试覆盖（F9 行）**：本批不新增测试。验证 = ① `node bench/check/run.mjs` 全绿（15 档 / ≥116 例）；② 反查三判据的**阴性实测**（造未登记档 / 删清单档 / 空清单 ⇒ 各 exit 1 且点名）；③ 三个 `--dry-run` 全链（零网络 / 零花费）；④ 静态核查（名字面 / 旧路径 / 版本常量 / `bench/results` 零 diff）。

**7. 验收对照（机器可验 · 回指本批条目）**

| # | 判据 | 回指 |
|---|---|---|
| AC-1 | `bench/` 下文件名 / 目录名含 `test` 者 = **0**（判据 A 命令输出 `[]`） | 条目 ①（改名） |
| AC-2 | **旧名引用零留存（两面 · 七串类 · 一豁免）**：扫面 = `bench/**`（除 `bench/results/**`）+ `docs/core/**`；命中行中**不含 `改名后` 标记者 = 0**（豁免只容 `MODEL-BENCH.md` 记录面说明行，≤2 行且须列名；命令与排除面见 7-a） | 条目 ② |
| AC-3 | `node bench/check/run.mjs` exit 0；读数含 15 档且 `pass ≥ 116`；盘上 `.check.mjs` 数 = 15 = 清单项数 | 条目 ③ |
| AC-4 | **反查阴性用例**：① 临时加 `bench/check/x.check.mjs` ⇒ exit 1 + 点名；② 清单删一项 ⇒ exit 1 + 点名（node 静默忽略缺失档，故必须有此判据）；③ 清单置空 ⇒ exit 1 | 条目 ③ |
| AC-5 | 三条 `--dry-run` exit 0；`git status --porcelain bench/results` 空 | 回归 |
| AC-6 | 版本轴零变：`SUITE_VERSION` = 7 · `PROBE_VERSION` / `TOOL_PROBE_VERSION` 原值 · `judge.json.frozenAtSuiteVersion` = 7；`git diff --stat bench/results` 空（**提交前读**——单提交落地后恒空）；`toolcall/prompts.mjs` 的 14 条题面逐字未动（含 `tool.5` 的 `node --test` 载荷） | 条目 ④（内容零改） |
| AC-7 | `MODEL-BENCH.md` 现行面零 `bench/test` / `bench/cases` / 旧夹具路径；`bench/README.md` 同；`TESTING.md:98` 由主 agent 处置或登记未落 | 条目 ⑤ |
| AC-8 | 单提交（`git mv` + 同行替换 + 1 新档 + 文档）；`git revert` 整体回退；`git log --follow` 可追每档历史 | 回滚面 |

**7-a. AC-2 的机检命令与排除面（可逐字跑 · cwd = `thincoder/`）**

```powershell
$face = @(Get-ChildItem bench -Recurse -File | Where-Object { $_.FullName -notmatch '\\bench\\results\\' }) + @(Get-ChildItem docs\core -Recurse -File)
$paths = 'bench/test','bench/cases','bench/probe/fixtures\.mjs','bench/toolcall/fixture\.mjs','bench/toolcall/cases\.mjs','(^|[^A-Za-z0-9_./-])test/fixtures\.mjs'
$names = 'graders','judge','judge-fallback','metrics','preflight','probe','probe-report','probe-fixtures','recompute','report-present','report-render','roster','suite','timing','toolcall','toolcall-report','toolcall-fixtures','fixtures'
$pats = $paths + ('(^|[^A-Za-z0-9_-])(' + ($names -join '|') + ')\.(test|frozen)\.mjs')
$hits = $face | Select-String -Pattern $pats
"hits={0} exempt={1} residual={2}" -f $hits.Count, ($hits | Where-Object { $_.Line -match '改名后' }).Count, ($hits | Where-Object { $_.Line -notmatch '改名后' }).Count
```

**读法**：`residual = 0` 即过；`exempt` = 记录面说明行（≤2、须列名）；`hits` 全量留作复核。

**七串类**：① `bench/test` ② `bench/cases` ③ `bench/probe/fixtures.mjs` ④ `bench/toolcall/fixture.mjs` ⑤ `bench/toolcall/cases.mjs` ⑥ 裸 `test/fixtures.mjs` ⑦ 18 个旧档名的裸形（`<名>.test.mjs` ∕ `<名>.frozen.mjs`）。
⑦ 的前置边界是必需的：不带边界的 `[A-Za-z0-9_-]+\.test\.mjs` 在 `docs/core` 误命中 **316 行**（如 `thincoder-core/test/process-probe.test.mjs`、`test/__reverse-probe.test.mjs`）；加边界 + 枚举 18 名后 = **0**。

**排除面（逐项列明，不是「按实际排除」）**：

- `docs/batches/**` —— 过程档：本批映射表按构造必须写 18 个旧路径，他批档（`2026-10-18-prompt-residual-fixes.md:355` 等）也引旧名；批档可整批清理，不是状态面。
- `.thincoder/tmp/**` —— 运行期过程产物，不入仓。
- `bench/results/**` —— 在档报告数据（`cases` ∕ `fixtures` 是 JSON 键不是路径；本席实测 **0** 命中，留排除位防未来入档数据携旧串）。

**本席改前实测（先红）**：`hits=53 · exempt=0 · residual=53`，全部在 `bench/**`（`docs/core/**` = 0）；七串类逐项命中行数 = 19 ∕ 2 ∕ 2 ∕ 1 ∕ 1 ∕ 6 ∕ 30（同一行可被多串命中，逐项之和 61 > 去重 53）。

**8. 关键决策记录**

| # | 决策 | 备选与取舍 |
|---|---|---|
| K1 | 目录 `check/` + 后缀 `.check.mjs` | 备选 `selfcheck/`（太长）/ `.verify.mjs`（与 `--verify` 语汇撞）；`.check.mjs` 与 `*.test.mjs` 构词对称，一眼可读，且与 `lib/` 23 个 basename 全不同名 |
| K2 | `bench/test/fixtures.mjs` → **`helpers.mjs`**（偏离派单建议 `data.mjs`） | 实读 204 行：主体是沙箱 / CLI 驱动 / 回读 / 记录构造器 + 9 档共用 import，只有小半是夹具数据。叫 `data.mjs` ⇒ 与 `probe/data.mjs` / `toolcall/data.mjs` **三个同名不同物**，且名不副实；`helpers.mjs` 是平实描述式名，满足两条硬约束（`lib/` 无 `helpers.mjs`）。派单写明「建议形（可优化）」⇒ 取此 |
| K3 | `probe/fixtures.mjs` / `toolcall/fixture.mjs` → `data.mjs` | 台账 `#1648` 先前建议 `payloads.mjs` / `payload.mjs`——两档只差一个字母指两物，更差；两档各是自己 runner 的静态数据档 ⇒ `data.mjs` |
| K4 | 执行引擎保持 `node:test` | 备选「自写 runner」——多一份框架代码、输出更差；分类由归属 / 寿命判据定，不由引擎定（实测显式路径可跑） |
| K5 | `run.mjs` **双向反查 + 空清单拒绝** | 偏离各包 `test/run.mjs` 的空清单 = 绿：实测 `node --test` 对不存在的档静默忽略（exit 0、只跑 1 例）⇒ 单向反查会漏；bench/check 是常驻产品资产，变空 = 缺陷 |
| K6 | 18 档**内容零改** | 只改文件名 / 路径 / import 说明；`prompts.mjs` 的题面（含 `node --test` 那条载荷）逐字不动 ⇒ 三版本轴不 bump；`cases` / `fixtures` 作为结果 JSON 键也不动 |

**9. 边界（不做）**

- 不改任何被检逻辑 / 断言 / 题面 / 判据 / 夹具字面（只改文件名、路径、import 说明）。
- 不碰 `bench/results/**`（在档报告对）· 产品三包 · `package.json` · CI。
- 不新建测试；不把 `bench/check` 接进 `npm test` / CI / 发布门。
- 标识符改名随本批 fix 轮（`_setJudgeConfigPathForTest` 等 4 个 → `…ForCheck`，见 §2.13）；不改 `--cases` 旗标与 JSON 键。
- 不做 `MODEL-BENCH.md` 整档去历史（`#1647`）。

**10. 回滚面**

单提交；`git mv` 保 git 历史（`git log --follow` 可追）；`git revert <commit>` 整体回退到 18 档原路径。无 schema / 版本号 / 在档数据变更 ⇒ 无数据面回滚。

**11. 先例与勘察证据**

- **最近先例（对齐 / 偏离）**：① **runner 形态** = 各包 `test/run.mjs`（`thincoder-core/test/run.mjs:22-39`：单层收集 + 逆查 + 软链目录拒绝）——**对齐**同一手法；**偏离** = 双向反查 + 空清单不绿（K5，理由 = 实测 node 静默忽略缺失档）。② **改名形态** = `#1648` 的撞词收敛建议（`cases/`→`suites/` 等）——**对齐**方向；**偏离** = `fixtures`→`helpers`（K2）。③ **文档口径** = 2026-09-28 全清基线的「空清单 = 绿」——**偏离**：那是包级 `npm test` 的重置产物，不是 `bench/check` 的终态（K5）。④ **定位先例** = `thincoder-server/src/agent/model-test.mjs`（「模型测试执行器」——产品功能、命名误导但保留，§1 保留面）——本批与其同判：**功能归功能，名字归名字**。
- **勘察证据**：查了 ① `docs/README.md:81`（`MODEL-BENCH.md` 在 `core/design/` 登记表内，路径不变 ⇒ 地图零改）；② `bench/README.md` 全档（`:229` / `:243` / `:76` / `:91` / `:241` 五处）；③ `docs/core/design/MODEL-BENCH.md` 全档 1,741 行（现行面 + 记录面逐处定位）；④ `docs/core/requirements/TESTING.md` §0 / §1 / §2（定义与寿命判据）；⑤ 全仓 `**/*.{mjs,cjs,js,json,yml,yaml,sh,ps1,md}` 对 `bench/(cases|test|probe/fixtures|toolcall/fixture|toolcall/cases)` 的扫描（`bench/` 自身 + `docs/` 命中，`.thincoder/tmp/**` 为过程产物）；⑥ 三个 runner 的 `--dry-run` 实读（`run.mjs:45` · `probe.mjs:39` · `toolcall.mjs:39`）。**公开源档**：工作区外参考系（`D:\ref\`）不入索引、与本仓命名无契约关系 ⇒ **none relevant**。

**12. 上抛 / 知会**

- **[上抛·知会]** 上段「18/18 全删」设计（含 §2.3 集成面论证 / §2.4 回归价值评估 / K1–K5）**由用户 07:24 改判作废**；本段为现行设计。§1 的「全仓测试面清理」其余部分（父侧 16 文件直接执行）不受影响。
- **[知会]** 他批自担 ⑥ 收正：`docs/batches/2026-10-18-prompt-residual-fixes.md:351`（6.6）已写「断言随改名落在 `bench/check/probe.check.mjs:104`，⑥ 同轮收正」；AC-14（`:451`）= 四条机检真判据（改名后在盘 ∧ `missing mandatory field` 零命中 ∧ round 行为断言在盘 ∧ 单档跑绿），不再以「`bench/test/` 空」为前置。⇒ **本批只需保证改名先落**；⑥ 的断言收正由该批同轮完成，本批不代改。
- **[知会]** 测试缝导出名 `_setJudgeConfigPathForTest` 等 4 个——用户 2026-10-18 08:03 裁定改名 `…ForCheck`；已入本批 fix 轮（§2.13）。
- **[上抛·知会]** `bench/lib/preflight.mjs`（跑批预检 vs 自检）与 `bench/probe/` 两处撞词（`#1648` 低严重度）不在本批四项内，未处置。
- **[上抛·知会]** `#1646`（两处源码注释死指针）由本批 B/C 两项**一并收正**（`probe/data.mjs:5` · `toolcall/data.mjs:5`）⇒ 实施后可核销。
- **[上抛·知会]** `#1647`（MODEL-BENCH 记录面去历史 19 行 + 57 行超宽）不属本批：本批只把记录面的档名 / 命令**刷新到可解析**，不删历史行。

**§2 内参（本段自足的节号 · 读上一段用）**：0 定位判定 · 1 18 档映射表 · 2 零 `test` 判据 · 3 `run.mjs` 契约 · 4 四项撞词引用点 · 5 文档改法（5-b / 5-c）· 6 受影响文件 · 7 验收对照（7-a 机检命令 / 7-b 用例表）· 8 关键决策（K1–K6）· 9 边界 · 10 回滚面 · 11 先例与勘察 · 12 上抛 · 13 `ForTest` → `ForCheck` 缝名收敛（fix 轮）。上段正文里两处短指针按此读：「见 2.3」= 第 **3** 节（`run.mjs` 契约）；「2.3-K2」= 第 **8** 节 **K2**。

**§2 读数收正（本席复读实测）**：上段「目录深度不变（`dirname(dirname(import.meta.url))` 仍 = `bench/`——`graders:23` / `roster:20` / `suite:19` / `toolcall:44` 四处）」一处偏一——`BENCH_DIR = dirname(dirname(fileURLToPath(import.meta.url)))` 实为 **3 处**（`graders.test.mjs:23` · `roster.test.mjs:20` · `suite.test.mjs:19`），`toolcall.test.mjs:44` 是 `readJson` 不是 `dirname`；结论不变：`bench/test/` → `bench/check/` 深度相同（同为 `bench/` 下一层），3 处 `BENCH_DIR` 全部无需改。

**§2 行宽读数（复测）**：`MODEL-BENCH.md` 的行数以 6. 表为准（**1,745**）；本行只留行宽读数——本批新增超 300 字符行 = **0**（存量 57 行为既存债，未增）。

**7-b. 用例表（正常 / 边界 / 错误 · 输入 → 期望）**

| 类 | 输入 | 期望 |
|---|---|---|
| 正常 | `node bench/check/run.mjs`（15 档全在盘、清单齐） | exit 0；`tests ≥ 116` · `fail 0` |
| 正常（单档 · 证明文件名无需带 `test`） | `node --test bench/check/suite.check.mjs` | exit 0（实测形态：显式路径 + `.check.mjs` 可跑） |
| 边界（盘上多档） | 临时放 `bench/check/<x>.check.mjs` 不登记 | exit 1 + 点名「未登记」 |
| 边界（清单缺档） | 临时移走 `bench/check/roster.check.mjs`（清单不动） | exit 1 + 点名「不在盘」（node 自身会静默忽略 ⇒ 必须由 `run.mjs` 抓） |
| 错误（空清单） | 清单置空 | exit 1（不是空绿） |
| 错误（自检红） | 登记一个 `assert.equal(1, 2)` 的临时档 | exit 1（`node --test` 语义，实测） |
| 正常（内容零改） | `git diff bench/results` · 三版本常量实读 | results 零 diff；`SUITE_VERSION` = 7 等原值 |
| 边界（路径自洽） | `git log --follow bench/check/judge.check.mjs` | 能追到改名前的历史（`git mv` 语义） |

**8-b. UI / 交互决策**：不适用（本批无 UI / 交互面；唯一用户可见面 = README 的跑法句，见 5.）。

**§2 修复轮（advisor#141 收口 · 2026-10-18 · 父侧 07:48 口径）**

- **判据 C 改单源指针（取 (b)）**：原行（扫面 `docs/**`、排除面 = `.thincoder/tmp/**` + 他批批档、5 串、期望 0）与 AC-2 / 7-a（扫面 `bench/**` 除 `bench/results/**` + `docs/core/**`、七串类、排除面三项）两处两说 ⇒ 按父侧「二者择一」删原面：C 行只指 §7 AC-2 / 7-a，扫面 / 串表 / 排除面 / 期望值全部单源。理由 = 同一判据两处并存是漂移源（本轮判据 C 与 AC-2 不同面即此）；`bench/results/**`（产品输出面）保持在 7-a 排除面内。
- **定位判定段按 07:48 口径重写（`:223`–`:233`）**：`bench` = 对外部 provider 做性能评估的工具——输入 = 题集 · 处理 = 判分器 / 计时 / 成本 · 输出 = `bench/results/` 评估报告（**产品输出**，不是运行期残留）；`bench/check/` = 这套评估工具自身的测试代码，随工具常驻；§1 `:65` 所记三个已废词在本段零出现。
- **三个已废词（§1 `:65` 所指）§2 归零**：改前 §2 实扫 = **9 行 / 10 处**（`:225` `:300` `:342` `:343`×2 `:344` `:348` `:351` `:352` `:450`，行号为改前现盘；父侧派单列 6 处系旧快照行号，仅 `:342` 重合）→ 改后 = **0**。全文剩余 = §1 `:65`（3 处，主 agent 的更正记录，非本席笔）· §3 `:531` / `:558`（各 1 处，评审记录面）。
- **档级读数（终态）**：本档 **566 → 575 行**（+2 = 定位段 1 行扩为 3 行；+7 = 本块）；§2 = `:73`–`:490`（418 行）；判据 C 行 = `:289`；run.mjs 目的行 = `:302`；文档改法三行 = `:344` / `:345` / `:346`；5-b 各行 = `:350` / `:353` / `:354`；先例行 = `:452`。

### 措辞清理轮（2026-10-18 · 父侧 07:48 口径落 `MODEL-BENCH.md` / `docs/README.md` · round = fix）

**依据**：用户 2026-10-18 07:48 三处更正定下的口径（§1 `:54`–`:65` 已记）——`bench` = 对外部 provider 做性能评估；输入 = 题集 · 处理 = 判分 · 输出 = `bench/results/` 评估报告 = **产品输出**；`bench/check/` = **这套评估工具自身的测试代码**。`产品自检 / 自检码 / 自检档 / 自检承载 / 自检面` 是父侧发明、用户否定的错词。

**本单条目（覆盖 2 条）**：① `MODEL-BENCH.md` 禁用词清零（改前实测 13 行 / 17 处复合词）；② 定位句两处（`MODEL-BENCH.md:10` · `docs/README.md:81`）改为「独立评估面 · 产物 = 产品输出」。**机制 / 判据 / 用例 / 读数零改**。

**改法（单源样板 = `bench/README.md:229`「这套评估工具自身的测试代码」）**：`产品自检码` → `测试代码` · `自检档` → `测试档` · `自检承载` → `测试承载` · `自检面` → `测试面` · `自检策略` → `测试策略` · `自检侧` → `测试侧`。

**逐行处置（改后行号 / 改后原文片段）**

| 行 | 改后原文（该行现行） |
|---|---|
| `MODEL-BENCH.md:10` | 本设计落 `bench/`（**独立评估面**：对外部 provider 做性能评估，不打包进三端产品）：输入 = 题集 · 处理 = 判分器 / 计时 / 成本 · 输出 = `bench/results/` 评估报告（**产品输出**），一次建设、长期沿用。 |
| `:390` | …`build().followUps` 各条须逐字包含，由 `check/` 机检防漂移…（`自检机检防漂移` → `由 check/ 机检防漂移`） |
| `:683` | `bench/check/**` ｜ 这套评估工具自身的测试代码（判分器 / 判官与级联 / 报告渲染与重算 / 探针三层同源 / 数据面 schema / 版本轴单源）——`run.mjs` = 一条命令全跑 + 清单双向反查 |
| `:686` | **验证方式（本套件的测试面）**： |
| `:688` | `bench/` 是产品——性能评估是它的产品功能，`bench/check/` 是它的**测试代码**。… |
| `:690` | - **测试代码（常驻 · 零网络 · 零 API 花费）**：`node bench/check/run.mjs` 一条命令全跑——… |
| `:697` | 测试侧的冻结副本住 `check/probe-frozen.mjs` / `check/toolcall-frozen.mjs`——运行面副本 ↔ 冻结副本的逐字等值由 `check/` 内测试档机检；设计档正本层 = 写定时逐字纪律。 |
| `:714` | KD-11 ｜ **`bench/check/**` = 这套评估工具自身的测试代码，不是测试体系成员**——随 bench 常驻、不进 CI / 发布门（AC-8）；… ｜ ① 这套测试代码抓的是「判分器 / 报告 / 探针口径被改坏」…它就是改动面的反馈回路；② …；③ 测试代码不进任何门 ⇒ 不额外占用别人的跑测预算 |
| `:933` | ### 5.13 判官 / 复核 / 题面面用例（测试承载 · §2.10 / §2.11 / §5 题面列口径） |
| `:935` | **验证方式**：本组用例由 `bench/check/` 的对应测试档承载（下表末列；`node bench/check/run.mjs` 全跑），另由 `--dry-run` 全链… |
| `:937` | ｜ id ｜ 类 ｜ 输入 ｜ 期望与判据 ｜ 测试档 ｜ |
| `:990` | 测试策略五则（冻结）：① **测试不得依赖真网络**——判官面一律桩传输…② …（与运行面副本的等值由 `check/` 同源测试档机检）… |
| `:1014` | … ｜ `report.1` / `report.2` + 真实跑产物核查 ｜（动词义，非 bench/check 面） |
| `:1164` | … ｜ **分段**：实施轮 = 单元测试（根检查 / 物化 / diff 三态 / 清运）；…（同上） |
| `:1200` | 4. 不进 CI / 发布门 / 三端产物白名单；bench **不是测试体系成员**——`bench/check/**` = 这套评估工具自身的测试代码（随 bench 常驻；`node bench/check/run.mjs` 全跑），验证 = 测试代码全跑 + 各 runner 的 `--dry-run` + 真实跑批。 |
| `:1510` | ② 沙箱**仓外**（系统临时根下——与真实仓隔离）+ **非 git 仓**（物化前检查：沙箱根向上无 `.git`——破则报基建错误；…）（同上） |
| `:1515` | - **测试代码（零网络 · 零 API 花费）**：`node bench/check/run.mjs`——`probe.check.mjs` 覆盖… |
| `:1742` | - **测试代码（零网络 · 零 API 花费）**：`node bench/check/run.mjs`——`toolcall.check.mjs` / `toolcall-report.check.mjs` 覆盖… |
| `docs/README.md:81` | `MODEL-BENCH.md`（模型基准测试套件——独立评估面的设计档：对外部 provider 做性能评估，产物 = `bench/results/` 评估报告 = 产品输出，不打包进三端；2026-09-23 建档） |

**父侧清单 13 行全部落笔；另 4 行是本席全文复扫所得**（`:390` check 面单字「自检」；`:1014` / `:1164` / `:1510` 动词义「自检」）。父侧报「需改 15 行」，本席实测复合词 = **13 行 / 17 处**（`:697` 两处、`:714` 四处、`:990` 三处、`:1200` 两处），计数差 2 = 按处计数与按行计数的口径差；读数以本表为准。

**保留「自检」的 8 行（逐类登记，非本单笔）**：`:617` `:873` `:875` `:955` `:999` = 题面里的「自检块」（被测模型 / 作者自检块——引语内容，另有其物）；`:973` = dry-run 夹具覆盖自检（dry-run 语境）；`:1498` `:1720` = `--dry-run` 行的「零网络自检」（dry-run 语境）。

**先例 / 勘察证据**：措辞样板 = `bench/README.md:229`「`bench/check/**` = 这套评估工具自身的测试代码（不是测试体系的单元 / 集成测试）」（父侧点名的正确口径样板，本节逐字对齐）；地图登记行 = `docs/README.md:81`（结构 / 档数不动，只改描述）；定位口径原句 = `MODEL-BENCH.md:10` 改前「**仓级工具**，不进三端产品」。公开源档 = 工作区外参考系（`D:\ref\`）不入索引、与本档措辞无契约关系 ⇒ **none relevant**。

**受影响文件（实测读数 · 改前 = 改后）**

| 文件 | 行数 | `##` | `###` | 超 300 字符行 | 变更 |
|---|---|---|---|---|---|
| `docs/core/design/MODEL-BENCH.md` | 1,746（split）/ 1,745（wc 口径） | 17 | 63 | 57 | 17 行措辞 / 定位句（±0 行） |
| `docs/README.md` | 107 | 5 | — | 1 | `:81` 一行描述（±0 行，档数与登记表结构不动） |

**验收对照（机器可验）**

| # | 判据 | 回指 |
|---|---|---|
| AC-9 | `产品自检` / `自检码` / `自检档` / `自检承载` / `自检面` / `自检策略` / `自检侧` 在 `MODEL-BENCH.md` 各 = 0（实测：七项全 0）；单字 `自检` 只剩 8 行且逐行有语境（上表） | 条目 ① |
| AC-10 | `MODEL-BENCH.md:10` 含「独立评估面」「产品输出」，且全文 `仓级工具` = 0；`docs/README.md:81` 含「独立评估面」「评估报告 = 产品输出」「不打包进三端」 | 条目 ② |
| AC-11 | 档级读数不变：`MODEL-BENCH.md` = 1,745 内容行 / `##` 17 / `###` 63；`docs/README.md` = 107 行 / `##` 5 | 不动结构 |
| AC-12 | 无新增超 300 字符行（57 → 57；本单最长改动行 = `:714` 289 字符）；机制 / 判据 / 用例 / 读数零改（无 `SUITE_VERSION` / 版本轴 / `bench/results` 触面） | 措辞面 |

**关键决策**

| # | 决策 | 备选与取舍 |
|---|---|---|
| K7 | 「测试代码」逐字取 `bench/README.md:229` 的样板措辞 | 备选「测试代码（评估工具）」自造后缀——否决：样板已在盘且父侧点名照它 |
| K8 | KD-11 的「不是测试」改为「不是测试体系成员」 | 原句在旧词下成立（产品自检码 vs 测试）；换成「测试代码」后字面自相矛盾 ⇒ 补出省略语，语义不变 |
| K9 | 「自检块」等 8 行保留 | 它们是题面引语 / dry-run 语境 / 动词义，不是 bench/check 的命名；改它们等于改用例文字或历史读数 |

**边界（不做）**：不碰 `bench/**`（`eng-coder#144` 在改）· `docs/core/requirements/**` · 本批档 §1 / §3 · `docs/README.md` 的档数与登记表结构；不改任何机制 / 判据 / 用例 / 读数；不把「自检」在 `bench/README.md` 的 `--dry-run`「夹具自检」改掉（语义正确）。

**上抛 / 知会**：**[上抛·知会]** 父侧「15 行」与本席实测「13 行 / 17 处」的计数差已登记（上表）；**[上抛·知会]** `bench/README.md:229` 的「这套评估工具自身的测试代码」是本轮样板，`bench/**` 本单未动。

**本块读数收正（同席 · 实读 · 防计数口径漂移）**：本单 `MODEL-BENCH.md` 实改 **18 行** = 措辞体 **17 行**（父侧清单 13 行 + 本席全文复扫 4 行 `:390` / `:1014` / `:1164` / `:1510`）+ 定位句 `:10`；`docs/README.md` 1 行（`:81`）。上表 19 行 = 18（MODEL-BENCH）+ 1（README）。「改前 17 处复合词」的口径 = **七个禁用词逐项计命中行之和**（同一行可被两个模式命中：`:683` / `:714` / `:1200` 各计 2）；单字 `自检` 的改前命中 = **25 行**，改后 = **8 行**（逐行语境见上表）。

### §2.13 `ForTest` → `ForCheck` 缝名收敛（fix 轮 · 用户 2026-10-18 08:03 裁定）

**依据**：用户 2026-10-18 08:03「改名 …ForTest 也要做」。`bench/lib/` 的 4 个缝服务的是 `bench/check/`（这套评估工具自身的测试代码），不是本项目的单元测试体系——**是双向消费**：34 处里 10 处在产品 runner 的参数落点（`run.mjs:289-290` · `probe.mjs:278-279` · `toolcall.mjs:228`——`--judge-config` / `--prices` 经入口落到同一个缝；`CONFIG.md:131` 自标「② 参数 / ③ 缝」）；后缀 `ForTest` 会让下一个读者把它们读进测试策略的射程。本节取代 §2 改判轮段「**2. 零 `test` 判据**」残差登记第 2 条、「**9. 边界（不做）**」的标识符条、「**12. 上抛 / 知会**」第三条的「本批不动」判断。

**本单条目（覆盖 1 条）**：4 个导出标识符 `…ForTest` → `…ForCheck`（行为零改）+ `docs/core/design/CONFIG.md` §6.2 名录同步。**实施 = eng-coder；本节只出设计与逐字建议。**

**1. 映射表（4 条 · 旧 → 新）**

| # | 旧 | 新 | 定义点（现行行） |
|---|---|---|---|
| 1 | `_setJudgeConfigPathForTest` | `_setJudgeConfigPathForCheck` | `bench/lib/judge.mjs:38` |
| 2 | `_resetJudgeConfigPathForTest` | `_resetJudgeConfigPathForCheck` | `bench/lib/judge.mjs:39` |
| 3 | `_setPricesPathForTest` | `_setPricesPathForCheck` | `bench/lib/prices.mjs:29` |
| 4 | `_resetPricesPathForTest` | `_resetPricesPathForCheck` | `bench/lib/prices.mjs:30` |

**命名理由**：`ForCheck` 与目录 `bench/check/`、后缀 `.check.mjs` 同属一个语汇（评估工具自身的测试代码）；`ForTest` 在本仓已固定指 `thincoder-core/**` 的真测试缝——同名不同义就是误认源。

**2. 引用点全清单（实扫：代码 30 行 / 34 处 + 文档 1 行 / 4 处）**

| 文件 | 现行行数 | 行 | 处 | 形态 |
|---|---|---|---|---|
| `bench/lib/judge.mjs` | 278 | `:38` `:39` | 2 | 定义（导出） |
| `bench/lib/prices.mjs` | 160 | `:29` `:30` | 2 | 定义（导出） |
| `bench/run.mjs` | 310 | `:26` `:27` `:289` `:290` | 4 | import ×2 · 参数应用 ×2 |
| `bench/probe.mjs` | 310 | `:14` `:16` `:278` `:279` | 4 | import ×2 · 参数应用 ×2 |
| `bench/toolcall.mjs` | 262 | `:16` `:228` | 2 | import ×1 · 参数应用 ×1 |
| `bench/check/judge.check.mjs` | 297 | `:13` `:88` `:93` `:103` `:104` | 6 | import ×1（双名）· 置缝 ×2 · 复位 ×2 |
| `bench/check/judge-fallback.check.mjs` | 230 | `:11` `:177` `:228` | 4 | import ×1（双名）· 置缝 ×1 · 复位 ×1 |
| `bench/check/preflight.check.mjs` | 137 | `:16` `:127` `:135` | 4 | import ×1（双名）· 置缝 ×1 · 复位 ×1 |
| `bench/check/recompute.check.mjs` | 167 | `:10` `:91` `:93` `:149` `:151` | 6 | import ×1（双名）· 置缝 ×2 · 复位 ×2 |
| `docs/core/design/CONFIG.md` | 201 | `:131` | 4 | ③ 缝名录（命名 / 成对例外行） |

- **全仓实扫（四个旧名）**：只命中上表 10 个文件；`thincoder-core` / `thincoder-cli` / `thincoder-vscode` / `thincoder-desktop` / `thincoder-server` / `thincoder-render-core` / `MODEL-BENCH.md` / `bench/README.md` = **0**。无 `export *` 再导出、无字符串拼接引用。
- **测试面只有 4 档消费**：judge / judge-fallback / preflight / recompute；其余 11 档不涉。
- **域外零引用（如实核对）**：`setResultsDirForTest` / `resetResultsDirForTest` 全仓 **0**（不存在）；`bench/results` 目录相关缝 = `setResultsDir`（`bench/lib/output.mjs`，无 `ForTest` 后缀）——**不动**。

**3. 语义边界（只改名，不改行为）**

- 函数体逐字不动：`_judgeConfigPath = resolve(p)` / `= null`；`_pricesPath = resolve(p)` / `= null`。
- 成对性不变（set / reset 两半）；读点 `_x ?? 默认` 不变（`bench/lib/judge.mjs:35` · `bench/lib/prices.mjs:26`）。
- 参数名 / 旗标不动：`--judge-config` / `--prices`；`run.mjs:289-290` · `probe.mjs:278-279` · `toolcall.mjs:228` 只换函数名。
- **`CONFIG.md` 逐字建议（eng-coder 落笔 · 两处）**：③ 通道的命名形是 `_set<名>ForTest(v)` / `_reset<名>ForTest()`（`CONFIG.md:108`），这 4 个改叫 `ForCheck`，须登记为命名例外。
  1. `:131` 名录行：4 个旧名原地换新名（`…ForCheck`）——该行 280 → 284 字符，不破 300 线；**行末加短标记 `（命名例外）`**（284 → 290，仍 ≤300）——`CONFIG.md:108` 的规矩是「命名 / 成对例外 = **逐行**标于名录」，`:130` 自身即行内标记 + 指针形态；只落 `:134` 会让只看名录行的人无从察觉例外。
  2. `:134` 混合形行的例外登记末追加**完整理由**：`；bench 判官 / 价格表四缝 \`…ForCheck\` → 命名例外〔评估工具自身的测试代码面〕`（`:131` 只放短标记，完整理由住此处；与 `:130` 的「短标记 + 指针」形态同构）。
  （状态档不指过程档：两处都不引用本批档。）
- 中文注释里的「测试夹具」字样**不动**（只改标识符面，不改注释措辞）。

**4. 判据（可机检 · cwd = `thincoder/`）**

```powershell
$face = @(Get-ChildItem bench -Recurse -File | Where-Object { $_.FullName -notmatch '\\bench\\results\\' }) + @(Get-ChildItem docs\core -Recurse -File)
$old = '_setJudgeConfigPathForTest|_resetJudgeConfigPathForTest|_setPricesPathForTest|_resetPricesPathForTest'
"old_identifier_hits={0}" -f @($face | Select-String -Pattern $old).Count
$bench = Get-ChildItem bench -Recurse -File | Where-Object { $_.FullName -notmatch '\\bench\\results\\' }
"bench_ForTest_lines={0}" -f ($bench | Select-String -Pattern 'ForTest' | Measure-Object).Count
# 注：PS 5.1 的 Get-Content -Raw 默认按系统代码页解码，读 UTF-8 中文成乱码 ⇒ 中文字串判据恒 0（假红；eng-coder#149 实测）——本块统一显式 -Encoding UTF8
$cfg = Get-Content docs\core\design\CONFIG.md -Raw -Encoding UTF8
$new = '_setJudgeConfigPathForCheck','_resetJudgeConfigPathForCheck','_setPricesPathForCheck','_resetPricesPathForCheck'
"cfg_new_names={0}" -f @($new | Where-Object { $cfg.Contains($_) }).Count
"cfg_exception_line={0}" -f @($cfg -split "`n" | Where-Object { $_ -match '命名例外' -and $_ -match 'ForCheck' }).Count
node bench/check/run.mjs
```

期望：`old_identifier_hits=0` ∧ `bench_ForTest_lines=0` ∧ **`cfg_new_names=4`** ∧ **`cfg_exception_line>=1`** ∧ runner exit 0 ∧ 汇总行 **`bench/check: 116 passed, 0 failed`**（**恰 116，不许多不许少**；形随 §2.14 引擎更换，数值口径不变）。

**后两条是正向判据（父侧 2026-10-18 复审补 · 评审 #147 🟡-2）**：`old_identifier_hits=0` 只是缺席判据——把 4 个旧名从 `CONFIG.md:131` 整段删掉也照样绿，名录内容会静默丢失。正向两条咬住「新名确实进了名录」∧「例外确实登记了」，与缺席判据合取才算过。

**改前实测（先红 · 本席亲跑）**：`old_identifier_hits=31`（`bench/**` 30 行 + `docs/core/**` 1 行）· `bench_ForTest_lines=30` · runner `tests 116 · pass 116 · fail 0`（exit 0）。

- **判据口径（防假红）**：`docs/core/**` 的**裸 `ForTest`** 改后仍有 **126 行**——那是 `thincoder-core/**` 真测试缝的名录与 ③ 通道的模板形（`CONFIG.md:108` `:111` `:123` `:124` `:129` 等），按第 5 号禁止面**不得动**。⇒ 本项判据是**标识符面**（4 个旧名 = 0），不是「`ForTest` 字面 = 0」——后者在本仓永远不成立。派单原文的「`ForTest` = 0」按此口径执行。

**5. 禁止面（不做）**

- 不动 `thincoder-core/**` **等其它模块**（`thincoder-cli` / `thincoder-vscode` / `thincoder-desktop` / `thincoder-server` / `thincoder-render-core`）的其它 `ForTest`（真测试缝，另属项目测试体系；`API-CONTRACT.md:261` / `:427` / `:2512` / `:3999` 有实例）。
- 不动 `setResultsDir`（`bench/lib/output.mjs`——参数应用与测试缝共用，名录已标命名 / 成对例外；无 `_reset` 半）。
- 不动 `bench/results/**`（产品输出）· `MODEL-BENCH.md` · `TESTING.md` · `bench/README.md`。
- 不改行为 / 断言 / 题面 / 参数名 / 结果 JSON 键；不新增测试。

**6. 与「零 `test` 名字面」判据的接口**

7-a 的 AC-2 扫**路径 / 文件名面**（七串类：`bench/test` · `bench/cases` · 旧夹具路径 · 裸 `test/fixtures.mjs` · `<名>.test.mjs` / `.frozen.mjs`）——4 个标识符既不是路径、也不含 `.test.mjs` 字面 ⇒ **AC-2 不覆盖本项**（改前改后都不命中）。本项须独立判据（第 4 号）；两面不重叠、不互为豁免。

**7. 用例表（正常 / 边界 / 错误）**

| 类 | 输入 | 期望 |
|---|---|---|
| 正常 | 4 个旧名全换新名（定义 + 全部引用点） | `node bench/check/run.mjs` exit 0 · pass 116 |
| 边界 | 只改定义与 import、漏一个调用点 | ESM 具名导出缺失（`does not provide an export named …`）⇒ runner exit 非 0（自抓，不静默） |
| 错误 | 新名拼写漂移（如 `…ForChecked`） | 同上——档即红 |

**8. 回滚面**：纯标识符改名，10 个文件 / 32 行（代码 30 行 + `CONFIG.md` `:131` `:134` 两行；不改行数）；无行为 / schema / 版本轴 / 数据变更 ⇒ 单提交可 `git revert`。字节面：`bench/**` 34 处 × +1 B（`Test` 4 → `Check` 5）= **+34 B**；`CONFIG.md` 改名 +4 B + 短标记 `（命名例外）` +18 B = **≈+22 B**（另加 `:134` 理由句，措辞随落笔，不设阈值）。

**9. 先例与勘察证据**

- **最近先例**：③ 进程内 setter 缝的形态先例 = `thincoder-core/config-io.mjs:37-42`（`_setConfigPathForTest` / `_resetConfigPathForTest` + 模块级 `_configPath`）——**对齐**：set / reset 成对、模块级 `let`、读点 `??` 回落；**偏离**：后缀 `ForCheck`——理由见第 1 号（bench/check 面与 `ForTest` 的既有指向不同）。
- **勘察证据**：查了 ① `CONFIG.md` §6.2 通道定义与名录（`:108` `:111` `:131`）；② `docs/core/design/API-CONTRACT.md` 的 `ForTest` 名录（其余均属核 / 端侧真测试缝，不改）；③ 全仓四个旧名的实扫（10 个文件，见第 2 号）；④ `bench/results/**` 实扫 = 0。**公开源档**：工作区外参考系（`D:\ref\`）不入索引、与本仓命名无契约关系 ⇒ **none relevant**。

**10. 档级读数（本席实测）**：本档改前 = **728 行 / 106,755 B**；本节追加后 = **820 行 / 115,609 B**（+92 行 / +8,854 B）；口径 = 文件内 `\n` 计数（`nl` 口径）。受影响文件行数见第 2 号表（改名不增删行）。

### §2.14 引擎面去 `test`：自写 harness 替代 Node 内置测试运行器（fix 轮 · 用户 2026-10-18 08:12 裁定）

**依据**：用户 08:12「改掉」+ 08:11「执行程序的方式有那么多种，为啥要用这个」。§2 改判轮已清文件 / 路径面的 `test`；`node --test` 打的 `ℹ tests 116 · pass 116 · fail 0` 是**引擎面**最后一处，且那行由 Node 生成、我们改不了 ⇒ 换执行外壳。**本节只出设计；实施 = eng-coder。**

**先红读数（本席 2026-10-18 08:1x 亲跑 / 亲扫 · cwd = `thincoder/`）**
- `node bench/check/run.mjs` → exit 0；尾部实读 `ℹ tests 116 · ℹ suites 0 · ℹ pass 116 · ℹ fail 0 · ℹ duration_ms 7416`（引擎面残留；`duration_ms 7416` = 旧引擎在单进程内的汇总读数，不是逐档 spawn 之和）。
- 15 档裸 `test(` 调用 = **116**（逐档：graders 14 · judge 15 · judge-fallback 6 · metrics 9 · preflight 3 · probe-report 4 · probe 9 · recompute 6 · report-present 7 · report-render 10 · roster 7 · suite 14 · timing 3 · toolcall 6 · toolcall-report 3）。
- `after(` = **7**（父侧派单写 6；本席实扫 7）：`helpers.mjs:21` · `preflight.check.mjs:25` · `probe-report.check.mjs:21` · `probe.check.mjs:32` · `roster.check.mjs:33` · `toolcall-report.check.mjs:24` · `toolcall.check.mjs:33`（7 处全部为 `rmSync` 临时目录清运）。
- `node:test` import = **11 处**（10 个 `.check.mjs` + `helpers.mjs`）。
- `bench/check/**/*.mjs` 内 `AC-\d+` = **61 处 / 50 行**（父侧派单写 19 处；拆面见第 4 号）。
- `describe(` / `before(` / `beforeEach(` / `afterEach(` / `.skip(` / `.todo(` / `.only(` / `concurrency` / `timeout:` = **各 0**；`t.` 14 处全为局部变量（`timing.check.mjs:41-44` 计时夹具、`toolcall.check.mjs:50` map 形参等），`test(` 回调形参为 `t` = 0。
- 16 处 `.test(` 是 `RegExp.prototype.test` 成员调用（如 `judge.check.mjs:115` `/…/.test(w)`）⇒ 判据 ② 必须按**裸调用形**计数（负向后行断言排除 `.`）。

**1. harness 契约（`bench/check/harness.mjs` · 新增 · 非 `*.check.mjs` ⇒ 不进 run.mjs 清单）**

| 面 | 契约 |
|---|---|
| 导出 | `check(name, fn)` · `after(fn)` · `run()`（导出名用 `check`，不用 `test`） |
| 收集 | `check` 只入队（登记顺序）；`fn` 同步 / 异步同形 |
| 执行 | `run()` 按登记顺序串行 `await fn()`；单条失败 ⇒ 记录 + 继续下一条（与旧引擎同） |
| 输出（逐条） | `ok <i> - <name>`（stdout）；失败 = `FAIL <i> - <name>` + 缩进 stack（stderr），`i` = 档内 1 起序号 |
| 输出（汇总） | 每档恰一行 `bench/check: <P> passed, <F> failed`（stdout） |
| 退出码 | `F > 0 ⇒ process.exitCode = 1`；否则 0 |
| `after` | 收尾按登记顺序 await；异常吞掉（stderr 一行 `after 清理异常（不影响主结果）：…`），不改主结果 / 退出码 |
| 单次性 | `run()` 只执行一次（再次调用 = no-op） |
| 漏调保护 | `beforeExit` 时未执行且队列非空 ⇒ 报错行 + `process.exitCode = 1`（fail-closed） |
| 不做 | TAP · 单例超时 · `describe` 嵌套 · 并发调度 · `t` 上下文 · 用例过滤 / `.only` |
| 注释面 | **J1/J2 扫面内的所有文件、所有注释**（含 `harness.mjs` / `run.mjs` 的头注与行内注释）**不得**出现 `node:test` 字面或裸 `test(` 形态（否则 J1 / J2 自红；替代说明写「旧引擎」即可） |

**2. 15 档改动清单**（逐档：import 面 · 档末 · Δ 行；`test(` → `check(` 全档同规则）

| # | 文件 | 现行行 | `test(` | import 改法 | 档末 | Δ 行 |
|---|---|---|---|---|---|---|
| 1 | `graders.check.mjs` | 278 | 14 | `:10` node:test → `{ check, run }` | `await run()` | +2 |
| 2 | `judge.check.mjs` | 297 | 15 | `:17` helpers 的 `test` → `check`；+`import { run }` | `await run()` | +3 |
| 3 | `judge-fallback.check.mjs` | 230 | 6 | `:17` 块内 `test` → `check`；+`import { run as runChecks }` | `await runChecks()` | +3 |
| 4 | `metrics.check.mjs` | 149 | 9 | `:10` node:test → `{ check, run }` | `await run()` | +2 |
| 5 | `preflight.check.mjs` | 137 | 3 | `:14` node:test → `{ after, check, run }` | `await run()` | +2 |
| 6 | `probe-report.check.mjs` | 164 | 4 | `:13` node:test → `{ after, check, run }` | `await run()` | +2 |
| 7 | `probe.check.mjs` | 263 | 9 | `:13` node:test → `{ after, check, run }` | `await run()` | +2 |
| 8 | `recompute.check.mjs` | 167 | 6 | `:9` helpers 的 `test` → `check`；+`import { run }` | `await run()` | +3 |
| 9 | `report-present.check.mjs` | 304 | 7 | `:13` helpers 的 `test` → `check`；+`import { run }` | `await run()` | +3 |
| 10 | `report-render.check.mjs` | 299 | 10 | `:12` helpers 的 `test` → `check`；+`import { run }` | `await run()` | +3 |
| 11 | `roster.check.mjs` | 189 | 7 | `:14` node:test → `{ after, check, run }` | `await run()` | +2 |
| 12 | `suite.check.mjs` | 226 | 14 | `:11` node:test → `{ check, run }` | `await run()` | +2 |
| 13 | `timing.check.mjs` | 108 | 3 | `:11` node:test → `{ check, run }` | `await run()` | +2 |
| 14 | `toolcall.check.mjs` | 295 | 6 | `:15` node:test → `{ after, check, run }` | `await run()` | +2 |
| 15 | `toolcall-report.check.mjs` | 159 | 3 | `:13` node:test → `{ after, check, run }` | `await run()` | +2 |
| 合计 | 15 档 | **3,265** | **116** | —— | —— | **+35** |

- **共享规则**：4 处 `import { test }` + 6 处 `import { after, test }` 共 10 处 node:test 行原位换成 harness；5 档（judge / judge-fallback / recompute / report-present / report-render）从 `./helpers.mjs` 取 `test` ⇒ 行内改 `check`，另加 `import { run } from "./harness.mjs"`。
- `helpers.mjs`（204 行 · ±0）：`:10` → `import { after, check } from "./harness.mjs"`；`:14` → `export { assert, check }`。**不得 import `run`**——`helpers.mjs:58` 已独占 `run`（用例记录构造器），重复绑定即 SyntaxError。
- `judge-fallback.check.mjs` 唯一别名档：`:17` 同时从 helpers 取 `run` 构造器（3 个调用点：`:148` `:168` `:206`），故 harness 的 `run` 以 `run as runChecks` 进档，档末 `await runChecks()`；其余 14 档 `await run()`。
- 档末形：末行 `})` 之后空一行 + `await run()`（每档 +2 行）。
- **除第 2 号与第 4 号的字面改动外，档内逻辑零改**（断言表达式 / 期望值 / 题面 / 夹具数据字面逐字不动）。

**3. `run.mjs` 改动（84 行 → ≈105 行，Δ ≈ +21）**
- **首行归属声明**（启动即打印，先于启动前判据）：`bench/check — 评估工具自身的测试代码（非项目测试体系：不进 CI / 发布门）`。
- 三启动前判据（盘上 ⊆ 清单 / 清单 ⊆ 盘上 / 空清单拒跑）**逻辑零改**；`:11` 的旧理由（`node --test` 对缺失档静默忽略）改为现形理由（启动前点名，不靠子进程报错）；`:14` 执行句改为「逐档一子进程」。
- 执行：`for (const name of CHECK_FILES) spawnSync(process.execPath, [join(CHECK_DIR, name)], { encoding: "utf8" })`——顺序；每档 stdout / stderr 逐字回显（可见性不降）；**隔离不退化为「一进程跑全档」**。
- 聚合：解析每档 `^bench/check: (\d+) passed, (\d+) failed$`；末行 `bench/check: <ΣP> passed, <ΣF> failed`。
- 失败：子进程 status ≠ 0 **或** 缺汇总行（模块加载即崩 / 漏调 `run()`）⇒ 记失败档；stderr 点名 `bench/check/run.mjs: 失败档：<names>` + exit 1。exit 0 仅当全部档 status 0 且 ΣF = 0。
- **与派单的偏离（明写）**：派单写 `{ stdio: "inherit" }`；改捕获 + 回显——唯一理由 = 判据 ④ 要单一 `116 passed` 读数，`inherit` 无法跨进程聚合。隔离（一档一子进程）与可见性（逐字回显）不变。若父侧坚持字面 `inherit`，则判据 ④ 须改为「15 条逐档汇总行合计 116」。

**4. `AC-x` 批号清理（61 处 / 50 行 · 全部在 `bench/check`）**

| 类 | 行 | 处 | 规则 |
|---|---|---|---|
| 档头注释 | 17 | 23 | `（不进 CI —— AC-8）` → `（不进 CI）`（10 行）；`（AC-n）` 独占括号 ⇒ 连括号删；`（AC-n 实施轮腿）` → `（实施轮腿）` |
| 用例名 | 23 | 27 | 删 `AC-n：` / `AC-n/AC-m：` 前缀；`AC-2（实施轮腿）：X` → `实施轮腿：X`；名内 `（AC-5 / KD-3）` → `（KD-3）` |
| 断言消息 | 7 | 7 | 只删消息里尾随的 `（AC-n）`；断言表达式 / 期望值 / 其余文字零改 |
| 行内注释 | 3 | 4 | 删批号、保留描述（`（AC-12 告警面 + AC-1 第三态…）` → `（告警面 + 第三态…）`） |

- 逐档分布（处 / 行）：graders 3/3 · judge-fallback 1/1 · metrics 1/1 · preflight 1/1 · probe-report 5/5 · probe 15/10 · recompute 3/3 · report-render 13/10 · suite 3/3 · timing 1/1 · toolcall 14/11 · toolcall-report 1/1。
- **本单射程 = `bench/check/**`**（`bench/lib/*` 7 行 + `bench/suites/*` 4 行的另批登记见本节第 4 号末条「不在本单」）。
- **为什么取全量而非派单的 19**：判据句「批档可整批清理 ⇒ 文件里不许留只有批档才解释得通的编号」；且同一批号跨批含义不同（`MODEL-BENCH.md` 四张表里 AC-8 分别为「不进 CI」`:1013` / 「机械 fail 复核触发」`:1028` / 「测试全绿」`:1154` / 「成本上界」`:1167`）⇒ 留着就是不可解析的死指针。派单枚举只覆盖表头面（17 行 / 23 处）。
- **断言消息面的读法（明写）**：删的是消息串里的死指针，不是断言本体——表达式 / 期望值 / 其余文字逐字不动。若父侧按「断言字面」严格读，回退子集 = 这 7 行（判据 ⑥ 相应改为「除 7 行消息串外面 0」）。
- **不在本单**：`bench/lib/*` 7 行 + `bench/suites/*` 4 行仍带 `AC-x`（`grade.mjs:59` · `pipeline.mjs:6` · `prices-judge.mjs:2` · `recompute.mjs:2` `:33` · `report-review.mjs:21` · `report-tables.mjs:286` · `suites/code.mjs:4` · `index.mjs:6` · `manual.mjs:2` `:4`）——产品源码面，本单边界外，登记另批。`bench/results/**` 的 AC 字面 = 数据面，不动。

**5. 丢失特性与零使用证据**

| 特性 | 现用量（实测） | 影响 |
|---|---|---|
| TAP 输出 | 无消费者（无 `--test-reporter`；run.mjs 只看退出码；不进 CI） | 无 |
| 单例超时（`{ timeout }`） | 0（15 档无第三参 / `timeout:` 0 命中） | 无 |
| `describe` 嵌套 | 0 | 无 |
| 并发调度（`concurrency`） | 0（旧引擎默认串行；harness 显式串行 = 同语义） | 无 |
| `t` 上下文（`t.diagnostic` / `t.plan` / `t.mock`） | 0（14 处 `t.` 全局部变量；回调形参 `t` = 0） | 无 |
| 失败继续 / 登记顺序执行 | 使用中 | **保留**（逐条 try/catch + 顺序 await） |
| 一档一子进程隔离 | 使用中 | **保留**（run.mjs 逐档 spawn） |
| `node:assert/strict` | 全部断言的来源 | **不动** |
| 引擎的 `ℹ ...` 汇总行 | —— | **这正是本单要删的** |

**6. 判据（可机检 · cwd = `thincoder/` · 逐字可跑）**

```powershell
# 解码前置：PS 5.1 捕获 node 输出时按 [Console]::OutputEncoding 解码；默认系统代码页把 UTF-8 中文打成乱码 ⇒ 中文字串判据恒 0（假红；eng-coder#149 实测）
[Console]::OutputEncoding = [Text.Encoding]::UTF8

# J1  bench/**（除 results）内 node:test = 0
$face = Get-ChildItem bench -Recurse -File | Where-Object { $_.FullName -notmatch '\\bench\\results\\' }
"node_test_hits={0}" -f @($face | Select-String -Pattern 'node:test' -SimpleMatch).Count

# J2  裸 test( 调用 = 0（`.test(` 正则成员调用不算；数据键不算）
$n = 0; foreach ($f in $face) { $n += ([regex]::Matches((Get-Content -Raw -Encoding UTF8 $f.FullName), '(?<![A-Za-z0-9_$.])test\(')).Count }; "test_call_hits=$n"

# J3  check( 调用 = 116（面 = 15 个 *.check.mjs；harness 的定义行不在面内）
$c = 0; foreach ($f in Get-ChildItem bench\check -File -Filter *.check.mjs) { $c += ([regex]::Matches((Get-Content -Raw -Encoding UTF8 $f.FullName), '(?<![A-Za-z0-9_$.])check\(')).Count }; "check_call_hits=$c"

# J4  runner 绿 + 单一总读数 + 归属行（归属行锚点取 ASCII = 行首 `bench/check` + 空格；汇总行是 `bench/check:`）
$out = (node bench/check/run.mjs 2>&1) -join "`n"; "exit=$LASTEXITCODE"
"total_116={0} ownership={1}" -f [int]($out -match 'bench/check: 116 passed, 0 failed'), [int]($out -match '(?m)^bench/check\s')

# J4b 归属行的中文字面（与 ASCII 锚点互为独立判据；依赖本块首行的解码前置）
"ownership_cn={0}" -f [int]($out -match '评估工具自身的测试代码')

# J5  引擎面残留 = 0
"info_tests={0} info_pass={1}" -f ([regex]::Matches($out, 'ℹ tests')).Count, ([regex]::Matches($out, 'ℹ pass')).Count

# J6  AC 批号 = 0（bench/check 全部 .mjs）
$a = 0; foreach ($f in Get-ChildItem bench\check -File -Filter *.mjs) { $a += ([regex]::Matches((Get-Content -Raw -Encoding UTF8 $f.FullName), 'AC-\d+')).Count }; "ac_batch_refs=$a"
```

**期望值**：J1 `0` · J2 `0` · J3 `116` · J4 `exit=0` ∧ `total_116=1` ∧ `ownership=1` ∧ `ownership_cn=1` · J5 `0 / 0` · J6 `0`。

**7. 用例表（正常 / 边界 / 错误）**

| 类 | 输入 | 期望 |
|---|---|---|
| 正常 | `node bench/check/run.mjs`（15 档在盘、清单齐） | exit 0；逐档 `ok` 行 + 汇总；总行 `bench/check: 116 passed, 0 failed`；无 `ℹ` 行 |
| 正常（单档 · 证明文件名无需带 `test`） | `node bench/check/graders.check.mjs` | exit 0；`bench/check: 14 passed, 0 failed` |
| 边界（单条红） | 临时把一条断言改错 | 该档 `FAIL <i> - <name>` + 后续用例继续；档汇总 `P-1 passed, 1 failed`；总行同步 + 点名失败档 + exit 1 |
| 边界（档加载即崩） | 临时坏 import | 无汇总行 ⇒ runner 记失败档 + 点名 + exit 1 |
| 错误（漏调 `run()`） | 临时删档末 `await run()` | `beforeExit` 报错 + 无汇总行 ⇒ runner 点名 + exit 1 |
| 错误（漏改调用名） | 临时留一处 `test(` | `test is not defined` ⇒ 档崩 ⇒ runner 点名 + exit 1（构造性） |
| 边界（`after` 抛） | 临时让 `after` 抛 | stderr 一行 `after 清理异常…`；主结果 / 退出码不变 |
| 正常（绿路径清运） | 全绿跑一次后列系统临时目录 | `bench-sandbox-*` / `bench-fixtures-*` 不存在（`helpers.mjs:21` 的 `after` 已 `rmSync`）；其余 6 处 `after` 清运点（共 7 处）同形（全为 `rmSync` 临时目录）；读数一行入 §5 |

**8. 受影响文件与行数（现行读数 = 本席实测；Δ = 预计）**

| 文件 | 现行 | Δ | 说明 |
|---|---|---|---|
| `bench/check/harness.mjs` | 0（新增） | +≈50 | 契约见第 1 号 |
| `bench/check/run.mjs` | 84 | +≈21 | 归属行 + 逐档执行 + 聚合 + 失败点名；判据逻辑零改 |
| `bench/check/helpers.mjs` | 204 | ±0 | `:10` `:14` 两行改名（不引 `run`） |
| 15 档（第 2 号表） | 3,265 | +35 | import / 调用名 / 档末 / AC 字面（±0 行） |
| `docs/core/design/MODEL-BENCH.md` | 1,745 | **+3** | §3 验证方式段加引擎机制句（3 行）+ `:690` 理由句改写（同行）→ 改后 1,748 |
| `bench/results/**` · 其它 bench 源码 · `TESTING.md` · `CONFIG.md` · `bench/README.md` · CI · `package.json` | —— | **±0** | 零触 |

**触面合计**：18 档 = 新增 1（harness）+ 修改 17（15 档 + `helpers.mjs` + `run.mjs`）；另文档 1（`MODEL-BENCH.md` §3，+3 行）。

**9. 边界（不做）**
- 不改断言表达式 / 期望值 / 题面 / 判据逻辑 / 夹具数据字面；只删注释 / 用例名 / 断言消息里的 AC 批号（第 4 号）。
- 不动 `bench/results/**`、`TESTING.md`、`CONFIG.md`、`bench/README.md`（README 的 `node --test` / `node:test` 实测 = 0，跑法句不变）；`MODEL-BENCH.md` 只动 §3 两处（引擎机制句 + `:690` 理由句，见第 8 号表）。
- `assert` 来源不动（`node:assert/strict`）；不接 CI / `npm test` / 发布门；不新增测试。
- 不改 `toolcall/prompts.mjs` 与 `toolcall-frozen.mjs` 的 `node --test` 题面载荷（题面 + 冻结副本逐字等值，判据 ① 不命中 `node --test` 空格形）。

**10. 回滚面**
单提交；`git revert` 即恢复 11 处 `node:test` import 与 `--test` 单进程形态，`harness.mjs` 随提交删除，`MODEL-BENCH.md` 的机制句随同提交回滚；无 schema / 版本轴 / 数据面变更（`SUITE_VERSION` 7 · `PROBE_VERSION` 1 · `TOOL_PROBE_VERSION` 1 不动）。

**实施顺序**：① `harness.mjs` → ② `helpers.mjs` → ③ 15 档（import / `test(`→`check(` / 档末）→ ④ `run.mjs` → ⑤ AC 字面 → ⑥ 六条判据全跑。

**11. 先例与勘察证据**
- **最近先例**：① `thincoder-desktop/tools/web-quickcheck/run.mjs:49`（自写 `check(name, ok, detail)` 收集器 + 逐条列报 + exit 1）——**对齐**「无框架自写检查器」；**偏离** = 本单收 `(name, fn)` 用例体（承接 116 个既有块，零改写），且多档隔离住 runner 而非 harness。② 各包 `test/run.mjs`（`thincoder-core/test/run.mjs`）——本档 run.mjs 已是其对齐产物，本轮只换执行单元。③ `.thincoder/tmp` 探针的 `const check = async (name, fn) =>` 形（如 `p4i-core-additions.mjs:29`）——过程产物、不入仓，仅作旁证。
- **勘察证据**：查了 ① `bench/check/run.mjs` 全档；② `helpers.mjs`（导出面 / `run` 构造器 `:58` / `after` `:21`）；③ 15 档 import 行与全部 116 个调用点；④ `bench/README.md`（`node --test` / `node:test` = 0 命中）；⑤ `MODEL-BENCH.md` 的旧引擎命中 4 行（`:690` 现行理由句——本轮同改 / `:1000` `:1136` 记录面 / `:1657` 题面载荷；后三处为改后行号）；⑥ 全仓对 `bench/check` 的工具链引用（CI / `package.json` / 脚本 = 0；命中仅 `.thincoder/tmp` 过程产物）。**公开源档**：工作区外参考系（`D:\ref\`）不入索引、与本档无契约关系 ⇒ **none relevant**。

**12. 上抛 / 知会**
- **[知会]** 两处计数更正（父侧派单 → 本席实扫）：`after(` 6 → **7**；`AC-x` 19 → **61 处 / 50 行**。
- **[知会]** `MODEL-BENCH.md` 的引擎机制同轮落盘：§3 验证方式段加机制句（3 行）+ `:690` 理由句改为不依赖旧引擎的现形理由（见第 8 号表）——常驻组件的契约不住可清理批档。
- **[上抛·知会]** `bench/lib/*` 7 行 + `bench/suites/*` 4 行仍带 `AC-x`（产品源码面，本单边界外）⇒ 另批或并入（需父侧裁）。
- **[知会]** `judge-fallback.check.mjs` 需 `run as runChecks` 别名（`helpers.mjs:58` 已有 `run`）。
- **[知会]** §2.13 第 4 号判据里的 `tests 116 · pass 116 · fail 0` 读数在本单后改形为 `bench/check: 116 passed, 0 failed`；数值口径不变。
- **[知会]** `node:assert/strict` **保留**（断言原语、非测试框架，不写 `ensure()`）——理由见收紧轮第 5 号（①–④）。

**13. 档级读数（本席实测）**：本节追加后本档 = **1,023 行 / 141,443 B**（口径 = 文件内 `\n` 计数）。

**§2.14 收紧轮（用户 2026-10-18 08:17 口径 · 父侧强化）**

**用户原话（逐字）**：「node --test 我不希望用，因为造成误判的代价太大，你区分不清的问题造成了很大的困扰，我希望你手动实现不要用"免费"的，免费的才是最贵的」。

**1. 六条 → 设计增量（含取代关系）**

| # | 口径 | 收紧点 | 落点 |
|---|---|---|---|
| 1 | 零依赖 | 初稿已无 `node:test` import；**隔离 / 超时全部自写**（初稿第 3 号只写「逐档 spawn」、未设超时） | 第 3 号 |
| 2 | `free` 不收 | 显式语义清单 + 失败原样打印 + 三计数器自校验 | 第 2 号 |
| 3 | 输出自证 | 失败点名单前置、汇总恒为末行、判据 ⑤ 收紧 | 第 3 / 4 号 |
| 4 | 隔离自己写 | `timeout: 60000` + `ETIMEDOUT` 判定 + 点名 | 第 3 号 |
| 5 | `node:assert` | **保留**（不写 `ensure()`），理由见第 5 号 | 第 5 号 |
| 6 | AC 批号 | 已按全量 61 处设计（§2.14 第 4 号，覆盖派单的 19）⇒ 本条无增量 | —— |

**2. harness 的显式语义（取代 §2.14 第 1 号对应行；其余行不变）**
- 用例 = 一次 `check(name, fn)` 调用；**登记 ≠ 执行**（执行只发生在 `run()`）。
- 执行 = `run()` 内一个 `for` 循环，按登记顺序 `await fn()`；**无并发 / 无重试 / 无过滤 / 无隐式超时**。
- 失败 = catch 到的异常**原文**（`err?.stack ?? String(err)`），不缩进、不改写、不分类；打印后继续下一条。
- 计数 = 三个自有变量：`total`（登记数）/ `passed` / `failed`；`run()` 收尾校验 `total === passed + failed`（不成立 ⇒ 一行 `bench/check: 计数自校验失败（total≠passed+failed）` + `process.exitCode = 1`）。
- `after` = 第二队列，收尾按登记顺序 await；**唯一被吞的异常**（打印原文一行，不掩盖主结果）。
- 汇总行 = `bench/check: <passed> passed, <failed> failed`，**恒为该档 stdout 末行**。
- 保护 = `beforeExit` 未执行且队列非空 ⇒ 一行 + exitCode 1。
- **不借旧引擎任何能力**：隔离、超时、TAP、`t` 上下文、describe、计量行——在 harness 与 run.mjs 的语义里都不存在。

**3. `run.mjs`：隔离与超时（取代 §2.14 第 3 号的执行段；判据逻辑与归属行不变）**
- `const PER_FILE_TIMEOUT_MS = 60000`；`spawnSync(process.execPath, [join(CHECK_DIR, name)], { encoding: "utf8", timeout: PER_FILE_TIMEOUT_MS })`。
- 判定：`result.error?.code === "ETIMEDOUT"` ⇒ 失败档记 `<name>（超时 >60 s）`；否则 `result.status !== 0` **或** 缺汇总行 ⇒ 失败档。
- **超时值依据（实测 2026-10-18 08:2x）**：逐档墙钟 = 106–658 ms（最重 = `probe-report.check.mjs` 658 ms · `graders.check.mjs` 655 ms）；整轮 4,987 ms（基准 = 逐档串行 spawn 的墙钟之和，非单进程汇总）⇒ 60,000 ms ≈ 91× 最重档（同基准）；最坏上界 15 × 60 s = 15 min。
- `ETIMEDOUT` 形态实测：`status=null · signal=SIGTERM · error.code=ETIMEDOUT`（`spawnSync` 的 `timeout` 语义）。
- 顺序：失败点名单（stderr）**先于**总汇总（stdout）打印 ⇒ 汇总行恒为整段输出末行（绿 / 红同形）。

**4. 判据收紧（取代 §2.14 第 6 号的 J5；其余 J1–J4、J6 不变）**

```powershell
# 解码前置（同第 6 号：PS 5.1 默认系统代码页读 UTF-8 中文乱码）
[Console]::OutputEncoding = [Text.Encoding]::UTF8
# J5（收紧）整段输出无引擎式计量行；末行 = 汇总行
$out = (node bench/check/run.mjs 2>&1) -join "`n"
$ls = $out -split "`n"
"info_lines={0}" -f @($ls | Where-Object { $_ -match '^\s*ℹ' }).Count
"metering_lines={0}" -f @($ls | Where-Object { $_ -cmatch '^\s*(tests|suites|pass|fail|cancelled|skipped|todo|duration_ms)\b' }).Count
"last_line_ok={0}" -f [int](($out.TrimEnd() -split "`n")[-1].Trim() -eq 'bench/check: 116 passed, 0 failed')

# J7 隔离 / 超时自写接线（静态）
$run = Get-Content -Raw -Encoding UTF8 bench\check\run.mjs
"timeout_wired={0} test_flag={1}" -f [int]($run -match 'PER_FILE_TIMEOUT_MS\s*=\s*60000'), ([regex]::Matches($run, '--test')).Count
```

**期望**：J5 `info_lines=0` ∧ `metering_lines=0` ∧ `last_line_ok=1`；J7 `timeout_wired=1` ∧ `test_flag=0`。（`-cmatch` 区分大小写：用例失败行 `FAIL …` 不计入计量行。）

**5. `node:assert/strict`：保留（不写 `ensure()`）**
理由：① 它是断言原语，无生命周期 / 收集 / 报告语义——不属于「替你决定什么算一个用例、失败长什么样、跑完怎么报」的框架；② 116 用例的表达式 / 期望值受本单边界保护（§2.14 第 9 号），改写成 `ensure` = 重写全部断言，风险 >> 收益；③ 其失败输出就是异常原文（`AssertionError` + stack），恰是 harness 原样打印的形态；④ `ensure(cond, msg)` 只能表达布尔条件，`deepEqual` / `throws` / `match` 的精确 diff 会退化。

**6. 相对初稿的收紧点（交付报告同列）**
① 增加逐档超时 60,000 ms + `ETIMEDOUT` 判定 + 点名（初稿无超时）；
② 失败输出由「缩进 stack」改为**异常原文**（不加工）；
③ 增加三计数器 `total / passed / failed` 与 `total === passed + failed` 自校验；
④ 失败点名单前置 ⇒ 汇总行恒为末行；
⑤ 判据 ⑤ 由「无 `ℹ tests` / `ℹ pass`」扩为「无 `ℹ` 行 ∧ 无 Node 式计量行 ∧ 末行 = 汇总行」，并加 J7（超时接线 / `--test` 零残留）；
⑥ 明写「隔离 / 超时 = run.mjs 自写」与「harness 不借旧引擎任何能力」；
⑦ `node:assert/strict` 明确保留并给理由（不写 `ensure`）；
⑧ AC 批号面维持全量 61 处（初稿已覆盖派单的 19）。

## §3 设计评审（评审子代理）

### 轮次 1（评审子代理）

**评审对象**：`thincoder/docs/batches/2026-10-18-bench-test-cleanup.md` §2（声明路径写作 `docs/batches/…`，工作区根不解析；实盘在 `thincoder/docs/batches/…`）。
**计数**：🔴 2 · 🟡 5 · 🔵 5（共 12 条）。

| # | Category | Severity | Issue | Suggestion |
|---|----------|----------|-------|------------|
| 1 | Requirements | 🔴 | 用户 A 口径原文含「改成 bench 自己的集成测试」（`:17`），§2.3 却取 c「用 runner 自带 `--dry-run` 当常驻冒烟」（`:103`）＝ bench 零集成测试；该替换未列入 2.11 上抛，其依据「本批明令」（`:91`）在 §1 授权记录（`:9`–`:19`、`:35`）中无对应原文 ⇒ 用不可追溯的禁令覆盖用户自己选的内容。与 AGENTS.md「Docs conflict → stop and report」冲突。 | 新增一条上抛：显式写明 A 口径的「改集成测试」未按字面实施、理由（N20／F12／非门控）与「不新增常驻测试」的可追溯来源；由用户或父侧确认后再进实施。 |
| 2 | Acceptance criteria | 🔴 | AC-3 期望命中集不成立：`bench/lib/client.mjs:89` 注释亦写「dry-run 夹具与 `bench/test/judge.test.mjs` 桩传输共用本函数」⇒ 除已登记两处外还有第三处，AC-3「仅命中 … 两处」必红；2.7／2.11 的残留登记（「两处」）同样不全，删后留下未登记的运行面死指针。另 `--glob` 是 ripgrep 语法，`grep -rn` 不可直跑。 | 把 `bench/lib/client.mjs:89` 补入残留登记（或把该一行注释收正纳入本批），AC-3 按新集合重述，并给出可直跑的命令形态。 |
| 3 | Methodology（先例） | 🟡 | 全档无 closest-precedent 行（grep `先例`／`precedent` 零命中）：既未给先例坐标（如 2026-09-28 全清基线、`2026-10-16-unit-test-lifetime` 的零留存落地），也未把 K2／K3 的取舍锚到「对齐／偏离＋理由」。 | 补一行先例：列出所查先例的实现坐标 ∥ 对应设计档小节 ∥ 与本设计的对齐或偏离理由。 |
| 4 | Methodology（勘察） | 🟡 | 全档无 survey-evidence 行（grep `勘察`／`公开`／`survey` 零命中）：2.7 只是仓内 `docs/**` 扫描；「公开源档是否相关」无记录（按规矩「none relevant」也须落字）。 | 补一行勘察证据：写明查了哪些公开源档、结论相关／不相关。 |
| 5 | Doc hygiene | 🟡 | 失效表述留在规范面：AC-6（`:165`）与 2.11 第 3 条（`:188`）仍写「现盘 14 件」——现盘 `docs/batches/*.test.mjs` = **5**（实扫：desktop-walkthrough-fixes／model-selection-pivot／team-token-rotation／box-quota-recovery／context-perception）；改法只是尾部追加「已过时」（`:197`），违反「改＝删旧句」。另 2.11 引 `docs/core/design/TESTING.md:94`「现盘实读 **14** 件」为据，该档现仍写 14。 | 直接把 AC-6 与 2.11 第 3 条改为 5 件形态并删去「已过时」批注；同步登记 `design/TESTING.md:94` 的读数滞后。 |
| 6 | Coordination（跨档） | 🟡 | 2.6（`:128`）／2.8（`:151`）／AC-7（`:166`）称他批 §2.5 表列 `bench/test/probe.test.mjs`（263 行 / +47）、AC-12 含 `node --test` 腿 —— 他批现档 §2.5 表（`:380`–`:397`）无该行，AC-12（`:433`）= `node --check` 三档 + `validateFixtures()` + API-CONTRACT；他批改为 AC-14「`bench/test/` 空或不存在」前置 + 6.6，并反向要求本档四处对账。⇒ AC-7 的第三个合取项空转。 | 按他批现档重述 2.6／2.8／AC-7：依赖记为「他批 AC-14 前置」，删去「他批需删该行 / 改 AC-12」的过期描述，并在本档一侧完成对账。 |
| 7 | Doc-state | 🟡 | 2.8 表 `MODEL-BENCH.md` 现状写「2,013 行」，与本档自身记录「现盘 **1,742** 行，原 2,013」（`:192`）矛盾；实读该档末行 = 1742 ⇒ 受影响面表与正文互相打架。 | 把 2.8 的现状列改为 1,742 行（或改为「原 2,013 / 现 1,742」的单一读数），保持全档一处口径。 |
| 8 | Numeric drift | 🔵 | 2.1 行 2 记 `judge.test.mjs`「16 个 `test()`」，实读 = **15**（`:34`…`:271`；`:115` 是正则 `.test(`，不是用例）；总数 116 与实扫一致，仅该格偏一。 | 该格改为 15。 |
| 9 | Acceptance 可跑性 | 🔵 | AC-4 的第 2／3 条命令写 `<在册 label>`：`probe.mjs` 的 dry-run 需可解析条目（`bench/probe.mjs:199` 取 `entries[0].model`），占位符不可逐字执行；不过 MODEL-BENCH §11.11（`:1738`）用同一写法，属既有惯用形态。 | 换成 `models.json` 里一个具体在册 label，令 AC-4 可逐字复跑。 |
| 10 | Acceptance 次序 | 🔵 | AC-2 要求 `git status --porcelain` 中 18 档为 `D`，AC-8 要求单提交；提交后 porcelain 为空 ⇒ 两条的读取时点未定义。 | 注明 AC-2 在提交前读、AC-8 在提交后读。 |
| 11 | Clarity（决策边界） | 🔵 | K4 称「逐批用例 / AC / 预算历史表另批去历史」，而同日已落的改动把 §3 的逐批预算表整段删除（`:192`）——K4 的边界与实际落笔不一致。 | 把 K4 的「另批」范围改述为 §5.10–§5.13／§6，并写明 §3 历史表已随本轮删除。 |
| 12 | 跨档读数（R7c） | 🔵 | `docs/core/design/TESTING.md:94` 仍记「现盘实读 **14** 件」，与现盘 5 件不符；本批不触该档，属读数滞后。 | 登记为另批收正项（与 #5 一并处理）。 |

**实读核验面（通过项）**：18 档在盘、逐档字节数与 2.1 表**全等**（合计 268,421 B）；3,735 行求和吻合；`fixtures.mjs` 恰被 9 个测试档 import、两个 `.frozen.mjs` 各恰被 `probe.test.mjs:16` / `toolcall.test.mjs:29` 消费 ⇒「零运行面消费」成立；`bench/README.md:229`／`:243` 与 `TESTING.md:98` 引文逐字一致；三个 runner 均实有 `--dry-run`（`run.mjs:45` · `probe.mjs:39` · `toolcall.mjs:39`）且支持 `--label`／`--results-dir` ⇒ 2.3 集成面与 AC-4 形态可行；MODEL-BENCH 现盘 `bench/test` 命中 **19 行**（§5.13 四行 + §6 十五行）与 `:194` 自述完全吻合，现行机制面确为零命中 ⇒ AC-5 可达成；本批不新建任何文件、改的是各主题的拥有档（TESTING.md／MODEL-BENCH.md／bench README）⇒ 文档归属无碎片化；受影响档全为 `.md` 或整档删除，尺寸标注按判据豁免。

**限制声明**：未提供文档地图（AGENTS.md 指向的 `thincoder/docs/README.md` 未在评审上下文内），文档归属按项目指南与文件自身主题判据判断，未对地图逐条比对；项目标准文档亦未声明，方法学按 AGENTS.md 与评审判据判断。

VERDICT: changes-required

### 轮次 2（评审子代理）

**评审对象**：同前（`thincoder/docs/batches/2026-10-18-bench-test-cleanup.md` §2 · 改判轮段 `:200`–`:412`；旧「18/18 全删」段已被 `:202` / `:386` 声明作废，按记录面读）。
**计数**：旧 12 条 = Fixed 7 · Accepted 3 · Unfixed 2；新增 10 条 = 🔴 1 · 🟡 6 · 🔵 3。合计未决 = 🔴 1 · 🟡 6 · 🔵 5。

| # | Orig# | File | Severity | Status | Notes |
|---|-------|------|----------|--------|-------|
| 1 | 1 | §2:202 / :9（§1） | 🔴 | New：AC-2 自指必红 | AC-2（`:348`）扫 `docs/**`、排除面只写「`.thincoder/tmp/**` + 他批批档」；本批档自身在 `docs/**` 内，而映射表 `:220`–`:237` 的「原路径」列必须逐条写 `bench/test/…`（`:220: | 1 | \`bench/test/graders.test.mjs\` | \`bench/check/graders.check.mjs\` | 278 | 19,077 |`）⇒ 该判据在构造上取不到 0。建议把「本批档」写进排除面，或把 AC-2 射程限定在 `bench/**` 代码面。 |
| 2 | 2 | §2:298 | 🟡 | New：引用点清单已过期 | §4-A「文档」子项列 `MODEL-BENCH.md` 15 行（`:31 :37 :40 :377 :407 :679 :701 :759 :1095 :1188 :1214 :1219 :1316 :1328 :1535`）+ `:1082` 属**待改**；但 §5（`:316`）已写「**已落盘**（实测：`bench/cases` 0 · 旧夹具路径 0）」，实读该档 `bench/cases` 也确为 **0**（全部已是 `bench/suites`），且行号整体 +4（`KD-2` 现住 `MODEL-BENCH.md:705`）。⇒ 清单与「已落盘」互斥，照行号落笔会点到别的正文。建议删掉该子项的 MODEL-BENCH 段（README 段仍有效）。 |
| 3 | 3 | bench/test/*.mjs · §2:244 | 🟡 | New：清单漏头注自档名 | `:244` 的「15 档共有 ①」只覆盖跑法句；16 个档的 `:2` 自档头注仍写旧相对路径（`bench/test/graders.test.mjs:2:  * test/graders.test.mjs — 判分器族正常 + 反例（AC-5：含「硬编码公开例」反例）+ 判官合成分件（§2.6）。`），另有兄弟档名提及（judge`:6` / probe`:6` / report-present`:2` / suite`:4` / toolcall`:6` / roster`:3`,`:76` / fixtures`:3`,`:174`）与 3 处 `test/fixtures.mjs`（`bench/test/report-present.test.mjs:8` / report-render`:4` / roster`:6`）。这些串不含 `bench/` 前缀 ⇒ AC-1（名字面）与 AC-2（5 个旧路径）都放行，改完仍留旧档名。建议并入 §1 引用点 + 把 `test/fixtures.mjs` 形加进 AC-2 的串表。 |
| 4 | 4 | §2:387 | 🟡 | New：上抛已过期 | 本档仍请求「⑥ 落地时必红而 AC-14 会假绿。请父侧改该批前置（或明令本批收正该断言）。本批不改（禁改逻辑）。」；他批 07:3x 改判轮已自行收正：`2026-10-18-prompt-residual-fixes.md:351: **6.6 常驻自检连带：断言随改名落在 \`bench/check/probe.check.mjs:104\`，⑥ 同轮收正…**`，且 `:435` 现为 `### 2.6 验收对照（逐条回指 2.1）`（AC-14 已迁，不再以「`bench/test/` 空」为判据）。⇒ 唯一「待裁」项空转。建议改记为「他批自担 ⑥ 收正，本批只需保证改名先落」。 |
| 5 | 5 | TESTING.md:44 / :49 · §2:208 | 🟡 | New：需求档定义面未随改 | 设计称「项目测试体系的两种定义（`docs/core/requirements/TESTING.md` §0）都以**归属与寿命**落地」，但 §0/§1.2 是按**技法**定义：`TESTING.md:44: - **单元测试** = 隔离测单个单元（依赖以桩 ∕ 假件替身）——回答「这一件对不对」；`、`:49: - **单元测试 = 开发期工具**：为改对代码而写；住批次目录（\`docs/batches/\`），**永不进任何门**、零维护。`。bench/check 正合技法定义（隔离 + 桩 + 夹具）。2.5 的逐字建议只改 `:98` 并断言「不入本档两类测试的定义面」，未改 §0/§1.2 ⇒ 需求档自相矛盾。建议 :98 建议加一句显式豁免，或同步给 §0/§1.2 加「产品自检码」第三类。 |
| 6 | 6 | §1:9 vs §2:202 | 🟡 | New：授权面未记改判 | §1 仍写「按用户 07:14 裁定 **A：按策略清**（单元测试零留存）」（`:9`），而整份现行设计立在本档 `:202` 的「用户 07:24「`bench/test/` 不删，改名改路径」」上；§1 无 07:24 / 07:26 记录 ⇒ 读者无法从授权面复现设计依据。建议主 agent 在 §1 追加一行改判记录（§1 是主 agent 的笔）。 |
| 7 | 7 | MODEL-BENCH.md:1056 | 🟡 | New：记录面历史命令被改写 | 逐批 AC 表的历史行已刷成现行路径：`MODEL-BENCH.md:1056: | AC-3 | 测试全绿（\`node bench/check/run.mjs\`） | ——（实施面） | 该命令读数（实施轮入档） |`——该批验收时此命令并不存在。`:391` 已披露「只把记录面的档名 / 命令刷新到可解析」⇒ 属已披露取舍，但读记录面的人会以为当时跑的就是新 runner。建议给被刷新的历史行加「（改名后路径）」注记，或保留当时命令。 |
| 8 | 1–8（旧） | — | — | Fixed 7 条 | 旧 #1（A 口径替换）→ `:202` / `:386` 记用户改判、旧「父侧明令」落在作废段；旧 #2（第三处死指针）→ `bench/lib/client.mjs:89` 现为显式改点（§6 `client 201` 行）+ AC-2 覆盖 `bench/test`；旧 #3（先例）→ `:379`–`:382` 四条先例带对齐/偏离；旧 #4（勘察）→ `:382` 明写「**none relevant**」；旧 #6（跨档 2.6/2.8/AC-7 错述）→ 现行段不再复述他批 §2.5/AC-12；旧 #7（2,013）→ 现行 §6 表 1,744 + `:397` 收正 1,745（实读 1,746 内容行，与 wc 口径一致）；旧 #8（judge 16）→ 现行映射表无逐档用例数，合计 116 实扫吻合。 |
| 9 | 5 · 10 · 11 · 12（旧） | §2:165 / :188 · :373 · :391 | — | Accepted 3 条 | 旧 #5（「现盘 14 件」）→ 所在段 `:202` 已声明「保留为记录面，不再有效」，现行 AC 表（`:347`–`:354`）无该claim，现盘 `docs/batches/*.test.mjs` = 5 与现述一致；旧 #10（AC-2 读点）→ 所指 AC 已被取代（同一类问题在新 AC-6 复现，见 #17）；旧 #11（K4 边界）→ 所指 K4 在作废段，现行边界 `:373` / `:391` 与实况一致。 |
| 10 | 9（旧） | §2:351 | 🔵 | Unfixed | 旧 #9 未落：现行 AC-5 仍只写「| AC-5 | 三条 `--dry-run` exit 0；\`git status --porcelain bench/results\` 空 | 回归 |」，三条命令本体只存在于作废段（`:170`–`:172`，且带 `<在册 label>` 占位）。建议在现行段重列三条具名命令。 |
| 11 | 12（旧） | docs/core/design/TESTING.md:94 | 🔵 | Unfixed（本轮未复核） | 出本批射程的读数滞后项；本轮未再读该档，状态沿用旧轮（「现盘实读 14 件」 vs 现盘 5）。 |
| 12 | (new) | §2:324 | 🔵 | New：Δ 单位不实 | 「| \`bench/test/*\` → \`bench/check/*\`（18 档） | 3,717 行 / 268,421 B | **±0 行 / ±0 B** |」——行数确为 ±0，但改名必改字节（`cases`→`suites` +1、`fixtures.mjs`→`helpers.mjs` −1、`probe-fixtures.frozen.mjs`→`probe-frozen.mjs` −9…）⇒「±0 B」为伪。建议改成「±0 行 / 字节随串长变」。 |
| 13 | (new) | §2:337 vs :397 | 🔵 | New：同行两读数 | §6 表写 `MODEL-BENCH.md` 现 1,744，`:397` 收正「现盘 **1,745 行**（改动前 1,741，**+4**」并注「以本行为准」；实读 1,746 内容行 ⇒ 1,745 正确、表内 1,744 为残留。 |
| 14 | (new) | §2:352 | 🔵 | New：AC-6 读点未定 | 「\`git diff --stat bench/results\` 空」在单提交落地后恒空（AC-8 要求单提交）⇒ 该判据只能在提交前读，未写明。建议注明「提交前读」或改 `git show --stat`。 |

**本轮实读核验（通过项）**：`bench/lib/client.mjs:89` 确为第三处旧路径注释；`bench/cases` 在 `MODEL-BENCH.md` 已归零（全部 `bench/suites`）；`bench/cases/index.mjs` 的运行面 import 恰为 §4-A 所列 8 处（行号逐一吻合）；`bench/` 下除待改名的 15 个 `*.test.mjs` 外无任何名字含 `test`（判据 A 可达成）；18 档字节与 §1 表全等（如 `probe.test.mjs` 18,267）、行数按 `wc -l` 口径自洽（合计 3,717 = 旧 3,735 − 18）；`tool.5` 载荷 `"node --test"` 不含路径 ⇒ 与 AC-2 不冲突（AC-6「题面逐字未动」成立）。
**限制声明**：§4-A 的 README 行号（`:76` / `:91` / `:241`）与 §5 的 README 改法未逐行复核；本评审未执行任何命令（无 shell 工具），「实测」结论以设计自称 + 静态实读为据。

VERDICT: changes-required

### 轮次 3（评审子代理）

**评审对象**：`thincoder/docs/batches/2026-10-18-bench-test-cleanup.md` §2 改判轮段（`:213`–`:475`）；第 3 轮 = 修正轮 #140 后复查 advisor#138 表中 12 条（9 条 dispatch + §1 授权面 + 两条旧 🔵）。
**计数**：Fixed 9 · Unfixed 3（🔴 1 · 🔵 2）。

| # | Orig# | 位置 | Severity | Status | Notes |
|---|-------|------|----------|--------|-------|
| 1 | 1 | §2:387 / §2:281 | 🔴 | Unfixed（部分） | AC-2 本体已可满足：`扫面 = \`bench/**\`（除 \`bench/results/**\`）+ \`docs/core/**\``，排除面 `:413` 已列 `docs/batches/**`，7-a 命令可逐字跑、先红读数 `hits=53 · residual=53` 与「`docs/core/**` = 0」自洽。**但同一节的判据 C（`:281`）仍是旧面**：`与 \`docs/**\` 中 \`bench/test\` · \`bench/cases\` · … 的引用 = 0`，排除面只写 `排除面 = \`.thincoder/tmp/**\`（过程产物、不入仓）+ 他批批档（过程档、冻结）` ⇒ 本批档自身仍在扫面内、取不到 0。同一判据两处两说（5 串 vs 7 串、无 `docs/batches/**`、无 `bench/results/**`），且判据 C 未被标注作废。 |
| 2 | 2 | §2:318 | 🟡 | Fixed | §4-A 的 MODEL-BENCH 子项已删：`\`docs/core/design/MODEL-BENCH.md\` 同串已归零（实测，见 5.），不在改点。` |
| 3 | 3 | §2:267–:273 | 🟡 | Fixed | 清单补齐且计数更正：`**头注自档名 + 兄弟档名提及（33 处 = 18 + 5 + 10；…）**`；① 18 档、② `**② \`test/fixtures.mjs\` 提及（5 处 · 非自档名）**：\`preflight:6\` · \`recompute:3\` · \`report-present:8\` · \`report-render:4\` · \`roster:6\``（含父侧认错 `:65`）、③ 10 处、④ 既存陈旧名；AC-2 串表加 ⑥ 裸 `test/fixtures.mjs` + ⑦ 18 旧档名（`:399`–`:401`），边界论证 `:409`（无边 316 行 → 加边界 0）。 |
| 4 | 4 | §2:450 | 🟡 | Fixed | 上抛改知会：`**[知会]** 他批自担 ⑥ 收正：`…`⇒ **本批只需保证改名先落**；⑥ 的断言收正由该批同轮完成，本批不代改。` |
| 5 | 5 | §2:340–:347（5-b） | 🟡 | Fixed | 取 (b)：`**取 (b)：把「归属面 = 批次目录」写成定义的构成要件**，不新立「产品自检码」第三类`；`:44` 追加「**此句是技法判据（必要非充分）**——还要归属面成立（见下「寿命轴」）才算单元测试。」+ `:49` 归属要件 + `:98` 措辞 + 「§0 不动」。 |
| 6 | 6 | §1:54–:59 | 🟡 | Fixed | 授权面已补改判：`**用户改判（2026-10-18 07:24 / 07:26）——本条覆盖上文「按策略清」的授权口径**`（07:24 / 07:26 原文逐字在后两行）。agent 自述「等 #140 回来一并改」已实际落笔。 |
| 7 | 7 | §2:349–:357（5-c） | 🟡 | Fixed | 取 (a) 章首披露：`**取 (a)「保留当时命令 + 加改名标记」，把标记提到章首一行**`，§5.13 / §6 表前各一行 `**记录面说明**：本表为历史批次当时的用例读数…（当时 = …，改名后 = …）`；逐行加注否决理由 = 3 行破 300/450 字符线；与 AC-2 的接口写明（豁免 ≤2 行须列名）。 |
| 8 | 8 | §2:363 | 🔵 | Fixed | `**±0 行 · 字节随字面增减（不设阈值）**` |
| 9 | 9 | §2:376 · :460 | 🔵 | Fixed | 单源读数：`\| 1,745（原 1,741） \| **+4** \| 已落盘；读数单源 = 本行`；`:460` 只留行宽 `本行只留行宽读数——本批新增超 300 字符行 = **0**`。 |
| 10 | 10 | §2:391 | 🔵 | Fixed | `（**提交前读**——单提交落地后恒空）` |
| 11 | 旧 #9 | §2:390 | 🔵 | Unfixed | `\| AC-5 \| 三条 \`--dry-run\` exit 0；\`git status --porcelain bench/results\` 空 \| 回归 \|` — 三条命令本体仍只在作废段（`:183`–`:185`，且带 `<在册 label>`）。不阻塞。 |
| 12 | 旧 #12 | docs/core/design/TESTING.md:94 | 🔵 | Unfixed（本轮未复核） | 出本批射程的读数滞后（「现盘实读 14 件」 vs 现盘 5），本轮未读该档。不阻塞。 |

**本轮实读核验（通过项）**：AC-2 扫面已收窄到 `bench/**` + `docs/core/**`，本批档（映射表 `:233`–`:250` 必写 18 旧路径）已移出扫面 ⇒ 前一轮 🔴 的主诉（自指必红）在 AC-2 上解除；7-a 命令 `$face = @(Get-ChildItem bench -Recurse -File \| Where-Object { $_.FullName -notmatch '\\\\bench\\\\results\\\\' }) + @(Get-ChildItem docs\\core -Recurse -File)` 与 `residual = 0` 读法自洽；排除面逐项列明（`docs/batches/**` · `.thincoder/tmp/**` · `bench/results/**`）。
**限制声明**：只读本批档；MODEL-BENCH.md / TESTING.md / 兄弟批档的现盘状态本轮未复读（按审阅范围不入），5-b / 5-c 的落地状态按设计自述（「待主 agent 落」/「待父侧裁后落」，§1:63 已记父侧裁定取章首形态）。

VERDICT: changes-required

### 轮次 4（评审子代理）

**评审对象**：`thincoder/docs/batches/2026-10-18-bench-test-cleanup.md` §2（判据 C `:289` 单源指针 + 定位判定段重写后的现盘）；第 4 轮 = 修正轮 #142 后复查轮次 3 表 12 条。
**计数**：Fixed 10 · Unfixed 2（🔵 2）· 🔴 0（前一轮唯一 🔴 已解除）。

| # | Orig# | 位置 | Severity | Status | Notes |
|---|-------|------|----------|--------|-------|
| 1 | 1 | §2:289 / §2:395 | 🔴→⚪ | Fixed | 判据 C 已改单源：`见 §7 AC-2 / 7-a（**单源**：扫面、七串类、排除面、期望值全部以 7-a 为准，本行不复述` —旧面（`docs/**` · 5 串 · `他批批档`）整段删除，本批档不再落在任何判据的扫面内；AC-2（`:395`）仍为 `扫面 = \`bench/**\`（除 \`bench/results/**\`）+ \`docs/core/**\``，7-a 命令与排除面三项（`:419`–`:423`）在盘；`:487` 记了修改理由（两处两说 = 漂移源）。 |
| 2 | 2 | §2:326 | 🟡 | Fixed | `\`docs/core/design/MODEL-BENCH.md\` 同串已归零（实测，见 5.），不在改点。` |
| 3 | 3 | §2:275–:281 | 🟡 | Fixed | `**头注自档名 + 兄弟档名提及（33 处 = 18 + 5 + 10；\`fixtures:2\` 一线同属 ① ③ ⇒ 去重 32 行）**`；② `**② \`test/fixtures.mjs\` 提及（5 处 · 非自档名）**：\`preflight:6\` · \`recompute:3\` · \`report-present:8\` · \`report-render:4\` · \`roster:6\``；③ 10 处逐条 · ④ 既存陈旧名；AC-2 七串类（`:416`）含 ⑥ 裸 `test/fixtures.mjs` 与 ⑦ 18 旧档名，边界论证 `:417`。 |
| 4 | 4 | §2:458 | 🟡 | Fixed | `**[知会]** 他批自担 ⑥ 收正：`…`⇒ **本批只需保证改名先落**；⑥ 的断言收正由该批同轮完成，本批不代改。` |
| 5 | 5 | §2:348–:355（5-b） | 🟡 | Fixed | `**取 (b)：把「归属面 = 批次目录」写成定义的构成要件**，不新立「产品自检码」第三类`；`:44` / `:49` 逐字追加 + `:98` 措辞 + `**§0 不动**`。 |
| 6 | 6 | §1:54–:59 | 🟡 | Fixed | `**用户改判（2026-10-18 07:24 / 07:26）——本条覆盖上文「按策略清」的授权口径**`（两行原文逐字在后）。 |
| 7 | 7 | §2:357–:365（5-c） | 🟡 | Fixed | `**取 (a)「保留当时命令 + 加改名标记」，把标记提到章首一行**`；§5.13 / §6 表前各一行 `**记录面说明**：本表为历史批次当时的用例读数…（当时 = …，改名后 = …）`；逐行加注否决理由（3 行破 300/450 字符线）；与 AC-2 豁免接口写明。 |
| 8 | 8 | §2:371 | 🔵 | Fixed | `**±0 行 · 字节随字面增减（不设阈值）**` |
| 9 | 9 | §2:384 · :468 | 🔵 | Fixed（附注） | 单源读数成立：`\| 1,745（原 1,741） \| **+4** \| 已落盘；读数单源 = 本行`，`:468` 只留行宽。仅行内交叉指针 `(\`:397\` 只留行宽读数)` 已过期——`:397` 现为 AC-4 行，行宽读数在 `:468`。 |
| 10 | 10 | §2:399 | 🔵 | Fixed | `（**提交前读**——单提交落地后恒空）` |
| 11 | 旧 #9 | §2:398 | 🔵 | Unfixed | `\| AC-5 \| 三条 \`--dry-run\` exit 0；\`git status --porcelain bench/results\` 空 \| 回归 \|` — 命令本体仍只在作废段（`:189`–`:191`，带 `<在册 label>`）。不阻塞。 |
| 12 | 旧 #12 | docs/core/design/TESTING.md:94 | 🔵 | Unfixed（本轮未复核） | 出本批射程的跨档读数滞后（「现盘实读 14 件」 vs 现盘 5）；按审阅范围未读该档。不阻塞。 |

**本轮实读核验（通过项）**：AC-2 可满足性成立——扫面 `bench/**`（除 `results/**`）+ `docs/core/**`，本批档（映射表 `:241`–`:258` 必写 18 旧路径）已移出；7-a `$face = @(Get-ChildItem bench -Recurse -File \| Where-Object { $_.FullName -notmatch '\\\\bench\\\\results\\\\' }) + @(Get-ChildItem docs\\core -Recurse -File)` 可逐字跑，读法 `residual = 0`，先红读数 `hits=53 · exempt=0 · residual=53`（全部在 `bench/**`，`docs/core/**` = 0）与 33 处清单 + §4 四组改点闭合；5-c 的 2 行章首说明落在豁免内。
**未见新 🔴**：定位判定段 `:225`–`:233` 与 §1 `:61`–`:65` 的 07:48 口径一致（输出 = `bench/results/` 产品输出 · `bench/check/` = 评估工具自身的测试代码）；判据 C 单源化后不再有第二个扫面。
**记录面偏差（不阻塞 · 供父侧落笔时一并处理）**：`:489` 声称三个已废词「改后 = **0**」，但现盘 §2 仍有：`⑤ §5.13 标题「测试承载」→「自检承载」、承载句、列头 \`测试文件\` → \`自检档\``（`:344`）与 `不新立「产品自检码」第三类`（`:350`，引用式用法）。属 R7e 文档一致性，报告不阻塞。

VERDICT: pass

### 轮次 5（评审子代理）

**评审对象**：`thincoder/docs/batches/2026-10-18-bench-test-cleanup.md` §2.13 `ForTest` → `ForCheck` 缝名收敛（`:570`–`:660`；声明路径 `docs/batches/…` 在工作区根不解析，实盘在 `thincoder/docs/batches/…`）——首次评审（用户 2026-10-18 08:03 裁定）。
**计数**：🔴 0 · 🟡 2 · 🔵 4（共 6 条）。

| # | Category | Severity | Issue | Suggestion |
|---|----------|----------|-------|------------|
| 1 | Doc hygiene | 🟡 | `:603` 用「自检面」——`:504` 已把这词列为「父侧发明、用户否定的错词」（五词之一），`:508` 的改法是「`自检面` → `测试面`」，`:499` 又写「三个已废词（§1 `:65` 所指）§2 归零」并交代「全文剩余 = §1 `:65`」；§2.13 是后加段 ⇒ 该「全文剩余」清单已不成立。 | 把 `:603` 改为「测试面只有 4 档消费」；`:333` 的「（自检面，已计入…）」同形处理，使 `:499` 的归零说法与盘面一致。 |
| 2 | Acceptance criteria | 🟡 | 第 4 号判据只做**缺席面**：`old_identifier_hits=0` 可由「把 4 个旧名从 `CONFIG.md:131` 整段删掉」满足（名录内容静默丢失也照样绿）；第 3 号强制的 `:134` 命名例外登记、以及该节自报的「该行 280 → 284 字符，不破 300 线」，全无判据兜底。 | 补正向判据并与「旧名 = 0」并列：`CONFIG.md:131` 含 4 个新名（逐个断言）· `:134` 含命名例外登记句 · 两行改后 ≤300 字符。 |
| 3 | Clarity | 🔵 | `:572`「4 个缝服务的是 `bench/check/`」不全：34 处里 10 处在产品 runner（`run.mjs:289-290` · `probe.mjs:278-279` · `toolcall.mjs:228`），是 `--judge-config` / `--prices` 的参数落点，`CONFIG.md:131` 自己把这两行标作「② 参数 / ③ 缝」。 | 依据句写明双向消费（产品参数落点 + check 测试档夹具），并让 `:134` 的例外理由与之一致，避免读成「纯 check 码缝」。 |
| 4 | Scope | 🔵 | 禁止面 `:636` 只写「不动 `thincoder-core/**` 的其它 `ForTest`」，授权面 §1 `:79` 是「`thincoder-core/**` 等其它模块的 `ForTest` 一律不动」；`:585`「`ForTest` 在本仓已固定指 `thincoder-core/**` 的真测试缝」也窄于实况（`API-CONTRACT.md:261` `_setLoadCoreForTest` = cli · `:427` cli · `:2512` desktop · `:3999` vscode）⇒ 字面照 `:636` 执行不禁止改到 cli / 桌面 / 端侧缝。 | 把 `:636` 射程与 §1 `:79` 对齐（core / cli / vscode / desktop / server / render-core），`:585` 改为「等其它模块」措辞。 |
| 5 | Document ownership | 🔵 | 例外登记只落 `:134`，而拥档 `CONFIG.md:108` 写「命名 / 成对例外 = 逐行标于名录」，`:130` 自身行内也带例外标记 + 「混合形口径见名录后」指针；只看 `:131` 名录行的人见 `…ForCheck` 无任何例外提示。 | `:131` 加短标记（该节自报改后 284 字符，再加 6 字「（命名例外）」仍在 300 内），`:134` 保留完整理由。 |
| 6 | Numeric | 🔵 | `:660` 档级读数「本节追加后 = **820 行**」，现盘 831 行；该对读数（728 → 820，+92 = 本节 91 内容行 + 尾随空行）内部自洽，但读数时点未标，无法与盘面复核。 | 标注读数时点（「追加后即刻」）或只留 Δ 不留绝对行数。 |

**本轮实读核验（通过项）**：4 个定义点 `bench/lib/judge.mjs:38` `:39` · `bench/lib/prices.mjs:29` `:30` 与 §1 `:77` 一致；第 2 号表的行 / 处**全对**——实扫 30 行 / 34 处（judge.check 6 · recompute 6 · run 4 · probe 4 · judge-fallback 4 · preflight 4 · judge 2 · prices 2 · toolcall 2）+ `CONFIG.md:131` 一行 4 处；全仓只有这 10 个文件命中 4 个旧名（`docs/batches/*.test.mjs` / MODEL-BENCH / README / 其它五包 = 0）⇒ `:602`「无 `export *` 再导出、无字符串拼接引用」与 `:604`「`setResultsDir` 无 `ForTest` 后缀」均成立；9 个代码档「现行行数」逐一实测吻合（278 / 160 / 310 / 310 / 262 / 297 / 230 / 137 / 167，`wc -l` 口径）；读点 `judge.mjs:35` · `prices.mjs:26` 确为 `?? 回落`；先例 `thincoder-core/config-io.mjs:37-42` 实为 set / reset 成对 + 模块级 `let _pathOverride` + `?? configPath`，与 `CONFIG.md:111` 同一坐标；`node bench/check/run.mjs` 在盘；`:613` 选 `:134` 而非 `:131` 承载例外标记的 300 字符理由是实的（`:134` 现约 150 字符）；先例行 `:657` 带实现坐标 + 对齐 / 偏离理由（偏离 = `ForCheck` 后缀，明写为何既有形态不适用），勘察行 `:658` 明写公开源档 **none relevant**；未新建文件、改的是拥档（`CONFIG.md` §6.2 名录）⇒ 文档归属无碎片化；受影响面全为既有源码档且行数标注齐备（最大 310 行，无 500 / 800 分档问题）。**风险面实测无阻断**：漏改调用点仍带 `ForTest` 字面 ⇒ 被 `bench_ForTest_lines=0` 抓，用例表「边界 / 错误」两行的「档即红」成立。
**限制声明**：按评审范围只读本批档；为核 §2.13 的坐标 / 行数 / 计数做了定向 spot-check 读（`bench/lib/judge.mjs` · `prices.mjs` · `run.mjs` · `probe.mjs` · `toolcall.mjs` · 4 个 `.check.mjs` · `CONFIG.md` §6.2 · `API-CONTRACT.md` · `thincoder-core/config-io.mjs`），未改任何档；未跑 `node bench/check/run.mjs`（无 shell），`tests 116` 取自 §5 记录；`docs/core/**` 的「裸 `ForTest` 126 行」未逐行复算（只抽查到 `CONFIG.md:108` `:111` `:123` `:124` `:129` `:130` `:131` 确有 `ForTest` 形态）；文档地图未随上下文提供（AGENTS.md 指向 `thincoder/docs/README.md`），归属按拥档主题判据判断。

**出范围（无严重度）**：① §2 `:500`「本档 **566 → 575 行**（终态）」与 `:660` 的「728 → 820」两处自报读数不可能同时为真（中间仅措辞清理轮 67 行）——跨段读数滞后，不在 §2.13 射程；② §5 状态行「修正轮 0」会在本节落地后失效（实施 / 验证记录面，非本评审对象）；③ 评审对象声明路径 `docs/batches/…` 不解析，实盘在 `thincoder/docs/batches/…`。

VERDICT: pass

### 轮次 6（评审子代理）

**评审对象**：`thincoder/docs/batches/2026-10-18-bench-test-cleanup.md` §2.14「引擎面去 `test`：自写 harness 替代 Node 内置测试运行器」（`:676`–`:907`，含 §2.14 收正 `:842`–`:845` 与收紧轮 `:847` 起）——首次评审（用户 2026-10-18 08:17 裁定「`node --test` 不用，手动实现」）。声明路径 `docs/batches/…` 在工作区根不解析，实盘在 `thincoder/docs/batches/…`。
**计数**：🔴 0 · 🟡 5 · 🔵 5（共 10 条）。

| # | Category | Severity | Issue | Suggestion |
|---|----------|----------|-------|------------|
| 1 | Document ownership | 🟡 | 新增常驻组件 `bench/check/harness.mjs`（执行模型 / 输出格式 / 退出码契约）只住批档；§8 把拥档设计档列为零触：`不动 \`bench/results/**\`、\`MODEL-BENCH.md\`、\`TESTING.md\`、\`CONFIG.md\`、\`bench/README.md\``（`:820`）。实读拥档现行面仍以旧引擎解释反查理由：`（\`node --test\` 对不存在的档静默忽略，故反查必须双向）`（`thincoder/docs/core/design/MODEL-BENCH.md:690`）⇒ 本单落地后该句为假理由。`:835` 已登记并要求另笔，但笔主即本席，且 AGENTS.md 要求设计决定当轮入档。 | 在 `MODEL-BENCH.md` §3「验证方式」段加 3–5 行机制句（引擎 = `check/harness.mjs` 的 `check/after/run` · 汇总行形态 · 逐档子进程 + 60 s 超时），同轮改写 `:690` 括号理由；避免「常驻组件契约只住可清理批档」（与本单判据「文件里不许留只有批档才解释得通的编号」同理）。 |
| 2 | Acceptance criteria | 🟡 | J4 要**正向命中中文字串**：`[int]($out -match '评估工具自身的测试代码')`（`:783`），而 `$out` 由 `(node bench/check/run.mjs 2>&1)` 捕获；本批 §5 已登记同形缺陷：`PowerShell 5.1 默认编码把中文打成乱码 ⇒ \`命名例外\` 恒不命中、读数恒 0（假红）`（`:1129`）。同源风险覆盖 J5 的 `ℹ` 字面 ⇒ 非 UTF-8 控制台下 `ownership=0` 是假红。 | 命令块首行钉解码（`[Console]::OutputEncoding = [Text.Encoding]::UTF8` 或 `chcp 65001`），或把该判据改 ASCII 锚点（归属行前缀 + 另以 `-Encoding UTF8` 读回中文行）；`ℹ` 同处理。 |
| 3 | Doc-state | 🟡 | §2.14 §12 只声明「改形」：`§2.13 第 4 号判据里的 \`tests 116 · pass 116 · fail 0\` 读数在本单后改形为 \`bench/check: 116 passed, 0 failed\``（`:838`），但 §2.13 §4 判据本体仍在规范面要求旧形：`runner exit 0 ∧ \`tests 116\` · \`pass 116\` · \`fail 0\`（**恰 116，不许多不许少**）`（`:640`）⇒ 落地后照该块复跑必假红，且两处口径互斥。 | 在 §2.13 §4 期望行就地改新形并注「形随 §2.14 引擎更换」，或该块首加一行取代句；全档留一处口径。 |
| 4 | Doc hygiene | 🟡 | 失效读数留规范面、靠下游「作废」收口：`:840` 仍写 `本节追加前本档 = **831 行 / 118,xxx B**（口径 = 文件内 \`\n\` 计数）`，作废在 `:844`（`第 13 号原文的「831 行 / 118,xxx B」作废`）；`:683` 仍写 `（父侧派单写 6；本席实扫 7，逐点见第 5 号）`，指针落空的更正只在 `:845`。历史应住记录面（§3 / §5）。 | 删 `:840` 的 `831 行 / 118,xxx B` 与 `:683` 的「逐点见第 5 号」指针；读数与逐点清单各留一处（或改「本节追加后 1,023 行」单值）。 |
| 5 | Acceptance criteria | 🟡 | J1/J2 扫面是 `bench/**` 全集（`# J1  bench/**（除 results）内 node:test = 0`，`:771`），而「不得出现字面」的约束只写在 harness 契约表「注释面」一行、对象是「档头注释」：`\| 注释面 \| 档头注释**不得**出现 \`node:test\` 字面（否则判据 ① 自红） \|`（`:703`）⇒ `harness.mjs` / `run.mjs` 的头注与任何非档头注释在判据面内、不在规则面内（最自然写法「替代 node:test」即自红）。 | 把该规则扩到 J1/J2 全扫面的所有文件与注释（点名 `harness.mjs` / `run.mjs`），或把 J1/J2 面收窄到 `*.check.mjs` 并另设对 harness/run.mjs 的显式判据。 |
| 6 | Numeric | 🔵 | `judge-fallback.check.mjs` 唯一别名档：`:17` 同时从 helpers 取 `run` 构造器（2 个调用点）（`:728`）——实读 `run(` 调用 **3** 处（`judge-fallback.check.mjs:148` · `:168` · `:206`）；结论（`run as runChecks` 必需）不变。 | 改「3 个调用点」。 |
| 7 | Numeric | 🔵 | 两个墙钟读数并列未标基准：`:681` 记 `ℹ duration_ms 7416`（旧引擎单进程汇总），`:875` 记 `逐档墙钟 = 106–658 ms`、「整轮 4,987 ms」；`60,000 ms ≈ 91× 最重档` 按哪个基准算未写。 | 各读数加基准（逐档串行 spawn 之和 / 旧引擎 duration_ms），余量按同基准表述。 |
| 8 | Scope | 🔵 | AC 批号清理的判据写成通用规则：`批档可整批清理 ⇒ 文件里不许留只有批档才解释得通的编号`（`:750`），射程只到 `bench/check`（61 处）；同类 `bench/lib/*` 7 行 + `bench/suites/*` 4 行明列边界外（`:752`）。 | 在 §4 首行写明本单射程 = `bench/check/**` 并指向 `:752` 的另批登记。 |
| 9 | Requirements（上抛完整性） | 🔵 | 保留 `node:assert/strict` 是对用户 08:17「不要用『免费』的」的一次收窄，理由写在 §5（`④ \`ensure(cond, msg)\` 只能表达布尔条件，\`deepEqual\` / \`throws\` / \`match\` 的精确 diff 会退化`，`:897`），但 §12「上抛 / 知会」未列该偏离——父侧 / 用户读的是 §12。 | §12 加一条知会：`node:assert/strict` 保留（原语非框架）+ 理由指针（§5）。 |
| 10 | Acceptance criteria | 🔵 | 7 处 `after` 清运（`:845` 逐点）只有错误侧用例：`\| 边界（\`after\` 抛） \| 临时让 \`after\` 抛 \| stderr 一行 \`after 清理异常…\`；主结果 / 退出码不变 \|`（`:804`）——**绿路径**是否真清掉沙箱无判据 / 用例行，而「隔离自己写」正是本次收紧核心之一。 | 用例表加一行：全绿跑后临时目录（`bench-sandbox-*` / `bench-fixtures-*`）不存在，或 `helpers.mjs` 清运后打印一行读数入 §5。 |

**本轮实读核验（通过项）**：116 个裸 `test(` 调用实测成立，逐档分布（graders 14 · judge 15 · judge-fallback 6 · metrics 9 · preflight 3 · probe-report 4 · probe 9 · recompute 6 · report-present 7 · report-render 10 · roster 7 · suite 14 · timing 3 · toolcall 6 · toolcall-report 3）与 `:682` **逐格全等**，合计 116；`node:test` import = **11**（10 个 `.check.mjs` + `helpers.mjs`），4 处 `import { test }` / 6 处 `import { after, test }` 与 `:726` 的拆分全等且行号（`:10` `:14` `:13` `:11` `:15` 等）逐一吻合；`after(` = **7** 且坐标与 `:845` 逐点全等（`helpers:21` · `preflight:25` · `probe-report:21` · `probe:32` · `roster:33` · `toolcall-report:24` · `toolcall:33`）；`describe(` / `before(` / `beforeEach(` / `afterEach(` / `.skip(` / `.todo(` / `.only(` / `concurrency` / `timeout:` 全 **0** 命中；以 J2 原正则（负向后行断言）扫 `bench/**`（除 results）只命中上述 116 处 ⇒ 产品侧零裸 `test(` ⇒ J2 = 0 可达；`AC-\d+` = **61 处 / 50 行**（与 `:685` 一致，且 §4 四类小计 23+27+7+4 = 61 / 17+23+7+3 = 50 自洽）；`helpers.mjs:10` / `:14` / `:21` / `:58` 与设计假设全等（`:58` 确为 `export const run = (verdict, tokens, …)` ⇒ 别名档判断成立；15 档内模块级 `run` 冲突只此一档，其余 `const run` / `const { run }` 均在回调内，合法遮蔽）；无任何 `const/let/var/function check` ⇒ 导入不撞名；`run.mjs` = **84** 内容行（尾随空行口径 85），`--test` 共 3 处（`:11` 理由句 · `:14` 执行句 · `:83` 实际 spawn）均落在 §3 已声明的改写点内 ⇒ J7 `test_flag=0` 可达；15 档行数抽查（graders 278 · toolcall 295 · judge-fallback 230）与 `:707`–`:723` 全等、合计 3,265 自洽、最大 304 行 ⇒ 无 500 / 800 分档问题，受影响面行数标注齐备（criterion 8 通过）；`bench/README.md` 的 `node --test` / `node:test` / `--test` 实测 **0** 命中 ⇒「跑法句不变」成立；先例行 `:830`（含实现坐标 ∥ 对齐 ∥ 偏离理由）与勘察行 `:831`（明写公开源档 **none relevant**）均在盘 ⇒ criteria 9 / 10 通过；未新建文档档、无主题碎片化。
**限制声明**：按评审范围只读本批档；为核 `:682`–`:845` 的坐标 / 行数 / 计数做了定向 spot-check 读（`bench/check/` 全目录 · `bench/check/helpers.mjs` · `bench/check/run.mjs` · `bench/README.md` · `MODEL-BENCH.md:690`），未改任何档；本评审未执行任何命令（无 shell 工具），所有运行时读数（逐档墙钟、`tests 116`）取自设计 / 记录自述，未复测；文档地图未随上下文提供（AGENTS.md 指向 `thincoder/docs/README.md`），归属按拥档主题判据判断；项目标准文档未声明。
VERDICT: pass

## §4 用户批准（主 agent）
## §5 实施记录（eng-coder）
**状态行**：实施完成 2026-10-18（§2.14 引擎面（自写 harness）落盘：J1–J6 全绿 · 审计 1 轮 CLEAN · 代码评审 1 轮 pass（非阻塞 🟡2 / 🔵4）· 修正轮 1；此前 18 档改名轮与 §2.13 ForCheck 轮各自审计 CLEAN / 评审 pass）



**实施摘要（eng-coder · 2026-10-18 07:5x · 依据 = §2 改判轮段，现行设计）**

按 §2 完成：18 档 `bench/test/*` → `bench/check/*`（15 档 `*.check.mjs` + `helpers.mjs` + `probe-frozen.mjs` + `toolcall-frozen.mjs`）；四项连带撞词改名（`bench/cases/`→`bench/suites/` 10 档 · `bench/probe/fixtures.mjs`→`data.mjs` · `bench/toolcall/fixture.mjs`→`data.mjs` · `bench/toolcall/cases.mjs`→`prompts.mjs`）；新增 `bench/check/run.mjs`（三启动前判据 + `spawnSync(node --test)`）；`bench/README.md` 五处按 §2.5 落盘。31 个路径全部 `git mv`（历史可 `--follow`）；45 个已跟踪文件 = **116 insert / 116 delete**，逐行实读均为路径字面（无断言 / 题面 / 判据 / 夹具改动）。`bench/results/**`、`docs/core/**`、产品三包、CI、`package.json` 零触。

**逐项处置（映射 + 引用点）**

| 组 | 处置 | 读数 |
|---|---|---|
| 18 档改名 | 按 §2.1 映射表逐档 `git mv`；15 档后缀 `.test.mjs`→`.check.mjs`、`fixtures.mjs`→`helpers.mjs`、两冻结副本去 `fixtures.` | 18/18 在盘；`git diff --cached --stat` = 31 纯 rename / 0 行改 |
| ① 18 档自档头注 `:2` | ` * test/<旧> —` → ` * check/<新> —` | 18/18 实扫 |
| ② `test/fixtures.mjs` 提及（5 处） | `preflight:6` · `recompute:3` · `report-present:8` · `report-render:4` · `roster:6` → `check/helpers.mjs` | 5/5 |
| ③ 兄弟档名（10 处） | `judge:6` · `probe:6` · `report-present:2` · `roster:3`/`:76` · `suite:4` · `toolcall:6` · `helpers:174` → 新档名 | 10/10 |
| ④ 既存陈旧名 | `helpers:2`/`:3` 的 `report-recompute.test.mjs` → 现行两档口径（`recompute.check.mjs` ∕ `report-render.check.mjs`），语义不变 | 2/2 |
| 15 档跑法句 | `node --test "bench/test/*.test.mjs"` → `node bench/check/run.mjs` | 15/15 |
| 9 档 `./fixtures.mjs` | → `./helpers.mjs`（graders / judge / judge-fallback / preflight / recompute / report-present / report-render / roster / suite） | 9/9 |
| `../cases/` 运行面（8 处） | `run.mjs:22` · `lib/judge:14` · `pipeline:15` · `rejudge:19` · `report-review:9` · `report-tables:8` · `report:9` · `roster:14` → `../suites/` | 8/8 |
| 自检面 `../cases/`（4 档 10 行） | graders 6 行 · judge 1 · report-render 1 · suite 2 → `../suites/` | 10/10 |
| 路径字面 | `graders.check.mjs:261` `join(BENCH_DIR, "cases", …)` → `"suites"` | 1/1 |
| 注释 `cases/`（11 处） | `suites/*.mjs:2` ×10 + `lib/report-review.mjs:5` → `suites/` | 11/11 |
| probe 夹具改名 | `probe.mjs:22` import · `probe/data.mjs:2`/`:5` · `probe.check:15`/`:60` · `probe-frozen:4`/`:6` | 7/7 |
| toolcall 夹具改名 | `toolcall.mjs:19` · `data.mjs:2`/`:5` · `prompts.mjs:6`/`:11` · `variants:6`/`:7`/`:14` · `toolcall.check:23`/`:83`/`:85`/`:89` · `toolcall-frozen:4` | 13/13 |
| toolcall 用例集改名 | `toolcall.mjs:18` · `toolcall/report:11` · `prompts:2` · `data.mjs:5` · `toolcall.check:19`/`:85` · `toolcall-report.check:15` · `toolcall-frozen:5` | 8/8 |
| 第三处死指针 | `lib/client.mjs:89` `bench/test/judge.test.mjs` → `bench/check/judge.check.mjs` | 1/1 |
| README | `:76`/`:91` `bench/suites/index.mjs`；`:229` 边界句（评估工具自身测试代码 + `node bench/check/run.mjs` 全跑）；`:241` 树行 `suites/`；`:243` 树行 `check/` | 5/5 |
| 新增入口 | `bench/check/run.mjs`（85 行）：15 项 `CHECK_FILES` 固定顺序 1–15；① 盘上 ⊆ 清单（递归 + 软链目录检出）② 清单 ⊆ 盘上 ③ 空清单拒跑；`spawnSync(process.execPath, ["--test", …绝对路径], { stdio: "inherit" })`；`process.exit(result.status ?? 1)`；`CHECK_DIR` 按本档位置解析（cwd 不敏感） | 契约逐条在盘 |

**超出 §2 清单的引用点（如实登记 · 同一规则补齐）**：`roster.check.mjs:26` 注释「体例同 `fixtures.mjs`」也是对被改档的裸名引用（§2.1 ② 未列），按同一规则改为 `helpers.mjs`。仅注释字面，无逻辑改。

**六条验收读数（本席亲跑，cwd = `thincoder/`）**

| # | 判据 | 读数 |
|---|---|---|
| ① | `bench/` 下名字含 `test` 的文件 / 目录 = 0 | 判据 A 命令输出 `[]` |
| ② | AC-2 七串类机检（7-a 逐字跑，扫面 `bench/**` 除 `bench/results/**` + `docs/core/**`） | 改前 `hits=53 · exempt=0 · residual=53`；改后 **`hits=0 · exempt=0 · residual=0`** |
| ③ | `node bench/check/run.mjs` | **exit 0**；`ℹ tests 116 · pass 116 · fail 0`；盘上 `.check.mjs` = 15 = 清单项数 |
| ④ | AC-4 三条反查阴性实测（临时造未登记档 / 移走清单档 / 清单置空；测后全部还原） | ① exit 1 + `盘上未登记的 *.check.mjs：zzz-temp.check.mjs`；② exit 1 + `清单项不在盘：roster.check.mjs`；③ exit 1 + `判据 ③：清单为空…` |
| ⑤ | 三条 `--dry-run`（label = 在册 `mimo-v2.6-flash`；`--results-dir .thincoder/tmp/bench-cleanup-check`） | `bench/run.mjs` **exit 0** · `probe.mjs` **exit 0** · `toolcall.mjs` **exit 0**；`git status --porcelain bench/results` **空** |
| ⑥ | 版本轴 / 内容零改 | `SUITE_VERSION = 7`（`suites/index.mjs:24`）· `judge.json.frozenAtSuiteVersion = 7` · `PROBE_VERSION = 1`（`probe/data.mjs:15`）· `TOOL_PROBE_VERSION = 1`（`toolcall/data.mjs:15`）；`toolcall/prompts.mjs` 的 14 条题面逐字未动（含 `tool.5` 的 `node --test` 载荷） |

**审计 / 评审轮次与终态**

- **内部 explore 审计（1 轮）**：终态 **CLEAN** —— 四类偏差（PARTIAL / SILENT-SIMPLIFICATION / DOC-DRIFT / OUT-OF-LIST）0 条；名字面、旧路径面、import 图、版本轴、越界面（bench 下 mtime = 本批的 46 文件 = 45 已跟踪 + `run.mjs`，无第 47 个）全过。
- **独立代码评审 advisor（1 轮 · 全量）**：**pass**（🔴 0 · 必改 🟡 0 · 🔵 3）。响应表：

| # | 来源 | 级别 | 处置 |
|---|---|---|---|
| 1 | advisor | 🔵 | `run.mjs` 软链处 `statSync` 对**断链**抛 ENOENT（未捕获）⇒ 仍 exit 1 但非「点名」形态。**接受**：契约只约定「软链目录 ⇒ 拒跑」；断链不在契约面，且失败码语义不变（exit 1）。留作另批可选项。 |
| 2 | advisor | 🔵 | `fail()` 的 `console.error` → `process.exit(1)` 在 stderr 重定向时理论上可能截断点名行。**接受**：本轮 AC-4 三条阴性实测的输出经管道捕获、点名行完整（读数见 ④）。 |
| 3 | advisor | 🔵 | 设计 §2.6 估 `+≈55 行`，实测 `run.mjs` = **85 行**。**已记入本段**（读数以本段 85 行为准）。 |

- **修正轮次 = 0**（审计 / 评审均无必改项，未产生 fix round）。

**交付面 `git status --short` 摘要（bench 域）**：31 项 `RM`（旧→新 rename + 同行内容改）+ 14 项 ` M`（lib / runner / README / toolcall 源码）+ `?? bench/check/run.mjs`；`bench/results` 0 项；`bench/` 域外文件本笔未动。

**出范围（本席未触 · 已在评审出范围说明登记）**：`docs/core/design/MODEL-BENCH.md` 仍用已废词「产品自检 / 产品自检码」（`:690` `:1200` `:1515` `:1742`）且 5-c 两行记录面说明未落；`docs/core/requirements/TESTING.md:98` / §1.2 待主 agent 落；`bench/probe/data.mjs` 与 `bench/toolcall/data.mjs` 的原 `fixtures` 头注已随 B/C 收正（`#1646` 可核销）。

### §2.13 `ForTest` → `ForCheck` 缝名收敛（fix 轮 · 2026-10-18 08:1x）

**依据**：§2.13（用户 2026-10-18 08:03「改名 …ForTest 也要做」）。纯标识符改名：行为 / 断言 / 题面 / 参数名（`--judge-config` / `--prices`）/ 结果 JSON 键 / 中文注释措辞零改。

**逐文件改动表（10 档 · 代码 30 行 / 34 处 + `CONFIG.md` 2 行）**

| 文件 | 行 | 处 | 改动 |
|---|---|---|---|
| `bench/lib/judge.mjs` | `:38` `:39` | 2 | 定义名 → `_setJudgeConfigPathForCheck` / `_resetJudgeConfigPathForCheck`；函数体逐字不动（`_judgeConfigPath = resolve(p)` / `= null`） |
| `bench/lib/prices.mjs` | `:29` `:30` | 2 | 定义名 → `_setPricesPathForCheck` / `_resetPricesPathForCheck`（`_pricesPath = resolve(p)` / `= null` 不动） |
| `bench/run.mjs` | `:26` `:27` `:289` `:290` | 4 | import ×2 + 参数应用 ×2 |
| `bench/probe.mjs` | `:14` `:16` `:278` `:279` | 4 | import ×2 + 参数应用 ×2 |
| `bench/toolcall.mjs` | `:16` `:228` | 2 | import ×1 + 参数应用 ×1 |
| `bench/check/judge.check.mjs` | `:13` `:88` `:93` `:103` `:104` | 6 | import 双名 ×1 + 置缝 ×2 + `finally` 复位 ×2 |
| `bench/check/judge-fallback.check.mjs` | `:11` `:177` `:228` | 4 | import 双名 ×1 + 置缝 ×1 + 复位 ×1 |
| `bench/check/preflight.check.mjs` | `:16` `:127` `:135` | 4 | import 双名 ×1 + 置缝 ×1 + 复位 ×1 |
| `bench/check/recompute.check.mjs` | `:10` `:91` `:93` `:149` `:151` | 6 | import 双名 ×1 + 置缝 ×2 + `finally` 复位 ×2 |
| `docs/core/design/CONFIG.md` | `:131` | 4 | 名录行 4 名原地换新名 + 短标记 `（命名例外）`（落单元格末 = 尾 `|` 前，表格渲染可见；该行 **290 字符**，与设计预估 290 一致，≤300） |
| `docs/core/design/CONFIG.md` | `:134` | — | 混合形例外登记末追加完整理由 `；bench 判官 / 价格表四缝 \`…ForCheck\` → 命名例外〔评估工具自身的测试代码面〕`（该行 207 字符） |

**六条判据读数（cwd = `thincoder/` · 命令 = §2.13 第 4 号）**

| # | 判据 | 改前（先红） | 改后 |
|---|---|---|---|
| ① | `old_identifier_hits` | **31**（`bench/**` 30 行 + `CONFIG.md:131` 1 行） | **0** |
| ② | `bench_ForTest_lines` | **30** | **0** |
| ③ | `cfg_new_names` | 0 | **4** |
| ④ | `cfg_exception_line` | 0 | **2**（UTF-8 形态 / `node` 行扫）；同一命令原形态读 0 —— 见下「判据 ④ 的命令缺陷」 |
| ⑤ | `node bench/check/run.mjs` | exit 0 · `tests 116` · `pass 116` · `fail 0` | **exit 0 · `tests 116` · `pass 116` · `fail 0`**（恰 116） |
| ⑥ | 10 档行数（LF 口径） | 278 / 160 / 310 / 310 / 262 / 297 / 230 / 137 / 167 / 201 | **逐档不变** |

**判据 ④ 的命令缺陷（如实登记 · 判据本体不改）**：第 4 号原命令用 `Get-Content -Raw` 读 `CONFIG.md`，PowerShell 5.1 默认编码把中文打成乱码 ⇒ `命名例外` 恒不命中、读数恒 0（假红）。同一文件 UTF-8 形态读 = **2**（`:131` / `:134` 各 1 行），`node` 行扫同读数 = 2。⇒ 判据本体成立（≥1），缺陷在读码方式（与「中文串判据须用 UTF-8 形态」同源）。建议父侧把该行加 `-Encoding UTF8`（或改 node 行扫）。

**审计 / 评审轮次与终态**

- **内部 explore 审计（1 轮）**：终态 **CLEAN** —— 四类偏差（PARTIAL / SILENT-SIMPLIFICATION / DOC-DRIFT / OUT-OF-LIST）0 条；逐处位置与 §2.13 第 2 号表逐行一致（无行位移），10 档行数全等，禁止面（其它六包 `ForTest` / `setResultsDir` / `bench/results/**` / `MODEL-BENCH.md` / `TESTING.md` / `bench/README.md`）零触。
- **独立代码评审 advisor（1 轮 · 全量）**：**pass**（🔴 0 · 必改 🟡 0 · 🔵 3）。

| # | 来源 | 级别 | 处置 |
|---|---|---|---|
| 1 | advisor | 🔵 | `CONFIG.md:131` 的 `（命名例外）` 无指针（`:130` 有「混合形口径见名录后」）。**不采纳**：§2.13 §3 第 1 条逐字锁定「行末加短标记 `（命名例外）`」并把该行定在 290 字符；加指针破该读数，完整理由按设计住 `:134`。 |
| 2 | advisor | 🔵 | `bench/lib/judge.mjs:37` 注释仍写「测试 set / reset 复原」。**不采纳（本批）**：§2.13 §3「只改标识符面，不改注释措辞」——另批可选。 |
| 3 | advisor | 🔵 | `bench/lib/prices.mjs:28` 同形。**同上**。 |

- **修正轮次 = 0**（审计 / 评审均无必改项）。

**字节 / 范围面**：`bench/**` 34 处 × +1 B = +34 B；`CONFIG.md` 改名 +4 B + `:131` 短标记 6 字 + `:134` 理由句。本笔写盘面 = 上述 10 档，`bench/results` 0 项，域外零触。

**出范围（本席未触）**：§2.13 §2 的「4 个缝服务的是 `bench/check/`」表述（34 处中 10 处在产品 runner 的参数落点）· 其它六包 `ForTest` · `setResultsDir` · 注释措辞。

### §2.14 引擎面去 `test`：自写 harness 实施（2026-10-18 08:2x–08:5x）

**依据**：§2.14 + 收紧轮（用户 2026-10-18 08:17「node --test 我不希望用……我希望你手动实现」）。**实施面**：新增 1（`harness.mjs`）+ 修改 17（15 档 + `helpers.mjs` + `run.mjs`）。断言表达式 / 期望值 / 题面 / 夹具数据零改——`assert.*` 逐档计数与 index 版本全等（15/15）。

**逐文件改动表**

| 文件 | 行数 | 改动 |
|---|---|---|
| `bench/check/harness.mjs` | 0 → 71（新增） | 导出 `check` / `after` / `run`；登记 ≠ 执行；按登记顺序串行 await；失败打印异常原文（`err?.stack ?? String(err)`，stderr）后继续；`ok <i> - <name>`（stdout）；汇总 `bench/check: <P> passed, <F> failed` 恒为该档 stdout 末行；`failed > 0 ⇒ exitCode 1`；三计数器 + `total === passed + failed` 自校验；`after` 队列吞异常（一行）；`beforeExit` 漏调保护；执行期持 ref'd 保活句柄（见「实现注记」） |
| `bench/check/run.mjs` | 84 → 110（Δ +26） | 首行归属声明先于判据；三启动前判据逻辑零改（仅理由句改现形）；逐档 `spawnSync(process.execPath, [档], { encoding: "utf8", timeout: 60000 })`；`ETIMEDOUT` ⇒ `<档>（超时 >60 s）`；逐档 stdout / stderr 逐字回显；聚合 `^bench/check: (\d+) passed, (\d+) failed$`；失败点名单（stderr）先于末行汇总（stdout）；exit 0 仅当全档 status 0 ∧ ΣF = 0 |
| `bench/check/helpers.mjs` | 204（±0） | `:10` → `import { after, check } from "./harness.mjs"`；`:14` → `export { assert, check }`；**不引 `run`**（`:58` 的 `run` 构造器独占） |
| 15 档 | 3,265 → 3,300（+35） | `test(` → `check(` ×116；import 面逐档换 harness（10 档原生 import / 5 档经 helpers）；档末 `await run()`（judge-fallback = `run as runChecks` + `await runChecks()`）；AC 批号 61 处 / 50 行清空 |

**判据读数（cwd = `thincoder/` · 命令 = §2.14 第 6 号块 + 收紧轮 J5/J7）**

| # | 判据 | 先红 | 改后（本席亲跑） |
|---|---|---|---|
| J1 | `node:test`（bench/** 除 results） | 11（10 档 + helpers 的 import） | **0** |
| J2 | 裸 `test(` | 116 | **0** |
| J3 | `check(`（15 档） | 0 | **116** |
| J4 | runner | exit 0 · ℹ tests 116 / pass 116 / fail 0（父侧实跑） | **exit=0 · total_116=1 · ownership=1 · ownership_cn=1** |
| J5 | 引擎计量行 | ℹ tests=1 · ℹ pass=1（父侧实跑） | **info_tests=0 · info_pass=0** |
| J6 | `AC-\d+`（bench/check） | 61 | **0** |
| J5 收紧 | info_lines / metering_lines / last_line_ok | —— | **0 / 0 / 1** |
| J7 | 超时接线 / `--test` 残留 | —— | **timeout_wired=1 · test_flag=0** |

- 先红来源：J1 / J2 / J6 = 对 `git show :` 的 15 档 + helpers 实扫（11 处 `node:test`、116 个裸 `test(`、61 处 AC）；J4 / J5 = 父侧派单实测（旧引擎）。旧引擎已被替换，未复跑先红。
- 绿路径清运：全绿跑后 `bench-sandbox-*` / `bench-fixtures-*` = **0 / 0**（7 处 `after` 同形 `rmSync`）。

**失败 / 边界路径实测（harness 临时自检档，用毕已删）**

| 路径 | 实测 |
|---|---|
| 单条红 | `ok 1` · `FAIL 2`（异常原文 stderr）· `ok 3`；汇总 `2 passed, 1 failed`；exit 1 |
| `after` 抛 | stderr 一行 `after 清理异常（不影响主结果）：cleanup boom`；主结果 / 退出码不变 |
| `run()` 二次调用 | no-op（无重复输出） |
| 漏调 `run()` | `beforeExit` 报错 + 无汇总行 + exit 1 |

**审计 / 评审轮次与终态**

- **内部 explore 审计（1 轮）**：终态 **CLEAN** —— PARTIAL / SILENT-SIMPLIFICATION / DOC-DRIFT / OUT-OF-LIST 0 条；逐档调用数 / 行数 / 末字段与 §2.14 第 2 号表全等。非偏差观察 3 条：① `FAIL` 行流（设计表写 stderr）——**采纳**，修正轮 1；② `bench-prices-*` 临时目录（metrics 用例既有面，不在清运判据枚举）——如实登记、非本单；③ 保活句柄必要——接受，记入实现注记。审计无 shell 工具，J4 / J5 未由其复跑（本席亲跑读数见上）。
- **独立代码评审 advisor（1 轮 · 全量）**：**pass**（🔴 0 · 必改 🟡 0 · 非阻塞 🟡 2 · 🔵 4）。

| # | 来源 | 级别 | 处置 |
|---|---|---|---|
| 1 | advisor | 🟡 | 整档失败时末行只报 ΣF（档崩溃 / 超时 / 缺汇总行不进计数，末行可能 `N passed, 0 failed` + exit 1）。**接受为设计改进项**：现行实现与收紧轮「末行 = ΣP/ΣF」逐字一致；改读数形需设计档先改，本单不擅自改判据面。 |
| 2 | advisor | 🟡 | 保活句柄未写入 §2.14 语义表与 `MODEL-BENCH.md` §3 机制句（只住档头注释）。**接受为设计缺口**：常驻组件契约应住设计档（设计席笔），本单不代改；代码侧注释已在位。 |
| 3 | advisor | 🔵 | `spawnSync` 未设 `maxBuffer`（默认 1 MB/流）。**不采纳（本单）**：§2.14 第 3 号逐字指定该调用形态；当前体量远低上限，登记另批可选。 |
| 4 | advisor | 🔵 | 单档注册 0 条不被判红。**不采纳（本单）**：新增守卫需设计档先立判据。 |
| 5 | advisor | 🔵 | `toolcall-frozen.mjs` 的 `node --test` 题面载荷（数据面，§2.14 第 9 号明令不动）。**接受（无需动作）**：J7 扫描面 = `run.mjs` 单档，登记为已明示例外。 |
| 6 | advisor | 🔵 | §2.14 第 8 号 Δ 估算漂移（`harness.mjs` 估 +≈50 / 实测 71；`run.mjs` 估 ≈105 / 实测 110）。**接受**：本段读数即实测单源。 |

- **审计 / 评审终态**：**clean（converged）**。修正轮次 = **1**（`FAIL` 行按设计表移至 stderr）。另 1 次实现内修复 = 保活句柄（发生在首次全跑，非审计轮）。评审后无代码改动。

**实现注记（设计未列，实现必需）**

- **保活句柄**：`run()` 执行期持 `setInterval(() => {}, 1 << 30)`，收尾 `clearInterval`。原因：`timing.check.mjs` 的挂起传输只由 `AbortSignal.timeout` 的 **unref'd** 定时器释放；不保活则事件循环提前清空（exit 13 / unsettled top-level await）。旧引擎自带句柄掩盖了这一点；harness 自己保活以维持既有行为（不是隐式单例超时）。
- **`run as runChecks`**：`judge-fallback.check.mjs` 模块级已从 helpers 取 `run` 构造器（3 个调用点），harness 的 `run` 只能别名进档。
- **`MODEL-BENCH.md`**：§3 引擎机制句（`:691`–`:693`）与 `:690` 理由句已在盘，属前轮落盘；父侧派单明令本单不动，本单零触。

**出范围（本席未触）**

- `bench/lib/*` 7 行 + `bench/suites/*` 4 行仍带 `AC-x`（产品源码面，§2.14 第 4 号末条已登记另批）。
- `MODEL-BENCH.md` 记录面 `:1000` / `:1136` 的历史引擎串（记录面债务，非本单引入）。
- §2.14 §7 用例表的「档加载即崩 / 漏改调用名」两条 runner 级路径未单独构造（代码路径 = `status !== 0 || !summary` 与 `beforeExit`，已静态核对；harness 级等价路径已实测）。

## §6 验证与收口（父代理）

### 一、本批交付（五段）

| 段 | 内容 | 验证（父侧亲验） |
|---|---|---|
| `#144` | `bench/test/` 18 档 → `bench/check/*.check.mjs` + 四项撞词（`cases/`→`suites/` · `fixture(s).mjs`→`data.mjs` ×2 · `toolcall/cases.mjs`→`prompts.mjs`）+ 33 处引用 + 新增 `run.mjs` | 名字含 `test` = `[]` · `residual=0`（改前 53）· 116/116 · 45 档 `git diff` 逐档 N/N 行数守恒 |
| `#145` | `MODEL-BENCH.md` 错词 18 行 + `:10` 定位句 + `docs/README.md:81` 同步 | 七项禁用词全 0 · 行数 1,745 / `##` 17 不变 · 单字「自检」剩 8 行全在允许语境 |
| `#137`–`#143` | 设计四轮评审（判据 C 改单源 · AC-14 四条机检真判据） | §3 四轮记录在册 |
| `§2.13` | 4 个缝名 `…ForTest` → `…ForCheck`（10 文件 / 30 行 / 34 处 + `CONFIG.md` 2 行） | ①`0` ②`0` ③`4/4` ④`2` ⑤`116` ⑥行数不变 · `CONFIG.md:131` = 290 字符 ≤300 |
| `§2.14` | 自写 harness 替代 `node:test`（`harness.mjs` 71 行新增 · 15 档 116 处 · `run.mjs` 84→110） | J1–J7 全绿（见下） |

### 二、§2.14 终态读数（父侧 2026-10-18 08:41 亲跑 · 判据块原样）

| 判据 | 先红 | 改后 | 期望 |
|---|---|---|---|
| J1 `node:test`（`bench/**` 除 results） | 11 | **0** | 0 |
| J2 裸 `test(` 调用 | 116 | **0** | 0 |
| J3 `check(` 调用（15 档） | 0 | **116** | 116 |
| J4 `exit` / `total_116` / `ownership` / `ownership_cn` | — | **0 / 1 / 1 / 1** | 同 |
| J5 `ℹ tests` / `ℹ pass` | 1 / 1 | **0 / 0** | 0 / 0 |
| J6 `AC-\d+`（`bench/check`） | 61 | **0** | 0 |
| 输出首行 | — | `bench/check — 评估工具自身的测试代码（非项目测试体系：不进 CI / 发布门）` | 在位 |
| 输出末行 | — | `bench/check: 116 passed, 0 failed` | 单值 |

### 三、父侧直接执行（标记 · 可逐条 revert）

10 处文案/命名（`bench/check/**`，零行为影响，改后 116/116 复跑通过）：

| 处 | 改动 |
|---|---|
| `probe.check.mjs:30` · `toolcall.check.mjs:31` | 沙箱前缀 `probe-test-results-` / `toolcall-test-results-` → `…-check-results-` |
| `preflight:109` · `probe:216` · `recompute:110` · `roster:150` · `suite:210` · `toolcall:176` | 桩消息 `network disabled by test` → `by check` |
| `probe.check.mjs:219` · `toolcall.check.mjs:178` | label `probe-test-` / `toolcall-test-` → `…-check-` |

**理由**：文件名词、路径、引擎、输出都清了，但我们自己起的沙箱名与桩消息里还带 `test`——读者一眼看到 `probe-test-results-` 仍会联想成测试。这是本批射程内的最后一点残留。

### 四、`test` 字残留盘点（`bench/**` 除 results · 74 行 · **全部合理保留**）

| 类 | 行数 | 例 |
|---|---|---|
| 数据键（结果 JSON 契约） | ~40 | `sameVendorAsTested` · `tested` · `testedKeys` / `testedVendors`（内部变量） |
| JS 标准 API | ~16 | `/^probe-/.test(s)`（`RegExp.prototype.test`） |
| 题面载荷（frozen 副本 + prompts） | ~8 | `toolcall/prompts.mjs:55`「跑一下全量测试（`node --test`）」+ `:56/:57` 正则 · `toolcall-frozen.mjs:82/:83` |
| 配置键 | ~3 | `timeoutSec`（= 超时秒，非 test） |
| 对比说明 | 1 | `run.mjs:12` 提到各包 `test/run.mjs`（说明为何不沿用其空清单绿） |

**没有一处是「把 `bench` 当内部测试」的痕迹。**

### 五、遗留（登记待办 · 不在本批）

| # | 项 | 性质 |
|---|---|---|
| 1 | `bench/check/metrics.check.mjs:93` 建 `bench-prices-*` 后无 `after` / 无 `rmSync` ⇒ 全绿跑留临时目录 | **既有缺口**（非本批引入）· `#151`/`#152` 双次上抛 |
| 2 | `bench/lib/*` 7 行 + `bench/suites/*` 4 行 `AC-x` 批号 | 产品源码面，本批边界外 |
| 3 | `harness.mjs` 的保活句柄（ref'd interval）未写入 `MODEL-BENCH.md` §3 机制句 | `#152` 上抛 · 设计席笔 |
| 4 | 整档崩溃时末行只报 ΣF（可能出现 `N passed, 0 failed` + exit 1） | `#152` 上抛 · 待定形 |

### 六、结论

本批五段全部交付并亲验。**`bench/` 被误认为内部测试的四条线索——目录/文件名词 `test` · 路径 `bench/test/` · `node:test` 引擎 · `ℹ tests / pass / fail` 输出形态——已全部清除**；`bench/check` 现在是「评估工具自身的测试代码」，跑法自写、输出自证归属、不进 CI / 发布门。

**状态行** → 已收口 2026-10-18
