# 2026-10-19 · doc_check 报告态可指定档集（清账 / 定点复核）
> 六段 append-only，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 编制：主 agent · 2026-10-19 · 来源 = 用户 2026-10-19 11:14「挂个需求，现在 doc_check 工具不能指定检查哪些文件，这个有问题。」+ 11:18「doc_check 那批开吧」。
> 台账 = #1694（core · 归批）。前情 = 无（独立批）。
## §1 讨论（主 agent）
**状态行**：已收口 2026-10-19
<§1 模板占位：本批条目 / 关键判据 / 授权口径>
## §2 批次任务与设计（eng-designer）
**状态行**：设计完成（修正轮 1：补 DD-110–DD-113（gate 零变 / 解析基线反证 / 非数组拒 / 第三因）+ 报错三因表 + 范围行断言；A-DD34 → 七条）
<§2 模板占位：本批条目（覆盖） / 设计档落点 / 机制设计 / 受影响文件与测试覆盖 / 验收对照 / 关键决策 / 上抛项>

**本批条目（覆盖）**

| # | 条目 | 判据 |
|---|---|---|
| 1 | `doc_check` 报告态可指定档集（需求 F10） | `report` + `docs` ⇒ 只判清单内各档（整档入判）；无 `docs` ⇒ 全域、报面与命中集逐字不变 |
| 2 | 越域 / 缺档报错点名（F10 / AC-8） | 返回 `Error:` 串并逐档点名 + 原因；整次零判定（fail-closed） |
| 3 | 空清单报错（F10 / AC-8） | `docs: []` ⇒ 报错，不读作全域 |
| 4 | gate 面零变（F10 边界句） | gate 的范围 / 报面 / 判词逐字不变 |

**不在本批**：新判据 · gate 面范围语义 · 需求档改笔（F10 与 AC-8 已由主 agent 落笔，本批只做设计与实施派单）。

**设计档落点**：`docs/core/design/DOC-DISCIPLINE.md` §3.20「报告态档集」（语义矩阵 · 报错串形 · 报面 · 实现落点 · 受影响文件 · 用例 DD-106–DD-109）+ §5 A-DD34；同节「工具形」的参数句与两种问法句随之收正。

**机制设计（摘要）**：两道门同解——`thincoder-core/agent-tools/doc-check.mjs:47`–`:49` 的 report+docs 拒绝串删除；`thincoder-core/doc-check/index.mjs:138` 的 `gate-only` 抛点删除。范围求交复用 `resolveRange`（声明域内 ∧ 盘上存在的 `.md`），两处置分野：`gate` 对越域 / 缺档给跳过行（现状不变），`report` 给错误串且整次零判定。解析基线（`files`）与被判集（`checkFiles`）两处收参零改——范围只收窄被判档，不收窄解析。报告态只加一行范围行，不产 `DOC-CHECK GATE:` 判词。

**受影响文件与测试覆盖**

| 文件 | 现行 | 预计 | 改动 |
|---|---|---|---|
| `thincoder-core/doc-check/index.mjs` | 210 | ≈232 | 删 gate-only 抛点 + scoped 判定 + 三抛 + 报告态范围行 |
| `thincoder-core/agent-tools/doc-check.mjs` | 75 | ≈72 | 删拒绝串 + 报告分支传参 + schema 的 `docs` 描述 |
| `thincoder-core/tool-docs/doc_check.md` | 55 | ≈58 | `docs` 段两模式（英文运行面 = eng-coder 落） |
| `thincoder-core/test/doc-check-scope.test.mjs` | 新建 | ≈90 | DD-106–DD-109（收口删，零常驻） |

**测试载体（与台账 #1695 的关系）**：本批用例落**批内单元测试档** `thincoder-core/test/doc-check-scope.test.mjs`，收口随批删除（与上批 `thincoder-core/test/doc-check-roots.test.mjs` 同惯例）。#1695 = 「引擎常驻单元测试档重建」，**本批不并入、不提前开**——常驻档是另一件事（覆盖面 + 长期维护），并入会把一个条件触发的台账项做成半成品。批内四例可作为 #1695 开工时的样例来源，但不自动提升（单元测试档不晋级为常驻档）。

**验收对照（AC-8 四例 · 命令 `node --test thincoder-core/test/doc-check-scope.test.mjs`）**：

| 用例 | 构造 | 期望 |
|---|---|---|
| DD-106 | 夹具全域有问题的档 A + 清单只给干净档 B | 0 命中（区分「只查了 B」与「还是查全域」） |
| DD-107 | 同夹具，清单给 A | 命中 = A 的 `档缺` 一条，与全域读数中 A 那条同形 |
| DD-108 | 清单给域外档 ∥ 盘上缺的档 | 各返回 `Error:` 串 + 点名 + 原因；零命中产出 |
| DD-109 | `docs: []` ∥ 省略 `docs` | `[]` ⇒ 报错；省略 ⇒ 全域读数（无范围行、命中集同改前） |

**关键决策**：① 不可判档 fail-closed（整次零判定）——否则 0 命中会被读成「这些档都干净」；② 空清单不读作全域——静默读作全域会把「只查两档」执行成 197 档扫描，噪声掩盖目标；③ 报告态不产 verdict——判词族属交付门，串用会让清账读数冒充本批交付通过；④ `[]` 与「全为空白串」同一错误——空白串清单同为零档，假绿同源。

**上抛项**：无。

### 修正轮 1（首审 8 条：🔴0 · 🟡3 · 🔵5；父侧处置 5 条 = 3🟡 + 2🔵）

**处置边界**：只补用例与三处措辞（报错串形 / 实现落点 / 用例表与 A-DD34），不改语义矩阵的判定方向；不动代码、不动 §1、不动 §3；不扩射程（`#1695` 常驻单测档另批）。第 6 / 7 / 8 条（🔵）父侧记、本轮不做。

| # | 处置 | 落点（file:line） |
|---|---|---|
| 1 🟡 gate 零变无回归 | 新增 DD-110（gate + 域内档 + 越域档 ⇒ 跳过行在场、首行逐字）；A-DD34 补判据 ⑥ | `docs/core/design/DOC-DISCIPLINE.md:1285`（DD-110 行）· `:2152`（A-DD34 ⑥） |
| 2 🟡 非数组 `docs` 拒绝层未点名 | 报错串形补「非数组」条 + 「拒绝层」段：工具面守卫 = `thincoder-core/agent-tools/doc-check.mjs:44`–`:46`（零改，两模式都过它）；引擎类型门（`:138` 由 gate-only 抛点改为类型门）；**无共享 schema 校验层**（实读 `agent-tools/*.mjs`，各工具自持 `execute` 守卫）；新增 DD-112 | `docs/core/design/DOC-DISCIPLINE.md:1228`（串）· `:1241`（拒绝层）· `:1259`（类型门落点）· `:1287`（DD-112 行） |
| 3 🟡 report 面解析基线与反证 | 新增 DD-111（清单档以域内唯一裸名引用未入清单的档 ⇒ 零 `档缺`）；A-DD34 补判据 ⑦ | `docs/core/design/DOC-DISCIPLINE.md:1286`（DD-111 行）· `:2153`（A-DD34 ⑦） |
| 4 🔵 范围行断言 | DD-106 期望加「含范围行，N=1，M=2」（夹具声明域 2 档） | `docs/core/design/DOC-DISCIPLINE.md:1281` |
| 5 🔵 报错原因闭二式漏第三形 | 三因闭集（`not on disk` ∥ `not a markdown document` ∥ `outside the declared domain`）+ 判序 + `resolveRange` 改判落点；新增 DD-113 | `docs/core/design/DOC-DISCIPLINE.md:1225`–`:1239`（串形 + 三因表）· `:1261`（`resolveRange` 落点）· `:1288`（DD-113 行） |

**报错原因表（定稿 · 闭三式；判定方向不变 = 一律报错、整次零判定）**

| # | 形状 | 原因串 | 出处 |
|---|---|---|---|
| ① | 盘上不存在 | `not on disk` | 既有式 |
| ② | 在盘但非 `.md` 常规档（目录 ∥ 其它扩展名） | `not a markdown document` | 本轮补 |
| ③ | 在盘的 `.md` 但不在声明域（`scanDirs` − `anchors.exclude`） | `outside the declared domain` | 既有式 |

现式两处误标（目录 ⇒ `not on disk`；域内非 `.md` ⇒ `outside the declared domain`）按上表改判。**禁**按 `.endsWith('.md')` 静默过滤——静默跳过正是 F10 要关的面。

**新增用例全文**（落 `thincoder-core/test/doc-check-scope.test.mjs`，DD-106–DD-113 一个文件；收口随批删）：

```js
// thincoder-core/test/doc-check-scope.test.mjs — 本批批内用例（DD-106–DD-113 · 收口删）
import test from "node:test"
import assert from "node:assert/strict"
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs"
import { dirname, join } from "node:path"
import { tmpdir } from "node:os"
import { runDocCheck } from "../doc-check/index.mjs"
import { docCheckTool } from "../agent-tools/doc-check.mjs"

/** 夹具：声明域 = docs（2 档）
 *  docs/deep/common.md   含一条指向不存在档的指针（全域命中源；token 用 absent-doc.md）
 *  docs/DOC-DISCIPLINE.md 干净，以裸名引用 common.md（域内唯一 basename ⇒ 只有 ④ 索引能解）
 *  域外 / 第三因样本：AGENTS.md、outside/example.md（在盘域外）· docs/notes.txt（非 .md）· docs/deep（目录） */
function fixture() {
  const root = mkdtempSync(join(tmpdir(), "doc-check-scope-"))
  const w = (rel, text = "") => {
    const p = join(root, rel)
    mkdirSync(dirname(p), { recursive: true })
    writeFileSync(p, text)
  }
  w("PROJECT-MANIFEST.json", JSON.stringify({
    checkConfig: { scanDirs: ["docs"], lineWidth: 300, widthExemptZones: [], anchors: { exclude: [] } },
  }))
  w("docs/deep/common.md", "# 手册\n\n见 absent-doc.md 一节。\n")
  w("docs/DOC-DISCIPLINE.md", "# 笔记\n\n见 common.md 的说明。\n")
  w("AGENTS.md", "# 域外\n")
  w("outside/example.md", "# 域外二\n")
  w("docs/notes.txt", "非 markdown\n")
  return root
}
const withFixture = (fn) => { const root = fixture(); try { fn(root) } finally { rmSync(root, { recursive: true, force: true }) } }

test("DD-106 · report + docs 只判清单内档（N=1 · M=2）", () => withFixture((root) => {
  assert.match(runDocCheck(root).report, /✗ 锚·档缺 docs\/deep\/common\.md:3 `absent-doc\.md`/)
  const scoped = runDocCheck(root, { docs: ["docs/DOC-DISCIPLINE.md"] }).report
  assert.match(scoped, /^范围：显式档集 1 档（整档入判 · 解析基线 = 声明域 2 档，不收窄）$/m)
  assert.match(scoped, /^命中 0 条（锚 0 · 行宽 0）$/m)
  assert.doesNotMatch(scoped, /✗/)
}))

test("DD-107 · report + docs 给有问题的档 ⇒ 命中同全域那条", () => withFixture((root) => {
  const scoped = runDocCheck(root, { docs: ["docs/deep/common.md"] }).report
  assert.match(scoped, /^命中 1 条（锚 1 · 行宽 0）$/m)
  assert.match(scoped, /✗ 锚·档缺 docs\/deep\/common\.md:3 `absent-doc\.md`/)
}))

test("DD-108 · 越域 ∥ 缺档 ⇒ 报错点名，零判定", () => withFixture((root) => {
  assert.throws(() => runDocCheck(root, { docs: ["outside/example.md"] }), /outside\/example\.md（outside the declared domain）/)
  assert.throws(() => runDocCheck(root, { docs: ["docs/missing-file.md"] }), /docs\/missing-file\.md（not on disk）/)
}))

test("DD-109 · [] ⇒ 报错；省略 ⇒ 全域读数无范围行", () => withFixture((root) => {
  assert.throws(() => runDocCheck(root, { docs: [] }), /docs is empty/)
  assert.doesNotMatch(runDocCheck(root).report, /^范围：/m)
}))

test("DD-110 · gate 面零变：域内档 + 越域档 ⇒ 跳过行在场、首行逐字", () => withFixture((root) => {
  const out = runDocCheck(root, { mode: "gate", docs: ["docs/DOC-DISCIPLINE.md", "AGENTS.md"], docsSource: "explicit" }).report
  assert.equal(out.split("\n")[0], "DOC-CHECK GATE: PASS")
  assert.match(out, /^范围：显式 docs 1 档（声明域 2 档）/m)
  assert.ok(out.includes("跳过 1 档（不在声明域内，未检）：AGENTS.md"))
  assert.ok(out.includes("结论：0 条命中（1 档全清）"))
}))

test("DD-111 · 解析面不缩：清单档以裸名引用未入清单的档 ⇒ 零 档缺", () => withFixture((root) => {
  const r = runDocCheck(root, { docs: ["docs/DOC-DISCIPLINE.md"] })
  assert.equal(r.hits.total, 0)          // 把 files 一并收窄 ⇒ common.md 假报 档缺
  assert.doesNotMatch(r.report, /档缺/)
  assert.match(r.report, /解析基线 = 声明域 2 档/)
}))

test("DD-112 · docs 非数组 ⇒ 明确拒（工具面 ∥ 引擎面），不落全域", () => withFixture((root) => {
  const viaTool = docCheckTool.execute({ docs: "docs/DOC-DISCIPLINE.md" }, { agent: { cwd: root } })
  assert.match(viaTool, /^doc_check: `docs` must be an array of paths \(got string\)/)
  assert.doesNotMatch(viaTool, /文档纪律机检/)
  assert.throws(() => runDocCheck(root, { docs: "docs/DOC-DISCIPLINE.md" }), /`docs` must be an array of paths/)
}))

test("DD-113 · 第三因：在盘 ∧ 非 .md ∥ 目录 ⇒ not a markdown document", () => withFixture((root) => {
  assert.throws(() => runDocCheck(root, { docs: ["docs/notes.txt"] }), /docs\/notes\.txt（not a markdown document）/)
  assert.throws(() => runDocCheck(root, { docs: ["docs/notes.txt"] }), (e) => !/notes\.txt（not on disk）/.test(String(e)))
  assert.throws(() => runDocCheck(root, { docs: ["docs/deep"] }), /docs\/deep（not a markdown document）/)
}))
```

**夹具命名纪律（本批踩过 · 写死为约束）**：用例档内的夹具名同时出现在设计档用例表里，而设计档本身过 gate ⇒ 表内写出的 `.md` 名必须是**抽取集内可解析**的（排除形 = 占位词干 / 约定类名），否则设计档自己判 `档缺`（本轮实测：15 条 `档缺`，全为夹具名）。定稿 = 可解析名 `common.md` ∥ `DOC-DISCIPLINE.md` + 排除形 `AGENTS.md`（类名）+ 非 `.md`（`notes.txt` / 目录）。

**验收对照增量（`node --test thincoder-core/test/doc-check-scope.test.mjs`）**

| 用例 | 判据 |
|---|---|
| DD-110 | gate 面零变：首行逐字 + 范围行 + 跳过行 + 结论行（A-DD34 ⑥） |
| DD-111 | 解析基线不缩：零 `档缺`（A-DD34 ⑦） |
| DD-112 | 非数组 `docs` 两处明确拒（工具面 ∥ 引擎面），不落全域、不冒 `TypeError` |
| DD-113 | 第三因 `not a markdown document`（目录 ∥ 非 `.md`），不并入 `not on disk` |

受影响文件估计随补例更新：`thincoder-core/test/doc-check-scope.test.mjs` ≈90 → **≈170**（设计档同表已同改）。

**本轮不做（明写）**：不动任何代码；不动 §3 · §1；不改语义矩阵判定方向；不扩射程（`#1695` 另批）；第 6 / 7 / 8 条 🔵 父侧记、不做。

## §3 设计评审（评审子代理）

### 轮次 1（评审子代理）

**设计评审（#1694 · 首审）** · 审面 = 批次档 §2 + `docs/core/design/DOC-DISCIPLINE.md` §3.20「报告态档集」/§5 A-DD34 / 用例 DD-106–DD-109 + 需求 `docs/core/requirements/DOC-CHECK.md` F10 / AC-8。

已核通过面（不计入发现）：① 需求覆盖 F10 / AC-8 四式逐条有对应（语义矩阵 `DOC-DISCIPLINE.md:1210`–`:1219`）· ② gate/report 不对称（gate 跳过行 ∥ report 报错）有据——F10 边界句「`gate` 面语义不变」+ 同源 `resolveRange` 的 why（`:1221`）· ③ 空清单不读作全域、fail-closed 有 why（批次档 §2 关键决策 ①②）· ④ DD-106 与 DD-107 合并具区分力（全域 ⇒ A 报；只查 B ⇒ 0）· ⑤ 设计档落点与声明一致：§3.20 报告态档集新节、工具形参数句（`:1093`）、两种问法句（`:1096`）、§5 A-DD34（`:2125`）+ 总表行（`:1840`）、用例表（`:1261`）五处齐备 · ⑥ 先例行在册（`:1270`，含对齐 ∥ 偏离）· ⑦ 公共源勘察证据行在册（`:1272`，「无相关公共源可引」）· ⑧ 受影响档表与 §3.20 同节表逐行一致（`index.mjs` 210 / `doc-check.mjs` 75 / `doc_check.md` 55 / 新档 ≈90），四档均远低于 500 建议线 ⇒ 无拆分义务。

| # | Category | Severity | Issue | Suggestion |
|---|----------|----------|-------|------------|
| 1 | Acceptance / Requirements | 🟡 | 本批条目 4 的判据「gate 的范围 / 报面 / 判词逐字不变」（批次档 `:19`）未进入本批验收对照——该表自述射程 = 「验收对照（AC-8 四例」（批次档 `:38`）；A-DD34 五条中无一条断言 gate 面行为逐字不变（`DOC-DISCIPLINE.md:2127` 只给静态面：两处调用 `resolveRange` + 两处收参零改）。gate 面既有用例（DD-85–DD-91，含 DD-89 的「域外 ⇒ 跳过行」）载体是批内单元测试档，按「随批归档 ∕ 集成测试树不收集」（`:2221`）/「（收口删）」（`:1086`）惯例已随上批收口删除 ⇒ 删 `:138` 抛点与 `:1248` 拒绝串后，「gate 零变」无任何可执行回归把它钉住 | 在本批测试档 `thincoder-core/test/doc-check-scope.test.mjs` 补一条 gate 用例（gate + 域内档 + 越域档 ⇒ 跳过行在场、verdict 首行逐字同改前），或在验收对照表增一行「A-DD30 ② 复跑（DD-89 形）」并给命令 |
| 2 | Clarity / Acceptance | 🟡 | 语义矩阵断言「`docs` 非数组 ⇒ 既有拒串不变（裸串不被读作全域请求）」（`DOC-DISCIPLINE.md:1219`），但实现落点只列两处拒绝面的删除（`:1244` 的 gate-only 抛点、`:1248` 的「report+docs 拒绝串**删除**」），未点名非数组 `docs` 的拒绝发生在哪一层（schema 校验 ∥ 引擎守卫）；被删的两处恰是 report + `docs` 现存的全部拒绝点 ⇒ 照落点实施后，report + `docs:"docs/A.md"` 是否仍有明确拒串无据（本席未读源码，源码行为标注 unverified——评审射程 = 三档文档） | 在「实现落点」补一行：非数组 `docs` 的拒绝层与串形（保持原串）。补一例（report + `docs:"docs/A.md"` ⇒ 明确拒，不落全域、不冒 `TypeError`） |
| 3 | Acceptance | 🟡 | 「范围只收窄被判档，解析基线仍是全域」（`DOC-DISCIPLINE.md:1207`）在 report 面只有静态判据（`:2127` 两处收参零改），无反证用例；gate 面则有对应反证（`:2053` 夹具「改过的档以裸名引用未改的档（域内唯一））」⇒ gate 零 `档缺`）。DD-106 的清单档 B 只描述为「干净」（`:1265`），未要求 B 含需经全域 basename 索引解析的裸名引用 ⇒ 「把 `files` 一并收窄」这一失效模式不会被四例报红，而它正是假阳（档缺）的来源 | 补一例（形同 DD-89）：清单档 B 以域内唯一裸名引用未入清单的 A ⇒ 零 `档缺`；或在 DD-106 夹具里显式写 B 含该裸名引用，并在期望里点明「解析基线 = M 档」 |
| 4 | Acceptance | 🔵 | 报告态范围行（`:1234`「范围：显式档集 N 档（整档入判 · 解析基线 = 声明域 M 档，不收窄）」）在 A-DD34 与 DD-106–DD-109 中无断言——只断言了「无 `docs` ⇒ 无范围行」（`:2129`）；N / M 两个计数与行序未入判 | 在 DD-106 期望里加「含范围行，N=1，M=<夹具域档数>」，令报面形可机判 |
| 5 | Clarity / Edge | 🔵 | 报错原因枚举为闭二式（`DOC-DISCIPLINE.md:1226`：`outside the declared domain` ∥ `not on disk`），但清单项还可能是「域内 ∧ 在盘 ∧ 非 `.md`」或目录形态——该形落不进任一原因，按 `.endsWith('.md')` 过滤即等于静默跳过（F10 的「不静默跳过」要关的正是这个面） | 补第三因（如「not a markdown document」）或明写此形归并到哪一因，并加一例 |
| 6 | Scope / fail-closed | 🔵 | 「任何一档不可判 ⇒ 整次零判定」（`:1217`）严于需求档字面（F10 `DOC-CHECK.md:27` 只要求「明确报错并点名该档…不降级为全域」，未说其余档是否照判）；设计已给 why（`:1221` 清账面没有部分检查），故为可接受收紧——但需求档字面不排斥「部分检查」读法 | 在 §3.20 报告态档集补一句口径对读（F10 未定其余档处置，本条择整次零判定），免后读把需求读成部分判 |
| 7 | Doc hygiene / numeric | 🔵 | 同一活档两处「现行 = 实读」的 `index.mjs` 行数不一：`DOC-DISCIPLINE.md:1079` 记「\| `thincoder-core/doc-check/index.mjs` \| 196 \| ≈202 \|」，`:1255` 记「\| `thincoder-core/doc-check/index.mjs` \| 210 \|」——两读数时点不同（前者为解析序 ⑤ 落地前）但均标「实读」 | 在 `:1255` 行补读数时点（as-of 日期），或对 `:1079` 行加「as-of（解析序 ⑤ 实施前）」 |
| 8 | Closest precedent | 🔵 | 先例行（`:1270`）给了同档节坐标与批档排除理由（D4 方向唯一），但未给实现坐标；同档同条目另一处先例行给了实现坐标（`:1039`「`thincoder-core/doc-check/anchors.mjs:57` 的 `resolveDoc`（四步）」） | 先例①补实现坐标（`resolveRange` 所在档:行），与本档既有先例行的密度对齐 |

**计数**：🔴 0 · 🟡 3 · 🔵 5。
**评审射程限制**：`## Document Map` 未提供 ⇒ Document ownership 维度降级（已按 Project Guide + 同档 §3.20 归属判定：新节住既有条目 S 之下，未新开 `.md`，与 `DOC-CHECK.md` F10 / AC-8 不矛盾、无重述）；`thincoder-core/**` 源码不在评审射程 ⇒ 受影响档行数（210 / 75 / 55）与 `index.mjs:138`/`:168`/`:170`–`:171` 的现文形态**未逐一实核**（unverified）。

VERDICT: pass

### 轮次 2（评审子代理）

**设计评审（#1694 · 二轮 = 验修正轮 · 审面 = 批次档 §2「修正轮 1」+ `docs/core/design/DOC-DISCIPLINE.md` §3.20「报告态档集」（`:1205`–`:1310`）/ §5 A-DD34（`:2145`–`:2153`）/ 用例 DD-106–DD-113（`:1279`–`:1288`）**

**五条修正逐条核对（落点全部在位）**：① 🟡1 → DD-110 行 `:1285` + A-DD34 ⑥ `:2152`（在位，且 DD-110 的夹具含裸名引用 ⇒ 同时挡住 gate 面「`files` 一并收窄」的退形）；② 🟡2 → 串 `:1228` + 拒绝层 `:1241` + 类型门 `:1259` + DD-112 `:1287`（在位；类型门 = `docs !== undefined ∧ !Array.isArray(docs)`，合法数组不过门 ⇒ gate 既有合法入参面未被顺带改）；③ 🟡3 → DD-111 `:1286` + A-DD34 ⑦ `:2153`（在位；夹具 `docs/DOC-DISCIPLINE.md` 以域内唯一裸名引 `common.md`，`files` 若收窄 ⇒ 必报 `档缺` ⇒ 有区分力）；④ 🔵4 → DD-106 期望「N=1 · M=2」` :1281`（在位，与报面模板 `:1249` 逐字同形）；⑤ 🔵5 → 三因表 `:1233`–`:1237` + 改判句 `:1239` + `resolveRange` 落点 `:1261` + DD-113 `:1288`（在位；三因表与批次档 `:65`–`:69` 内容一致，DD-113 的目录 ∥ 非 `.md` 两形各归第三因，未并入 `not on disk`）。A-DD34 头 `:1860`「判据七条齐（①–⑦）」与实际 7 条 `:2147`–`:2153` 计数一致（D3）。

| # | Category | Severity | Issue | Suggestion |
|---|----------|----------|-------|------------|
| 1 | Clarity / Acceptance | 🟡 | 实现落点 `DOC-DISCIPLINE.md:1260` 的「随后三抛——空清单 ∥ 越域 ∥ 缺档（fail-closed）」未限定 `!gate`，而同一句里 `scoped = docs !== undefined` 含 `gate + docs` ⇒ 照落点字面实施，gate + 越域档也抛错；与同节 `:1221`「差别只在不可判档的处置：gate 给跳过行」及 DD-110（`:1285`，gate + `AGENTS.md` ⇒ 跳过行 + 首行 PASS）相抵——「gate 面零变」可被这条落点自己破掉 | 把三抛的适用面写死在该句内（仅 `!gate ∧ scoped` 时抛；gate + docs 走跳过行），并在句末回指 `:1221` 的两处置分野 |
| 2 | Acceptance | 🟡 | 三因改判落在**共享**实现 `resolveRange`（`:1239` 现式把目录归进 `not on disk` / `:1261` 改三因分类），但「域内目录 ∥ 域内非 `.md`」这两支（= 被改判的两支）在 gate 面的跳过行是否随因变、是否逐字不变，设计未写；gate 报面只给过一条跳过句「`跳过 S 档（不在声明域内，未检）：…`」（`:1308`，且以「域外档」为触发面），而 gate 零变的唯一判据 DD-110（`:1285`）与 A-DD34 ⑥（`:2152`）只用 `AGENTS.md`（因 ③ = **未**改判的那一支）⇒ 改判支上「gate 逐字同」无判据可跑 | 在「两处置同源」（`:1221`）补一句 gate 跳过行的因无关性（记法：跳过句为单形，不随因分流），并补一例 gate + 域内目录（`docs/deep`）/ 域内非 `.md`（`docs/notes.txt`）⇒ 跳过行逐字同改前 |
| 3 | Clarity | 🟡 | 非数组串形与它自己的用例字面不一致：`:1228` 写 `doc_check: docs must be an array of paths (got <type>)`（无反引号），批次档 `:149` 断言 `` `docs` must be an array of paths ``（含反引号）；而 `:1219` 声明「既有拒串不变」、`:1241` 声明引擎面「同一串」⇒ 既有源面串为唯一权威 ⇒ 照串形实施 DD-112 红，照用例实施等于改了一条被声明为零改的串 | 以源面既有串为准回填 `:1228`（或改用例字面），使「串形 ∥ 用例 ∥ 既有串」三处同字面（含 (got <type>) 的实参形） |
| 4 | Clarity / Acceptance | 🟡 | 「判序」是指针不是规则：`:1261` 写「不可判档改三因分类（判序见「报错串形」）」，但 `:1223`–`:1229` 只给**报文模板的列举顺序**，未给逐项归属优先级；重叠形「域外 ∧ 盘上不存在」（如 `outside/missing.md`）与「域外 ∧ 非 `.md`」归哪一因无规则，而 DD-108（`:1283`）两样本均单因、DD-113（`:1288`）均域内 ⇒ 两种归属实现都能绿 | 在 `:1231` 三因表后补一行判序（例：存在性先判 ⇒ 再判类型 ⇒ 再判域），并给一重叠形用例（域外 + 不存在）钉住归属 |
| 5 | Acceptance | 🔵 | DD-111 的载体断言 `r.hits.total`（批次档 `:142`）用了设计未给的返回形：设计里 `hits` 的唯一表述是被判命中记录集合（`:1060`「`0` ⇒ `hits` 的 `节缺`」），`runDocCheck` 的返回形全档未写 ⇒ 该式可能取到 `undefined`（源面不在本评审射程 ⇒ `unverified`）；实质反证已由同例的 `doesNotMatch(/档缺/)` 与范围行断言覆盖 | 或改判报告行（`命中 K 条（锚 a · 行宽 w）` `:1196` / 零命中结论 `:1203` 已定形），或把 `runDocCheck` 的返回形写进「实现落点」 |
| 6 | Acceptance | 🔵 | DD-110 以 `match` / `includes` 逐行断言，A-DD34 ⑥（`:2152`）却声明 gate「范围 / 报面 / 判词与改前逐字同」——多冒一行 `范围：`、或行序变动仍会绿（只有首行是 `assert.equal`） | 改成整段 `assert.equal(out, 金样本)`（首行已是逐字断言形），令「逐字同」名副其实 |
| 7 | Requirements / D3 | 🔵 | 本批条目 2 的判据仍只枚举两形——`2026-10-19-doccheck-scope.md:17`「越域 / 缺档报错点名」，而报错面已闭三式（`:1231`–`:1237`，第三式 `not a markdown document` 为本轮新增）⇒ 条目枚举与验收物枚举不同步 | 条目 2 判据与三因表同轮改（越域 / 缺盘 / 非 `.md`），使条目、串形、用例三处同形 |

**计数**：🔴 0 · 🟡 4 · 🔵 3。
**评审射程限制**：`## Document Map` / 项目标准档均未提供 ⇒ Document ownership 维度降级（已按 Project Guide 与同档归属判定：改动住既有条目 S 的 §3.20 + §5 A-DD34，**未新开 `.md`**，与需求档 F10 / AC-8 只作指针、无重述）；`thincoder-core/**` 源码与需求档 `DOC-CHECK.md` 不在评审射程 ⇒ 受影响档行数（`index.mjs` 210 / `doc-check.mjs` 75 / `doc_check.md` 55 / 新档 ≈170，均远低于 500 ⇒ 无拆分义务）、`:138` / `:168` / `:170`–`:171` / `:44`–`:46` 的现文形态、以及既有拒串字面 **未实核（unverified）**。

VERDICT: pass

## §4 用户批准（主 agent）

### 用户批准（2026-10-19）

**用户逐字**：11:14「doc_check 不能指定检查哪些文件」⇒ 立需求 · 11:18「doc_check 那批开吧」⇒ 开批 · **14:34「都点火，都收口」** ⇒ 本轮全链启动权（评审点火 + 实施 + 收口一并放行）。

**批准口径**：设计 12 条首审 + 5 条二轮修正全部落定后批准实施；**实施面四档 + 8 例**，验收以「gate + 越域档仍走跳过行（DD-110）」「非数组两处同串拒」为硬判据。

**批准后的实施读数**：四档落地 · 批内 8/8 · 全核 15/15 · 偏离审计 0 条 · 代码评审 pass · 修正 1 轮 · 终态 clean。

## §5 实施记录（eng-coder）

**状态行**：实施完成（2026-10-19 · 四档落地 · 批内 8 例 + 全核测试档绿 · 偏离审计 0 条 · 代码评审 pass）

**改动清单（四档 · 与 §2 受影响文件表同集）**

| 文件 | 落点 | 改动 |
|---|---|---|
| `thincoder-core/doc-check/index.mjs` | `:70`–`:77` · `:152`–`:154` · `:183`–`:196` · `:219`–`:221` | 三因分类器 `undecidableReason`（判序 存在性 → 类型 → 域）· `resolveRange` 增 `undecidable`（gate 两桶零改）· `docs` 类型门（取代 gate-only 抛点）· `scoped` 判定 + 原位三抛（`!gate && scoped`）· 报告态范围行 |
| `thincoder-core/agent-tools/doc-check.mjs` | `:34` · `:47` · `:69`–`:74` | schema `docs` 两模式描述 · 删 report+docs 拒绝串 · 报告分支按清单传参 |
| `thincoder-core/tool-docs/doc_check.md` | `:22`–`:27` | `docs` 段两模式各一句 + 解析基线句 |
| `thincoder-core/test/doc-check-scope.test.mjs` | 新建 83 行 | DD-106–DD-113（逐字取 §2「修正轮 1」全例） |

**决策披露**（设计未写死、由本笔判定的两处；均未越设计语义）

| # | 判定 | 理由 |
|---|---|---|
| 1 | 三因只用于报告态报错面；gate 的 `outside`/`gone` 两桶与跳过行文案**保持既有形**（目录落 `gone`、在盘非 `.md` 落 `outside`） | 「gate 面零变」是本批硬判据（A-DD34 ⑥）——改桶会把 gate 跳过行措辞换掉。设计 `:1261` 的「不可判档改三因分类」落成「报告态归因三因 + gate 桶不变」，同一 `resolveRange`、同一判定，两处置同源仍成立 |
| 2 | 类型门串取**源面既有串**（带反引号，含 `(got <type>)`） | 派单明写「既有源面串是唯一权威，别照设计转写」；设计 `:1219`「既有拒串不变」同向 |

**偏离审计（内部 explore · 1 轮）**：四类（PARTIAL / SILENT-SIMPLIFICATION / DOC-DRIFT / OUT-OF-LIST）**均 0 条**；登记 5 条文档侧观察，①–④ 属设计档文本滞后（见下「设计档漂移」），⑤ 即本条 §5。

**代码评审（advisor · type=code · 1 轮）**：`VERDICT: pass` · 🔴 0 · 🟡 4 · 🔵 3。

| # | 级别 | 处置 |
|---|---|---|
| 1 | 🟡 | 不采纳（笔域）：设计 `:1228` 非数组串模板缺反引号 —— 设计档归 eng-designer，已随交付上抛 |
| 2 | 🟡 | 不采纳（笔域）：三因判序在 §3.20 未成句 —— 设计档待补；代码口径已与建议判序一致 |
| 3 | 🟡 | 不采纳（笔域 + 用例域）：gate 面 ②/③因形状的跳过行覆盖 —— 用例表定死 DD-106–DD-113 八例，扩例即越设计；已上抛 |
| 4 | 🟡 | **采纳**：本条 §5 即为补齐 |
| 5 | 🔵 | 不采纳（笔域）：受影响文件行数漂移 —— 已上抛 |
| 6 | 🔵 | **采纳（注释澄清）**：`agent-tools/doc-check.mjs:71` 补「`docsSource` 报告态无消费点」；参数保留（设计 `:1264` 的落点就是随清单传） |
| 7 | 🔵 | 不采纳：新增「无可用项」第三串会引入设计未定的串形；现状 fail-closed，文案局限仅在直调引擎传非串项时出现 |

**修正轮**：1 轮（评审 🔵6 的注释澄清，已复跑）；其余 6 条为笔域外/设计侧项，转父侧路由。

**验证读数**

- `node --check thincoder-core/doc-check/index.mjs` 与 `agent-tools/doc-check.mjs` ⇒ OK
- `node --test thincoder-core/test/doc-check-scope.test.mjs` ⇒ **8 pass / 0 fail**（DD-106–DD-113 全绿）
- `npm test`（cwd = `thincoder-core`）⇒ **15 pass / 0 fail / exit 0**（含他批在途测试档）
- 实跑（引擎直跑 · cwd = 仓根）：`report` + `docs:["docs/core/design/DOC-DISCIPLINE.md"]` ⇒ 范围行 `范围：显式档集 1 档（整档入判 · 解析基线 = 声明域 197 档，不收窄）`、命中 0、报面无 `DOC-CHECK GATE`；`docs:[]` ⇒ `doc_check: docs is empty …`；`docs` 传裸串 ⇒ `doc_check: `docs` must be an array of paths (got string) …`；四档混合清单 ⇒ 三因逐档点名（`not on disk` ∥ `not a markdown document` ∥ `outside the declared domain`）
- gate 读数（fresh 进程直跑）：首行 `DOC-CHECK GATE: PASS（0 档）`，另见 `跳过 1 档（不在声明域内，未检）：thincoder-core/tool-docs/doc_check.md` —— **如实说明：本轮无 `docs/**` 改笔，gate 判 0 档；本轮唯一 `.md` 改笔（`tool-docs/doc_check.md`）不在声明域 `docs` 内**

**设计档漂移（eng-designer 笔 · 父侧路由）**：① `:1228` 非数组串模板缺反引号（应回填源面既有串）；② 三因判序句未成文（`:1231`–`:1237` 表后缺一行）；③ gate 跳过行「因无关性 + 两桶措辞」句缺，且 DD-110 / A-DD34 ⑥ 只覆盖第 ③ 因；④ 受影响文件表三行读数与实读漂移（`index.mjs` ≈232 → 约 240 · `agent-tools/doc-check.mjs` ≈72 → 76 · 测试档 ≈170 → 83）。

## §6 验证与收口（父代理）

### 收口（2026-10-19）

**角色表**：讨论 ∥ 收口 = 主 agent · 设计 = eng-designer（修正轮 1）· 评审 = advisor 二轮 · 实施 = eng-coder `#26`。

**状态行**：实施完成 · **已收口 2026-10-19**。

**交付读数（`doc_check` 报告态可指定档集）**：

| 判据 | 读数 |
|---|---|
| report + 非空清单 | 只判清单内档 · 报面含 `范围：显式档集 1 档（整档入判 · 解析基线 = 声明域 197 档，不收窄）` · **无 `DOC-CHECK GATE` 判词** |
| `[]` / 全空白 | 报错（`docs is empty — an empty list does not mean "the whole declared domain"`） |
| 三因闭集 | `not on disk` ∥ `not a markdown document` ∥ `outside the declared domain`——**抛点在两条判据调用之前，整次零判定** |
| **gate + 越域档** | **跳过行、不抛**（三抛钉在 `!gate && scoped`）——DD-110 绿：首行逐字 `DOC-CHECK GATE: PASS` + `跳过 1 档` + `结论：0 条命中` |
| 非数组 `docs` | 工具面守卫零改（`agent-tools/doc-check.mjs:44`–`:46`）与引擎类型门（`index.mjs:152`–`:154`）**同串拒** |
| 回归 | 批内 **8/8** · `thincoder-core` 全套 **15/15 · exit 0** · 两档 `node --check` OK |

**改动面（四档）**：`doc-check/index.mjs`（三因分类器 · `resolveRange` 增 `undecidable` · 类型门 · `scoped` 三抛 · 范围行）· `agent-tools/doc-check.mjs`（schema 两模式 · 删 report+docs 拒绝串 · 报告分支传参）· `tool-docs/doc_check.md` · 新建 `test/doc-check-scope.test.mjs`（DD-106–DD-113）。

**两处父侧代定口径（照办）**：① 三抛只在 `!gate && scoped`；② 非数组串取**源面既有串**（带反引号），不照设计 `:1228` 转写。

**修正轮落地前置**：偏离审计 1 轮（四类偏离均 0）+ 代码评审 1 轮 `pass`（🔴0 · 🟡4 · 🔵3）+ 修正 1 轮（采纳 🟡4 补 §5、🔵6 注释澄清 `docsSource` 报告态无消费点）⇒ 终态 `clean` · 无 `stalled`。

**搁置清单回核**：六条（🟡1–3 之外）落设计档笔域或用例域之外 ⇒ 转 `#1700`（归批）。**暂缓批复核：无。**

**文档机检门**：会话内 = `ERROR（引擎已更新）`（本批自己改了引擎四档，进程持旧模块）；**新进程首行 = `PASS（0 档）`**（本轮唯一 `.md` 改笔 `tool-docs/doc_check.md` 在声明域 `docs` 之外）；全库真读数 = **0 命中 / 197 档**。

**用户文档面同拍**：`doc_check` 的 `docs` 参数由「gate only」改为两模式——**工具描述已同轮改**（`tool-docs/doc_check.md`），用户可见面一致。

**待办勾销**：`#1550` 已随本批走完状态机；`#1700`（设计档四处收尾）**归批待做**。

**前批遗留核对**：无。

**结算读数**：本批未决项 = 1（`#1700`，已入台账、挂下一批）。
