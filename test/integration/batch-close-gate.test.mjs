/**
 * batch-close-gate.test.mjs — 集成用例 7-1 / 7-2 / 7-3 / 7-4 / 7-5 / 7-6 / 7-7 / 7-8 / 7-9 / 7-11 / 7-13 / 7-15（RTM CLI 端故事 7「收口只判本批改过的档」；
 * 判据原文 = `test/RTM.md` 第 7 节；7-1…7-3 的机制 = `docs/core/design/DOC-DISCIPLINE.md` §3.20「② 的范围」，
 * 7-4 的机制 = `docs/core/design/TESTING.md` §3.5（零留存的收口门），
 * 7-6 / 7-7 / 7-8 的机制 = 同档 §3.20「结构兜底」（**批档自身恒在判域**：② 面命中即拒、① 面强制集 = 本次写入文本）；
 * 7-15 的机制 = 同档 §3.29 条目 AC（**批档面互引不判**：引用方与目标同在批档基底根下 ⇒ 不判、只留痕）。
 *
 * 业务入口 = 真 `batch` 工具（`agent-tools/batch.mjs`）的 depth-0 `close` 轨——不直调 `runBatchGate`：
 * 本档要的是「收口这件事」的业务可观察结果（放行 ∥ 拒绝、回执行、§1 状态行落没落盘）。
 * 断言面 = 工具回执文本 + §1 状态行落盘字节（档全文逐字比较）。
 *
 * 笔域集（7-1 / 7-2 / 7-3 / 7-4 / 7-6 每例以两档干净档为底——7-3 再加一档含悬空指针的档）两条腿都做实：触达账（`agent._touchedFiles`）与提交 diff
 * （批档 §1 的 `批起 sha = <sha>` 记入行 ⇒ `git diff --name-only <sha> HEAD`）；这五例先实读 diff 腿自证，否则「范围 N 档」只是空转读数。
 * 7-7 不用 git 仓（笔域集只含批档自身，档数靠引擎实判数对拍）；7-8 只判写段面（不涉提交 diff 腿）；
 * 7-9 判工具描述面（两条判据同判：400 字符段 + 裸档名 ⇒ 双命中；只修锚仍拒；拆段后放行）。
 * 7-13 判段判据的列表项符号集（中文族 `·` ∥ `•` ∥ `①`–`⑳`）：400+ 字的列表档 0 命中、收口放行；
 * 同内容去标记的 400 字一段仍 1 条 ⇒ 照拒——认得列表项只断段、不改阈值。
 * 7-5 判段判据的围栏语义（`docs/core/design/DOC-DISCIPLINE.md` §3.18「围栏行止」）：嵌套围栏（外层 ```` 包内层 ```）的内层代码不入段；同字数去围栏的对照片照拦。
 *
 * 夹具 = 系统临时域（项目根 + 真 git 仓 + 六段批档；`mkdtempSync`——零落仓、可并发）。收口后的台账重锚
 * 经测试缝 `_setLedgerDirForTest` 导向临时目录（不碰真实用户数据目录）。
 * RTM 的「同一夹具」= 同一夹具形：每例各自独立起一份，用例之间不依赖执行序。
 *
 * 复跑（cwd = 仓根）：`node --test test/integration/batch-close-gate.test.mjs`
 */
import { after, test } from "node:test"
import assert from "node:assert/strict"
import { execFileSync } from "node:child_process"
import { mkdirSync, mkdtempSync, existsSync, readFileSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
// 收尾尽力面单源（`docs/core/design/TESTING.md` §4.6）：清理失败不判红整档，但要可见。
import { removeTempDirBestEffort } from "../teardown.mjs"

import { batchTool } from "../../thincoder-core/agent-tools/batch.mjs"
import { runDocCheck } from "../../thincoder-core/doc-check/index.mjs"
// `ledger.mjs` 走动态导入：静态链入 `node:sqlite`（W8 契约——台账模块的消费侧一律动态取）。
const { _setLedgerDirForTest, _resetLedgerDirForTest } = await import("../../thincoder-core/ledger.mjs")

const BATCH_REL = "docs/batches/fixture.md"
const CLEAN_A = "docs/notes/clean-a.md"
const CLEAN_B = "docs/notes/clean-b.md"
const OUT_REL = "docs/notes/out-of-range.md" // 工作树内、范围外（不在触达账 ∧ 不在提交 diff）
const DIRTY_REL = "docs/notes/dirty.md" // 笔域集内、含悬空指针
/** 档头「一段一作者」映射（`batch` create 落骨架时写入）——收口面 `§N（作者：<角色>）` 的唯一来源。 */
const MAPPING = "> 一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）"
/** 探针：带目录段、仓根相对、**不在批档根下**的悬空路径（7-6 / 7-8 共用）。
 *  为何不写裸名：批档面互引不判（判据单源 = `docs/core/design/DOC-DISCIPLINE.md` §3.29 条目 AC）之后，
 *  批档面内的裸名走候选 ②（同目录拼法）⇒ 被豁免，这两行就守不住「命中落在批档自身 ∥ 本次写入文本」了。
 *  带目录段 ⇒ 只走候选 ① ⇒ 面判不成立 ⇒ 照判 `档缺`（该行证的东西不变）。 */
const OUTSIDE_DANGLING = "thincoder-core/tool-docs/NO-SUCH-DOC.md"
const OWN_TEST_REL = "docs/batches/fixture.test.mjs" // 7-4：本批自己的单测档（同目录、批档名前缀）
const OWN_VARIANT_REL = "docs/batches/fixture-extra.test.mjs" // 7-4：同前缀变体（盘上无 fixture-extra.md）

const CLEAN = "# 干净档\n\n无指针。\n"
const DIRTY = "# 脏档\n\n见 `docs/notes/missing-page.md`。\n" // 恰一条 锚·档缺

/** 台账库目录（临时域——收口重锚不落真实用户目录）。 */
const ledgerDir = mkdtempSync(join(tmpdir(), "bcg-ledgerdir-"))
_setLedgerDirForTest(ledgerDir)

/** depth-0 主 agent（`batch` 工具的 close 轨仅此身份放行）；`touched` = 父侧触达账。 */
const parentCtx = (root, touched) => ({ depth: 0, agent: { cwd: root, _touchedFiles: touched, config: { agent: { engineering: true } } } })
/** 子代理（`eng-designer` ⇒ §2），目标是 spawn 绑定的批档（无 path 参数）；触达账缺省空。 */
const designerCtx = (root) => ({ depth: 1, agent: { cwd: root, _role: "eng-designer", _touchedFiles: [], config: { agent: { engineering: true } } } })
const depth0 = batchTool(null)
const asDesigner = batchTool(BATCH_REL)

const projects = []

after(() => {
  _resetLedgerDirForTest()
  // 临时仓带 `.git`，句柄未即释时清理会抛 ⇒ 走助手（有界重试、失败只写一行 stderr，不判红整档）。
  for (const p of projects) removeTempDirBestEffort(p)
  removeTempDirBestEffort(ledgerDir)
})

/** 六段批档全文（`sha` ⇒ §1 落 `批起 sha = <sha>` 记入行；`sec1` = §1 正文；`sec5` = §5 正文（7-15 放已删单测档的指针）；
 *  §2/§3/§4/§6 各有内容——close 的链门前置）。 */
const record = (sha, { sec1 = "夹具讨论。", sec5 = "夹具实施。" } = {}) => [
  "# 夹具批 · 收口门范围",
  "",
  MAPPING,
  "> 编制：夹具 · 2026-10-25 · 来源 = 集成夹具。",
  "> 台账 = #1（夹具）。前情 = 无（独立批）。",
  "",
  "## §1 讨论（主 agent）",
  "**状态行**：🔄 进行中",
  "",
  sec1,
  "",
  `**批起 sha = ${sha}**`,
  "",
  "## §2 批次任务与设计（eng-designer）",
  "**状态行**：设计完成",
  "",
  "夹具任务。",
  "",
  "## §3 设计评审（评审子代理）",
  "**状态行**：评审通过",
  "",
  "夹具评审。",
  "",
  "## §4 用户批准（主 agent）",
  "夹具批准。",
  "",
  "## §5 实施记录（eng-coder）",
  sec5,
  "",
  "## §6 验证与收口（父代理）",
  "夹具收口。",
  "",
].join("\n")

/** 夹具项目根（项目声明 + 批档/文档目录；不落盘任何真实仓内容）。 */
function makeProject(tag) {
  const root = mkdtempSync(join(tmpdir(), `bcg-${tag}-`))
  projects.push(root)
  writeFileSync(join(root, "PROJECT-MANIFEST.json"), JSON.stringify({ version: 1, phase: "initial-dev" }, null, 2))
  mkdirSync(join(root, "docs/batches"), { recursive: true })
  mkdirSync(join(root, "docs/notes"), { recursive: true })
  return root
}

/**
 * 真 git 仓：空基提交 → 取基 sha → 写批档（§1 记入基 sha）+ 本批两档 → 提交。
 * 于是提交 diff 腿恒 = 批档 ＋ `CLEAN_A` ＋ `CLEAN_B`（批档自身也在判域内，不再被滤掉）；触达账按例各自给
 * （7-1 一档 · 7-2 两档 · 7-3 两干净档＋脏档 · 7-6 零档）。
 */
function gitRepo(root, { sec1, sec5 } = {}) {
  git(root, "init", "-q")
  commit(root, "base")
  const sha = rev(root)
  writeFileSync(join(root, BATCH_REL), record(sha, { sec1, sec5 }))
  writeFileSync(join(root, CLEAN_A), CLEAN)
  writeFileSync(join(root, CLEAN_B), CLEAN)
  commit(root, "本批两档 + 批档")
  return sha
}

/** git 封装（`core.quotepath=false` 与受测实现同款——不关此开关时非 ASCII 档名会被引号转义，静默掉出清单）。 */
const git = (cwd, ...argv) => execFileSync("git", [
  "-C", cwd, "-c", "user.email=fixture@example.test", "-c", "user.name=fixture",
  "-c", "commit.gpgsign=false", "-c", "core.autocrlf=false", "-c", "core.quotepath=false", ...argv,
], { encoding: "utf8" })
const commit = (cwd, message) => { git(cwd, "add", "-A"); git(cwd, "commit", "-q", "-m", message) }
const rev = (cwd) => git(cwd, "rev-parse", "HEAD").trim()

/** 提交 diff 腿实读（本批 `.md` 全部——**含批档自身**：批档在判域内，不再过滤）。 */
const diffDocs = (root, sha) => git(root, "diff", "--name-only", sha, "HEAD")
  .split("\n").map((s) => s.trim())
  .filter((f) => f.endsWith(".md"))
  .sort()

/** 回执里的 **gate 段首行**（`[doc-check gate] <verdict> · 范围 N 档`）——RTM 那句「回执首行
 *  `DOC-CHECK GATE: …`」指的是本段首行，不是整条 close 回执的首行（后者是 `batch: §1 status line → …` 状态句）。 */
const gateLineOf = (receipt) => {
  const line = receipt.split("\n").find((l) => l.startsWith("[doc-check gate] "))
  assert.ok(line, `回执应携 gate 行，实际回执：${receipt}`)
  return line
}

/** §1 状态行原文（拒收口 ⇒ 逐字不变；放行 ⇒ 已收口）。 */
const statusLineOf = (root) => readFileSync(join(root, BATCH_REL), "utf8").split("\n").find((l) => l.startsWith("**状态行**："))

/** 例前置：提交 diff 腿实读 = 批档自身 + 本批两档（否则「范围 N 档」只是空转读数）。 */
function assertBatchCommitted(root, sha) {
  assert.deepEqual(diffDocs(root, sha), [BATCH_REL, CLEAN_A, CLEAN_B], "提交 diff 腿应恰含批档自身 + 本批两档")
}

test('CLI 7-1 正常 · 笔域集内各档零命中 ⇒ 收口放行、回执 DOC-CHECK GATE: PASS、范围行档数 = 笔域集档数', async () => {
  const root = makeProject("r71")
  const sha = gitRepo(root)
  assertBatchCommitted(root, sha)

  // 触达账只落 1 档、提交 diff 3 档（批档自身 + 本批两档）⇒ 笔域集 = 并集 3 档：「范围 3 档」因此能证明
  // diff 腿参与（若 diff 腿失效、仅触达账 ∪ 批档自身入判，范围会掉成 2 档）。
  const receipt = await depth0.execute({ action: "close", path: BATCH_REL, completed: [], closeEvidence: "夹具收口证据" }, parentCtx(root, [join(root, CLEAN_A)]))

  assert.equal(gateLineOf(receipt), "[doc-check gate] DOC-CHECK GATE: PASS · 范围 3 档", `PASS 且范围 = 笔域集 3 档：${receipt}`)
  assert.match(receipt, /^batch: §1 status line → 「已收口 \d{4}-\d{2}-\d{2}」/, `收口放行且落盘：${receipt}`)
  assert.doesNotMatch(receipt, /基 sha 未定/, "§1 记入行在盘 ⇒ 取到基，无该明示行")
  assert.match(statusLineOf(root), /已收口/, "§1 状态行已写「已收口」")
})

test('CLI 7-2 边界 · 工作树内范围外脏档 ⇒ 不入判、收口放行、回执零该档行', async () => {
  const root = makeProject("r72")
  const sha = gitRepo(root)
  assertBatchCommitted(root, sha)
  writeFileSync(join(root, OUT_REL), DIRTY) // 工作树内、两腿都不含（未提交 ∧ 未触达）

  // 前置：这档确实脏（含悬空指针）——否则本例空转，什么都证明不了
  const probe = runDocCheck(root, { mode: "gate", docs: [join(root, OUT_REL)], docsSource: "explicit" })
  assert.ok(probe.anchorHits.length >= 1, `前置：范围外档须真含悬空指针 —— ${probe.report}`)

  const receipt = await depth0.execute({ action: "close", path: BATCH_REL, completed: [], closeEvidence: "夹具收口证据" }, parentCtx(root, [join(root, CLEAN_A), join(root, CLEAN_B)]))

  assert.equal(gateLineOf(receipt), "[doc-check gate] DOC-CHECK GATE: PASS · 范围 3 档", `范围外档不入判、档数 = 笔域集 3 档：${receipt}`)
  assert.doesNotMatch(receipt, /out-of-range/, `回执零该档行（连档名都不出现）：${receipt}`)
  assert.doesNotMatch(receipt, /missing-page/, `回执零该档的命中行：${receipt}`)
  assert.match(statusLineOf(root), /已收口/, "收口放行且落盘")
})

test('CLI 7-3 错误 · 笔域集内一档含悬空指针 ⇒ 收口被拒（throw）、§1 状态行字节不变', async () => {
  const root = makeProject("r73")
  const sha = gitRepo(root)
  assertBatchCommitted(root, sha)
  writeFileSync(join(root, DIRTY_REL), DIRTY) // 笔域集内（提交 diff 腿 + 触达账都含它）
  commit(root, "本批脏档")
  const before = readFileSync(join(root, BATCH_REL), "utf8")

  await assert.rejects(
    () => depth0.execute({ action: "close", path: BATCH_REL, completed: [], closeEvidence: "夹具收口证据" }, parentCtx(root, [join(root, CLEAN_A), join(root, CLEAN_B), join(root, DIRTY_REL)])),
    (e) => {
      assert.match(e.message, /文档机检门拒收口/, `拒串点名门位：${e.message}`)
      assert.match(e.message, /DOC-CHECK GATE: REFUSED（命中 1 条）/, `拒串携 verdict 首行：${e.message}`)
      assert.match(e.message, /✗ 锚·档缺 docs\/notes\/dirty\.md:\d+/, `拒串点名该档与命中行：${e.message}`)
      return true
    },
  )
  assert.equal(readFileSync(join(root, BATCH_REL), "utf8"), before, "拒收口 ⇒ 档全文逐字不变（§1 状态行字节不变）")
  assert.match(statusLineOf(root), /进行中/, "§1 状态行仍「进行中」")

  // 同一行另一格：悬空指针在批起基线里、本批没有改它 ⇒ 只出存量读数，不阻收口。
  const stockRoot = makeProject("r73-stock")
  writeFileSync(join(stockRoot, DIRTY_REL), DIRTY)
  const stockSha = gitRepo(stockRoot)
  assertBatchCommitted(stockRoot, stockSha)
  const stockReceipt = await depth0.execute(
    { action: "close", path: BATCH_REL, completed: [], closeEvidence: "夹具收口证据" },
    parentCtx(stockRoot, [join(stockRoot, CLEAN_A), join(stockRoot, CLEAN_B), join(stockRoot, DIRTY_REL)]),
  )
  assert.match(gateLineOf(stockReceipt), /DOC-CHECK GATE: PASS/, stockReceipt)
  assert.match(stockReceipt, /^存量命中 1 条（不属本次改动区，不阻断交付；整档读数）$/m, stockReceipt)
  assert.doesNotMatch(stockReceipt, /✗ /, `存量不逐条进拒面：${stockReceipt}`)
})

test('CLI 7-4 错误 · 批档同目录留本批自己的单测档 ⇒ 收口被拒（点名绝对路径 + 修法）、删档后同跑放行', async () => {
  const root = makeProject("r74")
  const sha = gitRepo(root)
  assertBatchCommitted(root, sha)
  // 本批自己的单测档：同名一份 + 同前缀变体一份（盘上无 `fixture-extra.md` ⇒ 归属 = 最长在盘前缀 `fixture`）。
  // 两档不提交：本门只看「在不在盘」，与提交面 / 笔域集无关。
  writeFileSync(join(root, OWN_TEST_REL), "// 夹具：本批自己的单元测试档（用毕即删）\n")
  writeFileSync(join(root, OWN_VARIANT_REL), "// 夹具：同前缀变体\n")
  const before = readFileSync(join(root, BATCH_REL), "utf8")

  await assert.rejects(
    () => depth0.execute({ action: "close", path: BATCH_REL, completed: [], closeEvidence: "夹具收口证据" }, parentCtx(root, [join(root, CLEAN_A), join(root, CLEAN_B)])),
    (e) => {
      assert.match(e.message, /本批批内单测档仍在盘/, `拒串点名本门：${e.message}`)
      assert.match(e.message, /unit test file\(s\) still on disk/, `拒串携机检锚串：${e.message}`)
      assert.ok(e.message.includes(join(root, OWN_TEST_REL)), `拒串点名该档绝对路径：${e.message}`)
      assert.ok(e.message.includes(join(root, OWN_VARIANT_REL)), `拒串点名同前缀变体绝对路径：${e.message}`)
      assert.match(e.message, /删掉上面点名的档/, `拒串带修法（删）：${e.message}`)
      assert.match(e.message, /Nothing was written\./, `拒串收尾句：${e.message}`)
      return true
    },
  )
  assert.equal(readFileSync(join(root, BATCH_REL), "utf8"), before, "拒收口 ⇒ 档全文逐字不变（§1 状态行字节不变）")
  assert.match(statusLineOf(root), /进行中/, "§1 状态行仍「进行中」")

  // 删档（门只拒、不代删）⇒ 同跑收口放行
  removeTempDirBestEffort(join(root, OWN_TEST_REL))
  removeTempDirBestEffort(join(root, OWN_VARIANT_REL))
  const receipt = await depth0.execute({ action: "close", path: BATCH_REL, completed: [], closeEvidence: "夹具收口证据" }, parentCtx(root, [join(root, CLEAN_A), join(root, CLEAN_B)]))
  assert.match(receipt, /^batch: §1 status line → 「已收口 \d{4}-\d{2}-\d{2}」/, `删档后收口放行且落盘：${receipt}`)
  assert.doesNotMatch(receipt, /本批批内单测档/, `放行零回执（本门不出回执段）：${receipt}`)
  assert.match(statusLineOf(root), /已收口/, "§1 状态行已写「已收口」")
})
// 7-5（本批新增）：段判据的围栏语义——**嵌套围栏**（外层四反引号包内层三反引号）的内层代码不入段。
// 缺口来源 = 2026-10-27 围栏闭合判定缺陷：闭合只比字符不比长度 ⇒ 外层开启行被内层的三反引号提前「闭合」，
// 内层代码行落回正文、被并成一段 ⇒ 合法档被判「文字太长」而拒。两半都成立才算过：
// 嵌套档 0 段命中（收口放行）∥ 同字数去围栏对照档恰 1 条（收口照拒）。
const CODE_LINES = Array.from({ length: 5 }, (_, i) => `const v${i} = "${"c".repeat(66)}"`)
const CODE_CHARS = CODE_LINES.reduce((n, l) => n + [...l].length, 0)
/** 嵌套围栏档：外层 ```` 包内层 ```js（内层代码合计 > 300 字——认不出围栏就是一段 395 字）。 */
const nestedFenceDoc = () => ["# 嵌套围栏档", "", "````", "```js", ...CODE_LINES, "```", "````", ""].join("\n")
/** 对照档：同一批行去掉围栏标记（同字数、同内容，唯一差别 = 围栏）。 */
const plainDoc = () => ["# 无围栏对照档", "", ...CODE_LINES, ""].join("\n")

test("CLI 7-5 嵌套围栏档内层代码不入段判据：收口放行，对照档照拒", async () => {
  assert.ok(CODE_CHARS > 300, `夹具前提：内层代码合计 ${CODE_CHARS} 字 > 段判据阈值 300——认不出围栏就是超长段`)

  // 两半 = 两份夹具、两次收口：一次 `batch close` 只能给一个 verdict（跑一次同时断「放行」与「被拒」不可能），
  // 故按 RTM 句末「两半都成立才算过」逐半各断一次——先例 = 本档 7-11（前半 ∥ 后半）∥ 7-13（另起一份夹具）。
  // 前半：嵌套围栏档入笔域集 ⇒ 0 段命中、收口放行
  const root = makeProject("r75")
  gitRepo(root)
  writeFileSync(join(root, "docs/notes/nested-fence.md"), nestedFenceDoc())
  commit(root, "嵌套围栏档")
  const probe = runDocCheck(root, { mode: "gate", docs: [join(root, "docs/notes/nested-fence.md")], docsSource: "explicit" })
  assert.equal(probe.paragraphHits.length, 0, `嵌套围栏档应零段命中（内层代码不入段），实读：${probe.report}`)

  const receipt = await depth0.execute({ action: "close", path: BATCH_REL, completed: [], closeEvidence: "夹具收口证据" }, parentCtx(root, []))
  assert.equal(gateLineOf(receipt), "[doc-check gate] DOC-CHECK GATE: PASS · 范围 4 档", `批档 + 本批两档 + 嵌套围栏档 = 4 档且全清：${receipt}`)
  assert.match(receipt, /^batch: §1 status line → 「已收口 \d{4}-\d{2}-\d{2}」/, `收口放行且落盘：${receipt}`)
  assert.match(statusLineOf(root), /已收口/, "§1 状态行已写「已收口」")

  // 后半 = 反证，另起一份夹具（前一本批档已冻结）：同字数、去围栏 ⇒ 一段 395 字，段判据照拦
  const root2 = makeProject("r75b")
  gitRepo(root2)
  writeFileSync(join(root2, "docs/notes/plain.md"), plainDoc())
  commit(root2, "去围栏对照档")
  const controlProbe = runDocCheck(root2, { mode: "gate", docs: [join(root2, "docs/notes/plain.md")], docsSource: "explicit" })
  assert.equal(controlProbe.paragraphHits.length, 1, `对照档应恰 1 条段命中（阈值没动）：${controlProbe.report}`)

  await assert.rejects(
    () => depth0.execute({ action: "close", path: BATCH_REL, completed: [], closeEvidence: "夹具收口证据" }, parentCtx(root2, [])),
    (e) => {
      assert.match(e.message, /DOC-CHECK GATE: REFUSED（命中 1 条）/, `拒串携 verdict 首行：${e.message}`)
      assert.match(e.message, /✗ 文字太长，难于阅读 docs\/notes\/plain\.md:\d+/, `拒串点名该档与段命中行：${e.message}`)
      return true
    },
  )
  assert.match(statusLineOf(root2), /进行中/, "§1 状态行仍「进行中」")
})

test('CLI 7-6 错误 · 批档 §1 含一条带目录段、不在批档根下的悬空路径 ⇒ 收口被拒（命中落在批档自身、点名 §1（作者：主 agent））、状态行字节不变', async () => {
  const root = makeProject("r76")
  const sha = gitRepo(root, { sec1: `夹具见 ${OUTSIDE_DANGLING} 的判据。` }) // 批档自身脏、其余档干净、触达账零档
  assertBatchCommitted(root, sha)
  const before = readFileSync(join(root, BATCH_REL), "utf8")

  await assert.rejects(
    () => depth0.execute({ action: "close", path: BATCH_REL, completed: [], closeEvidence: "夹具收口证据" }, parentCtx(root, [])),
    (e) => {
      assert.match(e.message, /文档机检门拒收口/, `拒串点名门位：${e.message}`)
      assert.match(e.message, /DOC-CHECK GATE: REFUSED（命中 1 条）/, `拒串携 verdict 首行：${e.message}`)
      assert.match(e.message, /✗ 锚·档缺 docs\/batches\/fixture\.md:\d+ `thincoder-core\/tool-docs\/NO-SUCH-DOC\.md`/, `命中行点名批档内该行：${e.message}`)
      assert.match(e.message, /§1（作者：主 agent）/, `命中行答「谁该改」：${e.message}`)
      return true
    },
  )
  assert.equal(readFileSync(join(root, BATCH_REL), "utf8"), before, "拒收口 ⇒ 档全文逐字不变（§1 状态行字节不变）")
  assert.match(statusLineOf(root), /进行中/, "§1 状态行仍「进行中」")
})

test('CLI 7-7 正常 · 批档干净且笔域集只含批档自身 ⇒ 放行、范围行档数 = 实判档数且 ≥ 1', async () => {
  const root = makeProject("r77")
  // 无 git 仓 + 触达账零档 ⇒ 笔域集 = 批档自身：范围「1 档」只能是「批档自身进了判域」的结果
  writeFileSync(join(root, BATCH_REL), record("0".repeat(40)))

  const receipt = await depth0.execute({ action: "close", path: BATCH_REL, completed: [], closeEvidence: "夹具收口证据" }, parentCtx(root, []))
  const line = gateLineOf(receipt)
  assert.match(line, /^\[doc-check gate\] DOC-CHECK GATE: PASS · 范围 \d+ 档$/, `PASS + 范围行：${receipt}`)
  const engine = runDocCheck(root, { mode: "gate", docs: [join(root, BATCH_REL)], docsSource: "explicit" })
  assert.equal(Number(/范围 (\d+) 档/.exec(line)?.[1]), engine.checkFiles.length, `范围档数 = 引擎实判档数：${receipt}`)
  assert.equal(engine.checkFiles.length, 1, `笔域集只含批档自身 ⇒ 实判 1 档：${receipt}`)
  assert.match(statusLineOf(root), /已收口/, "收口放行且落盘")
})

test('CLI 7-8 错误 · 子代理 append §2：本次写入文本含一条带目录段、不在批档根下的悬空路径 ⇒ 拒（零字节）；改全路径后同调用 ⇒ 落盘、前文零变', async () => {
  const root = makeProject("r78")
  gitRepo(root)
  const before = readFileSync(join(root, BATCH_REL), "utf8")

  await assert.rejects(
    () => asDesigner.execute({ action: "append", segment: "§2", text: `本段引 ${OUTSIDE_DANGLING} 的判据。` }, designerCtx(root)),
    (e) => {
      assert.match(e.message, /文档机检门拒写/, `拒串点名门位：${e.message}`)
      assert.match(e.message, /REFUSED（命中 1 条——本次写入文本/, `强制集指向本次写入文本：${e.message}`)
      assert.match(e.message, /✗ 锚·档缺 本次写入文本:\d+ `thincoder-core\/tool-docs\/NO-SUCH-DOC\.md`/, `命中行点名本次写入文本：${e.message}`)
      return true
    },
  )
  assert.equal(readFileSync(join(root, BATCH_REL), "utf8"), before, "拒写 ⇒ 批档字节逐字不变（零字节落盘）")

  // 改成全路径（解析序 ①）⇒ 同调用落盘；插在 §2 段尾，前后文逐字不变
  const landed = `本段引 ${CLEAN_A} 的判据。`
  const receipt = await asDesigner.execute({ action: "append", segment: "§2", text: landed }, designerCtx(root))
  assert.match(receipt, /appended \d+ characters to §2/, `落盘回执：${receipt}`)
  assert.match(gateLineOf(receipt), /DOC-CHECK GATE: PASS/, `落盘时门放行：${receipt}`)
  const after = readFileSync(join(root, BATCH_REL), "utf8")
  assert.equal(after.slice(0, before.indexOf("## §2")), before.slice(0, before.indexOf("## §2")), "§2 段头之前逐字不变")
  assert.equal(after.slice(after.indexOf("## §3")), before.slice(before.indexOf("## §3")), "§3 之后逐字不变")
  assert.ok(after.includes(landed), "本次文本已落盘")
})

test('CLI 7-11 错误 · 批档 §1 写「> 不适用：§3」声明 ⇒ 收口被拒（声明机制已停用，逐字点名该行）；§3 无状态行 ⇒ 收口被拒（`§3 状态行 = （无状态行）`）——两半都成立才算过', async () => {
  // 前半：存量声明档的形态（§1 段体带一行 `> 不适用：§3 —— …`）⇒ 链门前置扫描当场拒，不提「形不合」而是说「这条路没有了」
  const root = makeProject("r711")
  const sha = gitRepo(root, { sec1: "夹具讨论。\n\n> 不适用：§3 —— 本批纯措辞纠正、无设计变更。" })
  assertBatchCommitted(root, sha)
  const before = readFileSync(join(root, BATCH_REL), "utf8")

  await assert.rejects(
    () => depth0.execute({ action: "close", path: BATCH_REL, completed: [], closeEvidence: "夹具收口证据" }, parentCtx(root, [])),
    (e) => {
      assert.match(e.message, /`不适用` 声明已停用（inapplicability declaration retired）/, `拒串点名机制已停用：${e.message}`)
      assert.match(e.message, /no declaration is accepted: §2 \/ §3 \/ §4 \/ §6 must each carry content \(§5 exempt\)/, `拒串说清每段各自要有内容：${e.message}`)
      assert.match(e.message, /Offending line: > 不适用：§3 —— 本批纯措辞纠正、无设计变更。/, `拒串点名该行原文：${e.message}`)
      assert.match(e.message, /Nothing was written\./, `拒串收尾句：${e.message}`)
      return true
    },
  )
  assert.equal(readFileSync(join(root, BATCH_REL), "utf8"), before, "拒收口 ⇒ 档全文逐字不变（§1 状态行字节不变）")
  assert.match(statusLineOf(root), /进行中/, "§1 状态行仍「进行中」")

  // 后半：§3 状态词臂无条件——§2/§3/§4/§6 各有内容但 §3 无状态行 ⇒ 仍拒（没有「声明不适用」那条旁路）
  const root2 = makeProject("r711b")
  writeFileSync(join(root2, BATCH_REL), record("0".repeat(40)).replace("**状态行**：评审通过\n\n", ""))
  await assert.rejects(
    () => depth0.execute({ action: "close", path: BATCH_REL, completed: [], closeEvidence: "夹具收口证据" }, parentCtx(root2, [])),
    (e) => {
      assert.match(e.message, /§3 状态行 = （无状态行），须 = 评审通过/, `拒串点名 §3 状态行缺失：${e.message}`)
      assert.match(e.message, /Missing: §3\. Nothing was written\./, `拒串只点名真正缺的那一段：${e.message}`)
      assert.doesNotMatch(e.message, /声明不适用/, `拒串零声明路：${e.message}`)
      return true
    },
  )
  assert.match(statusLineOf(root2), /进行中/, "§1 状态行仍「进行中」")
})

// 工具描述面（`thincoder-core/tool-docs/**`）与其余面同判（撤面豁免）——400 字符段在该面照判段判据、
// 裸档名照判锚判据：两条同时点名；只修锚仍拒（段那条独立成立）；拆段后同一条门放行。
test('CLI 7-9 错误 · 笔域集内一档在工具描述面（400 字符段 + 裸档名）⇒ 收口被拒且锚与段两条同时点名', async () => {
  const TOOLDOC_REL = "thincoder-core/tool-docs/probe.md"
  const LONG = "长".repeat(400)
  const root = makeProject("r79")
  gitRepo(root)
  mkdirSync(join(root, "thincoder-core/tool-docs"), { recursive: true })
  writeFileSync(join(root, TOOLDOC_REL), "# 探针\n\n" + LONG + "\n\n见 `NO-SUCH-DOC.md`。\n")
  commit(root, "工具描述面探针档")
  const touched = [join(root, CLEAN_A), join(root, CLEAN_B), join(root, TOOLDOC_REL)]
  const before = readFileSync(join(root, BATCH_REL), "utf8")

  await assert.rejects(
    () => depth0.execute({ action: "close", path: BATCH_REL, completed: [], closeEvidence: "夹具收口证据" }, parentCtx(root, touched)),
    (e) => {
      assert.match(e.message, /DOC-CHECK GATE: REFUSED（命中 2 条）/, `拒串应恰 2 条（锚 1 + 段 1——该面不再被跳过）：${e.message}`)
      assert.match(e.message, /✗ 锚·档缺 thincoder-core\/tool-docs\/probe\.md:\d+/, `拒串点名锚与该档行号：${e.message}`)
      assert.match(e.message, /✗ 文字太长，难于阅读 thincoder-core\/tool-docs\/probe\.md:\d+/, `同档 400 字符段必须命中段判据（面豁免已撤）：${e.message}`)
      return true
    },
  )
  assert.equal(readFileSync(join(root, BATCH_REL), "utf8"), before, "拒收口 ⇒ 档全文逐字不变（§1 状态行字节不变）")
  assert.match(statusLineOf(root), /进行中/, "§1 状态行仍「进行中」")

  // 只删裸档名（锚那条清掉、段落一字未动）⇒ 仍拒、只剩段那条：证明段命中不是被锚命中带出来的。
  writeFileSync(join(root, TOOLDOC_REL), "# 探针\n\n" + LONG + "\n")
  await assert.rejects(
    () => depth0.execute({ action: "close", path: BATCH_REL, completed: [], closeEvidence: "夹具收口证据" }, parentCtx(root, touched)),
    (e) => {
      assert.match(e.message, /DOC-CHECK GATE: REFUSED（命中 1 条）/, `锚清后应只剩段 1 条：${e.message}`)
      assert.match(e.message, /✗ 文字太长，难于阅读 thincoder-core\/tool-docs\/probe\.md:\d+/, `段判据仍拦：${e.message}`)
      assert.doesNotMatch(e.message, /✗ 锚·/, `锚那条应已清：${e.message}`)
      return true
    },
  )

  // 拆段（两段各 200 ≤ 阈值）⇒ 同一条门放行：判据没松，是病治好了。
  writeFileSync(join(root, TOOLDOC_REL), "# 探针\n\n" + "长".repeat(200) + "\n\n" + "长".repeat(200) + "\n")
  const receipt = await depth0.execute({ action: "close", path: BATCH_REL, completed: [], closeEvidence: "夹具收口证据" }, parentCtx(root, touched))
  assert.match(receipt, /^batch: §1 status line → 「已收口 \d{4}-\d{2}-\d{2}」/, `拆段后收口放行且落盘：${receipt}`)
  assert.match(statusLineOf(root), /已收口/, "§1 状态行已写「已收口」")
})

// 7-13（本批新增）：段判据的列表项符号集认得出中文族（`·` ∥ `•` ∥ 圈号 `①`–`⑳`）。
// 现场是写门那一侧：中文列表被并成一段、超 300 ⇒ 写入当场被拒 ⇒ 仓里留不下这种行（「盘上零处」不是「没命中」）。
// 故本例走真收口轨：三份中文列表档入笔域集 ⇒ 放行；同内容去标记的 400 字一段 ⇒ 照拒。
const CN_ITEM = "文".repeat(80)
const CIRCLED5 = "①②③④⑤"
/** 五项一项一行的中文列表档（每项 80 字 ⇒ 认不出列表项时它就是 400+ 字的长段）。 */
const cnList = (mark) => "# 中文列表\n\n" + Array.from({ length: 5 }, (_, i) => mark(i)).join("\n") + "\n"

test("CLI 7-13 正常 · 中文项目符号三族档入笔域集 ⇒ 收口放行；同内容去标记的 400 字对照档 ⇒ 收口被拒（文字太长，难于阅读）", async () => {
  const root = makeProject("r713")
  gitRepo(root)
  const bullets = [
    ["docs/notes/cn-dot.md", cnList(() => "· " + CN_ITEM)],
    ["docs/notes/cn-bullet.md", cnList(() => "• " + CN_ITEM)],
    ["docs/notes/cn-circled.md", cnList((i) => `${CIRCLED5[i]} ${CN_ITEM}`)],
  ]
  for (const [rel, text] of bullets) writeFileSync(join(root, rel), text)
  commit(root, "中文项目符号三档")

  // 前置：三份档的列表行字面确实超阈（认不出符号 ⇒ 必被并成 410 字长段），否则本例空转、什么都证不了
  for (const [rel, text] of bullets) {
    const merged = text.split("\n").filter((l) => l.trim() !== "" && !l.startsWith("#")).reduce((n, l) => n + [...l].length, 0)
    assert.ok(merged > 300, `前置：${rel} 的列表行字面合计 ${merged} > 300——认不出符号就是长段`)
  }
  const probe = runDocCheck(root, { mode: "gate", docs: bullets.map(([rel]) => join(root, rel)), docsSource: "explicit" })
  assert.equal(probe.paragraphHits.length, 0, `三份中文列表档应零段命中：${probe.report}`)

  const receipt = await depth0.execute({ action: "close", path: BATCH_REL, completed: [], closeEvidence: "夹具收口证据" }, parentCtx(root, []))
  assert.equal(gateLineOf(receipt), "[doc-check gate] DOC-CHECK GATE: PASS · 范围 6 档", `三档 + 本批两档 + 批档自身 = 6 档：${receipt}`)
  assert.match(receipt, /^batch: §1 status line → 「已收口 \d{4}-\d{2}-\d{2}」/, `收口放行且落盘：${receipt}`)
  assert.match(statusLineOf(root), /已收口/, "§1 状态行已写「已收口」")

  // 后半 = 反证，另起一份夹具（前一本批档已冻结）：同内容去标记 ⇒ 400 字一段，段判据照拦
  const root2 = makeProject("r713b")
  gitRepo(root2)
  const controlRel = "docs/notes/cn-plain.md"
  writeFileSync(join(root2, controlRel), cnList(() => CN_ITEM))
  commit(root2, "去标记对照档")
  const controlProbe = runDocCheck(root2, { mode: "gate", docs: [join(root2, controlRel)], docsSource: "explicit" })
  assert.equal(controlProbe.paragraphHits.length, 1, `对照档应恰 1 条段命中（阈值没动）：${controlProbe.report}`)

  await assert.rejects(
    () => depth0.execute({ action: "close", path: BATCH_REL, completed: [], closeEvidence: "夹具收口证据" }, parentCtx(root2, [])),
    (e) => {
      assert.match(e.message, /DOC-CHECK GATE: REFUSED（命中 1 条）/, `拒串携 verdict 首行：${e.message}`)
      assert.match(e.message, /✗ 文字太长，难于阅读 docs\/notes\/cn-plain\.md:\d+/, `拒串点名该档与段命中行：${e.message}`)
      return true
    },
  )
  assert.match(statusLineOf(root2), /进行中/, "§1 状态行仍「进行中」")
})

// 7-15（本批新增）：批档面互引不判（判据单源 = `docs/core/design/DOC-DISCIPLINE.md` §3.29 条目 AC）。
// 缺口来源 = 台账 `#2114` ∥ `#2117` 两次收口死锁：本批单元测试档删了判 `档缺`、不删又拒收口（两面互锁）。
// 三半都成立才算过：① 批档 → 已删的本批单测档 ⇒ 收口放行（死锁消失）；② 同一指针写进设计档 ⇒ 照判 `档缺`（方向纪律）；
// ③ `report` 面恒出留痕一行（不拦、不进 `hits`）。
test("CLI 7-15 正常 · 批档引已删的本批单测档 ⇒ 收口放行（死锁消失）；同一指针在设计档 ⇒ 仍判 档缺；report 面留痕一行", async () => {
  // 前半：指针 = 本批单测档的仓根全路径；档落盘后删掉——那正是死锁发生的时刻（目标已不在盘）
  const root = makeProject("r715")
  const sha = gitRepo(root, { sec5: `本批单测档 \`${OWN_TEST_REL}\` 已随收口删除。` })
  assertBatchCommitted(root, sha)
  writeFileSync(join(root, OWN_TEST_REL), "// 夹具：本批自己的单元测试档（用毕即删）\n")
  removeTempDirBestEffort(join(root, OWN_TEST_REL))
  assert.equal(existsSync(join(root, OWN_TEST_REL)), false, "前置：目标档已删——死锁只在目标不在盘时发生")

  const receipt = await depth0.execute({ action: "close", path: BATCH_REL, completed: [], closeEvidence: "夹具收口证据" }, parentCtx(root, []))
  assert.equal(gateLineOf(receipt), "[doc-check gate] DOC-CHECK GATE: PASS · 范围 3 档", `目标已删仍不判、收口放行：${receipt}`)
  assert.match(statusLineOf(root), /已收口/, "收口放行且落盘")

  // 中半：同一指针写进设计档 ⇒ 引用方不在批档根下 ⇒ 面判不成立 ⇒ 照判 档缺
  const designRel = "docs/core/design/probe.md"
  mkdirSync(join(root, "docs/core/design"), { recursive: true })
  writeFileSync(join(root, designRel), `# 设计档\n\n见 \`${OWN_TEST_REL}\`。\n`)
  const gate = runDocCheck(root, { mode: "gate", docs: [designRel], docsSource: "explicit" })
  assert.match(gate.report.split("\n")[0], /^DOC-CHECK GATE: REFUSED（锚 1 条）/, `规范档引批档照判：${gate.report}`)
  assert.match(gate.report, /✗ 锚·档缺 docs\/core\/design\/probe\.md:\d+/, `命中行点名该设计档：${gate.report}`)

  // 后半：报面留痕一行（0 也出；这里读到 1 处）——留痕不是命中，不进 `hits`
  const report = runDocCheck(root, { mode: "report", docs: [BATCH_REL] })
  assert.match(report.report, /批档面互引未判 1 处（批档 ↔ 批档 · 只留痕，不进 hits、不改 verdict）/, `报面留痕一行：${report.report}`)
  assert.equal(report.hits.total, 0, "留痕不是命中：不进 hits、不改 verdict")
})

