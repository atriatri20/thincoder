/**
 * batch-close-gate.test.mjs — 集成用例 7-1 / 7-2 / 7-3 / 7-4 / 7-5 / 7-6 / 7-7 / 7-8 / 7-9 / 7-11 / 7-13 / 7-19 / 7-20 / 7-21 / 7-22 / 7-24 / 7-25 / 7-26 / 7-33
 * （RTM CLI 端故事 7「收口只判本批改过的档」；判据原文 = `test/rtm/guard.md` 第 7 节；
 * 7-1…7-3 的机制 = `docs/core/design/DOC-CHECK.md` §6（判域 = 本批变更区）∥ §9（两个时点）∥ §3（悬空指针），
 * 7-4 的机制 = `docs/core/design/TESTING.md` §3.5（零留存的收口门），
 * 7-6 / 7-8 的机制 = `docs/core/design/DOC-CHECK.md` §3 第二条例外（批档面整份不判悬空），
 * 7-7 / 7-21 / 7-22 / 7-23 的机制 = `docs/core/design/DOC-CHECK.md` §9（两个时点：判域跟着时点走），
 * 7-24 / 7-25 的机制 = `docs/core/design/DOC-CHECK.md` §6（区内照判、区外一个字都不出），
 * 7-19 / 7-20 的机制 = `docs/core/design/DOC-CHECK.md` §8（§2 那一列行读数与批起快照比），
 * 7-26 的机制 = `docs/core/design/DOC-CHECK.md` §10（排除面收窄判集：声明前缀下的档不进判域），
 * 7-33 的机制 = `docs/core/design/DOC-CHECK.md` §8.5（越线方案支：触发物 = 收口时盘上长度越过收口线）。
 *
 * 业务入口 = 真 `batch` 工具（`agent-tools/batch.mjs`）的 depth-0 `close` 轨——不直调 `runBatchGate`：
 * 本档要的是「收口这件事」的业务可观察结果（放行 ∥ 拒绝、回执行、§1 状态行落没落盘）。
 * 断言面 = 工具回执文本 + §1 状态行落盘字节（档全文逐字比较）。
 *
 * 共享夹具住同目录 `test/integration/close-gate-fixture.mjs`（常量 ∥ 临时项目 ∥ 真 git 仓（批起快照 = `commit-tree -p HEAD` 的旁支提交）∥ 回执读数助手）——
 * 用例只调夹具、不定义夹具。
 * 复跑（cwd = 仓根）：`node --test test/integration/batch-close-gate.test.mjs`
 */
import { after, test } from "node:test"
import assert from "node:assert/strict"
import { mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"

import { removeTempDirBestEffort } from "../teardown.mjs"
import { countContentLines } from "../../thincoder-core/agent-tools/batch-tier-gate.mjs"
import { docCheckTool } from "../../thincoder-core/agent-tools/doc-check.mjs"
import { runDocCheck } from "../../thincoder-core/doc-check/index.mjs"
import {
  BATCH_REL, CLEAN, CLEAN_A, CLEAN_B, DIRTY, DIRTY_REL, OUT_REL, OUTSIDE_DANGLING, OWN_TEST_REL, OWN_VARIANT_REL,
  PROBE_REL, assertBatchCommitted, asDesigner, cleanupTemp, commit, designerCtx, depth0, gateLineOf, git, gitRepo,
  makeProject, parentCtx, record, snapshot, statusLineOf,
} from "./close-gate-fixture.mjs"

after(cleanupTemp)

/** 该档在批起 sha 上那份内容的内容行数（读数支的取数面——`countContentLines` 一把尺，不手数）。 */
const snapshotReadingOf = (root, sha, rel) => countContentLines(git(root, "show", `${sha}:${rel}`))
test('CLI 7-1 正常 · 笔域集内各档零命中 ⇒ 收口放行、回执 DOC-CHECK GATE: PASS、范围行档数 = 判域档数（批档面移出）', async () => {
  const root = makeProject("r71")
  const sha = gitRepo(root)
  assertBatchCommitted(root, sha)

  // 触达账只落 1 档、提交 diff 3 档（批档自身 + 本批两档）⇒ 笔域集 = 并集 3 档；收口时点批档面整份移出判域
  // ⇒ 判域 2 档。「范围 2 档」因此仍能证明 diff 腿参与：diff 腿失效时只剩触达账那一档，范围会掉成 1 档。
  const receipt = await depth0.execute({ action: "close", path: BATCH_REL, completed: [], closeEvidence: "夹具收口证据" }, parentCtx(root, [join(root, CLEAN_A)]))

  assert.equal(gateLineOf(receipt), "[doc-check gate] DOC-CHECK GATE: PASS · 范围 2 档", `PASS 且范围 = 判域 2 档：${receipt}`)
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
  const probe = runDocCheck(root, { docs: [join(root, OUT_REL)], moment: "close", regions: null })
  assert.ok(probe.hits.length >= 1, `前置：范围外档须真含悬空指针 —— ${probe.report}`)

  const receipt = await depth0.execute({ action: "close", path: BATCH_REL, completed: [], closeEvidence: "夹具收口证据" }, parentCtx(root, [join(root, CLEAN_A), join(root, CLEAN_B)]))

  assert.equal(gateLineOf(receipt), "[doc-check gate] DOC-CHECK GATE: PASS · 范围 2 档", `范围外档不入判、判域 2 档（笔域集 3 档减批档自身）：${receipt}`)
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
      assert.match(e.message, /DOC-CHECK GATE: REFUSED/, `拒串携 verdict 首行：${e.message}`)
      assert.match(e.message, /docs\/notes\/dirty\.md docs\/notes\/missing-page\.md 这个档不存在/, `拒串点名该档与命中行：${e.message}`)
      return true
    },
  )
  assert.equal(readFileSync(join(root, BATCH_REL), "utf8"), before, "拒收口 ⇒ 档全文逐字不变（§1 状态行字节不变）")
  assert.match(statusLineOf(root), /进行中/, "§1 状态行仍「进行中」")
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
// 7-5：段判据排除围栏与缩进代码块——嵌套围栏、四格空格、Tab 与提示词面都不入段。
// 对照侧保留同字数去围栏正文：代码块 0 段命中（收口放行）∥ 普通正文恰 1 条（收口照拒）。
const CODE_LINES = Array.from({ length: 5 }, (_, i) => `const v${i} = "${"c".repeat(66)}"`)
const CODE_CHARS = CODE_LINES.reduce((n, l) => n + [...l].length, 0)
/** 嵌套围栏档：外层 ```` 包内层 ```js（内层代码合计 > 300 字——认不出围栏就是一段 395 字）。 */
const nestedFenceDoc = () => ["# 嵌套围栏档", "", "````", "```js", ...CODE_LINES, "```", "````", ""].join("\n")
const indentedCodeDoc = () => ["# 缩进代码档", "", `    ${"四".repeat(350)}`, "", `\t${"制".repeat(350)}`, ""].join("\n")

const promptCodeDoc = () => ["# 提示词代码档", "", `    ${"码".repeat(350)}`, ""].join("\n")

test("CLI 7-5 围栏与缩进代码块不入段判据：收口放行，普通正文对照照拒", async () => {
  assert.ok(CODE_CHARS > 300, `夹具前提：内层代码合计 ${CODE_CHARS} 字 > 段判据阈值 300——认不出围栏就是超长段`)

  // 两半 = 两份夹具、两次收口：一次 `batch close` 只能给一个 verdict（跑一次同时断「放行」与「被拒」不可能），
  // 故按 RTM 句末「两半都成立才算过」逐半各断一次——先例 = 本档 7-11（前半 ∥ 后半）∥ 7-13（另起一份夹具）。
  // 前半：围栏与缩进代码档入笔域集 ⇒ 0 段命中、收口放行
  const root = makeProject("r75")
  gitRepo(root)
  const codeDocs = [
    ["docs/notes/nested-fence.md", nestedFenceDoc()],
    ["docs/notes/indented-code.md", indentedCodeDoc()],
    ["thincoder-core/prompts/code.md", promptCodeDoc()],
  ]
  for (const [rel, text] of codeDocs) {
    mkdirSync(dirname(join(root, rel)), { recursive: true })
    writeFileSync(join(root, rel), text)
  }
  commit(root, "围栏与缩进代码档")
  const probe = runDocCheck(root, { docs: codeDocs.map(([rel]) => join(root, rel)), moment: "close", regions: null })
  assert.equal(probe.hits.filter((h) => h.kind === "paragraph").length, 0, `围栏与缩进代码档应零段命中：${probe.report}`)

  const receipt = await depth0.execute({ action: "close", path: BATCH_REL, completed: [], closeEvidence: "夹具收口证据" }, parentCtx(root, []))
  assert.equal(gateLineOf(receipt), `[doc-check gate] DOC-CHECK GATE: PASS · 范围 ${codeDocs.length + 2} 档`, `代码档与本批两档入判域且全清：${receipt}`)
  assert.match(receipt, /^batch: §1 status line → 「已收口 \d{4}-\d{2}-\d{2}」/, `收口放行且落盘：${receipt}`)
  assert.match(statusLineOf(root), /已收口/, "§1 状态行已写「已收口」")

  // 后半 = 反证，另起一份夹具：普通正文与其后的连续缩进续行必须合成同一段、逐字计入长度
  const root2 = makeProject("r75b")
  gitRepo(root2)
  const continuationHead = "    接续"
  const continuationLong = `\t${"续".repeat(350)}`
  const controlText = ["# 无围栏对照档", "", ...CODE_LINES, continuationHead, continuationLong, ""].join("\n")
  const controlLength = CODE_CHARS + [...continuationHead].length + [...continuationLong].length
  writeFileSync(join(root2, "docs/notes/plain.md"), controlText)
  commit(root2, "普通正文与缩进续行对照档")
  const controlProbe = runDocCheck(root2, { docs: [join(root2, "docs/notes/plain.md")], moment: "close", regions: null })
  const controlHits = controlProbe.hits.filter((h) => h.kind === "paragraph")
  assert.equal(controlHits.length, 1, `对照档应恰 1 条段命中（阈值没动）：${controlProbe.report}`)
  assert.equal(controlHits[0].len, controlLength, `缩进续行不能中途被误认成代码块而漏计：${controlProbe.report}`)

  await assert.rejects(
    () => depth0.execute({ action: "close", path: BATCH_REL, completed: [], closeEvidence: "夹具收口证据" }, parentCtx(root2, [])),
    (e) => {
      assert.match(e.message, /DOC-CHECK GATE: REFUSED/, `拒串携 verdict 首行：${e.message}`)
      assert.match(e.message, /docs\/notes\/plain\.md 第 \d+ 段 \d+ 字，超过 300/, `拒串点名该档与段命中行：${e.message}`)
      return true
    },
  )
  assert.match(statusLineOf(root2), /进行中/, "§1 状态行仍「进行中」")
})

test('CLI 7-6 正常 · 批档 §1 含一条带目录段、不在批档根下的悬空路径 ⇒ 批档整份不判悬空、收口放行；同一句搬进设计档照判', async () => {
  const root = makeProject("r76")
  const sha = gitRepo(root, { sec1: `夹具见 ${OUTSIDE_DANGLING} 的判据。` }) // 批档自身写着一条盘上没有的档名（这是「发现」）、其余档干净、触达账零档
  assertBatchCommitted(root, sha)

  const receipt = await depth0.execute({ action: "close", path: BATCH_REL, completed: [], closeEvidence: "夹具收口证据" }, parentCtx(root, []))
  assert.match(gateLineOf(receipt), /^\[doc-check gate\] DOC-CHECK GATE: PASS/, `批档面不判悬空 ⇒ 收口放行：${receipt}`)
  assert.doesNotMatch(receipt, /这个档不存在/, `批档里那条不存在的档名一个字都不出：${receipt}`)
  assert.match(statusLineOf(root), /已收口/, "收口落盘")

  // 同一句搬进设计档 ⇒ 照判（面别只决定悬空判不判；段长对批档照旧生效见 7-5）
  mkdirSync(join(root, "docs/design"), { recursive: true })
  writeFileSync(join(root, "docs/design/same-sentence.md"), `夹具见 ${OUTSIDE_DANGLING} 的判据。\n`)
  const design = runDocCheck(root, { docs: [join(root, "docs/design/same-sentence.md")], moment: "close", regions: null })
  assert.equal(design.hits.filter((h) => h.kind === "missing" && h.token === OUTSIDE_DANGLING).length, 1, `设计档照判：${design.report}`)
})

test('CLI 7-7 正常 · 笔域集只含批档自身 ⇒ 判域 0 档：回执「PASS · 范围 0 档」，同一份判域清单 checkFiles = 0', async () => {
  const root = makeProject("r77")
  // 无 git 仓 + 触达账零档 ⇒ 笔域集 = 批档自身；收口时点批档面整份不进判域 ⇒ 这一批没有别的档可判。
  // 「范围 0 档」断的是判域真跟着时点缩：批档自身还在笔域集里，却不再算一个被判过的档。
  writeFileSync(join(root, BATCH_REL), record("0".repeat(40)))

  const receipt = await depth0.execute({ action: "close", path: BATCH_REL, completed: [], closeEvidence: "夹具收口证据" }, parentCtx(root, []))
  assert.equal(gateLineOf(receipt), "[doc-check gate] DOC-CHECK GATE: PASS · 范围 0 档", `笔域集只含批档自身 ⇒ 判域 0 档：${receipt}`)
  const engine = runDocCheck(root, { docs: [join(root, BATCH_REL)], moment: "close", regions: null })
  assert.equal(engine.checkFiles.length, 0, `引擎侧同一份判域清单 checkFiles = 0（与「范围 0 档」同数）：${engine.report}`)
  assert.equal(engine.report, "DOC-CHECK GATE: PASS", `零命中且只一行：${engine.report}`)
  assert.match(statusLineOf(root), /已收口/, "收口放行且落盘")
})

test('CLI 7-8 正常 · 子代理 append §2：候选文本含一条带目录段、不在批档根下的悬空路径 ⇒ 批档面不判悬空、照落盘；§2 之外逐字不变', async () => {
  const root = makeProject("r78")
  gitRepo(root)
  const before = readFileSync(join(root, BATCH_REL), "utf8")

  const text = `本段引 ${OUTSIDE_DANGLING} 的判据。`
  const receipt = await asDesigner.execute({ action: "append", segment: "§2", text }, designerCtx(root))
  assert.match(receipt, /appended \d+ characters to §2/, `落盘回执：${receipt}`)
  assert.match(gateLineOf(receipt), /DOC-CHECK GATE: PASS/, `批档面不判悬空 ⇒ 落盘时门放行：${receipt}`)
  assert.doesNotMatch(receipt, /这个档不存在/, `批档里那条不存在的档名一个字都不出：${receipt}`)

  const after = readFileSync(join(root, BATCH_REL), "utf8")
  assert.ok(after.includes(text), "本次文本已落盘")
  assert.equal(after.slice(0, before.indexOf("## §2")), before.slice(0, before.indexOf("## §2")), "§2 段头之前逐字不变")
  assert.equal(after.slice(after.indexOf("## §3")), before.slice(before.indexOf("## §3")), "§3 之后逐字不变")
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
// 带目录段的悬空路径照判指针判据：两条同时点名；只修指针仍拒（段那条独立成立）；拆段后同一条门放行。
test('CLI 7-9 错误 · 笔域集内一档在工具描述面（400 字符段 + 带目录段的悬空路径）⇒ 收口被拒且指针与段两条同时点名', async () => {
  const TOOLDOC_REL = "thincoder-core/tool-docs/probe.md"
  const DANGLING = "thincoder-core/tool-docs/NO-SUCH-DOC.md"
  const LONG = "长".repeat(400)
  const root = makeProject("r79")
  gitRepo(root)
  mkdirSync(join(root, "thincoder-core/tool-docs"), { recursive: true })
  writeFileSync(join(root, TOOLDOC_REL), "# 探针\n\n" + LONG + "\n\n见 `" + DANGLING + "`。\n")
  commit(root, "工具描述面探针档")
  const touched = [join(root, CLEAN_A), join(root, CLEAN_B), join(root, TOOLDOC_REL)]
  const before = readFileSync(join(root, BATCH_REL), "utf8")

  await assert.rejects(
    () => depth0.execute({ action: "close", path: BATCH_REL, completed: [], closeEvidence: "夹具收口证据" }, parentCtx(root, touched)),
    (e) => {
      assert.match(e.message, /DOC-CHECK GATE: REFUSED/, `拒串携 verdict 首行：${e.message}`)
      assert.match(e.message, /thincoder-core\/tool-docs\/probe\.md thincoder-core\/tool-docs\/NO-SUCH-DOC\.md 这个档不存在/, `拒串点名指针与该档：${e.message}`)
      assert.match(e.message, /thincoder-core\/tool-docs\/probe\.md 第 \d+ 段 400 字，超过 300/, `同档 400 字符段必须命中段判据（面豁免已撤）：${e.message}`)
      return true
    },
  )
  assert.equal(readFileSync(join(root, BATCH_REL), "utf8"), before, "拒收口 ⇒ 档全文逐字不变（§1 状态行字节不变）")
  assert.match(statusLineOf(root), /进行中/, "§1 状态行仍「进行中」")

  // 只删指针那一行（指针那条清掉、段落一字未动）⇒ 仍拒、只剩段那条：证明段命中不是被指针命中带出来的。
  writeFileSync(join(root, TOOLDOC_REL), "# 探针\n\n" + LONG + "\n")
  await assert.rejects(
    () => depth0.execute({ action: "close", path: BATCH_REL, completed: [], closeEvidence: "夹具收口证据" }, parentCtx(root, touched)),
    (e) => {
      assert.match(e.message, /DOC-CHECK GATE: REFUSED/, `拒串携 verdict 首行：${e.message}`)
      assert.match(e.message, /thincoder-core\/tool-docs\/probe\.md 第 \d+ 段 400 字，超过 300/, `段判据仍拦：${e.message}`)
      assert.doesNotMatch(e.message, /这个档不存在/, `指针那条应已清：${e.message}`)
      return true
    },
  )

  // 拆段（两段各 200 ≤ 阈值）⇒ 同一条门放行：判据没松，是病治好了。
  writeFileSync(join(root, TOOLDOC_REL), "# 探针\n\n" + "长".repeat(200) + "\n\n" + "长".repeat(200) + "\n")
  const receipt = await depth0.execute({ action: "close", path: BATCH_REL, completed: [], closeEvidence: "夹具收口证据" }, parentCtx(root, touched))
  assert.match(receipt, /^batch: §1 status line → 「已收口 \d{4}-\d{2}-\d{2}」/, `拆段后收口放行且落盘：${receipt}`)
  assert.match(statusLineOf(root), /已收口/, "§1 状态行已写「已收口」")
})

// 7-13：段判据排除完整列表块与表格块；列表符号集同时覆盖中文族（`·` ∥ `•` ∥ 圈号 `①`–`⑳`）。
// 现场是写门那一侧：结构行被并成一段、超 300 ⇒ 写入当场被拒 ⇒ 仓里留不下这种行（「盘上零处」不是「没命中」）。
// 故本例走真收口轨：列表、表格及其续行入笔域集 ⇒ 放行；同内容去标记的 400 字一段 ⇒ 照拒。
const CN_ITEM = "文".repeat(80)
const CIRCLED5 = "①②③④⑤"
/** 五项一项一行的中文列表档（每项 80 字 ⇒ 认不出列表项时它就是 400+ 字的长段）。 */
const cnList = (mark) => "# 中文列表\n\n" + Array.from({ length: 5 }, (_, i) => mark(i)).join("\n") + "\n"

test("CLI 7-13 正常 · 列表块与表格块整体免段长、普通正文对照照拒", async () => {
  const root = makeProject("r713")
  gitRepo(root)
  const bullets = [
    ["docs/notes/cn-dot.md", cnList(() => "· " + CN_ITEM)],
    ["docs/notes/cn-bullet.md", cnList(() => "• " + CN_ITEM)],
    ["docs/notes/cn-circled.md", cnList((i) => `${CIRCLED5[i]} ${CN_ITEM}`)],
    ["docs/notes/list-continuation.md", `# 列表续行\n\n- 列表项\n  ${"续".repeat(350)}\n\n  ${"松".repeat(350)}\n\n普通正文。\n`],
    ["docs/notes/list-fence.md", ["# 列表围栏", "", "- 列表项", "  ```text", "  示例。", "  ```", `  ${"围".repeat(350)}`, ""].join("\n")],
    ["docs/notes/bare-table.md", ["项目 | 内容", "--- | ---", `长内容 | ${"表".repeat(350)}`, "", "项目 \\| 说明 | 内容", "--- | ---", `转义 | ${"转".repeat(350)}`, "", "`项目 | 说明` | 内容", "--- | ---", `码段 | ${"码".repeat(350)}`, ""].join("\n")],
    ["docs/notes/pipe-table.md", `| 项目 | 内容 |\n| --- | --- |\n| 长内容 | ${"表".repeat(350)} |\n`],
    ["thincoder-core/prompts/list.md", [`- ${"提".repeat(350)}`, "  ```text", "  示例。", "  ```", `  ${"示".repeat(350)}`, ""].join("\n")],
  ]
  for (const [rel, text] of bullets) {
    mkdirSync(dirname(join(root, rel)), { recursive: true })
    writeFileSync(join(root, rel), text)
  }
  commit(root, "列表块与表格块")

  // 前置：各结构档的行字面确实超阈；认不出完整块就会被并成长段，否则本例空转、什么都证不了
  for (const [rel, text] of bullets) {
    const merged = text.split("\n").filter((l) => l.trim() !== "" && !l.startsWith("#")).reduce((n, l) => n + [...l].length, 0)
    assert.ok(merged > 300, `前置：${rel} 的列表行字面合计 ${merged} > 300——认不出符号就是长段`)
  }
  const probe = runDocCheck(root, { docs: bullets.map(([rel]) => join(root, rel)), moment: "close", regions: null })
  assert.equal(probe.hits.filter((h) => h.kind === "paragraph").length, 0, `列表块与表格块应零段命中：${probe.report}`)

  const receipt = await depth0.execute({ action: "close", path: BATCH_REL, completed: [], closeEvidence: "夹具收口证据" }, parentCtx(root, []))
  assert.equal(gateLineOf(receipt), `[doc-check gate] DOC-CHECK GATE: PASS · 范围 ${bullets.length + 2} 档`, `结构档 + 本批两档入判域且全清：${receipt}`)
  assert.match(receipt, /^batch: §1 status line → 「已收口 \d{4}-\d{2}-\d{2}」/, `收口放行且落盘：${receipt}`)
  assert.match(statusLineOf(root), /已收口/, "§1 状态行已写「已收口」")

  // 后半 = 反证，另起一份夹具（前一本批档已冻结）：同内容去标记 ⇒ 400 字一段，段判据照拦
  const root2 = makeProject("r713b")
  gitRepo(root2)
  const controlRel = "docs/notes/cn-plain.md"
  const controlText = `${cnList(() => CN_ITEM)}\n  ${"正".repeat(350)}\n`
  writeFileSync(join(root2, controlRel), controlText)
  commit(root2, "去标记与缩进正文对照档")
  const controlProbe = runDocCheck(root2, { docs: [join(root2, controlRel)], moment: "close", regions: null })
  assert.equal(controlProbe.hits.filter((h) => h.kind === "paragraph").length, 2, `去标记与无前列表的缩进正文各应有一条段命中：${controlProbe.report}`)

  await assert.rejects(
    () => depth0.execute({ action: "close", path: BATCH_REL, completed: [], closeEvidence: "夹具收口证据" }, parentCtx(root2, [])),
    (e) => {
      assert.match(e.message, /DOC-CHECK GATE: REFUSED/, `拒串携 verdict 首行：${e.message}`)
      assert.match(e.message, /docs\/notes\/cn-plain\.md 第 \d+ 段 \d+ 字，超过 300/, `拒串点名该档与段命中行：${e.message}`)
      return true
    },
  )
  assert.match(statusLineOf(root2), /进行中/, "§1 状态行仍「进行中」")
})

// 7-19：§2 那一列**缺读数** ⇒ 收口拒（判据 = `docs/core/design/DOC-CHECK.md` §8 的读数支）。
// 前半 = 机读清单那一行没有第三列（旧两格形）；后半 = 补上批起快照上的读数 ⇒ 同跑放行。
test('CLI 7-19 错误 · 码档在改动面、§2 那行没有读数 ⇒ 收口被拒（首句 tier-reading gate、点名该档）；补上快照读数后同跑放行', async () => {
  const root = makeProject("r719")
  const sha = gitRepo(root, { reading: null }) // 那一行只有两格——本批起的形是三格，缺列即缺读数
  assertBatchCommitted(root, sha)
  const touched = [join(root, PROBE_REL)] // 码档进改动面（触达账；提交 diff 腿只带 `.md`）
  const before = readFileSync(join(root, BATCH_REL), "utf8")

  await assert.rejects(
    () => depth0.execute({ action: "close", path: BATCH_REL, completed: [], closeEvidence: "夹具收口证据" }, parentCtx(root, touched)),
    (e) => {
      assert.match(e.message, /tier-reading gate/, `拒串点名本门：${e.message}`)
      assert.ok(e.message.includes(PROBE_REL), `拒串点名该档：${e.message}`)
      assert.match(e.message, /该列没有数/, `拒串说清缺的是读数：${e.message}`)
      assert.match(e.message, /Nothing was written\./, `拒串收尾句：${e.message}`)
      return true
    },
  )
  assert.equal(readFileSync(join(root, BATCH_REL), "utf8"), before, "拒收口 ⇒ 档全文逐字不变（§1 状态行字节不变）")
  assert.match(statusLineOf(root), /进行中/, "§1 状态行仍「进行中」")

  // 补上**批起快照上**的读数（量法 = `countContentLines`，取数 = `git show <批起 sha>:<档>`）⇒ 同跑放行
  const reading = snapshotReadingOf(root, sha, PROBE_REL)
  writeFileSync(join(root, BATCH_REL), record(sha, { reading: String(reading) }))
  const receipt = await depth0.execute({ action: "close", path: BATCH_REL, completed: [], closeEvidence: "夹具收口证据" }, parentCtx(root, touched))
  assert.match(receipt, /^batch: §1 status line → 「已收口 \d{4}-\d{2}-\d{2}」/, `补上读数后收口放行且落盘：${receipt}`)
  assert.match(statusLineOf(root), /已收口/, "§1 状态行已写「已收口」")
})

// 7-20：读数**写错了**（与快照不等）⇒ 拒文写出「写的是几、基线是几」。
// 缺读数与抄错数是两件事：只核「有没有数」，写个 1 也过。
test('CLI 7-20 错误 · 那格写一个与快照读数不等的数 ⇒ 收口被拒且拒文写出「写的是几、基线是几」；改成快照读数后放行', async () => {
  const root = makeProject("r720")
  const sha = gitRepo(root)
  assertBatchCommitted(root, sha)
  const touched = [join(root, PROBE_REL)]
  const real = snapshotReadingOf(root, sha, PROBE_REL)
  assert.notEqual(real, 99, `夹具前提：99 不是该档的快照读数（实读 ${real}）`)
  writeFileSync(join(root, BATCH_REL), record(sha, { reading: "99" })) // 编出来的数
  const before = readFileSync(join(root, BATCH_REL), "utf8")

  await assert.rejects(
    () => depth0.execute({ action: "close", path: BATCH_REL, completed: [], closeEvidence: "夹具收口证据" }, parentCtx(root, touched)),
    (e) => {
      assert.match(e.message, /tier-reading gate/, `拒串点名本门：${e.message}`)
      assert.ok(e.message.includes(PROBE_REL), `拒串点名该档：${e.message}`)
      assert.ok(e.message.includes(`写的是 99，基线是 ${real}`), `拒串写出「写的是几、基线是几」：${e.message}`)
      return true
    },
  )
  assert.equal(readFileSync(join(root, BATCH_REL), "utf8"), before, "拒收口 ⇒ 档全文逐字不变（§1 状态行字节不变）")
  assert.match(statusLineOf(root), /进行中/, "§1 状态行仍「进行中」")

  writeFileSync(join(root, BATCH_REL), record(sha, { reading: String(real) }))
  const receipt = await depth0.execute({ action: "close", path: BATCH_REL, completed: [], closeEvidence: "夹具收口证据" }, parentCtx(root, touched))
  assert.match(receipt, /^batch: §1 status line → 「已收口 \d{4}-\d{2}-\d{2}」/, `改成快照读数后收口放行且落盘：${receipt}`)
  assert.match(statusLineOf(root), /已收口/, "§1 状态行已写「已收口」")
})

// 7-21：写时点零改——同一份批档上写 350 字正文段 ⇒ 拒（段判据）；写一条悬空档名 ⇒ 放行。
// 两半都成立才算过：只有「拒」那半，说不出「悬空照旧免」；只有「放行」那半，说不出「段长照旧判」。
const LONG_PARAGRAPH = "长".repeat(350)
test('CLI 7-21 边界 · 同一份批档上写 350 字正文段 ⇒ 拒写；写一条悬空档名 ⇒ 放行（写时点判面零改）', async () => {
  const root = makeProject("r721")
  gitRepo(root)

  await assert.rejects(
    () => asDesigner.execute({ action: "append", segment: "§2", text: LONG_PARAGRAPH }, designerCtx(root)),
    (e) => {
      assert.match(e.message, /第 \d+ 段 350 字，超过 300/, `段判据对批档写时点照旧生效：${e.message}`)
      assert.match(e.message, /Nothing was written/, `拒 = 零字节落盘：${e.message}`)
      return true
    },
  )

  const text = `本段引 ${OUTSIDE_DANGLING} 的判据。`
  const receipt = await asDesigner.execute({ action: "append", segment: "§2", text }, designerCtx(root))
  assert.match(receipt, /appended \d+ characters to §2/, `悬空写法照落盘：${receipt}`)
  assert.match(gateLineOf(receipt), /DOC-CHECK GATE: PASS/, `写时点门放行：${receipt}`)
  assert.doesNotMatch(receipt, /这个档不存在/, `批档面不判悬空：${receipt}`)
})

// 7-22：`doc_check` 工具面的**两个 mode 不同判**——同一份档，`report` 判整份（旧悬空照拒），
// `gate` 只判本批变更区（同一条悬空在区外 ⇒ `PASS`、一行不出）；批档面两个 mode 都不进判域。
// 夹具三样：350 字正文段 ∥ 一条行号锚（锚在一份真在盘的档上）∥ 一条悬空档名；三者全在变更区外。
const ANCHOR_LINE = "见 docs/batches/fixture.md:12 的判据。"
const SAFE_LINE = "本批只改这一行。"
const THREE_HITS = [LONG_PARAGRAPH, "", ANCHOR_LINE, "", `夹具见 ${OUTSIDE_DANGLING} 的判据。`, "", SAFE_LINE].join("\n")
const SAME_SHAPE_REL = "docs/design/same-shape.md"
test('CLI 7-22 正常 · 同一份设计档：report 判整份 ⇒ REFUSED 三样照报；gate 只判变更区 ⇒ PASS 一行不出；批档面两 mode 都不进判域', async () => {
  const root = makeProject("r722")
  gitRepo(root, { sec1: THREE_HITS, pre: [[SAME_SHAPE_REL, THREE_HITS]] }) // 批档 §1 与设计档三样俱全
  // 本批只改末尾那一行 ⇒ 变更区 = 那一行，三样全在区外（区外一条都不出）
  writeFileSync(join(root, SAME_SHAPE_REL), THREE_HITS.replace(SAFE_LINE, "本批改过这一行。"))
  commit(root, "本批只改末尾一行")
  const ctx = { depth: 0, agent: { cwd: root, _touchedFiles: [], _batchDoc: join(root, BATCH_REL) }, cwd: root }

  // 甲：批档不在判域 ⇒ 回执只有 PASS 一行（不是「判过且干净」）；两个 mode 同此一判
  for (const mode of ["report", "gate"]) {
    const batchView = docCheckTool.execute({ target: root, mode, docs: [BATCH_REL] }, ctx)
    assert.equal(batchView, "DOC-CHECK GATE: PASS", `${mode} 指名批档 ⇒ 回执只一行 PASS：${batchView}`)
  }
  const engine = runDocCheck(root, { docs: [join(root, BATCH_REL)], moment: "close", regions: null })
  assert.equal(engine.checkFiles.length, 0, `checkFiles 不数批档：${engine.report}`)

  // 乙：`report` = 诊断面 ⇒ 整份判，三样照报（面别不扩散到设计 ∥ 需求 ∥ 标准档）
  const designView = docCheckTool.execute({ target: root, mode: "report", docs: [SAME_SHAPE_REL] }, ctx)
  assert.match(designView, /^DOC-CHECK GATE: REFUSED/, `同形设计档照拒：${designView}`)
  assert.match(designView, /第 \d+ 段 350 字，超过 300/, `设计档段长照判：${designView}`)
  assert.match(designView, /用行号做锚/, `设计档行号锚照判：${designView}`)
  assert.match(designView, /这个档不存在/, `设计档悬空照判：${designView}`)

  // 丙：`gate` = 交付判定 ⇒ 只判本批变更区；三样都在区外 ⇒ PASS、零附加行（两 mode 不同源的读数面）
  const gateView = docCheckTool.execute({ target: root, mode: "gate", docs: [SAME_SHAPE_REL] }, ctx)
  assert.equal(gateView, "DOC-CHECK GATE: PASS", `区外三样一条都不出：${gateView}`)
})

// 7-24：AC-10 的两半一次夹具跑完——本批改到指针那一行 ⇒ 区外那条 400 字段照旧不出、指针那条 `REFUSED`；
// 把指针那一行还原（回到区外）⇒ 同一笔放行、回执零附加行。
const OUT_PARA = "长".repeat(400)
const REGION_DOC = "docs/design/region-target.md"
const POINTER_LINE = `见 ${OUTSIDE_DANGLING} 的判据。`
const REGION_TAIL = "末尾这一行会改。"
const regionDoc = () => ["# 目标设计档", "", POINTER_LINE, "", OUT_PARA, "", REGION_TAIL].join("\n")
test('CLI 7-24 边界 · 区外悬空放行 ∥ 挪进区内 REFUSED（区外那条 400 字段始终不出行）', async () => {
  const root = makeProject("r724")
  gitRepo(root, { pre: [[REGION_DOC, regionDoc()]] })
  const abs = join(root, REGION_DOC)
  const touched = [abs]
  const close = () => depth0.execute({ action: "close", path: BATCH_REL, completed: [], closeEvidence: "夹具收口证据" }, parentCtx(root, touched))

  // 前半：本批改到指针那一行（区内）⇒ REFUSED 并点名该处；400 字段仍在区外 ⇒ 一条都不出
  writeFileSync(abs, regionDoc().replace(REGION_TAIL, "末尾这一行改过了。").replace(POINTER_LINE, `${POINTER_LINE}（本批补一句）`))
  commit(root, "本批改到指针那一行")
  await assert.rejects(
    close,
    (e) => {
      assert.match(e.message, /DOC-CHECK GATE: REFUSED/, `区内悬空照拒：${e.message}`)
      assert.match(e.message, /docs\/design\/region-target\.md thincoder-core\/tool-docs\/NO-SUCH-DOC\.md 这个档不存在/, `点名指针与该档：${e.message}`)
      assert.doesNotMatch(e.message, /400 字，超过 300/, `区外那条 400 字段一个字都不出：${e.message}`)
      return true
    },
  )
  assert.match(statusLineOf(root), /进行中/, "拒收口 ⇒ §1 状态行不变")

  // 后半：把指针那一行还原（回到区外），只留末尾那一行的修改 ⇒ 同一笔放行、回执零附加行
  writeFileSync(abs, regionDoc().replace(REGION_TAIL, "末尾这一行改过了。"))
  commit(root, "指针挪出变更区")
  const receipt = await close()
  assert.equal(gateLineOf(receipt), "[doc-check gate] DOC-CHECK GATE: PASS · 范围 3 档", `两干净档 + 本档 = 3 档，且一条附加行都没有：${receipt}`)
  assert.doesNotMatch(receipt, /这个档不存在/, `区外悬空不出行：${receipt}`)
  assert.doesNotMatch(receipt, /400 字/, `区外超长段不出行：${receipt}`)
  assert.match(statusLineOf(root), /已收口/, "收口放行且落盘")
})

// 7-25：AC-11 的两半——区外一段 400 字 ⇒ 放行；区内某段含变更行、整段超 300 字 ⇒ `REFUSED`。
// 段长按段量：段内任一行在区内 ⇒ 整段算字数（哪怕超长的是段里别的行）。
const SEG_LINES = ["甲".repeat(150), "乙".repeat(150), "丙".repeat(150)]
const SEG_TAIL = "末尾这一行会改。"
const segDoc = () => ["# 目标设计档", "", OUT_PARA, "", ...SEG_LINES, "", SEG_TAIL].join("\n")
const SEG_LEN = SEG_LINES.reduce((n, l) => n + [...l].length, 0)
test('CLI 7-25 边界 · 区外 400 字放行 ∥ 区内含变更行、整段超 300 拒', async () => {
  assert.ok(SEG_LEN > 300, `夹具前提：那一段合计 ${SEG_LEN} 字 > 300`)
  const root = makeProject("r725")
  gitRepo(root, { pre: [[REGION_DOC, segDoc()]] })
  const abs = join(root, REGION_DOC)
  const touched = [abs]
  const close = () => depth0.execute({ action: "close", path: BATCH_REL, completed: [], closeEvidence: "夹具收口证据" }, parentCtx(root, touched))

  // 前半：只改那一段的第 2 行（区外那条 400 字段仍在区外）⇒ 整段 450 字 ⇒ REFUSED
  const changedSeg = [SEG_LINES[0], `${"乙".repeat(149)}改`, SEG_LINES[2]]
  writeFileSync(abs, ["# 目标设计档", "", OUT_PARA, "", ...changedSeg, "", SEG_TAIL].join("\n"))
  commit(root, "本批改到段里那一行")
  await assert.rejects(
    close,
    (e) => {
      assert.match(e.message, /DOC-CHECK GATE: REFUSED/, `区内段超阈照拒：${e.message}`)
      assert.match(e.message, new RegExp(`第 5 段 ${SEG_LEN} 字，超过 300`), `整段按段量（非只量变更行）：${e.message}`)
      assert.doesNotMatch(e.message, /400 字，超过 300/, `区外那条 400 字段一个字都不出：${e.message}`)
      return true
    },
  )

  // 后半：把那一行还原，只留末尾那一行的修改 ⇒ 区外 400 字放行、零附加行
  writeFileSync(abs, segDoc().replace(SEG_TAIL, "末尾这一行改过了。"))
  commit(root, "段那一行挪出变更区")
  const receipt = await close()
  assert.equal(gateLineOf(receipt), "[doc-check gate] DOC-CHECK GATE: PASS · 范围 3 档", `区外 400 字放行且零附加行：${receipt}`)
  assert.doesNotMatch(receipt, /400 字/, `区外超长段不出行：${receipt}`)
  assert.match(statusLineOf(root), /已收口/, "收口放行且落盘")
})

// 7-26：排除面（判据 = `docs/core/design/DOC-CHECK.md` §10）——项目在 manifest 的 `index.docCheckExcludePaths`
// 里声明的路径前缀之下，档不进判域：三件一件不判、不出行、不计入 `范围 N 档`。三半都成立才算过：
// 甲 撤掉声明 ⇒ 同一份夹具照判（AC-12 中半）∥ 乙 声明在 ⇒ 放行且范围数不到它（AC-12 前半）
// ∥ 丙 同级目录 `docs/tmp-x` 不在排除面上 ⇒ 那里的档照报（AC-12 后半）。
const EXCLUDED_DIR = "docs/tmp"
const EXCLUDED_REL = `${EXCLUDED_DIR}/probe.md`
const SIBLING_REL = "docs/tmp-x/probe.md"
/** 三样俱全的探针档：一段 400 字正文 ∥ 一条行号锚（锚在一份真在盘的档上）∥ 一条带目录段的悬空档名。 */
const EXCLUDED_BODY = ["# 排除面前的探针档", "", "长".repeat(400), "", ANCHOR_LINE, "", `夹具见 ${OUTSIDE_DANGLING} 的判据。`, ""].join("\n")
/** 夹具 manifest（`declare` ⇒ 声明 `docs/tmp` 为排除前缀；甲 ∥ 乙 只差这一条）。 */
const writeManifest = (root, declare) => writeFileSync(join(root, "PROJECT-MANIFEST.json"), JSON.stringify(
  { version: 1, phase: "initial-dev", ...(declare ? { index: { docCheckExcludePaths: [EXCLUDED_DIR] } } : {}) }, null, 2))
/** 把探针档写到 `rel`（目录不存在就建）。 */
const putProbe = (root, rel) => {
  mkdirSync(join(root, rel.split("/").slice(0, -1).join("/")), { recursive: true })
  writeFileSync(join(root, rel), EXCLUDED_BODY)
}
test('CLI 7-26 正常 · 声明前缀下的档不进判域 ∥ 撤声明照判 ∥ 同级目录 tmp-x 照报', async () => {
  // 甲 ∥ 乙 = 同一份夹具只差一条声明：先按「不声明」跑一次 ⇒ 三样照出、收口被拒；
  // 再把声明写进 manifest（别的字节不动）⇒ 同跑放行。表述面与判域面的差因此只有一个因：那条声明。
  const root = makeProject("r726")
  writeManifest(root, false)
  gitRepo(root) // 批起快照在探针档入树之前取 ⇒ 它是「本批新增」，提交 diff 腿因此含它（不是靠触达账凑进去）
  putProbe(root, EXCLUDED_REL)
  commit(root, "排除面前的探针档")

  await assert.rejects(
    () => depth0.execute({ action: "close", path: BATCH_REL, completed: [], closeEvidence: "夹具收口证据" }, parentCtx(root, [])),
    (e) => {
      assert.match(e.message, /DOC-CHECK GATE: REFUSED/, `不声明 ⇒ 档照判：${e.message}`)
      assert.match(e.message, /docs\/tmp\/probe\.md 第 \d+ 段 400 字，超过 300/, `段判据照出：${e.message}`)
      assert.match(e.message, /docs\/tmp\/probe\.md 第 \d+ 行的 docs\/batches\/fixture\.md:12 用行号做锚/, `行号锚照出：${e.message}`)
      assert.match(e.message, /docs\/tmp\/probe\.md thincoder-core\/tool-docs\/NO-SUCH-DOC\.md 这个档不存在/, `悬空照出：${e.message}`)
      return true
    },
  )
  assert.match(statusLineOf(root), /进行中/, "拒收口 ⇒ §1 状态行仍「进行中」")

  writeManifest(root, true)
  const receipt = await depth0.execute({ action: "close", path: BATCH_REL, completed: [], closeEvidence: "夹具收口证据" }, parentCtx(root, []))
  assert.equal(gateLineOf(receipt), "[doc-check gate] DOC-CHECK GATE: PASS · 范围 2 档", `前缀下的档不进判域、也不计入范围（本批两档 + 它 = 3 档，判域 2 档）：${receipt}`)
  assert.doesNotMatch(receipt, /docs\/tmp\/probe\.md/, `被排除的档连档名都不出现：${receipt}`)
  assert.match(statusLineOf(root), /已收口/, "声明在 ⇒ 收口放行且落盘")

  // 丙 = 前缀边界：另起一份夹具（前一本批档已收口、冻结），声明仍是 `docs/tmp`——
  // 前缀下那一份与被排除面一模一样，但带病的结论只该落在同级 `docs/tmp-x` 那一份上。
  const root2 = makeProject("r726b")
  writeManifest(root2, true)
  gitRepo(root2)
  putProbe(root2, EXCLUDED_REL)
  putProbe(root2, SIBLING_REL)
  commit(root2, "前缀边界两档")

  await assert.rejects(
    () => depth0.execute({ action: "close", path: BATCH_REL, completed: [], closeEvidence: "夹具收口证据" }, parentCtx(root2, [])),
    (e) => {
      assert.match(e.message, /docs\/tmp-x\/probe\.md 第 \d+ 段 400 字，超过 300/, `同级目录不在排除面 ⇒ 照报：${e.message}`)
      assert.doesNotMatch(e.message, /docs\/tmp\/probe\.md/, `前缀下那一份仍不出行（两侧同跑才证「前缀」不是「包含」）：${e.message}`)
      return true
    },
  )
  assert.match(statusLineOf(root2), /进行中/, "§1 状态行仍「进行中」")
})

// 7-33：越线方案支的触发物 = **收口线**（基准 = 收口时盘上的内容行数）——设计时线不再由本支判
// （判据 = `docs/core/design/DOC-CHECK.md` §8.5；两条线各归各时点 = `docs/core/standards/CODE-TIER.md` §2.1 ∥ §2.2）。
// 同批两个码档：`big` 收口时越过收口线而第二列 `—` ⇒ 拒；`mid` 只越设计时线（510，未过 800）⇒ 这一半对它不启动。
const BIG_REL = "src/big.mjs"
const MID_REL = "src/mid.mjs"
const BIG_START = 359
const MID_START = 490
const BIG_CLOSE = 860
const MID_CLOSE = 510
/** 恰好 `n` 行内容（末行换行 → `countContentLines` 数到 `n`）。 */
const linesOf = (n, tag) => Array.from({ length: n }, (_, i) => `// ${tag} ${i + 1}`).join("\n") + "\n"
/** §2 机读清单逐档给方案格与快照读数（夹具的 `record` 只写一条 `src/probe.mjs` 行；本例要两个码档各自一行）。 */
const recordWithRows = (sha, rows) => {
  const base = record(sha)
  const probeRow = `| \`${PROBE_REL}\` | — | 1 |`
  assert.ok(base.includes(probeRow), `夹具前提：record 的清单行须是 ${probeRow}`)
  return base.replace(probeRow, rows.map(([p, plan, reading]) => `| \`${p}\` | ${plan} | ${reading} |`).join("\n"))
}
test('CLI 7-33 错误 · 越过收口线而 §2 第二列无方案 ⇒ 拒（点名该档与 800）；补上正向形方案后放行；只越设计时线的 510 行档照放行', async () => {
  const root = makeProject("r733")
  writeFileSync(join(root, BIG_REL), linesOf(BIG_START, "big"))
  writeFileSync(join(root, MID_REL), linesOf(MID_START, "mid"))
  git(root, "init", "-q")
  commit(root, "base")
  const sha = snapshot(root)
  // 收口时点的盘上长度：big 越过收口线（860 > 800）∥ mid 只越过设计时线（510 > 500，未过 800）
  writeFileSync(join(root, BIG_REL), linesOf(BIG_CLOSE, "big"))
  writeFileSync(join(root, MID_REL), linesOf(MID_CLOSE, "mid"))
  // 第三列 = 批起快照上的读数（359 ∥ 490）：读数那一半因此全绿，拒因只可能来自越线那一半
  const withPlan = (bigPlan) => recordWithRows(sha, [[BIG_REL, bigPlan, BIG_START], [MID_REL, "—", MID_START]])
  writeFileSync(join(root, BATCH_REL), withPlan("—"))
  commit(root, "本批两个码档")
  const close = () => depth0.execute({ action: "close", path: BATCH_REL, completed: [], closeEvidence: "夹具收口证据" }, parentCtx(root, []))
  const before = readFileSync(join(root, BATCH_REL), "utf8")

  await assert.rejects(
    close,
    (e) => {
      assert.match(e.message, /越了收口线却没有分拆方案/, `拒文说的是它真判的那条线：${e.message}`)
      assert.match(e.message, /crosses the closeout line \(> 800\)/, `拒文携收口线数值：${e.message}`)
      assert.ok(e.message.includes(`${BIG_REL} — ${BIG_CLOSE} > 800`), `逐档行点名该档与两个数：${e.message}`)
      assert.match(e.message, /方案为空/, `拒因落在第二列没有可用方案：${e.message}`)
      assert.match(e.message, /为每个越线档补一行/, `拒文说要写什么：${e.message}`)
      assert.ok(!e.message.includes(MID_REL), `只越设计时线的档不进这条拒文：${e.message}`)
      assert.doesNotMatch(e.message, /> 500/, `设计时线不在本支拒文里：${e.message}`)
      return true
    },
  )
  assert.equal(readFileSync(join(root, BATCH_REL), "utf8"), before, "拒收口 ⇒ 档全文逐字不变（§1 状态行字节不变）")
  assert.match(statusLineOf(root), /进行中/, "§1 状态行仍「进行中」")

  // 补上正向形方案（点名目标档，带目录段 + 本批落步 `§5`）⇒ 同跑放行：越线档不再是缺件
  writeFileSync(join(root, BATCH_REL), withPlan("把夹具段拆到 `thincoder-core/agent-tools/big-part.mjs`，本批 `§5` 落成"))
  const receipt = await close()
  assert.match(receipt, /^batch: §1 status line → 「已收口 \d{4}-\d{2}-\d{2}」/, `补上方案后收口放行且落盘：${receipt}`)
  assert.doesNotMatch(receipt, /越了收口线/, `放行零回执（本门不出回执段）：${receipt}`)
  assert.match(statusLineOf(root), /已收口/, "§1 状态行已写「已收口」")
})



